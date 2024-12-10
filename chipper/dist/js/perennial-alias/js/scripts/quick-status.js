// Copyright 2021, University of Colorado Boulder
/**
 * A fast-running status check. NOTE: Only checks the local status, does NOT check the server. Use the full status for
 * that if needed.
 *
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
const execute = require('../common/execute').default;
const getActiveRepos = require('../common/getActiveRepos');
const gitRevParse = require('../common/gitRevParse');
const winston = require('winston');
winston.default.transports.console.level = 'error';
// ANSI escape sequences to move to the right (in the same line) or to apply or reset colors
const moveRight = ' \u001b[42G';
const red = '\u001b[31m';
const green = '\u001b[32m';
const reset = '\u001b[0m';
const repos = getActiveRepos();
const data = {};
const getStatus = /*#__PURE__*/ _async_to_generator(function*(repo) {
    data[repo] = '';
    const symbolicRef = (yield execute('git', [
        'symbolic-ref',
        '-q',
        'HEAD'
    ], `../${repo}`)).trim();
    const branch = symbolicRef.replace('refs/heads/', ''); // might be empty string
    const sha = yield gitRevParse(repo, 'HEAD');
    const status = yield execute('git', [
        'status',
        '--porcelain'
    ], `../${repo}`);
    const track = branch ? (yield execute('git', [
        'for-each-ref',
        '--format=%(push:track,nobracket)',
        symbolicRef
    ], `../${repo}`)).trim() : '';
    let isGreen = false;
    if (branch) {
        isGreen = !status && branch === 'main' && !track.length;
        if (!isGreen || process.argv.includes('--all')) {
            data[repo] += `${repo}${moveRight}${isGreen ? green : red}${branch}${reset} ${track}\n`;
        }
    } else {
        // if no branch, print our SHA (detached head)
        data[repo] += `${repo}${moveRight}${red}${sha}${reset}\n`;
    }
    if (status) {
        if (!isGreen || process.argv.includes('--all')) {
            data[repo] += status + '\n';
        }
    }
});
_async_to_generator(function*() {
    yield Promise.all(repos.map((repo)=>getStatus(repo)));
    repos.forEach((repo)=>{
        process.stdout.write(data[repo]);
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3F1aWNrLXN0YXR1cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBmYXN0LXJ1bm5pbmcgc3RhdHVzIGNoZWNrLiBOT1RFOiBPbmx5IGNoZWNrcyB0aGUgbG9jYWwgc3RhdHVzLCBkb2VzIE5PVCBjaGVjayB0aGUgc2VydmVyLiBVc2UgdGhlIGZ1bGwgc3RhdHVzIGZvclxuICogdGhhdCBpZiBuZWVkZWQuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi4vY29tbW9uL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGdldEFjdGl2ZVJlcG9zID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRBY3RpdmVSZXBvcycgKTtcbmNvbnN0IGdpdFJldlBhcnNlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRSZXZQYXJzZScgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxud2luc3Rvbi5kZWZhdWx0LnRyYW5zcG9ydHMuY29uc29sZS5sZXZlbCA9ICdlcnJvcic7XG5cbi8vIEFOU0kgZXNjYXBlIHNlcXVlbmNlcyB0byBtb3ZlIHRvIHRoZSByaWdodCAoaW4gdGhlIHNhbWUgbGluZSkgb3IgdG8gYXBwbHkgb3IgcmVzZXQgY29sb3JzXG5jb25zdCBtb3ZlUmlnaHQgPSAnIFxcdTAwMWJbNDJHJztcbmNvbnN0IHJlZCA9ICdcXHUwMDFiWzMxbSc7XG5jb25zdCBncmVlbiA9ICdcXHUwMDFiWzMybSc7XG5jb25zdCByZXNldCA9ICdcXHUwMDFiWzBtJztcblxuY29uc3QgcmVwb3MgPSBnZXRBY3RpdmVSZXBvcygpO1xuY29uc3QgZGF0YSA9IHt9O1xuXG5jb25zdCBnZXRTdGF0dXMgPSBhc3luYyByZXBvID0+IHtcbiAgZGF0YVsgcmVwbyBdID0gJyc7XG5cbiAgY29uc3Qgc3ltYm9saWNSZWYgPSAoIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdzeW1ib2xpYy1yZWYnLCAnLXEnLCAnSEVBRCcgXSwgYC4uLyR7cmVwb31gICkgKS50cmltKCk7XG4gIGNvbnN0IGJyYW5jaCA9IHN5bWJvbGljUmVmLnJlcGxhY2UoICdyZWZzL2hlYWRzLycsICcnICk7IC8vIG1pZ2h0IGJlIGVtcHR5IHN0cmluZ1xuICBjb25zdCBzaGEgPSBhd2FpdCBnaXRSZXZQYXJzZSggcmVwbywgJ0hFQUQnICk7XG4gIGNvbnN0IHN0YXR1cyA9IGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdzdGF0dXMnLCAnLS1wb3JjZWxhaW4nIF0sIGAuLi8ke3JlcG99YCApO1xuICBjb25zdCB0cmFjayA9IGJyYW5jaCA/ICggYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2Zvci1lYWNoLXJlZicsICctLWZvcm1hdD0lKHB1c2g6dHJhY2ssbm9icmFja2V0KScsIHN5bWJvbGljUmVmIF0sIGAuLi8ke3JlcG99YCApICkudHJpbSgpIDogJyc7XG5cbiAgbGV0IGlzR3JlZW4gPSBmYWxzZTtcbiAgaWYgKCBicmFuY2ggKSB7XG4gICAgaXNHcmVlbiA9ICFzdGF0dXMgJiYgYnJhbmNoID09PSAnbWFpbicgJiYgIXRyYWNrLmxlbmd0aDtcblxuICAgIGlmICggIWlzR3JlZW4gfHwgcHJvY2Vzcy5hcmd2LmluY2x1ZGVzKCAnLS1hbGwnICkgKSB7XG4gICAgICBkYXRhWyByZXBvIF0gKz0gYCR7cmVwb30ke21vdmVSaWdodH0ke2lzR3JlZW4gPyBncmVlbiA6IHJlZH0ke2JyYW5jaH0ke3Jlc2V0fSAke3RyYWNrfVxcbmA7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIC8vIGlmIG5vIGJyYW5jaCwgcHJpbnQgb3VyIFNIQSAoZGV0YWNoZWQgaGVhZClcbiAgICBkYXRhWyByZXBvIF0gKz0gYCR7cmVwb30ke21vdmVSaWdodH0ke3JlZH0ke3NoYX0ke3Jlc2V0fVxcbmA7XG4gIH1cblxuICBpZiAoIHN0YXR1cyApIHtcbiAgICBpZiAoICFpc0dyZWVuIHx8IHByb2Nlc3MuYXJndi5pbmNsdWRlcyggJy0tYWxsJyApICkge1xuICAgICAgZGF0YVsgcmVwbyBdICs9IHN0YXR1cyArICdcXG4nO1xuICAgIH1cbiAgfVxufTtcblxuKCBhc3luYyAoKSA9PiB7XG4gIGF3YWl0IFByb21pc2UuYWxsKCByZXBvcy5tYXAoIHJlcG8gPT4gZ2V0U3RhdHVzKCByZXBvICkgKSApO1xuICByZXBvcy5mb3JFYWNoKCByZXBvID0+IHtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSggZGF0YVsgcmVwbyBdICk7XG4gIH0gKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJnZXRBY3RpdmVSZXBvcyIsImdpdFJldlBhcnNlIiwid2luc3RvbiIsInRyYW5zcG9ydHMiLCJjb25zb2xlIiwibGV2ZWwiLCJtb3ZlUmlnaHQiLCJyZWQiLCJncmVlbiIsInJlc2V0IiwicmVwb3MiLCJkYXRhIiwiZ2V0U3RhdHVzIiwicmVwbyIsInN5bWJvbGljUmVmIiwidHJpbSIsImJyYW5jaCIsInJlcGxhY2UiLCJzaGEiLCJzdGF0dXMiLCJ0cmFjayIsImlzR3JlZW4iLCJsZW5ndGgiLCJwcm9jZXNzIiwiYXJndiIsImluY2x1ZGVzIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsImZvckVhY2giLCJzdGRvdXQiLCJ3cml0ZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7OztDQUtDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFVBQVVDLFFBQVMscUJBQXNCQyxPQUFPO0FBQ3RELE1BQU1DLGlCQUFpQkYsUUFBUztBQUNoQyxNQUFNRyxjQUFjSCxRQUFTO0FBQzdCLE1BQU1JLFVBQVVKLFFBQVM7QUFFekJJLFFBQVFILE9BQU8sQ0FBQ0ksVUFBVSxDQUFDQyxPQUFPLENBQUNDLEtBQUssR0FBRztBQUUzQyw0RkFBNEY7QUFDNUYsTUFBTUMsWUFBWTtBQUNsQixNQUFNQyxNQUFNO0FBQ1osTUFBTUMsUUFBUTtBQUNkLE1BQU1DLFFBQVE7QUFFZCxNQUFNQyxRQUFRVjtBQUNkLE1BQU1XLE9BQU8sQ0FBQztBQUVkLE1BQU1DLDhDQUFZLFVBQU1DO0lBQ3RCRixJQUFJLENBQUVFLEtBQU0sR0FBRztJQUVmLE1BQU1DLGNBQWMsQUFBRSxDQUFBLE1BQU1qQixRQUFTLE9BQU87UUFBRTtRQUFnQjtRQUFNO0tBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRWdCLE1BQU0sQ0FBQyxFQUFJRSxJQUFJO0lBQ25HLE1BQU1DLFNBQVNGLFlBQVlHLE9BQU8sQ0FBRSxlQUFlLEtBQU0sd0JBQXdCO0lBQ2pGLE1BQU1DLE1BQU0sTUFBTWpCLFlBQWFZLE1BQU07SUFDckMsTUFBTU0sU0FBUyxNQUFNdEIsUUFBUyxPQUFPO1FBQUU7UUFBVTtLQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUVnQixNQUFNO0lBQzlFLE1BQU1PLFFBQVFKLFNBQVMsQUFBRSxDQUFBLE1BQU1uQixRQUFTLE9BQU87UUFBRTtRQUFnQjtRQUFvQ2lCO0tBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRUQsTUFBTSxDQUFDLEVBQUlFLElBQUksS0FBSztJQUU5SSxJQUFJTSxVQUFVO0lBQ2QsSUFBS0wsUUFBUztRQUNaSyxVQUFVLENBQUNGLFVBQVVILFdBQVcsVUFBVSxDQUFDSSxNQUFNRSxNQUFNO1FBRXZELElBQUssQ0FBQ0QsV0FBV0UsUUFBUUMsSUFBSSxDQUFDQyxRQUFRLENBQUUsVUFBWTtZQUNsRGQsSUFBSSxDQUFFRSxLQUFNLElBQUksR0FBR0EsT0FBT1AsWUFBWWUsVUFBVWIsUUFBUUQsTUFBTVMsU0FBU1AsTUFBTSxDQUFDLEVBQUVXLE1BQU0sRUFBRSxDQUFDO1FBQzNGO0lBQ0YsT0FDSztRQUNILDhDQUE4QztRQUM5Q1QsSUFBSSxDQUFFRSxLQUFNLElBQUksR0FBR0EsT0FBT1AsWUFBWUMsTUFBTVcsTUFBTVQsTUFBTSxFQUFFLENBQUM7SUFDN0Q7SUFFQSxJQUFLVSxRQUFTO1FBQ1osSUFBSyxDQUFDRSxXQUFXRSxRQUFRQyxJQUFJLENBQUNDLFFBQVEsQ0FBRSxVQUFZO1lBQ2xEZCxJQUFJLENBQUVFLEtBQU0sSUFBSU0sU0FBUztRQUMzQjtJQUNGO0FBQ0Y7QUFFRSxvQkFBQTtJQUNBLE1BQU1PLFFBQVFDLEdBQUcsQ0FBRWpCLE1BQU1rQixHQUFHLENBQUVmLENBQUFBLE9BQVFELFVBQVdDO0lBQ2pESCxNQUFNbUIsT0FBTyxDQUFFaEIsQ0FBQUE7UUFDYlUsUUFBUU8sTUFBTSxDQUFDQyxLQUFLLENBQUVwQixJQUFJLENBQUVFLEtBQU07SUFDcEM7QUFDRiJ9