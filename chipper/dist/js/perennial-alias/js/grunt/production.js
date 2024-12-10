// Copyright 2017, University of Colorado Boulder
/**
 * Deploys a production version after incrementing the test version number.
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
const buildServerRequest = require('../common/buildServerRequest');
const checkoutMain = require('../common/checkoutMain');
const checkoutTarget = require('../common/checkoutTarget');
const execute = require('../common/execute').default;
const getDependencies = require('../common/getDependencies');
const getRepoVersion = require('../common/getRepoVersion');
const gitAdd = require('../common/gitAdd');
const gitCommit = require('../common/gitCommit');
const gitIsClean = require('../common/gitIsClean');
const gitPush = require('../common/gitPush');
const grunt = require('grunt');
const gruntCommand = require('../common/gruntCommand');
const hasRemoteBranch = require('../common/hasRemoteBranch');
const isPublished = require('../common/isPublished');
const npmUpdate = require('../common/npmUpdate');
const setRepoVersion = require('../common/setRepoVersion');
const simMetadata = require('../common/simMetadata');
const updateDependenciesJSON = require('../common/updateDependenciesJSON');
const vpnCheck = require('../common/vpnCheck');
const buildLocal = require('../common/buildLocal');
const assert = require('assert');
/**
 * Deploys a production version after incrementing the test version number.
 * @public
 *
 * @param {string} repo
 * @param {string} branch
 * @param {Array.<string>} brands
 * @param {boolean} noninteractive
 * @param {boolean} redeploy
 * @param {string} [message] - Optional message to append to the version-increment commit.
 * @returns {Promise.<SimVersion>}
 */ module.exports = /*#__PURE__*/ function() {
    var _production = _async_to_generator(function*(repo, branch, brands, noninteractive, redeploy, message) {
        SimVersion.ensureReleaseBranch(branch);
        if (!(yield vpnCheck())) {
            grunt.fail.fatal('VPN or being on campus is required for this build. Ensure VPN is enabled, or that you have access to phet-server2.int.colorado.edu');
        }
        const isClean = yield gitIsClean(repo);
        if (!isClean) {
            throw new Error(`Unclean status in ${repo}, cannot create release branch`);
        }
        if (!(yield hasRemoteBranch(repo, branch))) {
            throw new Error(`Cannot find release branch ${branch} for ${repo}`);
        }
        if (!grunt.file.exists(`../${repo}/assets/${repo}-screenshot.png`) && brands.includes('phet')) {
            throw new Error(`Missing screenshot file (${repo}/assets/${repo}-screenshot.png), aborting production deployment`);
        }
        if (!(yield booleanPrompt('Are QA credits up-to-date?', noninteractive))) {
            throw new Error('Aborted production deployment');
        }
        if (!(yield booleanPrompt('Have all maintenance patches that need spot checks been tested? (An issue would be created in the sim repo)', noninteractive))) {
            throw new Error('Aborted production deployment');
        }
        redeploy && assert(noninteractive, 'redeploy can only be specified with noninteractive:true');
        const published = yield isPublished(repo);
        yield checkoutTarget(repo, branch, true); // include npm update
        try {
            const previousVersion = yield getRepoVersion(repo);
            let version;
            let versionChanged;
            if (previousVersion.testType === null) {
                // redeploy flag can bypass this prompt and error
                if (!redeploy && (noninteractive || !(yield booleanPrompt(`The last deployment was a production deployment (${previousVersion.toString()}) and an RC version is required between production versions. Would you like to redeploy ${previousVersion.toString()} (y) or cancel this process and revert to main (N)`, false)))) {
                    throw new Error('Aborted production deployment: It appears that the last deployment was for production.');
                }
                version = previousVersion;
                versionChanged = false;
            } else if (previousVersion.testType === 'rc') {
                version = new SimVersion(previousVersion.major, previousVersion.minor, previousVersion.maintenance);
                versionChanged = true;
            } else {
                throw new Error('Aborted production deployment since the version number cannot be incremented safely');
            }
            const isFirstVersion = !(yield simMetadata({
                simulation: repo
            })).projects;
            // Initial deployment nags
            if (isFirstVersion) {
                if (!(yield booleanPrompt('Is the main checklist complete (e.g. are screenshots added to assets, etc.)', noninteractive))) {
                    throw new Error('Aborted production deployment');
                }
            }
            const versionString = version.toString();
            // caps-lock should hopefully shout this at people. do we have a text-to-speech synthesizer we can shout out of their speakers?
            // SECOND THOUGHT: this would be horrible during automated maintenance releases.
            if (!(yield booleanPrompt(`DEPLOY ${repo} ${versionString} (brands: ${brands.join(',')}) to PRODUCTION`, noninteractive))) {
                throw new Error('Aborted production deployment');
            }
            if (versionChanged) {
                yield setRepoVersion(repo, version, message);
                yield gitPush(repo, branch);
            }
            // Make sure our correct npm dependencies are set
            yield npmUpdate(repo);
            yield npmUpdate('chipper');
            yield npmUpdate('perennial-alias');
            // Update the README on the branch
            if (published) {
                grunt.log.writeln('Updating branch README');
                try {
                    yield execute(gruntCommand, [
                        'published-readme'
                    ], `../${repo}`);
                } catch (e) {
                    grunt.log.writeln('published-readme error, may not exist, will try generate-published-README');
                    try {
                        yield execute(gruntCommand, [
                            'generate-published-README'
                        ], `../${repo}`);
                    } catch (e) {
                        grunt.log.writeln('No published README generation found');
                    }
                }
                yield gitAdd(repo, 'README.md');
                try {
                    yield gitCommit(repo, `Generated published README.md as part of a production deploy for ${versionString}`);
                    yield gitPush(repo, branch);
                } catch (e) {
                    grunt.log.writeln('Production README is already up-to-date');
                }
            }
            // No special options required here, as we send the main request to the build server
            grunt.log.writeln((yield build(repo, {
                brands: brands,
                minify: !noninteractive
            })));
            /**
     * The necessary clean up steps to do if aborting after the build
     * @param {string} message - message to error out with
     * @returns {Promise.<void>}
     */ const postBuildAbort = /*#__PURE__*/ _async_to_generator(function*(message) {
                // Abort version update
                if (versionChanged) {
                    yield setRepoVersion(repo, previousVersion, message);
                    yield gitPush(repo, branch);
                }
                // Abort checkout, (will be caught and main will be checked out
                throw new Error(message);
            });
            if (!(yield booleanPrompt(`Please test the built version of ${repo}.\nIs it ready to deploy?`, noninteractive))) {
                yield postBuildAbort('Aborted production deployment (aborted version change too).');
            }
            // Move over dependencies.json and commit/push
            yield updateDependenciesJSON(repo, brands, versionString, branch);
            // Send the build request
            yield buildServerRequest(repo, version, branch, (yield getDependencies(repo)), {
                locales: '*',
                brands: brands,
                servers: [
                    'dev',
                    'production'
                ]
            });
            // Move back to main
            yield checkoutMain(repo, true);
            if (brands.includes('phet')) {
                grunt.log.writeln(`Deployed: https://phet.colorado.edu/sims/html/${repo}/latest/${repo}_all.html`);
            }
            if (brands.includes('phet-io')) {
                grunt.log.writeln(`Deployed: https://phet-io.colorado.edu/sims/${repo}/${versionString}/`);
            }
            grunt.log.writeln('Please wait for the build-server to complete the deployment, and then test!');
            grunt.log.writeln(`To view the current build status, visit ${buildLocal.productionServerURL}/deploy-status`);
            if (isFirstVersion && brands.includes('phet')) {
                grunt.log.writeln('After testing, let the simulation lead know it has been deployed, so they can edit metadata on the website');
                // Update the README on main
                if (published) {
                    grunt.log.writeln('Updating main README');
                    yield execute(gruntCommand, [
                        'published-readme'
                    ], `../${repo}`);
                    yield gitAdd(repo, 'README.md');
                    try {
                        yield gitCommit(repo, `Generated published README.md as part of a production deploy for ${versionString}`);
                        yield gitPush(repo, 'main');
                    } catch (e) {
                        grunt.log.writeln('Production README is already up-to-date');
                    }
                }
            }
            // phet-io nags from the checklist
            if (brands.includes('phet-io')) {
                const phetioLogText = `
PhET-iO deploys involve a couple of extra steps after production. Please ensure the following are accomplished:
1. Make sure the sim is listed in perennial/data/phet-io-api-stable if it has had a designed production release (and that the API is up to date).
2. Make sure the sim is listed in perennial/data/phet-io-hydrogen.json. It is almost certainly part of this featureset. 
3. Create an issue in the phet-io repo using the "New PhET-iO Simulation Publication" issue template.
      `;
                grunt.log.writeln(phetioLogText);
            }
            return version;
        } catch (e) {
            grunt.log.warn('Detected failure during deploy, reverting to main');
            yield checkoutMain(repo, true);
            throw e;
        }
    });
    function production(repo, branch, brands, noninteractive, redeploy, message) {
        return _production.apply(this, arguments);
    }
    return production;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9wcm9kdWN0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZXBsb3lzIGEgcHJvZHVjdGlvbiB2ZXJzaW9uIGFmdGVyIGluY3JlbWVudGluZyB0aGUgdGVzdCB2ZXJzaW9uIG51bWJlci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgU2ltVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9icm93c2VyLWFuZC1ub2RlL1NpbVZlcnNpb24nICkuZGVmYXVsdDtcbmNvbnN0IGJvb2xlYW5Qcm9tcHQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2Jvb2xlYW5Qcm9tcHQnICk7XG5jb25zdCBidWlsZCA9IHJlcXVpcmUoICcuLi9jb21tb24vYnVpbGQnICk7XG5jb25zdCBidWlsZFNlcnZlclJlcXVlc3QgPSByZXF1aXJlKCAnLi4vY29tbW9uL2J1aWxkU2VydmVyUmVxdWVzdCcgKTtcbmNvbnN0IGNoZWNrb3V0TWFpbiA9IHJlcXVpcmUoICcuLi9jb21tb24vY2hlY2tvdXRNYWluJyApO1xuY29uc3QgY2hlY2tvdXRUYXJnZXQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2NoZWNrb3V0VGFyZ2V0JyApO1xuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuLi9jb21tb24vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3QgZ2V0RGVwZW5kZW5jaWVzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXREZXBlbmRlbmNpZXMnICk7XG5jb25zdCBnZXRSZXBvVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2V0UmVwb1ZlcnNpb24nICk7XG5jb25zdCBnaXRBZGQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdEFkZCcgKTtcbmNvbnN0IGdpdENvbW1pdCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0Q29tbWl0JyApO1xuY29uc3QgZ2l0SXNDbGVhbiA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0SXNDbGVhbicgKTtcbmNvbnN0IGdpdFB1c2ggPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdFB1c2gnICk7XG5jb25zdCBncnVudCA9IHJlcXVpcmUoICdncnVudCcgKTtcbmNvbnN0IGdydW50Q29tbWFuZCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ3J1bnRDb21tYW5kJyApO1xuY29uc3QgaGFzUmVtb3RlQnJhbmNoID0gcmVxdWlyZSggJy4uL2NvbW1vbi9oYXNSZW1vdGVCcmFuY2gnICk7XG5jb25zdCBpc1B1Ymxpc2hlZCA9IHJlcXVpcmUoICcuLi9jb21tb24vaXNQdWJsaXNoZWQnICk7XG5jb25zdCBucG1VcGRhdGUgPSByZXF1aXJlKCAnLi4vY29tbW9uL25wbVVwZGF0ZScgKTtcbmNvbnN0IHNldFJlcG9WZXJzaW9uID0gcmVxdWlyZSggJy4uL2NvbW1vbi9zZXRSZXBvVmVyc2lvbicgKTtcbmNvbnN0IHNpbU1ldGFkYXRhID0gcmVxdWlyZSggJy4uL2NvbW1vbi9zaW1NZXRhZGF0YScgKTtcbmNvbnN0IHVwZGF0ZURlcGVuZGVuY2llc0pTT04gPSByZXF1aXJlKCAnLi4vY29tbW9uL3VwZGF0ZURlcGVuZGVuY2llc0pTT04nICk7XG5jb25zdCB2cG5DaGVjayA9IHJlcXVpcmUoICcuLi9jb21tb24vdnBuQ2hlY2snICk7XG5jb25zdCBidWlsZExvY2FsID0gcmVxdWlyZSggJy4uL2NvbW1vbi9idWlsZExvY2FsJyApO1xuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcblxuLyoqXG4gKiBEZXBsb3lzIGEgcHJvZHVjdGlvbiB2ZXJzaW9uIGFmdGVyIGluY3JlbWVudGluZyB0aGUgdGVzdCB2ZXJzaW9uIG51bWJlci5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xuICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gYnJhbmRzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG5vbmludGVyYWN0aXZlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlZGVwbG95XG4gKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gT3B0aW9uYWwgbWVzc2FnZSB0byBhcHBlbmQgdG8gdGhlIHZlcnNpb24taW5jcmVtZW50IGNvbW1pdC5cbiAqIEByZXR1cm5zIHtQcm9taXNlLjxTaW1WZXJzaW9uPn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiBwcm9kdWN0aW9uKCByZXBvLCBicmFuY2gsIGJyYW5kcywgbm9uaW50ZXJhY3RpdmUsIHJlZGVwbG95LCBtZXNzYWdlICkge1xuICBTaW1WZXJzaW9uLmVuc3VyZVJlbGVhc2VCcmFuY2goIGJyYW5jaCApO1xuXG4gIGlmICggISggYXdhaXQgdnBuQ2hlY2soKSApICkge1xuICAgIGdydW50LmZhaWwuZmF0YWwoICdWUE4gb3IgYmVpbmcgb24gY2FtcHVzIGlzIHJlcXVpcmVkIGZvciB0aGlzIGJ1aWxkLiBFbnN1cmUgVlBOIGlzIGVuYWJsZWQsIG9yIHRoYXQgeW91IGhhdmUgYWNjZXNzIHRvIHBoZXQtc2VydmVyMi5pbnQuY29sb3JhZG8uZWR1JyApO1xuICB9XG5cbiAgY29uc3QgaXNDbGVhbiA9IGF3YWl0IGdpdElzQ2xlYW4oIHJlcG8gKTtcbiAgaWYgKCAhaXNDbGVhbiApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmNsZWFuIHN0YXR1cyBpbiAke3JlcG99LCBjYW5ub3QgY3JlYXRlIHJlbGVhc2UgYnJhbmNoYCApO1xuICB9XG5cbiAgaWYgKCAhKCBhd2FpdCBoYXNSZW1vdGVCcmFuY2goIHJlcG8sIGJyYW5jaCApICkgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgQ2Fubm90IGZpbmQgcmVsZWFzZSBicmFuY2ggJHticmFuY2h9IGZvciAke3JlcG99YCApO1xuICB9XG5cbiAgaWYgKCAhZ3J1bnQuZmlsZS5leGlzdHMoIGAuLi8ke3JlcG99L2Fzc2V0cy8ke3JlcG99LXNjcmVlbnNob3QucG5nYCApICYmIGJyYW5kcy5pbmNsdWRlcyggJ3BoZXQnICkgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgTWlzc2luZyBzY3JlZW5zaG90IGZpbGUgKCR7cmVwb30vYXNzZXRzLyR7cmVwb30tc2NyZWVuc2hvdC5wbmcpLCBhYm9ydGluZyBwcm9kdWN0aW9uIGRlcGxveW1lbnRgICk7XG4gIH1cblxuICBpZiAoICFhd2FpdCBib29sZWFuUHJvbXB0KCAnQXJlIFFBIGNyZWRpdHMgdXAtdG8tZGF0ZT8nLCBub25pbnRlcmFjdGl2ZSApICkge1xuICAgIHRocm93IG5ldyBFcnJvciggJ0Fib3J0ZWQgcHJvZHVjdGlvbiBkZXBsb3ltZW50JyApO1xuICB9XG5cbiAgaWYgKCAhYXdhaXQgYm9vbGVhblByb21wdCggJ0hhdmUgYWxsIG1haW50ZW5hbmNlIHBhdGNoZXMgdGhhdCBuZWVkIHNwb3QgY2hlY2tzIGJlZW4gdGVzdGVkPyAoQW4gaXNzdWUgd291bGQgYmUgY3JlYXRlZCBpbiB0aGUgc2ltIHJlcG8pJywgbm9uaW50ZXJhY3RpdmUgKSApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdBYm9ydGVkIHByb2R1Y3Rpb24gZGVwbG95bWVudCcgKTtcbiAgfVxuXG4gIHJlZGVwbG95ICYmIGFzc2VydCggbm9uaW50ZXJhY3RpdmUsICdyZWRlcGxveSBjYW4gb25seSBiZSBzcGVjaWZpZWQgd2l0aCBub25pbnRlcmFjdGl2ZTp0cnVlJyApO1xuXG4gIGNvbnN0IHB1Ymxpc2hlZCA9IGF3YWl0IGlzUHVibGlzaGVkKCByZXBvICk7XG5cbiAgYXdhaXQgY2hlY2tvdXRUYXJnZXQoIHJlcG8sIGJyYW5jaCwgdHJ1ZSApOyAvLyBpbmNsdWRlIG5wbSB1cGRhdGVcblxuICB0cnkge1xuICAgIGNvbnN0IHByZXZpb3VzVmVyc2lvbiA9IGF3YWl0IGdldFJlcG9WZXJzaW9uKCByZXBvICk7XG4gICAgbGV0IHZlcnNpb247XG4gICAgbGV0IHZlcnNpb25DaGFuZ2VkO1xuXG4gICAgaWYgKCBwcmV2aW91c1ZlcnNpb24udGVzdFR5cGUgPT09IG51bGwgKSB7XG5cbiAgICAgIC8vIHJlZGVwbG95IGZsYWcgY2FuIGJ5cGFzcyB0aGlzIHByb21wdCBhbmQgZXJyb3JcbiAgICAgIGlmICggIXJlZGVwbG95ICYmICggbm9uaW50ZXJhY3RpdmUgfHwgIWF3YWl0IGJvb2xlYW5Qcm9tcHQoIGBUaGUgbGFzdCBkZXBsb3ltZW50IHdhcyBhIHByb2R1Y3Rpb24gZGVwbG95bWVudCAoJHtwcmV2aW91c1ZlcnNpb24udG9TdHJpbmcoKX0pIGFuZCBhbiBSQyB2ZXJzaW9uIGlzIHJlcXVpcmVkIGJldHdlZW4gcHJvZHVjdGlvbiB2ZXJzaW9ucy4gV291bGQgeW91IGxpa2UgdG8gcmVkZXBsb3kgJHtwcmV2aW91c1ZlcnNpb24udG9TdHJpbmcoKX0gKHkpIG9yIGNhbmNlbCB0aGlzIHByb2Nlc3MgYW5kIHJldmVydCB0byBtYWluIChOKWAsIGZhbHNlICkgKSApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQWJvcnRlZCBwcm9kdWN0aW9uIGRlcGxveW1lbnQ6IEl0IGFwcGVhcnMgdGhhdCB0aGUgbGFzdCBkZXBsb3ltZW50IHdhcyBmb3IgcHJvZHVjdGlvbi4nICk7XG4gICAgICB9XG5cbiAgICAgIHZlcnNpb24gPSBwcmV2aW91c1ZlcnNpb247XG4gICAgICB2ZXJzaW9uQ2hhbmdlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmICggcHJldmlvdXNWZXJzaW9uLnRlc3RUeXBlID09PSAncmMnICkge1xuICAgICAgdmVyc2lvbiA9IG5ldyBTaW1WZXJzaW9uKCBwcmV2aW91c1ZlcnNpb24ubWFqb3IsIHByZXZpb3VzVmVyc2lvbi5taW5vciwgcHJldmlvdXNWZXJzaW9uLm1haW50ZW5hbmNlICk7XG4gICAgICB2ZXJzaW9uQ2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQWJvcnRlZCBwcm9kdWN0aW9uIGRlcGxveW1lbnQgc2luY2UgdGhlIHZlcnNpb24gbnVtYmVyIGNhbm5vdCBiZSBpbmNyZW1lbnRlZCBzYWZlbHknICk7XG4gICAgfVxuXG4gICAgY29uc3QgaXNGaXJzdFZlcnNpb24gPSAhKCBhd2FpdCBzaW1NZXRhZGF0YSgge1xuICAgICAgc2ltdWxhdGlvbjogcmVwb1xuICAgIH0gKSApLnByb2plY3RzO1xuXG4gICAgLy8gSW5pdGlhbCBkZXBsb3ltZW50IG5hZ3NcbiAgICBpZiAoIGlzRmlyc3RWZXJzaW9uICkge1xuICAgICAgaWYgKCAhYXdhaXQgYm9vbGVhblByb21wdCggJ0lzIHRoZSBtYWluIGNoZWNrbGlzdCBjb21wbGV0ZSAoZS5nLiBhcmUgc2NyZWVuc2hvdHMgYWRkZWQgdG8gYXNzZXRzLCBldGMuKScsIG5vbmludGVyYWN0aXZlICkgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ0Fib3J0ZWQgcHJvZHVjdGlvbiBkZXBsb3ltZW50JyApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHZlcnNpb25TdHJpbmcgPSB2ZXJzaW9uLnRvU3RyaW5nKCk7XG5cbiAgICAvLyBjYXBzLWxvY2sgc2hvdWxkIGhvcGVmdWxseSBzaG91dCB0aGlzIGF0IHBlb3BsZS4gZG8gd2UgaGF2ZSBhIHRleHQtdG8tc3BlZWNoIHN5bnRoZXNpemVyIHdlIGNhbiBzaG91dCBvdXQgb2YgdGhlaXIgc3BlYWtlcnM/XG4gICAgLy8gU0VDT05EIFRIT1VHSFQ6IHRoaXMgd291bGQgYmUgaG9ycmlibGUgZHVyaW5nIGF1dG9tYXRlZCBtYWludGVuYW5jZSByZWxlYXNlcy5cbiAgICBpZiAoICFhd2FpdCBib29sZWFuUHJvbXB0KCBgREVQTE9ZICR7cmVwb30gJHt2ZXJzaW9uU3RyaW5nfSAoYnJhbmRzOiAke2JyYW5kcy5qb2luKCAnLCcgKX0pIHRvIFBST0RVQ1RJT05gLCBub25pbnRlcmFjdGl2ZSApICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQWJvcnRlZCBwcm9kdWN0aW9uIGRlcGxveW1lbnQnICk7XG4gICAgfVxuXG4gICAgaWYgKCB2ZXJzaW9uQ2hhbmdlZCApIHtcbiAgICAgIGF3YWl0IHNldFJlcG9WZXJzaW9uKCByZXBvLCB2ZXJzaW9uLCBtZXNzYWdlICk7XG4gICAgICBhd2FpdCBnaXRQdXNoKCByZXBvLCBicmFuY2ggKTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgb3VyIGNvcnJlY3QgbnBtIGRlcGVuZGVuY2llcyBhcmUgc2V0XG4gICAgYXdhaXQgbnBtVXBkYXRlKCByZXBvICk7XG4gICAgYXdhaXQgbnBtVXBkYXRlKCAnY2hpcHBlcicgKTtcbiAgICBhd2FpdCBucG1VcGRhdGUoICdwZXJlbm5pYWwtYWxpYXMnICk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIFJFQURNRSBvbiB0aGUgYnJhbmNoXG4gICAgaWYgKCBwdWJsaXNoZWQgKSB7XG4gICAgICBncnVudC5sb2cud3JpdGVsbiggJ1VwZGF0aW5nIGJyYW5jaCBSRUFETUUnICk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ3B1Ymxpc2hlZC1yZWFkbWUnIF0sIGAuLi8ke3JlcG99YCApO1xuICAgICAgfVxuICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgIGdydW50LmxvZy53cml0ZWxuKCAncHVibGlzaGVkLXJlYWRtZSBlcnJvciwgbWF5IG5vdCBleGlzdCwgd2lsbCB0cnkgZ2VuZXJhdGUtcHVibGlzaGVkLVJFQURNRScgKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ2dlbmVyYXRlLXB1Ymxpc2hlZC1SRUFETUUnIF0sIGAuLi8ke3JlcG99YCApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoKCBlICkge1xuICAgICAgICAgIGdydW50LmxvZy53cml0ZWxuKCAnTm8gcHVibGlzaGVkIFJFQURNRSBnZW5lcmF0aW9uIGZvdW5kJyApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhd2FpdCBnaXRBZGQoIHJlcG8sICdSRUFETUUubWQnICk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBnaXRDb21taXQoIHJlcG8sIGBHZW5lcmF0ZWQgcHVibGlzaGVkIFJFQURNRS5tZCBhcyBwYXJ0IG9mIGEgcHJvZHVjdGlvbiBkZXBsb3kgZm9yICR7dmVyc2lvblN0cmluZ31gICk7XG4gICAgICAgIGF3YWl0IGdpdFB1c2goIHJlcG8sIGJyYW5jaCApO1xuICAgICAgfVxuICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgIGdydW50LmxvZy53cml0ZWxuKCAnUHJvZHVjdGlvbiBSRUFETUUgaXMgYWxyZWFkeSB1cC10by1kYXRlJyApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5vIHNwZWNpYWwgb3B0aW9ucyByZXF1aXJlZCBoZXJlLCBhcyB3ZSBzZW5kIHRoZSBtYWluIHJlcXVlc3QgdG8gdGhlIGJ1aWxkIHNlcnZlclxuICAgIGdydW50LmxvZy53cml0ZWxuKCBhd2FpdCBidWlsZCggcmVwbywge1xuICAgICAgYnJhbmRzOiBicmFuZHMsXG4gICAgICBtaW5pZnk6ICFub25pbnRlcmFjdGl2ZVxuICAgIH0gKSApO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG5lY2Vzc2FyeSBjbGVhbiB1cCBzdGVwcyB0byBkbyBpZiBhYm9ydGluZyBhZnRlciB0aGUgYnVpbGRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIG1lc3NhZ2UgdG8gZXJyb3Igb3V0IHdpdGhcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48dm9pZD59XG4gICAgICovXG4gICAgY29uc3QgcG9zdEJ1aWxkQWJvcnQgPSBhc3luYyBtZXNzYWdlID0+IHtcblxuICAgICAgLy8gQWJvcnQgdmVyc2lvbiB1cGRhdGVcbiAgICAgIGlmICggdmVyc2lvbkNoYW5nZWQgKSB7XG4gICAgICAgIGF3YWl0IHNldFJlcG9WZXJzaW9uKCByZXBvLCBwcmV2aW91c1ZlcnNpb24sIG1lc3NhZ2UgKTtcbiAgICAgICAgYXdhaXQgZ2l0UHVzaCggcmVwbywgYnJhbmNoICk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFib3J0IGNoZWNrb3V0LCAod2lsbCBiZSBjYXVnaHQgYW5kIG1haW4gd2lsbCBiZSBjaGVja2VkIG91dFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBtZXNzYWdlICk7XG4gICAgfTtcblxuXG4gICAgaWYgKCAhYXdhaXQgYm9vbGVhblByb21wdCggYFBsZWFzZSB0ZXN0IHRoZSBidWlsdCB2ZXJzaW9uIG9mICR7cmVwb30uXFxuSXMgaXQgcmVhZHkgdG8gZGVwbG95P2AsIG5vbmludGVyYWN0aXZlICkgKSB7XG4gICAgICBhd2FpdCBwb3N0QnVpbGRBYm9ydCggJ0Fib3J0ZWQgcHJvZHVjdGlvbiBkZXBsb3ltZW50IChhYm9ydGVkIHZlcnNpb24gY2hhbmdlIHRvbykuJyApO1xuICAgIH1cblxuICAgIC8vIE1vdmUgb3ZlciBkZXBlbmRlbmNpZXMuanNvbiBhbmQgY29tbWl0L3B1c2hcbiAgICBhd2FpdCB1cGRhdGVEZXBlbmRlbmNpZXNKU09OKCByZXBvLCBicmFuZHMsIHZlcnNpb25TdHJpbmcsIGJyYW5jaCApO1xuXG4gICAgLy8gU2VuZCB0aGUgYnVpbGQgcmVxdWVzdFxuICAgIGF3YWl0IGJ1aWxkU2VydmVyUmVxdWVzdCggcmVwbywgdmVyc2lvbiwgYnJhbmNoLCBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHJlcG8gKSwge1xuICAgICAgbG9jYWxlczogJyonLFxuICAgICAgYnJhbmRzOiBicmFuZHMsXG4gICAgICBzZXJ2ZXJzOiBbICdkZXYnLCAncHJvZHVjdGlvbicgXVxuICAgIH0gKTtcblxuICAgIC8vIE1vdmUgYmFjayB0byBtYWluXG4gICAgYXdhaXQgY2hlY2tvdXRNYWluKCByZXBvLCB0cnVlICk7XG5cbiAgICBpZiAoIGJyYW5kcy5pbmNsdWRlcyggJ3BoZXQnICkgKSB7XG4gICAgICBncnVudC5sb2cud3JpdGVsbiggYERlcGxveWVkOiBodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3NpbXMvaHRtbC8ke3JlcG99L2xhdGVzdC8ke3JlcG99X2FsbC5odG1sYCApO1xuICAgIH1cbiAgICBpZiAoIGJyYW5kcy5pbmNsdWRlcyggJ3BoZXQtaW8nICkgKSB7XG4gICAgICBncnVudC5sb2cud3JpdGVsbiggYERlcGxveWVkOiBodHRwczovL3BoZXQtaW8uY29sb3JhZG8uZWR1L3NpbXMvJHtyZXBvfS8ke3ZlcnNpb25TdHJpbmd9L2AgKTtcbiAgICB9XG5cbiAgICBncnVudC5sb2cud3JpdGVsbiggJ1BsZWFzZSB3YWl0IGZvciB0aGUgYnVpbGQtc2VydmVyIHRvIGNvbXBsZXRlIHRoZSBkZXBsb3ltZW50LCBhbmQgdGhlbiB0ZXN0IScgKTtcbiAgICBncnVudC5sb2cud3JpdGVsbiggYFRvIHZpZXcgdGhlIGN1cnJlbnQgYnVpbGQgc3RhdHVzLCB2aXNpdCAke2J1aWxkTG9jYWwucHJvZHVjdGlvblNlcnZlclVSTH0vZGVwbG95LXN0YXR1c2AgKTtcblxuICAgIGlmICggaXNGaXJzdFZlcnNpb24gJiYgYnJhbmRzLmluY2x1ZGVzKCAncGhldCcgKSApIHtcbiAgICAgIGdydW50LmxvZy53cml0ZWxuKCAnQWZ0ZXIgdGVzdGluZywgbGV0IHRoZSBzaW11bGF0aW9uIGxlYWQga25vdyBpdCBoYXMgYmVlbiBkZXBsb3llZCwgc28gdGhleSBjYW4gZWRpdCBtZXRhZGF0YSBvbiB0aGUgd2Vic2l0ZScgKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBSRUFETUUgb24gbWFpblxuICAgICAgaWYgKCBwdWJsaXNoZWQgKSB7XG4gICAgICAgIGdydW50LmxvZy53cml0ZWxuKCAnVXBkYXRpbmcgbWFpbiBSRUFETUUnICk7XG4gICAgICAgIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAncHVibGlzaGVkLXJlYWRtZScgXSwgYC4uLyR7cmVwb31gICk7XG4gICAgICAgIGF3YWl0IGdpdEFkZCggcmVwbywgJ1JFQURNRS5tZCcgKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBnaXRDb21taXQoIHJlcG8sIGBHZW5lcmF0ZWQgcHVibGlzaGVkIFJFQURNRS5tZCBhcyBwYXJ0IG9mIGEgcHJvZHVjdGlvbiBkZXBsb3kgZm9yICR7dmVyc2lvblN0cmluZ31gICk7XG4gICAgICAgICAgYXdhaXQgZ2l0UHVzaCggcmVwbywgJ21haW4nICk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgICAgZ3J1bnQubG9nLndyaXRlbG4oICdQcm9kdWN0aW9uIFJFQURNRSBpcyBhbHJlYWR5IHVwLXRvLWRhdGUnICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBwaGV0LWlvIG5hZ3MgZnJvbSB0aGUgY2hlY2tsaXN0XG4gICAgaWYgKCBicmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApICkge1xuICAgICAgY29uc3QgcGhldGlvTG9nVGV4dCA9IGBcblBoRVQtaU8gZGVwbG95cyBpbnZvbHZlIGEgY291cGxlIG9mIGV4dHJhIHN0ZXBzIGFmdGVyIHByb2R1Y3Rpb24uIFBsZWFzZSBlbnN1cmUgdGhlIGZvbGxvd2luZyBhcmUgYWNjb21wbGlzaGVkOlxuMS4gTWFrZSBzdXJlIHRoZSBzaW0gaXMgbGlzdGVkIGluIHBlcmVubmlhbC9kYXRhL3BoZXQtaW8tYXBpLXN0YWJsZSBpZiBpdCBoYXMgaGFkIGEgZGVzaWduZWQgcHJvZHVjdGlvbiByZWxlYXNlIChhbmQgdGhhdCB0aGUgQVBJIGlzIHVwIHRvIGRhdGUpLlxuMi4gTWFrZSBzdXJlIHRoZSBzaW0gaXMgbGlzdGVkIGluIHBlcmVubmlhbC9kYXRhL3BoZXQtaW8taHlkcm9nZW4uanNvbi4gSXQgaXMgYWxtb3N0IGNlcnRhaW5seSBwYXJ0IG9mIHRoaXMgZmVhdHVyZXNldC4gXG4zLiBDcmVhdGUgYW4gaXNzdWUgaW4gdGhlIHBoZXQtaW8gcmVwbyB1c2luZyB0aGUgXCJOZXcgUGhFVC1pTyBTaW11bGF0aW9uIFB1YmxpY2F0aW9uXCIgaXNzdWUgdGVtcGxhdGUuXG4gICAgICBgO1xuICAgICAgZ3J1bnQubG9nLndyaXRlbG4oIHBoZXRpb0xvZ1RleHQgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVyc2lvbjtcbiAgfVxuICBjYXRjaCggZSApIHtcbiAgICBncnVudC5sb2cud2FybiggJ0RldGVjdGVkIGZhaWx1cmUgZHVyaW5nIGRlcGxveSwgcmV2ZXJ0aW5nIHRvIG1haW4nICk7XG4gICAgYXdhaXQgY2hlY2tvdXRNYWluKCByZXBvLCB0cnVlICk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTsiXSwibmFtZXMiOlsiU2ltVmVyc2lvbiIsInJlcXVpcmUiLCJkZWZhdWx0IiwiYm9vbGVhblByb21wdCIsImJ1aWxkIiwiYnVpbGRTZXJ2ZXJSZXF1ZXN0IiwiY2hlY2tvdXRNYWluIiwiY2hlY2tvdXRUYXJnZXQiLCJleGVjdXRlIiwiZ2V0RGVwZW5kZW5jaWVzIiwiZ2V0UmVwb1ZlcnNpb24iLCJnaXRBZGQiLCJnaXRDb21taXQiLCJnaXRJc0NsZWFuIiwiZ2l0UHVzaCIsImdydW50IiwiZ3J1bnRDb21tYW5kIiwiaGFzUmVtb3RlQnJhbmNoIiwiaXNQdWJsaXNoZWQiLCJucG1VcGRhdGUiLCJzZXRSZXBvVmVyc2lvbiIsInNpbU1ldGFkYXRhIiwidXBkYXRlRGVwZW5kZW5jaWVzSlNPTiIsInZwbkNoZWNrIiwiYnVpbGRMb2NhbCIsImFzc2VydCIsIm1vZHVsZSIsImV4cG9ydHMiLCJwcm9kdWN0aW9uIiwicmVwbyIsImJyYW5jaCIsImJyYW5kcyIsIm5vbmludGVyYWN0aXZlIiwicmVkZXBsb3kiLCJtZXNzYWdlIiwiZW5zdXJlUmVsZWFzZUJyYW5jaCIsImZhaWwiLCJmYXRhbCIsImlzQ2xlYW4iLCJFcnJvciIsImZpbGUiLCJleGlzdHMiLCJpbmNsdWRlcyIsInB1Ymxpc2hlZCIsInByZXZpb3VzVmVyc2lvbiIsInZlcnNpb24iLCJ2ZXJzaW9uQ2hhbmdlZCIsInRlc3RUeXBlIiwidG9TdHJpbmciLCJtYWpvciIsIm1pbm9yIiwibWFpbnRlbmFuY2UiLCJpc0ZpcnN0VmVyc2lvbiIsInNpbXVsYXRpb24iLCJwcm9qZWN0cyIsInZlcnNpb25TdHJpbmciLCJqb2luIiwibG9nIiwid3JpdGVsbiIsImUiLCJtaW5pZnkiLCJwb3N0QnVpbGRBYm9ydCIsImxvY2FsZXMiLCJzZXJ2ZXJzIiwicHJvZHVjdGlvblNlcnZlclVSTCIsInBoZXRpb0xvZ1RleHQiLCJ3YXJuIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxhQUFhQyxRQUFTLGtDQUFtQ0MsT0FBTztBQUN0RSxNQUFNQyxnQkFBZ0JGLFFBQVM7QUFDL0IsTUFBTUcsUUFBUUgsUUFBUztBQUN2QixNQUFNSSxxQkFBcUJKLFFBQVM7QUFDcEMsTUFBTUssZUFBZUwsUUFBUztBQUM5QixNQUFNTSxpQkFBaUJOLFFBQVM7QUFDaEMsTUFBTU8sVUFBVVAsUUFBUyxxQkFBc0JDLE9BQU87QUFDdEQsTUFBTU8sa0JBQWtCUixRQUFTO0FBQ2pDLE1BQU1TLGlCQUFpQlQsUUFBUztBQUNoQyxNQUFNVSxTQUFTVixRQUFTO0FBQ3hCLE1BQU1XLFlBQVlYLFFBQVM7QUFDM0IsTUFBTVksYUFBYVosUUFBUztBQUM1QixNQUFNYSxVQUFVYixRQUFTO0FBQ3pCLE1BQU1jLFFBQVFkLFFBQVM7QUFDdkIsTUFBTWUsZUFBZWYsUUFBUztBQUM5QixNQUFNZ0Isa0JBQWtCaEIsUUFBUztBQUNqQyxNQUFNaUIsY0FBY2pCLFFBQVM7QUFDN0IsTUFBTWtCLFlBQVlsQixRQUFTO0FBQzNCLE1BQU1tQixpQkFBaUJuQixRQUFTO0FBQ2hDLE1BQU1vQixjQUFjcEIsUUFBUztBQUM3QixNQUFNcUIseUJBQXlCckIsUUFBUztBQUN4QyxNQUFNc0IsV0FBV3RCLFFBQVM7QUFDMUIsTUFBTXVCLGFBQWF2QixRQUFTO0FBQzVCLE1BQU13QixTQUFTeEIsUUFBUztBQUV4Qjs7Ozs7Ozs7Ozs7Q0FXQyxHQUNEeUIsT0FB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