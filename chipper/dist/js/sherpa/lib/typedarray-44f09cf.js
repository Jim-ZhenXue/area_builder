/*
 Copyright (c) 2010, Linden Research, Inc.
 Copyright (c) 2014, Joshua Bell

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 $/LicenseInfo$
 */ // Original can be found at:
//   https://bitbucket.org/lindenlab/llsd
// Modifications by Joshua Bell inexorabletash@gmail.com
//   https://github.com/inexorabletash/polyfill
// ES3/ES5 implementation of the Krhonos Typed Array Specification
//   Ref: http://www.khronos.org/registry/typedarray/specs/latest/
//   Date: 2011-02-01
//
// Variations:
//  * Allows typed_array.get/set() as alias for subscripts (typed_array[])
//  * Gradually migrating structure from Khronos spec to ES6 spec
(function(global) {
    'use strict';
    var undefined = void 0; // Paranoia
    // Beyond this value, index getters/setters (i.e. array[0], array[1]) are so slow to
    // create, and consume so much memory, that the browser appears frozen.
    var MAX_ARRAY_LENGTH = 1e5;
    // Approximations of internal ECMAScript conversion functions
    function Type(v) {
        switch(typeof v){
            case 'undefined':
                return 'undefined';
            case 'boolean':
                return 'boolean';
            case 'number':
                return 'number';
            case 'string':
                return 'string';
            default:
                return v === null ? 'null' : 'object';
        }
    }
    // Class returns internal [[Class]] property, used to avoid cross-frame instanceof issues:
    function Class(v) {
        return Object.prototype.toString.call(v).replace(/^\[object *|\]$/g, '');
    }
    function IsCallable(o) {
        return typeof o === 'function';
    }
    function ToObject(v) {
        if (v === null || v === undefined) throw TypeError();
        return Object(v);
    }
    function ToInt32(v) {
        return v >> 0;
    }
    function ToUint32(v) {
        return v >>> 0;
    }
    // Snapshot intrinsics
    var LN2 = Math.LN2, abs = Math.abs, floor = Math.floor, log = Math.log, max = Math.max, min = Math.min, pow = Math.pow, round = Math.round;
    // emulate ES5 getter/setter API using legacy APIs
    // http://blogs.msdn.com/b/ie/archive/2010/09/07/transitioning-existing-code-to-the-es5-getter-setter-apis.aspx
    // (second clause tests for Object.defineProperty() in IE<9 that only supports extending DOM prototypes, but
    // note that IE<9 does not support __defineGetter__ or __defineSetter__ so it just renders the method harmless)
    (function() {
        var orig = Object.defineProperty;
        var dom_only = !function() {
            try {
                return Object.defineProperty({}, 'x', {});
            } catch (_) {
                return false;
            }
        }();
        if (!orig || dom_only) {
            Object.defineProperty = function(o, prop, desc) {
                // In IE8 try built-in implementation for defining properties on DOM prototypes.
                if (orig) try {
                    return orig(o, prop, desc);
                } catch (_) {}
                if (o !== Object(o)) throw TypeError('Object.defineProperty called on non-object');
                if (Object.prototype.__defineGetter__ && 'get' in desc) Object.prototype.__defineGetter__.call(o, prop, desc.get);
                if (Object.prototype.__defineSetter__ && 'set' in desc) Object.prototype.__defineSetter__.call(o, prop, desc.set);
                if ('value' in desc) o[prop] = desc.value;
                return o;
            };
        }
    })();
    // ES5: Make obj[index] an alias for obj._getter(index)/obj._setter(index, value)
    // for index in 0 ... obj.length
    function makeArrayAccessors(obj) {
        if (obj.length > MAX_ARRAY_LENGTH) throw RangeError('Array too large for polyfill');
        function makeArrayAccessor(index) {
            Object.defineProperty(obj, index, {
                'get': function() {
                    return obj._getter(index);
                },
                'set': function(v) {
                    obj._setter(index, v);
                },
                enumerable: true,
                configurable: false
            });
        }
        var i;
        for(i = 0; i < obj.length; i += 1){
            makeArrayAccessor(i);
        }
    }
    // Internal conversion functions:
    //    pack<Type>()   - take a number (interpreted as Type), output a byte array
    //    unpack<Type>() - take a byte array, output a Type-like number
    function as_signed(value, bits) {
        var s = 32 - bits;
        return value << s >> s;
    }
    function as_unsigned(value, bits) {
        var s = 32 - bits;
        return value << s >>> s;
    }
    function packI8(n) {
        return [
            n & 0xff
        ];
    }
    function unpackI8(bytes) {
        return as_signed(bytes[0], 8);
    }
    function packU8(n) {
        return [
            n & 0xff
        ];
    }
    function unpackU8(bytes) {
        return as_unsigned(bytes[0], 8);
    }
    function packU8Clamped(n) {
        n = round(Number(n));
        return [
            n < 0 ? 0 : n > 0xff ? 0xff : n & 0xff
        ];
    }
    function packI16(n) {
        return [
            n >> 8 & 0xff,
            n & 0xff
        ];
    }
    function unpackI16(bytes) {
        return as_signed(bytes[0] << 8 | bytes[1], 16);
    }
    function packU16(n) {
        return [
            n >> 8 & 0xff,
            n & 0xff
        ];
    }
    function unpackU16(bytes) {
        return as_unsigned(bytes[0] << 8 | bytes[1], 16);
    }
    function packI32(n) {
        return [
            n >> 24 & 0xff,
            n >> 16 & 0xff,
            n >> 8 & 0xff,
            n & 0xff
        ];
    }
    function unpackI32(bytes) {
        return as_signed(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32);
    }
    function packU32(n) {
        return [
            n >> 24 & 0xff,
            n >> 16 & 0xff,
            n >> 8 & 0xff,
            n & 0xff
        ];
    }
    function unpackU32(bytes) {
        return as_unsigned(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32);
    }
    function packIEEE754(v, ebits, fbits) {
        var bias = (1 << ebits - 1) - 1, s, e, f, ln, i, bits, str, bytes;
        function roundToEven(n) {
            var w = floor(n), f = n - w;
            if (f < 0.5) return w;
            if (f > 0.5) return w + 1;
            return w % 2 ? w + 1 : w;
        }
        // Compute sign, exponent, fraction
        if (v !== v) {
            // NaN
            // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
            e = (1 << ebits) - 1;
            f = pow(2, fbits - 1);
            s = 0;
        } else if (v === Infinity || v === -Infinity) {
            e = (1 << ebits) - 1;
            f = 0;
            s = v < 0 ? 1 : 0;
        } else if (v === 0) {
            e = 0;
            f = 0;
            s = 1 / v === -Infinity ? 1 : 0;
        } else {
            s = v < 0;
            v = abs(v);
            if (v >= pow(2, 1 - bias)) {
                e = min(floor(log(v) / LN2), 1023);
                f = roundToEven(v / pow(2, e) * pow(2, fbits));
                if (f / pow(2, fbits) >= 2) {
                    e = e + 1;
                    f = 1;
                }
                if (e > bias) {
                    // Overflow
                    e = (1 << ebits) - 1;
                    f = 0;
                } else {
                    // Normalized
                    e = e + bias;
                    f = f - pow(2, fbits);
                }
            } else {
                // Denormalized
                e = 0;
                f = roundToEven(v / pow(2, 1 - bias - fbits));
            }
        }
        // Pack sign, exponent, fraction
        bits = [];
        for(i = fbits; i; i -= 1){
            bits.push(f % 2 ? 1 : 0);
            f = floor(f / 2);
        }
        for(i = ebits; i; i -= 1){
            bits.push(e % 2 ? 1 : 0);
            e = floor(e / 2);
        }
        bits.push(s ? 1 : 0);
        bits.reverse();
        str = bits.join('');
        // Bits to bytes
        bytes = [];
        while(str.length){
            bytes.push(parseInt(str.substring(0, 8), 2));
            str = str.substring(8);
        }
        return bytes;
    }
    function unpackIEEE754(bytes, ebits, fbits) {
        // Bytes to bits
        var bits = [], i, j, b, str, bias, s, e, f;
        for(i = bytes.length; i; i -= 1){
            b = bytes[i - 1];
            for(j = 8; j; j -= 1){
                bits.push(b % 2 ? 1 : 0);
                b = b >> 1;
            }
        }
        bits.reverse();
        str = bits.join('');
        // Unpack sign, exponent, fraction
        bias = (1 << ebits - 1) - 1;
        s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
        e = parseInt(str.substring(1, 1 + ebits), 2);
        f = parseInt(str.substring(1 + ebits), 2);
        // Produce number
        if (e === (1 << ebits) - 1) {
            return f !== 0 ? NaN : s * Infinity;
        } else if (e > 0) {
            // Normalized
            return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
        } else if (f !== 0) {
            // Denormalized
            return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
        } else {
            return s < 0 ? -0 : 0;
        }
    }
    function unpackF64(b) {
        return unpackIEEE754(b, 11, 52);
    }
    function packF64(v) {
        return packIEEE754(v, 11, 52);
    }
    function unpackF32(b) {
        return unpackIEEE754(b, 8, 23);
    }
    function packF32(v) {
        return packIEEE754(v, 8, 23);
    }
    //
    // 3 The ArrayBuffer Type
    //
    (function() {
        function ArrayBuffer1(length) {
            length = ToInt32(length);
            if (length < 0) throw RangeError('ArrayBuffer size is not a small enough positive integer.');
            Object.defineProperty(this, 'byteLength', {
                value: length
            });
            Object.defineProperty(this, '_bytes', {
                value: Array(length)
            });
            for(var i = 0; i < length; i += 1)this._bytes[i] = 0;
        }
        global.ArrayBuffer = global.ArrayBuffer || ArrayBuffer1;
        //
        // 5 The Typed Array View Types
        //
        function $TypedArray$() {
            // %TypedArray% ( length )
            if (!arguments.length || typeof arguments[0] !== 'object') {
                return (function(length) {
                    length = ToInt32(length);
                    if (length < 0) throw RangeError('length is not a small enough positive integer.');
                    Object.defineProperty(this, 'length', {
                        value: length
                    });
                    Object.defineProperty(this, 'byteLength', {
                        value: length * this.BYTES_PER_ELEMENT
                    });
                    Object.defineProperty(this, 'buffer', {
                        value: new ArrayBuffer1(this.byteLength)
                    });
                    Object.defineProperty(this, 'byteOffset', {
                        value: 0
                    });
                }).apply(this, arguments);
            }
            // %TypedArray% ( typedArray )
            if (arguments.length >= 1 && Type(arguments[0]) === 'object' && arguments[0] instanceof $TypedArray$) {
                return (function(typedArray) {
                    if (this.constructor !== typedArray.constructor) throw TypeError();
                    var byteLength = typedArray.length * this.BYTES_PER_ELEMENT;
                    Object.defineProperty(this, 'buffer', {
                        value: new ArrayBuffer1(byteLength)
                    });
                    Object.defineProperty(this, 'byteLength', {
                        value: byteLength
                    });
                    Object.defineProperty(this, 'byteOffset', {
                        value: 0
                    });
                    Object.defineProperty(this, 'length', {
                        value: typedArray.length
                    });
                    for(var i = 0; i < this.length; i += 1)this._setter(i, typedArray._getter(i));
                }).apply(this, arguments);
            }
            // %TypedArray% ( array )
            if (arguments.length >= 1 && Type(arguments[0]) === 'object' && !(arguments[0] instanceof $TypedArray$) && !(arguments[0] instanceof ArrayBuffer1 || Class(arguments[0]) === 'ArrayBuffer')) {
                return (function(array) {
                    var byteLength = array.length * this.BYTES_PER_ELEMENT;
                    Object.defineProperty(this, 'buffer', {
                        value: new ArrayBuffer1(byteLength)
                    });
                    Object.defineProperty(this, 'byteLength', {
                        value: byteLength
                    });
                    Object.defineProperty(this, 'byteOffset', {
                        value: 0
                    });
                    Object.defineProperty(this, 'length', {
                        value: array.length
                    });
                    for(var i = 0; i < this.length; i += 1){
                        var s = array[i];
                        this._setter(i, Number(s));
                    }
                }).apply(this, arguments);
            }
            // %TypedArray% ( buffer, byteOffset=0, length=undefined )
            if (arguments.length >= 1 && Type(arguments[0]) === 'object' && (arguments[0] instanceof ArrayBuffer1 || Class(arguments[0]) === 'ArrayBuffer')) {
                return (function(buffer, byteOffset, length) {
                    byteOffset = ToUint32(byteOffset);
                    if (byteOffset > buffer.byteLength) throw RangeError('byteOffset out of range');
                    // The given byteOffset must be a multiple of the element
                    // size of the specific type, otherwise an exception is raised.
                    if (byteOffset % this.BYTES_PER_ELEMENT) throw RangeError('buffer length minus the byteOffset is not a multiple of the element size.');
                    if (length === undefined) {
                        var byteLength = buffer.byteLength - byteOffset;
                        if (byteLength % this.BYTES_PER_ELEMENT) throw RangeError('length of buffer minus byteOffset not a multiple of the element size');
                        length = byteLength / this.BYTES_PER_ELEMENT;
                    } else {
                        length = ToUint32(length);
                        byteLength = length * this.BYTES_PER_ELEMENT;
                    }
                    if (byteOffset + byteLength > buffer.byteLength) throw RangeError('byteOffset and length reference an area beyond the end of the buffer');
                    Object.defineProperty(this, 'buffer', {
                        value: buffer
                    });
                    Object.defineProperty(this, 'byteLength', {
                        value: byteLength
                    });
                    Object.defineProperty(this, 'byteOffset', {
                        value: byteOffset
                    });
                    Object.defineProperty(this, 'length', {
                        value: length
                    });
                }).apply(this, arguments);
            }
            // %TypedArray% ( all other argument combinations )
            throw TypeError();
        }
        // Properties of the %TypedArray Instrinsic Object
        // %TypedArray%.from ( source , mapfn=undefined, thisArg=undefined )
        Object.defineProperty($TypedArray$, 'from', {
            value: function(iterable) {
                return new this(iterable);
            }
        });
        // %TypedArray%.of ( ...items )
        Object.defineProperty($TypedArray$, 'of', {
            value: function() {
                return new this(arguments);
            }
        });
        // %TypedArray%.prototype
        var $TypedArrayPrototype$ = {};
        $TypedArray$.prototype = $TypedArrayPrototype$;
        // WebIDL: getter type (unsigned long index);
        Object.defineProperty($TypedArray$.prototype, '_getter', {
            value: function(index) {
                if (arguments.length < 1) throw SyntaxError('Not enough arguments');
                index = ToUint32(index);
                if (index >= this.length) return undefined;
                var bytes = [], i, o;
                for(i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, o += 1){
                    bytes.push(this.buffer._bytes[o]);
                }
                return this._unpack(bytes);
            }
        });
        // NONSTANDARD: convenience alias for getter: type get(unsigned long index);
        Object.defineProperty($TypedArray$.prototype, 'get', {
            value: $TypedArray$.prototype._getter
        });
        // WebIDL: setter void (unsigned long index, type value);
        Object.defineProperty($TypedArray$.prototype, '_setter', {
            value: function(index, value) {
                if (arguments.length < 2) throw SyntaxError('Not enough arguments');
                index = ToUint32(index);
                if (index >= this.length) return;
                var bytes = this._pack(value), i, o;
                for(i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, o += 1){
                    this.buffer._bytes[o] = bytes[i];
                }
            }
        });
        // get %TypedArray%.prototype.buffer
        // get %TypedArray%.prototype.byteLength
        // get %TypedArray%.prototype.byteOffset
        // -- applied directly to the object in the constructor
        // %TypedArray%.prototype.constructor
        Object.defineProperty($TypedArray$.prototype, 'constructor', {
            value: $TypedArray$
        });
        // %TypedArray%.prototype.copyWithin (target, start, end = this.length )
        Object.defineProperty($TypedArray$.prototype, 'copyWithin', {
            value: function(target, start) {
                var end = arguments[2];
                var o = ToObject(this);
                var lenVal = o.length;
                var len = ToUint32(lenVal);
                len = max(len, 0);
                var relativeTarget = ToInt32(target);
                var to;
                if (relativeTarget < 0) to = max(len + relativeTarget, 0);
                else to = min(relativeTarget, len);
                var relativeStart = ToInt32(start);
                var from;
                if (relativeStart < 0) from = max(len + relativeStart, 0);
                else from = min(relativeStart, len);
                var relativeEnd;
                if (end === undefined) relativeEnd = len;
                else relativeEnd = ToInt32(end);
                var final;
                if (relativeEnd < 0) final = max(len + relativeEnd, 0);
                else final = min(relativeEnd, len);
                var count = min(final - from, len - to);
                var direction;
                if (from < to && to < from + count) {
                    direction = -1;
                    from = from + count - 1;
                    to = to + count - 1;
                } else {
                    direction = 1;
                }
                while(count > 0){
                    o._setter(to, o._getter(from));
                    from = from + direction;
                    to = to + direction;
                    count = count - 1;
                }
                return o;
            }
        });
        // %TypedArray%.prototype.entries ( )
        // -- defined in es6.js to shim browsers w/ native TypedArrays
        // %TypedArray%.prototype.every ( callbackfn, thisArg = undefined )
        Object.defineProperty($TypedArray$.prototype, 'every', {
            value: function(callbackfn) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                if (!IsCallable(callbackfn)) throw TypeError();
                var thisArg = arguments[1];
                for(var i = 0; i < len; i++){
                    if (!callbackfn.call(thisArg, t._getter(i), i, t)) return false;
                }
                return true;
            }
        });
        // %TypedArray%.prototype.fill (value, start = 0, end = this.length )
        Object.defineProperty($TypedArray$.prototype, 'fill', {
            value: function(value) {
                var start = arguments[1], end = arguments[2];
                var o = ToObject(this);
                var lenVal = o.length;
                var len = ToUint32(lenVal);
                len = max(len, 0);
                var relativeStart = ToInt32(start);
                var k;
                if (relativeStart < 0) k = max(len + relativeStart, 0);
                else k = min(relativeStart, len);
                var relativeEnd;
                if (end === undefined) relativeEnd = len;
                else relativeEnd = ToInt32(end);
                var final;
                if (relativeEnd < 0) final = max(len + relativeEnd, 0);
                else final = min(relativeEnd, len);
                while(k < final){
                    o._setter(k, value);
                    k += 1;
                }
                return o;
            }
        });
        // %TypedArray%.prototype.filter ( callbackfn, thisArg = undefined )
        Object.defineProperty($TypedArray$.prototype, 'filter', {
            value: function(callbackfn) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                if (!IsCallable(callbackfn)) throw TypeError();
                var res = [];
                var thisp = arguments[1];
                for(var i = 0; i < len; i++){
                    var val = t._getter(i); // in case fun mutates this
                    if (callbackfn.call(thisp, val, i, t)) res.push(val);
                }
                return new this.constructor(res);
            }
        });
        // %TypedArray%.prototype.find (predicate, thisArg = undefined)
        Object.defineProperty($TypedArray$.prototype, 'find', {
            value: function(predicate) {
                var o = ToObject(this);
                var lenValue = o.length;
                var len = ToUint32(lenValue);
                if (!IsCallable(predicate)) throw TypeError();
                var t = arguments.length > 1 ? arguments[1] : undefined;
                var k = 0;
                while(k < len){
                    var kValue = o._getter(k);
                    var testResult = predicate.call(t, kValue, k, o);
                    if (Boolean(testResult)) return kValue;
                    ++k;
                }
                return undefined;
            }
        });
        // %TypedArray%.prototype.findIndex ( predicate, thisArg = undefined )
        Object.defineProperty($TypedArray$.prototype, 'findIndex', {
            value: function(predicate) {
                var o = ToObject(this);
                var lenValue = o.length;
                var len = ToUint32(lenValue);
                if (!IsCallable(predicate)) throw TypeError();
                var t = arguments.length > 1 ? arguments[1] : undefined;
                var k = 0;
                while(k < len){
                    var kValue = o._getter(k);
                    var testResult = predicate.call(t, kValue, k, o);
                    if (Boolean(testResult)) return k;
                    ++k;
                }
                return -1;
            }
        });
        // %TypedArray%.prototype.forEach ( callbackfn, thisArg = undefined )
        Object.defineProperty($TypedArray$.prototype, 'forEach', {
            value: function(callbackfn) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                if (!IsCallable(callbackfn)) throw TypeError();
                var thisp = arguments[1];
                for(var i = 0; i < len; i++)callbackfn.call(thisp, t._getter(i), i, t);
            }
        });
        // %TypedArray%.prototype.indexOf (searchElement, fromIndex = 0 )
        Object.defineProperty($TypedArray$.prototype, 'indexOf', {
            value: function(searchElement) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                if (len === 0) return -1;
                var n = 0;
                if (arguments.length > 0) {
                    n = Number(arguments[1]);
                    if (n !== n) {
                        n = 0;
                    } else if (n !== 0 && n !== 1 / 0 && n !== -1 / 0) {
                        n = (n > 0 || -1) * floor(abs(n));
                    }
                }
                if (n >= len) return -1;
                var k = n >= 0 ? n : max(len - abs(n), 0);
                for(; k < len; k++){
                    if (t._getter(k) === searchElement) {
                        return k;
                    }
                }
                return -1;
            }
        });
        // %TypedArray%.prototype.join ( separator )
        Object.defineProperty($TypedArray$.prototype, 'join', {
            value: function(separator) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                var tmp = Array(len);
                for(var i = 0; i < len; ++i)tmp[i] = t._getter(i);
                return tmp.join(separator === undefined ? ',' : separator); // Hack for IE7
            }
        });
        // %TypedArray%.prototype.keys ( )
        // -- defined in es6.js to shim browsers w/ native TypedArrays
        // %TypedArray%.prototype.lastIndexOf ( searchElement, fromIndex = this.length-1 )
        Object.defineProperty($TypedArray$.prototype, 'lastIndexOf', {
            value: function(searchElement) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                if (len === 0) return -1;
                var n = len;
                if (arguments.length > 1) {
                    n = Number(arguments[1]);
                    if (n !== n) {
                        n = 0;
                    } else if (n !== 0 && n !== 1 / 0 && n !== -1 / 0) {
                        n = (n > 0 || -1) * floor(abs(n));
                    }
                }
                var k = n >= 0 ? min(n, len - 1) : len - abs(n);
                for(; k >= 0; k--){
                    if (t._getter(k) === searchElement) return k;
                }
                return -1;
            }
        });
        // get %TypedArray%.prototype.length
        // -- applied directly to the object in the constructor
        // %TypedArray%.prototype.map ( callbackfn, thisArg = undefined )
        Object.defineProperty($TypedArray$.prototype, 'map', {
            value: function(callbackfn) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                if (!IsCallable(callbackfn)) throw TypeError();
                var res = [];
                res.length = len;
                var thisp = arguments[1];
                for(var i = 0; i < len; i++)res[i] = callbackfn.call(thisp, t._getter(i), i, t);
                return new this.constructor(res);
            }
        });
        // %TypedArray%.prototype.reduce ( callbackfn [, initialValue] )
        Object.defineProperty($TypedArray$.prototype, 'reduce', {
            value: function(callbackfn) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                if (!IsCallable(callbackfn)) throw TypeError();
                // no value to return if no initial value and an empty array
                if (len === 0 && arguments.length === 1) throw TypeError();
                var k = 0;
                var accumulator;
                if (arguments.length >= 2) {
                    accumulator = arguments[1];
                } else {
                    accumulator = t._getter(k++);
                }
                while(k < len){
                    accumulator = callbackfn.call(undefined, accumulator, t._getter(k), k, t);
                    k++;
                }
                return accumulator;
            }
        });
        // %TypedArray%.prototype.reduceRight ( callbackfn [, initialValue] )
        Object.defineProperty($TypedArray$.prototype, 'reduceRight', {
            value: function(callbackfn) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                if (!IsCallable(callbackfn)) throw TypeError();
                // no value to return if no initial value, empty array
                if (len === 0 && arguments.length === 1) throw TypeError();
                var k = len - 1;
                var accumulator;
                if (arguments.length >= 2) {
                    accumulator = arguments[1];
                } else {
                    accumulator = t._getter(k--);
                }
                while(k >= 0){
                    accumulator = callbackfn.call(undefined, accumulator, t._getter(k), k, t);
                    k--;
                }
                return accumulator;
            }
        });
        // %TypedArray%.prototype.reverse ( )
        Object.defineProperty($TypedArray$.prototype, 'reverse', {
            value: function() {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                var half = floor(len / 2);
                for(var i = 0, j = len - 1; i < half; ++i, --j){
                    var tmp = t._getter(i);
                    t._setter(i, t._getter(j));
                    t._setter(j, tmp);
                }
                return t;
            }
        });
        // %TypedArray%.prototype.set(array, offset = 0 )
        // %TypedArray%.prototype.set(typedArray, offset = 0 )
        // WebIDL: void set(TypedArray array, optional unsigned long offset);
        // WebIDL: void set(sequence<type> array, optional unsigned long offset);
        Object.defineProperty($TypedArray$.prototype, 'set', {
            value: function(index, value) {
                if (arguments.length < 1) throw SyntaxError('Not enough arguments');
                var array, sequence, offset, len, i, s, d, byteOffset, byteLength, tmp;
                if (typeof arguments[0] === 'object' && arguments[0].constructor === this.constructor) {
                    // void set(TypedArray array, optional unsigned long offset);
                    array = arguments[0];
                    offset = ToUint32(arguments[1]);
                    if (offset + array.length > this.length) {
                        throw RangeError('Offset plus length of array is out of range');
                    }
                    byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT;
                    byteLength = array.length * this.BYTES_PER_ELEMENT;
                    if (array.buffer === this.buffer) {
                        tmp = [];
                        for(i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1){
                            tmp[i] = array.buffer._bytes[s];
                        }
                        for(i = 0, d = byteOffset; i < byteLength; i += 1, d += 1){
                            this.buffer._bytes[d] = tmp[i];
                        }
                    } else {
                        for(i = 0, s = array.byteOffset, d = byteOffset; i < byteLength; i += 1, s += 1, d += 1){
                            this.buffer._bytes[d] = array.buffer._bytes[s];
                        }
                    }
                } else if (typeof arguments[0] === 'object' && typeof arguments[0].length !== 'undefined') {
                    // void set(sequence<type> array, optional unsigned long offset);
                    sequence = arguments[0];
                    len = ToUint32(sequence.length);
                    offset = ToUint32(arguments[1]);
                    if (offset + len > this.length) {
                        throw RangeError('Offset plus length of array is out of range');
                    }
                    for(i = 0; i < len; i += 1){
                        s = sequence[i];
                        this._setter(offset + i, Number(s));
                    }
                } else {
                    throw TypeError('Unexpected argument type(s)');
                }
            }
        });
        // %TypedArray%.prototype.slice ( start, end )
        Object.defineProperty($TypedArray$.prototype, 'slice', {
            value: function(start, end) {
                var o = ToObject(this);
                var lenVal = o.length;
                var len = ToUint32(lenVal);
                var relativeStart = ToInt32(start);
                var k = relativeStart < 0 ? max(len + relativeStart, 0) : min(relativeStart, len);
                var relativeEnd = end === undefined ? len : ToInt32(end);
                var final = relativeEnd < 0 ? max(len + relativeEnd, 0) : min(relativeEnd, len);
                var count = final - k;
                var c = o.constructor;
                var a = new c(count);
                var n = 0;
                while(k < final){
                    var kValue = o._getter(k);
                    a._setter(n, kValue);
                    ++k;
                    ++n;
                }
                return a;
            }
        });
        // %TypedArray%.prototype.some ( callbackfn, thisArg = undefined )
        Object.defineProperty($TypedArray$.prototype, 'some', {
            value: function(callbackfn) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                if (!IsCallable(callbackfn)) throw TypeError();
                var thisp = arguments[1];
                for(var i = 0; i < len; i++){
                    if (callbackfn.call(thisp, t._getter(i), i, t)) {
                        return true;
                    }
                }
                return false;
            }
        });
        // %TypedArray%.prototype.sort ( comparefn )
        Object.defineProperty($TypedArray$.prototype, 'sort', {
            value: function(comparefn) {
                if (this === undefined || this === null) throw TypeError();
                var t = Object(this);
                var len = ToUint32(t.length);
                var tmp = Array(len);
                for(var i = 0; i < len; ++i)tmp[i] = t._getter(i);
                if (comparefn) tmp.sort(comparefn);
                else tmp.sort(); // Hack for IE8/9
                for(i = 0; i < len; ++i)t._setter(i, tmp[i]);
                return t;
            }
        });
        // %TypedArray%.prototype.subarray(begin = 0, end = this.length )
        // WebIDL: TypedArray subarray(long begin, optional long end);
        Object.defineProperty($TypedArray$.prototype, 'subarray', {
            value: function(start, end) {
                function clamp(v, min, max) {
                    return v < min ? min : v > max ? max : v;
                }
                start = ToInt32(start);
                end = ToInt32(end);
                if (arguments.length < 1) {
                    start = 0;
                }
                if (arguments.length < 2) {
                    end = this.length;
                }
                if (start < 0) {
                    start = this.length + start;
                }
                if (end < 0) {
                    end = this.length + end;
                }
                start = clamp(start, 0, this.length);
                end = clamp(end, 0, this.length);
                var len = end - start;
                if (len < 0) {
                    len = 0;
                }
                return new this.constructor(this.buffer, this.byteOffset + start * this.BYTES_PER_ELEMENT, len);
            }
        });
        // %TypedArray%.prototype.toLocaleString ( )
        // %TypedArray%.prototype.toString ( )
        // %TypedArray%.prototype.values ( )
        // %TypedArray%.prototype [ @@iterator ] ( )
        // get %TypedArray%.prototype [ @@toStringTag ]
        // -- defined in es6.js to shim browsers w/ native TypedArrays
        function makeTypedArray(elementSize, pack, unpack) {
            // Each TypedArray type requires a distinct constructor instance with
            // identical logic, which this produces.
            var TypedArray = function() {
                Object.defineProperty(this, 'constructor', {
                    value: TypedArray
                });
                $TypedArray$.apply(this, arguments);
                makeArrayAccessors(this);
            };
            if ('__proto__' in TypedArray) {
                TypedArray.__proto__ = $TypedArray$;
            } else {
                TypedArray.from = $TypedArray$.from;
                TypedArray.of = $TypedArray$.of;
            }
            TypedArray.BYTES_PER_ELEMENT = elementSize;
            var TypedArrayPrototype = function() {};
            TypedArrayPrototype.prototype = $TypedArrayPrototype$;
            TypedArray.prototype = new TypedArrayPrototype();
            Object.defineProperty(TypedArray.prototype, 'BYTES_PER_ELEMENT', {
                value: elementSize
            });
            Object.defineProperty(TypedArray.prototype, '_pack', {
                value: pack
            });
            Object.defineProperty(TypedArray.prototype, '_unpack', {
                value: unpack
            });
            return TypedArray;
        }
        var Int8Array1 = makeTypedArray(1, packI8, unpackI8);
        var Uint8Array1 = makeTypedArray(1, packU8, unpackU8);
        var Uint8ClampedArray = makeTypedArray(1, packU8Clamped, unpackU8);
        var Int16Array1 = makeTypedArray(2, packI16, unpackI16);
        var Uint16Array1 = makeTypedArray(2, packU16, unpackU16);
        var Int32Array1 = makeTypedArray(4, packI32, unpackI32);
        var Uint32Array1 = makeTypedArray(4, packU32, unpackU32);
        var Float32Array1 = makeTypedArray(4, packF32, unpackF32);
        var Float64Array1 = makeTypedArray(8, packF64, unpackF64);
        global.Int8Array = global.Int8Array || Int8Array1;
        global.Uint8Array = global.Uint8Array || Uint8Array1;
        global.Uint8ClampedArray = global.Uint8ClampedArray || Uint8ClampedArray;
        global.Int16Array = global.Int16Array || Int16Array1;
        global.Uint16Array = global.Uint16Array || Uint16Array1;
        global.Int32Array = global.Int32Array || Int32Array1;
        global.Uint32Array = global.Uint32Array || Uint32Array1;
        global.Float32Array = global.Float32Array || Float32Array1;
        global.Float64Array = global.Float64Array || Float64Array1;
    })();
    //
    // 6 The DataView View Type
    //
    (function() {
        function r(array, index) {
            return IsCallable(array.get) ? array.get(index) : array[index];
        }
        var IS_BIG_ENDIAN = function() {
            var u16array = new Uint16Array([
                0x1234
            ]), u8array = new Uint8Array(u16array.buffer);
            return r(u8array, 0) === 0x12;
        }();
        // DataView(buffer, byteOffset=0, byteLength=undefined)
        // WebIDL: Constructor(ArrayBuffer buffer,
        //                     optional unsigned long byteOffset,
        //                     optional unsigned long byteLength)
        function DataView(buffer, byteOffset, byteLength) {
            if (!(buffer instanceof ArrayBuffer || Class(buffer) === 'ArrayBuffer')) throw TypeError();
            byteOffset = ToUint32(byteOffset);
            if (byteOffset > buffer.byteLength) throw RangeError('byteOffset out of range');
            if (byteLength === undefined) byteLength = buffer.byteLength - byteOffset;
            else byteLength = ToUint32(byteLength);
            if (byteOffset + byteLength > buffer.byteLength) throw RangeError('byteOffset and length reference an area beyond the end of the buffer');
            Object.defineProperty(this, 'buffer', {
                value: buffer
            });
            Object.defineProperty(this, 'byteLength', {
                value: byteLength
            });
            Object.defineProperty(this, 'byteOffset', {
                value: byteOffset
            });
        }
        ;
        // get DataView.prototype.buffer
        // get DataView.prototype.byteLength
        // get DataView.prototype.byteOffset
        // -- applied directly to instances by the constructor
        function makeGetter(arrayType) {
            return function GetViewValue(byteOffset, littleEndian) {
                byteOffset = ToUint32(byteOffset);
                if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) throw RangeError('Array index out of range');
                byteOffset += this.byteOffset;
                var uint8Array = new Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT), bytes = [];
                for(var i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1)bytes.push(r(uint8Array, i));
                if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) bytes.reverse();
                return r(new arrayType(new Uint8Array(bytes).buffer), 0);
            };
        }
        Object.defineProperty(DataView.prototype, 'getUint8', {
            value: makeGetter(Uint8Array)
        });
        Object.defineProperty(DataView.prototype, 'getInt8', {
            value: makeGetter(Int8Array)
        });
        Object.defineProperty(DataView.prototype, 'getUint16', {
            value: makeGetter(Uint16Array)
        });
        Object.defineProperty(DataView.prototype, 'getInt16', {
            value: makeGetter(Int16Array)
        });
        Object.defineProperty(DataView.prototype, 'getUint32', {
            value: makeGetter(Uint32Array)
        });
        Object.defineProperty(DataView.prototype, 'getInt32', {
            value: makeGetter(Int32Array)
        });
        Object.defineProperty(DataView.prototype, 'getFloat32', {
            value: makeGetter(Float32Array)
        });
        Object.defineProperty(DataView.prototype, 'getFloat64', {
            value: makeGetter(Float64Array)
        });
        function makeSetter(arrayType) {
            return function SetViewValue(byteOffset, value, littleEndian) {
                byteOffset = ToUint32(byteOffset);
                if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) throw RangeError('Array index out of range');
                // Get bytes
                var typeArray = new arrayType([
                    value
                ]), byteArray = new Uint8Array(typeArray.buffer), bytes = [], i, byteView;
                for(i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1)bytes.push(r(byteArray, i));
                // Flip if necessary
                if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) bytes.reverse();
                // Write them
                byteView = new Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT);
                byteView.set(bytes);
            };
        }
        Object.defineProperty(DataView.prototype, 'setUint8', {
            value: makeSetter(Uint8Array)
        });
        Object.defineProperty(DataView.prototype, 'setInt8', {
            value: makeSetter(Int8Array)
        });
        Object.defineProperty(DataView.prototype, 'setUint16', {
            value: makeSetter(Uint16Array)
        });
        Object.defineProperty(DataView.prototype, 'setInt16', {
            value: makeSetter(Int16Array)
        });
        Object.defineProperty(DataView.prototype, 'setUint32', {
            value: makeSetter(Uint32Array)
        });
        Object.defineProperty(DataView.prototype, 'setInt32', {
            value: makeSetter(Int32Array)
        });
        Object.defineProperty(DataView.prototype, 'setFloat32', {
            value: makeSetter(Float32Array)
        });
        Object.defineProperty(DataView.prototype, 'setFloat64', {
            value: makeSetter(Float64Array)
        });
        global.DataView = global.DataView || DataView;
    })();
})(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvdHlwZWRhcnJheS00NGYwOWNmLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gQ29weXJpZ2h0IChjKSAyMDEwLCBMaW5kZW4gUmVzZWFyY2gsIEluYy5cbiBDb3B5cmlnaHQgKGMpIDIwMTQsIEpvc2h1YSBCZWxsXG5cbiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuIFRIRSBTT0ZUV0FSRS5cbiAkL0xpY2Vuc2VJbmZvJFxuICovXG5cbi8vIE9yaWdpbmFsIGNhbiBiZSBmb3VuZCBhdDpcbi8vICAgaHR0cHM6Ly9iaXRidWNrZXQub3JnL2xpbmRlbmxhYi9sbHNkXG4vLyBNb2RpZmljYXRpb25zIGJ5IEpvc2h1YSBCZWxsIGluZXhvcmFibGV0YXNoQGdtYWlsLmNvbVxuLy8gICBodHRwczovL2dpdGh1Yi5jb20vaW5leG9yYWJsZXRhc2gvcG9seWZpbGxcblxuLy8gRVMzL0VTNSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgS3Job25vcyBUeXBlZCBBcnJheSBTcGVjaWZpY2F0aW9uXG4vLyAgIFJlZjogaHR0cDovL3d3dy5raHJvbm9zLm9yZy9yZWdpc3RyeS90eXBlZGFycmF5L3NwZWNzL2xhdGVzdC9cbi8vICAgRGF0ZTogMjAxMS0wMi0wMVxuLy9cbi8vIFZhcmlhdGlvbnM6XG4vLyAgKiBBbGxvd3MgdHlwZWRfYXJyYXkuZ2V0L3NldCgpIGFzIGFsaWFzIGZvciBzdWJzY3JpcHRzICh0eXBlZF9hcnJheVtdKVxuLy8gICogR3JhZHVhbGx5IG1pZ3JhdGluZyBzdHJ1Y3R1cmUgZnJvbSBLaHJvbm9zIHNwZWMgdG8gRVM2IHNwZWNcbihmdW5jdGlvbihnbG9iYWwpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgdW5kZWZpbmVkID0gKHZvaWQgMCk7IC8vIFBhcmFub2lhXG5cbiAgLy8gQmV5b25kIHRoaXMgdmFsdWUsIGluZGV4IGdldHRlcnMvc2V0dGVycyAoaS5lLiBhcnJheVswXSwgYXJyYXlbMV0pIGFyZSBzbyBzbG93IHRvXG4gIC8vIGNyZWF0ZSwgYW5kIGNvbnN1bWUgc28gbXVjaCBtZW1vcnksIHRoYXQgdGhlIGJyb3dzZXIgYXBwZWFycyBmcm96ZW4uXG4gIHZhciBNQVhfQVJSQVlfTEVOR1RIID0gMWU1O1xuXG4gIC8vIEFwcHJveGltYXRpb25zIG9mIGludGVybmFsIEVDTUFTY3JpcHQgY29udmVyc2lvbiBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gVHlwZSh2KSB7XG4gICAgc3dpdGNoKHR5cGVvZiB2KSB7XG4gICAgY2FzZSAndW5kZWZpbmVkJzogcmV0dXJuICd1bmRlZmluZWQnO1xuICAgIGNhc2UgJ2Jvb2xlYW4nOiByZXR1cm4gJ2Jvb2xlYW4nO1xuICAgIGNhc2UgJ251bWJlcic6IHJldHVybiAnbnVtYmVyJztcbiAgICBjYXNlICdzdHJpbmcnOiByZXR1cm4gJ3N0cmluZyc7XG4gICAgZGVmYXVsdDogcmV0dXJuIHYgPT09IG51bGwgPyAnbnVsbCcgOiAnb2JqZWN0JztcbiAgICB9XG4gIH1cblxuICAvLyBDbGFzcyByZXR1cm5zIGludGVybmFsIFtbQ2xhc3NdXSBwcm9wZXJ0eSwgdXNlZCB0byBhdm9pZCBjcm9zcy1mcmFtZSBpbnN0YW5jZW9mIGlzc3VlczpcbiAgZnVuY3Rpb24gQ2xhc3ModikgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHYpLnJlcGxhY2UoL15cXFtvYmplY3QgKnxcXF0kL2csICcnKTsgfVxuICBmdW5jdGlvbiBJc0NhbGxhYmxlKG8pIHsgcmV0dXJuIHR5cGVvZiBvID09PSAnZnVuY3Rpb24nOyB9XG4gIGZ1bmN0aW9uIFRvT2JqZWN0KHYpIHtcbiAgICBpZiAodiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcigpO1xuICAgIHJldHVybiBPYmplY3Qodik7XG4gIH1cbiAgZnVuY3Rpb24gVG9JbnQzMih2KSB7IHJldHVybiB2ID4+IDA7IH1cbiAgZnVuY3Rpb24gVG9VaW50MzIodikgeyByZXR1cm4gdiA+Pj4gMDsgfVxuXG4gIC8vIFNuYXBzaG90IGludHJpbnNpY3NcbiAgdmFyIExOMiA9IE1hdGguTE4yLFxuICAgICAgYWJzID0gTWF0aC5hYnMsXG4gICAgICBmbG9vciA9IE1hdGguZmxvb3IsXG4gICAgICBsb2cgPSBNYXRoLmxvZyxcbiAgICAgIG1heCA9IE1hdGgubWF4LFxuICAgICAgbWluID0gTWF0aC5taW4sXG4gICAgICBwb3cgPSBNYXRoLnBvdyxcbiAgICAgIHJvdW5kID0gTWF0aC5yb3VuZDtcblxuICAvLyBlbXVsYXRlIEVTNSBnZXR0ZXIvc2V0dGVyIEFQSSB1c2luZyBsZWdhY3kgQVBJc1xuICAvLyBodHRwOi8vYmxvZ3MubXNkbi5jb20vYi9pZS9hcmNoaXZlLzIwMTAvMDkvMDcvdHJhbnNpdGlvbmluZy1leGlzdGluZy1jb2RlLXRvLXRoZS1lczUtZ2V0dGVyLXNldHRlci1hcGlzLmFzcHhcbiAgLy8gKHNlY29uZCBjbGF1c2UgdGVzdHMgZm9yIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgpIGluIElFPDkgdGhhdCBvbmx5IHN1cHBvcnRzIGV4dGVuZGluZyBET00gcHJvdG90eXBlcywgYnV0XG4gIC8vIG5vdGUgdGhhdCBJRTw5IGRvZXMgbm90IHN1cHBvcnQgX19kZWZpbmVHZXR0ZXJfXyBvciBfX2RlZmluZVNldHRlcl9fIHNvIGl0IGp1c3QgcmVuZGVycyB0aGUgbWV0aG9kIGhhcm1sZXNzKVxuXG4gIChmdW5jdGlvbigpIHtcbiAgICB2YXIgb3JpZyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbiAgICB2YXIgZG9tX29ubHkgPSAhKGZ1bmN0aW9uKCl7dHJ5e3JldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sJ3gnLHt9KTt9Y2F0Y2goXyl7cmV0dXJuIGZhbHNlO319KCkpO1xuXG4gICAgaWYgKCFvcmlnIHx8IGRvbV9vbmx5KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAobywgcHJvcCwgZGVzYykge1xuICAgICAgICAvLyBJbiBJRTggdHJ5IGJ1aWx0LWluIGltcGxlbWVudGF0aW9uIGZvciBkZWZpbmluZyBwcm9wZXJ0aWVzIG9uIERPTSBwcm90b3R5cGVzLlxuICAgICAgICBpZiAob3JpZylcbiAgICAgICAgICB0cnkgeyByZXR1cm4gb3JpZyhvLCBwcm9wLCBkZXNjKTsgfSBjYXRjaCAoXykge31cbiAgICAgICAgaWYgKG8gIT09IE9iamVjdChvKSlcbiAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ09iamVjdC5kZWZpbmVQcm9wZXJ0eSBjYWxsZWQgb24gbm9uLW9iamVjdCcpO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5fX2RlZmluZUdldHRlcl9fICYmICgnZ2V0JyBpbiBkZXNjKSlcbiAgICAgICAgICBPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lR2V0dGVyX18uY2FsbChvLCBwcm9wLCBkZXNjLmdldCk7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lU2V0dGVyX18gJiYgKCdzZXQnIGluIGRlc2MpKVxuICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVTZXR0ZXJfXy5jYWxsKG8sIHByb3AsIGRlc2Muc2V0KTtcbiAgICAgICAgaWYgKCd2YWx1ZScgaW4gZGVzYylcbiAgICAgICAgICBvW3Byb3BdID0gZGVzYy52YWx1ZTtcbiAgICAgICAgcmV0dXJuIG87XG4gICAgICB9O1xuICAgIH1cbiAgfSgpKTtcblxuICAvLyBFUzU6IE1ha2Ugb2JqW2luZGV4XSBhbiBhbGlhcyBmb3Igb2JqLl9nZXR0ZXIoaW5kZXgpL29iai5fc2V0dGVyKGluZGV4LCB2YWx1ZSlcbiAgLy8gZm9yIGluZGV4IGluIDAgLi4uIG9iai5sZW5ndGhcbiAgZnVuY3Rpb24gbWFrZUFycmF5QWNjZXNzb3JzKG9iaikge1xuICAgIGlmIChvYmoubGVuZ3RoID4gTUFYX0FSUkFZX0xFTkdUSCkgdGhyb3cgUmFuZ2VFcnJvcignQXJyYXkgdG9vIGxhcmdlIGZvciBwb2x5ZmlsbCcpO1xuXG4gICAgZnVuY3Rpb24gbWFrZUFycmF5QWNjZXNzb3IoaW5kZXgpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGluZGV4LCB7XG4gICAgICAgICdnZXQnOiBmdW5jdGlvbigpIHsgcmV0dXJuIG9iai5fZ2V0dGVyKGluZGV4KTsgfSxcbiAgICAgICAgJ3NldCc6IGZ1bmN0aW9uKHYpIHsgb2JqLl9zZXR0ZXIoaW5kZXgsIHYpOyB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBtYWtlQXJyYXlBY2Nlc3NvcihpKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbnRlcm5hbCBjb252ZXJzaW9uIGZ1bmN0aW9uczpcbiAgLy8gICAgcGFjazxUeXBlPigpICAgLSB0YWtlIGEgbnVtYmVyIChpbnRlcnByZXRlZCBhcyBUeXBlKSwgb3V0cHV0IGEgYnl0ZSBhcnJheVxuICAvLyAgICB1bnBhY2s8VHlwZT4oKSAtIHRha2UgYSBieXRlIGFycmF5LCBvdXRwdXQgYSBUeXBlLWxpa2UgbnVtYmVyXG5cbiAgZnVuY3Rpb24gYXNfc2lnbmVkKHZhbHVlLCBiaXRzKSB7IHZhciBzID0gMzIgLSBiaXRzOyByZXR1cm4gKHZhbHVlIDw8IHMpID4+IHM7IH1cbiAgZnVuY3Rpb24gYXNfdW5zaWduZWQodmFsdWUsIGJpdHMpIHsgdmFyIHMgPSAzMiAtIGJpdHM7IHJldHVybiAodmFsdWUgPDwgcykgPj4+IHM7IH1cblxuICBmdW5jdGlvbiBwYWNrSTgobikgeyByZXR1cm4gW24gJiAweGZmXTsgfVxuICBmdW5jdGlvbiB1bnBhY2tJOChieXRlcykgeyByZXR1cm4gYXNfc2lnbmVkKGJ5dGVzWzBdLCA4KTsgfVxuXG4gIGZ1bmN0aW9uIHBhY2tVOChuKSB7IHJldHVybiBbbiAmIDB4ZmZdOyB9XG4gIGZ1bmN0aW9uIHVucGFja1U4KGJ5dGVzKSB7IHJldHVybiBhc191bnNpZ25lZChieXRlc1swXSwgOCk7IH1cblxuICBmdW5jdGlvbiBwYWNrVThDbGFtcGVkKG4pIHsgbiA9IHJvdW5kKE51bWJlcihuKSk7IHJldHVybiBbbiA8IDAgPyAwIDogbiA+IDB4ZmYgPyAweGZmIDogbiAmIDB4ZmZdOyB9XG5cbiAgZnVuY3Rpb24gcGFja0kxNihuKSB7IHJldHVybiBbKG4gPj4gOCkgJiAweGZmLCBuICYgMHhmZl07IH1cbiAgZnVuY3Rpb24gdW5wYWNrSTE2KGJ5dGVzKSB7IHJldHVybiBhc19zaWduZWQoYnl0ZXNbMF0gPDwgOCB8IGJ5dGVzWzFdLCAxNik7IH1cblxuICBmdW5jdGlvbiBwYWNrVTE2KG4pIHsgcmV0dXJuIFsobiA+PiA4KSAmIDB4ZmYsIG4gJiAweGZmXTsgfVxuICBmdW5jdGlvbiB1bnBhY2tVMTYoYnl0ZXMpIHsgcmV0dXJuIGFzX3Vuc2lnbmVkKGJ5dGVzWzBdIDw8IDggfCBieXRlc1sxXSwgMTYpOyB9XG5cbiAgZnVuY3Rpb24gcGFja0kzMihuKSB7IHJldHVybiBbKG4gPj4gMjQpICYgMHhmZiwgKG4gPj4gMTYpICYgMHhmZiwgKG4gPj4gOCkgJiAweGZmLCBuICYgMHhmZl07IH1cbiAgZnVuY3Rpb24gdW5wYWNrSTMyKGJ5dGVzKSB7IHJldHVybiBhc19zaWduZWQoYnl0ZXNbMF0gPDwgMjQgfCBieXRlc1sxXSA8PCAxNiB8IGJ5dGVzWzJdIDw8IDggfCBieXRlc1szXSwgMzIpOyB9XG5cbiAgZnVuY3Rpb24gcGFja1UzMihuKSB7IHJldHVybiBbKG4gPj4gMjQpICYgMHhmZiwgKG4gPj4gMTYpICYgMHhmZiwgKG4gPj4gOCkgJiAweGZmLCBuICYgMHhmZl07IH1cbiAgZnVuY3Rpb24gdW5wYWNrVTMyKGJ5dGVzKSB7IHJldHVybiBhc191bnNpZ25lZChieXRlc1swXSA8PCAyNCB8IGJ5dGVzWzFdIDw8IDE2IHwgYnl0ZXNbMl0gPDwgOCB8IGJ5dGVzWzNdLCAzMik7IH1cblxuICBmdW5jdGlvbiBwYWNrSUVFRTc1NCh2LCBlYml0cywgZmJpdHMpIHtcblxuICAgIHZhciBiaWFzID0gKDEgPDwgKGViaXRzIC0gMSkpIC0gMSxcbiAgICAgICAgcywgZSwgZiwgbG4sXG4gICAgICAgIGksIGJpdHMsIHN0ciwgYnl0ZXM7XG5cbiAgICBmdW5jdGlvbiByb3VuZFRvRXZlbihuKSB7XG4gICAgICB2YXIgdyA9IGZsb29yKG4pLCBmID0gbiAtIHc7XG4gICAgICBpZiAoZiA8IDAuNSlcbiAgICAgICAgcmV0dXJuIHc7XG4gICAgICBpZiAoZiA+IDAuNSlcbiAgICAgICAgcmV0dXJuIHcgKyAxO1xuICAgICAgcmV0dXJuIHcgJSAyID8gdyArIDEgOiB3O1xuICAgIH1cblxuICAgIC8vIENvbXB1dGUgc2lnbiwgZXhwb25lbnQsIGZyYWN0aW9uXG4gICAgaWYgKHYgIT09IHYpIHtcbiAgICAgIC8vIE5hTlxuICAgICAgLy8gaHR0cDovL2Rldi53My5vcmcvMjAwNi93ZWJhcGkvV2ViSURMLyNlcy10eXBlLW1hcHBpbmdcbiAgICAgIGUgPSAoMSA8PCBlYml0cykgLSAxOyBmID0gcG93KDIsIGZiaXRzIC0gMSk7IHMgPSAwO1xuICAgIH0gZWxzZSBpZiAodiA9PT0gSW5maW5pdHkgfHwgdiA9PT0gLUluZmluaXR5KSB7XG4gICAgICBlID0gKDEgPDwgZWJpdHMpIC0gMTsgZiA9IDA7IHMgPSAodiA8IDApID8gMSA6IDA7XG4gICAgfSBlbHNlIGlmICh2ID09PSAwKSB7XG4gICAgICBlID0gMDsgZiA9IDA7IHMgPSAoMSAvIHYgPT09IC1JbmZpbml0eSkgPyAxIDogMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcyA9IHYgPCAwO1xuICAgICAgdiA9IGFicyh2KTtcblxuICAgICAgaWYgKHYgPj0gcG93KDIsIDEgLSBiaWFzKSkge1xuICAgICAgICBlID0gbWluKGZsb29yKGxvZyh2KSAvIExOMiksIDEwMjMpO1xuICAgICAgICBmID0gcm91bmRUb0V2ZW4odiAvIHBvdygyLCBlKSAqIHBvdygyLCBmYml0cykpO1xuICAgICAgICBpZiAoZiAvIHBvdygyLCBmYml0cykgPj0gMikge1xuICAgICAgICAgIGUgPSBlICsgMTtcbiAgICAgICAgICBmID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZSA+IGJpYXMpIHtcbiAgICAgICAgICAvLyBPdmVyZmxvd1xuICAgICAgICAgIGUgPSAoMSA8PCBlYml0cykgLSAxO1xuICAgICAgICAgIGYgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5vcm1hbGl6ZWRcbiAgICAgICAgICBlID0gZSArIGJpYXM7XG4gICAgICAgICAgZiA9IGYgLSBwb3coMiwgZmJpdHMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBEZW5vcm1hbGl6ZWRcbiAgICAgICAgZSA9IDA7XG4gICAgICAgIGYgPSByb3VuZFRvRXZlbih2IC8gcG93KDIsIDEgLSBiaWFzIC0gZmJpdHMpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQYWNrIHNpZ24sIGV4cG9uZW50LCBmcmFjdGlvblxuICAgIGJpdHMgPSBbXTtcbiAgICBmb3IgKGkgPSBmYml0czsgaTsgaSAtPSAxKSB7IGJpdHMucHVzaChmICUgMiA/IDEgOiAwKTsgZiA9IGZsb29yKGYgLyAyKTsgfVxuICAgIGZvciAoaSA9IGViaXRzOyBpOyBpIC09IDEpIHsgYml0cy5wdXNoKGUgJSAyID8gMSA6IDApOyBlID0gZmxvb3IoZSAvIDIpOyB9XG4gICAgYml0cy5wdXNoKHMgPyAxIDogMCk7XG4gICAgYml0cy5yZXZlcnNlKCk7XG4gICAgc3RyID0gYml0cy5qb2luKCcnKTtcblxuICAgIC8vIEJpdHMgdG8gYnl0ZXNcbiAgICBieXRlcyA9IFtdO1xuICAgIHdoaWxlIChzdHIubGVuZ3RoKSB7XG4gICAgICBieXRlcy5wdXNoKHBhcnNlSW50KHN0ci5zdWJzdHJpbmcoMCwgOCksIDIpKTtcbiAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoOCk7XG4gICAgfVxuICAgIHJldHVybiBieXRlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIHVucGFja0lFRUU3NTQoYnl0ZXMsIGViaXRzLCBmYml0cykge1xuICAgIC8vIEJ5dGVzIHRvIGJpdHNcbiAgICB2YXIgYml0cyA9IFtdLCBpLCBqLCBiLCBzdHIsXG4gICAgICAgIGJpYXMsIHMsIGUsIGY7XG5cbiAgICBmb3IgKGkgPSBieXRlcy5sZW5ndGg7IGk7IGkgLT0gMSkge1xuICAgICAgYiA9IGJ5dGVzW2kgLSAxXTtcbiAgICAgIGZvciAoaiA9IDg7IGo7IGogLT0gMSkge1xuICAgICAgICBiaXRzLnB1c2goYiAlIDIgPyAxIDogMCk7IGIgPSBiID4+IDE7XG4gICAgICB9XG4gICAgfVxuICAgIGJpdHMucmV2ZXJzZSgpO1xuICAgIHN0ciA9IGJpdHMuam9pbignJyk7XG5cbiAgICAvLyBVbnBhY2sgc2lnbiwgZXhwb25lbnQsIGZyYWN0aW9uXG4gICAgYmlhcyA9ICgxIDw8IChlYml0cyAtIDEpKSAtIDE7XG4gICAgcyA9IHBhcnNlSW50KHN0ci5zdWJzdHJpbmcoMCwgMSksIDIpID8gLTEgOiAxO1xuICAgIGUgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKDEsIDEgKyBlYml0cyksIDIpO1xuICAgIGYgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKDEgKyBlYml0cyksIDIpO1xuXG4gICAgLy8gUHJvZHVjZSBudW1iZXJcbiAgICBpZiAoZSA9PT0gKDEgPDwgZWJpdHMpIC0gMSkge1xuICAgICAgcmV0dXJuIGYgIT09IDAgPyBOYU4gOiBzICogSW5maW5pdHk7XG4gICAgfSBlbHNlIGlmIChlID4gMCkge1xuICAgICAgLy8gTm9ybWFsaXplZFxuICAgICAgcmV0dXJuIHMgKiBwb3coMiwgZSAtIGJpYXMpICogKDEgKyBmIC8gcG93KDIsIGZiaXRzKSk7XG4gICAgfSBlbHNlIGlmIChmICE9PSAwKSB7XG4gICAgICAvLyBEZW5vcm1hbGl6ZWRcbiAgICAgIHJldHVybiBzICogcG93KDIsIC0oYmlhcyAtIDEpKSAqIChmIC8gcG93KDIsIGZiaXRzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzIDwgMCA/IC0wIDogMDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bnBhY2tGNjQoYikgeyByZXR1cm4gdW5wYWNrSUVFRTc1NChiLCAxMSwgNTIpOyB9XG4gIGZ1bmN0aW9uIHBhY2tGNjQodikgeyByZXR1cm4gcGFja0lFRUU3NTQodiwgMTEsIDUyKTsgfVxuICBmdW5jdGlvbiB1bnBhY2tGMzIoYikgeyByZXR1cm4gdW5wYWNrSUVFRTc1NChiLCA4LCAyMyk7IH1cbiAgZnVuY3Rpb24gcGFja0YzMih2KSB7IHJldHVybiBwYWNrSUVFRTc1NCh2LCA4LCAyMyk7IH1cblxuICAvL1xuICAvLyAzIFRoZSBBcnJheUJ1ZmZlciBUeXBlXG4gIC8vXG5cbiAgKGZ1bmN0aW9uKCkge1xuXG4gICAgZnVuY3Rpb24gQXJyYXlCdWZmZXIobGVuZ3RoKSB7XG4gICAgICBsZW5ndGggPSBUb0ludDMyKGxlbmd0aCk7XG4gICAgICBpZiAobGVuZ3RoIDwgMCkgdGhyb3cgUmFuZ2VFcnJvcignQXJyYXlCdWZmZXIgc2l6ZSBpcyBub3QgYSBzbWFsbCBlbm91Z2ggcG9zaXRpdmUgaW50ZWdlci4nKTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnYnl0ZUxlbmd0aCcsIHt2YWx1ZTogbGVuZ3RofSk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19ieXRlcycsIHt2YWx1ZTogQXJyYXkobGVuZ3RoKX0pO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKVxuICAgICAgICB0aGlzLl9ieXRlc1tpXSA9IDA7XG4gICAgfVxuXG4gICAgZ2xvYmFsLkFycmF5QnVmZmVyID0gZ2xvYmFsLkFycmF5QnVmZmVyIHx8IEFycmF5QnVmZmVyO1xuXG4gICAgLy9cbiAgICAvLyA1IFRoZSBUeXBlZCBBcnJheSBWaWV3IFR5cGVzXG4gICAgLy9cblxuICAgIGZ1bmN0aW9uICRUeXBlZEFycmF5JCgpIHtcblxuICAgICAgLy8gJVR5cGVkQXJyYXklICggbGVuZ3RoIClcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCB8fCB0eXBlb2YgYXJndW1lbnRzWzBdICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKGxlbmd0aCkge1xuICAgICAgICAgIGxlbmd0aCA9IFRvSW50MzIobGVuZ3RoKTtcbiAgICAgICAgICBpZiAobGVuZ3RoIDwgMCkgdGhyb3cgUmFuZ2VFcnJvcignbGVuZ3RoIGlzIG5vdCBhIHNtYWxsIGVub3VnaCBwb3NpdGl2ZSBpbnRlZ2VyLicpO1xuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbGVuZ3RoJywge3ZhbHVlOiBsZW5ndGh9KTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2J5dGVMZW5ndGgnLCB7dmFsdWU6IGxlbmd0aCAqIHRoaXMuQllURVNfUEVSX0VMRU1FTlR9KTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2J1ZmZlcicsIHt2YWx1ZTogbmV3IEFycmF5QnVmZmVyKHRoaXMuYnl0ZUxlbmd0aCl9KTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2J5dGVPZmZzZXQnLCB7dmFsdWU6IDB9KTtcblxuICAgICAgICAgfSkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgLy8gJVR5cGVkQXJyYXklICggdHlwZWRBcnJheSApXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAxICYmXG4gICAgICAgICAgVHlwZShhcmd1bWVudHNbMF0pID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgIGFyZ3VtZW50c1swXSBpbnN0YW5jZW9mICRUeXBlZEFycmF5JCkge1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKHR5cGVkQXJyYXkpe1xuICAgICAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yICE9PSB0eXBlZEFycmF5LmNvbnN0cnVjdG9yKSB0aHJvdyBUeXBlRXJyb3IoKTtcblxuICAgICAgICAgIHZhciBieXRlTGVuZ3RoID0gdHlwZWRBcnJheS5sZW5ndGggKiB0aGlzLkJZVEVTX1BFUl9FTEVNRU5UO1xuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnYnVmZmVyJywge3ZhbHVlOiBuZXcgQXJyYXlCdWZmZXIoYnl0ZUxlbmd0aCl9KTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2J5dGVMZW5ndGgnLCB7dmFsdWU6IGJ5dGVMZW5ndGh9KTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2J5dGVPZmZzZXQnLCB7dmFsdWU6IDB9KTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2xlbmd0aCcsIHt2YWx1ZTogdHlwZWRBcnJheS5sZW5ndGh9KTtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSlcbiAgICAgICAgICAgIHRoaXMuX3NldHRlcihpLCB0eXBlZEFycmF5Ll9nZXR0ZXIoaSkpO1xuXG4gICAgICAgIH0pLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG5cbiAgICAgIC8vICVUeXBlZEFycmF5JSAoIGFycmF5IClcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDEgJiZcbiAgICAgICAgICBUeXBlKGFyZ3VtZW50c1swXSkgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgIShhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiAkVHlwZWRBcnJheSQpICYmXG4gICAgICAgICAgIShhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciB8fCBDbGFzcyhhcmd1bWVudHNbMF0pID09PSAnQXJyYXlCdWZmZXInKSkge1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKGFycmF5KSB7XG5cbiAgICAgICAgICB2YXIgYnl0ZUxlbmd0aCA9IGFycmF5Lmxlbmd0aCAqIHRoaXMuQllURVNfUEVSX0VMRU1FTlQ7XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdidWZmZXInLCB7dmFsdWU6IG5ldyBBcnJheUJ1ZmZlcihieXRlTGVuZ3RoKX0pO1xuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnYnl0ZUxlbmd0aCcsIHt2YWx1ZTogYnl0ZUxlbmd0aH0pO1xuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnYnl0ZU9mZnNldCcsIHt2YWx1ZTogMH0pO1xuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbGVuZ3RoJywge3ZhbHVlOiBhcnJheS5sZW5ndGh9KTtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgdmFyIHMgPSBhcnJheVtpXTtcbiAgICAgICAgICAgIHRoaXMuX3NldHRlcihpLCBOdW1iZXIocykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgLy8gJVR5cGVkQXJyYXklICggYnVmZmVyLCBieXRlT2Zmc2V0PTAsIGxlbmd0aD11bmRlZmluZWQgKVxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMSAmJlxuICAgICAgICAgIFR5cGUoYXJndW1lbnRzWzBdKSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgfHwgQ2xhc3MoYXJndW1lbnRzWzBdKSA9PT0gJ0FycmF5QnVmZmVyJykpIHtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbihidWZmZXIsIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuXG4gICAgICAgICAgYnl0ZU9mZnNldCA9IFRvVWludDMyKGJ5dGVPZmZzZXQpO1xuICAgICAgICAgIGlmIChieXRlT2Zmc2V0ID4gYnVmZmVyLmJ5dGVMZW5ndGgpXG4gICAgICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdieXRlT2Zmc2V0IG91dCBvZiByYW5nZScpO1xuXG4gICAgICAgICAgLy8gVGhlIGdpdmVuIGJ5dGVPZmZzZXQgbXVzdCBiZSBhIG11bHRpcGxlIG9mIHRoZSBlbGVtZW50XG4gICAgICAgICAgLy8gc2l6ZSBvZiB0aGUgc3BlY2lmaWMgdHlwZSwgb3RoZXJ3aXNlIGFuIGV4Y2VwdGlvbiBpcyByYWlzZWQuXG4gICAgICAgICAgaWYgKGJ5dGVPZmZzZXQgJSB0aGlzLkJZVEVTX1BFUl9FTEVNRU5UKVxuICAgICAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignYnVmZmVyIGxlbmd0aCBtaW51cyB0aGUgYnl0ZU9mZnNldCBpcyBub3QgYSBtdWx0aXBsZSBvZiB0aGUgZWxlbWVudCBzaXplLicpO1xuXG4gICAgICAgICAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgYnl0ZUxlbmd0aCA9IGJ1ZmZlci5ieXRlTGVuZ3RoIC0gYnl0ZU9mZnNldDtcbiAgICAgICAgICAgIGlmIChieXRlTGVuZ3RoICUgdGhpcy5CWVRFU19QRVJfRUxFTUVOVClcbiAgICAgICAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignbGVuZ3RoIG9mIGJ1ZmZlciBtaW51cyBieXRlT2Zmc2V0IG5vdCBhIG11bHRpcGxlIG9mIHRoZSBlbGVtZW50IHNpemUnKTtcbiAgICAgICAgICAgIGxlbmd0aCA9IGJ5dGVMZW5ndGggLyB0aGlzLkJZVEVTX1BFUl9FTEVNRU5UO1xuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IFRvVWludDMyKGxlbmd0aCk7XG4gICAgICAgICAgICBieXRlTGVuZ3RoID0gbGVuZ3RoICogdGhpcy5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoKGJ5dGVPZmZzZXQgKyBieXRlTGVuZ3RoKSA+IGJ1ZmZlci5ieXRlTGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignYnl0ZU9mZnNldCBhbmQgbGVuZ3RoIHJlZmVyZW5jZSBhbiBhcmVhIGJleW9uZCB0aGUgZW5kIG9mIHRoZSBidWZmZXInKTtcblxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnYnVmZmVyJywge3ZhbHVlOiBidWZmZXJ9KTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2J5dGVMZW5ndGgnLCB7dmFsdWU6IGJ5dGVMZW5ndGh9KTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2J5dGVPZmZzZXQnLCB7dmFsdWU6IGJ5dGVPZmZzZXR9KTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2xlbmd0aCcsIHt2YWx1ZTogbGVuZ3RofSk7XG5cbiAgICAgICAgfSkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgLy8gJVR5cGVkQXJyYXklICggYWxsIG90aGVyIGFyZ3VtZW50IGNvbWJpbmF0aW9ucyApXG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBQcm9wZXJ0aWVzIG9mIHRoZSAlVHlwZWRBcnJheSBJbnN0cmluc2ljIE9iamVjdFxuXG4gICAgLy8gJVR5cGVkQXJyYXklLmZyb20gKCBzb3VyY2UgLCBtYXBmbj11bmRlZmluZWQsIHRoaXNBcmc9dW5kZWZpbmVkIClcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoJFR5cGVkQXJyYXkkLCAnZnJvbScsIHt2YWx1ZTogZnVuY3Rpb24oaXRlcmFibGUpIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcyhpdGVyYWJsZSk7XG4gICAgfX0pO1xuXG4gICAgLy8gJVR5cGVkQXJyYXklLm9mICggLi4uaXRlbXMgKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkVHlwZWRBcnJheSQsICdvZicsIHt2YWx1ZTogZnVuY3Rpb24oLyouLi5pdGVtcyovKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMoYXJndW1lbnRzKTtcbiAgICB9fSk7XG5cbiAgICAvLyAlVHlwZWRBcnJheSUucHJvdG90eXBlXG4gICAgdmFyICRUeXBlZEFycmF5UHJvdG90eXBlJCA9IHt9O1xuICAgICRUeXBlZEFycmF5JC5wcm90b3R5cGUgPSAkVHlwZWRBcnJheVByb3RvdHlwZSQ7XG5cbiAgICAvLyBXZWJJREw6IGdldHRlciB0eXBlICh1bnNpZ25lZCBsb25nIGluZGV4KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoJFR5cGVkQXJyYXkkLnByb3RvdHlwZSwgJ19nZXR0ZXInLCB7dmFsdWU6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHRocm93IFN5bnRheEVycm9yKCdOb3QgZW5vdWdoIGFyZ3VtZW50cycpO1xuXG4gICAgICBpbmRleCA9IFRvVWludDMyKGluZGV4KTtcbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgICAgdmFyIGJ5dGVzID0gW10sIGksIG87XG4gICAgICBmb3IgKGkgPSAwLCBvID0gdGhpcy5ieXRlT2Zmc2V0ICsgaW5kZXggKiB0aGlzLkJZVEVTX1BFUl9FTEVNRU5UO1xuICAgICAgICAgICBpIDwgdGhpcy5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICAgICAgICAgaSArPSAxLCBvICs9IDEpIHtcbiAgICAgICAgYnl0ZXMucHVzaCh0aGlzLmJ1ZmZlci5fYnl0ZXNbb10pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX3VucGFjayhieXRlcyk7XG4gICAgfX0pO1xuXG4gICAgLy8gTk9OU1RBTkRBUkQ6IGNvbnZlbmllbmNlIGFsaWFzIGZvciBnZXR0ZXI6IHR5cGUgZ2V0KHVuc2lnbmVkIGxvbmcgaW5kZXgpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkVHlwZWRBcnJheSQucHJvdG90eXBlLCAnZ2V0Jywge3ZhbHVlOiAkVHlwZWRBcnJheSQucHJvdG90eXBlLl9nZXR0ZXJ9KTtcblxuICAgIC8vIFdlYklETDogc2V0dGVyIHZvaWQgKHVuc2lnbmVkIGxvbmcgaW5kZXgsIHR5cGUgdmFsdWUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkVHlwZWRBcnJheSQucHJvdG90eXBlLCAnX3NldHRlcicsIHt2YWx1ZTogZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHRocm93IFN5bnRheEVycm9yKCdOb3QgZW5vdWdoIGFyZ3VtZW50cycpO1xuXG4gICAgICBpbmRleCA9IFRvVWludDMyKGluZGV4KTtcbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB2YXIgYnl0ZXMgPSB0aGlzLl9wYWNrKHZhbHVlKSwgaSwgbztcbiAgICAgIGZvciAoaSA9IDAsIG8gPSB0aGlzLmJ5dGVPZmZzZXQgKyBpbmRleCAqIHRoaXMuQllURVNfUEVSX0VMRU1FTlQ7XG4gICAgICAgICAgIGkgPCB0aGlzLkJZVEVTX1BFUl9FTEVNRU5UO1xuICAgICAgICAgICBpICs9IDEsIG8gKz0gMSkge1xuICAgICAgICB0aGlzLmJ1ZmZlci5fYnl0ZXNbb10gPSBieXRlc1tpXTtcbiAgICAgIH1cbiAgICB9fSk7XG5cbiAgICAvLyBnZXQgJVR5cGVkQXJyYXklLnByb3RvdHlwZS5idWZmZXJcbiAgICAvLyBnZXQgJVR5cGVkQXJyYXklLnByb3RvdHlwZS5ieXRlTGVuZ3RoXG4gICAgLy8gZ2V0ICVUeXBlZEFycmF5JS5wcm90b3R5cGUuYnl0ZU9mZnNldFxuICAgIC8vIC0tIGFwcGxpZWQgZGlyZWN0bHkgdG8gdGhlIG9iamVjdCBpbiB0aGUgY29uc3RydWN0b3JcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuY29uc3RydWN0b3JcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoJFR5cGVkQXJyYXkkLnByb3RvdHlwZSwgJ2NvbnN0cnVjdG9yJywge3ZhbHVlOiAkVHlwZWRBcnJheSR9KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuY29weVdpdGhpbiAodGFyZ2V0LCBzdGFydCwgZW5kID0gdGhpcy5sZW5ndGggKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkVHlwZWRBcnJheSQucHJvdG90eXBlLCAnY29weVdpdGhpbicsIHt2YWx1ZTogZnVuY3Rpb24odGFyZ2V0LCBzdGFydCkge1xuICAgICAgdmFyIGVuZCA9IGFyZ3VtZW50c1syXTtcblxuICAgICAgdmFyIG8gPSBUb09iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW5WYWwgPSBvLmxlbmd0aDtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMihsZW5WYWwpO1xuICAgICAgbGVuID0gbWF4KGxlbiwgMCk7XG4gICAgICB2YXIgcmVsYXRpdmVUYXJnZXQgPSBUb0ludDMyKHRhcmdldCk7XG4gICAgICB2YXIgdG87XG4gICAgICBpZiAocmVsYXRpdmVUYXJnZXQgPCAwKVxuICAgICAgICB0byA9IG1heChsZW4gKyByZWxhdGl2ZVRhcmdldCwgMCk7XG4gICAgICBlbHNlXG4gICAgICAgIHRvID0gbWluKHJlbGF0aXZlVGFyZ2V0LCBsZW4pO1xuICAgICAgdmFyIHJlbGF0aXZlU3RhcnQgPSBUb0ludDMyKHN0YXJ0KTtcbiAgICAgIHZhciBmcm9tO1xuICAgICAgaWYgKHJlbGF0aXZlU3RhcnQgPCAwKVxuICAgICAgICBmcm9tID0gbWF4KGxlbiArIHJlbGF0aXZlU3RhcnQsIDApO1xuICAgICAgZWxzZVxuICAgICAgICBmcm9tID0gbWluKHJlbGF0aXZlU3RhcnQsIGxlbik7XG4gICAgICB2YXIgcmVsYXRpdmVFbmQ7XG4gICAgICBpZiAoZW5kID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJlbGF0aXZlRW5kID0gbGVuO1xuICAgICAgZWxzZVxuICAgICAgICByZWxhdGl2ZUVuZCA9IFRvSW50MzIoZW5kKTtcbiAgICAgIHZhciBmaW5hbDtcbiAgICAgIGlmIChyZWxhdGl2ZUVuZCA8IDApXG4gICAgICAgIGZpbmFsID0gbWF4KGxlbiArIHJlbGF0aXZlRW5kLCAwKTtcbiAgICAgIGVsc2VcbiAgICAgICAgZmluYWwgPSBtaW4ocmVsYXRpdmVFbmQsIGxlbik7XG4gICAgICB2YXIgY291bnQgPSBtaW4oZmluYWwgLSBmcm9tLCBsZW4gLSB0byk7XG4gICAgICB2YXIgZGlyZWN0aW9uO1xuICAgICAgaWYgKGZyb20gPCB0byAmJiB0byA8IGZyb20gKyBjb3VudCkge1xuICAgICAgICBkaXJlY3Rpb24gPSAtMTtcbiAgICAgICAgZnJvbSA9IGZyb20gKyBjb3VudCAtIDE7XG4gICAgICAgIHRvID0gdG8gKyBjb3VudCAtIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXJlY3Rpb24gPSAxO1xuICAgICAgfVxuICAgICAgd2hpbGUgKGNvdW50ID4gMCkge1xuICAgICAgICBvLl9zZXR0ZXIodG8sIG8uX2dldHRlcihmcm9tKSk7XG4gICAgICAgIGZyb20gPSBmcm9tICsgZGlyZWN0aW9uO1xuICAgICAgICB0byA9IHRvICsgZGlyZWN0aW9uO1xuICAgICAgICBjb3VudCA9IGNvdW50IC0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvO1xuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuZW50cmllcyAoIClcbiAgICAvLyAtLSBkZWZpbmVkIGluIGVzNi5qcyB0byBzaGltIGJyb3dzZXJzIHcvIG5hdGl2ZSBUeXBlZEFycmF5c1xuXG4gICAgLy8gJVR5cGVkQXJyYXklLnByb3RvdHlwZS5ldmVyeSAoIGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQgKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkVHlwZWRBcnJheSQucHJvdG90eXBlLCAnZXZlcnknLCB7dmFsdWU6IGZ1bmN0aW9uKGNhbGxiYWNrZm4pIHtcbiAgICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMih0Lmxlbmd0aCk7XG4gICAgICBpZiAoIUlzQ2FsbGFibGUoY2FsbGJhY2tmbikpIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICghY2FsbGJhY2tmbi5jYWxsKHRoaXNBcmcsIHQuX2dldHRlcihpKSwgaSwgdCkpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfX0pO1xuXG4gICAgLy8gJVR5cGVkQXJyYXklLnByb3RvdHlwZS5maWxsICh2YWx1ZSwgc3RhcnQgPSAwLCBlbmQgPSB0aGlzLmxlbmd0aCApXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRUeXBlZEFycmF5JC5wcm90b3R5cGUsICdmaWxsJywge3ZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIHN0YXJ0ID0gYXJndW1lbnRzWzFdLFxuICAgICAgICAgIGVuZCA9IGFyZ3VtZW50c1syXTtcblxuICAgICAgdmFyIG8gPSBUb09iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW5WYWwgPSBvLmxlbmd0aDtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMihsZW5WYWwpO1xuICAgICAgbGVuID0gbWF4KGxlbiwgMCk7XG4gICAgICB2YXIgcmVsYXRpdmVTdGFydCA9IFRvSW50MzIoc3RhcnQpO1xuICAgICAgdmFyIGs7XG4gICAgICBpZiAocmVsYXRpdmVTdGFydCA8IDApXG4gICAgICAgIGsgPSBtYXgoKGxlbiArIHJlbGF0aXZlU3RhcnQpLCAwKTtcbiAgICAgIGVsc2VcbiAgICAgICAgayA9IG1pbihyZWxhdGl2ZVN0YXJ0LCBsZW4pO1xuICAgICAgdmFyIHJlbGF0aXZlRW5kO1xuICAgICAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZWxhdGl2ZUVuZCA9IGxlbjtcbiAgICAgIGVsc2VcbiAgICAgICAgcmVsYXRpdmVFbmQgPSBUb0ludDMyKGVuZCk7XG4gICAgICB2YXIgZmluYWw7XG4gICAgICBpZiAocmVsYXRpdmVFbmQgPCAwKVxuICAgICAgICBmaW5hbCA9IG1heCgobGVuICsgcmVsYXRpdmVFbmQpLCAwKTtcbiAgICAgIGVsc2VcbiAgICAgICAgZmluYWwgPSBtaW4ocmVsYXRpdmVFbmQsIGxlbik7XG4gICAgICB3aGlsZSAoayA8IGZpbmFsKSB7XG4gICAgICAgIG8uX3NldHRlcihrLCB2YWx1ZSk7XG4gICAgICAgIGsgKz0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvO1xuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuZmlsdGVyICggY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZCApXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRUeXBlZEFycmF5JC5wcm90b3R5cGUsICdmaWx0ZXInLCB7dmFsdWU6IGZ1bmN0aW9uKGNhbGxiYWNrZm4pIHtcbiAgICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMih0Lmxlbmd0aCk7XG4gICAgICBpZiAoIUlzQ2FsbGFibGUoY2FsbGJhY2tmbikpIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgdmFyIHJlcyA9IFtdO1xuICAgICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgdmFsID0gdC5fZ2V0dGVyKGkpOyAvLyBpbiBjYXNlIGZ1biBtdXRhdGVzIHRoaXNcbiAgICAgICAgaWYgKGNhbGxiYWNrZm4uY2FsbCh0aGlzcCwgdmFsLCBpLCB0KSlcbiAgICAgICAgICByZXMucHVzaCh2YWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHJlcyk7XG4gICAgfX0pO1xuXG4gICAgLy8gJVR5cGVkQXJyYXklLnByb3RvdHlwZS5maW5kIChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRUeXBlZEFycmF5JC5wcm90b3R5cGUsICdmaW5kJywge3ZhbHVlOiBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICAgIHZhciBvID0gVG9PYmplY3QodGhpcyk7XG4gICAgICB2YXIgbGVuVmFsdWUgPSBvLmxlbmd0aDtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMihsZW5WYWx1ZSk7XG4gICAgICBpZiAoIUlzQ2FsbGFibGUocHJlZGljYXRlKSkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICAgICAgdmFyIGsgPSAwO1xuICAgICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgICAgdmFyIGtWYWx1ZSA9IG8uX2dldHRlcihrKTtcbiAgICAgICAgdmFyIHRlc3RSZXN1bHQgPSBwcmVkaWNhdGUuY2FsbCh0LCBrVmFsdWUsIGssIG8pO1xuICAgICAgICBpZiAoQm9vbGVhbih0ZXN0UmVzdWx0KSlcbiAgICAgICAgICByZXR1cm4ga1ZhbHVlO1xuICAgICAgICArK2s7XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuZmluZEluZGV4ICggcHJlZGljYXRlLCB0aGlzQXJnID0gdW5kZWZpbmVkIClcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoJFR5cGVkQXJyYXkkLnByb3RvdHlwZSwgJ2ZpbmRJbmRleCcsIHt2YWx1ZTogZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgICB2YXIgbyA9IFRvT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGxlblZhbHVlID0gby5sZW5ndGg7XG4gICAgICB2YXIgbGVuID0gVG9VaW50MzIobGVuVmFsdWUpO1xuICAgICAgaWYgKCFJc0NhbGxhYmxlKHByZWRpY2F0ZSkpIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgdmFyIHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICAgIHZhciBrID0gMDtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIHZhciBrVmFsdWUgPSBvLl9nZXR0ZXIoayk7XG4gICAgICAgIHZhciB0ZXN0UmVzdWx0ID0gcHJlZGljYXRlLmNhbGwodCwga1ZhbHVlLCBrLCBvKTtcbiAgICAgICAgaWYgKEJvb2xlYW4odGVzdFJlc3VsdCkpXG4gICAgICAgICAgcmV0dXJuIGs7XG4gICAgICAgICsraztcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9fSk7XG5cbiAgICAvLyAlVHlwZWRBcnJheSUucHJvdG90eXBlLmZvckVhY2ggKCBjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkIClcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoJFR5cGVkQXJyYXkkLnByb3RvdHlwZSwgJ2ZvckVhY2gnLCB7dmFsdWU6IGZ1bmN0aW9uKGNhbGxiYWNrZm4pIHtcbiAgICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMih0Lmxlbmd0aCk7XG4gICAgICBpZiAoIUlzQ2FsbGFibGUoY2FsbGJhY2tmbikpIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgICAgY2FsbGJhY2tmbi5jYWxsKHRoaXNwLCB0Ll9nZXR0ZXIoaSksIGksIHQpO1xuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuaW5kZXhPZiAoc2VhcmNoRWxlbWVudCwgZnJvbUluZGV4ID0gMCApXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRUeXBlZEFycmF5JC5wcm90b3R5cGUsICdpbmRleE9mJywge3ZhbHVlOiBmdW5jdGlvbihzZWFyY2hFbGVtZW50KSB7XG4gICAgICBpZiAodGhpcyA9PT0gdW5kZWZpbmVkIHx8IHRoaXMgPT09IG51bGwpIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgdmFyIHQgPSBPYmplY3QodGhpcyk7XG4gICAgICB2YXIgbGVuID0gVG9VaW50MzIodC5sZW5ndGgpO1xuICAgICAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIC0xO1xuICAgICAgdmFyIG4gPSAwO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIG4gPSBOdW1iZXIoYXJndW1lbnRzWzFdKTtcbiAgICAgICAgaWYgKG4gIT09IG4pIHtcbiAgICAgICAgICBuID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChuICE9PSAwICYmIG4gIT09ICgxIC8gMCkgJiYgbiAhPT0gLSgxIC8gMCkpIHtcbiAgICAgICAgICBuID0gKG4gPiAwIHx8IC0xKSAqIGZsb29yKGFicyhuKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChuID49IGxlbikgcmV0dXJuIC0xO1xuICAgICAgdmFyIGsgPSBuID49IDAgPyBuIDogbWF4KGxlbiAtIGFicyhuKSwgMCk7XG4gICAgICBmb3IgKDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgIGlmICh0Ll9nZXR0ZXIoaykgPT09IHNlYXJjaEVsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuam9pbiAoIHNlcGFyYXRvciApXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRUeXBlZEFycmF5JC5wcm90b3R5cGUsICdqb2luJywge3ZhbHVlOiBmdW5jdGlvbihzZXBhcmF0b3IpIHtcbiAgICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMih0Lmxlbmd0aCk7XG4gICAgICB2YXIgdG1wID0gQXJyYXkobGVuKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICAgIHRtcFtpXSA9IHQuX2dldHRlcihpKTtcbiAgICAgIHJldHVybiB0bXAuam9pbihzZXBhcmF0b3IgPT09IHVuZGVmaW5lZCA/ICcsJyA6IHNlcGFyYXRvcik7IC8vIEhhY2sgZm9yIElFN1xuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUua2V5cyAoIClcbiAgICAvLyAtLSBkZWZpbmVkIGluIGVzNi5qcyB0byBzaGltIGJyb3dzZXJzIHcvIG5hdGl2ZSBUeXBlZEFycmF5c1xuXG4gICAgLy8gJVR5cGVkQXJyYXklLnByb3RvdHlwZS5sYXN0SW5kZXhPZiAoIHNlYXJjaEVsZW1lbnQsIGZyb21JbmRleCA9IHRoaXMubGVuZ3RoLTEgKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkVHlwZWRBcnJheSQucHJvdG90eXBlLCAnbGFzdEluZGV4T2YnLCB7dmFsdWU6IGZ1bmN0aW9uKHNlYXJjaEVsZW1lbnQpIHtcbiAgICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMih0Lmxlbmd0aCk7XG4gICAgICBpZiAobGVuID09PSAwKSByZXR1cm4gLTE7XG4gICAgICB2YXIgbiA9IGxlbjtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBuID0gTnVtYmVyKGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGlmIChuICE9PSBuKSB7XG4gICAgICAgICAgbiA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAobiAhPT0gMCAmJiBuICE9PSAoMSAvIDApICYmIG4gIT09IC0oMSAvIDApKSB7XG4gICAgICAgICAgbiA9IChuID4gMCB8fCAtMSkgKiBmbG9vcihhYnMobikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgayA9IG4gPj0gMCA/IG1pbihuLCBsZW4gLSAxKSA6IGxlbiAtIGFicyhuKTtcbiAgICAgIGZvciAoOyBrID49IDA7IGstLSkge1xuICAgICAgICBpZiAodC5fZ2V0dGVyKGspID09PSBzZWFyY2hFbGVtZW50KVxuICAgICAgICAgIHJldHVybiBrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH19KTtcblxuICAgIC8vIGdldCAlVHlwZWRBcnJheSUucHJvdG90eXBlLmxlbmd0aFxuICAgIC8vIC0tIGFwcGxpZWQgZGlyZWN0bHkgdG8gdGhlIG9iamVjdCBpbiB0aGUgY29uc3RydWN0b3JcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUubWFwICggY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZCApXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRUeXBlZEFycmF5JC5wcm90b3R5cGUsICdtYXAnLCB7dmFsdWU6IGZ1bmN0aW9uKGNhbGxiYWNrZm4pIHtcbiAgICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMih0Lmxlbmd0aCk7XG4gICAgICBpZiAoIUlzQ2FsbGFibGUoY2FsbGJhY2tmbikpIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgdmFyIHJlcyA9IFtdOyByZXMubGVuZ3RoID0gbGVuO1xuICAgICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgICAgcmVzW2ldID0gY2FsbGJhY2tmbi5jYWxsKHRoaXNwLCB0Ll9nZXR0ZXIoaSksIGksIHQpO1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHJlcyk7XG4gICAgfX0pO1xuXG4gICAgLy8gJVR5cGVkQXJyYXklLnByb3RvdHlwZS5yZWR1Y2UgKCBjYWxsYmFja2ZuIFssIGluaXRpYWxWYWx1ZV0gKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkVHlwZWRBcnJheSQucHJvdG90eXBlLCAncmVkdWNlJywge3ZhbHVlOiBmdW5jdGlvbihjYWxsYmFja2ZuKSB7XG4gICAgICBpZiAodGhpcyA9PT0gdW5kZWZpbmVkIHx8IHRoaXMgPT09IG51bGwpIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgdmFyIHQgPSBPYmplY3QodGhpcyk7XG4gICAgICB2YXIgbGVuID0gVG9VaW50MzIodC5sZW5ndGgpO1xuICAgICAgaWYgKCFJc0NhbGxhYmxlKGNhbGxiYWNrZm4pKSB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICAgIC8vIG5vIHZhbHVlIHRvIHJldHVybiBpZiBubyBpbml0aWFsIHZhbHVlIGFuZCBhbiBlbXB0eSBhcnJheVxuICAgICAgaWYgKGxlbiA9PT0gMCAmJiBhcmd1bWVudHMubGVuZ3RoID09PSAxKSB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICAgIHZhciBrID0gMDtcbiAgICAgIHZhciBhY2N1bXVsYXRvcjtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgYWNjdW11bGF0b3IgPSBhcmd1bWVudHNbMV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY2N1bXVsYXRvciA9IHQuX2dldHRlcihrKyspO1xuICAgICAgfVxuICAgICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgICAgYWNjdW11bGF0b3IgPSBjYWxsYmFja2ZuLmNhbGwodW5kZWZpbmVkLCBhY2N1bXVsYXRvciwgdC5fZ2V0dGVyKGspLCBrLCB0KTtcbiAgICAgICAgaysrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUucmVkdWNlUmlnaHQgKCBjYWxsYmFja2ZuIFssIGluaXRpYWxWYWx1ZV0gKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkVHlwZWRBcnJheSQucHJvdG90eXBlLCAncmVkdWNlUmlnaHQnLCB7dmFsdWU6IGZ1bmN0aW9uKGNhbGxiYWNrZm4pIHtcbiAgICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMih0Lmxlbmd0aCk7XG4gICAgICBpZiAoIUlzQ2FsbGFibGUoY2FsbGJhY2tmbikpIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgLy8gbm8gdmFsdWUgdG8gcmV0dXJuIGlmIG5vIGluaXRpYWwgdmFsdWUsIGVtcHR5IGFycmF5XG4gICAgICBpZiAobGVuID09PSAwICYmIGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgdmFyIGsgPSBsZW4gLSAxO1xuICAgICAgdmFyIGFjY3VtdWxhdG9yO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xuICAgICAgICBhY2N1bXVsYXRvciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjY3VtdWxhdG9yID0gdC5fZ2V0dGVyKGstLSk7XG4gICAgICB9XG4gICAgICB3aGlsZSAoayA+PSAwKSB7XG4gICAgICAgIGFjY3VtdWxhdG9yID0gY2FsbGJhY2tmbi5jYWxsKHVuZGVmaW5lZCwgYWNjdW11bGF0b3IsIHQuX2dldHRlcihrKSwgaywgdCk7XG4gICAgICAgIGstLTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICB9fSk7XG5cbiAgICAvLyAlVHlwZWRBcnJheSUucHJvdG90eXBlLnJldmVyc2UgKCApXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRUeXBlZEFycmF5JC5wcm90b3R5cGUsICdyZXZlcnNlJywge3ZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMih0Lmxlbmd0aCk7XG4gICAgICB2YXIgaGFsZiA9IGZsb29yKGxlbiAvIDIpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBsZW4gLSAxOyBpIDwgaGFsZjsgKytpLCAtLWopIHtcbiAgICAgICAgdmFyIHRtcCA9IHQuX2dldHRlcihpKTtcbiAgICAgICAgdC5fc2V0dGVyKGksIHQuX2dldHRlcihqKSk7XG4gICAgICAgIHQuX3NldHRlcihqLCB0bXApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHQ7XG4gICAgfX0pO1xuXG4gICAgLy8gJVR5cGVkQXJyYXklLnByb3RvdHlwZS5zZXQoYXJyYXksIG9mZnNldCA9IDAgKVxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuc2V0KHR5cGVkQXJyYXksIG9mZnNldCA9IDAgKVxuICAgIC8vIFdlYklETDogdm9pZCBzZXQoVHlwZWRBcnJheSBhcnJheSwgb3B0aW9uYWwgdW5zaWduZWQgbG9uZyBvZmZzZXQpO1xuICAgIC8vIFdlYklETDogdm9pZCBzZXQoc2VxdWVuY2U8dHlwZT4gYXJyYXksIG9wdGlvbmFsIHVuc2lnbmVkIGxvbmcgb2Zmc2V0KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoJFR5cGVkQXJyYXkkLnByb3RvdHlwZSwgJ3NldCcsIHt2YWx1ZTogZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHRocm93IFN5bnRheEVycm9yKCdOb3QgZW5vdWdoIGFyZ3VtZW50cycpO1xuICAgICAgdmFyIGFycmF5LCBzZXF1ZW5jZSwgb2Zmc2V0LCBsZW4sXG4gICAgICAgICAgaSwgcywgZCxcbiAgICAgICAgICBieXRlT2Zmc2V0LCBieXRlTGVuZ3RoLCB0bXA7XG5cbiAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0JyAmJiBhcmd1bWVudHNbMF0uY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IpIHtcbiAgICAgICAgLy8gdm9pZCBzZXQoVHlwZWRBcnJheSBhcnJheSwgb3B0aW9uYWwgdW5zaWduZWQgbG9uZyBvZmZzZXQpO1xuICAgICAgICBhcnJheSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgb2Zmc2V0ID0gVG9VaW50MzIoYXJndW1lbnRzWzFdKTtcblxuICAgICAgICBpZiAob2Zmc2V0ICsgYXJyYXkubGVuZ3RoID4gdGhpcy5sZW5ndGgpIHtcbiAgICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdPZmZzZXQgcGx1cyBsZW5ndGggb2YgYXJyYXkgaXMgb3V0IG9mIHJhbmdlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBieXRlT2Zmc2V0ID0gdGhpcy5ieXRlT2Zmc2V0ICsgb2Zmc2V0ICogdGhpcy5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICAgICAgYnl0ZUxlbmd0aCA9IGFycmF5Lmxlbmd0aCAqIHRoaXMuQllURVNfUEVSX0VMRU1FTlQ7XG5cbiAgICAgICAgaWYgKGFycmF5LmJ1ZmZlciA9PT0gdGhpcy5idWZmZXIpIHtcbiAgICAgICAgICB0bXAgPSBbXTtcbiAgICAgICAgICBmb3IgKGkgPSAwLCBzID0gYXJyYXkuYnl0ZU9mZnNldDsgaSA8IGJ5dGVMZW5ndGg7IGkgKz0gMSwgcyArPSAxKSB7XG4gICAgICAgICAgICB0bXBbaV0gPSBhcnJheS5idWZmZXIuX2J5dGVzW3NdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGkgPSAwLCBkID0gYnl0ZU9mZnNldDsgaSA8IGJ5dGVMZW5ndGg7IGkgKz0gMSwgZCArPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlci5fYnl0ZXNbZF0gPSB0bXBbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAoaSA9IDAsIHMgPSBhcnJheS5ieXRlT2Zmc2V0LCBkID0gYnl0ZU9mZnNldDtcbiAgICAgICAgICAgICAgIGkgPCBieXRlTGVuZ3RoOyBpICs9IDEsIHMgKz0gMSwgZCArPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlci5fYnl0ZXNbZF0gPSBhcnJheS5idWZmZXIuX2J5dGVzW3NdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgYXJndW1lbnRzWzBdLmxlbmd0aCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gdm9pZCBzZXQoc2VxdWVuY2U8dHlwZT4gYXJyYXksIG9wdGlvbmFsIHVuc2lnbmVkIGxvbmcgb2Zmc2V0KTtcbiAgICAgICAgc2VxdWVuY2UgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIGxlbiA9IFRvVWludDMyKHNlcXVlbmNlLmxlbmd0aCk7XG4gICAgICAgIG9mZnNldCA9IFRvVWludDMyKGFyZ3VtZW50c1sxXSk7XG5cbiAgICAgICAgaWYgKG9mZnNldCArIGxlbiA+IHRoaXMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignT2Zmc2V0IHBsdXMgbGVuZ3RoIG9mIGFycmF5IGlzIG91dCBvZiByYW5nZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgcyA9IHNlcXVlbmNlW2ldO1xuICAgICAgICAgIHRoaXMuX3NldHRlcihvZmZzZXQgKyBpLCBOdW1iZXIocykpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuZXhwZWN0ZWQgYXJndW1lbnQgdHlwZShzKScpO1xuICAgICAgfVxuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuc2xpY2UgKCBzdGFydCwgZW5kIClcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoJFR5cGVkQXJyYXkkLnByb3RvdHlwZSwgJ3NsaWNlJywge3ZhbHVlOiBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gICAgICB2YXIgbyA9IFRvT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGxlblZhbCA9IG8ubGVuZ3RoO1xuICAgICAgdmFyIGxlbiA9IFRvVWludDMyKGxlblZhbCk7XG4gICAgICB2YXIgcmVsYXRpdmVTdGFydCA9IFRvSW50MzIoc3RhcnQpO1xuICAgICAgdmFyIGsgPSAocmVsYXRpdmVTdGFydCA8IDApID8gbWF4KGxlbiArIHJlbGF0aXZlU3RhcnQsIDApIDogbWluKHJlbGF0aXZlU3RhcnQsIGxlbik7XG4gICAgICB2YXIgcmVsYXRpdmVFbmQgPSAoZW5kID09PSB1bmRlZmluZWQpID8gbGVuIDogVG9JbnQzMihlbmQpO1xuICAgICAgdmFyIGZpbmFsID0gKHJlbGF0aXZlRW5kIDwgMCkgPyBtYXgobGVuICsgcmVsYXRpdmVFbmQsIDApIDogbWluKHJlbGF0aXZlRW5kLCBsZW4pO1xuICAgICAgdmFyIGNvdW50ID0gZmluYWwgLSBrO1xuICAgICAgdmFyIGMgPSBvLmNvbnN0cnVjdG9yO1xuICAgICAgdmFyIGEgPSBuZXcgYyhjb3VudCk7XG4gICAgICB2YXIgbiA9IDA7XG4gICAgICB3aGlsZSAoayA8IGZpbmFsKSB7XG4gICAgICAgIHZhciBrVmFsdWUgPSBvLl9nZXR0ZXIoayk7XG4gICAgICAgIGEuX3NldHRlcihuLCBrVmFsdWUpO1xuICAgICAgICArK2s7XG4gICAgICAgICsrbjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhO1xuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuc29tZSAoIGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQgKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkVHlwZWRBcnJheSQucHJvdG90eXBlLCAnc29tZScsIHt2YWx1ZTogZnVuY3Rpb24oY2FsbGJhY2tmbikge1xuICAgICAgaWYgKHRoaXMgPT09IHVuZGVmaW5lZCB8fCB0aGlzID09PSBudWxsKSB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICAgIHZhciB0ID0gT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGxlbiA9IFRvVWludDMyKHQubGVuZ3RoKTtcbiAgICAgIGlmICghSXNDYWxsYWJsZShjYWxsYmFja2ZuKSkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFja2ZuLmNhbGwodGhpc3AsIHQuX2dldHRlcihpKSwgaSwgdCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH19KTtcblxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUuc29ydCAoIGNvbXBhcmVmbiApXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRUeXBlZEFycmF5JC5wcm90b3R5cGUsICdzb3J0Jywge3ZhbHVlOiBmdW5jdGlvbihjb21wYXJlZm4pIHtcbiAgICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBUb1VpbnQzMih0Lmxlbmd0aCk7XG4gICAgICB2YXIgdG1wID0gQXJyYXkobGVuKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICAgIHRtcFtpXSA9IHQuX2dldHRlcihpKTtcbiAgICAgIGlmIChjb21wYXJlZm4pIHRtcC5zb3J0KGNvbXBhcmVmbik7IGVsc2UgdG1wLnNvcnQoKTsgLy8gSGFjayBmb3IgSUU4LzlcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgICAgdC5fc2V0dGVyKGksIHRtcFtpXSk7XG4gICAgICByZXR1cm4gdDtcbiAgICB9fSk7XG5cbiAgICAvLyAlVHlwZWRBcnJheSUucHJvdG90eXBlLnN1YmFycmF5KGJlZ2luID0gMCwgZW5kID0gdGhpcy5sZW5ndGggKVxuICAgIC8vIFdlYklETDogVHlwZWRBcnJheSBzdWJhcnJheShsb25nIGJlZ2luLCBvcHRpb25hbCBsb25nIGVuZCk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRUeXBlZEFycmF5JC5wcm90b3R5cGUsICdzdWJhcnJheScsIHt2YWx1ZTogZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICAgICAgZnVuY3Rpb24gY2xhbXAodiwgbWluLCBtYXgpIHsgcmV0dXJuIHYgPCBtaW4gPyBtaW4gOiB2ID4gbWF4ID8gbWF4IDogdjsgfVxuXG4gICAgICBzdGFydCA9IFRvSW50MzIoc3RhcnQpO1xuICAgICAgZW5kID0gVG9JbnQzMihlbmQpO1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHsgc3RhcnQgPSAwOyB9XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHsgZW5kID0gdGhpcy5sZW5ndGg7IH1cblxuICAgICAgaWYgKHN0YXJ0IDwgMCkgeyBzdGFydCA9IHRoaXMubGVuZ3RoICsgc3RhcnQ7IH1cbiAgICAgIGlmIChlbmQgPCAwKSB7IGVuZCA9IHRoaXMubGVuZ3RoICsgZW5kOyB9XG5cbiAgICAgIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIDAsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGVuZCA9IGNsYW1wKGVuZCwgMCwgdGhpcy5sZW5ndGgpO1xuXG4gICAgICB2YXIgbGVuID0gZW5kIC0gc3RhcnQ7XG4gICAgICBpZiAobGVuIDwgMCkge1xuICAgICAgICBsZW4gPSAwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoXG4gICAgICAgIHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQgKyBzdGFydCAqIHRoaXMuQllURVNfUEVSX0VMRU1FTlQsIGxlbik7XG4gICAgfX0pO1xuXG4gICAgLy8gJVR5cGVkQXJyYXklLnByb3RvdHlwZS50b0xvY2FsZVN0cmluZyAoIClcbiAgICAvLyAlVHlwZWRBcnJheSUucHJvdG90eXBlLnRvU3RyaW5nICggKVxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUudmFsdWVzICggKVxuICAgIC8vICVUeXBlZEFycmF5JS5wcm90b3R5cGUgWyBAQGl0ZXJhdG9yIF0gKCApXG4gICAgLy8gZ2V0ICVUeXBlZEFycmF5JS5wcm90b3R5cGUgWyBAQHRvU3RyaW5nVGFnIF1cbiAgICAvLyAtLSBkZWZpbmVkIGluIGVzNi5qcyB0byBzaGltIGJyb3dzZXJzIHcvIG5hdGl2ZSBUeXBlZEFycmF5c1xuXG4gICAgZnVuY3Rpb24gbWFrZVR5cGVkQXJyYXkoZWxlbWVudFNpemUsIHBhY2ssIHVucGFjaykge1xuICAgICAgLy8gRWFjaCBUeXBlZEFycmF5IHR5cGUgcmVxdWlyZXMgYSBkaXN0aW5jdCBjb25zdHJ1Y3RvciBpbnN0YW5jZSB3aXRoXG4gICAgICAvLyBpZGVudGljYWwgbG9naWMsIHdoaWNoIHRoaXMgcHJvZHVjZXMuXG4gICAgICB2YXIgVHlwZWRBcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvbnN0cnVjdG9yJywge3ZhbHVlOiBUeXBlZEFycmF5fSk7XG4gICAgICAgICRUeXBlZEFycmF5JC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBtYWtlQXJyYXlBY2Nlc3NvcnModGhpcyk7XG4gICAgICB9O1xuICAgICAgaWYgKCdfX3Byb3RvX18nIGluIFR5cGVkQXJyYXkpIHtcbiAgICAgICAgVHlwZWRBcnJheS5fX3Byb3RvX18gPSAkVHlwZWRBcnJheSQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBUeXBlZEFycmF5LmZyb20gPSAkVHlwZWRBcnJheSQuZnJvbTtcbiAgICAgICAgVHlwZWRBcnJheS5vZiA9ICRUeXBlZEFycmF5JC5vZjtcbiAgICAgIH1cblxuICAgICAgVHlwZWRBcnJheS5CWVRFU19QRVJfRUxFTUVOVCA9IGVsZW1lbnRTaXplO1xuXG4gICAgICB2YXIgVHlwZWRBcnJheVByb3RvdHlwZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICBUeXBlZEFycmF5UHJvdG90eXBlLnByb3RvdHlwZSA9ICRUeXBlZEFycmF5UHJvdG90eXBlJDtcblxuICAgICAgVHlwZWRBcnJheS5wcm90b3R5cGUgPSBuZXcgVHlwZWRBcnJheVByb3RvdHlwZSgpO1xuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVHlwZWRBcnJheS5wcm90b3R5cGUsICdCWVRFU19QRVJfRUxFTUVOVCcsIHt2YWx1ZTogZWxlbWVudFNpemV9KTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUeXBlZEFycmF5LnByb3RvdHlwZSwgJ19wYWNrJywge3ZhbHVlOiBwYWNrfSk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVHlwZWRBcnJheS5wcm90b3R5cGUsICdfdW5wYWNrJywge3ZhbHVlOiB1bnBhY2t9KTtcblxuICAgICAgcmV0dXJuIFR5cGVkQXJyYXk7XG4gICAgfVxuXG4gICAgdmFyIEludDhBcnJheSA9IG1ha2VUeXBlZEFycmF5KDEsIHBhY2tJOCwgdW5wYWNrSTgpO1xuICAgIHZhciBVaW50OEFycmF5ID0gbWFrZVR5cGVkQXJyYXkoMSwgcGFja1U4LCB1bnBhY2tVOCk7XG4gICAgdmFyIFVpbnQ4Q2xhbXBlZEFycmF5ID0gbWFrZVR5cGVkQXJyYXkoMSwgcGFja1U4Q2xhbXBlZCwgdW5wYWNrVTgpO1xuICAgIHZhciBJbnQxNkFycmF5ID0gbWFrZVR5cGVkQXJyYXkoMiwgcGFja0kxNiwgdW5wYWNrSTE2KTtcbiAgICB2YXIgVWludDE2QXJyYXkgPSBtYWtlVHlwZWRBcnJheSgyLCBwYWNrVTE2LCB1bnBhY2tVMTYpO1xuICAgIHZhciBJbnQzMkFycmF5ID0gbWFrZVR5cGVkQXJyYXkoNCwgcGFja0kzMiwgdW5wYWNrSTMyKTtcbiAgICB2YXIgVWludDMyQXJyYXkgPSBtYWtlVHlwZWRBcnJheSg0LCBwYWNrVTMyLCB1bnBhY2tVMzIpO1xuICAgIHZhciBGbG9hdDMyQXJyYXkgPSBtYWtlVHlwZWRBcnJheSg0LCBwYWNrRjMyLCB1bnBhY2tGMzIpO1xuICAgIHZhciBGbG9hdDY0QXJyYXkgPSBtYWtlVHlwZWRBcnJheSg4LCBwYWNrRjY0LCB1bnBhY2tGNjQpO1xuXG4gICAgZ2xvYmFsLkludDhBcnJheSA9IGdsb2JhbC5JbnQ4QXJyYXkgfHwgSW50OEFycmF5O1xuICAgIGdsb2JhbC5VaW50OEFycmF5ID0gZ2xvYmFsLlVpbnQ4QXJyYXkgfHwgVWludDhBcnJheTtcbiAgICBnbG9iYWwuVWludDhDbGFtcGVkQXJyYXkgPSBnbG9iYWwuVWludDhDbGFtcGVkQXJyYXkgfHwgVWludDhDbGFtcGVkQXJyYXk7XG4gICAgZ2xvYmFsLkludDE2QXJyYXkgPSBnbG9iYWwuSW50MTZBcnJheSB8fCBJbnQxNkFycmF5O1xuICAgIGdsb2JhbC5VaW50MTZBcnJheSA9IGdsb2JhbC5VaW50MTZBcnJheSB8fCBVaW50MTZBcnJheTtcbiAgICBnbG9iYWwuSW50MzJBcnJheSA9IGdsb2JhbC5JbnQzMkFycmF5IHx8IEludDMyQXJyYXk7XG4gICAgZ2xvYmFsLlVpbnQzMkFycmF5ID0gZ2xvYmFsLlVpbnQzMkFycmF5IHx8IFVpbnQzMkFycmF5O1xuICAgIGdsb2JhbC5GbG9hdDMyQXJyYXkgPSBnbG9iYWwuRmxvYXQzMkFycmF5IHx8IEZsb2F0MzJBcnJheTtcbiAgICBnbG9iYWwuRmxvYXQ2NEFycmF5ID0gZ2xvYmFsLkZsb2F0NjRBcnJheSB8fCBGbG9hdDY0QXJyYXk7XG4gIH0oKSk7XG5cbiAgLy9cbiAgLy8gNiBUaGUgRGF0YVZpZXcgVmlldyBUeXBlXG4gIC8vXG5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHIoYXJyYXksIGluZGV4KSB7XG4gICAgICByZXR1cm4gSXNDYWxsYWJsZShhcnJheS5nZXQpID8gYXJyYXkuZ2V0KGluZGV4KSA6IGFycmF5W2luZGV4XTtcbiAgICB9XG5cbiAgICB2YXIgSVNfQklHX0VORElBTiA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciB1MTZhcnJheSA9IG5ldyBVaW50MTZBcnJheShbMHgxMjM0XSksXG4gICAgICAgICAgdThhcnJheSA9IG5ldyBVaW50OEFycmF5KHUxNmFycmF5LmJ1ZmZlcik7XG4gICAgICByZXR1cm4gcih1OGFycmF5LCAwKSA9PT0gMHgxMjtcbiAgICB9KCkpO1xuXG4gICAgLy8gRGF0YVZpZXcoYnVmZmVyLCBieXRlT2Zmc2V0PTAsIGJ5dGVMZW5ndGg9dW5kZWZpbmVkKVxuICAgIC8vIFdlYklETDogQ29uc3RydWN0b3IoQXJyYXlCdWZmZXIgYnVmZmVyLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWwgdW5zaWduZWQgbG9uZyBieXRlT2Zmc2V0LFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWwgdW5zaWduZWQgbG9uZyBieXRlTGVuZ3RoKVxuICAgIGZ1bmN0aW9uIERhdGFWaWV3KGJ1ZmZlciwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCkge1xuICAgICAgaWYgKCEoYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgfHwgQ2xhc3MoYnVmZmVyKSA9PT0gJ0FycmF5QnVmZmVyJykpIHRocm93IFR5cGVFcnJvcigpO1xuXG4gICAgICBieXRlT2Zmc2V0ID0gVG9VaW50MzIoYnl0ZU9mZnNldCk7XG4gICAgICBpZiAoYnl0ZU9mZnNldCA+IGJ1ZmZlci5ieXRlTGVuZ3RoKVxuICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdieXRlT2Zmc2V0IG91dCBvZiByYW5nZScpO1xuXG4gICAgICBpZiAoYnl0ZUxlbmd0aCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBieXRlTGVuZ3RoID0gYnVmZmVyLmJ5dGVMZW5ndGggLSBieXRlT2Zmc2V0O1xuICAgICAgZWxzZVxuICAgICAgICBieXRlTGVuZ3RoID0gVG9VaW50MzIoYnl0ZUxlbmd0aCk7XG5cbiAgICAgIGlmICgoYnl0ZU9mZnNldCArIGJ5dGVMZW5ndGgpID4gYnVmZmVyLmJ5dGVMZW5ndGgpXG4gICAgICAgIHRocm93IFJhbmdlRXJyb3IoJ2J5dGVPZmZzZXQgYW5kIGxlbmd0aCByZWZlcmVuY2UgYW4gYXJlYSBiZXlvbmQgdGhlIGVuZCBvZiB0aGUgYnVmZmVyJyk7XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnYnVmZmVyJywge3ZhbHVlOiBidWZmZXJ9KTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnYnl0ZUxlbmd0aCcsIHt2YWx1ZTogYnl0ZUxlbmd0aH0pO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdieXRlT2Zmc2V0Jywge3ZhbHVlOiBieXRlT2Zmc2V0fSk7XG4gICAgfTtcblxuICAgIC8vIGdldCBEYXRhVmlldy5wcm90b3R5cGUuYnVmZmVyXG4gICAgLy8gZ2V0IERhdGFWaWV3LnByb3RvdHlwZS5ieXRlTGVuZ3RoXG4gICAgLy8gZ2V0IERhdGFWaWV3LnByb3RvdHlwZS5ieXRlT2Zmc2V0XG4gICAgLy8gLS0gYXBwbGllZCBkaXJlY3RseSB0byBpbnN0YW5jZXMgYnkgdGhlIGNvbnN0cnVjdG9yXG5cbiAgICBmdW5jdGlvbiBtYWtlR2V0dGVyKGFycmF5VHlwZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIEdldFZpZXdWYWx1ZShieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgICAgICAgYnl0ZU9mZnNldCA9IFRvVWludDMyKGJ5dGVPZmZzZXQpO1xuXG4gICAgICAgIGlmIChieXRlT2Zmc2V0ICsgYXJyYXlUeXBlLkJZVEVTX1BFUl9FTEVNRU5UID4gdGhpcy5ieXRlTGVuZ3RoKVxuICAgICAgICAgIHRocm93IFJhbmdlRXJyb3IoJ0FycmF5IGluZGV4IG91dCBvZiByYW5nZScpO1xuXG4gICAgICAgIGJ5dGVPZmZzZXQgKz0gdGhpcy5ieXRlT2Zmc2V0O1xuXG4gICAgICAgIHZhciB1aW50OEFycmF5ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIsIGJ5dGVPZmZzZXQsIGFycmF5VHlwZS5CWVRFU19QRVJfRUxFTUVOVCksXG4gICAgICAgICAgICBieXRlcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5VHlwZS5CWVRFU19QRVJfRUxFTUVOVDsgaSArPSAxKVxuICAgICAgICAgIGJ5dGVzLnB1c2gocih1aW50OEFycmF5LCBpKSk7XG5cbiAgICAgICAgaWYgKEJvb2xlYW4obGl0dGxlRW5kaWFuKSA9PT0gQm9vbGVhbihJU19CSUdfRU5ESUFOKSlcbiAgICAgICAgICBieXRlcy5yZXZlcnNlKCk7XG5cbiAgICAgICAgcmV0dXJuIHIobmV3IGFycmF5VHlwZShuZXcgVWludDhBcnJheShieXRlcykuYnVmZmVyKSwgMCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVmlldy5wcm90b3R5cGUsICdnZXRVaW50OCcsIHt2YWx1ZTogbWFrZUdldHRlcihVaW50OEFycmF5KX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVmlldy5wcm90b3R5cGUsICdnZXRJbnQ4Jywge3ZhbHVlOiBtYWtlR2V0dGVyKEludDhBcnJheSl9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVZpZXcucHJvdG90eXBlLCAnZ2V0VWludDE2Jywge3ZhbHVlOiBtYWtlR2V0dGVyKFVpbnQxNkFycmF5KX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVmlldy5wcm90b3R5cGUsICdnZXRJbnQxNicsIHt2YWx1ZTogbWFrZUdldHRlcihJbnQxNkFycmF5KX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVmlldy5wcm90b3R5cGUsICdnZXRVaW50MzInLCB7dmFsdWU6IG1ha2VHZXR0ZXIoVWludDMyQXJyYXkpfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFWaWV3LnByb3RvdHlwZSwgJ2dldEludDMyJywge3ZhbHVlOiBtYWtlR2V0dGVyKEludDMyQXJyYXkpfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFWaWV3LnByb3RvdHlwZSwgJ2dldEZsb2F0MzInLCB7dmFsdWU6IG1ha2VHZXR0ZXIoRmxvYXQzMkFycmF5KX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVmlldy5wcm90b3R5cGUsICdnZXRGbG9hdDY0Jywge3ZhbHVlOiBtYWtlR2V0dGVyKEZsb2F0NjRBcnJheSl9KTtcblxuICAgIGZ1bmN0aW9uIG1ha2VTZXR0ZXIoYXJyYXlUeXBlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gU2V0Vmlld1ZhbHVlKGJ5dGVPZmZzZXQsIHZhbHVlLCBsaXR0bGVFbmRpYW4pIHtcbiAgICAgICAgYnl0ZU9mZnNldCA9IFRvVWludDMyKGJ5dGVPZmZzZXQpO1xuICAgICAgICBpZiAoYnl0ZU9mZnNldCArIGFycmF5VHlwZS5CWVRFU19QRVJfRUxFTUVOVCA+IHRoaXMuYnl0ZUxlbmd0aClcbiAgICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdBcnJheSBpbmRleCBvdXQgb2YgcmFuZ2UnKTtcblxuICAgICAgICAvLyBHZXQgYnl0ZXNcbiAgICAgICAgdmFyIHR5cGVBcnJheSA9IG5ldyBhcnJheVR5cGUoW3ZhbHVlXSksXG4gICAgICAgICAgICBieXRlQXJyYXkgPSBuZXcgVWludDhBcnJheSh0eXBlQXJyYXkuYnVmZmVyKSxcbiAgICAgICAgICAgIGJ5dGVzID0gW10sIGksIGJ5dGVWaWV3O1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBhcnJheVR5cGUuQllURVNfUEVSX0VMRU1FTlQ7IGkgKz0gMSlcbiAgICAgICAgICBieXRlcy5wdXNoKHIoYnl0ZUFycmF5LCBpKSk7XG5cbiAgICAgICAgLy8gRmxpcCBpZiBuZWNlc3NhcnlcbiAgICAgICAgaWYgKEJvb2xlYW4obGl0dGxlRW5kaWFuKSA9PT0gQm9vbGVhbihJU19CSUdfRU5ESUFOKSlcbiAgICAgICAgICBieXRlcy5yZXZlcnNlKCk7XG5cbiAgICAgICAgLy8gV3JpdGUgdGhlbVxuICAgICAgICBieXRlVmlldyA9IG5ldyBVaW50OEFycmF5KHRoaXMuYnVmZmVyLCBieXRlT2Zmc2V0LCBhcnJheVR5cGUuQllURVNfUEVSX0VMRU1FTlQpO1xuICAgICAgICBieXRlVmlldy5zZXQoYnl0ZXMpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVZpZXcucHJvdG90eXBlLCAnc2V0VWludDgnLCB7dmFsdWU6IG1ha2VTZXR0ZXIoVWludDhBcnJheSl9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVZpZXcucHJvdG90eXBlLCAnc2V0SW50OCcsIHt2YWx1ZTogbWFrZVNldHRlcihJbnQ4QXJyYXkpfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFWaWV3LnByb3RvdHlwZSwgJ3NldFVpbnQxNicsIHt2YWx1ZTogbWFrZVNldHRlcihVaW50MTZBcnJheSl9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVZpZXcucHJvdG90eXBlLCAnc2V0SW50MTYnLCB7dmFsdWU6IG1ha2VTZXR0ZXIoSW50MTZBcnJheSl9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVZpZXcucHJvdG90eXBlLCAnc2V0VWludDMyJywge3ZhbHVlOiBtYWtlU2V0dGVyKFVpbnQzMkFycmF5KX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVmlldy5wcm90b3R5cGUsICdzZXRJbnQzMicsIHt2YWx1ZTogbWFrZVNldHRlcihJbnQzMkFycmF5KX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVmlldy5wcm90b3R5cGUsICdzZXRGbG9hdDMyJywge3ZhbHVlOiBtYWtlU2V0dGVyKEZsb2F0MzJBcnJheSl9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVZpZXcucHJvdG90eXBlLCAnc2V0RmxvYXQ2NCcsIHt2YWx1ZTogbWFrZVNldHRlcihGbG9hdDY0QXJyYXkpfSk7XG5cbiAgICBnbG9iYWwuRGF0YVZpZXcgPSBnbG9iYWwuRGF0YVZpZXcgfHwgRGF0YVZpZXc7XG5cbiAgfSgpKTtcblxufSh0aGlzKSk7XG4iXSwibmFtZXMiOlsiZ2xvYmFsIiwidW5kZWZpbmVkIiwiTUFYX0FSUkFZX0xFTkdUSCIsIlR5cGUiLCJ2IiwiQ2xhc3MiLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImNhbGwiLCJyZXBsYWNlIiwiSXNDYWxsYWJsZSIsIm8iLCJUb09iamVjdCIsIlR5cGVFcnJvciIsIlRvSW50MzIiLCJUb1VpbnQzMiIsIkxOMiIsIk1hdGgiLCJhYnMiLCJmbG9vciIsImxvZyIsIm1heCIsIm1pbiIsInBvdyIsInJvdW5kIiwib3JpZyIsImRlZmluZVByb3BlcnR5IiwiZG9tX29ubHkiLCJfIiwicHJvcCIsImRlc2MiLCJfX2RlZmluZUdldHRlcl9fIiwiZ2V0IiwiX19kZWZpbmVTZXR0ZXJfXyIsInNldCIsInZhbHVlIiwibWFrZUFycmF5QWNjZXNzb3JzIiwib2JqIiwibGVuZ3RoIiwiUmFuZ2VFcnJvciIsIm1ha2VBcnJheUFjY2Vzc29yIiwiaW5kZXgiLCJfZ2V0dGVyIiwiX3NldHRlciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJpIiwiYXNfc2lnbmVkIiwiYml0cyIsInMiLCJhc191bnNpZ25lZCIsInBhY2tJOCIsIm4iLCJ1bnBhY2tJOCIsImJ5dGVzIiwicGFja1U4IiwidW5wYWNrVTgiLCJwYWNrVThDbGFtcGVkIiwiTnVtYmVyIiwicGFja0kxNiIsInVucGFja0kxNiIsInBhY2tVMTYiLCJ1bnBhY2tVMTYiLCJwYWNrSTMyIiwidW5wYWNrSTMyIiwicGFja1UzMiIsInVucGFja1UzMiIsInBhY2tJRUVFNzU0IiwiZWJpdHMiLCJmYml0cyIsImJpYXMiLCJlIiwiZiIsImxuIiwic3RyIiwicm91bmRUb0V2ZW4iLCJ3IiwiSW5maW5pdHkiLCJwdXNoIiwicmV2ZXJzZSIsImpvaW4iLCJwYXJzZUludCIsInN1YnN0cmluZyIsInVucGFja0lFRUU3NTQiLCJqIiwiYiIsIk5hTiIsInVucGFja0Y2NCIsInBhY2tGNjQiLCJ1bnBhY2tGMzIiLCJwYWNrRjMyIiwiQXJyYXlCdWZmZXIiLCJBcnJheSIsIl9ieXRlcyIsIiRUeXBlZEFycmF5JCIsImFyZ3VtZW50cyIsIkJZVEVTX1BFUl9FTEVNRU5UIiwiYnl0ZUxlbmd0aCIsImFwcGx5IiwidHlwZWRBcnJheSIsImNvbnN0cnVjdG9yIiwiYXJyYXkiLCJidWZmZXIiLCJieXRlT2Zmc2V0IiwiaXRlcmFibGUiLCIkVHlwZWRBcnJheVByb3RvdHlwZSQiLCJTeW50YXhFcnJvciIsIl91bnBhY2siLCJfcGFjayIsInRhcmdldCIsInN0YXJ0IiwiZW5kIiwibGVuVmFsIiwibGVuIiwicmVsYXRpdmVUYXJnZXQiLCJ0byIsInJlbGF0aXZlU3RhcnQiLCJmcm9tIiwicmVsYXRpdmVFbmQiLCJmaW5hbCIsImNvdW50IiwiZGlyZWN0aW9uIiwiY2FsbGJhY2tmbiIsInQiLCJ0aGlzQXJnIiwiayIsInJlcyIsInRoaXNwIiwidmFsIiwicHJlZGljYXRlIiwibGVuVmFsdWUiLCJrVmFsdWUiLCJ0ZXN0UmVzdWx0IiwiQm9vbGVhbiIsInNlYXJjaEVsZW1lbnQiLCJzZXBhcmF0b3IiLCJ0bXAiLCJhY2N1bXVsYXRvciIsImhhbGYiLCJzZXF1ZW5jZSIsIm9mZnNldCIsImQiLCJjIiwiYSIsImNvbXBhcmVmbiIsInNvcnQiLCJjbGFtcCIsIm1ha2VUeXBlZEFycmF5IiwiZWxlbWVudFNpemUiLCJwYWNrIiwidW5wYWNrIiwiVHlwZWRBcnJheSIsIl9fcHJvdG9fXyIsIm9mIiwiVHlwZWRBcnJheVByb3RvdHlwZSIsIkludDhBcnJheSIsIlVpbnQ4QXJyYXkiLCJVaW50OENsYW1wZWRBcnJheSIsIkludDE2QXJyYXkiLCJVaW50MTZBcnJheSIsIkludDMyQXJyYXkiLCJVaW50MzJBcnJheSIsIkZsb2F0MzJBcnJheSIsIkZsb2F0NjRBcnJheSIsInIiLCJJU19CSUdfRU5ESUFOIiwidTE2YXJyYXkiLCJ1OGFycmF5IiwiRGF0YVZpZXciLCJtYWtlR2V0dGVyIiwiYXJyYXlUeXBlIiwiR2V0Vmlld1ZhbHVlIiwibGl0dGxlRW5kaWFuIiwidWludDhBcnJheSIsIm1ha2VTZXR0ZXIiLCJTZXRWaWV3VmFsdWUiLCJ0eXBlQXJyYXkiLCJieXRlQXJyYXkiLCJieXRlVmlldyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQkMsR0FFRCw0QkFBNEI7QUFDNUIseUNBQXlDO0FBQ3pDLHdEQUF3RDtBQUN4RCwrQ0FBK0M7QUFFL0Msa0VBQWtFO0FBQ2xFLGtFQUFrRTtBQUNsRSxxQkFBcUI7QUFDckIsRUFBRTtBQUNGLGNBQWM7QUFDZCwwRUFBMEU7QUFDMUUsaUVBQWlFO0FBQ2hFLENBQUEsU0FBU0EsTUFBTTtJQUNkO0lBQ0EsSUFBSUMsWUFBYSxLQUFLLEdBQUksV0FBVztJQUVyQyxvRkFBb0Y7SUFDcEYsdUVBQXVFO0lBQ3ZFLElBQUlDLG1CQUFtQjtJQUV2Qiw2REFBNkQ7SUFDN0QsU0FBU0MsS0FBS0MsQ0FBQztRQUNiLE9BQU8sT0FBT0E7WUFDZCxLQUFLO2dCQUFh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