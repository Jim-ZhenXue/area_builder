// Copyright 2024, University of Colorado Boulder
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
import child_process from 'child_process';
import path from 'path';
import dirname from '../../../perennial-alias/js/common/dirname.js';
import getActiveRepos from '../../../perennial-alias/js/common/getActiveRepos.js';
// @ts-expect-error ok to use import meta here
const __dirname = dirname(import.meta.url);
/**
 * Detect uncommitted changes in each repo.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ export default function getReposWithWorkingCopyChanges() {
    return _getReposWithWorkingCopyChanges.apply(this, arguments);
}
function _getReposWithWorkingCopyChanges() {
    _getReposWithWorkingCopyChanges = _async_to_generator(function*() {
        const activeRepos = getActiveRepos();
        const execOnRepos = /*#__PURE__*/ _async_to_generator(function*(repoSubset, command) {
            const promises = repoSubset.map((repo)=>{
                const cwd = path.resolve(__dirname, '../../../', repo);
                return new Promise((resolve)=>child_process.exec(command, {
                        cwd: cwd
                    }, (error)=>resolve(error)));
            });
            const results = yield Promise.all(promises);
            // Find out which repos have uncommitted changes
            const changedRepos = [];
            for(let i = 0; i < results.length; i++){
                if (results[i] !== null) {
                    changedRepos.push(repoSubset[i]);
                }
            }
            return changedRepos;
        });
        // Detect uncommitted changes in each repo:
        // https://stackoverflow.com/questions/3878624/how-do-i-programmatically-determine-if-there-are-uncommitted-changes
        // git diff-index --quiet HEAD --
        // This will error if the diff-index shows any changes in the repo, otherwise error is null.
        const changedRepos = yield execOnRepos(activeRepos, 'git update-index --refresh && git diff-index --quiet HEAD --');
        console.log('detected changed repos: ' + changedRepos.join(', '));
        return changedRepos;
    });
    return _getReposWithWorkingCopyChanges.apply(this, arguments);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9nZXRSZXBvc1dpdGhXb3JraW5nQ29weUNoYW5nZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGRpcm5hbWUgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9kaXJuYW1lLmpzJztcbmltcG9ydCBnZXRBY3RpdmVSZXBvcyBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL2dldEFjdGl2ZVJlcG9zLmpzJztcbmltcG9ydCB7IFJlcG8gfSBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvYnJvd3Nlci1hbmQtbm9kZS9QZXJlbm5pYWxUeXBlcy5qcyc7XG5cbi8vIEB0cy1leHBlY3QtZXJyb3Igb2sgdG8gdXNlIGltcG9ydCBtZXRhIGhlcmVcbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoIGltcG9ydC5tZXRhLnVybCApO1xuXG4vKipcbiAqIERldGVjdCB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIGVhY2ggcmVwby5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBnZXRSZXBvc1dpdGhXb3JraW5nQ29weUNoYW5nZXMoKTogUHJvbWlzZTxSZXBvW10+IHtcbiAgY29uc3QgYWN0aXZlUmVwb3MgPSBnZXRBY3RpdmVSZXBvcygpO1xuXG4gIGNvbnN0IGV4ZWNPblJlcG9zID0gYXN5bmMgKCByZXBvU3Vic2V0OiBzdHJpbmdbXSwgY29tbWFuZDogc3RyaW5nICkgPT4ge1xuXG4gICAgY29uc3QgcHJvbWlzZXMgPSByZXBvU3Vic2V0Lm1hcCggcmVwbyA9PiB7XG5cbiAgICAgIGNvbnN0IGN3ZCA9IHBhdGgucmVzb2x2ZSggX19kaXJuYW1lLCAnLi4vLi4vLi4vJywgcmVwbyApO1xuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4gY2hpbGRfcHJvY2Vzcy5leGVjKCBjb21tYW5kLCB7IGN3ZDogY3dkIH0sIGVycm9yID0+IHJlc29sdmUoIGVycm9yICkgKSApO1xuICAgIH0gKTtcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGwoIHByb21pc2VzICk7XG5cbiAgICAvLyBGaW5kIG91dCB3aGljaCByZXBvcyBoYXZlIHVuY29tbWl0dGVkIGNoYW5nZXNcbiAgICBjb25zdCBjaGFuZ2VkUmVwb3MgPSBbXTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCByZXN1bHRzWyBpIF0gIT09IG51bGwgKSB7XG4gICAgICAgIGNoYW5nZWRSZXBvcy5wdXNoKCByZXBvU3Vic2V0WyBpIF0gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2hhbmdlZFJlcG9zO1xuICB9O1xuXG4gIC8vIERldGVjdCB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIGVhY2ggcmVwbzpcbiAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzg3ODYyNC9ob3ctZG8taS1wcm9ncmFtbWF0aWNhbGx5LWRldGVybWluZS1pZi10aGVyZS1hcmUtdW5jb21taXR0ZWQtY2hhbmdlc1xuICAvLyBnaXQgZGlmZi1pbmRleCAtLXF1aWV0IEhFQUQgLS1cbiAgLy8gVGhpcyB3aWxsIGVycm9yIGlmIHRoZSBkaWZmLWluZGV4IHNob3dzIGFueSBjaGFuZ2VzIGluIHRoZSByZXBvLCBvdGhlcndpc2UgZXJyb3IgaXMgbnVsbC5cbiAgY29uc3QgY2hhbmdlZFJlcG9zID0gYXdhaXQgZXhlY09uUmVwb3MoIGFjdGl2ZVJlcG9zLCAnZ2l0IHVwZGF0ZS1pbmRleCAtLXJlZnJlc2ggJiYgZ2l0IGRpZmYtaW5kZXggLS1xdWlldCBIRUFEIC0tJyApO1xuXG4gIGNvbnNvbGUubG9nKCAnZGV0ZWN0ZWQgY2hhbmdlZCByZXBvczogJyArIGNoYW5nZWRSZXBvcy5qb2luKCAnLCAnICkgKTtcblxuICByZXR1cm4gY2hhbmdlZFJlcG9zO1xufSJdLCJuYW1lcyI6WyJjaGlsZF9wcm9jZXNzIiwicGF0aCIsImRpcm5hbWUiLCJnZXRBY3RpdmVSZXBvcyIsIl9fZGlybmFtZSIsInVybCIsImdldFJlcG9zV2l0aFdvcmtpbmdDb3B5Q2hhbmdlcyIsImFjdGl2ZVJlcG9zIiwiZXhlY09uUmVwb3MiLCJyZXBvU3Vic2V0IiwiY29tbWFuZCIsInByb21pc2VzIiwibWFwIiwicmVwbyIsImN3ZCIsInJlc29sdmUiLCJQcm9taXNlIiwiZXhlYyIsImVycm9yIiwicmVzdWx0cyIsImFsbCIsImNoYW5nZWRSZXBvcyIsImkiLCJsZW5ndGgiLCJwdXNoIiwiY29uc29sZSIsImxvZyIsImpvaW4iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWpELE9BQU9BLG1CQUFtQixnQkFBZ0I7QUFDMUMsT0FBT0MsVUFBVSxPQUFPO0FBQ3hCLE9BQU9DLGFBQWEsZ0RBQWdEO0FBQ3BFLE9BQU9DLG9CQUFvQix1REFBdUQ7QUFHbEYsOENBQThDO0FBQzlDLE1BQU1DLFlBQVlGLFFBQVMsWUFBWUcsR0FBRztBQUUxQzs7OztDQUlDLEdBQ0Qsd0JBQThCQztXQUFBQTs7U0FBQUE7SUFBQUEsa0NBQWYsb0JBQUE7UUFDYixNQUFNQyxjQUFjSjtRQUVwQixNQUFNSyxnREFBYyxVQUFRQyxZQUFzQkM7WUFFaEQsTUFBTUMsV0FBV0YsV0FBV0csR0FBRyxDQUFFQyxDQUFBQTtnQkFFL0IsTUFBTUMsTUFBTWIsS0FBS2MsT0FBTyxDQUFFWCxXQUFXLGFBQWFTO2dCQUVsRCxPQUFPLElBQUlHLFFBQVNELENBQUFBLFVBQVdmLGNBQWNpQixJQUFJLENBQUVQLFNBQVM7d0JBQUVJLEtBQUtBO29CQUFJLEdBQUdJLENBQUFBLFFBQVNILFFBQVNHO1lBQzlGO1lBQ0EsTUFBTUMsVUFBVSxNQUFNSCxRQUFRSSxHQUFHLENBQUVUO1lBRW5DLGdEQUFnRDtZQUNoRCxNQUFNVSxlQUFlLEVBQUU7WUFDdkIsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElBQUlILFFBQVFJLE1BQU0sRUFBRUQsSUFBTTtnQkFDekMsSUFBS0gsT0FBTyxDQUFFRyxFQUFHLEtBQUssTUFBTztvQkFDM0JELGFBQWFHLElBQUksQ0FBRWYsVUFBVSxDQUFFYSxFQUFHO2dCQUNwQztZQUNGO1lBRUEsT0FBT0Q7UUFDVDtRQUVBLDJDQUEyQztRQUMzQyxtSEFBbUg7UUFDbkgsaUNBQWlDO1FBQ2pDLDRGQUE0RjtRQUM1RixNQUFNQSxlQUFlLE1BQU1iLFlBQWFELGFBQWE7UUFFckRrQixRQUFRQyxHQUFHLENBQUUsNkJBQTZCTCxhQUFhTSxJQUFJLENBQUU7UUFFN0QsT0FBT047SUFDVDtXQWpDOEJmIn0=