/*
 *  big.js v6.2.1
 *  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
 *  Copyright (c) 2022 Michael Mclaughlin
 *  https://github.com/MikeMcl/big.js/LICENCE.md
 */ /************************************** EDITABLE DEFAULTS *****************************************/ // The default values below must be integers within the stated ranges.
/*
   * The maximum number of decimal places (DP) of the results of operations involving division:
   * div and sqrt, and pow with negative exponents.
   */ var DP = 20, /*
   * The rounding mode (RM) used when rounding to the above decimal places.
   *
   *  0  Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
   *  1  To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
   *  2  To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
   *  3  Away from zero.                                  (ROUND_UP)
   */ RM = 1, // The maximum value of DP and Big.DP.
MAX_DP = 1E6, // The maximum magnitude of the exponent argument to the pow method.
MAX_POWER = 1E6, /*
   * The negative exponent (NE) at and beneath which toString returns exponential notation.
   * (JavaScript numbers: -7)
   * -1000000 is the minimum recommended exponent value of a Big.
   */ NE = -7, /*
   * The positive exponent (PE) at and above which toString returns exponential notation.
   * (JavaScript numbers: 21)
   * 1000000 is the maximum recommended exponent value of a Big, but this limit is not enforced.
   */ PE = 21, /*
   * When true, an error will be thrown if a primitive number is passed to the Big constructor,
   * or if valueOf is called, or if toNumber is called on a Big which cannot be converted to a
   * primitive number without a loss of precision.
   */ STRICT = false, /**************************************************************************************************/ // Error messages.
