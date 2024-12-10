// Copyright 2013-2024, University of Colorado Boulder
/**
 * Prints commits since a specified date, for all dependencies of the build target.
 * The output is grouped by repository, and condensed to one line per commit.
 * The date is in ISO 8601 format
 *
 * For example, to see all commits since Oct 1, 2015 at 3:52pm:
 * grunt commits-since --date="2015-10-01 15:52"
 *
 * To count the number of commits, use the power of the shell:
 * grunt commits-since --date="2015-10-01 15:52" | grep -v since | wc -l
 *
 * @author Chris Malley (PixelZoom, Inc.)
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
import assert from 'assert';
import execute from '../../../perennial-alias/js/common/execute.js';
import getOption from '../../../perennial-alias/js/grunt/tasks/util/getOption.js';
import getRepo from '../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import getPhetLibs from '../grunt/getPhetLibs.js';
_async_to_generator(function*() {
    const repo = getRepo();
    const dateString = getOption('date');
    assert(dateString, 'missing required option: --date={{DATE}}');
    let output = '';
    for (const dependency of getPhetLibs(repo)){
        output += `${dependency} since ${dateString} ----------------------------------------------\n`;
        const logOut = yield execute('git', [
            'log',
            `--since="${dateString}"`,
            '--pretty=tformat:"%h | %ci | %cn | %s"'
        ], `../${dependency}`);
        output += logOut;
    }
    console.log(output);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL3NjcmlwdHMvY29tbWl0cy1zaW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcmludHMgY29tbWl0cyBzaW5jZSBhIHNwZWNpZmllZCBkYXRlLCBmb3IgYWxsIGRlcGVuZGVuY2llcyBvZiB0aGUgYnVpbGQgdGFyZ2V0LlxuICogVGhlIG91dHB1dCBpcyBncm91cGVkIGJ5IHJlcG9zaXRvcnksIGFuZCBjb25kZW5zZWQgdG8gb25lIGxpbmUgcGVyIGNvbW1pdC5cbiAqIFRoZSBkYXRlIGlzIGluIElTTyA4NjAxIGZvcm1hdFxuICpcbiAqIEZvciBleGFtcGxlLCB0byBzZWUgYWxsIGNvbW1pdHMgc2luY2UgT2N0IDEsIDIwMTUgYXQgMzo1MnBtOlxuICogZ3J1bnQgY29tbWl0cy1zaW5jZSAtLWRhdGU9XCIyMDE1LTEwLTAxIDE1OjUyXCJcbiAqXG4gKiBUbyBjb3VudCB0aGUgbnVtYmVyIG9mIGNvbW1pdHMsIHVzZSB0aGUgcG93ZXIgb2YgdGhlIHNoZWxsOlxuICogZ3J1bnQgY29tbWl0cy1zaW5jZSAtLWRhdGU9XCIyMDE1LTEwLTAxIDE1OjUyXCIgfCBncmVwIC12IHNpbmNlIHwgd2MgLWxcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBleGVjdXRlIGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZXhlY3V0ZS5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldE9wdGlvbi5qcyc7XG5pbXBvcnQgZ2V0UmVwbyBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRSZXBvLmpzJztcbmltcG9ydCBnZXRQaGV0TGlicyBmcm9tICcuLi9ncnVudC9nZXRQaGV0TGlicy5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuXG4gIGNvbnN0IHJlcG8gPSBnZXRSZXBvKCk7XG4gIGNvbnN0IGRhdGVTdHJpbmcgPSBnZXRPcHRpb24oICdkYXRlJyApO1xuICBhc3NlcnQoIGRhdGVTdHJpbmcsICdtaXNzaW5nIHJlcXVpcmVkIG9wdGlvbjogLS1kYXRlPXt7REFURX19JyApO1xuXG4gIGxldCBvdXRwdXQgPSAnJztcbiAgZm9yICggY29uc3QgZGVwZW5kZW5jeSBvZiBnZXRQaGV0TGlicyggcmVwbyApICkge1xuICAgIG91dHB1dCArPSBgJHtkZXBlbmRlbmN5fSBzaW5jZSAke2RhdGVTdHJpbmd9IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5gO1xuXG4gICAgY29uc3QgbG9nT3V0ID0gYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2xvZycsIGAtLXNpbmNlPVwiJHtkYXRlU3RyaW5nfVwiYCwgJy0tcHJldHR5PXRmb3JtYXQ6XCIlaCB8ICVjaSB8ICVjbiB8ICVzXCInIF0sIGAuLi8ke2RlcGVuZGVuY3l9YCApO1xuICAgIG91dHB1dCArPSBsb2dPdXQ7XG4gIH1cblxuICBjb25zb2xlLmxvZyggb3V0cHV0ICk7XG59ICkoKTsiXSwibmFtZXMiOlsiYXNzZXJ0IiwiZXhlY3V0ZSIsImdldE9wdGlvbiIsImdldFJlcG8iLCJnZXRQaGV0TGlicyIsInJlcG8iLCJkYXRlU3RyaW5nIiwib3V0cHV0IiwiZGVwZW5kZW5jeSIsImxvZ091dCIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7O0NBWUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLE9BQU9DLGFBQWEsZ0RBQWdEO0FBQ3BFLE9BQU9DLGVBQWUsNERBQTREO0FBQ2xGLE9BQU9DLGFBQWEsMERBQTBEO0FBQzlFLE9BQU9DLGlCQUFpQiwwQkFBMEI7QUFFaEQsb0JBQUE7SUFFQSxNQUFNQyxPQUFPRjtJQUNiLE1BQU1HLGFBQWFKLFVBQVc7SUFDOUJGLE9BQVFNLFlBQVk7SUFFcEIsSUFBSUMsU0FBUztJQUNiLEtBQU0sTUFBTUMsY0FBY0osWUFBYUMsTUFBUztRQUM5Q0UsVUFBVSxHQUFHQyxXQUFXLE9BQU8sRUFBRUYsV0FBVyxpREFBaUQsQ0FBQztRQUU5RixNQUFNRyxTQUFTLE1BQU1SLFFBQVMsT0FBTztZQUFFO1lBQU8sQ0FBQyxTQUFTLEVBQUVLLFdBQVcsQ0FBQyxDQUFDO1lBQUU7U0FBMEMsRUFBRSxDQUFDLEdBQUcsRUFBRUUsWUFBWTtRQUN2SUQsVUFBVUU7SUFDWjtJQUVBQyxRQUFRQyxHQUFHLENBQUVKO0FBQ2YifQ==