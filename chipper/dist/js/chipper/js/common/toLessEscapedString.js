// Copyright 2023-2024, University of Colorado Boulder
/**
 * More space-efficient alternative to JSON.stringify for strings, that will escape only the necessary characters.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const toLessEscapedString = (string)=>{
    let result = '';
    string.split(/(?:)/u).forEach((char)=>{
        if (char === '\r') {
            result += '\\r';
        } else if (char === '\n') {
            result += '\\n';
        } else if (char === '\\') {
            result += '\\\\';
        } else if (char === '\'') {
            result += '\\\'';
        } else {
            result += char;
        }
    });
    return `'${result}'`;
};
export default toLessEscapedString;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi90b0xlc3NFc2NhcGVkU3RyaW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1vcmUgc3BhY2UtZWZmaWNpZW50IGFsdGVybmF0aXZlIHRvIEpTT04uc3RyaW5naWZ5IGZvciBzdHJpbmdzLCB0aGF0IHdpbGwgZXNjYXBlIG9ubHkgdGhlIG5lY2Vzc2FyeSBjaGFyYWN0ZXJzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCB0b0xlc3NFc2NhcGVkU3RyaW5nID0gKCBzdHJpbmc6IHN0cmluZyApOiBzdHJpbmcgPT4ge1xuICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgc3RyaW5nLnNwbGl0KCAvKD86KS91ICkuZm9yRWFjaCggKCBjaGFyOiBzdHJpbmcgKSA9PiB7XG4gICAgaWYgKCBjaGFyID09PSAnXFxyJyApIHtcbiAgICAgIHJlc3VsdCArPSAnXFxcXHInO1xuICAgIH1cbiAgICBlbHNlIGlmICggY2hhciA9PT0gJ1xcbicgKSB7XG4gICAgICByZXN1bHQgKz0gJ1xcXFxuJztcbiAgICB9XG4gICAgZWxzZSBpZiAoIGNoYXIgPT09ICdcXFxcJyApIHtcbiAgICAgIHJlc3VsdCArPSAnXFxcXFxcXFwnO1xuICAgIH1cbiAgICBlbHNlIGlmICggY2hhciA9PT0gJ1xcJycgKSB7XG4gICAgICByZXN1bHQgKz0gJ1xcXFxcXCcnO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJlc3VsdCArPSBjaGFyO1xuICAgIH1cbiAgfSApO1xuXG4gIHJldHVybiBgJyR7cmVzdWx0fSdgO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgdG9MZXNzRXNjYXBlZFN0cmluZzsiXSwibmFtZXMiOlsidG9MZXNzRXNjYXBlZFN0cmluZyIsInN0cmluZyIsInJlc3VsdCIsInNwbGl0IiwiZm9yRWFjaCIsImNoYXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsTUFBTUEsc0JBQXNCLENBQUVDO0lBQzVCLElBQUlDLFNBQVM7SUFFYkQsT0FBT0UsS0FBSyxDQUFFLFNBQVVDLE9BQU8sQ0FBRSxDQUFFQztRQUNqQyxJQUFLQSxTQUFTLE1BQU87WUFDbkJILFVBQVU7UUFDWixPQUNLLElBQUtHLFNBQVMsTUFBTztZQUN4QkgsVUFBVTtRQUNaLE9BQ0ssSUFBS0csU0FBUyxNQUFPO1lBQ3hCSCxVQUFVO1FBQ1osT0FDSyxJQUFLRyxTQUFTLE1BQU87WUFDeEJILFVBQVU7UUFDWixPQUNLO1lBQ0hBLFVBQVVHO1FBQ1o7SUFDRjtJQUVBLE9BQU8sQ0FBQyxDQUFDLEVBQUVILE9BQU8sQ0FBQyxDQUFDO0FBQ3RCO0FBRUEsZUFBZUYsb0JBQW9CIn0=