// Copyright 2013-2024, University of Colorado Boulder
/**
 * Lints this repo and all of its dependencies.
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
import getLintCLIOptions from '../../../../perennial-alias/js/eslint/getLintCLIOptions.js';
import lint from '../../../../perennial-alias/js/eslint/lint.js';
import getBrands from '../../../../perennial-alias/js/grunt/tasks/util/getBrands.js';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import grunt from '../../../../perennial-alias/js/npm-dependencies/grunt.js';
import getPhetLibs from '../getPhetLibs.js';
const repo = getRepo();
const brands = getBrands(repo);
/**
 * Executes the linting process immediately. Additionally returned in case the client wants to await the task.
 * We wish this was "export default" but cannot get type information to work for the dynamic import(). See https://github.com/phetsims/perennial/issues/375#issuecomment-2477665963
 */ export const lintAllPromise = _async_to_generator(function*() {
    const lintSuccess = yield lint(getPhetLibs(repo, brands), getLintCLIOptions());
    // Output results on errors.
    if (!lintSuccess) {
        grunt.fail.fatal('Lint failed');
    } else {
        console.log('Linting completed successfully.');
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2xpbnQtYWxsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIExpbnRzIHRoaXMgcmVwbyBhbmQgYWxsIG9mIGl0cyBkZXBlbmRlbmNpZXMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgZ2V0TGludENMSU9wdGlvbnMgZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2VzbGludC9nZXRMaW50Q0xJT3B0aW9ucy5qcyc7XG5pbXBvcnQgbGludCBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZXNsaW50L2xpbnQuanMnO1xuaW1wb3J0IGdldEJyYW5kcyBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRCcmFuZHMuanMnO1xuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0UmVwby5qcyc7XG5pbXBvcnQgZ3J1bnQgZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL25wbS1kZXBlbmRlbmNpZXMvZ3J1bnQuanMnO1xuaW1wb3J0IGdldFBoZXRMaWJzIGZyb20gJy4uL2dldFBoZXRMaWJzLmpzJztcblxuY29uc3QgcmVwbyA9IGdldFJlcG8oKTtcblxuY29uc3QgYnJhbmRzID0gZ2V0QnJhbmRzKCByZXBvICk7XG5cbi8qKlxuICogRXhlY3V0ZXMgdGhlIGxpbnRpbmcgcHJvY2VzcyBpbW1lZGlhdGVseS4gQWRkaXRpb25hbGx5IHJldHVybmVkIGluIGNhc2UgdGhlIGNsaWVudCB3YW50cyB0byBhd2FpdCB0aGUgdGFzay5cbiAqIFdlIHdpc2ggdGhpcyB3YXMgXCJleHBvcnQgZGVmYXVsdFwiIGJ1dCBjYW5ub3QgZ2V0IHR5cGUgaW5mb3JtYXRpb24gdG8gd29yayBmb3IgdGhlIGR5bmFtaWMgaW1wb3J0KCkuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVyZW5uaWFsL2lzc3Vlcy8zNzUjaXNzdWVjb21tZW50LTI0Nzc2NjU5NjNcbiAqL1xuZXhwb3J0IGNvbnN0IGxpbnRBbGxQcm9taXNlID0gKCBhc3luYyAoKSA9PiB7XG5cbiAgY29uc3QgbGludFN1Y2Nlc3MgPSBhd2FpdCBsaW50KCBnZXRQaGV0TGlicyggcmVwbywgYnJhbmRzICksIGdldExpbnRDTElPcHRpb25zKCkgKTtcblxuICAvLyBPdXRwdXQgcmVzdWx0cyBvbiBlcnJvcnMuXG4gIGlmICggIWxpbnRTdWNjZXNzICkge1xuICAgIGdydW50LmZhaWwuZmF0YWwoICdMaW50IGZhaWxlZCcgKTtcbiAgfVxuICBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyggJ0xpbnRpbmcgY29tcGxldGVkIHN1Y2Nlc3NmdWxseS4nICk7XG4gIH1cbn0gKSgpOyJdLCJuYW1lcyI6WyJnZXRMaW50Q0xJT3B0aW9ucyIsImxpbnQiLCJnZXRCcmFuZHMiLCJnZXRSZXBvIiwiZ3J1bnQiLCJnZXRQaGV0TGlicyIsInJlcG8iLCJicmFuZHMiLCJsaW50QWxsUHJvbWlzZSIsImxpbnRTdWNjZXNzIiwiZmFpbCIsImZhdGFsIiwiY29uc29sZSIsImxvZyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsdUJBQXVCLDZEQUE2RDtBQUMzRixPQUFPQyxVQUFVLGdEQUFnRDtBQUNqRSxPQUFPQyxlQUFlLCtEQUErRDtBQUNyRixPQUFPQyxhQUFhLDZEQUE2RDtBQUNqRixPQUFPQyxXQUFXLDJEQUEyRDtBQUM3RSxPQUFPQyxpQkFBaUIsb0JBQW9CO0FBRTVDLE1BQU1DLE9BQU9IO0FBRWIsTUFBTUksU0FBU0wsVUFBV0k7QUFFMUI7OztDQUdDLEdBQ0QsT0FBTyxNQUFNRSxpQkFBaUIsQUFBRSxvQkFBQTtJQUU5QixNQUFNQyxjQUFjLE1BQU1SLEtBQU1JLFlBQWFDLE1BQU1DLFNBQVVQO0lBRTdELDRCQUE0QjtJQUM1QixJQUFLLENBQUNTLGFBQWM7UUFDbEJMLE1BQU1NLElBQUksQ0FBQ0MsS0FBSyxDQUFFO0lBQ3BCLE9BQ0s7UUFDSEMsUUFBUUMsR0FBRyxDQUFFO0lBQ2Y7QUFDRixLQUFNIn0=