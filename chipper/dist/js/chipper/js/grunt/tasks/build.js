// Copyright 2013-2024, University of Colorado Boulder
/**
 * Builds the repository. Depending on the repository type (runnable/wrapper/standalone), the result may vary.
 * Runnable build options:
 *  --report-media - Will iterate over all of the license.json files and reports any media files, set to false to opt out.
 *  --brands={{BRANDS} - Can be * (build all supported brands), or a comma-separated list of brand names. Will fall back to using
 *                       build-local.json's brands (or adapted-from-phet if that does not exist)
 *  --XHTML - Includes an xhtml/ directory in the build output that contains a runnable XHTML form of the sim (with
 *            a separated-out JS file).
 *  --locales={{LOCALES}} - Can be * (build all available locales, "en" and everything in babel), or a comma-separated list of locales
 *  --transpile=false - To opt out of transpiling repos before build. This should only be used if you are confident that chipper/dist is already correct (to save time).
 *  --type-check=false - To opt out of type checking before build. This should only be used if you are confident that TypeScript is already errorless (to save time).
 *  --encodeStringMap=false - Disables the encoding of the string map in the built file. This is useful for debugging.
 *
 * Minify-specific options:
 *  --minify.babelTranspile=false - Disables babel transpilation phase.
 *  --minify.uglify=false - Disables uglification, so the built file will include (essentially) concatenated source files.
 *  --minify.mangle=false - During uglification, it will not "mangle" variable names (where they get renamed to short constants to reduce file size.)
 *  --minify.beautify=true - After uglification, the source code will be syntax formatted nicely
 *  --minify.stripAssertions=false - During uglification, it will strip assertions.
 *  --minify.stripLogging=false - During uglification, it will not strip logging statements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
import fs, { readFileSync } from 'fs';
import path from 'path';
import phetTimingLog from '../../../../perennial-alias/js/common/phetTimingLog.js';
import typeCheck from '../../../../perennial-alias/js/grunt/typeCheck.js';
import getBrands from '../../../../perennial-alias/js/grunt/tasks/util/getBrands.js';
import getOption, { isOptionKeyProvided } from '../../../../perennial-alias/js/grunt/tasks/util/getOption.js';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import grunt from '../../../../perennial-alias/js/npm-dependencies/grunt.js';
import transpile from '../../common/transpile.js';
import buildRunnable from '../buildRunnable.js';
import buildStandalone from '../buildStandalone.js';
import getPhetLibs from '../getPhetLibs.js';
import minify from '../minify.js';
const repo = getRepo();
/**
 * Immediately run the build and export the promise in case the client wants to await the task.
 */ export const buildPromise = _async_to_generator(function*() {
    yield phetTimingLog.startAsync('grunt-build', /*#__PURE__*/ _async_to_generator(function*() {
        // Parse minification keys
        const minifyKeys = Object.keys(minify.MINIFY_DEFAULTS);
        const minifyOptions = {};
        minifyKeys.forEach((minifyKey)=>{
            const option = getOption(`minify.${minifyKey}`);
            if (option === true || option === false) {
                minifyOptions[minifyKey] = option;
            }
        });
        const repoPackageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
        // Run the type checker first.
        const brands = getBrands(repo);
        const shouldTypeCheck = isOptionKeyProvided('type-check') ? getOption('type-check') : true;
        shouldTypeCheck && (yield phetTimingLog.startAsync('type-check', /*#__PURE__*/ _async_to_generator(function*() {
            // We must have phet-io code checked out to type check, since simLauncher imports phetioEngine
            // do NOT run this for phet-lib, since it is type-checking things under src/, which is not desirable.
            if ((brands.includes('phet-io') || brands.includes('phet')) && repo !== 'phet-lib') {
                const success = yield typeCheck({
                    repo: repo
                });
                if (!success) {
                    grunt.fail.fatal('Type checking failed');
                }
            } else {
                console.log('skipping type checking');
            }
        })));
        const doTranspile = isOptionKeyProvided('transpile') ? getOption('transpile') : true;
        doTranspile && (yield phetTimingLog.startAsync('transpile', /*#__PURE__*/ _async_to_generator(function*() {
            // If that succeeds, then convert the code to JS
            yield transpile({
                repos: getPhetLibs(repo),
                silent: true
            });
        })));
        // standalone
        if (repoPackageObject.phet.buildStandalone) {
            console.log('Building standalone repository');
            const parentDir = `../${repo}/build/`;
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir);
            }
            fs.writeFileSync(`${parentDir}/${repo}.min.js`, (yield buildStandalone(repo, minifyOptions)));
            // Build a debug version
            // eslint-disable-next-line require-atomic-updates
            minifyOptions.minify = false;
            // eslint-disable-next-line require-atomic-updates
            minifyOptions.babelTranspile = false;
            // eslint-disable-next-line require-atomic-updates
            minifyOptions.uglify = false;
            // eslint-disable-next-line require-atomic-updates
            minifyOptions.isDebug = true;
            fs.writeFileSync(`${parentDir}/${repo}.debug.js`, (yield buildStandalone(repo, minifyOptions)));
            if (repoPackageObject.phet.standaloneTranspiles) {
                for (const file of repoPackageObject.phet.standaloneTranspiles){
                    fs.writeFileSync(`../${repo}/build/${path.basename(file)}`, minify(grunt.file.read(file)));
                }
            }
        } else {
            const localPackageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
            assert(localPackageObject.phet.runnable, `${repo} does not appear to be runnable`);
            console.log(`Building runnable repository (${repo}, brands: ${brands.join(', ')})`);
            // Other options
            const allHTML = true; // Always build this artifact
            const encodeStringMap = getOption('encodeStringMap') !== false;
            const compressScripts = !!getOption('compressScripts');
            const profileFileSize = !!getOption('profileFileSize');
            const localesOption = getOption('locales') || 'en'; // Default back to English for now
            for (const brand of brands){
                console.log(`Building brand: ${brand}`);
                yield phetTimingLog.startAsync('build-brand-' + brand, /*#__PURE__*/ _async_to_generator(function*() {
                    yield buildRunnable(repo, minifyOptions, allHTML, brand, localesOption, encodeStringMap, compressScripts, profileFileSize, shouldTypeCheck);
                }));
            }
        }
    }));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2J1aWxkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJ1aWxkcyB0aGUgcmVwb3NpdG9yeS4gRGVwZW5kaW5nIG9uIHRoZSByZXBvc2l0b3J5IHR5cGUgKHJ1bm5hYmxlL3dyYXBwZXIvc3RhbmRhbG9uZSksIHRoZSByZXN1bHQgbWF5IHZhcnkuXG4gKiBSdW5uYWJsZSBidWlsZCBvcHRpb25zOlxuICogIC0tcmVwb3J0LW1lZGlhIC0gV2lsbCBpdGVyYXRlIG92ZXIgYWxsIG9mIHRoZSBsaWNlbnNlLmpzb24gZmlsZXMgYW5kIHJlcG9ydHMgYW55IG1lZGlhIGZpbGVzLCBzZXQgdG8gZmFsc2UgdG8gb3B0IG91dC5cbiAqICAtLWJyYW5kcz17e0JSQU5EU30gLSBDYW4gYmUgKiAoYnVpbGQgYWxsIHN1cHBvcnRlZCBicmFuZHMpLCBvciBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGJyYW5kIG5hbWVzLiBXaWxsIGZhbGwgYmFjayB0byB1c2luZ1xuICogICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkLWxvY2FsLmpzb24ncyBicmFuZHMgKG9yIGFkYXB0ZWQtZnJvbS1waGV0IGlmIHRoYXQgZG9lcyBub3QgZXhpc3QpXG4gKiAgLS1YSFRNTCAtIEluY2x1ZGVzIGFuIHhodG1sLyBkaXJlY3RvcnkgaW4gdGhlIGJ1aWxkIG91dHB1dCB0aGF0IGNvbnRhaW5zIGEgcnVubmFibGUgWEhUTUwgZm9ybSBvZiB0aGUgc2ltICh3aXRoXG4gKiAgICAgICAgICAgIGEgc2VwYXJhdGVkLW91dCBKUyBmaWxlKS5cbiAqICAtLWxvY2FsZXM9e3tMT0NBTEVTfX0gLSBDYW4gYmUgKiAoYnVpbGQgYWxsIGF2YWlsYWJsZSBsb2NhbGVzLCBcImVuXCIgYW5kIGV2ZXJ5dGhpbmcgaW4gYmFiZWwpLCBvciBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGxvY2FsZXNcbiAqICAtLXRyYW5zcGlsZT1mYWxzZSAtIFRvIG9wdCBvdXQgb2YgdHJhbnNwaWxpbmcgcmVwb3MgYmVmb3JlIGJ1aWxkLiBUaGlzIHNob3VsZCBvbmx5IGJlIHVzZWQgaWYgeW91IGFyZSBjb25maWRlbnQgdGhhdCBjaGlwcGVyL2Rpc3QgaXMgYWxyZWFkeSBjb3JyZWN0ICh0byBzYXZlIHRpbWUpLlxuICogIC0tdHlwZS1jaGVjaz1mYWxzZSAtIFRvIG9wdCBvdXQgb2YgdHlwZSBjaGVja2luZyBiZWZvcmUgYnVpbGQuIFRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCBpZiB5b3UgYXJlIGNvbmZpZGVudCB0aGF0IFR5cGVTY3JpcHQgaXMgYWxyZWFkeSBlcnJvcmxlc3MgKHRvIHNhdmUgdGltZSkuXG4gKiAgLS1lbmNvZGVTdHJpbmdNYXA9ZmFsc2UgLSBEaXNhYmxlcyB0aGUgZW5jb2Rpbmcgb2YgdGhlIHN0cmluZyBtYXAgaW4gdGhlIGJ1aWx0IGZpbGUuIFRoaXMgaXMgdXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogTWluaWZ5LXNwZWNpZmljIG9wdGlvbnM6XG4gKiAgLS1taW5pZnkuYmFiZWxUcmFuc3BpbGU9ZmFsc2UgLSBEaXNhYmxlcyBiYWJlbCB0cmFuc3BpbGF0aW9uIHBoYXNlLlxuICogIC0tbWluaWZ5LnVnbGlmeT1mYWxzZSAtIERpc2FibGVzIHVnbGlmaWNhdGlvbiwgc28gdGhlIGJ1aWx0IGZpbGUgd2lsbCBpbmNsdWRlIChlc3NlbnRpYWxseSkgY29uY2F0ZW5hdGVkIHNvdXJjZSBmaWxlcy5cbiAqICAtLW1pbmlmeS5tYW5nbGU9ZmFsc2UgLSBEdXJpbmcgdWdsaWZpY2F0aW9uLCBpdCB3aWxsIG5vdCBcIm1hbmdsZVwiIHZhcmlhYmxlIG5hbWVzICh3aGVyZSB0aGV5IGdldCByZW5hbWVkIHRvIHNob3J0IGNvbnN0YW50cyB0byByZWR1Y2UgZmlsZSBzaXplLilcbiAqICAtLW1pbmlmeS5iZWF1dGlmeT10cnVlIC0gQWZ0ZXIgdWdsaWZpY2F0aW9uLCB0aGUgc291cmNlIGNvZGUgd2lsbCBiZSBzeW50YXggZm9ybWF0dGVkIG5pY2VseVxuICogIC0tbWluaWZ5LnN0cmlwQXNzZXJ0aW9ucz1mYWxzZSAtIER1cmluZyB1Z2xpZmljYXRpb24sIGl0IHdpbGwgc3RyaXAgYXNzZXJ0aW9ucy5cbiAqICAtLW1pbmlmeS5zdHJpcExvZ2dpbmc9ZmFsc2UgLSBEdXJpbmcgdWdsaWZpY2F0aW9uLCBpdCB3aWxsIG5vdCBzdHJpcCBsb2dnaW5nIHN0YXRlbWVudHMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgZnMsIHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcGhldFRpbWluZ0xvZyBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3BoZXRUaW1pbmdMb2cuanMnO1xuaW1wb3J0IHR5cGVDaGVjayBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdHlwZUNoZWNrLmpzJztcbmltcG9ydCBnZXRCcmFuZHMgZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0QnJhbmRzLmpzJztcbmltcG9ydCBnZXRPcHRpb24sIHsgaXNPcHRpb25LZXlQcm92aWRlZCB9IGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldE9wdGlvbi5qcyc7XG5pbXBvcnQgZ2V0UmVwbyBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRSZXBvLmpzJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCB0cmFuc3BpbGUgZnJvbSAnLi4vLi4vY29tbW9uL3RyYW5zcGlsZS5qcyc7XG5pbXBvcnQgYnVpbGRSdW5uYWJsZSBmcm9tICcuLi9idWlsZFJ1bm5hYmxlLmpzJztcbmltcG9ydCBidWlsZFN0YW5kYWxvbmUgZnJvbSAnLi4vYnVpbGRTdGFuZGFsb25lLmpzJztcbmltcG9ydCBnZXRQaGV0TGlicyBmcm9tICcuLi9nZXRQaGV0TGlicy5qcyc7XG5pbXBvcnQgbWluaWZ5IGZyb20gJy4uL21pbmlmeS5qcyc7XG5cbmNvbnN0IHJlcG8gPSBnZXRSZXBvKCk7XG5cbi8qKlxuICogSW1tZWRpYXRlbHkgcnVuIHRoZSBidWlsZCBhbmQgZXhwb3J0IHRoZSBwcm9taXNlIGluIGNhc2UgdGhlIGNsaWVudCB3YW50cyB0byBhd2FpdCB0aGUgdGFzay5cbiAqL1xuZXhwb3J0IGNvbnN0IGJ1aWxkUHJvbWlzZSA9ICggYXN5bmMgKCkgPT4ge1xuICBhd2FpdCBwaGV0VGltaW5nTG9nLnN0YXJ0QXN5bmMoICdncnVudC1idWlsZCcsIGFzeW5jICgpID0+IHtcblxuICAgIC8vIFBhcnNlIG1pbmlmaWNhdGlvbiBrZXlzXG4gICAgY29uc3QgbWluaWZ5S2V5cyA9IE9iamVjdC5rZXlzKCBtaW5pZnkuTUlOSUZZX0RFRkFVTFRTICk7XG4gICAgY29uc3QgbWluaWZ5T3B0aW9uczogSW50ZW50aW9uYWxBbnkgPSB7fTtcbiAgICBtaW5pZnlLZXlzLmZvckVhY2goIG1pbmlmeUtleSA9PiB7XG4gICAgICBjb25zdCBvcHRpb24gPSBnZXRPcHRpb24oIGBtaW5pZnkuJHttaW5pZnlLZXl9YCApO1xuICAgICAgaWYgKCBvcHRpb24gPT09IHRydWUgfHwgb3B0aW9uID09PSBmYWxzZSApIHtcbiAgICAgICAgbWluaWZ5T3B0aW9uc1sgbWluaWZ5S2V5IF0gPSBvcHRpb247XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgY29uc3QgcmVwb1BhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XG5cbiAgICAvLyBSdW4gdGhlIHR5cGUgY2hlY2tlciBmaXJzdC5cbiAgICBjb25zdCBicmFuZHMgPSBnZXRCcmFuZHMoIHJlcG8gKTtcblxuICAgIGNvbnN0IHNob3VsZFR5cGVDaGVjayA9IGlzT3B0aW9uS2V5UHJvdmlkZWQoICd0eXBlLWNoZWNrJyApID8gZ2V0T3B0aW9uKCAndHlwZS1jaGVjaycgKSA6IHRydWU7XG4gICAgc2hvdWxkVHlwZUNoZWNrICYmIGF3YWl0IHBoZXRUaW1pbmdMb2cuc3RhcnRBc3luYyggJ3R5cGUtY2hlY2snLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgIC8vIFdlIG11c3QgaGF2ZSBwaGV0LWlvIGNvZGUgY2hlY2tlZCBvdXQgdG8gdHlwZSBjaGVjaywgc2luY2Ugc2ltTGF1bmNoZXIgaW1wb3J0cyBwaGV0aW9FbmdpbmVcbiAgICAgIC8vIGRvIE5PVCBydW4gdGhpcyBmb3IgcGhldC1saWIsIHNpbmNlIGl0IGlzIHR5cGUtY2hlY2tpbmcgdGhpbmdzIHVuZGVyIHNyYy8sIHdoaWNoIGlzIG5vdCBkZXNpcmFibGUuXG4gICAgICBpZiAoICggYnJhbmRzLmluY2x1ZGVzKCAncGhldC1pbycgKSB8fCBicmFuZHMuaW5jbHVkZXMoICdwaGV0JyApICkgJiYgcmVwbyAhPT0gJ3BoZXQtbGliJyApIHtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IHR5cGVDaGVjaygge1xuICAgICAgICAgIHJlcG86IHJlcG9cbiAgICAgICAgfSApO1xuICAgICAgICBpZiAoICFzdWNjZXNzICkge1xuICAgICAgICAgIGdydW50LmZhaWwuZmF0YWwoICdUeXBlIGNoZWNraW5nIGZhaWxlZCcgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnc2tpcHBpbmcgdHlwZSBjaGVja2luZycgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBkb1RyYW5zcGlsZSA9IGlzT3B0aW9uS2V5UHJvdmlkZWQoICd0cmFuc3BpbGUnICkgPyBnZXRPcHRpb24oICd0cmFuc3BpbGUnICkgOiB0cnVlO1xuICAgIGRvVHJhbnNwaWxlICYmIGF3YWl0IHBoZXRUaW1pbmdMb2cuc3RhcnRBc3luYyggJ3RyYW5zcGlsZScsIGFzeW5jICgpID0+IHtcblxuICAgICAgLy8gSWYgdGhhdCBzdWNjZWVkcywgdGhlbiBjb252ZXJ0IHRoZSBjb2RlIHRvIEpTXG4gICAgICBhd2FpdCB0cmFuc3BpbGUoIHtcbiAgICAgICAgcmVwb3M6IGdldFBoZXRMaWJzKCByZXBvICksXG4gICAgICAgIHNpbGVudDogdHJ1ZVxuICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIC8vIHN0YW5kYWxvbmVcbiAgICBpZiAoIHJlcG9QYWNrYWdlT2JqZWN0LnBoZXQuYnVpbGRTdGFuZGFsb25lICkge1xuICAgICAgY29uc29sZS5sb2coICdCdWlsZGluZyBzdGFuZGFsb25lIHJlcG9zaXRvcnknICk7XG5cbiAgICAgIGNvbnN0IHBhcmVudERpciA9IGAuLi8ke3JlcG99L2J1aWxkL2A7XG4gICAgICBpZiAoICFmcy5leGlzdHNTeW5jKCBwYXJlbnREaXIgKSApIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKCBwYXJlbnREaXIgKTtcbiAgICAgIH1cblxuICAgICAgZnMud3JpdGVGaWxlU3luYyggYCR7cGFyZW50RGlyfS8ke3JlcG99Lm1pbi5qc2AsIGF3YWl0IGJ1aWxkU3RhbmRhbG9uZSggcmVwbywgbWluaWZ5T3B0aW9ucyApICk7XG5cbiAgICAgIC8vIEJ1aWxkIGEgZGVidWcgdmVyc2lvblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlcXVpcmUtYXRvbWljLXVwZGF0ZXNcbiAgICAgIG1pbmlmeU9wdGlvbnMubWluaWZ5ID0gZmFsc2U7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVxdWlyZS1hdG9taWMtdXBkYXRlc1xuICAgICAgbWluaWZ5T3B0aW9ucy5iYWJlbFRyYW5zcGlsZSA9IGZhbHNlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlcXVpcmUtYXRvbWljLXVwZGF0ZXNcbiAgICAgIG1pbmlmeU9wdGlvbnMudWdsaWZ5ID0gZmFsc2U7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVxdWlyZS1hdG9taWMtdXBkYXRlc1xuICAgICAgbWluaWZ5T3B0aW9ucy5pc0RlYnVnID0gdHJ1ZTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoIGAke3BhcmVudERpcn0vJHtyZXBvfS5kZWJ1Zy5qc2AsIGF3YWl0IGJ1aWxkU3RhbmRhbG9uZSggcmVwbywgbWluaWZ5T3B0aW9ucyApICk7XG5cbiAgICAgIGlmICggcmVwb1BhY2thZ2VPYmplY3QucGhldC5zdGFuZGFsb25lVHJhbnNwaWxlcyApIHtcbiAgICAgICAgZm9yICggY29uc3QgZmlsZSBvZiByZXBvUGFja2FnZU9iamVjdC5waGV0LnN0YW5kYWxvbmVUcmFuc3BpbGVzICkge1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoIGAuLi8ke3JlcG99L2J1aWxkLyR7cGF0aC5iYXNlbmFtZSggZmlsZSApfWAsIG1pbmlmeSggZ3J1bnQuZmlsZS5yZWFkKCBmaWxlICkgKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICBjb25zdCBsb2NhbFBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XG4gICAgICBhc3NlcnQoIGxvY2FsUGFja2FnZU9iamVjdC5waGV0LnJ1bm5hYmxlLCBgJHtyZXBvfSBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgcnVubmFibGVgICk7XG4gICAgICBjb25zb2xlLmxvZyggYEJ1aWxkaW5nIHJ1bm5hYmxlIHJlcG9zaXRvcnkgKCR7cmVwb30sIGJyYW5kczogJHticmFuZHMuam9pbiggJywgJyApfSlgICk7XG5cbiAgICAgIC8vIE90aGVyIG9wdGlvbnNcbiAgICAgIGNvbnN0IGFsbEhUTUwgPSB0cnVlOyAvLyBBbHdheXMgYnVpbGQgdGhpcyBhcnRpZmFjdFxuICAgICAgY29uc3QgZW5jb2RlU3RyaW5nTWFwID0gZ2V0T3B0aW9uKCAnZW5jb2RlU3RyaW5nTWFwJyApICE9PSBmYWxzZTtcbiAgICAgIGNvbnN0IGNvbXByZXNzU2NyaXB0cyA9ICEhZ2V0T3B0aW9uKCAnY29tcHJlc3NTY3JpcHRzJyApO1xuICAgICAgY29uc3QgcHJvZmlsZUZpbGVTaXplID0gISFnZXRPcHRpb24oICdwcm9maWxlRmlsZVNpemUnICk7XG4gICAgICBjb25zdCBsb2NhbGVzT3B0aW9uID0gZ2V0T3B0aW9uKCAnbG9jYWxlcycgKSB8fCAnZW4nOyAvLyBEZWZhdWx0IGJhY2sgdG8gRW5nbGlzaCBmb3Igbm93XG5cbiAgICAgIGZvciAoIGNvbnN0IGJyYW5kIG9mIGJyYW5kcyApIHtcbiAgICAgICAgY29uc29sZS5sb2coIGBCdWlsZGluZyBicmFuZDogJHticmFuZH1gICk7XG5cbiAgICAgICAgYXdhaXQgcGhldFRpbWluZ0xvZy5zdGFydEFzeW5jKCAnYnVpbGQtYnJhbmQtJyArIGJyYW5kLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgYnVpbGRSdW5uYWJsZSggcmVwbywgbWluaWZ5T3B0aW9ucywgYWxsSFRNTCwgYnJhbmQsIGxvY2FsZXNPcHRpb24sIGVuY29kZVN0cmluZ01hcCwgY29tcHJlc3NTY3JpcHRzLCBwcm9maWxlRmlsZVNpemUsIHNob3VsZFR5cGVDaGVjayApO1xuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfVxuICB9ICk7XG59ICkoKTsiXSwibmFtZXMiOlsiYXNzZXJ0IiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJwYXRoIiwicGhldFRpbWluZ0xvZyIsInR5cGVDaGVjayIsImdldEJyYW5kcyIsImdldE9wdGlvbiIsImlzT3B0aW9uS2V5UHJvdmlkZWQiLCJnZXRSZXBvIiwiZ3J1bnQiLCJ0cmFuc3BpbGUiLCJidWlsZFJ1bm5hYmxlIiwiYnVpbGRTdGFuZGFsb25lIiwiZ2V0UGhldExpYnMiLCJtaW5pZnkiLCJyZXBvIiwiYnVpbGRQcm9taXNlIiwic3RhcnRBc3luYyIsIm1pbmlmeUtleXMiLCJPYmplY3QiLCJrZXlzIiwiTUlOSUZZX0RFRkFVTFRTIiwibWluaWZ5T3B0aW9ucyIsImZvckVhY2giLCJtaW5pZnlLZXkiLCJvcHRpb24iLCJyZXBvUGFja2FnZU9iamVjdCIsIkpTT04iLCJwYXJzZSIsImJyYW5kcyIsInNob3VsZFR5cGVDaGVjayIsImluY2x1ZGVzIiwic3VjY2VzcyIsImZhaWwiLCJmYXRhbCIsImNvbnNvbGUiLCJsb2ciLCJkb1RyYW5zcGlsZSIsInJlcG9zIiwic2lsZW50IiwicGhldCIsInBhcmVudERpciIsImV4aXN0c1N5bmMiLCJta2RpclN5bmMiLCJ3cml0ZUZpbGVTeW5jIiwiYmFiZWxUcmFuc3BpbGUiLCJ1Z2xpZnkiLCJpc0RlYnVnIiwic3RhbmRhbG9uZVRyYW5zcGlsZXMiLCJmaWxlIiwiYmFzZW5hbWUiLCJyZWFkIiwibG9jYWxQYWNrYWdlT2JqZWN0IiwicnVubmFibGUiLCJqb2luIiwiYWxsSFRNTCIsImVuY29kZVN0cmluZ01hcCIsImNvbXByZXNzU2NyaXB0cyIsInByb2ZpbGVGaWxlU2l6ZSIsImxvY2FsZXNPcHRpb24iLCJicmFuZCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0JDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFlBQVksU0FBUztBQUM1QixPQUFPQyxNQUFNQyxZQUFZLFFBQVEsS0FBSztBQUN0QyxPQUFPQyxVQUFVLE9BQU87QUFDeEIs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