// Copyright 2013-2024, University of Colorado Boulder
import fs from 'fs';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import generateDevelopmentStrings from '../generateDevelopmentStrings.js';
/**
 * To support locales=* in unbuilt mode, generate a conglomerate JSON file for each repo with translations in babel. Run on all repos via:
 * * for-each.sh perennial-alias/data/active-repos npm install
 * * for-each.sh perennial-alias/data/active-repos grunt generate-development-strings
 *
 * This is not run in grunt update because it affects dependencies and outputs files outside of the repo.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const repo = getRepo();
if (fs.existsSync(`../${repo}/${repo}-strings_en.json`)) {
    generateDevelopmentStrings(repo);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2dlbmVyYXRlLWRldmVsb3BtZW50LXN0cmluZ3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgZ2V0UmVwbyBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRSZXBvLmpzJztcbmltcG9ydCBnZW5lcmF0ZURldmVsb3BtZW50U3RyaW5ncyBmcm9tICcuLi9nZW5lcmF0ZURldmVsb3BtZW50U3RyaW5ncy5qcyc7XG5cbi8qKlxuICogVG8gc3VwcG9ydCBsb2NhbGVzPSogaW4gdW5idWlsdCBtb2RlLCBnZW5lcmF0ZSBhIGNvbmdsb21lcmF0ZSBKU09OIGZpbGUgZm9yIGVhY2ggcmVwbyB3aXRoIHRyYW5zbGF0aW9ucyBpbiBiYWJlbC4gUnVuIG9uIGFsbCByZXBvcyB2aWE6XG4gKiAqIGZvci1lYWNoLnNoIHBlcmVubmlhbC1hbGlhcy9kYXRhL2FjdGl2ZS1yZXBvcyBucG0gaW5zdGFsbFxuICogKiBmb3ItZWFjaC5zaCBwZXJlbm5pYWwtYWxpYXMvZGF0YS9hY3RpdmUtcmVwb3MgZ3J1bnQgZ2VuZXJhdGUtZGV2ZWxvcG1lbnQtc3RyaW5nc1xuICpcbiAqIFRoaXMgaXMgbm90IHJ1biBpbiBncnVudCB1cGRhdGUgYmVjYXVzZSBpdCBhZmZlY3RzIGRlcGVuZGVuY2llcyBhbmQgb3V0cHV0cyBmaWxlcyBvdXRzaWRlIG9mIHRoZSByZXBvLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmNvbnN0IHJlcG8gPSBnZXRSZXBvKCk7XG5cbmlmICggZnMuZXhpc3RzU3luYyggYC4uLyR7cmVwb30vJHtyZXBvfS1zdHJpbmdzX2VuLmpzb25gICkgKSB7XG4gIGdlbmVyYXRlRGV2ZWxvcG1lbnRTdHJpbmdzKCByZXBvICk7XG59Il0sIm5hbWVzIjpbImZzIiwiZ2V0UmVwbyIsImdlbmVyYXRlRGV2ZWxvcG1lbnRTdHJpbmdzIiwicmVwbyIsImV4aXN0c1N5bmMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RCxPQUFPQSxRQUFRLEtBQUs7QUFDcEIsT0FBT0MsYUFBYSw2REFBNkQ7QUFDakYsT0FBT0MsZ0NBQWdDLG1DQUFtQztBQUUxRTs7Ozs7Ozs7Q0FRQyxHQUNELE1BQU1DLE9BQU9GO0FBRWIsSUFBS0QsR0FBR0ksVUFBVSxDQUFFLENBQUMsR0FBRyxFQUFFRCxLQUFLLENBQUMsRUFBRUEsS0FBSyxnQkFBZ0IsQ0FBQyxHQUFLO0lBQzNERCwyQkFBNEJDO0FBQzlCIn0=