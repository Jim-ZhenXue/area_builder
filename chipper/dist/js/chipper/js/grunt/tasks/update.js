// Copyright 2013-2024, University of Colorado Boulder
/**
 * Updates the normal automatically-generated files for this repository. Includes:
 * * runnables: generate-development-html and modulify
 * * accessible runnables: generate-a11y-view-html
 * * unit tests: generate-test-html
 * * simulations: generateREADME()
 * * phet-io simulations: generate overrides file if needed
 * * create the conglomerate string files for unbuilt mode, for this repo and its dependencies
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
import fs, { readFileSync } from 'fs';
import _ from 'lodash';
import writeFileAndGitAdd from '../../../../perennial-alias/js/common/writeFileAndGitAdd.js';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import grunt from '../../../../perennial-alias/js/npm-dependencies/grunt.js';
import generateA11yViewHTML from '../generateA11yViewHTML.js';
import generateDevelopmentHTML from '../generateDevelopmentHTML.js';
import generateREADME from '../generateREADME.js';
import generateTestHTML from '../generateTestHTML.js';
const repo = getRepo();
const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
// support repos that don't have a phet object
if (!packageObject.phet) {
// skip, nothing to do
} else {
    _async_to_generator(function*() {
        // modulify is graceful if there are no files that need modulifying.
        yield (yield import('./modulify.js')).modulifyPromise;
        // update README.md only for simulations
        if (packageObject.phet.simulation && !packageObject.phet.readmeCreatedManually) {
            yield generateREADME(repo, !!packageObject.phet.published);
        }
        if (packageObject.phet.supportedBrands && packageObject.phet.supportedBrands.includes('phet-io')) {
            // Copied from build.json and used as a preload for phet-io brand
            const overridesFile = `js/${repo}-phet-io-overrides.js`;
            // If there is already an overrides file, don't overwrite it with an empty one
            if (!fs.existsSync(`../${repo}/${overridesFile}`)) {
                const overridesContent = '/* eslint-disable */\nwindow.phet.preloads.phetio.phetioElementsOverrides = {};';
                yield writeFileAndGitAdd(repo, overridesFile, overridesContent);
            }
            let simSpecificWrappers;
            try {
                // Populate sim-specific wrappers into the package.json
                simSpecificWrappers = fs.readdirSync(`../phet-io-sim-specific/repos/${repo}/wrappers/`, {
                    withFileTypes: true
                }).filter((dirent)=>dirent.isDirectory()).map((dirent)=>`phet-io-sim-specific/repos/${repo}/wrappers/${dirent.name}`);
                if (simSpecificWrappers.length > 0) {
                    packageObject.phet['phet-io'] = packageObject.phet['phet-io'] || {};
                    packageObject.phet['phet-io'].wrappers = _.uniq(simSpecificWrappers.concat(packageObject.phet['phet-io'].wrappers || []));
                    grunt.file.write('package.json', JSON.stringify(packageObject, null, 2));
                }
            } catch (e) {
                if (e instanceof Error && !e.message.includes('no such file or directory')) {
                    throw e;
                }
            }
        }
        // The above code can mutate the package.json, so do these after
        if (packageObject.phet.runnable) {
            yield generateDevelopmentHTML(repo);
            if (packageObject.phet.simFeatures && packageObject.phet.simFeatures.supportsInteractiveDescription) {
                yield generateA11yViewHTML(repo);
            }
        }
        if (packageObject.phet.generatedUnitTests) {
            yield generateTestHTML(repo);
        }
    })();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL3VwZGF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBub3JtYWwgYXV0b21hdGljYWxseS1nZW5lcmF0ZWQgZmlsZXMgZm9yIHRoaXMgcmVwb3NpdG9yeS4gSW5jbHVkZXM6XG4gKiAqIHJ1bm5hYmxlczogZ2VuZXJhdGUtZGV2ZWxvcG1lbnQtaHRtbCBhbmQgbW9kdWxpZnlcbiAqICogYWNjZXNzaWJsZSBydW5uYWJsZXM6IGdlbmVyYXRlLWExMXktdmlldy1odG1sXG4gKiAqIHVuaXQgdGVzdHM6IGdlbmVyYXRlLXRlc3QtaHRtbFxuICogKiBzaW11bGF0aW9uczogZ2VuZXJhdGVSRUFETUUoKVxuICogKiBwaGV0LWlvIHNpbXVsYXRpb25zOiBnZW5lcmF0ZSBvdmVycmlkZXMgZmlsZSBpZiBuZWVkZWRcbiAqICogY3JlYXRlIHRoZSBjb25nbG9tZXJhdGUgc3RyaW5nIGZpbGVzIGZvciB1bmJ1aWx0IG1vZGUsIGZvciB0aGlzIHJlcG8gYW5kIGl0cyBkZXBlbmRlbmNpZXNcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBmcywgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHdyaXRlRmlsZUFuZEdpdEFkZCBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3dyaXRlRmlsZUFuZEdpdEFkZC5qcyc7XG5pbXBvcnQgZ2V0UmVwbyBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRSZXBvLmpzJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVBMTF5Vmlld0hUTUwgZnJvbSAnLi4vZ2VuZXJhdGVBMTF5Vmlld0hUTUwuanMnO1xuaW1wb3J0IGdlbmVyYXRlRGV2ZWxvcG1lbnRIVE1MIGZyb20gJy4uL2dlbmVyYXRlRGV2ZWxvcG1lbnRIVE1MLmpzJztcbmltcG9ydCBnZW5lcmF0ZVJFQURNRSBmcm9tICcuLi9nZW5lcmF0ZVJFQURNRS5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVUZXN0SFRNTCBmcm9tICcuLi9nZW5lcmF0ZVRlc3RIVE1MLmpzJztcblxuY29uc3QgcmVwbyA9IGdldFJlcG8oKTtcblxuY29uc3QgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIHJlYWRGaWxlU3luYyggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCwgJ3V0ZjgnICkgKTtcblxuLy8gc3VwcG9ydCByZXBvcyB0aGF0IGRvbid0IGhhdmUgYSBwaGV0IG9iamVjdFxuaWYgKCAhcGFja2FnZU9iamVjdC5waGV0ICkge1xuXG4gIC8vIHNraXAsIG5vdGhpbmcgdG8gZG9cbn1cbmVsc2Uge1xuXG4gICggYXN5bmMgKCkgPT4ge1xuXG4gICAgLy8gbW9kdWxpZnkgaXMgZ3JhY2VmdWwgaWYgdGhlcmUgYXJlIG5vIGZpbGVzIHRoYXQgbmVlZCBtb2R1bGlmeWluZy5cbiAgICBhd2FpdCAoIGF3YWl0IGltcG9ydCggJy4vbW9kdWxpZnkuanMnICkgKS5tb2R1bGlmeVByb21pc2U7XG5cbiAgICAvLyB1cGRhdGUgUkVBRE1FLm1kIG9ubHkgZm9yIHNpbXVsYXRpb25zXG4gICAgaWYgKCBwYWNrYWdlT2JqZWN0LnBoZXQuc2ltdWxhdGlvbiAmJiAhcGFja2FnZU9iamVjdC5waGV0LnJlYWRtZUNyZWF0ZWRNYW51YWxseSApIHtcbiAgICAgIGF3YWl0IGdlbmVyYXRlUkVBRE1FKCByZXBvLCAhIXBhY2thZ2VPYmplY3QucGhldC5wdWJsaXNoZWQgKTtcbiAgICB9XG5cbiAgICBpZiAoIHBhY2thZ2VPYmplY3QucGhldC5zdXBwb3J0ZWRCcmFuZHMgJiYgcGFja2FnZU9iamVjdC5waGV0LnN1cHBvcnRlZEJyYW5kcy5pbmNsdWRlcyggJ3BoZXQtaW8nICkgKSB7XG5cbiAgICAgIC8vIENvcGllZCBmcm9tIGJ1aWxkLmpzb24gYW5kIHVzZWQgYXMgYSBwcmVsb2FkIGZvciBwaGV0LWlvIGJyYW5kXG4gICAgICBjb25zdCBvdmVycmlkZXNGaWxlID0gYGpzLyR7cmVwb30tcGhldC1pby1vdmVycmlkZXMuanNgO1xuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIG92ZXJyaWRlcyBmaWxlLCBkb24ndCBvdmVyd3JpdGUgaXQgd2l0aCBhbiBlbXB0eSBvbmVcbiAgICAgIGlmICggIWZzLmV4aXN0c1N5bmMoIGAuLi8ke3JlcG99LyR7b3ZlcnJpZGVzRmlsZX1gICkgKSB7XG5cbiAgICAgICAgY29uc3Qgb3ZlcnJpZGVzQ29udGVudCA9ICcvKiBlc2xpbnQtZGlzYWJsZSAqL1xcbndpbmRvdy5waGV0LnByZWxvYWRzLnBoZXRpby5waGV0aW9FbGVtZW50c092ZXJyaWRlcyA9IHt9Oyc7XG4gICAgICAgIGF3YWl0IHdyaXRlRmlsZUFuZEdpdEFkZCggcmVwbywgb3ZlcnJpZGVzRmlsZSwgb3ZlcnJpZGVzQ29udGVudCApO1xuICAgICAgfVxuXG4gICAgICBsZXQgc2ltU3BlY2lmaWNXcmFwcGVycztcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFBvcHVsYXRlIHNpbS1zcGVjaWZpYyB3cmFwcGVycyBpbnRvIHRoZSBwYWNrYWdlLmpzb25cbiAgICAgICAgc2ltU3BlY2lmaWNXcmFwcGVycyA9IGZzLnJlYWRkaXJTeW5jKCBgLi4vcGhldC1pby1zaW0tc3BlY2lmaWMvcmVwb3MvJHtyZXBvfS93cmFwcGVycy9gLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSApXG4gICAgICAgICAgLmZpbHRlciggZGlyZW50ID0+IGRpcmVudC5pc0RpcmVjdG9yeSgpIClcbiAgICAgICAgICAubWFwKCBkaXJlbnQgPT4gYHBoZXQtaW8tc2ltLXNwZWNpZmljL3JlcG9zLyR7cmVwb30vd3JhcHBlcnMvJHtkaXJlbnQubmFtZX1gICk7XG4gICAgICAgIGlmICggc2ltU3BlY2lmaWNXcmFwcGVycy5sZW5ndGggPiAwICkge1xuXG4gICAgICAgICAgcGFja2FnZU9iamVjdC5waGV0WyAncGhldC1pbycgXSA9IHBhY2thZ2VPYmplY3QucGhldFsgJ3BoZXQtaW8nIF0gfHwge307XG4gICAgICAgICAgcGFja2FnZU9iamVjdC5waGV0WyAncGhldC1pbycgXS53cmFwcGVycyA9IF8udW5pcSggc2ltU3BlY2lmaWNXcmFwcGVycy5jb25jYXQoIHBhY2thZ2VPYmplY3QucGhldFsgJ3BoZXQtaW8nIF0ud3JhcHBlcnMgfHwgW10gKSApO1xuICAgICAgICAgIGdydW50LmZpbGUud3JpdGUoICdwYWNrYWdlLmpzb24nLCBKU09OLnN0cmluZ2lmeSggcGFja2FnZU9iamVjdCwgbnVsbCwgMiApICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNhdGNoKCBlOiB1bmtub3duICkge1xuICAgICAgICBpZiAoIGUgaW5zdGFuY2VvZiBFcnJvciAmJiAhZS5tZXNzYWdlLmluY2x1ZGVzKCAnbm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeScgKSApIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhlIGFib3ZlIGNvZGUgY2FuIG11dGF0ZSB0aGUgcGFja2FnZS5qc29uLCBzbyBkbyB0aGVzZSBhZnRlclxuICAgIGlmICggcGFja2FnZU9iamVjdC5waGV0LnJ1bm5hYmxlICkge1xuXG4gICAgICBhd2FpdCBnZW5lcmF0ZURldmVsb3BtZW50SFRNTCggcmVwbyApO1xuXG4gICAgICBpZiAoIHBhY2thZ2VPYmplY3QucGhldC5zaW1GZWF0dXJlcyAmJiBwYWNrYWdlT2JqZWN0LnBoZXQuc2ltRmVhdHVyZXMuc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uICkge1xuICAgICAgICBhd2FpdCBnZW5lcmF0ZUExMXlWaWV3SFRNTCggcmVwbyApO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIHBhY2thZ2VPYmplY3QucGhldC5nZW5lcmF0ZWRVbml0VGVzdHMgKSB7XG4gICAgICBhd2FpdCBnZW5lcmF0ZVRlc3RIVE1MKCByZXBvICk7XG4gICAgfVxuICB9ICkoKTtcbn0iXSwibmFtZXMiOlsiZnMiLCJyZWFkRmlsZVN5bmMiLCJfIiwid3JpdGVGaWxlQW5kR2l0QWRkIiwiZ2V0UmVwbyIsImdydW50IiwiZ2VuZXJhdGVBMTF5Vmlld0hUTUwiLCJnZW5lcmF0ZURldmVsb3BtZW50SFRNTCIsImdlbmVyYXRlUkVBRE1FIiwiZ2VuZXJhdGVUZXN0SFRNTCIsInJlcG8iLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwicGhldCIsIm1vZHVsaWZ5UHJvbWlzZSIsInNpbXVsYXRpb24iLCJyZWFkbWVDcmVhdGVkTWFudWFsbHkiLCJwdWJsaXNoZWQiLCJzdXBwb3J0ZWRCcmFuZHMiLCJpbmNsdWRlcyIsIm92ZXJyaWRlc0ZpbGUiLCJleGlzdHNTeW5jIiwib3ZlcnJpZGVzQ29udGVudCIsInNpbVNwZWNpZmljV3JhcHBlcnMiLCJyZWFkZGlyU3luYyIsIndpdGhGaWxlVHlwZXMiLCJmaWx0ZXIiLCJkaXJlbnQiLCJpc0RpcmVjdG9yeSIsIm1hcCIsIm5hbWUiLCJsZW5ndGgiLCJ3cmFwcGVycyIsInVuaXEiLCJjb25jYXQiLCJmaWxlIiwid3JpdGUiLCJzdHJpbmdpZnkiLCJlIiwiRXJyb3IiLCJtZXNzYWdlIiwicnVubmFibGUiLCJzaW1GZWF0dXJlcyIsInN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbiIsImdlbmVyYXRlZFVuaXRUZXN0cyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7O0NBVUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsTUFBTUMsWUFB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