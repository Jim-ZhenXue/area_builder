// Copyright 2014-2023, University of Colorado Boulder
/**
 * Scans through potential properties on an object to detect prefixed forms, and returns the first match.
 *
 * E.g. currently:
 * phet.phetCore.detectPrefix( document.createElement( 'div' ).style, 'transform' ) === 'webkitTransform'
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
// @returns the best String str where obj[str] !== undefined, or returns undefined if that is not available
function detectPrefix(obj, name) {
    // @ts-expect-error
    if (obj[name] !== undefined) {
        return name;
    }
    // prepare for camelCase
    name = name.charAt(0).toUpperCase() + name.slice(1);
    // Chrome planning to not introduce prefixes in the future, hopefully we will be safe
    // @ts-expect-error
    if (obj[`moz${name}`] !== undefined) {
        return `moz${name}`;
    }
    // @ts-expect-error
    if (obj[`Moz${name}`] !== undefined) {
        return `Moz${name}`;
    } // some prefixes seem to have all-caps?
    // @ts-expect-error
    if (obj[`webkit${name}`] !== undefined) {
        return `webkit${name}`;
    }
    // @ts-expect-error
    if (obj[`ms${name}`] !== undefined) {
        return `ms${name}`;
    }
    // @ts-expect-error
    if (obj[`o${name}`] !== undefined) {
        return `o${name}`;
    }
    // @ts-expect-error
    return undefined;
}
phetCore.register('detectPrefix', detectPrefix);
export default detectPrefix;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kZXRlY3RQcmVmaXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2NhbnMgdGhyb3VnaCBwb3RlbnRpYWwgcHJvcGVydGllcyBvbiBhbiBvYmplY3QgdG8gZGV0ZWN0IHByZWZpeGVkIGZvcm1zLCBhbmQgcmV0dXJucyB0aGUgZmlyc3QgbWF0Y2guXG4gKlxuICogRS5nLiBjdXJyZW50bHk6XG4gKiBwaGV0LnBoZXRDb3JlLmRldGVjdFByZWZpeCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKS5zdHlsZSwgJ3RyYW5zZm9ybScgKSA9PT0gJ3dlYmtpdFRyYW5zZm9ybSdcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xuXG4vLyBAcmV0dXJucyB0aGUgYmVzdCBTdHJpbmcgc3RyIHdoZXJlIG9ialtzdHJdICE9PSB1bmRlZmluZWQsIG9yIHJldHVybnMgdW5kZWZpbmVkIGlmIHRoYXQgaXMgbm90IGF2YWlsYWJsZVxuZnVuY3Rpb24gZGV0ZWN0UHJlZml4KCBvYmo6IG9iamVjdCwgbmFtZTogc3RyaW5nICk6IHN0cmluZyB7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBpZiAoIG9ialsgbmFtZSBdICE9PSB1bmRlZmluZWQgKSB7IHJldHVybiBuYW1lOyB9XG5cbiAgLy8gcHJlcGFyZSBmb3IgY2FtZWxDYXNlXG4gIG5hbWUgPSBuYW1lLmNoYXJBdCggMCApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKCAxICk7XG5cbiAgLy8gQ2hyb21lIHBsYW5uaW5nIHRvIG5vdCBpbnRyb2R1Y2UgcHJlZml4ZXMgaW4gdGhlIGZ1dHVyZSwgaG9wZWZ1bGx5IHdlIHdpbGwgYmUgc2FmZVxuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGlmICggb2JqWyBgbW96JHtuYW1lfWAgXSAhPT0gdW5kZWZpbmVkICkgeyByZXR1cm4gYG1veiR7bmFtZX1gOyB9XG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgaWYgKCBvYmpbIGBNb3oke25hbWV9YCBdICE9PSB1bmRlZmluZWQgKSB7IHJldHVybiBgTW96JHtuYW1lfWA7IH0gLy8gc29tZSBwcmVmaXhlcyBzZWVtIHRvIGhhdmUgYWxsLWNhcHM/XG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgaWYgKCBvYmpbIGB3ZWJraXQke25hbWV9YCBdICE9PSB1bmRlZmluZWQgKSB7IHJldHVybiBgd2Via2l0JHtuYW1lfWA7IH1cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBpZiAoIG9ialsgYG1zJHtuYW1lfWAgXSAhPT0gdW5kZWZpbmVkICkgeyByZXR1cm4gYG1zJHtuYW1lfWA7IH1cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBpZiAoIG9ialsgYG8ke25hbWV9YCBdICE9PSB1bmRlZmluZWQgKSB7IHJldHVybiBgbyR7bmFtZX1gOyB9XG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxucGhldENvcmUucmVnaXN0ZXIoICdkZXRlY3RQcmVmaXgnLCBkZXRlY3RQcmVmaXggKTtcblxuZXhwb3J0IGRlZmF1bHQgZGV0ZWN0UHJlZml4OyJdLCJuYW1lcyI6WyJwaGV0Q29yZSIsImRldGVjdFByZWZpeCIsIm9iaiIsIm5hbWUiLCJ1bmRlZmluZWQiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EsY0FBYyxnQkFBZ0I7QUFFckMsMkdBQTJHO0FBQzNHLFNBQVNDLGFBQWNDLEdBQVcsRUFBRUMsSUFBWTtJQUU5QyxtQkFBbUI7SUFDbkIsSUFBS0QsR0FBRyxDQUFFQyxLQUFNLEtBQUtDLFdBQVk7UUFBRSxPQUFPRDtJQUFNO0lBRWhELHdCQUF3QjtJQUN4QkEsT0FBT0EsS0FBS0UsTUFBTSxDQUFFLEdBQUlDLFdBQVcsS0FBS0gsS0FBS0ksS0FBSyxDQUFFO0lBRXBELHFGQUFxRjtJQUNyRixtQkFBbUI7SUFDbkIsSUFBS0wsR0FBRyxDQUFFLENBQUMsR0FBRyxFQUFFQyxNQUFNLENBQUUsS0FBS0MsV0FBWTtRQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUVELE1BQU07SUFBRTtJQUNoRSxtQkFBbUI7SUFDbkIsSUFBS0QsR0FBRyxDQUFFLENBQUMsR0FBRyxFQUFFQyxNQUFNLENBQUUsS0FBS0MsV0FBWTtRQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUVELE1BQU07SUFBRSxFQUFFLHVDQUF1QztJQUN6RyxtQkFBbUI7SUFDbkIsSUFBS0QsR0FBRyxDQUFFLENBQUMsTUFBTSxFQUFFQyxNQUFNLENBQUUsS0FBS0MsV0FBWTtRQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUVELE1BQU07SUFBRTtJQUN0RSxtQkFBbUI7SUFDbkIsSUFBS0QsR0FBRyxDQUFFLENBQUMsRUFBRSxFQUFFQyxNQUFNLENBQUUsS0FBS0MsV0FBWTtRQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUVELE1BQU07SUFBRTtJQUM5RCxtQkFBbUI7SUFDbkIsSUFBS0QsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFQyxNQUFNLENBQUUsS0FBS0MsV0FBWTtRQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUVELE1BQU07SUFBRTtJQUM1RCxtQkFBbUI7SUFDbkIsT0FBT0M7QUFDVDtBQUVBSixTQUFTUSxRQUFRLENBQUUsZ0JBQWdCUDtBQUVuQyxlQUFlQSxhQUFhIn0=