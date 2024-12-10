// Copyright 2021, University of Colorado Boulder
/**
 * Rebases and pushes repos that are ahead of origin, with consolidated status/error output.
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
const gitIsClean = require('../common/gitIsClean');
const gitPullRebase = require('../common/gitPullRebase');
const gitPush = require('../common/gitPush');
const winston = require('winston');
winston.default.transports.console.level = 'error';
// ANSI escape sequences to move to the right (in the same line) or to apply or reset colors
const red = '\u001b[31m';
const green = '\u001b[32m';
const reset = '\u001b[0m';
const repos = getActiveRepos();
const data = {};
let ok = true;
const rebasePushNeeded = /*#__PURE__*/ _async_to_generator(function*(repo) {
    data[repo] = '';
    try {
        const symbolicRef = (yield execute('git', [
            'symbolic-ref',
            '-q',
            'HEAD'
        ], `../${repo}`)).trim();
        const branch = symbolicRef.replace('refs/heads/', '');
        const trackShort = branch ? (yield execute('git', [
            'for-each-ref',
            '--format=%(push:trackshort)',
            symbolicRef
        ], `../${repo}`)).trim() : '';
        // If it's ahead at all
        if (trackShort.includes('>')) {
            if (yield gitIsClean(repo)) {
                yield gitPullRebase(repo);
            } else {
                data[repo] += `${red}${repo} not clean, skipping pull${reset}\n`;
            }
            if (branch) {
                yield gitPush(repo, branch);
                data[repo] += `${green}${repo} pushed\n`;
            } else {
                data[repo] += `${red}${repo} no branch, skipping push${reset}\n`;
                ok = false;
            }
        }
    } catch (e) {
        data[repo] += `${repo} ERROR: ${e}\n`;
        ok = false;
    }
});
_async_to_generator(function*() {
    yield Promise.all(repos.map((repo)=>rebasePushNeeded(repo)));
    repos.forEach((repo)=>{
        process.stdout.write(data[repo]);
    });
    console.log(`\n${ok ? green : red}-----=====] finished [=====-----${reset}\n`);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3JlYmFzZS1wdXNoLW5lZWRlZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmViYXNlcyBhbmQgcHVzaGVzIHJlcG9zIHRoYXQgYXJlIGFoZWFkIG9mIG9yaWdpbiwgd2l0aCBjb25zb2xpZGF0ZWQgc3RhdHVzL2Vycm9yIG91dHB1dC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuLi9jb21tb24vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3QgZ2V0QWN0aXZlUmVwb3MgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dldEFjdGl2ZVJlcG9zJyApO1xuY29uc3QgZ2l0SXNDbGVhbiA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0SXNDbGVhbicgKTtcbmNvbnN0IGdpdFB1bGxSZWJhc2UgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdFB1bGxSZWJhc2UnICk7XG5jb25zdCBnaXRQdXNoID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRQdXNoJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG53aW5zdG9uLmRlZmF1bHQudHJhbnNwb3J0cy5jb25zb2xlLmxldmVsID0gJ2Vycm9yJztcblxuLy8gQU5TSSBlc2NhcGUgc2VxdWVuY2VzIHRvIG1vdmUgdG8gdGhlIHJpZ2h0IChpbiB0aGUgc2FtZSBsaW5lKSBvciB0byBhcHBseSBvciByZXNldCBjb2xvcnNcbmNvbnN0IHJlZCA9ICdcXHUwMDFiWzMxbSc7XG5jb25zdCBncmVlbiA9ICdcXHUwMDFiWzMybSc7XG5jb25zdCByZXNldCA9ICdcXHUwMDFiWzBtJztcblxuY29uc3QgcmVwb3MgPSBnZXRBY3RpdmVSZXBvcygpO1xuY29uc3QgZGF0YSA9IHt9O1xubGV0IG9rID0gdHJ1ZTtcblxuY29uc3QgcmViYXNlUHVzaE5lZWRlZCA9IGFzeW5jIHJlcG8gPT4ge1xuICBkYXRhWyByZXBvIF0gPSAnJztcblxuICB0cnkge1xuICAgIGNvbnN0IHN5bWJvbGljUmVmID0gKCBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnc3ltYm9saWMtcmVmJywgJy1xJywgJ0hFQUQnIF0sIGAuLi8ke3JlcG99YCApICkudHJpbSgpO1xuICAgIGNvbnN0IGJyYW5jaCA9IHN5bWJvbGljUmVmLnJlcGxhY2UoICdyZWZzL2hlYWRzLycsICcnICk7XG4gICAgY29uc3QgdHJhY2tTaG9ydCA9IGJyYW5jaCA/ICggYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2Zvci1lYWNoLXJlZicsICctLWZvcm1hdD0lKHB1c2g6dHJhY2tzaG9ydCknLCBzeW1ib2xpY1JlZiBdLCBgLi4vJHtyZXBvfWAgKSApLnRyaW0oKSA6ICcnO1xuXG4gICAgLy8gSWYgaXQncyBhaGVhZCBhdCBhbGxcbiAgICBpZiAoIHRyYWNrU2hvcnQuaW5jbHVkZXMoICc+JyApICkge1xuICAgICAgaWYgKCBhd2FpdCBnaXRJc0NsZWFuKCByZXBvICkgKSB7XG4gICAgICAgIGF3YWl0IGdpdFB1bGxSZWJhc2UoIHJlcG8gKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBkYXRhWyByZXBvIF0gKz0gYCR7cmVkfSR7cmVwb30gbm90IGNsZWFuLCBza2lwcGluZyBwdWxsJHtyZXNldH1cXG5gO1xuICAgICAgfVxuXG4gICAgICBpZiAoIGJyYW5jaCApIHtcbiAgICAgICAgYXdhaXQgZ2l0UHVzaCggcmVwbywgYnJhbmNoICk7XG4gICAgICAgIGRhdGFbIHJlcG8gXSArPSBgJHtncmVlbn0ke3JlcG99IHB1c2hlZFxcbmA7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZGF0YVsgcmVwbyBdICs9IGAke3JlZH0ke3JlcG99IG5vIGJyYW5jaCwgc2tpcHBpbmcgcHVzaCR7cmVzZXR9XFxuYDtcbiAgICAgICAgb2sgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgZGF0YVsgcmVwbyBdICs9IGAke3JlcG99IEVSUk9SOiAke2V9XFxuYDtcbiAgICBvayA9IGZhbHNlO1xuICB9XG59O1xuXG4oIGFzeW5jICgpID0+IHtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoIHJlcG9zLm1hcCggcmVwbyA9PiByZWJhc2VQdXNoTmVlZGVkKCByZXBvICkgKSApO1xuXG4gIHJlcG9zLmZvckVhY2goIHJlcG8gPT4ge1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCBkYXRhWyByZXBvIF0gKTtcbiAgfSApO1xuXG4gIGNvbnNvbGUubG9nKCBgXFxuJHtvayA/IGdyZWVuIDogcmVkfS0tLS0tPT09PT1dIGZpbmlzaGVkIFs9PT09PS0tLS0tJHtyZXNldH1cXG5gICk7XG59ICkoKTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0IiwiZ2V0QWN0aXZlUmVwb3MiLCJnaXRJc0NsZWFuIiwiZ2l0UHVsbFJlYmFzZSIsImdpdFB1c2giLCJ3aW5zdG9uIiwidHJhbnNwb3J0cyIsImNvbnNvbGUiLCJsZXZlbCIsInJlZCIsImdyZWVuIiwicmVzZXQiLCJyZXBvcyIsImRhdGEiLCJvayIsInJlYmFzZVB1c2hOZWVkZWQiLCJyZXBvIiwic3ltYm9saWNSZWYiLCJ0cmltIiwiYnJhbmNoIiwicmVwbGFjZSIsInRyYWNrU2hvcnQiLCJpbmNsdWRlcyIsImUiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiZm9yRWFjaCIsInByb2Nlc3MiLCJzdGRvdXQiLCJ3cml0ZSIsImxvZyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsVUFBVUMsUUFBUyxxQkFBc0JDLE9BQU87QUFDdEQsTUFBTUMsaUJBQWlCRixRQUFTO0FBQ2hDLE1BQU1HLGFBQWFILFFBQVM7QUFDNUIsTUFBTUksZ0JBQWdCSixRQUFTO0FBQy9CLE1BQU1LLFVBQVVMLFFBQVM7QUFDekIsTUFBTU0sVUFBVU4sUUFBUztBQUV6Qk0sUUFBUUwsT0FBTyxDQUFDTSxVQUFVLENBQUNDLE9BQU8sQ0FBQ0MsS0FBSyxHQUFHO0FBRTNDLDRGQUE0RjtBQUM1RixNQUFNQyxNQUFNO0FBQ1osTUFBTUMsUUFBUTtBQUNkLE1BQU1DLFFBQVE7QUFFZCxNQUFNQyxRQUFRWDtBQUNkLE1BQU1ZLE9BQU8sQ0FBQztBQUNkLElBQUlDLEtBQUs7QUFFVCxNQUFNQyxxREFBbUIsVUFBTUM7SUFDN0JILElBQUksQ0FBRUcsS0FBTSxHQUFHO0lBRWYsSUFBSTtRQUNGLE1BQU1DLGNBQWMsQUFBRSxDQUFBLE1BQU1uQixRQUFTLE9BQU87WUFBRTtZQUFnQjtZQUFNO1NBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRWtCLE1BQU0sQ0FBQyxFQUFJRSxJQUFJO1FBQ25HLE1BQU1DLFNBQVNGLFlBQVlHLE9BQU8sQ0FBRSxlQUFlO1FBQ25ELE1BQU1DLGFBQWFGLFNBQVMsQUFBRSxDQUFBLE1BQU1yQixRQUFTLE9BQU87WUFBRTtZQUFnQjtZQUErQm1CO1NBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRUQsTUFBTSxDQUFDLEVBQUlFLElBQUksS0FBSztRQUU5SSx1QkFBdUI7UUFDdkIsSUFBS0csV0FBV0MsUUFBUSxDQUFFLE1BQVE7WUFDaEMsSUFBSyxNQUFNcEIsV0FBWWMsT0FBUztnQkFDOUIsTUFBTWIsY0FBZWE7WUFDdkIsT0FDSztnQkFDSEgsSUFBSSxDQUFFRyxLQUFNLElBQUksR0FBR1AsTUFBTU8sS0FBSyx5QkFBeUIsRUFBRUwsTUFBTSxFQUFFLENBQUM7WUFDcEU7WUFFQSxJQUFLUSxRQUFTO2dCQUNaLE1BQU1mLFFBQVNZLE1BQU1HO2dCQUNyQk4sSUFBSSxDQUFFRyxLQUFNLElBQUksR0FBR04sUUFBUU0sS0FBSyxTQUFTLENBQUM7WUFDNUMsT0FDSztnQkFDSEgsSUFBSSxDQUFFRyxLQUFNLElBQUksR0FBR1AsTUFBTU8sS0FBSyx5QkFBeUIsRUFBRUwsTUFBTSxFQUFFLENBQUM7Z0JBQ2xFRyxLQUFLO1lBQ1A7UUFDRjtJQUNGLEVBQ0EsT0FBT1MsR0FBSTtRQUNUVixJQUFJLENBQUVHLEtBQU0sSUFBSSxHQUFHQSxLQUFLLFFBQVEsRUFBRU8sRUFBRSxFQUFFLENBQUM7UUFDdkNULEtBQUs7SUFDUDtBQUNGO0FBRUUsb0JBQUE7SUFDQSxNQUFNVSxRQUFRQyxHQUFHLENBQUViLE1BQU1jLEdBQUcsQ0FBRVYsQ0FBQUEsT0FBUUQsaUJBQWtCQztJQUV4REosTUFBTWUsT0FBTyxDQUFFWCxDQUFBQTtRQUNiWSxRQUFRQyxNQUFNLENBQUNDLEtBQUssQ0FBRWpCLElBQUksQ0FBRUcsS0FBTTtJQUNwQztJQUVBVCxRQUFRd0IsR0FBRyxDQUFFLENBQUMsRUFBRSxFQUFFakIsS0FBS0osUUFBUUQsSUFBSSxnQ0FBZ0MsRUFBRUUsTUFBTSxFQUFFLENBQUM7QUFDaEYifQ==