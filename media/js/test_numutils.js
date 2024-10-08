/**
 * Author: Rafał Skinderowicz
 */
function test_intToBinary() {
    var inputs  = [0, 1, 2, 5, -1, -2, -31];
    var expected = ['0.0', '0.1', '0.10', '0.101', '1.1', '1.10', '1.11111'];
    for (var i = 0; i < inputs.length; ++i) {
        if ( intToBinary(inputs[i]) !== expected[i] ) {
            console.log('Error: intToBinary(' + inputs[i] +') = ' + intToBinary(inputs[i]) + ' but should be: ' + expected[i]);
        }
    }
}

function test_getNearestPowerOf2() {
    var inputs  = [1, 2, 3, 8, 31, 32];
    var expected = [1, 2, 4, 8, 32, 32];
    for (var i = 0; i < inputs.length; ++i) {
        if ( getNearestPowerOf2(inputs[i]) !== expected[i] ) {
            console.log('Error: getNearestPowerOf2(' + inputs[i] +') = ' + getNearestPowerOf2(inputs[i]) + ' but should be: ' + expected[i]);
        }
    }
}

function test_isPowerOf2() {
    var inputs  = [1, 2, 3, 8, 31, 32];
    var expected = [true, true, false, true, false, true];
    for (var i = 0; i < inputs.length; ++i) {
        if ( isPowerOf2(inputs[i]) !== expected[i] ) {
            console.log('Error: isPowerOf2(' + inputs[i] +') = ' + isPowerOf2(inputs[i]) + ' but should be: ' + expected[i]);
        }
    }
}

function test_extendBinary() {
    var inputs  = [['1.101',5], ['1.101',3], ['1.101', 1]];
    var expected = ['1.00101', '1.101', '1.101'];
    for (var i = 0; i < inputs.length; ++i) {
        var str = inputs[i][0];
        var places = inputs[i][1];
        var exp = expected[i];

        if ( extendBinary(str, places) !== exp ) {
            console.log('Error: extendBinary(' + str + ', ' + places +') = ' + extendBinary(str, places) + ' but should be: ' + exp);
        }
    }
}

function test_incrementBinaryZM() {
    var inputs  = ['1.101', '1.111', '0.111,1'];
    var expected = ['1.110', '1.1000', '0.1000,0'];
    for (var i = 0; i < inputs.length; ++i) {
        var str = inputs[i];
        var exp = expected[i];
        var res = incrementBinaryZM(str.split(''));
        res = res.join('');

        if ( res !== exp ) {
            console.log('Error: incrementBinaryZM(' + str + ') = ' + res + ' but should be: ' + exp);
        }
    }
}

function test_decrementBinaryZM() {
    var inputs  = ['1.101', '1.100', '0.000,0', '1.1110,001'];
    var expected = ['1.100', '1.011', '1.000,1', '1.1110,000'];
    for (var i = 0; i < inputs.length; ++i) {
        var str = inputs[i];
        var exp = expected[i];
        var res = decrementBinaryZM(str.split(''));
        res = res.join('');

        if ( res !== exp ) {
            console.log('Error: decrementBinaryZM(' + str + ') = ' + res + ' but should be: ' + exp);
        }
    }
}

function test_numutils_run_all_tests() {
    test_intToBinary();
    test_getNearestPowerOf2();
    test_isPowerOf2();
    test_extendBinary();
    test_incrementBinaryZM();
    test_decrementBinaryZM();
}
