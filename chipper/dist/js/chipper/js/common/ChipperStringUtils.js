// Copyright 2015-2024, University of Colorado Boulder
/**
 * String utilities used throughout chipper.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import assert from 'assert';
import _ from 'lodash';
// What divides the repo prefix from the rest of the string key, like `FRICTION/friction.title`
const NAMESPACE_PREFIX_DIVIDER = '/';
const A11Y_MARKER = 'a11y.';
const ChipperStringUtils = {
    /**
   * Pad LTR/RTL language values with unicode embedding marks (see https://github.com/phetsims/joist/issues/152)
   * Uses directional formatting characters: http://unicode.org/reports/tr9/#Directional_Formatting_Characters
   *
   * @returns the input string padded with the embedding marks, or an empty string if the input was empty
   */ addDirectionalFormatting: function(str, isRTL) {
        if (str.length > 0) {
            return `${(isRTL ? '\u202b' : '\u202a') + str}\u202c`;
        } else {
            return str;
        }
    },
    /**
   * Appends spaces to a string
   *
   * @param str - the input string
   * @param n - number of spaces to append
   * @returns a new string
   */ padString: function(str, n) {
        while(str.length < n){
            str += ' ';
        }
        return str;
    },
    /**
   * Replaces all occurrences of {string} find with {string} replace in {string} str
   *
   * @param str - the input string
   * @param find - the string to find
   * @param replaceWith - the string to replace find with
   * @returns a new string
   */ replaceAll: function(str, find, replaceWith) {
        return str.replace(new RegExp(find.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replaceWith);
    },
    // TODO chipper#316 determine why this behaves differently than str.replace for some cases (eg, 'MAIN_INLINE_JAVASCRIPT')
    /**
   * Replaces the first occurrence of {string} find with {string} replaceWith in {string} str
   *
   * @param str - the input string
   * @param find - the string to find
   * @param replaceWith - the string to replace find with
   * @returns a new string
   */ replaceFirst: function(str, find, replaceWith) {
        const idx = str.indexOf(find);
        if (str.includes(find)) {
            return str.slice(0, idx) + replaceWith + str.slice(idx + find.length);
        } else {
            return str;
        }
    },
    /**
   * Returns a string with all of the keys of the mapping replaced with the values.
   */ replacePlaceholders: function(str, mapping) {
        Object.keys(mapping).forEach((key)=>{
            const replacement = mapping[key];
            key = `{{${key}}}`;
            let index;
            while((index = str.indexOf(key)) >= 0){
                str = str.slice(0, index) + replacement + str.slice(index + key.length);
            }
        });
        Object.keys(mapping).forEach((key)=>{
            if (str.includes(`{{${key}}}`)) {
                throw new Error(`Template string detected in placeholders: ${key}\n\n${str.slice(0, str.indexOf(`{{${key}}}`) + 10)}`);
            }
        });
        return str;
    },
    /**
   * Recurse through a string file and format each string value appropriately
   * @param stringMap
   * @param isRTL - is right to left language
   * @param [assertNoWhitespace] - when true, assert that trimming each string value doesn't change the string.
   */ formatStringValues: function(stringMap, isRTL, assertNoWhitespace) {
        ChipperStringUtils.forEachString(stringMap, (key, stringObject)=>{
            assert && assertNoWhitespace && assert(stringObject.value === stringObject.value.trim(), `String should not have trailing or leading whitespace, key: ${key}, value: "${stringObject.value}"`);
            // remove leading/trailing whitespace, see chipper#619. Do this before addDirectionalFormatting
            stringObject.value = ChipperStringUtils.addDirectionalFormatting(stringObject.value.trim(), isRTL);
        });
    },
    /**
   * Given a key, get the appropriate string from the "map" object, or null if the key does not appear in the map.
   * This method is called in unbuilt mode from the string plugin and during the build via CHIPPER/getStringFileMap.
   * This method supports recursing through keys that support string nesting. This method was created to support
   * nested string keys in https://github.com/phetsims/rosetta/issues/193
   * @param map - where an "intermediate" Object should hold nested strings
   * @param key - like `FRICTION/friction.title` or using nesting like `a11y.nested.string.here`
   * @returns - the string entry of the key, or null if the key does not appear in the map
   * @throws  {Error} - if the key doesn't hold a string value in the map
   */ getStringEntryFromMap (map, key) {
        if (key.includes(NAMESPACE_PREFIX_DIVIDER)) {
            throw new Error('getStringEntryFromMap key should not have REPO/');
        }
        // Lodash gives precedence to  "key1.key2" over "key1:{key2}", so we do too.
        const result = _.at(map, key)[0];
        if (result) {
            if (result.value === undefined) {
                throw new Error(`no value for string: ${key}`);
            }
            if (typeof result.value !== 'string') {
                throw new Error(`value should be a string for key ${key}`);
            }
            // Until rosetta supports nested strings in https://github.com/phetsims/rosetta/issues/215, keep this assertion.
            // This should be after because the above errors are more specific. This is better as a fallback.
            assert && !ChipperStringUtils.isA11yStringKey(key) && assert(map[key], `nested strings are not allowed outside of a11y string object for key: ${key}`);
            return result;
        }
        // They key does not appear in the map
        return null;
    },
    /**
   * @param key - without "string!REPO" at the beginning, just the actual "string key"
   */ isA11yStringKey (key) {
        return key.startsWith(ChipperStringUtils.A11Y_MARKER);
    },
    /**
   * The start of any a11y specific string key.
   */ A11Y_MARKER: A11Y_MARKER,
    /**
   * Call a function on each object with a "value" attribute in an object tree.
   * @param map - string map, like a loaded JSON strings file
   * @param func
   * @param keySoFar - while recursing, build up a string of the key separated with dots.
   */ forEachString (map, func, keySoFar = '') {
        for(const key in map){
            if (map.hasOwnProperty(key)) {
                const nextKey = keySoFar ? `${keySoFar}.${key}` : key; // don't start with period, assumes '' is falsey
                const stringObject = map[key];
                // no need to support non-object, null, or arrays in the string map, for example stringObject.history in
                // locale specific files.
                if (typeof stringObject !== 'object' || stringObject === null || Array.isArray(stringObject)) {
                    continue;
                }
                if (stringObject.value) {
                    func(nextKey, stringObject);
                }
                // recurse to the next level since if it wasn't the `value` key
                key !== 'value' && ChipperStringUtils.forEachString(stringObject, func, nextKey);
            }
        }
    }
};
export default ChipperStringUtils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9DaGlwcGVyU3RyaW5nVXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU3RyaW5nIHV0aWxpdGllcyB1c2VkIHRocm91Z2hvdXQgY2hpcHBlci5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG4vLyBXaGF0IGRpdmlkZXMgdGhlIHJlcG8gcHJlZml4IGZyb20gdGhlIHJlc3Qgb2YgdGhlIHN0cmluZyBrZXksIGxpa2UgYEZSSUNUSU9OL2ZyaWN0aW9uLnRpdGxlYFxuY29uc3QgTkFNRVNQQUNFX1BSRUZJWF9ESVZJREVSID0gJy8nO1xuY29uc3QgQTExWV9NQVJLRVIgPSAnYTExeS4nO1xuXG5jb25zdCBDaGlwcGVyU3RyaW5nVXRpbHMgPSB7XG5cbiAgLyoqXG4gICAqIFBhZCBMVFIvUlRMIGxhbmd1YWdlIHZhbHVlcyB3aXRoIHVuaWNvZGUgZW1iZWRkaW5nIG1hcmtzIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8xNTIpXG4gICAqIFVzZXMgZGlyZWN0aW9uYWwgZm9ybWF0dGluZyBjaGFyYWN0ZXJzOiBodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjkvI0RpcmVjdGlvbmFsX0Zvcm1hdHRpbmdfQ2hhcmFjdGVyc1xuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgaW5wdXQgc3RyaW5nIHBhZGRlZCB3aXRoIHRoZSBlbWJlZGRpbmcgbWFya3MsIG9yIGFuIGVtcHR5IHN0cmluZyBpZiB0aGUgaW5wdXQgd2FzIGVtcHR5XG4gICAqL1xuICBhZGREaXJlY3Rpb25hbEZvcm1hdHRpbmc6IGZ1bmN0aW9uKCBzdHI6IHN0cmluZywgaXNSVEw6IGJvb2xlYW4gKTogc3RyaW5nIHtcbiAgICBpZiAoIHN0ci5sZW5ndGggPiAwICkge1xuICAgICAgcmV0dXJuIGAkeyggaXNSVEwgPyAnXFx1MjAyYicgOiAnXFx1MjAyYScgKSArIHN0cn1cXHUyMDJjYDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQXBwZW5kcyBzcGFjZXMgdG8gYSBzdHJpbmdcbiAgICpcbiAgICogQHBhcmFtIHN0ciAtIHRoZSBpbnB1dCBzdHJpbmdcbiAgICogQHBhcmFtIG4gLSBudW1iZXIgb2Ygc3BhY2VzIHRvIGFwcGVuZFxuICAgKiBAcmV0dXJucyBhIG5ldyBzdHJpbmdcbiAgICovXG4gIHBhZFN0cmluZzogZnVuY3Rpb24oIHN0cjogc3RyaW5nLCBuOiBudW1iZXIgKTogc3RyaW5nIHtcbiAgICB3aGlsZSAoIHN0ci5sZW5ndGggPCBuICkge1xuICAgICAgc3RyICs9ICcgJztcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZXMgYWxsIG9jY3VycmVuY2VzIG9mIHtzdHJpbmd9IGZpbmQgd2l0aCB7c3RyaW5nfSByZXBsYWNlIGluIHtzdHJpbmd9IHN0clxuICAgKlxuICAgKiBAcGFyYW0gc3RyIC0gdGhlIGlucHV0IHN0cmluZ1xuICAgKiBAcGFyYW0gZmluZCAtIHRoZSBzdHJpbmcgdG8gZmluZFxuICAgKiBAcGFyYW0gcmVwbGFjZVdpdGggLSB0aGUgc3RyaW5nIHRvIHJlcGxhY2UgZmluZCB3aXRoXG4gICAqIEByZXR1cm5zIGEgbmV3IHN0cmluZ1xuICAgKi9cbiAgcmVwbGFjZUFsbDogZnVuY3Rpb24oIHN0cjogc3RyaW5nLCBmaW5kOiBzdHJpbmcsIHJlcGxhY2VXaXRoOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoIG5ldyBSZWdFeHAoIGZpbmQucmVwbGFjZSggL1stL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnICksICdnJyApLCByZXBsYWNlV2l0aCApO1xuICB9LFxuXG4gIC8vIFRPRE8gY2hpcHBlciMzMTYgZGV0ZXJtaW5lIHdoeSB0aGlzIGJlaGF2ZXMgZGlmZmVyZW50bHkgdGhhbiBzdHIucmVwbGFjZSBmb3Igc29tZSBjYXNlcyAoZWcsICdNQUlOX0lOTElORV9KQVZBU0NSSVBUJylcbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHtzdHJpbmd9IGZpbmQgd2l0aCB7c3RyaW5nfSByZXBsYWNlV2l0aCBpbiB7c3RyaW5nfSBzdHJcbiAgICpcbiAgICogQHBhcmFtIHN0ciAtIHRoZSBpbnB1dCBzdHJpbmdcbiAgICogQHBhcmFtIGZpbmQgLSB0aGUgc3RyaW5nIHRvIGZpbmRcbiAgICogQHBhcmFtIHJlcGxhY2VXaXRoIC0gdGhlIHN0cmluZyB0byByZXBsYWNlIGZpbmQgd2l0aFxuICAgKiBAcmV0dXJucyBhIG5ldyBzdHJpbmdcbiAgICovXG4gIHJlcGxhY2VGaXJzdDogZnVuY3Rpb24oIHN0cjogc3RyaW5nLCBmaW5kOiBzdHJpbmcsIHJlcGxhY2VXaXRoOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgICBjb25zdCBpZHggPSBzdHIuaW5kZXhPZiggZmluZCApO1xuICAgIGlmICggc3RyLmluY2x1ZGVzKCBmaW5kICkgKSB7XG4gICAgICByZXR1cm4gc3RyLnNsaWNlKCAwLCBpZHggKSArIHJlcGxhY2VXaXRoICsgc3RyLnNsaWNlKCBpZHggKyBmaW5kLmxlbmd0aCApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHdpdGggYWxsIG9mIHRoZSBrZXlzIG9mIHRoZSBtYXBwaW5nIHJlcGxhY2VkIHdpdGggdGhlIHZhbHVlcy5cbiAgICovXG4gIHJlcGxhY2VQbGFjZWhvbGRlcnM6IGZ1bmN0aW9uKCBzdHI6IHN0cmluZywgbWFwcGluZzogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlcj4gKTogc3RyaW5nIHtcbiAgICBPYmplY3Qua2V5cyggbWFwcGluZyApLmZvckVhY2goIGtleSA9PiB7XG4gICAgICBjb25zdCByZXBsYWNlbWVudCA9IG1hcHBpbmdbIGtleSBdO1xuICAgICAga2V5ID0gYHt7JHtrZXl9fX1gO1xuICAgICAgbGV0IGluZGV4O1xuICAgICAgd2hpbGUgKCAoIGluZGV4ID0gc3RyLmluZGV4T2YoIGtleSApICkgPj0gMCApIHtcbiAgICAgICAgc3RyID0gc3RyLnNsaWNlKCAwLCBpbmRleCApICsgcmVwbGFjZW1lbnQgKyBzdHIuc2xpY2UoIGluZGV4ICsga2V5Lmxlbmd0aCApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgICBPYmplY3Qua2V5cyggbWFwcGluZyApLmZvckVhY2goIGtleSA9PiB7XG4gICAgICBpZiAoIHN0ci5pbmNsdWRlcyggYHt7JHtrZXl9fX1gICkgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYFRlbXBsYXRlIHN0cmluZyBkZXRlY3RlZCBpbiBwbGFjZWhvbGRlcnM6ICR7a2V5fVxcblxcbiR7c3RyLnNsaWNlKCAwLCBzdHIuaW5kZXhPZiggYHt7JHtrZXl9fX1gICkgKyAxMCApfWAgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgcmV0dXJuIHN0cjtcbiAgfSxcblxuICAvKipcbiAgICogUmVjdXJzZSB0aHJvdWdoIGEgc3RyaW5nIGZpbGUgYW5kIGZvcm1hdCBlYWNoIHN0cmluZyB2YWx1ZSBhcHByb3ByaWF0ZWx5XG4gICAqIEBwYXJhbSBzdHJpbmdNYXBcbiAgICogQHBhcmFtIGlzUlRMIC0gaXMgcmlnaHQgdG8gbGVmdCBsYW5ndWFnZVxuICAgKiBAcGFyYW0gW2Fzc2VydE5vV2hpdGVzcGFjZV0gLSB3aGVuIHRydWUsIGFzc2VydCB0aGF0IHRyaW1taW5nIGVhY2ggc3RyaW5nIHZhbHVlIGRvZXNuJ3QgY2hhbmdlIHRoZSBzdHJpbmcuXG4gICAqL1xuICBmb3JtYXRTdHJpbmdWYWx1ZXM6IGZ1bmN0aW9uKCBzdHJpbmdNYXA6IE1heWJlSGFzQVN0cmluZ1ZhbHVlLCBpc1JUTDogYm9vbGVhbiwgYXNzZXJ0Tm9XaGl0ZXNwYWNlPzogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBDaGlwcGVyU3RyaW5nVXRpbHMuZm9yRWFjaFN0cmluZyggc3RyaW5nTWFwLCAoIGtleSwgc3RyaW5nT2JqZWN0ICkgPT4ge1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0Tm9XaGl0ZXNwYWNlICYmIGFzc2VydCggc3RyaW5nT2JqZWN0LnZhbHVlID09PSBzdHJpbmdPYmplY3QudmFsdWUudHJpbSgpLFxuICAgICAgICBgU3RyaW5nIHNob3VsZCBub3QgaGF2ZSB0cmFpbGluZyBvciBsZWFkaW5nIHdoaXRlc3BhY2UsIGtleTogJHtrZXl9LCB2YWx1ZTogXCIke3N0cmluZ09iamVjdC52YWx1ZX1cImAgKTtcblxuICAgICAgLy8gcmVtb3ZlIGxlYWRpbmcvdHJhaWxpbmcgd2hpdGVzcGFjZSwgc2VlIGNoaXBwZXIjNjE5LiBEbyB0aGlzIGJlZm9yZSBhZGREaXJlY3Rpb25hbEZvcm1hdHRpbmdcbiAgICAgIHN0cmluZ09iamVjdC52YWx1ZSA9IENoaXBwZXJTdHJpbmdVdGlscy5hZGREaXJlY3Rpb25hbEZvcm1hdHRpbmcoIHN0cmluZ09iamVjdC52YWx1ZS50cmltKCksIGlzUlRMICk7XG4gICAgfSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGtleSwgZ2V0IHRoZSBhcHByb3ByaWF0ZSBzdHJpbmcgZnJvbSB0aGUgXCJtYXBcIiBvYmplY3QsIG9yIG51bGwgaWYgdGhlIGtleSBkb2VzIG5vdCBhcHBlYXIgaW4gdGhlIG1hcC5cbiAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGluIHVuYnVpbHQgbW9kZSBmcm9tIHRoZSBzdHJpbmcgcGx1Z2luIGFuZCBkdXJpbmcgdGhlIGJ1aWxkIHZpYSBDSElQUEVSL2dldFN0cmluZ0ZpbGVNYXAuXG4gICAqIFRoaXMgbWV0aG9kIHN1cHBvcnRzIHJlY3Vyc2luZyB0aHJvdWdoIGtleXMgdGhhdCBzdXBwb3J0IHN0cmluZyBuZXN0aW5nLiBUaGlzIG1ldGhvZCB3YXMgY3JlYXRlZCB0byBzdXBwb3J0XG4gICAqIG5lc3RlZCBzdHJpbmcga2V5cyBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcm9zZXR0YS9pc3N1ZXMvMTkzXG4gICAqIEBwYXJhbSBtYXAgLSB3aGVyZSBhbiBcImludGVybWVkaWF0ZVwiIE9iamVjdCBzaG91bGQgaG9sZCBuZXN0ZWQgc3RyaW5nc1xuICAgKiBAcGFyYW0ga2V5IC0gbGlrZSBgRlJJQ1RJT04vZnJpY3Rpb24udGl0bGVgIG9yIHVzaW5nIG5lc3RpbmcgbGlrZSBgYTExeS5uZXN0ZWQuc3RyaW5nLmhlcmVgXG4gICAqIEByZXR1cm5zIC0gdGhlIHN0cmluZyBlbnRyeSBvZiB0aGUga2V5LCBvciBudWxsIGlmIHRoZSBrZXkgZG9lcyBub3QgYXBwZWFyIGluIHRoZSBtYXBcbiAgICogQHRocm93cyAge0Vycm9yfSAtIGlmIHRoZSBrZXkgZG9lc24ndCBob2xkIGEgc3RyaW5nIHZhbHVlIGluIHRoZSBtYXBcbiAgICovXG4gIGdldFN0cmluZ0VudHJ5RnJvbU1hcCggbWFwOiBTdHJpbmdGaWxlTWFwLCBrZXk6IHN0cmluZyApOiBTdHJpbmdPYmplY3QgfCBudWxsIHtcblxuICAgIGlmICgga2V5LmluY2x1ZGVzKCBOQU1FU1BBQ0VfUFJFRklYX0RJVklERVIgKSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ2dldFN0cmluZ0VudHJ5RnJvbU1hcCBrZXkgc2hvdWxkIG5vdCBoYXZlIFJFUE8vJyApO1xuICAgIH1cblxuICAgIC8vIExvZGFzaCBnaXZlcyBwcmVjZWRlbmNlIHRvICBcImtleTEua2V5MlwiIG92ZXIgXCJrZXkxOntrZXkyfVwiLCBzbyB3ZSBkbyB0b28uXG4gICAgY29uc3QgcmVzdWx0ID0gXy5hdCggbWFwLCBrZXkgKVsgMCBdO1xuICAgIGlmICggcmVzdWx0ICkge1xuICAgICAgaWYgKCByZXN1bHQudmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgbm8gdmFsdWUgZm9yIHN0cmluZzogJHtrZXl9YCApO1xuICAgICAgfVxuICAgICAgaWYgKCB0eXBlb2YgcmVzdWx0LnZhbHVlICE9PSAnc3RyaW5nJyApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdmFsdWUgc2hvdWxkIGJlIGEgc3RyaW5nIGZvciBrZXkgJHtrZXl9YCApO1xuICAgICAgfVxuXG4gICAgICAvLyBVbnRpbCByb3NldHRhIHN1cHBvcnRzIG5lc3RlZCBzdHJpbmdzIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yb3NldHRhL2lzc3Vlcy8yMTUsIGtlZXAgdGhpcyBhc3NlcnRpb24uXG4gICAgICAvLyBUaGlzIHNob3VsZCBiZSBhZnRlciBiZWNhdXNlIHRoZSBhYm92ZSBlcnJvcnMgYXJlIG1vcmUgc3BlY2lmaWMuIFRoaXMgaXMgYmV0dGVyIGFzIGEgZmFsbGJhY2suXG4gICAgICBhc3NlcnQgJiYgIUNoaXBwZXJTdHJpbmdVdGlscy5pc0ExMXlTdHJpbmdLZXkoIGtleSApICYmIGFzc2VydCggbWFwWyBrZXkgXSxcbiAgICAgICAgYG5lc3RlZCBzdHJpbmdzIGFyZSBub3QgYWxsb3dlZCBvdXRzaWRlIG9mIGExMXkgc3RyaW5nIG9iamVjdCBmb3Iga2V5OiAke2tleX1gICk7XG5cbiAgICAgIHJldHVybiByZXN1bHQgYXMgU3RyaW5nT2JqZWN0O1xuICAgIH1cblxuICAgIC8vIFRoZXkga2V5IGRvZXMgbm90IGFwcGVhciBpbiB0aGUgbWFwXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSBrZXkgLSB3aXRob3V0IFwic3RyaW5nIVJFUE9cIiBhdCB0aGUgYmVnaW5uaW5nLCBqdXN0IHRoZSBhY3R1YWwgXCJzdHJpbmcga2V5XCJcbiAgICovXG4gIGlzQTExeVN0cmluZ0tleSgga2V5OiBzdHJpbmcgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGtleS5zdGFydHNXaXRoKCBDaGlwcGVyU3RyaW5nVXRpbHMuQTExWV9NQVJLRVIgKTtcbiAgfSxcblxuICAvKipcbiAgICogVGhlIHN0YXJ0IG9mIGFueSBhMTF5IHNwZWNpZmljIHN0cmluZyBrZXkuXG4gICAqL1xuICBBMTFZX01BUktFUjogQTExWV9NQVJLRVIsXG5cbiAgLyoqXG4gICAqIENhbGwgYSBmdW5jdGlvbiBvbiBlYWNoIG9iamVjdCB3aXRoIGEgXCJ2YWx1ZVwiIGF0dHJpYnV0ZSBpbiBhbiBvYmplY3QgdHJlZS5cbiAgICogQHBhcmFtIG1hcCAtIHN0cmluZyBtYXAsIGxpa2UgYSBsb2FkZWQgSlNPTiBzdHJpbmdzIGZpbGVcbiAgICogQHBhcmFtIGZ1bmNcbiAgICogQHBhcmFtIGtleVNvRmFyIC0gd2hpbGUgcmVjdXJzaW5nLCBidWlsZCB1cCBhIHN0cmluZyBvZiB0aGUga2V5IHNlcGFyYXRlZCB3aXRoIGRvdHMuXG4gICAqL1xuICBmb3JFYWNoU3RyaW5nKCBtYXA6IE1heWJlSGFzQVN0cmluZ1ZhbHVlLCBmdW5jOiAoIGtleTogc3RyaW5nLCBzdHJpbmdPYmplY3Q6IFN0cmluZ09iamVjdCApID0+IHZvaWQsIGtleVNvRmFyID0gJycgKTogdm9pZCB7XG4gICAgZm9yICggY29uc3Qga2V5IGluIG1hcCApIHtcbiAgICAgIGlmICggbWFwLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcbiAgICAgICAgY29uc3QgbmV4dEtleSA9IGtleVNvRmFyID8gYCR7a2V5U29GYXJ9LiR7a2V5fWAgOiBrZXk7IC8vIGRvbid0IHN0YXJ0IHdpdGggcGVyaW9kLCBhc3N1bWVzICcnIGlzIGZhbHNleVxuICAgICAgICBjb25zdCBzdHJpbmdPYmplY3QgPSBtYXBbIGtleSBdO1xuXG4gICAgICAgIC8vIG5vIG5lZWQgdG8gc3VwcG9ydCBub24tb2JqZWN0LCBudWxsLCBvciBhcnJheXMgaW4gdGhlIHN0cmluZyBtYXAsIGZvciBleGFtcGxlIHN0cmluZ09iamVjdC5oaXN0b3J5IGluXG4gICAgICAgIC8vIGxvY2FsZSBzcGVjaWZpYyBmaWxlcy5cbiAgICAgICAgaWYgKCB0eXBlb2Ygc3RyaW5nT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBzdHJpbmdPYmplY3QgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheSggc3RyaW5nT2JqZWN0ICkgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBzdHJpbmdPYmplY3QudmFsdWUgKSB7XG4gICAgICAgICAgZnVuYyggbmV4dEtleSwgc3RyaW5nT2JqZWN0IGFzIFN0cmluZ09iamVjdCApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVjdXJzZSB0byB0aGUgbmV4dCBsZXZlbCBzaW5jZSBpZiBpdCB3YXNuJ3QgdGhlIGB2YWx1ZWAga2V5XG4gICAgICAgIGtleSAhPT0gJ3ZhbHVlJyAmJiBDaGlwcGVyU3RyaW5nVXRpbHMuZm9yRWFjaFN0cmluZyggc3RyaW5nT2JqZWN0IGFzIE1heWJlSGFzQVN0cmluZ1ZhbHVlLCBmdW5jLCBuZXh0S2V5ICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vLyBUT0RPOiBCYWQgbmFtZSBjZW50cmFsLCBwbGVhc2UgaGVscCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTUzN1xudHlwZSBWYWx1ZVN0cmluZyA9IHsgdmFsdWU/OiBzdHJpbmcgfTtcblxuLy8gQW4gb2JqZWN0IHRoYXQgaGFzIGEgXCJ2YWx1ZVwiIGZpZWxkIHRoYXQgaG9sZHMgdGhlIHN0cmluZy4gSXQgY2FuIHN0aWxsIGluY2x1ZGUgbW9yZSBuZXN0ZWQgYFN0cmluZ09iamVjdGBzLlxudHlwZSBNYXliZUhhc0FTdHJpbmdWYWx1ZSA9IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvY29uc2lzdGVudC1pbmRleGVkLW9iamVjdC1zdHlsZVxuXG4gIC8vIEVhY2ggc3RyaW5nIGlzIGEgY29tcG9uZW50IG5hbWUgb2YgYSBQaGV0aW9JRFxuICBbIG5hbWU6IHN0cmluZyBdOiBTdHJpbmdGaWxlTWFwTm9kZTtcbn0gJiBWYWx1ZVN0cmluZztcblxuLy8gRWFjaCBTdHJpbmdGaWxlTWFwTm9kZSBzaG91bGQgaGF2ZSBhdCBsZWFzdCBvbmUgU3RyaW5nT2JqZWN0IG5lc3RlZCBpbnNpZGUgaXQuXG50eXBlIFN0cmluZ0ZpbGVNYXBOb2RlID0gTWF5YmVIYXNBU3RyaW5nVmFsdWUgfCBSZXF1aXJlZDxWYWx1ZVN0cmluZz47XG50eXBlIFN0cmluZ09iamVjdCA9IFN0cmluZ0ZpbGVNYXBOb2RlICYgUmVxdWlyZWQ8VmFsdWVTdHJpbmc+O1xuXG5leHBvcnQgdHlwZSBTdHJpbmdGaWxlTWFwID0gUmVjb3JkPHN0cmluZywgU3RyaW5nRmlsZU1hcE5vZGU+O1xuXG5cbmV4cG9ydCBkZWZhdWx0IENoaXBwZXJTdHJpbmdVdGlsczsiXSwibmFtZXMiOlsiYXNzZXJ0IiwiXyIsIk5BTUVTUEFDRV9QUkVGSVhfRElWSURFUiIsIkExMVlfTUFSS0VSIiwiQ2hpcHBlclN0cmluZ1V0aWxzIiwiYWRkRGlyZWN0aW9uYWxGb3JtYXR0aW5nIiwic3RyIiwiaXNSVEwiLCJsZW5ndGgiLCJwYWRTdHJpbmciLCJuIiwicmVwbGFjZUFsbCIsImZpbmQiLCJyZXBsYWNlV2l0aCIsInJlcGxhY2UiLCJSZWdFeHAiLCJyZXBsYWNlRmlyc3QiLCJpZHgiLCJpbmRleE9mIiwiaW5jbHVkZXMiLCJzbGljZSIsInJlcGxhY2VQbGFjZWhvbGRlcnMiLCJtYXBwaW5nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJyZXBsYWNlbWVudCIsImluZGV4IiwiRXJyb3IiLCJmb3JtYXRTdHJpbmdWYWx1ZXMiLCJzdHJpbmdNYXAiLCJhc3NlcnROb1doaXRlc3BhY2UiLCJmb3JFYWNoU3RyaW5nIiwic3RyaW5nT2JqZWN0IiwidmFsdWUiLCJ0cmltIiwiZ2V0U3RyaW5nRW50cnlGcm9tTWFwIiwibWFwIiwicmVzdWx0IiwiYXQiLCJ1bmRlZmluZWQiLCJpc0ExMXlTdHJpbmdLZXkiLCJzdGFydHNXaXRoIiwiZnVuYyIsImtleVNvRmFyIiwiaGFzT3duUHJvcGVydHkiLCJuZXh0S2V5IiwiQXJyYXkiLCJpc0FycmF5Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FDRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsT0FBTyxTQUFTO0FBRXZCLCtGQUErRjtBQUMvRixNQUFNQywyQkFBMkI7QUFDakMsTUFBTUMsY0FBYztBQUVwQixNQUFNQyxxQkFBcUI7SUFFekI7Ozs7O0dBS0MsR0FDREMsMEJBQTBCLFNBQVVDLEdBQVcsRUFBRUMsS0FBYztRQUM3RCxJQUFLRCxJQUFJRSxNQUFNLEdBQUcsR0FBSTtZQUNwQixPQUFPLEdBQUcsQUFBRUQsQ0FBQUEsUUFBUSxXQUFXLFFBQU8sSUFBTUQsSUFBSSxNQUFNLENBQUM7UUFDekQsT0FDSztZQUNILE9BQU9BO1FBQ1Q7SUFDRjtJQUVBOzs7Ozs7R0FNQyxHQUNERyxXQUFXLFNBQVVILEdBQVcsRUFBRUksQ0FBUztRQUN6QyxNQUFRSixJQUFJRSxNQUFNLEdBQUdFLEVBQUk7WUFDdkJKLE9BQU87UUFDVDtRQUNBLE9BQU9BO0lBQ1Q7SUFFQTs7Ozs7OztHQU9DLEdBQ0RLLFlBQVksU0FBVUwsR0FBVyxFQUFFTSxJQUFZLEVBQUVDLFdBQW1CO1FBQ2xFLE9BQU9QLElBQUlRLE9BQU8sQ0FBRSxJQUFJQyxPQUFRSCxLQUFLRSxPQUFPLENBQUUseUJBQXlCLFNBQVUsTUFBT0Q7SUFDMUY7SUFFQSx5SEFBeUg7SUFDekg7Ozs7Ozs7R0FPQyxHQUNERyxjQUFjLFNBQVVWLEdBQVcsRUFBRU0sSUFBWSxFQUFFQyxXQUFtQjtRQUNwRSxNQUFNSSxNQUFNWCxJQUFJWSxPQUFPLENBQUVOO1FBQ3pCLElBQUtOLElBQUlhLFFBQVEs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