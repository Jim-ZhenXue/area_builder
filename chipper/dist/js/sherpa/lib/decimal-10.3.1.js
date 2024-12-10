(function(globalScope) {
    'use strict';
    /*
   *  decimal.js v10.3.1
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2021 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   */ // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //
    // The maximum exponent magnitude.
    // The limit on the value of `toExpNeg`, `toExpPos`, `minE` and `maxE`.
    var EXP_LIMIT = 9e15, // The limit on the value of `precision`, and on the value of the first argument to
    // `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
    MAX_DIGITS = 1e9, // Base conversion alphabet.
    NUMERALS = '0123456789abcdef', // The natural logarithm of 10 (1025 digits).
    LN10 = '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058', // Pi (1025 digits).
    PI = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789', // The initial configuration properties of the Decimal constructor.
    DEFAULTS = {
        // These values must be integers within the stated ranges (inclusive).
        // Most of these values can be changed at run-time using the `Decimal.config` method.
        // The maximum number of significant digits of the result of a calculation or base conversion.
        // E.g. `Decimal.config({ precision: 20 });`
        precision: 20,
        // The rounding mode used when rounding to `precision`.
        //
        // ROUND_UP         0 Away from zero.
        // ROUND_DOWN       1 Towards zero.
        // ROUND_CEIL       2 Towards +Infinity.
        // ROUND_FLOOR      3 Towards -Infinity.
        // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
        // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
        // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
        // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
        // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
        //
        // E.g.
        // `Decimal.rounding = 4;`
        // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
        rounding: 4,
        // The modulo mode used when calculating the modulus: a mod n.
        // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
        // The remainder (r) is calculated as: r = a - n * q.
        //
        // UP         0 The remainder is positive if the dividend is negative, else is negative.
        // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
        // FLOOR      3 The remainder has the same sign as the divisor (Python %).
        // HALF_EVEN  6 The IEEE 754 remainder function.
        // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
        //
        // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
        // division (9) are commonly used for the modulus operation. The other rounding modes can also
        // be used, but they may not give useful results.
        modulo: 1,
        // The exponent value at and beneath which `toString` returns exponential notation.
        // JavaScript numbers: -7
        toExpNeg: -7,
        // The exponent value at and above which `toString` returns exponential notation.
        // JavaScript numbers: 21
        toExpPos: 21,
        // The minimum exponent value, beneath which underflow to zero occurs.
        // JavaScript numbers: -324  (5e-324)
        minE: -EXP_LIMIT,
        // The maximum exponent value, above which overflow to Infinity occurs.
        // JavaScript numbers: 308  (1.7976931348623157e+308)
        maxE: EXP_LIMIT,
        // Whether to use cryptographically-secure random number generation, if available.
        crypto: false // true/false
    }, // ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //
    Decimal, inexact, noConflict, quadrant, external = true, decimalError = '[DecimalError] ', invalidArgument = decimalError + 'Invalid argument: ', precisionLimitExceeded = decimalError + 'Precision limit exceeded', cryptoUnavailable = decimalError + 'crypto unavailable', tag = '[object Decimal]', mathfloor = Math.floor, mathpow = Math.pow, isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i, isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i, isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i, isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, BASE = 1e7, LOG_BASE = 7, MAX_SAFE_INTEGER = 9007199254740991, LN10_PRECISION = LN10.length - 1, PI_PRECISION = PI.length - 1, // Decimal.prototype object
    P = {
        toStringTag: tag
    };
    // Decimal prototype methods
    /*
   *  absoluteValue             abs
   *  ceil
   *  clampedTo                 clamp
   *  comparedTo                cmp
   *  cosine                    cos
   *  cubeRoot                  cbrt
   *  decimalPlaces             dp
   *  dividedBy                 div
   *  dividedToIntegerBy        divToInt
   *  equals                    eq
   *  floor
   *  greaterThan               gt
   *  greaterThanOrEqualTo      gte
   *  hyperbolicCosine          cosh
   *  hyperbolicSine            sinh
   *  hyperbolicTangent         tanh
   *  inverseCosine             acos
   *  inverseHyperbolicCosine   acosh
   *  inverseHyperbolicSine     asinh
   *  inverseHyperbolicTangent  atanh
   *  inverseSine               asin
   *  inverseTangent            atan
   *  isFinite
   *  isInteger                 isInt
   *  isNaN
   *  isNegative                isNeg
   *  isPositive                isPos
   *  isZero
   *  lessThan                  lt
   *  lessThanOrEqualTo         lte
   *  logarithm                 log
   *  [maximum]                 [max]
   *  [minimum]                 [min]
   *  minus                     sub
   *  modulo                    mod
   *  naturalExponential        exp
   *  naturalLogarithm          ln
   *  negated                   neg
   *  plus                      add
   *  precision                 sd
   *  round
   *  sine                      sin
   *  squareRoot                sqrt
   *  tangent                   tan
   *  times                     mul
   *  toBinary
   *  toDecimalPlaces           toDP
   *  toExponential
   *  toFixed
   *  toFraction
   *  toHexadecimal             toHex
   *  toNearest
   *  toNumber
   *  toOctal
   *  toPower                   pow
   *  toPrecision
   *  toSignificantDigits       toSD
   *  toString
   *  truncated                 trunc
   *  valueOf                   toJSON
   */ /*
   * Return a new Decimal whose value is the absolute value of this Decimal.
   *
   */ P.absoluteValue = P.abs = function() {
        var x = new this.constructor(this);
        if (x.s < 0) x.s = 1;
        return finalise(x);
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of positive Infinity.
   *
   */ P.ceil = function() {
        return finalise(new this.constructor(this), this.e + 1, 2);
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal clamped to the range
   * delineated by `min` and `max`.
   *
   * min {number|string|Decimal}
   * max {number|string|Decimal}
   *
   */ P.clampedTo = P.clamp = function(min, max) {
        var k, x = this, Ctor = x.constructor;
        min = new Ctor(min);
        max = new Ctor(max);
        if (!min.s || !max.s) return new Ctor(NaN);
        if (min.gt(max)) throw Error(invalidArgument + max);
        k = x.cmp(min);
        return k < 0 ? min : x.cmp(max) > 0 ? max : new Ctor(x);
    };
    /*
   * Return
   *   1    if the value of this Decimal is greater than the value of `y`,
   *  -1    if the value of this Decimal is less than the value of `y`,
   *   0    if they have the same value,
   *   NaN  if the value of either Decimal is NaN.
   *
   */ P.comparedTo = P.cmp = function(y) {
        var i, j, xdL, ydL, x = this, xd = x.d, yd = (y = new x.constructor(y)).d, xs = x.s, ys = y.s;
        // Either NaN or ±Infinity?
        if (!xd || !yd) {
            return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
        }
        // Either zero?
        if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;
        // Signs differ?
        if (xs !== ys) return xs;
        // Compare exponents.
        if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;
        xdL = xd.length;
        ydL = yd.length;
        // Compare digit by digit.
        for(i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i){
            if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
        }
        // Compare lengths.
        return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
    };
    /*
   * Return a new Decimal whose value is the cosine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * cos(0)         = 1
   * cos(-0)        = 1
   * cos(Infinity)  = NaN
   * cos(-Infinity) = NaN
   * cos(NaN)       = NaN
   *
   */ P.cosine = P.cos = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.d) return new Ctor(NaN);
        // cos(0) = cos(-0) = 1
        if (!x.d[0]) return new Ctor(1);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
        Ctor.rounding = 1;
        x = cosine(Ctor, toLessThanHalfPi(Ctor, x));
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
    };
    /*
   *
   * Return a new Decimal whose value is the cube root of the value of this Decimal, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   *  cbrt(0)  =  0
   *  cbrt(-0) = -0
   *  cbrt(1)  =  1
   *  cbrt(-1) = -1
   *  cbrt(N)  =  N
   *  cbrt(-I) = -I
   *  cbrt(I)  =  I
   *
   * Math.cbrt(x) = (x < 0 ? -Math.pow(-x, 1/3) : Math.pow(x, 1/3))
   *
   */ P.cubeRoot = P.cbrt = function() {
        var e, m, n, r, rep, s, sd, t, t3, t3plusx, x = this, Ctor = x.constructor;
        if (!x.isFinite() || x.isZero()) return new Ctor(x);
        external = false;
        // Initial estimate.
        s = x.s * mathpow(x.s * x, 1 / 3);
        // Math.cbrt underflow/overflow?
        // Pass x to Math.pow as integer, then adjust the exponent of the result.
        if (!s || Math.abs(s) == 1 / 0) {
            n = digitsToString(x.d);
            e = x.e;
            // Adjust n exponent so it is a multiple of 3 away from x exponent.
            if (s = (e - n.length + 1) % 3) n += s == 1 || s == -2 ? '0' : '00';
            s = mathpow(n, 1 / 3);
            // Rarely, e may be one less than the result exponent value.
            e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));
            if (s == 1 / 0) {
                n = '5e' + e;
            } else {
                n = s.toExponential();
                n = n.slice(0, n.indexOf('e') + 1) + e;
            }
            r = new Ctor(n);
            r.s = x.s;
        } else {
            r = new Ctor(s.toString());
        }
        sd = (e = Ctor.precision) + 3;
        // Halley's method.
        // TODO? Compare Newton's method.
        for(;;){
            t = r;
            t3 = t.times(t).times(t);
            t3plusx = t3.plus(x);
            r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);
            // TODO? Replace with for-loop and checkRoundingDigits.
            if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
                n = n.slice(sd - 3, sd + 1);
                // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or 4999
                // , i.e. approaching a rounding boundary, continue the iteration.
                if (n == '9999' || !rep && n == '4999') {
                    // On the first iteration only, check to see if rounding up gives the exact result as the
                    // nines may infinitely repeat.
                    if (!rep) {
                        finalise(t, e + 1, 0);
                        if (t.times(t).times(t).eq(x)) {
                            r = t;
                            break;
                        }
                    }
                    sd += 4;
                    rep = 1;
                } else {
                    // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
                    // If not, then there are further digits and m will be truthy.
                    if (!+n || !+n.slice(1) && n.charAt(0) == '5') {
                        // Truncate to the first rounding digit.
                        finalise(r, e + 1, 1);
                        m = !r.times(r).times(r).eq(x);
                    }
                    break;
                }
            }
        }
        external = true;
        return finalise(r, e, Ctor.rounding, m);
    };
    /*
   * Return the number of decimal places of the value of this Decimal.
   *
   */ P.decimalPlaces = P.dp = function() {
        var w, d = this.d, n = NaN;
        if (d) {
            w = d.length - 1;
            n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;
            // Subtract the number of trailing zeros of the last word.
            w = d[w];
            if (w) for(; w % 10 == 0; w /= 10)n--;
            if (n < 0) n = 0;
        }
        return n;
    };
    /*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new Decimal whose value is the value of this Decimal divided by `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   */ P.dividedBy = P.div = function(y) {
        return divide(this, new this.constructor(y));
    };
    /*
   * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
   * by the value of `y`, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */ P.dividedToIntegerBy = P.divToInt = function(y) {
        var x = this, Ctor = x.constructor;
        return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
    };
    /*
   * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
   *
   */ P.equals = P.eq = function(y) {
        return this.cmp(y) === 0;
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of negative Infinity.
   *
   */ P.floor = function() {
        return finalise(new this.constructor(this), this.e + 1, 3);
    };
    /*
   * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
   * false.
   *
   */ P.greaterThan = P.gt = function(y) {
        return this.cmp(y) > 0;
    };
    /*
   * Return true if the value of this Decimal is greater than or equal to the value of `y`,
   * otherwise return false.
   *
   */ P.greaterThanOrEqualTo = P.gte = function(y) {
        var k = this.cmp(y);
        return k == 1 || k === 0;
    };
    /*
   * Return a new Decimal whose value is the hyperbolic cosine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [1, Infinity]
   *
   * cosh(x) = 1 + x^2/2! + x^4/4! + x^6/6! + ...
   *
   * cosh(0)         = 1
   * cosh(-0)        = 1
   * cosh(Infinity)  = Infinity
   * cosh(-Infinity) = Infinity
   * cosh(NaN)       = NaN
   *
   *  x        time taken (ms)   result
   * 1000      9                 9.8503555700852349694e+433
   * 10000     25                4.4034091128314607936e+4342
   * 100000    171               1.4033316802130615897e+43429
   * 1000000   3817              1.5166076984010437725e+434294
   * 10000000  abandoned after 2 minute wait
   *
   * TODO? Compare performance of cosh(x) = 0.5 * (exp(x) + exp(-x))
   *
   */ P.hyperbolicCosine = P.cosh = function() {
        var k, n, pr, rm, len, x = this, Ctor = x.constructor, one = new Ctor(1);
        if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
        if (x.isZero()) return one;
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
        Ctor.rounding = 1;
        len = x.d.length;
        // Argument reduction: cos(4x) = 1 - 8cos^2(x) + 8cos^4(x) + 1
        // i.e. cos(x) = 1 - cos^2(x/4)(8 - 8cos^2(x/4))
        // Estimate the optimum number of times to use the argument reduction.
        // TODO? Estimation reused from cosine() and may not be optimal here.
        if (len < 32) {
            k = Math.ceil(len / 3);
            n = (1 / tinyPow(4, k)).toString();
        } else {
            k = 16;
            n = '2.3283064365386962890625e-10';
        }
        x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);
        // Reverse argument reduction
        var cosh2_x, i = k, d8 = new Ctor(8);
        for(; i--;){
            cosh2_x = x.times(x);
            x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
        }
        return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
    };
    /*
   * Return a new Decimal whose value is the hyperbolic sine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * sinh(x) = x + x^3/3! + x^5/5! + x^7/7! + ...
   *
   * sinh(0)         = 0
   * sinh(-0)        = -0
   * sinh(Infinity)  = Infinity
   * sinh(-Infinity) = -Infinity
   * sinh(NaN)       = NaN
   *
   * x        time taken (ms)
   * 10       2 ms
   * 100      5 ms
   * 1000     14 ms
   * 10000    82 ms
   * 100000   886 ms            1.4033316802130615897e+43429
   * 200000   2613 ms
   * 300000   5407 ms
   * 400000   8824 ms
   * 500000   13026 ms          8.7080643612718084129e+217146
   * 1000000  48543 ms
   *
   * TODO? Compare performance of sinh(x) = 0.5 * (exp(x) - exp(-x))
   *
   */ P.hyperbolicSine = P.sinh = function() {
        var k, pr, rm, len, x = this, Ctor = x.constructor;
        if (!x.isFinite() || x.isZero()) return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
        Ctor.rounding = 1;
        len = x.d.length;
        if (len < 3) {
            x = taylorSeries(Ctor, 2, x, x, true);
        } else {
            // Alternative argument reduction: sinh(3x) = sinh(x)(3 + 4sinh^2(x))
            // i.e. sinh(x) = sinh(x/3)(3 + 4sinh^2(x/3))
            // 3 multiplications and 1 addition
            // Argument reduction: sinh(5x) = sinh(x)(5 + sinh^2(x)(20 + 16sinh^2(x)))
            // i.e. sinh(x) = sinh(x/5)(5 + sinh^2(x/5)(20 + 16sinh^2(x/5)))
            // 4 multiplications and 2 additions
            // Estimate the optimum number of times to use the argument reduction.
            k = 1.4 * Math.sqrt(len);
            k = k > 16 ? 16 : k | 0;
            x = x.times(1 / tinyPow(5, k));
            x = taylorSeries(Ctor, 2, x, x, true);
            // Reverse argument reduction
            var sinh2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
            for(; k--;){
                sinh2_x = x.times(x);
                x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
            }
        }
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return finalise(x, pr, rm, true);
    };
    /*
   * Return a new Decimal whose value is the hyperbolic tangent of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * tanh(x) = sinh(x) / cosh(x)
   *
   * tanh(0)         = 0
   * tanh(-0)        = -0
   * tanh(Infinity)  = 1
   * tanh(-Infinity) = -1
   * tanh(NaN)       = NaN
   *
   */ P.hyperbolicTangent = P.tanh = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.isFinite()) return new Ctor(x.s);
        if (x.isZero()) return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + 7;
        Ctor.rounding = 1;
        return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
    };
    /*
   * Return a new Decimal whose value is the arccosine (inverse cosine) in radians of the value of
   * this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [0, pi]
   *
   * acos(x) = pi/2 - asin(x)
   *
   * acos(0)       = pi/2
   * acos(-0)      = pi/2
   * acos(1)       = 0
   * acos(-1)      = pi
   * acos(1/2)     = pi/3
   * acos(-1/2)    = 2*pi/3
   * acos(|x| > 1) = NaN
   * acos(NaN)     = NaN
   *
   */ P.inverseCosine = P.acos = function() {
        var halfPi, x = this, Ctor = x.constructor, k = x.abs().cmp(1), pr = Ctor.precision, rm = Ctor.rounding;
        if (k !== -1) {
            return k === 0 ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0) : new Ctor(NaN);
        }
        if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);
        // TODO? Special case acos(0.5) = pi/3 and acos(-0.5) = 2*pi/3
        Ctor.precision = pr + 6;
        Ctor.rounding = 1;
        x = x.asin();
        halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return halfPi.minus(x);
    };
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine in radians of the
   * value of this Decimal.
   *
   * Domain: [1, Infinity]
   * Range: [0, Infinity]
   *
   * acosh(x) = ln(x + sqrt(x^2 - 1))
   *
   * acosh(x < 1)     = NaN
   * acosh(NaN)       = NaN
   * acosh(Infinity)  = Infinity
   * acosh(-Infinity) = NaN
   * acosh(0)         = NaN
   * acosh(-0)        = NaN
   * acosh(1)         = 0
   * acosh(-1)        = NaN
   *
   */ P.inverseHyperbolicCosine = P.acosh = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
        if (!x.isFinite()) return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
        Ctor.rounding = 1;
        external = false;
        x = x.times(x).minus(1).sqrt().plus(x);
        external = true;
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return x.ln();
    };
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * asinh(x) = ln(x + sqrt(x^2 + 1))
   *
   * asinh(NaN)       = NaN
   * asinh(Infinity)  = Infinity
   * asinh(-Infinity) = -Infinity
   * asinh(0)         = 0
   * asinh(-0)        = -0
   *
   */ P.inverseHyperbolicSine = P.asinh = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.isFinite() || x.isZero()) return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
        Ctor.rounding = 1;
        external = false;
        x = x.times(x).plus(1).sqrt().plus(x);
        external = true;
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return x.ln();
    };
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent in radians of the
   * value of this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [-Infinity, Infinity]
   *
   * atanh(x) = 0.5 * ln((1 + x) / (1 - x))
   *
   * atanh(|x| > 1)   = NaN
   * atanh(NaN)       = NaN
   * atanh(Infinity)  = NaN
   * atanh(-Infinity) = NaN
   * atanh(0)         = 0
   * atanh(-0)        = -0
   * atanh(1)         = Infinity
   * atanh(-1)        = -Infinity
   *
   */ P.inverseHyperbolicTangent = P.atanh = function() {
        var pr, rm, wpr, xsd, x = this, Ctor = x.constructor;
        if (!x.isFinite()) return new Ctor(NaN);
        if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        xsd = x.sd();
        if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);
        Ctor.precision = wpr = xsd - x.e;
        x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);
        Ctor.precision = pr + 4;
        Ctor.rounding = 1;
        x = x.ln();
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return x.times(0.5);
    };
    /*
   * Return a new Decimal whose value is the arcsine (inverse sine) in radians of the value of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * asin(x) = 2*atan(x/(1 + sqrt(1 - x^2)))
   *
   * asin(0)       = 0
   * asin(-0)      = -0
   * asin(1/2)     = pi/6
   * asin(-1/2)    = -pi/6
   * asin(1)       = pi/2
   * asin(-1)      = -pi/2
   * asin(|x| > 1) = NaN
   * asin(NaN)     = NaN
   *
   * TODO? Compare performance of Taylor series.
   *
   */ P.inverseSine = P.asin = function() {
        var halfPi, k, pr, rm, x = this, Ctor = x.constructor;
        if (x.isZero()) return new Ctor(x);
        k = x.abs().cmp(1);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        if (k !== -1) {
            // |x| is 1
            if (k === 0) {
                halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
                halfPi.s = x.s;
                return halfPi;
            }
            // |x| > 1 or x is NaN
            return new Ctor(NaN);
        }
        // TODO? Special case asin(1/2) = pi/6 and asin(-1/2) = -pi/6
        Ctor.precision = pr + 6;
        Ctor.rounding = 1;
        x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return x.times(2);
    };
    /*
   * Return a new Decimal whose value is the arctangent (inverse tangent) in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
   *
   * atan(0)         = 0
   * atan(-0)        = -0
   * atan(1)         = pi/4
   * atan(-1)        = -pi/4
   * atan(Infinity)  = pi/2
   * atan(-Infinity) = -pi/2
   * atan(NaN)       = NaN
   *
   */ P.inverseTangent = P.atan = function() {
        var i, j, k, n, px, t, r, wpr, x2, x = this, Ctor = x.constructor, pr = Ctor.precision, rm = Ctor.rounding;
        if (!x.isFinite()) {
            if (!x.s) return new Ctor(NaN);
            if (pr + 4 <= PI_PRECISION) {
                r = getPi(Ctor, pr + 4, rm).times(0.5);
                r.s = x.s;
                return r;
            }
        } else if (x.isZero()) {
            return new Ctor(x);
        } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
            r = getPi(Ctor, pr + 4, rm).times(0.25);
            r.s = x.s;
            return r;
        }
        Ctor.precision = wpr = pr + 10;
        Ctor.rounding = 1;
        // TODO? if (x >= 1 && pr <= PI_PRECISION) atan(x) = halfPi * x.s - atan(1 / x);
        // Argument reduction
        // Ensure |x| < 0.42
        // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))
        k = Math.min(28, wpr / LOG_BASE + 2 | 0);
        for(i = k; i; --i)x = x.div(x.times(x).plus(1).sqrt().plus(1));
        external = false;
        j = Math.ceil(wpr / LOG_BASE);
        n = 1;
        x2 = x.times(x);
        r = new Ctor(x);
        px = x;
        // atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
        for(; i !== -1;){
            px = px.times(x2);
            t = r.minus(px.div(n += 2));
            px = px.times(x2);
            r = t.plus(px.div(n += 2));
            if (r.d[j] !== void 0) for(i = j; r.d[i] === t.d[i] && i--;);
        }
        if (k) r = r.times(2 << k - 1);
        external = true;
        return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
    };
    /*
   * Return true if the value of this Decimal is a finite number, otherwise return false.
   *
   */ P.isFinite = function() {
        return !!this.d;
    };
    /*
   * Return true if the value of this Decimal is an integer, otherwise return false.
   *
   */ P.isInteger = P.isInt = function() {
        return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
    };
    /*
   * Return true if the value of this Decimal is NaN, otherwise return false.
   *
   */ P.isNaN = function() {
        return !this.s;
    };
    /*
   * Return true if the value of this Decimal is negative, otherwise return false.
   *
   */ P.isNegative = P.isNeg = function() {
        return this.s < 0;
    };
    /*
   * Return true if the value of this Decimal is positive, otherwise return false.
   *
   */ P.isPositive = P.isPos = function() {
        return this.s > 0;
    };
    /*
   * Return true if the value of this Decimal is 0 or -0, otherwise return false.
   *
   */ P.isZero = function() {
        return !!this.d && this.d[0] === 0;
    };
    /*
   * Return true if the value of this Decimal is less than `y`, otherwise return false.
   *
   */ P.lessThan = P.lt = function(y) {
        return this.cmp(y) < 0;
    };
    /*
   * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
   *
   */ P.lessThanOrEqualTo = P.lte = function(y) {
        return this.cmp(y) < 1;
    };
    /*
   * Return the logarithm of the value of this Decimal to the specified base, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * If no base is specified, return log[10](arg).
   *
   * log[base](arg) = ln(arg) / ln(base)
   *
   * The result will always be correctly rounded if the base of the log is 10, and 'almost always'
   * otherwise:
   *
   * Depending on the rounding mode, the result may be incorrectly rounded if the first fifteen
   * rounding digits are [49]99999999999999 or [50]00000000000000. In that case, the maximum error
   * between the result and the correctly rounded result will be one ulp (unit in the last place).
   *
   * log[-b](a)       = NaN
   * log[0](a)        = NaN
   * log[1](a)        = NaN
   * log[NaN](a)      = NaN
   * log[Infinity](a) = NaN
   * log[b](0)        = -Infinity
   * log[b](-0)       = -Infinity
   * log[b](-a)       = NaN
   * log[b](1)        = 0
   * log[b](Infinity) = Infinity
   * log[b](NaN)      = NaN
   *
   * [base] {number|string|Decimal} The base of the logarithm.
   *
   */ P.logarithm = P.log = function(base) {
        var isBase10, d, denominator, k, inf, num, sd, r, arg = this, Ctor = arg.constructor, pr = Ctor.precision, rm = Ctor.rounding, guard = 5;
        // Default base is 10.
        if (base == null) {
            base = new Ctor(10);
            isBase10 = true;
        } else {
            base = new Ctor(base);
            d = base.d;
            // Return NaN if base is negative, or non-finite, or is 0 or 1.
            if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);
            isBase10 = base.eq(10);
        }
        d = arg.d;
        // Is arg negative, non-finite, 0 or 1?
        if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
            return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
        }
        // The result will have a non-terminating decimal expansion if base is 10 and arg is not an
        // integer power of 10.
        if (isBase10) {
            if (d.length > 1) {
                inf = true;
            } else {
                for(k = d[0]; k % 10 === 0;)k /= 10;
                inf = k !== 1;
            }
        }
        external = false;
        sd = pr + guard;
        num = naturalLogarithm(arg, sd);
        denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
        // The result will have 5 rounding digits.
        r = divide(num, denominator, sd, 1);
        // If at a rounding boundary, i.e. the result's rounding digits are [49]9999 or [50]0000,
        // calculate 10 further digits.
        //
        // If the result is known to have an infinite decimal expansion, repeat this until it is clear
        // that the result is above or below the boundary. Otherwise, if after calculating the 10
        // further digits, the last 14 are nines, round up and assume the result is exact.
        // Also assume the result is exact if the last 14 are zero.
        //
        // Example of a result that will be incorrectly rounded:
        // log[1048576](4503599627370502) = 2.60000000000000009610279511444746...
        // The above result correctly rounded using ROUND_CEIL to 1 decimal place should be 2.7, but it
        // will be given as 2.6 as there are 15 zeros immediately after the requested decimal place, so
        // the exact result would be assumed to be 2.6, which rounded using ROUND_CEIL to 1 decimal
        // place is still 2.6.
        if (checkRoundingDigits(r.d, k = pr, rm)) {
            do {
                sd += 10;
                num = naturalLogarithm(arg, sd);
                denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
                r = divide(num, denominator, sd, 1);
                if (!inf) {
                    // Check for 14 nines from the 2nd rounding digit, as the first may be 4.
                    if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
                        r = finalise(r, pr + 1, 0);
                    }
                    break;
                }
            }while (checkRoundingDigits(r.d, k += 10, rm))
        }
        external = true;
        return finalise(r, pr, rm);
    };
    /*
   * Return a new Decimal whose value is the maximum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.max = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'lt');
  };
   */ /*
   * Return a new Decimal whose value is the minimum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.min = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'gt');
  };
   */ /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new Decimal whose value is the value of this Decimal minus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */ P.minus = P.sub = function(y) {
        var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd, x = this, Ctor = x.constructor;
        y = new Ctor(y);
        // If either is not finite...
        if (!x.d || !y.d) {
            // Return NaN if either is NaN.
            if (!x.s || !y.s) y = new Ctor(NaN);
            else if (x.d) y.s = -y.s;
            else y = new Ctor(y.d || x.s !== y.s ? x : NaN);
            return y;
        }
        // If signs differ...
        if (x.s != y.s) {
            y.s = -y.s;
            return x.plus(y);
        }
        xd = x.d;
        yd = y.d;
        pr = Ctor.precision;
        rm = Ctor.rounding;
        // If either is zero...
        if (!xd[0] || !yd[0]) {
            // Return y negated if x is zero and y is non-zero.
            if (yd[0]) y.s = -y.s;
            else if (xd[0]) y = new Ctor(x);
            else return new Ctor(rm === 3 ? -0 : 0);
            return external ? finalise(y, pr, rm) : y;
        }
        // x and y are finite, non-zero numbers with the same sign.
        // Calculate base 1e7 exponents.
        e = mathfloor(y.e / LOG_BASE);
        xe = mathfloor(x.e / LOG_BASE);
        xd = xd.slice();
        k = xe - e;
        // If base 1e7 exponents differ...
        if (k) {
            xLTy = k < 0;
            if (xLTy) {
                d = xd;
                k = -k;
                len = yd.length;
            } else {
                d = yd;
                e = xe;
                len = xd.length;
            }
            // Numbers with massively different exponents would result in a very high number of
            // zeros needing to be prepended, but this can be avoided while still ensuring correct
            // rounding by limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
            i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
            if (k > i) {
                k = i;
                d.length = 1;
            }
            // Prepend zeros to equalise exponents.
            d.reverse();
            for(i = k; i--;)d.push(0);
            d.reverse();
        // Base 1e7 exponents equal.
        } else {
            // Check digits to determine which is the bigger number.
            i = xd.length;
            len = yd.length;
            xLTy = i < len;
            if (xLTy) len = i;
            for(i = 0; i < len; i++){
                if (xd[i] != yd[i]) {
                    xLTy = xd[i] < yd[i];
                    break;
                }
            }
            k = 0;
        }
        if (xLTy) {
            d = xd;
            xd = yd;
            yd = d;
            y.s = -y.s;
        }
        len = xd.length;
        // Append zeros to `xd` if shorter.
        // Don't add zeros to `yd` if shorter as subtraction only needs to start at `yd` length.
        for(i = yd.length - len; i > 0; --i)xd[len++] = 0;
        // Subtract yd from xd.
        for(i = yd.length; i > k;){
            if (xd[--i] < yd[i]) {
                for(j = i; j && xd[--j] === 0;)xd[j] = BASE - 1;
                --xd[j];
                xd[i] += BASE;
            }
            xd[i] -= yd[i];
        }
        // Remove trailing zeros.
        for(; xd[--len] === 0;)xd.pop();
        // Remove leading zeros and adjust exponent accordingly.
        for(; xd[0] === 0; xd.shift())--e;
        // Zero?
        if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);
        y.d = xd;
        y.e = getBase10Exponent(xd, e);
        return external ? finalise(y, pr, rm) : y;
    };
    /*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new Decimal whose value is the value of this Decimal modulo `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * The result depends on the modulo mode.
   *
   */ P.modulo = P.mod = function(y) {
        var q, x = this, Ctor = x.constructor;
        y = new Ctor(y);
        // Return NaN if x is ±Infinity or NaN, or y is NaN or ±0.
        if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);
        // Return x if y is ±Infinity or x is ±0.
        if (!y.d || x.d && !x.d[0]) {
            return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
        }
        // Prevent rounding of intermediate calculations.
        external = false;
        if (Ctor.modulo == 9) {
            // Euclidian division: q = sign(y) * floor(x / abs(y))
            // result = x - q * y    where  0 <= result < abs(y)
            q = divide(x, y.abs(), 0, 3, 1);
            q.s *= y.s;
        } else {
            q = divide(x, y, 0, Ctor.modulo, 1);
        }
        q = q.times(y);
        external = true;
        return x.minus(q);
    };
    /*
   * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
   * i.e. the base e raised to the power the value of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */ P.naturalExponential = P.exp = function() {
        return naturalExponential(this);
    };
    /*
   * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */ P.naturalLogarithm = P.ln = function() {
        return naturalLogarithm(this);
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
   * -1.
   *
   */ P.negated = P.neg = function() {
        var x = new this.constructor(this);
        x.s = -x.s;
        return finalise(x);
    };
    /*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new Decimal whose value is the value of this Decimal plus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */ P.plus = P.add = function(y) {
        var carry, d, e, i, k, len, pr, rm, xd, yd, x = this, Ctor = x.constructor;
        y = new Ctor(y);
        // If either is not finite...
        if (!x.d || !y.d) {
            // Return NaN if either is NaN.
            if (!x.s || !y.s) y = new Ctor(NaN);
            else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);
            return y;
        }
        // If signs differ...
        if (x.s != y.s) {
            y.s = -y.s;
            return x.minus(y);
        }
        xd = x.d;
        yd = y.d;
        pr = Ctor.precision;
        rm = Ctor.rounding;
        // If either is zero...
        if (!xd[0] || !yd[0]) {
            // Return x if y is zero.
            // Return y if y is non-zero.
            if (!yd[0]) y = new Ctor(x);
            return external ? finalise(y, pr, rm) : y;
        }
        // x and y are finite, non-zero numbers with the same sign.
        // Calculate base 1e7 exponents.
        k = mathfloor(x.e / LOG_BASE);
        e = mathfloor(y.e / LOG_BASE);
        xd = xd.slice();
        i = k - e;
        // If base 1e7 exponents differ...
        if (i) {
            if (i < 0) {
                d = xd;
                i = -i;
                len = yd.length;
            } else {
                d = yd;
                e = k;
                len = xd.length;
            }
            // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
            k = Math.ceil(pr / LOG_BASE);
            len = k > len ? k + 1 : len + 1;
            if (i > len) {
                i = len;
                d.length = 1;
            }
            // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
            d.reverse();
            for(; i--;)d.push(0);
            d.reverse();
        }
        len = xd.length;
        i = yd.length;
        // If yd is longer than xd, swap xd and yd so xd points to the longer array.
        if (len - i < 0) {
            i = len;
            d = yd;
            yd = xd;
            xd = d;
        }
        // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
        for(carry = 0; i;){
            carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
            xd[i] %= BASE;
        }
        if (carry) {
            xd.unshift(carry);
            ++e;
        }
        // Remove trailing zeros.
        // No need to check for zero, as +x + +y != 0 && -x + -y != 0
        for(len = xd.length; xd[--len] == 0;)xd.pop();
        y.d = xd;
        y.e = getBase10Exponent(xd, e);
        return external ? finalise(y, pr, rm) : y;
    };
    /*
   * Return the number of significant digits of the value of this Decimal.
   *
   * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
   *
   */ P.precision = P.sd = function(z) {
        var k, x = this;
        if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);
        if (x.d) {
            k = getPrecision(x.d);
            if (z && x.e + 1 > k) k = x.e + 1;
        } else {
            k = NaN;
        }
        return k;
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
   * rounding mode `rounding`.
   *
   */ P.round = function() {
        var x = this, Ctor = x.constructor;
        return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
    };
    /*
   * Return a new Decimal whose value is the sine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * sin(x) = x - x^3/3! + x^5/5! - ...
   *
   * sin(0)         = 0
   * sin(-0)        = -0
   * sin(Infinity)  = NaN
   * sin(-Infinity) = NaN
   * sin(NaN)       = NaN
   *
   */ P.sine = P.sin = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.isFinite()) return new Ctor(NaN);
        if (x.isZero()) return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
        Ctor.rounding = 1;
        x = sine(Ctor, toLessThanHalfPi(Ctor, x));
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
    };
    /*
   * Return a new Decimal whose value is the square root of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   *  sqrt(-n) =  N
   *  sqrt(N)  =  N
   *  sqrt(-I) =  N
   *  sqrt(I)  =  I
   *  sqrt(0)  =  0
   *  sqrt(-0) = -0
   *
   */ P.squareRoot = P.sqrt = function() {
        var m, n, sd, r, rep, t, x = this, d = x.d, e = x.e, s = x.s, Ctor = x.constructor;
        // Negative/NaN/Infinity/zero?
        if (s !== 1 || !d || !d[0]) {
            return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
        }
        external = false;
        // Initial estimate.
        s = Math.sqrt(+x);
        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
        if (s == 0 || s == 1 / 0) {
            n = digitsToString(d);
            if ((n.length + e) % 2 == 0) n += '0';
            s = Math.sqrt(n);
            e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
            if (s == 1 / 0) {
                n = '5e' + e;
            } else {
                n = s.toExponential();
                n = n.slice(0, n.indexOf('e') + 1) + e;
            }
            r = new Ctor(n);
        } else {
            r = new Ctor(s.toString());
        }
        sd = (e = Ctor.precision) + 3;
        // Newton-Raphson iteration.
        for(;;){
            t = r;
            r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);
            // TODO? Replace with for-loop and checkRoundingDigits.
            if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
                n = n.slice(sd - 3, sd + 1);
                // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
                // 4999, i.e. approaching a rounding boundary, continue the iteration.
                if (n == '9999' || !rep && n == '4999') {
                    // On the first iteration only, check to see if rounding up gives the exact result as the
                    // nines may infinitely repeat.
                    if (!rep) {
                        finalise(t, e + 1, 0);
                        if (t.times(t).eq(x)) {
                            r = t;
                            break;
                        }
                    }
                    sd += 4;
                    rep = 1;
                } else {
                    // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
                    // If not, then there are further digits and m will be truthy.
                    if (!+n || !+n.slice(1) && n.charAt(0) == '5') {
                        // Truncate to the first rounding digit.
                        finalise(r, e + 1, 1);
                        m = !r.times(r).eq(x);
                    }
                    break;
                }
            }
        }
        external = true;
        return finalise(r, e, Ctor.rounding, m);
    };
    /*
   * Return a new Decimal whose value is the tangent of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * tan(0)         = 0
   * tan(-0)        = -0
   * tan(Infinity)  = NaN
   * tan(-Infinity) = NaN
   * tan(NaN)       = NaN
   *
   */ P.tangent = P.tan = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.isFinite()) return new Ctor(NaN);
        if (x.isZero()) return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + 10;
        Ctor.rounding = 1;
        x = x.sin();
        x.s = 1;
        x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
    };
    /*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new Decimal whose value is this Decimal times `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   */ P.times = P.mul = function(y) {
        var carry, e, i, k, r, rL, t, xdL, ydL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
        y.s *= x.s;
        // If either is NaN, ±Infinity or ±0...
        if (!xd || !xd[0] || !yd || !yd[0]) {
            return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd ? NaN : !xd || !yd ? y.s / 0 : y.s * 0);
        }
        e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
        xdL = xd.length;
        ydL = yd.length;
        // Ensure xd points to the longer array.
        if (xdL < ydL) {
            r = xd;
            xd = yd;
            yd = r;
            rL = xdL;
            xdL = ydL;
            ydL = rL;
        }
        // Initialise the result array with zeros.
        r = [];
        rL = xdL + ydL;
        for(i = rL; i--;)r.push(0);
        // Multiply!
        for(i = ydL; --i >= 0;){
            carry = 0;
            for(k = xdL + i; k > i;){
                t = r[k] + yd[i] * xd[k - i - 1] + carry;
                r[k--] = t % BASE | 0;
                carry = t / BASE | 0;
            }
            r[k] = (r[k] + carry) % BASE | 0;
        }
        // Remove trailing zeros.
        for(; !r[--rL];)r.pop();
        if (carry) ++e;
        else r.shift();
        y.d = r;
        y.e = getBase10Exponent(r, e);
        return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
    };
    /*
   * Return a string representing the value of this Decimal in base 2, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */ P.toBinary = function(sd, rm) {
        return toStringBinary(this, 2, sd, rm);
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
   * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
   *
   * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */ P.toDecimalPlaces = P.toDP = function(dp, rm) {
        var x = this, Ctor = x.constructor;
        x = new Ctor(x);
        if (dp === void 0) return x;
        checkInt32(dp, 0, MAX_DIGITS);
        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);
        return finalise(x, dp + x.e + 1, rm);
    };
    /*
   * Return a string representing the value of this Decimal in exponential notation rounded to
   * `dp` fixed decimal places using rounding mode `rounding`.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */ P.toExponential = function(dp, rm) {
        var str, x = this, Ctor = x.constructor;
        if (dp === void 0) {
            str = finiteToString(x, true);
        } else {
            checkInt32(dp, 0, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
            x = finalise(new Ctor(x), dp + 1, rm);
            str = finiteToString(x, true, dp + 1);
        }
        return x.isNeg() && !x.isZero() ? '-' + str : str;
    };
    /*
   * Return a string representing the value of this Decimal in normal (fixed-point) notation to
   * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
   * omitted.
   *
   * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   * (-0).toFixed(3) is '0.000'.
   * (-0.5).toFixed(0) is '-0'.
   *
   */ P.toFixed = function(dp, rm) {
        var str, y, x = this, Ctor = x.constructor;
        if (dp === void 0) {
            str = finiteToString(x);
        } else {
            checkInt32(dp, 0, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
            y = finalise(new Ctor(x), dp + x.e + 1, rm);
            str = finiteToString(y, false, dp + y.e + 1);
        }
        // To determine whether to add the minus sign look at the value before it was rounded,
        // i.e. look at `x` rather than `y`.
        return x.isNeg() && !x.isZero() ? '-' + str : str;
    };
    /*
   * Return an array representing the value of this Decimal as a simple fraction with an integer
   * numerator and an integer denominator.
   *
   * The denominator will be a positive non-zero value less than or equal to the specified maximum
   * denominator. If a maximum denominator is not specified, the denominator will be the lowest
   * value necessary to represent the number exactly.
   *
   * [maxD] {number|string|Decimal} Maximum denominator. Integer >= 1 and < Infinity.
   *
   */ P.toFraction = function(maxD) {
        var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r, x = this, xd = x.d, Ctor = x.constructor;
        if (!xd) return new Ctor(x);
        n1 = d0 = new Ctor(1);
        d1 = n0 = new Ctor(0);
        d = new Ctor(d1);
        e = d.e = getPrecision(xd) - x.e - 1;
        k = e % LOG_BASE;
        d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);
        if (maxD == null) {
            // d is 10**e, the minimum max-denominator needed.
            maxD = e > 0 ? d : n1;
        } else {
            n = new Ctor(maxD);
            if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
            maxD = n.gt(d) ? e > 0 ? d : n1 : n;
        }
        external = false;
        n = new Ctor(digitsToString(xd));
        pr = Ctor.precision;
        Ctor.precision = e = xd.length * LOG_BASE * 2;
        for(;;){
            q = divide(n, d, 0, 1, 1);
            d2 = d0.plus(q.times(d1));
            if (d2.cmp(maxD) == 1) break;
            d0 = d1;
            d1 = d2;
            d2 = n1;
            n1 = n0.plus(q.times(d2));
            n0 = d2;
            d2 = d;
            d = n.minus(q.times(d2));
            n = d2;
        }
        d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
        n0 = n0.plus(d2.times(n1));
        d0 = d0.plus(d2.times(d1));
        n0.s = n1.s = x.s;
        // Determine which fraction is closer to x, n0/d0 or n1/d1?
        r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1 ? [
            n1,
            d1
        ] : [
            n0,
            d0
        ];
        Ctor.precision = pr;
        external = true;
        return r;
    };
    /*
   * Return a string representing the value of this Decimal in base 16, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */ P.toHexadecimal = P.toHex = function(sd, rm) {
        return toStringBinary(this, 16, sd, rm);
    };
    /*
   * Returns a new Decimal whose value is the nearest multiple of `y` in the direction of rounding
   * mode `rm`, or `Decimal.rounding` if `rm` is omitted, to the value of this Decimal.
   *
   * The return value will always have the same sign as this Decimal, unless either this Decimal
   * or `y` is NaN, in which case the return value will be also be NaN.
   *
   * The return value is not affected by the value of `precision`.
   *
   * y {number|string|Decimal} The magnitude to round to a multiple of.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toNearest() rounding mode not an integer: {rm}'
   * 'toNearest() rounding mode out of range: {rm}'
   *
   */ P.toNearest = function(y, rm) {
        var x = this, Ctor = x.constructor;
        x = new Ctor(x);
        if (y == null) {
            // If x is not finite, return x.
            if (!x.d) return x;
            y = new Ctor(1);
            rm = Ctor.rounding;
        } else {
            y = new Ctor(y);
            if (rm === void 0) {
                rm = Ctor.rounding;
            } else {
                checkInt32(rm, 0, 8);
            }
            // If x is not finite, return x if y is not NaN, else NaN.
            if (!x.d) return y.s ? x : y;
            // If y is not finite, return Infinity with the sign of x if y is Infinity, else NaN.
            if (!y.d) {
                if (y.s) y.s = x.s;
                return y;
            }
        }
        // If y is not zero, calculate the nearest multiple of y to x.
        if (y.d[0]) {
            external = false;
            x = divide(x, y, 0, rm, 1).times(y);
            external = true;
            finalise(x);
        // If y is zero, return zero with the sign of x.
        } else {
            y.s = x.s;
            x = y;
        }
        return x;
    };
    /*
   * Return the value of this Decimal converted to a number primitive.
   * Zero keeps its sign.
   *
   */ P.toNumber = function() {
        return +this;
    };
    /*
   * Return a string representing the value of this Decimal in base 8, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */ P.toOctal = function(sd, rm) {
        return toStringBinary(this, 8, sd, rm);
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal raised to the power `y`, rounded
   * to `precision` significant digits using rounding mode `rounding`.
   *
   * ECMAScript compliant.
   *
   *   pow(x, NaN)                           = NaN
   *   pow(x, ±0)                            = 1

   *   pow(NaN, non-zero)                    = NaN
   *   pow(abs(x) > 1, +Infinity)            = +Infinity
   *   pow(abs(x) > 1, -Infinity)            = +0
   *   pow(abs(x) == 1, ±Infinity)           = NaN
   *   pow(abs(x) < 1, +Infinity)            = +0
   *   pow(abs(x) < 1, -Infinity)            = +Infinity
   *   pow(+Infinity, y > 0)                 = +Infinity
   *   pow(+Infinity, y < 0)                 = +0
   *   pow(-Infinity, odd integer > 0)       = -Infinity
   *   pow(-Infinity, even integer > 0)      = +Infinity
   *   pow(-Infinity, odd integer < 0)       = -0
   *   pow(-Infinity, even integer < 0)      = +0
   *   pow(+0, y > 0)                        = +0
   *   pow(+0, y < 0)                        = +Infinity
   *   pow(-0, odd integer > 0)              = -0
   *   pow(-0, even integer > 0)             = +0
   *   pow(-0, odd integer < 0)              = -Infinity
   *   pow(-0, even integer < 0)             = +Infinity
   *   pow(finite x < 0, finite non-integer) = NaN
   *
   * For non-integer or very large exponents pow(x, y) is calculated using
   *
   *   x^y = exp(y*ln(x))
   *
   * Assuming the first 15 rounding digits are each equally likely to be any digit 0-9, the
   * probability of an incorrectly rounded result
   * P([49]9{14} | [50]0{14}) = 2 * 0.2 * 10^-14 = 4e-15 = 1/2.5e+14
   * i.e. 1 in 250,000,000,000,000
   *
   * If a result is incorrectly rounded the maximum error will be 1 ulp (unit in last place).
   *
   * y {number|string|Decimal} The power to which to raise this Decimal.
   *
   */ P.toPower = P.pow = function(y) {
        var e, k, pr, r, rm, s, x = this, Ctor = x.constructor, yn = +(y = new Ctor(y));
        // Either ±Infinity, NaN or ±0?
        if (!x.d || !y.d || !x.d[0] || !y.d[0]) return new Ctor(mathpow(+x, yn));
        x = new Ctor(x);
        if (x.eq(1)) return x;
        pr = Ctor.precision;
        rm = Ctor.rounding;
        if (y.eq(1)) return finalise(x, pr, rm);
        // y exponent
        e = mathfloor(y.e / LOG_BASE);
        // If y is a small integer use the 'exponentiation by squaring' algorithm.
        if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
            r = intPow(Ctor, x, k, pr);
            return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
        }
        s = x.s;
        // if x is negative
        if (s < 0) {
            // if y is not an integer
            if (e < y.d.length - 1) return new Ctor(NaN);
            // Result is positive if x is negative and the last digit of integer y is even.
            if ((y.d[e] & 1) == 0) s = 1;
            // if x.eq(-1)
            if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
                x.s = s;
                return x;
            }
        }
        // Estimate result exponent.
        // x^y = 10^e,  where e = y * log10(x)
        // log10(x) = log10(x_significand) + x_exponent
        // log10(x_significand) = ln(x_significand) / ln(10)
        k = mathpow(+x, yn);
        e = k == 0 || !isFinite(k) ? mathfloor(yn * (Math.log('0.' + digitsToString(x.d)) / Math.LN10 + x.e + 1)) : new Ctor(k + '').e;
        // Exponent estimate may be incorrect e.g. x: 0.999999999999999999, y: 2.29, e: 0, r.e: -1.
        // Overflow/underflow?
        if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? s / 0 : 0);
        external = false;
        Ctor.rounding = x.s = 1;
        // Estimate the extra guard digits needed to ensure five correct rounding digits from
        // naturalLogarithm(x). Example of failure without these extra digits (precision: 10):
        // new Decimal(2.32456).pow('2087987436534566.46411')
        // should be 1.162377823e+764914905173815, but is 1.162355823e+764914905173815
        k = Math.min(12, (e + '').length);
        // r = x^y = exp(y*ln(x))
        r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);
        // r may be Infinity, e.g. (0.9999999999999999).pow(-1e+40)
        if (r.d) {
            // Truncate to the required precision plus five rounding digits.
            r = finalise(r, pr + 5, 1);
            // If the rounding digits are [49]9999 or [50]0000 increase the precision by 10 and recalculate
            // the result.
            if (checkRoundingDigits(r.d, pr, rm)) {
                e = pr + 10;
                // Truncate to the increased precision plus five rounding digits.
                r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);
                // Check for 14 nines from the 2nd rounding digit (the first rounding digit may be 4 or 9).
                if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
                    r = finalise(r, pr + 1, 0);
                }
            }
        }
        r.s = s;
        external = true;
        Ctor.rounding = rm;
        return finalise(r, pr, rm);
    };
    /*
   * Return a string representing the value of this Decimal rounded to `sd` significant digits
   * using rounding mode `rounding`.
   *
   * Return exponential notation if `sd` is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */ P.toPrecision = function(sd, rm) {
        var str, x = this, Ctor = x.constructor;
        if (sd === void 0) {
            str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
        } else {
            checkInt32(sd, 1, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
            x = finalise(new Ctor(x), sd, rm);
            str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
        }
        return x.isNeg() && !x.isZero() ? '-' + str : str;
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
   * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
   * omitted.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toSD() digits out of range: {sd}'
   * 'toSD() digits not an integer: {sd}'
   * 'toSD() rounding mode not an integer: {rm}'
   * 'toSD() rounding mode out of range: {rm}'
   *
   */ P.toSignificantDigits = P.toSD = function(sd, rm) {
        var x = this, Ctor = x.constructor;
        if (sd === void 0) {
            sd = Ctor.precision;
            rm = Ctor.rounding;
        } else {
            checkInt32(sd, 1, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
        }
        return finalise(new Ctor(x), sd, rm);
    };
    /*
   * Return a string representing the value of this Decimal.
   *
   * Return exponential notation if this Decimal has a positive exponent equal to or greater than
   * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
   *
   */ P.toString = function() {
        var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
        return x.isNeg() && !x.isZero() ? '-' + str : str;
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal truncated to a whole number.
   *
   */ P.truncated = P.trunc = function() {
        return finalise(new this.constructor(this), this.e + 1, 1);
    };
    /*
   * Return a string representing the value of this Decimal.
   * Unlike `toString`, negative zero will include the minus sign.
   *
   */ P.valueOf = P.toJSON = function() {
        var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
        return x.isNeg() ? '-' + str : str;
    };
    // Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.
    /*
   *  digitsToString           P.cubeRoot, P.logarithm, P.squareRoot, P.toFraction, P.toPower,
   *                           finiteToString, naturalExponential, naturalLogarithm
   *  checkInt32               P.toDecimalPlaces, P.toExponential, P.toFixed, P.toNearest,
   *                           P.toPrecision, P.toSignificantDigits, toStringBinary, random
   *  checkRoundingDigits      P.logarithm, P.toPower, naturalExponential, naturalLogarithm
   *  convertBase              toStringBinary, parseOther
   *  cos                      P.cos
   *  divide                   P.atanh, P.cubeRoot, P.dividedBy, P.dividedToIntegerBy,
   *                           P.logarithm, P.modulo, P.squareRoot, P.tan, P.tanh, P.toFraction,
   *                           P.toNearest, toStringBinary, naturalExponential, naturalLogarithm,
   *                           taylorSeries, atan2, parseOther
   *  finalise                 P.absoluteValue, P.atan, P.atanh, P.ceil, P.cos, P.cosh,
   *                           P.cubeRoot, P.dividedToIntegerBy, P.floor, P.logarithm, P.minus,
   *                           P.modulo, P.negated, P.plus, P.round, P.sin, P.sinh, P.squareRoot,
   *                           P.tan, P.times, P.toDecimalPlaces, P.toExponential, P.toFixed,
   *                           P.toNearest, P.toPower, P.toPrecision, P.toSignificantDigits,
   *                           P.truncated, divide, getLn10, getPi, naturalExponential,
   *                           naturalLogarithm, ceil, floor, round, trunc
   *  finiteToString           P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf,
   *                           toStringBinary
   *  getBase10Exponent        P.minus, P.plus, P.times, parseOther
   *  getLn10                  P.logarithm, naturalLogarithm
   *  getPi                    P.acos, P.asin, P.atan, toLessThanHalfPi, atan2
   *  getPrecision             P.precision, P.toFraction
   *  getZeroString            digitsToString, finiteToString
   *  intPow                   P.toPower, parseOther
   *  isOdd                    toLessThanHalfPi
   *  maxOrMin                 max, min
   *  naturalExponential       P.naturalExponential, P.toPower
   *  naturalLogarithm         P.acosh, P.asinh, P.atanh, P.logarithm, P.naturalLogarithm,
   *                           P.toPower, naturalExponential
   *  nonFiniteToString        finiteToString, toStringBinary
   *  parseDecimal             Decimal
   *  parseOther               Decimal
   *  sin                      P.sin
   *  taylorSeries             P.cosh, P.sinh, cos, sin
   *  toLessThanHalfPi         P.cos, P.sin
   *  toStringBinary           P.toBinary, P.toHexadecimal, P.toOctal
   *  truncate                 intPow
   *
   *  Throws:                  P.logarithm, P.precision, P.toFraction, checkInt32, getLn10, getPi,
   *                           naturalLogarithm, config, parseOther, random, Decimal
   */ function digitsToString(d) {
        var i, k, ws, indexOfLastWord = d.length - 1, str = '', w = d[0];
        if (indexOfLastWord > 0) {
            str += w;
            for(i = 1; i < indexOfLastWord; i++){
                ws = d[i] + '';
                k = LOG_BASE - ws.length;
                if (k) str += getZeroString(k);
                str += ws;
            }
            w = d[i];
            ws = w + '';
            k = LOG_BASE - ws.length;
            if (k) str += getZeroString(k);
        } else if (w === 0) {
            return '0';
        }
        // Remove trailing zeros of last w.
        for(; w % 10 === 0;)w /= 10;
        return str + w;
    }
    function checkInt32(i, min, max) {
        if (i !== ~~i || i < min || i > max) {
            throw Error(invalidArgument + i);
        }
    }
    /*
   * Check 5 rounding digits if `repeating` is null, 4 otherwise.
   * `repeating == null` if caller is `log` or `pow`,
   * `repeating != null` if caller is `naturalLogarithm` or `naturalExponential`.
   */ function checkRoundingDigits(d, i, rm, repeating) {
        var di, k, r, rd;
        // Get the length of the first word of the array d.
        for(k = d[0]; k >= 10; k /= 10)--i;
        // Is the rounding digit in the first word of d?
        if (--i < 0) {
            i += LOG_BASE;
            di = 0;
        } else {
            di = Math.ceil((i + 1) / LOG_BASE);
            i %= LOG_BASE;
        }
        // i is the index (0 - 6) of the rounding digit.
        // E.g. if within the word 3487563 the first rounding digit is 5,
        // then i = 4, k = 1000, rd = 3487563 % 1000 = 563
        k = mathpow(10, LOG_BASE - i);
        rd = d[di] % k | 0;
        if (repeating == null) {
            if (i < 3) {
                if (i == 0) rd = rd / 100 | 0;
                else if (i == 1) rd = rd / 10 | 0;
                r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 50000 || rd == 0;
            } else {
                r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 || (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
            }
        } else {
            if (i < 4) {
                if (i == 0) rd = rd / 1000 | 0;
                else if (i == 1) rd = rd / 100 | 0;
                else if (i == 2) rd = rd / 10 | 0;
                r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
            } else {
                r = ((repeating || rm < 4) && rd + 1 == k || !repeating && rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 1000 | 0) == mathpow(10, i - 3) - 1;
            }
        }
        return r;
    }
    // Convert string of `baseIn` to an array of numbers of `baseOut`.
    // Eg. convertBase('255', 10, 16) returns [15, 15].
    // Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
    function convertBase(str, baseIn, baseOut) {
        var j, arr = [
            0
        ], arrL, i = 0, strL = str.length;
        for(; i < strL;){
            for(arrL = arr.length; arrL--;)arr[arrL] *= baseIn;
            arr[0] += NUMERALS.indexOf(str.charAt(i++));
            for(j = 0; j < arr.length; j++){
                if (arr[j] > baseOut - 1) {
                    if (arr[j + 1] === void 0) arr[j + 1] = 0;
                    arr[j + 1] += arr[j] / baseOut | 0;
                    arr[j] %= baseOut;
                }
            }
        }
        return arr.reverse();
    }
    /*
   * cos(x) = 1 - x^2/2! + x^4/4! - ...
   * |x| < pi/2
   *
   */ function cosine(Ctor, x) {
        var k, len, y;
        if (x.isZero()) return x;
        // Argument reduction: cos(4x) = 8*(cos^4(x) - cos^2(x)) + 1
        // i.e. cos(x) = 8*(cos^4(x/4) - cos^2(x/4)) + 1
        // Estimate the optimum number of times to use the argument reduction.
        len = x.d.length;
        if (len < 32) {
            k = Math.ceil(len / 3);
            y = (1 / tinyPow(4, k)).toString();
        } else {
            k = 16;
            y = '2.3283064365386962890625e-10';
        }
        Ctor.precision += k;
        x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));
        // Reverse argument reduction
        for(var i = k; i--;){
            var cos2x = x.times(x);
            x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
        }
        Ctor.precision -= k;
        return x;
    }
    /*
   * Perform division in the specified base.
   */ var divide = function() {
        // Assumes non-zero x and k, and hence non-zero result.
        function multiplyInteger(x, k, base) {
            var temp, carry = 0, i = x.length;
            for(x = x.slice(); i--;){
                temp = x[i] * k + carry;
                x[i] = temp % base | 0;
                carry = temp / base | 0;
            }
            if (carry) x.unshift(carry);
            return x;
        }
        function compare(a, b, aL, bL) {
            var i, r;
            if (aL != bL) {
                r = aL > bL ? 1 : -1;
            } else {
                for(i = r = 0; i < aL; i++){
                    if (a[i] != b[i]) {
                        r = a[i] > b[i] ? 1 : -1;
                        break;
                    }
                }
            }
            return r;
        }
        function subtract(a, b, aL, base) {
            var i = 0;
            // Subtract b from a.
            for(; aL--;){
                a[aL] -= i;
                i = a[aL] < b[aL] ? 1 : 0;
                a[aL] = i * base + a[aL] - b[aL];
            }
            // Remove leading zeros.
            for(; !a[0] && a.length > 1;)a.shift();
        }
        return function(x, y, pr, rm, dp, base) {
            var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x.constructor, sign = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
            // Either NaN, Infinity or 0?
            if (!xd || !xd[0] || !yd || !yd[0]) {
                return new Ctor(!x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
                xd && xd[0] == 0 || !yd ? sign * 0 : sign / 0);
            }
            if (base) {
                logBase = 1;
                e = x.e - y.e;
            } else {
                base = BASE;
                logBase = LOG_BASE;
                e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
            }
            yL = yd.length;
            xL = xd.length;
            q = new Ctor(sign);
            qd = q.d = [];
            // Result exponent may be one less than e.
            // The digit array of a Decimal from toStringBinary may have trailing zeros.
            for(i = 0; yd[i] == (xd[i] || 0); i++);
            if (yd[i] > (xd[i] || 0)) e--;
            if (pr == null) {
                sd = pr = Ctor.precision;
                rm = Ctor.rounding;
            } else if (dp) {
                sd = pr + (x.e - y.e) + 1;
            } else {
                sd = pr;
            }
            if (sd < 0) {
                qd.push(1);
                more = true;
            } else {
                // Convert precision in number of base 10 digits to base 1e7 digits.
                sd = sd / logBase + 2 | 0;
                i = 0;
                // divisor < 1e7
                if (yL == 1) {
                    k = 0;
                    yd = yd[0];
                    sd++;
                    // k is the carry.
                    for(; (i < xL || k) && sd--; i++){
                        t = k * base + (xd[i] || 0);
                        qd[i] = t / yd | 0;
                        k = t % yd | 0;
                    }
                    more = k || i < xL;
                // divisor >= 1e7
                } else {
                    // Normalise xd and yd so highest order digit of yd is >= base/2
                    k = base / (yd[0] + 1) | 0;
                    if (k > 1) {
                        yd = multiplyInteger(yd, k, base);
                        xd = multiplyInteger(xd, k, base);
                        yL = yd.length;
                        xL = xd.length;
                    }
                    xi = yL;
                    rem = xd.slice(0, yL);
                    remL = rem.length;
                    // Add zeros to make remainder as long as divisor.
                    for(; remL < yL;)rem[remL++] = 0;
                    yz = yd.slice();
                    yz.unshift(0);
                    yd0 = yd[0];
                    if (yd[1] >= base / 2) ++yd0;
                    do {
                        k = 0;
                        // Compare divisor and remainder.
                        cmp = compare(yd, rem, yL, remL);
                        // If divisor < remainder.
                        if (cmp < 0) {
                            // Calculate trial digit, k.
                            rem0 = rem[0];
                            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
                            // k will be how many times the divisor goes into the current remainder.
                            k = rem0 / yd0 | 0;
                            //  Algorithm:
                            //  1. product = divisor * trial digit (k)
                            //  2. if product > remainder: product -= divisor, k--
                            //  3. remainder -= product
                            //  4. if product was < remainder at 2:
                            //    5. compare new remainder and divisor
                            //    6. If remainder > divisor: remainder -= divisor, k++
                            if (k > 1) {
                                if (k >= base) k = base - 1;
                                // product = divisor * trial digit.
                                prod = multiplyInteger(yd, k, base);
                                prodL = prod.length;
                                remL = rem.length;
                                // Compare product and remainder.
                                cmp = compare(prod, rem, prodL, remL);
                                // product > remainder.
                                if (cmp == 1) {
                                    k--;
                                    // Subtract divisor from product.
                                    subtract(prod, yL < prodL ? yz : yd, prodL, base);
                                }
                            } else {
                                // cmp is -1.
                                // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
                                // to avoid it. If k is 1 there is a need to compare yd and rem again below.
                                if (k == 0) cmp = k = 1;
                                prod = yd.slice();
                            }
                            prodL = prod.length;
                            if (prodL < remL) prod.unshift(0);
                            // Subtract product from remainder.
                            subtract(rem, prod, remL, base);
                            // If product was < previous remainder.
                            if (cmp == -1) {
                                remL = rem.length;
                                // Compare divisor and new remainder.
                                cmp = compare(yd, rem, yL, remL);
                                // If divisor < new remainder, subtract divisor from remainder.
                                if (cmp < 1) {
                                    k++;
                                    // Subtract divisor from remainder.
                                    subtract(rem, yL < remL ? yz : yd, remL, base);
                                }
                            }
                            remL = rem.length;
                        } else if (cmp === 0) {
                            k++;
                            rem = [
                                0
                            ];
                        } // if cmp === 1, k will be 0
                        // Add the next digit, k, to the result array.
                        qd[i++] = k;
                        // Update the remainder.
                        if (cmp && rem[0]) {
                            rem[remL++] = xd[xi] || 0;
                        } else {
                            rem = [
                                xd[xi]
                            ];
                            remL = 1;
                        }
                    }while ((xi++ < xL || rem[0] !== void 0) && sd--)
                    more = rem[0] !== void 0;
                }
                // Leading zero?
                if (!qd[0]) qd.shift();
            }
            // logBase is 1 when divide is being used for base conversion.
            if (logBase == 1) {
                q.e = e;
                inexact = more;
            } else {
                // To calculate q.e, first get the number of digits of qd[0].
                for(i = 1, k = qd[0]; k >= 10; k /= 10)i++;
                q.e = i + e * logBase - 1;
                finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
            }
            return q;
        };
    }();
    /*
   * Round `x` to `sd` significant digits using rounding mode `rm`.
   * Check for over/under-flow.
   */ function finalise(x, sd, rm, isTruncated) {
        var digits, i, j, k, rd, roundUp, w, xd, xdi, Ctor = x.constructor;
        // Don't round if sd is null or undefined.
        out: if (sd != null) {
            xd = x.d;
            // Infinity/NaN.
            if (!xd) return x;
            // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
            // w: the word of xd containing rd, a base 1e7 number.
            // xdi: the index of w within xd.
            // digits: the number of digits of w.
            // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
            // they had leading zeros)
            // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).
            // Get the length of the first word of the digits array xd.
            for(digits = 1, k = xd[0]; k >= 10; k /= 10)digits++;
            i = sd - digits;
            // Is the rounding digit in the first word of xd?
            if (i < 0) {
                i += LOG_BASE;
                j = sd;
                w = xd[xdi = 0];
                // Get the rounding digit at index j of w.
                rd = w / mathpow(10, digits - j - 1) % 10 | 0;
            } else {
                xdi = Math.ceil((i + 1) / LOG_BASE);
                k = xd.length;
                if (xdi >= k) {
                    if (isTruncated) {
                        // Needed by `naturalExponential`, `naturalLogarithm` and `squareRoot`.
                        for(; k++ <= xdi;)xd.push(0);
                        w = rd = 0;
                        digits = 1;
                        i %= LOG_BASE;
                        j = i - LOG_BASE + 1;
                    } else {
                        break out;
                    }
                } else {
                    w = k = xd[xdi];
                    // Get the number of digits of w.
                    for(digits = 1; k >= 10; k /= 10)digits++;
                    // Get the index of rd within w.
                    i %= LOG_BASE;
                    // Get the index of rd within w, adjusted for leading zeros.
                    // The number of leading zeros of w is given by LOG_BASE - digits.
                    j = i - LOG_BASE + digits;
                    // Get the rounding digit at index j of w.
                    rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
                }
            }
            // Are there any non-zero digits after the rounding digit?
            isTruncated = isTruncated || sd < 0 || xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));
            // The expression `w % mathpow(10, digits - j - 1)` returns all the digits of w to the right
            // of the digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression
            // will give 714.
            roundUp = rm < 4 ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 && (i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
            if (sd < 1 || !xd[0]) {
                xd.length = 0;
                if (roundUp) {
                    // Convert sd to decimal places.
                    sd -= x.e + 1;
                    // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                    xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
                    x.e = -sd || 0;
                } else {
                    // Zero.
                    xd[0] = x.e = 0;
                }
                return x;
            }
            // Remove excess digits.
            if (i == 0) {
                xd.length = xdi;
                k = 1;
                xdi--;
            } else {
                xd.length = xdi + 1;
                k = mathpow(10, LOG_BASE - i);
                // E.g. 56700 becomes 56000 if 7 is the rounding digit.
                // j > 0 means i > number of leading zeros of w.
                xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
            }
            if (roundUp) {
                for(;;){
                    // Is the digit to be rounded up in the first word of xd?
                    if (xdi == 0) {
                        // i will be the length of xd[0] before k is added.
                        for(i = 1, j = xd[0]; j >= 10; j /= 10)i++;
                        j = xd[0] += k;
                        for(k = 1; j >= 10; j /= 10)k++;
                        // if i != k the length has increased.
                        if (i != k) {
                            x.e++;
                            if (xd[0] == BASE) xd[0] = 1;
                        }
                        break;
                    } else {
                        xd[xdi] += k;
                        if (xd[xdi] != BASE) break;
                        xd[xdi--] = 0;
                        k = 1;
                    }
                }
            }
            // Remove trailing zeros.
            for(i = xd.length; xd[--i] === 0;)xd.pop();
        }
        if (external) {
            // Overflow?
            if (x.e > Ctor.maxE) {
                // Infinity.
                x.d = null;
                x.e = NaN;
            // Underflow?
            } else if (x.e < Ctor.minE) {
                // Zero.
                x.e = 0;
                x.d = [
                    0
                ];
            // Ctor.underflow = true;
            } // else Ctor.underflow = false;
        }
        return x;
    }
    function finiteToString(x, isExp, sd) {
        if (!x.isFinite()) return nonFiniteToString(x);
        var k, e = x.e, str = digitsToString(x.d), len = str.length;
        if (isExp) {
            if (sd && (k = sd - len) > 0) {
                str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
            } else if (len > 1) {
                str = str.charAt(0) + '.' + str.slice(1);
            }
            str = str + (x.e < 0 ? 'e' : 'e+') + x.e;
        } else if (e < 0) {
            str = '0.' + getZeroString(-e - 1) + str;
            if (sd && (k = sd - len) > 0) str += getZeroString(k);
        } else if (e >= len) {
            str += getZeroString(e + 1 - len);
            if (sd && (k = sd - e - 1) > 0) str = str + '.' + getZeroString(k);
        } else {
            if ((k = e + 1) < len) str = str.slice(0, k) + '.' + str.slice(k);
            if (sd && (k = sd - len) > 0) {
                if (e + 1 === len) str += '.';
                str += getZeroString(k);
            }
        }
        return str;
    }
    // Calculate the base 10 exponent from the base 1e7 exponent.
    function getBase10Exponent(digits, e) {
        var w = digits[0];
        // Add the number of digits of the first word of the digits array.
        for(e *= LOG_BASE; w >= 10; w /= 10)e++;
        return e;
    }
    function getLn10(Ctor, sd, pr) {
        if (sd > LN10_PRECISION) {
            // Reset global state in case the exception is caught.
            external = true;
            if (pr) Ctor.precision = pr;
            throw Error(precisionLimitExceeded);
        }
        return finalise(new Ctor(LN10), sd, 1, true);
    }
    function getPi(Ctor, sd, rm) {
        if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
        return finalise(new Ctor(PI), sd, rm, true);
    }
    function getPrecision(digits) {
        var w = digits.length - 1, len = w * LOG_BASE + 1;
        w = digits[w];
        // If non-zero...
        if (w) {
            // Subtract the number of trailing zeros of the last word.
            for(; w % 10 == 0; w /= 10)len--;
            // Add the number of digits of the first word.
            for(w = digits[0]; w >= 10; w /= 10)len++;
        }
        return len;
    }
    function getZeroString(k) {
        var zs = '';
        for(; k--;)zs += '0';
        return zs;
    }
    /*
   * Return a new Decimal whose value is the value of Decimal `x` to the power `n`, where `n` is an
   * integer of type number.
   *
   * Implements 'exponentiation by squaring'. Called by `pow` and `parseOther`.
   *
   */ function intPow(Ctor, x, n, pr) {
        var isTruncated, r = new Ctor(1), // Max n of 9007199254740991 takes 53 loop iterations.
        // Maximum digits array length; leaves [28, 34] guard digits.
        k = Math.ceil(pr / LOG_BASE + 4);
        external = false;
        for(;;){
            if (n % 2) {
                r = r.times(x);
                if (truncate(r.d, k)) isTruncated = true;
            }
            n = mathfloor(n / 2);
            if (n === 0) {
                // To ensure correct rounding when r.d is truncated, increment the last word if it is zero.
                n = r.d.length - 1;
                if (isTruncated && r.d[n] === 0) ++r.d[n];
                break;
            }
            x = x.times(x);
            truncate(x.d, k);
        }
        external = true;
        return r;
    }
    function isOdd(n) {
        return n.d[n.d.length - 1] & 1;
    }
    /*
   * Handle `max` and `min`. `ltgt` is 'lt' or 'gt'.
   */ function maxOrMin(Ctor, args, ltgt) {
        var y, x = new Ctor(args[0]), i = 0;
        for(; ++i < args.length;){
            y = new Ctor(args[i]);
            if (!y.s) {
                x = y;
                break;
            } else if (x[ltgt](y)) {
                x = y;
            }
        }
        return x;
    }
    /*
   * Return a new Decimal whose value is the natural exponential of `x` rounded to `sd` significant
   * digits.
   *
   * Taylor/Maclaurin series.
   *
   * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
   *
   * Argument reduction:
   *   Repeat x = x / 32, k += 5, until |x| < 0.1
   *   exp(x) = exp(x / 2^k)^(2^k)
   *
   * Previously, the argument was initially reduced by
   * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
   * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
   * found to be slower than just dividing repeatedly by 32 as above.
   *
   * Max integer argument: exp('20723265836946413') = 6.3e+9000000000000000
   * Min integer argument: exp('-20723265836946411') = 1.2e-9000000000000000
   * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
   *
   *  exp(Infinity)  = Infinity
   *  exp(-Infinity) = 0
   *  exp(NaN)       = NaN
   *  exp(±0)        = 1
   *
   *  exp(x) is non-terminating for any finite, non-zero x.
   *
   *  The result will always be correctly rounded.
   *
   */ function naturalExponential(x, sd) {
        var denominator, guard, j, pow, sum, t, wpr, rep = 0, i = 0, k = 0, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
        // 0/NaN/Infinity?
        if (!x.d || !x.d[0] || x.e > 17) {
            return new Ctor(x.d ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0 : x.s ? x.s < 0 ? 0 : x : 0 / 0);
        }
        if (sd == null) {
            external = false;
            wpr = pr;
        } else {
            wpr = sd;
        }
        t = new Ctor(0.03125);
        // while abs(x) >= 0.1
        while(x.e > -2){
            // x = x / 2^5
            x = x.times(t);
            k += 5;
        }
        // Use 2 * log10(2^k) + 5 (empirically derived) to estimate the increase in precision
        // necessary to ensure the first 4 rounding digits are correct.
        guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
        wpr += guard;
        denominator = pow = sum = new Ctor(1);
        Ctor.precision = wpr;
        for(;;){
            pow = finalise(pow.times(x), wpr, 1);
            denominator = denominator.times(++i);
            t = sum.plus(divide(pow, denominator, wpr, 1));
            if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
                j = k;
                while(j--)sum = finalise(sum.times(sum), wpr, 1);
                // Check to see if the first 4 rounding digits are [49]999.
                // If so, repeat the summation with a higher precision, otherwise
                // e.g. with precision: 18, rounding: 1
                // exp(18.404272462595034083567793919843761) = 98372560.1229999999 (should be 98372560.123)
                // `wpr - guard` is the index of first rounding digit.
                if (sd == null) {
                    if (rep < 3 && checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
                        Ctor.precision = wpr += 10;
                        denominator = pow = t = new Ctor(1);
                        i = 0;
                        rep++;
                    } else {
                        return finalise(sum, Ctor.precision = pr, rm, external = true);
                    }
                } else {
                    Ctor.precision = pr;
                    return sum;
                }
            }
            sum = t;
        }
    }
    /*
   * Return a new Decimal whose value is the natural logarithm of `x` rounded to `sd` significant
   * digits.
   *
   *  ln(-n)        = NaN
   *  ln(0)         = -Infinity
   *  ln(-0)        = -Infinity
   *  ln(1)         = 0
   *  ln(Infinity)  = Infinity
   *  ln(-Infinity) = NaN
   *  ln(NaN)       = NaN
   *
   *  ln(n) (n != 1) is non-terminating.
   *
   */ function naturalLogarithm(y, sd) {
        var c, c0, denominator, e, numerator, rep, sum, t, wpr, x1, x2, n = 1, guard = 10, x = y, xd = x.d, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
        // Is x negative or Infinity, NaN, 0 or 1?
        if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
            return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
        }
        if (sd == null) {
            external = false;
            wpr = pr;
        } else {
            wpr = sd;
        }
        Ctor.precision = wpr += guard;
        c = digitsToString(xd);
        c0 = c.charAt(0);
        if (Math.abs(e = x.e) < 1.5e15) {
            // Argument reduction.
            // The series converges faster the closer the argument is to 1, so using
            // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
            // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
            // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
            // later be divided by this number, then separate out the power of 10 using
            // ln(a*10^b) = ln(a) + b*ln(10).
            // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
            //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
            // max n is 6 (gives 0.7 - 1.3)
            while(c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3){
                x = x.times(y);
                c = digitsToString(x.d);
                c0 = c.charAt(0);
                n++;
            }
            e = x.e;
            if (c0 > 1) {
                x = new Ctor('0.' + c);
                e++;
            } else {
                x = new Ctor(c0 + '.' + c.slice(1));
            }
        } else {
            // The argument reduction method above may result in overflow if the argument y is a massive
            // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
            // function using ln(x*10^e) = ln(x) + e*ln(10).
            t = getLn10(Ctor, wpr + 2, pr).times(e + '');
            x = naturalLogarithm(new Ctor(c0 + '.' + c.slice(1)), wpr - guard).plus(t);
            Ctor.precision = pr;
            return sd == null ? finalise(x, pr, rm, external = true) : x;
        }
        // x1 is x reduced to a value near 1.
        x1 = x;
        // Taylor series.
        // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
        // where x = (y - 1)/(y + 1)    (|x| < 1)
        sum = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
        x2 = finalise(x.times(x), wpr, 1);
        denominator = 3;
        for(;;){
            numerator = finalise(numerator.times(x2), wpr, 1);
            t = sum.plus(divide(numerator, new Ctor(denominator), wpr, 1));
            if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
                sum = sum.times(2);
                // Reverse the argument reduction. Check that e is not 0 because, besides preventing an
                // unnecessary calculation, -0 + 0 = +0 and to ensure correct rounding -0 needs to stay -0.
                if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
                sum = divide(sum, new Ctor(n), wpr, 1);
                // Is rm > 3 and the first 4 rounding digits 4999, or rm < 4 (or the summation has
                // been repeated previously) and the first 4 rounding digits 9999?
                // If so, restart the summation with a higher precision, otherwise
                // e.g. with precision: 12, rounding: 1
                // ln(135520028.6126091714265381533) = 18.7246299999 when it should be 18.72463.
                // `wpr - guard` is the index of first rounding digit.
                if (sd == null) {
                    if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
                        Ctor.precision = wpr += guard;
                        t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
                        x2 = finalise(x.times(x), wpr, 1);
                        denominator = rep = 1;
                    } else {
                        return finalise(sum, Ctor.precision = pr, rm, external = true);
                    }
                } else {
                    Ctor.precision = pr;
                    return sum;
                }
            }
            sum = t;
            denominator += 2;
        }
    }
    // ±Infinity, NaN.
    function nonFiniteToString(x) {
        // Unsigned.
        return String(x.s * x.s / 0);
    }
    /*
   * Parse the value of a new Decimal `x` from string `str`.
   */ function parseDecimal(x, str) {
        var e, i, len;
        // Decimal point?
        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
        // Exponential form?
        if ((i = str.search(/e/i)) > 0) {
            // Determine exponent.
            if (e < 0) e = i;
            e += +str.slice(i + 1);
            str = str.substring(0, i);
        } else if (e < 0) {
            // Integer.
            e = str.length;
        }
        // Determine leading zeros.
        for(i = 0; str.charCodeAt(i) === 48; i++);
        // Determine trailing zeros.
        for(len = str.length; str.charCodeAt(len - 1) === 48; --len);
        str = str.slice(i, len);
        if (str) {
            len -= i;
            x.e = e = e - i - 1;
            x.d = [];
            // Transform base
            // e is the base 10 exponent.
            // i is where to slice str to get the first word of the digits array.
            i = (e + 1) % LOG_BASE;
            if (e < 0) i += LOG_BASE;
            if (i < len) {
                if (i) x.d.push(+str.slice(0, i));
                for(len -= LOG_BASE; i < len;)x.d.push(+str.slice(i, i += LOG_BASE));
                str = str.slice(i);
                i = LOG_BASE - str.length;
            } else {
                i -= len;
            }
            for(; i--;)str += '0';
            x.d.push(+str);
            if (external) {
                // Overflow?
                if (x.e > x.constructor.maxE) {
                    // Infinity.
                    x.d = null;
                    x.e = NaN;
                // Underflow?
                } else if (x.e < x.constructor.minE) {
                    // Zero.
                    x.e = 0;
                    x.d = [
                        0
                    ];
                // x.constructor.underflow = true;
                } // else x.constructor.underflow = false;
            }
        } else {
            // Zero.
            x.e = 0;
            x.d = [
                0
            ];
        }
        return x;
    }
    /*
   * Parse the value of a new Decimal `x` from a string `str`, which is not a decimal value.
   */ function parseOther(x, str) {
        var base, Ctor, divisor, i, isFloat, len, p, xd, xe;
        if (str.indexOf('_') > -1) {
            str = str.replace(/(\d)_(?=\d)/g, '$1');
            if (isDecimal.test(str)) return parseDecimal(x, str);
        } else if (str === 'Infinity' || str === 'NaN') {
            if (!+str) x.s = NaN;
            x.e = NaN;
            x.d = null;
            return x;
        }
        if (isHex.test(str)) {
            base = 16;
            str = str.toLowerCase();
        } else if (isBinary.test(str)) {
            base = 2;
        } else if (isOctal.test(str)) {
            base = 8;
        } else {
            throw Error(invalidArgument + str);
        }
        // Is there a binary exponent part?
        i = str.search(/p/i);
        if (i > 0) {
            p = +str.slice(i + 1);
            str = str.substring(2, i);
        } else {
            str = str.slice(2);
        }
        // Convert `str` as an integer then divide the result by `base` raised to a power such that the
        // fraction part will be restored.
        i = str.indexOf('.');
        isFloat = i >= 0;
        Ctor = x.constructor;
        if (isFloat) {
            str = str.replace('.', '');
            len = str.length;
            i = len - i;
            // log[10](16) = 1.2041... , log[10](88) = 1.9444....
            divisor = intPow(Ctor, new Ctor(base), i, i * 2);
        }
        xd = convertBase(str, base, BASE);
        xe = xd.length - 1;
        // Remove trailing zeros.
        for(i = xe; xd[i] === 0; --i)xd.pop();
        if (i < 0) return new Ctor(x.s * 0);
        x.e = getBase10Exponent(xd, xe);
        x.d = xd;
        external = false;
        // At what precision to perform the division to ensure exact conversion?
        // maxDecimalIntegerPartDigitCount = ceil(log[10](b) * otherBaseIntegerPartDigitCount)
        // log[10](2) = 0.30103, log[10](8) = 0.90309, log[10](16) = 1.20412
        // E.g. ceil(1.2 * 3) = 4, so up to 4 decimal digits are needed to represent 3 hex int digits.
        // maxDecimalFractionPartDigitCount = {Hex:4|Oct:3|Bin:1} * otherBaseFractionPartDigitCount
        // Therefore using 4 * the number of digits of str will always be enough.
        if (isFloat) x = divide(x, divisor, len * 4);
        // Multiply by the binary exponent part if present.
        if (p) x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
        external = true;
        return x;
    }
    /*
   * sin(x) = x - x^3/3! + x^5/5! - ...
   * |x| < pi/2
   *
   */ function sine(Ctor, x) {
        var k, len = x.d.length;
        if (len < 3) {
            return x.isZero() ? x : taylorSeries(Ctor, 2, x, x);
        }
        // Argument reduction: sin(5x) = 16*sin^5(x) - 20*sin^3(x) + 5*sin(x)
        // i.e. sin(x) = 16*sin^5(x/5) - 20*sin^3(x/5) + 5*sin(x/5)
        // and  sin(x) = sin(x/5)(5 + sin^2(x/5)(16sin^2(x/5) - 20))
        // Estimate the optimum number of times to use the argument reduction.
        k = 1.4 * Math.sqrt(len);
        k = k > 16 ? 16 : k | 0;
        x = x.times(1 / tinyPow(5, k));
        x = taylorSeries(Ctor, 2, x, x);
        // Reverse argument reduction
        var sin2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
        for(; k--;){
            sin2_x = x.times(x);
            x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
        }
        return x;
    }
    // Calculate Taylor series for `cos`, `cosh`, `sin` and `sinh`.
    function taylorSeries(Ctor, n, x, y, isHyperbolic) {
        var j, t, u, x2, i = 1, pr = Ctor.precision, k = Math.ceil(pr / LOG_BASE);
        external = false;
        x2 = x.times(x);
        u = new Ctor(y);
        for(;;){
            t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
            u = isHyperbolic ? y.plus(t) : y.minus(t);
            y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
            t = u.plus(y);
            if (t.d[k] !== void 0) {
                for(j = k; t.d[j] === u.d[j] && j--;);
                if (j == -1) break;
            }
            j = u;
            u = y;
            y = t;
            t = j;
            i++;
        }
        external = true;
        t.d.length = k + 1;
        return t;
    }
    // Exponent e must be positive and non-zero.
    function tinyPow(b, e) {
        var n = b;
        while(--e)n *= b;
        return n;
    }
    // Return the absolute value of `x` reduced to less than or equal to half pi.
    function toLessThanHalfPi(Ctor, x) {
        var t, isNeg = x.s < 0, pi = getPi(Ctor, Ctor.precision, 1), halfPi = pi.times(0.5);
        x = x.abs();
        if (x.lte(halfPi)) {
            quadrant = isNeg ? 4 : 1;
            return x;
        }
        t = x.divToInt(pi);
        if (t.isZero()) {
            quadrant = isNeg ? 3 : 2;
        } else {
            x = x.minus(t.times(pi));
            // 0 <= x < pi
            if (x.lte(halfPi)) {
                quadrant = isOdd(t) ? isNeg ? 2 : 3 : isNeg ? 4 : 1;
                return x;
            }
            quadrant = isOdd(t) ? isNeg ? 1 : 4 : isNeg ? 3 : 2;
        }
        return x.minus(pi).abs();
    }
    /*
   * Return the value of Decimal `x` as a string in base `baseOut`.
   *
   * If the optional `sd` argument is present include a binary exponent suffix.
   */ function toStringBinary(x, baseOut, sd, rm) {
        var base, e, i, k, len, roundUp, str, xd, y, Ctor = x.constructor, isExp = sd !== void 0;
        if (isExp) {
            checkInt32(sd, 1, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
        } else {
            sd = Ctor.precision;
            rm = Ctor.rounding;
        }
        if (!x.isFinite()) {
            str = nonFiniteToString(x);
        } else {
            str = finiteToString(x);
            i = str.indexOf('.');
            // Use exponential notation according to `toExpPos` and `toExpNeg`? No, but if required:
            // maxBinaryExponent = floor((decimalExponent + 1) * log[2](10))
            // minBinaryExponent = floor(decimalExponent * log[2](10))
            // log[2](10) = 3.321928094887362347870319429489390175864
            if (isExp) {
                base = 2;
                if (baseOut == 16) {
                    sd = sd * 4 - 3;
                } else if (baseOut == 8) {
                    sd = sd * 3 - 2;
                }
            } else {
                base = baseOut;
            }
            // Convert the number as an integer then divide the result by its base raised to a power such
            // that the fraction part will be restored.
            // Non-integer.
            if (i >= 0) {
                str = str.replace('.', '');
                y = new Ctor(1);
                y.e = str.length - i;
                y.d = convertBase(finiteToString(y), 10, base);
                y.e = y.d.length;
            }
            xd = convertBase(str, 10, base);
            e = len = xd.length;
            // Remove trailing zeros.
            for(; xd[--len] == 0;)xd.pop();
            if (!xd[0]) {
                str = isExp ? '0p+0' : '0';
            } else {
                if (i < 0) {
                    e--;
                } else {
                    x = new Ctor(x);
                    x.d = xd;
                    x.e = e;
                    x = divide(x, y, sd, rm, 0, base);
                    xd = x.d;
                    e = x.e;
                    roundUp = inexact;
                }
                // The rounding digit, i.e. the digit after the digit that may be rounded up.
                i = xd[sd];
                k = base / 2;
                roundUp = roundUp || xd[sd + 1] !== void 0;
                roundUp = rm < 4 ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2)) : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 || rm === (x.s < 0 ? 8 : 7));
                xd.length = sd;
                if (roundUp) {
                    // Rounding up may mean the previous digit has to be rounded up and so on.
                    for(; ++xd[--sd] > base - 1;){
                        xd[sd] = 0;
                        if (!sd) {
                            ++e;
                            xd.unshift(1);
                        }
                    }
                }
                // Determine trailing zeros.
                for(len = xd.length; !xd[len - 1]; --len);
                // E.g. [4, 11, 15] becomes 4bf.
                for(i = 0, str = ''; i < len; i++)str += NUMERALS.charAt(xd[i]);
                // Add binary exponent suffix?
                if (isExp) {
                    if (len > 1) {
                        if (baseOut == 16 || baseOut == 8) {
                            i = baseOut == 16 ? 4 : 3;
                            for(--len; len % i; len++)str += '0';
                            xd = convertBase(str, base, baseOut);
                            for(len = xd.length; !xd[len - 1]; --len);
                            // xd[0] will always be be 1
                            for(i = 1, str = '1.'; i < len; i++)str += NUMERALS.charAt(xd[i]);
                        } else {
                            str = str.charAt(0) + '.' + str.slice(1);
                        }
                    }
                    str = str + (e < 0 ? 'p' : 'p+') + e;
                } else if (e < 0) {
                    for(; ++e;)str = '0' + str;
                    str = '0.' + str;
                } else {
                    if (++e > len) for(e -= len; e--;)str += '0';
                    else if (e < len) str = str.slice(0, e) + '.' + str.slice(e);
                }
            }
            str = (baseOut == 16 ? '0x' : baseOut == 2 ? '0b' : baseOut == 8 ? '0o' : '') + str;
        }
        return x.s < 0 ? '-' + str : str;
    }
    // Does not strip trailing zeros.
    function truncate(arr, len) {
        if (arr.length > len) {
            arr.length = len;
            return true;
        }
    }
    // Decimal methods
    /*
   *  abs
   *  acos
   *  acosh
   *  add
   *  asin
   *  asinh
   *  atan
   *  atanh
   *  atan2
   *  cbrt
   *  ceil
   *  clamp
   *  clone
   *  config
   *  cos
   *  cosh
   *  div
   *  exp
   *  floor
   *  hypot
   *  ln
   *  log
   *  log2
   *  log10
   *  max
   *  min
   *  mod
   *  mul
   *  pow
   *  random
   *  round
   *  set
   *  sign
   *  sin
   *  sinh
   *  sqrt
   *  sub
   *  sum
   *  tan
   *  tanh
   *  trunc
   */ /*
   * Return a new Decimal whose value is the absolute value of `x`.
   *
   * x {number|string|Decimal}
   *
   */ function abs(x) {
        return new this(x).abs();
    }
    /*
   * Return a new Decimal whose value is the arccosine in radians of `x`.
   *
   * x {number|string|Decimal}
   *
   */ function acos(x) {
        return new this(x).acos();
    }
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */ function acosh(x) {
        return new this(x).acosh();
    }
    /*
   * Return a new Decimal whose value is the sum of `x` and `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */ function add(x, y) {
        return new this(x).plus(y);
    }
    /*
   * Return a new Decimal whose value is the arcsine in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */ function asin(x) {
        return new this(x).asin();
    }
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */ function asinh(x) {
        return new this(x).asinh();
    }
    /*
   * Return a new Decimal whose value is the arctangent in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */ function atan(x) {
        return new this(x).atan();
    }
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */ function atanh(x) {
        return new this(x).atanh();
    }
    /*
   * Return a new Decimal whose value is the arctangent in radians of `y/x` in the range -pi to pi
   * (inclusive), rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi, pi]
   *
   * y {number|string|Decimal} The y-coordinate.
   * x {number|string|Decimal} The x-coordinate.
   *
   * atan2(±0, -0)               = ±pi
   * atan2(±0, +0)               = ±0
   * atan2(±0, -x)               = ±pi for x > 0
   * atan2(±0, x)                = ±0 for x > 0
   * atan2(-y, ±0)               = -pi/2 for y > 0
   * atan2(y, ±0)                = pi/2 for y > 0
   * atan2(±y, -Infinity)        = ±pi for finite y > 0
   * atan2(±y, +Infinity)        = ±0 for finite y > 0
   * atan2(±Infinity, x)         = ±pi/2 for finite x
   * atan2(±Infinity, -Infinity) = ±3*pi/4
   * atan2(±Infinity, +Infinity) = ±pi/4
   * atan2(NaN, x) = NaN
   * atan2(y, NaN) = NaN
   *
   */ function atan2(y, x) {
        y = new this(y);
        x = new this(x);
        var r, pr = this.precision, rm = this.rounding, wpr = pr + 4;
        // Either NaN
        if (!y.s || !x.s) {
            r = new this(NaN);
        // Both ±Infinity
        } else if (!y.d && !x.d) {
            r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
            r.s = y.s;
        // x is ±Infinity or y is ±0
        } else if (!x.d || y.isZero()) {
            r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
            r.s = y.s;
        // y is ±Infinity or x is ±0
        } else if (!y.d || x.isZero()) {
            r = getPi(this, wpr, 1).times(0.5);
            r.s = y.s;
        // Both non-zero and finite
        } else if (x.s < 0) {
            this.precision = wpr;
            this.rounding = 1;
            r = this.atan(divide(y, x, wpr, 1));
            x = getPi(this, wpr, 1);
            this.precision = pr;
            this.rounding = rm;
            r = y.s < 0 ? r.minus(x) : r.plus(x);
        } else {
            r = this.atan(divide(y, x, wpr, 1));
        }
        return r;
    }
    /*
   * Return a new Decimal whose value is the cube root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */ function cbrt(x) {
        return new this(x).cbrt();
    }
    /*
   * Return a new Decimal whose value is `x` rounded to an integer using `ROUND_CEIL`.
   *
   * x {number|string|Decimal}
   *
   */ function ceil(x) {
        return finalise(x = new this(x), x.e + 1, 2);
    }
    /*
   * Return a new Decimal whose value is `x` clamped to the range delineated by `min` and `max`.
   *
   * x {number|string|Decimal}
   * min {number|string|Decimal}
   * max {number|string|Decimal}
   *
   */ function clamp(x, min, max) {
        return new this(x).clamp(min, max);
    }
    /*
   * Configure global settings for a Decimal constructor.
   *
   * `obj` is an object with one or more of the following properties,
   *
   *   precision  {number}
   *   rounding   {number}
   *   toExpNeg   {number}
   *   toExpPos   {number}
   *   maxE       {number}
   *   minE       {number}
   *   modulo     {number}
   *   crypto     {boolean|number}
   *   defaults   {true}
   *
   * E.g. Decimal.config({ precision: 20, rounding: 4 })
   *
   */ function config(obj) {
        if (!obj || typeof obj !== 'object') throw Error(decimalError + 'Object expected');
        var i, p, v, useDefaults = obj.defaults === true, ps = [
            'precision',
            1,
            MAX_DIGITS,
            'rounding',
            0,
            8,
            'toExpNeg',
            -EXP_LIMIT,
            0,
            'toExpPos',
            0,
            EXP_LIMIT,
            'maxE',
            0,
            EXP_LIMIT,
            'minE',
            -EXP_LIMIT,
            0,
            'modulo',
            0,
            9
        ];
        for(i = 0; i < ps.length; i += 3){
            if (p = ps[i], useDefaults) this[p] = DEFAULTS[p];
            if ((v = obj[p]) !== void 0) {
                if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
                else throw Error(invalidArgument + p + ': ' + v);
            }
        }
        if (p = 'crypto', useDefaults) this[p] = DEFAULTS[p];
        if ((v = obj[p]) !== void 0) {
            if (v === true || v === false || v === 0 || v === 1) {
                if (v) {
                    if (typeof crypto != 'undefined' && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
                        this[p] = true;
                    } else {
                        throw Error(cryptoUnavailable);
                    }
                } else {
                    this[p] = false;
                }
            } else {
                throw Error(invalidArgument + p + ': ' + v);
            }
        }
        return this;
    }
    /*
   * Return a new Decimal whose value is the cosine of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */ function cos(x) {
        return new this(x).cos();
    }
    /*
   * Return a new Decimal whose value is the hyperbolic cosine of `x`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */ function cosh(x) {
        return new this(x).cosh();
    }
    /*
   * Create and return a Decimal constructor with the same configuration properties as this Decimal
   * constructor.
   *
   */ function clone(obj) {
        var i, p, ps;
        /*
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * v {number|string|Decimal} A numeric value.
     *
     */ function Decimal(v) {
            var e, i, t, x = this;
            // Decimal called without new.
            if (!(x instanceof Decimal)) return new Decimal(v);
            // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
            // which points to Object.
            x.constructor = Decimal;
            // Duplicate.
            if (isDecimalInstance(v)) {
                x.s = v.s;
                if (external) {
                    if (!v.d || v.e > Decimal.maxE) {
                        // Infinity.
                        x.e = NaN;
                        x.d = null;
                    } else if (v.e < Decimal.minE) {
                        // Zero.
                        x.e = 0;
                        x.d = [
                            0
                        ];
                    } else {
                        x.e = v.e;
                        x.d = v.d.slice();
                    }
                } else {
                    x.e = v.e;
                    x.d = v.d ? v.d.slice() : v.d;
                }
                return;
            }
            t = typeof v;
            if (t === 'number') {
                if (v === 0) {
                    x.s = 1 / v < 0 ? -1 : 1;
                    x.e = 0;
                    x.d = [
                        0
                    ];
                    return;
                }
                if (v < 0) {
                    v = -v;
                    x.s = -1;
                } else {
                    x.s = 1;
                }
                // Fast path for small integers.
                if (v === ~~v && v < 1e7) {
                    for(e = 0, i = v; i >= 10; i /= 10)e++;
                    if (external) {
                        if (e > Decimal.maxE) {
                            x.e = NaN;
                            x.d = null;
                        } else if (e < Decimal.minE) {
                            x.e = 0;
                            x.d = [
                                0
                            ];
                        } else {
                            x.e = e;
                            x.d = [
                                v
                            ];
                        }
                    } else {
                        x.e = e;
                        x.d = [
                            v
                        ];
                    }
                    return;
                // Infinity, NaN.
                } else if (v * 0 !== 0) {
                    if (!v) x.s = NaN;
                    x.e = NaN;
                    x.d = null;
                    return;
                }
                return parseDecimal(x, v.toString());
            } else if (t !== 'string') {
                throw Error(invalidArgument + v);
            }
            // Minus sign?
            if ((i = v.charCodeAt(0)) === 45) {
                v = v.slice(1);
                x.s = -1;
            } else {
                // Plus sign?
                if (i === 43) v = v.slice(1);
                x.s = 1;
            }
            return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
        }
        Decimal.prototype = P;
        Decimal.ROUND_UP = 0;
        Decimal.ROUND_DOWN = 1;
        Decimal.ROUND_CEIL = 2;
        Decimal.ROUND_FLOOR = 3;
        Decimal.ROUND_HALF_UP = 4;
        Decimal.ROUND_HALF_DOWN = 5;
        Decimal.ROUND_HALF_EVEN = 6;
        Decimal.ROUND_HALF_CEIL = 7;
        Decimal.ROUND_HALF_FLOOR = 8;
        Decimal.EUCLID = 9;
        Decimal.config = Decimal.set = config;
        Decimal.clone = clone;
        Decimal.isDecimal = isDecimalInstance;
        Decimal.abs = abs;
        Decimal.acos = acos;
        Decimal.acosh = acosh; // ES6
        Decimal.add = add;
        Decimal.asin = asin;
        Decimal.asinh = asinh; // ES6
        Decimal.atan = atan;
        Decimal.atanh = atanh; // ES6
        Decimal.atan2 = atan2;
        Decimal.cbrt = cbrt; // ES6
        Decimal.ceil = ceil;
        Decimal.clamp = clamp;
        Decimal.cos = cos;
        Decimal.cosh = cosh; // ES6
        Decimal.div = div;
        Decimal.exp = exp;
        Decimal.floor = floor;
        Decimal.hypot = hypot; // ES6
        Decimal.ln = ln;
        Decimal.log = log;
        Decimal.log10 = log10; // ES6
        Decimal.log2 = log2; // ES6
        Decimal.max = max;
        Decimal.min = min;
        Decimal.mod = mod;
        Decimal.mul = mul;
        Decimal.pow = pow;
        Decimal.random = random;
        Decimal.round = round;
        Decimal.sign = sign; // ES6
        Decimal.sin = sin;
        Decimal.sinh = sinh; // ES6
        Decimal.sqrt = sqrt;
        Decimal.sub = sub;
        Decimal.sum = sum;
        Decimal.tan = tan;
        Decimal.tanh = tanh; // ES6
        Decimal.trunc = trunc; // ES6
        if (obj === void 0) obj = {};
        if (obj) {
            if (obj.defaults !== true) {
                ps = [
                    'precision',
                    'rounding',
                    'toExpNeg',
                    'toExpPos',
                    'maxE',
                    'minE',
                    'modulo',
                    'crypto'
                ];
                for(i = 0; i < ps.length;)if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
            }
        }
        Decimal.config(obj);
        return Decimal;
    }
    /*
   * Return a new Decimal whose value is `x` divided by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */ function div(x, y) {
        return new this(x).div(y);
    }
    /*
   * Return a new Decimal whose value is the natural exponential of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The power to which to raise the base of the natural log.
   *
   */ function exp(x) {
        return new this(x).exp();
    }
    /*
   * Return a new Decimal whose value is `x` round to an integer using `ROUND_FLOOR`.
   *
   * x {number|string|Decimal}
   *
   */ function floor(x) {
        return finalise(x = new this(x), x.e + 1, 3);
    }
    /*
   * Return a new Decimal whose value is the square root of the sum of the squares of the arguments,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * hypot(a, b, ...) = sqrt(a^2 + b^2 + ...)
   *
   * arguments {number|string|Decimal}
   *
   */ function hypot() {
        var i, n, t = new this(0);
        external = false;
        for(i = 0; i < arguments.length;){
            n = new this(arguments[i++]);
            if (!n.d) {
                if (n.s) {
                    external = true;
                    return new this(1 / 0);
                }
                t = n;
            } else if (t.d) {
                t = t.plus(n.times(n));
            }
        }
        external = true;
        return t.sqrt();
    }
    /*
   * Return true if object is a Decimal instance (where Decimal is any Decimal constructor),
   * otherwise return false.
   *
   */ function isDecimalInstance(obj) {
        return obj instanceof Decimal || obj && obj.toStringTag === tag || false;
    }
    /*
   * Return a new Decimal whose value is the natural logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */ function ln(x) {
        return new this(x).ln();
    }
    /*
   * Return a new Decimal whose value is the log of `x` to the base `y`, or to base 10 if no base
   * is specified, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * log[y](x)
   *
   * x {number|string|Decimal} The argument of the logarithm.
   * y {number|string|Decimal} The base of the logarithm.
   *
   */ function log(x, y) {
        return new this(x).log(y);
    }
    /*
   * Return a new Decimal whose value is the base 2 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */ function log2(x) {
        return new this(x).log(2);
    }
    /*
   * Return a new Decimal whose value is the base 10 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */ function log10(x) {
        return new this(x).log(10);
    }
    /*
   * Return a new Decimal whose value is the maximum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */ function max() {
        return maxOrMin(this, arguments, 'lt');
    }
    /*
   * Return a new Decimal whose value is the minimum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */ function min() {
        return maxOrMin(this, arguments, 'gt');
    }
    /*
   * Return a new Decimal whose value is `x` modulo `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */ function mod(x, y) {
        return new this(x).mod(y);
    }
    /*
   * Return a new Decimal whose value is `x` multiplied by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */ function mul(x, y) {
        return new this(x).mul(y);
    }
    /*
   * Return a new Decimal whose value is `x` raised to the power `y`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The base.
   * y {number|string|Decimal} The exponent.
   *
   */ function pow(x, y) {
        return new this(x).pow(y);
    }
    /*
   * Returns a new Decimal with a random value equal to or greater than 0 and less than 1, and with
   * `sd`, or `Decimal.precision` if `sd` is omitted, significant digits (or less if trailing zeros
   * are produced).
   *
   * [sd] {number} Significant digits. Integer, 0 to MAX_DIGITS inclusive.
   *
   */ function random(sd) {
        var d, e, k, n, i = 0, r = new this(1), rd = [];
        if (sd === void 0) sd = this.precision;
        else checkInt32(sd, 1, MAX_DIGITS);
        k = Math.ceil(sd / LOG_BASE);
        if (!this.crypto) {
            for(; i < k;)rd[i++] = Math.random() * 1e7 | 0;
        // Browsers supporting crypto.getRandomValues.
        } else if (crypto.getRandomValues) {
            d = crypto.getRandomValues(new Uint32Array(k));
            for(; i < k;){
                n = d[i];
                // 0 <= n < 4294967296
                // Probability n >= 4.29e9, is 4967296 / 4294967296 = 0.00116 (1 in 865).
                if (n >= 4.29e9) {
                    d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
                } else {
                    // 0 <= n <= 4289999999
                    // 0 <= (n % 1e7) <= 9999999
                    rd[i++] = n % 1e7;
                }
            }
        // Node.js supporting crypto.randomBytes.
        } else if (crypto.randomBytes) {
            // buffer
            d = crypto.randomBytes(k *= 4);
            for(; i < k;){
                // 0 <= n < 2147483648
                n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 0x7f) << 24);
                // Probability n >= 2.14e9, is 7483648 / 2147483648 = 0.0035 (1 in 286).
                if (n >= 2.14e9) {
                    crypto.randomBytes(4).copy(d, i);
                } else {
                    // 0 <= n <= 2139999999
                    // 0 <= (n % 1e7) <= 9999999
                    rd.push(n % 1e7);
                    i += 4;
                }
            }
            i = k / 4;
        } else {
            throw Error(cryptoUnavailable);
        }
        k = rd[--i];
        sd %= LOG_BASE;
        // Convert trailing digits to zeros according to sd.
        if (k && sd) {
            n = mathpow(10, LOG_BASE - sd);
            rd[i] = (k / n | 0) * n;
        }
        // Remove trailing words which are zero.
        for(; rd[i] === 0; i--)rd.pop();
        // Zero?
        if (i < 0) {
            e = 0;
            rd = [
                0
            ];
        } else {
            e = -1;
            // Remove leading words which are zero and adjust exponent accordingly.
            for(; rd[0] === 0; e -= LOG_BASE)rd.shift();
            // Count the digits of the first word of rd to determine leading zeros.
            for(k = 1, n = rd[0]; n >= 10; n /= 10)k++;
            // Adjust the exponent for leading zeros of the first word of rd.
            if (k < LOG_BASE) e -= LOG_BASE - k;
        }
        r.e = e;
        r.d = rd;
        return r;
    }
    /*
   * Return a new Decimal whose value is `x` rounded to an integer using rounding mode `rounding`.
   *
   * To emulate `Math.round`, set rounding to 7 (ROUND_HALF_CEIL).
   *
   * x {number|string|Decimal}
   *
   */ function round(x) {
        return finalise(x = new this(x), x.e + 1, this.rounding);
    }
    /*
   * Return
   *   1    if x > 0,
   *  -1    if x < 0,
   *   0    if x is 0,
   *  -0    if x is -0,
   *   NaN  otherwise
   *
   * x {number|string|Decimal}
   *
   */ function sign(x) {
        x = new this(x);
        return x.d ? x.d[0] ? x.s : 0 * x.s : x.s || NaN;
    }
    /*
   * Return a new Decimal whose value is the sine of `x`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */ function sin(x) {
        return new this(x).sin();
    }
    /*
   * Return a new Decimal whose value is the hyperbolic sine of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */ function sinh(x) {
        return new this(x).sinh();
    }
    /*
   * Return a new Decimal whose value is the square root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */ function sqrt(x) {
        return new this(x).sqrt();
    }
    /*
   * Return a new Decimal whose value is `x` minus `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */ function sub(x, y) {
        return new this(x).sub(y);
    }
    /*
   * Return a new Decimal whose value is the sum of the arguments, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * Only the result is rounded, not the intermediate calculations.
   *
   * arguments {number|string|Decimal}
   *
   */ function sum() {
        var i = 0, args = arguments, x = new this(args[i]);
        external = false;
        for(; x.s && ++i < args.length;)x = x.plus(args[i]);
        external = true;
        return finalise(x, this.precision, this.rounding);
    }
    /*
   * Return a new Decimal whose value is the tangent of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */ function tan(x) {
        return new this(x).tan();
    }
    /*
   * Return a new Decimal whose value is the hyperbolic tangent of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */ function tanh(x) {
        return new this(x).tanh();
    }
    /*
   * Return a new Decimal whose value is `x` truncated to an integer.
   *
   * x {number|string|Decimal}
   *
   */ function trunc(x) {
        return finalise(x = new this(x), x.e + 1, 1);
    }
    // Create and configure initial Decimal constructor.
    Decimal = clone(DEFAULTS);
    Decimal.prototype.constructor = Decimal;
    Decimal['default'] = Decimal.Decimal = Decimal;
    // Create the internal constants from their string values.
    LN10 = new Decimal(LN10);
    PI = new Decimal(PI);
    // Export.
    // AMD.
    if (typeof define == 'function' && define.amd) {
        define(function() {
            return Decimal;
        });
    // Node and other environments that support module.exports.
    } else if (typeof module != 'undefined' && module.exports) {
        if (typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol') {
            P[Symbol['for']('nodejs.util.inspect.custom')] = P.toString;
            P[Symbol.toStringTag] = 'Decimal';
        }
        module.exports = Decimal;
    // Browser.
    } else {
        if (!globalScope) {
            globalScope = typeof self != 'undefined' && self && self.self == self ? self : window;
        }
        noConflict = globalScope.Decimal;
        Decimal.noConflict = function() {
            globalScope.Decimal = noConflict;
            return Decimal;
        };
        globalScope.Decimal = Decimal;
    }
})(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvZGVjaW1hbC0xMC4zLjEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiOyhmdW5jdGlvbiAoZ2xvYmFsU2NvcGUpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG5cbiAgLypcbiAgICogIGRlY2ltYWwuanMgdjEwLjMuMVxuICAgKiAgQW4gYXJiaXRyYXJ5LXByZWNpc2lvbiBEZWNpbWFsIHR5cGUgZm9yIEphdmFTY3JpcHQuXG4gICAqICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9kZWNpbWFsLmpzXG4gICAqICBDb3B5cmlnaHQgKGMpIDIwMjEgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cbiAgICogIE1JVCBMaWNlbmNlXG4gICAqL1xuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIEVESVRBQkxFIERFRkFVTFRTICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuXG4gIC8vIFRoZSBtYXhpbXVtIGV4cG9uZW50IG1hZ25pdHVkZS5cbiAgLy8gVGhlIGxpbWl0IG9uIHRoZSB2YWx1ZSBvZiBgdG9FeHBOZWdgLCBgdG9FeHBQb3NgLCBgbWluRWAgYW5kIGBtYXhFYC5cbiAgdmFyIEVYUF9MSU1JVCA9IDllMTUsICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gOWUxNVxuXG4gICAgLy8gVGhlIGxpbWl0IG9uIHRoZSB2YWx1ZSBvZiBgcHJlY2lzaW9uYCwgYW5kIG9uIHRoZSB2YWx1ZSBvZiB0aGUgZmlyc3QgYXJndW1lbnQgdG9cbiAgICAvLyBgdG9EZWNpbWFsUGxhY2VzYCwgYHRvRXhwb25lbnRpYWxgLCBgdG9GaXhlZGAsIGB0b1ByZWNpc2lvbmAgYW5kIGB0b1NpZ25pZmljYW50RGlnaXRzYC5cbiAgICBNQVhfRElHSVRTID0gMWU5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMWU5XG5cbiAgICAvLyBCYXNlIGNvbnZlcnNpb24gYWxwaGFiZXQuXG4gICAgTlVNRVJBTFMgPSAnMDEyMzQ1Njc4OWFiY2RlZicsXG5cbiAgICAvLyBUaGUgbmF0dXJhbCBsb2dhcml0aG0gb2YgMTAgKDEwMjUgZGlnaXRzKS5cbiAgICBMTjEwID0gJzIuMzAyNTg1MDkyOTk0MDQ1Njg0MDE3OTkxNDU0Njg0MzY0MjA3NjAxMTAxNDg4NjI4NzcyOTc2MDMzMzI3OTAwOTY3NTcyNjA5Njc3MzUyNDgwMjM1OTk3MjA1MDg5NTk4Mjk4MzQxOTY3Nzg0MDQyMjg2MjQ4NjMzNDA5NTI1NDY1MDgyODA2NzU2NjY2Mjg3MzY5MDk4NzgxNjg5NDgyOTA3MjA4MzI1NTU0NjgwODQzNzk5ODk0ODI2MjMzMTk4NTI4MzkzNTA1MzA4OTY1Mzc3NzMyNjI4ODQ2MTYzMzY2MjIyMjg3Njk4MjE5ODg2NzQ2NTQzNjY3NDc0NDA0MjQzMjc0MzY1MTU1MDQ4OTM0MzE0OTM5MzkxNDc5NjE5NDA0NDAwMjIyMTA1MTAxNzE0MTc0ODAwMzY4ODA4NDAxMjY0NzA4MDY4NTU2Nzc0MzIxNjIyODM1NTIyMDExNDgwNDY2MzcxNTY1OTEyMTM3MzQ1MDc0Nzg1Njk0NzY4MzQ2MzYxNjc5MjEwMTgwNjQ0NTA3MDY0ODAwMDI3NzUwMjY4NDkxNjc0NjU1MDU4Njg1NjkzNTY3MzQyMDY3MDU4MTEzNjQyOTIyNDU1NDQwNTc1ODkyNTcyNDIwODI0MTMxNDY5NTY4OTAxNjc1ODk0MDI1Njc3NjMxMTM1NjkxOTI5MjAzMzM3NjU4NzE0MTY2MDIzMDEwNTcwMzA4OTYzNDU3MjA3NTQ0MDM3MDg0NzQ2OTk0MDE2ODI2OTI4MjgwODQ4MTE4NDI4OTMxNDg0ODUyNDk0ODY0NDg3MTkyNzgwOTY3NjI3MTI3NTc3NTM5NzAyNzY2ODYwNTk1MjQ5NjcxNjY3NDE4MzQ4NTcwNDQyMjUwNzE5Nzk2NTAwNDcxNDk1MTA1MDQ5MjIxNDc3NjU2NzYzNjkzODY2Mjk3Njk3OTUyMjExMDcxODI2NDU0OTczNDc3MjY2MjQyNTcwOTQyOTMyMjU4Mjc5ODUwMjU4NTUwOTc4NTI2NTM4MzIwNzYwNjcyNjMxNzE2NDMwOTUwNTk5NTA4NzgwNzUyMzcxMDMzMzEwMTE5Nzg1NzU0NzMzMTU0MTQyMTgwODQyNzU0Mzg2MzU5MTc3ODExNzA1NDMwOTgyNzQ4MjM4NTA0NTY0ODAxOTA5NTYxMDI5OTI5MTgyNDMxODIzNzUyNTM1NzcwOTc1MDUzOTU2NTE4NzY5NzUxMDM3NDk3MDg4ODY5MjE4MDIwNTE4OTMzOTUwNzIzODUzOTIwNTE0NDYzNDE5NzI2NTI4NzI4Njk2NTExMDg2MjU3MTQ5MjE5ODg0OTk3ODc0ODg3Mzc3MTM0NTY4NjIwOTE2NzA1OCcsXG5cbiAgICAvLyBQaSAoMTAyNSBkaWdpdHMpLlxuICAgIFBJID0gJzMuMTQxNTkyNjUzNTg5NzkzMjM4NDYyNjQzMzgzMjc5NTAyODg0MTk3MTY5Mzk5Mzc1MTA1ODIwOTc0OTQ0NTkyMzA3ODE2NDA2Mjg2MjA4OTk4NjI4MDM0ODI1MzQyMTE3MDY3OTgyMTQ4MDg2NTEzMjgyMzA2NjQ3MDkzODQ0NjA5NTUwNTgyMjMxNzI1MzU5NDA4MTI4NDgxMTE3NDUwMjg0MTAyNzAxOTM4NTIxMTA1NTU5NjQ0NjIyOTQ4OTU0OTMwMzgxOTY0NDI4ODEwOTc1NjY1OTMzNDQ2MTI4NDc1NjQ4MjMzNzg2NzgzMTY1MjcxMjAxOTA5MTQ1NjQ4NTY2OTIzNDYwMzQ4NjEwNDU0MzI2NjQ4MjEzMzkzNjA3MjYwMjQ5MTQxMjczNzI0NTg3MDA2NjA2MzE1NTg4MTc0ODgxNTIwOTIwOTYyODI5MjU0MDkxNzE1MzY0MzY3ODkyNTkwMzYwMDExMzMwNTMwNTQ4ODIwNDY2NTIxMzg0MTQ2OTUxOTQxNTExNjA5NDMzMDU3MjcwMzY1NzU5NTkxOTUzMDkyMTg2MTE3MzgxOTMyNjExNzkzMTA1MTE4NTQ4MDc0NDYyMzc5OTYyNzQ5NTY3MzUxODg1NzUyNzI0ODkxMjI3OTM4MTgzMDExOTQ5MTI5ODMzNjczMzYyNDQwNjU2NjQzMDg2MDIxMzk0OTQ2Mzk1MjI0NzM3MTkwNzAyMTc5ODYwOTQzNzAyNzcwNTM5MjE3MTc2MjkzMTc2NzUyMzg0Njc0ODE4NDY3NjY5NDA1MTMyMDAwNTY4MTI3MTQ1MjYzNTYwODI3Nzg1NzcxMzQyNzU3Nzg5NjA5MTczNjM3MTc4NzIxNDY4NDQwOTAxMjI0OTUzNDMwMTQ2NTQ5NTg1MzcxMDUwNzkyMjc5Njg5MjU4OTIzNTQyMDE5OTU2MTEyMTI5MDIxOTYwODY0MDM0NDE4MTU5ODEzNjI5Nzc0NzcxMzA5OTYwNTE4NzA3MjExMzQ5OTk5OTk4MzcyOTc4MDQ5OTUxMDU5NzMxNzMyODE2MDk2MzE4NTk1MDI0NDU5NDU1MzQ2OTA4MzAyNjQyNTIyMzA4MjUzMzQ0Njg1MDM1MjYxOTMxMTg4MTcxMDEwMDAzMTM3ODM4NzUyODg2NTg3NTMzMjA4MzgxNDIwNjE3MTc3NjY5MTQ3MzAzNTk4MjUzNDkwNDI4NzU1NDY4NzMxMTU5NTYyODYzODgyMzUzNzg3NTkzNzUxOTU3NzgxODU3NzgwNTMyMTcxMjI2ODA2NjEzMDAxOTI3ODc2NjExMTk1OTA5MjE2NDIwMTk4OTM4MDk1MjU3MjAxMDY1NDg1ODYzMjc4OScsXG5cblxuICAgIC8vIFRoZSBpbml0aWFsIGNvbmZpZ3VyYXRpb24gcHJvcGVydGllcyBvZiB0aGUgRGVjaW1hbCBjb25zdHJ1Y3Rvci5cbiAgICBERUZBVUxUUyA9IHtcblxuICAgICAgLy8gVGhlc2UgdmFsdWVzIG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBzdGF0ZWQgcmFuZ2VzIChpbmNsdXNpdmUpLlxuICAgICAgLy8gTW9zdCBvZiB0aGVzZSB2YWx1ZXMgY2FuIGJlIGNoYW5nZWQgYXQgcnVuLXRpbWUgdXNpbmcgdGhlIGBEZWNpbWFsLmNvbmZpZ2AgbWV0aG9kLlxuXG4gICAgICAvLyBUaGUgbWF4aW11bSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZGlnaXRzIG9mIHRoZSByZXN1bHQgb2YgYSBjYWxjdWxhdGlvbiBvciBiYXNlIGNvbnZlcnNpb24uXG4gICAgICAvLyBFLmcuIGBEZWNpbWFsLmNvbmZpZyh7IHByZWNpc2lvbjogMjAgfSk7YFxuICAgICAgcHJlY2lzaW9uOiAyMCwgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMSB0byBNQVhfRElHSVRTXG5cbiAgICAgIC8vIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byBgcHJlY2lzaW9uYC5cbiAgICAgIC8vXG4gICAgICAvLyBST1VORF9VUCAgICAgICAgIDAgQXdheSBmcm9tIHplcm8uXG4gICAgICAvLyBST1VORF9ET1dOICAgICAgIDEgVG93YXJkcyB6ZXJvLlxuICAgICAgLy8gUk9VTkRfQ0VJTCAgICAgICAyIFRvd2FyZHMgK0luZmluaXR5LlxuICAgICAgLy8gUk9VTkRfRkxPT1IgICAgICAzIFRvd2FyZHMgLUluZmluaXR5LlxuICAgICAgLy8gUk9VTkRfSEFMRl9VUCAgICA0IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB1cC5cbiAgICAgIC8vIFJPVU5EX0hBTEZfRE9XTiAgNSBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgZG93bi5cbiAgICAgIC8vIFJPVU5EX0hBTEZfRVZFTiAgNiBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyBldmVuIG5laWdoYm91ci5cbiAgICAgIC8vIFJPVU5EX0hBTEZfQ0VJTCAgNyBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyArSW5maW5pdHkuXG4gICAgICAvLyBST1VORF9IQUxGX0ZMT09SIDggVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvd2FyZHMgLUluZmluaXR5LlxuICAgICAgLy9cbiAgICAgIC8vIEUuZy5cbiAgICAgIC8vIGBEZWNpbWFsLnJvdW5kaW5nID0gNDtgXG4gICAgICAvLyBgRGVjaW1hbC5yb3VuZGluZyA9IERlY2ltYWwuUk9VTkRfSEFMRl9VUDtgXG4gICAgICByb3VuZGluZzogNCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDhcblxuICAgICAgLy8gVGhlIG1vZHVsbyBtb2RlIHVzZWQgd2hlbiBjYWxjdWxhdGluZyB0aGUgbW9kdWx1czogYSBtb2Qgbi5cbiAgICAgIC8vIFRoZSBxdW90aWVudCAocSA9IGEgLyBuKSBpcyBjYWxjdWxhdGVkIGFjY29yZGluZyB0byB0aGUgY29ycmVzcG9uZGluZyByb3VuZGluZyBtb2RlLlxuICAgICAgLy8gVGhlIHJlbWFpbmRlciAocikgaXMgY2FsY3VsYXRlZCBhczogciA9IGEgLSBuICogcS5cbiAgICAgIC8vXG4gICAgICAvLyBVUCAgICAgICAgIDAgVGhlIHJlbWFpbmRlciBpcyBwb3NpdGl2ZSBpZiB0aGUgZGl2aWRlbmQgaXMgbmVnYXRpdmUsIGVsc2UgaXMgbmVnYXRpdmUuXG4gICAgICAvLyBET1dOICAgICAgIDEgVGhlIHJlbWFpbmRlciBoYXMgdGhlIHNhbWUgc2lnbiBhcyB0aGUgZGl2aWRlbmQgKEphdmFTY3JpcHQgJSkuXG4gICAgICAvLyBGTE9PUiAgICAgIDMgVGhlIHJlbWFpbmRlciBoYXMgdGhlIHNhbWUgc2lnbiBhcyB0aGUgZGl2aXNvciAoUHl0aG9uICUpLlxuICAgICAgLy8gSEFMRl9FVkVOICA2IFRoZSBJRUVFIDc1NCByZW1haW5kZXIgZnVuY3Rpb24uXG4gICAgICAvLyBFVUNMSUQgICAgIDkgRXVjbGlkaWFuIGRpdmlzaW9uLiBxID0gc2lnbihuKSAqIGZsb29yKGEgLyBhYnMobikpLiBBbHdheXMgcG9zaXRpdmUuXG4gICAgICAvL1xuICAgICAgLy8gVHJ1bmNhdGVkIGRpdmlzaW9uICgxKSwgZmxvb3JlZCBkaXZpc2lvbiAoMyksIHRoZSBJRUVFIDc1NCByZW1haW5kZXIgKDYpLCBhbmQgRXVjbGlkaWFuXG4gICAgICAvLyBkaXZpc2lvbiAoOSkgYXJlIGNvbW1vbmx5IHVzZWQgZm9yIHRoZSBtb2R1bHVzIG9wZXJhdGlvbi4gVGhlIG90aGVyIHJvdW5kaW5nIG1vZGVzIGNhbiBhbHNvXG4gICAgICAvLyBiZSB1c2VkLCBidXQgdGhleSBtYXkgbm90IGdpdmUgdXNlZnVsIHJlc3VsdHMuXG4gICAgICBtb2R1bG86IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDlcblxuICAgICAgLy8gVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIGB0b1N0cmluZ2AgcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbi5cbiAgICAgIC8vIEphdmFTY3JpcHQgbnVtYmVyczogLTdcbiAgICAgIHRvRXhwTmVnOiAtNywgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gLUVYUF9MSU1JVFxuXG4gICAgICAvLyBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIGB0b1N0cmluZ2AgcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbi5cbiAgICAgIC8vIEphdmFTY3JpcHQgbnVtYmVyczogMjFcbiAgICAgIHRvRXhwUG9zOiAgMjEsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gRVhQX0xJTUlUXG5cbiAgICAgIC8vIFRoZSBtaW5pbXVtIGV4cG9uZW50IHZhbHVlLCBiZW5lYXRoIHdoaWNoIHVuZGVyZmxvdyB0byB6ZXJvIG9jY3Vycy5cbiAgICAgIC8vIEphdmFTY3JpcHQgbnVtYmVyczogLTMyNCAgKDVlLTMyNClcbiAgICAgIG1pbkU6IC1FWFBfTElNSVQsICAgICAgICAgICAgICAgICAgICAgIC8vIC0xIHRvIC1FWFBfTElNSVRcblxuICAgICAgLy8gVGhlIG1heGltdW0gZXhwb25lbnQgdmFsdWUsIGFib3ZlIHdoaWNoIG92ZXJmbG93IHRvIEluZmluaXR5IG9jY3Vycy5cbiAgICAgIC8vIEphdmFTY3JpcHQgbnVtYmVyczogMzA4ICAoMS43OTc2OTMxMzQ4NjIzMTU3ZSszMDgpXG4gICAgICBtYXhFOiBFWFBfTElNSVQsICAgICAgICAgICAgICAgICAgICAgICAvLyAxIHRvIEVYUF9MSU1JVFxuXG4gICAgICAvLyBXaGV0aGVyIHRvIHVzZSBjcnlwdG9ncmFwaGljYWxseS1zZWN1cmUgcmFuZG9tIG51bWJlciBnZW5lcmF0aW9uLCBpZiBhdmFpbGFibGUuXG4gICAgICBjcnlwdG86IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cnVlL2ZhbHNlXG4gICAgfSxcblxuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIE9GIEVESVRBQkxFIERFRkFVTFRTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuXG4gICAgRGVjaW1hbCwgaW5leGFjdCwgbm9Db25mbGljdCwgcXVhZHJhbnQsXG4gICAgZXh0ZXJuYWwgPSB0cnVlLFxuXG4gICAgZGVjaW1hbEVycm9yID0gJ1tEZWNpbWFsRXJyb3JdICcsXG4gICAgaW52YWxpZEFyZ3VtZW50ID0gZGVjaW1hbEVycm9yICsgJ0ludmFsaWQgYXJndW1lbnQ6ICcsXG4gICAgcHJlY2lzaW9uTGltaXRFeGNlZWRlZCA9IGRlY2ltYWxFcnJvciArICdQcmVjaXNpb24gbGltaXQgZXhjZWVkZWQnLFxuICAgIGNyeXB0b1VuYXZhaWxhYmxlID0gZGVjaW1hbEVycm9yICsgJ2NyeXB0byB1bmF2YWlsYWJsZScsXG4gICAgdGFnID0gJ1tvYmplY3QgRGVjaW1hbF0nLFxuXG4gICAgbWF0aGZsb29yID0gTWF0aC5mbG9vcixcbiAgICBtYXRocG93ID0gTWF0aC5wb3csXG5cbiAgICBpc0JpbmFyeSA9IC9eMGIoWzAxXSsoXFwuWzAxXSopP3xcXC5bMDFdKykocFsrLV0/XFxkKyk/JC9pLFxuICAgIGlzSGV4ID0gL14weChbMC05YS1mXSsoXFwuWzAtOWEtZl0qKT98XFwuWzAtOWEtZl0rKShwWystXT9cXGQrKT8kL2ksXG4gICAgaXNPY3RhbCA9IC9eMG8oWzAtN10rKFxcLlswLTddKik/fFxcLlswLTddKykocFsrLV0/XFxkKyk/JC9pLFxuICAgIGlzRGVjaW1hbCA9IC9eKFxcZCsoXFwuXFxkKik/fFxcLlxcZCspKGVbKy1dP1xcZCspPyQvaSxcblxuICAgIEJBU0UgPSAxZTcsXG4gICAgTE9HX0JBU0UgPSA3LFxuICAgIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxLFxuXG4gICAgTE4xMF9QUkVDSVNJT04gPSBMTjEwLmxlbmd0aCAtIDEsXG4gICAgUElfUFJFQ0lTSU9OID0gUEkubGVuZ3RoIC0gMSxcblxuICAgIC8vIERlY2ltYWwucHJvdG90eXBlIG9iamVjdFxuICAgIFAgPSB7IHRvU3RyaW5nVGFnOiB0YWcgfTtcblxuXG4gIC8vIERlY2ltYWwgcHJvdG90eXBlIG1ldGhvZHNcblxuXG4gIC8qXG4gICAqICBhYnNvbHV0ZVZhbHVlICAgICAgICAgICAgIGFic1xuICAgKiAgY2VpbFxuICAgKiAgY2xhbXBlZFRvICAgICAgICAgICAgICAgICBjbGFtcFxuICAgKiAgY29tcGFyZWRUbyAgICAgICAgICAgICAgICBjbXBcbiAgICogIGNvc2luZSAgICAgICAgICAgICAgICAgICAgY29zXG4gICAqICBjdWJlUm9vdCAgICAgICAgICAgICAgICAgIGNicnRcbiAgICogIGRlY2ltYWxQbGFjZXMgICAgICAgICAgICAgZHBcbiAgICogIGRpdmlkZWRCeSAgICAgICAgICAgICAgICAgZGl2XG4gICAqICBkaXZpZGVkVG9JbnRlZ2VyQnkgICAgICAgIGRpdlRvSW50XG4gICAqICBlcXVhbHMgICAgICAgICAgICAgICAgICAgIGVxXG4gICAqICBmbG9vclxuICAgKiAgZ3JlYXRlclRoYW4gICAgICAgICAgICAgICBndFxuICAgKiAgZ3JlYXRlclRoYW5PckVxdWFsVG8gICAgICBndGVcbiAgICogIGh5cGVyYm9saWNDb3NpbmUgICAgICAgICAgY29zaFxuICAgKiAgaHlwZXJib2xpY1NpbmUgICAgICAgICAgICBzaW5oXG4gICAqICBoeXBlcmJvbGljVGFuZ2VudCAgICAgICAgIHRhbmhcbiAgICogIGludmVyc2VDb3NpbmUgICAgICAgICAgICAgYWNvc1xuICAgKiAgaW52ZXJzZUh5cGVyYm9saWNDb3NpbmUgICBhY29zaFxuICAgKiAgaW52ZXJzZUh5cGVyYm9saWNTaW5lICAgICBhc2luaFxuICAgKiAgaW52ZXJzZUh5cGVyYm9saWNUYW5nZW50ICBhdGFuaFxuICAgKiAgaW52ZXJzZVNpbmUgICAgICAgICAgICAgICBhc2luXG4gICAqICBpbnZlcnNlVGFuZ2VudCAgICAgICAgICAgIGF0YW5cbiAgICogIGlzRmluaXRlXG4gICAqICBpc0ludGVnZXIgICAgICAgICAgICAgICAgIGlzSW50XG4gICAqICBpc05hTlxuICAgKiAgaXNOZWdhdGl2ZSAgICAgICAgICAgICAgICBpc05lZ1xuICAgKiAgaXNQb3NpdGl2ZSAgICAgICAgICAgICAgICBpc1Bvc1xuICAgKiAgaXNaZXJvXG4gICAqICBsZXNzVGhhbiAgICAgICAgICAgICAgICAgIGx0XG4gICAqICBsZXNzVGhhbk9yRXF1YWxUbyAgICAgICAgIGx0ZVxuICAgKiAgbG9nYXJpdGhtICAgICAgICAgICAgICAgICBsb2dcbiAgICogIFttYXhpbXVtXSAgICAgICAgICAgICAgICAgW21heF1cbiAgICogIFttaW5pbXVtXSAgICAgICAgICAgICAgICAgW21pbl1cbiAgICogIG1pbnVzICAgICAgICAgICAgICAgICAgICAgc3ViXG4gICAqICBtb2R1bG8gICAgICAgICAgICAgICAgICAgIG1vZFxuICAgKiAgbmF0dXJhbEV4cG9uZW50aWFsICAgICAgICBleHBcbiAgICogIG5hdHVyYWxMb2dhcml0aG0gICAgICAgICAgbG5cbiAgICogIG5lZ2F0ZWQgICAgICAgICAgICAgICAgICAgbmVnXG4gICAqICBwbHVzICAgICAgICAgICAgICAgICAgICAgIGFkZFxuICAgKiAgcHJlY2lzaW9uICAgICAgICAgICAgICAgICBzZFxuICAgKiAgcm91bmRcbiAgICogIHNpbmUgICAgICAgICAgICAgICAgICAgICAgc2luXG4gICAqICBzcXVhcmVSb290ICAgICAgICAgICAgICAgIHNxcnRcbiAgICogIHRhbmdlbnQgICAgICAgICAgICAgICAgICAgdGFuXG4gICAqICB0aW1lcyAgICAgICAgICAgICAgICAgICAgIG11bFxuICAgKiAgdG9CaW5hcnlcbiAgICogIHRvRGVjaW1hbFBsYWNlcyAgICAgICAgICAgdG9EUFxuICAgKiAgdG9FeHBvbmVudGlhbFxuICAgKiAgdG9GaXhlZFxuICAgKiAgdG9GcmFjdGlvblxuICAgKiAgdG9IZXhhZGVjaW1hbCAgICAgICAgICAgICB0b0hleFxuICAgKiAgdG9OZWFyZXN0XG4gICAqICB0b051bWJlclxuICAgKiAgdG9PY3RhbFxuICAgKiAgdG9Qb3dlciAgICAgICAgICAgICAgICAgICBwb3dcbiAgICogIHRvUHJlY2lzaW9uXG4gICAqICB0b1NpZ25pZmljYW50RGlnaXRzICAgICAgIHRvU0RcbiAgICogIHRvU3RyaW5nXG4gICAqICB0cnVuY2F0ZWQgICAgICAgICAgICAgICAgIHRydW5jXG4gICAqICB2YWx1ZU9mICAgICAgICAgICAgICAgICAgIHRvSlNPTlxuICAgKi9cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwuXG4gICAqXG4gICAqL1xuICBQLmFic29sdXRlVmFsdWUgPSBQLmFicyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgeCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xuICAgIGlmICh4LnMgPCAwKSB4LnMgPSAxO1xuICAgIHJldHVybiBmaW5hbGlzZSh4KTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgcm91bmRlZCB0byBhIHdob2xlIG51bWJlciBpbiB0aGVcbiAgICogZGlyZWN0aW9uIG9mIHBvc2l0aXZlIEluZmluaXR5LlxuICAgKlxuICAgKi9cbiAgUC5jZWlsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmaW5hbGlzZShuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKSwgdGhpcy5lICsgMSwgMik7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGNsYW1wZWQgdG8gdGhlIHJhbmdlXG4gICAqIGRlbGluZWF0ZWQgYnkgYG1pbmAgYW5kIGBtYXhgLlxuICAgKlxuICAgKiBtaW4ge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICogbWF4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqXG4gICAqL1xuICBQLmNsYW1wZWRUbyA9IFAuY2xhbXAgPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgICB2YXIgayxcbiAgICAgIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XG4gICAgbWluID0gbmV3IEN0b3IobWluKTtcbiAgICBtYXggPSBuZXcgQ3RvcihtYXgpO1xuICAgIGlmICghbWluLnMgfHwgIW1heC5zKSByZXR1cm4gbmV3IEN0b3IoTmFOKTtcbiAgICBpZiAobWluLmd0KG1heCkpIHRocm93IEVycm9yKGludmFsaWRBcmd1bWVudCArIG1heCk7XG4gICAgayA9IHguY21wKG1pbik7XG4gICAgcmV0dXJuIGsgPCAwID8gbWluIDogeC5jbXAobWF4KSA+IDAgPyBtYXggOiBuZXcgQ3Rvcih4KTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVyblxuICAgKiAgIDEgICAgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIGB5YCxcbiAgICogIC0xICAgIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBgeWAsXG4gICAqICAgMCAgICBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUsXG4gICAqICAgTmFOICBpZiB0aGUgdmFsdWUgb2YgZWl0aGVyIERlY2ltYWwgaXMgTmFOLlxuICAgKlxuICAgKi9cbiAgUC5jb21wYXJlZFRvID0gUC5jbXAgPSBmdW5jdGlvbiAoeSkge1xuICAgIHZhciBpLCBqLCB4ZEwsIHlkTCxcbiAgICAgIHggPSB0aGlzLFxuICAgICAgeGQgPSB4LmQsXG4gICAgICB5ZCA9ICh5ID0gbmV3IHguY29uc3RydWN0b3IoeSkpLmQsXG4gICAgICB4cyA9IHgucyxcbiAgICAgIHlzID0geS5zO1xuXG4gICAgLy8gRWl0aGVyIE5hTiBvciDCsUluZmluaXR5P1xuICAgIGlmICgheGQgfHwgIXlkKSB7XG4gICAgICByZXR1cm4gIXhzIHx8ICF5cyA/IE5hTiA6IHhzICE9PSB5cyA/IHhzIDogeGQgPT09IHlkID8gMCA6ICF4ZCBeIHhzIDwgMCA/IDEgOiAtMTtcbiAgICB9XG5cbiAgICAvLyBFaXRoZXIgemVybz9cbiAgICBpZiAoIXhkWzBdIHx8ICF5ZFswXSkgcmV0dXJuIHhkWzBdID8geHMgOiB5ZFswXSA/IC15cyA6IDA7XG5cbiAgICAvLyBTaWducyBkaWZmZXI/XG4gICAgaWYgKHhzICE9PSB5cykgcmV0dXJuIHhzO1xuXG4gICAgLy8gQ29tcGFyZSBleHBvbmVudHMuXG4gICAgaWYgKHguZSAhPT0geS5lKSByZXR1cm4geC5lID4geS5lIF4geHMgPCAwID8gMSA6IC0xO1xuXG4gICAgeGRMID0geGQubGVuZ3RoO1xuICAgIHlkTCA9IHlkLmxlbmd0aDtcblxuICAgIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXG4gICAgZm9yIChpID0gMCwgaiA9IHhkTCA8IHlkTCA/IHhkTCA6IHlkTDsgaSA8IGo7ICsraSkge1xuICAgICAgaWYgKHhkW2ldICE9PSB5ZFtpXSkgcmV0dXJuIHhkW2ldID4geWRbaV0gXiB4cyA8IDAgPyAxIDogLTE7XG4gICAgfVxuXG4gICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxuICAgIHJldHVybiB4ZEwgPT09IHlkTCA/IDAgOiB4ZEwgPiB5ZEwgXiB4cyA8IDAgPyAxIDogLTE7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgY29zaW5lIG9mIHRoZSB2YWx1ZSBpbiByYWRpYW5zIG9mIHRoaXMgRGVjaW1hbC5cbiAgICpcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cbiAgICogUmFuZ2U6IFstMSwgMV1cbiAgICpcbiAgICogY29zKDApICAgICAgICAgPSAxXG4gICAqIGNvcygtMCkgICAgICAgID0gMVxuICAgKiBjb3MoSW5maW5pdHkpICA9IE5hTlxuICAgKiBjb3MoLUluZmluaXR5KSA9IE5hTlxuICAgKiBjb3MoTmFOKSAgICAgICA9IE5hTlxuICAgKlxuICAgKi9cbiAgUC5jb3NpbmUgPSBQLmNvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHIsIHJtLFxuICAgICAgeCA9IHRoaXMsXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcblxuICAgIGlmICgheC5kKSByZXR1cm4gbmV3IEN0b3IoTmFOKTtcblxuICAgIC8vIGNvcygwKSA9IGNvcygtMCkgPSAxXG4gICAgaWYgKCF4LmRbMF0pIHJldHVybiBuZXcgQ3RvcigxKTtcblxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyBNYXRoLm1heCh4LmUsIHguc2QoKSkgKyBMT0dfQkFTRTtcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcblxuICAgIHggPSBjb3NpbmUoQ3RvciwgdG9MZXNzVGhhbkhhbGZQaShDdG9yLCB4KSk7XG5cbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcblxuICAgIHJldHVybiBmaW5hbGlzZShxdWFkcmFudCA9PSAyIHx8IHF1YWRyYW50ID09IDMgPyB4Lm5lZygpIDogeCwgcHIsIHJtLCB0cnVlKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBjdWJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCwgcm91bmRlZCB0b1xuICAgKiBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiAgY2JydCgwKSAgPSAgMFxuICAgKiAgY2JydCgtMCkgPSAtMFxuICAgKiAgY2JydCgxKSAgPSAgMVxuICAgKiAgY2JydCgtMSkgPSAtMVxuICAgKiAgY2JydChOKSAgPSAgTlxuICAgKiAgY2JydCgtSSkgPSAtSVxuICAgKiAgY2JydChJKSAgPSAgSVxuICAgKlxuICAgKiBNYXRoLmNicnQoeCkgPSAoeCA8IDAgPyAtTWF0aC5wb3coLXgsIDEvMykgOiBNYXRoLnBvdyh4LCAxLzMpKVxuICAgKlxuICAgKi9cbiAgUC5jdWJlUm9vdCA9IFAuY2JydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZSwgbSwgbiwgciwgcmVwLCBzLCBzZCwgdCwgdDMsIHQzcGx1c3gsXG4gICAgICB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuXG4gICAgaWYgKCF4LmlzRmluaXRlKCkgfHwgeC5pc1plcm8oKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xuICAgIGV4dGVybmFsID0gZmFsc2U7XG5cbiAgICAvLyBJbml0aWFsIGVzdGltYXRlLlxuICAgIHMgPSB4LnMgKiBtYXRocG93KHgucyAqIHgsIDEgLyAzKTtcblxuICAgIC8vIE1hdGguY2JydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XG4gICAgLy8gUGFzcyB4IHRvIE1hdGgucG93IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSBleHBvbmVudCBvZiB0aGUgcmVzdWx0LlxuICAgIGlmICghcyB8fCBNYXRoLmFicyhzKSA9PSAxIC8gMCkge1xuICAgICAgbiA9IGRpZ2l0c1RvU3RyaW5nKHguZCk7XG4gICAgICBlID0geC5lO1xuXG4gICAgICAvLyBBZGp1c3QgbiBleHBvbmVudCBzbyBpdCBpcyBhIG11bHRpcGxlIG9mIDMgYXdheSBmcm9tIHggZXhwb25lbnQuXG4gICAgICBpZiAocyA9IChlIC0gbi5sZW5ndGggKyAxKSAlIDMpIG4gKz0gKHMgPT0gMSB8fCBzID09IC0yID8gJzAnIDogJzAwJyk7XG4gICAgICBzID0gbWF0aHBvdyhuLCAxIC8gMyk7XG5cbiAgICAgIC8vIFJhcmVseSwgZSBtYXkgYmUgb25lIGxlc3MgdGhhbiB0aGUgcmVzdWx0IGV4cG9uZW50IHZhbHVlLlxuICAgICAgZSA9IG1hdGhmbG9vcigoZSArIDEpIC8gMykgLSAoZSAlIDMgPT0gKGUgPCAwID8gLTEgOiAyKSk7XG5cbiAgICAgIGlmIChzID09IDEgLyAwKSB7XG4gICAgICAgIG4gPSAnNWUnICsgZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG4gPSBzLnRvRXhwb25lbnRpYWwoKTtcbiAgICAgICAgbiA9IG4uc2xpY2UoMCwgbi5pbmRleE9mKCdlJykgKyAxKSArIGU7XG4gICAgICB9XG5cbiAgICAgIHIgPSBuZXcgQ3RvcihuKTtcbiAgICAgIHIucyA9IHgucztcbiAgICB9IGVsc2Uge1xuICAgICAgciA9IG5ldyBDdG9yKHMudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgc2QgPSAoZSA9IEN0b3IucHJlY2lzaW9uKSArIDM7XG5cbiAgICAvLyBIYWxsZXkncyBtZXRob2QuXG4gICAgLy8gVE9ETz8gQ29tcGFyZSBOZXd0b24ncyBtZXRob2QuXG4gICAgZm9yICg7Oykge1xuICAgICAgdCA9IHI7XG4gICAgICB0MyA9IHQudGltZXModCkudGltZXModCk7XG4gICAgICB0M3BsdXN4ID0gdDMucGx1cyh4KTtcbiAgICAgIHIgPSBkaXZpZGUodDNwbHVzeC5wbHVzKHgpLnRpbWVzKHQpLCB0M3BsdXN4LnBsdXModDMpLCBzZCArIDIsIDEpO1xuXG4gICAgICAvLyBUT0RPPyBSZXBsYWNlIHdpdGggZm9yLWxvb3AgYW5kIGNoZWNrUm91bmRpbmdEaWdpdHMuXG4gICAgICBpZiAoZGlnaXRzVG9TdHJpbmcodC5kKS5zbGljZSgwLCBzZCkgPT09IChuID0gZGlnaXRzVG9TdHJpbmcoci5kKSkuc2xpY2UoMCwgc2QpKSB7XG4gICAgICAgIG4gPSBuLnNsaWNlKHNkIC0gMywgc2QgKyAxKTtcblxuICAgICAgICAvLyBUaGUgNHRoIHJvdW5kaW5nIGRpZ2l0IG1heSBiZSBpbiBlcnJvciBieSAtMSBzbyBpZiB0aGUgNCByb3VuZGluZyBkaWdpdHMgYXJlIDk5OTkgb3IgNDk5OVxuICAgICAgICAvLyAsIGkuZS4gYXBwcm9hY2hpbmcgYSByb3VuZGluZyBib3VuZGFyeSwgY29udGludWUgdGhlIGl0ZXJhdGlvbi5cbiAgICAgICAgaWYgKG4gPT0gJzk5OTknIHx8ICFyZXAgJiYgbiA9PSAnNDk5OScpIHtcblxuICAgICAgICAgIC8vIE9uIHRoZSBmaXJzdCBpdGVyYXRpb24gb25seSwgY2hlY2sgdG8gc2VlIGlmIHJvdW5kaW5nIHVwIGdpdmVzIHRoZSBleGFjdCByZXN1bHQgYXMgdGhlXG4gICAgICAgICAgLy8gbmluZXMgbWF5IGluZmluaXRlbHkgcmVwZWF0LlxuICAgICAgICAgIGlmICghcmVwKSB7XG4gICAgICAgICAgICBmaW5hbGlzZSh0LCBlICsgMSwgMCk7XG5cbiAgICAgICAgICAgIGlmICh0LnRpbWVzKHQpLnRpbWVzKHQpLmVxKHgpKSB7XG4gICAgICAgICAgICAgIHIgPSB0O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZCArPSA0O1xuICAgICAgICAgIHJlcCA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAvLyBJZiB0aGUgcm91bmRpbmcgZGlnaXRzIGFyZSBudWxsLCAwezAsNH0gb3IgNTB7MCwzfSwgY2hlY2sgZm9yIGFuIGV4YWN0IHJlc3VsdC5cbiAgICAgICAgICAvLyBJZiBub3QsIHRoZW4gdGhlcmUgYXJlIGZ1cnRoZXIgZGlnaXRzIGFuZCBtIHdpbGwgYmUgdHJ1dGh5LlxuICAgICAgICAgIGlmICghK24gfHwgIStuLnNsaWNlKDEpICYmIG4uY2hhckF0KDApID09ICc1Jykge1xuXG4gICAgICAgICAgICAvLyBUcnVuY2F0ZSB0byB0aGUgZmlyc3Qgcm91bmRpbmcgZGlnaXQuXG4gICAgICAgICAgICBmaW5hbGlzZShyLCBlICsgMSwgMSk7XG4gICAgICAgICAgICBtID0gIXIudGltZXMocikudGltZXMocikuZXEoeCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlcm5hbCA9IHRydWU7XG5cbiAgICByZXR1cm4gZmluYWxpc2UociwgZSwgQ3Rvci5yb3VuZGluZywgbSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxuICAgKlxuICAgKi9cbiAgUC5kZWNpbWFsUGxhY2VzID0gUC5kcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdyxcbiAgICAgIGQgPSB0aGlzLmQsXG4gICAgICBuID0gTmFOO1xuXG4gICAgaWYgKGQpIHtcbiAgICAgIHcgPSBkLmxlbmd0aCAtIDE7XG4gICAgICBuID0gKHcgLSBtYXRoZmxvb3IodGhpcy5lIC8gTE9HX0JBU0UpKSAqIExPR19CQVNFO1xuXG4gICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IHdvcmQuXG4gICAgICB3ID0gZFt3XTtcbiAgICAgIGlmICh3KSBmb3IgKDsgdyAlIDEwID09IDA7IHcgLz0gMTApIG4tLTtcbiAgICAgIGlmIChuIDwgMCkgbiA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG47XG4gIH07XG5cblxuICAvKlxuICAgKiAgbiAvIDAgPSBJXG4gICAqICBuIC8gTiA9IE5cbiAgICogIG4gLyBJID0gMFxuICAgKiAgMCAvIG4gPSAwXG4gICAqICAwIC8gMCA9IE5cbiAgICogIDAgLyBOID0gTlxuICAgKiAgMCAvIEkgPSAwXG4gICAqICBOIC8gbiA9IE5cbiAgICogIE4gLyAwID0gTlxuICAgKiAgTiAvIE4gPSBOXG4gICAqICBOIC8gSSA9IE5cbiAgICogIEkgLyBuID0gSVxuICAgKiAgSSAvIDAgPSBJXG4gICAqICBJIC8gTiA9IE5cbiAgICogIEkgLyBJID0gTlxuICAgKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGRpdmlkZWQgYnkgYHlgLCByb3VuZGVkIHRvXG4gICAqIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqL1xuICBQLmRpdmlkZWRCeSA9IFAuZGl2ID0gZnVuY3Rpb24gKHkpIHtcbiAgICByZXR1cm4gZGl2aWRlKHRoaXMsIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHkpKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBpbnRlZ2VyIHBhcnQgb2YgZGl2aWRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbFxuICAgKiBieSB0aGUgdmFsdWUgb2YgYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqL1xuICBQLmRpdmlkZWRUb0ludGVnZXJCeSA9IFAuZGl2VG9JbnQgPSBmdW5jdGlvbiAoeSkge1xuICAgIHZhciB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBmaW5hbGlzZShkaXZpZGUoeCwgbmV3IEN0b3IoeSksIDAsIDEsIDEpLCBDdG9yLnByZWNpc2lvbiwgQ3Rvci5yb3VuZGluZyk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBgeWAsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXG4gICAqXG4gICAqL1xuICBQLmVxdWFscyA9IFAuZXEgPSBmdW5jdGlvbiAoeSkge1xuICAgIHJldHVybiB0aGlzLmNtcCh5KSA9PT0gMDtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgcm91bmRlZCB0byBhIHdob2xlIG51bWJlciBpbiB0aGVcbiAgICogZGlyZWN0aW9uIG9mIG5lZ2F0aXZlIEluZmluaXR5LlxuICAgKlxuICAgKi9cbiAgUC5mbG9vciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmluYWxpc2UobmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyksIHRoaXMuZSArIDEsIDMpO1xuICB9O1xuXG5cbiAgLypcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIGB5YCwgb3RoZXJ3aXNlIHJldHVyblxuICAgKiBmYWxzZS5cbiAgICpcbiAgICovXG4gIFAuZ3JlYXRlclRoYW4gPSBQLmd0ID0gZnVuY3Rpb24gKHkpIHtcbiAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAwO1xuICB9O1xuXG5cbiAgLypcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIGB5YCxcbiAgICogb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cbiAgICpcbiAgICovXG4gIFAuZ3JlYXRlclRoYW5PckVxdWFsVG8gPSBQLmd0ZSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgdmFyIGsgPSB0aGlzLmNtcCh5KTtcbiAgICByZXR1cm4gayA9PSAxIHx8IGsgPT09IDA7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaHlwZXJib2xpYyBjb3NpbmUgb2YgdGhlIHZhbHVlIGluIHJhZGlhbnMgb2YgdGhpc1xuICAgKiBEZWNpbWFsLlxuICAgKlxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxuICAgKiBSYW5nZTogWzEsIEluZmluaXR5XVxuICAgKlxuICAgKiBjb3NoKHgpID0gMSArIHheMi8yISArIHheNC80ISArIHheNi82ISArIC4uLlxuICAgKlxuICAgKiBjb3NoKDApICAgICAgICAgPSAxXG4gICAqIGNvc2goLTApICAgICAgICA9IDFcbiAgICogY29zaChJbmZpbml0eSkgID0gSW5maW5pdHlcbiAgICogY29zaCgtSW5maW5pdHkpID0gSW5maW5pdHlcbiAgICogY29zaChOYU4pICAgICAgID0gTmFOXG4gICAqXG4gICAqICB4ICAgICAgICB0aW1lIHRha2VuIChtcykgICByZXN1bHRcbiAgICogMTAwMCAgICAgIDkgICAgICAgICAgICAgICAgIDkuODUwMzU1NTcwMDg1MjM0OTY5NGUrNDMzXG4gICAqIDEwMDAwICAgICAyNSAgICAgICAgICAgICAgICA0LjQwMzQwOTExMjgzMTQ2MDc5MzZlKzQzNDJcbiAgICogMTAwMDAwICAgIDE3MSAgICAgICAgICAgICAgIDEuNDAzMzMxNjgwMjEzMDYxNTg5N2UrNDM0MjlcbiAgICogMTAwMDAwMCAgIDM4MTcgICAgICAgICAgICAgIDEuNTE2NjA3Njk4NDAxMDQzNzcyNWUrNDM0Mjk0XG4gICAqIDEwMDAwMDAwICBhYmFuZG9uZWQgYWZ0ZXIgMiBtaW51dGUgd2FpdFxuICAgKlxuICAgKiBUT0RPPyBDb21wYXJlIHBlcmZvcm1hbmNlIG9mIGNvc2goeCkgPSAwLjUgKiAoZXhwKHgpICsgZXhwKC14KSlcbiAgICpcbiAgICovXG4gIFAuaHlwZXJib2xpY0Nvc2luZSA9IFAuY29zaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaywgbiwgcHIsIHJtLCBsZW4sXG4gICAgICB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yLFxuICAgICAgb25lID0gbmV3IEN0b3IoMSk7XG5cbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKHgucyA/IDEgLyAwIDogTmFOKTtcbiAgICBpZiAoeC5pc1plcm8oKSkgcmV0dXJuIG9uZTtcblxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyBNYXRoLm1heCh4LmUsIHguc2QoKSkgKyA0O1xuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xuICAgIGxlbiA9IHguZC5sZW5ndGg7XG5cbiAgICAvLyBBcmd1bWVudCByZWR1Y3Rpb246IGNvcyg0eCkgPSAxIC0gOGNvc14yKHgpICsgOGNvc140KHgpICsgMVxuICAgIC8vIGkuZS4gY29zKHgpID0gMSAtIGNvc14yKHgvNCkoOCAtIDhjb3NeMih4LzQpKVxuXG4gICAgLy8gRXN0aW1hdGUgdGhlIG9wdGltdW0gbnVtYmVyIG9mIHRpbWVzIHRvIHVzZSB0aGUgYXJndW1lbnQgcmVkdWN0aW9uLlxuICAgIC8vIFRPRE8/IEVzdGltYXRpb24gcmV1c2VkIGZyb20gY29zaW5lKCkgYW5kIG1heSBub3QgYmUgb3B0aW1hbCBoZXJlLlxuICAgIGlmIChsZW4gPCAzMikge1xuICAgICAgayA9IE1hdGguY2VpbChsZW4gLyAzKTtcbiAgICAgIG4gPSAoMSAvIHRpbnlQb3coNCwgaykpLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGsgPSAxNjtcbiAgICAgIG4gPSAnMi4zMjgzMDY0MzY1Mzg2OTYyODkwNjI1ZS0xMCc7XG4gICAgfVxuXG4gICAgeCA9IHRheWxvclNlcmllcyhDdG9yLCAxLCB4LnRpbWVzKG4pLCBuZXcgQ3RvcigxKSwgdHJ1ZSk7XG5cbiAgICAvLyBSZXZlcnNlIGFyZ3VtZW50IHJlZHVjdGlvblxuICAgIHZhciBjb3NoMl94LFxuICAgICAgaSA9IGssXG4gICAgICBkOCA9IG5ldyBDdG9yKDgpO1xuICAgIGZvciAoOyBpLS07KSB7XG4gICAgICBjb3NoMl94ID0geC50aW1lcyh4KTtcbiAgICAgIHggPSBvbmUubWludXMoY29zaDJfeC50aW1lcyhkOC5taW51cyhjb3NoMl94LnRpbWVzKGQ4KSkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmluYWxpc2UoeCwgQ3Rvci5wcmVjaXNpb24gPSBwciwgQ3Rvci5yb3VuZGluZyA9IHJtLCB0cnVlKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBoeXBlcmJvbGljIHNpbmUgb2YgdGhlIHZhbHVlIGluIHJhZGlhbnMgb2YgdGhpc1xuICAgKiBEZWNpbWFsLlxuICAgKlxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxuICAgKiBSYW5nZTogWy1JbmZpbml0eSwgSW5maW5pdHldXG4gICAqXG4gICAqIHNpbmgoeCkgPSB4ICsgeF4zLzMhICsgeF41LzUhICsgeF43LzchICsgLi4uXG4gICAqXG4gICAqIHNpbmgoMCkgICAgICAgICA9IDBcbiAgICogc2luaCgtMCkgICAgICAgID0gLTBcbiAgICogc2luaChJbmZpbml0eSkgID0gSW5maW5pdHlcbiAgICogc2luaCgtSW5maW5pdHkpID0gLUluZmluaXR5XG4gICAqIHNpbmgoTmFOKSAgICAgICA9IE5hTlxuICAgKlxuICAgKiB4ICAgICAgICB0aW1lIHRha2VuIChtcylcbiAgICogMTAgICAgICAgMiBtc1xuICAgKiAxMDAgICAgICA1IG1zXG4gICAqIDEwMDAgICAgIDE0IG1zXG4gICAqIDEwMDAwICAgIDgyIG1zXG4gICAqIDEwMDAwMCAgIDg4NiBtcyAgICAgICAgICAgIDEuNDAzMzMxNjgwMjEzMDYxNTg5N2UrNDM0MjlcbiAgICogMjAwMDAwICAgMjYxMyBtc1xuICAgKiAzMDAwMDAgICA1NDA3IG1zXG4gICAqIDQwMDAwMCAgIDg4MjQgbXNcbiAgICogNTAwMDAwICAgMTMwMjYgbXMgICAgICAgICAgOC43MDgwNjQzNjEyNzE4MDg0MTI5ZSsyMTcxNDZcbiAgICogMTAwMDAwMCAgNDg1NDMgbXNcbiAgICpcbiAgICogVE9ETz8gQ29tcGFyZSBwZXJmb3JtYW5jZSBvZiBzaW5oKHgpID0gMC41ICogKGV4cCh4KSAtIGV4cCgteCkpXG4gICAqXG4gICAqL1xuICBQLmh5cGVyYm9saWNTaW5lID0gUC5zaW5oID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrLCBwciwgcm0sIGxlbixcbiAgICAgIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XG5cbiAgICBpZiAoIXguaXNGaW5pdGUoKSB8fCB4LmlzWmVybygpKSByZXR1cm4gbmV3IEN0b3IoeCk7XG5cbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgTWF0aC5tYXgoeC5lLCB4LnNkKCkpICsgNDtcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcbiAgICBsZW4gPSB4LmQubGVuZ3RoO1xuXG4gICAgaWYgKGxlbiA8IDMpIHtcbiAgICAgIHggPSB0YXlsb3JTZXJpZXMoQ3RvciwgMiwgeCwgeCwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gQWx0ZXJuYXRpdmUgYXJndW1lbnQgcmVkdWN0aW9uOiBzaW5oKDN4KSA9IHNpbmgoeCkoMyArIDRzaW5oXjIoeCkpXG4gICAgICAvLyBpLmUuIHNpbmgoeCkgPSBzaW5oKHgvMykoMyArIDRzaW5oXjIoeC8zKSlcbiAgICAgIC8vIDMgbXVsdGlwbGljYXRpb25zIGFuZCAxIGFkZGl0aW9uXG5cbiAgICAgIC8vIEFyZ3VtZW50IHJlZHVjdGlvbjogc2luaCg1eCkgPSBzaW5oKHgpKDUgKyBzaW5oXjIoeCkoMjAgKyAxNnNpbmheMih4KSkpXG4gICAgICAvLyBpLmUuIHNpbmgoeCkgPSBzaW5oKHgvNSkoNSArIHNpbmheMih4LzUpKDIwICsgMTZzaW5oXjIoeC81KSkpXG4gICAgICAvLyA0IG11bHRpcGxpY2F0aW9ucyBhbmQgMiBhZGRpdGlvbnNcblxuICAgICAgLy8gRXN0aW1hdGUgdGhlIG9wdGltdW0gbnVtYmVyIG9mIHRpbWVzIHRvIHVzZSB0aGUgYXJndW1lbnQgcmVkdWN0aW9uLlxuICAgICAgayA9IDEuNCAqIE1hdGguc3FydChsZW4pO1xuICAgICAgayA9IGsgPiAxNiA/IDE2IDogayB8IDA7XG5cbiAgICAgIHggPSB4LnRpbWVzKDEgLyB0aW55UG93KDUsIGspKTtcbiAgICAgIHggPSB0YXlsb3JTZXJpZXMoQ3RvciwgMiwgeCwgeCwgdHJ1ZSk7XG5cbiAgICAgIC8vIFJldmVyc2UgYXJndW1lbnQgcmVkdWN0aW9uXG4gICAgICB2YXIgc2luaDJfeCxcbiAgICAgICAgZDUgPSBuZXcgQ3Rvcig1KSxcbiAgICAgICAgZDE2ID0gbmV3IEN0b3IoMTYpLFxuICAgICAgICBkMjAgPSBuZXcgQ3RvcigyMCk7XG4gICAgICBmb3IgKDsgay0tOykge1xuICAgICAgICBzaW5oMl94ID0geC50aW1lcyh4KTtcbiAgICAgICAgeCA9IHgudGltZXMoZDUucGx1cyhzaW5oMl94LnRpbWVzKGQxNi50aW1lcyhzaW5oMl94KS5wbHVzKGQyMCkpKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XG5cbiAgICByZXR1cm4gZmluYWxpc2UoeCwgcHIsIHJtLCB0cnVlKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBoeXBlcmJvbGljIHRhbmdlbnQgb2YgdGhlIHZhbHVlIGluIHJhZGlhbnMgb2YgdGhpc1xuICAgKiBEZWNpbWFsLlxuICAgKlxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxuICAgKiBSYW5nZTogWy0xLCAxXVxuICAgKlxuICAgKiB0YW5oKHgpID0gc2luaCh4KSAvIGNvc2goeClcbiAgICpcbiAgICogdGFuaCgwKSAgICAgICAgID0gMFxuICAgKiB0YW5oKC0wKSAgICAgICAgPSAtMFxuICAgKiB0YW5oKEluZmluaXR5KSAgPSAxXG4gICAqIHRhbmgoLUluZmluaXR5KSA9IC0xXG4gICAqIHRhbmgoTmFOKSAgICAgICA9IE5hTlxuICAgKlxuICAgKi9cbiAgUC5oeXBlcmJvbGljVGFuZ2VudCA9IFAudGFuaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHIsIHJtLFxuICAgICAgeCA9IHRoaXMsXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcblxuICAgIGlmICgheC5pc0Zpbml0ZSgpKSByZXR1cm4gbmV3IEN0b3IoeC5zKTtcbiAgICBpZiAoeC5pc1plcm8oKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xuXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwciArIDc7XG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XG5cbiAgICByZXR1cm4gZGl2aWRlKHguc2luaCgpLCB4LmNvc2goKSwgQ3Rvci5wcmVjaXNpb24gPSBwciwgQ3Rvci5yb3VuZGluZyA9IHJtKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhcmNjb3NpbmUgKGludmVyc2UgY29zaW5lKSBpbiByYWRpYW5zIG9mIHRoZSB2YWx1ZSBvZlxuICAgKiB0aGlzIERlY2ltYWwuXG4gICAqXG4gICAqIERvbWFpbjogWy0xLCAxXVxuICAgKiBSYW5nZTogWzAsIHBpXVxuICAgKlxuICAgKiBhY29zKHgpID0gcGkvMiAtIGFzaW4oeClcbiAgICpcbiAgICogYWNvcygwKSAgICAgICA9IHBpLzJcbiAgICogYWNvcygtMCkgICAgICA9IHBpLzJcbiAgICogYWNvcygxKSAgICAgICA9IDBcbiAgICogYWNvcygtMSkgICAgICA9IHBpXG4gICAqIGFjb3MoMS8yKSAgICAgPSBwaS8zXG4gICAqIGFjb3MoLTEvMikgICAgPSAyKnBpLzNcbiAgICogYWNvcyh8eHwgPiAxKSA9IE5hTlxuICAgKiBhY29zKE5hTikgICAgID0gTmFOXG4gICAqXG4gICAqL1xuICBQLmludmVyc2VDb3NpbmUgPSBQLmFjb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhhbGZQaSxcbiAgICAgIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXG4gICAgICBrID0geC5hYnMoKS5jbXAoMSksXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uLFxuICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xuXG4gICAgaWYgKGsgIT09IC0xKSB7XG4gICAgICByZXR1cm4gayA9PT0gMFxuICAgICAgICAvLyB8eHwgaXMgMVxuICAgICAgICAgICAgID8geC5pc05lZygpID8gZ2V0UGkoQ3RvciwgcHIsIHJtKSA6IG5ldyBDdG9yKDApXG4gICAgICAgIC8vIHx4fCA+IDEgb3IgeCBpcyBOYU5cbiAgICAgICAgICAgICA6IG5ldyBDdG9yKE5hTik7XG4gICAgfVxuXG4gICAgaWYgKHguaXNaZXJvKCkpIHJldHVybiBnZXRQaShDdG9yLCBwciArIDQsIHJtKS50aW1lcygwLjUpO1xuXG4gICAgLy8gVE9ETz8gU3BlY2lhbCBjYXNlIGFjb3MoMC41KSA9IHBpLzMgYW5kIGFjb3MoLTAuNSkgPSAyKnBpLzNcblxuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyA2O1xuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xuXG4gICAgeCA9IHguYXNpbigpO1xuICAgIGhhbGZQaSA9IGdldFBpKEN0b3IsIHByICsgNCwgcm0pLnRpbWVzKDAuNSk7XG5cbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcblxuICAgIHJldHVybiBoYWxmUGkubWludXMoeCk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaHlwZXJib2xpYyBjb3NpbmUgaW4gcmFkaWFucyBvZiB0aGVcbiAgICogdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxuICAgKlxuICAgKiBEb21haW46IFsxLCBJbmZpbml0eV1cbiAgICogUmFuZ2U6IFswLCBJbmZpbml0eV1cbiAgICpcbiAgICogYWNvc2goeCkgPSBsbih4ICsgc3FydCh4XjIgLSAxKSlcbiAgICpcbiAgICogYWNvc2goeCA8IDEpICAgICA9IE5hTlxuICAgKiBhY29zaChOYU4pICAgICAgID0gTmFOXG4gICAqIGFjb3NoKEluZmluaXR5KSAgPSBJbmZpbml0eVxuICAgKiBhY29zaCgtSW5maW5pdHkpID0gTmFOXG4gICAqIGFjb3NoKDApICAgICAgICAgPSBOYU5cbiAgICogYWNvc2goLTApICAgICAgICA9IE5hTlxuICAgKiBhY29zaCgxKSAgICAgICAgID0gMFxuICAgKiBhY29zaCgtMSkgICAgICAgID0gTmFOXG4gICAqXG4gICAqL1xuICBQLmludmVyc2VIeXBlcmJvbGljQ29zaW5lID0gUC5hY29zaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHIsIHJtLFxuICAgICAgeCA9IHRoaXMsXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcblxuICAgIGlmICh4Lmx0ZSgxKSkgcmV0dXJuIG5ldyBDdG9yKHguZXEoMSkgPyAwIDogTmFOKTtcbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xuXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwciArIE1hdGgubWF4KE1hdGguYWJzKHguZSksIHguc2QoKSkgKyA0O1xuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xuICAgIGV4dGVybmFsID0gZmFsc2U7XG5cbiAgICB4ID0geC50aW1lcyh4KS5taW51cygxKS5zcXJ0KCkucGx1cyh4KTtcblxuICAgIGV4dGVybmFsID0gdHJ1ZTtcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcblxuICAgIHJldHVybiB4LmxuKCk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaHlwZXJib2xpYyBzaW5lIGluIHJhZGlhbnMgb2YgdGhlIHZhbHVlXG4gICAqIG9mIHRoaXMgRGVjaW1hbC5cbiAgICpcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cbiAgICogUmFuZ2U6IFstSW5maW5pdHksIEluZmluaXR5XVxuICAgKlxuICAgKiBhc2luaCh4KSA9IGxuKHggKyBzcXJ0KHheMiArIDEpKVxuICAgKlxuICAgKiBhc2luaChOYU4pICAgICAgID0gTmFOXG4gICAqIGFzaW5oKEluZmluaXR5KSAgPSBJbmZpbml0eVxuICAgKiBhc2luaCgtSW5maW5pdHkpID0gLUluZmluaXR5XG4gICAqIGFzaW5oKDApICAgICAgICAgPSAwXG4gICAqIGFzaW5oKC0wKSAgICAgICAgPSAtMFxuICAgKlxuICAgKi9cbiAgUC5pbnZlcnNlSHlwZXJib2xpY1NpbmUgPSBQLmFzaW5oID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwciwgcm0sXG4gICAgICB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuXG4gICAgaWYgKCF4LmlzRmluaXRlKCkgfHwgeC5pc1plcm8oKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xuXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwciArIDIgKiBNYXRoLm1heChNYXRoLmFicyh4LmUpLCB4LnNkKCkpICsgNjtcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xuXG4gICAgeCA9IHgudGltZXMoeCkucGx1cygxKS5zcXJ0KCkucGx1cyh4KTtcblxuICAgIGV4dGVybmFsID0gdHJ1ZTtcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcblxuICAgIHJldHVybiB4LmxuKCk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaHlwZXJib2xpYyB0YW5nZW50IGluIHJhZGlhbnMgb2YgdGhlXG4gICAqIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cbiAgICpcbiAgICogRG9tYWluOiBbLTEsIDFdXG4gICAqIFJhbmdlOiBbLUluZmluaXR5LCBJbmZpbml0eV1cbiAgICpcbiAgICogYXRhbmgoeCkgPSAwLjUgKiBsbigoMSArIHgpIC8gKDEgLSB4KSlcbiAgICpcbiAgICogYXRhbmgofHh8ID4gMSkgICA9IE5hTlxuICAgKiBhdGFuaChOYU4pICAgICAgID0gTmFOXG4gICAqIGF0YW5oKEluZmluaXR5KSAgPSBOYU5cbiAgICogYXRhbmgoLUluZmluaXR5KSA9IE5hTlxuICAgKiBhdGFuaCgwKSAgICAgICAgID0gMFxuICAgKiBhdGFuaCgtMCkgICAgICAgID0gLTBcbiAgICogYXRhbmgoMSkgICAgICAgICA9IEluZmluaXR5XG4gICAqIGF0YW5oKC0xKSAgICAgICAgPSAtSW5maW5pdHlcbiAgICpcbiAgICovXG4gIFAuaW52ZXJzZUh5cGVyYm9saWNUYW5nZW50ID0gUC5hdGFuaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHIsIHJtLCB3cHIsIHhzZCxcbiAgICAgIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XG5cbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XG4gICAgaWYgKHguZSA+PSAwKSByZXR1cm4gbmV3IEN0b3IoeC5hYnMoKS5lcSgxKSA/IHgucyAvIDAgOiB4LmlzWmVybygpID8geCA6IE5hTik7XG5cbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcbiAgICB4c2QgPSB4LnNkKCk7XG5cbiAgICBpZiAoTWF0aC5tYXgoeHNkLCBwcikgPCAyICogLXguZSAtIDEpIHJldHVybiBmaW5hbGlzZShuZXcgQ3Rvcih4KSwgcHIsIHJtLCB0cnVlKTtcblxuICAgIEN0b3IucHJlY2lzaW9uID0gd3ByID0geHNkIC0geC5lO1xuXG4gICAgeCA9IGRpdmlkZSh4LnBsdXMoMSksIG5ldyBDdG9yKDEpLm1pbnVzKHgpLCB3cHIgKyBwciwgMSk7XG5cbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgNDtcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcblxuICAgIHggPSB4LmxuKCk7XG5cbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcblxuICAgIHJldHVybiB4LnRpbWVzKDAuNSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgYXJjc2luZSAoaW52ZXJzZSBzaW5lKSBpbiByYWRpYW5zIG9mIHRoZSB2YWx1ZSBvZiB0aGlzXG4gICAqIERlY2ltYWwuXG4gICAqXG4gICAqIERvbWFpbjogWy1JbmZpbml0eSwgSW5maW5pdHldXG4gICAqIFJhbmdlOiBbLXBpLzIsIHBpLzJdXG4gICAqXG4gICAqIGFzaW4oeCkgPSAyKmF0YW4oeC8oMSArIHNxcnQoMSAtIHheMikpKVxuICAgKlxuICAgKiBhc2luKDApICAgICAgID0gMFxuICAgKiBhc2luKC0wKSAgICAgID0gLTBcbiAgICogYXNpbigxLzIpICAgICA9IHBpLzZcbiAgICogYXNpbigtMS8yKSAgICA9IC1waS82XG4gICAqIGFzaW4oMSkgICAgICAgPSBwaS8yXG4gICAqIGFzaW4oLTEpICAgICAgPSAtcGkvMlxuICAgKiBhc2luKHx4fCA+IDEpID0gTmFOXG4gICAqIGFzaW4oTmFOKSAgICAgPSBOYU5cbiAgICpcbiAgICogVE9ETz8gQ29tcGFyZSBwZXJmb3JtYW5jZSBvZiBUYXlsb3Igc2VyaWVzLlxuICAgKlxuICAgKi9cbiAgUC5pbnZlcnNlU2luZSA9IFAuYXNpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGFsZlBpLCBrLFxuICAgICAgcHIsIHJtLFxuICAgICAgeCA9IHRoaXMsXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcblxuICAgIGlmICh4LmlzWmVybygpKSByZXR1cm4gbmV3IEN0b3IoeCk7XG5cbiAgICBrID0geC5hYnMoKS5jbXAoMSk7XG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XG5cbiAgICBpZiAoayAhPT0gLTEpIHtcblxuICAgICAgLy8gfHh8IGlzIDFcbiAgICAgIGlmIChrID09PSAwKSB7XG4gICAgICAgIGhhbGZQaSA9IGdldFBpKEN0b3IsIHByICsgNCwgcm0pLnRpbWVzKDAuNSk7XG4gICAgICAgIGhhbGZQaS5zID0geC5zO1xuICAgICAgICByZXR1cm4gaGFsZlBpO1xuICAgICAgfVxuXG4gICAgICAvLyB8eHwgPiAxIG9yIHggaXMgTmFOXG4gICAgICByZXR1cm4gbmV3IEN0b3IoTmFOKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPPyBTcGVjaWFsIGNhc2UgYXNpbigxLzIpID0gcGkvNiBhbmQgYXNpbigtMS8yKSA9IC1waS82XG5cbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgNjtcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcblxuICAgIHggPSB4LmRpdihuZXcgQ3RvcigxKS5taW51cyh4LnRpbWVzKHgpKS5zcXJ0KCkucGx1cygxKSkuYXRhbigpO1xuXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XG5cbiAgICByZXR1cm4geC50aW1lcygyKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhcmN0YW5nZW50IChpbnZlcnNlIHRhbmdlbnQpIGluIHJhZGlhbnMgb2YgdGhlIHZhbHVlXG4gICAqIG9mIHRoaXMgRGVjaW1hbC5cbiAgICpcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cbiAgICogUmFuZ2U6IFstcGkvMiwgcGkvMl1cbiAgICpcbiAgICogYXRhbih4KSA9IHggLSB4XjMvMyArIHheNS81IC0geF43LzcgKyAuLi5cbiAgICpcbiAgICogYXRhbigwKSAgICAgICAgID0gMFxuICAgKiBhdGFuKC0wKSAgICAgICAgPSAtMFxuICAgKiBhdGFuKDEpICAgICAgICAgPSBwaS80XG4gICAqIGF0YW4oLTEpICAgICAgICA9IC1waS80XG4gICAqIGF0YW4oSW5maW5pdHkpICA9IHBpLzJcbiAgICogYXRhbigtSW5maW5pdHkpID0gLXBpLzJcbiAgICogYXRhbihOYU4pICAgICAgID0gTmFOXG4gICAqXG4gICAqL1xuICBQLmludmVyc2VUYW5nZW50ID0gUC5hdGFuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpLCBqLCBrLCBuLCBweCwgdCwgciwgd3ByLCB4MixcbiAgICAgIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uLFxuICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xuXG4gICAgaWYgKCF4LmlzRmluaXRlKCkpIHtcbiAgICAgIGlmICgheC5zKSByZXR1cm4gbmV3IEN0b3IoTmFOKTtcbiAgICAgIGlmIChwciArIDQgPD0gUElfUFJFQ0lTSU9OKSB7XG4gICAgICAgIHIgPSBnZXRQaShDdG9yLCBwciArIDQsIHJtKS50aW1lcygwLjUpO1xuICAgICAgICByLnMgPSB4LnM7XG4gICAgICAgIHJldHVybiByO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoeC5pc1plcm8oKSkge1xuICAgICAgcmV0dXJuIG5ldyBDdG9yKHgpO1xuICAgIH0gZWxzZSBpZiAoeC5hYnMoKS5lcSgxKSAmJiBwciArIDQgPD0gUElfUFJFQ0lTSU9OKSB7XG4gICAgICByID0gZ2V0UGkoQ3RvciwgcHIgKyA0LCBybSkudGltZXMoMC4yNSk7XG4gICAgICByLnMgPSB4LnM7XG4gICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICBDdG9yLnByZWNpc2lvbiA9IHdwciA9IHByICsgMTA7XG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XG5cbiAgICAvLyBUT0RPPyBpZiAoeCA+PSAxICYmIHByIDw9IFBJX1BSRUNJU0lPTikgYXRhbih4KSA9IGhhbGZQaSAqIHgucyAtIGF0YW4oMSAvIHgpO1xuXG4gICAgLy8gQXJndW1lbnQgcmVkdWN0aW9uXG4gICAgLy8gRW5zdXJlIHx4fCA8IDAuNDJcbiAgICAvLyBhdGFuKHgpID0gMiAqIGF0YW4oeCAvICgxICsgc3FydCgxICsgeF4yKSkpXG5cbiAgICBrID0gTWF0aC5taW4oMjgsIHdwciAvIExPR19CQVNFICsgMiB8IDApO1xuXG4gICAgZm9yIChpID0gazsgaTsgLS1pKSB4ID0geC5kaXYoeC50aW1lcyh4KS5wbHVzKDEpLnNxcnQoKS5wbHVzKDEpKTtcblxuICAgIGV4dGVybmFsID0gZmFsc2U7XG5cbiAgICBqID0gTWF0aC5jZWlsKHdwciAvIExPR19CQVNFKTtcbiAgICBuID0gMTtcbiAgICB4MiA9IHgudGltZXMoeCk7XG4gICAgciA9IG5ldyBDdG9yKHgpO1xuICAgIHB4ID0geDtcblxuICAgIC8vIGF0YW4oeCkgPSB4IC0geF4zLzMgKyB4XjUvNSAtIHheNy83ICsgLi4uXG4gICAgZm9yICg7IGkgIT09IC0xOykge1xuICAgICAgcHggPSBweC50aW1lcyh4Mik7XG4gICAgICB0ID0gci5taW51cyhweC5kaXYobiArPSAyKSk7XG5cbiAgICAgIHB4ID0gcHgudGltZXMoeDIpO1xuICAgICAgciA9IHQucGx1cyhweC5kaXYobiArPSAyKSk7XG5cbiAgICAgIGlmIChyLmRbal0gIT09IHZvaWQgMCkgZm9yIChpID0gajsgci5kW2ldID09PSB0LmRbaV0gJiYgaS0tOyk7XG4gICAgfVxuXG4gICAgaWYgKGspIHIgPSByLnRpbWVzKDIgPDwgKGsgLSAxKSk7XG5cbiAgICBleHRlcm5hbCA9IHRydWU7XG5cbiAgICByZXR1cm4gZmluYWxpc2UociwgQ3Rvci5wcmVjaXNpb24gPSBwciwgQ3Rvci5yb3VuZGluZyA9IHJtLCB0cnVlKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgYSBmaW5pdGUgbnVtYmVyLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxuICAgKlxuICAgKi9cbiAgUC5pc0Zpbml0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gISF0aGlzLmQ7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIGFuIGludGVnZXIsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXG4gICAqXG4gICAqL1xuICBQLmlzSW50ZWdlciA9IFAuaXNJbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5kICYmIG1hdGhmbG9vcih0aGlzLmUgLyBMT0dfQkFTRSkgPiB0aGlzLmQubGVuZ3RoIC0gMjtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgTmFOLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxuICAgKlxuICAgKi9cbiAgUC5pc05hTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gIXRoaXMucztcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgbmVnYXRpdmUsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXG4gICAqXG4gICAqL1xuICBQLmlzTmVnYXRpdmUgPSBQLmlzTmVnID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnMgPCAwO1xuICB9O1xuXG5cbiAgLypcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBwb3NpdGl2ZSwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cbiAgICpcbiAgICovXG4gIFAuaXNQb3NpdGl2ZSA9IFAuaXNQb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucyA+IDA7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIDAgb3IgLTAsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXG4gICAqXG4gICAqL1xuICBQLmlzWmVybyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gISF0aGlzLmQgJiYgdGhpcy5kWzBdID09PSAwO1xuICB9O1xuXG5cbiAgLypcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBsZXNzIHRoYW4gYHlgLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxuICAgKlxuICAgKi9cbiAgUC5sZXNzVGhhbiA9IFAubHQgPSBmdW5jdGlvbiAoeSkge1xuICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDA7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgeWAsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXG4gICAqXG4gICAqL1xuICBQLmxlc3NUaGFuT3JFcXVhbFRvID0gUC5sdGUgPSBmdW5jdGlvbiAoeSkge1xuICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDE7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gdGhlIGxvZ2FyaXRobSBvZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHRvIHRoZSBzcGVjaWZpZWQgYmFzZSwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgcmV0dXJuIGxvZ1sxMF0oYXJnKS5cbiAgICpcbiAgICogbG9nW2Jhc2VdKGFyZykgPSBsbihhcmcpIC8gbG4oYmFzZSlcbiAgICpcbiAgICogVGhlIHJlc3VsdCB3aWxsIGFsd2F5cyBiZSBjb3JyZWN0bHkgcm91bmRlZCBpZiB0aGUgYmFzZSBvZiB0aGUgbG9nIGlzIDEwLCBhbmQgJ2FsbW9zdCBhbHdheXMnXG4gICAqIG90aGVyd2lzZTpcbiAgICpcbiAgICogRGVwZW5kaW5nIG9uIHRoZSByb3VuZGluZyBtb2RlLCB0aGUgcmVzdWx0IG1heSBiZSBpbmNvcnJlY3RseSByb3VuZGVkIGlmIHRoZSBmaXJzdCBmaWZ0ZWVuXG4gICAqIHJvdW5kaW5nIGRpZ2l0cyBhcmUgWzQ5XTk5OTk5OTk5OTk5OTk5IG9yIFs1MF0wMDAwMDAwMDAwMDAwMC4gSW4gdGhhdCBjYXNlLCB0aGUgbWF4aW11bSBlcnJvclxuICAgKiBiZXR3ZWVuIHRoZSByZXN1bHQgYW5kIHRoZSBjb3JyZWN0bHkgcm91bmRlZCByZXN1bHQgd2lsbCBiZSBvbmUgdWxwICh1bml0IGluIHRoZSBsYXN0IHBsYWNlKS5cbiAgICpcbiAgICogbG9nWy1iXShhKSAgICAgICA9IE5hTlxuICAgKiBsb2dbMF0oYSkgICAgICAgID0gTmFOXG4gICAqIGxvZ1sxXShhKSAgICAgICAgPSBOYU5cbiAgICogbG9nW05hTl0oYSkgICAgICA9IE5hTlxuICAgKiBsb2dbSW5maW5pdHldKGEpID0gTmFOXG4gICAqIGxvZ1tiXSgwKSAgICAgICAgPSAtSW5maW5pdHlcbiAgICogbG9nW2JdKC0wKSAgICAgICA9IC1JbmZpbml0eVxuICAgKiBsb2dbYl0oLWEpICAgICAgID0gTmFOXG4gICAqIGxvZ1tiXSgxKSAgICAgICAgPSAwXG4gICAqIGxvZ1tiXShJbmZpbml0eSkgPSBJbmZpbml0eVxuICAgKiBsb2dbYl0oTmFOKSAgICAgID0gTmFOXG4gICAqXG4gICAqIFtiYXNlXSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgYmFzZSBvZiB0aGUgbG9nYXJpdGhtLlxuICAgKlxuICAgKi9cbiAgUC5sb2dhcml0aG0gPSBQLmxvZyA9IGZ1bmN0aW9uIChiYXNlKSB7XG4gICAgdmFyIGlzQmFzZTEwLCBkLCBkZW5vbWluYXRvciwgaywgaW5mLCBudW0sIHNkLCByLFxuICAgICAgYXJnID0gdGhpcyxcbiAgICAgIEN0b3IgPSBhcmcuY29uc3RydWN0b3IsXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uLFxuICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nLFxuICAgICAgZ3VhcmQgPSA1O1xuXG4gICAgLy8gRGVmYXVsdCBiYXNlIGlzIDEwLlxuICAgIGlmIChiYXNlID09IG51bGwpIHtcbiAgICAgIGJhc2UgPSBuZXcgQ3RvcigxMCk7XG4gICAgICBpc0Jhc2UxMCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2UgPSBuZXcgQ3RvcihiYXNlKTtcbiAgICAgIGQgPSBiYXNlLmQ7XG5cbiAgICAgIC8vIFJldHVybiBOYU4gaWYgYmFzZSBpcyBuZWdhdGl2ZSwgb3Igbm9uLWZpbml0ZSwgb3IgaXMgMCBvciAxLlxuICAgICAgaWYgKGJhc2UucyA8IDAgfHwgIWQgfHwgIWRbMF0gfHwgYmFzZS5lcSgxKSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XG5cbiAgICAgIGlzQmFzZTEwID0gYmFzZS5lcSgxMCk7XG4gICAgfVxuXG4gICAgZCA9IGFyZy5kO1xuXG4gICAgLy8gSXMgYXJnIG5lZ2F0aXZlLCBub24tZmluaXRlLCAwIG9yIDE/XG4gICAgaWYgKGFyZy5zIDwgMCB8fCAhZCB8fCAhZFswXSB8fCBhcmcuZXEoMSkpIHtcbiAgICAgIHJldHVybiBuZXcgQ3RvcihkICYmICFkWzBdID8gLTEgLyAwIDogYXJnLnMgIT0gMSA/IE5hTiA6IGQgPyAwIDogMSAvIDApO1xuICAgIH1cblxuICAgIC8vIFRoZSByZXN1bHQgd2lsbCBoYXZlIGEgbm9uLXRlcm1pbmF0aW5nIGRlY2ltYWwgZXhwYW5zaW9uIGlmIGJhc2UgaXMgMTAgYW5kIGFyZyBpcyBub3QgYW5cbiAgICAvLyBpbnRlZ2VyIHBvd2VyIG9mIDEwLlxuICAgIGlmIChpc0Jhc2UxMCkge1xuICAgICAgaWYgKGQubGVuZ3RoID4gMSkge1xuICAgICAgICBpbmYgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChrID0gZFswXTsgayAlIDEwID09PSAwOykgayAvPSAxMDtcbiAgICAgICAgaW5mID0gayAhPT0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlcm5hbCA9IGZhbHNlO1xuICAgIHNkID0gcHIgKyBndWFyZDtcbiAgICBudW0gPSBuYXR1cmFsTG9nYXJpdGhtKGFyZywgc2QpO1xuICAgIGRlbm9taW5hdG9yID0gaXNCYXNlMTAgPyBnZXRMbjEwKEN0b3IsIHNkICsgMTApIDogbmF0dXJhbExvZ2FyaXRobShiYXNlLCBzZCk7XG5cbiAgICAvLyBUaGUgcmVzdWx0IHdpbGwgaGF2ZSA1IHJvdW5kaW5nIGRpZ2l0cy5cbiAgICByID0gZGl2aWRlKG51bSwgZGVub21pbmF0b3IsIHNkLCAxKTtcblxuICAgIC8vIElmIGF0IGEgcm91bmRpbmcgYm91bmRhcnksIGkuZS4gdGhlIHJlc3VsdCdzIHJvdW5kaW5nIGRpZ2l0cyBhcmUgWzQ5XTk5OTkgb3IgWzUwXTAwMDAsXG4gICAgLy8gY2FsY3VsYXRlIDEwIGZ1cnRoZXIgZGlnaXRzLlxuICAgIC8vXG4gICAgLy8gSWYgdGhlIHJlc3VsdCBpcyBrbm93biB0byBoYXZlIGFuIGluZmluaXRlIGRlY2ltYWwgZXhwYW5zaW9uLCByZXBlYXQgdGhpcyB1bnRpbCBpdCBpcyBjbGVhclxuICAgIC8vIHRoYXQgdGhlIHJlc3VsdCBpcyBhYm92ZSBvciBiZWxvdyB0aGUgYm91bmRhcnkuIE90aGVyd2lzZSwgaWYgYWZ0ZXIgY2FsY3VsYXRpbmcgdGhlIDEwXG4gICAgLy8gZnVydGhlciBkaWdpdHMsIHRoZSBsYXN0IDE0IGFyZSBuaW5lcywgcm91bmQgdXAgYW5kIGFzc3VtZSB0aGUgcmVzdWx0IGlzIGV4YWN0LlxuICAgIC8vIEFsc28gYXNzdW1lIHRoZSByZXN1bHQgaXMgZXhhY3QgaWYgdGhlIGxhc3QgMTQgYXJlIHplcm8uXG4gICAgLy9cbiAgICAvLyBFeGFtcGxlIG9mIGEgcmVzdWx0IHRoYXQgd2lsbCBiZSBpbmNvcnJlY3RseSByb3VuZGVkOlxuICAgIC8vIGxvZ1sxMDQ4NTc2XSg0NTAzNTk5NjI3MzcwNTAyKSA9IDIuNjAwMDAwMDAwMDAwMDAwMDk2MTAyNzk1MTE0NDQ3NDYuLi5cbiAgICAvLyBUaGUgYWJvdmUgcmVzdWx0IGNvcnJlY3RseSByb3VuZGVkIHVzaW5nIFJPVU5EX0NFSUwgdG8gMSBkZWNpbWFsIHBsYWNlIHNob3VsZCBiZSAyLjcsIGJ1dCBpdFxuICAgIC8vIHdpbGwgYmUgZ2l2ZW4gYXMgMi42IGFzIHRoZXJlIGFyZSAxNSB6ZXJvcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgcmVxdWVzdGVkIGRlY2ltYWwgcGxhY2UsIHNvXG4gICAgLy8gdGhlIGV4YWN0IHJlc3VsdCB3b3VsZCBiZSBhc3N1bWVkIHRvIGJlIDIuNiwgd2hpY2ggcm91bmRlZCB1c2luZyBST1VORF9DRUlMIHRvIDEgZGVjaW1hbFxuICAgIC8vIHBsYWNlIGlzIHN0aWxsIDIuNi5cbiAgICBpZiAoY2hlY2tSb3VuZGluZ0RpZ2l0cyhyLmQsIGsgPSBwciwgcm0pKSB7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgc2QgKz0gMTA7XG4gICAgICAgIG51bSA9IG5hdHVyYWxMb2dhcml0aG0oYXJnLCBzZCk7XG4gICAgICAgIGRlbm9taW5hdG9yID0gaXNCYXNlMTAgPyBnZXRMbjEwKEN0b3IsIHNkICsgMTApIDogbmF0dXJhbExvZ2FyaXRobShiYXNlLCBzZCk7XG4gICAgICAgIHIgPSBkaXZpZGUobnVtLCBkZW5vbWluYXRvciwgc2QsIDEpO1xuXG4gICAgICAgIGlmICghaW5mKSB7XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3IgMTQgbmluZXMgZnJvbSB0aGUgMm5kIHJvdW5kaW5nIGRpZ2l0LCBhcyB0aGUgZmlyc3QgbWF5IGJlIDQuXG4gICAgICAgICAgaWYgKCtkaWdpdHNUb1N0cmluZyhyLmQpLnNsaWNlKGsgKyAxLCBrICsgMTUpICsgMSA9PSAxZTE0KSB7XG4gICAgICAgICAgICByID0gZmluYWxpc2UociwgcHIgKyAxLCAwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoY2hlY2tSb3VuZGluZ0RpZ2l0cyhyLmQsIGsgKz0gMTAsIHJtKSk7XG4gICAgfVxuXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xuXG4gICAgcmV0dXJuIGZpbmFsaXNlKHIsIHByLCBybSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbWF4aW11bSBvZiB0aGUgYXJndW1lbnRzIGFuZCB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxuICAgKlxuICAgKiBhcmd1bWVudHMge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICpcbiAgUC5tYXggPSBmdW5jdGlvbiAoKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guY2FsbChhcmd1bWVudHMsIHRoaXMpO1xuICAgIHJldHVybiBtYXhPck1pbih0aGlzLmNvbnN0cnVjdG9yLCBhcmd1bWVudHMsICdsdCcpO1xuICB9O1xuICAgKi9cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBtaW5pbXVtIG9mIHRoZSBhcmd1bWVudHMgYW5kIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwuXG4gICAqXG4gICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICBQLm1pbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5jYWxsKGFyZ3VtZW50cywgdGhpcyk7XG4gICAgcmV0dXJuIG1heE9yTWluKHRoaXMuY29uc3RydWN0b3IsIGFyZ3VtZW50cywgJ2d0Jyk7XG4gIH07XG4gICAqL1xuXG5cbiAgLypcbiAgICogIG4gLSAwID0gblxuICAgKiAgbiAtIE4gPSBOXG4gICAqICBuIC0gSSA9IC1JXG4gICAqICAwIC0gbiA9IC1uXG4gICAqICAwIC0gMCA9IDBcbiAgICogIDAgLSBOID0gTlxuICAgKiAgMCAtIEkgPSAtSVxuICAgKiAgTiAtIG4gPSBOXG4gICAqICBOIC0gMCA9IE5cbiAgICogIE4gLSBOID0gTlxuICAgKiAgTiAtIEkgPSBOXG4gICAqICBJIC0gbiA9IElcbiAgICogIEkgLSAwID0gSVxuICAgKiAgSSAtIE4gPSBOXG4gICAqICBJIC0gSSA9IE5cbiAgICpcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBtaW51cyBgeWAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICovXG4gIFAubWludXMgPSBQLnN1YiA9IGZ1bmN0aW9uICh5KSB7XG4gICAgdmFyIGQsIGUsIGksIGosIGssIGxlbiwgcHIsIHJtLCB4ZCwgeGUsIHhMVHksIHlkLFxuICAgICAgeCA9IHRoaXMsXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcblxuICAgIHkgPSBuZXcgQ3Rvcih5KTtcblxuICAgIC8vIElmIGVpdGhlciBpcyBub3QgZmluaXRlLi4uXG4gICAgaWYgKCF4LmQgfHwgIXkuZCkge1xuXG4gICAgICAvLyBSZXR1cm4gTmFOIGlmIGVpdGhlciBpcyBOYU4uXG4gICAgICBpZiAoIXgucyB8fCAheS5zKSB5ID0gbmV3IEN0b3IoTmFOKTtcblxuICAgICAgLy8gUmV0dXJuIHkgbmVnYXRlZCBpZiB4IGlzIGZpbml0ZSBhbmQgeSBpcyDCsUluZmluaXR5LlxuICAgICAgZWxzZSBpZiAoeC5kKSB5LnMgPSAteS5zO1xuXG4gICAgICAgIC8vIFJldHVybiB4IGlmIHkgaXMgZmluaXRlIGFuZCB4IGlzIMKxSW5maW5pdHkuXG4gICAgICAgIC8vIFJldHVybiB4IGlmIGJvdGggYXJlIMKxSW5maW5pdHkgd2l0aCBkaWZmZXJlbnQgc2lnbnMuXG4gICAgICAvLyBSZXR1cm4gTmFOIGlmIGJvdGggYXJlIMKxSW5maW5pdHkgd2l0aCB0aGUgc2FtZSBzaWduLlxuICAgICAgZWxzZSB5ID0gbmV3IEN0b3IoeS5kIHx8IHgucyAhPT0geS5zID8geCA6IE5hTik7XG5cbiAgICAgIHJldHVybiB5O1xuICAgIH1cblxuICAgIC8vIElmIHNpZ25zIGRpZmZlci4uLlxuICAgIGlmICh4LnMgIT0geS5zKSB7XG4gICAgICB5LnMgPSAteS5zO1xuICAgICAgcmV0dXJuIHgucGx1cyh5KTtcbiAgICB9XG5cbiAgICB4ZCA9IHguZDtcbiAgICB5ZCA9IHkuZDtcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcblxuICAgIC8vIElmIGVpdGhlciBpcyB6ZXJvLi4uXG4gICAgaWYgKCF4ZFswXSB8fCAheWRbMF0pIHtcblxuICAgICAgLy8gUmV0dXJuIHkgbmVnYXRlZCBpZiB4IGlzIHplcm8gYW5kIHkgaXMgbm9uLXplcm8uXG4gICAgICBpZiAoeWRbMF0pIHkucyA9IC15LnM7XG5cbiAgICAgIC8vIFJldHVybiB4IGlmIHkgaXMgemVybyBhbmQgeCBpcyBub24temVyby5cbiAgICAgIGVsc2UgaWYgKHhkWzBdKSB5ID0gbmV3IEN0b3IoeCk7XG5cbiAgICAgICAgLy8gUmV0dXJuIHplcm8gaWYgYm90aCBhcmUgemVyby5cbiAgICAgIC8vIEZyb20gSUVFRSA3NTQgKDIwMDgpIDYuMzogMCAtIDAgPSAtMCAtIC0wID0gLTAgd2hlbiByb3VuZGluZyB0byAtSW5maW5pdHkuXG4gICAgICBlbHNlIHJldHVybiBuZXcgQ3RvcihybSA9PT0gMyA/IC0wIDogMCk7XG5cbiAgICAgIHJldHVybiBleHRlcm5hbCA/IGZpbmFsaXNlKHksIHByLCBybSkgOiB5O1xuICAgIH1cblxuICAgIC8vIHggYW5kIHkgYXJlIGZpbml0ZSwgbm9uLXplcm8gbnVtYmVycyB3aXRoIHRoZSBzYW1lIHNpZ24uXG5cbiAgICAvLyBDYWxjdWxhdGUgYmFzZSAxZTcgZXhwb25lbnRzLlxuICAgIGUgPSBtYXRoZmxvb3IoeS5lIC8gTE9HX0JBU0UpO1xuICAgIHhlID0gbWF0aGZsb29yKHguZSAvIExPR19CQVNFKTtcblxuICAgIHhkID0geGQuc2xpY2UoKTtcbiAgICBrID0geGUgLSBlO1xuXG4gICAgLy8gSWYgYmFzZSAxZTcgZXhwb25lbnRzIGRpZmZlci4uLlxuICAgIGlmIChrKSB7XG4gICAgICB4TFR5ID0gayA8IDA7XG5cbiAgICAgIGlmICh4TFR5KSB7XG4gICAgICAgIGQgPSB4ZDtcbiAgICAgICAgayA9IC1rO1xuICAgICAgICBsZW4gPSB5ZC5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkID0geWQ7XG4gICAgICAgIGUgPSB4ZTtcbiAgICAgICAgbGVuID0geGQubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICAvLyBOdW1iZXJzIHdpdGggbWFzc2l2ZWx5IGRpZmZlcmVudCBleHBvbmVudHMgd291bGQgcmVzdWx0IGluIGEgdmVyeSBoaWdoIG51bWJlciBvZlxuICAgICAgLy8gemVyb3MgbmVlZGluZyB0byBiZSBwcmVwZW5kZWQsIGJ1dCB0aGlzIGNhbiBiZSBhdm9pZGVkIHdoaWxlIHN0aWxsIGVuc3VyaW5nIGNvcnJlY3RcbiAgICAgIC8vIHJvdW5kaW5nIGJ5IGxpbWl0aW5nIHRoZSBudW1iZXIgb2YgemVyb3MgdG8gYE1hdGguY2VpbChwciAvIExPR19CQVNFKSArIDJgLlxuICAgICAgaSA9IE1hdGgubWF4KE1hdGguY2VpbChwciAvIExPR19CQVNFKSwgbGVuKSArIDI7XG5cbiAgICAgIGlmIChrID4gaSkge1xuICAgICAgICBrID0gaTtcbiAgICAgICAgZC5sZW5ndGggPSAxO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cbiAgICAgIGQucmV2ZXJzZSgpO1xuICAgICAgZm9yIChpID0gazsgaS0tOykgZC5wdXNoKDApO1xuICAgICAgZC5yZXZlcnNlKCk7XG5cbiAgICAgIC8vIEJhc2UgMWU3IGV4cG9uZW50cyBlcXVhbC5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyBDaGVjayBkaWdpdHMgdG8gZGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxuXG4gICAgICBpID0geGQubGVuZ3RoO1xuICAgICAgbGVuID0geWQubGVuZ3RoO1xuICAgICAgeExUeSA9IGkgPCBsZW47XG4gICAgICBpZiAoeExUeSkgbGVuID0gaTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICh4ZFtpXSAhPSB5ZFtpXSkge1xuICAgICAgICAgIHhMVHkgPSB4ZFtpXSA8IHlkW2ldO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGsgPSAwO1xuICAgIH1cblxuICAgIGlmICh4TFR5KSB7XG4gICAgICBkID0geGQ7XG4gICAgICB4ZCA9IHlkO1xuICAgICAgeWQgPSBkO1xuICAgICAgeS5zID0gLXkucztcbiAgICB9XG5cbiAgICBsZW4gPSB4ZC5sZW5ndGg7XG5cbiAgICAvLyBBcHBlbmQgemVyb3MgdG8gYHhkYCBpZiBzaG9ydGVyLlxuICAgIC8vIERvbid0IGFkZCB6ZXJvcyB0byBgeWRgIGlmIHNob3J0ZXIgYXMgc3VidHJhY3Rpb24gb25seSBuZWVkcyB0byBzdGFydCBhdCBgeWRgIGxlbmd0aC5cbiAgICBmb3IgKGkgPSB5ZC5sZW5ndGggLSBsZW47IGkgPiAwOyAtLWkpIHhkW2xlbisrXSA9IDA7XG5cbiAgICAvLyBTdWJ0cmFjdCB5ZCBmcm9tIHhkLlxuICAgIGZvciAoaSA9IHlkLmxlbmd0aDsgaSA+IGs7KSB7XG5cbiAgICAgIGlmICh4ZFstLWldIDwgeWRbaV0pIHtcbiAgICAgICAgZm9yIChqID0gaTsgaiAmJiB4ZFstLWpdID09PSAwOykgeGRbal0gPSBCQVNFIC0gMTtcbiAgICAgICAgLS14ZFtqXTtcbiAgICAgICAgeGRbaV0gKz0gQkFTRTtcbiAgICAgIH1cblxuICAgICAgeGRbaV0gLT0geWRbaV07XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxuICAgIGZvciAoOyB4ZFstLWxlbl0gPT09IDA7KSB4ZC5wb3AoKTtcblxuICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXG4gICAgZm9yICg7IHhkWzBdID09PSAwOyB4ZC5zaGlmdCgpKSAtLWU7XG5cbiAgICAvLyBaZXJvP1xuICAgIGlmICgheGRbMF0pIHJldHVybiBuZXcgQ3RvcihybSA9PT0gMyA/IC0wIDogMCk7XG5cbiAgICB5LmQgPSB4ZDtcbiAgICB5LmUgPSBnZXRCYXNlMTBFeHBvbmVudCh4ZCwgZSk7XG5cbiAgICByZXR1cm4gZXh0ZXJuYWwgPyBmaW5hbGlzZSh5LCBwciwgcm0pIDogeTtcbiAgfTtcblxuXG4gIC8qXG4gICAqICAgbiAlIDAgPSAgTlxuICAgKiAgIG4gJSBOID0gIE5cbiAgICogICBuICUgSSA9ICBuXG4gICAqICAgMCAlIG4gPSAgMFxuICAgKiAgLTAgJSBuID0gLTBcbiAgICogICAwICUgMCA9ICBOXG4gICAqICAgMCAlIE4gPSAgTlxuICAgKiAgIDAgJSBJID0gIDBcbiAgICogICBOICUgbiA9ICBOXG4gICAqICAgTiAlIDAgPSAgTlxuICAgKiAgIE4gJSBOID0gIE5cbiAgICogICBOICUgSSA9ICBOXG4gICAqICAgSSAlIG4gPSAgTlxuICAgKiAgIEkgJSAwID0gIE5cbiAgICogICBJICUgTiA9ICBOXG4gICAqICAgSSAlIEkgPSAgTlxuICAgKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIG1vZHVsbyBgeWAsIHJvdW5kZWQgdG9cbiAgICogYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogVGhlIHJlc3VsdCBkZXBlbmRzIG9uIHRoZSBtb2R1bG8gbW9kZS5cbiAgICpcbiAgICovXG4gIFAubW9kdWxvID0gUC5tb2QgPSBmdW5jdGlvbiAoeSkge1xuICAgIHZhciBxLFxuICAgICAgeCA9IHRoaXMsXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcblxuICAgIHkgPSBuZXcgQ3Rvcih5KTtcblxuICAgIC8vIFJldHVybiBOYU4gaWYgeCBpcyDCsUluZmluaXR5IG9yIE5hTiwgb3IgeSBpcyBOYU4gb3IgwrEwLlxuICAgIGlmICgheC5kIHx8ICF5LnMgfHwgeS5kICYmICF5LmRbMF0pIHJldHVybiBuZXcgQ3RvcihOYU4pO1xuXG4gICAgLy8gUmV0dXJuIHggaWYgeSBpcyDCsUluZmluaXR5IG9yIHggaXMgwrEwLlxuICAgIGlmICgheS5kIHx8IHguZCAmJiAheC5kWzBdKSB7XG4gICAgICByZXR1cm4gZmluYWxpc2UobmV3IEN0b3IoeCksIEN0b3IucHJlY2lzaW9uLCBDdG9yLnJvdW5kaW5nKTtcbiAgICB9XG5cbiAgICAvLyBQcmV2ZW50IHJvdW5kaW5nIG9mIGludGVybWVkaWF0ZSBjYWxjdWxhdGlvbnMuXG4gICAgZXh0ZXJuYWwgPSBmYWxzZTtcblxuICAgIGlmIChDdG9yLm1vZHVsbyA9PSA5KSB7XG5cbiAgICAgIC8vIEV1Y2xpZGlhbiBkaXZpc2lvbjogcSA9IHNpZ24oeSkgKiBmbG9vcih4IC8gYWJzKHkpKVxuICAgICAgLy8gcmVzdWx0ID0geCAtIHEgKiB5ICAgIHdoZXJlICAwIDw9IHJlc3VsdCA8IGFicyh5KVxuICAgICAgcSA9IGRpdmlkZSh4LCB5LmFicygpLCAwLCAzLCAxKTtcbiAgICAgIHEucyAqPSB5LnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHEgPSBkaXZpZGUoeCwgeSwgMCwgQ3Rvci5tb2R1bG8sIDEpO1xuICAgIH1cblxuICAgIHEgPSBxLnRpbWVzKHkpO1xuXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHgubWludXMocSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbmF0dXJhbCBleHBvbmVudGlhbCBvZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLFxuICAgKiBpLmUuIHRoZSBiYXNlIGUgcmFpc2VkIHRvIHRoZSBwb3dlciB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqL1xuICBQLm5hdHVyYWxFeHBvbmVudGlhbCA9IFAuZXhwID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuYXR1cmFsRXhwb25lbnRpYWwodGhpcyk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbmF0dXJhbCBsb2dhcml0aG0gb2YgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCxcbiAgICogcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKi9cbiAgUC5uYXR1cmFsTG9nYXJpdGhtID0gUC5sbiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmF0dXJhbExvZ2FyaXRobSh0aGlzKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgbmVnYXRlZCwgaS5lLiBhcyBpZiBtdWx0aXBsaWVkIGJ5XG4gICAqIC0xLlxuICAgKlxuICAgKi9cbiAgUC5uZWdhdGVkID0gUC5uZWcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHggPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcbiAgICB4LnMgPSAteC5zO1xuICAgIHJldHVybiBmaW5hbGlzZSh4KTtcbiAgfTtcblxuXG4gIC8qXG4gICAqICBuICsgMCA9IG5cbiAgICogIG4gKyBOID0gTlxuICAgKiAgbiArIEkgPSBJXG4gICAqICAwICsgbiA9IG5cbiAgICogIDAgKyAwID0gMFxuICAgKiAgMCArIE4gPSBOXG4gICAqICAwICsgSSA9IElcbiAgICogIE4gKyBuID0gTlxuICAgKiAgTiArIDAgPSBOXG4gICAqICBOICsgTiA9IE5cbiAgICogIE4gKyBJID0gTlxuICAgKiAgSSArIG4gPSBJXG4gICAqICBJICsgMCA9IElcbiAgICogIEkgKyBOID0gTlxuICAgKiAgSSArIEkgPSBJXG4gICAqXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgcGx1cyBgeWAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICovXG4gIFAucGx1cyA9IFAuYWRkID0gZnVuY3Rpb24gKHkpIHtcbiAgICB2YXIgY2FycnksIGQsIGUsIGksIGssIGxlbiwgcHIsIHJtLCB4ZCwgeWQsXG4gICAgICB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuXG4gICAgeSA9IG5ldyBDdG9yKHkpO1xuXG4gICAgLy8gSWYgZWl0aGVyIGlzIG5vdCBmaW5pdGUuLi5cbiAgICBpZiAoIXguZCB8fCAheS5kKSB7XG5cbiAgICAgIC8vIFJldHVybiBOYU4gaWYgZWl0aGVyIGlzIE5hTi5cbiAgICAgIGlmICgheC5zIHx8ICF5LnMpIHkgPSBuZXcgQ3RvcihOYU4pO1xuXG4gICAgICAgIC8vIFJldHVybiB4IGlmIHkgaXMgZmluaXRlIGFuZCB4IGlzIMKxSW5maW5pdHkuXG4gICAgICAgIC8vIFJldHVybiB4IGlmIGJvdGggYXJlIMKxSW5maW5pdHkgd2l0aCB0aGUgc2FtZSBzaWduLlxuICAgICAgICAvLyBSZXR1cm4gTmFOIGlmIGJvdGggYXJlIMKxSW5maW5pdHkgd2l0aCBkaWZmZXJlbnQgc2lnbnMuXG4gICAgICAvLyBSZXR1cm4geSBpZiB4IGlzIGZpbml0ZSBhbmQgeSBpcyDCsUluZmluaXR5LlxuICAgICAgZWxzZSBpZiAoIXguZCkgeSA9IG5ldyBDdG9yKHkuZCB8fCB4LnMgPT09IHkucyA/IHggOiBOYU4pO1xuXG4gICAgICByZXR1cm4geTtcbiAgICB9XG5cbiAgICAvLyBJZiBzaWducyBkaWZmZXIuLi5cbiAgICBpZiAoeC5zICE9IHkucykge1xuICAgICAgeS5zID0gLXkucztcbiAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xuICAgIH1cblxuICAgIHhkID0geC5kO1xuICAgIHlkID0geS5kO1xuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xuXG4gICAgLy8gSWYgZWl0aGVyIGlzIHplcm8uLi5cbiAgICBpZiAoIXhkWzBdIHx8ICF5ZFswXSkge1xuXG4gICAgICAvLyBSZXR1cm4geCBpZiB5IGlzIHplcm8uXG4gICAgICAvLyBSZXR1cm4geSBpZiB5IGlzIG5vbi16ZXJvLlxuICAgICAgaWYgKCF5ZFswXSkgeSA9IG5ldyBDdG9yKHgpO1xuXG4gICAgICByZXR1cm4gZXh0ZXJuYWwgPyBmaW5hbGlzZSh5LCBwciwgcm0pIDogeTtcbiAgICB9XG5cbiAgICAvLyB4IGFuZCB5IGFyZSBmaW5pdGUsIG5vbi16ZXJvIG51bWJlcnMgd2l0aCB0aGUgc2FtZSBzaWduLlxuXG4gICAgLy8gQ2FsY3VsYXRlIGJhc2UgMWU3IGV4cG9uZW50cy5cbiAgICBrID0gbWF0aGZsb29yKHguZSAvIExPR19CQVNFKTtcbiAgICBlID0gbWF0aGZsb29yKHkuZSAvIExPR19CQVNFKTtcblxuICAgIHhkID0geGQuc2xpY2UoKTtcbiAgICBpID0gayAtIGU7XG5cbiAgICAvLyBJZiBiYXNlIDFlNyBleHBvbmVudHMgZGlmZmVyLi4uXG4gICAgaWYgKGkpIHtcblxuICAgICAgaWYgKGkgPCAwKSB7XG4gICAgICAgIGQgPSB4ZDtcbiAgICAgICAgaSA9IC1pO1xuICAgICAgICBsZW4gPSB5ZC5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkID0geWQ7XG4gICAgICAgIGUgPSBrO1xuICAgICAgICBsZW4gPSB4ZC5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIC8vIExpbWl0IG51bWJlciBvZiB6ZXJvcyBwcmVwZW5kZWQgdG8gbWF4KGNlaWwocHIgLyBMT0dfQkFTRSksIGxlbikgKyAxLlxuICAgICAgayA9IE1hdGguY2VpbChwciAvIExPR19CQVNFKTtcbiAgICAgIGxlbiA9IGsgPiBsZW4gPyBrICsgMSA6IGxlbiArIDE7XG5cbiAgICAgIGlmIChpID4gbGVuKSB7XG4gICAgICAgIGkgPSBsZW47XG4gICAgICAgIGQubGVuZ3RoID0gMTtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuIE5vdGU6IEZhc3RlciB0byB1c2UgcmV2ZXJzZSB0aGVuIGRvIHVuc2hpZnRzLlxuICAgICAgZC5yZXZlcnNlKCk7XG4gICAgICBmb3IgKDsgaS0tOykgZC5wdXNoKDApO1xuICAgICAgZC5yZXZlcnNlKCk7XG4gICAgfVxuXG4gICAgbGVuID0geGQubGVuZ3RoO1xuICAgIGkgPSB5ZC5sZW5ndGg7XG5cbiAgICAvLyBJZiB5ZCBpcyBsb25nZXIgdGhhbiB4ZCwgc3dhcCB4ZCBhbmQgeWQgc28geGQgcG9pbnRzIHRvIHRoZSBsb25nZXIgYXJyYXkuXG4gICAgaWYgKGxlbiAtIGkgPCAwKSB7XG4gICAgICBpID0gbGVuO1xuICAgICAgZCA9IHlkO1xuICAgICAgeWQgPSB4ZDtcbiAgICAgIHhkID0gZDtcbiAgICB9XG5cbiAgICAvLyBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5ZC5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4ZCBjYW4gYmUgbGVmdCBhcyB0aGV5IGFyZS5cbiAgICBmb3IgKGNhcnJ5ID0gMDsgaTspIHtcbiAgICAgIGNhcnJ5ID0gKHhkWy0taV0gPSB4ZFtpXSArIHlkW2ldICsgY2FycnkpIC8gQkFTRSB8IDA7XG4gICAgICB4ZFtpXSAlPSBCQVNFO1xuICAgIH1cblxuICAgIGlmIChjYXJyeSkge1xuICAgICAgeGQudW5zaGlmdChjYXJyeSk7XG4gICAgICArK2U7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxuICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcbiAgICBmb3IgKGxlbiA9IHhkLmxlbmd0aDsgeGRbLS1sZW5dID09IDA7KSB4ZC5wb3AoKTtcblxuICAgIHkuZCA9IHhkO1xuICAgIHkuZSA9IGdldEJhc2UxMEV4cG9uZW50KHhkLCBlKTtcblxuICAgIHJldHVybiBleHRlcm5hbCA/IGZpbmFsaXNlKHksIHByLCBybSkgOiB5O1xuICB9O1xuXG5cbiAgLypcbiAgICogUmV0dXJuIHRoZSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZGlnaXRzIG9mIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwuXG4gICAqXG4gICAqIFt6XSB7Ym9vbGVhbnxudW1iZXJ9IFdoZXRoZXIgdG8gY291bnQgaW50ZWdlci1wYXJ0IHRyYWlsaW5nIHplcm9zOiB0cnVlLCBmYWxzZSwgMSBvciAwLlxuICAgKlxuICAgKi9cbiAgUC5wcmVjaXNpb24gPSBQLnNkID0gZnVuY3Rpb24gKHopIHtcbiAgICB2YXIgayxcbiAgICAgIHggPSB0aGlzO1xuXG4gICAgaWYgKHogIT09IHZvaWQgMCAmJiB6ICE9PSAhIXogJiYgeiAhPT0gMSAmJiB6ICE9PSAwKSB0aHJvdyBFcnJvcihpbnZhbGlkQXJndW1lbnQgKyB6KTtcblxuICAgIGlmICh4LmQpIHtcbiAgICAgIGsgPSBnZXRQcmVjaXNpb24oeC5kKTtcbiAgICAgIGlmICh6ICYmIHguZSArIDEgPiBrKSBrID0geC5lICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgayA9IE5hTjtcbiAgICB9XG5cbiAgICByZXR1cm4gaztcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgcm91bmRlZCB0byBhIHdob2xlIG51bWJlciB1c2luZ1xuICAgKiByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqL1xuICBQLnJvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuXG4gICAgcmV0dXJuIGZpbmFsaXNlKG5ldyBDdG9yKHgpLCB4LmUgKyAxLCBDdG9yLnJvdW5kaW5nKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzaW5lIG9mIHRoZSB2YWx1ZSBpbiByYWRpYW5zIG9mIHRoaXMgRGVjaW1hbC5cbiAgICpcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cbiAgICogUmFuZ2U6IFstMSwgMV1cbiAgICpcbiAgICogc2luKHgpID0geCAtIHheMy8zISArIHheNS81ISAtIC4uLlxuICAgKlxuICAgKiBzaW4oMCkgICAgICAgICA9IDBcbiAgICogc2luKC0wKSAgICAgICAgPSAtMFxuICAgKiBzaW4oSW5maW5pdHkpICA9IE5hTlxuICAgKiBzaW4oLUluZmluaXR5KSA9IE5hTlxuICAgKiBzaW4oTmFOKSAgICAgICA9IE5hTlxuICAgKlxuICAgKi9cbiAgUC5zaW5lID0gUC5zaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHByLCBybSxcbiAgICAgIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XG5cbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XG4gICAgaWYgKHguaXNaZXJvKCkpIHJldHVybiBuZXcgQ3Rvcih4KTtcblxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyBNYXRoLm1heCh4LmUsIHguc2QoKSkgKyBMT0dfQkFTRTtcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcblxuICAgIHggPSBzaW5lKEN0b3IsIHRvTGVzc1RoYW5IYWxmUGkoQ3RvciwgeCkpO1xuXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XG5cbiAgICByZXR1cm4gZmluYWxpc2UocXVhZHJhbnQgPiAyID8geC5uZWcoKSA6IHgsIHByLCBybSwgdHJ1ZSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhpcyBEZWNpbWFsLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqICBzcXJ0KC1uKSA9ICBOXG4gICAqICBzcXJ0KE4pICA9ICBOXG4gICAqICBzcXJ0KC1JKSA9ICBOXG4gICAqICBzcXJ0KEkpICA9ICBJXG4gICAqICBzcXJ0KDApICA9ICAwXG4gICAqICBzcXJ0KC0wKSA9IC0wXG4gICAqXG4gICAqL1xuICBQLnNxdWFyZVJvb3QgPSBQLnNxcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG0sIG4sIHNkLCByLCByZXAsIHQsXG4gICAgICB4ID0gdGhpcyxcbiAgICAgIGQgPSB4LmQsXG4gICAgICBlID0geC5lLFxuICAgICAgcyA9IHgucyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuXG4gICAgLy8gTmVnYXRpdmUvTmFOL0luZmluaXR5L3plcm8/XG4gICAgaWYgKHMgIT09IDEgfHwgIWQgfHwgIWRbMF0pIHtcbiAgICAgIHJldHVybiBuZXcgQ3RvcighcyB8fCBzIDwgMCAmJiAoIWQgfHwgZFswXSkgPyBOYU4gOiBkID8geCA6IDEgLyAwKTtcbiAgICB9XG5cbiAgICBleHRlcm5hbCA9IGZhbHNlO1xuXG4gICAgLy8gSW5pdGlhbCBlc3RpbWF0ZS5cbiAgICBzID0gTWF0aC5zcXJ0KCt4KTtcblxuICAgIC8vIE1hdGguc3FydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XG4gICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgZXhwb25lbnQgb2YgdGhlIHJlc3VsdC5cbiAgICBpZiAocyA9PSAwIHx8IHMgPT0gMSAvIDApIHtcbiAgICAgIG4gPSBkaWdpdHNUb1N0cmluZyhkKTtcblxuICAgICAgaWYgKChuLmxlbmd0aCArIGUpICUgMiA9PSAwKSBuICs9ICcwJztcbiAgICAgIHMgPSBNYXRoLnNxcnQobik7XG4gICAgICBlID0gbWF0aGZsb29yKChlICsgMSkgLyAyKSAtIChlIDwgMCB8fCBlICUgMik7XG5cbiAgICAgIGlmIChzID09IDEgLyAwKSB7XG4gICAgICAgIG4gPSAnNWUnICsgZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG4gPSBzLnRvRXhwb25lbnRpYWwoKTtcbiAgICAgICAgbiA9IG4uc2xpY2UoMCwgbi5pbmRleE9mKCdlJykgKyAxKSArIGU7XG4gICAgICB9XG5cbiAgICAgIHIgPSBuZXcgQ3RvcihuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgciA9IG5ldyBDdG9yKHMudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgc2QgPSAoZSA9IEN0b3IucHJlY2lzaW9uKSArIDM7XG5cbiAgICAvLyBOZXd0b24tUmFwaHNvbiBpdGVyYXRpb24uXG4gICAgZm9yICg7Oykge1xuICAgICAgdCA9IHI7XG4gICAgICByID0gdC5wbHVzKGRpdmlkZSh4LCB0LCBzZCArIDIsIDEpKS50aW1lcygwLjUpO1xuXG4gICAgICAvLyBUT0RPPyBSZXBsYWNlIHdpdGggZm9yLWxvb3AgYW5kIGNoZWNrUm91bmRpbmdEaWdpdHMuXG4gICAgICBpZiAoZGlnaXRzVG9TdHJpbmcodC5kKS5zbGljZSgwLCBzZCkgPT09IChuID0gZGlnaXRzVG9TdHJpbmcoci5kKSkuc2xpY2UoMCwgc2QpKSB7XG4gICAgICAgIG4gPSBuLnNsaWNlKHNkIC0gMywgc2QgKyAxKTtcblxuICAgICAgICAvLyBUaGUgNHRoIHJvdW5kaW5nIGRpZ2l0IG1heSBiZSBpbiBlcnJvciBieSAtMSBzbyBpZiB0aGUgNCByb3VuZGluZyBkaWdpdHMgYXJlIDk5OTkgb3JcbiAgICAgICAgLy8gNDk5OSwgaS5lLiBhcHByb2FjaGluZyBhIHJvdW5kaW5nIGJvdW5kYXJ5LCBjb250aW51ZSB0aGUgaXRlcmF0aW9uLlxuICAgICAgICBpZiAobiA9PSAnOTk5OScgfHwgIXJlcCAmJiBuID09ICc0OTk5Jykge1xuXG4gICAgICAgICAgLy8gT24gdGhlIGZpcnN0IGl0ZXJhdGlvbiBvbmx5LCBjaGVjayB0byBzZWUgaWYgcm91bmRpbmcgdXAgZ2l2ZXMgdGhlIGV4YWN0IHJlc3VsdCBhcyB0aGVcbiAgICAgICAgICAvLyBuaW5lcyBtYXkgaW5maW5pdGVseSByZXBlYXQuXG4gICAgICAgICAgaWYgKCFyZXApIHtcbiAgICAgICAgICAgIGZpbmFsaXNlKHQsIGUgKyAxLCAwKTtcblxuICAgICAgICAgICAgaWYgKHQudGltZXModCkuZXEoeCkpIHtcbiAgICAgICAgICAgICAgciA9IHQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHNkICs9IDQ7XG4gICAgICAgICAgcmVwID0gMTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIC8vIElmIHRoZSByb3VuZGluZyBkaWdpdHMgYXJlIG51bGwsIDB7MCw0fSBvciA1MHswLDN9LCBjaGVjayBmb3IgYW4gZXhhY3QgcmVzdWx0LlxuICAgICAgICAgIC8vIElmIG5vdCwgdGhlbiB0aGVyZSBhcmUgZnVydGhlciBkaWdpdHMgYW5kIG0gd2lsbCBiZSB0cnV0aHkuXG4gICAgICAgICAgaWYgKCErbiB8fCAhK24uc2xpY2UoMSkgJiYgbi5jaGFyQXQoMCkgPT0gJzUnKSB7XG5cbiAgICAgICAgICAgIC8vIFRydW5jYXRlIHRvIHRoZSBmaXJzdCByb3VuZGluZyBkaWdpdC5cbiAgICAgICAgICAgIGZpbmFsaXNlKHIsIGUgKyAxLCAxKTtcbiAgICAgICAgICAgIG0gPSAhci50aW1lcyhyKS5lcSh4KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGV4dGVybmFsID0gdHJ1ZTtcblxuICAgIHJldHVybiBmaW5hbGlzZShyLCBlLCBDdG9yLnJvdW5kaW5nLCBtKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB0YW5nZW50IG9mIHRoZSB2YWx1ZSBpbiByYWRpYW5zIG9mIHRoaXMgRGVjaW1hbC5cbiAgICpcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cbiAgICogUmFuZ2U6IFstSW5maW5pdHksIEluZmluaXR5XVxuICAgKlxuICAgKiB0YW4oMCkgICAgICAgICA9IDBcbiAgICogdGFuKC0wKSAgICAgICAgPSAtMFxuICAgKiB0YW4oSW5maW5pdHkpICA9IE5hTlxuICAgKiB0YW4oLUluZmluaXR5KSA9IE5hTlxuICAgKiB0YW4oTmFOKSAgICAgICA9IE5hTlxuICAgKlxuICAgKi9cbiAgUC50YW5nZW50ID0gUC50YW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHByLCBybSxcbiAgICAgIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XG5cbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XG4gICAgaWYgKHguaXNaZXJvKCkpIHJldHVybiBuZXcgQ3Rvcih4KTtcblxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyAxMDtcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcblxuICAgIHggPSB4LnNpbigpO1xuICAgIHgucyA9IDE7XG4gICAgeCA9IGRpdmlkZSh4LCBuZXcgQ3RvcigxKS5taW51cyh4LnRpbWVzKHgpKS5zcXJ0KCksIHByICsgMTAsIDApO1xuXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XG5cbiAgICByZXR1cm4gZmluYWxpc2UocXVhZHJhbnQgPT0gMiB8fCBxdWFkcmFudCA9PSA0ID8geC5uZWcoKSA6IHgsIHByLCBybSwgdHJ1ZSk7XG4gIH07XG5cblxuICAvKlxuICAgKiAgbiAqIDAgPSAwXG4gICAqICBuICogTiA9IE5cbiAgICogIG4gKiBJID0gSVxuICAgKiAgMCAqIG4gPSAwXG4gICAqICAwICogMCA9IDBcbiAgICogIDAgKiBOID0gTlxuICAgKiAgMCAqIEkgPSBOXG4gICAqICBOICogbiA9IE5cbiAgICogIE4gKiAwID0gTlxuICAgKiAgTiAqIE4gPSBOXG4gICAqICBOICogSSA9IE5cbiAgICogIEkgKiBuID0gSVxuICAgKiAgSSAqIDAgPSBOXG4gICAqICBJICogTiA9IE5cbiAgICogIEkgKiBJID0gSVxuICAgKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGlzIERlY2ltYWwgdGltZXMgYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50XG4gICAqIGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqL1xuICBQLnRpbWVzID0gUC5tdWwgPSBmdW5jdGlvbiAoeSkge1xuICAgIHZhciBjYXJyeSwgZSwgaSwgaywgciwgckwsIHQsIHhkTCwgeWRMLFxuICAgICAgeCA9IHRoaXMsXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcbiAgICAgIHhkID0geC5kLFxuICAgICAgeWQgPSAoeSA9IG5ldyBDdG9yKHkpKS5kO1xuXG4gICAgeS5zICo9IHgucztcblxuICAgIC8vIElmIGVpdGhlciBpcyBOYU4sIMKxSW5maW5pdHkgb3IgwrEwLi4uXG4gICAgaWYgKCF4ZCB8fCAheGRbMF0gfHwgIXlkIHx8ICF5ZFswXSkge1xuXG4gICAgICByZXR1cm4gbmV3IEN0b3IoIXkucyB8fCB4ZCAmJiAheGRbMF0gJiYgIXlkIHx8IHlkICYmICF5ZFswXSAmJiAheGRcblxuICAgICAgICAvLyBSZXR1cm4gTmFOIGlmIGVpdGhlciBpcyBOYU4uXG4gICAgICAgIC8vIFJldHVybiBOYU4gaWYgeCBpcyDCsTAgYW5kIHkgaXMgwrFJbmZpbml0eSwgb3IgeSBpcyDCsTAgYW5kIHggaXMgwrFJbmZpbml0eS5cbiAgICAgICAgICAgICAgICAgICAgICA/IE5hTlxuXG4gICAgICAgIC8vIFJldHVybiDCsUluZmluaXR5IGlmIGVpdGhlciBpcyDCsUluZmluaXR5LlxuICAgICAgICAvLyBSZXR1cm4gwrEwIGlmIGVpdGhlciBpcyDCsTAuXG4gICAgICAgICAgICAgICAgICAgICAgOiAheGQgfHwgIXlkID8geS5zIC8gMCA6IHkucyAqIDApO1xuICAgIH1cblxuICAgIGUgPSBtYXRoZmxvb3IoeC5lIC8gTE9HX0JBU0UpICsgbWF0aGZsb29yKHkuZSAvIExPR19CQVNFKTtcbiAgICB4ZEwgPSB4ZC5sZW5ndGg7XG4gICAgeWRMID0geWQubGVuZ3RoO1xuXG4gICAgLy8gRW5zdXJlIHhkIHBvaW50cyB0byB0aGUgbG9uZ2VyIGFycmF5LlxuICAgIGlmICh4ZEwgPCB5ZEwpIHtcbiAgICAgIHIgPSB4ZDtcbiAgICAgIHhkID0geWQ7XG4gICAgICB5ZCA9IHI7XG4gICAgICByTCA9IHhkTDtcbiAgICAgIHhkTCA9IHlkTDtcbiAgICAgIHlkTCA9IHJMO1xuICAgIH1cblxuICAgIC8vIEluaXRpYWxpc2UgdGhlIHJlc3VsdCBhcnJheSB3aXRoIHplcm9zLlxuICAgIHIgPSBbXTtcbiAgICByTCA9IHhkTCArIHlkTDtcbiAgICBmb3IgKGkgPSByTDsgaS0tOykgci5wdXNoKDApO1xuXG4gICAgLy8gTXVsdGlwbHkhXG4gICAgZm9yIChpID0geWRMOyAtLWkgPj0gMDspIHtcbiAgICAgIGNhcnJ5ID0gMDtcbiAgICAgIGZvciAoayA9IHhkTCArIGk7IGsgPiBpOykge1xuICAgICAgICB0ID0gcltrXSArIHlkW2ldICogeGRbayAtIGkgLSAxXSArIGNhcnJ5O1xuICAgICAgICByW2stLV0gPSB0ICUgQkFTRSB8IDA7XG4gICAgICAgIGNhcnJ5ID0gdCAvIEJBU0UgfCAwO1xuICAgICAgfVxuXG4gICAgICByW2tdID0gKHJba10gKyBjYXJyeSkgJSBCQVNFIHwgMDtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXG4gICAgZm9yICg7ICFyWy0tckxdOykgci5wb3AoKTtcblxuICAgIGlmIChjYXJyeSkgKytlO1xuICAgIGVsc2Ugci5zaGlmdCgpO1xuXG4gICAgeS5kID0gcjtcbiAgICB5LmUgPSBnZXRCYXNlMTBFeHBvbmVudChyLCBlKTtcblxuICAgIHJldHVybiBleHRlcm5hbCA/IGZpbmFsaXNlKHksIEN0b3IucHJlY2lzaW9uLCBDdG9yLnJvdW5kaW5nKSA6IHk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaW4gYmFzZSAyLCByb3VuZCB0byBgc2RgIHNpZ25pZmljYW50XG4gICAqIGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGBybWAuXG4gICAqXG4gICAqIElmIHRoZSBvcHRpb25hbCBgc2RgIGFyZ3VtZW50IGlzIHByZXNlbnQgdGhlbiByZXR1cm4gYmluYXJ5IGV4cG9uZW50aWFsIG5vdGF0aW9uLlxuICAgKlxuICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxuICAgKlxuICAgKi9cbiAgUC50b0JpbmFyeSA9IGZ1bmN0aW9uIChzZCwgcm0pIHtcbiAgICByZXR1cm4gdG9TdHJpbmdCaW5hcnkodGhpcywgMiwgc2QsIHJtKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgcm91bmRlZCB0byBhIG1heGltdW0gb2YgYGRwYFxuICAgKiBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIGBybWAgb3IgYHJvdW5kaW5nYCBpZiBgcm1gIGlzIG9taXR0ZWQuXG4gICAqXG4gICAqIElmIGBkcGAgaXMgb21pdHRlZCwgcmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cbiAgICpcbiAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxuICAgKlxuICAgKi9cbiAgUC50b0RlY2ltYWxQbGFjZXMgPSBQLnRvRFAgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XG4gICAgdmFyIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XG5cbiAgICB4ID0gbmV3IEN0b3IoeCk7XG4gICAgaWYgKGRwID09PSB2b2lkIDApIHJldHVybiB4O1xuXG4gICAgY2hlY2tJbnQzMihkcCwgMCwgTUFYX0RJR0lUUyk7XG5cbiAgICBpZiAocm0gPT09IHZvaWQgMCkgcm0gPSBDdG9yLnJvdW5kaW5nO1xuICAgIGVsc2UgY2hlY2tJbnQzMihybSwgMCwgOCk7XG5cbiAgICByZXR1cm4gZmluYWxpc2UoeCwgZHAgKyB4LmUgKyAxLCBybSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaW4gZXhwb25lbnRpYWwgbm90YXRpb24gcm91bmRlZCB0b1xuICAgKiBgZHBgIGZpeGVkIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxuICAgKlxuICAgKi9cbiAgUC50b0V4cG9uZW50aWFsID0gZnVuY3Rpb24gKGRwLCBybSkge1xuICAgIHZhciBzdHIsXG4gICAgICB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuXG4gICAgaWYgKGRwID09PSB2b2lkIDApIHtcbiAgICAgIHN0ciA9IGZpbml0ZVRvU3RyaW5nKHgsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGVja0ludDMyKGRwLCAwLCBNQVhfRElHSVRTKTtcblxuICAgICAgaWYgKHJtID09PSB2b2lkIDApIHJtID0gQ3Rvci5yb3VuZGluZztcbiAgICAgIGVsc2UgY2hlY2tJbnQzMihybSwgMCwgOCk7XG5cbiAgICAgIHggPSBmaW5hbGlzZShuZXcgQ3Rvcih4KSwgZHAgKyAxLCBybSk7XG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4LCB0cnVlLCBkcCArIDEpO1xuICAgIH1cblxuICAgIHJldHVybiB4LmlzTmVnKCkgJiYgIXguaXNaZXJvKCkgPyAnLScgKyBzdHIgOiBzdHI7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaW4gbm9ybWFsIChmaXhlZC1wb2ludCkgbm90YXRpb24gdG9cbiAgICogYGRwYCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCB1c2luZyByb3VuZGluZyBtb2RlIGBybWAgb3IgYHJvdW5kaW5nYCBpZiBgcm1gIGlzXG4gICAqIG9taXR0ZWQuXG4gICAqXG4gICAqIEFzIHdpdGggSmF2YVNjcmlwdCBudW1iZXJzLCAoLTApLnRvRml4ZWQoMCkgaXMgJzAnLCBidXQgZS5nLiAoLTAuMDAwMDEpLnRvRml4ZWQoMCkgaXMgJy0wJy5cbiAgICpcbiAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxuICAgKlxuICAgKiAoLTApLnRvRml4ZWQoMCkgaXMgJzAnLCBidXQgKC0wLjEpLnRvRml4ZWQoMCkgaXMgJy0wJy5cbiAgICogKC0wKS50b0ZpeGVkKDEpIGlzICcwLjAnLCBidXQgKC0wLjAxKS50b0ZpeGVkKDEpIGlzICctMC4wJy5cbiAgICogKC0wKS50b0ZpeGVkKDMpIGlzICcwLjAwMCcuXG4gICAqICgtMC41KS50b0ZpeGVkKDApIGlzICctMCcuXG4gICAqXG4gICAqL1xuICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XG4gICAgdmFyIHN0ciwgeSxcbiAgICAgIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XG5cbiAgICBpZiAoZHAgPT09IHZvaWQgMCkge1xuICAgICAgc3RyID0gZmluaXRlVG9TdHJpbmcoeCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoZWNrSW50MzIoZHAsIDAsIE1BWF9ESUdJVFMpO1xuXG4gICAgICBpZiAocm0gPT09IHZvaWQgMCkgcm0gPSBDdG9yLnJvdW5kaW5nO1xuICAgICAgZWxzZSBjaGVja0ludDMyKHJtLCAwLCA4KTtcblxuICAgICAgeSA9IGZpbmFsaXNlKG5ldyBDdG9yKHgpLCBkcCArIHguZSArIDEsIHJtKTtcbiAgICAgIHN0ciA9IGZpbml0ZVRvU3RyaW5nKHksIGZhbHNlLCBkcCArIHkuZSArIDEpO1xuICAgIH1cblxuICAgIC8vIFRvIGRldGVybWluZSB3aGV0aGVyIHRvIGFkZCB0aGUgbWludXMgc2lnbiBsb29rIGF0IHRoZSB2YWx1ZSBiZWZvcmUgaXQgd2FzIHJvdW5kZWQsXG4gICAgLy8gaS5lLiBsb29rIGF0IGB4YCByYXRoZXIgdGhhbiBgeWAuXG4gICAgcmV0dXJuIHguaXNOZWcoKSAmJiAheC5pc1plcm8oKSA/ICctJyArIHN0ciA6IHN0cjtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhbiBhcnJheSByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBhcyBhIHNpbXBsZSBmcmFjdGlvbiB3aXRoIGFuIGludGVnZXJcbiAgICogbnVtZXJhdG9yIGFuZCBhbiBpbnRlZ2VyIGRlbm9taW5hdG9yLlxuICAgKlxuICAgKiBUaGUgZGVub21pbmF0b3Igd2lsbCBiZSBhIHBvc2l0aXZlIG5vbi16ZXJvIHZhbHVlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgc3BlY2lmaWVkIG1heGltdW1cbiAgICogZGVub21pbmF0b3IuIElmIGEgbWF4aW11bSBkZW5vbWluYXRvciBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZGVub21pbmF0b3Igd2lsbCBiZSB0aGUgbG93ZXN0XG4gICAqIHZhbHVlIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIG51bWJlciBleGFjdGx5LlxuICAgKlxuICAgKiBbbWF4RF0ge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gTWF4aW11bSBkZW5vbWluYXRvci4gSW50ZWdlciA+PSAxIGFuZCA8IEluZmluaXR5LlxuICAgKlxuICAgKi9cbiAgUC50b0ZyYWN0aW9uID0gZnVuY3Rpb24gKG1heEQpIHtcbiAgICB2YXIgZCwgZDAsIGQxLCBkMiwgZSwgaywgbiwgbjAsIG4xLCBwciwgcSwgcixcbiAgICAgIHggPSB0aGlzLFxuICAgICAgeGQgPSB4LmQsXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcblxuICAgIGlmICgheGQpIHJldHVybiBuZXcgQ3Rvcih4KTtcblxuICAgIG4xID0gZDAgPSBuZXcgQ3RvcigxKTtcbiAgICBkMSA9IG4wID0gbmV3IEN0b3IoMCk7XG5cbiAgICBkID0gbmV3IEN0b3IoZDEpO1xuICAgIGUgPSBkLmUgPSBnZXRQcmVjaXNpb24oeGQpIC0geC5lIC0gMTtcbiAgICBrID0gZSAlIExPR19CQVNFO1xuICAgIGQuZFswXSA9IG1hdGhwb3coMTAsIGsgPCAwID8gTE9HX0JBU0UgKyBrIDogayk7XG5cbiAgICBpZiAobWF4RCA9PSBudWxsKSB7XG5cbiAgICAgIC8vIGQgaXMgMTAqKmUsIHRoZSBtaW5pbXVtIG1heC1kZW5vbWluYXRvciBuZWVkZWQuXG4gICAgICBtYXhEID0gZSA+IDAgPyBkIDogbjE7XG4gICAgfSBlbHNlIHtcbiAgICAgIG4gPSBuZXcgQ3RvcihtYXhEKTtcbiAgICAgIGlmICghbi5pc0ludCgpIHx8IG4ubHQobjEpKSB0aHJvdyBFcnJvcihpbnZhbGlkQXJndW1lbnQgKyBuKTtcbiAgICAgIG1heEQgPSBuLmd0KGQpID8gKGUgPiAwID8gZCA6IG4xKSA6IG47XG4gICAgfVxuXG4gICAgZXh0ZXJuYWwgPSBmYWxzZTtcbiAgICBuID0gbmV3IEN0b3IoZGlnaXRzVG9TdHJpbmcoeGQpKTtcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xuICAgIEN0b3IucHJlY2lzaW9uID0gZSA9IHhkLmxlbmd0aCAqIExPR19CQVNFICogMjtcblxuICAgIGZvciAoOzspICB7XG4gICAgICBxID0gZGl2aWRlKG4sIGQsIDAsIDEsIDEpO1xuICAgICAgZDIgPSBkMC5wbHVzKHEudGltZXMoZDEpKTtcbiAgICAgIGlmIChkMi5jbXAobWF4RCkgPT0gMSkgYnJlYWs7XG4gICAgICBkMCA9IGQxO1xuICAgICAgZDEgPSBkMjtcbiAgICAgIGQyID0gbjE7XG4gICAgICBuMSA9IG4wLnBsdXMocS50aW1lcyhkMikpO1xuICAgICAgbjAgPSBkMjtcbiAgICAgIGQyID0gZDtcbiAgICAgIGQgPSBuLm1pbnVzKHEudGltZXMoZDIpKTtcbiAgICAgIG4gPSBkMjtcbiAgICB9XG5cbiAgICBkMiA9IGRpdmlkZShtYXhELm1pbnVzKGQwKSwgZDEsIDAsIDEsIDEpO1xuICAgIG4wID0gbjAucGx1cyhkMi50aW1lcyhuMSkpO1xuICAgIGQwID0gZDAucGx1cyhkMi50aW1lcyhkMSkpO1xuICAgIG4wLnMgPSBuMS5zID0geC5zO1xuXG4gICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGZyYWN0aW9uIGlzIGNsb3NlciB0byB4LCBuMC9kMCBvciBuMS9kMT9cbiAgICByID0gZGl2aWRlKG4xLCBkMSwgZSwgMSkubWludXMoeCkuYWJzKCkuY21wKGRpdmlkZShuMCwgZDAsIGUsIDEpLm1pbnVzKHgpLmFicygpKSA8IDFcbiAgICAgICAgPyBbbjEsIGQxXSA6IFtuMCwgZDBdO1xuXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcbiAgICBleHRlcm5hbCA9IHRydWU7XG5cbiAgICByZXR1cm4gcjtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpbiBiYXNlIDE2LCByb3VuZCB0byBgc2RgIHNpZ25pZmljYW50XG4gICAqIGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGBybWAuXG4gICAqXG4gICAqIElmIHRoZSBvcHRpb25hbCBgc2RgIGFyZ3VtZW50IGlzIHByZXNlbnQgdGhlbiByZXR1cm4gYmluYXJ5IGV4cG9uZW50aWFsIG5vdGF0aW9uLlxuICAgKlxuICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxuICAgKlxuICAgKi9cbiAgUC50b0hleGFkZWNpbWFsID0gUC50b0hleCA9IGZ1bmN0aW9uIChzZCwgcm0pIHtcbiAgICByZXR1cm4gdG9TdHJpbmdCaW5hcnkodGhpcywgMTYsIHNkLCBybSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm5zIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIG5lYXJlc3QgbXVsdGlwbGUgb2YgYHlgIGluIHRoZSBkaXJlY3Rpb24gb2Ygcm91bmRpbmdcbiAgICogbW9kZSBgcm1gLCBvciBgRGVjaW1hbC5yb3VuZGluZ2AgaWYgYHJtYCBpcyBvbWl0dGVkLCB0byB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxuICAgKlxuICAgKiBUaGUgcmV0dXJuIHZhbHVlIHdpbGwgYWx3YXlzIGhhdmUgdGhlIHNhbWUgc2lnbiBhcyB0aGlzIERlY2ltYWwsIHVubGVzcyBlaXRoZXIgdGhpcyBEZWNpbWFsXG4gICAqIG9yIGB5YCBpcyBOYU4sIGluIHdoaWNoIGNhc2UgdGhlIHJldHVybiB2YWx1ZSB3aWxsIGJlIGFsc28gYmUgTmFOLlxuICAgKlxuICAgKiBUaGUgcmV0dXJuIHZhbHVlIGlzIG5vdCBhZmZlY3RlZCBieSB0aGUgdmFsdWUgb2YgYHByZWNpc2lvbmAuXG4gICAqXG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIG1hZ25pdHVkZSB0byByb3VuZCB0byBhIG11bHRpcGxlIG9mLlxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXG4gICAqXG4gICAqICd0b05lYXJlc3QoKSByb3VuZGluZyBtb2RlIG5vdCBhbiBpbnRlZ2VyOiB7cm19J1xuICAgKiAndG9OZWFyZXN0KCkgcm91bmRpbmcgbW9kZSBvdXQgb2YgcmFuZ2U6IHtybX0nXG4gICAqXG4gICAqL1xuICBQLnRvTmVhcmVzdCA9IGZ1bmN0aW9uICh5LCBybSkge1xuICAgIHZhciB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuXG4gICAgeCA9IG5ldyBDdG9yKHgpO1xuXG4gICAgaWYgKHkgPT0gbnVsbCkge1xuXG4gICAgICAvLyBJZiB4IGlzIG5vdCBmaW5pdGUsIHJldHVybiB4LlxuICAgICAgaWYgKCF4LmQpIHJldHVybiB4O1xuXG4gICAgICB5ID0gbmV3IEN0b3IoMSk7XG4gICAgICBybSA9IEN0b3Iucm91bmRpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHkgPSBuZXcgQ3Rvcih5KTtcbiAgICAgIGlmIChybSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHJtID0gQ3Rvci5yb3VuZGluZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoZWNrSW50MzIocm0sIDAsIDgpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB4IGlzIG5vdCBmaW5pdGUsIHJldHVybiB4IGlmIHkgaXMgbm90IE5hTiwgZWxzZSBOYU4uXG4gICAgICBpZiAoIXguZCkgcmV0dXJuIHkucyA/IHggOiB5O1xuXG4gICAgICAvLyBJZiB5IGlzIG5vdCBmaW5pdGUsIHJldHVybiBJbmZpbml0eSB3aXRoIHRoZSBzaWduIG9mIHggaWYgeSBpcyBJbmZpbml0eSwgZWxzZSBOYU4uXG4gICAgICBpZiAoIXkuZCkge1xuICAgICAgICBpZiAoeS5zKSB5LnMgPSB4LnM7XG4gICAgICAgIHJldHVybiB5O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHkgaXMgbm90IHplcm8sIGNhbGN1bGF0ZSB0aGUgbmVhcmVzdCBtdWx0aXBsZSBvZiB5IHRvIHguXG4gICAgaWYgKHkuZFswXSkge1xuICAgICAgZXh0ZXJuYWwgPSBmYWxzZTtcbiAgICAgIHggPSBkaXZpZGUoeCwgeSwgMCwgcm0sIDEpLnRpbWVzKHkpO1xuICAgICAgZXh0ZXJuYWwgPSB0cnVlO1xuICAgICAgZmluYWxpc2UoeCk7XG5cbiAgICAgIC8vIElmIHkgaXMgemVybywgcmV0dXJuIHplcm8gd2l0aCB0aGUgc2lnbiBvZiB4LlxuICAgIH0gZWxzZSB7XG4gICAgICB5LnMgPSB4LnM7XG4gICAgICB4ID0geTtcbiAgICB9XG5cbiAgICByZXR1cm4geDtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGNvbnZlcnRlZCB0byBhIG51bWJlciBwcmltaXRpdmUuXG4gICAqIFplcm8ga2VlcHMgaXRzIHNpZ24uXG4gICAqXG4gICAqL1xuICBQLnRvTnVtYmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiArdGhpcztcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpbiBiYXNlIDgsIHJvdW5kIHRvIGBzZGAgc2lnbmlmaWNhbnRcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJtYC5cbiAgICpcbiAgICogSWYgdGhlIG9wdGlvbmFsIGBzZGAgYXJndW1lbnQgaXMgcHJlc2VudCB0aGVuIHJldHVybiBiaW5hcnkgZXhwb25lbnRpYWwgbm90YXRpb24uXG4gICAqXG4gICAqIFtzZF0ge251bWJlcn0gU2lnbmlmaWNhbnQgZGlnaXRzLiBJbnRlZ2VyLCAxIHRvIE1BWF9ESUdJVFMgaW5jbHVzaXZlLlxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXG4gICAqXG4gICAqL1xuICBQLnRvT2N0YWwgPSBmdW5jdGlvbiAoc2QsIHJtKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nQmluYXJ5KHRoaXMsIDgsIHNkLCBybSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHJhaXNlZCB0byB0aGUgcG93ZXIgYHlgLCByb3VuZGVkXG4gICAqIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqIEVDTUFTY3JpcHQgY29tcGxpYW50LlxuICAgKlxuICAgKiAgIHBvdyh4LCBOYU4pICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBOYU5cbiAgICogICBwb3coeCwgwrEwKSAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDFcblxuICAgKiAgIHBvdyhOYU4sIG5vbi16ZXJvKSAgICAgICAgICAgICAgICAgICAgPSBOYU5cbiAgICogICBwb3coYWJzKHgpID4gMSwgK0luZmluaXR5KSAgICAgICAgICAgID0gK0luZmluaXR5XG4gICAqICAgcG93KGFicyh4KSA+IDEsIC1JbmZpbml0eSkgICAgICAgICAgICA9ICswXG4gICAqICAgcG93KGFicyh4KSA9PSAxLCDCsUluZmluaXR5KSAgICAgICAgICAgPSBOYU5cbiAgICogICBwb3coYWJzKHgpIDwgMSwgK0luZmluaXR5KSAgICAgICAgICAgID0gKzBcbiAgICogICBwb3coYWJzKHgpIDwgMSwgLUluZmluaXR5KSAgICAgICAgICAgID0gK0luZmluaXR5XG4gICAqICAgcG93KCtJbmZpbml0eSwgeSA+IDApICAgICAgICAgICAgICAgICA9ICtJbmZpbml0eVxuICAgKiAgIHBvdygrSW5maW5pdHksIHkgPCAwKSAgICAgICAgICAgICAgICAgPSArMFxuICAgKiAgIHBvdygtSW5maW5pdHksIG9kZCBpbnRlZ2VyID4gMCkgICAgICAgPSAtSW5maW5pdHlcbiAgICogICBwb3coLUluZmluaXR5LCBldmVuIGludGVnZXIgPiAwKSAgICAgID0gK0luZmluaXR5XG4gICAqICAgcG93KC1JbmZpbml0eSwgb2RkIGludGVnZXIgPCAwKSAgICAgICA9IC0wXG4gICAqICAgcG93KC1JbmZpbml0eSwgZXZlbiBpbnRlZ2VyIDwgMCkgICAgICA9ICswXG4gICAqICAgcG93KCswLCB5ID4gMCkgICAgICAgICAgICAgICAgICAgICAgICA9ICswXG4gICAqICAgcG93KCswLCB5IDwgMCkgICAgICAgICAgICAgICAgICAgICAgICA9ICtJbmZpbml0eVxuICAgKiAgIHBvdygtMCwgb2RkIGludGVnZXIgPiAwKSAgICAgICAgICAgICAgPSAtMFxuICAgKiAgIHBvdygtMCwgZXZlbiBpbnRlZ2VyID4gMCkgICAgICAgICAgICAgPSArMFxuICAgKiAgIHBvdygtMCwgb2RkIGludGVnZXIgPCAwKSAgICAgICAgICAgICAgPSAtSW5maW5pdHlcbiAgICogICBwb3coLTAsIGV2ZW4gaW50ZWdlciA8IDApICAgICAgICAgICAgID0gK0luZmluaXR5XG4gICAqICAgcG93KGZpbml0ZSB4IDwgMCwgZmluaXRlIG5vbi1pbnRlZ2VyKSA9IE5hTlxuICAgKlxuICAgKiBGb3Igbm9uLWludGVnZXIgb3IgdmVyeSBsYXJnZSBleHBvbmVudHMgcG93KHgsIHkpIGlzIGNhbGN1bGF0ZWQgdXNpbmdcbiAgICpcbiAgICogICB4XnkgPSBleHAoeSpsbih4KSlcbiAgICpcbiAgICogQXNzdW1pbmcgdGhlIGZpcnN0IDE1IHJvdW5kaW5nIGRpZ2l0cyBhcmUgZWFjaCBlcXVhbGx5IGxpa2VseSB0byBiZSBhbnkgZGlnaXQgMC05LCB0aGVcbiAgICogcHJvYmFiaWxpdHkgb2YgYW4gaW5jb3JyZWN0bHkgcm91bmRlZCByZXN1bHRcbiAgICogUChbNDldOXsxNH0gfCBbNTBdMHsxNH0pID0gMiAqIDAuMiAqIDEwXi0xNCA9IDRlLTE1ID0gMS8yLjVlKzE0XG4gICAqIGkuZS4gMSBpbiAyNTAsMDAwLDAwMCwwMDAsMDAwXG4gICAqXG4gICAqIElmIGEgcmVzdWx0IGlzIGluY29ycmVjdGx5IHJvdW5kZWQgdGhlIG1heGltdW0gZXJyb3Igd2lsbCBiZSAxIHVscCAodW5pdCBpbiBsYXN0IHBsYWNlKS5cbiAgICpcbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgcG93ZXIgdG8gd2hpY2ggdG8gcmFpc2UgdGhpcyBEZWNpbWFsLlxuICAgKlxuICAgKi9cbiAgUC50b1Bvd2VyID0gUC5wb3cgPSBmdW5jdGlvbiAoeSkge1xuICAgIHZhciBlLCBrLCBwciwgciwgcm0sIHMsXG4gICAgICB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yLFxuICAgICAgeW4gPSArKHkgPSBuZXcgQ3Rvcih5KSk7XG5cbiAgICAvLyBFaXRoZXIgwrFJbmZpbml0eSwgTmFOIG9yIMKxMD9cbiAgICBpZiAoIXguZCB8fCAheS5kIHx8ICF4LmRbMF0gfHwgIXkuZFswXSkgcmV0dXJuIG5ldyBDdG9yKG1hdGhwb3coK3gsIHluKSk7XG5cbiAgICB4ID0gbmV3IEN0b3IoeCk7XG5cbiAgICBpZiAoeC5lcSgxKSkgcmV0dXJuIHg7XG5cbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcblxuICAgIGlmICh5LmVxKDEpKSByZXR1cm4gZmluYWxpc2UoeCwgcHIsIHJtKTtcblxuICAgIC8vIHkgZXhwb25lbnRcbiAgICBlID0gbWF0aGZsb29yKHkuZSAvIExPR19CQVNFKTtcblxuICAgIC8vIElmIHkgaXMgYSBzbWFsbCBpbnRlZ2VyIHVzZSB0aGUgJ2V4cG9uZW50aWF0aW9uIGJ5IHNxdWFyaW5nJyBhbGdvcml0aG0uXG4gICAgaWYgKGUgPj0geS5kLmxlbmd0aCAtIDEgJiYgKGsgPSB5biA8IDAgPyAteW4gOiB5bikgPD0gTUFYX1NBRkVfSU5URUdFUikge1xuICAgICAgciA9IGludFBvdyhDdG9yLCB4LCBrLCBwcik7XG4gICAgICByZXR1cm4geS5zIDwgMCA/IG5ldyBDdG9yKDEpLmRpdihyKSA6IGZpbmFsaXNlKHIsIHByLCBybSk7XG4gICAgfVxuXG4gICAgcyA9IHgucztcblxuICAgIC8vIGlmIHggaXMgbmVnYXRpdmVcbiAgICBpZiAocyA8IDApIHtcblxuICAgICAgLy8gaWYgeSBpcyBub3QgYW4gaW50ZWdlclxuICAgICAgaWYgKGUgPCB5LmQubGVuZ3RoIC0gMSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XG5cbiAgICAgIC8vIFJlc3VsdCBpcyBwb3NpdGl2ZSBpZiB4IGlzIG5lZ2F0aXZlIGFuZCB0aGUgbGFzdCBkaWdpdCBvZiBpbnRlZ2VyIHkgaXMgZXZlbi5cbiAgICAgIGlmICgoeS5kW2VdICYgMSkgPT0gMCkgcyA9IDE7XG5cbiAgICAgIC8vIGlmIHguZXEoLTEpXG4gICAgICBpZiAoeC5lID09IDAgJiYgeC5kWzBdID09IDEgJiYgeC5kLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHgucyA9IHM7XG4gICAgICAgIHJldHVybiB4O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVzdGltYXRlIHJlc3VsdCBleHBvbmVudC5cbiAgICAvLyB4XnkgPSAxMF5lLCAgd2hlcmUgZSA9IHkgKiBsb2cxMCh4KVxuICAgIC8vIGxvZzEwKHgpID0gbG9nMTAoeF9zaWduaWZpY2FuZCkgKyB4X2V4cG9uZW50XG4gICAgLy8gbG9nMTAoeF9zaWduaWZpY2FuZCkgPSBsbih4X3NpZ25pZmljYW5kKSAvIGxuKDEwKVxuICAgIGsgPSBtYXRocG93KCt4LCB5bik7XG4gICAgZSA9IGsgPT0gMCB8fCAhaXNGaW5pdGUoaylcbiAgICAgICAgPyBtYXRoZmxvb3IoeW4gKiAoTWF0aC5sb2coJzAuJyArIGRpZ2l0c1RvU3RyaW5nKHguZCkpIC8gTWF0aC5MTjEwICsgeC5lICsgMSkpXG4gICAgICAgIDogbmV3IEN0b3IoayArICcnKS5lO1xuXG4gICAgLy8gRXhwb25lbnQgZXN0aW1hdGUgbWF5IGJlIGluY29ycmVjdCBlLmcuIHg6IDAuOTk5OTk5OTk5OTk5OTk5OTk5LCB5OiAyLjI5LCBlOiAwLCByLmU6IC0xLlxuXG4gICAgLy8gT3ZlcmZsb3cvdW5kZXJmbG93P1xuICAgIGlmIChlID4gQ3Rvci5tYXhFICsgMSB8fCBlIDwgQ3Rvci5taW5FIC0gMSkgcmV0dXJuIG5ldyBDdG9yKGUgPiAwID8gcyAvIDAgOiAwKTtcblxuICAgIGV4dGVybmFsID0gZmFsc2U7XG4gICAgQ3Rvci5yb3VuZGluZyA9IHgucyA9IDE7XG5cbiAgICAvLyBFc3RpbWF0ZSB0aGUgZXh0cmEgZ3VhcmQgZGlnaXRzIG5lZWRlZCB0byBlbnN1cmUgZml2ZSBjb3JyZWN0IHJvdW5kaW5nIGRpZ2l0cyBmcm9tXG4gICAgLy8gbmF0dXJhbExvZ2FyaXRobSh4KS4gRXhhbXBsZSBvZiBmYWlsdXJlIHdpdGhvdXQgdGhlc2UgZXh0cmEgZGlnaXRzIChwcmVjaXNpb246IDEwKTpcbiAgICAvLyBuZXcgRGVjaW1hbCgyLjMyNDU2KS5wb3coJzIwODc5ODc0MzY1MzQ1NjYuNDY0MTEnKVxuICAgIC8vIHNob3VsZCBiZSAxLjE2MjM3NzgyM2UrNzY0OTE0OTA1MTczODE1LCBidXQgaXMgMS4xNjIzNTU4MjNlKzc2NDkxNDkwNTE3MzgxNVxuICAgIGsgPSBNYXRoLm1pbigxMiwgKGUgKyAnJykubGVuZ3RoKTtcblxuICAgIC8vIHIgPSB4XnkgPSBleHAoeSpsbih4KSlcbiAgICByID0gbmF0dXJhbEV4cG9uZW50aWFsKHkudGltZXMobmF0dXJhbExvZ2FyaXRobSh4LCBwciArIGspKSwgcHIpO1xuXG4gICAgLy8gciBtYXkgYmUgSW5maW5pdHksIGUuZy4gKDAuOTk5OTk5OTk5OTk5OTk5OSkucG93KC0xZSs0MClcbiAgICBpZiAoci5kKSB7XG5cbiAgICAgIC8vIFRydW5jYXRlIHRvIHRoZSByZXF1aXJlZCBwcmVjaXNpb24gcGx1cyBmaXZlIHJvdW5kaW5nIGRpZ2l0cy5cbiAgICAgIHIgPSBmaW5hbGlzZShyLCBwciArIDUsIDEpO1xuXG4gICAgICAvLyBJZiB0aGUgcm91bmRpbmcgZGlnaXRzIGFyZSBbNDldOTk5OSBvciBbNTBdMDAwMCBpbmNyZWFzZSB0aGUgcHJlY2lzaW9uIGJ5IDEwIGFuZCByZWNhbGN1bGF0ZVxuICAgICAgLy8gdGhlIHJlc3VsdC5cbiAgICAgIGlmIChjaGVja1JvdW5kaW5nRGlnaXRzKHIuZCwgcHIsIHJtKSkge1xuICAgICAgICBlID0gcHIgKyAxMDtcblxuICAgICAgICAvLyBUcnVuY2F0ZSB0byB0aGUgaW5jcmVhc2VkIHByZWNpc2lvbiBwbHVzIGZpdmUgcm91bmRpbmcgZGlnaXRzLlxuICAgICAgICByID0gZmluYWxpc2UobmF0dXJhbEV4cG9uZW50aWFsKHkudGltZXMobmF0dXJhbExvZ2FyaXRobSh4LCBlICsgaykpLCBlKSwgZSArIDUsIDEpO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciAxNCBuaW5lcyBmcm9tIHRoZSAybmQgcm91bmRpbmcgZGlnaXQgKHRoZSBmaXJzdCByb3VuZGluZyBkaWdpdCBtYXkgYmUgNCBvciA5KS5cbiAgICAgICAgaWYgKCtkaWdpdHNUb1N0cmluZyhyLmQpLnNsaWNlKHByICsgMSwgcHIgKyAxNSkgKyAxID09IDFlMTQpIHtcbiAgICAgICAgICByID0gZmluYWxpc2UociwgcHIgKyAxLCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHIucyA9IHM7XG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcblxuICAgIHJldHVybiBmaW5hbGlzZShyLCBwciwgcm0pO1xuICB9O1xuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHJvdW5kZWQgdG8gYHNkYCBzaWduaWZpY2FudCBkaWdpdHNcbiAgICogdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgYHNkYCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHMgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudFxuICAgKiB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBub3JtYWwgbm90YXRpb24uXG4gICAqXG4gICAqIFtzZF0ge251bWJlcn0gU2lnbmlmaWNhbnQgZGlnaXRzLiBJbnRlZ2VyLCAxIHRvIE1BWF9ESUdJVFMgaW5jbHVzaXZlLlxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXG4gICAqXG4gICAqL1xuICBQLnRvUHJlY2lzaW9uID0gZnVuY3Rpb24gKHNkLCBybSkge1xuICAgIHZhciBzdHIsXG4gICAgICB4ID0gdGhpcyxcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuXG4gICAgaWYgKHNkID09PSB2b2lkIDApIHtcbiAgICAgIHN0ciA9IGZpbml0ZVRvU3RyaW5nKHgsIHguZSA8PSBDdG9yLnRvRXhwTmVnIHx8IHguZSA+PSBDdG9yLnRvRXhwUG9zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hlY2tJbnQzMihzZCwgMSwgTUFYX0RJR0lUUyk7XG5cbiAgICAgIGlmIChybSA9PT0gdm9pZCAwKSBybSA9IEN0b3Iucm91bmRpbmc7XG4gICAgICBlbHNlIGNoZWNrSW50MzIocm0sIDAsIDgpO1xuXG4gICAgICB4ID0gZmluYWxpc2UobmV3IEN0b3IoeCksIHNkLCBybSk7XG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4LCBzZCA8PSB4LmUgfHwgeC5lIDw9IEN0b3IudG9FeHBOZWcsIHNkKTtcbiAgICB9XG5cbiAgICByZXR1cm4geC5pc05lZygpICYmICF4LmlzWmVybygpID8gJy0nICsgc3RyIDogc3RyO1xuICB9O1xuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCByb3VuZGVkIHRvIGEgbWF4aW11bSBvZiBgc2RgXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGBybWAsIG9yIHRvIGBwcmVjaXNpb25gIGFuZCBgcm91bmRpbmdgIHJlc3BlY3RpdmVseSBpZlxuICAgKiBvbWl0dGVkLlxuICAgKlxuICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxuICAgKlxuICAgKiAndG9TRCgpIGRpZ2l0cyBvdXQgb2YgcmFuZ2U6IHtzZH0nXG4gICAqICd0b1NEKCkgZGlnaXRzIG5vdCBhbiBpbnRlZ2VyOiB7c2R9J1xuICAgKiAndG9TRCgpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXG4gICAqICd0b1NEKCkgcm91bmRpbmcgbW9kZSBvdXQgb2YgcmFuZ2U6IHtybX0nXG4gICAqXG4gICAqL1xuICBQLnRvU2lnbmlmaWNhbnREaWdpdHMgPSBQLnRvU0QgPSBmdW5jdGlvbiAoc2QsIHJtKSB7XG4gICAgdmFyIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XG5cbiAgICBpZiAoc2QgPT09IHZvaWQgMCkge1xuICAgICAgc2QgPSBDdG9yLnByZWNpc2lvbjtcbiAgICAgIHJtID0gQ3Rvci5yb3VuZGluZztcbiAgICB9IGVsc2Uge1xuICAgICAgY2hlY2tJbnQzMihzZCwgMSwgTUFYX0RJR0lUUyk7XG5cbiAgICAgIGlmIChybSA9PT0gdm9pZCAwKSBybSA9IEN0b3Iucm91bmRpbmc7XG4gICAgICBlbHNlIGNoZWNrSW50MzIocm0sIDAsIDgpO1xuICAgIH1cblxuICAgIHJldHVybiBmaW5hbGlzZShuZXcgQ3Rvcih4KSwgc2QsIHJtKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cbiAgICpcbiAgICogUmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoaXMgRGVjaW1hbCBoYXMgYSBwb3NpdGl2ZSBleHBvbmVudCBlcXVhbCB0byBvciBncmVhdGVyIHRoYW5cbiAgICogYHRvRXhwUG9zYCwgb3IgYSBuZWdhdGl2ZSBleHBvbmVudCBlcXVhbCB0byBvciBsZXNzIHRoYW4gYHRvRXhwTmVnYC5cbiAgICpcbiAgICovXG4gIFAudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4LCB4LmUgPD0gQ3Rvci50b0V4cE5lZyB8fCB4LmUgPj0gQ3Rvci50b0V4cFBvcyk7XG5cbiAgICByZXR1cm4geC5pc05lZygpICYmICF4LmlzWmVybygpID8gJy0nICsgc3RyIDogc3RyO1xuICB9O1xuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCB0cnVuY2F0ZWQgdG8gYSB3aG9sZSBudW1iZXIuXG4gICAqXG4gICAqL1xuICBQLnRydW5jYXRlZCA9IFAudHJ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZpbmFsaXNlKG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpLCB0aGlzLmUgKyAxLCAxKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cbiAgICogVW5saWtlIGB0b1N0cmluZ2AsIG5lZ2F0aXZlIHplcm8gd2lsbCBpbmNsdWRlIHRoZSBtaW51cyBzaWduLlxuICAgKlxuICAgKi9cbiAgUC52YWx1ZU9mID0gUC50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHggPSB0aGlzLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4LCB4LmUgPD0gQ3Rvci50b0V4cE5lZyB8fCB4LmUgPj0gQ3Rvci50b0V4cFBvcyk7XG5cbiAgICByZXR1cm4geC5pc05lZygpID8gJy0nICsgc3RyIDogc3RyO1xuICB9O1xuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgRGVjaW1hbC5wcm90b3R5cGUgKFApIGFuZC9vciBEZWNpbWFsIG1ldGhvZHMsIGFuZCB0aGVpciBjYWxsZXJzLlxuXG5cbiAgLypcbiAgICogIGRpZ2l0c1RvU3RyaW5nICAgICAgICAgICBQLmN1YmVSb290LCBQLmxvZ2FyaXRobSwgUC5zcXVhcmVSb290LCBQLnRvRnJhY3Rpb24sIFAudG9Qb3dlcixcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5pdGVUb1N0cmluZywgbmF0dXJhbEV4cG9uZW50aWFsLCBuYXR1cmFsTG9nYXJpdGhtXG4gICAqICBjaGVja0ludDMyICAgICAgICAgICAgICAgUC50b0RlY2ltYWxQbGFjZXMsIFAudG9FeHBvbmVudGlhbCwgUC50b0ZpeGVkLCBQLnRvTmVhcmVzdCxcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBQLnRvUHJlY2lzaW9uLCBQLnRvU2lnbmlmaWNhbnREaWdpdHMsIHRvU3RyaW5nQmluYXJ5LCByYW5kb21cbiAgICogIGNoZWNrUm91bmRpbmdEaWdpdHMgICAgICBQLmxvZ2FyaXRobSwgUC50b1Bvd2VyLCBuYXR1cmFsRXhwb25lbnRpYWwsIG5hdHVyYWxMb2dhcml0aG1cbiAgICogIGNvbnZlcnRCYXNlICAgICAgICAgICAgICB0b1N0cmluZ0JpbmFyeSwgcGFyc2VPdGhlclxuICAgKiAgY29zICAgICAgICAgICAgICAgICAgICAgIFAuY29zXG4gICAqICBkaXZpZGUgICAgICAgICAgICAgICAgICAgUC5hdGFuaCwgUC5jdWJlUm9vdCwgUC5kaXZpZGVkQnksIFAuZGl2aWRlZFRvSW50ZWdlckJ5LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFAubG9nYXJpdGhtLCBQLm1vZHVsbywgUC5zcXVhcmVSb290LCBQLnRhbiwgUC50YW5oLCBQLnRvRnJhY3Rpb24sXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgUC50b05lYXJlc3QsIHRvU3RyaW5nQmluYXJ5LCBuYXR1cmFsRXhwb25lbnRpYWwsIG5hdHVyYWxMb2dhcml0aG0sXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgdGF5bG9yU2VyaWVzLCBhdGFuMiwgcGFyc2VPdGhlclxuICAgKiAgZmluYWxpc2UgICAgICAgICAgICAgICAgIFAuYWJzb2x1dGVWYWx1ZSwgUC5hdGFuLCBQLmF0YW5oLCBQLmNlaWwsIFAuY29zLCBQLmNvc2gsXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgUC5jdWJlUm9vdCwgUC5kaXZpZGVkVG9JbnRlZ2VyQnksIFAuZmxvb3IsIFAubG9nYXJpdGhtLCBQLm1pbnVzLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFAubW9kdWxvLCBQLm5lZ2F0ZWQsIFAucGx1cywgUC5yb3VuZCwgUC5zaW4sIFAuc2luaCwgUC5zcXVhcmVSb290LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFAudGFuLCBQLnRpbWVzLCBQLnRvRGVjaW1hbFBsYWNlcywgUC50b0V4cG9uZW50aWFsLCBQLnRvRml4ZWQsXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgUC50b05lYXJlc3QsIFAudG9Qb3dlciwgUC50b1ByZWNpc2lvbiwgUC50b1NpZ25pZmljYW50RGlnaXRzLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFAudHJ1bmNhdGVkLCBkaXZpZGUsIGdldExuMTAsIGdldFBpLCBuYXR1cmFsRXhwb25lbnRpYWwsXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF0dXJhbExvZ2FyaXRobSwgY2VpbCwgZmxvb3IsIHJvdW5kLCB0cnVuY1xuICAgKiAgZmluaXRlVG9TdHJpbmcgICAgICAgICAgIFAudG9FeHBvbmVudGlhbCwgUC50b0ZpeGVkLCBQLnRvUHJlY2lzaW9uLCBQLnRvU3RyaW5nLCBQLnZhbHVlT2YsXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9TdHJpbmdCaW5hcnlcbiAgICogIGdldEJhc2UxMEV4cG9uZW50ICAgICAgICBQLm1pbnVzLCBQLnBsdXMsIFAudGltZXMsIHBhcnNlT3RoZXJcbiAgICogIGdldExuMTAgICAgICAgICAgICAgICAgICBQLmxvZ2FyaXRobSwgbmF0dXJhbExvZ2FyaXRobVxuICAgKiAgZ2V0UGkgICAgICAgICAgICAgICAgICAgIFAuYWNvcywgUC5hc2luLCBQLmF0YW4sIHRvTGVzc1RoYW5IYWxmUGksIGF0YW4yXG4gICAqICBnZXRQcmVjaXNpb24gICAgICAgICAgICAgUC5wcmVjaXNpb24sIFAudG9GcmFjdGlvblxuICAgKiAgZ2V0WmVyb1N0cmluZyAgICAgICAgICAgIGRpZ2l0c1RvU3RyaW5nLCBmaW5pdGVUb1N0cmluZ1xuICAgKiAgaW50UG93ICAgICAgICAgICAgICAgICAgIFAudG9Qb3dlciwgcGFyc2VPdGhlclxuICAgKiAgaXNPZGQgICAgICAgICAgICAgICAgICAgIHRvTGVzc1RoYW5IYWxmUGlcbiAgICogIG1heE9yTWluICAgICAgICAgICAgICAgICBtYXgsIG1pblxuICAgKiAgbmF0dXJhbEV4cG9uZW50aWFsICAgICAgIFAubmF0dXJhbEV4cG9uZW50aWFsLCBQLnRvUG93ZXJcbiAgICogIG5hdHVyYWxMb2dhcml0aG0gICAgICAgICBQLmFjb3NoLCBQLmFzaW5oLCBQLmF0YW5oLCBQLmxvZ2FyaXRobSwgUC5uYXR1cmFsTG9nYXJpdGhtLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFAudG9Qb3dlciwgbmF0dXJhbEV4cG9uZW50aWFsXG4gICAqICBub25GaW5pdGVUb1N0cmluZyAgICAgICAgZmluaXRlVG9TdHJpbmcsIHRvU3RyaW5nQmluYXJ5XG4gICAqICBwYXJzZURlY2ltYWwgICAgICAgICAgICAgRGVjaW1hbFxuICAgKiAgcGFyc2VPdGhlciAgICAgICAgICAgICAgIERlY2ltYWxcbiAgICogIHNpbiAgICAgICAgICAgICAgICAgICAgICBQLnNpblxuICAgKiAgdGF5bG9yU2VyaWVzICAgICAgICAgICAgIFAuY29zaCwgUC5zaW5oLCBjb3MsIHNpblxuICAgKiAgdG9MZXNzVGhhbkhhbGZQaSAgICAgICAgIFAuY29zLCBQLnNpblxuICAgKiAgdG9TdHJpbmdCaW5hcnkgICAgICAgICAgIFAudG9CaW5hcnksIFAudG9IZXhhZGVjaW1hbCwgUC50b09jdGFsXG4gICAqICB0cnVuY2F0ZSAgICAgICAgICAgICAgICAgaW50UG93XG4gICAqXG4gICAqICBUaHJvd3M6ICAgICAgICAgICAgICAgICAgUC5sb2dhcml0aG0sIFAucHJlY2lzaW9uLCBQLnRvRnJhY3Rpb24sIGNoZWNrSW50MzIsIGdldExuMTAsIGdldFBpLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdHVyYWxMb2dhcml0aG0sIGNvbmZpZywgcGFyc2VPdGhlciwgcmFuZG9tLCBEZWNpbWFsXG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gZGlnaXRzVG9TdHJpbmcoZCkge1xuICAgIHZhciBpLCBrLCB3cyxcbiAgICAgIGluZGV4T2ZMYXN0V29yZCA9IGQubGVuZ3RoIC0gMSxcbiAgICAgIHN0ciA9ICcnLFxuICAgICAgdyA9IGRbMF07XG5cbiAgICBpZiAoaW5kZXhPZkxhc3RXb3JkID4gMCkge1xuICAgICAgc3RyICs9IHc7XG4gICAgICBmb3IgKGkgPSAxOyBpIDwgaW5kZXhPZkxhc3RXb3JkOyBpKyspIHtcbiAgICAgICAgd3MgPSBkW2ldICsgJyc7XG4gICAgICAgIGsgPSBMT0dfQkFTRSAtIHdzLmxlbmd0aDtcbiAgICAgICAgaWYgKGspIHN0ciArPSBnZXRaZXJvU3RyaW5nKGspO1xuICAgICAgICBzdHIgKz0gd3M7XG4gICAgICB9XG5cbiAgICAgIHcgPSBkW2ldO1xuICAgICAgd3MgPSB3ICsgJyc7XG4gICAgICBrID0gTE9HX0JBU0UgLSB3cy5sZW5ndGg7XG4gICAgICBpZiAoaykgc3RyICs9IGdldFplcm9TdHJpbmcoayk7XG4gICAgfSBlbHNlIGlmICh3ID09PSAwKSB7XG4gICAgICByZXR1cm4gJzAnO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcyBvZiBsYXN0IHcuXG4gICAgZm9yICg7IHcgJSAxMCA9PT0gMDspIHcgLz0gMTA7XG5cbiAgICByZXR1cm4gc3RyICsgdztcbiAgfVxuXG5cbiAgZnVuY3Rpb24gY2hlY2tJbnQzMihpLCBtaW4sIG1heCkge1xuICAgIGlmIChpICE9PSB+fmkgfHwgaSA8IG1pbiB8fCBpID4gbWF4KSB7XG4gICAgICB0aHJvdyBFcnJvcihpbnZhbGlkQXJndW1lbnQgKyBpKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qXG4gICAqIENoZWNrIDUgcm91bmRpbmcgZGlnaXRzIGlmIGByZXBlYXRpbmdgIGlzIG51bGwsIDQgb3RoZXJ3aXNlLlxuICAgKiBgcmVwZWF0aW5nID09IG51bGxgIGlmIGNhbGxlciBpcyBgbG9nYCBvciBgcG93YCxcbiAgICogYHJlcGVhdGluZyAhPSBudWxsYCBpZiBjYWxsZXIgaXMgYG5hdHVyYWxMb2dhcml0aG1gIG9yIGBuYXR1cmFsRXhwb25lbnRpYWxgLlxuICAgKi9cbiAgZnVuY3Rpb24gY2hlY2tSb3VuZGluZ0RpZ2l0cyhkLCBpLCBybSwgcmVwZWF0aW5nKSB7XG4gICAgdmFyIGRpLCBrLCByLCByZDtcblxuICAgIC8vIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBmaXJzdCB3b3JkIG9mIHRoZSBhcnJheSBkLlxuICAgIGZvciAoayA9IGRbMF07IGsgPj0gMTA7IGsgLz0gMTApIC0taTtcblxuICAgIC8vIElzIHRoZSByb3VuZGluZyBkaWdpdCBpbiB0aGUgZmlyc3Qgd29yZCBvZiBkP1xuICAgIGlmICgtLWkgPCAwKSB7XG4gICAgICBpICs9IExPR19CQVNFO1xuICAgICAgZGkgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaSA9IE1hdGguY2VpbCgoaSArIDEpIC8gTE9HX0JBU0UpO1xuICAgICAgaSAlPSBMT0dfQkFTRTtcbiAgICB9XG5cbiAgICAvLyBpIGlzIHRoZSBpbmRleCAoMCAtIDYpIG9mIHRoZSByb3VuZGluZyBkaWdpdC5cbiAgICAvLyBFLmcuIGlmIHdpdGhpbiB0aGUgd29yZCAzNDg3NTYzIHRoZSBmaXJzdCByb3VuZGluZyBkaWdpdCBpcyA1LFxuICAgIC8vIHRoZW4gaSA9IDQsIGsgPSAxMDAwLCByZCA9IDM0ODc1NjMgJSAxMDAwID0gNTYzXG4gICAgayA9IG1hdGhwb3coMTAsIExPR19CQVNFIC0gaSk7XG4gICAgcmQgPSBkW2RpXSAlIGsgfCAwO1xuXG4gICAgaWYgKHJlcGVhdGluZyA9PSBudWxsKSB7XG4gICAgICBpZiAoaSA8IDMpIHtcbiAgICAgICAgaWYgKGkgPT0gMCkgcmQgPSByZCAvIDEwMCB8IDA7XG4gICAgICAgIGVsc2UgaWYgKGkgPT0gMSkgcmQgPSByZCAvIDEwIHwgMDtcbiAgICAgICAgciA9IHJtIDwgNCAmJiByZCA9PSA5OTk5OSB8fCBybSA+IDMgJiYgcmQgPT0gNDk5OTkgfHwgcmQgPT0gNTAwMDAgfHwgcmQgPT0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHIgPSAocm0gPCA0ICYmIHJkICsgMSA9PSBrIHx8IHJtID4gMyAmJiByZCArIDEgPT0gayAvIDIpICYmXG4gICAgICAgICAgICAoZFtkaSArIDFdIC8gayAvIDEwMCB8IDApID09IG1hdGhwb3coMTAsIGkgLSAyKSAtIDEgfHxcbiAgICAgICAgICAgIChyZCA9PSBrIC8gMiB8fCByZCA9PSAwKSAmJiAoZFtkaSArIDFdIC8gayAvIDEwMCB8IDApID09IDA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpIDwgNCkge1xuICAgICAgICBpZiAoaSA9PSAwKSByZCA9IHJkIC8gMTAwMCB8IDA7XG4gICAgICAgIGVsc2UgaWYgKGkgPT0gMSkgcmQgPSByZCAvIDEwMCB8IDA7XG4gICAgICAgIGVsc2UgaWYgKGkgPT0gMikgcmQgPSByZCAvIDEwIHwgMDtcbiAgICAgICAgciA9IChyZXBlYXRpbmcgfHwgcm0gPCA0KSAmJiByZCA9PSA5OTk5IHx8ICFyZXBlYXRpbmcgJiYgcm0gPiAzICYmIHJkID09IDQ5OTk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByID0gKChyZXBlYXRpbmcgfHwgcm0gPCA0KSAmJiByZCArIDEgPT0gayB8fFxuICAgICAgICAgICAgICghcmVwZWF0aW5nICYmIHJtID4gMykgJiYgcmQgKyAxID09IGsgLyAyKSAmJlxuICAgICAgICAgICAgKGRbZGkgKyAxXSAvIGsgLyAxMDAwIHwgMCkgPT0gbWF0aHBvdygxMCwgaSAtIDMpIC0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcjtcbiAgfVxuXG5cbiAgLy8gQ29udmVydCBzdHJpbmcgb2YgYGJhc2VJbmAgdG8gYW4gYXJyYXkgb2YgbnVtYmVycyBvZiBgYmFzZU91dGAuXG4gIC8vIEVnLiBjb252ZXJ0QmFzZSgnMjU1JywgMTAsIDE2KSByZXR1cm5zIFsxNSwgMTVdLlxuICAvLyBFZy4gY29udmVydEJhc2UoJ2ZmJywgMTYsIDEwKSByZXR1cm5zIFsyLCA1LCA1XS5cbiAgZnVuY3Rpb24gY29udmVydEJhc2Uoc3RyLCBiYXNlSW4sIGJhc2VPdXQpIHtcbiAgICB2YXIgaixcbiAgICAgIGFyciA9IFswXSxcbiAgICAgIGFyckwsXG4gICAgICBpID0gMCxcbiAgICAgIHN0ckwgPSBzdHIubGVuZ3RoO1xuXG4gICAgZm9yICg7IGkgPCBzdHJMOykge1xuICAgICAgZm9yIChhcnJMID0gYXJyLmxlbmd0aDsgYXJyTC0tOykgYXJyW2FyckxdICo9IGJhc2VJbjtcbiAgICAgIGFyclswXSArPSBOVU1FUkFMUy5pbmRleE9mKHN0ci5jaGFyQXQoaSsrKSk7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgYXJyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChhcnJbal0gPiBiYXNlT3V0IC0gMSkge1xuICAgICAgICAgIGlmIChhcnJbaiArIDFdID09PSB2b2lkIDApIGFycltqICsgMV0gPSAwO1xuICAgICAgICAgIGFycltqICsgMV0gKz0gYXJyW2pdIC8gYmFzZU91dCB8IDA7XG4gICAgICAgICAgYXJyW2pdICU9IGJhc2VPdXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyLnJldmVyc2UoKTtcbiAgfVxuXG5cbiAgLypcbiAgICogY29zKHgpID0gMSAtIHheMi8yISArIHheNC80ISAtIC4uLlxuICAgKiB8eHwgPCBwaS8yXG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBjb3NpbmUoQ3RvciwgeCkge1xuICAgIHZhciBrLCBsZW4sIHk7XG5cbiAgICBpZiAoeC5pc1plcm8oKSkgcmV0dXJuIHg7XG5cbiAgICAvLyBBcmd1bWVudCByZWR1Y3Rpb246IGNvcyg0eCkgPSA4Kihjb3NeNCh4KSAtIGNvc14yKHgpKSArIDFcbiAgICAvLyBpLmUuIGNvcyh4KSA9IDgqKGNvc140KHgvNCkgLSBjb3NeMih4LzQpKSArIDFcblxuICAgIC8vIEVzdGltYXRlIHRoZSBvcHRpbXVtIG51bWJlciBvZiB0aW1lcyB0byB1c2UgdGhlIGFyZ3VtZW50IHJlZHVjdGlvbi5cbiAgICBsZW4gPSB4LmQubGVuZ3RoO1xuICAgIGlmIChsZW4gPCAzMikge1xuICAgICAgayA9IE1hdGguY2VpbChsZW4gLyAzKTtcbiAgICAgIHkgPSAoMSAvIHRpbnlQb3coNCwgaykpLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGsgPSAxNjtcbiAgICAgIHkgPSAnMi4zMjgzMDY0MzY1Mzg2OTYyODkwNjI1ZS0xMCc7XG4gICAgfVxuXG4gICAgQ3Rvci5wcmVjaXNpb24gKz0gaztcblxuICAgIHggPSB0YXlsb3JTZXJpZXMoQ3RvciwgMSwgeC50aW1lcyh5KSwgbmV3IEN0b3IoMSkpO1xuXG4gICAgLy8gUmV2ZXJzZSBhcmd1bWVudCByZWR1Y3Rpb25cbiAgICBmb3IgKHZhciBpID0gazsgaS0tOykge1xuICAgICAgdmFyIGNvczJ4ID0geC50aW1lcyh4KTtcbiAgICAgIHggPSBjb3MyeC50aW1lcyhjb3MyeCkubWludXMoY29zMngpLnRpbWVzKDgpLnBsdXMoMSk7XG4gICAgfVxuXG4gICAgQ3Rvci5wcmVjaXNpb24gLT0gaztcblxuICAgIHJldHVybiB4O1xuICB9XG5cblxuICAvKlxuICAgKiBQZXJmb3JtIGRpdmlzaW9uIGluIHRoZSBzcGVjaWZpZWQgYmFzZS5cbiAgICovXG4gIHZhciBkaXZpZGUgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gQXNzdW1lcyBub24temVybyB4IGFuZCBrLCBhbmQgaGVuY2Ugbm9uLXplcm8gcmVzdWx0LlxuICAgIGZ1bmN0aW9uIG11bHRpcGx5SW50ZWdlcih4LCBrLCBiYXNlKSB7XG4gICAgICB2YXIgdGVtcCxcbiAgICAgICAgY2FycnkgPSAwLFxuICAgICAgICBpID0geC5sZW5ndGg7XG5cbiAgICAgIGZvciAoeCA9IHguc2xpY2UoKTsgaS0tOykge1xuICAgICAgICB0ZW1wID0geFtpXSAqIGsgKyBjYXJyeTtcbiAgICAgICAgeFtpXSA9IHRlbXAgJSBiYXNlIHwgMDtcbiAgICAgICAgY2FycnkgPSB0ZW1wIC8gYmFzZSB8IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChjYXJyeSkgeC51bnNoaWZ0KGNhcnJ5KTtcblxuICAgICAgcmV0dXJuIHg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcGFyZShhLCBiLCBhTCwgYkwpIHtcbiAgICAgIHZhciBpLCByO1xuXG4gICAgICBpZiAoYUwgIT0gYkwpIHtcbiAgICAgICAgciA9IGFMID4gYkwgPyAxIDogLTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgPSByID0gMDsgaSA8IGFMOyBpKyspIHtcbiAgICAgICAgICBpZiAoYVtpXSAhPSBiW2ldKSB7XG4gICAgICAgICAgICByID0gYVtpXSA+IGJbaV0gPyAxIDogLTE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3VidHJhY3QoYSwgYiwgYUwsIGJhc2UpIHtcbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgLy8gU3VidHJhY3QgYiBmcm9tIGEuXG4gICAgICBmb3IgKDsgYUwtLTspIHtcbiAgICAgICAgYVthTF0gLT0gaTtcbiAgICAgICAgaSA9IGFbYUxdIDwgYlthTF0gPyAxIDogMDtcbiAgICAgICAgYVthTF0gPSBpICogYmFzZSArIGFbYUxdIC0gYlthTF07XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zLlxuICAgICAgZm9yICg7ICFhWzBdICYmIGEubGVuZ3RoID4gMTspIGEuc2hpZnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHksIHByLCBybSwgZHAsIGJhc2UpIHtcbiAgICAgIHZhciBjbXAsIGUsIGksIGssIGxvZ0Jhc2UsIG1vcmUsIHByb2QsIHByb2RMLCBxLCBxZCwgcmVtLCByZW1MLCByZW0wLCBzZCwgdCwgeGksIHhMLCB5ZDAsXG4gICAgICAgIHlMLCB5eixcbiAgICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXG4gICAgICAgIHNpZ24gPSB4LnMgPT0geS5zID8gMSA6IC0xLFxuICAgICAgICB4ZCA9IHguZCxcbiAgICAgICAgeWQgPSB5LmQ7XG5cbiAgICAgIC8vIEVpdGhlciBOYU4sIEluZmluaXR5IG9yIDA/XG4gICAgICBpZiAoIXhkIHx8ICF4ZFswXSB8fCAheWQgfHwgIXlkWzBdKSB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBDdG9yKC8vIFJldHVybiBOYU4gaWYgZWl0aGVyIE5hTiwgb3IgYm90aCBJbmZpbml0eSBvciAwLlxuICAgICAgICAgICF4LnMgfHwgIXkucyB8fCAoeGQgPyB5ZCAmJiB4ZFswXSA9PSB5ZFswXSA6ICF5ZCkgPyBOYU4gOlxuXG4gICAgICAgICAgICAvLyBSZXR1cm4gwrEwIGlmIHggaXMgMCBvciB5IGlzIMKxSW5maW5pdHksIG9yIHJldHVybiDCsUluZmluaXR5IGFzIHkgaXMgMC5cbiAgICAgICAgICB4ZCAmJiB4ZFswXSA9PSAwIHx8ICF5ZCA/IHNpZ24gKiAwIDogc2lnbiAvIDApO1xuICAgICAgfVxuXG4gICAgICBpZiAoYmFzZSkge1xuICAgICAgICBsb2dCYXNlID0gMTtcbiAgICAgICAgZSA9IHguZSAtIHkuZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJhc2UgPSBCQVNFO1xuICAgICAgICBsb2dCYXNlID0gTE9HX0JBU0U7XG4gICAgICAgIGUgPSBtYXRoZmxvb3IoeC5lIC8gbG9nQmFzZSkgLSBtYXRoZmxvb3IoeS5lIC8gbG9nQmFzZSk7XG4gICAgICB9XG5cbiAgICAgIHlMID0geWQubGVuZ3RoO1xuICAgICAgeEwgPSB4ZC5sZW5ndGg7XG4gICAgICBxID0gbmV3IEN0b3Ioc2lnbik7XG4gICAgICBxZCA9IHEuZCA9IFtdO1xuXG4gICAgICAvLyBSZXN1bHQgZXhwb25lbnQgbWF5IGJlIG9uZSBsZXNzIHRoYW4gZS5cbiAgICAgIC8vIFRoZSBkaWdpdCBhcnJheSBvZiBhIERlY2ltYWwgZnJvbSB0b1N0cmluZ0JpbmFyeSBtYXkgaGF2ZSB0cmFpbGluZyB6ZXJvcy5cbiAgICAgIGZvciAoaSA9IDA7IHlkW2ldID09ICh4ZFtpXSB8fCAwKTsgaSsrKTtcblxuICAgICAgaWYgKHlkW2ldID4gKHhkW2ldIHx8IDApKSBlLS07XG5cbiAgICAgIGlmIChwciA9PSBudWxsKSB7XG4gICAgICAgIHNkID0gcHIgPSBDdG9yLnByZWNpc2lvbjtcbiAgICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xuICAgICAgfSBlbHNlIGlmIChkcCkge1xuICAgICAgICBzZCA9IHByICsgKHguZSAtIHkuZSkgKyAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2QgPSBwcjtcbiAgICAgIH1cblxuICAgICAgaWYgKHNkIDwgMCkge1xuICAgICAgICBxZC5wdXNoKDEpO1xuICAgICAgICBtb3JlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gQ29udmVydCBwcmVjaXNpb24gaW4gbnVtYmVyIG9mIGJhc2UgMTAgZGlnaXRzIHRvIGJhc2UgMWU3IGRpZ2l0cy5cbiAgICAgICAgc2QgPSBzZCAvIGxvZ0Jhc2UgKyAyIHwgMDtcbiAgICAgICAgaSA9IDA7XG5cbiAgICAgICAgLy8gZGl2aXNvciA8IDFlN1xuICAgICAgICBpZiAoeUwgPT0gMSkge1xuICAgICAgICAgIGsgPSAwO1xuICAgICAgICAgIHlkID0geWRbMF07XG4gICAgICAgICAgc2QrKztcblxuICAgICAgICAgIC8vIGsgaXMgdGhlIGNhcnJ5LlxuICAgICAgICAgIGZvciAoOyAoaSA8IHhMIHx8IGspICYmIHNkLS07IGkrKykge1xuICAgICAgICAgICAgdCA9IGsgKiBiYXNlICsgKHhkW2ldIHx8IDApO1xuICAgICAgICAgICAgcWRbaV0gPSB0IC8geWQgfCAwO1xuICAgICAgICAgICAgayA9IHQgJSB5ZCB8IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbW9yZSA9IGsgfHwgaSA8IHhMO1xuXG4gICAgICAgICAgLy8gZGl2aXNvciA+PSAxZTdcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIC8vIE5vcm1hbGlzZSB4ZCBhbmQgeWQgc28gaGlnaGVzdCBvcmRlciBkaWdpdCBvZiB5ZCBpcyA+PSBiYXNlLzJcbiAgICAgICAgICBrID0gYmFzZSAvICh5ZFswXSArIDEpIHwgMDtcblxuICAgICAgICAgIGlmIChrID4gMSkge1xuICAgICAgICAgICAgeWQgPSBtdWx0aXBseUludGVnZXIoeWQsIGssIGJhc2UpO1xuICAgICAgICAgICAgeGQgPSBtdWx0aXBseUludGVnZXIoeGQsIGssIGJhc2UpO1xuICAgICAgICAgICAgeUwgPSB5ZC5sZW5ndGg7XG4gICAgICAgICAgICB4TCA9IHhkLmxlbmd0aDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB4aSA9IHlMO1xuICAgICAgICAgIHJlbSA9IHhkLnNsaWNlKDAsIHlMKTtcbiAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcblxuICAgICAgICAgIC8vIEFkZCB6ZXJvcyB0byBtYWtlIHJlbWFpbmRlciBhcyBsb25nIGFzIGRpdmlzb3IuXG4gICAgICAgICAgZm9yICg7IHJlbUwgPCB5TDspIHJlbVtyZW1MKytdID0gMDtcblxuICAgICAgICAgIHl6ID0geWQuc2xpY2UoKTtcbiAgICAgICAgICB5ei51bnNoaWZ0KDApO1xuICAgICAgICAgIHlkMCA9IHlkWzBdO1xuXG4gICAgICAgICAgaWYgKHlkWzFdID49IGJhc2UgLyAyKSArK3lkMDtcblxuICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgIGsgPSAwO1xuXG4gICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cbiAgICAgICAgICAgIGNtcCA9IGNvbXBhcmUoeWQsIHJlbSwgeUwsIHJlbUwpO1xuXG4gICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLlxuICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcblxuICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdHJpYWwgZGlnaXQsIGsuXG4gICAgICAgICAgICAgIHJlbTAgPSByZW1bMF07XG4gICAgICAgICAgICAgIGlmICh5TCAhPSByZW1MKSByZW0wID0gcmVtMCAqIGJhc2UgKyAocmVtWzFdIHx8IDApO1xuXG4gICAgICAgICAgICAgIC8vIGsgd2lsbCBiZSBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gdGhlIGN1cnJlbnQgcmVtYWluZGVyLlxuICAgICAgICAgICAgICBrID0gcmVtMCAvIHlkMCB8IDA7XG5cbiAgICAgICAgICAgICAgLy8gIEFsZ29yaXRobTpcbiAgICAgICAgICAgICAgLy8gIDEuIHByb2R1Y3QgPSBkaXZpc29yICogdHJpYWwgZGlnaXQgKGspXG4gICAgICAgICAgICAgIC8vICAyLiBpZiBwcm9kdWN0ID4gcmVtYWluZGVyOiBwcm9kdWN0IC09IGRpdmlzb3IsIGstLVxuICAgICAgICAgICAgICAvLyAgMy4gcmVtYWluZGVyIC09IHByb2R1Y3RcbiAgICAgICAgICAgICAgLy8gIDQuIGlmIHByb2R1Y3Qgd2FzIDwgcmVtYWluZGVyIGF0IDI6XG4gICAgICAgICAgICAgIC8vICAgIDUuIGNvbXBhcmUgbmV3IHJlbWFpbmRlciBhbmQgZGl2aXNvclxuICAgICAgICAgICAgICAvLyAgICA2LiBJZiByZW1haW5kZXIgPiBkaXZpc29yOiByZW1haW5kZXIgLT0gZGl2aXNvciwgaysrXG5cbiAgICAgICAgICAgICAgaWYgKGsgPiAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGsgPj0gYmFzZSkgayA9IGJhc2UgLSAxO1xuXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjdCA9IGRpdmlzb3IgKiB0cmlhbCBkaWdpdC5cbiAgICAgICAgICAgICAgICBwcm9kID0gbXVsdGlwbHlJbnRlZ2VyKHlkLCBrLCBiYXNlKTtcbiAgICAgICAgICAgICAgICBwcm9kTCA9IHByb2QubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBwcm9kdWN0IGFuZCByZW1haW5kZXIuXG4gICAgICAgICAgICAgICAgY21wID0gY29tcGFyZShwcm9kLCByZW0sIHByb2RMLCByZW1MKTtcblxuICAgICAgICAgICAgICAgIC8vIHByb2R1Y3QgPiByZW1haW5kZXIuXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICBrLS07XG5cbiAgICAgICAgICAgICAgICAgIC8vIFN1YnRyYWN0IGRpdmlzb3IgZnJvbSBwcm9kdWN0LlxuICAgICAgICAgICAgICAgICAgc3VidHJhY3QocHJvZCwgeUwgPCBwcm9kTCA/IHl6IDogeWQsIHByb2RMLCBiYXNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjbXAgaXMgLTEuXG4gICAgICAgICAgICAgICAgLy8gSWYgayBpcyAwLCB0aGVyZSBpcyBubyBuZWVkIHRvIGNvbXBhcmUgeWQgYW5kIHJlbSBhZ2FpbiBiZWxvdywgc28gY2hhbmdlIGNtcCB0byAxXG4gICAgICAgICAgICAgICAgLy8gdG8gYXZvaWQgaXQuIElmIGsgaXMgMSB0aGVyZSBpcyBhIG5lZWQgdG8gY29tcGFyZSB5ZCBhbmQgcmVtIGFnYWluIGJlbG93LlxuICAgICAgICAgICAgICAgIGlmIChrID09IDApIGNtcCA9IGsgPSAxO1xuICAgICAgICAgICAgICAgIHByb2QgPSB5ZC5zbGljZSgpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcbiAgICAgICAgICAgICAgaWYgKHByb2RMIDwgcmVtTCkgcHJvZC51bnNoaWZ0KDApO1xuXG4gICAgICAgICAgICAgIC8vIFN1YnRyYWN0IHByb2R1Y3QgZnJvbSByZW1haW5kZXIuXG4gICAgICAgICAgICAgIHN1YnRyYWN0KHJlbSwgcHJvZCwgcmVtTCwgYmFzZSk7XG5cbiAgICAgICAgICAgICAgLy8gSWYgcHJvZHVjdCB3YXMgPCBwcmV2aW91cyByZW1haW5kZXIuXG4gICAgICAgICAgICAgIGlmIChjbXAgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgbmV3IHJlbWFpbmRlci5cbiAgICAgICAgICAgICAgICBjbXAgPSBjb21wYXJlKHlkLCByZW0sIHlMLCByZW1MKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCBuZXcgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxuICAgICAgICAgICAgICAgIGlmIChjbXAgPCAxKSB7XG4gICAgICAgICAgICAgICAgICBrKys7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXG4gICAgICAgICAgICAgICAgICBzdWJ0cmFjdChyZW0sIHlMIDwgcmVtTCA/IHl6IDogeWQsIHJlbUwsIGJhc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjbXAgPT09IDApIHtcbiAgICAgICAgICAgICAgaysrO1xuICAgICAgICAgICAgICByZW0gPSBbMF07XG4gICAgICAgICAgICB9ICAgIC8vIGlmIGNtcCA9PT0gMSwgayB3aWxsIGJlIDBcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBuZXh0IGRpZ2l0LCBrLCB0byB0aGUgcmVzdWx0IGFycmF5LlxuICAgICAgICAgICAgcWRbaSsrXSA9IGs7XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxuICAgICAgICAgICAgaWYgKGNtcCAmJiByZW1bMF0pIHtcbiAgICAgICAgICAgICAgcmVtW3JlbUwrK10gPSB4ZFt4aV0gfHwgMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlbSA9IFt4ZFt4aV1dO1xuICAgICAgICAgICAgICByZW1MID0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gd2hpbGUgKCh4aSsrIDwgeEwgfHwgcmVtWzBdICE9PSB2b2lkIDApICYmIHNkLS0pO1xuXG4gICAgICAgICAgbW9yZSA9IHJlbVswXSAhPT0gdm9pZCAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGVhZGluZyB6ZXJvP1xuICAgICAgICBpZiAoIXFkWzBdKSBxZC5zaGlmdCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBsb2dCYXNlIGlzIDEgd2hlbiBkaXZpZGUgaXMgYmVpbmcgdXNlZCBmb3IgYmFzZSBjb252ZXJzaW9uLlxuICAgICAgaWYgKGxvZ0Jhc2UgPT0gMSkge1xuICAgICAgICBxLmUgPSBlO1xuICAgICAgICBpbmV4YWN0ID0gbW9yZTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gVG8gY2FsY3VsYXRlIHEuZSwgZmlyc3QgZ2V0IHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIHFkWzBdLlxuICAgICAgICBmb3IgKGkgPSAxLCBrID0gcWRbMF07IGsgPj0gMTA7IGsgLz0gMTApIGkrKztcbiAgICAgICAgcS5lID0gaSArIGUgKiBsb2dCYXNlIC0gMTtcblxuICAgICAgICBmaW5hbGlzZShxLCBkcCA/IHByICsgcS5lICsgMSA6IHByLCBybSwgbW9yZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBxO1xuICAgIH07XG4gIH0pKCk7XG5cblxuICAvKlxuICAgKiBSb3VuZCBgeGAgdG8gYHNkYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm1gLlxuICAgKiBDaGVjayBmb3Igb3Zlci91bmRlci1mbG93LlxuICAgKi9cbiAgZnVuY3Rpb24gZmluYWxpc2UoeCwgc2QsIHJtLCBpc1RydW5jYXRlZCkge1xuICAgIHZhciBkaWdpdHMsIGksIGosIGssIHJkLCByb3VuZFVwLCB3LCB4ZCwgeGRpLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XG5cbiAgICAvLyBEb24ndCByb3VuZCBpZiBzZCBpcyBudWxsIG9yIHVuZGVmaW5lZC5cbiAgICBvdXQ6IGlmIChzZCAhPSBudWxsKSB7XG4gICAgICB4ZCA9IHguZDtcblxuICAgICAgLy8gSW5maW5pdHkvTmFOLlxuICAgICAgaWYgKCF4ZCkgcmV0dXJuIHg7XG5cbiAgICAgIC8vIHJkOiB0aGUgcm91bmRpbmcgZGlnaXQsIGkuZS4gdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxuICAgICAgLy8gdzogdGhlIHdvcmQgb2YgeGQgY29udGFpbmluZyByZCwgYSBiYXNlIDFlNyBudW1iZXIuXG4gICAgICAvLyB4ZGk6IHRoZSBpbmRleCBvZiB3IHdpdGhpbiB4ZC5cbiAgICAgIC8vIGRpZ2l0czogdGhlIG51bWJlciBvZiBkaWdpdHMgb2Ygdy5cbiAgICAgIC8vIGk6IHdoYXQgd291bGQgYmUgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiB3IGlmIGFsbCB0aGUgbnVtYmVycyB3ZXJlIDcgZGlnaXRzIGxvbmcgKGkuZS4gaWZcbiAgICAgIC8vIHRoZXkgaGFkIGxlYWRpbmcgemVyb3MpXG4gICAgICAvLyBqOiBpZiA+IDAsIHRoZSBhY3R1YWwgaW5kZXggb2YgcmQgd2l0aGluIHcgKGlmIDwgMCwgcmQgaXMgYSBsZWFkaW5nIHplcm8pLlxuXG4gICAgICAvLyBHZXQgdGhlIGxlbmd0aCBvZiB0aGUgZmlyc3Qgd29yZCBvZiB0aGUgZGlnaXRzIGFycmF5IHhkLlxuICAgICAgZm9yIChkaWdpdHMgPSAxLCBrID0geGRbMF07IGsgPj0gMTA7IGsgLz0gMTApIGRpZ2l0cysrO1xuICAgICAgaSA9IHNkIC0gZGlnaXRzO1xuXG4gICAgICAvLyBJcyB0aGUgcm91bmRpbmcgZGlnaXQgaW4gdGhlIGZpcnN0IHdvcmQgb2YgeGQ/XG4gICAgICBpZiAoaSA8IDApIHtcbiAgICAgICAgaSArPSBMT0dfQkFTRTtcbiAgICAgICAgaiA9IHNkO1xuICAgICAgICB3ID0geGRbeGRpID0gMF07XG5cbiAgICAgICAgLy8gR2V0IHRoZSByb3VuZGluZyBkaWdpdCBhdCBpbmRleCBqIG9mIHcuXG4gICAgICAgIHJkID0gdyAvIG1hdGhwb3coMTAsIGRpZ2l0cyAtIGogLSAxKSAlIDEwIHwgMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHhkaSA9IE1hdGguY2VpbCgoaSArIDEpIC8gTE9HX0JBU0UpO1xuICAgICAgICBrID0geGQubGVuZ3RoO1xuICAgICAgICBpZiAoeGRpID49IGspIHtcbiAgICAgICAgICBpZiAoaXNUcnVuY2F0ZWQpIHtcblxuICAgICAgICAgICAgLy8gTmVlZGVkIGJ5IGBuYXR1cmFsRXhwb25lbnRpYWxgLCBgbmF0dXJhbExvZ2FyaXRobWAgYW5kIGBzcXVhcmVSb290YC5cbiAgICAgICAgICAgIGZvciAoOyBrKysgPD0geGRpOykgeGQucHVzaCgwKTtcbiAgICAgICAgICAgIHcgPSByZCA9IDA7XG4gICAgICAgICAgICBkaWdpdHMgPSAxO1xuICAgICAgICAgICAgaSAlPSBMT0dfQkFTRTtcbiAgICAgICAgICAgIGogPSBpIC0gTE9HX0JBU0UgKyAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhayBvdXQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHcgPSBrID0geGRbeGRpXTtcblxuICAgICAgICAgIC8vIEdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiB3LlxuICAgICAgICAgIGZvciAoZGlnaXRzID0gMTsgayA+PSAxMDsgayAvPSAxMCkgZGlnaXRzKys7XG5cbiAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiB3LlxuICAgICAgICAgIGkgJT0gTE9HX0JBU0U7XG5cbiAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiB3LCBhZGp1c3RlZCBmb3IgbGVhZGluZyB6ZXJvcy5cbiAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGxlYWRpbmcgemVyb3Mgb2YgdyBpcyBnaXZlbiBieSBMT0dfQkFTRSAtIGRpZ2l0cy5cbiAgICAgICAgICBqID0gaSAtIExPR19CQVNFICsgZGlnaXRzO1xuXG4gICAgICAgICAgLy8gR2V0IHRoZSByb3VuZGluZyBkaWdpdCBhdCBpbmRleCBqIG9mIHcuXG4gICAgICAgICAgcmQgPSBqIDwgMCA/IDAgOiB3IC8gbWF0aHBvdygxMCwgZGlnaXRzIC0gaiAtIDEpICUgMTAgfCAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFyZSB0aGVyZSBhbnkgbm9uLXplcm8gZGlnaXRzIGFmdGVyIHRoZSByb3VuZGluZyBkaWdpdD9cbiAgICAgIGlzVHJ1bmNhdGVkID0gaXNUcnVuY2F0ZWQgfHwgc2QgPCAwIHx8XG4gICAgICAgICAgICAgICAgICAgIHhkW3hkaSArIDFdICE9PSB2b2lkIDAgfHwgKGogPCAwID8gdyA6IHcgJSBtYXRocG93KDEwLCBkaWdpdHMgLSBqIC0gMSkpO1xuXG4gICAgICAvLyBUaGUgZXhwcmVzc2lvbiBgdyAlIG1hdGhwb3coMTAsIGRpZ2l0cyAtIGogLSAxKWAgcmV0dXJucyBhbGwgdGhlIGRpZ2l0cyBvZiB3IHRvIHRoZSByaWdodFxuICAgICAgLy8gb2YgdGhlIGRpZ2l0IGF0IChsZWZ0LXRvLXJpZ2h0KSBpbmRleCBqLCBlLmcuIGlmIHcgaXMgOTA4NzE0IGFuZCBqIGlzIDIsIHRoZSBleHByZXNzaW9uXG4gICAgICAvLyB3aWxsIGdpdmUgNzE0LlxuXG4gICAgICByb3VuZFVwID0gcm0gPCA0XG4gICAgICAgICAgICAgICAgPyAocmQgfHwgaXNUcnVuY2F0ZWQpICYmIChybSA9PSAwIHx8IHJtID09ICh4LnMgPCAwID8gMyA6IDIpKVxuICAgICAgICAgICAgICAgIDogcmQgPiA1IHx8IHJkID09IDUgJiYgKHJtID09IDQgfHwgaXNUcnVuY2F0ZWQgfHwgcm0gPT0gNiAmJlxuXG4gICAgICAgICAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBkaWdpdCB0byB0aGUgbGVmdCBvZiB0aGUgcm91bmRpbmcgZGlnaXQgaXMgb2RkLlxuICAgICAgICAgICAgICAgICAgKChpID4gMCA/IGogPiAwID8gdyAvIG1hdGhwb3coMTAsIGRpZ2l0cyAtIGopIDogMCA6IHhkW3hkaSAtIDFdKSAlIDEwKSAmIDEgfHxcbiAgICAgICAgICAgICAgICAgIHJtID09ICh4LnMgPCAwID8gOCA6IDcpKTtcblxuICAgICAgaWYgKHNkIDwgMSB8fCAheGRbMF0pIHtcbiAgICAgICAgeGQubGVuZ3RoID0gMDtcbiAgICAgICAgaWYgKHJvdW5kVXApIHtcblxuICAgICAgICAgIC8vIENvbnZlcnQgc2QgdG8gZGVjaW1hbCBwbGFjZXMuXG4gICAgICAgICAgc2QgLT0geC5lICsgMTtcblxuICAgICAgICAgIC8vIDEsIDAuMSwgMC4wMSwgMC4wMDEsIDAuMDAwMSBldGMuXG4gICAgICAgICAgeGRbMF0gPSBtYXRocG93KDEwLCAoTE9HX0JBU0UgLSBzZCAlIExPR19CQVNFKSAlIExPR19CQVNFKTtcbiAgICAgICAgICB4LmUgPSAtc2QgfHwgMDtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIC8vIFplcm8uXG4gICAgICAgICAgeGRbMF0gPSB4LmUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHg7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSBleGNlc3MgZGlnaXRzLlxuICAgICAgaWYgKGkgPT0gMCkge1xuICAgICAgICB4ZC5sZW5ndGggPSB4ZGk7XG4gICAgICAgIGsgPSAxO1xuICAgICAgICB4ZGktLTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHhkLmxlbmd0aCA9IHhkaSArIDE7XG4gICAgICAgIGsgPSBtYXRocG93KDEwLCBMT0dfQkFTRSAtIGkpO1xuXG4gICAgICAgIC8vIEUuZy4gNTY3MDAgYmVjb21lcyA1NjAwMCBpZiA3IGlzIHRoZSByb3VuZGluZyBkaWdpdC5cbiAgICAgICAgLy8gaiA+IDAgbWVhbnMgaSA+IG51bWJlciBvZiBsZWFkaW5nIHplcm9zIG9mIHcuXG4gICAgICAgIHhkW3hkaV0gPSBqID4gMCA/ICh3IC8gbWF0aHBvdygxMCwgZGlnaXRzIC0gaikgJSBtYXRocG93KDEwLCBqKSB8IDApICogayA6IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChyb3VuZFVwKSB7XG4gICAgICAgIGZvciAoOzspIHtcblxuICAgICAgICAgIC8vIElzIHRoZSBkaWdpdCB0byBiZSByb3VuZGVkIHVwIGluIHRoZSBmaXJzdCB3b3JkIG9mIHhkP1xuICAgICAgICAgIGlmICh4ZGkgPT0gMCkge1xuXG4gICAgICAgICAgICAvLyBpIHdpbGwgYmUgdGhlIGxlbmd0aCBvZiB4ZFswXSBiZWZvcmUgayBpcyBhZGRlZC5cbiAgICAgICAgICAgIGZvciAoaSA9IDEsIGogPSB4ZFswXTsgaiA+PSAxMDsgaiAvPSAxMCkgaSsrO1xuICAgICAgICAgICAgaiA9IHhkWzBdICs9IGs7XG4gICAgICAgICAgICBmb3IgKGsgPSAxOyBqID49IDEwOyBqIC89IDEwKSBrKys7XG5cbiAgICAgICAgICAgIC8vIGlmIGkgIT0gayB0aGUgbGVuZ3RoIGhhcyBpbmNyZWFzZWQuXG4gICAgICAgICAgICBpZiAoaSAhPSBrKSB7XG4gICAgICAgICAgICAgIHguZSsrO1xuICAgICAgICAgICAgICBpZiAoeGRbMF0gPT0gQkFTRSkgeGRbMF0gPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeGRbeGRpXSArPSBrO1xuICAgICAgICAgICAgaWYgKHhkW3hkaV0gIT0gQkFTRSkgYnJlYWs7XG4gICAgICAgICAgICB4ZFt4ZGktLV0gPSAwO1xuICAgICAgICAgICAgayA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cbiAgICAgIGZvciAoaSA9IHhkLmxlbmd0aDsgeGRbLS1pXSA9PT0gMDspIHhkLnBvcCgpO1xuICAgIH1cblxuICAgIGlmIChleHRlcm5hbCkge1xuXG4gICAgICAvLyBPdmVyZmxvdz9cbiAgICAgIGlmICh4LmUgPiBDdG9yLm1heEUpIHtcblxuICAgICAgICAvLyBJbmZpbml0eS5cbiAgICAgICAgeC5kID0gbnVsbDtcbiAgICAgICAgeC5lID0gTmFOO1xuXG4gICAgICAgIC8vIFVuZGVyZmxvdz9cbiAgICAgIH0gZWxzZSBpZiAoeC5lIDwgQ3Rvci5taW5FKSB7XG5cbiAgICAgICAgLy8gWmVyby5cbiAgICAgICAgeC5lID0gMDtcbiAgICAgICAgeC5kID0gWzBdO1xuICAgICAgICAvLyBDdG9yLnVuZGVyZmxvdyA9IHRydWU7XG4gICAgICB9IC8vIGVsc2UgQ3Rvci51bmRlcmZsb3cgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4geDtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gZmluaXRlVG9TdHJpbmcoeCwgaXNFeHAsIHNkKSB7XG4gICAgaWYgKCF4LmlzRmluaXRlKCkpIHJldHVybiBub25GaW5pdGVUb1N0cmluZyh4KTtcbiAgICB2YXIgayxcbiAgICAgIGUgPSB4LmUsXG4gICAgICBzdHIgPSBkaWdpdHNUb1N0cmluZyh4LmQpLFxuICAgICAgbGVuID0gc3RyLmxlbmd0aDtcblxuICAgIGlmIChpc0V4cCkge1xuICAgICAgaWYgKHNkICYmIChrID0gc2QgLSBsZW4pID4gMCkge1xuICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpICsgZ2V0WmVyb1N0cmluZyhrKTtcbiAgICAgIH0gZWxzZSBpZiAobGVuID4gMSkge1xuICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpO1xuICAgICAgfVxuXG4gICAgICBzdHIgPSBzdHIgKyAoeC5lIDwgMCA/ICdlJyA6ICdlKycpICsgeC5lO1xuICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcbiAgICAgIHN0ciA9ICcwLicgKyBnZXRaZXJvU3RyaW5nKC1lIC0gMSkgKyBzdHI7XG4gICAgICBpZiAoc2QgJiYgKGsgPSBzZCAtIGxlbikgPiAwKSBzdHIgKz0gZ2V0WmVyb1N0cmluZyhrKTtcbiAgICB9IGVsc2UgaWYgKGUgPj0gbGVuKSB7XG4gICAgICBzdHIgKz0gZ2V0WmVyb1N0cmluZyhlICsgMSAtIGxlbik7XG4gICAgICBpZiAoc2QgJiYgKGsgPSBzZCAtIGUgLSAxKSA+IDApIHN0ciA9IHN0ciArICcuJyArIGdldFplcm9TdHJpbmcoayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgoayA9IGUgKyAxKSA8IGxlbikgc3RyID0gc3RyLnNsaWNlKDAsIGspICsgJy4nICsgc3RyLnNsaWNlKGspO1xuICAgICAgaWYgKHNkICYmIChrID0gc2QgLSBsZW4pID4gMCkge1xuICAgICAgICBpZiAoZSArIDEgPT09IGxlbikgc3RyICs9ICcuJztcbiAgICAgICAgc3RyICs9IGdldFplcm9TdHJpbmcoayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cjtcbiAgfVxuXG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBiYXNlIDEwIGV4cG9uZW50IGZyb20gdGhlIGJhc2UgMWU3IGV4cG9uZW50LlxuICBmdW5jdGlvbiBnZXRCYXNlMTBFeHBvbmVudChkaWdpdHMsIGUpIHtcbiAgICB2YXIgdyA9IGRpZ2l0c1swXTtcblxuICAgIC8vIEFkZCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiB0aGUgZmlyc3Qgd29yZCBvZiB0aGUgZGlnaXRzIGFycmF5LlxuICAgIGZvciAoIGUgKj0gTE9HX0JBU0U7IHcgPj0gMTA7IHcgLz0gMTApIGUrKztcbiAgICByZXR1cm4gZTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gZ2V0TG4xMChDdG9yLCBzZCwgcHIpIHtcbiAgICBpZiAoc2QgPiBMTjEwX1BSRUNJU0lPTikge1xuXG4gICAgICAvLyBSZXNldCBnbG9iYWwgc3RhdGUgaW4gY2FzZSB0aGUgZXhjZXB0aW9uIGlzIGNhdWdodC5cbiAgICAgIGV4dGVybmFsID0gdHJ1ZTtcbiAgICAgIGlmIChwcikgQ3Rvci5wcmVjaXNpb24gPSBwcjtcbiAgICAgIHRocm93IEVycm9yKHByZWNpc2lvbkxpbWl0RXhjZWVkZWQpO1xuICAgIH1cbiAgICByZXR1cm4gZmluYWxpc2UobmV3IEN0b3IoTE4xMCksIHNkLCAxLCB0cnVlKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gZ2V0UGkoQ3Rvciwgc2QsIHJtKSB7XG4gICAgaWYgKHNkID4gUElfUFJFQ0lTSU9OKSB0aHJvdyBFcnJvcihwcmVjaXNpb25MaW1pdEV4Y2VlZGVkKTtcbiAgICByZXR1cm4gZmluYWxpc2UobmV3IEN0b3IoUEkpLCBzZCwgcm0sIHRydWUpO1xuICB9XG5cblxuICBmdW5jdGlvbiBnZXRQcmVjaXNpb24oZGlnaXRzKSB7XG4gICAgdmFyIHcgPSBkaWdpdHMubGVuZ3RoIC0gMSxcbiAgICAgIGxlbiA9IHcgKiBMT0dfQkFTRSArIDE7XG5cbiAgICB3ID0gZGlnaXRzW3ddO1xuXG4gICAgLy8gSWYgbm9uLXplcm8uLi5cbiAgICBpZiAodykge1xuXG4gICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IHdvcmQuXG4gICAgICBmb3IgKDsgdyAlIDEwID09IDA7IHcgLz0gMTApIGxlbi0tO1xuXG4gICAgICAvLyBBZGQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIGZpcnN0IHdvcmQuXG4gICAgICBmb3IgKHcgPSBkaWdpdHNbMF07IHcgPj0gMTA7IHcgLz0gMTApIGxlbisrO1xuICAgIH1cblxuICAgIHJldHVybiBsZW47XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGdldFplcm9TdHJpbmcoaykge1xuICAgIHZhciB6cyA9ICcnO1xuICAgIGZvciAoOyBrLS07KSB6cyArPSAnMCc7XG4gICAgcmV0dXJuIHpzO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgRGVjaW1hbCBgeGAgdG8gdGhlIHBvd2VyIGBuYCwgd2hlcmUgYG5gIGlzIGFuXG4gICAqIGludGVnZXIgb2YgdHlwZSBudW1iZXIuXG4gICAqXG4gICAqIEltcGxlbWVudHMgJ2V4cG9uZW50aWF0aW9uIGJ5IHNxdWFyaW5nJy4gQ2FsbGVkIGJ5IGBwb3dgIGFuZCBgcGFyc2VPdGhlcmAuXG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBpbnRQb3coQ3RvciwgeCwgbiwgcHIpIHtcbiAgICB2YXIgaXNUcnVuY2F0ZWQsXG4gICAgICByID0gbmV3IEN0b3IoMSksXG5cbiAgICAgIC8vIE1heCBuIG9mIDkwMDcxOTkyNTQ3NDA5OTEgdGFrZXMgNTMgbG9vcCBpdGVyYXRpb25zLlxuICAgICAgLy8gTWF4aW11bSBkaWdpdHMgYXJyYXkgbGVuZ3RoOyBsZWF2ZXMgWzI4LCAzNF0gZ3VhcmQgZGlnaXRzLlxuICAgICAgayA9IE1hdGguY2VpbChwciAvIExPR19CQVNFICsgNCk7XG5cbiAgICBleHRlcm5hbCA9IGZhbHNlO1xuXG4gICAgZm9yICg7Oykge1xuICAgICAgaWYgKG4gJSAyKSB7XG4gICAgICAgIHIgPSByLnRpbWVzKHgpO1xuICAgICAgICBpZiAodHJ1bmNhdGUoci5kLCBrKSkgaXNUcnVuY2F0ZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBuID0gbWF0aGZsb29yKG4gLyAyKTtcbiAgICAgIGlmIChuID09PSAwKSB7XG5cbiAgICAgICAgLy8gVG8gZW5zdXJlIGNvcnJlY3Qgcm91bmRpbmcgd2hlbiByLmQgaXMgdHJ1bmNhdGVkLCBpbmNyZW1lbnQgdGhlIGxhc3Qgd29yZCBpZiBpdCBpcyB6ZXJvLlxuICAgICAgICBuID0gci5kLmxlbmd0aCAtIDE7XG4gICAgICAgIGlmIChpc1RydW5jYXRlZCAmJiByLmRbbl0gPT09IDApICsrci5kW25dO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgeCA9IHgudGltZXMoeCk7XG4gICAgICB0cnVuY2F0ZSh4LmQsIGspO1xuICAgIH1cblxuICAgIGV4dGVybmFsID0gdHJ1ZTtcblxuICAgIHJldHVybiByO1xuICB9XG5cblxuICBmdW5jdGlvbiBpc09kZChuKSB7XG4gICAgcmV0dXJuIG4uZFtuLmQubGVuZ3RoIC0gMV0gJiAxO1xuICB9XG5cblxuICAvKlxuICAgKiBIYW5kbGUgYG1heGAgYW5kIGBtaW5gLiBgbHRndGAgaXMgJ2x0JyBvciAnZ3QnLlxuICAgKi9cbiAgZnVuY3Rpb24gbWF4T3JNaW4oQ3RvciwgYXJncywgbHRndCkge1xuICAgIHZhciB5LFxuICAgICAgeCA9IG5ldyBDdG9yKGFyZ3NbMF0pLFxuICAgICAgaSA9IDA7XG5cbiAgICBmb3IgKDsgKytpIDwgYXJncy5sZW5ndGg7KSB7XG4gICAgICB5ID0gbmV3IEN0b3IoYXJnc1tpXSk7XG4gICAgICBpZiAoIXkucykge1xuICAgICAgICB4ID0geTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKHhbbHRndF0oeSkpIHtcbiAgICAgICAgeCA9IHk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHg7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBuYXR1cmFsIGV4cG9uZW50aWFsIG9mIGB4YCByb3VuZGVkIHRvIGBzZGAgc2lnbmlmaWNhbnRcbiAgICogZGlnaXRzLlxuICAgKlxuICAgKiBUYXlsb3IvTWFjbGF1cmluIHNlcmllcy5cbiAgICpcbiAgICogZXhwKHgpID0geF4wLzAhICsgeF4xLzEhICsgeF4yLzIhICsgeF4zLzMhICsgLi4uXG4gICAqXG4gICAqIEFyZ3VtZW50IHJlZHVjdGlvbjpcbiAgICogICBSZXBlYXQgeCA9IHggLyAzMiwgayArPSA1LCB1bnRpbCB8eHwgPCAwLjFcbiAgICogICBleHAoeCkgPSBleHAoeCAvIDJeayleKDJeaylcbiAgICpcbiAgICogUHJldmlvdXNseSwgdGhlIGFyZ3VtZW50IHdhcyBpbml0aWFsbHkgcmVkdWNlZCBieVxuICAgKiBleHAoeCkgPSBleHAocikgKiAxMF5rICB3aGVyZSByID0geCAtIGsgKiBsbjEwLCBrID0gZmxvb3IoeCAvIGxuMTApXG4gICAqIHRvIGZpcnN0IHB1dCByIGluIHRoZSByYW5nZSBbMCwgbG4xMF0sIGJlZm9yZSBkaXZpZGluZyBieSAzMiB1bnRpbCB8eHwgPCAwLjEsIGJ1dCB0aGlzIHdhc1xuICAgKiBmb3VuZCB0byBiZSBzbG93ZXIgdGhhbiBqdXN0IGRpdmlkaW5nIHJlcGVhdGVkbHkgYnkgMzIgYXMgYWJvdmUuXG4gICAqXG4gICAqIE1heCBpbnRlZ2VyIGFyZ3VtZW50OiBleHAoJzIwNzIzMjY1ODM2OTQ2NDEzJykgPSA2LjNlKzkwMDAwMDAwMDAwMDAwMDBcbiAgICogTWluIGludGVnZXIgYXJndW1lbnQ6IGV4cCgnLTIwNzIzMjY1ODM2OTQ2NDExJykgPSAxLjJlLTkwMDAwMDAwMDAwMDAwMDBcbiAgICogKE1hdGggb2JqZWN0IGludGVnZXIgbWluL21heDogTWF0aC5leHAoNzA5KSA9IDguMmUrMzA3LCBNYXRoLmV4cCgtNzQ1KSA9IDVlLTMyNClcbiAgICpcbiAgICogIGV4cChJbmZpbml0eSkgID0gSW5maW5pdHlcbiAgICogIGV4cCgtSW5maW5pdHkpID0gMFxuICAgKiAgZXhwKE5hTikgICAgICAgPSBOYU5cbiAgICogIGV4cCjCsTApICAgICAgICA9IDFcbiAgICpcbiAgICogIGV4cCh4KSBpcyBub24tdGVybWluYXRpbmcgZm9yIGFueSBmaW5pdGUsIG5vbi16ZXJvIHguXG4gICAqXG4gICAqICBUaGUgcmVzdWx0IHdpbGwgYWx3YXlzIGJlIGNvcnJlY3RseSByb3VuZGVkLlxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gbmF0dXJhbEV4cG9uZW50aWFsKHgsIHNkKSB7XG4gICAgdmFyIGRlbm9taW5hdG9yLCBndWFyZCwgaiwgcG93LCBzdW0sIHQsIHdwcixcbiAgICAgIHJlcCA9IDAsXG4gICAgICBpID0gMCxcbiAgICAgIGsgPSAwLFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXG4gICAgICBybSA9IEN0b3Iucm91bmRpbmcsXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xuXG4gICAgLy8gMC9OYU4vSW5maW5pdHk/XG4gICAgaWYgKCF4LmQgfHwgIXguZFswXSB8fCB4LmUgPiAxNykge1xuXG4gICAgICByZXR1cm4gbmV3IEN0b3IoeC5kXG4gICAgICAgICAgICAgICAgICAgICAgPyAheC5kWzBdID8gMSA6IHgucyA8IDAgPyAwIDogMSAvIDBcbiAgICAgICAgICAgICAgICAgICAgICA6IHgucyA/IHgucyA8IDAgPyAwIDogeCA6IDAgLyAwKTtcbiAgICB9XG5cbiAgICBpZiAoc2QgPT0gbnVsbCkge1xuICAgICAgZXh0ZXJuYWwgPSBmYWxzZTtcbiAgICAgIHdwciA9IHByO1xuICAgIH0gZWxzZSB7XG4gICAgICB3cHIgPSBzZDtcbiAgICB9XG5cbiAgICB0ID0gbmV3IEN0b3IoMC4wMzEyNSk7XG5cbiAgICAvLyB3aGlsZSBhYnMoeCkgPj0gMC4xXG4gICAgd2hpbGUgKHguZSA+IC0yKSB7XG5cbiAgICAgIC8vIHggPSB4IC8gMl41XG4gICAgICB4ID0geC50aW1lcyh0KTtcbiAgICAgIGsgKz0gNTtcbiAgICB9XG5cbiAgICAvLyBVc2UgMiAqIGxvZzEwKDJeaykgKyA1IChlbXBpcmljYWxseSBkZXJpdmVkKSB0byBlc3RpbWF0ZSB0aGUgaW5jcmVhc2UgaW4gcHJlY2lzaW9uXG4gICAgLy8gbmVjZXNzYXJ5IHRvIGVuc3VyZSB0aGUgZmlyc3QgNCByb3VuZGluZyBkaWdpdHMgYXJlIGNvcnJlY3QuXG4gICAgZ3VhcmQgPSBNYXRoLmxvZyhtYXRocG93KDIsIGspKSAvIE1hdGguTE4xMCAqIDIgKyA1IHwgMDtcbiAgICB3cHIgKz0gZ3VhcmQ7XG4gICAgZGVub21pbmF0b3IgPSBwb3cgPSBzdW0gPSBuZXcgQ3RvcigxKTtcbiAgICBDdG9yLnByZWNpc2lvbiA9IHdwcjtcblxuICAgIGZvciAoOzspIHtcbiAgICAgIHBvdyA9IGZpbmFsaXNlKHBvdy50aW1lcyh4KSwgd3ByLCAxKTtcbiAgICAgIGRlbm9taW5hdG9yID0gZGVub21pbmF0b3IudGltZXMoKytpKTtcbiAgICAgIHQgPSBzdW0ucGx1cyhkaXZpZGUocG93LCBkZW5vbWluYXRvciwgd3ByLCAxKSk7XG5cbiAgICAgIGlmIChkaWdpdHNUb1N0cmluZyh0LmQpLnNsaWNlKDAsIHdwcikgPT09IGRpZ2l0c1RvU3RyaW5nKHN1bS5kKS5zbGljZSgwLCB3cHIpKSB7XG4gICAgICAgIGogPSBrO1xuICAgICAgICB3aGlsZSAoai0tKSBzdW0gPSBmaW5hbGlzZShzdW0udGltZXMoc3VtKSwgd3ByLCAxKTtcblxuICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIGZpcnN0IDQgcm91bmRpbmcgZGlnaXRzIGFyZSBbNDldOTk5LlxuICAgICAgICAvLyBJZiBzbywgcmVwZWF0IHRoZSBzdW1tYXRpb24gd2l0aCBhIGhpZ2hlciBwcmVjaXNpb24sIG90aGVyd2lzZVxuICAgICAgICAvLyBlLmcuIHdpdGggcHJlY2lzaW9uOiAxOCwgcm91bmRpbmc6IDFcbiAgICAgICAgLy8gZXhwKDE4LjQwNDI3MjQ2MjU5NTAzNDA4MzU2Nzc5MzkxOTg0Mzc2MSkgPSA5ODM3MjU2MC4xMjI5OTk5OTk5IChzaG91bGQgYmUgOTgzNzI1NjAuMTIzKVxuICAgICAgICAvLyBgd3ByIC0gZ3VhcmRgIGlzIHRoZSBpbmRleCBvZiBmaXJzdCByb3VuZGluZyBkaWdpdC5cbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcblxuICAgICAgICAgIGlmIChyZXAgPCAzICYmIGNoZWNrUm91bmRpbmdEaWdpdHMoc3VtLmQsIHdwciAtIGd1YXJkLCBybSwgcmVwKSkge1xuICAgICAgICAgICAgQ3Rvci5wcmVjaXNpb24gPSB3cHIgKz0gMTA7XG4gICAgICAgICAgICBkZW5vbWluYXRvciA9IHBvdyA9IHQgPSBuZXcgQ3RvcigxKTtcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgcmVwKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmaW5hbGlzZShzdW0sIEN0b3IucHJlY2lzaW9uID0gcHIsIHJtLCBleHRlcm5hbCA9IHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xuICAgICAgICAgIHJldHVybiBzdW07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3VtID0gdDtcbiAgICB9XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBuYXR1cmFsIGxvZ2FyaXRobSBvZiBgeGAgcm91bmRlZCB0byBgc2RgIHNpZ25pZmljYW50XG4gICAqIGRpZ2l0cy5cbiAgICpcbiAgICogIGxuKC1uKSAgICAgICAgPSBOYU5cbiAgICogIGxuKDApICAgICAgICAgPSAtSW5maW5pdHlcbiAgICogIGxuKC0wKSAgICAgICAgPSAtSW5maW5pdHlcbiAgICogIGxuKDEpICAgICAgICAgPSAwXG4gICAqICBsbihJbmZpbml0eSkgID0gSW5maW5pdHlcbiAgICogIGxuKC1JbmZpbml0eSkgPSBOYU5cbiAgICogIGxuKE5hTikgICAgICAgPSBOYU5cbiAgICpcbiAgICogIGxuKG4pIChuICE9IDEpIGlzIG5vbi10ZXJtaW5hdGluZy5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIG5hdHVyYWxMb2dhcml0aG0oeSwgc2QpIHtcbiAgICB2YXIgYywgYzAsIGRlbm9taW5hdG9yLCBlLCBudW1lcmF0b3IsIHJlcCwgc3VtLCB0LCB3cHIsIHgxLCB4MixcbiAgICAgIG4gPSAxLFxuICAgICAgZ3VhcmQgPSAxMCxcbiAgICAgIHggPSB5LFxuICAgICAgeGQgPSB4LmQsXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcbiAgICAgIHJtID0gQ3Rvci5yb3VuZGluZyxcbiAgICAgIHByID0gQ3Rvci5wcmVjaXNpb247XG5cbiAgICAvLyBJcyB4IG5lZ2F0aXZlIG9yIEluZmluaXR5LCBOYU4sIDAgb3IgMT9cbiAgICBpZiAoeC5zIDwgMCB8fCAheGQgfHwgIXhkWzBdIHx8ICF4LmUgJiYgeGRbMF0gPT0gMSAmJiB4ZC5sZW5ndGggPT0gMSkge1xuICAgICAgcmV0dXJuIG5ldyBDdG9yKHhkICYmICF4ZFswXSA/IC0xIC8gMCA6IHgucyAhPSAxID8gTmFOIDogeGQgPyAwIDogeCk7XG4gICAgfVxuXG4gICAgaWYgKHNkID09IG51bGwpIHtcbiAgICAgIGV4dGVybmFsID0gZmFsc2U7XG4gICAgICB3cHIgPSBwcjtcbiAgICB9IGVsc2Uge1xuICAgICAgd3ByID0gc2Q7XG4gICAgfVxuXG4gICAgQ3Rvci5wcmVjaXNpb24gPSB3cHIgKz0gZ3VhcmQ7XG4gICAgYyA9IGRpZ2l0c1RvU3RyaW5nKHhkKTtcbiAgICBjMCA9IGMuY2hhckF0KDApO1xuXG4gICAgaWYgKE1hdGguYWJzKGUgPSB4LmUpIDwgMS41ZTE1KSB7XG5cbiAgICAgIC8vIEFyZ3VtZW50IHJlZHVjdGlvbi5cbiAgICAgIC8vIFRoZSBzZXJpZXMgY29udmVyZ2VzIGZhc3RlciB0aGUgY2xvc2VyIHRoZSBhcmd1bWVudCBpcyB0byAxLCBzbyB1c2luZ1xuICAgICAgLy8gbG4oYV5iKSA9IGIgKiBsbihhKSwgICBsbihhKSA9IGxuKGFeYikgLyBiXG4gICAgICAvLyBtdWx0aXBseSB0aGUgYXJndW1lbnQgYnkgaXRzZWxmIHVudGlsIHRoZSBsZWFkaW5nIGRpZ2l0cyBvZiB0aGUgc2lnbmlmaWNhbmQgYXJlIDcsIDgsIDksXG4gICAgICAvLyAxMCwgMTEsIDEyIG9yIDEzLCByZWNvcmRpbmcgdGhlIG51bWJlciBvZiBtdWx0aXBsaWNhdGlvbnMgc28gdGhlIHN1bSBvZiB0aGUgc2VyaWVzIGNhblxuICAgICAgLy8gbGF0ZXIgYmUgZGl2aWRlZCBieSB0aGlzIG51bWJlciwgdGhlbiBzZXBhcmF0ZSBvdXQgdGhlIHBvd2VyIG9mIDEwIHVzaW5nXG4gICAgICAvLyBsbihhKjEwXmIpID0gbG4oYSkgKyBiKmxuKDEwKS5cblxuICAgICAgLy8gbWF4IG4gaXMgMjEgKGdpdmVzIDAuOSwgMS4wIG9yIDEuMSkgKDllMTUgLyAyMSA9IDQuMmUxNCkuXG4gICAgICAvL3doaWxlIChjMCA8IDkgJiYgYzAgIT0gMSB8fCBjMCA9PSAxICYmIGMuY2hhckF0KDEpID4gMSkge1xuICAgICAgLy8gbWF4IG4gaXMgNiAoZ2l2ZXMgMC43IC0gMS4zKVxuICAgICAgd2hpbGUgKGMwIDwgNyAmJiBjMCAhPSAxIHx8IGMwID09IDEgJiYgYy5jaGFyQXQoMSkgPiAzKSB7XG4gICAgICAgIHggPSB4LnRpbWVzKHkpO1xuICAgICAgICBjID0gZGlnaXRzVG9TdHJpbmcoeC5kKTtcbiAgICAgICAgYzAgPSBjLmNoYXJBdCgwKTtcbiAgICAgICAgbisrO1xuICAgICAgfVxuXG4gICAgICBlID0geC5lO1xuXG4gICAgICBpZiAoYzAgPiAxKSB7XG4gICAgICAgIHggPSBuZXcgQ3RvcignMC4nICsgYyk7XG4gICAgICAgIGUrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHggPSBuZXcgQ3RvcihjMCArICcuJyArIGMuc2xpY2UoMSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG5cbiAgICAgIC8vIFRoZSBhcmd1bWVudCByZWR1Y3Rpb24gbWV0aG9kIGFib3ZlIG1heSByZXN1bHQgaW4gb3ZlcmZsb3cgaWYgdGhlIGFyZ3VtZW50IHkgaXMgYSBtYXNzaXZlXG4gICAgICAvLyBudW1iZXIgd2l0aCBleHBvbmVudCA+PSAxNTAwMDAwMDAwMDAwMDAwICg5ZTE1IC8gNiA9IDEuNWUxNSksIHNvIGluc3RlYWQgcmVjYWxsIHRoaXNcbiAgICAgIC8vIGZ1bmN0aW9uIHVzaW5nIGxuKHgqMTBeZSkgPSBsbih4KSArIGUqbG4oMTApLlxuICAgICAgdCA9IGdldExuMTAoQ3Rvciwgd3ByICsgMiwgcHIpLnRpbWVzKGUgKyAnJyk7XG4gICAgICB4ID0gbmF0dXJhbExvZ2FyaXRobShuZXcgQ3RvcihjMCArICcuJyArIGMuc2xpY2UoMSkpLCB3cHIgLSBndWFyZCkucGx1cyh0KTtcbiAgICAgIEN0b3IucHJlY2lzaW9uID0gcHI7XG5cbiAgICAgIHJldHVybiBzZCA9PSBudWxsID8gZmluYWxpc2UoeCwgcHIsIHJtLCBleHRlcm5hbCA9IHRydWUpIDogeDtcbiAgICB9XG5cbiAgICAvLyB4MSBpcyB4IHJlZHVjZWQgdG8gYSB2YWx1ZSBuZWFyIDEuXG4gICAgeDEgPSB4O1xuXG4gICAgLy8gVGF5bG9yIHNlcmllcy5cbiAgICAvLyBsbih5KSA9IGxuKCgxICsgeCkvKDEgLSB4KSkgPSAyKHggKyB4XjMvMyArIHheNS81ICsgeF43LzcgKyAuLi4pXG4gICAgLy8gd2hlcmUgeCA9ICh5IC0gMSkvKHkgKyAxKSAgICAofHh8IDwgMSlcbiAgICBzdW0gPSBudW1lcmF0b3IgPSB4ID0gZGl2aWRlKHgubWludXMoMSksIHgucGx1cygxKSwgd3ByLCAxKTtcbiAgICB4MiA9IGZpbmFsaXNlKHgudGltZXMoeCksIHdwciwgMSk7XG4gICAgZGVub21pbmF0b3IgPSAzO1xuXG4gICAgZm9yICg7Oykge1xuICAgICAgbnVtZXJhdG9yID0gZmluYWxpc2UobnVtZXJhdG9yLnRpbWVzKHgyKSwgd3ByLCAxKTtcbiAgICAgIHQgPSBzdW0ucGx1cyhkaXZpZGUobnVtZXJhdG9yLCBuZXcgQ3RvcihkZW5vbWluYXRvciksIHdwciwgMSkpO1xuXG4gICAgICBpZiAoZGlnaXRzVG9TdHJpbmcodC5kKS5zbGljZSgwLCB3cHIpID09PSBkaWdpdHNUb1N0cmluZyhzdW0uZCkuc2xpY2UoMCwgd3ByKSkge1xuICAgICAgICBzdW0gPSBzdW0udGltZXMoMik7XG5cbiAgICAgICAgLy8gUmV2ZXJzZSB0aGUgYXJndW1lbnQgcmVkdWN0aW9uLiBDaGVjayB0aGF0IGUgaXMgbm90IDAgYmVjYXVzZSwgYmVzaWRlcyBwcmV2ZW50aW5nIGFuXG4gICAgICAgIC8vIHVubmVjZXNzYXJ5IGNhbGN1bGF0aW9uLCAtMCArIDAgPSArMCBhbmQgdG8gZW5zdXJlIGNvcnJlY3Qgcm91bmRpbmcgLTAgbmVlZHMgdG8gc3RheSAtMC5cbiAgICAgICAgaWYgKGUgIT09IDApIHN1bSA9IHN1bS5wbHVzKGdldExuMTAoQ3Rvciwgd3ByICsgMiwgcHIpLnRpbWVzKGUgKyAnJykpO1xuICAgICAgICBzdW0gPSBkaXZpZGUoc3VtLCBuZXcgQ3RvcihuKSwgd3ByLCAxKTtcblxuICAgICAgICAvLyBJcyBybSA+IDMgYW5kIHRoZSBmaXJzdCA0IHJvdW5kaW5nIGRpZ2l0cyA0OTk5LCBvciBybSA8IDQgKG9yIHRoZSBzdW1tYXRpb24gaGFzXG4gICAgICAgIC8vIGJlZW4gcmVwZWF0ZWQgcHJldmlvdXNseSkgYW5kIHRoZSBmaXJzdCA0IHJvdW5kaW5nIGRpZ2l0cyA5OTk5P1xuICAgICAgICAvLyBJZiBzbywgcmVzdGFydCB0aGUgc3VtbWF0aW9uIHdpdGggYSBoaWdoZXIgcHJlY2lzaW9uLCBvdGhlcndpc2VcbiAgICAgICAgLy8gZS5nLiB3aXRoIHByZWNpc2lvbjogMTIsIHJvdW5kaW5nOiAxXG4gICAgICAgIC8vIGxuKDEzNTUyMDAyOC42MTI2MDkxNzE0MjY1MzgxNTMzKSA9IDE4LjcyNDYyOTk5OTkgd2hlbiBpdCBzaG91bGQgYmUgMTguNzI0NjMuXG4gICAgICAgIC8vIGB3cHIgLSBndWFyZGAgaXMgdGhlIGluZGV4IG9mIGZpcnN0IHJvdW5kaW5nIGRpZ2l0LlxuICAgICAgICBpZiAoc2QgPT0gbnVsbCkge1xuICAgICAgICAgIGlmIChjaGVja1JvdW5kaW5nRGlnaXRzKHN1bS5kLCB3cHIgLSBndWFyZCwgcm0sIHJlcCkpIHtcbiAgICAgICAgICAgIEN0b3IucHJlY2lzaW9uID0gd3ByICs9IGd1YXJkO1xuICAgICAgICAgICAgdCA9IG51bWVyYXRvciA9IHggPSBkaXZpZGUoeDEubWludXMoMSksIHgxLnBsdXMoMSksIHdwciwgMSk7XG4gICAgICAgICAgICB4MiA9IGZpbmFsaXNlKHgudGltZXMoeCksIHdwciwgMSk7XG4gICAgICAgICAgICBkZW5vbWluYXRvciA9IHJlcCA9IDE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmaW5hbGlzZShzdW0sIEN0b3IucHJlY2lzaW9uID0gcHIsIHJtLCBleHRlcm5hbCA9IHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xuICAgICAgICAgIHJldHVybiBzdW07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3VtID0gdDtcbiAgICAgIGRlbm9taW5hdG9yICs9IDI7XG4gICAgfVxuICB9XG5cblxuICAvLyDCsUluZmluaXR5LCBOYU4uXG4gIGZ1bmN0aW9uIG5vbkZpbml0ZVRvU3RyaW5nKHgpIHtcbiAgICAvLyBVbnNpZ25lZC5cbiAgICByZXR1cm4gU3RyaW5nKHgucyAqIHgucyAvIDApO1xuICB9XG5cblxuICAvKlxuICAgKiBQYXJzZSB0aGUgdmFsdWUgb2YgYSBuZXcgRGVjaW1hbCBgeGAgZnJvbSBzdHJpbmcgYHN0cmAuXG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZURlY2ltYWwoeCwgc3RyKSB7XG4gICAgdmFyIGUsIGksIGxlbjtcblxuICAgIC8vIERlY2ltYWwgcG9pbnQ/XG4gICAgaWYgKChlID0gc3RyLmluZGV4T2YoJy4nKSkgPiAtMSkgc3RyID0gc3RyLnJlcGxhY2UoJy4nLCAnJyk7XG5cbiAgICAvLyBFeHBvbmVudGlhbCBmb3JtP1xuICAgIGlmICgoaSA9IHN0ci5zZWFyY2goL2UvaSkpID4gMCkge1xuXG4gICAgICAvLyBEZXRlcm1pbmUgZXhwb25lbnQuXG4gICAgICBpZiAoZSA8IDApIGUgPSBpO1xuICAgICAgZSArPSArc3RyLnNsaWNlKGkgKyAxKTtcbiAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgaSk7XG4gICAgfSBlbHNlIGlmIChlIDwgMCkge1xuXG4gICAgICAvLyBJbnRlZ2VyLlxuICAgICAgZSA9IHN0ci5sZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXG4gICAgZm9yIChpID0gMDsgc3RyLmNoYXJDb2RlQXQoaSkgPT09IDQ4OyBpKyspO1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxuICAgIGZvciAobGVuID0gc3RyLmxlbmd0aDsgc3RyLmNoYXJDb2RlQXQobGVuIC0gMSkgPT09IDQ4OyAtLWxlbik7XG4gICAgc3RyID0gc3RyLnNsaWNlKGksIGxlbik7XG5cbiAgICBpZiAoc3RyKSB7XG4gICAgICBsZW4gLT0gaTtcbiAgICAgIHguZSA9IGUgPSBlIC0gaSAtIDE7XG4gICAgICB4LmQgPSBbXTtcblxuICAgICAgLy8gVHJhbnNmb3JtIGJhc2VcblxuICAgICAgLy8gZSBpcyB0aGUgYmFzZSAxMCBleHBvbmVudC5cbiAgICAgIC8vIGkgaXMgd2hlcmUgdG8gc2xpY2Ugc3RyIHRvIGdldCB0aGUgZmlyc3Qgd29yZCBvZiB0aGUgZGlnaXRzIGFycmF5LlxuICAgICAgaSA9IChlICsgMSkgJSBMT0dfQkFTRTtcbiAgICAgIGlmIChlIDwgMCkgaSArPSBMT0dfQkFTRTtcblxuICAgICAgaWYgKGkgPCBsZW4pIHtcbiAgICAgICAgaWYgKGkpIHguZC5wdXNoKCtzdHIuc2xpY2UoMCwgaSkpO1xuICAgICAgICBmb3IgKGxlbiAtPSBMT0dfQkFTRTsgaSA8IGxlbjspIHguZC5wdXNoKCtzdHIuc2xpY2UoaSwgaSArPSBMT0dfQkFTRSkpO1xuICAgICAgICBzdHIgPSBzdHIuc2xpY2UoaSk7XG4gICAgICAgIGkgPSBMT0dfQkFTRSAtIHN0ci5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpIC09IGxlbjtcbiAgICAgIH1cblxuICAgICAgZm9yICg7IGktLTspIHN0ciArPSAnMCc7XG4gICAgICB4LmQucHVzaCgrc3RyKTtcblxuICAgICAgaWYgKGV4dGVybmFsKSB7XG5cbiAgICAgICAgLy8gT3ZlcmZsb3c/XG4gICAgICAgIGlmICh4LmUgPiB4LmNvbnN0cnVjdG9yLm1heEUpIHtcblxuICAgICAgICAgIC8vIEluZmluaXR5LlxuICAgICAgICAgIHguZCA9IG51bGw7XG4gICAgICAgICAgeC5lID0gTmFOO1xuXG4gICAgICAgICAgLy8gVW5kZXJmbG93P1xuICAgICAgICB9IGVsc2UgaWYgKHguZSA8IHguY29uc3RydWN0b3IubWluRSkge1xuXG4gICAgICAgICAgLy8gWmVyby5cbiAgICAgICAgICB4LmUgPSAwO1xuICAgICAgICAgIHguZCA9IFswXTtcbiAgICAgICAgICAvLyB4LmNvbnN0cnVjdG9yLnVuZGVyZmxvdyA9IHRydWU7XG4gICAgICAgIH0gLy8gZWxzZSB4LmNvbnN0cnVjdG9yLnVuZGVyZmxvdyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG5cbiAgICAgIC8vIFplcm8uXG4gICAgICB4LmUgPSAwO1xuICAgICAgeC5kID0gWzBdO1xuICAgIH1cblxuICAgIHJldHVybiB4O1xuICB9XG5cblxuICAvKlxuICAgKiBQYXJzZSB0aGUgdmFsdWUgb2YgYSBuZXcgRGVjaW1hbCBgeGAgZnJvbSBhIHN0cmluZyBgc3RyYCwgd2hpY2ggaXMgbm90IGEgZGVjaW1hbCB2YWx1ZS5cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlT3RoZXIoeCwgc3RyKSB7XG4gICAgdmFyIGJhc2UsIEN0b3IsIGRpdmlzb3IsIGksIGlzRmxvYXQsIGxlbiwgcCwgeGQsIHhlO1xuXG4gICAgaWYgKHN0ci5pbmRleE9mKCdfJykgPiAtMSkge1xuICAgICAgc3RyID0gc3RyLnJlcGxhY2UoLyhcXGQpXyg/PVxcZCkvZywgJyQxJyk7XG4gICAgICBpZiAoaXNEZWNpbWFsLnRlc3Qoc3RyKSkgcmV0dXJuIHBhcnNlRGVjaW1hbCh4LCBzdHIpO1xuICAgIH0gZWxzZSBpZiAoc3RyID09PSAnSW5maW5pdHknIHx8IHN0ciA9PT0gJ05hTicpIHtcbiAgICAgIGlmICghK3N0cikgeC5zID0gTmFOO1xuICAgICAgeC5lID0gTmFOO1xuICAgICAgeC5kID0gbnVsbDtcbiAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIGlmIChpc0hleC50ZXN0KHN0cikpICB7XG4gICAgICBiYXNlID0gMTY7XG4gICAgICBzdHIgPSBzdHIudG9Mb3dlckNhc2UoKTtcbiAgICB9IGVsc2UgaWYgKGlzQmluYXJ5LnRlc3Qoc3RyKSkgIHtcbiAgICAgIGJhc2UgPSAyO1xuICAgIH0gZWxzZSBpZiAoaXNPY3RhbC50ZXN0KHN0cikpICB7XG4gICAgICBiYXNlID0gODtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoaW52YWxpZEFyZ3VtZW50ICsgc3RyKTtcbiAgICB9XG5cbiAgICAvLyBJcyB0aGVyZSBhIGJpbmFyeSBleHBvbmVudCBwYXJ0P1xuICAgIGkgPSBzdHIuc2VhcmNoKC9wL2kpO1xuXG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICBwID0gK3N0ci5zbGljZShpICsgMSk7XG4gICAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKDIsIGkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBzdHIuc2xpY2UoMik7XG4gICAgfVxuXG4gICAgLy8gQ29udmVydCBgc3RyYCBhcyBhbiBpbnRlZ2VyIHRoZW4gZGl2aWRlIHRoZSByZXN1bHQgYnkgYGJhc2VgIHJhaXNlZCB0byBhIHBvd2VyIHN1Y2ggdGhhdCB0aGVcbiAgICAvLyBmcmFjdGlvbiBwYXJ0IHdpbGwgYmUgcmVzdG9yZWQuXG4gICAgaSA9IHN0ci5pbmRleE9mKCcuJyk7XG4gICAgaXNGbG9hdCA9IGkgPj0gMDtcbiAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcblxuICAgIGlmIChpc0Zsb2F0KSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgnLicsICcnKTtcbiAgICAgIGxlbiA9IHN0ci5sZW5ndGg7XG4gICAgICBpID0gbGVuIC0gaTtcblxuICAgICAgLy8gbG9nWzEwXSgxNikgPSAxLjIwNDEuLi4gLCBsb2dbMTBdKDg4KSA9IDEuOTQ0NC4uLi5cbiAgICAgIGRpdmlzb3IgPSBpbnRQb3coQ3RvciwgbmV3IEN0b3IoYmFzZSksIGksIGkgKiAyKTtcbiAgICB9XG5cbiAgICB4ZCA9IGNvbnZlcnRCYXNlKHN0ciwgYmFzZSwgQkFTRSk7XG4gICAgeGUgPSB4ZC5sZW5ndGggLSAxO1xuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxuICAgIGZvciAoaSA9IHhlOyB4ZFtpXSA9PT0gMDsgLS1pKSB4ZC5wb3AoKTtcbiAgICBpZiAoaSA8IDApIHJldHVybiBuZXcgQ3Rvcih4LnMgKiAwKTtcbiAgICB4LmUgPSBnZXRCYXNlMTBFeHBvbmVudCh4ZCwgeGUpO1xuICAgIHguZCA9IHhkO1xuICAgIGV4dGVybmFsID0gZmFsc2U7XG5cbiAgICAvLyBBdCB3aGF0IHByZWNpc2lvbiB0byBwZXJmb3JtIHRoZSBkaXZpc2lvbiB0byBlbnN1cmUgZXhhY3QgY29udmVyc2lvbj9cbiAgICAvLyBtYXhEZWNpbWFsSW50ZWdlclBhcnREaWdpdENvdW50ID0gY2VpbChsb2dbMTBdKGIpICogb3RoZXJCYXNlSW50ZWdlclBhcnREaWdpdENvdW50KVxuICAgIC8vIGxvZ1sxMF0oMikgPSAwLjMwMTAzLCBsb2dbMTBdKDgpID0gMC45MDMwOSwgbG9nWzEwXSgxNikgPSAxLjIwNDEyXG4gICAgLy8gRS5nLiBjZWlsKDEuMiAqIDMpID0gNCwgc28gdXAgdG8gNCBkZWNpbWFsIGRpZ2l0cyBhcmUgbmVlZGVkIHRvIHJlcHJlc2VudCAzIGhleCBpbnQgZGlnaXRzLlxuICAgIC8vIG1heERlY2ltYWxGcmFjdGlvblBhcnREaWdpdENvdW50ID0ge0hleDo0fE9jdDozfEJpbjoxfSAqIG90aGVyQmFzZUZyYWN0aW9uUGFydERpZ2l0Q291bnRcbiAgICAvLyBUaGVyZWZvcmUgdXNpbmcgNCAqIHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIHN0ciB3aWxsIGFsd2F5cyBiZSBlbm91Z2guXG4gICAgaWYgKGlzRmxvYXQpIHggPSBkaXZpZGUoeCwgZGl2aXNvciwgbGVuICogNCk7XG5cbiAgICAvLyBNdWx0aXBseSBieSB0aGUgYmluYXJ5IGV4cG9uZW50IHBhcnQgaWYgcHJlc2VudC5cbiAgICBpZiAocCkgeCA9IHgudGltZXMoTWF0aC5hYnMocCkgPCA1NCA/IG1hdGhwb3coMiwgcCkgOiBEZWNpbWFsLnBvdygyLCBwKSk7XG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHg7XG4gIH1cblxuXG4gIC8qXG4gICAqIHNpbih4KSA9IHggLSB4XjMvMyEgKyB4XjUvNSEgLSAuLi5cbiAgICogfHh8IDwgcGkvMlxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gc2luZShDdG9yLCB4KSB7XG4gICAgdmFyIGssXG4gICAgICBsZW4gPSB4LmQubGVuZ3RoO1xuXG4gICAgaWYgKGxlbiA8IDMpIHtcbiAgICAgIHJldHVybiB4LmlzWmVybygpID8geCA6IHRheWxvclNlcmllcyhDdG9yLCAyLCB4LCB4KTtcbiAgICB9XG5cbiAgICAvLyBBcmd1bWVudCByZWR1Y3Rpb246IHNpbig1eCkgPSAxNipzaW5eNSh4KSAtIDIwKnNpbl4zKHgpICsgNSpzaW4oeClcbiAgICAvLyBpLmUuIHNpbih4KSA9IDE2KnNpbl41KHgvNSkgLSAyMCpzaW5eMyh4LzUpICsgNSpzaW4oeC81KVxuICAgIC8vIGFuZCAgc2luKHgpID0gc2luKHgvNSkoNSArIHNpbl4yKHgvNSkoMTZzaW5eMih4LzUpIC0gMjApKVxuXG4gICAgLy8gRXN0aW1hdGUgdGhlIG9wdGltdW0gbnVtYmVyIG9mIHRpbWVzIHRvIHVzZSB0aGUgYXJndW1lbnQgcmVkdWN0aW9uLlxuICAgIGsgPSAxLjQgKiBNYXRoLnNxcnQobGVuKTtcbiAgICBrID0gayA+IDE2ID8gMTYgOiBrIHwgMDtcblxuICAgIHggPSB4LnRpbWVzKDEgLyB0aW55UG93KDUsIGspKTtcbiAgICB4ID0gdGF5bG9yU2VyaWVzKEN0b3IsIDIsIHgsIHgpO1xuXG4gICAgLy8gUmV2ZXJzZSBhcmd1bWVudCByZWR1Y3Rpb25cbiAgICB2YXIgc2luMl94LFxuICAgICAgZDUgPSBuZXcgQ3Rvcig1KSxcbiAgICAgIGQxNiA9IG5ldyBDdG9yKDE2KSxcbiAgICAgIGQyMCA9IG5ldyBDdG9yKDIwKTtcbiAgICBmb3IgKDsgay0tOykge1xuICAgICAgc2luMl94ID0geC50aW1lcyh4KTtcbiAgICAgIHggPSB4LnRpbWVzKGQ1LnBsdXMoc2luMl94LnRpbWVzKGQxNi50aW1lcyhzaW4yX3gpLm1pbnVzKGQyMCkpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHg7XG4gIH1cblxuXG4gIC8vIENhbGN1bGF0ZSBUYXlsb3Igc2VyaWVzIGZvciBgY29zYCwgYGNvc2hgLCBgc2luYCBhbmQgYHNpbmhgLlxuICBmdW5jdGlvbiB0YXlsb3JTZXJpZXMoQ3RvciwgbiwgeCwgeSwgaXNIeXBlcmJvbGljKSB7XG4gICAgdmFyIGosIHQsIHUsIHgyLFxuICAgICAgaSA9IDEsXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uLFxuICAgICAgayA9IE1hdGguY2VpbChwciAvIExPR19CQVNFKTtcblxuICAgIGV4dGVybmFsID0gZmFsc2U7XG4gICAgeDIgPSB4LnRpbWVzKHgpO1xuICAgIHUgPSBuZXcgQ3Rvcih5KTtcblxuICAgIGZvciAoOzspIHtcbiAgICAgIHQgPSBkaXZpZGUodS50aW1lcyh4MiksIG5ldyBDdG9yKG4rKyAqIG4rKyksIHByLCAxKTtcbiAgICAgIHUgPSBpc0h5cGVyYm9saWMgPyB5LnBsdXModCkgOiB5Lm1pbnVzKHQpO1xuICAgICAgeSA9IGRpdmlkZSh0LnRpbWVzKHgyKSwgbmV3IEN0b3IobisrICogbisrKSwgcHIsIDEpO1xuICAgICAgdCA9IHUucGx1cyh5KTtcblxuICAgICAgaWYgKHQuZFtrXSAhPT0gdm9pZCAwKSB7XG4gICAgICAgIGZvciAoaiA9IGs7IHQuZFtqXSA9PT0gdS5kW2pdICYmIGotLTspO1xuICAgICAgICBpZiAoaiA9PSAtMSkgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGogPSB1O1xuICAgICAgdSA9IHk7XG4gICAgICB5ID0gdDtcbiAgICAgIHQgPSBqO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIGV4dGVybmFsID0gdHJ1ZTtcbiAgICB0LmQubGVuZ3RoID0gayArIDE7XG5cbiAgICByZXR1cm4gdDtcbiAgfVxuXG5cbiAgLy8gRXhwb25lbnQgZSBtdXN0IGJlIHBvc2l0aXZlIGFuZCBub24temVyby5cbiAgZnVuY3Rpb24gdGlueVBvdyhiLCBlKSB7XG4gICAgdmFyIG4gPSBiO1xuICAgIHdoaWxlICgtLWUpIG4gKj0gYjtcbiAgICByZXR1cm4gbjtcbiAgfVxuXG5cbiAgLy8gUmV0dXJuIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBgeGAgcmVkdWNlZCB0byBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gaGFsZiBwaS5cbiAgZnVuY3Rpb24gdG9MZXNzVGhhbkhhbGZQaShDdG9yLCB4KSB7XG4gICAgdmFyIHQsXG4gICAgICBpc05lZyA9IHgucyA8IDAsXG4gICAgICBwaSA9IGdldFBpKEN0b3IsIEN0b3IucHJlY2lzaW9uLCAxKSxcbiAgICAgIGhhbGZQaSA9IHBpLnRpbWVzKDAuNSk7XG5cbiAgICB4ID0geC5hYnMoKTtcblxuICAgIGlmICh4Lmx0ZShoYWxmUGkpKSB7XG4gICAgICBxdWFkcmFudCA9IGlzTmVnID8gNCA6IDE7XG4gICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICB0ID0geC5kaXZUb0ludChwaSk7XG5cbiAgICBpZiAodC5pc1plcm8oKSkge1xuICAgICAgcXVhZHJhbnQgPSBpc05lZyA/IDMgOiAyO1xuICAgIH0gZWxzZSB7XG4gICAgICB4ID0geC5taW51cyh0LnRpbWVzKHBpKSk7XG5cbiAgICAgIC8vIDAgPD0geCA8IHBpXG4gICAgICBpZiAoeC5sdGUoaGFsZlBpKSkge1xuICAgICAgICBxdWFkcmFudCA9IGlzT2RkKHQpID8gKGlzTmVnID8gMiA6IDMpIDogKGlzTmVnID8gNCA6IDEpO1xuICAgICAgICByZXR1cm4geDtcbiAgICAgIH1cblxuICAgICAgcXVhZHJhbnQgPSBpc09kZCh0KSA/IChpc05lZyA/IDEgOiA0KSA6IChpc05lZyA/IDMgOiAyKTtcbiAgICB9XG5cbiAgICByZXR1cm4geC5taW51cyhwaSkuYWJzKCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiB0aGUgdmFsdWUgb2YgRGVjaW1hbCBgeGAgYXMgYSBzdHJpbmcgaW4gYmFzZSBgYmFzZU91dGAuXG4gICAqXG4gICAqIElmIHRoZSBvcHRpb25hbCBgc2RgIGFyZ3VtZW50IGlzIHByZXNlbnQgaW5jbHVkZSBhIGJpbmFyeSBleHBvbmVudCBzdWZmaXguXG4gICAqL1xuICBmdW5jdGlvbiB0b1N0cmluZ0JpbmFyeSh4LCBiYXNlT3V0LCBzZCwgcm0pIHtcbiAgICB2YXIgYmFzZSwgZSwgaSwgaywgbGVuLCByb3VuZFVwLCBzdHIsIHhkLCB5LFxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXG4gICAgICBpc0V4cCA9IHNkICE9PSB2b2lkIDA7XG5cbiAgICBpZiAoaXNFeHApIHtcbiAgICAgIGNoZWNrSW50MzIoc2QsIDEsIE1BWF9ESUdJVFMpO1xuICAgICAgaWYgKHJtID09PSB2b2lkIDApIHJtID0gQ3Rvci5yb3VuZGluZztcbiAgICAgIGVsc2UgY2hlY2tJbnQzMihybSwgMCwgOCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNkID0gQ3Rvci5wcmVjaXNpb247XG4gICAgICBybSA9IEN0b3Iucm91bmRpbmc7XG4gICAgfVxuXG4gICAgaWYgKCF4LmlzRmluaXRlKCkpIHtcbiAgICAgIHN0ciA9IG5vbkZpbml0ZVRvU3RyaW5nKHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4KTtcbiAgICAgIGkgPSBzdHIuaW5kZXhPZignLicpO1xuXG4gICAgICAvLyBVc2UgZXhwb25lbnRpYWwgbm90YXRpb24gYWNjb3JkaW5nIHRvIGB0b0V4cFBvc2AgYW5kIGB0b0V4cE5lZ2A/IE5vLCBidXQgaWYgcmVxdWlyZWQ6XG4gICAgICAvLyBtYXhCaW5hcnlFeHBvbmVudCA9IGZsb29yKChkZWNpbWFsRXhwb25lbnQgKyAxKSAqIGxvZ1syXSgxMCkpXG4gICAgICAvLyBtaW5CaW5hcnlFeHBvbmVudCA9IGZsb29yKGRlY2ltYWxFeHBvbmVudCAqIGxvZ1syXSgxMCkpXG4gICAgICAvLyBsb2dbMl0oMTApID0gMy4zMjE5MjgwOTQ4ODczNjIzNDc4NzAzMTk0Mjk0ODkzOTAxNzU4NjRcblxuICAgICAgaWYgKGlzRXhwKSB7XG4gICAgICAgIGJhc2UgPSAyO1xuICAgICAgICBpZiAoYmFzZU91dCA9PSAxNikge1xuICAgICAgICAgIHNkID0gc2QgKiA0IC0gMztcbiAgICAgICAgfSBlbHNlIGlmIChiYXNlT3V0ID09IDgpIHtcbiAgICAgICAgICBzZCA9IHNkICogMyAtIDI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJhc2UgPSBiYXNlT3V0O1xuICAgICAgfVxuXG4gICAgICAvLyBDb252ZXJ0IHRoZSBudW1iZXIgYXMgYW4gaW50ZWdlciB0aGVuIGRpdmlkZSB0aGUgcmVzdWx0IGJ5IGl0cyBiYXNlIHJhaXNlZCB0byBhIHBvd2VyIHN1Y2hcbiAgICAgIC8vIHRoYXQgdGhlIGZyYWN0aW9uIHBhcnQgd2lsbCBiZSByZXN0b3JlZC5cblxuICAgICAgLy8gTm9uLWludGVnZXIuXG4gICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKCcuJywgJycpO1xuICAgICAgICB5ID0gbmV3IEN0b3IoMSk7XG4gICAgICAgIHkuZSA9IHN0ci5sZW5ndGggLSBpO1xuICAgICAgICB5LmQgPSBjb252ZXJ0QmFzZShmaW5pdGVUb1N0cmluZyh5KSwgMTAsIGJhc2UpO1xuICAgICAgICB5LmUgPSB5LmQubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICB4ZCA9IGNvbnZlcnRCYXNlKHN0ciwgMTAsIGJhc2UpO1xuICAgICAgZSA9IGxlbiA9IHhkLmxlbmd0aDtcblxuICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxuICAgICAgZm9yICg7IHhkWy0tbGVuXSA9PSAwOykgeGQucG9wKCk7XG5cbiAgICAgIGlmICgheGRbMF0pIHtcbiAgICAgICAgc3RyID0gaXNFeHAgPyAnMHArMCcgOiAnMCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaSA8IDApIHtcbiAgICAgICAgICBlLS07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeCA9IG5ldyBDdG9yKHgpO1xuICAgICAgICAgIHguZCA9IHhkO1xuICAgICAgICAgIHguZSA9IGU7XG4gICAgICAgICAgeCA9IGRpdmlkZSh4LCB5LCBzZCwgcm0sIDAsIGJhc2UpO1xuICAgICAgICAgIHhkID0geC5kO1xuICAgICAgICAgIGUgPSB4LmU7XG4gICAgICAgICAgcm91bmRVcCA9IGluZXhhY3Q7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcm91bmRpbmcgZGlnaXQsIGkuZS4gdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxuICAgICAgICBpID0geGRbc2RdO1xuICAgICAgICBrID0gYmFzZSAvIDI7XG4gICAgICAgIHJvdW5kVXAgPSByb3VuZFVwIHx8IHhkW3NkICsgMV0gIT09IHZvaWQgMDtcblxuICAgICAgICByb3VuZFVwID0gcm0gPCA0XG4gICAgICAgICAgICAgICAgICA/IChpICE9PSB2b2lkIDAgfHwgcm91bmRVcCkgJiYgKHJtID09PSAwIHx8IHJtID09PSAoeC5zIDwgMCA/IDMgOiAyKSlcbiAgICAgICAgICAgICAgICAgIDogaSA+IGsgfHwgaSA9PT0gayAmJiAocm0gPT09IDQgfHwgcm91bmRVcCB8fCBybSA9PT0gNiAmJiB4ZFtzZCAtIDFdICYgMSB8fFxuICAgICAgICAgICAgICAgICAgICBybSA9PT0gKHgucyA8IDAgPyA4IDogNykpO1xuXG4gICAgICAgIHhkLmxlbmd0aCA9IHNkO1xuXG4gICAgICAgIGlmIChyb3VuZFVwKSB7XG5cbiAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAgYW5kIHNvIG9uLlxuICAgICAgICAgIGZvciAoOyArK3hkWy0tc2RdID4gYmFzZSAtIDE7KSB7XG4gICAgICAgICAgICB4ZFtzZF0gPSAwO1xuICAgICAgICAgICAgaWYgKCFzZCkge1xuICAgICAgICAgICAgICArK2U7XG4gICAgICAgICAgICAgIHhkLnVuc2hpZnQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxuICAgICAgICBmb3IgKGxlbiA9IHhkLmxlbmd0aDsgIXhkW2xlbiAtIDFdOyAtLWxlbik7XG5cbiAgICAgICAgLy8gRS5nLiBbNCwgMTEsIDE1XSBiZWNvbWVzIDRiZi5cbiAgICAgICAgZm9yIChpID0gMCwgc3RyID0gJyc7IGkgPCBsZW47IGkrKykgc3RyICs9IE5VTUVSQUxTLmNoYXJBdCh4ZFtpXSk7XG5cbiAgICAgICAgLy8gQWRkIGJpbmFyeSBleHBvbmVudCBzdWZmaXg/XG4gICAgICAgIGlmIChpc0V4cCkge1xuICAgICAgICAgIGlmIChsZW4gPiAxKSB7XG4gICAgICAgICAgICBpZiAoYmFzZU91dCA9PSAxNiB8fCBiYXNlT3V0ID09IDgpIHtcbiAgICAgICAgICAgICAgaSA9IGJhc2VPdXQgPT0gMTYgPyA0IDogMztcbiAgICAgICAgICAgICAgZm9yICgtLWxlbjsgbGVuICUgaTsgbGVuKyspIHN0ciArPSAnMCc7XG4gICAgICAgICAgICAgIHhkID0gY29udmVydEJhc2Uoc3RyLCBiYXNlLCBiYXNlT3V0KTtcbiAgICAgICAgICAgICAgZm9yIChsZW4gPSB4ZC5sZW5ndGg7ICF4ZFtsZW4gLSAxXTsgLS1sZW4pO1xuXG4gICAgICAgICAgICAgIC8vIHhkWzBdIHdpbGwgYWx3YXlzIGJlIGJlIDFcbiAgICAgICAgICAgICAgZm9yIChpID0gMSwgc3RyID0gJzEuJzsgaSA8IGxlbjsgaSsrKSBzdHIgKz0gTlVNRVJBTFMuY2hhckF0KHhkW2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3RyID0gIHN0ciArIChlIDwgMCA/ICdwJyA6ICdwKycpICsgZTtcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xuICAgICAgICAgIGZvciAoOyArK2U7KSBzdHIgPSAnMCcgKyBzdHI7XG4gICAgICAgICAgc3RyID0gJzAuJyArIHN0cjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoKytlID4gbGVuKSBmb3IgKGUgLT0gbGVuOyBlLS0gOykgc3RyICs9ICcwJztcbiAgICAgICAgICBlbHNlIGlmIChlIDwgbGVuKSBzdHIgPSBzdHIuc2xpY2UoMCwgZSkgKyAnLicgKyBzdHIuc2xpY2UoZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3RyID0gKGJhc2VPdXQgPT0gMTYgPyAnMHgnIDogYmFzZU91dCA9PSAyID8gJzBiJyA6IGJhc2VPdXQgPT0gOCA/ICcwbycgOiAnJykgKyBzdHI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHgucyA8IDAgPyAnLScgKyBzdHIgOiBzdHI7XG4gIH1cblxuXG4gIC8vIERvZXMgbm90IHN0cmlwIHRyYWlsaW5nIHplcm9zLlxuICBmdW5jdGlvbiB0cnVuY2F0ZShhcnIsIGxlbikge1xuICAgIGlmIChhcnIubGVuZ3RoID4gbGVuKSB7XG4gICAgICBhcnIubGVuZ3RoID0gbGVuO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cblxuICAvLyBEZWNpbWFsIG1ldGhvZHNcblxuXG4gIC8qXG4gICAqICBhYnNcbiAgICogIGFjb3NcbiAgICogIGFjb3NoXG4gICAqICBhZGRcbiAgICogIGFzaW5cbiAgICogIGFzaW5oXG4gICAqICBhdGFuXG4gICAqICBhdGFuaFxuICAgKiAgYXRhbjJcbiAgICogIGNicnRcbiAgICogIGNlaWxcbiAgICogIGNsYW1wXG4gICAqICBjbG9uZVxuICAgKiAgY29uZmlnXG4gICAqICBjb3NcbiAgICogIGNvc2hcbiAgICogIGRpdlxuICAgKiAgZXhwXG4gICAqICBmbG9vclxuICAgKiAgaHlwb3RcbiAgICogIGxuXG4gICAqICBsb2dcbiAgICogIGxvZzJcbiAgICogIGxvZzEwXG4gICAqICBtYXhcbiAgICogIG1pblxuICAgKiAgbW9kXG4gICAqICBtdWxcbiAgICogIHBvd1xuICAgKiAgcmFuZG9tXG4gICAqICByb3VuZFxuICAgKiAgc2V0XG4gICAqICBzaWduXG4gICAqICBzaW5cbiAgICogIHNpbmhcbiAgICogIHNxcnRcbiAgICogIHN1YlxuICAgKiAgc3VtXG4gICAqICB0YW5cbiAgICogIHRhbmhcbiAgICogIHRydW5jXG4gICAqL1xuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIGB4YC5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gYWJzKHgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuYWJzKCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhcmNjb3NpbmUgaW4gcmFkaWFucyBvZiBgeGAuXG4gICAqXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGFjb3MoeCkge1xuICAgIHJldHVybiBuZXcgdGhpcyh4KS5hY29zKCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBoeXBlcmJvbGljIGNvc2luZSBvZiBgeGAsIHJvdW5kZWQgdG9cbiAgICogYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIHZhbHVlIGluIHJhZGlhbnMuXG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBhY29zaCh4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmFjb3NoKCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzdW0gb2YgYHhgIGFuZCBgeWAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKiB5IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBhZGQoeCwgeSkge1xuICAgIHJldHVybiBuZXcgdGhpcyh4KS5wbHVzKHkpO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgYXJjc2luZSBpbiByYWRpYW5zIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBhc2luKHgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuYXNpbigpO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaHlwZXJib2xpYyBzaW5lIG9mIGB4YCwgcm91bmRlZCB0b1xuICAgKiBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGFzaW5oKHgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuYXNpbmgoKTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFyY3RhbmdlbnQgaW4gcmFkaWFucyBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gYXRhbih4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmF0YW4oKTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGludmVyc2Ugb2YgdGhlIGh5cGVyYm9saWMgdGFuZ2VudCBvZiBgeGAsIHJvdW5kZWQgdG9cbiAgICogYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIHZhbHVlIGluIHJhZGlhbnMuXG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBhdGFuaCh4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmF0YW5oKCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhcmN0YW5nZW50IGluIHJhZGlhbnMgb2YgYHkveGAgaW4gdGhlIHJhbmdlIC1waSB0byBwaVxuICAgKiAoaW5jbHVzaXZlKSwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxuICAgKiBSYW5nZTogWy1waSwgcGldXG4gICAqXG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIHktY29vcmRpbmF0ZS5cbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgeC1jb29yZGluYXRlLlxuICAgKlxuICAgKiBhdGFuMijCsTAsIC0wKSAgICAgICAgICAgICAgID0gwrFwaVxuICAgKiBhdGFuMijCsTAsICswKSAgICAgICAgICAgICAgID0gwrEwXG4gICAqIGF0YW4yKMKxMCwgLXgpICAgICAgICAgICAgICAgPSDCsXBpIGZvciB4ID4gMFxuICAgKiBhdGFuMijCsTAsIHgpICAgICAgICAgICAgICAgID0gwrEwIGZvciB4ID4gMFxuICAgKiBhdGFuMigteSwgwrEwKSAgICAgICAgICAgICAgID0gLXBpLzIgZm9yIHkgPiAwXG4gICAqIGF0YW4yKHksIMKxMCkgICAgICAgICAgICAgICAgPSBwaS8yIGZvciB5ID4gMFxuICAgKiBhdGFuMijCsXksIC1JbmZpbml0eSkgICAgICAgID0gwrFwaSBmb3IgZmluaXRlIHkgPiAwXG4gICAqIGF0YW4yKMKxeSwgK0luZmluaXR5KSAgICAgICAgPSDCsTAgZm9yIGZpbml0ZSB5ID4gMFxuICAgKiBhdGFuMijCsUluZmluaXR5LCB4KSAgICAgICAgID0gwrFwaS8yIGZvciBmaW5pdGUgeFxuICAgKiBhdGFuMijCsUluZmluaXR5LCAtSW5maW5pdHkpID0gwrEzKnBpLzRcbiAgICogYXRhbjIowrFJbmZpbml0eSwgK0luZmluaXR5KSA9IMKxcGkvNFxuICAgKiBhdGFuMihOYU4sIHgpID0gTmFOXG4gICAqIGF0YW4yKHksIE5hTikgPSBOYU5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGF0YW4yKHksIHgpIHtcbiAgICB5ID0gbmV3IHRoaXMoeSk7XG4gICAgeCA9IG5ldyB0aGlzKHgpO1xuICAgIHZhciByLFxuICAgICAgcHIgPSB0aGlzLnByZWNpc2lvbixcbiAgICAgIHJtID0gdGhpcy5yb3VuZGluZyxcbiAgICAgIHdwciA9IHByICsgNDtcblxuICAgIC8vIEVpdGhlciBOYU5cbiAgICBpZiAoIXkucyB8fCAheC5zKSB7XG4gICAgICByID0gbmV3IHRoaXMoTmFOKTtcblxuICAgICAgLy8gQm90aCDCsUluZmluaXR5XG4gICAgfSBlbHNlIGlmICgheS5kICYmICF4LmQpIHtcbiAgICAgIHIgPSBnZXRQaSh0aGlzLCB3cHIsIDEpLnRpbWVzKHgucyA+IDAgPyAwLjI1IDogMC43NSk7XG4gICAgICByLnMgPSB5LnM7XG5cbiAgICAgIC8vIHggaXMgwrFJbmZpbml0eSBvciB5IGlzIMKxMFxuICAgIH0gZWxzZSBpZiAoIXguZCB8fCB5LmlzWmVybygpKSB7XG4gICAgICByID0geC5zIDwgMCA/IGdldFBpKHRoaXMsIHByLCBybSkgOiBuZXcgdGhpcygwKTtcbiAgICAgIHIucyA9IHkucztcblxuICAgICAgLy8geSBpcyDCsUluZmluaXR5IG9yIHggaXMgwrEwXG4gICAgfSBlbHNlIGlmICgheS5kIHx8IHguaXNaZXJvKCkpIHtcbiAgICAgIHIgPSBnZXRQaSh0aGlzLCB3cHIsIDEpLnRpbWVzKDAuNSk7XG4gICAgICByLnMgPSB5LnM7XG5cbiAgICAgIC8vIEJvdGggbm9uLXplcm8gYW5kIGZpbml0ZVxuICAgIH0gZWxzZSBpZiAoeC5zIDwgMCkge1xuICAgICAgdGhpcy5wcmVjaXNpb24gPSB3cHI7XG4gICAgICB0aGlzLnJvdW5kaW5nID0gMTtcbiAgICAgIHIgPSB0aGlzLmF0YW4oZGl2aWRlKHksIHgsIHdwciwgMSkpO1xuICAgICAgeCA9IGdldFBpKHRoaXMsIHdwciwgMSk7XG4gICAgICB0aGlzLnByZWNpc2lvbiA9IHByO1xuICAgICAgdGhpcy5yb3VuZGluZyA9IHJtO1xuICAgICAgciA9IHkucyA8IDAgPyByLm1pbnVzKHgpIDogci5wbHVzKHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByID0gdGhpcy5hdGFuKGRpdmlkZSh5LCB4LCB3cHIsIDEpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcjtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGN1YmUgcm9vdCBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gY2JydCh4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmNicnQoKTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIHJvdW5kZWQgdG8gYW4gaW50ZWdlciB1c2luZyBgUk9VTkRfQ0VJTGAuXG4gICAqXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGNlaWwoeCkge1xuICAgIHJldHVybiBmaW5hbGlzZSh4ID0gbmV3IHRoaXMoeCksIHguZSArIDEsIDIpO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyBgeGAgY2xhbXBlZCB0byB0aGUgcmFuZ2UgZGVsaW5lYXRlZCBieSBgbWluYCBhbmQgYG1heGAuXG4gICAqXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICogbWluIHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqIG1heCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gY2xhbXAoeCwgbWluLCBtYXgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuY2xhbXAobWluLCBtYXgpO1xuICB9XG5cblxuICAvKlxuICAgKiBDb25maWd1cmUgZ2xvYmFsIHNldHRpbmdzIGZvciBhIERlY2ltYWwgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIGBvYmpgIGlzIGFuIG9iamVjdCB3aXRoIG9uZSBvciBtb3JlIG9mIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllcyxcbiAgICpcbiAgICogICBwcmVjaXNpb24gIHtudW1iZXJ9XG4gICAqICAgcm91bmRpbmcgICB7bnVtYmVyfVxuICAgKiAgIHRvRXhwTmVnICAge251bWJlcn1cbiAgICogICB0b0V4cFBvcyAgIHtudW1iZXJ9XG4gICAqICAgbWF4RSAgICAgICB7bnVtYmVyfVxuICAgKiAgIG1pbkUgICAgICAge251bWJlcn1cbiAgICogICBtb2R1bG8gICAgIHtudW1iZXJ9XG4gICAqICAgY3J5cHRvICAgICB7Ym9vbGVhbnxudW1iZXJ9XG4gICAqICAgZGVmYXVsdHMgICB7dHJ1ZX1cbiAgICpcbiAgICogRS5nLiBEZWNpbWFsLmNvbmZpZyh7IHByZWNpc2lvbjogMjAsIHJvdW5kaW5nOiA0IH0pXG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBjb25maWcob2JqKSB7XG4gICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHRocm93IEVycm9yKGRlY2ltYWxFcnJvciArICdPYmplY3QgZXhwZWN0ZWQnKTtcbiAgICB2YXIgaSwgcCwgdixcbiAgICAgIHVzZURlZmF1bHRzID0gb2JqLmRlZmF1bHRzID09PSB0cnVlLFxuICAgICAgcHMgPSBbXG4gICAgICAgICdwcmVjaXNpb24nLCAxLCBNQVhfRElHSVRTLFxuICAgICAgICAncm91bmRpbmcnLCAwLCA4LFxuICAgICAgICAndG9FeHBOZWcnLCAtRVhQX0xJTUlULCAwLFxuICAgICAgICAndG9FeHBQb3MnLCAwLCBFWFBfTElNSVQsXG4gICAgICAgICdtYXhFJywgMCwgRVhQX0xJTUlULFxuICAgICAgICAnbWluRScsIC1FWFBfTElNSVQsIDAsXG4gICAgICAgICdtb2R1bG8nLCAwLCA5XG4gICAgICBdO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHBzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICBpZiAocCA9IHBzW2ldLCB1c2VEZWZhdWx0cykgdGhpc1twXSA9IERFRkFVTFRTW3BdO1xuICAgICAgaWYgKCh2ID0gb2JqW3BdKSAhPT0gdm9pZCAwKSB7XG4gICAgICAgIGlmIChtYXRoZmxvb3IodikgPT09IHYgJiYgdiA+PSBwc1tpICsgMV0gJiYgdiA8PSBwc1tpICsgMl0pIHRoaXNbcF0gPSB2O1xuICAgICAgICBlbHNlIHRocm93IEVycm9yKGludmFsaWRBcmd1bWVudCArIHAgKyAnOiAnICsgdik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHAgPSAnY3J5cHRvJywgdXNlRGVmYXVsdHMpIHRoaXNbcF0gPSBERUZBVUxUU1twXTtcbiAgICBpZiAoKHYgPSBvYmpbcF0pICE9PSB2b2lkIDApIHtcbiAgICAgIGlmICh2ID09PSB0cnVlIHx8IHYgPT09IGZhbHNlIHx8IHYgPT09IDAgfHwgdiA9PT0gMSkge1xuICAgICAgICBpZiAodikge1xuICAgICAgICAgIGlmICh0eXBlb2YgY3J5cHRvICE9ICd1bmRlZmluZWQnICYmIGNyeXB0byAmJlxuICAgICAgICAgICAgICAoY3J5cHRvLmdldFJhbmRvbVZhbHVlcyB8fCBjcnlwdG8ucmFuZG9tQnl0ZXMpKSB7XG4gICAgICAgICAgICB0aGlzW3BdID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoY3J5cHRvVW5hdmFpbGFibGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzW3BdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IEVycm9yKGludmFsaWRBcmd1bWVudCArIHAgKyAnOiAnICsgdik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBjb3NpbmUgb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50XG4gICAqIGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gQSB2YWx1ZSBpbiByYWRpYW5zLlxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gY29zKHgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuY29zKCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBoeXBlcmJvbGljIGNvc2luZSBvZiBgeGAsIHJvdW5kZWQgdG8gcHJlY2lzaW9uXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gQSB2YWx1ZSBpbiByYWRpYW5zLlxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gY29zaCh4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmNvc2goKTtcbiAgfVxuXG5cbiAgLypcbiAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBEZWNpbWFsIGNvbnN0cnVjdG9yIHdpdGggdGhlIHNhbWUgY29uZmlndXJhdGlvbiBwcm9wZXJ0aWVzIGFzIHRoaXMgRGVjaW1hbFxuICAgKiBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGNsb25lKG9iaikge1xuICAgIHZhciBpLCBwLCBwcztcblxuICAgIC8qXG4gICAgICogVGhlIERlY2ltYWwgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxuICAgICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogdiB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIG51bWVyaWMgdmFsdWUuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEZWNpbWFsKHYpIHtcbiAgICAgIHZhciBlLCBpLCB0LFxuICAgICAgICB4ID0gdGhpcztcblxuICAgICAgLy8gRGVjaW1hbCBjYWxsZWQgd2l0aG91dCBuZXcuXG4gICAgICBpZiAoISh4IGluc3RhbmNlb2YgRGVjaW1hbCkpIHJldHVybiBuZXcgRGVjaW1hbCh2KTtcblxuICAgICAgLy8gUmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoaXMgRGVjaW1hbCBjb25zdHJ1Y3RvciwgYW5kIHNoYWRvdyBEZWNpbWFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvclxuICAgICAgLy8gd2hpY2ggcG9pbnRzIHRvIE9iamVjdC5cbiAgICAgIHguY29uc3RydWN0b3IgPSBEZWNpbWFsO1xuXG4gICAgICAvLyBEdXBsaWNhdGUuXG4gICAgICBpZiAoaXNEZWNpbWFsSW5zdGFuY2UodikpIHtcbiAgICAgICAgeC5zID0gdi5zO1xuXG4gICAgICAgIGlmIChleHRlcm5hbCkge1xuICAgICAgICAgIGlmICghdi5kIHx8IHYuZSA+IERlY2ltYWwubWF4RSkge1xuXG4gICAgICAgICAgICAvLyBJbmZpbml0eS5cbiAgICAgICAgICAgIHguZSA9IE5hTjtcbiAgICAgICAgICAgIHguZCA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIGlmICh2LmUgPCBEZWNpbWFsLm1pbkUpIHtcblxuICAgICAgICAgICAgLy8gWmVyby5cbiAgICAgICAgICAgIHguZSA9IDA7XG4gICAgICAgICAgICB4LmQgPSBbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHguZSA9IHYuZTtcbiAgICAgICAgICAgIHguZCA9IHYuZC5zbGljZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4LmUgPSB2LmU7XG4gICAgICAgICAgeC5kID0gdi5kID8gdi5kLnNsaWNlKCkgOiB2LmQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHQgPSB0eXBlb2YgdjtcblxuICAgICAgaWYgKHQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlmICh2ID09PSAwKSB7XG4gICAgICAgICAgeC5zID0gMSAvIHYgPCAwID8gLTEgOiAxO1xuICAgICAgICAgIHguZSA9IDA7XG4gICAgICAgICAgeC5kID0gWzBdO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2IDwgMCkge1xuICAgICAgICAgIHYgPSAtdjtcbiAgICAgICAgICB4LnMgPSAtMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4LnMgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmFzdCBwYXRoIGZvciBzbWFsbCBpbnRlZ2Vycy5cbiAgICAgICAgaWYgKHYgPT09IH5+diAmJiB2IDwgMWU3KSB7XG4gICAgICAgICAgZm9yIChlID0gMCwgaSA9IHY7IGkgPj0gMTA7IGkgLz0gMTApIGUrKztcblxuICAgICAgICAgIGlmIChleHRlcm5hbCkge1xuICAgICAgICAgICAgaWYgKGUgPiBEZWNpbWFsLm1heEUpIHtcbiAgICAgICAgICAgICAgeC5lID0gTmFOO1xuICAgICAgICAgICAgICB4LmQgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlIDwgRGVjaW1hbC5taW5FKSB7XG4gICAgICAgICAgICAgIHguZSA9IDA7XG4gICAgICAgICAgICAgIHguZCA9IFswXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHguZSA9IGU7XG4gICAgICAgICAgICAgIHguZCA9IFt2XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeC5lID0gZTtcbiAgICAgICAgICAgIHguZCA9IFt2XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAvLyBJbmZpbml0eSwgTmFOLlxuICAgICAgICB9IGVsc2UgaWYgKHYgKiAwICE9PSAwKSB7XG4gICAgICAgICAgaWYgKCF2KSB4LnMgPSBOYU47XG4gICAgICAgICAgeC5lID0gTmFOO1xuICAgICAgICAgIHguZCA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnNlRGVjaW1hbCh4LCB2LnRvU3RyaW5nKCkpO1xuXG4gICAgICB9IGVsc2UgaWYgKHQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IEVycm9yKGludmFsaWRBcmd1bWVudCArIHYpO1xuICAgICAgfVxuXG4gICAgICAvLyBNaW51cyBzaWduP1xuICAgICAgaWYgKChpID0gdi5jaGFyQ29kZUF0KDApKSA9PT0gNDUpIHtcbiAgICAgICAgdiA9IHYuc2xpY2UoMSk7XG4gICAgICAgIHgucyA9IC0xO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUGx1cyBzaWduP1xuICAgICAgICBpZiAoaSA9PT0gNDMpIHYgPSB2LnNsaWNlKDEpO1xuICAgICAgICB4LnMgPSAxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaXNEZWNpbWFsLnRlc3QodikgPyBwYXJzZURlY2ltYWwoeCwgdikgOiBwYXJzZU90aGVyKHgsIHYpO1xuICAgIH1cblxuICAgIERlY2ltYWwucHJvdG90eXBlID0gUDtcblxuICAgIERlY2ltYWwuUk9VTkRfVVAgPSAwO1xuICAgIERlY2ltYWwuUk9VTkRfRE9XTiA9IDE7XG4gICAgRGVjaW1hbC5ST1VORF9DRUlMID0gMjtcbiAgICBEZWNpbWFsLlJPVU5EX0ZMT09SID0gMztcbiAgICBEZWNpbWFsLlJPVU5EX0hBTEZfVVAgPSA0O1xuICAgIERlY2ltYWwuUk9VTkRfSEFMRl9ET1dOID0gNTtcbiAgICBEZWNpbWFsLlJPVU5EX0hBTEZfRVZFTiA9IDY7XG4gICAgRGVjaW1hbC5ST1VORF9IQUxGX0NFSUwgPSA3O1xuICAgIERlY2ltYWwuUk9VTkRfSEFMRl9GTE9PUiA9IDg7XG4gICAgRGVjaW1hbC5FVUNMSUQgPSA5O1xuXG4gICAgRGVjaW1hbC5jb25maWcgPSBEZWNpbWFsLnNldCA9IGNvbmZpZztcbiAgICBEZWNpbWFsLmNsb25lID0gY2xvbmU7XG4gICAgRGVjaW1hbC5pc0RlY2ltYWwgPSBpc0RlY2ltYWxJbnN0YW5jZTtcblxuICAgIERlY2ltYWwuYWJzID0gYWJzO1xuICAgIERlY2ltYWwuYWNvcyA9IGFjb3M7XG4gICAgRGVjaW1hbC5hY29zaCA9IGFjb3NoOyAgICAgICAgLy8gRVM2XG4gICAgRGVjaW1hbC5hZGQgPSBhZGQ7XG4gICAgRGVjaW1hbC5hc2luID0gYXNpbjtcbiAgICBEZWNpbWFsLmFzaW5oID0gYXNpbmg7ICAgICAgICAvLyBFUzZcbiAgICBEZWNpbWFsLmF0YW4gPSBhdGFuO1xuICAgIERlY2ltYWwuYXRhbmggPSBhdGFuaDsgICAgICAgIC8vIEVTNlxuICAgIERlY2ltYWwuYXRhbjIgPSBhdGFuMjtcbiAgICBEZWNpbWFsLmNicnQgPSBjYnJ0OyAgICAgICAgICAvLyBFUzZcbiAgICBEZWNpbWFsLmNlaWwgPSBjZWlsO1xuICAgIERlY2ltYWwuY2xhbXAgPSBjbGFtcDtcbiAgICBEZWNpbWFsLmNvcyA9IGNvcztcbiAgICBEZWNpbWFsLmNvc2ggPSBjb3NoOyAgICAgICAgICAvLyBFUzZcbiAgICBEZWNpbWFsLmRpdiA9IGRpdjtcbiAgICBEZWNpbWFsLmV4cCA9IGV4cDtcbiAgICBEZWNpbWFsLmZsb29yID0gZmxvb3I7XG4gICAgRGVjaW1hbC5oeXBvdCA9IGh5cG90OyAgICAgICAgLy8gRVM2XG4gICAgRGVjaW1hbC5sbiA9IGxuO1xuICAgIERlY2ltYWwubG9nID0gbG9nO1xuICAgIERlY2ltYWwubG9nMTAgPSBsb2cxMDsgICAgICAgIC8vIEVTNlxuICAgIERlY2ltYWwubG9nMiA9IGxvZzI7ICAgICAgICAgIC8vIEVTNlxuICAgIERlY2ltYWwubWF4ID0gbWF4O1xuICAgIERlY2ltYWwubWluID0gbWluO1xuICAgIERlY2ltYWwubW9kID0gbW9kO1xuICAgIERlY2ltYWwubXVsID0gbXVsO1xuICAgIERlY2ltYWwucG93ID0gcG93O1xuICAgIERlY2ltYWwucmFuZG9tID0gcmFuZG9tO1xuICAgIERlY2ltYWwucm91bmQgPSByb3VuZDtcbiAgICBEZWNpbWFsLnNpZ24gPSBzaWduOyAgICAgICAgICAvLyBFUzZcbiAgICBEZWNpbWFsLnNpbiA9IHNpbjtcbiAgICBEZWNpbWFsLnNpbmggPSBzaW5oOyAgICAgICAgICAvLyBFUzZcbiAgICBEZWNpbWFsLnNxcnQgPSBzcXJ0O1xuICAgIERlY2ltYWwuc3ViID0gc3ViO1xuICAgIERlY2ltYWwuc3VtID0gc3VtO1xuICAgIERlY2ltYWwudGFuID0gdGFuO1xuICAgIERlY2ltYWwudGFuaCA9IHRhbmg7ICAgICAgICAgIC8vIEVTNlxuICAgIERlY2ltYWwudHJ1bmMgPSB0cnVuYzsgICAgICAgIC8vIEVTNlxuXG4gICAgaWYgKG9iaiA9PT0gdm9pZCAwKSBvYmogPSB7fTtcbiAgICBpZiAob2JqKSB7XG4gICAgICBpZiAob2JqLmRlZmF1bHRzICE9PSB0cnVlKSB7XG4gICAgICAgIHBzID0gWydwcmVjaXNpb24nLCAncm91bmRpbmcnLCAndG9FeHBOZWcnLCAndG9FeHBQb3MnLCAnbWF4RScsICdtaW5FJywgJ21vZHVsbycsICdjcnlwdG8nXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBzLmxlbmd0aDspIGlmICghb2JqLmhhc093blByb3BlcnR5KHAgPSBwc1tpKytdKSkgb2JqW3BdID0gdGhpc1twXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBEZWNpbWFsLmNvbmZpZyhvYmopO1xuXG4gICAgcmV0dXJuIERlY2ltYWw7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCBkaXZpZGVkIGJ5IGB5YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudFxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGRpdih4LCB5KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmRpdih5KTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIG5hdHVyYWwgZXhwb25lbnRpYWwgb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIHBvd2VyIHRvIHdoaWNoIHRvIHJhaXNlIHRoZSBiYXNlIG9mIHRoZSBuYXR1cmFsIGxvZy5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGV4cCh4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmV4cCgpO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyBgeGAgcm91bmQgdG8gYW4gaW50ZWdlciB1c2luZyBgUk9VTkRfRkxPT1JgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBmbG9vcih4KSB7XG4gICAgcmV0dXJuIGZpbmFsaXNlKHggPSBuZXcgdGhpcyh4KSwgeC5lICsgMSwgMyk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgc3VtIG9mIHRoZSBzcXVhcmVzIG9mIHRoZSBhcmd1bWVudHMsXG4gICAqIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogaHlwb3QoYSwgYiwgLi4uKSA9IHNxcnQoYV4yICsgYl4yICsgLi4uKVxuICAgKlxuICAgKiBhcmd1bWVudHMge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGh5cG90KCkge1xuICAgIHZhciBpLCBuLFxuICAgICAgdCA9IG5ldyB0aGlzKDApO1xuXG4gICAgZXh0ZXJuYWwgPSBmYWxzZTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOykge1xuICAgICAgbiA9IG5ldyB0aGlzKGFyZ3VtZW50c1tpKytdKTtcbiAgICAgIGlmICghbi5kKSB7XG4gICAgICAgIGlmIChuLnMpIHtcbiAgICAgICAgICBleHRlcm5hbCA9IHRydWU7XG4gICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKDEgLyAwKTtcbiAgICAgICAgfVxuICAgICAgICB0ID0gbjtcbiAgICAgIH0gZWxzZSBpZiAodC5kKSB7XG4gICAgICAgIHQgPSB0LnBsdXMobi50aW1lcyhuKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHQuc3FydCgpO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gdHJ1ZSBpZiBvYmplY3QgaXMgYSBEZWNpbWFsIGluc3RhbmNlICh3aGVyZSBEZWNpbWFsIGlzIGFueSBEZWNpbWFsIGNvbnN0cnVjdG9yKSxcbiAgICogb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGlzRGVjaW1hbEluc3RhbmNlKG9iaikge1xuICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBEZWNpbWFsIHx8IG9iaiAmJiBvYmoudG9TdHJpbmdUYWcgPT09IHRhZyB8fCBmYWxzZTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIG5hdHVyYWwgbG9nYXJpdGhtIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBsbih4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmxuKCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBsb2cgb2YgYHhgIHRvIHRoZSBiYXNlIGB5YCwgb3IgdG8gYmFzZSAxMCBpZiBubyBiYXNlXG4gICAqIGlzIHNwZWNpZmllZCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiBsb2dbeV0oeClcbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgYXJndW1lbnQgb2YgdGhlIGxvZ2FyaXRobS5cbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgYmFzZSBvZiB0aGUgbG9nYXJpdGhtLlxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gbG9nKHgsIHkpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkubG9nKHkpO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgYmFzZSAyIGxvZ2FyaXRobSBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gbG9nMih4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmxvZygyKTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGJhc2UgMTAgbG9nYXJpdGhtIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBsb2cxMCh4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmxvZygxMCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBtYXhpbXVtIG9mIHRoZSBhcmd1bWVudHMuXG4gICAqXG4gICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gbWF4KCkge1xuICAgIHJldHVybiBtYXhPck1pbih0aGlzLCBhcmd1bWVudHMsICdsdCcpO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbWluaW11bSBvZiB0aGUgYXJndW1lbnRzLlxuICAgKlxuICAgKiBhcmd1bWVudHMge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIG1pbigpIHtcbiAgICByZXR1cm4gbWF4T3JNaW4odGhpcywgYXJndW1lbnRzLCAnZ3QnKTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIG1vZHVsbyBgeWAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzXG4gICAqIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKiB5IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBtb2QoeCwgeSkge1xuICAgIHJldHVybiBuZXcgdGhpcyh4KS5tb2QoeSk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCBtdWx0aXBsaWVkIGJ5IGB5YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudFxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIG11bCh4LCB5KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLm11bCh5KTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIHJhaXNlZCB0byB0aGUgcG93ZXIgYHlgLCByb3VuZGVkIHRvIHByZWNpc2lvblxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IFRoZSBiYXNlLlxuICAgKiB5IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IFRoZSBleHBvbmVudC5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIHBvdyh4LCB5KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnBvdyh5KTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJucyBhIG5ldyBEZWNpbWFsIHdpdGggYSByYW5kb20gdmFsdWUgZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuIDAgYW5kIGxlc3MgdGhhbiAxLCBhbmQgd2l0aFxuICAgKiBgc2RgLCBvciBgRGVjaW1hbC5wcmVjaXNpb25gIGlmIGBzZGAgaXMgb21pdHRlZCwgc2lnbmlmaWNhbnQgZGlnaXRzIChvciBsZXNzIGlmIHRyYWlsaW5nIHplcm9zXG4gICAqIGFyZSBwcm9kdWNlZCkuXG4gICAqXG4gICAqIFtzZF0ge251bWJlcn0gU2lnbmlmaWNhbnQgZGlnaXRzLiBJbnRlZ2VyLCAwIHRvIE1BWF9ESUdJVFMgaW5jbHVzaXZlLlxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gcmFuZG9tKHNkKSB7XG4gICAgdmFyIGQsIGUsIGssIG4sXG4gICAgICBpID0gMCxcbiAgICAgIHIgPSBuZXcgdGhpcygxKSxcbiAgICAgIHJkID0gW107XG5cbiAgICBpZiAoc2QgPT09IHZvaWQgMCkgc2QgPSB0aGlzLnByZWNpc2lvbjtcbiAgICBlbHNlIGNoZWNrSW50MzIoc2QsIDEsIE1BWF9ESUdJVFMpO1xuXG4gICAgayA9IE1hdGguY2VpbChzZCAvIExPR19CQVNFKTtcblxuICAgIGlmICghdGhpcy5jcnlwdG8pIHtcbiAgICAgIGZvciAoOyBpIDwgazspIHJkW2krK10gPSBNYXRoLnJhbmRvbSgpICogMWU3IHwgMDtcblxuICAgICAgLy8gQnJvd3NlcnMgc3VwcG9ydGluZyBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLlxuICAgIH0gZWxzZSBpZiAoY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgICAgZCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KGspKTtcblxuICAgICAgZm9yICg7IGkgPCBrOykge1xuICAgICAgICBuID0gZFtpXTtcblxuICAgICAgICAvLyAwIDw9IG4gPCA0Mjk0OTY3Mjk2XG4gICAgICAgIC8vIFByb2JhYmlsaXR5IG4gPj0gNC4yOWU5LCBpcyA0OTY3Mjk2IC8gNDI5NDk2NzI5NiA9IDAuMDAxMTYgKDEgaW4gODY1KS5cbiAgICAgICAgaWYgKG4gPj0gNC4yOWU5KSB7XG4gICAgICAgICAgZFtpXSA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KDEpKVswXTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIC8vIDAgPD0gbiA8PSA0Mjg5OTk5OTk5XG4gICAgICAgICAgLy8gMCA8PSAobiAlIDFlNykgPD0gOTk5OTk5OVxuICAgICAgICAgIHJkW2krK10gPSBuICUgMWU3O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE5vZGUuanMgc3VwcG9ydGluZyBjcnlwdG8ucmFuZG9tQnl0ZXMuXG4gICAgfSBlbHNlIGlmIChjcnlwdG8ucmFuZG9tQnl0ZXMpIHtcblxuICAgICAgLy8gYnVmZmVyXG4gICAgICBkID0gY3J5cHRvLnJhbmRvbUJ5dGVzKGsgKj0gNCk7XG5cbiAgICAgIGZvciAoOyBpIDwgazspIHtcblxuICAgICAgICAvLyAwIDw9IG4gPCAyMTQ3NDgzNjQ4XG4gICAgICAgIG4gPSBkW2ldICsgKGRbaSArIDFdIDw8IDgpICsgKGRbaSArIDJdIDw8IDE2KSArICgoZFtpICsgM10gJiAweDdmKSA8PCAyNCk7XG5cbiAgICAgICAgLy8gUHJvYmFiaWxpdHkgbiA+PSAyLjE0ZTksIGlzIDc0ODM2NDggLyAyMTQ3NDgzNjQ4ID0gMC4wMDM1ICgxIGluIDI4NikuXG4gICAgICAgIGlmIChuID49IDIuMTRlOSkge1xuICAgICAgICAgIGNyeXB0by5yYW5kb21CeXRlcyg0KS5jb3B5KGQsIGkpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgLy8gMCA8PSBuIDw9IDIxMzk5OTk5OTlcbiAgICAgICAgICAvLyAwIDw9IChuICUgMWU3KSA8PSA5OTk5OTk5XG4gICAgICAgICAgcmQucHVzaChuICUgMWU3KTtcbiAgICAgICAgICBpICs9IDQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaSA9IGsgLyA0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcihjcnlwdG9VbmF2YWlsYWJsZSk7XG4gICAgfVxuXG4gICAgayA9IHJkWy0taV07XG4gICAgc2QgJT0gTE9HX0JBU0U7XG5cbiAgICAvLyBDb252ZXJ0IHRyYWlsaW5nIGRpZ2l0cyB0byB6ZXJvcyBhY2NvcmRpbmcgdG8gc2QuXG4gICAgaWYgKGsgJiYgc2QpIHtcbiAgICAgIG4gPSBtYXRocG93KDEwLCBMT0dfQkFTRSAtIHNkKTtcbiAgICAgIHJkW2ldID0gKGsgLyBuIHwgMCkgKiBuO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB3b3JkcyB3aGljaCBhcmUgemVyby5cbiAgICBmb3IgKDsgcmRbaV0gPT09IDA7IGktLSkgcmQucG9wKCk7XG5cbiAgICAvLyBaZXJvP1xuICAgIGlmIChpIDwgMCkge1xuICAgICAgZSA9IDA7XG4gICAgICByZCA9IFswXTtcbiAgICB9IGVsc2Uge1xuICAgICAgZSA9IC0xO1xuXG4gICAgICAvLyBSZW1vdmUgbGVhZGluZyB3b3JkcyB3aGljaCBhcmUgemVybyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxuICAgICAgZm9yICg7IHJkWzBdID09PSAwOyBlIC09IExPR19CQVNFKSByZC5zaGlmdCgpO1xuXG4gICAgICAvLyBDb3VudCB0aGUgZGlnaXRzIG9mIHRoZSBmaXJzdCB3b3JkIG9mIHJkIHRvIGRldGVybWluZSBsZWFkaW5nIHplcm9zLlxuICAgICAgZm9yIChrID0gMSwgbiA9IHJkWzBdOyBuID49IDEwOyBuIC89IDEwKSBrKys7XG5cbiAgICAgIC8vIEFkanVzdCB0aGUgZXhwb25lbnQgZm9yIGxlYWRpbmcgemVyb3Mgb2YgdGhlIGZpcnN0IHdvcmQgb2YgcmQuXG4gICAgICBpZiAoayA8IExPR19CQVNFKSBlIC09IExPR19CQVNFIC0gaztcbiAgICB9XG5cbiAgICByLmUgPSBlO1xuICAgIHIuZCA9IHJkO1xuXG4gICAgcmV0dXJuIHI7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCByb3VuZGVkIHRvIGFuIGludGVnZXIgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiBUbyBlbXVsYXRlIGBNYXRoLnJvdW5kYCwgc2V0IHJvdW5kaW5nIHRvIDcgKFJPVU5EX0hBTEZfQ0VJTCkuXG4gICAqXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIHJvdW5kKHgpIHtcbiAgICByZXR1cm4gZmluYWxpc2UoeCA9IG5ldyB0aGlzKHgpLCB4LmUgKyAxLCB0aGlzLnJvdW5kaW5nKTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuXG4gICAqICAgMSAgICBpZiB4ID4gMCxcbiAgICogIC0xICAgIGlmIHggPCAwLFxuICAgKiAgIDAgICAgaWYgeCBpcyAwLFxuICAgKiAgLTAgICAgaWYgeCBpcyAtMCxcbiAgICogICBOYU4gIG90aGVyd2lzZVxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBzaWduKHgpIHtcbiAgICB4ID0gbmV3IHRoaXMoeCk7XG4gICAgcmV0dXJuIHguZCA/ICh4LmRbMF0gPyB4LnMgOiAwICogeC5zKSA6IHgucyB8fCBOYU47XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzaW5lIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHNcbiAgICogdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIHNpbih4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnNpbigpO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaHlwZXJib2xpYyBzaW5lIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIHNpbmgoeCkge1xuICAgIHJldHVybiBuZXcgdGhpcyh4KS5zaW5oKCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gc3FydCh4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnNxcnQoKTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIG1pbnVzIGB5YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHNcbiAgICogdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIHN1Yih4LCB5KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnN1Yih5KTtcbiAgfVxuXG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHN1bSBvZiB0aGUgYXJndW1lbnRzLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXG4gICAqXG4gICAqIE9ubHkgdGhlIHJlc3VsdCBpcyByb3VuZGVkLCBub3QgdGhlIGludGVybWVkaWF0ZSBjYWxjdWxhdGlvbnMuXG4gICAqXG4gICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gc3VtKCkge1xuICAgIHZhciBpID0gMCxcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICB4ID0gbmV3IHRoaXMoYXJnc1tpXSk7XG5cbiAgICBleHRlcm5hbCA9IGZhbHNlO1xuICAgIGZvciAoOyB4LnMgJiYgKytpIDwgYXJncy5sZW5ndGg7KSB4ID0geC5wbHVzKGFyZ3NbaV0pO1xuICAgIGV4dGVybmFsID0gdHJ1ZTtcblxuICAgIHJldHVybiBmaW5hbGlzZSh4LCB0aGlzLnByZWNpc2lvbiwgdGhpcy5yb3VuZGluZyk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB0YW5nZW50IG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudFxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIHRhbih4KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnRhbigpO1xuICB9XG5cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaHlwZXJib2xpYyB0YW5nZW50IG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxuICAgKlxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIHRhbmgoeCkge1xuICAgIHJldHVybiBuZXcgdGhpcyh4KS50YW5oKCk7XG4gIH1cblxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCB0cnVuY2F0ZWQgdG8gYW4gaW50ZWdlci5cbiAgICpcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gdHJ1bmMoeCkge1xuICAgIHJldHVybiBmaW5hbGlzZSh4ID0gbmV3IHRoaXMoeCksIHguZSArIDEsIDEpO1xuICB9XG5cblxuICAvLyBDcmVhdGUgYW5kIGNvbmZpZ3VyZSBpbml0aWFsIERlY2ltYWwgY29uc3RydWN0b3IuXG4gIERlY2ltYWwgPSBjbG9uZShERUZBVUxUUyk7XG4gIERlY2ltYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGVjaW1hbDtcbiAgRGVjaW1hbFsnZGVmYXVsdCddID0gRGVjaW1hbC5EZWNpbWFsID0gRGVjaW1hbDtcblxuICAvLyBDcmVhdGUgdGhlIGludGVybmFsIGNvbnN0YW50cyBmcm9tIHRoZWlyIHN0cmluZyB2YWx1ZXMuXG4gIExOMTAgPSBuZXcgRGVjaW1hbChMTjEwKTtcbiAgUEkgPSBuZXcgRGVjaW1hbChQSSk7XG5cblxuICAvLyBFeHBvcnQuXG5cblxuICAvLyBBTUQuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gRGVjaW1hbDtcbiAgICB9KTtcblxuICAgIC8vIE5vZGUgYW5kIG90aGVyIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIGlmICh0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJykge1xuICAgICAgUFtTeW1ib2xbJ2ZvciddKCdub2RlanMudXRpbC5pbnNwZWN0LmN1c3RvbScpXSA9IFAudG9TdHJpbmc7XG4gICAgICBQW1N5bWJvbC50b1N0cmluZ1RhZ10gPSAnRGVjaW1hbCc7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEZWNpbWFsO1xuXG4gICAgLy8gQnJvd3Nlci5cbiAgfSBlbHNlIHtcbiAgICBpZiAoIWdsb2JhbFNjb3BlKSB7XG4gICAgICBnbG9iYWxTY29wZSA9IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYgJiYgc2VsZi5zZWxmID09IHNlbGYgPyBzZWxmIDogd2luZG93O1xuICAgIH1cblxuICAgIG5vQ29uZmxpY3QgPSBnbG9iYWxTY29wZS5EZWNpbWFsO1xuICAgIERlY2ltYWwubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGdsb2JhbFNjb3BlLkRlY2ltYWwgPSBub0NvbmZsaWN0O1xuICAgICAgcmV0dXJuIERlY2ltYWw7XG4gICAgfTtcblxuICAgIGdsb2JhbFNjb3BlLkRlY2ltYWwgPSBEZWNpbWFsO1xuICB9XG59KSh0aGlzKTsiXSwibmFtZXMiOlsiZ2xvYmFsU2NvcGUiLCJFWFBfTElNSVQiLCJNQVhfRElHSVRTIiwiTlVNRVJBTFMiLCJMTjEwIiwiUEkiLCJERUZBVUxUUyIsInByZWNpc2lvbiIsInJvdW5kaW5nIiwibW9kdWxvIiwidG9FeHBOZWciLCJ0b0V4cFBvcyIsIm1pbkUiLCJtYXhFIiwiY3J5cHRvIiwiRGVjaW1hbCIsImluZXhhY3QiLCJub0NvbmZsaWN0IiwicXVhZHJhbnQiLCJleHRlcm5hbCIsImRlY2ltYWxFcnJvciIsImludmFsaWRBcmd1bWVudCIsInByZWNpc2lvbkxpbWl0RXhjZWVkZWQiLCJjcnlwdG9VbmF2YWlsYWJsZSIsInRhZyIsIm1hdGhmbG9vciIsIk1hdGgiLCJmbG9vciIsIm1hdGhwb3ciLCJwb3ciLCJpc0JpbmFyeSIsImlzSGV4IiwiaXNPY3RhbCIsImlzRGVjaW1hbCIsIkJBU0UiLCJMT0dfQkFTRSIsIk1BWF9TQUZFX0lOVEVHRVIiLCJMTjEwX1BSRUNJU0lPTiIsImxlbmd0aCIsIlBJX1BSRUNJU0lPTiIsIlAiLCJ0b1N0cmluZ1RhZyIsImFic29sdXRlVmFsdWUiLCJhYnMiLCJ4IiwiY29uc3RydWN0b3IiLCJzIiwiZmluYWxpc2UiLCJjZWlsIiwiZSIsImNsYW1wZWRUbyIsImNsYW1wIiwibWluIiwibWF4IiwiayIsIkN0b3IiLCJOYU4iLCJndCIsIkVycm9yIiwiY21wIiwiY29tcGFyZWRUbyIsInkiLCJpIiwiaiIsInhkTCIsInlkTCIsInhkIiwiZCIsInlkIiwieHMiLCJ5cyIsImNvc2luZSIsImNvcyIsInByIiwicm0iLCJzZCIsInRvTGVzc1RoYW5IYWxmUGkiLCJuZWciLCJjdWJlUm9vdCIsImNicnQiLCJtIiwibiIsInIiLCJyZXAiLCJ0IiwidDMiLCJ0M3BsdXN4IiwiaXNGaW5pdGUiLCJpc1plcm8iLCJkaWdpdHNUb1N0cmluZyIsInRvRXhwb25lbnRpYWwiLCJzbGljZSIsImluZGV4T2YiLCJ0b1N0cmluZyIsInRpbWVzIiwicGx1cyIsImRpdmlkZSIsImVxIiwiY2hhckF0IiwiZGVjaW1hbFBsYWNlcyIsImRwIiwidyIsImRpdmlkZWRCeSIsImRpdiIsImRpdmlkZWRUb0ludGVnZXJCeSIsImRpdlRvSW50IiwiZXF1YWxzIiwiZ3JlYXRlclRoYW4iLCJncmVhdGVyVGhhbk9yRXF1YWxUbyIsImd0ZSIsImh5cGVyYm9saWNDb3NpbmUiLCJjb3NoIiwibGVuIiwib25lIiwidGlueVBvdyIsInRheWxvclNlcmllcyIsImNvc2gyX3giLCJkOCIsIm1pbnVzIiwiaHlwZXJib2xpY1NpbmUiLCJzaW5oIiwic3FydCIsInNpbmgyX3giLCJkNSIsImQxNiIsImQyMCIsImh5cGVyYm9saWNUYW5nZW50IiwidGFuaCIsImludmVyc2VDb3NpbmUiLCJhY29zIiwiaGFsZlBpIiwiaXNOZWciLCJnZXRQaSIsImFzaW4iLCJpbnZlcnNlSHlwZXJib2xpY0Nvc2luZSIsImFjb3NoIiwibHRlIiwibG4iLCJpbnZlcnNlSHlwZXJib2xpY1NpbmUiLCJhc2luaCIsImludmVyc2VIeXBlcmJvbGljVGFuZ2VudCIsImF0YW5oIiwid3ByIiwieHNkIiwiaW52ZXJzZVNpbmUiLCJhdGFuIiwiaW52ZXJzZVRhbmdlbnQiLCJweCIsIngyIiwiaXNJbnRlZ2VyIiwiaXNJbnQiLCJpc05hTiIsImlzTmVnYXRpdmUiLCJpc1Bvc2l0aXZlIiwiaXNQb3MiLCJsZXNzVGhhbiIsImx0IiwibGVzc1RoYW5PckVxdWFsVG8iLCJsb2dhcml0aG0iLCJsb2ciLCJiYXNlIiwiaXNCYXNlMTAiLCJkZW5vbWluYXRvciIsImluZiIsIm51bSIsImFyZyIsImd1YXJkIiwibmF0dXJhbExvZ2FyaXRobSIsImdldExuMTAiLCJjaGVja1JvdW5kaW5nRGlnaXRzIiwic3ViIiwieGUiLCJ4TFR5IiwicmV2ZXJzZSIsInB1c2giLCJwb3AiLCJzaGlmdCIsImdldEJhc2UxMEV4cG9uZW50IiwibW9kIiwicSIsIm5hdHVyYWxFeHBvbmVudGlhbCIsImV4cCIsIm5lZ2F0ZWQiLCJhZGQiLCJjYXJyeSIsInVuc2hpZnQiLCJ6IiwiZ2V0UHJlY2lzaW9uIiwicm91bmQiLCJzaW5lIiwic2luIiwic3F1YXJlUm9vdCIsInRhbmdlbnQiLCJ0YW4iLCJtdWwiLCJyTCIsInRvQmluYXJ5IiwidG9TdHJpbmdCaW5hcnkiLCJ0b0RlY2ltYWxQbGFjZXMiLCJ0b0RQIiwiY2hlY2tJbnQzMiIsInN0ciIsImZpbml0ZVRvU3RyaW5nIiwidG9GaXhlZCIsInRvRnJhY3Rpb24iLCJtYXhEIiwiZDAiLCJkMSIsImQyIiwibjAiLCJuMSIsInRvSGV4YWRlY2ltYWwiLCJ0b0hleCIsInRvTmVhcmVzdCIsInRvTnVtYmVyIiwidG9PY3RhbCIsInRvUG93ZXIiLCJ5biIsImludFBvdyIsInRvUHJlY2lzaW9uIiwidG9TaWduaWZpY2FudERpZ2l0cyIsInRvU0QiLCJ0cnVuY2F0ZWQiLCJ0cnVuYyIsInZhbHVlT2YiLCJ0b0pTT04iLCJ3cyIsImluZGV4T2ZMYXN0V29yZCIsImdldFplcm9TdHJpbmciLCJyZXBlYXRpbmciLCJkaSIsInJkIiwiY29udmVydEJhc2UiLCJiYXNlSW4iLCJiYXNlT3V0IiwiYXJyIiwiYXJyTCIsInN0ckwiLCJjb3MyeCIsIm11bHRpcGx5SW50ZWdlciIsInRlbXAiLCJjb21wYXJlIiwiYSIsImIiLCJhTCIsImJMIiwic3VidHJhY3QiLCJsb2dCYXNlIiwibW9yZSIsInByb2QiLCJwcm9kTCIsInFkIiwicmVtIiwicmVtTCIsInJlbTAiLCJ4aSIsInhMIiwieWQwIiwieUwiLCJ5eiIsInNpZ24iLCJpc1RydW5jYXRlZCIsImRpZ2l0cyIsInJvdW5kVXAiLCJ4ZGkiLCJvdXQiLCJpc0V4cCIsIm5vbkZpbml0ZVRvU3RyaW5nIiwienMiLCJ0cnVuY2F0ZSIsImlzT2RkIiwibWF4T3JNaW4iLCJhcmdzIiwibHRndCIsInN1bSIsImMiLCJjMCIsIm51bWVyYXRvciIsIngxIiwiU3RyaW5nIiwicGFyc2VEZWNpbWFsIiwicmVwbGFjZSIsInNlYXJjaCIsInN1YnN0cmluZyIsImNoYXJDb2RlQXQiLCJwYXJzZU90aGVyIiwiZGl2aXNvciIsImlzRmxvYXQiLCJwIiwidGVzdCIsInRvTG93ZXJDYXNlIiwic2luMl94IiwiaXNIeXBlcmJvbGljIiwidSIsInBpIiwiYXRhbjIiLCJjb25maWciLCJvYmoiLCJ2IiwidXNlRGVmYXVsdHMiLCJkZWZhdWx0cyIsInBzIiwiZ2V0UmFuZG9tVmFsdWVzIiwicmFuZG9tQnl0ZXMiLCJjbG9uZSIsImlzRGVjaW1hbEluc3RhbmNlIiwicHJvdG90eXBlIiwiUk9VTkRfVVAiLCJST1VORF9ET1dOIiwiUk9VTkRfQ0VJTCIsIlJPVU5EX0ZMT09SIiwiUk9VTkRfSEFMRl9VUCIsIlJPVU5EX0hBTEZfRE9XTiIsIlJPVU5EX0hBTEZfRVZFTiIsIlJPVU5EX0hBTEZfQ0VJTCIsIlJPVU5EX0hBTEZfRkxPT1IiLCJFVUNMSUQiLCJzZXQiLCJoeXBvdCIsImxvZzEwIiwibG9nMiIsInJhbmRvbSIsImhhc093blByb3BlcnR5IiwiYXJndW1lbnRzIiwiVWludDMyQXJyYXkiLCJjb3B5IiwiZGVmaW5lIiwiYW1kIiwibW9kdWxlIiwiZXhwb3J0cyIsIlN5bWJvbCIsIml0ZXJhdG9yIiwic2VsZiIsIndpbmRvdyJdLCJtYXBwaW5ncyI6IkFBQUUsQ0FBQSxTQUFVQSxXQUFXO0lBQ3JCO0lBR0E7Ozs7OztHQU1DLEdBR0Qsa0dBQWtHO0lBR2xHLGtDQUFrQztJQUNs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