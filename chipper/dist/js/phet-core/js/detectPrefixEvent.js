// Copyright 2014-2023, University of Colorado Boulder
/* eslint-disable no-useless-concat */ /**
 * Scans through potential event properties on an object to detect prefixed forms, and returns the first match.
 *
 * E.g. currently:
 * phet.phetCore.detectPrefixEvent( document, 'fullscreenchange' ) === 'webkitfullscreenchange'
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
// @returns the best String str where obj['on'+str] !== undefined, or returns undefined if that is not available
function detectPrefixEvent(obj, name) {
    // @ts-expect-error
    if (obj[`on${name}`] !== undefined) {
        return name;
    }
    // Chrome planning to not introduce prefixes in the future, hopefully we will be safe
    // @ts-expect-error
    if (obj[`${'on' + 'moz'}${name}`] !== undefined) {
        return `moz${name}`;
    }
    // @ts-expect-error
    if (obj[`${'on' + 'Moz'}${name}`] !== undefined) {
        return `Moz${name}`;
    } // some prefixes seem to have all-caps?
    // @ts-expect-error
    if (obj[`${'on' + 'webkit'}${name}`] !== undefined) {
        return `webkit${name}`;
    }
    // @ts-expect-error
    if (obj[`${'on' + 'ms'}${name}`] !== undefined) {
        return `ms${name}`;
    }
    // @ts-expect-error
    if (obj[`${'on' + 'o'}${name}`] !== undefined) {
        return `o${name}`;
    }
    // @ts-expect-error
    return undefined;
}
phetCore.register('detectPrefixEvent', detectPrefixEvent);
export default detectPrefixEvent;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kZXRlY3RQcmVmaXhFdmVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVzZWxlc3MtY29uY2F0ICovXG5cbi8qKlxuICogU2NhbnMgdGhyb3VnaCBwb3RlbnRpYWwgZXZlbnQgcHJvcGVydGllcyBvbiBhbiBvYmplY3QgdG8gZGV0ZWN0IHByZWZpeGVkIGZvcm1zLCBhbmQgcmV0dXJucyB0aGUgZmlyc3QgbWF0Y2guXG4gKlxuICogRS5nLiBjdXJyZW50bHk6XG4gKiBwaGV0LnBoZXRDb3JlLmRldGVjdFByZWZpeEV2ZW50KCBkb2N1bWVudCwgJ2Z1bGxzY3JlZW5jaGFuZ2UnICkgPT09ICd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJ1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XG5cbi8vIEByZXR1cm5zIHRoZSBiZXN0IFN0cmluZyBzdHIgd2hlcmUgb2JqWydvbicrc3RyXSAhPT0gdW5kZWZpbmVkLCBvciByZXR1cm5zIHVuZGVmaW5lZCBpZiB0aGF0IGlzIG5vdCBhdmFpbGFibGVcbmZ1bmN0aW9uIGRldGVjdFByZWZpeEV2ZW50KCBvYmo6IG9iamVjdCwgbmFtZTogc3RyaW5nICk6IHN0cmluZyB7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgaWYgKCBvYmpbIGBvbiR7bmFtZX1gIF0gIT09IHVuZGVmaW5lZCApIHsgcmV0dXJuIG5hbWU7IH1cblxuICAvLyBDaHJvbWUgcGxhbm5pbmcgdG8gbm90IGludHJvZHVjZSBwcmVmaXhlcyBpbiB0aGUgZnV0dXJlLCBob3BlZnVsbHkgd2Ugd2lsbCBiZSBzYWZlXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgaWYgKCBvYmpbIGAkeydvbicgKyAnbW96J30ke25hbWV9YCBdICE9PSB1bmRlZmluZWQgKSB7IHJldHVybiBgbW96JHtuYW1lfWA7IH1cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBpZiAoIG9ialsgYCR7J29uJyArICdNb3onfSR7bmFtZX1gIF0gIT09IHVuZGVmaW5lZCApIHsgcmV0dXJuIGBNb3oke25hbWV9YDsgfSAvLyBzb21lIHByZWZpeGVzIHNlZW0gdG8gaGF2ZSBhbGwtY2Fwcz9cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBpZiAoIG9ialsgYCR7J29uJyArICd3ZWJraXQnfSR7bmFtZX1gIF0gIT09IHVuZGVmaW5lZCApIHsgcmV0dXJuIGB3ZWJraXQke25hbWV9YDsgfVxuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGlmICggb2JqWyBgJHsnb24nICsgJ21zJ30ke25hbWV9YCBdICE9PSB1bmRlZmluZWQgKSB7IHJldHVybiBgbXMke25hbWV9YDsgfVxuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGlmICggb2JqWyBgJHsnb24nICsgJ28nfSR7bmFtZX1gIF0gIT09IHVuZGVmaW5lZCApIHsgcmV0dXJuIGBvJHtuYW1lfWA7IH1cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5waGV0Q29yZS5yZWdpc3RlciggJ2RldGVjdFByZWZpeEV2ZW50JywgZGV0ZWN0UHJlZml4RXZlbnQgKTtcblxuZXhwb3J0IGRlZmF1bHQgZGV0ZWN0UHJlZml4RXZlbnQ7Il0sIm5hbWVzIjpbInBoZXRDb3JlIiwiZGV0ZWN0UHJlZml4RXZlbnQiLCJvYmoiLCJuYW1lIiwidW5kZWZpbmVkIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RCxvQ0FBb0MsR0FFcEM7Ozs7Ozs7Q0FPQyxHQUVELE9BQU9BLGNBQWMsZ0JBQWdCO0FBRXJDLGdIQUFnSDtBQUNoSCxTQUFTQyxrQkFBbUJDLEdBQVcsRUFBRUMsSUFBWTtJQUNuRCxtQkFBbUI7SUFDbkIsSUFBS0QsR0FBRyxDQUFFLENBQUMsRUFBRSxFQUFFQyxNQUFNLENBQUUsS0FBS0MsV0FBWTtRQUFFLE9BQU9EO0lBQU07SUFFdkQscUZBQXFGO0lBQ3JGLG1CQUFtQjtJQUNuQixJQUFLRCxHQUFHLENBQUUsR0FBRyxPQUFPLFFBQVFDLE1BQU0sQ0FBRSxLQUFLQyxXQUFZO1FBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRUQsTUFBTTtJQUFFO0lBQzVFLG1CQUFtQjtJQUNuQixJQUFLRCxHQUFHLENBQUUsR0FBRyxPQUFPLFFBQVFDLE1BQU0sQ0FBRSxLQUFLQyxXQUFZO1FBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRUQsTUFBTTtJQUFFLEVBQUUsdUNBQXVDO0lBQ3JILG1CQUFtQjtJQUNuQixJQUFLRCxHQUFHLENBQUUsR0FBRyxPQUFPLFdBQVdDLE1BQU0sQ0FBRSxLQUFLQyxXQUFZO1FBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRUQsTUFBTTtJQUFFO0lBQ2xGLG1CQUFtQjtJQUNuQixJQUFLRCxHQUFHLENBQUUsR0FBRyxPQUFPLE9BQU9DLE1BQU0sQ0FBRSxLQUFLQyxXQUFZO1FBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRUQsTUFBTTtJQUFFO0lBQzFFLG1CQUFtQjtJQUNuQixJQUFLRCxHQUFHLENBQUUsR0FBRyxPQUFPLE1BQU1DLE1BQU0sQ0FBRSxLQUFLQyxXQUFZO1FBQUUsT0FBTyxDQUFDLENBQUMsRUFBRUQsTUFBTTtJQUFFO0lBQ3hFLG1CQUFtQjtJQUNuQixPQUFPQztBQUNUO0FBRUFKLFNBQVNLLFFBQVEsQ0FBRSxxQkFBcUJKO0FBRXhDLGVBQWVBLGtCQUFrQiJ9