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
/**
 * Generates the lists under perennial/data/, and if there were changes, will commit and push.
 *
 * This grunt task should be run manually by developers when a change has been made that would add or remove
 * an entry from one of the perennial/data/ lists. But it will also be run as part of daily-grunt-work.sh
 * to catch anything that was forgotten.
 *
 * This used to be run automatically by bayes whenever a relevant change was made, see
 * https://github.com/phetsims/perennial/issues/66
 *
 * But we decided to change it to a manual step with a daily fallback, see
 * https://github.com/phetsims/perennial/issues/213
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ const getActiveRepos = require('../../common/getActiveRepos.js');
const getBranch = require('../../common/getBranch.js');
const gitAdd = require('../../common/gitAdd.js');
const gitCommit = require('../../common/gitCommit.js');
const gitIsClean = require('../../common/gitIsClean.js');
const gitPush = require('../../common/gitPush.js');
const assert = require('assert');
const fs = require('fs');
const grunt = require('grunt');
const os = require('os');
const winston = require('winston');
function generateData() {
    return _generateData.apply(this, arguments);
}
function _generateData() {
    _generateData = /**
 * Generates the lists under perennial/data/, and if there were changes, will commit and push.
 */ _async_to_generator(function*() {
        if ((yield getBranch('perennial')) !== 'main' || !(yield gitIsClean('perennial'))) {
            grunt.fail.fatal('Data will only be generated if perennial is on main with no working-copy changes.');
        }
        const activeRepos = getActiveRepos();
        function writeList(name, packageFilter) {
            const repos = activeRepos.filter((repo)=>{
                // Make sure that if someone doesn't have all repositories checked out that this will FAIL. Otherwise bad things.
                assert(grunt.file.exists(`../${repo}`));
                let packageObject;
                try {
                    packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
                } catch (e) {
                    return false;
                }
                return packageObject.phet && packageFilter(packageObject.phet);
            });
            grunt.log.writeln(`Writing to data/${name}`);
            fs.writeFileSync(`data/${name}`, repos.join(os.EOL) + os.EOL);
        }
        writeList('interactive-description', (phet)=>phet.simFeatures && phet.simFeatures.supportsInteractiveDescription);
        writeList('voicing', (phet)=>phet.simFeatures && phet.simFeatures.supportsVoicing);
        writeList('active-runnables', (phet)=>phet.runnable);
        writeList('active-sims', (phet)=>phet.simulation);
        writeList('unit-tests', (phet)=>phet.generatedUnitTests);
        writeList('phet-io', (phet)=>phet.runnable && phet.supportedBrands && phet.supportedBrands.includes('phet-io'));
        writeList('phet-io-api-stable', (phet)=>{
            return phet.runnable && phet.supportedBrands && phet.supportedBrands.includes('phet-io') && phet['phet-io'] && phet['phet-io'].compareDesignedAPIChanges;
        });
        yield gitAdd('perennial', 'data/interactive-description');
        yield gitAdd('perennial', 'data/voicing');
        yield gitAdd('perennial', 'data/active-runnables');
        yield gitAdd('perennial', 'data/active-sims');
        yield gitAdd('perennial', 'data/unit-tests');
        yield gitAdd('perennial', 'data/phet-io');
        yield gitAdd('perennial', 'data/phet-io-api-stable');
        const hasChanges = !(yield gitIsClean('perennial'));
        if (hasChanges) {
            winston.info('Changes to data files detected, will push');
            yield gitCommit('perennial', 'Automated update of perennial data files');
            yield gitPush('perennial', 'main');
        } else {
            winston.info('No changes detected');
        }
    });
    return _generateData.apply(this, arguments);
}
_async_to_generator(function*() {
    return generateData();
})();
export { };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9nZW5lcmF0ZS1kYXRhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuaW1wb3J0IHsgSW50ZW50aW9uYWxQZXJlbm5pYWxBbnkgfSBmcm9tICcuLi8uLi9icm93c2VyLWFuZC1ub2RlL1BlcmVubmlhbFR5cGVzLmpzJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIGxpc3RzIHVuZGVyIHBlcmVubmlhbC9kYXRhLywgYW5kIGlmIHRoZXJlIHdlcmUgY2hhbmdlcywgd2lsbCBjb21taXQgYW5kIHB1c2guXG4gKlxuICogVGhpcyBncnVudCB0YXNrIHNob3VsZCBiZSBydW4gbWFudWFsbHkgYnkgZGV2ZWxvcGVycyB3aGVuIGEgY2hhbmdlIGhhcyBiZWVuIG1hZGUgdGhhdCB3b3VsZCBhZGQgb3IgcmVtb3ZlXG4gKiBhbiBlbnRyeSBmcm9tIG9uZSBvZiB0aGUgcGVyZW5uaWFsL2RhdGEvIGxpc3RzLiBCdXQgaXQgd2lsbCBhbHNvIGJlIHJ1biBhcyBwYXJ0IG9mIGRhaWx5LWdydW50LXdvcmsuc2hcbiAqIHRvIGNhdGNoIGFueXRoaW5nIHRoYXQgd2FzIGZvcmdvdHRlbi5cbiAqXG4gKiBUaGlzIHVzZWQgdG8gYmUgcnVuIGF1dG9tYXRpY2FsbHkgYnkgYmF5ZXMgd2hlbmV2ZXIgYSByZWxldmFudCBjaGFuZ2Ugd2FzIG1hZGUsIHNlZVxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvNjZcbiAqXG4gKiBCdXQgd2UgZGVjaWRlZCB0byBjaGFuZ2UgaXQgdG8gYSBtYW51YWwgc3RlcCB3aXRoIGEgZGFpbHkgZmFsbGJhY2ssIHNlZVxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMjEzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IGdldEFjdGl2ZVJlcG9zID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi9nZXRBY3RpdmVSZXBvcy5qcycgKTtcbmNvbnN0IGdldEJyYW5jaCA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vZ2V0QnJhbmNoLmpzJyApO1xuY29uc3QgZ2l0QWRkID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi9naXRBZGQuanMnICk7XG5jb25zdCBnaXRDb21taXQgPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2dpdENvbW1pdC5qcycgKTtcbmNvbnN0IGdpdElzQ2xlYW4gPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2dpdElzQ2xlYW4uanMnICk7XG5jb25zdCBnaXRQdXNoID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi9naXRQdXNoLmpzJyApO1xuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3QgZ3J1bnQgPSByZXF1aXJlKCAnZ3J1bnQnICk7XG5jb25zdCBvcyA9IHJlcXVpcmUoICdvcycgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIGxpc3RzIHVuZGVyIHBlcmVubmlhbC9kYXRhLywgYW5kIGlmIHRoZXJlIHdlcmUgY2hhbmdlcywgd2lsbCBjb21taXQgYW5kIHB1c2guXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRGF0YSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKCBhd2FpdCBnZXRCcmFuY2goICdwZXJlbm5pYWwnICkgIT09ICdtYWluJyB8fCAhYXdhaXQgZ2l0SXNDbGVhbiggJ3BlcmVubmlhbCcgKSApIHtcbiAgICBncnVudC5mYWlsLmZhdGFsKCAnRGF0YSB3aWxsIG9ubHkgYmUgZ2VuZXJhdGVkIGlmIHBlcmVubmlhbCBpcyBvbiBtYWluIHdpdGggbm8gd29ya2luZy1jb3B5IGNoYW5nZXMuJyApO1xuICB9XG5cbiAgY29uc3QgYWN0aXZlUmVwb3M6IHN0cmluZ1tdID0gZ2V0QWN0aXZlUmVwb3MoKTtcblxuICBmdW5jdGlvbiB3cml0ZUxpc3QoIG5hbWU6IHN0cmluZywgcGFja2FnZUZpbHRlcjogKCByZXBvOiBJbnRlbnRpb25hbFBlcmVubmlhbEFueSApID0+IHZvaWQgKTogdm9pZCB7XG4gICAgY29uc3QgcmVwb3MgPSBhY3RpdmVSZXBvcy5maWx0ZXIoIHJlcG8gPT4ge1xuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgaWYgc29tZW9uZSBkb2Vzbid0IGhhdmUgYWxsIHJlcG9zaXRvcmllcyBjaGVja2VkIG91dCB0aGF0IHRoaXMgd2lsbCBGQUlMLiBPdGhlcndpc2UgYmFkIHRoaW5ncy5cbiAgICAgIGFzc2VydCggZ3J1bnQuZmlsZS5leGlzdHMoIGAuLi8ke3JlcG99YCApICk7XG5cbiAgICAgIGxldCBwYWNrYWdlT2JqZWN0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCwgJ3V0ZjgnICkgKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoKCBlICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFja2FnZU9iamVjdC5waGV0ICYmIHBhY2thZ2VGaWx0ZXIoIHBhY2thZ2VPYmplY3QucGhldCApO1xuICAgIH0gKTtcblxuICAgIGdydW50LmxvZy53cml0ZWxuKCBgV3JpdGluZyB0byBkYXRhLyR7bmFtZX1gICk7XG4gICAgZnMud3JpdGVGaWxlU3luYyggYGRhdGEvJHtuYW1lfWAsIHJlcG9zLmpvaW4oIG9zLkVPTCApICsgb3MuRU9MICk7XG4gIH1cblxuICB3cml0ZUxpc3QoICdpbnRlcmFjdGl2ZS1kZXNjcmlwdGlvbicsIHBoZXQgPT4gcGhldC5zaW1GZWF0dXJlcyAmJiBwaGV0LnNpbUZlYXR1cmVzLnN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbiApO1xuICB3cml0ZUxpc3QoICd2b2ljaW5nJywgcGhldCA9PiBwaGV0LnNpbUZlYXR1cmVzICYmIHBoZXQuc2ltRmVhdHVyZXMuc3VwcG9ydHNWb2ljaW5nICk7XG4gIHdyaXRlTGlzdCggJ2FjdGl2ZS1ydW5uYWJsZXMnLCBwaGV0ID0+IHBoZXQucnVubmFibGUgKTtcbiAgd3JpdGVMaXN0KCAnYWN0aXZlLXNpbXMnLCBwaGV0ID0+IHBoZXQuc2ltdWxhdGlvbiApO1xuICB3cml0ZUxpc3QoICd1bml0LXRlc3RzJywgcGhldCA9PiBwaGV0LmdlbmVyYXRlZFVuaXRUZXN0cyApO1xuICB3cml0ZUxpc3QoICdwaGV0LWlvJywgcGhldCA9PiBwaGV0LnJ1bm5hYmxlICYmIHBoZXQuc3VwcG9ydGVkQnJhbmRzICYmIHBoZXQuc3VwcG9ydGVkQnJhbmRzLmluY2x1ZGVzKCAncGhldC1pbycgKSApO1xuICB3cml0ZUxpc3QoICdwaGV0LWlvLWFwaS1zdGFibGUnLCBwaGV0ID0+IHtcbiAgICByZXR1cm4gcGhldC5ydW5uYWJsZSAmJiBwaGV0LnN1cHBvcnRlZEJyYW5kcyAmJiBwaGV0LnN1cHBvcnRlZEJyYW5kcy5pbmNsdWRlcyggJ3BoZXQtaW8nICkgJiZcbiAgICAgICAgICAgcGhldFsgJ3BoZXQtaW8nIF0gJiYgcGhldFsgJ3BoZXQtaW8nIF0uY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlcztcbiAgfSApO1xuXG4gIGF3YWl0IGdpdEFkZCggJ3BlcmVubmlhbCcsICdkYXRhL2ludGVyYWN0aXZlLWRlc2NyaXB0aW9uJyApO1xuICBhd2FpdCBnaXRBZGQoICdwZXJlbm5pYWwnLCAnZGF0YS92b2ljaW5nJyApO1xuICBhd2FpdCBnaXRBZGQoICdwZXJlbm5pYWwnLCAnZGF0YS9hY3RpdmUtcnVubmFibGVzJyApO1xuICBhd2FpdCBnaXRBZGQoICdwZXJlbm5pYWwnLCAnZGF0YS9hY3RpdmUtc2ltcycgKTtcbiAgYXdhaXQgZ2l0QWRkKCAncGVyZW5uaWFsJywgJ2RhdGEvdW5pdC10ZXN0cycgKTtcbiAgYXdhaXQgZ2l0QWRkKCAncGVyZW5uaWFsJywgJ2RhdGEvcGhldC1pbycgKTtcbiAgYXdhaXQgZ2l0QWRkKCAncGVyZW5uaWFsJywgJ2RhdGEvcGhldC1pby1hcGktc3RhYmxlJyApO1xuXG4gIGNvbnN0IGhhc0NoYW5nZXMgPSAhYXdhaXQgZ2l0SXNDbGVhbiggJ3BlcmVubmlhbCcgKTtcbiAgaWYgKCBoYXNDaGFuZ2VzICkge1xuICAgIHdpbnN0b24uaW5mbyggJ0NoYW5nZXMgdG8gZGF0YSBmaWxlcyBkZXRlY3RlZCwgd2lsbCBwdXNoJyApO1xuICAgIGF3YWl0IGdpdENvbW1pdCggJ3BlcmVubmlhbCcsICdBdXRvbWF0ZWQgdXBkYXRlIG9mIHBlcmVubmlhbCBkYXRhIGZpbGVzJyApO1xuICAgIGF3YWl0IGdpdFB1c2goICdwZXJlbm5pYWwnLCAnbWFpbicgKTtcbiAgfVxuICBlbHNlIHtcbiAgICB3aW5zdG9uLmluZm8oICdObyBjaGFuZ2VzIGRldGVjdGVkJyApO1xuICB9XG59XG5cbiggYXN5bmMgKCkgPT4gZ2VuZXJhdGVEYXRhKCkgKSgpOyJdLCJuYW1lcyI6WyJnZXRBY3RpdmVSZXBvcyIsInJlcXVpcmUiLCJnZXRCcmFuY2giLCJnaXRBZGQiLCJnaXRDb21taXQiLCJnaXRJc0NsZWFuIiwiZ2l0UHVzaCIsImFzc2VydCIsImZzIiwiZ3J1bnQiLCJvcyIsIndpbnN0b24iLCJnZW5lcmF0ZURhdGEiLCJmYWlsIiwiZmF0YWwiLCJhY3RpdmVSZXBvcyIsIndyaXRlTGlzdCIsIm5hbWUiLCJwYWNrYWdlRmlsdGVyIiwicmVwb3MiLCJmaWx0ZXIiLCJyZXBvIiwiZmlsZSIsImV4aXN0cyIsInBhY2thZ2VPYmplY3QiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJlIiwicGhldCIsImxvZyIsIndyaXRlbG4iLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsIkVPTCIsInNpbUZlYXR1cmVzIiwic3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uIiwic3VwcG9ydHNWb2ljaW5nIiwicnVubmFibGUiLCJzaW11bGF0aW9uIiwiZ2VuZXJhdGVkVW5pdFRlc3RzIiwic3VwcG9ydGVkQnJhbmRzIiwiaW5jbHVkZXMiLCJjb21wYXJlRGVzaWduZWRBUElDaGFuZ2VzIiwiaGFzQ2hhbmdlcyIsImluZm8iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSWpEOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUVELE1BQU1BLGlCQUFpQkMsUUFBUztBQUNoQyxNQUFNQyxZQUFZRCxRQUFTO0FBQzNCLE1BQU1FLFNBQVNGLFFBQVM7QUFDeEIsTUFBTUcsWUFBWUgsUUFBUztBQUMzQixNQUFNSSxhQUFhSixRQUFTO0FBQzVCLE1BQU1LLFVBQVVMLFFBQVM7QUFDekIsTUFBTU0sU0FBU04sUUFBUztBQUN4QixNQUFNTyxLQUFLUCxRQUFTO0FBQ3BCLE1BQU1RLFFBQVFSLFFBQVM7QUFDdkIsTUFBTVMsS0FBS1QsUUFBUztBQUNwQixNQUFNVSxVQUFVVixRQUFTO1NBS1ZXO1dBQUFBOztTQUFBQTtJQUFBQSxnQkFIZjs7Q0FFQyxHQUNELG9CQUFBO1FBQ0UsSUFBSyxDQUFBLE1BQU1WLFVBQVcsWUFBWSxNQUFNLFVBQVUsQ0FBQyxDQUFBLE1BQU1HLFdBQVksWUFBWSxHQUFJO1lBQ25GSSxNQUFNSSxJQUFJLENBQUNDLEtBQUssQ0FBRTtRQUNwQjtRQUVBLE1BQU1DLGNBQXdCZjtRQUU5QixTQUFTZ0IsVUFBV0MsSUFBWSxFQUFFQyxhQUF3RDtZQUN4RixNQUFNQyxRQUFRSixZQUFZSyxNQUFNLENBQUVDLENBQUFBO2dCQUNoQyxpSEFBaUg7Z0JBQ2pIZCxPQUFRRSxNQUFNYSxJQUFJLENBQUNDLE1BQU0sQ0FBRSxDQUFDLEdBQUcsRUFBRUYsTUFBTTtnQkFFdkMsSUFBSUc7Z0JBQ0osSUFBSTtvQkFDRkEsZ0JBQWdCQyxLQUFLQyxLQUFLLENBQUVsQixHQUFHbUIsWUFBWSxDQUFFLENBQUMsR0FBRyxFQUFFTixLQUFLLGFBQWEsQ0FBQyxFQUFFO2dCQUMxRSxFQUNBLE9BQU9PLEdBQUk7b0JBQ1QsT0FBTztnQkFDVDtnQkFDQSxPQUFPSixjQUFjSyxJQUFJLElBQUlYLGNBQWVNLGNBQWNLLElBQUk7WUFDaEU7WUFFQXBCLE1BQU1xQixHQUFHLENBQUNDLE9BQU8sQ0FBRSxDQUFDLGdCQUFnQixFQUFFZCxNQUFNO1lBQzVDVCxHQUFHd0IsYUFBYSxDQUFFLENBQUMsS0FBSyxFQUFFZixNQUFNLEVBQUVFLE1BQU1jLElBQUksQ0FBRXZCLEdBQUd3QixHQUFHLElBQUt4QixHQUFHd0IsR0FBRztRQUNqRTtRQUVBbEIsVUFBVywyQkFBMkJhLENBQUFBLE9BQVFBLEtBQUtNLFdBQVcsSUFBSU4sS0FBS00sV0FBVyxDQUFDQyw4QkFBOEI7UUFDakhwQixVQUFXLFdBQVdhLENBQUFBLE9BQVFBLEtBQUtNLFdBQVcsSUFBSU4sS0FBS00sV0FBVyxDQUFDRSxlQUFlO1FBQ2xGckIsVUFBVyxvQkFBb0JhLENBQUFBLE9BQVFBLEtBQUtTLFFBQVE7UUFDcER0QixVQUFXLGVBQWVhLENBQUFBLE9BQVFBLEtBQUtVLFVBQVU7UUFDakR2QixVQUFXLGNBQWNhLENBQUFBLE9BQVFBLEtBQUtXLGtCQUFrQjtRQUN4RHhCLFVBQVcsV0FBV2EsQ0FBQUEsT0FBUUEsS0FBS1MsUUFBUSxJQUFJVCxLQUFLWSxlQUFlLElBQUlaLEtBQUtZLGVBQWUsQ0FBQ0MsUUFBUSxDQUFFO1FBQ3RHMUIsVUFBVyxzQkFBc0JhLENBQUFBO1lBQy9CLE9BQU9BLEtBQUtTLFFBQVEsSUFBSVQsS0FBS1ksZUFBZSxJQUFJWixLQUFLWSxlQUFlLENBQUNDLFFBQVEsQ0FBRSxjQUN4RWIsSUFBSSxDQUFFLFVBQVcsSUFBSUEsSUFBSSxDQUFFLFVBQVcsQ0FBQ2MseUJBQXlCO1FBQ3pFO1FBRUEsTUFBTXhDLE9BQVEsYUFBYTtRQUMzQixNQUFNQSxPQUFRLGFBQWE7UUFDM0IsTUFBTUEsT0FBUSxhQUFhO1FBQzNCLE1BQU1BLE9BQVEsYUFBYTtRQUMzQixNQUFNQSxPQUFRLGFBQWE7UUFDM0IsTUFBTUEsT0FBUSxhQUFhO1FBQzNCLE1BQU1BLE9BQVEsYUFBYTtRQUUzQixNQUFNeUMsYUFBYSxDQUFDLENBQUEsTUFBTXZDLFdBQVksWUFBWTtRQUNsRCxJQUFLdUMsWUFBYTtZQUNoQmpDLFFBQVFrQyxJQUFJLENBQUU7WUFDZCxNQUFNekMsVUFBVyxhQUFhO1lBQzlCLE1BQU1FLFFBQVMsYUFBYTtRQUM5QixPQUNLO1lBQ0hLLFFBQVFrQyxJQUFJLENBQUU7UUFDaEI7SUFDRjtXQXREZWpDOztBQXdEYixvQkFBQTtJQUFZQSxPQUFBQTs7QUExRmQsV0FBbUYifQ==