// Copyright 2017-2019, University of Colorado Boulder
/**
 * Deploys a dev version after incrementing the test version number.
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
const SimVersion = require('../browser-and-node/SimVersion').default;
const booleanPrompt = require('../common/booleanPrompt');
const build = require('../common/build');
const buildLocal = require('../common/buildLocal');
const devDirectoryExists = require('../common/devDirectoryExists');
const devScp = require('../common/devScp');
const devSsh = require('../common/devSsh');
const getBranch = require('../common/getBranch');
const getRemoteBranchSHAs = require('../common/getRemoteBranchSHAs');
const getRepoVersion = require('../common/getRepoVersion');
const gitIsClean = require('../common/gitIsClean');
const getDependencyRepos = require('../common/getDependencyRepos');
const gitPush = require('../common/gitPush');
const gitRevParse = require('../common/gitRevParse');
const lintAllRunnable = require('../common/lintAllRunnable');
const npmUpdate = require('../common/npmUpdate');
const setRepoVersion = require('../common/setRepoVersion');
const updateDependenciesJSON = require('../common/updateDependenciesJSON');
const updateHTMLVersion = require('../common/updateHTMLVersion');
const vpnCheck = require('../common/vpnCheck');
const writePhetioHtaccess = require('../common/writePhetioHtaccess');
const assert = require('assert');
const grunt = require('grunt');
const { readFileSync } = require('fs');
/**
 * Deploys a dev version after incrementing the test version number.
 * @public
 *
 * @param {string} repo
 * @param {Array.<string>} brands
 * @param {boolean} noninteractive
 * @param {string} branch - 'main' for normal dev deploys, otherwise is the name of a one-off branch
 * @param {string} [message] - Optional message to append to the version-increment commit.
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, brands, noninteractive, branch, message) {
    const isOneOff = branch !== 'main';
    const testType = isOneOff ? branch : 'dev';
    if (isOneOff) {
        assert(!branch.includes('-'), 'One-off versions should be from branches that do not include hyphens');
    }
    if (!(yield vpnCheck())) {
        grunt.fail.fatal('VPN or being on campus is required for this build. Ensure VPN is enabled, or that you have access to phet-server2.int.colorado.edu');
    }
    const currentBranch = yield getBranch(repo);
    if (currentBranch !== branch) {
        grunt.fail.fatal(`${testType} deployment should be on the branch ${branch}, not: ${currentBranch ? currentBranch : '(detached head)'}`);
    }
    const previousVersion = yield getRepoVersion(repo);
    if (previousVersion.testType !== testType) {
        if (isOneOff) {
            grunt.fail.fatal(`The current version identifier is not a one-off version (should be something like ${previousVersion.major}.${previousVersion.minor}.${previousVersion.maintenance}-${testType}.${previousVersion.testNumber === null ? '0' : previousVersion.testNumber}), aborting.`);
        } else {
            grunt.fail.fatal('The current version identifier is not a dev version, aborting.');
        }
    }
    const dependencies = yield getDependencyRepos(repo);
    for(let i = 0; i < dependencies.length; i++){
        const dependency = dependencies[i];
        const isClean = yield gitIsClean(dependency);
        if (!isClean) {
            throw new Error(`Unclean status in ${dependency}, cannot deploy`);
        }
    }
    const currentSHA = yield gitRevParse(repo, 'HEAD');
    const latestSHA = (yield getRemoteBranchSHAs(repo))[branch];
    if (currentSHA !== latestSHA) {
        // See https://github.com/phetsims/chipper/issues/699
        grunt.fail.fatal(`Out of date with remote, please push or pull repo. Current SHA: ${currentSHA}, latest SHA: ${latestSHA}`);
    }
    // Ensure we don't try to request an unsupported brand
    const supportedBrands = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8')).phet.supportedBrands || [];
    brands.forEach((brand)=>assert(supportedBrands.includes(brand), `Brand ${brand} not included in ${repo}'s supported brands: ${supportedBrands.join(',')}`));
    // Ensure that the repository and its dependencies pass lint before continuing.
    // See https://github.com/phetsims/perennial/issues/76
    yield lintAllRunnable(repo);
    // Bump the version
    const version = new SimVersion(previousVersion.major, previousVersion.minor, previousVersion.maintenance, {
        testType: testType,
        testNumber: previousVersion.testNumber + 1
    });
    const versionString = version.toString();
    const simPath = buildLocal.devDeployPath + repo;
    const versionPath = `${simPath}/${versionString}`;
    const simPathExists = yield devDirectoryExists(simPath);
    const versionPathExists = yield devDirectoryExists(versionPath);
    if (versionPathExists) {
        grunt.fail.fatal(`Directory ${versionPath} already exists.  If you intend to replace the content then remove the directory manually from ${buildLocal.devDeployServer}.`);
    }
    if (!(yield booleanPrompt(`Deploy ${versionString} to ${buildLocal.devDeployServer}`, noninteractive))) {
        grunt.fail.fatal(`Aborted ${testType} deploy`);
    }
    // Make sure our correct npm dependencies are set
    yield npmUpdate(repo);
    yield npmUpdate('chipper');
    yield npmUpdate('perennial-alias');
    yield setRepoVersion(repo, version, message);
    yield updateHTMLVersion(repo);
    yield gitPush(repo, branch);
    grunt.log.writeln((yield build(repo, {
        brands: brands,
        allHTML: true,
        debugHTML: true
    })));
    // Create (and fix permissions for) the main simulation directory, if it didn't already exist
    if (!simPathExists) {
        yield devSsh(`mkdir -p "${simPath}" && echo "IndexOrderDefault Descending Date\n" > "${simPath}/.htaccess"`);
    }
    // Create the version-specific directory
    yield devSsh(`mkdir -p "${versionPath}"`);
    // Copy the build contents into the version-specific directory
    for (const brand of brands){
        yield devScp(`../${repo}/build/${brand}`, `${versionPath}/`);
    }
    // If there is a protected directory and we are copying to the dev server, include the .htaccess file
    // This is for PhET-iO simulations, to protected the password protected wrappers, see
    // https://github.com/phetsims/phet-io/issues/641
    if (brands.includes('phet-io') && buildLocal.devDeployServer === 'bayes.colorado.edu') {
        const htaccessLocation = `../${repo}/build/phet-io`;
        yield writePhetioHtaccess(htaccessLocation, null, versionPath);
    }
    // Move over dependencies.json and commit/push
    yield updateDependenciesJSON(repo, brands, versionString, branch);
    const versionURL = `https://phet-dev.colorado.edu/html/${repo}/${versionString}`;
    if (brands.includes('phet')) {
        grunt.log.writeln(`Deployed: ${versionURL}/phet/${repo}_all_phet.html`);
    }
    if (brands.includes('phet-io')) {
        grunt.log.writeln(`Deployed: ${versionURL}/phet-io/`);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9kZXYuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAxOSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVwbG95cyBhIGRldiB2ZXJzaW9uIGFmdGVyIGluY3JlbWVudGluZyB0aGUgdGVzdCB2ZXJzaW9uIG51bWJlci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgU2ltVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9icm93c2VyLWFuZC1ub2RlL1NpbVZlcnNpb24nICkuZGVmYXVsdDtcbmNvbnN0IGJvb2xlYW5Qcm9tcHQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2Jvb2xlYW5Qcm9tcHQnICk7XG5jb25zdCBidWlsZCA9IHJlcXVpcmUoICcuLi9jb21tb24vYnVpbGQnICk7XG5jb25zdCBidWlsZExvY2FsID0gcmVxdWlyZSggJy4uL2NvbW1vbi9idWlsZExvY2FsJyApO1xuY29uc3QgZGV2RGlyZWN0b3J5RXhpc3RzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9kZXZEaXJlY3RvcnlFeGlzdHMnICk7XG5jb25zdCBkZXZTY3AgPSByZXF1aXJlKCAnLi4vY29tbW9uL2RldlNjcCcgKTtcbmNvbnN0IGRldlNzaCA9IHJlcXVpcmUoICcuLi9jb21tb24vZGV2U3NoJyApO1xuY29uc3QgZ2V0QnJhbmNoID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRCcmFuY2gnICk7XG5jb25zdCBnZXRSZW1vdGVCcmFuY2hTSEFzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRSZW1vdGVCcmFuY2hTSEFzJyApO1xuY29uc3QgZ2V0UmVwb1ZlcnNpb24gPSByZXF1aXJlKCAnLi4vY29tbW9uL2dldFJlcG9WZXJzaW9uJyApO1xuY29uc3QgZ2l0SXNDbGVhbiA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0SXNDbGVhbicgKTtcbmNvbnN0IGdldERlcGVuZGVuY3lSZXBvcyA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2V0RGVwZW5kZW5jeVJlcG9zJyApO1xuY29uc3QgZ2l0UHVzaCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0UHVzaCcgKTtcbmNvbnN0IGdpdFJldlBhcnNlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRSZXZQYXJzZScgKTtcbmNvbnN0IGxpbnRBbGxSdW5uYWJsZSA9IHJlcXVpcmUoICcuLi9jb21tb24vbGludEFsbFJ1bm5hYmxlJyApO1xuY29uc3QgbnBtVXBkYXRlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9ucG1VcGRhdGUnICk7XG5jb25zdCBzZXRSZXBvVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9jb21tb24vc2V0UmVwb1ZlcnNpb24nICk7XG5jb25zdCB1cGRhdGVEZXBlbmRlbmNpZXNKU09OID0gcmVxdWlyZSggJy4uL2NvbW1vbi91cGRhdGVEZXBlbmRlbmNpZXNKU09OJyApO1xuY29uc3QgdXBkYXRlSFRNTFZlcnNpb24gPSByZXF1aXJlKCAnLi4vY29tbW9uL3VwZGF0ZUhUTUxWZXJzaW9uJyApO1xuY29uc3QgdnBuQ2hlY2sgPSByZXF1aXJlKCAnLi4vY29tbW9uL3ZwbkNoZWNrJyApO1xuY29uc3Qgd3JpdGVQaGV0aW9IdGFjY2VzcyA9IHJlcXVpcmUoICcuLi9jb21tb24vd3JpdGVQaGV0aW9IdGFjY2VzcycgKTtcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XG5jb25zdCBncnVudCA9IHJlcXVpcmUoICdncnVudCcgKTtcbmNvbnN0IHsgcmVhZEZpbGVTeW5jIH0gPSByZXF1aXJlKCAnZnMnICk7XG5cbi8qKlxuICogRGVwbG95cyBhIGRldiB2ZXJzaW9uIGFmdGVyIGluY3JlbWVudGluZyB0aGUgdGVzdCB2ZXJzaW9uIG51bWJlci5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gYnJhbmRzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG5vbmludGVyYWN0aXZlXG4gKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoIC0gJ21haW4nIGZvciBub3JtYWwgZGV2IGRlcGxveXMsIG90aGVyd2lzZSBpcyB0aGUgbmFtZSBvZiBhIG9uZS1vZmYgYnJhbmNoXG4gKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gT3B0aW9uYWwgbWVzc2FnZSB0byBhcHBlbmQgdG8gdGhlIHZlcnNpb24taW5jcmVtZW50IGNvbW1pdC5cbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCBicmFuZHMsIG5vbmludGVyYWN0aXZlLCBicmFuY2gsIG1lc3NhZ2UgKSB7XG4gIGNvbnN0IGlzT25lT2ZmID0gYnJhbmNoICE9PSAnbWFpbic7XG4gIGNvbnN0IHRlc3RUeXBlID0gaXNPbmVPZmYgPyBicmFuY2ggOiAnZGV2JztcbiAgaWYgKCBpc09uZU9mZiApIHtcbiAgICBhc3NlcnQoICFicmFuY2guaW5jbHVkZXMoICctJyApLCAnT25lLW9mZiB2ZXJzaW9ucyBzaG91bGQgYmUgZnJvbSBicmFuY2hlcyB0aGF0IGRvIG5vdCBpbmNsdWRlIGh5cGhlbnMnICk7XG4gIH1cblxuICBpZiAoICEoIGF3YWl0IHZwbkNoZWNrKCkgKSApIHtcbiAgICBncnVudC5mYWlsLmZhdGFsKCAnVlBOIG9yIGJlaW5nIG9uIGNhbXB1cyBpcyByZXF1aXJlZCBmb3IgdGhpcyBidWlsZC4gRW5zdXJlIFZQTiBpcyBlbmFibGVkLCBvciB0aGF0IHlvdSBoYXZlIGFjY2VzcyB0byBwaGV0LXNlcnZlcjIuaW50LmNvbG9yYWRvLmVkdScgKTtcbiAgfVxuXG4gIGNvbnN0IGN1cnJlbnRCcmFuY2ggPSBhd2FpdCBnZXRCcmFuY2goIHJlcG8gKTtcbiAgaWYgKCBjdXJyZW50QnJhbmNoICE9PSBicmFuY2ggKSB7XG4gICAgZ3J1bnQuZmFpbC5mYXRhbCggYCR7dGVzdFR5cGV9IGRlcGxveW1lbnQgc2hvdWxkIGJlIG9uIHRoZSBicmFuY2ggJHticmFuY2h9LCBub3Q6ICR7Y3VycmVudEJyYW5jaCA/IGN1cnJlbnRCcmFuY2ggOiAnKGRldGFjaGVkIGhlYWQpJ31gICk7XG4gIH1cblxuICBjb25zdCBwcmV2aW91c1ZlcnNpb24gPSBhd2FpdCBnZXRSZXBvVmVyc2lvbiggcmVwbyApO1xuXG4gIGlmICggcHJldmlvdXNWZXJzaW9uLnRlc3RUeXBlICE9PSB0ZXN0VHlwZSApIHtcbiAgICBpZiAoIGlzT25lT2ZmICkge1xuICAgICAgZ3J1bnQuZmFpbC5mYXRhbCggYFRoZSBjdXJyZW50IHZlcnNpb24gaWRlbnRpZmllciBpcyBub3QgYSBvbmUtb2ZmIHZlcnNpb24gKHNob3VsZCBiZSBzb21ldGhpbmcgbGlrZSAke3ByZXZpb3VzVmVyc2lvbi5tYWpvcn0uJHtwcmV2aW91c1ZlcnNpb24ubWlub3J9LiR7cHJldmlvdXNWZXJzaW9uLm1haW50ZW5hbmNlfS0ke3Rlc3RUeXBlfS4ke3ByZXZpb3VzVmVyc2lvbi50ZXN0TnVtYmVyID09PSBudWxsID8gJzAnIDogcHJldmlvdXNWZXJzaW9uLnRlc3ROdW1iZXJ9KSwgYWJvcnRpbmcuYCApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGdydW50LmZhaWwuZmF0YWwoICdUaGUgY3VycmVudCB2ZXJzaW9uIGlkZW50aWZpZXIgaXMgbm90IGEgZGV2IHZlcnNpb24sIGFib3J0aW5nLicgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXREZXBlbmRlbmN5UmVwb3MoIHJlcG8gKTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrICkge1xuICAgIGNvbnN0IGRlcGVuZGVuY3kgPSBkZXBlbmRlbmNpZXNbIGkgXTtcbiAgICBjb25zdCBpc0NsZWFuID0gYXdhaXQgZ2l0SXNDbGVhbiggZGVwZW5kZW5jeSApO1xuICAgIGlmICggIWlzQ2xlYW4gKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmNsZWFuIHN0YXR1cyBpbiAke2RlcGVuZGVuY3l9LCBjYW5ub3QgZGVwbG95YCApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGN1cnJlbnRTSEEgPSBhd2FpdCBnaXRSZXZQYXJzZSggcmVwbywgJ0hFQUQnICk7XG4gIGNvbnN0IGxhdGVzdFNIQSA9ICggYXdhaXQgZ2V0UmVtb3RlQnJhbmNoU0hBcyggcmVwbyApIClbIGJyYW5jaCBdO1xuICBpZiAoIGN1cnJlbnRTSEEgIT09IGxhdGVzdFNIQSApIHtcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzY5OVxuICAgIGdydW50LmZhaWwuZmF0YWwoIGBPdXQgb2YgZGF0ZSB3aXRoIHJlbW90ZSwgcGxlYXNlIHB1c2ggb3IgcHVsbCByZXBvLiBDdXJyZW50IFNIQTogJHtjdXJyZW50U0hBfSwgbGF0ZXN0IFNIQTogJHtsYXRlc3RTSEF9YCApO1xuICB9XG5cbiAgLy8gRW5zdXJlIHdlIGRvbid0IHRyeSB0byByZXF1ZXN0IGFuIHVuc3VwcG9ydGVkIGJyYW5kXG4gIGNvbnN0IHN1cHBvcnRlZEJyYW5kcyA9IEpTT04ucGFyc2UoIHJlYWRGaWxlU3luYyggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCwgJ3V0ZjgnICkgKS5waGV0LnN1cHBvcnRlZEJyYW5kcyB8fCBbXTtcbiAgYnJhbmRzLmZvckVhY2goIGJyYW5kID0+IGFzc2VydCggc3VwcG9ydGVkQnJhbmRzLmluY2x1ZGVzKCBicmFuZCApLCBgQnJhbmQgJHticmFuZH0gbm90IGluY2x1ZGVkIGluICR7cmVwb30ncyBzdXBwb3J0ZWQgYnJhbmRzOiAke3N1cHBvcnRlZEJyYW5kcy5qb2luKCAnLCcgKX1gICkgKTtcblxuICAvLyBFbnN1cmUgdGhhdCB0aGUgcmVwb3NpdG9yeSBhbmQgaXRzIGRlcGVuZGVuY2llcyBwYXNzIGxpbnQgYmVmb3JlIGNvbnRpbnVpbmcuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVyZW5uaWFsL2lzc3Vlcy83NlxuICBhd2FpdCBsaW50QWxsUnVubmFibGUoIHJlcG8gKTtcblxuICAvLyBCdW1wIHRoZSB2ZXJzaW9uXG4gIGNvbnN0IHZlcnNpb24gPSBuZXcgU2ltVmVyc2lvbiggcHJldmlvdXNWZXJzaW9uLm1ham9yLCBwcmV2aW91c1ZlcnNpb24ubWlub3IsIHByZXZpb3VzVmVyc2lvbi5tYWludGVuYW5jZSwge1xuICAgIHRlc3RUeXBlOiB0ZXN0VHlwZSxcbiAgICB0ZXN0TnVtYmVyOiBwcmV2aW91c1ZlcnNpb24udGVzdE51bWJlciArIDFcbiAgfSApO1xuXG4gIGNvbnN0IHZlcnNpb25TdHJpbmcgPSB2ZXJzaW9uLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHNpbVBhdGggPSBidWlsZExvY2FsLmRldkRlcGxveVBhdGggKyByZXBvO1xuICBjb25zdCB2ZXJzaW9uUGF0aCA9IGAke3NpbVBhdGh9LyR7dmVyc2lvblN0cmluZ31gO1xuXG4gIGNvbnN0IHNpbVBhdGhFeGlzdHMgPSBhd2FpdCBkZXZEaXJlY3RvcnlFeGlzdHMoIHNpbVBhdGggKTtcbiAgY29uc3QgdmVyc2lvblBhdGhFeGlzdHMgPSBhd2FpdCBkZXZEaXJlY3RvcnlFeGlzdHMoIHZlcnNpb25QYXRoICk7XG5cbiAgaWYgKCB2ZXJzaW9uUGF0aEV4aXN0cyApIHtcbiAgICBncnVudC5mYWlsLmZhdGFsKCBgRGlyZWN0b3J5ICR7dmVyc2lvblBhdGh9IGFscmVhZHkgZXhpc3RzLiAgSWYgeW91IGludGVuZCB0byByZXBsYWNlIHRoZSBjb250ZW50IHRoZW4gcmVtb3ZlIHRoZSBkaXJlY3RvcnkgbWFudWFsbHkgZnJvbSAke2J1aWxkTG9jYWwuZGV2RGVwbG95U2VydmVyfS5gICk7XG4gIH1cblxuICBpZiAoICFhd2FpdCBib29sZWFuUHJvbXB0KCBgRGVwbG95ICR7dmVyc2lvblN0cmluZ30gdG8gJHtidWlsZExvY2FsLmRldkRlcGxveVNlcnZlcn1gLCBub25pbnRlcmFjdGl2ZSApICkge1xuICAgIGdydW50LmZhaWwuZmF0YWwoIGBBYm9ydGVkICR7dGVzdFR5cGV9IGRlcGxveWAgKTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSBvdXIgY29ycmVjdCBucG0gZGVwZW5kZW5jaWVzIGFyZSBzZXRcbiAgYXdhaXQgbnBtVXBkYXRlKCByZXBvICk7XG4gIGF3YWl0IG5wbVVwZGF0ZSggJ2NoaXBwZXInICk7XG4gIGF3YWl0IG5wbVVwZGF0ZSggJ3BlcmVubmlhbC1hbGlhcycgKTtcblxuICBhd2FpdCBzZXRSZXBvVmVyc2lvbiggcmVwbywgdmVyc2lvbiwgbWVzc2FnZSApO1xuICBhd2FpdCB1cGRhdGVIVE1MVmVyc2lvbiggcmVwbyApO1xuICBhd2FpdCBnaXRQdXNoKCByZXBvLCBicmFuY2ggKTtcblxuICBncnVudC5sb2cud3JpdGVsbiggYXdhaXQgYnVpbGQoIHJlcG8sIHtcbiAgICBicmFuZHM6IGJyYW5kcyxcbiAgICBhbGxIVE1MOiB0cnVlLFxuICAgIGRlYnVnSFRNTDogdHJ1ZVxuICB9ICkgKTtcblxuICAvLyBDcmVhdGUgKGFuZCBmaXggcGVybWlzc2lvbnMgZm9yKSB0aGUgbWFpbiBzaW11bGF0aW9uIGRpcmVjdG9yeSwgaWYgaXQgZGlkbid0IGFscmVhZHkgZXhpc3RcbiAgaWYgKCAhc2ltUGF0aEV4aXN0cyApIHtcbiAgICBhd2FpdCBkZXZTc2goIGBta2RpciAtcCBcIiR7c2ltUGF0aH1cIiAmJiBlY2hvIFwiSW5kZXhPcmRlckRlZmF1bHQgRGVzY2VuZGluZyBEYXRlXFxuXCIgPiBcIiR7c2ltUGF0aH0vLmh0YWNjZXNzXCJgICk7XG4gIH1cblxuICAvLyBDcmVhdGUgdGhlIHZlcnNpb24tc3BlY2lmaWMgZGlyZWN0b3J5XG4gIGF3YWl0IGRldlNzaCggYG1rZGlyIC1wIFwiJHt2ZXJzaW9uUGF0aH1cImAgKTtcblxuICAvLyBDb3B5IHRoZSBidWlsZCBjb250ZW50cyBpbnRvIHRoZSB2ZXJzaW9uLXNwZWNpZmljIGRpcmVjdG9yeVxuICBmb3IgKCBjb25zdCBicmFuZCBvZiBicmFuZHMgKSB7XG4gICAgYXdhaXQgZGV2U2NwKCBgLi4vJHtyZXBvfS9idWlsZC8ke2JyYW5kfWAsIGAke3ZlcnNpb25QYXRofS9gICk7XG4gIH1cblxuICAvLyBJZiB0aGVyZSBpcyBhIHByb3RlY3RlZCBkaXJlY3RvcnkgYW5kIHdlIGFyZSBjb3B5aW5nIHRvIHRoZSBkZXYgc2VydmVyLCBpbmNsdWRlIHRoZSAuaHRhY2Nlc3MgZmlsZVxuICAvLyBUaGlzIGlzIGZvciBQaEVULWlPIHNpbXVsYXRpb25zLCB0byBwcm90ZWN0ZWQgdGhlIHBhc3N3b3JkIHByb3RlY3RlZCB3cmFwcGVycywgc2VlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy82NDFcbiAgaWYgKCBicmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApICYmIGJ1aWxkTG9jYWwuZGV2RGVwbG95U2VydmVyID09PSAnYmF5ZXMuY29sb3JhZG8uZWR1JyApIHtcbiAgICBjb25zdCBodGFjY2Vzc0xvY2F0aW9uID0gYC4uLyR7cmVwb30vYnVpbGQvcGhldC1pb2A7XG4gICAgYXdhaXQgd3JpdGVQaGV0aW9IdGFjY2VzcyggaHRhY2Nlc3NMb2NhdGlvbiwgbnVsbCwgdmVyc2lvblBhdGggKTtcbiAgfVxuXG4gIC8vIE1vdmUgb3ZlciBkZXBlbmRlbmNpZXMuanNvbiBhbmQgY29tbWl0L3B1c2hcbiAgYXdhaXQgdXBkYXRlRGVwZW5kZW5jaWVzSlNPTiggcmVwbywgYnJhbmRzLCB2ZXJzaW9uU3RyaW5nLCBicmFuY2ggKTtcblxuICBjb25zdCB2ZXJzaW9uVVJMID0gYGh0dHBzOi8vcGhldC1kZXYuY29sb3JhZG8uZWR1L2h0bWwvJHtyZXBvfS8ke3ZlcnNpb25TdHJpbmd9YDtcblxuICBpZiAoIGJyYW5kcy5pbmNsdWRlcyggJ3BoZXQnICkgKSB7XG4gICAgZ3J1bnQubG9nLndyaXRlbG4oIGBEZXBsb3llZDogJHt2ZXJzaW9uVVJMfS9waGV0LyR7cmVwb31fYWxsX3BoZXQuaHRtbGAgKTtcbiAgfVxuICBpZiAoIGJyYW5kcy5pbmNsdWRlcyggJ3BoZXQtaW8nICkgKSB7XG4gICAgZ3J1bnQubG9nLndyaXRlbG4oIGBEZXBsb3llZDogJHt2ZXJzaW9uVVJMfS9waGV0LWlvL2AgKTtcbiAgfVxufTsiXSwibmFtZXMiOlsiU2ltVmVyc2lvbiIsInJlcXVpcmUiLCJkZWZhdWx0IiwiYm9vbGVhblByb21wdCIsImJ1aWxkIiwiYnVpbGRMb2NhbCIsImRldkRpcmVjdG9yeUV4aXN0cyIsImRldlNjcCIsImRldlNzaCIsImdldEJyYW5jaCIsImdldFJlbW90ZUJyYW5jaFNIQXMiLCJnZXRSZXBvVmVyc2lvbiIsImdpdElzQ2xlYW4iLCJnZXREZXBlbmRlbmN5UmVwb3MiLCJnaXRQdXNoIiwiZ2l0UmV2UGFyc2UiLCJsaW50QWxsUnVubmFibGUiLCJucG1VcGRhdGUiLCJzZXRSZXBvVmVyc2lvbiIsInVwZGF0ZURlcGVuZGVuY2llc0pTT04iLCJ1cGRhdGVIVE1MVmVyc2lvbiIsInZwbkNoZWNrIiwid3JpdGVQaGV0aW9IdGFjY2VzcyIsImFzc2VydCIsImdydW50IiwicmVhZEZpbGVTeW5jIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJicmFuZHMiLCJub25pbnRlcmFjdGl2ZSIsImJyYW5jaCIsIm1lc3NhZ2UiLCJpc09uZU9mZiIsInRlc3RUeXBlIiwiaW5jbHVkZXMiLCJmYWlsIiwiZmF0YWwiLCJjdXJyZW50QnJhbmNoIiwicHJldmlvdXNWZXJzaW9uIiwibWFqb3IiLCJtaW5vciIsIm1haW50ZW5hbmNlIiwidGVzdE51bWJlciIsImRlcGVuZGVuY2llcyIsImkiLCJsZW5ndGgiLCJkZXBlbmRlbmN5IiwiaXNDbGVhbiIsIkVycm9yIiwiY3VycmVudFNIQSIsImxhdGVzdFNIQSIsInN1cHBvcnRlZEJyYW5kcyIsIkpTT04iLCJwYXJzZSIsInBoZXQiLCJmb3JFYWNoIiwiYnJhbmQiLCJqb2luIiwidmVyc2lvbiIsInZlcnNpb25TdHJpbmciLCJ0b1N0cmluZyIsInNpbVBhdGgiLCJkZXZEZXBsb3lQYXRoIiwidmVyc2lvblBhdGgiLCJzaW1QYXRoRXhpc3RzIiwidmVyc2lvblBhdGhFeGlzdHMiLCJkZXZEZXBsb3lTZXJ2ZXIiLCJsb2ciLCJ3cml0ZWxuIiwiYWxsSFRNTCIsImRlYnVnSFRNTCIsImh0YWNjZXNzTG9jYXRpb24iLCJ2ZXJzaW9uVVJMIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxhQUFhQyxRQUFTLGtDQUFtQ0MsT0FBTztBQUN0RSxNQUFNQyxnQkFBZ0JGLFFBQVM7QUFDL0IsTUFBTUcsUUFBUUgsUUFBUztBQUN2QixNQUFNSSxhQUFhSixRQUFTO0FBQzVCLE1BQU1LLHFCQUFxQkwsUUFBUztBQUNwQyxNQUFNTSxTQUFTTixRQUFTO0FBQ3hCLE1BQU1PLFNBQVNQLFFBQVM7QUFDeEIsTUFBTVEsWUFBWVIsUUFBUztBQUMzQixNQUFNUyxzQkFBc0JULFFBQVM7QUFDckMsTUFBTVUsaUJBQWlCVixRQUFTO0FBQ2hDLE1BQU1XLGFBQWFYLFFBQVM7QUFDNUIsTUFBTVkscUJBQXFCWixRQUFTO0FBQ3BDLE1BQU1hLFVBQVViLFFBQVM7QUFDekIsTUFBTWMsY0FBY2QsUUFBUztBQUM3QixNQUFNZSxrQkFBa0JmLFFBQVM7QUFDakMsTUFBTWdCLFlBQVloQixRQUFTO0FBQzNCLE1BQU1pQixpQkFBaUJqQixRQUFTO0FBQ2hDLE1BQU1rQix5QkFBeUJsQixRQUFTO0FBQ3hDLE1BQU1tQixvQkFBb0JuQixRQUFTO0FBQ25DLE1BQU1vQixXQUFXcEIsUUFBUztBQUMxQixNQUFNcUIsc0JBQXNCckIsUUFBUztBQUNyQyxNQUFNc0IsU0FBU3RCLFFBQVM7QUFDeEIsTUFBTXVCLFFBQVF2QixRQUFTO0FBQ3ZCLE1BQU0sRUFBRXdCLFlBQVksRUFBRSxHQUFHeEIsUUFBUztBQUVsQzs7Ozs7Ozs7OztDQVVDLEdBQ0R5QixPQUFPQyxPQUFPLHFDQUFH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