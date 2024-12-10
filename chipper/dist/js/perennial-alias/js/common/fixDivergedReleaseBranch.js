// Copyright 2023, University of Colorado Boulder
/**
 * Does some branch changes so that a releaseBranch's dependency SHA matches a named branch
 *
 * For example, gravity-and-orbits 1.6 has a dependencies.json that says joist is at X. If there is a joist branch
 * named 'gravity-and-orbits-1.6', it SHOULD point at X. If it doesn't, we'll change it to point at X. If we change it,
 * we also want to not have the old SHAs garbage collected, so we create 'gravity-and-orbits-1.6-old' to point to it.
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
const getBranchDependencies = require('./getBranchDependencies');
const getBranches = require('./getBranches');
const gitCheckout = require('./gitCheckout');
const gitCreateBranch = require('./gitCreateBranch');
const gitPush = require('./gitPush');
const gitRevParse = require('./gitRevParse');
const winston = require('winston');
const buildLocal = require('./buildLocal');
const Octokit = require('@octokit/rest'); // eslint-disable-line phet/require-statement-match
/**
 * Does some branch changes so that a releaseBranch's dependency SHA matches a named branch
 * @public
 *
 * @param {string} repo - The simulation's repository
 * @param {string} branch - The branch name
 * @param {string} commonRepo
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, branch, commonRepo) {
    const commonBranch = `${repo}-${branch}`;
    const commonOldBranch = `${commonBranch}-old`;
    const commonRepoBranches = yield getBranches(commonRepo);
    if (!commonRepoBranches.includes(commonBranch)) {
        throw new Error(`Branch ${commonBranch} does not exist in ${commonRepo}`);
    }
    if (commonRepoBranches.includes(commonOldBranch)) {
        throw new Error(`Branch ${commonOldBranch} already exists in ${commonRepo}. This happened twice, please manually fix`);
    }
    const dependencies = yield getBranchDependencies(repo, branch);
    const sha = dependencies[commonRepo].sha;
    if (!sha) {
        throw new Error('We do not have a working SHA');
    }
    const octokit = new Octokit({
        auth: buildLocal.developerGithubAccessToken
    });
    const canForcePush = (yield octokit.request(`GET /repos/phetsims/${commonRepo}/branches/${commonBranch}/protection`, {
        owner: 'phetsims',
        repo: commonRepo,
        branch: commonBranch,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })).data.allow_force_pushes.enabled;
    const protectionSettings = {
        owner: 'phetsims',
        repo: commonRepo,
        branch: commonBranch,
        required_status_checks: null,
        enforce_admins: null,
        required_pull_request_reviews: null,
        restrictions: null,
        allow_force_pushes: false,
        allow_deletions: false,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    };
    if (!canForcePush) {
        winston.info('Disabling force push prevention');
        protectionSettings.allow_force_pushes = true;
        yield octokit.request(`PUT /repos/phetsims/${commonRepo}/branches/${commonBranch}/protection`, protectionSettings);
    }
    // Set up 'old' branch, in order to save history
    yield gitCheckout(commonRepo, commonBranch);
    winston.info(`Creating ${commonOldBranch} in ${commonRepo} with ${yield gitRevParse(commonRepo, 'HEAD')}`);
    yield gitCreateBranch(commonRepo, commonOldBranch);
    yield gitPush(commonRepo, commonOldBranch);
    // Fix the branch with the proper name
    yield gitCheckout(commonRepo, commonBranch);
    winston.info(`Moving ${commonBranch} in ${commonRepo} to ${sha}`);
    yield execute('git', [
        'reset',
        '--hard',
        sha
    ], `../${commonRepo}`);
    yield execute('git', [
        'push',
        '-f',
        '-u',
        'origin',
        commonBranch
    ], `../${commonRepo}`);
    if (!canForcePush) {
        winston.info('Enabling force push prevention');
        protectionSettings.allow_force_pushes = false;
        yield octokit.request(`PUT /repos/phetsims/${commonRepo}/branches/${commonBranch}/protection`, protectionSettings);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZml4RGl2ZXJnZWRSZWxlYXNlQnJhbmNoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEb2VzIHNvbWUgYnJhbmNoIGNoYW5nZXMgc28gdGhhdCBhIHJlbGVhc2VCcmFuY2gncyBkZXBlbmRlbmN5IFNIQSBtYXRjaGVzIGEgbmFtZWQgYnJhbmNoXG4gKlxuICogRm9yIGV4YW1wbGUsIGdyYXZpdHktYW5kLW9yYml0cyAxLjYgaGFzIGEgZGVwZW5kZW5jaWVzLmpzb24gdGhhdCBzYXlzIGpvaXN0IGlzIGF0IFguIElmIHRoZXJlIGlzIGEgam9pc3QgYnJhbmNoXG4gKiBuYW1lZCAnZ3Jhdml0eS1hbmQtb3JiaXRzLTEuNicsIGl0IFNIT1VMRCBwb2ludCBhdCBYLiBJZiBpdCBkb2Vzbid0LCB3ZSdsbCBjaGFuZ2UgaXQgdG8gcG9pbnQgYXQgWC4gSWYgd2UgY2hhbmdlIGl0LFxuICogd2UgYWxzbyB3YW50IHRvIG5vdCBoYXZlIHRoZSBvbGQgU0hBcyBnYXJiYWdlIGNvbGxlY3RlZCwgc28gd2UgY3JlYXRlICdncmF2aXR5LWFuZC1vcmJpdHMtMS42LW9sZCcgdG8gcG9pbnQgdG8gaXQuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApLmRlZmF1bHQ7XG5jb25zdCBnZXRCcmFuY2hEZXBlbmRlbmNpZXMgPSByZXF1aXJlKCAnLi9nZXRCcmFuY2hEZXBlbmRlbmNpZXMnICk7XG5jb25zdCBnZXRCcmFuY2hlcyA9IHJlcXVpcmUoICcuL2dldEJyYW5jaGVzJyApO1xuY29uc3QgZ2l0Q2hlY2tvdXQgPSByZXF1aXJlKCAnLi9naXRDaGVja291dCcgKTtcbmNvbnN0IGdpdENyZWF0ZUJyYW5jaCA9IHJlcXVpcmUoICcuL2dpdENyZWF0ZUJyYW5jaCcgKTtcbmNvbnN0IGdpdFB1c2ggPSByZXF1aXJlKCAnLi9naXRQdXNoJyApO1xuY29uc3QgZ2l0UmV2UGFyc2UgPSByZXF1aXJlKCAnLi9naXRSZXZQYXJzZScgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcbmNvbnN0IGJ1aWxkTG9jYWwgPSByZXF1aXJlKCAnLi9idWlsZExvY2FsJyApO1xuY29uc3QgT2N0b2tpdCA9IHJlcXVpcmUoICdAb2N0b2tpdC9yZXN0JyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvcmVxdWlyZS1zdGF0ZW1lbnQtbWF0Y2hcblxuLyoqXG4gKiBEb2VzIHNvbWUgYnJhbmNoIGNoYW5nZXMgc28gdGhhdCBhIHJlbGVhc2VCcmFuY2gncyBkZXBlbmRlbmN5IFNIQSBtYXRjaGVzIGEgbmFtZWQgYnJhbmNoXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgc2ltdWxhdGlvbidzIHJlcG9zaXRvcnlcbiAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2ggLSBUaGUgYnJhbmNoIG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21tb25SZXBvXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbywgYnJhbmNoLCBjb21tb25SZXBvICkge1xuXG4gIGNvbnN0IGNvbW1vbkJyYW5jaCA9IGAke3JlcG99LSR7YnJhbmNofWA7XG4gIGNvbnN0IGNvbW1vbk9sZEJyYW5jaCA9IGAke2NvbW1vbkJyYW5jaH0tb2xkYDtcblxuICBjb25zdCBjb21tb25SZXBvQnJhbmNoZXMgPSBhd2FpdCBnZXRCcmFuY2hlcyggY29tbW9uUmVwbyApO1xuXG4gIGlmICggIWNvbW1vblJlcG9CcmFuY2hlcy5pbmNsdWRlcyggY29tbW9uQnJhbmNoICkgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgQnJhbmNoICR7Y29tbW9uQnJhbmNofSBkb2VzIG5vdCBleGlzdCBpbiAke2NvbW1vblJlcG99YCApO1xuICB9XG4gIGlmICggY29tbW9uUmVwb0JyYW5jaGVzLmluY2x1ZGVzKCBjb21tb25PbGRCcmFuY2ggKSApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBCcmFuY2ggJHtjb21tb25PbGRCcmFuY2h9IGFscmVhZHkgZXhpc3RzIGluICR7Y29tbW9uUmVwb30uIFRoaXMgaGFwcGVuZWQgdHdpY2UsIHBsZWFzZSBtYW51YWxseSBmaXhgICk7XG4gIH1cblxuICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXRCcmFuY2hEZXBlbmRlbmNpZXMoIHJlcG8sIGJyYW5jaCApO1xuICBjb25zdCBzaGEgPSBkZXBlbmRlbmNpZXNbIGNvbW1vblJlcG8gXS5zaGE7XG4gIGlmICggIXNoYSApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdXZSBkbyBub3QgaGF2ZSBhIHdvcmtpbmcgU0hBJyApO1xuICB9XG5cbiAgY29uc3Qgb2N0b2tpdCA9IG5ldyBPY3Rva2l0KCB7XG4gICAgYXV0aDogYnVpbGRMb2NhbC5kZXZlbG9wZXJHaXRodWJBY2Nlc3NUb2tlblxuICB9ICk7XG5cbiAgY29uc3QgY2FuRm9yY2VQdXNoID0gKCBhd2FpdCBvY3Rva2l0LnJlcXVlc3QoIGBHRVQgL3JlcG9zL3BoZXRzaW1zLyR7Y29tbW9uUmVwb30vYnJhbmNoZXMvJHtjb21tb25CcmFuY2h9L3Byb3RlY3Rpb25gLCB7XG4gICAgb3duZXI6ICdwaGV0c2ltcycsXG4gICAgcmVwbzogY29tbW9uUmVwbyxcbiAgICBicmFuY2g6IGNvbW1vbkJyYW5jaCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnWC1HaXRIdWItQXBpLVZlcnNpb24nOiAnMjAyMi0xMS0yOCdcbiAgICB9XG4gIH0gKSApLmRhdGEuYWxsb3dfZm9yY2VfcHVzaGVzLmVuYWJsZWQ7XG5cbiAgY29uc3QgcHJvdGVjdGlvblNldHRpbmdzID0ge1xuICAgIG93bmVyOiAncGhldHNpbXMnLFxuICAgIHJlcG86IGNvbW1vblJlcG8sXG4gICAgYnJhbmNoOiBjb21tb25CcmFuY2gsXG4gICAgcmVxdWlyZWRfc3RhdHVzX2NoZWNrczogbnVsbCxcbiAgICBlbmZvcmNlX2FkbWluczogbnVsbCxcbiAgICByZXF1aXJlZF9wdWxsX3JlcXVlc3RfcmV2aWV3czogbnVsbCxcbiAgICByZXN0cmljdGlvbnM6IG51bGwsXG4gICAgYWxsb3dfZm9yY2VfcHVzaGVzOiBmYWxzZSxcbiAgICBhbGxvd19kZWxldGlvbnM6IGZhbHNlLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdYLUdpdEh1Yi1BcGktVmVyc2lvbic6ICcyMDIyLTExLTI4J1xuICAgIH1cbiAgfTtcblxuICBpZiAoICFjYW5Gb3JjZVB1c2ggKSB7XG4gICAgd2luc3Rvbi5pbmZvKCAnRGlzYWJsaW5nIGZvcmNlIHB1c2ggcHJldmVudGlvbicgKTtcbiAgICBwcm90ZWN0aW9uU2V0dGluZ3MuYWxsb3dfZm9yY2VfcHVzaGVzID0gdHJ1ZTtcbiAgICBhd2FpdCBvY3Rva2l0LnJlcXVlc3QoIGBQVVQgL3JlcG9zL3BoZXRzaW1zLyR7Y29tbW9uUmVwb30vYnJhbmNoZXMvJHtjb21tb25CcmFuY2h9L3Byb3RlY3Rpb25gLCBwcm90ZWN0aW9uU2V0dGluZ3MgKTtcbiAgfVxuXG4gIC8vIFNldCB1cCAnb2xkJyBicmFuY2gsIGluIG9yZGVyIHRvIHNhdmUgaGlzdG9yeVxuICBhd2FpdCBnaXRDaGVja291dCggY29tbW9uUmVwbywgY29tbW9uQnJhbmNoICk7XG4gIHdpbnN0b24uaW5mbyggYENyZWF0aW5nICR7Y29tbW9uT2xkQnJhbmNofSBpbiAke2NvbW1vblJlcG99IHdpdGggJHthd2FpdCBnaXRSZXZQYXJzZSggY29tbW9uUmVwbywgJ0hFQUQnICl9YCApO1xuICBhd2FpdCBnaXRDcmVhdGVCcmFuY2goIGNvbW1vblJlcG8sIGNvbW1vbk9sZEJyYW5jaCApO1xuICBhd2FpdCBnaXRQdXNoKCBjb21tb25SZXBvLCBjb21tb25PbGRCcmFuY2ggKTtcblxuICAvLyBGaXggdGhlIGJyYW5jaCB3aXRoIHRoZSBwcm9wZXIgbmFtZVxuICBhd2FpdCBnaXRDaGVja291dCggY29tbW9uUmVwbywgY29tbW9uQnJhbmNoICk7XG4gIHdpbnN0b24uaW5mbyggYE1vdmluZyAke2NvbW1vbkJyYW5jaH0gaW4gJHtjb21tb25SZXBvfSB0byAke3NoYX1gICk7XG4gIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdyZXNldCcsICctLWhhcmQnLCBzaGEgXSwgYC4uLyR7Y29tbW9uUmVwb31gICk7XG4gIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdwdXNoJywgJy1mJywgJy11JywgJ29yaWdpbicsIGNvbW1vbkJyYW5jaCBdLCBgLi4vJHtjb21tb25SZXBvfWAgKTtcblxuICBpZiAoICFjYW5Gb3JjZVB1c2ggKSB7XG4gICAgd2luc3Rvbi5pbmZvKCAnRW5hYmxpbmcgZm9yY2UgcHVzaCBwcmV2ZW50aW9uJyApO1xuICAgIHByb3RlY3Rpb25TZXR0aW5ncy5hbGxvd19mb3JjZV9wdXNoZXMgPSBmYWxzZTtcbiAgICBhd2FpdCBvY3Rva2l0LnJlcXVlc3QoIGBQVVQgL3JlcG9zL3BoZXRzaW1zLyR7Y29tbW9uUmVwb30vYnJhbmNoZXMvJHtjb21tb25CcmFuY2h9L3Byb3RlY3Rpb25gLCBwcm90ZWN0aW9uU2V0dGluZ3MgKTtcbiAgfVxufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0IiwiZ2V0QnJhbmNoRGVwZW5kZW5jaWVzIiwiZ2V0QnJhbmNoZXMiLCJnaXRDaGVja291dCIsImdpdENyZWF0ZUJyYW5jaCIsImdpdFB1c2giLCJnaXRSZXZQYXJzZSIsIndpbnN0b24iLCJidWlsZExvY2FsIiwiT2N0b2tpdCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwiYnJhbmNoIiwiY29tbW9uUmVwbyIsImNvbW1vbkJyYW5jaCIsImNvbW1vbk9sZEJyYW5jaCIsImNvbW1vblJlcG9CcmFuY2hlcyIsImluY2x1ZGVzIiwiRXJyb3IiLCJkZXBlbmRlbmNpZXMiLCJzaGEiLCJvY3Rva2l0IiwiYXV0aCIsImRldmVsb3BlckdpdGh1YkFjY2Vzc1Rva2VuIiwiY2FuRm9yY2VQdXNoIiwicmVxdWVzdCIsIm93bmVyIiwiaGVhZGVycyIsImRhdGEiLCJhbGxvd19mb3JjZV9wdXNoZXMiLCJlbmFibGVkIiwicHJvdGVjdGlvblNldHRpbmdzIiwicmVxdWlyZWRfc3RhdHVzX2NoZWNrcyIsImVuZm9yY2VfYWRtaW5zIiwicmVxdWlyZWRfcHVsbF9yZXF1ZXN0X3Jldmlld3MiLCJyZXN0cmljdGlvbnMiLCJhbGxvd19kZWxldGlvbnMiLCJpbmZvIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7O0NBUUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsVUFBVUMsUUFBUyxhQUFjQyxPQUFPO0FBQzlDLE1BQU1DLHdCQUF3QkYsUUFBUztBQUN2QyxNQUFNRyxjQUFjSCxRQUFTO0FBQzdCLE1BQU1JLGNBQWNKLFFBQVM7QUFDN0IsTUFBTUssa0JBQWtCTCxRQUFTO0FBQ2pDLE1BQU1NLFVBQVVOLFFBQVM7QUFDekIsTUFBTU8sY0FBY1AsUUFBUztBQUM3QixNQUFNUSxVQUFVUixRQUFTO0FBQ3pCLE1BQU1TLGFBQWFULFFBQVM7QUFDNUIsTUFBTVUsVUFBVVYsUUFBUyxrQkFBbUIsbURBQW1EO0FBRS9GOzs7Ozs7OztDQVFDLEdBQ0RXLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLElBQUksRUFBRUMsTUFBTSxFQUFFQyxVQUFVO0lBRXZELE1BQU1DLGVBQWUsR0FBR0gsS0FBSyxDQUFDLEVBQUVDLFFBQVE7SUFDeEMsTUFBTUcsa0JBQWtCLEdBQUdELGFBQWEsSUFBSSxDQUFDO0lBRTdDLE1BQU1FLHFCQUFxQixNQUFNZixZQUFhWTtJQUU5QyxJQUFLLENBQUNHLG1CQUFtQkMsUUFBUSxDQUFFSCxlQUFpQjtRQUNsRCxNQUFNLElBQUlJLE1BQU8sQ0FBQyxP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