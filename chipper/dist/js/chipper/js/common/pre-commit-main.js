// Copyright 2020-2024, University of Colorado Boulder
/**
 * See grunt/tasks/pre-commit.ts. This implements each task for that process so they can run in parallel.
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
import fs from 'fs';
import CacheLayer from '../../../chipper/js/common/CacheLayer.js';
import reportMedia from '../../../chipper/js/grunt/reportMedia.js';
import getRepoList from '../../../perennial-alias/js/common/getRepoList.js';
import withServer from '../../../perennial-alias/js/common/withServer.js';
import lint from '../../../perennial-alias/js/eslint/lint.js';
import typeCheck from '../../../perennial-alias/js/grunt/typeCheck.js';
import puppeteer from '../../../perennial-alias/js/npm-dependencies/puppeteer.js';
import puppeteerQUnit from '../../../perennial-alias/js/test/puppeteerQUnit.js';
import transpile from '../common/transpile.js';
import getPhetLibs from '../grunt/getPhetLibs.js';
import generatePhetioMacroAPI from '../phet-io/generatePhetioMacroAPI.js';
import phetioCompareAPISets from '../phet-io/phetioCompareAPISets.js';
const commandLineArguments = process.argv.slice(2);
const outputToConsole = commandLineArguments.includes('--console');
const absolute = commandLineArguments.includes('--absolute');
const getArg = (arg)=>{
    const args = commandLineArguments.filter((commandLineArg)=>commandLineArg.startsWith(`--${arg}=`));
    if (args.length !== 1) {
        throw new Error(`expected only one arg: ${args}`);
    }
    return args[0].split('=')[1];
};
const command = getArg('command');
const repo = getArg('repo');
// eslint-disable-next-line @typescript-eslint/no-floating-promises
_async_to_generator(function*() {
    if (command === 'lint') {
        // Run lint tests if they exist in the checked-out SHAs.
        // lint() automatically filters out non-lintable repos
        const lintSuccess = yield lint([
            repo
        ]);
        outputToConsole && console.log(`Linting had ${lintSuccess ? 'no ' : ''}errors.`);
        process.exit(lintSuccess ? 0 : 1);
    } else if (command === 'report-media') {
        // These sims don't have package.json or media that requires checking.
        const optOutOfReportMedia = [
            'decaf',
            'phet-android-app',
            'babel',
            'phet-info',
            'phet-ios-app',
            'qa',
            'sherpa',
            'smithers',
            'tasks',
            'weddell'
        ];
        // Make sure license.json for images/audio is up-to-date
        if (!optOutOfReportMedia.includes(repo)) {
            const success = yield reportMedia(repo);
            process.exit(success ? 0 : 1);
        } else {
            // no need to check
            process.exit(0);
        }
    } else if (command === 'type-check') {
        const success = yield typeCheck({
            all: true,
            silent: !outputToConsole && !absolute,
            absolute: absolute
        });
        process.exit(success ? 0 : 1);
    } else if (command === 'unit-test') {
        // Run qunit tests if puppeteerQUnit exists in the checked-out SHAs and a test HTML exists.
        const qUnitOK = yield _async_to_generator(function*() {
            const cacheKey = `puppeteerQUnit#${repo}`;
            if (repo !== 'scenery' && repo !== 'phet-io-wrappers') {
                const testFilePath = `${repo}/${repo}-tests.html`;
                const exists = fs.existsSync(`../${testFilePath}`);
                if (exists) {
                    if (CacheLayer.isCacheSafe(cacheKey)) {
                        return true;
                    } else {
                        const browser = yield puppeteer.launch({
                            args: [
                                '--disable-gpu'
                            ]
                        });
                        const result = yield withServer(/*#__PURE__*/ _async_to_generator(function*(port) {
                            return puppeteerQUnit(browser, `http://localhost:${port}/${testFilePath}?ea&brand=phet-io`);
                        }));
                        yield browser.close();
                        outputToConsole && console.log(`${repo}: ${JSON.stringify(result, null, 2)}`);
                        if (!result.ok) {
                            console.error(`unit tests failed in ${repo}`, result);
                            return false;
                        } else {
                            CacheLayer.onSuccess(cacheKey);
                            return true;
                        }
                    }
                }
                outputToConsole && console.log('QUnit: no problems detected');
                return true;
            }
            return true;
        })();
        process.exit(qUnitOK ? 0 : 1);
    } else if (command === 'phet-io-api') {
        ////////////////////////////////////////////////////////////////////////////////
        // Compare PhET-iO APIs for this repo and anything that has it as a dependency
        //
        const phetioAPIOK = yield _async_to_generator(function*() {
            // If running git hooks in phet-io-sim-specific, it isn't worth regenerating the API for every single stable sim.
            // Instead, rely on the hooks from the repos where the api changes come from.
            if (repo === 'phet-io-sim-specific') {
                return true;
            }
            const getCacheKey = (repo)=>`phet-io-api#${repo}`;
            // Test this repo and all phet-io sims that have it as a dependency.  For instance, changing sun would test
            // every phet-io stable sim.
            const phetioAPIStable = getRepoList('phet-io-api-stable');
            const reposToTest = phetioAPIStable.filter((phetioSimRepo)=>getPhetLibs(phetioSimRepo).includes(repo))// Only worry about the ones that are not cached
            .filter((repo)=>!CacheLayer.isCacheSafe(getCacheKey(repo)));
            if (reposToTest.length > 0) {
                const repos = new Set();
                reposToTest.forEach((sim)=>getPhetLibs(sim).forEach((lib)=>repos.add(lib)));
                yield transpile({
                    repos: Array.from(repos),
                    silent: true
                });
                const proposedAPIs = yield generatePhetioMacroAPI(reposToTest, {
                    showProgressBar: reposToTest.length > 1,
                    showMessagesFromSim: false
                });
                const phetioAPIComparisonSuccessful = yield phetioCompareAPISets(reposToTest, proposedAPIs);
                if (phetioAPIComparisonSuccessful) {
                    reposToTest.forEach((repo)=>CacheLayer.onSuccess(getCacheKey(repo)));
                }
                return phetioAPIComparisonSuccessful;
            } else {
                return true;
            }
        })();
        process.exit(phetioAPIOK ? 0 : 1);
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9wcmUtY29tbWl0LW1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2VlIGdydW50L3Rhc2tzL3ByZS1jb21taXQudHMuIFRoaXMgaW1wbGVtZW50cyBlYWNoIHRhc2sgZm9yIHRoYXQgcHJvY2VzcyBzbyB0aGV5IGNhbiBydW4gaW4gcGFyYWxsZWwuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IENhY2hlTGF5ZXIgZnJvbSAnLi4vLi4vLi4vY2hpcHBlci9qcy9jb21tb24vQ2FjaGVMYXllci5qcyc7XG5pbXBvcnQgcmVwb3J0TWVkaWEgZnJvbSAnLi4vLi4vLi4vY2hpcHBlci9qcy9ncnVudC9yZXBvcnRNZWRpYS5qcyc7XG5pbXBvcnQgZ2V0UmVwb0xpc3QgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9nZXRSZXBvTGlzdC5qcyc7XG5pbXBvcnQgd2l0aFNlcnZlciBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3dpdGhTZXJ2ZXIuanMnO1xuaW1wb3J0IGxpbnQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2VzbGludC9saW50LmpzJztcbmltcG9ydCB0eXBlQ2hlY2sgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3R5cGVDaGVjay5qcyc7XG5pbXBvcnQgcHVwcGV0ZWVyIGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ucG0tZGVwZW5kZW5jaWVzL3B1cHBldGVlci5qcyc7XG5pbXBvcnQgcHVwcGV0ZWVyUVVuaXQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL3Rlc3QvcHVwcGV0ZWVyUVVuaXQuanMnO1xuaW1wb3J0IHRyYW5zcGlsZSBmcm9tICcuLi9jb21tb24vdHJhbnNwaWxlLmpzJztcbmltcG9ydCBnZXRQaGV0TGlicyBmcm9tICcuLi9ncnVudC9nZXRQaGV0TGlicy5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSSBmcm9tICcuLi9waGV0LWlvL2dlbmVyYXRlUGhldGlvTWFjcm9BUEkuanMnO1xuaW1wb3J0IHBoZXRpb0NvbXBhcmVBUElTZXRzIGZyb20gJy4uL3BoZXQtaW8vcGhldGlvQ29tcGFyZUFQSVNldHMuanMnO1xuXG50eXBlIFJlcG8gPSBzdHJpbmc7XG5cbmNvbnN0IGNvbW1hbmRMaW5lQXJndW1lbnRzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKCAyICk7XG5jb25zdCBvdXRwdXRUb0NvbnNvbGUgPSBjb21tYW5kTGluZUFyZ3VtZW50cy5pbmNsdWRlcyggJy0tY29uc29sZScgKTtcbmNvbnN0IGFic29sdXRlID0gY29tbWFuZExpbmVBcmd1bWVudHMuaW5jbHVkZXMoICctLWFic29sdXRlJyApO1xuXG5jb25zdCBnZXRBcmcgPSAoIGFyZzogc3RyaW5nICkgPT4ge1xuICBjb25zdCBhcmdzID0gY29tbWFuZExpbmVBcmd1bWVudHMuZmlsdGVyKCBjb21tYW5kTGluZUFyZyA9PiBjb21tYW5kTGluZUFyZy5zdGFydHNXaXRoKCBgLS0ke2FyZ309YCApICk7XG4gIGlmICggYXJncy5sZW5ndGggIT09IDEgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgZXhwZWN0ZWQgb25seSBvbmUgYXJnOiAke2FyZ3N9YCApO1xuICB9XG4gIHJldHVybiBhcmdzWyAwIF0uc3BsaXQoICc9JyApWyAxIF07XG59O1xuXG5jb25zdCBjb21tYW5kID0gZ2V0QXJnKCAnY29tbWFuZCcgKTtcbmNvbnN0IHJlcG8gPSBnZXRBcmcoICdyZXBvJyApO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWZsb2F0aW5nLXByb21pc2VzXG4oIGFzeW5jICgpID0+IHtcblxuICBpZiAoIGNvbW1hbmQgPT09ICdsaW50JyApIHtcblxuICAgIC8vIFJ1biBsaW50IHRlc3RzIGlmIHRoZXkgZXhpc3QgaW4gdGhlIGNoZWNrZWQtb3V0IFNIQXMuXG4gICAgLy8gbGludCgpIGF1dG9tYXRpY2FsbHkgZmlsdGVycyBvdXQgbm9uLWxpbnRhYmxlIHJlcG9zXG4gICAgY29uc3QgbGludFN1Y2Nlc3MgPSBhd2FpdCBsaW50KCBbIHJlcG8gXSApO1xuICAgIG91dHB1dFRvQ29uc29sZSAmJiBjb25zb2xlLmxvZyggYExpbnRpbmcgaGFkICR7bGludFN1Y2Nlc3MgPyAnbm8gJyA6ICcnfWVycm9ycy5gICk7XG4gICAgcHJvY2Vzcy5leGl0KCBsaW50U3VjY2VzcyA/IDAgOiAxICk7XG4gIH1cblxuICBlbHNlIGlmICggY29tbWFuZCA9PT0gJ3JlcG9ydC1tZWRpYScgKSB7XG5cbiAgICAvLyBUaGVzZSBzaW1zIGRvbid0IGhhdmUgcGFja2FnZS5qc29uIG9yIG1lZGlhIHRoYXQgcmVxdWlyZXMgY2hlY2tpbmcuXG4gICAgY29uc3Qgb3B0T3V0T2ZSZXBvcnRNZWRpYSA9IFtcbiAgICAgICdkZWNhZicsXG4gICAgICAncGhldC1hbmRyb2lkLWFwcCcsXG4gICAgICAnYmFiZWwnLFxuICAgICAgJ3BoZXQtaW5mbycsXG4gICAgICAncGhldC1pb3MtYXBwJyxcbiAgICAgICdxYScsXG4gICAgICAnc2hlcnBhJyxcbiAgICAgICdzbWl0aGVycycsXG4gICAgICAndGFza3MnLFxuICAgICAgJ3dlZGRlbGwnXG4gICAgXTtcblxuICAgIC8vIE1ha2Ugc3VyZSBsaWNlbnNlLmpzb24gZm9yIGltYWdlcy9hdWRpbyBpcyB1cC10by1kYXRlXG4gICAgaWYgKCAhb3B0T3V0T2ZSZXBvcnRNZWRpYS5pbmNsdWRlcyggcmVwbyApICkge1xuXG4gICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgcmVwb3J0TWVkaWEoIHJlcG8gKTtcbiAgICAgIHByb2Nlc3MuZXhpdCggc3VjY2VzcyA/IDAgOiAxICk7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBubyBuZWVkIHRvIGNoZWNrXG4gICAgICBwcm9jZXNzLmV4aXQoIDAgKTtcbiAgICB9XG4gIH1cblxuICBlbHNlIGlmICggY29tbWFuZCA9PT0gJ3R5cGUtY2hlY2snICkge1xuICAgIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCB0eXBlQ2hlY2soIHtcbiAgICAgIGFsbDogdHJ1ZSxcbiAgICAgIHNpbGVudDogIW91dHB1dFRvQ29uc29sZSAmJiAhYWJzb2x1dGUsIC8vIERvbid0IGJlIHNpbGVudCBpZiBhYnNvbHV0ZSBvdXRwdXQgaXMgcmVxdWVzdGVkXG4gICAgICBhYnNvbHV0ZTogYWJzb2x1dGVcbiAgICB9ICk7XG4gICAgcHJvY2Vzcy5leGl0KCBzdWNjZXNzID8gMCA6IDEgKTtcbiAgfVxuXG4gIGVsc2UgaWYgKCBjb21tYW5kID09PSAndW5pdC10ZXN0JyApIHtcblxuICAgIC8vIFJ1biBxdW5pdCB0ZXN0cyBpZiBwdXBwZXRlZXJRVW5pdCBleGlzdHMgaW4gdGhlIGNoZWNrZWQtb3V0IFNIQXMgYW5kIGEgdGVzdCBIVE1MIGV4aXN0cy5cbiAgICBjb25zdCBxVW5pdE9LID0gYXdhaXQgKCBhc3luYyAoKSA9PiB7XG5cbiAgICAgIGNvbnN0IGNhY2hlS2V5ID0gYHB1cHBldGVlclFVbml0IyR7cmVwb31gO1xuXG4gICAgICBpZiAoIHJlcG8gIT09ICdzY2VuZXJ5JyAmJiByZXBvICE9PSAncGhldC1pby13cmFwcGVycycgKSB7IC8vIHNjZW5lcnkgdW5pdCB0ZXN0cyB0YWtlIHRvbyBsb25nLCBzbyBza2lwIHRob3NlXG4gICAgICAgIGNvbnN0IHRlc3RGaWxlUGF0aCA9IGAke3JlcG99LyR7cmVwb30tdGVzdHMuaHRtbGA7XG4gICAgICAgIGNvbnN0IGV4aXN0cyA9IGZzLmV4aXN0c1N5bmMoIGAuLi8ke3Rlc3RGaWxlUGF0aH1gICk7XG4gICAgICAgIGlmICggZXhpc3RzICkge1xuXG4gICAgICAgICAgaWYgKCBDYWNoZUxheWVyLmlzQ2FjaGVTYWZlKCBjYWNoZUtleSApICkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHB1cHBldGVlci5sYXVuY2goIHtcbiAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICctLWRpc2FibGUtZ3B1J1xuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpdGhTZXJ2ZXIoIGFzeW5jIHBvcnQgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcHVwcGV0ZWVyUVVuaXQoIGJyb3dzZXIsIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vJHt0ZXN0RmlsZVBhdGh9P2VhJmJyYW5kPXBoZXQtaW9gICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIGF3YWl0IGJyb3dzZXIuY2xvc2UoKTtcblxuICAgICAgICAgICAgb3V0cHV0VG9Db25zb2xlICYmIGNvbnNvbGUubG9nKCBgJHtyZXBvfTogJHtKU09OLnN0cmluZ2lmeSggcmVzdWx0LCBudWxsLCAyICl9YCApO1xuICAgICAgICAgICAgaWYgKCAhcmVzdWx0Lm9rICkge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCBgdW5pdCB0ZXN0cyBmYWlsZWQgaW4gJHtyZXBvfWAsIHJlc3VsdCApO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgQ2FjaGVMYXllci5vblN1Y2Nlc3MoIGNhY2hlS2V5ICk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG91dHB1dFRvQ29uc29sZSAmJiBjb25zb2xlLmxvZyggJ1FVbml0OiBubyBwcm9ibGVtcyBkZXRlY3RlZCcgKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9ICkoKTtcblxuICAgIHByb2Nlc3MuZXhpdCggcVVuaXRPSyA/IDAgOiAxICk7XG4gIH1cblxuICBlbHNlIGlmICggY29tbWFuZCA9PT0gJ3BoZXQtaW8tYXBpJyApIHtcblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ29tcGFyZSBQaEVULWlPIEFQSXMgZm9yIHRoaXMgcmVwbyBhbmQgYW55dGhpbmcgdGhhdCBoYXMgaXQgYXMgYSBkZXBlbmRlbmN5XG4gICAgLy9cbiAgICBjb25zdCBwaGV0aW9BUElPSyA9IGF3YWl0ICggYXN5bmMgKCkgPT4ge1xuXG4gICAgICAvLyBJZiBydW5uaW5nIGdpdCBob29rcyBpbiBwaGV0LWlvLXNpbS1zcGVjaWZpYywgaXQgaXNuJ3Qgd29ydGggcmVnZW5lcmF0aW5nIHRoZSBBUEkgZm9yIGV2ZXJ5IHNpbmdsZSBzdGFibGUgc2ltLlxuICAgICAgLy8gSW5zdGVhZCwgcmVseSBvbiB0aGUgaG9va3MgZnJvbSB0aGUgcmVwb3Mgd2hlcmUgdGhlIGFwaSBjaGFuZ2VzIGNvbWUgZnJvbS5cbiAgICAgIGlmICggcmVwbyA9PT0gJ3BoZXQtaW8tc2ltLXNwZWNpZmljJyApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGdldENhY2hlS2V5ID0gKCByZXBvOiBSZXBvICkgPT4gYHBoZXQtaW8tYXBpIyR7cmVwb31gO1xuXG4gICAgICAvLyBUZXN0IHRoaXMgcmVwbyBhbmQgYWxsIHBoZXQtaW8gc2ltcyB0aGF0IGhhdmUgaXQgYXMgYSBkZXBlbmRlbmN5LiAgRm9yIGluc3RhbmNlLCBjaGFuZ2luZyBzdW4gd291bGQgdGVzdFxuICAgICAgLy8gZXZlcnkgcGhldC1pbyBzdGFibGUgc2ltLlxuICAgICAgY29uc3QgcGhldGlvQVBJU3RhYmxlID0gZ2V0UmVwb0xpc3QoICdwaGV0LWlvLWFwaS1zdGFibGUnICk7XG4gICAgICBjb25zdCByZXBvc1RvVGVzdCA9IHBoZXRpb0FQSVN0YWJsZVxuICAgICAgICAuZmlsdGVyKCBwaGV0aW9TaW1SZXBvID0+IGdldFBoZXRMaWJzKCBwaGV0aW9TaW1SZXBvICkuaW5jbHVkZXMoIHJlcG8gKSApXG5cbiAgICAgICAgLy8gT25seSB3b3JyeSBhYm91dCB0aGUgb25lcyB0aGF0IGFyZSBub3QgY2FjaGVkXG4gICAgICAgIC5maWx0ZXIoIHJlcG8gPT4gIUNhY2hlTGF5ZXIuaXNDYWNoZVNhZmUoIGdldENhY2hlS2V5KCByZXBvICkgKSApO1xuXG4gICAgICBpZiAoIHJlcG9zVG9UZXN0Lmxlbmd0aCA+IDAgKSB7XG4gICAgICAgIGNvbnN0IHJlcG9zID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIHJlcG9zVG9UZXN0LmZvckVhY2goIHNpbSA9PiBnZXRQaGV0TGlicyggc2ltICkuZm9yRWFjaCggbGliID0+IHJlcG9zLmFkZCggbGliICkgKSApO1xuICAgICAgICBhd2FpdCB0cmFuc3BpbGUoIHtcbiAgICAgICAgICByZXBvczogQXJyYXkuZnJvbSggcmVwb3MgKSxcbiAgICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgICAgfSApO1xuXG4gICAgICAgIGNvbnN0IHByb3Bvc2VkQVBJcyA9IGF3YWl0IGdlbmVyYXRlUGhldGlvTWFjcm9BUEkoIHJlcG9zVG9UZXN0LCB7XG4gICAgICAgICAgc2hvd1Byb2dyZXNzQmFyOiByZXBvc1RvVGVzdC5sZW5ndGggPiAxLFxuICAgICAgICAgIHNob3dNZXNzYWdlc0Zyb21TaW06IGZhbHNlXG4gICAgICAgIH0gKTtcblxuICAgICAgICBjb25zdCBwaGV0aW9BUElDb21wYXJpc29uU3VjY2Vzc2Z1bCA9IGF3YWl0IHBoZXRpb0NvbXBhcmVBUElTZXRzKCByZXBvc1RvVGVzdCwgcHJvcG9zZWRBUElzICk7XG5cbiAgICAgICAgaWYgKCBwaGV0aW9BUElDb21wYXJpc29uU3VjY2Vzc2Z1bCApIHtcbiAgICAgICAgICByZXBvc1RvVGVzdC5mb3JFYWNoKCByZXBvID0+IENhY2hlTGF5ZXIub25TdWNjZXNzKCBnZXRDYWNoZUtleSggcmVwbyApICkgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwaGV0aW9BUElDb21wYXJpc29uU3VjY2Vzc2Z1bDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9ICkoKTtcblxuICAgIHByb2Nlc3MuZXhpdCggcGhldGlvQVBJT0sgPyAwIDogMSApO1xuICB9XG59ICkoKTsiXSwibmFtZXMiOlsiZnMiLCJDYWNoZUxheWVyIiwicmVwb3J0TWVkaWEiLCJnZXRSZXBvTGlzdCIsIndpdGhTZXJ2ZXIiLCJsaW50IiwidHlwZUNoZWNrIiwicHVwcGV0ZWVyIiwicHVwcGV0ZWVyUVVuaXQiLCJ0cmFuc3BpbGUiLCJnZXRQaGV0TGlicyIsImdlbmVyYXRlUGhldGlvTWFjcm9BUEkiLCJwaGV0aW9Db21wYXJlQVBJU2V0cyIsImNvbW1hbmRMaW5lQXJndW1lbnRzIiwicHJvY2VzcyIsImFyZ3YiLCJzbGljZSIsIm91dHB1dFRvQ29uc29sZSIsImluY2x1ZGVzIiwiYWJzb2x1dGUiLCJnZXRBcmciLCJhcmciLCJhcmdzIiwiZmlsdGVyIiwiY29tbWFuZExpbmVBcmciLCJzdGFydHNXaXRoIiwibGVuZ3RoIiwiRXJyb3IiLCJzcGxpdCIsImNvbW1hbmQiLCJyZXBvIiwibGludFN1Y2Nlc3MiLCJjb25zb2xlIiwibG9nIiwiZXhpdCIsIm9wdE91dE9mUmVwb3J0TWVkaWEiLCJzdWNjZXNzIiwiYWxsIiwic2lsZW50IiwicVVuaXRPSyIsImNhY2hlS2V5IiwidGVzdEZpbGVQYXRoIiwiZXhpc3RzIiwiZXhpc3RzU3luYyIsImlzQ2FjaGVTYWZlIiwiYnJvd3NlciIsImxhdW5jaCIsInJlc3VsdCIsInBvcnQiLCJjbG9zZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJvayIsImVycm9yIiwib25TdWNjZXNzIiwicGhldGlvQVBJT0siLCJnZXRDYWNoZUtleSIsInBoZXRpb0FQSVN0YWJsZSIsInJlcG9zVG9UZXN0IiwicGhldGlvU2ltUmVwbyIsInJlcG9zIiwiU2V0IiwiZm9yRWFjaCIsInNpbSIsImxpYiIsImFkZCIsIkFycmF5IiwiZnJvbSIsInByb3Bvc2VkQVBJcyIsInNob3dQcm9ncmVzc0JhciIsInNob3dNZXNzYWdlc0Zyb21TaW0iLCJwaGV0aW9BUElDb21wYXJpc29uU3VjY2Vzc2Z1bCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFFBQVEsS0FBSztBQUNwQixPQUFPQyxnQkFBZ0IsMkNBQTJDO0FBQ2xFLE9BQU9DLGlCQUFpQiwyQ0FBMkM7QUFDbkUsT0FBT0MsaUJBQWlCLG9EQUFvRDtBQUM1RSxPQUFPQyxnQkFBZ0IsbURBQW1EO0FBQzFFLE9BQU9DLFVBQVUsNkNBQTZDO0FBQzlELE9BQU9DLGVBQWUsaURBQWlEO0FBQ3ZFLE9BQU9DLGVBQWUsNERBQTREO0FBQ2xGLE9BQU9DLG9CQUFvQixxREFBcUQ7QUFDaEYsT0FBT0MsZUFBZSx5QkFBeUI7QUFDL0MsT0FBT0MsaUJBQWlCLDBCQUEwQjtBQUNsRCxPQUFPQyw0QkFBNEIsdUNBQXVDO0FBQzFFLE9BQU9DLDBCQUEwQixxQ0FBcUM7QUFJdEUsTUFBTUMsdUJBQXVCQyxRQUFRQyxJQUFJLENBQUNDLEtBQUssQ0FBRTtBQUNqRCxNQUFNQyxrQkFBa0JKLHFCQUFxQkssUUFBUSxDQUFFO0FBQ3ZELE1BQU1DLFdBQVdOLHFCQUFxQkssUUFBUSxDQUFFO0FBRWhELE1B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