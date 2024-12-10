"use strict";
var numeric = typeof exports === "undefined" ? function numeric1() {} : exports;
if (typeof global !== "undefined") {
    global.numeric = numeric;
}
numeric.version = "1.2.6";
// 1. Utility functions
numeric.bench = function bench(f, interval) {
    var t1, t2, n, i;
    if (typeof interval === "undefined") {
        interval = 15;
    }
    n = 0.5;
    t1 = new Date();
    while(1){
        n *= 2;
        for(i = n; i > 3; i -= 4){
            f();
            f();
            f();
            f();
        }
        while(i > 0){
            f();
            i--;
        }
        t2 = new Date();
        if (t2 - t1 > interval) break;
    }
    for(i = n; i > 3; i -= 4){
        f();
        f();
        f();
        f();
    }
    while(i > 0){
        f();
        i--;
    }
    t2 = new Date();
    return 1000 * (3 * n - 1) / (t2 - t1);
};
numeric._myIndexOf = function _myIndexOf(w) {
    var n = this.length, k;
    for(k = 0; k < n; ++k)if (this[k] === w) return k;
    return -1;
};
numeric.myIndexOf = Array.prototype.indexOf ? Array.prototype.indexOf : numeric._myIndexOf;
numeric.Function = Function;
numeric.precision = 4;
numeric.largeArray = 50;
numeric.prettyPrint = function prettyPrint(x) {
    function fmtnum(x) {
        if (x === 0) {
            return '0';
        }
        if (isNaN(x)) {
            return 'NaN';
        }
        if (x < 0) {
            return '-' + fmtnum(-x);
        }
        if (isFinite(x)) {
            var scale = Math.floor(Math.log(x) / Math.log(10));
            var normalized = x / Math.pow(10, scale);
            var basic = normalized.toPrecision(numeric.precision);
            if (parseFloat(basic) === 10) {
                scale++;
                normalized = 1;
                basic = normalized.toPrecision(numeric.precision);
            }
            return parseFloat(basic).toString() + 'e' + scale.toString();
        }
        return 'Infinity';
    }
    var ret = [];
    function foo(x) {
        var k;
        if (typeof x === "undefined") {
            ret.push(Array(numeric.precision + 8).join(' '));
            return false;
        }
        if (typeof x === "string") {
            ret.push('"' + x + '"');
            return false;
        }
        if (typeof x === "boolean") {
            ret.push(x.toString());
            return false;
        }
        if (typeof x === "number") {
            var a = fmtnum(x);
            var b = x.toPrecision(numeric.precision);
            var c = parseFloat(x.toString()).toString();
            var d = [
                a,
                b,
                c,
                parseFloat(b).toString(),
                parseFloat(c).toString()
            ];
            for(k = 1; k < d.length; k++){
                if (d[k].length < a.length) a = d[k];
            }
            ret.push(Array(numeric.precision + 8 - a.length).join(' ') + a);
            return false;
        }
        if (x === null) {
            ret.push("null");
            return false;
        }
        if (typeof x === "function") {
            ret.push(x.toString());
            var flag = false;
            for(k in x){
                if (x.hasOwnProperty(k)) {
                    if (flag) ret.push(',\n');
                    else ret.push('\n{');
                    flag = true;
                    ret.push(k);
                    ret.push(': \n');
                    foo(x[k]);
                }
            }
            if (flag) ret.push('}\n');
            return true;
        }
        if (x instanceof Array) {
            if (x.length > numeric.largeArray) {
                ret.push('...Large Array...');
                return true;
            }
            var flag = false;
            ret.push('[');
            for(k = 0; k < x.length; k++){
                if (k > 0) {
                    ret.push(',');
                    if (flag) ret.push('\n ');
                }
                flag = foo(x[k]);
            }
            ret.push(']');
            return true;
        }
        ret.push('{');
        var flag = false;
        for(k in x){
            if (x.hasOwnProperty(k)) {
                if (flag) ret.push(',\n');
                flag = true;
                ret.push(k);
                ret.push(': \n');
                foo(x[k]);
            }
        }
        ret.push('}');
        return true;
    }
    foo(x);
    return ret.join('');
};
numeric.parseDate = function parseDate(d) {
    function foo(d) {
        if (typeof d === 'string') {
            return Date.parse(d.replace(/-/g, '/'));
        }
        if (!(d instanceof Array)) {
            throw new Error("parseDate: parameter must be arrays of strings");
        }
        var ret = [], k;
        for(k = 0; k < d.length; k++){
            ret[k] = foo(d[k]);
        }
        return ret;
    }
    return foo(d);
};
numeric.parseFloat = function parseFloat_(d) {
    function foo(d) {
        if (typeof d === 'string') {
            return parseFloat(d);
        }
        if (!(d instanceof Array)) {
            throw new Error("parseFloat: parameter must be arrays of strings");
        }
        var ret = [], k;
        for(k = 0; k < d.length; k++){
            ret[k] = foo(d[k]);
        }
        return ret;
    }
    return foo(d);
};
numeric.parseCSV = function parseCSV(t) {
    var foo = t.split('\n');
    var j, k;
    var ret = [];
    var pat = /(([^'",]*)|('[^']*')|("[^"]*")),/g;
    var patnum = /^\s*(([+-]?[0-9]+(\.[0-9]*)?(e[+-]?[0-9]+)?)|([+-]?[0-9]*(\.[0-9]+)?(e[+-]?[0-9]+)?))\s*$/;
    var stripper = function(n) {
        return n.substr(0, n.length - 1);
    };
    var count = 0;
    for(k = 0; k < foo.length; k++){
        var bar = (foo[k] + ",").match(pat), baz;
        if (bar.length > 0) {
            ret[count] = [];
            for(j = 0; j < bar.length; j++){
                baz = stripper(bar[j]);
                if (patnum.test(baz)) {
                    ret[count][j] = parseFloat(baz);
                } else ret[count][j] = baz;
            }
            count++;
        }
    }
    return ret;
};
numeric.toCSV = function toCSV(A) {
    var s = numeric.dim(A);
    var i, j, m, n, row, ret;
    m = s[0];
    n = s[1];
    ret = [];
    for(i = 0; i < m; i++){
        row = [];
        for(j = 0; j < m; j++){
            row[j] = A[i][j].toString();
        }
        ret[i] = row.join(', ');
    }
    return ret.join('\n') + '\n';
};
numeric.getURL = function getURL(url) {
    var client = new XMLHttpRequest();
    client.open("GET", url, false);
    client.send();
    return client;
};
numeric.imageURL = function imageURL(img) {
    function base64(A) {
        var n = A.length, i, x, y, z, p, q, r, s;
        var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var ret = "";
        for(i = 0; i < n; i += 3){
            x = A[i];
            y = A[i + 1];
            z = A[i + 2];
            p = x >> 2;
            q = ((x & 3) << 4) + (y >> 4);
            r = ((y & 15) << 2) + (z >> 6);
            s = z & 63;
            if (i + 1 >= n) {
                r = s = 64;
            } else if (i + 2 >= n) {
                s = 64;
            }
            ret += key.charAt(p) + key.charAt(q) + key.charAt(r) + key.charAt(s);
        }
        return ret;
    }
    function crc32Array(a, from, to) {
        if (typeof from === "undefined") {
            from = 0;
        }
        if (typeof to === "undefined") {
            to = a.length;
        }
        var table = [
            0x00000000,
            0x77073096,
            0xEE0E612C,
            0x990951BA,
            0x076DC419,
            0x706AF48F,
            0xE963A535,
            0x9E6495A3,
            0x0EDB8832,
            0x79DCB8A4,
            0xE0D5E91E,
            0x97D2D988,
            0x09B64C2B,
            0x7EB17CBD,
            0xE7B82D07,
            0x90BF1D91,
            0x1DB71064,
            0x6AB020F2,
            0xF3B97148,
            0x84BE41DE,
            0x1ADAD47D,
            0x6DDDE4EB,
            0xF4D4B551,
            0x83D385C7,
            0x136C9856,
            0x646BA8C0,
            0xFD62F97A,
            0x8A65C9EC,
            0x14015C4F,
            0x63066CD9,
            0xFA0F3D63,
            0x8D080DF5,
            0x3B6E20C8,
            0x4C69105E,
            0xD56041E4,
            0xA2677172,
            0x3C03E4D1,
            0x4B04D447,
            0xD20D85FD,
            0xA50AB56B,
            0x35B5A8FA,
            0x42B2986C,
            0xDBBBC9D6,
            0xACBCF940,
            0x32D86CE3,
            0x45DF5C75,
            0xDCD60DCF,
            0xABD13D59,
            0x26D930AC,
            0x51DE003A,
            0xC8D75180,
            0xBFD06116,
            0x21B4F4B5,
            0x56B3C423,
            0xCFBA9599,
            0xB8BDA50F,
            0x2802B89E,
            0x5F058808,
            0xC60CD9B2,
            0xB10BE924,
            0x2F6F7C87,
            0x58684C11,
            0xC1611DAB,
            0xB6662D3D,
            0x76DC4190,
            0x01DB7106,
            0x98D220BC,
            0xEFD5102A,
            0x71B18589,
            0x06B6B51F,
            0x9FBFE4A5,
            0xE8B8D433,
            0x7807C9A2,
            0x0F00F934,
            0x9609A88E,
            0xE10E9818,
            0x7F6A0DBB,
            0x086D3D2D,
            0x91646C97,
            0xE6635C01,
            0x6B6B51F4,
            0x1C6C6162,
            0x856530D8,
            0xF262004E,
            0x6C0695ED,
            0x1B01A57B,
            0x8208F4C1,
            0xF50FC457,
            0x65B0D9C6,
            0x12B7E950,
            0x8BBEB8EA,
            0xFCB9887C,
            0x62DD1DDF,
            0x15DA2D49,
            0x8CD37CF3,
            0xFBD44C65,
            0x4DB26158,
            0x3AB551CE,
            0xA3BC0074,
            0xD4BB30E2,
            0x4ADFA541,
            0x3DD895D7,
            0xA4D1C46D,
            0xD3D6F4FB,
            0x4369E96A,
            0x346ED9FC,
            0xAD678846,
            0xDA60B8D0,
            0x44042D73,
            0x33031DE5,
            0xAA0A4C5F,
            0xDD0D7CC9,
            0x5005713C,
            0x270241AA,
            0xBE0B1010,
            0xC90C2086,
            0x5768B525,
            0x206F85B3,
            0xB966D409,
            0xCE61E49F,
            0x5EDEF90E,
            0x29D9C998,
            0xB0D09822,
            0xC7D7A8B4,
            0x59B33D17,
            0x2EB40D81,
            0xB7BD5C3B,
            0xC0BA6CAD,
            0xEDB88320,
            0x9ABFB3B6,
            0x03B6E20C,
            0x74B1D29A,
            0xEAD54739,
            0x9DD277AF,
            0x04DB2615,
            0x73DC1683,
            0xE3630B12,
            0x94643B84,
            0x0D6D6A3E,
            0x7A6A5AA8,
            0xE40ECF0B,
            0x9309FF9D,
            0x0A00AE27,
            0x7D079EB1,
            0xF00F9344,
            0x8708A3D2,
            0x1E01F268,
            0x6906C2FE,
            0xF762575D,
            0x806567CB,
            0x196C3671,
            0x6E6B06E7,
            0xFED41B76,
            0x89D32BE0,
            0x10DA7A5A,
            0x67DD4ACC,
            0xF9B9DF6F,
            0x8EBEEFF9,
            0x17B7BE43,
            0x60B08ED5,
            0xD6D6A3E8,
            0xA1D1937E,
            0x38D8C2C4,
            0x4FDFF252,
            0xD1BB67F1,
            0xA6BC5767,
            0x3FB506DD,
            0x48B2364B,
            0xD80D2BDA,
            0xAF0A1B4C,
            0x36034AF6,
            0x41047A60,
            0xDF60EFC3,
            0xA867DF55,
            0x316E8EEF,
            0x4669BE79,
            0xCB61B38C,
            0xBC66831A,
            0x256FD2A0,
            0x5268E236,
            0xCC0C7795,
            0xBB0B4703,
            0x220216B9,
            0x5505262F,
            0xC5BA3BBE,
            0xB2BD0B28,
            0x2BB45A92,
            0x5CB36A04,
            0xC2D7FFA7,
            0xB5D0CF31,
            0x2CD99E8B,
            0x5BDEAE1D,
            0x9B64C2B0,
            0xEC63F226,
            0x756AA39C,
            0x026D930A,
            0x9C0906A9,
            0xEB0E363F,
            0x72076785,
            0x05005713,
            0x95BF4A82,
            0xE2B87A14,
            0x7BB12BAE,
            0x0CB61B38,
            0x92D28E9B,
            0xE5D5BE0D,
            0x7CDCEFB7,
            0x0BDBDF21,
            0x86D3D2D4,
            0xF1D4E242,
            0x68DDB3F8,
            0x1FDA836E,
            0x81BE16CD,
            0xF6B9265B,
            0x6FB077E1,
            0x18B74777,
            0x88085AE6,
            0xFF0F6A70,
            0x66063BCA,
            0x11010B5C,
            0x8F659EFF,
            0xF862AE69,
            0x616BFFD3,
            0x166CCF45,
            0xA00AE278,
            0xD70DD2EE,
            0x4E048354,
            0x3903B3C2,
            0xA7672661,
            0xD06016F7,
            0x4969474D,
            0x3E6E77DB,
            0xAED16A4A,
            0xD9D65ADC,
            0x40DF0B66,
            0x37D83BF0,
            0xA9BCAE53,
            0xDEBB9EC5,
            0x47B2CF7F,
            0x30B5FFE9,
            0xBDBDF21C,
            0xCABAC28A,
            0x53B39330,
            0x24B4A3A6,
            0xBAD03605,
            0xCDD70693,
            0x54DE5729,
            0x23D967BF,
            0xB3667A2E,
            0xC4614AB8,
            0x5D681B02,
            0x2A6F2B94,
            0xB40BBE37,
            0xC30C8EA1,
            0x5A05DF1B,
            0x2D02EF8D
        ];
        var crc = -1, y = 0, n = a.length, i;
        for(i = from; i < to; i++){
            y = (crc ^ a[i]) & 0xFF;
            crc = crc >>> 8 ^ table[y];
        }
        return crc ^ -1;
    }
    var h = img[0].length, w = img[0][0].length, s1, s2, next, k, length, a, b, i, j, adler32, crc32;
    var stream = [
        137,
        80,
        78,
        71,
        13,
        10,
        26,
        10,
        0,
        0,
        0,
        13,
        73,
        72,
        68,
        82,
        w >> 24 & 255,
        w >> 16 & 255,
        w >> 8 & 255,
        w & 255,
        h >> 24 & 255,
        h >> 16 & 255,
        h >> 8 & 255,
        h & 255,
        8,
        2,
        0,
        0,
        0,
        -1,
        -2,
        -3,
        -4,
        -5,
        -6,
        -7,
        -8,
        73,
        68,
        65,
        84,
        // RFC 1950 header starts here
        8,
        29 // 42: RFC1950 FLG
    ];
    crc32 = crc32Array(stream, 12, 29);
    stream[29] = crc32 >> 24 & 255;
    stream[30] = crc32 >> 16 & 255;
    stream[31] = crc32 >> 8 & 255;
    stream[32] = crc32 & 255;
    s1 = 1;
    s2 = 0;
    for(i = 0; i < h; i++){
        if (i < h - 1) {
            stream.push(0);
        } else {
            stream.push(1);
        }
        a = 3 * w + 1 + (i === 0) & 255;
        b = 3 * w + 1 + (i === 0) >> 8 & 255;
        stream.push(a);
        stream.push(b);
        stream.push(~a & 255);
        stream.push(~b & 255);
        if (i === 0) stream.push(0);
        for(j = 0; j < w; j++){
            for(k = 0; k < 3; k++){
                a = img[k][i][j];
                if (a > 255) a = 255;
                else if (a < 0) a = 0;
                else a = Math.round(a);
                s1 = (s1 + a) % 65521;
                s2 = (s2 + s1) % 65521;
                stream.push(a);
            }
        }
        stream.push(0);
    }
    adler32 = (s2 << 16) + s1;
    stream.push(adler32 >> 24 & 255);
    stream.push(adler32 >> 16 & 255);
    stream.push(adler32 >> 8 & 255);
    stream.push(adler32 & 255);
    length = stream.length - 41;
    stream[33] = length >> 24 & 255;
    stream[34] = length >> 16 & 255;
    stream[35] = length >> 8 & 255;
    stream[36] = length & 255;
    crc32 = crc32Array(stream, 37);
    stream.push(crc32 >> 24 & 255);
    stream.push(crc32 >> 16 & 255);
    stream.push(crc32 >> 8 & 255);
    stream.push(crc32 & 255);
    stream.push(0);
    stream.push(0);
    stream.push(0);
    stream.push(0);
    //    a = stream.length;
    stream.push(73); // I
    stream.push(69); // E
    stream.push(78); // N
    stream.push(68); // D
    stream.push(174); // CRC1
    stream.push(66); // CRC2
    stream.push(96); // CRC3
    stream.push(130); // CRC4
    return 'data:image/png;base64,' + base64(stream);
};
// 2. Linear algebra with Arrays.
numeric._dim = function _dim(x) {
    var ret = [];
    while(typeof x === "object"){
        ret.push(x.length);
        x = x[0];
    }
    return ret;
};
numeric.dim = function dim(x) {
    var y, z;
    if (typeof x === "object") {
        y = x[0];
        if (typeof y === "object") {
            z = y[0];
            if (typeof z === "object") {
                return numeric._dim(x);
            }
            return [
                x.length,
                y.length
            ];
        }
        return [
            x.length
        ];
    }
    return [];
};
numeric.mapreduce = function mapreduce(body, init) {
    return Function('x', 'accum', '_s', '_k', 'if(typeof accum === "undefined") accum = ' + init + ';\n' + 'if(typeof x === "number") { var xi = x; ' + body + '; return accum; }\n' + 'if(typeof _s === "undefined") _s = numeric.dim(x);\n' + 'if(typeof _k === "undefined") _k = 0;\n' + 'var _n = _s[_k];\n' + 'var i,xi;\n' + 'if(_k < _s.length-1) {\n' + '    for(i=_n-1;i>=0;i--) {\n' + '        accum = arguments.callee(x[i],accum,_s,_k+1);\n' + '    }' + '    return accum;\n' + '}\n' + 'for(i=_n-1;i>=1;i-=2) { \n' + '    xi = x[i];\n' + '    ' + body + ';\n' + '    xi = x[i-1];\n' + '    ' + body + ';\n' + '}\n' + 'if(i === 0) {\n' + '    xi = x[i];\n' + '    ' + body + '\n' + '}\n' + 'return accum;');
};
numeric.mapreduce2 = function mapreduce2(body, setup) {
    return Function('x', 'var n = x.length;\n' + 'var i,xi;\n' + setup + ';\n' + 'for(i=n-1;i!==-1;--i) { \n' + '    xi = x[i];\n' + '    ' + body + ';\n' + '}\n' + 'return accum;');
};
numeric.same = function same(x, y) {
    var i, n;
    if (!(x instanceof Array) || !(y instanceof Array)) {
        return false;
    }
    n = x.length;
    if (n !== y.length) {
        return false;
    }
    for(i = 0; i < n; i++){
        if (x[i] === y[i]) {
            continue;
        }
        if (typeof x[i] === "object") {
            if (!same(x[i], y[i])) return false;
        } else {
            return false;
        }
    }
    return true;
};
numeric.rep = function rep(s, v, k) {
    if (typeof k === "undefined") {
        k = 0;
    }
    var n = s[k], ret = Array(n), i;
    if (k === s.length - 1) {
        for(i = n - 2; i >= 0; i -= 2){
            ret[i + 1] = v;
            ret[i] = v;
        }
        if (i === -1) {
            ret[0] = v;
        }
        return ret;
    }
    for(i = n - 1; i >= 0; i--){
        ret[i] = numeric.rep(s, v, k + 1);
    }
    return ret;
};
numeric.dotMMsmall = function dotMMsmall(x, y) {
    var i, j, k, p, q, r, ret, foo, bar, woo, i0, k0, p0, r0;
    p = x.length;
    q = y.length;
    r = y[0].length;
    ret = Array(p);
    for(i = p - 1; i >= 0; i--){
        foo = Array(r);
        bar = x[i];
        for(k = r - 1; k >= 0; k--){
            woo = bar[q - 1] * y[q - 1][k];
            for(j = q - 2; j >= 1; j -= 2){
                i0 = j - 1;
                woo += bar[j] * y[j][k] + bar[i0] * y[i0][k];
            }
            if (j === 0) {
                woo += bar[0] * y[0][k];
            }
            foo[k] = woo;
        }
        ret[i] = foo;
    }
    return ret;
};
numeric._getCol = function _getCol(A, j, x) {
    var n = A.length, i;
    for(i = n - 1; i > 0; --i){
        x[i] = A[i][j];
        --i;
        x[i] = A[i][j];
    }
    if (i === 0) x[0] = A[0][j];
};
numeric.dotMMbig = function dotMMbig(x, y) {
    var gc = numeric._getCol, p = y.length, v = Array(p);
    var m = x.length, n = y[0].length, A = new Array(m), xj;
    var VV = numeric.dotVV;
    var i, j, k, z;
    --p;
    --m;
    for(i = m; i !== -1; --i)A[i] = Array(n);
    --n;
    for(i = n; i !== -1; --i){
        gc(y, i, v);
        for(j = m; j !== -1; --j){
            z = 0;
            xj = x[j];
            A[j][i] = VV(xj, v);
        }
    }
    return A;
};
numeric.dotMV = function dotMV(x, y) {
    var p = x.length, q = y.length, i;
    var ret = Array(p), dotVV = numeric.dotVV;
    for(i = p - 1; i >= 0; i--){
        ret[i] = dotVV(x[i], y);
    }
    return ret;
};
numeric.dotVM = function dotVM(x, y) {
    var i, j, k, p, q, r, ret, foo, bar, woo, i0, k0, p0, r0, s1, s2, s3, baz, accum;
    p = x.length;
    q = y[0].length;
    ret = Array(q);
    for(k = q - 1; k >= 0; k--){
        woo = x[p - 1] * y[p - 1][k];
        for(j = p - 2; j >= 1; j -= 2){
            i0 = j - 1;
            woo += x[j] * y[j][k] + x[i0] * y[i0][k];
        }
        if (j === 0) {
            woo += x[0] * y[0][k];
        }
        ret[k] = woo;
    }
    return ret;
};
numeric.dotVV = function dotVV(x, y) {
    var i, n = x.length, i1, ret = x[n - 1] * y[n - 1];
    for(i = n - 2; i >= 1; i -= 2){
        i1 = i - 1;
        ret += x[i] * y[i] + x[i1] * y[i1];
    }
    if (i === 0) {
        ret += x[0] * y[0];
    }
    return ret;
};
numeric.dot = function dot(x, y) {
    var d = numeric.dim;
    switch(d(x).length * 1000 + d(y).length){
        case 2002:
            if (y.length < 10) return numeric.dotMMsmall(x, y);
            else return numeric.dotMMbig(x, y);
        case 2001:
            return numeric.dotMV(x, y);
        case 1002:
            return numeric.dotVM(x, y);
        case 1001:
            return numeric.dotVV(x, y);
        case 1000:
            return numeric.mulVS(x, y);
        case 1:
            return numeric.mulSV(x, y);
        case 0:
            return x * y;
        default:
            throw new Error('numeric.dot only works on vectors and matrices');
    }
};
numeric.diag = function diag(d) {
    var i, i1, j, n = d.length, A = Array(n), Ai;
    for(i = n - 1; i >= 0; i--){
        Ai = Array(n);
        i1 = i + 2;
        for(j = n - 1; j >= i1; j -= 2){
            Ai[j] = 0;
            Ai[j - 1] = 0;
        }
        if (j > i) {
            Ai[j] = 0;
        }
        Ai[i] = d[i];
        for(j = i - 1; j >= 1; j -= 2){
            Ai[j] = 0;
            Ai[j - 1] = 0;
        }
        if (j === 0) {
            Ai[0] = 0;
        }
        A[i] = Ai;
    }
    return A;
};
numeric.getDiag = function(A) {
    var n = Math.min(A.length, A[0].length), i, ret = Array(n);
    for(i = n - 1; i >= 1; --i){
        ret[i] = A[i][i];
        --i;
        ret[i] = A[i][i];
    }
    if (i === 0) {
        ret[0] = A[0][0];
    }
    return ret;
};
numeric.identity = function identity(n) {
    return numeric.diag(numeric.rep([
        n
    ], 1));
};
numeric.pointwise = function pointwise(params, body, setup) {
    if (typeof setup === "undefined") {
        setup = "";
    }
    var fun = [];
    var k;
    var avec = /\[i\]$/, p, thevec = '';
    var haveret = false;
    for(k = 0; k < params.length; k++){
        if (avec.test(params[k])) {
            p = params[k].substring(0, params[k].length - 3);
            thevec = p;
        } else {
            p = params[k];
        }
        if (p === 'ret') haveret = true;
        fun.push(p);
    }
    fun[params.length] = '_s';
    fun[params.length + 1] = '_k';
    fun[params.length + 2] = 'if(typeof _s === "undefined") _s = numeric.dim(' + thevec + ');\n' + 'if(typeof _k === "undefined") _k = 0;\n' + 'var _n = _s[_k];\n' + 'var i' + (haveret ? '' : ', ret = Array(_n)') + ';\n' + 'if(_k < _s.length-1) {\n' + '    for(i=_n-1;i>=0;i--) ret[i] = arguments.callee(' + params.join(',') + ',_s,_k+1);\n' + '    return ret;\n' + '}\n' + setup + '\n' + 'for(i=_n-1;i!==-1;--i) {\n' + '    ' + body + '\n' + '}\n' + 'return ret;';
    return Function.apply(null, fun);
};
numeric.pointwise2 = function pointwise2(params, body, setup) {
    if (typeof setup === "undefined") {
        setup = "";
    }
    var fun = [];
    var k;
    var avec = /\[i\]$/, p, thevec = '';
    var haveret = false;
    for(k = 0; k < params.length; k++){
        if (avec.test(params[k])) {
            p = params[k].substring(0, params[k].length - 3);
            thevec = p;
        } else {
            p = params[k];
        }
        if (p === 'ret') haveret = true;
        fun.push(p);
    }
    fun[params.length] = 'var _n = ' + thevec + '.length;\n' + 'var i' + (haveret ? '' : ', ret = Array(_n)') + ';\n' + setup + '\n' + 'for(i=_n-1;i!==-1;--i) {\n' + body + '\n' + '}\n' + 'return ret;';
    return Function.apply(null, fun);
};
numeric._biforeach = function _biforeach(x, y, s, k, f) {
    if (k === s.length - 1) {
        f(x, y);
        return;
    }
    var i, n = s[k];
    for(i = n - 1; i >= 0; i--){
        _biforeach(typeof x === "object" ? x[i] : x, typeof y === "object" ? y[i] : y, s, k + 1, f);
    }
};
numeric._biforeach2 = function _biforeach2(x, y, s, k, f) {
    if (k === s.length - 1) {
        return f(x, y);
    }
    var i, n = s[k], ret = Array(n);
    for(i = n - 1; i >= 0; --i){
        ret[i] = _biforeach2(typeof x === "object" ? x[i] : x, typeof y === "object" ? y[i] : y, s, k + 1, f);
    }
    return ret;
};
numeric._foreach = function _foreach(x, s, k, f) {
    if (k === s.length - 1) {
        f(x);
        return;
    }
    var i, n = s[k];
    for(i = n - 1; i >= 0; i--){
        _foreach(x[i], s, k + 1, f);
    }
};
numeric._foreach2 = function _foreach2(x, s, k, f) {
    if (k === s.length - 1) {
        return f(x);
    }
    var i, n = s[k], ret = Array(n);
    for(i = n - 1; i >= 0; i--){
        ret[i] = _foreach2(x[i], s, k + 1, f);
    }
    return ret;
};
/*numeric.anyV = numeric.mapreduce('if(xi) return true;','false');
 numeric.allV = numeric.mapreduce('if(!xi) return false;','true');
 numeric.any = function(x) { if(typeof x.length === "undefined") return x; return numeric.anyV(x); }
 numeric.all = function(x) { if(typeof x.length === "undefined") return x; return numeric.allV(x); }*/ numeric.ops2 = {
    add: '+',
    sub: '-',
    mul: '*',
    div: '/',
    mod: '%',
    and: '&&',
    or: '||',
    eq: '===',
    neq: '!==',
    lt: '<',
    gt: '>',
    leq: '<=',
    geq: '>=',
    band: '&',
    bor: '|',
    bxor: '^',
    lshift: '<<',
    rshift: '>>',
    rrshift: '>>>'
};
numeric.opseq = {
    addeq: '+=',
    subeq: '-=',
    muleq: '*=',
    diveq: '/=',
    modeq: '%=',
    lshifteq: '<<=',
    rshifteq: '>>=',
    rrshifteq: '>>>=',
    bandeq: '&=',
    boreq: '|=',
    bxoreq: '^='
};
numeric.mathfuns = [
    'abs',
    'acos',
    'asin',
    'atan',
    'ceil',
    'cos',
    'exp',
    'floor',
    'log',
    'round',
    'sin',
    'sqrt',
    'tan',
    'isNaN',
    'isFinite'
];
numeric.mathfuns2 = [
    'atan2',
    'pow',
    'max',
    'min'
];
numeric.ops1 = {
    neg: '-',
    not: '!',
    bnot: '~',
    clone: ''
};
numeric.mapreducers = {
    any: [
        'if(xi) return true;',
        'var accum = false;'
    ],
    all: [
        'if(!xi) return false;',
        'var accum = true;'
    ],
    sum: [
        'accum += xi;',
        'var accum = 0;'
    ],
    prod: [
        'accum *= xi;',
        'var accum = 1;'
    ],
    norm2Squared: [
        'accum += xi*xi;',
        'var accum = 0;'
    ],
    norminf: [
        'accum = max(accum,abs(xi));',
        'var accum = 0, max = Math.max, abs = Math.abs;'
    ],
    norm1: [
        'accum += abs(xi)',
        'var accum = 0, abs = Math.abs;'
    ],
    sup: [
        'accum = max(accum,xi);',
        'var accum = -Infinity, max = Math.max;'
    ],
    inf: [
        'accum = min(accum,xi);',
        'var accum = Infinity, min = Math.min;'
    ]
};
(function() {
    var i, o;
    for(i = 0; i < numeric.mathfuns2.length; ++i){
        o = numeric.mathfuns2[i];
        numeric.ops2[o] = o;
    }
    for(i in numeric.ops2){
        if (numeric.ops2.hasOwnProperty(i)) {
            o = numeric.ops2[i];
            var code, codeeq, setup = '';
            if (numeric.myIndexOf.call(numeric.mathfuns2, i) !== -1) {
                setup = 'var ' + o + ' = Math.' + o + ';\n';
                code = function(r, x, y) {
                    return r + ' = ' + o + '(' + x + ',' + y + ')';
                };
                codeeq = function(x, y) {
                    return x + ' = ' + o + '(' + x + ',' + y + ')';
                };
            } else {
                code = function(r, x, y) {
                    return r + ' = ' + x + ' ' + o + ' ' + y;
                };
                if (numeric.opseq.hasOwnProperty(i + 'eq')) {
                    codeeq = function(x, y) {
                        return x + ' ' + o + '= ' + y;
                    };
                } else {
                    codeeq = function(x, y) {
                        return x + ' = ' + x + ' ' + o + ' ' + y;
                    };
                }
            }
            numeric[i + 'VV'] = numeric.pointwise2([
                'x[i]',
                'y[i]'
            ], code('ret[i]', 'x[i]', 'y[i]'), setup);
            numeric[i + 'SV'] = numeric.pointwise2([
                'x',
                'y[i]'
            ], code('ret[i]', 'x', 'y[i]'), setup);
            numeric[i + 'VS'] = numeric.pointwise2([
                'x[i]',
                'y'
            ], code('ret[i]', 'x[i]', 'y'), setup);
            numeric[i] = Function('var n = arguments.length, i, x = arguments[0], y;\n' + 'var VV = numeric.' + i + 'VV, VS = numeric.' + i + 'VS, SV = numeric.' + i + 'SV;\n' + 'var dim = numeric.dim;\n' + 'for(i=1;i!==n;++i) { \n' + '  y = arguments[i];\n' + '  if(typeof x === "object") {\n' + '      if(typeof y === "object") x = numeric._biforeach2(x,y,dim(x),0,VV);\n' + '      else x = numeric._biforeach2(x,y,dim(x),0,VS);\n' + '  } else if(typeof y === "object") x = numeric._biforeach2(x,y,dim(y),0,SV);\n' + '  else ' + codeeq('x', 'y') + '\n' + '}\nreturn x;\n');
            numeric[o] = numeric[i];
            numeric[i + 'eqV'] = numeric.pointwise2([
                'ret[i]',
                'x[i]'
            ], codeeq('ret[i]', 'x[i]'), setup);
            numeric[i + 'eqS'] = numeric.pointwise2([
                'ret[i]',
                'x'
            ], codeeq('ret[i]', 'x'), setup);
            numeric[i + 'eq'] = Function('var n = arguments.length, i, x = arguments[0], y;\n' + 'var V = numeric.' + i + 'eqV, S = numeric.' + i + 'eqS\n' + 'var s = numeric.dim(x);\n' + 'for(i=1;i!==n;++i) { \n' + '  y = arguments[i];\n' + '  if(typeof y === "object") numeric._biforeach(x,y,s,0,V);\n' + '  else numeric._biforeach(x,y,s,0,S);\n' + '}\nreturn x;\n');
        }
    }
    for(i = 0; i < numeric.mathfuns2.length; ++i){
        o = numeric.mathfuns2[i];
        delete numeric.ops2[o];
    }
    for(i = 0; i < numeric.mathfuns.length; ++i){
        o = numeric.mathfuns[i];
        numeric.ops1[o] = o;
    }
    for(i in numeric.ops1){
        if (numeric.ops1.hasOwnProperty(i)) {
            setup = '';
            o = numeric.ops1[i];
            if (numeric.myIndexOf.call(numeric.mathfuns, i) !== -1) {
                if (Math.hasOwnProperty(o)) setup = 'var ' + o + ' = Math.' + o + ';\n';
            }
            numeric[i + 'eqV'] = numeric.pointwise2([
                'ret[i]'
            ], 'ret[i] = ' + o + '(ret[i]);', setup);
            numeric[i + 'eq'] = Function('x', 'if(typeof x !== "object") return ' + o + 'x\n' + 'var i;\n' + 'var V = numeric.' + i + 'eqV;\n' + 'var s = numeric.dim(x);\n' + 'numeric._foreach(x,s,0,V);\n' + 'return x;\n');
            numeric[i + 'V'] = numeric.pointwise2([
                'x[i]'
            ], 'ret[i] = ' + o + '(x[i]);', setup);
            numeric[i] = Function('x', 'if(typeof x !== "object") return ' + o + '(x)\n' + 'var i;\n' + 'var V = numeric.' + i + 'V;\n' + 'var s = numeric.dim(x);\n' + 'return numeric._foreach2(x,s,0,V);\n');
        }
    }
    for(i = 0; i < numeric.mathfuns.length; ++i){
        o = numeric.mathfuns[i];
        delete numeric.ops1[o];
    }
    for(i in numeric.mapreducers){
        if (numeric.mapreducers.hasOwnProperty(i)) {
            o = numeric.mapreducers[i];
            numeric[i + 'V'] = numeric.mapreduce2(o[0], o[1]);
            numeric[i] = Function('x', 's', 'k', o[1] + 'if(typeof x !== "object") {' + '    xi = x;\n' + o[0] + ';\n' + '    return accum;\n' + '}' + 'if(typeof s === "undefined") s = numeric.dim(x);\n' + 'if(typeof k === "undefined") k = 0;\n' + 'if(k === s.length-1) return numeric.' + i + 'V(x);\n' + 'var xi;\n' + 'var n = x.length, i;\n' + 'for(i=n-1;i!==-1;--i) {\n' + '   xi = arguments.callee(x[i]);\n' + o[0] + ';\n' + '}\n' + 'return accum;\n');
        }
    }
})();
numeric.truncVV = numeric.pointwise([
    'x[i]',
    'y[i]'
], 'ret[i] = round(x[i]/y[i])*y[i];', 'var round = Math.round;');
numeric.truncVS = numeric.pointwise([
    'x[i]',
    'y'
], 'ret[i] = round(x[i]/y)*y;', 'var round = Math.round;');
numeric.truncSV = numeric.pointwise([
    'x',
    'y[i]'
], 'ret[i] = round(x/y[i])*y[i];', 'var round = Math.round;');
numeric.trunc = function trunc(x, y) {
    if (typeof x === "object") {
        if (typeof y === "object") return numeric.truncVV(x, y);
        return numeric.truncVS(x, y);
    }
    if (typeof y === "object") return numeric.truncSV(x, y);
    return Math.round(x / y) * y;
};
numeric.inv = function inv(x) {
    var s = numeric.dim(x), abs = Math.abs, m = s[0], n = s[1];
    var A = numeric.clone(x), Ai, Aj;
    var I = numeric.identity(m), Ii, Ij;
    var i, j, k, x;
    for(j = 0; j < n; ++j){
        var i0 = -1;
        var v0 = -1;
        for(i = j; i !== m; ++i){
            k = abs(A[i][j]);
            if (k > v0) {
                i0 = i;
                v0 = k;
            }
        }
        Aj = A[i0];
        A[i0] = A[j];
        A[j] = Aj;
        Ij = I[i0];
        I[i0] = I[j];
        I[j] = Ij;
        x = Aj[j];
        for(k = j; k !== n; ++k)Aj[k] /= x;
        for(k = n - 1; k !== -1; --k)Ij[k] /= x;
        for(i = m - 1; i !== -1; --i){
            if (i !== j) {
                Ai = A[i];
                Ii = I[i];
                x = Ai[j];
                for(k = j + 1; k !== n; ++k)Ai[k] -= Aj[k] * x;
                for(k = n - 1; k > 0; --k){
                    Ii[k] -= Ij[k] * x;
                    --k;
                    Ii[k] -= Ij[k] * x;
                }
                if (k === 0) Ii[0] -= Ij[0] * x;
            }
        }
    }
    return I;
};
numeric.det = function det(x) {
    var s = numeric.dim(x);
    if (s.length !== 2 || s[0] !== s[1]) {
        throw new Error('numeric: det() only works on square matrices');
    }
    var n = s[0], ret = 1, i, j, k, A = numeric.clone(x), Aj, Ai, alpha, temp, k1, k2, k3;
    for(j = 0; j < n - 1; j++){
        k = j;
        for(i = j + 1; i < n; i++){
            if (Math.abs(A[i][j]) > Math.abs(A[k][j])) {
                k = i;
            }
        }
        if (k !== j) {
            temp = A[k];
            A[k] = A[j];
            A[j] = temp;
            ret *= -1;
        }
        Aj = A[j];
        for(i = j + 1; i < n; i++){
            Ai = A[i];
            alpha = Ai[j] / Aj[j];
            for(k = j + 1; k < n - 1; k += 2){
                k1 = k + 1;
                Ai[k] -= Aj[k] * alpha;
                Ai[k1] -= Aj[k1] * alpha;
            }
            if (k !== n) {
                Ai[k] -= Aj[k] * alpha;
            }
        }
        if (Aj[j] === 0) {
            return 0;
        }
        ret *= Aj[j];
    }
    return ret * A[j][j];
};
numeric.transpose = function transpose(x) {
    var i, j, m = x.length, n = x[0].length, ret = Array(n), A0, A1, Bj;
    for(j = 0; j < n; j++)ret[j] = Array(m);
    for(i = m - 1; i >= 1; i -= 2){
        A1 = x[i];
        A0 = x[i - 1];
        for(j = n - 1; j >= 1; --j){
            Bj = ret[j];
            Bj[i] = A1[j];
            Bj[i - 1] = A0[j];
            --j;
            Bj = ret[j];
            Bj[i] = A1[j];
            Bj[i - 1] = A0[j];
        }
        if (j === 0) {
            Bj = ret[0];
            Bj[i] = A1[0];
            Bj[i - 1] = A0[0];
        }
    }
    if (i === 0) {
        A0 = x[0];
        for(j = n - 1; j >= 1; --j){
            ret[j][0] = A0[j];
            --j;
            ret[j][0] = A0[j];
        }
        if (j === 0) {
            ret[0][0] = A0[0];
        }
    }
    return ret;
};
numeric.negtranspose = function negtranspose(x) {
    var i, j, m = x.length, n = x[0].length, ret = Array(n), A0, A1, Bj;
    for(j = 0; j < n; j++)ret[j] = Array(m);
    for(i = m - 1; i >= 1; i -= 2){
        A1 = x[i];
        A0 = x[i - 1];
        for(j = n - 1; j >= 1; --j){
            Bj = ret[j];
            Bj[i] = -A1[j];
            Bj[i - 1] = -A0[j];
            --j;
            Bj = ret[j];
            Bj[i] = -A1[j];
            Bj[i - 1] = -A0[j];
        }
        if (j === 0) {
            Bj = ret[0];
            Bj[i] = -A1[0];
            Bj[i - 1] = -A0[0];
        }
    }
    if (i === 0) {
        A0 = x[0];
        for(j = n - 1; j >= 1; --j){
            ret[j][0] = -A0[j];
            --j;
            ret[j][0] = -A0[j];
        }
        if (j === 0) {
            ret[0][0] = -A0[0];
        }
    }
    return ret;
};
numeric._random = function _random(s, k) {
    var i, n = s[k], ret = Array(n), rnd;
    if (k === s.length - 1) {
        rnd = Math.random;
        for(i = n - 1; i >= 1; i -= 2){
            ret[i] = rnd();
            ret[i - 1] = rnd();
        }
        if (i === 0) {
            ret[0] = rnd();
        }
        return ret;
    }
    for(i = n - 1; i >= 0; i--)ret[i] = _random(s, k + 1);
    return ret;
};
numeric.random = function random(s) {
    return numeric._random(s, 0);
};
numeric.norm2 = function norm2(x) {
    return Math.sqrt(numeric.norm2Squared(x));
};
numeric.linspace = function linspace(a, b, n) {
    if (typeof n === "undefined") n = Math.max(Math.round(b - a) + 1, 1);
    if (n < 2) {
        return n === 1 ? [
            a
        ] : [];
    }
    var i, ret = Array(n);
    n--;
    for(i = n; i >= 0; i--){
        ret[i] = (i * b + (n - i) * a) / n;
    }
    return ret;
};
numeric.getBlock = function getBlock(x, from, to) {
    var s = numeric.dim(x);
    function foo(x, k) {
        var i, a = from[k], n = to[k] - a, ret = Array(n);
        if (k === s.length - 1) {
            for(i = n; i >= 0; i--){
                ret[i] = x[i + a];
            }
            return ret;
        }
        for(i = n; i >= 0; i--){
            ret[i] = foo(x[i + a], k + 1);
        }
        return ret;
    }
    return foo(x, 0);
};
numeric.setBlock = function setBlock(x, from, to, B) {
    var s = numeric.dim(x);
    function foo(x, y, k) {
        var i, a = from[k], n = to[k] - a;
        if (k === s.length - 1) {
            for(i = n; i >= 0; i--){
                x[i + a] = y[i];
            }
        }
        for(i = n; i >= 0; i--){
            foo(x[i + a], y[i], k + 1);
        }
    }
    foo(x, B, 0);
    return x;
};
numeric.getRange = function getRange(A, I, J) {
    var m = I.length, n = J.length;
    var i, j;
    var B = Array(m), Bi, AI;
    for(i = m - 1; i !== -1; --i){
        B[i] = Array(n);
        Bi = B[i];
        AI = A[I[i]];
        for(j = n - 1; j !== -1; --j)Bi[j] = AI[J[j]];
    }
    return B;
};
numeric.blockMatrix = function blockMatrix(X) {
    var s = numeric.dim(X);
    if (s.length < 4) return numeric.blockMatrix([
        X
    ]);
    var m = s[0], n = s[1], M, N, i, j, Xij;
    M = 0;
    N = 0;
    for(i = 0; i < m; ++i)M += X[i][0].length;
    for(j = 0; j < n; ++j)N += X[0][j][0].length;
    var Z = Array(M);
    for(i = 0; i < M; ++i)Z[i] = Array(N);
    var I = 0, J, ZI, k, l, Xijk;
    for(i = 0; i < m; ++i){
        J = N;
        for(j = n - 1; j !== -1; --j){
            Xij = X[i][j];
            J -= Xij[0].length;
            for(k = Xij.length - 1; k !== -1; --k){
                Xijk = Xij[k];
                ZI = Z[I + k];
                for(l = Xijk.length - 1; l !== -1; --l)ZI[J + l] = Xijk[l];
            }
        }
        I += X[i][0].length;
    }
    return Z;
};
numeric.tensor = function tensor(x, y) {
    if (typeof x === "number" || typeof y === "number") return numeric.mul(x, y);
    var s1 = numeric.dim(x), s2 = numeric.dim(y);
    if (s1.length !== 1 || s2.length !== 1) {
        throw new Error('numeric: tensor product is only defined for vectors');
    }
    var m = s1[0], n = s2[0], A = Array(m), Ai, i, j, xi;
    for(i = m - 1; i >= 0; i--){
        Ai = Array(n);
        xi = x[i];
        for(j = n - 1; j >= 3; --j){
            Ai[j] = xi * y[j];
            --j;
            Ai[j] = xi * y[j];
            --j;
            Ai[j] = xi * y[j];
            --j;
            Ai[j] = xi * y[j];
        }
        while(j >= 0){
            Ai[j] = xi * y[j];
            --j;
        }
        A[i] = Ai;
    }
    return A;
};
// 3. The Tensor type T
numeric.T = function T1(x, y) {
    this.x = x;
    this.y = y;
};
numeric.t = function t(x, y) {
    return new numeric.T(x, y);
};
numeric.Tbinop = function Tbinop(rr, rc, cr, cc, setup) {
    var io = numeric.indexOf;
    if (typeof setup !== "string") {
        var k;
        setup = '';
        for(k in numeric){
            if (numeric.hasOwnProperty(k) && (rr.indexOf(k) >= 0 || rc.indexOf(k) >= 0 || cr.indexOf(k) >= 0 || cc.indexOf(k) >= 0) && k.length > 1) {
                setup += 'var ' + k + ' = numeric.' + k + ';\n';
            }
        }
    }
    return Function([
        'y'
    ], 'var x = this;\n' + 'if(!(y instanceof numeric.T)) { y = new numeric.T(y); }\n' + setup + '\n' + 'if(x.y) {' + '  if(y.y) {' + '    return new numeric.T(' + cc + ');\n' + '  }\n' + '  return new numeric.T(' + cr + ');\n' + '}\n' + 'if(y.y) {\n' + '  return new numeric.T(' + rc + ');\n' + '}\n' + 'return new numeric.T(' + rr + ');\n');
};
numeric.T.prototype.add = numeric.Tbinop('add(x.x,y.x)', 'add(x.x,y.x),y.y', 'add(x.x,y.x),x.y', 'add(x.x,y.x),add(x.y,y.y)');
numeric.T.prototype.sub = numeric.Tbinop('sub(x.x,y.x)', 'sub(x.x,y.x),neg(y.y)', 'sub(x.x,y.x),x.y', 'sub(x.x,y.x),sub(x.y,y.y)');
numeric.T.prototype.mul = numeric.Tbinop('mul(x.x,y.x)', 'mul(x.x,y.x),mul(x.x,y.y)', 'mul(x.x,y.x),mul(x.y,y.x)', 'sub(mul(x.x,y.x),mul(x.y,y.y)),add(mul(x.x,y.y),mul(x.y,y.x))');
numeric.T.prototype.reciprocal = function reciprocal() {
    var mul = numeric.mul, div = numeric.div;
    if (this.y) {
        var d = numeric.add(mul(this.x, this.x), mul(this.y, this.y));
        return new numeric.T(div(this.x, d), div(numeric.neg(this.y), d));
    }
    return new T(div(1, this.x));
};
numeric.T.prototype.div = function div(y) {
    if (!(y instanceof numeric.T)) y = new numeric.T(y);
    if (y.y) {
        return this.mul(y.reciprocal());
    }
    var div = numeric.div;
    if (this.y) {
        return new numeric.T(div(this.x, y.x), div(this.y, y.x));
    }
    return new numeric.T(div(this.x, y.x));
};
numeric.T.prototype.dot = numeric.Tbinop('dot(x.x,y.x)', 'dot(x.x,y.x),dot(x.x,y.y)', 'dot(x.x,y.x),dot(x.y,y.x)', 'sub(dot(x.x,y.x),dot(x.y,y.y)),add(dot(x.x,y.y),dot(x.y,y.x))');
numeric.T.prototype.transpose = function transpose() {
    var t = numeric.transpose, x = this.x, y = this.y;
    if (y) {
        return new numeric.T(t(x), t(y));
    }
    return new numeric.T(t(x));
};
numeric.T.prototype.transjugate = function transjugate() {
    var t = numeric.transpose, x = this.x, y = this.y;
    if (y) {
        return new numeric.T(t(x), numeric.negtranspose(y));
    }
    return new numeric.T(t(x));
};
numeric.Tunop = function Tunop(r, c, s) {
    if (typeof s !== "string") {
        s = '';
    }
    return Function('var x = this;\n' + s + '\n' + 'if(x.y) {' + '  ' + c + ';\n' + '}\n' + r + ';\n');
};
numeric.T.prototype.exp = numeric.Tunop('return new numeric.T(ex)', 'return new numeric.T(mul(cos(x.y),ex),mul(sin(x.y),ex))', 'var ex = numeric.exp(x.x), cos = numeric.cos, sin = numeric.sin, mul = numeric.mul;');
numeric.T.prototype.conj = numeric.Tunop('return new numeric.T(x.x);', 'return new numeric.T(x.x,numeric.neg(x.y));');
numeric.T.prototype.neg = numeric.Tunop('return new numeric.T(neg(x.x));', 'return new numeric.T(neg(x.x),neg(x.y));', 'var neg = numeric.neg;');
numeric.T.prototype.sin = numeric.Tunop('return new numeric.T(numeric.sin(x.x))', 'return x.exp().sub(x.neg().exp()).div(new numeric.T(0,2));');
numeric.T.prototype.cos = numeric.Tunop('return new numeric.T(numeric.cos(x.x))', 'return x.exp().add(x.neg().exp()).div(2);');
numeric.T.prototype.abs = numeric.Tunop('return new numeric.T(numeric.abs(x.x));', 'return new numeric.T(numeric.sqrt(numeric.add(mul(x.x,x.x),mul(x.y,x.y))));', 'var mul = numeric.mul;');
numeric.T.prototype.log = numeric.Tunop('return new numeric.T(numeric.log(x.x));', 'var theta = new numeric.T(numeric.atan2(x.y,x.x)), r = x.abs();\n' + 'return new numeric.T(numeric.log(r.x),theta.x);');
numeric.T.prototype.norm2 = numeric.Tunop('return numeric.norm2(x.x);', 'var f = numeric.norm2Squared;\n' + 'return Math.sqrt(f(x.x)+f(x.y));');
numeric.T.prototype.inv = function inv() {
    var A = this;
    if (typeof A.y === "undefined") {
        return new numeric.T(numeric.inv(A.x));
    }
    var n = A.x.length, i, j, k;
    var Rx = numeric.identity(n), Ry = numeric.rep([
        n,
        n
    ], 0);
    var Ax = numeric.clone(A.x), Ay = numeric.clone(A.y);
    var Aix, Aiy, Ajx, Ajy, Rix, Riy, Rjx, Rjy;
    var i, j, k, d, d1, ax, ay, bx, by, temp;
    for(i = 0; i < n; i++){
        ax = Ax[i][i];
        ay = Ay[i][i];
        d = ax * ax + ay * ay;
        k = i;
        for(j = i + 1; j < n; j++){
            ax = Ax[j][i];
            ay = Ay[j][i];
            d1 = ax * ax + ay * ay;
            if (d1 > d) {
                k = j;
                d = d1;
            }
        }
        if (k !== i) {
            temp = Ax[i];
            Ax[i] = Ax[k];
            Ax[k] = temp;
            temp = Ay[i];
            Ay[i] = Ay[k];
            Ay[k] = temp;
            temp = Rx[i];
            Rx[i] = Rx[k];
            Rx[k] = temp;
            temp = Ry[i];
            Ry[i] = Ry[k];
            Ry[k] = temp;
        }
        Aix = Ax[i];
        Aiy = Ay[i];
        Rix = Rx[i];
        Riy = Ry[i];
        ax = Aix[i];
        ay = Aiy[i];
        for(j = i + 1; j < n; j++){
            bx = Aix[j];
            by = Aiy[j];
            Aix[j] = (bx * ax + by * ay) / d;
            Aiy[j] = (by * ax - bx * ay) / d;
        }
        for(j = 0; j < n; j++){
            bx = Rix[j];
            by = Riy[j];
            Rix[j] = (bx * ax + by * ay) / d;
            Riy[j] = (by * ax - bx * ay) / d;
        }
        for(j = i + 1; j < n; j++){
            Ajx = Ax[j];
            Ajy = Ay[j];
            Rjx = Rx[j];
            Rjy = Ry[j];
            ax = Ajx[i];
            ay = Ajy[i];
            for(k = i + 1; k < n; k++){
                bx = Aix[k];
                by = Aiy[k];
                Ajx[k] -= bx * ax - by * ay;
                Ajy[k] -= by * ax + bx * ay;
            }
            for(k = 0; k < n; k++){
                bx = Rix[k];
                by = Riy[k];
                Rjx[k] -= bx * ax - by * ay;
                Rjy[k] -= by * ax + bx * ay;
            }
        }
    }
    for(i = n - 1; i > 0; i--){
        Rix = Rx[i];
        Riy = Ry[i];
        for(j = i - 1; j >= 0; j--){
            Rjx = Rx[j];
            Rjy = Ry[j];
            ax = Ax[j][i];
            ay = Ay[j][i];
            for(k = n - 1; k >= 0; k--){
                bx = Rix[k];
                by = Riy[k];
                Rjx[k] -= ax * bx - ay * by;
                Rjy[k] -= ax * by + ay * bx;
            }
        }
    }
    return new numeric.T(Rx, Ry);
};
numeric.T.prototype.get = function get(i) {
    var x = this.x, y = this.y, k = 0, ik, n = i.length;
    if (y) {
        while(k < n){
            ik = i[k];
            x = x[ik];
            y = y[ik];
            k++;
        }
        return new numeric.T(x, y);
    }
    while(k < n){
        ik = i[k];
        x = x[ik];
        k++;
    }
    return new numeric.T(x);
};
numeric.T.prototype.set = function set(i, v) {
    var x = this.x, y = this.y, k = 0, ik, n = i.length, vx = v.x, vy = v.y;
    if (n === 0) {
        if (vy) {
            this.y = vy;
        } else if (y) {
            this.y = undefined;
        }
        this.x = x;
        return this;
    }
    if (vy) {
        if (y) {} else {
            y = numeric.rep(numeric.dim(x), 0);
            this.y = y;
        }
        while(k < n - 1){
            ik = i[k];
            x = x[ik];
            y = y[ik];
            k++;
        }
        ik = i[k];
        x[ik] = vx;
        y[ik] = vy;
        return this;
    }
    if (y) {
        while(k < n - 1){
            ik = i[k];
            x = x[ik];
            y = y[ik];
            k++;
        }
        ik = i[k];
        x[ik] = vx;
        if (vx instanceof Array) y[ik] = numeric.rep(numeric.dim(vx), 0);
        else y[ik] = 0;
        return this;
    }
    while(k < n - 1){
        ik = i[k];
        x = x[ik];
        k++;
    }
    ik = i[k];
    x[ik] = vx;
    return this;
};
numeric.T.prototype.getRows = function getRows(i0, i1) {
    var n = i1 - i0 + 1, j;
    var rx = Array(n), ry, x = this.x, y = this.y;
    for(j = i0; j <= i1; j++){
        rx[j - i0] = x[j];
    }
    if (y) {
        ry = Array(n);
        for(j = i0; j <= i1; j++){
            ry[j - i0] = y[j];
        }
        return new numeric.T(rx, ry);
    }
    return new numeric.T(rx);
};
numeric.T.prototype.setRows = function setRows(i0, i1, A) {
    var j;
    var rx = this.x, ry = this.y, x = A.x, y = A.y;
    for(j = i0; j <= i1; j++){
        rx[j] = x[j - i0];
    }
    if (y) {
        if (!ry) {
            ry = numeric.rep(numeric.dim(rx), 0);
            this.y = ry;
        }
        for(j = i0; j <= i1; j++){
            ry[j] = y[j - i0];
        }
    } else if (ry) {
        for(j = i0; j <= i1; j++){
            ry[j] = numeric.rep([
                x[j - i0].length
            ], 0);
        }
    }
    return this;
};
numeric.T.prototype.getRow = function getRow(k) {
    var x = this.x, y = this.y;
    if (y) {
        return new numeric.T(x[k], y[k]);
    }
    return new numeric.T(x[k]);
};
numeric.T.prototype.setRow = function setRow(i, v) {
    var rx = this.x, ry = this.y, x = v.x, y = v.y;
    rx[i] = x;
    if (y) {
        if (!ry) {
            ry = numeric.rep(numeric.dim(rx), 0);
            this.y = ry;
        }
        ry[i] = y;
    } else if (ry) {
        ry = numeric.rep([
            x.length
        ], 0);
    }
    return this;
};
numeric.T.prototype.getBlock = function getBlock(from, to) {
    var x = this.x, y = this.y, b = numeric.getBlock;
    if (y) {
        return new numeric.T(b(x, from, to), b(y, from, to));
    }
    return new numeric.T(b(x, from, to));
};
numeric.T.prototype.setBlock = function setBlock(from, to, A) {
    if (!(A instanceof numeric.T)) A = new numeric.T(A);
    var x = this.x, y = this.y, b = numeric.setBlock, Ax = A.x, Ay = A.y;
    if (Ay) {
        if (!y) {
            this.y = numeric.rep(numeric.dim(this), 0);
            y = this.y;
        }
        b(x, from, to, Ax);
        b(y, from, to, Ay);
        return this;
    }
    b(x, from, to, Ax);
    if (y) b(y, from, to, numeric.rep(numeric.dim(Ax), 0));
};
numeric.T.rep = function rep(s, v) {
    var T1 = numeric.T;
    if (!(v instanceof T1)) v = new T1(v);
    var x = v.x, y = v.y, r = numeric.rep;
    if (y) return new T1(r(s, x), r(s, y));
    return new T1(r(s, x));
};
numeric.T.diag = function diag(d) {
    if (!(d instanceof numeric.T)) d = new numeric.T(d);
    var x = d.x, y = d.y, diag = numeric.diag;
    if (y) return new numeric.T(diag(x), diag(y));
    return new numeric.T(diag(x));
};
numeric.T.eig = function eig() {
    if (this.y) {
        throw new Error('eig: not implemented for complex matrices.');
    }
    return numeric.eig(this.x);
};
numeric.T.identity = function identity(n) {
    return new numeric.T(numeric.identity(n));
};
numeric.T.prototype.getDiag = function getDiag() {
    var n = numeric;
    var x = this.x, y = this.y;
    if (y) {
        return new n.T(n.getDiag(x), n.getDiag(y));
    }
    return new n.T(n.getDiag(x));
};
// 4. Eigenvalues of real matrices
numeric.house = function house(x) {
    var v = numeric.clone(x);
    var s = x[0] >= 0 ? 1 : -1;
    var alpha = s * numeric.norm2(x);
    v[0] += alpha;
    var foo = numeric.norm2(v);
    if (foo === 0) {
        throw new Error('eig: internal error');
    }
    return numeric.div(v, foo);
};
numeric.toUpperHessenberg = function toUpperHessenberg(me) {
    var s = numeric.dim(me);
    if (s.length !== 2 || s[0] !== s[1]) {
        throw new Error('numeric: toUpperHessenberg() only works on square matrices');
    }
    var m = s[0], i, j, k, x, v, A = numeric.clone(me), B, C, Ai, Ci, Q = numeric.identity(m), Qi;
    for(j = 0; j < m - 2; j++){
        x = Array(m - j - 1);
        for(i = j + 1; i < m; i++){
            x[i - j - 1] = A[i][j];
        }
        if (numeric.norm2(x) > 0) {
            v = numeric.house(x);
            B = numeric.getBlock(A, [
                j + 1,
                j
            ], [
                m - 1,
                m - 1
            ]);
            C = numeric.tensor(v, numeric.dot(v, B));
            for(i = j + 1; i < m; i++){
                Ai = A[i];
                Ci = C[i - j - 1];
                for(k = j; k < m; k++)Ai[k] -= 2 * Ci[k - j];
            }
            B = numeric.getBlock(A, [
                0,
                j + 1
            ], [
                m - 1,
                m - 1
            ]);
            C = numeric.tensor(numeric.dot(B, v), v);
            for(i = 0; i < m; i++){
                Ai = A[i];
                Ci = C[i];
                for(k = j + 1; k < m; k++)Ai[k] -= 2 * Ci[k - j - 1];
            }
            B = Array(m - j - 1);
            for(i = j + 1; i < m; i++)B[i - j - 1] = Q[i];
            C = numeric.tensor(v, numeric.dot(v, B));
            for(i = j + 1; i < m; i++){
                Qi = Q[i];
                Ci = C[i - j - 1];
                for(k = 0; k < m; k++)Qi[k] -= 2 * Ci[k];
            }
        }
    }
    return {
        H: A,
        Q: Q
    };
};
numeric.epsilon = 2.220446049250313e-16;
numeric.QRFrancis = function(H, maxiter) {
    if (typeof maxiter === "undefined") {
        maxiter = 10000;
    }
    H = numeric.clone(H);
    var H0 = numeric.clone(H);
    var s = numeric.dim(H), m = s[0], x, v, a, b, c, d, det, tr, Hloc, Q = numeric.identity(m), Qi, Hi, B, C, Ci, i, j, k, iter;
    if (m < 3) {
        return {
            Q: Q,
            B: [
                [
                    0,
                    m - 1
                ]
            ]
        };
    }
    var epsilon = numeric.epsilon;
    for(iter = 0; iter < maxiter; iter++){
        for(j = 0; j < m - 1; j++){
            if (Math.abs(H[j + 1][j]) < epsilon * (Math.abs(H[j][j]) + Math.abs(H[j + 1][j + 1]))) {
                var QH1 = numeric.QRFrancis(numeric.getBlock(H, [
                    0,
                    0
                ], [
                    j,
                    j
                ]), maxiter);
                var QH2 = numeric.QRFrancis(numeric.getBlock(H, [
                    j + 1,
                    j + 1
                ], [
                    m - 1,
                    m - 1
                ]), maxiter);
                B = Array(j + 1);
                for(i = 0; i <= j; i++){
                    B[i] = Q[i];
                }
                C = numeric.dot(QH1.Q, B);
                for(i = 0; i <= j; i++){
                    Q[i] = C[i];
                }
                B = Array(m - j - 1);
                for(i = j + 1; i < m; i++){
                    B[i - j - 1] = Q[i];
                }
                C = numeric.dot(QH2.Q, B);
                for(i = j + 1; i < m; i++){
                    Q[i] = C[i - j - 1];
                }
                return {
                    Q: Q,
                    B: QH1.B.concat(numeric.add(QH2.B, j + 1))
                };
            }
        }
        a = H[m - 2][m - 2];
        b = H[m - 2][m - 1];
        c = H[m - 1][m - 2];
        d = H[m - 1][m - 1];
        tr = a + d;
        det = a * d - b * c;
        Hloc = numeric.getBlock(H, [
            0,
            0
        ], [
            2,
            2
        ]);
        if (tr * tr >= 4 * det) {
            var s1, s2;
            s1 = 0.5 * (tr + Math.sqrt(tr * tr - 4 * det));
            s2 = 0.5 * (tr - Math.sqrt(tr * tr - 4 * det));
            Hloc = numeric.add(numeric.sub(numeric.dot(Hloc, Hloc), numeric.mul(Hloc, s1 + s2)), numeric.diag(numeric.rep([
                3
            ], s1 * s2)));
        } else {
            Hloc = numeric.add(numeric.sub(numeric.dot(Hloc, Hloc), numeric.mul(Hloc, tr)), numeric.diag(numeric.rep([
                3
            ], det)));
        }
        x = [
            Hloc[0][0],
            Hloc[1][0],
            Hloc[2][0]
        ];
        v = numeric.house(x);
        B = [
            H[0],
            H[1],
            H[2]
        ];
        C = numeric.tensor(v, numeric.dot(v, B));
        for(i = 0; i < 3; i++){
            Hi = H[i];
            Ci = C[i];
            for(k = 0; k < m; k++)Hi[k] -= 2 * Ci[k];
        }
        B = numeric.getBlock(H, [
            0,
            0
        ], [
            m - 1,
            2
        ]);
        C = numeric.tensor(numeric.dot(B, v), v);
        for(i = 0; i < m; i++){
            Hi = H[i];
            Ci = C[i];
            for(k = 0; k < 3; k++)Hi[k] -= 2 * Ci[k];
        }
        B = [
            Q[0],
            Q[1],
            Q[2]
        ];
        C = numeric.tensor(v, numeric.dot(v, B));
        for(i = 0; i < 3; i++){
            Qi = Q[i];
            Ci = C[i];
            for(k = 0; k < m; k++)Qi[k] -= 2 * Ci[k];
        }
        var J;
        for(j = 0; j < m - 2; j++){
            for(k = j; k <= j + 1; k++){
                if (Math.abs(H[k + 1][k]) < epsilon * (Math.abs(H[k][k]) + Math.abs(H[k + 1][k + 1]))) {
                    var QH1 = numeric.QRFrancis(numeric.getBlock(H, [
                        0,
                        0
                    ], [
                        k,
                        k
                    ]), maxiter);
                    var QH2 = numeric.QRFrancis(numeric.getBlock(H, [
                        k + 1,
                        k + 1
                    ], [
                        m - 1,
                        m - 1
                    ]), maxiter);
                    B = Array(k + 1);
                    for(i = 0; i <= k; i++){
                        B[i] = Q[i];
                    }
                    C = numeric.dot(QH1.Q, B);
                    for(i = 0; i <= k; i++){
                        Q[i] = C[i];
                    }
                    B = Array(m - k - 1);
                    for(i = k + 1; i < m; i++){
                        B[i - k - 1] = Q[i];
                    }
                    C = numeric.dot(QH2.Q, B);
                    for(i = k + 1; i < m; i++){
                        Q[i] = C[i - k - 1];
                    }
                    return {
                        Q: Q,
                        B: QH1.B.concat(numeric.add(QH2.B, k + 1))
                    };
                }
            }
            J = Math.min(m - 1, j + 3);
            x = Array(J - j);
            for(i = j + 1; i <= J; i++){
                x[i - j - 1] = H[i][j];
            }
            v = numeric.house(x);
            B = numeric.getBlock(H, [
                j + 1,
                j
            ], [
                J,
                m - 1
            ]);
            C = numeric.tensor(v, numeric.dot(v, B));
            for(i = j + 1; i <= J; i++){
                Hi = H[i];
                Ci = C[i - j - 1];
                for(k = j; k < m; k++)Hi[k] -= 2 * Ci[k - j];
            }
            B = numeric.getBlock(H, [
                0,
                j + 1
            ], [
                m - 1,
                J
            ]);
            C = numeric.tensor(numeric.dot(B, v), v);
            for(i = 0; i < m; i++){
                Hi = H[i];
                Ci = C[i];
                for(k = j + 1; k <= J; k++)Hi[k] -= 2 * Ci[k - j - 1];
            }
            B = Array(J - j);
            for(i = j + 1; i <= J; i++)B[i - j - 1] = Q[i];
            C = numeric.tensor(v, numeric.dot(v, B));
            for(i = j + 1; i <= J; i++){
                Qi = Q[i];
                Ci = C[i - j - 1];
                for(k = 0; k < m; k++)Qi[k] -= 2 * Ci[k];
            }
        }
    }
    throw new Error('numeric: eigenvalue iteration does not converge -- increase maxiter?');
};
numeric.eig = function eig(A, maxiter) {
    var QH = numeric.toUpperHessenberg(A);
    var QB = numeric.QRFrancis(QH.H, maxiter);
    var T1 = numeric.T;
    var n = A.length, i, k, flag = false, B = QB.B, H = numeric.dot(QB.Q, numeric.dot(QH.H, numeric.transpose(QB.Q)));
    var Q = new T1(numeric.dot(QB.Q, QH.Q)), Q0;
    var m = B.length, j;
    var a, b, c, d, p1, p2, disc, x, y, p, q, n1, n2;
    var sqrt = Math.sqrt;
    for(k = 0; k < m; k++){
        i = B[k][0];
        if (i === B[k][1]) {
        // nothing
        } else {
            j = i + 1;
            a = H[i][i];
            b = H[i][j];
            c = H[j][i];
            d = H[j][j];
            if (b === 0 && c === 0) continue;
            p1 = -a - d;
            p2 = a * d - b * c;
            disc = p1 * p1 - 4 * p2;
            if (disc >= 0) {
                if (p1 < 0) x = -0.5 * (p1 - sqrt(disc));
                else x = -0.5 * (p1 + sqrt(disc));
                n1 = (a - x) * (a - x) + b * b;
                n2 = c * c + (d - x) * (d - x);
                if (n1 > n2) {
                    n1 = sqrt(n1);
                    p = (a - x) / n1;
                    q = b / n1;
                } else {
                    n2 = sqrt(n2);
                    p = c / n2;
                    q = (d - x) / n2;
                }
                Q0 = new T1([
                    [
                        q,
                        -p
                    ],
                    [
                        p,
                        q
                    ]
                ]);
                Q.setRows(i, j, Q0.dot(Q.getRows(i, j)));
            } else {
                x = -0.5 * p1;
                y = 0.5 * sqrt(-disc);
                n1 = (a - x) * (a - x) + b * b;
                n2 = c * c + (d - x) * (d - x);
                if (n1 > n2) {
                    n1 = sqrt(n1 + y * y);
                    p = (a - x) / n1;
                    q = b / n1;
                    x = 0;
                    y /= n1;
                } else {
                    n2 = sqrt(n2 + y * y);
                    p = c / n2;
                    q = (d - x) / n2;
                    x = y / n2;
                    y = 0;
                }
                Q0 = new T1([
                    [
                        q,
                        -p
                    ],
                    [
                        p,
                        q
                    ]
                ], [
                    [
                        x,
                        y
                    ],
                    [
                        y,
                        -x
                    ]
                ]);
                Q.setRows(i, j, Q0.dot(Q.getRows(i, j)));
            }
        }
    }
    var R = Q.dot(A).dot(Q.transjugate()), n = A.length, E = numeric.T.identity(n);
    for(j = 0; j < n; j++){
        if (j > 0) {
            for(k = j - 1; k >= 0; k--){
                var Rk = R.get([
                    k,
                    k
                ]), Rj = R.get([
                    j,
                    j
                ]);
                if (numeric.neq(Rk.x, Rj.x) || numeric.neq(Rk.y, Rj.y)) {
                    x = R.getRow(k).getBlock([
                        k
                    ], [
                        j - 1
                    ]);
                    y = E.getRow(j).getBlock([
                        k
                    ], [
                        j - 1
                    ]);
                    E.set([
                        j,
                        k
                    ], R.get([
                        k,
                        j
                    ]).neg().sub(x.dot(y)).div(Rk.sub(Rj)));
                } else {
                    E.setRow(j, E.getRow(k));
                    continue;
                }
            }
        }
    }
    for(j = 0; j < n; j++){
        x = E.getRow(j);
        E.setRow(j, x.div(x.norm2()));
    }
    E = E.transpose();
    E = Q.transjugate().dot(E);
    return {
        lambda: R.getDiag(),
        E: E
    };
};
// 5. Compressed Column Storage matrices
numeric.ccsSparse = function ccsSparse(A) {
    var m = A.length, n, foo, i, j, counts = [];
    for(i = m - 1; i !== -1; --i){
        foo = A[i];
        for(j in foo){
            j = parseInt(j);
            while(j >= counts.length)counts[counts.length] = 0;
            if (foo[j] !== 0) counts[j]++;
        }
    }
    var n = counts.length;
    var Ai = Array(n + 1);
    Ai[0] = 0;
    for(i = 0; i < n; ++i)Ai[i + 1] = Ai[i] + counts[i];
    var Aj = Array(Ai[n]), Av = Array(Ai[n]);
    for(i = m - 1; i !== -1; --i){
        foo = A[i];
        for(j in foo){
            if (foo[j] !== 0) {
                counts[j]--;
                Aj[Ai[j] + counts[j]] = i;
                Av[Ai[j] + counts[j]] = foo[j];
            }
        }
    }
    return [
        Ai,
        Aj,
        Av
    ];
};
numeric.ccsFull = function ccsFull(A) {
    var Ai = A[0], Aj = A[1], Av = A[2], s = numeric.ccsDim(A), m = s[0], n = s[1], i, j, j0, j1, k;
    var B = numeric.rep([
        m,
        n
    ], 0);
    for(i = 0; i < n; i++){
        j0 = Ai[i];
        j1 = Ai[i + 1];
        for(j = j0; j < j1; ++j){
            B[Aj[j]][i] = Av[j];
        }
    }
    return B;
};
numeric.ccsTSolve = function ccsTSolve(A, b, x, bj, xj) {
    var Ai = A[0], Aj = A[1], Av = A[2], m = Ai.length - 1, max = Math.max, n = 0;
    if (typeof bj === "undefined") x = numeric.rep([
        m
    ], 0);
    if (typeof bj === "undefined") bj = numeric.linspace(0, x.length - 1);
    if (typeof xj === "undefined") xj = [];
    function dfs(j) {
        var k;
        if (x[j] !== 0) return;
        x[j] = 1;
        for(k = Ai[j]; k < Ai[j + 1]; ++k)dfs(Aj[k]);
        xj[n] = j;
        ++n;
    }
    var i, j, j0, j1, k, l, l0, l1, a;
    for(i = bj.length - 1; i !== -1; --i){
        dfs(bj[i]);
    }
    xj.length = n;
    for(i = xj.length - 1; i !== -1; --i){
        x[xj[i]] = 0;
    }
    for(i = bj.length - 1; i !== -1; --i){
        j = bj[i];
        x[j] = b[j];
    }
    for(i = xj.length - 1; i !== -1; --i){
        j = xj[i];
        j0 = Ai[j];
        j1 = max(Ai[j + 1], j0);
        for(k = j0; k !== j1; ++k){
            if (Aj[k] === j) {
                x[j] /= Av[k];
                break;
            }
        }
        a = x[j];
        for(k = j0; k !== j1; ++k){
            l = Aj[k];
            if (l !== j) x[l] -= a * Av[k];
        }
    }
    return x;
};
numeric.ccsDFS = function ccsDFS(n) {
    this.k = Array(n);
    this.k1 = Array(n);
    this.j = Array(n);
};
numeric.ccsDFS.prototype.dfs = function dfs(J, Ai, Aj, x, xj, Pinv) {
    var m = 0, foo, n = xj.length;
    var k = this.k, k1 = this.k1, j = this.j, km, k11;
    if (x[J] !== 0) return;
    x[J] = 1;
    j[0] = J;
    k[0] = km = Ai[J];
    k1[0] = k11 = Ai[J + 1];
    while(1){
        if (km >= k11) {
            xj[n] = j[m];
            if (m === 0) return;
            ++n;
            --m;
            km = k[m];
            k11 = k1[m];
        } else {
            foo = Pinv[Aj[km]];
            if (x[foo] === 0) {
                x[foo] = 1;
                k[m] = km;
                ++m;
                j[m] = foo;
                km = Ai[foo];
                k1[m] = k11 = Ai[foo + 1];
            } else ++km;
        }
    }
};
numeric.ccsLPSolve = function ccsLPSolve(A, B, x, xj, I, Pinv, dfs) {
    var Ai = A[0], Aj = A[1], Av = A[2], m = Ai.length - 1, n = 0;
    var Bi = B[0], Bj = B[1], Bv = B[2];
    var i, i0, i1, j, J, j0, j1, k, l, l0, l1, a;
    i0 = Bi[I];
    i1 = Bi[I + 1];
    xj.length = 0;
    for(i = i0; i < i1; ++i){
        dfs.dfs(Pinv[Bj[i]], Ai, Aj, x, xj, Pinv);
    }
    for(i = xj.length - 1; i !== -1; --i){
        x[xj[i]] = 0;
    }
    for(i = i0; i !== i1; ++i){
        j = Pinv[Bj[i]];
        x[j] = Bv[i];
    }
    for(i = xj.length - 1; i !== -1; --i){
        j = xj[i];
        j0 = Ai[j];
        j1 = Ai[j + 1];
        for(k = j0; k < j1; ++k){
            if (Pinv[Aj[k]] === j) {
                x[j] /= Av[k];
                break;
            }
        }
        a = x[j];
        for(k = j0; k < j1; ++k){
            l = Pinv[Aj[k]];
            if (l !== j) x[l] -= a * Av[k];
        }
    }
    return x;
};
numeric.ccsLUP1 = function ccsLUP1(A, threshold) {
    var m = A[0].length - 1;
    var L = [
        numeric.rep([
            m + 1
        ], 0),
        [],
        []
    ], U = [
        numeric.rep([
            m + 1
        ], 0),
        [],
        []
    ];
    var Li = L[0], Lj = L[1], Lv = L[2], Ui = U[0], Uj = U[1], Uv = U[2];
    var x = numeric.rep([
        m
    ], 0), xj = numeric.rep([
        m
    ], 0);
    var i, j, k, j0, j1, a, e, c, d, K;
    var sol = numeric.ccsLPSolve, max = Math.max, abs = Math.abs;
    var P = numeric.linspace(0, m - 1), Pinv = numeric.linspace(0, m - 1);
    var dfs = new numeric.ccsDFS(m);
    if (typeof threshold === "undefined") {
        threshold = 1;
    }
    for(i = 0; i < m; ++i){
        sol(L, A, x, xj, i, Pinv, dfs);
        a = -1;
        e = -1;
        for(j = xj.length - 1; j !== -1; --j){
            k = xj[j];
            if (k <= i) continue;
            c = abs(x[k]);
            if (c > a) {
                e = k;
                a = c;
            }
        }
        if (abs(x[i]) < threshold * a) {
            j = P[i];
            a = P[e];
            P[i] = a;
            Pinv[a] = i;
            P[e] = j;
            Pinv[j] = e;
            a = x[i];
            x[i] = x[e];
            x[e] = a;
        }
        a = Li[i];
        e = Ui[i];
        d = x[i];
        Lj[a] = P[i];
        Lv[a] = 1;
        ++a;
        for(j = xj.length - 1; j !== -1; --j){
            k = xj[j];
            c = x[k];
            xj[j] = 0;
            x[k] = 0;
            if (k <= i) {
                Uj[e] = k;
                Uv[e] = c;
                ++e;
            } else {
                Lj[a] = P[k];
                Lv[a] = c / d;
                ++a;
            }
        }
        Li[i + 1] = a;
        Ui[i + 1] = e;
    }
    for(j = Lj.length - 1; j !== -1; --j){
        Lj[j] = Pinv[Lj[j]];
    }
    return {
        L: L,
        U: U,
        P: P,
        Pinv: Pinv
    };
};
numeric.ccsDFS0 = function ccsDFS0(n) {
    this.k = Array(n);
    this.k1 = Array(n);
    this.j = Array(n);
};
numeric.ccsDFS0.prototype.dfs = function dfs(J, Ai, Aj, x, xj, Pinv, P) {
    var m = 0, foo, n = xj.length;
    var k = this.k, k1 = this.k1, j = this.j, km, k11;
    if (x[J] !== 0) return;
    x[J] = 1;
    j[0] = J;
    k[0] = km = Ai[Pinv[J]];
    k1[0] = k11 = Ai[Pinv[J] + 1];
    while(1){
        if (isNaN(km)) throw new Error("Ow!");
        if (km >= k11) {
            xj[n] = Pinv[j[m]];
            if (m === 0) return;
            ++n;
            --m;
            km = k[m];
            k11 = k1[m];
        } else {
            foo = Aj[km];
            if (x[foo] === 0) {
                x[foo] = 1;
                k[m] = km;
                ++m;
                j[m] = foo;
                foo = Pinv[foo];
                km = Ai[foo];
                k1[m] = k11 = Ai[foo + 1];
            } else ++km;
        }
    }
};
numeric.ccsLPSolve0 = function ccsLPSolve0(A, B, y, xj, I, Pinv, P, dfs) {
    var Ai = A[0], Aj = A[1], Av = A[2], m = Ai.length - 1, n = 0;
    var Bi = B[0], Bj = B[1], Bv = B[2];
    var i, i0, i1, j, J, j0, j1, k, l, l0, l1, a;
    i0 = Bi[I];
    i1 = Bi[I + 1];
    xj.length = 0;
    for(i = i0; i < i1; ++i){
        dfs.dfs(Bj[i], Ai, Aj, y, xj, Pinv, P);
    }
    for(i = xj.length - 1; i !== -1; --i){
        j = xj[i];
        y[P[j]] = 0;
    }
    for(i = i0; i !== i1; ++i){
        j = Bj[i];
        y[j] = Bv[i];
    }
    for(i = xj.length - 1; i !== -1; --i){
        j = xj[i];
        l = P[j];
        j0 = Ai[j];
        j1 = Ai[j + 1];
        for(k = j0; k < j1; ++k){
            if (Aj[k] === l) {
                y[l] /= Av[k];
                break;
            }
        }
        a = y[l];
        for(k = j0; k < j1; ++k)y[Aj[k]] -= a * Av[k];
        y[l] = a;
    }
};
numeric.ccsLUP0 = function ccsLUP0(A, threshold) {
    var m = A[0].length - 1;
    var L = [
        numeric.rep([
            m + 1
        ], 0),
        [],
        []
    ], U = [
        numeric.rep([
            m + 1
        ], 0),
        [],
        []
    ];
    var Li = L[0], Lj = L[1], Lv = L[2], Ui = U[0], Uj = U[1], Uv = U[2];
    var y = numeric.rep([
        m
    ], 0), xj = numeric.rep([
        m
    ], 0);
    var i, j, k, j0, j1, a, e, c, d, K;
    var sol = numeric.ccsLPSolve0, max = Math.max, abs = Math.abs;
    var P = numeric.linspace(0, m - 1), Pinv = numeric.linspace(0, m - 1);
    var dfs = new numeric.ccsDFS0(m);
    if (typeof threshold === "undefined") {
        threshold = 1;
    }
    for(i = 0; i < m; ++i){
        sol(L, A, y, xj, i, Pinv, P, dfs);
        a = -1;
        e = -1;
        for(j = xj.length - 1; j !== -1; --j){
            k = xj[j];
            if (k <= i) continue;
            c = abs(y[P[k]]);
            if (c > a) {
                e = k;
                a = c;
            }
        }
        if (abs(y[P[i]]) < threshold * a) {
            j = P[i];
            a = P[e];
            P[i] = a;
            Pinv[a] = i;
            P[e] = j;
            Pinv[j] = e;
        }
        a = Li[i];
        e = Ui[i];
        d = y[P[i]];
        Lj[a] = P[i];
        Lv[a] = 1;
        ++a;
        for(j = xj.length - 1; j !== -1; --j){
            k = xj[j];
            c = y[P[k]];
            xj[j] = 0;
            y[P[k]] = 0;
            if (k <= i) {
                Uj[e] = k;
                Uv[e] = c;
                ++e;
            } else {
                Lj[a] = P[k];
                Lv[a] = c / d;
                ++a;
            }
        }
        Li[i + 1] = a;
        Ui[i + 1] = e;
    }
    for(j = Lj.length - 1; j !== -1; --j){
        Lj[j] = Pinv[Lj[j]];
    }
    return {
        L: L,
        U: U,
        P: P,
        Pinv: Pinv
    };
};
numeric.ccsLUP = numeric.ccsLUP0;
numeric.ccsDim = function ccsDim(A) {
    return [
        numeric.sup(A[1]) + 1,
        A[0].length - 1
    ];
};
numeric.ccsGetBlock = function ccsGetBlock(A, i, j) {
    var s = numeric.ccsDim(A), m = s[0], n = s[1];
    if (typeof i === "undefined") {
        i = numeric.linspace(0, m - 1);
    } else if (typeof i === "number") {
        i = [
            i
        ];
    }
    if (typeof j === "undefined") {
        j = numeric.linspace(0, n - 1);
    } else if (typeof j === "number") {
        j = [
            j
        ];
    }
    var p, p0, p1, P = i.length, q, Q = j.length, r, jq, ip;
    var Bi = numeric.rep([
        n
    ], 0), Bj = [], Bv = [], B = [
        Bi,
        Bj,
        Bv
    ];
    var Ai = A[0], Aj = A[1], Av = A[2];
    var x = numeric.rep([
        m
    ], 0), count = 0, flags = numeric.rep([
        m
    ], 0);
    for(q = 0; q < Q; ++q){
        jq = j[q];
        var q0 = Ai[jq];
        var q1 = Ai[jq + 1];
        for(p = q0; p < q1; ++p){
            r = Aj[p];
            flags[r] = 1;
            x[r] = Av[p];
        }
        for(p = 0; p < P; ++p){
            ip = i[p];
            if (flags[ip]) {
                Bj[count] = p;
                Bv[count] = x[i[p]];
                ++count;
            }
        }
        for(p = q0; p < q1; ++p){
            r = Aj[p];
            flags[r] = 0;
        }
        Bi[q + 1] = count;
    }
    return B;
};
numeric.ccsDot = function ccsDot(A, B) {
    var Ai = A[0], Aj = A[1], Av = A[2];
    var Bi = B[0], Bj = B[1], Bv = B[2];
    var sA = numeric.ccsDim(A), sB = numeric.ccsDim(B);
    var m = sA[0], n = sA[1], o = sB[1];
    var x = numeric.rep([
        m
    ], 0), flags = numeric.rep([
        m
    ], 0), xj = Array(m);
    var Ci = numeric.rep([
        o
    ], 0), Cj = [], Cv = [], C = [
        Ci,
        Cj,
        Cv
    ];
    var i, j, k, j0, j1, i0, i1, l, p, a, b;
    for(k = 0; k !== o; ++k){
        j0 = Bi[k];
        j1 = Bi[k + 1];
        p = 0;
        for(j = j0; j < j1; ++j){
            a = Bj[j];
            b = Bv[j];
            i0 = Ai[a];
            i1 = Ai[a + 1];
            for(i = i0; i < i1; ++i){
                l = Aj[i];
                if (flags[l] === 0) {
                    xj[p] = l;
                    flags[l] = 1;
                    p = p + 1;
                }
                x[l] = x[l] + Av[i] * b;
            }
        }
        j0 = Ci[k];
        j1 = j0 + p;
        Ci[k + 1] = j1;
        for(j = p - 1; j !== -1; --j){
            b = j0 + j;
            i = xj[j];
            Cj[b] = i;
            Cv[b] = x[i];
            flags[i] = 0;
            x[i] = 0;
        }
        Ci[k + 1] = Ci[k] + p;
    }
    return C;
};
numeric.ccsLUPSolve = function ccsLUPSolve(LUP, B) {
    var L = LUP.L, U = LUP.U, P = LUP.P;
    var Bi = B[0];
    var flag = false;
    if (typeof Bi !== "object") {
        B = [
            [
                0,
                B.length
            ],
            numeric.linspace(0, B.length - 1),
            B
        ];
        Bi = B[0];
        flag = true;
    }
    var Bj = B[1], Bv = B[2];
    var n = L[0].length - 1, m = Bi.length - 1;
    var x = numeric.rep([
        n
    ], 0), xj = Array(n);
    var b = numeric.rep([
        n
    ], 0), bj = Array(n);
    var Xi = numeric.rep([
        m + 1
    ], 0), Xj = [], Xv = [];
    var sol = numeric.ccsTSolve;
    var i, j, j0, j1, k, J, N = 0;
    for(i = 0; i < m; ++i){
        k = 0;
        j0 = Bi[i];
        j1 = Bi[i + 1];
        for(j = j0; j < j1; ++j){
            J = LUP.Pinv[Bj[j]];
            bj[k] = J;
            b[J] = Bv[j];
            ++k;
        }
        bj.length = k;
        sol(L, b, x, bj, xj);
        for(j = bj.length - 1; j !== -1; --j)b[bj[j]] = 0;
        sol(U, x, b, xj, bj);
        if (flag) return b;
        for(j = xj.length - 1; j !== -1; --j)x[xj[j]] = 0;
        for(j = bj.length - 1; j !== -1; --j){
            J = bj[j];
            Xj[N] = J;
            Xv[N] = b[J];
            b[J] = 0;
            ++N;
        }
        Xi[i + 1] = N;
    }
    return [
        Xi,
        Xj,
        Xv
    ];
};
numeric.ccsbinop = function ccsbinop(body, setup) {
    if (typeof setup === "undefined") setup = '';
    return Function('X', 'Y', 'var Xi = X[0], Xj = X[1], Xv = X[2];\n' + 'var Yi = Y[0], Yj = Y[1], Yv = Y[2];\n' + 'var n = Xi.length-1,m = Math.max(numeric.sup(Xj),numeric.sup(Yj))+1;\n' + 'var Zi = numeric.rep([n+1],0), Zj = [], Zv = [];\n' + 'var x = numeric.rep([m],0),y = numeric.rep([m],0);\n' + 'var xk,yk,zk;\n' + 'var i,j,j0,j1,k,p=0;\n' + setup + 'for(i=0;i<n;++i) {\n' + '  j0 = Xi[i]; j1 = Xi[i+1];\n' + '  for(j=j0;j!==j1;++j) {\n' + '    k = Xj[j];\n' + '    x[k] = 1;\n' + '    Zj[p] = k;\n' + '    ++p;\n' + '  }\n' + '  j0 = Yi[i]; j1 = Yi[i+1];\n' + '  for(j=j0;j!==j1;++j) {\n' + '    k = Yj[j];\n' + '    y[k] = Yv[j];\n' + '    if(x[k] === 0) {\n' + '      Zj[p] = k;\n' + '      ++p;\n' + '    }\n' + '  }\n' + '  Zi[i+1] = p;\n' + '  j0 = Xi[i]; j1 = Xi[i+1];\n' + '  for(j=j0;j!==j1;++j) x[Xj[j]] = Xv[j];\n' + '  j0 = Zi[i]; j1 = Zi[i+1];\n' + '  for(j=j0;j!==j1;++j) {\n' + '    k = Zj[j];\n' + '    xk = x[k];\n' + '    yk = y[k];\n' + body + '\n' + '    Zv[j] = zk;\n' + '  }\n' + '  j0 = Xi[i]; j1 = Xi[i+1];\n' + '  for(j=j0;j!==j1;++j) x[Xj[j]] = 0;\n' + '  j0 = Yi[i]; j1 = Yi[i+1];\n' + '  for(j=j0;j!==j1;++j) y[Yj[j]] = 0;\n' + '}\n' + 'return [Zi,Zj,Zv];');
};
(function() {
    var k, A, B, C;
    for(k in numeric.ops2){
        if (isFinite(eval('1' + numeric.ops2[k] + '0'))) A = '[Y[0],Y[1],numeric.' + k + '(X,Y[2])]';
        else A = 'NaN';
        if (isFinite(eval('0' + numeric.ops2[k] + '1'))) B = '[X[0],X[1],numeric.' + k + '(X[2],Y)]';
        else B = 'NaN';
        if (isFinite(eval('1' + numeric.ops2[k] + '0')) && isFinite(eval('0' + numeric.ops2[k] + '1'))) C = 'numeric.ccs' + k + 'MM(X,Y)';
        else C = 'NaN';
        numeric['ccs' + k + 'MM'] = numeric.ccsbinop('zk = xk ' + numeric.ops2[k] + 'yk;');
        numeric['ccs' + k] = Function('X', 'Y', 'if(typeof X === "number") return ' + A + ';\n' + 'if(typeof Y === "number") return ' + B + ';\n' + 'return ' + C + ';\n');
    }
})();
numeric.ccsScatter = function ccsScatter(A) {
    var Ai = A[0], Aj = A[1], Av = A[2];
    var n = numeric.sup(Aj) + 1, m = Ai.length;
    var Ri = numeric.rep([
        n
    ], 0), Rj = Array(m), Rv = Array(m);
    var counts = numeric.rep([
        n
    ], 0), i;
    for(i = 0; i < m; ++i)counts[Aj[i]]++;
    for(i = 0; i < n; ++i)Ri[i + 1] = Ri[i] + counts[i];
    var ptr = Ri.slice(0), k, Aii;
    for(i = 0; i < m; ++i){
        Aii = Aj[i];
        k = ptr[Aii];
        Rj[k] = Ai[i];
        Rv[k] = Av[i];
        ptr[Aii] = ptr[Aii] + 1;
    }
    return [
        Ri,
        Rj,
        Rv
    ];
};
numeric.ccsGather = function ccsGather(A) {
    var Ai = A[0], Aj = A[1], Av = A[2];
    var n = Ai.length - 1, m = Aj.length;
    var Ri = Array(m), Rj = Array(m), Rv = Array(m);
    var i, j, j0, j1, p;
    p = 0;
    for(i = 0; i < n; ++i){
        j0 = Ai[i];
        j1 = Ai[i + 1];
        for(j = j0; j !== j1; ++j){
            Rj[p] = i;
            Ri[p] = Aj[j];
            Rv[p] = Av[j];
            ++p;
        }
    }
    return [
        Ri,
        Rj,
        Rv
    ];
};
// The following sparse linear algebra routines are deprecated.
numeric.sdim = function dim(A, ret, k) {
    if (typeof ret === "undefined") {
        ret = [];
    }
    if (typeof A !== "object") return ret;
    if (typeof k === "undefined") {
        k = 0;
    }
    if (!(k in ret)) {
        ret[k] = 0;
    }
    if (A.length > ret[k]) ret[k] = A.length;
    var i;
    for(i in A){
        if (A.hasOwnProperty(i)) dim(A[i], ret, k + 1);
    }
    return ret;
};
numeric.sclone = function clone(A, k, n) {
    if (typeof k === "undefined") {
        k = 0;
    }
    if (typeof n === "undefined") {
        n = numeric.sdim(A).length;
    }
    var i, ret = Array(A.length);
    if (k === n - 1) {
        for(i in A){
            if (A.hasOwnProperty(i)) ret[i] = A[i];
        }
        return ret;
    }
    for(i in A){
        if (A.hasOwnProperty(i)) ret[i] = clone(A[i], k + 1, n);
    }
    return ret;
};
numeric.sdiag = function diag(d) {
    var n = d.length, i, ret = Array(n), i1, i2, i3;
    for(i = n - 1; i >= 1; i -= 2){
        i1 = i - 1;
        ret[i] = [];
        ret[i][i] = d[i];
        ret[i1] = [];
        ret[i1][i1] = d[i1];
    }
    if (i === 0) {
        ret[0] = [];
        ret[0][0] = d[i];
    }
    return ret;
};
numeric.sidentity = function identity(n) {
    return numeric.sdiag(numeric.rep([
        n
    ], 1));
};
numeric.stranspose = function transpose(A) {
    var ret = [], n = A.length, i, j, Ai;
    for(i in A){
        if (!A.hasOwnProperty(i)) continue;
        Ai = A[i];
        for(j in Ai){
            if (!Ai.hasOwnProperty(j)) continue;
            if (typeof ret[j] !== "object") {
                ret[j] = [];
            }
            ret[j][i] = Ai[j];
        }
    }
    return ret;
};
numeric.sLUP = function LUP(A, tol) {
    throw new Error("The function numeric.sLUP had a bug in it and has been removed. Please use the new numeric.ccsLUP function instead.");
};
numeric.sdotMM = function dotMM(A, B) {
    var p = A.length, q = B.length, BT = numeric.stranspose(B), r = BT.length, Ai, BTk;
    var i, j, k, accum;
    var ret = Array(p), reti;
    for(i = p - 1; i >= 0; i--){
        reti = [];
        Ai = A[i];
        for(k = r - 1; k >= 0; k--){
            accum = 0;
            BTk = BT[k];
            for(j in Ai){
                if (!Ai.hasOwnProperty(j)) continue;
                if (j in BTk) {
                    accum += Ai[j] * BTk[j];
                }
            }
            if (accum) reti[k] = accum;
        }
        ret[i] = reti;
    }
    return ret;
};
numeric.sdotMV = function dotMV(A, x) {
    var p = A.length, Ai, i, j;
    var ret = Array(p), accum;
    for(i = p - 1; i >= 0; i--){
        Ai = A[i];
        accum = 0;
        for(j in Ai){
            if (!Ai.hasOwnProperty(j)) continue;
            if (x[j]) accum += Ai[j] * x[j];
        }
        if (accum) ret[i] = accum;
    }
    return ret;
};
numeric.sdotVM = function dotMV(x, A) {
    var i, j, Ai, alpha;
    var ret = [], accum;
    for(i in x){
        if (!x.hasOwnProperty(i)) continue;
        Ai = A[i];
        alpha = x[i];
        for(j in Ai){
            if (!Ai.hasOwnProperty(j)) continue;
            if (!ret[j]) {
                ret[j] = 0;
            }
            ret[j] += alpha * Ai[j];
        }
    }
    return ret;
};
numeric.sdotVV = function dotVV(x, y) {
    var i, ret = 0;
    for(i in x){
        if (x[i] && y[i]) ret += x[i] * y[i];
    }
    return ret;
};
numeric.sdot = function dot(A, B) {
    var m = numeric.sdim(A).length, n = numeric.sdim(B).length;
    var k = m * 1000 + n;
    switch(k){
        case 0:
            return A * B;
        case 1001:
            return numeric.sdotVV(A, B);
        case 2001:
            return numeric.sdotMV(A, B);
        case 1002:
            return numeric.sdotVM(A, B);
        case 2002:
            return numeric.sdotMM(A, B);
        default:
            throw new Error('numeric.sdot not implemented for tensors of order ' + m + ' and ' + n);
    }
};
numeric.sscatter = function scatter(V) {
    var n = V[0].length, Vij, i, j, m = V.length, A = [], Aj;
    for(i = n - 1; i >= 0; --i){
        if (!V[m - 1][i]) continue;
        Aj = A;
        for(j = 0; j < m - 2; j++){
            Vij = V[j][i];
            if (!Aj[Vij]) Aj[Vij] = [];
            Aj = Aj[Vij];
        }
        Aj[V[j][i]] = V[j + 1][i];
    }
    return A;
};
numeric.sgather = function gather(A, ret, k) {
    if (typeof ret === "undefined") ret = [];
    if (typeof k === "undefined") k = [];
    var n, i, Ai;
    n = k.length;
    for(i in A){
        if (A.hasOwnProperty(i)) {
            k[n] = parseInt(i);
            Ai = A[i];
            if (typeof Ai === "number") {
                if (Ai) {
                    if (ret.length === 0) {
                        for(i = n + 1; i >= 0; --i)ret[i] = [];
                    }
                    for(i = n; i >= 0; --i)ret[i].push(k[i]);
                    ret[n + 1].push(Ai);
                }
            } else gather(Ai, ret, k);
        }
    }
    if (k.length > n) k.pop();
    return ret;
};
// 6. Coordinate matrices
numeric.cLU = function LU(A) {
    var I = A[0], J = A[1], V = A[2];
    var p = I.length, m = 0, i, j, k, a, b, c;
    for(i = 0; i < p; i++)if (I[i] > m) m = I[i];
    m++;
    var L = Array(m), U = Array(m), left = numeric.rep([
        m
    ], Infinity), right = numeric.rep([
        m
    ], -Infinity);
    var Ui, Uj, alpha;
    for(k = 0; k < p; k++){
        i = I[k];
        j = J[k];
        if (j < left[i]) left[i] = j;
        if (j > right[i]) right[i] = j;
    }
    for(i = 0; i < m - 1; i++){
        if (right[i] > right[i + 1]) right[i + 1] = right[i];
    }
    for(i = m - 1; i >= 1; i--){
        if (left[i] < left[i - 1]) left[i - 1] = left[i];
    }
    var countL = 0, countU = 0;
    for(i = 0; i < m; i++){
        U[i] = numeric.rep([
            right[i] - left[i] + 1
        ], 0);
        L[i] = numeric.rep([
            i - left[i]
        ], 0);
        countL += i - left[i] + 1;
        countU += right[i] - i + 1;
    }
    for(k = 0; k < p; k++){
        i = I[k];
        U[i][J[k] - left[i]] = V[k];
    }
    for(i = 0; i < m - 1; i++){
        a = i - left[i];
        Ui = U[i];
        for(j = i + 1; left[j] <= i && j < m; j++){
            b = i - left[j];
            c = right[i] - i;
            Uj = U[j];
            alpha = Uj[b] / Ui[a];
            if (alpha) {
                for(k = 1; k <= c; k++){
                    Uj[k + b] -= alpha * Ui[k + a];
                }
                L[j][i - left[j]] = alpha;
            }
        }
    }
    var Ui = [], Uj = [], Uv = [], Li = [], Lj = [], Lv = [];
    var p, q, foo;
    p = 0;
    q = 0;
    for(i = 0; i < m; i++){
        a = left[i];
        b = right[i];
        foo = U[i];
        for(j = i; j <= b; j++){
            if (foo[j - a]) {
                Ui[p] = i;
                Uj[p] = j;
                Uv[p] = foo[j - a];
                p++;
            }
        }
        foo = L[i];
        for(j = a; j < i; j++){
            if (foo[j - a]) {
                Li[q] = i;
                Lj[q] = j;
                Lv[q] = foo[j - a];
                q++;
            }
        }
        Li[q] = i;
        Lj[q] = i;
        Lv[q] = 1;
        q++;
    }
    return {
        U: [
            Ui,
            Uj,
            Uv
        ],
        L: [
            Li,
            Lj,
            Lv
        ]
    };
};
numeric.cLUsolve = function LUsolve(lu, b) {
    var L = lu.L, U = lu.U, ret = numeric.clone(b);
    var Li = L[0], Lj = L[1], Lv = L[2];
    var Ui = U[0], Uj = U[1], Uv = U[2];
    var p = Ui.length, q = Li.length;
    var m = ret.length, i, j, k;
    k = 0;
    for(i = 0; i < m; i++){
        while(Lj[k] < i){
            ret[i] -= Lv[k] * ret[Lj[k]];
            k++;
        }
        k++;
    }
    k = p - 1;
    for(i = m - 1; i >= 0; i--){
        while(Uj[k] > i){
            ret[i] -= Uv[k] * ret[Uj[k]];
            k--;
        }
        ret[i] /= Uv[k];
        k--;
    }
    return ret;
};
numeric.cgrid = function grid(n, shape) {
    if (typeof n === "number") n = [
        n,
        n
    ];
    var ret = numeric.rep(n, -1);
    var i, j, count;
    if (typeof shape !== "function") {
        switch(shape){
            case 'L':
                shape = function(i, j) {
                    return i >= n[0] / 2 || j < n[1] / 2;
                };
                break;
            default:
                shape = function(i, j) {
                    return true;
                };
                break;
        }
    }
    count = 0;
    for(i = 1; i < n[0] - 1; i++)for(j = 1; j < n[1] - 1; j++)if (shape(i, j)) {
        ret[i][j] = count;
        count++;
    }
    return ret;
};
numeric.cdelsq = function delsq(g) {
    var dir = [
        [
            -1,
            0
        ],
        [
            0,
            -1
        ],
        [
            0,
            1
        ],
        [
            1,
            0
        ]
    ];
    var s = numeric.dim(g), m = s[0], n = s[1], i, j, k, p, q;
    var Li = [], Lj = [], Lv = [];
    for(i = 1; i < m - 1; i++)for(j = 1; j < n - 1; j++){
        if (g[i][j] < 0) continue;
        for(k = 0; k < 4; k++){
            p = i + dir[k][0];
            q = j + dir[k][1];
            if (g[p][q] < 0) continue;
            Li.push(g[i][j]);
            Lj.push(g[p][q]);
            Lv.push(-1);
        }
        Li.push(g[i][j]);
        Lj.push(g[i][j]);
        Lv.push(4);
    }
    return [
        Li,
        Lj,
        Lv
    ];
};
numeric.cdotMV = function dotMV(A, x) {
    var ret, Ai = A[0], Aj = A[1], Av = A[2], k, p = Ai.length, N;
    N = 0;
    for(k = 0; k < p; k++){
        if (Ai[k] > N) N = Ai[k];
    }
    N++;
    ret = numeric.rep([
        N
    ], 0);
    for(k = 0; k < p; k++){
        ret[Ai[k]] += Av[k] * x[Aj[k]];
    }
    return ret;
};
// 7. Splines
numeric.Spline = function Spline(x, yl, yr, kl, kr) {
    this.x = x;
    this.yl = yl;
    this.yr = yr;
    this.kl = kl;
    this.kr = kr;
};
numeric.Spline.prototype._at = function _at(x1, p) {
    var x = this.x;
    var yl = this.yl;
    var yr = this.yr;
    var kl = this.kl;
    var kr = this.kr;
    var x1, a, b, t;
    var add = numeric.add, sub = numeric.sub, mul = numeric.mul;
    a = sub(mul(kl[p], x[p + 1] - x[p]), sub(yr[p + 1], yl[p]));
    b = add(mul(kr[p + 1], x[p] - x[p + 1]), sub(yr[p + 1], yl[p]));
    t = (x1 - x[p]) / (x[p + 1] - x[p]);
    var s = t * (1 - t);
    return add(add(add(mul(1 - t, yl[p]), mul(t, yr[p + 1])), mul(a, s * (1 - t))), mul(b, s * t));
};
numeric.Spline.prototype.at = function at(x0) {
    if (typeof x0 === "number") {
        var x = this.x;
        var n = x.length;
        var p, q, mid, floor = Math.floor, a, b, t;
        p = 0;
        q = n - 1;
        while(q - p > 1){
            mid = floor((p + q) / 2);
            if (x[mid] <= x0) p = mid;
            else q = mid;
        }
        return this._at(x0, p);
    }
    var n = x0.length, i, ret = Array(n);
    for(i = n - 1; i !== -1; --i)ret[i] = this.at(x0[i]);
    return ret;
};
numeric.Spline.prototype.diff = function diff() {
    var x = this.x;
    var yl = this.yl;
    var yr = this.yr;
    var kl = this.kl;
    var kr = this.kr;
    var n = yl.length;
    var i, dx, dy;
    var zl = kl, zr = kr, pl = Array(n), pr = Array(n);
    var add = numeric.add, mul = numeric.mul, div = numeric.div, sub = numeric.sub;
    for(i = n - 1; i !== -1; --i){
        dx = x[i + 1] - x[i];
        dy = sub(yr[i + 1], yl[i]);
        pl[i] = div(add(mul(dy, 6), mul(kl[i], -4 * dx), mul(kr[i + 1], -2 * dx)), dx * dx);
        pr[i + 1] = div(add(mul(dy, -6), mul(kl[i], 2 * dx), mul(kr[i + 1], 4 * dx)), dx * dx);
    }
    return new numeric.Spline(x, zl, zr, pl, pr);
};
numeric.Spline.prototype.roots = function roots() {
    function sqr(x) {
        return x * x;
    }
    function heval(y0, y1, k0, k1, x) {
        var A = k0 * 2 - (y1 - y0);
        var B = -k1 * 2 + (y1 - y0);
        var t = (x + 1) * 0.5;
        var s = t * (1 - t);
        return (1 - t) * y0 + t * y1 + A * s * (1 - t) + B * s * t;
    }
    var ret = [];
    var x = this.x, yl = this.yl, yr = this.yr, kl = this.kl, kr = this.kr;
    if (typeof yl[0] === "number") {
        yl = [
            yl
        ];
        yr = [
            yr
        ];
        kl = [
            kl
        ];
        kr = [
            kr
        ];
    }
    var m = yl.length, n = x.length - 1, i, j, k, y, s, t;
    var ai, bi, ci, di, ret = Array(m), ri, k0, k1, y0, y1, A, B, D, dx, cx, stops, z0, z1, zm, t0, t1, tm;
    var sqrt = Math.sqrt;
    for(i = 0; i !== m; ++i){
        ai = yl[i];
        bi = yr[i];
        ci = kl[i];
        di = kr[i];
        ri = [];
        for(j = 0; j !== n; j++){
            if (j > 0 && bi[j] * ai[j] < 0) ri.push(x[j]);
            dx = x[j + 1] - x[j];
            cx = x[j];
            y0 = ai[j];
            y1 = bi[j + 1];
            k0 = ci[j] / dx;
            k1 = di[j + 1] / dx;
            D = sqr(k0 - k1 + 3 * (y0 - y1)) + 12 * k1 * y0;
            A = k1 + 3 * y0 + 2 * k0 - 3 * y1;
            B = 3 * (k1 + k0 + 2 * (y0 - y1));
            if (D <= 0) {
                z0 = A / B;
                if (z0 > x[j] && z0 < x[j + 1]) stops = [
                    x[j],
                    z0,
                    x[j + 1]
                ];
                else stops = [
                    x[j],
                    x[j + 1]
                ];
            } else {
                z0 = (A - sqrt(D)) / B;
                z1 = (A + sqrt(D)) / B;
                stops = [
                    x[j]
                ];
                if (z0 > x[j] && z0 < x[j + 1]) stops.push(z0);
                if (z1 > x[j] && z1 < x[j + 1]) stops.push(z1);
                stops.push(x[j + 1]);
            }
            t0 = stops[0];
            z0 = this._at(t0, j);
            for(k = 0; k < stops.length - 1; k++){
                t1 = stops[k + 1];
                z1 = this._at(t1, j);
                if (z0 === 0) {
                    ri.push(t0);
                    t0 = t1;
                    z0 = z1;
                    continue;
                }
                if (z1 === 0 || z0 * z1 > 0) {
                    t0 = t1;
                    z0 = z1;
                    continue;
                }
                var side = 0;
                while(1){
                    tm = (z0 * t1 - z1 * t0) / (z0 - z1);
                    if (tm <= t0 || tm >= t1) {
                        break;
                    }
                    zm = this._at(tm, j);
                    if (zm * z1 > 0) {
                        t1 = tm;
                        z1 = zm;
                        if (side === -1) z0 *= 0.5;
                        side = -1;
                    } else if (zm * z0 > 0) {
                        t0 = tm;
                        z0 = zm;
                        if (side === 1) z1 *= 0.5;
                        side = 1;
                    } else break;
                }
                ri.push(tm);
                t0 = stops[k + 1];
                z0 = this._at(t0, j);
            }
            if (z1 === 0) ri.push(t1);
        }
        ret[i] = ri;
    }
    if (typeof this.yl[0] === "number") return ret[0];
    return ret;
};
numeric.spline = function spline(x, y, k1, kn) {
    var n = x.length, b = [], dx = [], dy = [];
    var i;
    var sub = numeric.sub, mul = numeric.mul, add = numeric.add;
    for(i = n - 2; i >= 0; i--){
        dx[i] = x[i + 1] - x[i];
        dy[i] = sub(y[i + 1], y[i]);
    }
    if (typeof k1 === "string" || typeof kn === "string") {
        k1 = kn = "periodic";
    }
    // Build sparse tridiagonal system
    var T1 = [
        [],
        [],
        []
    ];
    switch(typeof k1){
        case "undefined":
            b[0] = mul(3 / (dx[0] * dx[0]), dy[0]);
            T1[0].push(0, 0);
            T1[1].push(0, 1);
            T1[2].push(2 / dx[0], 1 / dx[0]);
            break;
        case "string":
            b[0] = add(mul(3 / (dx[n - 2] * dx[n - 2]), dy[n - 2]), mul(3 / (dx[0] * dx[0]), dy[0]));
            T1[0].push(0, 0, 0);
            T1[1].push(n - 2, 0, 1);
            T1[2].push(1 / dx[n - 2], 2 / dx[n - 2] + 2 / dx[0], 1 / dx[0]);
            break;
        default:
            b[0] = k1;
            T1[0].push(0);
            T1[1].push(0);
            T1[2].push(1);
            break;
    }
    for(i = 1; i < n - 1; i++){
        b[i] = add(mul(3 / (dx[i - 1] * dx[i - 1]), dy[i - 1]), mul(3 / (dx[i] * dx[i]), dy[i]));
        T1[0].push(i, i, i);
        T1[1].push(i - 1, i, i + 1);
        T1[2].push(1 / dx[i - 1], 2 / dx[i - 1] + 2 / dx[i], 1 / dx[i]);
    }
    switch(typeof kn){
        case "undefined":
            b[n - 1] = mul(3 / (dx[n - 2] * dx[n - 2]), dy[n - 2]);
            T1[0].push(n - 1, n - 1);
            T1[1].push(n - 2, n - 1);
            T1[2].push(1 / dx[n - 2], 2 / dx[n - 2]);
            break;
        case "string":
            T1[1][T1[1].length - 1] = 0;
            break;
        default:
            b[n - 1] = kn;
            T1[0].push(n - 1);
            T1[1].push(n - 1);
            T1[2].push(1);
            break;
    }
    if (typeof b[0] !== "number") b = numeric.transpose(b);
    else b = [
        b
    ];
    var k = Array(b.length);
    if (typeof k1 === "string") {
        for(i = k.length - 1; i !== -1; --i){
            k[i] = numeric.ccsLUPSolve(numeric.ccsLUP(numeric.ccsScatter(T1)), b[i]);
            k[i][n - 1] = k[i][0];
        }
    } else {
        for(i = k.length - 1; i !== -1; --i){
            k[i] = numeric.cLUsolve(numeric.cLU(T1), b[i]);
        }
    }
    if (typeof y[0] === "number") k = k[0];
    else k = numeric.transpose(k);
    return new numeric.Spline(x, y, y, k, k);
};
// 8. FFT
numeric.fftpow2 = function fftpow2(x, y) {
    var n = x.length;
    if (n === 1) return;
    var cos = Math.cos, sin = Math.sin, i, j;
    var xe = Array(n / 2), ye = Array(n / 2), xo = Array(n / 2), yo = Array(n / 2);
    j = n / 2;
    for(i = n - 1; i !== -1; --i){
        --j;
        xo[j] = x[i];
        yo[j] = y[i];
        --i;
        xe[j] = x[i];
        ye[j] = y[i];
    }
    fftpow2(xe, ye);
    fftpow2(xo, yo);
    j = n / 2;
    var t, k = -6.2831853071795864769252867665590057683943387987502116419 / n, ci, si;
    for(i = n - 1; i !== -1; --i){
        --j;
        if (j === -1) j = n / 2 - 1;
        t = k * i;
        ci = cos(t);
        si = sin(t);
        x[i] = xe[j] + ci * xo[j] - si * yo[j];
        y[i] = ye[j] + ci * yo[j] + si * xo[j];
    }
};
numeric._ifftpow2 = function _ifftpow2(x, y) {
    var n = x.length;
    if (n === 1) return;
    var cos = Math.cos, sin = Math.sin, i, j;
    var xe = Array(n / 2), ye = Array(n / 2), xo = Array(n / 2), yo = Array(n / 2);
    j = n / 2;
    for(i = n - 1; i !== -1; --i){
        --j;
        xo[j] = x[i];
        yo[j] = y[i];
        --i;
        xe[j] = x[i];
        ye[j] = y[i];
    }
    _ifftpow2(xe, ye);
    _ifftpow2(xo, yo);
    j = n / 2;
    var t, k = 6.2831853071795864769252867665590057683943387987502116419 / n, ci, si;
    for(i = n - 1; i !== -1; --i){
        --j;
        if (j === -1) j = n / 2 - 1;
        t = k * i;
        ci = cos(t);
        si = sin(t);
        x[i] = xe[j] + ci * xo[j] - si * yo[j];
        y[i] = ye[j] + ci * yo[j] + si * xo[j];
    }
};
numeric.ifftpow2 = function ifftpow2(x, y) {
    numeric._ifftpow2(x, y);
    numeric.diveq(x, x.length);
    numeric.diveq(y, y.length);
};
numeric.convpow2 = function convpow2(ax, ay, bx, by) {
    numeric.fftpow2(ax, ay);
    numeric.fftpow2(bx, by);
    var i, n = ax.length, axi, bxi, ayi, byi;
    for(i = n - 1; i !== -1; --i){
        axi = ax[i];
        ayi = ay[i];
        bxi = bx[i];
        byi = by[i];
        ax[i] = axi * bxi - ayi * byi;
        ay[i] = axi * byi + ayi * bxi;
    }
    numeric.ifftpow2(ax, ay);
};
numeric.T.prototype.fft = function fft() {
    var x = this.x, y = this.y;
    var n = x.length, log = Math.log, log2 = log(2), p = Math.ceil(log(2 * n - 1) / log2), m = Math.pow(2, p);
    var cx = numeric.rep([
        m
    ], 0), cy = numeric.rep([
        m
    ], 0), cos = Math.cos, sin = Math.sin;
    var k, c = -3.141592653589793238462643383279502884197169399375105820 / n, t;
    var a = numeric.rep([
        m
    ], 0), b = numeric.rep([
        m
    ], 0), nhalf = Math.floor(n / 2);
    for(k = 0; k < n; k++)a[k] = x[k];
    if (typeof y !== "undefined") for(k = 0; k < n; k++)b[k] = y[k];
    cx[0] = 1;
    for(k = 1; k <= m / 2; k++){
        t = c * k * k;
        cx[k] = cos(t);
        cy[k] = sin(t);
        cx[m - k] = cos(t);
        cy[m - k] = sin(t);
    }
    var X = new numeric.T(a, b), Y = new numeric.T(cx, cy);
    X = X.mul(Y);
    numeric.convpow2(X.x, X.y, numeric.clone(Y.x), numeric.neg(Y.y));
    X = X.mul(Y);
    X.x.length = n;
    X.y.length = n;
    return X;
};
numeric.T.prototype.ifft = function ifft() {
    var x = this.x, y = this.y;
    var n = x.length, log = Math.log, log2 = log(2), p = Math.ceil(log(2 * n - 1) / log2), m = Math.pow(2, p);
    var cx = numeric.rep([
        m
    ], 0), cy = numeric.rep([
        m
    ], 0), cos = Math.cos, sin = Math.sin;
    var k, c = 3.141592653589793238462643383279502884197169399375105820 / n, t;
    var a = numeric.rep([
        m
    ], 0), b = numeric.rep([
        m
    ], 0), nhalf = Math.floor(n / 2);
    for(k = 0; k < n; k++)a[k] = x[k];
    if (typeof y !== "undefined") for(k = 0; k < n; k++)b[k] = y[k];
    cx[0] = 1;
    for(k = 1; k <= m / 2; k++){
        t = c * k * k;
        cx[k] = cos(t);
        cy[k] = sin(t);
        cx[m - k] = cos(t);
        cy[m - k] = sin(t);
    }
    var X = new numeric.T(a, b), Y = new numeric.T(cx, cy);
    X = X.mul(Y);
    numeric.convpow2(X.x, X.y, numeric.clone(Y.x), numeric.neg(Y.y));
    X = X.mul(Y);
    X.x.length = n;
    X.y.length = n;
    return X.div(n);
};
//9. Unconstrained optimization
numeric.gradient = function gradient(f, x) {
    var n = x.length;
    var f0 = f(x);
    if (isNaN(f0)) throw new Error('gradient: f(x) is a NaN!');
    var max = Math.max;
    var i, x0 = numeric.clone(x), f1, f2, J = Array(n);
    var div = numeric.div, sub = numeric.sub, errest, roundoff, max = Math.max, eps = 1e-3, abs = Math.abs, min = Math.min;
    var t0, t1, t2, it = 0, d1, d2, N;
    for(i = 0; i < n; i++){
        var h = max(1e-6 * f0, 1e-8);
        while(1){
            ++it;
            if (it > 20) {
                throw new Error("Numerical gradient fails");
            }
            x0[i] = x[i] + h;
            f1 = f(x0);
            x0[i] = x[i] - h;
            f2 = f(x0);
            x0[i] = x[i];
            if (isNaN(f1) || isNaN(f2)) {
                h /= 16;
                continue;
            }
            J[i] = (f1 - f2) / (2 * h);
            t0 = x[i] - h;
            t1 = x[i];
            t2 = x[i] + h;
            d1 = (f1 - f0) / h;
            d2 = (f0 - f2) / h;
            N = max(abs(J[i]), abs(f0), abs(f1), abs(f2), abs(t0), abs(t1), abs(t2), 1e-8);
            errest = min(max(abs(d1 - J[i]), abs(d2 - J[i]), abs(d1 - d2)) / N, h / N);
            if (errest > eps) {
                h /= 16;
            } else break;
        }
    }
    return J;
};
numeric.uncmin = function uncmin(f, x0, tol, gradient, maxit, callback, options) {
    var grad = numeric.gradient;
    if (typeof options === "undefined") {
        options = {};
    }
    if (typeof tol === "undefined") {
        tol = 1e-8;
    }
    if (typeof gradient === "undefined") {
        gradient = function(x) {
            return grad(f, x);
        };
    }
    if (typeof maxit === "undefined") maxit = 1000;
    x0 = numeric.clone(x0);
    var n = x0.length;
    var f0 = f(x0), f1, df0;
    if (isNaN(f0)) throw new Error('uncmin: f(x0) is a NaN!');
    var max = Math.max, norm2 = numeric.norm2;
    tol = max(tol, numeric.epsilon);
    var step, g0, g1, H1 = options.Hinv || numeric.identity(n);
    var dot = numeric.dot, inv = numeric.inv, sub = numeric.sub, add = numeric.add, ten = numeric.tensor, div = numeric.div, mul = numeric.mul;
    var all = numeric.all, isfinite = numeric.isFinite, neg = numeric.neg;
    var it = 0, i, s, x1, y, Hy, Hs, ys, i0, t, nstep, t1, t2;
    var msg = "";
    g0 = gradient(x0);
    while(it < maxit){
        if (typeof callback === "function") {
            if (callback(it, x0, f0, g0, H1)) {
                msg = "Callback returned true";
                break;
            }
        }
        if (!all(isfinite(g0))) {
            msg = "Gradient has Infinity or NaN";
            break;
        }
        step = neg(dot(H1, g0));
        if (!all(isfinite(step))) {
            msg = "Search direction has Infinity or NaN";
            break;
        }
        nstep = norm2(step);
        if (nstep < tol) {
            msg = "Newton step smaller than tol";
            break;
        }
        t = 1;
        df0 = dot(g0, step);
        // line search
        x1 = x0;
        while(it < maxit){
            if (t * nstep < tol) {
                break;
            }
            s = mul(step, t);
            x1 = add(x0, s);
            f1 = f(x1);
            if (f1 - f0 >= 0.1 * t * df0 || isNaN(f1)) {
                t *= 0.5;
                ++it;
                continue;
            }
            break;
        }
        if (t * nstep < tol) {
            msg = "Line search step size smaller than tol";
            break;
        }
        if (it === maxit) {
            msg = "maxit reached during line search";
            break;
        }
        g1 = gradient(x1);
        y = sub(g1, g0);
        ys = dot(y, s);
        Hy = dot(H1, y);
        H1 = sub(add(H1, mul((ys + dot(y, Hy)) / (ys * ys), ten(s, s))), div(add(ten(Hy, s), ten(s, Hy)), ys));
        x0 = x1;
        f0 = f1;
        g0 = g1;
        ++it;
    }
    return {
        solution: x0,
        f: f0,
        gradient: g0,
        invHessian: H1,
        iterations: it,
        message: msg
    };
};
// 10. Ode solver (Dormand-Prince)
numeric.Dopri = function Dopri(x, y, f, ymid, iterations, msg, events) {
    this.x = x;
    this.y = y;
    this.f = f;
    this.ymid = ymid;
    this.iterations = iterations;
    this.events = events;
    this.message = msg;
};
numeric.Dopri.prototype._at = function _at(xi, j) {
    function sqr(x) {
        return x * x;
    }
    var sol = this;
    var xs = sol.x;
    var ys = sol.y;
    var k1 = sol.f;
    var ymid = sol.ymid;
    var n = xs.length;
    var x0, x1, xh, y0, y1, yh, xi;
    var floor = Math.floor, h;
    var c = 0.5;
    var add = numeric.add, mul = numeric.mul, sub = numeric.sub, p, q, w;
    x0 = xs[j];
    x1 = xs[j + 1];
    y0 = ys[j];
    y1 = ys[j + 1];
    h = x1 - x0;
    xh = x0 + c * h;
    yh = ymid[j];
    p = sub(k1[j], mul(y0, 1 / (x0 - xh) + 2 / (x0 - x1)));
    q = sub(k1[j + 1], mul(y1, 1 / (x1 - xh) + 2 / (x1 - x0)));
    w = [
        sqr(xi - x1) * (xi - xh) / sqr(x0 - x1) / (x0 - xh),
        sqr(xi - x0) * sqr(xi - x1) / sqr(x0 - xh) / sqr(x1 - xh),
        sqr(xi - x0) * (xi - xh) / sqr(x1 - x0) / (x1 - xh),
        (xi - x0) * sqr(xi - x1) * (xi - xh) / sqr(x0 - x1) / (x0 - xh),
        (xi - x1) * sqr(xi - x0) * (xi - xh) / sqr(x0 - x1) / (x1 - xh)
    ];
    return add(add(add(add(mul(y0, w[0]), mul(yh, w[1])), mul(y1, w[2])), mul(p, w[3])), mul(q, w[4]));
};
numeric.Dopri.prototype.at = function at(x) {
    var i, j, k, floor = Math.floor;
    if (typeof x !== "number") {
        var n = x.length, ret = Array(n);
        for(i = n - 1; i !== -1; --i){
            ret[i] = this.at(x[i]);
        }
        return ret;
    }
    var x0 = this.x;
    i = 0;
    j = x0.length - 1;
    while(j - i > 1){
        k = floor(0.5 * (i + j));
        if (x0[k] <= x) i = k;
        else j = k;
    }
    return this._at(x, i);
};
numeric.dopri = function dopri(x0, x1, y0, f, tol, maxit, event) {
    if (typeof tol === "undefined") {
        tol = 1e-6;
    }
    if (typeof maxit === "undefined") {
        maxit = 1000;
    }
    var xs = [
        x0
    ], ys = [
        y0
    ], k1 = [
        f(x0, y0)
    ], k2, k3, k4, k5, k6, k7, ymid = [];
    var A2 = 1 / 5;
    var A3 = [
        3 / 40,
        9 / 40
    ];
    var A4 = [
        44 / 45,
        -56 / 15,
        32 / 9
    ];
    var A5 = [
        19372 / 6561,
        -25360 / 2187,
        64448 / 6561,
        -212 / 729
    ];
    var A6 = [
        9017 / 3168,
        -355 / 33,
        46732 / 5247,
        49 / 176,
        -5103 / 18656
    ];
    var b = [
        35 / 384,
        0,
        500 / 1113,
        125 / 192,
        -2187 / 6784,
        11 / 84
    ];
    var bm = [
        0.5 * 6025192743 / 30085553152,
        0,
        0.5 * 51252292925 / 65400821598,
        0.5 * -2691868925 / 45128329728,
        0.5 * 187940372067 / 1594534317056,
        0.5 * -1776094331 / 19743644256,
        0.5 * 11237099 / 235043384
    ];
    var c = [
        1 / 5,
        3 / 10,
        4 / 5,
        8 / 9,
        1,
        1
    ];
    var e = [
        -71 / 57600,
        0,
        71 / 16695,
        -71 / 1920,
        17253 / 339200,
        -22 / 525,
        1 / 40
    ];
    var i = 0, er, j;
    var h = (x1 - x0) / 10;
    var it = 0;
    var add = numeric.add, mul = numeric.mul, y1, erinf;
    var max = Math.max, min = Math.min, abs = Math.abs, norminf = numeric.norminf, pow = Math.pow;
    var any = numeric.any, lt = numeric.lt, and = numeric.and, sub = numeric.sub;
    var e0, e1, ev;
    var ret = new numeric.Dopri(xs, ys, k1, ymid, -1, "");
    if (typeof event === "function") e0 = event(x0, y0);
    while(x0 < x1 && it < maxit){
        ++it;
        if (x0 + h > x1) h = x1 - x0;
        k2 = f(x0 + c[0] * h, add(y0, mul(A2 * h, k1[i])));
        k3 = f(x0 + c[1] * h, add(add(y0, mul(A3[0] * h, k1[i])), mul(A3[1] * h, k2)));
        k4 = f(x0 + c[2] * h, add(add(add(y0, mul(A4[0] * h, k1[i])), mul(A4[1] * h, k2)), mul(A4[2] * h, k3)));
        k5 = f(x0 + c[3] * h, add(add(add(add(y0, mul(A5[0] * h, k1[i])), mul(A5[1] * h, k2)), mul(A5[2] * h, k3)), mul(A5[3] * h, k4)));
        k6 = f(x0 + c[4] * h, add(add(add(add(add(y0, mul(A6[0] * h, k1[i])), mul(A6[1] * h, k2)), mul(A6[2] * h, k3)), mul(A6[3] * h, k4)), mul(A6[4] * h, k5)));
        y1 = add(add(add(add(add(y0, mul(k1[i], h * b[0])), mul(k3, h * b[2])), mul(k4, h * b[3])), mul(k5, h * b[4])), mul(k6, h * b[5]));
        k7 = f(x0 + h, y1);
        er = add(add(add(add(add(mul(k1[i], h * e[0]), mul(k3, h * e[2])), mul(k4, h * e[3])), mul(k5, h * e[4])), mul(k6, h * e[5])), mul(k7, h * e[6]));
        if (typeof er === "number") erinf = abs(er);
        else erinf = norminf(er);
        if (erinf > tol) {
            h = 0.2 * h * pow(tol / erinf, 0.25);
            if (x0 + h === x0) {
                ret.msg = "Step size became too small";
                break;
            }
            continue;
        }
        ymid[i] = add(add(add(add(add(add(y0, mul(k1[i], h * bm[0])), mul(k3, h * bm[2])), mul(k4, h * bm[3])), mul(k5, h * bm[4])), mul(k6, h * bm[5])), mul(k7, h * bm[6]));
        ++i;
        xs[i] = x0 + h;
        ys[i] = y1;
        k1[i] = k7;
        if (typeof event === "function") {
            var yi, xl = x0, xr = x0 + 0.5 * h, xi;
            e1 = event(xr, ymid[i - 1]);
            ev = and(lt(e0, 0), lt(0, e1));
            if (!any(ev)) {
                xl = xr;
                xr = x0 + h;
                e0 = e1;
                e1 = event(xr, y1);
                ev = and(lt(e0, 0), lt(0, e1));
            }
            if (any(ev)) {
                var xc, yc, en, ei;
                var side = 0, sl = 1.0, sr = 1.0;
                while(1){
                    if (typeof e0 === "number") xi = (sr * e1 * xl - sl * e0 * xr) / (sr * e1 - sl * e0);
                    else {
                        xi = xr;
                        for(j = e0.length - 1; j !== -1; --j){
                            if (e0[j] < 0 && e1[j] > 0) xi = min(xi, (sr * e1[j] * xl - sl * e0[j] * xr) / (sr * e1[j] - sl * e0[j]));
                        }
                    }
                    if (xi <= xl || xi >= xr) break;
                    yi = ret._at(xi, i - 1);
                    ei = event(xi, yi);
                    en = and(lt(e0, 0), lt(0, ei));
                    if (any(en)) {
                        xr = xi;
                        e1 = ei;
                        ev = en;
                        sr = 1.0;
                        if (side === -1) sl *= 0.5;
                        else sl = 1.0;
                        side = -1;
                    } else {
                        xl = xi;
                        e0 = ei;
                        sl = 1.0;
                        if (side === 1) sr *= 0.5;
                        else sr = 1.0;
                        side = 1;
                    }
                }
                y1 = ret._at(0.5 * (x0 + xi), i - 1);
                ret.f[i] = f(xi, yi);
                ret.x[i] = xi;
                ret.y[i] = yi;
                ret.ymid[i - 1] = y1;
                ret.events = ev;
                ret.iterations = it;
                return ret;
            }
        }
        x0 += h;
        y0 = y1;
        e0 = e1;
        h = min(0.8 * h * pow(tol / erinf, 0.25), 4 * h);
    }
    ret.iterations = it;
    return ret;
};
// 11. Ax = b
numeric.LU = function(A, fast) {
    fast = fast || false;
    var abs = Math.abs;
    var i, j, k, absAjk, Akk, Ak, Pk, Ai;
    var max;
    var n = A.length, n1 = n - 1;
    var P = new Array(n);
    if (!fast) A = numeric.clone(A);
    for(k = 0; k < n; ++k){
        Pk = k;
        Ak = A[k];
        max = abs(Ak[k]);
        for(j = k + 1; j < n; ++j){
            absAjk = abs(A[j][k]);
            if (max < absAjk) {
                max = absAjk;
                Pk = j;
            }
        }
        P[k] = Pk;
        if (Pk != k) {
            A[k] = A[Pk];
            A[Pk] = Ak;
            Ak = A[k];
        }
        Akk = Ak[k];
        for(i = k + 1; i < n; ++i){
            A[i][k] /= Akk;
        }
        for(i = k + 1; i < n; ++i){
            Ai = A[i];
            for(j = k + 1; j < n1; ++j){
                Ai[j] -= Ai[k] * Ak[j];
                ++j;
                Ai[j] -= Ai[k] * Ak[j];
            }
            if (j === n1) Ai[j] -= Ai[k] * Ak[j];
        }
    }
    return {
        LU: A,
        P: P
    };
};
numeric.LUsolve = function LUsolve(LUP, b) {
    var i, j;
    var LU = LUP.LU;
    var n = LU.length;
    var x = numeric.clone(b);
    var P = LUP.P;
    var Pi, LUi, LUii, tmp;
    for(i = n - 1; i !== -1; --i)x[i] = b[i];
    for(i = 0; i < n; ++i){
        Pi = P[i];
        if (P[i] !== i) {
            tmp = x[i];
            x[i] = x[Pi];
            x[Pi] = tmp;
        }
        LUi = LU[i];
        for(j = 0; j < i; ++j){
            x[i] -= x[j] * LUi[j];
        }
    }
    for(i = n - 1; i >= 0; --i){
        LUi = LU[i];
        for(j = i + 1; j < n; ++j){
            x[i] -= x[j] * LUi[j];
        }
        x[i] /= LUi[i];
    }
    return x;
};
numeric.solve = function solve(A, b, fast) {
    return numeric.LUsolve(numeric.LU(A, fast), b);
};
// 12. Linear programming
numeric.echelonize = function echelonize(A) {
    var s = numeric.dim(A), m = s[0], n = s[1];
    var I = numeric.identity(m);
    var P = Array(m);
    var i, j, k, l, Ai, Ii, Z, a;
    var abs = Math.abs;
    var diveq = numeric.diveq;
    A = numeric.clone(A);
    for(i = 0; i < m; ++i){
        k = 0;
        Ai = A[i];
        Ii = I[i];
        for(j = 1; j < n; ++j)if (abs(Ai[k]) < abs(Ai[j])) k = j;
        P[i] = k;
        diveq(Ii, Ai[k]);
        diveq(Ai, Ai[k]);
        for(j = 0; j < m; ++j)if (j !== i) {
            Z = A[j];
            a = Z[k];
            for(l = n - 1; l !== -1; --l)Z[l] -= Ai[l] * a;
            Z = I[j];
            for(l = m - 1; l !== -1; --l)Z[l] -= Ii[l] * a;
        }
    }
    return {
        I: I,
        A: A,
        P: P
    };
};
numeric.__solveLP = function __solveLP(c, A, b, tol, maxit, x, flag) {
    var sum = numeric.sum, log = numeric.log, mul = numeric.mul, sub = numeric.sub, dot = numeric.dot, div = numeric.div, add = numeric.add;
    var m = c.length, n = b.length, y;
    var unbounded = false, cb, i0 = 0;
    var alpha = 1.0;
    var f0, df0, AT = numeric.transpose(A), svd = numeric.svd, transpose = numeric.transpose, leq = numeric.leq, sqrt = Math.sqrt, abs = Math.abs;
    var muleq = numeric.muleq;
    var norm = numeric.norminf, any = numeric.any, min = Math.min;
    var all = numeric.all, gt = numeric.gt;
    var p = Array(m), A0 = Array(n), e = numeric.rep([
        n
    ], 1), H;
    var solve = numeric.solve, z = sub(b, dot(A, x)), count;
    var dotcc = dot(c, c);
    var g;
    for(count = i0; count < maxit; ++count){
        var i, j, d;
        for(i = n - 1; i !== -1; --i)A0[i] = div(A[i], z[i]);
        var A1 = transpose(A0);
        for(i = m - 1; i !== -1; --i)p[i] = /*x[i]+*/ sum(A1[i]);
        alpha = 0.25 * abs(dotcc / dot(c, p));
        var a1 = 100 * sqrt(dotcc / dot(p, p));
        if (!isFinite(alpha) || alpha > a1) alpha = a1;
        g = add(c, mul(alpha, p));
        H = dot(A1, A0);
        for(i = m - 1; i !== -1; --i)H[i][i] += 1;
        d = solve(H, div(g, alpha), true);
        var t0 = div(z, dot(A, d));
        var t = 1.0;
        for(i = n - 1; i !== -1; --i)if (t0[i] < 0) t = min(t, -0.999 * t0[i]);
        y = sub(x, mul(d, t));
        z = sub(b, dot(A, y));
        if (!all(gt(z, 0))) return {
            solution: x,
            message: "",
            iterations: count
        };
        x = y;
        if (alpha < tol) return {
            solution: y,
            message: "",
            iterations: count
        };
        if (flag) {
            var s = dot(c, g), Ag = dot(A, g);
            unbounded = true;
            for(i = n - 1; i !== -1; --i)if (s * Ag[i] < 0) {
                unbounded = false;
                break;
            }
        } else {
            if (x[m - 1] >= 0) unbounded = false;
            else unbounded = true;
        }
        if (unbounded) return {
            solution: y,
            message: "Unbounded",
            iterations: count
        };
    }
    return {
        solution: x,
        message: "maximum iteration count exceeded",
        iterations: count
    };
};
numeric._solveLP = function _solveLP(c, A, b, tol, maxit) {
    var m = c.length, n = b.length, y;
    var sum = numeric.sum, log = numeric.log, mul = numeric.mul, sub = numeric.sub, dot = numeric.dot, div = numeric.div, add = numeric.add;
    var c0 = numeric.rep([
        m
    ], 0).concat([
        1
    ]);
    var J = numeric.rep([
        n,
        1
    ], -1);
    var A0 = numeric.blockMatrix([
        [
            A,
            J
        ]
    ]);
    var b0 = b;
    var y = numeric.rep([
        m
    ], 0).concat(Math.max(0, numeric.sup(numeric.neg(b))) + 1);
    var x0 = numeric.__solveLP(c0, A0, b0, tol, maxit, y, false);
    var x = numeric.clone(x0.solution);
    x.length = m;
    var foo = numeric.inf(sub(b, dot(A, x)));
    if (foo < 0) {
        return {
            solution: NaN,
            message: "Infeasible",
            iterations: x0.iterations
        };
    }
    var ret = numeric.__solveLP(c, A, b, tol, maxit - x0.iterations, x, true);
    ret.iterations += x0.iterations;
    return ret;
};
numeric.solveLP = function solveLP(c, A, b, Aeq, beq, tol, maxit) {
    if (typeof maxit === "undefined") maxit = 1000;
    if (typeof tol === "undefined") tol = numeric.epsilon;
    if (typeof Aeq === "undefined") return numeric._solveLP(c, A, b, tol, maxit);
    var m = Aeq.length, n = Aeq[0].length, o = A.length;
    var B = numeric.echelonize(Aeq);
    var flags = numeric.rep([
        n
    ], 0);
    var P = B.P;
    var Q = [];
    var i;
    for(i = P.length - 1; i !== -1; --i)flags[P[i]] = 1;
    for(i = n - 1; i !== -1; --i)if (flags[i] === 0) Q.push(i);
    var g = numeric.getRange;
    var I = numeric.linspace(0, m - 1), J = numeric.linspace(0, o - 1);
    var Aeq2 = g(Aeq, I, Q), A1 = g(A, J, P), A2 = g(A, J, Q), dot = numeric.dot, sub = numeric.sub;
    var A3 = dot(A1, B.I);
    var A4 = sub(A2, dot(A3, Aeq2)), b4 = sub(b, dot(A3, beq));
    var c1 = Array(P.length), c2 = Array(Q.length);
    for(i = P.length - 1; i !== -1; --i)c1[i] = c[P[i]];
    for(i = Q.length - 1; i !== -1; --i)c2[i] = c[Q[i]];
    var c4 = sub(c2, dot(c1, dot(B.I, Aeq2)));
    var S = numeric._solveLP(c4, A4, b4, tol, maxit);
    var x2 = S.solution;
    if (x2 !== x2) return S;
    var x1 = dot(B.I, sub(beq, dot(Aeq2, x2)));
    var x = Array(c.length);
    for(i = P.length - 1; i !== -1; --i)x[P[i]] = x1[i];
    for(i = Q.length - 1; i !== -1; --i)x[Q[i]] = x2[i];
    return {
        solution: x,
        message: S.message,
        iterations: S.iterations
    };
};
numeric.MPStoLP = function MPStoLP(MPS) {
    if (MPS instanceof String) {
        MPS.split('\n');
    }
    var state = 0;
    var states = [
        'Initial state',
        'NAME',
        'ROWS',
        'COLUMNS',
        'RHS',
        'BOUNDS',
        'ENDATA'
    ];
    var n = MPS.length;
    var i, j, z, N = 0, rows = {}, sign = [], rl = 0, vars = {}, nv = 0;
    var name;
    var c = [], A = [], b = [];
    function err(e) {
        throw new Error('MPStoLP: ' + e + '\nLine ' + i + ': ' + MPS[i] + '\nCurrent state: ' + states[state] + '\n');
    }
    for(i = 0; i < n; ++i){
        z = MPS[i];
        var w0 = z.match(/\S*/g);
        var w = [];
        for(j = 0; j < w0.length; ++j)if (w0[j] !== "") w.push(w0[j]);
        if (w.length === 0) continue;
        for(j = 0; j < states.length; ++j)if (z.substr(0, states[j].length) === states[j]) break;
        if (j < states.length) {
            state = j;
            if (j === 1) {
                name = w[1];
            }
            if (j === 6) return {
                name: name,
                c: c,
                A: numeric.transpose(A),
                b: b,
                rows: rows,
                vars: vars
            };
            continue;
        }
        switch(state){
            case 0:
            case 1:
                err('Unexpected line');
            case 2:
                switch(w[0]){
                    case 'N':
                        if (N === 0) N = w[1];
                        else err('Two or more N rows');
                        break;
                    case 'L':
                        rows[w[1]] = rl;
                        sign[rl] = 1;
                        b[rl] = 0;
                        ++rl;
                        break;
                    case 'G':
                        rows[w[1]] = rl;
                        sign[rl] = -1;
                        b[rl] = 0;
                        ++rl;
                        break;
                    case 'E':
                        rows[w[1]] = rl;
                        sign[rl] = 0;
                        b[rl] = 0;
                        ++rl;
                        break;
                    default:
                        err('Parse error ' + numeric.prettyPrint(w));
                }
                break;
            case 3:
                if (!vars.hasOwnProperty(w[0])) {
                    vars[w[0]] = nv;
                    c[nv] = 0;
                    A[nv] = numeric.rep([
                        rl
                    ], 0);
                    ++nv;
                }
                var p = vars[w[0]];
                for(j = 1; j < w.length; j += 2){
                    if (w[j] === N) {
                        c[p] = parseFloat(w[j + 1]);
                        continue;
                    }
                    var q = rows[w[j]];
                    A[p][q] = (sign[q] < 0 ? -1 : 1) * parseFloat(w[j + 1]);
                }
                break;
            case 4:
                for(j = 1; j < w.length; j += 2)b[rows[w[j]]] = (sign[rows[w[j]]] < 0 ? -1 : 1) * parseFloat(w[j + 1]);
                break;
            case 5:
                break;
            case 6:
                err('Internal error');
        }
    }
    err('Reached end of file without ENDATA');
};
// seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js><\/script>
//
//   Math.seedrandom('yipee'); Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="http://bit.ly/srandom-512"><\/script>
//                             Seeds using physical random bits downloaded
//                             from random.org.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   <\/script>                 Seeds using urandom bits from call.jsonlib.com,
//                             which is faster than random.org.
//
// Examples:
//
//   Math.seedrandom("hello");            // Use "hello" as the seed.
//   document.write(Math.random());       // Always 0.5463663768140734
//   document.write(Math.random());       // Always 0.43973793770592234
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable.
//
//   Math.random = rng1;                  // Continue "hello" prng sequence.
//   document.write(Math.random());       // Always 0.554769432473455
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' value.
//
// Notes:
//
// Each time seedrandom('arg') is called, entropy from the passed seed
// is accumulated in a pool to help generate future seeds for the
// zero-argument form of Math.seedrandom, so entropy can be injected over
// time by calling seedrandom with explicit data repeatedly.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but this is typically fast enough anyway.  Seeding is more expensive,
// especially if you use auto-seeding.  Some details (timings on Chrome 4):
//
// Our Math.random()            - avg less than 0.002 milliseconds per call
// seedrandom('explicit')       - avg less than 0.5 milliseconds per call
// seedrandom('explicit', true) - avg less than 2 milliseconds per call
// seedrandom()                 - avg about 38 milliseconds per call
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
// 
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow
 * @param {number=} startdenom
 */ // Patched by Seb so that seedrandom.js does not pollute the Math object.
// My tests suggest that doing Math.trouble = 1 makes Math lookups about 5%
// slower.
numeric.seedrandom = {
    pow: Math.pow,
    random: Math.random
};
(function(pool, math, width, chunks, significance, overflow, startdenom) {
    //
    // seedrandom()
    // This is the seedrandom function described above.
    //
    math['seedrandom'] = function seedrandom(seed, use_entropy) {
        var key = [];
        var arc4;
        // Flatten the seed string or build one from local entropy if needed.
        seed = mixkey(flatten(use_entropy ? [
            seed,
            pool
        ] : arguments.length ? seed : [
            new Date().getTime(),
            pool,
            window
        ], 3), key);
        // Use the seed to initialize an ARC4 generator.
        arc4 = new ARC4(key);
        // Mix the randomness into accumulated entropy.
        mixkey(arc4.S, pool);
        // Override Math.random
        // This function returns a random double in [0, 1) that contains
        // randomness in every bit of the mantissa of the IEEE 754 value.
        math['random'] = function random() {
            var n = arc4.g(chunks); // Start with a numerator n < 2 ^ 48
            var d = startdenom; //   and denominator d = 2 ^ 48.
            var x = 0; //   and no 'extra last byte'.
            while(n < significance){
                n = (n + x) * width; //   shifting numerator and
                d *= width; //   denominator and generating a
                x = arc4.g(1); //   new least-significant-byte.
            }
            while(n >= overflow){
                n /= 2; //   last byte, shift everything
                d /= 2; //   right using integer math until
                x >>>= 1; //   we have exactly the desired bits.
            }
            return (n + x) / d; // Form the number within [0, 1).
        };
        // Return the seed that was used
        return seed;
    };
    //
    // ARC4
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //
    /** @constructor */ function ARC4(key) {
        var t, u, me = this, keylen = key.length;
        var i = 0, j = me.i = me.j = me.m = 0;
        me.S = [];
        me.c = [];
        // The empty key [] is treated as [0].
        if (!keylen) {
            key = [
                keylen++
            ];
        }
        // Set up S using the standard key scheduling algorithm.
        while(i < width){
            me.S[i] = i++;
        }
        for(i = 0; i < width; i++){
            t = me.S[i];
            j = lowbits(j + t + key[i % keylen]);
            u = me.S[j];
            me.S[i] = u;
            me.S[j] = t;
        }
        // The "g" method returns the next (count) outputs as one number.
        me.g = function getnext(count) {
            var s = me.S;
            var i = lowbits(me.i + 1);
            var t = s[i];
            var j = lowbits(me.j + t);
            var u = s[j];
            s[i] = u;
            s[j] = t;
            var r = s[lowbits(t + u)];
            while(--count){
                i = lowbits(i + 1);
                t = s[i];
                j = lowbits(j + t);
                u = s[j];
                s[i] = u;
                s[j] = t;
                r = r * width + s[lowbits(t + u)];
            }
            me.i = i;
            me.j = j;
            return r;
        };
        // For robust unpredictability discard an initial batch of values.
        // See http://www.rsa.com/rsalabs/node.asp?id=2009
        me.g(width);
    }
    //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //
    /** @param {Object=} result
   * @param {string=} prop
   * @param {string=} typ */ function flatten(obj, depth, result, prop, typ) {
        result = [];
        typ = typeof obj;
        if (depth && typ == 'object') {
            for(prop in obj){
                if (prop.indexOf('S') < 5) {
                    try {
                        result.push(flatten(obj[prop], depth - 1));
                    } catch (e) {}
                }
            }
        }
        return result.length ? result : obj + (typ != 'string' ? '\0' : '');
    }
    //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //
    /** @param {number=} smear
   * @param {number=} j */ function mixkey(seed, key, smear, j) {
        seed += ''; // Ensure the seed is a string
        smear = 0;
        for(j = 0; j < seed.length; j++){
            key[lowbits(j)] = lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
        }
        seed = '';
        for(j in key){
            seed += String.fromCharCode(key[j]);
        }
        return seed;
    }
    //
    // lowbits()
    // A quick "n mod width" for width a power of 2.
    //
    function lowbits(n) {
        return n & width - 1;
    }
    //
    // The following constants are related to IEEE 754 limits.
    //
    startdenom = math.pow(width, chunks);
    significance = math.pow(2, significance);
    overflow = significance * 2;
    //
    // When seedrandom.js is loaded, we immediately mix a few bits
    // from the built-in RNG into the entropy pool.  Because we do
    // not want to intefere with determinstic PRNG state later,
    // seedrandom will not call math.random on its own again after
    // initialization.
    //
    mixkey(math.random(), pool);
// End anonymous scope, and pass initial values.
})([], numeric.seedrandom, 256, 6, 52 // significance: there are 52 significant digits in a double
);
/* This file is a slightly modified version of quadprog.js from Alberto Santini.
 * It has been slightly modified by SÃ©bastien Loisel to make sure that it handles
 * 0-based Arrays instead of 1-based Arrays.
 * License is in resources/LICENSE.quadprog */ (function(exports1) {
    function base0to1(A) {
        if (typeof A !== "object") {
            return A;
        }
        var ret = [], i, n = A.length;
        for(i = 0; i < n; i++)ret[i + 1] = base0to1(A[i]);
        return ret;
    }
    function base1to0(A) {
        if (typeof A !== "object") {
            return A;
        }
        var ret = [], i, n = A.length;
        for(i = 1; i < n; i++)ret[i - 1] = base1to0(A[i]);
        return ret;
    }
    function dpori(a, lda, n) {
        var i, j, k, kp1, t;
        for(k = 1; k <= n; k = k + 1){
            a[k][k] = 1 / a[k][k];
            t = -a[k][k];
            //~ dscal(k - 1, t, a[1][k], 1);
            for(i = 1; i < k; i = i + 1){
                a[i][k] = t * a[i][k];
            }
            kp1 = k + 1;
            if (n < kp1) {
                break;
            }
            for(j = kp1; j <= n; j = j + 1){
                t = a[k][j];
                a[k][j] = 0;
                //~ daxpy(k, t, a[1][k], 1, a[1][j], 1);
                for(i = 1; i <= k; i = i + 1){
                    a[i][j] = a[i][j] + t * a[i][k];
                }
            }
        }
    }
    function dposl(a, lda, n, b) {
        var i, k, kb, t;
        for(k = 1; k <= n; k = k + 1){
            //~ t = ddot(k - 1, a[1][k], 1, b[1], 1);
            t = 0;
            for(i = 1; i < k; i = i + 1){
                t = t + a[i][k] * b[i];
            }
            b[k] = (b[k] - t) / a[k][k];
        }
        for(kb = 1; kb <= n; kb = kb + 1){
            k = n + 1 - kb;
            b[k] = b[k] / a[k][k];
            t = -b[k];
            //~ daxpy(k - 1, t, a[1][k], 1, b[1], 1);
            for(i = 1; i < k; i = i + 1){
                b[i] = b[i] + t * a[i][k];
            }
        }
    }
    function dpofa(a, lda, n, info) {
        var i, j, jm1, k, t, s;
        for(j = 1; j <= n; j = j + 1){
            info[1] = j;
            s = 0;
            jm1 = j - 1;
            if (jm1 < 1) {
                s = a[j][j] - s;
                if (s <= 0) {
                    break;
                }
                a[j][j] = Math.sqrt(s);
            } else {
                for(k = 1; k <= jm1; k = k + 1){
                    //~ t = a[k][j] - ddot(k - 1, a[1][k], 1, a[1][j], 1);
                    t = a[k][j];
                    for(i = 1; i < k; i = i + 1){
                        t = t - a[i][j] * a[i][k];
                    }
                    t = t / a[k][k];
                    a[k][j] = t;
                    s = s + t * t;
                }
                s = a[j][j] - s;
                if (s <= 0) {
                    break;
                }
                a[j][j] = Math.sqrt(s);
            }
            info[1] = 0;
        }
    }
    function qpgen2(dmat, dvec, fddmat, n, sol, crval, amat, bvec, fdamat, q, meq, iact, nact, iter, work, ierr) {
        var i, j, l, l1, info, it1, iwzv, iwrv, iwrm, iwsv, iwuv, nvl, r, iwnbv, temp, sum, t1, tt, gc, gs, nu, t1inf, t2min, vsmall, tmpa, tmpb, go;
        r = Math.min(n, q);
        l = 2 * n + r * (r + 5) / 2 + 2 * q + 1;
        vsmall = 1.0e-60;
        do {
            vsmall = vsmall + vsmall;
            tmpa = 1 + 0.1 * vsmall;
            tmpb = 1 + 0.2 * vsmall;
        }while (tmpa <= 1 || tmpb <= 1)
        for(i = 1; i <= n; i = i + 1){
            work[i] = dvec[i];
        }
        for(i = n + 1; i <= l; i = i + 1){
            work[i] = 0;
        }
        for(i = 1; i <= q; i = i + 1){
            iact[i] = 0;
        }
        info = [];
        if (ierr[1] === 0) {
            dpofa(dmat, fddmat, n, info);
            if (info[1] !== 0) {
                ierr[1] = 2;
                return;
            }
            dposl(dmat, fddmat, n, dvec);
            dpori(dmat, fddmat, n);
        } else {
            for(j = 1; j <= n; j = j + 1){
                sol[j] = 0;
                for(i = 1; i <= j; i = i + 1){
                    sol[j] = sol[j] + dmat[i][j] * dvec[i];
                }
            }
            for(j = 1; j <= n; j = j + 1){
                dvec[j] = 0;
                for(i = j; i <= n; i = i + 1){
                    dvec[j] = dvec[j] + dmat[j][i] * sol[i];
                }
            }
        }
        crval[1] = 0;
        for(j = 1; j <= n; j = j + 1){
            sol[j] = dvec[j];
            crval[1] = crval[1] + work[j] * sol[j];
            work[j] = 0;
            for(i = j + 1; i <= n; i = i + 1){
                dmat[i][j] = 0;
            }
        }
        crval[1] = -crval[1] / 2;
        ierr[1] = 0;
        iwzv = n;
        iwrv = iwzv + n;
        iwuv = iwrv + r;
        iwrm = iwuv + r + 1;
        iwsv = iwrm + r * (r + 1) / 2;
        iwnbv = iwsv + q;
        for(i = 1; i <= q; i = i + 1){
            sum = 0;
            for(j = 1; j <= n; j = j + 1){
                sum = sum + amat[j][i] * amat[j][i];
            }
            work[iwnbv + i] = Math.sqrt(sum);
        }
        nact = 0;
        iter[1] = 0;
        iter[2] = 0;
        function fn_goto_50() {
            iter[1] = iter[1] + 1;
            l = iwsv;
            for(i = 1; i <= q; i = i + 1){
                l = l + 1;
                sum = -bvec[i];
                for(j = 1; j <= n; j = j + 1){
                    sum = sum + amat[j][i] * sol[j];
                }
                if (Math.abs(sum) < vsmall) {
                    sum = 0;
                }
                if (i > meq) {
                    work[l] = sum;
                } else {
                    work[l] = -Math.abs(sum);
                    if (sum > 0) {
                        for(j = 1; j <= n; j = j + 1){
                            amat[j][i] = -amat[j][i];
                        }
                        bvec[i] = -bvec[i];
                    }
                }
            }
            for(i = 1; i <= nact; i = i + 1){
                work[iwsv + iact[i]] = 0;
            }
            nvl = 0;
            temp = 0;
            for(i = 1; i <= q; i = i + 1){
                if (work[iwsv + i] < temp * work[iwnbv + i]) {
                    nvl = i;
                    temp = work[iwsv + i] / work[iwnbv + i];
                }
            }
            if (nvl === 0) {
                return 999;
            }
            return 0;
        }
        function fn_goto_55() {
            for(i = 1; i <= n; i = i + 1){
                sum = 0;
                for(j = 1; j <= n; j = j + 1){
                    sum = sum + dmat[j][i] * amat[j][nvl];
                }
                work[i] = sum;
            }
            l1 = iwzv;
            for(i = 1; i <= n; i = i + 1){
                work[l1 + i] = 0;
            }
            for(j = nact + 1; j <= n; j = j + 1){
                for(i = 1; i <= n; i = i + 1){
                    work[l1 + i] = work[l1 + i] + dmat[i][j] * work[j];
                }
            }
            t1inf = true;
            for(i = nact; i >= 1; i = i - 1){
                sum = work[i];
                l = iwrm + i * (i + 3) / 2;
                l1 = l - i;
                for(j = i + 1; j <= nact; j = j + 1){
                    sum = sum - work[l] * work[iwrv + j];
                    l = l + j;
                }
                sum = sum / work[l1];
                work[iwrv + i] = sum;
                if (iact[i] < meq) {
                    break;
                }
                if (sum < 0) {
                    break;
                }
                t1inf = false;
                it1 = i;
            }
            if (!t1inf) {
                t1 = work[iwuv + it1] / work[iwrv + it1];
                for(i = 1; i <= nact; i = i + 1){
                    if (iact[i] < meq) {
                        break;
                    }
                    if (work[iwrv + i] < 0) {
                        break;
                    }
                    temp = work[iwuv + i] / work[iwrv + i];
                    if (temp < t1) {
                        t1 = temp;
                        it1 = i;
                    }
                }
            }
            sum = 0;
            for(i = iwzv + 1; i <= iwzv + n; i = i + 1){
                sum = sum + work[i] * work[i];
            }
            if (Math.abs(sum) <= vsmall) {
                if (t1inf) {
                    ierr[1] = 1;
                    // GOTO 999
                    return 999;
                } else {
                    for(i = 1; i <= nact; i = i + 1){
                        work[iwuv + i] = work[iwuv + i] - t1 * work[iwrv + i];
                    }
                    work[iwuv + nact + 1] = work[iwuv + nact + 1] + t1;
                    // GOTO 700
                    return 700;
                }
            } else {
                sum = 0;
                for(i = 1; i <= n; i = i + 1){
                    sum = sum + work[iwzv + i] * amat[i][nvl];
                }
                tt = -work[iwsv + nvl] / sum;
                t2min = true;
                if (!t1inf) {
                    if (t1 < tt) {
                        tt = t1;
                        t2min = false;
                    }
                }
                for(i = 1; i <= n; i = i + 1){
                    sol[i] = sol[i] + tt * work[iwzv + i];
                    if (Math.abs(sol[i]) < vsmall) {
                        sol[i] = 0;
                    }
                }
                crval[1] = crval[1] + tt * sum * (tt / 2 + work[iwuv + nact + 1]);
                for(i = 1; i <= nact; i = i + 1){
                    work[iwuv + i] = work[iwuv + i] - tt * work[iwrv + i];
                }
                work[iwuv + nact + 1] = work[iwuv + nact + 1] + tt;
                if (t2min) {
                    nact = nact + 1;
                    iact[nact] = nvl;
                    l = iwrm + (nact - 1) * nact / 2 + 1;
                    for(i = 1; i <= nact - 1; i = i + 1){
                        work[l] = work[i];
                        l = l + 1;
                    }
                    if (nact === n) {
                        work[l] = work[n];
                    } else {
                        for(i = n; i >= nact + 1; i = i - 1){
                            if (work[i] === 0) {
                                break;
                            }
                            gc = Math.max(Math.abs(work[i - 1]), Math.abs(work[i]));
                            gs = Math.min(Math.abs(work[i - 1]), Math.abs(work[i]));
                            if (work[i - 1] >= 0) {
                                temp = Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
                            } else {
                                temp = -Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
                            }
                            gc = work[i - 1] / temp;
                            gs = work[i] / temp;
                            if (gc === 1) {
                                break;
                            }
                            if (gc === 0) {
                                work[i - 1] = gs * temp;
                                for(j = 1; j <= n; j = j + 1){
                                    temp = dmat[j][i - 1];
                                    dmat[j][i - 1] = dmat[j][i];
                                    dmat[j][i] = temp;
                                }
                            } else {
                                work[i - 1] = temp;
                                nu = gs / (1 + gc);
                                for(j = 1; j <= n; j = j + 1){
                                    temp = gc * dmat[j][i - 1] + gs * dmat[j][i];
                                    dmat[j][i] = nu * (dmat[j][i - 1] + temp) - dmat[j][i];
                                    dmat[j][i - 1] = temp;
                                }
                            }
                        }
                        work[l] = work[nact];
                    }
                } else {
                    sum = -bvec[nvl];
                    for(j = 1; j <= n; j = j + 1){
                        sum = sum + sol[j] * amat[j][nvl];
                    }
                    if (nvl > meq) {
                        work[iwsv + nvl] = sum;
                    } else {
                        work[iwsv + nvl] = -Math.abs(sum);
                        if (sum > 0) {
                            for(j = 1; j <= n; j = j + 1){
                                amat[j][nvl] = -amat[j][nvl];
                            }
                            bvec[nvl] = -bvec[nvl];
                        }
                    }
                    // GOTO 700
                    return 700;
                }
            }
            return 0;
        }
        function fn_goto_797() {
            l = iwrm + it1 * (it1 + 1) / 2 + 1;
            l1 = l + it1;
            if (work[l1] === 0) {
                // GOTO 798
                return 798;
            }
            gc = Math.max(Math.abs(work[l1 - 1]), Math.abs(work[l1]));
            gs = Math.min(Math.abs(work[l1 - 1]), Math.abs(work[l1]));
            if (work[l1 - 1] >= 0) {
                temp = Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
            } else {
                temp = -Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
            }
            gc = work[l1 - 1] / temp;
            gs = work[l1] / temp;
            if (gc === 1) {
                // GOTO 798
                return 798;
            }
            if (gc === 0) {
                for(i = it1 + 1; i <= nact; i = i + 1){
                    temp = work[l1 - 1];
                    work[l1 - 1] = work[l1];
                    work[l1] = temp;
                    l1 = l1 + i;
                }
                for(i = 1; i <= n; i = i + 1){
                    temp = dmat[i][it1];
                    dmat[i][it1] = dmat[i][it1 + 1];
                    dmat[i][it1 + 1] = temp;
                }
            } else {
                nu = gs / (1 + gc);
                for(i = it1 + 1; i <= nact; i = i + 1){
                    temp = gc * work[l1 - 1] + gs * work[l1];
                    work[l1] = nu * (work[l1 - 1] + temp) - work[l1];
                    work[l1 - 1] = temp;
                    l1 = l1 + i;
                }
                for(i = 1; i <= n; i = i + 1){
                    temp = gc * dmat[i][it1] + gs * dmat[i][it1 + 1];
                    dmat[i][it1 + 1] = nu * (dmat[i][it1] + temp) - dmat[i][it1 + 1];
                    dmat[i][it1] = temp;
                }
            }
            return 0;
        }
        function fn_goto_798() {
            l1 = l - it1;
            for(i = 1; i <= it1; i = i + 1){
                work[l1] = work[l];
                l = l + 1;
                l1 = l1 + 1;
            }
            work[iwuv + it1] = work[iwuv + it1 + 1];
            iact[it1] = iact[it1 + 1];
            it1 = it1 + 1;
            if (it1 < nact) {
                // GOTO 797
                return 797;
            }
            return 0;
        }
        function fn_goto_799() {
            work[iwuv + nact] = work[iwuv + nact + 1];
            work[iwuv + nact + 1] = 0;
            iact[nact] = 0;
            nact = nact - 1;
            iter[2] = iter[2] + 1;
            return 0;
        }
        go = 0;
        while(true){
            go = fn_goto_50();
            if (go === 999) {
                return;
            }
            while(true){
                go = fn_goto_55();
                if (go === 0) {
                    break;
                }
                if (go === 999) {
                    return;
                }
                if (go === 700) {
                    if (it1 === nact) {
                        fn_goto_799();
                    } else {
                        while(true){
                            fn_goto_797();
                            go = fn_goto_798();
                            if (go !== 797) {
                                break;
                            }
                        }
                        fn_goto_799();
                    }
                }
            }
        }
    }
    function solveQP(Dmat, dvec, Amat, bvec, meq, factorized) {
        Dmat = base0to1(Dmat);
        dvec = base0to1(dvec);
        Amat = base0to1(Amat);
        var i, n, q, nact, r, crval = [], iact = [], sol = [], work = [], iter = [], message;
        meq = meq || 0;
        factorized = factorized ? base0to1(factorized) : [
            undefined,
            0
        ];
        bvec = bvec ? base0to1(bvec) : [];
        // In Fortran the array index starts from 1
        n = Dmat.length - 1;
        q = Amat[1].length - 1;
        if (!bvec) {
            for(i = 1; i <= q; i = i + 1){
                bvec[i] = 0;
            }
        }
        for(i = 1; i <= q; i = i + 1){
            iact[i] = 0;
        }
        nact = 0;
        r = Math.min(n, q);
        for(i = 1; i <= n; i = i + 1){
            sol[i] = 0;
        }
        crval[1] = 0;
        for(i = 1; i <= 2 * n + r * (r + 5) / 2 + 2 * q + 1; i = i + 1){
            work[i] = 0;
        }
        for(i = 1; i <= 2; i = i + 1){
            iter[i] = 0;
        }
        qpgen2(Dmat, dvec, n, n, sol, crval, Amat, bvec, n, q, meq, iact, nact, iter, work, factorized);
        message = "";
        if (factorized[1] === 1) {
            message = "constraints are inconsistent, no solution!";
        }
        if (factorized[1] === 2) {
            message = "matrix D in quadratic function is not positive definite!";
        }
        return {
            solution: base1to0(sol),
            value: base1to0(crval),
            unconstrained_solution: base1to0(dvec),
            iterations: base1to0(iter),
            iact: base1to0(iact),
            message: message
        };
    }
    exports1.solveQP = solveQP;
})(numeric);
/*
 Shanti Rao sent me this routine by private email. I had to modify it
 slightly to work on Arrays instead of using a Matrix object.
 It is apparently translated from http://stitchpanorama.sourceforge.net/Python/svd.py
 */ numeric.svd = function svd(A) {
    var temp;
    //Compute the thin SVD from G. H. Golub and C. Reinsch, Numer. Math. 14, 403-420 (1970)
    var prec = numeric.epsilon; //Math.pow(2,-52) // assumes double prec
    var tolerance = 1.e-64 / prec;
    var itmax = 50;
    var c = 0;
    var i = 0;
    var j = 0;
    var k = 0;
    var l = 0;
    var u = numeric.clone(A);
    var m = u.length;
    var n = u[0].length;
    if (m < n) throw "Need more rows than columns";
    var e = new Array(n);
    var q = new Array(n);
    for(i = 0; i < n; i++)e[i] = q[i] = 0.0;
    var v = numeric.rep([
        n,
        n
    ], 0);
    //	v.zero();
    function pythag(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        if (a > b) return a * Math.sqrt(1.0 + b * b / a / a);
        else if (b == 0.0) return a;
        return b * Math.sqrt(1.0 + a * a / b / b);
    }
    //Householder's reduction to bidiagonal form
    var f = 0.0;
    var g = 0.0;
    var h = 0.0;
    var x = 0.0;
    var y = 0.0;
    var z = 0.0;
    var s = 0.0;
    for(i = 0; i < n; i++){
        e[i] = g;
        s = 0.0;
        l = i + 1;
        for(j = i; j < m; j++)s += u[j][i] * u[j][i];
        if (s <= tolerance) g = 0.0;
        else {
            f = u[i][i];
            g = Math.sqrt(s);
            if (f >= 0.0) g = -g;
            h = f * g - s;
            u[i][i] = f - g;
            for(j = l; j < n; j++){
                s = 0.0;
                for(k = i; k < m; k++)s += u[k][i] * u[k][j];
                f = s / h;
                for(k = i; k < m; k++)u[k][j] += f * u[k][i];
            }
        }
        q[i] = g;
        s = 0.0;
        for(j = l; j < n; j++)s = s + u[i][j] * u[i][j];
        if (s <= tolerance) g = 0.0;
        else {
            f = u[i][i + 1];
            g = Math.sqrt(s);
            if (f >= 0.0) g = -g;
            h = f * g - s;
            u[i][i + 1] = f - g;
            for(j = l; j < n; j++)e[j] = u[i][j] / h;
            for(j = l; j < m; j++){
                s = 0.0;
                for(k = l; k < n; k++)s += u[j][k] * u[i][k];
                for(k = l; k < n; k++)u[j][k] += s * e[k];
            }
        }
        y = Math.abs(q[i]) + Math.abs(e[i]);
        if (y > x) x = y;
    }
    // accumulation of right hand gtransformations
    for(i = n - 1; i != -1; i += -1){
        if (g != 0.0) {
            h = g * u[i][i + 1];
            for(j = l; j < n; j++)v[j][i] = u[i][j] / h;
            for(j = l; j < n; j++){
                s = 0.0;
                for(k = l; k < n; k++)s += u[i][k] * v[k][j];
                for(k = l; k < n; k++)v[k][j] += s * v[k][i];
            }
        }
        for(j = l; j < n; j++){
            v[i][j] = 0;
            v[j][i] = 0;
        }
        v[i][i] = 1;
        g = e[i];
        l = i;
    }
    // accumulation of left hand transformations
    for(i = n - 1; i != -1; i += -1){
        l = i + 1;
        g = q[i];
        for(j = l; j < n; j++)u[i][j] = 0;
        if (g != 0.0) {
            h = u[i][i] * g;
            for(j = l; j < n; j++){
                s = 0.0;
                for(k = l; k < m; k++)s += u[k][i] * u[k][j];
                f = s / h;
                for(k = i; k < m; k++)u[k][j] += f * u[k][i];
            }
            for(j = i; j < m; j++)u[j][i] = u[j][i] / g;
        } else for(j = i; j < m; j++)u[j][i] = 0;
        u[i][i] += 1;
    }
    // diagonalization of the bidiagonal form
    prec = prec * x;
    for(k = n - 1; k != -1; k += -1){
        for(var iteration = 0; iteration < itmax; iteration++){
            var test_convergence = false;
            for(l = k; l != -1; l += -1){
                if (Math.abs(e[l]) <= prec) {
                    test_convergence = true;
                    break;
                }
                if (Math.abs(q[l - 1]) <= prec) break;
            }
            if (!test_convergence) {
                c = 0.0;
                s = 1.0;
                var l1 = l - 1;
                for(i = l; i < k + 1; i++){
                    f = s * e[i];
                    e[i] = c * e[i];
                    if (Math.abs(f) <= prec) break;
                    g = q[i];
                    h = pythag(f, g);
                    q[i] = h;
                    c = g / h;
                    s = -f / h;
                    for(j = 0; j < m; j++){
                        y = u[j][l1];
                        z = u[j][i];
                        u[j][l1] = y * c + z * s;
                        u[j][i] = -y * s + z * c;
                    }
                }
            }
            // test f convergence
            z = q[k];
            if (l == k) {
                if (z < 0.0) {
                    q[k] = -z;
                    for(j = 0; j < n; j++)v[j][k] = -v[j][k];
                }
                break; //break out of iteration loop and move on to next k value
            }
            if (iteration >= itmax - 1) throw 'Error: no convergence.';
            // shift from bottom 2x2 minor
            x = q[l];
            y = q[k - 1];
            g = e[k - 1];
            h = e[k];
            f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2.0 * h * y);
            g = pythag(f, 1.0);
            if (f < 0.0) f = ((x - z) * (x + z) + h * (y / (f - g) - h)) / x;
            else f = ((x - z) * (x + z) + h * (y / (f + g) - h)) / x;
            // next QR transformation
            c = 1.0;
            s = 1.0;
            for(i = l + 1; i < k + 1; i++){
                g = e[i];
                y = q[i];
                h = s * g;
                g = c * g;
                z = pythag(f, h);
                e[i - 1] = z;
                c = f / z;
                s = h / z;
                f = x * c + g * s;
                g = -x * s + g * c;
                h = y * s;
                y = y * c;
                for(j = 0; j < n; j++){
                    x = v[j][i - 1];
                    z = v[j][i];
                    v[j][i - 1] = x * c + z * s;
                    v[j][i] = -x * s + z * c;
                }
                z = pythag(f, h);
                q[i - 1] = z;
                c = f / z;
                s = h / z;
                f = c * g + s * y;
                x = -s * g + c * y;
                for(j = 0; j < m; j++){
                    y = u[j][i - 1];
                    z = u[j][i];
                    u[j][i - 1] = y * c + z * s;
                    u[j][i] = -y * s + z * c;
                }
            }
            e[l] = 0.0;
            e[k] = f;
            q[k] = x;
        }
    }
    //vt= transpose(v)
    //return (u,q,vt)
    for(i = 0; i < q.length; i++)if (q[i] < prec) q[i] = 0;
    //sort eigenvalues	
    for(i = 0; i < n; i++){
        //writeln(q)
        for(j = i - 1; j >= 0; j--){
            if (q[j] < q[i]) {
                //  writeln(i,'-',j)
                c = q[j];
                q[j] = q[i];
                q[i] = c;
                for(k = 0; k < u.length; k++){
                    temp = u[k][i];
                    u[k][i] = u[k][j];
                    u[k][j] = temp;
                }
                for(k = 0; k < v.length; k++){
                    temp = v[k][i];
                    v[k][i] = v[k][j];
                    v[k][j] = temp;
                }
                //	   u.swapCols(i,j)
                //	   v.swapCols(i,j)
                i = j;
            }
        }
    }
    return {
        U: u,
        S: q,
        V: v
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvbnVtZXJpYy0xLjIuNi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIG51bWVyaWMgPSAodHlwZW9mIGV4cG9ydHMgPT09IFwidW5kZWZpbmVkXCIpPyhmdW5jdGlvbiBudW1lcmljKCkge30pOihleHBvcnRzKTtcbmlmKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHsgZ2xvYmFsLm51bWVyaWMgPSBudW1lcmljOyB9XG5cbm51bWVyaWMudmVyc2lvbiA9IFwiMS4yLjZcIjtcblxuLy8gMS4gVXRpbGl0eSBmdW5jdGlvbnNcbm51bWVyaWMuYmVuY2ggPSBmdW5jdGlvbiBiZW5jaCAoZixpbnRlcnZhbCkge1xuICB2YXIgdDEsdDIsbixpO1xuICBpZih0eXBlb2YgaW50ZXJ2YWwgPT09IFwidW5kZWZpbmVkXCIpIHsgaW50ZXJ2YWwgPSAxNTsgfVxuICBuID0gMC41O1xuICB0MSA9IG5ldyBEYXRlKCk7XG4gIHdoaWxlKDEpIHtcbiAgICBuKj0yO1xuICAgIGZvcihpPW47aT4zO2ktPTQpIHsgZigpOyBmKCk7IGYoKTsgZigpOyB9XG4gICAgd2hpbGUoaT4wKSB7IGYoKTsgaS0tOyB9XG4gICAgdDIgPSBuZXcgRGF0ZSgpO1xuICAgIGlmKHQyLXQxID4gaW50ZXJ2YWwpIGJyZWFrO1xuICB9XG4gIGZvcihpPW47aT4zO2ktPTQpIHsgZigpOyBmKCk7IGYoKTsgZigpOyB9XG4gIHdoaWxlKGk+MCkgeyBmKCk7IGktLTsgfVxuICB0MiA9IG5ldyBEYXRlKCk7XG4gIHJldHVybiAxMDAwKigzKm4tMSkvKHQyLXQxKTtcbn1cblxubnVtZXJpYy5fbXlJbmRleE9mID0gKGZ1bmN0aW9uIF9teUluZGV4T2Yodykge1xuICB2YXIgbiA9IHRoaXMubGVuZ3RoLGs7XG4gIGZvcihrPTA7azxuOysraykgaWYodGhpc1trXT09PXcpIHJldHVybiBrO1xuICByZXR1cm4gLTE7XG59KTtcbm51bWVyaWMubXlJbmRleE9mID0gKEFycmF5LnByb3RvdHlwZS5pbmRleE9mKT9BcnJheS5wcm90b3R5cGUuaW5kZXhPZjpudW1lcmljLl9teUluZGV4T2Y7XG5cbm51bWVyaWMuRnVuY3Rpb24gPSBGdW5jdGlvbjtcbm51bWVyaWMucHJlY2lzaW9uID0gNDtcbm51bWVyaWMubGFyZ2VBcnJheSA9IDUwO1xuXG5udW1lcmljLnByZXR0eVByaW50ID0gZnVuY3Rpb24gcHJldHR5UHJpbnQoeCkge1xuICBmdW5jdGlvbiBmbXRudW0oeCkge1xuICAgIGlmKHggPT09IDApIHsgcmV0dXJuICcwJzsgfVxuICAgIGlmKGlzTmFOKHgpKSB7IHJldHVybiAnTmFOJzsgfVxuICAgIGlmKHg8MCkgeyByZXR1cm4gJy0nK2ZtdG51bSgteCk7IH1cbiAgICBpZihpc0Zpbml0ZSh4KSkge1xuICAgICAgdmFyIHNjYWxlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh4KSAvIE1hdGgubG9nKDEwKSk7XG4gICAgICB2YXIgbm9ybWFsaXplZCA9IHggLyBNYXRoLnBvdygxMCxzY2FsZSk7XG4gICAgICB2YXIgYmFzaWMgPSBub3JtYWxpemVkLnRvUHJlY2lzaW9uKG51bWVyaWMucHJlY2lzaW9uKTtcbiAgICAgIGlmKHBhcnNlRmxvYXQoYmFzaWMpID09PSAxMCkgeyBzY2FsZSsrOyBub3JtYWxpemVkID0gMTsgYmFzaWMgPSBub3JtYWxpemVkLnRvUHJlY2lzaW9uKG51bWVyaWMucHJlY2lzaW9uKTsgfVxuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYmFzaWMpLnRvU3RyaW5nKCkrJ2UnK3NjYWxlLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiAnSW5maW5pdHknO1xuICB9XG4gIHZhciByZXQgPSBbXTtcbiAgZnVuY3Rpb24gZm9vKHgpIHtcbiAgICB2YXIgaztcbiAgICBpZih0eXBlb2YgeCA9PT0gXCJ1bmRlZmluZWRcIikgeyByZXQucHVzaChBcnJheShudW1lcmljLnByZWNpc2lvbis4KS5qb2luKCcgJykpOyByZXR1cm4gZmFsc2U7IH1cbiAgICBpZih0eXBlb2YgeCA9PT0gXCJzdHJpbmdcIikgeyByZXQucHVzaCgnXCInK3grJ1wiJyk7IHJldHVybiBmYWxzZTsgfVxuICAgIGlmKHR5cGVvZiB4ID09PSBcImJvb2xlYW5cIikgeyByZXQucHVzaCh4LnRvU3RyaW5nKCkpOyByZXR1cm4gZmFsc2U7IH1cbiAgICBpZih0eXBlb2YgeCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgdmFyIGEgPSBmbXRudW0oeCk7XG4gICAgICB2YXIgYiA9IHgudG9QcmVjaXNpb24obnVtZXJpYy5wcmVjaXNpb24pO1xuICAgICAgdmFyIGMgPSBwYXJzZUZsb2F0KHgudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcbiAgICAgIHZhciBkID0gW2EsYixjLHBhcnNlRmxvYXQoYikudG9TdHJpbmcoKSxwYXJzZUZsb2F0KGMpLnRvU3RyaW5nKCldO1xuICAgICAgZm9yKGs9MTtrPGQubGVuZ3RoO2srKykgeyBpZihkW2tdLmxlbmd0aCA8IGEubGVuZ3RoKSBhID0gZFtrXTsgfVxuICAgICAgcmV0LnB1c2goQXJyYXkobnVtZXJpYy5wcmVjaXNpb24rOC1hLmxlbmd0aCkuam9pbignICcpK2EpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZih4ID09PSBudWxsKSB7IHJldC5wdXNoKFwibnVsbFwiKTsgcmV0dXJuIGZhbHNlOyB9XG4gICAgaWYodHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0LnB1c2goeC50b1N0cmluZygpKTtcbiAgICAgIHZhciBmbGFnID0gZmFsc2U7XG4gICAgICBmb3IoayBpbiB4KSB7IGlmKHguaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgaWYoZmxhZykgcmV0LnB1c2goJyxcXG4nKTtcbiAgICAgICAgZWxzZSByZXQucHVzaCgnXFxueycpO1xuICAgICAgICBmbGFnID0gdHJ1ZTtcbiAgICAgICAgcmV0LnB1c2goayk7XG4gICAgICAgIHJldC5wdXNoKCc6IFxcbicpO1xuICAgICAgICBmb28oeFtrXSk7XG4gICAgICB9IH1cbiAgICAgIGlmKGZsYWcpIHJldC5wdXNoKCd9XFxuJyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYoeCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBpZih4Lmxlbmd0aCA+IG51bWVyaWMubGFyZ2VBcnJheSkgeyByZXQucHVzaCgnLi4uTGFyZ2UgQXJyYXkuLi4nKTsgcmV0dXJuIHRydWU7IH1cbiAgICAgIHZhciBmbGFnID0gZmFsc2U7XG4gICAgICByZXQucHVzaCgnWycpO1xuICAgICAgZm9yKGs9MDtrPHgubGVuZ3RoO2srKykgeyBpZihrPjApIHsgcmV0LnB1c2goJywnKTsgaWYoZmxhZykgcmV0LnB1c2goJ1xcbiAnKTsgfSBmbGFnID0gZm9vKHhba10pOyB9XG4gICAgICByZXQucHVzaCgnXScpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldC5wdXNoKCd7Jyk7XG4gICAgdmFyIGZsYWcgPSBmYWxzZTtcbiAgICBmb3IoayBpbiB4KSB7IGlmKHguaGFzT3duUHJvcGVydHkoaykpIHsgaWYoZmxhZykgcmV0LnB1c2goJyxcXG4nKTsgZmxhZyA9IHRydWU7IHJldC5wdXNoKGspOyByZXQucHVzaCgnOiBcXG4nKTsgZm9vKHhba10pOyB9IH1cbiAgICByZXQucHVzaCgnfScpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGZvbyh4KTtcbiAgcmV0dXJuIHJldC5qb2luKCcnKTtcbn1cblxubnVtZXJpYy5wYXJzZURhdGUgPSBmdW5jdGlvbiBwYXJzZURhdGUoZCkge1xuICBmdW5jdGlvbiBmb28oZCkge1xuICAgIGlmKHR5cGVvZiBkID09PSAnc3RyaW5nJykgeyByZXR1cm4gRGF0ZS5wYXJzZShkLnJlcGxhY2UoLy0vZywnLycpKTsgfVxuICAgIGlmKCEoZCBpbnN0YW5jZW9mIEFycmF5KSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJwYXJzZURhdGU6IHBhcmFtZXRlciBtdXN0IGJlIGFycmF5cyBvZiBzdHJpbmdzXCIpOyB9XG4gICAgdmFyIHJldCA9IFtdLGs7XG4gICAgZm9yKGs9MDtrPGQubGVuZ3RoO2srKykgeyByZXRba10gPSBmb28oZFtrXSk7IH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHJldHVybiBmb28oZCk7XG59XG5cbm51bWVyaWMucGFyc2VGbG9hdCA9IGZ1bmN0aW9uIHBhcnNlRmxvYXRfKGQpIHtcbiAgZnVuY3Rpb24gZm9vKGQpIHtcbiAgICBpZih0eXBlb2YgZCA9PT0gJ3N0cmluZycpIHsgcmV0dXJuIHBhcnNlRmxvYXQoZCk7IH1cbiAgICBpZighKGQgaW5zdGFuY2VvZiBBcnJheSkpIHsgdGhyb3cgbmV3IEVycm9yKFwicGFyc2VGbG9hdDogcGFyYW1ldGVyIG11c3QgYmUgYXJyYXlzIG9mIHN0cmluZ3NcIik7IH1cbiAgICB2YXIgcmV0ID0gW10saztcbiAgICBmb3Ioaz0wO2s8ZC5sZW5ndGg7aysrKSB7IHJldFtrXSA9IGZvbyhkW2tdKTsgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgcmV0dXJuIGZvbyhkKTtcbn1cblxubnVtZXJpYy5wYXJzZUNTViA9IGZ1bmN0aW9uIHBhcnNlQ1NWKHQpIHtcbiAgdmFyIGZvbyA9IHQuc3BsaXQoJ1xcbicpO1xuICB2YXIgaixrO1xuICB2YXIgcmV0ID0gW107XG4gIHZhciBwYXQgPSAvKChbXidcIixdKil8KCdbXiddKicpfChcIlteXCJdKlwiKSksL2c7XG4gIHZhciBwYXRudW0gPSAvXlxccyooKFsrLV0/WzAtOV0rKFxcLlswLTldKik/KGVbKy1dP1swLTldKyk/KXwoWystXT9bMC05XSooXFwuWzAtOV0rKT8oZVsrLV0/WzAtOV0rKT8pKVxccyokLztcbiAgdmFyIHN0cmlwcGVyID0gZnVuY3Rpb24obikgeyByZXR1cm4gbi5zdWJzdHIoMCxuLmxlbmd0aC0xKTsgfVxuICB2YXIgY291bnQgPSAwO1xuICBmb3Ioaz0wO2s8Zm9vLmxlbmd0aDtrKyspIHtcbiAgICB2YXIgYmFyID0gKGZvb1trXStcIixcIikubWF0Y2gocGF0KSxiYXo7XG4gICAgaWYoYmFyLmxlbmd0aD4wKSB7XG4gICAgICByZXRbY291bnRdID0gW107XG4gICAgICBmb3Ioaj0wO2o8YmFyLmxlbmd0aDtqKyspIHtcbiAgICAgICAgYmF6ID0gc3RyaXBwZXIoYmFyW2pdKTtcbiAgICAgICAgaWYocGF0bnVtLnRlc3QoYmF6KSkgeyByZXRbY291bnRdW2pdID0gcGFyc2VGbG9hdChiYXopOyB9XG4gICAgICAgIGVsc2UgcmV0W2NvdW50XVtqXSA9IGJhejtcbiAgICAgIH1cbiAgICAgIGNvdW50Kys7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbm51bWVyaWMudG9DU1YgPSBmdW5jdGlvbiB0b0NTVihBKSB7XG4gIHZhciBzID0gbnVtZXJpYy5kaW0oQSk7XG4gIHZhciBpLGosbSxuLHJvdyxyZXQ7XG4gIG0gPSBzWzBdO1xuICBuID0gc1sxXTtcbiAgcmV0ID0gW107XG4gIGZvcihpPTA7aTxtO2krKykge1xuICAgIHJvdyA9IFtdO1xuICAgIGZvcihqPTA7ajxtO2orKykgeyByb3dbal0gPSBBW2ldW2pdLnRvU3RyaW5nKCk7IH1cbiAgICByZXRbaV0gPSByb3cuam9pbignLCAnKTtcbiAgfVxuICByZXR1cm4gcmV0LmpvaW4oJ1xcbicpKydcXG4nO1xufVxuXG5udW1lcmljLmdldFVSTCA9IGZ1bmN0aW9uIGdldFVSTCh1cmwpIHtcbiAgdmFyIGNsaWVudCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICBjbGllbnQub3BlbihcIkdFVFwiLHVybCxmYWxzZSk7XG4gIGNsaWVudC5zZW5kKCk7XG4gIHJldHVybiBjbGllbnQ7XG59XG5cbm51bWVyaWMuaW1hZ2VVUkwgPSBmdW5jdGlvbiBpbWFnZVVSTChpbWcpIHtcbiAgZnVuY3Rpb24gYmFzZTY0KEEpIHtcbiAgICB2YXIgbiA9IEEubGVuZ3RoLCBpLHgseSx6LHAscSxyLHM7XG4gICAgdmFyIGtleSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIjtcbiAgICB2YXIgcmV0ID0gXCJcIjtcbiAgICBmb3IoaT0wO2k8bjtpKz0zKSB7XG4gICAgICB4ID0gQVtpXTtcbiAgICAgIHkgPSBBW2krMV07XG4gICAgICB6ID0gQVtpKzJdO1xuICAgICAgcCA9IHggPj4gMjtcbiAgICAgIHEgPSAoKHggJiAzKSA8PCA0KSArICh5ID4+IDQpO1xuICAgICAgciA9ICgoeSAmIDE1KSA8PCAyKSArICh6ID4+IDYpO1xuICAgICAgcyA9IHogJiA2MztcbiAgICAgIGlmKGkrMT49bikgeyByID0gcyA9IDY0OyB9XG4gICAgICBlbHNlIGlmKGkrMj49bikgeyBzID0gNjQ7IH1cbiAgICAgIHJldCArPSBrZXkuY2hhckF0KHApICsga2V5LmNoYXJBdChxKSArIGtleS5jaGFyQXQocikgKyBrZXkuY2hhckF0KHMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGZ1bmN0aW9uIGNyYzMyQXJyYXkgKGEsZnJvbSx0bykge1xuICAgIGlmKHR5cGVvZiBmcm9tID09PSBcInVuZGVmaW5lZFwiKSB7IGZyb20gPSAwOyB9XG4gICAgaWYodHlwZW9mIHRvID09PSBcInVuZGVmaW5lZFwiKSB7IHRvID0gYS5sZW5ndGg7IH1cbiAgICB2YXIgdGFibGUgPSBbMHgwMDAwMDAwMCwgMHg3NzA3MzA5NiwgMHhFRTBFNjEyQywgMHg5OTA5NTFCQSwgMHgwNzZEQzQxOSwgMHg3MDZBRjQ4RiwgMHhFOTYzQTUzNSwgMHg5RTY0OTVBMyxcbiAgICAgIDB4MEVEQjg4MzIsIDB4NzlEQ0I4QTQsIDB4RTBENUU5MUUsIDB4OTdEMkQ5ODgsIDB4MDlCNjRDMkIsIDB4N0VCMTdDQkQsIDB4RTdCODJEMDcsIDB4OTBCRjFEOTEsXG4gICAgICAweDFEQjcxMDY0LCAweDZBQjAyMEYyLCAweEYzQjk3MTQ4LCAweDg0QkU0MURFLCAweDFBREFENDdELCAweDZERERFNEVCLCAweEY0RDRCNTUxLCAweDgzRDM4NUM3LFxuICAgICAgMHgxMzZDOTg1NiwgMHg2NDZCQThDMCwgMHhGRDYyRjk3QSwgMHg4QTY1QzlFQywgMHgxNDAxNUM0RiwgMHg2MzA2NkNEOSwgMHhGQTBGM0Q2MywgMHg4RDA4MERGNSxcbiAgICAgIDB4M0I2RTIwQzgsIDB4NEM2OTEwNUUsIDB4RDU2MDQxRTQsIDB4QTI2NzcxNzIsIDB4M0MwM0U0RDEsIDB4NEIwNEQ0NDcsIDB4RDIwRDg1RkQsIDB4QTUwQUI1NkIsXG4gICAgICAweDM1QjVBOEZBLCAweDQyQjI5ODZDLCAweERCQkJDOUQ2LCAweEFDQkNGOTQwLCAweDMyRDg2Q0UzLCAweDQ1REY1Qzc1LCAweERDRDYwRENGLCAweEFCRDEzRDU5LFxuICAgICAgMHgyNkQ5MzBBQywgMHg1MURFMDAzQSwgMHhDOEQ3NTE4MCwgMHhCRkQwNjExNiwgMHgyMUI0RjRCNSwgMHg1NkIzQzQyMywgMHhDRkJBOTU5OSwgMHhCOEJEQTUwRixcbiAgICAgIDB4MjgwMkI4OUUsIDB4NUYwNTg4MDgsIDB4QzYwQ0Q5QjIsIDB4QjEwQkU5MjQsIDB4MkY2RjdDODcsIDB4NTg2ODRDMTEsIDB4QzE2MTFEQUIsIDB4QjY2NjJEM0QsXG4gICAgICAweDc2REM0MTkwLCAweDAxREI3MTA2LCAweDk4RDIyMEJDLCAweEVGRDUxMDJBLCAweDcxQjE4NTg5LCAweDA2QjZCNTFGLCAweDlGQkZFNEE1LCAweEU4QjhENDMzLFxuICAgICAgMHg3ODA3QzlBMiwgMHgwRjAwRjkzNCwgMHg5NjA5QTg4RSwgMHhFMTBFOTgxOCwgMHg3RjZBMERCQiwgMHgwODZEM0QyRCwgMHg5MTY0NkM5NywgMHhFNjYzNUMwMSxcbiAgICAgIDB4NkI2QjUxRjQsIDB4MUM2QzYxNjIsIDB4ODU2NTMwRDgsIDB4RjI2MjAwNEUsIDB4NkMwNjk1RUQsIDB4MUIwMUE1N0IsIDB4ODIwOEY0QzEsIDB4RjUwRkM0NTcsXG4gICAgICAweDY1QjBEOUM2LCAweDEyQjdFOTUwLCAweDhCQkVCOEVBLCAweEZDQjk4ODdDLCAweDYyREQxRERGLCAweDE1REEyRDQ5LCAweDhDRDM3Q0YzLCAweEZCRDQ0QzY1LFxuICAgICAgMHg0REIyNjE1OCwgMHgzQUI1NTFDRSwgMHhBM0JDMDA3NCwgMHhENEJCMzBFMiwgMHg0QURGQTU0MSwgMHgzREQ4OTVENywgMHhBNEQxQzQ2RCwgMHhEM0Q2RjRGQixcbiAgICAgIDB4NDM2OUU5NkEsIDB4MzQ2RUQ5RkMsIDB4QUQ2Nzg4NDYsIDB4REE2MEI4RDAsIDB4NDQwNDJENzMsIDB4MzMwMzFERTUsIDB4QUEwQTRDNUYsIDB4REQwRDdDQzksXG4gICAgICAweDUwMDU3MTNDLCAweDI3MDI0MUFBLCAweEJFMEIxMDEwLCAweEM5MEMyMDg2LCAweDU3NjhCNTI1LCAweDIwNkY4NUIzLCAweEI5NjZENDA5LCAweENFNjFFNDlGLFxuICAgICAgMHg1RURFRjkwRSwgMHgyOUQ5Qzk5OCwgMHhCMEQwOTgyMiwgMHhDN0Q3QThCNCwgMHg1OUIzM0QxNywgMHgyRUI0MEQ4MSwgMHhCN0JENUMzQiwgMHhDMEJBNkNBRCxcbiAgICAgIDB4RURCODgzMjAsIDB4OUFCRkIzQjYsIDB4MDNCNkUyMEMsIDB4NzRCMUQyOUEsIDB4RUFENTQ3MzksIDB4OUREMjc3QUYsIDB4MDREQjI2MTUsIDB4NzNEQzE2ODMsXG4gICAgICAweEUzNjMwQjEyLCAweDk0NjQzQjg0LCAweDBENkQ2QTNFLCAweDdBNkE1QUE4LCAweEU0MEVDRjBCLCAweDkzMDlGRjlELCAweDBBMDBBRTI3LCAweDdEMDc5RUIxLFxuICAgICAgMHhGMDBGOTM0NCwgMHg4NzA4QTNEMiwgMHgxRTAxRjI2OCwgMHg2OTA2QzJGRSwgMHhGNzYyNTc1RCwgMHg4MDY1NjdDQiwgMHgxOTZDMzY3MSwgMHg2RTZCMDZFNyxcbiAgICAgIDB4RkVENDFCNzYsIDB4ODlEMzJCRTAsIDB4MTBEQTdBNUEsIDB4NjdERDRBQ0MsIDB4RjlCOURGNkYsIDB4OEVCRUVGRjksIDB4MTdCN0JFNDMsIDB4NjBCMDhFRDUsXG4gICAgICAweEQ2RDZBM0U4LCAweEExRDE5MzdFLCAweDM4RDhDMkM0LCAweDRGREZGMjUyLCAweEQxQkI2N0YxLCAweEE2QkM1NzY3LCAweDNGQjUwNkRELCAweDQ4QjIzNjRCLFxuICAgICAgMHhEODBEMkJEQSwgMHhBRjBBMUI0QywgMHgzNjAzNEFGNiwgMHg0MTA0N0E2MCwgMHhERjYwRUZDMywgMHhBODY3REY1NSwgMHgzMTZFOEVFRiwgMHg0NjY5QkU3OSxcbiAgICAgIDB4Q0I2MUIzOEMsIDB4QkM2NjgzMUEsIDB4MjU2RkQyQTAsIDB4NTI2OEUyMzYsIDB4Q0MwQzc3OTUsIDB4QkIwQjQ3MDMsIDB4MjIwMjE2QjksIDB4NTUwNTI2MkYsXG4gICAgICAweEM1QkEzQkJFLCAweEIyQkQwQjI4LCAweDJCQjQ1QTkyLCAweDVDQjM2QTA0LCAweEMyRDdGRkE3LCAweEI1RDBDRjMxLCAweDJDRDk5RThCLCAweDVCREVBRTFELFxuICAgICAgMHg5QjY0QzJCMCwgMHhFQzYzRjIyNiwgMHg3NTZBQTM5QywgMHgwMjZEOTMwQSwgMHg5QzA5MDZBOSwgMHhFQjBFMzYzRiwgMHg3MjA3Njc4NSwgMHgwNTAwNTcxMyxcbiAgICAgIDB4OTVCRjRBODIsIDB4RTJCODdBMTQsIDB4N0JCMTJCQUUsIDB4MENCNjFCMzgsIDB4OTJEMjhFOUIsIDB4RTVENUJFMEQsIDB4N0NEQ0VGQjcsIDB4MEJEQkRGMjEsXG4gICAgICAweDg2RDNEMkQ0LCAweEYxRDRFMjQyLCAweDY4RERCM0Y4LCAweDFGREE4MzZFLCAweDgxQkUxNkNELCAweEY2QjkyNjVCLCAweDZGQjA3N0UxLCAweDE4Qjc0Nzc3LFxuICAgICAgMHg4ODA4NUFFNiwgMHhGRjBGNkE3MCwgMHg2NjA2M0JDQSwgMHgxMTAxMEI1QywgMHg4RjY1OUVGRiwgMHhGODYyQUU2OSwgMHg2MTZCRkZEMywgMHgxNjZDQ0Y0NSxcbiAgICAgIDB4QTAwQUUyNzgsIDB4RDcwREQyRUUsIDB4NEUwNDgzNTQsIDB4MzkwM0IzQzIsIDB4QTc2NzI2NjEsIDB4RDA2MDE2RjcsIDB4NDk2OTQ3NEQsIDB4M0U2RTc3REIsXG4gICAgICAweEFFRDE2QTRBLCAweEQ5RDY1QURDLCAweDQwREYwQjY2LCAweDM3RDgzQkYwLCAweEE5QkNBRTUzLCAweERFQkI5RUM1LCAweDQ3QjJDRjdGLCAweDMwQjVGRkU5LFxuICAgICAgMHhCREJERjIxQywgMHhDQUJBQzI4QSwgMHg1M0IzOTMzMCwgMHgyNEI0QTNBNiwgMHhCQUQwMzYwNSwgMHhDREQ3MDY5MywgMHg1NERFNTcyOSwgMHgyM0Q5NjdCRixcbiAgICAgIDB4QjM2NjdBMkUsIDB4QzQ2MTRBQjgsIDB4NUQ2ODFCMDIsIDB4MkE2RjJCOTQsIDB4QjQwQkJFMzcsIDB4QzMwQzhFQTEsIDB4NUEwNURGMUIsIDB4MkQwMkVGOERdO1xuXG4gICAgdmFyIGNyYyA9IC0xLCB5ID0gMCwgbiA9IGEubGVuZ3RoLGk7XG5cbiAgICBmb3IgKGkgPSBmcm9tOyBpIDwgdG87IGkrKykge1xuICAgICAgeSA9IChjcmMgXiBhW2ldKSAmIDB4RkY7XG4gICAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlW3ldO1xuICAgIH1cblxuICAgIHJldHVybiBjcmMgXiAoLTEpO1xuICB9XG5cbiAgdmFyIGggPSBpbWdbMF0ubGVuZ3RoLCB3ID0gaW1nWzBdWzBdLmxlbmd0aCwgczEsIHMyLCBuZXh0LGssbGVuZ3RoLGEsYixpLGosYWRsZXIzMixjcmMzMjtcbiAgdmFyIHN0cmVhbSA9IFtcbiAgICAxMzcsIDgwLCA3OCwgNzEsIDEzLCAxMCwgMjYsIDEwLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAwOiBQTkcgc2lnbmF0dXJlXG4gICAgMCwwLDAsMTMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgODogSUhEUiBDaHVuayBsZW5ndGhcbiAgICA3MywgNzIsIDY4LCA4MiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEyOiBcIklIRFJcIiBcbiAgICAodyA+PiAyNCkgJiAyNTUsICh3ID4+IDE2KSAmIDI1NSwgKHcgPj4gOCkgJiAyNTUsIHcmMjU1LCAgIC8vIDE2OiBXaWR0aFxuICAgIChoID4+IDI0KSAmIDI1NSwgKGggPj4gMTYpICYgMjU1LCAoaCA+PiA4KSAmIDI1NSwgaCYyNTUsICAgLy8gMjA6IEhlaWdodFxuICAgIDgsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMjQ6IGJpdCBkZXB0aFxuICAgIDIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMjU6IFJHQlxuICAgIDAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMjY6IGRlZmxhdGVcbiAgICAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDI3OiBubyBmaWx0ZXJcbiAgICAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDI4OiBubyBpbnRlcmxhY2VcbiAgICAtMSwtMiwtMywtNCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDI5OiBDUkNcbiAgICAtNSwtNiwtNywtOCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMzOiBJREFUIENodW5rIGxlbmd0aFxuICAgIDczLCA2OCwgNjUsIDg0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMzc6IFwiSURBVFwiXG4gICAgLy8gUkZDIDE5NTAgaGVhZGVyIHN0YXJ0cyBoZXJlXG4gICAgOCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA0MTogUkZDMTk1MCBDTUZcbiAgICAyOSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDQyOiBSRkMxOTUwIEZMR1xuICBdO1xuICBjcmMzMiA9IGNyYzMyQXJyYXkoc3RyZWFtLDEyLDI5KTtcbiAgc3RyZWFtWzI5XSA9IChjcmMzMj4+MjQpJjI1NTtcbiAgc3RyZWFtWzMwXSA9IChjcmMzMj4+MTYpJjI1NTtcbiAgc3RyZWFtWzMxXSA9IChjcmMzMj4+OCkmMjU1O1xuICBzdHJlYW1bMzJdID0gKGNyYzMyKSYyNTU7XG4gIHMxID0gMTtcbiAgczIgPSAwO1xuICBmb3IoaT0wO2k8aDtpKyspIHtcbiAgICBpZihpPGgtMSkgeyBzdHJlYW0ucHVzaCgwKTsgfVxuICAgIGVsc2UgeyBzdHJlYW0ucHVzaCgxKTsgfVxuICAgIGEgPSAoMyp3KzErKGk9PT0wKSkmMjU1OyBiID0gKCgzKncrMSsoaT09PTApKT4+OCkmMjU1O1xuICAgIHN0cmVhbS5wdXNoKGEpOyBzdHJlYW0ucHVzaChiKTtcbiAgICBzdHJlYW0ucHVzaCgofmEpJjI1NSk7IHN0cmVhbS5wdXNoKCh+YikmMjU1KTtcbiAgICBpZihpPT09MCkgc3RyZWFtLnB1c2goMCk7XG4gICAgZm9yKGo9MDtqPHc7aisrKSB7XG4gICAgICBmb3Ioaz0wO2s8MztrKyspIHtcbiAgICAgICAgYSA9IGltZ1trXVtpXVtqXTtcbiAgICAgICAgaWYoYT4yNTUpIGEgPSAyNTU7XG4gICAgICAgIGVsc2UgaWYoYTwwKSBhPTA7XG4gICAgICAgIGVsc2UgYSA9IE1hdGgucm91bmQoYSk7XG4gICAgICAgIHMxID0gKHMxICsgYSApJTY1NTIxO1xuICAgICAgICBzMiA9IChzMiArIHMxKSU2NTUyMTtcbiAgICAgICAgc3RyZWFtLnB1c2goYSk7XG4gICAgICB9XG4gICAgfVxuICAgIHN0cmVhbS5wdXNoKDApO1xuICB9XG4gIGFkbGVyMzIgPSAoczI8PDE2KStzMTtcbiAgc3RyZWFtLnB1c2goKGFkbGVyMzI+PjI0KSYyNTUpO1xuICBzdHJlYW0ucHVzaCgoYWRsZXIzMj4+MTYpJjI1NSk7XG4gIHN0cmVhbS5wdXNoKChhZGxlcjMyPj44KSYyNTUpO1xuICBzdHJlYW0ucHVzaCgoYWRsZXIzMikmMjU1KTtcbiAgbGVuZ3RoID0gc3RyZWFtLmxlbmd0aCAtIDQxO1xuICBzdHJlYW1bMzNdID0gKGxlbmd0aD4+MjQpJjI1NTtcbiAgc3RyZWFtWzM0XSA9IChsZW5ndGg+PjE2KSYyNTU7XG4gIHN0cmVhbVszNV0gPSAobGVuZ3RoPj44KSYyNTU7XG4gIHN0cmVhbVszNl0gPSAobGVuZ3RoKSYyNTU7XG4gIGNyYzMyID0gY3JjMzJBcnJheShzdHJlYW0sMzcpO1xuICBzdHJlYW0ucHVzaCgoY3JjMzI+PjI0KSYyNTUpO1xuICBzdHJlYW0ucHVzaCgoY3JjMzI+PjE2KSYyNTUpO1xuICBzdHJlYW0ucHVzaCgoY3JjMzI+PjgpJjI1NSk7XG4gIHN0cmVhbS5wdXNoKChjcmMzMikmMjU1KTtcbiAgc3RyZWFtLnB1c2goMCk7XG4gIHN0cmVhbS5wdXNoKDApO1xuICBzdHJlYW0ucHVzaCgwKTtcbiAgc3RyZWFtLnB1c2goMCk7XG4vLyAgICBhID0gc3RyZWFtLmxlbmd0aDtcbiAgc3RyZWFtLnB1c2goNzMpOyAgLy8gSVxuICBzdHJlYW0ucHVzaCg2OSk7ICAvLyBFXG4gIHN0cmVhbS5wdXNoKDc4KTsgIC8vIE5cbiAgc3RyZWFtLnB1c2goNjgpOyAgLy8gRFxuICBzdHJlYW0ucHVzaCgxNzQpOyAvLyBDUkMxXG4gIHN0cmVhbS5wdXNoKDY2KTsgIC8vIENSQzJcbiAgc3RyZWFtLnB1c2goOTYpOyAgLy8gQ1JDM1xuICBzdHJlYW0ucHVzaCgxMzApOyAvLyBDUkM0XG4gIHJldHVybiAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcrYmFzZTY0KHN0cmVhbSk7XG59XG5cbi8vIDIuIExpbmVhciBhbGdlYnJhIHdpdGggQXJyYXlzLlxubnVtZXJpYy5fZGltID0gZnVuY3Rpb24gX2RpbSh4KSB7XG4gIHZhciByZXQgPSBbXTtcbiAgd2hpbGUodHlwZW9mIHggPT09IFwib2JqZWN0XCIpIHsgcmV0LnB1c2goeC5sZW5ndGgpOyB4ID0geFswXTsgfVxuICByZXR1cm4gcmV0O1xufVxuXG5udW1lcmljLmRpbSA9IGZ1bmN0aW9uIGRpbSh4KSB7XG4gIHZhciB5LHo7XG4gIGlmKHR5cGVvZiB4ID09PSBcIm9iamVjdFwiKSB7XG4gICAgeSA9IHhbMF07XG4gICAgaWYodHlwZW9mIHkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHogPSB5WzBdO1xuICAgICAgaWYodHlwZW9mIHogPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIG51bWVyaWMuX2RpbSh4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbeC5sZW5ndGgseS5sZW5ndGhdO1xuICAgIH1cbiAgICByZXR1cm4gW3gubGVuZ3RoXTtcbiAgfVxuICByZXR1cm4gW107XG59XG5cbm51bWVyaWMubWFwcmVkdWNlID0gZnVuY3Rpb24gbWFwcmVkdWNlKGJvZHksaW5pdCkge1xuICByZXR1cm4gRnVuY3Rpb24oJ3gnLCdhY2N1bScsJ19zJywnX2snLFxuICAgICdpZih0eXBlb2YgYWNjdW0gPT09IFwidW5kZWZpbmVkXCIpIGFjY3VtID0gJytpbml0Kyc7XFxuJytcbiAgICAnaWYodHlwZW9mIHggPT09IFwibnVtYmVyXCIpIHsgdmFyIHhpID0geDsgJytib2R5Kyc7IHJldHVybiBhY2N1bTsgfVxcbicrXG4gICAgJ2lmKHR5cGVvZiBfcyA9PT0gXCJ1bmRlZmluZWRcIikgX3MgPSBudW1lcmljLmRpbSh4KTtcXG4nK1xuICAgICdpZih0eXBlb2YgX2sgPT09IFwidW5kZWZpbmVkXCIpIF9rID0gMDtcXG4nK1xuICAgICd2YXIgX24gPSBfc1tfa107XFxuJytcbiAgICAndmFyIGkseGk7XFxuJytcbiAgICAnaWYoX2sgPCBfcy5sZW5ndGgtMSkge1xcbicrXG4gICAgJyAgICBmb3IoaT1fbi0xO2k+PTA7aS0tKSB7XFxuJytcbiAgICAnICAgICAgICBhY2N1bSA9IGFyZ3VtZW50cy5jYWxsZWUoeFtpXSxhY2N1bSxfcyxfaysxKTtcXG4nK1xuICAgICcgICAgfScrXG4gICAgJyAgICByZXR1cm4gYWNjdW07XFxuJytcbiAgICAnfVxcbicrXG4gICAgJ2ZvcihpPV9uLTE7aT49MTtpLT0yKSB7IFxcbicrXG4gICAgJyAgICB4aSA9IHhbaV07XFxuJytcbiAgICAnICAgICcrYm9keSsnO1xcbicrXG4gICAgJyAgICB4aSA9IHhbaS0xXTtcXG4nK1xuICAgICcgICAgJytib2R5Kyc7XFxuJytcbiAgICAnfVxcbicrXG4gICAgJ2lmKGkgPT09IDApIHtcXG4nK1xuICAgICcgICAgeGkgPSB4W2ldO1xcbicrXG4gICAgJyAgICAnK2JvZHkrJ1xcbicrXG4gICAgJ31cXG4nK1xuICAgICdyZXR1cm4gYWNjdW07J1xuICApO1xufVxubnVtZXJpYy5tYXByZWR1Y2UyID0gZnVuY3Rpb24gbWFwcmVkdWNlMihib2R5LHNldHVwKSB7XG4gIHJldHVybiBGdW5jdGlvbigneCcsXG4gICAgJ3ZhciBuID0geC5sZW5ndGg7XFxuJytcbiAgICAndmFyIGkseGk7XFxuJytzZXR1cCsnO1xcbicrXG4gICAgJ2ZvcihpPW4tMTtpIT09LTE7LS1pKSB7IFxcbicrXG4gICAgJyAgICB4aSA9IHhbaV07XFxuJytcbiAgICAnICAgICcrYm9keSsnO1xcbicrXG4gICAgJ31cXG4nK1xuICAgICdyZXR1cm4gYWNjdW07J1xuICApO1xufVxuXG5cbm51bWVyaWMuc2FtZSA9IGZ1bmN0aW9uIHNhbWUoeCx5KSB7XG4gIHZhciBpLG47XG4gIGlmKCEoeCBpbnN0YW5jZW9mIEFycmF5KSB8fCAhKHkgaW5zdGFuY2VvZiBBcnJheSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIG4gPSB4Lmxlbmd0aDtcbiAgaWYobiAhPT0geS5sZW5ndGgpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIGZvcihpPTA7aTxuO2krKykge1xuICAgIGlmKHhbaV0gPT09IHlbaV0pIHsgY29udGludWU7IH1cbiAgICBpZih0eXBlb2YgeFtpXSA9PT0gXCJvYmplY3RcIikgeyBpZighc2FtZSh4W2ldLHlbaV0pKSByZXR1cm4gZmFsc2U7IH1cbiAgICBlbHNlIHsgcmV0dXJuIGZhbHNlOyB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbm51bWVyaWMucmVwID0gZnVuY3Rpb24gcmVwKHMsdixrKSB7XG4gIGlmKHR5cGVvZiBrID09PSBcInVuZGVmaW5lZFwiKSB7IGs9MDsgfVxuICB2YXIgbiA9IHNba10sIHJldCA9IEFycmF5KG4pLCBpO1xuICBpZihrID09PSBzLmxlbmd0aC0xKSB7XG4gICAgZm9yKGk9bi0yO2k+PTA7aS09MikgeyByZXRbaSsxXSA9IHY7IHJldFtpXSA9IHY7IH1cbiAgICBpZihpPT09LTEpIHsgcmV0WzBdID0gdjsgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgZm9yKGk9bi0xO2k+PTA7aS0tKSB7IHJldFtpXSA9IG51bWVyaWMucmVwKHMsdixrKzEpOyB9XG4gIHJldHVybiByZXQ7XG59XG5cblxubnVtZXJpYy5kb3RNTXNtYWxsID0gZnVuY3Rpb24gZG90TU1zbWFsbCh4LHkpIHtcbiAgdmFyIGksaixrLHAscSxyLHJldCxmb28sYmFyLHdvbyxpMCxrMCxwMCxyMDtcbiAgcCA9IHgubGVuZ3RoOyBxID0geS5sZW5ndGg7IHIgPSB5WzBdLmxlbmd0aDtcbiAgcmV0ID0gQXJyYXkocCk7XG4gIGZvcihpPXAtMTtpPj0wO2ktLSkge1xuICAgIGZvbyA9IEFycmF5KHIpO1xuICAgIGJhciA9IHhbaV07XG4gICAgZm9yKGs9ci0xO2s+PTA7ay0tKSB7XG4gICAgICB3b28gPSBiYXJbcS0xXSp5W3EtMV1ba107XG4gICAgICBmb3Ioaj1xLTI7aj49MTtqLT0yKSB7XG4gICAgICAgIGkwID0gai0xO1xuICAgICAgICB3b28gKz0gYmFyW2pdKnlbal1ba10gKyBiYXJbaTBdKnlbaTBdW2tdO1xuICAgICAgfVxuICAgICAgaWYoaj09PTApIHsgd29vICs9IGJhclswXSp5WzBdW2tdOyB9XG4gICAgICBmb29ba10gPSB3b287XG4gICAgfVxuICAgIHJldFtpXSA9IGZvbztcbiAgfVxuICByZXR1cm4gcmV0O1xufVxubnVtZXJpYy5fZ2V0Q29sID0gZnVuY3Rpb24gX2dldENvbChBLGoseCkge1xuICB2YXIgbiA9IEEubGVuZ3RoLCBpO1xuICBmb3IoaT1uLTE7aT4wOy0taSkge1xuICAgIHhbaV0gPSBBW2ldW2pdO1xuICAgIC0taTtcbiAgICB4W2ldID0gQVtpXVtqXTtcbiAgfVxuICBpZihpPT09MCkgeFswXSA9IEFbMF1bal07XG59XG5udW1lcmljLmRvdE1NYmlnID0gZnVuY3Rpb24gZG90TU1iaWcoeCx5KXtcbiAgdmFyIGdjID0gbnVtZXJpYy5fZ2V0Q29sLCBwID0geS5sZW5ndGgsIHYgPSBBcnJheShwKTtcbiAgdmFyIG0gPSB4Lmxlbmd0aCwgbiA9IHlbMF0ubGVuZ3RoLCBBID0gbmV3IEFycmF5KG0pLCB4ajtcbiAgdmFyIFZWID0gbnVtZXJpYy5kb3RWVjtcbiAgdmFyIGksaixrLHo7XG4gIC0tcDtcbiAgLS1tO1xuICBmb3IoaT1tO2khPT0tMTstLWkpIEFbaV0gPSBBcnJheShuKTtcbiAgLS1uO1xuICBmb3IoaT1uO2khPT0tMTstLWkpIHtcbiAgICBnYyh5LGksdik7XG4gICAgZm9yKGo9bTtqIT09LTE7LS1qKSB7XG4gICAgICB6PTA7XG4gICAgICB4aiA9IHhbal07XG4gICAgICBBW2pdW2ldID0gVlYoeGosdik7XG4gICAgfVxuICB9XG4gIHJldHVybiBBO1xufVxuXG5udW1lcmljLmRvdE1WID0gZnVuY3Rpb24gZG90TVYoeCx5KSB7XG4gIHZhciBwID0geC5sZW5ndGgsIHEgPSB5Lmxlbmd0aCxpO1xuICB2YXIgcmV0ID0gQXJyYXkocCksIGRvdFZWID0gbnVtZXJpYy5kb3RWVjtcbiAgZm9yKGk9cC0xO2k+PTA7aS0tKSB7IHJldFtpXSA9IGRvdFZWKHhbaV0seSk7IH1cbiAgcmV0dXJuIHJldDtcbn1cblxubnVtZXJpYy5kb3RWTSA9IGZ1bmN0aW9uIGRvdFZNKHgseSkge1xuICB2YXIgaSxqLGsscCxxLHIscmV0LGZvbyxiYXIsd29vLGkwLGswLHAwLHIwLHMxLHMyLHMzLGJheixhY2N1bTtcbiAgcCA9IHgubGVuZ3RoOyBxID0geVswXS5sZW5ndGg7XG4gIHJldCA9IEFycmF5KHEpO1xuICBmb3Ioaz1xLTE7az49MDtrLS0pIHtcbiAgICB3b28gPSB4W3AtMV0qeVtwLTFdW2tdO1xuICAgIGZvcihqPXAtMjtqPj0xO2otPTIpIHtcbiAgICAgIGkwID0gai0xO1xuICAgICAgd29vICs9IHhbal0qeVtqXVtrXSArIHhbaTBdKnlbaTBdW2tdO1xuICAgIH1cbiAgICBpZihqPT09MCkgeyB3b28gKz0geFswXSp5WzBdW2tdOyB9XG4gICAgcmV0W2tdID0gd29vO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbm51bWVyaWMuZG90VlYgPSBmdW5jdGlvbiBkb3RWVih4LHkpIHtcbiAgdmFyIGksbj14Lmxlbmd0aCxpMSxyZXQgPSB4W24tMV0qeVtuLTFdO1xuICBmb3IoaT1uLTI7aT49MTtpLT0yKSB7XG4gICAgaTEgPSBpLTE7XG4gICAgcmV0ICs9IHhbaV0qeVtpXSArIHhbaTFdKnlbaTFdO1xuICB9XG4gIGlmKGk9PT0wKSB7IHJldCArPSB4WzBdKnlbMF07IH1cbiAgcmV0dXJuIHJldDtcbn1cblxubnVtZXJpYy5kb3QgPSBmdW5jdGlvbiBkb3QoeCx5KSB7XG4gIHZhciBkID0gbnVtZXJpYy5kaW07XG4gIHN3aXRjaChkKHgpLmxlbmd0aCoxMDAwK2QoeSkubGVuZ3RoKSB7XG4gICAgY2FzZSAyMDAyOlxuICAgICAgaWYoeS5sZW5ndGggPCAxMCkgcmV0dXJuIG51bWVyaWMuZG90TU1zbWFsbCh4LHkpO1xuICAgICAgZWxzZSByZXR1cm4gbnVtZXJpYy5kb3RNTWJpZyh4LHkpO1xuICAgIGNhc2UgMjAwMTogcmV0dXJuIG51bWVyaWMuZG90TVYoeCx5KTtcbiAgICBjYXNlIDEwMDI6IHJldHVybiBudW1lcmljLmRvdFZNKHgseSk7XG4gICAgY2FzZSAxMDAxOiByZXR1cm4gbnVtZXJpYy5kb3RWVih4LHkpO1xuICAgIGNhc2UgMTAwMDogcmV0dXJuIG51bWVyaWMubXVsVlMoeCx5KTtcbiAgICBjYXNlIDE6IHJldHVybiBudW1lcmljLm11bFNWKHgseSk7XG4gICAgY2FzZSAwOiByZXR1cm4geCp5O1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignbnVtZXJpYy5kb3Qgb25seSB3b3JrcyBvbiB2ZWN0b3JzIGFuZCBtYXRyaWNlcycpO1xuICB9XG59XG5cbm51bWVyaWMuZGlhZyA9IGZ1bmN0aW9uIGRpYWcoZCkge1xuICB2YXIgaSxpMSxqLG4gPSBkLmxlbmd0aCwgQSA9IEFycmF5KG4pLCBBaTtcbiAgZm9yKGk9bi0xO2k+PTA7aS0tKSB7XG4gICAgQWkgPSBBcnJheShuKTtcbiAgICBpMSA9IGkrMjtcbiAgICBmb3Ioaj1uLTE7aj49aTE7ai09Mikge1xuICAgICAgQWlbal0gPSAwO1xuICAgICAgQWlbai0xXSA9IDA7XG4gICAgfVxuICAgIGlmKGo+aSkgeyBBaVtqXSA9IDA7IH1cbiAgICBBaVtpXSA9IGRbaV07XG4gICAgZm9yKGo9aS0xO2o+PTE7ai09Mikge1xuICAgICAgQWlbal0gPSAwO1xuICAgICAgQWlbai0xXSA9IDA7XG4gICAgfVxuICAgIGlmKGo9PT0wKSB7IEFpWzBdID0gMDsgfVxuICAgIEFbaV0gPSBBaTtcbiAgfVxuICByZXR1cm4gQTtcbn1cbm51bWVyaWMuZ2V0RGlhZyA9IGZ1bmN0aW9uKEEpIHtcbiAgdmFyIG4gPSBNYXRoLm1pbihBLmxlbmd0aCxBWzBdLmxlbmd0aCksaSxyZXQgPSBBcnJheShuKTtcbiAgZm9yKGk9bi0xO2k+PTE7LS1pKSB7XG4gICAgcmV0W2ldID0gQVtpXVtpXTtcbiAgICAtLWk7XG4gICAgcmV0W2ldID0gQVtpXVtpXTtcbiAgfVxuICBpZihpPT09MCkge1xuICAgIHJldFswXSA9IEFbMF1bMF07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxubnVtZXJpYy5pZGVudGl0eSA9IGZ1bmN0aW9uIGlkZW50aXR5KG4pIHsgcmV0dXJuIG51bWVyaWMuZGlhZyhudW1lcmljLnJlcChbbl0sMSkpOyB9XG5udW1lcmljLnBvaW50d2lzZSA9IGZ1bmN0aW9uIHBvaW50d2lzZShwYXJhbXMsYm9keSxzZXR1cCkge1xuICBpZih0eXBlb2Ygc2V0dXAgPT09IFwidW5kZWZpbmVkXCIpIHsgc2V0dXAgPSBcIlwiOyB9XG4gIHZhciBmdW4gPSBbXTtcbiAgdmFyIGs7XG4gIHZhciBhdmVjID0gL1xcW2lcXF0kLyxwLHRoZXZlYyA9ICcnO1xuICB2YXIgaGF2ZXJldCA9IGZhbHNlO1xuICBmb3Ioaz0wO2s8cGFyYW1zLmxlbmd0aDtrKyspIHtcbiAgICBpZihhdmVjLnRlc3QocGFyYW1zW2tdKSkge1xuICAgICAgcCA9IHBhcmFtc1trXS5zdWJzdHJpbmcoMCxwYXJhbXNba10ubGVuZ3RoLTMpO1xuICAgICAgdGhldmVjID0gcDtcbiAgICB9IGVsc2UgeyBwID0gcGFyYW1zW2tdOyB9XG4gICAgaWYocD09PSdyZXQnKSBoYXZlcmV0ID0gdHJ1ZTtcbiAgICBmdW4ucHVzaChwKTtcbiAgfVxuICBmdW5bcGFyYW1zLmxlbmd0aF0gPSAnX3MnO1xuICBmdW5bcGFyYW1zLmxlbmd0aCsxXSA9ICdfayc7XG4gIGZ1bltwYXJhbXMubGVuZ3RoKzJdID0gKFxuICAgICdpZih0eXBlb2YgX3MgPT09IFwidW5kZWZpbmVkXCIpIF9zID0gbnVtZXJpYy5kaW0oJyt0aGV2ZWMrJyk7XFxuJytcbiAgICAnaWYodHlwZW9mIF9rID09PSBcInVuZGVmaW5lZFwiKSBfayA9IDA7XFxuJytcbiAgICAndmFyIF9uID0gX3NbX2tdO1xcbicrXG4gICAgJ3ZhciBpJysoaGF2ZXJldD8nJzonLCByZXQgPSBBcnJheShfbiknKSsnO1xcbicrXG4gICAgJ2lmKF9rIDwgX3MubGVuZ3RoLTEpIHtcXG4nK1xuICAgICcgICAgZm9yKGk9X24tMTtpPj0wO2ktLSkgcmV0W2ldID0gYXJndW1lbnRzLmNhbGxlZSgnK3BhcmFtcy5qb2luKCcsJykrJyxfcyxfaysxKTtcXG4nK1xuICAgICcgICAgcmV0dXJuIHJldDtcXG4nK1xuICAgICd9XFxuJytcbiAgICBzZXR1cCsnXFxuJytcbiAgICAnZm9yKGk9X24tMTtpIT09LTE7LS1pKSB7XFxuJytcbiAgICAnICAgICcrYm9keSsnXFxuJytcbiAgICAnfVxcbicrXG4gICAgJ3JldHVybiByZXQ7J1xuICAgICk7XG4gIHJldHVybiBGdW5jdGlvbi5hcHBseShudWxsLGZ1bik7XG59XG5udW1lcmljLnBvaW50d2lzZTIgPSBmdW5jdGlvbiBwb2ludHdpc2UyKHBhcmFtcyxib2R5LHNldHVwKSB7XG4gIGlmKHR5cGVvZiBzZXR1cCA9PT0gXCJ1bmRlZmluZWRcIikgeyBzZXR1cCA9IFwiXCI7IH1cbiAgdmFyIGZ1biA9IFtdO1xuICB2YXIgaztcbiAgdmFyIGF2ZWMgPSAvXFxbaVxcXSQvLHAsdGhldmVjID0gJyc7XG4gIHZhciBoYXZlcmV0ID0gZmFsc2U7XG4gIGZvcihrPTA7azxwYXJhbXMubGVuZ3RoO2srKykge1xuICAgIGlmKGF2ZWMudGVzdChwYXJhbXNba10pKSB7XG4gICAgICBwID0gcGFyYW1zW2tdLnN1YnN0cmluZygwLHBhcmFtc1trXS5sZW5ndGgtMyk7XG4gICAgICB0aGV2ZWMgPSBwO1xuICAgIH0gZWxzZSB7IHAgPSBwYXJhbXNba107IH1cbiAgICBpZihwPT09J3JldCcpIGhhdmVyZXQgPSB0cnVlO1xuICAgIGZ1bi5wdXNoKHApO1xuICB9XG4gIGZ1bltwYXJhbXMubGVuZ3RoXSA9IChcbiAgICAndmFyIF9uID0gJyt0aGV2ZWMrJy5sZW5ndGg7XFxuJytcbiAgICAndmFyIGknKyhoYXZlcmV0PycnOicsIHJldCA9IEFycmF5KF9uKScpKyc7XFxuJytcbiAgICBzZXR1cCsnXFxuJytcbiAgICAnZm9yKGk9X24tMTtpIT09LTE7LS1pKSB7XFxuJytcbiAgICBib2R5KydcXG4nK1xuICAgICd9XFxuJytcbiAgICAncmV0dXJuIHJldDsnXG4gICAgKTtcbiAgcmV0dXJuIEZ1bmN0aW9uLmFwcGx5KG51bGwsZnVuKTtcbn1cbm51bWVyaWMuX2JpZm9yZWFjaCA9IChmdW5jdGlvbiBfYmlmb3JlYWNoKHgseSxzLGssZikge1xuICBpZihrID09PSBzLmxlbmd0aC0xKSB7IGYoeCx5KTsgcmV0dXJuOyB9XG4gIHZhciBpLG49c1trXTtcbiAgZm9yKGk9bi0xO2k+PTA7aS0tKSB7IF9iaWZvcmVhY2godHlwZW9mIHg9PT1cIm9iamVjdFwiP3hbaV06eCx0eXBlb2YgeT09PVwib2JqZWN0XCI/eVtpXTp5LHMsaysxLGYpOyB9XG59KTtcbm51bWVyaWMuX2JpZm9yZWFjaDIgPSAoZnVuY3Rpb24gX2JpZm9yZWFjaDIoeCx5LHMsayxmKSB7XG4gIGlmKGsgPT09IHMubGVuZ3RoLTEpIHsgcmV0dXJuIGYoeCx5KTsgfVxuICB2YXIgaSxuPXNba10scmV0ID0gQXJyYXkobik7XG4gIGZvcihpPW4tMTtpPj0wOy0taSkgeyByZXRbaV0gPSBfYmlmb3JlYWNoMih0eXBlb2YgeD09PVwib2JqZWN0XCI/eFtpXTp4LHR5cGVvZiB5PT09XCJvYmplY3RcIj95W2ldOnkscyxrKzEsZik7IH1cbiAgcmV0dXJuIHJldDtcbn0pO1xubnVtZXJpYy5fZm9yZWFjaCA9IChmdW5jdGlvbiBfZm9yZWFjaCh4LHMsayxmKSB7XG4gIGlmKGsgPT09IHMubGVuZ3RoLTEpIHsgZih4KTsgcmV0dXJuOyB9XG4gIHZhciBpLG49c1trXTtcbiAgZm9yKGk9bi0xO2k+PTA7aS0tKSB7IF9mb3JlYWNoKHhbaV0scyxrKzEsZik7IH1cbn0pO1xubnVtZXJpYy5fZm9yZWFjaDIgPSAoZnVuY3Rpb24gX2ZvcmVhY2gyKHgscyxrLGYpIHtcbiAgaWYoayA9PT0gcy5sZW5ndGgtMSkgeyByZXR1cm4gZih4KTsgfVxuICB2YXIgaSxuPXNba10sIHJldCA9IEFycmF5KG4pO1xuICBmb3IoaT1uLTE7aT49MDtpLS0pIHsgcmV0W2ldID0gX2ZvcmVhY2gyKHhbaV0scyxrKzEsZik7IH1cbiAgcmV0dXJuIHJldDtcbn0pO1xuXG4vKm51bWVyaWMuYW55ViA9IG51bWVyaWMubWFwcmVkdWNlKCdpZih4aSkgcmV0dXJuIHRydWU7JywnZmFsc2UnKTtcbiBudW1lcmljLmFsbFYgPSBudW1lcmljLm1hcHJlZHVjZSgnaWYoIXhpKSByZXR1cm4gZmFsc2U7JywndHJ1ZScpO1xuIG51bWVyaWMuYW55ID0gZnVuY3Rpb24oeCkgeyBpZih0eXBlb2YgeC5sZW5ndGggPT09IFwidW5kZWZpbmVkXCIpIHJldHVybiB4OyByZXR1cm4gbnVtZXJpYy5hbnlWKHgpOyB9XG4gbnVtZXJpYy5hbGwgPSBmdW5jdGlvbih4KSB7IGlmKHR5cGVvZiB4Lmxlbmd0aCA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIHg7IHJldHVybiBudW1lcmljLmFsbFYoeCk7IH0qL1xuXG5udW1lcmljLm9wczIgPSB7XG4gIGFkZDogJysnLFxuICBzdWI6ICctJyxcbiAgbXVsOiAnKicsXG4gIGRpdjogJy8nLFxuICBtb2Q6ICclJyxcbiAgYW5kOiAnJiYnLFxuICBvcjogICd8fCcsXG4gIGVxOiAgJz09PScsXG4gIG5lcTogJyE9PScsXG4gIGx0OiAgJzwnLFxuICBndDogICc+JyxcbiAgbGVxOiAnPD0nLFxuICBnZXE6ICc+PScsXG4gIGJhbmQ6ICcmJyxcbiAgYm9yOiAnfCcsXG4gIGJ4b3I6ICdeJyxcbiAgbHNoaWZ0OiAnPDwnLFxuICByc2hpZnQ6ICc+PicsXG4gIHJyc2hpZnQ6ICc+Pj4nXG59O1xubnVtZXJpYy5vcHNlcSA9IHtcbiAgYWRkZXE6ICcrPScsXG4gIHN1YmVxOiAnLT0nLFxuICBtdWxlcTogJyo9JyxcbiAgZGl2ZXE6ICcvPScsXG4gIG1vZGVxOiAnJT0nLFxuICBsc2hpZnRlcTogJzw8PScsXG4gIHJzaGlmdGVxOiAnPj49JyxcbiAgcnJzaGlmdGVxOiAnPj4+PScsXG4gIGJhbmRlcTogJyY9JyxcbiAgYm9yZXE6ICd8PScsXG4gIGJ4b3JlcTogJ149J1xufTtcbm51bWVyaWMubWF0aGZ1bnMgPSBbJ2FicycsJ2Fjb3MnLCdhc2luJywnYXRhbicsJ2NlaWwnLCdjb3MnLFxuICAnZXhwJywnZmxvb3InLCdsb2cnLCdyb3VuZCcsJ3NpbicsJ3NxcnQnLCd0YW4nLFxuICAnaXNOYU4nLCdpc0Zpbml0ZSddO1xubnVtZXJpYy5tYXRoZnVuczIgPSBbJ2F0YW4yJywncG93JywnbWF4JywnbWluJ107XG5udW1lcmljLm9wczEgPSB7XG4gIG5lZzogJy0nLFxuICBub3Q6ICchJyxcbiAgYm5vdDogJ34nLFxuICBjbG9uZTogJydcbn07XG5udW1lcmljLm1hcHJlZHVjZXJzID0ge1xuICBhbnk6IFsnaWYoeGkpIHJldHVybiB0cnVlOycsJ3ZhciBhY2N1bSA9IGZhbHNlOyddLFxuICBhbGw6IFsnaWYoIXhpKSByZXR1cm4gZmFsc2U7JywndmFyIGFjY3VtID0gdHJ1ZTsnXSxcbiAgc3VtOiBbJ2FjY3VtICs9IHhpOycsJ3ZhciBhY2N1bSA9IDA7J10sXG4gIHByb2Q6IFsnYWNjdW0gKj0geGk7JywndmFyIGFjY3VtID0gMTsnXSxcbiAgbm9ybTJTcXVhcmVkOiBbJ2FjY3VtICs9IHhpKnhpOycsJ3ZhciBhY2N1bSA9IDA7J10sXG4gIG5vcm1pbmY6IFsnYWNjdW0gPSBtYXgoYWNjdW0sYWJzKHhpKSk7JywndmFyIGFjY3VtID0gMCwgbWF4ID0gTWF0aC5tYXgsIGFicyA9IE1hdGguYWJzOyddLFxuICBub3JtMTogWydhY2N1bSArPSBhYnMoeGkpJywndmFyIGFjY3VtID0gMCwgYWJzID0gTWF0aC5hYnM7J10sXG4gIHN1cDogWydhY2N1bSA9IG1heChhY2N1bSx4aSk7JywndmFyIGFjY3VtID0gLUluZmluaXR5LCBtYXggPSBNYXRoLm1heDsnXSxcbiAgaW5mOiBbJ2FjY3VtID0gbWluKGFjY3VtLHhpKTsnLCd2YXIgYWNjdW0gPSBJbmZpbml0eSwgbWluID0gTWF0aC5taW47J11cbn07XG5cbihmdW5jdGlvbiAoKSB7XG4gIHZhciBpLG87XG4gIGZvcihpPTA7aTxudW1lcmljLm1hdGhmdW5zMi5sZW5ndGg7KytpKSB7XG4gICAgbyA9IG51bWVyaWMubWF0aGZ1bnMyW2ldO1xuICAgIG51bWVyaWMub3BzMltvXSA9IG87XG4gIH1cbiAgZm9yKGkgaW4gbnVtZXJpYy5vcHMyKSB7XG4gICAgaWYobnVtZXJpYy5vcHMyLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICBvID0gbnVtZXJpYy5vcHMyW2ldO1xuICAgICAgdmFyIGNvZGUsIGNvZGVlcSwgc2V0dXAgPSAnJztcbiAgICAgIGlmKG51bWVyaWMubXlJbmRleE9mLmNhbGwobnVtZXJpYy5tYXRoZnVuczIsaSkhPT0tMSkge1xuICAgICAgICBzZXR1cCA9ICd2YXIgJytvKycgPSBNYXRoLicrbysnO1xcbic7XG4gICAgICAgIGNvZGUgPSBmdW5jdGlvbihyLHgseSkgeyByZXR1cm4gcisnID0gJytvKycoJyt4KycsJyt5KycpJzsgfTtcbiAgICAgICAgY29kZWVxID0gZnVuY3Rpb24oeCx5KSB7IHJldHVybiB4KycgPSAnK28rJygnK3grJywnK3krJyknOyB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29kZSA9IGZ1bmN0aW9uKHIseCx5KSB7IHJldHVybiByKycgPSAnK3grJyAnK28rJyAnK3k7IH07XG4gICAgICAgIGlmKG51bWVyaWMub3BzZXEuaGFzT3duUHJvcGVydHkoaSsnZXEnKSkge1xuICAgICAgICAgIGNvZGVlcSA9IGZ1bmN0aW9uKHgseSkgeyByZXR1cm4geCsnICcrbysnPSAnK3k7IH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29kZWVxID0gZnVuY3Rpb24oeCx5KSB7IHJldHVybiB4KycgPSAnK3grJyAnK28rJyAnK3k7IH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG51bWVyaWNbaSsnVlYnXSA9IG51bWVyaWMucG9pbnR3aXNlMihbJ3hbaV0nLCd5W2ldJ10sY29kZSgncmV0W2ldJywneFtpXScsJ3lbaV0nKSxzZXR1cCk7XG4gICAgICBudW1lcmljW2krJ1NWJ10gPSBudW1lcmljLnBvaW50d2lzZTIoWyd4JywneVtpXSddLGNvZGUoJ3JldFtpXScsJ3gnLCd5W2ldJyksc2V0dXApO1xuICAgICAgbnVtZXJpY1tpKydWUyddID0gbnVtZXJpYy5wb2ludHdpc2UyKFsneFtpXScsJ3knXSxjb2RlKCdyZXRbaV0nLCd4W2ldJywneScpLHNldHVwKTtcbiAgICAgIG51bWVyaWNbaV0gPSBGdW5jdGlvbihcbiAgICAgICAgJ3ZhciBuID0gYXJndW1lbnRzLmxlbmd0aCwgaSwgeCA9IGFyZ3VtZW50c1swXSwgeTtcXG4nK1xuICAgICAgICAndmFyIFZWID0gbnVtZXJpYy4nK2krJ1ZWLCBWUyA9IG51bWVyaWMuJytpKydWUywgU1YgPSBudW1lcmljLicraSsnU1Y7XFxuJytcbiAgICAgICAgJ3ZhciBkaW0gPSBudW1lcmljLmRpbTtcXG4nK1xuICAgICAgICAnZm9yKGk9MTtpIT09bjsrK2kpIHsgXFxuJytcbiAgICAgICAgJyAgeSA9IGFyZ3VtZW50c1tpXTtcXG4nK1xuICAgICAgICAnICBpZih0eXBlb2YgeCA9PT0gXCJvYmplY3RcIikge1xcbicrXG4gICAgICAgICcgICAgICBpZih0eXBlb2YgeSA9PT0gXCJvYmplY3RcIikgeCA9IG51bWVyaWMuX2JpZm9yZWFjaDIoeCx5LGRpbSh4KSwwLFZWKTtcXG4nK1xuICAgICAgICAnICAgICAgZWxzZSB4ID0gbnVtZXJpYy5fYmlmb3JlYWNoMih4LHksZGltKHgpLDAsVlMpO1xcbicrXG4gICAgICAgICcgIH0gZWxzZSBpZih0eXBlb2YgeSA9PT0gXCJvYmplY3RcIikgeCA9IG51bWVyaWMuX2JpZm9yZWFjaDIoeCx5LGRpbSh5KSwwLFNWKTtcXG4nK1xuICAgICAgICAnICBlbHNlICcrY29kZWVxKCd4JywneScpKydcXG4nK1xuICAgICAgICAnfVxcbnJldHVybiB4O1xcbicpO1xuICAgICAgbnVtZXJpY1tvXSA9IG51bWVyaWNbaV07XG4gICAgICBudW1lcmljW2krJ2VxViddID0gbnVtZXJpYy5wb2ludHdpc2UyKFsncmV0W2ldJywneFtpXSddLCBjb2RlZXEoJ3JldFtpXScsJ3hbaV0nKSxzZXR1cCk7XG4gICAgICBudW1lcmljW2krJ2VxUyddID0gbnVtZXJpYy5wb2ludHdpc2UyKFsncmV0W2ldJywneCddLCBjb2RlZXEoJ3JldFtpXScsJ3gnKSxzZXR1cCk7XG4gICAgICBudW1lcmljW2krJ2VxJ10gPSBGdW5jdGlvbihcbiAgICAgICAgJ3ZhciBuID0gYXJndW1lbnRzLmxlbmd0aCwgaSwgeCA9IGFyZ3VtZW50c1swXSwgeTtcXG4nK1xuICAgICAgICAndmFyIFYgPSBudW1lcmljLicraSsnZXFWLCBTID0gbnVtZXJpYy4nK2krJ2VxU1xcbicrXG4gICAgICAgICd2YXIgcyA9IG51bWVyaWMuZGltKHgpO1xcbicrXG4gICAgICAgICdmb3IoaT0xO2khPT1uOysraSkgeyBcXG4nK1xuICAgICAgICAnICB5ID0gYXJndW1lbnRzW2ldO1xcbicrXG4gICAgICAgICcgIGlmKHR5cGVvZiB5ID09PSBcIm9iamVjdFwiKSBudW1lcmljLl9iaWZvcmVhY2goeCx5LHMsMCxWKTtcXG4nK1xuICAgICAgICAnICBlbHNlIG51bWVyaWMuX2JpZm9yZWFjaCh4LHkscywwLFMpO1xcbicrXG4gICAgICAgICd9XFxucmV0dXJuIHg7XFxuJyk7XG4gICAgfVxuICB9XG4gIGZvcihpPTA7aTxudW1lcmljLm1hdGhmdW5zMi5sZW5ndGg7KytpKSB7XG4gICAgbyA9IG51bWVyaWMubWF0aGZ1bnMyW2ldO1xuICAgIGRlbGV0ZSBudW1lcmljLm9wczJbb107XG4gIH1cbiAgZm9yKGk9MDtpPG51bWVyaWMubWF0aGZ1bnMubGVuZ3RoOysraSkge1xuICAgIG8gPSBudW1lcmljLm1hdGhmdW5zW2ldO1xuICAgIG51bWVyaWMub3BzMVtvXSA9IG87XG4gIH1cbiAgZm9yKGkgaW4gbnVtZXJpYy5vcHMxKSB7XG4gICAgaWYobnVtZXJpYy5vcHMxLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICBzZXR1cCA9ICcnO1xuICAgICAgbyA9IG51bWVyaWMub3BzMVtpXTtcbiAgICAgIGlmKG51bWVyaWMubXlJbmRleE9mLmNhbGwobnVtZXJpYy5tYXRoZnVucyxpKSE9PS0xKSB7XG4gICAgICAgIGlmKE1hdGguaGFzT3duUHJvcGVydHkobykpIHNldHVwID0gJ3ZhciAnK28rJyA9IE1hdGguJytvKyc7XFxuJztcbiAgICAgIH1cbiAgICAgIG51bWVyaWNbaSsnZXFWJ10gPSBudW1lcmljLnBvaW50d2lzZTIoWydyZXRbaV0nXSwncmV0W2ldID0gJytvKycocmV0W2ldKTsnLHNldHVwKTtcbiAgICAgIG51bWVyaWNbaSsnZXEnXSA9IEZ1bmN0aW9uKCd4JyxcbiAgICAgICAgJ2lmKHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gJytvKyd4XFxuJytcbiAgICAgICAgJ3ZhciBpO1xcbicrXG4gICAgICAgICd2YXIgViA9IG51bWVyaWMuJytpKydlcVY7XFxuJytcbiAgICAgICAgJ3ZhciBzID0gbnVtZXJpYy5kaW0oeCk7XFxuJytcbiAgICAgICAgJ251bWVyaWMuX2ZvcmVhY2goeCxzLDAsVik7XFxuJytcbiAgICAgICAgJ3JldHVybiB4O1xcbicpO1xuICAgICAgbnVtZXJpY1tpKydWJ10gPSBudW1lcmljLnBvaW50d2lzZTIoWyd4W2ldJ10sJ3JldFtpXSA9ICcrbysnKHhbaV0pOycsc2V0dXApO1xuICAgICAgbnVtZXJpY1tpXSA9IEZ1bmN0aW9uKCd4JyxcbiAgICAgICAgJ2lmKHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gJytvKycoeClcXG4nK1xuICAgICAgICAndmFyIGk7XFxuJytcbiAgICAgICAgJ3ZhciBWID0gbnVtZXJpYy4nK2krJ1Y7XFxuJytcbiAgICAgICAgJ3ZhciBzID0gbnVtZXJpYy5kaW0oeCk7XFxuJytcbiAgICAgICAgJ3JldHVybiBudW1lcmljLl9mb3JlYWNoMih4LHMsMCxWKTtcXG4nKTtcbiAgICB9XG4gIH1cbiAgZm9yKGk9MDtpPG51bWVyaWMubWF0aGZ1bnMubGVuZ3RoOysraSkge1xuICAgIG8gPSBudW1lcmljLm1hdGhmdW5zW2ldO1xuICAgIGRlbGV0ZSBudW1lcmljLm9wczFbb107XG4gIH1cbiAgZm9yKGkgaW4gbnVtZXJpYy5tYXByZWR1Y2Vycykge1xuICAgIGlmKG51bWVyaWMubWFwcmVkdWNlcnMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgIG8gPSBudW1lcmljLm1hcHJlZHVjZXJzW2ldO1xuICAgICAgbnVtZXJpY1tpKydWJ10gPSBudW1lcmljLm1hcHJlZHVjZTIob1swXSxvWzFdKTtcbiAgICAgIG51bWVyaWNbaV0gPSBGdW5jdGlvbigneCcsJ3MnLCdrJyxcbiAgICAgICAgb1sxXStcbiAgICAgICAgJ2lmKHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7JytcbiAgICAgICAgJyAgICB4aSA9IHg7XFxuJytcbiAgICAgICAgb1swXSsnO1xcbicrXG4gICAgICAgICcgICAgcmV0dXJuIGFjY3VtO1xcbicrXG4gICAgICAgICd9JytcbiAgICAgICAgJ2lmKHR5cGVvZiBzID09PSBcInVuZGVmaW5lZFwiKSBzID0gbnVtZXJpYy5kaW0oeCk7XFxuJytcbiAgICAgICAgJ2lmKHR5cGVvZiBrID09PSBcInVuZGVmaW5lZFwiKSBrID0gMDtcXG4nK1xuICAgICAgICAnaWYoayA9PT0gcy5sZW5ndGgtMSkgcmV0dXJuIG51bWVyaWMuJytpKydWKHgpO1xcbicrXG4gICAgICAgICd2YXIgeGk7XFxuJytcbiAgICAgICAgJ3ZhciBuID0geC5sZW5ndGgsIGk7XFxuJytcbiAgICAgICAgJ2ZvcihpPW4tMTtpIT09LTE7LS1pKSB7XFxuJytcbiAgICAgICAgJyAgIHhpID0gYXJndW1lbnRzLmNhbGxlZSh4W2ldKTtcXG4nK1xuICAgICAgICBvWzBdKyc7XFxuJytcbiAgICAgICAgJ31cXG4nK1xuICAgICAgICAncmV0dXJuIGFjY3VtO1xcbicpO1xuICAgIH1cbiAgfVxufSgpKTtcblxubnVtZXJpYy50cnVuY1ZWID0gbnVtZXJpYy5wb2ludHdpc2UoWyd4W2ldJywneVtpXSddLCdyZXRbaV0gPSByb3VuZCh4W2ldL3lbaV0pKnlbaV07JywndmFyIHJvdW5kID0gTWF0aC5yb3VuZDsnKTtcbm51bWVyaWMudHJ1bmNWUyA9IG51bWVyaWMucG9pbnR3aXNlKFsneFtpXScsJ3knXSwncmV0W2ldID0gcm91bmQoeFtpXS95KSp5OycsJ3ZhciByb3VuZCA9IE1hdGgucm91bmQ7Jyk7XG5udW1lcmljLnRydW5jU1YgPSBudW1lcmljLnBvaW50d2lzZShbJ3gnLCd5W2ldJ10sJ3JldFtpXSA9IHJvdW5kKHgveVtpXSkqeVtpXTsnLCd2YXIgcm91bmQgPSBNYXRoLnJvdW5kOycpO1xubnVtZXJpYy50cnVuYyA9IGZ1bmN0aW9uIHRydW5jKHgseSkge1xuICBpZih0eXBlb2YgeCA9PT0gXCJvYmplY3RcIikge1xuICAgIGlmKHR5cGVvZiB5ID09PSBcIm9iamVjdFwiKSByZXR1cm4gbnVtZXJpYy50cnVuY1ZWKHgseSk7XG4gICAgcmV0dXJuIG51bWVyaWMudHJ1bmNWUyh4LHkpO1xuICB9XG4gIGlmICh0eXBlb2YgeSA9PT0gXCJvYmplY3RcIikgcmV0dXJuIG51bWVyaWMudHJ1bmNTVih4LHkpO1xuICByZXR1cm4gTWF0aC5yb3VuZCh4L3kpKnk7XG59XG5cbm51bWVyaWMuaW52ID0gZnVuY3Rpb24gaW52KHgpIHtcbiAgdmFyIHMgPSBudW1lcmljLmRpbSh4KSwgYWJzID0gTWF0aC5hYnMsIG0gPSBzWzBdLCBuID0gc1sxXTtcbiAgdmFyIEEgPSBudW1lcmljLmNsb25lKHgpLCBBaSwgQWo7XG4gIHZhciBJID0gbnVtZXJpYy5pZGVudGl0eShtKSwgSWksIElqO1xuICB2YXIgaSxqLGsseDtcbiAgZm9yKGo9MDtqPG47KytqKSB7XG4gICAgdmFyIGkwID0gLTE7XG4gICAgdmFyIHYwID0gLTE7XG4gICAgZm9yKGk9ajtpIT09bTsrK2kpIHsgayA9IGFicyhBW2ldW2pdKTsgaWYoaz52MCkgeyBpMCA9IGk7IHYwID0gazsgfSB9XG4gICAgQWogPSBBW2kwXTsgQVtpMF0gPSBBW2pdOyBBW2pdID0gQWo7XG4gICAgSWogPSBJW2kwXTsgSVtpMF0gPSBJW2pdOyBJW2pdID0gSWo7XG4gICAgeCA9IEFqW2pdO1xuICAgIGZvcihrPWo7ayE9PW47KytrKSAgICBBaltrXSAvPSB4O1xuICAgIGZvcihrPW4tMTtrIT09LTE7LS1rKSBJaltrXSAvPSB4O1xuICAgIGZvcihpPW0tMTtpIT09LTE7LS1pKSB7XG4gICAgICBpZihpIT09aikge1xuICAgICAgICBBaSA9IEFbaV07XG4gICAgICAgIElpID0gSVtpXTtcbiAgICAgICAgeCA9IEFpW2pdO1xuICAgICAgICBmb3Ioaz1qKzE7ayE9PW47KytrKSAgQWlba10gLT0gQWpba10qeDtcbiAgICAgICAgZm9yKGs9bi0xO2s+MDstLWspIHsgSWlba10gLT0gSWpba10qeDsgLS1rOyBJaVtrXSAtPSBJaltrXSp4OyB9XG4gICAgICAgIGlmKGs9PT0wKSBJaVswXSAtPSBJalswXSp4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gSTtcbn1cblxubnVtZXJpYy5kZXQgPSBmdW5jdGlvbiBkZXQoeCkge1xuICB2YXIgcyA9IG51bWVyaWMuZGltKHgpO1xuICBpZihzLmxlbmd0aCAhPT0gMiB8fCBzWzBdICE9PSBzWzFdKSB7IHRocm93IG5ldyBFcnJvcignbnVtZXJpYzogZGV0KCkgb25seSB3b3JrcyBvbiBzcXVhcmUgbWF0cmljZXMnKTsgfVxuICB2YXIgbiA9IHNbMF0sIHJldCA9IDEsaSxqLGssQSA9IG51bWVyaWMuY2xvbmUoeCksQWosQWksYWxwaGEsdGVtcCxrMSxrMixrMztcbiAgZm9yKGo9MDtqPG4tMTtqKyspIHtcbiAgICBrPWo7XG4gICAgZm9yKGk9aisxO2k8bjtpKyspIHsgaWYoTWF0aC5hYnMoQVtpXVtqXSkgPiBNYXRoLmFicyhBW2tdW2pdKSkgeyBrID0gaTsgfSB9XG4gICAgaWYoayAhPT0gaikge1xuICAgICAgdGVtcCA9IEFba107IEFba10gPSBBW2pdOyBBW2pdID0gdGVtcDtcbiAgICAgIHJldCAqPSAtMTtcbiAgICB9XG4gICAgQWogPSBBW2pdO1xuICAgIGZvcihpPWorMTtpPG47aSsrKSB7XG4gICAgICBBaSA9IEFbaV07XG4gICAgICBhbHBoYSA9IEFpW2pdL0FqW2pdO1xuICAgICAgZm9yKGs9aisxO2s8bi0xO2srPTIpIHtcbiAgICAgICAgazEgPSBrKzE7XG4gICAgICAgIEFpW2tdIC09IEFqW2tdKmFscGhhO1xuICAgICAgICBBaVtrMV0gLT0gQWpbazFdKmFscGhhO1xuICAgICAgfVxuICAgICAgaWYoayE9PW4pIHsgQWlba10gLT0gQWpba10qYWxwaGE7IH1cbiAgICB9XG4gICAgaWYoQWpbal0gPT09IDApIHsgcmV0dXJuIDA7IH1cbiAgICByZXQgKj0gQWpbal07XG4gIH1cbiAgcmV0dXJuIHJldCpBW2pdW2pdO1xufVxuXG5udW1lcmljLnRyYW5zcG9zZSA9IGZ1bmN0aW9uIHRyYW5zcG9zZSh4KSB7XG4gIHZhciBpLGosbSA9IHgubGVuZ3RoLG4gPSB4WzBdLmxlbmd0aCwgcmV0PUFycmF5KG4pLEEwLEExLEJqO1xuICBmb3Ioaj0wO2o8bjtqKyspIHJldFtqXSA9IEFycmF5KG0pO1xuICBmb3IoaT1tLTE7aT49MTtpLT0yKSB7XG4gICAgQTEgPSB4W2ldO1xuICAgIEEwID0geFtpLTFdO1xuICAgIGZvcihqPW4tMTtqPj0xOy0taikge1xuICAgICAgQmogPSByZXRbal07IEJqW2ldID0gQTFbal07IEJqW2ktMV0gPSBBMFtqXTtcbiAgICAgIC0tajtcbiAgICAgIEJqID0gcmV0W2pdOyBCaltpXSA9IEExW2pdOyBCaltpLTFdID0gQTBbal07XG4gICAgfVxuICAgIGlmKGo9PT0wKSB7XG4gICAgICBCaiA9IHJldFswXTsgQmpbaV0gPSBBMVswXTsgQmpbaS0xXSA9IEEwWzBdO1xuICAgIH1cbiAgfVxuICBpZihpPT09MCkge1xuICAgIEEwID0geFswXTtcbiAgICBmb3Ioaj1uLTE7aj49MTstLWopIHtcbiAgICAgIHJldFtqXVswXSA9IEEwW2pdO1xuICAgICAgLS1qO1xuICAgICAgcmV0W2pdWzBdID0gQTBbal07XG4gICAgfVxuICAgIGlmKGo9PT0wKSB7IHJldFswXVswXSA9IEEwWzBdOyB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cbm51bWVyaWMubmVndHJhbnNwb3NlID0gZnVuY3Rpb24gbmVndHJhbnNwb3NlKHgpIHtcbiAgdmFyIGksaixtID0geC5sZW5ndGgsbiA9IHhbMF0ubGVuZ3RoLCByZXQ9QXJyYXkobiksQTAsQTEsQmo7XG4gIGZvcihqPTA7ajxuO2orKykgcmV0W2pdID0gQXJyYXkobSk7XG4gIGZvcihpPW0tMTtpPj0xO2ktPTIpIHtcbiAgICBBMSA9IHhbaV07XG4gICAgQTAgPSB4W2ktMV07XG4gICAgZm9yKGo9bi0xO2o+PTE7LS1qKSB7XG4gICAgICBCaiA9IHJldFtqXTsgQmpbaV0gPSAtQTFbal07IEJqW2ktMV0gPSAtQTBbal07XG4gICAgICAtLWo7XG4gICAgICBCaiA9IHJldFtqXTsgQmpbaV0gPSAtQTFbal07IEJqW2ktMV0gPSAtQTBbal07XG4gICAgfVxuICAgIGlmKGo9PT0wKSB7XG4gICAgICBCaiA9IHJldFswXTsgQmpbaV0gPSAtQTFbMF07IEJqW2ktMV0gPSAtQTBbMF07XG4gICAgfVxuICB9XG4gIGlmKGk9PT0wKSB7XG4gICAgQTAgPSB4WzBdO1xuICAgIGZvcihqPW4tMTtqPj0xOy0taikge1xuICAgICAgcmV0W2pdWzBdID0gLUEwW2pdO1xuICAgICAgLS1qO1xuICAgICAgcmV0W2pdWzBdID0gLUEwW2pdO1xuICAgIH1cbiAgICBpZihqPT09MCkgeyByZXRbMF1bMF0gPSAtQTBbMF07IH1cbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5udW1lcmljLl9yYW5kb20gPSBmdW5jdGlvbiBfcmFuZG9tKHMsaykge1xuICB2YXIgaSxuPXNba10scmV0PUFycmF5KG4pLCBybmQ7XG4gIGlmKGsgPT09IHMubGVuZ3RoLTEpIHtcbiAgICBybmQgPSBNYXRoLnJhbmRvbTtcbiAgICBmb3IoaT1uLTE7aT49MTtpLT0yKSB7XG4gICAgICByZXRbaV0gPSBybmQoKTtcbiAgICAgIHJldFtpLTFdID0gcm5kKCk7XG4gICAgfVxuICAgIGlmKGk9PT0wKSB7IHJldFswXSA9IHJuZCgpOyB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICBmb3IoaT1uLTE7aT49MDtpLS0pIHJldFtpXSA9IF9yYW5kb20ocyxrKzEpO1xuICByZXR1cm4gcmV0O1xufVxubnVtZXJpYy5yYW5kb20gPSBmdW5jdGlvbiByYW5kb20ocykgeyByZXR1cm4gbnVtZXJpYy5fcmFuZG9tKHMsMCk7IH1cblxubnVtZXJpYy5ub3JtMiA9IGZ1bmN0aW9uIG5vcm0yKHgpIHsgcmV0dXJuIE1hdGguc3FydChudW1lcmljLm5vcm0yU3F1YXJlZCh4KSk7IH1cblxubnVtZXJpYy5saW5zcGFjZSA9IGZ1bmN0aW9uIGxpbnNwYWNlKGEsYixuKSB7XG4gIGlmKHR5cGVvZiBuID09PSBcInVuZGVmaW5lZFwiKSBuID0gTWF0aC5tYXgoTWF0aC5yb3VuZChiLWEpKzEsMSk7XG4gIGlmKG48MikgeyByZXR1cm4gbj09PTE/W2FdOltdOyB9XG4gIHZhciBpLHJldCA9IEFycmF5KG4pO1xuICBuLS07XG4gIGZvcihpPW47aT49MDtpLS0pIHsgcmV0W2ldID0gKGkqYisobi1pKSphKS9uOyB9XG4gIHJldHVybiByZXQ7XG59XG5cbm51bWVyaWMuZ2V0QmxvY2sgPSBmdW5jdGlvbiBnZXRCbG9jayh4LGZyb20sdG8pIHtcbiAgdmFyIHMgPSBudW1lcmljLmRpbSh4KTtcbiAgZnVuY3Rpb24gZm9vKHgsaykge1xuICAgIHZhciBpLGEgPSBmcm9tW2tdLCBuID0gdG9ba10tYSwgcmV0ID0gQXJyYXkobik7XG4gICAgaWYoayA9PT0gcy5sZW5ndGgtMSkge1xuICAgICAgZm9yKGk9bjtpPj0wO2ktLSkgeyByZXRbaV0gPSB4W2krYV07IH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGZvcihpPW47aT49MDtpLS0pIHsgcmV0W2ldID0gZm9vKHhbaSthXSxrKzEpOyB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICByZXR1cm4gZm9vKHgsMCk7XG59XG5cbm51bWVyaWMuc2V0QmxvY2sgPSBmdW5jdGlvbiBzZXRCbG9jayh4LGZyb20sdG8sQikge1xuICB2YXIgcyA9IG51bWVyaWMuZGltKHgpO1xuICBmdW5jdGlvbiBmb28oeCx5LGspIHtcbiAgICB2YXIgaSxhID0gZnJvbVtrXSwgbiA9IHRvW2tdLWE7XG4gICAgaWYoayA9PT0gcy5sZW5ndGgtMSkgeyBmb3IoaT1uO2k+PTA7aS0tKSB7IHhbaSthXSA9IHlbaV07IH0gfVxuICAgIGZvcihpPW47aT49MDtpLS0pIHsgZm9vKHhbaSthXSx5W2ldLGsrMSk7IH1cbiAgfVxuICBmb28oeCxCLDApO1xuICByZXR1cm4geDtcbn1cblxubnVtZXJpYy5nZXRSYW5nZSA9IGZ1bmN0aW9uIGdldFJhbmdlKEEsSSxKKSB7XG4gIHZhciBtID0gSS5sZW5ndGgsIG4gPSBKLmxlbmd0aDtcbiAgdmFyIGksajtcbiAgdmFyIEIgPSBBcnJheShtKSwgQmksIEFJO1xuICBmb3IoaT1tLTE7aSE9PS0xOy0taSkge1xuICAgIEJbaV0gPSBBcnJheShuKTtcbiAgICBCaSA9IEJbaV07XG4gICAgQUkgPSBBW0lbaV1dO1xuICAgIGZvcihqPW4tMTtqIT09LTE7LS1qKSBCaVtqXSA9IEFJW0pbal1dO1xuICB9XG4gIHJldHVybiBCO1xufVxuXG5udW1lcmljLmJsb2NrTWF0cml4ID0gZnVuY3Rpb24gYmxvY2tNYXRyaXgoWCkge1xuICB2YXIgcyA9IG51bWVyaWMuZGltKFgpO1xuICBpZihzLmxlbmd0aDw0KSByZXR1cm4gbnVtZXJpYy5ibG9ja01hdHJpeChbWF0pO1xuICB2YXIgbT1zWzBdLG49c1sxXSxNLE4saSxqLFhpajtcbiAgTSA9IDA7IE4gPSAwO1xuICBmb3IoaT0wO2k8bTsrK2kpIE0rPVhbaV1bMF0ubGVuZ3RoO1xuICBmb3Ioaj0wO2o8bjsrK2opIE4rPVhbMF1bal1bMF0ubGVuZ3RoO1xuICB2YXIgWiA9IEFycmF5KE0pO1xuICBmb3IoaT0wO2k8TTsrK2kpIFpbaV0gPSBBcnJheShOKTtcbiAgdmFyIEk9MCxKLFpJLGssbCxYaWprO1xuICBmb3IoaT0wO2k8bTsrK2kpIHtcbiAgICBKPU47XG4gICAgZm9yKGo9bi0xO2ohPT0tMTstLWopIHtcbiAgICAgIFhpaiA9IFhbaV1bal07XG4gICAgICBKIC09IFhpalswXS5sZW5ndGg7XG4gICAgICBmb3Ioaz1YaWoubGVuZ3RoLTE7ayE9PS0xOy0taykge1xuICAgICAgICBYaWprID0gWGlqW2tdO1xuICAgICAgICBaSSA9IFpbSStrXTtcbiAgICAgICAgZm9yKGwgPSBYaWprLmxlbmd0aC0xO2whPT0tMTstLWwpIFpJW0orbF0gPSBYaWprW2xdO1xuICAgICAgfVxuICAgIH1cbiAgICBJICs9IFhbaV1bMF0ubGVuZ3RoO1xuICB9XG4gIHJldHVybiBaO1xufVxuXG5udW1lcmljLnRlbnNvciA9IGZ1bmN0aW9uIHRlbnNvcih4LHkpIHtcbiAgaWYodHlwZW9mIHggPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIHkgPT09IFwibnVtYmVyXCIpIHJldHVybiBudW1lcmljLm11bCh4LHkpO1xuICB2YXIgczEgPSBudW1lcmljLmRpbSh4KSwgczIgPSBudW1lcmljLmRpbSh5KTtcbiAgaWYoczEubGVuZ3RoICE9PSAxIHx8IHMyLmxlbmd0aCAhPT0gMSkge1xuICAgIHRocm93IG5ldyBFcnJvcignbnVtZXJpYzogdGVuc29yIHByb2R1Y3QgaXMgb25seSBkZWZpbmVkIGZvciB2ZWN0b3JzJyk7XG4gIH1cbiAgdmFyIG0gPSBzMVswXSwgbiA9IHMyWzBdLCBBID0gQXJyYXkobSksIEFpLCBpLGoseGk7XG4gIGZvcihpPW0tMTtpPj0wO2ktLSkge1xuICAgIEFpID0gQXJyYXkobik7XG4gICAgeGkgPSB4W2ldO1xuICAgIGZvcihqPW4tMTtqPj0zOy0taikge1xuICAgICAgQWlbal0gPSB4aSAqIHlbal07XG4gICAgICAtLWo7XG4gICAgICBBaVtqXSA9IHhpICogeVtqXTtcbiAgICAgIC0tajtcbiAgICAgIEFpW2pdID0geGkgKiB5W2pdO1xuICAgICAgLS1qO1xuICAgICAgQWlbal0gPSB4aSAqIHlbal07XG4gICAgfVxuICAgIHdoaWxlKGo+PTApIHsgQWlbal0gPSB4aSAqIHlbal07IC0tajsgfVxuICAgIEFbaV0gPSBBaTtcbiAgfVxuICByZXR1cm4gQTtcbn1cblxuLy8gMy4gVGhlIFRlbnNvciB0eXBlIFRcbm51bWVyaWMuVCA9IGZ1bmN0aW9uIFQoeCx5KSB7IHRoaXMueCA9IHg7IHRoaXMueSA9IHk7IH1cbm51bWVyaWMudCA9IGZ1bmN0aW9uIHQoeCx5KSB7IHJldHVybiBuZXcgbnVtZXJpYy5UKHgseSk7IH1cblxubnVtZXJpYy5UYmlub3AgPSBmdW5jdGlvbiBUYmlub3AocnIscmMsY3IsY2Msc2V0dXApIHtcbiAgdmFyIGlvID0gbnVtZXJpYy5pbmRleE9mO1xuICBpZih0eXBlb2Ygc2V0dXAgIT09IFwic3RyaW5nXCIpIHtcbiAgICB2YXIgaztcbiAgICBzZXR1cCA9ICcnO1xuICAgIGZvcihrIGluIG51bWVyaWMpIHtcbiAgICAgIGlmKG51bWVyaWMuaGFzT3duUHJvcGVydHkoaykgJiYgKHJyLmluZGV4T2Yoayk+PTAgfHwgcmMuaW5kZXhPZihrKT49MCB8fCBjci5pbmRleE9mKGspPj0wIHx8IGNjLmluZGV4T2Yoayk+PTApICYmIGsubGVuZ3RoPjEpIHtcbiAgICAgICAgc2V0dXAgKz0gJ3ZhciAnK2srJyA9IG51bWVyaWMuJytrKyc7XFxuJztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIEZ1bmN0aW9uKFsneSddLFxuICAgICd2YXIgeCA9IHRoaXM7XFxuJytcbiAgICAnaWYoISh5IGluc3RhbmNlb2YgbnVtZXJpYy5UKSkgeyB5ID0gbmV3IG51bWVyaWMuVCh5KTsgfVxcbicrXG4gICAgc2V0dXArJ1xcbicrXG4gICAgJ2lmKHgueSkgeycrXG4gICAgJyAgaWYoeS55KSB7JytcbiAgICAnICAgIHJldHVybiBuZXcgbnVtZXJpYy5UKCcrY2MrJyk7XFxuJytcbiAgICAnICB9XFxuJytcbiAgICAnICByZXR1cm4gbmV3IG51bWVyaWMuVCgnK2NyKycpO1xcbicrXG4gICAgJ31cXG4nK1xuICAgICdpZih5LnkpIHtcXG4nK1xuICAgICcgIHJldHVybiBuZXcgbnVtZXJpYy5UKCcrcmMrJyk7XFxuJytcbiAgICAnfVxcbicrXG4gICAgJ3JldHVybiBuZXcgbnVtZXJpYy5UKCcrcnIrJyk7XFxuJ1xuICApO1xufVxuXG5udW1lcmljLlQucHJvdG90eXBlLmFkZCA9IG51bWVyaWMuVGJpbm9wKFxuICAnYWRkKHgueCx5LngpJyxcbiAgJ2FkZCh4LngseS54KSx5LnknLFxuICAnYWRkKHgueCx5LngpLHgueScsXG4gICdhZGQoeC54LHkueCksYWRkKHgueSx5LnkpJyk7XG5udW1lcmljLlQucHJvdG90eXBlLnN1YiA9IG51bWVyaWMuVGJpbm9wKFxuICAnc3ViKHgueCx5LngpJyxcbiAgJ3N1Yih4LngseS54KSxuZWcoeS55KScsXG4gICdzdWIoeC54LHkueCkseC55JyxcbiAgJ3N1Yih4LngseS54KSxzdWIoeC55LHkueSknKTtcbm51bWVyaWMuVC5wcm90b3R5cGUubXVsID0gbnVtZXJpYy5UYmlub3AoXG4gICdtdWwoeC54LHkueCknLFxuICAnbXVsKHgueCx5LngpLG11bCh4LngseS55KScsXG4gICdtdWwoeC54LHkueCksbXVsKHgueSx5LngpJyxcbiAgJ3N1YihtdWwoeC54LHkueCksbXVsKHgueSx5LnkpKSxhZGQobXVsKHgueCx5LnkpLG11bCh4LnkseS54KSknKTtcblxubnVtZXJpYy5ULnByb3RvdHlwZS5yZWNpcHJvY2FsID0gZnVuY3Rpb24gcmVjaXByb2NhbCgpIHtcbiAgdmFyIG11bCA9IG51bWVyaWMubXVsLCBkaXYgPSBudW1lcmljLmRpdjtcbiAgaWYodGhpcy55KSB7XG4gICAgdmFyIGQgPSBudW1lcmljLmFkZChtdWwodGhpcy54LHRoaXMueCksbXVsKHRoaXMueSx0aGlzLnkpKTtcbiAgICByZXR1cm4gbmV3IG51bWVyaWMuVChkaXYodGhpcy54LGQpLGRpdihudW1lcmljLm5lZyh0aGlzLnkpLGQpKTtcbiAgfVxuICByZXR1cm4gbmV3IFQoZGl2KDEsdGhpcy54KSk7XG59XG5udW1lcmljLlQucHJvdG90eXBlLmRpdiA9IGZ1bmN0aW9uIGRpdih5KSB7XG4gIGlmKCEoeSBpbnN0YW5jZW9mIG51bWVyaWMuVCkpIHkgPSBuZXcgbnVtZXJpYy5UKHkpO1xuICBpZih5LnkpIHsgcmV0dXJuIHRoaXMubXVsKHkucmVjaXByb2NhbCgpKTsgfVxuICB2YXIgZGl2ID0gbnVtZXJpYy5kaXY7XG4gIGlmKHRoaXMueSkgeyByZXR1cm4gbmV3IG51bWVyaWMuVChkaXYodGhpcy54LHkueCksZGl2KHRoaXMueSx5LngpKTsgfVxuICByZXR1cm4gbmV3IG51bWVyaWMuVChkaXYodGhpcy54LHkueCkpO1xufVxubnVtZXJpYy5ULnByb3RvdHlwZS5kb3QgPSBudW1lcmljLlRiaW5vcChcbiAgJ2RvdCh4LngseS54KScsXG4gICdkb3QoeC54LHkueCksZG90KHgueCx5LnkpJyxcbiAgJ2RvdCh4LngseS54KSxkb3QoeC55LHkueCknLFxuICAnc3ViKGRvdCh4LngseS54KSxkb3QoeC55LHkueSkpLGFkZChkb3QoeC54LHkueSksZG90KHgueSx5LngpKSdcbik7XG5udW1lcmljLlQucHJvdG90eXBlLnRyYW5zcG9zZSA9IGZ1bmN0aW9uIHRyYW5zcG9zZSgpIHtcbiAgdmFyIHQgPSBudW1lcmljLnRyYW5zcG9zZSwgeCA9IHRoaXMueCwgeSA9IHRoaXMueTtcbiAgaWYoeSkgeyByZXR1cm4gbmV3IG51bWVyaWMuVCh0KHgpLHQoeSkpOyB9XG4gIHJldHVybiBuZXcgbnVtZXJpYy5UKHQoeCkpO1xufVxubnVtZXJpYy5ULnByb3RvdHlwZS50cmFuc2p1Z2F0ZSA9IGZ1bmN0aW9uIHRyYW5zanVnYXRlKCkge1xuICB2YXIgdCA9IG51bWVyaWMudHJhbnNwb3NlLCB4ID0gdGhpcy54LCB5ID0gdGhpcy55O1xuICBpZih5KSB7IHJldHVybiBuZXcgbnVtZXJpYy5UKHQoeCksbnVtZXJpYy5uZWd0cmFuc3Bvc2UoeSkpOyB9XG4gIHJldHVybiBuZXcgbnVtZXJpYy5UKHQoeCkpO1xufVxubnVtZXJpYy5UdW5vcCA9IGZ1bmN0aW9uIFR1bm9wKHIsYyxzKSB7XG4gIGlmKHR5cGVvZiBzICE9PSBcInN0cmluZ1wiKSB7IHMgPSAnJzsgfVxuICByZXR1cm4gRnVuY3Rpb24oXG4gICAgJ3ZhciB4ID0gdGhpcztcXG4nK1xuICAgIHMrJ1xcbicrXG4gICAgJ2lmKHgueSkgeycrXG4gICAgJyAgJytjKyc7XFxuJytcbiAgICAnfVxcbicrXG4gICAgcisnO1xcbidcbiAgKTtcbn1cblxubnVtZXJpYy5ULnByb3RvdHlwZS5leHAgPSBudW1lcmljLlR1bm9wKFxuICAncmV0dXJuIG5ldyBudW1lcmljLlQoZXgpJyxcbiAgJ3JldHVybiBuZXcgbnVtZXJpYy5UKG11bChjb3MoeC55KSxleCksbXVsKHNpbih4LnkpLGV4KSknLFxuICAndmFyIGV4ID0gbnVtZXJpYy5leHAoeC54KSwgY29zID0gbnVtZXJpYy5jb3MsIHNpbiA9IG51bWVyaWMuc2luLCBtdWwgPSBudW1lcmljLm11bDsnKTtcbm51bWVyaWMuVC5wcm90b3R5cGUuY29uaiA9IG51bWVyaWMuVHVub3AoXG4gICdyZXR1cm4gbmV3IG51bWVyaWMuVCh4LngpOycsXG4gICdyZXR1cm4gbmV3IG51bWVyaWMuVCh4LngsbnVtZXJpYy5uZWcoeC55KSk7Jyk7XG5udW1lcmljLlQucHJvdG90eXBlLm5lZyA9IG51bWVyaWMuVHVub3AoXG4gICdyZXR1cm4gbmV3IG51bWVyaWMuVChuZWcoeC54KSk7JyxcbiAgJ3JldHVybiBuZXcgbnVtZXJpYy5UKG5lZyh4LngpLG5lZyh4LnkpKTsnLFxuICAndmFyIG5lZyA9IG51bWVyaWMubmVnOycpO1xubnVtZXJpYy5ULnByb3RvdHlwZS5zaW4gPSBudW1lcmljLlR1bm9wKFxuICAncmV0dXJuIG5ldyBudW1lcmljLlQobnVtZXJpYy5zaW4oeC54KSknLFxuICAncmV0dXJuIHguZXhwKCkuc3ViKHgubmVnKCkuZXhwKCkpLmRpdihuZXcgbnVtZXJpYy5UKDAsMikpOycpO1xubnVtZXJpYy5ULnByb3RvdHlwZS5jb3MgPSBudW1lcmljLlR1bm9wKFxuICAncmV0dXJuIG5ldyBudW1lcmljLlQobnVtZXJpYy5jb3MoeC54KSknLFxuICAncmV0dXJuIHguZXhwKCkuYWRkKHgubmVnKCkuZXhwKCkpLmRpdigyKTsnKTtcbm51bWVyaWMuVC5wcm90b3R5cGUuYWJzID0gbnVtZXJpYy5UdW5vcChcbiAgJ3JldHVybiBuZXcgbnVtZXJpYy5UKG51bWVyaWMuYWJzKHgueCkpOycsXG4gICdyZXR1cm4gbmV3IG51bWVyaWMuVChudW1lcmljLnNxcnQobnVtZXJpYy5hZGQobXVsKHgueCx4LngpLG11bCh4LnkseC55KSkpKTsnLFxuICAndmFyIG11bCA9IG51bWVyaWMubXVsOycpO1xubnVtZXJpYy5ULnByb3RvdHlwZS5sb2cgPSBudW1lcmljLlR1bm9wKFxuICAncmV0dXJuIG5ldyBudW1lcmljLlQobnVtZXJpYy5sb2coeC54KSk7JyxcbiAgJ3ZhciB0aGV0YSA9IG5ldyBudW1lcmljLlQobnVtZXJpYy5hdGFuMih4LnkseC54KSksIHIgPSB4LmFicygpO1xcbicrXG4gICdyZXR1cm4gbmV3IG51bWVyaWMuVChudW1lcmljLmxvZyhyLngpLHRoZXRhLngpOycpO1xubnVtZXJpYy5ULnByb3RvdHlwZS5ub3JtMiA9IG51bWVyaWMuVHVub3AoXG4gICdyZXR1cm4gbnVtZXJpYy5ub3JtMih4LngpOycsXG4gICd2YXIgZiA9IG51bWVyaWMubm9ybTJTcXVhcmVkO1xcbicrXG4gICdyZXR1cm4gTWF0aC5zcXJ0KGYoeC54KStmKHgueSkpOycpO1xubnVtZXJpYy5ULnByb3RvdHlwZS5pbnYgPSBmdW5jdGlvbiBpbnYoKSB7XG4gIHZhciBBID0gdGhpcztcbiAgaWYodHlwZW9mIEEueSA9PT0gXCJ1bmRlZmluZWRcIikgeyByZXR1cm4gbmV3IG51bWVyaWMuVChudW1lcmljLmludihBLngpKTsgfVxuICB2YXIgbiA9IEEueC5sZW5ndGgsIGksIGosIGs7XG4gIHZhciBSeCA9IG51bWVyaWMuaWRlbnRpdHkobiksUnkgPSBudW1lcmljLnJlcChbbixuXSwwKTtcbiAgdmFyIEF4ID0gbnVtZXJpYy5jbG9uZShBLngpLCBBeSA9IG51bWVyaWMuY2xvbmUoQS55KTtcbiAgdmFyIEFpeCwgQWl5LCBBangsIEFqeSwgUml4LCBSaXksIFJqeCwgUmp5O1xuICB2YXIgaSxqLGssZCxkMSxheCxheSxieCxieSx0ZW1wO1xuICBmb3IoaT0wO2k8bjtpKyspIHtcbiAgICBheCA9IEF4W2ldW2ldOyBheSA9IEF5W2ldW2ldO1xuICAgIGQgPSBheCpheCtheSpheTtcbiAgICBrID0gaTtcbiAgICBmb3Ioaj1pKzE7ajxuO2orKykge1xuICAgICAgYXggPSBBeFtqXVtpXTsgYXkgPSBBeVtqXVtpXTtcbiAgICAgIGQxID0gYXgqYXgrYXkqYXk7XG4gICAgICBpZihkMSA+IGQpIHsgaz1qOyBkID0gZDE7IH1cbiAgICB9XG4gICAgaWYoayE9PWkpIHtcbiAgICAgIHRlbXAgPSBBeFtpXTsgQXhbaV0gPSBBeFtrXTsgQXhba10gPSB0ZW1wO1xuICAgICAgdGVtcCA9IEF5W2ldOyBBeVtpXSA9IEF5W2tdOyBBeVtrXSA9IHRlbXA7XG4gICAgICB0ZW1wID0gUnhbaV07IFJ4W2ldID0gUnhba107IFJ4W2tdID0gdGVtcDtcbiAgICAgIHRlbXAgPSBSeVtpXTsgUnlbaV0gPSBSeVtrXTsgUnlba10gPSB0ZW1wO1xuICAgIH1cbiAgICBBaXggPSBBeFtpXTsgQWl5ID0gQXlbaV07XG4gICAgUml4ID0gUnhbaV07IFJpeSA9IFJ5W2ldO1xuICAgIGF4ID0gQWl4W2ldOyBheSA9IEFpeVtpXTtcbiAgICBmb3Ioaj1pKzE7ajxuO2orKykge1xuICAgICAgYnggPSBBaXhbal07IGJ5ID0gQWl5W2pdO1xuICAgICAgQWl4W2pdID0gKGJ4KmF4K2J5KmF5KS9kO1xuICAgICAgQWl5W2pdID0gKGJ5KmF4LWJ4KmF5KS9kO1xuICAgIH1cbiAgICBmb3Ioaj0wO2o8bjtqKyspIHtcbiAgICAgIGJ4ID0gUml4W2pdOyBieSA9IFJpeVtqXTtcbiAgICAgIFJpeFtqXSA9IChieCpheCtieSpheSkvZDtcbiAgICAgIFJpeVtqXSA9IChieSpheC1ieCpheSkvZDtcbiAgICB9XG4gICAgZm9yKGo9aSsxO2o8bjtqKyspIHtcbiAgICAgIEFqeCA9IEF4W2pdOyBBankgPSBBeVtqXTtcbiAgICAgIFJqeCA9IFJ4W2pdOyBSankgPSBSeVtqXTtcbiAgICAgIGF4ID0gQWp4W2ldOyBheSA9IEFqeVtpXTtcbiAgICAgIGZvcihrPWkrMTtrPG47aysrKSB7XG4gICAgICAgIGJ4ID0gQWl4W2tdOyBieSA9IEFpeVtrXTtcbiAgICAgICAgQWp4W2tdIC09IGJ4KmF4LWJ5KmF5O1xuICAgICAgICBBanlba10gLT0gYnkqYXgrYngqYXk7XG4gICAgICB9XG4gICAgICBmb3Ioaz0wO2s8bjtrKyspIHtcbiAgICAgICAgYnggPSBSaXhba107IGJ5ID0gUml5W2tdO1xuICAgICAgICBSanhba10gLT0gYngqYXgtYnkqYXk7XG4gICAgICAgIFJqeVtrXSAtPSBieSpheCtieCpheTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yKGk9bi0xO2k+MDtpLS0pIHtcbiAgICBSaXggPSBSeFtpXTsgUml5ID0gUnlbaV07XG4gICAgZm9yKGo9aS0xO2o+PTA7ai0tKSB7XG4gICAgICBSanggPSBSeFtqXTsgUmp5ID0gUnlbal07XG4gICAgICBheCA9IEF4W2pdW2ldOyBheSA9IEF5W2pdW2ldO1xuICAgICAgZm9yKGs9bi0xO2s+PTA7ay0tKSB7XG4gICAgICAgIGJ4ID0gUml4W2tdOyBieSA9IFJpeVtrXTtcbiAgICAgICAgUmp4W2tdIC09IGF4KmJ4IC0gYXkqYnk7XG4gICAgICAgIFJqeVtrXSAtPSBheCpieSArIGF5KmJ4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3IG51bWVyaWMuVChSeCxSeSk7XG59XG5udW1lcmljLlQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldChpKSB7XG4gIHZhciB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCBrID0gMCwgaWssIG4gPSBpLmxlbmd0aDtcbiAgaWYoeSkge1xuICAgIHdoaWxlKGs8bikge1xuICAgICAgaWsgPSBpW2tdO1xuICAgICAgeCA9IHhbaWtdO1xuICAgICAgeSA9IHlbaWtdO1xuICAgICAgaysrO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IG51bWVyaWMuVCh4LHkpO1xuICB9XG4gIHdoaWxlKGs8bikge1xuICAgIGlrID0gaVtrXTtcbiAgICB4ID0geFtpa107XG4gICAgaysrO1xuICB9XG4gIHJldHVybiBuZXcgbnVtZXJpYy5UKHgpO1xufVxubnVtZXJpYy5ULnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQoaSx2KSB7XG4gIHZhciB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCBrID0gMCwgaWssIG4gPSBpLmxlbmd0aCwgdnggPSB2LngsIHZ5ID0gdi55O1xuICBpZihuPT09MCkge1xuICAgIGlmKHZ5KSB7IHRoaXMueSA9IHZ5OyB9XG4gICAgZWxzZSBpZih5KSB7IHRoaXMueSA9IHVuZGVmaW5lZDsgfVxuICAgIHRoaXMueCA9IHg7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgaWYodnkpIHtcbiAgICBpZih5KSB7IC8qIG9rICovIH1cbiAgICBlbHNlIHtcbiAgICAgIHkgPSBudW1lcmljLnJlcChudW1lcmljLmRpbSh4KSwwKTtcbiAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuICAgIHdoaWxlKGs8bi0xKSB7XG4gICAgICBpayA9IGlba107XG4gICAgICB4ID0geFtpa107XG4gICAgICB5ID0geVtpa107XG4gICAgICBrKys7XG4gICAgfVxuICAgIGlrID0gaVtrXTtcbiAgICB4W2lrXSA9IHZ4O1xuICAgIHlbaWtdID0gdnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgaWYoeSkge1xuICAgIHdoaWxlKGs8bi0xKSB7XG4gICAgICBpayA9IGlba107XG4gICAgICB4ID0geFtpa107XG4gICAgICB5ID0geVtpa107XG4gICAgICBrKys7XG4gICAgfVxuICAgIGlrID0gaVtrXTtcbiAgICB4W2lrXSA9IHZ4O1xuICAgIGlmKHZ4IGluc3RhbmNlb2YgQXJyYXkpIHlbaWtdID0gbnVtZXJpYy5yZXAobnVtZXJpYy5kaW0odngpLDApO1xuICAgIGVsc2UgeVtpa10gPSAwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHdoaWxlKGs8bi0xKSB7XG4gICAgaWsgPSBpW2tdO1xuICAgIHggPSB4W2lrXTtcbiAgICBrKys7XG4gIH1cbiAgaWsgPSBpW2tdO1xuICB4W2lrXSA9IHZ4O1xuICByZXR1cm4gdGhpcztcbn1cbm51bWVyaWMuVC5wcm90b3R5cGUuZ2V0Um93cyA9IGZ1bmN0aW9uIGdldFJvd3MoaTAsaTEpIHtcbiAgdmFyIG4gPSBpMS1pMCsxLCBqO1xuICB2YXIgcnggPSBBcnJheShuKSwgcnksIHggPSB0aGlzLngsIHkgPSB0aGlzLnk7XG4gIGZvcihqPWkwO2o8PWkxO2orKykgeyByeFtqLWkwXSA9IHhbal07IH1cbiAgaWYoeSkge1xuICAgIHJ5ID0gQXJyYXkobik7XG4gICAgZm9yKGo9aTA7ajw9aTE7aisrKSB7IHJ5W2otaTBdID0geVtqXTsgfVxuICAgIHJldHVybiBuZXcgbnVtZXJpYy5UKHJ4LHJ5KTtcbiAgfVxuICByZXR1cm4gbmV3IG51bWVyaWMuVChyeCk7XG59XG5udW1lcmljLlQucHJvdG90eXBlLnNldFJvd3MgPSBmdW5jdGlvbiBzZXRSb3dzKGkwLGkxLEEpIHtcbiAgdmFyIGo7XG4gIHZhciByeCA9IHRoaXMueCwgcnkgPSB0aGlzLnksIHggPSBBLngsIHkgPSBBLnk7XG4gIGZvcihqPWkwO2o8PWkxO2orKykgeyByeFtqXSA9IHhbai1pMF07IH1cbiAgaWYoeSkge1xuICAgIGlmKCFyeSkgeyByeSA9IG51bWVyaWMucmVwKG51bWVyaWMuZGltKHJ4KSwwKTsgdGhpcy55ID0gcnk7IH1cbiAgICBmb3Ioaj1pMDtqPD1pMTtqKyspIHsgcnlbal0gPSB5W2otaTBdOyB9XG4gIH0gZWxzZSBpZihyeSkge1xuICAgIGZvcihqPWkwO2o8PWkxO2orKykgeyByeVtqXSA9IG51bWVyaWMucmVwKFt4W2otaTBdLmxlbmd0aF0sMCk7IH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbm51bWVyaWMuVC5wcm90b3R5cGUuZ2V0Um93ID0gZnVuY3Rpb24gZ2V0Um93KGspIHtcbiAgdmFyIHggPSB0aGlzLngsIHkgPSB0aGlzLnk7XG4gIGlmKHkpIHsgcmV0dXJuIG5ldyBudW1lcmljLlQoeFtrXSx5W2tdKTsgfVxuICByZXR1cm4gbmV3IG51bWVyaWMuVCh4W2tdKTtcbn1cbm51bWVyaWMuVC5wcm90b3R5cGUuc2V0Um93ID0gZnVuY3Rpb24gc2V0Um93KGksdikge1xuICB2YXIgcnggPSB0aGlzLngsIHJ5ID0gdGhpcy55LCB4ID0gdi54LCB5ID0gdi55O1xuICByeFtpXSA9IHg7XG4gIGlmKHkpIHtcbiAgICBpZighcnkpIHsgcnkgPSBudW1lcmljLnJlcChudW1lcmljLmRpbShyeCksMCk7IHRoaXMueSA9IHJ5OyB9XG4gICAgcnlbaV0gPSB5O1xuICB9IGVsc2UgaWYocnkpIHtcbiAgICByeSA9IG51bWVyaWMucmVwKFt4Lmxlbmd0aF0sMCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbm51bWVyaWMuVC5wcm90b3R5cGUuZ2V0QmxvY2sgPSBmdW5jdGlvbiBnZXRCbG9jayhmcm9tLHRvKSB7XG4gIHZhciB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCBiID0gbnVtZXJpYy5nZXRCbG9jaztcbiAgaWYoeSkgeyByZXR1cm4gbmV3IG51bWVyaWMuVChiKHgsZnJvbSx0byksYih5LGZyb20sdG8pKTsgfVxuICByZXR1cm4gbmV3IG51bWVyaWMuVChiKHgsZnJvbSx0bykpO1xufVxubnVtZXJpYy5ULnByb3RvdHlwZS5zZXRCbG9jayA9IGZ1bmN0aW9uIHNldEJsb2NrKGZyb20sdG8sQSkge1xuICBpZighKEEgaW5zdGFuY2VvZiBudW1lcmljLlQpKSBBID0gbmV3IG51bWVyaWMuVChBKTtcbiAgdmFyIHggPSB0aGlzLngsIHkgPSB0aGlzLnksIGIgPSBudW1lcmljLnNldEJsb2NrLCBBeCA9IEEueCwgQXkgPSBBLnk7XG4gIGlmKEF5KSB7XG4gICAgaWYoIXkpIHsgdGhpcy55ID0gbnVtZXJpYy5yZXAobnVtZXJpYy5kaW0odGhpcyksMCk7IHkgPSB0aGlzLnk7IH1cbiAgICBiKHgsZnJvbSx0byxBeCk7XG4gICAgYih5LGZyb20sdG8sQXkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGIoeCxmcm9tLHRvLEF4KTtcbiAgaWYoeSkgYih5LGZyb20sdG8sbnVtZXJpYy5yZXAobnVtZXJpYy5kaW0oQXgpLDApKTtcbn1cbm51bWVyaWMuVC5yZXAgPSBmdW5jdGlvbiByZXAocyx2KSB7XG4gIHZhciBUID0gbnVtZXJpYy5UO1xuICBpZighKHYgaW5zdGFuY2VvZiBUKSkgdiA9IG5ldyBUKHYpO1xuICB2YXIgeCA9IHYueCwgeSA9IHYueSwgciA9IG51bWVyaWMucmVwO1xuICBpZih5KSByZXR1cm4gbmV3IFQocihzLHgpLHIocyx5KSk7XG4gIHJldHVybiBuZXcgVChyKHMseCkpO1xufVxubnVtZXJpYy5ULmRpYWcgPSBmdW5jdGlvbiBkaWFnKGQpIHtcbiAgaWYoIShkIGluc3RhbmNlb2YgbnVtZXJpYy5UKSkgZCA9IG5ldyBudW1lcmljLlQoZCk7XG4gIHZhciB4ID0gZC54LCB5ID0gZC55LCBkaWFnID0gbnVtZXJpYy5kaWFnO1xuICBpZih5KSByZXR1cm4gbmV3IG51bWVyaWMuVChkaWFnKHgpLGRpYWcoeSkpO1xuICByZXR1cm4gbmV3IG51bWVyaWMuVChkaWFnKHgpKTtcbn1cbm51bWVyaWMuVC5laWcgPSBmdW5jdGlvbiBlaWcoKSB7XG4gIGlmKHRoaXMueSkgeyB0aHJvdyBuZXcgRXJyb3IoJ2VpZzogbm90IGltcGxlbWVudGVkIGZvciBjb21wbGV4IG1hdHJpY2VzLicpOyB9XG4gIHJldHVybiBudW1lcmljLmVpZyh0aGlzLngpO1xufVxubnVtZXJpYy5ULmlkZW50aXR5ID0gZnVuY3Rpb24gaWRlbnRpdHkobikgeyByZXR1cm4gbmV3IG51bWVyaWMuVChudW1lcmljLmlkZW50aXR5KG4pKTsgfVxubnVtZXJpYy5ULnByb3RvdHlwZS5nZXREaWFnID0gZnVuY3Rpb24gZ2V0RGlhZygpIHtcbiAgdmFyIG4gPSBudW1lcmljO1xuICB2YXIgeCA9IHRoaXMueCwgeSA9IHRoaXMueTtcbiAgaWYoeSkgeyByZXR1cm4gbmV3IG4uVChuLmdldERpYWcoeCksbi5nZXREaWFnKHkpKTsgfVxuICByZXR1cm4gbmV3IG4uVChuLmdldERpYWcoeCkpO1xufVxuXG4vLyA0LiBFaWdlbnZhbHVlcyBvZiByZWFsIG1hdHJpY2VzXG5cbm51bWVyaWMuaG91c2UgPSBmdW5jdGlvbiBob3VzZSh4KSB7XG4gIHZhciB2ID0gbnVtZXJpYy5jbG9uZSh4KTtcbiAgdmFyIHMgPSB4WzBdID49IDAgPyAxIDogLTE7XG4gIHZhciBhbHBoYSA9IHMqbnVtZXJpYy5ub3JtMih4KTtcbiAgdlswXSArPSBhbHBoYTtcbiAgdmFyIGZvbyA9IG51bWVyaWMubm9ybTIodik7XG4gIGlmKGZvbyA9PT0gMCkgeyAvKiB0aGlzIHNob3VsZCBub3QgaGFwcGVuICovIHRocm93IG5ldyBFcnJvcignZWlnOiBpbnRlcm5hbCBlcnJvcicpOyB9XG4gIHJldHVybiBudW1lcmljLmRpdih2LGZvbyk7XG59XG5cbm51bWVyaWMudG9VcHBlckhlc3NlbmJlcmcgPSBmdW5jdGlvbiB0b1VwcGVySGVzc2VuYmVyZyhtZSkge1xuICB2YXIgcyA9IG51bWVyaWMuZGltKG1lKTtcbiAgaWYocy5sZW5ndGggIT09IDIgfHwgc1swXSAhPT0gc1sxXSkgeyB0aHJvdyBuZXcgRXJyb3IoJ251bWVyaWM6IHRvVXBwZXJIZXNzZW5iZXJnKCkgb25seSB3b3JrcyBvbiBzcXVhcmUgbWF0cmljZXMnKTsgfVxuICB2YXIgbSA9IHNbMF0sIGksaixrLHgsdixBID0gbnVtZXJpYy5jbG9uZShtZSksQixDLEFpLENpLFEgPSBudW1lcmljLmlkZW50aXR5KG0pLFFpO1xuICBmb3Ioaj0wO2o8bS0yO2orKykge1xuICAgIHggPSBBcnJheShtLWotMSk7XG4gICAgZm9yKGk9aisxO2k8bTtpKyspIHsgeFtpLWotMV0gPSBBW2ldW2pdOyB9XG4gICAgaWYobnVtZXJpYy5ub3JtMih4KT4wKSB7XG4gICAgICB2ID0gbnVtZXJpYy5ob3VzZSh4KTtcbiAgICAgIEIgPSBudW1lcmljLmdldEJsb2NrKEEsW2orMSxqXSxbbS0xLG0tMV0pO1xuICAgICAgQyA9IG51bWVyaWMudGVuc29yKHYsbnVtZXJpYy5kb3QodixCKSk7XG4gICAgICBmb3IoaT1qKzE7aTxtO2krKykgeyBBaSA9IEFbaV07IENpID0gQ1tpLWotMV07IGZvcihrPWo7azxtO2srKykgQWlba10gLT0gMipDaVtrLWpdOyB9XG4gICAgICBCID0gbnVtZXJpYy5nZXRCbG9jayhBLFswLGorMV0sW20tMSxtLTFdKTtcbiAgICAgIEMgPSBudW1lcmljLnRlbnNvcihudW1lcmljLmRvdChCLHYpLHYpO1xuICAgICAgZm9yKGk9MDtpPG07aSsrKSB7IEFpID0gQVtpXTsgQ2kgPSBDW2ldOyBmb3Ioaz1qKzE7azxtO2srKykgQWlba10gLT0gMipDaVtrLWotMV07IH1cbiAgICAgIEIgPSBBcnJheShtLWotMSk7XG4gICAgICBmb3IoaT1qKzE7aTxtO2krKykgQltpLWotMV0gPSBRW2ldO1xuICAgICAgQyA9IG51bWVyaWMudGVuc29yKHYsbnVtZXJpYy5kb3QodixCKSk7XG4gICAgICBmb3IoaT1qKzE7aTxtO2krKykgeyBRaSA9IFFbaV07IENpID0gQ1tpLWotMV07IGZvcihrPTA7azxtO2srKykgUWlba10gLT0gMipDaVtrXTsgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ge0g6QSwgUTpRfTtcbn1cblxubnVtZXJpYy5lcHNpbG9uID0gMi4yMjA0NDYwNDkyNTAzMTNlLTE2O1xuXG5udW1lcmljLlFSRnJhbmNpcyA9IGZ1bmN0aW9uKEgsbWF4aXRlcikge1xuICBpZih0eXBlb2YgbWF4aXRlciA9PT0gXCJ1bmRlZmluZWRcIikgeyBtYXhpdGVyID0gMTAwMDA7IH1cbiAgSCA9IG51bWVyaWMuY2xvbmUoSCk7XG4gIHZhciBIMCA9IG51bWVyaWMuY2xvbmUoSCk7XG4gIHZhciBzID0gbnVtZXJpYy5kaW0oSCksbT1zWzBdLHgsdixhLGIsYyxkLGRldCx0ciwgSGxvYywgUSA9IG51bWVyaWMuaWRlbnRpdHkobSksIFFpLCBIaSwgQiwgQywgQ2ksaSxqLGssaXRlcjtcbiAgaWYobTwzKSB7IHJldHVybiB7UTpRLCBCOlsgWzAsbS0xXSBdfTsgfVxuICB2YXIgZXBzaWxvbiA9IG51bWVyaWMuZXBzaWxvbjtcbiAgZm9yKGl0ZXI9MDtpdGVyPG1heGl0ZXI7aXRlcisrKSB7XG4gICAgZm9yKGo9MDtqPG0tMTtqKyspIHtcbiAgICAgIGlmKE1hdGguYWJzKEhbaisxXVtqXSkgPCBlcHNpbG9uKihNYXRoLmFicyhIW2pdW2pdKStNYXRoLmFicyhIW2orMV1baisxXSkpKSB7XG4gICAgICAgIHZhciBRSDEgPSBudW1lcmljLlFSRnJhbmNpcyhudW1lcmljLmdldEJsb2NrKEgsWzAsMF0sW2osal0pLG1heGl0ZXIpO1xuICAgICAgICB2YXIgUUgyID0gbnVtZXJpYy5RUkZyYW5jaXMobnVtZXJpYy5nZXRCbG9jayhILFtqKzEsaisxXSxbbS0xLG0tMV0pLG1heGl0ZXIpO1xuICAgICAgICBCID0gQXJyYXkoaisxKTtcbiAgICAgICAgZm9yKGk9MDtpPD1qO2krKykgeyBCW2ldID0gUVtpXTsgfVxuICAgICAgICBDID0gbnVtZXJpYy5kb3QoUUgxLlEsQik7XG4gICAgICAgIGZvcihpPTA7aTw9ajtpKyspIHsgUVtpXSA9IENbaV07IH1cbiAgICAgICAgQiA9IEFycmF5KG0tai0xKTtcbiAgICAgICAgZm9yKGk9aisxO2k8bTtpKyspIHsgQltpLWotMV0gPSBRW2ldOyB9XG4gICAgICAgIEMgPSBudW1lcmljLmRvdChRSDIuUSxCKTtcbiAgICAgICAgZm9yKGk9aisxO2k8bTtpKyspIHsgUVtpXSA9IENbaS1qLTFdOyB9XG4gICAgICAgIHJldHVybiB7UTpRLEI6UUgxLkIuY29uY2F0KG51bWVyaWMuYWRkKFFIMi5CLGorMSkpfTtcbiAgICAgIH1cbiAgICB9XG4gICAgYSA9IEhbbS0yXVttLTJdOyBiID0gSFttLTJdW20tMV07XG4gICAgYyA9IEhbbS0xXVttLTJdOyBkID0gSFttLTFdW20tMV07XG4gICAgdHIgPSBhK2Q7XG4gICAgZGV0ID0gKGEqZC1iKmMpO1xuICAgIEhsb2MgPSBudW1lcmljLmdldEJsb2NrKEgsIFswLDBdLCBbMiwyXSk7XG4gICAgaWYodHIqdHI+PTQqZGV0KSB7XG4gICAgICB2YXIgczEsczI7XG4gICAgICBzMSA9IDAuNSoodHIrTWF0aC5zcXJ0KHRyKnRyLTQqZGV0KSk7XG4gICAgICBzMiA9IDAuNSoodHItTWF0aC5zcXJ0KHRyKnRyLTQqZGV0KSk7XG4gICAgICBIbG9jID0gbnVtZXJpYy5hZGQobnVtZXJpYy5zdWIobnVtZXJpYy5kb3QoSGxvYyxIbG9jKSxcbiAgICAgICAgbnVtZXJpYy5tdWwoSGxvYyxzMStzMikpLFxuICAgICAgICBudW1lcmljLmRpYWcobnVtZXJpYy5yZXAoWzNdLHMxKnMyKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBIbG9jID0gbnVtZXJpYy5hZGQobnVtZXJpYy5zdWIobnVtZXJpYy5kb3QoSGxvYyxIbG9jKSxcbiAgICAgICAgbnVtZXJpYy5tdWwoSGxvYyx0cikpLFxuICAgICAgICBudW1lcmljLmRpYWcobnVtZXJpYy5yZXAoWzNdLGRldCkpKTtcbiAgICB9XG4gICAgeCA9IFtIbG9jWzBdWzBdLEhsb2NbMV1bMF0sSGxvY1syXVswXV07XG4gICAgdiA9IG51bWVyaWMuaG91c2UoeCk7XG4gICAgQiA9IFtIWzBdLEhbMV0sSFsyXV07XG4gICAgQyA9IG51bWVyaWMudGVuc29yKHYsbnVtZXJpYy5kb3QodixCKSk7XG4gICAgZm9yKGk9MDtpPDM7aSsrKSB7IEhpID0gSFtpXTsgQ2kgPSBDW2ldOyBmb3Ioaz0wO2s8bTtrKyspIEhpW2tdIC09IDIqQ2lba107IH1cbiAgICBCID0gbnVtZXJpYy5nZXRCbG9jayhILCBbMCwwXSxbbS0xLDJdKTtcbiAgICBDID0gbnVtZXJpYy50ZW5zb3IobnVtZXJpYy5kb3QoQix2KSx2KTtcbiAgICBmb3IoaT0wO2k8bTtpKyspIHsgSGkgPSBIW2ldOyBDaSA9IENbaV07IGZvcihrPTA7azwzO2srKykgSGlba10gLT0gMipDaVtrXTsgfVxuICAgIEIgPSBbUVswXSxRWzFdLFFbMl1dO1xuICAgIEMgPSBudW1lcmljLnRlbnNvcih2LG51bWVyaWMuZG90KHYsQikpO1xuICAgIGZvcihpPTA7aTwzO2krKykgeyBRaSA9IFFbaV07IENpID0gQ1tpXTsgZm9yKGs9MDtrPG07aysrKSBRaVtrXSAtPSAyKkNpW2tdOyB9XG4gICAgdmFyIEo7XG4gICAgZm9yKGo9MDtqPG0tMjtqKyspIHtcbiAgICAgIGZvcihrPWo7azw9aisxO2srKykge1xuICAgICAgICBpZihNYXRoLmFicyhIW2srMV1ba10pIDwgZXBzaWxvbiooTWF0aC5hYnMoSFtrXVtrXSkrTWF0aC5hYnMoSFtrKzFdW2srMV0pKSkge1xuICAgICAgICAgIHZhciBRSDEgPSBudW1lcmljLlFSRnJhbmNpcyhudW1lcmljLmdldEJsb2NrKEgsWzAsMF0sW2ssa10pLG1heGl0ZXIpO1xuICAgICAgICAgIHZhciBRSDIgPSBudW1lcmljLlFSRnJhbmNpcyhudW1lcmljLmdldEJsb2NrKEgsW2srMSxrKzFdLFttLTEsbS0xXSksbWF4aXRlcik7XG4gICAgICAgICAgQiA9IEFycmF5KGsrMSk7XG4gICAgICAgICAgZm9yKGk9MDtpPD1rO2krKykgeyBCW2ldID0gUVtpXTsgfVxuICAgICAgICAgIEMgPSBudW1lcmljLmRvdChRSDEuUSxCKTtcbiAgICAgICAgICBmb3IoaT0wO2k8PWs7aSsrKSB7IFFbaV0gPSBDW2ldOyB9XG4gICAgICAgICAgQiA9IEFycmF5KG0tay0xKTtcbiAgICAgICAgICBmb3IoaT1rKzE7aTxtO2krKykgeyBCW2ktay0xXSA9IFFbaV07IH1cbiAgICAgICAgICBDID0gbnVtZXJpYy5kb3QoUUgyLlEsQik7XG4gICAgICAgICAgZm9yKGk9aysxO2k8bTtpKyspIHsgUVtpXSA9IENbaS1rLTFdOyB9XG4gICAgICAgICAgcmV0dXJuIHtROlEsQjpRSDEuQi5jb25jYXQobnVtZXJpYy5hZGQoUUgyLkIsaysxKSl9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBKID0gTWF0aC5taW4obS0xLGorMyk7XG4gICAgICB4ID0gQXJyYXkoSi1qKTtcbiAgICAgIGZvcihpPWorMTtpPD1KO2krKykgeyB4W2ktai0xXSA9IEhbaV1bal07IH1cbiAgICAgIHYgPSBudW1lcmljLmhvdXNlKHgpO1xuICAgICAgQiA9IG51bWVyaWMuZ2V0QmxvY2soSCwgW2orMSxqXSxbSixtLTFdKTtcbiAgICAgIEMgPSBudW1lcmljLnRlbnNvcih2LG51bWVyaWMuZG90KHYsQikpO1xuICAgICAgZm9yKGk9aisxO2k8PUo7aSsrKSB7IEhpID0gSFtpXTsgQ2kgPSBDW2ktai0xXTsgZm9yKGs9ajtrPG07aysrKSBIaVtrXSAtPSAyKkNpW2stal07IH1cbiAgICAgIEIgPSBudW1lcmljLmdldEJsb2NrKEgsIFswLGorMV0sW20tMSxKXSk7XG4gICAgICBDID0gbnVtZXJpYy50ZW5zb3IobnVtZXJpYy5kb3QoQix2KSx2KTtcbiAgICAgIGZvcihpPTA7aTxtO2krKykgeyBIaSA9IEhbaV07IENpID0gQ1tpXTsgZm9yKGs9aisxO2s8PUo7aysrKSBIaVtrXSAtPSAyKkNpW2stai0xXTsgfVxuICAgICAgQiA9IEFycmF5KEotaik7XG4gICAgICBmb3IoaT1qKzE7aTw9SjtpKyspIEJbaS1qLTFdID0gUVtpXTtcbiAgICAgIEMgPSBudW1lcmljLnRlbnNvcih2LG51bWVyaWMuZG90KHYsQikpO1xuICAgICAgZm9yKGk9aisxO2k8PUo7aSsrKSB7IFFpID0gUVtpXTsgQ2kgPSBDW2ktai0xXTsgZm9yKGs9MDtrPG07aysrKSBRaVtrXSAtPSAyKkNpW2tdOyB9XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFcnJvcignbnVtZXJpYzogZWlnZW52YWx1ZSBpdGVyYXRpb24gZG9lcyBub3QgY29udmVyZ2UgLS0gaW5jcmVhc2UgbWF4aXRlcj8nKTtcbn1cblxubnVtZXJpYy5laWcgPSBmdW5jdGlvbiBlaWcoQSxtYXhpdGVyKSB7XG4gIHZhciBRSCA9IG51bWVyaWMudG9VcHBlckhlc3NlbmJlcmcoQSk7XG4gIHZhciBRQiA9IG51bWVyaWMuUVJGcmFuY2lzKFFILkgsbWF4aXRlcik7XG4gIHZhciBUID0gbnVtZXJpYy5UO1xuICB2YXIgbiA9IEEubGVuZ3RoLGksayxmbGFnID0gZmFsc2UsQiA9IFFCLkIsSCA9IG51bWVyaWMuZG90KFFCLlEsbnVtZXJpYy5kb3QoUUguSCxudW1lcmljLnRyYW5zcG9zZShRQi5RKSkpO1xuICB2YXIgUSA9IG5ldyBUKG51bWVyaWMuZG90KFFCLlEsUUguUSkpLFEwO1xuICB2YXIgbSA9IEIubGVuZ3RoLGo7XG4gIHZhciBhLGIsYyxkLHAxLHAyLGRpc2MseCx5LHAscSxuMSxuMjtcbiAgdmFyIHNxcnQgPSBNYXRoLnNxcnQ7XG4gIGZvcihrPTA7azxtO2srKykge1xuICAgIGkgPSBCW2tdWzBdO1xuICAgIGlmKGkgPT09IEJba11bMV0pIHtcbiAgICAgIC8vIG5vdGhpbmdcbiAgICB9IGVsc2Uge1xuICAgICAgaiA9IGkrMTtcbiAgICAgIGEgPSBIW2ldW2ldO1xuICAgICAgYiA9IEhbaV1bal07XG4gICAgICBjID0gSFtqXVtpXTtcbiAgICAgIGQgPSBIW2pdW2pdO1xuICAgICAgaWYoYiA9PT0gMCAmJiBjID09PSAwKSBjb250aW51ZTtcbiAgICAgIHAxID0gLWEtZDtcbiAgICAgIHAyID0gYSpkLWIqYztcbiAgICAgIGRpc2MgPSBwMSpwMS00KnAyO1xuICAgICAgaWYoZGlzYz49MCkge1xuICAgICAgICBpZihwMTwwKSB4ID0gLTAuNSoocDEtc3FydChkaXNjKSk7XG4gICAgICAgIGVsc2UgICAgIHggPSAtMC41KihwMStzcXJ0KGRpc2MpKTtcbiAgICAgICAgbjEgPSAoYS14KSooYS14KStiKmI7XG4gICAgICAgIG4yID0gYypjKyhkLXgpKihkLXgpO1xuICAgICAgICBpZihuMT5uMikge1xuICAgICAgICAgIG4xID0gc3FydChuMSk7XG4gICAgICAgICAgcCA9IChhLXgpL24xO1xuICAgICAgICAgIHEgPSBiL24xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG4yID0gc3FydChuMik7XG4gICAgICAgICAgcCA9IGMvbjI7XG4gICAgICAgICAgcSA9IChkLXgpL24yO1xuICAgICAgICB9XG4gICAgICAgIFEwID0gbmV3IFQoW1txLC1wXSxbcCxxXV0pO1xuICAgICAgICBRLnNldFJvd3MoaSxqLFEwLmRvdChRLmdldFJvd3MoaSxqKSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeCA9IC0wLjUqcDE7XG4gICAgICAgIHkgPSAwLjUqc3FydCgtZGlzYyk7XG4gICAgICAgIG4xID0gKGEteCkqKGEteCkrYipiO1xuICAgICAgICBuMiA9IGMqYysoZC14KSooZC14KTtcbiAgICAgICAgaWYobjE+bjIpIHtcbiAgICAgICAgICBuMSA9IHNxcnQobjEreSp5KTtcbiAgICAgICAgICBwID0gKGEteCkvbjE7XG4gICAgICAgICAgcSA9IGIvbjE7XG4gICAgICAgICAgeCA9IDA7XG4gICAgICAgICAgeSAvPSBuMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuMiA9IHNxcnQobjIreSp5KTtcbiAgICAgICAgICBwID0gYy9uMjtcbiAgICAgICAgICBxID0gKGQteCkvbjI7XG4gICAgICAgICAgeCA9IHkvbjI7XG4gICAgICAgICAgeSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgUTAgPSBuZXcgVChbW3EsLXBdLFtwLHFdXSxbW3gseV0sW3ksLXhdXSk7XG4gICAgICAgIFEuc2V0Um93cyhpLGosUTAuZG90KFEuZ2V0Um93cyhpLGopKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHZhciBSID0gUS5kb3QoQSkuZG90KFEudHJhbnNqdWdhdGUoKSksIG4gPSBBLmxlbmd0aCwgRSA9IG51bWVyaWMuVC5pZGVudGl0eShuKTtcbiAgZm9yKGo9MDtqPG47aisrKSB7XG4gICAgaWYoaj4wKSB7XG4gICAgICBmb3Ioaz1qLTE7az49MDtrLS0pIHtcbiAgICAgICAgdmFyIFJrID0gUi5nZXQoW2ssa10pLCBSaiA9IFIuZ2V0KFtqLGpdKTtcbiAgICAgICAgaWYobnVtZXJpYy5uZXEoUmsueCxSai54KSB8fCBudW1lcmljLm5lcShSay55LFJqLnkpKSB7XG4gICAgICAgICAgeCA9IFIuZ2V0Um93KGspLmdldEJsb2NrKFtrXSxbai0xXSk7XG4gICAgICAgICAgeSA9IEUuZ2V0Um93KGopLmdldEJsb2NrKFtrXSxbai0xXSk7XG4gICAgICAgICAgRS5zZXQoW2osa10sKFIuZ2V0KFtrLGpdKS5uZWcoKS5zdWIoeC5kb3QoeSkpKS5kaXYoUmsuc3ViKFJqKSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIEUuc2V0Um93KGosRS5nZXRSb3coaykpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZvcihqPTA7ajxuO2orKykge1xuICAgIHggPSBFLmdldFJvdyhqKTtcbiAgICBFLnNldFJvdyhqLHguZGl2KHgubm9ybTIoKSkpO1xuICB9XG4gIEUgPSBFLnRyYW5zcG9zZSgpO1xuICBFID0gUS50cmFuc2p1Z2F0ZSgpLmRvdChFKTtcbiAgcmV0dXJuIHsgbGFtYmRhOlIuZ2V0RGlhZygpLCBFOkUgfTtcbn07XG5cbi8vIDUuIENvbXByZXNzZWQgQ29sdW1uIFN0b3JhZ2UgbWF0cmljZXNcbm51bWVyaWMuY2NzU3BhcnNlID0gZnVuY3Rpb24gY2NzU3BhcnNlKEEpIHtcbiAgdmFyIG0gPSBBLmxlbmd0aCxuLGZvbywgaSxqLCBjb3VudHMgPSBbXTtcbiAgZm9yKGk9bS0xO2khPT0tMTstLWkpIHtcbiAgICBmb28gPSBBW2ldO1xuICAgIGZvcihqIGluIGZvbykge1xuICAgICAgaiA9IHBhcnNlSW50KGopO1xuICAgICAgd2hpbGUoaj49Y291bnRzLmxlbmd0aCkgY291bnRzW2NvdW50cy5sZW5ndGhdID0gMDtcbiAgICAgIGlmKGZvb1tqXSE9PTApIGNvdW50c1tqXSsrO1xuICAgIH1cbiAgfVxuICB2YXIgbiA9IGNvdW50cy5sZW5ndGg7XG4gIHZhciBBaSA9IEFycmF5KG4rMSk7XG4gIEFpWzBdID0gMDtcbiAgZm9yKGk9MDtpPG47KytpKSBBaVtpKzFdID0gQWlbaV0gKyBjb3VudHNbaV07XG4gIHZhciBBaiA9IEFycmF5KEFpW25dKSwgQXYgPSBBcnJheShBaVtuXSk7XG4gIGZvcihpPW0tMTtpIT09LTE7LS1pKSB7XG4gICAgZm9vID0gQVtpXTtcbiAgICBmb3IoaiBpbiBmb28pIHtcbiAgICAgIGlmKGZvb1tqXSE9PTApIHtcbiAgICAgICAgY291bnRzW2pdLS07XG4gICAgICAgIEFqW0FpW2pdK2NvdW50c1tqXV0gPSBpO1xuICAgICAgICBBdltBaVtqXStjb3VudHNbal1dID0gZm9vW2pdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gW0FpLEFqLEF2XTtcbn1cbm51bWVyaWMuY2NzRnVsbCA9IGZ1bmN0aW9uIGNjc0Z1bGwoQSkge1xuICB2YXIgQWkgPSBBWzBdLCBBaiA9IEFbMV0sIEF2ID0gQVsyXSwgcyA9IG51bWVyaWMuY2NzRGltKEEpLCBtID0gc1swXSwgbiA9IHNbMV0sIGksaixqMCxqMSxrO1xuICB2YXIgQiA9IG51bWVyaWMucmVwKFttLG5dLDApO1xuICBmb3IoaT0wO2k8bjtpKyspIHtcbiAgICBqMCA9IEFpW2ldO1xuICAgIGoxID0gQWlbaSsxXTtcbiAgICBmb3Ioaj1qMDtqPGoxOysraikgeyBCW0FqW2pdXVtpXSA9IEF2W2pdOyB9XG4gIH1cbiAgcmV0dXJuIEI7XG59XG5udW1lcmljLmNjc1RTb2x2ZSA9IGZ1bmN0aW9uIGNjc1RTb2x2ZShBLGIseCxiaix4aikge1xuICB2YXIgQWkgPSBBWzBdLCBBaiA9IEFbMV0sIEF2ID0gQVsyXSxtID0gQWkubGVuZ3RoLTEsIG1heCA9IE1hdGgubWF4LG49MDtcbiAgaWYodHlwZW9mIGJqID09PSBcInVuZGVmaW5lZFwiKSB4ID0gbnVtZXJpYy5yZXAoW21dLDApO1xuICBpZih0eXBlb2YgYmogPT09IFwidW5kZWZpbmVkXCIpIGJqID0gbnVtZXJpYy5saW5zcGFjZSgwLHgubGVuZ3RoLTEpO1xuICBpZih0eXBlb2YgeGogPT09IFwidW5kZWZpbmVkXCIpIHhqID0gW107XG4gIGZ1bmN0aW9uIGRmcyhqKSB7XG4gICAgdmFyIGs7XG4gICAgaWYoeFtqXSAhPT0gMCkgcmV0dXJuO1xuICAgIHhbal0gPSAxO1xuICAgIGZvcihrPUFpW2pdO2s8QWlbaisxXTsrK2spIGRmcyhBaltrXSk7XG4gICAgeGpbbl0gPSBqO1xuICAgICsrbjtcbiAgfVxuICB2YXIgaSxqLGowLGoxLGssbCxsMCxsMSxhO1xuICBmb3IoaT1iai5sZW5ndGgtMTtpIT09LTE7LS1pKSB7IGRmcyhialtpXSk7IH1cbiAgeGoubGVuZ3RoID0gbjtcbiAgZm9yKGk9eGoubGVuZ3RoLTE7aSE9PS0xOy0taSkgeyB4W3hqW2ldXSA9IDA7IH1cbiAgZm9yKGk9YmoubGVuZ3RoLTE7aSE9PS0xOy0taSkgeyBqID0gYmpbaV07IHhbal0gPSBiW2pdOyB9XG4gIGZvcihpPXhqLmxlbmd0aC0xO2khPT0tMTstLWkpIHtcbiAgICBqID0geGpbaV07XG4gICAgajAgPSBBaVtqXTtcbiAgICBqMSA9IG1heChBaVtqKzFdLGowKTtcbiAgICBmb3Ioaz1qMDtrIT09ajE7KytrKSB7IGlmKEFqW2tdID09PSBqKSB7IHhbal0gLz0gQXZba107IGJyZWFrOyB9IH1cbiAgICBhID0geFtqXTtcbiAgICBmb3Ioaz1qMDtrIT09ajE7KytrKSB7XG4gICAgICBsID0gQWpba107XG4gICAgICBpZihsICE9PSBqKSB4W2xdIC09IGEqQXZba107XG4gICAgfVxuICB9XG4gIHJldHVybiB4O1xufVxubnVtZXJpYy5jY3NERlMgPSBmdW5jdGlvbiBjY3NERlMobikge1xuICB0aGlzLmsgPSBBcnJheShuKTtcbiAgdGhpcy5rMSA9IEFycmF5KG4pO1xuICB0aGlzLmogPSBBcnJheShuKTtcbn1cbm51bWVyaWMuY2NzREZTLnByb3RvdHlwZS5kZnMgPSBmdW5jdGlvbiBkZnMoSixBaSxBaix4LHhqLFBpbnYpIHtcbiAgdmFyIG0gPSAwLGZvbyxuPXhqLmxlbmd0aDtcbiAgdmFyIGsgPSB0aGlzLmssIGsxID0gdGhpcy5rMSwgaiA9IHRoaXMuaixrbSxrMTE7XG4gIGlmKHhbSl0hPT0wKSByZXR1cm47XG4gIHhbSl0gPSAxO1xuICBqWzBdID0gSjtcbiAga1swXSA9IGttID0gQWlbSl07XG4gIGsxWzBdID0gazExID0gQWlbSisxXTtcbiAgd2hpbGUoMSkge1xuICAgIGlmKGttID49IGsxMSkge1xuICAgICAgeGpbbl0gPSBqW21dO1xuICAgICAgaWYobT09PTApIHJldHVybjtcbiAgICAgICsrbjtcbiAgICAgIC0tbTtcbiAgICAgIGttID0ga1ttXTtcbiAgICAgIGsxMSA9IGsxW21dO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb28gPSBQaW52W0FqW2ttXV07XG4gICAgICBpZih4W2Zvb10gPT09IDApIHtcbiAgICAgICAgeFtmb29dID0gMTtcbiAgICAgICAga1ttXSA9IGttO1xuICAgICAgICArK207XG4gICAgICAgIGpbbV0gPSBmb287XG4gICAgICAgIGttID0gQWlbZm9vXTtcbiAgICAgICAgazFbbV0gPSBrMTEgPSBBaVtmb28rMV07XG4gICAgICB9IGVsc2UgKytrbTtcbiAgICB9XG4gIH1cbn1cbm51bWVyaWMuY2NzTFBTb2x2ZSA9IGZ1bmN0aW9uIGNjc0xQU29sdmUoQSxCLHgseGosSSxQaW52LGRmcykge1xuICB2YXIgQWkgPSBBWzBdLCBBaiA9IEFbMV0sIEF2ID0gQVsyXSxtID0gQWkubGVuZ3RoLTEsIG49MDtcbiAgdmFyIEJpID0gQlswXSwgQmogPSBCWzFdLCBCdiA9IEJbMl07XG5cbiAgdmFyIGksaTAsaTEsaixKLGowLGoxLGssbCxsMCxsMSxhO1xuICBpMCA9IEJpW0ldO1xuICBpMSA9IEJpW0krMV07XG4gIHhqLmxlbmd0aCA9IDA7XG4gIGZvcihpPWkwO2k8aTE7KytpKSB7IGRmcy5kZnMoUGludltCaltpXV0sQWksQWoseCx4aixQaW52KTsgfVxuICBmb3IoaT14ai5sZW5ndGgtMTtpIT09LTE7LS1pKSB7IHhbeGpbaV1dID0gMDsgfVxuICBmb3IoaT1pMDtpIT09aTE7KytpKSB7IGogPSBQaW52W0JqW2ldXTsgeFtqXSA9IEJ2W2ldOyB9XG4gIGZvcihpPXhqLmxlbmd0aC0xO2khPT0tMTstLWkpIHtcbiAgICBqID0geGpbaV07XG4gICAgajAgPSBBaVtqXTtcbiAgICBqMSA9IEFpW2orMV07XG4gICAgZm9yKGs9ajA7azxqMTsrK2spIHsgaWYoUGludltBaltrXV0gPT09IGopIHsgeFtqXSAvPSBBdltrXTsgYnJlYWs7IH0gfVxuICAgIGEgPSB4W2pdO1xuICAgIGZvcihrPWowO2s8ajE7KytrKSB7XG4gICAgICBsID0gUGludltBaltrXV07XG4gICAgICBpZihsICE9PSBqKSB4W2xdIC09IGEqQXZba107XG4gICAgfVxuICB9XG4gIHJldHVybiB4O1xufVxubnVtZXJpYy5jY3NMVVAxID0gZnVuY3Rpb24gY2NzTFVQMShBLHRocmVzaG9sZCkge1xuICB2YXIgbSA9IEFbMF0ubGVuZ3RoLTE7XG4gIHZhciBMID0gW251bWVyaWMucmVwKFttKzFdLDApLFtdLFtdXSwgVSA9IFtudW1lcmljLnJlcChbbSsxXSwgMCksW10sW11dO1xuICB2YXIgTGkgPSBMWzBdLCBMaiA9IExbMV0sIEx2ID0gTFsyXSwgVWkgPSBVWzBdLCBVaiA9IFVbMV0sIFV2ID0gVVsyXTtcbiAgdmFyIHggPSBudW1lcmljLnJlcChbbV0sMCksIHhqID0gbnVtZXJpYy5yZXAoW21dLDApO1xuICB2YXIgaSxqLGssajAsajEsYSxlLGMsZCxLO1xuICB2YXIgc29sID0gbnVtZXJpYy5jY3NMUFNvbHZlLCBtYXggPSBNYXRoLm1heCwgYWJzID0gTWF0aC5hYnM7XG4gIHZhciBQID0gbnVtZXJpYy5saW5zcGFjZSgwLG0tMSksUGludiA9IG51bWVyaWMubGluc3BhY2UoMCxtLTEpO1xuICB2YXIgZGZzID0gbmV3IG51bWVyaWMuY2NzREZTKG0pO1xuICBpZih0eXBlb2YgdGhyZXNob2xkID09PSBcInVuZGVmaW5lZFwiKSB7IHRocmVzaG9sZCA9IDE7IH1cbiAgZm9yKGk9MDtpPG07KytpKSB7XG4gICAgc29sKEwsQSx4LHhqLGksUGludixkZnMpO1xuICAgIGEgPSAtMTtcbiAgICBlID0gLTE7XG4gICAgZm9yKGo9eGoubGVuZ3RoLTE7aiE9PS0xOy0taikge1xuICAgICAgayA9IHhqW2pdO1xuICAgICAgaWYoayA8PSBpKSBjb250aW51ZTtcbiAgICAgIGMgPSBhYnMoeFtrXSk7XG4gICAgICBpZihjID4gYSkgeyBlID0gazsgYSA9IGM7IH1cbiAgICB9XG4gICAgaWYoYWJzKHhbaV0pPHRocmVzaG9sZCphKSB7XG4gICAgICBqID0gUFtpXTtcbiAgICAgIGEgPSBQW2VdO1xuICAgICAgUFtpXSA9IGE7IFBpbnZbYV0gPSBpO1xuICAgICAgUFtlXSA9IGo7IFBpbnZbal0gPSBlO1xuICAgICAgYSA9IHhbaV07IHhbaV0gPSB4W2VdOyB4W2VdID0gYTtcbiAgICB9XG4gICAgYSA9IExpW2ldO1xuICAgIGUgPSBVaVtpXTtcbiAgICBkID0geFtpXTtcbiAgICBMalthXSA9IFBbaV07XG4gICAgTHZbYV0gPSAxO1xuICAgICsrYTtcbiAgICBmb3Ioaj14ai5sZW5ndGgtMTtqIT09LTE7LS1qKSB7XG4gICAgICBrID0geGpbal07XG4gICAgICBjID0geFtrXTtcbiAgICAgIHhqW2pdID0gMDtcbiAgICAgIHhba10gPSAwO1xuICAgICAgaWYoazw9aSkgeyBValtlXSA9IGs7IFV2W2VdID0gYzsgICArK2U7IH1cbiAgICAgIGVsc2UgICAgIHsgTGpbYV0gPSBQW2tdOyBMdlthXSA9IGMvZDsgKythOyB9XG4gICAgfVxuICAgIExpW2krMV0gPSBhO1xuICAgIFVpW2krMV0gPSBlO1xuICB9XG4gIGZvcihqPUxqLmxlbmd0aC0xO2ohPT0tMTstLWopIHsgTGpbal0gPSBQaW52W0xqW2pdXTsgfVxuICByZXR1cm4ge0w6TCwgVTpVLCBQOlAsIFBpbnY6UGludn07XG59XG5udW1lcmljLmNjc0RGUzAgPSBmdW5jdGlvbiBjY3NERlMwKG4pIHtcbiAgdGhpcy5rID0gQXJyYXkobik7XG4gIHRoaXMuazEgPSBBcnJheShuKTtcbiAgdGhpcy5qID0gQXJyYXkobik7XG59XG5udW1lcmljLmNjc0RGUzAucHJvdG90eXBlLmRmcyA9IGZ1bmN0aW9uIGRmcyhKLEFpLEFqLHgseGosUGludixQKSB7XG4gIHZhciBtID0gMCxmb28sbj14ai5sZW5ndGg7XG4gIHZhciBrID0gdGhpcy5rLCBrMSA9IHRoaXMuazEsIGogPSB0aGlzLmosa20sazExO1xuICBpZih4W0pdIT09MCkgcmV0dXJuO1xuICB4W0pdID0gMTtcbiAgalswXSA9IEo7XG4gIGtbMF0gPSBrbSA9IEFpW1BpbnZbSl1dO1xuICBrMVswXSA9IGsxMSA9IEFpW1BpbnZbSl0rMV07XG4gIHdoaWxlKDEpIHtcbiAgICBpZihpc05hTihrbSkpIHRocm93IG5ldyBFcnJvcihcIk93IVwiKTtcbiAgICBpZihrbSA+PSBrMTEpIHtcbiAgICAgIHhqW25dID0gUGludltqW21dXTtcbiAgICAgIGlmKG09PT0wKSByZXR1cm47XG4gICAgICArK247XG4gICAgICAtLW07XG4gICAgICBrbSA9IGtbbV07XG4gICAgICBrMTEgPSBrMVttXTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9vID0gQWpba21dO1xuICAgICAgaWYoeFtmb29dID09PSAwKSB7XG4gICAgICAgIHhbZm9vXSA9IDE7XG4gICAgICAgIGtbbV0gPSBrbTtcbiAgICAgICAgKyttO1xuICAgICAgICBqW21dID0gZm9vO1xuICAgICAgICBmb28gPSBQaW52W2Zvb107XG4gICAgICAgIGttID0gQWlbZm9vXTtcbiAgICAgICAgazFbbV0gPSBrMTEgPSBBaVtmb28rMV07XG4gICAgICB9IGVsc2UgKytrbTtcbiAgICB9XG4gIH1cbn1cbm51bWVyaWMuY2NzTFBTb2x2ZTAgPSBmdW5jdGlvbiBjY3NMUFNvbHZlMChBLEIseSx4aixJLFBpbnYsUCxkZnMpIHtcbiAgdmFyIEFpID0gQVswXSwgQWogPSBBWzFdLCBBdiA9IEFbMl0sbSA9IEFpLmxlbmd0aC0xLCBuPTA7XG4gIHZhciBCaSA9IEJbMF0sIEJqID0gQlsxXSwgQnYgPSBCWzJdO1xuXG4gIHZhciBpLGkwLGkxLGosSixqMCxqMSxrLGwsbDAsbDEsYTtcbiAgaTAgPSBCaVtJXTtcbiAgaTEgPSBCaVtJKzFdO1xuICB4ai5sZW5ndGggPSAwO1xuICBmb3IoaT1pMDtpPGkxOysraSkgeyBkZnMuZGZzKEJqW2ldLEFpLEFqLHkseGosUGludixQKTsgfVxuICBmb3IoaT14ai5sZW5ndGgtMTtpIT09LTE7LS1pKSB7IGogPSB4altpXTsgeVtQW2pdXSA9IDA7IH1cbiAgZm9yKGk9aTA7aSE9PWkxOysraSkgeyBqID0gQmpbaV07IHlbal0gPSBCdltpXTsgfVxuICBmb3IoaT14ai5sZW5ndGgtMTtpIT09LTE7LS1pKSB7XG4gICAgaiA9IHhqW2ldO1xuICAgIGwgPSBQW2pdO1xuICAgIGowID0gQWlbal07XG4gICAgajEgPSBBaVtqKzFdO1xuICAgIGZvcihrPWowO2s8ajE7KytrKSB7IGlmKEFqW2tdID09PSBsKSB7IHlbbF0gLz0gQXZba107IGJyZWFrOyB9IH1cbiAgICBhID0geVtsXTtcbiAgICBmb3Ioaz1qMDtrPGoxOysraykgeVtBaltrXV0gLT0gYSpBdltrXTtcbiAgICB5W2xdID0gYTtcbiAgfVxufVxubnVtZXJpYy5jY3NMVVAwID0gZnVuY3Rpb24gY2NzTFVQMChBLHRocmVzaG9sZCkge1xuICB2YXIgbSA9IEFbMF0ubGVuZ3RoLTE7XG4gIHZhciBMID0gW251bWVyaWMucmVwKFttKzFdLDApLFtdLFtdXSwgVSA9IFtudW1lcmljLnJlcChbbSsxXSwgMCksW10sW11dO1xuICB2YXIgTGkgPSBMWzBdLCBMaiA9IExbMV0sIEx2ID0gTFsyXSwgVWkgPSBVWzBdLCBVaiA9IFVbMV0sIFV2ID0gVVsyXTtcbiAgdmFyIHkgPSBudW1lcmljLnJlcChbbV0sMCksIHhqID0gbnVtZXJpYy5yZXAoW21dLDApO1xuICB2YXIgaSxqLGssajAsajEsYSxlLGMsZCxLO1xuICB2YXIgc29sID0gbnVtZXJpYy5jY3NMUFNvbHZlMCwgbWF4ID0gTWF0aC5tYXgsIGFicyA9IE1hdGguYWJzO1xuICB2YXIgUCA9IG51bWVyaWMubGluc3BhY2UoMCxtLTEpLFBpbnYgPSBudW1lcmljLmxpbnNwYWNlKDAsbS0xKTtcbiAgdmFyIGRmcyA9IG5ldyBudW1lcmljLmNjc0RGUzAobSk7XG4gIGlmKHR5cGVvZiB0aHJlc2hvbGQgPT09IFwidW5kZWZpbmVkXCIpIHsgdGhyZXNob2xkID0gMTsgfVxuICBmb3IoaT0wO2k8bTsrK2kpIHtcbiAgICBzb2woTCxBLHkseGosaSxQaW52LFAsZGZzKTtcbiAgICBhID0gLTE7XG4gICAgZSA9IC0xO1xuICAgIGZvcihqPXhqLmxlbmd0aC0xO2ohPT0tMTstLWopIHtcbiAgICAgIGsgPSB4altqXTtcbiAgICAgIGlmKGsgPD0gaSkgY29udGludWU7XG4gICAgICBjID0gYWJzKHlbUFtrXV0pO1xuICAgICAgaWYoYyA+IGEpIHsgZSA9IGs7IGEgPSBjOyB9XG4gICAgfVxuICAgIGlmKGFicyh5W1BbaV1dKTx0aHJlc2hvbGQqYSkge1xuICAgICAgaiA9IFBbaV07XG4gICAgICBhID0gUFtlXTtcbiAgICAgIFBbaV0gPSBhOyBQaW52W2FdID0gaTtcbiAgICAgIFBbZV0gPSBqOyBQaW52W2pdID0gZTtcbiAgICB9XG4gICAgYSA9IExpW2ldO1xuICAgIGUgPSBVaVtpXTtcbiAgICBkID0geVtQW2ldXTtcbiAgICBMalthXSA9IFBbaV07XG4gICAgTHZbYV0gPSAxO1xuICAgICsrYTtcbiAgICBmb3Ioaj14ai5sZW5ndGgtMTtqIT09LTE7LS1qKSB7XG4gICAgICBrID0geGpbal07XG4gICAgICBjID0geVtQW2tdXTtcbiAgICAgIHhqW2pdID0gMDtcbiAgICAgIHlbUFtrXV0gPSAwO1xuICAgICAgaWYoazw9aSkgeyBValtlXSA9IGs7IFV2W2VdID0gYzsgICArK2U7IH1cbiAgICAgIGVsc2UgICAgIHsgTGpbYV0gPSBQW2tdOyBMdlthXSA9IGMvZDsgKythOyB9XG4gICAgfVxuICAgIExpW2krMV0gPSBhO1xuICAgIFVpW2krMV0gPSBlO1xuICB9XG4gIGZvcihqPUxqLmxlbmd0aC0xO2ohPT0tMTstLWopIHsgTGpbal0gPSBQaW52W0xqW2pdXTsgfVxuICByZXR1cm4ge0w6TCwgVTpVLCBQOlAsIFBpbnY6UGludn07XG59XG5udW1lcmljLmNjc0xVUCA9IG51bWVyaWMuY2NzTFVQMDtcblxubnVtZXJpYy5jY3NEaW0gPSBmdW5jdGlvbiBjY3NEaW0oQSkgeyByZXR1cm4gW251bWVyaWMuc3VwKEFbMV0pKzEsQVswXS5sZW5ndGgtMV07IH1cbm51bWVyaWMuY2NzR2V0QmxvY2sgPSBmdW5jdGlvbiBjY3NHZXRCbG9jayhBLGksaikge1xuICB2YXIgcyA9IG51bWVyaWMuY2NzRGltKEEpLG09c1swXSxuPXNbMV07XG4gIGlmKHR5cGVvZiBpID09PSBcInVuZGVmaW5lZFwiKSB7IGkgPSBudW1lcmljLmxpbnNwYWNlKDAsbS0xKTsgfVxuICBlbHNlIGlmKHR5cGVvZiBpID09PSBcIm51bWJlclwiKSB7IGkgPSBbaV07IH1cbiAgaWYodHlwZW9mIGogPT09IFwidW5kZWZpbmVkXCIpIHsgaiA9IG51bWVyaWMubGluc3BhY2UoMCxuLTEpOyB9XG4gIGVsc2UgaWYodHlwZW9mIGogPT09IFwibnVtYmVyXCIpIHsgaiA9IFtqXTsgfVxuICB2YXIgcCxwMCxwMSxQID0gaS5sZW5ndGgscSxRID0gai5sZW5ndGgscixqcSxpcDtcbiAgdmFyIEJpID0gbnVtZXJpYy5yZXAoW25dLDApLCBCaj1bXSwgQnY9W10sIEIgPSBbQmksQmosQnZdO1xuICB2YXIgQWkgPSBBWzBdLCBBaiA9IEFbMV0sIEF2ID0gQVsyXTtcbiAgdmFyIHggPSBudW1lcmljLnJlcChbbV0sMCksY291bnQ9MCxmbGFncyA9IG51bWVyaWMucmVwKFttXSwwKTtcbiAgZm9yKHE9MDtxPFE7KytxKSB7XG4gICAganEgPSBqW3FdO1xuICAgIHZhciBxMCA9IEFpW2pxXTtcbiAgICB2YXIgcTEgPSBBaVtqcSsxXTtcbiAgICBmb3IocD1xMDtwPHExOysrcCkge1xuICAgICAgciA9IEFqW3BdO1xuICAgICAgZmxhZ3Nbcl0gPSAxO1xuICAgICAgeFtyXSA9IEF2W3BdO1xuICAgIH1cbiAgICBmb3IocD0wO3A8UDsrK3ApIHtcbiAgICAgIGlwID0gaVtwXTtcbiAgICAgIGlmKGZsYWdzW2lwXSkge1xuICAgICAgICBCaltjb3VudF0gPSBwO1xuICAgICAgICBCdltjb3VudF0gPSB4W2lbcF1dO1xuICAgICAgICArK2NvdW50O1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IocD1xMDtwPHExOysrcCkge1xuICAgICAgciA9IEFqW3BdO1xuICAgICAgZmxhZ3Nbcl0gPSAwO1xuICAgIH1cbiAgICBCaVtxKzFdID0gY291bnQ7XG4gIH1cbiAgcmV0dXJuIEI7XG59XG5cbm51bWVyaWMuY2NzRG90ID0gZnVuY3Rpb24gY2NzRG90KEEsQikge1xuICB2YXIgQWkgPSBBWzBdLCBBaiA9IEFbMV0sIEF2ID0gQVsyXTtcbiAgdmFyIEJpID0gQlswXSwgQmogPSBCWzFdLCBCdiA9IEJbMl07XG4gIHZhciBzQSA9IG51bWVyaWMuY2NzRGltKEEpLCBzQiA9IG51bWVyaWMuY2NzRGltKEIpO1xuICB2YXIgbSA9IHNBWzBdLCBuID0gc0FbMV0sIG8gPSBzQlsxXTtcbiAgdmFyIHggPSBudW1lcmljLnJlcChbbV0sMCksIGZsYWdzID0gbnVtZXJpYy5yZXAoW21dLDApLCB4aiA9IEFycmF5KG0pO1xuICB2YXIgQ2kgPSBudW1lcmljLnJlcChbb10sMCksIENqID0gW10sIEN2ID0gW10sIEMgPSBbQ2ksQ2osQ3ZdO1xuICB2YXIgaSxqLGssajAsajEsaTAsaTEsbCxwLGEsYjtcbiAgZm9yKGs9MDtrIT09bzsrK2spIHtcbiAgICBqMCA9IEJpW2tdO1xuICAgIGoxID0gQmlbaysxXTtcbiAgICBwID0gMDtcbiAgICBmb3Ioaj1qMDtqPGoxOysraikge1xuICAgICAgYSA9IEJqW2pdO1xuICAgICAgYiA9IEJ2W2pdO1xuICAgICAgaTAgPSBBaVthXTtcbiAgICAgIGkxID0gQWlbYSsxXTtcbiAgICAgIGZvcihpPWkwO2k8aTE7KytpKSB7XG4gICAgICAgIGwgPSBBaltpXTtcbiAgICAgICAgaWYoZmxhZ3NbbF09PT0wKSB7XG4gICAgICAgICAgeGpbcF0gPSBsO1xuICAgICAgICAgIGZsYWdzW2xdID0gMTtcbiAgICAgICAgICBwID0gcCsxO1xuICAgICAgICB9XG4gICAgICAgIHhbbF0gPSB4W2xdICsgQXZbaV0qYjtcbiAgICAgIH1cbiAgICB9XG4gICAgajAgPSBDaVtrXTtcbiAgICBqMSA9IGowK3A7XG4gICAgQ2lbaysxXSA9IGoxO1xuICAgIGZvcihqPXAtMTtqIT09LTE7LS1qKSB7XG4gICAgICBiID0gajArajtcbiAgICAgIGkgPSB4altqXTtcbiAgICAgIENqW2JdID0gaTtcbiAgICAgIEN2W2JdID0geFtpXTtcbiAgICAgIGZsYWdzW2ldID0gMDtcbiAgICAgIHhbaV0gPSAwO1xuICAgIH1cbiAgICBDaVtrKzFdID0gQ2lba10rcDtcbiAgfVxuICByZXR1cm4gQztcbn1cblxubnVtZXJpYy5jY3NMVVBTb2x2ZSA9IGZ1bmN0aW9uIGNjc0xVUFNvbHZlKExVUCxCKSB7XG4gIHZhciBMID0gTFVQLkwsIFUgPSBMVVAuVSwgUCA9IExVUC5QO1xuICB2YXIgQmkgPSBCWzBdO1xuICB2YXIgZmxhZyA9IGZhbHNlO1xuICBpZih0eXBlb2YgQmkgIT09IFwib2JqZWN0XCIpIHsgQiA9IFtbMCxCLmxlbmd0aF0sbnVtZXJpYy5saW5zcGFjZSgwLEIubGVuZ3RoLTEpLEJdOyBCaSA9IEJbMF07IGZsYWcgPSB0cnVlOyB9XG4gIHZhciBCaiA9IEJbMV0sIEJ2ID0gQlsyXTtcbiAgdmFyIG4gPSBMWzBdLmxlbmd0aC0xLCBtID0gQmkubGVuZ3RoLTE7XG4gIHZhciB4ID0gbnVtZXJpYy5yZXAoW25dLDApLCB4aiA9IEFycmF5KG4pO1xuICB2YXIgYiA9IG51bWVyaWMucmVwKFtuXSwwKSwgYmogPSBBcnJheShuKTtcbiAgdmFyIFhpID0gbnVtZXJpYy5yZXAoW20rMV0sMCksIFhqID0gW10sIFh2ID0gW107XG4gIHZhciBzb2wgPSBudW1lcmljLmNjc1RTb2x2ZTtcbiAgdmFyIGksaixqMCxqMSxrLEosTj0wO1xuICBmb3IoaT0wO2k8bTsrK2kpIHtcbiAgICBrID0gMDtcbiAgICBqMCA9IEJpW2ldO1xuICAgIGoxID0gQmlbaSsxXTtcbiAgICBmb3Ioaj1qMDtqPGoxOysraikge1xuICAgICAgSiA9IExVUC5QaW52W0JqW2pdXTtcbiAgICAgIGJqW2tdID0gSjtcbiAgICAgIGJbSl0gPSBCdltqXTtcbiAgICAgICsraztcbiAgICB9XG4gICAgYmoubGVuZ3RoID0gaztcbiAgICBzb2woTCxiLHgsYmoseGopO1xuICAgIGZvcihqPWJqLmxlbmd0aC0xO2ohPT0tMTstLWopIGJbYmpbal1dID0gMDtcbiAgICBzb2woVSx4LGIseGosYmopO1xuICAgIGlmKGZsYWcpIHJldHVybiBiO1xuICAgIGZvcihqPXhqLmxlbmd0aC0xO2ohPT0tMTstLWopIHhbeGpbal1dID0gMDtcbiAgICBmb3Ioaj1iai5sZW5ndGgtMTtqIT09LTE7LS1qKSB7XG4gICAgICBKID0gYmpbal07XG4gICAgICBYaltOXSA9IEo7XG4gICAgICBYdltOXSA9IGJbSl07XG4gICAgICBiW0pdID0gMDtcbiAgICAgICsrTjtcbiAgICB9XG4gICAgWGlbaSsxXSA9IE47XG4gIH1cbiAgcmV0dXJuIFtYaSxYaixYdl07XG59XG5cbm51bWVyaWMuY2NzYmlub3AgPSBmdW5jdGlvbiBjY3NiaW5vcChib2R5LHNldHVwKSB7XG4gIGlmKHR5cGVvZiBzZXR1cCA9PT0gXCJ1bmRlZmluZWRcIikgc2V0dXA9Jyc7XG4gIHJldHVybiBGdW5jdGlvbignWCcsJ1knLFxuICAgICd2YXIgWGkgPSBYWzBdLCBYaiA9IFhbMV0sIFh2ID0gWFsyXTtcXG4nK1xuICAgICd2YXIgWWkgPSBZWzBdLCBZaiA9IFlbMV0sIFl2ID0gWVsyXTtcXG4nK1xuICAgICd2YXIgbiA9IFhpLmxlbmd0aC0xLG0gPSBNYXRoLm1heChudW1lcmljLnN1cChYaiksbnVtZXJpYy5zdXAoWWopKSsxO1xcbicrXG4gICAgJ3ZhciBaaSA9IG51bWVyaWMucmVwKFtuKzFdLDApLCBaaiA9IFtdLCBadiA9IFtdO1xcbicrXG4gICAgJ3ZhciB4ID0gbnVtZXJpYy5yZXAoW21dLDApLHkgPSBudW1lcmljLnJlcChbbV0sMCk7XFxuJytcbiAgICAndmFyIHhrLHlrLHprO1xcbicrXG4gICAgJ3ZhciBpLGosajAsajEsayxwPTA7XFxuJytcbiAgICBzZXR1cCtcbiAgICAnZm9yKGk9MDtpPG47KytpKSB7XFxuJytcbiAgICAnICBqMCA9IFhpW2ldOyBqMSA9IFhpW2krMV07XFxuJytcbiAgICAnICBmb3Ioaj1qMDtqIT09ajE7KytqKSB7XFxuJytcbiAgICAnICAgIGsgPSBYaltqXTtcXG4nK1xuICAgICcgICAgeFtrXSA9IDE7XFxuJytcbiAgICAnICAgIFpqW3BdID0gaztcXG4nK1xuICAgICcgICAgKytwO1xcbicrXG4gICAgJyAgfVxcbicrXG4gICAgJyAgajAgPSBZaVtpXTsgajEgPSBZaVtpKzFdO1xcbicrXG4gICAgJyAgZm9yKGo9ajA7aiE9PWoxOysraikge1xcbicrXG4gICAgJyAgICBrID0gWWpbal07XFxuJytcbiAgICAnICAgIHlba10gPSBZdltqXTtcXG4nK1xuICAgICcgICAgaWYoeFtrXSA9PT0gMCkge1xcbicrXG4gICAgJyAgICAgIFpqW3BdID0gaztcXG4nK1xuICAgICcgICAgICArK3A7XFxuJytcbiAgICAnICAgIH1cXG4nK1xuICAgICcgIH1cXG4nK1xuICAgICcgIFppW2krMV0gPSBwO1xcbicrXG4gICAgJyAgajAgPSBYaVtpXTsgajEgPSBYaVtpKzFdO1xcbicrXG4gICAgJyAgZm9yKGo9ajA7aiE9PWoxOysraikgeFtYaltqXV0gPSBYdltqXTtcXG4nK1xuICAgICcgIGowID0gWmlbaV07IGoxID0gWmlbaSsxXTtcXG4nK1xuICAgICcgIGZvcihqPWowO2ohPT1qMTsrK2opIHtcXG4nK1xuICAgICcgICAgayA9IFpqW2pdO1xcbicrXG4gICAgJyAgICB4ayA9IHhba107XFxuJytcbiAgICAnICAgIHlrID0geVtrXTtcXG4nK1xuICAgIGJvZHkrJ1xcbicrXG4gICAgJyAgICBadltqXSA9IHprO1xcbicrXG4gICAgJyAgfVxcbicrXG4gICAgJyAgajAgPSBYaVtpXTsgajEgPSBYaVtpKzFdO1xcbicrXG4gICAgJyAgZm9yKGo9ajA7aiE9PWoxOysraikgeFtYaltqXV0gPSAwO1xcbicrXG4gICAgJyAgajAgPSBZaVtpXTsgajEgPSBZaVtpKzFdO1xcbicrXG4gICAgJyAgZm9yKGo9ajA7aiE9PWoxOysraikgeVtZaltqXV0gPSAwO1xcbicrXG4gICAgJ31cXG4nK1xuICAgICdyZXR1cm4gW1ppLFpqLFp2XTsnXG4gICk7XG59O1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBrLEEsQixDO1xuICBmb3IoayBpbiBudW1lcmljLm9wczIpIHtcbiAgICBpZihpc0Zpbml0ZShldmFsKCcxJytudW1lcmljLm9wczJba10rJzAnKSkpIEEgPSAnW1lbMF0sWVsxXSxudW1lcmljLicraysnKFgsWVsyXSldJztcbiAgICBlbHNlIEEgPSAnTmFOJztcbiAgICBpZihpc0Zpbml0ZShldmFsKCcwJytudW1lcmljLm9wczJba10rJzEnKSkpIEIgPSAnW1hbMF0sWFsxXSxudW1lcmljLicraysnKFhbMl0sWSldJztcbiAgICBlbHNlIEIgPSAnTmFOJztcbiAgICBpZihpc0Zpbml0ZShldmFsKCcxJytudW1lcmljLm9wczJba10rJzAnKSkgJiYgaXNGaW5pdGUoZXZhbCgnMCcrbnVtZXJpYy5vcHMyW2tdKycxJykpKSBDID0gJ251bWVyaWMuY2NzJytrKydNTShYLFkpJztcbiAgICBlbHNlIEMgPSAnTmFOJztcbiAgICBudW1lcmljWydjY3MnK2srJ01NJ10gPSBudW1lcmljLmNjc2Jpbm9wKCd6ayA9IHhrICcrbnVtZXJpYy5vcHMyW2tdKyd5azsnKTtcbiAgICBudW1lcmljWydjY3MnK2tdID0gRnVuY3Rpb24oJ1gnLCdZJyxcbiAgICAgICdpZih0eXBlb2YgWCA9PT0gXCJudW1iZXJcIikgcmV0dXJuICcrQSsnO1xcbicrXG4gICAgICAnaWYodHlwZW9mIFkgPT09IFwibnVtYmVyXCIpIHJldHVybiAnK0IrJztcXG4nK1xuICAgICAgJ3JldHVybiAnK0MrJztcXG4nXG4gICAgKTtcbiAgfVxufSgpKTtcblxubnVtZXJpYy5jY3NTY2F0dGVyID0gZnVuY3Rpb24gY2NzU2NhdHRlcihBKSB7XG4gIHZhciBBaSA9IEFbMF0sIEFqID0gQVsxXSwgQXYgPSBBWzJdO1xuICB2YXIgbiA9IG51bWVyaWMuc3VwKEFqKSsxLG09QWkubGVuZ3RoO1xuICB2YXIgUmkgPSBudW1lcmljLnJlcChbbl0sMCksUmo9QXJyYXkobSksIFJ2ID0gQXJyYXkobSk7XG4gIHZhciBjb3VudHMgPSBudW1lcmljLnJlcChbbl0sMCksaTtcbiAgZm9yKGk9MDtpPG07KytpKSBjb3VudHNbQWpbaV1dKys7XG4gIGZvcihpPTA7aTxuOysraSkgUmlbaSsxXSA9IFJpW2ldICsgY291bnRzW2ldO1xuICB2YXIgcHRyID0gUmkuc2xpY2UoMCksayxBaWk7XG4gIGZvcihpPTA7aTxtOysraSkge1xuICAgIEFpaSA9IEFqW2ldO1xuICAgIGsgPSBwdHJbQWlpXTtcbiAgICBSaltrXSA9IEFpW2ldO1xuICAgIFJ2W2tdID0gQXZbaV07XG4gICAgcHRyW0FpaV09cHRyW0FpaV0rMTtcbiAgfVxuICByZXR1cm4gW1JpLFJqLFJ2XTtcbn1cblxubnVtZXJpYy5jY3NHYXRoZXIgPSBmdW5jdGlvbiBjY3NHYXRoZXIoQSkge1xuICB2YXIgQWkgPSBBWzBdLCBBaiA9IEFbMV0sIEF2ID0gQVsyXTtcbiAgdmFyIG4gPSBBaS5sZW5ndGgtMSxtID0gQWoubGVuZ3RoO1xuICB2YXIgUmkgPSBBcnJheShtKSwgUmogPSBBcnJheShtKSwgUnYgPSBBcnJheShtKTtcbiAgdmFyIGksaixqMCxqMSxwO1xuICBwPTA7XG4gIGZvcihpPTA7aTxuOysraSkge1xuICAgIGowID0gQWlbaV07XG4gICAgajEgPSBBaVtpKzFdO1xuICAgIGZvcihqPWowO2ohPT1qMTsrK2opIHtcbiAgICAgIFJqW3BdID0gaTtcbiAgICAgIFJpW3BdID0gQWpbal07XG4gICAgICBSdltwXSA9IEF2W2pdO1xuICAgICAgKytwO1xuICAgIH1cbiAgfVxuICByZXR1cm4gW1JpLFJqLFJ2XTtcbn1cblxuLy8gVGhlIGZvbGxvd2luZyBzcGFyc2UgbGluZWFyIGFsZ2VicmEgcm91dGluZXMgYXJlIGRlcHJlY2F0ZWQuXG5cbm51bWVyaWMuc2RpbSA9IGZ1bmN0aW9uIGRpbShBLHJldCxrKSB7XG4gIGlmKHR5cGVvZiByZXQgPT09IFwidW5kZWZpbmVkXCIpIHsgcmV0ID0gW107IH1cbiAgaWYodHlwZW9mIEEgIT09IFwib2JqZWN0XCIpIHJldHVybiByZXQ7XG4gIGlmKHR5cGVvZiBrID09PSBcInVuZGVmaW5lZFwiKSB7IGs9MDsgfVxuICBpZighKGsgaW4gcmV0KSkgeyByZXRba10gPSAwOyB9XG4gIGlmKEEubGVuZ3RoID4gcmV0W2tdKSByZXRba10gPSBBLmxlbmd0aDtcbiAgdmFyIGk7XG4gIGZvcihpIGluIEEpIHtcbiAgICBpZihBLmhhc093blByb3BlcnR5KGkpKSBkaW0oQVtpXSxyZXQsaysxKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxubnVtZXJpYy5zY2xvbmUgPSBmdW5jdGlvbiBjbG9uZShBLGssbikge1xuICBpZih0eXBlb2YgayA9PT0gXCJ1bmRlZmluZWRcIikgeyBrPTA7IH1cbiAgaWYodHlwZW9mIG4gPT09IFwidW5kZWZpbmVkXCIpIHsgbiA9IG51bWVyaWMuc2RpbShBKS5sZW5ndGg7IH1cbiAgdmFyIGkscmV0ID0gQXJyYXkoQS5sZW5ndGgpO1xuICBpZihrID09PSBuLTEpIHtcbiAgICBmb3IoaSBpbiBBKSB7IGlmKEEuaGFzT3duUHJvcGVydHkoaSkpIHJldFtpXSA9IEFbaV07IH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGZvcihpIGluIEEpIHtcbiAgICBpZihBLmhhc093blByb3BlcnR5KGkpKSByZXRbaV0gPSBjbG9uZShBW2ldLGsrMSxuKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5udW1lcmljLnNkaWFnID0gZnVuY3Rpb24gZGlhZyhkKSB7XG4gIHZhciBuID0gZC5sZW5ndGgsaSxyZXQgPSBBcnJheShuKSxpMSxpMixpMztcbiAgZm9yKGk9bi0xO2k+PTE7aS09Mikge1xuICAgIGkxID0gaS0xO1xuICAgIHJldFtpXSA9IFtdOyByZXRbaV1baV0gPSBkW2ldO1xuICAgIHJldFtpMV0gPSBbXTsgcmV0W2kxXVtpMV0gPSBkW2kxXTtcbiAgfVxuICBpZihpPT09MCkgeyByZXRbMF0gPSBbXTsgcmV0WzBdWzBdID0gZFtpXTsgfVxuICByZXR1cm4gcmV0O1xufVxuXG5udW1lcmljLnNpZGVudGl0eSA9IGZ1bmN0aW9uIGlkZW50aXR5KG4pIHsgcmV0dXJuIG51bWVyaWMuc2RpYWcobnVtZXJpYy5yZXAoW25dLDEpKTsgfVxuXG5udW1lcmljLnN0cmFuc3Bvc2UgPSBmdW5jdGlvbiB0cmFuc3Bvc2UoQSkge1xuICB2YXIgcmV0ID0gW10sIG4gPSBBLmxlbmd0aCwgaSxqLEFpO1xuICBmb3IoaSBpbiBBKSB7XG4gICAgaWYoIShBLmhhc093blByb3BlcnR5KGkpKSkgY29udGludWU7XG4gICAgQWkgPSBBW2ldO1xuICAgIGZvcihqIGluIEFpKSB7XG4gICAgICBpZighKEFpLmhhc093blByb3BlcnR5KGopKSkgY29udGludWU7XG4gICAgICBpZih0eXBlb2YgcmV0W2pdICE9PSBcIm9iamVjdFwiKSB7IHJldFtqXSA9IFtdOyB9XG4gICAgICByZXRbal1baV0gPSBBaVtqXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxubnVtZXJpYy5zTFVQID0gZnVuY3Rpb24gTFVQKEEsdG9sKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIlRoZSBmdW5jdGlvbiBudW1lcmljLnNMVVAgaGFkIGEgYnVnIGluIGl0IGFuZCBoYXMgYmVlbiByZW1vdmVkLiBQbGVhc2UgdXNlIHRoZSBuZXcgbnVtZXJpYy5jY3NMVVAgZnVuY3Rpb24gaW5zdGVhZC5cIik7XG59O1xuXG5udW1lcmljLnNkb3RNTSA9IGZ1bmN0aW9uIGRvdE1NKEEsQikge1xuICB2YXIgcCA9IEEubGVuZ3RoLCBxID0gQi5sZW5ndGgsIEJUID0gbnVtZXJpYy5zdHJhbnNwb3NlKEIpLCByID0gQlQubGVuZ3RoLCBBaSwgQlRrO1xuICB2YXIgaSxqLGssYWNjdW07XG4gIHZhciByZXQgPSBBcnJheShwKSxyZXRpO1xuICBmb3IoaT1wLTE7aT49MDtpLS0pIHtcbiAgICByZXRpID0gW107XG4gICAgQWkgPSBBW2ldO1xuICAgIGZvcihrPXItMTtrPj0wO2stLSkge1xuICAgICAgYWNjdW0gPSAwO1xuICAgICAgQlRrID0gQlRba107XG4gICAgICBmb3IoaiBpbiBBaSkge1xuICAgICAgICBpZighKEFpLmhhc093blByb3BlcnR5KGopKSkgY29udGludWU7XG4gICAgICAgIGlmKGogaW4gQlRrKSB7IGFjY3VtICs9IEFpW2pdKkJUa1tqXTsgfVxuICAgICAgfVxuICAgICAgaWYoYWNjdW0pIHJldGlba10gPSBhY2N1bTtcbiAgICB9XG4gICAgcmV0W2ldID0gcmV0aTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5udW1lcmljLnNkb3RNViA9IGZ1bmN0aW9uIGRvdE1WKEEseCkge1xuICB2YXIgcCA9IEEubGVuZ3RoLCBBaSwgaSxqO1xuICB2YXIgcmV0ID0gQXJyYXkocCksIGFjY3VtO1xuICBmb3IoaT1wLTE7aT49MDtpLS0pIHtcbiAgICBBaSA9IEFbaV07XG4gICAgYWNjdW0gPSAwO1xuICAgIGZvcihqIGluIEFpKSB7XG4gICAgICBpZighKEFpLmhhc093blByb3BlcnR5KGopKSkgY29udGludWU7XG4gICAgICBpZih4W2pdKSBhY2N1bSArPSBBaVtqXSp4W2pdO1xuICAgIH1cbiAgICBpZihhY2N1bSkgcmV0W2ldID0gYWNjdW07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxubnVtZXJpYy5zZG90Vk0gPSBmdW5jdGlvbiBkb3RNVih4LEEpIHtcbiAgdmFyIGksaixBaSxhbHBoYTtcbiAgdmFyIHJldCA9IFtdLCBhY2N1bTtcbiAgZm9yKGkgaW4geCkge1xuICAgIGlmKCF4Lmhhc093blByb3BlcnR5KGkpKSBjb250aW51ZTtcbiAgICBBaSA9IEFbaV07XG4gICAgYWxwaGEgPSB4W2ldO1xuICAgIGZvcihqIGluIEFpKSB7XG4gICAgICBpZighQWkuaGFzT3duUHJvcGVydHkoaikpIGNvbnRpbnVlO1xuICAgICAgaWYoIXJldFtqXSkgeyByZXRbal0gPSAwOyB9XG4gICAgICByZXRbal0gKz0gYWxwaGEqQWlbal07XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbm51bWVyaWMuc2RvdFZWID0gZnVuY3Rpb24gZG90VlYoeCx5KSB7XG4gIHZhciBpLHJldD0wO1xuICBmb3IoaSBpbiB4KSB7IGlmKHhbaV0gJiYgeVtpXSkgcmV0Kz0geFtpXSp5W2ldOyB9XG4gIHJldHVybiByZXQ7XG59XG5cbm51bWVyaWMuc2RvdCA9IGZ1bmN0aW9uIGRvdChBLEIpIHtcbiAgdmFyIG0gPSBudW1lcmljLnNkaW0oQSkubGVuZ3RoLCBuID0gbnVtZXJpYy5zZGltKEIpLmxlbmd0aDtcbiAgdmFyIGsgPSBtKjEwMDArbjtcbiAgc3dpdGNoKGspIHtcbiAgICBjYXNlIDA6IHJldHVybiBBKkI7XG4gICAgY2FzZSAxMDAxOiByZXR1cm4gbnVtZXJpYy5zZG90VlYoQSxCKTtcbiAgICBjYXNlIDIwMDE6IHJldHVybiBudW1lcmljLnNkb3RNVihBLEIpO1xuICAgIGNhc2UgMTAwMjogcmV0dXJuIG51bWVyaWMuc2RvdFZNKEEsQik7XG4gICAgY2FzZSAyMDAyOiByZXR1cm4gbnVtZXJpYy5zZG90TU0oQSxCKTtcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ251bWVyaWMuc2RvdCBub3QgaW1wbGVtZW50ZWQgZm9yIHRlbnNvcnMgb2Ygb3JkZXIgJyttKycgYW5kICcrbik7XG4gIH1cbn1cblxubnVtZXJpYy5zc2NhdHRlciA9IGZ1bmN0aW9uIHNjYXR0ZXIoVikge1xuICB2YXIgbiA9IFZbMF0ubGVuZ3RoLCBWaWosIGksIGosIG0gPSBWLmxlbmd0aCwgQSA9IFtdLCBBajtcbiAgZm9yKGk9bi0xO2k+PTA7LS1pKSB7XG4gICAgaWYoIVZbbS0xXVtpXSkgY29udGludWU7XG4gICAgQWogPSBBO1xuICAgIGZvcihqPTA7ajxtLTI7aisrKSB7XG4gICAgICBWaWogPSBWW2pdW2ldO1xuICAgICAgaWYoIUFqW1Zpal0pIEFqW1Zpal0gPSBbXTtcbiAgICAgIEFqID0gQWpbVmlqXTtcbiAgICB9XG4gICAgQWpbVltqXVtpXV0gPSBWW2orMV1baV07XG4gIH1cbiAgcmV0dXJuIEE7XG59XG5cbm51bWVyaWMuc2dhdGhlciA9IGZ1bmN0aW9uIGdhdGhlcihBLHJldCxrKSB7XG4gIGlmKHR5cGVvZiByZXQgPT09IFwidW5kZWZpbmVkXCIpIHJldCA9IFtdO1xuICBpZih0eXBlb2YgayA9PT0gXCJ1bmRlZmluZWRcIikgayA9IFtdO1xuICB2YXIgbixpLEFpO1xuICBuID0gay5sZW5ndGg7XG4gIGZvcihpIGluIEEpIHtcbiAgICBpZihBLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICBrW25dID0gcGFyc2VJbnQoaSk7XG4gICAgICBBaSA9IEFbaV07XG4gICAgICBpZih0eXBlb2YgQWkgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgaWYoQWkpIHtcbiAgICAgICAgICBpZihyZXQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBmb3IoaT1uKzE7aT49MDstLWkpIHJldFtpXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IoaT1uO2k+PTA7LS1pKSByZXRbaV0ucHVzaChrW2ldKTtcbiAgICAgICAgICByZXRbbisxXS5wdXNoKEFpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGdhdGhlcihBaSxyZXQsayk7XG4gICAgfVxuICB9XG4gIGlmKGsubGVuZ3RoPm4pIGsucG9wKCk7XG4gIHJldHVybiByZXQ7XG59XG5cbi8vIDYuIENvb3JkaW5hdGUgbWF0cmljZXNcbm51bWVyaWMuY0xVID0gZnVuY3Rpb24gTFUoQSkge1xuICB2YXIgSSA9IEFbMF0sIEogPSBBWzFdLCBWID0gQVsyXTtcbiAgdmFyIHAgPSBJLmxlbmd0aCwgbT0wLCBpLGosayxhLGIsYztcbiAgZm9yKGk9MDtpPHA7aSsrKSBpZihJW2ldPm0pIG09SVtpXTtcbiAgbSsrO1xuICB2YXIgTCA9IEFycmF5KG0pLCBVID0gQXJyYXkobSksIGxlZnQgPSBudW1lcmljLnJlcChbbV0sSW5maW5pdHkpLCByaWdodCA9IG51bWVyaWMucmVwKFttXSwtSW5maW5pdHkpO1xuICB2YXIgVWksIFVqLGFscGhhO1xuICBmb3Ioaz0wO2s8cDtrKyspIHtcbiAgICBpID0gSVtrXTtcbiAgICBqID0gSltrXTtcbiAgICBpZihqPGxlZnRbaV0pIGxlZnRbaV0gPSBqO1xuICAgIGlmKGo+cmlnaHRbaV0pIHJpZ2h0W2ldID0gajtcbiAgfVxuICBmb3IoaT0wO2k8bS0xO2krKykgeyBpZihyaWdodFtpXSA+IHJpZ2h0W2krMV0pIHJpZ2h0W2krMV0gPSByaWdodFtpXTsgfVxuICBmb3IoaT1tLTE7aT49MTtpLS0pIHsgaWYobGVmdFtpXTxsZWZ0W2ktMV0pIGxlZnRbaS0xXSA9IGxlZnRbaV07IH1cbiAgdmFyIGNvdW50TCA9IDAsIGNvdW50VSA9IDA7XG4gIGZvcihpPTA7aTxtO2krKykge1xuICAgIFVbaV0gPSBudW1lcmljLnJlcChbcmlnaHRbaV0tbGVmdFtpXSsxXSwwKTtcbiAgICBMW2ldID0gbnVtZXJpYy5yZXAoW2ktbGVmdFtpXV0sMCk7XG4gICAgY291bnRMICs9IGktbGVmdFtpXSsxO1xuICAgIGNvdW50VSArPSByaWdodFtpXS1pKzE7XG4gIH1cbiAgZm9yKGs9MDtrPHA7aysrKSB7IGkgPSBJW2tdOyBVW2ldW0pba10tbGVmdFtpXV0gPSBWW2tdOyB9XG4gIGZvcihpPTA7aTxtLTE7aSsrKSB7XG4gICAgYSA9IGktbGVmdFtpXTtcbiAgICBVaSA9IFVbaV07XG4gICAgZm9yKGo9aSsxO2xlZnRbal08PWkgJiYgajxtO2orKykge1xuICAgICAgYiA9IGktbGVmdFtqXTtcbiAgICAgIGMgPSByaWdodFtpXS1pO1xuICAgICAgVWogPSBVW2pdO1xuICAgICAgYWxwaGEgPSBValtiXS9VaVthXTtcbiAgICAgIGlmKGFscGhhKSB7XG4gICAgICAgIGZvcihrPTE7azw9YztrKyspIHsgVWpbaytiXSAtPSBhbHBoYSpVaVtrK2FdOyB9XG4gICAgICAgIExbal1baS1sZWZ0W2pdXSA9IGFscGhhO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB2YXIgVWkgPSBbXSwgVWogPSBbXSwgVXYgPSBbXSwgTGkgPSBbXSwgTGogPSBbXSwgTHYgPSBbXTtcbiAgdmFyIHAscSxmb287XG4gIHA9MDsgcT0wO1xuICBmb3IoaT0wO2k8bTtpKyspIHtcbiAgICBhID0gbGVmdFtpXTtcbiAgICBiID0gcmlnaHRbaV07XG4gICAgZm9vID0gVVtpXTtcbiAgICBmb3Ioaj1pO2o8PWI7aisrKSB7XG4gICAgICBpZihmb29bai1hXSkge1xuICAgICAgICBVaVtwXSA9IGk7XG4gICAgICAgIFVqW3BdID0gajtcbiAgICAgICAgVXZbcF0gPSBmb29bai1hXTtcbiAgICAgICAgcCsrO1xuICAgICAgfVxuICAgIH1cbiAgICBmb28gPSBMW2ldO1xuICAgIGZvcihqPWE7ajxpO2orKykge1xuICAgICAgaWYoZm9vW2otYV0pIHtcbiAgICAgICAgTGlbcV0gPSBpO1xuICAgICAgICBMaltxXSA9IGo7XG4gICAgICAgIEx2W3FdID0gZm9vW2otYV07XG4gICAgICAgIHErKztcbiAgICAgIH1cbiAgICB9XG4gICAgTGlbcV0gPSBpO1xuICAgIExqW3FdID0gaTtcbiAgICBMdltxXSA9IDE7XG4gICAgcSsrO1xuICB9XG4gIHJldHVybiB7VTpbVWksVWosVXZdLCBMOltMaSxMaixMdl19O1xufTtcblxubnVtZXJpYy5jTFVzb2x2ZSA9IGZ1bmN0aW9uIExVc29sdmUobHUsYikge1xuICB2YXIgTCA9IGx1LkwsIFUgPSBsdS5VLCByZXQgPSBudW1lcmljLmNsb25lKGIpO1xuICB2YXIgTGkgPSBMWzBdLCBMaiA9IExbMV0sIEx2ID0gTFsyXTtcbiAgdmFyIFVpID0gVVswXSwgVWogPSBVWzFdLCBVdiA9IFVbMl07XG4gIHZhciBwID0gVWkubGVuZ3RoLCBxID0gTGkubGVuZ3RoO1xuICB2YXIgbSA9IHJldC5sZW5ndGgsaSxqLGs7XG4gIGsgPSAwO1xuICBmb3IoaT0wO2k8bTtpKyspIHtcbiAgICB3aGlsZShMaltrXSA8IGkpIHtcbiAgICAgIHJldFtpXSAtPSBMdltrXSpyZXRbTGpba11dO1xuICAgICAgaysrO1xuICAgIH1cbiAgICBrKys7XG4gIH1cbiAgayA9IHAtMTtcbiAgZm9yKGk9bS0xO2k+PTA7aS0tKSB7XG4gICAgd2hpbGUoVWpba10gPiBpKSB7XG4gICAgICByZXRbaV0gLT0gVXZba10qcmV0W1VqW2tdXTtcbiAgICAgIGstLTtcbiAgICB9XG4gICAgcmV0W2ldIC89IFV2W2tdO1xuICAgIGstLTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxubnVtZXJpYy5jZ3JpZCA9IGZ1bmN0aW9uIGdyaWQobixzaGFwZSkge1xuICBpZih0eXBlb2YgbiA9PT0gXCJudW1iZXJcIikgbiA9IFtuLG5dO1xuICB2YXIgcmV0ID0gbnVtZXJpYy5yZXAobiwtMSk7XG4gIHZhciBpLGosY291bnQ7XG4gIGlmKHR5cGVvZiBzaGFwZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgc3dpdGNoKHNoYXBlKSB7XG4gICAgICBjYXNlICdMJzpcbiAgICAgICAgc2hhcGUgPSBmdW5jdGlvbihpLGopIHsgcmV0dXJuIChpPj1uWzBdLzIgfHwgajxuWzFdLzIpOyB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc2hhcGUgPSBmdW5jdGlvbihpLGopIHsgcmV0dXJuIHRydWU7IH07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBjb3VudD0wO1xuICBmb3IoaT0xO2k8blswXS0xO2krKykgZm9yKGo9MTtqPG5bMV0tMTtqKyspXG4gICAgaWYoc2hhcGUoaSxqKSkge1xuICAgICAgcmV0W2ldW2pdID0gY291bnQ7XG4gICAgICBjb3VudCsrO1xuICAgIH1cbiAgcmV0dXJuIHJldDtcbn1cblxubnVtZXJpYy5jZGVsc3EgPSBmdW5jdGlvbiBkZWxzcShnKSB7XG4gIHZhciBkaXIgPSBbWy0xLDBdLFswLC0xXSxbMCwxXSxbMSwwXV07XG4gIHZhciBzID0gbnVtZXJpYy5kaW0oZyksIG0gPSBzWzBdLCBuID0gc1sxXSwgaSxqLGsscCxxO1xuICB2YXIgTGkgPSBbXSwgTGogPSBbXSwgTHYgPSBbXTtcbiAgZm9yKGk9MTtpPG0tMTtpKyspIGZvcihqPTE7ajxuLTE7aisrKSB7XG4gICAgaWYoZ1tpXVtqXTwwKSBjb250aW51ZTtcbiAgICBmb3Ioaz0wO2s8NDtrKyspIHtcbiAgICAgIHAgPSBpK2RpcltrXVswXTtcbiAgICAgIHEgPSBqK2RpcltrXVsxXTtcbiAgICAgIGlmKGdbcF1bcV08MCkgY29udGludWU7XG4gICAgICBMaS5wdXNoKGdbaV1bal0pO1xuICAgICAgTGoucHVzaChnW3BdW3FdKTtcbiAgICAgIEx2LnB1c2goLTEpO1xuICAgIH1cbiAgICBMaS5wdXNoKGdbaV1bal0pO1xuICAgIExqLnB1c2goZ1tpXVtqXSk7XG4gICAgTHYucHVzaCg0KTtcbiAgfVxuICByZXR1cm4gW0xpLExqLEx2XTtcbn1cblxubnVtZXJpYy5jZG90TVYgPSBmdW5jdGlvbiBkb3RNVihBLHgpIHtcbiAgdmFyIHJldCwgQWkgPSBBWzBdLCBBaiA9IEFbMV0sIEF2ID0gQVsyXSxrLHA9QWkubGVuZ3RoLE47XG4gIE49MDtcbiAgZm9yKGs9MDtrPHA7aysrKSB7IGlmKEFpW2tdPk4pIE4gPSBBaVtrXTsgfVxuICBOKys7XG4gIHJldCA9IG51bWVyaWMucmVwKFtOXSwwKTtcbiAgZm9yKGs9MDtrPHA7aysrKSB7IHJldFtBaVtrXV0rPUF2W2tdKnhbQWpba11dOyB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8vIDcuIFNwbGluZXNcblxubnVtZXJpYy5TcGxpbmUgPSBmdW5jdGlvbiBTcGxpbmUoeCx5bCx5cixrbCxrcikgeyB0aGlzLnggPSB4OyB0aGlzLnlsID0geWw7IHRoaXMueXIgPSB5cjsgdGhpcy5rbCA9IGtsOyB0aGlzLmtyID0ga3I7IH1cbm51bWVyaWMuU3BsaW5lLnByb3RvdHlwZS5fYXQgPSBmdW5jdGlvbiBfYXQoeDEscCkge1xuICB2YXIgeCA9IHRoaXMueDtcbiAgdmFyIHlsID0gdGhpcy55bDtcbiAgdmFyIHlyID0gdGhpcy55cjtcbiAgdmFyIGtsID0gdGhpcy5rbDtcbiAgdmFyIGtyID0gdGhpcy5rcjtcbiAgdmFyIHgxLGEsYix0O1xuICB2YXIgYWRkID0gbnVtZXJpYy5hZGQsIHN1YiA9IG51bWVyaWMuc3ViLCBtdWwgPSBudW1lcmljLm11bDtcbiAgYSA9IHN1YihtdWwoa2xbcF0seFtwKzFdLXhbcF0pLHN1Yih5cltwKzFdLHlsW3BdKSk7XG4gIGIgPSBhZGQobXVsKGtyW3ArMV0seFtwXS14W3ArMV0pLHN1Yih5cltwKzFdLHlsW3BdKSk7XG4gIHQgPSAoeDEteFtwXSkvKHhbcCsxXS14W3BdKTtcbiAgdmFyIHMgPSB0KigxLXQpO1xuICByZXR1cm4gYWRkKGFkZChhZGQobXVsKDEtdCx5bFtwXSksbXVsKHQseXJbcCsxXSkpLG11bChhLHMqKDEtdCkpKSxtdWwoYixzKnQpKTtcbn1cbm51bWVyaWMuU3BsaW5lLnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uIGF0KHgwKSB7XG4gIGlmKHR5cGVvZiB4MCA9PT0gXCJudW1iZXJcIikge1xuICAgIHZhciB4ID0gdGhpcy54O1xuICAgIHZhciBuID0geC5sZW5ndGg7XG4gICAgdmFyIHAscSxtaWQsZmxvb3IgPSBNYXRoLmZsb29yLGEsYix0O1xuICAgIHAgPSAwO1xuICAgIHEgPSBuLTE7XG4gICAgd2hpbGUocS1wPjEpIHtcbiAgICAgIG1pZCA9IGZsb29yKChwK3EpLzIpO1xuICAgICAgaWYoeFttaWRdIDw9IHgwKSBwID0gbWlkO1xuICAgICAgZWxzZSBxID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYXQoeDAscCk7XG4gIH1cbiAgdmFyIG4gPSB4MC5sZW5ndGgsIGksIHJldCA9IEFycmF5KG4pO1xuICBmb3IoaT1uLTE7aSE9PS0xOy0taSkgcmV0W2ldID0gdGhpcy5hdCh4MFtpXSk7XG4gIHJldHVybiByZXQ7XG59XG5udW1lcmljLlNwbGluZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIGRpZmYoKSB7XG4gIHZhciB4ID0gdGhpcy54O1xuICB2YXIgeWwgPSB0aGlzLnlsO1xuICB2YXIgeXIgPSB0aGlzLnlyO1xuICB2YXIga2wgPSB0aGlzLmtsO1xuICB2YXIga3IgPSB0aGlzLmtyO1xuICB2YXIgbiA9IHlsLmxlbmd0aDtcbiAgdmFyIGksZHgsZHk7XG4gIHZhciB6bCA9IGtsLCB6ciA9IGtyLCBwbCA9IEFycmF5KG4pLCBwciA9IEFycmF5KG4pO1xuICB2YXIgYWRkID0gbnVtZXJpYy5hZGQsIG11bCA9IG51bWVyaWMubXVsLCBkaXYgPSBudW1lcmljLmRpdiwgc3ViID0gbnVtZXJpYy5zdWI7XG4gIGZvcihpPW4tMTtpIT09LTE7LS1pKSB7XG4gICAgZHggPSB4W2krMV0teFtpXTtcbiAgICBkeSA9IHN1Yih5cltpKzFdLHlsW2ldKTtcbiAgICBwbFtpXSA9IGRpdihhZGQobXVsKGR5LCA2KSxtdWwoa2xbaV0sLTQqZHgpLG11bChrcltpKzFdLC0yKmR4KSksZHgqZHgpO1xuICAgIHByW2krMV0gPSBkaXYoYWRkKG11bChkeSwtNiksbXVsKGtsW2ldLCAyKmR4KSxtdWwoa3JbaSsxXSwgNCpkeCkpLGR4KmR4KTtcbiAgfVxuICByZXR1cm4gbmV3IG51bWVyaWMuU3BsaW5lKHgsemwsenIscGwscHIpO1xufVxubnVtZXJpYy5TcGxpbmUucHJvdG90eXBlLnJvb3RzID0gZnVuY3Rpb24gcm9vdHMoKSB7XG4gIGZ1bmN0aW9uIHNxcih4KSB7IHJldHVybiB4Kng7IH1cbiAgZnVuY3Rpb24gaGV2YWwoeTAseTEsazAsazEseCkge1xuICAgIHZhciBBID0gazAqMi0oeTEteTApO1xuICAgIHZhciBCID0gLWsxKjIrKHkxLXkwKTtcbiAgICB2YXIgdCA9ICh4KzEpKjAuNTtcbiAgICB2YXIgcyA9IHQqKDEtdCk7XG4gICAgcmV0dXJuICgxLXQpKnkwK3QqeTErQSpzKigxLXQpK0Iqcyp0O1xuICB9XG4gIHZhciByZXQgPSBbXTtcbiAgdmFyIHggPSB0aGlzLngsIHlsID0gdGhpcy55bCwgeXIgPSB0aGlzLnlyLCBrbCA9IHRoaXMua2wsIGtyID0gdGhpcy5rcjtcbiAgaWYodHlwZW9mIHlsWzBdID09PSBcIm51bWJlclwiKSB7XG4gICAgeWwgPSBbeWxdO1xuICAgIHlyID0gW3lyXTtcbiAgICBrbCA9IFtrbF07XG4gICAga3IgPSBba3JdO1xuICB9XG4gIHZhciBtID0geWwubGVuZ3RoLG49eC5sZW5ndGgtMSxpLGosayx5LHMsdDtcbiAgdmFyIGFpLGJpLGNpLGRpLCByZXQgPSBBcnJheShtKSxyaSxrMCxrMSx5MCx5MSxBLEIsRCxkeCxjeCxzdG9wcyx6MCx6MSx6bSx0MCx0MSx0bTtcbiAgdmFyIHNxcnQgPSBNYXRoLnNxcnQ7XG4gIGZvcihpPTA7aSE9PW07KytpKSB7XG4gICAgYWkgPSB5bFtpXTtcbiAgICBiaSA9IHlyW2ldO1xuICAgIGNpID0ga2xbaV07XG4gICAgZGkgPSBrcltpXTtcbiAgICByaSA9IFtdO1xuICAgIGZvcihqPTA7aiE9PW47aisrKSB7XG4gICAgICBpZihqPjAgJiYgYmlbal0qYWlbal08MCkgcmkucHVzaCh4W2pdKTtcbiAgICAgIGR4ID0gKHhbaisxXS14W2pdKTtcbiAgICAgIGN4ID0geFtqXTtcbiAgICAgIHkwID0gYWlbal07XG4gICAgICB5MSA9IGJpW2orMV07XG4gICAgICBrMCA9IGNpW2pdL2R4O1xuICAgICAgazEgPSBkaVtqKzFdL2R4O1xuICAgICAgRCA9IHNxcihrMC1rMSszKih5MC15MSkpICsgMTIqazEqeTA7XG4gICAgICBBID0gazErMyp5MCsyKmswLTMqeTE7XG4gICAgICBCID0gMyooazErazArMiooeTAteTEpKTtcbiAgICAgIGlmKEQ8PTApIHtcbiAgICAgICAgejAgPSBBL0I7XG4gICAgICAgIGlmKHowPnhbal0gJiYgejA8eFtqKzFdKSBzdG9wcyA9IFt4W2pdLHowLHhbaisxXV07XG4gICAgICAgIGVsc2Ugc3RvcHMgPSBbeFtqXSx4W2orMV1dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgejAgPSAoQS1zcXJ0KEQpKS9CO1xuICAgICAgICB6MSA9IChBK3NxcnQoRCkpL0I7XG4gICAgICAgIHN0b3BzID0gW3hbal1dO1xuICAgICAgICBpZih6MD54W2pdICYmIHowPHhbaisxXSkgc3RvcHMucHVzaCh6MCk7XG4gICAgICAgIGlmKHoxPnhbal0gJiYgejE8eFtqKzFdKSBzdG9wcy5wdXNoKHoxKTtcbiAgICAgICAgc3RvcHMucHVzaCh4W2orMV0pO1xuICAgICAgfVxuICAgICAgdDAgPSBzdG9wc1swXTtcbiAgICAgIHowID0gdGhpcy5fYXQodDAsaik7XG4gICAgICBmb3Ioaz0wO2s8c3RvcHMubGVuZ3RoLTE7aysrKSB7XG4gICAgICAgIHQxID0gc3RvcHNbaysxXTtcbiAgICAgICAgejEgPSB0aGlzLl9hdCh0MSxqKTtcbiAgICAgICAgaWYoejAgPT09IDApIHtcbiAgICAgICAgICByaS5wdXNoKHQwKTtcbiAgICAgICAgICB0MCA9IHQxO1xuICAgICAgICAgIHowID0gejE7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYoejEgPT09IDAgfHwgejAqejE+MCkge1xuICAgICAgICAgIHQwID0gdDE7XG4gICAgICAgICAgejAgPSB6MTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2lkZSA9IDA7XG4gICAgICAgIHdoaWxlKDEpIHtcbiAgICAgICAgICB0bSA9ICh6MCp0MS16MSp0MCkvKHowLXoxKTtcbiAgICAgICAgICBpZih0bSA8PSB0MCB8fCB0bSA+PSB0MSkgeyBicmVhazsgfVxuICAgICAgICAgIHptID0gdGhpcy5fYXQodG0saik7XG4gICAgICAgICAgaWYoem0qejE+MCkge1xuICAgICAgICAgICAgdDEgPSB0bTtcbiAgICAgICAgICAgIHoxID0gem07XG4gICAgICAgICAgICBpZihzaWRlID09PSAtMSkgejAqPTAuNTtcbiAgICAgICAgICAgIHNpZGUgPSAtMTtcbiAgICAgICAgICB9IGVsc2UgaWYoem0qejA+MCkge1xuICAgICAgICAgICAgdDAgPSB0bTtcbiAgICAgICAgICAgIHowID0gem07XG4gICAgICAgICAgICBpZihzaWRlID09PSAxKSB6MSo9MC41O1xuICAgICAgICAgICAgc2lkZSA9IDE7XG4gICAgICAgICAgfSBlbHNlIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJpLnB1c2godG0pO1xuICAgICAgICB0MCA9IHN0b3BzW2srMV07XG4gICAgICAgIHowID0gdGhpcy5fYXQodDAsIGopO1xuICAgICAgfVxuICAgICAgaWYoejEgPT09IDApIHJpLnB1c2godDEpO1xuICAgIH1cbiAgICByZXRbaV0gPSByaTtcbiAgfVxuICBpZih0eXBlb2YgdGhpcy55bFswXSA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHJldFswXTtcbiAgcmV0dXJuIHJldDtcbn1cbm51bWVyaWMuc3BsaW5lID0gZnVuY3Rpb24gc3BsaW5lKHgseSxrMSxrbikge1xuICB2YXIgbiA9IHgubGVuZ3RoLCBiID0gW10sIGR4ID0gW10sIGR5ID0gW107XG4gIHZhciBpO1xuICB2YXIgc3ViID0gbnVtZXJpYy5zdWIsbXVsID0gbnVtZXJpYy5tdWwsYWRkID0gbnVtZXJpYy5hZGQ7XG4gIGZvcihpPW4tMjtpPj0wO2ktLSkgeyBkeFtpXSA9IHhbaSsxXS14W2ldOyBkeVtpXSA9IHN1Yih5W2krMV0seVtpXSk7IH1cbiAgaWYodHlwZW9mIGsxID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBrbiA9PT0gXCJzdHJpbmdcIikge1xuICAgIGsxID0ga24gPSBcInBlcmlvZGljXCI7XG4gIH1cbiAgLy8gQnVpbGQgc3BhcnNlIHRyaWRpYWdvbmFsIHN5c3RlbVxuICB2YXIgVCA9IFtbXSxbXSxbXV07XG4gIHN3aXRjaCh0eXBlb2YgazEpIHtcbiAgICBjYXNlIFwidW5kZWZpbmVkXCI6XG4gICAgICBiWzBdID0gbXVsKDMvKGR4WzBdKmR4WzBdKSxkeVswXSk7XG4gICAgICBUWzBdLnB1c2goMCwwKTtcbiAgICAgIFRbMV0ucHVzaCgwLDEpO1xuICAgICAgVFsyXS5wdXNoKDIvZHhbMF0sMS9keFswXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICBiWzBdID0gYWRkKG11bCgzLyhkeFtuLTJdKmR4W24tMl0pLGR5W24tMl0pLG11bCgzLyhkeFswXSpkeFswXSksZHlbMF0pKTtcbiAgICAgIFRbMF0ucHVzaCgwLDAsMCk7XG4gICAgICBUWzFdLnB1c2gobi0yLDAsMSk7XG4gICAgICBUWzJdLnB1c2goMS9keFtuLTJdLDIvZHhbbi0yXSsyL2R4WzBdLDEvZHhbMF0pO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJbMF0gPSBrMTtcbiAgICAgIFRbMF0ucHVzaCgwKTtcbiAgICAgIFRbMV0ucHVzaCgwKTtcbiAgICAgIFRbMl0ucHVzaCgxKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIGZvcihpPTE7aTxuLTE7aSsrKSB7XG4gICAgYltpXSA9IGFkZChtdWwoMy8oZHhbaS0xXSpkeFtpLTFdKSxkeVtpLTFdKSxtdWwoMy8oZHhbaV0qZHhbaV0pLGR5W2ldKSk7XG4gICAgVFswXS5wdXNoKGksaSxpKTtcbiAgICBUWzFdLnB1c2goaS0xLGksaSsxKTtcbiAgICBUWzJdLnB1c2goMS9keFtpLTFdLDIvZHhbaS0xXSsyL2R4W2ldLDEvZHhbaV0pO1xuICB9XG4gIHN3aXRjaCh0eXBlb2Yga24pIHtcbiAgICBjYXNlIFwidW5kZWZpbmVkXCI6XG4gICAgICBiW24tMV0gPSBtdWwoMy8oZHhbbi0yXSpkeFtuLTJdKSxkeVtuLTJdKTtcbiAgICAgIFRbMF0ucHVzaChuLTEsbi0xKTtcbiAgICAgIFRbMV0ucHVzaChuLTIsbi0xKTtcbiAgICAgIFRbMl0ucHVzaCgxL2R4W24tMl0sMi9keFtuLTJdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgIFRbMV1bVFsxXS5sZW5ndGgtMV0gPSAwO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJbbi0xXSA9IGtuO1xuICAgICAgVFswXS5wdXNoKG4tMSk7XG4gICAgICBUWzFdLnB1c2gobi0xKTtcbiAgICAgIFRbMl0ucHVzaCgxKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIGlmKHR5cGVvZiBiWzBdICE9PSBcIm51bWJlclwiKSBiID0gbnVtZXJpYy50cmFuc3Bvc2UoYik7XG4gIGVsc2UgYiA9IFtiXTtcbiAgdmFyIGsgPSBBcnJheShiLmxlbmd0aCk7XG4gIGlmKHR5cGVvZiBrMSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGZvcihpPWsubGVuZ3RoLTE7aSE9PS0xOy0taSkge1xuICAgICAga1tpXSA9IG51bWVyaWMuY2NzTFVQU29sdmUobnVtZXJpYy5jY3NMVVAobnVtZXJpYy5jY3NTY2F0dGVyKFQpKSxiW2ldKTtcbiAgICAgIGtbaV1bbi0xXSA9IGtbaV1bMF07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvcihpPWsubGVuZ3RoLTE7aSE9PS0xOy0taSkge1xuICAgICAga1tpXSA9IG51bWVyaWMuY0xVc29sdmUobnVtZXJpYy5jTFUoVCksYltpXSk7XG4gICAgfVxuICB9XG4gIGlmKHR5cGVvZiB5WzBdID09PSBcIm51bWJlclwiKSBrID0ga1swXTtcbiAgZWxzZSBrID0gbnVtZXJpYy50cmFuc3Bvc2Uoayk7XG4gIHJldHVybiBuZXcgbnVtZXJpYy5TcGxpbmUoeCx5LHksayxrKTtcbn1cblxuLy8gOC4gRkZUXG5udW1lcmljLmZmdHBvdzIgPSBmdW5jdGlvbiBmZnRwb3cyKHgseSkge1xuICB2YXIgbiA9IHgubGVuZ3RoO1xuICBpZihuID09PSAxKSByZXR1cm47XG4gIHZhciBjb3MgPSBNYXRoLmNvcywgc2luID0gTWF0aC5zaW4sIGksajtcbiAgdmFyIHhlID0gQXJyYXkobi8yKSwgeWUgPSBBcnJheShuLzIpLCB4byA9IEFycmF5KG4vMiksIHlvID0gQXJyYXkobi8yKTtcbiAgaiA9IG4vMjtcbiAgZm9yKGk9bi0xO2khPT0tMTstLWkpIHtcbiAgICAtLWo7XG4gICAgeG9bal0gPSB4W2ldO1xuICAgIHlvW2pdID0geVtpXTtcbiAgICAtLWk7XG4gICAgeGVbal0gPSB4W2ldO1xuICAgIHllW2pdID0geVtpXTtcbiAgfVxuICBmZnRwb3cyKHhlLHllKTtcbiAgZmZ0cG93Mih4byx5byk7XG4gIGogPSBuLzI7XG4gIHZhciB0LGsgPSAoLTYuMjgzMTg1MzA3MTc5NTg2NDc2OTI1Mjg2NzY2NTU5MDA1NzY4Mzk0MzM4Nzk4NzUwMjExNjQxOS9uKSxjaSxzaTtcbiAgZm9yKGk9bi0xO2khPT0tMTstLWkpIHtcbiAgICAtLWo7XG4gICAgaWYoaiA9PT0gLTEpIGogPSBuLzItMTtcbiAgICB0ID0gayppO1xuICAgIGNpID0gY29zKHQpO1xuICAgIHNpID0gc2luKHQpO1xuICAgIHhbaV0gPSB4ZVtqXSArIGNpKnhvW2pdIC0gc2kqeW9bal07XG4gICAgeVtpXSA9IHllW2pdICsgY2kqeW9bal0gKyBzaSp4b1tqXTtcbiAgfVxufVxubnVtZXJpYy5faWZmdHBvdzIgPSBmdW5jdGlvbiBfaWZmdHBvdzIoeCx5KSB7XG4gIHZhciBuID0geC5sZW5ndGg7XG4gIGlmKG4gPT09IDEpIHJldHVybjtcbiAgdmFyIGNvcyA9IE1hdGguY29zLCBzaW4gPSBNYXRoLnNpbiwgaSxqO1xuICB2YXIgeGUgPSBBcnJheShuLzIpLCB5ZSA9IEFycmF5KG4vMiksIHhvID0gQXJyYXkobi8yKSwgeW8gPSBBcnJheShuLzIpO1xuICBqID0gbi8yO1xuICBmb3IoaT1uLTE7aSE9PS0xOy0taSkge1xuICAgIC0tajtcbiAgICB4b1tqXSA9IHhbaV07XG4gICAgeW9bal0gPSB5W2ldO1xuICAgIC0taTtcbiAgICB4ZVtqXSA9IHhbaV07XG4gICAgeWVbal0gPSB5W2ldO1xuICB9XG4gIF9pZmZ0cG93Mih4ZSx5ZSk7XG4gIF9pZmZ0cG93Mih4byx5byk7XG4gIGogPSBuLzI7XG4gIHZhciB0LGsgPSAoNi4yODMxODUzMDcxNzk1ODY0NzY5MjUyODY3NjY1NTkwMDU3NjgzOTQzMzg3OTg3NTAyMTE2NDE5L24pLGNpLHNpO1xuICBmb3IoaT1uLTE7aSE9PS0xOy0taSkge1xuICAgIC0tajtcbiAgICBpZihqID09PSAtMSkgaiA9IG4vMi0xO1xuICAgIHQgPSBrKmk7XG4gICAgY2kgPSBjb3ModCk7XG4gICAgc2kgPSBzaW4odCk7XG4gICAgeFtpXSA9IHhlW2pdICsgY2kqeG9bal0gLSBzaSp5b1tqXTtcbiAgICB5W2ldID0geWVbal0gKyBjaSp5b1tqXSArIHNpKnhvW2pdO1xuICB9XG59XG5udW1lcmljLmlmZnRwb3cyID0gZnVuY3Rpb24gaWZmdHBvdzIoeCx5KSB7XG4gIG51bWVyaWMuX2lmZnRwb3cyKHgseSk7XG4gIG51bWVyaWMuZGl2ZXEoeCx4Lmxlbmd0aCk7XG4gIG51bWVyaWMuZGl2ZXEoeSx5Lmxlbmd0aCk7XG59XG5udW1lcmljLmNvbnZwb3cyID0gZnVuY3Rpb24gY29udnBvdzIoYXgsYXksYngsYnkpIHtcbiAgbnVtZXJpYy5mZnRwb3cyKGF4LGF5KTtcbiAgbnVtZXJpYy5mZnRwb3cyKGJ4LGJ5KTtcbiAgdmFyIGksbiA9IGF4Lmxlbmd0aCxheGksYnhpLGF5aSxieWk7XG4gIGZvcihpPW4tMTtpIT09LTE7LS1pKSB7XG4gICAgYXhpID0gYXhbaV07IGF5aSA9IGF5W2ldOyBieGkgPSBieFtpXTsgYnlpID0gYnlbaV07XG4gICAgYXhbaV0gPSBheGkqYnhpLWF5aSpieWk7XG4gICAgYXlbaV0gPSBheGkqYnlpK2F5aSpieGk7XG4gIH1cbiAgbnVtZXJpYy5pZmZ0cG93MihheCxheSk7XG59XG5udW1lcmljLlQucHJvdG90eXBlLmZmdCA9IGZ1bmN0aW9uIGZmdCgpIHtcbiAgdmFyIHggPSB0aGlzLngsIHkgPSB0aGlzLnk7XG4gIHZhciBuID0geC5sZW5ndGgsIGxvZyA9IE1hdGgubG9nLCBsb2cyID0gbG9nKDIpLFxuICAgIHAgPSBNYXRoLmNlaWwobG9nKDIqbi0xKS9sb2cyKSwgbSA9IE1hdGgucG93KDIscCk7XG4gIHZhciBjeCA9IG51bWVyaWMucmVwKFttXSwwKSwgY3kgPSBudW1lcmljLnJlcChbbV0sMCksIGNvcyA9IE1hdGguY29zLCBzaW4gPSBNYXRoLnNpbjtcbiAgdmFyIGssIGMgPSAoLTMuMTQxNTkyNjUzNTg5NzkzMjM4NDYyNjQzMzgzMjc5NTAyODg0MTk3MTY5Mzk5Mzc1MTA1ODIwL24pLHQ7XG4gIHZhciBhID0gbnVtZXJpYy5yZXAoW21dLDApLCBiID0gbnVtZXJpYy5yZXAoW21dLDApLG5oYWxmID0gTWF0aC5mbG9vcihuLzIpO1xuICBmb3Ioaz0wO2s8bjtrKyspIGFba10gPSB4W2tdO1xuICBpZih0eXBlb2YgeSAhPT0gXCJ1bmRlZmluZWRcIikgZm9yKGs9MDtrPG47aysrKSBiW2tdID0geVtrXTtcbiAgY3hbMF0gPSAxO1xuICBmb3Ioaz0xO2s8PW0vMjtrKyspIHtcbiAgICB0ID0gYyprKms7XG4gICAgY3hba10gPSBjb3ModCk7XG4gICAgY3lba10gPSBzaW4odCk7XG4gICAgY3hbbS1rXSA9IGNvcyh0KTtcbiAgICBjeVttLWtdID0gc2luKHQpXG4gIH1cbiAgdmFyIFggPSBuZXcgbnVtZXJpYy5UKGEsYiksIFkgPSBuZXcgbnVtZXJpYy5UKGN4LGN5KTtcbiAgWCA9IFgubXVsKFkpO1xuICBudW1lcmljLmNvbnZwb3cyKFgueCxYLnksbnVtZXJpYy5jbG9uZShZLngpLG51bWVyaWMubmVnKFkueSkpO1xuICBYID0gWC5tdWwoWSk7XG4gIFgueC5sZW5ndGggPSBuO1xuICBYLnkubGVuZ3RoID0gbjtcbiAgcmV0dXJuIFg7XG59XG5udW1lcmljLlQucHJvdG90eXBlLmlmZnQgPSBmdW5jdGlvbiBpZmZ0KCkge1xuICB2YXIgeCA9IHRoaXMueCwgeSA9IHRoaXMueTtcbiAgdmFyIG4gPSB4Lmxlbmd0aCwgbG9nID0gTWF0aC5sb2csIGxvZzIgPSBsb2coMiksXG4gICAgcCA9IE1hdGguY2VpbChsb2coMipuLTEpL2xvZzIpLCBtID0gTWF0aC5wb3coMixwKTtcbiAgdmFyIGN4ID0gbnVtZXJpYy5yZXAoW21dLDApLCBjeSA9IG51bWVyaWMucmVwKFttXSwwKSwgY29zID0gTWF0aC5jb3MsIHNpbiA9IE1hdGguc2luO1xuICB2YXIgaywgYyA9ICgzLjE0MTU5MjY1MzU4OTc5MzIzODQ2MjY0MzM4MzI3OTUwMjg4NDE5NzE2OTM5OTM3NTEwNTgyMC9uKSx0O1xuICB2YXIgYSA9IG51bWVyaWMucmVwKFttXSwwKSwgYiA9IG51bWVyaWMucmVwKFttXSwwKSxuaGFsZiA9IE1hdGguZmxvb3Iobi8yKTtcbiAgZm9yKGs9MDtrPG47aysrKSBhW2tdID0geFtrXTtcbiAgaWYodHlwZW9mIHkgIT09IFwidW5kZWZpbmVkXCIpIGZvcihrPTA7azxuO2srKykgYltrXSA9IHlba107XG4gIGN4WzBdID0gMTtcbiAgZm9yKGs9MTtrPD1tLzI7aysrKSB7XG4gICAgdCA9IGMqayprO1xuICAgIGN4W2tdID0gY29zKHQpO1xuICAgIGN5W2tdID0gc2luKHQpO1xuICAgIGN4W20ta10gPSBjb3ModCk7XG4gICAgY3lbbS1rXSA9IHNpbih0KVxuICB9XG4gIHZhciBYID0gbmV3IG51bWVyaWMuVChhLGIpLCBZID0gbmV3IG51bWVyaWMuVChjeCxjeSk7XG4gIFggPSBYLm11bChZKTtcbiAgbnVtZXJpYy5jb252cG93MihYLngsWC55LG51bWVyaWMuY2xvbmUoWS54KSxudW1lcmljLm5lZyhZLnkpKTtcbiAgWCA9IFgubXVsKFkpO1xuICBYLngubGVuZ3RoID0gbjtcbiAgWC55Lmxlbmd0aCA9IG47XG4gIHJldHVybiBYLmRpdihuKTtcbn1cblxuLy85LiBVbmNvbnN0cmFpbmVkIG9wdGltaXphdGlvblxubnVtZXJpYy5ncmFkaWVudCA9IGZ1bmN0aW9uIGdyYWRpZW50KGYseCkge1xuICB2YXIgbiA9IHgubGVuZ3RoO1xuICB2YXIgZjAgPSBmKHgpO1xuICBpZihpc05hTihmMCkpIHRocm93IG5ldyBFcnJvcignZ3JhZGllbnQ6IGYoeCkgaXMgYSBOYU4hJyk7XG4gIHZhciBtYXggPSBNYXRoLm1heDtcbiAgdmFyIGkseDAgPSBudW1lcmljLmNsb25lKHgpLGYxLGYyLCBKID0gQXJyYXkobik7XG4gIHZhciBkaXYgPSBudW1lcmljLmRpdiwgc3ViID0gbnVtZXJpYy5zdWIsZXJyZXN0LHJvdW5kb2ZmLG1heCA9IE1hdGgubWF4LGVwcyA9IDFlLTMsYWJzID0gTWF0aC5hYnMsIG1pbiA9IE1hdGgubWluO1xuICB2YXIgdDAsdDEsdDIsaXQ9MCxkMSxkMixOO1xuICBmb3IoaT0wO2k8bjtpKyspIHtcbiAgICB2YXIgaCA9IG1heCgxZS02KmYwLDFlLTgpO1xuICAgIHdoaWxlKDEpIHtcbiAgICAgICsraXQ7XG4gICAgICBpZihpdD4yMCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJOdW1lcmljYWwgZ3JhZGllbnQgZmFpbHNcIik7IH1cbiAgICAgIHgwW2ldID0geFtpXStoO1xuICAgICAgZjEgPSBmKHgwKTtcbiAgICAgIHgwW2ldID0geFtpXS1oO1xuICAgICAgZjIgPSBmKHgwKTtcbiAgICAgIHgwW2ldID0geFtpXTtcbiAgICAgIGlmKGlzTmFOKGYxKSB8fCBpc05hTihmMikpIHsgaC89MTY7IGNvbnRpbnVlOyB9XG4gICAgICBKW2ldID0gKGYxLWYyKS8oMipoKTtcbiAgICAgIHQwID0geFtpXS1oO1xuICAgICAgdDEgPSB4W2ldO1xuICAgICAgdDIgPSB4W2ldK2g7XG4gICAgICBkMSA9IChmMS1mMCkvaDtcbiAgICAgIGQyID0gKGYwLWYyKS9oO1xuICAgICAgTiA9IG1heChhYnMoSltpXSksYWJzKGYwKSxhYnMoZjEpLGFicyhmMiksYWJzKHQwKSxhYnModDEpLGFicyh0MiksMWUtOCk7XG4gICAgICBlcnJlc3QgPSBtaW4obWF4KGFicyhkMS1KW2ldKSxhYnMoZDItSltpXSksYWJzKGQxLWQyKSkvTixoL04pO1xuICAgICAgaWYoZXJyZXN0PmVwcykgeyBoLz0xNjsgfVxuICAgICAgZWxzZSBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIEo7XG59XG5cbm51bWVyaWMudW5jbWluID0gZnVuY3Rpb24gdW5jbWluKGYseDAsdG9sLGdyYWRpZW50LG1heGl0LGNhbGxiYWNrLG9wdGlvbnMpIHtcbiAgdmFyIGdyYWQgPSBudW1lcmljLmdyYWRpZW50O1xuICBpZih0eXBlb2Ygb3B0aW9ucyA9PT0gXCJ1bmRlZmluZWRcIikgeyBvcHRpb25zID0ge307IH1cbiAgaWYodHlwZW9mIHRvbCA9PT0gXCJ1bmRlZmluZWRcIikgeyB0b2wgPSAxZS04OyB9XG4gIGlmKHR5cGVvZiBncmFkaWVudCA9PT0gXCJ1bmRlZmluZWRcIikgeyBncmFkaWVudCA9IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIGdyYWQoZix4KTsgfTsgfVxuICBpZih0eXBlb2YgbWF4aXQgPT09IFwidW5kZWZpbmVkXCIpIG1heGl0ID0gMTAwMDtcbiAgeDAgPSBudW1lcmljLmNsb25lKHgwKTtcbiAgdmFyIG4gPSB4MC5sZW5ndGg7XG4gIHZhciBmMCA9IGYoeDApLGYxLGRmMDtcbiAgaWYoaXNOYU4oZjApKSB0aHJvdyBuZXcgRXJyb3IoJ3VuY21pbjogZih4MCkgaXMgYSBOYU4hJyk7XG4gIHZhciBtYXggPSBNYXRoLm1heCwgbm9ybTIgPSBudW1lcmljLm5vcm0yO1xuICB0b2wgPSBtYXgodG9sLG51bWVyaWMuZXBzaWxvbik7XG4gIHZhciBzdGVwLGcwLGcxLEgxID0gb3B0aW9ucy5IaW52IHx8IG51bWVyaWMuaWRlbnRpdHkobik7XG4gIHZhciBkb3QgPSBudW1lcmljLmRvdCwgaW52ID0gbnVtZXJpYy5pbnYsIHN1YiA9IG51bWVyaWMuc3ViLCBhZGQgPSBudW1lcmljLmFkZCwgdGVuID0gbnVtZXJpYy50ZW5zb3IsIGRpdiA9IG51bWVyaWMuZGl2LCBtdWwgPSBudW1lcmljLm11bDtcbiAgdmFyIGFsbCA9IG51bWVyaWMuYWxsLCBpc2Zpbml0ZSA9IG51bWVyaWMuaXNGaW5pdGUsIG5lZyA9IG51bWVyaWMubmVnO1xuICB2YXIgaXQ9MCxpLHMseDEseSxIeSxIcyx5cyxpMCx0LG5zdGVwLHQxLHQyO1xuICB2YXIgbXNnID0gXCJcIjtcbiAgZzAgPSBncmFkaWVudCh4MCk7XG4gIHdoaWxlKGl0PG1heGl0KSB7XG4gICAgaWYodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHsgaWYoY2FsbGJhY2soaXQseDAsZjAsZzAsSDEpKSB7IG1zZyA9IFwiQ2FsbGJhY2sgcmV0dXJuZWQgdHJ1ZVwiOyBicmVhazsgfSB9XG4gICAgaWYoIWFsbChpc2Zpbml0ZShnMCkpKSB7IG1zZyA9IFwiR3JhZGllbnQgaGFzIEluZmluaXR5IG9yIE5hTlwiOyBicmVhazsgfVxuICAgIHN0ZXAgPSBuZWcoZG90KEgxLGcwKSk7XG4gICAgaWYoIWFsbChpc2Zpbml0ZShzdGVwKSkpIHsgbXNnID0gXCJTZWFyY2ggZGlyZWN0aW9uIGhhcyBJbmZpbml0eSBvciBOYU5cIjsgYnJlYWs7IH1cbiAgICBuc3RlcCA9IG5vcm0yKHN0ZXApO1xuICAgIGlmKG5zdGVwIDwgdG9sKSB7IG1zZz1cIk5ld3RvbiBzdGVwIHNtYWxsZXIgdGhhbiB0b2xcIjsgYnJlYWs7IH1cbiAgICB0ID0gMTtcbiAgICBkZjAgPSBkb3QoZzAsc3RlcCk7XG4gICAgLy8gbGluZSBzZWFyY2hcbiAgICB4MSA9IHgwO1xuICAgIHdoaWxlKGl0IDwgbWF4aXQpIHtcbiAgICAgIGlmKHQqbnN0ZXAgPCB0b2wpIHsgYnJlYWs7IH1cbiAgICAgIHMgPSBtdWwoc3RlcCx0KTtcbiAgICAgIHgxID0gYWRkKHgwLHMpO1xuICAgICAgZjEgPSBmKHgxKTtcbiAgICAgIGlmKGYxLWYwID49IDAuMSp0KmRmMCB8fCBpc05hTihmMSkpIHtcbiAgICAgICAgdCAqPSAwLjU7XG4gICAgICAgICsraXQ7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmKHQqbnN0ZXAgPCB0b2wpIHsgbXNnID0gXCJMaW5lIHNlYXJjaCBzdGVwIHNpemUgc21hbGxlciB0aGFuIHRvbFwiOyBicmVhazsgfVxuICAgIGlmKGl0ID09PSBtYXhpdCkgeyBtc2cgPSBcIm1heGl0IHJlYWNoZWQgZHVyaW5nIGxpbmUgc2VhcmNoXCI7IGJyZWFrOyB9XG4gICAgZzEgPSBncmFkaWVudCh4MSk7XG4gICAgeSA9IHN1YihnMSxnMCk7XG4gICAgeXMgPSBkb3QoeSxzKTtcbiAgICBIeSA9IGRvdChIMSx5KTtcbiAgICBIMSA9IHN1YihhZGQoSDEsXG4gICAgICBtdWwoXG4gICAgICAgICh5cytkb3QoeSxIeSkpLyh5cyp5cyksXG4gICAgICAgIHRlbihzLHMpICAgICkpLFxuICAgICAgZGl2KGFkZCh0ZW4oSHkscyksdGVuKHMsSHkpKSx5cykpO1xuICAgIHgwID0geDE7XG4gICAgZjAgPSBmMTtcbiAgICBnMCA9IGcxO1xuICAgICsraXQ7XG4gIH1cbiAgcmV0dXJuIHtzb2x1dGlvbjogeDAsIGY6IGYwLCBncmFkaWVudDogZzAsIGludkhlc3NpYW46IEgxLCBpdGVyYXRpb25zOml0LCBtZXNzYWdlOiBtc2d9O1xufVxuXG4vLyAxMC4gT2RlIHNvbHZlciAoRG9ybWFuZC1QcmluY2UpXG5udW1lcmljLkRvcHJpID0gZnVuY3Rpb24gRG9wcmkoeCx5LGYseW1pZCxpdGVyYXRpb25zLG1zZyxldmVudHMpIHtcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbiAgdGhpcy5mID0gZjtcbiAgdGhpcy55bWlkID0geW1pZDtcbiAgdGhpcy5pdGVyYXRpb25zID0gaXRlcmF0aW9ucztcbiAgdGhpcy5ldmVudHMgPSBldmVudHM7XG4gIHRoaXMubWVzc2FnZSA9IG1zZztcbn1cbm51bWVyaWMuRG9wcmkucHJvdG90eXBlLl9hdCA9IGZ1bmN0aW9uIF9hdCh4aSxqKSB7XG4gIGZ1bmN0aW9uIHNxcih4KSB7IHJldHVybiB4Kng7IH1cbiAgdmFyIHNvbCA9IHRoaXM7XG4gIHZhciB4cyA9IHNvbC54O1xuICB2YXIgeXMgPSBzb2wueTtcbiAgdmFyIGsxID0gc29sLmY7XG4gIHZhciB5bWlkID0gc29sLnltaWQ7XG4gIHZhciBuID0geHMubGVuZ3RoO1xuICB2YXIgeDAseDEseGgseTAseTEseWgseGk7XG4gIHZhciBmbG9vciA9IE1hdGguZmxvb3IsaDtcbiAgdmFyIGMgPSAwLjU7XG4gIHZhciBhZGQgPSBudW1lcmljLmFkZCwgbXVsID0gbnVtZXJpYy5tdWwsc3ViID0gbnVtZXJpYy5zdWIsIHAscSx3O1xuICB4MCA9IHhzW2pdO1xuICB4MSA9IHhzW2orMV07XG4gIHkwID0geXNbal07XG4gIHkxID0geXNbaisxXTtcbiAgaCAgPSB4MS14MDtcbiAgeGggPSB4MCtjKmg7XG4gIHloID0geW1pZFtqXTtcbiAgcCA9IHN1YihrMVtqICBdLG11bCh5MCwxLyh4MC14aCkrMi8oeDAteDEpKSk7XG4gIHEgPSBzdWIoazFbaisxXSxtdWwoeTEsMS8oeDEteGgpKzIvKHgxLXgwKSkpO1xuICB3ID0gW3Nxcih4aSAtIHgxKSAqICh4aSAtIHhoKSAvIHNxcih4MCAtIHgxKSAvICh4MCAtIHhoKSxcbiAgICBzcXIoeGkgLSB4MCkgKiBzcXIoeGkgLSB4MSkgLyBzcXIoeDAgLSB4aCkgLyBzcXIoeDEgLSB4aCksXG4gICAgc3FyKHhpIC0geDApICogKHhpIC0geGgpIC8gc3FyKHgxIC0geDApIC8gKHgxIC0geGgpLFxuICAgICh4aSAtIHgwKSAqIHNxcih4aSAtIHgxKSAqICh4aSAtIHhoKSAvIHNxcih4MC14MSkgLyAoeDAgLSB4aCksXG4gICAgKHhpIC0geDEpICogc3FyKHhpIC0geDApICogKHhpIC0geGgpIC8gc3FyKHgwLXgxKSAvICh4MSAtIHhoKV07XG4gIHJldHVybiBhZGQoYWRkKGFkZChhZGQobXVsKHkwLHdbMF0pLFxuICAgIG11bCh5aCx3WzFdKSksXG4gICAgbXVsKHkxLHdbMl0pKSxcbiAgICBtdWwoIHAsd1szXSkpLFxuICAgIG11bCggcSx3WzRdKSk7XG59XG5udW1lcmljLkRvcHJpLnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uIGF0KHgpIHtcbiAgdmFyIGksaixrLGZsb29yID0gTWF0aC5mbG9vcjtcbiAgaWYodHlwZW9mIHggIT09IFwibnVtYmVyXCIpIHtcbiAgICB2YXIgbiA9IHgubGVuZ3RoLCByZXQgPSBBcnJheShuKTtcbiAgICBmb3IoaT1uLTE7aSE9PS0xOy0taSkge1xuICAgICAgcmV0W2ldID0gdGhpcy5hdCh4W2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICB2YXIgeDAgPSB0aGlzLng7XG4gIGkgPSAwOyBqID0geDAubGVuZ3RoLTE7XG4gIHdoaWxlKGotaT4xKSB7XG4gICAgayA9IGZsb29yKDAuNSooaStqKSk7XG4gICAgaWYoeDBba10gPD0geCkgaSA9IGs7XG4gICAgZWxzZSBqID0gaztcbiAgfVxuICByZXR1cm4gdGhpcy5fYXQoeCxpKTtcbn1cblxubnVtZXJpYy5kb3ByaSA9IGZ1bmN0aW9uIGRvcHJpKHgwLHgxLHkwLGYsdG9sLG1heGl0LGV2ZW50KSB7XG4gIGlmKHR5cGVvZiB0b2wgPT09IFwidW5kZWZpbmVkXCIpIHsgdG9sID0gMWUtNjsgfVxuICBpZih0eXBlb2YgbWF4aXQgPT09IFwidW5kZWZpbmVkXCIpIHsgbWF4aXQgPSAxMDAwOyB9XG4gIHZhciB4cyA9IFt4MF0sIHlzID0gW3kwXSwgazEgPSBbZih4MCx5MCldLCBrMixrMyxrNCxrNSxrNixrNywgeW1pZCA9IFtdO1xuICB2YXIgQTIgPSAxLzU7XG4gIHZhciBBMyA9IFszLzQwLDkvNDBdO1xuICB2YXIgQTQgPSBbNDQvNDUsLTU2LzE1LDMyLzldO1xuICB2YXIgQTUgPSBbMTkzNzIvNjU2MSwtMjUzNjAvMjE4Nyw2NDQ0OC82NTYxLC0yMTIvNzI5XTtcbiAgdmFyIEE2ID0gWzkwMTcvMzE2OCwtMzU1LzMzLDQ2NzMyLzUyNDcsNDkvMTc2LC01MTAzLzE4NjU2XTtcbiAgdmFyIGIgPSBbMzUvMzg0LDAsNTAwLzExMTMsMTI1LzE5MiwtMjE4Ny82Nzg0LDExLzg0XTtcbiAgdmFyIGJtID0gWzAuNSo2MDI1MTkyNzQzLzMwMDg1NTUzMTUyLFxuICAgIDAsXG4gICAgMC41KjUxMjUyMjkyOTI1LzY1NDAwODIxNTk4LFxuICAgIDAuNSotMjY5MTg2ODkyNS80NTEyODMyOTcyOCxcbiAgICAwLjUqMTg3OTQwMzcyMDY3LzE1OTQ1MzQzMTcwNTYsXG4gICAgMC41Ki0xNzc2MDk0MzMxLzE5NzQzNjQ0MjU2LFxuICAgIDAuNSoxMTIzNzA5OS8yMzUwNDMzODRdO1xuICB2YXIgYyA9IFsxLzUsMy8xMCw0LzUsOC85LDEsMV07XG4gIHZhciBlID0gWy03MS81NzYwMCwwLDcxLzE2Njk1LC03MS8xOTIwLDE3MjUzLzMzOTIwMCwtMjIvNTI1LDEvNDBdO1xuICB2YXIgaSA9IDAsZXIsajtcbiAgdmFyIGggPSAoeDEteDApLzEwO1xuICB2YXIgaXQgPSAwO1xuICB2YXIgYWRkID0gbnVtZXJpYy5hZGQsIG11bCA9IG51bWVyaWMubXVsLCB5MSxlcmluZjtcbiAgdmFyIG1heCA9IE1hdGgubWF4LCBtaW4gPSBNYXRoLm1pbiwgYWJzID0gTWF0aC5hYnMsIG5vcm1pbmYgPSBudW1lcmljLm5vcm1pbmYscG93ID0gTWF0aC5wb3c7XG4gIHZhciBhbnkgPSBudW1lcmljLmFueSwgbHQgPSBudW1lcmljLmx0LCBhbmQgPSBudW1lcmljLmFuZCwgc3ViID0gbnVtZXJpYy5zdWI7XG4gIHZhciBlMCwgZTEsIGV2O1xuICB2YXIgcmV0ID0gbmV3IG51bWVyaWMuRG9wcmkoeHMseXMsazEseW1pZCwtMSxcIlwiKTtcbiAgaWYodHlwZW9mIGV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIGUwID0gZXZlbnQoeDAseTApO1xuICB3aGlsZSh4MDx4MSAmJiBpdDxtYXhpdCkge1xuICAgICsraXQ7XG4gICAgaWYoeDAraD54MSkgaCA9IHgxLXgwO1xuICAgIGsyID0gZih4MCtjWzBdKmgsICAgICAgICAgICAgICAgIGFkZCh5MCxtdWwoICAgQTIqaCxrMVtpXSkpKTtcbiAgICBrMyA9IGYoeDArY1sxXSpoLCAgICAgICAgICAgIGFkZChhZGQoeTAsbXVsKEEzWzBdKmgsazFbaV0pKSxtdWwoQTNbMV0qaCxrMikpKTtcbiAgICBrNCA9IGYoeDArY1syXSpoLCAgICAgICAgYWRkKGFkZChhZGQoeTAsbXVsKEE0WzBdKmgsazFbaV0pKSxtdWwoQTRbMV0qaCxrMikpLG11bChBNFsyXSpoLGszKSkpO1xuICAgIGs1ID0gZih4MCtjWzNdKmgsICAgIGFkZChhZGQoYWRkKGFkZCh5MCxtdWwoQTVbMF0qaCxrMVtpXSkpLG11bChBNVsxXSpoLGsyKSksbXVsKEE1WzJdKmgsazMpKSxtdWwoQTVbM10qaCxrNCkpKTtcbiAgICBrNiA9IGYoeDArY1s0XSpoLGFkZChhZGQoYWRkKGFkZChhZGQoeTAsbXVsKEE2WzBdKmgsazFbaV0pKSxtdWwoQTZbMV0qaCxrMikpLG11bChBNlsyXSpoLGszKSksbXVsKEE2WzNdKmgsazQpKSxtdWwoQTZbNF0qaCxrNSkpKTtcbiAgICB5MSA9IGFkZChhZGQoYWRkKGFkZChhZGQoeTAsbXVsKGsxW2ldLGgqYlswXSkpLG11bChrMyxoKmJbMl0pKSxtdWwoazQsaCpiWzNdKSksbXVsKGs1LGgqYls0XSkpLG11bChrNixoKmJbNV0pKTtcbiAgICBrNyA9IGYoeDAraCx5MSk7XG4gICAgZXIgPSBhZGQoYWRkKGFkZChhZGQoYWRkKG11bChrMVtpXSxoKmVbMF0pLG11bChrMyxoKmVbMl0pKSxtdWwoazQsaCplWzNdKSksbXVsKGs1LGgqZVs0XSkpLG11bChrNixoKmVbNV0pKSxtdWwoazcsaCplWzZdKSk7XG4gICAgaWYodHlwZW9mIGVyID09PSBcIm51bWJlclwiKSBlcmluZiA9IGFicyhlcik7XG4gICAgZWxzZSBlcmluZiA9IG5vcm1pbmYoZXIpO1xuICAgIGlmKGVyaW5mID4gdG9sKSB7IC8vIHJlamVjdFxuICAgICAgaCA9IDAuMipoKnBvdyh0b2wvZXJpbmYsMC4yNSk7XG4gICAgICBpZih4MCtoID09PSB4MCkge1xuICAgICAgICByZXQubXNnID0gXCJTdGVwIHNpemUgYmVjYW1lIHRvbyBzbWFsbFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICB5bWlkW2ldID0gYWRkKGFkZChhZGQoYWRkKGFkZChhZGQoeTAsXG4gICAgICBtdWwoazFbaV0saCpibVswXSkpLFxuICAgICAgbXVsKGszICAgLGgqYm1bMl0pKSxcbiAgICAgIG11bChrNCAgICxoKmJtWzNdKSksXG4gICAgICBtdWwoazUgICAsaCpibVs0XSkpLFxuICAgICAgbXVsKGs2ICAgLGgqYm1bNV0pKSxcbiAgICAgIG11bChrNyAgICxoKmJtWzZdKSk7XG4gICAgKytpO1xuICAgIHhzW2ldID0geDAraDtcbiAgICB5c1tpXSA9IHkxO1xuICAgIGsxW2ldID0gazc7XG4gICAgaWYodHlwZW9mIGV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHZhciB5aSx4bCA9IHgwLHhyID0geDArMC41KmgseGk7XG4gICAgICBlMSA9IGV2ZW50KHhyLHltaWRbaS0xXSk7XG4gICAgICBldiA9IGFuZChsdChlMCwwKSxsdCgwLGUxKSk7XG4gICAgICBpZighYW55KGV2KSkgeyB4bCA9IHhyOyB4ciA9IHgwK2g7IGUwID0gZTE7IGUxID0gZXZlbnQoeHIseTEpOyBldiA9IGFuZChsdChlMCwwKSxsdCgwLGUxKSk7IH1cbiAgICAgIGlmKGFueShldikpIHtcbiAgICAgICAgdmFyIHhjLCB5YywgZW4sZWk7XG4gICAgICAgIHZhciBzaWRlPTAsIHNsID0gMS4wLCBzciA9IDEuMDtcbiAgICAgICAgd2hpbGUoMSkge1xuICAgICAgICAgIGlmKHR5cGVvZiBlMCA9PT0gXCJudW1iZXJcIikgeGkgPSAoc3IqZTEqeGwtc2wqZTAqeHIpLyhzciplMS1zbCplMCk7XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB4aSA9IHhyO1xuICAgICAgICAgICAgZm9yKGo9ZTAubGVuZ3RoLTE7aiE9PS0xOy0taikge1xuICAgICAgICAgICAgICBpZihlMFtqXTwwICYmIGUxW2pdPjApIHhpID0gbWluKHhpLChzciplMVtqXSp4bC1zbCplMFtqXSp4cikvKHNyKmUxW2pdLXNsKmUwW2pdKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKHhpIDw9IHhsIHx8IHhpID49IHhyKSBicmVhaztcbiAgICAgICAgICB5aSA9IHJldC5fYXQoeGksIGktMSk7XG4gICAgICAgICAgZWkgPSBldmVudCh4aSx5aSk7XG4gICAgICAgICAgZW4gPSBhbmQobHQoZTAsMCksbHQoMCxlaSkpO1xuICAgICAgICAgIGlmKGFueShlbikpIHtcbiAgICAgICAgICAgIHhyID0geGk7XG4gICAgICAgICAgICBlMSA9IGVpO1xuICAgICAgICAgICAgZXYgPSBlbjtcbiAgICAgICAgICAgIHNyID0gMS4wO1xuICAgICAgICAgICAgaWYoc2lkZSA9PT0gLTEpIHNsICo9IDAuNTtcbiAgICAgICAgICAgIGVsc2Ugc2wgPSAxLjA7XG4gICAgICAgICAgICBzaWRlID0gLTE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHhsID0geGk7XG4gICAgICAgICAgICBlMCA9IGVpO1xuICAgICAgICAgICAgc2wgPSAxLjA7XG4gICAgICAgICAgICBpZihzaWRlID09PSAxKSBzciAqPSAwLjU7XG4gICAgICAgICAgICBlbHNlIHNyID0gMS4wO1xuICAgICAgICAgICAgc2lkZSA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHkxID0gcmV0Ll9hdCgwLjUqKHgwK3hpKSxpLTEpO1xuICAgICAgICByZXQuZltpXSA9IGYoeGkseWkpO1xuICAgICAgICByZXQueFtpXSA9IHhpO1xuICAgICAgICByZXQueVtpXSA9IHlpO1xuICAgICAgICByZXQueW1pZFtpLTFdID0geTE7XG4gICAgICAgIHJldC5ldmVudHMgPSBldjtcbiAgICAgICAgcmV0Lml0ZXJhdGlvbnMgPSBpdDtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH1cbiAgICB9XG4gICAgeDAgKz0gaDtcbiAgICB5MCA9IHkxO1xuICAgIGUwID0gZTE7XG4gICAgaCA9IG1pbigwLjgqaCpwb3codG9sL2VyaW5mLDAuMjUpLDQqaCk7XG4gIH1cbiAgcmV0Lml0ZXJhdGlvbnMgPSBpdDtcbiAgcmV0dXJuIHJldDtcbn1cblxuLy8gMTEuIEF4ID0gYlxubnVtZXJpYy5MVSA9IGZ1bmN0aW9uKEEsIGZhc3QpIHtcbiAgZmFzdCA9IGZhc3QgfHwgZmFsc2U7XG5cbiAgdmFyIGFicyA9IE1hdGguYWJzO1xuICB2YXIgaSwgaiwgaywgYWJzQWprLCBBa2ssIEFrLCBQaywgQWk7XG4gIHZhciBtYXg7XG4gIHZhciBuID0gQS5sZW5ndGgsIG4xID0gbi0xO1xuICB2YXIgUCA9IG5ldyBBcnJheShuKTtcbiAgaWYoIWZhc3QpIEEgPSBudW1lcmljLmNsb25lKEEpO1xuXG4gIGZvciAoayA9IDA7IGsgPCBuOyArK2spIHtcbiAgICBQayA9IGs7XG4gICAgQWsgPSBBW2tdO1xuICAgIG1heCA9IGFicyhBa1trXSk7XG4gICAgZm9yIChqID0gayArIDE7IGogPCBuOyArK2opIHtcbiAgICAgIGFic0FqayA9IGFicyhBW2pdW2tdKTtcbiAgICAgIGlmIChtYXggPCBhYnNBamspIHtcbiAgICAgICAgbWF4ID0gYWJzQWprO1xuICAgICAgICBQayA9IGo7XG4gICAgICB9XG4gICAgfVxuICAgIFBba10gPSBQaztcblxuICAgIGlmIChQayAhPSBrKSB7XG4gICAgICBBW2tdID0gQVtQa107XG4gICAgICBBW1BrXSA9IEFrO1xuICAgICAgQWsgPSBBW2tdO1xuICAgIH1cblxuICAgIEFrayA9IEFrW2tdO1xuXG4gICAgZm9yIChpID0gayArIDE7IGkgPCBuOyArK2kpIHtcbiAgICAgIEFbaV1ba10gLz0gQWtrO1xuICAgIH1cblxuICAgIGZvciAoaSA9IGsgKyAxOyBpIDwgbjsgKytpKSB7XG4gICAgICBBaSA9IEFbaV07XG4gICAgICBmb3IgKGogPSBrICsgMTsgaiA8IG4xOyArK2opIHtcbiAgICAgICAgQWlbal0gLT0gQWlba10gKiBBa1tqXTtcbiAgICAgICAgKytqO1xuICAgICAgICBBaVtqXSAtPSBBaVtrXSAqIEFrW2pdO1xuICAgICAgfVxuICAgICAgaWYoaj09PW4xKSBBaVtqXSAtPSBBaVtrXSAqIEFrW2pdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgTFU6IEEsXG4gICAgUDogIFBcbiAgfTtcbn1cblxubnVtZXJpYy5MVXNvbHZlID0gZnVuY3Rpb24gTFVzb2x2ZShMVVAsIGIpIHtcbiAgdmFyIGksIGo7XG4gIHZhciBMVSA9IExVUC5MVTtcbiAgdmFyIG4gICA9IExVLmxlbmd0aDtcbiAgdmFyIHggPSBudW1lcmljLmNsb25lKGIpO1xuICB2YXIgUCAgID0gTFVQLlA7XG4gIHZhciBQaSwgTFVpLCBMVWlpLCB0bXA7XG5cbiAgZm9yIChpPW4tMTtpIT09LTE7LS1pKSB4W2ldID0gYltpXTtcbiAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgIFBpID0gUFtpXTtcbiAgICBpZiAoUFtpXSAhPT0gaSkge1xuICAgICAgdG1wID0geFtpXTtcbiAgICAgIHhbaV0gPSB4W1BpXTtcbiAgICAgIHhbUGldID0gdG1wO1xuICAgIH1cblxuICAgIExVaSA9IExVW2ldO1xuICAgIGZvciAoaiA9IDA7IGogPCBpOyArK2opIHtcbiAgICAgIHhbaV0gLT0geFtqXSAqIExVaVtqXTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGkgPSBuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICBMVWkgPSBMVVtpXTtcbiAgICBmb3IgKGogPSBpICsgMTsgaiA8IG47ICsraikge1xuICAgICAgeFtpXSAtPSB4W2pdICogTFVpW2pdO1xuICAgIH1cblxuICAgIHhbaV0gLz0gTFVpW2ldO1xuICB9XG5cbiAgcmV0dXJuIHg7XG59XG5cbm51bWVyaWMuc29sdmUgPSBmdW5jdGlvbiBzb2x2ZShBLGIsZmFzdCkgeyByZXR1cm4gbnVtZXJpYy5MVXNvbHZlKG51bWVyaWMuTFUoQSxmYXN0KSwgYik7IH1cblxuLy8gMTIuIExpbmVhciBwcm9ncmFtbWluZ1xubnVtZXJpYy5lY2hlbG9uaXplID0gZnVuY3Rpb24gZWNoZWxvbml6ZShBKSB7XG4gIHZhciBzID0gbnVtZXJpYy5kaW0oQSksIG0gPSBzWzBdLCBuID0gc1sxXTtcbiAgdmFyIEkgPSBudW1lcmljLmlkZW50aXR5KG0pO1xuICB2YXIgUCA9IEFycmF5KG0pO1xuICB2YXIgaSxqLGssbCxBaSxJaSxaLGE7XG4gIHZhciBhYnMgPSBNYXRoLmFicztcbiAgdmFyIGRpdmVxID0gbnVtZXJpYy5kaXZlcTtcbiAgQSA9IG51bWVyaWMuY2xvbmUoQSk7XG4gIGZvcihpPTA7aTxtOysraSkge1xuICAgIGsgPSAwO1xuICAgIEFpID0gQVtpXTtcbiAgICBJaSA9IElbaV07XG4gICAgZm9yKGo9MTtqPG47KytqKSBpZihhYnMoQWlba10pPGFicyhBaVtqXSkpIGs9ajtcbiAgICBQW2ldID0gaztcbiAgICBkaXZlcShJaSxBaVtrXSk7XG4gICAgZGl2ZXEoQWksQWlba10pO1xuICAgIGZvcihqPTA7ajxtOysraikgaWYoaiE9PWkpIHtcbiAgICAgIFogPSBBW2pdOyBhID0gWltrXTtcbiAgICAgIGZvcihsPW4tMTtsIT09LTE7LS1sKSBaW2xdIC09IEFpW2xdKmE7XG4gICAgICBaID0gSVtqXTtcbiAgICAgIGZvcihsPW0tMTtsIT09LTE7LS1sKSBaW2xdIC09IElpW2xdKmE7XG4gICAgfVxuICB9XG4gIHJldHVybiB7STpJLCBBOkEsIFA6UH07XG59XG5cbm51bWVyaWMuX19zb2x2ZUxQID0gZnVuY3Rpb24gX19zb2x2ZUxQKGMsQSxiLHRvbCxtYXhpdCx4LGZsYWcpIHtcbiAgdmFyIHN1bSA9IG51bWVyaWMuc3VtLCBsb2cgPSBudW1lcmljLmxvZywgbXVsID0gbnVtZXJpYy5tdWwsIHN1YiA9IG51bWVyaWMuc3ViLCBkb3QgPSBudW1lcmljLmRvdCwgZGl2ID0gbnVtZXJpYy5kaXYsIGFkZCA9IG51bWVyaWMuYWRkO1xuICB2YXIgbSA9IGMubGVuZ3RoLCBuID0gYi5sZW5ndGgseTtcbiAgdmFyIHVuYm91bmRlZCA9IGZhbHNlLCBjYixpMD0wO1xuICB2YXIgYWxwaGEgPSAxLjA7XG4gIHZhciBmMCxkZjAsQVQgPSBudW1lcmljLnRyYW5zcG9zZShBKSwgc3ZkID0gbnVtZXJpYy5zdmQsdHJhbnNwb3NlID0gbnVtZXJpYy50cmFuc3Bvc2UsbGVxID0gbnVtZXJpYy5sZXEsIHNxcnQgPSBNYXRoLnNxcnQsIGFicyA9IE1hdGguYWJzO1xuICB2YXIgbXVsZXEgPSBudW1lcmljLm11bGVxO1xuICB2YXIgbm9ybSA9IG51bWVyaWMubm9ybWluZiwgYW55ID0gbnVtZXJpYy5hbnksbWluID0gTWF0aC5taW47XG4gIHZhciBhbGwgPSBudW1lcmljLmFsbCwgZ3QgPSBudW1lcmljLmd0O1xuICB2YXIgcCA9IEFycmF5KG0pLCBBMCA9IEFycmF5KG4pLGU9bnVtZXJpYy5yZXAoW25dLDEpLCBIO1xuICB2YXIgc29sdmUgPSBudW1lcmljLnNvbHZlLCB6ID0gc3ViKGIsZG90KEEseCkpLGNvdW50O1xuICB2YXIgZG90Y2MgPSBkb3QoYyxjKTtcbiAgdmFyIGc7XG4gIGZvcihjb3VudD1pMDtjb3VudDxtYXhpdDsrK2NvdW50KSB7XG4gICAgdmFyIGksaixkO1xuICAgIGZvcihpPW4tMTtpIT09LTE7LS1pKSBBMFtpXSA9IGRpdihBW2ldLHpbaV0pO1xuICAgIHZhciBBMSA9IHRyYW5zcG9zZShBMCk7XG4gICAgZm9yKGk9bS0xO2khPT0tMTstLWkpIHBbaV0gPSAoLyp4W2ldKyovc3VtKEExW2ldKSk7XG4gICAgYWxwaGEgPSAwLjI1KmFicyhkb3RjYy9kb3QoYyxwKSk7XG4gICAgdmFyIGExID0gMTAwKnNxcnQoZG90Y2MvZG90KHAscCkpO1xuICAgIGlmKCFpc0Zpbml0ZShhbHBoYSkgfHwgYWxwaGE+YTEpIGFscGhhID0gYTE7XG4gICAgZyA9IGFkZChjLG11bChhbHBoYSxwKSk7XG4gICAgSCA9IGRvdChBMSxBMCk7XG4gICAgZm9yKGk9bS0xO2khPT0tMTstLWkpIEhbaV1baV0gKz0gMTtcbiAgICBkID0gc29sdmUoSCxkaXYoZyxhbHBoYSksdHJ1ZSk7XG4gICAgdmFyIHQwID0gZGl2KHosZG90KEEsZCkpO1xuICAgIHZhciB0ID0gMS4wO1xuICAgIGZvcihpPW4tMTtpIT09LTE7LS1pKSBpZih0MFtpXTwwKSB0ID0gbWluKHQsLTAuOTk5KnQwW2ldKTtcbiAgICB5ID0gc3ViKHgsbXVsKGQsdCkpO1xuICAgIHogPSBzdWIoYixkb3QoQSx5KSk7XG4gICAgaWYoIWFsbChndCh6LDApKSkgcmV0dXJuIHsgc29sdXRpb246IHgsIG1lc3NhZ2U6IFwiXCIsIGl0ZXJhdGlvbnM6IGNvdW50IH07XG4gICAgeCA9IHk7XG4gICAgaWYoYWxwaGE8dG9sKSByZXR1cm4geyBzb2x1dGlvbjogeSwgbWVzc2FnZTogXCJcIiwgaXRlcmF0aW9uczogY291bnQgfTtcbiAgICBpZihmbGFnKSB7XG4gICAgICB2YXIgcyA9IGRvdChjLGcpLCBBZyA9IGRvdChBLGcpO1xuICAgICAgdW5ib3VuZGVkID0gdHJ1ZTtcbiAgICAgIGZvcihpPW4tMTtpIT09LTE7LS1pKSBpZihzKkFnW2ldPDApIHsgdW5ib3VuZGVkID0gZmFsc2U7IGJyZWFrOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKHhbbS0xXT49MCkgdW5ib3VuZGVkID0gZmFsc2U7XG4gICAgICBlbHNlIHVuYm91bmRlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmKHVuYm91bmRlZCkgcmV0dXJuIHsgc29sdXRpb246IHksIG1lc3NhZ2U6IFwiVW5ib3VuZGVkXCIsIGl0ZXJhdGlvbnM6IGNvdW50IH07XG4gIH1cbiAgcmV0dXJuIHsgc29sdXRpb246IHgsIG1lc3NhZ2U6IFwibWF4aW11bSBpdGVyYXRpb24gY291bnQgZXhjZWVkZWRcIiwgaXRlcmF0aW9uczpjb3VudCB9O1xufVxuXG5udW1lcmljLl9zb2x2ZUxQID0gZnVuY3Rpb24gX3NvbHZlTFAoYyxBLGIsdG9sLG1heGl0KSB7XG4gIHZhciBtID0gYy5sZW5ndGgsIG4gPSBiLmxlbmd0aCx5O1xuICB2YXIgc3VtID0gbnVtZXJpYy5zdW0sIGxvZyA9IG51bWVyaWMubG9nLCBtdWwgPSBudW1lcmljLm11bCwgc3ViID0gbnVtZXJpYy5zdWIsIGRvdCA9IG51bWVyaWMuZG90LCBkaXYgPSBudW1lcmljLmRpdiwgYWRkID0gbnVtZXJpYy5hZGQ7XG4gIHZhciBjMCA9IG51bWVyaWMucmVwKFttXSwwKS5jb25jYXQoWzFdKTtcbiAgdmFyIEogPSBudW1lcmljLnJlcChbbiwxXSwtMSk7XG4gIHZhciBBMCA9IG51bWVyaWMuYmxvY2tNYXRyaXgoW1tBICAgICAgICAgICAgICAgICAgICwgICBKICBdXSk7XG4gIHZhciBiMCA9IGI7XG4gIHZhciB5ID0gbnVtZXJpYy5yZXAoW21dLDApLmNvbmNhdChNYXRoLm1heCgwLG51bWVyaWMuc3VwKG51bWVyaWMubmVnKGIpKSkrMSk7XG4gIHZhciB4MCA9IG51bWVyaWMuX19zb2x2ZUxQKGMwLEEwLGIwLHRvbCxtYXhpdCx5LGZhbHNlKTtcbiAgdmFyIHggPSBudW1lcmljLmNsb25lKHgwLnNvbHV0aW9uKTtcbiAgeC5sZW5ndGggPSBtO1xuICB2YXIgZm9vID0gbnVtZXJpYy5pbmYoc3ViKGIsZG90KEEseCkpKTtcbiAgaWYoZm9vPDApIHsgcmV0dXJuIHsgc29sdXRpb246IE5hTiwgbWVzc2FnZTogXCJJbmZlYXNpYmxlXCIsIGl0ZXJhdGlvbnM6IHgwLml0ZXJhdGlvbnMgfTsgfVxuICB2YXIgcmV0ID0gbnVtZXJpYy5fX3NvbHZlTFAoYywgQSwgYiwgdG9sLCBtYXhpdC14MC5pdGVyYXRpb25zLCB4LCB0cnVlKTtcbiAgcmV0Lml0ZXJhdGlvbnMgKz0geDAuaXRlcmF0aW9ucztcbiAgcmV0dXJuIHJldDtcbn07XG5cbm51bWVyaWMuc29sdmVMUCA9IGZ1bmN0aW9uIHNvbHZlTFAoYyxBLGIsQWVxLGJlcSx0b2wsbWF4aXQpIHtcbiAgaWYodHlwZW9mIG1heGl0ID09PSBcInVuZGVmaW5lZFwiKSBtYXhpdCA9IDEwMDA7XG4gIGlmKHR5cGVvZiB0b2wgPT09IFwidW5kZWZpbmVkXCIpIHRvbCA9IG51bWVyaWMuZXBzaWxvbjtcbiAgaWYodHlwZW9mIEFlcSA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIG51bWVyaWMuX3NvbHZlTFAoYyxBLGIsdG9sLG1heGl0KTtcbiAgdmFyIG0gPSBBZXEubGVuZ3RoLCBuID0gQWVxWzBdLmxlbmd0aCwgbyA9IEEubGVuZ3RoO1xuICB2YXIgQiA9IG51bWVyaWMuZWNoZWxvbml6ZShBZXEpO1xuICB2YXIgZmxhZ3MgPSBudW1lcmljLnJlcChbbl0sMCk7XG4gIHZhciBQID0gQi5QO1xuICB2YXIgUSA9IFtdO1xuICB2YXIgaTtcbiAgZm9yKGk9UC5sZW5ndGgtMTtpIT09LTE7LS1pKSBmbGFnc1tQW2ldXSA9IDE7XG4gIGZvcihpPW4tMTtpIT09LTE7LS1pKSBpZihmbGFnc1tpXT09PTApIFEucHVzaChpKTtcbiAgdmFyIGcgPSBudW1lcmljLmdldFJhbmdlO1xuICB2YXIgSSA9IG51bWVyaWMubGluc3BhY2UoMCxtLTEpLCBKID0gbnVtZXJpYy5saW5zcGFjZSgwLG8tMSk7XG4gIHZhciBBZXEyID0gZyhBZXEsSSxRKSwgQTEgPSBnKEEsSixQKSwgQTIgPSBnKEEsSixRKSwgZG90ID0gbnVtZXJpYy5kb3QsIHN1YiA9IG51bWVyaWMuc3ViO1xuICB2YXIgQTMgPSBkb3QoQTEsQi5JKTtcbiAgdmFyIEE0ID0gc3ViKEEyLGRvdChBMyxBZXEyKSksIGI0ID0gc3ViKGIsZG90KEEzLGJlcSkpO1xuICB2YXIgYzEgPSBBcnJheShQLmxlbmd0aCksIGMyID0gQXJyYXkoUS5sZW5ndGgpO1xuICBmb3IoaT1QLmxlbmd0aC0xO2khPT0tMTstLWkpIGMxW2ldID0gY1tQW2ldXTtcbiAgZm9yKGk9US5sZW5ndGgtMTtpIT09LTE7LS1pKSBjMltpXSA9IGNbUVtpXV07XG4gIHZhciBjNCA9IHN1YihjMixkb3QoYzEsZG90KEIuSSxBZXEyKSkpO1xuICB2YXIgUyA9IG51bWVyaWMuX3NvbHZlTFAoYzQsQTQsYjQsdG9sLG1heGl0KTtcbiAgdmFyIHgyID0gUy5zb2x1dGlvbjtcbiAgaWYoeDIhPT14MikgcmV0dXJuIFM7XG4gIHZhciB4MSA9IGRvdChCLkksc3ViKGJlcSxkb3QoQWVxMix4MikpKTtcbiAgdmFyIHggPSBBcnJheShjLmxlbmd0aCk7XG4gIGZvcihpPVAubGVuZ3RoLTE7aSE9PS0xOy0taSkgeFtQW2ldXSA9IHgxW2ldO1xuICBmb3IoaT1RLmxlbmd0aC0xO2khPT0tMTstLWkpIHhbUVtpXV0gPSB4MltpXTtcbiAgcmV0dXJuIHsgc29sdXRpb246IHgsIG1lc3NhZ2U6Uy5tZXNzYWdlLCBpdGVyYXRpb25zOiBTLml0ZXJhdGlvbnMgfTtcbn1cblxubnVtZXJpYy5NUFN0b0xQID0gZnVuY3Rpb24gTVBTdG9MUChNUFMpIHtcbiAgaWYoTVBTIGluc3RhbmNlb2YgU3RyaW5nKSB7IE1QUy5zcGxpdCgnXFxuJyk7IH1cbiAgdmFyIHN0YXRlID0gMDtcbiAgdmFyIHN0YXRlcyA9IFsnSW5pdGlhbCBzdGF0ZScsJ05BTUUnLCdST1dTJywnQ09MVU1OUycsJ1JIUycsJ0JPVU5EUycsJ0VOREFUQSddO1xuICB2YXIgbiA9IE1QUy5sZW5ndGg7XG4gIHZhciBpLGoseixOPTAscm93cyA9IHt9LCBzaWduID0gW10sIHJsID0gMCwgdmFycyA9IHt9LCBudiA9IDA7XG4gIHZhciBuYW1lO1xuICB2YXIgYyA9IFtdLCBBID0gW10sIGIgPSBbXTtcbiAgZnVuY3Rpb24gZXJyKGUpIHsgdGhyb3cgbmV3IEVycm9yKCdNUFN0b0xQOiAnK2UrJ1xcbkxpbmUgJytpKyc6ICcrTVBTW2ldKydcXG5DdXJyZW50IHN0YXRlOiAnK3N0YXRlc1tzdGF0ZV0rJ1xcbicpOyB9XG4gIGZvcihpPTA7aTxuOysraSkge1xuICAgIHogPSBNUFNbaV07XG4gICAgdmFyIHcwID0gei5tYXRjaCgvXFxTKi9nKTtcbiAgICB2YXIgdyA9IFtdO1xuICAgIGZvcihqPTA7ajx3MC5sZW5ndGg7KytqKSBpZih3MFtqXSE9PVwiXCIpIHcucHVzaCh3MFtqXSk7XG4gICAgaWYody5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuICAgIGZvcihqPTA7ajxzdGF0ZXMubGVuZ3RoOysraikgaWYoei5zdWJzdHIoMCxzdGF0ZXNbal0ubGVuZ3RoKSA9PT0gc3RhdGVzW2pdKSBicmVhaztcbiAgICBpZihqPHN0YXRlcy5sZW5ndGgpIHtcbiAgICAgIHN0YXRlID0gajtcbiAgICAgIGlmKGo9PT0xKSB7IG5hbWUgPSB3WzFdOyB9XG4gICAgICBpZihqPT09NikgcmV0dXJuIHsgbmFtZTpuYW1lLCBjOmMsIEE6bnVtZXJpYy50cmFuc3Bvc2UoQSksIGI6Yiwgcm93czpyb3dzLCB2YXJzOnZhcnMgfTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBzd2l0Y2goc3RhdGUpIHtcbiAgICAgIGNhc2UgMDogY2FzZSAxOiBlcnIoJ1VuZXhwZWN0ZWQgbGluZScpO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBzd2l0Y2god1swXSkge1xuICAgICAgICAgIGNhc2UgJ04nOiBpZihOPT09MCkgTiA9IHdbMV07IGVsc2UgZXJyKCdUd28gb3IgbW9yZSBOIHJvd3MnKTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnTCc6IHJvd3Nbd1sxXV0gPSBybDsgc2lnbltybF0gPSAxOyBiW3JsXSA9IDA7ICsrcmw7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0cnOiByb3dzW3dbMV1dID0gcmw7IHNpZ25bcmxdID0gLTE7YltybF0gPSAwOyArK3JsOyBicmVhaztcbiAgICAgICAgICBjYXNlICdFJzogcm93c1t3WzFdXSA9IHJsOyBzaWduW3JsXSA9IDA7YltybF0gPSAwOyArK3JsOyBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OiBlcnIoJ1BhcnNlIGVycm9yICcrbnVtZXJpYy5wcmV0dHlQcmludCh3KSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGlmKCF2YXJzLmhhc093blByb3BlcnR5KHdbMF0pKSB7IHZhcnNbd1swXV0gPSBudjsgY1tudl0gPSAwOyBBW252XSA9IG51bWVyaWMucmVwKFtybF0sMCk7ICsrbnY7IH1cbiAgICAgICAgdmFyIHAgPSB2YXJzW3dbMF1dO1xuICAgICAgICBmb3Ioaj0xO2o8dy5sZW5ndGg7ais9Mikge1xuICAgICAgICAgIGlmKHdbal0gPT09IE4pIHsgY1twXSA9IHBhcnNlRmxvYXQod1tqKzFdKTsgY29udGludWU7IH1cbiAgICAgICAgICB2YXIgcSA9IHJvd3Nbd1tqXV07XG4gICAgICAgICAgQVtwXVtxXSA9IChzaWduW3FdPDA/LTE6MSkqcGFyc2VGbG9hdCh3W2orMV0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICBmb3Ioaj0xO2o8dy5sZW5ndGg7ais9MikgYltyb3dzW3dbal1dXSA9IChzaWduW3Jvd3Nbd1tqXV1dPDA/LTE6MSkqcGFyc2VGbG9hdCh3W2orMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTogLypGSVhNRSovIGJyZWFrO1xuICAgICAgY2FzZSA2OiBlcnIoJ0ludGVybmFsIGVycm9yJyk7XG4gICAgfVxuICB9XG4gIGVycignUmVhY2hlZCBlbmQgb2YgZmlsZSB3aXRob3V0IEVOREFUQScpO1xufVxuLy8gc2VlZHJhbmRvbS5qcyB2ZXJzaW9uIDIuMC5cbi8vIEF1dGhvcjogRGF2aWQgQmF1IDQvMi8yMDExXG4vL1xuLy8gRGVmaW5lcyBhIG1ldGhvZCBNYXRoLnNlZWRyYW5kb20oKSB0aGF0LCB3aGVuIGNhbGxlZCwgc3Vic3RpdHV0ZXNcbi8vIGFuIGV4cGxpY2l0bHkgc2VlZGVkIFJDNC1iYXNlZCBhbGdvcml0aG0gZm9yIE1hdGgucmFuZG9tKCkuICBBbHNvXG4vLyBzdXBwb3J0cyBhdXRvbWF0aWMgc2VlZGluZyBmcm9tIGxvY2FsIG9yIG5ldHdvcmsgc291cmNlcyBvZiBlbnRyb3B5LlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vICAgPHNjcmlwdCBzcmM9aHR0cDovL2RhdmlkYmF1LmNvbS9lbmNvZGUvc2VlZHJhbmRvbS1taW4uanM+PFxcL3NjcmlwdD5cbi8vXG4vLyAgIE1hdGguc2VlZHJhbmRvbSgneWlwZWUnKTsgU2V0cyBNYXRoLnJhbmRvbSB0byBhIGZ1bmN0aW9uIHRoYXQgaXNcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplZCB1c2luZyB0aGUgZ2l2ZW4gZXhwbGljaXQgc2VlZC5cbi8vXG4vLyAgIE1hdGguc2VlZHJhbmRvbSgpOyAgICAgICAgU2V0cyBNYXRoLnJhbmRvbSB0byBhIGZ1bmN0aW9uIHRoYXQgaXNcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWVkZWQgdXNpbmcgdGhlIGN1cnJlbnQgdGltZSwgZG9tIHN0YXRlLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBvdGhlciBhY2N1bXVsYXRlZCBsb2NhbCBlbnRyb3B5LlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgc2VlZCBzdHJpbmcgaXMgcmV0dXJuZWQuXG4vL1xuLy8gICBNYXRoLnNlZWRyYW5kb20oJ3lvd3phJywgdHJ1ZSk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VlZHMgdXNpbmcgdGhlIGdpdmVuIGV4cGxpY2l0IHNlZWQgbWl4ZWRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2dldGhlciB3aXRoIGFjY3VtdWxhdGVkIGVudHJvcHkuXG4vL1xuLy8gICA8c2NyaXB0IHNyYz1cImh0dHA6Ly9iaXQubHkvc3JhbmRvbS01MTJcIj48XFwvc2NyaXB0PlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlZWRzIHVzaW5nIHBoeXNpY2FsIHJhbmRvbSBiaXRzIGRvd25sb2FkZWRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIHJhbmRvbS5vcmcuXG4vL1xuLy8gICA8c2NyaXB0IHNyYz1cImh0dHBzOi8vanNvbmxpYi5hcHBzcG90LmNvbS91cmFuZG9tP2NhbGxiYWNrPU1hdGguc2VlZHJhbmRvbVwiPlxuLy8gICA8XFwvc2NyaXB0PiAgICAgICAgICAgICAgICAgU2VlZHMgdXNpbmcgdXJhbmRvbSBiaXRzIGZyb20gY2FsbC5qc29ubGliLmNvbSxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGljaCBpcyBmYXN0ZXIgdGhhbiByYW5kb20ub3JnLlxuLy9cbi8vIEV4YW1wbGVzOlxuLy9cbi8vICAgTWF0aC5zZWVkcmFuZG9tKFwiaGVsbG9cIik7ICAgICAgICAgICAgLy8gVXNlIFwiaGVsbG9cIiBhcyB0aGUgc2VlZC5cbi8vICAgZG9jdW1lbnQud3JpdGUoTWF0aC5yYW5kb20oKSk7ICAgICAgIC8vIEFsd2F5cyAwLjU0NjM2NjM3NjgxNDA3MzRcbi8vICAgZG9jdW1lbnQud3JpdGUoTWF0aC5yYW5kb20oKSk7ICAgICAgIC8vIEFsd2F5cyAwLjQzOTczNzkzNzcwNTkyMjM0XG4vLyAgIHZhciBybmcxID0gTWF0aC5yYW5kb207ICAgICAgICAgICAgICAvLyBSZW1lbWJlciB0aGUgY3VycmVudCBwcm5nLlxuLy9cbi8vICAgdmFyIGF1dG9zZWVkID0gTWF0aC5zZWVkcmFuZG9tKCk7ICAgIC8vIE5ldyBwcm5nIHdpdGggYW4gYXV0b21hdGljIHNlZWQuXG4vLyAgIGRvY3VtZW50LndyaXRlKE1hdGgucmFuZG9tKCkpOyAgICAgICAvLyBQcmV0dHkgbXVjaCB1bnByZWRpY3RhYmxlLlxuLy9cbi8vICAgTWF0aC5yYW5kb20gPSBybmcxOyAgICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIFwiaGVsbG9cIiBwcm5nIHNlcXVlbmNlLlxuLy8gICBkb2N1bWVudC53cml0ZShNYXRoLnJhbmRvbSgpKTsgICAgICAgLy8gQWx3YXlzIDAuNTU0NzY5NDMyNDczNDU1XG4vL1xuLy8gICBNYXRoLnNlZWRyYW5kb20oYXV0b3NlZWQpOyAgICAgICAgICAgLy8gUmVzdGFydCBhdCB0aGUgcHJldmlvdXMgc2VlZC5cbi8vICAgZG9jdW1lbnQud3JpdGUoTWF0aC5yYW5kb20oKSk7ICAgICAgIC8vIFJlcGVhdCB0aGUgJ3VucHJlZGljdGFibGUnIHZhbHVlLlxuLy9cbi8vIE5vdGVzOlxuLy9cbi8vIEVhY2ggdGltZSBzZWVkcmFuZG9tKCdhcmcnKSBpcyBjYWxsZWQsIGVudHJvcHkgZnJvbSB0aGUgcGFzc2VkIHNlZWRcbi8vIGlzIGFjY3VtdWxhdGVkIGluIGEgcG9vbCB0byBoZWxwIGdlbmVyYXRlIGZ1dHVyZSBzZWVkcyBmb3IgdGhlXG4vLyB6ZXJvLWFyZ3VtZW50IGZvcm0gb2YgTWF0aC5zZWVkcmFuZG9tLCBzbyBlbnRyb3B5IGNhbiBiZSBpbmplY3RlZCBvdmVyXG4vLyB0aW1lIGJ5IGNhbGxpbmcgc2VlZHJhbmRvbSB3aXRoIGV4cGxpY2l0IGRhdGEgcmVwZWF0ZWRseS5cbi8vXG4vLyBPbiBzcGVlZCAtIFRoaXMgamF2YXNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiBNYXRoLnJhbmRvbSgpIGlzIGFib3V0XG4vLyAzLTEweCBzbG93ZXIgdGhhbiB0aGUgYnVpbHQtaW4gTWF0aC5yYW5kb20oKSBiZWNhdXNlIGl0IGlzIG5vdCBuYXRpdmVcbi8vIGNvZGUsIGJ1dCB0aGlzIGlzIHR5cGljYWxseSBmYXN0IGVub3VnaCBhbnl3YXkuICBTZWVkaW5nIGlzIG1vcmUgZXhwZW5zaXZlLFxuLy8gZXNwZWNpYWxseSBpZiB5b3UgdXNlIGF1dG8tc2VlZGluZy4gIFNvbWUgZGV0YWlscyAodGltaW5ncyBvbiBDaHJvbWUgNCk6XG4vL1xuLy8gT3VyIE1hdGgucmFuZG9tKCkgICAgICAgICAgICAtIGF2ZyBsZXNzIHRoYW4gMC4wMDIgbWlsbGlzZWNvbmRzIHBlciBjYWxsXG4vLyBzZWVkcmFuZG9tKCdleHBsaWNpdCcpICAgICAgIC0gYXZnIGxlc3MgdGhhbiAwLjUgbWlsbGlzZWNvbmRzIHBlciBjYWxsXG4vLyBzZWVkcmFuZG9tKCdleHBsaWNpdCcsIHRydWUpIC0gYXZnIGxlc3MgdGhhbiAyIG1pbGxpc2Vjb25kcyBwZXIgY2FsbFxuLy8gc2VlZHJhbmRvbSgpICAgICAgICAgICAgICAgICAtIGF2ZyBhYm91dCAzOCBtaWxsaXNlY29uZHMgcGVyIGNhbGxcbi8vXG4vLyBMSUNFTlNFIChCU0QpOlxuLy9cbi8vIENvcHlyaWdodCAyMDEwIERhdmlkIEJhdSwgYWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vXG4vLyBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbi8vIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuLy8gXG4vLyAgIDEuIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4vLyAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbi8vXG4vLyAgIDIuIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4vLyAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbi8vICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbi8vIFxuLy8gICAzLiBOZWl0aGVyIHRoZSBuYW1lIG9mIHRoaXMgbW9kdWxlIG5vciB0aGUgbmFtZXMgb2YgaXRzIGNvbnRyaWJ1dG9ycyBtYXlcbi8vICAgICAgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbi8vICAgICAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4vLyBcbi8vIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbi8vIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1Rcbi8vIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuLy8gQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbi8vIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuLy8gU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuLy8gTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4vLyBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbi8vIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbi8vIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuLy8gT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbi8vXG4vKipcbiAqIEFsbCBjb2RlIGlzIGluIGFuIGFub255bW91cyBjbG9zdXJlIHRvIGtlZXAgdGhlIGdsb2JhbCBuYW1lc3BhY2UgY2xlYW4uXG4gKlxuICogQHBhcmFtIHtudW1iZXI9fSBvdmVyZmxvd1xuICogQHBhcmFtIHtudW1iZXI9fSBzdGFydGRlbm9tXG4gKi9cblxuLy8gUGF0Y2hlZCBieSBTZWIgc28gdGhhdCBzZWVkcmFuZG9tLmpzIGRvZXMgbm90IHBvbGx1dGUgdGhlIE1hdGggb2JqZWN0LlxuLy8gTXkgdGVzdHMgc3VnZ2VzdCB0aGF0IGRvaW5nIE1hdGgudHJvdWJsZSA9IDEgbWFrZXMgTWF0aCBsb29rdXBzIGFib3V0IDUlXG4vLyBzbG93ZXIuXG5udW1lcmljLnNlZWRyYW5kb20gPSB7IHBvdzpNYXRoLnBvdywgcmFuZG9tOk1hdGgucmFuZG9tIH07XG5cbihmdW5jdGlvbiAocG9vbCwgbWF0aCwgd2lkdGgsIGNodW5rcywgc2lnbmlmaWNhbmNlLCBvdmVyZmxvdywgc3RhcnRkZW5vbSkge1xuXG5cbi8vXG4vLyBzZWVkcmFuZG9tKClcbi8vIFRoaXMgaXMgdGhlIHNlZWRyYW5kb20gZnVuY3Rpb24gZGVzY3JpYmVkIGFib3ZlLlxuLy9cbiAgbWF0aFsnc2VlZHJhbmRvbSddID0gZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCB1c2VfZW50cm9weSkge1xuICAgIHZhciBrZXkgPSBbXTtcbiAgICB2YXIgYXJjNDtcblxuICAgIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxuICAgIHNlZWQgPSBtaXhrZXkoZmxhdHRlbihcbiAgICAgIHVzZV9lbnRyb3B5ID8gW3NlZWQsIHBvb2xdIDpcbiAgICAgIGFyZ3VtZW50cy5sZW5ndGggPyBzZWVkIDpcbiAgICAgIFtuZXcgRGF0ZSgpLmdldFRpbWUoKSwgcG9vbCwgd2luZG93XSwgMyksIGtleSk7XG5cbiAgICAvLyBVc2UgdGhlIHNlZWQgdG8gaW5pdGlhbGl6ZSBhbiBBUkM0IGdlbmVyYXRvci5cbiAgICBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcblxuICAgIC8vIE1peCB0aGUgcmFuZG9tbmVzcyBpbnRvIGFjY3VtdWxhdGVkIGVudHJvcHkuXG4gICAgbWl4a2V5KGFyYzQuUywgcG9vbCk7XG5cbiAgICAvLyBPdmVycmlkZSBNYXRoLnJhbmRvbVxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xuICAgIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXG5cbiAgICBtYXRoWydyYW5kb20nXSA9IGZ1bmN0aW9uIHJhbmRvbSgpIHsgIC8vIENsb3N1cmUgdG8gcmV0dXJuIGEgcmFuZG9tIGRvdWJsZTpcbiAgICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyk7ICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxuICAgICAgdmFyIGQgPSBzdGFydGRlbm9tOyAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cbiAgICAgIHZhciB4ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgYW5kIG5vICdleHRyYSBsYXN0IGJ5dGUnLlxuICAgICAgd2hpbGUgKG4gPCBzaWduaWZpY2FuY2UpIHsgICAgICAgICAgLy8gRmlsbCB1cCBhbGwgc2lnbmlmaWNhbnQgZGlnaXRzIGJ5XG4gICAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcbiAgICAgICAgZCAqPSB3aWR0aDsgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZGVub21pbmF0b3IgYW5kIGdlbmVyYXRpbmcgYVxuICAgICAgICB4ID0gYXJjNC5nKDEpOyAgICAgICAgICAgICAgICAgICAgLy8gICBuZXcgbGVhc3Qtc2lnbmlmaWNhbnQtYnl0ZS5cbiAgICAgIH1cbiAgICAgIHdoaWxlIChuID49IG92ZXJmbG93KSB7ICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHJvdW5kaW5nIHVwLCBiZWZvcmUgYWRkaW5nXG4gICAgICAgIG4gLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxhc3QgYnl0ZSwgc2hpZnQgZXZlcnl0aGluZ1xuICAgICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIG1hdGggdW50aWxcbiAgICAgICAgeCA+Pj49IDE7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgd2UgaGF2ZSBleGFjdGx5IHRoZSBkZXNpcmVkIGJpdHMuXG4gICAgICB9XG4gICAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cbiAgICB9O1xuXG4gICAgLy8gUmV0dXJuIHRoZSBzZWVkIHRoYXQgd2FzIHVzZWRcbiAgICByZXR1cm4gc2VlZDtcbiAgfTtcblxuLy9cbi8vIEFSQzRcbi8vXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cbi8vXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxuLy9cbiAgLyoqIEBjb25zdHJ1Y3RvciAqL1xuICBmdW5jdGlvbiBBUkM0KGtleSkge1xuICAgIHZhciB0LCB1LCBtZSA9IHRoaXMsIGtleWxlbiA9IGtleS5sZW5ndGg7XG4gICAgdmFyIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSBtZS5tID0gMDtcbiAgICBtZS5TID0gW107XG4gICAgbWUuYyA9IFtdO1xuXG4gICAgLy8gVGhlIGVtcHR5IGtleSBbXSBpcyB0cmVhdGVkIGFzIFswXS5cbiAgICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XG5cbiAgICAvLyBTZXQgdXAgUyB1c2luZyB0aGUgc3RhbmRhcmQga2V5IHNjaGVkdWxpbmcgYWxnb3JpdGhtLlxuICAgIHdoaWxlIChpIDwgd2lkdGgpIHsgbWUuU1tpXSA9IGkrKzsgfVxuICAgIGZvciAoaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XG4gICAgICB0ID0gbWUuU1tpXTtcbiAgICAgIGogPSBsb3diaXRzKGogKyB0ICsga2V5W2kgJSBrZXlsZW5dKTtcbiAgICAgIHUgPSBtZS5TW2pdO1xuICAgICAgbWUuU1tpXSA9IHU7XG4gICAgICBtZS5TW2pdID0gdDtcbiAgICB9XG5cbiAgICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXG4gICAgbWUuZyA9IGZ1bmN0aW9uIGdldG5leHQoY291bnQpIHtcbiAgICAgIHZhciBzID0gbWUuUztcbiAgICAgIHZhciBpID0gbG93Yml0cyhtZS5pICsgMSk7IHZhciB0ID0gc1tpXTtcbiAgICAgIHZhciBqID0gbG93Yml0cyhtZS5qICsgdCk7IHZhciB1ID0gc1tqXTtcbiAgICAgIHNbaV0gPSB1O1xuICAgICAgc1tqXSA9IHQ7XG4gICAgICB2YXIgciA9IHNbbG93Yml0cyh0ICsgdSldO1xuICAgICAgd2hpbGUgKC0tY291bnQpIHtcbiAgICAgICAgaSA9IGxvd2JpdHMoaSArIDEpOyB0ID0gc1tpXTtcbiAgICAgICAgaiA9IGxvd2JpdHMoaiArIHQpOyB1ID0gc1tqXTtcbiAgICAgICAgc1tpXSA9IHU7XG4gICAgICAgIHNbal0gPSB0O1xuICAgICAgICByID0gciAqIHdpZHRoICsgc1tsb3diaXRzKHQgKyB1KV07XG4gICAgICB9XG4gICAgICBtZS5pID0gaTtcbiAgICAgIG1lLmogPSBqO1xuICAgICAgcmV0dXJuIHI7XG4gICAgfTtcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHkgZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy5cbiAgICAvLyBTZWUgaHR0cDovL3d3dy5yc2EuY29tL3JzYWxhYnMvbm9kZS5hc3A/aWQ9MjAwOVxuICAgIG1lLmcod2lkdGgpO1xuICB9XG5cbi8vXG4vLyBmbGF0dGVuKClcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cbi8vXG4gIC8qKiBAcGFyYW0ge09iamVjdD19IHJlc3VsdFxuICAgKiBAcGFyYW0ge3N0cmluZz19IHByb3BcbiAgICogQHBhcmFtIHtzdHJpbmc9fSB0eXAgKi9cbiAgZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoLCByZXN1bHQsIHByb3AsIHR5cCkge1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIHR5cCA9IHR5cGVvZihvYmopO1xuICAgIGlmIChkZXB0aCAmJiB0eXAgPT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgICAgaWYgKHByb3AuaW5kZXhPZignUycpIDwgNSkgeyAgICAvLyBBdm9pZCBGRjMgYnVnIChsb2NhbC9zZXNzaW9uU3RvcmFnZSlcbiAgICAgICAgICB0cnkgeyByZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSwgZGVwdGggLSAxKSk7IH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogb2JqICsgKHR5cCAhPSAnc3RyaW5nJyA/ICdcXDAnIDogJycpKTtcbiAgfVxuXG4vL1xuLy8gbWl4a2V5KClcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxuLy9cbiAgLyoqIEBwYXJhbSB7bnVtYmVyPX0gc21lYXJcbiAgICogQHBhcmFtIHtudW1iZXI9fSBqICovXG4gIGZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXksIHNtZWFyLCBqKSB7XG4gICAgc2VlZCArPSAnJzsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRW5zdXJlIHRoZSBzZWVkIGlzIGEgc3RyaW5nXG4gICAgc21lYXIgPSAwO1xuICAgIGZvciAoaiA9IDA7IGogPCBzZWVkLmxlbmd0aDsgaisrKSB7XG4gICAgICBrZXlbbG93Yml0cyhqKV0gPVxuICAgICAgbG93Yml0cygoc21lYXIgXj0ga2V5W2xvd2JpdHMoaildICogMTkpICsgc2VlZC5jaGFyQ29kZUF0KGopKTtcbiAgICB9XG4gICAgc2VlZCA9ICcnO1xuICAgIGZvciAoaiBpbiBrZXkpIHsgc2VlZCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleVtqXSk7IH1cbiAgICByZXR1cm4gc2VlZDtcbiAgfVxuXG4vL1xuLy8gbG93Yml0cygpXG4vLyBBIHF1aWNrIFwibiBtb2Qgd2lkdGhcIiBmb3Igd2lkdGggYSBwb3dlciBvZiAyLlxuLy9cbiAgZnVuY3Rpb24gbG93Yml0cyhuKSB7IHJldHVybiBuICYgKHdpZHRoIC0gMSk7IH1cblxuLy9cbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cbi8vXG4gIHN0YXJ0ZGVub20gPSBtYXRoLnBvdyh3aWR0aCwgY2h1bmtzKTtcbiAgc2lnbmlmaWNhbmNlID0gbWF0aC5wb3coMiwgc2lnbmlmaWNhbmNlKTtcbiAgb3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyO1xuXG4vL1xuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXG4vLyBub3Qgd2FudCB0byBpbnRlZmVyZSB3aXRoIGRldGVybWluc3RpYyBQUk5HIHN0YXRlIGxhdGVyLFxuLy8gc2VlZHJhbmRvbSB3aWxsIG5vdCBjYWxsIG1hdGgucmFuZG9tIG9uIGl0cyBvd24gYWdhaW4gYWZ0ZXJcbi8vIGluaXRpYWxpemF0aW9uLlxuLy9cbiAgbWl4a2V5KG1hdGgucmFuZG9tKCksIHBvb2wpO1xuXG4vLyBFbmQgYW5vbnltb3VzIHNjb3BlLCBhbmQgcGFzcyBpbml0aWFsIHZhbHVlcy5cbn0oXG4gICAgW10sICAgLy8gcG9vbDogZW50cm9weSBwb29sIHN0YXJ0cyBlbXB0eVxuICAgIG51bWVyaWMuc2VlZHJhbmRvbSwgLy8gbWF0aDogcGFja2FnZSBjb250YWluaW5nIHJhbmRvbSwgcG93LCBhbmQgc2VlZHJhbmRvbVxuICAgIDI1NiwgIC8vIHdpZHRoOiBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XG4gICAgNiwgICAgLy8gY2h1bmtzOiBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXG4gICAgNTIgICAgLy8gc2lnbmlmaWNhbmNlOiB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXG4gICkpO1xuLyogVGhpcyBmaWxlIGlzIGEgc2xpZ2h0bHkgbW9kaWZpZWQgdmVyc2lvbiBvZiBxdWFkcHJvZy5qcyBmcm9tIEFsYmVydG8gU2FudGluaS5cbiAqIEl0IGhhcyBiZWVuIHNsaWdodGx5IG1vZGlmaWVkIGJ5IFPDg8KpYmFzdGllbiBMb2lzZWwgdG8gbWFrZSBzdXJlIHRoYXQgaXQgaGFuZGxlc1xuICogMC1iYXNlZCBBcnJheXMgaW5zdGVhZCBvZiAxLWJhc2VkIEFycmF5cy5cbiAqIExpY2Vuc2UgaXMgaW4gcmVzb3VyY2VzL0xJQ0VOU0UucXVhZHByb2cgKi9cbihmdW5jdGlvbihleHBvcnRzKSB7XG5cbiAgZnVuY3Rpb24gYmFzZTB0bzEoQSkge1xuICAgIGlmKHR5cGVvZiBBICE9PSBcIm9iamVjdFwiKSB7IHJldHVybiBBOyB9XG4gICAgdmFyIHJldCA9IFtdLCBpLG49QS5sZW5ndGg7XG4gICAgZm9yKGk9MDtpPG47aSsrKSByZXRbaSsxXSA9IGJhc2UwdG8xKEFbaV0pO1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgZnVuY3Rpb24gYmFzZTF0bzAoQSkge1xuICAgIGlmKHR5cGVvZiBBICE9PSBcIm9iamVjdFwiKSB7IHJldHVybiBBOyB9XG4gICAgdmFyIHJldCA9IFtdLCBpLG49QS5sZW5ndGg7XG4gICAgZm9yKGk9MTtpPG47aSsrKSByZXRbaS0xXSA9IGJhc2UxdG8wKEFbaV0pO1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBmdW5jdGlvbiBkcG9yaShhLCBsZGEsIG4pIHtcbiAgICB2YXIgaSwgaiwgaywga3AxLCB0O1xuXG4gICAgZm9yIChrID0gMTsgayA8PSBuOyBrID0gayArIDEpIHtcbiAgICAgIGFba11ba10gPSAxIC8gYVtrXVtrXTtcbiAgICAgIHQgPSAtYVtrXVtrXTtcbiAgICAgIC8vfiBkc2NhbChrIC0gMSwgdCwgYVsxXVtrXSwgMSk7XG4gICAgICBmb3IgKGkgPSAxOyBpIDwgazsgaSA9IGkgKyAxKSB7XG4gICAgICAgIGFbaV1ba10gPSB0ICogYVtpXVtrXTtcbiAgICAgIH1cblxuICAgICAga3AxID0gayArIDE7XG4gICAgICBpZiAobiA8IGtwMSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGZvciAoaiA9IGtwMTsgaiA8PSBuOyBqID0gaiArIDEpIHtcbiAgICAgICAgdCA9IGFba11bal07XG4gICAgICAgIGFba11bal0gPSAwO1xuICAgICAgICAvL34gZGF4cHkoaywgdCwgYVsxXVtrXSwgMSwgYVsxXVtqXSwgMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gazsgaSA9IGkgKyAxKSB7XG4gICAgICAgICAgYVtpXVtqXSA9IGFbaV1bal0gKyAodCAqIGFbaV1ba10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiBkcG9zbChhLCBsZGEsIG4sIGIpIHtcbiAgICB2YXIgaSwgaywga2IsIHQ7XG5cbiAgICBmb3IgKGsgPSAxOyBrIDw9IG47IGsgPSBrICsgMSkge1xuICAgICAgLy9+IHQgPSBkZG90KGsgLSAxLCBhWzFdW2tdLCAxLCBiWzFdLCAxKTtcbiAgICAgIHQgPSAwO1xuICAgICAgZm9yIChpID0gMTsgaSA8IGs7IGkgPSBpICsgMSkge1xuICAgICAgICB0ID0gdCArIChhW2ldW2tdICogYltpXSk7XG4gICAgICB9XG5cbiAgICAgIGJba10gPSAoYltrXSAtIHQpIC8gYVtrXVtrXTtcbiAgICB9XG5cbiAgICBmb3IgKGtiID0gMTsga2IgPD0gbjsga2IgPSBrYiArIDEpIHtcbiAgICAgIGsgPSBuICsgMSAtIGtiO1xuICAgICAgYltrXSA9IGJba10gLyBhW2tdW2tdO1xuICAgICAgdCA9IC1iW2tdO1xuICAgICAgLy9+IGRheHB5KGsgLSAxLCB0LCBhWzFdW2tdLCAxLCBiWzFdLCAxKTtcbiAgICAgIGZvciAoaSA9IDE7IGkgPCBrOyBpID0gaSArIDEpIHtcbiAgICAgICAgYltpXSA9IGJbaV0gKyAodCAqIGFbaV1ba10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRwb2ZhKGEsIGxkYSwgbiwgaW5mbykge1xuICAgIHZhciBpLCBqLCBqbTEsIGssIHQsIHM7XG5cbiAgICBmb3IgKGogPSAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgaW5mb1sxXSA9IGo7XG4gICAgICBzID0gMDtcbiAgICAgIGptMSA9IGogLSAxO1xuICAgICAgaWYgKGptMSA8IDEpIHtcbiAgICAgICAgcyA9IGFbal1bal0gLSBzO1xuICAgICAgICBpZiAocyA8PSAwKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYVtqXVtqXSA9IE1hdGguc3FydChzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoayA9IDE7IGsgPD0gam0xOyBrID0gayArIDEpIHtcbiAgICAgICAgICAvL34gdCA9IGFba11bal0gLSBkZG90KGsgLSAxLCBhWzFdW2tdLCAxLCBhWzFdW2pdLCAxKTtcbiAgICAgICAgICB0ID0gYVtrXVtqXTtcbiAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgazsgaSA9IGkgKyAxKSB7XG4gICAgICAgICAgICB0ID0gdCAtIChhW2ldW2pdICogYVtpXVtrXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHQgPSB0IC8gYVtrXVtrXTtcbiAgICAgICAgICBhW2tdW2pdID0gdDtcbiAgICAgICAgICBzID0gcyArIHQgKiB0O1xuICAgICAgICB9XG4gICAgICAgIHMgPSBhW2pdW2pdIC0gcztcbiAgICAgICAgaWYgKHMgPD0gMCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGFbal1bal0gPSBNYXRoLnNxcnQocyk7XG4gICAgICB9XG4gICAgICBpbmZvWzFdID0gMDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBxcGdlbjIoZG1hdCwgZHZlYywgZmRkbWF0LCBuLCBzb2wsIGNydmFsLCBhbWF0LFxuICAgICAgICAgICAgICAgICAgYnZlYywgZmRhbWF0LCBxLCBtZXEsIGlhY3QsIG5hY3QsIGl0ZXIsIHdvcmssIGllcnIpIHtcblxuICAgIHZhciBpLCBqLCBsLCBsMSwgaW5mbywgaXQxLCBpd3p2LCBpd3J2LCBpd3JtLCBpd3N2LCBpd3V2LCBudmwsIHIsIGl3bmJ2LFxuICAgICAgdGVtcCwgc3VtLCB0MSwgdHQsIGdjLCBncywgbnUsXG4gICAgICB0MWluZiwgdDJtaW4sXG4gICAgICB2c21hbGwsIHRtcGEsIHRtcGIsXG4gICAgICBnbztcblxuICAgIHIgPSBNYXRoLm1pbihuLCBxKTtcbiAgICBsID0gMiAqIG4gKyAociAqIChyICsgNSkpIC8gMiArIDIgKiBxICsgMTtcblxuICAgIHZzbWFsbCA9IDEuMGUtNjA7XG4gICAgZG8ge1xuICAgICAgdnNtYWxsID0gdnNtYWxsICsgdnNtYWxsO1xuICAgICAgdG1wYSA9IDEgKyAwLjEgKiB2c21hbGw7XG4gICAgICB0bXBiID0gMSArIDAuMiAqIHZzbWFsbDtcbiAgICB9IHdoaWxlICh0bXBhIDw9IDEgfHwgdG1wYiA8PSAxKTtcblxuICAgIGZvciAoaSA9IDE7IGkgPD0gbjsgaSA9IGkgKyAxKSB7XG4gICAgICB3b3JrW2ldID0gZHZlY1tpXTtcbiAgICB9XG4gICAgZm9yIChpID0gbiArIDE7IGkgPD0gbDsgaSA9IGkgKyAxKSB7XG4gICAgICB3b3JrW2ldID0gMDtcbiAgICB9XG4gICAgZm9yIChpID0gMTsgaSA8PSBxOyBpID0gaSArIDEpIHtcbiAgICAgIGlhY3RbaV0gPSAwO1xuICAgIH1cblxuICAgIGluZm8gPSBbXTtcblxuICAgIGlmIChpZXJyWzFdID09PSAwKSB7XG4gICAgICBkcG9mYShkbWF0LCBmZGRtYXQsIG4sIGluZm8pO1xuICAgICAgaWYgKGluZm9bMV0gIT09IDApIHtcbiAgICAgICAgaWVyclsxXSA9IDI7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGRwb3NsKGRtYXQsIGZkZG1hdCwgbiwgZHZlYyk7XG4gICAgICBkcG9yaShkbWF0LCBmZGRtYXQsIG4pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGogPSAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgICBzb2xbal0gPSAwO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IGo7IGkgPSBpICsgMSkge1xuICAgICAgICAgIHNvbFtqXSA9IHNvbFtqXSArIGRtYXRbaV1bal0gKiBkdmVjW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKGogPSAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgICBkdmVjW2pdID0gMDtcbiAgICAgICAgZm9yIChpID0gajsgaSA8PSBuOyBpID0gaSArIDEpIHtcbiAgICAgICAgICBkdmVjW2pdID0gZHZlY1tqXSArIGRtYXRbal1baV0gKiBzb2xbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjcnZhbFsxXSA9IDA7XG4gICAgZm9yIChqID0gMTsgaiA8PSBuOyBqID0gaiArIDEpIHtcbiAgICAgIHNvbFtqXSA9IGR2ZWNbal07XG4gICAgICBjcnZhbFsxXSA9IGNydmFsWzFdICsgd29ya1tqXSAqIHNvbFtqXTtcbiAgICAgIHdvcmtbal0gPSAwO1xuICAgICAgZm9yIChpID0gaiArIDE7IGkgPD0gbjsgaSA9IGkgKyAxKSB7XG4gICAgICAgIGRtYXRbaV1bal0gPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICBjcnZhbFsxXSA9IC1jcnZhbFsxXSAvIDI7XG4gICAgaWVyclsxXSA9IDA7XG5cbiAgICBpd3p2ID0gbjtcbiAgICBpd3J2ID0gaXd6diArIG47XG4gICAgaXd1diA9IGl3cnYgKyByO1xuICAgIGl3cm0gPSBpd3V2ICsgciArIDE7XG4gICAgaXdzdiA9IGl3cm0gKyAociAqIChyICsgMSkpIC8gMjtcbiAgICBpd25idiA9IGl3c3YgKyBxO1xuXG4gICAgZm9yIChpID0gMTsgaSA8PSBxOyBpID0gaSArIDEpIHtcbiAgICAgIHN1bSA9IDA7XG4gICAgICBmb3IgKGogPSAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgICBzdW0gPSBzdW0gKyBhbWF0W2pdW2ldICogYW1hdFtqXVtpXTtcbiAgICAgIH1cbiAgICAgIHdvcmtbaXduYnYgKyBpXSA9IE1hdGguc3FydChzdW0pO1xuICAgIH1cbiAgICBuYWN0ID0gMDtcbiAgICBpdGVyWzFdID0gMDtcbiAgICBpdGVyWzJdID0gMDtcblxuICAgIGZ1bmN0aW9uIGZuX2dvdG9fNTAoKSB7XG4gICAgICBpdGVyWzFdID0gaXRlclsxXSArIDE7XG5cbiAgICAgIGwgPSBpd3N2O1xuICAgICAgZm9yIChpID0gMTsgaSA8PSBxOyBpID0gaSArIDEpIHtcbiAgICAgICAgbCA9IGwgKyAxO1xuICAgICAgICBzdW0gPSAtYnZlY1tpXTtcbiAgICAgICAgZm9yIChqID0gMTsgaiA8PSBuOyBqID0gaiArIDEpIHtcbiAgICAgICAgICBzdW0gPSBzdW0gKyBhbWF0W2pdW2ldICogc29sW2pdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChNYXRoLmFicyhzdW0pIDwgdnNtYWxsKSB7XG4gICAgICAgICAgc3VtID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA+IG1lcSkge1xuICAgICAgICAgIHdvcmtbbF0gPSBzdW07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd29ya1tsXSA9IC1NYXRoLmFicyhzdW0pO1xuICAgICAgICAgIGlmIChzdW0gPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGogPSAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgICAgICAgICBhbWF0W2pdW2ldID0gLWFtYXRbal1baV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBidmVjW2ldID0gLWJ2ZWNbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDE7IGkgPD0gbmFjdDsgaSA9IGkgKyAxKSB7XG4gICAgICAgIHdvcmtbaXdzdiArIGlhY3RbaV1dID0gMDtcbiAgICAgIH1cblxuICAgICAgbnZsID0gMDtcbiAgICAgIHRlbXAgPSAwO1xuICAgICAgZm9yIChpID0gMTsgaSA8PSBxOyBpID0gaSArIDEpIHtcbiAgICAgICAgaWYgKHdvcmtbaXdzdiArIGldIDwgdGVtcCAqIHdvcmtbaXduYnYgKyBpXSkge1xuICAgICAgICAgIG52bCA9IGk7XG4gICAgICAgICAgdGVtcCA9IHdvcmtbaXdzdiArIGldIC8gd29ya1tpd25idiArIGldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobnZsID09PSAwKSB7XG4gICAgICAgIHJldHVybiA5OTk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZuX2dvdG9fNTUoKSB7XG4gICAgICBmb3IgKGkgPSAxOyBpIDw9IG47IGkgPSBpICsgMSkge1xuICAgICAgICBzdW0gPSAwO1xuICAgICAgICBmb3IgKGogPSAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgICAgIHN1bSA9IHN1bSArIGRtYXRbal1baV0gKiBhbWF0W2pdW252bF07XG4gICAgICAgIH1cbiAgICAgICAgd29ya1tpXSA9IHN1bTtcbiAgICAgIH1cblxuICAgICAgbDEgPSBpd3p2O1xuICAgICAgZm9yIChpID0gMTsgaSA8PSBuOyBpID0gaSArIDEpIHtcbiAgICAgICAgd29ya1tsMSArIGldID0gMDtcbiAgICAgIH1cbiAgICAgIGZvciAoaiA9IG5hY3QgKyAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IG47IGkgPSBpICsgMSkge1xuICAgICAgICAgIHdvcmtbbDEgKyBpXSA9IHdvcmtbbDEgKyBpXSArIGRtYXRbaV1bal0gKiB3b3JrW2pdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHQxaW5mID0gdHJ1ZTtcbiAgICAgIGZvciAoaSA9IG5hY3Q7IGkgPj0gMTsgaSA9IGkgLSAxKSB7XG4gICAgICAgIHN1bSA9IHdvcmtbaV07XG4gICAgICAgIGwgPSBpd3JtICsgKGkgKiAoaSArIDMpKSAvIDI7XG4gICAgICAgIGwxID0gbCAtIGk7XG4gICAgICAgIGZvciAoaiA9IGkgKyAxOyBqIDw9IG5hY3Q7IGogPSBqICsgMSkge1xuICAgICAgICAgIHN1bSA9IHN1bSAtIHdvcmtbbF0gKiB3b3JrW2l3cnYgKyBqXTtcbiAgICAgICAgICBsID0gbCArIGo7XG4gICAgICAgIH1cbiAgICAgICAgc3VtID0gc3VtIC8gd29ya1tsMV07XG4gICAgICAgIHdvcmtbaXdydiArIGldID0gc3VtO1xuICAgICAgICBpZiAoaWFjdFtpXSA8IG1lcSkge1xuICAgICAgICAgIC8vIGNvbnRpbnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdW0gPCAwKSB7XG4gICAgICAgICAgLy8gY29udGludWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdDFpbmYgPSBmYWxzZTtcbiAgICAgICAgaXQxID0gaTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0MWluZikge1xuICAgICAgICB0MSA9IHdvcmtbaXd1diArIGl0MV0gLyB3b3JrW2l3cnYgKyBpdDFdO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IG5hY3Q7IGkgPSBpICsgMSkge1xuICAgICAgICAgIGlmIChpYWN0W2ldIDwgbWVxKSB7XG4gICAgICAgICAgICAvLyBjb250aW51ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAod29ya1tpd3J2ICsgaV0gPCAwKSB7XG4gICAgICAgICAgICAvLyBjb250aW51ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0ZW1wID0gd29ya1tpd3V2ICsgaV0gLyB3b3JrW2l3cnYgKyBpXTtcbiAgICAgICAgICBpZiAodGVtcCA8IHQxKSB7XG4gICAgICAgICAgICB0MSA9IHRlbXA7XG4gICAgICAgICAgICBpdDEgPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzdW0gPSAwO1xuICAgICAgZm9yIChpID0gaXd6diArIDE7IGkgPD0gaXd6diArIG47IGkgPSBpICsgMSkge1xuICAgICAgICBzdW0gPSBzdW0gKyB3b3JrW2ldICogd29ya1tpXTtcbiAgICAgIH1cbiAgICAgIGlmIChNYXRoLmFicyhzdW0pIDw9IHZzbWFsbCkge1xuICAgICAgICBpZiAodDFpbmYpIHtcbiAgICAgICAgICBpZXJyWzFdID0gMTtcbiAgICAgICAgICAvLyBHT1RPIDk5OVxuICAgICAgICAgIHJldHVybiA5OTk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChpID0gMTsgaSA8PSBuYWN0OyBpID0gaSArIDEpIHtcbiAgICAgICAgICAgIHdvcmtbaXd1diArIGldID0gd29ya1tpd3V2ICsgaV0gLSB0MSAqIHdvcmtbaXdydiArIGldO1xuICAgICAgICAgIH1cbiAgICAgICAgICB3b3JrW2l3dXYgKyBuYWN0ICsgMV0gPSB3b3JrW2l3dXYgKyBuYWN0ICsgMV0gKyB0MTtcbiAgICAgICAgICAvLyBHT1RPIDcwMFxuICAgICAgICAgIHJldHVybiA3MDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN1bSA9IDA7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gbjsgaSA9IGkgKyAxKSB7XG4gICAgICAgICAgc3VtID0gc3VtICsgd29ya1tpd3p2ICsgaV0gKiBhbWF0W2ldW252bF07XG4gICAgICAgIH1cbiAgICAgICAgdHQgPSAtd29ya1tpd3N2ICsgbnZsXSAvIHN1bTtcbiAgICAgICAgdDJtaW4gPSB0cnVlO1xuICAgICAgICBpZiAoIXQxaW5mKSB7XG4gICAgICAgICAgaWYgKHQxIDwgdHQpIHtcbiAgICAgICAgICAgIHR0ID0gdDE7XG4gICAgICAgICAgICB0Mm1pbiA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gbjsgaSA9IGkgKyAxKSB7XG4gICAgICAgICAgc29sW2ldID0gc29sW2ldICsgdHQgKiB3b3JrW2l3enYgKyBpXTtcbiAgICAgICAgICBpZiAoTWF0aC5hYnMoc29sW2ldKSA8IHZzbWFsbCkge1xuICAgICAgICAgICAgc29sW2ldID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjcnZhbFsxXSA9IGNydmFsWzFdICsgdHQgKiBzdW0gKiAodHQgLyAyICsgd29ya1tpd3V2ICsgbmFjdCArIDFdKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSBuYWN0OyBpID0gaSArIDEpIHtcbiAgICAgICAgICB3b3JrW2l3dXYgKyBpXSA9IHdvcmtbaXd1diArIGldIC0gdHQgKiB3b3JrW2l3cnYgKyBpXTtcbiAgICAgICAgfVxuICAgICAgICB3b3JrW2l3dXYgKyBuYWN0ICsgMV0gPSB3b3JrW2l3dXYgKyBuYWN0ICsgMV0gKyB0dDtcblxuICAgICAgICBpZiAodDJtaW4pIHtcbiAgICAgICAgICBuYWN0ID0gbmFjdCArIDE7XG4gICAgICAgICAgaWFjdFtuYWN0XSA9IG52bDtcblxuICAgICAgICAgIGwgPSBpd3JtICsgKChuYWN0IC0gMSkgKiBuYWN0KSAvIDIgKyAxO1xuICAgICAgICAgIGZvciAoaSA9IDE7IGkgPD0gbmFjdCAtIDE7IGkgPSBpICsgMSkge1xuICAgICAgICAgICAgd29ya1tsXSA9IHdvcmtbaV07XG4gICAgICAgICAgICBsID0gbCArIDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG5hY3QgPT09IG4pIHtcbiAgICAgICAgICAgIHdvcmtbbF0gPSB3b3JrW25dO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGkgPSBuOyBpID49IG5hY3QgKyAxOyBpID0gaSAtIDEpIHtcbiAgICAgICAgICAgICAgaWYgKHdvcmtbaV0gPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBnYyA9IE1hdGgubWF4KE1hdGguYWJzKHdvcmtbaSAtIDFdKSwgTWF0aC5hYnMod29ya1tpXSkpO1xuICAgICAgICAgICAgICBncyA9IE1hdGgubWluKE1hdGguYWJzKHdvcmtbaSAtIDFdKSwgTWF0aC5hYnMod29ya1tpXSkpO1xuICAgICAgICAgICAgICBpZiAod29ya1tpIC0gMV0gPj0gMCkge1xuICAgICAgICAgICAgICAgIHRlbXAgPSBNYXRoLmFicyhnYyAqIE1hdGguc3FydCgxICsgZ3MgKiBncyAvIChnYyAqIGdjKSkpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXAgPSAtTWF0aC5hYnMoZ2MgKiBNYXRoLnNxcnQoMSArIGdzICogZ3MgLyAoZ2MgKiBnYykpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBnYyA9IHdvcmtbaSAtIDFdIC8gdGVtcDtcbiAgICAgICAgICAgICAgZ3MgPSB3b3JrW2ldIC8gdGVtcDtcblxuICAgICAgICAgICAgICBpZiAoZ2MgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoZ2MgPT09IDApIHtcbiAgICAgICAgICAgICAgICB3b3JrW2kgLSAxXSA9IGdzICogdGVtcDtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgICAgICAgICAgICAgdGVtcCA9IGRtYXRbal1baSAtIDFdO1xuICAgICAgICAgICAgICAgICAgZG1hdFtqXVtpIC0gMV0gPSBkbWF0W2pdW2ldO1xuICAgICAgICAgICAgICAgICAgZG1hdFtqXVtpXSA9IHRlbXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdvcmtbaSAtIDFdID0gdGVtcDtcbiAgICAgICAgICAgICAgICBudSA9IGdzIC8gKDEgKyBnYyk7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMTsgaiA8PSBuOyBqID0gaiArIDEpIHtcbiAgICAgICAgICAgICAgICAgIHRlbXAgPSBnYyAqIGRtYXRbal1baSAtIDFdICsgZ3MgKiBkbWF0W2pdW2ldO1xuICAgICAgICAgICAgICAgICAgZG1hdFtqXVtpXSA9IG51ICogKGRtYXRbal1baSAtIDFdICsgdGVtcCkgLSBkbWF0W2pdW2ldO1xuICAgICAgICAgICAgICAgICAgZG1hdFtqXVtpIC0gMV0gPSB0ZW1wO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3b3JrW2xdID0gd29ya1tuYWN0XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VtID0gLWJ2ZWNbbnZsXTtcbiAgICAgICAgICBmb3IgKGogPSAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgICAgICAgc3VtID0gc3VtICsgc29sW2pdICogYW1hdFtqXVtudmxdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobnZsID4gbWVxKSB7XG4gICAgICAgICAgICB3b3JrW2l3c3YgKyBudmxdID0gc3VtO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3b3JrW2l3c3YgKyBudmxdID0gLU1hdGguYWJzKHN1bSk7XG4gICAgICAgICAgICBpZiAoc3VtID4gMCkge1xuICAgICAgICAgICAgICBmb3IgKGogPSAxOyBqIDw9IG47IGogPSBqICsgMSkge1xuICAgICAgICAgICAgICAgIGFtYXRbal1bbnZsXSA9IC1hbWF0W2pdW252bF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnZlY1tudmxdID0gLWJ2ZWNbbnZsXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gR09UTyA3MDBcbiAgICAgICAgICByZXR1cm4gNzAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZuX2dvdG9fNzk3KCkge1xuICAgICAgbCA9IGl3cm0gKyAoaXQxICogKGl0MSArIDEpKSAvIDIgKyAxO1xuICAgICAgbDEgPSBsICsgaXQxO1xuICAgICAgaWYgKHdvcmtbbDFdID09PSAwKSB7XG4gICAgICAgIC8vIEdPVE8gNzk4XG4gICAgICAgIHJldHVybiA3OTg7XG4gICAgICB9XG4gICAgICBnYyA9IE1hdGgubWF4KE1hdGguYWJzKHdvcmtbbDEgLSAxXSksIE1hdGguYWJzKHdvcmtbbDFdKSk7XG4gICAgICBncyA9IE1hdGgubWluKE1hdGguYWJzKHdvcmtbbDEgLSAxXSksIE1hdGguYWJzKHdvcmtbbDFdKSk7XG4gICAgICBpZiAod29ya1tsMSAtIDFdID49IDApIHtcbiAgICAgICAgdGVtcCA9IE1hdGguYWJzKGdjICogTWF0aC5zcXJ0KDEgKyBncyAqIGdzIC8gKGdjICogZ2MpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZW1wID0gLU1hdGguYWJzKGdjICogTWF0aC5zcXJ0KDEgKyBncyAqIGdzIC8gKGdjICogZ2MpKSk7XG4gICAgICB9XG4gICAgICBnYyA9IHdvcmtbbDEgLSAxXSAvIHRlbXA7XG4gICAgICBncyA9IHdvcmtbbDFdIC8gdGVtcDtcblxuICAgICAgaWYgKGdjID09PSAxKSB7XG4gICAgICAgIC8vIEdPVE8gNzk4XG4gICAgICAgIHJldHVybiA3OTg7XG4gICAgICB9XG4gICAgICBpZiAoZ2MgPT09IDApIHtcbiAgICAgICAgZm9yIChpID0gaXQxICsgMTsgaSA8PSBuYWN0OyBpID0gaSArIDEpIHtcbiAgICAgICAgICB0ZW1wID0gd29ya1tsMSAtIDFdO1xuICAgICAgICAgIHdvcmtbbDEgLSAxXSA9IHdvcmtbbDFdO1xuICAgICAgICAgIHdvcmtbbDFdID0gdGVtcDtcbiAgICAgICAgICBsMSA9IGwxICsgaTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IG47IGkgPSBpICsgMSkge1xuICAgICAgICAgIHRlbXAgPSBkbWF0W2ldW2l0MV07XG4gICAgICAgICAgZG1hdFtpXVtpdDFdID0gZG1hdFtpXVtpdDEgKyAxXTtcbiAgICAgICAgICBkbWF0W2ldW2l0MSArIDFdID0gdGVtcDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbnUgPSBncyAvICgxICsgZ2MpO1xuICAgICAgICBmb3IgKGkgPSBpdDEgKyAxOyBpIDw9IG5hY3Q7IGkgPSBpICsgMSkge1xuICAgICAgICAgIHRlbXAgPSBnYyAqIHdvcmtbbDEgLSAxXSArIGdzICogd29ya1tsMV07XG4gICAgICAgICAgd29ya1tsMV0gPSBudSAqICh3b3JrW2wxIC0gMV0gKyB0ZW1wKSAtIHdvcmtbbDFdO1xuICAgICAgICAgIHdvcmtbbDEgLSAxXSA9IHRlbXA7XG4gICAgICAgICAgbDEgPSBsMSArIGk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSBuOyBpID0gaSArIDEpIHtcbiAgICAgICAgICB0ZW1wID0gZ2MgKiBkbWF0W2ldW2l0MV0gKyBncyAqIGRtYXRbaV1baXQxICsgMV07XG4gICAgICAgICAgZG1hdFtpXVtpdDEgKyAxXSA9IG51ICogKGRtYXRbaV1baXQxXSArIHRlbXApIC0gZG1hdFtpXVtpdDEgKyAxXTtcbiAgICAgICAgICBkbWF0W2ldW2l0MV0gPSB0ZW1wO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZuX2dvdG9fNzk4KCkge1xuICAgICAgbDEgPSBsIC0gaXQxO1xuICAgICAgZm9yIChpID0gMTsgaSA8PSBpdDE7IGkgPSBpICsgMSkge1xuICAgICAgICB3b3JrW2wxXSA9IHdvcmtbbF07XG4gICAgICAgIGwgPSBsICsgMTtcbiAgICAgICAgbDEgPSBsMSArIDE7XG4gICAgICB9XG5cbiAgICAgIHdvcmtbaXd1diArIGl0MV0gPSB3b3JrW2l3dXYgKyBpdDEgKyAxXTtcbiAgICAgIGlhY3RbaXQxXSA9IGlhY3RbaXQxICsgMV07XG4gICAgICBpdDEgPSBpdDEgKyAxO1xuICAgICAgaWYgKGl0MSA8IG5hY3QpIHtcbiAgICAgICAgLy8gR09UTyA3OTdcbiAgICAgICAgcmV0dXJuIDc5NztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm5fZ290b183OTkoKSB7XG4gICAgICB3b3JrW2l3dXYgKyBuYWN0XSA9IHdvcmtbaXd1diArIG5hY3QgKyAxXTtcbiAgICAgIHdvcmtbaXd1diArIG5hY3QgKyAxXSA9IDA7XG4gICAgICBpYWN0W25hY3RdID0gMDtcbiAgICAgIG5hY3QgPSBuYWN0IC0gMTtcbiAgICAgIGl0ZXJbMl0gPSBpdGVyWzJdICsgMTtcblxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgZ28gPSAwO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBnbyA9IGZuX2dvdG9fNTAoKTtcbiAgICAgIGlmIChnbyA9PT0gOTk5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGdvID0gZm5fZ290b181NSgpO1xuICAgICAgICBpZiAoZ28gPT09IDApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ28gPT09IDk5OSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ28gPT09IDcwMCkge1xuICAgICAgICAgIGlmIChpdDEgPT09IG5hY3QpIHtcbiAgICAgICAgICAgIGZuX2dvdG9fNzk5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgIGZuX2dvdG9fNzk3KCk7XG4gICAgICAgICAgICAgIGdvID0gZm5fZ290b183OTgoKTtcbiAgICAgICAgICAgICAgaWYgKGdvICE9PSA3OTcpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm5fZ290b183OTkoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHNvbHZlUVAoRG1hdCwgZHZlYywgQW1hdCwgYnZlYywgbWVxLCBmYWN0b3JpemVkKSB7XG4gICAgRG1hdCA9IGJhc2UwdG8xKERtYXQpO1xuICAgIGR2ZWMgPSBiYXNlMHRvMShkdmVjKTtcbiAgICBBbWF0ID0gYmFzZTB0bzEoQW1hdCk7XG4gICAgdmFyIGksIG4sIHEsXG4gICAgICBuYWN0LCByLFxuICAgICAgY3J2YWwgPSBbXSwgaWFjdCA9IFtdLCBzb2wgPSBbXSwgd29yayA9IFtdLCBpdGVyID0gW10sXG4gICAgICBtZXNzYWdlO1xuXG4gICAgbWVxID0gbWVxIHx8IDA7XG4gICAgZmFjdG9yaXplZCA9IGZhY3Rvcml6ZWQgPyBiYXNlMHRvMShmYWN0b3JpemVkKSA6IFt1bmRlZmluZWQsIDBdO1xuICAgIGJ2ZWMgPSBidmVjID8gYmFzZTB0bzEoYnZlYykgOiBbXTtcblxuICAgIC8vIEluIEZvcnRyYW4gdGhlIGFycmF5IGluZGV4IHN0YXJ0cyBmcm9tIDFcbiAgICBuID0gRG1hdC5sZW5ndGggLSAxO1xuICAgIHEgPSBBbWF0WzFdLmxlbmd0aCAtIDE7XG5cbiAgICBpZiAoIWJ2ZWMpIHtcbiAgICAgIGZvciAoaSA9IDE7IGkgPD0gcTsgaSA9IGkgKyAxKSB7XG4gICAgICAgIGJ2ZWNbaV0gPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGkgPSAxOyBpIDw9IHE7IGkgPSBpICsgMSkge1xuICAgICAgaWFjdFtpXSA9IDA7XG4gICAgfVxuICAgIG5hY3QgPSAwO1xuICAgIHIgPSBNYXRoLm1pbihuLCBxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDw9IG47IGkgPSBpICsgMSkge1xuICAgICAgc29sW2ldID0gMDtcbiAgICB9XG4gICAgY3J2YWxbMV0gPSAwO1xuICAgIGZvciAoaSA9IDE7IGkgPD0gKDIgKiBuICsgKHIgKiAociArIDUpKSAvIDIgKyAyICogcSArIDEpOyBpID0gaSArIDEpIHtcbiAgICAgIHdvcmtbaV0gPSAwO1xuICAgIH1cbiAgICBmb3IgKGkgPSAxOyBpIDw9IDI7IGkgPSBpICsgMSkge1xuICAgICAgaXRlcltpXSA9IDA7XG4gICAgfVxuXG4gICAgcXBnZW4yKERtYXQsIGR2ZWMsIG4sIG4sIHNvbCwgY3J2YWwsIEFtYXQsXG4gICAgICBidmVjLCBuLCBxLCBtZXEsIGlhY3QsIG5hY3QsIGl0ZXIsIHdvcmssIGZhY3Rvcml6ZWQpO1xuXG4gICAgbWVzc2FnZSA9IFwiXCI7XG4gICAgaWYgKGZhY3Rvcml6ZWRbMV0gPT09IDEpIHtcbiAgICAgIG1lc3NhZ2UgPSBcImNvbnN0cmFpbnRzIGFyZSBpbmNvbnNpc3RlbnQsIG5vIHNvbHV0aW9uIVwiO1xuICAgIH1cbiAgICBpZiAoZmFjdG9yaXplZFsxXSA9PT0gMikge1xuICAgICAgbWVzc2FnZSA9IFwibWF0cml4IEQgaW4gcXVhZHJhdGljIGZ1bmN0aW9uIGlzIG5vdCBwb3NpdGl2ZSBkZWZpbml0ZSFcIjtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc29sdXRpb246IGJhc2UxdG8wKHNvbCksXG4gICAgICB2YWx1ZTogYmFzZTF0bzAoY3J2YWwpLFxuICAgICAgdW5jb25zdHJhaW5lZF9zb2x1dGlvbjogYmFzZTF0bzAoZHZlYyksXG4gICAgICBpdGVyYXRpb25zOiBiYXNlMXRvMChpdGVyKSxcbiAgICAgIGlhY3Q6IGJhc2UxdG8wKGlhY3QpLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgIH07XG4gIH1cbiAgZXhwb3J0cy5zb2x2ZVFQID0gc29sdmVRUDtcbn0obnVtZXJpYykpO1xuLypcbiBTaGFudGkgUmFvIHNlbnQgbWUgdGhpcyByb3V0aW5lIGJ5IHByaXZhdGUgZW1haWwuIEkgaGFkIHRvIG1vZGlmeSBpdFxuIHNsaWdodGx5IHRvIHdvcmsgb24gQXJyYXlzIGluc3RlYWQgb2YgdXNpbmcgYSBNYXRyaXggb2JqZWN0LlxuIEl0IGlzIGFwcGFyZW50bHkgdHJhbnNsYXRlZCBmcm9tIGh0dHA6Ly9zdGl0Y2hwYW5vcmFtYS5zb3VyY2Vmb3JnZS5uZXQvUHl0aG9uL3N2ZC5weVxuICovXG5cbm51bWVyaWMuc3ZkPSBmdW5jdGlvbiBzdmQoQSkge1xuICB2YXIgdGVtcDtcbi8vQ29tcHV0ZSB0aGUgdGhpbiBTVkQgZnJvbSBHLiBILiBHb2x1YiBhbmQgQy4gUmVpbnNjaCwgTnVtZXIuIE1hdGguIDE0LCA0MDMtNDIwICgxOTcwKVxuICB2YXIgcHJlYz0gbnVtZXJpYy5lcHNpbG9uOyAvL01hdGgucG93KDIsLTUyKSAvLyBhc3N1bWVzIGRvdWJsZSBwcmVjXG4gIHZhciB0b2xlcmFuY2U9IDEuZS02NC9wcmVjO1xuICB2YXIgaXRtYXg9IDUwO1xuICB2YXIgYz0wO1xuICB2YXIgaT0wO1xuICB2YXIgaj0wO1xuICB2YXIgaz0wO1xuICB2YXIgbD0wO1xuXG4gIHZhciB1PSBudW1lcmljLmNsb25lKEEpO1xuICB2YXIgbT0gdS5sZW5ndGg7XG5cbiAgdmFyIG49IHVbMF0ubGVuZ3RoO1xuXG4gIGlmIChtIDwgbikgdGhyb3cgXCJOZWVkIG1vcmUgcm93cyB0aGFuIGNvbHVtbnNcIlxuXG4gIHZhciBlID0gbmV3IEFycmF5KG4pO1xuICB2YXIgcSA9IG5ldyBBcnJheShuKTtcbiAgZm9yIChpPTA7IGk8bjsgaSsrKSBlW2ldID0gcVtpXSA9IDAuMDtcbiAgdmFyIHYgPSBudW1lcmljLnJlcChbbixuXSwwKTtcbi8vXHR2Lnplcm8oKTtcblxuICBmdW5jdGlvbiBweXRoYWcoYSxiKVxuICB7XG4gICAgYSA9IE1hdGguYWJzKGEpXG4gICAgYiA9IE1hdGguYWJzKGIpXG4gICAgaWYgKGEgPiBiKVxuICAgICAgcmV0dXJuIGEqTWF0aC5zcXJ0KDEuMCsoYipiL2EvYSkpXG4gICAgZWxzZSBpZiAoYiA9PSAwLjApXG4gICAgICByZXR1cm4gYVxuICAgIHJldHVybiBiKk1hdGguc3FydCgxLjArKGEqYS9iL2IpKVxuICB9XG5cbiAgLy9Ib3VzZWhvbGRlcidzIHJlZHVjdGlvbiB0byBiaWRpYWdvbmFsIGZvcm1cblxuICB2YXIgZj0gMC4wO1xuICB2YXIgZz0gMC4wO1xuICB2YXIgaD0gMC4wO1xuICB2YXIgeD0gMC4wO1xuICB2YXIgeT0gMC4wO1xuICB2YXIgej0gMC4wO1xuICB2YXIgcz0gMC4wO1xuXG4gIGZvciAoaT0wOyBpIDwgbjsgaSsrKVxuICB7XG4gICAgZVtpXT0gZztcbiAgICBzPSAwLjA7XG4gICAgbD0gaSsxO1xuICAgIGZvciAoaj1pOyBqIDwgbTsgaisrKVxuICAgICAgcyArPSAodVtqXVtpXSp1W2pdW2ldKTtcbiAgICBpZiAocyA8PSB0b2xlcmFuY2UpXG4gICAgICBnPSAwLjA7XG4gICAgZWxzZVxuICAgIHtcbiAgICAgIGY9IHVbaV1baV07XG4gICAgICBnPSBNYXRoLnNxcnQocyk7XG4gICAgICBpZiAoZiA+PSAwLjApIGc9IC1nO1xuICAgICAgaD0gZipnLXNcbiAgICAgIHVbaV1baV09Zi1nO1xuICAgICAgZm9yIChqPWw7IGogPCBuOyBqKyspXG4gICAgICB7XG4gICAgICAgIHM9IDAuMFxuICAgICAgICBmb3IgKGs9aTsgayA8IG07IGsrKylcbiAgICAgICAgICBzICs9IHVba11baV0qdVtrXVtqXVxuICAgICAgICBmPSBzL2hcbiAgICAgICAgZm9yIChrPWk7IGsgPCBtOyBrKyspXG4gICAgICAgICAgdVtrXVtqXSs9Zip1W2tdW2ldXG4gICAgICB9XG4gICAgfVxuICAgIHFbaV09IGdcbiAgICBzPSAwLjBcbiAgICBmb3IgKGo9bDsgaiA8IG47IGorKylcbiAgICAgIHM9IHMgKyB1W2ldW2pdKnVbaV1bal1cbiAgICBpZiAocyA8PSB0b2xlcmFuY2UpXG4gICAgICBnPSAwLjBcbiAgICBlbHNlXG4gICAge1xuICAgICAgZj0gdVtpXVtpKzFdXG4gICAgICBnPSBNYXRoLnNxcnQocylcbiAgICAgIGlmIChmID49IDAuMCkgZz0gLWdcbiAgICAgIGg9IGYqZyAtIHNcbiAgICAgIHVbaV1baSsxXSA9IGYtZztcbiAgICAgIGZvciAoaj1sOyBqIDwgbjsgaisrKSBlW2pdPSB1W2ldW2pdL2hcbiAgICAgIGZvciAoaj1sOyBqIDwgbTsgaisrKVxuICAgICAge1xuICAgICAgICBzPTAuMFxuICAgICAgICBmb3IgKGs9bDsgayA8IG47IGsrKylcbiAgICAgICAgICBzICs9ICh1W2pdW2tdKnVbaV1ba10pXG4gICAgICAgIGZvciAoaz1sOyBrIDwgbjsgaysrKVxuICAgICAgICAgIHVbal1ba10rPXMqZVtrXVxuICAgICAgfVxuICAgIH1cbiAgICB5PSBNYXRoLmFicyhxW2ldKStNYXRoLmFicyhlW2ldKVxuICAgIGlmICh5PngpXG4gICAgICB4PXlcbiAgfVxuXG4gIC8vIGFjY3VtdWxhdGlvbiBvZiByaWdodCBoYW5kIGd0cmFuc2Zvcm1hdGlvbnNcbiAgZm9yIChpPW4tMTsgaSAhPSAtMTsgaSs9IC0xKVxuICB7XG4gICAgaWYgKGcgIT0gMC4wKVxuICAgIHtcbiAgICAgIGg9IGcqdVtpXVtpKzFdXG4gICAgICBmb3IgKGo9bDsgaiA8IG47IGorKylcbiAgICAgICAgdltqXVtpXT11W2ldW2pdL2hcbiAgICAgIGZvciAoaj1sOyBqIDwgbjsgaisrKVxuICAgICAge1xuICAgICAgICBzPTAuMFxuICAgICAgICBmb3IgKGs9bDsgayA8IG47IGsrKylcbiAgICAgICAgICBzICs9IHVbaV1ba10qdltrXVtqXVxuICAgICAgICBmb3IgKGs9bDsgayA8IG47IGsrKylcbiAgICAgICAgICB2W2tdW2pdKz0ocyp2W2tdW2ldKVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGo9bDsgaiA8IG47IGorKylcbiAgICB7XG4gICAgICB2W2ldW2pdID0gMDtcbiAgICAgIHZbal1baV0gPSAwO1xuICAgIH1cbiAgICB2W2ldW2ldID0gMTtcbiAgICBnPSBlW2ldXG4gICAgbD0gaVxuICB9XG5cbiAgLy8gYWNjdW11bGF0aW9uIG9mIGxlZnQgaGFuZCB0cmFuc2Zvcm1hdGlvbnNcbiAgZm9yIChpPW4tMTsgaSAhPSAtMTsgaSs9IC0xKVxuICB7XG4gICAgbD0gaSsxXG4gICAgZz0gcVtpXVxuICAgIGZvciAoaj1sOyBqIDwgbjsgaisrKVxuICAgICAgdVtpXVtqXSA9IDA7XG4gICAgaWYgKGcgIT0gMC4wKVxuICAgIHtcbiAgICAgIGg9IHVbaV1baV0qZ1xuICAgICAgZm9yIChqPWw7IGogPCBuOyBqKyspXG4gICAgICB7XG4gICAgICAgIHM9MC4wXG4gICAgICAgIGZvciAoaz1sOyBrIDwgbTsgaysrKSBzICs9IHVba11baV0qdVtrXVtqXTtcbiAgICAgICAgZj0gcy9oXG4gICAgICAgIGZvciAoaz1pOyBrIDwgbTsgaysrKSB1W2tdW2pdKz1mKnVba11baV07XG4gICAgICB9XG4gICAgICBmb3IgKGo9aTsgaiA8IG07IGorKykgdVtqXVtpXSA9IHVbal1baV0vZztcbiAgICB9XG4gICAgZWxzZVxuICAgICAgZm9yIChqPWk7IGogPCBtOyBqKyspIHVbal1baV0gPSAwO1xuICAgIHVbaV1baV0gKz0gMTtcbiAgfVxuXG4gIC8vIGRpYWdvbmFsaXphdGlvbiBvZiB0aGUgYmlkaWFnb25hbCBmb3JtXG4gIHByZWM9IHByZWMqeFxuICBmb3IgKGs9bi0xOyBrICE9IC0xOyBrKz0gLTEpXG4gIHtcbiAgICBmb3IgKHZhciBpdGVyYXRpb249MDsgaXRlcmF0aW9uIDwgaXRtYXg7IGl0ZXJhdGlvbisrKVxuICAgIHtcdC8vIHRlc3QgZiBzcGxpdHRpbmdcbiAgICAgIHZhciB0ZXN0X2NvbnZlcmdlbmNlID0gZmFsc2VcbiAgICAgIGZvciAobD1rOyBsICE9IC0xOyBsKz0gLTEpXG4gICAgICB7XG4gICAgICAgIGlmIChNYXRoLmFicyhlW2xdKSA8PSBwcmVjKVxuICAgICAgICB7XHR0ZXN0X2NvbnZlcmdlbmNlPSB0cnVlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBpZiAoTWF0aC5hYnMocVtsLTFdKSA8PSBwcmVjKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBpZiAoIXRlc3RfY29udmVyZ2VuY2UpXG4gICAgICB7XHQvLyBjYW5jZWxsYXRpb24gb2YgZVtsXSBpZiBsPjBcbiAgICAgICAgYz0gMC4wXG4gICAgICAgIHM9IDEuMFxuICAgICAgICB2YXIgbDE9IGwtMVxuICAgICAgICBmb3IgKGkgPWw7IGk8aysxOyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICBmPSBzKmVbaV1cbiAgICAgICAgICBlW2ldPSBjKmVbaV1cbiAgICAgICAgICBpZiAoTWF0aC5hYnMoZikgPD0gcHJlYylcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgZz0gcVtpXVxuICAgICAgICAgIGg9IHB5dGhhZyhmLGcpXG4gICAgICAgICAgcVtpXT0gaFxuICAgICAgICAgIGM9IGcvaFxuICAgICAgICAgIHM9IC1mL2hcbiAgICAgICAgICBmb3IgKGo9MDsgaiA8IG07IGorKylcbiAgICAgICAgICB7XG4gICAgICAgICAgICB5PSB1W2pdW2wxXVxuICAgICAgICAgICAgej0gdVtqXVtpXVxuICAgICAgICAgICAgdVtqXVtsMV0gPSAgeSpjKyh6KnMpXG4gICAgICAgICAgICB1W2pdW2ldID0gLXkqcysoeipjKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gdGVzdCBmIGNvbnZlcmdlbmNlXG4gICAgICB6PSBxW2tdXG4gICAgICBpZiAobD09IGspXG4gICAgICB7XHQvL2NvbnZlcmdlbmNlXG4gICAgICAgIGlmICh6PDAuMClcbiAgICAgICAge1x0Ly9xW2tdIGlzIG1hZGUgbm9uLW5lZ2F0aXZlXG4gICAgICAgICAgcVtrXT0gLXpcbiAgICAgICAgICBmb3IgKGo9MDsgaiA8IG47IGorKylcbiAgICAgICAgICAgIHZbal1ba10gPSAtdltqXVtrXVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrICAvL2JyZWFrIG91dCBvZiBpdGVyYXRpb24gbG9vcCBhbmQgbW92ZSBvbiB0byBuZXh0IGsgdmFsdWVcbiAgICAgIH1cbiAgICAgIGlmIChpdGVyYXRpb24gPj0gaXRtYXgtMSlcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBubyBjb252ZXJnZW5jZS4nXG4gICAgICAvLyBzaGlmdCBmcm9tIGJvdHRvbSAyeDIgbWlub3JcbiAgICAgIHg9IHFbbF1cbiAgICAgIHk9IHFbay0xXVxuICAgICAgZz0gZVtrLTFdXG4gICAgICBoPSBlW2tdXG4gICAgICBmPSAoKHkteikqKHkreikrKGctaCkqKGcraCkpLygyLjAqaCp5KVxuICAgICAgZz0gcHl0aGFnKGYsMS4wKVxuICAgICAgaWYgKGYgPCAwLjApXG4gICAgICAgIGY9ICgoeC16KSooeCt6KStoKih5LyhmLWcpLWgpKS94XG4gICAgICBlbHNlXG4gICAgICAgIGY9ICgoeC16KSooeCt6KStoKih5LyhmK2cpLWgpKS94XG4gICAgICAvLyBuZXh0IFFSIHRyYW5zZm9ybWF0aW9uXG4gICAgICBjPSAxLjBcbiAgICAgIHM9IDEuMFxuICAgICAgZm9yIChpPWwrMTsgaTwgaysxOyBpKyspXG4gICAgICB7XG4gICAgICAgIGc9IGVbaV1cbiAgICAgICAgeT0gcVtpXVxuICAgICAgICBoPSBzKmdcbiAgICAgICAgZz0gYypnXG4gICAgICAgIHo9IHB5dGhhZyhmLGgpXG4gICAgICAgIGVbaS0xXT0gelxuICAgICAgICBjPSBmL3pcbiAgICAgICAgcz0gaC96XG4gICAgICAgIGY9IHgqYytnKnNcbiAgICAgICAgZz0gLXgqcytnKmNcbiAgICAgICAgaD0geSpzXG4gICAgICAgIHk9IHkqY1xuICAgICAgICBmb3IgKGo9MDsgaiA8IG47IGorKylcbiAgICAgICAge1xuICAgICAgICAgIHg9IHZbal1baS0xXVxuICAgICAgICAgIHo9IHZbal1baV1cbiAgICAgICAgICB2W2pdW2ktMV0gPSB4KmMreipzXG4gICAgICAgICAgdltqXVtpXSA9IC14KnMreipjXG4gICAgICAgIH1cbiAgICAgICAgej0gcHl0aGFnKGYsaClcbiAgICAgICAgcVtpLTFdPSB6XG4gICAgICAgIGM9IGYvelxuICAgICAgICBzPSBoL3pcbiAgICAgICAgZj0gYypnK3MqeVxuICAgICAgICB4PSAtcypnK2MqeVxuICAgICAgICBmb3IgKGo9MDsgaiA8IG07IGorKylcbiAgICAgICAge1xuICAgICAgICAgIHk9IHVbal1baS0xXVxuICAgICAgICAgIHo9IHVbal1baV1cbiAgICAgICAgICB1W2pdW2ktMV0gPSB5KmMreipzXG4gICAgICAgICAgdVtqXVtpXSA9IC15KnMreipjXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVbbF09IDAuMFxuICAgICAgZVtrXT0gZlxuICAgICAgcVtrXT0geFxuICAgIH1cbiAgfVxuXG4gIC8vdnQ9IHRyYW5zcG9zZSh2KVxuICAvL3JldHVybiAodSxxLHZ0KVxuICBmb3IgKGk9MDtpPHEubGVuZ3RoOyBpKyspXG4gICAgaWYgKHFbaV0gPCBwcmVjKSBxW2ldID0gMFxuXG4gIC8vc29ydCBlaWdlbnZhbHVlc1x0XG4gIGZvciAoaT0wOyBpPCBuOyBpKyspXG4gIHtcbiAgICAvL3dyaXRlbG4ocSlcbiAgICBmb3IgKGo9aS0xOyBqID49IDA7IGotLSlcbiAgICB7XG4gICAgICBpZiAocVtqXSA8IHFbaV0pXG4gICAgICB7XG4gICAgICAgIC8vICB3cml0ZWxuKGksJy0nLGopXG4gICAgICAgIGMgPSBxW2pdXG4gICAgICAgIHFbal0gPSBxW2ldXG4gICAgICAgIHFbaV0gPSBjXG4gICAgICAgIGZvcihrPTA7azx1Lmxlbmd0aDtrKyspIHsgdGVtcCA9IHVba11baV07IHVba11baV0gPSB1W2tdW2pdOyB1W2tdW2pdID0gdGVtcDsgfVxuICAgICAgICBmb3Ioaz0wO2s8di5sZW5ndGg7aysrKSB7IHRlbXAgPSB2W2tdW2ldOyB2W2tdW2ldID0gdltrXVtqXTsgdltrXVtqXSA9IHRlbXA7IH1cbi8vXHQgICB1LnN3YXBDb2xzKGksailcbi8vXHQgICB2LnN3YXBDb2xzKGksailcbiAgICAgICAgaSA9IGpcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1U6dSxTOnEsVjp2fVxufTtcbiJdLCJuYW1lcyI6WyJudW1lcmljIiwiZXhwb3J0cyIsImdsb2JhbCIsInZlcnNpb24iLCJiZW5jaCIsImYiLCJpbnRlcnZhbCIsInQxIiwidDIiLCJuIiwiaSIsIkRhdGUiLCJfbXlJbmRleE9mIiwidyIsImxlbmd0aCIsImsiLCJteUluZGV4T2YiLCJBcnJheSIsInByb3RvdHlwZSIsImluZGV4T2YiLCJGdW5jdGlvbiIsInByZWNpc2lvbiIsImxhcmdlQXJyYXkiLCJwcmV0dHlQcmludCIsIngiLCJmbXRudW0iLCJpc05hTiIsImlzRmluaXRlIiwic2NhbGUiLCJNYXRoIiwiZmxvb3IiLCJsb2ciLCJub3JtYWxpemVkIiwicG93IiwiYmFzaWMiLCJ0b1ByZWNpc2lvbiIsInBhcnNlRmxvYXQiLCJ0b1N0cmluZyIsInJldCIsImZvbyIsInB1c2giLCJqb2luIiwiYSIsImIiLCJjIiwiZCIsImZsYWciLCJoYXNPd25Qcm9wZXJ0eSIsInBhcnNlRGF0ZSIsInBhcnNlIiwicmVwbGFjZSIsIkVycm9yIiwicGFyc2VGbG9hdF8iLCJwYXJzZUNTViIsInQiLCJzcGxpdCIsImoiLCJwYXQiLCJwYXRudW0iLCJzdHJpcHBlciIsInN1YnN0ciIsImNvdW50IiwiYmFyIiwibWF0Y2giLCJiYXoiLCJ0ZXN0IiwidG9DU1YiLCJBIiwicyIsImRpbSIsIm0iLCJyb3ciLCJnZXRVUkwiLCJ1cmwiLCJjbGllbnQiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJzZW5kIiwiaW1hZ2VVUkwiLCJpbWciLCJiYXNlNjQiLCJ5IiwieiIsInAiLCJxIiwiciIsImtleSIsImNoYXJBdCIsImNyYzMyQXJyYXkiLCJmcm9tIiwidG8iLCJ0YWJsZSIsImNyYyIsImgiLCJzMSIsInMyIiwibmV4dCIsImFkbGVyMzIiLCJjcmMzMiIsInN0cmVhbSIsInJvdW5kIiwiX2RpbSIsIm1hcHJlZHVjZSIsImJvZHkiLCJpbml0IiwibWFwcmVkdWNlMiIsInNldHVwIiwic2FtZSIsInJlcCIsInYiLCJkb3RNTXNtYWxsIiwid29vIiwiaTAiLCJrMCIsInAwIiwicjAiLCJfZ2V0Q29sIiwiZG90TU1iaWciLCJnYyIsInhqIiwiVlYiLCJkb3RWViIsImRvdE1WIiwiZG90Vk0iLCJzMyIsImFjY3VtIiwiaTEiLCJkb3QiLCJtdWxWUyIsIm11bFNWIiwiZGlhZyIsIkFpIiwiZ2V0RGlhZyIsIm1pbiIsImlkZW50aXR5IiwicG9pbnR3aXNlIiwicGFyYW1zIiwiZnVuIiwiYXZlYyIsInRoZXZlYyIsImhhdmVyZXQiLCJzdWJzdHJpbmciLCJhcHBseSIsInBvaW50d2lzZTIiLCJfYmlmb3JlYWNoIiwiX2JpZm9yZWFjaDIiLCJfZm9yZWFjaCIsIl9mb3JlYWNoMiIsIm9wczIiLCJhZGQiLCJzdWIiLCJtdWwiLCJkaXYiLCJtb2QiLCJhbmQiLCJvciIsImVxIiwibmVxIiwibHQiLCJndCIsImxlcSIsImdlcSIsImJhbmQiLCJib3IiLCJieG9yIiwibHNoaWZ0IiwicnNoaWZ0IiwicnJzaGlmdCIsIm9wc2VxIiwiYWRkZXEiLCJzdWJlcSIsIm11bGVxIiwiZGl2ZXEiLCJtb2RlcSIsImxzaGlmdGVxIiwicnNoaWZ0ZXEiLCJycnNoaWZ0ZXEiLCJiYW5kZXEiLCJib3JlcSIsImJ4b3JlcSIsIm1hdGhmdW5zIiwibWF0aGZ1bnMyIiwib3BzMSIsIm5lZyIsIm5vdCIsImJub3QiLCJjbG9uZSIsIm1hcHJlZHVjZXJzIiwiYW55IiwiYWxsIiwic3VtIiwicHJvZCIsIm5vcm0yU3F1YXJlZCIsIm5vcm1pbmYiLCJub3JtMSIsInN1cCIsImluZiIsIm8iLCJjb2RlIiwiY29kZWVxIiwiY2FsbCIsInRydW5jVlYiLCJ0cnVuY1ZTIiwidHJ1bmNTViIsInRydW5jIiwiaW52IiwiYWJzIiwiQWoiLCJJIiwiSWkiLCJJaiIsInYwIiwiZGV0IiwiYWxwaGEiLCJ0ZW1wIiwiazEiLCJrMiIsImszIiwidHJhbnNwb3NlIiwiQTAiLCJBMSIsIkJqIiwibmVndHJhbnNwb3NlIiwiX3JhbmRvbSIsInJuZCIsInJhbmRvbSIsIm5vcm0yIiwic3FydCIsImxpbnNwYWNlIiwibWF4IiwiZ2V0QmxvY2siLCJzZXRCbG9jayIsIkIiLCJnZXRSYW5nZSIsIkoiLCJCaSIsIkFJIiwiYmxvY2tNYXRyaXgiLCJYIiwiTSIsIk4iLCJYaWoiLCJaIiwiWkkiLCJsIiwiWGlqayIsInRlbnNvciIsInhpIiwiVCIsIlRiaW5vcCIsInJyIiwicmMiLCJjciIsImNjIiwiaW8iLCJyZWNpcHJvY2FsIiwidHJhbnNqdWdhdGUiLCJUdW5vcCIsImV4cCIsImNvbmoiLCJzaW4iLCJjb3MiLCJSeCIsIlJ5IiwiQXgiLCJBeSIsIkFpeCIsIkFpeSIsIkFqeCIsIkFqeSIsIlJpeCIsIlJpeSIsIlJqeCIsIlJqeSIsImQxIiwiYXgiLCJheSIsImJ4IiwiYnkiLCJnZXQiLCJpayIsInNldCIsInZ4IiwidnkiLCJ1bmRlZmluZWQiLCJnZXRSb3dzIiwicngiLCJyeSIsInNldFJvd3MiLCJnZXRSb3ciLCJzZXRSb3ciLCJlaWciLCJob3VzZSIsInRvVXBwZXJIZXNzZW5iZXJnIiwibWUiLCJDIiwiQ2kiLCJRIiwiUWkiLCJIIiwiZXBzaWxvbiIsIlFSRnJhbmNpcyIsIm1heGl0ZXIiLCJIMCIsInRyIiwiSGxvYyIsIkhpIiwiaXRlciIsIlFIMSIsIlFIMiIsImNvbmNhdCIsIlFIIiwiUUIiLCJRMCIsInAxIiwicDIiLCJkaXNjIiwibjEiLCJuMiIsIlIiLCJFIiwiUmsiLCJSaiIsImxhbWJkYSIsImNjc1NwYXJzZSIsImNvdW50cyIsInBhcnNlSW50IiwiQXYiLCJjY3NGdWxsIiwiY2NzRGltIiwiajAiLCJqMSIsImNjc1RTb2x2ZSIsImJqIiwiZGZzIiwibDAiLCJsMSIsImNjc0RGUyIsIlBpbnYiLCJrbSIsImsxMSIsImNjc0xQU29sdmUiLCJCdiIsImNjc0xVUDEiLCJ0aHJlc2hvbGQiLCJMIiwiVSIsIkxpIiwiTGoiLCJMdiIsIlVpIiwiVWoiLCJVdiIsImUiLCJLIiwic29sIiwiUCIsImNjc0RGUzAiLCJjY3NMUFNvbHZlMCIsImNjc0xVUDAiLCJjY3NMVVAiLCJjY3NHZXRCbG9jayIsImpxIiwiaXAiLCJmbGFncyIsInEwIiwicTEiLCJjY3NEb3QiLCJzQSIsInNCIiwiQ2oiLCJDdiIsImNjc0xVUFNvbHZlIiwiTFVQIiwiWGkiLCJYaiIsIlh2IiwiY2NzYmlub3AiLCJldmFsIiwiY2NzU2NhdHRlciIsIlJpIiwiUnYiLCJwdHIiLCJzbGljZSIsIkFpaSIsImNjc0dhdGhlciIsInNkaW0iLCJzY2xvbmUiLCJzZGlhZyIsImkyIiwiaTMiLCJzaWRlbnRpdHkiLCJzdHJhbnNwb3NlIiwic0xVUCIsInRvbCIsInNkb3RNTSIsImRvdE1NIiwiQlQiLCJCVGsiLCJyZXRpIiwic2RvdE1WIiwic2RvdFZNIiwic2RvdFZWIiwic2RvdCIsInNzY2F0dGVyIiwic2NhdHRlciIsIlYiLCJWaWoiLCJzZ2F0aGVyIiwiZ2F0aGVyIiwicG9wIiwiY0xVIiwiTFUiLCJsZWZ0IiwiSW5maW5pdHkiLCJyaWdodCIsImNvdW50TCIsImNvdW50VSIsImNMVXNvbHZlIiwiTFVzb2x2ZSIsImx1IiwiY2dyaWQiLCJncmlkIiwic2hhcGUiLCJjZGVsc3EiLCJkZWxzcSIsImciLCJkaXIiLCJjZG90TVYiLCJTcGxpbmUiLCJ5bCIsInlyIiwia2wiLCJrciIsIl9hdCIsIngxIiwiYXQiLCJ4MCIsIm1pZCIsImRpZmYiLCJkeCIsImR5IiwiemwiLCJ6ciIsInBsIiwicHIiLCJyb290cyIsInNxciIsImhldmFsIiwieTAiLCJ5MSIsImFpIiwiYmkiLCJjaSIsImRpIiwicmkiLCJEIiwiY3giLCJzdG9wcyIsInowIiwiejEiLCJ6bSIsInQwIiwidG0iLCJzaWRlIiwic3BsaW5lIiwia24iLCJmZnRwb3cyIiwieGUiLCJ5ZSIsInhvIiwieW8iLCJzaSIsIl9pZmZ0cG93MiIsImlmZnRwb3cyIiwiY29udnBvdzIiLCJheGkiLCJieGkiLCJheWkiLCJieWkiLCJmZnQiLCJsb2cyIiwiY2VpbCIsImN5IiwibmhhbGYiLCJZIiwiaWZmdCIsImdyYWRpZW50IiwiZjAiLCJmMSIsImYyIiwiZXJyZXN0Iiwicm91bmRvZmYiLCJlcHMiLCJpdCIsImQyIiwidW5jbWluIiwibWF4aXQiLCJjYWxsYmFjayIsIm9wdGlvbnMiLCJncmFkIiwiZGYwIiwic3RlcCIsImcwIiwiZzEiLCJIMSIsIkhpbnYiLCJ0ZW4iLCJpc2Zpbml0ZSIsIkh5IiwiSHMiLCJ5cyIsIm5zdGVwIiwibXNnIiwic29sdXRpb24iLCJpbnZIZXNzaWFuIiwiaXRlcmF0aW9ucyIsIm1lc3NhZ2UiLCJEb3ByaSIsInltaWQiLCJldmVudHMiLCJ4cyIsInhoIiwieWgiLCJkb3ByaSIsImV2ZW50IiwiazQiLCJrNSIsIms2IiwiazciLCJBMiIsIkEzIiwiQTQiLCJBNSIsIkE2IiwiYm0iLCJlciIsImVyaW5mIiwiZTAiLCJlMSIsImV2IiwieWkiLCJ4bCIsInhyIiwieGMiLCJ5YyIsImVuIiwiZWkiLCJzbCIsInNyIiwiZmFzdCIsImFic0FqayIsIkFrayIsIkFrIiwiUGsiLCJQaSIsIkxVaSIsIkxVaWkiLCJ0bXAiLCJzb2x2ZSIsImVjaGVsb25pemUiLCJfX3NvbHZlTFAiLCJ1bmJvdW5kZWQiLCJjYiIsIkFUIiwic3ZkIiwibm9ybSIsImRvdGNjIiwiYTEiLCJBZyIsIl9zb2x2ZUxQIiwiYzAiLCJiMCIsIk5hTiIsInNvbHZlTFAiLCJBZXEiLCJiZXEiLCJBZXEyIiwiYjQiLCJjMSIsImMyIiwiYzQiLCJTIiwieDIiLCJNUFN0b0xQIiwiTVBTIiwiU3RyaW5nIiwic3RhdGUiLCJzdGF0ZXMiLCJyb3dzIiwic2lnbiIsInJsIiwidmFycyIsIm52IiwibmFtZSIsImVyciIsIncwIiwic2VlZHJhbmRvbSIsInBvb2wiLCJtYXRoIiwid2lkdGgiLCJjaHVua3MiLCJzaWduaWZpY2FuY2UiLCJvdmVyZmxvdyIsInN0YXJ0ZGVub20iLCJzZWVkIiwidXNlX2VudHJvcHkiLCJhcmM0IiwibWl4a2V5IiwiZmxhdHRlbiIsImFyZ3VtZW50cyIsImdldFRpbWUiLCJ3aW5kb3ciLCJBUkM0IiwidSIsImtleWxlbiIsImxvd2JpdHMiLCJnZXRuZXh0Iiwib2JqIiwiZGVwdGgiLCJyZXN1bHQiLCJwcm9wIiwidHlwIiwic21lYXIiLCJjaGFyQ29kZUF0IiwiZnJvbUNoYXJDb2RlIiwiYmFzZTB0bzEiLCJiYXNlMXRvMCIsImRwb3JpIiwibGRhIiwia3AxIiwiZHBvc2wiLCJrYiIsImRwb2ZhIiwiaW5mbyIsImptMSIsInFwZ2VuMiIsImRtYXQiLCJkdmVjIiwiZmRkbWF0IiwiY3J2YWwiLCJhbWF0IiwiYnZlYyIsImZkYW1hdCIsIm1lcSIsImlhY3QiLCJuYWN0Iiwid29yayIsImllcnIiLCJpdDEiLCJpd3p2IiwiaXdydiIsIml3cm0iLCJpd3N2IiwiaXd1diIsIm52bCIsIml3bmJ2IiwidHQiLCJncyIsIm51IiwidDFpbmYiLCJ0Mm1pbiIsInZzbWFsbCIsInRtcGEiLCJ0bXBiIiwiZ28iLCJmbl9nb3RvXzUwIiwiZm5fZ290b181NSIsImZuX2dvdG9fNzk3IiwiZm5fZ290b183OTgiLCJmbl9nb3RvXzc5OSIsInNvbHZlUVAiLCJEbWF0IiwiQW1hdCIsImZhY3Rvcml6ZWQiLCJ2YWx1ZSIsInVuY29uc3RyYWluZWRfc29sdXRpb24iLCJwcmVjIiwidG9sZXJhbmNlIiwiaXRtYXgiLCJweXRoYWciLCJpdGVyYXRpb24iLCJ0ZXN0X2NvbnZlcmdlbmNlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUVBLElBQUlBLFVBQVUsQUFBQyxPQUFPQyxZQUFZLGNBQWMsU0FBU0QsWUFBVyxJQUFJQztBQUN4RSxJQUFHLE9BQU9DLFdBQVcsYUFBYTtJQUFFQSxPQUFPRixPQUFPLEdBQUdBO0FBQVM7QUFFOURBLFFBQVFHLE9BQU8sR0FBRztBQUVsQix1QkFBdUI7QUFDdkJILFFBQVFJLEtBQUssR0FBRyxTQUFTQSxNQUFPQyxDQUFDLEVBQUNDLFFBQVE7SUFDeEMsSUFBSUMsSUFBR0MsSUFBR0MsR0FBRUM7SUFDWixJQUFHLE9BQU9KLGFBQWEsYUFBYTtRQUFFQSxXQUFXO0lBQUk7SUFDckRHLElBQUk7SUFDSkYsS0FBSyxJQUFJSTtJQUNULE1BQU0sRUFBRztRQUNQRixLQUFHO1FBQ0gsSUFBSUMsSUFBRUQsR0FBRUMsSUFBRSxHQUFFQSxLQUFHLEVBQUc7WUFBRUw7WUFBS0E7WUFBS0E7WUFBS0E7UUFBSztRQUN4QyxNQUFNSyxJQUFFLEVBQUc7WUFBRUw7WUFBS0s7UUFBSztRQUN2QkYsS0FBSyxJQUFJRztRQUNULElBQUdILEtBQUdELEtBQUtELFVBQVU7SUFDdkI7SUFDQSxJQUFJSSxJQUFFRCxHQUFFQyxJQUFFLEdBQUVBLEtBQUcsRUFBRztRQUFFTDtRQUFLQTtRQUFLQTtRQUFLQTtJQUFLO0lBQ3hDLE1BQU1LLElBQUUsRUFBRztRQUFFTDtRQUFLSztJQUFLO0lBQ3ZCRixLQUFLLElBQUlHO0lBQ1Qs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WTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFDcEY7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUNwRjtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQ3BGO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFDcEY7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUNwRjtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQ3BGO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFDcEY7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUNwRjtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQ3BGO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFDcEY7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUNwRjtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQ3BGO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFDcEY7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUNwRjtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQ3BGO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFDcEY7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUNwRjtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQ3BGO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFDcEY7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUNwRjtZQUFZO1lBQVk7WUFBWTtZQUFZO1lBQVk7WUFBWTtZQUFZO1NBQVc7UUFFakcsSUFBSUMsTUFBTSxDQUFDLEdBQUdYLElBQUksR0FBR3hFLElBQUlpQyxF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