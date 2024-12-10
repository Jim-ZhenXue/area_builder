// Copyright 2022-2024, University of Colorado Boulder
/**
 * DynamicStringTest is a handler for KeyboardEvents. It's used for testing dynamic layout in sims that may not yet
 * have submitted translations, and is enabled via ?stringTest=dynamic. Please see initialize-globals or method
 * handleEvent below for the keys that are handled. See https://github.com/phetsims/chipper/issues/1319 for history.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { localizedStrings } from '../../chipper/js/browser/getStringModule.js';
import Utils from '../../dot/js/Utils.js';
import joist from './joist.js';
const INITIAL_STRING_FACTOR = 1;
const MAX_STRING_FACTOR = 8; // so that the sim and/or browser doesn't lock up when strings get excessively long
const MIN_STRING_FACTOR = 0.01;
const INITIAL_STRIDE = 0;
// Source of 'random' words
const WORD_SOURCE = 'Sometimes when Hippopotomonstrosesquippedaliophobia want lyrics you turn to Shakespeare like ' + 'the following text copied from some work ' + 'To be or not to be that is the question ' + 'Supercalifragilisticexpeladocious tis nobler in the mind to suffer ' + 'The slings and arrows of antidisestablishmentarianism fortune ' + 'Or to take Incomprehensibility against a sea of Floccinaucinihilipilification';
let DynamicStringTest = class DynamicStringTest {
    /**
   * Handles a KeyboardEvent.
   */ handleEvent(event) {
        if (event.code === 'ArrowLeft') {
            this.halveStrings();
        } else if (event.code === 'ArrowRight') {
            this.doubleStrings();
        } else if (event.code === 'ArrowUp') {
            this.setStride(this.stride + 1);
        } else if (event.code === 'ArrowDown') {
            this.setStride(this.stride - 1);
        } else if (event.code === 'Space') {
            this.reset();
        }
    }
    /**
   * Doubles the length of all strings.
   */ doubleStrings() {
        this.setStringFactor(Math.min(this.stringFactor * 2, MAX_STRING_FACTOR));
    }
    /**
   * Halves the length of all strings.
   */ halveStrings() {
        this.setStringFactor(Math.max(this.stringFactor * 0.5, MIN_STRING_FACTOR));
    }
    /**
   * Sets a new stringFactor, and applies that stringFactor to all strings.
   */ setStringFactor(stringFactor) {
        assert && assert(stringFactor > 0, `stringFactor must be > 0: ${stringFactor}`);
        this.stringFactor = stringFactor;
        console.log(`stringFactor = ${this.stringFactor}`);
        applyToAllStrings(this.stringFactor);
    }
    /**
   * Sets a new stride value, and causes strings to be set to values from the WORDS array.
   */ setStride(newStride) {
        assert && assert(Number.isInteger(newStride), `newStride must be an integer: ${newStride}`);
        const words = DynamicStringTest.WORDS;
        // Handle wraparound.
        if (newStride > words.length - 1) {
            newStride = 0;
        } else if (newStride < 0) {
            newStride = words.length - 1;
        }
        this.stride = newStride;
        console.log(`stride = ${this.stride}`);
        // Set each string to a word from WORDS.
        localizedStrings.forEach((localizedString, index)=>{
            localizedString.property.value = words[(index + this.stride) % words.length];
        });
    }
    /**
   * Resets stride and stringFactor.
   */ reset() {
        this.setStride(INITIAL_STRIDE);
        this.setStringFactor(INITIAL_STRING_FACTOR); // reset stringFactor last, so that strings are reset to initial values
    }
    constructor(){
        // How much to increase or decrease the length of the string. Its value must be > 0.
        this.stringFactor = INITIAL_STRING_FACTOR;
        // Non-negative integer used to create an index into WORDS.
        this.stride = INITIAL_STRIDE;
    }
};
// Words of different lengths that can be cycled through by changing stride
DynamicStringTest.WORDS = WORD_SOURCE.split(' ');
export { DynamicStringTest as default };
/**
 * Applies stringFactor to all strings.
 */ function applyToAllStrings(stringFactor) {
    localizedStrings.forEach((localizedString)=>{
        // Restore the string to its initial value.
        localizedString.restoreInitialValue('en');
        if (stringFactor !== 1) {
            // Strip out all RTL (U+202A), LTR (U+202B), and PDF (U+202C) characters from string.
            const strippedString = localizedString.property.value.replace(/[\u202A\u202B\u202C]/g, '');
            localizedString.property.value = applyToString(stringFactor, strippedString);
        }
    });
}
/**
 * Applies stringFactor to one string.
 */ function applyToString(stringFactor, string) {
    assert && assert(stringFactor > 0, `stringFactor must be > 0: ${stringFactor}`);
    if (stringFactor > 1) {
        return doubleString(string, stringFactor);
    } else {
        // Create an array of all placeholders that are present in the string. Each placeholder is a substrings surrounded
        // by 2 sets of curly braces, like '{{value}}'. This will be an empty array if no match is found.
        const placeholders = string.match(/{{(.+?)}}/g) || [];
        // Remove all placeholders from the string.
        const noPlaceholdersString = string.replace(/{{(.+?)}}/g, '');
        // Reduce the length of the string.
        const stringLength = Utils.toFixedNumber(noPlaceholdersString.length * stringFactor + 1, 0);
        const reducedString = noPlaceholdersString.substring(0, stringLength);
        // Append placeholders to the end of the reduced string. This will add nothing if placeholders is empty.
        return reducedString + placeholders.join('');
    }
}
/**
 * Doubles a string n times.
 */ function doubleString(string, n) {
    let growingString = string;
    while(n > 1){
        growingString += string;
        n -= 1;
    }
    return growingString;
}
joist.register('DynamicStringTest', DynamicStringTest);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0R5bmFtaWNTdHJpbmdUZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIER5bmFtaWNTdHJpbmdUZXN0IGlzIGEgaGFuZGxlciBmb3IgS2V5Ym9hcmRFdmVudHMuIEl0J3MgdXNlZCBmb3IgdGVzdGluZyBkeW5hbWljIGxheW91dCBpbiBzaW1zIHRoYXQgbWF5IG5vdCB5ZXRcbiAqIGhhdmUgc3VibWl0dGVkIHRyYW5zbGF0aW9ucywgYW5kIGlzIGVuYWJsZWQgdmlhID9zdHJpbmdUZXN0PWR5bmFtaWMuIFBsZWFzZSBzZWUgaW5pdGlhbGl6ZS1nbG9iYWxzIG9yIG1ldGhvZFxuICogaGFuZGxlRXZlbnQgYmVsb3cgZm9yIHRoZSBrZXlzIHRoYXQgYXJlIGhhbmRsZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTMxOSBmb3IgaGlzdG9yeS5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNYXJsYSBTY2h1bHogKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCB7IGxvY2FsaXplZFN0cmluZ3MgfSBmcm9tICcuLi8uLi9jaGlwcGVyL2pzL2Jyb3dzZXIvZ2V0U3RyaW5nTW9kdWxlLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xuXG5jb25zdCBJTklUSUFMX1NUUklOR19GQUNUT1IgPSAxO1xuY29uc3QgTUFYX1NUUklOR19GQUNUT1IgPSA4OyAvLyBzbyB0aGF0IHRoZSBzaW0gYW5kL29yIGJyb3dzZXIgZG9lc24ndCBsb2NrIHVwIHdoZW4gc3RyaW5ncyBnZXQgZXhjZXNzaXZlbHkgbG9uZ1xuY29uc3QgTUlOX1NUUklOR19GQUNUT1IgPSAwLjAxO1xuY29uc3QgSU5JVElBTF9TVFJJREUgPSAwO1xuXG4vLyBTb3VyY2Ugb2YgJ3JhbmRvbScgd29yZHNcbmNvbnN0IFdPUkRfU09VUkNFID0gJ1NvbWV0aW1lcyB3aGVuIEhpcHBvcG90b21vbnN0cm9zZXNxdWlwcGVkYWxpb3Bob2JpYSB3YW50IGx5cmljcyB5b3UgdHVybiB0byBTaGFrZXNwZWFyZSBsaWtlICcgK1xuICAgICAgICAgICAgICAgICAgICAndGhlIGZvbGxvd2luZyB0ZXh0IGNvcGllZCBmcm9tIHNvbWUgd29yayAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1RvIGJlIG9yIG5vdCB0byBiZSB0aGF0IGlzIHRoZSBxdWVzdGlvbiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1N1cGVyY2FsaWZyYWdpbGlzdGljZXhwZWxhZG9jaW91cyB0aXMgbm9ibGVyIGluIHRoZSBtaW5kIHRvIHN1ZmZlciAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1RoZSBzbGluZ3MgYW5kIGFycm93cyBvZiBhbnRpZGlzZXN0YWJsaXNobWVudGFyaWFuaXNtIGZvcnR1bmUgJyArXG4gICAgICAgICAgICAgICAgICAgICdPciB0byB0YWtlIEluY29tcHJlaGVuc2liaWxpdHkgYWdhaW5zdCBhIHNlYSBvZiBGbG9jY2luYXVjaW5paGlsaXBpbGlmaWNhdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIER5bmFtaWNTdHJpbmdUZXN0IHtcblxuICAvLyBIb3cgbXVjaCB0byBpbmNyZWFzZSBvciBkZWNyZWFzZSB0aGUgbGVuZ3RoIG9mIHRoZSBzdHJpbmcuIEl0cyB2YWx1ZSBtdXN0IGJlID4gMC5cbiAgcHJpdmF0ZSBzdHJpbmdGYWN0b3IgPSBJTklUSUFMX1NUUklOR19GQUNUT1I7XG5cbiAgLy8gTm9uLW5lZ2F0aXZlIGludGVnZXIgdXNlZCB0byBjcmVhdGUgYW4gaW5kZXggaW50byBXT1JEUy5cbiAgcHJpdmF0ZSBzdHJpZGUgPSBJTklUSUFMX1NUUklERTtcblxuICAvLyBXb3JkcyBvZiBkaWZmZXJlbnQgbGVuZ3RocyB0aGF0IGNhbiBiZSBjeWNsZWQgdGhyb3VnaCBieSBjaGFuZ2luZyBzdHJpZGVcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgV09SRFMgPSBXT1JEX1NPVVJDRS5zcGxpdCggJyAnICk7XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYSBLZXlib2FyZEV2ZW50LlxuICAgKi9cbiAgcHVibGljIGhhbmRsZUV2ZW50KCBldmVudDogS2V5Ym9hcmRFdmVudCApOiB2b2lkIHtcbiAgICBpZiAoIGV2ZW50LmNvZGUgPT09ICdBcnJvd0xlZnQnICkge1xuICAgICAgdGhpcy5oYWx2ZVN0cmluZ3MoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGV2ZW50LmNvZGUgPT09ICdBcnJvd1JpZ2h0JyApIHtcbiAgICAgIHRoaXMuZG91YmxlU3RyaW5ncygpO1xuICAgIH1cbiAgICBlbHNlIGlmICggZXZlbnQuY29kZSA9PT0gJ0Fycm93VXAnICkge1xuICAgICAgdGhpcy5zZXRTdHJpZGUoIHRoaXMuc3RyaWRlICsgMSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggZXZlbnQuY29kZSA9PT0gJ0Fycm93RG93bicgKSB7XG4gICAgICB0aGlzLnNldFN0cmlkZSggdGhpcy5zdHJpZGUgLSAxICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBldmVudC5jb2RlID09PSAnU3BhY2UnICkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEb3VibGVzIHRoZSBsZW5ndGggb2YgYWxsIHN0cmluZ3MuXG4gICAqL1xuICBwcml2YXRlIGRvdWJsZVN0cmluZ3MoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdHJpbmdGYWN0b3IoIE1hdGgubWluKCB0aGlzLnN0cmluZ0ZhY3RvciAqIDIsIE1BWF9TVFJJTkdfRkFDVE9SICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYWx2ZXMgdGhlIGxlbmd0aCBvZiBhbGwgc3RyaW5ncy5cbiAgICovXG4gIHByaXZhdGUgaGFsdmVTdHJpbmdzKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RyaW5nRmFjdG9yKCBNYXRoLm1heCggdGhpcy5zdHJpbmdGYWN0b3IgKiAwLjUsIE1JTl9TVFJJTkdfRkFDVE9SICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgbmV3IHN0cmluZ0ZhY3RvciwgYW5kIGFwcGxpZXMgdGhhdCBzdHJpbmdGYWN0b3IgdG8gYWxsIHN0cmluZ3MuXG4gICAqL1xuICBwcml2YXRlIHNldFN0cmluZ0ZhY3Rvciggc3RyaW5nRmFjdG9yOiBudW1iZXIgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RyaW5nRmFjdG9yID4gMCwgYHN0cmluZ0ZhY3RvciBtdXN0IGJlID4gMDogJHtzdHJpbmdGYWN0b3J9YCApO1xuXG4gICAgdGhpcy5zdHJpbmdGYWN0b3IgPSBzdHJpbmdGYWN0b3I7XG4gICAgY29uc29sZS5sb2coIGBzdHJpbmdGYWN0b3IgPSAke3RoaXMuc3RyaW5nRmFjdG9yfWAgKTtcbiAgICBhcHBseVRvQWxsU3RyaW5ncyggdGhpcy5zdHJpbmdGYWN0b3IgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgbmV3IHN0cmlkZSB2YWx1ZSwgYW5kIGNhdXNlcyBzdHJpbmdzIHRvIGJlIHNldCB0byB2YWx1ZXMgZnJvbSB0aGUgV09SRFMgYXJyYXkuXG4gICAqL1xuICBwcml2YXRlIHNldFN0cmlkZSggbmV3U3RyaWRlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbmV3U3RyaWRlICksIGBuZXdTdHJpZGUgbXVzdCBiZSBhbiBpbnRlZ2VyOiAke25ld1N0cmlkZX1gICk7XG5cbiAgICBjb25zdCB3b3JkcyA9IER5bmFtaWNTdHJpbmdUZXN0LldPUkRTO1xuXG4gICAgLy8gSGFuZGxlIHdyYXBhcm91bmQuXG4gICAgaWYgKCBuZXdTdHJpZGUgPiB3b3Jkcy5sZW5ndGggLSAxICkge1xuICAgICAgbmV3U3RyaWRlID0gMDtcbiAgICB9XG4gICAgZWxzZSBpZiAoIG5ld1N0cmlkZSA8IDAgKSB7XG4gICAgICBuZXdTdHJpZGUgPSB3b3Jkcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIHRoaXMuc3RyaWRlID0gbmV3U3RyaWRlO1xuICAgIGNvbnNvbGUubG9nKCBgc3RyaWRlID0gJHt0aGlzLnN0cmlkZX1gICk7XG5cbiAgICAvLyBTZXQgZWFjaCBzdHJpbmcgdG8gYSB3b3JkIGZyb20gV09SRFMuXG4gICAgbG9jYWxpemVkU3RyaW5ncy5mb3JFYWNoKCAoIGxvY2FsaXplZFN0cmluZywgaW5kZXggKSA9PiB7XG4gICAgICBsb2NhbGl6ZWRTdHJpbmcucHJvcGVydHkudmFsdWUgPSB3b3Jkc1sgKCBpbmRleCArIHRoaXMuc3RyaWRlICkgJSB3b3Jkcy5sZW5ndGggXTtcbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHN0cmlkZSBhbmQgc3RyaW5nRmFjdG9yLlxuICAgKi9cbiAgcHJpdmF0ZSByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0cmlkZSggSU5JVElBTF9TVFJJREUgKTtcbiAgICB0aGlzLnNldFN0cmluZ0ZhY3RvciggSU5JVElBTF9TVFJJTkdfRkFDVE9SICk7IC8vIHJlc2V0IHN0cmluZ0ZhY3RvciBsYXN0LCBzbyB0aGF0IHN0cmluZ3MgYXJlIHJlc2V0IHRvIGluaXRpYWwgdmFsdWVzXG4gIH1cbn1cblxuLyoqXG4gKiBBcHBsaWVzIHN0cmluZ0ZhY3RvciB0byBhbGwgc3RyaW5ncy5cbiAqL1xuZnVuY3Rpb24gYXBwbHlUb0FsbFN0cmluZ3MoIHN0cmluZ0ZhY3RvcjogbnVtYmVyICk6IHZvaWQge1xuICBsb2NhbGl6ZWRTdHJpbmdzLmZvckVhY2goIGxvY2FsaXplZFN0cmluZyA9PiB7XG5cbiAgICAvLyBSZXN0b3JlIHRoZSBzdHJpbmcgdG8gaXRzIGluaXRpYWwgdmFsdWUuXG4gICAgbG9jYWxpemVkU3RyaW5nLnJlc3RvcmVJbml0aWFsVmFsdWUoICdlbicgKTtcblxuICAgIGlmICggc3RyaW5nRmFjdG9yICE9PSAxICkge1xuXG4gICAgICAvLyBTdHJpcCBvdXQgYWxsIFJUTCAoVSsyMDJBKSwgTFRSIChVKzIwMkIpLCBhbmQgUERGIChVKzIwMkMpIGNoYXJhY3RlcnMgZnJvbSBzdHJpbmcuXG4gICAgICBjb25zdCBzdHJpcHBlZFN0cmluZyA9IGxvY2FsaXplZFN0cmluZy5wcm9wZXJ0eS52YWx1ZS5yZXBsYWNlKCAvW1xcdTIwMkFcXHUyMDJCXFx1MjAyQ10vZywgJycgKTtcbiAgICAgIGxvY2FsaXplZFN0cmluZy5wcm9wZXJ0eS52YWx1ZSA9IGFwcGx5VG9TdHJpbmcoIHN0cmluZ0ZhY3Rvciwgc3RyaXBwZWRTdHJpbmcgKTtcbiAgICB9XG4gIH0gKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIHN0cmluZ0ZhY3RvciB0byBvbmUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBhcHBseVRvU3RyaW5nKCBzdHJpbmdGYWN0b3I6IG51bWJlciwgc3RyaW5nOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggc3RyaW5nRmFjdG9yID4gMCwgYHN0cmluZ0ZhY3RvciBtdXN0IGJlID4gMDogJHtzdHJpbmdGYWN0b3J9YCApO1xuXG4gIGlmICggc3RyaW5nRmFjdG9yID4gMSApIHtcbiAgICByZXR1cm4gZG91YmxlU3RyaW5nKCBzdHJpbmcsIHN0cmluZ0ZhY3RvciApO1xuICB9XG4gIGVsc2Uge1xuXG4gICAgLy8gQ3JlYXRlIGFuIGFycmF5IG9mIGFsbCBwbGFjZWhvbGRlcnMgdGhhdCBhcmUgcHJlc2VudCBpbiB0aGUgc3RyaW5nLiBFYWNoIHBsYWNlaG9sZGVyIGlzIGEgc3Vic3RyaW5ncyBzdXJyb3VuZGVkXG4gICAgLy8gYnkgMiBzZXRzIG9mIGN1cmx5IGJyYWNlcywgbGlrZSAne3t2YWx1ZX19Jy4gVGhpcyB3aWxsIGJlIGFuIGVtcHR5IGFycmF5IGlmIG5vIG1hdGNoIGlzIGZvdW5kLlxuICAgIGNvbnN0IHBsYWNlaG9sZGVycyA9IHN0cmluZy5tYXRjaCggL3t7KC4rPyl9fS9nICkgfHwgW107XG5cbiAgICAvLyBSZW1vdmUgYWxsIHBsYWNlaG9sZGVycyBmcm9tIHRoZSBzdHJpbmcuXG4gICAgY29uc3Qgbm9QbGFjZWhvbGRlcnNTdHJpbmcgPSBzdHJpbmcucmVwbGFjZSggL3t7KC4rPyl9fS9nLCAnJyApO1xuXG4gICAgLy8gUmVkdWNlIHRoZSBsZW5ndGggb2YgdGhlIHN0cmluZy5cbiAgICBjb25zdCBzdHJpbmdMZW5ndGggPSBVdGlscy50b0ZpeGVkTnVtYmVyKCBub1BsYWNlaG9sZGVyc1N0cmluZy5sZW5ndGggKiBzdHJpbmdGYWN0b3IgKyAxLCAwICk7XG4gICAgY29uc3QgcmVkdWNlZFN0cmluZyA9IG5vUGxhY2Vob2xkZXJzU3RyaW5nLnN1YnN0cmluZyggMCwgc3RyaW5nTGVuZ3RoICk7XG5cbiAgICAvLyBBcHBlbmQgcGxhY2Vob2xkZXJzIHRvIHRoZSBlbmQgb2YgdGhlIHJlZHVjZWQgc3RyaW5nLiBUaGlzIHdpbGwgYWRkIG5vdGhpbmcgaWYgcGxhY2Vob2xkZXJzIGlzIGVtcHR5LlxuICAgIHJldHVybiByZWR1Y2VkU3RyaW5nICsgcGxhY2Vob2xkZXJzLmpvaW4oICcnICk7XG4gIH1cbn1cblxuLyoqXG4gKiBEb3VibGVzIGEgc3RyaW5nIG4gdGltZXMuXG4gKi9cbmZ1bmN0aW9uIGRvdWJsZVN0cmluZyggc3RyaW5nOiBzdHJpbmcsIG46IG51bWJlciApOiBzdHJpbmcge1xuICBsZXQgZ3Jvd2luZ1N0cmluZyA9IHN0cmluZztcbiAgd2hpbGUgKCBuID4gMSApIHtcbiAgICBncm93aW5nU3RyaW5nICs9IHN0cmluZztcbiAgICBuIC09IDE7XG4gIH1cbiAgcmV0dXJuIGdyb3dpbmdTdHJpbmc7XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnRHluYW1pY1N0cmluZ1Rlc3QnLCBEeW5hbWljU3RyaW5nVGVzdCApOyJdLCJuYW1lcyI6WyJsb2NhbGl6ZWRTdHJpbmdzIiwiVXRpbHMiLCJqb2lzdCIsIklOSVRJQUxfU1RSSU5HX0ZBQ1RPUiIsIk1BWF9TVFJJTkdfRkFDVE9SIiwiTUlOX1NUUklOR19GQUNUT1IiLCJJTklUSUFMX1NUUklERSIsIldPUkRfU09VUkNFIiwiRHluYW1pY1N0cmluZ1Rlc3QiLCJoYW5kbGVFdmVudCIsImV2ZW50IiwiY29kZSIsImhhbHZlU3RyaW5ncyIsImRvdWJsZVN0cmluZ3MiLCJzZXRTdHJpZGUiLCJzdHJpZGUiLCJyZXNldCIsInNldFN0cmluZ0ZhY3RvciIsIk1hdGgiLCJtaW4iLCJzdHJpbmdGYWN0b3IiLCJtYXgiLCJhc3NlcnQiLCJjb25zb2xlIiwibG9nIiwiYXBwbHlUb0FsbFN0cmluZ3MiLCJuZXdTdHJpZGUiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJ3b3JkcyIsIldPUkRTIiwibGVuZ3RoIiwiZm9yRWFjaCIsImxvY2FsaXplZFN0cmluZyIsImluZGV4IiwicHJvcGVydHkiLCJ2YWx1ZSIsInNwbGl0IiwicmVzdG9yZUluaXRpYWxWYWx1ZSIsInN0cmlwcGVkU3RyaW5nIiwicmVwbGFjZSIsImFwcGx5VG9TdHJpbmciLCJzdHJpbmciLCJkb3VibGVTdHJpbmciLCJwbGFjZWhvbGRlcnMiLCJtYXRjaCIsIm5vUGxhY2Vob2xkZXJzU3RyaW5nIiwic3RyaW5nTGVuZ3RoIiwidG9GaXhlZE51bWJlciIsInJlZHVjZWRTdHJpbmciLCJzdWJzdHJpbmciLCJqb2luIiwibiIsImdyb3dpbmdTdHJpbmciLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7OztDQVFDLEdBRUQsU0FBU0EsZ0JBQWdCLFFBQVEsOENBQThDO0FBQy9FLE9BQU9DLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9DLFdBQVcsYUFBYTtBQUUvQixNQUFNQyx3QkFBd0I7QUFDOUIsTUFBTUMsb0JBQW9CLEdBQUcsbUZBQW1G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