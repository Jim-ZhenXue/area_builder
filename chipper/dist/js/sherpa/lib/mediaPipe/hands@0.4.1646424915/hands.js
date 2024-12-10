(function() {
    'use strict';
    var x;
    function aa(a) {
        var b = 0;
        return function() {
            return b < a.length ? {
                done: !1,
                value: a[b++]
            } : {
                done: !0
            };
        };
    }
    var ba = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
        if (a == Array.prototype || a == Object.prototype) return a;
        a[b] = c.value;
        return a;
    };
    function ca(a) {
        a = [
            "object" == typeof globalThis && globalThis,
            a,
            "object" == typeof window && window,
            "object" == typeof self && self,
            "object" == typeof global && global
        ];
        for(var b = 0; b < a.length; ++b){
            var c = a[b];
            if (c && c.Math == Math) return c;
        }
        throw Error("Cannot find global object");
    }
    var y = ca(this);
    function B(a, b) {
        if (b) a: {
            var c = y;
            a = a.split(".");
            for(var d = 0; d < a.length - 1; d++){
                var e = a[d];
                if (!(e in c)) break a;
                c = c[e];
            }
            a = a[a.length - 1];
            d = c[a];
            b = b(d);
            b != d && null != b && ba(c, a, {
                configurable: !0,
                writable: !0,
                value: b
            });
        }
    }
    B("Symbol", function(a) {
        function b(g) {
            if (this instanceof b) throw new TypeError("Symbol is not a constructor");
            return new c(d + (g || "") + "_" + e++, g);
        }
        function c(g, f) {
            this.g = g;
            ba(this, "description", {
                configurable: !0,
                writable: !0,
                value: f
            });
        }
        if (a) return a;
        c.prototype.toString = function() {
            return this.g;
        };
        var d = "jscomp_symbol_" + (1E9 * Math.random() >>> 0) + "_", e = 0;
        return b;
    });
    B("Symbol.iterator", function(a) {
        if (a) return a;
        a = Symbol("Symbol.iterator");
        for(var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), c = 0; c < b.length; c++){
            var d = y[b[c]];
            "function" === typeof d && "function" != typeof d.prototype[a] && ba(d.prototype, a, {
                configurable: !0,
                writable: !0,
                value: function() {
                    return da(aa(this));
                }
            });
        }
        return a;
    });
    function da(a) {
        a = {
            next: a
        };
        a[Symbol.iterator] = function() {
            return this;
        };
        return a;
    }
    function C(a) {
        var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
        return b ? b.call(a) : {
            next: aa(a)
        };
    }
    function ea(a) {
        if (!(a instanceof Array)) {
            a = C(a);
            for(var b, c = []; !(b = a.next()).done;)c.push(b.value);
            a = c;
        }
        return a;
    }
    var fa = "function" == typeof Object.create ? Object.create : function(a) {
        function b() {}
        b.prototype = a;
        return new b;
    }, ha;
    if ("function" == typeof Object.setPrototypeOf) ha = Object.setPrototypeOf;
    else {
        var ia;
        a: {
            var ja = {
                a: !0
            }, ka = {};
            try {
                ka.__proto__ = ja;
                ia = ka.a;
                break a;
            } catch (a) {}
            ia = !1;
        }
        ha = ia ? function(a, b) {
            a.__proto__ = b;
            if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
            return a;
        } : null;
    }
    var la = ha;
    function D(a, b) {
        a.prototype = fa(b.prototype);
        a.prototype.constructor = a;
        if (la) la(a, b);
        else for(var c in b)if ("prototype" != c) if (Object.defineProperties) {
            var d = Object.getOwnPropertyDescriptor(b, c);
            d && Object.defineProperty(a, c, d);
        } else a[c] = b[c];
        a.ra = b.prototype;
    }
    function ma() {
        this.l = !1;
        this.i = null;
        this.h = void 0;
        this.g = 1;
        this.u = this.o = 0;
        this.j = null;
    }
    function na(a) {
        if (a.l) throw new TypeError("Generator is already running");
        a.l = !0;
    }
    ma.prototype.s = function(a) {
        this.h = a;
    };
    function oa(a, b) {
        a.j = {
            fa: b,
            ga: !0
        };
        a.g = a.o || a.u;
    }
    ma.prototype.return = function(a) {
        this.j = {
            return: a
        };
        this.g = this.u;
    };
    function F(a, b, c) {
        a.g = c;
        return {
            value: b
        };
    }
    function pa(a) {
        this.g = new ma;
        this.h = a;
    }
    function qa(a, b) {
        na(a.g);
        var c = a.g.i;
        if (c) return ra(a, "return" in c ? c["return"] : function(d) {
            return {
                value: d,
                done: !0
            };
        }, b, a.g.return);
        a.g.return(b);
        return G(a);
    }
    function ra(a, b, c, d) {
        try {
            var e = b.call(a.g.i, c);
            if (!(e instanceof Object)) throw new TypeError("Iterator result " + e + " is not an object");
            if (!e.done) return a.g.l = !1, e;
            var g = e.value;
        } catch (f) {
            return a.g.i = null, oa(a.g, f), G(a);
        }
        a.g.i = null;
        d.call(a.g, g);
        return G(a);
    }
    function G(a) {
        for(; a.g.g;)try {
            var b = a.h(a.g);
            if (b) return a.g.l = !1, {
                value: b.value,
                done: !1
            };
        } catch (c) {
            a.g.h = void 0, oa(a.g, c);
        }
        a.g.l = !1;
        if (a.g.j) {
            b = a.g.j;
            a.g.j = null;
            if (b.ga) throw b.fa;
            return {
                value: b.return,
                done: !0
            };
        }
        return {
            value: void 0,
            done: !0
        };
    }
    function sa(a) {
        this.next = function(b) {
            na(a.g);
            a.g.i ? b = ra(a, a.g.i.next, b, a.g.s) : (a.g.s(b), b = G(a));
            return b;
        };
        this.throw = function(b) {
            na(a.g);
            a.g.i ? b = ra(a, a.g.i["throw"], b, a.g.s) : (oa(a.g, b), b = G(a));
            return b;
        };
        this.return = function(b) {
            return qa(a, b);
        };
        this[Symbol.iterator] = function() {
            return this;
        };
    }
    function ta(a) {
        function b(d) {
            return a.next(d);
        }
        function c(d) {
            return a.throw(d);
        }
        return new Promise(function(d, e) {
            function g(f) {
                f.done ? d(f.value) : Promise.resolve(f.value).then(b, c).then(g, e);
            }
            g(a.next());
        });
    }
    function I(a) {
        return ta(new sa(new pa(a)));
    }
    B("Promise", function(a) {
        function b(f) {
            this.h = 0;
            this.i = void 0;
            this.g = [];
            this.s = !1;
            var h = this.j();
            try {
                f(h.resolve, h.reject);
            } catch (k) {
                h.reject(k);
            }
        }
        function c() {
            this.g = null;
        }
        function d(f) {
            return f instanceof b ? f : new b(function(h) {
                h(f);
            });
        }
        if (a) return a;
        c.prototype.h = function(f) {
            if (null == this.g) {
                this.g = [];
                var h = this;
                this.i(function() {
                    h.l();
                });
            }
            this.g.push(f);
        };
        var e = y.setTimeout;
        c.prototype.i = function(f) {
            e(f, 0);
        };
        c.prototype.l = function() {
            for(; this.g && this.g.length;){
                var f = this.g;
                this.g = [];
                for(var h = 0; h < f.length; ++h){
                    var k = f[h];
                    f[h] = null;
                    try {
                        k();
                    } catch (l) {
                        this.j(l);
                    }
                }
            }
            this.g = null;
        };
        c.prototype.j = function(f) {
            this.i(function() {
                throw f;
            });
        };
        b.prototype.j = function() {
            function f(l) {
                return function(m) {
                    k || (k = !0, l.call(h, m));
                };
            }
            var h = this, k = !1;
            return {
                resolve: f(this.D),
                reject: f(this.l)
            };
        };
        b.prototype.D = function(f) {
            if (f === this) this.l(new TypeError("A Promise cannot resolve to itself"));
            else if (f instanceof b) this.H(f);
            else {
                a: switch(typeof f){
                    case "object":
                        var h = null != f;
                        break a;
                    case "function":
                        h = !0;
                        break a;
                    default:
                        h = !1;
                }
                h ? this.A(f) : this.o(f);
            }
        };
        b.prototype.A = function(f) {
            var h = void 0;
            try {
                h = f.then;
            } catch (k) {
                this.l(k);
                return;
            }
            "function" == typeof h ? this.I(h, f) : this.o(f);
        };
        b.prototype.l = function(f) {
            this.u(2, f);
        };
        b.prototype.o = function(f) {
            this.u(1, f);
        };
        b.prototype.u = function(f, h) {
            if (0 != this.h) throw Error("Cannot settle(" + f + ", " + h + "): Promise already settled in state" + this.h);
            this.h = f;
            this.i = h;
            2 === this.h && this.G();
            this.B();
        };
        b.prototype.G = function() {
            var f = this;
            e(function() {
                if (f.C()) {
                    var h = y.console;
                    "undefined" !== typeof h && h.error(f.i);
                }
            }, 1);
        };
        b.prototype.C = function() {
            if (this.s) return !1;
            var f = y.CustomEvent, h = y.Event, k = y.dispatchEvent;
            if ("undefined" === typeof k) return !0;
            "function" === typeof f ? f = new f("unhandledrejection", {
                cancelable: !0
            }) : "function" === typeof h ? f = new h("unhandledrejection", {
                cancelable: !0
            }) : (f = y.document.createEvent("CustomEvent"), f.initCustomEvent("unhandledrejection", !1, !0, f));
            f.promise = this;
            f.reason = this.i;
            return k(f);
        };
        b.prototype.B = function() {
            if (null != this.g) {
                for(var f = 0; f < this.g.length; ++f)g.h(this.g[f]);
                this.g = null;
            }
        };
        var g = new c;
        b.prototype.H = function(f) {
            var h = this.j();
            f.M(h.resolve, h.reject);
        };
        b.prototype.I = function(f, h) {
            var k = this.j();
            try {
                f.call(h, k.resolve, k.reject);
            } catch (l) {
                k.reject(l);
            }
        };
        b.prototype.then = function(f, h) {
            function k(p, n) {
                return "function" == typeof p ? function(q) {
                    try {
                        l(p(q));
                    } catch (t) {
                        m(t);
                    }
                } : n;
            }
            var l, m, r = new b(function(p, n) {
                l = p;
                m = n;
            });
            this.M(k(f, l), k(h, m));
            return r;
        };
        b.prototype.catch = function(f) {
            return this.then(void 0, f);
        };
        b.prototype.M = function(f, h) {
            function k() {
                switch(l.h){
                    case 1:
                        f(l.i);
                        break;
                    case 2:
                        h(l.i);
                        break;
                    default:
                        throw Error("Unexpected state: " + l.h);
                }
            }
            var l = this;
            null == this.g ? g.h(k) : this.g.push(k);
            this.s = !0;
        };
        b.resolve = d;
        b.reject = function(f) {
            return new b(function(h, k) {
                k(f);
            });
        };
        b.race = function(f) {
            return new b(function(h, k) {
                for(var l = C(f), m = l.next(); !m.done; m = l.next())d(m.value).M(h, k);
            });
        };
        b.all = function(f) {
            var h = C(f), k = h.next();
            return k.done ? d([]) : new b(function(l, m) {
                function r(q) {
                    return function(t) {
                        p[q] = t;
                        n--;
                        0 == n && l(p);
                    };
                }
                var p = [], n = 0;
                do p.push(void 0), n++, d(k.value).M(r(p.length - 1), m), k = h.next();
                while (!k.done)
            });
        };
        return b;
    });
    function ua(a, b) {
        a instanceof String && (a += "");
        var c = 0, d = !1, e = {
            next: function() {
                if (!d && c < a.length) {
                    var g = c++;
                    return {
                        value: b(g, a[g]),
                        done: !1
                    };
                }
                d = !0;
                return {
                    done: !0,
                    value: void 0
                };
            }
        };
        e[Symbol.iterator] = function() {
            return e;
        };
        return e;
    }
    var va = "function" == typeof Object.assign ? Object.assign : function(a, b) {
        for(var c = 1; c < arguments.length; c++){
            var d = arguments[c];
            if (d) for(var e in d)Object.prototype.hasOwnProperty.call(d, e) && (a[e] = d[e]);
        }
        return a;
    };
    B("Object.assign", function(a) {
        return a || va;
    });
    B("Object.is", function(a) {
        return a ? a : function(b, c) {
            return b === c ? 0 !== b || 1 / b === 1 / c : b !== b && c !== c;
        };
    });
    B("Array.prototype.includes", function(a) {
        return a ? a : function(b, c) {
            var d = this;
            d instanceof String && (d = String(d));
            var e = d.length;
            c = c || 0;
            for(0 > c && (c = Math.max(c + e, 0)); c < e; c++){
                var g = d[c];
                if (g === b || Object.is(g, b)) return !0;
            }
            return !1;
        };
    });
    B("String.prototype.includes", function(a) {
        return a ? a : function(b, c) {
            if (null == this) throw new TypeError("The 'this' value for String.prototype.includes must not be null or undefined");
            if (b instanceof RegExp) throw new TypeError("First argument to String.prototype.includes must not be a regular expression");
            return -1 !== this.indexOf(b, c || 0);
        };
    });
    B("Array.prototype.keys", function(a) {
        return a ? a : function() {
            return ua(this, function(b) {
                return b;
            });
        };
    });
    var wa = this || self;
    function J(a, b) {
        a = a.split(".");
        var c = wa;
        a[0] in c || "undefined" == typeof c.execScript || c.execScript("var " + a[0]);
        for(var d; a.length && (d = a.shift());)a.length || void 0 === b ? c[d] && c[d] !== Object.prototype[d] ? c = c[d] : c = c[d] = {} : c[d] = b;
    }
    ;
    function K() {
        throw Error("Invalid UTF8");
    }
    function xa(a, b) {
        b = String.fromCharCode.apply(null, b);
        return null == a ? b : a + b;
    }
    var ya, za = "undefined" !== typeof TextDecoder, Aa, Ba = "undefined" !== typeof TextEncoder;
    var Ca = {}, L = null;
    function Da(a) {
        var b;
        void 0 === b && (b = 0);
        Ea();
        b = Ca[b];
        for(var c = Array(Math.floor(a.length / 3)), d = b[64] || "", e = 0, g = 0; e < a.length - 2; e += 3){
            var f = a[e], h = a[e + 1], k = a[e + 2], l = b[f >> 2];
            f = b[(f & 3) << 4 | h >> 4];
            h = b[(h & 15) << 2 | k >> 6];
            k = b[k & 63];
            c[g++] = l + f + h + k;
        }
        l = 0;
        k = d;
        switch(a.length - e){
            case 2:
                l = a[e + 1], k = b[(l & 15) << 2] || d;
            case 1:
                a = a[e], c[g] = b[a >> 2] + b[(a & 3) << 4 | l >> 4] + k + d;
        }
        return c.join("");
    }
    function Fa(a) {
        var b = a.length, c = 3 * b / 4;
        c % 3 ? c = Math.floor(c) : -1 != "=.".indexOf(a[b - 1]) && (c = -1 != "=.".indexOf(a[b - 2]) ? c - 2 : c - 1);
        var d = new Uint8Array(c), e = 0;
        Ga(a, function(g) {
            d[e++] = g;
        });
        return e !== c ? d.subarray(0, e) : d;
    }
    function Ga(a, b) {
        function c(k) {
            for(; d < a.length;){
                var l = a.charAt(d++), m = L[l];
                if (null != m) return m;
                if (!/^[\s\xa0]*$/.test(l)) throw Error("Unknown base64 encoding at char: " + l);
            }
            return k;
        }
        Ea();
        for(var d = 0;;){
            var e = c(-1), g = c(0), f = c(64), h = c(64);
            if (64 === h && -1 === e) break;
            b(e << 2 | g >> 4);
            64 != f && (b(g << 4 & 240 | f >> 2), 64 != h && b(f << 6 & 192 | h));
        }
    }
    function Ea() {
        if (!L) {
            L = {};
            for(var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""), b = [
                "+/=",
                "+/",
                "-_=",
                "-_.",
                "-_"
            ], c = 0; 5 > c; c++){
                var d = a.concat(b[c].split(""));
                Ca[c] = d;
                for(var e = 0; e < d.length; e++){
                    var g = d[e];
                    void 0 === L[g] && (L[g] = e);
                }
            }
        }
    }
    ;
    var Ha = "function" === typeof Uint8Array;
    function Ia(a) {
        return Ha && null != a && a instanceof Uint8Array;
    }
    var Ja;
    function Ka(a) {
        this.L = a;
        if (null !== a && 0 === a.length) throw Error("ByteString should be constructed with non-empty values");
    }
    ;
    var La = "function" === typeof Uint8Array.prototype.slice, M = 0, N = 0;
    function Ma(a, b) {
        if (a.constructor === Uint8Array) return a;
        if (a.constructor === ArrayBuffer) return new Uint8Array(a);
        if (a.constructor === Array) return new Uint8Array(a);
        if (a.constructor === String) return Fa(a);
        if (a.constructor === Ka) {
            if (!b && (b = a.L) && b.constructor === Uint8Array) return b;
            b = a.L;
            b = null == b || Ia(b) ? b : "string" === typeof b ? Fa(b) : null;
            return (a = a.L = b) ? new Uint8Array(a) : Ja || (Ja = new Uint8Array(0));
        }
        if (a instanceof Uint8Array) return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        throw Error("Type not convertible to a Uint8Array, expected a Uint8Array, an ArrayBuffer, a base64 encoded string, or Array of numbers");
    }
    ;
    function Na(a, b) {
        return Error("Invalid wire type: " + a + " (at position " + b + ")");
    }
    function Oa() {
        return Error("Failed to read varint, encoding is invalid.");
    }
    ;
    function Pa(a, b) {
        b = void 0 === b ? {} : b;
        b = void 0 === b.v ? !1 : b.v;
        this.h = null;
        this.g = this.i = this.j = 0;
        this.v = b;
        a && Qa(this, a);
    }
    function Qa(a, b) {
        a.h = Ma(b, a.v);
        a.j = 0;
        a.i = a.h.length;
        a.g = a.j;
    }
    Pa.prototype.reset = function() {
        this.g = this.j;
    };
    function O(a) {
        if (a.g > a.i) throw Error("Tried to read past the end of the data " + a.g + " > " + a.i);
    }
    function Q(a) {
        var b = a.h, c = b[a.g], d = c & 127;
        if (128 > c) return a.g += 1, O(a), d;
        c = b[a.g + 1];
        d |= (c & 127) << 7;
        if (128 > c) return a.g += 2, O(a), d;
        c = b[a.g + 2];
        d |= (c & 127) << 14;
        if (128 > c) return a.g += 3, O(a), d;
        c = b[a.g + 3];
        d |= (c & 127) << 21;
        if (128 > c) return a.g += 4, O(a), d;
        c = b[a.g + 4];
        a.g += 5;
        d |= (c & 15) << 28;
        if (128 > c) return O(a), d;
        if (128 <= b[a.g++] && 128 <= b[a.g++] && 128 <= b[a.g++] && 128 <= b[a.g++] && 128 <= b[a.g++]) throw Oa();
        O(a);
        return d;
    }
    var Ra = [];
    function Sa() {
        this.g = [];
    }
    Sa.prototype.length = function() {
        return this.g.length;
    };
    Sa.prototype.end = function() {
        var a = this.g;
        this.g = [];
        return a;
    };
    function R(a, b) {
        for(; 127 < b;)a.g.push(b & 127 | 128), b >>>= 7;
        a.g.push(b);
    }
    ;
    function Ta(a) {
        var b = {}, c = void 0 === b.W ? !1 : b.W;
        this.l = {
            v: void 0 === b.v ? !1 : b.v
        };
        this.W = c;
        b = this.l;
        Ra.length ? (c = Ra.pop(), b && (c.v = b.v), a && Qa(c, a), a = c) : a = new Pa(a, b);
        this.g = a;
        this.j = this.g.g;
        this.h = this.i = -1;
    }
    Ta.prototype.reset = function() {
        this.g.reset();
        this.j = this.g.g;
        this.h = this.i = -1;
    };
    function Ua(a) {
        var b = a.g;
        if (b.g == b.i) return !1;
        a.j = a.g.g;
        var c = Q(a.g) >>> 0;
        b = c >>> 3;
        c &= 7;
        if (!(0 <= c && 5 >= c)) throw Na(c, a.j);
        if (1 > b) throw Error("Invalid field number: " + b + " (at position " + a.j + ")");
        a.i = b;
        a.h = c;
        return !0;
    }
    function Va(a) {
        switch(a.h){
            case 0:
                if (0 != a.h) Va(a);
                else a: {
                    a = a.g;
                    for(var b = a.g, c = b + 10; b < c;)if (0 === (a.h[b++] & 128)) {
                        a.g = b;
                        O(a);
                        break a;
                    }
                    throw Oa();
                }
                break;
            case 1:
                a = a.g;
                a.g += 8;
                O(a);
                break;
            case 2:
                2 != a.h ? Va(a) : (b = Q(a.g) >>> 0, a = a.g, a.g += b, O(a));
                break;
            case 5:
                a = a.g;
                a.g += 4;
                O(a);
                break;
            case 3:
                b = a.i;
                do {
                    if (!Ua(a)) throw Error("Unmatched start-group tag: stream EOF");
                    if (4 == a.h) {
                        if (a.i != b) throw Error("Unmatched end-group tag");
                        break;
                    }
                    Va(a);
                }while (1)
                break;
            default:
                throw Na(a.h, a.j);
        }
    }
    var Wa = [];
    function Xa() {
        this.i = [];
        this.h = 0;
        this.g = new Sa;
    }
    function S(a, b) {
        0 !== b.length && (a.i.push(b), a.h += b.length);
    }
    function Ya(a, b) {
        if (b = b.ca) {
            S(a, a.g.end());
            for(var c = 0; c < b.length; c++)S(a, b[c]);
        }
    }
    ;
    var T = "function" === typeof Symbol && "symbol" === typeof Symbol() ? Symbol(void 0) : void 0;
    function Za(a, b) {
        Object.isFrozen(a) || (T ? a[T] |= b : void 0 !== a.N ? a.N |= b : Object.defineProperties(a, {
            N: {
                value: b,
                configurable: !0,
                writable: !0,
                enumerable: !1
            }
        }));
    }
    function $a(a) {
        var b;
        T ? b = a[T] : b = a.N;
        return null == b ? 0 : b;
    }
    function U(a) {
        Za(a, 1);
        return a;
    }
    function ab(a) {
        return Array.isArray(a) ? !!($a(a) & 2) : !1;
    }
    function bb(a) {
        if (!Array.isArray(a)) throw Error("cannot mark non-array as immutable");
        Za(a, 2);
    }
    ;
    function cb(a) {
        return null !== a && "object" === typeof a && !Array.isArray(a) && a.constructor === Object;
    }
    var db = Object.freeze(U([]));
    function eb(a) {
        if (ab(a.m)) throw Error("Cannot mutate an immutable Message");
    }
    var fb = "undefined" != typeof Symbol && "undefined" != typeof Symbol.hasInstance;
    function gb(a) {
        return {
            value: a,
            configurable: !1,
            writable: !1,
            enumerable: !1
        };
    }
    ;
    function V(a, b, c) {
        return -1 === b ? null : b >= a.i ? a.g ? a.g[b] : void 0 : (void 0 === c ? 0 : c) && a.g && (c = a.g[b], null != c) ? c : a.m[b + a.h];
    }
    function W(a, b, c, d) {
        d = void 0 === d ? !1 : d;
        eb(a);
        b < a.i && !d ? a.m[b + a.h] = c : (a.g || (a.g = a.m[a.i + a.h] = {}))[b] = c;
    }
    function hb(a, b, c, d) {
        c = void 0 === c ? !0 : c;
        d = void 0 === d ? !1 : d;
        var e = V(a, b, d);
        null == e && (e = db);
        if (ab(a.m)) c && (bb(e), Object.freeze(e));
        else if (e === db || ab(e)) e = U(e.slice()), W(a, b, e, d);
        return e;
    }
    function X(a, b, c) {
        a = V(a, b);
        a = null == a ? a : +a;
        return null == a ? void 0 === c ? 0 : c : a;
    }
    function ib(a, b, c, d) {
        a.j || (a.j = {});
        var e = ab(a.m), g = a.j[c];
        if (!g) {
            d = hb(a, c, !0, void 0 === d ? !1 : d);
            g = [];
            e = e || ab(d);
            for(var f = 0; f < d.length; f++)g[f] = new b(d[f]), e && bb(g[f].m);
            e && (bb(g), Object.freeze(g));
            a.j[c] = g;
        }
        return g;
    }
    function jb(a, b, c, d, e) {
        var g = void 0 === g ? !1 : g;
        eb(a);
        g = ib(a, c, b, g);
        c = d ? d : new c;
        a = hb(a, b);
        void 0 != e ? (g.splice(e, 0, c), a.splice(e, 0, c.m)) : (g.push(c), a.push(c.m));
        return c;
    }
    function kb(a, b) {
        a = V(a, b);
        return null == a ? 0 : a;
    }
    function lb(a, b) {
        a = V(a, b);
        return null == a ? "" : a;
    }
    ;
    function mb(a) {
        switch(typeof a){
            case "number":
                return isFinite(a) ? a : String(a);
            case "object":
                if (a && !Array.isArray(a)) {
                    if (Ia(a)) return Da(a);
                    if (a instanceof Ka) {
                        var b = a.L;
                        b = null == b || "string" === typeof b ? b : Ha && b instanceof Uint8Array ? Da(b) : null;
                        return (a.L = b) || "";
                    }
                }
        }
        return a;
    }
    ;
    function nb(a) {
        var b = ob;
        b = void 0 === b ? pb : b;
        return qb(a, b);
    }
    function rb(a, b) {
        if (null != a) {
            if (Array.isArray(a)) a = qb(a, b);
            else if (cb(a)) {
                var c = {}, d;
                for(d in a)c[d] = rb(a[d], b);
                a = c;
            } else a = b(a);
            return a;
        }
    }
    function qb(a, b) {
        for(var c = a.slice(), d = 0; d < c.length; d++)c[d] = rb(c[d], b);
        Array.isArray(a) && $a(a) & 1 && U(c);
        return c;
    }
    function ob(a) {
        if (a && "object" == typeof a && a.toJSON) return a.toJSON();
        a = mb(a);
        return Array.isArray(a) ? nb(a) : a;
    }
    function pb(a) {
        return Ia(a) ? new Uint8Array(a) : a;
    }
    ;
    function sb(a, b, c) {
        a || (a = tb);
        tb = null;
        var d = this.constructor.h;
        a || (a = d ? [
            d
        ] : []);
        this.h = (d ? 0 : -1) - (this.constructor.g || 0);
        this.j = void 0;
        this.m = a;
        a: {
            d = this.m.length;
            a = d - 1;
            if (d && (d = this.m[a], cb(d))) {
                this.i = a - this.h;
                this.g = d;
                break a;
            }
            void 0 !== b && -1 < b ? (this.i = Math.max(b, a + 1 - this.h), this.g = void 0) : this.i = Number.MAX_VALUE;
        }
        if (c) for(b = 0; b < c.length; b++)if (a = c[b], a < this.i) a += this.h, (d = this.m[a]) ? Array.isArray(d) && U(d) : this.m[a] = db;
        else {
            d = this.g || (this.g = this.m[this.i + this.h] = {});
            var e = d[a];
            e ? Array.isArray(e) && U(e) : d[a] = db;
        }
    }
    sb.prototype.toJSON = function() {
        return nb(this.m);
    };
    sb.prototype.toString = function() {
        return this.m.toString();
    };
    var tb;
    function ub() {
        sb.apply(this, arguments);
    }
    D(ub, sb);
    if (fb) {
        var vb = {};
        Object.defineProperties(ub, (vb[Symbol.hasInstance] = gb(function() {
            throw Error("Cannot perform instanceof checks for MutableMessage");
        }), vb));
    }
    ;
    function wb(a, b, c) {
        if (c) {
            var d = {}, e;
            for(e in c){
                var g = c[e], f = g.ja;
                f || (d.F = g.pa || g.ha.P, g.ba ? (d.U = xb(g.ba), f = function(h) {
                    return function(k, l, m) {
                        return h.F(k, l, m, h.U);
                    };
                }(d)) : g.da ? (d.T = yb(g.X.g, g.da), f = function(h) {
                    return function(k, l, m) {
                        return h.F(k, l, m, h.T);
                    };
                }(d)) : f = d.F, g.ja = f);
                f(b, a, g.X);
                d = {
                    F: d.F,
                    U: d.U,
                    T: d.T
                };
            }
        }
        Ya(b, a);
    }
    var zb = Symbol();
    function Ab(a, b, c) {
        return a[zb] || (a[zb] = function(d, e) {
            return b(d, e, c);
        });
    }
    function Bb(a) {
        var b = a[zb];
        if (!b) {
            var c = Cb(a);
            b = function(d, e) {
                return Db(d, e, c);
            };
            a[zb] = b;
        }
        return b;
    }
    function Eb(a) {
        var b = a.ba;
        if (b) return Bb(b);
        if (b = a.oa) return Ab(a.X.g, b, a.da);
    }
    function Fb(a) {
        var b = Eb(a), c = a.X, d = a.ha.O;
        return b ? function(e, g) {
            return d(e, g, c, b);
        } : function(e, g) {
            return d(e, g, c);
        };
    }
    function Gb(a, b, c, d, e, g) {
        a = a();
        var f = 0;
        a.length && "number" !== typeof a[0] && (c(b, a[0]), f++);
        for(; f < a.length;){
            c = a[f++];
            for(var h = f + 1; h < a.length && "number" !== typeof a[h];)h++;
            var k = a[f++];
            h -= f;
            switch(h){
                case 0:
                    d(b, c, k);
                    break;
                case 1:
                    d(b, c, k, a[f++]);
                    break;
                case 2:
                    e(b, c, k, a[f++], a[f++]);
                    break;
                case 3:
                    h = a[f++];
                    var l = a[f++], m = a[f++];
                    Array.isArray(m) ? e(b, c, k, h, l, m) : g(b, c, k, h, l, m);
                    break;
                case 4:
                    g(b, c, k, a[f++], a[f++], a[f++], a[f++]);
                    break;
                default:
                    throw Error("unexpected number of binary field arguments: " + h);
            }
        }
        return b;
    }
    var Hb = Symbol();
    function xb(a) {
        var b = a[Hb];
        if (!b) {
            var c = Ib(a);
            b = function(d, e) {
                return Jb(d, e, c);
            };
            a[Hb] = b;
        }
        return b;
    }
    function yb(a, b) {
        var c = a[Hb];
        c || (c = function(d, e) {
            return wb(d, e, b);
        }, a[Hb] = c);
        return c;
    }
    var Kb = Symbol();
    function Lb(a, b) {
        a.push(b);
    }
    function Mb(a, b, c) {
        a.push(b, c.P);
    }
    function Nb(a, b, c, d, e) {
        var g = xb(e), f = c.P;
        a.push(b, function(h, k, l) {
            return f(h, k, l, d, g);
        });
    }
    function Ob(a, b, c, d, e, g) {
        var f = yb(d, g), h = c.P;
        a.push(b, function(k, l, m) {
            return h(k, l, m, d, f);
        });
    }
    function Ib(a) {
        var b = a[Kb];
        return b ? b : Gb(a, a[Kb] = [], Lb, Mb, Nb, Ob);
    }
    var Pb = Symbol();
    function Qb(a, b) {
        a[0] = b;
    }
    function Rb(a, b, c, d) {
        var e = c.O;
        a[b] = d ? function(g, f, h) {
            return e(g, f, h, d);
        } : e;
    }
    function Sb(a, b, c, d, e, g) {
        var f = c.O, h = Bb(e);
        a[b] = function(k, l, m) {
            return f(k, l, m, d, h, g);
        };
    }
    function Tb(a, b, c, d, e, g, f) {
        var h = c.O, k = Ab(d, e, g);
        a[b] = function(l, m, r) {
            return h(l, m, r, d, k, f);
        };
    }
    function Cb(a) {
        var b = a[Pb];
        return b ? b : Gb(a, a[Pb] = {}, Qb, Rb, Sb, Tb);
    }
    function Db(a, b, c) {
        for(; Ua(b) && 4 != b.h;){
            var d = b.i, e = c[d];
            if (!e) {
                var g = c[0];
                g && (g = g[d]) && (e = c[d] = Fb(g));
            }
            if (!e || !e(b, a, d)) {
                if (e = b, d = a, g = e.j, Va(e), !e.W) {
                    var f = e.g.h;
                    e = e.g.g;
                    e = g === e ? Ja || (Ja = new Uint8Array(0)) : La ? f.slice(g, e) : new Uint8Array(f.subarray(g, e));
                    (g = d.ca) ? g.push(e) : d.ca = [
                        e
                    ];
                }
            }
        }
        return a;
    }
    function Ub(a, b, c) {
        if (Wa.length) {
            var d = Wa.pop();
            a && (Qa(d.g, a), d.i = -1, d.h = -1);
            a = d;
        } else a = new Ta(a);
        try {
            return Db(new b, a, Cb(c));
        } finally{
            b = a.g, b.h = null, b.j = 0, b.i = 0, b.g = 0, b.v = !1, a.i = -1, a.h = -1, 100 > Wa.length && Wa.push(a);
        }
    }
    function Jb(a, b, c) {
        for(var d = c.length, e = 1 == d % 2, g = e ? 1 : 0; g < d; g += 2)(0, c[g + 1])(b, a, c[g]);
        wb(a, b, e ? c[0] : void 0);
    }
    function Vb(a, b) {
        var c = new Xa;
        Jb(a, c, Ib(b));
        S(c, c.g.end());
        a = new Uint8Array(c.h);
        b = c.i;
        for(var d = b.length, e = 0, g = 0; g < d; g++){
            var f = b[g];
            a.set(f, e);
            e += f.length;
        }
        c.i = [
            a
        ];
        return a;
    }
    function Wb(a, b) {
        return {
            O: a,
            P: b
        };
    }
    var Y = Wb(function(a, b, c) {
        if (5 !== a.h) return !1;
        a = a.g;
        var d = a.h[a.g];
        var e = a.h[a.g + 1];
        var g = a.h[a.g + 2], f = a.h[a.g + 3];
        a.g += 4;
        O(a);
        e = (d << 0 | e << 8 | g << 16 | f << 24) >>> 0;
        a = 2 * (e >> 31) + 1;
        d = e >>> 23 & 255;
        e &= 8388607;
        W(b, c, 255 == d ? e ? NaN : Infinity * a : 0 == d ? a * Math.pow(2, -149) * e : a * Math.pow(2, d - 150) * (e + Math.pow(2, 23)));
        return !0;
    }, function(a, b, c) {
        b = V(b, c);
        if (null != b) {
            R(a.g, 8 * c + 5);
            a = a.g;
            var d = b;
            d = (c = 0 > d ? 1 : 0) ? -d : d;
            0 === d ? 0 < 1 / d ? M = N = 0 : (N = 0, M = 2147483648) : isNaN(d) ? (N = 0, M = 2147483647) : 3.4028234663852886E38 < d ? (N = 0, M = (c << 31 | 2139095040) >>> 0) : 1.1754943508222875E-38 > d ? (d = Math.round(d / Math.pow(2, -149)), N = 0, M = (c << 31 | d) >>> 0) : (b = Math.floor(Math.log(d) / Math.LN2), d *= Math.pow(2, -b), d = Math.round(8388608 * d), 16777216 <= d && ++b, N = 0, M = (c << 31 | b + 127 << 23 | d & 8388607) >>> 0);
            c = M;
            a.g.push(c >>> 0 & 255);
            a.g.push(c >>> 8 & 255);
            a.g.push(c >>> 16 & 255);
            a.g.push(c >>> 24 & 255);
        }
    }), Xb = Wb(function(a, b, c) {
        if (0 !== a.h) return !1;
        for(var d = a.g, e = 128, g = 0, f = a = 0; 4 > f && 128 <= e; f++)e = d.h[d.g++], O(d), g |= (e & 127) << 7 * f;
        128 <= e && (e = d.h[d.g++], O(d), g |= (e & 127) << 28, a |= (e & 127) >> 4);
        if (128 <= e) for(f = 0; 5 > f && 128 <= e; f++)e = d.h[d.g++], O(d), a |= (e & 127) << 7 * f + 3;
        if (128 > e) {
            d = g >>> 0;
            e = a >>> 0;
            if (a = e & 2147483648) d = ~d + 1 >>> 0, e = ~e >>> 0, 0 == d && (e = e + 1 >>> 0);
            d = 4294967296 * e + (d >>> 0);
        } else throw Oa();
        W(b, c, a ? -d : d);
        return !0;
    }, function(a, b, c) {
        b = V(b, c);
        if (null != b && null != b) {
            R(a.g, 8 * c);
            a = a.g;
            var d = b;
            c = 0 > d;
            d = Math.abs(d);
            b = d >>> 0;
            d = Math.floor((d - b) / 4294967296);
            d >>>= 0;
            c && (d = ~d >>> 0, b = (~b >>> 0) + 1, 4294967295 < b && (b = 0, d++, 4294967295 < d && (d = 0)));
            M = b;
            N = d;
            c = M;
            for(b = N; 0 < b || 127 < c;)a.g.push(c & 127 | 128), c = (c >>> 7 | b << 25) >>> 0, b >>>= 7;
            a.g.push(c);
        }
    }), Yb = Wb(function(a, b, c) {
        if (0 !== a.h) return !1;
        W(b, c, Q(a.g));
        return !0;
    }, function(a, b, c) {
        b = V(b, c);
        if (null != b && null != b) if (R(a.g, 8 * c), a = a.g, c = b, 0 <= c) R(a, c);
        else {
            for(b = 0; 9 > b; b++)a.g.push(c & 127 | 128), c >>= 7;
            a.g.push(1);
        }
    }), Zb = Wb(function(a, b, c) {
        if (2 !== a.h) return !1;
        var d = Q(a.g) >>> 0;
        a = a.g;
        var e = a.g;
        a.g += d;
        O(a);
        a = a.h;
        var g;
        if (za) (g = ya) || (g = ya = new TextDecoder("utf-8", {
            fatal: !0
        })), g = g.decode(a.subarray(e, e + d));
        else {
            d = e + d;
            for(var f = [], h = null, k, l, m; e < d;)k = a[e++], 128 > k ? f.push(k) : 224 > k ? e >= d ? K() : (l = a[e++], 194 > k || 128 !== (l & 192) ? (e--, K()) : f.push((k & 31) << 6 | l & 63)) : 240 > k ? e >= d - 1 ? K() : (l = a[e++], 128 !== (l & 192) || 224 === k && 160 > l || 237 === k && 160 <= l || 128 !== ((g = a[e++]) & 192) ? (e--, K()) : f.push((k & 15) << 12 | (l & 63) << 6 | g & 63)) : 244 >= k ? e >= d - 2 ? K() : (l = a[e++], 128 !== (l & 192) || 0 !== (k << 28) + (l - 144) >> 30 || 128 !== ((g = a[e++]) & 192) || 128 !== ((m = a[e++]) & 192) ? (e--, K()) : (k = (k & 7) << 18 | (l & 63) << 12 | (g & 63) << 6 | m & 63, k -= 65536, f.push((k >> 10 & 1023) + 55296, (k & 1023) + 56320))) : K(), 8192 <= f.length && (h = xa(h, f), f.length = 0);
            g = xa(h, f);
        }
        W(b, c, g);
        return !0;
    }, function(a, b, c) {
        b = V(b, c);
        if (null != b) {
            var d = !1;
            d = void 0 === d ? !1 : d;
            if (Ba) {
                if (d && /(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(b)) throw Error("Found an unpaired surrogate");
                b = (Aa || (Aa = new TextEncoder)).encode(b);
            } else {
                for(var e = 0, g = new Uint8Array(3 * b.length), f = 0; f < b.length; f++){
                    var h = b.charCodeAt(f);
                    if (128 > h) g[e++] = h;
                    else {
                        if (2048 > h) g[e++] = h >> 6 | 192;
                        else {
                            if (55296 <= h && 57343 >= h) {
                                if (56319 >= h && f < b.length) {
                                    var k = b.charCodeAt(++f);
                                    if (56320 <= k && 57343 >= k) {
                                        h = 1024 * (h - 55296) + k - 56320 + 65536;
                                        g[e++] = h >> 18 | 240;
                                        g[e++] = h >> 12 & 63 | 128;
                                        g[e++] = h >> 6 & 63 | 128;
                                        g[e++] = h & 63 | 128;
                                        continue;
                                    } else f--;
                                }
                                if (d) throw Error("Found an unpaired surrogate");
                                h = 65533;
                            }
                            g[e++] = h >> 12 | 224;
                            g[e++] = h >> 6 & 63 | 128;
                        }
                        g[e++] = h & 63 | 128;
                    }
                }
                b = g.subarray(0, e);
            }
            R(a.g, 8 * c + 2);
            R(a.g, b.length);
            S(a, a.g.end());
            S(a, b);
        }
    }), $b = Wb(function(a, b, c, d, e) {
        if (2 !== a.h) return !1;
        b = jb(b, c, d);
        c = a.g.i;
        d = Q(a.g) >>> 0;
        var g = a.g.g + d, f = g - c;
        0 >= f && (a.g.i = g, e(b, a), f = g - a.g.g);
        if (f) throw Error("Message parsing ended unexpectedly. Expected to read " + (d + " bytes, instead read " + (d - f) + " bytes, either the data ended unexpectedly or the message misreported its own length"));
        a.g.g = g;
        a.g.i = c;
        return !0;
    }, function(a, b, c, d, e) {
        b = ib(b, d, c);
        if (null != b) for(d = 0; d < b.length; d++){
            var g = a;
            R(g.g, 8 * c + 2);
            var f = g.g.end();
            S(g, f);
            f.push(g.h);
            g = f;
            e(b[d], a);
            f = a;
            var h = g.pop();
            for(h = f.h + f.g.length() - h; 127 < h;)g.push(h & 127 | 128), h >>>= 7, f.h++;
            g.push(h);
            f.h++;
        }
    });
    function Z() {
        ub.apply(this, arguments);
    }
    D(Z, ub);
    if (fb) {
        var ac = {};
        Object.defineProperties(Z, (ac[Symbol.hasInstance] = gb(Object[Symbol.hasInstance]), ac));
    }
    ;
    function bc(a) {
        Z.call(this, a);
    }
    D(bc, Z);
    function cc() {
        return [
            1,
            Yb,
            2,
            Y,
            3,
            Zb,
            4,
            Zb
        ];
    }
    ;
    function dc(a) {
        Z.call(this, a, -1, ec);
    }
    D(dc, Z);
    dc.prototype.addClassification = function(a, b) {
        jb(this, 1, bc, a, b);
        return this;
    };
    function fc() {
        return [
            1,
            $b,
            bc,
            cc
        ];
    }
    var ec = [
        1
    ];
    function gc(a) {
        Z.call(this, a);
    }
    D(gc, Z);
    function hc() {
        return [
            1,
            Y,
            2,
            Y,
            3,
            Y,
            4,
            Y,
            5,
            Y
        ];
    }
    ;
    function ic(a) {
        Z.call(this, a, -1, jc);
    }
    D(ic, Z);
    function kc() {
        return [
            1,
            $b,
            gc,
            hc
        ];
    }
    var jc = [
        1
    ];
    function lc(a) {
        Z.call(this, a);
    }
    D(lc, Z);
    function mc() {
        return [
            1,
            Y,
            2,
            Y,
            3,
            Y,
            4,
            Y,
            5,
            Y,
            6,
            Xb
        ];
    }
    ;
    function nc(a, b, c) {
        c = a.createShader(0 === c ? a.VERTEX_SHADER : a.FRAGMENT_SHADER);
        a.shaderSource(c, b);
        a.compileShader(c);
        if (!a.getShaderParameter(c, a.COMPILE_STATUS)) throw Error("Could not compile WebGL shader.\n\n" + a.getShaderInfoLog(c));
        return c;
    }
    ;
    function oc(a) {
        return ib(a, bc, 1).map(function(b) {
            return {
                index: kb(b, 1),
                score: X(b, 2),
                label: null != V(b, 3) ? lb(b, 3) : void 0,
                displayName: null != V(b, 4) ? lb(b, 4) : void 0
            };
        });
    }
    ;
    function pc(a) {
        return {
            x: X(a, 1),
            y: X(a, 2),
            z: X(a, 3),
            visibility: null != V(a, 4) ? X(a, 4) : void 0
        };
    }
    function qc(a) {
        return a.map(function(b) {
            return ib(Ub(b, ic, kc), gc, 1).map(pc);
        });
    }
    ;
    function rc(a, b) {
        this.h = a;
        this.g = b;
        this.l = 0;
    }
    function sc(a, b, c) {
        tc(a, b);
        if ("function" === typeof a.g.canvas.transferToImageBitmap) return Promise.resolve(a.g.canvas.transferToImageBitmap());
        if (c) return Promise.resolve(a.g.canvas);
        if ("function" === typeof createImageBitmap) return createImageBitmap(a.g.canvas);
        void 0 === a.i && (a.i = document.createElement("canvas"));
        return new Promise(function(d) {
            a.i.height = a.g.canvas.height;
            a.i.width = a.g.canvas.width;
            a.i.getContext("2d", {}).drawImage(a.g.canvas, 0, 0, a.g.canvas.width, a.g.canvas.height);
            d(a.i);
        });
    }
    function tc(a, b) {
        var c = a.g;
        if (void 0 === a.o) {
            var d = nc(c, "\n  attribute vec2 aVertex;\n  attribute vec2 aTex;\n  varying vec2 vTex;\n  void main(void) {\n    gl_Position = vec4(aVertex, 0.0, 1.0);\n    vTex = aTex;\n  }", 0), e = nc(c, "\n  precision mediump float;\n  varying vec2 vTex;\n  uniform sampler2D sampler0;\n  void main(){\n    gl_FragColor = texture2D(sampler0, vTex);\n  }", 1), g = c.createProgram();
            c.attachShader(g, d);
            c.attachShader(g, e);
            c.linkProgram(g);
            if (!c.getProgramParameter(g, c.LINK_STATUS)) throw Error("Could not compile WebGL program.\n\n" + c.getProgramInfoLog(g));
            d = a.o = g;
            c.useProgram(d);
            e = c.getUniformLocation(d, "sampler0");
            a.j = {
                K: c.getAttribLocation(d, "aVertex"),
                J: c.getAttribLocation(d, "aTex"),
                qa: e
            };
            a.u = c.createBuffer();
            c.bindBuffer(c.ARRAY_BUFFER, a.u);
            c.enableVertexAttribArray(a.j.K);
            c.vertexAttribPointer(a.j.K, 2, c.FLOAT, !1, 0, 0);
            c.bufferData(c.ARRAY_BUFFER, new Float32Array([
                -1,
                -1,
                -1,
                1,
                1,
                1,
                1,
                -1
            ]), c.STATIC_DRAW);
            c.bindBuffer(c.ARRAY_BUFFER, null);
            a.s = c.createBuffer();
            c.bindBuffer(c.ARRAY_BUFFER, a.s);
            c.enableVertexAttribArray(a.j.J);
            c.vertexAttribPointer(a.j.J, 2, c.FLOAT, !1, 0, 0);
            c.bufferData(c.ARRAY_BUFFER, new Float32Array([
                0,
                1,
                0,
                0,
                1,
                0,
                1,
                1
            ]), c.STATIC_DRAW);
            c.bindBuffer(c.ARRAY_BUFFER, null);
            c.uniform1i(e, 0);
        }
        d = a.j;
        c.useProgram(a.o);
        c.canvas.width = b.width;
        c.canvas.height = b.height;
        c.viewport(0, 0, b.width, b.height);
        c.activeTexture(c.TEXTURE0);
        a.h.bindTexture2d(b.glName);
        c.enableVertexAttribArray(d.K);
        c.bindBuffer(c.ARRAY_BUFFER, a.u);
        c.vertexAttribPointer(d.K, 2, c.FLOAT, !1, 0, 0);
        c.enableVertexAttribArray(d.J);
        c.bindBuffer(c.ARRAY_BUFFER, a.s);
        c.vertexAttribPointer(d.J, 2, c.FLOAT, !1, 0, 0);
        c.bindFramebuffer(c.DRAW_FRAMEBUFFER ? c.DRAW_FRAMEBUFFER : c.FRAMEBUFFER, null);
        c.clearColor(0, 0, 0, 0);
        c.clear(c.COLOR_BUFFER_BIT);
        c.colorMask(!0, !0, !0, !0);
        c.drawArrays(c.TRIANGLE_FAN, 0, 4);
        c.disableVertexAttribArray(d.K);
        c.disableVertexAttribArray(d.J);
        c.bindBuffer(c.ARRAY_BUFFER, null);
        a.h.bindTexture2d(0);
    }
    function uc(a) {
        this.g = a;
    }
    ;
    var vc = new Uint8Array([
        0,
        97,
        115,
        109,
        1,
        0,
        0,
        0,
        1,
        4,
        1,
        96,
        0,
        0,
        3,
        2,
        1,
        0,
        10,
        9,
        1,
        7,
        0,
        65,
        0,
        253,
        15,
        26,
        11
    ]);
    function wc(a, b) {
        return b + a;
    }
    function xc(a, b) {
        window[a] = b;
    }
    function yc(a) {
        var b = document.createElement("script");
        b.setAttribute("src", a);
        b.setAttribute("crossorigin", "anonymous");
        return new Promise(function(c) {
            b.addEventListener("load", function() {
                c();
            }, !1);
            b.addEventListener("error", function() {
                c();
            }, !1);
            document.body.appendChild(b);
        });
    }
    function zc() {
        return I(function(a) {
            switch(a.g){
                case 1:
                    return a.o = 2, F(a, WebAssembly.instantiate(vc), 4);
                case 4:
                    a.g = 3;
                    a.o = 0;
                    break;
                case 2:
                    return a.o = 0, a.j = null, a.return(!1);
                case 3:
                    return a.return(!0);
            }
        });
    }
    function Ac(a) {
        this.g = a;
        this.listeners = {};
        this.j = {};
        this.H = {};
        this.o = {};
        this.u = {};
        this.I = this.s = this.$ = !0;
        this.D = Promise.resolve();
        this.Z = "";
        this.C = {};
        this.locateFile = a && a.locateFile || wc;
        if ("object" === typeof window) var b = window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/";
        else if ("undefined" !== typeof location) b = location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/";
        else throw Error("solutions can only be loaded on a web page or in a web worker");
        this.aa = b;
        if (a.options) {
            b = C(Object.keys(a.options));
            for(var c = b.next(); !c.done; c = b.next()){
                c = c.value;
                var d = a.options[c].default;
                void 0 !== d && (this.j[c] = "function" === typeof d ? d() : d);
            }
        }
    }
    x = Ac.prototype;
    x.close = function() {
        this.i && this.i.delete();
        return Promise.resolve();
    };
    function Bc(a) {
        var b, c, d, e, g, f, h, k, l, m, r;
        return I(function(p) {
            switch(p.g){
                case 1:
                    if (!a.$) return p.return();
                    b = void 0 === a.g.files ? [] : "function" === typeof a.g.files ? a.g.files(a.j) : a.g.files;
                    return F(p, zc(), 2);
                case 2:
                    c = p.h;
                    if ("object" === typeof window) return xc("createMediapipeSolutionsWasm", {
                        locateFile: a.locateFile
                    }), xc("createMediapipeSolutionsPackedAssets", {
                        locateFile: a.locateFile
                    }), f = b.filter(function(n) {
                        return void 0 !== n.data;
                    }), h = b.filter(function(n) {
                        return void 0 === n.data;
                    }), k = Promise.all(f.map(function(n) {
                        var q = Cc(a, n.url);
                        if (void 0 !== n.path) {
                            var t = n.path;
                            q = q.then(function(w) {
                                a.overrideFile(t, w);
                                return Promise.resolve(w);
                            });
                        }
                        return q;
                    })), l = Promise.all(h.map(function(n) {
                        return void 0 === n.simd || n.simd && c || !n.simd && !c ? yc(a.locateFile(n.url, a.aa)) : Promise.resolve();
                    })).then(function() {
                        var n, q, t;
                        return I(function(w) {
                            if (1 == w.g) return n = window.createMediapipeSolutionsWasm, q = window.createMediapipeSolutionsPackedAssets, t = a, F(w, n(q), 2);
                            t.h = w.h;
                            w.g = 0;
                        });
                    }), m = function() {
                        return I(function(n) {
                            a.g.graph && a.g.graph.url ? n = F(n, Cc(a, a.g.graph.url), 0) : (n.g = 0, n = void 0);
                            return n;
                        });
                    }(), F(p, Promise.all([
                        l,
                        k,
                        m
                    ]), 7);
                    if ("function" !== typeof importScripts) throw Error("solutions can only be loaded on a web page or in a web worker");
                    d = b.filter(function(n) {
                        return void 0 === n.simd || n.simd && c || !n.simd && !c;
                    }).map(function(n) {
                        return a.locateFile(n.url, a.aa);
                    });
                    importScripts.apply(null, ea(d));
                    e = a;
                    return F(p, createMediapipeSolutionsWasm(Module), 6);
                case 6:
                    e.h = p.h;
                    a.l = new OffscreenCanvas(1, 1);
                    a.h.canvas = a.l;
                    g = a.h.GL.createContext(a.l, {
                        antialias: !1,
                        alpha: !1,
                        na: "undefined" !== typeof WebGL2RenderingContext ? 2 : 1
                    });
                    a.h.GL.makeContextCurrent(g);
                    p.g = 4;
                    break;
                case 7:
                    a.l = document.createElement("canvas");
                    r = a.l.getContext("webgl2", {});
                    if (!r && (r = a.l.getContext("webgl", {}), !r)) return alert("Failed to create WebGL canvas context when passing video frame."), p.return();
                    a.G = r;
                    a.h.canvas = a.l;
                    a.h.createContext(a.l, !0, !0, {});
                case 4:
                    a.i = new a.h.SolutionWasm, a.$ = !1, p.g = 0;
            }
        });
    }
    function Dc(a) {
        var b, c, d, e, g, f, h, k;
        return I(function(l) {
            if (1 == l.g) {
                if (a.g.graph && a.g.graph.url && a.Z === a.g.graph.url) return l.return();
                a.s = !0;
                if (!a.g.graph || !a.g.graph.url) {
                    l.g = 2;
                    return;
                }
                a.Z = a.g.graph.url;
                return F(l, Cc(a, a.g.graph.url), 3);
            }
            2 != l.g && (b = l.h, a.i.loadGraph(b));
            c = C(Object.keys(a.C));
            for(d = c.next(); !d.done; d = c.next())e = d.value, a.i.overrideFile(e, a.C[e]);
            a.C = {};
            if (a.g.listeners) for(g = C(a.g.listeners), f = g.next(); !f.done; f = g.next())h = f.value, Ec(a, h);
            k = a.j;
            a.j = {};
            a.setOptions(k);
            l.g = 0;
        });
    }
    x.reset = function() {
        var a = this;
        return I(function(b) {
            a.i && (a.i.reset(), a.o = {}, a.u = {});
            b.g = 0;
        });
    };
    x.setOptions = function(a, b) {
        var c = this;
        if (b = b || this.g.options) {
            for(var d = [], e = [], g = {}, f = C(Object.keys(a)), h = f.next(); !h.done; g = {
                R: g.R,
                S: g.S
            }, h = f.next()){
                var k = h.value;
                k in this.j && this.j[k] === a[k] || (this.j[k] = a[k], h = b[k], void 0 !== h && (h.onChange && (g.R = h.onChange, g.S = a[k], d.push(function(l) {
                    return function() {
                        var m;
                        return I(function(r) {
                            if (1 == r.g) return F(r, l.R(l.S), 2);
                            m = r.h;
                            !0 === m && (c.s = !0);
                            r.g = 0;
                        });
                    };
                }(g))), h.graphOptionXref && (k = {
                    valueNumber: 1 === h.type ? a[k] : 0,
                    valueBoolean: 0 === h.type ? a[k] : !1,
                    valueString: 2 === h.type ? a[k] : ""
                }, h = Object.assign(Object.assign(Object.assign({}, {
                    calculatorName: "",
                    calculatorIndex: 0
                }), h.graphOptionXref), k), e.push(h))));
            }
            if (0 !== d.length || 0 !== e.length) this.s = !0, this.B = (void 0 === this.B ? [] : this.B).concat(e), this.A = (void 0 === this.A ? [] : this.A).concat(d);
        }
    };
    function Fc(a) {
        var b, c, d, e, g, f, h;
        return I(function(k) {
            switch(k.g){
                case 1:
                    if (!a.s) return k.return();
                    if (!a.A) {
                        k.g = 2;
                        break;
                    }
                    b = C(a.A);
                    c = b.next();
                case 3:
                    if (c.done) {
                        k.g = 5;
                        break;
                    }
                    d = c.value;
                    return F(k, d(), 4);
                case 4:
                    c = b.next();
                    k.g = 3;
                    break;
                case 5:
                    a.A = void 0;
                case 2:
                    if (a.B) {
                        e = new a.h.GraphOptionChangeRequestList;
                        g = C(a.B);
                        for(f = g.next(); !f.done; f = g.next())h = f.value, e.push_back(h);
                        a.i.changeOptions(e);
                        e.delete();
                        a.B = void 0;
                    }
                    a.s = !1;
                    k.g = 0;
            }
        });
    }
    x.initialize = function() {
        var a = this;
        return I(function(b) {
            return 1 == b.g ? F(b, Bc(a), 2) : 3 != b.g ? F(b, Dc(a), 3) : F(b, Fc(a), 0);
        });
    };
    function Cc(a, b) {
        var c, d;
        return I(function(e) {
            if (b in a.H) return e.return(a.H[b]);
            c = a.locateFile(b, "");
            d = fetch(c).then(function(g) {
                return g.arrayBuffer();
            });
            a.H[b] = d;
            return e.return(d);
        });
    }
    x.overrideFile = function(a, b) {
        this.i ? this.i.overrideFile(a, b) : this.C[a] = b;
    };
    x.clearOverriddenFiles = function() {
        this.C = {};
        this.i && this.i.clearOverriddenFiles();
    };
    x.send = function(a, b) {
        var c = this, d, e, g, f, h, k, l, m, r;
        return I(function(p) {
            switch(p.g){
                case 1:
                    if (!c.g.inputs) return p.return();
                    d = 1E3 * (void 0 === b || null === b ? performance.now() : b);
                    return F(p, c.D, 2);
                case 2:
                    return F(p, c.initialize(), 3);
                case 3:
                    e = new c.h.PacketDataList;
                    g = C(Object.keys(a));
                    for(f = g.next(); !f.done; f = g.next())if (h = f.value, k = c.g.inputs[h]) {
                        a: {
                            var n = a[h];
                            switch(k.type){
                                case "video":
                                    var q = c.o[k.stream];
                                    q || (q = new rc(c.h, c.G), c.o[k.stream] = q);
                                    0 === q.l && (q.l = q.h.createTexture());
                                    if ("undefined" !== typeof HTMLVideoElement && n instanceof HTMLVideoElement) {
                                        var t = n.videoWidth;
                                        var w = n.videoHeight;
                                    } else "undefined" !== typeof HTMLImageElement && n instanceof HTMLImageElement ? (t = n.naturalWidth, w = n.naturalHeight) : (t = n.width, w = n.height);
                                    w = {
                                        glName: q.l,
                                        width: t,
                                        height: w
                                    };
                                    t = q.g;
                                    t.canvas.width = w.width;
                                    t.canvas.height = w.height;
                                    t.activeTexture(t.TEXTURE0);
                                    q.h.bindTexture2d(q.l);
                                    t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, n);
                                    q.h.bindTexture2d(0);
                                    q = w;
                                    break a;
                                case "detections":
                                    q = c.o[k.stream];
                                    q || (q = new uc(c.h), c.o[k.stream] = q);
                                    q.data || (q.data = new q.g.DetectionListData);
                                    q.data.reset(n.length);
                                    for(w = 0; w < n.length; ++w){
                                        t = n[w];
                                        var v = q.data, A = v.setBoundingBox, H = w;
                                        var E = t.ea;
                                        var u = new lc;
                                        W(u, 1, E.ka);
                                        W(u, 2, E.la);
                                        W(u, 3, E.height);
                                        W(u, 4, E.width);
                                        W(u, 5, E.rotation);
                                        W(u, 6, E.ia);
                                        E = Vb(u, mc);
                                        A.call(v, H, E);
                                        if (t.Y) for(v = 0; v < t.Y.length; ++v){
                                            u = t.Y[v];
                                            var z = u.visibility ? !0 : !1;
                                            A = q.data;
                                            H = A.addNormalizedLandmark;
                                            E = w;
                                            u = Object.assign(Object.assign({}, u), {
                                                visibility: z ? u.visibility : 0
                                            });
                                            z = new gc;
                                            W(z, 1, u.x);
                                            W(z, 2, u.y);
                                            W(z, 3, u.z);
                                            u.visibility && W(z, 4, u.visibility);
                                            u = Vb(z, hc);
                                            H.call(A, E, u);
                                        }
                                        if (t.V) for(v = 0; v < t.V.length; ++v)A = q.data, H = A.addClassification, E = w, u = t.V[v], z = new bc, W(z, 2, u.score), u.index && W(z, 1, u.index), u.label && W(z, 3, u.label), u.displayName && W(z, 4, u.displayName), u = Vb(z, cc), H.call(A, E, u);
                                    }
                                    q = q.data;
                                    break a;
                                default:
                                    q = {};
                            }
                        }
                        l = q;
                        m = k.stream;
                        switch(k.type){
                            case "video":
                                e.pushTexture2d(Object.assign(Object.assign({}, l), {
                                    stream: m,
                                    timestamp: d
                                }));
                                break;
                            case "detections":
                                r = l;
                                r.stream = m;
                                r.timestamp = d;
                                e.pushDetectionList(r);
                                break;
                            default:
                                throw Error("Unknown input config type: '" + k.type + "'");
                        }
                    }
                    c.i.send(e);
                    return F(p, c.D, 4);
                case 4:
                    e.delete(), p.g = 0;
            }
        });
    };
    function Gc(a, b, c) {
        var d, e, g, f, h, k, l, m, r, p, n, q, t, w;
        return I(function(v) {
            switch(v.g){
                case 1:
                    if (!c) return v.return(b);
                    d = {};
                    e = 0;
                    g = C(Object.keys(c));
                    for(f = g.next(); !f.done; f = g.next())h = f.value, k = c[h], "string" !== typeof k && "texture" === k.type && void 0 !== b[k.stream] && ++e;
                    1 < e && (a.I = !1);
                    l = C(Object.keys(c));
                    f = l.next();
                case 2:
                    if (f.done) {
                        v.g = 4;
                        break;
                    }
                    m = f.value;
                    r = c[m];
                    if ("string" === typeof r) return t = d, w = m, F(v, Hc(a, m, b[r]), 14);
                    p = b[r.stream];
                    if ("detection_list" === r.type) {
                        if (p) {
                            var A = p.getRectList();
                            for(var H = p.getLandmarksList(), E = p.getClassificationsList(), u = [], z = 0; z < A.size(); ++z){
                                var P = Ub(A.get(z), lc, mc);
                                P = {
                                    ea: {
                                        ka: X(P, 1),
                                        la: X(P, 2),
                                        height: X(P, 3),
                                        width: X(P, 4),
                                        rotation: X(P, 5, 0),
                                        ia: kb(P, 6)
                                    },
                                    Y: ib(Ub(H.get(z), ic, kc), gc, 1).map(pc),
                                    V: oc(Ub(E.get(z), dc, fc))
                                };
                                u.push(P);
                            }
                            A = u;
                        } else A = [];
                        d[m] = A;
                        v.g = 7;
                        break;
                    }
                    if ("proto_list" === r.type) {
                        if (p) {
                            A = Array(p.size());
                            for(H = 0; H < p.size(); H++)A[H] = p.get(H);
                            p.delete();
                        } else A = [];
                        d[m] = A;
                        v.g = 7;
                        break;
                    }
                    if (void 0 === p) {
                        v.g = 3;
                        break;
                    }
                    if ("float_list" === r.type) {
                        d[m] = p;
                        v.g = 7;
                        break;
                    }
                    if ("proto" === r.type) {
                        d[m] = p;
                        v.g = 7;
                        break;
                    }
                    if ("texture" !== r.type) throw Error("Unknown output config type: '" + r.type + "'");
                    n = a.u[m];
                    n || (n = new rc(a.h, a.G), a.u[m] = n);
                    return F(v, sc(n, p, a.I), 13);
                case 13:
                    q = v.h, d[m] = q;
                case 7:
                    r.transform && d[m] && (d[m] = r.transform(d[m]));
                    v.g = 3;
                    break;
                case 14:
                    t[w] = v.h;
                case 3:
                    f = l.next();
                    v.g = 2;
                    break;
                case 4:
                    return v.return(d);
            }
        });
    }
    function Hc(a, b, c) {
        var d;
        return I(function(e) {
            return "number" === typeof c || c instanceof Uint8Array || c instanceof a.h.Uint8BlobList ? e.return(c) : c instanceof a.h.Texture2dDataOut ? (d = a.u[b], d || (d = new rc(a.h, a.G), a.u[b] = d), e.return(sc(d, c, a.I))) : e.return(void 0);
        });
    }
    function Ec(a, b) {
        for(var c = b.name || "$", d = [].concat(ea(b.wants)), e = new a.h.StringList, g = C(b.wants), f = g.next(); !f.done; f = g.next())e.push_back(f.value);
        g = a.h.PacketListener.implement({
            onResults: function(h) {
                for(var k = {}, l = 0; l < b.wants.length; ++l)k[d[l]] = h.get(l);
                var m = a.listeners[c];
                m && (a.D = Gc(a, k, b.outs).then(function(r) {
                    r = m(r);
                    for(var p = 0; p < b.wants.length; ++p){
                        var n = k[d[p]];
                        "object" === typeof n && n.hasOwnProperty && n.hasOwnProperty("delete") && n.delete();
                    }
                    r && (a.D = r);
                }));
            }
        });
        a.i.attachMultiListener(e, g);
        e.delete();
    }
    x.onResults = function(a, b) {
        this.listeners[b || "$"] = a;
    };
    J("Solution", Ac);
    J("OptionType", {
        BOOL: 0,
        NUMBER: 1,
        ma: 2,
        0: "BOOL",
        1: "NUMBER",
        2: "STRING"
    });
    function Ic(a) {
        void 0 === a && (a = 0);
        return 1 === a ? "hand_landmark_full.tflite" : "hand_landmark_lite.tflite";
    }
    function Jc(a) {
        var b = this;
        a = a || {};
        this.g = new Ac({
            locateFile: a.locateFile,
            files: function(c) {
                return [
                    {
                        url: "hands_solution_packed_assets_loader.js"
                    },
                    {
                        simd: !1,
                        url: "hands_solution_wasm_bin.js"
                    },
                    {
                        simd: !0,
                        url: "hands_solution_simd_wasm_bin.js"
                    },
                    {
                        data: !0,
                        url: Ic(c.modelComplexity)
                    }
                ];
            },
            graph: {
                url: "hands.binarypb"
            },
            inputs: {
                image: {
                    type: "video",
                    stream: "input_frames_gpu"
                }
            },
            listeners: [
                {
                    wants: [
                        "multi_hand_landmarks",
                        "multi_hand_world_landmarks",
                        "image_transformed",
                        "multi_handedness"
                    ],
                    outs: {
                        image: "image_transformed",
                        multiHandLandmarks: {
                            type: "proto_list",
                            stream: "multi_hand_landmarks",
                            transform: qc
                        },
                        multiHandWorldLandmarks: {
                            type: "proto_list",
                            stream: "multi_hand_world_landmarks",
                            transform: qc
                        },
                        multiHandedness: {
                            type: "proto_list",
                            stream: "multi_handedness",
                            transform: function(c) {
                                return c.map(function(d) {
                                    return oc(Ub(d, dc, fc))[0];
                                });
                            }
                        }
                    }
                }
            ],
            options: {
                useCpuInference: {
                    type: 0,
                    graphOptionXref: {
                        calculatorType: "InferenceCalculator",
                        fieldName: "use_cpu_inference"
                    },
                    default: "object" !== typeof window || void 0 === window.navigator ? !1 : "iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod".split(";").includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document
                },
                selfieMode: {
                    type: 0,
                    graphOptionXref: {
                        calculatorType: "GlScalerCalculator",
                        calculatorIndex: 1,
                        fieldName: "flip_horizontal"
                    }
                },
                maxNumHands: {
                    type: 1,
                    graphOptionXref: {
                        calculatorType: "ConstantSidePacketCalculator",
                        calculatorName: "ConstantSidePacketCalculator",
                        fieldName: "int_value"
                    }
                },
                modelComplexity: {
                    type: 1,
                    graphOptionXref: {
                        calculatorType: "ConstantSidePacketCalculator",
                        calculatorName: "ConstantSidePacketCalculatorModelComplexity",
                        fieldName: "int_value"
                    },
                    onChange: function(c) {
                        var d, e, g;
                        return I(function(f) {
                            if (1 == f.g) return d = Ic(c), e = "third_party/mediapipe/modules/hand_landmark/" + d, F(f, Cc(b.g, d), 2);
                            g = f.h;
                            b.g.overrideFile(e, g);
                            return f.return(!0);
                        });
                    }
                },
                minDetectionConfidence: {
                    type: 1,
                    graphOptionXref: {
                        calculatorType: "TensorsToDetectionsCalculator",
                        calculatorName: "handlandmarktrackinggpu__palmdetectiongpu__TensorsToDetectionsCalculator",
                        fieldName: "min_score_thresh"
                    }
                },
                minTrackingConfidence: {
                    type: 1,
                    graphOptionXref: {
                        calculatorType: "ThresholdingCalculator",
                        calculatorName: "handlandmarktrackinggpu__handlandmarkgpu__ThresholdingCalculator",
                        fieldName: "threshold"
                    }
                }
            }
        });
    }
    x = Jc.prototype;
    x.close = function() {
        this.g.close();
        return Promise.resolve();
    };
    x.onResults = function(a) {
        this.g.onResults(a);
    };
    x.initialize = function() {
        var a = this;
        return I(function(b) {
            return F(b, a.g.initialize(), 0);
        });
    };
    x.reset = function() {
        this.g.reset();
    };
    x.send = function(a) {
        var b = this;
        return I(function(c) {
            return F(c, b.g.send(a), 0);
        });
    };
    x.setOptions = function(a) {
        this.g.setOptions(a);
    };
    J("Hands", Jc);
    J("HAND_CONNECTIONS", [
        [
            0,
            1
        ],
        [
            1,
            2
        ],
        [
            2,
            3
        ],
        [
            3,
            4
        ],
        [
            0,
            5
        ],
        [
            5,
            6
        ],
        [
            6,
            7
        ],
        [
            7,
            8
        ],
        [
            5,
            9
        ],
        [
            9,
            10
        ],
        [
            10,
            11
        ],
        [
            11,
            12
        ],
        [
            9,
            13
        ],
        [
            13,
            14
        ],
        [
            14,
            15
        ],
        [
            15,
            16
        ],
        [
            13,
            17
        ],
        [
            0,
            17
        ],
        [
            17,
            18
        ],
        [
            18,
            19
        ],
        [
            19,
            20
        ]
    ]);
    J("VERSION", "0.4.1646424915");
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvbWVkaWFQaXBlL2hhbmRzQDAuNC4xNjQ2NDI0OTE1L2hhbmRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpey8qXG5cbiBDb3B5cmlnaHQgVGhlIENsb3N1cmUgTGlicmFyeSBBdXRob3JzLlxuIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4qL1xuJ3VzZSBzdHJpY3QnO3ZhciB4O2Z1bmN0aW9uIGFhKGEpe3ZhciBiPTA7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGI8YS5sZW5ndGg/e2RvbmU6ITEsdmFsdWU6YVtiKytdfTp7ZG9uZTohMH19fXZhciBiYT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBPYmplY3QuZGVmaW5lUHJvcGVydGllcz9PYmplY3QuZGVmaW5lUHJvcGVydHk6ZnVuY3Rpb24oYSxiLGMpe2lmKGE9PUFycmF5LnByb3RvdHlwZXx8YT09T2JqZWN0LnByb3RvdHlwZSlyZXR1cm4gYTthW2JdPWMudmFsdWU7cmV0dXJuIGF9O1xuZnVuY3Rpb24gY2EoYSl7YT1bXCJvYmplY3RcIj09dHlwZW9mIGdsb2JhbFRoaXMmJmdsb2JhbFRoaXMsYSxcIm9iamVjdFwiPT10eXBlb2Ygd2luZG93JiZ3aW5kb3csXCJvYmplY3RcIj09dHlwZW9mIHNlbGYmJnNlbGYsXCJvYmplY3RcIj09dHlwZW9mIGdsb2JhbCYmZ2xvYmFsXTtmb3IodmFyIGI9MDtiPGEubGVuZ3RoOysrYil7dmFyIGM9YVtiXTtpZihjJiZjLk1hdGg9PU1hdGgpcmV0dXJuIGN9dGhyb3cgRXJyb3IoXCJDYW5ub3QgZmluZCBnbG9iYWwgb2JqZWN0XCIpO312YXIgeT1jYSh0aGlzKTtmdW5jdGlvbiBCKGEsYil7aWYoYilhOnt2YXIgYz15O2E9YS5zcGxpdChcIi5cIik7Zm9yKHZhciBkPTA7ZDxhLmxlbmd0aC0xO2QrKyl7dmFyIGU9YVtkXTtpZighKGUgaW4gYykpYnJlYWsgYTtjPWNbZV19YT1hW2EubGVuZ3RoLTFdO2Q9Y1thXTtiPWIoZCk7YiE9ZCYmbnVsbCE9YiYmYmEoYyxhLHtjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6Yn0pfX1cbkIoXCJTeW1ib2xcIixmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGcpe2lmKHRoaXMgaW5zdGFuY2VvZiBiKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3JcIik7cmV0dXJuIG5ldyBjKGQrKGd8fFwiXCIpK1wiX1wiK2UrKyxnKX1mdW5jdGlvbiBjKGcsZil7dGhpcy5nPWc7YmEodGhpcyxcImRlc2NyaXB0aW9uXCIse2NvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMCx2YWx1ZTpmfSl9aWYoYSlyZXR1cm4gYTtjLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmd9O3ZhciBkPVwianNjb21wX3N5bWJvbF9cIisoMUU5Kk1hdGgucmFuZG9tKCk+Pj4wKStcIl9cIixlPTA7cmV0dXJuIGJ9KTtcbkIoXCJTeW1ib2wuaXRlcmF0b3JcIixmdW5jdGlvbihhKXtpZihhKXJldHVybiBhO2E9U3ltYm9sKFwiU3ltYm9sLml0ZXJhdG9yXCIpO2Zvcih2YXIgYj1cIkFycmF5IEludDhBcnJheSBVaW50OEFycmF5IFVpbnQ4Q2xhbXBlZEFycmF5IEludDE2QXJyYXkgVWludDE2QXJyYXkgSW50MzJBcnJheSBVaW50MzJBcnJheSBGbG9hdDMyQXJyYXkgRmxvYXQ2NEFycmF5XCIuc3BsaXQoXCIgXCIpLGM9MDtjPGIubGVuZ3RoO2MrKyl7dmFyIGQ9eVtiW2NdXTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgZCYmXCJmdW5jdGlvblwiIT10eXBlb2YgZC5wcm90b3R5cGVbYV0mJmJhKGQucHJvdG90eXBlLGEse2NvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMCx2YWx1ZTpmdW5jdGlvbigpe3JldHVybiBkYShhYSh0aGlzKSl9fSl9cmV0dXJuIGF9KTtmdW5jdGlvbiBkYShhKXthPXtuZXh0OmF9O2FbU3ltYm9sLml0ZXJhdG9yXT1mdW5jdGlvbigpe3JldHVybiB0aGlzfTtyZXR1cm4gYX1cbmZ1bmN0aW9uIEMoYSl7dmFyIGI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yJiZhW1N5bWJvbC5pdGVyYXRvcl07cmV0dXJuIGI/Yi5jYWxsKGEpOntuZXh0OmFhKGEpfX1mdW5jdGlvbiBlYShhKXtpZighKGEgaW5zdGFuY2VvZiBBcnJheSkpe2E9QyhhKTtmb3IodmFyIGIsYz1bXTshKGI9YS5uZXh0KCkpLmRvbmU7KWMucHVzaChiLnZhbHVlKTthPWN9cmV0dXJuIGF9dmFyIGZhPVwiZnVuY3Rpb25cIj09dHlwZW9mIE9iamVjdC5jcmVhdGU/T2JqZWN0LmNyZWF0ZTpmdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7fWIucHJvdG90eXBlPWE7cmV0dXJuIG5ldyBifSxoYTtcbmlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIE9iamVjdC5zZXRQcm90b3R5cGVPZiloYT1PYmplY3Quc2V0UHJvdG90eXBlT2Y7ZWxzZXt2YXIgaWE7YTp7dmFyIGphPXthOiEwfSxrYT17fTt0cnl7a2EuX19wcm90b19fPWphO2lhPWthLmE7YnJlYWsgYX1jYXRjaChhKXt9aWE9ITF9aGE9aWE/ZnVuY3Rpb24oYSxiKXthLl9fcHJvdG9fXz1iO2lmKGEuX19wcm90b19fIT09Yil0aHJvdyBuZXcgVHlwZUVycm9yKGErXCIgaXMgbm90IGV4dGVuc2libGVcIik7cmV0dXJuIGF9Om51bGx9dmFyIGxhPWhhO1xuZnVuY3Rpb24gRChhLGIpe2EucHJvdG90eXBlPWZhKGIucHJvdG90eXBlKTthLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1hO2lmKGxhKWxhKGEsYik7ZWxzZSBmb3IodmFyIGMgaW4gYilpZihcInByb3RvdHlwZVwiIT1jKWlmKE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKXt2YXIgZD1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGIsYyk7ZCYmT2JqZWN0LmRlZmluZVByb3BlcnR5KGEsYyxkKX1lbHNlIGFbY109YltjXTthLnJhPWIucHJvdG90eXBlfWZ1bmN0aW9uIG1hKCl7dGhpcy5sPSExO3RoaXMuaT1udWxsO3RoaXMuaD12b2lkIDA7dGhpcy5nPTE7dGhpcy51PXRoaXMubz0wO3RoaXMuaj1udWxsfWZ1bmN0aW9uIG5hKGEpe2lmKGEubCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTthLmw9ITB9bWEucHJvdG90eXBlLnM9ZnVuY3Rpb24oYSl7dGhpcy5oPWF9O1xuZnVuY3Rpb24gb2EoYSxiKXthLmo9e2ZhOmIsZ2E6ITB9O2EuZz1hLm98fGEudX1tYS5wcm90b3R5cGUucmV0dXJuPWZ1bmN0aW9uKGEpe3RoaXMuaj17cmV0dXJuOmF9O3RoaXMuZz10aGlzLnV9O2Z1bmN0aW9uIEYoYSxiLGMpe2EuZz1jO3JldHVybnt2YWx1ZTpifX1mdW5jdGlvbiBwYShhKXt0aGlzLmc9bmV3IG1hO3RoaXMuaD1hfWZ1bmN0aW9uIHFhKGEsYil7bmEoYS5nKTt2YXIgYz1hLmcuaTtpZihjKXJldHVybiByYShhLFwicmV0dXJuXCJpbiBjP2NbXCJyZXR1cm5cIl06ZnVuY3Rpb24oZCl7cmV0dXJue3ZhbHVlOmQsZG9uZTohMH19LGIsYS5nLnJldHVybik7YS5nLnJldHVybihiKTtyZXR1cm4gRyhhKX1cbmZ1bmN0aW9uIHJhKGEsYixjLGQpe3RyeXt2YXIgZT1iLmNhbGwoYS5nLmksYyk7aWYoIShlIGluc3RhbmNlb2YgT2JqZWN0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiSXRlcmF0b3IgcmVzdWx0IFwiK2UrXCIgaXMgbm90IGFuIG9iamVjdFwiKTtpZighZS5kb25lKXJldHVybiBhLmcubD0hMSxlO3ZhciBnPWUudmFsdWV9Y2F0Y2goZil7cmV0dXJuIGEuZy5pPW51bGwsb2EoYS5nLGYpLEcoYSl9YS5nLmk9bnVsbDtkLmNhbGwoYS5nLGcpO3JldHVybiBHKGEpfWZ1bmN0aW9uIEcoYSl7Zm9yKDthLmcuZzspdHJ5e3ZhciBiPWEuaChhLmcpO2lmKGIpcmV0dXJuIGEuZy5sPSExLHt2YWx1ZTpiLnZhbHVlLGRvbmU6ITF9fWNhdGNoKGMpe2EuZy5oPXZvaWQgMCxvYShhLmcsYyl9YS5nLmw9ITE7aWYoYS5nLmope2I9YS5nLmo7YS5nLmo9bnVsbDtpZihiLmdhKXRocm93IGIuZmE7cmV0dXJue3ZhbHVlOmIucmV0dXJuLGRvbmU6ITB9fXJldHVybnt2YWx1ZTp2b2lkIDAsZG9uZTohMH19XG5mdW5jdGlvbiBzYShhKXt0aGlzLm5leHQ9ZnVuY3Rpb24oYil7bmEoYS5nKTthLmcuaT9iPXJhKGEsYS5nLmkubmV4dCxiLGEuZy5zKTooYS5nLnMoYiksYj1HKGEpKTtyZXR1cm4gYn07dGhpcy50aHJvdz1mdW5jdGlvbihiKXtuYShhLmcpO2EuZy5pP2I9cmEoYSxhLmcuaVtcInRocm93XCJdLGIsYS5nLnMpOihvYShhLmcsYiksYj1HKGEpKTtyZXR1cm4gYn07dGhpcy5yZXR1cm49ZnVuY3Rpb24oYil7cmV0dXJuIHFhKGEsYil9O3RoaXNbU3ltYm9sLml0ZXJhdG9yXT1mdW5jdGlvbigpe3JldHVybiB0aGlzfX1mdW5jdGlvbiB0YShhKXtmdW5jdGlvbiBiKGQpe3JldHVybiBhLm5leHQoZCl9ZnVuY3Rpb24gYyhkKXtyZXR1cm4gYS50aHJvdyhkKX1yZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24oZCxlKXtmdW5jdGlvbiBnKGYpe2YuZG9uZT9kKGYudmFsdWUpOlByb21pc2UucmVzb2x2ZShmLnZhbHVlKS50aGVuKGIsYykudGhlbihnLGUpfWcoYS5uZXh0KCkpfSl9XG5mdW5jdGlvbiBJKGEpe3JldHVybiB0YShuZXcgc2EobmV3IHBhKGEpKSl9XG5CKFwiUHJvbWlzZVwiLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoZil7dGhpcy5oPTA7dGhpcy5pPXZvaWQgMDt0aGlzLmc9W107dGhpcy5zPSExO3ZhciBoPXRoaXMuaigpO3RyeXtmKGgucmVzb2x2ZSxoLnJlamVjdCl9Y2F0Y2goayl7aC5yZWplY3Qoayl9fWZ1bmN0aW9uIGMoKXt0aGlzLmc9bnVsbH1mdW5jdGlvbiBkKGYpe3JldHVybiBmIGluc3RhbmNlb2YgYj9mOm5ldyBiKGZ1bmN0aW9uKGgpe2goZil9KX1pZihhKXJldHVybiBhO2MucHJvdG90eXBlLmg9ZnVuY3Rpb24oZil7aWYobnVsbD09dGhpcy5nKXt0aGlzLmc9W107dmFyIGg9dGhpczt0aGlzLmkoZnVuY3Rpb24oKXtoLmwoKX0pfXRoaXMuZy5wdXNoKGYpfTt2YXIgZT15LnNldFRpbWVvdXQ7Yy5wcm90b3R5cGUuaT1mdW5jdGlvbihmKXtlKGYsMCl9O2MucHJvdG90eXBlLmw9ZnVuY3Rpb24oKXtmb3IoO3RoaXMuZyYmdGhpcy5nLmxlbmd0aDspe3ZhciBmPXRoaXMuZzt0aGlzLmc9W107Zm9yKHZhciBoPTA7aDxmLmxlbmd0aDsrK2gpe3ZhciBrPVxuZltoXTtmW2hdPW51bGw7dHJ5e2soKX1jYXRjaChsKXt0aGlzLmoobCl9fX10aGlzLmc9bnVsbH07Yy5wcm90b3R5cGUuaj1mdW5jdGlvbihmKXt0aGlzLmkoZnVuY3Rpb24oKXt0aHJvdyBmO30pfTtiLnByb3RvdHlwZS5qPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZihsKXtyZXR1cm4gZnVuY3Rpb24obSl7a3x8KGs9ITAsbC5jYWxsKGgsbSkpfX12YXIgaD10aGlzLGs9ITE7cmV0dXJue3Jlc29sdmU6Zih0aGlzLkQpLHJlamVjdDpmKHRoaXMubCl9fTtiLnByb3RvdHlwZS5EPWZ1bmN0aW9uKGYpe2lmKGY9PT10aGlzKXRoaXMubChuZXcgVHlwZUVycm9yKFwiQSBQcm9taXNlIGNhbm5vdCByZXNvbHZlIHRvIGl0c2VsZlwiKSk7ZWxzZSBpZihmIGluc3RhbmNlb2YgYil0aGlzLkgoZik7ZWxzZXthOnN3aXRjaCh0eXBlb2YgZil7Y2FzZSBcIm9iamVjdFwiOnZhciBoPW51bGwhPWY7YnJlYWsgYTtjYXNlIFwiZnVuY3Rpb25cIjpoPSEwO2JyZWFrIGE7ZGVmYXVsdDpoPSExfWg/dGhpcy5BKGYpOnRoaXMubyhmKX19O1xuYi5wcm90b3R5cGUuQT1mdW5jdGlvbihmKXt2YXIgaD12b2lkIDA7dHJ5e2g9Zi50aGVufWNhdGNoKGspe3RoaXMubChrKTtyZXR1cm59XCJmdW5jdGlvblwiPT10eXBlb2YgaD90aGlzLkkoaCxmKTp0aGlzLm8oZil9O2IucHJvdG90eXBlLmw9ZnVuY3Rpb24oZil7dGhpcy51KDIsZil9O2IucHJvdG90eXBlLm89ZnVuY3Rpb24oZil7dGhpcy51KDEsZil9O2IucHJvdG90eXBlLnU9ZnVuY3Rpb24oZixoKXtpZigwIT10aGlzLmgpdGhyb3cgRXJyb3IoXCJDYW5ub3Qgc2V0dGxlKFwiK2YrXCIsIFwiK2grXCIpOiBQcm9taXNlIGFscmVhZHkgc2V0dGxlZCBpbiBzdGF0ZVwiK3RoaXMuaCk7dGhpcy5oPWY7dGhpcy5pPWg7Mj09PXRoaXMuaCYmdGhpcy5HKCk7dGhpcy5CKCl9O2IucHJvdG90eXBlLkc9ZnVuY3Rpb24oKXt2YXIgZj10aGlzO2UoZnVuY3Rpb24oKXtpZihmLkMoKSl7dmFyIGg9eS5jb25zb2xlO1widW5kZWZpbmVkXCIhPT10eXBlb2YgaCYmaC5lcnJvcihmLmkpfX0sMSl9O2IucHJvdG90eXBlLkM9XG5mdW5jdGlvbigpe2lmKHRoaXMucylyZXR1cm4hMTt2YXIgZj15LkN1c3RvbUV2ZW50LGg9eS5FdmVudCxrPXkuZGlzcGF0Y2hFdmVudDtpZihcInVuZGVmaW5lZFwiPT09dHlwZW9mIGspcmV0dXJuITA7XCJmdW5jdGlvblwiPT09dHlwZW9mIGY/Zj1uZXcgZihcInVuaGFuZGxlZHJlamVjdGlvblwiLHtjYW5jZWxhYmxlOiEwfSk6XCJmdW5jdGlvblwiPT09dHlwZW9mIGg/Zj1uZXcgaChcInVuaGFuZGxlZHJlamVjdGlvblwiLHtjYW5jZWxhYmxlOiEwfSk6KGY9eS5kb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpLGYuaW5pdEN1c3RvbUV2ZW50KFwidW5oYW5kbGVkcmVqZWN0aW9uXCIsITEsITAsZikpO2YucHJvbWlzZT10aGlzO2YucmVhc29uPXRoaXMuaTtyZXR1cm4gayhmKX07Yi5wcm90b3R5cGUuQj1mdW5jdGlvbigpe2lmKG51bGwhPXRoaXMuZyl7Zm9yKHZhciBmPTA7Zjx0aGlzLmcubGVuZ3RoOysrZilnLmgodGhpcy5nW2ZdKTt0aGlzLmc9bnVsbH19O3ZhciBnPW5ldyBjO2IucHJvdG90eXBlLkg9XG5mdW5jdGlvbihmKXt2YXIgaD10aGlzLmooKTtmLk0oaC5yZXNvbHZlLGgucmVqZWN0KX07Yi5wcm90b3R5cGUuST1mdW5jdGlvbihmLGgpe3ZhciBrPXRoaXMuaigpO3RyeXtmLmNhbGwoaCxrLnJlc29sdmUsay5yZWplY3QpfWNhdGNoKGwpe2sucmVqZWN0KGwpfX07Yi5wcm90b3R5cGUudGhlbj1mdW5jdGlvbihmLGgpe2Z1bmN0aW9uIGsocCxuKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBwP2Z1bmN0aW9uKHEpe3RyeXtsKHAocSkpfWNhdGNoKHQpe20odCl9fTpufXZhciBsLG0scj1uZXcgYihmdW5jdGlvbihwLG4pe2w9cDttPW59KTt0aGlzLk0oayhmLGwpLGsoaCxtKSk7cmV0dXJuIHJ9O2IucHJvdG90eXBlLmNhdGNoPWZ1bmN0aW9uKGYpe3JldHVybiB0aGlzLnRoZW4odm9pZCAwLGYpfTtiLnByb3RvdHlwZS5NPWZ1bmN0aW9uKGYsaCl7ZnVuY3Rpb24gaygpe3N3aXRjaChsLmgpe2Nhc2UgMTpmKGwuaSk7YnJlYWs7Y2FzZSAyOmgobC5pKTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiVW5leHBlY3RlZCBzdGF0ZTogXCIrXG5sLmgpO319dmFyIGw9dGhpcztudWxsPT10aGlzLmc/Zy5oKGspOnRoaXMuZy5wdXNoKGspO3RoaXMucz0hMH07Yi5yZXNvbHZlPWQ7Yi5yZWplY3Q9ZnVuY3Rpb24oZil7cmV0dXJuIG5ldyBiKGZ1bmN0aW9uKGgsayl7ayhmKX0pfTtiLnJhY2U9ZnVuY3Rpb24oZil7cmV0dXJuIG5ldyBiKGZ1bmN0aW9uKGgsayl7Zm9yKHZhciBsPUMoZiksbT1sLm5leHQoKTshbS5kb25lO209bC5uZXh0KCkpZChtLnZhbHVlKS5NKGgsayl9KX07Yi5hbGw9ZnVuY3Rpb24oZil7dmFyIGg9QyhmKSxrPWgubmV4dCgpO3JldHVybiBrLmRvbmU/ZChbXSk6bmV3IGIoZnVuY3Rpb24obCxtKXtmdW5jdGlvbiByKHEpe3JldHVybiBmdW5jdGlvbih0KXtwW3FdPXQ7bi0tOzA9PW4mJmwocCl9fXZhciBwPVtdLG49MDtkbyBwLnB1c2godm9pZCAwKSxuKyssZChrLnZhbHVlKS5NKHIocC5sZW5ndGgtMSksbSksaz1oLm5leHQoKTt3aGlsZSghay5kb25lKX0pfTtyZXR1cm4gYn0pO1xuZnVuY3Rpb24gdWEoYSxiKXthIGluc3RhbmNlb2YgU3RyaW5nJiYoYSs9XCJcIik7dmFyIGM9MCxkPSExLGU9e25leHQ6ZnVuY3Rpb24oKXtpZighZCYmYzxhLmxlbmd0aCl7dmFyIGc9YysrO3JldHVybnt2YWx1ZTpiKGcsYVtnXSksZG9uZTohMX19ZD0hMDtyZXR1cm57ZG9uZTohMCx2YWx1ZTp2b2lkIDB9fX07ZVtTeW1ib2wuaXRlcmF0b3JdPWZ1bmN0aW9uKCl7cmV0dXJuIGV9O3JldHVybiBlfXZhciB2YT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBPYmplY3QuYXNzaWduP09iamVjdC5hc3NpZ246ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9MTtjPGFyZ3VtZW50cy5sZW5ndGg7YysrKXt2YXIgZD1hcmd1bWVudHNbY107aWYoZClmb3IodmFyIGUgaW4gZClPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZCxlKSYmKGFbZV09ZFtlXSl9cmV0dXJuIGF9O0IoXCJPYmplY3QuYXNzaWduXCIsZnVuY3Rpb24oYSl7cmV0dXJuIGF8fHZhfSk7XG5CKFwiT2JqZWN0LmlzXCIsZnVuY3Rpb24oYSl7cmV0dXJuIGE/YTpmdW5jdGlvbihiLGMpe3JldHVybiBiPT09Yz8wIT09Ynx8MS9iPT09MS9jOmIhPT1iJiZjIT09Y319KTtCKFwiQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXCIsZnVuY3Rpb24oYSl7cmV0dXJuIGE/YTpmdW5jdGlvbihiLGMpe3ZhciBkPXRoaXM7ZCBpbnN0YW5jZW9mIFN0cmluZyYmKGQ9U3RyaW5nKGQpKTt2YXIgZT1kLmxlbmd0aDtjPWN8fDA7Zm9yKDA+YyYmKGM9TWF0aC5tYXgoYytlLDApKTtjPGU7YysrKXt2YXIgZz1kW2NdO2lmKGc9PT1ifHxPYmplY3QuaXMoZyxiKSlyZXR1cm4hMH1yZXR1cm4hMX19KTtcbkIoXCJTdHJpbmcucHJvdG90eXBlLmluY2x1ZGVzXCIsZnVuY3Rpb24oYSl7cmV0dXJuIGE/YTpmdW5jdGlvbihiLGMpe2lmKG51bGw9PXRoaXMpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRoZSAndGhpcycgdmFsdWUgZm9yIFN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXMgbXVzdCBub3QgYmUgbnVsbCBvciB1bmRlZmluZWRcIik7aWYoYiBpbnN0YW5jZW9mIFJlZ0V4cCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmlyc3QgYXJndW1lbnQgdG8gU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyBtdXN0IG5vdCBiZSBhIHJlZ3VsYXIgZXhwcmVzc2lvblwiKTtyZXR1cm4tMSE9PXRoaXMuaW5kZXhPZihiLGN8fDApfX0pO0IoXCJBcnJheS5wcm90b3R5cGUua2V5c1wiLGZ1bmN0aW9uKGEpe3JldHVybiBhP2E6ZnVuY3Rpb24oKXtyZXR1cm4gdWEodGhpcyxmdW5jdGlvbihiKXtyZXR1cm4gYn0pfX0pO3ZhciB3YT10aGlzfHxzZWxmO1xuZnVuY3Rpb24gSihhLGIpe2E9YS5zcGxpdChcIi5cIik7dmFyIGM9d2E7YVswXWluIGN8fFwidW5kZWZpbmVkXCI9PXR5cGVvZiBjLmV4ZWNTY3JpcHR8fGMuZXhlY1NjcmlwdChcInZhciBcIithWzBdKTtmb3IodmFyIGQ7YS5sZW5ndGgmJihkPWEuc2hpZnQoKSk7KWEubGVuZ3RofHx2b2lkIDA9PT1iP2NbZF0mJmNbZF0hPT1PYmplY3QucHJvdG90eXBlW2RdP2M9Y1tkXTpjPWNbZF09e306Y1tkXT1ifTtmdW5jdGlvbiBLKCl7dGhyb3cgRXJyb3IoXCJJbnZhbGlkIFVURjhcIik7fWZ1bmN0aW9uIHhhKGEsYil7Yj1TdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsYik7cmV0dXJuIG51bGw9PWE/YjphK2J9dmFyIHlhLHphPVwidW5kZWZpbmVkXCIhPT10eXBlb2YgVGV4dERlY29kZXIsQWEsQmE9XCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBUZXh0RW5jb2Rlcjt2YXIgQ2E9e30sTD1udWxsO2Z1bmN0aW9uIERhKGEpe3ZhciBiO3ZvaWQgMD09PWImJihiPTApO0VhKCk7Yj1DYVtiXTtmb3IodmFyIGM9QXJyYXkoTWF0aC5mbG9vcihhLmxlbmd0aC8zKSksZD1iWzY0XXx8XCJcIixlPTAsZz0wO2U8YS5sZW5ndGgtMjtlKz0zKXt2YXIgZj1hW2VdLGg9YVtlKzFdLGs9YVtlKzJdLGw9YltmPj4yXTtmPWJbKGYmMyk8PDR8aD4+NF07aD1iWyhoJjE1KTw8MnxrPj42XTtrPWJbayY2M107Y1tnKytdPWwrZitoK2t9bD0wO2s9ZDtzd2l0Y2goYS5sZW5ndGgtZSl7Y2FzZSAyOmw9YVtlKzFdLGs9YlsobCYxNSk8PDJdfHxkO2Nhc2UgMTphPWFbZV0sY1tnXT1iW2E+PjJdK2JbKGEmMyk8PDR8bD4+NF0raytkfXJldHVybiBjLmpvaW4oXCJcIil9XG5mdW5jdGlvbiBGYShhKXt2YXIgYj1hLmxlbmd0aCxjPTMqYi80O2MlMz9jPU1hdGguZmxvb3IoYyk6LTEhPVwiPS5cIi5pbmRleE9mKGFbYi0xXSkmJihjPS0xIT1cIj0uXCIuaW5kZXhPZihhW2ItMl0pP2MtMjpjLTEpO3ZhciBkPW5ldyBVaW50OEFycmF5KGMpLGU9MDtHYShhLGZ1bmN0aW9uKGcpe2RbZSsrXT1nfSk7cmV0dXJuIGUhPT1jP2Quc3ViYXJyYXkoMCxlKTpkfVxuZnVuY3Rpb24gR2EoYSxiKXtmdW5jdGlvbiBjKGspe2Zvcig7ZDxhLmxlbmd0aDspe3ZhciBsPWEuY2hhckF0KGQrKyksbT1MW2xdO2lmKG51bGwhPW0pcmV0dXJuIG07aWYoIS9eW1xcc1xceGEwXSokLy50ZXN0KGwpKXRocm93IEVycm9yKFwiVW5rbm93biBiYXNlNjQgZW5jb2RpbmcgYXQgY2hhcjogXCIrbCk7fXJldHVybiBrfUVhKCk7Zm9yKHZhciBkPTA7Oyl7dmFyIGU9YygtMSksZz1jKDApLGY9Yyg2NCksaD1jKDY0KTtpZig2ND09PWgmJi0xPT09ZSlicmVhaztiKGU8PDJ8Zz4+NCk7NjQhPWYmJihiKGc8PDQmMjQwfGY+PjIpLDY0IT1oJiZiKGY8PDYmMTkyfGgpKX19XG5mdW5jdGlvbiBFYSgpe2lmKCFMKXtMPXt9O2Zvcih2YXIgYT1cIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5XCIuc3BsaXQoXCJcIiksYj1bXCIrLz1cIixcIisvXCIsXCItXz1cIixcIi1fLlwiLFwiLV9cIl0sYz0wOzU+YztjKyspe3ZhciBkPWEuY29uY2F0KGJbY10uc3BsaXQoXCJcIikpO0NhW2NdPWQ7Zm9yKHZhciBlPTA7ZTxkLmxlbmd0aDtlKyspe3ZhciBnPWRbZV07dm9pZCAwPT09TFtnXSYmKExbZ109ZSl9fX19O3ZhciBIYT1cImZ1bmN0aW9uXCI9PT10eXBlb2YgVWludDhBcnJheTtmdW5jdGlvbiBJYShhKXtyZXR1cm4gSGEmJm51bGwhPWEmJmEgaW5zdGFuY2VvZiBVaW50OEFycmF5fXZhciBKYTtmdW5jdGlvbiBLYShhKXt0aGlzLkw9YTtpZihudWxsIT09YSYmMD09PWEubGVuZ3RoKXRocm93IEVycm9yKFwiQnl0ZVN0cmluZyBzaG91bGQgYmUgY29uc3RydWN0ZWQgd2l0aCBub24tZW1wdHkgdmFsdWVzXCIpO307dmFyIExhPVwiZnVuY3Rpb25cIj09PXR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5zbGljZSxNPTAsTj0wO1xuZnVuY3Rpb24gTWEoYSxiKXtpZihhLmNvbnN0cnVjdG9yPT09VWludDhBcnJheSlyZXR1cm4gYTtpZihhLmNvbnN0cnVjdG9yPT09QXJyYXlCdWZmZXIpcmV0dXJuIG5ldyBVaW50OEFycmF5KGEpO2lmKGEuY29uc3RydWN0b3I9PT1BcnJheSlyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYSk7aWYoYS5jb25zdHJ1Y3Rvcj09PVN0cmluZylyZXR1cm4gRmEoYSk7aWYoYS5jb25zdHJ1Y3Rvcj09PUthKXtpZighYiYmKGI9YS5MKSYmYi5jb25zdHJ1Y3Rvcj09PVVpbnQ4QXJyYXkpcmV0dXJuIGI7Yj1hLkw7Yj1udWxsPT1ifHxJYShiKT9iOlwic3RyaW5nXCI9PT10eXBlb2YgYj9GYShiKTpudWxsO3JldHVybihhPWEuTD1iKT9uZXcgVWludDhBcnJheShhKTpKYXx8KEphPW5ldyBVaW50OEFycmF5KDApKX1pZihhIGluc3RhbmNlb2YgVWludDhBcnJheSlyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYS5idWZmZXIsYS5ieXRlT2Zmc2V0LGEuYnl0ZUxlbmd0aCk7dGhyb3cgRXJyb3IoXCJUeXBlIG5vdCBjb252ZXJ0aWJsZSB0byBhIFVpbnQ4QXJyYXksIGV4cGVjdGVkIGEgVWludDhBcnJheSwgYW4gQXJyYXlCdWZmZXIsIGEgYmFzZTY0IGVuY29kZWQgc3RyaW5nLCBvciBBcnJheSBvZiBudW1iZXJzXCIpO1xufTtmdW5jdGlvbiBOYShhLGIpe3JldHVybiBFcnJvcihcIkludmFsaWQgd2lyZSB0eXBlOiBcIithK1wiIChhdCBwb3NpdGlvbiBcIitiK1wiKVwiKX1mdW5jdGlvbiBPYSgpe3JldHVybiBFcnJvcihcIkZhaWxlZCB0byByZWFkIHZhcmludCwgZW5jb2RpbmcgaXMgaW52YWxpZC5cIil9O2Z1bmN0aW9uIFBhKGEsYil7Yj12b2lkIDA9PT1iP3t9OmI7Yj12b2lkIDA9PT1iLnY/ITE6Yi52O3RoaXMuaD1udWxsO3RoaXMuZz10aGlzLmk9dGhpcy5qPTA7dGhpcy52PWI7YSYmUWEodGhpcyxhKX1mdW5jdGlvbiBRYShhLGIpe2EuaD1NYShiLGEudik7YS5qPTA7YS5pPWEuaC5sZW5ndGg7YS5nPWEuan1QYS5wcm90b3R5cGUucmVzZXQ9ZnVuY3Rpb24oKXt0aGlzLmc9dGhpcy5qfTtmdW5jdGlvbiBPKGEpe2lmKGEuZz5hLmkpdGhyb3cgRXJyb3IoXCJUcmllZCB0byByZWFkIHBhc3QgdGhlIGVuZCBvZiB0aGUgZGF0YSBcIithLmcrXCIgPiBcIithLmkpO31cbmZ1bmN0aW9uIFEoYSl7dmFyIGI9YS5oLGM9YlthLmddLGQ9YyYxMjc7aWYoMTI4PmMpcmV0dXJuIGEuZys9MSxPKGEpLGQ7Yz1iW2EuZysxXTtkfD0oYyYxMjcpPDw3O2lmKDEyOD5jKXJldHVybiBhLmcrPTIsTyhhKSxkO2M9YlthLmcrMl07ZHw9KGMmMTI3KTw8MTQ7aWYoMTI4PmMpcmV0dXJuIGEuZys9MyxPKGEpLGQ7Yz1iW2EuZyszXTtkfD0oYyYxMjcpPDwyMTtpZigxMjg+YylyZXR1cm4gYS5nKz00LE8oYSksZDtjPWJbYS5nKzRdO2EuZys9NTtkfD0oYyYxNSk8PDI4O2lmKDEyOD5jKXJldHVybiBPKGEpLGQ7aWYoMTI4PD1iW2EuZysrXSYmMTI4PD1iW2EuZysrXSYmMTI4PD1iW2EuZysrXSYmMTI4PD1iW2EuZysrXSYmMTI4PD1iW2EuZysrXSl0aHJvdyBPYSgpO08oYSk7cmV0dXJuIGR9dmFyIFJhPVtdO2Z1bmN0aW9uIFNhKCl7dGhpcy5nPVtdfVNhLnByb3RvdHlwZS5sZW5ndGg9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nLmxlbmd0aH07U2EucHJvdG90eXBlLmVuZD1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZzt0aGlzLmc9W107cmV0dXJuIGF9O2Z1bmN0aW9uIFIoYSxiKXtmb3IoOzEyNzxiOylhLmcucHVzaChiJjEyN3wxMjgpLGI+Pj49NzthLmcucHVzaChiKX07ZnVuY3Rpb24gVGEoYSl7dmFyIGI9e30sYz12b2lkIDA9PT1iLlc/ITE6Yi5XO3RoaXMubD17djp2b2lkIDA9PT1iLnY/ITE6Yi52fTt0aGlzLlc9YztiPXRoaXMubDtSYS5sZW5ndGg/KGM9UmEucG9wKCksYiYmKGMudj1iLnYpLGEmJlFhKGMsYSksYT1jKTphPW5ldyBQYShhLGIpO3RoaXMuZz1hO3RoaXMuaj10aGlzLmcuZzt0aGlzLmg9dGhpcy5pPS0xfVRhLnByb3RvdHlwZS5yZXNldD1mdW5jdGlvbigpe3RoaXMuZy5yZXNldCgpO3RoaXMuaj10aGlzLmcuZzt0aGlzLmg9dGhpcy5pPS0xfTtmdW5jdGlvbiBVYShhKXt2YXIgYj1hLmc7aWYoYi5nPT1iLmkpcmV0dXJuITE7YS5qPWEuZy5nO3ZhciBjPVEoYS5nKT4+PjA7Yj1jPj4+MztjJj03O2lmKCEoMDw9YyYmNT49YykpdGhyb3cgTmEoYyxhLmopO2lmKDE+Yil0aHJvdyBFcnJvcihcIkludmFsaWQgZmllbGQgbnVtYmVyOiBcIitiK1wiIChhdCBwb3NpdGlvbiBcIithLmorXCIpXCIpO2EuaT1iO2EuaD1jO3JldHVybiEwfVxuZnVuY3Rpb24gVmEoYSl7c3dpdGNoKGEuaCl7Y2FzZSAwOmlmKDAhPWEuaClWYShhKTtlbHNlIGE6e2E9YS5nO2Zvcih2YXIgYj1hLmcsYz1iKzEwO2I8YzspaWYoMD09PShhLmhbYisrXSYxMjgpKXthLmc9YjtPKGEpO2JyZWFrIGF9dGhyb3cgT2EoKTt9YnJlYWs7Y2FzZSAxOmE9YS5nO2EuZys9ODtPKGEpO2JyZWFrO2Nhc2UgMjoyIT1hLmg/VmEoYSk6KGI9UShhLmcpPj4+MCxhPWEuZyxhLmcrPWIsTyhhKSk7YnJlYWs7Y2FzZSA1OmE9YS5nO2EuZys9NDtPKGEpO2JyZWFrO2Nhc2UgMzpiPWEuaTtkb3tpZighVWEoYSkpdGhyb3cgRXJyb3IoXCJVbm1hdGNoZWQgc3RhcnQtZ3JvdXAgdGFnOiBzdHJlYW0gRU9GXCIpO2lmKDQ9PWEuaCl7aWYoYS5pIT1iKXRocm93IEVycm9yKFwiVW5tYXRjaGVkIGVuZC1ncm91cCB0YWdcIik7YnJlYWt9VmEoYSl9d2hpbGUoMSk7YnJlYWs7ZGVmYXVsdDp0aHJvdyBOYShhLmgsYS5qKTt9fXZhciBXYT1bXTtmdW5jdGlvbiBYYSgpe3RoaXMuaT1bXTt0aGlzLmg9MDt0aGlzLmc9bmV3IFNhfWZ1bmN0aW9uIFMoYSxiKXswIT09Yi5sZW5ndGgmJihhLmkucHVzaChiKSxhLmgrPWIubGVuZ3RoKX1mdW5jdGlvbiBZYShhLGIpe2lmKGI9Yi5jYSl7UyhhLGEuZy5lbmQoKSk7Zm9yKHZhciBjPTA7YzxiLmxlbmd0aDtjKyspUyhhLGJbY10pfX07dmFyIFQ9XCJmdW5jdGlvblwiPT09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09PXR5cGVvZiBTeW1ib2woKT9TeW1ib2wodm9pZCAwKTp2b2lkIDA7ZnVuY3Rpb24gWmEoYSxiKXtPYmplY3QuaXNGcm96ZW4oYSl8fChUP2FbVF18PWI6dm9pZCAwIT09YS5OP2EuTnw9YjpPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhLHtOOnt2YWx1ZTpiLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMCxlbnVtZXJhYmxlOiExfX0pKX1mdW5jdGlvbiAkYShhKXt2YXIgYjtUP2I9YVtUXTpiPWEuTjtyZXR1cm4gbnVsbD09Yj8wOmJ9ZnVuY3Rpb24gVShhKXtaYShhLDEpO3JldHVybiBhfWZ1bmN0aW9uIGFiKGEpe3JldHVybiBBcnJheS5pc0FycmF5KGEpPyEhKCRhKGEpJjIpOiExfWZ1bmN0aW9uIGJiKGEpe2lmKCFBcnJheS5pc0FycmF5KGEpKXRocm93IEVycm9yKFwiY2Fubm90IG1hcmsgbm9uLWFycmF5IGFzIGltbXV0YWJsZVwiKTtaYShhLDIpfTtmdW5jdGlvbiBjYihhKXtyZXR1cm4gbnVsbCE9PWEmJlwib2JqZWN0XCI9PT10eXBlb2YgYSYmIUFycmF5LmlzQXJyYXkoYSkmJmEuY29uc3RydWN0b3I9PT1PYmplY3R9dmFyIGRiPU9iamVjdC5mcmVlemUoVShbXSkpO2Z1bmN0aW9uIGViKGEpe2lmKGFiKGEubSkpdGhyb3cgRXJyb3IoXCJDYW5ub3QgbXV0YXRlIGFuIGltbXV0YWJsZSBNZXNzYWdlXCIpO312YXIgZmI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbC5oYXNJbnN0YW5jZTtmdW5jdGlvbiBnYihhKXtyZXR1cm57dmFsdWU6YSxjb25maWd1cmFibGU6ITEsd3JpdGFibGU6ITEsZW51bWVyYWJsZTohMX19O2Z1bmN0aW9uIFYoYSxiLGMpe3JldHVybi0xPT09Yj9udWxsOmI+PWEuaT9hLmc/YS5nW2JdOnZvaWQgMDoodm9pZCAwPT09Yz8wOmMpJiZhLmcmJihjPWEuZ1tiXSxudWxsIT1jKT9jOmEubVtiK2EuaF19ZnVuY3Rpb24gVyhhLGIsYyxkKXtkPXZvaWQgMD09PWQ/ITE6ZDtlYihhKTtiPGEuaSYmIWQ/YS5tW2IrYS5oXT1jOihhLmd8fChhLmc9YS5tW2EuaSthLmhdPXt9KSlbYl09Y31mdW5jdGlvbiBoYihhLGIsYyxkKXtjPXZvaWQgMD09PWM/ITA6YztkPXZvaWQgMD09PWQ/ITE6ZDt2YXIgZT1WKGEsYixkKTtudWxsPT1lJiYoZT1kYik7aWYoYWIoYS5tKSljJiYoYmIoZSksT2JqZWN0LmZyZWV6ZShlKSk7ZWxzZSBpZihlPT09ZGJ8fGFiKGUpKWU9VShlLnNsaWNlKCkpLFcoYSxiLGUsZCk7cmV0dXJuIGV9ZnVuY3Rpb24gWChhLGIsYyl7YT1WKGEsYik7YT1udWxsPT1hP2E6K2E7cmV0dXJuIG51bGw9PWE/dm9pZCAwPT09Yz8wOmM6YX1cbmZ1bmN0aW9uIGliKGEsYixjLGQpe2Euanx8KGEuaj17fSk7dmFyIGU9YWIoYS5tKSxnPWEualtjXTtpZighZyl7ZD1oYihhLGMsITAsdm9pZCAwPT09ZD8hMTpkKTtnPVtdO2U9ZXx8YWIoZCk7Zm9yKHZhciBmPTA7ZjxkLmxlbmd0aDtmKyspZ1tmXT1uZXcgYihkW2ZdKSxlJiZiYihnW2ZdLm0pO2UmJihiYihnKSxPYmplY3QuZnJlZXplKGcpKTthLmpbY109Z31yZXR1cm4gZ31mdW5jdGlvbiBqYihhLGIsYyxkLGUpe3ZhciBnPXZvaWQgMD09PWc/ITE6ZztlYihhKTtnPWliKGEsYyxiLGcpO2M9ZD9kOm5ldyBjO2E9aGIoYSxiKTt2b2lkIDAhPWU/KGcuc3BsaWNlKGUsMCxjKSxhLnNwbGljZShlLDAsYy5tKSk6KGcucHVzaChjKSxhLnB1c2goYy5tKSk7cmV0dXJuIGN9ZnVuY3Rpb24ga2IoYSxiKXthPVYoYSxiKTtyZXR1cm4gbnVsbD09YT8wOmF9ZnVuY3Rpb24gbGIoYSxiKXthPVYoYSxiKTtyZXR1cm4gbnVsbD09YT9cIlwiOmF9O2Z1bmN0aW9uIG1iKGEpe3N3aXRjaCh0eXBlb2YgYSl7Y2FzZSBcIm51bWJlclwiOnJldHVybiBpc0Zpbml0ZShhKT9hOlN0cmluZyhhKTtjYXNlIFwib2JqZWN0XCI6aWYoYSYmIUFycmF5LmlzQXJyYXkoYSkpe2lmKElhKGEpKXJldHVybiBEYShhKTtpZihhIGluc3RhbmNlb2YgS2Epe3ZhciBiPWEuTDtiPW51bGw9PWJ8fFwic3RyaW5nXCI9PT10eXBlb2YgYj9iOkhhJiZiIGluc3RhbmNlb2YgVWludDhBcnJheT9EYShiKTpudWxsO3JldHVybihhLkw9Yil8fFwiXCJ9fX1yZXR1cm4gYX07ZnVuY3Rpb24gbmIoYSl7dmFyIGI9b2I7Yj12b2lkIDA9PT1iP3BiOmI7cmV0dXJuIHFiKGEsYil9ZnVuY3Rpb24gcmIoYSxiKXtpZihudWxsIT1hKXtpZihBcnJheS5pc0FycmF5KGEpKWE9cWIoYSxiKTtlbHNlIGlmKGNiKGEpKXt2YXIgYz17fSxkO2ZvcihkIGluIGEpY1tkXT1yYihhW2RdLGIpO2E9Y31lbHNlIGE9YihhKTtyZXR1cm4gYX19ZnVuY3Rpb24gcWIoYSxiKXtmb3IodmFyIGM9YS5zbGljZSgpLGQ9MDtkPGMubGVuZ3RoO2QrKyljW2RdPXJiKGNbZF0sYik7QXJyYXkuaXNBcnJheShhKSYmJGEoYSkmMSYmVShjKTtyZXR1cm4gY31mdW5jdGlvbiBvYihhKXtpZihhJiZcIm9iamVjdFwiPT10eXBlb2YgYSYmYS50b0pTT04pcmV0dXJuIGEudG9KU09OKCk7YT1tYihhKTtyZXR1cm4gQXJyYXkuaXNBcnJheShhKT9uYihhKTphfWZ1bmN0aW9uIHBiKGEpe3JldHVybiBJYShhKT9uZXcgVWludDhBcnJheShhKTphfTtmdW5jdGlvbiBzYihhLGIsYyl7YXx8KGE9dGIpO3RiPW51bGw7dmFyIGQ9dGhpcy5jb25zdHJ1Y3Rvci5oO2F8fChhPWQ/W2RdOltdKTt0aGlzLmg9KGQ/MDotMSktKHRoaXMuY29uc3RydWN0b3IuZ3x8MCk7dGhpcy5qPXZvaWQgMDt0aGlzLm09YTthOntkPXRoaXMubS5sZW5ndGg7YT1kLTE7aWYoZCYmKGQ9dGhpcy5tW2FdLGNiKGQpKSl7dGhpcy5pPWEtdGhpcy5oO3RoaXMuZz1kO2JyZWFrIGF9dm9pZCAwIT09YiYmLTE8Yj8odGhpcy5pPU1hdGgubWF4KGIsYSsxLXRoaXMuaCksdGhpcy5nPXZvaWQgMCk6dGhpcy5pPU51bWJlci5NQVhfVkFMVUV9aWYoYylmb3IoYj0wO2I8Yy5sZW5ndGg7YisrKWlmKGE9Y1tiXSxhPHRoaXMuaSlhKz10aGlzLmgsKGQ9dGhpcy5tW2FdKT9BcnJheS5pc0FycmF5KGQpJiZVKGQpOnRoaXMubVthXT1kYjtlbHNle2Q9dGhpcy5nfHwodGhpcy5nPXRoaXMubVt0aGlzLmkrdGhpcy5oXT17fSk7dmFyIGU9ZFthXTtlP0FycmF5LmlzQXJyYXkoZSkmJlUoZSk6XG5kW2FdPWRifX1zYi5wcm90b3R5cGUudG9KU09OPWZ1bmN0aW9uKCl7cmV0dXJuIG5iKHRoaXMubSl9O3NiLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLm0udG9TdHJpbmcoKX07dmFyIHRiO2Z1bmN0aW9uIHViKCl7c2IuYXBwbHkodGhpcyxhcmd1bWVudHMpfUQodWIsc2IpO2lmKGZiKXt2YXIgdmI9e307T2JqZWN0LmRlZmluZVByb3BlcnRpZXModWIsKHZiW1N5bWJvbC5oYXNJbnN0YW5jZV09Z2IoZnVuY3Rpb24oKXt0aHJvdyBFcnJvcihcIkNhbm5vdCBwZXJmb3JtIGluc3RhbmNlb2YgY2hlY2tzIGZvciBNdXRhYmxlTWVzc2FnZVwiKTt9KSx2YikpfTtmdW5jdGlvbiB3YihhLGIsYyl7aWYoYyl7dmFyIGQ9e30sZTtmb3IoZSBpbiBjKXt2YXIgZz1jW2VdLGY9Zy5qYTtmfHwoZC5GPWcucGF8fGcuaGEuUCxnLmJhPyhkLlU9eGIoZy5iYSksZj1mdW5jdGlvbihoKXtyZXR1cm4gZnVuY3Rpb24oayxsLG0pe3JldHVybiBoLkYoayxsLG0saC5VKX19KGQpKTpnLmRhPyhkLlQ9eWIoZy5YLmcsZy5kYSksZj1mdW5jdGlvbihoKXtyZXR1cm4gZnVuY3Rpb24oayxsLG0pe3JldHVybiBoLkYoayxsLG0saC5UKX19KGQpKTpmPWQuRixnLmphPWYpO2YoYixhLGcuWCk7ZD17RjpkLkYsVTpkLlUsVDpkLlR9fX1ZYShiLGEpfXZhciB6Yj1TeW1ib2woKTtmdW5jdGlvbiBBYihhLGIsYyl7cmV0dXJuIGFbemJdfHwoYVt6Yl09ZnVuY3Rpb24oZCxlKXtyZXR1cm4gYihkLGUsYyl9KX1cbmZ1bmN0aW9uIEJiKGEpe3ZhciBiPWFbemJdO2lmKCFiKXt2YXIgYz1DYihhKTtiPWZ1bmN0aW9uKGQsZSl7cmV0dXJuIERiKGQsZSxjKX07YVt6Yl09Yn1yZXR1cm4gYn1mdW5jdGlvbiBFYihhKXt2YXIgYj1hLmJhO2lmKGIpcmV0dXJuIEJiKGIpO2lmKGI9YS5vYSlyZXR1cm4gQWIoYS5YLmcsYixhLmRhKX1mdW5jdGlvbiBGYihhKXt2YXIgYj1FYihhKSxjPWEuWCxkPWEuaGEuTztyZXR1cm4gYj9mdW5jdGlvbihlLGcpe3JldHVybiBkKGUsZyxjLGIpfTpmdW5jdGlvbihlLGcpe3JldHVybiBkKGUsZyxjKX19XG5mdW5jdGlvbiBHYihhLGIsYyxkLGUsZyl7YT1hKCk7dmFyIGY9MDthLmxlbmd0aCYmXCJudW1iZXJcIiE9PXR5cGVvZiBhWzBdJiYoYyhiLGFbMF0pLGYrKyk7Zm9yKDtmPGEubGVuZ3RoOyl7Yz1hW2YrK107Zm9yKHZhciBoPWYrMTtoPGEubGVuZ3RoJiZcIm51bWJlclwiIT09dHlwZW9mIGFbaF07KWgrKzt2YXIgaz1hW2YrK107aC09Zjtzd2l0Y2goaCl7Y2FzZSAwOmQoYixjLGspO2JyZWFrO2Nhc2UgMTpkKGIsYyxrLGFbZisrXSk7YnJlYWs7Y2FzZSAyOmUoYixjLGssYVtmKytdLGFbZisrXSk7YnJlYWs7Y2FzZSAzOmg9YVtmKytdO3ZhciBsPWFbZisrXSxtPWFbZisrXTtBcnJheS5pc0FycmF5KG0pP2UoYixjLGssaCxsLG0pOmcoYixjLGssaCxsLG0pO2JyZWFrO2Nhc2UgNDpnKGIsYyxrLGFbZisrXSxhW2YrK10sYVtmKytdLGFbZisrXSk7YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcInVuZXhwZWN0ZWQgbnVtYmVyIG9mIGJpbmFyeSBmaWVsZCBhcmd1bWVudHM6IFwiK2gpO319cmV0dXJuIGJ9XG52YXIgSGI9U3ltYm9sKCk7ZnVuY3Rpb24geGIoYSl7dmFyIGI9YVtIYl07aWYoIWIpe3ZhciBjPUliKGEpO2I9ZnVuY3Rpb24oZCxlKXtyZXR1cm4gSmIoZCxlLGMpfTthW0hiXT1ifXJldHVybiBifWZ1bmN0aW9uIHliKGEsYil7dmFyIGM9YVtIYl07Y3x8KGM9ZnVuY3Rpb24oZCxlKXtyZXR1cm4gd2IoZCxlLGIpfSxhW0hiXT1jKTtyZXR1cm4gY312YXIgS2I9U3ltYm9sKCk7ZnVuY3Rpb24gTGIoYSxiKXthLnB1c2goYil9ZnVuY3Rpb24gTWIoYSxiLGMpe2EucHVzaChiLGMuUCl9ZnVuY3Rpb24gTmIoYSxiLGMsZCxlKXt2YXIgZz14YihlKSxmPWMuUDthLnB1c2goYixmdW5jdGlvbihoLGssbCl7cmV0dXJuIGYoaCxrLGwsZCxnKX0pfWZ1bmN0aW9uIE9iKGEsYixjLGQsZSxnKXt2YXIgZj15YihkLGcpLGg9Yy5QO2EucHVzaChiLGZ1bmN0aW9uKGssbCxtKXtyZXR1cm4gaChrLGwsbSxkLGYpfSl9XG5mdW5jdGlvbiBJYihhKXt2YXIgYj1hW0tiXTtyZXR1cm4gYj9iOkdiKGEsYVtLYl09W10sTGIsTWIsTmIsT2IpfXZhciBQYj1TeW1ib2woKTtmdW5jdGlvbiBRYihhLGIpe2FbMF09Yn1mdW5jdGlvbiBSYihhLGIsYyxkKXt2YXIgZT1jLk87YVtiXT1kP2Z1bmN0aW9uKGcsZixoKXtyZXR1cm4gZShnLGYsaCxkKX06ZX1mdW5jdGlvbiBTYihhLGIsYyxkLGUsZyl7dmFyIGY9Yy5PLGg9QmIoZSk7YVtiXT1mdW5jdGlvbihrLGwsbSl7cmV0dXJuIGYoayxsLG0sZCxoLGcpfX1mdW5jdGlvbiBUYihhLGIsYyxkLGUsZyxmKXt2YXIgaD1jLk8saz1BYihkLGUsZyk7YVtiXT1mdW5jdGlvbihsLG0scil7cmV0dXJuIGgobCxtLHIsZCxrLGYpfX1mdW5jdGlvbiBDYihhKXt2YXIgYj1hW1BiXTtyZXR1cm4gYj9iOkdiKGEsYVtQYl09e30sUWIsUmIsU2IsVGIpfVxuZnVuY3Rpb24gRGIoYSxiLGMpe2Zvcig7VWEoYikmJjQhPWIuaDspe3ZhciBkPWIuaSxlPWNbZF07aWYoIWUpe3ZhciBnPWNbMF07ZyYmKGc9Z1tkXSkmJihlPWNbZF09RmIoZykpfWlmKCFlfHwhZShiLGEsZCkpaWYoZT1iLGQ9YSxnPWUuaixWYShlKSwhZS5XKXt2YXIgZj1lLmcuaDtlPWUuZy5nO2U9Zz09PWU/SmF8fChKYT1uZXcgVWludDhBcnJheSgwKSk6TGE/Zi5zbGljZShnLGUpOm5ldyBVaW50OEFycmF5KGYuc3ViYXJyYXkoZyxlKSk7KGc9ZC5jYSk/Zy5wdXNoKGUpOmQuY2E9W2VdfX1yZXR1cm4gYX1cbmZ1bmN0aW9uIFViKGEsYixjKXtpZihXYS5sZW5ndGgpe3ZhciBkPVdhLnBvcCgpO2EmJihRYShkLmcsYSksZC5pPS0xLGQuaD0tMSk7YT1kfWVsc2UgYT1uZXcgVGEoYSk7dHJ5e3JldHVybiBEYihuZXcgYixhLENiKGMpKX1maW5hbGx5e2I9YS5nLGIuaD1udWxsLGIuaj0wLGIuaT0wLGIuZz0wLGIudj0hMSxhLmk9LTEsYS5oPS0xLDEwMD5XYS5sZW5ndGgmJldhLnB1c2goYSl9fWZ1bmN0aW9uIEpiKGEsYixjKXtmb3IodmFyIGQ9Yy5sZW5ndGgsZT0xPT1kJTIsZz1lPzE6MDtnPGQ7Zys9MikoMCxjW2crMV0pKGIsYSxjW2ddKTt3YihhLGIsZT9jWzBdOnZvaWQgMCl9ZnVuY3Rpb24gVmIoYSxiKXt2YXIgYz1uZXcgWGE7SmIoYSxjLEliKGIpKTtTKGMsYy5nLmVuZCgpKTthPW5ldyBVaW50OEFycmF5KGMuaCk7Yj1jLmk7Zm9yKHZhciBkPWIubGVuZ3RoLGU9MCxnPTA7ZzxkO2crKyl7dmFyIGY9YltnXTthLnNldChmLGUpO2UrPWYubGVuZ3RofWMuaT1bYV07cmV0dXJuIGF9XG5mdW5jdGlvbiBXYihhLGIpe3JldHVybntPOmEsUDpifX1cbnZhciBZPVdiKGZ1bmN0aW9uKGEsYixjKXtpZig1IT09YS5oKXJldHVybiExO2E9YS5nO3ZhciBkPWEuaFthLmddO3ZhciBlPWEuaFthLmcrMV07dmFyIGc9YS5oW2EuZysyXSxmPWEuaFthLmcrM107YS5nKz00O08oYSk7ZT0oZDw8MHxlPDw4fGc8PDE2fGY8PDI0KT4+PjA7YT0yKihlPj4zMSkrMTtkPWU+Pj4yMyYyNTU7ZSY9ODM4ODYwNztXKGIsYywyNTU9PWQ/ZT9OYU46SW5maW5pdHkqYTowPT1kP2EqTWF0aC5wb3coMiwtMTQ5KSplOmEqTWF0aC5wb3coMixkLTE1MCkqKGUrTWF0aC5wb3coMiwyMykpKTtyZXR1cm4hMH0sZnVuY3Rpb24oYSxiLGMpe2I9VihiLGMpO2lmKG51bGwhPWIpe1IoYS5nLDgqYys1KTthPWEuZzt2YXIgZD1iO2Q9KGM9MD5kPzE6MCk/LWQ6ZDswPT09ZD8wPDEvZD9NPU49MDooTj0wLE09MjE0NzQ4MzY0OCk6aXNOYU4oZCk/KE49MCxNPTIxNDc0ODM2NDcpOjMuNDAyODIzNDY2Mzg1Mjg4NkUzODxkPyhOPTAsTT0oYzw8MzF8MjEzOTA5NTA0MCk+Pj4wKTpcbjEuMTc1NDk0MzUwODIyMjg3NUUtMzg+ZD8oZD1NYXRoLnJvdW5kKGQvTWF0aC5wb3coMiwtMTQ5KSksTj0wLE09KGM8PDMxfGQpPj4+MCk6KGI9TWF0aC5mbG9vcihNYXRoLmxvZyhkKS9NYXRoLkxOMiksZCo9TWF0aC5wb3coMiwtYiksZD1NYXRoLnJvdW5kKDgzODg2MDgqZCksMTY3NzcyMTY8PWQmJisrYixOPTAsTT0oYzw8MzF8YisxMjc8PDIzfGQmODM4ODYwNyk+Pj4wKTtjPU07YS5nLnB1c2goYz4+PjAmMjU1KTthLmcucHVzaChjPj4+OCYyNTUpO2EuZy5wdXNoKGM+Pj4xNiYyNTUpO2EuZy5wdXNoKGM+Pj4yNCYyNTUpfX0pLFhiPVdiKGZ1bmN0aW9uKGEsYixjKXtpZigwIT09YS5oKXJldHVybiExO2Zvcih2YXIgZD1hLmcsZT0xMjgsZz0wLGY9YT0wOzQ+ZiYmMTI4PD1lO2YrKyllPWQuaFtkLmcrK10sTyhkKSxnfD0oZSYxMjcpPDw3KmY7MTI4PD1lJiYoZT1kLmhbZC5nKytdLE8oZCksZ3w9KGUmMTI3KTw8MjgsYXw9KGUmMTI3KT4+NCk7aWYoMTI4PD1lKWZvcihmPTA7NT5cbmYmJjEyODw9ZTtmKyspZT1kLmhbZC5nKytdLE8oZCksYXw9KGUmMTI3KTw8NypmKzM7aWYoMTI4PmUpe2Q9Zz4+PjA7ZT1hPj4+MDtpZihhPWUmMjE0NzQ4MzY0OClkPX5kKzE+Pj4wLGU9fmU+Pj4wLDA9PWQmJihlPWUrMT4+PjApO2Q9NDI5NDk2NzI5NiplKyhkPj4+MCl9ZWxzZSB0aHJvdyBPYSgpO1coYixjLGE/LWQ6ZCk7cmV0dXJuITB9LGZ1bmN0aW9uKGEsYixjKXtiPVYoYixjKTtpZihudWxsIT1iJiZudWxsIT1iKXtSKGEuZyw4KmMpO2E9YS5nO3ZhciBkPWI7Yz0wPmQ7ZD1NYXRoLmFicyhkKTtiPWQ+Pj4wO2Q9TWF0aC5mbG9vcigoZC1iKS80Mjk0OTY3Mjk2KTtkPj4+PTA7YyYmKGQ9fmQ+Pj4wLGI9KH5iPj4+MCkrMSw0Mjk0OTY3Mjk1PGImJihiPTAsZCsrLDQyOTQ5NjcyOTU8ZCYmKGQ9MCkpKTtNPWI7Tj1kO2M9TTtmb3IoYj1OOzA8Ynx8MTI3PGM7KWEuZy5wdXNoKGMmMTI3fDEyOCksYz0oYz4+Pjd8Yjw8MjUpPj4+MCxiPj4+PTc7YS5nLnB1c2goYyl9fSksWWI9V2IoZnVuY3Rpb24oYSxcbmIsYyl7aWYoMCE9PWEuaClyZXR1cm4hMTtXKGIsYyxRKGEuZykpO3JldHVybiEwfSxmdW5jdGlvbihhLGIsYyl7Yj1WKGIsYyk7aWYobnVsbCE9YiYmbnVsbCE9YilpZihSKGEuZyw4KmMpLGE9YS5nLGM9YiwwPD1jKVIoYSxjKTtlbHNle2ZvcihiPTA7OT5iO2IrKylhLmcucHVzaChjJjEyN3wxMjgpLGM+Pj03O2EuZy5wdXNoKDEpfX0pLFpiPVdiKGZ1bmN0aW9uKGEsYixjKXtpZigyIT09YS5oKXJldHVybiExO3ZhciBkPVEoYS5nKT4+PjA7YT1hLmc7dmFyIGU9YS5nO2EuZys9ZDtPKGEpO2E9YS5oO3ZhciBnO2lmKHphKShnPXlhKXx8KGc9eWE9bmV3IFRleHREZWNvZGVyKFwidXRmLThcIix7ZmF0YWw6ITB9KSksZz1nLmRlY29kZShhLnN1YmFycmF5KGUsZStkKSk7ZWxzZXtkPWUrZDtmb3IodmFyIGY9W10saD1udWxsLGssbCxtO2U8ZDspaz1hW2UrK10sMTI4Pms/Zi5wdXNoKGspOjIyND5rP2U+PWQ/SygpOihsPWFbZSsrXSwxOTQ+a3x8MTI4IT09KGwmMTkyKT8oZS0tLEsoKSk6XG5mLnB1c2goKGsmMzEpPDw2fGwmNjMpKToyNDA+az9lPj1kLTE/SygpOihsPWFbZSsrXSwxMjghPT0obCYxOTIpfHwyMjQ9PT1rJiYxNjA+bHx8MjM3PT09ayYmMTYwPD1sfHwxMjghPT0oKGc9YVtlKytdKSYxOTIpPyhlLS0sSygpKTpmLnB1c2goKGsmMTUpPDwxMnwobCY2Myk8PDZ8ZyY2MykpOjI0ND49az9lPj1kLTI/SygpOihsPWFbZSsrXSwxMjghPT0obCYxOTIpfHwwIT09KGs8PDI4KSsobC0xNDQpPj4zMHx8MTI4IT09KChnPWFbZSsrXSkmMTkyKXx8MTI4IT09KChtPWFbZSsrXSkmMTkyKT8oZS0tLEsoKSk6KGs9KGsmNyk8PDE4fChsJjYzKTw8MTJ8KGcmNjMpPDw2fG0mNjMsay09NjU1MzYsZi5wdXNoKChrPj4xMCYxMDIzKSs1NTI5NiwoayYxMDIzKSs1NjMyMCkpKTpLKCksODE5Mjw9Zi5sZW5ndGgmJihoPXhhKGgsZiksZi5sZW5ndGg9MCk7Zz14YShoLGYpfVcoYixjLGcpO3JldHVybiEwfSxmdW5jdGlvbihhLGIsYyl7Yj1WKGIsYyk7aWYobnVsbCE9Yil7dmFyIGQ9ITE7XG5kPXZvaWQgMD09PWQ/ITE6ZDtpZihCYSl7aWYoZCYmLyg/OlteXFx1RDgwMC1cXHVEQkZGXXxeKVtcXHVEQzAwLVxcdURGRkZdfFtcXHVEODAwLVxcdURCRkZdKD8hW1xcdURDMDAtXFx1REZGRl0pLy50ZXN0KGIpKXRocm93IEVycm9yKFwiRm91bmQgYW4gdW5wYWlyZWQgc3Vycm9nYXRlXCIpO2I9KEFhfHwoQWE9bmV3IFRleHRFbmNvZGVyKSkuZW5jb2RlKGIpfWVsc2V7Zm9yKHZhciBlPTAsZz1uZXcgVWludDhBcnJheSgzKmIubGVuZ3RoKSxmPTA7ZjxiLmxlbmd0aDtmKyspe3ZhciBoPWIuY2hhckNvZGVBdChmKTtpZigxMjg+aClnW2UrK109aDtlbHNle2lmKDIwNDg+aClnW2UrK109aD4+NnwxOTI7ZWxzZXtpZig1NTI5Njw9aCYmNTczNDM+PWgpe2lmKDU2MzE5Pj1oJiZmPGIubGVuZ3RoKXt2YXIgaz1iLmNoYXJDb2RlQXQoKytmKTtpZig1NjMyMDw9ayYmNTczNDM+PWspe2g9MTAyNCooaC01NTI5Nikray01NjMyMCs2NTUzNjtnW2UrK109aD4+MTh8MjQwO2dbZSsrXT1oPj4xMiY2M3wxMjg7XG5nW2UrK109aD4+NiY2M3wxMjg7Z1tlKytdPWgmNjN8MTI4O2NvbnRpbnVlfWVsc2UgZi0tfWlmKGQpdGhyb3cgRXJyb3IoXCJGb3VuZCBhbiB1bnBhaXJlZCBzdXJyb2dhdGVcIik7aD02NTUzM31nW2UrK109aD4+MTJ8MjI0O2dbZSsrXT1oPj42JjYzfDEyOH1nW2UrK109aCY2M3wxMjh9fWI9Zy5zdWJhcnJheSgwLGUpfVIoYS5nLDgqYysyKTtSKGEuZyxiLmxlbmd0aCk7UyhhLGEuZy5lbmQoKSk7UyhhLGIpfX0pLCRiPVdiKGZ1bmN0aW9uKGEsYixjLGQsZSl7aWYoMiE9PWEuaClyZXR1cm4hMTtiPWpiKGIsYyxkKTtjPWEuZy5pO2Q9UShhLmcpPj4+MDt2YXIgZz1hLmcuZytkLGY9Zy1jOzA+PWYmJihhLmcuaT1nLGUoYixhKSxmPWctYS5nLmcpO2lmKGYpdGhyb3cgRXJyb3IoXCJNZXNzYWdlIHBhcnNpbmcgZW5kZWQgdW5leHBlY3RlZGx5LiBFeHBlY3RlZCB0byByZWFkIFwiKyhkK1wiIGJ5dGVzLCBpbnN0ZWFkIHJlYWQgXCIrKGQtZikrXCIgYnl0ZXMsIGVpdGhlciB0aGUgZGF0YSBlbmRlZCB1bmV4cGVjdGVkbHkgb3IgdGhlIG1lc3NhZ2UgbWlzcmVwb3J0ZWQgaXRzIG93biBsZW5ndGhcIikpO1xuYS5nLmc9ZzthLmcuaT1jO3JldHVybiEwfSxmdW5jdGlvbihhLGIsYyxkLGUpe2I9aWIoYixkLGMpO2lmKG51bGwhPWIpZm9yKGQ9MDtkPGIubGVuZ3RoO2QrKyl7dmFyIGc9YTtSKGcuZyw4KmMrMik7dmFyIGY9Zy5nLmVuZCgpO1MoZyxmKTtmLnB1c2goZy5oKTtnPWY7ZShiW2RdLGEpO2Y9YTt2YXIgaD1nLnBvcCgpO2ZvcihoPWYuaCtmLmcubGVuZ3RoKCktaDsxMjc8aDspZy5wdXNoKGgmMTI3fDEyOCksaD4+Pj03LGYuaCsrO2cucHVzaChoKTtmLmgrK319KTtmdW5jdGlvbiBaKCl7dWIuYXBwbHkodGhpcyxhcmd1bWVudHMpfUQoWix1Yik7aWYoZmIpe3ZhciBhYz17fTtPYmplY3QuZGVmaW5lUHJvcGVydGllcyhaLChhY1tTeW1ib2wuaGFzSW5zdGFuY2VdPWdiKE9iamVjdFtTeW1ib2wuaGFzSW5zdGFuY2VdKSxhYykpfTtmdW5jdGlvbiBiYyhhKXtaLmNhbGwodGhpcyxhKX1EKGJjLFopO2Z1bmN0aW9uIGNjKCl7cmV0dXJuWzEsWWIsMixZLDMsWmIsNCxaYl19O2Z1bmN0aW9uIGRjKGEpe1ouY2FsbCh0aGlzLGEsLTEsZWMpfUQoZGMsWik7ZGMucHJvdG90eXBlLmFkZENsYXNzaWZpY2F0aW9uPWZ1bmN0aW9uKGEsYil7amIodGhpcywxLGJjLGEsYik7cmV0dXJuIHRoaXN9O2Z1bmN0aW9uIGZjKCl7cmV0dXJuWzEsJGIsYmMsY2NdfXZhciBlYz1bMV07ZnVuY3Rpb24gZ2MoYSl7Wi5jYWxsKHRoaXMsYSl9RChnYyxaKTtmdW5jdGlvbiBoYygpe3JldHVyblsxLFksMixZLDMsWSw0LFksNSxZXX07ZnVuY3Rpb24gaWMoYSl7Wi5jYWxsKHRoaXMsYSwtMSxqYyl9RChpYyxaKTtmdW5jdGlvbiBrYygpe3JldHVyblsxLCRiLGdjLGhjXX12YXIgamM9WzFdO2Z1bmN0aW9uIGxjKGEpe1ouY2FsbCh0aGlzLGEpfUQobGMsWik7ZnVuY3Rpb24gbWMoKXtyZXR1cm5bMSxZLDIsWSwzLFksNCxZLDUsWSw2LFhiXX07ZnVuY3Rpb24gbmMoYSxiLGMpe2M9YS5jcmVhdGVTaGFkZXIoMD09PWM/YS5WRVJURVhfU0hBREVSOmEuRlJBR01FTlRfU0hBREVSKTthLnNoYWRlclNvdXJjZShjLGIpO2EuY29tcGlsZVNoYWRlcihjKTtpZighYS5nZXRTaGFkZXJQYXJhbWV0ZXIoYyxhLkNPTVBJTEVfU1RBVFVTKSl0aHJvdyBFcnJvcihcIkNvdWxkIG5vdCBjb21waWxlIFdlYkdMIHNoYWRlci5cXG5cXG5cIithLmdldFNoYWRlckluZm9Mb2coYykpO3JldHVybiBjfTtmdW5jdGlvbiBvYyhhKXtyZXR1cm4gaWIoYSxiYywxKS5tYXAoZnVuY3Rpb24oYil7cmV0dXJue2luZGV4OmtiKGIsMSksc2NvcmU6WChiLDIpLGxhYmVsOm51bGwhPVYoYiwzKT9sYihiLDMpOnZvaWQgMCxkaXNwbGF5TmFtZTpudWxsIT1WKGIsNCk/bGIoYiw0KTp2b2lkIDB9fSl9O2Z1bmN0aW9uIHBjKGEpe3JldHVybnt4OlgoYSwxKSx5OlgoYSwyKSx6OlgoYSwzKSx2aXNpYmlsaXR5Om51bGwhPVYoYSw0KT9YKGEsNCk6dm9pZCAwfX1mdW5jdGlvbiBxYyhhKXtyZXR1cm4gYS5tYXAoZnVuY3Rpb24oYil7cmV0dXJuIGliKFViKGIsaWMsa2MpLGdjLDEpLm1hcChwYyl9KX07ZnVuY3Rpb24gcmMoYSxiKXt0aGlzLmg9YTt0aGlzLmc9Yjt0aGlzLmw9MH1cbmZ1bmN0aW9uIHNjKGEsYixjKXt0YyhhLGIpO2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBhLmcuY2FudmFzLnRyYW5zZmVyVG9JbWFnZUJpdG1hcClyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGEuZy5jYW52YXMudHJhbnNmZXJUb0ltYWdlQml0bWFwKCkpO2lmKGMpcmV0dXJuIFByb21pc2UucmVzb2x2ZShhLmcuY2FudmFzKTtpZihcImZ1bmN0aW9uXCI9PT10eXBlb2YgY3JlYXRlSW1hZ2VCaXRtYXApcmV0dXJuIGNyZWF0ZUltYWdlQml0bWFwKGEuZy5jYW52YXMpO3ZvaWQgMD09PWEuaSYmKGEuaT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpKTtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24oZCl7YS5pLmhlaWdodD1hLmcuY2FudmFzLmhlaWdodDthLmkud2lkdGg9YS5nLmNhbnZhcy53aWR0aDthLmkuZ2V0Q29udGV4dChcIjJkXCIse30pLmRyYXdJbWFnZShhLmcuY2FudmFzLDAsMCxhLmcuY2FudmFzLndpZHRoLGEuZy5jYW52YXMuaGVpZ2h0KTtkKGEuaSl9KX1cbmZ1bmN0aW9uIHRjKGEsYil7dmFyIGM9YS5nO2lmKHZvaWQgMD09PWEubyl7dmFyIGQ9bmMoYyxcIlxcbiAgYXR0cmlidXRlIHZlYzIgYVZlcnRleDtcXG4gIGF0dHJpYnV0ZSB2ZWMyIGFUZXg7XFxuICB2YXJ5aW5nIHZlYzIgdlRleDtcXG4gIHZvaWQgbWFpbih2b2lkKSB7XFxuICAgIGdsX1Bvc2l0aW9uID0gdmVjNChhVmVydGV4LCAwLjAsIDEuMCk7XFxuICAgIHZUZXggPSBhVGV4O1xcbiAgfVwiLDApLGU9bmMoYyxcIlxcbiAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XFxuICB2YXJ5aW5nIHZlYzIgdlRleDtcXG4gIHVuaWZvcm0gc2FtcGxlcjJEIHNhbXBsZXIwO1xcbiAgdm9pZCBtYWluKCl7XFxuICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRChzYW1wbGVyMCwgdlRleCk7XFxuICB9XCIsMSksZz1jLmNyZWF0ZVByb2dyYW0oKTtjLmF0dGFjaFNoYWRlcihnLGQpO2MuYXR0YWNoU2hhZGVyKGcsZSk7Yy5saW5rUHJvZ3JhbShnKTtpZighYy5nZXRQcm9ncmFtUGFyYW1ldGVyKGcsYy5MSU5LX1NUQVRVUykpdGhyb3cgRXJyb3IoXCJDb3VsZCBub3QgY29tcGlsZSBXZWJHTCBwcm9ncmFtLlxcblxcblwiK1xuYy5nZXRQcm9ncmFtSW5mb0xvZyhnKSk7ZD1hLm89ZztjLnVzZVByb2dyYW0oZCk7ZT1jLmdldFVuaWZvcm1Mb2NhdGlvbihkLFwic2FtcGxlcjBcIik7YS5qPXtLOmMuZ2V0QXR0cmliTG9jYXRpb24oZCxcImFWZXJ0ZXhcIiksSjpjLmdldEF0dHJpYkxvY2F0aW9uKGQsXCJhVGV4XCIpLHFhOmV9O2EudT1jLmNyZWF0ZUJ1ZmZlcigpO2MuYmluZEJ1ZmZlcihjLkFSUkFZX0JVRkZFUixhLnUpO2MuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYS5qLkspO2MudmVydGV4QXR0cmliUG9pbnRlcihhLmouSywyLGMuRkxPQVQsITEsMCwwKTtjLmJ1ZmZlckRhdGEoYy5BUlJBWV9CVUZGRVIsbmV3IEZsb2F0MzJBcnJheShbLTEsLTEsLTEsMSwxLDEsMSwtMV0pLGMuU1RBVElDX0RSQVcpO2MuYmluZEJ1ZmZlcihjLkFSUkFZX0JVRkZFUixudWxsKTthLnM9Yy5jcmVhdGVCdWZmZXIoKTtjLmJpbmRCdWZmZXIoYy5BUlJBWV9CVUZGRVIsYS5zKTtjLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGEuai5KKTtjLnZlcnRleEF0dHJpYlBvaW50ZXIoYS5qLkosXG4yLGMuRkxPQVQsITEsMCwwKTtjLmJ1ZmZlckRhdGEoYy5BUlJBWV9CVUZGRVIsbmV3IEZsb2F0MzJBcnJheShbMCwxLDAsMCwxLDAsMSwxXSksYy5TVEFUSUNfRFJBVyk7Yy5iaW5kQnVmZmVyKGMuQVJSQVlfQlVGRkVSLG51bGwpO2MudW5pZm9ybTFpKGUsMCl9ZD1hLmo7Yy51c2VQcm9ncmFtKGEubyk7Yy5jYW52YXMud2lkdGg9Yi53aWR0aDtjLmNhbnZhcy5oZWlnaHQ9Yi5oZWlnaHQ7Yy52aWV3cG9ydCgwLDAsYi53aWR0aCxiLmhlaWdodCk7Yy5hY3RpdmVUZXh0dXJlKGMuVEVYVFVSRTApO2EuaC5iaW5kVGV4dHVyZTJkKGIuZ2xOYW1lKTtjLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGQuSyk7Yy5iaW5kQnVmZmVyKGMuQVJSQVlfQlVGRkVSLGEudSk7Yy52ZXJ0ZXhBdHRyaWJQb2ludGVyKGQuSywyLGMuRkxPQVQsITEsMCwwKTtjLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGQuSik7Yy5iaW5kQnVmZmVyKGMuQVJSQVlfQlVGRkVSLGEucyk7Yy52ZXJ0ZXhBdHRyaWJQb2ludGVyKGQuSixcbjIsYy5GTE9BVCwhMSwwLDApO2MuYmluZEZyYW1lYnVmZmVyKGMuRFJBV19GUkFNRUJVRkZFUj9jLkRSQVdfRlJBTUVCVUZGRVI6Yy5GUkFNRUJVRkZFUixudWxsKTtjLmNsZWFyQ29sb3IoMCwwLDAsMCk7Yy5jbGVhcihjLkNPTE9SX0JVRkZFUl9CSVQpO2MuY29sb3JNYXNrKCEwLCEwLCEwLCEwKTtjLmRyYXdBcnJheXMoYy5UUklBTkdMRV9GQU4sMCw0KTtjLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShkLkspO2MuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGQuSik7Yy5iaW5kQnVmZmVyKGMuQVJSQVlfQlVGRkVSLG51bGwpO2EuaC5iaW5kVGV4dHVyZTJkKDApfWZ1bmN0aW9uIHVjKGEpe3RoaXMuZz1hfTt2YXIgdmM9bmV3IFVpbnQ4QXJyYXkoWzAsOTcsMTE1LDEwOSwxLDAsMCwwLDEsNCwxLDk2LDAsMCwzLDIsMSwwLDEwLDksMSw3LDAsNjUsMCwyNTMsMTUsMjYsMTFdKTtmdW5jdGlvbiB3YyhhLGIpe3JldHVybiBiK2F9ZnVuY3Rpb24geGMoYSxiKXt3aW5kb3dbYV09Yn1mdW5jdGlvbiB5YyhhKXt2YXIgYj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO2Iuc2V0QXR0cmlidXRlKFwic3JjXCIsYSk7Yi5zZXRBdHRyaWJ1dGUoXCJjcm9zc29yaWdpblwiLFwiYW5vbnltb3VzXCIpO3JldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihjKXtiLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsZnVuY3Rpb24oKXtjKCl9LCExKTtiLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGZ1bmN0aW9uKCl7YygpfSwhMSk7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChiKX0pfVxuZnVuY3Rpb24gemMoKXtyZXR1cm4gSShmdW5jdGlvbihhKXtzd2l0Y2goYS5nKXtjYXNlIDE6cmV0dXJuIGEubz0yLEYoYSxXZWJBc3NlbWJseS5pbnN0YW50aWF0ZSh2YyksNCk7Y2FzZSA0OmEuZz0zO2Eubz0wO2JyZWFrO2Nhc2UgMjpyZXR1cm4gYS5vPTAsYS5qPW51bGwsYS5yZXR1cm4oITEpO2Nhc2UgMzpyZXR1cm4gYS5yZXR1cm4oITApfX0pfVxuZnVuY3Rpb24gQWMoYSl7dGhpcy5nPWE7dGhpcy5saXN0ZW5lcnM9e307dGhpcy5qPXt9O3RoaXMuSD17fTt0aGlzLm89e307dGhpcy51PXt9O3RoaXMuST10aGlzLnM9dGhpcy4kPSEwO3RoaXMuRD1Qcm9taXNlLnJlc29sdmUoKTt0aGlzLlo9XCJcIjt0aGlzLkM9e307dGhpcy5sb2NhdGVGaWxlPWEmJmEubG9jYXRlRmlsZXx8d2M7aWYoXCJvYmplY3RcIj09PXR5cGVvZiB3aW5kb3cpdmFyIGI9d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDAsd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnRvU3RyaW5nKCkubGFzdEluZGV4T2YoXCIvXCIpKStcIi9cIjtlbHNlIGlmKFwidW5kZWZpbmVkXCIhPT10eXBlb2YgbG9jYXRpb24pYj1sb2NhdGlvbi5wYXRobmFtZS50b1N0cmluZygpLnN1YnN0cmluZygwLGxvY2F0aW9uLnBhdGhuYW1lLnRvU3RyaW5nKCkubGFzdEluZGV4T2YoXCIvXCIpKStcIi9cIjtlbHNlIHRocm93IEVycm9yKFwic29sdXRpb25zIGNhbiBvbmx5IGJlIGxvYWRlZCBvbiBhIHdlYiBwYWdlIG9yIGluIGEgd2ViIHdvcmtlclwiKTtcbnRoaXMuYWE9YjtpZihhLm9wdGlvbnMpe2I9QyhPYmplY3Qua2V5cyhhLm9wdGlvbnMpKTtmb3IodmFyIGM9Yi5uZXh0KCk7IWMuZG9uZTtjPWIubmV4dCgpKXtjPWMudmFsdWU7dmFyIGQ9YS5vcHRpb25zW2NdLmRlZmF1bHQ7dm9pZCAwIT09ZCYmKHRoaXMualtjXT1cImZ1bmN0aW9uXCI9PT10eXBlb2YgZD9kKCk6ZCl9fX14PUFjLnByb3RvdHlwZTt4LmNsb3NlPWZ1bmN0aW9uKCl7dGhpcy5pJiZ0aGlzLmkuZGVsZXRlKCk7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpfTtcbmZ1bmN0aW9uIEJjKGEpe3ZhciBiLGMsZCxlLGcsZixoLGssbCxtLHI7cmV0dXJuIEkoZnVuY3Rpb24ocCl7c3dpdGNoKHAuZyl7Y2FzZSAxOmlmKCFhLiQpcmV0dXJuIHAucmV0dXJuKCk7Yj12b2lkIDA9PT1hLmcuZmlsZXM/W106XCJmdW5jdGlvblwiPT09dHlwZW9mIGEuZy5maWxlcz9hLmcuZmlsZXMoYS5qKTphLmcuZmlsZXM7cmV0dXJuIEYocCx6YygpLDIpO2Nhc2UgMjpjPXAuaDtpZihcIm9iamVjdFwiPT09dHlwZW9mIHdpbmRvdylyZXR1cm4geGMoXCJjcmVhdGVNZWRpYXBpcGVTb2x1dGlvbnNXYXNtXCIse2xvY2F0ZUZpbGU6YS5sb2NhdGVGaWxlfSkseGMoXCJjcmVhdGVNZWRpYXBpcGVTb2x1dGlvbnNQYWNrZWRBc3NldHNcIix7bG9jYXRlRmlsZTphLmxvY2F0ZUZpbGV9KSxmPWIuZmlsdGVyKGZ1bmN0aW9uKG4pe3JldHVybiB2b2lkIDAhPT1uLmRhdGF9KSxoPWIuZmlsdGVyKGZ1bmN0aW9uKG4pe3JldHVybiB2b2lkIDA9PT1uLmRhdGF9KSxrPVByb21pc2UuYWxsKGYubWFwKGZ1bmN0aW9uKG4pe3ZhciBxPVxuQ2MoYSxuLnVybCk7aWYodm9pZCAwIT09bi5wYXRoKXt2YXIgdD1uLnBhdGg7cT1xLnRoZW4oZnVuY3Rpb24odyl7YS5vdmVycmlkZUZpbGUodCx3KTtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHcpfSl9cmV0dXJuIHF9KSksbD1Qcm9taXNlLmFsbChoLm1hcChmdW5jdGlvbihuKXtyZXR1cm4gdm9pZCAwPT09bi5zaW1kfHxuLnNpbWQmJmN8fCFuLnNpbWQmJiFjP3ljKGEubG9jYXRlRmlsZShuLnVybCxhLmFhKSk6UHJvbWlzZS5yZXNvbHZlKCl9KSkudGhlbihmdW5jdGlvbigpe3ZhciBuLHEsdDtyZXR1cm4gSShmdW5jdGlvbih3KXtpZigxPT13LmcpcmV0dXJuIG49d2luZG93LmNyZWF0ZU1lZGlhcGlwZVNvbHV0aW9uc1dhc20scT13aW5kb3cuY3JlYXRlTWVkaWFwaXBlU29sdXRpb25zUGFja2VkQXNzZXRzLHQ9YSxGKHcsbihxKSwyKTt0Lmg9dy5oO3cuZz0wfSl9KSxtPWZ1bmN0aW9uKCl7cmV0dXJuIEkoZnVuY3Rpb24obil7YS5nLmdyYXBoJiZhLmcuZ3JhcGgudXJsP249RihuLFxuQ2MoYSxhLmcuZ3JhcGgudXJsKSwwKToobi5nPTAsbj12b2lkIDApO3JldHVybiBufSl9KCksRihwLFByb21pc2UuYWxsKFtsLGssbV0pLDcpO2lmKFwiZnVuY3Rpb25cIiE9PXR5cGVvZiBpbXBvcnRTY3JpcHRzKXRocm93IEVycm9yKFwic29sdXRpb25zIGNhbiBvbmx5IGJlIGxvYWRlZCBvbiBhIHdlYiBwYWdlIG9yIGluIGEgd2ViIHdvcmtlclwiKTtkPWIuZmlsdGVyKGZ1bmN0aW9uKG4pe3JldHVybiB2b2lkIDA9PT1uLnNpbWR8fG4uc2ltZCYmY3x8IW4uc2ltZCYmIWN9KS5tYXAoZnVuY3Rpb24obil7cmV0dXJuIGEubG9jYXRlRmlsZShuLnVybCxhLmFhKX0pO2ltcG9ydFNjcmlwdHMuYXBwbHkobnVsbCxlYShkKSk7ZT1hO3JldHVybiBGKHAsY3JlYXRlTWVkaWFwaXBlU29sdXRpb25zV2FzbShNb2R1bGUpLDYpO2Nhc2UgNjplLmg9cC5oO2EubD1uZXcgT2Zmc2NyZWVuQ2FudmFzKDEsMSk7YS5oLmNhbnZhcz1hLmw7Zz1hLmguR0wuY3JlYXRlQ29udGV4dChhLmwse2FudGlhbGlhczohMSxcbmFscGhhOiExLG5hOlwidW5kZWZpbmVkXCIhPT10eXBlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dD8yOjF9KTthLmguR0wubWFrZUNvbnRleHRDdXJyZW50KGcpO3AuZz00O2JyZWFrO2Nhc2UgNzphLmw9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtyPWEubC5nZXRDb250ZXh0KFwid2ViZ2wyXCIse30pO2lmKCFyJiYocj1hLmwuZ2V0Q29udGV4dChcIndlYmdsXCIse30pLCFyKSlyZXR1cm4gYWxlcnQoXCJGYWlsZWQgdG8gY3JlYXRlIFdlYkdMIGNhbnZhcyBjb250ZXh0IHdoZW4gcGFzc2luZyB2aWRlbyBmcmFtZS5cIikscC5yZXR1cm4oKTthLkc9cjthLmguY2FudmFzPWEubDthLmguY3JlYXRlQ29udGV4dChhLmwsITAsITAse30pO2Nhc2UgNDphLmk9bmV3IGEuaC5Tb2x1dGlvbldhc20sYS4kPSExLHAuZz0wfX0pfVxuZnVuY3Rpb24gRGMoYSl7dmFyIGIsYyxkLGUsZyxmLGgsaztyZXR1cm4gSShmdW5jdGlvbihsKXtpZigxPT1sLmcpe2lmKGEuZy5ncmFwaCYmYS5nLmdyYXBoLnVybCYmYS5aPT09YS5nLmdyYXBoLnVybClyZXR1cm4gbC5yZXR1cm4oKTthLnM9ITA7aWYoIWEuZy5ncmFwaHx8IWEuZy5ncmFwaC51cmwpe2wuZz0yO3JldHVybn1hLlo9YS5nLmdyYXBoLnVybDtyZXR1cm4gRihsLENjKGEsYS5nLmdyYXBoLnVybCksMyl9MiE9bC5nJiYoYj1sLmgsYS5pLmxvYWRHcmFwaChiKSk7Yz1DKE9iamVjdC5rZXlzKGEuQykpO2ZvcihkPWMubmV4dCgpOyFkLmRvbmU7ZD1jLm5leHQoKSllPWQudmFsdWUsYS5pLm92ZXJyaWRlRmlsZShlLGEuQ1tlXSk7YS5DPXt9O2lmKGEuZy5saXN0ZW5lcnMpZm9yKGc9QyhhLmcubGlzdGVuZXJzKSxmPWcubmV4dCgpOyFmLmRvbmU7Zj1nLm5leHQoKSloPWYudmFsdWUsRWMoYSxoKTtrPWEuajthLmo9e307YS5zZXRPcHRpb25zKGspO2wuZz0wfSl9XG54LnJlc2V0PWZ1bmN0aW9uKCl7dmFyIGE9dGhpcztyZXR1cm4gSShmdW5jdGlvbihiKXthLmkmJihhLmkucmVzZXQoKSxhLm89e30sYS51PXt9KTtiLmc9MH0pfTtcbnguc2V0T3B0aW9ucz1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7aWYoYj1ifHx0aGlzLmcub3B0aW9ucyl7Zm9yKHZhciBkPVtdLGU9W10sZz17fSxmPUMoT2JqZWN0LmtleXMoYSkpLGg9Zi5uZXh0KCk7IWguZG9uZTtnPXtSOmcuUixTOmcuU30saD1mLm5leHQoKSl7dmFyIGs9aC52YWx1ZTtrIGluIHRoaXMuaiYmdGhpcy5qW2tdPT09YVtrXXx8KHRoaXMualtrXT1hW2tdLGg9YltrXSx2b2lkIDAhPT1oJiYoaC5vbkNoYW5nZSYmKGcuUj1oLm9uQ2hhbmdlLGcuUz1hW2tdLGQucHVzaChmdW5jdGlvbihsKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgbTtyZXR1cm4gSShmdW5jdGlvbihyKXtpZigxPT1yLmcpcmV0dXJuIEYocixsLlIobC5TKSwyKTttPXIuaDshMD09PW0mJihjLnM9ITApO3IuZz0wfSl9fShnKSkpLGguZ3JhcGhPcHRpb25YcmVmJiYoaz17dmFsdWVOdW1iZXI6MT09PWgudHlwZT9hW2tdOjAsdmFsdWVCb29sZWFuOjA9PT1oLnR5cGU/YVtrXTohMSx2YWx1ZVN0cmluZzoyPT09XG5oLnR5cGU/YVtrXTpcIlwifSxoPU9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LHtjYWxjdWxhdG9yTmFtZTpcIlwiLGNhbGN1bGF0b3JJbmRleDowfSksaC5ncmFwaE9wdGlvblhyZWYpLGspLGUucHVzaChoKSkpKX1pZigwIT09ZC5sZW5ndGh8fDAhPT1lLmxlbmd0aCl0aGlzLnM9ITAsdGhpcy5CPSh2b2lkIDA9PT10aGlzLkI/W106dGhpcy5CKS5jb25jYXQoZSksdGhpcy5BPSh2b2lkIDA9PT10aGlzLkE/W106dGhpcy5BKS5jb25jYXQoZCl9fTtcbmZ1bmN0aW9uIEZjKGEpe3ZhciBiLGMsZCxlLGcsZixoO3JldHVybiBJKGZ1bmN0aW9uKGspe3N3aXRjaChrLmcpe2Nhc2UgMTppZighYS5zKXJldHVybiBrLnJldHVybigpO2lmKCFhLkEpe2suZz0yO2JyZWFrfWI9QyhhLkEpO2M9Yi5uZXh0KCk7Y2FzZSAzOmlmKGMuZG9uZSl7ay5nPTU7YnJlYWt9ZD1jLnZhbHVlO3JldHVybiBGKGssZCgpLDQpO2Nhc2UgNDpjPWIubmV4dCgpO2suZz0zO2JyZWFrO2Nhc2UgNTphLkE9dm9pZCAwO2Nhc2UgMjppZihhLkIpe2U9bmV3IGEuaC5HcmFwaE9wdGlvbkNoYW5nZVJlcXVlc3RMaXN0O2c9QyhhLkIpO2ZvcihmPWcubmV4dCgpOyFmLmRvbmU7Zj1nLm5leHQoKSloPWYudmFsdWUsZS5wdXNoX2JhY2soaCk7YS5pLmNoYW5nZU9wdGlvbnMoZSk7ZS5kZWxldGUoKTthLkI9dm9pZCAwfWEucz0hMTtrLmc9MH19KX1cbnguaW5pdGlhbGl6ZT1mdW5jdGlvbigpe3ZhciBhPXRoaXM7cmV0dXJuIEkoZnVuY3Rpb24oYil7cmV0dXJuIDE9PWIuZz9GKGIsQmMoYSksMik6MyE9Yi5nP0YoYixEYyhhKSwzKTpGKGIsRmMoYSksMCl9KX07ZnVuY3Rpb24gQ2MoYSxiKXt2YXIgYyxkO3JldHVybiBJKGZ1bmN0aW9uKGUpe2lmKGIgaW4gYS5IKXJldHVybiBlLnJldHVybihhLkhbYl0pO2M9YS5sb2NhdGVGaWxlKGIsXCJcIik7ZD1mZXRjaChjKS50aGVuKGZ1bmN0aW9uKGcpe3JldHVybiBnLmFycmF5QnVmZmVyKCl9KTthLkhbYl09ZDtyZXR1cm4gZS5yZXR1cm4oZCl9KX14Lm92ZXJyaWRlRmlsZT1mdW5jdGlvbihhLGIpe3RoaXMuaT90aGlzLmkub3ZlcnJpZGVGaWxlKGEsYik6dGhpcy5DW2FdPWJ9O3guY2xlYXJPdmVycmlkZGVuRmlsZXM9ZnVuY3Rpb24oKXt0aGlzLkM9e307dGhpcy5pJiZ0aGlzLmkuY2xlYXJPdmVycmlkZGVuRmlsZXMoKX07XG54LnNlbmQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLGQsZSxnLGYsaCxrLGwsbSxyO3JldHVybiBJKGZ1bmN0aW9uKHApe3N3aXRjaChwLmcpe2Nhc2UgMTppZighYy5nLmlucHV0cylyZXR1cm4gcC5yZXR1cm4oKTtkPTFFMyoodm9pZCAwPT09Ynx8bnVsbD09PWI/cGVyZm9ybWFuY2Uubm93KCk6Yik7cmV0dXJuIEYocCxjLkQsMik7Y2FzZSAyOnJldHVybiBGKHAsYy5pbml0aWFsaXplKCksMyk7Y2FzZSAzOmU9bmV3IGMuaC5QYWNrZXREYXRhTGlzdDtnPUMoT2JqZWN0LmtleXMoYSkpO2ZvcihmPWcubmV4dCgpOyFmLmRvbmU7Zj1nLm5leHQoKSlpZihoPWYudmFsdWUsaz1jLmcuaW5wdXRzW2hdKXthOnt2YXIgbj1hW2hdO3N3aXRjaChrLnR5cGUpe2Nhc2UgXCJ2aWRlb1wiOnZhciBxPWMub1trLnN0cmVhbV07cXx8KHE9bmV3IHJjKGMuaCxjLkcpLGMub1trLnN0cmVhbV09cSk7MD09PXEubCYmKHEubD1xLmguY3JlYXRlVGV4dHVyZSgpKTtpZihcInVuZGVmaW5lZFwiIT09dHlwZW9mIEhUTUxWaWRlb0VsZW1lbnQmJlxubiBpbnN0YW5jZW9mIEhUTUxWaWRlb0VsZW1lbnQpe3ZhciB0PW4udmlkZW9XaWR0aDt2YXIgdz1uLnZpZGVvSGVpZ2h0fWVsc2VcInVuZGVmaW5lZFwiIT09dHlwZW9mIEhUTUxJbWFnZUVsZW1lbnQmJm4gaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50Pyh0PW4ubmF0dXJhbFdpZHRoLHc9bi5uYXR1cmFsSGVpZ2h0KToodD1uLndpZHRoLHc9bi5oZWlnaHQpO3c9e2dsTmFtZTpxLmwsd2lkdGg6dCxoZWlnaHQ6d307dD1xLmc7dC5jYW52YXMud2lkdGg9dy53aWR0aDt0LmNhbnZhcy5oZWlnaHQ9dy5oZWlnaHQ7dC5hY3RpdmVUZXh0dXJlKHQuVEVYVFVSRTApO3EuaC5iaW5kVGV4dHVyZTJkKHEubCk7dC50ZXhJbWFnZTJEKHQuVEVYVFVSRV8yRCwwLHQuUkdCQSx0LlJHQkEsdC5VTlNJR05FRF9CWVRFLG4pO3EuaC5iaW5kVGV4dHVyZTJkKDApO3E9dzticmVhayBhO2Nhc2UgXCJkZXRlY3Rpb25zXCI6cT1jLm9bay5zdHJlYW1dO3F8fChxPW5ldyB1YyhjLmgpLGMub1trLnN0cmVhbV09cSk7XG5xLmRhdGF8fChxLmRhdGE9bmV3IHEuZy5EZXRlY3Rpb25MaXN0RGF0YSk7cS5kYXRhLnJlc2V0KG4ubGVuZ3RoKTtmb3Iodz0wO3c8bi5sZW5ndGg7Kyt3KXt0PW5bd107dmFyIHY9cS5kYXRhLEE9di5zZXRCb3VuZGluZ0JveCxIPXc7dmFyIEU9dC5lYTt2YXIgdT1uZXcgbGM7Vyh1LDEsRS5rYSk7Vyh1LDIsRS5sYSk7Vyh1LDMsRS5oZWlnaHQpO1codSw0LEUud2lkdGgpO1codSw1LEUucm90YXRpb24pO1codSw2LEUuaWEpO0U9VmIodSxtYyk7QS5jYWxsKHYsSCxFKTtpZih0LlkpZm9yKHY9MDt2PHQuWS5sZW5ndGg7Kyt2KXt1PXQuWVt2XTt2YXIgej11LnZpc2liaWxpdHk/ITA6ITE7QT1xLmRhdGE7SD1BLmFkZE5vcm1hbGl6ZWRMYW5kbWFyaztFPXc7dT1PYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sdSkse3Zpc2liaWxpdHk6ej91LnZpc2liaWxpdHk6MH0pO3o9bmV3IGdjO1coeiwxLHUueCk7Vyh6LDIsdS55KTtXKHosMyx1LnopO3UudmlzaWJpbGl0eSYmVyh6LDQsXG51LnZpc2liaWxpdHkpO3U9VmIoeixoYyk7SC5jYWxsKEEsRSx1KX1pZih0LlYpZm9yKHY9MDt2PHQuVi5sZW5ndGg7Kyt2KUE9cS5kYXRhLEg9QS5hZGRDbGFzc2lmaWNhdGlvbixFPXcsdT10LlZbdl0sej1uZXcgYmMsVyh6LDIsdS5zY29yZSksdS5pbmRleCYmVyh6LDEsdS5pbmRleCksdS5sYWJlbCYmVyh6LDMsdS5sYWJlbCksdS5kaXNwbGF5TmFtZSYmVyh6LDQsdS5kaXNwbGF5TmFtZSksdT1WYih6LGNjKSxILmNhbGwoQSxFLHUpfXE9cS5kYXRhO2JyZWFrIGE7ZGVmYXVsdDpxPXt9fX1sPXE7bT1rLnN0cmVhbTtzd2l0Y2goay50eXBlKXtjYXNlIFwidmlkZW9cIjplLnB1c2hUZXh0dXJlMmQoT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LGwpLHtzdHJlYW06bSx0aW1lc3RhbXA6ZH0pKTticmVhaztjYXNlIFwiZGV0ZWN0aW9uc1wiOnI9bDtyLnN0cmVhbT1tO3IudGltZXN0YW1wPWQ7ZS5wdXNoRGV0ZWN0aW9uTGlzdChyKTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiVW5rbm93biBpbnB1dCBjb25maWcgdHlwZTogJ1wiK1xuay50eXBlK1wiJ1wiKTt9fWMuaS5zZW5kKGUpO3JldHVybiBGKHAsYy5ELDQpO2Nhc2UgNDplLmRlbGV0ZSgpLHAuZz0wfX0pfTtcbmZ1bmN0aW9uIEdjKGEsYixjKXt2YXIgZCxlLGcsZixoLGssbCxtLHIscCxuLHEsdCx3O3JldHVybiBJKGZ1bmN0aW9uKHYpe3N3aXRjaCh2Lmcpe2Nhc2UgMTppZighYylyZXR1cm4gdi5yZXR1cm4oYik7ZD17fTtlPTA7Zz1DKE9iamVjdC5rZXlzKGMpKTtmb3IoZj1nLm5leHQoKTshZi5kb25lO2Y9Zy5uZXh0KCkpaD1mLnZhbHVlLGs9Y1toXSxcInN0cmluZ1wiIT09dHlwZW9mIGsmJlwidGV4dHVyZVwiPT09ay50eXBlJiZ2b2lkIDAhPT1iW2suc3RyZWFtXSYmKytlOzE8ZSYmKGEuST0hMSk7bD1DKE9iamVjdC5rZXlzKGMpKTtmPWwubmV4dCgpO2Nhc2UgMjppZihmLmRvbmUpe3YuZz00O2JyZWFrfW09Zi52YWx1ZTtyPWNbbV07aWYoXCJzdHJpbmdcIj09PXR5cGVvZiByKXJldHVybiB0PWQsdz1tLEYodixIYyhhLG0sYltyXSksMTQpO3A9YltyLnN0cmVhbV07aWYoXCJkZXRlY3Rpb25fbGlzdFwiPT09ci50eXBlKXtpZihwKXt2YXIgQT1wLmdldFJlY3RMaXN0KCk7Zm9yKHZhciBIPXAuZ2V0TGFuZG1hcmtzTGlzdCgpLFxuRT1wLmdldENsYXNzaWZpY2F0aW9uc0xpc3QoKSx1PVtdLHo9MDt6PEEuc2l6ZSgpOysreil7dmFyIFA9VWIoQS5nZXQoeiksbGMsbWMpO1A9e2VhOntrYTpYKFAsMSksbGE6WChQLDIpLGhlaWdodDpYKFAsMyksd2lkdGg6WChQLDQpLHJvdGF0aW9uOlgoUCw1LDApLGlhOmtiKFAsNil9LFk6aWIoVWIoSC5nZXQoeiksaWMsa2MpLGdjLDEpLm1hcChwYyksVjpvYyhVYihFLmdldCh6KSxkYyxmYykpfTt1LnB1c2goUCl9QT11fWVsc2UgQT1bXTtkW21dPUE7di5nPTc7YnJlYWt9aWYoXCJwcm90b19saXN0XCI9PT1yLnR5cGUpe2lmKHApe0E9QXJyYXkocC5zaXplKCkpO2ZvcihIPTA7SDxwLnNpemUoKTtIKyspQVtIXT1wLmdldChIKTtwLmRlbGV0ZSgpfWVsc2UgQT1bXTtkW21dPUE7di5nPTc7YnJlYWt9aWYodm9pZCAwPT09cCl7di5nPTM7YnJlYWt9aWYoXCJmbG9hdF9saXN0XCI9PT1yLnR5cGUpe2RbbV09cDt2Lmc9NzticmVha31pZihcInByb3RvXCI9PT1yLnR5cGUpe2RbbV09cDt2Lmc9XG43O2JyZWFrfWlmKFwidGV4dHVyZVwiIT09ci50eXBlKXRocm93IEVycm9yKFwiVW5rbm93biBvdXRwdXQgY29uZmlnIHR5cGU6ICdcIityLnR5cGUrXCInXCIpO249YS51W21dO258fChuPW5ldyByYyhhLmgsYS5HKSxhLnVbbV09bik7cmV0dXJuIEYodixzYyhuLHAsYS5JKSwxMyk7Y2FzZSAxMzpxPXYuaCxkW21dPXE7Y2FzZSA3OnIudHJhbnNmb3JtJiZkW21dJiYoZFttXT1yLnRyYW5zZm9ybShkW21dKSk7di5nPTM7YnJlYWs7Y2FzZSAxNDp0W3ddPXYuaDtjYXNlIDM6Zj1sLm5leHQoKTt2Lmc9MjticmVhaztjYXNlIDQ6cmV0dXJuIHYucmV0dXJuKGQpfX0pfVxuZnVuY3Rpb24gSGMoYSxiLGMpe3ZhciBkO3JldHVybiBJKGZ1bmN0aW9uKGUpe3JldHVyblwibnVtYmVyXCI9PT10eXBlb2YgY3x8YyBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fGMgaW5zdGFuY2VvZiBhLmguVWludDhCbG9iTGlzdD9lLnJldHVybihjKTpjIGluc3RhbmNlb2YgYS5oLlRleHR1cmUyZERhdGFPdXQ/KGQ9YS51W2JdLGR8fChkPW5ldyByYyhhLmgsYS5HKSxhLnVbYl09ZCksZS5yZXR1cm4oc2MoZCxjLGEuSSkpKTplLnJldHVybih2b2lkIDApfSl9XG5mdW5jdGlvbiBFYyhhLGIpe2Zvcih2YXIgYz1iLm5hbWV8fFwiJFwiLGQ9W10uY29uY2F0KGVhKGIud2FudHMpKSxlPW5ldyBhLmguU3RyaW5nTGlzdCxnPUMoYi53YW50cyksZj1nLm5leHQoKTshZi5kb25lO2Y9Zy5uZXh0KCkpZS5wdXNoX2JhY2soZi52YWx1ZSk7Zz1hLmguUGFja2V0TGlzdGVuZXIuaW1wbGVtZW50KHtvblJlc3VsdHM6ZnVuY3Rpb24oaCl7Zm9yKHZhciBrPXt9LGw9MDtsPGIud2FudHMubGVuZ3RoOysrbClrW2RbbF1dPWguZ2V0KGwpO3ZhciBtPWEubGlzdGVuZXJzW2NdO20mJihhLkQ9R2MoYSxrLGIub3V0cykudGhlbihmdW5jdGlvbihyKXtyPW0ocik7Zm9yKHZhciBwPTA7cDxiLndhbnRzLmxlbmd0aDsrK3Ape3ZhciBuPWtbZFtwXV07XCJvYmplY3RcIj09PXR5cGVvZiBuJiZuLmhhc093blByb3BlcnR5JiZuLmhhc093blByb3BlcnR5KFwiZGVsZXRlXCIpJiZuLmRlbGV0ZSgpfXImJihhLkQ9cil9KSl9fSk7YS5pLmF0dGFjaE11bHRpTGlzdGVuZXIoZSxnKTtlLmRlbGV0ZSgpfVxueC5vblJlc3VsdHM9ZnVuY3Rpb24oYSxiKXt0aGlzLmxpc3RlbmVyc1tifHxcIiRcIl09YX07SihcIlNvbHV0aW9uXCIsQWMpO0ooXCJPcHRpb25UeXBlXCIse0JPT0w6MCxOVU1CRVI6MSxtYToyLDA6XCJCT09MXCIsMTpcIk5VTUJFUlwiLDI6XCJTVFJJTkdcIn0pO2Z1bmN0aW9uIEljKGEpe3ZvaWQgMD09PWEmJihhPTApO3JldHVybiAxPT09YT9cImhhbmRfbGFuZG1hcmtfZnVsbC50ZmxpdGVcIjpcImhhbmRfbGFuZG1hcmtfbGl0ZS50ZmxpdGVcIn1cbmZ1bmN0aW9uIEpjKGEpe3ZhciBiPXRoaXM7YT1hfHx7fTt0aGlzLmc9bmV3IEFjKHtsb2NhdGVGaWxlOmEubG9jYXRlRmlsZSxmaWxlczpmdW5jdGlvbihjKXtyZXR1cm5be3VybDpcImhhbmRzX3NvbHV0aW9uX3BhY2tlZF9hc3NldHNfbG9hZGVyLmpzXCJ9LHtzaW1kOiExLHVybDpcImhhbmRzX3NvbHV0aW9uX3dhc21fYmluLmpzXCJ9LHtzaW1kOiEwLHVybDpcImhhbmRzX3NvbHV0aW9uX3NpbWRfd2FzbV9iaW4uanNcIn0se2RhdGE6ITAsdXJsOkljKGMubW9kZWxDb21wbGV4aXR5KX1dfSxncmFwaDp7dXJsOlwiaGFuZHMuYmluYXJ5cGJcIn0saW5wdXRzOntpbWFnZTp7dHlwZTpcInZpZGVvXCIsc3RyZWFtOlwiaW5wdXRfZnJhbWVzX2dwdVwifX0sbGlzdGVuZXJzOlt7d2FudHM6W1wibXVsdGlfaGFuZF9sYW5kbWFya3NcIixcIm11bHRpX2hhbmRfd29ybGRfbGFuZG1hcmtzXCIsXCJpbWFnZV90cmFuc2Zvcm1lZFwiLFwibXVsdGlfaGFuZGVkbmVzc1wiXSxvdXRzOntpbWFnZTpcImltYWdlX3RyYW5zZm9ybWVkXCIsXG5tdWx0aUhhbmRMYW5kbWFya3M6e3R5cGU6XCJwcm90b19saXN0XCIsc3RyZWFtOlwibXVsdGlfaGFuZF9sYW5kbWFya3NcIix0cmFuc2Zvcm06cWN9LG11bHRpSGFuZFdvcmxkTGFuZG1hcmtzOnt0eXBlOlwicHJvdG9fbGlzdFwiLHN0cmVhbTpcIm11bHRpX2hhbmRfd29ybGRfbGFuZG1hcmtzXCIsdHJhbnNmb3JtOnFjfSxtdWx0aUhhbmRlZG5lc3M6e3R5cGU6XCJwcm90b19saXN0XCIsc3RyZWFtOlwibXVsdGlfaGFuZGVkbmVzc1wiLHRyYW5zZm9ybTpmdW5jdGlvbihjKXtyZXR1cm4gYy5tYXAoZnVuY3Rpb24oZCl7cmV0dXJuIG9jKFViKGQsZGMsZmMpKVswXX0pfX19fV0sb3B0aW9uczp7dXNlQ3B1SW5mZXJlbmNlOnt0eXBlOjAsZ3JhcGhPcHRpb25YcmVmOntjYWxjdWxhdG9yVHlwZTpcIkluZmVyZW5jZUNhbGN1bGF0b3JcIixmaWVsZE5hbWU6XCJ1c2VfY3B1X2luZmVyZW5jZVwifSxkZWZhdWx0Olwib2JqZWN0XCIhPT10eXBlb2Ygd2luZG93fHx2b2lkIDA9PT13aW5kb3cubmF2aWdhdG9yPyExOlwiaVBhZCBTaW11bGF0b3I7aVBob25lIFNpbXVsYXRvcjtpUG9kIFNpbXVsYXRvcjtpUGFkO2lQaG9uZTtpUG9kXCIuc3BsaXQoXCI7XCIpLmluY2x1ZGVzKG5hdmlnYXRvci5wbGF0Zm9ybSl8fFxubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyhcIk1hY1wiKSYmXCJvbnRvdWNoZW5kXCJpbiBkb2N1bWVudH0sc2VsZmllTW9kZTp7dHlwZTowLGdyYXBoT3B0aW9uWHJlZjp7Y2FsY3VsYXRvclR5cGU6XCJHbFNjYWxlckNhbGN1bGF0b3JcIixjYWxjdWxhdG9ySW5kZXg6MSxmaWVsZE5hbWU6XCJmbGlwX2hvcml6b250YWxcIn19LG1heE51bUhhbmRzOnt0eXBlOjEsZ3JhcGhPcHRpb25YcmVmOntjYWxjdWxhdG9yVHlwZTpcIkNvbnN0YW50U2lkZVBhY2tldENhbGN1bGF0b3JcIixjYWxjdWxhdG9yTmFtZTpcIkNvbnN0YW50U2lkZVBhY2tldENhbGN1bGF0b3JcIixmaWVsZE5hbWU6XCJpbnRfdmFsdWVcIn19LG1vZGVsQ29tcGxleGl0eTp7dHlwZToxLGdyYXBoT3B0aW9uWHJlZjp7Y2FsY3VsYXRvclR5cGU6XCJDb25zdGFudFNpZGVQYWNrZXRDYWxjdWxhdG9yXCIsY2FsY3VsYXRvck5hbWU6XCJDb25zdGFudFNpZGVQYWNrZXRDYWxjdWxhdG9yTW9kZWxDb21wbGV4aXR5XCIsZmllbGROYW1lOlwiaW50X3ZhbHVlXCJ9LFxub25DaGFuZ2U6ZnVuY3Rpb24oYyl7dmFyIGQsZSxnO3JldHVybiBJKGZ1bmN0aW9uKGYpe2lmKDE9PWYuZylyZXR1cm4gZD1JYyhjKSxlPVwidGhpcmRfcGFydHkvbWVkaWFwaXBlL21vZHVsZXMvaGFuZF9sYW5kbWFyay9cIitkLEYoZixDYyhiLmcsZCksMik7Zz1mLmg7Yi5nLm92ZXJyaWRlRmlsZShlLGcpO3JldHVybiBmLnJldHVybighMCl9KX19LG1pbkRldGVjdGlvbkNvbmZpZGVuY2U6e3R5cGU6MSxncmFwaE9wdGlvblhyZWY6e2NhbGN1bGF0b3JUeXBlOlwiVGVuc29yc1RvRGV0ZWN0aW9uc0NhbGN1bGF0b3JcIixjYWxjdWxhdG9yTmFtZTpcImhhbmRsYW5kbWFya3RyYWNraW5nZ3B1X19wYWxtZGV0ZWN0aW9uZ3B1X19UZW5zb3JzVG9EZXRlY3Rpb25zQ2FsY3VsYXRvclwiLGZpZWxkTmFtZTpcIm1pbl9zY29yZV90aHJlc2hcIn19LG1pblRyYWNraW5nQ29uZmlkZW5jZTp7dHlwZToxLGdyYXBoT3B0aW9uWHJlZjp7Y2FsY3VsYXRvclR5cGU6XCJUaHJlc2hvbGRpbmdDYWxjdWxhdG9yXCIsY2FsY3VsYXRvck5hbWU6XCJoYW5kbGFuZG1hcmt0cmFja2luZ2dwdV9faGFuZGxhbmRtYXJrZ3B1X19UaHJlc2hvbGRpbmdDYWxjdWxhdG9yXCIsXG5maWVsZE5hbWU6XCJ0aHJlc2hvbGRcIn19fX0pfXg9SmMucHJvdG90eXBlO3guY2xvc2U9ZnVuY3Rpb24oKXt0aGlzLmcuY2xvc2UoKTtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCl9O3gub25SZXN1bHRzPWZ1bmN0aW9uKGEpe3RoaXMuZy5vblJlc3VsdHMoYSl9O3guaW5pdGlhbGl6ZT1mdW5jdGlvbigpe3ZhciBhPXRoaXM7cmV0dXJuIEkoZnVuY3Rpb24oYil7cmV0dXJuIEYoYixhLmcuaW5pdGlhbGl6ZSgpLDApfSl9O3gucmVzZXQ9ZnVuY3Rpb24oKXt0aGlzLmcucmVzZXQoKX07eC5zZW5kPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXM7cmV0dXJuIEkoZnVuY3Rpb24oYyl7cmV0dXJuIEYoYyxiLmcuc2VuZChhKSwwKX0pfTt4LnNldE9wdGlvbnM9ZnVuY3Rpb24oYSl7dGhpcy5nLnNldE9wdGlvbnMoYSl9O0ooXCJIYW5kc1wiLEpjKTtcbkooXCJIQU5EX0NPTk5FQ1RJT05TXCIsW1swLDFdLFsxLDJdLFsyLDNdLFszLDRdLFswLDVdLFs1LDZdLFs2LDddLFs3LDhdLFs1LDldLFs5LDEwXSxbMTAsMTFdLFsxMSwxMl0sWzksMTNdLFsxMywxNF0sWzE0LDE1XSxbMTUsMTZdLFsxMywxN10sWzAsMTddLFsxNywxOF0sWzE4LDE5XSxbMTksMjBdXSk7SihcIlZFUlNJT05cIixcIjAuNC4xNjQ2NDI0OTE1XCIpO30pLmNhbGwodGhpcyk7Il0sIm5hbWVzIjpbIngiLCJhYSIsImEiLCJiIiwibGVuZ3RoIiwiZG9uZSIsInZhbHVlIiwiYmEiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0aWVzIiwiZGVmaW5lUHJvcGVydHkiLCJjIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJjYSIsImdsb2JhbFRoaXMiLCJ3aW5kb3ciLCJzZWxmIiwiZ2xvYmFsIiwiTWF0aCIsIkVycm9yIiwieSIsIkIiLCJzcGxpdCIsImQiLCJlIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJnIiwiVHlwZUVycm9yIiwiZiIsInRvU3RyaW5nIiwicmFuZG9tIiwiU3ltYm9sIiwiZGEiLCJuZXh0IiwiaXRlcmF0b3IiLCJDIiwiY2FsbCIsImVhIiwicHVzaCIsImZhIiwiY3JlYXRlIiwiaGEiLCJzZXRQcm90b3R5cGVPZiIsImlhIiwiamEiLCJrYSIsIl9fcHJvdG9fXyIsImxhIiwiRCIsImNvbnN0cnVjdG9yIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwicmEiLCJtYSIsImwiLCJpIiwiaCIsInUiLCJvIiwiaiIsIm5hIiwicyIsIm9hIiwiZ2EiLCJyZXR1cm4iLCJGIiwicGEiLCJxYSIsIkciLCJzYSIsInRocm93IiwidGEiLCJQcm9taXNlIiwicmVzb2x2ZSIsInRoZW4iLCJJIiwicmVqZWN0IiwiayIsInNldFRpbWVvdXQiLCJtIiwiSCIsIkEiLCJjb25zb2xlIiwiZXJyb3IiLCJDdXN0b21FdmVudCIsIkV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsImNhbmNlbGFibGUiLCJkb2N1bWVudCIsImNyZWF0ZUV2ZW50IiwiaW5pdEN1c3RvbUV2ZW50IiwicHJvbWlzZSIsInJlYXNvbiIsIk0iLCJwIiwibiIsInEiLCJ0IiwiciIsImNhdGNoIiwicmFjZSIsImFsbCIsInVhIiwiU3RyaW5nIiwidmEiLCJhc3NpZ24iLCJhcmd1bWVudHMiLCJoYXNPd25Qcm9wZXJ0eSIsIm1heCIsImlzIiwiUmVnRXhwIiwiaW5kZXhPZiIsIndhIiwiSiIsImV4ZWNTY3JpcHQiLCJzaGlmdCIsIksiLCJ4YSIsImZyb21DaGFyQ29kZSIsImFwcGx5IiwieWEiLCJ6YSIsIlRleHREZWNvZGVyIiwiQWEiLCJCYSIsIlRleHRFbmNvZGVyIiwiQ2EiLCJMIiwiRGEiLCJFYSIsImZsb29yIiwiam9pbiIsIkZhIiwiVWludDhBcnJheSIsIkdhIiwic3ViYXJyYXkiLCJjaGFyQXQiLCJ0ZXN0IiwiY29uY2F0IiwiSGEiLCJJYSIsIkphIiwiS2EiLCJMYSIsInNsaWNlIiwiTiIsIk1hIiwiQXJyYXlCdWZmZXIiLCJidWZmZXIiLCJieXRlT2Zmc2V0IiwiYnl0ZUxlbmd0aCIsIk5hIiwiT2EiLCJQYSIsInYiLCJRYSIsInJlc2V0IiwiTyIsIlEiLCJSYSIsIlNhIiwiZW5kIiwiUiIsIlRhIiwiVyIsInBvcCIsIlVhIiwiVmEiLCJXYSIsIlhhIiwiUyIsIllhIiwiVCIsIlphIiwiaXNGcm96ZW4iLCJlbnVtZXJhYmxlIiwiJGEiLCJVIiwiYWIiLCJpc0FycmF5IiwiYmIiLCJjYiIsImRiIiwiZnJlZXplIiwiZWIiLCJmYiIsImhhc0luc3RhbmNlIiwiZ2IiLCJWIiwiaGIiLCJYIiwiaWIiLCJqYiIsInNwbGljZSIsImtiIiwibGIiLCJtYiIsImlzRmluaXRlIiwibmIiLCJvYiIsInBiIiwicWIiLCJyYiIsInRvSlNPTiIsInNiIiwidGIiLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJ1YiIsInZiIiwid2IiLCJQIiwieGIiLCJ5YiIsInpiIiwiQWIiLCJCYiIsIkNiIiwiRGIiLCJFYiIsIkZiIiwiR2IiLCJIYiIsIkliIiwiSmIiLCJLYiIsIkxiIiwiTWIiLCJOYiIsIk9iIiwiUGIiLCJRYiIsIlJiIiwiU2IiLCJUYiIsIlViIiwiVmIiLCJzZXQiLCJXYiIsIlkiLCJOYU4iLCJJbmZpbml0eSIsInBvdyIsImlzTmFOIiwicm91bmQiLCJsb2ciLCJMTjIiLCJYYiIsImFicyIsIlliIiwiWmIiLCJmYXRhbCIsImRlY29kZSIsImVuY29kZSIsImNoYXJDb2RlQXQiLCIkYiIsIloiLCJhYyIsImJjIiwiY2MiLCJkYyIsImVjIiwiYWRkQ2xhc3NpZmljYXRpb24iLCJmYyIsImdjIiwiaGMiLCJpYyIsImpjIiwia2MiLCJsYyIsIm1jIiwibmMiLCJjcmVhdGVTaGFkZXIiLCJWRVJURVhfU0hBREVSIiwiRlJBR01FTlRfU0hBREVSIiwic2hhZGVyU291cmNlIiwiY29tcGlsZVNoYWRlciIsImdldFNoYWRlclBhcmFtZXRlciIsIkNPTVBJTEVfU1RBVFVTIiwiZ2V0U2hhZGVySW5mb0xvZyIsIm9jIiwibWFwIiwiaW5kZXgiLCJzY29yZSIsImxhYmVsIiwiZGlzcGxheU5hbWUiLCJwYyIsInoiLCJ2aXNpYmlsaXR5IiwicWMiLCJyYyIsInNjIiwidGMiLCJjYW52YXMiLCJ0cmFuc2ZlclRvSW1hZ2VCaXRtYXAiLCJjcmVhdGVJbWFnZUJpdG1hcCIsImNyZWF0ZUVsZW1lbnQiLCJoZWlnaHQiLCJ3aWR0aCIsImdldENvbnRleHQiLCJkcmF3SW1hZ2UiLCJjcmVhdGVQcm9ncmFtIiwiYXR0YWNoU2hhZGVyIiwibGlua1Byb2dyYW0iLCJnZXRQcm9ncmFtUGFyYW1ldGVyIiwiTElOS19TVEFUVVMiLCJnZXRQcm9ncmFtSW5mb0xvZyIsInVzZVByb2dyYW0iLCJnZXRVbmlmb3JtTG9jYXRpb24iLCJnZXRBdHRyaWJMb2NhdGlvbiIsImNyZWF0ZUJ1ZmZlciIsImJpbmRCdWZmZXIiLCJBUlJBWV9CVUZGRVIiLCJlbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSIsInZlcnRleEF0dHJpYlBvaW50ZXIiLCJGTE9BVCIsImJ1ZmZlckRhdGEiLCJGbG9hdDMyQXJyYXkiLCJTVEFUSUNfRFJBVyIsInVuaWZvcm0xaSIsInZpZXdwb3J0IiwiYWN0aXZlVGV4dHVyZSIsIlRFWFRVUkUwIiwiYmluZFRleHR1cmUyZCIsImdsTmFtZSIsImJpbmRGcmFtZWJ1ZmZlciIsIkRSQVdfRlJBTUVCVUZGRVIiLCJGUkFNRUJVRkZFUiIsImNsZWFyQ29sb3IiLCJjbGVhciIsIkNPTE9SX0JVRkZFUl9CSVQiLCJjb2xvck1hc2siLCJkcmF3QXJyYXlzIiwiVFJJQU5HTEVfRkFOIiwiZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5IiwidWMiLCJ2YyIsIndjIiwieGMiLCJ5YyIsInNldEF0dHJpYnV0ZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJ6YyIsIldlYkFzc2VtYmx5IiwiaW5zdGFudGlhdGUiLCJBYyIsImxpc3RlbmVycyIsIiQiLCJsb2NhdGVGaWxlIiwibG9jYXRpb24iLCJwYXRobmFtZSIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwib3B0aW9ucyIsImtleXMiLCJkZWZhdWx0IiwiY2xvc2UiLCJkZWxldGUiLCJCYyIsImZpbGVzIiwiZmlsdGVyIiwiZGF0YSIsIkNjIiwidXJsIiwicGF0aCIsInciLCJvdmVycmlkZUZpbGUiLCJzaW1kIiwiY3JlYXRlTWVkaWFwaXBlU29sdXRpb25zV2FzbSIsImNyZWF0ZU1lZGlhcGlwZVNvbHV0aW9uc1BhY2tlZEFzc2V0cyIsImdyYXBoIiwiaW1wb3J0U2NyaXB0cyIsIk1vZHVsZSIsIk9mZnNjcmVlbkNhbnZhcyIsIkdMIiwiY3JlYXRlQ29udGV4dCIsImFudGlhbGlhcyIsImFscGhhIiwiV2ViR0wyUmVuZGVyaW5nQ29udGV4dCIsIm1ha2VDb250ZXh0Q3VycmVudCIsImFsZXJ0IiwiU29sdXRpb25XYXNtIiwiRGMiLCJsb2FkR3JhcGgiLCJFYyIsInNldE9wdGlvbnMiLCJvbkNoYW5nZSIsImdyYXBoT3B0aW9uWHJlZiIsInZhbHVlTnVtYmVyIiwidHlwZSIsInZhbHVlQm9vbGVhbiIsInZhbHVlU3RyaW5nIiwiY2FsY3VsYXRvck5hbWUiLCJjYWxjdWxhdG9ySW5kZXgiLCJGYyIsIkdyYXBoT3B0aW9uQ2hhbmdlUmVxdWVzdExpc3QiLCJwdXNoX2JhY2siLCJjaGFuZ2VPcHRpb25zIiwiaW5pdGlhbGl6ZSIsImZldGNoIiwiYXJyYXlCdWZmZXIiLCJjbGVhck92ZXJyaWRkZW5GaWxlcyIsInNlbmQiLCJpbnB1dHMiLCJwZXJmb3JtYW5jZSIsIm5vdyIsIlBhY2tldERhdGFMaXN0Iiwic3RyZWFtIiwiY3JlYXRlVGV4dHVyZSIsIkhUTUxWaWRlb0VsZW1lbnQiLCJ2aWRlb1dpZHRoIiwidmlkZW9IZWlnaHQiLCJIVE1MSW1hZ2VFbGVtZW50IiwibmF0dXJhbFdpZHRoIiwibmF0dXJhbEhlaWdodCIsInRleEltYWdlMkQiLCJURVhUVVJFXzJEIiwiUkdCQSIsIlVOU0lHTkVEX0JZVEUiLCJEZXRlY3Rpb25MaXN0RGF0YSIsInNldEJvdW5kaW5nQm94IiwiRSIsInJvdGF0aW9uIiwiYWRkTm9ybWFsaXplZExhbmRtYXJrIiwicHVzaFRleHR1cmUyZCIsInRpbWVzdGFtcCIsInB1c2hEZXRlY3Rpb25MaXN0IiwiR2MiLCJIYyIsImdldFJlY3RMaXN0IiwiZ2V0TGFuZG1hcmtzTGlzdCIsImdldENsYXNzaWZpY2F0aW9uc0xpc3QiLCJzaXplIiwiZ2V0IiwidHJhbnNmb3JtIiwiVWludDhCbG9iTGlzdCIsIlRleHR1cmUyZERhdGFPdXQiLCJuYW1lIiwid2FudHMiLCJTdHJpbmdMaXN0IiwiUGFja2V0TGlzdGVuZXIiLCJpbXBsZW1lbnQiLCJvblJlc3VsdHMiLCJvdXRzIiwiYXR0YWNoTXVsdGlMaXN0ZW5lciIsIkJPT0wiLCJOVU1CRVIiLCJJYyIsIkpjIiwibW9kZWxDb21wbGV4aXR5IiwiaW1hZ2UiLCJtdWx0aUhhbmRMYW5kbWFya3MiLCJtdWx0aUhhbmRXb3JsZExhbmRtYXJrcyIsIm11bHRpSGFuZGVkbmVzcyIsInVzZUNwdUluZmVyZW5jZSIsImNhbGN1bGF0b3JUeXBlIiwiZmllbGROYW1lIiwibmF2aWdhdG9yIiwiaW5jbHVkZXMiLCJwbGF0Zm9ybSIsInVzZXJBZ2VudCIsInNlbGZpZU1vZGUiLCJtYXhOdW1IYW5kcyIsIm1pbkRldGVjdGlvbkNvbmZpZGVuY2UiLCJtaW5UcmFja2luZ0NvbmZpZGVuY2UiXSwibWFwcGluZ3MiOiJBQUFDLENBQUE7SUFLRDtJQUFhLElBQUlBO0lBQUUsU0FBU0MsR0FBR0MsQ0FBQztRQUFFLElBQUlDLElBQUU7UUFBRSxPQUFPO1lBQVcsT0FBT0EsSUFBRUQsRUFBRUUsTUFBTSxHQUFDO2dCQUFDQyxNQUFLLENBQUM7Z0JBQUVDLE9BQU1KLENBQUMsQ0FBQ0MsSUFBSTtZQUFBLElBQUU7Z0JBQUNFLE1BQUssQ0FBQztZQUFDO1FBQUM7SUFBQztJQUFDLElBQUlFLEtBQUcsY0FBWSxPQUFPQyxPQUFPQyxnQkFBZ0IsR0FBQ0QsT0FBT0UsY0FBYyxHQUFDLFNBQVNSLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDO1FBQUUsSUFBR1QsS0FBR1UsTUFBTUMsU0FBUyxJQUFFWCxLQUFHTSxPQUFPSyxTQUFTLEVBQUMsT0FBT1g7UUFBRUEsQ0FBQyxDQUFDQyxFQUFFLEdBQUNRLEVBQUVMLEtBQUs7UUFBQyxPQUFPSjtJQUFDO0lBQ2pSLFNBQVNZLEdBQUdaLENBQUM7UUFBRUEsSUFBRTtZQUFDLFlBQVUsT0FBT2EsY0FBWUE7WUFBV2I7WUFBRSxZQUFVLE9BQU9jLFVBQVFBO1lBQU8sWUFBVSxPQUFPQyxRQUFNQTtZQUFLLFlBQVUsT0FBT0MsVUFBUUE7U0FBTztRQUFDLElBQUksSUFBSWYsSUFBRSxHQUFFQSxJQUFFRCxFQUFFRSxNQUFNLEVBQUMsRUFBRUQsRUFBRTtZQUFDLElBQUlRLElBQUVULENBQUMsQ0FBQ0MsRUFBRTtZQUFDLElBQUdRLEtBQUdBLEVBQUVRLElBQUksSUFBRUEsTUFBSyxPQUFPUjtRQUFDO1FBQUMsTUFBTVMsTUFBTTtJQUE2QjtJQUFDLElBQUlDLElBQUVQLEdBQUcsSUFBSTtJQUFFLFNBQVNRLEVBQUVwQixDQUFDLEVBQUNDLENBQUM7UUFBRSxJQUFHQSxHQUFFRCxHQUFFO1lBQUMsSUFBSVMsSUFBRVU7WUFBRW5CLElBQUVBLEVBQUVxQixLQUFLLENBQUM7WUFBSyxJQUFJLElBQUlDLElBQUUsR0FBRUEsSUFBRXRCLEVBQUVFLE1BQU0sR0FBQyxHQUFFb0IsSUFBSTtnQkFBQyxJQUFJQyxJQUFFdkIsQ0FBQyxDQUFDc0IsRUFBRTtnQkFBQyxJQUFHLENBQUVDLENBQUFBLEtBQUtkLENBQUFBLEdBQUcsTUFBTVQ7Z0JBQUVTLElBQUVBLENBQUMsQ0FBQ2MsRUFBRTtZQUFBO1lBQUN2QixJQUFFQSxDQUFDLENBQUNBLEVBQUVFLE1BQU0sR0FBQyxFQUFFO1lBQUNvQixJQUFFYixDQUFDLENBQUNULEVBQUU7WUFBQ0MsSUFBRUEsRUFBRXFCO1lBQUdyQixLQUFHcUIsS0FBRyxRQUFNckIsS0FBR0ksR0FBR0ksR0FBRVQsR0FBRTtnQkFBQ3dCLGNBQWEsQ0FBQztnQkFBRUMsVUFBUyxDQUFDO2dCQUFFckIsT0FBTUg7WUFBQztRQUFFO0lBQUM7SUFDcGVtQixFQUFFLFVBQVMsU0FBU3BCLENBQUM7UUFBRSxTQUFTQyxFQUFFeUIsQ0FBQztZQUFFLElBQUcsSUFBSSxZQUFZekIsR0FBRSxNQUFNLElBQUkwQixVQUFVO1lBQStCLE9BQU8sSUFBSWxCLEVBQUVhLElBQUdJLENBQUFBLEtBQUcsRUFBQyxJQUFHLE1BQUlILEtBQUlHO1FBQUU7UUFBQyxTQUFTakIsRUFBRWlCLENBQUMsRUFBQ0UsQ0FBQztZQUFFLElBQUksQ0FBQ0YsQ0FBQyxHQUFDQTtZQUFFckIsR0FBRyxJQUFJLEVBQUMsZUFBYztnQkFBQ21CLGNBQWEsQ0FBQztnQkFBRUMsVUFBUyxDQUFDO2dCQUFFckIsT0FBTXdCO1lBQUM7UUFBRTtRQUFDLElBQUc1QixHQUFFLE9BQU9BO1FBQUVTLEVBQUVFLFNBQVMsQ0FBQ2tCLFFBQVEsR0FBQztZQUFXLE9BQU8sSUFBSSxDQUFDSCxDQUFDO1FBQUE7UUFBRSxJQUFJSixJQUFFLG1CQUFrQixDQUFBLE1BQUlMLEtBQUthLE1BQU0sT0FBSyxDQUFBLElBQUcsS0FBSVAsSUFBRTtRQUFFLE9BQU90QjtJQUFDO0lBQ2pXbUIsRUFBRSxtQkFBa0IsU0FBU3BCLENBQUM7UUFBRSxJQUFHQSxHQUFFLE9BQU9BO1FBQUVBLElBQUUrQixPQUFPO1FBQW1CLElBQUksSUFBSTlCLElBQUUsdUhBQXVIb0IsS0FBSyxDQUFDLE1BQUtaLElBQUUsR0FBRUEsSUFBRVIsRUFBRUMsTUFBTSxFQUFDTyxJQUFJO1lBQUMsSUFBSWEsSUFBRUgsQ0FBQyxDQUFDbEIsQ0FBQyxDQUFDUSxFQUFFLENBQUM7WUFBQyxlQUFhLE9BQU9hLEtBQUcsY0FBWSxPQUFPQSxFQUFFWCxTQUFTLENBQUNYLEVBQUUsSUFBRUssR0FBR2lCLEVBQUVYLFNBQVMsRUFBQ1gsR0FBRTtnQkFBQ3dCLGNBQWEsQ0FBQztnQkFBRUMsVUFBUyxDQUFDO2dCQUFFckIsT0FBTTtvQkFBVyxPQUFPNEIsR0FBR2pDLEdBQUcsSUFBSTtnQkFBRTtZQUFDO1FBQUU7UUFBQyxPQUFPQztJQUFDO0lBQUcsU0FBU2dDLEdBQUdoQyxDQUFDO1FBQUVBLElBQUU7WUFBQ2lDLE1BQUtqQztRQUFDO1FBQUVBLENBQUMsQ0FBQytCLE9BQU9HLFFBQVEsQ0FBQyxHQUFDO1lBQVcsT0FBTyxJQUFJO1FBQUE7UUFBRSxPQUFPbEM7SUFBQztJQUNoZSxTQUFTbUMsRUFBRW5DLENBQUM7UUFBRSxJQUFJQyxJQUFFLGVBQWEsT0FBTzhCLFVBQVFBLE9BQU9HLFFBQVEsSUFBRWxDLENBQUMsQ0FBQytCLE9BQU9HLFFBQVEsQ0FBQztRQUFDLE9BQU9qQyxJQUFFQSxFQUFFbUMsSUFBSSxDQUFDcEMsS0FBRztZQUFDaUMsTUFBS2xDLEdBQUdDO1FBQUU7SUFBQztJQUFDLFNBQVNxQyxHQUFHckMsQ0FBQztRQUFFLElBQUcsQ0FBRUEsQ0FBQUEsYUFBYVUsS0FBSSxHQUFHO1lBQUNWLElBQUVtQyxFQUFFbkM7WUFBRyxJQUFJLElBQUlDLEdBQUVRLElBQUUsRUFBRSxFQUFDLENBQUMsQUFBQ1IsQ0FBQUEsSUFBRUQsRUFBRWlDLElBQUksRUFBQyxFQUFHOUIsSUFBSSxFQUFFTSxFQUFFNkIsSUFBSSxDQUFDckMsRUFBRUcsS0FBSztZQUFFSixJQUFFUztRQUFDO1FBQUMsT0FBT1Q7SUFBQztJQUFDLElBQUl1QyxLQUFHLGNBQVksT0FBT2pDLE9BQU9rQyxNQUFNLEdBQUNsQyxPQUFPa0MsTUFBTSxHQUFDLFNBQVN4QyxDQUFDO1FBQUUsU0FBU0MsS0FBSTtRQUFDQSxFQUFFVSxTQUFTLEdBQUNYO1FBQUUsT0FBTyxJQUFJQztJQUFDLEdBQUV3QztJQUNoVixJQUFHLGNBQVksT0FBT25DLE9BQU9vQyxjQUFjLEVBQUNELEtBQUduQyxPQUFPb0MsY0FBYztTQUFLO1FBQUMsSUFBSUM7UUFBRzNDLEdBQUU7WUFBQyxJQUFJNEMsS0FBRztnQkFBQzVDLEdBQUUsQ0FBQztZQUFDLEdBQUU2QyxLQUFHLENBQUM7WUFBRSxJQUFHO2dCQUFDQSxHQUFHQyxTQUFTLEdBQUNGO2dCQUFHRCxLQUFHRSxHQUFHN0MsQ0FBQztnQkFBQyxNQUFNQTtZQUFDLEVBQUMsT0FBTUEsR0FBRSxDQUFDO1lBQUMyQyxLQUFHLENBQUM7UUFBQztRQUFDRixLQUFHRSxLQUFHLFNBQVMzQyxDQUFDLEVBQUNDLENBQUM7WUFBRUQsRUFBRThDLFNBQVMsR0FBQzdDO1lBQUUsSUFBR0QsRUFBRThDLFNBQVMsS0FBRzdDLEdBQUUsTUFBTSxJQUFJMEIsVUFBVTNCLElBQUU7WUFBc0IsT0FBT0E7UUFBQyxJQUFFO0lBQUk7SUFBQyxJQUFJK0MsS0FBR047SUFDblIsU0FBU08sRUFBRWhELENBQUMsRUFBQ0MsQ0FBQztRQUFFRCxFQUFFVyxTQUFTLEdBQUM0QixHQUFHdEMsRUFBRVUsU0FBUztRQUFFWCxFQUFFVyxTQUFTLENBQUNzQyxXQUFXLEdBQUNqRDtRQUFFLElBQUcrQyxJQUFHQSxHQUFHL0MsR0FBRUM7YUFBUSxJQUFJLElBQUlRLEtBQUtSLEVBQUUsSUFBRyxlQUFhUSxHQUFFLElBQUdILE9BQU9DLGdCQUFnQixFQUFDO1lBQUMsSUFBSWUsSUFBRWhCLE9BQU80Qyx3QkFBd0IsQ0FBQ2pELEdBQUVRO1lBQUdhLEtBQUdoQixPQUFPRSxjQUFjLENBQUNSLEdBQUVTLEdBQUVhO1FBQUUsT0FBTXRCLENBQUMsQ0FBQ1MsRUFBRSxHQUFDUixDQUFDLENBQUNRLEVBQUU7UUFBQ1QsRUFBRW1ELEVBQUUsR0FBQ2xELEVBQUVVLFNBQVM7SUFBQTtJQUFDLFNBQVN5QztRQUFLLElBQUksQ0FBQ0MsQ0FBQyxHQUFDLENBQUM7UUFBRSxJQUFJLENBQUNDLENBQUMsR0FBQztRQUFLLElBQUksQ0FBQ0MsQ0FBQyxHQUFDLEtBQUs7UUFBRSxJQUFJLENBQUM3QixDQUFDLEdBQUM7UUFBRSxJQUFJLENBQUM4QixDQUFDLEdBQUMsSUFBSSxDQUFDQyxDQUFDLEdBQUM7UUFBRSxJQUFJLENBQUNDLENBQUMsR0FBQztJQUFJO0lBQUMsU0FBU0MsR0FBRzNELENBQUM7UUFBRSxJQUFHQSxFQUFFcUQsQ0FBQyxFQUFDLE1BQU0sSUFBSTFCLFVBQVU7UUFBZ0MzQixFQUFFcUQsQ0FBQyxHQUFDLENBQUM7SUFBQztJQUFDRCxHQUFHekMsU0FBUyxDQUFDaUQsQ0FBQyxHQUFDLFNBQVM1RCxDQUFDO1FBQUUsSUFBSSxDQUFDdUQsQ0FBQyxHQUFDdkQ7SUFBQztJQUM1YyxTQUFTNkQsR0FBRzdELENBQUMsRUFBQ0MsQ0FBQztRQUFFRCxFQUFFMEQsQ0FBQyxHQUFDO1lBQUNuQixJQUFHdEM7WUFBRTZELElBQUcsQ0FBQztRQUFDO1FBQUU5RCxFQUFFMEIsQ0FBQyxHQUFDMUIsRUFBRXlELENBQUMsSUFBRXpELEVBQUV3RCxDQUFDO0lBQUE7SUFBQ0osR0FBR3pDLFNBQVMsQ0FBQ29ELE1BQU0sR0FBQyxTQUFTL0QsQ0FBQztRQUFFLElBQUksQ0FBQzBELENBQUMsR0FBQztZQUFDSyxRQUFPL0Q7UUFBQztRQUFFLElBQUksQ0FBQzBCLENBQUMsR0FBQyxJQUFJLENBQUM4QixDQUFDO0lBQUE7SUFBRSxTQUFTUSxFQUFFaEUsQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUM7UUFBRVQsRUFBRTBCLENBQUMsR0FBQ2pCO1FBQUUsT0FBTTtZQUFDTCxPQUFNSDtRQUFDO0lBQUM7SUFBQyxTQUFTZ0UsR0FBR2pFLENBQUM7UUFBRSxJQUFJLENBQUMwQixDQUFDLEdBQUMsSUFBSTBCO1FBQUcsSUFBSSxDQUFDRyxDQUFDLEdBQUN2RDtJQUFDO0lBQUMsU0FBU2tFLEdBQUdsRSxDQUFDLEVBQUNDLENBQUM7UUFBRTBELEdBQUczRCxFQUFFMEIsQ0FBQztRQUFFLElBQUlqQixJQUFFVCxFQUFFMEIsQ0FBQyxDQUFDNEIsQ0FBQztRQUFDLElBQUc3QyxHQUFFLE9BQU8wQyxHQUFHbkQsR0FBRSxZQUFXUyxJQUFFQSxDQUFDLENBQUMsU0FBUyxHQUFDLFNBQVNhLENBQUM7WUFBRSxPQUFNO2dCQUFDbEIsT0FBTWtCO2dCQUFFbkIsTUFBSyxDQUFDO1lBQUM7UUFBQyxHQUFFRixHQUFFRCxFQUFFMEIsQ0FBQyxDQUFDcUMsTUFBTTtRQUFFL0QsRUFBRTBCLENBQUMsQ0FBQ3FDLE1BQU0sQ0FBQzlEO1FBQUcsT0FBT2tFLEVBQUVuRTtJQUFFO0lBQ3pWLFNBQVNtRCxHQUFHbkQsQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUMsRUFBQ2EsQ0FBQztRQUFFLElBQUc7WUFBQyxJQUFJQyxJQUFFdEIsRUFBRW1DLElBQUksQ0FBQ3BDLEVBQUUwQixDQUFDLENBQUM0QixDQUFDLEVBQUM3QztZQUFHLElBQUcsQ0FBRWMsQ0FBQUEsYUFBYWpCLE1BQUssR0FBRyxNQUFNLElBQUlxQixVQUFVLHFCQUFtQkosSUFBRTtZQUFxQixJQUFHLENBQUNBLEVBQUVwQixJQUFJLEVBQUMsT0FBT0gsRUFBRTBCLENBQUMsQ0FBQzJCLENBQUMsR0FBQyxDQUFDLEdBQUU5QjtZQUFFLElBQUlHLElBQUVILEVBQUVuQixLQUFLO1FBQUEsRUFBQyxPQUFNd0IsR0FBRTtZQUFDLE9BQU81QixFQUFFMEIsQ0FBQyxDQUFDNEIsQ0FBQyxHQUFDLE1BQUtPLEdBQUc3RCxFQUFFMEIsQ0FBQyxFQUFDRSxJQUFHdUMsRUFBRW5FO1FBQUU7UUFBQ0EsRUFBRTBCLENBQUMsQ0FBQzRCLENBQUMsR0FBQztRQUFLaEMsRUFBRWMsSUFBSSxDQUFDcEMsRUFBRTBCLENBQUMsRUFBQ0E7UUFBRyxPQUFPeUMsRUFBRW5FO0lBQUU7SUFBQyxTQUFTbUUsRUFBRW5FLENBQUM7UUFBRSxNQUFLQSxFQUFFMEIsQ0FBQyxDQUFDQSxDQUFDLEVBQUUsSUFBRztZQUFDLElBQUl6QixJQUFFRCxFQUFFdUQsQ0FBQyxDQUFDdkQsRUFBRTBCLENBQUM7WUFBRSxJQUFHekIsR0FBRSxPQUFPRCxFQUFFMEIsQ0FBQyxDQUFDMkIsQ0FBQyxHQUFDLENBQUMsR0FBRTtnQkFBQ2pELE9BQU1ILEVBQUVHLEtBQUs7Z0JBQUNELE1BQUssQ0FBQztZQUFDO1FBQUMsRUFBQyxPQUFNTSxHQUFFO1lBQUNULEVBQUUwQixDQUFDLENBQUM2QixDQUFDLEdBQUMsS0FBSyxHQUFFTSxHQUFHN0QsRUFBRTBCLENBQUMsRUFBQ2pCO1FBQUU7UUFBQ1QsRUFBRTBCLENBQUMsQ0FBQzJCLENBQUMsR0FBQyxDQUFDO1FBQUUsSUFBR3JELEVBQUUwQixDQUFDLENBQUNnQyxDQUFDLEVBQUM7WUFBQ3pELElBQUVELEVBQUUwQixDQUFDLENBQUNnQyxDQUFDO1lBQUMxRCxFQUFFMEIsQ0FBQyxDQUFDZ0MsQ0FBQyxHQUFDO1lBQUssSUFBR3pELEVBQUU2RCxFQUFFLEVBQUMsTUFBTTdELEVBQUVzQyxFQUFFO1lBQUMsT0FBTTtnQkFBQ25DLE9BQU1ILEVBQUU4RCxNQUFNO2dCQUFDNUQsTUFBSyxDQUFDO1lBQUM7UUFBQztRQUFDLE9BQU07WUFBQ0MsT0FBTSxLQUFLO1lBQUVELE1BQUssQ0FBQztRQUFDO0lBQUM7SUFDL2UsU0FBU2lFLEdBQUdwRSxDQUFDO1FBQUUsSUFBSSxDQUFDaUMsSUFBSSxHQUFDLFNBQVNoQyxDQUFDO1lBQUUwRCxHQUFHM0QsRUFBRTBCLENBQUM7WUFBRTFCLEVBQUUwQixDQUFDLENBQUM0QixDQUFDLEdBQUNyRCxJQUFFa0QsR0FBR25ELEdBQUVBLEVBQUUwQixDQUFDLENBQUM0QixDQUFDLENBQUNyQixJQUFJLEVBQUNoQyxHQUFFRCxFQUFFMEIsQ0FBQyxDQUFDa0MsQ0FBQyxJQUFHNUQsQ0FBQUEsRUFBRTBCLENBQUMsQ0FBQ2tDLENBQUMsQ0FBQzNELElBQUdBLElBQUVrRSxFQUFFbkUsRUFBQztZQUFHLE9BQU9DO1FBQUM7UUFBRSxJQUFJLENBQUNvRSxLQUFLLEdBQUMsU0FBU3BFLENBQUM7WUFBRTBELEdBQUczRCxFQUFFMEIsQ0FBQztZQUFFMUIsRUFBRTBCLENBQUMsQ0FBQzRCLENBQUMsR0FBQ3JELElBQUVrRCxHQUFHbkQsR0FBRUEsRUFBRTBCLENBQUMsQ0FBQzRCLENBQUMsQ0FBQyxRQUFRLEVBQUNyRCxHQUFFRCxFQUFFMEIsQ0FBQyxDQUFDa0MsQ0FBQyxJQUFHQyxDQUFBQSxHQUFHN0QsRUFBRTBCLENBQUMsRUFBQ3pCLElBQUdBLElBQUVrRSxFQUFFbkUsRUFBQztZQUFHLE9BQU9DO1FBQUM7UUFBRSxJQUFJLENBQUM4RCxNQUFNLEdBQUMsU0FBUzlELENBQUM7WUFBRSxPQUFPaUUsR0FBR2xFLEdBQUVDO1FBQUU7UUFBRSxJQUFJLENBQUM4QixPQUFPRyxRQUFRLENBQUMsR0FBQztZQUFXLE9BQU8sSUFBSTtRQUFBO0lBQUM7SUFBQyxTQUFTb0MsR0FBR3RFLENBQUM7UUFBRSxTQUFTQyxFQUFFcUIsQ0FBQztZQUFFLE9BQU90QixFQUFFaUMsSUFBSSxDQUFDWDtRQUFFO1FBQUMsU0FBU2IsRUFBRWEsQ0FBQztZQUFFLE9BQU90QixFQUFFcUUsS0FBSyxDQUFDL0M7UUFBRTtRQUFDLE9BQU8sSUFBSWlELFFBQVEsU0FBU2pELENBQUMsRUFBQ0MsQ0FBQztZQUFFLFNBQVNHLEVBQUVFLENBQUM7Z0JBQUVBLEVBQUV6QixJQUFJLEdBQUNtQixFQUFFTSxFQUFFeEIsS0FBSyxJQUFFbUUsUUFBUUMsT0FBTyxDQUFDNUMsRUFBRXhCLEtBQUssRUFBRXFFLElBQUksQ0FBQ3hFLEdBQUVRLEdBQUdnRSxJQUFJLENBQUMvQyxHQUFFSDtZQUFFO1lBQUNHLEVBQUUxQixFQUFFaUMsSUFBSTtRQUFHO0lBQUU7SUFDMWUsU0FBU3lDLEVBQUUxRSxDQUFDO1FBQUUsT0FBT3NFLEdBQUcsSUFBSUYsR0FBRyxJQUFJSCxHQUFHakU7SUFBSTtJQUMxQ29CLEVBQUUsV0FBVSxTQUFTcEIsQ0FBQztRQUFFLFNBQVNDLEVBQUUyQixDQUFDO1lBQUUsSUFBSSxDQUFDMkIsQ0FBQyxHQUFDO1lBQUUsSUFBSSxDQUFDRCxDQUFDLEdBQUMsS0FBSztZQUFFLElBQUksQ0FBQzVCLENBQUMsR0FBQyxFQUFFO1lBQUMsSUFBSSxDQUFDa0MsQ0FBQyxHQUFDLENBQUM7WUFBRSxJQUFJTCxJQUFFLElBQUksQ0FBQ0csQ0FBQztZQUFHLElBQUc7Z0JBQUM5QixFQUFFMkIsRUFBRWlCLE9BQU8sRUFBQ2pCLEVBQUVvQixNQUFNO1lBQUMsRUFBQyxPQUFNQyxHQUFFO2dCQUFDckIsRUFBRW9CLE1BQU0sQ0FBQ0M7WUFBRTtRQUFDO1FBQUMsU0FBU25FO1lBQUksSUFBSSxDQUFDaUIsQ0FBQyxHQUFDO1FBQUk7UUFBQyxTQUFTSixFQUFFTSxDQUFDO1lBQUUsT0FBT0EsYUFBYTNCLElBQUUyQixJQUFFLElBQUkzQixFQUFFLFNBQVNzRCxDQUFDO2dCQUFFQSxFQUFFM0I7WUFBRTtRQUFFO1FBQUMsSUFBRzVCLEdBQUUsT0FBT0E7UUFBRVMsRUFBRUUsU0FBUyxDQUFDNEMsQ0FBQyxHQUFDLFNBQVMzQixDQUFDO1lBQUUsSUFBRyxRQUFNLElBQUksQ0FBQ0YsQ0FBQyxFQUFDO2dCQUFDLElBQUksQ0FBQ0EsQ0FBQyxHQUFDLEVBQUU7Z0JBQUMsSUFBSTZCLElBQUUsSUFBSTtnQkFBQyxJQUFJLENBQUNELENBQUMsQ0FBQztvQkFBV0MsRUFBRUYsQ0FBQztnQkFBRTtZQUFFO1lBQUMsSUFBSSxDQUFDM0IsQ0FBQyxDQUFDWSxJQUFJLENBQUNWO1FBQUU7UUFBRSxJQUFJTCxJQUFFSixFQUFFMEQsVUFBVTtRQUFDcEUsRUFBRUUsU0FBUyxDQUFDMkMsQ0FBQyxHQUFDLFNBQVMxQixDQUFDO1lBQUVMLEVBQUVLLEdBQUU7UUFBRTtRQUFFbkIsRUFBRUUsU0FBUyxDQUFDMEMsQ0FBQyxHQUFDO1lBQVcsTUFBSyxJQUFJLENBQUMzQixDQUFDLElBQUUsSUFBSSxDQUFDQSxDQUFDLENBQUN4QixNQUFNLEVBQUU7Z0JBQUMsSUFBSTBCLElBQUUsSUFBSSxDQUFDRixDQUFDO2dCQUFDLElBQUksQ0FBQ0EsQ0FBQyxHQUFDLEVBQUU7Z0JBQUMsSUFBSSxJQUFJNkIsSUFBRSxHQUFFQSxJQUFFM0IsRUFBRTFCLE1BQU0sRUFBQyxFQUFFcUQsRUFBRTtvQkFBQyxJQUFJcUIsSUFDbGdCaEQsQ0FBQyxDQUFDMkIsRUFBRTtvQkFBQzNCLENBQUMsQ0FBQzJCLEVBQUUsR0FBQztvQkFBSyxJQUFHO3dCQUFDcUI7b0JBQUcsRUFBQyxPQUFNdkIsR0FBRTt3QkFBQyxJQUFJLENBQUNLLENBQUMsQ0FBQ0w7b0JBQUU7Z0JBQUM7WUFBQztZQUFDLElBQUksQ0FBQzNCLENBQUMsR0FBQztRQUFJO1FBQUVqQixFQUFFRSxTQUFTLENBQUMrQyxDQUFDLEdBQUMsU0FBUzlCLENBQUM7WUFBRSxJQUFJLENBQUMwQixDQUFDLENBQUM7Z0JBQVcsTUFBTTFCO1lBQUU7UUFBRTtRQUFFM0IsRUFBRVUsU0FBUyxDQUFDK0MsQ0FBQyxHQUFDO1lBQVcsU0FBUzlCLEVBQUV5QixDQUFDO2dCQUFFLE9BQU8sU0FBU3lCLENBQUM7b0JBQUVGLEtBQUlBLENBQUFBLElBQUUsQ0FBQyxHQUFFdkIsRUFBRWpCLElBQUksQ0FBQ21CLEdBQUV1QixFQUFDO2dCQUFFO1lBQUM7WUFBQyxJQUFJdkIsSUFBRSxJQUFJLEVBQUNxQixJQUFFLENBQUM7WUFBRSxPQUFNO2dCQUFDSixTQUFRNUMsRUFBRSxJQUFJLENBQUNvQixDQUFDO2dCQUFFMkIsUUFBTy9DLEVBQUUsSUFBSSxDQUFDeUIsQ0FBQztZQUFDO1FBQUM7UUFBRXBELEVBQUVVLFNBQVMsQ0FBQ3FDLENBQUMsR0FBQyxTQUFTcEIsQ0FBQztZQUFFLElBQUdBLE1BQUksSUFBSSxFQUFDLElBQUksQ0FBQ3lCLENBQUMsQ0FBQyxJQUFJMUIsVUFBVTtpQkFBNEMsSUFBR0MsYUFBYTNCLEdBQUUsSUFBSSxDQUFDOEUsQ0FBQyxDQUFDbkQ7aUJBQU87Z0JBQUM1QixHQUFFLE9BQU8sT0FBTzRCO29CQUFHLEtBQUs7d0JBQVMsSUFBSTJCLElBQUUsUUFBTTNCO3dCQUFFLE1BQU01QjtvQkFBRSxLQUFLO3dCQUFXdUQsSUFBRSxDQUFDO3dCQUFFLE1BQU12RDtvQkFBRTt3QkFBUXVELElBQUUsQ0FBQztnQkFBQztnQkFBQ0EsSUFBRSxJQUFJLENBQUN5QixDQUFDLENBQUNwRCxLQUFHLElBQUksQ0FBQzZCLENBQUMsQ0FBQzdCO1lBQUU7UUFBQztRQUM3ZjNCLEVBQUVVLFNBQVMsQ0FBQ3FFLENBQUMsR0FBQyxTQUFTcEQsQ0FBQztZQUFFLElBQUkyQixJQUFFLEtBQUs7WUFBRSxJQUFHO2dCQUFDQSxJQUFFM0IsRUFBRTZDLElBQUk7WUFBQSxFQUFDLE9BQU1HLEdBQUU7Z0JBQUMsSUFBSSxDQUFDdkIsQ0FBQyxDQUFDdUI7Z0JBQUc7WUFBTTtZQUFDLGNBQVksT0FBT3JCLElBQUUsSUFBSSxDQUFDbUIsQ0FBQyxDQUFDbkIsR0FBRTNCLEtBQUcsSUFBSSxDQUFDNkIsQ0FBQyxDQUFDN0I7UUFBRTtRQUFFM0IsRUFBRVUsU0FBUyxDQUFDMEMsQ0FBQyxHQUFDLFNBQVN6QixDQUFDO1lBQUUsSUFBSSxDQUFDNEIsQ0FBQyxDQUFDLEdBQUU1QjtRQUFFO1FBQUUzQixFQUFFVSxTQUFTLENBQUM4QyxDQUFDLEdBQUMsU0FBUzdCLENBQUM7WUFBRSxJQUFJLENBQUM0QixDQUFDLENBQUMsR0FBRTVCO1FBQUU7UUFBRTNCLEVBQUVVLFNBQVMsQ0FBQzZDLENBQUMsR0FBQyxTQUFTNUIsQ0FBQyxFQUFDMkIsQ0FBQztZQUFFLElBQUcsS0FBRyxJQUFJLENBQUNBLENBQUMsRUFBQyxNQUFNckMsTUFBTSxtQkFBaUJVLElBQUUsT0FBSzJCLElBQUUsd0NBQXNDLElBQUksQ0FBQ0EsQ0FBQztZQUFFLElBQUksQ0FBQ0EsQ0FBQyxHQUFDM0I7WUFBRSxJQUFJLENBQUMwQixDQUFDLEdBQUNDO1lBQUUsTUFBSSxJQUFJLENBQUNBLENBQUMsSUFBRSxJQUFJLENBQUNZLENBQUM7WUFBRyxJQUFJLENBQUMvQyxDQUFDO1FBQUU7UUFBRW5CLEVBQUVVLFNBQVMsQ0FBQ3dELENBQUMsR0FBQztZQUFXLElBQUl2QyxJQUFFLElBQUk7WUFBQ0wsRUFBRTtnQkFBVyxJQUFHSyxFQUFFTyxDQUFDLElBQUc7b0JBQUMsSUFBSW9CLElBQUVwQyxFQUFFOEQsT0FBTztvQkFBQyxnQkFBYyxPQUFPMUIsS0FBR0EsRUFBRTJCLEtBQUssQ0FBQ3RELEVBQUUwQixDQUFDO2dCQUFDO1lBQUMsR0FBRTtRQUFFO1FBQUVyRCxFQUFFVSxTQUFTLENBQUN3QixDQUFDLEdBQ3pmO1lBQVcsSUFBRyxJQUFJLENBQUN5QixDQUFDLEVBQUMsT0FBTSxDQUFDO1lBQUUsSUFBSWhDLElBQUVULEVBQUVnRSxXQUFXLEVBQUM1QixJQUFFcEMsRUFBRWlFLEtBQUssRUFBQ1IsSUFBRXpELEVBQUVrRSxhQUFhO1lBQUMsSUFBRyxnQkFBYyxPQUFPVCxHQUFFLE9BQU0sQ0FBQztZQUFFLGVBQWEsT0FBT2hELElBQUVBLElBQUUsSUFBSUEsRUFBRSxzQkFBcUI7Z0JBQUMwRCxZQUFXLENBQUM7WUFBQyxLQUFHLGVBQWEsT0FBTy9CLElBQUUzQixJQUFFLElBQUkyQixFQUFFLHNCQUFxQjtnQkFBQytCLFlBQVcsQ0FBQztZQUFDLEtBQUkxRCxDQUFBQSxJQUFFVCxFQUFFb0UsUUFBUSxDQUFDQyxXQUFXLENBQUMsZ0JBQWU1RCxFQUFFNkQsZUFBZSxDQUFDLHNCQUFxQixDQUFDLEdBQUUsQ0FBQyxHQUFFN0QsRUFBQztZQUFHQSxFQUFFOEQsT0FBTyxHQUFDLElBQUk7WUFBQzlELEVBQUUrRCxNQUFNLEdBQUMsSUFBSSxDQUFDckMsQ0FBQztZQUFDLE9BQU9zQixFQUFFaEQ7UUFBRTtRQUFFM0IsRUFBRVUsU0FBUyxDQUFDUyxDQUFDLEdBQUM7WUFBVyxJQUFHLFFBQU0sSUFBSSxDQUFDTSxDQUFDLEVBQUM7Z0JBQUMsSUFBSSxJQUFJRSxJQUFFLEdBQUVBLElBQUUsSUFBSSxDQUFDRixDQUFDLENBQUN4QixNQUFNLEVBQUMsRUFBRTBCLEVBQUVGLEVBQUU2QixDQUFDLENBQUMsSUFBSSxDQUFDN0IsQ0FBQyxDQUFDRSxFQUFFO2dCQUFFLElBQUksQ0FBQ0YsQ0FBQyxHQUFDO1lBQUk7UUFBQztRQUFFLElBQUlBLElBQUUsSUFBSWpCO1FBQUVSLEVBQUVVLFNBQVMsQ0FBQ29FLENBQUMsR0FDL2YsU0FBU25ELENBQUM7WUFBRSxJQUFJMkIsSUFBRSxJQUFJLENBQUNHLENBQUM7WUFBRzlCLEVBQUVnRSxDQUFDLENBQUNyQyxFQUFFaUIsT0FBTyxFQUFDakIsRUFBRW9CLE1BQU07UUFBQztRQUFFMUUsRUFBRVUsU0FBUyxDQUFDK0QsQ0FBQyxHQUFDLFNBQVM5QyxDQUFDLEVBQUMyQixDQUFDO1lBQUUsSUFBSXFCLElBQUUsSUFBSSxDQUFDbEIsQ0FBQztZQUFHLElBQUc7Z0JBQUM5QixFQUFFUSxJQUFJLENBQUNtQixHQUFFcUIsRUFBRUosT0FBTyxFQUFDSSxFQUFFRCxNQUFNO1lBQUMsRUFBQyxPQUFNdEIsR0FBRTtnQkFBQ3VCLEVBQUVELE1BQU0sQ0FBQ3RCO1lBQUU7UUFBQztRQUFFcEQsRUFBRVUsU0FBUyxDQUFDOEQsSUFBSSxHQUFDLFNBQVM3QyxDQUFDLEVBQUMyQixDQUFDO1lBQUUsU0FBU3FCLEVBQUVpQixDQUFDLEVBQUNDLENBQUM7Z0JBQUUsT0FBTSxjQUFZLE9BQU9ELElBQUUsU0FBU0UsQ0FBQztvQkFBRSxJQUFHO3dCQUFDMUMsRUFBRXdDLEVBQUVFO29CQUFHLEVBQUMsT0FBTUMsR0FBRTt3QkFBQ2xCLEVBQUVrQjtvQkFBRTtnQkFBQyxJQUFFRjtZQUFDO1lBQUMsSUFBSXpDLEdBQUV5QixHQUFFbUIsSUFBRSxJQUFJaEcsRUFBRSxTQUFTNEYsQ0FBQyxFQUFDQyxDQUFDO2dCQUFFekMsSUFBRXdDO2dCQUFFZixJQUFFZ0I7WUFBQztZQUFHLElBQUksQ0FBQ0YsQ0FBQyxDQUFDaEIsRUFBRWhELEdBQUV5QixJQUFHdUIsRUFBRXJCLEdBQUV1QjtZQUFJLE9BQU9tQjtRQUFDO1FBQUVoRyxFQUFFVSxTQUFTLENBQUN1RixLQUFLLEdBQUMsU0FBU3RFLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQzZDLElBQUksQ0FBQyxLQUFLLEdBQUU3QztRQUFFO1FBQUUzQixFQUFFVSxTQUFTLENBQUNpRixDQUFDLEdBQUMsU0FBU2hFLENBQUMsRUFBQzJCLENBQUM7WUFBRSxTQUFTcUI7Z0JBQUksT0FBT3ZCLEVBQUVFLENBQUM7b0JBQUUsS0FBSzt3QkFBRTNCLEVBQUV5QixFQUFFQyxDQUFDO3dCQUFFO29CQUFNLEtBQUs7d0JBQUVDLEVBQUVGLEVBQUVDLENBQUM7d0JBQUU7b0JBQU07d0JBQVEsTUFBTXBDLE1BQU0sdUJBQzlmbUMsRUFBRUUsQ0FBQztnQkFBRTtZQUFDO1lBQUMsSUFBSUYsSUFBRSxJQUFJO1lBQUMsUUFBTSxJQUFJLENBQUMzQixDQUFDLEdBQUNBLEVBQUU2QixDQUFDLENBQUNxQixLQUFHLElBQUksQ0FBQ2xELENBQUMsQ0FBQ1ksSUFBSSxDQUFDc0M7WUFBRyxJQUFJLENBQUNoQixDQUFDLEdBQUMsQ0FBQztRQUFDO1FBQUUzRCxFQUFFdUUsT0FBTyxHQUFDbEQ7UUFBRXJCLEVBQUUwRSxNQUFNLEdBQUMsU0FBUy9DLENBQUM7WUFBRSxPQUFPLElBQUkzQixFQUFFLFNBQVNzRCxDQUFDLEVBQUNxQixDQUFDO2dCQUFFQSxFQUFFaEQ7WUFBRTtRQUFFO1FBQUUzQixFQUFFa0csSUFBSSxHQUFDLFNBQVN2RSxDQUFDO1lBQUUsT0FBTyxJQUFJM0IsRUFBRSxTQUFTc0QsQ0FBQyxFQUFDcUIsQ0FBQztnQkFBRSxJQUFJLElBQUl2QixJQUFFbEIsRUFBRVAsSUFBR2tELElBQUV6QixFQUFFcEIsSUFBSSxJQUFHLENBQUM2QyxFQUFFM0UsSUFBSSxFQUFDMkUsSUFBRXpCLEVBQUVwQixJQUFJLEdBQUdYLEVBQUV3RCxFQUFFMUUsS0FBSyxFQUFFd0YsQ0FBQyxDQUFDckMsR0FBRXFCO1lBQUU7UUFBRTtRQUFFM0UsRUFBRW1HLEdBQUcsR0FBQyxTQUFTeEUsQ0FBQztZQUFFLElBQUkyQixJQUFFcEIsRUFBRVAsSUFBR2dELElBQUVyQixFQUFFdEIsSUFBSTtZQUFHLE9BQU8yQyxFQUFFekUsSUFBSSxHQUFDbUIsRUFBRSxFQUFFLElBQUUsSUFBSXJCLEVBQUUsU0FBU29ELENBQUMsRUFBQ3lCLENBQUM7Z0JBQUUsU0FBU21CLEVBQUVGLENBQUM7b0JBQUUsT0FBTyxTQUFTQyxDQUFDO3dCQUFFSCxDQUFDLENBQUNFLEVBQUUsR0FBQ0M7d0JBQUVGO3dCQUFJLEtBQUdBLEtBQUd6QyxFQUFFd0M7b0JBQUU7Z0JBQUM7Z0JBQUMsSUFBSUEsSUFBRSxFQUFFLEVBQUNDLElBQUU7Z0JBQUUsR0FBR0QsRUFBRXZELElBQUksQ0FBQyxLQUFLLElBQUd3RCxLQUFJeEUsRUFBRXNELEVBQUV4RSxLQUFLLEVBQUV3RixDQUFDLENBQUNLLEVBQUVKLEVBQUUzRixNQUFNLEdBQUMsSUFBRzRFLElBQUdGLElBQUVyQixFQUFFdEIsSUFBSTt1QkFBUyxDQUFDMkMsRUFBRXpFLElBQUksQ0FBQztZQUFBO1FBQUU7UUFBRSxPQUFPRjtJQUFDO0lBQ2xlLFNBQVNvRyxHQUFHckcsQ0FBQyxFQUFDQyxDQUFDO1FBQUVELGFBQWFzRyxVQUFTdEcsQ0FBQUEsS0FBRyxFQUFDO1FBQUcsSUFBSVMsSUFBRSxHQUFFYSxJQUFFLENBQUMsR0FBRUMsSUFBRTtZQUFDVSxNQUFLO2dCQUFXLElBQUcsQ0FBQ1gsS0FBR2IsSUFBRVQsRUFBRUUsTUFBTSxFQUFDO29CQUFDLElBQUl3QixJQUFFakI7b0JBQUksT0FBTTt3QkFBQ0wsT0FBTUgsRUFBRXlCLEdBQUUxQixDQUFDLENBQUMwQixFQUFFO3dCQUFFdkIsTUFBSyxDQUFDO29CQUFDO2dCQUFDO2dCQUFDbUIsSUFBRSxDQUFDO2dCQUFFLE9BQU07b0JBQUNuQixNQUFLLENBQUM7b0JBQUVDLE9BQU0sS0FBSztnQkFBQztZQUFDO1FBQUM7UUFBRW1CLENBQUMsQ0FBQ1EsT0FBT0csUUFBUSxDQUFDLEdBQUM7WUFBVyxPQUFPWDtRQUFDO1FBQUUsT0FBT0E7SUFBQztJQUFDLElBQUlnRixLQUFHLGNBQVksT0FBT2pHLE9BQU9rRyxNQUFNLEdBQUNsRyxPQUFPa0csTUFBTSxHQUFDLFNBQVN4RyxDQUFDLEVBQUNDLENBQUM7UUFBRSxJQUFJLElBQUlRLElBQUUsR0FBRUEsSUFBRWdHLFVBQVV2RyxNQUFNLEVBQUNPLElBQUk7WUFBQyxJQUFJYSxJQUFFbUYsU0FBUyxDQUFDaEcsRUFBRTtZQUFDLElBQUdhLEdBQUUsSUFBSSxJQUFJQyxLQUFLRCxFQUFFaEIsT0FBT0ssU0FBUyxDQUFDK0YsY0FBYyxDQUFDdEUsSUFBSSxDQUFDZCxHQUFFQyxNQUFLdkIsQ0FBQUEsQ0FBQyxDQUFDdUIsRUFBRSxHQUFDRCxDQUFDLENBQUNDLEVBQUUsQUFBRDtRQUFFO1FBQUMsT0FBT3ZCO0lBQUM7SUFBRW9CLEVBQUUsaUJBQWdCLFNBQVNwQixDQUFDO1FBQUUsT0FBT0EsS0FBR3VHO0lBQUU7SUFDMWRuRixFQUFFLGFBQVksU0FBU3BCLENBQUM7UUFBRSxPQUFPQSxJQUFFQSxJQUFFLFNBQVNDLENBQUMsRUFBQ1EsQ0FBQztZQUFFLE9BQU9SLE1BQUlRLElBQUUsTUFBSVIsS0FBRyxJQUFFQSxNQUFJLElBQUVRLElBQUVSLE1BQUlBLEtBQUdRLE1BQUlBO1FBQUM7SUFBQztJQUFHVyxFQUFFLDRCQUEyQixTQUFTcEIsQ0FBQztRQUFFLE9BQU9BLElBQUVBLElBQUUsU0FBU0MsQ0FBQyxFQUFDUSxDQUFDO1lBQUUsSUFBSWEsSUFBRSxJQUFJO1lBQUNBLGFBQWFnRixVQUFTaEYsQ0FBQUEsSUFBRWdGLE9BQU9oRixFQUFDO1lBQUcsSUFBSUMsSUFBRUQsRUFBRXBCLE1BQU07WUFBQ08sSUFBRUEsS0FBRztZQUFFLElBQUksSUFBRUEsS0FBSUEsQ0FBQUEsSUFBRVEsS0FBSzBGLEdBQUcsQ0FBQ2xHLElBQUVjLEdBQUUsRUFBQyxHQUFHZCxJQUFFYyxHQUFFZCxJQUFJO2dCQUFDLElBQUlpQixJQUFFSixDQUFDLENBQUNiLEVBQUU7Z0JBQUMsSUFBR2lCLE1BQUl6QixLQUFHSyxPQUFPc0csRUFBRSxDQUFDbEYsR0FBRXpCLElBQUcsT0FBTSxDQUFDO1lBQUM7WUFBQyxPQUFNLENBQUM7UUFBQztJQUFDO0lBQ25VbUIsRUFBRSw2QkFBNEIsU0FBU3BCLENBQUM7UUFBRSxPQUFPQSxJQUFFQSxJQUFFLFNBQVNDLENBQUMsRUFBQ1EsQ0FBQztZQUFFLElBQUcsUUFBTSxJQUFJLEVBQUMsTUFBTSxJQUFJa0IsVUFBVTtZQUFnRixJQUFHMUIsYUFBYTRHLFFBQU8sTUFBTSxJQUFJbEYsVUFBVTtZQUFnRixPQUFNLENBQUMsTUFBSSxJQUFJLENBQUNtRixPQUFPLENBQUM3RyxHQUFFUSxLQUFHO1FBQUU7SUFBQztJQUFHVyxFQUFFLHdCQUF1QixTQUFTcEIsQ0FBQztRQUFFLE9BQU9BLElBQUVBLElBQUU7WUFBVyxPQUFPcUcsR0FBRyxJQUFJLEVBQUMsU0FBU3BHLENBQUM7Z0JBQUUsT0FBT0E7WUFBQztRQUFFO0lBQUM7SUFBRyxJQUFJOEcsS0FBRyxJQUFJLElBQUVoRztJQUNwYyxTQUFTaUcsRUFBRWhILENBQUMsRUFBQ0MsQ0FBQztRQUFFRCxJQUFFQSxFQUFFcUIsS0FBSyxDQUFDO1FBQUssSUFBSVosSUFBRXNHO1FBQUcvRyxDQUFDLENBQUMsRUFBRSxJQUFHUyxLQUFHLGVBQWEsT0FBT0EsRUFBRXdHLFVBQVUsSUFBRXhHLEVBQUV3RyxVQUFVLENBQUMsU0FBT2pILENBQUMsQ0FBQyxFQUFFO1FBQUUsSUFBSSxJQUFJc0IsR0FBRXRCLEVBQUVFLE1BQU0sSUFBR29CLENBQUFBLElBQUV0QixFQUFFa0gsS0FBSyxFQUFDLEdBQUlsSCxFQUFFRSxNQUFNLElBQUUsS0FBSyxNQUFJRCxJQUFFUSxDQUFDLENBQUNhLEVBQUUsSUFBRWIsQ0FBQyxDQUFDYSxFQUFFLEtBQUdoQixPQUFPSyxTQUFTLENBQUNXLEVBQUUsR0FBQ2IsSUFBRUEsQ0FBQyxDQUFDYSxFQUFFLEdBQUNiLElBQUVBLENBQUMsQ0FBQ2EsRUFBRSxHQUFDLENBQUMsSUFBRWIsQ0FBQyxDQUFDYSxFQUFFLEdBQUNyQjtJQUFDOztJQUFFLFNBQVNrSDtRQUFJLE1BQU1qRyxNQUFNO0lBQWdCO0lBQUMsU0FBU2tHLEdBQUdwSCxDQUFDLEVBQUNDLENBQUM7UUFBRUEsSUFBRXFHLE9BQU9lLFlBQVksQ0FBQ0MsS0FBSyxDQUFDLE1BQUtySDtRQUFHLE9BQU8sUUFBTUQsSUFBRUMsSUFBRUQsSUFBRUM7SUFBQztJQUFDLElBQUlzSCxJQUFHQyxLQUFHLGdCQUFjLE9BQU9DLGFBQVlDLElBQUdDLEtBQUcsZ0JBQWMsT0FBT0M7SUFBWSxJQUFJQyxLQUFHLENBQUMsR0FBRUMsSUFBRTtJQUFLLFNBQVNDLEdBQUcvSCxDQUFDO1FBQUUsSUFBSUM7UUFBRSxLQUFLLE1BQUlBLEtBQUlBLENBQUFBLElBQUUsQ0FBQTtRQUFHK0g7UUFBSy9ILElBQUU0SCxFQUFFLENBQUM1SCxFQUFFO1FBQUMsSUFBSSxJQUFJUSxJQUFFQyxNQUFNTyxLQUFLZ0gsS0FBSyxDQUFDakksRUFBRUUsTUFBTSxHQUFDLEtBQUlvQixJQUFFckIsQ0FBQyxDQUFDLEdBQUcsSUFBRSxJQUFHc0IsSUFBRSxHQUFFRyxJQUFFLEdBQUVILElBQUV2QixFQUFFRSxNQUFNLEdBQUMsR0FBRXFCLEtBQUcsRUFBRTtZQUFDLElBQUlLLElBQUU1QixDQUFDLENBQUN1QixFQUFFLEVBQUNnQyxJQUFFdkQsQ0FBQyxDQUFDdUIsSUFBRSxFQUFFLEVBQUNxRCxJQUFFNUUsQ0FBQyxDQUFDdUIsSUFBRSxFQUFFLEVBQUM4QixJQUFFcEQsQ0FBQyxDQUFDMkIsS0FBRyxFQUFFO1lBQUNBLElBQUUzQixDQUFDLENBQUMsQUFBQzJCLENBQUFBLElBQUUsQ0FBQSxLQUFJLElBQUUyQixLQUFHLEVBQUU7WUFBQ0EsSUFBRXRELENBQUMsQ0FBQyxBQUFDc0QsQ0FBQUEsSUFBRSxFQUFDLEtBQUksSUFBRXFCLEtBQUcsRUFBRTtZQUFDQSxJQUFFM0UsQ0FBQyxDQUFDMkUsSUFBRSxHQUFHO1lBQUNuRSxDQUFDLENBQUNpQixJQUFJLEdBQUMyQixJQUFFekIsSUFBRTJCLElBQUVxQjtRQUFDO1FBQUN2QixJQUFFO1FBQUV1QixJQUFFdEQ7UUFBRSxPQUFPdEIsRUFBRUUsTUFBTSxHQUFDcUI7WUFBRyxLQUFLO2dCQUFFOEIsSUFBRXJELENBQUMsQ0FBQ3VCLElBQUUsRUFBRSxFQUFDcUQsSUFBRTNFLENBQUMsQ0FBQyxBQUFDb0QsQ0FBQUEsSUFBRSxFQUFDLEtBQUksRUFBRSxJQUFFL0I7WUFBRSxLQUFLO2dCQUFFdEIsSUFBRUEsQ0FBQyxDQUFDdUIsRUFBRSxFQUFDZCxDQUFDLENBQUNpQixFQUFFLEdBQUN6QixDQUFDLENBQUNELEtBQUcsRUFBRSxHQUFDQyxDQUFDLENBQUMsQUFBQ0QsQ0FBQUEsSUFBRSxDQUFBLEtBQUksSUFBRXFELEtBQUcsRUFBRSxHQUFDdUIsSUFBRXREO1FBQUM7UUFBQyxPQUFPYixFQUFFeUgsSUFBSSxDQUFDO0lBQUc7SUFDL3hCLFNBQVNDLEdBQUduSSxDQUFDO1FBQUUsSUFBSUMsSUFBRUQsRUFBRUUsTUFBTSxFQUFDTyxJQUFFLElBQUVSLElBQUU7UUFBRVEsSUFBRSxJQUFFQSxJQUFFUSxLQUFLZ0gsS0FBSyxDQUFDeEgsS0FBRyxDQUFDLEtBQUcsS0FBS3FHLE9BQU8sQ0FBQzlHLENBQUMsQ0FBQ0MsSUFBRSxFQUFFLEtBQUlRLENBQUFBLElBQUUsQ0FBQyxLQUFHLEtBQUtxRyxPQUFPLENBQUM5RyxDQUFDLENBQUNDLElBQUUsRUFBRSxJQUFFUSxJQUFFLElBQUVBLElBQUUsQ0FBQTtRQUFHLElBQUlhLElBQUUsSUFBSThHLFdBQVczSCxJQUFHYyxJQUFFO1FBQUU4RyxHQUFHckksR0FBRSxTQUFTMEIsQ0FBQztZQUFFSixDQUFDLENBQUNDLElBQUksR0FBQ0c7UUFBQztRQUFHLE9BQU9ILE1BQUlkLElBQUVhLEVBQUVnSCxRQUFRLENBQUMsR0FBRS9HLEtBQUdEO0lBQUM7SUFDL00sU0FBUytHLEdBQUdySSxDQUFDLEVBQUNDLENBQUM7UUFBRSxTQUFTUSxFQUFFbUUsQ0FBQztZQUFFLE1BQUt0RCxJQUFFdEIsRUFBRUUsTUFBTSxFQUFFO2dCQUFDLElBQUltRCxJQUFFckQsRUFBRXVJLE1BQU0sQ0FBQ2pILE1BQUt3RCxJQUFFZ0QsQ0FBQyxDQUFDekUsRUFBRTtnQkFBQyxJQUFHLFFBQU15QixHQUFFLE9BQU9BO2dCQUFFLElBQUcsQ0FBQyxjQUFjMEQsSUFBSSxDQUFDbkYsSUFBRyxNQUFNbkMsTUFBTSxzQ0FBb0NtQztZQUFHO1lBQUMsT0FBT3VCO1FBQUM7UUFBQ29EO1FBQUssSUFBSSxJQUFJMUcsSUFBRSxJQUFJO1lBQUMsSUFBSUMsSUFBRWQsRUFBRSxDQUFDLElBQUdpQixJQUFFakIsRUFBRSxJQUFHbUIsSUFBRW5CLEVBQUUsS0FBSThDLElBQUU5QyxFQUFFO1lBQUksSUFBRyxPQUFLOEMsS0FBRyxDQUFDLE1BQUloQyxHQUFFO1lBQU10QixFQUFFc0IsS0FBRyxJQUFFRyxLQUFHO1lBQUcsTUFBSUUsS0FBSTNCLENBQUFBLEVBQUV5QixLQUFHLElBQUUsTUFBSUUsS0FBRyxJQUFHLE1BQUkyQixLQUFHdEQsRUFBRTJCLEtBQUcsSUFBRSxNQUFJMkIsRUFBQztRQUFFO0lBQUM7SUFDbFUsU0FBU3lFO1FBQUssSUFBRyxDQUFDRixHQUFFO1lBQUNBLElBQUUsQ0FBQztZQUFFLElBQUksSUFBSTlILElBQUUsaUVBQWlFcUIsS0FBSyxDQUFDLEtBQUlwQixJQUFFO2dCQUFDO2dCQUFNO2dCQUFLO2dCQUFNO2dCQUFNO2FBQUssRUFBQ1EsSUFBRSxHQUFFLElBQUVBLEdBQUVBLElBQUk7Z0JBQUMsSUFBSWEsSUFBRXRCLEVBQUV5SSxNQUFNLENBQUN4SSxDQUFDLENBQUNRLEVBQUUsQ0FBQ1ksS0FBSyxDQUFDO2dCQUFLd0csRUFBRSxDQUFDcEgsRUFBRSxHQUFDYTtnQkFBRSxJQUFJLElBQUlDLElBQUUsR0FBRUEsSUFBRUQsRUFBRXBCLE1BQU0sRUFBQ3FCLElBQUk7b0JBQUMsSUFBSUcsSUFBRUosQ0FBQyxDQUFDQyxFQUFFO29CQUFDLEtBQUssTUFBSXVHLENBQUMsQ0FBQ3BHLEVBQUUsSUFBR29HLENBQUFBLENBQUMsQ0FBQ3BHLEVBQUUsR0FBQ0gsQ0FBQUE7Z0JBQUU7WUFBQztRQUFDO0lBQUM7O0lBQUUsSUFBSW1ILEtBQUcsZUFBYSxPQUFPTjtJQUFXLFNBQVNPLEdBQUczSSxDQUFDO1FBQUUsT0FBTzBJLE1BQUksUUFBTTFJLEtBQUdBLGFBQWFvSTtJQUFVO0lBQUMsSUFBSVE7SUFBRyxTQUFTQyxHQUFHN0ksQ0FBQztRQUFFLElBQUksQ0FBQzhILENBQUMsR0FBQzlIO1FBQUUsSUFBRyxTQUFPQSxLQUFHLE1BQUlBLEVBQUVFLE1BQU0sRUFBQyxNQUFNZ0IsTUFBTTtJQUEwRDs7SUFBRSxJQUFJNEgsS0FBRyxlQUFhLE9BQU9WLFdBQVd6SCxTQUFTLENBQUNvSSxLQUFLLEVBQUNuRCxJQUFFLEdBQUVvRCxJQUFFO0lBQ3BpQixTQUFTQyxHQUFHakosQ0FBQyxFQUFDQyxDQUFDO1FBQUUsSUFBR0QsRUFBRWlELFdBQVcsS0FBR21GLFlBQVcsT0FBT3BJO1FBQUUsSUFBR0EsRUFBRWlELFdBQVcsS0FBR2lHLGFBQVksT0FBTyxJQUFJZCxXQUFXcEk7UUFBRyxJQUFHQSxFQUFFaUQsV0FBVyxLQUFHdkMsT0FBTSxPQUFPLElBQUkwSCxXQUFXcEk7UUFBRyxJQUFHQSxFQUFFaUQsV0FBVyxLQUFHcUQsUUFBTyxPQUFPNkIsR0FBR25JO1FBQUcsSUFBR0EsRUFBRWlELFdBQVcsS0FBRzRGLElBQUc7WUFBQyxJQUFHLENBQUM1SSxLQUFJQSxDQUFBQSxJQUFFRCxFQUFFOEgsQ0FBQyxBQUFEQSxLQUFJN0gsRUFBRWdELFdBQVcsS0FBR21GLFlBQVcsT0FBT25JO1lBQUVBLElBQUVELEVBQUU4SCxDQUFDO1lBQUM3SCxJQUFFLFFBQU1BLEtBQUcwSSxHQUFHMUksS0FBR0EsSUFBRSxhQUFXLE9BQU9BLElBQUVrSSxHQUFHbEksS0FBRztZQUFLLE9BQU0sQUFBQ0QsQ0FBQUEsSUFBRUEsRUFBRThILENBQUMsR0FBQzdILENBQUFBLElBQUcsSUFBSW1JLFdBQVdwSSxLQUFHNEksTUFBS0EsQ0FBQUEsS0FBRyxJQUFJUixXQUFXLEVBQUM7UUFBRTtRQUFDLElBQUdwSSxhQUFhb0ksWUFBVyxPQUFPLElBQUlBLFdBQVdwSSxFQUFFbUosTUFBTSxFQUFDbkosRUFBRW9KLFVBQVUsRUFBQ3BKLEVBQUVxSixVQUFVO1FBQUUsTUFBTW5JLE1BQU07SUFDMWU7O0lBQUUsU0FBU29JLEdBQUd0SixDQUFDLEVBQUNDLENBQUM7UUFBRSxPQUFPaUIsTUFBTSx3QkFBc0JsQixJQUFFLG1CQUFpQkMsSUFBRTtJQUFJO0lBQUMsU0FBU3NKO1FBQUssT0FBT3JJLE1BQU07SUFBOEM7O0lBQUUsU0FBU3NJLEdBQUd4SixDQUFDLEVBQUNDLENBQUM7UUFBRUEsSUFBRSxLQUFLLE1BQUlBLElBQUUsQ0FBQyxJQUFFQTtRQUFFQSxJQUFFLEtBQUssTUFBSUEsRUFBRXdKLENBQUMsR0FBQyxDQUFDLElBQUV4SixFQUFFd0osQ0FBQztRQUFDLElBQUksQ0FBQ2xHLENBQUMsR0FBQztRQUFLLElBQUksQ0FBQzdCLENBQUMsR0FBQyxJQUFJLENBQUM0QixDQUFDLEdBQUMsSUFBSSxDQUFDSSxDQUFDLEdBQUM7UUFBRSxJQUFJLENBQUMrRixDQUFDLEdBQUN4SjtRQUFFRCxLQUFHMEosR0FBRyxJQUFJLEVBQUMxSjtJQUFFO0lBQUMsU0FBUzBKLEdBQUcxSixDQUFDLEVBQUNDLENBQUM7UUFBRUQsRUFBRXVELENBQUMsR0FBQzBGLEdBQUdoSixHQUFFRCxFQUFFeUosQ0FBQztRQUFFekosRUFBRTBELENBQUMsR0FBQztRQUFFMUQsRUFBRXNELENBQUMsR0FBQ3RELEVBQUV1RCxDQUFDLENBQUNyRCxNQUFNO1FBQUNGLEVBQUUwQixDQUFDLEdBQUMxQixFQUFFMEQsQ0FBQztJQUFBO0lBQUM4RixHQUFHN0ksU0FBUyxDQUFDZ0osS0FBSyxHQUFDO1FBQVcsSUFBSSxDQUFDakksQ0FBQyxHQUFDLElBQUksQ0FBQ2dDLENBQUM7SUFBQTtJQUFFLFNBQVNrRyxFQUFFNUosQ0FBQztRQUFFLElBQUdBLEVBQUUwQixDQUFDLEdBQUMxQixFQUFFc0QsQ0FBQyxFQUFDLE1BQU1wQyxNQUFNLDRDQUEwQ2xCLEVBQUUwQixDQUFDLEdBQUMsUUFBTTFCLEVBQUVzRCxDQUFDO0lBQUU7SUFDcmQsU0FBU3VHLEVBQUU3SixDQUFDO1FBQUUsSUFBSUMsSUFBRUQsRUFBRXVELENBQUMsRUFBQzlDLElBQUVSLENBQUMsQ0FBQ0QsRUFBRTBCLENBQUMsQ0FBQyxFQUFDSixJQUFFYixJQUFFO1FBQUksSUFBRyxNQUFJQSxHQUFFLE9BQU9ULEVBQUUwQixDQUFDLElBQUUsR0FBRWtJLEVBQUU1SixJQUFHc0I7UUFBRWIsSUFBRVIsQ0FBQyxDQUFDRCxFQUFFMEIsQ0FBQyxHQUFDLEVBQUU7UUFBQ0osS0FBRyxBQUFDYixDQUFBQSxJQUFFLEdBQUUsS0FBSTtRQUFFLElBQUcsTUFBSUEsR0FBRSxPQUFPVCxFQUFFMEIsQ0FBQyxJQUFFLEdBQUVrSSxFQUFFNUosSUFBR3NCO1FBQUViLElBQUVSLENBQUMsQ0FBQ0QsRUFBRTBCLENBQUMsR0FBQyxFQUFFO1FBQUNKLEtBQUcsQUFBQ2IsQ0FBQUEsSUFBRSxHQUFFLEtBQUk7UUFBRyxJQUFHLE1BQUlBLEdBQUUsT0FBT1QsRUFBRTBCLENBQUMsSUFBRSxHQUFFa0ksRUFBRTVKLElBQUdzQjtRQUFFYixJQUFFUixDQUFDLENBQUNELEVBQUUwQixDQUFDLEdBQUMsRUFBRTtRQUFDSixLQUFHLEFBQUNiLENBQUFBLElBQUUsR0FBRSxLQUFJO1FBQUcsSUFBRyxNQUFJQSxHQUFFLE9BQU9ULEVBQUUwQixDQUFDLElBQUUsR0FBRWtJLEVBQUU1SixJQUFHc0I7UUFBRWIsSUFBRVIsQ0FBQyxDQUFDRCxFQUFFMEIsQ0FBQyxHQUFDLEVBQUU7UUFBQzFCLEVBQUUwQixDQUFDLElBQUU7UUFBRUosS0FBRyxBQUFDYixDQUFBQSxJQUFFLEVBQUMsS0FBSTtRQUFHLElBQUcsTUFBSUEsR0FBRSxPQUFPbUosRUFBRTVKLElBQUdzQjtRQUFFLElBQUcsT0FBS3JCLENBQUMsQ0FBQ0QsRUFBRTBCLENBQUMsR0FBRyxJQUFFLE9BQUt6QixDQUFDLENBQUNELEVBQUUwQixDQUFDLEdBQUcsSUFBRSxPQUFLekIsQ0FBQyxDQUFDRCxFQUFFMEIsQ0FBQyxHQUFHLElBQUUsT0FBS3pCLENBQUMsQ0FBQ0QsRUFBRTBCLENBQUMsR0FBRyxJQUFFLE9BQUt6QixDQUFDLENBQUNELEVBQUUwQixDQUFDLEdBQUcsRUFBQyxNQUFNNkg7UUFBS0ssRUFBRTVKO1FBQUcsT0FBT3NCO0lBQUM7SUFBQyxJQUFJd0ksS0FBRyxFQUFFO0lBQUMsU0FBU0M7UUFBSyxJQUFJLENBQUNySSxDQUFDLEdBQUMsRUFBRTtJQUFBO0lBQUNxSSxHQUFHcEosU0FBUyxDQUFDVCxNQUFNLEdBQUM7UUFBVyxPQUFPLElBQUksQ0FBQ3dCLENBQUMsQ0FBQ3hCLE1BQU07SUFBQTtJQUFFNkosR0FBR3BKLFNBQVMsQ0FBQ3FKLEdBQUcsR0FBQztRQUFXLElBQUloSyxJQUFFLElBQUksQ0FBQzBCLENBQUM7UUFBQyxJQUFJLENBQUNBLENBQUMsR0FBQyxFQUFFO1FBQUMsT0FBTzFCO0lBQUM7SUFBRSxTQUFTaUssRUFBRWpLLENBQUMsRUFBQ0MsQ0FBQztRQUFFLE1BQUssTUFBSUEsR0FBR0QsRUFBRTBCLENBQUMsQ0FBQ1ksSUFBSSxDQUFDckMsSUFBRSxNQUFJLE1BQUtBLE9BQUs7UUFBRUQsRUFBRTBCLENBQUMsQ0FBQ1ksSUFBSSxDQUFDckM7SUFBRTs7SUFBRSxTQUFTaUssR0FBR2xLLENBQUM7UUFBRSxJQUFJQyxJQUFFLENBQUMsR0FBRVEsSUFBRSxLQUFLLE1BQUlSLEVBQUVrSyxDQUFDLEdBQUMsQ0FBQyxJQUFFbEssRUFBRWtLLENBQUM7UUFBQyxJQUFJLENBQUM5RyxDQUFDLEdBQUM7WUFBQ29HLEdBQUUsS0FBSyxNQUFJeEosRUFBRXdKLENBQUMsR0FBQyxDQUFDLElBQUV4SixFQUFFd0osQ0FBQztRQUFBO1FBQUUsSUFBSSxDQUFDVSxDQUFDLEdBQUMxSjtRQUFFUixJQUFFLElBQUksQ0FBQ29ELENBQUM7UUFBQ3lHLEdBQUc1SixNQUFNLEdBQUVPLENBQUFBLElBQUVxSixHQUFHTSxHQUFHLElBQUduSyxLQUFJUSxDQUFBQSxFQUFFZ0osQ0FBQyxHQUFDeEosRUFBRXdKLENBQUMsQUFBREEsR0FBR3pKLEtBQUcwSixHQUFHakosR0FBRVQsSUFBR0EsSUFBRVMsQ0FBQUEsSUFBR1QsSUFBRSxJQUFJd0osR0FBR3hKLEdBQUVDO1FBQUcsSUFBSSxDQUFDeUIsQ0FBQyxHQUFDMUI7UUFBRSxJQUFJLENBQUMwRCxDQUFDLEdBQUMsSUFBSSxDQUFDaEMsQ0FBQyxDQUFDQSxDQUFDO1FBQUMsSUFBSSxDQUFDNkIsQ0FBQyxHQUFDLElBQUksQ0FBQ0QsQ0FBQyxHQUFDLENBQUM7SUFBQztJQUFDNEcsR0FBR3ZKLFNBQVMsQ0FBQ2dKLEtBQUssR0FBQztRQUFXLElBQUksQ0FBQ2pJLENBQUMsQ0FBQ2lJLEtBQUs7UUFBRyxJQUFJLENBQUNqRyxDQUFDLEdBQUMsSUFBSSxDQUFDaEMsQ0FBQyxDQUFDQSxDQUFDO1FBQUMsSUFBSSxDQUFDNkIsQ0FBQyxHQUFDLElBQUksQ0FBQ0QsQ0FBQyxHQUFDLENBQUM7SUFBQztJQUFFLFNBQVMrRyxHQUFHckssQ0FBQztRQUFFLElBQUlDLElBQUVELEVBQUUwQixDQUFDO1FBQUMsSUFBR3pCLEVBQUV5QixDQUFDLElBQUV6QixFQUFFcUQsQ0FBQyxFQUFDLE9BQU0sQ0FBQztRQUFFdEQsRUFBRTBELENBQUMsR0FBQzFELEVBQUUwQixDQUFDLENBQUNBLENBQUM7UUFBQyxJQUFJakIsSUFBRW9KLEVBQUU3SixFQUFFMEIsQ0FBQyxNQUFJO1FBQUV6QixJQUFFUSxNQUFJO1FBQUVBLEtBQUc7UUFBRSxJQUFHLENBQUUsQ0FBQSxLQUFHQSxLQUFHLEtBQUdBLENBQUFBLEdBQUcsTUFBTTZJLEdBQUc3SSxHQUFFVCxFQUFFMEQsQ0FBQztRQUFFLElBQUcsSUFBRXpELEdBQUUsTUFBTWlCLE1BQU0sMkJBQXlCakIsSUFBRSxtQkFBaUJELEVBQUUwRCxDQUFDLEdBQUM7UUFBSzFELEVBQUVzRCxDQUFDLEdBQUNyRDtRQUFFRCxFQUFFdUQsQ0FBQyxHQUFDOUM7UUFBRSxPQUFNLENBQUM7SUFBQztJQUMva0MsU0FBUzZKLEdBQUd0SyxDQUFDO1FBQUUsT0FBT0EsRUFBRXVELENBQUM7WUFBRSxLQUFLO2dCQUFFLElBQUcsS0FBR3ZELEVBQUV1RCxDQUFDLEVBQUMrRyxHQUFHdEs7cUJBQVFBLEdBQUU7b0JBQUNBLElBQUVBLEVBQUUwQixDQUFDO29CQUFDLElBQUksSUFBSXpCLElBQUVELEVBQUUwQixDQUFDLEVBQUNqQixJQUFFUixJQUFFLElBQUdBLElBQUVRLEdBQUcsSUFBRyxNQUFLVCxDQUFBQSxFQUFFdUQsQ0FBQyxDQUFDdEQsSUFBSSxHQUFDLEdBQUUsR0FBRzt3QkFBQ0QsRUFBRTBCLENBQUMsR0FBQ3pCO3dCQUFFMkosRUFBRTVKO3dCQUFHLE1BQU1BO29CQUFDO29CQUFDLE1BQU11SjtnQkFBSztnQkFBQztZQUFNLEtBQUs7Z0JBQUV2SixJQUFFQSxFQUFFMEIsQ0FBQztnQkFBQzFCLEVBQUUwQixDQUFDLElBQUU7Z0JBQUVrSSxFQUFFNUo7Z0JBQUc7WUFBTSxLQUFLO2dCQUFFLEtBQUdBLEVBQUV1RCxDQUFDLEdBQUMrRyxHQUFHdEssS0FBSUMsQ0FBQUEsSUFBRTRKLEVBQUU3SixFQUFFMEIsQ0FBQyxNQUFJLEdBQUUxQixJQUFFQSxFQUFFMEIsQ0FBQyxFQUFDMUIsRUFBRTBCLENBQUMsSUFBRXpCLEdBQUUySixFQUFFNUosRUFBQztnQkFBRztZQUFNLEtBQUs7Z0JBQUVBLElBQUVBLEVBQUUwQixDQUFDO2dCQUFDMUIsRUFBRTBCLENBQUMsSUFBRTtnQkFBRWtJLEVBQUU1SjtnQkFBRztZQUFNLEtBQUs7Z0JBQUVDLElBQUVELEVBQUVzRCxDQUFDO2dCQUFDLEdBQUU7b0JBQUMsSUFBRyxDQUFDK0csR0FBR3JLLElBQUcsTUFBTWtCLE1BQU07b0JBQXlDLElBQUcsS0FBR2xCLEVBQUV1RCxDQUFDLEVBQUM7d0JBQUMsSUFBR3ZELEVBQUVzRCxDQUFDLElBQUVyRCxHQUFFLE1BQU1pQixNQUFNO3dCQUEyQjtvQkFBSztvQkFBQ29KLEdBQUd0SztnQkFBRSxRQUFPLEVBQUc7Z0JBQUE7WUFBTTtnQkFBUSxNQUFNc0osR0FBR3RKLEVBQUV1RCxDQUFDLEVBQUN2RCxFQUFFMEQsQ0FBQztRQUFFO0lBQUM7SUFBQyxJQUFJNkcsS0FBRyxFQUFFO0lBQUMsU0FBU0M7UUFBSyxJQUFJLENBQUNsSCxDQUFDLEdBQUMsRUFBRTtRQUFDLElBQUksQ0FBQ0MsQ0FBQyxHQUFDO1FBQUUsSUFBSSxDQUFDN0IsQ0FBQyxHQUFDLElBQUlxSTtJQUFFO0lBQUMsU0FBU1UsRUFBRXpLLENBQUMsRUFBQ0MsQ0FBQztRQUFFLE1BQUlBLEVBQUVDLE1BQU0sSUFBR0YsQ0FBQUEsRUFBRXNELENBQUMsQ0FBQ2hCLElBQUksQ0FBQ3JDLElBQUdELEVBQUV1RCxDQUFDLElBQUV0RCxFQUFFQyxNQUFNLEFBQUQ7SUFBRTtJQUFDLFNBQVN3SyxHQUFHMUssQ0FBQyxFQUFDQyxDQUFDO1FBQUUsSUFBR0EsSUFBRUEsRUFBRVcsRUFBRSxFQUFDO1lBQUM2SixFQUFFekssR0FBRUEsRUFBRTBCLENBQUMsQ0FBQ3NJLEdBQUc7WUFBSSxJQUFJLElBQUl2SixJQUFFLEdBQUVBLElBQUVSLEVBQUVDLE1BQU0sRUFBQ08sSUFBSWdLLEVBQUV6SyxHQUFFQyxDQUFDLENBQUNRLEVBQUU7UUFBQztJQUFDOztJQUFFLElBQUlrSyxJQUFFLGVBQWEsT0FBTzVJLFVBQVEsYUFBVyxPQUFPQSxXQUFTQSxPQUFPLEtBQUssS0FBRyxLQUFLO0lBQUUsU0FBUzZJLEdBQUc1SyxDQUFDLEVBQUNDLENBQUM7UUFBRUssT0FBT3VLLFFBQVEsQ0FBQzdLLE1BQUsySyxDQUFBQSxJQUFFM0ssQ0FBQyxDQUFDMkssRUFBRSxJQUFFMUssSUFBRSxLQUFLLE1BQUlELEVBQUVnSixDQUFDLEdBQUNoSixFQUFFZ0osQ0FBQyxJQUFFL0ksSUFBRUssT0FBT0MsZ0JBQWdCLENBQUNQLEdBQUU7WUFBQ2dKLEdBQUU7Z0JBQUM1SSxPQUFNSDtnQkFBRXVCLGNBQWEsQ0FBQztnQkFBRUMsVUFBUyxDQUFDO2dCQUFFcUosWUFBVyxDQUFDO1lBQUM7UUFBQyxFQUFDO0lBQUU7SUFBQyxTQUFTQyxHQUFHL0ssQ0FBQztRQUFFLElBQUlDO1FBQUUwSyxJQUFFMUssSUFBRUQsQ0FBQyxDQUFDMkssRUFBRSxHQUFDMUssSUFBRUQsRUFBRWdKLENBQUM7UUFBQyxPQUFPLFFBQU0vSSxJQUFFLElBQUVBO0lBQUM7SUFBQyxTQUFTK0ssRUFBRWhMLENBQUM7UUFBRTRLLEdBQUc1SyxHQUFFO1FBQUcsT0FBT0E7SUFBQztJQUFDLFNBQVNpTCxHQUFHakwsQ0FBQztRQUFFLE9BQU9VLE1BQU13SyxPQUFPLENBQUNsTCxLQUFHLENBQUMsQ0FBRStLLENBQUFBLEdBQUcvSyxLQUFHLENBQUEsSUFBRyxDQUFDO0lBQUM7SUFBQyxTQUFTbUwsR0FBR25MLENBQUM7UUFBRSxJQUFHLENBQUNVLE1BQU13SyxPQUFPLENBQUNsTCxJQUFHLE1BQU1rQixNQUFNO1FBQXNDMEosR0FBRzVLLEdBQUU7SUFBRTs7SUFBRSxTQUFTb0wsR0FBR3BMLENBQUM7UUFBRSxPQUFPLFNBQU9BLEtBQUcsYUFBVyxPQUFPQSxLQUFHLENBQUNVLE1BQU13SyxPQUFPLENBQUNsTCxNQUFJQSxFQUFFaUQsV0FBVyxLQUFHM0M7SUFBTTtJQUFDLElBQUkrSyxLQUFHL0ssT0FBT2dMLE1BQU0sQ0FBQ04sRUFBRSxFQUFFO0lBQUcsU0FBU08sR0FBR3ZMLENBQUM7UUFBRSxJQUFHaUwsR0FBR2pMLEVBQUU4RSxDQUFDLEdBQUUsTUFBTTVELE1BQU07SUFBc0M7SUFBQyxJQUFJc0ssS0FBRyxlQUFhLE9BQU96SixVQUFRLGVBQWEsT0FBT0EsT0FBTzBKLFdBQVc7SUFBQyxTQUFTQyxHQUFHMUwsQ0FBQztRQUFFLE9BQU07WUFBQ0ksT0FBTUo7WUFBRXdCLGNBQWEsQ0FBQztZQUFFQyxVQUFTLENBQUM7WUFBRXFKLFlBQVcsQ0FBQztRQUFDO0lBQUM7O0lBQUUsU0FBU2EsRUFBRTNMLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDO1FBQUUsT0FBTSxDQUFDLE1BQUlSLElBQUUsT0FBS0EsS0FBR0QsRUFBRXNELENBQUMsR0FBQ3RELEVBQUUwQixDQUFDLEdBQUMxQixFQUFFMEIsQ0FBQyxDQUFDekIsRUFBRSxHQUFDLEtBQUssSUFBRSxBQUFDLENBQUEsS0FBSyxNQUFJUSxJQUFFLElBQUVBLENBQUFBLEtBQUlULEVBQUUwQixDQUFDLElBQUdqQixDQUFBQSxJQUFFVCxFQUFFMEIsQ0FBQyxDQUFDekIsRUFBRSxFQUFDLFFBQU1RLENBQUFBLElBQUdBLElBQUVULEVBQUU4RSxDQUFDLENBQUM3RSxJQUFFRCxFQUFFdUQsQ0FBQyxDQUFDO0lBQUE7SUFBQyxTQUFTNEcsRUFBRW5LLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDLEVBQUNhLENBQUM7UUFBRUEsSUFBRSxLQUFLLE1BQUlBLElBQUUsQ0FBQyxJQUFFQTtRQUFFaUssR0FBR3ZMO1FBQUdDLElBQUVELEVBQUVzRCxDQUFDLElBQUUsQ0FBQ2hDLElBQUV0QixFQUFFOEUsQ0FBQyxDQUFDN0UsSUFBRUQsRUFBRXVELENBQUMsQ0FBQyxHQUFDOUMsSUFBRSxBQUFDVCxDQUFBQSxFQUFFMEIsQ0FBQyxJQUFHMUIsQ0FBQUEsRUFBRTBCLENBQUMsR0FBQzFCLEVBQUU4RSxDQUFDLENBQUM5RSxFQUFFc0QsQ0FBQyxHQUFDdEQsRUFBRXVELENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxDQUFDLENBQUUsQ0FBQ3RELEVBQUUsR0FBQ1E7SUFBQztJQUFDLFNBQVNtTCxHQUFHNUwsQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUMsRUFBQ2EsQ0FBQztRQUFFYixJQUFFLEtBQUssTUFBSUEsSUFBRSxDQUFDLElBQUVBO1FBQUVhLElBQUUsS0FBSyxNQUFJQSxJQUFFLENBQUMsSUFBRUE7UUFBRSxJQUFJQyxJQUFFb0ssRUFBRTNMLEdBQUVDLEdBQUVxQjtRQUFHLFFBQU1DLEtBQUlBLENBQUFBLElBQUU4SixFQUFDO1FBQUcsSUFBR0osR0FBR2pMLEVBQUU4RSxDQUFDLEdBQUVyRSxLQUFJMEssQ0FBQUEsR0FBRzVKLElBQUdqQixPQUFPZ0wsTUFBTSxDQUFDL0osRUFBQzthQUFRLElBQUdBLE1BQUk4SixNQUFJSixHQUFHMUosSUFBR0EsSUFBRXlKLEVBQUV6SixFQUFFd0gsS0FBSyxLQUFJb0IsRUFBRW5LLEdBQUVDLEdBQUVzQixHQUFFRDtRQUFHLE9BQU9DO0lBQUM7SUFBQyxTQUFTc0ssRUFBRTdMLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDO1FBQUVULElBQUUyTCxFQUFFM0wsR0FBRUM7UUFBR0QsSUFBRSxRQUFNQSxJQUFFQSxJQUFFLENBQUNBO1FBQUUsT0FBTyxRQUFNQSxJQUFFLEtBQUssTUFBSVMsSUFBRSxJQUFFQSxJQUFFVDtJQUFDO0lBQ2w2RCxTQUFTOEwsR0FBRzlMLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDLEVBQUNhLENBQUM7UUFBRXRCLEVBQUUwRCxDQUFDLElBQUcxRCxDQUFBQSxFQUFFMEQsQ0FBQyxHQUFDLENBQUMsQ0FBQTtRQUFHLElBQUluQyxJQUFFMEosR0FBR2pMLEVBQUU4RSxDQUFDLEdBQUVwRCxJQUFFMUIsRUFBRTBELENBQUMsQ0FBQ2pELEVBQUU7UUFBQyxJQUFHLENBQUNpQixHQUFFO1lBQUNKLElBQUVzSyxHQUFHNUwsR0FBRVMsR0FBRSxDQUFDLEdBQUUsS0FBSyxNQUFJYSxJQUFFLENBQUMsSUFBRUE7WUFBR0ksSUFBRSxFQUFFO1lBQUNILElBQUVBLEtBQUcwSixHQUFHM0o7WUFBRyxJQUFJLElBQUlNLElBQUUsR0FBRUEsSUFBRU4sRUFBRXBCLE1BQU0sRUFBQzBCLElBQUlGLENBQUMsQ0FBQ0UsRUFBRSxHQUFDLElBQUkzQixFQUFFcUIsQ0FBQyxDQUFDTSxFQUFFLEdBQUVMLEtBQUc0SixHQUFHekosQ0FBQyxDQUFDRSxFQUFFLENBQUNrRCxDQUFDO1lBQUV2RCxLQUFJNEosQ0FBQUEsR0FBR3pKLElBQUdwQixPQUFPZ0wsTUFBTSxDQUFDNUosRUFBQztZQUFHMUIsRUFBRTBELENBQUMsQ0FBQ2pELEVBQUUsR0FBQ2lCO1FBQUM7UUFBQyxPQUFPQTtJQUFDO0lBQUMsU0FBU3FLLEdBQUcvTCxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQyxFQUFDYSxDQUFDLEVBQUNDLENBQUM7UUFBRSxJQUFJRyxJQUFFLEtBQUssTUFBSUEsSUFBRSxDQUFDLElBQUVBO1FBQUU2SixHQUFHdkw7UUFBRzBCLElBQUVvSyxHQUFHOUwsR0FBRVMsR0FBRVIsR0FBRXlCO1FBQUdqQixJQUFFYSxJQUFFQSxJQUFFLElBQUliO1FBQUVULElBQUU0TCxHQUFHNUwsR0FBRUM7UUFBRyxLQUFLLEtBQUdzQixJQUFHRyxDQUFBQSxFQUFFc0ssTUFBTSxDQUFDekssR0FBRSxHQUFFZCxJQUFHVCxFQUFFZ00sTUFBTSxDQUFDekssR0FBRSxHQUFFZCxFQUFFcUUsQ0FBQyxDQUFBLElBQUlwRCxDQUFBQSxFQUFFWSxJQUFJLENBQUM3QixJQUFHVCxFQUFFc0MsSUFBSSxDQUFDN0IsRUFBRXFFLENBQUMsQ0FBQTtRQUFHLE9BQU9yRTtJQUFDO0lBQUMsU0FBU3dMLEdBQUdqTSxDQUFDLEVBQUNDLENBQUM7UUFBRUQsSUFBRTJMLEVBQUUzTCxHQUFFQztRQUFHLE9BQU8sUUFBTUQsSUFBRSxJQUFFQTtJQUFDO0lBQUMsU0FBU2tNLEdBQUdsTSxDQUFDLEVBQUNDLENBQUM7UUFBRUQsSUFBRTJMLEVBQUUzTCxHQUFFQztRQUFHLE9BQU8sUUFBTUQsSUFBRSxLQUFHQTtJQUFDOztJQUFFLFNBQVNtTSxHQUFHbk0sQ0FBQztRQUFFLE9BQU8sT0FBT0E7WUFBRyxLQUFLO2dCQUFTLE9BQU9vTSxTQUFTcE0sS0FBR0EsSUFBRXNHLE9BQU90RztZQUFHLEtBQUs7Z0JBQVMsSUFBR0EsS0FBRyxDQUFDVSxNQUFNd0ssT0FBTyxDQUFDbEwsSUFBRztvQkFBQyxJQUFHMkksR0FBRzNJLElBQUcsT0FBTytILEdBQUcvSDtvQkFBRyxJQUFHQSxhQUFhNkksSUFBRzt3QkFBQyxJQUFJNUksSUFBRUQsRUFBRThILENBQUM7d0JBQUM3SCxJQUFFLFFBQU1BLEtBQUcsYUFBVyxPQUFPQSxJQUFFQSxJQUFFeUksTUFBSXpJLGFBQWFtSSxhQUFXTCxHQUFHOUgsS0FBRzt3QkFBSyxPQUFNLEFBQUNELENBQUFBLEVBQUU4SCxDQUFDLEdBQUM3SCxDQUFBQSxLQUFJO29CQUFFO2dCQUFDO1FBQUM7UUFBQyxPQUFPRDtJQUFDOztJQUFFLFNBQVNxTSxHQUFHck0sQ0FBQztRQUFFLElBQUlDLElBQUVxTTtRQUFHck0sSUFBRSxLQUFLLE1BQUlBLElBQUVzTSxLQUFHdE07UUFBRSxPQUFPdU0sR0FBR3hNLEdBQUVDO0lBQUU7SUFBQyxTQUFTd00sR0FBR3pNLENBQUMsRUFBQ0MsQ0FBQztRQUFFLElBQUcsUUFBTUQsR0FBRTtZQUFDLElBQUdVLE1BQU13SyxPQUFPLENBQUNsTCxJQUFHQSxJQUFFd00sR0FBR3hNLEdBQUVDO2lCQUFRLElBQUdtTCxHQUFHcEwsSUFBRztnQkFBQyxJQUFJUyxJQUFFLENBQUMsR0FBRWE7Z0JBQUUsSUFBSUEsS0FBS3RCLEVBQUVTLENBQUMsQ0FBQ2EsRUFBRSxHQUFDbUwsR0FBR3pNLENBQUMsQ0FBQ3NCLEVBQUUsRUFBQ3JCO2dCQUFHRCxJQUFFUztZQUFDLE9BQU1ULElBQUVDLEVBQUVEO1lBQUcsT0FBT0E7UUFBQztJQUFDO0lBQUMsU0FBU3dNLEdBQUd4TSxDQUFDLEVBQUNDLENBQUM7UUFBRSxJQUFJLElBQUlRLElBQUVULEVBQUUrSSxLQUFLLElBQUd6SCxJQUFFLEdBQUVBLElBQUViLEVBQUVQLE1BQU0sRUFBQ29CLElBQUliLENBQUMsQ0FBQ2EsRUFBRSxHQUFDbUwsR0FBR2hNLENBQUMsQ0FBQ2EsRUFBRSxFQUFDckI7UUFBR1MsTUFBTXdLLE9BQU8sQ0FBQ2xMLE1BQUkrSyxHQUFHL0ssS0FBRyxLQUFHZ0wsRUFBRXZLO1FBQUcsT0FBT0E7SUFBQztJQUFDLFNBQVM2TCxHQUFHdE0sQ0FBQztRQUFFLElBQUdBLEtBQUcsWUFBVSxPQUFPQSxLQUFHQSxFQUFFME0sTUFBTSxFQUFDLE9BQU8xTSxFQUFFME0sTUFBTTtRQUFHMU0sSUFBRW1NLEdBQUduTTtRQUFHLE9BQU9VLE1BQU13SyxPQUFPLENBQUNsTCxLQUFHcU0sR0FBR3JNLEtBQUdBO0lBQUM7SUFBQyxTQUFTdU0sR0FBR3ZNLENBQUM7UUFBRSxPQUFPMkksR0FBRzNJLEtBQUcsSUFBSW9JLFdBQVdwSSxLQUFHQTtJQUFDOztJQUFFLFNBQVMyTSxHQUFHM00sQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUM7UUFBRVQsS0FBSUEsQ0FBQUEsSUFBRTRNLEVBQUM7UUFBR0EsS0FBRztRQUFLLElBQUl0TCxJQUFFLElBQUksQ0FBQzJCLFdBQVcsQ0FBQ00sQ0FBQztRQUFDdkQsS0FBSUEsQ0FBQUEsSUFBRXNCLElBQUU7WUFBQ0E7U0FBRSxHQUFDLEVBQUUsQUFBRDtRQUFHLElBQUksQ0FBQ2lDLENBQUMsR0FBQyxBQUFDakMsQ0FBQUEsSUFBRSxJQUFFLENBQUMsQ0FBQSxJQUFJLENBQUEsSUFBSSxDQUFDMkIsV0FBVyxDQUFDdkIsQ0FBQyxJQUFFLENBQUE7UUFBRyxJQUFJLENBQUNnQyxDQUFDLEdBQUMsS0FBSztRQUFFLElBQUksQ0FBQ29CLENBQUMsR0FBQzlFO1FBQUVBLEdBQUU7WUFBQ3NCLElBQUUsSUFBSSxDQUFDd0QsQ0FBQyxDQUFDNUUsTUFBTTtZQUFDRixJQUFFc0IsSUFBRTtZQUFFLElBQUdBLEtBQUlBLENBQUFBLElBQUUsSUFBSSxDQUFDd0QsQ0FBQyxDQUFDOUUsRUFBRSxFQUFDb0wsR0FBRzlKLEVBQUMsR0FBRztnQkFBQyxJQUFJLENBQUNnQyxDQUFDLEdBQUN0RCxJQUFFLElBQUksQ0FBQ3VELENBQUM7Z0JBQUMsSUFBSSxDQUFDN0IsQ0FBQyxHQUFDSjtnQkFBRSxNQUFNdEI7WUFBQztZQUFDLEtBQUssTUFBSUMsS0FBRyxDQUFDLElBQUVBLElBQUcsQ0FBQSxJQUFJLENBQUNxRCxDQUFDLEdBQUNyQyxLQUFLMEYsR0FBRyxDQUFDMUcsR0FBRUQsSUFBRSxJQUFFLElBQUksQ0FBQ3VELENBQUMsR0FBRSxJQUFJLENBQUM3QixDQUFDLEdBQUMsS0FBSyxDQUFBLElBQUcsSUFBSSxDQUFDNEIsQ0FBQyxHQUFDdUosT0FBT0MsU0FBUztRQUFBO1FBQUMsSUFBR3JNLEdBQUUsSUFBSVIsSUFBRSxHQUFFQSxJQUFFUSxFQUFFUCxNQUFNLEVBQUNELElBQUksSUFBR0QsSUFBRVMsQ0FBQyxDQUFDUixFQUFFLEVBQUNELElBQUUsSUFBSSxDQUFDc0QsQ0FBQyxFQUFDdEQsS0FBRyxJQUFJLENBQUN1RCxDQUFDLEVBQUMsQUFBQ2pDLENBQUFBLElBQUUsSUFBSSxDQUFDd0QsQ0FBQyxDQUFDOUUsRUFBRSxBQUFELElBQUdVLE1BQU13SyxPQUFPLENBQUM1SixNQUFJMEosRUFBRTFKLEtBQUcsSUFBSSxDQUFDd0QsQ0FBQyxDQUFDOUUsRUFBRSxHQUFDcUw7YUFBTztZQUFDL0osSUFBRSxJQUFJLENBQUNJLENBQUMsSUFBRyxDQUFBLElBQUksQ0FBQ0EsQ0FBQyxHQUFDLElBQUksQ0FBQ29ELENBQUMsQ0FBQyxJQUFJLENBQUN4QixDQUFDLEdBQUMsSUFBSSxDQUFDQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7WUFBRyxJQUFJaEMsSUFBRUQsQ0FBQyxDQUFDdEIsRUFBRTtZQUFDdUIsSUFBRWIsTUFBTXdLLE9BQU8sQ0FBQzNKLE1BQUl5SixFQUFFekosS0FDN3FERCxDQUFDLENBQUN0QixFQUFFLEdBQUNxTDtRQUFFO0lBQUM7SUFBQ3NCLEdBQUdoTSxTQUFTLENBQUMrTCxNQUFNLEdBQUM7UUFBVyxPQUFPTCxHQUFHLElBQUksQ0FBQ3ZILENBQUM7SUFBQztJQUFFNkgsR0FBR2hNLFNBQVMsQ0FBQ2tCLFFBQVEsR0FBQztRQUFXLE9BQU8sSUFBSSxDQUFDaUQsQ0FBQyxDQUFDakQsUUFBUTtJQUFFO0lBQUUsSUFBSStLO0lBQUcsU0FBU0c7UUFBS0osR0FBR3JGLEtBQUssQ0FBQyxJQUFJLEVBQUNiO0lBQVU7SUFBQ3pELEVBQUUrSixJQUFHSjtJQUFJLElBQUduQixJQUFHO1FBQUMsSUFBSXdCLEtBQUcsQ0FBQztRQUFFMU0sT0FBT0MsZ0JBQWdCLENBQUN3TSxJQUFJQyxDQUFBQSxFQUFFLENBQUNqTCxPQUFPMEosV0FBVyxDQUFDLEdBQUNDLEdBQUc7WUFBVyxNQUFNeEssTUFBTTtRQUF1RCxJQUFHOEwsRUFBQztJQUFHOztJQUFFLFNBQVNDLEdBQUdqTixDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQztRQUFFLElBQUdBLEdBQUU7WUFBQyxJQUFJYSxJQUFFLENBQUMsR0FBRUM7WUFBRSxJQUFJQSxLQUFLZCxFQUFFO2dCQUFDLElBQUlpQixJQUFFakIsQ0FBQyxDQUFDYyxFQUFFLEVBQUNLLElBQUVGLEVBQUVrQixFQUFFO2dCQUFDaEIsS0FBSU4sQ0FBQUEsRUFBRTBDLENBQUMsR0FBQ3RDLEVBQUV1QyxFQUFFLElBQUV2QyxFQUFFZSxFQUFFLENBQUN5SyxDQUFDLEVBQUN4TCxFQUFFckIsRUFBRSxHQUFFaUIsQ0FBQUEsRUFBRTBKLENBQUMsR0FBQ21DLEdBQUd6TCxFQUFFckIsRUFBRSxHQUFFdUIsSUFBRSxTQUFTMkIsQ0FBQztvQkFBRSxPQUFPLFNBQVNxQixDQUFDLEVBQUN2QixDQUFDLEVBQUN5QixDQUFDO3dCQUFFLE9BQU92QixFQUFFUyxDQUFDLENBQUNZLEdBQUV2QixHQUFFeUIsR0FBRXZCLEVBQUV5SCxDQUFDO29CQUFDO2dCQUFDLEVBQUUxSixFQUFDLElBQUdJLEVBQUVNLEVBQUUsR0FBRVYsQ0FBQUEsRUFBRXFKLENBQUMsR0FBQ3lDLEdBQUcxTCxFQUFFbUssQ0FBQyxDQUFDbkssQ0FBQyxFQUFDQSxFQUFFTSxFQUFFLEdBQUVKLElBQUUsU0FBUzJCLENBQUM7b0JBQUUsT0FBTyxTQUFTcUIsQ0FBQyxFQUFDdkIsQ0FBQyxFQUFDeUIsQ0FBQzt3QkFBRSxPQUFPdkIsRUFBRVMsQ0FBQyxDQUFDWSxHQUFFdkIsR0FBRXlCLEdBQUV2QixFQUFFb0gsQ0FBQztvQkFBQztnQkFBQyxFQUFFckosRUFBQyxJQUFHTSxJQUFFTixFQUFFMEMsQ0FBQyxFQUFDdEMsRUFBRWtCLEVBQUUsR0FBQ2hCLENBQUFBO2dCQUFHQSxFQUFFM0IsR0FBRUQsR0FBRTBCLEVBQUVtSyxDQUFDO2dCQUFFdkssSUFBRTtvQkFBQzBDLEdBQUUxQyxFQUFFMEMsQ0FBQztvQkFBQ2dILEdBQUUxSixFQUFFMEosQ0FBQztvQkFBQ0wsR0FBRXJKLEVBQUVxSixDQUFDO2dCQUFBO1lBQUM7UUFBQztRQUFDRCxHQUFHekssR0FBRUQ7SUFBRTtJQUFDLElBQUlxTixLQUFHdEw7SUFBUyxTQUFTdUwsR0FBR3ROLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDO1FBQUUsT0FBT1QsQ0FBQyxDQUFDcU4sR0FBRyxJQUFHck4sQ0FBQUEsQ0FBQyxDQUFDcU4sR0FBRyxHQUFDLFNBQVMvTCxDQUFDLEVBQUNDLENBQUM7WUFBRSxPQUFPdEIsRUFBRXFCLEdBQUVDLEdBQUVkO1FBQUUsQ0FBQTtJQUFFO0lBQy90QixTQUFTOE0sR0FBR3ZOLENBQUM7UUFBRSxJQUFJQyxJQUFFRCxDQUFDLENBQUNxTixHQUFHO1FBQUMsSUFBRyxDQUFDcE4sR0FBRTtZQUFDLElBQUlRLElBQUUrTSxHQUFHeE47WUFBR0MsSUFBRSxTQUFTcUIsQ0FBQyxFQUFDQyxDQUFDO2dCQUFFLE9BQU9rTSxHQUFHbk0sR0FBRUMsR0FBRWQ7WUFBRTtZQUFFVCxDQUFDLENBQUNxTixHQUFHLEdBQUNwTjtRQUFDO1FBQUMsT0FBT0E7SUFBQztJQUFDLFNBQVN5TixHQUFHMU4sQ0FBQztRQUFFLElBQUlDLElBQUVELEVBQUVLLEVBQUU7UUFBQyxJQUFHSixHQUFFLE9BQU9zTixHQUFHdE47UUFBRyxJQUFHQSxJQUFFRCxFQUFFNkQsRUFBRSxFQUFDLE9BQU95SixHQUFHdE4sRUFBRTZMLENBQUMsQ0FBQ25LLENBQUMsRUFBQ3pCLEdBQUVELEVBQUVnQyxFQUFFO0lBQUM7SUFBQyxTQUFTMkwsR0FBRzNOLENBQUM7UUFBRSxJQUFJQyxJQUFFeU4sR0FBRzFOLElBQUdTLElBQUVULEVBQUU2TCxDQUFDLEVBQUN2SyxJQUFFdEIsRUFBRXlDLEVBQUUsQ0FBQ21ILENBQUM7UUFBQyxPQUFPM0osSUFBRSxTQUFTc0IsQ0FBQyxFQUFDRyxDQUFDO1lBQUUsT0FBT0osRUFBRUMsR0FBRUcsR0FBRWpCLEdBQUVSO1FBQUUsSUFBRSxTQUFTc0IsQ0FBQyxFQUFDRyxDQUFDO1lBQUUsT0FBT0osRUFBRUMsR0FBRUcsR0FBRWpCO1FBQUU7SUFBQztJQUNqUyxTQUFTbU4sR0FBRzVOLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDLEVBQUNhLENBQUMsRUFBQ0MsQ0FBQyxFQUFDRyxDQUFDO1FBQUUxQixJQUFFQTtRQUFJLElBQUk0QixJQUFFO1FBQUU1QixFQUFFRSxNQUFNLElBQUUsYUFBVyxPQUFPRixDQUFDLENBQUMsRUFBRSxJQUFHUyxDQUFBQSxFQUFFUixHQUFFRCxDQUFDLENBQUMsRUFBRSxHQUFFNEIsR0FBRTtRQUFHLE1BQUtBLElBQUU1QixFQUFFRSxNQUFNLEVBQUU7WUFBQ08sSUFBRVQsQ0FBQyxDQUFDNEIsSUFBSTtZQUFDLElBQUksSUFBSTJCLElBQUUzQixJQUFFLEdBQUUyQixJQUFFdkQsRUFBRUUsTUFBTSxJQUFFLGFBQVcsT0FBT0YsQ0FBQyxDQUFDdUQsRUFBRSxFQUFFQTtZQUFJLElBQUlxQixJQUFFNUUsQ0FBQyxDQUFDNEIsSUFBSTtZQUFDMkIsS0FBRzNCO1lBQUUsT0FBTzJCO2dCQUFHLEtBQUs7b0JBQUVqQyxFQUFFckIsR0FBRVEsR0FBRW1FO29CQUFHO2dCQUFNLEtBQUs7b0JBQUV0RCxFQUFFckIsR0FBRVEsR0FBRW1FLEdBQUU1RSxDQUFDLENBQUM0QixJQUFJO29CQUFFO2dCQUFNLEtBQUs7b0JBQUVMLEVBQUV0QixHQUFFUSxHQUFFbUUsR0FBRTVFLENBQUMsQ0FBQzRCLElBQUksRUFBQzVCLENBQUMsQ0FBQzRCLElBQUk7b0JBQUU7Z0JBQU0sS0FBSztvQkFBRTJCLElBQUV2RCxDQUFDLENBQUM0QixJQUFJO29CQUFDLElBQUl5QixJQUFFckQsQ0FBQyxDQUFDNEIsSUFBSSxFQUFDa0QsSUFBRTlFLENBQUMsQ0FBQzRCLElBQUk7b0JBQUNsQixNQUFNd0ssT0FBTyxDQUFDcEcsS0FBR3ZELEVBQUV0QixHQUFFUSxHQUFFbUUsR0FBRXJCLEdBQUVGLEdBQUV5QixLQUFHcEQsRUFBRXpCLEdBQUVRLEdBQUVtRSxHQUFFckIsR0FBRUYsR0FBRXlCO29CQUFHO2dCQUFNLEtBQUs7b0JBQUVwRCxFQUFFekIsR0FBRVEsR0FBRW1FLEdBQUU1RSxDQUFDLENBQUM0QixJQUFJLEVBQUM1QixDQUFDLENBQUM0QixJQUFJLEVBQUM1QixDQUFDLENBQUM0QixJQUFJLEVBQUM1QixDQUFDLENBQUM0QixJQUFJO29CQUFFO2dCQUFNO29CQUFRLE1BQU1WLE1BQU0sa0RBQWdEcUM7WUFBRztRQUFDO1FBQUMsT0FBT3REO0lBQUM7SUFDM2YsSUFBSTROLEtBQUc5TDtJQUFTLFNBQVNvTCxHQUFHbk4sQ0FBQztRQUFFLElBQUlDLElBQUVELENBQUMsQ0FBQzZOLEdBQUc7UUFBQyxJQUFHLENBQUM1TixHQUFFO1lBQUMsSUFBSVEsSUFBRXFOLEdBQUc5TjtZQUFHQyxJQUFFLFNBQVNxQixDQUFDLEVBQUNDLENBQUM7Z0JBQUUsT0FBT3dNLEdBQUd6TSxHQUFFQyxHQUFFZDtZQUFFO1lBQUVULENBQUMsQ0FBQzZOLEdBQUcsR0FBQzVOO1FBQUM7UUFBQyxPQUFPQTtJQUFDO0lBQUMsU0FBU21OLEdBQUdwTixDQUFDLEVBQUNDLENBQUM7UUFBRSxJQUFJUSxJQUFFVCxDQUFDLENBQUM2TixHQUFHO1FBQUNwTixLQUFJQSxDQUFBQSxJQUFFLFNBQVNhLENBQUMsRUFBQ0MsQ0FBQztZQUFFLE9BQU8wTCxHQUFHM0wsR0FBRUMsR0FBRXRCO1FBQUUsR0FBRUQsQ0FBQyxDQUFDNk4sR0FBRyxHQUFDcE4sQ0FBQUE7UUFBRyxPQUFPQTtJQUFDO0lBQUMsSUFBSXVOLEtBQUdqTTtJQUFTLFNBQVNrTSxHQUFHak8sQ0FBQyxFQUFDQyxDQUFDO1FBQUVELEVBQUVzQyxJQUFJLENBQUNyQztJQUFFO0lBQUMsU0FBU2lPLEdBQUdsTyxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQztRQUFFVCxFQUFFc0MsSUFBSSxDQUFDckMsR0FBRVEsRUFBRXlNLENBQUM7SUFBQztJQUFDLFNBQVNpQixHQUFHbk8sQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUMsRUFBQ2EsQ0FBQyxFQUFDQyxDQUFDO1FBQUUsSUFBSUcsSUFBRXlMLEdBQUc1TCxJQUFHSyxJQUFFbkIsRUFBRXlNLENBQUM7UUFBQ2xOLEVBQUVzQyxJQUFJLENBQUNyQyxHQUFFLFNBQVNzRCxDQUFDLEVBQUNxQixDQUFDLEVBQUN2QixDQUFDO1lBQUUsT0FBT3pCLEVBQUUyQixHQUFFcUIsR0FBRXZCLEdBQUUvQixHQUFFSTtRQUFFO0lBQUU7SUFBQyxTQUFTME0sR0FBR3BPLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDLEVBQUNhLENBQUMsRUFBQ0MsQ0FBQyxFQUFDRyxDQUFDO1FBQUUsSUFBSUUsSUFBRXdMLEdBQUc5TCxHQUFFSSxJQUFHNkIsSUFBRTlDLEVBQUV5TSxDQUFDO1FBQUNsTixFQUFFc0MsSUFBSSxDQUFDckMsR0FBRSxTQUFTMkUsQ0FBQyxFQUFDdkIsQ0FBQyxFQUFDeUIsQ0FBQztZQUFFLE9BQU92QixFQUFFcUIsR0FBRXZCLEdBQUV5QixHQUFFeEQsR0FBRU07UUFBRTtJQUFFO0lBQ3JjLFNBQVNrTSxHQUFHOU4sQ0FBQztRQUFFLElBQUlDLElBQUVELENBQUMsQ0FBQ2dPLEdBQUc7UUFBQyxPQUFPL04sSUFBRUEsSUFBRTJOLEdBQUc1TixHQUFFQSxDQUFDLENBQUNnTyxHQUFHLEdBQUMsRUFBRSxFQUFDQyxJQUFHQyxJQUFHQyxJQUFHQztJQUFHO0lBQUMsSUFBSUMsS0FBR3RNO0lBQVMsU0FBU3VNLEdBQUd0TyxDQUFDLEVBQUNDLENBQUM7UUFBRUQsQ0FBQyxDQUFDLEVBQUUsR0FBQ0M7SUFBQztJQUFDLFNBQVNzTyxHQUFHdk8sQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUMsRUFBQ2EsQ0FBQztRQUFFLElBQUlDLElBQUVkLEVBQUVtSixDQUFDO1FBQUM1SixDQUFDLENBQUNDLEVBQUUsR0FBQ3FCLElBQUUsU0FBU0ksQ0FBQyxFQUFDRSxDQUFDLEVBQUMyQixDQUFDO1lBQUUsT0FBT2hDLEVBQUVHLEdBQUVFLEdBQUUyQixHQUFFakM7UUFBRSxJQUFFQztJQUFDO0lBQUMsU0FBU2lOLEdBQUd4TyxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQyxFQUFDYSxDQUFDLEVBQUNDLENBQUMsRUFBQ0csQ0FBQztRQUFFLElBQUlFLElBQUVuQixFQUFFbUosQ0FBQyxFQUFDckcsSUFBRWdLLEdBQUdoTTtRQUFHdkIsQ0FBQyxDQUFDQyxFQUFFLEdBQUMsU0FBUzJFLENBQUMsRUFBQ3ZCLENBQUMsRUFBQ3lCLENBQUM7WUFBRSxPQUFPbEQsRUFBRWdELEdBQUV2QixHQUFFeUIsR0FBRXhELEdBQUVpQyxHQUFFN0I7UUFBRTtJQUFDO0lBQUMsU0FBUytNLEdBQUd6TyxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQyxFQUFDYSxDQUFDLEVBQUNDLENBQUMsRUFBQ0csQ0FBQyxFQUFDRSxDQUFDO1FBQUUsSUFBSTJCLElBQUU5QyxFQUFFbUosQ0FBQyxFQUFDaEYsSUFBRTBJLEdBQUdoTSxHQUFFQyxHQUFFRztRQUFHMUIsQ0FBQyxDQUFDQyxFQUFFLEdBQUMsU0FBU29ELENBQUMsRUFBQ3lCLENBQUMsRUFBQ21CLENBQUM7WUFBRSxPQUFPMUMsRUFBRUYsR0FBRXlCLEdBQUVtQixHQUFFM0UsR0FBRXNELEdBQUVoRDtRQUFFO0lBQUM7SUFBQyxTQUFTNEwsR0FBR3hOLENBQUM7UUFBRSxJQUFJQyxJQUFFRCxDQUFDLENBQUNxTyxHQUFHO1FBQUMsT0FBT3BPLElBQUVBLElBQUUyTixHQUFHNU4sR0FBRUEsQ0FBQyxDQUFDcU8sR0FBRyxHQUFDLENBQUMsR0FBRUMsSUFBR0MsSUFBR0MsSUFBR0M7SUFBRztJQUN4YSxTQUFTaEIsR0FBR3pOLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDO1FBQUUsTUFBSzRKLEdBQUdwSyxNQUFJLEtBQUdBLEVBQUVzRCxDQUFDLEVBQUU7WUFBQyxJQUFJakMsSUFBRXJCLEVBQUVxRCxDQUFDLEVBQUMvQixJQUFFZCxDQUFDLENBQUNhLEVBQUU7WUFBQyxJQUFHLENBQUNDLEdBQUU7Z0JBQUMsSUFBSUcsSUFBRWpCLENBQUMsQ0FBQyxFQUFFO2dCQUFDaUIsS0FBSUEsQ0FBQUEsSUFBRUEsQ0FBQyxDQUFDSixFQUFFLEFBQUQsS0FBS0MsQ0FBQUEsSUFBRWQsQ0FBQyxDQUFDYSxFQUFFLEdBQUNxTSxHQUFHak0sRUFBQztZQUFFO1lBQUMsSUFBRyxDQUFDSCxLQUFHLENBQUNBLEVBQUV0QixHQUFFRCxHQUFFc0IsSUFBRztnQkFBQSxJQUFHQyxJQUFFdEIsR0FBRXFCLElBQUV0QixHQUFFMEIsSUFBRUgsRUFBRW1DLENBQUMsRUFBQzRHLEdBQUcvSSxJQUFHLENBQUNBLEVBQUU0SSxDQUFDLEVBQUM7b0JBQUMsSUFBSXZJLElBQUVMLEVBQUVHLENBQUMsQ0FBQzZCLENBQUM7b0JBQUNoQyxJQUFFQSxFQUFFRyxDQUFDLENBQUNBLENBQUM7b0JBQUNILElBQUVHLE1BQUlILElBQUVxSCxNQUFLQSxDQUFBQSxLQUFHLElBQUlSLFdBQVcsRUFBQyxJQUFHVSxLQUFHbEgsRUFBRW1ILEtBQUssQ0FBQ3JILEdBQUVILEtBQUcsSUFBSTZHLFdBQVd4RyxFQUFFMEcsUUFBUSxDQUFDNUcsR0FBRUg7b0JBQUtHLENBQUFBLElBQUVKLEVBQUVWLEVBQUUsQUFBRCxJQUFHYyxFQUFFWSxJQUFJLENBQUNmLEtBQUdELEVBQUVWLEVBQUUsR0FBQzt3QkFBQ1c7cUJBQUU7Z0JBQUE7WUFBQTtRQUFDO1FBQUMsT0FBT3ZCO0lBQUM7SUFDalMsU0FBUzBPLEdBQUcxTyxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQztRQUFFLElBQUc4SixHQUFHckssTUFBTSxFQUFDO1lBQUMsSUFBSW9CLElBQUVpSixHQUFHSCxHQUFHO1lBQUdwSyxLQUFJMEosQ0FBQUEsR0FBR3BJLEVBQUVJLENBQUMsRUFBQzFCLElBQUdzQixFQUFFZ0MsQ0FBQyxHQUFDLENBQUMsR0FBRWhDLEVBQUVpQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO1lBQUd2RCxJQUFFc0I7UUFBQyxPQUFNdEIsSUFBRSxJQUFJa0ssR0FBR2xLO1FBQUcsSUFBRztZQUFDLE9BQU95TixHQUFHLElBQUl4TixHQUFFRCxHQUFFd04sR0FBRy9NO1FBQUcsU0FBUTtZQUFDUixJQUFFRCxFQUFFMEIsQ0FBQyxFQUFDekIsRUFBRXNELENBQUMsR0FBQyxNQUFLdEQsRUFBRXlELENBQUMsR0FBQyxHQUFFekQsRUFBRXFELENBQUMsR0FBQyxHQUFFckQsRUFBRXlCLENBQUMsR0FBQyxHQUFFekIsRUFBRXdKLENBQUMsR0FBQyxDQUFDLEdBQUV6SixFQUFFc0QsQ0FBQyxHQUFDLENBQUMsR0FBRXRELEVBQUV1RCxDQUFDLEdBQUMsQ0FBQyxHQUFFLE1BQUlnSCxHQUFHckssTUFBTSxJQUFFcUssR0FBR2pJLElBQUksQ0FBQ3RDO1FBQUU7SUFBQztJQUFDLFNBQVMrTixHQUFHL04sQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUM7UUFBRSxJQUFJLElBQUlhLElBQUViLEVBQUVQLE1BQU0sRUFBQ3FCLElBQUUsS0FBR0QsSUFBRSxHQUFFSSxJQUFFSCxJQUFFLElBQUUsR0FBRUcsSUFBRUosR0FBRUksS0FBRyxFQUFFLEFBQUMsQ0FBQSxHQUFFakIsQ0FBQyxDQUFDaUIsSUFBRSxFQUFFLEFBQUQsRUFBR3pCLEdBQUVELEdBQUVTLENBQUMsQ0FBQ2lCLEVBQUU7UUFBRXVMLEdBQUdqTixHQUFFQyxHQUFFc0IsSUFBRWQsQ0FBQyxDQUFDLEVBQUUsR0FBQyxLQUFLO0lBQUU7SUFBQyxTQUFTa08sR0FBRzNPLENBQUMsRUFBQ0MsQ0FBQztRQUFFLElBQUlRLElBQUUsSUFBSStKO1FBQUd1RCxHQUFHL04sR0FBRVMsR0FBRXFOLEdBQUc3TjtRQUFJd0ssRUFBRWhLLEdBQUVBLEVBQUVpQixDQUFDLENBQUNzSSxHQUFHO1FBQUloSyxJQUFFLElBQUlvSSxXQUFXM0gsRUFBRThDLENBQUM7UUFBRXRELElBQUVRLEVBQUU2QyxDQUFDO1FBQUMsSUFBSSxJQUFJaEMsSUFBRXJCLEVBQUVDLE1BQU0sRUFBQ3FCLElBQUUsR0FBRUcsSUFBRSxHQUFFQSxJQUFFSixHQUFFSSxJQUFJO1lBQUMsSUFBSUUsSUFBRTNCLENBQUMsQ0FBQ3lCLEVBQUU7WUFBQzFCLEVBQUU0TyxHQUFHLENBQUNoTixHQUFFTDtZQUFHQSxLQUFHSyxFQUFFMUIsTUFBTTtRQUFBO1FBQUNPLEVBQUU2QyxDQUFDLEdBQUM7WUFBQ3REO1NBQUU7UUFBQyxPQUFPQTtJQUFDO0lBQ2hmLFNBQVM2TyxHQUFHN08sQ0FBQyxFQUFDQyxDQUFDO1FBQUUsT0FBTTtZQUFDMkosR0FBRTVKO1lBQUVrTixHQUFFak47UUFBQztJQUFDO0lBQ2hDLElBQUk2TyxJQUFFRCxHQUFHLFNBQVM3TyxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQztRQUFFLElBQUcsTUFBSVQsRUFBRXVELENBQUMsRUFBQyxPQUFNLENBQUM7UUFBRXZELElBQUVBLEVBQUUwQixDQUFDO1FBQUMsSUFBSUosSUFBRXRCLEVBQUV1RCxDQUFDLENBQUN2RCxFQUFFMEIsQ0FBQyxDQUFDO1FBQUMsSUFBSUgsSUFBRXZCLEVBQUV1RCxDQUFDLENBQUN2RCxFQUFFMEIsQ0FBQyxHQUFDLEVBQUU7UUFBQyxJQUFJQSxJQUFFMUIsRUFBRXVELENBQUMsQ0FBQ3ZELEVBQUUwQixDQUFDLEdBQUMsRUFBRSxFQUFDRSxJQUFFNUIsRUFBRXVELENBQUMsQ0FBQ3ZELEVBQUUwQixDQUFDLEdBQUMsRUFBRTtRQUFDMUIsRUFBRTBCLENBQUMsSUFBRTtRQUFFa0ksRUFBRTVKO1FBQUd1QixJQUFFLEFBQUNELENBQUFBLEtBQUcsSUFBRUMsS0FBRyxJQUFFRyxLQUFHLEtBQUdFLEtBQUcsRUFBQyxNQUFLO1FBQUU1QixJQUFFLElBQUd1QixDQUFBQSxLQUFHLEVBQUMsSUFBRztRQUFFRCxJQUFFQyxNQUFJLEtBQUc7UUFBSUEsS0FBRztRQUFRNEksRUFBRWxLLEdBQUVRLEdBQUUsT0FBS2EsSUFBRUMsSUFBRXdOLE1BQUlDLFdBQVNoUCxJQUFFLEtBQUdzQixJQUFFdEIsSUFBRWlCLEtBQUtnTyxHQUFHLENBQUMsR0FBRSxDQUFDLE9BQUsxTixJQUFFdkIsSUFBRWlCLEtBQUtnTyxHQUFHLENBQUMsR0FBRTNOLElBQUUsT0FBTUMsQ0FBQUEsSUFBRU4sS0FBS2dPLEdBQUcsQ0FBQyxHQUFFLEdBQUU7UUFBSSxPQUFNLENBQUM7SUFBQyxHQUFFLFNBQVNqUCxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQztRQUFFUixJQUFFMEwsRUFBRTFMLEdBQUVRO1FBQUcsSUFBRyxRQUFNUixHQUFFO1lBQUNnSyxFQUFFakssRUFBRTBCLENBQUMsRUFBQyxJQUFFakIsSUFBRTtZQUFHVCxJQUFFQSxFQUFFMEIsQ0FBQztZQUFDLElBQUlKLElBQUVyQjtZQUFFcUIsSUFBRSxBQUFDYixDQUFBQSxJQUFFLElBQUVhLElBQUUsSUFBRSxDQUFBLElBQUcsQ0FBQ0EsSUFBRUE7WUFBRSxNQUFJQSxJQUFFLElBQUUsSUFBRUEsSUFBRXNFLElBQUVvRCxJQUFFLElBQUdBLENBQUFBLElBQUUsR0FBRXBELElBQUUsVUFBUyxJQUFHc0osTUFBTTVOLEtBQUkwSCxDQUFBQSxJQUFFLEdBQUVwRCxJQUFFLFVBQVMsSUFBRyx3QkFBc0J0RSxJQUFHMEgsQ0FBQUEsSUFBRSxHQUFFcEQsSUFBRSxBQUFDbkYsQ0FBQUEsS0FBRyxLQUFHLFVBQVMsTUFBSyxDQUFBLElBQ25mLHlCQUF1QmEsSUFBR0EsQ0FBQUEsSUFBRUwsS0FBS2tPLEtBQUssQ0FBQzdOLElBQUVMLEtBQUtnTyxHQUFHLENBQUMsR0FBRSxDQUFDLE9BQU1qRyxJQUFFLEdBQUVwRCxJQUFFLEFBQUNuRixDQUFBQSxLQUFHLEtBQUdhLENBQUFBLE1BQUssQ0FBQSxJQUFJckIsQ0FBQUEsSUFBRWdCLEtBQUtnSCxLQUFLLENBQUNoSCxLQUFLbU8sR0FBRyxDQUFDOU4sS0FBR0wsS0FBS29PLEdBQUcsR0FBRS9OLEtBQUdMLEtBQUtnTyxHQUFHLENBQUMsR0FBRSxDQUFDaFAsSUFBR3FCLElBQUVMLEtBQUtrTyxLQUFLLENBQUMsVUFBUTdOLElBQUcsWUFBVUEsS0FBRyxFQUFFckIsR0FBRStJLElBQUUsR0FBRXBELElBQUUsQUFBQ25GLENBQUFBLEtBQUcsS0FBR1IsSUFBRSxPQUFLLEtBQUdxQixJQUFFLE9BQU0sTUFBSyxDQUFBO1lBQUdiLElBQUVtRjtZQUFFNUYsRUFBRTBCLENBQUMsQ0FBQ1ksSUFBSSxDQUFDN0IsTUFBSSxJQUFFO1lBQUtULEVBQUUwQixDQUFDLENBQUNZLElBQUksQ0FBQzdCLE1BQUksSUFBRTtZQUFLVCxFQUFFMEIsQ0FBQyxDQUFDWSxJQUFJLENBQUM3QixNQUFJLEtBQUc7WUFBS1QsRUFBRTBCLENBQUMsQ0FBQ1ksSUFBSSxDQUFDN0IsTUFBSSxLQUFHO1FBQUk7SUFBQyxJQUFHNk8sS0FBR1QsR0FBRyxTQUFTN08sQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUM7UUFBRSxJQUFHLE1BQUlULEVBQUV1RCxDQUFDLEVBQUMsT0FBTSxDQUFDO1FBQUUsSUFBSSxJQUFJakMsSUFBRXRCLEVBQUUwQixDQUFDLEVBQUNILElBQUUsS0FBSUcsSUFBRSxHQUFFRSxJQUFFNUIsSUFBRSxHQUFFLElBQUU0QixLQUFHLE9BQUtMLEdBQUVLLElBQUlMLElBQUVELEVBQUVpQyxDQUFDLENBQUNqQyxFQUFFSSxDQUFDLEdBQUcsRUFBQ2tJLEVBQUV0SSxJQUFHSSxLQUFHLEFBQUNILENBQUFBLElBQUUsR0FBRSxLQUFJLElBQUVLO1FBQUUsT0FBS0wsS0FBSUEsQ0FBQUEsSUFBRUQsRUFBRWlDLENBQUMsQ0FBQ2pDLEVBQUVJLENBQUMsR0FBRyxFQUFDa0ksRUFBRXRJLElBQUdJLEtBQUcsQUFBQ0gsQ0FBQUEsSUFBRSxHQUFFLEtBQUksSUFBR3ZCLEtBQUcsQUFBQ3VCLENBQUFBLElBQUUsR0FBRSxLQUFJLENBQUE7UUFBRyxJQUFHLE9BQUtBLEdBQUUsSUFBSUssSUFBRSxHQUFFLElBQ3BmQSxLQUFHLE9BQUtMLEdBQUVLLElBQUlMLElBQUVELEVBQUVpQyxDQUFDLENBQUNqQyxFQUFFSSxDQUFDLEdBQUcsRUFBQ2tJLEVBQUV0SSxJQUFHdEIsS0FBRyxBQUFDdUIsQ0FBQUEsSUFBRSxHQUFFLEtBQUksSUFBRUssSUFBRTtRQUFFLElBQUcsTUFBSUwsR0FBRTtZQUFDRCxJQUFFSSxNQUFJO1lBQUVILElBQUV2QixNQUFJO1lBQUUsSUFBR0EsSUFBRXVCLElBQUUsWUFBV0QsSUFBRSxDQUFDQSxJQUFFLE1BQUksR0FBRUMsSUFBRSxDQUFDQSxNQUFJLEdBQUUsS0FBR0QsS0FBSUMsQ0FBQUEsSUFBRUEsSUFBRSxNQUFJLENBQUE7WUFBR0QsSUFBRSxhQUFXQyxJQUFHRCxDQUFBQSxNQUFJLENBQUE7UUFBRSxPQUFNLE1BQU1pSTtRQUFLWSxFQUFFbEssR0FBRVEsR0FBRVQsSUFBRSxDQUFDc0IsSUFBRUE7UUFBRyxPQUFNLENBQUM7SUFBQyxHQUFFLFNBQVN0QixDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQztRQUFFUixJQUFFMEwsRUFBRTFMLEdBQUVRO1FBQUcsSUFBRyxRQUFNUixLQUFHLFFBQU1BLEdBQUU7WUFBQ2dLLEVBQUVqSyxFQUFFMEIsQ0FBQyxFQUFDLElBQUVqQjtZQUFHVCxJQUFFQSxFQUFFMEIsQ0FBQztZQUFDLElBQUlKLElBQUVyQjtZQUFFUSxJQUFFLElBQUVhO1lBQUVBLElBQUVMLEtBQUtzTyxHQUFHLENBQUNqTztZQUFHckIsSUFBRXFCLE1BQUk7WUFBRUEsSUFBRUwsS0FBS2dILEtBQUssQ0FBQyxBQUFDM0csQ0FBQUEsSUFBRXJCLENBQUFBLElBQUc7WUFBWXFCLE9BQUs7WUFBRWIsS0FBSWEsQ0FBQUEsSUFBRSxDQUFDQSxNQUFJLEdBQUVyQixJQUFFLEFBQUMsQ0FBQSxDQUFDQSxNQUFJLENBQUEsSUFBRyxHQUFFLGFBQVdBLEtBQUlBLENBQUFBLElBQUUsR0FBRXFCLEtBQUksYUFBV0EsS0FBSUEsQ0FBQUEsSUFBRSxDQUFBLENBQUMsQ0FBQztZQUFHc0UsSUFBRTNGO1lBQUUrSSxJQUFFMUg7WUFBRWIsSUFBRW1GO1lBQUUsSUFBSTNGLElBQUUrSSxHQUFFLElBQUUvSSxLQUFHLE1BQUlRLEdBQUdULEVBQUUwQixDQUFDLENBQUNZLElBQUksQ0FBQzdCLElBQUUsTUFBSSxNQUFLQSxJQUFFLEFBQUNBLENBQUFBLE1BQUksSUFBRVIsS0FBRyxFQUFDLE1BQUssR0FBRUEsT0FBSztZQUFFRCxFQUFFMEIsQ0FBQyxDQUFDWSxJQUFJLENBQUM3QjtRQUFFO0lBQUMsSUFBRytPLEtBQUdYLEdBQUcsU0FBUzdPLENBQUMsRUFDamdCQyxDQUFDLEVBQUNRLENBQUM7UUFBRSxJQUFHLE1BQUlULEVBQUV1RCxDQUFDLEVBQUMsT0FBTSxDQUFDO1FBQUU0RyxFQUFFbEssR0FBRVEsR0FBRW9KLEVBQUU3SixFQUFFMEIsQ0FBQztRQUFHLE9BQU0sQ0FBQztJQUFDLEdBQUUsU0FBUzFCLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDO1FBQUVSLElBQUUwTCxFQUFFMUwsR0FBRVE7UUFBRyxJQUFHLFFBQU1SLEtBQUcsUUFBTUEsR0FBRSxJQUFHZ0ssRUFBRWpLLEVBQUUwQixDQUFDLEVBQUMsSUFBRWpCLElBQUdULElBQUVBLEVBQUUwQixDQUFDLEVBQUNqQixJQUFFUixHQUFFLEtBQUdRLEdBQUV3SixFQUFFakssR0FBRVM7YUFBTztZQUFDLElBQUlSLElBQUUsR0FBRSxJQUFFQSxHQUFFQSxJQUFJRCxFQUFFMEIsQ0FBQyxDQUFDWSxJQUFJLENBQUM3QixJQUFFLE1BQUksTUFBS0EsTUFBSTtZQUFFVCxFQUFFMEIsQ0FBQyxDQUFDWSxJQUFJLENBQUM7UUFBRTtJQUFDLElBQUdtTixLQUFHWixHQUFHLFNBQVM3TyxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQztRQUFFLElBQUcsTUFBSVQsRUFBRXVELENBQUMsRUFBQyxPQUFNLENBQUM7UUFBRSxJQUFJakMsSUFBRXVJLEVBQUU3SixFQUFFMEIsQ0FBQyxNQUFJO1FBQUUxQixJQUFFQSxFQUFFMEIsQ0FBQztRQUFDLElBQUlILElBQUV2QixFQUFFMEIsQ0FBQztRQUFDMUIsRUFBRTBCLENBQUMsSUFBRUo7UUFBRXNJLEVBQUU1SjtRQUFHQSxJQUFFQSxFQUFFdUQsQ0FBQztRQUFDLElBQUk3QjtRQUFFLElBQUc4RixJQUFHLEFBQUM5RixDQUFBQSxJQUFFNkYsRUFBQyxLQUFLN0YsQ0FBQUEsSUFBRTZGLEtBQUcsSUFBSUUsWUFBWSxTQUFRO1lBQUNpSSxPQUFNLENBQUM7UUFBQyxFQUFDLEdBQUdoTyxJQUFFQSxFQUFFaU8sTUFBTSxDQUFDM1AsRUFBRXNJLFFBQVEsQ0FBQy9HLEdBQUVBLElBQUVEO2FBQVE7WUFBQ0EsSUFBRUMsSUFBRUQ7WUFBRSxJQUFJLElBQUlNLElBQUUsRUFBRSxFQUFDMkIsSUFBRSxNQUFLcUIsR0FBRXZCLEdBQUV5QixHQUFFdkQsSUFBRUQsR0FBR3NELElBQUU1RSxDQUFDLENBQUN1QixJQUFJLEVBQUMsTUFBSXFELElBQUVoRCxFQUFFVSxJQUFJLENBQUNzQyxLQUFHLE1BQUlBLElBQUVyRCxLQUFHRCxJQUFFNkYsTUFBSzlELENBQUFBLElBQUVyRCxDQUFDLENBQUN1QixJQUFJLEVBQUMsTUFBSXFELEtBQUcsUUFBT3ZCLENBQUFBLElBQUUsR0FBRSxJQUFJOUIsQ0FBQUEsS0FBSTRGLEdBQUUsSUFDbGZ2RixFQUFFVSxJQUFJLENBQUMsQUFBQ3NDLENBQUFBLElBQUUsRUFBQyxLQUFJLElBQUV2QixJQUFFLEdBQUUsSUFBRyxNQUFJdUIsSUFBRXJELEtBQUdELElBQUUsSUFBRTZGLE1BQUs5RCxDQUFBQSxJQUFFckQsQ0FBQyxDQUFDdUIsSUFBSSxFQUFDLFFBQU84QixDQUFBQSxJQUFFLEdBQUUsS0FBSSxRQUFNdUIsS0FBRyxNQUFJdkIsS0FBRyxRQUFNdUIsS0FBRyxPQUFLdkIsS0FBRyxRQUFPLENBQUEsQUFBQzNCLENBQUFBLElBQUUxQixDQUFDLENBQUN1QixJQUFJLEFBQUQsSUFBRyxHQUFFLElBQUlBLENBQUFBLEtBQUk0RixHQUFFLElBQUd2RixFQUFFVSxJQUFJLENBQUMsQUFBQ3NDLENBQUFBLElBQUUsRUFBQyxLQUFJLEtBQUcsQUFBQ3ZCLENBQUFBLElBQUUsRUFBQyxLQUFJLElBQUUzQixJQUFFLEdBQUUsSUFBRyxPQUFLa0QsSUFBRXJELEtBQUdELElBQUUsSUFBRTZGLE1BQUs5RCxDQUFBQSxJQUFFckQsQ0FBQyxDQUFDdUIsSUFBSSxFQUFDLFFBQU84QixDQUFBQSxJQUFFLEdBQUUsS0FBSSxNQUFJLEFBQUN1QixDQUFBQSxLQUFHLEVBQUMsSUFBSXZCLENBQUFBLElBQUUsR0FBRSxLQUFJLE1BQUksUUFBTyxDQUFBLEFBQUMzQixDQUFBQSxJQUFFMUIsQ0FBQyxDQUFDdUIsSUFBSSxBQUFELElBQUcsR0FBRSxLQUFJLFFBQU8sQ0FBQSxBQUFDdUQsQ0FBQUEsSUFBRTlFLENBQUMsQ0FBQ3VCLElBQUksQUFBRCxJQUFHLEdBQUUsSUFBSUEsQ0FBQUEsS0FBSTRGLEdBQUUsSUFBSXZDLENBQUFBLElBQUUsQUFBQ0EsQ0FBQUEsSUFBRSxDQUFBLEtBQUksS0FBRyxBQUFDdkIsQ0FBQUEsSUFBRSxFQUFDLEtBQUksS0FBRyxBQUFDM0IsQ0FBQUEsSUFBRSxFQUFDLEtBQUksSUFBRW9ELElBQUUsSUFBR0YsS0FBRyxPQUFNaEQsRUFBRVUsSUFBSSxDQUFDLEFBQUNzQyxDQUFBQSxLQUFHLEtBQUcsSUFBRyxJQUFHLE9BQU0sQUFBQ0EsQ0FBQUEsSUFBRSxJQUFHLElBQUcsTUFBSyxDQUFDLElBQUd1QyxLQUFJLFFBQU12RixFQUFFMUIsTUFBTSxJQUFHcUQsQ0FBQUEsSUFBRTZELEdBQUc3RCxHQUFFM0IsSUFBR0EsRUFBRTFCLE1BQU0sR0FBQyxDQUFBO1lBQUd3QixJQUFFMEYsR0FBRzdELEdBQUUzQjtRQUFFO1FBQUN1SSxFQUFFbEssR0FBRVEsR0FBRWlCO1FBQUcsT0FBTSxDQUFDO0lBQUMsR0FBRSxTQUFTMUIsQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUM7UUFBRVIsSUFBRTBMLEVBQUUxTCxHQUFFUTtRQUFHLElBQUcsUUFBTVIsR0FBRTtZQUFDLElBQUlxQixJQUFFLENBQUM7WUFDcGZBLElBQUUsS0FBSyxNQUFJQSxJQUFFLENBQUMsSUFBRUE7WUFBRSxJQUFHcUcsSUFBRztnQkFBQyxJQUFHckcsS0FBRywyRUFBMkVrSCxJQUFJLENBQUN2SSxJQUFHLE1BQU1pQixNQUFNO2dCQUErQmpCLElBQUUsQUFBQ3lILENBQUFBLE1BQUtBLENBQUFBLEtBQUcsSUFBSUUsV0FBVSxDQUFDLEVBQUdnSSxNQUFNLENBQUMzUDtZQUFFLE9BQUs7Z0JBQUMsSUFBSSxJQUFJc0IsSUFBRSxHQUFFRyxJQUFFLElBQUkwRyxXQUFXLElBQUVuSSxFQUFFQyxNQUFNLEdBQUUwQixJQUFFLEdBQUVBLElBQUUzQixFQUFFQyxNQUFNLEVBQUMwQixJQUFJO29CQUFDLElBQUkyQixJQUFFdEQsRUFBRTRQLFVBQVUsQ0FBQ2pPO29CQUFHLElBQUcsTUFBSTJCLEdBQUU3QixDQUFDLENBQUNILElBQUksR0FBQ2dDO3lCQUFNO3dCQUFDLElBQUcsT0FBS0EsR0FBRTdCLENBQUMsQ0FBQ0gsSUFBSSxHQUFDZ0MsS0FBRyxJQUFFOzZCQUFROzRCQUFDLElBQUcsU0FBT0EsS0FBRyxTQUFPQSxHQUFFO2dDQUFDLElBQUcsU0FBT0EsS0FBRzNCLElBQUUzQixFQUFFQyxNQUFNLEVBQUM7b0NBQUMsSUFBSTBFLElBQUUzRSxFQUFFNFAsVUFBVSxDQUFDLEVBQUVqTztvQ0FBRyxJQUFHLFNBQU9nRCxLQUFHLFNBQU9BLEdBQUU7d0NBQUNyQixJQUFFLE9BQU1BLENBQUFBLElBQUUsS0FBSSxJQUFHcUIsSUFBRSxRQUFNO3dDQUFNbEQsQ0FBQyxDQUFDSCxJQUFJLEdBQUNnQyxLQUFHLEtBQUc7d0NBQUk3QixDQUFDLENBQUNILElBQUksR0FBQ2dDLEtBQUcsS0FBRyxLQUFHO3dDQUNqZjdCLENBQUMsQ0FBQ0gsSUFBSSxHQUFDZ0MsS0FBRyxJQUFFLEtBQUc7d0NBQUk3QixDQUFDLENBQUNILElBQUksR0FBQ2dDLElBQUUsS0FBRzt3Q0FBSTtvQ0FBUSxPQUFNM0I7Z0NBQUc7Z0NBQUMsSUFBR04sR0FBRSxNQUFNSixNQUFNO2dDQUErQnFDLElBQUU7NEJBQUs7NEJBQUM3QixDQUFDLENBQUNILElBQUksR0FBQ2dDLEtBQUcsS0FBRzs0QkFBSTdCLENBQUMsQ0FBQ0gsSUFBSSxHQUFDZ0MsS0FBRyxJQUFFLEtBQUc7d0JBQUc7d0JBQUM3QixDQUFDLENBQUNILElBQUksR0FBQ2dDLElBQUUsS0FBRztvQkFBRztnQkFBQztnQkFBQ3RELElBQUV5QixFQUFFNEcsUUFBUSxDQUFDLEdBQUUvRztZQUFFO1lBQUMwSSxFQUFFakssRUFBRTBCLENBQUMsRUFBQyxJQUFFakIsSUFBRTtZQUFHd0osRUFBRWpLLEVBQUUwQixDQUFDLEVBQUN6QixFQUFFQyxNQUFNO1lBQUV1SyxFQUFFekssR0FBRUEsRUFBRTBCLENBQUMsQ0FBQ3NJLEdBQUc7WUFBSVMsRUFBRXpLLEdBQUVDO1FBQUU7SUFBQyxJQUFHNlAsS0FBR2pCLEdBQUcsU0FBUzdPLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDLEVBQUNhLENBQUMsRUFBQ0MsQ0FBQztRQUFFLElBQUcsTUFBSXZCLEVBQUV1RCxDQUFDLEVBQUMsT0FBTSxDQUFDO1FBQUV0RCxJQUFFOEwsR0FBRzlMLEdBQUVRLEdBQUVhO1FBQUdiLElBQUVULEVBQUUwQixDQUFDLENBQUM0QixDQUFDO1FBQUNoQyxJQUFFdUksRUFBRTdKLEVBQUUwQixDQUFDLE1BQUk7UUFBRSxJQUFJQSxJQUFFMUIsRUFBRTBCLENBQUMsQ0FBQ0EsQ0FBQyxHQUFDSixHQUFFTSxJQUFFRixJQUFFakI7UUFBRSxLQUFHbUIsS0FBSTVCLENBQUFBLEVBQUUwQixDQUFDLENBQUM0QixDQUFDLEdBQUM1QixHQUFFSCxFQUFFdEIsR0FBRUQsSUFBRzRCLElBQUVGLElBQUUxQixFQUFFMEIsQ0FBQyxDQUFDQSxDQUFDLEFBQURBO1FBQUcsSUFBR0UsR0FBRSxNQUFNVixNQUFNLDBEQUF5REksQ0FBQUEsSUFBRSwwQkFBeUJBLENBQUFBLElBQUVNLENBQUFBLElBQUcsc0ZBQXFGO1FBQzdpQjVCLEVBQUUwQixDQUFDLENBQUNBLENBQUMsR0FBQ0E7UUFBRTFCLEVBQUUwQixDQUFDLENBQUM0QixDQUFDLEdBQUM3QztRQUFFLE9BQU0sQ0FBQztJQUFDLEdBQUUsU0FBU1QsQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUMsRUFBQ2EsQ0FBQyxFQUFDQyxDQUFDO1FBQUV0QixJQUFFNkwsR0FBRzdMLEdBQUVxQixHQUFFYjtRQUFHLElBQUcsUUFBTVIsR0FBRSxJQUFJcUIsSUFBRSxHQUFFQSxJQUFFckIsRUFBRUMsTUFBTSxFQUFDb0IsSUFBSTtZQUFDLElBQUlJLElBQUUxQjtZQUFFaUssRUFBRXZJLEVBQUVBLENBQUMsRUFBQyxJQUFFakIsSUFBRTtZQUFHLElBQUltQixJQUFFRixFQUFFQSxDQUFDLENBQUNzSSxHQUFHO1lBQUdTLEVBQUUvSSxHQUFFRTtZQUFHQSxFQUFFVSxJQUFJLENBQUNaLEVBQUU2QixDQUFDO1lBQUU3QixJQUFFRTtZQUFFTCxFQUFFdEIsQ0FBQyxDQUFDcUIsRUFBRSxFQUFDdEI7WUFBRzRCLElBQUU1QjtZQUFFLElBQUl1RCxJQUFFN0IsRUFBRTBJLEdBQUc7WUFBRyxJQUFJN0csSUFBRTNCLEVBQUUyQixDQUFDLEdBQUMzQixFQUFFRixDQUFDLENBQUN4QixNQUFNLEtBQUdxRCxHQUFFLE1BQUlBLEdBQUc3QixFQUFFWSxJQUFJLENBQUNpQixJQUFFLE1BQUksTUFBS0EsT0FBSyxHQUFFM0IsRUFBRTJCLENBQUM7WUFBRzdCLEVBQUVZLElBQUksQ0FBQ2lCO1lBQUczQixFQUFFMkIsQ0FBQztRQUFFO0lBQUM7SUFBRyxTQUFTd007UUFBSWhELEdBQUd6RixLQUFLLENBQUMsSUFBSSxFQUFDYjtJQUFVO0lBQUN6RCxFQUFFK00sR0FBRWhEO0lBQUksSUFBR3ZCLElBQUc7UUFBQyxJQUFJd0UsS0FBRyxDQUFDO1FBQUUxUCxPQUFPQyxnQkFBZ0IsQ0FBQ3dQLEdBQUdDLENBQUFBLEVBQUUsQ0FBQ2pPLE9BQU8wSixXQUFXLENBQUMsR0FBQ0MsR0FBR3BMLE1BQU0sQ0FBQ3lCLE9BQU8wSixXQUFXLENBQUMsR0FBRXVFLEVBQUM7SUFBRzs7SUFBRSxTQUFTQyxHQUFHalEsQ0FBQztRQUFFK1AsRUFBRTNOLElBQUksQ0FBQyxJQUFJLEVBQUNwQztJQUFFO0lBQUNnRCxFQUFFaU4sSUFBR0Y7SUFBRyxTQUFTRztRQUFLLE9BQU07WUFBQztZQUFFVjtZQUFHO1lBQUVWO1lBQUU7WUFBRVc7WUFBRztZQUFFQTtTQUFHO0lBQUE7O0lBQUUsU0FBU1UsR0FBR25RLENBQUM7UUFBRStQLEVBQUUzTixJQUFJLENBQUMsSUFBSSxFQUFDcEMsR0FBRSxDQUFDLEdBQUVvUTtJQUFHO0lBQUNwTixFQUFFbU4sSUFBR0o7SUFBR0ksR0FBR3hQLFNBQVMsQ0FBQzBQLGlCQUFpQixHQUFDLFNBQVNyUSxDQUFDLEVBQUNDLENBQUM7UUFBRThMLEdBQUcsSUFBSSxFQUFDLEdBQUVrRSxJQUFHalEsR0FBRUM7UUFBRyxPQUFPLElBQUk7SUFBQTtJQUFFLFNBQVNxUTtRQUFLLE9BQU07WUFBQztZQUFFUjtZQUFHRztZQUFHQztTQUFHO0lBQUE7SUFBQyxJQUFJRSxLQUFHO1FBQUM7S0FBRTtJQUFDLFNBQVNHLEdBQUd2USxDQUFDO1FBQUUrUCxFQUFFM04sSUFBSSxDQUFDLElBQUksRUFBQ3BDO0lBQUU7SUFBQ2dELEVBQUV1TixJQUFHUjtJQUFHLFNBQVNTO1FBQUssT0FBTTtZQUFDO1lBQUUxQjtZQUFFO1lBQUVBO1lBQUU7WUFBRUE7WUFBRTtZQUFFQTtZQUFFO1lBQUVBO1NBQUU7SUFBQTs7SUFBRSxTQUFTMkIsR0FBR3pRLENBQUM7UUFBRStQLEVBQUUzTixJQUFJLENBQUMsSUFBSSxFQUFDcEMsR0FBRSxDQUFDLEdBQUUwUTtJQUFHO0lBQUMxTixFQUFFeU4sSUFBR1Y7SUFBRyxTQUFTWTtRQUFLLE9BQU07WUFBQztZQUFFYjtZQUFHUztZQUFHQztTQUFHO0lBQUE7SUFBQyxJQUFJRSxLQUFHO1FBQUM7S0FBRTtJQUFDLFNBQVNFLEdBQUc1USxDQUFDO1FBQUUrUCxFQUFFM04sSUFBSSxDQUFDLElBQUksRUFBQ3BDO0lBQUU7SUFBQ2dELEVBQUU0TixJQUFHYjtJQUFHLFNBQVNjO1FBQUssT0FBTTtZQUFDO1lBQUUvQjtZQUFFO1lBQUVBO1lBQUU7WUFBRUE7WUFBRTtZQUFFQTtZQUFFO1lBQUVBO1lBQUU7WUFBRVE7U0FBRztJQUFBOztJQUFFLFNBQVN3QixHQUFHOVEsQ0FBQyxFQUFDQyxDQUFDLEVBQUNRLENBQUM7UUFBRUEsSUFBRVQsRUFBRStRLFlBQVksQ0FBQyxNQUFJdFEsSUFBRVQsRUFBRWdSLGFBQWEsR0FBQ2hSLEVBQUVpUixlQUFlO1FBQUVqUixFQUFFa1IsWUFBWSxDQUFDelEsR0FBRVI7UUFBR0QsRUFBRW1SLGFBQWEsQ0FBQzFRO1FBQUcsSUFBRyxDQUFDVCxFQUFFb1Isa0JBQWtCLENBQUMzUSxHQUFFVCxFQUFFcVIsY0FBYyxHQUFFLE1BQU1uUSxNQUFNLHdDQUFzQ2xCLEVBQUVzUixnQkFBZ0IsQ0FBQzdRO1FBQUksT0FBT0E7SUFBQzs7SUFBRSxTQUFTOFEsR0FBR3ZSLENBQUM7UUFBRSxPQUFPOEwsR0FBRzlMLEdBQUVpUSxJQUFHLEdBQUd1QixHQUFHLENBQUMsU0FBU3ZSLENBQUM7WUFBRSxPQUFNO2dCQUFDd1IsT0FBTXhGLEdBQUdoTSxHQUFFO2dCQUFHeVIsT0FBTTdGLEVBQUU1TCxHQUFFO2dCQUFHMFIsT0FBTSxRQUFNaEcsRUFBRTFMLEdBQUUsS0FBR2lNLEdBQUdqTSxHQUFFLEtBQUcsS0FBSztnQkFBRTJSLGFBQVksUUFBTWpHLEVBQUUxTCxHQUFFLEtBQUdpTSxHQUFHak0sR0FBRSxLQUFHLEtBQUs7WUFBQztRQUFDO0lBQUU7O0lBQUUsU0FBUzRSLEdBQUc3UixDQUFDO1FBQUUsT0FBTTtZQUFDRixHQUFFK0wsRUFBRTdMLEdBQUU7WUFBR21CLEdBQUUwSyxFQUFFN0wsR0FBRTtZQUFHOFIsR0FBRWpHLEVBQUU3TCxHQUFFO1lBQUcrUixZQUFXLFFBQU1wRyxFQUFFM0wsR0FBRSxLQUFHNkwsRUFBRTdMLEdBQUUsS0FBRyxLQUFLO1FBQUM7SUFBQztJQUFDLFNBQVNnUyxHQUFHaFMsQ0FBQztRQUFFLE9BQU9BLEVBQUV3UixHQUFHLENBQUMsU0FBU3ZSLENBQUM7WUFBRSxPQUFPNkwsR0FBRzRDLEdBQUd6TyxHQUFFd1EsSUFBR0UsS0FBSUosSUFBRyxHQUFHaUIsR0FBRyxDQUFDSztRQUFHO0lBQUU7O0lBQUUsU0FBU0ksR0FBR2pTLENBQUMsRUFBQ0MsQ0FBQztRQUFFLElBQUksQ0FBQ3NELENBQUMsR0FBQ3ZEO1FBQUUsSUFBSSxDQUFDMEIsQ0FBQyxHQUFDekI7UUFBRSxJQUFJLENBQUNvRCxDQUFDLEdBQUM7SUFBQztJQUN2L0MsU0FBUzZPLEdBQUdsUyxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQztRQUFFMFIsR0FBR25TLEdBQUVDO1FBQUcsSUFBRyxlQUFhLE9BQU9ELEVBQUUwQixDQUFDLENBQUMwUSxNQUFNLENBQUNDLHFCQUFxQixFQUFDLE9BQU85TixRQUFRQyxPQUFPLENBQUN4RSxFQUFFMEIsQ0FBQyxDQUFDMFEsTUFBTSxDQUFDQyxxQkFBcUI7UUFBSSxJQUFHNVIsR0FBRSxPQUFPOEQsUUFBUUMsT0FBTyxDQUFDeEUsRUFBRTBCLENBQUMsQ0FBQzBRLE1BQU07UUFBRSxJQUFHLGVBQWEsT0FBT0UsbUJBQWtCLE9BQU9BLGtCQUFrQnRTLEVBQUUwQixDQUFDLENBQUMwUSxNQUFNO1FBQUUsS0FBSyxNQUFJcFMsRUFBRXNELENBQUMsSUFBR3RELENBQUFBLEVBQUVzRCxDQUFDLEdBQUNpQyxTQUFTZ04sYUFBYSxDQUFDLFNBQVE7UUFBRyxPQUFPLElBQUloTyxRQUFRLFNBQVNqRCxDQUFDO1lBQUV0QixFQUFFc0QsQ0FBQyxDQUFDa1AsTUFBTSxHQUFDeFMsRUFBRTBCLENBQUMsQ0FBQzBRLE1BQU0sQ0FBQ0ksTUFBTTtZQUFDeFMsRUFBRXNELENBQUMsQ0FBQ21QLEtBQUssR0FBQ3pTLEVBQUUwQixDQUFDLENBQUMwUSxNQUFNLENBQUNLLEtBQUs7WUFBQ3pTLEVBQUVzRCxDQUFDLENBQUNvUCxVQUFVLENBQUMsTUFBSyxDQUFDLEdBQUdDLFNBQVMsQ0FBQzNTLEVBQUUwQixDQUFDLENBQUMwUSxNQUFNLEVBQUMsR0FBRSxHQUFFcFMsRUFBRTBCLENBQUMsQ0FBQzBRLE1BQU0sQ0FBQ0ssS0FBSyxFQUFDelMsRUFBRTBCLENBQUMsQ0FBQzBRLE1BQU0sQ0FBQ0ksTUFBTTtZQUFFbFIsRUFBRXRCLEVBQUVzRCxDQUFDO1FBQUM7SUFBRTtJQUM3ZSxTQUFTNk8sR0FBR25TLENBQUMsRUFBQ0MsQ0FBQztRQUFFLElBQUlRLElBQUVULEVBQUUwQixDQUFDO1FBQUMsSUFBRyxLQUFLLE1BQUkxQixFQUFFeUQsQ0FBQyxFQUFDO1lBQUMsSUFBSW5DLElBQUV3UCxHQUFHclEsR0FBRSxxS0FBb0ssSUFBR2MsSUFBRXVQLEdBQUdyUSxHQUFFLHlKQUF3SixJQUFHaUIsSUFBRWpCLEVBQUVtUyxhQUFhO1lBQUduUyxFQUFFb1MsWUFBWSxDQUFDblIsR0FBRUo7WUFBR2IsRUFBRW9TLFlBQVksQ0FBQ25SLEdBQUVIO1lBQUdkLEVBQUVxUyxXQUFXLENBQUNwUjtZQUFHLElBQUcsQ0FBQ2pCLEVBQUVzUyxtQkFBbUIsQ0FBQ3JSLEdBQUVqQixFQUFFdVMsV0FBVyxHQUFFLE1BQU05UixNQUFNLHlDQUNwZ0JULEVBQUV3UyxpQkFBaUIsQ0FBQ3ZSO1lBQUlKLElBQUV0QixFQUFFeUQsQ0FBQyxHQUFDL0I7WUFBRWpCLEVBQUV5UyxVQUFVLENBQUM1UjtZQUFHQyxJQUFFZCxFQUFFMFMsa0JBQWtCLENBQUM3UixHQUFFO1lBQVl0QixFQUFFMEQsQ0FBQyxHQUFDO2dCQUFDeUQsR0FBRTFHLEVBQUUyUyxpQkFBaUIsQ0FBQzlSLEdBQUU7Z0JBQVcwRixHQUFFdkcsRUFBRTJTLGlCQUFpQixDQUFDOVIsR0FBRTtnQkFBUTRDLElBQUczQztZQUFDO1lBQUV2QixFQUFFd0QsQ0FBQyxHQUFDL0MsRUFBRTRTLFlBQVk7WUFBRzVTLEVBQUU2UyxVQUFVLENBQUM3UyxFQUFFOFMsWUFBWSxFQUFDdlQsRUFBRXdELENBQUM7WUFBRS9DLEVBQUUrUyx1QkFBdUIsQ0FBQ3hULEVBQUUwRCxDQUFDLENBQUN5RCxDQUFDO1lBQUUxRyxFQUFFZ1QsbUJBQW1CLENBQUN6VCxFQUFFMEQsQ0FBQyxDQUFDeUQsQ0FBQyxFQUFDLEdBQUUxRyxFQUFFaVQsS0FBSyxFQUFDLENBQUMsR0FBRSxHQUFFO1lBQUdqVCxFQUFFa1QsVUFBVSxDQUFDbFQsRUFBRThTLFlBQVksRUFBQyxJQUFJSyxhQUFhO2dCQUFDLENBQUM7Z0JBQUUsQ0FBQztnQkFBRSxDQUFDO2dCQUFFO2dCQUFFO2dCQUFFO2dCQUFFO2dCQUFFLENBQUM7YUFBRSxHQUFFblQsRUFBRW9ULFdBQVc7WUFBRXBULEVBQUU2UyxVQUFVLENBQUM3UyxFQUFFOFMsWUFBWSxFQUFDO1lBQU12VCxFQUFFNEQsQ0FBQyxHQUFDbkQsRUFBRTRTLFlBQVk7WUFBRzVTLEVBQUU2UyxVQUFVLENBQUM3UyxFQUFFOFMsWUFBWSxFQUFDdlQsRUFBRTRELENBQUM7WUFBRW5ELEVBQUUrUyx1QkFBdUIsQ0FBQ3hULEVBQUUwRCxDQUFDLENBQUNzRCxDQUFDO1lBQUV2RyxFQUFFZ1QsbUJBQW1CLENBQUN6VCxFQUFFMEQsQ0FBQyxDQUFDc0QsQ0FBQyxFQUMvZ0IsR0FBRXZHLEVBQUVpVCxLQUFLLEVBQUMsQ0FBQyxHQUFFLEdBQUU7WUFBR2pULEVBQUVrVCxVQUFVLENBQUNsVCxFQUFFOFMsWUFBWSxFQUFDLElBQUlLLGFBQWE7Z0JBQUM7Z0JBQUU7Z0JBQUU7Z0JBQUU7Z0JBQUU7Z0JBQUU7Z0JBQUU7Z0JBQUU7YUFBRSxHQUFFblQsRUFBRW9ULFdBQVc7WUFBRXBULEVBQUU2UyxVQUFVLENBQUM3UyxFQUFFOFMsWUFBWSxFQUFDO1lBQU05UyxFQUFFcVQsU0FBUyxDQUFDdlMsR0FBRTtRQUFFO1FBQUNELElBQUV0QixFQUFFMEQsQ0FBQztRQUFDakQsRUFBRXlTLFVBQVUsQ0FBQ2xULEVBQUV5RCxDQUFDO1FBQUVoRCxFQUFFMlIsTUFBTSxDQUFDSyxLQUFLLEdBQUN4UyxFQUFFd1MsS0FBSztRQUFDaFMsRUFBRTJSLE1BQU0sQ0FBQ0ksTUFBTSxHQUFDdlMsRUFBRXVTLE1BQU07UUFBQy9SLEVBQUVzVCxRQUFRLENBQUMsR0FBRSxHQUFFOVQsRUFBRXdTLEtBQUssRUFBQ3hTLEVBQUV1UyxNQUFNO1FBQUUvUixFQUFFdVQsYUFBYSxDQUFDdlQsRUFBRXdULFFBQVE7UUFBRWpVLEVBQUV1RCxDQUFDLENBQUMyUSxhQUFhLENBQUNqVSxFQUFFa1UsTUFBTTtRQUFFMVQsRUFBRStTLHVCQUF1QixDQUFDbFMsRUFBRTZGLENBQUM7UUFBRTFHLEVBQUU2UyxVQUFVLENBQUM3UyxFQUFFOFMsWUFBWSxFQUFDdlQsRUFBRXdELENBQUM7UUFBRS9DLEVBQUVnVCxtQkFBbUIsQ0FBQ25TLEVBQUU2RixDQUFDLEVBQUMsR0FBRTFHLEVBQUVpVCxLQUFLLEVBQUMsQ0FBQyxHQUFFLEdBQUU7UUFBR2pULEVBQUUrUyx1QkFBdUIsQ0FBQ2xTLEVBQUUwRixDQUFDO1FBQUV2RyxFQUFFNlMsVUFBVSxDQUFDN1MsRUFBRThTLFlBQVksRUFBQ3ZULEVBQUU0RCxDQUFDO1FBQUVuRCxFQUFFZ1QsbUJBQW1CLENBQUNuUyxFQUFFMEYsQ0FBQyxFQUMxZixHQUFFdkcsRUFBRWlULEtBQUssRUFBQyxDQUFDLEdBQUUsR0FBRTtRQUFHalQsRUFBRTJULGVBQWUsQ0FBQzNULEVBQUU0VCxnQkFBZ0IsR0FBQzVULEVBQUU0VCxnQkFBZ0IsR0FBQzVULEVBQUU2VCxXQUFXLEVBQUM7UUFBTTdULEVBQUU4VCxVQUFVLENBQUMsR0FBRSxHQUFFLEdBQUU7UUFBRzlULEVBQUUrVCxLQUFLLENBQUMvVCxFQUFFZ1UsZ0JBQWdCO1FBQUVoVSxFQUFFaVUsU0FBUyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUUsQ0FBQyxHQUFFLENBQUM7UUFBR2pVLEVBQUVrVSxVQUFVLENBQUNsVSxFQUFFbVUsWUFBWSxFQUFDLEdBQUU7UUFBR25VLEVBQUVvVSx3QkFBd0IsQ0FBQ3ZULEVBQUU2RixDQUFDO1FBQUUxRyxFQUFFb1Usd0JBQXdCLENBQUN2VCxFQUFFMEYsQ0FBQztRQUFFdkcsRUFBRTZTLFVBQVUsQ0FBQzdTLEVBQUU4UyxZQUFZLEVBQUM7UUFBTXZULEVBQUV1RCxDQUFDLENBQUMyUSxhQUFhLENBQUM7SUFBRTtJQUFDLFNBQVNZLEdBQUc5VSxDQUFDO1FBQUUsSUFBSSxDQUFDMEIsQ0FBQyxHQUFDMUI7SUFBQzs7SUFBRSxJQUFJK1UsS0FBRyxJQUFJM00sV0FBVztRQUFDO1FBQUU7UUFBRztRQUFJO1FBQUk7UUFBRTtRQUFFO1FBQUU7UUFBRTtRQUFFO1FBQUU7UUFBRTtRQUFHO1FBQUU7UUFBRTtRQUFFO1FBQUU7UUFBRTtRQUFFO1FBQUc7UUFBRTtRQUFFO1FBQUU7UUFBRTtRQUFHO1FBQUU7UUFBSTtRQUFHO1FBQUc7S0FBRztJQUFFLFNBQVM0TSxHQUFHaFYsQ0FBQyxFQUFDQyxDQUFDO1FBQUUsT0FBT0EsSUFBRUQ7SUFBQztJQUFDLFNBQVNpVixHQUFHalYsQ0FBQyxFQUFDQyxDQUFDO1FBQUVhLE1BQU0sQ0FBQ2QsRUFBRSxHQUFDQztJQUFDO0lBQUMsU0FBU2lWLEdBQUdsVixDQUFDO1FBQUUsSUFBSUMsSUFBRXNGLFNBQVNnTixhQUFhLENBQUM7UUFBVXRTLEVBQUVrVixZQUFZLENBQUMsT0FBTW5WO1FBQUdDLEVBQUVrVixZQUFZLENBQUMsZUFBYztRQUFhLE9BQU8sSUFBSTVRLFFBQVEsU0FBUzlELENBQUM7WUFBRVIsRUFBRW1WLGdCQUFnQixDQUFDLFFBQU87Z0JBQVczVTtZQUFHLEdBQUUsQ0FBQztZQUFHUixFQUFFbVYsZ0JBQWdCLENBQUMsU0FBUTtnQkFBVzNVO1lBQUcsR0FBRSxDQUFDO1lBQUc4RSxTQUFTOFAsSUFBSSxDQUFDQyxXQUFXLENBQUNyVjtRQUFFO0lBQUU7SUFDcndCLFNBQVNzVjtRQUFLLE9BQU83USxFQUFFLFNBQVMxRSxDQUFDO1lBQUUsT0FBT0EsRUFBRTBCLENBQUM7Z0JBQUUsS0FBSztvQkFBRSxPQUFPMUIsRUFBRXlELENBQUMsR0FBQyxHQUFFTyxFQUFFaEUsR0FBRXdWLFlBQVlDLFdBQVcsQ0FBQ1YsS0FBSTtnQkFBRyxLQUFLO29CQUFFL1UsRUFBRTBCLENBQUMsR0FBQztvQkFBRTFCLEVBQUV5RCxDQUFDLEdBQUM7b0JBQUU7Z0JBQU0sS0FBSztvQkFBRSxPQUFPekQsRUFBRXlELENBQUMsR0FBQyxHQUFFekQsRUFBRTBELENBQUMsR0FBQyxNQUFLMUQsRUFBRStELE1BQU0sQ0FBQyxDQUFDO2dCQUFHLEtBQUs7b0JBQUUsT0FBTy9ELEVBQUUrRCxNQUFNLENBQUMsQ0FBQztZQUFFO1FBQUM7SUFBRTtJQUN0TSxTQUFTMlIsR0FBRzFWLENBQUM7UUFBRSxJQUFJLENBQUMwQixDQUFDLEdBQUMxQjtRQUFFLElBQUksQ0FBQzJWLFNBQVMsR0FBQyxDQUFDO1FBQUUsSUFBSSxDQUFDalMsQ0FBQyxHQUFDLENBQUM7UUFBRSxJQUFJLENBQUNxQixDQUFDLEdBQUMsQ0FBQztRQUFFLElBQUksQ0FBQ3RCLENBQUMsR0FBQyxDQUFDO1FBQUUsSUFBSSxDQUFDRCxDQUFDLEdBQUMsQ0FBQztRQUFFLElBQUksQ0FBQ2tCLENBQUMsR0FBQyxJQUFJLENBQUNkLENBQUMsR0FBQyxJQUFJLENBQUNnUyxDQUFDLEdBQUMsQ0FBQztRQUFFLElBQUksQ0FBQzVTLENBQUMsR0FBQ3VCLFFBQVFDLE9BQU87UUFBRyxJQUFJLENBQUN1TCxDQUFDLEdBQUM7UUFBRyxJQUFJLENBQUM1TixDQUFDLEdBQUMsQ0FBQztRQUFFLElBQUksQ0FBQzBULFVBQVUsR0FBQzdWLEtBQUdBLEVBQUU2VixVQUFVLElBQUViO1FBQUcsSUFBRyxhQUFXLE9BQU9sVSxRQUFPLElBQUliLElBQUVhLE9BQU9nVixRQUFRLENBQUNDLFFBQVEsQ0FBQ2xVLFFBQVEsR0FBR21VLFNBQVMsQ0FBQyxHQUFFbFYsT0FBT2dWLFFBQVEsQ0FBQ0MsUUFBUSxDQUFDbFUsUUFBUSxHQUFHb1UsV0FBVyxDQUFDLFFBQU07YUFBUyxJQUFHLGdCQUFjLE9BQU9ILFVBQVM3VixJQUFFNlYsU0FBU0MsUUFBUSxDQUFDbFUsUUFBUSxHQUFHbVUsU0FBUyxDQUFDLEdBQUVGLFNBQVNDLFFBQVEsQ0FBQ2xVLFFBQVEsR0FBR29VLFdBQVcsQ0FBQyxRQUFNO2FBQVMsTUFBTS9VLE1BQU07UUFDNWQsSUFBSSxDQUFDbkIsRUFBRSxHQUFDRTtRQUFFLElBQUdELEVBQUVrVyxPQUFPLEVBQUM7WUFBQ2pXLElBQUVrQyxFQUFFN0IsT0FBTzZWLElBQUksQ0FBQ25XLEVBQUVrVyxPQUFPO1lBQUcsSUFBSSxJQUFJelYsSUFBRVIsRUFBRWdDLElBQUksSUFBRyxDQUFDeEIsRUFBRU4sSUFBSSxFQUFDTSxJQUFFUixFQUFFZ0MsSUFBSSxHQUFHO2dCQUFDeEIsSUFBRUEsRUFBRUwsS0FBSztnQkFBQyxJQUFJa0IsSUFBRXRCLEVBQUVrVyxPQUFPLENBQUN6VixFQUFFLENBQUMyVixPQUFPO2dCQUFDLEtBQUssTUFBSTlVLEtBQUksQ0FBQSxJQUFJLENBQUNvQyxDQUFDLENBQUNqRCxFQUFFLEdBQUMsZUFBYSxPQUFPYSxJQUFFQSxNQUFJQSxDQUFBQTtZQUFFO1FBQUM7SUFBQztJQUFDeEIsSUFBRTRWLEdBQUcvVSxTQUFTO0lBQUNiLEVBQUV1VyxLQUFLLEdBQUM7UUFBVyxJQUFJLENBQUMvUyxDQUFDLElBQUUsSUFBSSxDQUFDQSxDQUFDLENBQUNnVCxNQUFNO1FBQUcsT0FBTy9SLFFBQVFDLE9BQU87SUFBRTtJQUN4USxTQUFTK1IsR0FBR3ZXLENBQUM7UUFBRSxJQUFJQyxHQUFFUSxHQUFFYSxHQUFFQyxHQUFFRyxHQUFFRSxHQUFFMkIsR0FBRXFCLEdBQUV2QixHQUFFeUIsR0FBRW1CO1FBQUUsT0FBT3ZCLEVBQUUsU0FBU21CLENBQUM7WUFBRSxPQUFPQSxFQUFFbkUsQ0FBQztnQkFBRSxLQUFLO29CQUFFLElBQUcsQ0FBQzFCLEVBQUU0VixDQUFDLEVBQUMsT0FBTy9QLEVBQUU5QixNQUFNO29CQUFHOUQsSUFBRSxLQUFLLE1BQUlELEVBQUUwQixDQUFDLENBQUM4VSxLQUFLLEdBQUMsRUFBRSxHQUFDLGVBQWEsT0FBT3hXLEVBQUUwQixDQUFDLENBQUM4VSxLQUFLLEdBQUN4VyxFQUFFMEIsQ0FBQyxDQUFDOFUsS0FBSyxDQUFDeFcsRUFBRTBELENBQUMsSUFBRTFELEVBQUUwQixDQUFDLENBQUM4VSxLQUFLO29CQUFDLE9BQU94UyxFQUFFNkIsR0FBRTBQLE1BQUs7Z0JBQUcsS0FBSztvQkFBRTlVLElBQUVvRixFQUFFdEMsQ0FBQztvQkFBQyxJQUFHLGFBQVcsT0FBT3pDLFFBQU8sT0FBT21VLEdBQUcsZ0NBQStCO3dCQUFDWSxZQUFXN1YsRUFBRTZWLFVBQVU7b0JBQUEsSUFBR1osR0FBRyx3Q0FBdUM7d0JBQUNZLFlBQVc3VixFQUFFNlYsVUFBVTtvQkFBQSxJQUFHalUsSUFBRTNCLEVBQUV3VyxNQUFNLENBQUMsU0FBUzNRLENBQUM7d0JBQUUsT0FBTyxLQUFLLE1BQUlBLEVBQUU0USxJQUFJO29CQUFBLElBQUduVCxJQUFFdEQsRUFBRXdXLE1BQU0sQ0FBQyxTQUFTM1EsQ0FBQzt3QkFBRSxPQUFPLEtBQUssTUFBSUEsRUFBRTRRLElBQUk7b0JBQUEsSUFBRzlSLElBQUVMLFFBQVE2QixHQUFHLENBQUN4RSxFQUFFNFAsR0FBRyxDQUFDLFNBQVMxTCxDQUFDO3dCQUFFLElBQUlDLElBQ25nQjRRLEdBQUczVyxHQUFFOEYsRUFBRThRLEdBQUc7d0JBQUUsSUFBRyxLQUFLLE1BQUk5USxFQUFFK1EsSUFBSSxFQUFDOzRCQUFDLElBQUk3USxJQUFFRixFQUFFK1EsSUFBSTs0QkFBQzlRLElBQUVBLEVBQUV0QixJQUFJLENBQUMsU0FBU3FTLENBQUM7Z0NBQUU5VyxFQUFFK1csWUFBWSxDQUFDL1EsR0FBRThRO2dDQUFHLE9BQU92UyxRQUFRQyxPQUFPLENBQUNzUzs0QkFBRTt3QkFBRTt3QkFBQyxPQUFPL1E7b0JBQUMsS0FBSTFDLElBQUVrQixRQUFRNkIsR0FBRyxDQUFDN0MsRUFBRWlPLEdBQUcsQ0FBQyxTQUFTMUwsQ0FBQzt3QkFBRSxPQUFPLEtBQUssTUFBSUEsRUFBRWtSLElBQUksSUFBRWxSLEVBQUVrUixJQUFJLElBQUV2VyxLQUFHLENBQUNxRixFQUFFa1IsSUFBSSxJQUFFLENBQUN2VyxJQUFFeVUsR0FBR2xWLEVBQUU2VixVQUFVLENBQUMvUCxFQUFFOFEsR0FBRyxFQUFDNVcsRUFBRUQsRUFBRSxLQUFHd0UsUUFBUUMsT0FBTztvQkFBRSxJQUFJQyxJQUFJLENBQUM7d0JBQVcsSUFBSXFCLEdBQUVDLEdBQUVDO3dCQUFFLE9BQU90QixFQUFFLFNBQVNvUyxDQUFDOzRCQUFFLElBQUcsS0FBR0EsRUFBRXBWLENBQUMsRUFBQyxPQUFPb0UsSUFBRWhGLE9BQU9tVyw0QkFBNEIsRUFBQ2xSLElBQUVqRixPQUFPb1csb0NBQW9DLEVBQUNsUixJQUFFaEcsR0FBRWdFLEVBQUU4UyxHQUFFaFIsRUFBRUMsSUFBRzs0QkFBR0MsRUFBRXpDLENBQUMsR0FBQ3VULEVBQUV2VCxDQUFDOzRCQUFDdVQsRUFBRXBWLENBQUMsR0FBQzt3QkFBQztvQkFBRSxJQUFHb0QsSUFBRTt3QkFBVyxPQUFPSixFQUFFLFNBQVNvQixDQUFDOzRCQUFFOUYsRUFBRTBCLENBQUMsQ0FBQ3lWLEtBQUssSUFBRW5YLEVBQUUwQixDQUFDLENBQUN5VixLQUFLLENBQUNQLEdBQUcsR0FBQzlRLElBQUU5QixFQUFFOEIsR0FDcGY2USxHQUFHM1csR0FBRUEsRUFBRTBCLENBQUMsQ0FBQ3lWLEtBQUssQ0FBQ1AsR0FBRyxHQUFFLEtBQUk5USxDQUFBQSxFQUFFcEUsQ0FBQyxHQUFDLEdBQUVvRSxJQUFFLEtBQUssQ0FBQTs0QkFBRyxPQUFPQTt3QkFBQztvQkFBRSxLQUFJOUIsRUFBRTZCLEdBQUV0QixRQUFRNkIsR0FBRyxDQUFDO3dCQUFDL0M7d0JBQUV1Qjt3QkFBRUU7cUJBQUUsR0FBRTtvQkFBRyxJQUFHLGVBQWEsT0FBT3NTLGVBQWMsTUFBTWxXLE1BQU07b0JBQWlFSSxJQUFFckIsRUFBRXdXLE1BQU0sQ0FBQyxTQUFTM1EsQ0FBQzt3QkFBRSxPQUFPLEtBQUssTUFBSUEsRUFBRWtSLElBQUksSUFBRWxSLEVBQUVrUixJQUFJLElBQUV2VyxLQUFHLENBQUNxRixFQUFFa1IsSUFBSSxJQUFFLENBQUN2VztvQkFBQyxHQUFHK1EsR0FBRyxDQUFDLFNBQVMxTCxDQUFDO3dCQUFFLE9BQU85RixFQUFFNlYsVUFBVSxDQUFDL1AsRUFBRThRLEdBQUcsRUFBQzVXLEVBQUVELEVBQUU7b0JBQUM7b0JBQUdxWCxjQUFjOVAsS0FBSyxDQUFDLE1BQUtqRixHQUFHZjtvQkFBSUMsSUFBRXZCO29CQUFFLE9BQU9nRSxFQUFFNkIsR0FBRW9SLDZCQUE2QkksU0FBUTtnQkFBRyxLQUFLO29CQUFFOVYsRUFBRWdDLENBQUMsR0FBQ3NDLEVBQUV0QyxDQUFDO29CQUFDdkQsRUFBRXFELENBQUMsR0FBQyxJQUFJaVUsZ0JBQWdCLEdBQUU7b0JBQUd0WCxFQUFFdUQsQ0FBQyxDQUFDNk8sTUFBTSxHQUFDcFMsRUFBRXFELENBQUM7b0JBQUMzQixJQUFFMUIsRUFBRXVELENBQUMsQ0FBQ2dVLEVBQUUsQ0FBQ0MsYUFBYSxDQUFDeFgsRUFBRXFELENBQUMsRUFBQzt3QkFBQ29VLFdBQVUsQ0FBQzt3QkFDdmZDLE9BQU0sQ0FBQzt3QkFBRS9ULElBQUcsZ0JBQWMsT0FBT2dVLHlCQUF1QixJQUFFO29CQUFDO29CQUFHM1gsRUFBRXVELENBQUMsQ0FBQ2dVLEVBQUUsQ0FBQ0ssa0JBQWtCLENBQUNsVztvQkFBR21FLEVBQUVuRSxDQUFDLEdBQUM7b0JBQUU7Z0JBQU0sS0FBSztvQkFBRTFCLEVBQUVxRCxDQUFDLEdBQUNrQyxTQUFTZ04sYUFBYSxDQUFDO29CQUFVdE0sSUFBRWpHLEVBQUVxRCxDQUFDLENBQUNxUCxVQUFVLENBQUMsVUFBUyxDQUFDO29CQUFHLElBQUcsQ0FBQ3pNLEtBQUlBLENBQUFBLElBQUVqRyxFQUFFcUQsQ0FBQyxDQUFDcVAsVUFBVSxDQUFDLFNBQVEsQ0FBQyxJQUFHLENBQUN6TSxDQUFBQSxHQUFHLE9BQU80UixNQUFNLG9FQUFtRWhTLEVBQUU5QixNQUFNO29CQUFHL0QsRUFBRW1FLENBQUMsR0FBQzhCO29CQUFFakcsRUFBRXVELENBQUMsQ0FBQzZPLE1BQU0sR0FBQ3BTLEVBQUVxRCxDQUFDO29CQUFDckQsRUFBRXVELENBQUMsQ0FBQ2lVLGFBQWEsQ0FBQ3hYLEVBQUVxRCxDQUFDLEVBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRSxDQUFDO2dCQUFHLEtBQUs7b0JBQUVyRCxFQUFFc0QsQ0FBQyxHQUFDLElBQUl0RCxFQUFFdUQsQ0FBQyxDQUFDdVUsWUFBWSxFQUFDOVgsRUFBRTRWLENBQUMsR0FBQyxDQUFDLEdBQUUvUCxFQUFFbkUsQ0FBQyxHQUFDO1lBQUM7UUFBQztJQUFFO0lBQ3paLFNBQVNxVyxHQUFHL1gsQ0FBQztRQUFFLElBQUlDLEdBQUVRLEdBQUVhLEdBQUVDLEdBQUVHLEdBQUVFLEdBQUUyQixHQUFFcUI7UUFBRSxPQUFPRixFQUFFLFNBQVNyQixDQUFDO1lBQUUsSUFBRyxLQUFHQSxFQUFFM0IsQ0FBQyxFQUFDO2dCQUFDLElBQUcxQixFQUFFMEIsQ0FBQyxDQUFDeVYsS0FBSyxJQUFFblgsRUFBRTBCLENBQUMsQ0FBQ3lWLEtBQUssQ0FBQ1AsR0FBRyxJQUFFNVcsRUFBRStQLENBQUMsS0FBRy9QLEVBQUUwQixDQUFDLENBQUN5VixLQUFLLENBQUNQLEdBQUcsRUFBQyxPQUFPdlQsRUFBRVUsTUFBTTtnQkFBRy9ELEVBQUU0RCxDQUFDLEdBQUMsQ0FBQztnQkFBRSxJQUFHLENBQUM1RCxFQUFFMEIsQ0FBQyxDQUFDeVYsS0FBSyxJQUFFLENBQUNuWCxFQUFFMEIsQ0FBQyxDQUFDeVYsS0FBSyxDQUFDUCxHQUFHLEVBQUM7b0JBQUN2VCxFQUFFM0IsQ0FBQyxHQUFDO29CQUFFO2dCQUFNO2dCQUFDMUIsRUFBRStQLENBQUMsR0FBQy9QLEVBQUUwQixDQUFDLENBQUN5VixLQUFLLENBQUNQLEdBQUc7Z0JBQUMsT0FBTzVTLEVBQUVYLEdBQUVzVCxHQUFHM1csR0FBRUEsRUFBRTBCLENBQUMsQ0FBQ3lWLEtBQUssQ0FBQ1AsR0FBRyxHQUFFO1lBQUU7WUFBQyxLQUFHdlQsRUFBRTNCLENBQUMsSUFBR3pCLENBQUFBLElBQUVvRCxFQUFFRSxDQUFDLEVBQUN2RCxFQUFFc0QsQ0FBQyxDQUFDMFUsU0FBUyxDQUFDL1gsRUFBQztZQUFHUSxJQUFFMEIsRUFBRTdCLE9BQU82VixJQUFJLENBQUNuVyxFQUFFbUMsQ0FBQztZQUFHLElBQUliLElBQUViLEVBQUV3QixJQUFJLElBQUcsQ0FBQ1gsRUFBRW5CLElBQUksRUFBQ21CLElBQUViLEVBQUV3QixJQUFJLEdBQUdWLElBQUVELEVBQUVsQixLQUFLLEVBQUNKLEVBQUVzRCxDQUFDLENBQUN5VCxZQUFZLENBQUN4VixHQUFFdkIsRUFBRW1DLENBQUMsQ0FBQ1osRUFBRTtZQUFFdkIsRUFBRW1DLENBQUMsR0FBQyxDQUFDO1lBQUUsSUFBR25DLEVBQUUwQixDQUFDLENBQUNpVSxTQUFTLEVBQUMsSUFBSWpVLElBQUVTLEVBQUVuQyxFQUFFMEIsQ0FBQyxDQUFDaVUsU0FBUyxHQUFFL1QsSUFBRUYsRUFBRU8sSUFBSSxJQUFHLENBQUNMLEVBQUV6QixJQUFJLEVBQUN5QixJQUFFRixFQUFFTyxJQUFJLEdBQUdzQixJQUFFM0IsRUFBRXhCLEtBQUssRUFBQzZYLEdBQUdqWSxHQUFFdUQ7WUFBR3FCLElBQUU1RSxFQUFFMEQsQ0FBQztZQUFDMUQsRUFBRTBELENBQUMsR0FBQyxDQUFDO1lBQUUxRCxFQUFFa1ksVUFBVSxDQUFDdFQ7WUFBR3ZCLEVBQUUzQixDQUFDLEdBQUM7UUFBQztJQUFFO0lBQzllNUIsRUFBRTZKLEtBQUssR0FBQztRQUFXLElBQUkzSixJQUFFLElBQUk7UUFBQyxPQUFPMEUsRUFBRSxTQUFTekUsQ0FBQztZQUFFRCxFQUFFc0QsQ0FBQyxJQUFHdEQsQ0FBQUEsRUFBRXNELENBQUMsQ0FBQ3FHLEtBQUssSUFBRzNKLEVBQUV5RCxDQUFDLEdBQUMsQ0FBQyxHQUFFekQsRUFBRXdELENBQUMsR0FBQyxDQUFDLENBQUE7WUFBR3ZELEVBQUV5QixDQUFDLEdBQUM7UUFBQztJQUFFO0lBQzNGNUIsRUFBRW9ZLFVBQVUsR0FBQyxTQUFTbFksQ0FBQyxFQUFDQyxDQUFDO1FBQUUsSUFBSVEsSUFBRSxJQUFJO1FBQUMsSUFBR1IsSUFBRUEsS0FBRyxJQUFJLENBQUN5QixDQUFDLENBQUN3VSxPQUFPLEVBQUM7WUFBQyxJQUFJLElBQUk1VSxJQUFFLEVBQUUsRUFBQ0MsSUFBRSxFQUFFLEVBQUNHLElBQUUsQ0FBQyxHQUFFRSxJQUFFTyxFQUFFN0IsT0FBTzZWLElBQUksQ0FBQ25XLEtBQUl1RCxJQUFFM0IsRUFBRUssSUFBSSxJQUFHLENBQUNzQixFQUFFcEQsSUFBSSxFQUFDdUIsSUFBRTtnQkFBQ3VJLEdBQUV2SSxFQUFFdUksQ0FBQztnQkFBQ1EsR0FBRS9JLEVBQUUrSSxDQUFDO1lBQUEsR0FBRWxILElBQUUzQixFQUFFSyxJQUFJLEdBQUc7Z0JBQUMsSUFBSTJDLElBQUVyQixFQUFFbkQsS0FBSztnQkFBQ3dFLEtBQUssSUFBSSxDQUFDbEIsQ0FBQyxJQUFFLElBQUksQ0FBQ0EsQ0FBQyxDQUFDa0IsRUFBRSxLQUFHNUUsQ0FBQyxDQUFDNEUsRUFBRSxJQUFHLENBQUEsSUFBSSxDQUFDbEIsQ0FBQyxDQUFDa0IsRUFBRSxHQUFDNUUsQ0FBQyxDQUFDNEUsRUFBRSxFQUFDckIsSUFBRXRELENBQUMsQ0FBQzJFLEVBQUUsRUFBQyxLQUFLLE1BQUlyQixLQUFJQSxDQUFBQSxFQUFFNFUsUUFBUSxJQUFHelcsQ0FBQUEsRUFBRXVJLENBQUMsR0FBQzFHLEVBQUU0VSxRQUFRLEVBQUN6VyxFQUFFK0ksQ0FBQyxHQUFDekssQ0FBQyxDQUFDNEUsRUFBRSxFQUFDdEQsRUFBRWdCLElBQUksQ0FBQyxTQUFTZSxDQUFDO29CQUFFLE9BQU87d0JBQVcsSUFBSXlCO3dCQUFFLE9BQU9KLEVBQUUsU0FBU3VCLENBQUM7NEJBQUUsSUFBRyxLQUFHQSxFQUFFdkUsQ0FBQyxFQUFDLE9BQU9zQyxFQUFFaUMsR0FBRTVDLEVBQUU0RyxDQUFDLENBQUM1RyxFQUFFb0gsQ0FBQyxHQUFFOzRCQUFHM0YsSUFBRW1CLEVBQUUxQyxDQUFDOzRCQUFDLENBQUMsTUFBSXVCLEtBQUlyRSxDQUFBQSxFQUFFbUQsQ0FBQyxHQUFDLENBQUMsQ0FBQTs0QkFBR3FDLEVBQUV2RSxDQUFDLEdBQUM7d0JBQUM7b0JBQUU7Z0JBQUMsRUFBRUEsR0FBRSxHQUFHNkIsRUFBRTZVLGVBQWUsSUFBR3hULENBQUFBLElBQUU7b0JBQUN5VCxhQUFZLE1BQUk5VSxFQUFFK1UsSUFBSSxHQUFDdFksQ0FBQyxDQUFDNEUsRUFBRSxHQUFDO29CQUFFMlQsY0FBYSxNQUFJaFYsRUFBRStVLElBQUksR0FBQ3RZLENBQUMsQ0FBQzRFLEVBQUUsR0FBQyxDQUFDO29CQUFFNFQsYUFBWSxNQUN0ZmpWLEVBQUUrVSxJQUFJLEdBQUN0WSxDQUFDLENBQUM0RSxFQUFFLEdBQUM7Z0JBQUUsR0FBRXJCLElBQUVqRCxPQUFPa0csTUFBTSxDQUFDbEcsT0FBT2tHLE1BQU0sQ0FBQ2xHLE9BQU9rRyxNQUFNLENBQUMsQ0FBQyxHQUFFO29CQUFDaVMsZ0JBQWU7b0JBQUdDLGlCQUFnQjtnQkFBQyxJQUFHblYsRUFBRTZVLGVBQWUsR0FBRXhULElBQUdyRCxFQUFFZSxJQUFJLENBQUNpQixFQUFDLENBQUMsQ0FBQztZQUFFO1lBQUMsSUFBRyxNQUFJakMsRUFBRXBCLE1BQU0sSUFBRSxNQUFJcUIsRUFBRXJCLE1BQU0sRUFBQyxJQUFJLENBQUMwRCxDQUFDLEdBQUMsQ0FBQyxHQUFFLElBQUksQ0FBQ3hDLENBQUMsR0FBQyxBQUFDLENBQUEsS0FBSyxNQUFJLElBQUksQ0FBQ0EsQ0FBQyxHQUFDLEVBQUUsR0FBQyxJQUFJLENBQUNBLENBQUMsQUFBREEsRUFBR3FILE1BQU0sQ0FBQ2xILElBQUcsSUFBSSxDQUFDeUQsQ0FBQyxHQUFDLEFBQUMsQ0FBQSxLQUFLLE1BQUksSUFBSSxDQUFDQSxDQUFDLEdBQUMsRUFBRSxHQUFDLElBQUksQ0FBQ0EsQ0FBQyxBQUFEQSxFQUFHeUQsTUFBTSxDQUFDbkg7UUFBRTtJQUFDO0lBQzNRLFNBQVNxWCxHQUFHM1ksQ0FBQztRQUFFLElBQUlDLEdBQUVRLEdBQUVhLEdBQUVDLEdBQUVHLEdBQUVFLEdBQUUyQjtRQUFFLE9BQU9tQixFQUFFLFNBQVNFLENBQUM7WUFBRSxPQUFPQSxFQUFFbEQsQ0FBQztnQkFBRSxLQUFLO29CQUFFLElBQUcsQ0FBQzFCLEVBQUU0RCxDQUFDLEVBQUMsT0FBT2dCLEVBQUViLE1BQU07b0JBQUcsSUFBRyxDQUFDL0QsRUFBRWdGLENBQUMsRUFBQzt3QkFBQ0osRUFBRWxELENBQUMsR0FBQzt3QkFBRTtvQkFBSztvQkFBQ3pCLElBQUVrQyxFQUFFbkMsRUFBRWdGLENBQUM7b0JBQUV2RSxJQUFFUixFQUFFZ0MsSUFBSTtnQkFBRyxLQUFLO29CQUFFLElBQUd4QixFQUFFTixJQUFJLEVBQUM7d0JBQUN5RSxFQUFFbEQsQ0FBQyxHQUFDO3dCQUFFO29CQUFLO29CQUFDSixJQUFFYixFQUFFTCxLQUFLO29CQUFDLE9BQU80RCxFQUFFWSxHQUFFdEQsS0FBSTtnQkFBRyxLQUFLO29CQUFFYixJQUFFUixFQUFFZ0MsSUFBSTtvQkFBRzJDLEVBQUVsRCxDQUFDLEdBQUM7b0JBQUU7Z0JBQU0sS0FBSztvQkFBRTFCLEVBQUVnRixDQUFDLEdBQUMsS0FBSztnQkFBRSxLQUFLO29CQUFFLElBQUdoRixFQUFFb0IsQ0FBQyxFQUFDO3dCQUFDRyxJQUFFLElBQUl2QixFQUFFdUQsQ0FBQyxDQUFDcVYsNEJBQTRCO3dCQUFDbFgsSUFBRVMsRUFBRW5DLEVBQUVvQixDQUFDO3dCQUFFLElBQUlRLElBQUVGLEVBQUVPLElBQUksSUFBRyxDQUFDTCxFQUFFekIsSUFBSSxFQUFDeUIsSUFBRUYsRUFBRU8sSUFBSSxHQUFHc0IsSUFBRTNCLEVBQUV4QixLQUFLLEVBQUNtQixFQUFFc1gsU0FBUyxDQUFDdFY7d0JBQUd2RCxFQUFFc0QsQ0FBQyxDQUFDd1YsYUFBYSxDQUFDdlg7d0JBQUdBLEVBQUUrVSxNQUFNO3dCQUFHdFcsRUFBRW9CLENBQUMsR0FBQyxLQUFLO29CQUFDO29CQUFDcEIsRUFBRTRELENBQUMsR0FBQyxDQUFDO29CQUFFZ0IsRUFBRWxELENBQUMsR0FBQztZQUFDO1FBQUM7SUFBRTtJQUMxYTVCLEVBQUVpWixVQUFVLEdBQUM7UUFBVyxJQUFJL1ksSUFBRSxJQUFJO1FBQUMsT0FBTzBFLEVBQUUsU0FBU3pFLENBQUM7WUFBRSxPQUFPLEtBQUdBLEVBQUV5QixDQUFDLEdBQUNzQyxFQUFFL0QsR0FBRXNXLEdBQUd2VyxJQUFHLEtBQUcsS0FBR0MsRUFBRXlCLENBQUMsR0FBQ3NDLEVBQUUvRCxHQUFFOFgsR0FBRy9YLElBQUcsS0FBR2dFLEVBQUUvRCxHQUFFMFksR0FBRzNZLElBQUc7UUFBRTtJQUFFO0lBQUUsU0FBUzJXLEdBQUczVyxDQUFDLEVBQUNDLENBQUM7UUFBRSxJQUFJUSxHQUFFYTtRQUFFLE9BQU9vRCxFQUFFLFNBQVNuRCxDQUFDO1lBQUUsSUFBR3RCLEtBQUtELEVBQUUrRSxDQUFDLEVBQUMsT0FBT3hELEVBQUV3QyxNQUFNLENBQUMvRCxFQUFFK0UsQ0FBQyxDQUFDOUUsRUFBRTtZQUFFUSxJQUFFVCxFQUFFNlYsVUFBVSxDQUFDNVYsR0FBRTtZQUFJcUIsSUFBRTBYLE1BQU12WSxHQUFHZ0UsSUFBSSxDQUFDLFNBQVMvQyxDQUFDO2dCQUFFLE9BQU9BLEVBQUV1WCxXQUFXO1lBQUU7WUFBR2paLEVBQUUrRSxDQUFDLENBQUM5RSxFQUFFLEdBQUNxQjtZQUFFLE9BQU9DLEVBQUV3QyxNQUFNLENBQUN6QztRQUFFO0lBQUU7SUFBQ3hCLEVBQUVpWCxZQUFZLEdBQUMsU0FBUy9XLENBQUMsRUFBQ0MsQ0FBQztRQUFFLElBQUksQ0FBQ3FELENBQUMsR0FBQyxJQUFJLENBQUNBLENBQUMsQ0FBQ3lULFlBQVksQ0FBQy9XLEdBQUVDLEtBQUcsSUFBSSxDQUFDa0MsQ0FBQyxDQUFDbkMsRUFBRSxHQUFDQztJQUFDO0lBQUVILEVBQUVvWixvQkFBb0IsR0FBQztRQUFXLElBQUksQ0FBQy9XLENBQUMsR0FBQyxDQUFDO1FBQUUsSUFBSSxDQUFDbUIsQ0FBQyxJQUFFLElBQUksQ0FBQ0EsQ0FBQyxDQUFDNFYsb0JBQW9CO0lBQUU7SUFDNWNwWixFQUFFcVosSUFBSSxHQUFDLFNBQVNuWixDQUFDLEVBQUNDLENBQUM7UUFBRSxJQUFJUSxJQUFFLElBQUksRUFBQ2EsR0FBRUMsR0FBRUcsR0FBRUUsR0FBRTJCLEdBQUVxQixHQUFFdkIsR0FBRXlCLEdBQUVtQjtRQUFFLE9BQU92QixFQUFFLFNBQVNtQixDQUFDO1lBQUUsT0FBT0EsRUFBRW5FLENBQUM7Z0JBQUUsS0FBSztvQkFBRSxJQUFHLENBQUNqQixFQUFFaUIsQ0FBQyxDQUFDMFgsTUFBTSxFQUFDLE9BQU92VCxFQUFFOUIsTUFBTTtvQkFBR3pDLElBQUUsTUFBSyxDQUFBLEtBQUssTUFBSXJCLEtBQUcsU0FBT0EsSUFBRW9aLFlBQVlDLEdBQUcsS0FBR3JaLENBQUFBO29CQUFHLE9BQU8rRCxFQUFFNkIsR0FBRXBGLEVBQUV1QyxDQUFDLEVBQUM7Z0JBQUcsS0FBSztvQkFBRSxPQUFPZ0IsRUFBRTZCLEdBQUVwRixFQUFFc1ksVUFBVSxJQUFHO2dCQUFHLEtBQUs7b0JBQUV4WCxJQUFFLElBQUlkLEVBQUU4QyxDQUFDLENBQUNnVyxjQUFjO29CQUFDN1gsSUFBRVMsRUFBRTdCLE9BQU82VixJQUFJLENBQUNuVztvQkFBSSxJQUFJNEIsSUFBRUYsRUFBRU8sSUFBSSxJQUFHLENBQUNMLEVBQUV6QixJQUFJLEVBQUN5QixJQUFFRixFQUFFTyxJQUFJLEdBQUcsSUFBR3NCLElBQUUzQixFQUFFeEIsS0FBSyxFQUFDd0UsSUFBRW5FLEVBQUVpQixDQUFDLENBQUMwWCxNQUFNLENBQUM3VixFQUFFLEVBQUM7d0JBQUN2RCxHQUFFOzRCQUFDLElBQUk4RixJQUFFOUYsQ0FBQyxDQUFDdUQsRUFBRTs0QkFBQyxPQUFPcUIsRUFBRTBULElBQUk7Z0NBQUUsS0FBSztvQ0FBUSxJQUFJdlMsSUFBRXRGLEVBQUVnRCxDQUFDLENBQUNtQixFQUFFNFUsTUFBTSxDQUFDO29DQUFDelQsS0FBSUEsQ0FBQUEsSUFBRSxJQUFJa00sR0FBR3hSLEVBQUU4QyxDQUFDLEVBQUM5QyxFQUFFMEQsQ0FBQyxHQUFFMUQsRUFBRWdELENBQUMsQ0FBQ21CLEVBQUU0VSxNQUFNLENBQUMsR0FBQ3pULENBQUFBO29DQUFHLE1BQUlBLEVBQUUxQyxDQUFDLElBQUcwQyxDQUFBQSxFQUFFMUMsQ0FBQyxHQUFDMEMsRUFBRXhDLENBQUMsQ0FBQ2tXLGFBQWEsRUFBQztvQ0FBRyxJQUFHLGdCQUFjLE9BQU9DLG9CQUN0ZjVULGFBQWE0VCxrQkFBaUI7d0NBQUMsSUFBSTFULElBQUVGLEVBQUU2VCxVQUFVO3dDQUFDLElBQUk3QyxJQUFFaFIsRUFBRThULFdBQVc7b0NBQUEsT0FBSyxnQkFBYyxPQUFPQyxvQkFBa0IvVCxhQUFhK1QsbUJBQWtCN1QsQ0FBQUEsSUFBRUYsRUFBRWdVLFlBQVksRUFBQ2hELElBQUVoUixFQUFFaVUsYUFBYSxBQUFELElBQUkvVCxDQUFBQSxJQUFFRixFQUFFMk0sS0FBSyxFQUFDcUUsSUFBRWhSLEVBQUUwTSxNQUFNLEFBQUQ7b0NBQUdzRSxJQUFFO3dDQUFDM0MsUUFBT3BPLEVBQUUxQyxDQUFDO3dDQUFDb1AsT0FBTXpNO3dDQUFFd00sUUFBT3NFO29DQUFDO29DQUFFOVEsSUFBRUQsRUFBRXJFLENBQUM7b0NBQUNzRSxFQUFFb00sTUFBTSxDQUFDSyxLQUFLLEdBQUNxRSxFQUFFckUsS0FBSztvQ0FBQ3pNLEVBQUVvTSxNQUFNLENBQUNJLE1BQU0sR0FBQ3NFLEVBQUV0RSxNQUFNO29DQUFDeE0sRUFBRWdPLGFBQWEsQ0FBQ2hPLEVBQUVpTyxRQUFRO29DQUFFbE8sRUFBRXhDLENBQUMsQ0FBQzJRLGFBQWEsQ0FBQ25PLEVBQUUxQyxDQUFDO29DQUFFMkMsRUFBRWdVLFVBQVUsQ0FBQ2hVLEVBQUVpVSxVQUFVLEVBQUMsR0FBRWpVLEVBQUVrVSxJQUFJLEVBQUNsVSxFQUFFa1UsSUFBSSxFQUFDbFUsRUFBRW1VLGFBQWEsRUFBQ3JVO29DQUFHQyxFQUFFeEMsQ0FBQyxDQUFDMlEsYUFBYSxDQUFDO29DQUFHbk8sSUFBRStRO29DQUFFLE1BQU05VztnQ0FBRSxLQUFLO29DQUFhK0YsSUFBRXRGLEVBQUVnRCxDQUFDLENBQUNtQixFQUFFNFUsTUFBTSxDQUFDO29DQUFDelQsS0FBSUEsQ0FBQUEsSUFBRSxJQUFJK08sR0FBR3JVLEVBQUU4QyxDQUFDLEdBQUU5QyxFQUFFZ0QsQ0FBQyxDQUFDbUIsRUFBRTRVLE1BQU0sQ0FBQyxHQUFDelQsQ0FBQUE7b0NBQ3BmQSxFQUFFMlEsSUFBSSxJQUFHM1EsQ0FBQUEsRUFBRTJRLElBQUksR0FBQyxJQUFJM1EsRUFBRXJFLENBQUMsQ0FBQzBZLGlCQUFpQixBQUFEO29DQUFHclUsRUFBRTJRLElBQUksQ0FBQy9NLEtBQUssQ0FBQzdELEVBQUU1RixNQUFNO29DQUFFLElBQUk0VyxJQUFFLEdBQUVBLElBQUVoUixFQUFFNUYsTUFBTSxFQUFDLEVBQUU0VyxFQUFFO3dDQUFDOVEsSUFBRUYsQ0FBQyxDQUFDZ1IsRUFBRTt3Q0FBQyxJQUFJck4sSUFBRTFELEVBQUUyUSxJQUFJLEVBQUMxUixJQUFFeUUsRUFBRTRRLGNBQWMsRUFBQ3RWLElBQUUrUjt3Q0FBRSxJQUFJd0QsSUFBRXRVLEVBQUUzRCxFQUFFO3dDQUFDLElBQUltQixJQUFFLElBQUlvTjt3Q0FBR3pHLEVBQUUzRyxHQUFFLEdBQUU4VyxFQUFFelgsRUFBRTt3Q0FBRXNILEVBQUUzRyxHQUFFLEdBQUU4VyxFQUFFdlgsRUFBRTt3Q0FBRW9ILEVBQUUzRyxHQUFFLEdBQUU4VyxFQUFFOUgsTUFBTTt3Q0FBRXJJLEVBQUUzRyxHQUFFLEdBQUU4VyxFQUFFN0gsS0FBSzt3Q0FBRXRJLEVBQUUzRyxHQUFFLEdBQUU4VyxFQUFFQyxRQUFRO3dDQUFFcFEsRUFBRTNHLEdBQUUsR0FBRThXLEVBQUUzWCxFQUFFO3dDQUFFMlgsSUFBRTNMLEdBQUduTCxHQUFFcU47d0NBQUk3TCxFQUFFNUMsSUFBSSxDQUFDcUgsR0FBRTFFLEdBQUV1Vjt3Q0FBRyxJQUFHdFUsRUFBRThJLENBQUMsRUFBQyxJQUFJckYsSUFBRSxHQUFFQSxJQUFFekQsRUFBRThJLENBQUMsQ0FBQzVPLE1BQU0sRUFBQyxFQUFFdUosRUFBRTs0Q0FBQ2pHLElBQUV3QyxFQUFFOEksQ0FBQyxDQUFDckYsRUFBRTs0Q0FBQyxJQUFJcUksSUFBRXRPLEVBQUV1TyxVQUFVLEdBQUMsQ0FBQyxJQUFFLENBQUM7NENBQUUvTSxJQUFFZSxFQUFFMlEsSUFBSTs0Q0FBQzNSLElBQUVDLEVBQUV3VixxQkFBcUI7NENBQUNGLElBQUV4RDs0Q0FBRXRULElBQUVsRCxPQUFPa0csTUFBTSxDQUFDbEcsT0FBT2tHLE1BQU0sQ0FBQyxDQUFDLEdBQUVoRCxJQUFHO2dEQUFDdU8sWUFBV0QsSUFBRXRPLEVBQUV1TyxVQUFVLEdBQUM7NENBQUM7NENBQUdELElBQUUsSUFBSXZCOzRDQUFHcEcsRUFBRTJILEdBQUUsR0FBRXRPLEVBQUUxRCxDQUFDOzRDQUFFcUssRUFBRTJILEdBQUUsR0FBRXRPLEVBQUVyQyxDQUFDOzRDQUFFZ0osRUFBRTJILEdBQUUsR0FBRXRPLEVBQUVzTyxDQUFDOzRDQUFFdE8sRUFBRXVPLFVBQVUsSUFBRTVILEVBQUUySCxHQUFFLEdBQ3BmdE8sRUFBRXVPLFVBQVU7NENBQUV2TyxJQUFFbUwsR0FBR21ELEdBQUV0Qjs0Q0FBSXpMLEVBQUUzQyxJQUFJLENBQUM0QyxHQUFFc1YsR0FBRTlXO3dDQUFFO3dDQUFDLElBQUd3QyxFQUFFMkYsQ0FBQyxFQUFDLElBQUlsQyxJQUFFLEdBQUVBLElBQUV6RCxFQUFFMkYsQ0FBQyxDQUFDekwsTUFBTSxFQUFDLEVBQUV1SixFQUFFekUsSUFBRWUsRUFBRTJRLElBQUksRUFBQzNSLElBQUVDLEVBQUVxTCxpQkFBaUIsRUFBQ2lLLElBQUV4RCxHQUFFdFQsSUFBRXdDLEVBQUUyRixDQUFDLENBQUNsQyxFQUFFLEVBQUNxSSxJQUFFLElBQUk3QixJQUFHOUYsRUFBRTJILEdBQUUsR0FBRXRPLEVBQUVrTyxLQUFLLEdBQUVsTyxFQUFFaU8sS0FBSyxJQUFFdEgsRUFBRTJILEdBQUUsR0FBRXRPLEVBQUVpTyxLQUFLLEdBQUVqTyxFQUFFbU8sS0FBSyxJQUFFeEgsRUFBRTJILEdBQUUsR0FBRXRPLEVBQUVtTyxLQUFLLEdBQUVuTyxFQUFFb08sV0FBVyxJQUFFekgsRUFBRTJILEdBQUUsR0FBRXRPLEVBQUVvTyxXQUFXLEdBQUVwTyxJQUFFbUwsR0FBR21ELEdBQUU1QixLQUFJbkwsRUFBRTNDLElBQUksQ0FBQzRDLEdBQUVzVixHQUFFOVc7b0NBQUU7b0NBQUN1QyxJQUFFQSxFQUFFMlEsSUFBSTtvQ0FBQyxNQUFNMVc7Z0NBQUU7b0NBQVErRixJQUFFLENBQUM7NEJBQUM7d0JBQUM7d0JBQUMxQyxJQUFFMEM7d0JBQUVqQixJQUFFRixFQUFFNFUsTUFBTTt3QkFBQyxPQUFPNVUsRUFBRTBULElBQUk7NEJBQUUsS0FBSztnQ0FBUS9XLEVBQUVrWixhQUFhLENBQUNuYSxPQUFPa0csTUFBTSxDQUFDbEcsT0FBT2tHLE1BQU0sQ0FBQyxDQUFDLEdBQUVuRCxJQUFHO29DQUFDbVcsUUFBTzFVO29DQUFFNFYsV0FBVXBaO2dDQUFDO2dDQUFJOzRCQUFNLEtBQUs7Z0NBQWEyRSxJQUFFNUM7Z0NBQUU0QyxFQUFFdVQsTUFBTSxHQUFDMVU7Z0NBQUVtQixFQUFFeVUsU0FBUyxHQUFDcFo7Z0NBQUVDLEVBQUVvWixpQkFBaUIsQ0FBQzFVO2dDQUFHOzRCQUFNO2dDQUFRLE1BQU0vRSxNQUFNLGlDQUNuZjBELEVBQUUwVCxJQUFJLEdBQUM7d0JBQUs7b0JBQUM7b0JBQUM3WCxFQUFFNkMsQ0FBQyxDQUFDNlYsSUFBSSxDQUFDNVg7b0JBQUcsT0FBT3lDLEVBQUU2QixHQUFFcEYsRUFBRXVDLENBQUMsRUFBQztnQkFBRyxLQUFLO29CQUFFekIsRUFBRStVLE1BQU0sSUFBR3pRLEVBQUVuRSxDQUFDLEdBQUM7WUFBQztRQUFDO0lBQUU7SUFDdEUsU0FBU2taLEdBQUc1YSxDQUFDLEVBQUNDLENBQUMsRUFBQ1EsQ0FBQztRQUFFLElBQUlhLEdBQUVDLEdBQUVHLEdBQUVFLEdBQUUyQixHQUFFcUIsR0FBRXZCLEdBQUV5QixHQUFFbUIsR0FBRUosR0FBRUMsR0FBRUMsR0FBRUMsR0FBRThRO1FBQUUsT0FBT3BTLEVBQUUsU0FBUytFLENBQUM7WUFBRSxPQUFPQSxFQUFFL0gsQ0FBQztnQkFBRSxLQUFLO29CQUFFLElBQUcsQ0FBQ2pCLEdBQUUsT0FBT2dKLEVBQUUxRixNQUFNLENBQUM5RDtvQkFBR3FCLElBQUUsQ0FBQztvQkFBRUMsSUFBRTtvQkFBRUcsSUFBRVMsRUFBRTdCLE9BQU82VixJQUFJLENBQUMxVjtvQkFBSSxJQUFJbUIsSUFBRUYsRUFBRU8sSUFBSSxJQUFHLENBQUNMLEVBQUV6QixJQUFJLEVBQUN5QixJQUFFRixFQUFFTyxJQUFJLEdBQUdzQixJQUFFM0IsRUFBRXhCLEtBQUssRUFBQ3dFLElBQUVuRSxDQUFDLENBQUM4QyxFQUFFLEVBQUMsYUFBVyxPQUFPcUIsS0FBRyxjQUFZQSxFQUFFMFQsSUFBSSxJQUFFLEtBQUssTUFBSXJZLENBQUMsQ0FBQzJFLEVBQUU0VSxNQUFNLENBQUMsSUFBRSxFQUFFalk7b0JBQUUsSUFBRUEsS0FBSXZCLENBQUFBLEVBQUUwRSxDQUFDLEdBQUMsQ0FBQyxDQUFBO29CQUFHckIsSUFBRWxCLEVBQUU3QixPQUFPNlYsSUFBSSxDQUFDMVY7b0JBQUltQixJQUFFeUIsRUFBRXBCLElBQUk7Z0JBQUcsS0FBSztvQkFBRSxJQUFHTCxFQUFFekIsSUFBSSxFQUFDO3dCQUFDc0osRUFBRS9ILENBQUMsR0FBQzt3QkFBRTtvQkFBSztvQkFBQ29ELElBQUVsRCxFQUFFeEIsS0FBSztvQkFBQzZGLElBQUV4RixDQUFDLENBQUNxRSxFQUFFO29CQUFDLElBQUcsYUFBVyxPQUFPbUIsR0FBRSxPQUFPRCxJQUFFMUUsR0FBRXdWLElBQUVoUyxHQUFFZCxFQUFFeUYsR0FBRW9SLEdBQUc3YSxHQUFFOEUsR0FBRTdFLENBQUMsQ0FBQ2dHLEVBQUUsR0FBRTtvQkFBSUosSUFBRTVGLENBQUMsQ0FBQ2dHLEVBQUV1VCxNQUFNLENBQUM7b0JBQUMsSUFBRyxxQkFBbUJ2VCxFQUFFcVMsSUFBSSxFQUFDO3dCQUFDLElBQUd6UyxHQUFFOzRCQUFDLElBQUliLElBQUVhLEVBQUVpVixXQUFXOzRCQUFHLElBQUksSUFBSS9WLElBQUVjLEVBQUVrVixnQkFBZ0IsSUFDbGdCVCxJQUFFelUsRUFBRW1WLHNCQUFzQixJQUFHeFgsSUFBRSxFQUFFLEVBQUNzTyxJQUFFLEdBQUVBLElBQUU5TSxFQUFFaVcsSUFBSSxJQUFHLEVBQUVuSixFQUFFO2dDQUFDLElBQUk1RSxJQUFFd0IsR0FBRzFKLEVBQUVrVyxHQUFHLENBQUNwSixJQUFHbEIsSUFBR0M7Z0NBQUkzRCxJQUFFO29DQUFDN0ssSUFBRzt3Q0FBQ1EsSUFBR2dKLEVBQUVxQixHQUFFO3dDQUFHbkssSUFBRzhJLEVBQUVxQixHQUFFO3dDQUFHc0YsUUFBTzNHLEVBQUVxQixHQUFFO3dDQUFHdUYsT0FBTTVHLEVBQUVxQixHQUFFO3dDQUFHcU4sVUFBUzFPLEVBQUVxQixHQUFFLEdBQUU7d0NBQUd2SyxJQUFHc0osR0FBR2lCLEdBQUU7b0NBQUU7b0NBQUU0QixHQUFFaEQsR0FBRzRDLEdBQUczSixFQUFFbVcsR0FBRyxDQUFDcEosSUFBR3JCLElBQUdFLEtBQUlKLElBQUcsR0FBR2lCLEdBQUcsQ0FBQ0s7b0NBQUlsRyxHQUFFNEYsR0FBRzdDLEdBQUc0TCxFQUFFWSxHQUFHLENBQUNwSixJQUFHM0IsSUFBR0c7Z0NBQUk7Z0NBQUU5TSxFQUFFbEIsSUFBSSxDQUFDNEs7NEJBQUU7NEJBQUNsSSxJQUFFeEI7d0JBQUMsT0FBTXdCLElBQUUsRUFBRTt3QkFBQzFELENBQUMsQ0FBQ3dELEVBQUUsR0FBQ0U7d0JBQUV5RSxFQUFFL0gsQ0FBQyxHQUFDO3dCQUFFO29CQUFLO29CQUFDLElBQUcsaUJBQWV1RSxFQUFFcVMsSUFBSSxFQUFDO3dCQUFDLElBQUd6UyxHQUFFOzRCQUFDYixJQUFFdEUsTUFBTW1GLEVBQUVvVixJQUFJOzRCQUFJLElBQUlsVyxJQUFFLEdBQUVBLElBQUVjLEVBQUVvVixJQUFJLElBQUdsVyxJQUFJQyxDQUFDLENBQUNELEVBQUUsR0FBQ2MsRUFBRXFWLEdBQUcsQ0FBQ25XOzRCQUFHYyxFQUFFeVEsTUFBTTt3QkFBRSxPQUFNdFIsSUFBRSxFQUFFO3dCQUFDMUQsQ0FBQyxDQUFDd0QsRUFBRSxHQUFDRTt3QkFBRXlFLEVBQUUvSCxDQUFDLEdBQUM7d0JBQUU7b0JBQUs7b0JBQUMsSUFBRyxLQUFLLE1BQUltRSxHQUFFO3dCQUFDNEQsRUFBRS9ILENBQUMsR0FBQzt3QkFBRTtvQkFBSztvQkFBQyxJQUFHLGlCQUFldUUsRUFBRXFTLElBQUksRUFBQzt3QkFBQ2hYLENBQUMsQ0FBQ3dELEVBQUUsR0FBQ2U7d0JBQUU0RCxFQUFFL0gsQ0FBQyxHQUFDO3dCQUFFO29CQUFLO29CQUFDLElBQUcsWUFBVXVFLEVBQUVxUyxJQUFJLEVBQUM7d0JBQUNoWCxDQUFDLENBQUN3RCxFQUFFLEdBQUNlO3dCQUFFNEQsRUFBRS9ILENBQUMsR0FDcGY7d0JBQUU7b0JBQUs7b0JBQUMsSUFBRyxjQUFZdUUsRUFBRXFTLElBQUksRUFBQyxNQUFNcFgsTUFBTSxrQ0FBZ0MrRSxFQUFFcVMsSUFBSSxHQUFDO29CQUFLeFMsSUFBRTlGLEVBQUV3RCxDQUFDLENBQUNzQixFQUFFO29CQUFDZ0IsS0FBSUEsQ0FBQUEsSUFBRSxJQUFJbU0sR0FBR2pTLEVBQUV1RCxDQUFDLEVBQUN2RCxFQUFFbUUsQ0FBQyxHQUFFbkUsRUFBRXdELENBQUMsQ0FBQ3NCLEVBQUUsR0FBQ2dCLENBQUFBO29CQUFHLE9BQU85QixFQUFFeUYsR0FBRXlJLEdBQUdwTSxHQUFFRCxHQUFFN0YsRUFBRTBFLENBQUMsR0FBRTtnQkFBSSxLQUFLO29CQUFHcUIsSUFBRTBELEVBQUVsRyxDQUFDLEVBQUNqQyxDQUFDLENBQUN3RCxFQUFFLEdBQUNpQjtnQkFBRSxLQUFLO29CQUFFRSxFQUFFa1YsU0FBUyxJQUFFN1osQ0FBQyxDQUFDd0QsRUFBRSxJQUFHeEQsQ0FBQUEsQ0FBQyxDQUFDd0QsRUFBRSxHQUFDbUIsRUFBRWtWLFNBQVMsQ0FBQzdaLENBQUMsQ0FBQ3dELEVBQUUsQ0FBQTtvQkFBRzJFLEVBQUUvSCxDQUFDLEdBQUM7b0JBQUU7Z0JBQU0sS0FBSztvQkFBR3NFLENBQUMsQ0FBQzhRLEVBQUUsR0FBQ3JOLEVBQUVsRyxDQUFDO2dCQUFDLEtBQUs7b0JBQUUzQixJQUFFeUIsRUFBRXBCLElBQUk7b0JBQUd3SCxFQUFFL0gsQ0FBQyxHQUFDO29CQUFFO2dCQUFNLEtBQUs7b0JBQUUsT0FBTytILEVBQUUxRixNQUFNLENBQUN6QztZQUFFO1FBQUM7SUFBRTtJQUN6VCxTQUFTdVosR0FBRzdhLENBQUMsRUFBQ0MsQ0FBQyxFQUFDUSxDQUFDO1FBQUUsSUFBSWE7UUFBRSxPQUFPb0QsRUFBRSxTQUFTbkQsQ0FBQztZQUFFLE9BQU0sYUFBVyxPQUFPZCxLQUFHQSxhQUFhMkgsY0FBWTNILGFBQWFULEVBQUV1RCxDQUFDLENBQUM2WCxhQUFhLEdBQUM3WixFQUFFd0MsTUFBTSxDQUFDdEQsS0FBR0EsYUFBYVQsRUFBRXVELENBQUMsQ0FBQzhYLGdCQUFnQixHQUFFL1osQ0FBQUEsSUFBRXRCLEVBQUV3RCxDQUFDLENBQUN2RCxFQUFFLEVBQUNxQixLQUFJQSxDQUFBQSxJQUFFLElBQUkyUSxHQUFHalMsRUFBRXVELENBQUMsRUFBQ3ZELEVBQUVtRSxDQUFDLEdBQUVuRSxFQUFFd0QsQ0FBQyxDQUFDdkQsRUFBRSxHQUFDcUIsQ0FBQUEsR0FBR0MsRUFBRXdDLE1BQU0sQ0FBQ21PLEdBQUc1USxHQUFFYixHQUFFVCxFQUFFMEUsQ0FBQyxFQUFDLElBQUduRCxFQUFFd0MsTUFBTSxDQUFDLEtBQUs7UUFBRTtJQUFFO0lBQ2xRLFNBQVNrVSxHQUFHalksQ0FBQyxFQUFDQyxDQUFDO1FBQUUsSUFBSSxJQUFJUSxJQUFFUixFQUFFcWIsSUFBSSxJQUFFLEtBQUloYSxJQUFFLEVBQUUsQ0FBQ21ILE1BQU0sQ0FBQ3BHLEdBQUdwQyxFQUFFc2IsS0FBSyxJQUFHaGEsSUFBRSxJQUFJdkIsRUFBRXVELENBQUMsQ0FBQ2lZLFVBQVUsRUFBQzlaLElBQUVTLEVBQUVsQyxFQUFFc2IsS0FBSyxHQUFFM1osSUFBRUYsRUFBRU8sSUFBSSxJQUFHLENBQUNMLEVBQUV6QixJQUFJLEVBQUN5QixJQUFFRixFQUFFTyxJQUFJLEdBQUdWLEVBQUVzWCxTQUFTLENBQUNqWCxFQUFFeEIsS0FBSztRQUFFc0IsSUFBRTFCLEVBQUV1RCxDQUFDLENBQUNrWSxjQUFjLENBQUNDLFNBQVMsQ0FBQztZQUFDQyxXQUFVLFNBQVNwWSxDQUFDO2dCQUFFLElBQUksSUFBSXFCLElBQUUsQ0FBQyxHQUFFdkIsSUFBRSxHQUFFQSxJQUFFcEQsRUFBRXNiLEtBQUssQ0FBQ3JiLE1BQU0sRUFBQyxFQUFFbUQsRUFBRXVCLENBQUMsQ0FBQ3RELENBQUMsQ0FBQytCLEVBQUUsQ0FBQyxHQUFDRSxFQUFFMlgsR0FBRyxDQUFDN1g7Z0JBQUcsSUFBSXlCLElBQUU5RSxFQUFFMlYsU0FBUyxDQUFDbFYsRUFBRTtnQkFBQ3FFLEtBQUk5RSxDQUFBQSxFQUFFZ0QsQ0FBQyxHQUFDNFgsR0FBRzVhLEdBQUU0RSxHQUFFM0UsRUFBRTJiLElBQUksRUFBRW5YLElBQUksQ0FBQyxTQUFTd0IsQ0FBQztvQkFBRUEsSUFBRW5CLEVBQUVtQjtvQkFBRyxJQUFJLElBQUlKLElBQUUsR0FBRUEsSUFBRTVGLEVBQUVzYixLQUFLLENBQUNyYixNQUFNLEVBQUMsRUFBRTJGLEVBQUU7d0JBQUMsSUFBSUMsSUFBRWxCLENBQUMsQ0FBQ3RELENBQUMsQ0FBQ3VFLEVBQUUsQ0FBQzt3QkFBQyxhQUFXLE9BQU9DLEtBQUdBLEVBQUVZLGNBQWMsSUFBRVosRUFBRVksY0FBYyxDQUFDLGFBQVdaLEVBQUV3USxNQUFNO29CQUFFO29CQUFDclEsS0FBSWpHLENBQUFBLEVBQUVnRCxDQUFDLEdBQUNpRCxDQUFBQTtnQkFBRSxFQUFDO1lBQUU7UUFBQztRQUFHakcsRUFBRXNELENBQUMsQ0FBQ3VZLG1CQUFtQixDQUFDdGEsR0FBRUc7UUFBR0gsRUFBRStVLE1BQU07SUFBRTtJQUM1ZnhXLEVBQUU2YixTQUFTLEdBQUMsU0FBUzNiLENBQUMsRUFBQ0MsQ0FBQztRQUFFLElBQUksQ0FBQzBWLFNBQVMsQ0FBQzFWLEtBQUcsSUFBSSxHQUFDRDtJQUFDO0lBQUVnSCxFQUFFLFlBQVcwTztJQUFJMU8sRUFBRSxjQUFhO1FBQUM4VSxNQUFLO1FBQUVDLFFBQU87UUFBRTNZLElBQUc7UUFBRSxHQUFFO1FBQU8sR0FBRTtRQUFTLEdBQUU7SUFBUTtJQUFHLFNBQVM0WSxHQUFHaGMsQ0FBQztRQUFFLEtBQUssTUFBSUEsS0FBSUEsQ0FBQUEsSUFBRSxDQUFBO1FBQUcsT0FBTyxNQUFJQSxJQUFFLDhCQUE0QjtJQUEyQjtJQUNoUCxTQUFTaWMsR0FBR2pjLENBQUM7UUFBRSxJQUFJQyxJQUFFLElBQUk7UUFBQ0QsSUFBRUEsS0FBRyxDQUFDO1FBQUUsSUFBSSxDQUFDMEIsQ0FBQyxHQUFDLElBQUlnVSxHQUFHO1lBQUNHLFlBQVc3VixFQUFFNlYsVUFBVTtZQUFDVyxPQUFNLFNBQVMvVixDQUFDO2dCQUFFLE9BQU07b0JBQUM7d0JBQUNtVyxLQUFJO29CQUF3QztvQkFBRTt3QkFBQ0ksTUFBSyxDQUFDO3dCQUFFSixLQUFJO29CQUE0QjtvQkFBRTt3QkFBQ0ksTUFBSyxDQUFDO3dCQUFFSixLQUFJO29CQUFpQztvQkFBRTt3QkFBQ0YsTUFBSyxDQUFDO3dCQUFFRSxLQUFJb0YsR0FBR3ZiLEVBQUV5YixlQUFlO29CQUFDO2lCQUFFO1lBQUE7WUFBRS9FLE9BQU07Z0JBQUNQLEtBQUk7WUFBZ0I7WUFBRXdDLFFBQU87Z0JBQUMrQyxPQUFNO29CQUFDN0QsTUFBSztvQkFBUWtCLFFBQU87Z0JBQWtCO1lBQUM7WUFBRTdELFdBQVU7Z0JBQUM7b0JBQUM0RixPQUFNO3dCQUFDO3dCQUF1Qjt3QkFBNkI7d0JBQW9CO3FCQUFtQjtvQkFBQ0ssTUFBSzt3QkFBQ08sT0FBTTt3QkFDbGVDLG9CQUFtQjs0QkFBQzlELE1BQUs7NEJBQWFrQixRQUFPOzRCQUF1QjJCLFdBQVVuSjt3QkFBRTt3QkFBRXFLLHlCQUF3Qjs0QkFBQy9ELE1BQUs7NEJBQWFrQixRQUFPOzRCQUE2QjJCLFdBQVVuSjt3QkFBRTt3QkFBRXNLLGlCQUFnQjs0QkFBQ2hFLE1BQUs7NEJBQWFrQixRQUFPOzRCQUFtQjJCLFdBQVUsU0FBUzFhLENBQUM7Z0NBQUUsT0FBT0EsRUFBRStRLEdBQUcsQ0FBQyxTQUFTbFEsQ0FBQztvQ0FBRSxPQUFPaVEsR0FBRzdDLEdBQUdwTixHQUFFNk8sSUFBR0csSUFBSSxDQUFDLEVBQUU7Z0NBQUE7NEJBQUU7d0JBQUM7b0JBQUM7Z0JBQUM7YUFBRTtZQUFDNEYsU0FBUTtnQkFBQ3FHLGlCQUFnQjtvQkFBQ2pFLE1BQUs7b0JBQUVGLGlCQUFnQjt3QkFBQ29FLGdCQUFlO3dCQUFzQkMsV0FBVTtvQkFBbUI7b0JBQUVyRyxTQUFRLGFBQVcsT0FBT3RWLFVBQVEsS0FBSyxNQUFJQSxPQUFPNGIsU0FBUyxHQUFDLENBQUMsSUFBRSxrRUFBa0VyYixLQUFLLENBQUMsS0FBS3NiLFFBQVEsQ0FBQ0QsVUFBVUUsUUFBUSxLQUN6bEJGLFVBQVVHLFNBQVMsQ0FBQ0YsUUFBUSxDQUFDLFVBQVEsZ0JBQWVwWDtnQkFBUTtnQkFBRXVYLFlBQVc7b0JBQUN4RSxNQUFLO29CQUFFRixpQkFBZ0I7d0JBQUNvRSxnQkFBZTt3QkFBcUI5RCxpQkFBZ0I7d0JBQUUrRCxXQUFVO29CQUFpQjtnQkFBQztnQkFBRU0sYUFBWTtvQkFBQ3pFLE1BQUs7b0JBQUVGLGlCQUFnQjt3QkFBQ29FLGdCQUFlO3dCQUErQi9ELGdCQUFlO3dCQUErQmdFLFdBQVU7b0JBQVc7Z0JBQUM7Z0JBQUVQLGlCQUFnQjtvQkFBQzVELE1BQUs7b0JBQUVGLGlCQUFnQjt3QkFBQ29FLGdCQUFlO3dCQUErQi9ELGdCQUFlO3dCQUE4Q2dFLFdBQVU7b0JBQVc7b0JBQ3hmdEUsVUFBUyxTQUFTMVgsQ0FBQzt3QkFBRSxJQUFJYSxHQUFFQyxHQUFFRzt3QkFBRSxPQUFPZ0QsRUFBRSxTQUFTOUMsQ0FBQzs0QkFBRSxJQUFHLEtBQUdBLEVBQUVGLENBQUMsRUFBQyxPQUFPSixJQUFFMGEsR0FBR3ZiLElBQUdjLElBQUUsaURBQStDRCxHQUFFMEMsRUFBRXBDLEdBQUUrVSxHQUFHMVcsRUFBRXlCLENBQUMsRUFBQ0osSUFBRzs0QkFBR0ksSUFBRUUsRUFBRTJCLENBQUM7NEJBQUN0RCxFQUFFeUIsQ0FBQyxDQUFDcVYsWUFBWSxDQUFDeFYsR0FBRUc7NEJBQUcsT0FBT0UsRUFBRW1DLE1BQU0sQ0FBQyxDQUFDO3dCQUFFO29CQUFFO2dCQUFDO2dCQUFFaVosd0JBQXVCO29CQUFDMUUsTUFBSztvQkFBRUYsaUJBQWdCO3dCQUFDb0UsZ0JBQWU7d0JBQWdDL0QsZ0JBQWU7d0JBQTJFZ0UsV0FBVTtvQkFBa0I7Z0JBQUM7Z0JBQUVRLHVCQUFzQjtvQkFBQzNFLE1BQUs7b0JBQUVGLGlCQUFnQjt3QkFBQ29FLGdCQUFlO3dCQUF5Qi9ELGdCQUFlO3dCQUNuZ0JnRSxXQUFVO29CQUFXO2dCQUFDO1lBQUM7UUFBQztJQUFFO0lBQUMzYyxJQUFFbWMsR0FBR3RiLFNBQVM7SUFBQ2IsRUFBRXVXLEtBQUssR0FBQztRQUFXLElBQUksQ0FBQzNVLENBQUMsQ0FBQzJVLEtBQUs7UUFBRyxPQUFPOVIsUUFBUUMsT0FBTztJQUFFO0lBQUUxRSxFQUFFNmIsU0FBUyxHQUFDLFNBQVMzYixDQUFDO1FBQUUsSUFBSSxDQUFDMEIsQ0FBQyxDQUFDaWEsU0FBUyxDQUFDM2I7SUFBRTtJQUFFRixFQUFFaVosVUFBVSxHQUFDO1FBQVcsSUFBSS9ZLElBQUUsSUFBSTtRQUFDLE9BQU8wRSxFQUFFLFNBQVN6RSxDQUFDO1lBQUUsT0FBTytELEVBQUUvRCxHQUFFRCxFQUFFMEIsQ0FBQyxDQUFDcVgsVUFBVSxJQUFHO1FBQUU7SUFBRTtJQUFFalosRUFBRTZKLEtBQUssR0FBQztRQUFXLElBQUksQ0FBQ2pJLENBQUMsQ0FBQ2lJLEtBQUs7SUFBRTtJQUFFN0osRUFBRXFaLElBQUksR0FBQyxTQUFTblosQ0FBQztRQUFFLElBQUlDLElBQUUsSUFBSTtRQUFDLE9BQU95RSxFQUFFLFNBQVNqRSxDQUFDO1lBQUUsT0FBT3VELEVBQUV2RCxHQUFFUixFQUFFeUIsQ0FBQyxDQUFDeVgsSUFBSSxDQUFDblosSUFBRztRQUFFO0lBQUU7SUFBRUYsRUFBRW9ZLFVBQVUsR0FBQyxTQUFTbFksQ0FBQztRQUFFLElBQUksQ0FBQzBCLENBQUMsQ0FBQ3dXLFVBQVUsQ0FBQ2xZO0lBQUU7SUFBRWdILEVBQUUsU0FBUWlWO0lBQ3paalYsRUFBRSxvQkFBbUI7UUFBQztZQUFDO1lBQUU7U0FBRTtRQUFDO1lBQUM7WUFBRTtTQUFFO1FBQUM7WUFBQztZQUFFO1NBQUU7UUFBQztZQUFDO1lBQUU7U0FBRTtRQUFDO1lBQUM7WUFBRTtTQUFFO1FBQUM7WUFBQztZQUFFO1NBQUU7UUFBQztZQUFDO1lBQUU7U0FBRTtRQUFDO1lBQUM7WUFBRTtTQUFFO1FBQUM7WUFBQztZQUFFO1NBQUU7UUFBQztZQUFDO1lBQUU7U0FBRztRQUFDO1lBQUM7WUFBRztTQUFHO1FBQUM7WUFBQztZQUFHO1NBQUc7UUFBQztZQUFDO1lBQUU7U0FBRztRQUFDO1lBQUM7WUFBRztTQUFHO1FBQUM7WUFBQztZQUFHO1NBQUc7UUFBQztZQUFDO1lBQUc7U0FBRztRQUFDO1lBQUM7WUFBRztTQUFHO1FBQUM7WUFBQztZQUFFO1NBQUc7UUFBQztZQUFDO1lBQUc7U0FBRztRQUFDO1lBQUM7WUFBRztTQUFHO1FBQUM7WUFBQztZQUFHO1NBQUc7S0FBQztJQUFFQSxFQUFFLFdBQVU7QUFBa0IsQ0FBQSxFQUFHNUUsSUFBSSxDQUFDLElBQUkifQ==