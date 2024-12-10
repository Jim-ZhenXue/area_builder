// Copyright 2020, University of Colorado Boulder
// @author Matt Pennington (PhET Interactive Simulations)
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
const execute = require('../common/execute').default;
const gitCheckoutDirectory = require('../common/gitCheckoutDirectory');
const gitCloneOrFetchDirectory = require('../common/gitCloneOrFetchDirectory');
const gitPullDirectory = require('../common/gitPullDirectory');
const constants = require('./constants');
const fs = require('fs');
const axios = require('axios');
const imagesReposDir = '../images-repos';
const chipperDir = `${imagesReposDir}/chipper`;
const perennialAliasDir = `${imagesReposDir}/perennial-alias`;
const processSim = /*#__PURE__*/ _async_to_generator(function*(simulation, brands, version) {
    const repoDir = `${imagesReposDir}/${simulation}`;
    // Get main
    yield gitCloneOrFetchDirectory(simulation, imagesReposDir);
    yield gitCheckoutDirectory('main', repoDir);
    yield gitPullDirectory(repoDir);
    let brandsArray;
    let brandsString;
    if (brands) {
        if (brands.split) {
            brandsArray = brands.split(',');
            brandsString = brands;
        } else {
            brandsArray = brands;
            brandsString = brands.join(',');
        }
    } else {
        brandsString = 'phet';
        brandsArray = [
            brandsString
        ];
    }
    // Build screenshots
    yield execute('grunt', [
        `--brands=${brandsString}`,
        `--repo=${simulation}`,
        'build-images'
    ], chipperDir);
    // Copy into the document root
    for (const brand of brandsArray){
        if (brand !== 'phet') {
            console.log(`Skipping images for unsupported brand: ${brand}`);
        } else {
            const sourceDir = `${repoDir}/build/${brand}/`;
            const targetDir = `${constants.HTML_SIMS_DIRECTORY}${simulation}/${version}/`;
            const files = fs.readdirSync(sourceDir);
            for (const file of files){
                if (file.endsWith('png')) {
                    console.log(`copying file ${file}`);
                    yield execute('cp', [
                        `${sourceDir}${file}`,
                        `${targetDir}${file}`
                    ], '.');
                }
            }
            console.log(`Done copying files for ${simulation}`);
        }
    }
});
const updateRepoDir = /*#__PURE__*/ _async_to_generator(function*(repo, dir) {
    yield gitCloneOrFetchDirectory(repo, imagesReposDir);
    yield gitCheckoutDirectory('main', dir);
    yield gitPullDirectory(dir);
    yield execute('npm', [
        'prune'
    ], dir);
    yield execute('npm', [
        'update'
    ], dir);
});
/**
 * This task deploys all image assets from the main branch to the latest version of all published sims.
 *
 * @param options
 */ const deployImages = /*#__PURE__*/ _async_to_generator(function*(options) {
    console.log(`deploying images with brands ${options.brands}`);
    if (!fs.existsSync(imagesReposDir)) {
        yield execute('mkdir', [
            imagesReposDir
        ], '.');
    }
    yield updateRepoDir('chipper', chipperDir);
    yield updateRepoDir('perennial-alias', perennialAliasDir);
    if (options.simulation && options.version) {
        yield processSim(options.simulation, options.brands, options.version);
    } else {
        // Get all published sims
        let response;
        try {
            response = yield axios('https://phet.colorado.edu/services/metadata/1.2/simulations?format=json&summary&locale=en&type=html');
        } catch (e) {
            throw new Error(e);
        }
        if (response.status < 200 || response.status > 299) {
            throw new Error(`Bad Status while fetching metadata: ${response.status}`);
        } else {
            let projects;
            try {
                projects = response.data.projects;
            } catch (e) {
                throw new Error(e);
            }
            // Use for index loop to allow async/await
            for (const project of projects){
                for (const simulation of project.simulations){
                    yield processSim(simulation.name, options.brands, project.version.string);
                }
            }
        }
    }
});
module.exports = deployImages;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvZGVwbG95SW1hZ2VzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9leGVjdXRlJyApLmRlZmF1bHQ7XG5jb25zdCBnaXRDaGVja291dERpcmVjdG9yeSA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0Q2hlY2tvdXREaXJlY3RvcnknICk7XG5jb25zdCBnaXRDbG9uZU9yRmV0Y2hEaXJlY3RvcnkgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdENsb25lT3JGZXRjaERpcmVjdG9yeScgKTtcbmNvbnN0IGdpdFB1bGxEaXJlY3RvcnkgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdFB1bGxEaXJlY3RvcnknICk7XG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCAnLi9jb25zdGFudHMnICk7XG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcbmNvbnN0IGF4aW9zID0gcmVxdWlyZSggJ2F4aW9zJyApO1xuXG5jb25zdCBpbWFnZXNSZXBvc0RpciA9ICcuLi9pbWFnZXMtcmVwb3MnO1xuY29uc3QgY2hpcHBlckRpciA9IGAke2ltYWdlc1JlcG9zRGlyfS9jaGlwcGVyYDtcbmNvbnN0IHBlcmVubmlhbEFsaWFzRGlyID0gYCR7aW1hZ2VzUmVwb3NEaXJ9L3BlcmVubmlhbC1hbGlhc2A7XG5cbmNvbnN0IHByb2Nlc3NTaW0gPSBhc3luYyAoIHNpbXVsYXRpb24sIGJyYW5kcywgdmVyc2lvbiApID0+IHtcblxuICBjb25zdCByZXBvRGlyID0gYCR7aW1hZ2VzUmVwb3NEaXJ9LyR7c2ltdWxhdGlvbn1gO1xuXG4gIC8vIEdldCBtYWluXG4gIGF3YWl0IGdpdENsb25lT3JGZXRjaERpcmVjdG9yeSggc2ltdWxhdGlvbiwgaW1hZ2VzUmVwb3NEaXIgKTtcbiAgYXdhaXQgZ2l0Q2hlY2tvdXREaXJlY3RvcnkoICdtYWluJywgcmVwb0RpciApO1xuICBhd2FpdCBnaXRQdWxsRGlyZWN0b3J5KCByZXBvRGlyICk7XG5cbiAgbGV0IGJyYW5kc0FycmF5O1xuICBsZXQgYnJhbmRzU3RyaW5nO1xuICBpZiAoIGJyYW5kcyApIHtcbiAgICBpZiAoIGJyYW5kcy5zcGxpdCApIHtcbiAgICAgIGJyYW5kc0FycmF5ID0gYnJhbmRzLnNwbGl0KCAnLCcgKTtcbiAgICAgIGJyYW5kc1N0cmluZyA9IGJyYW5kcztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBicmFuZHNBcnJheSA9IGJyYW5kcztcbiAgICAgIGJyYW5kc1N0cmluZyA9IGJyYW5kcy5qb2luKCAnLCcgKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgYnJhbmRzU3RyaW5nID0gJ3BoZXQnO1xuICAgIGJyYW5kc0FycmF5ID0gWyBicmFuZHNTdHJpbmcgXTtcbiAgfVxuXG4gIC8vIEJ1aWxkIHNjcmVlbnNob3RzXG4gIGF3YWl0IGV4ZWN1dGUoICdncnVudCcsIFsgYC0tYnJhbmRzPSR7YnJhbmRzU3RyaW5nfWAsIGAtLXJlcG89JHtzaW11bGF0aW9ufWAsICdidWlsZC1pbWFnZXMnIF0sIGNoaXBwZXJEaXIgKTtcblxuICAvLyBDb3B5IGludG8gdGhlIGRvY3VtZW50IHJvb3RcbiAgZm9yICggY29uc3QgYnJhbmQgb2YgYnJhbmRzQXJyYXkgKSB7XG4gICAgaWYgKCBicmFuZCAhPT0gJ3BoZXQnICkge1xuICAgICAgY29uc29sZS5sb2coIGBTa2lwcGluZyBpbWFnZXMgZm9yIHVuc3VwcG9ydGVkIGJyYW5kOiAke2JyYW5kfWAgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBzb3VyY2VEaXIgPSBgJHtyZXBvRGlyfS9idWlsZC8ke2JyYW5kfS9gO1xuICAgICAgY29uc3QgdGFyZ2V0RGlyID0gYCR7Y29uc3RhbnRzLkhUTUxfU0lNU19ESVJFQ1RPUll9JHtzaW11bGF0aW9ufS8ke3ZlcnNpb259L2A7XG4gICAgICBjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKCBzb3VyY2VEaXIgKTtcbiAgICAgIGZvciAoIGNvbnN0IGZpbGUgb2YgZmlsZXMgKSB7XG4gICAgICAgIGlmICggZmlsZS5lbmRzV2l0aCggJ3BuZycgKSApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYGNvcHlpbmcgZmlsZSAke2ZpbGV9YCApO1xuICAgICAgICAgIGF3YWl0IGV4ZWN1dGUoICdjcCcsIFsgYCR7c291cmNlRGlyfSR7ZmlsZX1gLCBgJHt0YXJnZXREaXJ9JHtmaWxlfWAgXSwgJy4nICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coIGBEb25lIGNvcHlpbmcgZmlsZXMgZm9yICR7c2ltdWxhdGlvbn1gICk7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCB1cGRhdGVSZXBvRGlyID0gYXN5bmMgKCByZXBvLCBkaXIgKSA9PiB7XG4gIGF3YWl0IGdpdENsb25lT3JGZXRjaERpcmVjdG9yeSggcmVwbywgaW1hZ2VzUmVwb3NEaXIgKTtcbiAgYXdhaXQgZ2l0Q2hlY2tvdXREaXJlY3RvcnkoICdtYWluJywgZGlyICk7XG4gIGF3YWl0IGdpdFB1bGxEaXJlY3RvcnkoIGRpciApO1xuICBhd2FpdCBleGVjdXRlKCAnbnBtJywgWyAncHJ1bmUnIF0sIGRpciApO1xuICBhd2FpdCBleGVjdXRlKCAnbnBtJywgWyAndXBkYXRlJyBdLCBkaXIgKTtcbn07XG5cbi8qKlxuICogVGhpcyB0YXNrIGRlcGxveXMgYWxsIGltYWdlIGFzc2V0cyBmcm9tIHRoZSBtYWluIGJyYW5jaCB0byB0aGUgbGF0ZXN0IHZlcnNpb24gb2YgYWxsIHB1Ymxpc2hlZCBzaW1zLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zXG4gKi9cbmNvbnN0IGRlcGxveUltYWdlcyA9IGFzeW5jIG9wdGlvbnMgPT4ge1xuICBjb25zb2xlLmxvZyggYGRlcGxveWluZyBpbWFnZXMgd2l0aCBicmFuZHMgJHtvcHRpb25zLmJyYW5kc31gICk7XG4gIGlmICggIWZzLmV4aXN0c1N5bmMoIGltYWdlc1JlcG9zRGlyICkgKSB7XG4gICAgYXdhaXQgZXhlY3V0ZSggJ21rZGlyJywgWyBpbWFnZXNSZXBvc0RpciBdLCAnLicgKTtcbiAgfVxuXG4gIGF3YWl0IHVwZGF0ZVJlcG9EaXIoICdjaGlwcGVyJywgY2hpcHBlckRpciApO1xuICBhd2FpdCB1cGRhdGVSZXBvRGlyKCAncGVyZW5uaWFsLWFsaWFzJywgcGVyZW5uaWFsQWxpYXNEaXIgKTtcblxuICBpZiAoIG9wdGlvbnMuc2ltdWxhdGlvbiAmJiBvcHRpb25zLnZlcnNpb24gKSB7XG4gICAgYXdhaXQgcHJvY2Vzc1NpbSggb3B0aW9ucy5zaW11bGF0aW9uLCBvcHRpb25zLmJyYW5kcywgb3B0aW9ucy52ZXJzaW9uICk7XG4gIH1cbiAgZWxzZSB7XG5cbiAgICAvLyBHZXQgYWxsIHB1Ymxpc2hlZCBzaW1zXG4gICAgbGV0IHJlc3BvbnNlO1xuICAgIHRyeSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IGF4aW9zKCAnaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdS9zZXJ2aWNlcy9tZXRhZGF0YS8xLjIvc2ltdWxhdGlvbnM/Zm9ybWF0PWpzb24mc3VtbWFyeSZsb2NhbGU9ZW4mdHlwZT1odG1sJyApO1xuICAgIH1cbiAgICBjYXRjaCggZSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggZSApO1xuICAgIH1cbiAgICBpZiAoIHJlc3BvbnNlLnN0YXR1cyA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXMgPiAyOTkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBCYWQgU3RhdHVzIHdoaWxlIGZldGNoaW5nIG1ldGFkYXRhOiAke3Jlc3BvbnNlLnN0YXR1c31gICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGV0IHByb2plY3RzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcHJvamVjdHMgPSByZXNwb25zZS5kYXRhLnByb2plY3RzO1xuICAgICAgfVxuICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggZSApO1xuICAgICAgfVxuXG4gICAgICAvLyBVc2UgZm9yIGluZGV4IGxvb3AgdG8gYWxsb3cgYXN5bmMvYXdhaXRcbiAgICAgIGZvciAoIGNvbnN0IHByb2plY3Qgb2YgcHJvamVjdHMgKSB7XG4gICAgICAgIGZvciAoIGNvbnN0IHNpbXVsYXRpb24gb2YgcHJvamVjdC5zaW11bGF0aW9ucyApIHtcbiAgICAgICAgICBhd2FpdCBwcm9jZXNzU2ltKCBzaW11bGF0aW9uLm5hbWUsIG9wdGlvbnMuYnJhbmRzLCBwcm9qZWN0LnZlcnNpb24uc3RyaW5nICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVwbG95SW1hZ2VzOyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJnaXRDaGVja291dERpcmVjdG9yeSIsImdpdENsb25lT3JGZXRjaERpcmVjdG9yeSIsImdpdFB1bGxEaXJlY3RvcnkiLCJjb25zdGFudHMiLCJmcyIsImF4aW9zIiwiaW1hZ2VzUmVwb3NEaXIiLCJjaGlwcGVyRGlyIiwicGVyZW5uaWFsQWxpYXNEaXIiLCJwcm9jZXNzU2ltIiwic2ltdWxhdGlvbiIsImJyYW5kcyIsInZlcnNpb24iLCJyZXBvRGlyIiwiYnJhbmRzQXJyYXkiLCJicmFuZHNTdHJpbmciLCJzcGxpdCIsImpvaW4iLCJicmFuZCIsImNvbnNvbGUiLCJsb2ciLCJzb3VyY2VEaXIiLCJ0YXJnZXREaXIiLCJIVE1MX1NJTVNfRElSRUNUT1JZIiwiZmlsZXMiLCJyZWFkZGlyU3luYyIsImZpbGUiLCJlbmRzV2l0aCIsInVwZGF0ZVJlcG9EaXIiLCJyZXBvIiwiZGlyIiwiZGVwbG95SW1hZ2VzIiwib3B0aW9ucyIsImV4aXN0c1N5bmMiLCJyZXNwb25zZSIsImUiLCJFcnJvciIsInN0YXR1cyIsInByb2plY3RzIiwiZGF0YSIsInByb2plY3QiLCJzaW11bGF0aW9ucyIsIm5hbWUiLCJzdHJpbmciLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQseURBQXlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFekQsTUFBTUEsVUFBVUMsUUFBUyxxQkFBc0JDLE9BQU87QUFDdEQsTUFBTUMsdUJBQXVCRixRQUFTO0FBQ3RDLE1BQU1HLDJCQUEyQkgsUUFBUztBQUMxQyxNQUFNSSxtQkFBbUJKLFFBQVM7QUFDbEMsTUFBTUssWUFBWUwsUUFBUztBQUMzQixNQUFNTSxLQUFLTixRQUFTO0FBQ3BCLE1BQU1PLFFBQVFQLFFBQVM7QUFFdkIsTUFBTVEsaUJBQWlCO0FBQ3ZCLE1BQU1DLGFBQWEsR0FBR0QsZUFBZSxRQUFRLENBQUM7QUFDOUMsTUFBTUUsb0JBQW9CLEdBQUdGLGVBQWUsZ0JBQWdCLENBQUM7QUFFN0QsTUFBTUcsK0NBQWEsVUFBUUMsWUFBWUMsUUFBUUM7SUFFN0MsTUFBTUMsVUFBVSxHQUFHUCxlQUFlLENBQUMsRUFBRUksWUFBWTtJQUVqRCxXQUFXO0lBQ1gsTUFBTVQseUJBQTBCUyxZQUFZSjtJQUM1QyxNQUFNTixxQkFBc0IsUUFBUWE7SUFDcEMsTUFBTVgsaUJBQWtCVztJQUV4QixJQUFJQztJQUNKLElBQUlDO0lBQ0osSUFBS0osUUFBUztRQUNaLElBQUtBLE9BQU9LLEtBQUssRUFBRztZQUNsQkYsY0FBY0gsT0FBT0ssS0FBSyxDQUFFO1lBQzVCRCxlQUFlSjtRQUNqQixPQUNLO1lBQ0hHLGNBQWNIO1lBQ2RJLGVBQWVKLE9BQU9NLElBQUksQ0FBRTtRQUM5QjtJQUNGLE9BQ0s7UUFDSEYsZUFBZTtRQUNmRCxjQUFjO1lBQUVDO1NBQWM7SUFDaEM7SUFFQSxvQkFBb0I7SUFDcEIsTUFBTWxCLFFBQVMsU0FBUztRQUFFLENBQUMsU0FBUyxFQUFFa0IsY0FBYztRQUFFLENBQUMsT0FB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