// Copyright 2024, University of Colorado Boulder
/**
 * Run ESLint on the specified repos.
 *
 * It is assumed that linting occurs from one level deep in any given repo. This has ramifications for how we write
 * eslint config files across the codebase.
 *
 * This is called from lint.ts which batches into acceptable sizes (too many repos crashes with out of memory).
 * This architecture follows these design principles:
 * 1. Parallelism for speed
 * 2. Batching stdout/stderr instead of streaming, so that multiple processes don't intersperse/interfere
 * 3. Simplicity (using the same algorithm for any number of repos)
 *
 * If you have a small enough batch (say, less than 50 repos), you can run this directly via:
 * cd perennial-alias
 * sage run js/eslint/lint-main.ts --repos=density --clean=false --fix=false
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
import assert from 'assert';
import { ESLint } from 'eslint';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import process from 'process';
import { tscCleanRepo } from '../grunt/typeCheck.js';
import { DEBUG_PHET_LINT } from './lint.js';
// TODO: enable linting for scenery-stack-test, see https://github.com/phetsims/scenery-stack-test/issues/1
// It is problematic for every repo to have a eslint.config.mjs, so it is preferable to opt-out some repos here, see https://github.com/phetsims/chipper/issues/1484
const DO_NOT_LINT = [
    'babel',
    'phet-vite-demo',
    'scenery-stack-test'
];
const getCacheLocation = (repo)=>path.resolve(`../chipper/dist/eslint/cache/${repo}.eslintcache`);
const OLD_CACHE = '../chipper/eslint/cache/';
function lintWithWorkers(repos, fix) {
    return _lintWithWorkers.apply(this, arguments);
}
function _lintWithWorkers() {
    _lintWithWorkers = /**
 * Lints repositories using a worker pool approach.
 */ _async_to_generator(function*(repos, fix) {
        const reposQueue = [
            ...repos.filter((repo)=>!DO_NOT_LINT.includes(repo))
        ];
        const exitCodes = [];
        /**
   * Worker function that continuously processes repositories from the queue.
   */ const worker = /*#__PURE__*/ _async_to_generator(function*() {
            while(true){
                // Synchronize access to the queue
                // Since JavaScript is single-threaded, this is safe
                if (reposQueue.length === 0) {
                    break; // No more repositories to process
                }
                const repo = reposQueue.shift(); // Get the next repository
                const result = yield lintWithNodeAPI(repo, fix);
                exitCodes.push(result);
            }
        });
        // We experimented with different numbers of workers, and 8 seems to be a reasonable number to get good performance
        const numWorkers = 8;
        const workers = _.times(numWorkers, ()=>worker());
        // Wait for all workers to complete
        const results = yield Promise.allSettled(workers);
        // Log any errors to prevent silent failures with exit code 1.
        results.forEach((result)=>result.status === 'rejected' && console.error(result.reason));
        // output true if all succeeded, false if any failed
        return exitCodes.every((code)=>code === 0) && results.every((result)=>result.status === 'fulfilled');
    });
    return _lintWithWorkers.apply(this, arguments);
}
function lintWithNodeAPI(repo, fix) {
    return _lintWithNodeAPI.apply(this, arguments);
}
function _lintWithNodeAPI() {
    _lintWithNodeAPI = /**
 * Runs ESLint on a single repository using the ESLint Node API.
 */ _async_to_generator(function*(repo, fix) {
        // Prepare options for ESLint instance
        const eslintOptions = {
            cwd: path.resolve(`../${repo}`),
            // The --clean wipes the directory at the beginning, so we always want to cache the results of a run.
            cache: true,
            cacheLocation: path.resolve(getCacheLocation(repo)),
            fix: fix,
            flags: [
                'unstable_config_lookup_from_file'
            ],
            errorOnUnmatchedPattern: false
        };
        if (DEBUG_PHET_LINT) {
            console.log('lint-main: fix: ', eslintOptions.fix);
            console.log('lint-main: repo', repo);
        }
        // Create ESLint instance
        const eslint = new ESLint(eslintOptions);
        // Lint files in the repo
        const patterns = [
            './'
        ]; // Lint all files starting from the repo root
        let results;
        try {
            results = yield eslint.lintFiles(patterns);
        } catch (error) {
            console.error(`Error linting files in repo ${repo}:`, error);
            return 1; // Non-zero exit code to indicate failure
        }
        // If fix is enabled, write the fixed files
        if (fix) {
            yield ESLint.outputFixes(results);
        }
        // Output results, prefixed with the repo name
        let loggedRepo = false;
        if (results.length > 0) {
            const formatter = yield eslint.loadFormatter('stylish');
            const resultText = yield formatter.format(results);
            if (resultText.trim().length > 0) {
                if (!loggedRepo) {
                    console.log(`\n${repo}:`);
                    loggedRepo = true;
                }
                console.log(resultText);
            }
        }
        // Determine exit code
        const errorCount = results.reduce((sum, result)=>sum + result.errorCount, 0);
        return errorCount === 0 ? 0 : 1; // Return 0 if no errors, 1 if there are errors
    });
    return _lintWithNodeAPI.apply(this, arguments);
}
const cleanCaches = (originalRepos)=>{
    DEBUG_PHET_LINT && console.log('lint-main clearing: ', originalRepos);
    originalRepos.forEach(/*#__PURE__*/ _async_to_generator(function*(repo) {
        const cacheFile = getCacheLocation(repo);
        try {
            fs.unlinkSync(cacheFile);
        } catch (err) {
            if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
            // Do nothing if the file does not exist
            } else {
                throw err; // Re-throw the error if it's something else
            }
        }
        if (fs.existsSync(path.resolve(`../${repo}/tsconfig.json`))) {
            yield tscCleanRepo(repo);
        }
    }));
};
/**
 * Lints the specified repositories.
 */ const lintMain = /*#__PURE__*/ _async_to_generator(function*(repos, clean, fix) {
    assert(repos.length > 0, 'no repos provided to lint');
    // Clean in advance if requested. During linting the cache will be repopulated.
    clean && cleanCaches(repos);
    handleOldCacheLocation();
    // Top level try-catch just in case.
    try {
        return yield lintWithWorkers(repos, fix);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error running ESLint:', error.message);
            throw error;
        }
    }
    return false;
});
// Even though on main the new cache location is chipper/dist/eslint/cache, linting on old shas still produces a
// cache in chipper/eslint/cache. Delete it eagerly and always when it is there.
function handleOldCacheLocation() {
    try {
        fs.existsSync(OLD_CACHE) && fs.rmSync(OLD_CACHE, {
            recursive: true
        });
    } catch (e) {
        console.error(`error removing old cache location: ${e}`); // Please report these problems to https://github.com/phetsims/chipper/issues/1508
    }
}
/**
 * Use a very strict syntax here to simplify interoperability with the call site. All options are required.
 */ // eslint-disable-next-line no-void
