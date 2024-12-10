// Copyright 2013-2024, University of Colorado Boulder
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
import fs from 'fs';
import getOption from '../../../../perennial-alias/js/grunt/tasks/util/getOption.js';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import getSimList from '../../common/getSimList.js';
import transpile from '../../common/transpile.js';
import formatPhetioAPI from '../../phet-io/formatPhetioAPI.js';
import generatePhetioMacroAPI from '../../phet-io/generatePhetioMacroAPI.js';
import getPhetLibs from '../getPhetLibs.js';
const repo = getRepo();
const sims = getSimList().length === 0 ? [
    repo
] : getSimList();
// Ideally transpilation would be a no-op if the watch process is running. However, it can take 2+ seconds on
// macOS to check all files, and sometimes much longer (50+ seconds) if the cache mechanism is failing.
// So this "skip" is a band-aid until we reduce those other problems.
const skipTranspile = getOption('transpile') === false;
/**
 * Output the PhET-iO API as JSON to phet-io-sim-specific/api.
 * Options
 * --sims=... a list of sims to compare (defaults to the sim in the current dir)
 * --simList=... a file with a list of sims to compare (defaults to the sim in the current dir)
 * --stable - regenerate for all "stable sims" (see perennial/data/phet-io-api-stable/)
 * --temporary - outputs to the temporary directory
 * --transpile=false - skips the transpilation step. You can skip transpilation if a watch process is handling it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ _async_to_generator(function*() {
    if (!skipTranspile) {
        const startTime = Date.now();
        const repos = new Set();
        sims.forEach((sim)=>getPhetLibs(sim).forEach((lib)=>repos.add(lib)));
        yield transpile({
            repos: Array.from(repos),
            silent: true
        });
        const transpileTimeMS = Date.now() - startTime;
        // Notify about long transpile times, in case more people need to skip
        if (transpileTimeMS >= 5000) {
            console.log(`generate-phet-io-api transpilation took ${transpileTimeMS} ms`);
        }
    } else {
        console.log('Skipping transpilation');
    }
    const results = yield generatePhetioMacroAPI(sims, {
        showProgressBar: sims.length > 1,
        throwAPIGenerationErrors: false // Write as many as we can, and print what we didn't write
    });
    sims.forEach((sim)=>{
        const dir = `../phet-io-sim-specific/repos/${sim}`;
        try {
            fs.mkdirSync(dir);
        } catch (e) {
        // Directory exists
        }
        const filePath = `${dir}/${sim}-phet-io-api${getOption('temporary') ? '-temporary' : ''}.json`;
        const api = results[sim];
        api && fs.writeFileSync(filePath, formatPhetioAPI(api));
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2dlbmVyYXRlLXBoZXQtaW8tYXBpLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGdldE9wdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRPcHRpb24uanMnO1xuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0UmVwby5qcyc7XG5pbXBvcnQgZ2V0U2ltTGlzdCBmcm9tICcuLi8uLi9jb21tb24vZ2V0U2ltTGlzdC5qcyc7XG5pbXBvcnQgdHJhbnNwaWxlIGZyb20gJy4uLy4uL2NvbW1vbi90cmFuc3BpbGUuanMnO1xuaW1wb3J0IGZvcm1hdFBoZXRpb0FQSSBmcm9tICcuLi8uLi9waGV0LWlvL2Zvcm1hdFBoZXRpb0FQSS5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSSBmcm9tICcuLi8uLi9waGV0LWlvL2dlbmVyYXRlUGhldGlvTWFjcm9BUEkuanMnO1xuaW1wb3J0IGdldFBoZXRMaWJzIGZyb20gJy4uL2dldFBoZXRMaWJzLmpzJztcblxuY29uc3QgcmVwbyA9IGdldFJlcG8oKTtcbmNvbnN0IHNpbXM6IHN0cmluZ1tdID0gZ2V0U2ltTGlzdCgpLmxlbmd0aCA9PT0gMCA/IFsgcmVwbyBdIDogZ2V0U2ltTGlzdCgpO1xuXG4vLyBJZGVhbGx5IHRyYW5zcGlsYXRpb24gd291bGQgYmUgYSBuby1vcCBpZiB0aGUgd2F0Y2ggcHJvY2VzcyBpcyBydW5uaW5nLiBIb3dldmVyLCBpdCBjYW4gdGFrZSAyKyBzZWNvbmRzIG9uXG4vLyBtYWNPUyB0byBjaGVjayBhbGwgZmlsZXMsIGFuZCBzb21ldGltZXMgbXVjaCBsb25nZXIgKDUwKyBzZWNvbmRzKSBpZiB0aGUgY2FjaGUgbWVjaGFuaXNtIGlzIGZhaWxpbmcuXG4vLyBTbyB0aGlzIFwic2tpcFwiIGlzIGEgYmFuZC1haWQgdW50aWwgd2UgcmVkdWNlIHRob3NlIG90aGVyIHByb2JsZW1zLlxuY29uc3Qgc2tpcFRyYW5zcGlsZSA9IGdldE9wdGlvbiggJ3RyYW5zcGlsZScgKSA9PT0gZmFsc2U7XG5cbi8qKlxuICogT3V0cHV0IHRoZSBQaEVULWlPIEFQSSBhcyBKU09OIHRvIHBoZXQtaW8tc2ltLXNwZWNpZmljL2FwaS5cbiAqIE9wdGlvbnNcbiAqIC0tc2ltcz0uLi4gYSBsaXN0IG9mIHNpbXMgdG8gY29tcGFyZSAoZGVmYXVsdHMgdG8gdGhlIHNpbSBpbiB0aGUgY3VycmVudCBkaXIpXG4gKiAtLXNpbUxpc3Q9Li4uIGEgZmlsZSB3aXRoIGEgbGlzdCBvZiBzaW1zIHRvIGNvbXBhcmUgKGRlZmF1bHRzIHRvIHRoZSBzaW0gaW4gdGhlIGN1cnJlbnQgZGlyKVxuICogLS1zdGFibGUgLSByZWdlbmVyYXRlIGZvciBhbGwgXCJzdGFibGUgc2ltc1wiIChzZWUgcGVyZW5uaWFsL2RhdGEvcGhldC1pby1hcGktc3RhYmxlLylcbiAqIC0tdGVtcG9yYXJ5IC0gb3V0cHV0cyB0byB0aGUgdGVtcG9yYXJ5IGRpcmVjdG9yeVxuICogLS10cmFuc3BpbGU9ZmFsc2UgLSBza2lwcyB0aGUgdHJhbnNwaWxhdGlvbiBzdGVwLiBZb3UgY2FuIHNraXAgdHJhbnNwaWxhdGlvbiBpZiBhIHdhdGNoIHByb2Nlc3MgaXMgaGFuZGxpbmcgaXQuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuKCBhc3luYyAoKSA9PiB7XG5cbiAgaWYgKCAhc2tpcFRyYW5zcGlsZSApIHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgY29uc3QgcmVwb3MgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBzaW1zLmZvckVhY2goIHNpbSA9PiBnZXRQaGV0TGlicyggc2ltICkuZm9yRWFjaCggbGliID0+IHJlcG9zLmFkZCggbGliICkgKSApO1xuICAgIGF3YWl0IHRyYW5zcGlsZSgge1xuICAgICAgcmVwb3M6IEFycmF5LmZyb20oIHJlcG9zICksXG4gICAgICBzaWxlbnQ6IHRydWVcbiAgICB9ICk7XG5cbiAgICBjb25zdCB0cmFuc3BpbGVUaW1lTVMgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgLy8gTm90aWZ5IGFib3V0IGxvbmcgdHJhbnNwaWxlIHRpbWVzLCBpbiBjYXNlIG1vcmUgcGVvcGxlIG5lZWQgdG8gc2tpcFxuICAgIGlmICggdHJhbnNwaWxlVGltZU1TID49IDUwMDAgKSB7XG4gICAgICBjb25zb2xlLmxvZyggYGdlbmVyYXRlLXBoZXQtaW8tYXBpIHRyYW5zcGlsYXRpb24gdG9vayAke3RyYW5zcGlsZVRpbWVNU30gbXNgICk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCAnU2tpcHBpbmcgdHJhbnNwaWxhdGlvbicgKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBnZW5lcmF0ZVBoZXRpb01hY3JvQVBJKCBzaW1zLCB7XG4gICAgc2hvd1Byb2dyZXNzQmFyOiBzaW1zLmxlbmd0aCA+IDEsXG4gICAgdGhyb3dBUElHZW5lcmF0aW9uRXJyb3JzOiBmYWxzZSAvLyBXcml0ZSBhcyBtYW55IGFzIHdlIGNhbiwgYW5kIHByaW50IHdoYXQgd2UgZGlkbid0IHdyaXRlXG4gIH0gKTtcbiAgc2ltcy5mb3JFYWNoKCBzaW0gPT4ge1xuICAgIGNvbnN0IGRpciA9IGAuLi9waGV0LWlvLXNpbS1zcGVjaWZpYy9yZXBvcy8ke3NpbX1gO1xuICAgIHRyeSB7XG4gICAgICBmcy5ta2RpclN5bmMoIGRpciApO1xuICAgIH1cbiAgICBjYXRjaCggZSApIHtcbiAgICAgIC8vIERpcmVjdG9yeSBleGlzdHNcbiAgICB9XG4gICAgY29uc3QgZmlsZVBhdGggPSBgJHtkaXJ9LyR7c2ltfS1waGV0LWlvLWFwaSR7Z2V0T3B0aW9uKCAndGVtcG9yYXJ5JyApID8gJy10ZW1wb3JhcnknIDogJyd9Lmpzb25gO1xuICAgIGNvbnN0IGFwaSA9IHJlc3VsdHNbIHNpbSBdO1xuICAgIGFwaSAmJiBmcy53cml0ZUZpbGVTeW5jKCBmaWxlUGF0aCwgZm9ybWF0UGhldGlvQVBJKCBhcGkgKSApO1xuICB9ICk7XG59ICkoKTsiXSwibmFtZXMiOlsiZnMiLCJnZXRPcHRpb24iLCJnZXRSZXBvIiwiZ2V0U2ltTGlzdCIsInRyYW5zcGlsZSIsImZvcm1hdFBoZXRpb0FQSSIsImdlbmVyYXRlUGhldGlvTWFjcm9BUEkiLCJnZXRQaGV0TGlicyIsInJlcG8iLCJzaW1zIiwibGVuZ3RoIiwic2tpcFRyYW5zcGlsZSIsInN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJyZXBvcyIsIlNldCIsImZvckVhY2giLCJzaW0iLCJsaWIiLCJhZGQiLCJBcnJheSIsImZyb20iLCJzaWxlbnQiLCJ0cmFuc3BpbGVUaW1lTVMiLCJjb25zb2xlIiwibG9nIiwicmVzdWx0cyIsInNob3dQcm9ncmVzc0JhciIsInRocm93QVBJR2VuZXJhdGlvbkVycm9ycyIsImRpciIsIm1rZGlyU3luYyIsImUiLCJmaWxlUGF0aCIsImFwaSIsIndyaXRlRmlsZVN5bmMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRXRELE9BQU9BLFFBQVEsS0FBSztBQUNwQixPQUFPQyxlQUFlLCtEQUErRDtBQUNyRixPQUFPQyxhQUFhLDZEQUE2RDtBQUNqRixPQUFPQyxnQkFBZ0IsNkJBQTZCO0FBQ3BELE9BQU9DLGVBQWUsNEJBQTRCO0FBQ2xELE9BQU9DLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0MsNEJBQTRCLDBDQUEwQztBQUM3RSxPQUFPQyxpQkFBaUIsb0JBQW9CO0FBRTVDLE1BQU1DLE9BQU9OO0FBQ2IsTUFBTU8sT0FBaUJOLGFBQWFPLE1BQU0sS0FBSyxJQUFJO0lBQUVGO0NBQU0sR0FBR0w7QUFFOUQsNkdBQTZHO0FBQzdHLHVHQUF1RztBQUN2RyxxRUFBcUU7QUFDckUsTUFBTVEsZ0JBQWdCVixVQUFXLGlCQUFrQjtBQUVuRDs7Ozs7Ozs7OztDQVVDLEdBQ0Msb0JBQUE7SUFFQSxJQUFLLENBQUNVLGVBQWdCO1FBQ3BCLE1BQU1DLFlBQVlDLEtBQUtDLEdBQUc7UUFFMUIsTUFBTUMsUUFBUSxJQUFJQztRQUNsQlAsS0FBS1EsT0FBTyxDQUFFQyxDQUFBQSxNQUFPWCxZQUFhVyxLQUFNRCxPQUFPLENBQUVFLENBQUFBLE1BQU9KLE1BQU1LLEdBQUcsQ0FBRUQ7UUFDbkUsTUFBTWYsVUFBVztZQUNmVyxPQUFPTSxNQUFNQyxJQUFJLENBQUVQO1lBQ25CUSxRQUFRO1FBQ1Y7UUFFQSxNQUFNQyxrQkFBa0JYLEtBQUtDLEdBQUcsS0FBS0Y7UUFFckMsc0VBQXNFO1FBQ3RFLElBQUtZLG1CQUFtQixNQUFPO1lBQzdCQyxRQUFRQyxHQUFHLENBQUUsQ0FBQyx3Q0FBd0MsRUFBRUYsZ0JBQWdCLEdBQUcsQ0FBQztRQUM5RTtJQUNGLE9BQ0s7UUFDSEMsUUFBUUMsR0FBRyxDQUFFO0lBQ2Y7SUFFQSxNQUFNQyxVQUFVLE1BQU1yQix1QkFBd0JHLE1BQU07UUFDbERtQixpQkFBaUJuQixLQUFLQyxNQUFNLEdBQUc7UUFDL0JtQiwwQkFBMEIsTUFBTSwwREFBMEQ7SUFDNUY7SUFDQXBCLEtBQUtRLE9BQU8sQ0FBRUMsQ0FBQUE7UUFDWixNQUFNWSxNQUFNLENBQUMsOEJBQThCLEVBQUVaLEtBQUs7UUFDbEQsSUFBSTtZQUNGbEIsR0FBRytCLFNBQVMsQ0FBRUQ7UUFDaEIsRUFDQSxPQUFPRSxHQUFJO1FBQ1QsbUJBQW1CO1FBQ3JCO1FBQ0EsTUFBTUMsV0FBVyxHQUFHSCxJQUFJLENBQUMsRUFBRVosSUFBSSxZQUFZLEVBQUVqQixVQUFXLGVBQWdCLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDaEcsTUFBTWlDLE1BQU1QLE9BQU8sQ0FBRVQsSUFBSztRQUMxQmdCLE9BQU9sQyxHQUFHbUMsYUFBYSxDQUFFRixVQUFVNUIsZ0JBQWlCNkI7SUFDdEQ7QUFDRiJ9