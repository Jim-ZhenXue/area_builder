// Copyright 2020, University of Colorado Boulder
/**
 * Updates the development/test HTML as needed for a change in the version. Updates are based on the version in the
 * package.json. This will also commit if an update occurs.
 *
 * See https://github.com/phetsims/chipper/issues/926
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
const execute = require('./execute').default;
const gitAdd = require('./gitAdd');
const gitCommit = require('./gitCommit');
const gitIsClean = require('./gitIsClean');
const gruntCommand = require('./gruntCommand');
const loadJSON = require('./loadJSON');
const winston = require('winston');
/**
 * Updates the development/test HTML as needed for a change in the version, and creates a commit.
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    winston.info(`Updating HTML for ${repo} with the new version strings`);
    const isClean = yield gitIsClean(repo);
    if (!isClean) {
        throw new Error(`Unclean status in ${repo}, cannot clean up HTML`);
    }
    // We'll want to update development/test HTML as necessary, since they'll include the version
    const packageObject = yield loadJSON(`../${repo}/package.json`);
    yield execute(gruntCommand, [
        'generate-development-html'
    ], `../${repo}`);
    yield gitAdd(repo, `${repo}_en.html`);
    if (packageObject.phet.generatedUnitTests) {
        yield execute(gruntCommand, [
            'generate-test-html'
        ], `../${repo}`);
        yield gitAdd(repo, `${repo}-tests.html`);
    }
    if (!(yield gitIsClean(repo))) {
        yield gitCommit(repo, `Bumping dev${packageObject.phet.generatedUnitTests ? '/test' : ''} HTML with new version`);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vdXBkYXRlSFRNTFZlcnNpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIGRldmVsb3BtZW50L3Rlc3QgSFRNTCBhcyBuZWVkZWQgZm9yIGEgY2hhbmdlIGluIHRoZSB2ZXJzaW9uLiBVcGRhdGVzIGFyZSBiYXNlZCBvbiB0aGUgdmVyc2lvbiBpbiB0aGVcbiAqIHBhY2thZ2UuanNvbi4gVGhpcyB3aWxsIGFsc28gY29tbWl0IGlmIGFuIHVwZGF0ZSBvY2N1cnMuXG4gKlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy85MjZcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGdpdEFkZCA9IHJlcXVpcmUoICcuL2dpdEFkZCcgKTtcbmNvbnN0IGdpdENvbW1pdCA9IHJlcXVpcmUoICcuL2dpdENvbW1pdCcgKTtcbmNvbnN0IGdpdElzQ2xlYW4gPSByZXF1aXJlKCAnLi9naXRJc0NsZWFuJyApO1xuY29uc3QgZ3J1bnRDb21tYW5kID0gcmVxdWlyZSggJy4vZ3J1bnRDb21tYW5kJyApO1xuY29uc3QgbG9hZEpTT04gPSByZXF1aXJlKCAnLi9sb2FkSlNPTicgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBkZXZlbG9wbWVudC90ZXN0IEhUTUwgYXMgbmVlZGVkIGZvciBhIGNoYW5nZSBpbiB0aGUgdmVyc2lvbiwgYW5kIGNyZWF0ZXMgYSBjb21taXQuXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcbiAgd2luc3Rvbi5pbmZvKCBgVXBkYXRpbmcgSFRNTCBmb3IgJHtyZXBvfSB3aXRoIHRoZSBuZXcgdmVyc2lvbiBzdHJpbmdzYCApO1xuXG4gIGNvbnN0IGlzQ2xlYW4gPSBhd2FpdCBnaXRJc0NsZWFuKCByZXBvICk7XG4gIGlmICggIWlzQ2xlYW4gKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgVW5jbGVhbiBzdGF0dXMgaW4gJHtyZXBvfSwgY2Fubm90IGNsZWFuIHVwIEhUTUxgICk7XG4gIH1cblxuICAvLyBXZSdsbCB3YW50IHRvIHVwZGF0ZSBkZXZlbG9wbWVudC90ZXN0IEhUTUwgYXMgbmVjZXNzYXJ5LCBzaW5jZSB0aGV5J2xsIGluY2x1ZGUgdGhlIHZlcnNpb25cbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IGF3YWl0IGxvYWRKU09OKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnZ2VuZXJhdGUtZGV2ZWxvcG1lbnQtaHRtbCcgXSwgYC4uLyR7cmVwb31gICk7XG4gIGF3YWl0IGdpdEFkZCggcmVwbywgYCR7cmVwb31fZW4uaHRtbGAgKTtcblxuICBpZiAoIHBhY2thZ2VPYmplY3QucGhldC5nZW5lcmF0ZWRVbml0VGVzdHMgKSB7XG4gICAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdnZW5lcmF0ZS10ZXN0LWh0bWwnIF0sIGAuLi8ke3JlcG99YCApO1xuICAgIGF3YWl0IGdpdEFkZCggcmVwbywgYCR7cmVwb30tdGVzdHMuaHRtbGAgKTtcbiAgfVxuICBpZiAoICEoIGF3YWl0IGdpdElzQ2xlYW4oIHJlcG8gKSApICkge1xuICAgIGF3YWl0IGdpdENvbW1pdCggcmVwbywgYEJ1bXBpbmcgZGV2JHtwYWNrYWdlT2JqZWN0LnBoZXQuZ2VuZXJhdGVkVW5pdFRlc3RzID8gJy90ZXN0JyA6ICcnfSBIVE1MIHdpdGggbmV3IHZlcnNpb25gICk7XG4gIH1cbn07Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsImdpdEFkZCIsImdpdENvbW1pdCIsImdpdElzQ2xlYW4iLCJncnVudENvbW1hbmQiLCJsb2FkSlNPTiIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImluZm8iLCJpc0NsZWFuIiwiRXJyb3IiLCJwYWNrYWdlT2JqZWN0IiwicGhldCIsImdlbmVyYXRlZFVuaXRUZXN0cyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7O0NBT0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsVUFBVUMsUUFBUyxhQUFjQyxPQUFPO0FBQzlDLE1BQU1DLFNBQVNGLFFBQVM7QUFDeEIsTUFBTUcsWUFBWUgsUUFBUztBQUMzQixNQUFNSSxhQUFhSixRQUFTO0FBQzVCLE1BQU1LLGVBQWVMLFFBQVM7QUFDOUIsTUFBTU0sV0FBV04sUUFBUztBQUMxQixNQUFNTyxVQUFVUCxRQUFTO0FBRXpCOzs7Ozs7Q0FNQyxHQUNEUSxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJO0lBQ25DSCxRQUFRSSxJQUFJLENBQUUsQ0FBQyxrQkFBa0IsRUFBRUQsS0FBSyw2QkFBNkIsQ0FBQztJQUV0RSxNQUFNRSxVQUFVLE1BQU1SLFdBQVlNO0lBQ2xDLElBQUssQ0FBQ0UsU0FBVTtRQUNkLE1BQU0sSUFBSUMsTUFBTyxDQUFDLGtCQUFrQixFQUFFSCxLQUFLLHNCQUFzQixDQUFDO0lBQ3BFO0lBRUEsNkZBQTZGO0lBQzdGLE1BQU1JLGdCQUFnQixNQUFNUixTQUFVLENBQUMsR0FBRyxFQUFFSSxLQUFLLGFBQWEsQ0FBQztJQUMvRCxNQUFNWCxRQUFTTSxjQUFjO1FBQUU7S0FBNkIsRUFBRSxDQUFDLEdBQUcsRUFBRUssTUFBTTtJQUMxRSxNQUFNUixPQUFRUSxNQUFNLEdBQUdBLEtBQUssUUFBUSxDQUFDO0lBRXJDLElBQUtJLGNBQWNDLElBQUksQ0FBQ0Msa0JBQWtCLEVBQUc7UUFDM0MsTUFBTWpCLFFBQVNNLGNBQWM7WUFBRTtTQUFzQixFQUFFLENBQUMsR0FBRyxFQUFFSyxNQUFNO1FBQ25FLE1BQU1SLE9BQVFRLE1BQU0sR0FBR0EsS0FBSyxXQUFXLENBQUM7SUFDMUM7SUFDQSxJQUFLLENBQUcsQ0FBQSxNQUFNTixXQUFZTSxLQUFLLEdBQU07UUFDbkMsTUFBTVAsVUFBV08sTUFBTSxDQUFDLFdBQVcsRUFBRUksY0FBY0MsSUFBSSxDQUFDQyxrQkFBa0IsR0FBRyxVQUFVLEdBQUcsc0JBQXNCLENBQUM7SUFDbkg7QUFDRiJ9