/**
 * Author: Rafał Skinderowicz
 */
function test_toBinaryZM() {
    var fractions = [ new Fraction(5, 7, 16), new Fraction(-11), new Fraction(0), new Fraction(0, 5, 16), new Fraction(0, -5, 16) ];
    var expected = [ '0.101,0111', '1.1011', '0.0', '0.0,0101', '1.0,0101' ];

    for (var i = 0; i < fractions.length; ++i) {
        var f = fractions[i];
        var exp = expected[i];

        if (f.toBinaryZM() !== exp) {
            console.log('Error: Fraction.toBinaryZM: ' + f.toBinaryZM() + ' but should be: ' + exp);
        }
    }
    
}

function test_fromBinaryZM() {
    var inputs = [ '0.101,0111', '1.101' ];
    var expected = [ '5 7/16', '-5' ];

    for (var i = 0; i < inputs.length; ++i) {
        var f = inputs[i];
        var exp = expected[i];

        var frac = fromBinaryZM(f);

        if (frac.toString() !== exp) {
            console.log('Error: fromBinaryZM: ' + frac.toString() + ' but should be: ' + exp);
        }
    }
    
}

function test_compare() {
    var inputs = [ ['0', '0'], ['0.0', '0.1'],
        ['0.101,0111', '0.1101'], ['0.101,0111', '1.1101'], ['1.1', '1.11'], ['1.11', '1.1'] ];
    var expected = [ 0, -1, -1, 1, 1, -1 ];
    for (var i = 0; i < inputs.length; ++i) {
        var f = inputs[i];
        var exp = expected[i];
        var f1 = Fraction.fromBinary(f[0]);
        var f2 = Fraction.fromBinary(f[1]);
        if (f1.compare(f2) !== exp) {
            console.log('Error: Fraction.compare: (' + f1.toString() + ', ' + f2.toString() + ') cmp is : ' + f1.compare(f2) + ' but should be ' + exp);
        }
    }
}

function test_normalize() {
    var inputs = [ '1 2/1', '2', '5/2', '5/15', '10 2/4', '-1 15/6', '-5/3' ];
    var expected = [ '3', '2', '2 1/2', '1/3', '10 1/2', '-3 1/2', '-1 2/3' ];
    for (var i = 0; i < inputs.length; ++i) {
        var f = inputs[i];
        var exp = expected[i];
        var f1 = Fraction.fromString(f);
        var res = f1.normalize().toString() ;
        if (res !== exp) {
            console.log('Error: Fraction.normalize: (' + f + ') = ' + res + ' but should be ' + exp);
        }
    }
}

function test_mult() {
    var inputs = [ ['1/2', '2'] ];
    var expected = [ '1' ];
    for (var i = 0; i < inputs.length; ++i) {
        var f = inputs[i];
        var exp = expected[i];
        var f1 = Fraction.fromString(f[0]);
        var f2 = Fraction.fromString(f[1]);
        var res = Fraction.multiply(f1, f2).normalize().toString();
        if (res !== exp) {
            console.log('Error: Fraction.multiply: (' + f1 + ', ' + f2 + ') = ' + res + ' but should be ' + exp);
        }
    }
}

function test_add() {
    var inputs = [ ['1/4', '2/4'], ['1/3', '3/4'], ['1 2/1', '2'], ['5/2', '5/15'], ['-1 2/4', '1 2/4'], ['1 2/4', '-1 2/4'] , ['0', '0'], ['-7/8', '5/8'] ];
    var expected = [ '3/4', '1 1/12', '5', '2 5/6', '0', '0', '0', '-1/4' ];
    for (var i = 0; i < inputs.length; ++i) {
        var f = inputs[i];
        var exp = expected[i];
        var f1 = Fraction.fromString(f[0]);
        var f2 = Fraction.fromString(f[1]);
        var res = Fraction.add(f1, f2).toString();
        if (res !== exp) {
            console.log('Error: Fraction.add: (' + f1 + ', ' + f2 + ') = ' + res + ' but should be ' + exp);
        }
    }
}

function test_fraction_run_all_tests() {
    test_toBinaryZM();
    test_fromBinaryZM();
    test_compare();
    test_normalize();
    test_add();
    test_mult();
}


