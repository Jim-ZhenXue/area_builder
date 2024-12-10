// Copyright 2023, University of Colorado Boulder
/**
 * Copy an HTML file with all latest PhET-iO published sim links in it.
 *
 * USAGE:
 * cd perennial/
 * node publish-phet-io-latest-links.js ./path/to/public/html/file/
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
const fs = require('fs');
const path = require('path');
const getPhetioLinks = require('../common/getPhetioLinks');
const assert = require('assert');
_async_to_generator(function*() {
    const phetioLinks = yield getPhetioLinks();
    const filename = 'index.html';
    const publishPath = process.argv[2];
    assert(publishPath, 'usage: cd perennial; node js/scripts/publish-phet-io-latest-links.js {{PATH_TO_PUBLISHED_HTML}}');
    const htmlLinks = phetioLinks.map((link)=>`<a href="${link}">${link}</a><br/>`);
    const html = `
  <h1>Latest PhET-iO Links</h1>
  ${htmlLinks.join('\n')}
  `;
    fs.writeFileSync(path.join(path.resolve(publishPath), filename), html);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3B1Ymxpc2gtcGhldC1pby1sYXRlc3QtbGlua3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENvcHkgYW4gSFRNTCBmaWxlIHdpdGggYWxsIGxhdGVzdCBQaEVULWlPIHB1Ymxpc2hlZCBzaW0gbGlua3MgaW4gaXQuXG4gKlxuICogVVNBR0U6XG4gKiBjZCBwZXJlbm5pYWwvXG4gKiBub2RlIHB1Ymxpc2gtcGhldC1pby1sYXRlc3QtbGlua3MuanMgLi9wYXRoL3RvL3B1YmxpYy9odG1sL2ZpbGUvXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XG5jb25zdCBnZXRQaGV0aW9MaW5rcyA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2V0UGhldGlvTGlua3MnICk7XG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuXG4oIGFzeW5jICgpID0+IHtcblxuICBjb25zdCBwaGV0aW9MaW5rcyA9IGF3YWl0IGdldFBoZXRpb0xpbmtzKCk7XG4gIGNvbnN0IGZpbGVuYW1lID0gJ2luZGV4Lmh0bWwnO1xuICBjb25zdCBwdWJsaXNoUGF0aCA9IHByb2Nlc3MuYXJndlsgMiBdO1xuICBhc3NlcnQoIHB1Ymxpc2hQYXRoLCAndXNhZ2U6IGNkIHBlcmVubmlhbDsgbm9kZSBqcy9zY3JpcHRzL3B1Ymxpc2gtcGhldC1pby1sYXRlc3QtbGlua3MuanMge3tQQVRIX1RPX1BVQkxJU0hFRF9IVE1MfX0nICk7XG5cbiAgY29uc3QgaHRtbExpbmtzID0gcGhldGlvTGlua3MubWFwKCBsaW5rID0+IGA8YSBocmVmPVwiJHtsaW5rfVwiPiR7bGlua308L2E+PGJyLz5gICk7XG4gIGNvbnN0IGh0bWwgPSBgXG4gIDxoMT5MYXRlc3QgUGhFVC1pTyBMaW5rczwvaDE+XG4gICR7aHRtbExpbmtzLmpvaW4oICdcXG4nICl9XG4gIGA7XG4gIGZzLndyaXRlRmlsZVN5bmMoIHBhdGguam9pbiggcGF0aC5yZXNvbHZlKCBwdWJsaXNoUGF0aCApLCBmaWxlbmFtZSApLCBodG1sICk7XG59ICkoKTsiXSwibmFtZXMiOlsiZnMiLCJyZXF1aXJlIiwicGF0aCIsImdldFBoZXRpb0xpbmtzIiwiYXNzZXJ0IiwicGhldGlvTGlua3MiLCJmaWxlbmFtZSIsInB1Ymxpc2hQYXRoIiwicHJvY2VzcyIsImFyZ3YiLCJodG1sTGlua3MiLCJtYXAiLCJsaW5rIiwiaHRtbCIsImpvaW4iLCJ3cml0ZUZpbGVTeW5jIiwicmVzb2x2ZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7O0NBT0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsS0FBS0MsUUFBUztBQUNwQixNQUFNQyxPQUFPRCxRQUFTO0FBQ3RCLE1BQU1FLGlCQUFpQkYsUUFBUztBQUNoQyxNQUFNRyxTQUFTSCxRQUFTO0FBRXRCLG9CQUFBO0lBRUEsTUFBTUksY0FBYyxNQUFNRjtJQUMxQixNQUFNRyxXQUFXO0lBQ2pCLE1BQU1DLGNBQWNDLFFBQVFDLElBQUksQ0FBRSxFQUFHO0lBQ3JDTCxPQUFRRyxhQUFhO0lBRXJCLE1BQU1HLFlBQVlMLFlBQVlNLEdBQUcsQ0FBRUMsQ0FBQUEsT0FBUSxDQUFDLFNBQVMsRUFBRUEsS0FBSyxFQUFFLEVBQUVBLEtBQUssU0FBUyxDQUFDO0lBQy9FLE1BQU1DLE9BQU8sQ0FBQzs7RUFFZCxFQUFFSCxVQUFVSSxJQUFJLENBQUUsTUFBTztFQUN6QixDQUFDO0lBQ0RkLEdBQUdlLGFBQWEsQ0FBRWIsS0FBS1ksSUFBSSxDQUFFWixLQUFLYyxPQUFPLENBQUVULGNBQWVELFdBQVlPO0FBQ3hFIn0=