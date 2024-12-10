// Copyright 2013-2024, University of Colorado Boulder
/**
 * lint js files. Options:
 * --clean or --disable-eslint-cache: cache will not be read from, and cache will be cleared for next run.
 * --fix: autofixable changes will be written to disk
 * --repos: comma separated list of repos to lint in addition to the repo from running
 * see getLintCLIOptions() for more information.
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
import grunt from 'grunt';
import getLintCLIOptions, { getLintEverythingRepos } from '../../eslint/getLintCLIOptions.js';
import lint from '../../eslint/lint.js';
import getOption, { isOptionKeyProvided } from './util/getOption.js';
import getRepo from './util/getRepo.js';
export const lintPromise = _async_to_generator(function*() {
    let repos = [
        getRepo()
    ];
    if (isOptionKeyProvided('repos')) {
        repos.push(...getOption('repos').split(','));
    }
    if (isOptionKeyProvided('all')) {
        repos = getLintEverythingRepos();
    }
    const lintSuccess = yield lint(repos, getLintCLIOptions());
    if (!lintSuccess) {
        grunt.fail.fatal('Lint failed');
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9saW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIGxpbnQganMgZmlsZXMuIE9wdGlvbnM6XG4gKiAtLWNsZWFuIG9yIC0tZGlzYWJsZS1lc2xpbnQtY2FjaGU6IGNhY2hlIHdpbGwgbm90IGJlIHJlYWQgZnJvbSwgYW5kIGNhY2hlIHdpbGwgYmUgY2xlYXJlZCBmb3IgbmV4dCBydW4uXG4gKiAtLWZpeDogYXV0b2ZpeGFibGUgY2hhbmdlcyB3aWxsIGJlIHdyaXR0ZW4gdG8gZGlza1xuICogLS1yZXBvczogY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgcmVwb3MgdG8gbGludCBpbiBhZGRpdGlvbiB0byB0aGUgcmVwbyBmcm9tIHJ1bm5pbmdcbiAqIHNlZSBnZXRMaW50Q0xJT3B0aW9ucygpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmltcG9ydCBncnVudCBmcm9tICdncnVudCc7XG5pbXBvcnQgZ2V0TGludENMSU9wdGlvbnMsIHsgZ2V0TGludEV2ZXJ5dGhpbmdSZXBvcyB9IGZyb20gJy4uLy4uL2VzbGludC9nZXRMaW50Q0xJT3B0aW9ucy5qcyc7XG5pbXBvcnQgbGludCBmcm9tICcuLi8uLi9lc2xpbnQvbGludC5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uLCB7IGlzT3B0aW9uS2V5UHJvdmlkZWQgfSBmcm9tICcuL3V0aWwvZ2V0T3B0aW9uLmpzJztcbmltcG9ydCBnZXRSZXBvIGZyb20gJy4vdXRpbC9nZXRSZXBvLmpzJztcblxuZXhwb3J0IGNvbnN0IGxpbnRQcm9taXNlID0gKCBhc3luYyAoKSA9PiB7XG5cbiAgbGV0IHJlcG9zID0gWyBnZXRSZXBvKCkgXTtcbiAgaWYgKCBpc09wdGlvbktleVByb3ZpZGVkKCAncmVwb3MnICkgKSB7XG4gICAgcmVwb3MucHVzaCggLi4uZ2V0T3B0aW9uKCAncmVwb3MnICkuc3BsaXQoICcsJyApICk7XG4gIH1cblxuICBpZiAoIGlzT3B0aW9uS2V5UHJvdmlkZWQoICdhbGwnICkgKSB7XG4gICAgcmVwb3MgPSBnZXRMaW50RXZlcnl0aGluZ1JlcG9zKCk7XG4gIH1cblxuICBjb25zdCBsaW50U3VjY2VzcyA9IGF3YWl0IGxpbnQoIHJlcG9zLCBnZXRMaW50Q0xJT3B0aW9ucygpICk7XG5cbiAgaWYgKCAhbGludFN1Y2Nlc3MgKSB7XG4gICAgZ3J1bnQuZmFpbC5mYXRhbCggJ0xpbnQgZmFpbGVkJyApO1xuICB9XG59ICkoKTsiXSwibmFtZXMiOlsiZ3J1bnQiLCJnZXRMaW50Q0xJT3B0aW9ucyIsImdldExpbnRFdmVyeXRoaW5nUmVwb3MiLCJsaW50IiwiZ2V0T3B0aW9uIiwiaXNPcHRpb25LZXlQcm92aWRlZCIsImdldFJlcG8iLCJsaW50UHJvbWlzZSIsInJlcG9zIiwicHVzaCIsInNwbGl0IiwibGludFN1Y2Nlc3MiLCJmYWlsIiwiZmF0YWwiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Q0FRQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDRCxPQUFPQSxXQUFXLFFBQVE7QUFDMUIsT0FBT0MscUJBQXFCQyxzQkFBc0IsUUFBUSxvQ0FBb0M7QUFDOUYsT0FBT0MsVUFBVSx1QkFBdUI7QUFDeEMsT0FBT0MsYUFBYUMsbUJBQW1CLFFBQVEsc0JBQXNCO0FBQ3JFLE9BQU9DLGFBQWEsb0JBQW9CO0FBRXhDLE9BQU8sTUFBTUMsY0FBYyxBQUFFLG9CQUFBO0lBRTNCLElBQUlDLFFBQVE7UUFBRUY7S0FBVztJQUN6QixJQUFLRCxvQkFBcUIsVUFBWTtRQUNwQ0csTUFBTUMsSUFBSSxJQUFLTCxVQUFXLFNBQVVNLEtBQUssQ0FBRTtJQUM3QztJQUVBLElBQUtMLG9CQUFxQixRQUFVO1FBQ2xDRyxRQUFRTjtJQUNWO0lBRUEsTUFBTVMsY0FBYyxNQUFNUixLQUFNSyxPQUFPUDtJQUV2QyxJQUFLLENBQUNVLGFBQWM7UUFDbEJYLE1BQU1ZLElBQUksQ0FBQ0MsS0FBSyxDQUFFO0lBQ3BCO0FBQ0YsS0FBTSJ9