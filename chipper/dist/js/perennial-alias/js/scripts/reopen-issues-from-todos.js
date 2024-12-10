// Copyright 2024, University of Colorado Boulder
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
import Octokit from '@octokit/rest';
import fs from 'fs';
import _ from 'lodash';
import process from 'process';
import buildLocal from '../common/buildLocal.js';
import createDirectory from '../common/createDirectory.js';
import getRepoList from '../common/getRepoList.js';
import lint from '../eslint/lint.js';
const CHIPPER_DIST_ESLINT = '../chipper/dist/eslint/';
const TODOsFilename = `${CHIPPER_DIST_ESLINT}/issuesFromTODOs.txt`;
/**
 * This script is meant to ensure that all todos pointing to a github issue are pointing to open issues.
 *
 * This script works by. . .
 * - Running lint --all with a flag to specify a side effect to the to-do-should-have-issue rule which will keep
 * track of all to-do issues.
 * - Use that list to ping github to see if the issue is open
 * - If not open, reopen it and send a comment noting that there is still at least one to-do pointing here.
 *
 * usage:
 * cd perennial
 * sage run js/scripts/reopen-issues-from-todos.ts
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ _async_to_generator(function*() {
    // Mark an environment variable that tells lint's to-do-should-have-issue rule to have a side-effect of saving a file
    // with all to-do issues.
    process.env.saveTODOIssues = 'true';
    if (!fs.existsSync(CHIPPER_DIST_ESLINT)) {
        yield createDirectory(CHIPPER_DIST_ESLINT);
    }
    fs.writeFileSync(TODOsFilename, '');
    console.log('grunt lint --all started');
    try {
        yield lint(getRepoList('active-repos').filter((repo)=>repo !== 'perennial'), {
            clean: true
        });
    } catch (e) {
        console.error('Error running lint --all:\n\n', e);
        process.exit();
    }
    console.log('grunt lint --all finished');
    const TODOIssues = fs.readFileSync(TODOsFilename).toString().trim().split('\n');
    const uniqueTODOIssues = _.uniq(TODOIssues);
    console.log(uniqueTODOIssues.length, 'issues to check');
    const octokit = new Octokit({
        auth: buildLocal.phetDevGitHubAccessToken
    });
    let reopenedCount = 0;
    for(let i = 0; i < uniqueTODOIssues.length; i++){
        const issueURL = uniqueTODOIssues[i];
        const repoMatch = issueURL.match(/phetsims\/([\w-]+)\/issues/);
        const issueNumberMatch = issueURL.match(/phetsims\/[\w-]+\/issues\/(\d+)/);
        if (!repoMatch || !issueNumberMatch) {
            console.error('unexpected issue URL:', issueURL);
            continue;
        }
        const repo = repoMatch[1];
        const issueNumber = issueNumberMatch[1];
        // For reference, see https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#update-an-issue
        try {
            const response = yield octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
                owner: 'phetsims',
                repo: repo,
                issue_number: issueNumber
            });
            if (response.data.state === 'closed') {
                console.log(`TODO linking to closed issue: ${issueURL}`);
                yield octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
                    owner: 'phetsims',
                    repo: repo,
                    issue_number: issueNumber,
                    state: 'open'
                });
                yield octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
                    owner: 'phetsims',
                    repo: repo,
                    issue_number: issueNumber,
                    body: 'Reopening because there is a TODO marked for this issue.'
                });
                reopenedCount++;
            }
        } catch (e) {
            console.error('Issue does not exist', `${repo}#${issueNumber}`, e);
        }
    }
    console.log(`Finished. Reopened ${reopenedCount}/${uniqueTODOIssues.length} issues`);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3Jlb3Blbi1pc3N1ZXMtZnJvbS10b2Rvcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBPY3Rva2l0IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgcHJvY2VzcyBmcm9tICdwcm9jZXNzJztcbmltcG9ydCBidWlsZExvY2FsIGZyb20gJy4uL2NvbW1vbi9idWlsZExvY2FsLmpzJztcbmltcG9ydCBjcmVhdGVEaXJlY3RvcnkgZnJvbSAnLi4vY29tbW9uL2NyZWF0ZURpcmVjdG9yeS5qcyc7XG5pbXBvcnQgZ2V0UmVwb0xpc3QgZnJvbSAnLi4vY29tbW9uL2dldFJlcG9MaXN0LmpzJztcbmltcG9ydCBsaW50IGZyb20gJy4uL2VzbGludC9saW50LmpzJztcblxuY29uc3QgQ0hJUFBFUl9ESVNUX0VTTElOVCA9ICcuLi9jaGlwcGVyL2Rpc3QvZXNsaW50Lyc7XG5jb25zdCBUT0RPc0ZpbGVuYW1lID0gYCR7Q0hJUFBFUl9ESVNUX0VTTElOVH0vaXNzdWVzRnJvbVRPRE9zLnR4dGA7XG5cbi8qKlxuICogVGhpcyBzY3JpcHQgaXMgbWVhbnQgdG8gZW5zdXJlIHRoYXQgYWxsIHRvZG9zIHBvaW50aW5nIHRvIGEgZ2l0aHViIGlzc3VlIGFyZSBwb2ludGluZyB0byBvcGVuIGlzc3Vlcy5cbiAqXG4gKiBUaGlzIHNjcmlwdCB3b3JrcyBieS4gLiAuXG4gKiAtIFJ1bm5pbmcgbGludCAtLWFsbCB3aXRoIGEgZmxhZyB0byBzcGVjaWZ5IGEgc2lkZSBlZmZlY3QgdG8gdGhlIHRvLWRvLXNob3VsZC1oYXZlLWlzc3VlIHJ1bGUgd2hpY2ggd2lsbCBrZWVwXG4gKiB0cmFjayBvZiBhbGwgdG8tZG8gaXNzdWVzLlxuICogLSBVc2UgdGhhdCBsaXN0IHRvIHBpbmcgZ2l0aHViIHRvIHNlZSBpZiB0aGUgaXNzdWUgaXMgb3BlblxuICogLSBJZiBub3Qgb3BlbiwgcmVvcGVuIGl0IGFuZCBzZW5kIGEgY29tbWVudCBub3RpbmcgdGhhdCB0aGVyZSBpcyBzdGlsbCBhdCBsZWFzdCBvbmUgdG8tZG8gcG9pbnRpbmcgaGVyZS5cbiAqXG4gKiB1c2FnZTpcbiAqIGNkIHBlcmVubmlhbFxuICogc2FnZSBydW4ganMvc2NyaXB0cy9yZW9wZW4taXNzdWVzLWZyb20tdG9kb3MudHNcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbiggYXN5bmMgKCkgPT4ge1xuXG4gIC8vIE1hcmsgYW4gZW52aXJvbm1lbnQgdmFyaWFibGUgdGhhdCB0ZWxscyBsaW50J3MgdG8tZG8tc2hvdWxkLWhhdmUtaXNzdWUgcnVsZSB0byBoYXZlIGEgc2lkZS1lZmZlY3Qgb2Ygc2F2aW5nIGEgZmlsZVxuICAvLyB3aXRoIGFsbCB0by1kbyBpc3N1ZXMuXG4gIHByb2Nlc3MuZW52LnNhdmVUT0RPSXNzdWVzID0gJ3RydWUnO1xuXG4gIGlmICggIWZzLmV4aXN0c1N5bmMoIENISVBQRVJfRElTVF9FU0xJTlQgKSApIHtcbiAgICBhd2FpdCBjcmVhdGVEaXJlY3RvcnkoIENISVBQRVJfRElTVF9FU0xJTlQgKTtcbiAgfVxuICBmcy53cml0ZUZpbGVTeW5jKCBUT0RPc0ZpbGVuYW1lLCAnJyApO1xuXG4gIGNvbnNvbGUubG9nKCAnZ3J1bnQgbGludCAtLWFsbCBzdGFydGVkJyApO1xuICB0cnkge1xuICAgIGF3YWl0IGxpbnQoIGdldFJlcG9MaXN0KCAnYWN0aXZlLXJlcG9zJyApLmZpbHRlciggcmVwbyA9PiByZXBvICE9PSAncGVyZW5uaWFsJyApLCB7XG4gICAgICBjbGVhbjogdHJ1ZVxuICAgIH0gKTtcbiAgfVxuICBjYXRjaCggZSApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnRXJyb3IgcnVubmluZyBsaW50IC0tYWxsOlxcblxcbicsIGUgKTtcbiAgICBwcm9jZXNzLmV4aXQoKTtcbiAgfVxuICBjb25zb2xlLmxvZyggJ2dydW50IGxpbnQgLS1hbGwgZmluaXNoZWQnICk7XG5cbiAgY29uc3QgVE9ET0lzc3VlcyA9IGZzLnJlYWRGaWxlU3luYyggVE9ET3NGaWxlbmFtZSApLnRvU3RyaW5nKCkudHJpbSgpLnNwbGl0KCAnXFxuJyApO1xuXG4gIGNvbnN0IHVuaXF1ZVRPRE9Jc3N1ZXMgPSBfLnVuaXEoIFRPRE9Jc3N1ZXMgKTtcbiAgY29uc29sZS5sb2coIHVuaXF1ZVRPRE9Jc3N1ZXMubGVuZ3RoLCAnaXNzdWVzIHRvIGNoZWNrJyApO1xuXG4gIGNvbnN0IG9jdG9raXQgPSBuZXcgT2N0b2tpdCgge1xuICAgIGF1dGg6IGJ1aWxkTG9jYWwucGhldERldkdpdEh1YkFjY2Vzc1Rva2VuXG4gIH0gKTtcblxuICBsZXQgcmVvcGVuZWRDb3VudCA9IDA7XG5cbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgdW5pcXVlVE9ET0lzc3Vlcy5sZW5ndGg7IGkrKyApIHtcbiAgICBjb25zdCBpc3N1ZVVSTCA9IHVuaXF1ZVRPRE9Jc3N1ZXNbIGkgXTtcblxuICAgIGNvbnN0IHJlcG9NYXRjaCA9IGlzc3VlVVJMLm1hdGNoKCAvcGhldHNpbXNcXC8oW1xcdy1dKylcXC9pc3N1ZXMvICk7XG4gICAgY29uc3QgaXNzdWVOdW1iZXJNYXRjaCA9IGlzc3VlVVJMLm1hdGNoKCAvcGhldHNpbXNcXC9bXFx3LV0rXFwvaXNzdWVzXFwvKFxcZCspLyApO1xuXG4gICAgaWYgKCAhcmVwb01hdGNoIHx8ICFpc3N1ZU51bWJlck1hdGNoICkge1xuICAgICAgY29uc29sZS5lcnJvciggJ3VuZXhwZWN0ZWQgaXNzdWUgVVJMOicsIGlzc3VlVVJMICk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCByZXBvID0gcmVwb01hdGNoWyAxIF07XG4gICAgY29uc3QgaXNzdWVOdW1iZXIgPSBpc3N1ZU51bWJlck1hdGNoWyAxIF07XG5cbiAgICAvLyBGb3IgcmVmZXJlbmNlLCBzZWUgaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vcmVzdC9pc3N1ZXMvaXNzdWVzP2FwaVZlcnNpb249MjAyMi0xMS0yOCN1cGRhdGUtYW4taXNzdWVcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBvY3Rva2l0LnJlcXVlc3QoICdHRVQgL3JlcG9zL3tvd25lcn0ve3JlcG99L2lzc3Vlcy97aXNzdWVfbnVtYmVyfScsIHtcbiAgICAgICAgb3duZXI6ICdwaGV0c2ltcycsXG4gICAgICAgIHJlcG86IHJlcG8sXG4gICAgICAgIGlzc3VlX251bWJlcjogaXNzdWVOdW1iZXJcbiAgICAgIH0gKTtcbiAgICAgIGlmICggcmVzcG9uc2UuZGF0YS5zdGF0ZSA9PT0gJ2Nsb3NlZCcgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBgVE9ETyBsaW5raW5nIHRvIGNsb3NlZCBpc3N1ZTogJHtpc3N1ZVVSTH1gICk7XG4gICAgICAgIGF3YWl0IG9jdG9raXQucmVxdWVzdCggJ1BBVENIIC9yZXBvcy97b3duZXJ9L3tyZXBvfS9pc3N1ZXMve2lzc3VlX251bWJlcn0nLCB7XG4gICAgICAgICAgb3duZXI6ICdwaGV0c2ltcycsXG4gICAgICAgICAgcmVwbzogcmVwbyxcbiAgICAgICAgICBpc3N1ZV9udW1iZXI6IGlzc3VlTnVtYmVyLFxuICAgICAgICAgIHN0YXRlOiAnb3BlbidcbiAgICAgICAgfSApO1xuICAgICAgICBhd2FpdCBvY3Rva2l0LnJlcXVlc3QoICdQT1NUIC9yZXBvcy97b3duZXJ9L3tyZXBvfS9pc3N1ZXMve2lzc3VlX251bWJlcn0vY29tbWVudHMnLCB7XG4gICAgICAgICAgb3duZXI6ICdwaGV0c2ltcycsXG4gICAgICAgICAgcmVwbzogcmVwbyxcbiAgICAgICAgICBpc3N1ZV9udW1iZXI6IGlzc3VlTnVtYmVyLFxuICAgICAgICAgIGJvZHk6ICdSZW9wZW5pbmcgYmVjYXVzZSB0aGVyZSBpcyBhIFRPRE8gbWFya2VkIGZvciB0aGlzIGlzc3VlLidcbiAgICAgICAgfSApO1xuICAgICAgICByZW9wZW5lZENvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICAgIGNhdGNoKCBlICkge1xuICAgICAgY29uc29sZS5lcnJvciggJ0lzc3VlIGRvZXMgbm90IGV4aXN0JywgYCR7cmVwb30jJHtpc3N1ZU51bWJlcn1gLCBlICk7XG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKCBgRmluaXNoZWQuIFJlb3BlbmVkICR7cmVvcGVuZWRDb3VudH0vJHt1bmlxdWVUT0RPSXNzdWVzLmxlbmd0aH0gaXNzdWVzYCApO1xufSApKCk7Il0sIm5hbWVzIjpbIk9jdG9raXQiLCJmcyIsIl8iLCJwcm9jZXNzIiwiYnVpbGRMb2NhbCIsImNyZWF0ZURpcmVjdG9yeSIsImdldFJlcG9MaXN0IiwibGludCIsIkNISVBQRVJfRElTVF9FU0xJTlQiLCJUT0RPc0ZpbGVuYW1lIiwiZW52Iiwic2F2ZVRPRE9Jc3N1ZXMiLCJleGlzdHNTeW5jIiwid3JpdGVGaWxlU3luYyIsImNvbnNvbGUiLCJsb2ciLCJmaWx0ZXIiLCJyZXBvIiwiY2xlYW4iLCJlIiwiZXJyb3IiLCJleGl0IiwiVE9ET0lzc3VlcyIsInJlYWRGaWxlU3luYyIsInRvU3RyaW5nIiwidHJpbSIsInNwbGl0IiwidW5pcXVlVE9ET0lzc3VlcyIsInVuaXEiLCJsZW5ndGgiLCJvY3Rva2l0IiwiYXV0aCIsInBoZXREZXZHaXRIdWJBY2Nlc3NUb2tlbiIsInJlb3BlbmVkQ291bnQiLCJpIiwiaXNzdWVVUkwiLCJyZXBvTWF0Y2giLCJtYXRjaCIsImlzc3VlTnVtYmVyTWF0Y2giLCJpc3N1ZU51bWJlciIsInJlc3BvbnNlIiwicmVxdWVzdCIsIm93bmVyIiwiaXNzdWVfbnVtYmVyIiwiZGF0YSIsInN0YXRlIiwiYm9keSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFakQsT0FBT0Es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