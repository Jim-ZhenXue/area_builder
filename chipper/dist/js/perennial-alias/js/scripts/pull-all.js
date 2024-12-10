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
const _ = require('lodash');
// constants
// Don't use getActiveRepos() since it cannot be run from the root
const contents = fs.readFileSync(`${__dirname}/../../data/active-repos`, 'utf8').trim();
const repos = contents.split('\n').map((sim)=>sim.trim());
/**
 * Pulls all repos (with rebase)
 *
 * USAGE:
 * cd ${root containing all repos}
 * node perennial/js/scripts/pull-all.js
 *
 * OPTIONS:
 * --batches=N - (1) by default, runing all pulls in parallel. Specify this to separate into N different synchronous chunks running repos/batches number of repos in parallel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ _async_to_generator(function*() {
    const batchesMatch = process.argv.join(' ').match(/--batches=(\d+)/);
    const batches = batchesMatch ? batchesMatch[1] : 1;
    const CHUNK_SIZE = repos.length / batches;
    for (const chunkOfRepos of _.chunk(repos, CHUNK_SIZE)){
        const childPulls = chunkOfRepos.map((repo)=>execute('git', [
                'pull',
                '--rebase'
            ], `${repo}`, {
                // resolve errors so Promise.all doesn't fail on first repo that cannot pull/rebase
                errors: 'resolve'
            }));
        const results = yield Promise.all(childPulls);
        // Report results
        for(let i = 0; i < results.length; i++){
            const repo = chunkOfRepos[i];
            const result = results[i];
            if (result.code === 0 && result.stderr === '' && (result.stdout === 'Already up to date.\nCurrent branch main is up to date.\n' || result.stdout === 'Already up to date.\n' || result.stdout === 'Current branch main is up to date.\n')) {
            // nothing to do
            } else {
                console.log('##', repo);
                result.stdout.trim().length > 0 && console.log(result.stdout);
                result.stderr.trim().length > 0 && console.log(result.stderr);
                result.error && console.log(result.error);
            }
        }
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3B1bGwtYWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuLi9jb21tb24vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcblxuLy8gY29uc3RhbnRzXG4vLyBEb24ndCB1c2UgZ2V0QWN0aXZlUmVwb3MoKSBzaW5jZSBpdCBjYW5ub3QgYmUgcnVuIGZyb20gdGhlIHJvb3RcbmNvbnN0IGNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKCBgJHtfX2Rpcm5hbWV9Ly4uLy4uL2RhdGEvYWN0aXZlLXJlcG9zYCwgJ3V0ZjgnICkudHJpbSgpO1xuY29uc3QgcmVwb3MgPSBjb250ZW50cy5zcGxpdCggJ1xcbicgKS5tYXAoIHNpbSA9PiBzaW0udHJpbSgpICk7XG5cbi8qKlxuICogUHVsbHMgYWxsIHJlcG9zICh3aXRoIHJlYmFzZSlcbiAqXG4gKiBVU0FHRTpcbiAqIGNkICR7cm9vdCBjb250YWluaW5nIGFsbCByZXBvc31cbiAqIG5vZGUgcGVyZW5uaWFsL2pzL3NjcmlwdHMvcHVsbC1hbGwuanNcbiAqXG4gKiBPUFRJT05TOlxuICogLS1iYXRjaGVzPU4gLSAoMSkgYnkgZGVmYXVsdCwgcnVuaW5nIGFsbCBwdWxscyBpbiBwYXJhbGxlbC4gU3BlY2lmeSB0aGlzIHRvIHNlcGFyYXRlIGludG8gTiBkaWZmZXJlbnQgc3luY2hyb25vdXMgY2h1bmtzIHJ1bm5pbmcgcmVwb3MvYmF0Y2hlcyBudW1iZXIgb2YgcmVwb3MgaW4gcGFyYWxsZWwuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuKCBhc3luYyAoKSA9PiB7XG5cbiAgY29uc3QgYmF0Y2hlc01hdGNoID0gcHJvY2Vzcy5hcmd2LmpvaW4oICcgJyApLm1hdGNoKCAvLS1iYXRjaGVzPShcXGQrKS8gKTtcbiAgY29uc3QgYmF0Y2hlcyA9IGJhdGNoZXNNYXRjaCA/IGJhdGNoZXNNYXRjaFsgMSBdIDogMTtcbiAgY29uc3QgQ0hVTktfU0laRSA9IHJlcG9zLmxlbmd0aCAvIGJhdGNoZXM7XG5cbiAgZm9yICggY29uc3QgY2h1bmtPZlJlcG9zIG9mIF8uY2h1bmsoIHJlcG9zLCBDSFVOS19TSVpFICkgKSB7XG4gICAgY29uc3QgY2hpbGRQdWxscyA9IGNodW5rT2ZSZXBvcy5tYXAoIHJlcG8gPT4gZXhlY3V0ZSggJ2dpdCcsIFsgJ3B1bGwnLCAnLS1yZWJhc2UnIF0sIGAke3JlcG99YCwge1xuXG4gICAgICAvLyByZXNvbHZlIGVycm9ycyBzbyBQcm9taXNlLmFsbCBkb2Vzbid0IGZhaWwgb24gZmlyc3QgcmVwbyB0aGF0IGNhbm5vdCBwdWxsL3JlYmFzZVxuICAgICAgZXJyb3JzOiAncmVzb2x2ZSdcbiAgICB9ICkgKTtcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGwoIGNoaWxkUHVsbHMgKTtcblxuICAgIC8vIFJlcG9ydCByZXN1bHRzXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHJlcG8gPSBjaHVua09mUmVwb3NbIGkgXTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3VsdHNbIGkgXTtcblxuICAgICAgaWYgKCByZXN1bHQuY29kZSA9PT0gMCAmJiByZXN1bHQuc3RkZXJyID09PSAnJyAmJiAoIHJlc3VsdC5zdGRvdXQgPT09ICdBbHJlYWR5IHVwIHRvIGRhdGUuXFxuQ3VycmVudCBicmFuY2ggbWFpbiBpcyB1cCB0byBkYXRlLlxcbicgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuc3Rkb3V0ID09PSAnQWxyZWFkeSB1cCB0byBkYXRlLlxcbicgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuc3Rkb3V0ID09PSAnQ3VycmVudCBicmFuY2ggbWFpbiBpcyB1cCB0byBkYXRlLlxcbicgKSApIHtcbiAgICAgICAgLy8gbm90aGluZyB0byBkb1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnIyMnLCByZXBvICk7XG4gICAgICAgIHJlc3VsdC5zdGRvdXQudHJpbSgpLmxlbmd0aCA+IDAgJiYgY29uc29sZS5sb2coIHJlc3VsdC5zdGRvdXQgKTtcbiAgICAgICAgcmVzdWx0LnN0ZGVyci50cmltKCkubGVuZ3RoID4gMCAmJiBjb25zb2xlLmxvZyggcmVzdWx0LnN0ZGVyciApO1xuICAgICAgICByZXN1bHQuZXJyb3IgJiYgY29uc29sZS5sb2coIHJlc3VsdC5lcnJvciApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSApKCk7Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsImZzIiwiXyIsImNvbnRlbnRzIiwicmVhZEZpbGVTeW5jIiwiX19kaXJuYW1lIiwidHJpbSIsInJlcG9zIiwic3BsaXQiLCJtYXAiLCJzaW0iLCJiYXRjaGVzTWF0Y2giLCJwcm9jZXNzIiwiYXJndiIsImpvaW4iLCJtYXRjaCIsImJhdGNoZXMiLCJDSFVOS19TSVpFIiwibGVuZ3RoIiwiY2h1bmtPZlJlcG9zIiwiY2h1bmsiLCJjaGlsZFB1bGxzIiwicmVwbyIsImVycm9ycyIsInJlc3VsdHMiLCJQcm9taXNlIiwiYWxsIiwiaSIsInJlc3VsdCIsImNvZGUiLCJzdGRlcnIiLCJzdGRvdXQiLCJjb25zb2xlIiwibG9nIiwiZXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWpELE1BQU1BLFVBQVVDLFFBQVMscUJBQXNCQyxPQUFPO0FBQ3RELE1BQU1DLEtBQUtGLFFBQVM7QUFDcEIsTUFBTUcsSUFBSUgsUUFBUztBQUVuQixZQUFZO0FBQ1osa0VBQWtFO0FBQ2xFLE1BQU1JLFdBQVdGLEdBQUdHLFlBQVksQ0FBRSxHQUFHQyxVQUFVLHdCQUF3QixDQUFDLEVBQUUsUUFBU0MsSUFBSTtBQUN2RixNQUFNQyxRQUFRSixTQUFTSyxLQUFLLENBQUUsTUFBT0MsR0FBRyxDQUFFQyxDQUFBQSxNQUFPQSxJQUFJSixJQUFJO0FBRXpEOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNDLG9CQUFBO0lBRUEsTUFBTUssZUFBZUMsUUFBUUMsSUFBSSxDQUFDQyxJQUFJLENBQUUsS0FBTUMsS0FBSyxDQUFFO0lBQ3JELE1BQU1DLFVBQVVMLGVBQWVBLFlBQVksQ0FBRSxFQUFHLEdBQUc7SUFDbkQsTUFBTU0sYUFBYVYsTUFBTVcsTUFBTSxHQUFHRjtJQUVsQyxLQUFNLE1BQU1HLGdCQUFnQmpCLEVBQUVrQixLQUFLLENBQUViLE9BQU9VLFlBQWU7UUFDekQsTUFBTUksYUFBYUYsYUFBYVYsR0FBRyxDQUFFYSxDQUFBQSxPQUFReEIsUUFBUyxPQUFPO2dCQUFFO2dCQUFRO2FBQVksRUFBRSxHQUFHd0IsTUFBTSxFQUFFO2dCQUU5RixtRkFBbUY7Z0JBQ25GQyxRQUFRO1lBQ1Y7UUFDQSxNQUFNQyxVQUFVLE1BQU1DLFFBQVFDLEdBQUcsQ0FBRUw7UUFFbkMsaUJBQWlCO1FBQ2pCLElBQU0sSUFBSU0sSUFBSSxHQUFHQSxJQUFJSCxRQUFRTixNQUFNLEVBQUVTLElBQU07WUFDekMsTUFBTUwsT0FBT0gsWUFBWSxDQUFFUSxFQUFHO1lBQzlCLE1BQU1DLFNBQVNKLE9BQU8sQ0FBRUcsRUFBRztZQUUzQixJQUFLQyxPQUFPQyxJQUFJLEtBQUssS0FBS0QsT0FBT0UsTUFBTSxLQUFLLE1BQVFGLENBQUFBLE9BQU9HLE1BQU0sS0FBSywrREFDbEJILE9BQU9HLE1BQU0sS0FBSywyQkFDbEJILE9BQU9HLE1BQU0sS0FBSyxzQ0FBcUMsR0FBTTtZQUMvRyxnQkFBZ0I7WUFDbEIsT0FDSztnQkFDSEMsUUFBUUMsR0FBRyxDQUFFLE1BQU1YO2dCQUNuQk0sT0FBT0csTUFBTSxDQUFDekIsSUFBSSxHQUFHWSxNQUFNLEdBQUcsS0FBS2MsUUFBUUMsR0FBRyxDQUFFTCxPQUFPRyxNQUFNO2dCQUM3REgsT0FBT0UsTUFBTSxDQUFDeEIsSUFBSSxHQUFHWSxNQUFNLEdBQUcsS0FBS2MsUUFBUUMsR0FBRyxDQUFFTCxPQUFPRSxNQUFNO2dCQUM3REYsT0FBT00sS0FBSyxJQUFJRixRQUFRQyxHQUFHLENBQUVMLE9BQU9NLEtBQUs7WUFDM0M7UUFDRjtJQUNGO0FBQ0YifQ==