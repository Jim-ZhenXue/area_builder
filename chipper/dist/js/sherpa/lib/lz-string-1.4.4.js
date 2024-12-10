// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
var LZString = function() {
    // private property
    var f = String.fromCharCode;
    var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
    var baseReverseDic = {};
    function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
            baseReverseDic[alphabet] = {};
            for(var i = 0; i < alphabet.length; i++){
                baseReverseDic[alphabet][alphabet.charAt(i)] = i;
            }
        }
        return baseReverseDic[alphabet][character];
    }
    var LZString = {
        compressToBase64: function(input) {
            if (input == null) return "";
            var res = LZString._compress(input, 6, function(a) {
                return keyStrBase64.charAt(a);
            });
            switch(res.length % 4){
                default:
                case 0:
                    return res;
                case 1:
                    return res + "===";
                case 2:
                    return res + "==";
                case 3:
                    return res + "=";
            }
        },
        decompressFromBase64: function(input) {
            if (input == null) return "";
            if (input == "") return null;
            return LZString._decompress(input.length, 32, function(index) {
                return getBaseValue(keyStrBase64, input.charAt(index));
            });
        },
        compressToUTF16: function(input) {
            if (input == null) return "";
            return LZString._compress(input, 15, function(a) {
                return f(a + 32);
            }) + " ";
        },
        decompressFromUTF16: function(compressed) {
            if (compressed == null) return "";
            if (compressed == "") return null;
            return LZString._decompress(compressed.length, 16384, function(index) {
                return compressed.charCodeAt(index) - 32;
            });
        },
        //compress into uint8array (UCS-2 big endian format)
        compressToUint8Array: function(uncompressed) {
            var compressed = LZString.compress(uncompressed);
            var buf = new Uint8Array(compressed.length * 2); // 2 bytes per character
            for(var i = 0, TotalLen = compressed.length; i < TotalLen; i++){
                var current_value = compressed.charCodeAt(i);
                buf[i * 2] = current_value >>> 8;
                buf[i * 2 + 1] = current_value % 256;
            }
            return buf;
        },
        //decompress from uint8array (UCS-2 big endian format)
        decompressFromUint8Array: function(compressed) {
            if (compressed === null || compressed === undefined) {
                return LZString.decompress(compressed);
            } else {
                var buf = new Array(compressed.length / 2); // 2 bytes per character
                for(var i = 0, TotalLen = buf.length; i < TotalLen; i++){
                    buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
                }
                var result = [];
                buf.forEach(function(c) {
                    result.push(f(c));
                });
                return LZString.decompress(result.join(''));
            }
        },
        //compress into a string that is already URI encoded
        compressToEncodedURIComponent: function(input) {
            if (input == null) return "";
            return LZString._compress(input, 6, function(a) {
                return keyStrUriSafe.charAt(a);
            });
        },
        //decompress from an output of compressToEncodedURIComponent
        decompressFromEncodedURIComponent: function(input) {
            if (input == null) return "";
            if (input == "") return null;
            input = input.replace(/ /g, "+");
            return LZString._decompress(input.length, 32, function(index) {
                return getBaseValue(keyStrUriSafe, input.charAt(index));
            });
        },
        compress: function(uncompressed) {
            return LZString._compress(uncompressed, 16, function(a) {
                return f(a);
            });
        },
        _compress: function(uncompressed, bitsPerChar, getCharFromInt) {
            if (uncompressed == null) return "";
            var i, value, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = "", context_wc = "", context_w = "", context_enlargeIn = 2, context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0, ii;
            for(ii = 0; ii < uncompressed.length; ii += 1){
                context_c = uncompressed.charAt(ii);
                if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                    context_dictionary[context_c] = context_dictSize++;
                    context_dictionaryToCreate[context_c] = true;
                }
                context_wc = context_w + context_c;
                if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                    context_w = context_wc;
                } else {
                    if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                        if (context_w.charCodeAt(0) < 256) {
                            for(i = 0; i < context_numBits; i++){
                                context_data_val = context_data_val << 1;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                            }
                            value = context_w.charCodeAt(0);
                            for(i = 0; i < 8; i++){
                                context_data_val = context_data_val << 1 | value & 1;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        } else {
                            value = 1;
                            for(i = 0; i < context_numBits; i++){
                                context_data_val = context_data_val << 1 | value;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = 0;
                            }
                            value = context_w.charCodeAt(0);
                            for(i = 0; i < 16; i++){
                                context_data_val = context_data_val << 1 | value & 1;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        }
                        context_enlargeIn--;
                        if (context_enlargeIn == 0) {
                            context_enlargeIn = Math.pow(2, context_numBits);
                            context_numBits++;
                        }
                        delete context_dictionaryToCreate[context_w];
                    } else {
                        value = context_dictionary[context_w];
                        for(i = 0; i < context_numBits; i++){
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    // Add wc to the dictionary.
                    context_dictionary[context_wc] = context_dictSize++;
                    context_w = String(context_c);
                }
            }
            // Output the code for w.
            if (context_w !== "") {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for(i = 0; i < context_numBits; i++){
                            context_data_val = context_data_val << 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for(i = 0; i < 8; i++){
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    } else {
                        value = 1;
                        for(i = 0; i < context_numBits; i++){
                            context_data_val = context_data_val << 1 | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for(i = 0; i < 16; i++){
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    value = context_dictionary[context_w];
                    for(i = 0; i < context_numBits; i++){
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
            }
            // Mark the end of the stream
            value = 2;
            for(i = 0; i < context_numBits; i++){
                context_data_val = context_data_val << 1 | value & 1;
                if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                } else {
                    context_data_position++;
                }
                value = value >> 1;
            }
            // Flush the last char
            while(true){
                context_data_val = context_data_val << 1;
                if (context_data_position == bitsPerChar - 1) {
                    context_data.push(getCharFromInt(context_data_val));
                    break;
                } else context_data_position++;
            }
            return context_data.join('');
        },
        decompress: function(compressed) {
            if (compressed == null) return "";
            if (compressed == "") return null;
            return LZString._decompress(compressed.length, 32768, function(index) {
                return compressed.charCodeAt(index);
            });
        },
        _decompress: function(length, resetValue, getNextValue) {
            var dictionary = [], next, enlargeIn = 4, dictSize = 4, numBits = 3, entry = "", result = [], i, w, bits, resb, maxpower, power, c, data = {
                val: getNextValue(0),
                position: resetValue,
                index: 1
            };
            for(i = 0; i < 3; i += 1){
                dictionary[i] = i;
            }
            bits = 0;
            maxpower = Math.pow(2, 2);
            power = 1;
            while(power != maxpower){
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }
            switch(next = bits){
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while(power != maxpower){
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while(power != maxpower){
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 2:
                    return "";
            }
            dictionary[3] = c;
            w = c;
            result.push(c);
            while(true){
                if (data.index > length) {
                    return "";
                }
                bits = 0;
                maxpower = Math.pow(2, numBits);
                power = 1;
                while(power != maxpower){
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                switch(c = bits){
                    case 0:
                        bits = 0;
                        maxpower = Math.pow(2, 8);
                        power = 1;
                        while(power != maxpower){
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }
                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 1:
                        bits = 0;
                        maxpower = Math.pow(2, 16);
                        power = 1;
                        while(power != maxpower){
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }
                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 2:
                        return result.join('');
                }
                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }
                if (dictionary[c]) {
                    entry = dictionary[c];
                } else {
                    if (c === dictSize) {
                        entry = w + w.charAt(0);
                    } else {
                        return null;
                    }
                }
                result.push(entry);
                // Add w+entry[0] to the dictionary.
                dictionary[dictSize++] = w + entry.charAt(0);
                enlargeIn--;
                w = entry;
                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }
            }
        }
    };
    return LZString;
}();
if (typeof define === 'function' && define.amd) {
    define(function() {
        return LZString;
    });
} else if (typeof module !== 'undefined' && module != null) {
    module.exports = LZString;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvbHotc3RyaW5nLTEuNC40LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxMyBQaWVyb3h5IDxwaWVyb3h5QHBpZXJveHkubmV0PlxuLy8gVGhpcyB3b3JrIGlzIGZyZWUuIFlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXRcbi8vIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgV1RGUEwsIFZlcnNpb24gMlxuLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gc2VlIExJQ0VOU0UudHh0IG9yIGh0dHA6Ly93d3cud3RmcGwubmV0L1xuLy9cbi8vIEZvciBtb3JlIGluZm9ybWF0aW9uLCB0aGUgaG9tZSBwYWdlOlxuLy8gaHR0cDovL3BpZXJveHkubmV0L2Jsb2cvcGFnZXMvbHotc3RyaW5nL3Rlc3RpbmcuaHRtbFxuLy9cbi8vIExaLWJhc2VkIGNvbXByZXNzaW9uIGFsZ29yaXRobSwgdmVyc2lvbiAxLjQuNFxudmFyIExaU3RyaW5nID0gKGZ1bmN0aW9uKCkge1xuXG4vLyBwcml2YXRlIHByb3BlcnR5XG4gIHZhciBmID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbiAgdmFyIGtleVN0ckJhc2U2NCA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIjtcbiAgdmFyIGtleVN0clVyaVNhZmUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky0kXCI7XG4gIHZhciBiYXNlUmV2ZXJzZURpYyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGdldEJhc2VWYWx1ZShhbHBoYWJldCwgY2hhcmFjdGVyKSB7XG4gICAgaWYgKCFiYXNlUmV2ZXJzZURpY1thbHBoYWJldF0pIHtcbiAgICAgIGJhc2VSZXZlcnNlRGljW2FscGhhYmV0XSA9IHt9O1xuICAgICAgZm9yICh2YXIgaT0wIDsgaTxhbHBoYWJldC5sZW5ndGggOyBpKyspIHtcbiAgICAgICAgYmFzZVJldmVyc2VEaWNbYWxwaGFiZXRdW2FscGhhYmV0LmNoYXJBdChpKV0gPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmFzZVJldmVyc2VEaWNbYWxwaGFiZXRdW2NoYXJhY3Rlcl07XG4gIH1cblxuICB2YXIgTFpTdHJpbmcgPSB7XG4gICAgY29tcHJlc3NUb0Jhc2U2NCA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgICAgdmFyIHJlcyA9IExaU3RyaW5nLl9jb21wcmVzcyhpbnB1dCwgNiwgZnVuY3Rpb24oYSl7cmV0dXJuIGtleVN0ckJhc2U2NC5jaGFyQXQoYSk7fSk7XG4gICAgICBzd2l0Y2ggKHJlcy5sZW5ndGggJSA0KSB7IC8vIFRvIHByb2R1Y2UgdmFsaWQgQmFzZTY0XG4gICAgICAgIGRlZmF1bHQ6IC8vIFdoZW4gY291bGQgdGhpcyBoYXBwZW4gP1xuICAgICAgICBjYXNlIDAgOiByZXR1cm4gcmVzO1xuICAgICAgICBjYXNlIDEgOiByZXR1cm4gcmVzK1wiPT09XCI7XG4gICAgICAgIGNhc2UgMiA6IHJldHVybiByZXMrXCI9PVwiO1xuICAgICAgICBjYXNlIDMgOiByZXR1cm4gcmVzK1wiPVwiO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWNvbXByZXNzRnJvbUJhc2U2NCA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgICAgaWYgKGlucHV0ID09IFwiXCIpIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIExaU3RyaW5nLl9kZWNvbXByZXNzKGlucHV0Lmxlbmd0aCwgMzIsIGZ1bmN0aW9uKGluZGV4KSB7IHJldHVybiBnZXRCYXNlVmFsdWUoa2V5U3RyQmFzZTY0LCBpbnB1dC5jaGFyQXQoaW5kZXgpKTsgfSk7XG4gICAgfSxcblxuICAgIGNvbXByZXNzVG9VVEYxNiA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgICAgcmV0dXJuIExaU3RyaW5nLl9jb21wcmVzcyhpbnB1dCwgMTUsIGZ1bmN0aW9uKGEpe3JldHVybiBmKGErMzIpO30pICsgXCIgXCI7XG4gICAgfSxcblxuICAgIGRlY29tcHJlc3NGcm9tVVRGMTY6IGZ1bmN0aW9uIChjb21wcmVzc2VkKSB7XG4gICAgICBpZiAoY29tcHJlc3NlZCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICAgIGlmIChjb21wcmVzc2VkID09IFwiXCIpIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIExaU3RyaW5nLl9kZWNvbXByZXNzKGNvbXByZXNzZWQubGVuZ3RoLCAxNjM4NCwgZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGNvbXByZXNzZWQuY2hhckNvZGVBdChpbmRleCkgLSAzMjsgfSk7XG4gICAgfSxcblxuICAgIC8vY29tcHJlc3MgaW50byB1aW50OGFycmF5IChVQ1MtMiBiaWcgZW5kaWFuIGZvcm1hdClcbiAgICBjb21wcmVzc1RvVWludDhBcnJheTogZnVuY3Rpb24gKHVuY29tcHJlc3NlZCkge1xuICAgICAgdmFyIGNvbXByZXNzZWQgPSBMWlN0cmluZy5jb21wcmVzcyh1bmNvbXByZXNzZWQpO1xuICAgICAgdmFyIGJ1Zj1uZXcgVWludDhBcnJheShjb21wcmVzc2VkLmxlbmd0aCoyKTsgLy8gMiBieXRlcyBwZXIgY2hhcmFjdGVyXG5cbiAgICAgIGZvciAodmFyIGk9MCwgVG90YWxMZW49Y29tcHJlc3NlZC5sZW5ndGg7IGk8VG90YWxMZW47IGkrKykge1xuICAgICAgICB2YXIgY3VycmVudF92YWx1ZSA9IGNvbXByZXNzZWQuY2hhckNvZGVBdChpKTtcbiAgICAgICAgYnVmW2kqMl0gPSBjdXJyZW50X3ZhbHVlID4+PiA4O1xuICAgICAgICBidWZbaSoyKzFdID0gY3VycmVudF92YWx1ZSAlIDI1NjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBidWY7XG4gICAgfSxcblxuICAgIC8vZGVjb21wcmVzcyBmcm9tIHVpbnQ4YXJyYXkgKFVDUy0yIGJpZyBlbmRpYW4gZm9ybWF0KVxuICAgIGRlY29tcHJlc3NGcm9tVWludDhBcnJheTpmdW5jdGlvbiAoY29tcHJlc3NlZCkge1xuICAgICAgaWYgKGNvbXByZXNzZWQ9PT1udWxsIHx8IGNvbXByZXNzZWQ9PT11bmRlZmluZWQpe1xuICAgICAgICByZXR1cm4gTFpTdHJpbmcuZGVjb21wcmVzcyhjb21wcmVzc2VkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBidWY9bmV3IEFycmF5KGNvbXByZXNzZWQubGVuZ3RoLzIpOyAvLyAyIGJ5dGVzIHBlciBjaGFyYWN0ZXJcbiAgICAgICAgZm9yICh2YXIgaT0wLCBUb3RhbExlbj1idWYubGVuZ3RoOyBpPFRvdGFsTGVuOyBpKyspIHtcbiAgICAgICAgICBidWZbaV09Y29tcHJlc3NlZFtpKjJdKjI1Nitjb21wcmVzc2VkW2kqMisxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgYnVmLmZvckVhY2goZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICByZXN1bHQucHVzaChmKGMpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBMWlN0cmluZy5kZWNvbXByZXNzKHJlc3VsdC5qb2luKCcnKSk7XG5cbiAgICAgIH1cblxuICAgIH0sXG5cblxuICAgIC8vY29tcHJlc3MgaW50byBhIHN0cmluZyB0aGF0IGlzIGFscmVhZHkgVVJJIGVuY29kZWRcbiAgICBjb21wcmVzc1RvRW5jb2RlZFVSSUNvbXBvbmVudDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICBpZiAoaW5wdXQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgICByZXR1cm4gTFpTdHJpbmcuX2NvbXByZXNzKGlucHV0LCA2LCBmdW5jdGlvbihhKXtyZXR1cm4ga2V5U3RyVXJpU2FmZS5jaGFyQXQoYSk7fSk7XG4gICAgfSxcblxuICAgIC8vZGVjb21wcmVzcyBmcm9tIGFuIG91dHB1dCBvZiBjb21wcmVzc1RvRW5jb2RlZFVSSUNvbXBvbmVudFxuICAgIGRlY29tcHJlc3NGcm9tRW5jb2RlZFVSSUNvbXBvbmVudDpmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gXCJcIjtcbiAgICAgIGlmIChpbnB1dCA9PSBcIlwiKSByZXR1cm4gbnVsbDtcbiAgICAgIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvIC9nLCBcIitcIik7XG4gICAgICByZXR1cm4gTFpTdHJpbmcuX2RlY29tcHJlc3MoaW5wdXQubGVuZ3RoLCAzMiwgZnVuY3Rpb24oaW5kZXgpIHsgcmV0dXJuIGdldEJhc2VWYWx1ZShrZXlTdHJVcmlTYWZlLCBpbnB1dC5jaGFyQXQoaW5kZXgpKTsgfSk7XG4gICAgfSxcblxuICAgIGNvbXByZXNzOiBmdW5jdGlvbiAodW5jb21wcmVzc2VkKSB7XG4gICAgICByZXR1cm4gTFpTdHJpbmcuX2NvbXByZXNzKHVuY29tcHJlc3NlZCwgMTYsIGZ1bmN0aW9uKGEpe3JldHVybiBmKGEpO30pO1xuICAgIH0sXG4gICAgX2NvbXByZXNzOiBmdW5jdGlvbiAodW5jb21wcmVzc2VkLCBiaXRzUGVyQ2hhciwgZ2V0Q2hhckZyb21JbnQpIHtcbiAgICAgIGlmICh1bmNvbXByZXNzZWQgPT0gbnVsbCkgcmV0dXJuIFwiXCI7XG4gICAgICB2YXIgaSwgdmFsdWUsXG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeT0ge30sXG4gICAgICAgIGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlPSB7fSxcbiAgICAgICAgY29udGV4dF9jPVwiXCIsXG4gICAgICAgIGNvbnRleHRfd2M9XCJcIixcbiAgICAgICAgY29udGV4dF93PVwiXCIsXG4gICAgICAgIGNvbnRleHRfZW5sYXJnZUluPSAyLCAvLyBDb21wZW5zYXRlIGZvciB0aGUgZmlyc3QgZW50cnkgd2hpY2ggc2hvdWxkIG5vdCBjb3VudFxuICAgICAgICBjb250ZXh0X2RpY3RTaXplPSAzLFxuICAgICAgICBjb250ZXh0X251bUJpdHM9IDIsXG4gICAgICAgIGNvbnRleHRfZGF0YT1bXSxcbiAgICAgICAgY29udGV4dF9kYXRhX3ZhbD0wLFxuICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb249MCxcbiAgICAgICAgaWk7XG5cbiAgICAgIGZvciAoaWkgPSAwOyBpaSA8IHVuY29tcHJlc3NlZC5sZW5ndGg7IGlpICs9IDEpIHtcbiAgICAgICAgY29udGV4dF9jID0gdW5jb21wcmVzc2VkLmNoYXJBdChpaSk7XG4gICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeSxjb250ZXh0X2MpKSB7XG4gICAgICAgICAgY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfY10gPSBjb250ZXh0X2RpY3RTaXplKys7XG4gICAgICAgICAgY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGVbY29udGV4dF9jXSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0X3djID0gY29udGV4dF93ICsgY29udGV4dF9jO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeSxjb250ZXh0X3djKSkge1xuICAgICAgICAgIGNvbnRleHRfdyA9IGNvbnRleHRfd2M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZSxjb250ZXh0X3cpKSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dF93LmNoYXJDb2RlQXQoMCk8MjU2KSB7XG4gICAgICAgICAgICAgIGZvciAoaT0wIDsgaTxjb250ZXh0X251bUJpdHMgOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgICBmb3IgKGk9MCA7IGk8OCA7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dF9kYXRhX3Bvc2l0aW9uID09IGJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSAxO1xuICAgICAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgdmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PWJpdHNQZXJDaGFyLTEpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbHVlID0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YWx1ZSA9IGNvbnRleHRfdy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgICBmb3IgKGk9MCA7IGk8MTYgOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID4+IDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRleHRfZW5sYXJnZUluLS07XG4gICAgICAgICAgICBpZiAoY29udGV4dF9lbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICAgICAgICBjb250ZXh0X2VubGFyZ2VJbiA9IE1hdGgucG93KDIsIGNvbnRleHRfbnVtQml0cyk7XG4gICAgICAgICAgICAgIGNvbnRleHRfbnVtQml0cysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlW2NvbnRleHRfd107XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfd107XG4gICAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgICAgICBpZiAoY29udGV4dF9lbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEFkZCB3YyB0byB0aGUgZGljdGlvbmFyeS5cbiAgICAgICAgICBjb250ZXh0X2RpY3Rpb25hcnlbY29udGV4dF93Y10gPSBjb250ZXh0X2RpY3RTaXplKys7XG4gICAgICAgICAgY29udGV4dF93ID0gU3RyaW5nKGNvbnRleHRfYyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gT3V0cHV0IHRoZSBjb2RlIGZvciB3LlxuICAgICAgaWYgKGNvbnRleHRfdyAhPT0gXCJcIikge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHRfZGljdGlvbmFyeVRvQ3JlYXRlLGNvbnRleHRfdykpIHtcbiAgICAgICAgICBpZiAoY29udGV4dF93LmNoYXJDb2RlQXQoMCk8MjU2KSB7XG4gICAgICAgICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gY29udGV4dF93LmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICBmb3IgKGk9MCA7IGk8OCA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSAxO1xuICAgICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCB2YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFsdWUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSBjb250ZXh0X3cuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgIGZvciAoaT0wIDsgaTwxNiA7IGkrKykge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSkgfCAodmFsdWUmMSk7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgY29udGV4dF9kYXRhLnB1c2goZ2V0Q2hhckZyb21JbnQoY29udGV4dF9kYXRhX3ZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4tLTtcbiAgICAgICAgICBpZiAoY29udGV4dF9lbmxhcmdlSW4gPT0gMCkge1xuICAgICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICAgICAgY29udGV4dF9udW1CaXRzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSBjb250ZXh0X2RpY3Rpb25hcnlUb0NyZWF0ZVtjb250ZXh0X3ddO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gY29udGV4dF9kaWN0aW9uYXJ5W2NvbnRleHRfd107XG4gICAgICAgICAgZm9yIChpPTAgOyBpPGNvbnRleHRfbnVtQml0cyA7IGkrKykge1xuICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IChjb250ZXh0X2RhdGFfdmFsIDw8IDEpIHwgKHZhbHVlJjEpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250ZXh0X2RhdGFfcG9zaXRpb24rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPj4gMTtcbiAgICAgICAgICB9XG5cblxuICAgICAgICB9XG4gICAgICAgIGNvbnRleHRfZW5sYXJnZUluLS07XG4gICAgICAgIGlmIChjb250ZXh0X2VubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgICAgY29udGV4dF9lbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBjb250ZXh0X251bUJpdHMpO1xuICAgICAgICAgIGNvbnRleHRfbnVtQml0cysrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE1hcmsgdGhlIGVuZCBvZiB0aGUgc3RyZWFtXG4gICAgICB2YWx1ZSA9IDI7XG4gICAgICBmb3IgKGk9MCA7IGk8Y29udGV4dF9udW1CaXRzIDsgaSsrKSB7XG4gICAgICAgIGNvbnRleHRfZGF0YV92YWwgPSAoY29udGV4dF9kYXRhX3ZhbCA8PCAxKSB8ICh2YWx1ZSYxKTtcbiAgICAgICAgaWYgKGNvbnRleHRfZGF0YV9wb3NpdGlvbiA9PSBiaXRzUGVyQ2hhci0xKSB7XG4gICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICBjb250ZXh0X2RhdGEucHVzaChnZXRDaGFyRnJvbUludChjb250ZXh0X2RhdGFfdmFsKSk7XG4gICAgICAgICAgY29udGV4dF9kYXRhX3ZhbCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29udGV4dF9kYXRhX3Bvc2l0aW9uKys7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA+PiAxO1xuICAgICAgfVxuXG4gICAgICAvLyBGbHVzaCB0aGUgbGFzdCBjaGFyXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb250ZXh0X2RhdGFfdmFsID0gKGNvbnRleHRfZGF0YV92YWwgPDwgMSk7XG4gICAgICAgIGlmIChjb250ZXh0X2RhdGFfcG9zaXRpb24gPT0gYml0c1BlckNoYXItMSkge1xuICAgICAgICAgIGNvbnRleHRfZGF0YS5wdXNoKGdldENoYXJGcm9tSW50KGNvbnRleHRfZGF0YV92YWwpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGNvbnRleHRfZGF0YV9wb3NpdGlvbisrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRleHRfZGF0YS5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgZGVjb21wcmVzczogZnVuY3Rpb24gKGNvbXByZXNzZWQpIHtcbiAgICAgIGlmIChjb21wcmVzc2VkID09IG51bGwpIHJldHVybiBcIlwiO1xuICAgICAgaWYgKGNvbXByZXNzZWQgPT0gXCJcIikgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gTFpTdHJpbmcuX2RlY29tcHJlc3MoY29tcHJlc3NlZC5sZW5ndGgsIDMyNzY4LCBmdW5jdGlvbihpbmRleCkgeyByZXR1cm4gY29tcHJlc3NlZC5jaGFyQ29kZUF0KGluZGV4KTsgfSk7XG4gICAgfSxcblxuICAgIF9kZWNvbXByZXNzOiBmdW5jdGlvbiAobGVuZ3RoLCByZXNldFZhbHVlLCBnZXROZXh0VmFsdWUpIHtcbiAgICAgIHZhciBkaWN0aW9uYXJ5ID0gW10sXG4gICAgICAgIG5leHQsXG4gICAgICAgIGVubGFyZ2VJbiA9IDQsXG4gICAgICAgIGRpY3RTaXplID0gNCxcbiAgICAgICAgbnVtQml0cyA9IDMsXG4gICAgICAgIGVudHJ5ID0gXCJcIixcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIGksXG4gICAgICAgIHcsXG4gICAgICAgIGJpdHMsIHJlc2IsIG1heHBvd2VyLCBwb3dlcixcbiAgICAgICAgYyxcbiAgICAgICAgZGF0YSA9IHt2YWw6Z2V0TmV4dFZhbHVlKDApLCBwb3NpdGlvbjpyZXNldFZhbHVlLCBpbmRleDoxfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IDM7IGkgKz0gMSkge1xuICAgICAgICBkaWN0aW9uYXJ5W2ldID0gaTtcbiAgICAgIH1cblxuICAgICAgYml0cyA9IDA7XG4gICAgICBtYXhwb3dlciA9IE1hdGgucG93KDIsMik7XG4gICAgICBwb3dlcj0xO1xuICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgfVxuICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAobmV4dCA9IGJpdHMpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIGJpdHMgPSAwO1xuICAgICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiw4KTtcbiAgICAgICAgICBwb3dlcj0xO1xuICAgICAgICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGMgPSBmKGJpdHMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgYml0cyA9IDA7XG4gICAgICAgICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDE2KTtcbiAgICAgICAgICBwb3dlcj0xO1xuICAgICAgICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGMgPSBmKGJpdHMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICB9XG4gICAgICBkaWN0aW9uYXJ5WzNdID0gYztcbiAgICAgIHcgPSBjO1xuICAgICAgcmVzdWx0LnB1c2goYyk7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBpZiAoZGF0YS5pbmRleCA+IGxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgYml0cyA9IDA7XG4gICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMixudW1CaXRzKTtcbiAgICAgICAgcG93ZXI9MTtcbiAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgIHJlc2IgPSBkYXRhLnZhbCAmIGRhdGEucG9zaXRpb247XG4gICAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcmVzZXRWYWx1ZTtcbiAgICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJpdHMgfD0gKHJlc2I+MCA/IDEgOiAwKSAqIHBvd2VyO1xuICAgICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChjID0gYml0cykge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGJpdHMgPSAwO1xuICAgICAgICAgICAgbWF4cG93ZXIgPSBNYXRoLnBvdygyLDgpO1xuICAgICAgICAgICAgcG93ZXI9MTtcbiAgICAgICAgICAgIHdoaWxlIChwb3dlciE9bWF4cG93ZXIpIHtcbiAgICAgICAgICAgICAgcmVzYiA9IGRhdGEudmFsICYgZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA+Pj0gMTtcbiAgICAgICAgICAgICAgaWYgKGRhdGEucG9zaXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICAgIGRhdGEucG9zaXRpb24gPSByZXNldFZhbHVlO1xuICAgICAgICAgICAgICAgIGRhdGEudmFsID0gZ2V0TmV4dFZhbHVlKGRhdGEuaW5kZXgrKyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYml0cyB8PSAocmVzYj4wID8gMSA6IDApICogcG93ZXI7XG4gICAgICAgICAgICAgIHBvd2VyIDw8PSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkaWN0aW9uYXJ5W2RpY3RTaXplKytdID0gZihiaXRzKTtcbiAgICAgICAgICAgIGMgPSBkaWN0U2l6ZS0xO1xuICAgICAgICAgICAgZW5sYXJnZUluLS07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBiaXRzID0gMDtcbiAgICAgICAgICAgIG1heHBvd2VyID0gTWF0aC5wb3coMiwxNik7XG4gICAgICAgICAgICBwb3dlcj0xO1xuICAgICAgICAgICAgd2hpbGUgKHBvd2VyIT1tYXhwb3dlcikge1xuICAgICAgICAgICAgICByZXNiID0gZGF0YS52YWwgJiBkYXRhLnBvc2l0aW9uO1xuICAgICAgICAgICAgICBkYXRhLnBvc2l0aW9uID4+PSAxO1xuICAgICAgICAgICAgICBpZiAoZGF0YS5wb3NpdGlvbiA9PSAwKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5wb3NpdGlvbiA9IHJlc2V0VmFsdWU7XG4gICAgICAgICAgICAgICAgZGF0YS52YWwgPSBnZXROZXh0VmFsdWUoZGF0YS5pbmRleCsrKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBiaXRzIHw9IChyZXNiPjAgPyAxIDogMCkgKiBwb3dlcjtcbiAgICAgICAgICAgICAgcG93ZXIgPDw9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaWN0aW9uYXJ5W2RpY3RTaXplKytdID0gZihiaXRzKTtcbiAgICAgICAgICAgIGMgPSBkaWN0U2l6ZS0xO1xuICAgICAgICAgICAgZW5sYXJnZUluLS07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmpvaW4oJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVubGFyZ2VJbiA9PSAwKSB7XG4gICAgICAgICAgZW5sYXJnZUluID0gTWF0aC5wb3coMiwgbnVtQml0cyk7XG4gICAgICAgICAgbnVtQml0cysrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpY3Rpb25hcnlbY10pIHtcbiAgICAgICAgICBlbnRyeSA9IGRpY3Rpb25hcnlbY107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGMgPT09IGRpY3RTaXplKSB7XG4gICAgICAgICAgICBlbnRyeSA9IHcgKyB3LmNoYXJBdCgwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKGVudHJ5KTtcblxuICAgICAgICAvLyBBZGQgdytlbnRyeVswXSB0byB0aGUgZGljdGlvbmFyeS5cbiAgICAgICAgZGljdGlvbmFyeVtkaWN0U2l6ZSsrXSA9IHcgKyBlbnRyeS5jaGFyQXQoMCk7XG4gICAgICAgIGVubGFyZ2VJbi0tO1xuXG4gICAgICAgIHcgPSBlbnRyeTtcblxuICAgICAgICBpZiAoZW5sYXJnZUluID09IDApIHtcbiAgICAgICAgICBlbmxhcmdlSW4gPSBNYXRoLnBvdygyLCBudW1CaXRzKTtcbiAgICAgICAgICBudW1CaXRzKys7XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIExaU3RyaW5nO1xufSkoKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24gKCkgeyByZXR1cm4gTFpTdHJpbmc7IH0pO1xufSBlbHNlIGlmKCB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUgIT0gbnVsbCApIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBMWlN0cmluZ1xufSJdLCJuYW1lcyI6WyJMWlN0cmluZyIsImYiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJrZXlTdHJCYXNlNjQiLCJrZXlTdHJVcmlTYWZlIiwiYmFzZVJldmVyc2VEaWMiLCJnZXRCYXNlVmFsdWUiLCJhbHBoYWJldCIsImNoYXJhY3RlciIsImkiLCJsZW5ndGgiLCJjaGFyQXQiLCJjb21wcmVzc1RvQmFzZTY0IiwiaW5wdXQiLCJyZXMiLCJfY29tcHJlc3MiLCJhIiwiZGVjb21wcmVzc0Zyb21CYXNlNjQiLCJfZGVjb21wcmVzcyIsImluZGV4IiwiY29tcHJlc3NUb1VURjE2IiwiZGVjb21wcmVzc0Zyb21VVEYxNiIsImNvbXByZXNzZWQiLCJjaGFyQ29kZUF0IiwiY29tcHJlc3NUb1VpbnQ4QXJyYXkiLCJ1bmNvbXByZXNzZWQiLCJjb21wcmVzcyIsImJ1ZiIsIlVpbnQ4QXJyYXkiLCJUb3RhbExlbiIsImN1cnJlbnRfdmFsdWUiLCJkZWNvbXByZXNzRnJvbVVpbnQ4QXJyYXkiLCJ1bmRlZmluZWQiLCJkZWNvbXByZXNzIiwiQXJyYXkiLCJyZXN1bHQiLCJmb3JFYWNoIiwiYyIsInB1c2giLCJqb2luIiwiY29tcHJlc3NUb0VuY29kZWRVUklDb21wb25lbnQiLCJkZWNvbXByZXNzRnJvbUVuY29kZWRVUklDb21wb25lbnQiLCJyZXBsYWNlIiwiYml0c1BlckNoYXIiLCJnZXRDaGFyRnJvbUludCIsInZhbHVlIiwiY29udGV4dF9kaWN0aW9uYXJ5IiwiY29udGV4dF9kaWN0aW9uYXJ5VG9DcmVhdGUiLCJjb250ZXh0X2MiLCJjb250ZXh0X3djIiwiY29udGV4dF93IiwiY29udGV4dF9lbmxhcmdlSW4iLCJjb250ZXh0X2RpY3RTaXplIiwiY29udGV4dF9udW1CaXRzIiwiY29udGV4dF9kYXRhIiwiY29udGV4dF9kYXRhX3ZhbCIsImNvbnRleHRfZGF0YV9wb3NpdGlvbiIsImlpIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiTWF0aCIsInBvdyIsInJlc2V0VmFsdWUiLCJnZXROZXh0VmFsdWUiLCJkaWN0aW9uYXJ5IiwibmV4dCIsImVubGFyZ2VJbiIsImRpY3RTaXplIiwibnVtQml0cyIsImVudHJ5IiwidyIsImJpdHMiLCJyZXNiIiwibWF4cG93ZXIiLCJwb3dlciIsImRhdGEiLCJ2YWwiLCJwb3NpdGlvbiIsImRlZmluZSIsImFtZCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLG1EQUFtRDtBQUNuRCw4REFBOEQ7QUFDOUQsMENBQTBDO0FBQzFDLGdFQUFnRTtBQUNoRSxFQUFFO0FBQ0YsdUNBQXVDO0FBQ3ZDLHVEQUF1RDtBQUN2RCxFQUFFO0FBQ0YsZ0RBQWdEO0FBQ2hELElBQUlBLFdBQVcsQUFBQztJQUVoQixtQkFBbUI7SUFDakIsSUFBSUMsSUFBSUMsT0FBT0MsWUFBWTtJQUMzQixJQUFJQyxlQUFlO0lBQ25CLElBQUlDLGdCQUFnQjtJQUNwQixJQUFJQyxpQkFBaUIsQ0FBQztJQUV0QixTQUFTQyxhQUFhQyxRQUFRLEVBQUVDLFNBQVM7UUFDdkMsSUFBSSxDQUFDSCxjQUFjLENBQUNFLFNBQVMsRUFBRTtZQUM3QkYsY0FBYyxDQUFDRSxTQUFTLEdBQUcsQ0FBQztZQUM1QixJQUFLLElBQUlFLElBQUUsR0FBSUEsSUFBRUYsU0FBU0csTUFBTSxFQUFHRCxJQUFLO2dCQUN0Q0osY0FBYyxDQUFDRSxTQUFTLENBQUNBLFNBQVNJLE1BQU0sQ0FBQ0YsR0FBRyxHQUFHQTtZQUNqRDtRQUNGO1FBQ0EsT0FBT0osY0FBYyxDQUFDRSxTQUFTLENBQUNDLFVBQVU7SUFDNUM7SUFFQSxJQUFJVCxX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