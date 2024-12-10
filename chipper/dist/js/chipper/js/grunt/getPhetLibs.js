// Copyright 2017-2024, University of Colorado Boulder
/**
 * Determines a list of all dependent repositories (for dependencies.json or other creation)
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { readFileSync } from 'fs';
import _ from 'lodash';
import ChipperConstants from '../common/ChipperConstants.js';
/**
 * Returns a list of all dependent repositories.
 *
 * @param repo
 * @param [brand] - If not specified, it will return the dependencies for all brands.
 */ export default function getPhetLibs(repo, brand) {
    if (brand === undefined || brand.length === 0) {
        return getPhetLibs(repo, ChipperConstants.BRANDS);
    } else if (Array.isArray(brand)) {
        return _.reduce(brand, (dependencies, brand)=>{
            return _.uniq(dependencies.concat(getPhetLibs(repo, brand)).sort());
        }, []);
    } else {
        const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
        let buildObject;
        try {
            buildObject = JSON.parse(readFileSync('../chipper/build.json', 'utf8'));
        } catch (e) {
            buildObject = {};
        }
        // start with package.json
        let phetLibs = packageObject && packageObject.phet && packageObject.phet.phetLibs ? packageObject.phet.phetLibs : [];
        // add the repo that's being built
        phetLibs.push(packageObject.name);
        // add common and brand-specific entries from build.json
        [
            'common',
            brand
        ].forEach((id)=>{
            if (buildObject[id] && buildObject[id].phetLibs) {
                phetLibs = phetLibs.concat(buildObject[id].phetLibs);
            }
        });
        // add brand specific dependencies from the package json
        if (packageObject.phet && packageObject.phet[brand] && packageObject.phet[brand].phetLibs) {
            phetLibs = phetLibs.concat(packageObject.phet[brand].phetLibs);
        }
        // wrappers are also marked as phetLibs, so we can get their shas without listing them twice
        if (brand === 'phet-io' && packageObject.phet && packageObject.phet[brand] && packageObject.phet[brand].wrappers) {
            const wrapperRepos = packageObject.phet[brand].wrappers.filter((wrapper)=>!wrapper.startsWith('phet-io-sim-specific'));
            phetLibs = phetLibs.concat(wrapperRepos);
        }
        // sort and remove duplicates
        return _.uniq(phetLibs.sort());
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dldFBoZXRMaWJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERldGVybWluZXMgYSBsaXN0IG9mIGFsbCBkZXBlbmRlbnQgcmVwb3NpdG9yaWVzIChmb3IgZGVwZW5kZW5jaWVzLmpzb24gb3Igb3RoZXIgY3JlYXRpb24pXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IENoaXBwZXJDb25zdGFudHMgZnJvbSAnLi4vY29tbW9uL0NoaXBwZXJDb25zdGFudHMuanMnO1xuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IG9mIGFsbCBkZXBlbmRlbnQgcmVwb3NpdG9yaWVzLlxuICpcbiAqIEBwYXJhbSByZXBvXG4gKiBAcGFyYW0gW2JyYW5kXSAtIElmIG5vdCBzcGVjaWZpZWQsIGl0IHdpbGwgcmV0dXJuIHRoZSBkZXBlbmRlbmNpZXMgZm9yIGFsbCBicmFuZHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFBoZXRMaWJzKCByZXBvOiBzdHJpbmcsIGJyYW5kPzogc3RyaW5nIHwgc3RyaW5nW10gKTogc3RyaW5nW10ge1xuXG4gIGlmICggYnJhbmQgPT09IHVuZGVmaW5lZCB8fCBicmFuZC5sZW5ndGggPT09IDAgKSB7XG4gICAgcmV0dXJuIGdldFBoZXRMaWJzKCByZXBvLCBDaGlwcGVyQ29uc3RhbnRzLkJSQU5EUyApO1xuICB9XG4gIGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KCBicmFuZCApICkge1xuICAgIHJldHVybiBfLnJlZHVjZSggYnJhbmQsICggZGVwZW5kZW5jaWVzOiBzdHJpbmdbXSwgYnJhbmQgKSA9PiB7XG4gICAgICByZXR1cm4gXy51bmlxKCBkZXBlbmRlbmNpZXMuY29uY2F0KCBnZXRQaGV0TGlicyggcmVwbywgYnJhbmQgKSApLnNvcnQoKSApO1xuICAgIH0sIFtdICk7XG4gIH1cbiAgZWxzZSB7XG4gICAgY29uc3QgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIHJlYWRGaWxlU3luYyggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCwgJ3V0ZjgnICkgKTtcbiAgICBsZXQgYnVpbGRPYmplY3Q7XG4gICAgdHJ5IHtcbiAgICAgIGJ1aWxkT2JqZWN0ID0gSlNPTi5wYXJzZSggcmVhZEZpbGVTeW5jKCAnLi4vY2hpcHBlci9idWlsZC5qc29uJywgJ3V0ZjgnICkgKTtcbiAgICB9XG4gICAgY2F0Y2goIGUgKSB7XG4gICAgICBidWlsZE9iamVjdCA9IHt9O1xuICAgIH1cblxuICAgIC8vIHN0YXJ0IHdpdGggcGFja2FnZS5qc29uXG4gICAgbGV0IHBoZXRMaWJzID0gcGFja2FnZU9iamVjdCAmJlxuICAgICAgICAgICAgICAgICAgIHBhY2thZ2VPYmplY3QucGhldCAmJlxuICAgICAgICAgICAgICAgICAgIHBhY2thZ2VPYmplY3QucGhldC5waGV0TGlicyA/XG4gICAgICAgICAgICAgICAgICAgcGFja2FnZU9iamVjdC5waGV0LnBoZXRMaWJzIDogW107XG5cbiAgICAvLyBhZGQgdGhlIHJlcG8gdGhhdCdzIGJlaW5nIGJ1aWx0XG4gICAgcGhldExpYnMucHVzaCggcGFja2FnZU9iamVjdC5uYW1lICk7XG5cbiAgICAvLyBhZGQgY29tbW9uIGFuZCBicmFuZC1zcGVjaWZpYyBlbnRyaWVzIGZyb20gYnVpbGQuanNvblxuICAgIFsgJ2NvbW1vbicsIGJyYW5kIF0uZm9yRWFjaCggaWQgPT4ge1xuICAgICAgaWYgKCBidWlsZE9iamVjdFsgaWQgXSAmJiBidWlsZE9iamVjdFsgaWQgXS5waGV0TGlicyApIHtcbiAgICAgICAgcGhldExpYnMgPSBwaGV0TGlicy5jb25jYXQoIGJ1aWxkT2JqZWN0WyBpZCBdLnBoZXRMaWJzICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gYWRkIGJyYW5kIHNwZWNpZmljIGRlcGVuZGVuY2llcyBmcm9tIHRoZSBwYWNrYWdlIGpzb25cbiAgICBpZiAoIHBhY2thZ2VPYmplY3QucGhldCAmJiBwYWNrYWdlT2JqZWN0LnBoZXRbIGJyYW5kIF0gJiYgcGFja2FnZU9iamVjdC5waGV0WyBicmFuZCBdLnBoZXRMaWJzICkge1xuICAgICAgcGhldExpYnMgPSBwaGV0TGlicy5jb25jYXQoIHBhY2thZ2VPYmplY3QucGhldFsgYnJhbmQgXS5waGV0TGlicyApO1xuICAgIH1cblxuICAgIC8vIHdyYXBwZXJzIGFyZSBhbHNvIG1hcmtlZCBhcyBwaGV0TGlicywgc28gd2UgY2FuIGdldCB0aGVpciBzaGFzIHdpdGhvdXQgbGlzdGluZyB0aGVtIHR3aWNlXG4gICAgaWYgKCBicmFuZCA9PT0gJ3BoZXQtaW8nICYmIHBhY2thZ2VPYmplY3QucGhldCAmJiBwYWNrYWdlT2JqZWN0LnBoZXRbIGJyYW5kIF0gJiYgcGFja2FnZU9iamVjdC5waGV0WyBicmFuZCBdLndyYXBwZXJzICkge1xuICAgICAgY29uc3Qgd3JhcHBlclJlcG9zID0gKCBwYWNrYWdlT2JqZWN0LnBoZXRbIGJyYW5kIF0ud3JhcHBlcnMgKS5maWx0ZXIoICggd3JhcHBlcjogc3RyaW5nICkgPT4gIXdyYXBwZXIuc3RhcnRzV2l0aCggJ3BoZXQtaW8tc2ltLXNwZWNpZmljJyApICk7XG4gICAgICBwaGV0TGlicyA9IHBoZXRMaWJzLmNvbmNhdCggd3JhcHBlclJlcG9zICk7XG4gICAgfVxuXG4gICAgLy8gc29ydCBhbmQgcmVtb3ZlIGR1cGxpY2F0ZXNcbiAgICByZXR1cm4gXy51bmlxKCBwaGV0TGlicy5zb3J0KCkgKTtcbiAgfVxufSJdLCJuYW1lcyI6WyJyZWFkRmlsZVN5bmMiLCJfIiwiQ2hpcHBlckNvbnN0YW50cyIsImdldFBoZXRMaWJzIiwicmVwbyIsImJyYW5kIiwidW5kZWZpbmVkIiwibGVuZ3RoIiwiQlJBTkRTIiwiQXJyYXkiLCJpc0FycmF5IiwicmVkdWNlIiwiZGVwZW5kZW5jaWVzIiwidW5pcSIsImNvbmNhdCIsInNvcnQiLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwiYnVpbGRPYmplY3QiLCJlIiwicGhldExpYnMiLCJwaGV0IiwicHVzaCIsIm5hbWUiLCJmb3JFYWNoIiwiaWQiLCJ3cmFwcGVycyIsIndyYXBwZXJSZXBvcyIsImZpbHRlciIsIndyYXBwZXIiLCJzdGFydHNXaXRoIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxTQUFTQSxZQUFZLFFBQVEsS0FBSztBQUNsQyxPQUFPQyxPQUFPLFNBQVM7QUFDdkIsT0FBT0Msc0JBQXNCLGdDQUFnQztBQUU3RDs7Ozs7Q0FLQyxHQUNELGVBQWUsU0FBU0MsWUFBYUMsSUFBWSxFQUFFQyxLQUF5QjtJQUUxRSxJQUFLQSxVQUFVQyxhQUFhRCxNQUFNRSxNQUFNLEtBQUssR0FBSTtRQUMvQyxPQUFPSixZQUFhQyxNQUFNRixpQkFBaUJNLE1BQU07SUFDbkQsT0FDSyxJQUFLQyxNQUFNQyxPQUFPLENBQUVMLFFBQVU7UUFDakMsT0FBT0osRUFBRVUsTUFBTSxDQUFFTixPQUFPLENBQUVPLGNBQXdCUDtZQUNoRCxPQUFPSixFQUFFWSxJQUFJLENBQUVELGFBQWFFLE1BQU0sQ0FBRVgsWUFBYUMsTUFBTUMsUUFBVVUsSUFBSTtRQUN2RSxHQUFHLEVBQUU7SUFDUCxPQUNLO1FBQ0gsTUFBTUMsZ0JBQWdCQyxLQUFLQyxLQUFLLENBQUVsQixhQUFjLENBQUMsR0FBRyxFQUFFSSxLQUFLLGFBQWEsQ0FBQyxFQUFFO1FBQzNFLElBQUllO1FBQ0osSUFBSTtZQUNGQSxjQUFjRixLQUFLQyxLQUFLLENBQUVsQixhQUFjLHlCQUF5QjtRQUNuRSxFQUNBLE9BQU9vQixHQUFJO1lBQ1RELGNBQWMsQ0FBQztRQUNqQjtRQUVBLDBCQUEwQjtRQUMxQixJQUFJRSxXQUFXTCxpQkFDQUEsY0FBY00sSUFBSSxJQUNsQk4sY0FBY00sSUFBSSxDQUFDRCxRQUFRLEdBQzNCTCxjQUFjTSxJQUFJLENBQUNELFFBQVEsR0FBRyxFQUFFO1FBRS9DLGtDQUFrQztRQUNsQ0EsU0FBU0UsSUFBSSxDQUFFUCxjQUFjUSxJQUFJO1FBRWpDLHdEQUF3RDtRQUN4RDtZQUFFO1lBQVVuQjtTQUFPLENBQUNvQixPQUFPLENBQUVDLENBQUFBO1lBQzNCLElBQUtQLFdBQVcsQ0FBRU8sR0FBSSxJQUFJUCxXQUFXLENBQUVPLEdBQUksQ0FBQ0wsUUFBUSxFQUFHO2dCQUNyREEsV0FBV0EsU0FBU1AsTUFBTSxDQUFFSyxXQUFXLENBQUVPLEdBQUksQ0FBQ0wsUUFBUTtZQUN4RDtRQUNGO1FBRUEsd0RBQXdEO1FBQ3hELElBQUtMLGNBQWNNLElBQUksSUFBSU4sY0FBY00sSUFBSSxDQUFFakIsTUFBTyxJQUFJVyxjQUFjTSxJQUFJLENBQUVqQixNQUFPLENBQUNnQixRQUFRLEVBQUc7WUFDL0ZBLFdBQVdBLFNBQVNQLE1BQU0sQ0FBRUUsY0FBY00sSUFBSSxDQUFFakIsTUFBTyxDQUFDZ0IsUUFBUTtRQUNsRTtRQUVBLDRGQUE0RjtRQUM1RixJQUFLaEIsVUFBVSxhQUFhVyxjQUFjTSxJQUFJLElBQUlOLGNBQWNNLElBQUksQ0FBRWpCLE1BQU8sSUFBSVcsY0FBY00sSUFBSSxDQUFFakIsTUFBTyxDQUFDc0IsUUFBUSxFQUFHO1lBQ3RILE1BQU1DLGVBQWUsQUFBRVosY0FBY00sSUFBSSxDQUFFakIsTUFBTyxDQUFDc0IsUUFBUSxDQUFHRSxNQUFNLENBQUUsQ0FBRUMsVUFBcUIsQ0FBQ0EsUUFBUUMsVUFBVSxDQUFFO1lBQ2xIVixXQUFXQSxTQUFTUCxNQUFNLENBQUVjO1FBQzlCO1FBRUEsNkJBQTZCO1FBQzdCLE9BQU8zQixFQUFFWSxJQUFJLENBQUVRLFNBQVNOLElBQUk7SUFDOUI7QUFDRiJ9