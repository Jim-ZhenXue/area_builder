/*
 Copyright 2014 David Bau.

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */ (function(pool, math) {
    //
    // The following constants are related to IEEE 754 limits.
    //
    var global = this, width = 256, chunks = 6, digits = 52, rngname = 'random', startdenom = math.pow(width, chunks), significance = math.pow(2, digits), overflow = significance * 2, mask = width - 1, nodecrypto; // node.js crypto module, initialized at the bottom.
    //
    // seedrandom()
    // This is the seedrandom function described above.
    //
    function seedrandom(seed, options, callback) {
        var key = [];
        options = options == true ? {
            entropy: true
        } : options || {};
        // Flatten the seed string or build one from local entropy if needed.
        var shortseed = mixkey(flatten(options.entropy ? [
            seed,
            tostring(pool)
        ] : seed == null ? autoseed() : seed, 3), key);
        // Use the seed to initialize an ARC4 generator.
        var arc4 = new ARC4(key);
        // This function returns a random double in [0, 1) that contains
        // randomness in every bit of the mantissa of the IEEE 754 value.
        var prng = function() {
            var n = arc4.g(chunks), d = startdenom, x = 0; //   and no 'extra last byte'.
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
        prng.int32 = function() {
            return arc4.g(4) | 0;
        };
        prng.quick = function() {
            return arc4.g(4) / 0x100000000;
        };
        prng.double = prng;
        // Mix the randomness into accumulated entropy.
        mixkey(tostring(arc4.S), pool);
        // Calling convention: what to return as a function of prng, seed, is_math.
        return (options.pass || callback || function(prng, seed, is_math_call, state) {
            if (state) {
                // Load the arc4 state from the given state if it has an S array.
                if (state.S) {
                    copy(state, arc4);
                }
                // Only provide the .state method if requested via options.state.
                prng.state = function() {
                    return copy(arc4, {});
                };
            }
            // If called as a method of Math (Math.seedrandom()), mutate
            // Math.random because that is how seedrandom.js has worked since v1.0.
            if (is_math_call) {
                math[rngname] = prng;
                return seed;
            } else {
                return prng;
            }
        })(prng, shortseed, 'global' in options ? options.global : this == math, options.state);
    }
    math['seed' + rngname] = seedrandom;
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
    function ARC4(key) {
        var t, keylen = key.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
        // The empty key [] is treated as [0].
        if (!keylen) {
            key = [
                keylen++
            ];
        }
        // Set up S using the standard key scheduling algorithm.
        while(i < width){
            s[i] = i++;
        }
        for(i = 0; i < width; i++){
            s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
            s[j] = t;
        }
        // The "g" method returns the next (count) outputs as one number.
        (me.g = function(count) {
            // Using instance members instead of closure state nearly doubles speed.
            var t, r = 0, i = me.i, j = me.j, s = me.S;
            while(count--){
                t = s[i = mask & i + 1];
                r = r * width + s[mask & (s[i] = s[j = mask & j + t]) + (s[j] = t)];
            }
            me.i = i;
            me.j = j;
            return r;
        // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
        })(width);
    }
    //
    // copy()
    // Copies internal state of ARC4 to or from a plain object.
    //
    function copy(f, t) {
        t.i = f.i;
        t.j = f.j;
        t.S = f.S.slice();
        return t;
    }
    ;
    //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //
    function flatten(obj, depth) {
        var result = [], typ = typeof obj, prop;
        if (depth && typ == 'object') {
            for(prop in obj){
                try {
                    result.push(flatten(obj[prop], depth - 1));
                } catch (e) {}
            }
        }
        return result.length ? result : typ == 'string' ? obj : obj + '\0';
    }
    //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //
    function mixkey(seed, key) {
        var stringseed = seed + '', smear, j = 0;
        while(j < stringseed.length){
            key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
        }
        return tostring(key);
    }
    //
    // autoseed()
    // Returns an object for autoseeding, using window.crypto and Node crypto
    // module if available.
    //
    function autoseed() {
        try {
            if (nodecrypto) {
                return tostring(nodecrypto.randomBytes(width));
            }
            var out = new Uint8Array(width);
            (global.crypto || global.msCrypto).getRandomValues(out);
            return tostring(out);
        } catch (e) {
            var browser = global.navigator, plugins = browser && browser.plugins;
            return [
                +new Date,
                global,
                plugins,
                global.screen,
                tostring(pool)
            ];
        }
    }
    //
    // tostring()
    // Converts an array of charcodes to a string
    //
    function tostring(a) {
        return String.fromCharCode.apply(0, a);
    }
    //
    // When seedrandom.js is loaded, we immediately mix a few bits
    // from the built-in RNG into the entropy pool.  Because we do
    // not want to interfere with deterministic PRNG state later,
    // seedrandom will not call math.random on its own again after
    // initialization.
    //
    mixkey(math.random(), pool);
    //
    // Nodejs and AMD support: export the implementation as a module using
    // either convention.
    //
    if (typeof module == 'object' && module.exports) {
        module.exports = seedrandom;
        // When in node.js, try using crypto package for autoseeding.
        try {
            nodecrypto = require('crypto');
        } catch (ex) {}
    } else if (typeof define == 'function' && define.amd) {
        define(function() {
            return seedrandom;
        });
    }
// End anonymous scope, and pass initial values.
})([], Math // math: package containing random, pow, and seedrandom
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvc2VlZHJhbmRvbS0yLjQuMi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDE0IERhdmlkIEJhdS5cblxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbiBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFXG4gU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbiAqL1xuXG4oZnVuY3Rpb24oIHBvb2wsIG1hdGggKSB7XG4vL1xuLy8gVGhlIGZvbGxvd2luZyBjb25zdGFudHMgYXJlIHJlbGF0ZWQgdG8gSUVFRSA3NTQgbGltaXRzLlxuLy9cbiAgdmFyIGdsb2JhbCA9IHRoaXMsXG4gICAgd2lkdGggPSAyNTYsICAgICAgICAvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XG4gICAgY2h1bmtzID0gNiwgICAgICAgICAvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXG4gICAgZGlnaXRzID0gNTIsICAgICAgICAvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXG4gICAgcm5nbmFtZSA9ICdyYW5kb20nLCAvLyBybmduYW1lOiBuYW1lIGZvciBNYXRoLnJhbmRvbSBhbmQgTWF0aC5zZWVkcmFuZG9tXG4gICAgc3RhcnRkZW5vbSA9IG1hdGgucG93KCB3aWR0aCwgY2h1bmtzICksXG4gICAgc2lnbmlmaWNhbmNlID0gbWF0aC5wb3coMiwgZGlnaXRzKSxcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXG4gICAgbWFzayA9IHdpZHRoIC0gMSxcbiAgICBub2RlY3J5cHRvOyAgICAgICAgIC8vIG5vZGUuanMgY3J5cHRvIG1vZHVsZSwgaW5pdGlhbGl6ZWQgYXQgdGhlIGJvdHRvbS5cblxuLy9cbi8vIHNlZWRyYW5kb20oKVxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXG4vL1xuICBmdW5jdGlvbiBzZWVkcmFuZG9tKCBzZWVkLCBvcHRpb25zLCBjYWxsYmFjayApIHtcbiAgICB2YXIga2V5ID0gW107XG4gICAgb3B0aW9ucyA9IChvcHRpb25zID09IHRydWUpID8geyBlbnRyb3B5OiB0cnVlIH0gOiAob3B0aW9ucyB8fCB7fSk7XG5cbiAgICAvLyBGbGF0dGVuIHRoZSBzZWVkIHN0cmluZyBvciBidWlsZCBvbmUgZnJvbSBsb2NhbCBlbnRyb3B5IGlmIG5lZWRlZC5cbiAgICB2YXIgc2hvcnRzZWVkID0gbWl4a2V5KGZsYXR0ZW4oXG4gICAgICBvcHRpb25zLmVudHJvcHkgPyBbIHNlZWQsIHRvc3RyaW5nKCBwb29sICkgXSA6XG4gICAgICAoc2VlZCA9PSBudWxsKSA/IGF1dG9zZWVkKCkgOiBzZWVkLCAzICksIGtleSApO1xuXG4gICAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXG4gICAgdmFyIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xuICAgIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXG4gICAgdmFyIHBybmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyksICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxuICAgICAgICBkID0gc3RhcnRkZW5vbSwgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXG4gICAgICAgIHggPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBhbmQgbm8gJ2V4dHJhIGxhc3QgYnl0ZScuXG4gICAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcbiAgICAgICAgbiA9IChuICsgeCkgKiB3aWR0aDsgICAgICAgICAgICAgIC8vICAgc2hpZnRpbmcgbnVtZXJhdG9yIGFuZFxuICAgICAgICBkICo9IHdpZHRoOyAgICAgICAgICAgICAgICAgICAgICAgLy8gICBkZW5vbWluYXRvciBhbmQgZ2VuZXJhdGluZyBhXG4gICAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxuICAgICAgfVxuICAgICAgd2hpbGUgKG4gPj0gb3ZlcmZsb3cpIHsgICAgICAgICAgICAgLy8gVG8gYXZvaWQgcm91bmRpbmcgdXAsIGJlZm9yZSBhZGRpbmdcbiAgICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXG4gICAgICAgIGQgLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJpZ2h0IHVzaW5nIGludGVnZXIgbWF0aCB1bnRpbFxuICAgICAgICB4ID4+Pj0gMTsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB3ZSBoYXZlIGV4YWN0bHkgdGhlIGRlc2lyZWQgYml0cy5cbiAgICAgIH1cbiAgICAgIHJldHVybiAobiArIHgpIC8gZDsgICAgICAgICAgICAgICAgIC8vIEZvcm0gdGhlIG51bWJlciB3aXRoaW4gWzAsIDEpLlxuICAgIH07XG5cbiAgICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoIDQgKSB8IDA7IH1cbiAgICBwcm5nLnF1aWNrID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoIDQgKSAvIDB4MTAwMDAwMDAwOyB9XG4gICAgcHJuZy5kb3VibGUgPSBwcm5nO1xuXG4gICAgLy8gTWl4IHRoZSByYW5kb21uZXNzIGludG8gYWNjdW11bGF0ZWQgZW50cm9weS5cbiAgICBtaXhrZXkoIHRvc3RyaW5nKCBhcmM0LlMgKSwgcG9vbCApO1xuXG4gICAgLy8gQ2FsbGluZyBjb252ZW50aW9uOiB3aGF0IHRvIHJldHVybiBhcyBhIGZ1bmN0aW9uIG9mIHBybmcsIHNlZWQsIGlzX21hdGguXG4gICAgcmV0dXJuIChvcHRpb25zLnBhc3MgfHwgY2FsbGJhY2sgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCBwcm5nLCBzZWVkLCBpc19tYXRoX2NhbGwsIHN0YXRlICkge1xuICAgICAgICAgICAgICBpZiAoIHN0YXRlICkge1xuICAgICAgICAgICAgICAgIC8vIExvYWQgdGhlIGFyYzQgc3RhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RhdGUgaWYgaXQgaGFzIGFuIFMgYXJyYXkuXG4gICAgICAgICAgICAgICAgaWYgKCBzdGF0ZS5TICkgeyBjb3B5KCBzdGF0ZSwgYXJjNCApOyB9XG4gICAgICAgICAgICAgICAgLy8gT25seSBwcm92aWRlIHRoZSAuc3RhdGUgbWV0aG9kIGlmIHJlcXVlc3RlZCB2aWEgb3B0aW9ucy5zdGF0ZS5cbiAgICAgICAgICAgICAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KCBhcmM0LCB7fSApOyB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBJZiBjYWxsZWQgYXMgYSBtZXRob2Qgb2YgTWF0aCAoTWF0aC5zZWVkcmFuZG9tKCkpLCBtdXRhdGVcbiAgICAgICAgICAgICAgLy8gTWF0aC5yYW5kb20gYmVjYXVzZSB0aGF0IGlzIGhvdyBzZWVkcmFuZG9tLmpzIGhhcyB3b3JrZWQgc2luY2UgdjEuMC5cbiAgICAgICAgICAgICAgaWYgKCBpc19tYXRoX2NhbGwgKSB7XG4gICAgICAgICAgICAgICAgbWF0aFsgcm5nbmFtZSBdID0gcHJuZztcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VlZDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgaXQgaXMgYSBuZXdlciBjYWxsaW5nIGNvbnZlbnRpb24sIHNvIHJldHVybiB0aGVcbiAgICAgICAgICAgICAgLy8gcHJuZyBkaXJlY3RseS5cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBybmc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKFxuICAgICAgcHJuZyxcbiAgICAgIHNob3J0c2VlZCxcbiAgICAgICdnbG9iYWwnIGluIG9wdGlvbnMgPyBvcHRpb25zLmdsb2JhbCA6ICh0aGlzID09IG1hdGgpLFxuICAgICAgb3B0aW9ucy5zdGF0ZSApO1xuICB9XG5cbiAgbWF0aFsgJ3NlZWQnICsgcm5nbmFtZSBdID0gc2VlZHJhbmRvbTtcblxuLy9cbi8vIEFSQzRcbi8vXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cbi8vXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxuLy9cbiAgZnVuY3Rpb24gQVJDNChrZXkpIHtcbiAgICB2YXIgdCwga2V5bGVuID0ga2V5Lmxlbmd0aCxcbiAgICAgIG1lID0gdGhpcywgaSA9IDAsIGogPSBtZS5pID0gbWUuaiA9IDAsIHMgPSBtZS5TID0gW107XG5cbiAgICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxuICAgIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cblxuICAgIC8vIFNldCB1cCBTIHVzaW5nIHRoZSBzdGFuZGFyZCBrZXkgc2NoZWR1bGluZyBhbGdvcml0aG0uXG4gICAgd2hpbGUgKGkgPCB3aWR0aCkge1xuICAgICAgc1tpXSA9IGkrKztcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICAgIHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyBrZXlbaSAlIGtleWxlbl0gKyAodCA9IHNbaV0pKV07XG4gICAgICBzW2pdID0gdDtcbiAgICB9XG5cbiAgICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXG4gICAgKG1lLmcgPSBmdW5jdGlvbihjb3VudCkge1xuICAgICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXG4gICAgICB2YXIgdCwgciA9IDAsXG4gICAgICAgIGkgPSBtZS5pLCBqID0gbWUuaiwgcyA9IG1lLlM7XG4gICAgICB3aGlsZSAoY291bnQtLSkge1xuICAgICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xuICAgICAgICByID0gciAqIHdpZHRoICsgc1ttYXNrICYgKChzW2ldID0gc1tqID0gbWFzayAmIChqICsgdCldKSArIChzW2pdID0gdCkpXTtcbiAgICAgIH1cbiAgICAgIG1lLmkgPSBpOyBtZS5qID0gajtcbiAgICAgIHJldHVybiByO1xuICAgICAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5LCB0aGUgZnVuY3Rpb24gY2FsbCBiZWxvdyBhdXRvbWF0aWNhbGx5XG4gICAgICAvLyBkaXNjYXJkcyBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy4gIFRoaXMgaXMgY2FsbGVkIFJDNC1kcm9wWzI1Nl0uXG4gICAgICAvLyBTZWUgaHR0cDovL2dvb2dsZS5jb20vc2VhcmNoP3E9cnNhK2ZsdWhyZXIrcmVzcG9uc2UmYnRuSVxuICAgIH0pKHdpZHRoKTtcbiAgfVxuXG4vL1xuLy8gY29weSgpXG4vLyBDb3BpZXMgaW50ZXJuYWwgc3RhdGUgb2YgQVJDNCB0byBvciBmcm9tIGEgcGxhaW4gb2JqZWN0LlxuLy9cbiAgZnVuY3Rpb24gY29weSggZiwgdCApIHtcbiAgICB0LmkgPSBmLmk7XG4gICAgdC5qID0gZi5qO1xuICAgIHQuUyA9IGYuUy5zbGljZSgpO1xuICAgIHJldHVybiB0O1xuICB9O1xuXG4vL1xuLy8gZmxhdHRlbigpXG4vLyBDb252ZXJ0cyBhbiBvYmplY3QgdHJlZSB0byBuZXN0ZWQgYXJyYXlzIG9mIHN0cmluZ3MuXG4vL1xuICBmdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgpIHtcbiAgICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKSwgcHJvcDtcbiAgICBpZiAoIGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0JyApIHtcbiAgICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiB0eXAgPT0gJ3N0cmluZycgPyBvYmogOiBvYmogKyAnXFwwJyk7XG4gIH1cblxuLy9cbi8vIG1peGtleSgpXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXG4vLyByZXR1cm5zIGEgc2hvcnRlbmVkIHN0cmluZyBzZWVkIHRoYXQgaXMgZXF1aXZhbGVudCB0byB0aGUgcmVzdWx0IGtleS5cbi8vXG4gIGZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcbiAgICB2YXIgc3RyaW5nc2VlZCA9IHNlZWQgKyAnJywgc21lYXIsIGogPSAwO1xuICAgIHdoaWxlIChqIDwgc3RyaW5nc2VlZC5sZW5ndGgpIHtcbiAgICAgIGtleVttYXNrICYgal0gPVxuICAgICAgICBtYXNrICYgKChzbWVhciBePSBrZXlbIG1hc2sgJiBqIF0gKiAxOSkgKyBzdHJpbmdzZWVkLmNoYXJDb2RlQXQoIGorKyApKTtcbiAgICB9XG4gICAgcmV0dXJuIHRvc3RyaW5nKGtleSk7XG4gIH1cblxuLy9cbi8vIGF1dG9zZWVkKClcbi8vIFJldHVybnMgYW4gb2JqZWN0IGZvciBhdXRvc2VlZGluZywgdXNpbmcgd2luZG93LmNyeXB0byBhbmQgTm9kZSBjcnlwdG9cbi8vIG1vZHVsZSBpZiBhdmFpbGFibGUuXG4vL1xuICBmdW5jdGlvbiBhdXRvc2VlZCgpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCBub2RlY3J5cHRvICkgeyByZXR1cm4gdG9zdHJpbmcoIG5vZGVjcnlwdG8ucmFuZG9tQnl0ZXMoIHdpZHRoICkgKTsgfVxuICAgICAgdmFyIG91dCA9IG5ldyBVaW50OEFycmF5KCB3aWR0aCApO1xuICAgICAgKGdsb2JhbC5jcnlwdG8gfHwgZ2xvYmFsLm1zQ3J5cHRvKS5nZXRSYW5kb21WYWx1ZXMoIG91dCApO1xuICAgICAgcmV0dXJuIHRvc3RyaW5nKCBvdXQgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB2YXIgYnJvd3NlciA9IGdsb2JhbC5uYXZpZ2F0b3IsXG4gICAgICAgIHBsdWdpbnMgPSBicm93c2VyICYmIGJyb3dzZXIucGx1Z2lucztcbiAgICAgIHJldHVybiBbICtuZXcgRGF0ZSwgZ2xvYmFsLCBwbHVnaW5zLCBnbG9iYWwuc2NyZWVuLCB0b3N0cmluZyggcG9vbCApIF07XG4gICAgfVxuICB9XG5cbi8vXG4vLyB0b3N0cmluZygpXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcbi8vXG4gIGZ1bmN0aW9uIHRvc3RyaW5nKGEpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSgwLCBhKTtcbiAgfVxuXG4vL1xuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXG4vLyBub3Qgd2FudCB0byBpbnRlcmZlcmUgd2l0aCBkZXRlcm1pbmlzdGljIFBSTkcgc3RhdGUgbGF0ZXIsXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgbWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxuLy8gaW5pdGlhbGl6YXRpb24uXG4vL1xuICBtaXhrZXkobWF0aC5yYW5kb20oKSwgcG9vbCk7XG5cbi8vXG4vLyBOb2RlanMgYW5kIEFNRCBzdXBwb3J0OiBleHBvcnQgdGhlIGltcGxlbWVudGF0aW9uIGFzIGEgbW9kdWxlIHVzaW5nXG4vLyBlaXRoZXIgY29udmVudGlvbi5cbi8vXG4gIGlmICggKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2VlZHJhbmRvbTtcbiAgICAvLyBXaGVuIGluIG5vZGUuanMsIHRyeSB1c2luZyBjcnlwdG8gcGFja2FnZSBmb3IgYXV0b3NlZWRpbmcuXG4gICAgdHJ5IHtcbiAgICAgIG5vZGVjcnlwdG8gPSByZXF1aXJlKCAnY3J5cHRvJyApO1xuICAgIH1cbiAgICBjYXRjaCggZXggKSB7fVxuICB9XG4gIGVsc2UgaWYgKCAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIGRlZmluZSggZnVuY3Rpb24oKSB7IHJldHVybiBzZWVkcmFuZG9tOyB9ICk7XG4gIH1cblxuLy8gRW5kIGFub255bW91cyBzY29wZSwgYW5kIHBhc3MgaW5pdGlhbCB2YWx1ZXMuXG59KShcbiAgW10sICAgICAvLyBwb29sOiBlbnRyb3B5IHBvb2wgc3RhcnRzIGVtcHR5XG4gIE1hdGggICAgLy8gbWF0aDogcGFja2FnZSBjb250YWluaW5nIHJhbmRvbSwgcG93LCBhbmQgc2VlZHJhbmRvbVxuKTtcbiJdLCJuYW1lcyI6WyJwb29sIiwibWF0aCIsImdsb2JhbCIsIndpZHRoIiwiY2h1bmtzIiwiZGlnaXRzIiwicm5nbmFtZSIsInN0YXJ0ZGVub20iLCJwb3ciLCJzaWduaWZpY2FuY2UiLCJvdmVyZmxvdyIsIm1hc2siLCJub2RlY3J5cHRvIiwic2VlZHJhbmRvbSIsInNlZWQiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJrZXkiLCJlbnRyb3B5Iiwic2hvcnRzZWVkIiwibWl4a2V5IiwiZmxhdHRlbiIsInRvc3RyaW5nIiwiYXV0b3NlZWQiLCJhcmM0IiwiQVJDNCIsInBybmciLCJuIiwiZyIsImQiLCJ4IiwiaW50MzIiLCJxdWljayIsImRvdWJsZSIsIlMiLCJwYXNzIiwiaXNfbWF0aF9jYWxsIiwic3RhdGUiLCJjb3B5IiwidCIsImtleWxlbiIsImxlbmd0aCIsIm1lIiwiaSIsImoiLCJzIiwiY291bnQiLCJyIiwiZiIsInNsaWNlIiwib2JqIiwiZGVwdGgiLCJyZXN1bHQiLCJ0eXAiLCJwcm9wIiwicHVzaCIsImUiLCJzdHJpbmdzZWVkIiwic21lYXIiLCJjaGFyQ29kZUF0IiwicmFuZG9tQnl0ZXMiLCJvdXQiLCJVaW50OEFycmF5IiwiY3J5cHRvIiwibXNDcnlwdG8iLCJnZXRSYW5kb21WYWx1ZXMiLCJicm93c2VyIiwibmF2aWdhdG9yIiwicGx1Z2lucyIsIkRhdGUiLCJzY3JlZW4iLCJhIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiYXBwbHkiLCJyYW5kb20iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVxdWlyZSIsImV4IiwiZGVmaW5lIiwiYW1kIiwiTWF0aCJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQkMsR0FFQSxDQUFBLFNBQVVBLElBQUksRUFBRUMsSUFBSTtJQUNyQixFQUFFO0lBQ0YsMERBQTBEO0lBQzFE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