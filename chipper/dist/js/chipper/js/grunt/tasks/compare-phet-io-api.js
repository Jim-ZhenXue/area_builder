// Copyright 2013-2024, University of Colorado Boulder
/**
 *
 * Compares the phet-io-api against the reference version(s) if this sim's package.json marks compareDesignedAPIChanges.
 * This will by default compare designed changes only. Options:
 * --sims=... a list of sims to compare (defaults to the sim in the current dir)
 * --simList=... a file with a list of sims to compare (defaults to the sim in the current dir)
 * --stable, generate the phet-io-apis for each phet-io sim considered to have a stable API (see perennial-alias/data/phet-io-api-stable)
 * --delta, by default a breaking-compatibility comparison is done, but --delta shows all changes
 * --temporary, compares API files in the temporary directory (otherwise compares to freshly generated APIs)
 * --compareBreakingAPIChanges - add this flag to compare breaking changes in addition to designed changes
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
import fs from 'fs';
import getOption from '../../../../perennial-alias/js/grunt/tasks/util/getOption.js';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import grunt from '../../../../perennial-alias/js/npm-dependencies/grunt.js';
import getSimList from '../../common/getSimList.js';
import transpile from '../../common/transpile.js';
import generatePhetioMacroAPI from '../../phet-io/generatePhetioMacroAPI.js';
import phetioCompareAPISets from '../../phet-io/phetioCompareAPISets.js';
import getPhetLibs from '../getPhetLibs.js';
const repo = getRepo();
const sims = getSimList().length === 0 ? [
    repo
] : getSimList();
const temporary = getOption('temporary');
let proposedAPIs = null;
_async_to_generator(function*() {
    if (temporary) {
        proposedAPIs = {};
        sims.forEach((sim)=>{
            proposedAPIs[sim] = JSON.parse(fs.readFileSync(`../phet-io-sim-specific/repos/${repo}/${repo}-phet-io-api-temporary.json`, 'utf8'));
        });
    } else {
        const repos = new Set();
        sims.forEach((sim)=>getPhetLibs(sim).forEach((lib)=>repos.add(lib)));
        yield transpile({
            repos: Array.from(repos),
            silent: true
        });
        proposedAPIs = yield generatePhetioMacroAPI(sims, {
            showProgressBar: sims.length > 1,
            showMessagesFromSim: false
        });
    }
    // Don't add to options object if values are `undefined` (as _.extend will keep those entries and not mix in defaults
    const options = {};
    if (getOption('delta')) {
        options.delta = getOption('delta');
    }
    if (getOption('compareBreakingAPIChanges')) {
        options.compareBreakingAPIChanges = getOption('compareBreakingAPIChanges');
    }
    const ok = yield phetioCompareAPISets(sims, proposedAPIs, options);
    !ok && grunt.fail.fatal('PhET-iO API comparison failed');
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2NvbXBhcmUtcGhldC1pby1hcGkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICpcbiAqIENvbXBhcmVzIHRoZSBwaGV0LWlvLWFwaSBhZ2FpbnN0IHRoZSByZWZlcmVuY2UgdmVyc2lvbihzKSBpZiB0aGlzIHNpbSdzIHBhY2thZ2UuanNvbiBtYXJrcyBjb21wYXJlRGVzaWduZWRBUElDaGFuZ2VzLlxuICogVGhpcyB3aWxsIGJ5IGRlZmF1bHQgY29tcGFyZSBkZXNpZ25lZCBjaGFuZ2VzIG9ubHkuIE9wdGlvbnM6XG4gKiAtLXNpbXM9Li4uIGEgbGlzdCBvZiBzaW1zIHRvIGNvbXBhcmUgKGRlZmF1bHRzIHRvIHRoZSBzaW0gaW4gdGhlIGN1cnJlbnQgZGlyKVxuICogLS1zaW1MaXN0PS4uLiBhIGZpbGUgd2l0aCBhIGxpc3Qgb2Ygc2ltcyB0byBjb21wYXJlIChkZWZhdWx0cyB0byB0aGUgc2ltIGluIHRoZSBjdXJyZW50IGRpcilcbiAqIC0tc3RhYmxlLCBnZW5lcmF0ZSB0aGUgcGhldC1pby1hcGlzIGZvciBlYWNoIHBoZXQtaW8gc2ltIGNvbnNpZGVyZWQgdG8gaGF2ZSBhIHN0YWJsZSBBUEkgKHNlZSBwZXJlbm5pYWwtYWxpYXMvZGF0YS9waGV0LWlvLWFwaS1zdGFibGUpXG4gKiAtLWRlbHRhLCBieSBkZWZhdWx0IGEgYnJlYWtpbmctY29tcGF0aWJpbGl0eSBjb21wYXJpc29uIGlzIGRvbmUsIGJ1dCAtLWRlbHRhIHNob3dzIGFsbCBjaGFuZ2VzXG4gKiAtLXRlbXBvcmFyeSwgY29tcGFyZXMgQVBJIGZpbGVzIGluIHRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5IChvdGhlcndpc2UgY29tcGFyZXMgdG8gZnJlc2hseSBnZW5lcmF0ZWQgQVBJcylcbiAqIC0tY29tcGFyZUJyZWFraW5nQVBJQ2hhbmdlcyAtIGFkZCB0aGlzIGZsYWcgdG8gY29tcGFyZSBicmVha2luZyBjaGFuZ2VzIGluIGFkZGl0aW9uIHRvIGRlc2lnbmVkIGNoYW5nZXNcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldE9wdGlvbi5qcyc7XG5pbXBvcnQgZ2V0UmVwbyBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRSZXBvLmpzJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBnZXRTaW1MaXN0IGZyb20gJy4uLy4uL2NvbW1vbi9nZXRTaW1MaXN0LmpzJztcbmltcG9ydCB0cmFuc3BpbGUgZnJvbSAnLi4vLi4vY29tbW9uL3RyYW5zcGlsZS5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSSwgeyBQaGV0aW9BUElzIH0gZnJvbSAnLi4vLi4vcGhldC1pby9nZW5lcmF0ZVBoZXRpb01hY3JvQVBJLmpzJztcbmltcG9ydCBwaGV0aW9Db21wYXJlQVBJU2V0cyBmcm9tICcuLi8uLi9waGV0LWlvL3BoZXRpb0NvbXBhcmVBUElTZXRzLmpzJztcbmltcG9ydCBnZXRQaGV0TGlicyBmcm9tICcuLi9nZXRQaGV0TGlicy5qcyc7XG5cbmNvbnN0IHJlcG8gPSBnZXRSZXBvKCk7XG5jb25zdCBzaW1zOiBzdHJpbmdbXSA9IGdldFNpbUxpc3QoKS5sZW5ndGggPT09IDAgPyBbIHJlcG8gXSA6IGdldFNpbUxpc3QoKTtcbmNvbnN0IHRlbXBvcmFyeSA9IGdldE9wdGlvbiggJ3RlbXBvcmFyeScgKTtcbmxldCBwcm9wb3NlZEFQSXM6IFBoZXRpb0FQSXMgfCBudWxsID0gbnVsbDtcblxuKCBhc3luYyAoKSA9PiB7XG4gIGlmICggdGVtcG9yYXJ5ICkge1xuICAgIHByb3Bvc2VkQVBJcyA9IHt9O1xuICAgIHNpbXMuZm9yRWFjaCggc2ltID0+IHtcbiAgICAgIHByb3Bvc2VkQVBJcyFbIHNpbSBdID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vcGhldC1pby1zaW0tc3BlY2lmaWMvcmVwb3MvJHtyZXBvfS8ke3JlcG99LXBoZXQtaW8tYXBpLXRlbXBvcmFyeS5qc29uYCwgJ3V0ZjgnICkgKTtcbiAgICB9ICk7XG4gIH1cbiAgZWxzZSB7XG5cbiAgICBjb25zdCByZXBvcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIHNpbXMuZm9yRWFjaCggc2ltID0+IGdldFBoZXRMaWJzKCBzaW0gKS5mb3JFYWNoKCBsaWIgPT4gcmVwb3MuYWRkKCBsaWIgKSApICk7XG4gICAgYXdhaXQgdHJhbnNwaWxlKCB7XG4gICAgICByZXBvczogQXJyYXkuZnJvbSggcmVwb3MgKSxcbiAgICAgIHNpbGVudDogdHJ1ZVxuICAgIH0gKTtcblxuICAgIHByb3Bvc2VkQVBJcyA9IGF3YWl0IGdlbmVyYXRlUGhldGlvTWFjcm9BUEkoIHNpbXMsIHtcbiAgICAgIHNob3dQcm9ncmVzc0Jhcjogc2ltcy5sZW5ndGggPiAxLFxuICAgICAgc2hvd01lc3NhZ2VzRnJvbVNpbTogZmFsc2VcbiAgICB9ICk7XG4gIH1cblxuLy8gRG9uJ3QgYWRkIHRvIG9wdGlvbnMgb2JqZWN0IGlmIHZhbHVlcyBhcmUgYHVuZGVmaW5lZGAgKGFzIF8uZXh0ZW5kIHdpbGwga2VlcCB0aG9zZSBlbnRyaWVzIGFuZCBub3QgbWl4IGluIGRlZmF1bHRzXG4gIGNvbnN0IG9wdGlvbnM6IEludGVudGlvbmFsQW55ID0ge307XG4gIGlmICggZ2V0T3B0aW9uKCAnZGVsdGEnICkgKSB7XG4gICAgb3B0aW9ucy5kZWx0YSA9IGdldE9wdGlvbiggJ2RlbHRhJyApO1xuICB9XG4gIGlmICggZ2V0T3B0aW9uKCAnY29tcGFyZUJyZWFraW5nQVBJQ2hhbmdlcycgKSApIHtcbiAgICBvcHRpb25zLmNvbXBhcmVCcmVha2luZ0FQSUNoYW5nZXMgPSBnZXRPcHRpb24oICdjb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzJyApO1xuICB9XG4gIGNvbnN0IG9rID0gYXdhaXQgcGhldGlvQ29tcGFyZUFQSVNldHMoIHNpbXMsIHByb3Bvc2VkQVBJcywgb3B0aW9ucyApO1xuICAhb2sgJiYgZ3J1bnQuZmFpbC5mYXRhbCggJ1BoRVQtaU8gQVBJIGNvbXBhcmlzb24gZmFpbGVkJyApO1xuXG59ICkoKTsiXSwibmFtZXMiOlsiZnMiLCJnZXRPcHRpb24iLCJnZXRSZXBvIiwiZ3J1bnQiLCJnZXRTaW1MaXN0IiwidHJhbnNwaWxlIiwiZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSSIsInBoZXRpb0NvbXBhcmVBUElTZXRzIiwiZ2V0UGhldExpYnMiLCJyZXBvIiwic2ltcyIsImxlbmd0aCIsInRlbXBvcmFyeSIsInByb3Bvc2VkQVBJcyIsImZvckVhY2giLCJzaW0iLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJyZXBvcyIsIlNldCIsImxpYiIsImFkZCIsIkFycmF5IiwiZnJvbSIsInNpbGVudCIsInNob3dQcm9ncmVzc0JhciIsInNob3dNZXNzYWdlc0Zyb21TaW0iLCJvcHRpb25zIiwiZGVsdGEiLCJjb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzIiwib2siLCJmYWlsIiwiZmF0YWwiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7O0NBWUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsUUFBUSxLQUFLO0FBQ3BCLE9BQU9DLGVBQWUsK0RBQStEO0FBQ3JGLE9BQU9DLGFBQWEsNkRBQTZEO0FBQ2pGLE9BQU9DLFdBQVcsMkRBQTJEO0FBRTdFLE9BQU9DLGdCQUFnQiw2QkFBNkI7QUFDcEQsT0FBT0MsZUFBZSw0QkFBNEI7QUFDbEQsT0FBT0MsNEJBQTRDLDBDQUEwQztBQUM3RixPQUFPQywwQkFBMEIsd0NBQXdDO0FBQ3pFLE9BQU9DLGlCQUFpQixvQkFBb0I7QUFFNUMsTUFBTUMsT0FBT1A7QUFDYixNQUFNUSxPQUFpQk4sYUFBYU8sTUFBTSxLQUFLLElBQUk7SUFBRUY7Q0FBTSxHQUFHTDtBQUM5RCxNQUFNUSxZQUFZWCxVQUFXO0FBQzdCLElBQUlZLGVBQWtDO0FBRXBDLG9CQUFBO0lBQ0EsSUFBS0QsV0FBWTtRQUNmQyxlQUFlLENBQUM7UUFDaEJILEtBQUtJLE9BQU8sQ0FBRUMsQ0FBQUE7WUFDWkYsWUFBYSxDQUFFRSxJQUFLLEdBQUdDLEtBQUtDLEtBQUssQ0FBRWpCLEdBQUdrQixZQUFZLENBQUUsQ0FBQyw4QkFBOEIsRUFBRVQsS0FBSyxDQUFDLEVBQUVBLEtBQUssMkJBQTJCLENBQUMsRUFBRTtRQUNsSTtJQUNGLE9BQ0s7UUFFSCxNQUFNVSxRQUFRLElBQUlDO1FBQ2xCVixLQUFLSSxPQUFPLENBQUVDLENBQUFBLE1BQU9QLFlBQWFPLEtBQU1ELE9BQU8sQ0FBRU8sQ0FBQUEsTUFBT0YsTUFBTUcsR0FBRyxDQUFFRDtRQUNuRSxNQUFNaEIsVUFBVztZQUNmYyxPQUFPSSxNQUFNQyxJQUFJLENBQUVMO1lBQ25CTSxRQUFRO1FBQ1Y7UUFFQVosZUFBZSxNQUFNUCx1QkFBd0JJLE1BQU07WUFDakRnQixpQkFBaUJoQixLQUFLQyxNQUFNLEdBQUc7WUFDL0JnQixxQkFBcUI7UUFDdkI7SUFDRjtJQUVGLHFIQUFxSDtJQUNuSCxNQUFNQyxVQUEwQixDQUFDO0lBQ2pDLElBQUszQixVQUFXLFVBQVk7UUFDMUIyQixRQUFRQyxLQUFLLEdBQUc1QixVQUFXO0lBQzdCO0lBQ0EsSUFBS0EsVUFBVyw4QkFBZ0M7UUFDOUMyQixRQUFRRSx5QkFBeUIsR0FBRzdCLFVBQVc7SUFDakQ7SUFDQSxNQUFNOEIsS0FBSyxNQUFNeEIscUJBQXNCRyxNQUFNRyxjQUFjZTtJQUMzRCxDQUFDRyxNQUFNNUIsTUFBTTZCLElBQUksQ0FBQ0MsS0FBSyxDQUFFO0FBRTNCIn0=