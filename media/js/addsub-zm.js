/**
 * Author: Rafał Skinderowicz
 */

function addsub_ZM(display_wrapper, fracA, fracB, operation) {
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
    board.set(0, line++, 'A i B zapisujemy z tą samą liczbą bitów i rozszerzamy z lewej strony o dodatkowy bit', 'small');
    var A = rep[0];
    var B = rep[1];
    board.set(0, line++, 'A = (' + A + '),,ZM,,', 'aleft');
    board.set(0, line++, 'B = (' + B + '),,ZM,,', 'aleft');
    board.commit();
    ++line;

    if (fracA.getSign() != fracB.getSign()) {
        /* Different A and B signs so invert the operation */
        var new_op = (operation == '+') ? '-' : '+';
        board.set(0, line++, 'Liczby mają różne bity znakowe, dlatego wykonujemy operację "' + new_op + '" zamiast "' + operation + '".', 'small aleft');
        operation = new_op;
    } else {
        board.set(0, line++, 'Liczby mają takie same bity znakowe, operacja nie ulega zmianie.', 'small aleft');
    }
    board.commit();
    board.set(0, line++, 'Obliczenia wykonujemy na liczbach bez bitów znakowych.', 'small aleft');
    board.commit();
    board.initDisplay( intro_wrapper );

    $(display_wrapper).append('<div class="display_wrapper"/>');
    var calc_wrapper = $(display_wrapper).find('div').last();

    if (operation == '-') {
        subtract_ZM(calc_wrapper, A, B);
    } else {
        add_ZM(calc_wrapper, A, B);
    }
}

function subtract_ZM(display_wrapper, A, B) {
    /*
    var A = '0.00101,101';
    var B = '1.01011,110';
    */
    var board = new Board();
    BoardsManager().addBoard(board);

    board.setSequence(0, 0, A.substring(1));
    board.setSequence(0, 1, B.substring(1), 'underline');
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
        board.set(pos - 1, borrowLine, '10', 'small');
        var found = false;
        while (--pos > 1) {
            if (bits[pos] === '1') {
                bits[pos] = '0';
                board.set(pos - 1, borrowLine, '0', 'small');
                borrowFrom = pos;
                found = true;
                break ;
            } else if (bits[pos] === '0') {
                bits[pos] = '1';
                board.set(pos - 1, borrowLine, '1', 'small');
            }
        }
        if (!found) {
            board.set(len, borrowLine, 'w=1');
            board.set(len + 1, borrowLine, '(pożyczka z niewidocznego tu bitu znakowego)', 'small');
            borrowFrom = 0;
            w = 1;
        }
    }


    var result = A.split('');
    for (var i = len-1; i > 1; --i) {
        if (A[i] !== ',') {
            var bitA = parseInt(bitsA[i]);
            var bitB = parseInt(bitsB[i]);

            if (bitA < bitB) {
                borrow(bitsA, i);
            }
            bitA = parseInt(bitsA[i]);

            /* 2 lines below are not necessary, but provide flash effect */
            board.highlight(i - 1, (i >= borrowFrom) ? borrowLine : 0);
            board.highlight(i - 1, 1);

            board.set(i - 1, 2, bitA - bitB);

            result[i] = ((bitA - bitB) == 0) ? '0' : '1';
        } else {
            board.set(i - 1, 2, A[i]);
        }
        if (i-1 === 1) {
            board.set(i - 2, 2, '.');
        }
        board.commit();
    }
    if (w === 1) {
        board.set(len, 2, ',,ZU2,,', 'small');
        board.set(len + 1, 2, '(ZU2 ponieważ wystąpiła pożyczka z bitu znakowego, tj. w=1)', 'small');

        result[0] = '1';
        convertBinaryFromZMtoZU2(result);
        result[0] = (A[0] === '0' ? '1' : '0');

        for (var i = len-1; i > 0; --i) {
            board.set(i - 1, 3, result[i]);
        }
        board.set(len, 3, ',,ZM,,', 'small');
        board.commit();

        board.set(-1, 3, result[0]);
        board.set(len + 1, 3, '(bit znakowy wyniku to negacja bitu znakowego l. A, ponieważ w=1)', 'small');
        board.commit();
    } else {
        board.set(len, 2, ',,ZM,,', 'small');
        board.set(len + 1, 2, '(nie było pożyczki [w=0], więc wynik jest w ZM)', 'small');
        board.commit();

        result[0] = A[0]; 
        board.set(-1, 2, result[0]);
        board.set(len + 1, 3, '(bit znakowy wyniku jest taki sam jak bit znakowy A, ponieważ w=0)', 'small');
        board.commit();
    }

    board.set(len+1, 4, 'Wynik: ' + fromBinaryZM( result.join('') ), 'aleft');
    board.commit();

    board.initDisplay( display_wrapper );
}

function add_ZM(display_wrapper, A, B) {
    var board = new Board();
    BoardsManager().addBoard(board);

    board.setSequence(0, 0, A.substring(1));
    board.setSequence(0, 1, B.substring(1), 'underline');
    board.set(-1, 1, '+', 'underline');
    board.commit(); 

    var len = A.length;
    var bitsA = A.split('');
    var bitsB = B.split('');

    var result = A.split('');
    var overflow = 0;
    for (var i = len-1; i > 1; --i) {
        if (A[i] !== ',') {
            var bitA = parseInt(bitsA[i]);
            var bitB = parseInt(bitsB[i]);

            var res = bitA + bitB + overflow;
            overflow = (res > 1) ? 1 : 0;
            
            board.highlight(i - 1, -1);
            board.highlight(i - 1, 0);
            board.highlight(i - 1, 1);

            board.set(i - 1, 2, res % 2);
            result[i] = ((res % 2) == 0) ? '0' : '1';

            if (overflow == 1) {
                var overflow_pos = i-2;
                if (bitsA[i-1] == ',') {
                    --overflow_pos;
                }
                board.set(overflow_pos, -1, '1', 'small');
            }
        } else {
            board.set(i - 1, 2, A[i]);
        }
        if (i-1 === 1) {
            board.set(i - 2, 2, '.');
        }
        board.commit();
    }
    board.set(len, 2, ',,ZM,,', 'small');
    board.set(len + 1, 2, '(dodawanie nie wymaga pożyczki [w=0], więc wynik jest w ZM)', 'small');
    board.commit();

    result[0] = A[0]; 
    board.set(-1, 2, result[0]);
    board.set(len + 1, 3, '(bit znakowy wyniku jest taki sam jak bit znakowy A)', 'small');
    board.commit();

    board.set(len+1, 4, 'Wynik: ' + fromBinaryZM( result.join('') ), 'aleft');
    board.commit();

    board.initDisplay( display_wrapper );
}
