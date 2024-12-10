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
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import ChipperConstants from '../../common/ChipperConstants.js';
import transpile from '../../common/transpile.js';
import getLocalesFromRepository from '../getLocalesFromRepository.js';
import getPhetLibs from '../getPhetLibs.js';
import getStringMap from '../getStringMap.js';
import webpackBuild from '../webpackBuild.js';
/**
 * Writes used strings to phet-io-sim-specific/ so that PhET-iO sims only output relevant strings to the API in unbuilt mode
 * @author Sam Reid (PhET Interactive Simulations)
 */ const repo = getRepo();
_async_to_generator(function*() {
    yield transpile({
        repos: getPhetLibs(repo),
        silent: true
    });
    const webpackResult = yield webpackBuild(repo, 'phet');
    const phetLibs = getPhetLibs(repo, 'phet');
    const allLocales = [
        ChipperConstants.FALLBACK_LOCALE,
        ...getLocalesFromRepository(repo)
    ];
    const { stringMap } = getStringMap(repo, allLocales, phetLibs, webpackResult.usedModules);
    // TODO: https://github.com/phetsims/phet-io/issues/1877 This is only pertinent for phet-io, so I'm outputting
    // it to phet-io-sim-specific.  But none of intrinsic data is phet-io-specific.
    // Do we want a different path for it?
    // TODO: https://github.com/phetsims/phet-io/issues/1877 How do we indicate that it is a build artifact, and
    // should not be manually updated?
    fs.writeFileSync(`../phet-io-sim-specific/repos/${repo}/used-strings_en.json`, JSON.stringify(stringMap.en, null, 2));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2dlbmVyYXRlLXVzZWQtc3RyaW5ncy1maWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0UmVwby5qcyc7XG5pbXBvcnQgQ2hpcHBlckNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQ2hpcHBlckNvbnN0YW50cy5qcyc7XG5pbXBvcnQgdHJhbnNwaWxlIGZyb20gJy4uLy4uL2NvbW1vbi90cmFuc3BpbGUuanMnO1xuaW1wb3J0IGdldExvY2FsZXNGcm9tUmVwb3NpdG9yeSBmcm9tICcuLi9nZXRMb2NhbGVzRnJvbVJlcG9zaXRvcnkuanMnO1xuaW1wb3J0IGdldFBoZXRMaWJzIGZyb20gJy4uL2dldFBoZXRMaWJzLmpzJztcbmltcG9ydCBnZXRTdHJpbmdNYXAgZnJvbSAnLi4vZ2V0U3RyaW5nTWFwLmpzJztcbmltcG9ydCB3ZWJwYWNrQnVpbGQgZnJvbSAnLi4vd2VicGFja0J1aWxkLmpzJztcblxuLyoqXG4gKiBXcml0ZXMgdXNlZCBzdHJpbmdzIHRvIHBoZXQtaW8tc2ltLXNwZWNpZmljLyBzbyB0aGF0IFBoRVQtaU8gc2ltcyBvbmx5IG91dHB1dCByZWxldmFudCBzdHJpbmdzIHRvIHRoZSBBUEkgaW4gdW5idWlsdCBtb2RlXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5jb25zdCByZXBvID0gZ2V0UmVwbygpO1xuXG4oIGFzeW5jICgpID0+IHtcbiAgYXdhaXQgdHJhbnNwaWxlKCB7IHJlcG9zOiBnZXRQaGV0TGlicyggcmVwbyApLCBzaWxlbnQ6IHRydWUgfSApO1xuICBjb25zdCB3ZWJwYWNrUmVzdWx0ID0gYXdhaXQgd2VicGFja0J1aWxkKCByZXBvLCAncGhldCcgKTtcblxuICBjb25zdCBwaGV0TGlicyA9IGdldFBoZXRMaWJzKCByZXBvLCAncGhldCcgKTtcbiAgY29uc3QgYWxsTG9jYWxlcyA9IFsgQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUsIC4uLmdldExvY2FsZXNGcm9tUmVwb3NpdG9yeSggcmVwbyApIF07XG4gIGNvbnN0IHsgc3RyaW5nTWFwIH0gPSBnZXRTdHJpbmdNYXAoIHJlcG8sIGFsbExvY2FsZXMsIHBoZXRMaWJzLCB3ZWJwYWNrUmVzdWx0LnVzZWRNb2R1bGVzICk7XG5cbi8vIFRPRE86IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xODc3IFRoaXMgaXMgb25seSBwZXJ0aW5lbnQgZm9yIHBoZXQtaW8sIHNvIEknbSBvdXRwdXR0aW5nXG4vLyBpdCB0byBwaGV0LWlvLXNpbS1zcGVjaWZpYy4gIEJ1dCBub25lIG9mIGludHJpbnNpYyBkYXRhIGlzIHBoZXQtaW8tc3BlY2lmaWMuXG4vLyBEbyB3ZSB3YW50IGEgZGlmZmVyZW50IHBhdGggZm9yIGl0P1xuLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE4NzcgSG93IGRvIHdlIGluZGljYXRlIHRoYXQgaXQgaXMgYSBidWlsZCBhcnRpZmFjdCwgYW5kXG4vLyBzaG91bGQgbm90IGJlIG1hbnVhbGx5IHVwZGF0ZWQ/XG4gIGZzLndyaXRlRmlsZVN5bmMoIGAuLi9waGV0LWlvLXNpbS1zcGVjaWZpYy9yZXBvcy8ke3JlcG99L3VzZWQtc3RyaW5nc19lbi5qc29uYCwgSlNPTi5zdHJpbmdpZnkoIHN0cmluZ01hcC5lbiwgbnVsbCwgMiApICk7XG59ICkoKTsiXSwibmFtZXMiOlsiZnMiLCJnZXRSZXBvIiwiQ2hpcHBlckNvbnN0YW50cyIsInRyYW5zcGlsZSIsImdldExvY2FsZXNGcm9tUmVwb3NpdG9yeSIsImdldFBoZXRMaWJzIiwiZ2V0U3RyaW5nTWFwIiwid2VicGFja0J1aWxkIiwicmVwbyIsInJlcG9zIiwic2lsZW50Iiwid2VicGFja1Jlc3VsdCIsInBoZXRMaWJzIiwiYWxsTG9jYWxlcyIsIkZBTExCQUNLX0xPQ0FMRSIsInN0cmluZ01hcCIsInVzZWRNb2R1bGVzIiwid3JpdGVGaWxlU3luYyIsIkpTT04iLCJzdHJpbmdpZnkiLCJlbiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFdEQsT0FBT0EsUUFBUSxLQUFLO0FBQ3BCLE9BQU9DLGFBQWEsNkRBQTZEO0FBQ2pGLE9BQU9DLHNCQUFzQixtQ0FBbUM7QUFDaEUsT0FBT0MsZUFBZSw0QkFBNEI7QUFDbEQsT0FBT0MsOEJBQThCLGlDQUFpQztBQUN0RSxPQUFPQyxpQkFBaUIsb0JBQW9CO0FBQzVDLE9BQU9DLGtCQUFrQixxQkFBcUI7QUFDOUMsT0FBT0Msa0JBQWtCLHFCQUFxQjtBQUU5Qzs7O0NBR0MsR0FDRCxNQUFNQyxPQUFPUDtBQUVYLG9CQUFBO0lBQ0EsTUFBTUUsVUFBVztRQUFFTSxPQUFPSixZQUFhRztRQUFRRSxRQUFRO0lBQUs7SUFDNUQsTUFBTUMsZ0JBQWdCLE1BQU1KLGFBQWNDLE1BQU07SUFFaEQsTUFBTUksV0FBV1AsWUFBYUcsTUFBTTtJQUNwQyxNQUFNSyxhQUFhO1FBQUVYLGlCQUFpQlksZUFBZTtXQUFLVix5QkFBMEJJO0tBQVE7SUFDNUYsTUFBTSxFQUFFTyxTQUFTLEVBQUUsR0FBR1QsYUFBY0UsTUFBTUssWUFBWUQsVUFBVUQsY0FBY0ssV0FBVztJQUUzRiw4R0FBOEc7SUFDOUcsK0VBQStFO0lBQy9FLHNDQUFzQztJQUN0Qyw0R0FBNEc7SUFDNUcsa0NBQWtDO0lBQ2hDaEIsR0FBR2lCLGFBQWEsQ0FBRSxDQUFDLDhCQUE4QixFQUFFVCxLQUFLLHFCQUFxQixDQUFDLEVBQUVVLEtBQUtDLFNBQVMsQ0FBRUosVUFBVUssRUFBRSxFQUFFLE1BQU07QUFDdEgifQ==