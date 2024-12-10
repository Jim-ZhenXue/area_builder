var bigInt = function(undefined) {
    "use strict";
    var BASE = 1e7, LOG_BASE = 7, MAX_INT = 9007199254740992, MAX_INT_ARR = smallToArray(MAX_INT), LOG_MAX_INT = Math.log(MAX_INT);
    function Integer(v, radix) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 ? parseValue(v) : parseBase(v, radix);
        return parseValue(v);
    }
    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
    }
    BigInteger.prototype = Object.create(Integer.prototype);
    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
    }
    SmallInteger.prototype = Object.create(Integer.prototype);
    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }
    function smallToArray(n) {
        if (n < 1e7) return [
            n
        ];
        if (n < 1e14) return [
            n % 1e7,
            Math.floor(n / 1e7)
        ];
        return [
            n % 1e7,
            Math.floor(n / 1e7) % 1e7,
            Math.floor(n / 1e14)
        ];
    }
    function arrayToSmall(arr) {
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch(length){
                case 0:
                    return 0;
                case 1:
                    return arr[0];
                case 2:
                    return arr[0] + arr[1] * BASE;
                default:
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr;
    }
    function trim(v) {
        var i = v.length;
        while(v[--i] === 0);
        v.length = i + 1;
    }
    function createArray(length) {
        var x = new Array(length);
        var i = -1;
        while(++i < length){
            x[i] = 0;
        }
        return x;
    }
    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }
    function add(a, b) {
        var l_a = a.length, l_b = b.length, r = new Array(l_a), carry = 0, base = BASE, sum, i;
        for(i = 0; i < l_b; i++){
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while(i < l_a){
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }
    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }
    function addSmall(a, carry) {
        var l = a.length, r = new Array(l), base = BASE, sum, i;
        for(i = 0; i < l; i++){
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }
        while(carry > 0){
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }
    BigInteger.prototype.add = function(v) {
        var value, n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add;
    SmallInteger.prototype.add = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add;
    function subtract(a, b) {
        var a_l = a.length, b_l = b.length, r = new Array(a_l), borrow = 0, base = BASE, i, difference;
        for(i = 0; i < b_l; i++){
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else borrow = 0;
            r[i] = difference;
        }
        for(i = b_l; i < a_l; i++){
            difference = a[i] - borrow;
            if (difference < 0) difference += base;
            else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }
        for(; i < a_l; i++){
            r[i] = a[i];
        }
        trim(r);
        return r;
    }
    function subtractAny(a, b, sign) {
        var value, isSmall;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }
    function subtractSmall(a, b, sign) {
        var l = a.length, r = new Array(l), carry = -b, base = BASE, i, difference;
        for(i = 0; i < l; i++){
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        }
        return new BigInteger(r, sign);
    }
    BigInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract;
    SmallInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;
    BigInteger.prototype.negate = function() {
        return new BigInteger(this.value, !this.sign);
    };
    SmallInteger.prototype.negate = function() {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };
    BigInteger.prototype.abs = function() {
        return new BigInteger(this.value, false);
    };
    SmallInteger.prototype.abs = function() {
        return new SmallInteger(Math.abs(this.value));
    };
    function multiplyLong(a, b) {
        var a_l = a.length, b_l = b.length, l = a_l + b_l, r = createArray(l), base = BASE, product, carry, i, a_i, b_j;
        for(i = 0; i < a_l; ++i){
            a_i = a[i];
            for(var j = 0; j < b_l; ++j){
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }
    function multiplySmall(a, b) {
        var l = a.length, r = new Array(l), base = BASE, carry = 0, product, i;
        for(i = 0; i < l; i++){
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }
        while(carry > 0){
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }
    function shiftLeft(x, n) {
        var r = [];
        while(n-- > 0)r.push(0);
        return r.concat(x);
    }
    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);
        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);
        var b = x.slice(n), a = x.slice(0, n), d = y.slice(n), c = y.slice(0, n);
        var ac = multiplyKaratsuba(a, c), bd = multiplyKaratsuba(b, d), abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }
    // The following function is derived from a surface fit of a graph plotting the performance difference
    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
    function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
    }
    BigInteger.prototype.multiply = function(v) {
        var value, n = parseValue(v), a = this.value, b = n.value, sign = this.sign !== n.sign, abs;
        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length)) return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
    };
    BigInteger.prototype.times = BigInteger.prototype.multiply;
    function multiplySmallAndArray(a, b, sign) {
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }
    SmallInteger.prototype._multiplyBySmall = function(a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };
    BigInteger.prototype._multiplyBySmall = function(a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };
    SmallInteger.prototype.multiply = function(v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;
    function square(a) {
        var l = a.length, r = createArray(l + l), base = BASE, product, carry, i, a_i, a_j;
        for(i = 0; i < l; i++){
            a_i = a[i];
            for(var j = 0; j < l; j++){
                a_j = a[j];
                product = a_i * a_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }
    BigInteger.prototype.square = function() {
        return new BigInteger(square(this.value), false);
    };
    SmallInteger.prototype.square = function() {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };
    function divMod1(a, b) {
        var a_l = a.length, b_l = b.length, base = BASE, result = createArray(b.length), divisorMostSignificantDigit = b[b_l - 1], // normalization
        lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), remainder = multiplySmall(a, lambda), divisor = multiplySmall(b, lambda), quotientDigit, shift, carry, borrow, i, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for(shift = a_l - b_l; shift >= 0; shift--){
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            // quotientDigit <= base - 1
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for(i = 0; i < l; i++){
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }
            while(borrow !== 0){
                quotientDigit -= 1;
                carry = 0;
                for(i = 0; i < l; i++){
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit;
        }
        // denormalization
        remainder = divModSmall(remainder, lambda)[0];
        return [
            arrayToSmall(result),
            arrayToSmall(remainder)
        ];
    }
    function divMod2(a, b) {
        // Performs faster than divMod1 on larger input sizes.
        var a_l = a.length, b_l = b.length, result = [], part = [], base = BASE, guess, xlen, highx, highy, check;
        while(a_l){
            part.unshift(a[--a_l]);
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            }while (guess)
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse();
        return [
            arrayToSmall(result),
            arrayToSmall(part)
        ];
    }
    function divModSmall(value, lambda) {
        var length = value.length, quotient = createArray(length), base = BASE, i, q, remainder, divisor;
        remainder = 0;
        for(i = length - 1; i >= 0; --i){
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [
            quotient,
            remainder | 0
        ];
    }
    function divModAny(self, v) {
        var value, n = parseValue(v);
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
            if (n.isSmall) {
                return [
                    new SmallInteger(truncate(a / b)),
                    new SmallInteger(a % b)
                ];
            }
            return [
                Integer[0],
                self
            ];
        }
        if (n.isSmall) {
            if (b === 1) return [
                self,
                Integer[0]
            ];
            if (b == -1) return [
                self.negate(),
                Integer[0]
            ];
            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [
                        new SmallInteger(quotient),
                        new SmallInteger(remainder)
                    ];
                }
                return [
                    new BigInteger(quotient, self.sign !== n.sign),
                    new SmallInteger(remainder)
                ];
            }
            b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [
            Integer[0],
            self
        ];
        if (comparison === 0) return [
            Integer[self.sign === n.sign ? 1 : -1],
            Integer[0]
        ];
        // divMod1 is faster on smaller input sizes
        if (a.length + b.length <= 200) value = divMod1(a, b);
        else value = divMod2(a, b);
        quotient = value[0];
        var qSign = self.sign !== n.sign, mod = value[1], mSign = self.sign;
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [
            quotient,
            mod
        ];
    }
    BigInteger.prototype.divmod = function(v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;
    BigInteger.prototype.divide = function(v) {
        return divModAny(this, v)[0];
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;
    BigInteger.prototype.mod = function(v) {
        return divModAny(this, v)[1];
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;
    BigInteger.prototype.pow = function(v) {
        var n = parseValue(v), a = this.value, b = n.value, value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
            return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b))) return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while(true){
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow;
    BigInteger.prototype.modPow = function(exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1], base = this.mod(mod);
        while(exp.isPositive()){
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;
    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for(var i = a.length - 1; i >= 0; i--){
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }
    BigInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v), a = this.value, b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
    };
    SmallInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v), a = Math.abs(this.value), b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
    };
    BigInteger.prototype.compare = function(v) {
        // See discussion about comparison with Infinity:
        // https://github.com/peterolson/BigInteger.js/issues/61
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var n = parseValue(v), a = this.value, b = n.value;
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;
    SmallInteger.prototype.compare = function(v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var n = parseValue(v), a = this.value, b = n.value;
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;
    BigInteger.prototype.equals = function(v) {
        return this.compare(v) === 0;
    };
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;
    BigInteger.prototype.notEquals = function(v) {
        return this.compare(v) !== 0;
    };
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;
    BigInteger.prototype.greater = function(v) {
        return this.compare(v) > 0;
    };
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;
    BigInteger.prototype.lesser = function(v) {
        return this.compare(v) < 0;
    };
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;
    BigInteger.prototype.greaterOrEquals = function(v) {
        return this.compare(v) >= 0;
    };
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;
    BigInteger.prototype.lesserOrEquals = function(v) {
        return this.compare(v) <= 0;
    };
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;
    BigInteger.prototype.isEven = function() {
        return (this.value[0] & 1) === 0;
    };
    SmallInteger.prototype.isEven = function() {
        return (this.value & 1) === 0;
    };
    BigInteger.prototype.isOdd = function() {
        return (this.value[0] & 1) === 1;
    };
    SmallInteger.prototype.isOdd = function() {
        return (this.value & 1) === 1;
    };
    BigInteger.prototype.isPositive = function() {
        return !this.sign;
    };
    SmallInteger.prototype.isPositive = function() {
        return this.value > 0;
    };
    BigInteger.prototype.isNegative = function() {
        return this.sign;
    };
    SmallInteger.prototype.isNegative = function() {
        return this.value < 0;
    };
    BigInteger.prototype.isUnit = function() {
        return false;
    };
    SmallInteger.prototype.isUnit = function() {
        return Math.abs(this.value) === 1;
    };
    BigInteger.prototype.isZero = function() {
        return false;
    };
    SmallInteger.prototype.isZero = function() {
        return this.value === 0;
    };
    BigInteger.prototype.isDivisibleBy = function(v) {
        var n = parseValue(v);
        var value = n.value;
        if (value === 0) return false;
        if (value === 1) return true;
        if (value === 2) return this.isEven();
        return this.mod(n).equals(Integer[0]);
    };
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;
    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(25)) return true;
    // we don't know if it's prime: let the other functions figure it out
    }
    BigInteger.prototype.isPrime = function() {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs(), nPrev = n.prev();
        var a = [
            2,
            3,
            5,
            7,
            11,
            13,
            17,
            19
        ], b = nPrev, d, t, i, x;
        while(b.isEven())b = b.divide(2);
        for(i = 0; i < a.length; i++){
            x = bigInt(a[i]).modPow(b, n);
            if (x.equals(Integer[1]) || x.equals(nPrev)) continue;
            for(t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)){
                x = x.square().mod(n);
                if (x.equals(nPrev)) t = false;
            }
            if (t) return false;
        }
        return true;
    };
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;
    BigInteger.prototype.isProbablePrime = function(iterations) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations;
        // use the Fermat primality test
        for(var i = 0; i < t; i++){
            var a = bigInt.randBetween(2, n.minus(2));
            if (!a.modPow(n.prev(), n).isUnit()) return false; // definitely composite
        }
        return true; // large chance of being prime
    };
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;
    BigInteger.prototype.next = function() {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };
    SmallInteger.prototype.next = function() {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
    };
    BigInteger.prototype.prev = function() {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };
    SmallInteger.prototype.prev = function() {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
    };
    var powersOfTwo = [
        1
    ];
    while(powersOfTwo[powersOfTwo.length - 1] <= BASE)powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];
    function shift_isSmall(n) {
        return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
    }
    BigInteger.prototype.shiftLeft = function(n) {
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        while(n >= powers2Length){
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;
    BigInteger.prototype.shiftRight = function(n) {
        var remQuo;
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while(n >= powers2Length){
            if (result.isZero()) return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;
    function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x, yRem = ySign ? y.not() : y;
        var xBits = [], yBits = [];
        var xStop = false, yStop = false;
        while(!xStop || !yStop){
            if (xRem.isZero()) {
                xStop = true;
                xBits.push(xSign ? 1 : 0);
            } else if (xSign) xBits.push(xRem.isEven() ? 1 : 0); // two's complement for negative numbers
            else xBits.push(xRem.isEven() ? 0 : 1);
            if (yRem.isZero()) {
                yStop = true;
                yBits.push(ySign ? 1 : 0);
            } else if (ySign) yBits.push(yRem.isEven() ? 1 : 0);
            else yBits.push(yRem.isEven() ? 0 : 1);
            xRem = xRem.over(2);
            yRem = yRem.over(2);
        }
        var result = [];
        for(var i = 0; i < xBits.length; i++)result.push(fn(xBits[i], yBits[i]));
        var sum = bigInt(result.pop()).negate().times(bigInt(2).pow(result.length));
        while(result.length){
            sum = sum.add(bigInt(result.pop()).times(bigInt(2).pow(result.length)));
        }
        return sum;
    }
    BigInteger.prototype.not = function() {
        return this.negate().prev();
    };
    SmallInteger.prototype.not = BigInteger.prototype.not;
    BigInteger.prototype.and = function(n) {
        return bitwise(this, n, function(a, b) {
            return a & b;
        });
    };
    SmallInteger.prototype.and = BigInteger.prototype.and;
    BigInteger.prototype.or = function(n) {
        return bitwise(this, n, function(a, b) {
            return a | b;
        });
    };
    SmallInteger.prototype.or = BigInteger.prototype.or;
    BigInteger.prototype.xor = function(n) {
        return bitwise(this, n, function(a, b) {
            return a ^ b;
        });
    };
    SmallInteger.prototype.xor = BigInteger.prototype.xor;
    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
    function roughLOB(n) {
        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
        var v = n.value, x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }
    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while(a.isEven() && b.isEven()){
            d = Math.min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while(a.isEven()){
            a = a.divide(roughLOB(a));
        }
        do {
            while(b.isEven()){
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b;
                b = a;
                a = t;
            }
            b = b.subtract(a);
        }while (!b.isZero())
        return c.isUnit() ? a : a.multiply(c);
    }
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }
    function randBetween(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low);
        if (range.isSmall) return low.add(Math.round(Math.random() * range));
        var length = range.value.length - 1;
        var result = [], restricted = true;
        for(var i = length; i >= 0; i--){
            var top = restricted ? range.value[i] : BASE;
            var digit = truncate(Math.random() * top);
            result.unshift(digit);
            if (digit < top) restricted = false;
        }
        result = arrayToSmall(result);
        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
    }
    var parseBase = function(text, base) {
        var val = Integer[0], pow = Integer[1], length = text.length;
        if (2 <= base && base <= 36) {
            if (length <= LOG_MAX_INT / Math.log(base)) {
                return new SmallInteger(parseInt(text, base));
            }
        }
        base = parseValue(base);
        var digits = [];
        var i;
        var isNegative = text[0] === "-";
        for(i = isNegative ? 1 : 0; i < text.length; i++){
            var c = text[i].toLowerCase(), charCode = c.charCodeAt(0);
            if (48 <= charCode && charCode <= 57) digits.push(parseValue(c));
            else if (97 <= charCode && charCode <= 122) digits.push(parseValue(c.charCodeAt(0) - 87));
            else if (c === "<") {
                var start = i;
                do {
                    i++;
                }while (text[i] !== ">")
                digits.push(parseValue(text.slice(start + 1, i)));
            } else throw new Error(c + " is not a valid character");
        }
        digits.reverse();
        for(i = 0; i < digits.length; i++){
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    };
    function stringify(digit) {
        var v = digit.value;
        if (typeof v === "number") v = [
            v
        ];
        if (v.length === 1 && v[0] <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(v[0]);
        }
        return "<" + v + ">";
    }
    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return "0";
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return "0";
            if (n.isNegative()) return new Array(1 - n).join("10");
            return "1" + new Array(+n).join("01");
        }
        var minusSign = "";
        if (n.isNegative() && base.isPositive()) {
            minusSign = "-";
            n = n.abs();
        }
        if (base.equals(1)) {
            if (n.isZero()) return "0";
            return minusSign + new Array(+n + 1).join(1);
        }
        var out = [];
        var left = n, divmod;
        while(left.isNegative() || left.compareAbs(base) >= 0){
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(stringify(digit));
        }
        out.push(stringify(left));
        return minusSign + out.reverse().join("");
    }
    BigInteger.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBase(this, radix);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while(--l >= 0){
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };
    SmallInteger.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBase(this, radix);
        return String(this.value);
    };
    BigInteger.prototype.valueOf = function() {
        return +this.toString();
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;
    SmallInteger.prototype.valueOf = function() {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
    function parseStringValue(v) {
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x)) return new SmallInteger(x);
            throw "Invalid integer: " + v;
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") exp = exp.slice(1);
            exp = +exp;
            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }
            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
            text += new Array(exp + 1).join("0");
            v = text;
        }
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) throw new Error("Invalid integer: " + v);
        var r = [], max = v.length, l = LOG_BASE, min = max - l;
        while(max > 0){
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0) min = 0;
            max -= l;
        }
        trim(r);
        return new BigInteger(r, sign);
    }
    function parseNumberValue(v) {
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }
    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        return v;
    }
    // Pre-define numbers in range [-999,999]
    for(var i = 0; i < 1000; i++){
        Integer[i] = new SmallInteger(i);
        if (i > 0) Integer[-i] = new SmallInteger(-i);
    }
    // Backwards compatibility
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function(x) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };
    Integer.randBetween = randBetween;
    return Integer;
}();
// Node.js check
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = bigInt;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvQmlnSW50ZWdlci1jZGE1YmNjLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBiaWdJbnQgPSAoZnVuY3Rpb24gKHVuZGVmaW5lZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIEJBU0UgPSAxZTcsXG4gICAgICAgIExPR19CQVNFID0gNyxcbiAgICAgICAgTUFYX0lOVCA9IDkwMDcxOTkyNTQ3NDA5OTIsXG4gICAgICAgIE1BWF9JTlRfQVJSID0gc21hbGxUb0FycmF5KE1BWF9JTlQpLFxuICAgICAgICBMT0dfTUFYX0lOVCA9IE1hdGgubG9nKE1BWF9JTlQpO1xuXG4gICAgZnVuY3Rpb24gSW50ZWdlcih2LCByYWRpeCkge1xuICAgICAgICBpZiAodHlwZW9mIHYgPT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBJbnRlZ2VyWzBdO1xuICAgICAgICBpZiAodHlwZW9mIHJhZGl4ICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gK3JhZGl4ID09PSAxMCA/IHBhcnNlVmFsdWUodikgOiBwYXJzZUJhc2UodiwgcmFkaXgpO1xuICAgICAgICByZXR1cm4gcGFyc2VWYWx1ZSh2KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBCaWdJbnRlZ2VyKHZhbHVlLCBzaWduKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zaWduID0gc2lnbjtcbiAgICAgICAgdGhpcy5pc1NtYWxsID0gZmFsc2U7XG4gICAgfVxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7XG5cbiAgICBmdW5jdGlvbiBTbWFsbEludGVnZXIodmFsdWUpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNpZ24gPSB2YWx1ZSA8IDA7XG4gICAgICAgIHRoaXMuaXNTbWFsbCA9IHRydWU7XG4gICAgfVxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEludGVnZXIucHJvdG90eXBlKTtcblxuICAgIGZ1bmN0aW9uIGlzUHJlY2lzZShuKSB7XG4gICAgICAgIHJldHVybiAtTUFYX0lOVCA8IG4gJiYgbiA8IE1BWF9JTlQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc21hbGxUb0FycmF5KG4pIHsgLy8gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgZG9lc24ndCByZWZlcmVuY2UgQkFTRSwgbmVlZCB0byBjaGFuZ2UgdGhpcyBmdW5jdGlvbiBpZiBCQVNFIGNoYW5nZXNcbiAgICAgICAgaWYgKG4gPCAxZTcpXG4gICAgICAgICAgICByZXR1cm4gW25dO1xuICAgICAgICBpZiAobiA8IDFlMTQpXG4gICAgICAgICAgICByZXR1cm4gW24gJSAxZTcsIE1hdGguZmxvb3IobiAvIDFlNyldO1xuICAgICAgICByZXR1cm4gW24gJSAxZTcsIE1hdGguZmxvb3IobiAvIDFlNykgJSAxZTcsIE1hdGguZmxvb3IobiAvIDFlMTQpXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheVRvU21hbGwoYXJyKSB7IC8vIElmIEJBU0UgY2hhbmdlcyB0aGlzIGZ1bmN0aW9uIG1heSBuZWVkIHRvIGNoYW5nZVxuICAgICAgICB0cmltKGFycik7XG4gICAgICAgIHZhciBsZW5ndGggPSBhcnIubGVuZ3RoO1xuICAgICAgICBpZiAobGVuZ3RoIDwgNCAmJiBjb21wYXJlQWJzKGFyciwgTUFYX0lOVF9BUlIpIDwgMCkge1xuICAgICAgICAgICAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiAwO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIGFyclswXTtcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHJldHVybiBhcnJbMF0gKyBhcnJbMV0gKiBCQVNFO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBhcnJbMF0gKyAoYXJyWzFdICsgYXJyWzJdICogQkFTRSkgKiBCQVNFO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJpbSh2KSB7XG4gICAgICAgIHZhciBpID0gdi5sZW5ndGg7XG4gICAgICAgIHdoaWxlICh2Wy0taV0gPT09IDApO1xuICAgICAgICB2Lmxlbmd0aCA9IGkgKyAxO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUFycmF5KGxlbmd0aCkgeyAvLyBmdW5jdGlvbiBzaGFtZWxlc3NseSBzdG9sZW4gZnJvbSBZYWZmbGUncyBsaWJyYXJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9ZYWZmbGUvQmlnSW50ZWdlclxuICAgICAgICB2YXIgeCA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICB4W2ldID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cnVuY2F0ZShuKSB7XG4gICAgICAgIGlmIChuID4gMCkgcmV0dXJuIE1hdGguZmxvb3Iobik7XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwobik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkKGEsIGIpIHsgLy8gYXNzdW1lcyBhIGFuZCBiIGFyZSBhcnJheXMgd2l0aCBhLmxlbmd0aCA+PSBiLmxlbmd0aFxuICAgICAgICB2YXIgbF9hID0gYS5sZW5ndGgsXG4gICAgICAgICAgICBsX2IgPSBiLmxlbmd0aCxcbiAgICAgICAgICAgIHIgPSBuZXcgQXJyYXkobF9hKSxcbiAgICAgICAgICAgIGNhcnJ5ID0gMCxcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFLFxuICAgICAgICAgICAgc3VtLCBpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbF9iOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSA9IGFbaV0gKyBiW2ldICsgY2Fycnk7XG4gICAgICAgICAgICBjYXJyeSA9IHN1bSA+PSBiYXNlID8gMSA6IDA7XG4gICAgICAgICAgICByW2ldID0gc3VtIC0gY2FycnkgKiBiYXNlO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChpIDwgbF9hKSB7XG4gICAgICAgICAgICBzdW0gPSBhW2ldICsgY2Fycnk7XG4gICAgICAgICAgICBjYXJyeSA9IHN1bSA9PT0gYmFzZSA/IDEgOiAwO1xuICAgICAgICAgICAgcltpKytdID0gc3VtIC0gY2FycnkgKiBiYXNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYXJyeSA+IDApIHIucHVzaChjYXJyeSk7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEFueShhLCBiKSB7XG4gICAgICAgIGlmIChhLmxlbmd0aCA+PSBiLmxlbmd0aCkgcmV0dXJuIGFkZChhLCBiKTtcbiAgICAgICAgcmV0dXJuIGFkZChiLCBhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRTbWFsbChhLCBjYXJyeSkgeyAvLyBhc3N1bWVzIGEgaXMgYXJyYXksIGNhcnJ5IGlzIG51bWJlciB3aXRoIDAgPD0gY2FycnkgPCBNQVhfSU5UXG4gICAgICAgIHZhciBsID0gYS5sZW5ndGgsXG4gICAgICAgICAgICByID0gbmV3IEFycmF5KGwpLFxuICAgICAgICAgICAgYmFzZSA9IEJBU0UsXG4gICAgICAgICAgICBzdW0sIGk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSA9IGFbaV0gLSBiYXNlICsgY2Fycnk7XG4gICAgICAgICAgICBjYXJyeSA9IE1hdGguZmxvb3Ioc3VtIC8gYmFzZSk7XG4gICAgICAgICAgICByW2ldID0gc3VtIC0gY2FycnkgKiBiYXNlO1xuICAgICAgICAgICAgY2FycnkgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoY2FycnkgPiAwKSB7XG4gICAgICAgICAgICByW2krK10gPSBjYXJyeSAlIGJhc2U7XG4gICAgICAgICAgICBjYXJyeSA9IE1hdGguZmxvb3IoY2FycnkgLyBiYXNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAodikge1xuICAgICAgICB2YXIgdmFsdWUsIG4gPSBwYXJzZVZhbHVlKHYpO1xuICAgICAgICBpZiAodGhpcy5zaWduICE9PSBuLnNpZ24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1YnRyYWN0KG4ubmVnYXRlKCkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhID0gdGhpcy52YWx1ZSwgYiA9IG4udmFsdWU7XG4gICAgICAgIGlmIChuLmlzU21hbGwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbChhLCBNYXRoLmFicyhiKSksIHRoaXMuc2lnbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGFkZEFueShhLCBiKSwgdGhpcy5zaWduKTtcbiAgICB9O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnBsdXMgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7XG5cbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHZhciBuID0gcGFyc2VWYWx1ZSh2KTtcbiAgICAgICAgdmFyIGEgPSB0aGlzLnZhbHVlO1xuICAgICAgICBpZiAoYSA8IDAgIT09IG4uc2lnbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3VidHJhY3Qobi5uZWdhdGUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGIgPSBuLnZhbHVlO1xuICAgICAgICBpZiAobi5pc1NtYWxsKSB7XG4gICAgICAgICAgICBpZiAoaXNQcmVjaXNlKGEgKyBiKSkgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIoYSArIGIpO1xuICAgICAgICAgICAgYiA9IHNtYWxsVG9BcnJheShNYXRoLmFicyhiKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGFkZFNtYWxsKGIsIE1hdGguYWJzKGEpKSwgYSA8IDApO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5wbHVzID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7XG5cbiAgICBmdW5jdGlvbiBzdWJ0cmFjdChhLCBiKSB7IC8vIGFzc3VtZXMgYSBhbmQgYiBhcmUgYXJyYXlzIHdpdGggYSA+PSBiXG4gICAgICAgIHZhciBhX2wgPSBhLmxlbmd0aCxcbiAgICAgICAgICAgIGJfbCA9IGIubGVuZ3RoLFxuICAgICAgICAgICAgciA9IG5ldyBBcnJheShhX2wpLFxuICAgICAgICAgICAgYm9ycm93ID0gMCxcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFLFxuICAgICAgICAgICAgaSwgZGlmZmVyZW5jZTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJfbDsgaSsrKSB7XG4gICAgICAgICAgICBkaWZmZXJlbmNlID0gYVtpXSAtIGJvcnJvdyAtIGJbaV07XG4gICAgICAgICAgICBpZiAoZGlmZmVyZW5jZSA8IDApIHtcbiAgICAgICAgICAgICAgICBkaWZmZXJlbmNlICs9IGJhc2U7XG4gICAgICAgICAgICAgICAgYm9ycm93ID0gMTtcbiAgICAgICAgICAgIH0gZWxzZSBib3Jyb3cgPSAwO1xuICAgICAgICAgICAgcltpXSA9IGRpZmZlcmVuY2U7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gYl9sOyBpIDwgYV9sOyBpKyspIHtcbiAgICAgICAgICAgIGRpZmZlcmVuY2UgPSBhW2ldIC0gYm9ycm93O1xuICAgICAgICAgICAgaWYgKGRpZmZlcmVuY2UgPCAwKSBkaWZmZXJlbmNlICs9IGJhc2U7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByW2krK10gPSBkaWZmZXJlbmNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcltpXSA9IGRpZmZlcmVuY2U7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICg7IGkgPCBhX2w7IGkrKykge1xuICAgICAgICAgICAgcltpXSA9IGFbaV07XG4gICAgICAgIH1cbiAgICAgICAgdHJpbShyKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3VidHJhY3RBbnkoYSwgYiwgc2lnbikge1xuICAgICAgICB2YXIgdmFsdWUsIGlzU21hbGw7XG4gICAgICAgIGlmIChjb21wYXJlQWJzKGEsIGIpID49IDApIHtcbiAgICAgICAgICAgIHZhbHVlID0gc3VidHJhY3QoYSxiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gc3VidHJhY3QoYiwgYSk7XG4gICAgICAgICAgICBzaWduID0gIXNpZ247XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSBhcnJheVRvU21hbGwodmFsdWUpO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICBpZiAoc2lnbikgdmFsdWUgPSAtdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHZhbHVlLCBzaWduKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdWJ0cmFjdFNtYWxsKGEsIGIsIHNpZ24pIHsgLy8gYXNzdW1lcyBhIGlzIGFycmF5LCBiIGlzIG51bWJlciB3aXRoIDAgPD0gYiA8IE1BWF9JTlRcbiAgICAgICAgdmFyIGwgPSBhLmxlbmd0aCxcbiAgICAgICAgICAgIHIgPSBuZXcgQXJyYXkobCksXG4gICAgICAgICAgICBjYXJyeSA9IC1iLFxuICAgICAgICAgICAgYmFzZSA9IEJBU0UsXG4gICAgICAgICAgICBpLCBkaWZmZXJlbmNlO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBkaWZmZXJlbmNlID0gYVtpXSArIGNhcnJ5O1xuICAgICAgICAgICAgY2FycnkgPSBNYXRoLmZsb29yKGRpZmZlcmVuY2UgLyBiYXNlKTtcbiAgICAgICAgICAgIGRpZmZlcmVuY2UgJT0gYmFzZTtcbiAgICAgICAgICAgIHJbaV0gPSBkaWZmZXJlbmNlIDwgMCA/IGRpZmZlcmVuY2UgKyBiYXNlIDogZGlmZmVyZW5jZTtcbiAgICAgICAgfVxuICAgICAgICByID0gYXJyYXlUb1NtYWxsKHIpO1xuICAgICAgICBpZiAodHlwZW9mIHIgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGlmIChzaWduKSByID0gLXI7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFNtYWxsSW50ZWdlcihyKTtcbiAgICAgICAgfSByZXR1cm4gbmV3IEJpZ0ludGVnZXIociwgc2lnbik7XG4gICAgfVxuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiAodikge1xuICAgICAgICB2YXIgbiA9IHBhcnNlVmFsdWUodik7XG4gICAgICAgIGlmICh0aGlzLnNpZ24gIT09IG4uc2lnbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG4ubmVnYXRlKCkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhID0gdGhpcy52YWx1ZSwgYiA9IG4udmFsdWU7XG4gICAgICAgIGlmIChuLmlzU21hbGwpXG4gICAgICAgICAgICByZXR1cm4gc3VidHJhY3RTbWFsbChhLCBNYXRoLmFicyhiKSwgdGhpcy5zaWduKTtcbiAgICAgICAgcmV0dXJuIHN1YnRyYWN0QW55KGEsIGIsIHRoaXMuc2lnbik7XG4gICAgfTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5taW51cyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0O1xuXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHZhciBuID0gcGFyc2VWYWx1ZSh2KTtcbiAgICAgICAgdmFyIGEgPSB0aGlzLnZhbHVlO1xuICAgICAgICBpZiAoYSA8IDAgIT09IG4uc2lnbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG4ubmVnYXRlKCkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBiID0gbi52YWx1ZTtcbiAgICAgICAgaWYgKG4uaXNTbWFsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIoYSAtIGIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdWJ0cmFjdFNtYWxsKGIsIE1hdGguYWJzKGEpLCBhID49IDApO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5taW51cyA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUuc3VidHJhY3Q7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcih0aGlzLnZhbHVlLCAhdGhpcy5zaWduKTtcbiAgICB9O1xuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2lnbiA9IHRoaXMuc2lnbjtcbiAgICAgICAgdmFyIHNtYWxsID0gbmV3IFNtYWxsSW50ZWdlcigtdGhpcy52YWx1ZSk7XG4gICAgICAgIHNtYWxsLnNpZ24gPSAhc2lnbjtcbiAgICAgICAgcmV0dXJuIHNtYWxsO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcih0aGlzLnZhbHVlLCBmYWxzZSk7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLmFicyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIoTWF0aC5hYnModGhpcy52YWx1ZSkpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBtdWx0aXBseUxvbmcoYSwgYikge1xuICAgICAgICB2YXIgYV9sID0gYS5sZW5ndGgsXG4gICAgICAgICAgICBiX2wgPSBiLmxlbmd0aCxcbiAgICAgICAgICAgIGwgPSBhX2wgKyBiX2wsXG4gICAgICAgICAgICByID0gY3JlYXRlQXJyYXkobCksXG4gICAgICAgICAgICBiYXNlID0gQkFTRSxcbiAgICAgICAgICAgIHByb2R1Y3QsIGNhcnJ5LCBpLCBhX2ksIGJfajtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGFfbDsgKytpKSB7XG4gICAgICAgICAgICBhX2kgPSBhW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBiX2w7ICsraikge1xuICAgICAgICAgICAgICAgIGJfaiA9IGJbal07XG4gICAgICAgICAgICAgICAgcHJvZHVjdCA9IGFfaSAqIGJfaiArIHJbaSArIGpdO1xuICAgICAgICAgICAgICAgIGNhcnJ5ID0gTWF0aC5mbG9vcihwcm9kdWN0IC8gYmFzZSk7XG4gICAgICAgICAgICAgICAgcltpICsgal0gPSBwcm9kdWN0IC0gY2FycnkgKiBiYXNlO1xuICAgICAgICAgICAgICAgIHJbaSArIGogKyAxXSArPSBjYXJyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0cmltKHIpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtdWx0aXBseVNtYWxsKGEsIGIpIHsgLy8gYXNzdW1lcyBhIGlzIGFycmF5LCBiIGlzIG51bWJlciB3aXRoIHxifCA8IEJBU0VcbiAgICAgICAgdmFyIGwgPSBhLmxlbmd0aCxcbiAgICAgICAgICAgIHIgPSBuZXcgQXJyYXkobCksXG4gICAgICAgICAgICBiYXNlID0gQkFTRSxcbiAgICAgICAgICAgIGNhcnJ5ID0gMCxcbiAgICAgICAgICAgIHByb2R1Y3QsIGk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHByb2R1Y3QgPSBhW2ldICogYiArIGNhcnJ5O1xuICAgICAgICAgICAgY2FycnkgPSBNYXRoLmZsb29yKHByb2R1Y3QgLyBiYXNlKTtcbiAgICAgICAgICAgIHJbaV0gPSBwcm9kdWN0IC0gY2FycnkgKiBiYXNlO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChjYXJyeSA+IDApIHtcbiAgICAgICAgICAgIHJbaSsrXSA9IGNhcnJ5ICUgYmFzZTtcbiAgICAgICAgICAgIGNhcnJ5ID0gTWF0aC5mbG9vcihjYXJyeSAvIGJhc2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNoaWZ0TGVmdCh4LCBuKSB7XG4gICAgICAgIHZhciByID0gW107XG4gICAgICAgIHdoaWxlIChuLS0gPiAwKSByLnB1c2goMCk7XG4gICAgICAgIHJldHVybiByLmNvbmNhdCh4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtdWx0aXBseUthcmF0c3ViYSh4LCB5KSB7XG4gICAgICAgIHZhciBuID0gTWF0aC5tYXgoeC5sZW5ndGgsIHkubGVuZ3RoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChuIDw9IDMwKSByZXR1cm4gbXVsdGlwbHlMb25nKHgsIHkpO1xuICAgICAgICBuID0gTWF0aC5jZWlsKG4gLyAyKTtcblxuICAgICAgICB2YXIgYiA9IHguc2xpY2UobiksXG4gICAgICAgICAgICBhID0geC5zbGljZSgwLCBuKSxcbiAgICAgICAgICAgIGQgPSB5LnNsaWNlKG4pLFxuICAgICAgICAgICAgYyA9IHkuc2xpY2UoMCwgbik7XG5cbiAgICAgICAgdmFyIGFjID0gbXVsdGlwbHlLYXJhdHN1YmEoYSwgYyksXG4gICAgICAgICAgICBiZCA9IG11bHRpcGx5S2FyYXRzdWJhKGIsIGQpLFxuICAgICAgICAgICAgYWJjZCA9IG11bHRpcGx5S2FyYXRzdWJhKGFkZEFueShhLCBiKSwgYWRkQW55KGMsIGQpKTtcblxuICAgICAgICB2YXIgcHJvZHVjdCA9IGFkZEFueShhZGRBbnkoYWMsIHNoaWZ0TGVmdChzdWJ0cmFjdChzdWJ0cmFjdChhYmNkLCBhYyksIGJkKSwgbikpLCBzaGlmdExlZnQoYmQsIDIgKiBuKSk7XG4gICAgICAgIHRyaW0ocHJvZHVjdCk7XG4gICAgICAgIHJldHVybiBwcm9kdWN0O1xuICAgIH1cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb24gaXMgZGVyaXZlZCBmcm9tIGEgc3VyZmFjZSBmaXQgb2YgYSBncmFwaCBwbG90dGluZyB0aGUgcGVyZm9ybWFuY2UgZGlmZmVyZW5jZVxuICAgIC8vIGJldHdlZW4gbG9uZyBtdWx0aXBsaWNhdGlvbiBhbmQga2FyYXRzdWJhIG11bHRpcGxpY2F0aW9uIHZlcnN1cyB0aGUgbGVuZ3RocyBvZiB0aGUgdHdvIGFycmF5cy5cbiAgICBmdW5jdGlvbiB1c2VLYXJhdHN1YmEobDEsIGwyKSB7XG4gICAgICAgIHJldHVybiAtMC4wMTIgKiBsMSAtIDAuMDEyICogbDIgKyAwLjAwMDAxNSAqIGwxICogbDIgPiAwO1xuICAgIH1cblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFyIHZhbHVlLCBuID0gcGFyc2VWYWx1ZSh2KSxcbiAgICAgICAgICAgIGEgPSB0aGlzLnZhbHVlLCBiID0gbi52YWx1ZSxcbiAgICAgICAgICAgIHNpZ24gPSB0aGlzLnNpZ24gIT09IG4uc2lnbixcbiAgICAgICAgICAgIGFicztcbiAgICAgICAgaWYgKG4uaXNTbWFsbCkge1xuICAgICAgICAgICAgaWYgKGIgPT09IDApIHJldHVybiBJbnRlZ2VyWzBdO1xuICAgICAgICAgICAgaWYgKGIgPT09IDEpIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgaWYgKGIgPT09IC0xKSByZXR1cm4gdGhpcy5uZWdhdGUoKTtcbiAgICAgICAgICAgIGFicyA9IE1hdGguYWJzKGIpO1xuICAgICAgICAgICAgaWYgKGFicyA8IEJBU0UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlTbWFsbChhLCBhYnMpLCBzaWduKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGIgPSBzbWFsbFRvQXJyYXkoYWJzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXNlS2FyYXRzdWJhKGEubGVuZ3RoLCBiLmxlbmd0aCkpIC8vIEthcmF0c3ViYSBpcyBvbmx5IGZhc3RlciBmb3IgY2VydGFpbiBhcnJheSBzaXplc1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKG11bHRpcGx5S2FyYXRzdWJhKGEsIGIpLCBzaWduKTtcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKG11bHRpcGx5TG9uZyhhLCBiKSwgc2lnbik7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRpbWVzID0gQmlnSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHk7XG5cbiAgICBmdW5jdGlvbiBtdWx0aXBseVNtYWxsQW5kQXJyYXkoYSwgYiwgc2lnbikgeyAvLyBhID49IDBcbiAgICAgICAgaWYgKGEgPCBCQVNFKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlTbWFsbChiLCBhKSwgc2lnbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKG11bHRpcGx5TG9uZyhiLCBzbWFsbFRvQXJyYXkoYSkpLCBzaWduKTtcbiAgICB9XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5fbXVsdGlwbHlCeVNtYWxsID0gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIGlmIChpc1ByZWNpc2UoYS52YWx1ZSAqIHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIoYS52YWx1ZSAqIHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG11bHRpcGx5U21hbGxBbmRBcnJheShNYXRoLmFicyhhLnZhbHVlKSwgc21hbGxUb0FycmF5KE1hdGguYWJzKHRoaXMudmFsdWUpKSwgdGhpcy5zaWduICE9PSBhLnNpZ24pO1xuICAgIH07XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuX211bHRpcGx5QnlTbWFsbCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICBpZiAoYS52YWx1ZSA9PT0gMCkgcmV0dXJuIEludGVnZXJbMF07XG4gICAgICAgICAgICBpZiAoYS52YWx1ZSA9PT0gMSkgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICBpZiAoYS52YWx1ZSA9PT0gLTEpIHJldHVybiB0aGlzLm5lZ2F0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIG11bHRpcGx5U21hbGxBbmRBcnJheShNYXRoLmFicyhhLnZhbHVlKSwgdGhpcy52YWx1ZSwgdGhpcy5zaWduICE9PSBhLnNpZ24pO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiBwYXJzZVZhbHVlKHYpLl9tdWx0aXBseUJ5U21hbGwodGhpcyk7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnRpbWVzID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseTtcblxuICAgIGZ1bmN0aW9uIHNxdWFyZShhKSB7XG4gICAgICAgIHZhciBsID0gYS5sZW5ndGgsXG4gICAgICAgICAgICByID0gY3JlYXRlQXJyYXkobCArIGwpLFxuICAgICAgICAgICAgYmFzZSA9IEJBU0UsXG4gICAgICAgICAgICBwcm9kdWN0LCBjYXJyeSwgaSwgYV9pLCBhX2o7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGFfaSA9IGFbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGw7IGorKykge1xuICAgICAgICAgICAgICAgIGFfaiA9IGFbal07XG4gICAgICAgICAgICAgICAgcHJvZHVjdCA9IGFfaSAqIGFfaiArIHJbaSArIGpdO1xuICAgICAgICAgICAgICAgIGNhcnJ5ID0gTWF0aC5mbG9vcihwcm9kdWN0IC8gYmFzZSk7XG4gICAgICAgICAgICAgICAgcltpICsgal0gPSBwcm9kdWN0IC0gY2FycnkgKiBiYXNlO1xuICAgICAgICAgICAgICAgIHJbaSArIGogKyAxXSArPSBjYXJyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0cmltKHIpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zcXVhcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihzcXVhcmUodGhpcy52YWx1ZSksIGZhbHNlKTtcbiAgICB9O1xuXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zcXVhcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWUgKiB0aGlzLnZhbHVlO1xuICAgICAgICBpZiAoaXNQcmVjaXNlKHZhbHVlKSkgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUpO1xuICAgICAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIoc3F1YXJlKHNtYWxsVG9BcnJheShNYXRoLmFicyh0aGlzLnZhbHVlKSkpLCBmYWxzZSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGRpdk1vZDEoYSwgYikgeyAvLyBMZWZ0IG92ZXIgZnJvbSBwcmV2aW91cyB2ZXJzaW9uLiBQZXJmb3JtcyBmYXN0ZXIgdGhhbiBkaXZNb2QyIG9uIHNtYWxsZXIgaW5wdXQgc2l6ZXMuXG4gICAgICAgIHZhciBhX2wgPSBhLmxlbmd0aCxcbiAgICAgICAgICAgIGJfbCA9IGIubGVuZ3RoLFxuICAgICAgICAgICAgYmFzZSA9IEJBU0UsXG4gICAgICAgICAgICByZXN1bHQgPSBjcmVhdGVBcnJheShiLmxlbmd0aCksXG4gICAgICAgICAgICBkaXZpc29yTW9zdFNpZ25pZmljYW50RGlnaXQgPSBiW2JfbCAtIDFdLFxuICAgICAgICAgICAgLy8gbm9ybWFsaXphdGlvblxuICAgICAgICAgICAgbGFtYmRhID0gTWF0aC5jZWlsKGJhc2UgLyAoMiAqIGRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCkpLFxuICAgICAgICAgICAgcmVtYWluZGVyID0gbXVsdGlwbHlTbWFsbChhLCBsYW1iZGEpLFxuICAgICAgICAgICAgZGl2aXNvciA9IG11bHRpcGx5U21hbGwoYiwgbGFtYmRhKSxcbiAgICAgICAgICAgIHF1b3RpZW50RGlnaXQsIHNoaWZ0LCBjYXJyeSwgYm9ycm93LCBpLCBsLCBxO1xuICAgICAgICBpZiAocmVtYWluZGVyLmxlbmd0aCA8PSBhX2wpIHJlbWFpbmRlci5wdXNoKDApO1xuICAgICAgICBkaXZpc29yLnB1c2goMCk7XG4gICAgICAgIGRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCA9IGRpdmlzb3JbYl9sIC0gMV07XG4gICAgICAgIGZvciAoc2hpZnQgPSBhX2wgLSBiX2w7IHNoaWZ0ID49IDA7IHNoaWZ0LS0pIHtcbiAgICAgICAgICAgIHF1b3RpZW50RGlnaXQgPSBiYXNlIC0gMTtcbiAgICAgICAgICAgIGlmIChyZW1haW5kZXJbc2hpZnQgKyBiX2xdICE9PSBkaXZpc29yTW9zdFNpZ25pZmljYW50RGlnaXQpIHtcbiAgICAgICAgICAgICAgcXVvdGllbnREaWdpdCA9IE1hdGguZmxvb3IoKHJlbWFpbmRlcltzaGlmdCArIGJfbF0gKiBiYXNlICsgcmVtYWluZGVyW3NoaWZ0ICsgYl9sIC0gMV0pIC8gZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHF1b3RpZW50RGlnaXQgPD0gYmFzZSAtIDFcbiAgICAgICAgICAgIGNhcnJ5ID0gMDtcbiAgICAgICAgICAgIGJvcnJvdyA9IDA7XG4gICAgICAgICAgICBsID0gZGl2aXNvci5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY2FycnkgKz0gcXVvdGllbnREaWdpdCAqIGRpdmlzb3JbaV07XG4gICAgICAgICAgICAgICAgcSA9IE1hdGguZmxvb3IoY2FycnkgLyBiYXNlKTtcbiAgICAgICAgICAgICAgICBib3Jyb3cgKz0gcmVtYWluZGVyW3NoaWZ0ICsgaV0gLSAoY2FycnkgLSBxICogYmFzZSk7XG4gICAgICAgICAgICAgICAgY2FycnkgPSBxO1xuICAgICAgICAgICAgICAgIGlmIChib3Jyb3cgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlcltzaGlmdCArIGldID0gYm9ycm93ICsgYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgYm9ycm93ID0gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyW3NoaWZ0ICsgaV0gPSBib3Jyb3c7XG4gICAgICAgICAgICAgICAgICAgIGJvcnJvdyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKGJvcnJvdyAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHF1b3RpZW50RGlnaXQgLT0gMTtcbiAgICAgICAgICAgICAgICBjYXJyeSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjYXJyeSArPSByZW1haW5kZXJbc2hpZnQgKyBpXSAtIGJhc2UgKyBkaXZpc29yW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FycnkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXJbc2hpZnQgKyBpXSA9IGNhcnJ5ICsgYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcnJ5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlcltzaGlmdCArIGldID0gY2Fycnk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJyeSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYm9ycm93ICs9IGNhcnJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W3NoaWZ0XSA9IHF1b3RpZW50RGlnaXQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGVub3JtYWxpemF0aW9uXG4gICAgICAgIHJlbWFpbmRlciA9IGRpdk1vZFNtYWxsKHJlbWFpbmRlciwgbGFtYmRhKVswXTtcbiAgICAgICAgcmV0dXJuIFthcnJheVRvU21hbGwocmVzdWx0KSwgYXJyYXlUb1NtYWxsKHJlbWFpbmRlcildO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpdk1vZDIoYSwgYikgeyAvLyBJbXBsZW1lbnRhdGlvbiBpZGVhIHNoYW1lbGVzc2x5IHN0b2xlbiBmcm9tIFNpbGVudCBNYXR0J3MgbGlicmFyeSBodHRwOi8vc2lsZW50bWF0dC5jb20vYmlnaW50ZWdlci9cbiAgICAgICAgLy8gUGVyZm9ybXMgZmFzdGVyIHRoYW4gZGl2TW9kMSBvbiBsYXJnZXIgaW5wdXQgc2l6ZXMuXG4gICAgICAgIHZhciBhX2wgPSBhLmxlbmd0aCxcbiAgICAgICAgICAgIGJfbCA9IGIubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgICAgICBwYXJ0ID0gW10sXG4gICAgICAgICAgICBiYXNlID0gQkFTRSxcbiAgICAgICAgICAgIGd1ZXNzLCB4bGVuLCBoaWdoeCwgaGlnaHksIGNoZWNrO1xuICAgICAgICB3aGlsZSAoYV9sKSB7XG4gICAgICAgICAgICBwYXJ0LnVuc2hpZnQoYVstLWFfbF0pO1xuICAgICAgICAgICAgaWYgKGNvbXBhcmVBYnMocGFydCwgYikgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goMCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB4bGVuID0gcGFydC5sZW5ndGg7XG4gICAgICAgICAgICBoaWdoeCA9IHBhcnRbeGxlbiAtIDFdICogYmFzZSArIHBhcnRbeGxlbiAtIDJdO1xuICAgICAgICAgICAgaGlnaHkgPSBiW2JfbCAtIDFdICogYmFzZSArIGJbYl9sIC0gMl07XG4gICAgICAgICAgICBpZiAoeGxlbiA+IGJfbCkge1xuICAgICAgICAgICAgICAgIGhpZ2h4ID0gKGhpZ2h4ICsgMSkgKiBiYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ3Vlc3MgPSBNYXRoLmNlaWwoaGlnaHggLyBoaWdoeSk7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgY2hlY2sgPSBtdWx0aXBseVNtYWxsKGIsIGd1ZXNzKTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZUFicyhjaGVjaywgcGFydCkgPD0gMCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgZ3Vlc3MtLTtcbiAgICAgICAgICAgIH0gd2hpbGUgKGd1ZXNzKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGd1ZXNzKTtcbiAgICAgICAgICAgIHBhcnQgPSBzdWJ0cmFjdChwYXJ0LCBjaGVjayk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnJldmVyc2UoKTtcbiAgICAgICAgcmV0dXJuIFthcnJheVRvU21hbGwocmVzdWx0KSwgYXJyYXlUb1NtYWxsKHBhcnQpXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkaXZNb2RTbWFsbCh2YWx1ZSwgbGFtYmRhKSB7XG4gICAgICAgIHZhciBsZW5ndGggPSB2YWx1ZS5sZW5ndGgsXG4gICAgICAgICAgICBxdW90aWVudCA9IGNyZWF0ZUFycmF5KGxlbmd0aCksXG4gICAgICAgICAgICBiYXNlID0gQkFTRSxcbiAgICAgICAgICAgIGksIHEsIHJlbWFpbmRlciwgZGl2aXNvcjtcbiAgICAgICAgcmVtYWluZGVyID0gMDtcbiAgICAgICAgZm9yIChpID0gbGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGRpdmlzb3IgPSByZW1haW5kZXIgKiBiYXNlICsgdmFsdWVbaV07XG4gICAgICAgICAgICBxID0gdHJ1bmNhdGUoZGl2aXNvciAvIGxhbWJkYSk7XG4gICAgICAgICAgICByZW1haW5kZXIgPSBkaXZpc29yIC0gcSAqIGxhbWJkYTtcbiAgICAgICAgICAgIHF1b3RpZW50W2ldID0gcSB8IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtxdW90aWVudCwgcmVtYWluZGVyIHwgMF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGl2TW9kQW55KHNlbGYsIHYpIHtcbiAgICAgICAgdmFyIHZhbHVlLCBuID0gcGFyc2VWYWx1ZSh2KTtcbiAgICAgICAgdmFyIGEgPSBzZWxmLnZhbHVlLCBiID0gbi52YWx1ZTtcbiAgICAgICAgdmFyIHF1b3RpZW50O1xuICAgICAgICBpZiAoYiA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGRpdmlkZSBieSB6ZXJvXCIpO1xuICAgICAgICBpZiAoc2VsZi5pc1NtYWxsKSB7XG4gICAgICAgICAgICBpZiAobi5pc1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKGEgLyBiKSksIG5ldyBTbWFsbEludGVnZXIoYSAlIGIpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbSW50ZWdlclswXSwgc2VsZl07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG4uaXNTbWFsbCkge1xuICAgICAgICAgICAgaWYgKGIgPT09IDEpIHJldHVybiBbc2VsZiwgSW50ZWdlclswXV07XG4gICAgICAgICAgICBpZiAoYiA9PSAtMSkgcmV0dXJuIFtzZWxmLm5lZ2F0ZSgpLCBJbnRlZ2VyWzBdXTtcbiAgICAgICAgICAgIHZhciBhYnMgPSBNYXRoLmFicyhiKTtcbiAgICAgICAgICAgIGlmIChhYnMgPCBCQVNFKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBkaXZNb2RTbWFsbChhLCBhYnMpO1xuICAgICAgICAgICAgICAgIHF1b3RpZW50ID0gYXJyYXlUb1NtYWxsKHZhbHVlWzBdKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVtYWluZGVyID0gdmFsdWVbMV07XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuc2lnbikgcmVtYWluZGVyID0gLXJlbWFpbmRlcjtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHF1b3RpZW50ID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLnNpZ24gIT09IG4uc2lnbikgcXVvdGllbnQgPSAtcXVvdGllbnQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbbmV3IFNtYWxsSW50ZWdlcihxdW90aWVudCksIG5ldyBTbWFsbEludGVnZXIocmVtYWluZGVyKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBbbmV3IEJpZ0ludGVnZXIocXVvdGllbnQsIHNlbGYuc2lnbiAhPT0gbi5zaWduKSwgbmV3IFNtYWxsSW50ZWdlcihyZW1haW5kZXIpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGIgPSBzbWFsbFRvQXJyYXkoYWJzKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29tcGFyaXNvbiA9IGNvbXBhcmVBYnMoYSwgYik7XG4gICAgICAgIGlmIChjb21wYXJpc29uID09PSAtMSkgcmV0dXJuIFtJbnRlZ2VyWzBdLCBzZWxmXTtcbiAgICAgICAgaWYgKGNvbXBhcmlzb24gPT09IDApIHJldHVybiBbSW50ZWdlcltzZWxmLnNpZ24gPT09IG4uc2lnbiA/IDEgOiAtMV0sIEludGVnZXJbMF1dO1xuXG4gICAgICAgIC8vIGRpdk1vZDEgaXMgZmFzdGVyIG9uIHNtYWxsZXIgaW5wdXQgc2l6ZXNcbiAgICAgICAgaWYgKGEubGVuZ3RoICsgYi5sZW5ndGggPD0gMjAwKVxuICAgICAgICAgICAgdmFsdWUgPSBkaXZNb2QxKGEsIGIpO1xuICAgICAgICBlbHNlIHZhbHVlID0gZGl2TW9kMihhLCBiKTtcblxuICAgICAgICBxdW90aWVudCA9IHZhbHVlWzBdO1xuICAgICAgICB2YXIgcVNpZ24gPSBzZWxmLnNpZ24gIT09IG4uc2lnbixcbiAgICAgICAgICAgIG1vZCA9IHZhbHVlWzFdLFxuICAgICAgICAgICAgbVNpZ24gPSBzZWxmLnNpZ247XG4gICAgICAgIGlmICh0eXBlb2YgcXVvdGllbnQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGlmIChxU2lnbikgcXVvdGllbnQgPSAtcXVvdGllbnQ7XG4gICAgICAgICAgICBxdW90aWVudCA9IG5ldyBTbWFsbEludGVnZXIocXVvdGllbnQpO1xuICAgICAgICB9IGVsc2UgcXVvdGllbnQgPSBuZXcgQmlnSW50ZWdlcihxdW90aWVudCwgcVNpZ24pO1xuICAgICAgICBpZiAodHlwZW9mIG1vZCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgaWYgKG1TaWduKSBtb2QgPSAtbW9kO1xuICAgICAgICAgICAgbW9kID0gbmV3IFNtYWxsSW50ZWdlcihtb2QpO1xuICAgICAgICB9IGVsc2UgbW9kID0gbmV3IEJpZ0ludGVnZXIobW9kLCBtU2lnbik7XG4gICAgICAgIHJldHVybiBbcXVvdGllbnQsIG1vZF07XG4gICAgfVxuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZGl2bW9kID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGRpdk1vZEFueSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHF1b3RpZW50OiByZXN1bHRbMF0sXG4gICAgICAgICAgICByZW1haW5kZXI6IHJlc3VsdFsxXVxuICAgICAgICB9O1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZtb2QgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZtb2Q7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbiAodikge1xuICAgICAgICByZXR1cm4gZGl2TW9kQW55KHRoaXMsIHYpWzBdO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5vdmVyID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGUgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5vdmVyID0gQmlnSW50ZWdlci5wcm90b3R5cGUuZGl2aWRlO1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubW9kID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgcmV0dXJuIGRpdk1vZEFueSh0aGlzLCB2KVsxXTtcbiAgICB9O1xuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUucmVtYWluZGVyID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tb2QgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5yZW1haW5kZXIgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2Q7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3cgPSBmdW5jdGlvbiAodikge1xuICAgICAgICB2YXIgbiA9IHBhcnNlVmFsdWUodiksXG4gICAgICAgICAgICBhID0gdGhpcy52YWx1ZSxcbiAgICAgICAgICAgIGIgPSBuLnZhbHVlLFxuICAgICAgICAgICAgdmFsdWUsIHgsIHk7XG4gICAgICAgIGlmIChiID09PSAwKSByZXR1cm4gSW50ZWdlclsxXTtcbiAgICAgICAgaWYgKGEgPT09IDApIHJldHVybiBJbnRlZ2VyWzBdO1xuICAgICAgICBpZiAoYSA9PT0gMSkgcmV0dXJuIEludGVnZXJbMV07XG4gICAgICAgIGlmIChhID09PSAtMSkgcmV0dXJuIG4uaXNFdmVuKCkgPyBJbnRlZ2VyWzFdIDogSW50ZWdlclstMV07XG4gICAgICAgIGlmIChuLnNpZ24pIHtcbiAgICAgICAgICAgIHJldHVybiBJbnRlZ2VyWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbi5pc1NtYWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgZXhwb25lbnQgXCIgKyBuLnRvU3RyaW5nKCkgKyBcIiBpcyB0b28gbGFyZ2UuXCIpO1xuICAgICAgICBpZiAodGhpcy5pc1NtYWxsKSB7XG4gICAgICAgICAgICBpZiAoaXNQcmVjaXNlKHZhbHVlID0gTWF0aC5wb3coYSwgYikpKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgeCA9IHRoaXM7XG4gICAgICAgIHkgPSBJbnRlZ2VyWzFdO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgaWYgKGIgJiAxID09PSAxKSB7XG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XG4gICAgICAgICAgICAgICAgLS1iO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGIgPT09IDApIGJyZWFrO1xuICAgICAgICAgICAgYiAvPSAyO1xuICAgICAgICAgICAgeCA9IHguc3F1YXJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHk7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnBvdyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLnBvdztcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdyA9IGZ1bmN0aW9uIChleHAsIG1vZCkge1xuICAgICAgICBleHAgPSBwYXJzZVZhbHVlKGV4cCk7XG4gICAgICAgIG1vZCA9IHBhcnNlVmFsdWUobW9kKTtcbiAgICAgICAgaWYgKG1vZC5pc1plcm8oKSkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHRha2UgbW9kUG93IHdpdGggbW9kdWx1cyAwXCIpO1xuICAgICAgICB2YXIgciA9IEludGVnZXJbMV0sXG4gICAgICAgICAgICBiYXNlID0gdGhpcy5tb2QobW9kKTtcbiAgICAgICAgd2hpbGUgKGV4cC5pc1Bvc2l0aXZlKCkpIHtcbiAgICAgICAgICAgIGlmIChiYXNlLmlzWmVybygpKSByZXR1cm4gSW50ZWdlclswXTtcbiAgICAgICAgICAgIGlmIChleHAuaXNPZGQoKSkgciA9IHIubXVsdGlwbHkoYmFzZSkubW9kKG1vZCk7XG4gICAgICAgICAgICBleHAgPSBleHAuZGl2aWRlKDIpO1xuICAgICAgICAgICAgYmFzZSA9IGJhc2Uuc3F1YXJlKCkubW9kKG1vZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLm1vZFBvdyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdztcblxuICAgIGZ1bmN0aW9uIGNvbXBhcmVBYnMoYSwgYikge1xuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5sZW5ndGggPiBiLmxlbmd0aCA/IDEgOiAtMTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiBhW2ldID4gYltpXSA/IDEgOiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlQWJzID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFyIG4gPSBwYXJzZVZhbHVlKHYpLFxuICAgICAgICAgICAgYSA9IHRoaXMudmFsdWUsXG4gICAgICAgICAgICBiID0gbi52YWx1ZTtcbiAgICAgICAgaWYgKG4uaXNTbWFsbCkgcmV0dXJuIDE7XG4gICAgICAgIHJldHVybiBjb21wYXJlQWJzKGEsIGIpO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlQWJzID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFyIG4gPSBwYXJzZVZhbHVlKHYpLFxuICAgICAgICAgICAgYSA9IE1hdGguYWJzKHRoaXMudmFsdWUpLFxuICAgICAgICAgICAgYiA9IG4udmFsdWU7XG4gICAgICAgIGlmIChuLmlzU21hbGwpIHtcbiAgICAgICAgICAgIGIgPSBNYXRoLmFicyhiKTtcbiAgICAgICAgICAgIHJldHVybiBhID09PSBiID8gMCA6IGEgPiBiID8gMSA6IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIC8vIFNlZSBkaXNjdXNzaW9uIGFib3V0IGNvbXBhcmlzb24gd2l0aCBJbmZpbml0eTpcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BldGVyb2xzb24vQmlnSW50ZWdlci5qcy9pc3N1ZXMvNjFcbiAgICAgICAgaWYgKHYgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHYgPT09IC1JbmZpbml0eSkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbiA9IHBhcnNlVmFsdWUodiksXG4gICAgICAgICAgICBhID0gdGhpcy52YWx1ZSxcbiAgICAgICAgICAgIGIgPSBuLnZhbHVlO1xuICAgICAgICBpZiAodGhpcy5zaWduICE9PSBuLnNpZ24pIHtcbiAgICAgICAgICAgIHJldHVybiBuLnNpZ24gPyAxIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG4uaXNTbWFsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2lnbiA/IC0xIDogMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcGFyZUFicyhhLCBiKSAqICh0aGlzLnNpZ24gPyAtMSA6IDEpO1xuICAgIH07XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZVRvID0gQmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZTtcblxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIGlmICh2ID09PSBJbmZpbml0eSkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2ID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG4gPSBwYXJzZVZhbHVlKHYpLFxuICAgICAgICAgICAgYSA9IHRoaXMudmFsdWUsXG4gICAgICAgICAgICBiID0gbi52YWx1ZTtcbiAgICAgICAgaWYgKG4uaXNTbWFsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGEgPT0gYiA/IDAgOiBhID4gYiA/IDEgOiAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYSA8IDAgIT09IG4uc2lnbikge1xuICAgICAgICAgICAgcmV0dXJuIGEgPCAwID8gLTEgOiAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhIDwgMCA/IDEgOiAtMTtcbiAgICB9O1xuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZVRvID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlO1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZSh2KSA9PT0gMDtcbiAgICB9O1xuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuZXEgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmVxdWFscyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLmVxID0gQmlnSW50ZWdlci5wcm90b3R5cGUuZXF1YWxzO1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubm90RXF1YWxzID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZSh2KSAhPT0gMDtcbiAgICB9O1xuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUubmVxID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5ub3RFcXVhbHMgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZXEgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ub3RFcXVhbHM7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZSh2KSA+IDA7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLmd0ID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyID0gQmlnSW50ZWdlci5wcm90b3R5cGUuZ3QgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyO1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubGVzc2VyID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZSh2KSA8IDA7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLmx0ID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXIgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5sdCA9IEJpZ0ludGVnZXIucHJvdG90eXBlLmxlc3NlcjtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmdyZWF0ZXJPckVxdWFscyA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmUodikgPj0gMDtcbiAgICB9O1xuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ2VxID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyT3JFcXVhbHMgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5nZXEgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyT3JFcXVhbHM7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXJPckVxdWFscyA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmUodikgPD0gMDtcbiAgICB9O1xuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUubGVxID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXJPckVxdWFscyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLmxlcSA9IEJpZ0ludGVnZXIucHJvdG90eXBlLmxlc3Nlck9yRXF1YWxzO1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNFdmVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMudmFsdWVbMF0gJiAxKSA9PT0gMDtcbiAgICB9O1xuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNFdmVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMudmFsdWUgJiAxKSA9PT0gMDtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNPZGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy52YWx1ZVswXSAmIDEpID09PSAxO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc09kZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnZhbHVlICYgMSkgPT09IDE7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzUG9zaXRpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5zaWduO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1Bvc2l0aXZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA+IDA7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzTmVnYXRpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNpZ247XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLmlzTmVnYXRpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlIDwgMDtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNVbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLmlzVW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMudmFsdWUpID09PSAxO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1plcm8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNaZXJvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gMDtcbiAgICB9O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzRGl2aXNpYmxlQnkgPSBmdW5jdGlvbiAodikge1xuICAgICAgICB2YXIgbiA9IHBhcnNlVmFsdWUodik7XG4gICAgICAgIHZhciB2YWx1ZSA9IG4udmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodmFsdWUgPT09IDEpIHJldHVybiB0cnVlO1xuICAgICAgICBpZiAodmFsdWUgPT09IDIpIHJldHVybiB0aGlzLmlzRXZlbigpO1xuICAgICAgICByZXR1cm4gdGhpcy5tb2QobikuZXF1YWxzKEludGVnZXJbMF0pO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc0RpdmlzaWJsZUJ5ID0gQmlnSW50ZWdlci5wcm90b3R5cGUuaXNEaXZpc2libGVCeTtcblxuICAgIGZ1bmN0aW9uIGlzQmFzaWNQcmltZSh2KSB7XG4gICAgICAgIHZhciBuID0gdi5hYnMoKTtcbiAgICAgICAgaWYgKG4uaXNVbml0KCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKG4uZXF1YWxzKDIpIHx8IG4uZXF1YWxzKDMpIHx8IG4uZXF1YWxzKDUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKG4uaXNFdmVuKCkgfHwgbi5pc0RpdmlzaWJsZUJ5KDMpIHx8IG4uaXNEaXZpc2libGVCeSg1KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAobi5sZXNzZXIoMjUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gd2UgZG9uJ3Qga25vdyBpZiBpdCdzIHByaW1lOiBsZXQgdGhlIG90aGVyIGZ1bmN0aW9ucyBmaWd1cmUgaXQgb3V0XG4gICAgfVxuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcmltZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGlzUHJpbWUgPSBpc0Jhc2ljUHJpbWUodGhpcyk7XG4gICAgICAgIGlmIChpc1ByaW1lICE9PSB1bmRlZmluZWQpIHJldHVybiBpc1ByaW1lO1xuICAgICAgICB2YXIgbiA9IHRoaXMuYWJzKCksXG4gICAgICAgICAgICBuUHJldiA9IG4ucHJldigpO1xuICAgICAgICB2YXIgYSA9IFsyLCAzLCA1LCA3LCAxMSwgMTMsIDE3LCAxOV0sXG4gICAgICAgICAgICBiID0gblByZXYsXG4gICAgICAgICAgICBkLCB0LCBpLCB4O1xuICAgICAgICB3aGlsZSAoYi5pc0V2ZW4oKSkgYiA9IGIuZGl2aWRlKDIpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgeCA9IGJpZ0ludChhW2ldKS5tb2RQb3coYiwgbik7XG4gICAgICAgICAgICBpZiAoeC5lcXVhbHMoSW50ZWdlclsxXSkgfHwgeC5lcXVhbHMoblByZXYpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGZvciAodCA9IHRydWUsIGQgPSBiOyB0ICYmIGQubGVzc2VyKG5QcmV2KSA7IGQgPSBkLm11bHRpcGx5KDIpKSB7XG4gICAgICAgICAgICAgICAgeCA9IHguc3F1YXJlKCkubW9kKG4pO1xuICAgICAgICAgICAgICAgIGlmICh4LmVxdWFscyhuUHJldikpIHQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLmlzUHJpbWUgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1ByaW1lO1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lID0gZnVuY3Rpb24gKGl0ZXJhdGlvbnMpIHtcbiAgICAgICAgdmFyIGlzUHJpbWUgPSBpc0Jhc2ljUHJpbWUodGhpcyk7XG4gICAgICAgIGlmIChpc1ByaW1lICE9PSB1bmRlZmluZWQpIHJldHVybiBpc1ByaW1lO1xuICAgICAgICB2YXIgbiA9IHRoaXMuYWJzKCk7XG4gICAgICAgIHZhciB0ID0gaXRlcmF0aW9ucyA9PT0gdW5kZWZpbmVkID8gNSA6IGl0ZXJhdGlvbnM7XG4gICAgICAgIC8vIHVzZSB0aGUgRmVybWF0IHByaW1hbGl0eSB0ZXN0XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYSA9IGJpZ0ludC5yYW5kQmV0d2VlbigyLCBuLm1pbnVzKDIpKTtcbiAgICAgICAgICAgIGlmICghYS5tb2RQb3cobi5wcmV2KCksIG4pLmlzVW5pdCgpKSByZXR1cm4gZmFsc2U7IC8vIGRlZmluaXRlbHkgY29tcG9zaXRlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIGxhcmdlIGNoYW5jZSBvZiBiZWluZyBwcmltZVxuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWUgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWU7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgICBpZiAodGhpcy5zaWduKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VidHJhY3RTbWFsbCh2YWx1ZSwgMSwgdGhpcy5zaWduKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkU21hbGwodmFsdWUsIDEpLCB0aGlzLnNpZ24pO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgKyAxIDwgTUFYX0lOVCkgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUgKyAxKTtcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKE1BWF9JTlRfQVJSLCBmYWxzZSk7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnByZXYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnNpZ24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbCh2YWx1ZSwgMSksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdWJ0cmFjdFNtYWxsKHZhbHVlLCAxLCB0aGlzLnNpZ24pO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgLSAxID4gLU1BWF9JTlQpIHJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHZhbHVlIC0gMSk7XG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihNQVhfSU5UX0FSUiwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIHZhciBwb3dlcnNPZlR3byA9IFsxXTtcbiAgICB3aGlsZSAocG93ZXJzT2ZUd29bcG93ZXJzT2ZUd28ubGVuZ3RoIC0gMV0gPD0gQkFTRSkgcG93ZXJzT2ZUd28ucHVzaCgyICogcG93ZXJzT2ZUd29bcG93ZXJzT2ZUd28ubGVuZ3RoIC0gMV0pO1xuICAgIHZhciBwb3dlcnMyTGVuZ3RoID0gcG93ZXJzT2ZUd28ubGVuZ3RoLCBoaWdoZXN0UG93ZXIyID0gcG93ZXJzT2ZUd29bcG93ZXJzMkxlbmd0aCAtIDFdO1xuXG4gICAgZnVuY3Rpb24gc2hpZnRfaXNTbWFsbChuKSB7XG4gICAgICAgIHJldHVybiAoKHR5cGVvZiBuID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiBuID09PSBcInN0cmluZ1wiKSAmJiArTWF0aC5hYnMobikgPD0gQkFTRSkgfHxcbiAgICAgICAgICAgIChuIGluc3RhbmNlb2YgQmlnSW50ZWdlciAmJiBuLnZhbHVlLmxlbmd0aCA8PSAxKTtcbiAgICB9XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQgPSBmdW5jdGlvbiAobikge1xuICAgICAgICBpZiAoIXNoaWZ0X2lzU21hbGwobikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihTdHJpbmcobikgKyBcIiBpcyB0b28gbGFyZ2UgZm9yIHNoaWZ0aW5nLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBuID0gK247XG4gICAgICAgIGlmIChuIDwgMCkgcmV0dXJuIHRoaXMuc2hpZnRSaWdodCgtbik7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzO1xuICAgICAgICB3aGlsZSAobiA+PSBwb3dlcnMyTGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQubXVsdGlwbHkoaGlnaGVzdFBvd2VyMik7XG4gICAgICAgICAgICBuIC09IHBvd2VyczJMZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQubXVsdGlwbHkocG93ZXJzT2ZUd29bbl0pO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQ7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdFJpZ2h0ID0gZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgdmFyIHJlbVF1bztcbiAgICAgICAgaWYgKCFzaGlmdF9pc1NtYWxsKG4pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoU3RyaW5nKG4pICsgXCIgaXMgdG9vIGxhcmdlIGZvciBzaGlmdGluZy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgbiA9ICtuO1xuICAgICAgICBpZiAobiA8IDApIHJldHVybiB0aGlzLnNoaWZ0TGVmdCgtbik7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzO1xuICAgICAgICB3aGlsZSAobiA+PSBwb3dlcnMyTGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0LmlzWmVybygpKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgcmVtUXVvID0gZGl2TW9kQW55KHJlc3VsdCwgaGlnaGVzdFBvd2VyMik7XG4gICAgICAgICAgICByZXN1bHQgPSByZW1RdW9bMV0uaXNOZWdhdGl2ZSgpID8gcmVtUXVvWzBdLnByZXYoKSA6IHJlbVF1b1swXTtcbiAgICAgICAgICAgIG4gLT0gcG93ZXJzMkxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmVtUXVvID0gZGl2TW9kQW55KHJlc3VsdCwgcG93ZXJzT2ZUd29bbl0pO1xuICAgICAgICByZXR1cm4gcmVtUXVvWzFdLmlzTmVnYXRpdmUoKSA/IHJlbVF1b1swXS5wcmV2KCkgOiByZW1RdW9bMF07XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdFJpZ2h0O1xuXG4gICAgZnVuY3Rpb24gYml0d2lzZSh4LCB5LCBmbikge1xuICAgICAgICB5ID0gcGFyc2VWYWx1ZSh5KTtcbiAgICAgICAgdmFyIHhTaWduID0geC5pc05lZ2F0aXZlKCksIHlTaWduID0geS5pc05lZ2F0aXZlKCk7XG4gICAgICAgIHZhciB4UmVtID0geFNpZ24gPyB4Lm5vdCgpIDogeCxcbiAgICAgICAgICAgIHlSZW0gPSB5U2lnbiA/IHkubm90KCkgOiB5O1xuICAgICAgICB2YXIgeEJpdHMgPSBbXSwgeUJpdHMgPSBbXTtcbiAgICAgICAgdmFyIHhTdG9wID0gZmFsc2UsIHlTdG9wID0gZmFsc2U7XG4gICAgICAgIHdoaWxlICgheFN0b3AgfHwgIXlTdG9wKSB7XG4gICAgICAgICAgICBpZiAoeFJlbS5pc1plcm8oKSkgeyAvLyB2aXJ0dWFsIHNpZ24gZXh0ZW5zaW9uIGZvciBzaW11bGF0aW5nIHR3bydzIGNvbXBsZW1lbnRcbiAgICAgICAgICAgICAgICB4U3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgeEJpdHMucHVzaCh4U2lnbiA/IDEgOiAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHhTaWduKSB4Qml0cy5wdXNoKHhSZW0uaXNFdmVuKCkgPyAxIDogMCk7IC8vIHR3bydzIGNvbXBsZW1lbnQgZm9yIG5lZ2F0aXZlIG51bWJlcnNcbiAgICAgICAgICAgIGVsc2UgeEJpdHMucHVzaCh4UmVtLmlzRXZlbigpID8gMCA6IDEpO1xuXG4gICAgICAgICAgICBpZiAoeVJlbS5pc1plcm8oKSkge1xuICAgICAgICAgICAgICAgIHlTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB5Qml0cy5wdXNoKHlTaWduID8gMSA6IDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoeVNpZ24pIHlCaXRzLnB1c2goeVJlbS5pc0V2ZW4oKSA/IDEgOiAwKTtcbiAgICAgICAgICAgIGVsc2UgeUJpdHMucHVzaCh5UmVtLmlzRXZlbigpID8gMCA6IDEpO1xuXG4gICAgICAgICAgICB4UmVtID0geFJlbS5vdmVyKDIpO1xuICAgICAgICAgICAgeVJlbSA9IHlSZW0ub3ZlcigyKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeEJpdHMubGVuZ3RoOyBpKyspIHJlc3VsdC5wdXNoKGZuKHhCaXRzW2ldLCB5Qml0c1tpXSkpO1xuICAgICAgICB2YXIgc3VtID0gYmlnSW50KHJlc3VsdC5wb3AoKSkubmVnYXRlKCkudGltZXMoYmlnSW50KDIpLnBvdyhyZXN1bHQubGVuZ3RoKSk7XG4gICAgICAgIHdoaWxlIChyZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgICAgICBzdW0gPSBzdW0uYWRkKGJpZ0ludChyZXN1bHQucG9wKCkpLnRpbWVzKGJpZ0ludCgyKS5wb3cocmVzdWx0Lmxlbmd0aCkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VtO1xuICAgIH1cblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm5vdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVnYXRlKCkucHJldigpO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5ub3QgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ub3Q7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbmQgPSBmdW5jdGlvbiAobikge1xuICAgICAgICByZXR1cm4gYml0d2lzZSh0aGlzLCBuLCBmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYSAmIGI7IH0pO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hbmQgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbmQ7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5vciA9IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgIHJldHVybiBiaXR3aXNlKHRoaXMsIG4sIGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhIHwgYjsgfSk7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLm9yID0gQmlnSW50ZWdlci5wcm90b3R5cGUub3I7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbiAobikge1xuICAgICAgICByZXR1cm4gYml0d2lzZSh0aGlzLCBuLCBmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYSBeIGI7IH0pO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS54b3IgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS54b3I7XG5cbiAgICB2YXIgTE9CTUFTS19JID0gMSA8PCAzMCwgTE9CTUFTS19CSSA9IChCQVNFICYgLUJBU0UpICogKEJBU0UgJiAtQkFTRSkgfCBMT0JNQVNLX0k7XG4gICAgZnVuY3Rpb24gcm91Z2hMT0IobikgeyAvLyBnZXQgbG93ZXN0T25lQml0IChyb3VnaClcbiAgICAgICAgLy8gU21hbGxJbnRlZ2VyOiByZXR1cm4gTWluKGxvd2VzdE9uZUJpdChuKSwgMSA8PCAzMClcbiAgICAgICAgLy8gQmlnSW50ZWdlcjogcmV0dXJuIE1pbihsb3dlc3RPbmVCaXQobiksIDEgPDwgMTQpIFtCQVNFPTFlN11cbiAgICAgICAgdmFyIHYgPSBuLnZhbHVlLCB4ID0gdHlwZW9mIHYgPT09IFwibnVtYmVyXCIgPyB2IHwgTE9CTUFTS19JIDogdlswXSArIHZbMV0gKiBCQVNFIHwgTE9CTUFTS19CSTtcbiAgICAgICAgcmV0dXJuIHggJiAteDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXgoYSwgYikge1xuICAgICAgICBhID0gcGFyc2VWYWx1ZShhKTtcbiAgICAgICAgYiA9IHBhcnNlVmFsdWUoYik7XG4gICAgICAgIHJldHVybiBhLmdyZWF0ZXIoYikgPyBhIDogYjtcbiAgICB9XG4gICAgZnVuY3Rpb24gbWluKGEsYikge1xuICAgICAgICBhID0gcGFyc2VWYWx1ZShhKTtcbiAgICAgICAgYiA9IHBhcnNlVmFsdWUoYik7XG4gICAgICAgIHJldHVybiBhLmxlc3NlcihiKSA/IGEgOiBiO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnY2QoYSwgYikge1xuICAgICAgICBhID0gcGFyc2VWYWx1ZShhKS5hYnMoKTtcbiAgICAgICAgYiA9IHBhcnNlVmFsdWUoYikuYWJzKCk7XG4gICAgICAgIGlmIChhLmVxdWFscyhiKSkgcmV0dXJuIGE7XG4gICAgICAgIGlmIChhLmlzWmVybygpKSByZXR1cm4gYjtcbiAgICAgICAgaWYgKGIuaXNaZXJvKCkpIHJldHVybiBhO1xuICAgICAgICB2YXIgYyA9IEludGVnZXJbMV0sIGQsIHQ7XG4gICAgICAgIHdoaWxlIChhLmlzRXZlbigpICYmIGIuaXNFdmVuKCkpIHtcbiAgICAgICAgICAgIGQgPSBNYXRoLm1pbihyb3VnaExPQihhKSwgcm91Z2hMT0IoYikpO1xuICAgICAgICAgICAgYSA9IGEuZGl2aWRlKGQpO1xuICAgICAgICAgICAgYiA9IGIuZGl2aWRlKGQpO1xuICAgICAgICAgICAgYyA9IGMubXVsdGlwbHkoZCk7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGEuaXNFdmVuKCkpIHtcbiAgICAgICAgICAgIGEgPSBhLmRpdmlkZShyb3VnaExPQihhKSk7XG4gICAgICAgIH1cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgd2hpbGUgKGIuaXNFdmVuKCkpIHtcbiAgICAgICAgICAgICAgICBiID0gYi5kaXZpZGUocm91Z2hMT0IoYikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGEuZ3JlYXRlcihiKSkge1xuICAgICAgICAgICAgICAgIHQgPSBiOyBiID0gYTsgYSA9IHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiID0gYi5zdWJ0cmFjdChhKTtcbiAgICAgICAgfSB3aGlsZSAoIWIuaXNaZXJvKCkpO1xuICAgICAgICByZXR1cm4gYy5pc1VuaXQoKSA/IGEgOiBhLm11bHRpcGx5KGMpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBsY20oYSwgYikge1xuICAgICAgICBhID0gcGFyc2VWYWx1ZShhKS5hYnMoKTtcbiAgICAgICAgYiA9IHBhcnNlVmFsdWUoYikuYWJzKCk7XG4gICAgICAgIHJldHVybiBhLmRpdmlkZShnY2QoYSwgYikpLm11bHRpcGx5KGIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByYW5kQmV0d2VlbihhLCBiKSB7XG4gICAgICAgIGEgPSBwYXJzZVZhbHVlKGEpO1xuICAgICAgICBiID0gcGFyc2VWYWx1ZShiKTtcbiAgICAgICAgdmFyIGxvdyA9IG1pbihhLCBiKSwgaGlnaCA9IG1heChhLCBiKTtcbiAgICAgICAgdmFyIHJhbmdlID0gaGlnaC5zdWJ0cmFjdChsb3cpO1xuICAgICAgICBpZiAocmFuZ2UuaXNTbWFsbCkgcmV0dXJuIGxvdy5hZGQoTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogcmFuZ2UpKTtcbiAgICAgICAgdmFyIGxlbmd0aCA9IHJhbmdlLnZhbHVlLmxlbmd0aCAtIDE7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXSwgcmVzdHJpY3RlZCA9IHRydWU7XG4gICAgICAgIGZvciAodmFyIGkgPSBsZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICB2YXIgdG9wID0gcmVzdHJpY3RlZCA/IHJhbmdlLnZhbHVlW2ldIDogQkFTRTtcbiAgICAgICAgICAgIHZhciBkaWdpdCA9IHRydW5jYXRlKE1hdGgucmFuZG9tKCkgKiB0b3ApO1xuICAgICAgICAgICAgcmVzdWx0LnVuc2hpZnQoZGlnaXQpO1xuICAgICAgICAgICAgaWYgKGRpZ2l0IDwgdG9wKSByZXN0cmljdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gYXJyYXlUb1NtYWxsKHJlc3VsdCk7XG4gICAgICAgIHJldHVybiBsb3cuYWRkKHR5cGVvZiByZXN1bHQgPT09IFwibnVtYmVyXCIgPyBuZXcgU21hbGxJbnRlZ2VyKHJlc3VsdCkgOiBuZXcgQmlnSW50ZWdlcihyZXN1bHQsIGZhbHNlKSk7XG4gICAgfVxuICAgIHZhciBwYXJzZUJhc2UgPSBmdW5jdGlvbiAodGV4dCwgYmFzZSkge1xuICAgICAgICB2YXIgdmFsID0gSW50ZWdlclswXSwgcG93ID0gSW50ZWdlclsxXSxcbiAgICAgICAgICAgIGxlbmd0aCA9IHRleHQubGVuZ3RoO1xuICAgICAgICBpZiAoMiA8PSBiYXNlICYmIGJhc2UgPD0gMzYpIHtcbiAgICAgICAgICAgIGlmIChsZW5ndGggPD0gTE9HX01BWF9JTlQgLyBNYXRoLmxvZyhiYXNlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHBhcnNlSW50KHRleHQsIGJhc2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBiYXNlID0gcGFyc2VWYWx1ZShiYXNlKTtcbiAgICAgICAgdmFyIGRpZ2l0cyA9IFtdO1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIGlzTmVnYXRpdmUgPSB0ZXh0WzBdID09PSBcIi1cIjtcbiAgICAgICAgZm9yIChpID0gaXNOZWdhdGl2ZSA/IDEgOiAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGMgPSB0ZXh0W2ldLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgY2hhckNvZGUgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICBpZiAoNDggPD0gY2hhckNvZGUgJiYgY2hhckNvZGUgPD0gNTcpIGRpZ2l0cy5wdXNoKHBhcnNlVmFsdWUoYykpO1xuICAgICAgICAgICAgZWxzZSBpZiAoOTcgPD0gY2hhckNvZGUgJiYgY2hhckNvZGUgPD0gMTIyKSBkaWdpdHMucHVzaChwYXJzZVZhbHVlKGMuY2hhckNvZGVBdCgwKSAtIDg3KSk7XG4gICAgICAgICAgICBlbHNlIGlmIChjID09PSBcIjxcIikge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IGk7XG4gICAgICAgICAgICAgICAgZG8geyBpKys7IH0gd2hpbGUgKHRleHRbaV0gIT09IFwiPlwiKTtcbiAgICAgICAgICAgICAgICBkaWdpdHMucHVzaChwYXJzZVZhbHVlKHRleHQuc2xpY2Uoc3RhcnQgKyAxLCBpKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoYyArIFwiIGlzIG5vdCBhIHZhbGlkIGNoYXJhY3RlclwiKTtcbiAgICAgICAgfVxuICAgICAgICBkaWdpdHMucmV2ZXJzZSgpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZGlnaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YWwgPSB2YWwuYWRkKGRpZ2l0c1tpXS50aW1lcyhwb3cpKTtcbiAgICAgICAgICAgIHBvdyA9IHBvdy50aW1lcyhiYXNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNOZWdhdGl2ZSA/IHZhbC5uZWdhdGUoKSA6IHZhbDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc3RyaW5naWZ5KGRpZ2l0KSB7XG4gICAgICAgIHZhciB2ID0gZGlnaXQudmFsdWU7XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gXCJudW1iZXJcIikgdiA9IFt2XTtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSAxICYmIHZbMF0gPD0gMzUpIHtcbiAgICAgICAgICAgIHJldHVybiBcIjAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiLmNoYXJBdCh2WzBdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCI8XCIgKyB2ICsgXCI+XCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvQmFzZShuLCBiYXNlKSB7XG4gICAgICAgIGJhc2UgPSBiaWdJbnQoYmFzZSk7XG4gICAgICAgIGlmIChiYXNlLmlzWmVybygpKSB7XG4gICAgICAgICAgICBpZiAobi5pc1plcm8oKSkgcmV0dXJuIFwiMFwiO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNvbnZlcnQgbm9uemVybyBudW1iZXJzIHRvIGJhc2UgMC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJhc2UuZXF1YWxzKC0xKSkge1xuICAgICAgICAgICAgaWYgKG4uaXNaZXJvKCkpIHJldHVybiBcIjBcIjtcbiAgICAgICAgICAgIGlmIChuLmlzTmVnYXRpdmUoKSkgcmV0dXJuIG5ldyBBcnJheSgxIC0gbikuam9pbihcIjEwXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiMVwiICsgbmV3IEFycmF5KCtuKS5qb2luKFwiMDFcIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1pbnVzU2lnbiA9IFwiXCI7XG4gICAgICAgIGlmIChuLmlzTmVnYXRpdmUoKSAmJiBiYXNlLmlzUG9zaXRpdmUoKSkge1xuICAgICAgICAgICAgbWludXNTaWduID0gXCItXCI7XG4gICAgICAgICAgICBuID0gbi5hYnMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmFzZS5lcXVhbHMoMSkpIHtcbiAgICAgICAgICAgIGlmIChuLmlzWmVybygpKSByZXR1cm4gXCIwXCI7XG4gICAgICAgICAgICByZXR1cm4gbWludXNTaWduICsgbmV3IEFycmF5KCtuICsgMSkuam9pbigxKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgb3V0ID0gW107XG4gICAgICAgIHZhciBsZWZ0ID0gbiwgZGl2bW9kO1xuICAgICAgICB3aGlsZSAobGVmdC5pc05lZ2F0aXZlKCkgfHwgbGVmdC5jb21wYXJlQWJzKGJhc2UpID49IDApIHtcbiAgICAgICAgICAgIGRpdm1vZCA9IGxlZnQuZGl2bW9kKGJhc2UpO1xuICAgICAgICAgICAgbGVmdCA9IGRpdm1vZC5xdW90aWVudDtcbiAgICAgICAgICAgIHZhciBkaWdpdCA9IGRpdm1vZC5yZW1haW5kZXI7XG4gICAgICAgICAgICBpZiAoZGlnaXQuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgICAgICAgICAgZGlnaXQgPSBiYXNlLm1pbnVzKGRpZ2l0KS5hYnMoKTtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdC5uZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXQucHVzaChzdHJpbmdpZnkoZGlnaXQpKTtcbiAgICAgICAgfVxuICAgICAgICBvdXQucHVzaChzdHJpbmdpZnkobGVmdCkpO1xuICAgICAgICByZXR1cm4gbWludXNTaWduICsgb3V0LnJldmVyc2UoKS5qb2luKFwiXCIpO1xuICAgIH1cblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKHJhZGl4KSB7XG4gICAgICAgIGlmIChyYWRpeCA9PT0gdW5kZWZpbmVkKSByYWRpeCA9IDEwO1xuICAgICAgICBpZiAocmFkaXggIT09IDEwKSByZXR1cm4gdG9CYXNlKHRoaXMsIHJhZGl4KTtcbiAgICAgICAgdmFyIHYgPSB0aGlzLnZhbHVlLCBsID0gdi5sZW5ndGgsIHN0ciA9IFN0cmluZyh2Wy0tbF0pLCB6ZXJvcyA9IFwiMDAwMDAwMFwiLCBkaWdpdDtcbiAgICAgICAgd2hpbGUgKC0tbCA+PSAwKSB7XG4gICAgICAgICAgICBkaWdpdCA9IFN0cmluZyh2W2xdKTtcbiAgICAgICAgICAgIHN0ciArPSB6ZXJvcy5zbGljZShkaWdpdC5sZW5ndGgpICsgZGlnaXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNpZ24gPSB0aGlzLnNpZ24gPyBcIi1cIiA6IFwiXCI7XG4gICAgICAgIHJldHVybiBzaWduICsgc3RyO1xuICAgIH07XG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChyYWRpeCkge1xuICAgICAgICBpZiAocmFkaXggPT09IHVuZGVmaW5lZCkgcmFkaXggPSAxMDtcbiAgICAgICAgaWYgKHJhZGl4ICE9IDEwKSByZXR1cm4gdG9CYXNlKHRoaXMsIHJhZGl4KTtcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICt0aGlzLnRvU3RyaW5nKCk7XG4gICAgfTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50b0pTTnVtYmVyID0gQmlnSW50ZWdlci5wcm90b3R5cGUudmFsdWVPZjtcblxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfTtcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNOdW1iZXIgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLnZhbHVlT2Y7XG4gICAgXG4gICAgZnVuY3Rpb24gcGFyc2VTdHJpbmdWYWx1ZSh2KSB7XG4gICAgICAgICAgICBpZiAoaXNQcmVjaXNlKCt2KSkge1xuICAgICAgICAgICAgICAgIHZhciB4ID0gK3Y7XG4gICAgICAgICAgICAgICAgaWYgKHggPT09IHRydW5jYXRlKHgpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih4KTtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludmFsaWQgaW50ZWdlcjogXCIgKyB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNpZ24gPSB2WzBdID09PSBcIi1cIjtcbiAgICAgICAgICAgIGlmIChzaWduKSB2ID0gdi5zbGljZSgxKTtcbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHYuc3BsaXQoL2UvaSk7XG4gICAgICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID4gMikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnRlZ2VyOiBcIiArIHNwbGl0LmpvaW4oXCJlXCIpKTtcbiAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXhwID0gc3BsaXRbMV07XG4gICAgICAgICAgICAgICAgaWYgKGV4cFswXSA9PT0gXCIrXCIpIGV4cCA9IGV4cC5zbGljZSgxKTtcbiAgICAgICAgICAgICAgICBleHAgPSArZXhwO1xuICAgICAgICAgICAgICAgIGlmIChleHAgIT09IHRydW5jYXRlKGV4cCkgfHwgIWlzUHJlY2lzZShleHApKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGludGVnZXI6IFwiICsgZXhwICsgXCIgaXMgbm90IGEgdmFsaWQgZXhwb25lbnQuXCIpO1xuICAgICAgICAgICAgICAgIHZhciB0ZXh0ID0gc3BsaXRbMF07XG4gICAgICAgICAgICAgICAgdmFyIGRlY2ltYWxQbGFjZSA9IHRleHQuaW5kZXhPZihcIi5cIik7XG4gICAgICAgICAgICAgICAgaWYgKGRlY2ltYWxQbGFjZSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cCAtPSB0ZXh0Lmxlbmd0aCAtIGRlY2ltYWxQbGFjZSAtIDE7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnNsaWNlKDAsIGRlY2ltYWxQbGFjZSkgKyB0ZXh0LnNsaWNlKGRlY2ltYWxQbGFjZSArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXhwIDwgMCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGluY2x1ZGUgbmVnYXRpdmUgZXhwb25lbnQgcGFydCBmb3IgaW50ZWdlcnNcIik7XG4gICAgICAgICAgICAgICAgdGV4dCArPSAobmV3IEFycmF5KGV4cCArIDEpKS5qb2luKFwiMFwiKTtcbiAgICAgICAgICAgICAgICB2ID0gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpc1ZhbGlkID0gL14oWzAtOV1bMC05XSopJC8udGVzdCh2KTtcbiAgICAgICAgICAgIGlmICghaXNWYWxpZCkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnRlZ2VyOiBcIiArIHYpO1xuICAgICAgICAgICAgdmFyIHIgPSBbXSwgbWF4ID0gdi5sZW5ndGgsIGwgPSBMT0dfQkFTRSwgbWluID0gbWF4IC0gbDtcbiAgICAgICAgICAgIHdoaWxlIChtYXggPiAwKSB7XG4gICAgICAgICAgICAgICAgci5wdXNoKCt2LnNsaWNlKG1pbiwgbWF4KSk7XG4gICAgICAgICAgICAgICAgbWluIC09IGw7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA8IDApIG1pbiA9IDA7XG4gICAgICAgICAgICAgICAgbWF4IC09IGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmltKHIpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHIsIHNpZ24pO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBwYXJzZU51bWJlclZhbHVlKHYpIHtcbiAgICAgICAgaWYgKGlzUHJlY2lzZSh2KSkge1xuICAgICAgICAgICAgaWYgKHYgIT09IHRydW5jYXRlKHYpKSB0aHJvdyBuZXcgRXJyb3IodiArIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJzZVN0cmluZ1ZhbHVlKHYudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlTnVtYmVyVmFsdWUodik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VTdHJpbmdWYWx1ZSh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgLy8gUHJlLWRlZmluZSBudW1iZXJzIGluIHJhbmdlIFstOTk5LDk5OV1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwMDA7IGkrKykge1xuICAgICAgICBJbnRlZ2VyW2ldID0gbmV3IFNtYWxsSW50ZWdlcihpKTtcbiAgICAgICAgaWYgKGkgPiAwKSBJbnRlZ2VyWy1pXSA9IG5ldyBTbWFsbEludGVnZXIoLWkpO1xuICAgIH1cbiAgICAvLyBCYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICAgIEludGVnZXIub25lID0gSW50ZWdlclsxXTtcbiAgICBJbnRlZ2VyLnplcm8gPSBJbnRlZ2VyWzBdO1xuICAgIEludGVnZXIubWludXNPbmUgPSBJbnRlZ2VyWy0xXTtcbiAgICBJbnRlZ2VyLm1heCA9IG1heDtcbiAgICBJbnRlZ2VyLm1pbiA9IG1pbjtcbiAgICBJbnRlZ2VyLmdjZCA9IGdjZDtcbiAgICBJbnRlZ2VyLmxjbSA9IGxjbTtcbiAgICBJbnRlZ2VyLmlzSW5zdGFuY2UgPSBmdW5jdGlvbiAoeCkgeyByZXR1cm4geCBpbnN0YW5jZW9mIEJpZ0ludGVnZXIgfHwgeCBpbnN0YW5jZW9mIFNtYWxsSW50ZWdlcjsgfTtcbiAgICBJbnRlZ2VyLnJhbmRCZXR3ZWVuID0gcmFuZEJldHdlZW47XG4gICAgcmV0dXJuIEludGVnZXI7XG59KSgpO1xuXG4vLyBOb2RlLmpzIGNoZWNrXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuaGFzT3duUHJvcGVydHkoXCJleHBvcnRzXCIpKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBiaWdJbnQ7XG59XG4iXSwibmFtZXMiOlsiYmlnSW50IiwidW5kZWZpbmVkIiwiQkFTRSIsIkxPR19CQVNFIiwiTUFYX0lOVCIsIk1BWF9JTlRfQVJSIiwic21hbGxUb0FycmF5IiwiTE9HX01BWF9JTlQiLCJNYXRoIiwibG9nIiwiSW50ZWdlciIsInYiLCJyYWRpeCIsInBhcnNlVmFsdWUiLCJwYXJzZUJhc2UiLCJCaWdJbnRlZ2VyIiwidmFsdWUiLCJzaWduIiwiaXNTbWFsbCIsInByb3RvdHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsIlNtYWxsSW50ZWdlciIsImlzUHJlY2lzZSIsIm4iLCJmbG9vciIsImFycmF5VG9TbWFsbCIsImFyciIsInRyaW0iLCJsZW5ndGgiLCJjb21wYXJlQWJzIiwiaSIsImNyZWF0ZUFycmF5IiwieCIsIkFycmF5IiwidHJ1bmNhdGUiLCJjZWlsIiwiYWRkIiwiYSIsImIiLCJsX2EiLCJsX2IiLCJyIiwiY2FycnkiLCJiYXNlIiwic3VtIiwicHVzaCIsImFkZEFueSIsImFkZFNtYWxsIiwibCIsInN1YnRyYWN0IiwibmVnYXRlIiwiYWJzIiwicGx1cyIsImFfbCIsImJfbCIsImJvcnJvdyIsImRpZmZlcmVuY2UiLCJzdWJ0cmFjdEFueSIsInN1YnRyYWN0U21hbGwiLCJtaW51cyIsInNtYWxsIiwibXVsdGlwbHlMb25nIiwicHJvZHVjdCIsImFfaSIsImJfaiIsImoiLCJtdWx0aXBseVNtYWxsIiwic2hpZnRMZWZ0IiwiY29uY2F0IiwibXVsdGlwbHlLYXJhdHN1YmEiLCJ5IiwibWF4Iiwic2xpY2UiLCJkIiwiYyIsImFjIiwiYmQiLCJhYmNkIiwidXNlS2FyYXRzdWJhIiwibDEiLCJsMiIsIm11bHRpcGx5IiwidGltZXMiLCJtdWx0aXBseVNtYWxsQW5kQXJyYXkiLCJfbXVsdGlwbHlCeVNtYWxsIiwic3F1YXJlIiwiYV9qIiwiZGl2TW9kMSIsInJlc3VsdCIsImRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCIsImxhbWJkYSIsInJlbWFpbmRlciIsImRpdmlzb3IiLCJxdW90aWVudERpZ2l0Iiwic2hpZnQiLCJxIiwiZGl2TW9kU21hbGwiLCJkaXZNb2QyIiwicGFydCIsImd1ZXNzIiwieGxlbiIsImhpZ2h4IiwiaGlnaHkiLCJjaGVjayIsInVuc2hpZnQiLCJyZXZlcnNlIiwicXVvdGllbnQiLCJkaXZNb2RBbnkiLCJzZWxmIiwiRXJyb3IiLCJjb21wYXJpc29uIiwicVNpZ24iLCJtb2QiLCJtU2lnbiIsImRpdm1vZCIsImRpdmlkZSIsIm92ZXIiLCJwb3ciLCJpc0V2ZW4iLCJ0b1N0cmluZyIsIm1vZFBvdyIsImV4cCIsImlzWmVybyIsImlzUG9zaXRpdmUiLCJpc09kZCIsImNvbXBhcmUiLCJJbmZpbml0eSIsImNvbXBhcmVUbyIsImVxdWFscyIsImVxIiwibm90RXF1YWxzIiwibmVxIiwiZ3JlYXRlciIsImd0IiwibGVzc2VyIiwibHQiLCJncmVhdGVyT3JFcXVhbHMiLCJnZXEiLCJsZXNzZXJPckVxdWFscyIsImxlcSIsImlzTmVnYXRpdmUiLCJpc1VuaXQiLCJpc0RpdmlzaWJsZUJ5IiwiaXNCYXNpY1ByaW1lIiwiaXNQcmltZSIsIm5QcmV2IiwicHJldiIsInQiLCJpc1Byb2JhYmxlUHJpbWUiLCJpdGVyYXRpb25zIiwicmFuZEJldHdlZW4iLCJuZXh0IiwicG93ZXJzT2ZUd28iLCJwb3dlcnMyTGVuZ3RoIiwiaGlnaGVzdFBvd2VyMiIsInNoaWZ0X2lzU21hbGwiLCJTdHJpbmciLCJzaGlmdFJpZ2h0IiwicmVtUXVvIiwiYml0d2lzZSIsImZuIiwieFNpZ24iLCJ5U2lnbiIsInhSZW0iLCJub3QiLCJ5UmVtIiwieEJpdHMiLCJ5Qml0cyIsInhTdG9wIiwieVN0b3AiLCJwb3AiLCJhbmQiLCJvciIsInhvciIsIkxPQk1BU0tfSSIsIkxPQk1BU0tfQkkiLCJyb3VnaExPQiIsIm1pbiIsImdjZCIsImxjbSIsImxvdyIsImhpZ2giLCJyYW5nZSIsInJvdW5kIiwicmFuZG9tIiwicmVzdHJpY3RlZCIsInRvcCIsImRpZ2l0IiwidGV4dCIsInZhbCIsInBhcnNlSW50IiwiZGlnaXRzIiwidG9Mb3dlckNhc2UiLCJjaGFyQ29kZSIsImNoYXJDb2RlQXQiLCJzdGFydCIsInN0cmluZ2lmeSIsImNoYXJBdCIsInRvQmFzZSIsImpvaW4iLCJtaW51c1NpZ24iLCJvdXQiLCJsZWZ0Iiwic3RyIiwiemVyb3MiLCJ2YWx1ZU9mIiwidG9KU051bWJlciIsInBhcnNlU3RyaW5nVmFsdWUiLCJzcGxpdCIsImRlY2ltYWxQbGFjZSIsImluZGV4T2YiLCJpc1ZhbGlkIiwidGVzdCIsInBhcnNlTnVtYmVyVmFsdWUiLCJvbmUiLCJ6ZXJvIiwibWludXNPbmUiLCJpc0luc3RhbmNlIiwibW9kdWxlIiwiaGFzT3duUHJvcGVydHkiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxTQUFTLEFBQUMsU0FBVUMsU0FBUztJQUM3QjtJQUVBLElBQUlDLE9BQU8sS0FDUEMsV0FBVyxHQUNYQyxVQUFVLGtCQUNWQyxjQUFjQyxhQUFhRixVQUMzQkcsY0FBY0MsS0FBS0MsR0FBRyxDQUFDTDtJQUUzQixTQUFTTSxRQUFRQyxDQUFDLEVBQUVDLEtBQUs7UUFDckIsSUFBSSxPQUFPRCxNQUFNLGFBQWEsT0FBT0QsT0FBTyxDQUFDLEVBQUU7UUFDL0MsSUFBSSxPQUFPRSxVQUFVLGFBQWEsT0FBTyxDQUFDQSxVQUFVLEtBQUtDLFdBQVdGLEtBQUtHLFVBQVVILEdBQUdDO1FBQ3RGLE9BQU9DLFdBQVdGO0lBQ3RCO0lBRUEsU0FBU0ksV0FBV0MsS0FBSyxFQUFFQyxJQUFJO1FBQzNCLElBQUksQ0FBQ0QsS0FBSyxHQUFHQTtRQUNiLElBQUksQ0FBQ0MsSUFBSSxHQUFHQTtRQUNaLElBQUksQ0FBQ0Ms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