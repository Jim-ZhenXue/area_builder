// Copyright 2015-2024, University of Colorado Boulder
/**
 * This grunt task iterates over all of the license.json files and reports any media files (images, sound, ...)
 * that have any of the following problems:
 *
 * incompatible-license    Known to be from an unapproved source outside of PhET
 * not-annotated           Missing license.json file or missing entry in license.json
 * missing-file            There is an entry in the license.json but no corresponding file
 *
 * This can be run from any simulation directory with `grunt report-media` and it reports for
 * all directories (not just the simulation at hand).
 *
 * Note that this program relies on numerous heuristics for determining the output, such as allowed entries that
 * determine if a file originates from PhET.
 *
 * See https://github.com/phetsims/tasks/issues/274
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
import path from 'path';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperConstants from '../common/ChipperConstants.js';
import getLicenseEntry from '../common/getLicenseEntry.js';
import getPhetLibs from '../grunt/getPhetLibs.js';
export default /*#__PURE__*/ _async_to_generator(function*(repo) {
    // Check for the dependencies of the target repo
    const dependencies = getPhetLibs(repo);
    // Start in the github checkout dir (above one of the sibling directories)
    const directory = process.cwd();
    const rootdir = `${directory}/../`;
    // Determines if our report was successful.
    let success = true;
    // Create a fast report based on the license.json files for the specified repository and directory (images or sound)
    for (const repo of dependencies){
        // Check if the repo is missing from the directory
        if (!grunt.file.exists(rootdir + repo)) {
            if (repo.startsWith('phet-io') || repo === 'studio') {
                console.log(`skipping repo (not checked out): ${repo}`);
                success = true;
                continue;
            } else {
                console.log(`missing repo: ${repo}`);
                success = false;
                continue;
            }
        }
        for (const directory of ChipperConstants.MEDIA_TYPES){
            const searchDir = `${rootdir + repo}/${directory}`;
            // Projects don't necessarily have all media directories
            if (grunt.file.exists(searchDir)) {
                // Iterate over all media directories, such as images and sounds recursively
                // eslint-disable-next-line @typescript-eslint/no-loop-func
                grunt.file.recurse(searchDir, (abspath, rootdir, subdir, filename)=>{
                    if (filename.endsWith('.js') || filename.endsWith('.ts')) {
                        return; // modulified data doesn't need to be checked
                    }
                    // Some files don't need to be attributed in the license.json
                    if (!abspath.includes('README.md') && !filename.startsWith('license.json')) {
                        // Classify the resource
                        const result = getLicenseEntry(abspath);
                        if (!result) {
                            grunt.log.error(`not-annotated: ${abspath}`);
                            success = false;
                        }
                    }
                    // Now iterate through the license.json entries and see which are missing files
                    // This helps to identify stale entries in the license.json files.
                    if (filename === 'license.json') {
                        const file = grunt.file.read(abspath);
                        const json = JSON.parse(file);
                        // For each key in the json file, make sure that file exists in the directory
                        for(const key in json){
                            if (json.hasOwnProperty(key)) {
                                // Checks for files in directory and subdirectory
                                const resourceFilename = `${path.dirname(abspath)}/${key}`;
                                const exists = grunt.file.exists(resourceFilename);
                                if (!exists) {
                                    grunt.log.error(`missing-file: ${repo}/${directory}/${key}`);
                                    success = false;
                                }
                            }
                        }
                    }
                });
            }
        }
    }
    if (!success) {
        grunt.fail.fatal('There is an issue with the licenses for media types.');
    }
    return success;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3JlcG9ydE1lZGlhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoaXMgZ3J1bnQgdGFzayBpdGVyYXRlcyBvdmVyIGFsbCBvZiB0aGUgbGljZW5zZS5qc29uIGZpbGVzIGFuZCByZXBvcnRzIGFueSBtZWRpYSBmaWxlcyAoaW1hZ2VzLCBzb3VuZCwgLi4uKVxuICogdGhhdCBoYXZlIGFueSBvZiB0aGUgZm9sbG93aW5nIHByb2JsZW1zOlxuICpcbiAqIGluY29tcGF0aWJsZS1saWNlbnNlICAgIEtub3duIHRvIGJlIGZyb20gYW4gdW5hcHByb3ZlZCBzb3VyY2Ugb3V0c2lkZSBvZiBQaEVUXG4gKiBub3QtYW5ub3RhdGVkICAgICAgICAgICBNaXNzaW5nIGxpY2Vuc2UuanNvbiBmaWxlIG9yIG1pc3NpbmcgZW50cnkgaW4gbGljZW5zZS5qc29uXG4gKiBtaXNzaW5nLWZpbGUgICAgICAgICAgICBUaGVyZSBpcyBhbiBlbnRyeSBpbiB0aGUgbGljZW5zZS5qc29uIGJ1dCBubyBjb3JyZXNwb25kaW5nIGZpbGVcbiAqXG4gKiBUaGlzIGNhbiBiZSBydW4gZnJvbSBhbnkgc2ltdWxhdGlvbiBkaXJlY3Rvcnkgd2l0aCBgZ3J1bnQgcmVwb3J0LW1lZGlhYCBhbmQgaXQgcmVwb3J0cyBmb3JcbiAqIGFsbCBkaXJlY3RvcmllcyAobm90IGp1c3QgdGhlIHNpbXVsYXRpb24gYXQgaGFuZCkuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgcHJvZ3JhbSByZWxpZXMgb24gbnVtZXJvdXMgaGV1cmlzdGljcyBmb3IgZGV0ZXJtaW5pbmcgdGhlIG91dHB1dCwgc3VjaCBhcyBhbGxvd2VkIGVudHJpZXMgdGhhdFxuICogZGV0ZXJtaW5lIGlmIGEgZmlsZSBvcmlnaW5hdGVzIGZyb20gUGhFVC5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Rhc2tzL2lzc3Vlcy8yNzRcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGdydW50IGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ucG0tZGVwZW5kZW5jaWVzL2dydW50LmpzJztcbmltcG9ydCBDaGlwcGVyQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9DaGlwcGVyQ29uc3RhbnRzLmpzJztcbmltcG9ydCBnZXRMaWNlbnNlRW50cnkgZnJvbSAnLi4vY29tbW9uL2dldExpY2Vuc2VFbnRyeS5qcyc7XG5pbXBvcnQgZ2V0UGhldExpYnMgZnJvbSAnLi4vZ3J1bnQvZ2V0UGhldExpYnMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoIHJlcG86IHN0cmluZyApOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcblxuICAvLyBDaGVjayBmb3IgdGhlIGRlcGVuZGVuY2llcyBvZiB0aGUgdGFyZ2V0IHJlcG9cbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gZ2V0UGhldExpYnMoIHJlcG8gKTtcblxuICAvLyBTdGFydCBpbiB0aGUgZ2l0aHViIGNoZWNrb3V0IGRpciAoYWJvdmUgb25lIG9mIHRoZSBzaWJsaW5nIGRpcmVjdG9yaWVzKVxuICBjb25zdCBkaXJlY3RvcnkgPSBwcm9jZXNzLmN3ZCgpO1xuICBjb25zdCByb290ZGlyID0gYCR7ZGlyZWN0b3J5fS8uLi9gO1xuXG4gIC8vIERldGVybWluZXMgaWYgb3VyIHJlcG9ydCB3YXMgc3VjY2Vzc2Z1bC5cbiAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuXG4gIC8vIENyZWF0ZSBhIGZhc3QgcmVwb3J0IGJhc2VkIG9uIHRoZSBsaWNlbnNlLmpzb24gZmlsZXMgZm9yIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeSBhbmQgZGlyZWN0b3J5IChpbWFnZXMgb3Igc291bmQpXG4gIGZvciAoIGNvbnN0IHJlcG8gb2YgZGVwZW5kZW5jaWVzICkge1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHJlcG8gaXMgbWlzc2luZyBmcm9tIHRoZSBkaXJlY3RvcnlcbiAgICBpZiAoICFncnVudC5maWxlLmV4aXN0cyggcm9vdGRpciArIHJlcG8gKSApIHtcblxuICAgICAgaWYgKCByZXBvLnN0YXJ0c1dpdGgoICdwaGV0LWlvJyApIHx8IHJlcG8gPT09ICdzdHVkaW8nICkge1xuICAgICAgICBjb25zb2xlLmxvZyggYHNraXBwaW5nIHJlcG8gKG5vdCBjaGVja2VkIG91dCk6ICR7cmVwb31gICk7XG4gICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyggYG1pc3NpbmcgcmVwbzogJHtyZXBvfWAgKTtcbiAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICggY29uc3QgZGlyZWN0b3J5IG9mIENoaXBwZXJDb25zdGFudHMuTUVESUFfVFlQRVMgKSB7XG4gICAgICBjb25zdCBzZWFyY2hEaXIgPSBgJHtyb290ZGlyICsgcmVwb30vJHtkaXJlY3Rvcnl9YDtcblxuICAgICAgLy8gUHJvamVjdHMgZG9uJ3QgbmVjZXNzYXJpbHkgaGF2ZSBhbGwgbWVkaWEgZGlyZWN0b3JpZXNcbiAgICAgIGlmICggZ3J1bnQuZmlsZS5leGlzdHMoIHNlYXJjaERpciApICkge1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgb3ZlciBhbGwgbWVkaWEgZGlyZWN0b3JpZXMsIHN1Y2ggYXMgaW1hZ2VzIGFuZCBzb3VuZHMgcmVjdXJzaXZlbHlcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1sb29wLWZ1bmNcbiAgICAgICAgZ3J1bnQuZmlsZS5yZWN1cnNlKCBzZWFyY2hEaXIsICggYWJzcGF0aCwgcm9vdGRpciwgc3ViZGlyLCBmaWxlbmFtZSApID0+IHtcblxuICAgICAgICAgIGlmICggZmlsZW5hbWUuZW5kc1dpdGgoICcuanMnICkgfHwgZmlsZW5hbWUuZW5kc1dpdGgoICcudHMnICkgKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIG1vZHVsaWZpZWQgZGF0YSBkb2Vzbid0IG5lZWQgdG8gYmUgY2hlY2tlZFxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNvbWUgZmlsZXMgZG9uJ3QgbmVlZCB0byBiZSBhdHRyaWJ1dGVkIGluIHRoZSBsaWNlbnNlLmpzb25cbiAgICAgICAgICBpZiAoICFhYnNwYXRoLmluY2x1ZGVzKCAnUkVBRE1FLm1kJyApICYmXG4gICAgICAgICAgICAgICAhZmlsZW5hbWUuc3RhcnRzV2l0aCggJ2xpY2Vuc2UuanNvbicgKSApIHtcblxuICAgICAgICAgICAgLy8gQ2xhc3NpZnkgdGhlIHJlc291cmNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBnZXRMaWNlbnNlRW50cnkoIGFic3BhdGggKTtcblxuICAgICAgICAgICAgaWYgKCAhcmVzdWx0ICkge1xuICAgICAgICAgICAgICBncnVudC5sb2cuZXJyb3IoIGBub3QtYW5ub3RhdGVkOiAke2Fic3BhdGh9YCApO1xuICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTm93IGl0ZXJhdGUgdGhyb3VnaCB0aGUgbGljZW5zZS5qc29uIGVudHJpZXMgYW5kIHNlZSB3aGljaCBhcmUgbWlzc2luZyBmaWxlc1xuICAgICAgICAgIC8vIFRoaXMgaGVscHMgdG8gaWRlbnRpZnkgc3RhbGUgZW50cmllcyBpbiB0aGUgbGljZW5zZS5qc29uIGZpbGVzLlxuICAgICAgICAgIGlmICggZmlsZW5hbWUgPT09ICdsaWNlbnNlLmpzb24nICkge1xuXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gZ3J1bnQuZmlsZS5yZWFkKCBhYnNwYXRoICk7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZSggZmlsZSApO1xuXG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBrZXkgaW4gdGhlIGpzb24gZmlsZSwgbWFrZSBzdXJlIHRoYXQgZmlsZSBleGlzdHMgaW4gdGhlIGRpcmVjdG9yeVxuICAgICAgICAgICAgZm9yICggY29uc3Qga2V5IGluIGpzb24gKSB7XG4gICAgICAgICAgICAgIGlmICgganNvbi5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVja3MgZm9yIGZpbGVzIGluIGRpcmVjdG9yeSBhbmQgc3ViZGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VGaWxlbmFtZSA9IGAke3BhdGguZGlybmFtZSggYWJzcGF0aCApfS8ke2tleX1gO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0cyA9IGdydW50LmZpbGUuZXhpc3RzKCByZXNvdXJjZUZpbGVuYW1lICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoICFleGlzdHMgKSB7XG4gICAgICAgICAgICAgICAgICBncnVudC5sb2cuZXJyb3IoIGBtaXNzaW5nLWZpbGU6ICR7cmVwb30vJHtkaXJlY3Rvcnl9LyR7a2V5fWAgKTtcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoICFzdWNjZXNzICkge1xuICAgIGdydW50LmZhaWwuZmF0YWwoICdUaGVyZSBpcyBhbiBpc3N1ZSB3aXRoIHRoZSBsaWNlbnNlcyBmb3IgbWVkaWEgdHlwZXMuJyApO1xuICB9XG5cbiAgcmV0dXJuIHN1Y2Nlc3M7XG59OyJdLCJuYW1lcyI6WyJwYXRoIiwiZ3J1bnQiLCJDaGlwcGVyQ29uc3RhbnRzIiwiZ2V0TGljZW5zZUVudHJ5IiwiZ2V0UGhldExpYnMiLCJyZXBvIiwiZGVwZW5kZW5jaWVzIiwiZGlyZWN0b3J5IiwicHJvY2VzcyIsImN3ZCIsInJvb3RkaXIiLCJzdWNjZXNzIiwiZmlsZSIsImV4aXN0cyIsInN0YXJ0c1dpdGgiLCJjb25zb2xlIiwibG9nIiwiTUVESUFfVFlQRVMiLCJzZWFyY2hEaXIiLCJyZWN1cnNlIiwiYWJzcGF0aCIsInN1YmRpciIsImZpbGVuYW1lIiwiZW5kc1dpdGgiLCJpbmNsdWRlcyIsInJlc3VsdCIsImVycm9yIiwicmVhZCIsImpzb24iLCJKU09OIiwicGFyc2UiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInJlc291cmNlRmlsZW5hbWUiLCJkaXJuYW1lIiwiZmFpbCIsImZhdGFsIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFVBQVUsT0FBTztBQUN4QixPQUFPQyxXQUFXLHdEQUF3RDtBQUMxRSxPQUFPQyxzQkFBc0IsZ0NBQWdDO0FBQzdELE9BQU9DLHFCQUFxQiwrQkFBK0I7QUFDM0QsT0FBT0MsaUJBQWlCLDBCQUEwQjtBQUVsRCxpREFBZSxVQUFRQztJQUVyQixnREFBZ0Q7SUFDaEQsTUFBTUMsZUFBZUYsWUFBYUM7SUFFbEMsMEVBQTBFO0lBQzFFLE1BQU1FLFlBQVlDLFFBQVFDLEdBQUc7SUFDN0IsTUFBTUMsVUFBVSxHQUFHSCxVQUFVLElBQUksQ0FBQztJQUVsQywyQ0FBMkM7SUFDM0MsSUFBSUksVUFBVTtJQUVkLG9IQUFvSDtJQUNwSCxLQUFNLE1BQU1OLFFBQVFDLGFBQWU7UUFFakMsa0RBQWtEO1FBQ2xELElBQUssQ0FBQ0wsTUFBTVcsSUFBSSxDQUFDQyxNQUFNLENBQUVILFVBQVVMLE9BQVM7WUFFMUMsSUFBS0EsS0FBS1MsVUFBVSxDQUFFLGNBQWVULFNBQVMsVUFBVztnQkFDdkRVLFFBQVFDLEdBQUcsQ0FBRSxDQUFDLGlDQUFpQyxFQUFFWCxNQUFNO2dCQUN2RE0sVUFBVTtnQkFDVjtZQUNGLE9BQ0s7Z0JBQ0hJLFFBQVFDLEdBQUcsQ0FBRSxDQUFDLGNBQWMsRUFBRVgsTUFBTTtnQkFDcENNLFVBQVU7Z0JBQ1Y7WUFDRjtRQUNGO1FBQ0EsS0FBTSxNQUFNSixhQUFhTCxpQkFBaUJlLFdBQVcsQ0FBRztZQUN0RCxNQUFNQyxZQUFZLEdBQUdSLFVBQVVMLEtBQUssQ0FBQyxFQUFFRSxXQUFXO1lBRWxELHdEQUF3RDtZQUN4RCxJQUFLTixNQUFNVyxJQUFJLENBQUNDLE1BQU0sQ0FBRUssWUFBYztnQkFFcEMsNEVBQTRFO2dCQUM1RSwyREFBMkQ7Z0JBQzNEakIsTUFBTVcsSUFBSSxDQUFDTyxPQUFPLENBQUVELFdBQVcsQ0FBRUUsU0FBU1YsU0FBU1csUUFBUUM7b0JBRXpELElBQUtBLFNBQVNDLFFBQVEsQ0FBRSxVQUFXRCxTQUFTQyxRQUFRLENBQUUsUUFBVTt3QkFDOUQsUUFBUSw2Q0FBNkM7b0JBQ3ZEO29CQUVBLDZEQUE2RDtvQkFDN0QsSUFBSyxDQUFDSCxRQUFRSSxRQUFRLENBQUUsZ0JBQ25CLENBQUNGLFNBQVNSLFVBQVUsQ0FBRSxpQkFBbUI7d0JBRTVDLHdCQUF3Qjt3QkFDeEIsTUFBTVcsU0FBU3RCLGdCQUFpQmlCO3dCQUVoQyxJQUFLLENBQUNLLFFBQVM7NEJBQ2J4QixNQUFNZSxHQUFHLENBQUNVLEtBQUssQ0FBRSxDQUFDLGVBQWUsRUFBRU4sU0FBUzs0QkFDNUNULFVBQVU7d0JBQ1o7b0JBQ0Y7b0JBRUEsK0VBQStFO29CQUMvRSxrRUFBa0U7b0JBQ2xFLElBQUtXLGFBQWEsZ0JBQWlCO3dCQUVqQyxNQUFNVixPQUFPWCxNQUFNVyxJQUFJLENBQUNlLElBQUksQ0FBRVA7d0JBQzlCLE1BQU1RLE9BQU9DLEtBQUtDLEtBQUssQ0FBRWxCO3dCQUV6Qiw2RUFBNkU7d0JBQzdFLElBQU0sTUFBTW1CLE9BQU9ILEtBQU87NEJBQ3hCLElBQUtBLEtBQUtJLGNBQWMsQ0FBRUQsTUFBUTtnQ0FFaEMsaURBQWlEO2dDQUNqRCxNQUFNRSxtQkFBbUIsR0FBR2pDLEtBQUtrQyxPQUFPLENBQUVkLFNBQVUsQ0FBQyxFQUFFVyxLQUFLO2dDQUM1RCxNQUFNbEIsU0FBU1osTUFBTVcsSUFBSSxDQUFDQyxNQUFNLENBQUVvQjtnQ0FFbEMsSUFBSyxDQUFDcEIsUUFBUztvQ0FDYlosTUFBTWUsR0FBRyxDQUFDVSxLQUFLLENBQUUsQ0FBQyxjQUFjLEVBQUVyQixLQUFLLENBQUMsRUFBRUUsVUFBVSxDQUFDLEVBQUV3QixLQUFLO29DQUM1RHBCLFVBQVU7Z0NBQ1o7NEJBQ0Y7d0JBQ0Y7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7SUFFQSxJQUFLLENBQUNBLFNBQVU7UUFDZFYsTUFBTWtDLElBQUksQ0FBQ0MsS0FBSyxDQUFFO0lBQ3BCO0lBRUEsT0FBT3pCO0FBQ1QsR0FBRSJ9