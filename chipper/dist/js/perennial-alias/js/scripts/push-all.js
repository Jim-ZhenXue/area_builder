// Copyright 2021, University of Colorado Boulder
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
const fs = require('fs');
// constants
// Don't use getActiveRepos() since it cannot be run from the root
const contents = fs.readFileSync(`${__dirname}/../../data/active-repos`, 'utf8').trim();
const repos = contents.split('\n').map((sim)=>sim.trim());
/**
 * Push all active-repos
 *
 * USAGE:
 * cd ${root containing all repos}
 * node perennial/js/scripts/push-all.js
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ _async_to_generator(function*() {
    // const a = repos.map( repo => execute( 'git', 'log --branches --not --remotes --simplify-by-decoration --decorate --oneline'.split(' '), `${repo}`, {
    const promises = repos.map((repo)=>execute('git', 'log --branches --not --remotes --simplify-by-decoration --decorate --oneline'.split(' '), `${repo}`, {
            // resolve errors so Promise.all doesn't fail on first repo that cannot pull/rebase
            errors: 'resolve'
        }));
    const results = yield Promise.all(promises);
    // Find out which repos need to be pushed
    const pushRepos = [];
    for(let i = 0; i < results.length; i++){
        const repo = repos[i];
        const result = results[i];
        if (result.code === 0 && result.stdout.trim().length === 0 && result.stderr.trim().length === 0) {
        // was up-to-date
        } else {
            // needs to push
            pushRepos.push(repo);
        }
    }
    const pushPromises = pushRepos.map((repo)=>execute('git', [
            'push'
        ], `${repo}`, {
            // resolve errors so Promise.all doesn't fail on first repo that cannot pull/rebase
            errors: 'resolve'
        }));
    const pushResults = yield Promise.all(pushPromises);
    // Report results
    for(let i = 0; i < pushRepos.length; i++){
        const repo = pushRepos[i];
        const returnObject = pushResults[i];
        console.log(repo);
        if (returnObject.stdout.trim().length > 0) {
            console.log(returnObject.stdout);
        }
        if (returnObject.stderr.trim().length > 0) {
            console.log(returnObject.stderr);
        }
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3B1c2gtYWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuLi9jb21tb24vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5cbi8vIGNvbnN0YW50c1xuLy8gRG9uJ3QgdXNlIGdldEFjdGl2ZVJlcG9zKCkgc2luY2UgaXQgY2Fubm90IGJlIHJ1biBmcm9tIHRoZSByb290XG5jb25zdCBjb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyggYCR7X19kaXJuYW1lfS8uLi8uLi9kYXRhL2FjdGl2ZS1yZXBvc2AsICd1dGY4JyApLnRyaW0oKTtcbmNvbnN0IHJlcG9zID0gY29udGVudHMuc3BsaXQoICdcXG4nICkubWFwKCBzaW0gPT4gc2ltLnRyaW0oKSApO1xuXG4vKipcbiAqIFB1c2ggYWxsIGFjdGl2ZS1yZXBvc1xuICpcbiAqIFVTQUdFOlxuICogY2QgJHtyb290IGNvbnRhaW5pbmcgYWxsIHJlcG9zfVxuICogbm9kZSBwZXJlbm5pYWwvanMvc2NyaXB0cy9wdXNoLWFsbC5qc1xuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbiggYXN5bmMgKCkgPT4ge1xuXG4gIC8vIGNvbnN0IGEgPSByZXBvcy5tYXAoIHJlcG8gPT4gZXhlY3V0ZSggJ2dpdCcsICdsb2cgLS1icmFuY2hlcyAtLW5vdCAtLXJlbW90ZXMgLS1zaW1wbGlmeS1ieS1kZWNvcmF0aW9uIC0tZGVjb3JhdGUgLS1vbmVsaW5lJy5zcGxpdCgnICcpLCBgJHtyZXBvfWAsIHtcbiAgY29uc3QgcHJvbWlzZXMgPSByZXBvcy5tYXAoIHJlcG8gPT4gZXhlY3V0ZSggJ2dpdCcsICdsb2cgLS1icmFuY2hlcyAtLW5vdCAtLXJlbW90ZXMgLS1zaW1wbGlmeS1ieS1kZWNvcmF0aW9uIC0tZGVjb3JhdGUgLS1vbmVsaW5lJy5zcGxpdCggJyAnICksIGAke3JlcG99YCwge1xuXG4gICAgLy8gcmVzb2x2ZSBlcnJvcnMgc28gUHJvbWlzZS5hbGwgZG9lc24ndCBmYWlsIG9uIGZpcnN0IHJlcG8gdGhhdCBjYW5ub3QgcHVsbC9yZWJhc2VcbiAgICBlcnJvcnM6ICdyZXNvbHZlJ1xuICB9ICkgKTtcbiAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKCBwcm9taXNlcyApO1xuXG4gIC8vIEZpbmQgb3V0IHdoaWNoIHJlcG9zIG5lZWQgdG8gYmUgcHVzaGVkXG4gIGNvbnN0IHB1c2hSZXBvcyA9IFtdO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrICkge1xuICAgIGNvbnN0IHJlcG8gPSByZXBvc1sgaSBdO1xuICAgIGNvbnN0IHJlc3VsdCA9IHJlc3VsdHNbIGkgXTtcblxuICAgIGlmICggcmVzdWx0LmNvZGUgPT09IDAgJiYgcmVzdWx0LnN0ZG91dC50cmltKCkubGVuZ3RoID09PSAwICYmIHJlc3VsdC5zdGRlcnIudHJpbSgpLmxlbmd0aCA9PT0gMCApIHtcblxuICAgICAgLy8gd2FzIHVwLXRvLWRhdGVcbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgIC8vIG5lZWRzIHRvIHB1c2hcbiAgICAgIHB1c2hSZXBvcy5wdXNoKCByZXBvICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcHVzaFByb21pc2VzID0gcHVzaFJlcG9zLm1hcCggcmVwbyA9PiBleGVjdXRlKCAnZ2l0JywgWyAncHVzaCcgXSwgYCR7cmVwb31gLCB7XG5cbiAgICAvLyByZXNvbHZlIGVycm9ycyBzbyBQcm9taXNlLmFsbCBkb2Vzbid0IGZhaWwgb24gZmlyc3QgcmVwbyB0aGF0IGNhbm5vdCBwdWxsL3JlYmFzZVxuICAgIGVycm9yczogJ3Jlc29sdmUnXG4gIH0gKSApO1xuICBjb25zdCBwdXNoUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKCBwdXNoUHJvbWlzZXMgKTtcblxuICAvLyBSZXBvcnQgcmVzdWx0c1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwdXNoUmVwb3MubGVuZ3RoOyBpKysgKSB7XG4gICAgY29uc3QgcmVwbyA9IHB1c2hSZXBvc1sgaSBdO1xuICAgIGNvbnN0IHJldHVybk9iamVjdCA9IHB1c2hSZXN1bHRzWyBpIF07XG5cbiAgICBjb25zb2xlLmxvZyggcmVwbyApO1xuICAgIGlmICggcmV0dXJuT2JqZWN0LnN0ZG91dC50cmltKCkubGVuZ3RoID4gMCApIHtcbiAgICAgIGNvbnNvbGUubG9nKCByZXR1cm5PYmplY3Quc3Rkb3V0ICk7XG4gICAgfVxuICAgIGlmICggcmV0dXJuT2JqZWN0LnN0ZGVyci50cmltKCkubGVuZ3RoID4gMCApIHtcbiAgICAgIGNvbnNvbGUubG9nKCByZXR1cm5PYmplY3Quc3RkZXJyICk7XG4gICAgfVxuICB9XG59ICkoKTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0IiwiZnMiLCJjb250ZW50cyIsInJlYWRGaWxlU3luYyIsIl9fZGlybmFtZSIsInRyaW0iLCJyZXBvcyIsInNwbGl0IiwibWFwIiwic2ltIiwicHJvbWlzZXMiLCJyZXBvIiwiZXJyb3JzIiwicmVzdWx0cyIsIlByb21pc2UiLCJhbGwiLCJwdXNoUmVwb3MiLCJpIiwibGVuZ3RoIiwicmVzdWx0IiwiY29kZSIsInN0ZG91dCIsInN0ZGVyciIsInB1c2giLCJwdXNoUHJvbWlzZXMiLCJwdXNoUmVzdWx0cyIsInJldHVybk9iamVjdCIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWpELE1BQU1BLFVBQVVDLFFBQVMscUJBQXNCQyxPQUFPO0FBQ3RELE1BQU1DLEtBQUtGLFFBQVM7QUFFcEIsWUFBWTtBQUNaLGtFQUFrRTtBQUNsRSxNQUFNRyxXQUFXRCxHQUFHRSxZQUFZLENBQUUsR0FBR0MsVUFBVSx3QkFBd0IsQ0FBQyxFQUFFLFFBQVNDLElBQUk7QUFDdkYsTUFBTUMsUUFBUUosU0FBU0ssS0FBSyxDQUFFLE1BQU9DLEdBQUcsQ0FBRUMsQ0FBQUEsTUFBT0EsSUFBSUosSUFBSTtBQUV6RDs7Ozs7Ozs7Q0FRQyxHQUNDLG9CQUFBO0lBRUEsdUpBQXVKO0lBQ3ZKLE1BQU1LLFdBQVdKLE1BQU1FLEdBQUcsQ0FBRUcsQ0FBQUEsT0FBUWIsUUFBUyxPQUFPLCtFQUErRVMsS0FBSyxDQUFFLE1BQU8sR0FBR0ksTUFBTSxFQUFFO1lBRTFKLG1GQUFtRjtZQUNuRkMsUUFBUTtRQUNWO0lBQ0EsTUFBTUMsVUFBVSxNQUFNQyxRQUFRQyxHQUFHLENBQUVMO0lBRW5DLHlDQUF5QztJQUN6QyxNQUFNTSxZQUFZLEVBQUU7SUFDcEIsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElBQUlKLFFBQVFLLE1BQU0sRUFBRUQsSUFBTTtRQUN6QyxNQUFNTixPQUFPTCxLQUFLLENBQUVXLEVBQUc7UUFDdkIsTUFBTUUsU0FBU04sT0FBTyxDQUFFSSxFQUFHO1FBRTNCLElBQUtFLE9BQU9DLElBQUksS0FBSyxLQUFLRCxPQUFPRSxNQUFNLENBQUNoQixJQUFJLEdBQUdhLE1BQU0sS0FBSyxLQUFLQyxPQUFPRyxNQUFNLENBQUNqQixJQUFJLEdBQUdhLE1BQU0sS0FBSyxHQUFJO1FBRWpHLGlCQUFpQjtRQUNuQixPQUNLO1lBRUgsZ0JBQWdCO1lBQ2hCRixVQUFVTyxJQUFJLENBQUVaO1FBQ2xCO0lBQ0Y7SUFFQSxNQUFNYSxlQUFlUixVQUFVUixHQUFHLENBQUVHLENBQUFBLE9BQVFiLFFBQVMsT0FBTztZQUFFO1NBQVEsRUFBRSxHQUFHYSxNQUFNLEVBQUU7WUFFakYsbUZBQW1GO1lBQ25GQyxRQUFRO1FBQ1Y7SUFDQSxNQUFNYSxjQUFjLE1BQU1YLFFBQVFDLEdBQUcsQ0FBRVM7SUFFdkMsaUJBQWlCO0lBQ2pCLElBQU0sSUFBSVAsSUFBSSxHQUFHQSxJQUFJRCxVQUFVRSxNQUFNLEVBQUVELElBQU07UUFDM0MsTUFBTU4sT0FBT0ssU0FBUyxDQUFFQyxFQUFHO1FBQzNCLE1BQU1TLGVBQWVELFdBQVcsQ0FBRVIsRUFBRztRQUVyQ1UsUUFBUUMsR0FBRyxDQUFFakI7UUFDYixJQUFLZSxhQUFhTCxNQUFNLENBQUNoQixJQUFJLEdBQUdhLE1BQU0sR0FBRyxHQUFJO1lBQzNDUyxRQUFRQyxHQUFHLENBQUVGLGFBQWFMLE1BQU07UUFDbEM7UUFDQSxJQUFLSyxhQUFhSixNQUFNLENBQUNqQixJQUFJLEdBQUdhLE1BQU0sR0FBRyxHQUFJO1lBQzNDUyxRQUFRQyxHQUFHLENBQUVGLGFBQWFKLE1BQU07UUFDbEM7SUFDRjtBQUNGIn0=