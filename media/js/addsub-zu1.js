/**
 * Author: Rafał Skinderowicz
 */

function addsub_ZU1(display_wrapper, fracA, fracB, operation) {
    $(display_wrapper).html(''); /* Clear */
    $(display_wrapper).append('<div class="display_wrapper"/>');
    var intro_wrapper = $(display_wrapper).find('div').last();

    var board = new Board();
    BoardsManager().addBoard(board);

    var rep = alignBinaryRep_ZM(fracA.toBinaryZM(), fracB.toBinaryZM());
    var line = 0;
    board.set(0, line++, 'Konwertujemy A i B do kodu znak moduł:', 'aleft small');
    board.set(0, line++, 'A = (' + fracA.toBinaryZM() + '),,ZM,,', 'aleft');
    board.set(0, line++, 'B = (' + fracB.toBinaryZM() + '),,ZM,,', 'aleft');
    board.commit();
    ++line;
    board.set(0, line++, 'A i B zapisujemy z tą samą liczbą bitów i rozszerzamy z lewej strony o dodatkowy bit:', 'small');
    var A = rep[0];
    var B = rep[1];
    board.set(0, line++, 'A = (' + A + '),,ZM,,', 'aleft');
    board.set(0, line++, 'B = (' + B + '),,ZM,,', 'aleft');
    board.commit();
    ++line;

    board.set(0, line++, 'Konwertujemy A i B do kodu ZU1', 'small aleft');
    A = convertFromZMtoZU1( A.split('') ).join( '' );
    B = convertFromZMtoZU1( B.split('') ).join( '' );

    board.set(0, line++, 'A = (' + A + '),,ZU1,,', 'aleft');
    board.set(0, line++, 'B = (' + B + '),,ZU1,,', 'aleft');
    board.commit();
    ++line;

    board.set(0, line++, 'Wykonujemy zadaną operację, czyli "' + operation + '"', 'small aleft');
    board.commit();
    board.initDisplay( intro_wrapper );

    $(display_wrapper).append('<div class="display_wrapper"/>');
    var calc_wrapper = $(display_wrapper).find('div').last();

    if (operation == '-') {
        subtract_ZU1(calc_wrapper, A, B);
    } else {
        add_ZU1(calc_wrapper, A, B);
    }
}

function subtract_ZU1(display_wrapper, A, B) {
    /*
    var A = '0.00101,101';
    var B = '1.01011,110';
    */
    var board = new Board();
    BoardsManager().addBoard(board);

    board.setSequence(0, 0, A);
    board.setSequence(0, 1, B, 'underline');
    board.set(-1, 1, '-', 'underline');
    board.commit(); 

    var len = A.length;
    var bitsA = A.split('');
    var bitsB = B.split('');
    var borrowLine = 0;
    var borrowFrom = 0;
    var w = 0;

    var borrow = function (bits, pos) {
        --borrowLine;
        bits[pos] = '2';
        var borrow_pos = pos;
        board.set(pos, borrowLine, '10', 'small');
        var found = false;
        while (--pos >= 0) {
            if (bits[pos] === '1') {
                bits[pos] = '0';
                board.set(pos, borrowLine, '0', 'small');
                found = true;
                borrowFrom = pos;
                break ;
            } else if (bits[pos] === '0') {
                bits[pos] = '1';
                board.set(pos, borrowLine, '1', 'small');
            }
        }
        if (!found) {
            board.set(len, borrowLine, 'w=1');
            board.set(len + 1, borrowLine, '(pożyczka zza bitu znakowego)', 'small');
            borrowFrom = 0;
            w = 1;
        }
    }


    var result = A.split('');
    for (var i = len-1; i >= 0; --i) {
        if (isZeroOrOne(A[i])) {
            var bitA = parseInt(bitsA[i]);
            var bitB = parseInt(bitsB[i]);

            if (bitA < bitB) {
                borrow(bitsA, i);
            }
            bitA = parseInt(bitsA[i]);
            /* 2 lines below are not necessary, but provide flash effect */
            board.highlight(i, (i >= borrowFrom) ? borrowLine : 0);
            board.highlight(i, 1);

            board.set(i, 2, bitA - bitB);
            result[i] = ((bitA - bitB) == 0) ? '0' : '1';
        } else {
            board.set(i, 2, A[i]);
        }
        if (i-1 === 1) {
            board.set(i - 1, 2, '.');
        }
        board.commit();
    }
    var line = 2;

    if (w === 1) {
        ++line;
        board.set(-1, line, '-');
        board.setSequence(0, line, repeatStr(' ', len-1), 'underline');
        board.set(len-1, line, '1', 'underline');
        board.set(len+1, line, 'Odejmujemy poprawkę, ponieważ wystąpiła pożyczka (w=1)', 'small aleft');
        board.commit();
        ++line;

        result = decrementBinaryZM(result);

        board.setSequence(0, line, result);
        board.set(len, line, ',,ZU1,,', 'small');
        board.commit();
    } else {     
        board.set(len, line, ',,ZU1,,', 'small');
    }
    ++line;
    board.set(len + 1, line, 'Wynik Konwertujemy do ZM', 'small aleft');
    board.commit();

    result = convertFromZMtoZU1(result);
    board.setSequence(0, line, result);
    board.set(len, line, ',,ZM,,', 'small');
    board.commit();

    ++line;
    board.set(len+1, line, 'Wynik: ' + fromBinaryZM( result.join('') ), 'aleft');
    board.commit();

    board.initDisplay( display_wrapper );
}