NAME = '[big.js] ', INVALID = NAME + 'Invalid ', INVALID_DP = INVALID + 'decimal places', INVALID_RM = INVALID + 'rounding mode', DIV_BY_ZERO = NAME + 'Division by zero', // The shared prototype object.
P = {}, UNDEFINED = void 0, NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
/*
 * Create and return a Big constructor.
 */ function _Big_() {
    /*
   * The Big constructor and exported function.
   * Create and return a new instance of a Big number object.
   *
   * n {number|string|Big} A numeric value.
   */ function Big(n) {
        var x = this;
        // Enable constructor usage without new.
        if (!(x instanceof Big)) return n === UNDEFINED ? _Big_() : new Big(n);
        // Duplicate.
        if (n instanceof Big) {
            x.s = n.s;
            x.e = n.e;
            x.c = n.c.slice();
        } else {
            if (typeof n !== 'string') {
                if (Big.strict === true && typeof n !== 'bigint') {
                    throw TypeError(INVALID + 'value');
                }
                // Minus zero?
                n = n === 0 && 1 / n < 0 ? '-0' : String(n);
            }
            parse(x, n);
        }
        // Retain a reference to this Big constructor.
        // Shadow Big.prototype.constructor which points to Object.
        x.constructor = Big;
    }
    Big.prototype = P;
    Big.DP = DP;
    Big.RM = RM;
    Big.NE = NE;
    Big.PE = PE;
    Big.strict = STRICT;
    Big.roundDown = 0;
    Big.roundHalfUp = 1;
    Big.roundHalfEven = 2;
    Big.roundUp = 3;
    return Big;
}
/*
 * Parse the number or string value passed to a Big constructor.
 *
 * x {Big} A Big number instance.
 * n {number|string} A numeric value.
 */ function parse(x, n) {
    var e, i, nl;
    if (!NUMERIC.test(n)) {
        throw Error(INVALID + 'number');
    }
    // Determine sign.
    x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;
    // Decimal point?
    if ((e = n.indexOf('.')) > -1) n = n.replace('.', '');
    // Exponential form?
    if ((i = n.search(/e/i)) > 0) {
        // Determine exponent.
        if (e < 0) e = i;
        e += +n.slice(i + 1);
        n = n.substring(0, i);
    } else if (e < 0) {
        // Integer.
        e = n.length;
    }
    nl = n.length;
    // Determine leading zeros.
    for(i = 0; i < nl && n.charAt(i) == '0';)++i;
    if (i == nl) {
        // Zero.
        x.c = [
            x.e = 0
        ];
    } else {
        // Determine trailing zeros.
        for(; nl > 0 && n.charAt(--nl) == '0';);
        x.e = e - i - 1;
        x.c = [];
        // Convert string to array of digits without leading/trailing zeros.
        for(e = 0; i <= nl;)x.c[e++] = +n.charAt(i++);
    }
    return x;
}
/*
 * Round Big x to a maximum of sd significant digits using rounding mode rm.
 *
 * x {Big} The Big to round.
 * sd {number} Significant digits: integer, 0 to MAX_DP inclusive.
 * rm {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
 * [more] {boolean} Whether the result of division was truncated.
 */ function round(x, sd, rm, more) {
    var xc = x.c;
    if (rm === UNDEFINED) rm = x.constructor.RM;
    if (rm !== 0 && rm !== 1 && rm !== 2 && rm !== 3) {
        throw Error(INVALID_RM);
    }
    if (sd < 1) {
        more = rm === 3 && (more || !!xc[0]) || sd === 0 && (rm === 1 && xc[0] >= 5 || rm === 2 && (xc[0] > 5 || xc[0] === 5 && (more || xc[1] !== UNDEFINED)));
        xc.length = 1;
        if (more) {
            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
            x.e = x.e - sd + 1;
            xc[0] = 1;
        } else {
            // Zero.
            xc[0] = x.e = 0;
        }
    } else if (sd < xc.length) {
        // xc[sd] is the digit after the digit that may be rounded up.
        more = rm === 1 && xc[sd] >= 5 || rm === 2 && (xc[sd] > 5 || xc[sd] === 5 && (more || xc[sd + 1] !== UNDEFINED || xc[sd - 1] & 1)) || rm === 3 && (more || !!xc[0]);
        // Remove any digits after the required precision.
        xc.length = sd;
        // Round up?
        if (more) {
            // Rounding up may mean the previous digit has to be rounded up.
            for(; ++xc[--sd] > 9;){
                xc[sd] = 0;
                if (sd === 0) {
                    ++x.e;
                    xc.unshift(1);
                    break;
                }
            }
        }
        // Remove trailing zeros.
        for(sd = xc.length; !xc[--sd];)xc.pop();
    }
    return x;
}
/*
 * Return a string representing the value of Big x in normal or exponential notation.
 * Handles P.toExponential, P.toFixed, P.toJSON, P.toPrecision, P.toString and P.valueOf.
 */ function stringify(x, doExponential, isNonzero) {
    var e = x.e, s = x.c.join(''), n = s.length;
    // Exponential notation?
    if (doExponential) {
        s = s.charAt(0) + (n > 1 ? '.' + s.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;
    // Normal notation.
    } else if (e < 0) {
        for(; ++e;)s = '0' + s;
        s = '0.' + s;
    } else if (e > 0) {
        if (++e > n) {
            for(e -= n; e--;)s += '0';
        } else if (e < n) {
            s = s.slice(0, e) + '.' + s.slice(e);
        }
    } else if (n > 1) {
        s = s.charAt(0) + '.' + s.slice(1);
    }
    return x.s < 0 && isNonzero ? '-' + s : s;
}
// Prototype/instance methods
/*
 * Return a new Big whose value is the absolute value of this Big.
 */ P.abs = function() {
    var x = new this.constructor(this);
    x.s = 1;
    return x;
};
/*
 * Return 1 if the value of this Big is greater than the value of Big y,
 *       -1 if the value of this Big is less than the value of Big y, or
 *        0 if they have the same value.
 */ P.cmp = function(y) {
    var isneg, x = this, xc = x.c, yc = (y = new x.constructor(y)).c, i = x.s, j = y.s, k = x.e, l = y.e;
    // Either zero?
    if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -j : i;
    // Signs differ?
    if (i != j) return i;
    isneg = i < 0;
    // Compare exponents.
    if (k != l) return k > l ^ isneg ? 1 : -1;
    j = (k = xc.length) < (l = yc.length) ? k : l;
    // Compare digit by digit.
    for(i = -1; ++i < j;){
        if (xc[i] != yc[i]) return xc[i] > yc[i] ^ isneg ? 1 : -1;
    }
    // Compare lengths.
    return k == l ? 0 : k > l ^ isneg ? 1 : -1;
};
/*
 * Return a new Big whose value is the value of this Big divided by the value of Big y, rounded,
 * if necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
 */ P.div = function(y) {
    var x = this, Big = x.constructor, a = x.c, b = (y = new Big(y)).c, k = x.s == y.s ? 1 : -1, dp = Big.DP;
    if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
        throw Error(INVALID_DP);
    }
    // Divisor is zero?
    if (!b[0]) {
        throw Error(DIV_BY_ZERO);
    }
    // Dividend is 0? Return +-0.
    if (!a[0]) {
        y.s = k;
        y.c = [
            y.e = 0
        ];
        return y;
    }
    var bl, bt, n, cmp, ri, bz = b.slice(), ai = bl = b.length, al = a.length, r = a.slice(0, bl), rl = r.length, q = y, qc = q.c = [], qi = 0, p = dp + (q.e = x.e - y.e) + 1; // precision of the result
    q.s = k;
    k = p < 0 ? 0 : p;
    // Create version of divisor with leading zero.
    bz.unshift(0);
    // Add zeros to make remainder as long as divisor.
    for(; rl++ < bl;)r.push(0);
    do {
        // n is how many times the divisor goes into current remainder.
        for(n = 0; n < 10; n++){
            // Compare divisor and remainder.
            if (bl != (rl = r.length)) {
                cmp = bl > rl ? 1 : -1;
            } else {
                for(ri = -1, cmp = 0; ++ri < bl;){
                    if (b[ri] != r[ri]) {
                        cmp = b[ri] > r[ri] ? 1 : -1;
                        break;
                    }
                }
            }
            // If divisor < remainder, subtract divisor from remainder.
            if (cmp < 0) {
                // Remainder can't be more than 1 digit longer than divisor.
                // Equalise lengths using divisor with extra leading zero?
                for(bt = rl == bl ? b : bz; rl;){
                    if (r[--rl] < bt[rl]) {
                        ri = rl;
                        for(; ri && !r[--ri];)r[ri] = 9;
                        --r[ri];
                        r[rl] += 10;
                    }
                    r[rl] -= bt[rl];
                }
                for(; !r[0];)r.shift();
            } else {
                break;
            }
        }
        // Add the digit n to the result array.
        qc[qi++] = cmp ? n : ++n;
        // Update the remainder.
        if (r[0] && cmp) r[rl] = a[ai] || 0;
        else r = [
            a[ai]
        ];
    }while ((ai++ < al || r[0] !== UNDEFINED) && k--)
    // Leading zero? Do not remove if result is simply zero (qi == 1).
    if (!qc[0] && qi != 1) {
        // There can't be more than one zero.
        qc.shift();
        q.e--;
        p--;
    }
    // Round?
    if (qi > p) round(q, p, Big.RM, r[0] !== UNDEFINED);
    return q;
};
/*
 * Return true if the value of this Big is equal to the value of Big y, otherwise return false.
 */ P.eq = function(y) {
    return this.cmp(y) === 0;
};
/*
 * Return true if the value of this Big is greater than the value of Big y, otherwise return
 * false.
 */ P.gt = function(y) {
    return this.cmp(y) > 0;
};
/*
 * Return true if the value of this Big is greater than or equal to the value of Big y, otherwise
 * return false.
 */ P.gte = function(y) {
    return this.cmp(y) > -1;
};
/*
 * Return true if the value of this Big is less than the value of Big y, otherwise return false.
 */ P.lt = function(y) {
    return this.cmp(y) < 0;
};
/*
 * Return true if the value of this Big is less than or equal to the value of Big y, otherwise
 * return false.
 */ P.lte = function(y) {
    return this.cmp(y) < 1;
};
/*
 * Return a new Big whose value is the value of this Big minus the value of Big y.
 */ P.minus = P.sub = function(y) {
    var i, j, t, xlty, x = this, Big = x.constructor, a = x.s, b = (y = new Big(y)).s;
    // Signs differ?
    if (a != b) {
        y.s = -b;
        return x.plus(y);
    }
    var xc = x.c.slice(), xe = x.e, yc = y.c, ye = y.e;
    // Either zero?
    if (!xc[0] || !yc[0]) {
        if (yc[0]) {
            y.s = -b;
        } else if (xc[0]) {
            y = new Big(x);
        } else {
            y.s = 1;
        }
        return y;
    }
    // Determine which is the bigger number. Prepend zeros to equalise exponents.
    if (a = xe - ye) {
        if (xlty = a < 0) {
            a = -a;
            t = xc;
        } else {
            ye = xe;
            t = yc;
        }
        t.reverse();
        for(b = a; b--;)t.push(0);
        t.reverse();
    } else {
        // Exponents equal. Check digit by digit.
        j = ((xlty = xc.length < yc.length) ? xc : yc).length;
        for(a = b = 0; b < j; b++){
            if (xc[b] != yc[b]) {
                xlty = xc[b] < yc[b];
                break;
            }
        }
    }
    // x < y? Point xc to the array of the bigger number.
    if (xlty) {
        t = xc;
        xc = yc;
        yc = t;
        y.s = -y.s;
    }
    /*
   * Append zeros to xc if shorter. No need to add zeros to yc if shorter as subtraction only
   * needs to start at yc.length.
   */ if ((b = (j = yc.length) - (i = xc.length)) > 0) for(; b--;)xc[i++] = 0;
    // Subtract yc from xc.
    for(b = i; j > a;){
        if (xc[--j] < yc[j]) {
            for(i = j; i && !xc[--i];)xc[i] = 9;
            --xc[i];
            xc[j] += 10;
        }
        xc[j] -= yc[j];
    }
    // Remove trailing zeros.
    for(; xc[--b] === 0;)xc.pop();
    // Remove leading zeros and adjust exponent accordingly.
    for(; xc[0] === 0;){
        xc.shift();
        --ye;
    }
    if (!xc[0]) {
        // n - n = +0
        y.s = 1;
        // Result must be zero.
        xc = [
            ye = 0
        ];
    }
    y.c = xc;
    y.e = ye;
    return y;
};
/*
 * Return a new Big whose value is the value of this Big modulo the value of Big y.
 */ P.mod = function(y) {
    var ygtx, x = this, Big = x.constructor, a = x.s, b = (y = new Big(y)).s;
    if (!y.c[0]) {
        throw Error(DIV_BY_ZERO);
    }
    x.s = y.s = 1;
    ygtx = y.cmp(x) == 1;
    x.s = a;
    y.s = b;
    if (ygtx) return new Big(x);
    a = Big.DP;
    b = Big.RM;
    Big.DP = Big.RM = 0;
    x = x.div(y);
    Big.DP = a;
    Big.RM = b;
    return this.minus(x.times(y));
};
/*
 * Return a new Big whose value is the value of this Big negated.
 */ P.neg = function() {
    var x = new this.constructor(this);
    x.s = -x.s;
    return x;
};
/*
 * Return a new Big whose value is the value of this Big plus the value of Big y.
 */ P.plus = P.add = function(y) {
    var e, k, t, x = this, Big = x.constructor;
    y = new Big(y);
    // Signs differ?
    if (x.s != y.s) {
        y.s = -y.s;
        return x.minus(y);
    }
    var xe = x.e, xc = x.c, ye = y.e, yc = y.c;
    // Either zero?
    if (!xc[0] || !yc[0]) {
        if (!yc[0]) {
            if (xc[0]) {
                y = new Big(x);
            } else {
                y.s = x.s;
            }
        }
        return y;
    }
    xc = xc.slice();
    // Prepend zeros to equalise exponents.
    // Note: reverse faster than unshifts.
    if (e = xe - ye) {
        if (e > 0) {
            ye = xe;
            t = yc;
        } else {
            e = -e;
            t = xc;
        }
        t.reverse();
        for(; e--;)t.push(0);
        t.reverse();
    }
    // Point xc to the longer array.
    if (xc.length - yc.length < 0) {
        t = yc;
        yc = xc;
        xc = t;
    }
    e = yc.length;
    // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.
    for(k = 0; e; xc[e] %= 10)k = (xc[--e] = xc[e] + yc[e] + k) / 10 | 0;
    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    if (k) {
        xc.unshift(k);
        ++ye;
    }
    // Remove trailing zeros.
    for(e = xc.length; xc[--e] === 0;)xc.pop();
    y.c = xc;
    y.e = ye;
    return y;
};
/*
 * Return a Big whose value is the value of this Big raised to the power n.
 * If n is negative, round to a maximum of Big.DP decimal places using rounding
 * mode Big.RM.
 *
 * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
 */ P.pow = function(n) {
    var x = this, one = new x.constructor('1'), y = one, isneg = n < 0;
    if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
        throw Error(INVALID + 'exponent');
    }
    if (isneg) n = -n;
    for(;;){
        if (n & 1) y = y.times(x);
        n >>= 1;
        if (!n) break;
        x = x.times(x);
    }
    return isneg ? one.div(y) : y;
};
/*
 * Return a new Big whose value is the value of this Big rounded to a maximum precision of sd
 * significant digits using rounding mode rm, or Big.RM if rm is not specified.
 *
 * sd {number} Significant digits: integer, 1 to MAX_DP inclusive.
 * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
 */ P.prec = function(sd, rm) {
    if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
        throw Error(INVALID + 'precision');
    }
    return round(new this.constructor(this), sd, rm);
};
/*
 * Return a new Big whose value is the value of this Big rounded to a maximum of dp decimal places
 * using rounding mode rm, or Big.RM if rm is not specified.
 * If dp is negative, round to an integer which is a multiple of 10**-dp.
 * If dp is not specified, round to 0 decimal places.
 *
 * dp? {number} Integer, -MAX_DP to MAX_DP inclusive.
 * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
 */ P.round = function(dp, rm) {
    if (dp === UNDEFINED) dp = 0;
    else if (dp !== ~~dp || dp < -MAX_DP || dp > MAX_DP) {
        throw Error(INVALID_DP);
    }
    return round(new this.constructor(this), dp + this.e + 1, rm);
};
/*
 * Return a new Big whose value is the square root of the value of this Big, rounded, if
 * necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
 */ P.sqrt = function() {
    var r, c, t, x = this, Big = x.constructor, s = x.s, e = x.e, half = new Big('0.5');
    // Zero?
    if (!x.c[0]) return new Big(x);
    // Negative?
    if (s < 0) {
        throw Error(NAME + 'No square root');
    }
    // Estimate.
    s = Math.sqrt(x + '');
    // Math.sqrt underflow/overflow?
    // Re-estimate: pass x coefficient to Math.sqrt as integer, then adjust the result exponent.
    if (s === 0 || s === 1 / 0) {
        c = x.c.join('');
        if (!(c.length + e & 1)) c += '0';
        s = Math.sqrt(c);
        e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        r = new Big((s == 1 / 0 ? '5e' : (s = s.toExponential()).slice(0, s.indexOf('e') + 1)) + e);
    } else {
        r = new Big(s + '');
    }
    e = r.e + (Big.DP += 4);
    // Newton-Raphson iteration.
    do {
        t = r;
        r = half.times(t.plus(x.div(t)));
    }while (t.c.slice(0, e).join('') !== r.c.slice(0, e).join(''))
    return round(r, (Big.DP -= 4) + r.e + 1, Big.RM);
};
/*
 * Return a new Big whose value is the value of this Big times the value of Big y.
 */ P.times = P.mul = function(y) {
    var c, x = this, Big = x.constructor, xc = x.c, yc = (y = new Big(y)).c, a = xc.length, b = yc.length, i = x.e, j = y.e;
    // Determine sign of result.
    y.s = x.s == y.s ? 1 : -1;
    // Return signed 0 if either 0.
    if (!xc[0] || !yc[0]) {
        y.c = [
            y.e = 0
        ];
        return y;
    }
    // Initialise exponent of result as x.e + y.e.
    y.e = i + j;
    // If array xc has fewer digits than yc, swap xc and yc, and lengths.
    if (a < b) {
        c = xc;
        xc = yc;
        yc = c;
        j = a;
        a = b;
        b = j;
    }
    // Initialise coefficient array of result with zeros.
    for(c = new Array(j = a + b); j--;)c[j] = 0;
    // Multiply.
    // i is initially xc.length.
    for(i = b; i--;){
        b = 0;
        // a is yc.length.
        for(j = a + i; j > i;){
            // Current sum of products at this digit position, plus carry.
            b = c[j] + yc[i] * xc[j - i - 1] + b;
            c[j--] = b % 10;
            // carry
            b = b / 10 | 0;
        }
        c[j] = b;
    }
    // Increment result exponent if there is a final carry, otherwise remove leading zero.
    if (b) ++y.e;
    else c.shift();
    // Remove trailing zeros.
    for(i = c.length; !c[--i];)c.pop();
    y.c = c;
    return y;
};
/*
 * Return a string representing the value of this Big in exponential notation rounded to dp fixed
 * decimal places using rounding mode rm, or Big.RM if rm is not specified.
 *
 * dp? {number} Decimal places: integer, 0 to MAX_DP inclusive.
 * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
 */ P.toExponential = function(dp, rm) {
    var x = this, n = x.c[0];
    if (dp !== UNDEFINED) {
        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throw Error(INVALID_DP);
        }
        x = round(new x.constructor(x), ++dp, rm);
        for(; x.c.length < dp;)x.c.push(0);
    }
    return stringify(x, true, !!n);
};
/*
 * Return a string representing the value of this Big in normal notation rounded to dp fixed
 * decimal places using rounding mode rm, or Big.RM if rm is not specified.
 *
 * dp? {number} Decimal places: integer, 0 to MAX_DP inclusive.
 * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
 *
 * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
 * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
 */ P.toFixed = function(dp, rm) {
    var x = this, n = x.c[0];
    if (dp !== UNDEFINED) {
        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throw Error(INVALID_DP);
        }
        x = round(new x.constructor(x), dp + x.e + 1, rm);
        // x.e may have changed if the value is rounded up.
        for(dp = dp + x.e + 1; x.c.length < dp;)x.c.push(0);
    }
    return stringify(x, false, !!n);
};
/*
 * Return a string representing the value of this Big.
 * Return exponential notation if this Big has a positive exponent equal to or greater than
 * Big.PE, or a negative exponent equal to or less than Big.NE.
 * Omit the sign for negative zero.
 */ P[Symbol.for('nodejs.util.inspect.custom')] = P.toJSON = P.toString = function() {
    var x = this, Big = x.constructor;
    return stringify(x, x.e <= Big.NE || x.e >= Big.PE, !!x.c[0]);
};
/*
 * Return the value of this Big as a primitve number.
 */ P.toNumber = function() {
    var n = Number(stringify(this, true, true));
    if (this.constructor.strict === true && !this.eq(n.toString())) {
        throw Error(NAME + 'Imprecise conversion');
    }
    return n;
};
/*
 * Return a string representing the value of this Big rounded to sd significant digits using
 * rounding mode rm, or Big.RM if rm is not specified.
 * Use exponential notation if sd is less than the number of digits necessary to represent
 * the integer part of the value in normal notation.
 *
 * sd {number} Significant digits: integer, 1 to MAX_DP inclusive.
 * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
 */ P.toPrecision = function(sd, rm) {
    var x = this, Big = x.constructor, n = x.c[0];
    if (sd !== UNDEFINED) {
        if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
            throw Error(INVALID + 'precision');
        }
        x = round(new Big(x), sd, rm);
        for(; x.c.length < sd;)x.c.push(0);
    }
    return stringify(x, sd <= x.e || x.e <= Big.NE || x.e >= Big.PE, !!n);
};
/*
 * Return a string representing the value of this Big.
 * Return exponential notation if this Big has a positive exponent equal to or greater than
 * Big.PE, or a negative exponent equal to or less than Big.NE.
 * Include the sign for negative zero.
 */ P.valueOf = function() {
    var x = this, Big = x.constructor;
    if (Big.strict === true) {
        throw Error(NAME + 'valueOf disallowed');
    }
    return stringify(x, x.e <= Big.NE || x.e >= Big.PE, true);
};
// Export
export var Big = _Big_();
/// <reference types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/big.js/index.d.ts" />
export default Big;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvYmlnLTYuMi4xLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiAgYmlnLmpzIHY2LjIuMVxuICogIEEgc21hbGwsIGZhc3QsIGVhc3ktdG8tdXNlIGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gZGVjaW1hbCBhcml0aG1ldGljLlxuICogIENvcHlyaWdodCAoYykgMjAyMiBNaWNoYWVsIE1jbGF1Z2hsaW5cbiAqICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvTElDRU5DRS5tZFxuICovXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIEVESVRBQkxFIERFRkFVTFRTICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgLy8gVGhlIGRlZmF1bHQgdmFsdWVzIGJlbG93IG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBzdGF0ZWQgcmFuZ2VzLlxuXG4gIC8qXG4gICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyAoRFApIG9mIHRoZSByZXN1bHRzIG9mIG9wZXJhdGlvbnMgaW52b2x2aW5nIGRpdmlzaW9uOlxuICAgKiBkaXYgYW5kIHNxcnQsIGFuZCBwb3cgd2l0aCBuZWdhdGl2ZSBleHBvbmVudHMuXG4gICAqL1xudmFyIERQID0gMjAsICAgICAgICAgIC8vIDAgdG8gTUFYX0RQXG5cbiAgLypcbiAgICogVGhlIHJvdW5kaW5nIG1vZGUgKFJNKSB1c2VkIHdoZW4gcm91bmRpbmcgdG8gdGhlIGFib3ZlIGRlY2ltYWwgcGxhY2VzLlxuICAgKlxuICAgKiAgMCAgVG93YXJkcyB6ZXJvIChpLmUuIHRydW5jYXRlLCBubyByb3VuZGluZykuICAgICAgIChST1VORF9ET1dOKVxuICAgKiAgMSAgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCByb3VuZCB1cC4gIChST1VORF9IQUxGX1VQKVxuICAgKiAgMiAgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0byBldmVuLiAgIChST1VORF9IQUxGX0VWRU4pXG4gICAqICAzICBBd2F5IGZyb20gemVyby4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFJPVU5EX1VQKVxuICAgKi9cbiAgUk0gPSAxLCAgICAgICAgICAgICAvLyAwLCAxLCAyIG9yIDNcblxuICAvLyBUaGUgbWF4aW11bSB2YWx1ZSBvZiBEUCBhbmQgQmlnLkRQLlxuICBNQVhfRFAgPSAxRTYsICAgICAgIC8vIDAgdG8gMTAwMDAwMFxuXG4gIC8vIFRoZSBtYXhpbXVtIG1hZ25pdHVkZSBvZiB0aGUgZXhwb25lbnQgYXJndW1lbnQgdG8gdGhlIHBvdyBtZXRob2QuXG4gIE1BWF9QT1dFUiA9IDFFNiwgICAgLy8gMSB0byAxMDAwMDAwXG5cbiAgLypcbiAgICogVGhlIG5lZ2F0aXZlIGV4cG9uZW50IChORSkgYXQgYW5kIGJlbmVhdGggd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbi5cbiAgICogKEphdmFTY3JpcHQgbnVtYmVyczogLTcpXG4gICAqIC0xMDAwMDAwIGlzIHRoZSBtaW5pbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxuICAgKi9cbiAgTkUgPSAtNywgICAgICAgICAgICAvLyAwIHRvIC0xMDAwMDAwXG5cbiAgLypcbiAgICogVGhlIHBvc2l0aXZlIGV4cG9uZW50IChQRSkgYXQgYW5kIGFib3ZlIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24uXG4gICAqIChKYXZhU2NyaXB0IG51bWJlcnM6IDIxKVxuICAgKiAxMDAwMDAwIGlzIHRoZSBtYXhpbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLCBidXQgdGhpcyBsaW1pdCBpcyBub3QgZW5mb3JjZWQuXG4gICAqL1xuICBQRSA9IDIxLCAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxuXG4gIC8qXG4gICAqIFdoZW4gdHJ1ZSwgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24gaWYgYSBwcmltaXRpdmUgbnVtYmVyIGlzIHBhc3NlZCB0byB0aGUgQmlnIGNvbnN0cnVjdG9yLFxuICAgKiBvciBpZiB2YWx1ZU9mIGlzIGNhbGxlZCwgb3IgaWYgdG9OdW1iZXIgaXMgY2FsbGVkIG9uIGEgQmlnIHdoaWNoIGNhbm5vdCBiZSBjb252ZXJ0ZWQgdG8gYVxuICAgKiBwcmltaXRpdmUgbnVtYmVyIHdpdGhvdXQgYSBsb3NzIG9mIHByZWNpc2lvbi5cbiAgICovXG4gIFNUUklDVCA9IGZhbHNlLCAgICAgLy8gdHJ1ZSBvciBmYWxzZVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8vIEVycm9yIG1lc3NhZ2VzLlxuICBOQU1FID0gJ1tiaWcuanNdICcsXG4gIElOVkFMSUQgPSBOQU1FICsgJ0ludmFsaWQgJyxcbiAgSU5WQUxJRF9EUCA9IElOVkFMSUQgKyAnZGVjaW1hbCBwbGFjZXMnLFxuICBJTlZBTElEX1JNID0gSU5WQUxJRCArICdyb3VuZGluZyBtb2RlJyxcbiAgRElWX0JZX1pFUk8gPSBOQU1FICsgJ0RpdmlzaW9uIGJ5IHplcm8nLFxuXG4gIC8vIFRoZSBzaGFyZWQgcHJvdG90eXBlIG9iamVjdC5cbiAgUCA9IHt9LFxuICBVTkRFRklORUQgPSB2b2lkIDAsXG4gIE5VTUVSSUMgPSAvXi0/KFxcZCsoXFwuXFxkKik/fFxcLlxcZCspKGVbKy1dP1xcZCspPyQvaTtcblxuXG4vKlxuICogQ3JlYXRlIGFuZCByZXR1cm4gYSBCaWcgY29uc3RydWN0b3IuXG4gKi9cbmZ1bmN0aW9uIF9CaWdfKCkge1xuXG4gIC8qXG4gICAqIFRoZSBCaWcgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxuICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiBhIEJpZyBudW1iZXIgb2JqZWN0LlxuICAgKlxuICAgKiBuIHtudW1iZXJ8c3RyaW5nfEJpZ30gQSBudW1lcmljIHZhbHVlLlxuICAgKi9cbiAgZnVuY3Rpb24gQmlnKG4pIHtcbiAgICB2YXIgeCA9IHRoaXM7XG5cbiAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgdXNhZ2Ugd2l0aG91dCBuZXcuXG4gICAgaWYgKCEoeCBpbnN0YW5jZW9mIEJpZykpIHJldHVybiBuID09PSBVTkRFRklORUQgPyBfQmlnXygpIDogbmV3IEJpZyhuKTtcblxuICAgIC8vIER1cGxpY2F0ZS5cbiAgICBpZiAobiBpbnN0YW5jZW9mIEJpZykge1xuICAgICAgeC5zID0gbi5zO1xuICAgICAgeC5lID0gbi5lO1xuICAgICAgeC5jID0gbi5jLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgbiAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKEJpZy5zdHJpY3QgPT09IHRydWUgJiYgdHlwZW9mIG4gIT09ICdiaWdpbnQnKSB7XG4gICAgICAgICAgdGhyb3cgVHlwZUVycm9yKElOVkFMSUQgKyAndmFsdWUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1pbnVzIHplcm8/XG4gICAgICAgIG4gPSBuID09PSAwICYmIDEgLyBuIDwgMCA/ICctMCcgOiBTdHJpbmcobik7XG4gICAgICB9XG5cbiAgICAgIHBhcnNlKHgsIG4pO1xuICAgIH1cblxuICAgIC8vIFJldGFpbiBhIHJlZmVyZW5jZSB0byB0aGlzIEJpZyBjb25zdHJ1Y3Rvci5cbiAgICAvLyBTaGFkb3cgQmlnLnByb3RvdHlwZS5jb25zdHJ1Y3RvciB3aGljaCBwb2ludHMgdG8gT2JqZWN0LlxuICAgIHguY29uc3RydWN0b3IgPSBCaWc7XG4gIH1cblxuICBCaWcucHJvdG90eXBlID0gUDtcbiAgQmlnLkRQID0gRFA7XG4gIEJpZy5STSA9IFJNO1xuICBCaWcuTkUgPSBORTtcbiAgQmlnLlBFID0gUEU7XG4gIEJpZy5zdHJpY3QgPSBTVFJJQ1Q7XG4gIEJpZy5yb3VuZERvd24gPSAwO1xuICBCaWcucm91bmRIYWxmVXAgPSAxO1xuICBCaWcucm91bmRIYWxmRXZlbiA9IDI7XG4gIEJpZy5yb3VuZFVwID0gMztcblxuICByZXR1cm4gQmlnO1xufVxuXG5cbi8qXG4gKiBQYXJzZSB0aGUgbnVtYmVyIG9yIHN0cmluZyB2YWx1ZSBwYXNzZWQgdG8gYSBCaWcgY29uc3RydWN0b3IuXG4gKlxuICogeCB7QmlnfSBBIEJpZyBudW1iZXIgaW5zdGFuY2UuXG4gKiBuIHtudW1iZXJ8c3RyaW5nfSBBIG51bWVyaWMgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHgsIG4pIHtcbiAgdmFyIGUsIGksIG5sO1xuXG4gIGlmICghTlVNRVJJQy50ZXN0KG4pKSB7XG4gICAgdGhyb3cgRXJyb3IoSU5WQUxJRCArICdudW1iZXInKTtcbiAgfVxuXG4gIC8vIERldGVybWluZSBzaWduLlxuICB4LnMgPSBuLmNoYXJBdCgwKSA9PSAnLScgPyAobiA9IG4uc2xpY2UoMSksIC0xKSA6IDE7XG5cbiAgLy8gRGVjaW1hbCBwb2ludD9cbiAgaWYgKChlID0gbi5pbmRleE9mKCcuJykpID4gLTEpIG4gPSBuLnJlcGxhY2UoJy4nLCAnJyk7XG5cbiAgLy8gRXhwb25lbnRpYWwgZm9ybT9cbiAgaWYgKChpID0gbi5zZWFyY2goL2UvaSkpID4gMCkge1xuXG4gICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxuICAgIGlmIChlIDwgMCkgZSA9IGk7XG4gICAgZSArPSArbi5zbGljZShpICsgMSk7XG4gICAgbiA9IG4uc3Vic3RyaW5nKDAsIGkpO1xuICB9IGVsc2UgaWYgKGUgPCAwKSB7XG5cbiAgICAvLyBJbnRlZ2VyLlxuICAgIGUgPSBuLmxlbmd0aDtcbiAgfVxuXG4gIG5sID0gbi5sZW5ndGg7XG5cbiAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXG4gIGZvciAoaSA9IDA7IGkgPCBubCAmJiBuLmNoYXJBdChpKSA9PSAnMCc7KSArK2k7XG5cbiAgaWYgKGkgPT0gbmwpIHtcblxuICAgIC8vIFplcm8uXG4gICAgeC5jID0gW3guZSA9IDBdO1xuICB9IGVsc2Uge1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxuICAgIGZvciAoOyBubCA+IDAgJiYgbi5jaGFyQXQoLS1ubCkgPT0gJzAnOyk7XG4gICAgeC5lID0gZSAtIGkgLSAxO1xuICAgIHguYyA9IFtdO1xuXG4gICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cbiAgICBmb3IgKGUgPSAwOyBpIDw9IG5sOykgeC5jW2UrK10gPSArbi5jaGFyQXQoaSsrKTtcbiAgfVxuXG4gIHJldHVybiB4O1xufVxuXG5cbi8qXG4gKiBSb3VuZCBCaWcgeCB0byBhIG1heGltdW0gb2Ygc2Qgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXG4gKlxuICogeCB7QmlnfSBUaGUgQmlnIHRvIHJvdW5kLlxuICogc2Qge251bWJlcn0gU2lnbmlmaWNhbnQgZGlnaXRzOiBpbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXG4gKiBybSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlOiAwIChkb3duKSwgMSAoaGFsZi11cCksIDIgKGhhbGYtZXZlbikgb3IgMyAodXApLlxuICogW21vcmVdIHtib29sZWFufSBXaGV0aGVyIHRoZSByZXN1bHQgb2YgZGl2aXNpb24gd2FzIHRydW5jYXRlZC5cbiAqL1xuZnVuY3Rpb24gcm91bmQoeCwgc2QsIHJtLCBtb3JlKSB7XG4gIHZhciB4YyA9IHguYztcblxuICBpZiAocm0gPT09IFVOREVGSU5FRCkgcm0gPSB4LmNvbnN0cnVjdG9yLlJNO1xuICBpZiAocm0gIT09IDAgJiYgcm0gIT09IDEgJiYgcm0gIT09IDIgJiYgcm0gIT09IDMpIHtcbiAgICB0aHJvdyBFcnJvcihJTlZBTElEX1JNKTtcbiAgfVxuXG4gIGlmIChzZCA8IDEpIHtcbiAgICBtb3JlID1cbiAgICAgIHJtID09PSAzICYmIChtb3JlIHx8ICEheGNbMF0pIHx8IHNkID09PSAwICYmIChcbiAgICAgIHJtID09PSAxICYmIHhjWzBdID49IDUgfHxcbiAgICAgIHJtID09PSAyICYmICh4Y1swXSA+IDUgfHwgeGNbMF0gPT09IDUgJiYgKG1vcmUgfHwgeGNbMV0gIT09IFVOREVGSU5FRCkpXG4gICAgKTtcblxuICAgIHhjLmxlbmd0aCA9IDE7XG5cbiAgICBpZiAobW9yZSkge1xuXG4gICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxuICAgICAgeC5lID0geC5lIC0gc2QgKyAxO1xuICAgICAgeGNbMF0gPSAxO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIC8vIFplcm8uXG4gICAgICB4Y1swXSA9IHguZSA9IDA7XG4gICAgfVxuICB9IGVsc2UgaWYgKHNkIDwgeGMubGVuZ3RoKSB7XG5cbiAgICAvLyB4Y1tzZF0gaXMgdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxuICAgIG1vcmUgPVxuICAgICAgcm0gPT09IDEgJiYgeGNbc2RdID49IDUgfHxcbiAgICAgIHJtID09PSAyICYmICh4Y1tzZF0gPiA1IHx8IHhjW3NkXSA9PT0gNSAmJlxuICAgICAgICAobW9yZSB8fCB4Y1tzZCArIDFdICE9PSBVTkRFRklORUQgfHwgeGNbc2QgLSAxXSAmIDEpKSB8fFxuICAgICAgcm0gPT09IDMgJiYgKG1vcmUgfHwgISF4Y1swXSk7XG5cbiAgICAvLyBSZW1vdmUgYW55IGRpZ2l0cyBhZnRlciB0aGUgcmVxdWlyZWQgcHJlY2lzaW9uLlxuICAgIHhjLmxlbmd0aCA9IHNkO1xuXG4gICAgLy8gUm91bmQgdXA/XG4gICAgaWYgKG1vcmUpIHtcblxuICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwLlxuICAgICAgZm9yICg7ICsreGNbLS1zZF0gPiA5Oykge1xuICAgICAgICB4Y1tzZF0gPSAwO1xuICAgICAgICBpZiAoc2QgPT09IDApIHtcbiAgICAgICAgICArK3guZTtcbiAgICAgICAgICB4Yy51bnNoaWZ0KDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxuICAgIGZvciAoc2QgPSB4Yy5sZW5ndGg7ICF4Y1stLXNkXTspIHhjLnBvcCgpO1xuICB9XG5cbiAgcmV0dXJuIHg7XG59XG5cblxuLypcbiAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIEJpZyB4IGluIG5vcm1hbCBvciBleHBvbmVudGlhbCBub3RhdGlvbi5cbiAqIEhhbmRsZXMgUC50b0V4cG9uZW50aWFsLCBQLnRvRml4ZWQsIFAudG9KU09OLCBQLnRvUHJlY2lzaW9uLCBQLnRvU3RyaW5nIGFuZCBQLnZhbHVlT2YuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeSh4LCBkb0V4cG9uZW50aWFsLCBpc05vbnplcm8pIHtcbiAgdmFyIGUgPSB4LmUsXG4gICAgcyA9IHguYy5qb2luKCcnKSxcbiAgICBuID0gcy5sZW5ndGg7XG5cbiAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24/XG4gIGlmIChkb0V4cG9uZW50aWFsKSB7XG4gICAgcyA9IHMuY2hhckF0KDApICsgKG4gPiAxID8gJy4nICsgcy5zbGljZSgxKSA6ICcnKSArIChlIDwgMCA/ICdlJyA6ICdlKycpICsgZTtcblxuICAvLyBOb3JtYWwgbm90YXRpb24uXG4gIH0gZWxzZSBpZiAoZSA8IDApIHtcbiAgICBmb3IgKDsgKytlOykgcyA9ICcwJyArIHM7XG4gICAgcyA9ICcwLicgKyBzO1xuICB9IGVsc2UgaWYgKGUgPiAwKSB7XG4gICAgaWYgKCsrZSA+IG4pIHtcbiAgICAgIGZvciAoZSAtPSBuOyBlLS07KSBzICs9ICcwJztcbiAgICB9IGVsc2UgaWYgKGUgPCBuKSB7XG4gICAgICBzID0gcy5zbGljZSgwLCBlKSArICcuJyArIHMuc2xpY2UoZSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKG4gPiAxKSB7XG4gICAgcyA9IHMuY2hhckF0KDApICsgJy4nICsgcy5zbGljZSgxKTtcbiAgfVxuXG4gIHJldHVybiB4LnMgPCAwICYmIGlzTm9uemVybyA/ICctJyArIHMgOiBzO1xufVxuXG5cbi8vIFByb3RvdHlwZS9pbnN0YW5jZSBtZXRob2RzXG5cblxuLypcbiAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgQmlnLlxuICovXG5QLmFicyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHggPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcbiAgeC5zID0gMTtcbiAgcmV0dXJuIHg7XG59O1xuXG5cbi8qXG4gKiBSZXR1cm4gMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcbiAqICAgICAgIC0xIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LCBvclxuICogICAgICAgIDAgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlLlxuICovXG5QLmNtcCA9IGZ1bmN0aW9uICh5KSB7XG4gIHZhciBpc25lZyxcbiAgICB4ID0gdGhpcyxcbiAgICB4YyA9IHguYyxcbiAgICB5YyA9ICh5ID0gbmV3IHguY29uc3RydWN0b3IoeSkpLmMsXG4gICAgaSA9IHgucyxcbiAgICBqID0geS5zLFxuICAgIGsgPSB4LmUsXG4gICAgbCA9IHkuZTtcblxuICAvLyBFaXRoZXIgemVybz9cbiAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHJldHVybiAheGNbMF0gPyAheWNbMF0gPyAwIDogLWogOiBpO1xuXG4gIC8vIFNpZ25zIGRpZmZlcj9cbiAgaWYgKGkgIT0gaikgcmV0dXJuIGk7XG5cbiAgaXNuZWcgPSBpIDwgMDtcblxuICAvLyBDb21wYXJlIGV4cG9uZW50cy5cbiAgaWYgKGsgIT0gbCkgcmV0dXJuIGsgPiBsIF4gaXNuZWcgPyAxIDogLTE7XG5cbiAgaiA9IChrID0geGMubGVuZ3RoKSA8IChsID0geWMubGVuZ3RoKSA/IGsgOiBsO1xuXG4gIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXG4gIGZvciAoaSA9IC0xOyArK2kgPCBqOykge1xuICAgIGlmICh4Y1tpXSAhPSB5Y1tpXSkgcmV0dXJuIHhjW2ldID4geWNbaV0gXiBpc25lZyA/IDEgOiAtMTtcbiAgfVxuXG4gIC8vIENvbXBhcmUgbGVuZ3Rocy5cbiAgcmV0dXJuIGsgPT0gbCA/IDAgOiBrID4gbCBeIGlzbmVnID8gMSA6IC0xO1xufTtcblxuXG4vKlxuICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgZGl2aWRlZCBieSB0aGUgdmFsdWUgb2YgQmlnIHksIHJvdW5kZWQsXG4gKiBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXG4gKi9cblAuZGl2ID0gZnVuY3Rpb24gKHkpIHtcbiAgdmFyIHggPSB0aGlzLFxuICAgIEJpZyA9IHguY29uc3RydWN0b3IsXG4gICAgYSA9IHguYywgICAgICAgICAgICAgICAgICAvLyBkaXZpZGVuZFxuICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLmMsICAgLy8gZGl2aXNvclxuICAgIGsgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxuICAgIGRwID0gQmlnLkRQO1xuXG4gIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcbiAgICB0aHJvdyBFcnJvcihJTlZBTElEX0RQKTtcbiAgfVxuXG4gIC8vIERpdmlzb3IgaXMgemVybz9cbiAgaWYgKCFiWzBdKSB7XG4gICAgdGhyb3cgRXJyb3IoRElWX0JZX1pFUk8pO1xuICB9XG5cbiAgLy8gRGl2aWRlbmQgaXMgMD8gUmV0dXJuICstMC5cbiAgaWYgKCFhWzBdKSB7XG4gICAgeS5zID0gaztcbiAgICB5LmMgPSBbeS5lID0gMF07XG4gICAgcmV0dXJuIHk7XG4gIH1cblxuICB2YXIgYmwsIGJ0LCBuLCBjbXAsIHJpLFxuICAgIGJ6ID0gYi5zbGljZSgpLFxuICAgIGFpID0gYmwgPSBiLmxlbmd0aCxcbiAgICBhbCA9IGEubGVuZ3RoLFxuICAgIHIgPSBhLnNsaWNlKDAsIGJsKSwgICAvLyByZW1haW5kZXJcbiAgICBybCA9IHIubGVuZ3RoLFxuICAgIHEgPSB5LCAgICAgICAgICAgICAgICAvLyBxdW90aWVudFxuICAgIHFjID0gcS5jID0gW10sXG4gICAgcWkgPSAwLFxuICAgIHAgPSBkcCArIChxLmUgPSB4LmUgLSB5LmUpICsgMTsgICAgLy8gcHJlY2lzaW9uIG9mIHRoZSByZXN1bHRcblxuICBxLnMgPSBrO1xuICBrID0gcCA8IDAgPyAwIDogcDtcblxuICAvLyBDcmVhdGUgdmVyc2lvbiBvZiBkaXZpc29yIHdpdGggbGVhZGluZyB6ZXJvLlxuICBiei51bnNoaWZ0KDApO1xuXG4gIC8vIEFkZCB6ZXJvcyB0byBtYWtlIHJlbWFpbmRlciBhcyBsb25nIGFzIGRpdmlzb3IuXG4gIGZvciAoOyBybCsrIDwgYmw7KSByLnB1c2goMCk7XG5cbiAgZG8ge1xuXG4gICAgLy8gbiBpcyBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gY3VycmVudCByZW1haW5kZXIuXG4gICAgZm9yIChuID0gMDsgbiA8IDEwOyBuKyspIHtcblxuICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXG4gICAgICBpZiAoYmwgIT0gKHJsID0gci5sZW5ndGgpKSB7XG4gICAgICAgIGNtcCA9IGJsID4gcmwgPyAxIDogLTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHJpID0gLTEsIGNtcCA9IDA7ICsrcmkgPCBibDspIHtcbiAgICAgICAgICBpZiAoYltyaV0gIT0gcltyaV0pIHtcbiAgICAgICAgICAgIGNtcCA9IGJbcmldID4gcltyaV0gPyAxIDogLTE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlciwgc3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cbiAgICAgIGlmIChjbXAgPCAwKSB7XG5cbiAgICAgICAgLy8gUmVtYWluZGVyIGNhbid0IGJlIG1vcmUgdGhhbiAxIGRpZ2l0IGxvbmdlciB0aGFuIGRpdmlzb3IuXG4gICAgICAgIC8vIEVxdWFsaXNlIGxlbmd0aHMgdXNpbmcgZGl2aXNvciB3aXRoIGV4dHJhIGxlYWRpbmcgemVybz9cbiAgICAgICAgZm9yIChidCA9IHJsID09IGJsID8gYiA6IGJ6OyBybDspIHtcbiAgICAgICAgICBpZiAoclstLXJsXSA8IGJ0W3JsXSkge1xuICAgICAgICAgICAgcmkgPSBybDtcbiAgICAgICAgICAgIGZvciAoOyByaSAmJiAhclstLXJpXTspIHJbcmldID0gOTtcbiAgICAgICAgICAgIC0tcltyaV07XG4gICAgICAgICAgICByW3JsXSArPSAxMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcltybF0gLT0gYnRbcmxdO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICg7ICFyWzBdOykgci5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBkaWdpdCBuIHRvIHRoZSByZXN1bHQgYXJyYXkuXG4gICAgcWNbcWkrK10gPSBjbXAgPyBuIDogKytuO1xuXG4gICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIuXG4gICAgaWYgKHJbMF0gJiYgY21wKSByW3JsXSA9IGFbYWldIHx8IDA7XG4gICAgZWxzZSByID0gW2FbYWldXTtcblxuICB9IHdoaWxlICgoYWkrKyA8IGFsIHx8IHJbMF0gIT09IFVOREVGSU5FRCkgJiYgay0tKTtcblxuICAvLyBMZWFkaW5nIHplcm8/IERvIG5vdCByZW1vdmUgaWYgcmVzdWx0IGlzIHNpbXBseSB6ZXJvIChxaSA9PSAxKS5cbiAgaWYgKCFxY1swXSAmJiBxaSAhPSAxKSB7XG5cbiAgICAvLyBUaGVyZSBjYW4ndCBiZSBtb3JlIHRoYW4gb25lIHplcm8uXG4gICAgcWMuc2hpZnQoKTtcbiAgICBxLmUtLTtcbiAgICBwLS07XG4gIH1cblxuICAvLyBSb3VuZD9cbiAgaWYgKHFpID4gcCkgcm91bmQocSwgcCwgQmlnLlJNLCByWzBdICE9PSBVTkRFRklORUQpO1xuXG4gIHJldHVybiBxO1xufTtcblxuXG4vKlxuICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cbiAqL1xuUC5lcSA9IGZ1bmN0aW9uICh5KSB7XG4gIHJldHVybiB0aGlzLmNtcCh5KSA9PT0gMDtcbn07XG5cblxuLypcbiAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJuXG4gKiBmYWxzZS5cbiAqL1xuUC5ndCA9IGZ1bmN0aW9uICh5KSB7XG4gIHJldHVybiB0aGlzLmNtcCh5KSA+IDA7XG59O1xuXG5cbi8qXG4gKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlXG4gKiByZXR1cm4gZmFsc2UuXG4gKi9cblAuZ3RlID0gZnVuY3Rpb24gKHkpIHtcbiAgcmV0dXJuIHRoaXMuY21wKHkpID4gLTE7XG59O1xuXG5cbi8qXG4gKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cbiAqL1xuUC5sdCA9IGZ1bmN0aW9uICh5KSB7XG4gIHJldHVybiB0aGlzLmNtcCh5KSA8IDA7XG59O1xuXG5cbi8qXG4gKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlXG4gKiByZXR1cm4gZmFsc2UuXG4gKi9cblAubHRlID0gZnVuY3Rpb24gKHkpIHtcbiAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMTtcbn07XG5cblxuLypcbiAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1pbnVzIHRoZSB2YWx1ZSBvZiBCaWcgeS5cbiAqL1xuUC5taW51cyA9IFAuc3ViID0gZnVuY3Rpb24gKHkpIHtcbiAgdmFyIGksIGosIHQsIHhsdHksXG4gICAgeCA9IHRoaXMsXG4gICAgQmlnID0geC5jb25zdHJ1Y3RvcixcbiAgICBhID0geC5zLFxuICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XG5cbiAgLy8gU2lnbnMgZGlmZmVyP1xuICBpZiAoYSAhPSBiKSB7XG4gICAgeS5zID0gLWI7XG4gICAgcmV0dXJuIHgucGx1cyh5KTtcbiAgfVxuXG4gIHZhciB4YyA9IHguYy5zbGljZSgpLFxuICAgIHhlID0geC5lLFxuICAgIHljID0geS5jLFxuICAgIHllID0geS5lO1xuXG4gIC8vIEVpdGhlciB6ZXJvP1xuICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xuICAgIGlmICh5Y1swXSkge1xuICAgICAgeS5zID0gLWI7XG4gICAgfSBlbHNlIGlmICh4Y1swXSkge1xuICAgICAgeSA9IG5ldyBCaWcoeCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHkucyA9IDE7XG4gICAgfVxuICAgIHJldHVybiB5O1xuICB9XG5cbiAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLiBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cbiAgaWYgKGEgPSB4ZSAtIHllKSB7XG5cbiAgICBpZiAoeGx0eSA9IGEgPCAwKSB7XG4gICAgICBhID0gLWE7XG4gICAgICB0ID0geGM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHllID0geGU7XG4gICAgICB0ID0geWM7XG4gICAgfVxuXG4gICAgdC5yZXZlcnNlKCk7XG4gICAgZm9yIChiID0gYTsgYi0tOykgdC5wdXNoKDApO1xuICAgIHQucmV2ZXJzZSgpO1xuICB9IGVsc2Uge1xuXG4gICAgLy8gRXhwb25lbnRzIGVxdWFsLiBDaGVjayBkaWdpdCBieSBkaWdpdC5cbiAgICBqID0gKCh4bHR5ID0geGMubGVuZ3RoIDwgeWMubGVuZ3RoKSA/IHhjIDogeWMpLmxlbmd0aDtcblxuICAgIGZvciAoYSA9IGIgPSAwOyBiIDwgajsgYisrKSB7XG4gICAgICBpZiAoeGNbYl0gIT0geWNbYl0pIHtcbiAgICAgICAgeGx0eSA9IHhjW2JdIDwgeWNbYl07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHggPCB5PyBQb2ludCB4YyB0byB0aGUgYXJyYXkgb2YgdGhlIGJpZ2dlciBudW1iZXIuXG4gIGlmICh4bHR5KSB7XG4gICAgdCA9IHhjO1xuICAgIHhjID0geWM7XG4gICAgeWMgPSB0O1xuICAgIHkucyA9IC15LnM7XG4gIH1cblxuICAvKlxuICAgKiBBcHBlbmQgemVyb3MgdG8geGMgaWYgc2hvcnRlci4gTm8gbmVlZCB0byBhZGQgemVyb3MgdG8geWMgaWYgc2hvcnRlciBhcyBzdWJ0cmFjdGlvbiBvbmx5XG4gICAqIG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cbiAgICovXG4gIGlmICgoYiA9IChqID0geWMubGVuZ3RoKSAtIChpID0geGMubGVuZ3RoKSkgPiAwKSBmb3IgKDsgYi0tOykgeGNbaSsrXSA9IDA7XG5cbiAgLy8gU3VidHJhY3QgeWMgZnJvbSB4Yy5cbiAgZm9yIChiID0gaTsgaiA+IGE7KSB7XG4gICAgaWYgKHhjWy0tal0gPCB5Y1tqXSkge1xuICAgICAgZm9yIChpID0gajsgaSAmJiAheGNbLS1pXTspIHhjW2ldID0gOTtcbiAgICAgIC0teGNbaV07XG4gICAgICB4Y1tqXSArPSAxMDtcbiAgICB9XG5cbiAgICB4Y1tqXSAtPSB5Y1tqXTtcbiAgfVxuXG4gIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cbiAgZm9yICg7IHhjWy0tYl0gPT09IDA7KSB4Yy5wb3AoKTtcblxuICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxuICBmb3IgKDsgeGNbMF0gPT09IDA7KSB7XG4gICAgeGMuc2hpZnQoKTtcbiAgICAtLXllO1xuICB9XG5cbiAgaWYgKCF4Y1swXSkge1xuXG4gICAgLy8gbiAtIG4gPSArMFxuICAgIHkucyA9IDE7XG5cbiAgICAvLyBSZXN1bHQgbXVzdCBiZSB6ZXJvLlxuICAgIHhjID0gW3llID0gMF07XG4gIH1cblxuICB5LmMgPSB4YztcbiAgeS5lID0geWU7XG5cbiAgcmV0dXJuIHk7XG59O1xuXG5cbi8qXG4gKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtb2R1bG8gdGhlIHZhbHVlIG9mIEJpZyB5LlxuICovXG5QLm1vZCA9IGZ1bmN0aW9uICh5KSB7XG4gIHZhciB5Z3R4LFxuICAgIHggPSB0aGlzLFxuICAgIEJpZyA9IHguY29uc3RydWN0b3IsXG4gICAgYSA9IHgucyxcbiAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xuXG4gIGlmICgheS5jWzBdKSB7XG4gICAgdGhyb3cgRXJyb3IoRElWX0JZX1pFUk8pO1xuICB9XG5cbiAgeC5zID0geS5zID0gMTtcbiAgeWd0eCA9IHkuY21wKHgpID09IDE7XG4gIHgucyA9IGE7XG4gIHkucyA9IGI7XG5cbiAgaWYgKHlndHgpIHJldHVybiBuZXcgQmlnKHgpO1xuXG4gIGEgPSBCaWcuRFA7XG4gIGIgPSBCaWcuUk07XG4gIEJpZy5EUCA9IEJpZy5STSA9IDA7XG4gIHggPSB4LmRpdih5KTtcbiAgQmlnLkRQID0gYTtcbiAgQmlnLlJNID0gYjtcblxuICByZXR1cm4gdGhpcy5taW51cyh4LnRpbWVzKHkpKTtcbn07XG5cblxuLypcbiAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG5lZ2F0ZWQuXG4gKi9cblAubmVnID0gZnVuY3Rpb24gKCkge1xuICB2YXIgeCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xuICB4LnMgPSAteC5zO1xuICByZXR1cm4geDtcbn07XG5cblxuLypcbiAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHBsdXMgdGhlIHZhbHVlIG9mIEJpZyB5LlxuICovXG5QLnBsdXMgPSBQLmFkZCA9IGZ1bmN0aW9uICh5KSB7XG4gIHZhciBlLCBrLCB0LFxuICAgIHggPSB0aGlzLFxuICAgIEJpZyA9IHguY29uc3RydWN0b3I7XG5cbiAgeSA9IG5ldyBCaWcoeSk7XG5cbiAgLy8gU2lnbnMgZGlmZmVyP1xuICBpZiAoeC5zICE9IHkucykge1xuICAgIHkucyA9IC15LnM7XG4gICAgcmV0dXJuIHgubWludXMoeSk7XG4gIH1cblxuICB2YXIgeGUgPSB4LmUsXG4gICAgeGMgPSB4LmMsXG4gICAgeWUgPSB5LmUsXG4gICAgeWMgPSB5LmM7XG5cbiAgLy8gRWl0aGVyIHplcm8/XG4gIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XG4gICAgaWYgKCF5Y1swXSkge1xuICAgICAgaWYgKHhjWzBdKSB7XG4gICAgICAgIHkgPSBuZXcgQmlnKHgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeS5zID0geC5zO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geTtcbiAgfVxuXG4gIHhjID0geGMuc2xpY2UoKTtcblxuICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cbiAgLy8gTm90ZTogcmV2ZXJzZSBmYXN0ZXIgdGhhbiB1bnNoaWZ0cy5cbiAgaWYgKGUgPSB4ZSAtIHllKSB7XG4gICAgaWYgKGUgPiAwKSB7XG4gICAgICB5ZSA9IHhlO1xuICAgICAgdCA9IHljO1xuICAgIH0gZWxzZSB7XG4gICAgICBlID0gLWU7XG4gICAgICB0ID0geGM7XG4gICAgfVxuXG4gICAgdC5yZXZlcnNlKCk7XG4gICAgZm9yICg7IGUtLTspIHQucHVzaCgwKTtcbiAgICB0LnJldmVyc2UoKTtcbiAgfVxuXG4gIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXkuXG4gIGlmICh4Yy5sZW5ndGggLSB5Yy5sZW5ndGggPCAwKSB7XG4gICAgdCA9IHljO1xuICAgIHljID0geGM7XG4gICAgeGMgPSB0O1xuICB9XG5cbiAgZSA9IHljLmxlbmd0aDtcblxuICAvLyBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5Yy5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4YyBjYW4gYmUgbGVmdCBhcyB0aGV5IGFyZS5cbiAgZm9yIChrID0gMDsgZTsgeGNbZV0gJT0gMTApIGsgPSAoeGNbLS1lXSA9IHhjW2VdICsgeWNbZV0gKyBrKSAvIDEwIHwgMDtcblxuICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXG5cbiAgaWYgKGspIHtcbiAgICB4Yy51bnNoaWZ0KGspO1xuICAgICsreWU7XG4gIH1cblxuICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXG4gIGZvciAoZSA9IHhjLmxlbmd0aDsgeGNbLS1lXSA9PT0gMDspIHhjLnBvcCgpO1xuXG4gIHkuYyA9IHhjO1xuICB5LmUgPSB5ZTtcblxuICByZXR1cm4geTtcbn07XG5cblxuLypcbiAqIFJldHVybiBhIEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcmFpc2VkIHRvIHRoZSBwb3dlciBuLlxuICogSWYgbiBpcyBuZWdhdGl2ZSwgcm91bmQgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZ1xuICogbW9kZSBCaWcuUk0uXG4gKlxuICogbiB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX1BPV0VSIHRvIE1BWF9QT1dFUiBpbmNsdXNpdmUuXG4gKi9cblAucG93ID0gZnVuY3Rpb24gKG4pIHtcbiAgdmFyIHggPSB0aGlzLFxuICAgIG9uZSA9IG5ldyB4LmNvbnN0cnVjdG9yKCcxJyksXG4gICAgeSA9IG9uZSxcbiAgICBpc25lZyA9IG4gPCAwO1xuXG4gIGlmIChuICE9PSB+fm4gfHwgbiA8IC1NQVhfUE9XRVIgfHwgbiA+IE1BWF9QT1dFUikge1xuICAgIHRocm93IEVycm9yKElOVkFMSUQgKyAnZXhwb25lbnQnKTtcbiAgfVxuXG4gIGlmIChpc25lZykgbiA9IC1uO1xuXG4gIGZvciAoOzspIHtcbiAgICBpZiAobiAmIDEpIHkgPSB5LnRpbWVzKHgpO1xuICAgIG4gPj49IDE7XG4gICAgaWYgKCFuKSBicmVhaztcbiAgICB4ID0geC50aW1lcyh4KTtcbiAgfVxuXG4gIHJldHVybiBpc25lZyA/IG9uZS5kaXYoeSkgOiB5O1xufTtcblxuXG4vKlxuICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBhIG1heGltdW0gcHJlY2lzaW9uIG9mIHNkXG4gKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3IgQmlnLlJNIGlmIHJtIGlzIG5vdCBzcGVjaWZpZWQuXG4gKlxuICogc2Qge251bWJlcn0gU2lnbmlmaWNhbnQgZGlnaXRzOiBpbnRlZ2VyLCAxIHRvIE1BWF9EUCBpbmNsdXNpdmUuXG4gKiBybT8ge251bWJlcn0gUm91bmRpbmcgbW9kZTogMCAoZG93biksIDEgKGhhbGYtdXApLCAyIChoYWxmLWV2ZW4pIG9yIDMgKHVwKS5cbiAqL1xuUC5wcmVjID0gZnVuY3Rpb24gKHNkLCBybSkge1xuICBpZiAoc2QgIT09IH5+c2QgfHwgc2QgPCAxIHx8IHNkID4gTUFYX0RQKSB7XG4gICAgdGhyb3cgRXJyb3IoSU5WQUxJRCArICdwcmVjaXNpb24nKTtcbiAgfVxuICByZXR1cm4gcm91bmQobmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyksIHNkLCBybSk7XG59O1xuXG5cbi8qXG4gKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIGEgbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlc1xuICogdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3IgQmlnLlJNIGlmIHJtIGlzIG5vdCBzcGVjaWZpZWQuXG4gKiBJZiBkcCBpcyBuZWdhdGl2ZSwgcm91bmQgdG8gYW4gaW50ZWdlciB3aGljaCBpcyBhIG11bHRpcGxlIG9mIDEwKiotZHAuXG4gKiBJZiBkcCBpcyBub3Qgc3BlY2lmaWVkLCByb3VuZCB0byAwIGRlY2ltYWwgcGxhY2VzLlxuICpcbiAqIGRwPyB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX0RQIHRvIE1BWF9EUCBpbmNsdXNpdmUuXG4gKiBybT8ge251bWJlcn0gUm91bmRpbmcgbW9kZTogMCAoZG93biksIDEgKGhhbGYtdXApLCAyIChoYWxmLWV2ZW4pIG9yIDMgKHVwKS5cbiAqL1xuUC5yb3VuZCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcbiAgaWYgKGRwID09PSBVTkRFRklORUQpIGRwID0gMDtcbiAgZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAtTUFYX0RQIHx8IGRwID4gTUFYX0RQKSB7XG4gICAgdGhyb3cgRXJyb3IoSU5WQUxJRF9EUCk7XG4gIH1cbiAgcmV0dXJuIHJvdW5kKG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpLCBkcCArIHRoaXMuZSArIDEsIHJtKTtcbn07XG5cblxuLypcbiAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZywgcm91bmRlZCwgaWZcbiAqIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cbiAqL1xuUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgciwgYywgdCxcbiAgICB4ID0gdGhpcyxcbiAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxuICAgIHMgPSB4LnMsXG4gICAgZSA9IHguZSxcbiAgICBoYWxmID0gbmV3IEJpZygnMC41Jyk7XG5cbiAgLy8gWmVybz9cbiAgaWYgKCF4LmNbMF0pIHJldHVybiBuZXcgQmlnKHgpO1xuXG4gIC8vIE5lZ2F0aXZlP1xuICBpZiAocyA8IDApIHtcbiAgICB0aHJvdyBFcnJvcihOQU1FICsgJ05vIHNxdWFyZSByb290Jyk7XG4gIH1cblxuICAvLyBFc3RpbWF0ZS5cbiAgcyA9IE1hdGguc3FydCh4ICsgJycpO1xuXG4gIC8vIE1hdGguc3FydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XG4gIC8vIFJlLWVzdGltYXRlOiBwYXNzIHggY29lZmZpY2llbnQgdG8gTWF0aC5zcXJ0IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSByZXN1bHQgZXhwb25lbnQuXG4gIGlmIChzID09PSAwIHx8IHMgPT09IDEgLyAwKSB7XG4gICAgYyA9IHguYy5qb2luKCcnKTtcbiAgICBpZiAoIShjLmxlbmd0aCArIGUgJiAxKSkgYyArPSAnMCc7XG4gICAgcyA9IE1hdGguc3FydChjKTtcbiAgICBlID0gKChlICsgMSkgLyAyIHwgMCkgLSAoZSA8IDAgfHwgZSAmIDEpO1xuICAgIHIgPSBuZXcgQmlnKChzID09IDEgLyAwID8gJzVlJyA6IChzID0gcy50b0V4cG9uZW50aWFsKCkpLnNsaWNlKDAsIHMuaW5kZXhPZignZScpICsgMSkpICsgZSk7XG4gIH0gZWxzZSB7XG4gICAgciA9IG5ldyBCaWcocyArICcnKTtcbiAgfVxuXG4gIGUgPSByLmUgKyAoQmlnLkRQICs9IDQpO1xuXG4gIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cbiAgZG8ge1xuICAgIHQgPSByO1xuICAgIHIgPSBoYWxmLnRpbWVzKHQucGx1cyh4LmRpdih0KSkpO1xuICB9IHdoaWxlICh0LmMuc2xpY2UoMCwgZSkuam9pbignJykgIT09IHIuYy5zbGljZSgwLCBlKS5qb2luKCcnKSk7XG5cbiAgcmV0dXJuIHJvdW5kKHIsIChCaWcuRFAgLT0gNCkgKyByLmUgKyAxLCBCaWcuUk0pO1xufTtcblxuXG4vKlxuICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgdGltZXMgdGhlIHZhbHVlIG9mIEJpZyB5LlxuICovXG5QLnRpbWVzID0gUC5tdWwgPSBmdW5jdGlvbiAoeSkge1xuICB2YXIgYyxcbiAgICB4ID0gdGhpcyxcbiAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxuICAgIHhjID0geC5jLFxuICAgIHljID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxuICAgIGEgPSB4Yy5sZW5ndGgsXG4gICAgYiA9IHljLmxlbmd0aCxcbiAgICBpID0geC5lLFxuICAgIGogPSB5LmU7XG5cbiAgLy8gRGV0ZXJtaW5lIHNpZ24gb2YgcmVzdWx0LlxuICB5LnMgPSB4LnMgPT0geS5zID8gMSA6IC0xO1xuXG4gIC8vIFJldHVybiBzaWduZWQgMCBpZiBlaXRoZXIgMC5cbiAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcbiAgICB5LmMgPSBbeS5lID0gMF07XG4gICAgcmV0dXJuIHk7XG4gIH1cblxuICAvLyBJbml0aWFsaXNlIGV4cG9uZW50IG9mIHJlc3VsdCBhcyB4LmUgKyB5LmUuXG4gIHkuZSA9IGkgKyBqO1xuXG4gIC8vIElmIGFycmF5IHhjIGhhcyBmZXdlciBkaWdpdHMgdGhhbiB5Yywgc3dhcCB4YyBhbmQgeWMsIGFuZCBsZW5ndGhzLlxuICBpZiAoYSA8IGIpIHtcbiAgICBjID0geGM7XG4gICAgeGMgPSB5YztcbiAgICB5YyA9IGM7XG4gICAgaiA9IGE7XG4gICAgYSA9IGI7XG4gICAgYiA9IGo7XG4gIH1cblxuICAvLyBJbml0aWFsaXNlIGNvZWZmaWNpZW50IGFycmF5IG9mIHJlc3VsdCB3aXRoIHplcm9zLlxuICBmb3IgKGMgPSBuZXcgQXJyYXkoaiA9IGEgKyBiKTsgai0tOykgY1tqXSA9IDA7XG5cbiAgLy8gTXVsdGlwbHkuXG5cbiAgLy8gaSBpcyBpbml0aWFsbHkgeGMubGVuZ3RoLlxuICBmb3IgKGkgPSBiOyBpLS07KSB7XG4gICAgYiA9IDA7XG5cbiAgICAvLyBhIGlzIHljLmxlbmd0aC5cbiAgICBmb3IgKGogPSBhICsgaTsgaiA+IGk7KSB7XG5cbiAgICAgIC8vIEN1cnJlbnQgc3VtIG9mIHByb2R1Y3RzIGF0IHRoaXMgZGlnaXQgcG9zaXRpb24sIHBsdXMgY2FycnkuXG4gICAgICBiID0gY1tqXSArIHljW2ldICogeGNbaiAtIGkgLSAxXSArIGI7XG4gICAgICBjW2otLV0gPSBiICUgMTA7XG5cbiAgICAgIC8vIGNhcnJ5XG4gICAgICBiID0gYiAvIDEwIHwgMDtcbiAgICB9XG5cbiAgICBjW2pdID0gYjtcbiAgfVxuXG4gIC8vIEluY3JlbWVudCByZXN1bHQgZXhwb25lbnQgaWYgdGhlcmUgaXMgYSBmaW5hbCBjYXJyeSwgb3RoZXJ3aXNlIHJlbW92ZSBsZWFkaW5nIHplcm8uXG4gIGlmIChiKSArK3kuZTtcbiAgZWxzZSBjLnNoaWZ0KCk7XG5cbiAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxuICBmb3IgKGkgPSBjLmxlbmd0aDsgIWNbLS1pXTspIGMucG9wKCk7XG4gIHkuYyA9IGM7XG5cbiAgcmV0dXJuIHk7XG59O1xuXG5cbi8qXG4gKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBleHBvbmVudGlhbCBub3RhdGlvbiByb3VuZGVkIHRvIGRwIGZpeGVkXG4gKiBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLCBvciBCaWcuUk0gaWYgcm0gaXMgbm90IHNwZWNpZmllZC5cbiAqXG4gKiBkcD8ge251bWJlcn0gRGVjaW1hbCBwbGFjZXM6IGludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cbiAqIHJtPyB7bnVtYmVyfSBSb3VuZGluZyBtb2RlOiAwIChkb3duKSwgMSAoaGFsZi11cCksIDIgKGhhbGYtZXZlbikgb3IgMyAodXApLlxuICovXG5QLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XG4gIHZhciB4ID0gdGhpcyxcbiAgICBuID0geC5jWzBdO1xuXG4gIGlmIChkcCAhPT0gVU5ERUZJTkVEKSB7XG4gICAgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xuICAgICAgdGhyb3cgRXJyb3IoSU5WQUxJRF9EUCk7XG4gICAgfVxuICAgIHggPSByb3VuZChuZXcgeC5jb25zdHJ1Y3Rvcih4KSwgKytkcCwgcm0pO1xuICAgIGZvciAoOyB4LmMubGVuZ3RoIDwgZHA7KSB4LmMucHVzaCgwKTtcbiAgfVxuXG4gIHJldHVybiBzdHJpbmdpZnkoeCwgdHJ1ZSwgISFuKTtcbn07XG5cblxuLypcbiAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIG5vcm1hbCBub3RhdGlvbiByb3VuZGVkIHRvIGRwIGZpeGVkXG4gKiBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLCBvciBCaWcuUk0gaWYgcm0gaXMgbm90IHNwZWNpZmllZC5cbiAqXG4gKiBkcD8ge251bWJlcn0gRGVjaW1hbCBwbGFjZXM6IGludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cbiAqIHJtPyB7bnVtYmVyfSBSb3VuZGluZyBtb2RlOiAwIChkb3duKSwgMSAoaGFsZi11cCksIDIgKGhhbGYtZXZlbikgb3IgMyAodXApLlxuICpcbiAqICgtMCkudG9GaXhlZCgwKSBpcyAnMCcsIGJ1dCAoLTAuMSkudG9GaXhlZCgwKSBpcyAnLTAnLlxuICogKC0wKS50b0ZpeGVkKDEpIGlzICcwLjAnLCBidXQgKC0wLjAxKS50b0ZpeGVkKDEpIGlzICctMC4wJy5cbiAqL1xuUC50b0ZpeGVkID0gZnVuY3Rpb24gKGRwLCBybSkge1xuICB2YXIgeCA9IHRoaXMsXG4gICAgbiA9IHguY1swXTtcblxuICBpZiAoZHAgIT09IFVOREVGSU5FRCkge1xuICAgIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcbiAgICAgIHRocm93IEVycm9yKElOVkFMSURfRFApO1xuICAgIH1cbiAgICB4ID0gcm91bmQobmV3IHguY29uc3RydWN0b3IoeCksIGRwICsgeC5lICsgMSwgcm0pO1xuXG4gICAgLy8geC5lIG1heSBoYXZlIGNoYW5nZWQgaWYgdGhlIHZhbHVlIGlzIHJvdW5kZWQgdXAuXG4gICAgZm9yIChkcCA9IGRwICsgeC5lICsgMTsgeC5jLmxlbmd0aCA8IGRwOykgeC5jLnB1c2goMCk7XG4gIH1cblxuICByZXR1cm4gc3RyaW5naWZ5KHgsIGZhbHNlLCAhIW4pO1xufTtcblxuXG4vKlxuICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcuXG4gKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhpcyBCaWcgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuXG4gKiBCaWcuUEUsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuIEJpZy5ORS5cbiAqIE9taXQgdGhlIHNpZ24gZm9yIG5lZ2F0aXZlIHplcm8uXG4gKi9cblBbU3ltYm9sLmZvcignbm9kZWpzLnV0aWwuaW5zcGVjdC5jdXN0b20nKV0gPSBQLnRvSlNPTiA9IFAudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB4ID0gdGhpcyxcbiAgICBCaWcgPSB4LmNvbnN0cnVjdG9yO1xuICByZXR1cm4gc3RyaW5naWZ5KHgsIHguZSA8PSBCaWcuTkUgfHwgeC5lID49IEJpZy5QRSwgISF4LmNbMF0pO1xufTtcblxuXG4vKlxuICogUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBhcyBhIHByaW1pdHZlIG51bWJlci5cbiAqL1xuUC50b051bWJlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG4gPSBOdW1iZXIoc3RyaW5naWZ5KHRoaXMsIHRydWUsIHRydWUpKTtcbiAgaWYgKHRoaXMuY29uc3RydWN0b3Iuc3RyaWN0ID09PSB0cnVlICYmICF0aGlzLmVxKG4udG9TdHJpbmcoKSkpIHtcbiAgICB0aHJvdyBFcnJvcihOQU1FICsgJ0ltcHJlY2lzZSBjb252ZXJzaW9uJyk7XG4gIH1cbiAgcmV0dXJuIG47XG59O1xuXG5cbi8qXG4gKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIHNkIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZ1xuICogcm91bmRpbmcgbW9kZSBybSwgb3IgQmlnLlJNIGlmIHJtIGlzIG5vdCBzcGVjaWZpZWQuXG4gKiBVc2UgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgc2QgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnRcbiAqIHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIG5vcm1hbCBub3RhdGlvbi5cbiAqXG4gKiBzZCB7bnVtYmVyfSBTaWduaWZpY2FudCBkaWdpdHM6IGludGVnZXIsIDEgdG8gTUFYX0RQIGluY2x1c2l2ZS5cbiAqIHJtPyB7bnVtYmVyfSBSb3VuZGluZyBtb2RlOiAwIChkb3duKSwgMSAoaGFsZi11cCksIDIgKGhhbGYtZXZlbikgb3IgMyAodXApLlxuICovXG5QLnRvUHJlY2lzaW9uID0gZnVuY3Rpb24gKHNkLCBybSkge1xuICB2YXIgeCA9IHRoaXMsXG4gICAgQmlnID0geC5jb25zdHJ1Y3RvcixcbiAgICBuID0geC5jWzBdO1xuXG4gIGlmIChzZCAhPT0gVU5ERUZJTkVEKSB7XG4gICAgaWYgKHNkICE9PSB+fnNkIHx8IHNkIDwgMSB8fCBzZCA+IE1BWF9EUCkge1xuICAgICAgdGhyb3cgRXJyb3IoSU5WQUxJRCArICdwcmVjaXNpb24nKTtcbiAgICB9XG4gICAgeCA9IHJvdW5kKG5ldyBCaWcoeCksIHNkLCBybSk7XG4gICAgZm9yICg7IHguYy5sZW5ndGggPCBzZDspIHguYy5wdXNoKDApO1xuICB9XG5cbiAgcmV0dXJuIHN0cmluZ2lmeSh4LCBzZCA8PSB4LmUgfHwgeC5lIDw9IEJpZy5ORSB8fCB4LmUgPj0gQmlnLlBFLCAhIW4pO1xufTtcblxuXG4vKlxuICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcuXG4gKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhpcyBCaWcgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuXG4gKiBCaWcuUEUsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuIEJpZy5ORS5cbiAqIEluY2x1ZGUgdGhlIHNpZ24gZm9yIG5lZ2F0aXZlIHplcm8uXG4gKi9cblAudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHggPSB0aGlzLFxuICAgIEJpZyA9IHguY29uc3RydWN0b3I7XG4gIGlmIChCaWcuc3RyaWN0ID09PSB0cnVlKSB7XG4gICAgdGhyb3cgRXJyb3IoTkFNRSArICd2YWx1ZU9mIGRpc2FsbG93ZWQnKTtcbiAgfVxuICByZXR1cm4gc3RyaW5naWZ5KHgsIHguZSA8PSBCaWcuTkUgfHwgeC5lID49IEJpZy5QRSwgdHJ1ZSk7XG59O1xuXG5cbi8vIEV4cG9ydFxuXG5cbmV4cG9ydCB2YXIgQmlnID0gX0JpZ18oKTtcblxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vRGVmaW5pdGVseVR5cGVkL0RlZmluaXRlbHlUeXBlZC9tYXN0ZXIvdHlwZXMvYmlnLmpzL2luZGV4LmQudHNcIiAvPlxuZXhwb3J0IGRlZmF1bHQgQmlnO1xuIl0sIm5hbWVzIjpbIkRQIiwiUk0iLCJNQVhfRFAiLCJNQVhfUE9XRVIiLCJORSIsIlBFIiwiU1RSSUNUIiwiTkFNRSIsIklOVkFMSUQiLCJJTlZBTElEX0RQIiwiSU5WQUxJRF9STSIsIkRJVl9CWV9aRVJPIiwiUCIsIlVOREVGSU5FRCIsIk5VTUVSSUMiLCJfQmlnXyIsIkJpZyIsIm4iLCJ4IiwicyIsImUiLCJjIiwic2xpY2UiLCJzdHJpY3QiLCJUeXBlRXJyb3IiLCJTdHJpbmciLCJwYXJzZSIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwicm91bmREb3duIiwicm91bmRIYWxmVXAiLCJyb3VuZEhhbGZFdmVuIiwicm91bmRVcCIsImkiLCJubCIsInRlc3QiLCJFcnJvciIsImNoYXJBdCIsImluZGV4T2YiLCJyZXBsYWNlIiwic2VhcmNoIiwic3Vic3RyaW5nIiwibGVuZ3RoIiwicm91bmQiLCJzZCIsInJtIiwibW9yZSIsInhjIiwidW5zaGlmdCIsInBvcCIsInN0cmluZ2lmeSIsImRvRXhwb25lbnRpYWwiLCJpc05vbnplcm8iLCJqb2luIiwiYWJzIiwiY21wIiwieSIsImlzbmVnIiwieWMiLCJqIiwiayIsImwiLCJkaXYiLCJhIiwiYiIsImRwIiwiYmwiLCJidCIsInJpIiwiYnoiLCJhaSIsImFsIiwiciIsInJsIiwicSIsInFjIiwicWkiLCJwIiwicHVzaCIsInNoaWZ0IiwiZXEiLCJndCIsImd0ZSIsImx0IiwibHRlIiwibWludXMiLCJzdWIiLCJ0IiwieGx0eSIsInBsdXMiLCJ4ZSIsInllIiwicmV2ZXJzZSIsIm1vZCIsInlndHgiLCJ0aW1lcyIsIm5lZyIsImFkZCIsInBvdyIsIm9uZSIsInByZWMiLCJzcXJ0IiwiaGFsZiIsIk1hdGgiLCJ0b0V4cG9uZW50aWFsIiwibXVsIiwiQXJyYXkiLCJ0b0ZpeGVkIiwiU3ltYm9sIiwiZm9yIiwidG9KU09OIiwidG9TdHJpbmciLCJ0b051bWJlciIsIk51bWJlciIsInRvUHJlY2lzaW9uIiwidmFsdWVPZiJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0NBS0Ms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