/**
 *
 * Author: Rafał Skinderowicz
 */

var BinaryDivision = BinaryDivision || {};

(function() {
    'use strict';

    function shift_right(binary_frac) {
        if (binary_frac[0] == '1') {
            return '1.1' + binary_frac.substring(2);
        }
        return '0.0' + binary_frac.substring(2);
    }

    /**
     * Shifts left given binary number in sing-module or just module form.
     */
    function shift_left(binary_frac) {
        var frac = Fraction.multiply(Fraction.fromBinary(binary_frac), Fraction.fromString('2'));
        var bits = frac.toBinaryZM();
        return bits.substring(2);
    }

    function binary_cmp(first, sec) {
        return Fraction.fromBinary(first).compare( Fraction.fromBinary(sec) );
    }

    function division_method1(display_wrapper, fracA, fracB) {
        $(display_wrapper).html(''); /* Clear */

        var board = appendNewBoard(display_wrapper);
        var line = 0;

        board.set(0, line++, 'Sprawdzamy, czy |A| < |B| < 1', 'aleft small');
        board.commit();
        if (fracA.abs().compare(fracB.abs()) < 0 && fracB.abs().compare(new Fraction(1)) < 0) {
            board.set(0, line++, 'OK', 'aleft');
            board.commit();
        } else {
            board.set(0, line++, 'Warunek |A| < |B| < 1 nie jest spełniony', 'aleft small');
            board.commit();
            board.initDisplay();
            return ;
        }

        var A = fracA.toBinaryZM();
        var B = fracB.toBinaryZM();
        board.set(0, line++, 'Konwertujemy A i B do kodu znak moduł:', 'aleft small');
        board.set(0, line++, 'A = (' + A + ')ZM', 'aleft');
        board.set(0, line++, 'B = (' + B + ')ZM', 'aleft');
        board.commit();
        ++line;

        var shifted_A = make_lower_than_one(A);
        var shifted_B = make_lower_than_one(B);
        if (shifted_A[1] > 0) {
            board.set(0, line++, 'Przesuwamy A w prawo o ' + shifted_A[1] + ' miejsca, tak by otrzymać liczbę mniejszą od 1', 'small aleft');
            A = shifted_A[0];
            board.set(0, line++, 'A = (' + A + ')ZM', 'aleft');
            board.commit();
        }
        if (shifted_B[1] > 0) {
            board.set(0, line++, 'Przesuwamy B w prawo o ' + shifted_B[1] + ' miejsca, tak by otrzymać liczbę mniejszą od 1', 'small aleft');
            B = shifted_B[0];
            board.set(0, line++, 'B = (' + B + ')ZM', 'aleft');
            board.commit();
        }
        var shift_size = shifted_A[1] + shifted_B[1];
        ++line;

        board.set(0, line++, 'W kolejnych krokach porównujemy moduł podwojonej reszty z poprzedniego kroku, 2r,,i-1,, , z modułem dzielnika: |B|', 'small aleft');
        board.commit();
        board.initDisplay();

        board = appendNewBoard(display_wrapper);
        line = 0;

        /* Skip sign bit and dot */
        var divisor = Fraction.fromBinaryZM(B).abs();
        var quotient = Fraction.fromBinaryZM(A).abs();
        var max_iterations = 8;
        var quotient_repeats = false;
        var exact_result = false;
        var res_bits = [];
        var i = 0;
        var finished = false;
        while ( finished == false && i < max_iterations ) {
            /* board.set(-1, line, 'r,,' + i + ',, = '); */
            var bits = quotient.toBinaryZM().substring(2);
            if (bits.length < B.length - 2) {
                if (bits.indexOf(',') == -1) {
                    bits += ',';
                }
                bits += repeatStr('0', (B.length - 2) - bits.length);
            }
            board.set(1, line, '.' + bits, 'aleft');
            if (i == 0) {
                board.set(-1, line, 'r,,' + i + ',, = ');
                board.set(2, line, 'zaczynamy od r,,0,, = 2|A|', 'aleft small');
            }
            board.commit();
            if (quotient.compare(divisor) < 0) {
                if (i == 0) {
                    board.set(2, line, ' przesuwamy resztę w lewo (mnożymy przez 2)', 'aleft small');
                    board.set(0, line, '&larr;');
                    board.set(-1, line + 1, '2r,,0,, = ');
                } else {
                    board.set(-1, line, '2r,,' + (i-1) + ',, = ', 'aright');
                    board.set(2, line, 'Przesuniętą resztę porównujemy z |B|', 'aleft small');
                    board.commit();

                    board.set(-2, line, 'r,,' + i + ',, = ');
                    board.set(2, line, ' < |B|, więc przesuwamy w lewo; otrzymujemy kolejny bit ilorazu ', 'aleft small');
                    board.set(0, line, '&larr;');
                    board.set(3, line, '  q,,' + i + ',, = 0');
                    res_bits.push('0');
                }
            } else {
                board.set(-1, line, '2r,,' + (i-1) + ',, = ', 'aright');
                board.set(2, line, 'Przesuniętą resztę porównujemy z |B|', 'aleft small');
                board.commit();
                board.set(2, line, ' >= |B|, więc odejmujemy |B|; otrzymujemy kolejny bit ilorazu', 'aleft small');
                if (i > 0) {
                    board.set(3, line, '  q,,' + i + ',, = 1');
                    res_bits.push('1');
                }
                ++line;
                board.set(0, line, '-');
                board.set(1, line, '.' + divisor.toBinaryZM().substring(2), 'aleft underline');

                quotient = Fraction.sub(quotient, divisor);

                ++line;
                bits = quotient.toBinaryZM().substring(2);
                if (bits.length < B.length - 2) {
                    if (bits.indexOf(',') == -1) {
                        bits += ',';
                    }
                    bits += repeatStr('0', (B.length - 2) - bits.length);
                }
                board.set(1, line, '.' + bits, 'aleft');
                board.set(-1, line, 'r,,' + i + ',, = ');
                board.commit();

                if (quotient.compare(Fraction.ZERO) == 0) {
                    board.set(-1, line, 'r,,' + i + ',, = ');
                    exact_result = true;
                    board.set(2, line, 'Reszta równa 0, koniec dzielenia', 'aleft');
                    board.commit();
                    finished = true;
                } else if (i + 1 < max_iterations) {
                    board.set(0, line, '&larr;');
                    board.set(2, line, 'Wynik (kolejną resztę) przesuwamy o 1 msc. w lewo', 'aleft small');
                    board.set(-1, line + 1, '2r,,' + i + ',, = ', 'aright');
                }
            }
            ++line;
            ++i;
            if ( !finished && i < max_iterations ) {
                quotient = Fraction.multiply(quotient, new Fraction(2));
            }
        }

        if (exact_result == false) {
            board.set(2, line - 1, 'Osiągnięto zadaną dokładność wyniku, wynik jest przybliżony', 'aleft small');
            board.commit();
        }

        board.initDisplay();

        board = appendNewBoard(display_wrapper);
        line = 0;

        board.set(0, line, 'Bity od q,,1,, do q,,' + (res_bits.length) + ',, tworzą moduł ilorazu: |Q| = .0,' + res_bits.join(''), 'aleft');
        board.commit();

        ++line;
        var res_sign = (A[0] != B[0]) ? '1' : '0';
        board.set(0, line, 'Bit znakowy ilorazu, to q,,0,, = (a,,0,, ⊕ b,,0,,) = ' + res_sign, 'aleft' );
        board.commit();

        ++line;
        var res = res_sign + '.0,' + res_bits.join('');
        var res_decimal = Fraction.fromBinaryZM(res);
        board.set(0, line, 'Iloraz Q = ' + res + ',,ZM,, = ' + res_decimal , 'aleft');
        board.commit();

        if (exact_result) {
            ++line;
            board.set(0, line, 'Moduł reszty |R| = .0,0 (wynik jest dokładny)', 'aleft');
            board.commit();
        } else {
            ++line;

            var n = res_bits.length;
            var qbits = '.' + quotient.toBinaryZM().substring(2);
            var pow_str = '2^-' + n + '^';
            var quotient_bits = quotient.toBinaryZM().substring(3).replace(',', '');
            var qbits_shifted = '.0,' + repeatStr('0', n) + quotient_bits;
            board.set(0, line, 'Moduł reszty |R| = r,,' + n + ',, * ' + pow_str + ' = ' + qbits + ' * ' + pow_str 
                                + ' = ' + qbits_shifted, 'aleft');
            board.commit();
            ++line;
            for (var j = 0; j < n; ++j) {
                quotient = Fraction.multiply(quotient, new Fraction(0, 1, 2));
            }
            if (res_sign == '1') {
                quotient = Fraction.multiply(quotient, new Fraction(-1));
            }
            board.set(0, line, 'Reszta ma taki znak jak Q, czyli R = '
                               + quotient.toBinaryZM().substring(0)
                               + ',,ZM,, = ' + quotient, 'aleft');
            board.commit();

        }

        board.initDisplay();
    }


    function rem_integer_part(bits) {
        var idx = bits.indexOf(',');
        if (idx != -1) {
            return bits.substring(0, bits.indexOf('.')+1) + bits.substring(idx+1);
        } else {
            return bits[0] + '.0';
        }
    }

    /**
     * Logical shift, i.e. the sign bit is removed, the next bit takes its 
     * place. Works for |frac| < 1
     */
    function logshift_frac(frac) {
        var bits = frac.toBinaryZU2();
        var comma_index = bits.indexOf(',');
        var sign = bits[comma_index+1];
        console.log('logshift_frac ' + frac + '    ' + bits);
        if (sign == '1') {
            frac = Fraction.fromBinaryZU2('1.1,' + bits.substring(comma_index+2));
        } else {
            frac = Fraction.fromBinaryZM('0.0,' + bits.substring(comma_index+2));
        }
        console.log('logshift_frac res ' + frac );
        return frac;
    }

    function sub_frac_zu2(A, B) {
        var bits_a = A.toBinaryZU2();
        if (bits_a.indexOf(',') != -1) {
            bits_a = bits_a[0] + bits_a.substring( bits_a.indexOf(',') + 1 );
        } else {
            bits_a = bits_a[0];
        }
        var frac_a = Fraction.fromBinaryZM('0.1,' + bits_a);
        
        var bits_b = B.toBinaryZU2();
        if (bits_b.indexOf(',') != -1) {
            bits_b = bits_b[0] + bits_b.substring( bits_b.indexOf(',') + 1 );
        } else {
            bits_b = bits_b[0];
        }
        var frac_b = Fraction.fromBinaryZM('0.0,' + bits_b);

        if (bits_a == bits_b) {
            return Fraction.ZERO;
        }

        var sub = Fraction.sub(frac_a, frac_b);
        var sub_bits = sub.toBinaryZM();
        var idx = sub_bits.indexOf(',');
        return Fraction.fromBinaryZU2( sub_bits[idx+1] + '.' + sub_bits[idx+1] + ',' + sub_bits.substring(idx+2) );
    }

    function add_frac_zu2(A, B) {
        var bits_a = A.toBinaryZU2();
        if (bits_a.indexOf(',') != -1) {
            bits_a = bits_a[0] + bits_a.substring( bits_a.indexOf(',') + 1 );
        } else {
            bits_a = bits_a[0];
        }
        var frac_a = Fraction.fromBinaryZM('0.0,' + bits_a);
        
        var bits_b = B.toBinaryZU2();
        if (bits_b.indexOf(',') != -1) {
            bits_b = bits_b[0] + bits_b.substring( bits_b.indexOf(',') + 1 );
        } else {
            bits_b = bits_b[0];
        }
        var frac_b = Fraction.fromBinaryZM('0.0,' + bits_b);

        var sum = Fraction.add(frac_a, frac_b);
        var sum_bits = sum.toBinaryZM();
        var idx = sum_bits.indexOf(',');
        if (idx != -1) {
            return Fraction.fromBinaryZU2( sum_bits[idx+1] + '.' + sum_bits[idx+1] + ',' + sum_bits.substring(idx+2) );
        } else {
            return Fraction.ZERO;
        }
    }
    /**
     * Metoda nierestytucyjna (ang. non-restoring)
     */
    function division_method2(display_wrapper, fracA, fracB) {
        $(display_wrapper).html(''); /* Clear */

        var board = appendNewBoard(display_wrapper);
        var line = 0;

        board.set(0, line++, 'Sprawdzamy, czy |A| < |B| < 1', 'aleft small');
        board.commit();
        if (fracA.abs().compare(fracB.abs()) < 0 && fracB.abs().compare(new Fraction(1)) < 0) {
            board.set(0, line++, 'OK', 'aleft');
            board.commit();
        } else {
            board.set(0, line++, 'Warunek |A| < |B| < 1 nie jest spełniony', 'aleft small');
            board.commit();
            board.initDisplay();
            return ;
        }

        var A = fracA.toBinaryZM();
        var B = fracB.toBinaryZM();
        board.set(0, line++, 'Konwertujemy A i B do kodu znak moduł:', 'aleft small');
        board.set(0, line++, 'A = (' + A + ')ZM', 'aleft');
        board.set(0, line++, 'B = (' + B + ')ZM', 'aleft');
        board.commit();
        ++line;

        board.set(0, line++, 'Konwertujemy A i B do kodu ZU2', 'small aleft');
        A = convertFromZMtoZU2( A.split('') ).join( '' );
        B = convertFromZMtoZU2( B.split('') ).join( '' );

        board.set(0, line++, 'A = (' + A + '),,ZU2,,', 'aleft');
        board.set(0, line++, 'B = (' + B + '),,ZU2,,', 'aleft');
        board.commit();
        ++line;

        board.set(0, line++, 'Kolejne kroki mnożenia zależeć będą od porównania ze sobą bitu znakowego kolejnych reszt oraz bitu znakowego dzielnika', 'small aleft');
        /* board.set(0, line++, 'Objaśnienie: sgn(x) oznacza funkcję signum, czyli znak liczby.', 'small aleft'); */
        board.commit();

        ++line;
        board.set(0, line++, 'Zaczynamy od reszty r,,0,, = (A),,ZU2,,', 'small aleft');

        board.commit();
        board.initDisplay();

        board = appendNewBoard(display_wrapper);
        line = 0;

        /* Skip sign bit and dot */
        var divisor = fracB;
        var quotient = fracA;
        var max_iterations = 7;
        var quotient_repeats = false;
        var exact_result = false;
        var res_bits = [];
        var i = 0;
        var finished = false;
        while ( finished == false ) {
            board.set(-1, line, 'r,,' + i + ',, = ');
            var bits = quotient.toBinaryZU2();
            board.set(1, line, rem_integer_part(bits), 'aleft');
            board.commit();

            if (quotient.compare(Fraction.ZERO) == 0) {
                exact_result = true;
                board.set(2, line, 'Reszta równa 0, koniec dzielenia');
                board.commit();
                finished = true;
            } else if (i >= max_iterations) {
                finished = true;
            } else {
                if (quotient.compare(Fraction.ZERO) == divisor.compare(Fraction.ZERO)) {
                    board.set(2, line, '= (bity znakowe r,,' + i + ',, oraz B są takie same)', 'aleft small');
                    board.set(0, line, '&larr;');
                    board.set(3, line, '  q,,' + i + ',, = 1');
                    res_bits.push('1');

                    quotient = logshift_frac(quotient);
                    ++line;
                    board.set(1, line, rem_integer_part(quotient.toBinaryZU2()), 'aleft');
                    board.commit();

                    ++line;
                    board.set(0, line, '-', 'aleft');
                    board.set(1, line, rem_integer_part(divisor.toBinaryZU2()), 'aleft underline');
                    board.set(2, line, '... i odejmujemy B', 'aleft small');
                    board.commit();

                    quotient = sub_frac_zu2( quotient, divisor );
                } else {
                    board.set(2, line, '&ne; (biy znakowe r,,' + i + ',, oraz B są różne)', 'aleft small');
                    board.set(0, line, '&larr;');
                    board.set(3, line, '  q,,' + i + ',, = 0');
                    res_bits.push('0');

                    quotient = logshift_frac(quotient);
                    ++line;
                    board.set(1, line, rem_integer_part(quotient.toBinaryZU2()), 'aleft');
                    board.commit();

                    ++line;
                    board.set(0, line, '+', 'aleft');
                    board.set(1, line, rem_integer_part(divisor.toBinaryZU2()), 'aleft underline');
                    board.set(2, line, '... i dodajemy B', 'aleft small');

                    quotient = add_frac_zu2( quotient, divisor );
                }
                ++line;
                ++i;
            }
        }

        if (exact_result == false) {
            board.set(2, line, 'Osiągnięto zadaną dokładność wyniku, wynik jest przybliżony', 'aleft small');
            board.commit();
        }

        board.initDisplay();

        board = appendNewBoard(display_wrapper);
        line = 0;

        var n = res_bits.length;
        var PQ = res_bits[0] + '.' + res_bits.slice(1).join('');
        board.set(0, line, 'Bity od q,,0,, do q,,' + (res_bits.length) + ',, tworzą pseudo-iloraz: PQ = ' + PQ, 'aleft');
        board.commit();

        ++line;
        var correction = '1.' + repeatStr('0', n-1) + '1';
        board.set(0, line, 'Do PQ dodajemy poprawkę P = -1 + 2^-' + n + '^ = ' + correction + ' ,,ZU2,,' , 'aleft');
        board.commit();

        ++line;
        board.set(0, line, ' ' + PQ, 'aleft');
        ++line;
        board.set(0, line, '+' + correction, 'aleft underline');

        var q_sgn = (PQ[0] == '1') ? '0' : '1';
        var Q = q_sgn + PQ.substring(1) + '1';
        var result = Fraction.fromBinaryZU2( q_sgn + '.' + q_sgn + ',' + Q.substring(2) );
        ++line;

        board.set(0, line, ' ' + Q, 'aleft');
        board.commit();

        ++line;
        board.set(0, line, 'Q = ' + result.toBinaryZU2() + ',,ZU2,, = ' + result.toBinaryZM() + ',,ZM,, = ' + result, 'aleft');
        board.commit();

        if (exact_result) {
            ++line;
            board.set(0, line, 'Reszta R = 0.0 (wynik jest dokładny)', 'aleft');
            board.commit();
        } else {
            ++line;
            var qbits = rem_integer_part(quotient.toBinaryZU2());
            var pow_str = '2^-' + n + '^';
            var rem_sgn = qbits[0];
            var qbits_shifted = rem_sgn + '.' + repeatStr(rem_sgn, n) + qbits.substring(2);
            var qbits_zm = convertFromZU2toZM(qbits_shifted).join('');
            for (var j = 0; j < n; ++j) {
                quotient = Fraction.multiply(quotient, new Fraction(0, 1, 2));
            }
            board.set(0, line, 'Reszta R = r,,' + n + ',, * ' + pow_str + ' = ' + qbits + ' * ' + pow_str + ' = ' + qbits_shifted + ',,ZU2,,'
                      + ' = ' + qbits_zm + ',,ZM,, = ' + quotient, 'aleft');
            board.commit();
        }

        board.initDisplay();
    }

    BinaryDivision.division_method1 = division_method1;
    BinaryDivision.division_method2 = division_method2;

})();
