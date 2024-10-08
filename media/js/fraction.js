
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}


/**
 * Author: Rafał Skinderowicz
 */
function gcd(x, y) {
    if (isNaN(x) || isNaN(y)) {
        throw 'NaN in gcd method';
    }
    while (y != 0) {
        var z = x % y;
        x = y;
        y = z;
    }
    return x;
}

function Fraction(integer_part, numerator, denominator) {
    this.integer_part_ = parseInt(integer_part);
    if (isNaN(this.integer_part_)) {
        this.integer_part_ = 0;
    }
    numerator = parseInt(numerator);
    denominator = parseInt(denominator);
    if (!isNaN(numerator) && numerator !== 0
            && !isNaN(denominator) && denominator !== 0) {
        this.numerator_ = numerator;
        this.denominator_ = denominator;
        if (this.denominator_ == 1) {
            this.integer_part_ += this.numerator_;
            this.numerator_ = undefined;
            this.denominator_ = undefined;
        }
    }
}

Fraction.prototype.getSign = function() {
    if (this.integer_part_ < 0) {
        return -1;
    } else if (this.numerator_ !== undefined && this.numerator_ < 0) {
        return -1;
    }
    return 1;
}

Fraction.prototype.setSign = function(sign) {
    this.normalize();
    console.log('setSign: ' + sign + ' this Numerator: ' + this.numerator_);
    if (this.integer_part_ != 0) {
        this.integer_part_ *= sign;
    } else if (this.numerator_ !== undefined) {
        this.numerator_ = this.numerator_ * sign;
    }
    return this;
}

Fraction.prototype.toBinaryZM = function() {
    this.normalize();
    if ( !this.numerator_ ) {
        /* Just integer part */
        return intToBinary(this.integer_part_);
    } else {
        if ( !isPowerOf2(this.denominator_) ) {
            throw 'Denominator has to be power of 2';
        }
        if ( this.numerator_ > this.denominator_ ) {
            throw 'Numerator can not be greater than denominator';
        }
        var intpart = intToBinary(this.integer_part_);

        var n = getIntLog2(this.denominator_);
        var fracpart = extendBinary(intToBinary(this.numerator_), n);

        if (!this.integer_part_) {
            intpart = fracpart[0] + intpart.substring(1);
        }

        return intpart + ',' + fracpart.substring(2);
    }
}

Fraction.prototype.toBinaryZU2 = function() {
    var res = this.toBinaryZM();
    res = convertBinaryFromZMtoZU2(res).join('');
    return res;
}

Fraction.fromBinaryZM = function(bits) {
    if (typeof bits !== 'string') {
        bits = bits.join('');
    }
    if ( bits.match( /[01]\.[01]+,?[01]*/g ) == null ) {
        throw 'Invalid binary format : ' + bits;
    }
    var integer_part = undefined;
    var numerator = undefined; 
    var denominator = undefined;

    if ( bits.indexOf(',') != -1 ) {
        var parts = bits.split(',');
        integer_part = binaryToInt(parts[0]);
        numerator = binaryToInt(parts[1]);
        if (integer_part == 0 && parts[0][0] == '1') {
            /* Value is negative, negate the numerator */
            numerator = -numerator;
        }
        denominator = (1 << parts[1].length);
    } else {
        integer_part = binaryToInt(bits);
    }
    return new Fraction(integer_part, numerator, denominator);
}

Fraction.fromBinaryZU2 = function(bits) {
    return Fraction.fromBinaryZM( convertFromZU2toZM(bits) );
}

Fraction.fromString = function (str) {
    if (typeof str !== 'string') {
        throw 'String expected';
    }
    var parts = str.trim().split(' ');
    if (parts.length > 2) {
        throw 'Too many spaces in the string: ' + str;
    }
    var res = null;

    if (parts.length === 1) {
        if ( parts[0].match( /\d+\/\d+/g ) != null ) {
            var frac_parts = parts[0].split('/');
            res = new Fraction('0', frac_parts[0], frac_parts[1]);
        } else {
            res = new Fraction(parts[0]);
        } 
    } else {
        if ( parts[1].match( /\d+\/\d+/g ) == null ) {
            throw 'Invalid fraction part: ' + parts[1];
        }
        var frac_parts = parts[1].split('/');
        res = new Fraction(parts[0], frac_parts[0], frac_parts[1]);
    }
    return res;
}


