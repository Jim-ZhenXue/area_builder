// Copyright 2023-2024, University of Colorado Boulder
// eslint-disable-next-line phet/bad-typescript-text
// @ts-nocheck
/**
 * Handles encoding and decoding of strings to/from a compact format, to lower the file size and download size of
 * simulations.
 *
 * The encoding is stateful, and takes the approximate form of:
 *
 * for each locale:
 *   ( ADD_LOCALE locale )+
 * for each string key:
 *   ( PUSH_TOKEN token )*
 *   START_STRING
 *   for each locale (en, or has a non-en translation):
 *     (SWITCH_LOCALE locale)?
 *     (ADD_STRING string | ADD_STRING_COPY_LAST)
 *   END_STRING
 *   ( POP_TOKEN token )*
 *
 * We add some combinations of "pop + push", and forms that automatically add on the slash/dot/LTR/RTL substrings.
 *
 * String keys are constructed from stack.join( '' ), we'll push/pop substrings of the string key as we go.
 *
 * If a translation is the same as the English translation, it will be omitted (and the END_STRING without having set
 * a translation will indicate it should be filled with this value). If multiple translations share a non-English value,
 * we can note the value is the same as the last-given string.
 *
 * We also record the last-used locale, so that if we only have one translation, we can omit the SWITCH_LOCALE.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import _ from 'lodash';
import toLessEscapedString from './toLessEscapedString.js';
const PUSH_TOKEN = '\u0001'; // push string on the stack
const PUSH_TOKEN_SLASH = '\u0002'; // push `${string}/` on the stack
const PUSH_TOKEN_DOT = '\u0003'; // push `${string}.` on the stack
const POP = '\u0004'; // pop from the stack
const POP_PUSH_TOKEN = '\u0005'; // pop from the stack, then push string on the stack
const POP_PUSH_TOKEN_SLASH = '\u0006'; // pop from the stack, then push `${string}/` on the stack
const POP_PUSH_TOKEN_DOT = '\u0007'; // pop from the stack, then push `${string}.` on the stack
const SWITCH_LOCALE = '\u0008'; // switch to the given locale
const START_STRING = '\u0009'; // start a string
const END_STRING = '\u000A'; // end a string (and fill in missing translations)
const ADD_STRING = '\u000B'; // add a translation string to the current locale and stringKey
const ADD_STRING_LTR_POP = '\u000C'; // add `${LTR}${string}${POP}` to the current locale and stringKey
const ADD_STRING_RTL_POP = '\u000D'; // add `${RTL}${string}${POP}` to the current locale and stringKey
const ADD_STRING_COPY_LAST = '\u000E'; // add the last-used translation to the current locale and stringKey
const ADD_LOCALE = '\u000F'; // add a locale (at the start)
const ESCAPE_CHARACTER = '\u0010'; // we'll need to escape any of these characters if they appear in a string
const MAX_CONTROL_CHARACTER_CODE_POINT = 0x10;
const ESCAPE_CHARACTER_CODE_POINT = 0x10;
const CONTROL_CHARACTERS = [
    PUSH_TOKEN,
    PUSH_TOKEN_SLASH,
    PUSH_TOKEN_DOT,
    POP,
    POP_PUSH_TOKEN,
    POP_PUSH_TOKEN_SLASH,
    POP_PUSH_TOKEN_DOT,
    SWITCH_LOCALE,
    START_STRING,
    END_STRING,
    ADD_STRING,
    ADD_STRING_LTR_POP,
    ADD_STRING_RTL_POP,
    ADD_STRING_COPY_LAST,
    ADD_LOCALE,
    ESCAPE_CHARACTER
];
// Our LTR/RTL embedding characters
const CHAR_LTR = '\u202A';
const CHAR_RTL = '\u202B';
const CHAR_POP = '\u202C';
// Converts a map[ locale ][ stringKey ] => string (with a compact encoding)
const encodeStringMap = (stringMap)=>{
    const locales = Object.keys(stringMap).filter((locale)=>!!stringMap[locale]).sort();
    // Get all string keys
    const stringKeysSet = new Set();
    locales.forEach((locale)=>{
        Object.keys(stringMap[locale]).forEach((stringKey)=>{
            stringKeysSet.add(stringKey);
        });
    });
    // For our stack encoding, we'll want them sorted so we can push/pop deltas between each one
    const stringKeys = [
        ...stringKeysSet
    ].sort();
    const stack = [];
    let currentLocale = null;
    let currentStringValue = null;
    let output = '';
    // Returns the index of the first character that differs between a and b
    const getMatchIndex = (a, b)=>{
        let i = 0;
        while(i < Math.min(a.length, b.length) && a[i] === b[i]){
            i++;
        }
        return i;
    };
    // Encodes a string, escaping any control characters
    const encode = (string)=>{
        let result = '';
        string.split(/(?:)/u).forEach((char)=>{
            if (CONTROL_CHARACTERS.includes(char)) {
                result += ESCAPE_CHARACTER + char;
            } else {
                result += char;
            }
        });
        return result;
    };
    // Adds a locale to the output
    const addLocale = (locale)=>{
        output += ADD_LOCALE + encode(locale);
    };
    // Pushes a token onto the stack (combining with the previous token if possible)
    const push = (token)=>{
        stack.push(token);
        const hasPop = output.length > 0 && output.endsWith(POP);
        if (hasPop) {
            output = output.slice(0, -1);
        }
        let code;
        if (token.endsWith('/')) {
            token = token.slice(0, -1);
            code = hasPop ? POP_PUSH_TOKEN_SLASH : PUSH_TOKEN_SLASH;
        } else if (token.endsWith('.')) {
            token = token.slice(0, -1);
            code = hasPop ? POP_PUSH_TOKEN_DOT : PUSH_TOKEN_DOT;
        } else {
            code = hasPop ? POP_PUSH_TOKEN : PUSH_TOKEN;
        }
        output += code + encode(token);
    };
    // Pops a token from the stack
    const pop = ()=>{
        stack.pop();
        output += POP;
    };
    const startString = ()=>{
        output += START_STRING;
    };
    const endString = ()=>{
        output += END_STRING;
    };
    const switchLocale = (locale)=>{
        currentLocale = locale;
        output += SWITCH_LOCALE + encode(locale);
    };
    const addStringCopyLast = ()=>{
        output += ADD_STRING_COPY_LAST;
    };
    // Adds a string to the output, encoding LTR/RTL wrapped forms in a more compact way
    const addString = (string)=>{
        currentStringValue = string;
        let code;
        if (string.startsWith(CHAR_LTR) && string.endsWith(CHAR_POP)) {
            code = ADD_STRING_LTR_POP;
            string = string.slice(1, -1);
        } else if (string.startsWith(CHAR_RTL) && string.endsWith(CHAR_POP)) {
            code = ADD_STRING_RTL_POP;
            string = string.slice(1, -1);
        } else {
            code = ADD_STRING;
        }
        output += code + encode(string);
    };
    ////////////////////////////////////////////////////////////
    // Start of encoding
    ////////////////////////////////////////////////////////////
    locales.forEach((locale)=>{
        addLocale(locale);
    });
    for(let i = 0; i < stringKeys.length; i++){
        const stringKey = stringKeys[i];
        // Encode the string key
        {
            while(!stringKey.startsWith(stack.join(''))){
                pop();
            }
            // We will whittle down the remainder of the string key as we go. We start here from the delta from the last key
            let remainder = stringKey.slice(stack.join('').length);
            // Separate out the requirejsNamespace, if it exists
            if (remainder.includes('/')) {
                const bits = remainder.split('/');
                const token = bits[0] + '/';
                push(token);
                remainder = remainder.slice(token.length);
            }
            // Separate out dot-separated tokens to push independently.
            while(remainder.includes('.')){
                const bits = remainder.split('.');
                const token = bits[0] + '.';
                push(token);
                remainder = remainder.slice(token.length);
            }
            // See if we share a non-trivial prefix with the next string key, and if so, push it
            if (i + 1 < stringKeys.length) {
                const nextStringKey = stringKeys[i + 1];
                const matchIndex = getMatchIndex(remainder, nextStringKey.slice(stack.join('').length));
                if (matchIndex > 1) {
                    const token = remainder.slice(0, matchIndex);
                    push(token);
                    remainder = remainder.slice(token.length);
                }
            }
            // The rest!
            if (remainder.length) {
                push(remainder);
            }
        }
        // Encode the string
        {
            const defaultValue = stringMap.en[stringKey];
            // Find ONLY the locales that we'll include
            const stringLocales = locales.filter((locale)=>{
                if (locale === 'en') {
                    return true;
                }
                const string = stringMap[locale][stringKey];
                return string !== undefined && string !== defaultValue;
            });
            const stringValues = stringLocales.map((locale)=>stringMap[locale][stringKey]);
            // We'll order things by the string values, so we can "copy" when they are the same
            const indices = _.sortBy(_.range(0, stringLocales.length), (i)=>stringValues[i]);
            startString();
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            indices.forEach((i)=>{
                const locale = stringLocales[i];
                const string = stringValues[i];
                if (locale !== currentLocale) {
                    switchLocale(locale);
                }
                if (string === currentStringValue) {
                    addStringCopyLast();
                } else {
                    addString(string);
                }
            });
            endString();
        }
    }
    // Double-check our output results in the correct structure
    const testStringMap = decodeStringMap(output);
    for(const locale in stringMap){
        for(const stringKey in stringMap[locale]){
            if (stringMap[locale][stringKey] !== testStringMap[locale][stringKey]) {
                throw new Error(`String map encoding failed, mismatch at ${locale} ${stringKey}`);
            }
        }
    }
    return output;
};
// Converts a compact encoding to map[ locale ][ stringKey ]: string
const decodeStringMap = (encodedString)=>{
    const stringMap = {}; // map[ locale ][ stringKey ] => string
    const locales = [];
    const stack = []; // string[], stack.join( '' ) will be the current stringKey
    let currentLocale = null;
    let currentStringValue = null; // the last string value we've seen, for ADD_STRING_COPY_LAST
    let enStringValue = null; // the English string value, for omitted translations
    const localeSet = new Set(); // so we can track the omitted translations
    let stringKey = null;
    const addLocale = (locale)=>{
        stringMap[locale] = {};
        locales.push(locale);
    };
    const push = (token)=>{
        stack.push(token);
    };
    const pop = ()=>{
        stack.pop();
    };
    const switchLocale = (locale)=>{
        currentLocale = locale;
    };
    const addString = (string)=>{
        currentStringValue = string;
        stringMap[currentLocale][stringKey] = string;
        if (currentLocale === 'en') {
            enStringValue = string;
        }
        localeSet.add(currentLocale);
    };
    const addStringCopy = ()=>{
        addString(currentStringValue);
    };
    const startString = ()=>{
        localeSet.clear();
        enStringValue = null;
        stringKey = stack.join('');
    };
    const endString = ()=>{
        for(let i = 0; i < locales.length; i++){
            const locale = locales[i];
            if (!localeSet.has(locale)) {
                stringMap[locale][stringKey] = enStringValue;
            }
        }
    };
    let index = 0;
    const bits = encodedString.split(/(?:)/u); // split by code point, so we don't have to worry about surrogate pairs
    // Reads a string from the bits (at our current index), until we hit a non-escaped control character
    const readString = ()=>{
        let result = '';
        while(index < bits.length){
            const char = bits[index];
            const codePoint = char.codePointAt(0);
            // Pass through any non-control characters
            if (codePoint > MAX_CONTROL_CHARACTER_CODE_POINT) {
                result += char;
                index++;
            } else if (codePoint === ESCAPE_CHARACTER_CODE_POINT) {
                const nextChar = bits[index + 1];
                result += nextChar;
                index += 2;
            } else {
                break;
            }
        }
        return result;
    };
    while(index < bits.length){
        const code = bits[index++];
        if (code === PUSH_TOKEN) {
            push(readString());
        } else if (code === PUSH_TOKEN_SLASH) {
            push(readString() + '/');
        } else if (code === PUSH_TOKEN_DOT) {
            push(readString() + '.');
        } else if (code === POP) {
            pop();
        } else if (code === POP_PUSH_TOKEN) {
            pop();
            push(readString());
        } else if (code === POP_PUSH_TOKEN_SLASH) {
            pop();
            push(readString() + '/');
        } else if (code === POP_PUSH_TOKEN_DOT) {
            pop();
            push(readString() + '.');
        } else if (code === SWITCH_LOCALE) {
            switchLocale(readString());
        } else if (code === START_STRING) {
            startString();
        } else if (code === END_STRING) {
            endString();
        } else if (code === ADD_STRING) {
            addString(readString());
        } else if (code === ADD_STRING_LTR_POP) {
            addString(CHAR_LTR + readString() + CHAR_POP);
        } else if (code === ADD_STRING_RTL_POP) {
            addString(CHAR_RTL + readString() + CHAR_POP);
        } else if (code === ADD_STRING_COPY_LAST) {
            addStringCopy();
        } else if (code === ADD_LOCALE) {
            addLocale(readString());
        } else {
            throw new Error('Unrecognized code: ' + code);
        }
    }
    return stringMap;
};
// A minified version of the above, for inclusion in the JS bundle. Approximately 1 kB.
// a = addString
// r = readString
// f = String.fromCharCode
// m = stringMap
// x = locales
// l = locale
// s = stack
// X = currentLocale
// S = currentStringValue
// e = enStringValue
// k = stringKey
// t = localeSet
// b = bits
// j = index
// c = code
// d = char
// p = codePoint
// q = string/result
// y = encodedString
/* eslint-disable */ /* @formatter:off */ const smallDecodeStringMapString = "y=>{let m={};let x=[];let s=[];let X=null;let S=null;let e=null;let t=new Set();let k=null;let f=String.fromCharCode;let A=f(1);let B=f(2);let C=f(3);let D=f(4);let E=f(5);let F=f(6);let G=f(7);let H=f(8);let I=f(9);let J=f(0xA);let K=f(0xB);let L=f(0xC);let M=f(0xD);let N=f(0xE);let O=f(0xF);let a=q=>{S=q;m[X][k]=q;if(X=='en'){e=q;}t.add(X);};let j=0;let b=y.split(/(?:)/u);let r=()=>{let q='';while(j<b.length){let d=b[j];let p=d.codePointAt(0);if(p>0x10){q+=d;j++;}else if(p==0x10){q+=b[j+1];j+=2;}else{break;}}return q;};while(j<b.length){let c=b[j++];if(c==A){s.push(r());}else if(c==B){s.push(r()+'/');}else if(c==C){s.push(r()+'.');}else if(c==D){s.pop();}else if(c==E){s.pop();s.push(r());}else if(c==F){s.pop();s.push(r()+'/');}else if(c==G){s.pop();s.push(r()+'.');}else if(c==H){X=r();}else if(c==I){t.clear();e=null;k=s.join('');}else if(c==J){for(let i=0;i<x.length;i++){let l=x[i];if(!t.has(l)){m[l][k]=e;}}}else if(c==K){a(r());}else if(c==L){a(`\u202a${r()}\u202c`);}else if(c==M){a(`\u202b${r()}\u202c`);}else if(c==N){a(S);}else if(c==O){let l=r();m[l]={};x.push(l);}}return m;}";
/* @formatter:on */ /* eslint-enable */ // Given a stringMap (map[ locale ][ stringKey ] => string), returns a JS expression string that will decode to it.
const encodeStringMapToJS = (stringMap)=>`(${smallDecodeStringMapString})(${toLessEscapedString(encodeStringMap(stringMap))})`;
export default {
    encodeStringMap: encodeStringMap,
    decodeStringMap: decodeStringMap,
    encodeStringMapToJS: encodeStringMapToJS
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9zdHJpbmdFbmNvZGluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHBoZXQvYmFkLXR5cGVzY3JpcHQtdGV4dFxuLy8gQHRzLW5vY2hlY2tcblxuLyoqXG4gKiBIYW5kbGVzIGVuY29kaW5nIGFuZCBkZWNvZGluZyBvZiBzdHJpbmdzIHRvL2Zyb20gYSBjb21wYWN0IGZvcm1hdCwgdG8gbG93ZXIgdGhlIGZpbGUgc2l6ZSBhbmQgZG93bmxvYWQgc2l6ZSBvZlxuICogc2ltdWxhdGlvbnMuXG4gKlxuICogVGhlIGVuY29kaW5nIGlzIHN0YXRlZnVsLCBhbmQgdGFrZXMgdGhlIGFwcHJveGltYXRlIGZvcm0gb2Y6XG4gKlxuICogZm9yIGVhY2ggbG9jYWxlOlxuICogICAoIEFERF9MT0NBTEUgbG9jYWxlICkrXG4gKiBmb3IgZWFjaCBzdHJpbmcga2V5OlxuICogICAoIFBVU0hfVE9LRU4gdG9rZW4gKSpcbiAqICAgU1RBUlRfU1RSSU5HXG4gKiAgIGZvciBlYWNoIGxvY2FsZSAoZW4sIG9yIGhhcyBhIG5vbi1lbiB0cmFuc2xhdGlvbik6XG4gKiAgICAgKFNXSVRDSF9MT0NBTEUgbG9jYWxlKT9cbiAqICAgICAoQUREX1NUUklORyBzdHJpbmcgfCBBRERfU1RSSU5HX0NPUFlfTEFTVClcbiAqICAgRU5EX1NUUklOR1xuICogICAoIFBPUF9UT0tFTiB0b2tlbiApKlxuICpcbiAqIFdlIGFkZCBzb21lIGNvbWJpbmF0aW9ucyBvZiBcInBvcCArIHB1c2hcIiwgYW5kIGZvcm1zIHRoYXQgYXV0b21hdGljYWxseSBhZGQgb24gdGhlIHNsYXNoL2RvdC9MVFIvUlRMIHN1YnN0cmluZ3MuXG4gKlxuICogU3RyaW5nIGtleXMgYXJlIGNvbnN0cnVjdGVkIGZyb20gc3RhY2suam9pbiggJycgKSwgd2UnbGwgcHVzaC9wb3Agc3Vic3RyaW5ncyBvZiB0aGUgc3RyaW5nIGtleSBhcyB3ZSBnby5cbiAqXG4gKiBJZiBhIHRyYW5zbGF0aW9uIGlzIHRoZSBzYW1lIGFzIHRoZSBFbmdsaXNoIHRyYW5zbGF0aW9uLCBpdCB3aWxsIGJlIG9taXR0ZWQgKGFuZCB0aGUgRU5EX1NUUklORyB3aXRob3V0IGhhdmluZyBzZXRcbiAqIGEgdHJhbnNsYXRpb24gd2lsbCBpbmRpY2F0ZSBpdCBzaG91bGQgYmUgZmlsbGVkIHdpdGggdGhpcyB2YWx1ZSkuIElmIG11bHRpcGxlIHRyYW5zbGF0aW9ucyBzaGFyZSBhIG5vbi1FbmdsaXNoIHZhbHVlLFxuICogd2UgY2FuIG5vdGUgdGhlIHZhbHVlIGlzIHRoZSBzYW1lIGFzIHRoZSBsYXN0LWdpdmVuIHN0cmluZy5cbiAqXG4gKiBXZSBhbHNvIHJlY29yZCB0aGUgbGFzdC11c2VkIGxvY2FsZSwgc28gdGhhdCBpZiB3ZSBvbmx5IGhhdmUgb25lIHRyYW5zbGF0aW9uLCB3ZSBjYW4gb21pdCB0aGUgU1dJVENIX0xPQ0FMRS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBTdHJpbmdGaWxlTWFwIH0gZnJvbSAnLi9DaGlwcGVyU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IHRvTGVzc0VzY2FwZWRTdHJpbmcgZnJvbSAnLi90b0xlc3NFc2NhcGVkU3RyaW5nLmpzJztcblxuY29uc3QgUFVTSF9UT0tFTiA9ICdcXHUwMDAxJzsgLy8gcHVzaCBzdHJpbmcgb24gdGhlIHN0YWNrXG5jb25zdCBQVVNIX1RPS0VOX1NMQVNIID0gJ1xcdTAwMDInOyAvLyBwdXNoIGAke3N0cmluZ30vYCBvbiB0aGUgc3RhY2tcbmNvbnN0IFBVU0hfVE9LRU5fRE9UID0gJ1xcdTAwMDMnOyAvLyBwdXNoIGAke3N0cmluZ30uYCBvbiB0aGUgc3RhY2tcbmNvbnN0IFBPUCA9ICdcXHUwMDA0JzsgLy8gcG9wIGZyb20gdGhlIHN0YWNrXG5jb25zdCBQT1BfUFVTSF9UT0tFTiA9ICdcXHUwMDA1JzsgLy8gcG9wIGZyb20gdGhlIHN0YWNrLCB0aGVuIHB1c2ggc3RyaW5nIG9uIHRoZSBzdGFja1xuY29uc3QgUE9QX1BVU0hfVE9LRU5fU0xBU0ggPSAnXFx1MDAwNic7IC8vIHBvcCBmcm9tIHRoZSBzdGFjaywgdGhlbiBwdXNoIGAke3N0cmluZ30vYCBvbiB0aGUgc3RhY2tcbmNvbnN0IFBPUF9QVVNIX1RPS0VOX0RPVCA9ICdcXHUwMDA3JzsgLy8gcG9wIGZyb20gdGhlIHN0YWNrLCB0aGVuIHB1c2ggYCR7c3RyaW5nfS5gIG9uIHRoZSBzdGFja1xuY29uc3QgU1dJVENIX0xPQ0FMRSA9ICdcXHUwMDA4JzsgLy8gc3dpdGNoIHRvIHRoZSBnaXZlbiBsb2NhbGVcbmNvbnN0IFNUQVJUX1NUUklORyA9ICdcXHUwMDA5JzsgLy8gc3RhcnQgYSBzdHJpbmdcbmNvbnN0IEVORF9TVFJJTkcgPSAnXFx1MDAwQSc7IC8vIGVuZCBhIHN0cmluZyAoYW5kIGZpbGwgaW4gbWlzc2luZyB0cmFuc2xhdGlvbnMpXG5jb25zdCBBRERfU1RSSU5HID0gJ1xcdTAwMEInOyAvLyBhZGQgYSB0cmFuc2xhdGlvbiBzdHJpbmcgdG8gdGhlIGN1cnJlbnQgbG9jYWxlIGFuZCBzdHJpbmdLZXlcbmNvbnN0IEFERF9TVFJJTkdfTFRSX1BPUCA9ICdcXHUwMDBDJzsgLy8gYWRkIGAke0xUUn0ke3N0cmluZ30ke1BPUH1gIHRvIHRoZSBjdXJyZW50IGxvY2FsZSBhbmQgc3RyaW5nS2V5XG5jb25zdCBBRERfU1RSSU5HX1JUTF9QT1AgPSAnXFx1MDAwRCc7IC8vIGFkZCBgJHtSVEx9JHtzdHJpbmd9JHtQT1B9YCB0byB0aGUgY3VycmVudCBsb2NhbGUgYW5kIHN0cmluZ0tleVxuY29uc3QgQUREX1NUUklOR19DT1BZX0xBU1QgPSAnXFx1MDAwRSc7IC8vIGFkZCB0aGUgbGFzdC11c2VkIHRyYW5zbGF0aW9uIHRvIHRoZSBjdXJyZW50IGxvY2FsZSBhbmQgc3RyaW5nS2V5XG5jb25zdCBBRERfTE9DQUxFID0gJ1xcdTAwMEYnOyAvLyBhZGQgYSBsb2NhbGUgKGF0IHRoZSBzdGFydClcbmNvbnN0IEVTQ0FQRV9DSEFSQUNURVIgPSAnXFx1MDAxMCc7IC8vIHdlJ2xsIG5lZWQgdG8gZXNjYXBlIGFueSBvZiB0aGVzZSBjaGFyYWN0ZXJzIGlmIHRoZXkgYXBwZWFyIGluIGEgc3RyaW5nXG5cbmNvbnN0IE1BWF9DT05UUk9MX0NIQVJBQ1RFUl9DT0RFX1BPSU5UID0gMHgxMDtcbmNvbnN0IEVTQ0FQRV9DSEFSQUNURVJfQ09ERV9QT0lOVCA9IDB4MTA7XG5cbmNvbnN0IENPTlRST0xfQ0hBUkFDVEVSUyA9IFtcbiAgUFVTSF9UT0tFTixcbiAgUFVTSF9UT0tFTl9TTEFTSCxcbiAgUFVTSF9UT0tFTl9ET1QsXG4gIFBPUCxcbiAgUE9QX1BVU0hfVE9LRU4sXG4gIFBPUF9QVVNIX1RPS0VOX1NMQVNILFxuICBQT1BfUFVTSF9UT0tFTl9ET1QsXG4gIFNXSVRDSF9MT0NBTEUsXG4gIFNUQVJUX1NUUklORyxcbiAgRU5EX1NUUklORyxcbiAgQUREX1NUUklORyxcbiAgQUREX1NUUklOR19MVFJfUE9QLFxuICBBRERfU1RSSU5HX1JUTF9QT1AsXG4gIEFERF9TVFJJTkdfQ09QWV9MQVNULFxuICBBRERfTE9DQUxFLFxuICBFU0NBUEVfQ0hBUkFDVEVSXG5dO1xuXG4vLyBPdXIgTFRSL1JUTCBlbWJlZGRpbmcgY2hhcmFjdGVyc1xuY29uc3QgQ0hBUl9MVFIgPSAnXFx1MjAyQSc7XG5jb25zdCBDSEFSX1JUTCA9ICdcXHUyMDJCJztcbmNvbnN0IENIQVJfUE9QID0gJ1xcdTIwMkMnO1xuXG4vLyBDb252ZXJ0cyBhIG1hcFsgbG9jYWxlIF1bIHN0cmluZ0tleSBdID0+IHN0cmluZyAod2l0aCBhIGNvbXBhY3QgZW5jb2RpbmcpXG5jb25zdCBlbmNvZGVTdHJpbmdNYXAgPSAoIHN0cmluZ01hcDogU3RyaW5nRmlsZU1hcCApOiBzdHJpbmcgPT4ge1xuICBjb25zdCBsb2NhbGVzID0gT2JqZWN0LmtleXMoIHN0cmluZ01hcCApLmZpbHRlciggbG9jYWxlID0+ICEhc3RyaW5nTWFwWyBsb2NhbGUgXSApLnNvcnQoKTtcblxuICAvLyBHZXQgYWxsIHN0cmluZyBrZXlzXG4gIGNvbnN0IHN0cmluZ0tleXNTZXQgPSBuZXcgU2V0KCk7XG4gIGxvY2FsZXMuZm9yRWFjaCggbG9jYWxlID0+IHtcbiAgICBPYmplY3Qua2V5cyggc3RyaW5nTWFwWyBsb2NhbGUgXSApLmZvckVhY2goIHN0cmluZ0tleSA9PiB7XG4gICAgICBzdHJpbmdLZXlzU2V0LmFkZCggc3RyaW5nS2V5ICk7XG4gICAgfSApO1xuICB9ICk7XG4gIC8vIEZvciBvdXIgc3RhY2sgZW5jb2RpbmcsIHdlJ2xsIHdhbnQgdGhlbSBzb3J0ZWQgc28gd2UgY2FuIHB1c2gvcG9wIGRlbHRhcyBiZXR3ZWVuIGVhY2ggb25lXG4gIGNvbnN0IHN0cmluZ0tleXMgPSBbIC4uLnN0cmluZ0tleXNTZXQgXS5zb3J0KCk7XG5cblxuICBjb25zdCBzdGFjayA9IFtdO1xuICBsZXQgY3VycmVudExvY2FsZSA9IG51bGw7XG4gIGxldCBjdXJyZW50U3RyaW5nVmFsdWUgPSBudWxsO1xuICBsZXQgb3V0cHV0ID0gJyc7XG5cbiAgLy8gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGNoYXJhY3RlciB0aGF0IGRpZmZlcnMgYmV0d2VlbiBhIGFuZCBiXG4gIGNvbnN0IGdldE1hdGNoSW5kZXggPSAoIGEsIGIgKSA9PiB7XG4gICAgbGV0IGkgPSAwO1xuICAgIHdoaWxlICggaSA8IE1hdGgubWluKCBhLmxlbmd0aCwgYi5sZW5ndGggKSAmJiBhWyBpIF0gPT09IGJbIGkgXSApIHtcbiAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH07XG5cbiAgLy8gRW5jb2RlcyBhIHN0cmluZywgZXNjYXBpbmcgYW55IGNvbnRyb2wgY2hhcmFjdGVyc1xuICBjb25zdCBlbmNvZGUgPSBzdHJpbmcgPT4ge1xuICAgIGxldCByZXN1bHQgPSAnJztcblxuICAgIHN0cmluZy5zcGxpdCggLyg/OikvdSApLmZvckVhY2goIGNoYXIgPT4ge1xuICAgICAgaWYgKCBDT05UUk9MX0NIQVJBQ1RFUlMuaW5jbHVkZXMoIGNoYXIgKSApIHtcbiAgICAgICAgcmVzdWx0ICs9IEVTQ0FQRV9DSEFSQUNURVIgKyBjaGFyO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdCArPSBjaGFyO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gQWRkcyBhIGxvY2FsZSB0byB0aGUgb3V0cHV0XG4gIGNvbnN0IGFkZExvY2FsZSA9IGxvY2FsZSA9PiB7XG4gICAgb3V0cHV0ICs9IEFERF9MT0NBTEUgKyBlbmNvZGUoIGxvY2FsZSApO1xuICB9O1xuXG4gIC8vIFB1c2hlcyBhIHRva2VuIG9udG8gdGhlIHN0YWNrIChjb21iaW5pbmcgd2l0aCB0aGUgcHJldmlvdXMgdG9rZW4gaWYgcG9zc2libGUpXG4gIGNvbnN0IHB1c2ggPSB0b2tlbiA9PiB7XG4gICAgc3RhY2sucHVzaCggdG9rZW4gKTtcbiAgICBjb25zdCBoYXNQb3AgPSBvdXRwdXQubGVuZ3RoID4gMCAmJiBvdXRwdXQuZW5kc1dpdGgoIFBPUCApO1xuXG4gICAgaWYgKCBoYXNQb3AgKSB7XG4gICAgICBvdXRwdXQgPSBvdXRwdXQuc2xpY2UoIDAsIC0xICk7XG4gICAgfVxuXG4gICAgbGV0IGNvZGU7XG4gICAgaWYgKCB0b2tlbi5lbmRzV2l0aCggJy8nICkgKSB7XG4gICAgICB0b2tlbiA9IHRva2VuLnNsaWNlKCAwLCAtMSApO1xuICAgICAgY29kZSA9IGhhc1BvcCA/IFBPUF9QVVNIX1RPS0VOX1NMQVNIIDogUFVTSF9UT0tFTl9TTEFTSDtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRva2VuLmVuZHNXaXRoKCAnLicgKSApIHtcbiAgICAgIHRva2VuID0gdG9rZW4uc2xpY2UoIDAsIC0xICk7XG4gICAgICBjb2RlID0gaGFzUG9wID8gUE9QX1BVU0hfVE9LRU5fRE9UIDogUFVTSF9UT0tFTl9ET1Q7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29kZSA9IGhhc1BvcCA/IFBPUF9QVVNIX1RPS0VOIDogUFVTSF9UT0tFTjtcbiAgICB9XG5cbiAgICBvdXRwdXQgKz0gY29kZSArIGVuY29kZSggdG9rZW4gKTtcbiAgfTtcblxuICAvLyBQb3BzIGEgdG9rZW4gZnJvbSB0aGUgc3RhY2tcbiAgY29uc3QgcG9wID0gKCkgPT4ge1xuICAgIHN0YWNrLnBvcCgpO1xuICAgIG91dHB1dCArPSBQT1A7XG4gIH07XG5cbiAgY29uc3Qgc3RhcnRTdHJpbmcgPSAoKSA9PiB7XG4gICAgb3V0cHV0ICs9IFNUQVJUX1NUUklORztcbiAgfTtcblxuICBjb25zdCBlbmRTdHJpbmcgPSAoKSA9PiB7XG4gICAgb3V0cHV0ICs9IEVORF9TVFJJTkc7XG4gIH07XG5cbiAgY29uc3Qgc3dpdGNoTG9jYWxlID0gbG9jYWxlID0+IHtcbiAgICBjdXJyZW50TG9jYWxlID0gbG9jYWxlO1xuXG4gICAgb3V0cHV0ICs9IFNXSVRDSF9MT0NBTEUgKyBlbmNvZGUoIGxvY2FsZSApO1xuICB9O1xuXG4gIGNvbnN0IGFkZFN0cmluZ0NvcHlMYXN0ID0gKCkgPT4ge1xuICAgIG91dHB1dCArPSBBRERfU1RSSU5HX0NPUFlfTEFTVDtcbiAgfTtcblxuICAvLyBBZGRzIGEgc3RyaW5nIHRvIHRoZSBvdXRwdXQsIGVuY29kaW5nIExUUi9SVEwgd3JhcHBlZCBmb3JtcyBpbiBhIG1vcmUgY29tcGFjdCB3YXlcbiAgY29uc3QgYWRkU3RyaW5nID0gc3RyaW5nID0+IHtcbiAgICBjdXJyZW50U3RyaW5nVmFsdWUgPSBzdHJpbmc7XG5cbiAgICBsZXQgY29kZTtcbiAgICBpZiAoIHN0cmluZy5zdGFydHNXaXRoKCBDSEFSX0xUUiApICYmIHN0cmluZy5lbmRzV2l0aCggQ0hBUl9QT1AgKSApIHtcbiAgICAgIGNvZGUgPSBBRERfU1RSSU5HX0xUUl9QT1A7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc2xpY2UoIDEsIC0xICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBzdHJpbmcuc3RhcnRzV2l0aCggQ0hBUl9SVEwgKSAmJiBzdHJpbmcuZW5kc1dpdGgoIENIQVJfUE9QICkgKSB7XG4gICAgICBjb2RlID0gQUREX1NUUklOR19SVExfUE9QO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKCAxLCAtMSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvZGUgPSBBRERfU1RSSU5HO1xuICAgIH1cblxuICAgIG91dHB1dCArPSBjb2RlICsgZW5jb2RlKCBzdHJpbmcgKTtcbiAgfTtcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gU3RhcnQgb2YgZW5jb2RpbmdcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgbG9jYWxlcy5mb3JFYWNoKCBsb2NhbGUgPT4ge1xuICAgIGFkZExvY2FsZSggbG9jYWxlICk7XG4gIH0gKTtcblxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdHJpbmdLZXlzLmxlbmd0aDsgaSsrICkge1xuICAgIGNvbnN0IHN0cmluZ0tleSA9IHN0cmluZ0tleXNbIGkgXTtcblxuICAgIC8vIEVuY29kZSB0aGUgc3RyaW5nIGtleVxuICAgIHtcbiAgICAgIHdoaWxlICggIXN0cmluZ0tleS5zdGFydHNXaXRoKCBzdGFjay5qb2luKCAnJyApICkgKSB7XG4gICAgICAgIHBvcCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSB3aWxsIHdoaXR0bGUgZG93biB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdHJpbmcga2V5IGFzIHdlIGdvLiBXZSBzdGFydCBoZXJlIGZyb20gdGhlIGRlbHRhIGZyb20gdGhlIGxhc3Qga2V5XG4gICAgICBsZXQgcmVtYWluZGVyID0gc3RyaW5nS2V5LnNsaWNlKCBzdGFjay5qb2luKCAnJyApLmxlbmd0aCApO1xuXG4gICAgICAvLyBTZXBhcmF0ZSBvdXQgdGhlIHJlcXVpcmVqc05hbWVzcGFjZSwgaWYgaXQgZXhpc3RzXG4gICAgICBpZiAoIHJlbWFpbmRlci5pbmNsdWRlcyggJy8nICkgKSB7XG4gICAgICAgIGNvbnN0IGJpdHMgPSByZW1haW5kZXIuc3BsaXQoICcvJyApO1xuICAgICAgICBjb25zdCB0b2tlbiA9IGJpdHNbIDAgXSArICcvJztcbiAgICAgICAgcHVzaCggdG9rZW4gKTtcbiAgICAgICAgcmVtYWluZGVyID0gcmVtYWluZGVyLnNsaWNlKCB0b2tlbi5sZW5ndGggKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2VwYXJhdGUgb3V0IGRvdC1zZXBhcmF0ZWQgdG9rZW5zIHRvIHB1c2ggaW5kZXBlbmRlbnRseS5cbiAgICAgIHdoaWxlICggcmVtYWluZGVyLmluY2x1ZGVzKCAnLicgKSApIHtcbiAgICAgICAgY29uc3QgYml0cyA9IHJlbWFpbmRlci5zcGxpdCggJy4nICk7XG4gICAgICAgIGNvbnN0IHRva2VuID0gYml0c1sgMCBdICsgJy4nO1xuICAgICAgICBwdXNoKCB0b2tlbiApO1xuICAgICAgICByZW1haW5kZXIgPSByZW1haW5kZXIuc2xpY2UoIHRva2VuLmxlbmd0aCApO1xuICAgICAgfVxuXG4gICAgICAvLyBTZWUgaWYgd2Ugc2hhcmUgYSBub24tdHJpdmlhbCBwcmVmaXggd2l0aCB0aGUgbmV4dCBzdHJpbmcga2V5LCBhbmQgaWYgc28sIHB1c2ggaXRcbiAgICAgIGlmICggaSArIDEgPCBzdHJpbmdLZXlzLmxlbmd0aCApIHtcbiAgICAgICAgY29uc3QgbmV4dFN0cmluZ0tleSA9IHN0cmluZ0tleXNbIGkgKyAxIF07XG4gICAgICAgIGNvbnN0IG1hdGNoSW5kZXggPSBnZXRNYXRjaEluZGV4KCByZW1haW5kZXIsIG5leHRTdHJpbmdLZXkuc2xpY2UoIHN0YWNrLmpvaW4oICcnICkubGVuZ3RoICkgKTtcbiAgICAgICAgaWYgKCBtYXRjaEluZGV4ID4gMSApIHtcbiAgICAgICAgICBjb25zdCB0b2tlbiA9IHJlbWFpbmRlci5zbGljZSggMCwgbWF0Y2hJbmRleCApO1xuICAgICAgICAgIHB1c2goIHRva2VuICk7XG4gICAgICAgICAgcmVtYWluZGVyID0gcmVtYWluZGVyLnNsaWNlKCB0b2tlbi5sZW5ndGggKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVzdCFcbiAgICAgIGlmICggcmVtYWluZGVyLmxlbmd0aCApIHtcbiAgICAgICAgcHVzaCggcmVtYWluZGVyICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW5jb2RlIHRoZSBzdHJpbmdcbiAgICB7XG4gICAgICBjb25zdCBkZWZhdWx0VmFsdWUgPSBzdHJpbmdNYXAuZW5bIHN0cmluZ0tleSBdO1xuXG4gICAgICAvLyBGaW5kIE9OTFkgdGhlIGxvY2FsZXMgdGhhdCB3ZSdsbCBpbmNsdWRlXG4gICAgICBjb25zdCBzdHJpbmdMb2NhbGVzID0gbG9jYWxlcy5maWx0ZXIoIGxvY2FsZSA9PiB7XG4gICAgICAgIGlmICggbG9jYWxlID09PSAnZW4nICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RyaW5nID0gc3RyaW5nTWFwWyBsb2NhbGUgXVsgc3RyaW5nS2V5IF07XG5cbiAgICAgICAgcmV0dXJuIHN0cmluZyAhPT0gdW5kZWZpbmVkICYmIHN0cmluZyAhPT0gZGVmYXVsdFZhbHVlO1xuICAgICAgfSApO1xuICAgICAgY29uc3Qgc3RyaW5nVmFsdWVzID0gc3RyaW5nTG9jYWxlcy5tYXAoIGxvY2FsZSA9PiBzdHJpbmdNYXBbIGxvY2FsZSBdWyBzdHJpbmdLZXkgXSApO1xuXG4gICAgICAvLyBXZSdsbCBvcmRlciB0aGluZ3MgYnkgdGhlIHN0cmluZyB2YWx1ZXMsIHNvIHdlIGNhbiBcImNvcHlcIiB3aGVuIHRoZXkgYXJlIHRoZSBzYW1lXG4gICAgICBjb25zdCBpbmRpY2VzID0gXy5zb3J0QnkoIF8ucmFuZ2UoIDAsIHN0cmluZ0xvY2FsZXMubGVuZ3RoICksIGkgPT4gc3RyaW5nVmFsdWVzWyBpIF0gKTtcblxuICAgICAgc3RhcnRTdHJpbmcoKTtcblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1sb29wLWZ1bmNcbiAgICAgIGluZGljZXMuZm9yRWFjaCggKCBpOiBudW1iZXIgKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvY2FsZSA9IHN0cmluZ0xvY2FsZXNbIGkgXTtcbiAgICAgICAgY29uc3Qgc3RyaW5nID0gc3RyaW5nVmFsdWVzWyBpIF07XG5cbiAgICAgICAgaWYgKCBsb2NhbGUgIT09IGN1cnJlbnRMb2NhbGUgKSB7XG4gICAgICAgICAgc3dpdGNoTG9jYWxlKCBsb2NhbGUgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggc3RyaW5nID09PSBjdXJyZW50U3RyaW5nVmFsdWUgKSB7XG4gICAgICAgICAgYWRkU3RyaW5nQ29weUxhc3QoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBhZGRTdHJpbmcoIHN0cmluZyApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIGVuZFN0cmluZygpO1xuICAgIH1cbiAgfVxuXG4gIC8vIERvdWJsZS1jaGVjayBvdXIgb3V0cHV0IHJlc3VsdHMgaW4gdGhlIGNvcnJlY3Qgc3RydWN0dXJlXG4gIGNvbnN0IHRlc3RTdHJpbmdNYXAgPSBkZWNvZGVTdHJpbmdNYXAoIG91dHB1dCApO1xuICBmb3IgKCBjb25zdCBsb2NhbGUgaW4gc3RyaW5nTWFwICkge1xuICAgIGZvciAoIGNvbnN0IHN0cmluZ0tleSBpbiBzdHJpbmdNYXBbIGxvY2FsZSBdICkge1xuICAgICAgaWYgKCBzdHJpbmdNYXBbIGxvY2FsZSBdWyBzdHJpbmdLZXkgXSAhPT0gdGVzdFN0cmluZ01hcFsgbG9jYWxlIF1bIHN0cmluZ0tleSBdICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBTdHJpbmcgbWFwIGVuY29kaW5nIGZhaWxlZCwgbWlzbWF0Y2ggYXQgJHtsb2NhbGV9ICR7c3RyaW5nS2V5fWAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufTtcblxuLy8gQ29udmVydHMgYSBjb21wYWN0IGVuY29kaW5nIHRvIG1hcFsgbG9jYWxlIF1bIHN0cmluZ0tleSBdOiBzdHJpbmdcbmNvbnN0IGRlY29kZVN0cmluZ01hcCA9ICggZW5jb2RlZFN0cmluZzogc3RyaW5nICk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHN0cmluZ01hcCA9IHt9OyAvLyBtYXBbIGxvY2FsZSBdWyBzdHJpbmdLZXkgXSA9PiBzdHJpbmdcbiAgY29uc3QgbG9jYWxlcyA9IFtdO1xuICBjb25zdCBzdGFjayA9IFtdOyAvLyBzdHJpbmdbXSwgc3RhY2suam9pbiggJycgKSB3aWxsIGJlIHRoZSBjdXJyZW50IHN0cmluZ0tleVxuICBsZXQgY3VycmVudExvY2FsZSA9IG51bGw7XG4gIGxldCBjdXJyZW50U3RyaW5nVmFsdWUgPSBudWxsOyAvLyB0aGUgbGFzdCBzdHJpbmcgdmFsdWUgd2UndmUgc2VlbiwgZm9yIEFERF9TVFJJTkdfQ09QWV9MQVNUXG4gIGxldCBlblN0cmluZ1ZhbHVlID0gbnVsbDsgLy8gdGhlIEVuZ2xpc2ggc3RyaW5nIHZhbHVlLCBmb3Igb21pdHRlZCB0cmFuc2xhdGlvbnNcbiAgY29uc3QgbG9jYWxlU2V0ID0gbmV3IFNldCgpOyAvLyBzbyB3ZSBjYW4gdHJhY2sgdGhlIG9taXR0ZWQgdHJhbnNsYXRpb25zXG4gIGxldCBzdHJpbmdLZXkgPSBudWxsO1xuXG4gIGNvbnN0IGFkZExvY2FsZSA9IGxvY2FsZSA9PiB7XG4gICAgc3RyaW5nTWFwWyBsb2NhbGUgXSA9IHt9O1xuICAgIGxvY2FsZXMucHVzaCggbG9jYWxlICk7XG4gIH07XG5cbiAgY29uc3QgcHVzaCA9IHRva2VuID0+IHtcbiAgICBzdGFjay5wdXNoKCB0b2tlbiApO1xuICB9O1xuXG4gIGNvbnN0IHBvcCA9ICgpID0+IHtcbiAgICBzdGFjay5wb3AoKTtcbiAgfTtcblxuICBjb25zdCBzd2l0Y2hMb2NhbGUgPSBsb2NhbGUgPT4ge1xuICAgIGN1cnJlbnRMb2NhbGUgPSBsb2NhbGU7XG4gIH07XG5cbiAgY29uc3QgYWRkU3RyaW5nID0gc3RyaW5nID0+IHtcbiAgICBjdXJyZW50U3RyaW5nVmFsdWUgPSBzdHJpbmc7XG4gICAgc3RyaW5nTWFwWyBjdXJyZW50TG9jYWxlIF1bIHN0cmluZ0tleSBdID0gc3RyaW5nO1xuICAgIGlmICggY3VycmVudExvY2FsZSA9PT0gJ2VuJyApIHtcbiAgICAgIGVuU3RyaW5nVmFsdWUgPSBzdHJpbmc7XG4gICAgfVxuICAgIGxvY2FsZVNldC5hZGQoIGN1cnJlbnRMb2NhbGUgKTtcbiAgfTtcblxuICBjb25zdCBhZGRTdHJpbmdDb3B5ID0gKCkgPT4ge1xuICAgIGFkZFN0cmluZyggY3VycmVudFN0cmluZ1ZhbHVlICk7XG4gIH07XG5cbiAgY29uc3Qgc3RhcnRTdHJpbmcgPSAoKSA9PiB7XG4gICAgbG9jYWxlU2V0LmNsZWFyKCk7XG4gICAgZW5TdHJpbmdWYWx1ZSA9IG51bGw7XG4gICAgc3RyaW5nS2V5ID0gc3RhY2suam9pbiggJycgKTtcbiAgfTtcblxuICBjb25zdCBlbmRTdHJpbmcgPSAoKSA9PiB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbG9jYWxlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGxvY2FsZSA9IGxvY2FsZXNbIGkgXTtcbiAgICAgIGlmICggIWxvY2FsZVNldC5oYXMoIGxvY2FsZSApICkge1xuICAgICAgICBzdHJpbmdNYXBbIGxvY2FsZSBdWyBzdHJpbmdLZXkgXSA9IGVuU3RyaW5nVmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxldCBpbmRleCA9IDA7XG4gIGNvbnN0IGJpdHMgPSBlbmNvZGVkU3RyaW5nLnNwbGl0KCAvKD86KS91ICk7IC8vIHNwbGl0IGJ5IGNvZGUgcG9pbnQsIHNvIHdlIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc3Vycm9nYXRlIHBhaXJzXG5cbiAgLy8gUmVhZHMgYSBzdHJpbmcgZnJvbSB0aGUgYml0cyAoYXQgb3VyIGN1cnJlbnQgaW5kZXgpLCB1bnRpbCB3ZSBoaXQgYSBub24tZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlclxuICBjb25zdCByZWFkU3RyaW5nID0gKCkgPT4ge1xuICAgIGxldCByZXN1bHQgPSAnJztcblxuICAgIHdoaWxlICggaW5kZXggPCBiaXRzLmxlbmd0aCApIHtcbiAgICAgIGNvbnN0IGNoYXIgPSBiaXRzWyBpbmRleCBdO1xuICAgICAgY29uc3QgY29kZVBvaW50ID0gY2hhci5jb2RlUG9pbnRBdCggMCApO1xuXG4gICAgICAvLyBQYXNzIHRocm91Z2ggYW55IG5vbi1jb250cm9sIGNoYXJhY3RlcnNcbiAgICAgIGlmICggY29kZVBvaW50ID4gTUFYX0NPTlRST0xfQ0hBUkFDVEVSX0NPREVfUE9JTlQgKSB7XG4gICAgICAgIHJlc3VsdCArPSBjaGFyO1xuICAgICAgICBpbmRleCsrO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGNvZGVQb2ludCA9PT0gRVNDQVBFX0NIQVJBQ1RFUl9DT0RFX1BPSU5UICkge1xuICAgICAgICBjb25zdCBuZXh0Q2hhciA9IGJpdHNbIGluZGV4ICsgMSBdO1xuICAgICAgICByZXN1bHQgKz0gbmV4dENoYXI7XG4gICAgICAgIGluZGV4ICs9IDI7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB3aGlsZSAoIGluZGV4IDwgYml0cy5sZW5ndGggKSB7XG4gICAgY29uc3QgY29kZSA9IGJpdHNbIGluZGV4KysgXTtcblxuICAgIGlmICggY29kZSA9PT0gUFVTSF9UT0tFTiApIHtcbiAgICAgIHB1c2goIHJlYWRTdHJpbmcoKSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggY29kZSA9PT0gUFVTSF9UT0tFTl9TTEFTSCApIHtcbiAgICAgIHB1c2goIHJlYWRTdHJpbmcoKSArICcvJyApO1xuICAgIH1cbiAgICBlbHNlIGlmICggY29kZSA9PT0gUFVTSF9UT0tFTl9ET1QgKSB7XG4gICAgICBwdXNoKCByZWFkU3RyaW5nKCkgKyAnLicgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGNvZGUgPT09IFBPUCApIHtcbiAgICAgIHBvcCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICggY29kZSA9PT0gUE9QX1BVU0hfVE9LRU4gKSB7XG4gICAgICBwb3AoKTtcbiAgICAgIHB1c2goIHJlYWRTdHJpbmcoKSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggY29kZSA9PT0gUE9QX1BVU0hfVE9LRU5fU0xBU0ggKSB7XG4gICAgICBwb3AoKTtcbiAgICAgIHB1c2goIHJlYWRTdHJpbmcoKSArICcvJyApO1xuICAgIH1cbiAgICBlbHNlIGlmICggY29kZSA9PT0gUE9QX1BVU0hfVE9LRU5fRE9UICkge1xuICAgICAgcG9wKCk7XG4gICAgICBwdXNoKCByZWFkU3RyaW5nKCkgKyAnLicgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGNvZGUgPT09IFNXSVRDSF9MT0NBTEUgKSB7XG4gICAgICBzd2l0Y2hMb2NhbGUoIHJlYWRTdHJpbmcoKSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggY29kZSA9PT0gU1RBUlRfU1RSSU5HICkge1xuICAgICAgc3RhcnRTdHJpbmcoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGNvZGUgPT09IEVORF9TVFJJTkcgKSB7XG4gICAgICBlbmRTdHJpbmcoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGNvZGUgPT09IEFERF9TVFJJTkcgKSB7XG4gICAgICBhZGRTdHJpbmcoIHJlYWRTdHJpbmcoKSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggY29kZSA9PT0gQUREX1NUUklOR19MVFJfUE9QICkge1xuICAgICAgYWRkU3RyaW5nKCBDSEFSX0xUUiArIHJlYWRTdHJpbmcoKSArIENIQVJfUE9QICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBjb2RlID09PSBBRERfU1RSSU5HX1JUTF9QT1AgKSB7XG4gICAgICBhZGRTdHJpbmcoIENIQVJfUlRMICsgcmVhZFN0cmluZygpICsgQ0hBUl9QT1AgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGNvZGUgPT09IEFERF9TVFJJTkdfQ09QWV9MQVNUICkge1xuICAgICAgYWRkU3RyaW5nQ29weSgpO1xuICAgIH1cbiAgICBlbHNlIGlmICggY29kZSA9PT0gQUREX0xPQ0FMRSApIHtcbiAgICAgIGFkZExvY2FsZSggcmVhZFN0cmluZygpICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnVW5yZWNvZ25pemVkIGNvZGU6ICcgKyBjb2RlICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0cmluZ01hcDtcbn07XG5cbi8vIEEgbWluaWZpZWQgdmVyc2lvbiBvZiB0aGUgYWJvdmUsIGZvciBpbmNsdXNpb24gaW4gdGhlIEpTIGJ1bmRsZS4gQXBwcm94aW1hdGVseSAxIGtCLlxuLy8gYSA9IGFkZFN0cmluZ1xuLy8gciA9IHJlYWRTdHJpbmdcbi8vIGYgPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4vLyBtID0gc3RyaW5nTWFwXG4vLyB4ID0gbG9jYWxlc1xuLy8gbCA9IGxvY2FsZVxuLy8gcyA9IHN0YWNrXG4vLyBYID0gY3VycmVudExvY2FsZVxuLy8gUyA9IGN1cnJlbnRTdHJpbmdWYWx1ZVxuLy8gZSA9IGVuU3RyaW5nVmFsdWVcbi8vIGsgPSBzdHJpbmdLZXlcbi8vIHQgPSBsb2NhbGVTZXRcbi8vIGIgPSBiaXRzXG4vLyBqID0gaW5kZXhcbi8vIGMgPSBjb2RlXG4vLyBkID0gY2hhclxuLy8gcCA9IGNvZGVQb2ludFxuLy8gcSA9IHN0cmluZy9yZXN1bHRcbi8vIHkgPSBlbmNvZGVkU3RyaW5nXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyogQGZvcm1hdHRlcjpvZmYgKi9cbmNvbnN0IHNtYWxsRGVjb2RlU3RyaW5nTWFwU3RyaW5nID0gXCJ5PT57bGV0IG09e307bGV0IHg9W107bGV0IHM9W107bGV0IFg9bnVsbDtsZXQgUz1udWxsO2xldCBlPW51bGw7bGV0IHQ9bmV3IFNldCgpO2xldCBrPW51bGw7bGV0IGY9U3RyaW5nLmZyb21DaGFyQ29kZTtsZXQgQT1mKDEpO2xldCBCPWYoMik7bGV0IEM9ZigzKTtsZXQgRD1mKDQpO2xldCBFPWYoNSk7bGV0IEY9Zig2KTtsZXQgRz1mKDcpO2xldCBIPWYoOCk7bGV0IEk9Zig5KTtsZXQgSj1mKDB4QSk7bGV0IEs9ZigweEIpO2xldCBMPWYoMHhDKTtsZXQgTT1mKDB4RCk7bGV0IE49ZigweEUpO2xldCBPPWYoMHhGKTtsZXQgYT1xPT57Uz1xO21bWF1ba109cTtpZihYPT0nZW4nKXtlPXE7fXQuYWRkKFgpO307bGV0IGo9MDtsZXQgYj15LnNwbGl0KC8oPzopL3UpO2xldCByPSgpPT57bGV0IHE9Jyc7d2hpbGUoajxiLmxlbmd0aCl7bGV0IGQ9YltqXTtsZXQgcD1kLmNvZGVQb2ludEF0KDApO2lmKHA+MHgxMCl7cSs9ZDtqKys7fWVsc2UgaWYocD09MHgxMCl7cSs9YltqKzFdO2orPTI7fWVsc2V7YnJlYWs7fX1yZXR1cm4gcTt9O3doaWxlKGo8Yi5sZW5ndGgpe2xldCBjPWJbaisrXTtpZihjPT1BKXtzLnB1c2gocigpKTt9ZWxzZSBpZihjPT1CKXtzLnB1c2gocigpKycvJyk7fWVsc2UgaWYoYz09Qyl7cy5wdXNoKHIoKSsnLicpO31lbHNlIGlmKGM9PUQpe3MucG9wKCk7fWVsc2UgaWYoYz09RSl7cy5wb3AoKTtzLnB1c2gocigpKTt9ZWxzZSBpZihjPT1GKXtzLnBvcCgpO3MucHVzaChyKCkrJy8nKTt9ZWxzZSBpZihjPT1HKXtzLnBvcCgpO3MucHVzaChyKCkrJy4nKTt9ZWxzZSBpZihjPT1IKXtYPXIoKTt9ZWxzZSBpZihjPT1JKXt0LmNsZWFyKCk7ZT1udWxsO2s9cy5qb2luKCcnKTt9ZWxzZSBpZihjPT1KKXtmb3IobGV0IGk9MDtpPHgubGVuZ3RoO2krKyl7bGV0IGw9eFtpXTtpZighdC5oYXMobCkpe21bbF1ba109ZTt9fX1lbHNlIGlmKGM9PUspe2EocigpKTt9ZWxzZSBpZihjPT1MKXthKGBcXHUyMDJhJHtyKCl9XFx1MjAyY2ApO31lbHNlIGlmKGM9PU0pe2EoYFxcdTIwMmIke3IoKX1cXHUyMDJjYCk7fWVsc2UgaWYoYz09Til7YShTKTt9ZWxzZSBpZihjPT1PKXtsZXQgbD1yKCk7bVtsXT17fTt4LnB1c2gobCk7fX1yZXR1cm4gbTt9XCI7XG4vKiBAZm9ybWF0dGVyOm9uICovXG4vKiBlc2xpbnQtZW5hYmxlICovXG5cbi8vIEdpdmVuIGEgc3RyaW5nTWFwIChtYXBbIGxvY2FsZSBdWyBzdHJpbmdLZXkgXSA9PiBzdHJpbmcpLCByZXR1cm5zIGEgSlMgZXhwcmVzc2lvbiBzdHJpbmcgdGhhdCB3aWxsIGRlY29kZSB0byBpdC5cbmNvbnN0IGVuY29kZVN0cmluZ01hcFRvSlMgPSAoIHN0cmluZ01hcDogU3RyaW5nRmlsZU1hcCApOiBzdHJpbmcgPT4gYCgke3NtYWxsRGVjb2RlU3RyaW5nTWFwU3RyaW5nfSkoJHt0b0xlc3NFc2NhcGVkU3RyaW5nKCBlbmNvZGVTdHJpbmdNYXAoIHN0cmluZ01hcCApICl9KWA7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZW5jb2RlU3RyaW5nTWFwOiBlbmNvZGVTdHJpbmdNYXAsXG4gIGRlY29kZVN0cmluZ01hcDogZGVjb2RlU3RyaW5nTWFwLFxuICBlbmNvZGVTdHJpbmdNYXBUb0pTOiBlbmNvZGVTdHJpbmdNYXBUb0pTXG59OyJdLCJuYW1lcyI6WyJfIiwidG9MZXNzRXNjYXBlZFN0cmluZyIsIlBVU0hfVE9LRU4iLCJQVVNIX1RPS0VOX1NMQVNIIiwiUFVTSF9UT0tFTl9ET1QiLCJQT1AiLCJQT1BfUFVTSF9UT0tFTiIsIlBPUF9QVVNIX1RPS0VOX1NMQVNIIiwiUE9QX1BVU0hfVE9LRU5fRE9UIiwiU1dJVENIX0xPQ0FMRSIsIlNUQVJUX1NUUklORyIsIkVORF9TVFJJTkciLCJBRERfU1RSSU5HIiwiQUREX1NUUklOR19MVFJfUE9QIiwiQUREX1NUUklOR19SVExfUE9QIiwiQUREX1NUUklOR19DT1BZX0xBU1QiLCJBRERfTE9DQUxFIiwiRVNDQVBFX0NIQVJBQ1RFUiIsIk1BWF9DT05UUk9MX0NIQVJBQ1RFUl9DT0RFX1BPSU5UIiwiRVNDQVBFX0NIQVJBQ1RFUl9DT0RFX1BPSU5UIiwiQ09OVFJPTF9DSEFSQUNURVJTIiwiQ0hBUl9MVFIiLCJDSEFSX1JUTCIsIkNIQVJfUE9QIiwiZW5jb2RlU3RyaW5nTWFwIiwic3RyaW5nTWFwIiwibG9jYWxlcyIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJsb2NhbGUiLCJzb3J0Iiwic3RyaW5nS2V5c1NldCIsIlNldCIsImZvckVhY2giLCJzdHJpbmdLZXkiLCJhZGQiLCJzdHJpbmdLZXlzIiwic3RhY2siLCJjdXJyZW50TG9jYWxlIiwiY3VycmVudFN0cmluZ1ZhbHVlIiwib3V0cHV0IiwiZ2V0TWF0Y2hJbmRleCIsImEiLCJiIiwiaSIsIk1hdGgiLCJtaW4iLCJsZW5ndGgiLCJlbmNvZGUiLCJzdHJpbmciLCJyZXN1bHQiLCJzcGxpdCIsImNoYXIiLCJpbmNsdWRlcyIsImFkZExvY2FsZSIsInB1c2giLCJ0b2tlbiIsImhhc1BvcCIsImVuZHNXaXRoIiwic2xpY2UiLCJjb2RlIiwicG9wIiwic3RhcnRTdHJpbmciLCJlbmRTdHJpbmciLCJzd2l0Y2hMb2NhbGUiLCJhZGRTdHJpbmdDb3B5TGFzdCIsImFkZFN0cmluZyIsInN0YXJ0c1dpdGgiLCJqb2luIiwicmVtYWluZGVyIiwiYml0cyIsIm5leHRTdHJpbmdLZXkiLCJtYXRjaEluZGV4IiwiZGVmYXVsdFZhbHVlIiwiZW4iLCJzdHJpbmdMb2NhbGVzIiwidW5kZWZpbmVkIiwic3RyaW5nVmFsdWVzIiwibWFwIiwiaW5kaWNlcyIsInNvcnRCeSIsInJhbmdlIiwidGVzdFN0cmluZ01hcCIsImRlY29kZVN0cmluZ01hcCIsIkVycm9yIiwiZW5jb2RlZFN0cmluZyIsImVuU3RyaW5nVmFsdWUiLCJsb2NhbGVTZXQiLCJhZGRTdHJpbmdDb3B5IiwiY2xlYXIiLCJoYXMiLCJpbmRleCIsInJlYWRTdHJpbmciLCJjb2RlUG9pbnQiLCJjb2RlUG9pbnRBdCIsIm5leHRDaGFyIiwic21hbGxEZWNvZGVTdHJpbmdNYXBTdHJpbmciLCJlbmNvZGVTdHJpbmdNYXBUb0pTIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQsb0RBQW9EO0FBQ3BELGNBQWM7QUFFZDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTRCQyxHQUNELE9BQU9BLE9BQU8sU0FBUztBQUV2QixPQUFPQyx5QkFBeUIsMkJBQTJCO0FBRTNELE1BQU1DLGFBQWEsVUFBVSwyQkFBMkI7QUFDeEQsTUFBTUMsbUJBQW1CLFVBQVUsaUNBQWlDO0FBQ3BFLE1BQU1DLGlCQUFpQixVQUFVLGlDQUFpQztBQUNsRSxNQUFNQyxNQUFNLFVBQVUscUJBQXFCO0FBQzNDLE1BQU1DLGlCQUFpQixVQUFVLG9EQUFvRDtBQUNyRixNQUFNQyx1QkFBdUIsVUFBVSwwREFBMEQ7QUFDakcsTUFBTUMscUJBQXFCLFVBQVUsMERBQTBEO0FBQy9GLE1BQU1DLGdCQUFnQixVQUFVLDZCQUE2QjtBQUM3RCxNQUFNQyxlQUFlLFVBQVUsaUJBQWlCO0FBQ2hELE1BQU1DLGFBQWEsVUFBVSxrREFBa0Q7QUFDL0UsTUFBTUMsYUFBYSxVQUFVLCtEQUErRDtBQUM1RixNQUFNQyxxQkFBcUIsVUFBVSxrRUFBa0U7QUFDdkcsTUFBTUMscUJBQXFCLFVBQVUsa0VBQWtFO0FBQ3ZHLE1BQU1DLHVCQUF1QixVQUFVLG9FQUFvRTtBQUMzRyxNQUFNQyxhQUFhLFVBQVUsOEJBQThCO0FBQzNELE1BQU1DLG1CQUFtQixVQUFVLDBFQUEwRTtBQUU3RyxNQUFNQyxtQ0FBbUM7QUFDekMsTUFBTUMsOEJBQThCO0FBRXBDLE1BQU1DLHFCQUFxQjtJQUN6QmxCO0lBQ0FDO0lBQ0FDO0lBQ0FDO0lBQ0FDO0lBQ0FDO0lBQ0FDO0lBQ0FDO0lBQ0FD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