void _async_to_generator(function*() {
    // search argv for --repos=a,b,c
    const reposArg = process.argv.find((arg)=>arg.startsWith('--repos='));
    const cleanArg = process.argv.find((arg)=>arg.startsWith('--clean='));
    const fixArg = process.argv.find((arg)=>arg.startsWith('--fix='));
    assert(reposArg, 'missing --repos argument');
    assert(cleanArg, 'missing --clean argument');
    assert(fixArg, 'missing --fix argument');
    const repos = reposArg ? reposArg.split('=')[1].split(',') : [];
    const clean = cleanArg ? cleanArg.split('=')[1] === 'true' : false;
    const fix = fixArg ? fixArg.split('=')[1] === 'true' : false;
    if (DEBUG_PHET_LINT) {
        console.log('lint-main.ts repos', repos);
        console.log('lint-main.ts clean', clean);
        console.log('lint-main.ts fix', fix);
    }
    const success = yield lintMain(_.uniq(repos), clean, fix);
    process.exit(success ? 0 : 1);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvbGludC1tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSdW4gRVNMaW50IG9uIHRoZSBzcGVjaWZpZWQgcmVwb3MuXG4gKlxuICogSXQgaXMgYXNzdW1lZCB0aGF0IGxpbnRpbmcgb2NjdXJzIGZyb20gb25lIGxldmVsIGRlZXAgaW4gYW55IGdpdmVuIHJlcG8uIFRoaXMgaGFzIHJhbWlmaWNhdGlvbnMgZm9yIGhvdyB3ZSB3cml0ZVxuICogZXNsaW50IGNvbmZpZyBmaWxlcyBhY3Jvc3MgdGhlIGNvZGViYXNlLlxuICpcbiAqIFRoaXMgaXMgY2FsbGVkIGZyb20gbGludC50cyB3aGljaCBiYXRjaGVzIGludG8gYWNjZXB0YWJsZSBzaXplcyAodG9vIG1hbnkgcmVwb3MgY3Jhc2hlcyB3aXRoIG91dCBvZiBtZW1vcnkpLlxuICogVGhpcyBhcmNoaXRlY3R1cmUgZm9sbG93cyB0aGVzZSBkZXNpZ24gcHJpbmNpcGxlczpcbiAqIDEuIFBhcmFsbGVsaXNtIGZvciBzcGVlZFxuICogMi4gQmF0Y2hpbmcgc3Rkb3V0L3N0ZGVyciBpbnN0ZWFkIG9mIHN0cmVhbWluZywgc28gdGhhdCBtdWx0aXBsZSBwcm9jZXNzZXMgZG9uJ3QgaW50ZXJzcGVyc2UvaW50ZXJmZXJlXG4gKiAzLiBTaW1wbGljaXR5ICh1c2luZyB0aGUgc2FtZSBhbGdvcml0aG0gZm9yIGFueSBudW1iZXIgb2YgcmVwb3MpXG4gKlxuICogSWYgeW91IGhhdmUgYSBzbWFsbCBlbm91Z2ggYmF0Y2ggKHNheSwgbGVzcyB0aGFuIDUwIHJlcG9zKSwgeW91IGNhbiBydW4gdGhpcyBkaXJlY3RseSB2aWE6XG4gKiBjZCBwZXJlbm5pYWwtYWxpYXNcbiAqIHNhZ2UgcnVuIGpzL2VzbGludC9saW50LW1haW4udHMgLS1yZXBvcz1kZW5zaXR5IC0tY2xlYW49ZmFsc2UgLS1maXg9ZmFsc2VcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IEVTTGludCB9IGZyb20gJ2VzbGludCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHByb2Nlc3MgZnJvbSAncHJvY2Vzcyc7XG5pbXBvcnQgeyBSZXBvIH0gZnJvbSAnLi4vYnJvd3Nlci1hbmQtbm9kZS9QZXJlbm5pYWxUeXBlcy5qcyc7XG5pbXBvcnQgeyB0c2NDbGVhblJlcG8gfSBmcm9tICcuLi9ncnVudC90eXBlQ2hlY2suanMnO1xuaW1wb3J0IHsgREVCVUdfUEhFVF9MSU5UIH0gZnJvbSAnLi9saW50LmpzJztcblxuLy8gVE9ETzogZW5hYmxlIGxpbnRpbmcgZm9yIHNjZW5lcnktc3RhY2stdGVzdCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXN0YWNrLXRlc3QvaXNzdWVzLzFcbi8vIEl0IGlzIHByb2JsZW1hdGljIGZvciBldmVyeSByZXBvIHRvIGhhdmUgYSBlc2xpbnQuY29uZmlnLm1qcywgc28gaXQgaXMgcHJlZmVyYWJsZSB0byBvcHQtb3V0IHNvbWUgcmVwb3MgaGVyZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xNDg0XG5jb25zdCBET19OT1RfTElOVCA9IFsgJ2JhYmVsJywgJ3BoZXQtdml0ZS1kZW1vJywgJ3NjZW5lcnktc3RhY2stdGVzdCcgXTtcblxuY29uc3QgZ2V0Q2FjaGVMb2NhdGlvbiA9ICggcmVwbzogUmVwbyApID0+IHBhdGgucmVzb2x2ZSggYC4uL2NoaXBwZXIvZGlzdC9lc2xpbnQvY2FjaGUvJHtyZXBvfS5lc2xpbnRjYWNoZWAgKTtcbmNvbnN0IE9MRF9DQUNIRSA9ICcuLi9jaGlwcGVyL2VzbGludC9jYWNoZS8nO1xuXG4vKipcbiAqIExpbnRzIHJlcG9zaXRvcmllcyB1c2luZyBhIHdvcmtlciBwb29sIGFwcHJvYWNoLlxuICovXG5hc3luYyBmdW5jdGlvbiBsaW50V2l0aFdvcmtlcnMoIHJlcG9zOiBSZXBvW10sIGZpeDogYm9vbGVhbiApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgcmVwb3NRdWV1ZTogUmVwb1tdID0gWyAuLi5yZXBvcy5maWx0ZXIoIHJlcG8gPT4gIURPX05PVF9MSU5ULmluY2x1ZGVzKCByZXBvICkgKSBdO1xuICBjb25zdCBleGl0Q29kZXM6IG51bWJlcltdID0gW107XG5cbiAgLyoqXG4gICAqIFdvcmtlciBmdW5jdGlvbiB0aGF0IGNvbnRpbnVvdXNseSBwcm9jZXNzZXMgcmVwb3NpdG9yaWVzIGZyb20gdGhlIHF1ZXVlLlxuICAgKi9cbiAgY29uc3Qgd29ya2VyID0gYXN5bmMgKCkgPT4ge1xuXG4gICAgd2hpbGUgKCB0cnVlICkge1xuXG4gICAgICAvLyBTeW5jaHJvbml6ZSBhY2Nlc3MgdG8gdGhlIHF1ZXVlXG4gICAgICAvLyBTaW5jZSBKYXZhU2NyaXB0IGlzIHNpbmdsZS10aHJlYWRlZCwgdGhpcyBpcyBzYWZlXG4gICAgICBpZiAoIHJlcG9zUXVldWUubGVuZ3RoID09PSAwICkge1xuICAgICAgICBicmVhazsgLy8gTm8gbW9yZSByZXBvc2l0b3JpZXMgdG8gcHJvY2Vzc1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXBvID0gcmVwb3NRdWV1ZS5zaGlmdCgpITsgLy8gR2V0IHRoZSBuZXh0IHJlcG9zaXRvcnlcblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbGludFdpdGhOb2RlQVBJKCByZXBvLCBmaXggKTtcbiAgICAgIGV4aXRDb2Rlcy5wdXNoKCByZXN1bHQgKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gV2UgZXhwZXJpbWVudGVkIHdpdGggZGlmZmVyZW50IG51bWJlcnMgb2Ygd29ya2VycywgYW5kIDggc2VlbXMgdG8gYmUgYSByZWFzb25hYmxlIG51bWJlciB0byBnZXQgZ29vZCBwZXJmb3JtYW5jZVxuICBjb25zdCBudW1Xb3JrZXJzID0gODtcbiAgY29uc3Qgd29ya2VycyA9IF8udGltZXMoIG51bVdvcmtlcnMsICgpID0+IHdvcmtlcigpICk7XG5cbiAgLy8gV2FpdCBmb3IgYWxsIHdvcmtlcnMgdG8gY29tcGxldGVcbiAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZCggd29ya2VycyApO1xuXG4gIC8vIExvZyBhbnkgZXJyb3JzIHRvIHByZXZlbnQgc2lsZW50IGZhaWx1cmVzIHdpdGggZXhpdCBjb2RlIDEuXG4gIHJlc3VsdHMuZm9yRWFjaCggcmVzdWx0ID0+IHJlc3VsdC5zdGF0dXMgPT09ICdyZWplY3RlZCcgJiYgY29uc29sZS5lcnJvciggcmVzdWx0LnJlYXNvbiApICk7XG5cbiAgLy8gb3V0cHV0IHRydWUgaWYgYWxsIHN1Y2NlZWRlZCwgZmFsc2UgaWYgYW55IGZhaWxlZFxuICByZXR1cm4gZXhpdENvZGVzLmV2ZXJ5KCBjb2RlID0+IGNvZGUgPT09IDAgKSAmJiByZXN1bHRzLmV2ZXJ5KCByZXN1bHQgPT4gcmVzdWx0LnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcgKTtcbn1cblxuLyoqXG4gKiBSdW5zIEVTTGludCBvbiBhIHNpbmdsZSByZXBvc2l0b3J5IHVzaW5nIHRoZSBFU0xpbnQgTm9kZSBBUEkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxpbnRXaXRoTm9kZUFQSSggcmVwbzogUmVwbywgZml4OiBib29sZWFuICk6IFByb21pc2U8bnVtYmVyPiB7XG5cbiAgLy8gUHJlcGFyZSBvcHRpb25zIGZvciBFU0xpbnQgaW5zdGFuY2VcbiAgY29uc3QgZXNsaW50T3B0aW9ucyA9IHtcbiAgICBjd2Q6IHBhdGgucmVzb2x2ZSggYC4uLyR7cmVwb31gICksXG5cbiAgICAvLyBUaGUgLS1jbGVhbiB3aXBlcyB0aGUgZGlyZWN0b3J5IGF0IHRoZSBiZWdpbm5pbmcsIHNvIHdlIGFsd2F5cyB3YW50IHRvIGNhY2hlIHRoZSByZXN1bHRzIG9mIGEgcnVuLlxuICAgIGNhY2hlOiB0cnVlLFxuICAgIGNhY2hlTG9jYXRpb246IHBhdGgucmVzb2x2ZSggZ2V0Q2FjaGVMb2NhdGlvbiggcmVwbyApICksXG4gICAgZml4OiBmaXgsXG4gICAgZmxhZ3M6IFsgJ3Vuc3RhYmxlX2NvbmZpZ19sb29rdXBfZnJvbV9maWxlJyBdLFxuICAgIGVycm9yT25Vbm1hdGNoZWRQYXR0ZXJuOiBmYWxzZVxuICB9O1xuXG4gIGlmICggREVCVUdfUEhFVF9MSU5UICkge1xuICAgIGNvbnNvbGUubG9nKCAnbGludC1tYWluOiBmaXg6ICcsIGVzbGludE9wdGlvbnMuZml4ICk7XG4gICAgY29uc29sZS5sb2coICdsaW50LW1haW46IHJlcG8nLCByZXBvICk7XG4gIH1cblxuICAvLyBDcmVhdGUgRVNMaW50IGluc3RhbmNlXG4gIGNvbnN0IGVzbGludCA9IG5ldyBFU0xpbnQoIGVzbGludE9wdGlvbnMgKTtcblxuICAvLyBMaW50IGZpbGVzIGluIHRoZSByZXBvXG4gIGNvbnN0IHBhdHRlcm5zID0gWyAnLi8nIF07IC8vIExpbnQgYWxsIGZpbGVzIHN0YXJ0aW5nIGZyb20gdGhlIHJlcG8gcm9vdFxuXG4gIGxldCByZXN1bHRzOiBFU0xpbnQuTGludFJlc3VsdFtdO1xuICB0cnkge1xuICAgIHJlc3VsdHMgPSBhd2FpdCBlc2xpbnQubGludEZpbGVzKCBwYXR0ZXJucyApO1xuICB9XG4gIGNhdGNoKCBlcnJvciApIHtcbiAgICBjb25zb2xlLmVycm9yKCBgRXJyb3IgbGludGluZyBmaWxlcyBpbiByZXBvICR7cmVwb306YCwgZXJyb3IgKTtcbiAgICByZXR1cm4gMTsgLy8gTm9uLXplcm8gZXhpdCBjb2RlIHRvIGluZGljYXRlIGZhaWx1cmVcbiAgfVxuXG4gIC8vIElmIGZpeCBpcyBlbmFibGVkLCB3cml0ZSB0aGUgZml4ZWQgZmlsZXNcbiAgaWYgKCBmaXggKSB7XG4gICAgYXdhaXQgRVNMaW50Lm91dHB1dEZpeGVzKCByZXN1bHRzICk7XG4gIH1cblxuICAvLyBPdXRwdXQgcmVzdWx0cywgcHJlZml4ZWQgd2l0aCB0aGUgcmVwbyBuYW1lXG4gIGxldCBsb2dnZWRSZXBvID0gZmFsc2U7XG5cbiAgaWYgKCByZXN1bHRzLmxlbmd0aCA+IDAgKSB7XG4gICAgY29uc3QgZm9ybWF0dGVyID0gYXdhaXQgZXNsaW50LmxvYWRGb3JtYXR0ZXIoICdzdHlsaXNoJyApO1xuICAgIGNvbnN0IHJlc3VsdFRleHQgPSBhd2FpdCBmb3JtYXR0ZXIuZm9ybWF0KCByZXN1bHRzICk7XG5cbiAgICBpZiAoIHJlc3VsdFRleHQudHJpbSgpLmxlbmd0aCA+IDAgKSB7XG4gICAgICBpZiAoICFsb2dnZWRSZXBvICkge1xuICAgICAgICBjb25zb2xlLmxvZyggYFxcbiR7cmVwb306YCApO1xuICAgICAgICBsb2dnZWRSZXBvID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coIHJlc3VsdFRleHQgKTtcbiAgICB9XG4gIH1cblxuICAvLyBEZXRlcm1pbmUgZXhpdCBjb2RlXG4gIGNvbnN0IGVycm9yQ291bnQgPSByZXN1bHRzLnJlZHVjZSggKCBzdW0sIHJlc3VsdCApID0+IHN1bSArIHJlc3VsdC5lcnJvckNvdW50LCAwICk7XG4gIHJldHVybiBlcnJvckNvdW50ID09PSAwID8gMCA6IDE7IC8vIFJldHVybiAwIGlmIG5vIGVycm9ycywgMSBpZiB0aGVyZSBhcmUgZXJyb3JzXG59XG5cbmNvbnN0IGNsZWFuQ2FjaGVzID0gKCBvcmlnaW5hbFJlcG9zOiBSZXBvW10gKSA9PiB7XG4gIERFQlVHX1BIRVRfTElOVCAmJiBjb25zb2xlLmxvZyggJ2xpbnQtbWFpbiBjbGVhcmluZzogJywgb3JpZ2luYWxSZXBvcyApO1xuICBvcmlnaW5hbFJlcG9zLmZvckVhY2goIGFzeW5jIHJlcG8gPT4ge1xuICAgIGNvbnN0IGNhY2hlRmlsZSA9IGdldENhY2hlTG9jYXRpb24oIHJlcG8gKTtcblxuICAgIHRyeSB7XG4gICAgICBmcy51bmxpbmtTeW5jKCBjYWNoZUZpbGUgKTtcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGlmICggZXJyIGluc3RhbmNlb2YgRXJyb3IgJiYgJ2NvZGUnIGluIGVyciAmJiBlcnIuY29kZSA9PT0gJ0VOT0VOVCcgKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcgaWYgdGhlIGZpbGUgZG9lcyBub3QgZXhpc3RcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7IC8vIFJlLXRocm93IHRoZSBlcnJvciBpZiBpdCdzIHNvbWV0aGluZyBlbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCBmcy5leGlzdHNTeW5jKCBwYXRoLnJlc29sdmUoIGAuLi8ke3JlcG99L3RzY29uZmlnLmpzb25gICkgKSApIHtcbiAgICAgIGF3YWl0IHRzY0NsZWFuUmVwbyggcmVwbyApO1xuICAgIH1cbiAgfSApO1xufTtcblxuLyoqXG4gKiBMaW50cyB0aGUgc3BlY2lmaWVkIHJlcG9zaXRvcmllcy5cbiAqL1xuY29uc3QgbGludE1haW4gPSBhc3luYyAoIHJlcG9zOiBSZXBvW10sIGNsZWFuOiBib29sZWFuLCBmaXg6IGJvb2xlYW4gKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG5cbiAgYXNzZXJ0KCByZXBvcy5sZW5ndGggPiAwLCAnbm8gcmVwb3MgcHJvdmlkZWQgdG8gbGludCcgKTtcblxuICAvLyBDbGVhbiBpbiBhZHZhbmNlIGlmIHJlcXVlc3RlZC4gRHVyaW5nIGxpbnRpbmcgdGhlIGNhY2hlIHdpbGwgYmUgcmVwb3B1bGF0ZWQuXG4gIGNsZWFuICYmIGNsZWFuQ2FjaGVzKCByZXBvcyApO1xuICBoYW5kbGVPbGRDYWNoZUxvY2F0aW9uKCk7XG5cbiAgLy8gVG9wIGxldmVsIHRyeS1jYXRjaCBqdXN0IGluIGNhc2UuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IGxpbnRXaXRoV29ya2VycyggcmVwb3MsIGZpeCApO1xuICB9XG4gIGNhdGNoKCBlcnJvciApIHtcbiAgICBpZiAoIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCAnRXJyb3IgcnVubmluZyBFU0xpbnQ6JywgZXJyb3IubWVzc2FnZSApO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIEV2ZW4gdGhvdWdoIG9uIG1haW4gdGhlIG5ldyBjYWNoZSBsb2NhdGlvbiBpcyBjaGlwcGVyL2Rpc3QvZXNsaW50L2NhY2hlLCBsaW50aW5nIG9uIG9sZCBzaGFzIHN0aWxsIHByb2R1Y2VzIGFcbi8vIGNhY2hlIGluIGNoaXBwZXIvZXNsaW50L2NhY2hlLiBEZWxldGUgaXQgZWFnZXJseSBhbmQgYWx3YXlzIHdoZW4gaXQgaXMgdGhlcmUuXG5mdW5jdGlvbiBoYW5kbGVPbGRDYWNoZUxvY2F0aW9uKCk6IHZvaWQge1xuICB0cnkge1xuICAgIGZzLmV4aXN0c1N5bmMoIE9MRF9DQUNIRSApICYmIGZzLnJtU3luYyggT0xEX0NBQ0hFLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9ICk7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgY29uc29sZS5lcnJvciggYGVycm9yIHJlbW92aW5nIG9sZCBjYWNoZSBsb2NhdGlvbjogJHtlfWAgKTsgLy8gUGxlYXNlIHJlcG9ydCB0aGVzZSBwcm9ibGVtcyB0byBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTUwOFxuICB9XG59XG5cbi8qKlxuICogVXNlIGEgdmVyeSBzdHJpY3Qgc3ludGF4IGhlcmUgdG8gc2ltcGxpZnkgaW50ZXJvcGVyYWJpbGl0eSB3aXRoIHRoZSBjYWxsIHNpdGUuIEFsbCBvcHRpb25zIGFyZSByZXF1aXJlZC5cbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXZvaWRcbnZvaWQgKCBhc3luYyAoKSA9PiB7XG5cbiAgLy8gc2VhcmNoIGFyZ3YgZm9yIC0tcmVwb3M9YSxiLGNcbiAgY29uc3QgcmVwb3NBcmcgPSBwcm9jZXNzLmFyZ3YuZmluZCggYXJnID0+IGFyZy5zdGFydHNXaXRoKCAnLS1yZXBvcz0nICkgKTtcbiAgY29uc3QgY2xlYW5BcmcgPSBwcm9jZXNzLmFyZ3YuZmluZCggYXJnID0+IGFyZy5zdGFydHNXaXRoKCAnLS1jbGVhbj0nICkgKTtcbiAgY29uc3QgZml4QXJnID0gcHJvY2Vzcy5hcmd2LmZpbmQoIGFyZyA9PiBhcmcuc3RhcnRzV2l0aCggJy0tZml4PScgKSApO1xuXG4gIGFzc2VydCggcmVwb3NBcmcsICdtaXNzaW5nIC0tcmVwb3MgYXJndW1lbnQnICk7XG4gIGFzc2VydCggY2xlYW5BcmcsICdtaXNzaW5nIC0tY2xlYW4gYXJndW1lbnQnICk7XG4gIGFzc2VydCggZml4QXJnLCAnbWlzc2luZyAtLWZpeCBhcmd1bWVudCcgKTtcblxuICBjb25zdCByZXBvczogUmVwb1tdID0gcmVwb3NBcmcgPyByZXBvc0FyZy5zcGxpdCggJz0nIClbIDEgXS5zcGxpdCggJywnICkgOiBbXTtcbiAgY29uc3QgY2xlYW4gPSBjbGVhbkFyZyA/IGNsZWFuQXJnLnNwbGl0KCAnPScgKVsgMSBdID09PSAndHJ1ZScgOiBmYWxzZTtcbiAgY29uc3QgZml4ID0gZml4QXJnID8gZml4QXJnLnNwbGl0KCAnPScgKVsgMSBdID09PSAndHJ1ZScgOiBmYWxzZTtcblxuICBpZiAoIERFQlVHX1BIRVRfTElOVCApIHtcbiAgICBjb25zb2xlLmxvZyggJ2xpbnQtbWFpbi50cyByZXBvcycsIHJlcG9zICk7XG4gICAgY29uc29sZS5sb2coICdsaW50LW1haW4udHMgY2xlYW4nLCBjbGVhbiApO1xuICAgIGNvbnNvbGUubG9nKCAnbGludC1tYWluLnRzIGZpeCcsIGZpeCApO1xuICB9XG5cbiAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IGxpbnRNYWluKCBfLnVuaXEoIHJlcG9zICksIGNsZWFuLCBmaXggKTtcbiAgcHJvY2Vzcy5leGl0KCBzdWNjZXNzID8gMCA6IDEgKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJFU0xpbnQiLCJmcyIsIl8iLCJwYXRoIiwicHJvY2VzcyIsInRzY0NsZWFuUmVwbyIsIkRFQlVHX1BIRVRfTElOVCIsIkRPX05PVF9MSU5UIiwiZ2V0Q2FjaGVMb2NhdGlvbiIsInJlcG8iLCJyZXNvbHZlIiwiT0xEX0NBQ0hFIiwibGludFdpdGhXb3JrZXJzIiwicmVwb3MiLCJmaXgiLCJyZXBvc1F1ZXVlIiwiZmlsdGVyIiwiaW5jbHVkZXMiLCJleGl0Q29kZXMiLCJ3b3JrZXIiLCJsZW5ndGgiLCJzaGlmdCIsInJlc3VsdCIsImxpbnRXaXRoTm9kZUFQSSIsInB1c2giLCJudW1Xb3JrZXJzIiwid29ya2VycyIsInRpbWVzIiwicmVzdWx0cyIsIlByb21pc2UiLCJhbGxTZXR0bGVkIiwiZm9yRWFjaCIsInN0YXR1cyIsImNvbnNvbGUiLCJlcnJvciIsInJlYXNvbiIsImV2ZXJ5IiwiY29kZSIsImVzbGludE9wdGlvbnMiLCJjd2QiLCJjYWNoZSIsImNhY2hlTG9jYXRpb24iLCJmbGFncyIsImVycm9yT25Vbm1hdGNoZWRQYXR0ZXJuIiwibG9nIiwiZXNsaW50IiwicGF0dGVybnMiLCJsaW50RmlsZXMiLCJvdXRwdXRGaXhlcyIsImxvZ2dlZFJlcG8iLCJmb3JtYXR0ZXIiLCJsb2FkRm9ybWF0dGVyIiwicmVzdWx0VGV4dCIsImZvcm1hdCIsInRyaW0iLCJlcnJvckNvdW50IiwicmVkdWNlIiwic3VtIiwiY2xlYW5DYWNoZXMiLCJvcmlnaW5hbFJlcG9zIiwiY2FjaGVGaWxlIiwidW5saW5rU3luYyIsImVyciIsIkVycm9yIiwiZXhpc3RzU3luYyIsImxpbnRNYWluIiwiY2xlYW4iLCJoYW5kbGVPbGRDYWNoZUxvY2F0aW9uIiwibWVzc2FnZSIsInJtU3luYyIsInJlY3Vyc2l2ZSIsImUiLCJyZXBvc0FyZyIsImFyZ3YiLCJmaW5kIiwiYXJnIiwic3RhcnRz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