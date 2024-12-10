// Copyright 2021-2024, University of Colorado Boulder
/**
 * Function that determines created and last modified dates from git, see #403. If the file is not tracked in git
 * then returns a copyright statement with the current year.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import execute from '../../../perennial-alias/js/common/execute.js';
/**
 * @param repo - The repository of the file to update (should be a git root)
 * @param relativeFile - The filename relative to the repository root.
 */ export default /*#__PURE__*/ _async_to_generator(function*(repo, relativeFile) {
    let startDate = (yield execute('git', [
        'log',
        '--diff-filter=A',
        '--follow',
        '--date=short',
        '--format=%cd',
        '-1',
        '--',
        relativeFile
    ], `../${repo}`)).trim().split('-')[0];
    const endDate = (yield execute('git', [
        'log',
        '--follow',
        '--date=short',
        '--format=%cd',
        '-1',
        '--',
        relativeFile
    ], `../${repo}`)).trim().split('-')[0];
    let dateString = '';
    // git was unable to get any information about the file. Perhaps it is new or not yet tracked in get? Use the current year.
    if (startDate === '' && endDate === '') {
        dateString = new Date().getFullYear() + '';
    } else {
        // There is a bug with the first git log command that sometimes yields a blank link as output
        // You can find occurrences of this by searching our repos for "Copyright 2002-"
        if (startDate === '') {
            startDate = '2002';
        }
        // Create the single date or date range to use in the copyright statement
        dateString = startDate === endDate ? startDate : `${startDate}-${endDate}`;
    }
    return `// Copyright ${dateString}, University of Colorado Boulder`;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dldENvcHlyaWdodExpbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGNyZWF0ZWQgYW5kIGxhc3QgbW9kaWZpZWQgZGF0ZXMgZnJvbSBnaXQsIHNlZSAjNDAzLiBJZiB0aGUgZmlsZSBpcyBub3QgdHJhY2tlZCBpbiBnaXRcbiAqIHRoZW4gcmV0dXJucyBhIGNvcHlyaWdodCBzdGF0ZW1lbnQgd2l0aCB0aGUgY3VycmVudCB5ZWFyLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGV4ZWN1dGUgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9leGVjdXRlLmpzJztcblxuLyoqXG4gKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG9mIHRoZSBmaWxlIHRvIHVwZGF0ZSAoc2hvdWxkIGJlIGEgZ2l0IHJvb3QpXG4gKiBAcGFyYW0gcmVsYXRpdmVGaWxlIC0gVGhlIGZpbGVuYW1lIHJlbGF0aXZlIHRvIHRoZSByZXBvc2l0b3J5IHJvb3QuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jICggcmVwbzogc3RyaW5nLCByZWxhdGl2ZUZpbGU6IHN0cmluZyApOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuXG4gIGxldCBzdGFydERhdGUgPSAoIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbXG4gICAgJ2xvZycsICctLWRpZmYtZmlsdGVyPUEnLCAnLS1mb2xsb3cnLCAnLS1kYXRlPXNob3J0JywgJy0tZm9ybWF0PSVjZCcsICctMScsICctLScsIHJlbGF0aXZlRmlsZVxuICBdLCBgLi4vJHtyZXBvfWAgKSApLnRyaW0oKS5zcGxpdCggJy0nIClbIDAgXTtcblxuICBjb25zdCBlbmREYXRlID0gKCBhd2FpdCBleGVjdXRlKCAnZ2l0JywgW1xuICAgICdsb2cnLCAnLS1mb2xsb3cnLCAnLS1kYXRlPXNob3J0JywgJy0tZm9ybWF0PSVjZCcsICctMScsICctLScsIHJlbGF0aXZlRmlsZVxuICBdLCBgLi4vJHtyZXBvfWAgKSApLnRyaW0oKS5zcGxpdCggJy0nIClbIDAgXTtcblxuICBsZXQgZGF0ZVN0cmluZyA9ICcnO1xuXG4gIC8vIGdpdCB3YXMgdW5hYmxlIHRvIGdldCBhbnkgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGZpbGUuIFBlcmhhcHMgaXQgaXMgbmV3IG9yIG5vdCB5ZXQgdHJhY2tlZCBpbiBnZXQ/IFVzZSB0aGUgY3VycmVudCB5ZWFyLlxuICBpZiAoIHN0YXJ0RGF0ZSA9PT0gJycgJiYgZW5kRGF0ZSA9PT0gJycgKSB7XG4gICAgZGF0ZVN0cmluZyA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSArICcnO1xuICB9XG4gIGVsc2Uge1xuXG4gICAgLy8gVGhlcmUgaXMgYSBidWcgd2l0aCB0aGUgZmlyc3QgZ2l0IGxvZyBjb21tYW5kIHRoYXQgc29tZXRpbWVzIHlpZWxkcyBhIGJsYW5rIGxpbmsgYXMgb3V0cHV0XG4gICAgLy8gWW91IGNhbiBmaW5kIG9jY3VycmVuY2VzIG9mIHRoaXMgYnkgc2VhcmNoaW5nIG91ciByZXBvcyBmb3IgXCJDb3B5cmlnaHQgMjAwMi1cIlxuICAgIGlmICggc3RhcnREYXRlID09PSAnJyApIHtcbiAgICAgIHN0YXJ0RGF0ZSA9ICcyMDAyJztcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIHNpbmdsZSBkYXRlIG9yIGRhdGUgcmFuZ2UgdG8gdXNlIGluIHRoZSBjb3B5cmlnaHQgc3RhdGVtZW50XG4gICAgZGF0ZVN0cmluZyA9ICggc3RhcnREYXRlID09PSBlbmREYXRlICkgPyBzdGFydERhdGUgOiAoIGAke3N0YXJ0RGF0ZX0tJHtlbmREYXRlfWAgKTtcbiAgfVxuXG4gIHJldHVybiBgLy8gQ29weXJpZ2h0ICR7ZGF0ZVN0cmluZ30sIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlcmA7XG59OyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVwbyIsInJlbGF0aXZlRmlsZSIsInN0YXJ0RGF0ZSIsInRyaW0iLCJzcGxpdCIsImVuZERhdGUiLCJkYXRlU3RyaW5nIiwiRGF0ZSIsImdldEZ1bGxZZWFyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLGFBQWEsZ0RBQWdEO0FBRXBFOzs7Q0FHQyxHQUNELGlEQUFlLFVBQVFDLE1BQWNDO0lBRW5DLElBQUlDLFlBQVksQUFBRSxDQUFBLE1BQU1ILFFBQVMsT0FBTztRQUN0QztRQUFPO1FBQW1CO1FBQVk7UUFBZ0I7UUFBZ0I7UUFBTTtRQUFNRTtLQUNuRixFQUFFLENBQUMsR0FBRyxFQUFFRCxNQUFNLENBQUMsRUFBSUcsSUFBSSxHQUFHQyxLQUFLLENBQUUsSUFBSyxDQUFFLEVBQUc7SUFFNUMsTUFBTUMsVUFBVSxBQUFFLENBQUEsTUFBTU4sUUFBUyxPQUFPO1FBQ3RDO1FBQU87UUFBWTtRQUFnQjtRQUFnQjtRQUFNO1FBQU1FO0tBQ2hFLEVBQUUsQ0FBQyxHQUFHLEVBQUVELE1BQU0sQ0FBQyxFQUFJRyxJQUFJLEdBQUdDLEtBQUssQ0FBRSxJQUFLLENBQUUsRUFBRztJQUU1QyxJQUFJRSxhQUFhO0lBRWpCLDJIQUEySDtJQUMzSCxJQUFLSixjQUFjLE1BQU1HLFlBQVksSUFBSztRQUN4Q0MsYUFBYSxJQUFJQyxPQUFPQyxXQUFXLEtBQUs7SUFDMUMsT0FDSztRQUVILDZGQUE2RjtRQUM3RixnRkFBZ0Y7UUFDaEYsSUFBS04sY0FBYyxJQUFLO1lBQ3RCQSxZQUFZO1FBQ2Q7UUFFQSx5RUFBeUU7UUFDekVJLGFBQWEsQUFBRUosY0FBY0csVUFBWUgsWUFBYyxHQUFHQSxVQUFVLENBQUMsRUFBRUcsU0FBUztJQUNsRjtJQUVBLE9BQU8sQ0FBQyxhQUFhLEVBQUVDLFdBQVcsZ0NBQWdDLENBQUM7QUFDckUsR0FBRSJ9