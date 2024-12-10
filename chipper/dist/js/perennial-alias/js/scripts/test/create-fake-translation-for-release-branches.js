// Copyright 2024, University of Colorado Boulder
/**
 * For testing for https://github.com/phetsims/joist/issues/963.
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
const Maintenance = require('../../common/Maintenance');
const winston = require('winston');
const fs = require('fs');
winston.default.transports.console.level = 'error';
const testLocale = 'pu'; // Palauan, `pau`
_async_to_generator(function*() {
    for (const releaseBranch of yield Maintenance.loadAllMaintenanceBranches()){
        const esTranslationFile = `../release-branches/${releaseBranch.repo}-${releaseBranch.branch}/babel/${releaseBranch.repo}/${releaseBranch.repo}-strings_es.json`;
        const testTranslationFile = `../release-branches/${releaseBranch.repo}-${releaseBranch.branch}/babel/${releaseBranch.repo}/${releaseBranch.repo}-strings_${testLocale}.json`;
        console.log('in:', esTranslationFile);
        console.log('out:', testTranslationFile);
        fs.copyFileSync(esTranslationFile, testTranslationFile);
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3Rlc3QvY3JlYXRlLWZha2UtdHJhbnNsYXRpb24tZm9yLXJlbGVhc2UtYnJhbmNoZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZvciB0ZXN0aW5nIGZvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzk2My5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgTWFpbnRlbmFuY2UgPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL01haW50ZW5hbmNlJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5cbndpbnN0b24uZGVmYXVsdC50cmFuc3BvcnRzLmNvbnNvbGUubGV2ZWwgPSAnZXJyb3InO1xuXG5jb25zdCB0ZXN0TG9jYWxlID0gJ3B1JzsgLy8gUGFsYXVhbiwgYHBhdWBcblxuKCBhc3luYyAoKSA9PiB7XG4gIGZvciAoIGNvbnN0IHJlbGVhc2VCcmFuY2ggb2YgYXdhaXQgTWFpbnRlbmFuY2UubG9hZEFsbE1haW50ZW5hbmNlQnJhbmNoZXMoKSApIHtcbiAgICBjb25zdCBlc1RyYW5zbGF0aW9uRmlsZSA9IGAuLi9yZWxlYXNlLWJyYW5jaGVzLyR7cmVsZWFzZUJyYW5jaC5yZXBvfS0ke3JlbGVhc2VCcmFuY2guYnJhbmNofS9iYWJlbC8ke3JlbGVhc2VCcmFuY2gucmVwb30vJHtyZWxlYXNlQnJhbmNoLnJlcG99LXN0cmluZ3NfZXMuanNvbmA7XG4gICAgY29uc3QgdGVzdFRyYW5zbGF0aW9uRmlsZSA9IGAuLi9yZWxlYXNlLWJyYW5jaGVzLyR7cmVsZWFzZUJyYW5jaC5yZXBvfS0ke3JlbGVhc2VCcmFuY2guYnJhbmNofS9iYWJlbC8ke3JlbGVhc2VCcmFuY2gucmVwb30vJHtyZWxlYXNlQnJhbmNoLnJlcG99LXN0cmluZ3NfJHt0ZXN0TG9jYWxlfS5qc29uYDtcblxuICAgIGNvbnNvbGUubG9nKCAnaW46JywgZXNUcmFuc2xhdGlvbkZpbGUgKTtcbiAgICBjb25zb2xlLmxvZyggJ291dDonLCB0ZXN0VHJhbnNsYXRpb25GaWxlICk7XG4gICAgZnMuY29weUZpbGVTeW5jKCBlc1RyYW5zbGF0aW9uRmlsZSwgdGVzdFRyYW5zbGF0aW9uRmlsZSApO1xuICB9XG59ICkoKTsiXSwibmFtZXMiOlsiTWFpbnRlbmFuY2UiLCJyZXF1aXJlIiwid2luc3RvbiIsImZzIiwiZGVmYXVsdCIsInRyYW5zcG9ydHMiLCJjb25zb2xlIiwibGV2ZWwiLCJ0ZXN0TG9jYWxlIiwicmVsZWFzZUJyYW5jaCIsImxvYWRBbGxNYWludGVuYW5jZUJyYW5jaGVzIiwiZXNUcmFuc2xhdGlvbkZpbGUiLCJyZXBvIiwiYnJhbmNoIiwidGVzdFRyYW5zbGF0aW9uRmlsZSIsImxvZyIsImNvcHlGaWxlU3luYyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsY0FBY0MsUUFBUztBQUM3QixNQUFNQyxVQUFVRCxRQUFTO0FBQ3pCLE1BQU1FLEtBQUtGLFFBQVM7QUFFcEJDLFFBQVFFLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDQyxPQUFPLENBQUNDLEtBQUssR0FBRztBQUUzQyxNQUFNQyxhQUFhLE1BQU0saUJBQWlCO0FBRXhDLG9CQUFBO0lBQ0EsS0FBTSxNQUFNQyxpQkFBaUIsTUFBTVQsWUFBWVUsMEJBQTBCLEdBQUs7UUFDNUUsTUFBTUMsb0JBQW9CLENBQUMsb0JBQW9CLEVBQUVGLGNBQWNHLElBQUksQ0FBQyxDQUFDLEVBQUVILGNBQWNJLE1BQU0sQ0FBQyxPQUFPLEVBQUVKLGNBQWNHLElBQUksQ0FBQyxDQUFDLEVBQUVILGNBQWNHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUMvSixNQUFNRSxzQkFBc0IsQ0FBQyxvQkFBb0IsRUFBRUwsY0FBY0csSUFBSSxDQUFDLENBQUMsRUFBRUgsY0FBY0ksTUFBTSxDQUFDLE9BQU8sRUFBRUosY0FBY0csSUFBSSxDQUFDLENBQUMsRUFBRUgsY0FBY0csSUFBSSxDQUFDLFNBQVMsRUFBRUosV0FBVyxLQUFLLENBQUM7UUFFNUtGLFFBQVFTLEdBQUcsQ0FBRSxPQUFPSjtRQUNwQkwsUUFBUVMsR0FBRyxDQUFFLFFBQVFEO1FBQ3JCWCxHQUFHYSxZQUFZLENBQUVMLG1CQUFtQkc7SUFDdEM7QUFDRiJ9