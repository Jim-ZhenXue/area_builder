// Copyright 2017, University of Colorado Boulder
/**
 * Deploys an rc version after incrementing the test version number.
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
const buildServerRequest = require('../common/buildServerRequest');
const checkoutMain = require('../common/checkoutMain');
const checkoutTarget = require('../common/checkoutTarget');
const devDirectoryExists = require('../common/devDirectoryExists');
const getDependencies = require('../common/getDependencies');
const getRepoVersion = require('../common/getRepoVersion');
const gitCheckout = require('../common/gitCheckout');
const gitIsClean = require('../common/gitIsClean');
const gitPush = require('../common/gitPush');
const hasRemoteBranch = require('../common/hasRemoteBranch');
const loadJSON = require('../common/loadJSON');
const npmUpdate = require('../common/npmUpdate');
const setRepoVersion = require('../common/setRepoVersion');
const updateDependenciesJSON = require('../common/updateDependenciesJSON');
const vpnCheck = require('../common/vpnCheck');
const createRelease = require('./createRelease');
const grunt = require('grunt');
/**
 * Deploys an rc version after incrementing the test version number.
 * @public
 *
 * @param {string} repo
 * @param {string} branch
 * @param {Array.<string>} brands
 * @param {boolean} noninteractive
 * @param {string} [message] - Optional message to append to the version-increment commit.
 * @returns {Promise.<SimVersion>}
 */ module.exports = /*#__PURE__*/ function() {
    var _rc = _async_to_generator(function*(repo, branch, brands, noninteractive, message) {
        SimVersion.ensureReleaseBranch(branch);
        if (!(yield vpnCheck())) {
            grunt.fail.fatal('VPN or being on campus is required for this build. Ensure VPN is enabled, or that you have access to phet-server2.int.colorado.edu');
        }
        const isClean = yield gitIsClean(repo);
        if (!isClean) {
            throw new Error(`Unclean status in ${repo}, cannot create release branch`);
        }
        if (!(yield hasRemoteBranch(repo, branch))) {
            if (noninteractive || !(yield booleanPrompt(`Release branch ${branch} does not exist. Create it?`, false))) {
                throw new Error('Aborted rc deployment due to non-existing branch');
            }
            yield createRelease(repo, branch, brands);
        }
        // PhET-iO simulations require validation for RCs. Error out if "phet.phet-io.validation=false" is in package.json.
        yield gitCheckout(repo, branch);
        if (brands.includes('phet-io')) {
            const packageObject = yield loadJSON(`../${repo}/package.json`);
            if (packageObject.phet['phet-io'] && packageObject.phet['phet-io'].hasOwnProperty('validation') && !packageObject.phet['phet-io'].validation) {
                throw new Error('PhET-iO simulations require validation for RCs');
            }
        }
        yield checkoutTarget(repo, branch, true); // include npm update
        try {
            const previousVersion = yield getRepoVersion(repo);
            if (previousVersion.testType !== 'rc' && previousVersion.testType !== null) {
                throw new Error(`Aborted rc deployment since the version number cannot be incremented safely (testType:${previousVersion.testType})`);
            }
            const version = new SimVersion(previousVersion.major, previousVersion.minor, previousVersion.maintenance + (previousVersion.testType === null ? 1 : 0), {
                testType: 'rc',
                testNumber: previousVersion.testNumber ? previousVersion.testNumber + 1 : 1
            });
            const versionString = version.toString();
            const simPath = buildLocal.devDeployPath + repo;
            const versionPath = `${simPath}/${versionString}`;
            const versionPathExists = yield devDirectoryExists(versionPath);
            if (versionPathExists) {
                throw new Error(`Directory ${versionPath} already exists.  If you intend to replace the content then remove the directory manually from ${buildLocal.devDeployServer}.`);
            }
            if (!(yield booleanPrompt(`Deploy ${versionString} to ${buildLocal.devDeployServer}`, noninteractive))) {
                throw new Error('Aborted rc deployment');
            }
            yield setRepoVersion(repo, version, message);
            yield gitPush(repo, branch);
            // Make sure our correct npm dependencies are set
            yield npmUpdate(repo);
            yield npmUpdate('chipper');
            yield npmUpdate('perennial-alias');
            // No special options required here, as we send the main request to the build server
            grunt.log.writeln((yield build(repo, {
                brands: brands,
                minify: !noninteractive
            })));
            if (!(yield booleanPrompt(`Please test the built version of ${repo}.\nIs it ready to deploy`, noninteractive))) {
                // Abort version update
                yield setRepoVersion(repo, previousVersion, message);
                yield gitPush(repo, branch);
                // Abort checkout
                yield checkoutMain(repo, true);
                throw new Error('Aborted rc deployment (aborted version change too).');
            }
            // Move over dependencies.json and commit/push
            yield updateDependenciesJSON(repo, brands, versionString, branch);
            // Send the build request
            yield buildServerRequest(repo, version, branch, (yield getDependencies(repo)), {
                locales: [
                    '*'
                ],
                brands: brands,
                servers: [
                    'dev'
                ]
            });
            // Move back to main
            yield checkoutMain(repo, true);
            const versionURL = `https://phet-dev.colorado.edu/html/${repo}/${versionString}`;
            if (brands.includes('phet')) {
                grunt.log.writeln(`Deployed: ${versionURL}/phet/${repo}_all_phet.html`);
            }
            if (brands.includes('phet-io')) {
                grunt.log.writeln(`Deployed: ${versionURL}/phet-io/`);
            }
            grunt.log.writeln('Please wait for the build-server to complete the deployment, and then test!');
            grunt.log.writeln(`To view the current build status, visit ${buildLocal.productionServerURL}/deploy-status`);
            return version;
        } catch (e) {
            grunt.log.warn('Detected failure during deploy, reverting to main');
            yield checkoutMain(repo, true);
            throw e;
        }
    });
    function rc(repo, branch, brands, noninteractive, message) {
        return _rc.apply(this, arguments);
    }
    return rc;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9yYy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVwbG95cyBhbiByYyB2ZXJzaW9uIGFmdGVyIGluY3JlbWVudGluZyB0aGUgdGVzdCB2ZXJzaW9uIG51bWJlci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgU2ltVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9icm93c2VyLWFuZC1ub2RlL1NpbVZlcnNpb24nICkuZGVmYXVsdDtcbmNvbnN0IGJvb2xlYW5Qcm9tcHQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2Jvb2xlYW5Qcm9tcHQnICk7XG5jb25zdCBidWlsZCA9IHJlcXVpcmUoICcuLi9jb21tb24vYnVpbGQnICk7XG5jb25zdCBidWlsZExvY2FsID0gcmVxdWlyZSggJy4uL2NvbW1vbi9idWlsZExvY2FsJyApO1xuY29uc3QgYnVpbGRTZXJ2ZXJSZXF1ZXN0ID0gcmVxdWlyZSggJy4uL2NvbW1vbi9idWlsZFNlcnZlclJlcXVlc3QnICk7XG5jb25zdCBjaGVja291dE1haW4gPSByZXF1aXJlKCAnLi4vY29tbW9uL2NoZWNrb3V0TWFpbicgKTtcbmNvbnN0IGNoZWNrb3V0VGFyZ2V0ID0gcmVxdWlyZSggJy4uL2NvbW1vbi9jaGVja291dFRhcmdldCcgKTtcbmNvbnN0IGRldkRpcmVjdG9yeUV4aXN0cyA9IHJlcXVpcmUoICcuLi9jb21tb24vZGV2RGlyZWN0b3J5RXhpc3RzJyApO1xuY29uc3QgZ2V0RGVwZW5kZW5jaWVzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXREZXBlbmRlbmNpZXMnICk7XG5jb25zdCBnZXRSZXBvVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2V0UmVwb1ZlcnNpb24nICk7XG5jb25zdCBnaXRDaGVja291dCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0Q2hlY2tvdXQnICk7XG5jb25zdCBnaXRJc0NsZWFuID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRJc0NsZWFuJyApO1xuY29uc3QgZ2l0UHVzaCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0UHVzaCcgKTtcbmNvbnN0IGhhc1JlbW90ZUJyYW5jaCA9IHJlcXVpcmUoICcuLi9jb21tb24vaGFzUmVtb3RlQnJhbmNoJyApO1xuY29uc3QgbG9hZEpTT04gPSByZXF1aXJlKCAnLi4vY29tbW9uL2xvYWRKU09OJyApO1xuY29uc3QgbnBtVXBkYXRlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9ucG1VcGRhdGUnICk7XG5jb25zdCBzZXRSZXBvVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9jb21tb24vc2V0UmVwb1ZlcnNpb24nICk7XG5jb25zdCB1cGRhdGVEZXBlbmRlbmNpZXNKU09OID0gcmVxdWlyZSggJy4uL2NvbW1vbi91cGRhdGVEZXBlbmRlbmNpZXNKU09OJyApO1xuY29uc3QgdnBuQ2hlY2sgPSByZXF1aXJlKCAnLi4vY29tbW9uL3ZwbkNoZWNrJyApO1xuY29uc3QgY3JlYXRlUmVsZWFzZSA9IHJlcXVpcmUoICcuL2NyZWF0ZVJlbGVhc2UnICk7XG5jb25zdCBncnVudCA9IHJlcXVpcmUoICdncnVudCcgKTtcblxuLyoqXG4gKiBEZXBsb3lzIGFuIHJjIHZlcnNpb24gYWZ0ZXIgaW5jcmVtZW50aW5nIHRoZSB0ZXN0IHZlcnNpb24gbnVtYmVyLlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXG4gKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoXG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBicmFuZHNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9uaW50ZXJhY3RpdmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gLSBPcHRpb25hbCBtZXNzYWdlIHRvIGFwcGVuZCB0byB0aGUgdmVyc2lvbi1pbmNyZW1lbnQgY29tbWl0LlxuICogQHJldHVybnMge1Byb21pc2UuPFNpbVZlcnNpb24+fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uIHJjKCByZXBvLCBicmFuY2gsIGJyYW5kcywgbm9uaW50ZXJhY3RpdmUsIG1lc3NhZ2UgKSB7XG4gIFNpbVZlcnNpb24uZW5zdXJlUmVsZWFzZUJyYW5jaCggYnJhbmNoICk7XG5cbiAgaWYgKCAhKCBhd2FpdCB2cG5DaGVjaygpICkgKSB7XG4gICAgZ3J1bnQuZmFpbC5mYXRhbCggJ1ZQTiBvciBiZWluZyBvbiBjYW1wdXMgaXMgcmVxdWlyZWQgZm9yIHRoaXMgYnVpbGQuIEVuc3VyZSBWUE4gaXMgZW5hYmxlZCwgb3IgdGhhdCB5b3UgaGF2ZSBhY2Nlc3MgdG8gcGhldC1zZXJ2ZXIyLmludC5jb2xvcmFkby5lZHUnICk7XG4gIH1cblxuICBjb25zdCBpc0NsZWFuID0gYXdhaXQgZ2l0SXNDbGVhbiggcmVwbyApO1xuICBpZiAoICFpc0NsZWFuICkge1xuICAgIHRocm93IG5ldyBFcnJvciggYFVuY2xlYW4gc3RhdHVzIGluICR7cmVwb30sIGNhbm5vdCBjcmVhdGUgcmVsZWFzZSBicmFuY2hgICk7XG4gIH1cblxuICBpZiAoICEoIGF3YWl0IGhhc1JlbW90ZUJyYW5jaCggcmVwbywgYnJhbmNoICkgKSApIHtcbiAgICBpZiAoIG5vbmludGVyYWN0aXZlIHx8ICFhd2FpdCBib29sZWFuUHJvbXB0KCBgUmVsZWFzZSBicmFuY2ggJHticmFuY2h9IGRvZXMgbm90IGV4aXN0LiBDcmVhdGUgaXQ/YCwgZmFsc2UgKSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0Fib3J0ZWQgcmMgZGVwbG95bWVudCBkdWUgdG8gbm9uLWV4aXN0aW5nIGJyYW5jaCcgKTtcbiAgICB9XG5cbiAgICBhd2FpdCBjcmVhdGVSZWxlYXNlKCByZXBvLCBicmFuY2gsIGJyYW5kcyApO1xuICB9XG5cbiAgLy8gUGhFVC1pTyBzaW11bGF0aW9ucyByZXF1aXJlIHZhbGlkYXRpb24gZm9yIFJDcy4gRXJyb3Igb3V0IGlmIFwicGhldC5waGV0LWlvLnZhbGlkYXRpb249ZmFsc2VcIiBpcyBpbiBwYWNrYWdlLmpzb24uXG4gIGF3YWl0IGdpdENoZWNrb3V0KCByZXBvLCBicmFuY2ggKTtcbiAgaWYgKCBicmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApICkge1xuICAgIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBhd2FpdCBsb2FkSlNPTiggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCApO1xuICAgIGlmICggcGFja2FnZU9iamVjdC5waGV0WyAncGhldC1pbycgXSAmJiBwYWNrYWdlT2JqZWN0LnBoZXRbICdwaGV0LWlvJyBdLmhhc093blByb3BlcnR5KCAndmFsaWRhdGlvbicgKSAmJlxuICAgICAgICAgIXBhY2thZ2VPYmplY3QucGhldFsgJ3BoZXQtaW8nIF0udmFsaWRhdGlvbiApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ1BoRVQtaU8gc2ltdWxhdGlvbnMgcmVxdWlyZSB2YWxpZGF0aW9uIGZvciBSQ3MnICk7XG4gICAgfVxuICB9XG5cbiAgYXdhaXQgY2hlY2tvdXRUYXJnZXQoIHJlcG8sIGJyYW5jaCwgdHJ1ZSApOyAvLyBpbmNsdWRlIG5wbSB1cGRhdGVcblxuICB0cnkge1xuICAgIGNvbnN0IHByZXZpb3VzVmVyc2lvbiA9IGF3YWl0IGdldFJlcG9WZXJzaW9uKCByZXBvICk7XG5cbiAgICBpZiAoIHByZXZpb3VzVmVyc2lvbi50ZXN0VHlwZSAhPT0gJ3JjJyAmJiBwcmV2aW91c1ZlcnNpb24udGVzdFR5cGUgIT09IG51bGwgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBBYm9ydGVkIHJjIGRlcGxveW1lbnQgc2luY2UgdGhlIHZlcnNpb24gbnVtYmVyIGNhbm5vdCBiZSBpbmNyZW1lbnRlZCBzYWZlbHkgKHRlc3RUeXBlOiR7cHJldmlvdXNWZXJzaW9uLnRlc3RUeXBlfSlgICk7XG4gICAgfVxuXG4gICAgY29uc3QgdmVyc2lvbiA9IG5ldyBTaW1WZXJzaW9uKCBwcmV2aW91c1ZlcnNpb24ubWFqb3IsIHByZXZpb3VzVmVyc2lvbi5taW5vciwgcHJldmlvdXNWZXJzaW9uLm1haW50ZW5hbmNlICsgKCBwcmV2aW91c1ZlcnNpb24udGVzdFR5cGUgPT09IG51bGwgPyAxIDogMCApLCB7XG4gICAgICB0ZXN0VHlwZTogJ3JjJyxcbiAgICAgIHRlc3ROdW1iZXI6IHByZXZpb3VzVmVyc2lvbi50ZXN0TnVtYmVyID8gcHJldmlvdXNWZXJzaW9uLnRlc3ROdW1iZXIgKyAxIDogMVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHZlcnNpb25TdHJpbmcgPSB2ZXJzaW9uLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgc2ltUGF0aCA9IGJ1aWxkTG9jYWwuZGV2RGVwbG95UGF0aCArIHJlcG87XG4gICAgY29uc3QgdmVyc2lvblBhdGggPSBgJHtzaW1QYXRofS8ke3ZlcnNpb25TdHJpbmd9YDtcblxuICAgIGNvbnN0IHZlcnNpb25QYXRoRXhpc3RzID0gYXdhaXQgZGV2RGlyZWN0b3J5RXhpc3RzKCB2ZXJzaW9uUGF0aCApO1xuXG4gICAgaWYgKCB2ZXJzaW9uUGF0aEV4aXN0cyApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYERpcmVjdG9yeSAke3ZlcnNpb25QYXRofSBhbHJlYWR5IGV4aXN0cy4gIElmIHlvdSBpbnRlbmQgdG8gcmVwbGFjZSB0aGUgY29udGVudCB0aGVuIHJlbW92ZSB0aGUgZGlyZWN0b3J5IG1hbnVhbGx5IGZyb20gJHtidWlsZExvY2FsLmRldkRlcGxveVNlcnZlcn0uYCApO1xuICAgIH1cblxuICAgIGlmICggIWF3YWl0IGJvb2xlYW5Qcm9tcHQoIGBEZXBsb3kgJHt2ZXJzaW9uU3RyaW5nfSB0byAke2J1aWxkTG9jYWwuZGV2RGVwbG95U2VydmVyfWAsIG5vbmludGVyYWN0aXZlICkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdBYm9ydGVkIHJjIGRlcGxveW1lbnQnICk7XG4gICAgfVxuXG4gICAgYXdhaXQgc2V0UmVwb1ZlcnNpb24oIHJlcG8sIHZlcnNpb24sIG1lc3NhZ2UgKTtcbiAgICBhd2FpdCBnaXRQdXNoKCByZXBvLCBicmFuY2ggKTtcblxuICAgIC8vIE1ha2Ugc3VyZSBvdXIgY29ycmVjdCBucG0gZGVwZW5kZW5jaWVzIGFyZSBzZXRcbiAgICBhd2FpdCBucG1VcGRhdGUoIHJlcG8gKTtcbiAgICBhd2FpdCBucG1VcGRhdGUoICdjaGlwcGVyJyApO1xuICAgIGF3YWl0IG5wbVVwZGF0ZSggJ3BlcmVubmlhbC1hbGlhcycgKTtcblxuICAgIC8vIE5vIHNwZWNpYWwgb3B0aW9ucyByZXF1aXJlZCBoZXJlLCBhcyB3ZSBzZW5kIHRoZSBtYWluIHJlcXVlc3QgdG8gdGhlIGJ1aWxkIHNlcnZlclxuICAgIGdydW50LmxvZy53cml0ZWxuKCBhd2FpdCBidWlsZCggcmVwbywge1xuICAgICAgYnJhbmRzOiBicmFuZHMsXG4gICAgICBtaW5pZnk6ICFub25pbnRlcmFjdGl2ZVxuICAgIH0gKSApO1xuXG4gICAgaWYgKCAhYXdhaXQgYm9vbGVhblByb21wdCggYFBsZWFzZSB0ZXN0IHRoZSBidWlsdCB2ZXJzaW9uIG9mICR7cmVwb30uXFxuSXMgaXQgcmVhZHkgdG8gZGVwbG95YCwgbm9uaW50ZXJhY3RpdmUgKSApIHtcbiAgICAgIC8vIEFib3J0IHZlcnNpb24gdXBkYXRlXG4gICAgICBhd2FpdCBzZXRSZXBvVmVyc2lvbiggcmVwbywgcHJldmlvdXNWZXJzaW9uLCBtZXNzYWdlICk7XG4gICAgICBhd2FpdCBnaXRQdXNoKCByZXBvLCBicmFuY2ggKTtcblxuICAgICAgLy8gQWJvcnQgY2hlY2tvdXRcbiAgICAgIGF3YWl0IGNoZWNrb3V0TWFpbiggcmVwbywgdHJ1ZSApO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQWJvcnRlZCByYyBkZXBsb3ltZW50IChhYm9ydGVkIHZlcnNpb24gY2hhbmdlIHRvbykuJyApO1xuICAgIH1cblxuICAgIC8vIE1vdmUgb3ZlciBkZXBlbmRlbmNpZXMuanNvbiBhbmQgY29tbWl0L3B1c2hcbiAgICBhd2FpdCB1cGRhdGVEZXBlbmRlbmNpZXNKU09OKCByZXBvLCBicmFuZHMsIHZlcnNpb25TdHJpbmcsIGJyYW5jaCApO1xuXG4gICAgLy8gU2VuZCB0aGUgYnVpbGQgcmVxdWVzdFxuICAgIGF3YWl0IGJ1aWxkU2VydmVyUmVxdWVzdCggcmVwbywgdmVyc2lvbiwgYnJhbmNoLCBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHJlcG8gKSwge1xuICAgICAgbG9jYWxlczogWyAnKicgXSxcbiAgICAgIGJyYW5kczogYnJhbmRzLFxuICAgICAgc2VydmVyczogWyAnZGV2JyBdXG4gICAgfSApO1xuXG4gICAgLy8gTW92ZSBiYWNrIHRvIG1haW5cbiAgICBhd2FpdCBjaGVja291dE1haW4oIHJlcG8sIHRydWUgKTtcblxuICAgIGNvbnN0IHZlcnNpb25VUkwgPSBgaHR0cHM6Ly9waGV0LWRldi5jb2xvcmFkby5lZHUvaHRtbC8ke3JlcG99LyR7dmVyc2lvblN0cmluZ31gO1xuXG4gICAgaWYgKCBicmFuZHMuaW5jbHVkZXMoICdwaGV0JyApICkge1xuICAgICAgZ3J1bnQubG9nLndyaXRlbG4oIGBEZXBsb3llZDogJHt2ZXJzaW9uVVJMfS9waGV0LyR7cmVwb31fYWxsX3BoZXQuaHRtbGAgKTtcbiAgICB9XG4gICAgaWYgKCBicmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApICkge1xuICAgICAgZ3J1bnQubG9nLndyaXRlbG4oIGBEZXBsb3llZDogJHt2ZXJzaW9uVVJMfS9waGV0LWlvL2AgKTtcbiAgICB9XG5cbiAgICBncnVudC5sb2cud3JpdGVsbiggJ1BsZWFzZSB3YWl0IGZvciB0aGUgYnVpbGQtc2VydmVyIHRvIGNvbXBsZXRlIHRoZSBkZXBsb3ltZW50LCBhbmQgdGhlbiB0ZXN0IScgKTtcbiAgICBncnVudC5sb2cud3JpdGVsbiggYFRvIHZpZXcgdGhlIGN1cnJlbnQgYnVpbGQgc3RhdHVzLCB2aXNpdCAke2J1aWxkTG9jYWwucHJvZHVjdGlvblNlcnZlclVSTH0vZGVwbG95LXN0YXR1c2AgKTtcblxuICAgIHJldHVybiB2ZXJzaW9uO1xuICB9XG4gIGNhdGNoKCBlICkge1xuICAgIGdydW50LmxvZy53YXJuKCAnRGV0ZWN0ZWQgZmFpbHVyZSBkdXJpbmcgZGVwbG95LCByZXZlcnRpbmcgdG8gbWFpbicgKTtcbiAgICBhd2FpdCBjaGVja291dE1haW4oIHJlcG8sIHRydWUgKTtcbiAgICB0aHJvdyBlO1xuICB9XG59OyJdLCJuYW1lcyI6WyJTaW1WZXJzaW9uIiwicmVxdWlyZSIsImRlZmF1bHQiLCJib29sZWFuUHJvbXB0IiwiYnVpbGQiLCJidWlsZExvY2FsIiwiYnVpbGRTZXJ2ZXJSZXF1ZXN0IiwiY2hlY2tvdXRNYWluIiwiY2hlY2tvdXRUYXJnZXQiLCJkZXZEaXJlY3RvcnlFeGlzdHMiLCJnZXREZXBlbmRlbmNpZXMiLCJnZXRSZXBvVmVyc2lvbiIsImdpdENoZWNrb3V0IiwiZ2l0SXNDbGVhbiIsImdpdFB1c2giLCJoYXNSZW1vdGVCcmFuY2giLCJsb2FkSlNPTiIsIm5wbVVwZGF0ZSIsInNldFJlcG9WZXJzaW9uIiwidXBkYXRlRGVwZW5kZW5jaWVzSlNPTiIsInZwbkNoZWNrIiwiY3JlYXRlUmVsZWFzZSIsImdydW50IiwibW9kdWxlIiwiZXhwb3J0cyIsInJjIiwicmVwbyIsImJyYW5jaCIsImJyYW5kcyIsIm5vbmludGVyYWN0aXZlIiwibWVzc2FnZSIsImVuc3VyZVJlbGVhc2VCcmFuY2giLCJmYWlsIiwiZmF0YWwiLCJpc0NsZWFuIiwiRXJyb3IiLCJpbmNsdWRlcyIsInBhY2thZ2VPYmplY3QiLCJwaGV0IiwiaGFzT3duUHJvcGVydHkiLCJ2YWxpZGF0aW9uIiwicHJldmlvdXNWZXJzaW9uIiwidGVzdFR5cGUiLCJ2ZXJzaW9uIiwibWFqb3IiLCJtaW5vciIsIm1haW50ZW5hbmNlIiwidGVzdE51bWJlciIsInZlcnNpb25TdHJpbmciLCJ0b1N0cmluZyIsInNpbVBhdGgiLCJkZXZEZXBsb3lQYXRoIiwidmVyc2lvblBhdGgiLCJ2ZXJzaW9uUGF0aEV4aXN0cyIsImRldkRlcGxveVNlcnZlciIsImxvZyIsIndyaXRlbG4iLCJtaW5pZnkiLCJsb2NhbGVzIiwic2VydmVycyIsInZlcnNpb25VUkwiLCJwcm9kdWN0aW9uU2VydmVyVVJMIiwiZSIsIndhcm4iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGFBQWFDLFFBQVMsa0NBQW1DQyxPQUFPO0FBQ3RFLE1BQU1DLGdCQUFnQkYsUUFBUztBQUMvQixNQUFNRyxRQUFRSCxRQUFTO0FBQ3ZCLE1BQU1JLGFBQWFKLFFBQVM7QUFDNUIsTUFBTUsscUJBQXFCTCxRQUFTO0FBQ3BDLE1BQU1NLGVBQWVOLFFBQVM7QUFDOUIsTUFBTU8saUJBQWlCUCxRQUFTO0FBQ2hDLE1BQU1RLHFCQUFxQlIsUUFBUztBQUNwQyxNQUFNUyxrQkFBa0JULFFBQVM7QUFDakMsTUFBTVUsaUJBQWlCVixRQUFTO0FBQ2hDLE1BQU1XLGNBQWNYLFFBQVM7QUFDN0IsTUFBTVksYUFBYVosUUFBUztBQUM1QixNQUFNYSxVQUFVYixRQUFTO0FBQ3pCLE1BQU1jLGtCQUFrQmQsUUFBUztBQUNqQyxNQUFNZSxXQUFXZixRQUFTO0FBQzFCLE1BQU1nQixZQUFZaEIsUUFBUztBQUMzQixNQUFNaUIsaUJBQWlCakIsUUFBUztBQUNoQyxNQUFNa0IseUJBQXlCbEIsUUFBUztBQUN4QyxNQUFNbUIsV0FBV25CLFFBQVM7QUFDMUIsTUFBTW9CLGdCQUFnQnBCLFFBQVM7QUFDL0IsTUFBTXFCLFFBQVFyQixRQUFTO0FBRXZCOzs7Ozs7Ozs7O0NBVUMsR0FDRHNCLE9BQU9DLE9BQU87UUFBa0JDLE1BQWYsb0JBQUEsVUFBbUJDLElBQUksRUFBRUMsTUFBTSxFQUFFQyxNQUFNLEVBQUVDLGNBQWMsRUFBRUMsT0FBTztRQUMvRTlCLFdBQVcrQixtQkFBbUIsQ0FBRUo7UUFFaEMsSUFBSyxDQUFHLENBQUEsTUFBTVAsVUFBUyxHQUFNO1lBQzNC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