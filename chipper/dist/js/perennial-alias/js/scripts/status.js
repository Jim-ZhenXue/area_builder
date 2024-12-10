// Copyright 2021, University of Colorado Boulder
/**
 * Checks status for repos, and prints it out to the console
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
const getActiveRepos = require('../common/getActiveRepos');
const gitStatus = require('../common/gitStatus');
const winston = require('winston');
winston.default.transports.console.level = 'error';
// ANSI escape sequences to move to the right (in the same line) or to apply or reset colors
const moveRight = '\u001b[42G';
const red = '\u001b[31m';
const green = '\u001b[32m';
const reset = '\u001b[0m';
const repos = getActiveRepos();
const data = {};
const getStatus = /*#__PURE__*/ _async_to_generator(function*(repo) {
    data[repo] = '';
    const status = yield gitStatus(repo);
    let isGreen = false;
    if (status.branch) {
        isGreen = !status.status && status.branch === 'main' && status.ahead === 0;
        if (!isGreen || process.argv.includes('--all')) {
            data[repo] += `${repo}${moveRight}${isGreen ? green : red}${status.branch}${reset}${status.ahead === 0 ? '' : ` ahead ${status.ahead}`}${status.behind === 0 ? '' : ` behind ${status.behind}`}\n`;
        }
    } else {
        // if no branch, print our SHA (detached head)
        data[repo] += `${repo}${moveRight}${red}${status.sha}${reset}\n`;
    }
    if (status.status) {
        if (!isGreen || process.argv.includes('--all')) {
            data[repo] += status.status + '\n';
        }
    }
});
_async_to_generator(function*() {
    yield Promise.all(repos.map((repo)=>getStatus(repo)));
    repos.forEach((repo)=>{
        process.stdout.write(data[repo]);
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3N0YXR1cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ2hlY2tzIHN0YXR1cyBmb3IgcmVwb3MsIGFuZCBwcmludHMgaXQgb3V0IHRvIHRoZSBjb25zb2xlXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGdldEFjdGl2ZVJlcG9zID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRBY3RpdmVSZXBvcycgKTtcbmNvbnN0IGdpdFN0YXR1cyA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0U3RhdHVzJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG53aW5zdG9uLmRlZmF1bHQudHJhbnNwb3J0cy5jb25zb2xlLmxldmVsID0gJ2Vycm9yJztcblxuLy8gQU5TSSBlc2NhcGUgc2VxdWVuY2VzIHRvIG1vdmUgdG8gdGhlIHJpZ2h0IChpbiB0aGUgc2FtZSBsaW5lKSBvciB0byBhcHBseSBvciByZXNldCBjb2xvcnNcbmNvbnN0IG1vdmVSaWdodCA9ICdcXHUwMDFiWzQyRyc7XG5jb25zdCByZWQgPSAnXFx1MDAxYlszMW0nO1xuY29uc3QgZ3JlZW4gPSAnXFx1MDAxYlszMm0nO1xuY29uc3QgcmVzZXQgPSAnXFx1MDAxYlswbSc7XG5cbmNvbnN0IHJlcG9zID0gZ2V0QWN0aXZlUmVwb3MoKTtcbmNvbnN0IGRhdGEgPSB7fTtcblxuY29uc3QgZ2V0U3RhdHVzID0gYXN5bmMgcmVwbyA9PiB7XG4gIGRhdGFbIHJlcG8gXSA9ICcnO1xuXG4gIGNvbnN0IHN0YXR1cyA9IGF3YWl0IGdpdFN0YXR1cyggcmVwbyApO1xuXG4gIGxldCBpc0dyZWVuID0gZmFsc2U7XG4gIGlmICggc3RhdHVzLmJyYW5jaCApIHtcbiAgICBpc0dyZWVuID0gIXN0YXR1cy5zdGF0dXMgJiYgc3RhdHVzLmJyYW5jaCA9PT0gJ21haW4nICYmIHN0YXR1cy5haGVhZCA9PT0gMDtcblxuICAgIGlmICggIWlzR3JlZW4gfHwgcHJvY2Vzcy5hcmd2LmluY2x1ZGVzKCAnLS1hbGwnICkgKSB7XG4gICAgICBkYXRhWyByZXBvIF0gKz0gYCR7cmVwb30ke21vdmVSaWdodH0ke2lzR3JlZW4gPyBncmVlbiA6IHJlZH0ke3N0YXR1cy5icmFuY2h9JHtyZXNldH0ke3N0YXR1cy5haGVhZCA9PT0gMCA/ICcnIDogYCBhaGVhZCAke3N0YXR1cy5haGVhZH1gfSR7c3RhdHVzLmJlaGluZCA9PT0gMCA/ICcnIDogYCBiZWhpbmQgJHtzdGF0dXMuYmVoaW5kfWB9XFxuYDtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gaWYgbm8gYnJhbmNoLCBwcmludCBvdXIgU0hBIChkZXRhY2hlZCBoZWFkKVxuICAgIGRhdGFbIHJlcG8gXSArPSBgJHtyZXBvfSR7bW92ZVJpZ2h0fSR7cmVkfSR7c3RhdHVzLnNoYX0ke3Jlc2V0fVxcbmA7XG4gIH1cblxuICBpZiAoIHN0YXR1cy5zdGF0dXMgKSB7XG4gICAgaWYgKCAhaXNHcmVlbiB8fCBwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoICctLWFsbCcgKSApIHtcbiAgICAgIGRhdGFbIHJlcG8gXSArPSBzdGF0dXMuc3RhdHVzICsgJ1xcbic7XG4gICAgfVxuICB9XG59O1xuXG4oIGFzeW5jICgpID0+IHtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoIHJlcG9zLm1hcCggcmVwbyA9PiBnZXRTdGF0dXMoIHJlcG8gKSApICk7XG4gIHJlcG9zLmZvckVhY2goIHJlcG8gPT4ge1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCBkYXRhWyByZXBvIF0gKTtcbiAgfSApO1xufSApKCk7Il0sIm5hbWVzIjpbImdldEFjdGl2ZVJlcG9zIiwicmVxdWlyZSIsImdpdFN0YXR1cyIsIndpbnN0b24iLCJkZWZhdWx0IiwidHJhbnNwb3J0cyIsImNvbnNvbGUiLCJsZXZlbCIsIm1vdmVSaWdodCIsInJlZCIsImdyZWVuIiwicmVzZXQiLCJyZXBvcyIsImRhdGEiLCJnZXRTdGF0dXMiLCJyZXBvIiwic3RhdHVzIiwiaXNHcmVlbiIsImJyYW5jaCIsImFoZWFkIiwicHJvY2VzcyIsImFyZ3YiLCJpbmNsdWRlcyIsImJlaGluZCIsInNoYSIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJmb3JFYWNoIiwic3Rkb3V0Iiwid3JpdGUiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGlCQUFpQkMsUUFBUztBQUNoQyxNQUFNQyxZQUFZRCxRQUFTO0FBQzNCLE1BQU1FLFVBQVVGLFFBQVM7QUFFekJFLFFBQVFDLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDQyxPQUFPLENBQUNDLEtBQUssR0FBRztBQUUzQyw0RkFBNEY7QUFDNUYsTUFBTUMsWUFBWTtBQUNsQixNQUFNQyxNQUFNO0FBQ1osTUFBTUMsUUFBUTtBQUNkLE1BQU1DLFFBQVE7QUFFZCxNQUFNQyxRQUFRWjtBQUNkLE1BQU1hLE9BQU8sQ0FBQztBQUVkLE1BQU1DLDhDQUFZLFVBQU1DO0lBQ3RCRixJQUFJLENBQUVFLEtBQU0sR0FBRztJQUVmLE1BQU1DLFNBQVMsTUFBTWQsVUFBV2E7SUFFaEMsSUFBSUUsVUFBVTtJQUNkLElBQUtELE9BQU9FLE1BQU0sRUFBRztRQUNuQkQsVUFBVSxDQUFDRCxPQUFPQSxNQUFNLElBQUlBLE9BQU9FLE1BQU0sS0FBSyxVQUFVRixPQUFPRyxLQUFLLEtBQUs7UUFFekUsSUFBSyxDQUFDRixXQUFXRyxRQUFRQyxJQUFJLENBQUNDLFFBQVEsQ0FBRSxVQUFZO1lBQ2xEVCxJQUFJLENBQUVFLEtBQU0sSUFBSSxHQUFHQSxPQUFPUCxZQUFZUyxVQUFVUCxRQUFRRCxNQUFNTyxPQUFPRSxNQUFNLEdBQUdQLFFBQVFLLE9BQU9HLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUVILE9BQU9HLEtBQUssRUFBRSxHQUFHSCxPQUFPTyxNQUFNLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFUCxPQUFPTyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdE07SUFDRixPQUNLO1FBQ0gsOENBQThDO1FBQzlDVixJQUFJLENBQUVFLEtBQU0sSUFBSSxHQUFHQSxPQUFPUCxZQUFZQyxNQUFNTyxPQUFPUSxHQUFHLEdBQUdiLE1BQU0sRUFBRSxDQUFDO0lBQ3BFO0lBRUEsSUFBS0ssT0FBT0EsTUFBTSxFQUFHO1FBQ25CLElBQUssQ0FBQ0MsV0FBV0csUUFBUUMsSUFBSSxDQUFDQyxRQUFRLENBQUUsVUFBWTtZQUNsRFQsSUFBSSxDQUFFRSxLQUFNLElBQUlDLE9BQU9BLE1BQU0sR0FBRztRQUNsQztJQUNGO0FBQ0Y7QUFFRSxvQkFBQTtJQUNBLE1BQU1TLFFBQVFDLEdBQUcsQ0FBRWQsTUFBTWUsR0FBRyxDQUFFWixDQUFBQSxPQUFRRCxVQUFXQztJQUNqREgsTUFBTWdCLE9BQU8sQ0FBRWIsQ0FBQUE7UUFDYkssUUFBUVMsTUFBTSxDQUFDQyxLQUFLLENBQUVqQixJQUFJLENBQUVFLEtBQU07SUFDcEM7QUFDRiJ9