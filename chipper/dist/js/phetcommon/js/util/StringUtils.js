// Copyright 2013-2024, University of Colorado Boulder
/**
 * Collection of utility functions related to Strings.
 * @author Sam Reid (PhET Interactive Simulations)
 */ import phetcommon from '../phetcommon.js';
// Unicode embedding marks that we use.
const LTR = '\u202a';
const RTL = '\u202b';
const POP = '\u202c';
const StringUtils = {
    /**
   * NOTE: Please use StringUtils.fillIn instead of this function.
   *
   * http://mobzish.blogspot.com/2008/10/simple-messageformat-for-javascript.html
   * Similar to Java's MessageFormat, supports simple substitution, simple substitution only.
   * The full MessageFormat specification allows conditional formatting, for example to support pluralisation.
   *
   * Example:
   * > StringUtils.format( '{0} + {1}', 2, 3 )
   * "2 + 3"
   *
   * @param {string} pattern pattern string, with N placeholders, where N is an integer
   * @returns {string}
   * @public
   * @deprecated - please use StringUtils.fillIn
   */ format: function(pattern) {
        // eslint-disable-next-line prefer-rest-params
        const args = arguments;
        return pattern.replace(/{(\d)}/g, (r, n)=>args[+n + 1]);
    },
    /**
   * Fills in a set of placeholders in a template.
   * Placeholders are specified with pairs of curly braces, e.g. '{{name}} is {{age}} years old'
   * See https://github.com/phetsims/phetcommon/issues/36
   *
   * Example:
   * > StringUtils.fillIn( '{{name}} is {{age}} years old', { name: 'Fred', age: 23 } )
   * "Fred is 23 years old"
   *
   * @param {string|TReadOnlyProperty<string>} template - the template, containing zero or more placeholders
   * @param {Object} values - a hash whose keys correspond to the placeholder names, e.g. { name: 'Fred', age: 23 }
   *                          Unused keys are silently ignored. All placeholders do not need to be filled.
   * @returns {string}
   * @public
   */ fillIn: function(template, values) {
        template = template && template.get ? template.get() : template;
        assert && assert(typeof template === 'string', `invalid template: ${template}`);
        // To catch attempts to use StringUtils.fillIn like StringUtils.format
        assert && assert(values && typeof values === 'object', `invalid values: ${values}`);
        let newString = template;
        // {string[]} parse out the set of placeholders
        const placeholders = template.match(/\{\{[^{}]+\}\}/g) || [];
        // replace each placeholder with its corresponding value
        for(let i = 0; i < placeholders.length; i++){
            const placeholder = placeholders[i];
            // key is the portion of the placeholder between the curly braces
            const key = placeholder.replace('{{', '').replace('}}', '');
            if (values[key] !== undefined) {
                // Support Properties as values
                const valueString = values[key] && values[key].get ? values[key].get() : values[key];
                newString = newString.replace(placeholder, valueString);
            }
        }
        return newString;
    },
    /**
   * @public
   * @returns {boolean} - Whether this length-1 string is equal to one of the three directional embedding marks used.
   */ isEmbeddingMark: function(chr) {
        return chr === LTR || chr === RTL || chr === POP;
    },
    /**
   * Given a string with embedding marks, this function returns an equivalent string.slice() but prefixes and suffixes
   * the string with the embedding marks needed to ensure things have the correct LTR/RTL order.
   * @public
   *
   * For example, with a test string:
   *
   * embeddedDebugString( '\u202a\u202bhi\u202c\u202c' )
   * === "[LTR][RTL]hi[POP][POP]"
   *
   * We could grab the first word, and it adds the ending POP:
   * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 0, 6 ) )
   * === "[LTR]first[POP]"
   *
   * Or the second word:
   * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 6, 14 ) )
   * === "[RTL]second[POP]"
   *
   * Or a custom range:
   * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 3, -3 ) )
   * === "[LTR]rst[RTL]second[POP]thi[POP]"
   *
   * @param {string} string - The main source string to slice from
   * @param {number} startIndex - The starting index where the slice starts (includes char at this index)
   * @param {number} [endIndex] - The ending index where the slice stops (does NOT include char at this index)
   * @returns {string} - The sliced string, with embedding marks added at hte start and end.
   */ embeddedSlice: function(string, startIndex, endIndex) {
        // {Array.<string>} - array of LTR/RTL embedding marks that are currently on the stack for the current location.
        const stack = [];
        let chr;
        if (endIndex === undefined) {
            endIndex = string.length;
        }
        if (endIndex < 0) {
            endIndex += string.length;
        }
        // To avoid returning an extra adjacent [LTR][POP] or [RTL][POP], we can move the start forward and the
        // end backwards as long as they are over embedding marks to avoid this.
        while(startIndex < string.length && StringUtils.isEmbeddingMark(string.charAt(startIndex))){
            startIndex++;
        }
        while(endIndex >= 1 && StringUtils.isEmbeddingMark(string.charAt(endIndex - 1))){
            endIndex--;
        }
        // If our string will be empty, just bail out.
        if (startIndex >= endIndex || startIndex >= string.length) {
            return '';
        }
        // Walk up to the start of the string
        for(let i = 0; i < startIndex; i++){
            chr = string.charAt(i);
            if (chr === LTR || chr === RTL) {
                stack.push(chr);
            } else if (chr === POP) {
                stack.pop();
            }
        }
        // Will store the minimum stack size during our slice. This allows us to turn [LTR][RTL]boo[POP][POP] into
        // [RTL]boo[POP] by skipping the "outer" layers.
        let minimumStackSize = stack.length;
        // Save our initial stack for prefix computation
        let startStack = stack.slice();
        // A normal string slice
        const slice = string.slice(startIndex, endIndex);
        // Walk through the sliced string, to determine what we need for the suffix
        for(let j = 0; j < slice.length; j++){
            chr = slice.charAt(j);
            if (chr === LTR || chr === RTL) {
                stack.push(chr);
            } else if (chr === POP) {
                stack.pop();
                minimumStackSize = Math.min(stack.length, minimumStackSize);
            }
        }
        // Our ending stack for suffix computation
        let endStack = stack;
        // Always leave one stack level on top
        const numSkippedStackLevels = Math.max(0, minimumStackSize - 1);
        startStack = startStack.slice(numSkippedStackLevels);
        endStack = endStack.slice(numSkippedStackLevels);
        // Our prefix will be the embedding marks that have been skipped and not popped.
        const prefix = startStack.join('');
        // Our suffix includes one POP for each embedding mark currently on the stack
        const suffix = endStack.join('').replace(/./g, POP);
        return prefix + slice + suffix;
    },
    /**
   * String's split() API, but uses embeddedSlice() on the extracted strings.
   * @public
   *
   * For example, given a string:
   *
   * StringUtils.embeddedDebugString( '\u202aHello  there, \u202bHow are you\u202c doing?\u202c' );
   * === "[LTR]Hello  there, [RTL]How are you[POP] doing?[POP]"
   *
   * Using embeddedSplit with a regular expression matching a sequence of spaces:
   * StringUtils.embeddedSplit( '\u202aHello  there, \u202bHow are you\u202c doing?\u202c', / +/ )
   *            .map( StringUtils.embeddedDebugString );
   * === [ "[LTR]Hello[POP]",
   *       "[LTR]there,[POP]",
   *       "[RTL]How[POP]",
   *       "[RTL]are[POP]",
   *       "[RTL]you[POP]",
   *       "[LTR]doing?[POP]" ]
   */ embeddedSplit: function(string, separator, limit) {
        // Matching split API
        if (separator === undefined) {
            return [
                string
            ];
        }
        // {Array.<string>} - What we will push to and return.
        let result = [];
        // { index: {number}, length: {number} } - Last result of findSeparatorMatch()
        let separatorMatch;
        // Remaining part of the string to split up. Will have substrings removed from the start.
        let stringToSplit = string;
        // Finds the index and length of the first substring of stringToSplit that matches the separator (string or regex)
        // and returns an object with the type  { index: {number}, length: {number} }.
        // If index === -1, there was no match for the separator.
        function findSeparatorMatch() {
            let index;
            let length;
            if (separator instanceof window.RegExp) {
                const match = stringToSplit.match(separator);
                if (match) {
                    index = match.index;
                    length = match[0].length;
                } else {
                    index = -1;
                }
            } else {
                assert && assert(typeof separator === 'string');
                index = stringToSplit.indexOf(separator);
                length = separator.length;
            }
            return {
                index: index,
                length: length
            };
        }
        // Loop until we run out of matches for the separator. For each separator match, stringToSplit for the next
        // iteration will have everything up to the end of the separator match chopped off. The indexOffset variable
        // stores how many characters we have chopped off in this fashion, so that we can index into the original string.
        let indexOffset = 0;
        while((separatorMatch = findSeparatorMatch()).index >= 0){
            // Extract embedded slice from the original, up until the separator match
            result.push(StringUtils.embeddedSlice(string, indexOffset, indexOffset + separatorMatch.index));
            // Handle chopping off the section of stringToSplit, so we can do simple matching in findSeparatorMatch()
            const offset = separatorMatch.index + separatorMatch.length;
            stringToSplit = stringToSplit.slice(offset);
            indexOffset += offset;
        }
        // Embedded slice for after the last match. May be an empty string.
        result.push(StringUtils.embeddedSlice(string, indexOffset));
        // Matching split API
        if (limit !== undefined) {
            assert && assert(typeof limit === 'number');
            result = _.first(result, limit);
        }
        return result;
    },
    /**
   * Replaces embedding mark characters with visible strings. Useful for debugging for strings with embedding marks.
   * @public
   *
   * @param {string} string
   * @returns {string} - With embedding marks replaced.
   */ embeddedDebugString: function(string) {
        return string.replace(/\u202a/g, '[LTR]').replace(/\u202b/g, '[RTL]').replace(/\u202c/g, '[POP]');
    },
    /**
   * Wraps a string with embedding marks for LTR display.
   * @public
   *
   * @param {string} string
   * @returns {string}
   */ wrapLTR: function(string) {
        return LTR + string + POP;
    },
    /**
   * Wraps a string with embedding marks for RTL display.
   * @public
   *
   * @param {string} string
   * @returns {string}
   */ wrapRTL: function(string) {
        return RTL + string + POP;
    },
    /**
   * Wraps a string with embedding marks for LTR/RTL display, depending on the direction
   * @public
   *
   * @param {string} string
   * @param {string} direction - either 'ltr' or 'rtl'
   * @returns {string}
   */ wrapDirection: function(string, direction) {
        assert && assert(direction === 'ltr' || direction === 'rtl');
        if (direction === 'ltr') {
            return StringUtils.wrapLTR(string);
        } else {
            return StringUtils.wrapRTL(string);
        }
    },
    /**
   * Given a locale, e.g. 'es', provides the localized name, e.g. 'Español'
   *
   * @param {string} locale
   * @returns {string}
   */ localeToLocalizedName: function(locale) {
        assert && assert(phet.chipper.localeData[locale], 'locale needs to be a valid locale code defined in localeData');
        return StringUtils.wrapDirection(phet.chipper.localeData[locale].localizedName, phet.chipper.localeData[locale].direction);
    },
    /**
   * Capitalize the first letter of the given string.  This will skip control characters and whitespace at the beginning
   * of a string.  If the letter is already capitalized the returned string will match the provided one.  Strings that
   * start with numbers, such as "1 of these things" will be essentially unchanged too.
   *
   * This will only work reliably for English strings.
   *
   * @param {string} str
   * @returns {string}
   * @public
   */ capitalize (str) {
        // Find the index of the first character that can be capitalized.  Control characters and whitespace are skipped.
        const firstCharIndex = str.search(/[A-Za-z0-9]/);
        if (firstCharIndex === -1) {
            // No characters were found in the string that can be capitalized, so return an unchanged copy.
            return str.slice(0);
        }
        // Break the string apart and capitalize the identified character.
        const preChangeString = firstCharIndex > 0 ? str.slice(0, firstCharIndex) : '';
        const capitalizedCharacter = str.charAt(firstCharIndex).toUpperCase();
        const postChangeString = firstCharIndex + 1 < str.length ? str.slice(firstCharIndex + 1) : '';
        return preChangeString + capitalizedCharacter + postChangeString;
    }
};
phetcommon.register('StringUtils', StringUtils);
export default StringUtils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb2xsZWN0aW9uIG9mIHV0aWxpdHkgZnVuY3Rpb25zIHJlbGF0ZWQgdG8gU3RyaW5ncy5cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHBoZXRjb21tb24gZnJvbSAnLi4vcGhldGNvbW1vbi5qcyc7XG5cbi8vIFVuaWNvZGUgZW1iZWRkaW5nIG1hcmtzIHRoYXQgd2UgdXNlLlxuY29uc3QgTFRSID0gJ1xcdTIwMmEnO1xuY29uc3QgUlRMID0gJ1xcdTIwMmInO1xuY29uc3QgUE9QID0gJ1xcdTIwMmMnO1xuXG5jb25zdCBTdHJpbmdVdGlscyA9IHtcblxuICAvKipcbiAgICogTk9URTogUGxlYXNlIHVzZSBTdHJpbmdVdGlscy5maWxsSW4gaW5zdGVhZCBvZiB0aGlzIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBodHRwOi8vbW9iemlzaC5ibG9nc3BvdC5jb20vMjAwOC8xMC9zaW1wbGUtbWVzc2FnZWZvcm1hdC1mb3ItamF2YXNjcmlwdC5odG1sXG4gICAqIFNpbWlsYXIgdG8gSmF2YSdzIE1lc3NhZ2VGb3JtYXQsIHN1cHBvcnRzIHNpbXBsZSBzdWJzdGl0dXRpb24sIHNpbXBsZSBzdWJzdGl0dXRpb24gb25seS5cbiAgICogVGhlIGZ1bGwgTWVzc2FnZUZvcm1hdCBzcGVjaWZpY2F0aW9uIGFsbG93cyBjb25kaXRpb25hbCBmb3JtYXR0aW5nLCBmb3IgZXhhbXBsZSB0byBzdXBwb3J0IHBsdXJhbGlzYXRpb24uXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqID4gU3RyaW5nVXRpbHMuZm9ybWF0KCAnezB9ICsgezF9JywgMiwgMyApXG4gICAqIFwiMiArIDNcIlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVybiBwYXR0ZXJuIHN0cmluZywgd2l0aCBOIHBsYWNlaG9sZGVycywgd2hlcmUgTiBpcyBhbiBpbnRlZ2VyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqIEBwdWJsaWNcbiAgICogQGRlcHJlY2F0ZWQgLSBwbGVhc2UgdXNlIFN0cmluZ1V0aWxzLmZpbGxJblxuICAgKi9cbiAgZm9ybWF0OiBmdW5jdGlvbiggcGF0dGVybiApIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXG4gICAgY29uc3QgYXJncyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gcGF0dGVybi5yZXBsYWNlKCAveyhcXGQpfS9nLCAoIHIsIG4gKSA9PiBhcmdzWyArbiArIDEgXSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBGaWxscyBpbiBhIHNldCBvZiBwbGFjZWhvbGRlcnMgaW4gYSB0ZW1wbGF0ZS5cbiAgICogUGxhY2Vob2xkZXJzIGFyZSBzcGVjaWZpZWQgd2l0aCBwYWlycyBvZiBjdXJseSBicmFjZXMsIGUuZy4gJ3t7bmFtZX19IGlzIHt7YWdlfX0geWVhcnMgb2xkJ1xuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXRjb21tb24vaXNzdWVzLzM2XG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqID4gU3RyaW5nVXRpbHMuZmlsbEluKCAne3tuYW1lfX0gaXMge3thZ2V9fSB5ZWFycyBvbGQnLCB7IG5hbWU6ICdGcmVkJywgYWdlOiAyMyB9IClcbiAgICogXCJGcmVkIGlzIDIzIHllYXJzIG9sZFwiXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfFRSZWFkT25seVByb3BlcnR5PHN0cmluZz59IHRlbXBsYXRlIC0gdGhlIHRlbXBsYXRlLCBjb250YWluaW5nIHplcm8gb3IgbW9yZSBwbGFjZWhvbGRlcnNcbiAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlcyAtIGEgaGFzaCB3aG9zZSBrZXlzIGNvcnJlc3BvbmQgdG8gdGhlIHBsYWNlaG9sZGVyIG5hbWVzLCBlLmcuIHsgbmFtZTogJ0ZyZWQnLCBhZ2U6IDIzIH1cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIFVudXNlZCBrZXlzIGFyZSBzaWxlbnRseSBpZ25vcmVkLiBBbGwgcGxhY2Vob2xkZXJzIGRvIG5vdCBuZWVkIHRvIGJlIGZpbGxlZC5cbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZmlsbEluOiBmdW5jdGlvbiggdGVtcGxhdGUsIHZhbHVlcyApIHtcbiAgICB0ZW1wbGF0ZSA9ICggdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0ICkgPyB0ZW1wbGF0ZS5nZXQoKSA6IHRlbXBsYXRlO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0ZW1wbGF0ZSA9PT0gJ3N0cmluZycsIGBpbnZhbGlkIHRlbXBsYXRlOiAke3RlbXBsYXRlfWAgKTtcblxuICAgIC8vIFRvIGNhdGNoIGF0dGVtcHRzIHRvIHVzZSBTdHJpbmdVdGlscy5maWxsSW4gbGlrZSBTdHJpbmdVdGlscy5mb3JtYXRcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZXMgJiYgdHlwZW9mIHZhbHVlcyA9PT0gJ29iamVjdCcsIGBpbnZhbGlkIHZhbHVlczogJHt2YWx1ZXN9YCApO1xuXG4gICAgbGV0IG5ld1N0cmluZyA9IHRlbXBsYXRlO1xuXG4gICAgLy8ge3N0cmluZ1tdfSBwYXJzZSBvdXQgdGhlIHNldCBvZiBwbGFjZWhvbGRlcnNcbiAgICBjb25zdCBwbGFjZWhvbGRlcnMgPSB0ZW1wbGF0ZS5tYXRjaCggL1xce1xce1tee31dK1xcfVxcfS9nICkgfHwgW107XG5cbiAgICAvLyByZXBsYWNlIGVhY2ggcGxhY2Vob2xkZXIgd2l0aCBpdHMgY29ycmVzcG9uZGluZyB2YWx1ZVxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBsYWNlaG9sZGVycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gcGxhY2Vob2xkZXJzWyBpIF07XG5cbiAgICAgIC8vIGtleSBpcyB0aGUgcG9ydGlvbiBvZiB0aGUgcGxhY2Vob2xkZXIgYmV0d2VlbiB0aGUgY3VybHkgYnJhY2VzXG4gICAgICBjb25zdCBrZXkgPSBwbGFjZWhvbGRlci5yZXBsYWNlKCAne3snLCAnJyApLnJlcGxhY2UoICd9fScsICcnICk7XG4gICAgICBpZiAoIHZhbHVlc1sga2V5IF0gIT09IHVuZGVmaW5lZCApIHtcblxuICAgICAgICAvLyBTdXBwb3J0IFByb3BlcnRpZXMgYXMgdmFsdWVzXG4gICAgICAgIGNvbnN0IHZhbHVlU3RyaW5nID0gKCB2YWx1ZXNbIGtleSBdICYmIHZhbHVlc1sga2V5IF0uZ2V0ICkgPyB2YWx1ZXNbIGtleSBdLmdldCgpIDogdmFsdWVzWyBrZXkgXTtcbiAgICAgICAgbmV3U3RyaW5nID0gbmV3U3RyaW5nLnJlcGxhY2UoIHBsYWNlaG9sZGVyLCB2YWx1ZVN0cmluZyApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXdTdHJpbmc7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciB0aGlzIGxlbmd0aC0xIHN0cmluZyBpcyBlcXVhbCB0byBvbmUgb2YgdGhlIHRocmVlIGRpcmVjdGlvbmFsIGVtYmVkZGluZyBtYXJrcyB1c2VkLlxuICAgKi9cbiAgaXNFbWJlZGRpbmdNYXJrOiBmdW5jdGlvbiggY2hyICkge1xuICAgIHJldHVybiBjaHIgPT09IExUUiB8fCBjaHIgPT09IFJUTCB8fCBjaHIgPT09IFBPUDtcbiAgfSxcblxuICAvKipcbiAgICogR2l2ZW4gYSBzdHJpbmcgd2l0aCBlbWJlZGRpbmcgbWFya3MsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyBhbiBlcXVpdmFsZW50IHN0cmluZy5zbGljZSgpIGJ1dCBwcmVmaXhlcyBhbmQgc3VmZml4ZXNcbiAgICogdGhlIHN0cmluZyB3aXRoIHRoZSBlbWJlZGRpbmcgbWFya3MgbmVlZGVkIHRvIGVuc3VyZSB0aGluZ3MgaGF2ZSB0aGUgY29ycmVjdCBMVFIvUlRMIG9yZGVyLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCB3aXRoIGEgdGVzdCBzdHJpbmc6XG4gICAqXG4gICAqIGVtYmVkZGVkRGVidWdTdHJpbmcoICdcXHUyMDJhXFx1MjAyYmhpXFx1MjAyY1xcdTIwMmMnIClcbiAgICogPT09IFwiW0xUUl1bUlRMXWhpW1BPUF1bUE9QXVwiXG4gICAqXG4gICAqIFdlIGNvdWxkIGdyYWIgdGhlIGZpcnN0IHdvcmQsIGFuZCBpdCBhZGRzIHRoZSBlbmRpbmcgUE9QOlxuICAgKiBlbWJlZGRlZERlYnVnU3RyaW5nKCBlbWJlZGRlZFNsaWNlKCAnXFx1MjAyYWZpcnN0XFx1MjAyYnNlY29uZFxcdTIwMmN0aGlyZFxcdTIwMmMnLCAwLCA2ICkgKVxuICAgKiA9PT0gXCJbTFRSXWZpcnN0W1BPUF1cIlxuICAgKlxuICAgKiBPciB0aGUgc2Vjb25kIHdvcmQ6XG4gICAqIGVtYmVkZGVkRGVidWdTdHJpbmcoIGVtYmVkZGVkU2xpY2UoICdcXHUyMDJhZmlyc3RcXHUyMDJic2Vjb25kXFx1MjAyY3RoaXJkXFx1MjAyYycsIDYsIDE0ICkgKVxuICAgKiA9PT0gXCJbUlRMXXNlY29uZFtQT1BdXCJcbiAgICpcbiAgICogT3IgYSBjdXN0b20gcmFuZ2U6XG4gICAqIGVtYmVkZGVkRGVidWdTdHJpbmcoIGVtYmVkZGVkU2xpY2UoICdcXHUyMDJhZmlyc3RcXHUyMDJic2Vjb25kXFx1MjAyY3RoaXJkXFx1MjAyYycsIDMsIC0zICkgKVxuICAgKiA9PT0gXCJbTFRSXXJzdFtSVExdc2Vjb25kW1BPUF10aGlbUE9QXVwiXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBUaGUgbWFpbiBzb3VyY2Ugc3RyaW5nIHRvIHNsaWNlIGZyb21cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgc3RhcnRpbmcgaW5kZXggd2hlcmUgdGhlIHNsaWNlIHN0YXJ0cyAoaW5jbHVkZXMgY2hhciBhdCB0aGlzIGluZGV4KVxuICAgKiBAcGFyYW0ge251bWJlcn0gW2VuZEluZGV4XSAtIFRoZSBlbmRpbmcgaW5kZXggd2hlcmUgdGhlIHNsaWNlIHN0b3BzIChkb2VzIE5PVCBpbmNsdWRlIGNoYXIgYXQgdGhpcyBpbmRleClcbiAgICogQHJldHVybnMge3N0cmluZ30gLSBUaGUgc2xpY2VkIHN0cmluZywgd2l0aCBlbWJlZGRpbmcgbWFya3MgYWRkZWQgYXQgaHRlIHN0YXJ0IGFuZCBlbmQuXG4gICAqL1xuICBlbWJlZGRlZFNsaWNlOiBmdW5jdGlvbiggc3RyaW5nLCBzdGFydEluZGV4LCBlbmRJbmRleCApIHtcbiAgICAvLyB7QXJyYXkuPHN0cmluZz59IC0gYXJyYXkgb2YgTFRSL1JUTCBlbWJlZGRpbmcgbWFya3MgdGhhdCBhcmUgY3VycmVudGx5IG9uIHRoZSBzdGFjayBmb3IgdGhlIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICBsZXQgY2hyO1xuXG4gICAgaWYgKCBlbmRJbmRleCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZW5kSW5kZXggPSBzdHJpbmcubGVuZ3RoO1xuICAgIH1cbiAgICBpZiAoIGVuZEluZGV4IDwgMCApIHtcbiAgICAgIGVuZEluZGV4ICs9IHN0cmluZy5sZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gVG8gYXZvaWQgcmV0dXJuaW5nIGFuIGV4dHJhIGFkamFjZW50IFtMVFJdW1BPUF0gb3IgW1JUTF1bUE9QXSwgd2UgY2FuIG1vdmUgdGhlIHN0YXJ0IGZvcndhcmQgYW5kIHRoZVxuICAgIC8vIGVuZCBiYWNrd2FyZHMgYXMgbG9uZyBhcyB0aGV5IGFyZSBvdmVyIGVtYmVkZGluZyBtYXJrcyB0byBhdm9pZCB0aGlzLlxuICAgIHdoaWxlICggc3RhcnRJbmRleCA8IHN0cmluZy5sZW5ndGggJiYgU3RyaW5nVXRpbHMuaXNFbWJlZGRpbmdNYXJrKCBzdHJpbmcuY2hhckF0KCBzdGFydEluZGV4ICkgKSApIHtcbiAgICAgIHN0YXJ0SW5kZXgrKztcbiAgICB9XG4gICAgd2hpbGUgKCBlbmRJbmRleCA+PSAxICYmIFN0cmluZ1V0aWxzLmlzRW1iZWRkaW5nTWFyayggc3RyaW5nLmNoYXJBdCggZW5kSW5kZXggLSAxICkgKSApIHtcbiAgICAgIGVuZEluZGV4LS07XG4gICAgfVxuXG4gICAgLy8gSWYgb3VyIHN0cmluZyB3aWxsIGJlIGVtcHR5LCBqdXN0IGJhaWwgb3V0LlxuICAgIGlmICggc3RhcnRJbmRleCA+PSBlbmRJbmRleCB8fCBzdGFydEluZGV4ID49IHN0cmluZy5sZW5ndGggKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLy8gV2FsayB1cCB0byB0aGUgc3RhcnQgb2YgdGhlIHN0cmluZ1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXJ0SW5kZXg7IGkrKyApIHtcbiAgICAgIGNociA9IHN0cmluZy5jaGFyQXQoIGkgKTtcbiAgICAgIGlmICggY2hyID09PSBMVFIgfHwgY2hyID09PSBSVEwgKSB7XG4gICAgICAgIHN0YWNrLnB1c2goIGNociApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGNociA9PT0gUE9QICkge1xuICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXaWxsIHN0b3JlIHRoZSBtaW5pbXVtIHN0YWNrIHNpemUgZHVyaW5nIG91ciBzbGljZS4gVGhpcyBhbGxvd3MgdXMgdG8gdHVybiBbTFRSXVtSVExdYm9vW1BPUF1bUE9QXSBpbnRvXG4gICAgLy8gW1JUTF1ib29bUE9QXSBieSBza2lwcGluZyB0aGUgXCJvdXRlclwiIGxheWVycy5cbiAgICBsZXQgbWluaW11bVN0YWNrU2l6ZSA9IHN0YWNrLmxlbmd0aDtcblxuICAgIC8vIFNhdmUgb3VyIGluaXRpYWwgc3RhY2sgZm9yIHByZWZpeCBjb21wdXRhdGlvblxuICAgIGxldCBzdGFydFN0YWNrID0gc3RhY2suc2xpY2UoKTtcblxuICAgIC8vIEEgbm9ybWFsIHN0cmluZyBzbGljZVxuICAgIGNvbnN0IHNsaWNlID0gc3RyaW5nLnNsaWNlKCBzdGFydEluZGV4LCBlbmRJbmRleCApO1xuXG4gICAgLy8gV2FsayB0aHJvdWdoIHRoZSBzbGljZWQgc3RyaW5nLCB0byBkZXRlcm1pbmUgd2hhdCB3ZSBuZWVkIGZvciB0aGUgc3VmZml4XG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgc2xpY2UubGVuZ3RoOyBqKysgKSB7XG4gICAgICBjaHIgPSBzbGljZS5jaGFyQXQoIGogKTtcbiAgICAgIGlmICggY2hyID09PSBMVFIgfHwgY2hyID09PSBSVEwgKSB7XG4gICAgICAgIHN0YWNrLnB1c2goIGNociApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGNociA9PT0gUE9QICkge1xuICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgbWluaW11bVN0YWNrU2l6ZSA9IE1hdGgubWluKCBzdGFjay5sZW5ndGgsIG1pbmltdW1TdGFja1NpemUgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPdXIgZW5kaW5nIHN0YWNrIGZvciBzdWZmaXggY29tcHV0YXRpb25cbiAgICBsZXQgZW5kU3RhY2sgPSBzdGFjaztcblxuICAgIC8vIEFsd2F5cyBsZWF2ZSBvbmUgc3RhY2sgbGV2ZWwgb24gdG9wXG4gICAgY29uc3QgbnVtU2tpcHBlZFN0YWNrTGV2ZWxzID0gTWF0aC5tYXgoIDAsIG1pbmltdW1TdGFja1NpemUgLSAxICk7XG4gICAgc3RhcnRTdGFjayA9IHN0YXJ0U3RhY2suc2xpY2UoIG51bVNraXBwZWRTdGFja0xldmVscyApO1xuICAgIGVuZFN0YWNrID0gZW5kU3RhY2suc2xpY2UoIG51bVNraXBwZWRTdGFja0xldmVscyApO1xuXG4gICAgLy8gT3VyIHByZWZpeCB3aWxsIGJlIHRoZSBlbWJlZGRpbmcgbWFya3MgdGhhdCBoYXZlIGJlZW4gc2tpcHBlZCBhbmQgbm90IHBvcHBlZC5cbiAgICBjb25zdCBwcmVmaXggPSBzdGFydFN0YWNrLmpvaW4oICcnICk7XG5cbiAgICAvLyBPdXIgc3VmZml4IGluY2x1ZGVzIG9uZSBQT1AgZm9yIGVhY2ggZW1iZWRkaW5nIG1hcmsgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgIGNvbnN0IHN1ZmZpeCA9IGVuZFN0YWNrLmpvaW4oICcnICkucmVwbGFjZSggLy4vZywgUE9QICk7XG5cbiAgICByZXR1cm4gcHJlZml4ICsgc2xpY2UgKyBzdWZmaXg7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFN0cmluZydzIHNwbGl0KCkgQVBJLCBidXQgdXNlcyBlbWJlZGRlZFNsaWNlKCkgb24gdGhlIGV4dHJhY3RlZCBzdHJpbmdzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBnaXZlbiBhIHN0cmluZzpcbiAgICpcbiAgICogU3RyaW5nVXRpbHMuZW1iZWRkZWREZWJ1Z1N0cmluZyggJ1xcdTIwMmFIZWxsbyAgdGhlcmUsIFxcdTIwMmJIb3cgYXJlIHlvdVxcdTIwMmMgZG9pbmc/XFx1MjAyYycgKTtcbiAgICogPT09IFwiW0xUUl1IZWxsbyAgdGhlcmUsIFtSVExdSG93IGFyZSB5b3VbUE9QXSBkb2luZz9bUE9QXVwiXG4gICAqXG4gICAqIFVzaW5nIGVtYmVkZGVkU3BsaXQgd2l0aCBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBtYXRjaGluZyBhIHNlcXVlbmNlIG9mIHNwYWNlczpcbiAgICogU3RyaW5nVXRpbHMuZW1iZWRkZWRTcGxpdCggJ1xcdTIwMmFIZWxsbyAgdGhlcmUsIFxcdTIwMmJIb3cgYXJlIHlvdVxcdTIwMmMgZG9pbmc/XFx1MjAyYycsIC8gKy8gKVxuICAgKiAgICAgICAgICAgIC5tYXAoIFN0cmluZ1V0aWxzLmVtYmVkZGVkRGVidWdTdHJpbmcgKTtcbiAgICogPT09IFsgXCJbTFRSXUhlbGxvW1BPUF1cIixcbiAgICogICAgICAgXCJbTFRSXXRoZXJlLFtQT1BdXCIsXG4gICAqICAgICAgIFwiW1JUTF1Ib3dbUE9QXVwiLFxuICAgKiAgICAgICBcIltSVExdYXJlW1BPUF1cIixcbiAgICogICAgICAgXCJbUlRMXXlvdVtQT1BdXCIsXG4gICAqICAgICAgIFwiW0xUUl1kb2luZz9bUE9QXVwiIF1cbiAgICovXG4gIGVtYmVkZGVkU3BsaXQ6IGZ1bmN0aW9uKCBzdHJpbmcsIHNlcGFyYXRvciwgbGltaXQgKSB7XG4gICAgLy8gTWF0Y2hpbmcgc3BsaXQgQVBJXG4gICAgaWYgKCBzZXBhcmF0b3IgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHJldHVybiBbIHN0cmluZyBdO1xuICAgIH1cblxuICAgIC8vIHtBcnJheS48c3RyaW5nPn0gLSBXaGF0IHdlIHdpbGwgcHVzaCB0byBhbmQgcmV0dXJuLlxuICAgIGxldCByZXN1bHQgPSBbXTtcblxuICAgIC8vIHsgaW5kZXg6IHtudW1iZXJ9LCBsZW5ndGg6IHtudW1iZXJ9IH0gLSBMYXN0IHJlc3VsdCBvZiBmaW5kU2VwYXJhdG9yTWF0Y2goKVxuICAgIGxldCBzZXBhcmF0b3JNYXRjaDtcblxuICAgIC8vIFJlbWFpbmluZyBwYXJ0IG9mIHRoZSBzdHJpbmcgdG8gc3BsaXQgdXAuIFdpbGwgaGF2ZSBzdWJzdHJpbmdzIHJlbW92ZWQgZnJvbSB0aGUgc3RhcnQuXG4gICAgbGV0IHN0cmluZ1RvU3BsaXQgPSBzdHJpbmc7XG5cbiAgICAvLyBGaW5kcyB0aGUgaW5kZXggYW5kIGxlbmd0aCBvZiB0aGUgZmlyc3Qgc3Vic3RyaW5nIG9mIHN0cmluZ1RvU3BsaXQgdGhhdCBtYXRjaGVzIHRoZSBzZXBhcmF0b3IgKHN0cmluZyBvciByZWdleClcbiAgICAvLyBhbmQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCB0aGUgdHlwZSAgeyBpbmRleDoge251bWJlcn0sIGxlbmd0aDoge251bWJlcn0gfS5cbiAgICAvLyBJZiBpbmRleCA9PT0gLTEsIHRoZXJlIHdhcyBubyBtYXRjaCBmb3IgdGhlIHNlcGFyYXRvci5cbiAgICBmdW5jdGlvbiBmaW5kU2VwYXJhdG9yTWF0Y2goKSB7XG4gICAgICBsZXQgaW5kZXg7XG4gICAgICBsZXQgbGVuZ3RoO1xuICAgICAgaWYgKCBzZXBhcmF0b3IgaW5zdGFuY2VvZiB3aW5kb3cuUmVnRXhwICkge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHN0cmluZ1RvU3BsaXQubWF0Y2goIHNlcGFyYXRvciApO1xuICAgICAgICBpZiAoIG1hdGNoICkge1xuICAgICAgICAgIGluZGV4ID0gbWF0Y2guaW5kZXg7XG4gICAgICAgICAgbGVuZ3RoID0gbWF0Y2hbIDAgXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBzZXBhcmF0b3IgPT09ICdzdHJpbmcnICk7XG5cbiAgICAgICAgaW5kZXggPSBzdHJpbmdUb1NwbGl0LmluZGV4T2YoIHNlcGFyYXRvciApO1xuICAgICAgICBsZW5ndGggPSBzZXBhcmF0b3IubGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBsZW5ndGg6IGxlbmd0aFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBMb29wIHVudGlsIHdlIHJ1biBvdXQgb2YgbWF0Y2hlcyBmb3IgdGhlIHNlcGFyYXRvci4gRm9yIGVhY2ggc2VwYXJhdG9yIG1hdGNoLCBzdHJpbmdUb1NwbGl0IGZvciB0aGUgbmV4dFxuICAgIC8vIGl0ZXJhdGlvbiB3aWxsIGhhdmUgZXZlcnl0aGluZyB1cCB0byB0aGUgZW5kIG9mIHRoZSBzZXBhcmF0b3IgbWF0Y2ggY2hvcHBlZCBvZmYuIFRoZSBpbmRleE9mZnNldCB2YXJpYWJsZVxuICAgIC8vIHN0b3JlcyBob3cgbWFueSBjaGFyYWN0ZXJzIHdlIGhhdmUgY2hvcHBlZCBvZmYgaW4gdGhpcyBmYXNoaW9uLCBzbyB0aGF0IHdlIGNhbiBpbmRleCBpbnRvIHRoZSBvcmlnaW5hbCBzdHJpbmcuXG4gICAgbGV0IGluZGV4T2Zmc2V0ID0gMDtcbiAgICB3aGlsZSAoICggc2VwYXJhdG9yTWF0Y2ggPSBmaW5kU2VwYXJhdG9yTWF0Y2goKSApLmluZGV4ID49IDAgKSB7XG4gICAgICAvLyBFeHRyYWN0IGVtYmVkZGVkIHNsaWNlIGZyb20gdGhlIG9yaWdpbmFsLCB1cCB1bnRpbCB0aGUgc2VwYXJhdG9yIG1hdGNoXG4gICAgICByZXN1bHQucHVzaCggU3RyaW5nVXRpbHMuZW1iZWRkZWRTbGljZSggc3RyaW5nLCBpbmRleE9mZnNldCwgaW5kZXhPZmZzZXQgKyBzZXBhcmF0b3JNYXRjaC5pbmRleCApICk7XG5cbiAgICAgIC8vIEhhbmRsZSBjaG9wcGluZyBvZmYgdGhlIHNlY3Rpb24gb2Ygc3RyaW5nVG9TcGxpdCwgc28gd2UgY2FuIGRvIHNpbXBsZSBtYXRjaGluZyBpbiBmaW5kU2VwYXJhdG9yTWF0Y2goKVxuICAgICAgY29uc3Qgb2Zmc2V0ID0gc2VwYXJhdG9yTWF0Y2guaW5kZXggKyBzZXBhcmF0b3JNYXRjaC5sZW5ndGg7XG4gICAgICBzdHJpbmdUb1NwbGl0ID0gc3RyaW5nVG9TcGxpdC5zbGljZSggb2Zmc2V0ICk7XG4gICAgICBpbmRleE9mZnNldCArPSBvZmZzZXQ7XG4gICAgfVxuXG4gICAgLy8gRW1iZWRkZWQgc2xpY2UgZm9yIGFmdGVyIHRoZSBsYXN0IG1hdGNoLiBNYXkgYmUgYW4gZW1wdHkgc3RyaW5nLlxuICAgIHJlc3VsdC5wdXNoKCBTdHJpbmdVdGlscy5lbWJlZGRlZFNsaWNlKCBzdHJpbmcsIGluZGV4T2Zmc2V0ICkgKTtcblxuICAgIC8vIE1hdGNoaW5nIHNwbGl0IEFQSVxuICAgIGlmICggbGltaXQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBsaW1pdCA9PT0gJ251bWJlcicgKTtcblxuICAgICAgcmVzdWx0ID0gXy5maXJzdCggcmVzdWx0LCBsaW1pdCApO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIGVtYmVkZGluZyBtYXJrIGNoYXJhY3RlcnMgd2l0aCB2aXNpYmxlIHN0cmluZ3MuIFVzZWZ1bCBmb3IgZGVidWdnaW5nIGZvciBzdHJpbmdzIHdpdGggZW1iZWRkaW5nIG1hcmtzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcbiAgICogQHJldHVybnMge3N0cmluZ30gLSBXaXRoIGVtYmVkZGluZyBtYXJrcyByZXBsYWNlZC5cbiAgICovXG4gIGVtYmVkZGVkRGVidWdTdHJpbmc6IGZ1bmN0aW9uKCBzdHJpbmcgKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKCAvXFx1MjAyYS9nLCAnW0xUUl0nICkucmVwbGFjZSggL1xcdTIwMmIvZywgJ1tSVExdJyApLnJlcGxhY2UoIC9cXHUyMDJjL2csICdbUE9QXScgKTtcbiAgfSxcblxuICAvKipcbiAgICogV3JhcHMgYSBzdHJpbmcgd2l0aCBlbWJlZGRpbmcgbWFya3MgZm9yIExUUiBkaXNwbGF5LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHdyYXBMVFI6IGZ1bmN0aW9uKCBzdHJpbmcgKSB7XG4gICAgcmV0dXJuIExUUiArIHN0cmluZyArIFBPUDtcbiAgfSxcblxuICAvKipcbiAgICogV3JhcHMgYSBzdHJpbmcgd2l0aCBlbWJlZGRpbmcgbWFya3MgZm9yIFJUTCBkaXNwbGF5LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHdyYXBSVEw6IGZ1bmN0aW9uKCBzdHJpbmcgKSB7XG4gICAgcmV0dXJuIFJUTCArIHN0cmluZyArIFBPUDtcbiAgfSxcblxuICAvKipcbiAgICogV3JhcHMgYSBzdHJpbmcgd2l0aCBlbWJlZGRpbmcgbWFya3MgZm9yIExUUi9SVEwgZGlzcGxheSwgZGVwZW5kaW5nIG9uIHRoZSBkaXJlY3Rpb25cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb24gLSBlaXRoZXIgJ2x0cicgb3IgJ3J0bCdcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHdyYXBEaXJlY3Rpb246IGZ1bmN0aW9uKCBzdHJpbmcsIGRpcmVjdGlvbiApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkaXJlY3Rpb24gPT09ICdsdHInIHx8IGRpcmVjdGlvbiA9PT0gJ3J0bCcgKTtcblxuICAgIGlmICggZGlyZWN0aW9uID09PSAnbHRyJyApIHtcbiAgICAgIHJldHVybiBTdHJpbmdVdGlscy53cmFwTFRSKCBzdHJpbmcgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gU3RyaW5nVXRpbHMud3JhcFJUTCggc3RyaW5nICk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGxvY2FsZSwgZS5nLiAnZXMnLCBwcm92aWRlcyB0aGUgbG9jYWxpemVkIG5hbWUsIGUuZy4gJ0VzcGHDsW9sJ1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYWxlXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBsb2NhbGVUb0xvY2FsaXplZE5hbWU6IGZ1bmN0aW9uKCBsb2NhbGUgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGhldC5jaGlwcGVyLmxvY2FsZURhdGFbIGxvY2FsZSBdLCAnbG9jYWxlIG5lZWRzIHRvIGJlIGEgdmFsaWQgbG9jYWxlIGNvZGUgZGVmaW5lZCBpbiBsb2NhbGVEYXRhJyApO1xuXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLndyYXBEaXJlY3Rpb24oXG4gICAgICBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YVsgbG9jYWxlIF0ubG9jYWxpemVkTmFtZSxcbiAgICAgIHBoZXQuY2hpcHBlci5sb2NhbGVEYXRhWyBsb2NhbGUgXS5kaXJlY3Rpb25cbiAgICApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYXBpdGFsaXplIHRoZSBmaXJzdCBsZXR0ZXIgb2YgdGhlIGdpdmVuIHN0cmluZy4gIFRoaXMgd2lsbCBza2lwIGNvbnRyb2wgY2hhcmFjdGVycyBhbmQgd2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nXG4gICAqIG9mIGEgc3RyaW5nLiAgSWYgdGhlIGxldHRlciBpcyBhbHJlYWR5IGNhcGl0YWxpemVkIHRoZSByZXR1cm5lZCBzdHJpbmcgd2lsbCBtYXRjaCB0aGUgcHJvdmlkZWQgb25lLiAgU3RyaW5ncyB0aGF0XG4gICAqIHN0YXJ0IHdpdGggbnVtYmVycywgc3VjaCBhcyBcIjEgb2YgdGhlc2UgdGhpbmdzXCIgd2lsbCBiZSBlc3NlbnRpYWxseSB1bmNoYW5nZWQgdG9vLlxuICAgKlxuICAgKiBUaGlzIHdpbGwgb25seSB3b3JrIHJlbGlhYmx5IGZvciBFbmdsaXNoIHN0cmluZ3MuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY2FwaXRhbGl6ZSggc3RyICkge1xuXG4gICAgLy8gRmluZCB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGNoYXJhY3RlciB0aGF0IGNhbiBiZSBjYXBpdGFsaXplZC4gIENvbnRyb2wgY2hhcmFjdGVycyBhbmQgd2hpdGVzcGFjZSBhcmUgc2tpcHBlZC5cbiAgICBjb25zdCBmaXJzdENoYXJJbmRleCA9IHN0ci5zZWFyY2goIC9bQS1aYS16MC05XS8gKTtcblxuICAgIGlmICggZmlyc3RDaGFySW5kZXggPT09IC0xICkge1xuXG4gICAgICAvLyBObyBjaGFyYWN0ZXJzIHdlcmUgZm91bmQgaW4gdGhlIHN0cmluZyB0aGF0IGNhbiBiZSBjYXBpdGFsaXplZCwgc28gcmV0dXJuIGFuIHVuY2hhbmdlZCBjb3B5LlxuICAgICAgcmV0dXJuIHN0ci5zbGljZSggMCApO1xuICAgIH1cblxuICAgIC8vIEJyZWFrIHRoZSBzdHJpbmcgYXBhcnQgYW5kIGNhcGl0YWxpemUgdGhlIGlkZW50aWZpZWQgY2hhcmFjdGVyLlxuICAgIGNvbnN0IHByZUNoYW5nZVN0cmluZyA9IGZpcnN0Q2hhckluZGV4ID4gMCA/IHN0ci5zbGljZSggMCwgZmlyc3RDaGFySW5kZXggKSA6ICcnO1xuICAgIGNvbnN0IGNhcGl0YWxpemVkQ2hhcmFjdGVyID0gc3RyLmNoYXJBdCggZmlyc3RDaGFySW5kZXggKS50b1VwcGVyQ2FzZSgpO1xuICAgIGNvbnN0IHBvc3RDaGFuZ2VTdHJpbmcgPSBmaXJzdENoYXJJbmRleCArIDEgPCBzdHIubGVuZ3RoID8gc3RyLnNsaWNlKCBmaXJzdENoYXJJbmRleCArIDEgKSA6ICcnO1xuXG4gICAgcmV0dXJuIHByZUNoYW5nZVN0cmluZyArIGNhcGl0YWxpemVkQ2hhcmFjdGVyICsgcG9zdENoYW5nZVN0cmluZztcbiAgfVxufTtcblxucGhldGNvbW1vbi5yZWdpc3RlciggJ1N0cmluZ1V0aWxzJywgU3RyaW5nVXRpbHMgKTtcblxuZXhwb3J0IGRlZmF1bHQgU3RyaW5nVXRpbHM7Il0sIm5hbWVzIjpbInBoZXRjb21tb24iLCJMVFIiLCJSVEwiLCJQT1AiLCJTdHJpbmdVdGlscyIsImZvcm1hdCIsInBhdHRlcm4iLCJhcmdzIiwiYXJndW1lbnRzIiwicmVwbGFjZSIsInIiLCJuIiwiZmlsbEluIiwidGVtcGxhdGUiLCJ2YWx1ZXMiLCJnZXQiLCJhc3NlcnQiLCJuZXdTdHJpbmciLCJwbGFjZWhvbGRlcnMiLCJtYXRjaCIsImkiLCJsZW5ndGgiLCJwbGFjZWhvbGRlciIsImtleSIsInVuZGVmaW5lZCIsInZhbHVlU3RyaW5nIiwiaXNFbWJlZGRpbmdNYXJrIiwiY2hyIiwiZW1iZWRkZWRTbGljZSIsInN0cmluZyIsInN0YXJ0SW5kZXgiLCJlbmRJbmRleCIsInN0YWNrIiwiY2hhckF0IiwicHVzaCIsInBvcCIsIm1pbmltdW1TdGFja1NpemUiLCJzdGFydFN0YWNrIiwic2xpY2UiLCJqIiwiTWF0aCIsIm1pbiIsImVuZFN0YWNrIiwibnVtU2tpcHBlZFN0YWNrTGV2ZWxzIiwibWF4IiwicHJlZml4Iiwiam9pbiIsInN1ZmZpeCIsImVtYmVkZGVkU3BsaXQiLCJzZXBhcmF0b3IiLCJsaW1pdCIsInJlc3VsdCIsInNlcGFyYXRvck1hdGNoIiwic3RyaW5nVG9TcGxpdCIsImZpbmRTZXBhcmF0b3JNYXRjaCIsImluZGV4Iiwid2luZG93IiwiUmVnRXhwIiwiaW5kZXhPZiIsImluZGV4T2Zmc2V0Iiwib2Zmc2V0IiwiXyIsImZpcnN0IiwiZW1iZWRkZWREZWJ1Z1N0cmluZyIsIndyYXBMVFIiLCJ3cmFwUlRMIiwid3JhcERpcmVjdGlvbiIsImRpcmVjdGlvbiIsImxvY2FsZVRvTG9jYWxpemVkTmFtZSIsImxvY2FsZSIsInBoZXQiLCJjaGlwcGVyIiwibG9jYWxlRGF0YSIsImxvY2FsaXplZE5hbWUiLCJjYXBpdGFsaXplIiwic3RyIiwiZmlyc3RDaGFySW5kZXgiLCJzZWFyY2giLCJwcmVDaGFuZ2VTdHJpbmciLCJjYXBpdGFsaXplZENoYXJhY3RlciIsInRvVXBwZXJDYXNlIiwicG9zdENoYW5nZVN0cmluZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7OztDQUdDLEdBRUQsT0FBT0EsZ0JBQWdCLG1CQUFtQjtBQUUxQyx1Q0FBdUM7QUFDdkMsTUFBTUMsTUFBTTtBQUNaLE1BQU1DLE1BQU07QUFDWixNQUFNQyxNQUFNO0FBRVosTUFBTUMsY0FBYztJQUVsQjs7Ozs7Ozs7Ozs7Ozs7O0dBZUMsR0FDREMsUUFBUSxTQUFVQyxPQUFPO1FBQ3ZCLDhDQUE4QztRQUM5QyxNQUFNQyxPQUFPQztRQUNiLE9BQU9GLFFBQVFHLE9BQU8sQ0FBRSxXQUFXLENBQUVDLEdBQUdDLElBQU9KLElBQUksQ0FBRSxDQUFDSSxJQUFJLEVBQUc7SUFDL0Q7SUFFQTs7Ozs7Ozs7Ozs7Ozs7R0FjQyxHQUNEQyxRQUFRLFNBQVVDLFFBQVEsRUFBRUMsTUFBTTtRQUNoQ0QsV0FBVyxBQUFFQSxZ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