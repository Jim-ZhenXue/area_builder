// Copyright 2021, University of Colorado Boulder
/**
 * Generally a "one-stop shop" for all things needed to update the PhET Codebase. This will:
 * - clone missing repos
 * - pull all repos
 * - set up tracking to the remote (only if needed)
 * - npm update in chipper/perennial/perennial-alias
 * - transpile (see --transpile)
 * - Conduct pull and tracking on all branches associated with the repo (see --allBranches) (useful for doing batch MRs)
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
const cloneMissingRepos = require('../common/cloneMissingRepos');
const execute = require('../common/execute').default;
const getActiveRepos = require('../common/getActiveRepos');
const getBranches = require('../common/getBranches');
const gitCheckout = require('../common/gitCheckout');
const gitFetch = require('../common/gitFetch');
const gitIsClean = require('../common/gitIsClean');
const gitPullRebase = require('../common/gitPullRebase');
const gitRevParse = require('../common/gitRevParse');
const npmUpdate = require('../common/npmUpdate');
const transpileAll = require('../common/transpileAll');
const winston = require('winston');
const _ = require('lodash');
winston.default.transports.console.level = 'error';
// If this is provided, we'll track ALL remote branches, check them out, and pull them (with rebase)
const allBranches = process.argv.includes('--allBranches');
// Additionally run the transpiler after pulling
const transpile = process.argv.includes('--transpile');
// Log all repos, even if nothing changed with them.
const allRepos = process.argv.includes('--all');
// Pulling repos in parallel doesn't work on Windows git.  This is a workaround for that.
const slowPull = process.argv.includes('--slowPull');
// ANSI escape sequences to move to the right (in the same line) or to apply or reset colors
const moveRight = ' \u001b[42G';
const red = '\u001b[31m';
const green = '\u001b[32m';
const reset = '\u001b[0m';
const repos = getActiveRepos();
const data = {};
const getStatus = /*#__PURE__*/ _async_to_generator(function*(repo) {
    data[repo] = '';
    try {
        if (yield gitIsClean(repo)) {
            if (allBranches) {
                const branches = yield getBranches(repo);
                for (const branch of branches){
                    // Only track the remote branch if it hasn't been tracked yet
                    if ((yield execute('git', [
                        'rev-parse',
                        '--verify',
                        branch
                    ], `../${repo}`, {
                        errors: 'resolve'
                    })).code !== 0) {
                        yield gitFetch(repo);
                        yield execute('git', [
                            'branch',
                            '--track',
                            branch,
                            `origin/${branch}`
                        ], `../${repo}`);
                    }
                    yield gitCheckout(repo, branch);
                    try {
                        yield gitPullRebase(repo);
                    } catch (e) {
                        // Likely there is no tracking info set up on the local branch
                        yield execute('git', [
                            'branch',
                            `--set-upstream-to=origin/${branch}`,
                            branch
                        ], `../${repo}`);
                        yield gitPullRebase(repo);
                    }
                }
                // Go back to main
                yield gitCheckout(repo, 'main');
            } else {
                yield gitCheckout(repo, 'main');
                yield gitPullRebase(repo);
            }
        } else if (repo === 'perennial') {
            console.log(`${red}perennial is not clean, skipping pull${reset}`);
        }
        if (repo === 'perennial') {
            yield cloneMissingRepos();
        }
        const symbolicRef = (yield execute('git', [
            'symbolic-ref',
            '-q',
            'HEAD'
        ], `../${repo}`)).trim();
        const branch = symbolicRef.replace('refs/heads/', ''); // might be empty string
        const sha = yield gitRevParse(repo, 'HEAD');
        const status = yield execute('git', [
            'status',
            '--porcelain'
        ], `../${repo}`);
        const track = branch ? (yield execute('git', [
            'for-each-ref',
            '--format=%(push:track,nobracket)',
            symbolicRef
        ], `../${repo}`)).trim() : '';
        let isGreen = false;
        if (branch) {
            isGreen = !status && branch === 'main' && !track.length;
            if (!isGreen || allRepos) {
                data[repo] += `${repo}${moveRight}${isGreen ? green : red}${branch}${reset} ${track}\n`;
            }
        } else {
            // if no branch, print our SHA (detached head)
            data[repo] += `${repo}${moveRight}${red}${sha}${reset}\n`;
        }
        if (status) {
            if (!isGreen || allRepos) {
                data[repo] += status + '\n';
            }
        }
    } catch (e) {
        data[repo] += `${repo} ERROR: ${e}`;
    }
});
_async_to_generator(function*() {
    if (slowPull) {
        // Await each repo to pull them in sequence.
        for (const repo of repos){
            // Pulling slowly takes a while so it is nice to see some progress output.
            process.stdout.write(`Pulling ${repo}...\n`);
            yield getStatus(repo);
        }
    } else {
        yield Promise.all(repos.map((repo)=>getStatus(repo)));
    }
    repos.forEach((repo)=>{
        process.stdout.write(data[repo]);
    });
    console.log(`${_.every(repos, (repo)=>!data[repo].length) ? green : red}-----=====] finished pulls [=====-----${reset}\n`);
    yield npmUpdate('chipper');
    yield npmUpdate('perennial');
    yield npmUpdate('perennial-alias');
    console.log(`${_.every(repos, (repo)=>!data[repo].length) ? green : red}-----=====] finished npm [=====-----${reset}\n`);
    if (transpile) {
        yield transpileAll();
        console.log(`${_.every(repos, (repo)=>!data[repo].length) ? green : red}-----=====] finished transpile [=====-----${reset}\n`);
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL21haW4tcHVsbC1zdGF0dXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEdlbmVyYWxseSBhIFwib25lLXN0b3Agc2hvcFwiIGZvciBhbGwgdGhpbmdzIG5lZWRlZCB0byB1cGRhdGUgdGhlIFBoRVQgQ29kZWJhc2UuIFRoaXMgd2lsbDpcbiAqIC0gY2xvbmUgbWlzc2luZyByZXBvc1xuICogLSBwdWxsIGFsbCByZXBvc1xuICogLSBzZXQgdXAgdHJhY2tpbmcgdG8gdGhlIHJlbW90ZSAob25seSBpZiBuZWVkZWQpXG4gKiAtIG5wbSB1cGRhdGUgaW4gY2hpcHBlci9wZXJlbm5pYWwvcGVyZW5uaWFsLWFsaWFzXG4gKiAtIHRyYW5zcGlsZSAoc2VlIC0tdHJhbnNwaWxlKVxuICogLSBDb25kdWN0IHB1bGwgYW5kIHRyYWNraW5nIG9uIGFsbCBicmFuY2hlcyBhc3NvY2lhdGVkIHdpdGggdGhlIHJlcG8gKHNlZSAtLWFsbEJyYW5jaGVzKSAodXNlZnVsIGZvciBkb2luZyBiYXRjaCBNUnMpXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGNsb25lTWlzc2luZ1JlcG9zID0gcmVxdWlyZSggJy4uL2NvbW1vbi9jbG9uZU1pc3NpbmdSZXBvcycgKTtcbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi4vY29tbW9uL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGdldEFjdGl2ZVJlcG9zID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRBY3RpdmVSZXBvcycgKTtcbmNvbnN0IGdldEJyYW5jaGVzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRCcmFuY2hlcycgKTtcbmNvbnN0IGdpdENoZWNrb3V0ID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRDaGVja291dCcgKTtcbmNvbnN0IGdpdEZldGNoID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRGZXRjaCcgKTtcbmNvbnN0IGdpdElzQ2xlYW4gPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdElzQ2xlYW4nICk7XG5jb25zdCBnaXRQdWxsUmViYXNlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRQdWxsUmViYXNlJyApO1xuY29uc3QgZ2l0UmV2UGFyc2UgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdFJldlBhcnNlJyApO1xuY29uc3QgbnBtVXBkYXRlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9ucG1VcGRhdGUnICk7XG5jb25zdCB0cmFuc3BpbGVBbGwgPSByZXF1aXJlKCAnLi4vY29tbW9uL3RyYW5zcGlsZUFsbCcgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuXG53aW5zdG9uLmRlZmF1bHQudHJhbnNwb3J0cy5jb25zb2xlLmxldmVsID0gJ2Vycm9yJztcblxuLy8gSWYgdGhpcyBpcyBwcm92aWRlZCwgd2UnbGwgdHJhY2sgQUxMIHJlbW90ZSBicmFuY2hlcywgY2hlY2sgdGhlbSBvdXQsIGFuZCBwdWxsIHRoZW0gKHdpdGggcmViYXNlKVxuY29uc3QgYWxsQnJhbmNoZXMgPSBwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoICctLWFsbEJyYW5jaGVzJyApO1xuXG4vLyBBZGRpdGlvbmFsbHkgcnVuIHRoZSB0cmFuc3BpbGVyIGFmdGVyIHB1bGxpbmdcbmNvbnN0IHRyYW5zcGlsZSA9IHByb2Nlc3MuYXJndi5pbmNsdWRlcyggJy0tdHJhbnNwaWxlJyApO1xuXG4vLyBMb2cgYWxsIHJlcG9zLCBldmVuIGlmIG5vdGhpbmcgY2hhbmdlZCB3aXRoIHRoZW0uXG5jb25zdCBhbGxSZXBvcyA9IHByb2Nlc3MuYXJndi5pbmNsdWRlcyggJy0tYWxsJyApO1xuXG4vLyBQdWxsaW5nIHJlcG9zIGluIHBhcmFsbGVsIGRvZXNuJ3Qgd29yayBvbiBXaW5kb3dzIGdpdC4gIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciB0aGF0LlxuY29uc3Qgc2xvd1B1bGwgPSBwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoICctLXNsb3dQdWxsJyApO1xuXG4vLyBBTlNJIGVzY2FwZSBzZXF1ZW5jZXMgdG8gbW92ZSB0byB0aGUgcmlnaHQgKGluIHRoZSBzYW1lIGxpbmUpIG9yIHRvIGFwcGx5IG9yIHJlc2V0IGNvbG9yc1xuY29uc3QgbW92ZVJpZ2h0ID0gJyBcXHUwMDFiWzQyRyc7XG5jb25zdCByZWQgPSAnXFx1MDAxYlszMW0nO1xuY29uc3QgZ3JlZW4gPSAnXFx1MDAxYlszMm0nO1xuY29uc3QgcmVzZXQgPSAnXFx1MDAxYlswbSc7XG5cbmNvbnN0IHJlcG9zID0gZ2V0QWN0aXZlUmVwb3MoKTtcbmNvbnN0IGRhdGEgPSB7fTtcblxuY29uc3QgZ2V0U3RhdHVzID0gYXN5bmMgcmVwbyA9PiB7XG4gIGRhdGFbIHJlcG8gXSA9ICcnO1xuXG4gIHRyeSB7XG4gICAgaWYgKCBhd2FpdCBnaXRJc0NsZWFuKCByZXBvICkgKSB7XG4gICAgICBpZiAoIGFsbEJyYW5jaGVzICkge1xuICAgICAgICBjb25zdCBicmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzKCByZXBvICk7XG4gICAgICAgIGZvciAoIGNvbnN0IGJyYW5jaCBvZiBicmFuY2hlcyApIHtcbiAgICAgICAgICAvLyBPbmx5IHRyYWNrIHRoZSByZW1vdGUgYnJhbmNoIGlmIGl0IGhhc24ndCBiZWVuIHRyYWNrZWQgeWV0XG4gICAgICAgICAgaWYgKCAoIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdyZXYtcGFyc2UnLCAnLS12ZXJpZnknLCBicmFuY2ggXSwgYC4uLyR7cmVwb31gLCB7IGVycm9yczogJ3Jlc29sdmUnIH0gKSApLmNvZGUgIT09IDAgKSB7XG4gICAgICAgICAgICBhd2FpdCBnaXRGZXRjaCggcmVwbyApO1xuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2JyYW5jaCcsICctLXRyYWNrJywgYnJhbmNoLCBgb3JpZ2luLyR7YnJhbmNofWAgXSwgYC4uLyR7cmVwb31gICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCByZXBvLCBicmFuY2ggKTtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBnaXRQdWxsUmViYXNlKCByZXBvICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhdGNoKCBlICkge1xuXG4gICAgICAgICAgICAvLyBMaWtlbHkgdGhlcmUgaXMgbm8gdHJhY2tpbmcgaW5mbyBzZXQgdXAgb24gdGhlIGxvY2FsIGJyYW5jaFxuICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2JyYW5jaCcsIGAtLXNldC11cHN0cmVhbS10bz1vcmlnaW4vJHticmFuY2h9YCwgYnJhbmNoIF0sIGAuLi8ke3JlcG99YCApO1xuICAgICAgICAgICAgYXdhaXQgZ2l0UHVsbFJlYmFzZSggcmVwbyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdvIGJhY2sgdG8gbWFpblxuICAgICAgICBhd2FpdCBnaXRDaGVja291dCggcmVwbywgJ21haW4nICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHJlcG8sICdtYWluJyApO1xuICAgICAgICBhd2FpdCBnaXRQdWxsUmViYXNlKCByZXBvICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCByZXBvID09PSAncGVyZW5uaWFsJyApIHtcbiAgICAgIGNvbnNvbGUubG9nKCBgJHtyZWR9cGVyZW5uaWFsIGlzIG5vdCBjbGVhbiwgc2tpcHBpbmcgcHVsbCR7cmVzZXR9YCApO1xuICAgIH1cblxuICAgIGlmICggcmVwbyA9PT0gJ3BlcmVubmlhbCcgKSB7XG4gICAgICBhd2FpdCBjbG9uZU1pc3NpbmdSZXBvcygpO1xuICAgIH1cblxuICAgIGNvbnN0IHN5bWJvbGljUmVmID0gKCBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnc3ltYm9saWMtcmVmJywgJy1xJywgJ0hFQUQnIF0sIGAuLi8ke3JlcG99YCApICkudHJpbSgpO1xuICAgIGNvbnN0IGJyYW5jaCA9IHN5bWJvbGljUmVmLnJlcGxhY2UoICdyZWZzL2hlYWRzLycsICcnICk7IC8vIG1pZ2h0IGJlIGVtcHR5IHN0cmluZ1xuICAgIGNvbnN0IHNoYSA9IGF3YWl0IGdpdFJldlBhcnNlKCByZXBvLCAnSEVBRCcgKTtcbiAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnc3RhdHVzJywgJy0tcG9yY2VsYWluJyBdLCBgLi4vJHtyZXBvfWAgKTtcbiAgICBjb25zdCB0cmFjayA9IGJyYW5jaCA/ICggYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2Zvci1lYWNoLXJlZicsICctLWZvcm1hdD0lKHB1c2g6dHJhY2ssbm9icmFja2V0KScsIHN5bWJvbGljUmVmIF0sIGAuLi8ke3JlcG99YCApICkudHJpbSgpIDogJyc7XG5cbiAgICBsZXQgaXNHcmVlbiA9IGZhbHNlO1xuICAgIGlmICggYnJhbmNoICkge1xuICAgICAgaXNHcmVlbiA9ICFzdGF0dXMgJiYgYnJhbmNoID09PSAnbWFpbicgJiYgIXRyYWNrLmxlbmd0aDtcblxuICAgICAgaWYgKCAhaXNHcmVlbiB8fCBhbGxSZXBvcyApIHtcbiAgICAgICAgZGF0YVsgcmVwbyBdICs9IGAke3JlcG99JHttb3ZlUmlnaHR9JHtpc0dyZWVuID8gZ3JlZW4gOiByZWR9JHticmFuY2h9JHtyZXNldH0gJHt0cmFja31cXG5gO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGlmIG5vIGJyYW5jaCwgcHJpbnQgb3VyIFNIQSAoZGV0YWNoZWQgaGVhZClcbiAgICAgIGRhdGFbIHJlcG8gXSArPSBgJHtyZXBvfSR7bW92ZVJpZ2h0fSR7cmVkfSR7c2hhfSR7cmVzZXR9XFxuYDtcbiAgICB9XG5cbiAgICBpZiAoIHN0YXR1cyApIHtcbiAgICAgIGlmICggIWlzR3JlZW4gfHwgYWxsUmVwb3MgKSB7XG4gICAgICAgIGRhdGFbIHJlcG8gXSArPSBzdGF0dXMgKyAnXFxuJztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgZGF0YVsgcmVwbyBdICs9IGAke3JlcG99IEVSUk9SOiAke2V9YDtcbiAgfVxufTtcblxuKCBhc3luYyAoKSA9PiB7XG5cbiAgaWYgKCBzbG93UHVsbCApIHtcblxuICAgIC8vIEF3YWl0IGVhY2ggcmVwbyB0byBwdWxsIHRoZW0gaW4gc2VxdWVuY2UuXG4gICAgZm9yICggY29uc3QgcmVwbyBvZiByZXBvcyApIHtcblxuICAgICAgLy8gUHVsbGluZyBzbG93bHkgdGFrZXMgYSB3aGlsZSBzbyBpdCBpcyBuaWNlIHRvIHNlZSBzb21lIHByb2dyZXNzIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCBgUHVsbGluZyAke3JlcG99Li4uXFxuYCApO1xuXG4gICAgICBhd2FpdCBnZXRTdGF0dXMoIHJlcG8gKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoIHJlcG9zLm1hcCggcmVwbyA9PiBnZXRTdGF0dXMoIHJlcG8gKSApICk7XG4gIH1cblxuICByZXBvcy5mb3JFYWNoKCByZXBvID0+IHtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSggZGF0YVsgcmVwbyBdICk7XG4gIH0gKTtcblxuICBjb25zb2xlLmxvZyggYCR7Xy5ldmVyeSggcmVwb3MsIHJlcG8gPT4gIWRhdGFbIHJlcG8gXS5sZW5ndGggKSA/IGdyZWVuIDogcmVkfS0tLS0tPT09PT1dIGZpbmlzaGVkIHB1bGxzIFs9PT09PS0tLS0tJHtyZXNldH1cXG5gICk7XG5cbiAgYXdhaXQgbnBtVXBkYXRlKCAnY2hpcHBlcicgKTtcbiAgYXdhaXQgbnBtVXBkYXRlKCAncGVyZW5uaWFsJyApO1xuICBhd2FpdCBucG1VcGRhdGUoICdwZXJlbm5pYWwtYWxpYXMnICk7XG5cbiAgY29uc29sZS5sb2coIGAke18uZXZlcnkoIHJlcG9zLCByZXBvID0+ICFkYXRhWyByZXBvIF0ubGVuZ3RoICkgPyBncmVlbiA6IHJlZH0tLS0tLT09PT09XSBmaW5pc2hlZCBucG0gWz09PT09LS0tLS0ke3Jlc2V0fVxcbmAgKTtcblxuICBpZiAoIHRyYW5zcGlsZSApIHtcbiAgICBhd2FpdCB0cmFuc3BpbGVBbGwoKTtcblxuICAgIGNvbnNvbGUubG9nKCBgJHtfLmV2ZXJ5KCByZXBvcywgcmVwbyA9PiAhZGF0YVsgcmVwbyBdLmxlbmd0aCApID8gZ3JlZW4gOiByZWR9LS0tLS09PT09PV0gZmluaXNoZWQgdHJhbnNwaWxlIFs9PT09PS0tLS0tJHtyZXNldH1cXG5gICk7XG4gIH1cbn0gKSgpOyJdLCJuYW1lcyI6WyJjbG9uZU1pc3NpbmdSZXBvcyIsInJlcXVpcmUiLCJleGVjdXRlIiwiZGVmYXVsdCIsImdldEFjdGl2ZVJlcG9zIiwiZ2V0QnJhbmNoZXMiLCJnaXRDaGVja291dCIsImdpdEZldGNoIiwiZ2l0SXNDbGVhbiIsImdpdFB1bGxSZWJhc2UiLCJnaXRSZXZQYXJzZSIsIm5wbVVwZGF0ZSIsInRyYW5zcGlsZUFsbCIsIndpbnN0b24iLCJfIiwidHJhbnNwb3J0cyIsImNvbnNvbGUiLCJsZXZlbCIsImFsbEJyYW5jaGVzIiwicHJvY2VzcyIsImFyZ3YiLCJpbmNsdWRlcyIsInRyYW5zcGlsZSIsImFsbFJlcG9zIiwic2xvd1B1bGwiLCJtb3ZlUmlnaHQiLCJyZWQiLCJncmVlbiIsInJlc2V0IiwicmVwb3MiLCJkYXRhIiwiZ2V0U3RhdHVzIiwicmVwbyIsImJyYW5jaGVzIiwiYnJhbmNoIiwiZXJyb3JzIiwiY29kZSIsImUiLCJsb2ciLCJzeW1ib2xpY1JlZiIsInRyaW0iLCJyZXBsYWNlIiwic2hhIiwic3RhdHVzIiwidHJhY2siLCJpc0dyZWVuIiwibGVuZ3RoIiwic3Rkb3V0Iiwid3JpdGUiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiZm9yRWFjaCIsImV2ZXJ5Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7Ozs7Q0FVQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxvQkFBb0JDLFFBQVM7QUFDbkMsTUFBTUMsVUFBVUQsUUFBUyxxQkFBc0JFLE9BQU87QUFDdEQsTUFBTUMsaUJBQWlCSCxRQUFTO0FBQ2hDLE1BQU1JLGNBQWNKLFFBQVM7QUFDN0IsTUFBTUssY0FBY0wsUUFBUztBQUM3QixNQUFNTSxXQUFXTixRQUFTO0FBQzFCLE1BQU1PLGFBQWFQLFFBQVM7QUFDNUIsTUFBTVEsZ0JBQWdCUixRQUFTO0FBQy9CLE1BQU1TLGNBQWNULFFBQVM7QUFDN0IsTUFBTVUsWUFBWVYsUUFBUztBQUMzQixNQUFNVyxlQUFlWCxRQUFTO0FBQzlCLE1BQU1ZLFVBQVVaLFFBQVM7QUFDekIsTUFBTWEsSUFBSWIsUUFBUztBQUVuQlksUUFBUVYsT0FBTyxDQUFDWSxVQUFVLENBQUNDLE9BQU8sQ0FBQ0MsS0FBSyxHQUFHO0FBRTNDLG9HQUFvRztBQUNwRyxNQUFNQyxjQUFjQyxRQUFRQyxJQUFJLENBQUNDLFFBQVEsQ0FBRTtBQUUzQyxnREFBZ0Q7QUFDaEQsTUFBTUMsWUFBWUgsUUFBUUMsSUFBSSxDQUFDQyxRQUFRLENBQUU7QUFFekMsb0RBQW9EO0FBQ3BELE1BQU1FLFdBQVdKLFFBQVFDLElBQUksQ0FBQ0MsUUFBUSxDQUFFO0FBRXhDLHlGQUF5RjtBQUN6RixNQUFNRyxXQUFXTCxRQUFRQyxJQUFJLENBQUNDLFFBQVEsQ0FBRTtBQUV4Qyw0RkFBNEY7QUFDNUYsTUFBTUksWUFBWTtBQUNsQixNQUFNQyxNQUFNO0FBQ1osTUFBTUMsUUFBUTtBQUNkLE1BQU1DLFFBQVE7QUFFZCxNQUFNQyxRQUFRekI7QUFDZCxNQUFNMEIsT0FBTyxDQUFDO0FBRWQsTUFBTUMsOENBQVksVUFBTUM7SUFDdEJGLElBQUksQ0FBRUUsS0FBTSxHQUFHO0lBRWYsSUFBSTtRQUNGLElBQUssTUFBTXhCLFdBQVl3QixPQUFTO1lBQzlCLElBQUtkLGFBQWM7Z0JBQ2pCLE1BQU1lLFdBQVcsTUFBTTVCLFlBQWEyQjtnQkFDcEMsS0FBTSxNQUFNRSxVQUFVRCxTQUFXO29CQUMvQiw2REFBNkQ7b0JBQzdELElBQUssQUFBRSxDQUFBLE1BQU0vQixRQUFTLE9BQU87d0JBQUU7d0JBQWE7d0JBQVlnQztxQkFBUSxFQUFFLENBQUMsR0FBRyxFQUFFRixNQUFNLEVBQUU7d0JBQUVHLFFBQVE7b0JBQVUsRUFBRSxFQUFJQyxJQUFJLEtBQUssR0FBSTt3QkFDckgsTUFBTTdCLFNBQVV5Qjt3QkFDaEIsTUFBTTlCLFFBQVMsT0FBTzs0QkFBRTs0QkFBVTs0QkFBV2dDOzRCQUFRLENBQUMsT0FBTyxFQUFFQSxRQUFRO3lCQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUVGLE1BQU07b0JBQ3pGO29CQUNBLE1BQU0xQixZQUFhMEIsTUFBTUU7b0JBRXpCLElBQUk7d0JBQ0YsTUFBTXpCLGNBQWV1QjtvQkFDdkIsRUFDQSxPQUFPSyxHQUFJO3dCQUVULDhEQUE4RDt3QkFDOUQsTUFBTW5DLFFBQVMsT0FBTzs0QkFBRTs0QkFBVSxDQUFDLHlCQUF5QixFQUFFZ0MsUUFBUTs0QkFBRUE7eUJBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRUYsTUFBTTt3QkFDOUYsTUFBTXZCLGNBQWV1QjtvQkFDdkI7Z0JBQ0Y7Z0JBRUEsa0JBQWtCO2dCQUNsQixNQUFNMUIsWUFBYTBCLE1BQU07WUFDM0IsT0FDSztnQkFDSCxNQUFNMUIsWUFBYTBCLE1BQU07Z0JBQ3pCLE1BQU12QixjQUFldUI7WUFDdkI7UUFDRixPQUNLLElBQUtBLFNBQVMsYUFBYztZQUMvQmhCLFFBQVFzQixHQUFHLENBQUUsR0FBR1osSUFBSSxxQ0FBcUMsRUFBRUUsT0FBTztRQUNwRTtRQUVBLElBQUtJLFNBQVMsYUFBYztZQUMxQixNQUFNaEM7UUFDUjtRQUVBLE1BQU11QyxjQUFjLEFBQUUsQ0FBQSxNQUFNckMsUUFBUyxPQUFPO1lBQUU7WUFBZ0I7WUFBTTtTQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUU4QixNQUFNLENBQUMsRUFBSVEsSUFBSTtRQUNuRyxNQUFNTixTQUFTSyxZQUFZRSxPQUFPLENBQUUsZUFBZSxLQUFNLHdCQUF3QjtRQUNqRixNQUFNQyxNQUFNLE1BQU1oQyxZQUFhc0IsTUFBTTtRQUNyQyxNQUFNVyxTQUFTLE1BQU16QyxRQUFTLE9BQU87WUFBRTtZQUFVO1NBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRThCLE1BQU07UUFDOUUsTUFBTVksUUFBUVYsU0FBUyxBQUFFLENBQUEsTUFBTWhDLFFBQVMsT0FBTztZQUFFO1lBQWdCO1lBQW9DcUM7U0FBYSxFQUFFLENBQUMsR0FBRyxFQUFFUCxNQUFNLENBQUMsRUFBSVEsSUFBSSxLQUFLO1FBRTlJLElBQUlLLFVBQVU7UUFDZCxJQUFLWCxRQUFTO1lBQ1pXLFVBQVUsQ0FBQ0YsVUFBVVQsV0FBVyxVQUFVLENBQUNVLE1BQU1FLE1BQU07WUFFdkQsSUFBSyxDQUFDRCxXQUFXdEIsVUFBVztnQkFDMUJPLElBQUksQ0FBRUUsS0FBTSxJQUFJLEdBQUdBLE9BQU9QLFlBQVlvQixVQUFVbEIsUUFBUUQsTUFBTVEsU0FBU04sTUFBTSxDQUFDLEVBQUVnQixNQUFNLEVBQUUsQ0FBQztZQUMzRjtRQUNGLE9BQ0s7WUFDSCw4Q0FBOEM7WUFDOUNkLElBQUksQ0FBRUUsS0FBTSxJQUFJLEdBQUdBLE9BQU9QLFlBQVlDLE1BQU1nQixNQUFNZCxNQUFNLEVBQUUsQ0FBQztRQUM3RDtRQUVBLElBQUtlLFFBQVM7WUFDWixJQUFLLENBQUNFLFdBQVd0QixVQUFXO2dCQUMxQk8sSUFBSSxDQUFFRSxLQUFNLElBQUlXLFNBQVM7WUFDM0I7UUFDRjtJQUNGLEVBQ0EsT0FBT04sR0FBSTtRQUNUUCxJQUFJLENBQUVFLEtBQU0sSUFBSSxHQUFHQSxLQUFLLFFBQVEsRUFBRUssR0FBRztJQUN2QztBQUNGO0FBRUUsb0JBQUE7SUFFQSxJQUFLYixVQUFXO1FBRWQsNENBQTRDO1FBQzVDLEtBQU0sTUFBTVEsUUFBUUgsTUFBUTtZQUUxQiwwRUFBMEU7WUFDMUVWLFFBQVE0QixNQUFNLENBQUNDLEtBQUssQ0FBRSxDQUFDLFFBQVEsRUFBRWhCLEtBQUssS0FBSyxDQUFDO1lBRTVDLE1BQU1ELFVBQVdDO1FBQ25CO0lBQ0YsT0FDSztRQUNILE1BQU1pQixRQUFRQyxHQUFHLENBQUVyQixNQUFNc0IsR0FBRyxDQUFFbkIsQ0FBQUEsT0FBUUQsVUFBV0M7SUFDbkQ7SUFFQUgsTUFBTXVCLE9BQU8sQ0FBRXBCLENBQUFBO1FBQ2JiLFFBQVE0QixNQUFNLENBQUNDLEtBQUssQ0FBRWxCLElBQUksQ0FBRUUsS0FBTTtJQUNwQztJQUVBaEIsUUFBUXNCLEdBQUcsQ0FBRSxHQUFHeEIsRUFBRXVDLEtBQUssQ0FBRXhCLE9BQU9HLENBQUFBLE9BQVEsQ0FBQ0YsSUFBSSxDQUFFRSxLQUFNLENBQUNjLE1BQU0sSUFBS25CLFFBQVFELElBQUksc0NBQXNDLEVBQUVFLE1BQU0sRUFBRSxDQUFDO0lBRTlILE1BQU1qQixVQUFXO0lBQ2pCLE1BQU1BLFVBQVc7SUFDakIsTUFBTUEsVUFBVztJQUVqQkssUUFBUXNCLEdBQUcsQ0FBRSxHQUFHeEIsRUFBRXVDLEtBQUssQ0FBRXhCLE9BQU9HLENBQUFBLE9BQVEsQ0FBQ0YsSUFBSSxDQUFFRSxLQUFNLENBQUNjLE1BQU0sSUFBS25CLFFBQVFELElBQUksb0NBQW9DLEVBQUVFLE1BQU0sRUFBRSxDQUFDO0lBRTVILElBQUtOLFdBQVk7UUFDZixNQUFNVjtRQUVOSSxRQUFRc0IsR0FBRyxDQUFFLEdBQUd4QixFQUFFdUMsS0FBSyxDQUFFeEIsT0FBT0csQ0FBQUEsT0FBUSxDQUFDRixJQUFJLENBQUVFLEtBQU0sQ0FBQ2MsTUFBTSxJQUFLbkIsUUFBUUQsSUFBSSwwQ0FBMEMsRUFBRUUsTUFBTSxFQUFFLENBQUM7SUFDcEk7QUFDRiJ9