/**
 * jshashes - https://github.com/h2non/jshashes
 * Released under the "New BSD" license
 *
 * Algorithms specification:
 *
 * MD5 - http://www.ietf.org/rfc/rfc1321.txt
 * RIPEMD-160 - http://homes.esat.kuleuven.be/~bosselae/ripemd160.html
 * SHA1   - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * SHA256 - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * SHA512 - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * HMAC - http://www.ietf.org/rfc/rfc2104.txt
 */ (function() {
    var Hashes;
    function utf8Encode(str) {
        var x, y, output = '', i = -1, l;
        if (str && str.length) {
            l = str.length;
            while((i += 1) < l){
                /* Decode utf-16 surrogate pairs */ x = str.charCodeAt(i);
                y = i + 1 < l ? str.charCodeAt(i + 1) : 0;
                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                    i += 1;
                }
                /* Encode output as utf-8 */ if (x <= 0x7F) {
                    output += String.fromCharCode(x);
                } else if (x <= 0x7FF) {
                    output += String.fromCharCode(0xC0 | x >>> 6 & 0x1F, 0x80 | x & 0x3F);
                } else if (x <= 0xFFFF) {
                    output += String.fromCharCode(0xE0 | x >>> 12 & 0x0F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);
                } else if (x <= 0x1FFFFF) {
                    output += String.fromCharCode(0xF0 | x >>> 18 & 0x07, 0x80 | x >>> 12 & 0x3F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);
                }
            }
        }
        return output;
    }
    function utf8Decode(str) {
        var i, ac, c1, c2, c3, arr = [], l;
        i = ac = c1 = c2 = c3 = 0;
        if (str && str.length) {
            l = str.length;
            str += '';
            while(i < l){
                c1 = str.charCodeAt(i);
                ac += 1;
                if (c1 < 128) {
                    arr[ac] = String.fromCharCode(c1);
                    i += 1;
                } else if (c1 > 191 && c1 < 224) {
                    c2 = str.charCodeAt(i + 1);
                    arr[ac] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
                    i += 2;
                } else {
                    c2 = str.charCodeAt(i + 1);
                    c3 = str.charCodeAt(i + 2);
                    arr[ac] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    i += 3;
                }
            }
        }
        return arr.join('');
    }
    /**
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */ function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return msw << 16 | lsw & 0xFFFF;
    }
    /**
   * Bitwise rotate a 32-bit number to the left.
   */ function bit_rol(num, cnt) {
        return num << cnt | num >>> 32 - cnt;
    }
    /**
   * Convert a raw string to a hex string
   */ function rstr2hex(input, hexcase) {
        var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef', output = '', x, i = 0, l = input.length;
        for(; i < l; i += 1){
            x = input.charCodeAt(i);
            output += hex_tab.charAt(x >>> 4 & 0x0F) + hex_tab.charAt(x & 0x0F);
        }
        return output;
    }
    /**
   * Encode a string as utf-16
   */ function str2rstr_utf16le(input) {
        var i, l = input.length, output = '';
        for(i = 0; i < l; i += 1){
            output += String.fromCharCode(input.charCodeAt(i) & 0xFF, input.charCodeAt(i) >>> 8 & 0xFF);
        }
        return output;
    }
    function str2rstr_utf16be(input) {
        var i, l = input.length, output = '';
        for(i = 0; i < l; i += 1){
            output += String.fromCharCode(input.charCodeAt(i) >>> 8 & 0xFF, input.charCodeAt(i) & 0xFF);
        }
        return output;
    }
    /**
   * Convert an array of big-endian words to a string
   */ function binb2rstr(input) {
        var i, l = input.length * 32, output = '';
        for(i = 0; i < l; i += 8){
            output += String.fromCharCode(input[i >> 5] >>> 24 - i % 32 & 0xFF);
        }
        return output;
    }
    /**
   * Convert an array of little-endian words to a string
   */ function binl2rstr(input) {
        var i, l = input.length * 32, output = '';
        for(i = 0; i < l; i += 8){
            output += String.fromCharCode(input[i >> 5] >>> i % 32 & 0xFF);
        }
        return output;
    }
    /**
   * Convert a raw string to an array of little-endian words
   * Characters >255 have their high-byte silently ignored.
   */ function rstr2binl(input) {
        var i, l = input.length * 8, output = Array(input.length >> 2), lo = output.length;
        for(i = 0; i < lo; i += 1){
            output[i] = 0;
        }
        for(i = 0; i < l; i += 8){
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << i % 32;
        }
        return output;
    }
    /**
   * Convert a raw string to an array of big-endian words
   * Characters >255 have their high-byte silently ignored.
   */ function rstr2binb(input) {
        var i, l = input.length * 8, output = Array(input.length >> 2), lo = output.length;
        for(i = 0; i < lo; i += 1){
            output[i] = 0;
        }
        for(i = 0; i < l; i += 8){
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << 24 - i % 32;
        }
        return output;
    }
    /**
   * Convert a raw string to an arbitrary string encoding
   */ function rstr2any(input, encoding) {
        var divisor = encoding.length, remainders = Array(), i, q, x, ld, quotient, dividend, output, full_length;
        /* Convert to an array of 16-bit big-endian values, forming the dividend */ dividend = Array(Math.ceil(input.length / 2));
        ld = dividend.length;
        for(i = 0; i < ld; i += 1){
            dividend[i] = input.charCodeAt(i * 2) << 8 | input.charCodeAt(i * 2 + 1);
        }
        /**
     * Repeatedly perform a long division. The binary array forms the dividend,
     * the length of the encoding is the divisor. Once computed, the quotient
     * forms the dividend for the next step. We stop when the dividend is zerHashes.
     * All remainders are stored for later use.
     */ while(dividend.length > 0){
            quotient = Array();
            x = 0;
            for(i = 0; i < dividend.length; i += 1){
                x = (x << 16) + dividend[i];
                q = Math.floor(x / divisor);
                x -= q * divisor;
                if (quotient.length > 0 || q > 0) {
                    quotient[quotient.length] = q;
                }
            }
            remainders[remainders.length] = x;
            dividend = quotient;
        }
        /* Convert the remainders to the output string */ output = '';
        for(i = remainders.length - 1; i >= 0; i--){
            output += encoding.charAt(remainders[i]);
        }
        /* Append leading zero equivalents */ full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
        for(i = output.length; i < full_length; i += 1){
            output = encoding[0] + output;
        }
        return output;
    }
    /**
   * Convert a raw string to a base-64 string
   */ function rstr2b64(input, b64pad) {
        var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', output = '', len = input.length, i, j, triplet;
        b64pad = b64pad || '=';
        for(i = 0; i < len; i += 3){
            triplet = input.charCodeAt(i) << 16 | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
            for(j = 0; j < 4; j += 1){
                if (i * 8 + j * 6 > input.length * 8) {
                    output += b64pad;
                } else {
                    output += tab.charAt(triplet >>> 6 * (3 - j) & 0x3F);
                }
            }
        }
        return output;
    }
    Hashes = {
        /**
     * @property {String} version
     * @readonly
     */ VERSION: '1.0.6',
        /**
     * @member Hashes
     * @class Base64
     * @constructor
     */ Base64: function() {
            // private properties
            var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', pad = '=', url = false, utf8 = true; // by default enable UTF-8 support encoding
            // public method for encoding
            this.encode = function(input) {
                var i, j, triplet, output = '', len = input.length;
                pad = pad || '=';
                input = utf8 ? utf8Encode(input) : input;
                for(i = 0; i < len; i += 3){
                    triplet = input.charCodeAt(i) << 16 | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
                    for(j = 0; j < 4; j += 1){
                        if (i * 8 + j * 6 > len * 8) {
                            output += pad;
                        } else {
                            output += tab.charAt(triplet >>> 6 * (3 - j) & 0x3F);
                        }
                    }
                }
                return output;
            };
            // public method for decoding
            this.decode = function(input) {
                // var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                var i, o1, o2, o3, h1, h2, h3, h4, bits, ac, dec = '', arr = [];
                if (!input) {
                    return input;
                }
                i = ac = 0;
                input = input.replace(new RegExp('\\' + pad, 'gi'), ''); // use '='
                //input += '';
                do {
                    h1 = tab.indexOf(input.charAt(i += 1));
                    h2 = tab.indexOf(input.charAt(i += 1));
                    h3 = tab.indexOf(input.charAt(i += 1));
                    h4 = tab.indexOf(input.charAt(i += 1));
                    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
                    o1 = bits >> 16 & 0xff;
                    o2 = bits >> 8 & 0xff;
                    o3 = bits & 0xff;
                    ac += 1;
                    if (h3 === 64) {
                        arr[ac] = String.fromCharCode(o1);
                    } else if (h4 === 64) {
                        arr[ac] = String.fromCharCode(o1, o2);
                    } else {
                        arr[ac] = String.fromCharCode(o1, o2, o3);
                    }
                }while (i < input.length)
                dec = arr.join('');
                dec = utf8 ? utf8Decode(dec) : dec;
                return dec;
            };
            // set custom pad string
            this.setPad = function(str) {
                pad = str || pad;
                return this;
            };
            // set custom tab string characters
            this.setTab = function(str) {
                tab = str || tab;
                return this;
            };
            this.setUTF8 = function(bool) {
                if (typeof bool === 'boolean') {
                    utf8 = bool;
                }
                return this;
            };
        },
        /**
     * CRC-32 calculation
     * @member Hashes
     * @method CRC32
     * @static
     * @param {String} str Input String
     * @return {String}
     */ CRC32: function(str) {
            var crc = 0, x = 0, y = 0, table, i, iTop;
            str = utf8Encode(str);
            table = [
                '00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 ',
                '79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 ',
                '84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F ',
                '63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD ',
                'A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC ',
                '51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 ',
                'B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 ',
                '06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 ',
                'E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 ',
                '12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 ',
                'D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 ',
                '33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 ',
                'CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 ',
                '9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E ',
                '7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D ',
                '806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 ',
                '60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA ',
                'AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 ',
                '5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 ',
                'B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 ',
                '05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 ',
                'F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA ',
                '11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 ',
                'D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F ',
                '30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E ',
                'C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D'
            ].join('');
            crc = crc ^ -1;
            for(i = 0, iTop = str.length; i < iTop; i += 1){
                y = (crc ^ str.charCodeAt(i)) & 0xFF;
                x = '0x' + table.substr(y * 9, 8);
                crc = crc >>> 8 ^ x;
            }
            // always return a positive number (that's what >>> 0 does)
            return (crc ^ -1) >>> 0;
        },
        /**
     * @member Hashes
     * @class MD5
     * @constructor
     * @param {Object} [config]
     *
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See <http://pajhome.org.uk/crypt/md5> for more infHashes.
     */ MD5: function(options) {
            /**
       * Private config properties. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * See {@link Hashes.MD5#method-setUpperCase} and {@link Hashes.SHA1#method-setUpperCase}
       */ var hexcase = options && typeof options.uppercase === 'boolean' ? options.uppercase : false, b64pad = options && typeof options.pad === 'string' ? options.pad : '=', utf8 = options && typeof options.utf8 === 'boolean' ? options.utf8 : true; // enable/disable utf8 encoding
            // privileged (public) methods
            this.hex = function(s) {
                return rstr2hex(rstr(s, utf8), hexcase);
            };
            this.b64 = function(s) {
                return rstr2b64(rstr(s), b64pad);
            };
            this.any = function(s, e) {
                return rstr2any(rstr(s, utf8), e);
            };
            this.raw = function(s) {
                return rstr(s, utf8);
            };
            this.hex_hmac = function(k, d) {
                return rstr2hex(rstr_hmac(k, d), hexcase);
            };
            this.b64_hmac = function(k, d) {
                return rstr2b64(rstr_hmac(k, d), b64pad);
            };
            this.any_hmac = function(k, d, e) {
                return rstr2any(rstr_hmac(k, d), e);
            };
            /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       */ this.vm_test = function() {
                return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
            };
            /**
       * Enable/disable uppercase hexadecimal returned string
       * @param {Boolean}
       * @return {Object} this
       */ this.setUpperCase = function(a) {
                if (typeof a === 'boolean') {
                    hexcase = a;
                }
                return this;
            };
            /**
       * Defines a base64 pad string
       * @param {String} Pad
       * @return {Object} this
       */ this.setPad = function(a) {
                b64pad = a || b64pad;
                return this;
            };
            /**
       * Defines a base64 pad string
       * @param {Boolean}
       * @return {Object} [this]
       */ this.setUTF8 = function(a) {
                if (typeof a === 'boolean') {
                    utf8 = a;
                }
                return this;
            };
            // private methods
            /**
       * Calculate the MD5 of a raw string
       */ function rstr(s) {
                s = utf8 ? utf8Encode(s) : s;
                return binl2rstr(binl(rstr2binl(s), s.length * 8));
            }
            /**
       * Calculate the HMAC-MD5, of a key and some data (raw strings)
       */ function rstr_hmac(key, data) {
                var bkey, ipad, opad, hash, i;
                key = utf8 ? utf8Encode(key) : key;
                data = utf8 ? utf8Encode(data) : data;
                bkey = rstr2binl(key);
                if (bkey.length > 16) {
                    bkey = binl(bkey, key.length * 8);
                }
                ipad = Array(16), opad = Array(16);
                for(i = 0; i < 16; i += 1){
                    ipad[i] = bkey[i] ^ 0x36363636;
                    opad[i] = bkey[i] ^ 0x5C5C5C5C;
                }
                hash = binl(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
                return binl2rstr(binl(opad.concat(hash), 512 + 128));
            }
            /**
       * Calculate the MD5 of an array of little-endian words, and a bit length.
       */ function binl(x, len) {
                var i, olda, oldb, oldc, oldd, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
                /* append padding */ x[len >> 5] |= 0x80 << len % 32;
                x[(len + 64 >>> 9 << 4) + 14] = len;
                for(i = 0; i < x.length; i += 16){
                    olda = a;
                    oldb = b;
                    oldc = c;
                    oldd = d;
                    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
                    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
                    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
                    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                }
                return Array(a, b, c, d);
            }
            /**
       * These functions implement the four basic operations the algorithm uses.
       */ function md5_cmn(q, a, b, x, s, t) {
                return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
            }
            function md5_ff(a, b, c, d, x, s, t) {
                return md5_cmn(b & c | ~b & d, a, b, x, s, t);
            }
            function md5_gg(a, b, c, d, x, s, t) {
                return md5_cmn(b & d | c & ~d, a, b, x, s, t);
            }
            function md5_hh(a, b, c, d, x, s, t) {
                return md5_cmn(b ^ c ^ d, a, b, x, s, t);
            }
            function md5_ii(a, b, c, d, x, s, t) {
                return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
            }
        },
        /**
     * @member Hashes
     * @class Hashes.SHA1
     * @param {Object} [config]
     * @constructor
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined in FIPS 180-1
     * Version 2.2 Copyright Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     */ SHA1: function(options) {
            /**
       * Private config properties. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * See {@link Hashes.MD5#method-setUpperCase} and {@link Hashes.SHA1#method-setUpperCase}
       */ var hexcase = options && typeof options.uppercase === 'boolean' ? options.uppercase : false, b64pad = options && typeof options.pad === 'string' ? options.pad : '=', utf8 = options && typeof options.utf8 === 'boolean' ? options.utf8 : true; // enable/disable utf8 encoding
            // public methods
            this.hex = function(s) {
                return rstr2hex(rstr(s, utf8), hexcase);
            };
            this.b64 = function(s) {
                return rstr2b64(rstr(s, utf8), b64pad);
            };
            this.any = function(s, e) {
                return rstr2any(rstr(s, utf8), e);
            };
            this.raw = function(s) {
                return rstr(s, utf8);
            };
            this.hex_hmac = function(k, d) {
                return rstr2hex(rstr_hmac(k, d));
            };
            this.b64_hmac = function(k, d) {
                return rstr2b64(rstr_hmac(k, d), b64pad);
            };
            this.any_hmac = function(k, d, e) {
                return rstr2any(rstr_hmac(k, d), e);
            };
            /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */ this.vm_test = function() {
                return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
            };
            /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */ this.setUpperCase = function(a) {
                if (typeof a === 'boolean') {
                    hexcase = a;
                }
                return this;
            };
            /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */ this.setPad = function(a) {
                b64pad = a || b64pad;
                return this;
            };
            /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */ this.setUTF8 = function(a) {
                if (typeof a === 'boolean') {
                    utf8 = a;
                }
                return this;
            };
            // private methods
            /**
       * Calculate the SHA-512 of a raw string
       */ function rstr(s) {
                s = utf8 ? utf8Encode(s) : s;
                return binb2rstr(binb(rstr2binb(s), s.length * 8));
            }
            /**
       * Calculate the HMAC-SHA1 of a key and some data (raw strings)
       */ function rstr_hmac(key, data) {
                var bkey, ipad, opad, i, hash;
                key = utf8 ? utf8Encode(key) : key;
                data = utf8 ? utf8Encode(data) : data;
                bkey = rstr2binb(key);
                if (bkey.length > 16) {
                    bkey = binb(bkey, key.length * 8);
                }
                ipad = Array(16), opad = Array(16);
                for(i = 0; i < 16; i += 1){
                    ipad[i] = bkey[i] ^ 0x36363636;
                    opad[i] = bkey[i] ^ 0x5C5C5C5C;
                }
                hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
                return binb2rstr(binb(opad.concat(hash), 512 + 160));
            }
            /**
       * Calculate the SHA-1 of an array of big-endian words, and a bit length
       */ function binb(x, len) {
                var i, j, t, olda, oldb, oldc, oldd, olde, w = Array(80), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e = -1009589776;
                /* append padding */ x[len >> 5] |= 0x80 << 24 - len % 32;
                x[(len + 64 >> 9 << 4) + 15] = len;
                for(i = 0; i < x.length; i += 16){
                    olda = a;
                    oldb = b;
                    oldc = c;
                    oldd = d;
                    olde = e;
                    for(j = 0; j < 80; j += 1){
                        if (j < 16) {
                            w[j] = x[i + j];
                        } else {
                            w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                        }
                        t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
                        e = d;
                        d = c;
                        c = bit_rol(b, 30);
                        b = a;
                        a = t;
                    }
                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                    e = safe_add(e, olde);
                }
                return Array(a, b, c, d, e);
            }
            /**
       * Perform the appropriate triplet combination function for the current
       * iteration
       */ function sha1_ft(t, b, c, d) {
                if (t < 20) {
                    return b & c | ~b & d;
                }
                if (t < 40) {
                    return b ^ c ^ d;
                }
                if (t < 60) {
                    return b & c | b & d | c & d;
                }
                return b ^ c ^ d;
            }
            /**
       * Determine the appropriate additive constant for the current iteration
       */ function sha1_kt(t) {
                return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
            }
        },
        /**
     * @class Hashes.SHA256
     * @param {config}
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined in FIPS 180-2
     * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     * Also http://anmar.eu.org/projects/jssha2/
     */ SHA256: function(options) {
            /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */ var hexcase = options && typeof options.uppercase === 'boolean' ? options.uppercase : false, b64pad = options && typeof options.pad === 'string' ? options.pad : '=', /* base-64 pad character. Default '=' for strict RFC compliance   */ utf8 = options && typeof options.utf8 === 'boolean' ? options.utf8 : true, /* enable/disable utf8 encoding */ sha256_K;
            /* privileged (public) methods */ this.hex = function(s) {
                return rstr2hex(rstr(s, utf8));
            };
            this.b64 = function(s) {
                return rstr2b64(rstr(s, utf8), b64pad);
            };
            this.any = function(s, e) {
                return rstr2any(rstr(s, utf8), e);
            };
            this.raw = function(s) {
                return rstr(s, utf8);
            };
            this.hex_hmac = function(k, d) {
                return rstr2hex(rstr_hmac(k, d));
            };
            this.b64_hmac = function(k, d) {
                return rstr2b64(rstr_hmac(k, d), b64pad);
            };
            this.any_hmac = function(k, d, e) {
                return rstr2any(rstr_hmac(k, d), e);
            };
            /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */ this.vm_test = function() {
                return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
            };
            /**
       * Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */ this.setUpperCase = function(a) {
                if (typeof a === 'boolean') {
                    hexcase = a;
                }
                return this;
            };
            /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */ this.setPad = function(a) {
                b64pad = a || b64pad;
                return this;
            };
            /**
       * Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */ this.setUTF8 = function(a) {
                if (typeof a === 'boolean') {
                    utf8 = a;
                }
                return this;
            };
            // private methods
            /**
       * Calculate the SHA-512 of a raw string
       */ function rstr(s, utf8) {
                s = utf8 ? utf8Encode(s) : s;
                return binb2rstr(binb(rstr2binb(s), s.length * 8));
            }
            /**
       * Calculate the HMAC-sha256 of a key and some data (raw strings)
       */ function rstr_hmac(key, data) {
                key = utf8 ? utf8Encode(key) : key;
                data = utf8 ? utf8Encode(data) : data;
                var hash, i = 0, bkey = rstr2binb(key), ipad = Array(16), opad = Array(16);
                if (bkey.length > 16) {
                    bkey = binb(bkey, key.length * 8);
                }
                for(; i < 16; i += 1){
                    ipad[i] = bkey[i] ^ 0x36363636;
                    opad[i] = bkey[i] ^ 0x5C5C5C5C;
                }
                hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
                return binb2rstr(binb(opad.concat(hash), 512 + 256));
            }
            /*
       * Main sha256 function, with its support functions
       */ function sha256_S(X, n) {
                return X >>> n | X << 32 - n;
            }
            function sha256_R(X, n) {
                return X >>> n;
            }
            function sha256_Ch(x, y, z) {
                return x & y ^ ~x & z;
            }
            function sha256_Maj(x, y, z) {
                return x & y ^ x & z ^ y & z;
            }
            function sha256_Sigma0256(x) {
                return sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22);
            }
            function sha256_Sigma1256(x) {
                return sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25);
            }
            function sha256_Gamma0256(x) {
                return sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3);
            }
            function sha256_Gamma1256(x) {
                return sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10);
            }
            function sha256_Sigma0512(x) {
                return sha256_S(x, 28) ^ sha256_S(x, 34) ^ sha256_S(x, 39);
            }
            function sha256_Sigma1512(x) {
                return sha256_S(x, 14) ^ sha256_S(x, 18) ^ sha256_S(x, 41);
            }
            function sha256_Gamma0512(x) {
                return sha256_S(x, 1) ^ sha256_S(x, 8) ^ sha256_R(x, 7);
            }
            function sha256_Gamma1512(x) {
                return sha256_S(x, 19) ^ sha256_S(x, 61) ^ sha256_R(x, 6);
            }
            sha256_K = [
                1116352408,
                1899447441,
                -1245643825,
                -373957723,
                961987163,
                1508970993,
                -1841331548,
                -1424204075,
                -670586216,
                310598401,
                607225278,
                1426881987,
                1925078388,
                -2132889090,
                -1680079193,
                -1046744716,
                -459576895,
                -272742522,
                264347078,
                604807628,
                770255983,
                1249150122,
                1555081692,
                1996064986,
                -1740746414,
                -1473132947,
                -1341970488,
                -1084653625,
                -958395405,
                -710438585,
                113926993,
                338241895,
                666307205,
                773529912,
                1294757372,
                1396182291,
                1695183700,
                1986661051,
                -2117940946,
                -1838011259,
                -1564481375,
                -1474664885,
                -1035236496,
                -949202525,
                -778901479,
                -694614492,
                -200395387,
                275423344,
                430227734,
                506948616,
                659060556,
                883997877,
                958139571,
                1322822218,
                1537002063,
                1747873779,
                1955562222,
                2024104815,
                -2067236844,
                -1933114872,
                -1866530822,
                -1538233109,
                -1090935817,
                -965641998
            ];
            function binb(m, l) {
                var HASH = [
                    1779033703,
                    -1150833019,
                    1013904242,
                    -1521486534,
                    1359893119,
                    -1694144372,
                    528734635,
                    1541459225
                ];
                var W = new Array(64);
                var a, b, c, d, e, f, g, h;
                var i, j, T1, T2;
                /* append padding */ m[l >> 5] |= 0x80 << 24 - l % 32;
                m[(l + 64 >> 9 << 4) + 15] = l;
                for(i = 0; i < m.length; i += 16){
                    a = HASH[0];
                    b = HASH[1];
                    c = HASH[2];
                    d = HASH[3];
                    e = HASH[4];
                    f = HASH[5];
                    g = HASH[6];
                    h = HASH[7];
                    for(j = 0; j < 64; j += 1){
                        if (j < 16) {
                            W[j] = m[j + i];
                        } else {
                            W[j] = safe_add(safe_add(safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]), sha256_Gamma0256(W[j - 15])), W[j - 16]);
                        }
                        T1 = safe_add(safe_add(safe_add(safe_add(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)), sha256_K[j]), W[j]);
                        T2 = safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
                        h = g;
                        g = f;
                        f = e;
                        e = safe_add(d, T1);
                        d = c;
                        c = b;
                        b = a;
                        a = safe_add(T1, T2);
                    }
                    HASH[0] = safe_add(a, HASH[0]);
                    HASH[1] = safe_add(b, HASH[1]);
                    HASH[2] = safe_add(c, HASH[2]);
                    HASH[3] = safe_add(d, HASH[3]);
                    HASH[4] = safe_add(e, HASH[4]);
                    HASH[5] = safe_add(f, HASH[5]);
                    HASH[6] = safe_add(g, HASH[6]);
                    HASH[7] = safe_add(h, HASH[7]);
                }
                return HASH;
            }
        },
        /**
     * @class Hashes.SHA512
     * @param {config}
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-512, as defined in FIPS 180-2
     * Version 2.2 Copyright Anonymous Contributor, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     */ SHA512: function(options) {
            /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */ var hexcase = options && typeof options.uppercase === 'boolean' ? options.uppercase : false, /* hexadecimal output case format. false - lowercase; true - uppercase  */ b64pad = options && typeof options.pad === 'string' ? options.pad : '=', /* base-64 pad character. Default '=' for strict RFC compliance   */ utf8 = options && typeof options.utf8 === 'boolean' ? options.utf8 : true, /* enable/disable utf8 encoding */ sha512_k;
            /* privileged (public) methods */ this.hex = function(s) {
                return rstr2hex(rstr(s));
            };
            this.b64 = function(s) {
                return rstr2b64(rstr(s), b64pad);
            };
            this.any = function(s, e) {
                return rstr2any(rstr(s), e);
            };
            this.raw = function(s) {
                return rstr(s, utf8);
            };
            this.hex_hmac = function(k, d) {
                return rstr2hex(rstr_hmac(k, d));
            };
            this.b64_hmac = function(k, d) {
                return rstr2b64(rstr_hmac(k, d), b64pad);
            };
            this.any_hmac = function(k, d, e) {
                return rstr2any(rstr_hmac(k, d), e);
            };
            /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */ this.vm_test = function() {
                return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
            };
            /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */ this.setUpperCase = function(a) {
                if (typeof a === 'boolean') {
                    hexcase = a;
                }
                return this;
            };
            /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */ this.setPad = function(a) {
                b64pad = a || b64pad;
                return this;
            };
            /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */ this.setUTF8 = function(a) {
                if (typeof a === 'boolean') {
                    utf8 = a;
                }
                return this;
            };
            /* private methods */ /**
       * Calculate the SHA-512 of a raw string
       */ function rstr(s) {
                s = utf8 ? utf8Encode(s) : s;
                return binb2rstr(binb(rstr2binb(s), s.length * 8));
            }
            /*
       * Calculate the HMAC-SHA-512 of a key and some data (raw strings)
       */ function rstr_hmac(key, data) {
                key = utf8 ? utf8Encode(key) : key;
                data = utf8 ? utf8Encode(data) : data;
                var hash, i = 0, bkey = rstr2binb(key), ipad = Array(32), opad = Array(32);
                if (bkey.length > 32) {
                    bkey = binb(bkey, key.length * 8);
                }
                for(; i < 32; i += 1){
                    ipad[i] = bkey[i] ^ 0x36363636;
                    opad[i] = bkey[i] ^ 0x5C5C5C5C;
                }
                hash = binb(ipad.concat(rstr2binb(data)), 1024 + data.length * 8);
                return binb2rstr(binb(opad.concat(hash), 1024 + 512));
            }
            /**
       * Calculate the SHA-512 of an array of big-endian dwords, and a bit length
       */ function binb(x, len) {
                var j, i, l, W = new Array(80), hash = new Array(16), //Initial hash values
                H = [
                    new int64(0x6a09e667, -205731576),
                    new int64(-1150833019, -2067093701),
                    new int64(0x3c6ef372, -23791573),
                    new int64(-1521486534, 0x5f1d36f1),
                    new int64(0x510e527f, -1377402159),
                    new int64(-1694144372, 0x2b3e6c1f),
                    new int64(0x1f83d9ab, -79577749),
                    new int64(0x5be0cd19, 0x137e2179)
                ], T1 = new int64(0, 0), T2 = new int64(0, 0), a = new int64(0, 0), b = new int64(0, 0), c = new int64(0, 0), d = new int64(0, 0), e = new int64(0, 0), f = new int64(0, 0), g = new int64(0, 0), h = new int64(0, 0), //Temporary variables not specified by the document
                s0 = new int64(0, 0), s1 = new int64(0, 0), Ch = new int64(0, 0), Maj = new int64(0, 0), r1 = new int64(0, 0), r2 = new int64(0, 0), r3 = new int64(0, 0);
                if (sha512_k === undefined) {
                    //SHA512 constants
                    sha512_k = [
                        new int64(0x428a2f98, -685199838),
                        new int64(0x71374491, 0x23ef65cd),
                        new int64(-1245643825, -330482897),
                        new int64(-373957723, -2121671748),
                        new int64(0x3956c25b, -213338824),
                        new int64(0x59f111f1, -1241133031),
                        new int64(-1841331548, -1357295717),
                        new int64(-1424204075, -630357736),
                        new int64(-670586216, -1560083902),
                        new int64(0x12835b01, 0x45706fbe),
                        new int64(0x243185be, 0x4ee4b28c),
                        new int64(0x550c7dc3, -704662302),
                        new int64(0x72be5d74, -226784913),
                        new int64(-2132889090, 0x3b1696b1),
                        new int64(-1680079193, 0x25c71235),
                        new int64(-1046744716, -815192428),
                        new int64(-459576895, -1628353838),
                        new int64(-272742522, 0x384f25e3),
                        new int64(0xfc19dc6, -1953704523),
                        new int64(0x240ca1cc, 0x77ac9c65),
                        new int64(0x2de92c6f, 0x592b0275),
                        new int64(0x4a7484aa, 0x6ea6e483),
                        new int64(0x5cb0a9dc, -1119749164),
                        new int64(0x76f988da, -2096016459),
                        new int64(-1740746414, -295247957),
                        new int64(-1473132947, 0x2db43210),
                        new int64(-1341970488, -1728372417),
                        new int64(-1084653625, -1091629340),
                        new int64(-958395405, 0x3da88fc2),
                        new int64(-710438585, -1828018395),
                        new int64(0x6ca6351, -536640913),
                        new int64(0x14292967, 0xa0e6e70),
                        new int64(0x27b70a85, 0x46d22ffc),
                        new int64(0x2e1b2138, 0x5c26c926),
                        new int64(0x4d2c6dfc, 0x5ac42aed),
                        new int64(0x53380d13, -1651133473),
                        new int64(0x650a7354, -1951439906),
                        new int64(0x766a0abb, 0x3c77b2a8),
                        new int64(-2117940946, 0x47edaee6),
                        new int64(-1838011259, 0x1482353b),
                        new int64(-1564481375, 0x4cf10364),
                        new int64(-1474664885, -1136513023),
                        new int64(-1035236496, -789014639),
                        new int64(-949202525, 0x654be30),
                        new int64(-778901479, -688958952),
                        new int64(-694614492, 0x5565a910),
                        new int64(-200395387, 0x5771202a),
                        new int64(0x106aa070, 0x32bbd1b8),
                        new int64(0x19a4c116, -1194143544),
                        new int64(0x1e376c08, 0x5141ab53),
                        new int64(0x2748774c, -544281703),
                        new int64(0x34b0bcb5, -509917016),
                        new int64(0x391c0cb3, -976659869),
                        new int64(0x4ed8aa4a, -482243893),
                        new int64(0x5b9cca4f, 0x7763e373),
                        new int64(0x682e6ff3, -692930397),
                        new int64(0x748f82ee, 0x5defb2fc),
                        new int64(0x78a5636f, 0x43172f60),
                        new int64(-2067236844, -1578062990),
                        new int64(-1933114872, 0x1a6439ec),
                        new int64(-1866530822, 0x23631e28),
                        new int64(-1538233109, -561857047),
                        new int64(-1090935817, -1295615723),
                        new int64(-965641998, -479046869),
                        new int64(-903397682, -366583396),
                        new int64(-779700025, 0x21c0c207),
                        new int64(-354779690, -840897762),
                        new int64(-176337025, -294727304),
                        new int64(0x6f067aa, 0x72176fba),
                        new int64(0xa637dc5, -1563912026),
                        new int64(0x113f9804, -1090974290),
                        new int64(0x1b710b35, 0x131c471b),
                        new int64(0x28db77f5, 0x23047d84),
                        new int64(0x32caab7b, 0x40c72493),
                        new int64(0x3c9ebe0a, 0x15c9bebc),
                        new int64(0x431d67c4, -1676669620),
                        new int64(0x4cc5d4be, -885112138),
                        new int64(0x597f299c, -60457430),
                        new int64(0x5fcb6fab, 0x3ad6faec),
                        new int64(0x6c44198c, 0x4a475817)
                    ];
                }
                for(i = 0; i < 80; i += 1){
                    W[i] = new int64(0, 0);
                }
                // append padding to the source string. The format is described in the FIPS.
                x[len >> 5] |= 0x80 << 24 - (len & 0x1f);
                x[(len + 128 >> 10 << 5) + 31] = len;
                l = x.length;
                for(i = 0; i < l; i += 32){
                    int64copy(a, H[0]);
                    int64copy(b, H[1]);
                    int64copy(c, H[2]);
                    int64copy(d, H[3]);
                    int64copy(e, H[4]);
                    int64copy(f, H[5]);
                    int64copy(g, H[6]);
                    int64copy(h, H[7]);
                    for(j = 0; j < 16; j += 1){
                        W[j].h = x[i + 2 * j];
                        W[j].l = x[i + 2 * j + 1];
                    }
                    for(j = 16; j < 80; j += 1){
                        //sigma1
                        int64rrot(r1, W[j - 2], 19);
                        int64revrrot(r2, W[j - 2], 29);
                        int64shr(r3, W[j - 2], 6);
                        s1.l = r1.l ^ r2.l ^ r3.l;
                        s1.h = r1.h ^ r2.h ^ r3.h;
                        //sigma0
                        int64rrot(r1, W[j - 15], 1);
                        int64rrot(r2, W[j - 15], 8);
                        int64shr(r3, W[j - 15], 7);
                        s0.l = r1.l ^ r2.l ^ r3.l;
                        s0.h = r1.h ^ r2.h ^ r3.h;
                        int64add4(W[j], s1, W[j - 7], s0, W[j - 16]);
                    }
                    for(j = 0; j < 80; j += 1){
                        //Ch
                        Ch.l = e.l & f.l ^ ~e.l & g.l;
                        Ch.h = e.h & f.h ^ ~e.h & g.h;
                        //Sigma1
                        int64rrot(r1, e, 14);
                        int64rrot(r2, e, 18);
                        int64revrrot(r3, e, 9);
                        s1.l = r1.l ^ r2.l ^ r3.l;
                        s1.h = r1.h ^ r2.h ^ r3.h;
                        //Sigma0
                        int64rrot(r1, a, 28);
                        int64revrrot(r2, a, 2);
                        int64revrrot(r3, a, 7);
                        s0.l = r1.l ^ r2.l ^ r3.l;
                        s0.h = r1.h ^ r2.h ^ r3.h;
                        //Maj
                        Maj.l = a.l & b.l ^ a.l & c.l ^ b.l & c.l;
                        Maj.h = a.h & b.h ^ a.h & c.h ^ b.h & c.h;
                        int64add5(T1, h, s1, Ch, sha512_k[j], W[j]);
                        int64add(T2, s0, Maj);
                        int64copy(h, g);
                        int64copy(g, f);
                        int64copy(f, e);
                        int64add(e, d, T1);
                        int64copy(d, c);
                        int64copy(c, b);
                        int64copy(b, a);
                        int64add(a, T1, T2);
                    }
                    int64add(H[0], H[0], a);
                    int64add(H[1], H[1], b);
                    int64add(H[2], H[2], c);
                    int64add(H[3], H[3], d);
                    int64add(H[4], H[4], e);
                    int64add(H[5], H[5], f);
                    int64add(H[6], H[6], g);
                    int64add(H[7], H[7], h);
                }
                //represent the hash as an array of 32-bit dwords
                for(i = 0; i < 8; i += 1){
                    hash[2 * i] = H[i].h;
                    hash[2 * i + 1] = H[i].l;
                }
                return hash;
            }
            //A constructor for 64-bit numbers
            function int64(h, l) {
                this.h = h;
                this.l = l;
            //this.toString = int64toString;
            }
            //Copies src into dst, assuming both are 64-bit numbers
            function int64copy(dst, src) {
                dst.h = src.h;
                dst.l = src.l;
            }
            //Right-rotates a 64-bit number by shift
            //Won't handle cases of shift>=32
            //The function revrrot() is for that
            function int64rrot(dst, x, shift) {
                dst.l = x.l >>> shift | x.h << 32 - shift;
                dst.h = x.h >>> shift | x.l << 32 - shift;
            }
            //Reverses the dwords of the source and then rotates right by shift.
            //This is equivalent to rotation by 32+shift
            function int64revrrot(dst, x, shift) {
                dst.l = x.h >>> shift | x.l << 32 - shift;
                dst.h = x.l >>> shift | x.h << 32 - shift;
            }
            //Bitwise-shifts right a 64-bit number by shift
            //Won't handle shift>=32, but it's never needed in SHA512
            function int64shr(dst, x, shift) {
                dst.l = x.l >>> shift | x.h << 32 - shift;
                dst.h = x.h >>> shift;
            }
            //Adds two 64-bit numbers
            //Like the original implementation, does not rely on 32-bit operations
            function int64add(dst, x, y) {
                var w0 = (x.l & 0xffff) + (y.l & 0xffff);
                var w1 = (x.l >>> 16) + (y.l >>> 16) + (w0 >>> 16);
                var w2 = (x.h & 0xffff) + (y.h & 0xffff) + (w1 >>> 16);
                var w3 = (x.h >>> 16) + (y.h >>> 16) + (w2 >>> 16);
                dst.l = w0 & 0xffff | w1 << 16;
                dst.h = w2 & 0xffff | w3 << 16;
            }
            //Same, except with 4 addends. Works faster than adding them one by one.
            function int64add4(dst, a, b, c, d) {
                var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff);
                var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (w0 >>> 16);
                var w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (w1 >>> 16);
                var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (w2 >>> 16);
                dst.l = w0 & 0xffff | w1 << 16;
                dst.h = w2 & 0xffff | w3 << 16;
            }
            //Same, except with 5 addends
            function int64add5(dst, a, b, c, d, e) {
                var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff) + (e.l & 0xffff), w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (e.l >>> 16) + (w0 >>> 16), w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (e.h & 0xffff) + (w1 >>> 16), w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (e.h >>> 16) + (w2 >>> 16);
                dst.l = w0 & 0xffff | w1 << 16;
                dst.h = w2 & 0xffff | w3 << 16;
            }
        },
        /**
     * @class Hashes.RMD160
     * @constructor
     * @param {Object} [config]
     *
     * A JavaScript implementation of the RIPEMD-160 Algorithm
     * Version 2.2 Copyright Jeremy Lin, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     * Also http://www.ocf.berkeley.edu/~jjlin/jsotp/
     */ RMD160: function(options) {
            /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */ var hexcase = options && typeof options.uppercase === 'boolean' ? options.uppercase : false, /* hexadecimal output case format. false - lowercase; true - uppercase  */ b64pad = options && typeof options.pad === 'string' ? options.pa : '=', /* base-64 pad character. Default '=' for strict RFC compliance   */ utf8 = options && typeof options.utf8 === 'boolean' ? options.utf8 : true, /* enable/disable utf8 encoding */ rmd160_r1 = [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                7,
                4,
                13,
                1,
                10,
                6,
                15,
                3,
                12,
                0,
                9,
                5,
                2,
                14,
                11,
                8,
                3,
                10,
                14,
                4,
                9,
                15,
                8,
                1,
                2,
                7,
                0,
                6,
                13,
                11,
                5,
                12,
                1,
                9,
                11,
                10,
                0,
                8,
                12,
                4,
                13,
                3,
                7,
                15,
                14,
                5,
                6,
                2,
                4,
                0,
                5,
                9,
                7,
                12,
                2,
                10,
                14,
                1,
                3,
                8,
                11,
                6,
                15,
                13
            ], rmd160_r2 = [
                5,
                14,
                7,
                0,
                9,
                2,
                11,
                4,
                13,
                6,
                15,
                8,
                1,
                10,
                3,
                12,
                6,
                11,
                3,
                7,
                0,
                13,
                5,
                10,
                14,
                15,
                8,
                12,
                4,
                9,
                1,
                2,
                15,
                5,
                1,
                3,
                7,
                14,
                6,
                9,
                11,
                8,
                12,
                2,
                10,
                0,
                4,
                13,
                8,
                6,
                4,
                1,
                3,
                11,
                15,
                0,
                5,
                12,
                2,
                13,
                9,
                7,
                10,
                14,
                12,
                15,
                10,
                4,
                1,
                5,
                8,
                7,
                6,
                2,
                13,
                14,
                0,
                3,
                9,
                11
            ], rmd160_s1 = [
                11,
                14,
                15,
                12,
                5,
                8,
                7,
                9,
                11,
                13,
                14,
                15,
                6,
                7,
                9,
                8,
                7,
                6,
                8,
                13,
                11,
                9,
                7,
                15,
                7,
                12,
                15,
                9,
                11,
                7,
                13,
                12,
                11,
                13,
                6,
                7,
                14,
                9,
                13,
                15,
                14,
                8,
                13,
                6,
                5,
                12,
                7,
                5,
                11,
                12,
                14,
                15,
                14,
                15,
                9,
                8,
                9,
                14,
                5,
                6,
                8,
                6,
                5,
                12,
                9,
                15,
                5,
                11,
                6,
                8,
                13,
                12,
                5,
                12,
                13,
                14,
                11,
                8,
                5,
                6
            ], rmd160_s2 = [
                8,
                9,
                9,
                11,
                13,
                15,
                15,
                5,
                7,
                7,
                8,
                11,
                14,
                14,
                12,
                6,
                9,
                13,
                15,
                7,
                12,
                8,
                9,
                11,
                7,
                7,
                12,
                7,
                6,
                15,
                13,
                11,
                9,
                7,
                15,
                11,
                8,
                6,
                6,
                14,
                12,
                13,
                5,
                14,
                13,
                13,
                7,
                5,
                15,
                5,
                8,
                11,
                14,
                14,
                6,
                14,
                6,
                9,
                12,
                9,
                12,
                5,
                15,
                8,
                8,
                5,
                12,
                9,
                12,
                5,
                14,
                6,
                8,
                13,
                6,
                5,
                15,
                13,
                11,
                11
            ];
            /* privileged (public) methods */ this.hex = function(s) {
                return rstr2hex(rstr(s, utf8));
            };
            this.b64 = function(s) {
                return rstr2b64(rstr(s, utf8), b64pad);
            };
            this.any = function(s, e) {
                return rstr2any(rstr(s, utf8), e);
            };
            this.raw = function(s) {
                return rstr(s, utf8);
            };
            this.hex_hmac = function(k, d) {
                return rstr2hex(rstr_hmac(k, d));
            };
            this.b64_hmac = function(k, d) {
                return rstr2b64(rstr_hmac(k, d), b64pad);
            };
            this.any_hmac = function(k, d, e) {
                return rstr2any(rstr_hmac(k, d), e);
            };
            /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */ this.vm_test = function() {
                return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
            };
            /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */ this.setUpperCase = function(a) {
                if (typeof a === 'boolean') {
                    hexcase = a;
                }
                return this;
            };
            /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */ this.setPad = function(a) {
                if (typeof a !== 'undefined') {
                    b64pad = a;
                }
                return this;
            };
            /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */ this.setUTF8 = function(a) {
                if (typeof a === 'boolean') {
                    utf8 = a;
                }
                return this;
            };
            /* private methods */ /**
       * Calculate the rmd160 of a raw string
       */ function rstr(s) {
                s = utf8 ? utf8Encode(s) : s;
                return binl2rstr(binl(rstr2binl(s), s.length * 8));
            }
            /**
       * Calculate the HMAC-rmd160 of a key and some data (raw strings)
       */ function rstr_hmac(key, data) {
                key = utf8 ? utf8Encode(key) : key;
                data = utf8 ? utf8Encode(data) : data;
                var i, hash, bkey = rstr2binl(key), ipad = Array(16), opad = Array(16);
                if (bkey.length > 16) {
                    bkey = binl(bkey, key.length * 8);
                }
                for(i = 0; i < 16; i += 1){
                    ipad[i] = bkey[i] ^ 0x36363636;
                    opad[i] = bkey[i] ^ 0x5C5C5C5C;
                }
                hash = binl(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
                return binl2rstr(binl(opad.concat(hash), 512 + 160));
            }
            /**
       * Convert an array of little-endian words to a string
       */ function binl2rstr(input) {
                var i, output = '', l = input.length * 32;
                for(i = 0; i < l; i += 8){
                    output += String.fromCharCode(input[i >> 5] >>> i % 32 & 0xFF);
                }
                return output;
            }
            /**
       * Calculate the RIPE-MD160 of an array of little-endian words, and a bit length.
       */ function binl(x, len) {
                var T, j, i, l, h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0, A1, B1, C1, D1, E1, A2, B2, C2, D2, E2;
                /* append padding */ x[len >> 5] |= 0x80 << len % 32;
                x[(len + 64 >>> 9 << 4) + 14] = len;
                l = x.length;
                for(i = 0; i < l; i += 16){
                    A1 = A2 = h0;
                    B1 = B2 = h1;
                    C1 = C2 = h2;
                    D1 = D2 = h3;
                    E1 = E2 = h4;
                    for(j = 0; j <= 79; j += 1){
                        T = safe_add(A1, rmd160_f(j, B1, C1, D1));
                        T = safe_add(T, x[i + rmd160_r1[j]]);
                        T = safe_add(T, rmd160_K1(j));
                        T = safe_add(bit_rol(T, rmd160_s1[j]), E1);
                        A1 = E1;
                        E1 = D1;
                        D1 = bit_rol(C1, 10);
                        C1 = B1;
                        B1 = T;
                        T = safe_add(A2, rmd160_f(79 - j, B2, C2, D2));
                        T = safe_add(T, x[i + rmd160_r2[j]]);
                        T = safe_add(T, rmd160_K2(j));
                        T = safe_add(bit_rol(T, rmd160_s2[j]), E2);
                        A2 = E2;
                        E2 = D2;
                        D2 = bit_rol(C2, 10);
                        C2 = B2;
                        B2 = T;
                    }
                    T = safe_add(h1, safe_add(C1, D2));
                    h1 = safe_add(h2, safe_add(D1, E2));
                    h2 = safe_add(h3, safe_add(E1, A2));
                    h3 = safe_add(h4, safe_add(A1, B2));
                    h4 = safe_add(h0, safe_add(B1, C2));
                    h0 = T;
                }
                return [
                    h0,
                    h1,
                    h2,
                    h3,
                    h4
                ];
            }
            // specific algorithm methods
            function rmd160_f(j, x, y, z) {
                return 0 <= j && j <= 15 ? x ^ y ^ z : 16 <= j && j <= 31 ? x & y | ~x & z : 32 <= j && j <= 47 ? (x | ~y) ^ z : 48 <= j && j <= 63 ? x & z | y & ~z : 64 <= j && j <= 79 ? x ^ (y | ~z) : 'rmd160_f: j out of range';
            }
            function rmd160_K1(j) {
                return 0 <= j && j <= 15 ? 0x00000000 : 16 <= j && j <= 31 ? 0x5a827999 : 32 <= j && j <= 47 ? 0x6ed9eba1 : 48 <= j && j <= 63 ? 0x8f1bbcdc : 64 <= j && j <= 79 ? 0xa953fd4e : 'rmd160_K1: j out of range';
            }
            function rmd160_K2(j) {
                return 0 <= j && j <= 15 ? 0x50a28be6 : 16 <= j && j <= 31 ? 0x5c4dd124 : 32 <= j && j <= 47 ? 0x6d703ef3 : 48 <= j && j <= 63 ? 0x7a6d76e9 : 64 <= j && j <= 79 ? 0x00000000 : 'rmd160_K2: j out of range';
            }
        }
    };
    // exposes Hashes
    (function(window, undefined1) {
        var freeExports = false;
        if (typeof exports === 'object') {
            freeExports = exports;
            if (exports && typeof global === 'object' && global && global === global.global) {
                window = global;
            }
        }
        if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
            // define as an anonymous module, so, through path mapping, it can be aliased
            define(function() {
                return Hashes;
            });
        } else if (freeExports) {
            // in Node.js or RingoJS v0.8.0+
            if (typeof module === 'object' && module && module.exports === freeExports) {
                module.exports = Hashes;
            } else {
                freeExports.Hashes = Hashes;
            }
        } else {
            // in a browser or Rhino
            window.Hashes = Hashes;
        }
    })(this);
})(); // IIFE

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvanNoYXNoZXMtMS4wLjcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBqc2hhc2hlcyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9oMm5vbi9qc2hhc2hlc1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIFwiTmV3IEJTRFwiIGxpY2Vuc2VcbiAqXG4gKiBBbGdvcml0aG1zIHNwZWNpZmljYXRpb246XG4gKlxuICogTUQ1IC0gaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMTMyMS50eHRcbiAqIFJJUEVNRC0xNjAgLSBodHRwOi8vaG9tZXMuZXNhdC5rdWxldXZlbi5iZS9+Ym9zc2VsYWUvcmlwZW1kMTYwLmh0bWxcbiAqIFNIQTEgICAtIGh0dHA6Ly9jc3JjLm5pc3QuZ292L3B1YmxpY2F0aW9ucy9maXBzL2ZpcHMxODAtNC9maXBzLTE4MC00LnBkZlxuICogU0hBMjU2IC0gaHR0cDovL2NzcmMubmlzdC5nb3YvcHVibGljYXRpb25zL2ZpcHMvZmlwczE4MC00L2ZpcHMtMTgwLTQucGRmXG4gKiBTSEE1MTIgLSBodHRwOi8vY3NyYy5uaXN0Lmdvdi9wdWJsaWNhdGlvbnMvZmlwcy9maXBzMTgwLTQvZmlwcy0xODAtNC5wZGZcbiAqIEhNQUMgLSBodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmMyMTA0LnR4dFxuICovXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBIYXNoZXM7XG5cbiAgZnVuY3Rpb24gdXRmOEVuY29kZShzdHIpIHtcbiAgICB2YXIgeCwgeSwgb3V0cHV0ID0gJycsXG4gICAgICBpID0gLTEsXG4gICAgICBsO1xuXG4gICAgaWYgKHN0ciAmJiBzdHIubGVuZ3RoKSB7XG4gICAgICBsID0gc3RyLmxlbmd0aDtcbiAgICAgIHdoaWxlICgoaSArPSAxKSA8IGwpIHtcbiAgICAgICAgLyogRGVjb2RlIHV0Zi0xNiBzdXJyb2dhdGUgcGFpcnMgKi9cbiAgICAgICAgeCA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB5ID0gaSArIDEgPCBsID8gc3RyLmNoYXJDb2RlQXQoaSArIDEpIDogMDtcbiAgICAgICAgaWYgKDB4RDgwMCA8PSB4ICYmIHggPD0gMHhEQkZGICYmIDB4REMwMCA8PSB5ICYmIHkgPD0gMHhERkZGKSB7XG4gICAgICAgICAgeCA9IDB4MTAwMDAgKyAoKHggJiAweDAzRkYpIDw8IDEwKSArICh5ICYgMHgwM0ZGKTtcbiAgICAgICAgICBpICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgLyogRW5jb2RlIG91dHB1dCBhcyB1dGYtOCAqL1xuICAgICAgICBpZiAoeCA8PSAweDdGKSB7XG4gICAgICAgICAgb3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoeCk7XG4gICAgICAgIH0gZWxzZSBpZiAoeCA8PSAweDdGRikge1xuICAgICAgICAgIG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4QzAgfCAoKHggPj4+IDYpICYgMHgxRiksXG4gICAgICAgICAgICAweDgwIHwgKHggJiAweDNGKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoeCA8PSAweEZGRkYpIHtcbiAgICAgICAgICBvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgweEUwIHwgKCh4ID4+PiAxMikgJiAweDBGKSxcbiAgICAgICAgICAgIDB4ODAgfCAoKHggPj4+IDYpICYgMHgzRiksXG4gICAgICAgICAgICAweDgwIHwgKHggJiAweDNGKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoeCA8PSAweDFGRkZGRikge1xuICAgICAgICAgIG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RjAgfCAoKHggPj4+IDE4KSAmIDB4MDcpLFxuICAgICAgICAgICAgMHg4MCB8ICgoeCA+Pj4gMTIpICYgMHgzRiksXG4gICAgICAgICAgICAweDgwIHwgKCh4ID4+PiA2KSAmIDB4M0YpLFxuICAgICAgICAgICAgMHg4MCB8ICh4ICYgMHgzRikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBmdW5jdGlvbiB1dGY4RGVjb2RlKHN0cikge1xuICAgIHZhciBpLCBhYywgYzEsIGMyLCBjMywgYXJyID0gW10sXG4gICAgICBsO1xuICAgIGkgPSBhYyA9IGMxID0gYzIgPSBjMyA9IDA7XG5cbiAgICBpZiAoc3RyICYmIHN0ci5sZW5ndGgpIHtcbiAgICAgIGwgPSBzdHIubGVuZ3RoO1xuICAgICAgc3RyICs9ICcnO1xuXG4gICAgICB3aGlsZSAoaSA8IGwpIHtcbiAgICAgICAgYzEgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgYWMgKz0gMTtcbiAgICAgICAgaWYgKGMxIDwgMTI4KSB7XG4gICAgICAgICAgYXJyW2FjXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYzEpO1xuICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgfSBlbHNlIGlmIChjMSA+IDE5MSAmJiBjMSA8IDIyNCkge1xuICAgICAgICAgIGMyID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgIGFyclthY10gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCgoYzEgJiAzMSkgPDwgNikgfCAoYzIgJiA2MykpO1xuICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjMiA9IHN0ci5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICAgICAgICBjMyA9IHN0ci5jaGFyQ29kZUF0KGkgKyAyKTtcbiAgICAgICAgICBhcnJbYWNdID0gU3RyaW5nLmZyb21DaGFyQ29kZSgoKGMxICYgMTUpIDw8IDEyKSB8ICgoYzIgJiA2MykgPDwgNikgfCAoYzMgJiA2MykpO1xuICAgICAgICAgIGkgKz0gMztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyLmpvaW4oJycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBpbnRlZ2Vycywgd3JhcHBpbmcgYXQgMl4zMi4gVGhpcyB1c2VzIDE2LWJpdCBvcGVyYXRpb25zIGludGVybmFsbHlcbiAgICogdG8gd29yayBhcm91bmQgYnVncyBpbiBzb21lIEpTIGludGVycHJldGVycy5cbiAgICovXG5cbiAgZnVuY3Rpb24gc2FmZV9hZGQoeCwgeSkge1xuICAgIHZhciBsc3cgPSAoeCAmIDB4RkZGRikgKyAoeSAmIDB4RkZGRiksXG4gICAgICBtc3cgPSAoeCA+PiAxNikgKyAoeSA+PiAxNikgKyAobHN3ID4+IDE2KTtcbiAgICByZXR1cm4gKG1zdyA8PCAxNikgfCAobHN3ICYgMHhGRkZGKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaXR3aXNlIHJvdGF0ZSBhIDMyLWJpdCBudW1iZXIgdG8gdGhlIGxlZnQuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGJpdF9yb2wobnVtLCBjbnQpIHtcbiAgICByZXR1cm4gKG51bSA8PCBjbnQpIHwgKG51bSA+Pj4gKDMyIC0gY250KSk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHJhdyBzdHJpbmcgdG8gYSBoZXggc3RyaW5nXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJzdHIyaGV4KGlucHV0LCBoZXhjYXNlKSB7XG4gICAgdmFyIGhleF90YWIgPSBoZXhjYXNlID8gJzAxMjM0NTY3ODlBQkNERUYnIDogJzAxMjM0NTY3ODlhYmNkZWYnLFxuICAgICAgb3V0cHV0ID0gJycsXG4gICAgICB4LCBpID0gMCxcbiAgICAgIGwgPSBpbnB1dC5sZW5ndGg7XG4gICAgZm9yICg7IGkgPCBsOyBpICs9IDEpIHtcbiAgICAgIHggPSBpbnB1dC5jaGFyQ29kZUF0KGkpO1xuICAgICAgb3V0cHV0ICs9IGhleF90YWIuY2hhckF0KCh4ID4+PiA0KSAmIDB4MEYpICsgaGV4X3RhYi5jaGFyQXQoeCAmIDB4MEYpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgLyoqXG4gICAqIEVuY29kZSBhIHN0cmluZyBhcyB1dGYtMTZcbiAgICovXG5cbiAgZnVuY3Rpb24gc3RyMnJzdHJfdXRmMTZsZShpbnB1dCkge1xuICAgIHZhciBpLCBsID0gaW5wdXQubGVuZ3RoLFxuICAgICAgb3V0cHV0ID0gJyc7XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgb3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoaW5wdXQuY2hhckNvZGVBdChpKSAmIDB4RkYsIChpbnB1dC5jaGFyQ29kZUF0KGkpID4+PiA4KSAmIDB4RkYpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gc3RyMnJzdHJfdXRmMTZiZShpbnB1dCkge1xuICAgIHZhciBpLCBsID0gaW5wdXQubGVuZ3RoLFxuICAgICAgb3V0cHV0ID0gJyc7XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgb3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGlucHV0LmNoYXJDb2RlQXQoaSkgPj4+IDgpICYgMHhGRiwgaW5wdXQuY2hhckNvZGVBdChpKSAmIDB4RkYpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYW4gYXJyYXkgb2YgYmlnLWVuZGlhbiB3b3JkcyB0byBhIHN0cmluZ1xuICAgKi9cblxuICBmdW5jdGlvbiBiaW5iMnJzdHIoaW5wdXQpIHtcbiAgICB2YXIgaSwgbCA9IGlucHV0Lmxlbmd0aCAqIDMyLFxuICAgICAgb3V0cHV0ID0gJyc7XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gOCkge1xuICAgICAgb3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGlucHV0W2kgPj4gNV0gPj4+ICgyNCAtIGkgJSAzMikpICYgMHhGRik7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzIHRvIGEgc3RyaW5nXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGJpbmwycnN0cihpbnB1dCkge1xuICAgIHZhciBpLCBsID0gaW5wdXQubGVuZ3RoICogMzIsXG4gICAgICBvdXRwdXQgPSAnJztcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSA4KSB7XG4gICAgICBvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoaW5wdXRbaSA+PiA1XSA+Pj4gKGkgJSAzMikpICYgMHhGRik7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHJhdyBzdHJpbmcgdG8gYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3Jkc1xuICAgKiBDaGFyYWN0ZXJzID4yNTUgaGF2ZSB0aGVpciBoaWdoLWJ5dGUgc2lsZW50bHkgaWdub3JlZC5cbiAgICovXG5cbiAgZnVuY3Rpb24gcnN0cjJiaW5sKGlucHV0KSB7XG4gICAgdmFyIGksIGwgPSBpbnB1dC5sZW5ndGggKiA4LFxuICAgICAgb3V0cHV0ID0gQXJyYXkoaW5wdXQubGVuZ3RoID4+IDIpLFxuICAgICAgbG8gPSBvdXRwdXQubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsbzsgaSArPSAxKSB7XG4gICAgICBvdXRwdXRbaV0gPSAwO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSA4KSB7XG4gICAgICBvdXRwdXRbaSA+PiA1XSB8PSAoaW5wdXQuY2hhckNvZGVBdChpIC8gOCkgJiAweEZGKSA8PCAoaSAlIDMyKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgcmF3IHN0cmluZyB0byBhbiBhcnJheSBvZiBiaWctZW5kaWFuIHdvcmRzXG4gICAqIENoYXJhY3RlcnMgPjI1NSBoYXZlIHRoZWlyIGhpZ2gtYnl0ZSBzaWxlbnRseSBpZ25vcmVkLlxuICAgKi9cblxuICBmdW5jdGlvbiByc3RyMmJpbmIoaW5wdXQpIHtcbiAgICB2YXIgaSwgbCA9IGlucHV0Lmxlbmd0aCAqIDgsXG4gICAgICBvdXRwdXQgPSBBcnJheShpbnB1dC5sZW5ndGggPj4gMiksXG4gICAgICBsbyA9IG91dHB1dC5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxvOyBpICs9IDEpIHtcbiAgICAgIG91dHB1dFtpXSA9IDA7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDgpIHtcbiAgICAgIG91dHB1dFtpID4+IDVdIHw9IChpbnB1dC5jaGFyQ29kZUF0KGkgLyA4KSAmIDB4RkYpIDw8ICgyNCAtIGkgJSAzMik7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHJhdyBzdHJpbmcgdG8gYW4gYXJiaXRyYXJ5IHN0cmluZyBlbmNvZGluZ1xuICAgKi9cblxuICBmdW5jdGlvbiByc3RyMmFueShpbnB1dCwgZW5jb2RpbmcpIHtcbiAgICB2YXIgZGl2aXNvciA9IGVuY29kaW5nLmxlbmd0aCxcbiAgICAgIHJlbWFpbmRlcnMgPSBBcnJheSgpLFxuICAgICAgaSwgcSwgeCwgbGQsIHF1b3RpZW50LCBkaXZpZGVuZCwgb3V0cHV0LCBmdWxsX2xlbmd0aDtcblxuICAgIC8qIENvbnZlcnQgdG8gYW4gYXJyYXkgb2YgMTYtYml0IGJpZy1lbmRpYW4gdmFsdWVzLCBmb3JtaW5nIHRoZSBkaXZpZGVuZCAqL1xuICAgIGRpdmlkZW5kID0gQXJyYXkoTWF0aC5jZWlsKGlucHV0Lmxlbmd0aCAvIDIpKTtcbiAgICBsZCA9IGRpdmlkZW5kLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGQ7IGkgKz0gMSkge1xuICAgICAgZGl2aWRlbmRbaV0gPSAoaW5wdXQuY2hhckNvZGVBdChpICogMikgPDwgOCkgfCBpbnB1dC5jaGFyQ29kZUF0KGkgKiAyICsgMSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVwZWF0ZWRseSBwZXJmb3JtIGEgbG9uZyBkaXZpc2lvbi4gVGhlIGJpbmFyeSBhcnJheSBmb3JtcyB0aGUgZGl2aWRlbmQsXG4gICAgICogdGhlIGxlbmd0aCBvZiB0aGUgZW5jb2RpbmcgaXMgdGhlIGRpdmlzb3IuIE9uY2UgY29tcHV0ZWQsIHRoZSBxdW90aWVudFxuICAgICAqIGZvcm1zIHRoZSBkaXZpZGVuZCBmb3IgdGhlIG5leHQgc3RlcC4gV2Ugc3RvcCB3aGVuIHRoZSBkaXZpZGVuZCBpcyB6ZXJIYXNoZXMuXG4gICAgICogQWxsIHJlbWFpbmRlcnMgYXJlIHN0b3JlZCBmb3IgbGF0ZXIgdXNlLlxuICAgICAqL1xuICAgIHdoaWxlIChkaXZpZGVuZC5sZW5ndGggPiAwKSB7XG4gICAgICBxdW90aWVudCA9IEFycmF5KCk7XG4gICAgICB4ID0gMDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBkaXZpZGVuZC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB4ID0gKHggPDwgMTYpICsgZGl2aWRlbmRbaV07XG4gICAgICAgIHEgPSBNYXRoLmZsb29yKHggLyBkaXZpc29yKTtcbiAgICAgICAgeCAtPSBxICogZGl2aXNvcjtcbiAgICAgICAgaWYgKHF1b3RpZW50Lmxlbmd0aCA+IDAgfHwgcSA+IDApIHtcbiAgICAgICAgICBxdW90aWVudFtxdW90aWVudC5sZW5ndGhdID0gcTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVtYWluZGVyc1tyZW1haW5kZXJzLmxlbmd0aF0gPSB4O1xuICAgICAgZGl2aWRlbmQgPSBxdW90aWVudDtcbiAgICB9XG5cbiAgICAvKiBDb252ZXJ0IHRoZSByZW1haW5kZXJzIHRvIHRoZSBvdXRwdXQgc3RyaW5nICovXG4gICAgb3V0cHV0ID0gJyc7XG4gICAgZm9yIChpID0gcmVtYWluZGVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgb3V0cHV0ICs9IGVuY29kaW5nLmNoYXJBdChyZW1haW5kZXJzW2ldKTtcbiAgICB9XG5cbiAgICAvKiBBcHBlbmQgbGVhZGluZyB6ZXJvIGVxdWl2YWxlbnRzICovXG4gICAgZnVsbF9sZW5ndGggPSBNYXRoLmNlaWwoaW5wdXQubGVuZ3RoICogOCAvIChNYXRoLmxvZyhlbmNvZGluZy5sZW5ndGgpIC8gTWF0aC5sb2coMikpKTtcbiAgICBmb3IgKGkgPSBvdXRwdXQubGVuZ3RoOyBpIDwgZnVsbF9sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgb3V0cHV0ID0gZW5jb2RpbmdbMF0gKyBvdXRwdXQ7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHJhdyBzdHJpbmcgdG8gYSBiYXNlLTY0IHN0cmluZ1xuICAgKi9cblxuICBmdW5jdGlvbiByc3RyMmI2NChpbnB1dCwgYjY0cGFkKSB7XG4gICAgdmFyIHRhYiA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJyxcbiAgICAgIG91dHB1dCA9ICcnLFxuICAgICAgbGVuID0gaW5wdXQubGVuZ3RoLFxuICAgICAgaSwgaiwgdHJpcGxldDtcbiAgICBiNjRwYWQgPSBiNjRwYWQgfHwgJz0nO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMykge1xuICAgICAgdHJpcGxldCA9IChpbnB1dC5jaGFyQ29kZUF0KGkpIDw8IDE2KSB8IChpICsgMSA8IGxlbiA/IGlucHV0LmNoYXJDb2RlQXQoaSArIDEpIDw8IDggOiAwKSB8IChpICsgMiA8IGxlbiA/IGlucHV0LmNoYXJDb2RlQXQoaSArIDIpIDogMCk7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgNDsgaiArPSAxKSB7XG4gICAgICAgIGlmIChpICogOCArIGogKiA2ID4gaW5wdXQubGVuZ3RoICogOCkge1xuICAgICAgICAgIG91dHB1dCArPSBiNjRwYWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0cHV0ICs9IHRhYi5jaGFyQXQoKHRyaXBsZXQgPj4+IDYgKiAoMyAtIGopKSAmIDB4M0YpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBIYXNoZXMgPSB7XG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IHtTdHJpbmd9IHZlcnNpb25cbiAgICAgKiBAcmVhZG9ubHlcbiAgICAgKi9cbiAgICBWRVJTSU9OOiAnMS4wLjYnLFxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIgSGFzaGVzXG4gICAgICogQGNsYXNzIEJhc2U2NFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIEJhc2U2NDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBwcml2YXRlIHByb3BlcnRpZXNcbiAgICAgIHZhciB0YWIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLycsXG4gICAgICAgIHBhZCA9ICc9JywgLy8gZGVmYXVsdCBwYWQgYWNjb3JkaW5nIHdpdGggdGhlIFJGQyBzdGFuZGFyZFxuICAgICAgICB1cmwgPSBmYWxzZSwgLy8gVVJMIGVuY29kaW5nIHN1cHBvcnQgQHRvZG9cbiAgICAgICAgdXRmOCA9IHRydWU7IC8vIGJ5IGRlZmF1bHQgZW5hYmxlIFVURi04IHN1cHBvcnQgZW5jb2RpbmdcblxuICAgICAgLy8gcHVibGljIG1ldGhvZCBmb3IgZW5jb2RpbmdcbiAgICAgIHRoaXMuZW5jb2RlID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIGksIGosIHRyaXBsZXQsXG4gICAgICAgICAgb3V0cHV0ID0gJycsXG4gICAgICAgICAgbGVuID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgICAgIHBhZCA9IHBhZCB8fCAnPSc7XG4gICAgICAgIGlucHV0ID0gKHV0ZjgpID8gdXRmOEVuY29kZShpbnB1dCkgOiBpbnB1dDtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDMpIHtcbiAgICAgICAgICB0cmlwbGV0ID0gKGlucHV0LmNoYXJDb2RlQXQoaSkgPDwgMTYpIHwgKGkgKyAxIDwgbGVuID8gaW5wdXQuY2hhckNvZGVBdChpICsgMSkgPDwgOCA6IDApIHwgKGkgKyAyIDwgbGVuID8gaW5wdXQuY2hhckNvZGVBdChpICsgMikgOiAwKTtcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgNDsgaiArPSAxKSB7XG4gICAgICAgICAgICBpZiAoaSAqIDggKyBqICogNiA+IGxlbiAqIDgpIHtcbiAgICAgICAgICAgICAgb3V0cHV0ICs9IHBhZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG91dHB1dCArPSB0YWIuY2hhckF0KCh0cmlwbGV0ID4+PiA2ICogKDMgLSBqKSkgJiAweDNGKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH07XG5cbiAgICAgIC8vIHB1YmxpYyBtZXRob2QgZm9yIGRlY29kaW5nXG4gICAgICB0aGlzLmRlY29kZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIC8vIHZhciBiNjQgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuICAgICAgICB2YXIgaSwgbzEsIG8yLCBvMywgaDEsIGgyLCBoMywgaDQsIGJpdHMsIGFjLFxuICAgICAgICAgIGRlYyA9ICcnLFxuICAgICAgICAgIGFyciA9IFtdO1xuICAgICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgICAgICB9XG5cbiAgICAgICAgaSA9IGFjID0gMDtcbiAgICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFwnICsgcGFkLCAnZ2knKSwgJycpOyAvLyB1c2UgJz0nXG4gICAgICAgIC8vaW5wdXQgKz0gJyc7XG5cbiAgICAgICAgZG8geyAvLyB1bnBhY2sgZm91ciBoZXhldHMgaW50byB0aHJlZSBvY3RldHMgdXNpbmcgaW5kZXggcG9pbnRzIGluIGI2NFxuICAgICAgICAgIGgxID0gdGFiLmluZGV4T2YoaW5wdXQuY2hhckF0KGkgKz0gMSkpO1xuICAgICAgICAgIGgyID0gdGFiLmluZGV4T2YoaW5wdXQuY2hhckF0KGkgKz0gMSkpO1xuICAgICAgICAgIGgzID0gdGFiLmluZGV4T2YoaW5wdXQuY2hhckF0KGkgKz0gMSkpO1xuICAgICAgICAgIGg0ID0gdGFiLmluZGV4T2YoaW5wdXQuY2hhckF0KGkgKz0gMSkpO1xuXG4gICAgICAgICAgYml0cyA9IGgxIDw8IDE4IHwgaDIgPDwgMTIgfCBoMyA8PCA2IHwgaDQ7XG5cbiAgICAgICAgICBvMSA9IGJpdHMgPj4gMTYgJiAweGZmO1xuICAgICAgICAgIG8yID0gYml0cyA+PiA4ICYgMHhmZjtcbiAgICAgICAgICBvMyA9IGJpdHMgJiAweGZmO1xuICAgICAgICAgIGFjICs9IDE7XG5cbiAgICAgICAgICBpZiAoaDMgPT09IDY0KSB7XG4gICAgICAgICAgICBhcnJbYWNdID0gU3RyaW5nLmZyb21DaGFyQ29kZShvMSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChoNCA9PT0gNjQpIHtcbiAgICAgICAgICAgIGFyclthY10gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG8xLCBvMik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFyclthY10gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG8xLCBvMiwgbzMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoaSA8IGlucHV0Lmxlbmd0aCk7XG5cbiAgICAgICAgZGVjID0gYXJyLmpvaW4oJycpO1xuICAgICAgICBkZWMgPSAodXRmOCkgPyB1dGY4RGVjb2RlKGRlYykgOiBkZWM7XG5cbiAgICAgICAgcmV0dXJuIGRlYztcbiAgICAgIH07XG5cbiAgICAgIC8vIHNldCBjdXN0b20gcGFkIHN0cmluZ1xuICAgICAgdGhpcy5zZXRQYWQgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgcGFkID0gc3RyIHx8IHBhZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLy8gc2V0IGN1c3RvbSB0YWIgc3RyaW5nIGNoYXJhY3RlcnNcbiAgICAgIHRoaXMuc2V0VGFiID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHRhYiA9IHN0ciB8fCB0YWI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICAgIHRoaXMuc2V0VVRGOCA9IGZ1bmN0aW9uKGJvb2wpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib29sID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICB1dGY4ID0gYm9vbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENSQy0zMiBjYWxjdWxhdGlvblxuICAgICAqIEBtZW1iZXIgSGFzaGVzXG4gICAgICogQG1ldGhvZCBDUkMzMlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIElucHV0IFN0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBDUkMzMjogZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgY3JjID0gMCxcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwLFxuICAgICAgICB0YWJsZSwgaSwgaVRvcDtcbiAgICAgIHN0ciA9IHV0ZjhFbmNvZGUoc3RyKTtcblxuICAgICAgdGFibGUgPSBbXG4gICAgICAgICcwMDAwMDAwMCA3NzA3MzA5NiBFRTBFNjEyQyA5OTA5NTFCQSAwNzZEQzQxOSA3MDZBRjQ4RiBFOTYzQTUzNSA5RTY0OTVBMyAwRURCODgzMiAnLFxuICAgICAgICAnNzlEQ0I4QTQgRTBENUU5MUUgOTdEMkQ5ODggMDlCNjRDMkIgN0VCMTdDQkQgRTdCODJEMDcgOTBCRjFEOTEgMURCNzEwNjQgNkFCMDIwRjIgRjNCOTcxNDggJyxcbiAgICAgICAgJzg0QkU0MURFIDFBREFENDdEIDZERERFNEVCIEY0RDRCNTUxIDgzRDM4NUM3IDEzNkM5ODU2IDY0NkJBOEMwIEZENjJGOTdBIDhBNjVDOUVDIDE0MDE1QzRGICcsXG4gICAgICAgICc2MzA2NkNEOSBGQTBGM0Q2MyA4RDA4MERGNSAzQjZFMjBDOCA0QzY5MTA1RSBENTYwNDFFNCBBMjY3NzE3MiAzQzAzRTREMSA0QjA0RDQ0NyBEMjBEODVGRCAnLFxuICAgICAgICAnQTUwQUI1NkIgMzVCNUE4RkEgNDJCMjk4NkMgREJCQkM5RDYgQUNCQ0Y5NDAgMzJEODZDRTMgNDVERjVDNzUgRENENjBEQ0YgQUJEMTNENTkgMjZEOTMwQUMgJyxcbiAgICAgICAgJzUxREUwMDNBIEM4RDc1MTgwIEJGRDA2MTE2IDIxQjRGNEI1IDU2QjNDNDIzIENGQkE5NTk5IEI4QkRBNTBGIDI4MDJCODlFIDVGMDU4ODA4IEM2MENEOUIyICcsXG4gICAgICAgICdCMTBCRTkyNCAyRjZGN0M4NyA1ODY4NEMxMSBDMTYxMURBQiBCNjY2MkQzRCA3NkRDNDE5MCAwMURCNzEwNiA5OEQyMjBCQyBFRkQ1MTAyQSA3MUIxODU4OSAnLFxuICAgICAgICAnMDZCNkI1MUYgOUZCRkU0QTUgRThCOEQ0MzMgNzgwN0M5QTIgMEYwMEY5MzQgOTYwOUE4OEUgRTEwRTk4MTggN0Y2QTBEQkIgMDg2RDNEMkQgOTE2NDZDOTcgJyxcbiAgICAgICAgJ0U2NjM1QzAxIDZCNkI1MUY0IDFDNkM2MTYyIDg1NjUzMEQ4IEYyNjIwMDRFIDZDMDY5NUVEIDFCMDFBNTdCIDgyMDhGNEMxIEY1MEZDNDU3IDY1QjBEOUM2ICcsXG4gICAgICAgICcxMkI3RTk1MCA4QkJFQjhFQSBGQ0I5ODg3QyA2MkREMURERiAxNURBMkQ0OSA4Q0QzN0NGMyBGQkQ0NEM2NSA0REIyNjE1OCAzQUI1NTFDRSBBM0JDMDA3NCAnLFxuICAgICAgICAnRDRCQjMwRTIgNEFERkE1NDEgM0REODk1RDcgQTREMUM0NkQgRDNENkY0RkIgNDM2OUU5NkEgMzQ2RUQ5RkMgQUQ2Nzg4NDYgREE2MEI4RDAgNDQwNDJENzMgJyxcbiAgICAgICAgJzMzMDMxREU1IEFBMEE0QzVGIEREMEQ3Q0M5IDUwMDU3MTNDIDI3MDI0MUFBIEJFMEIxMDEwIEM5MEMyMDg2IDU3NjhCNTI1IDIwNkY4NUIzIEI5NjZENDA5ICcsXG4gICAgICAgICdDRTYxRTQ5RiA1RURFRjkwRSAyOUQ5Qzk5OCBCMEQwOTgyMiBDN0Q3QThCNCA1OUIzM0QxNyAyRUI0MEQ4MSBCN0JENUMzQiBDMEJBNkNBRCBFREI4ODMyMCAnLFxuICAgICAgICAnOUFCRkIzQjYgMDNCNkUyMEMgNzRCMUQyOUEgRUFENTQ3MzkgOUREMjc3QUYgMDREQjI2MTUgNzNEQzE2ODMgRTM2MzBCMTIgOTQ2NDNCODQgMEQ2RDZBM0UgJyxcbiAgICAgICAgJzdBNkE1QUE4IEU0MEVDRjBCIDkzMDlGRjlEIDBBMDBBRTI3IDdEMDc5RUIxIEYwMEY5MzQ0IDg3MDhBM0QyIDFFMDFGMjY4IDY5MDZDMkZFIEY3NjI1NzVEICcsXG4gICAgICAgICc4MDY1NjdDQiAxOTZDMzY3MSA2RTZCMDZFNyBGRUQ0MUI3NiA4OUQzMkJFMCAxMERBN0E1QSA2N0RENEFDQyBGOUI5REY2RiA4RUJFRUZGOSAxN0I3QkU0MyAnLFxuICAgICAgICAnNjBCMDhFRDUgRDZENkEzRTggQTFEMTkzN0UgMzhEOEMyQzQgNEZERkYyNTIgRDFCQjY3RjEgQTZCQzU3NjcgM0ZCNTA2REQgNDhCMjM2NEIgRDgwRDJCREEgJyxcbiAgICAgICAgJ0FGMEExQjRDIDM2MDM0QUY2IDQxMDQ3QTYwIERGNjBFRkMzIEE4NjdERjU1IDMxNkU4RUVGIDQ2NjlCRTc5IENCNjFCMzhDIEJDNjY4MzFBIDI1NkZEMkEwICcsXG4gICAgICAgICc1MjY4RTIzNiBDQzBDNzc5NSBCQjBCNDcwMyAyMjAyMTZCOSA1NTA1MjYyRiBDNUJBM0JCRSBCMkJEMEIyOCAyQkI0NUE5MiA1Q0IzNkEwNCBDMkQ3RkZBNyAnLFxuICAgICAgICAnQjVEMENGMzEgMkNEOTlFOEIgNUJERUFFMUQgOUI2NEMyQjAgRUM2M0YyMjYgNzU2QUEzOUMgMDI2RDkzMEEgOUMwOTA2QTkgRUIwRTM2M0YgNzIwNzY3ODUgJyxcbiAgICAgICAgJzA1MDA1NzEzIDk1QkY0QTgyIEUyQjg3QTE0IDdCQjEyQkFFIDBDQjYxQjM4IDkyRDI4RTlCIEU1RDVCRTBEIDdDRENFRkI3IDBCREJERjIxIDg2RDNEMkQ0ICcsXG4gICAgICAgICdGMUQ0RTI0MiA2OEREQjNGOCAxRkRBODM2RSA4MUJFMTZDRCBGNkI5MjY1QiA2RkIwNzdFMSAxOEI3NDc3NyA4ODA4NUFFNiBGRjBGNkE3MCA2NjA2M0JDQSAnLFxuICAgICAgICAnMTEwMTBCNUMgOEY2NTlFRkYgRjg2MkFFNjkgNjE2QkZGRDMgMTY2Q0NGNDUgQTAwQUUyNzggRDcwREQyRUUgNEUwNDgzNTQgMzkwM0IzQzIgQTc2NzI2NjEgJyxcbiAgICAgICAgJ0QwNjAxNkY3IDQ5Njk0NzREIDNFNkU3N0RCIEFFRDE2QTRBIEQ5RDY1QURDIDQwREYwQjY2IDM3RDgzQkYwIEE5QkNBRTUzIERFQkI5RUM1IDQ3QjJDRjdGICcsXG4gICAgICAgICczMEI1RkZFOSBCREJERjIxQyBDQUJBQzI4QSA1M0IzOTMzMCAyNEI0QTNBNiBCQUQwMzYwNSBDREQ3MDY5MyA1NERFNTcyOSAyM0Q5NjdCRiBCMzY2N0EyRSAnLFxuICAgICAgICAnQzQ2MTRBQjggNUQ2ODFCMDIgMkE2RjJCOTQgQjQwQkJFMzcgQzMwQzhFQTEgNUEwNURGMUIgMkQwMkVGOEQnXG4gICAgICBdLmpvaW4oJycpO1xuXG4gICAgICBjcmMgPSBjcmMgXiAoLTEpO1xuICAgICAgZm9yIChpID0gMCwgaVRvcCA9IHN0ci5sZW5ndGg7IGkgPCBpVG9wOyBpICs9IDEpIHtcbiAgICAgICAgeSA9IChjcmMgXiBzdHIuY2hhckNvZGVBdChpKSkgJiAweEZGO1xuICAgICAgICB4ID0gJzB4JyArIHRhYmxlLnN1YnN0cih5ICogOSwgOCk7XG4gICAgICAgIGNyYyA9IChjcmMgPj4+IDgpIF4geDtcbiAgICAgIH1cbiAgICAgIC8vIGFsd2F5cyByZXR1cm4gYSBwb3NpdGl2ZSBudW1iZXIgKHRoYXQncyB3aGF0ID4+PiAwIGRvZXMpXG4gICAgICByZXR1cm4gKGNyYyBeICgtMSkpID4+PiAwO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQG1lbWJlciBIYXNoZXNcbiAgICAgKiBAY2xhc3MgTUQ1XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtjb25maWddXG4gICAgICpcbiAgICAgKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFJTQSBEYXRhIFNlY3VyaXR5LCBJbmMuIE1ENSBNZXNzYWdlXG4gICAgICogRGlnZXN0IEFsZ29yaXRobSwgYXMgZGVmaW5lZCBpbiBSRkMgMTMyMS5cbiAgICAgKiBWZXJzaW9uIDIuMiBDb3B5cmlnaHQgKEMpIFBhdWwgSm9obnN0b24gMTk5OSAtIDIwMDlcbiAgICAgKiBPdGhlciBjb250cmlidXRvcnM6IEdyZWcgSG9sdCwgQW5kcmV3IEtlcGVydCwgWWRuYXIsIExvc3RpbmV0XG4gICAgICogU2VlIDxodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1PiBmb3IgbW9yZSBpbmZIYXNoZXMuXG4gICAgICovXG4gICAgTUQ1OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAvKipcbiAgICAgICAqIFByaXZhdGUgY29uZmlnIHByb3BlcnRpZXMuIFlvdSBtYXkgbmVlZCB0byB0d2VhayB0aGVzZSB0byBiZSBjb21wYXRpYmxlIHdpdGhcbiAgICAgICAqIHRoZSBzZXJ2ZXItc2lkZSwgYnV0IHRoZSBkZWZhdWx0cyB3b3JrIGluIG1vc3QgY2FzZXMuXG4gICAgICAgKiBTZWUge0BsaW5rIEhhc2hlcy5NRDUjbWV0aG9kLXNldFVwcGVyQ2FzZX0gYW5kIHtAbGluayBIYXNoZXMuU0hBMSNtZXRob2Qtc2V0VXBwZXJDYXNlfVxuICAgICAgICovXG4gICAgICB2YXIgaGV4Y2FzZSA9IChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnVwcGVyY2FzZSA9PT0gJ2Jvb2xlYW4nKSA/IG9wdGlvbnMudXBwZXJjYXNlIDogZmFsc2UsIC8vIGhleGFkZWNpbWFsIG91dHB1dCBjYXNlIGZvcm1hdC4gZmFsc2UgLSBsb3dlcmNhc2U7IHRydWUgLSB1cHBlcmNhc2VcbiAgICAgICAgYjY0cGFkID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMucGFkID09PSAnc3RyaW5nJykgPyBvcHRpb25zLnBhZCA6ICc9JywgLy8gYmFzZS02NCBwYWQgY2hhcmFjdGVyLiBEZWZhdWx0cyB0byAnPScgZm9yIHN0cmljdCBSRkMgY29tcGxpYW5jZVxuICAgICAgICB1dGY4ID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMudXRmOCA9PT0gJ2Jvb2xlYW4nKSA/IG9wdGlvbnMudXRmOCA6IHRydWU7IC8vIGVuYWJsZS9kaXNhYmxlIHV0ZjggZW5jb2RpbmdcblxuICAgICAgLy8gcHJpdmlsZWdlZCAocHVibGljKSBtZXRob2RzXG4gICAgICB0aGlzLmhleCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyaGV4KHJzdHIocywgdXRmOCksIGhleGNhc2UpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYjY0ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cjJiNjQocnN0cihzKSwgYjY0cGFkKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmFueSA9IGZ1bmN0aW9uKHMsIGUpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYW55KHJzdHIocywgdXRmOCksIGUpO1xuICAgICAgfTtcbiAgICAgIHRoaXMucmF3ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cihzLCB1dGY4KTtcbiAgICAgIH07XG4gICAgICB0aGlzLmhleF9obWFjID0gZnVuY3Rpb24oaywgZCkge1xuICAgICAgICByZXR1cm4gcnN0cjJoZXgocnN0cl9obWFjKGssIGQpLCBoZXhjYXNlKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmI2NF9obWFjID0gZnVuY3Rpb24oaywgZCkge1xuICAgICAgICByZXR1cm4gcnN0cjJiNjQocnN0cl9obWFjKGssIGQpLCBiNjRwYWQpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYW55X2htYWMgPSBmdW5jdGlvbihrLCBkLCBlKSB7XG4gICAgICAgIHJldHVybiByc3RyMmFueShyc3RyX2htYWMoaywgZCksIGUpO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogUGVyZm9ybSBhIHNpbXBsZSBzZWxmLXRlc3QgdG8gc2VlIGlmIHRoZSBWTSBpcyB3b3JraW5nXG4gICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IEhleGFkZWNpbWFsIGhhc2ggc2FtcGxlXG4gICAgICAgKi9cbiAgICAgIHRoaXMudm1fdGVzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaGV4KCdhYmMnKS50b0xvd2VyQ2FzZSgpID09PSAnOTAwMTUwOTgzY2QyNGZiMGQ2OTYzZjdkMjhlMTdmNzInO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogRW5hYmxlL2Rpc2FibGUgdXBwZXJjYXNlIGhleGFkZWNpbWFsIHJldHVybmVkIHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtCb29sZWFufVxuICAgICAgICogQHJldHVybiB7T2JqZWN0fSB0aGlzXG4gICAgICAgKi9cbiAgICAgIHRoaXMuc2V0VXBwZXJDYXNlID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIGhleGNhc2UgPSBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogRGVmaW5lcyBhIGJhc2U2NCBwYWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gUGFkXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRQYWQgPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIGI2NHBhZCA9IGEgfHwgYjY0cGFkO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIERlZmluZXMgYSBiYXNlNjQgcGFkIHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtCb29sZWFufVxuICAgICAgICogQHJldHVybiB7T2JqZWN0fSBbdGhpc11cbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRVVEY4ID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIHV0ZjggPSBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgLy8gcHJpdmF0ZSBtZXRob2RzXG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBNRDUgb2YgYSByYXcgc3RyaW5nXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gcnN0cihzKSB7XG4gICAgICAgIHMgPSAodXRmOCkgPyB1dGY4RW5jb2RlKHMpIDogcztcbiAgICAgICAgcmV0dXJuIGJpbmwycnN0cihiaW5sKHJzdHIyYmlubChzKSwgcy5sZW5ndGggKiA4KSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBITUFDLU1ENSwgb2YgYSBrZXkgYW5kIHNvbWUgZGF0YSAocmF3IHN0cmluZ3MpXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gcnN0cl9obWFjKGtleSwgZGF0YSkge1xuICAgICAgICB2YXIgYmtleSwgaXBhZCwgb3BhZCwgaGFzaCwgaTtcblxuICAgICAgICBrZXkgPSAodXRmOCkgPyB1dGY4RW5jb2RlKGtleSkgOiBrZXk7XG4gICAgICAgIGRhdGEgPSAodXRmOCkgPyB1dGY4RW5jb2RlKGRhdGEpIDogZGF0YTtcbiAgICAgICAgYmtleSA9IHJzdHIyYmlubChrZXkpO1xuICAgICAgICBpZiAoYmtleS5sZW5ndGggPiAxNikge1xuICAgICAgICAgIGJrZXkgPSBiaW5sKGJrZXksIGtleS5sZW5ndGggKiA4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlwYWQgPSBBcnJheSgxNiksIG9wYWQgPSBBcnJheSgxNik7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNjsgaSArPSAxKSB7XG4gICAgICAgICAgaXBhZFtpXSA9IGJrZXlbaV0gXiAweDM2MzYzNjM2O1xuICAgICAgICAgIG9wYWRbaV0gPSBia2V5W2ldIF4gMHg1QzVDNUM1QztcbiAgICAgICAgfVxuICAgICAgICBoYXNoID0gYmlubChpcGFkLmNvbmNhdChyc3RyMmJpbmwoZGF0YSkpLCA1MTIgKyBkYXRhLmxlbmd0aCAqIDgpO1xuICAgICAgICByZXR1cm4gYmlubDJyc3RyKGJpbmwob3BhZC5jb25jYXQoaGFzaCksIDUxMiArIDEyOCkpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENhbGN1bGF0ZSB0aGUgTUQ1IG9mIGFuIGFycmF5IG9mIGxpdHRsZS1lbmRpYW4gd29yZHMsIGFuZCBhIGJpdCBsZW5ndGguXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gYmlubCh4LCBsZW4pIHtcbiAgICAgICAgdmFyIGksIG9sZGEsIG9sZGIsIG9sZGMsIG9sZGQsXG4gICAgICAgICAgYSA9IDE3MzI1ODQxOTMsXG4gICAgICAgICAgYiA9IC0yNzE3MzM4NzksXG4gICAgICAgICAgYyA9IC0xNzMyNTg0MTk0LFxuICAgICAgICAgIGQgPSAyNzE3MzM4Nzg7XG5cbiAgICAgICAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgICAgICAgeFtsZW4gPj4gNV0gfD0gMHg4MCA8PCAoKGxlbikgJSAzMik7XG4gICAgICAgIHhbKCgobGVuICsgNjQpID4+PiA5KSA8PCA0KSArIDE0XSA9IGxlbjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkgKz0gMTYpIHtcbiAgICAgICAgICBvbGRhID0gYTtcbiAgICAgICAgICBvbGRiID0gYjtcbiAgICAgICAgICBvbGRjID0gYztcbiAgICAgICAgICBvbGRkID0gZDtcblxuICAgICAgICAgIGEgPSBtZDVfZmYoYSwgYiwgYywgZCwgeFtpICsgMF0sIDcsIC02ODA4NzY5MzYpO1xuICAgICAgICAgIGQgPSBtZDVfZmYoZCwgYSwgYiwgYywgeFtpICsgMV0sIDEyLCAtMzg5NTY0NTg2KTtcbiAgICAgICAgICBjID0gbWQ1X2ZmKGMsIGQsIGEsIGIsIHhbaSArIDJdLCAxNywgNjA2MTA1ODE5KTtcbiAgICAgICAgICBiID0gbWQ1X2ZmKGIsIGMsIGQsIGEsIHhbaSArIDNdLCAyMiwgLTEwNDQ1MjUzMzApO1xuICAgICAgICAgIGEgPSBtZDVfZmYoYSwgYiwgYywgZCwgeFtpICsgNF0sIDcsIC0xNzY0MTg4OTcpO1xuICAgICAgICAgIGQgPSBtZDVfZmYoZCwgYSwgYiwgYywgeFtpICsgNV0sIDEyLCAxMjAwMDgwNDI2KTtcbiAgICAgICAgICBjID0gbWQ1X2ZmKGMsIGQsIGEsIGIsIHhbaSArIDZdLCAxNywgLTE0NzMyMzEzNDEpO1xuICAgICAgICAgIGIgPSBtZDVfZmYoYiwgYywgZCwgYSwgeFtpICsgN10sIDIyLCAtNDU3MDU5ODMpO1xuICAgICAgICAgIGEgPSBtZDVfZmYoYSwgYiwgYywgZCwgeFtpICsgOF0sIDcsIDE3NzAwMzU0MTYpO1xuICAgICAgICAgIGQgPSBtZDVfZmYoZCwgYSwgYiwgYywgeFtpICsgOV0sIDEyLCAtMTk1ODQxNDQxNyk7XG4gICAgICAgICAgYyA9IG1kNV9mZihjLCBkLCBhLCBiLCB4W2kgKyAxMF0sIDE3LCAtNDIwNjMpO1xuICAgICAgICAgIGIgPSBtZDVfZmYoYiwgYywgZCwgYSwgeFtpICsgMTFdLCAyMiwgLTE5OTA0MDQxNjIpO1xuICAgICAgICAgIGEgPSBtZDVfZmYoYSwgYiwgYywgZCwgeFtpICsgMTJdLCA3LCAxODA0NjAzNjgyKTtcbiAgICAgICAgICBkID0gbWQ1X2ZmKGQsIGEsIGIsIGMsIHhbaSArIDEzXSwgMTIsIC00MDM0MTEwMSk7XG4gICAgICAgICAgYyA9IG1kNV9mZihjLCBkLCBhLCBiLCB4W2kgKyAxNF0sIDE3LCAtMTUwMjAwMjI5MCk7XG4gICAgICAgICAgYiA9IG1kNV9mZihiLCBjLCBkLCBhLCB4W2kgKyAxNV0sIDIyLCAxMjM2NTM1MzI5KTtcblxuICAgICAgICAgIGEgPSBtZDVfZ2coYSwgYiwgYywgZCwgeFtpICsgMV0sIDUsIC0xNjU3OTY1MTApO1xuICAgICAgICAgIGQgPSBtZDVfZ2coZCwgYSwgYiwgYywgeFtpICsgNl0sIDksIC0xMDY5NTAxNjMyKTtcbiAgICAgICAgICBjID0gbWQ1X2dnKGMsIGQsIGEsIGIsIHhbaSArIDExXSwgMTQsIDY0MzcxNzcxMyk7XG4gICAgICAgICAgYiA9IG1kNV9nZyhiLCBjLCBkLCBhLCB4W2kgKyAwXSwgMjAsIC0zNzM4OTczMDIpO1xuICAgICAgICAgIGEgPSBtZDVfZ2coYSwgYiwgYywgZCwgeFtpICsgNV0sIDUsIC03MDE1NTg2OTEpO1xuICAgICAgICAgIGQgPSBtZDVfZ2coZCwgYSwgYiwgYywgeFtpICsgMTBdLCA5LCAzODAxNjA4Myk7XG4gICAgICAgICAgYyA9IG1kNV9nZyhjLCBkLCBhLCBiLCB4W2kgKyAxNV0sIDE0LCAtNjYwNDc4MzM1KTtcbiAgICAgICAgICBiID0gbWQ1X2dnKGIsIGMsIGQsIGEsIHhbaSArIDRdLCAyMCwgLTQwNTUzNzg0OCk7XG4gICAgICAgICAgYSA9IG1kNV9nZyhhLCBiLCBjLCBkLCB4W2kgKyA5XSwgNSwgNTY4NDQ2NDM4KTtcbiAgICAgICAgICBkID0gbWQ1X2dnKGQsIGEsIGIsIGMsIHhbaSArIDE0XSwgOSwgLTEwMTk4MDM2OTApO1xuICAgICAgICAgIGMgPSBtZDVfZ2coYywgZCwgYSwgYiwgeFtpICsgM10sIDE0LCAtMTg3MzYzOTYxKTtcbiAgICAgICAgICBiID0gbWQ1X2dnKGIsIGMsIGQsIGEsIHhbaSArIDhdLCAyMCwgMTE2MzUzMTUwMSk7XG4gICAgICAgICAgYSA9IG1kNV9nZyhhLCBiLCBjLCBkLCB4W2kgKyAxM10sIDUsIC0xNDQ0NjgxNDY3KTtcbiAgICAgICAgICBkID0gbWQ1X2dnKGQsIGEsIGIsIGMsIHhbaSArIDJdLCA5LCAtNTE0MDM3ODQpO1xuICAgICAgICAgIGMgPSBtZDVfZ2coYywgZCwgYSwgYiwgeFtpICsgN10sIDE0LCAxNzM1MzI4NDczKTtcbiAgICAgICAgICBiID0gbWQ1X2dnKGIsIGMsIGQsIGEsIHhbaSArIDEyXSwgMjAsIC0xOTI2NjA3NzM0KTtcblxuICAgICAgICAgIGEgPSBtZDVfaGgoYSwgYiwgYywgZCwgeFtpICsgNV0sIDQsIC0zNzg1NTgpO1xuICAgICAgICAgIGQgPSBtZDVfaGgoZCwgYSwgYiwgYywgeFtpICsgOF0sIDExLCAtMjAyMjU3NDQ2Myk7XG4gICAgICAgICAgYyA9IG1kNV9oaChjLCBkLCBhLCBiLCB4W2kgKyAxMV0sIDE2LCAxODM5MDMwNTYyKTtcbiAgICAgICAgICBiID0gbWQ1X2hoKGIsIGMsIGQsIGEsIHhbaSArIDE0XSwgMjMsIC0zNTMwOTU1Nik7XG4gICAgICAgICAgYSA9IG1kNV9oaChhLCBiLCBjLCBkLCB4W2kgKyAxXSwgNCwgLTE1MzA5OTIwNjApO1xuICAgICAgICAgIGQgPSBtZDVfaGgoZCwgYSwgYiwgYywgeFtpICsgNF0sIDExLCAxMjcyODkzMzUzKTtcbiAgICAgICAgICBjID0gbWQ1X2hoKGMsIGQsIGEsIGIsIHhbaSArIDddLCAxNiwgLTE1NTQ5NzYzMik7XG4gICAgICAgICAgYiA9IG1kNV9oaChiLCBjLCBkLCBhLCB4W2kgKyAxMF0sIDIzLCAtMTA5NDczMDY0MCk7XG4gICAgICAgICAgYSA9IG1kNV9oaChhLCBiLCBjLCBkLCB4W2kgKyAxM10sIDQsIDY4MTI3OTE3NCk7XG4gICAgICAgICAgZCA9IG1kNV9oaChkLCBhLCBiLCBjLCB4W2kgKyAwXSwgMTEsIC0zNTg1MzcyMjIpO1xuICAgICAgICAgIGMgPSBtZDVfaGgoYywgZCwgYSwgYiwgeFtpICsgM10sIDE2LCAtNzIyNTIxOTc5KTtcbiAgICAgICAgICBiID0gbWQ1X2hoKGIsIGMsIGQsIGEsIHhbaSArIDZdLCAyMywgNzYwMjkxODkpO1xuICAgICAgICAgIGEgPSBtZDVfaGgoYSwgYiwgYywgZCwgeFtpICsgOV0sIDQsIC02NDAzNjQ0ODcpO1xuICAgICAgICAgIGQgPSBtZDVfaGgoZCwgYSwgYiwgYywgeFtpICsgMTJdLCAxMSwgLTQyMTgxNTgzNSk7XG4gICAgICAgICAgYyA9IG1kNV9oaChjLCBkLCBhLCBiLCB4W2kgKyAxNV0sIDE2LCA1MzA3NDI1MjApO1xuICAgICAgICAgIGIgPSBtZDVfaGgoYiwgYywgZCwgYSwgeFtpICsgMl0sIDIzLCAtOTk1MzM4NjUxKTtcblxuICAgICAgICAgIGEgPSBtZDVfaWkoYSwgYiwgYywgZCwgeFtpICsgMF0sIDYsIC0xOTg2MzA4NDQpO1xuICAgICAgICAgIGQgPSBtZDVfaWkoZCwgYSwgYiwgYywgeFtpICsgN10sIDEwLCAxMTI2ODkxNDE1KTtcbiAgICAgICAgICBjID0gbWQ1X2lpKGMsIGQsIGEsIGIsIHhbaSArIDE0XSwgMTUsIC0xNDE2MzU0OTA1KTtcbiAgICAgICAgICBiID0gbWQ1X2lpKGIsIGMsIGQsIGEsIHhbaSArIDVdLCAyMSwgLTU3NDM0MDU1KTtcbiAgICAgICAgICBhID0gbWQ1X2lpKGEsIGIsIGMsIGQsIHhbaSArIDEyXSwgNiwgMTcwMDQ4NTU3MSk7XG4gICAgICAgICAgZCA9IG1kNV9paShkLCBhLCBiLCBjLCB4W2kgKyAzXSwgMTAsIC0xODk0OTg2NjA2KTtcbiAgICAgICAgICBjID0gbWQ1X2lpKGMsIGQsIGEsIGIsIHhbaSArIDEwXSwgMTUsIC0xMDUxNTIzKTtcbiAgICAgICAgICBiID0gbWQ1X2lpKGIsIGMsIGQsIGEsIHhbaSArIDFdLCAyMSwgLTIwNTQ5MjI3OTkpO1xuICAgICAgICAgIGEgPSBtZDVfaWkoYSwgYiwgYywgZCwgeFtpICsgOF0sIDYsIDE4NzMzMTMzNTkpO1xuICAgICAgICAgIGQgPSBtZDVfaWkoZCwgYSwgYiwgYywgeFtpICsgMTVdLCAxMCwgLTMwNjExNzQ0KTtcbiAgICAgICAgICBjID0gbWQ1X2lpKGMsIGQsIGEsIGIsIHhbaSArIDZdLCAxNSwgLTE1NjAxOTgzODApO1xuICAgICAgICAgIGIgPSBtZDVfaWkoYiwgYywgZCwgYSwgeFtpICsgMTNdLCAyMSwgMTMwOTE1MTY0OSk7XG4gICAgICAgICAgYSA9IG1kNV9paShhLCBiLCBjLCBkLCB4W2kgKyA0XSwgNiwgLTE0NTUyMzA3MCk7XG4gICAgICAgICAgZCA9IG1kNV9paShkLCBhLCBiLCBjLCB4W2kgKyAxMV0sIDEwLCAtMTEyMDIxMDM3OSk7XG4gICAgICAgICAgYyA9IG1kNV9paShjLCBkLCBhLCBiLCB4W2kgKyAyXSwgMTUsIDcxODc4NzI1OSk7XG4gICAgICAgICAgYiA9IG1kNV9paShiLCBjLCBkLCBhLCB4W2kgKyA5XSwgMjEsIC0zNDM0ODU1NTEpO1xuXG4gICAgICAgICAgYSA9IHNhZmVfYWRkKGEsIG9sZGEpO1xuICAgICAgICAgIGIgPSBzYWZlX2FkZChiLCBvbGRiKTtcbiAgICAgICAgICBjID0gc2FmZV9hZGQoYywgb2xkYyk7XG4gICAgICAgICAgZCA9IHNhZmVfYWRkKGQsIG9sZGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheShhLCBiLCBjLCBkKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBUaGVzZSBmdW5jdGlvbnMgaW1wbGVtZW50IHRoZSBmb3VyIGJhc2ljIG9wZXJhdGlvbnMgdGhlIGFsZ29yaXRobSB1c2VzLlxuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIG1kNV9jbW4ocSwgYSwgYiwgeCwgcywgdCkge1xuICAgICAgICByZXR1cm4gc2FmZV9hZGQoYml0X3JvbChzYWZlX2FkZChzYWZlX2FkZChhLCBxKSwgc2FmZV9hZGQoeCwgdCkpLCBzKSwgYik7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG1kNV9mZihhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gICAgICAgIHJldHVybiBtZDVfY21uKChiICYgYykgfCAoKH5iKSAmIGQpLCBhLCBiLCB4LCBzLCB0KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbWQ1X2dnKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcbiAgICAgICAgcmV0dXJuIG1kNV9jbW4oKGIgJiBkKSB8IChjICYgKH5kKSksIGEsIGIsIHgsIHMsIHQpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBtZDVfaGgoYSwgYiwgYywgZCwgeCwgcywgdCkge1xuICAgICAgICByZXR1cm4gbWQ1X2NtbihiIF4gYyBeIGQsIGEsIGIsIHgsIHMsIHQpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBtZDVfaWkoYSwgYiwgYywgZCwgeCwgcywgdCkge1xuICAgICAgICByZXR1cm4gbWQ1X2NtbihjIF4gKGIgfCAofmQpKSwgYSwgYiwgeCwgcywgdCk7XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIEhhc2hlc1xuICAgICAqIEBjbGFzcyBIYXNoZXMuU0hBMVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY29uZmlnXVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQSBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBTZWN1cmUgSGFzaCBBbGdvcml0aG0sIFNIQS0xLCBhcyBkZWZpbmVkIGluIEZJUFMgMTgwLTFcbiAgICAgKiBWZXJzaW9uIDIuMiBDb3B5cmlnaHQgUGF1bCBKb2huc3RvbiAyMDAwIC0gMjAwOS5cbiAgICAgKiBPdGhlciBjb250cmlidXRvcnM6IEdyZWcgSG9sdCwgQW5kcmV3IEtlcGVydCwgWWRuYXIsIExvc3RpbmV0XG4gICAgICogU2VlIGh0dHA6Ly9wYWpob21lLm9yZy51ay9jcnlwdC9tZDUgZm9yIGRldGFpbHMuXG4gICAgICovXG4gICAgU0hBMTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgLyoqXG4gICAgICAgKiBQcml2YXRlIGNvbmZpZyBwcm9wZXJ0aWVzLiBZb3UgbWF5IG5lZWQgdG8gdHdlYWsgdGhlc2UgdG8gYmUgY29tcGF0aWJsZSB3aXRoXG4gICAgICAgKiB0aGUgc2VydmVyLXNpZGUsIGJ1dCB0aGUgZGVmYXVsdHMgd29yayBpbiBtb3N0IGNhc2VzLlxuICAgICAgICogU2VlIHtAbGluayBIYXNoZXMuTUQ1I21ldGhvZC1zZXRVcHBlckNhc2V9IGFuZCB7QGxpbmsgSGFzaGVzLlNIQTEjbWV0aG9kLXNldFVwcGVyQ2FzZX1cbiAgICAgICAqL1xuICAgICAgdmFyIGhleGNhc2UgPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy51cHBlcmNhc2UgPT09ICdib29sZWFuJykgPyBvcHRpb25zLnVwcGVyY2FzZSA6IGZhbHNlLCAvLyBoZXhhZGVjaW1hbCBvdXRwdXQgY2FzZSBmb3JtYXQuIGZhbHNlIC0gbG93ZXJjYXNlOyB0cnVlIC0gdXBwZXJjYXNlXG4gICAgICAgIGI2NHBhZCA9IChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnBhZCA9PT0gJ3N0cmluZycpID8gb3B0aW9ucy5wYWQgOiAnPScsIC8vIGJhc2UtNjQgcGFkIGNoYXJhY3Rlci4gRGVmYXVsdHMgdG8gJz0nIGZvciBzdHJpY3QgUkZDIGNvbXBsaWFuY2VcbiAgICAgICAgdXRmOCA9IChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnV0ZjggPT09ICdib29sZWFuJykgPyBvcHRpb25zLnV0ZjggOiB0cnVlOyAvLyBlbmFibGUvZGlzYWJsZSB1dGY4IGVuY29kaW5nXG5cbiAgICAgIC8vIHB1YmxpYyBtZXRob2RzXG4gICAgICB0aGlzLmhleCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyaGV4KHJzdHIocywgdXRmOCksIGhleGNhc2UpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYjY0ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cjJiNjQocnN0cihzLCB1dGY4KSwgYjY0cGFkKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmFueSA9IGZ1bmN0aW9uKHMsIGUpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYW55KHJzdHIocywgdXRmOCksIGUpO1xuICAgICAgfTtcbiAgICAgIHRoaXMucmF3ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cihzLCB1dGY4KTtcbiAgICAgIH07XG4gICAgICB0aGlzLmhleF9obWFjID0gZnVuY3Rpb24oaywgZCkge1xuICAgICAgICByZXR1cm4gcnN0cjJoZXgocnN0cl9obWFjKGssIGQpKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmI2NF9obWFjID0gZnVuY3Rpb24oaywgZCkge1xuICAgICAgICByZXR1cm4gcnN0cjJiNjQocnN0cl9obWFjKGssIGQpLCBiNjRwYWQpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYW55X2htYWMgPSBmdW5jdGlvbihrLCBkLCBlKSB7XG4gICAgICAgIHJldHVybiByc3RyMmFueShyc3RyX2htYWMoaywgZCksIGUpO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogUGVyZm9ybSBhIHNpbXBsZSBzZWxmLXRlc3QgdG8gc2VlIGlmIHRoZSBWTSBpcyB3b3JraW5nXG4gICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IEhleGFkZWNpbWFsIGhhc2ggc2FtcGxlXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIHRoaXMudm1fdGVzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaGV4KCdhYmMnKS50b0xvd2VyQ2FzZSgpID09PSAnOTAwMTUwOTgzY2QyNGZiMGQ2OTYzZjdkMjhlMTdmNzInO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogQGRlc2NyaXB0aW9uIEVuYWJsZS9kaXNhYmxlIHVwcGVyY2FzZSBoZXhhZGVjaW1hbCByZXR1cm5lZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn1cbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFVwcGVyQ2FzZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoZXhjYXNlID0gYTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIEBkZXNjcmlwdGlvbiBEZWZpbmVzIGEgYmFzZTY0IHBhZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBQYWRcbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFBhZCA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgYjY0cGFkID0gYSB8fCBiNjRwYWQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogQGRlc2NyaXB0aW9uIERlZmluZXMgYSBiYXNlNjQgcGFkIHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtib29sZWFufVxuICAgICAgICogQHJldHVybiB7T2JqZWN0fSB0aGlzXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIHRoaXMuc2V0VVRGOCA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICB1dGY4ID0gYTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG5cbiAgICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuXG4gICAgICAvKipcbiAgICAgICAqIENhbGN1bGF0ZSB0aGUgU0hBLTUxMiBvZiBhIHJhdyBzdHJpbmdcbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiByc3RyKHMpIHtcbiAgICAgICAgcyA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUocykgOiBzO1xuICAgICAgICByZXR1cm4gYmluYjJyc3RyKGJpbmIocnN0cjJiaW5iKHMpLCBzLmxlbmd0aCAqIDgpKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDYWxjdWxhdGUgdGhlIEhNQUMtU0hBMSBvZiBhIGtleSBhbmQgc29tZSBkYXRhIChyYXcgc3RyaW5ncylcbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiByc3RyX2htYWMoa2V5LCBkYXRhKSB7XG4gICAgICAgIHZhciBia2V5LCBpcGFkLCBvcGFkLCBpLCBoYXNoO1xuICAgICAgICBrZXkgPSAodXRmOCkgPyB1dGY4RW5jb2RlKGtleSkgOiBrZXk7XG4gICAgICAgIGRhdGEgPSAodXRmOCkgPyB1dGY4RW5jb2RlKGRhdGEpIDogZGF0YTtcbiAgICAgICAgYmtleSA9IHJzdHIyYmluYihrZXkpO1xuXG4gICAgICAgIGlmIChia2V5Lmxlbmd0aCA+IDE2KSB7XG4gICAgICAgICAgYmtleSA9IGJpbmIoYmtleSwga2V5Lmxlbmd0aCAqIDgpO1xuICAgICAgICB9XG4gICAgICAgIGlwYWQgPSBBcnJheSgxNiksIG9wYWQgPSBBcnJheSgxNik7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNjsgaSArPSAxKSB7XG4gICAgICAgICAgaXBhZFtpXSA9IGJrZXlbaV0gXiAweDM2MzYzNjM2O1xuICAgICAgICAgIG9wYWRbaV0gPSBia2V5W2ldIF4gMHg1QzVDNUM1QztcbiAgICAgICAgfVxuICAgICAgICBoYXNoID0gYmluYihpcGFkLmNvbmNhdChyc3RyMmJpbmIoZGF0YSkpLCA1MTIgKyBkYXRhLmxlbmd0aCAqIDgpO1xuICAgICAgICByZXR1cm4gYmluYjJyc3RyKGJpbmIob3BhZC5jb25jYXQoaGFzaCksIDUxMiArIDE2MCkpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENhbGN1bGF0ZSB0aGUgU0hBLTEgb2YgYW4gYXJyYXkgb2YgYmlnLWVuZGlhbiB3b3JkcywgYW5kIGEgYml0IGxlbmd0aFxuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIGJpbmIoeCwgbGVuKSB7XG4gICAgICAgIHZhciBpLCBqLCB0LCBvbGRhLCBvbGRiLCBvbGRjLCBvbGRkLCBvbGRlLFxuICAgICAgICAgIHcgPSBBcnJheSg4MCksXG4gICAgICAgICAgYSA9IDE3MzI1ODQxOTMsXG4gICAgICAgICAgYiA9IC0yNzE3MzM4NzksXG4gICAgICAgICAgYyA9IC0xNzMyNTg0MTk0LFxuICAgICAgICAgIGQgPSAyNzE3MzM4NzgsXG4gICAgICAgICAgZSA9IC0xMDA5NTg5Nzc2O1xuXG4gICAgICAgIC8qIGFwcGVuZCBwYWRkaW5nICovXG4gICAgICAgIHhbbGVuID4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbGVuICUgMzIpO1xuICAgICAgICB4WygobGVuICsgNjQgPj4gOSkgPDwgNCkgKyAxNV0gPSBsZW47XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHgubGVuZ3RoOyBpICs9IDE2KSB7XG4gICAgICAgICAgb2xkYSA9IGE7XG4gICAgICAgICAgb2xkYiA9IGI7XG4gICAgICAgICAgb2xkYyA9IGM7XG4gICAgICAgICAgb2xkZCA9IGQ7XG4gICAgICAgICAgb2xkZSA9IGU7XG5cbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgODA7IGogKz0gMSkge1xuICAgICAgICAgICAgaWYgKGogPCAxNikge1xuICAgICAgICAgICAgICB3W2pdID0geFtpICsgal07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB3W2pdID0gYml0X3JvbCh3W2ogLSAzXSBeIHdbaiAtIDhdIF4gd1tqIC0gMTRdIF4gd1tqIC0gMTZdLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHQgPSBzYWZlX2FkZChzYWZlX2FkZChiaXRfcm9sKGEsIDUpLCBzaGExX2Z0KGosIGIsIGMsIGQpKSxcbiAgICAgICAgICAgICAgc2FmZV9hZGQoc2FmZV9hZGQoZSwgd1tqXSksIHNoYTFfa3QoaikpKTtcbiAgICAgICAgICAgIGUgPSBkO1xuICAgICAgICAgICAgZCA9IGM7XG4gICAgICAgICAgICBjID0gYml0X3JvbChiLCAzMCk7XG4gICAgICAgICAgICBiID0gYTtcbiAgICAgICAgICAgIGEgPSB0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGEgPSBzYWZlX2FkZChhLCBvbGRhKTtcbiAgICAgICAgICBiID0gc2FmZV9hZGQoYiwgb2xkYik7XG4gICAgICAgICAgYyA9IHNhZmVfYWRkKGMsIG9sZGMpO1xuICAgICAgICAgIGQgPSBzYWZlX2FkZChkLCBvbGRkKTtcbiAgICAgICAgICBlID0gc2FmZV9hZGQoZSwgb2xkZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEFycmF5KGEsIGIsIGMsIGQsIGUpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFBlcmZvcm0gdGhlIGFwcHJvcHJpYXRlIHRyaXBsZXQgY29tYmluYXRpb24gZnVuY3Rpb24gZm9yIHRoZSBjdXJyZW50XG4gICAgICAgKiBpdGVyYXRpb25cbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiBzaGExX2Z0KHQsIGIsIGMsIGQpIHtcbiAgICAgICAgaWYgKHQgPCAyMCkge1xuICAgICAgICAgIHJldHVybiAoYiAmIGMpIHwgKCh+YikgJiBkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA8IDQwKSB7XG4gICAgICAgICAgcmV0dXJuIGIgXiBjIF4gZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA8IDYwKSB7XG4gICAgICAgICAgcmV0dXJuIChiICYgYykgfCAoYiAmIGQpIHwgKGMgJiBkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYiBeIGMgXiBkO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERldGVybWluZSB0aGUgYXBwcm9wcmlhdGUgYWRkaXRpdmUgY29uc3RhbnQgZm9yIHRoZSBjdXJyZW50IGl0ZXJhdGlvblxuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHNoYTFfa3QodCkge1xuICAgICAgICByZXR1cm4gKHQgPCAyMCkgPyAxNTE4NTAwMjQ5IDogKHQgPCA0MCkgPyAxODU5Nzc1MzkzIDpcbiAgICAgICAgICAodCA8IDYwKSA/IC0xODk0MDA3NTg4IDogLTg5OTQ5NzUxNDtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEBjbGFzcyBIYXNoZXMuU0hBMjU2XG4gICAgICogQHBhcmFtIHtjb25maWd9XG4gICAgICpcbiAgICAgKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNlY3VyZSBIYXNoIEFsZ29yaXRobSwgU0hBLTI1NiwgYXMgZGVmaW5lZCBpbiBGSVBTIDE4MC0yXG4gICAgICogVmVyc2lvbiAyLjIgQ29weXJpZ2h0IEFuZ2VsIE1hcmluLCBQYXVsIEpvaG5zdG9uIDIwMDAgLSAyMDA5LlxuICAgICAqIE90aGVyIGNvbnRyaWJ1dG9yczogR3JlZyBIb2x0LCBBbmRyZXcgS2VwZXJ0LCBZZG5hciwgTG9zdGluZXRcbiAgICAgKiBTZWUgaHR0cDovL3BhamhvbWUub3JnLnVrL2NyeXB0L21kNSBmb3IgZGV0YWlscy5cbiAgICAgKiBBbHNvIGh0dHA6Ly9hbm1hci5ldS5vcmcvcHJvamVjdHMvanNzaGEyL1xuICAgICAqL1xuICAgIFNIQTI1NjogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgLyoqXG4gICAgICAgKiBQcml2YXRlIHByb3BlcnRpZXMgY29uZmlndXJhdGlvbiB2YXJpYWJsZXMuIFlvdSBtYXkgbmVlZCB0byB0d2VhayB0aGVzZSB0byBiZSBjb21wYXRpYmxlIHdpdGhcbiAgICAgICAqIHRoZSBzZXJ2ZXItc2lkZSwgYnV0IHRoZSBkZWZhdWx0cyB3b3JrIGluIG1vc3QgY2FzZXMuXG4gICAgICAgKiBAc2VlIHRoaXMuc2V0VXBwZXJDYXNlKCkgbWV0aG9kXG4gICAgICAgKiBAc2VlIHRoaXMuc2V0UGFkKCkgbWV0aG9kXG4gICAgICAgKi9cbiAgICAgIHZhciBoZXhjYXNlID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMudXBwZXJjYXNlID09PSAnYm9vbGVhbicpID8gb3B0aW9ucy51cHBlcmNhc2UgOiBmYWxzZSwgLy8gaGV4YWRlY2ltYWwgb3V0cHV0IGNhc2UgZm9ybWF0LiBmYWxzZSAtIGxvd2VyY2FzZTsgdHJ1ZSAtIHVwcGVyY2FzZSAgKi9cbiAgICAgICAgYjY0cGFkID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMucGFkID09PSAnc3RyaW5nJykgPyBvcHRpb25zLnBhZCA6ICc9JyxcbiAgICAgICAgLyogYmFzZS02NCBwYWQgY2hhcmFjdGVyLiBEZWZhdWx0ICc9JyBmb3Igc3RyaWN0IFJGQyBjb21wbGlhbmNlICAgKi9cbiAgICAgICAgdXRmOCA9IChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnV0ZjggPT09ICdib29sZWFuJykgPyBvcHRpb25zLnV0ZjggOiB0cnVlLFxuICAgICAgICAvKiBlbmFibGUvZGlzYWJsZSB1dGY4IGVuY29kaW5nICovXG4gICAgICAgIHNoYTI1Nl9LO1xuXG4gICAgICAvKiBwcml2aWxlZ2VkIChwdWJsaWMpIG1ldGhvZHMgKi9cbiAgICAgIHRoaXMuaGV4ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cjJoZXgocnN0cihzLCB1dGY4KSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5iNjQgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyMmI2NChyc3RyKHMsIHV0ZjgpLCBiNjRwYWQpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYW55ID0gZnVuY3Rpb24ocywgZSkge1xuICAgICAgICByZXR1cm4gcnN0cjJhbnkocnN0cihzLCB1dGY4KSwgZSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5yYXcgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyKHMsIHV0ZjgpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuaGV4X2htYWMgPSBmdW5jdGlvbihrLCBkKSB7XG4gICAgICAgIHJldHVybiByc3RyMmhleChyc3RyX2htYWMoaywgZCkpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYjY0X2htYWMgPSBmdW5jdGlvbihrLCBkKSB7XG4gICAgICAgIHJldHVybiByc3RyMmI2NChyc3RyX2htYWMoaywgZCksIGI2NHBhZCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5hbnlfaG1hYyA9IGZ1bmN0aW9uKGssIGQsIGUpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYW55KHJzdHJfaG1hYyhrLCBkKSwgZSk7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBQZXJmb3JtIGEgc2ltcGxlIHNlbGYtdGVzdCB0byBzZWUgaWYgdGhlIFZNIGlzIHdvcmtpbmdcbiAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gSGV4YWRlY2ltYWwgaGFzaCBzYW1wbGVcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy52bV90ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBoZXgoJ2FiYycpLnRvTG93ZXJDYXNlKCkgPT09ICc5MDAxNTA5ODNjZDI0ZmIwZDY5NjNmN2QyOGUxN2Y3Mic7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBFbmFibGUvZGlzYWJsZSB1cHBlcmNhc2UgaGV4YWRlY2ltYWwgcmV0dXJuZWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59XG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRVcHBlckNhc2UgPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgaGV4Y2FzZSA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBAZGVzY3JpcHRpb24gRGVmaW5lcyBhIGJhc2U2NCBwYWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gUGFkXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRQYWQgPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIGI2NHBhZCA9IGEgfHwgYjY0cGFkO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIERlZmluZXMgYSBiYXNlNjQgcGFkIHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtib29sZWFufVxuICAgICAgICogQHJldHVybiB7T2JqZWN0fSB0aGlzXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIHRoaXMuc2V0VVRGOCA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICB1dGY4ID0gYTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG5cbiAgICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuXG4gICAgICAvKipcbiAgICAgICAqIENhbGN1bGF0ZSB0aGUgU0hBLTUxMiBvZiBhIHJhdyBzdHJpbmdcbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiByc3RyKHMsIHV0ZjgpIHtcbiAgICAgICAgcyA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUocykgOiBzO1xuICAgICAgICByZXR1cm4gYmluYjJyc3RyKGJpbmIocnN0cjJiaW5iKHMpLCBzLmxlbmd0aCAqIDgpKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDYWxjdWxhdGUgdGhlIEhNQUMtc2hhMjU2IG9mIGEga2V5IGFuZCBzb21lIGRhdGEgKHJhdyBzdHJpbmdzKVxuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHJzdHJfaG1hYyhrZXksIGRhdGEpIHtcbiAgICAgICAga2V5ID0gKHV0ZjgpID8gdXRmOEVuY29kZShrZXkpIDoga2V5O1xuICAgICAgICBkYXRhID0gKHV0ZjgpID8gdXRmOEVuY29kZShkYXRhKSA6IGRhdGE7XG4gICAgICAgIHZhciBoYXNoLCBpID0gMCxcbiAgICAgICAgICBia2V5ID0gcnN0cjJiaW5iKGtleSksXG4gICAgICAgICAgaXBhZCA9IEFycmF5KDE2KSxcbiAgICAgICAgICBvcGFkID0gQXJyYXkoMTYpO1xuXG4gICAgICAgIGlmIChia2V5Lmxlbmd0aCA+IDE2KSB7XG4gICAgICAgICAgYmtleSA9IGJpbmIoYmtleSwga2V5Lmxlbmd0aCAqIDgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICg7IGkgPCAxNjsgaSArPSAxKSB7XG4gICAgICAgICAgaXBhZFtpXSA9IGJrZXlbaV0gXiAweDM2MzYzNjM2O1xuICAgICAgICAgIG9wYWRbaV0gPSBia2V5W2ldIF4gMHg1QzVDNUM1QztcbiAgICAgICAgfVxuXG4gICAgICAgIGhhc2ggPSBiaW5iKGlwYWQuY29uY2F0KHJzdHIyYmluYihkYXRhKSksIDUxMiArIGRhdGEubGVuZ3RoICogOCk7XG4gICAgICAgIHJldHVybiBiaW5iMnJzdHIoYmluYihvcGFkLmNvbmNhdChoYXNoKSwgNTEyICsgMjU2KSk7XG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICAgKiBNYWluIHNoYTI1NiBmdW5jdGlvbiwgd2l0aCBpdHMgc3VwcG9ydCBmdW5jdGlvbnNcbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiBzaGEyNTZfUyhYLCBuKSB7XG4gICAgICAgIHJldHVybiAoWCA+Pj4gbikgfCAoWCA8PCAoMzIgLSBuKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNoYTI1Nl9SKFgsIG4pIHtcbiAgICAgICAgcmV0dXJuIChYID4+PiBuKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X0NoKHgsIHksIHopIHtcbiAgICAgICAgcmV0dXJuICgoeCAmIHkpIF4gKCh+eCkgJiB6KSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNoYTI1Nl9NYWooeCwgeSwgeikge1xuICAgICAgICByZXR1cm4gKCh4ICYgeSkgXiAoeCAmIHopIF4gKHkgJiB6KSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNoYTI1Nl9TaWdtYTAyNTYoeCkge1xuICAgICAgICByZXR1cm4gKHNoYTI1Nl9TKHgsIDIpIF4gc2hhMjU2X1MoeCwgMTMpIF4gc2hhMjU2X1MoeCwgMjIpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X1NpZ21hMTI1Nih4KSB7XG4gICAgICAgIHJldHVybiAoc2hhMjU2X1MoeCwgNikgXiBzaGEyNTZfUyh4LCAxMSkgXiBzaGEyNTZfUyh4LCAyNSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGEyNTZfR2FtbWEwMjU2KHgpIHtcbiAgICAgICAgcmV0dXJuIChzaGEyNTZfUyh4LCA3KSBeIHNoYTI1Nl9TKHgsIDE4KSBeIHNoYTI1Nl9SKHgsIDMpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X0dhbW1hMTI1Nih4KSB7XG4gICAgICAgIHJldHVybiAoc2hhMjU2X1MoeCwgMTcpIF4gc2hhMjU2X1MoeCwgMTkpIF4gc2hhMjU2X1IoeCwgMTApKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X1NpZ21hMDUxMih4KSB7XG4gICAgICAgIHJldHVybiAoc2hhMjU2X1MoeCwgMjgpIF4gc2hhMjU2X1MoeCwgMzQpIF4gc2hhMjU2X1MoeCwgMzkpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X1NpZ21hMTUxMih4KSB7XG4gICAgICAgIHJldHVybiAoc2hhMjU2X1MoeCwgMTQpIF4gc2hhMjU2X1MoeCwgMTgpIF4gc2hhMjU2X1MoeCwgNDEpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X0dhbW1hMDUxMih4KSB7XG4gICAgICAgIHJldHVybiAoc2hhMjU2X1MoeCwgMSkgXiBzaGEyNTZfUyh4LCA4KSBeIHNoYTI1Nl9SKHgsIDcpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X0dhbW1hMTUxMih4KSB7XG4gICAgICAgIHJldHVybiAoc2hhMjU2X1MoeCwgMTkpIF4gc2hhMjU2X1MoeCwgNjEpIF4gc2hhMjU2X1IoeCwgNikpO1xuICAgICAgfVxuXG4gICAgICBzaGEyNTZfSyA9IFtcbiAgICAgICAgMTExNjM1MjQwOCwgMTg5OTQ0NzQ0MSwgLTEyNDU2NDM4MjUsIC0zNzM5NTc3MjMsIDk2MTk4NzE2MywgMTUwODk3MDk5MywgLTE4NDEzMzE1NDgsIC0xNDI0MjA0MDc1LCAtNjcwNTg2MjE2LCAzMTA1OTg0MDEsIDYwNzIyNTI3OCwgMTQyNjg4MTk4NyxcbiAgICAgICAgMTkyNTA3ODM4OCwgLTIxMzI4ODkwOTAsIC0xNjgwMDc5MTkzLCAtMTA0Njc0NDcxNiwgLTQ1OTU3Njg5NSwgLTI3Mjc0MjUyMixcbiAgICAgICAgMjY0MzQ3MDc4LCA2MDQ4MDc2MjgsIDc3MDI1NTk4MywgMTI0OTE1MDEyMiwgMTU1NTA4MTY5MiwgMTk5NjA2NDk4NiwgLTE3NDA3NDY0MTQsIC0xNDczMTMyOTQ3LCAtMTM0MTk3MDQ4OCwgLTEwODQ2NTM2MjUsIC05NTgzOTU0MDUsIC03MTA0Mzg1ODUsXG4gICAgICAgIDExMzkyNjk5MywgMzM4MjQxODk1LCA2NjYzMDcyMDUsIDc3MzUyOTkxMiwgMTI5NDc1NzM3MiwgMTM5NjE4MjI5MSxcbiAgICAgICAgMTY5NTE4MzcwMCwgMTk4NjY2MTA1MSwgLTIxMTc5NDA5NDYsIC0xODM4MDExMjU5LCAtMTU2NDQ4MTM3NSwgLTE0NzQ2NjQ4ODUsIC0xMDM1MjM2NDk2LCAtOTQ5MjAyNTI1LCAtNzc4OTAxNDc5LCAtNjk0NjE0NDkyLCAtMjAwMzk1Mzg3LCAyNzU0MjMzNDQsXG4gICAgICAgIDQzMDIyNzczNCwgNTA2OTQ4NjE2LCA2NTkwNjA1NTYsIDg4Mzk5Nzg3NywgOTU4MTM5NTcxLCAxMzIyODIyMjE4LFxuICAgICAgICAxNTM3MDAyMDYzLCAxNzQ3ODczNzc5LCAxOTU1NTYyMjIyLCAyMDI0MTA0ODE1LCAtMjA2NzIzNjg0NCwgLTE5MzMxMTQ4NzIsIC0xODY2NTMwODIyLCAtMTUzODIzMzEwOSwgLTEwOTA5MzU4MTcsIC05NjU2NDE5OThcbiAgICAgIF07XG5cbiAgICAgIGZ1bmN0aW9uIGJpbmIobSwgbCkge1xuICAgICAgICB2YXIgSEFTSCA9IFsxNzc5MDMzNzAzLCAtMTE1MDgzMzAxOSwgMTAxMzkwNDI0MiwgLTE1MjE0ODY1MzQsXG4gICAgICAgICAgMTM1OTg5MzExOSwgLTE2OTQxNDQzNzIsIDUyODczNDYzNSwgMTU0MTQ1OTIyNVxuICAgICAgICBdO1xuICAgICAgICB2YXIgVyA9IG5ldyBBcnJheSg2NCk7XG4gICAgICAgIHZhciBhLCBiLCBjLCBkLCBlLCBmLCBnLCBoO1xuICAgICAgICB2YXIgaSwgaiwgVDEsIFQyO1xuXG4gICAgICAgIC8qIGFwcGVuZCBwYWRkaW5nICovXG4gICAgICAgIG1bbCA+PiA1XSB8PSAweDgwIDw8ICgyNCAtIGwgJSAzMik7XG4gICAgICAgIG1bKChsICsgNjQgPj4gOSkgPDwgNCkgKyAxNV0gPSBsO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBtLmxlbmd0aDsgaSArPSAxNikge1xuICAgICAgICAgIGEgPSBIQVNIWzBdO1xuICAgICAgICAgIGIgPSBIQVNIWzFdO1xuICAgICAgICAgIGMgPSBIQVNIWzJdO1xuICAgICAgICAgIGQgPSBIQVNIWzNdO1xuICAgICAgICAgIGUgPSBIQVNIWzRdO1xuICAgICAgICAgIGYgPSBIQVNIWzVdO1xuICAgICAgICAgIGcgPSBIQVNIWzZdO1xuICAgICAgICAgIGggPSBIQVNIWzddO1xuXG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IDY0OyBqICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChqIDwgMTYpIHtcbiAgICAgICAgICAgICAgV1tqXSA9IG1baiArIGldO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgV1tqXSA9IHNhZmVfYWRkKHNhZmVfYWRkKHNhZmVfYWRkKHNoYTI1Nl9HYW1tYTEyNTYoV1tqIC0gMl0pLCBXW2ogLSA3XSksXG4gICAgICAgICAgICAgICAgc2hhMjU2X0dhbW1hMDI1NihXW2ogLSAxNV0pKSwgV1tqIC0gMTZdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgVDEgPSBzYWZlX2FkZChzYWZlX2FkZChzYWZlX2FkZChzYWZlX2FkZChoLCBzaGEyNTZfU2lnbWExMjU2KGUpKSwgc2hhMjU2X0NoKGUsIGYsIGcpKSxcbiAgICAgICAgICAgICAgc2hhMjU2X0tbal0pLCBXW2pdKTtcbiAgICAgICAgICAgIFQyID0gc2FmZV9hZGQoc2hhMjU2X1NpZ21hMDI1NihhKSwgc2hhMjU2X01haihhLCBiLCBjKSk7XG4gICAgICAgICAgICBoID0gZztcbiAgICAgICAgICAgIGcgPSBmO1xuICAgICAgICAgICAgZiA9IGU7XG4gICAgICAgICAgICBlID0gc2FmZV9hZGQoZCwgVDEpO1xuICAgICAgICAgICAgZCA9IGM7XG4gICAgICAgICAgICBjID0gYjtcbiAgICAgICAgICAgIGIgPSBhO1xuICAgICAgICAgICAgYSA9IHNhZmVfYWRkKFQxLCBUMik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgSEFTSFswXSA9IHNhZmVfYWRkKGEsIEhBU0hbMF0pO1xuICAgICAgICAgIEhBU0hbMV0gPSBzYWZlX2FkZChiLCBIQVNIWzFdKTtcbiAgICAgICAgICBIQVNIWzJdID0gc2FmZV9hZGQoYywgSEFTSFsyXSk7XG4gICAgICAgICAgSEFTSFszXSA9IHNhZmVfYWRkKGQsIEhBU0hbM10pO1xuICAgICAgICAgIEhBU0hbNF0gPSBzYWZlX2FkZChlLCBIQVNIWzRdKTtcbiAgICAgICAgICBIQVNIWzVdID0gc2FmZV9hZGQoZiwgSEFTSFs1XSk7XG4gICAgICAgICAgSEFTSFs2XSA9IHNhZmVfYWRkKGcsIEhBU0hbNl0pO1xuICAgICAgICAgIEhBU0hbN10gPSBzYWZlX2FkZChoLCBIQVNIWzddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSEFTSDtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAY2xhc3MgSGFzaGVzLlNIQTUxMlxuICAgICAqIEBwYXJhbSB7Y29uZmlnfVxuICAgICAqXG4gICAgICogQSBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBTZWN1cmUgSGFzaCBBbGdvcml0aG0sIFNIQS01MTIsIGFzIGRlZmluZWQgaW4gRklQUyAxODAtMlxuICAgICAqIFZlcnNpb24gMi4yIENvcHlyaWdodCBBbm9ueW1vdXMgQ29udHJpYnV0b3IsIFBhdWwgSm9obnN0b24gMjAwMCAtIDIwMDkuXG4gICAgICogT3RoZXIgY29udHJpYnV0b3JzOiBHcmVnIEhvbHQsIEFuZHJldyBLZXBlcnQsIFlkbmFyLCBMb3N0aW5ldFxuICAgICAqIFNlZSBodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1IGZvciBkZXRhaWxzLlxuICAgICAqL1xuICAgIFNIQTUxMjogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgLyoqXG4gICAgICAgKiBQcml2YXRlIHByb3BlcnRpZXMgY29uZmlndXJhdGlvbiB2YXJpYWJsZXMuIFlvdSBtYXkgbmVlZCB0byB0d2VhayB0aGVzZSB0byBiZSBjb21wYXRpYmxlIHdpdGhcbiAgICAgICAqIHRoZSBzZXJ2ZXItc2lkZSwgYnV0IHRoZSBkZWZhdWx0cyB3b3JrIGluIG1vc3QgY2FzZXMuXG4gICAgICAgKiBAc2VlIHRoaXMuc2V0VXBwZXJDYXNlKCkgbWV0aG9kXG4gICAgICAgKiBAc2VlIHRoaXMuc2V0UGFkKCkgbWV0aG9kXG4gICAgICAgKi9cbiAgICAgIHZhciBoZXhjYXNlID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMudXBwZXJjYXNlID09PSAnYm9vbGVhbicpID8gb3B0aW9ucy51cHBlcmNhc2UgOiBmYWxzZSxcbiAgICAgICAgLyogaGV4YWRlY2ltYWwgb3V0cHV0IGNhc2UgZm9ybWF0LiBmYWxzZSAtIGxvd2VyY2FzZTsgdHJ1ZSAtIHVwcGVyY2FzZSAgKi9cbiAgICAgICAgYjY0cGFkID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMucGFkID09PSAnc3RyaW5nJykgPyBvcHRpb25zLnBhZCA6ICc9JyxcbiAgICAgICAgLyogYmFzZS02NCBwYWQgY2hhcmFjdGVyLiBEZWZhdWx0ICc9JyBmb3Igc3RyaWN0IFJGQyBjb21wbGlhbmNlICAgKi9cbiAgICAgICAgdXRmOCA9IChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnV0ZjggPT09ICdib29sZWFuJykgPyBvcHRpb25zLnV0ZjggOiB0cnVlLFxuICAgICAgICAvKiBlbmFibGUvZGlzYWJsZSB1dGY4IGVuY29kaW5nICovXG4gICAgICAgIHNoYTUxMl9rO1xuXG4gICAgICAvKiBwcml2aWxlZ2VkIChwdWJsaWMpIG1ldGhvZHMgKi9cbiAgICAgIHRoaXMuaGV4ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cjJoZXgocnN0cihzKSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5iNjQgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyMmI2NChyc3RyKHMpLCBiNjRwYWQpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYW55ID0gZnVuY3Rpb24ocywgZSkge1xuICAgICAgICByZXR1cm4gcnN0cjJhbnkocnN0cihzKSwgZSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5yYXcgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyKHMsIHV0ZjgpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuaGV4X2htYWMgPSBmdW5jdGlvbihrLCBkKSB7XG4gICAgICAgIHJldHVybiByc3RyMmhleChyc3RyX2htYWMoaywgZCkpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYjY0X2htYWMgPSBmdW5jdGlvbihrLCBkKSB7XG4gICAgICAgIHJldHVybiByc3RyMmI2NChyc3RyX2htYWMoaywgZCksIGI2NHBhZCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5hbnlfaG1hYyA9IGZ1bmN0aW9uKGssIGQsIGUpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYW55KHJzdHJfaG1hYyhrLCBkKSwgZSk7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBQZXJmb3JtIGEgc2ltcGxlIHNlbGYtdGVzdCB0byBzZWUgaWYgdGhlIFZNIGlzIHdvcmtpbmdcbiAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gSGV4YWRlY2ltYWwgaGFzaCBzYW1wbGVcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy52bV90ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBoZXgoJ2FiYycpLnRvTG93ZXJDYXNlKCkgPT09ICc5MDAxNTA5ODNjZDI0ZmIwZDY5NjNmN2QyOGUxN2Y3Mic7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBAZGVzY3JpcHRpb24gRW5hYmxlL2Rpc2FibGUgdXBwZXJjYXNlIGhleGFkZWNpbWFsIHJldHVybmVkIHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtib29sZWFufVxuICAgICAgICogQHJldHVybiB7T2JqZWN0fSB0aGlzXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIHRoaXMuc2V0VXBwZXJDYXNlID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIGhleGNhc2UgPSBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogQGRlc2NyaXB0aW9uIERlZmluZXMgYSBiYXNlNjQgcGFkIHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFBhZFxuICAgICAgICogQHJldHVybiB7T2JqZWN0fSB0aGlzXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIHRoaXMuc2V0UGFkID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBiNjRwYWQgPSBhIHx8IGI2NHBhZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBAZGVzY3JpcHRpb24gRGVmaW5lcyBhIGJhc2U2NCBwYWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59XG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRVVEY4ID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIHV0ZjggPSBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgLyogcHJpdmF0ZSBtZXRob2RzICovXG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBTSEEtNTEyIG9mIGEgcmF3IHN0cmluZ1xuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHJzdHIocykge1xuICAgICAgICBzID0gKHV0ZjgpID8gdXRmOEVuY29kZShzKSA6IHM7XG4gICAgICAgIHJldHVybiBiaW5iMnJzdHIoYmluYihyc3RyMmJpbmIocyksIHMubGVuZ3RoICogOCkpO1xuICAgICAgfVxuICAgICAgLypcbiAgICAgICAqIENhbGN1bGF0ZSB0aGUgSE1BQy1TSEEtNTEyIG9mIGEga2V5IGFuZCBzb21lIGRhdGEgKHJhdyBzdHJpbmdzKVxuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHJzdHJfaG1hYyhrZXksIGRhdGEpIHtcbiAgICAgICAga2V5ID0gKHV0ZjgpID8gdXRmOEVuY29kZShrZXkpIDoga2V5O1xuICAgICAgICBkYXRhID0gKHV0ZjgpID8gdXRmOEVuY29kZShkYXRhKSA6IGRhdGE7XG5cbiAgICAgICAgdmFyIGhhc2gsIGkgPSAwLFxuICAgICAgICAgIGJrZXkgPSByc3RyMmJpbmIoa2V5KSxcbiAgICAgICAgICBpcGFkID0gQXJyYXkoMzIpLFxuICAgICAgICAgIG9wYWQgPSBBcnJheSgzMik7XG5cbiAgICAgICAgaWYgKGJrZXkubGVuZ3RoID4gMzIpIHtcbiAgICAgICAgICBia2V5ID0gYmluYihia2V5LCBrZXkubGVuZ3RoICogOCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKDsgaSA8IDMyOyBpICs9IDEpIHtcbiAgICAgICAgICBpcGFkW2ldID0gYmtleVtpXSBeIDB4MzYzNjM2MzY7XG4gICAgICAgICAgb3BhZFtpXSA9IGJrZXlbaV0gXiAweDVDNUM1QzVDO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzaCA9IGJpbmIoaXBhZC5jb25jYXQocnN0cjJiaW5iKGRhdGEpKSwgMTAyNCArIGRhdGEubGVuZ3RoICogOCk7XG4gICAgICAgIHJldHVybiBiaW5iMnJzdHIoYmluYihvcGFkLmNvbmNhdChoYXNoKSwgMTAyNCArIDUxMikpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENhbGN1bGF0ZSB0aGUgU0hBLTUxMiBvZiBhbiBhcnJheSBvZiBiaWctZW5kaWFuIGR3b3JkcywgYW5kIGEgYml0IGxlbmd0aFxuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIGJpbmIoeCwgbGVuKSB7XG4gICAgICAgIHZhciBqLCBpLCBsLFxuICAgICAgICAgIFcgPSBuZXcgQXJyYXkoODApLFxuICAgICAgICAgIGhhc2ggPSBuZXcgQXJyYXkoMTYpLFxuICAgICAgICAgIC8vSW5pdGlhbCBoYXNoIHZhbHVlc1xuICAgICAgICAgIEggPSBbXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg2YTA5ZTY2NywgLTIwNTczMTU3NiksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTExNTA4MzMwMTksIC0yMDY3MDkzNzAxKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDNjNmVmMzcyLCAtMjM3OTE1NzMpLFxuICAgICAgICAgICAgbmV3IGludDY0KC0xNTIxNDg2NTM0LCAweDVmMWQzNmYxKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDUxMGU1MjdmLCAtMTM3NzQwMjE1OSksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTE2OTQxNDQzNzIsIDB4MmIzZTZjMWYpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4MWY4M2Q5YWIsIC03OTU3Nzc0OSksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg1YmUwY2QxOSwgMHgxMzdlMjE3OSlcbiAgICAgICAgICBdLFxuICAgICAgICAgIFQxID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIFQyID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIGEgPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgYiA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICBjID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIGQgPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgZSA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICBmID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIGcgPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgaCA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICAvL1RlbXBvcmFyeSB2YXJpYWJsZXMgbm90IHNwZWNpZmllZCBieSB0aGUgZG9jdW1lbnRcbiAgICAgICAgICBzMCA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICBzMSA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICBDaCA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICBNYWogPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgcjEgPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgcjIgPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgcjMgPSBuZXcgaW50NjQoMCwgMCk7XG5cbiAgICAgICAgaWYgKHNoYTUxMl9rID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvL1NIQTUxMiBjb25zdGFudHNcbiAgICAgICAgICBzaGE1MTJfayA9IFtcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDQyOGEyZjk4LCAtNjg1MTk5ODM4KSwgbmV3IGludDY0KDB4NzEzNzQ0OTEsIDB4MjNlZjY1Y2QpLFxuICAgICAgICAgICAgbmV3IGludDY0KC0xMjQ1NjQzODI1LCAtMzMwNDgyODk3KSwgbmV3IGludDY0KC0zNzM5NTc3MjMsIC0yMTIxNjcxNzQ4KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDM5NTZjMjViLCAtMjEzMzM4ODI0KSwgbmV3IGludDY0KDB4NTlmMTExZjEsIC0xMjQxMTMzMDMxKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMTg0MTMzMTU0OCwgLTEzNTcyOTU3MTcpLCBuZXcgaW50NjQoLTE0MjQyMDQwNzUsIC02MzAzNTc3MzYpLFxuICAgICAgICAgICAgbmV3IGludDY0KC02NzA1ODYyMTYsIC0xNTYwMDgzOTAyKSwgbmV3IGludDY0KDB4MTI4MzViMDEsIDB4NDU3MDZmYmUpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4MjQzMTg1YmUsIDB4NGVlNGIyOGMpLCBuZXcgaW50NjQoMHg1NTBjN2RjMywgLTcwNDY2MjMwMiksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg3MmJlNWQ3NCwgLTIyNjc4NDkxMyksIG5ldyBpbnQ2NCgtMjEzMjg4OTA5MCwgMHgzYjE2OTZiMSksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTE2ODAwNzkxOTMsIDB4MjVjNzEyMzUpLCBuZXcgaW50NjQoLTEwNDY3NDQ3MTYsIC04MTUxOTI0MjgpLFxuICAgICAgICAgICAgbmV3IGludDY0KC00NTk1NzY4OTUsIC0xNjI4MzUzODM4KSwgbmV3IGludDY0KC0yNzI3NDI1MjIsIDB4Mzg0ZjI1ZTMpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4ZmMxOWRjNiwgLTE5NTM3MDQ1MjMpLCBuZXcgaW50NjQoMHgyNDBjYTFjYywgMHg3N2FjOWM2NSksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHgyZGU5MmM2ZiwgMHg1OTJiMDI3NSksIG5ldyBpbnQ2NCgweDRhNzQ4NGFhLCAweDZlYTZlNDgzKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDVjYjBhOWRjLCAtMTExOTc0OTE2NCksIG5ldyBpbnQ2NCgweDc2Zjk4OGRhLCAtMjA5NjAxNjQ1OSksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTE3NDA3NDY0MTQsIC0yOTUyNDc5NTcpLCBuZXcgaW50NjQoLTE0NzMxMzI5NDcsIDB4MmRiNDMyMTApLFxuICAgICAgICAgICAgbmV3IGludDY0KC0xMzQxOTcwNDg4LCAtMTcyODM3MjQxNyksIG5ldyBpbnQ2NCgtMTA4NDY1MzYyNSwgLTEwOTE2MjkzNDApLFxuICAgICAgICAgICAgbmV3IGludDY0KC05NTgzOTU0MDUsIDB4M2RhODhmYzIpLCBuZXcgaW50NjQoLTcxMDQzODU4NSwgLTE4MjgwMTgzOTUpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4NmNhNjM1MSwgLTUzNjY0MDkxMyksIG5ldyBpbnQ2NCgweDE0MjkyOTY3LCAweGEwZTZlNzApLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4MjdiNzBhODUsIDB4NDZkMjJmZmMpLCBuZXcgaW50NjQoMHgyZTFiMjEzOCwgMHg1YzI2YzkyNiksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg0ZDJjNmRmYywgMHg1YWM0MmFlZCksIG5ldyBpbnQ2NCgweDUzMzgwZDEzLCAtMTY1MTEzMzQ3MyksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg2NTBhNzM1NCwgLTE5NTE0Mzk5MDYpLCBuZXcgaW50NjQoMHg3NjZhMGFiYiwgMHgzYzc3YjJhOCksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTIxMTc5NDA5NDYsIDB4NDdlZGFlZTYpLCBuZXcgaW50NjQoLTE4MzgwMTEyNTksIDB4MTQ4MjM1M2IpLFxuICAgICAgICAgICAgbmV3IGludDY0KC0xNTY0NDgxMzc1LCAweDRjZjEwMzY0KSwgbmV3IGludDY0KC0xNDc0NjY0ODg1LCAtMTEzNjUxMzAyMyksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTEwMzUyMzY0OTYsIC03ODkwMTQ2MzkpLCBuZXcgaW50NjQoLTk0OTIwMjUyNSwgMHg2NTRiZTMwKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtNzc4OTAxNDc5LCAtNjg4OTU4OTUyKSwgbmV3IGludDY0KC02OTQ2MTQ0OTIsIDB4NTU2NWE5MTApLFxuICAgICAgICAgICAgbmV3IGludDY0KC0yMDAzOTUzODcsIDB4NTc3MTIwMmEpLCBuZXcgaW50NjQoMHgxMDZhYTA3MCwgMHgzMmJiZDFiOCksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHgxOWE0YzExNiwgLTExOTQxNDM1NDQpLCBuZXcgaW50NjQoMHgxZTM3NmMwOCwgMHg1MTQxYWI1MyksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHgyNzQ4Nzc0YywgLTU0NDI4MTcwMyksIG5ldyBpbnQ2NCgweDM0YjBiY2I1LCAtNTA5OTE3MDE2KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDM5MWMwY2IzLCAtOTc2NjU5ODY5KSwgbmV3IGludDY0KDB4NGVkOGFhNGEsIC00ODIyNDM4OTMpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4NWI5Y2NhNGYsIDB4Nzc2M2UzNzMpLCBuZXcgaW50NjQoMHg2ODJlNmZmMywgLTY5MjkzMDM5NyksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg3NDhmODJlZSwgMHg1ZGVmYjJmYyksIG5ldyBpbnQ2NCgweDc4YTU2MzZmLCAweDQzMTcyZjYwKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMjA2NzIzNjg0NCwgLTE1NzgwNjI5OTApLCBuZXcgaW50NjQoLTE5MzMxMTQ4NzIsIDB4MWE2NDM5ZWMpLFxuICAgICAgICAgICAgbmV3IGludDY0KC0xODY2NTMwODIyLCAweDIzNjMxZTI4KSwgbmV3IGludDY0KC0xNTM4MjMzMTA5LCAtNTYxODU3MDQ3KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMTA5MDkzNTgxNywgLTEyOTU2MTU3MjMpLCBuZXcgaW50NjQoLTk2NTY0MTk5OCwgLTQ3OTA0Njg2OSksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTkwMzM5NzY4MiwgLTM2NjU4MzM5NiksIG5ldyBpbnQ2NCgtNzc5NzAwMDI1LCAweDIxYzBjMjA3KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMzU0Nzc5NjkwLCAtODQwODk3NzYyKSwgbmV3IGludDY0KC0xNzYzMzcwMjUsIC0yOTQ3MjczMDQpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4NmYwNjdhYSwgMHg3MjE3NmZiYSksIG5ldyBpbnQ2NCgweGE2MzdkYzUsIC0xNTYzOTEyMDI2KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDExM2Y5ODA0LCAtMTA5MDk3NDI5MCksIG5ldyBpbnQ2NCgweDFiNzEwYjM1LCAweDEzMWM0NzFiKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDI4ZGI3N2Y1LCAweDIzMDQ3ZDg0KSwgbmV3IGludDY0KDB4MzJjYWFiN2IsIDB4NDBjNzI0OTMpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4M2M5ZWJlMGEsIDB4MTVjOWJlYmMpLCBuZXcgaW50NjQoMHg0MzFkNjdjNCwgLTE2NzY2Njk2MjApLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4NGNjNWQ0YmUsIC04ODUxMTIxMzgpLCBuZXcgaW50NjQoMHg1OTdmMjk5YywgLTYwNDU3NDMwKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDVmY2I2ZmFiLCAweDNhZDZmYWVjKSwgbmV3IGludDY0KDB4NmM0NDE5OGMsIDB4NGE0NzU4MTcpXG4gICAgICAgICAgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCA4MDsgaSArPSAxKSB7XG4gICAgICAgICAgV1tpXSA9IG5ldyBpbnQ2NCgwLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFwcGVuZCBwYWRkaW5nIHRvIHRoZSBzb3VyY2Ugc3RyaW5nLiBUaGUgZm9ybWF0IGlzIGRlc2NyaWJlZCBpbiB0aGUgRklQUy5cbiAgICAgICAgeFtsZW4gPj4gNV0gfD0gMHg4MCA8PCAoMjQgLSAobGVuICYgMHgxZikpO1xuICAgICAgICB4WygobGVuICsgMTI4ID4+IDEwKSA8PCA1KSArIDMxXSA9IGxlbjtcbiAgICAgICAgbCA9IHgubGVuZ3RoO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSAzMikgeyAvLzMyIGR3b3JkcyBpcyB0aGUgYmxvY2sgc2l6ZVxuICAgICAgICAgIGludDY0Y29weShhLCBIWzBdKTtcbiAgICAgICAgICBpbnQ2NGNvcHkoYiwgSFsxXSk7XG4gICAgICAgICAgaW50NjRjb3B5KGMsIEhbMl0pO1xuICAgICAgICAgIGludDY0Y29weShkLCBIWzNdKTtcbiAgICAgICAgICBpbnQ2NGNvcHkoZSwgSFs0XSk7XG4gICAgICAgICAgaW50NjRjb3B5KGYsIEhbNV0pO1xuICAgICAgICAgIGludDY0Y29weShnLCBIWzZdKTtcbiAgICAgICAgICBpbnQ2NGNvcHkoaCwgSFs3XSk7XG5cbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgMTY7IGogKz0gMSkge1xuICAgICAgICAgICAgV1tqXS5oID0geFtpICsgMiAqIGpdO1xuICAgICAgICAgICAgV1tqXS5sID0geFtpICsgMiAqIGogKyAxXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKGogPSAxNjsgaiA8IDgwOyBqICs9IDEpIHtcbiAgICAgICAgICAgIC8vc2lnbWExXG4gICAgICAgICAgICBpbnQ2NHJyb3QocjEsIFdbaiAtIDJdLCAxOSk7XG4gICAgICAgICAgICBpbnQ2NHJldnJyb3QocjIsIFdbaiAtIDJdLCAyOSk7XG4gICAgICAgICAgICBpbnQ2NHNocihyMywgV1tqIC0gMl0sIDYpO1xuICAgICAgICAgICAgczEubCA9IHIxLmwgXiByMi5sIF4gcjMubDtcbiAgICAgICAgICAgIHMxLmggPSByMS5oIF4gcjIuaCBeIHIzLmg7XG4gICAgICAgICAgICAvL3NpZ21hMFxuICAgICAgICAgICAgaW50NjRycm90KHIxLCBXW2ogLSAxNV0sIDEpO1xuICAgICAgICAgICAgaW50NjRycm90KHIyLCBXW2ogLSAxNV0sIDgpO1xuICAgICAgICAgICAgaW50NjRzaHIocjMsIFdbaiAtIDE1XSwgNyk7XG4gICAgICAgICAgICBzMC5sID0gcjEubCBeIHIyLmwgXiByMy5sO1xuICAgICAgICAgICAgczAuaCA9IHIxLmggXiByMi5oIF4gcjMuaDtcblxuICAgICAgICAgICAgaW50NjRhZGQ0KFdbal0sIHMxLCBXW2ogLSA3XSwgczAsIFdbaiAtIDE2XSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IDgwOyBqICs9IDEpIHtcbiAgICAgICAgICAgIC8vQ2hcbiAgICAgICAgICAgIENoLmwgPSAoZS5sICYgZi5sKSBeICh+ZS5sICYgZy5sKTtcbiAgICAgICAgICAgIENoLmggPSAoZS5oICYgZi5oKSBeICh+ZS5oICYgZy5oKTtcblxuICAgICAgICAgICAgLy9TaWdtYTFcbiAgICAgICAgICAgIGludDY0cnJvdChyMSwgZSwgMTQpO1xuICAgICAgICAgICAgaW50NjRycm90KHIyLCBlLCAxOCk7XG4gICAgICAgICAgICBpbnQ2NHJldnJyb3QocjMsIGUsIDkpO1xuICAgICAgICAgICAgczEubCA9IHIxLmwgXiByMi5sIF4gcjMubDtcbiAgICAgICAgICAgIHMxLmggPSByMS5oIF4gcjIuaCBeIHIzLmg7XG5cbiAgICAgICAgICAgIC8vU2lnbWEwXG4gICAgICAgICAgICBpbnQ2NHJyb3QocjEsIGEsIDI4KTtcbiAgICAgICAgICAgIGludDY0cmV2cnJvdChyMiwgYSwgMik7XG4gICAgICAgICAgICBpbnQ2NHJldnJyb3QocjMsIGEsIDcpO1xuICAgICAgICAgICAgczAubCA9IHIxLmwgXiByMi5sIF4gcjMubDtcbiAgICAgICAgICAgIHMwLmggPSByMS5oIF4gcjIuaCBeIHIzLmg7XG5cbiAgICAgICAgICAgIC8vTWFqXG4gICAgICAgICAgICBNYWoubCA9IChhLmwgJiBiLmwpIF4gKGEubCAmIGMubCkgXiAoYi5sICYgYy5sKTtcbiAgICAgICAgICAgIE1hai5oID0gKGEuaCAmIGIuaCkgXiAoYS5oICYgYy5oKSBeIChiLmggJiBjLmgpO1xuXG4gICAgICAgICAgICBpbnQ2NGFkZDUoVDEsIGgsIHMxLCBDaCwgc2hhNTEyX2tbal0sIFdbal0pO1xuICAgICAgICAgICAgaW50NjRhZGQoVDIsIHMwLCBNYWopO1xuXG4gICAgICAgICAgICBpbnQ2NGNvcHkoaCwgZyk7XG4gICAgICAgICAgICBpbnQ2NGNvcHkoZywgZik7XG4gICAgICAgICAgICBpbnQ2NGNvcHkoZiwgZSk7XG4gICAgICAgICAgICBpbnQ2NGFkZChlLCBkLCBUMSk7XG4gICAgICAgICAgICBpbnQ2NGNvcHkoZCwgYyk7XG4gICAgICAgICAgICBpbnQ2NGNvcHkoYywgYik7XG4gICAgICAgICAgICBpbnQ2NGNvcHkoYiwgYSk7XG4gICAgICAgICAgICBpbnQ2NGFkZChhLCBUMSwgVDIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbnQ2NGFkZChIWzBdLCBIWzBdLCBhKTtcbiAgICAgICAgICBpbnQ2NGFkZChIWzFdLCBIWzFdLCBiKTtcbiAgICAgICAgICBpbnQ2NGFkZChIWzJdLCBIWzJdLCBjKTtcbiAgICAgICAgICBpbnQ2NGFkZChIWzNdLCBIWzNdLCBkKTtcbiAgICAgICAgICBpbnQ2NGFkZChIWzRdLCBIWzRdLCBlKTtcbiAgICAgICAgICBpbnQ2NGFkZChIWzVdLCBIWzVdLCBmKTtcbiAgICAgICAgICBpbnQ2NGFkZChIWzZdLCBIWzZdLCBnKTtcbiAgICAgICAgICBpbnQ2NGFkZChIWzddLCBIWzddLCBoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcmVwcmVzZW50IHRoZSBoYXNoIGFzIGFuIGFycmF5IG9mIDMyLWJpdCBkd29yZHNcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDg7IGkgKz0gMSkge1xuICAgICAgICAgIGhhc2hbMiAqIGldID0gSFtpXS5oO1xuICAgICAgICAgIGhhc2hbMiAqIGkgKyAxXSA9IEhbaV0ubDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaDtcbiAgICAgIH1cblxuICAgICAgLy9BIGNvbnN0cnVjdG9yIGZvciA2NC1iaXQgbnVtYmVyc1xuXG4gICAgICBmdW5jdGlvbiBpbnQ2NChoLCBsKSB7XG4gICAgICAgIHRoaXMuaCA9IGg7XG4gICAgICAgIHRoaXMubCA9IGw7XG4gICAgICAgIC8vdGhpcy50b1N0cmluZyA9IGludDY0dG9TdHJpbmc7XG4gICAgICB9XG5cbiAgICAgIC8vQ29waWVzIHNyYyBpbnRvIGRzdCwgYXNzdW1pbmcgYm90aCBhcmUgNjQtYml0IG51bWJlcnNcblxuICAgICAgZnVuY3Rpb24gaW50NjRjb3B5KGRzdCwgc3JjKSB7XG4gICAgICAgIGRzdC5oID0gc3JjLmg7XG4gICAgICAgIGRzdC5sID0gc3JjLmw7XG4gICAgICB9XG5cbiAgICAgIC8vUmlnaHQtcm90YXRlcyBhIDY0LWJpdCBudW1iZXIgYnkgc2hpZnRcbiAgICAgIC8vV29uJ3QgaGFuZGxlIGNhc2VzIG9mIHNoaWZ0Pj0zMlxuICAgICAgLy9UaGUgZnVuY3Rpb24gcmV2cnJvdCgpIGlzIGZvciB0aGF0XG5cbiAgICAgIGZ1bmN0aW9uIGludDY0cnJvdChkc3QsIHgsIHNoaWZ0KSB7XG4gICAgICAgIGRzdC5sID0gKHgubCA+Pj4gc2hpZnQpIHwgKHguaCA8PCAoMzIgLSBzaGlmdCkpO1xuICAgICAgICBkc3QuaCA9ICh4LmggPj4+IHNoaWZ0KSB8ICh4LmwgPDwgKDMyIC0gc2hpZnQpKTtcbiAgICAgIH1cblxuICAgICAgLy9SZXZlcnNlcyB0aGUgZHdvcmRzIG9mIHRoZSBzb3VyY2UgYW5kIHRoZW4gcm90YXRlcyByaWdodCBieSBzaGlmdC5cbiAgICAgIC8vVGhpcyBpcyBlcXVpdmFsZW50IHRvIHJvdGF0aW9uIGJ5IDMyK3NoaWZ0XG5cbiAgICAgIGZ1bmN0aW9uIGludDY0cmV2cnJvdChkc3QsIHgsIHNoaWZ0KSB7XG4gICAgICAgIGRzdC5sID0gKHguaCA+Pj4gc2hpZnQpIHwgKHgubCA8PCAoMzIgLSBzaGlmdCkpO1xuICAgICAgICBkc3QuaCA9ICh4LmwgPj4+IHNoaWZ0KSB8ICh4LmggPDwgKDMyIC0gc2hpZnQpKTtcbiAgICAgIH1cblxuICAgICAgLy9CaXR3aXNlLXNoaWZ0cyByaWdodCBhIDY0LWJpdCBudW1iZXIgYnkgc2hpZnRcbiAgICAgIC8vV29uJ3QgaGFuZGxlIHNoaWZ0Pj0zMiwgYnV0IGl0J3MgbmV2ZXIgbmVlZGVkIGluIFNIQTUxMlxuXG4gICAgICBmdW5jdGlvbiBpbnQ2NHNocihkc3QsIHgsIHNoaWZ0KSB7XG4gICAgICAgIGRzdC5sID0gKHgubCA+Pj4gc2hpZnQpIHwgKHguaCA8PCAoMzIgLSBzaGlmdCkpO1xuICAgICAgICBkc3QuaCA9ICh4LmggPj4+IHNoaWZ0KTtcbiAgICAgIH1cblxuICAgICAgLy9BZGRzIHR3byA2NC1iaXQgbnVtYmVyc1xuICAgICAgLy9MaWtlIHRoZSBvcmlnaW5hbCBpbXBsZW1lbnRhdGlvbiwgZG9lcyBub3QgcmVseSBvbiAzMi1iaXQgb3BlcmF0aW9uc1xuXG4gICAgICBmdW5jdGlvbiBpbnQ2NGFkZChkc3QsIHgsIHkpIHtcbiAgICAgICAgdmFyIHcwID0gKHgubCAmIDB4ZmZmZikgKyAoeS5sICYgMHhmZmZmKTtcbiAgICAgICAgdmFyIHcxID0gKHgubCA+Pj4gMTYpICsgKHkubCA+Pj4gMTYpICsgKHcwID4+PiAxNik7XG4gICAgICAgIHZhciB3MiA9ICh4LmggJiAweGZmZmYpICsgKHkuaCAmIDB4ZmZmZikgKyAodzEgPj4+IDE2KTtcbiAgICAgICAgdmFyIHczID0gKHguaCA+Pj4gMTYpICsgKHkuaCA+Pj4gMTYpICsgKHcyID4+PiAxNik7XG4gICAgICAgIGRzdC5sID0gKHcwICYgMHhmZmZmKSB8ICh3MSA8PCAxNik7XG4gICAgICAgIGRzdC5oID0gKHcyICYgMHhmZmZmKSB8ICh3MyA8PCAxNik7XG4gICAgICB9XG5cbiAgICAgIC8vU2FtZSwgZXhjZXB0IHdpdGggNCBhZGRlbmRzLiBXb3JrcyBmYXN0ZXIgdGhhbiBhZGRpbmcgdGhlbSBvbmUgYnkgb25lLlxuXG4gICAgICBmdW5jdGlvbiBpbnQ2NGFkZDQoZHN0LCBhLCBiLCBjLCBkKSB7XG4gICAgICAgIHZhciB3MCA9IChhLmwgJiAweGZmZmYpICsgKGIubCAmIDB4ZmZmZikgKyAoYy5sICYgMHhmZmZmKSArIChkLmwgJiAweGZmZmYpO1xuICAgICAgICB2YXIgdzEgPSAoYS5sID4+PiAxNikgKyAoYi5sID4+PiAxNikgKyAoYy5sID4+PiAxNikgKyAoZC5sID4+PiAxNikgKyAodzAgPj4+IDE2KTtcbiAgICAgICAgdmFyIHcyID0gKGEuaCAmIDB4ZmZmZikgKyAoYi5oICYgMHhmZmZmKSArIChjLmggJiAweGZmZmYpICsgKGQuaCAmIDB4ZmZmZikgKyAodzEgPj4+IDE2KTtcbiAgICAgICAgdmFyIHczID0gKGEuaCA+Pj4gMTYpICsgKGIuaCA+Pj4gMTYpICsgKGMuaCA+Pj4gMTYpICsgKGQuaCA+Pj4gMTYpICsgKHcyID4+PiAxNik7XG4gICAgICAgIGRzdC5sID0gKHcwICYgMHhmZmZmKSB8ICh3MSA8PCAxNik7XG4gICAgICAgIGRzdC5oID0gKHcyICYgMHhmZmZmKSB8ICh3MyA8PCAxNik7XG4gICAgICB9XG5cbiAgICAgIC8vU2FtZSwgZXhjZXB0IHdpdGggNSBhZGRlbmRzXG5cbiAgICAgIGZ1bmN0aW9uIGludDY0YWRkNShkc3QsIGEsIGIsIGMsIGQsIGUpIHtcbiAgICAgICAgdmFyIHcwID0gKGEubCAmIDB4ZmZmZikgKyAoYi5sICYgMHhmZmZmKSArIChjLmwgJiAweGZmZmYpICsgKGQubCAmIDB4ZmZmZikgKyAoZS5sICYgMHhmZmZmKSxcbiAgICAgICAgICB3MSA9IChhLmwgPj4+IDE2KSArIChiLmwgPj4+IDE2KSArIChjLmwgPj4+IDE2KSArIChkLmwgPj4+IDE2KSArIChlLmwgPj4+IDE2KSArICh3MCA+Pj4gMTYpLFxuICAgICAgICAgIHcyID0gKGEuaCAmIDB4ZmZmZikgKyAoYi5oICYgMHhmZmZmKSArIChjLmggJiAweGZmZmYpICsgKGQuaCAmIDB4ZmZmZikgKyAoZS5oICYgMHhmZmZmKSArICh3MSA+Pj4gMTYpLFxuICAgICAgICAgIHczID0gKGEuaCA+Pj4gMTYpICsgKGIuaCA+Pj4gMTYpICsgKGMuaCA+Pj4gMTYpICsgKGQuaCA+Pj4gMTYpICsgKGUuaCA+Pj4gMTYpICsgKHcyID4+PiAxNik7XG4gICAgICAgIGRzdC5sID0gKHcwICYgMHhmZmZmKSB8ICh3MSA8PCAxNik7XG4gICAgICAgIGRzdC5oID0gKHcyICYgMHhmZmZmKSB8ICh3MyA8PCAxNik7XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAY2xhc3MgSGFzaGVzLlJNRDE2MFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY29uZmlnXVxuICAgICAqXG4gICAgICogQSBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBSSVBFTUQtMTYwIEFsZ29yaXRobVxuICAgICAqIFZlcnNpb24gMi4yIENvcHlyaWdodCBKZXJlbXkgTGluLCBQYXVsIEpvaG5zdG9uIDIwMDAgLSAyMDA5LlxuICAgICAqIE90aGVyIGNvbnRyaWJ1dG9yczogR3JlZyBIb2x0LCBBbmRyZXcgS2VwZXJ0LCBZZG5hciwgTG9zdGluZXRcbiAgICAgKiBTZWUgaHR0cDovL3BhamhvbWUub3JnLnVrL2NyeXB0L21kNSBmb3IgZGV0YWlscy5cbiAgICAgKiBBbHNvIGh0dHA6Ly93d3cub2NmLmJlcmtlbGV5LmVkdS9+ampsaW4vanNvdHAvXG4gICAgICovXG4gICAgUk1EMTYwOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAvKipcbiAgICAgICAqIFByaXZhdGUgcHJvcGVydGllcyBjb25maWd1cmF0aW9uIHZhcmlhYmxlcy4gWW91IG1heSBuZWVkIHRvIHR3ZWFrIHRoZXNlIHRvIGJlIGNvbXBhdGlibGUgd2l0aFxuICAgICAgICogdGhlIHNlcnZlci1zaWRlLCBidXQgdGhlIGRlZmF1bHRzIHdvcmsgaW4gbW9zdCBjYXNlcy5cbiAgICAgICAqIEBzZWUgdGhpcy5zZXRVcHBlckNhc2UoKSBtZXRob2RcbiAgICAgICAqIEBzZWUgdGhpcy5zZXRQYWQoKSBtZXRob2RcbiAgICAgICAqL1xuICAgICAgdmFyIGhleGNhc2UgPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy51cHBlcmNhc2UgPT09ICdib29sZWFuJykgPyBvcHRpb25zLnVwcGVyY2FzZSA6IGZhbHNlLFxuICAgICAgICAvKiBoZXhhZGVjaW1hbCBvdXRwdXQgY2FzZSBmb3JtYXQuIGZhbHNlIC0gbG93ZXJjYXNlOyB0cnVlIC0gdXBwZXJjYXNlICAqL1xuICAgICAgICBiNjRwYWQgPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5wYWQgPT09ICdzdHJpbmcnKSA/IG9wdGlvbnMucGEgOiAnPScsXG4gICAgICAgIC8qIGJhc2UtNjQgcGFkIGNoYXJhY3Rlci4gRGVmYXVsdCAnPScgZm9yIHN0cmljdCBSRkMgY29tcGxpYW5jZSAgICovXG4gICAgICAgIHV0ZjggPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy51dGY4ID09PSAnYm9vbGVhbicpID8gb3B0aW9ucy51dGY4IDogdHJ1ZSxcbiAgICAgICAgLyogZW5hYmxlL2Rpc2FibGUgdXRmOCBlbmNvZGluZyAqL1xuICAgICAgICBybWQxNjBfcjEgPSBbXG4gICAgICAgICAgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSxcbiAgICAgICAgICA3LCA0LCAxMywgMSwgMTAsIDYsIDE1LCAzLCAxMiwgMCwgOSwgNSwgMiwgMTQsIDExLCA4LFxuICAgICAgICAgIDMsIDEwLCAxNCwgNCwgOSwgMTUsIDgsIDEsIDIsIDcsIDAsIDYsIDEzLCAxMSwgNSwgMTIsXG4gICAgICAgICAgMSwgOSwgMTEsIDEwLCAwLCA4LCAxMiwgNCwgMTMsIDMsIDcsIDE1LCAxNCwgNSwgNiwgMixcbiAgICAgICAgICA0LCAwLCA1LCA5LCA3LCAxMiwgMiwgMTAsIDE0LCAxLCAzLCA4LCAxMSwgNiwgMTUsIDEzXG4gICAgICAgIF0sXG4gICAgICAgIHJtZDE2MF9yMiA9IFtcbiAgICAgICAgICA1LCAxNCwgNywgMCwgOSwgMiwgMTEsIDQsIDEzLCA2LCAxNSwgOCwgMSwgMTAsIDMsIDEyLFxuICAgICAgICAgIDYsIDExLCAzLCA3LCAwLCAxMywgNSwgMTAsIDE0LCAxNSwgOCwgMTIsIDQsIDksIDEsIDIsXG4gICAgICAgICAgMTUsIDUsIDEsIDMsIDcsIDE0LCA2LCA5LCAxMSwgOCwgMTIsIDIsIDEwLCAwLCA0LCAxMyxcbiAgICAgICAgICA4LCA2LCA0LCAxLCAzLCAxMSwgMTUsIDAsIDUsIDEyLCAyLCAxMywgOSwgNywgMTAsIDE0LFxuICAgICAgICAgIDEyLCAxNSwgMTAsIDQsIDEsIDUsIDgsIDcsIDYsIDIsIDEzLCAxNCwgMCwgMywgOSwgMTFcbiAgICAgICAgXSxcbiAgICAgICAgcm1kMTYwX3MxID0gW1xuICAgICAgICAgIDExLCAxNCwgMTUsIDEyLCA1LCA4LCA3LCA5LCAxMSwgMTMsIDE0LCAxNSwgNiwgNywgOSwgOCxcbiAgICAgICAgICA3LCA2LCA4LCAxMywgMTEsIDksIDcsIDE1LCA3LCAxMiwgMTUsIDksIDExLCA3LCAxMywgMTIsXG4gICAgICAgICAgMTEsIDEzLCA2LCA3LCAxNCwgOSwgMTMsIDE1LCAxNCwgOCwgMTMsIDYsIDUsIDEyLCA3LCA1LFxuICAgICAgICAgIDExLCAxMiwgMTQsIDE1LCAxNCwgMTUsIDksIDgsIDksIDE0LCA1LCA2LCA4LCA2LCA1LCAxMixcbiAgICAgICAgICA5LCAxNSwgNSwgMTEsIDYsIDgsIDEzLCAxMiwgNSwgMTIsIDEzLCAxNCwgMTEsIDgsIDUsIDZcbiAgICAgICAgXSxcbiAgICAgICAgcm1kMTYwX3MyID0gW1xuICAgICAgICAgIDgsIDksIDksIDExLCAxMywgMTUsIDE1LCA1LCA3LCA3LCA4LCAxMSwgMTQsIDE0LCAxMiwgNixcbiAgICAgICAgICA5LCAxMywgMTUsIDcsIDEyLCA4LCA5LCAxMSwgNywgNywgMTIsIDcsIDYsIDE1LCAxMywgMTEsXG4gICAgICAgICAgOSwgNywgMTUsIDExLCA4LCA2LCA2LCAxNCwgMTIsIDEzLCA1LCAxNCwgMTMsIDEzLCA3LCA1LFxuICAgICAgICAgIDE1LCA1LCA4LCAxMSwgMTQsIDE0LCA2LCAxNCwgNiwgOSwgMTIsIDksIDEyLCA1LCAxNSwgOCxcbiAgICAgICAgICA4LCA1LCAxMiwgOSwgMTIsIDUsIDE0LCA2LCA4LCAxMywgNiwgNSwgMTUsIDEzLCAxMSwgMTFcbiAgICAgICAgXTtcblxuICAgICAgLyogcHJpdmlsZWdlZCAocHVibGljKSBtZXRob2RzICovXG4gICAgICB0aGlzLmhleCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyaGV4KHJzdHIocywgdXRmOCkpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYjY0ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cjJiNjQocnN0cihzLCB1dGY4KSwgYjY0cGFkKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmFueSA9IGZ1bmN0aW9uKHMsIGUpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYW55KHJzdHIocywgdXRmOCksIGUpO1xuICAgICAgfTtcbiAgICAgIHRoaXMucmF3ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cihzLCB1dGY4KTtcbiAgICAgIH07XG4gICAgICB0aGlzLmhleF9obWFjID0gZnVuY3Rpb24oaywgZCkge1xuICAgICAgICByZXR1cm4gcnN0cjJoZXgocnN0cl9obWFjKGssIGQpKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmI2NF9obWFjID0gZnVuY3Rpb24oaywgZCkge1xuICAgICAgICByZXR1cm4gcnN0cjJiNjQocnN0cl9obWFjKGssIGQpLCBiNjRwYWQpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYW55X2htYWMgPSBmdW5jdGlvbihrLCBkLCBlKSB7XG4gICAgICAgIHJldHVybiByc3RyMmFueShyc3RyX2htYWMoaywgZCksIGUpO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogUGVyZm9ybSBhIHNpbXBsZSBzZWxmLXRlc3QgdG8gc2VlIGlmIHRoZSBWTSBpcyB3b3JraW5nXG4gICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IEhleGFkZWNpbWFsIGhhc2ggc2FtcGxlXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIHRoaXMudm1fdGVzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaGV4KCdhYmMnKS50b0xvd2VyQ2FzZSgpID09PSAnOTAwMTUwOTgzY2QyNGZiMGQ2OTYzZjdkMjhlMTdmNzInO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogQGRlc2NyaXB0aW9uIEVuYWJsZS9kaXNhYmxlIHVwcGVyY2FzZSBoZXhhZGVjaW1hbCByZXR1cm5lZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn1cbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFVwcGVyQ2FzZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoZXhjYXNlID0gYTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIEBkZXNjcmlwdGlvbiBEZWZpbmVzIGEgYmFzZTY0IHBhZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBQYWRcbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFBhZCA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGI2NHBhZCA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBAZGVzY3JpcHRpb24gRGVmaW5lcyBhIGJhc2U2NCBwYWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59XG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRVVEY4ID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIHV0ZjggPSBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgLyogcHJpdmF0ZSBtZXRob2RzICovXG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBybWQxNjAgb2YgYSByYXcgc3RyaW5nXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gcnN0cihzKSB7XG4gICAgICAgIHMgPSAodXRmOCkgPyB1dGY4RW5jb2RlKHMpIDogcztcbiAgICAgICAgcmV0dXJuIGJpbmwycnN0cihiaW5sKHJzdHIyYmlubChzKSwgcy5sZW5ndGggKiA4KSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBITUFDLXJtZDE2MCBvZiBhIGtleSBhbmQgc29tZSBkYXRhIChyYXcgc3RyaW5ncylcbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiByc3RyX2htYWMoa2V5LCBkYXRhKSB7XG4gICAgICAgIGtleSA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUoa2V5KSA6IGtleTtcbiAgICAgICAgZGF0YSA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUoZGF0YSkgOiBkYXRhO1xuICAgICAgICB2YXIgaSwgaGFzaCxcbiAgICAgICAgICBia2V5ID0gcnN0cjJiaW5sKGtleSksXG4gICAgICAgICAgaXBhZCA9IEFycmF5KDE2KSxcbiAgICAgICAgICBvcGFkID0gQXJyYXkoMTYpO1xuXG4gICAgICAgIGlmIChia2V5Lmxlbmd0aCA+IDE2KSB7XG4gICAgICAgICAgYmtleSA9IGJpbmwoYmtleSwga2V5Lmxlbmd0aCAqIDgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE2OyBpICs9IDEpIHtcbiAgICAgICAgICBpcGFkW2ldID0gYmtleVtpXSBeIDB4MzYzNjM2MzY7XG4gICAgICAgICAgb3BhZFtpXSA9IGJrZXlbaV0gXiAweDVDNUM1QzVDO1xuICAgICAgICB9XG4gICAgICAgIGhhc2ggPSBiaW5sKGlwYWQuY29uY2F0KHJzdHIyYmlubChkYXRhKSksIDUxMiArIGRhdGEubGVuZ3RoICogOCk7XG4gICAgICAgIHJldHVybiBiaW5sMnJzdHIoYmlubChvcGFkLmNvbmNhdChoYXNoKSwgNTEyICsgMTYwKSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29udmVydCBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzIHRvIGEgc3RyaW5nXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gYmlubDJyc3RyKGlucHV0KSB7XG4gICAgICAgIHZhciBpLCBvdXRwdXQgPSAnJyxcbiAgICAgICAgICBsID0gaW5wdXQubGVuZ3RoICogMzI7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDgpIHtcbiAgICAgICAgICBvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoaW5wdXRbaSA+PiA1XSA+Pj4gKGkgJSAzMikpICYgMHhGRik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDYWxjdWxhdGUgdGhlIFJJUEUtTUQxNjAgb2YgYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3JkcywgYW5kIGEgYml0IGxlbmd0aC5cbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiBiaW5sKHgsIGxlbikge1xuICAgICAgICB2YXIgVCwgaiwgaSwgbCxcbiAgICAgICAgICBoMCA9IDB4Njc0NTIzMDEsXG4gICAgICAgICAgaDEgPSAweGVmY2RhYjg5LFxuICAgICAgICAgIGgyID0gMHg5OGJhZGNmZSxcbiAgICAgICAgICBoMyA9IDB4MTAzMjU0NzYsXG4gICAgICAgICAgaDQgPSAweGMzZDJlMWYwLFxuICAgICAgICAgIEExLCBCMSwgQzEsIEQxLCBFMSxcbiAgICAgICAgICBBMiwgQjIsIEMyLCBEMiwgRTI7XG5cbiAgICAgICAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgICAgICAgeFtsZW4gPj4gNV0gfD0gMHg4MCA8PCAobGVuICUgMzIpO1xuICAgICAgICB4WygoKGxlbiArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNF0gPSBsZW47XG4gICAgICAgIGwgPSB4Lmxlbmd0aDtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSAxNikge1xuICAgICAgICAgIEExID0gQTIgPSBoMDtcbiAgICAgICAgICBCMSA9IEIyID0gaDE7XG4gICAgICAgICAgQzEgPSBDMiA9IGgyO1xuICAgICAgICAgIEQxID0gRDIgPSBoMztcbiAgICAgICAgICBFMSA9IEUyID0gaDQ7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8PSA3OTsgaiArPSAxKSB7XG4gICAgICAgICAgICBUID0gc2FmZV9hZGQoQTEsIHJtZDE2MF9mKGosIEIxLCBDMSwgRDEpKTtcbiAgICAgICAgICAgIFQgPSBzYWZlX2FkZChULCB4W2kgKyBybWQxNjBfcjFbal1dKTtcbiAgICAgICAgICAgIFQgPSBzYWZlX2FkZChULCBybWQxNjBfSzEoaikpO1xuICAgICAgICAgICAgVCA9IHNhZmVfYWRkKGJpdF9yb2woVCwgcm1kMTYwX3MxW2pdKSwgRTEpO1xuICAgICAgICAgICAgQTEgPSBFMTtcbiAgICAgICAgICAgIEUxID0gRDE7XG4gICAgICAgICAgICBEMSA9IGJpdF9yb2woQzEsIDEwKTtcbiAgICAgICAgICAgIEMxID0gQjE7XG4gICAgICAgICAgICBCMSA9IFQ7XG4gICAgICAgICAgICBUID0gc2FmZV9hZGQoQTIsIHJtZDE2MF9mKDc5IC0gaiwgQjIsIEMyLCBEMikpO1xuICAgICAgICAgICAgVCA9IHNhZmVfYWRkKFQsIHhbaSArIHJtZDE2MF9yMltqXV0pO1xuICAgICAgICAgICAgVCA9IHNhZmVfYWRkKFQsIHJtZDE2MF9LMihqKSk7XG4gICAgICAgICAgICBUID0gc2FmZV9hZGQoYml0X3JvbChULCBybWQxNjBfczJbal0pLCBFMik7XG4gICAgICAgICAgICBBMiA9IEUyO1xuICAgICAgICAgICAgRTIgPSBEMjtcbiAgICAgICAgICAgIEQyID0gYml0X3JvbChDMiwgMTApO1xuICAgICAgICAgICAgQzIgPSBCMjtcbiAgICAgICAgICAgIEIyID0gVDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBUID0gc2FmZV9hZGQoaDEsIHNhZmVfYWRkKEMxLCBEMikpO1xuICAgICAgICAgIGgxID0gc2FmZV9hZGQoaDIsIHNhZmVfYWRkKEQxLCBFMikpO1xuICAgICAgICAgIGgyID0gc2FmZV9hZGQoaDMsIHNhZmVfYWRkKEUxLCBBMikpO1xuICAgICAgICAgIGgzID0gc2FmZV9hZGQoaDQsIHNhZmVfYWRkKEExLCBCMikpO1xuICAgICAgICAgIGg0ID0gc2FmZV9hZGQoaDAsIHNhZmVfYWRkKEIxLCBDMikpO1xuICAgICAgICAgIGgwID0gVDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW2gwLCBoMSwgaDIsIGgzLCBoNF07XG4gICAgICB9XG5cbiAgICAgIC8vIHNwZWNpZmljIGFsZ29yaXRobSBtZXRob2RzXG5cbiAgICAgIGZ1bmN0aW9uIHJtZDE2MF9mKGosIHgsIHksIHopIHtcbiAgICAgICAgcmV0dXJuICgwIDw9IGogJiYgaiA8PSAxNSkgPyAoeCBeIHkgXiB6KSA6XG4gICAgICAgICAgKDE2IDw9IGogJiYgaiA8PSAzMSkgPyAoeCAmIHkpIHwgKH54ICYgeikgOlxuICAgICAgICAgICgzMiA8PSBqICYmIGogPD0gNDcpID8gKHggfCB+eSkgXiB6IDpcbiAgICAgICAgICAoNDggPD0gaiAmJiBqIDw9IDYzKSA/ICh4ICYgeikgfCAoeSAmIH56KSA6XG4gICAgICAgICAgKDY0IDw9IGogJiYgaiA8PSA3OSkgPyB4IF4gKHkgfCB+eikgOlxuICAgICAgICAgICdybWQxNjBfZjogaiBvdXQgb2YgcmFuZ2UnO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBybWQxNjBfSzEoaikge1xuICAgICAgICByZXR1cm4gKDAgPD0gaiAmJiBqIDw9IDE1KSA/IDB4MDAwMDAwMDAgOlxuICAgICAgICAgICgxNiA8PSBqICYmIGogPD0gMzEpID8gMHg1YTgyNzk5OSA6XG4gICAgICAgICAgKDMyIDw9IGogJiYgaiA8PSA0NykgPyAweDZlZDllYmExIDpcbiAgICAgICAgICAoNDggPD0gaiAmJiBqIDw9IDYzKSA/IDB4OGYxYmJjZGMgOlxuICAgICAgICAgICg2NCA8PSBqICYmIGogPD0gNzkpID8gMHhhOTUzZmQ0ZSA6XG4gICAgICAgICAgJ3JtZDE2MF9LMTogaiBvdXQgb2YgcmFuZ2UnO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBybWQxNjBfSzIoaikge1xuICAgICAgICByZXR1cm4gKDAgPD0gaiAmJiBqIDw9IDE1KSA/IDB4NTBhMjhiZTYgOlxuICAgICAgICAgICgxNiA8PSBqICYmIGogPD0gMzEpID8gMHg1YzRkZDEyNCA6XG4gICAgICAgICAgKDMyIDw9IGogJiYgaiA8PSA0NykgPyAweDZkNzAzZWYzIDpcbiAgICAgICAgICAoNDggPD0gaiAmJiBqIDw9IDYzKSA/IDB4N2E2ZDc2ZTkgOlxuICAgICAgICAgICg2NCA8PSBqICYmIGogPD0gNzkpID8gMHgwMDAwMDAwMCA6XG4gICAgICAgICAgJ3JtZDE2MF9LMjogaiBvdXQgb2YgcmFuZ2UnO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBleHBvc2VzIEhhc2hlc1xuICAoZnVuY3Rpb24od2luZG93LCB1bmRlZmluZWQpIHtcbiAgICB2YXIgZnJlZUV4cG9ydHMgPSBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICBmcmVlRXhwb3J0cyA9IGV4cG9ydHM7XG4gICAgICBpZiAoZXhwb3J0cyAmJiB0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsID09PSBnbG9iYWwuZ2xvYmFsKSB7XG4gICAgICAgIHdpbmRvdyA9IGdsb2JhbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgLy8gZGVmaW5lIGFzIGFuIGFub255bW91cyBtb2R1bGUsIHNvLCB0aHJvdWdoIHBhdGggbWFwcGluZywgaXQgY2FuIGJlIGFsaWFzZWRcbiAgICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEhhc2hlcztcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMpIHtcbiAgICAgIC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG4gICAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEhhc2hlcztcbiAgICAgIH1cbiAgICAgIC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG4gICAgICBlbHNlIHtcbiAgICAgICAgZnJlZUV4cG9ydHMuSGFzaGVzID0gSGFzaGVzO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbiBhIGJyb3dzZXIgb3IgUmhpbm9cbiAgICAgIHdpbmRvdy5IYXNoZXMgPSBIYXNoZXM7XG4gICAgfVxuICB9KHRoaXMpKTtcbn0oKSk7IC8vIElJRkVcbiJdLCJuYW1lcyI6WyJIYXNoZXMiLCJ1dGY4RW5jb2RlIiwic3RyIiwieCIsInkiLCJvdXRwdXQiLCJpIiwibCIsImxlbmd0aCIsImNoYXJDb2RlQXQiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJ1dGY4RGVjb2RlIiwiYWMiLCJjMSIsImMyIiwiYzMiLCJhcnIiLCJqb2luIiwic2FmZV9hZGQiLCJsc3ciLCJtc3ciLCJiaXRfcm9sIiwibnVtIiwiY250IiwicnN0cjJoZXgiLCJpbnB1dCIsImhleGNhc2UiLCJoZXhfdGFiIiwiY2hhckF0Iiwic3RyMnJzdHJfdXRmMTZsZSIsInN0cjJyc3RyX3V0ZjE2YmUiLCJiaW5iMnJzdHIiLCJiaW5sMnJzdHIiLCJyc3RyMmJpbmwiLCJBcnJheSIsImxvIiwicnN0cjJiaW5iIiwicnN0cjJhbnkiLCJlbmNvZGluZyIsImRpdmlzb3IiLCJyZW1haW5kZXJzIiwicSIsImxkIiwicXVvdGllbnQiLCJkaXZpZGVuZCIsImZ1bGxfbGVuZ3RoIiwiTWF0aCIsImNlaWwiLCJmbG9vciIsImxvZyIsInJzdHIyYjY0IiwiYjY0cGFkIiwidGFiIiwibGVuIiwiaiIsInRyaXBsZXQiLCJWRVJTSU9OIiwiQmFzZTY0IiwicGFkIiwidXJsIiwidXRmOCIsImVuY29kZSIsImRlY29kZSIsIm8xIiwibzIiLCJvMyIsImgxIiwiaDIiLCJoMyIsImg0IiwiYml0cyIsImRlYyIsInJlcGxhY2UiLCJSZWdFeHAiLCJpbmRleE9mIiwic2V0UGFkIiwic2V0VGFiIiwic2V0VVRGOCIsImJvb2wiLCJDUkMzMiIsImNyYyIsInRhYmxlIiwiaVRvcCIsInN1YnN0ciIsIk1ENSIsIm9wdGlvbnMiLCJ1cHBlcmNhc2UiLCJoZXgiLCJzIiwicnN0ciIsImI2NCIsImFueSIsImUiLCJyYXciLCJoZXhfaG1hYyIsImsiLCJkIiwicnN0cl9obWFjIiwiYjY0X2htYWMiLCJhbnlfaG1hYyIsInZtX3Rlc3QiLCJ0b0xvd2VyQ2FzZSIsInNldFVwcGVyQ2FzZSIsImEiLCJiaW5sIiwia2V5IiwiZGF0YSIsImJrZXkiLCJpcGFkIiwib3BhZCIsImhhc2giLCJjb25jYXQiLCJvbGRhIiwib2xkYiIsIm9sZGMiLCJvbGRkIiwiYiIsImMiLCJtZDVfZmYiLCJtZDVfZ2ciLCJtZDVfaGgiLCJtZDVfaWkiLCJtZDVfY21uIiwidCIsIlNIQTEiLCJiaW5iIiwib2xkZSIsInciLCJzaGExX2Z0Iiwic2hhMV9rdCIsIlNIQTI1NiIsInNoYTI1Nl9LIiwic2hhMjU2X1MiLCJYIiwibiIsInNoYTI1Nl9SIiwic2hhMjU2X0NoIiwieiIsInNoYTI1Nl9NYWoiLCJzaGEyNTZfU2lnbWEwMjU2Iiwic2hhMjU2X1NpZ21hMTI1NiIsInNoYTI1Nl9HYW1tYTAyNTYiLCJzaGEyNTZfR2FtbWExMjU2Iiwic2hhMjU2X1NpZ21hMDUxMiIsInNoYTI1Nl9TaWdtYTE1MTIiLCJzaGEyNTZfR2FtbWEwNTEyIiwic2hhMjU2X0dhbW1hMTUxMiIsIm0iLCJIQVNIIiwiVyIsImYiLCJnIiwiaCIsIlQxIiwiVDIiLCJTSEE1MTIiLCJzaGE1MTJfayIsIkgiLCJpbnQ2NCIsInMwIiwiczEiLCJDaCIsIk1haiIsInIxIiwicjIiLCJyMyIsInVuZGVmaW5lZCIsImludDY0Y29weSIsImludDY0cnJvdCIsImludDY0cmV2cnJvdCIsImludDY0c2hyIiwiaW50NjRhZGQ0IiwiaW50NjRhZGQ1IiwiaW50NjRhZGQiLCJkc3QiLCJzcmMiLCJzaGlmdCIsIncwIiwidzEiLCJ3MiIsInczIiwiUk1EMTYwIiwicGEiLCJybWQxNjBfcjEiLCJybWQxNjBfcjIiLCJybWQxNjBfczEiLCJybWQxNjBfczIiLCJUIiwiaDAiLCJBMSIsIkIxIiwiQzEiLCJEMSIsIkUxIiwiQTIiLCJCMiIsIkMyIiwiRDIiLCJFMiIsInJtZDE2MF9mIiwicm1kMTYwX0sxIiwicm1kMTYwX0syIiwid2luZG93IiwiZnJlZUV4cG9ydHMiLCJleHBvcnRzIiwiZ2xvYmFsIiwiZGVmaW5lIiwiYW1kIiwibW9kdWxlIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FDQSxDQUFBO0lBQ0MsSUFBSUE7SUFFSixTQUFTQyxXQUFXQyxHQUFHO1FBQ3JCLElBQUlDLEdBQUdDLEdBQUdDLFNBQVMsSUFDakJDLElBQUksQ0FBQyxHQUNMQztRQUVGLElBQUlMLE9BQU9BLElBQUlNLE1BQU0sRUFBRTtZQUNyQkQsSUFBSUwsSUFBSU0sTUFBTTtZQUNkLE1BQU8sQUFBQ0YsQ0FBQUEsS0FBSyxDQUFBLElBQUtDLEVBQUc7Z0JBQ25CLGlDQUFpQyxHQUNqQ0osSUFBSUQsSUFBSU8sVUFBVSxDQUFDSDtnQkFDbkJGLElBQUlFLElBQUksSUFBSUMsSUFBSUwsSUFBSU8sVUFBVSxDQUFDSCxJQUFJLEtBQUs7Z0JBQ3hDLElBQUksVUFBVUgsS0FBS0EsS0FBSyxVQUFVLFVBQVVDLEtBQUtBLEtBQUssUUFBUTtvQkFDNURELElBQUksVUFBVyxDQUFBLEFBQUNBLENBQUFBLElBQUksTUFBSyxLQUFNLEVBQUMsSUFBTUMsQ0FBQUEsSUFBSSxNQUFLO29CQUMvQ0UsS0FBSztnQkFDUDtnQkFDQSwwQkFBMEIsR0FDMUIsSUFBSUgsS0FBSyxNQUFNO29CQUNiRSxVQUFVSyxPQUFPQyxZQUFZLENBQUNSO2dCQUNoQyxPQUFPLElBQUlBLEtBQUssT0FBTztvQkFDckJFLFVBQVVLLE9BQU9DLFlBQVksQ0FBQyxPQUFRLEFBQUNSLE1BQU0sSUFBSyxNQUNo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TUFBTSxDQUFDLFlBQVksQ0FBQzt3QkFBWSxJQUFJQSxNQUFNLENBQUMsWUFBWTt3QkFDM0QsSUFBSUEsTUFBTSxDQUFDLFlBQVksQ0FBQzt3QkFBYSxJQUFJQSxNQUFNLENBQUMsWUFBWSxDQUFDO3dCQUM3RCxJQUFJQSxNQUFNLENBQUMsV0FBVzt3QkFBYSxJQUFJQSxNQUFNLENBQUMsV0FBVyxDQUFDO3dCQUMxRCxJQUFJQSxNQUFNLFdBQVcsQ0FBQzt3QkFBWSxJQUFJQSxNQUFNLFlBQVk7d0JBQ3hELElBQUlBLE1BQU0sWUFBWTt3QkFBYSxJQUFJQSxNQUFNLFlBQVk7d0JBQ3pELElBQUlBLE1BQU0sWUFBWTt3QkFBYSxJQUFJQSxNQUFNLFlBQVksQ0FBQzt3QkFDMUQsSUFBSUEsTUFBTSxZQUFZLENBQUM7d0JBQWEsSUFBSUEsTUFBTSxZQUFZO3dCQUMxRCxJQUFJQSxNQUFNLENBQUMsWUFBWTt3QkFBYSxJQUFJQSxNQUFNLENBQUMsWUFBWTt3QkFDM0QsSUFBSUEsTUFBTSxDQUFDLFlBQVk7d0JBQWEsSUFBSUEsTUFBTSxDQUFDLFlBQVksQ0FBQzt3QkFDNUQsSUFBSUEsTUFBTSxDQUFDLFlBQVksQ0FBQzt3QkFBWSxJQUFJQSxNQUFNLENBQUMsV0FBVzt3QkFDMUQsSUFBSUEsTUFBTSxDQUFDLFdBQVcsQ0FBQzt3QkFBWSxJQUFJQSxNQUFNLENBQUMsV0FBVzt3QkFDekQsSUFBSUEsTUFBTSxDQUFDLFdBQVc7d0JBQWEsSUFBSUEsTUFBTSxZQUFZO3dCQUN6RCxJQUFJQSxNQUFNLFlBQVksQ0FBQzt3QkFBYSxJQUFJQSxNQUFNLFlBQVk7d0JBQzFELElBQUlBLE1BQU0sWUFBWSxDQUFDO3dCQUFZLElBQUlBLE1BQU0sWUFBWSxDQUFDO3dCQUMxRCxJQUFJQSxNQUFNLFlBQVksQ0FBQzt3QkFBWSxJQUFJQSxNQUFNLFlBQVksQ0FBQzt3QkFDMUQsSUFBSUEsTUFBTSxZQUFZO3dCQUFhLElBQUlBLE1BQU0sWUFBWSxDQUFDO3dCQUMxRCxJQUFJQSxNQUFNLFlBQVk7d0JBQWEsSUFBSUEsTUFB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O2dCQUFJO2dCQUNsRDtnQkFBRztnQkFBRztnQkFBSTtnQkFBRztnQkFBSTtnQkFBRztnQkFBSTtnQkFBRztnQkFBSTtnQkFBRztnQkFBRztnQkFBRztnQkFBRztnQkFBSTtnQkFBSTtnQkFDbkQ7Z0JBQUc7Z0JBQUk7Z0JBQUk7Z0JBQUc7Z0JBQUc7Z0JBQUk7Z0JBQUc7Z0JBQUc7Z0JBQUc7Z0JBQUc7Z0JBQUc7Z0JBQUc7Z0JBQUk7Z0JBQUk7Z0JBQUc7Z0JBQ2xEO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUNuRDtnQkFBRztnQkFBRztnQkFBRztnQkFBRztnQkFBRztnQkFBSTtnQkFBRztnQkFBSTtnQkFBSTtnQkFBRztnQkFBRztnQkFBRztnQkFBSTtnQkFBRztnQkFBSTthQUNuRCxFQUNEQyxZQUFZO2dCQUNWO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUNsRDtnQkFBRztnQkFBSTtnQkFBRztnQkFBRztnQkFBRztnQkFBSTtnQkFBRztnQkFBSTtnQkFBSTtnQkFBSTtnQkFBRztnQkFBSTtnQkFBRztnQkFBRztnQkFBRztnQkFDbkQ7Z0JBQUk7Z0JBQUc7Z0JBQUc7Z0JBQUc7Z0JBQUc7Z0JBQUk7Z0JBQUc7Z0JBQUc7Z0JBQUk7Z0JBQUc7Z0JBQUk7Z0JBQUc7Z0JBQUk7Z0JBQUc7Z0JBQUc7Z0JBQ2xEO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUNsRDtnQkFBSTtnQkFBSTtnQkFBSTtnQkFBRztnQkFBRztnQkFBRztnQkFBRztnQkFBRztnQkFBRztnQkFBRztnQkFBSTtnQkFBSTtnQkFBRztnQkFBRztnQkFBRzthQUNuRCxFQUNEQyxZQUFZO2dCQUNWO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUNyRDtnQkFBRztnQkFBRztnQkFBRztnQkFBSTtnQkFBSTtnQkFBRztnQkFBRztnQkFBSTtnQkFBRztnQkFBSTtnQkFBSTtnQkFBRztnQkFBSTtnQkFBRztnQkFBSTtnQkFDcEQ7Z0JBQUk7Z0JBQUk7Z0JBQUc7Z0JBQUc7Z0JBQUk7Z0JBQUc7Z0JBQUk7Z0JBQUk7Z0JBQUk7Z0JBQUc7Z0JBQUk7Z0JBQUc7Z0JBQUc7Z0JBQUk7Z0JBQUc7Z0JBQ3JEO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUNwRDtnQkFBRztnQkFBSTtnQkFBRztnQkFBSTtnQkFBRztnQkFBRztnQkFBSTtnQkFBSTtnQkFBRztnQkFBSTtnQkFBSTtnQkFBSTtnQkFBSTtnQkFBRztnQkFBRzthQUN0RCxFQUNEQyxZQUFZO2dCQUNWO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUNyRDtnQkFBRztnQkFBSTtnQkFBSTtnQkFBRztnQkFBSTtnQkFBRztnQkFBRztnQkFBSTtnQkFBRztnQkFBRztnQkFBSTtnQkFBRztnQkFBRztnQkFBSTtnQkFBSTtnQkFDcEQ7Z0JBQUc7Z0JBQUc7Z0JBQUk7Z0JBQUk7Z0JBQUc7Z0JBQUc7Z0JBQUc7Z0JBQUk7Z0JBQUk7Z0JBQUk7Z0JBQUc7Z0JBQUk7Z0JBQUk7Z0JBQUk7Z0JBQUc7Z0JBQ3JEO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFJO2dCQUFJO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFJO2dCQUFHO2dCQUFJ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