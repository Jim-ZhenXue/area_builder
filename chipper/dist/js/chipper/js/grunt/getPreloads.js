// Copyright 2017-2024, University of Colorado Boulder
import assert from 'assert';
import { readFileSync } from 'fs';
import _ from 'lodash';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperStringUtils from '../common/ChipperStringUtils.js';
import getPhetLibs from './getPhetLibs.js';
/**
 * Gets preload, the set of scripts to be preloaded in the .html file.
 * NOTE! Order of the return value is significant, since it corresponds to the order in which scripts will be preloaded.
 *
 * @param repo
 * @param brand
 * @param [forSim] - if the preloads are specifically for a simulation
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ export default function getPreloads(repo, brand, forSim) {
    const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
    let buildObject;
    try {
        const buildString = grunt.file.read('../chipper/build.json');
        const filledInBuildString = ChipperStringUtils.replaceAll(buildString, '{{REPO}}', repo);
        buildObject = JSON.parse(filledInBuildString);
    } catch (e) {
        buildObject = {};
    }
    let preload = [];
    // add preloads that are common to all sims, from build.json
    if (buildObject.common && buildObject.common.preload) {
        assert(Array.isArray(buildObject.common.preload), 'preload should be an array');
        preload = preload.concat(buildObject.common.preload);
    }
    // add sim-specific preloads from package.json
    if (packageObject.phet.preload) {
        assert(Array.isArray(packageObject.phet.preload), 'preload should be an array');
        preload = preload.concat(packageObject.phet.preload);
    }
    // add brand-specific preloads from build.json
    if (buildObject[brand] && buildObject[brand].preload) {
        assert(Array.isArray(buildObject[brand].preload), 'preload should be an array');
        preload = preload.concat(buildObject[brand].preload);
    }
    // simulationSpecificPreload are not needed for any other runtimes, like tests
    // No need to support this for package.json, just in chipper for now.
    if (forSim && buildObject[brand] && buildObject[brand].simulationSpecificPreload) {
        preload = preload.concat(buildObject[brand].simulationSpecificPreload);
    }
    // add brand-specific preloads from package.json
    if (packageObject.phet[brand] && packageObject.phet[brand].preload) {
        assert(Array.isArray(packageObject.phet[brand].preload), 'preload should be an array');
        preload = preload.concat(packageObject.phet[brand].preload);
    }
    // remove duplicates (do NOT sort, order is significant!)
    preload = _.uniq(preload);
    // Verifies that preload repositories are included in phetLib.
    const phetLibs = getPhetLibs(repo, brand);
    const missingRepositories = [];
    preload.forEach((entry)=>{
        // preload entries should start with '..', e.g. "../assert/js/assert.js"
        assert(entry.split('/')[0] === '..', `malformed preload entry: ${entry}`);
        // the preload's repository should be in phetLib
        const repositoryName = entry.split('/')[1];
        if (!phetLibs.includes(repositoryName) && !missingRepositories.includes(repositoryName)) {
            missingRepositories.push(repositoryName);
        }
    });
    assert(missingRepositories.length === 0, `phetLib is missing repositories required by preload: ${missingRepositories.toString()}`);
    return preload;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dldFByZWxvYWRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGdydW50IGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ucG0tZGVwZW5kZW5jaWVzL2dydW50LmpzJztcbmltcG9ydCBDaGlwcGVyU3RyaW5nVXRpbHMgZnJvbSAnLi4vY29tbW9uL0NoaXBwZXJTdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgZ2V0UGhldExpYnMgZnJvbSAnLi9nZXRQaGV0TGlicy5qcyc7XG5cbi8qKlxuICogR2V0cyBwcmVsb2FkLCB0aGUgc2V0IG9mIHNjcmlwdHMgdG8gYmUgcHJlbG9hZGVkIGluIHRoZSAuaHRtbCBmaWxlLlxuICogTk9URSEgT3JkZXIgb2YgdGhlIHJldHVybiB2YWx1ZSBpcyBzaWduaWZpY2FudCwgc2luY2UgaXQgY29ycmVzcG9uZHMgdG8gdGhlIG9yZGVyIGluIHdoaWNoIHNjcmlwdHMgd2lsbCBiZSBwcmVsb2FkZWQuXG4gKlxuICogQHBhcmFtIHJlcG9cbiAqIEBwYXJhbSBicmFuZFxuICogQHBhcmFtIFtmb3JTaW1dIC0gaWYgdGhlIHByZWxvYWRzIGFyZSBzcGVjaWZpY2FsbHkgZm9yIGEgc2ltdWxhdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFByZWxvYWRzKCByZXBvOiBzdHJpbmcsIGJyYW5kOiBzdHJpbmcsIGZvclNpbTogYm9vbGVhbiApOiBzdHJpbmdbXSB7XG5cbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIHJlYWRGaWxlU3luYyggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCwgJ3V0ZjgnICkgKTtcbiAgbGV0IGJ1aWxkT2JqZWN0O1xuICB0cnkge1xuICAgIGNvbnN0IGJ1aWxkU3RyaW5nID0gZ3J1bnQuZmlsZS5yZWFkKCAnLi4vY2hpcHBlci9idWlsZC5qc29uJyApO1xuICAgIGNvbnN0IGZpbGxlZEluQnVpbGRTdHJpbmcgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggYnVpbGRTdHJpbmcsICd7e1JFUE99fScsIHJlcG8gKTtcbiAgICBidWlsZE9iamVjdCA9IEpTT04ucGFyc2UoIGZpbGxlZEluQnVpbGRTdHJpbmcgKTtcbiAgfVxuICBjYXRjaCggZSApIHtcbiAgICBidWlsZE9iamVjdCA9IHt9O1xuICB9XG5cbiAgbGV0IHByZWxvYWQ6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gYWRkIHByZWxvYWRzIHRoYXQgYXJlIGNvbW1vbiB0byBhbGwgc2ltcywgZnJvbSBidWlsZC5qc29uXG4gIGlmICggYnVpbGRPYmplY3QuY29tbW9uICYmIGJ1aWxkT2JqZWN0LmNvbW1vbi5wcmVsb2FkICkge1xuICAgIGFzc2VydCggQXJyYXkuaXNBcnJheSggYnVpbGRPYmplY3QuY29tbW9uLnByZWxvYWQgKSwgJ3ByZWxvYWQgc2hvdWxkIGJlIGFuIGFycmF5JyApO1xuICAgIHByZWxvYWQgPSBwcmVsb2FkLmNvbmNhdCggYnVpbGRPYmplY3QuY29tbW9uLnByZWxvYWQgKTtcbiAgfVxuXG4gIC8vIGFkZCBzaW0tc3BlY2lmaWMgcHJlbG9hZHMgZnJvbSBwYWNrYWdlLmpzb25cbiAgaWYgKCBwYWNrYWdlT2JqZWN0LnBoZXQucHJlbG9hZCApIHtcbiAgICBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIHBhY2thZ2VPYmplY3QucGhldC5wcmVsb2FkICksICdwcmVsb2FkIHNob3VsZCBiZSBhbiBhcnJheScgKTtcbiAgICBwcmVsb2FkID0gcHJlbG9hZC5jb25jYXQoIHBhY2thZ2VPYmplY3QucGhldC5wcmVsb2FkICk7XG4gIH1cblxuICAvLyBhZGQgYnJhbmQtc3BlY2lmaWMgcHJlbG9hZHMgZnJvbSBidWlsZC5qc29uXG4gIGlmICggYnVpbGRPYmplY3RbIGJyYW5kIF0gJiYgYnVpbGRPYmplY3RbIGJyYW5kIF0ucHJlbG9hZCApIHtcbiAgICBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGJ1aWxkT2JqZWN0WyBicmFuZCBdLnByZWxvYWQgKSwgJ3ByZWxvYWQgc2hvdWxkIGJlIGFuIGFycmF5JyApO1xuICAgIHByZWxvYWQgPSBwcmVsb2FkLmNvbmNhdCggYnVpbGRPYmplY3RbIGJyYW5kIF0ucHJlbG9hZCApO1xuICB9XG5cbiAgLy8gc2ltdWxhdGlvblNwZWNpZmljUHJlbG9hZCBhcmUgbm90IG5lZWRlZCBmb3IgYW55IG90aGVyIHJ1bnRpbWVzLCBsaWtlIHRlc3RzXG4gIC8vIE5vIG5lZWQgdG8gc3VwcG9ydCB0aGlzIGZvciBwYWNrYWdlLmpzb24sIGp1c3QgaW4gY2hpcHBlciBmb3Igbm93LlxuICBpZiAoIGZvclNpbSAmJiBidWlsZE9iamVjdFsgYnJhbmQgXSAmJiBidWlsZE9iamVjdFsgYnJhbmQgXS5zaW11bGF0aW9uU3BlY2lmaWNQcmVsb2FkICkge1xuICAgIHByZWxvYWQgPSBwcmVsb2FkLmNvbmNhdCggYnVpbGRPYmplY3RbIGJyYW5kIF0uc2ltdWxhdGlvblNwZWNpZmljUHJlbG9hZCApO1xuICB9XG5cbiAgLy8gYWRkIGJyYW5kLXNwZWNpZmljIHByZWxvYWRzIGZyb20gcGFja2FnZS5qc29uXG4gIGlmICggcGFja2FnZU9iamVjdC5waGV0WyBicmFuZCBdICYmIHBhY2thZ2VPYmplY3QucGhldFsgYnJhbmQgXS5wcmVsb2FkICkge1xuICAgIGFzc2VydCggQXJyYXkuaXNBcnJheSggcGFja2FnZU9iamVjdC5waGV0WyBicmFuZCBdLnByZWxvYWQgKSwgJ3ByZWxvYWQgc2hvdWxkIGJlIGFuIGFycmF5JyApO1xuICAgIHByZWxvYWQgPSBwcmVsb2FkLmNvbmNhdCggcGFja2FnZU9iamVjdC5waGV0WyBicmFuZCBdLnByZWxvYWQgKTtcbiAgfVxuXG4gIC8vIHJlbW92ZSBkdXBsaWNhdGVzIChkbyBOT1Qgc29ydCwgb3JkZXIgaXMgc2lnbmlmaWNhbnQhKVxuICBwcmVsb2FkID0gXy51bmlxKCBwcmVsb2FkICk7XG5cbiAgLy8gVmVyaWZpZXMgdGhhdCBwcmVsb2FkIHJlcG9zaXRvcmllcyBhcmUgaW5jbHVkZWQgaW4gcGhldExpYi5cbiAgY29uc3QgcGhldExpYnMgPSBnZXRQaGV0TGlicyggcmVwbywgYnJhbmQgKTtcbiAgY29uc3QgbWlzc2luZ1JlcG9zaXRvcmllczogc3RyaW5nW10gPSBbXTtcbiAgcHJlbG9hZC5mb3JFYWNoKCBlbnRyeSA9PiB7XG5cbiAgICAvLyBwcmVsb2FkIGVudHJpZXMgc2hvdWxkIHN0YXJ0IHdpdGggJy4uJywgZS5nLiBcIi4uL2Fzc2VydC9qcy9hc3NlcnQuanNcIlxuICAgIGFzc2VydCggZW50cnkuc3BsaXQoICcvJyApWyAwIF0gPT09ICcuLicsIGBtYWxmb3JtZWQgcHJlbG9hZCBlbnRyeTogJHtlbnRyeX1gICk7XG5cbiAgICAvLyB0aGUgcHJlbG9hZCdzIHJlcG9zaXRvcnkgc2hvdWxkIGJlIGluIHBoZXRMaWJcbiAgICBjb25zdCByZXBvc2l0b3J5TmFtZSA9IGVudHJ5LnNwbGl0KCAnLycgKVsgMSBdO1xuICAgIGlmICggIXBoZXRMaWJzLmluY2x1ZGVzKCByZXBvc2l0b3J5TmFtZSApICYmICFtaXNzaW5nUmVwb3NpdG9yaWVzLmluY2x1ZGVzKCByZXBvc2l0b3J5TmFtZSApICkge1xuICAgICAgbWlzc2luZ1JlcG9zaXRvcmllcy5wdXNoKCByZXBvc2l0b3J5TmFtZSApO1xuICAgIH1cbiAgfSApO1xuICBhc3NlcnQoIG1pc3NpbmdSZXBvc2l0b3JpZXMubGVuZ3RoID09PSAwLFxuICAgIGBwaGV0TGliIGlzIG1pc3NpbmcgcmVwb3NpdG9yaWVzIHJlcXVpcmVkIGJ5IHByZWxvYWQ6ICR7bWlzc2luZ1JlcG9zaXRvcmllcy50b1N0cmluZygpfWAgKTtcblxuICByZXR1cm4gcHJlbG9hZDtcbn0iXSwibmFtZXMiOlsiYXNzZXJ0IiwicmVhZEZpbGVTeW5jIiwiXyIsImdydW50IiwiQ2hpcHBlclN0cmluZ1V0aWxzIiwiZ2V0UGhldExpYnMiLCJnZXRQcmVsb2FkcyIsInJlcG8iLCJicmFuZCIsImZvclNpbSIsInBhY2thZ2VPYmplY3QiLCJKU09OIiwicGFyc2UiLCJidWlsZE9iamVjdCIsImJ1aWxkU3RyaW5nIiwiZmlsZSIsInJlYWQiLCJmaWxsZWRJbkJ1aWxkU3RyaW5nIiwicmVwbGFjZUFsbCIsImUiLCJwcmVsb2FkIiwiY29tbW9uIiwiQXJyYXkiLCJpc0FycmF5IiwiY29uY2F0IiwicGhldCIsInNpbXVsYXRpb25TcGVjaWZpY1ByZWxvYWQiLCJ1bmlxIiwicGhldExpYnMiLCJtaXNzaW5nUmVwb3NpdG9yaWVzIiwiZm9yRWFjaCIsImVudHJ5Iiwic3BsaXQiLCJyZXBvc2l0b3J5TmFtZSIsImluY2x1ZGVzIiwicHVzaCIsImxlbmd0aCIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLFNBQVNDLFlBQVksUUFBUSxLQUFLO0FBQ2xDLE9BQU9DLE9BQU8sU0FBUztBQUN2QixPQUFPQyxXQUFXLHdEQUF3RDtBQUMxRSxPQUFPQyx3QkFBd0Isa0NBQWtDO0FBQ2pFLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFFM0M7Ozs7Ozs7Ozs7Q0FVQyxHQUNELGVBQWUsU0FBU0MsWUFBYUMsSUFBWSxFQUFFQyxLQUFhLEVBQUVDLE1BQWU7SUFFL0UsTUFBTUMsZ0JBQWdCQyxLQUFLQyxLQUFLLENBQUVYLGFBQWMsQ0FBQyxHQUFHLEVBQUVNLEtBQUssYUFBYSxDQUFDLEVBQUU7SUFDM0UsSUFBSU07SUFDSixJQUFJO1FBQ0YsTUFBTUMsY0FBY1gs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