Fraction.prototype.toString = function () {
    if (this.numerator_ !== undefined) {
        if (this.integer_part_ != 0) {
            return '' + this.integer_part_ + ' ' + this.numerator_ + '/' + this.denominator_;
        }
        return '' + this.numerator_ + '/' + this.denominator_;
    }
    return '' + this.integer_part_;
}

Fraction.prototype.compare = function(other) {
    var value = this.integer_part_;
    var denominator = 1;
    if (this.denominator_ !== undefined) {
        value = value * this.denominator_ + this.numerator_;
        denominator = this.denominator_;
    }
    var other_value = other.integer_part_;
    var other_denominator = 1;
    if (other.denominator_ !== undefined) {
        other_value = other_value * other.denominator_ + other.numerator_;
        other_denominator = other.denominator_;
    }
    value *= other_denominator;
    other_value *= denominator;
    var sub = value - other_value;
    if (sub > 0.0) {
        return 1;
    } else if (sub < 0.0) {
        return -1;
    }
    return 0;
}

Fraction.prototype.abs = function() {
    if (this.getSign() == -1) {
        return Fraction.multiply(this, new Fraction(-1));
    }
    return this;
}

Fraction.add = function (first, sec) {
    var first_value = first.integer_part_;
    var first_denominator = 1;
    if (first.denominator_ !== undefined) {
        first_value = first.getSign() * (Math.abs(first_value) * first.denominator_ + Math.abs(first.numerator_));
        first_denominator = first.denominator_;
    }
    var sec_value = sec.integer_part_;
    var sec_denominator = 1;
    if (sec.denominator_ !== undefined) {
        sec_value = sec.getSign() * (Math.abs(sec_value) * sec.denominator_ + Math.abs(sec.numerator_));
        sec_denominator = sec.denominator_;
    }
    var common_denominator = Math.round(first_denominator * sec_denominator / gcd(first_denominator, sec_denominator));
    var res_num = (common_denominator / first_denominator) * first_value + (common_denominator / sec_denominator) * sec_value;
    var res = new Fraction('0', res_num, common_denominator);
    return res.normalize();
}

Fraction.sub = function (first, sec) {
    return Fraction.add(first, Fraction.multiply(sec, new Fraction(-1)));
}

Fraction.multiply = function(first, sec) {
    var first_value = first.integer_part_;
    var first_denominator = 1;
    if (first.denominator_ !== undefined) {
        first_value = first.getSign() * (Math.abs(first_value) * first.denominator_ + Math.abs(first.numerator_));
        first_denominator = first.denominator_;
    }
    var sec_value = sec.integer_part_;
    var sec_denominator = 1;
    if (sec.denominator_ !== undefined) {
        sec_value = sec.getSign() * (Math.abs(sec_value) * sec.denominator_ + Math.abs(sec.numerator_));
        sec_denominator = sec.denominator_;
    }
    console.log('first_value ' + first_value + ' sec_value ' + sec_value);
    return new Fraction(0, first_value * sec_value, first_denominator * sec_denominator).normalize();
}

Fraction.prototype.normalize = function () {
    if (this.denominator_ !== undefined) {
        /*
        y = x * d + r
        10 = 3*3 + 1
        (y - r) / x = d
        */
        var num  = Math.abs(this.numerator_) + this.denominator_ * Math.abs(this.integer_part_);
        var rem = num % this.denominator_;
        var div = Math.round((num - rem) / this.denominator_);
        var sign = 1;
        if (this.integer_part_ < 0 || this.numerator_ < 0) {
            sign = -1;
        }
        this.integer_part_ = div * sign;
        this.numerator_ = rem;
        if (this.denominator_ == 1 || this.numerator_ == 0) {
            this.denominator_ = undefined;
            this.numerator_ = undefined;
        } else {
            var n = gcd(this.numerator_, this.denominator_);
            if (n > 1) {
                this.numerator_ = Math.round(this.numerator_ / n);
                this.denominator_ = Math.round(this.denominator_ / n);
            }
            if (this.integer_part_ == 0 && sign == -1) {
                this.numerator_ = -this.numerator_;
            }
        }
    }
    return this;
}

Fraction.fromBinary = function (bits) {
    if (typeof bits !== 'string') {
        bits = bits.join('');
    }
    if (bits.indexOf('.') == -1) {
        bits = '0.' + bits;
    }
    return Fraction.fromBinaryZM(bits);
}

Fraction.ZERO = new Fraction('0');

function fromBinaryZM(bits) {
    return Fraction.fromBinaryZM(bits);
}