function add_ZU1(display_wrapper, A, B) {
    var board = new Board();
    BoardsManager().addBoard(board);

    board.setSequence(0, 0, A);
    board.setSequence(0, 1, B, 'underline');
    board.set(-1, 1, '+', 'underline');
    board.commit(); 

    var len = A.length;
    var bitsA = A.split('');
    var bitsB = B.split('');

    var result = A.split('');
    var overflow = 0;
    for (var i = len-1; i >= 0; --i) {
        if (isZeroOrOne(A[i])) {
            var bitA = parseInt(bitsA[i]);
            var bitB = parseInt(bitsB[i]);

            var res = bitA + bitB + overflow;
            overflow = (res > 1) ? 1 : 0;

            board.highlight(i, -1);
            board.highlight(i, 0);
            board.highlight(i, 1);

            board.set(i, 2, res % 2);
            result[i] = ((res % 2) == 0) ? '0' : '1';

            if (overflow == 1) {
                var overflow_pos = i-1;
                if (i > 0 && !isZeroOrOne(bitsA[i-1])) {
                    --overflow_pos;
                }
                board.set(overflow_pos, -1, '1', 'small');
                if (overflow_pos == -1) {
                    board.set(len+1, -1, 'Uwaga, wystąpiło przepełnienie na bicie znakowym (o=1)', 'small aleft');
                }
            }
        } else {
            board.set(i, 2, A[i]);
        }
        board.commit();
    }

    var line = 2;
    if (overflow == 1) {
        ++line;
        board.set(-1, line, '+');
        board.setSequence(0, line, repeatStr(' ', len-1), 'underline');
        board.set(len-1, line, '1', 'underline');
        board.set(len+1, line, 'Dodajemy poprawkę, ponieważ wystąpiło przepełnienie na bicie znakowym', 'small aleft');
        board.commit();
        ++line;

        result = incrementBinaryZM(result);
        board.setSequence(0, line, result);
        board.set(len, line, ',,ZU1,,', 'small');
        board.commit();
    } else {
        board.set(len, 2, ',,ZU1,,', 'small');
    }

    ++line;
    board.set(len + 1, line, 'Wynik Konwertujemy do ZM', 'small aleft');
    board.commit();

    result = convertFromZMtoZU1(result);
    board.setSequence(0, line, result);
    board.set(len, line, ',,ZM,,', 'small');
    board.commit();

    ++line;
    board.set(len+1, line, 'Wynik: ' + fromBinaryZM( result.join('') ), 'aleft');
    board.commit();

    board.initDisplay( display_wrapper );
}
