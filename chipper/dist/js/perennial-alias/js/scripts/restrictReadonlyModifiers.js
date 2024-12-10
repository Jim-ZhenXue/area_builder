// Copyright 2024, University of Colorado Boulder
/**
 * This script automates the process of enforcing the 'readonly' modifier on class properties within TypeScript files in a specified project.
 * It iterates over TypeScript files in the 'js/' directory, attempting to add the 'readonly' modifier to class properties that are not already readonly.
 * After each modification, it runs the TypeScript type checker to validate the change. If the type checker fails, it reverts the change.
 * This helps in ensuring that class properties are immutable where possible, enhancing code reliability and maintainability.
 *
 * Usage:
 * cd perennial-alias/
 * sage run js/scripts/enforceReadonlyModifiers.ts [relative-path-to-repo-directory]
 *
 * Parameters:
 * [relative-path-to-repo-directory] - The path to the repository where TypeScript files are located. This script assumes
 *                            a 'tsconfig.json' file is present at the root of the specified directory.
 *
 * Options:
 * --help                   - Displays this help message and exits.
 *
 * Example:
 * sage run js/scripts/enforceReadonlyModifiers.ts ../my-ts-project
 *
 * Note:
 * - Ensure that 'tsconfig.json' is correctly set up in your project root.
 * - The script currently targets files within the 'js/' directory by default. Adjust the glob pattern in the
 *   getSourceFiles method call if your project structure differs.
 * - This script requires Node.js and the 'ts-morph' and 'child_process' packages.
 * - The script makes changes to the repo as it progresses. If you look at the source files while this script is running
 *   you will see the changes being made to trial values.
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
import { execSync } from 'child_process';
import { Project } from 'ts-morph';
function enforceReadonlyModifiers(repoPath) {
    return _enforceReadonlyModifiers.apply(this, arguments);
}
function _enforceReadonlyModifiers() {
    _enforceReadonlyModifiers = /**
 * Function to enforce 'readonly' on class properties
 * @param repoPath - The path to the repository directory
 */ _async_to_generator(function*(repoPath) {
        // Initialize a new ts-morph Project
        const project = new Project({
            // Assuming tsconfig.json is in the root, adjust if necessary
            tsConfigFilePath: `${repoPath}/tsconfig.json`
        });
        // Retrieve all TypeScript source files in the 'js/' directory
        const sourceFiles = project.getSourceFiles(`${repoPath}/js/**/*.ts`); // Adjust the glob pattern as necessary
        for (const sourceFile of sourceFiles){
            const classes = sourceFile.getClasses();
            for (const classDeclaration of classes){
                const className = classDeclaration.getName() || '<Unnamed Class>';
                console.log(`# Processing class: ${className}`);
                // Retrieve all property declarations (both instance and static)
                const properties = classDeclaration.getProperties();
                for (const property of properties){
                    const propertyName = property.getName();
                    const isReadonly = property.isReadonly();
                    if (isReadonly) {
                        console.log(`  - Property '${propertyName}' is already readonly. Skipping.`);
                        continue;
                    }
                    console.log(`  - Attempting to set 'readonly' on property '${propertyName}'.`);
                    // Add 'readonly' modifier
                    property.setIsReadonly(true);
                    yield sourceFile.save();
                    if (isBuildSuccessful(repoPath)) {
                        console.log(`    Successfully set 'readonly' on '${propertyName}'.`);
                    } else {
                        // Revert the change if the build fails
                        property.setIsReadonly(false);
                        yield sourceFile.save();
                        console.log(`    Failed to set 'readonly' on '${propertyName}'. Reverted the change.`);
                    }
                }
            }
        }
    });
    return _enforceReadonlyModifiers.apply(this, arguments);
}
// Check if there is a --help command line argument
if (process.argv.includes('--help')) {
    console.log(`
\x1b[1mUsage:\x1b[0m
  \x1b[36mcd perennial-alias/\x1b[0m
  \x1b[36msage run js/scripts/enforceReadonlyModifiers.ts [relative-path-to-repo-directory]\x1b[0m

\x1b[1mParameters:\x1b[0m
  \x1b[33m[relative-path-to-repo-directory]\x1b[0m - The path to the repository where TypeScript files are located. Assumes
                           a 'tsconfig.json' file is present at the root of the specified directory.

\x1b[1mOptions:\x1b[0m
  \x1b[32m--help\x1b[0m                  - Displays this help message and exits.

\x1b[1mExample:\x1b[0m
  \x1b[36msage run js/scripts/enforceReadonlyModifiers.ts ../my-ts-project\x1b[0m

\x1b[1mNote:\x1b[0m
- Ensure that 'tsconfig.json' is correctly set up in your project root.
- The script currently targets files within the 'js/' directory by default. Adjust the glob pattern in the
  getSourceFiles method call if your project structure differs.
- This script requires Node.js and the 'ts-morph' and 'child_process' packages.
- The script makes changes to the repo as it progresses. If you look at the source files while this script 
  is running you will see the changes being made to trial values.
  `);
    process.exit(0);
}
// Check if the path to the repository directory is provided
if (process.argv.length < 3) {
    console.error('Error: Please provide the path to the repository directory. Check --help for instructions.');
    process.exit(1);
}
// Set the path to the repository directory
const repoPath = process.argv[2];
/**
 * Check if the proposed change (already saved to the filesystem) passes the type checker.
 * @param repoPath - The path to the repository directory
 * @returns - True if the build is successful, else false
 */ function isBuildSuccessful(repoPath) {
    try {
        // Specify the path to the TypeScript compiler or build command you want to use
        const gruntCommand = require('../../../perennial-alias/js/common/gruntCommand.js');
        // Run the specified TypeScript compiler or build command in the current directory
        const result = execSync(`${gruntCommand} type-check`, {
            // set the working directory
            cwd: repoPath,
            stdio: 'pipe',
            encoding: 'utf-8'
        });
        if (result.toLowerCase().includes('error')) {
            return false;
        }
        // If the build command exits without error, the build is successful
        return true;
    } catch (error) {
        // If the build command exits with an error (non-zero exit code), the build failed
        return false;
    }
}
// Run the script
enforceReadonlyModifiers(repoPath).then(()=>console.log('Finished processing files.')).catch((error)=>{
    console.error('An error occurred:', error);
    process.exit(1);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3Jlc3RyaWN0UmVhZG9ubHlNb2RpZmllcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoaXMgc2NyaXB0IGF1dG9tYXRlcyB0aGUgcHJvY2VzcyBvZiBlbmZvcmNpbmcgdGhlICdyZWFkb25seScgbW9kaWZpZXIgb24gY2xhc3MgcHJvcGVydGllcyB3aXRoaW4gVHlwZVNjcmlwdCBmaWxlcyBpbiBhIHNwZWNpZmllZCBwcm9qZWN0LlxuICogSXQgaXRlcmF0ZXMgb3ZlciBUeXBlU2NyaXB0IGZpbGVzIGluIHRoZSAnanMvJyBkaXJlY3RvcnksIGF0dGVtcHRpbmcgdG8gYWRkIHRoZSAncmVhZG9ubHknIG1vZGlmaWVyIHRvIGNsYXNzIHByb3BlcnRpZXMgdGhhdCBhcmUgbm90IGFscmVhZHkgcmVhZG9ubHkuXG4gKiBBZnRlciBlYWNoIG1vZGlmaWNhdGlvbiwgaXQgcnVucyB0aGUgVHlwZVNjcmlwdCB0eXBlIGNoZWNrZXIgdG8gdmFsaWRhdGUgdGhlIGNoYW5nZS4gSWYgdGhlIHR5cGUgY2hlY2tlciBmYWlscywgaXQgcmV2ZXJ0cyB0aGUgY2hhbmdlLlxuICogVGhpcyBoZWxwcyBpbiBlbnN1cmluZyB0aGF0IGNsYXNzIHByb3BlcnRpZXMgYXJlIGltbXV0YWJsZSB3aGVyZSBwb3NzaWJsZSwgZW5oYW5jaW5nIGNvZGUgcmVsaWFiaWxpdHkgYW5kIG1haW50YWluYWJpbGl0eS5cbiAqXG4gKiBVc2FnZTpcbiAqIGNkIHBlcmVubmlhbC1hbGlhcy9cbiAqIHNhZ2UgcnVuIGpzL3NjcmlwdHMvZW5mb3JjZVJlYWRvbmx5TW9kaWZpZXJzLnRzIFtyZWxhdGl2ZS1wYXRoLXRvLXJlcG8tZGlyZWN0b3J5XVxuICpcbiAqIFBhcmFtZXRlcnM6XG4gKiBbcmVsYXRpdmUtcGF0aC10by1yZXBvLWRpcmVjdG9yeV0gLSBUaGUgcGF0aCB0byB0aGUgcmVwb3NpdG9yeSB3aGVyZSBUeXBlU2NyaXB0IGZpbGVzIGFyZSBsb2NhdGVkLiBUaGlzIHNjcmlwdCBhc3N1bWVzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhICd0c2NvbmZpZy5qc29uJyBmaWxlIGlzIHByZXNlbnQgYXQgdGhlIHJvb3Qgb2YgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkuXG4gKlxuICogT3B0aW9uczpcbiAqIC0taGVscCAgICAgICAgICAgICAgICAgICAtIERpc3BsYXlzIHRoaXMgaGVscCBtZXNzYWdlIGFuZCBleGl0cy5cbiAqXG4gKiBFeGFtcGxlOlxuICogc2FnZSBydW4ganMvc2NyaXB0cy9lbmZvcmNlUmVhZG9ubHlNb2RpZmllcnMudHMgLi4vbXktdHMtcHJvamVjdFxuICpcbiAqIE5vdGU6XG4gKiAtIEVuc3VyZSB0aGF0ICd0c2NvbmZpZy5qc29uJyBpcyBjb3JyZWN0bHkgc2V0IHVwIGluIHlvdXIgcHJvamVjdCByb290LlxuICogLSBUaGUgc2NyaXB0IGN1cnJlbnRseSB0YXJnZXRzIGZpbGVzIHdpdGhpbiB0aGUgJ2pzLycgZGlyZWN0b3J5IGJ5IGRlZmF1bHQuIEFkanVzdCB0aGUgZ2xvYiBwYXR0ZXJuIGluIHRoZVxuICogICBnZXRTb3VyY2VGaWxlcyBtZXRob2QgY2FsbCBpZiB5b3VyIHByb2plY3Qgc3RydWN0dXJlIGRpZmZlcnMuXG4gKiAtIFRoaXMgc2NyaXB0IHJlcXVpcmVzIE5vZGUuanMgYW5kIHRoZSAndHMtbW9ycGgnIGFuZCAnY2hpbGRfcHJvY2VzcycgcGFja2FnZXMuXG4gKiAtIFRoZSBzY3JpcHQgbWFrZXMgY2hhbmdlcyB0byB0aGUgcmVwbyBhcyBpdCBwcm9ncmVzc2VzLiBJZiB5b3UgbG9vayBhdCB0aGUgc291cmNlIGZpbGVzIHdoaWxlIHRoaXMgc2NyaXB0IGlzIHJ1bm5pbmdcbiAqICAgeW91IHdpbGwgc2VlIHRoZSBjaGFuZ2VzIGJlaW5nIG1hZGUgdG8gdHJpYWwgdmFsdWVzLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IFByb2plY3QsIFByb3BlcnR5RGVjbGFyYXRpb24gfSBmcm9tICd0cy1tb3JwaCc7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZW5mb3JjZSAncmVhZG9ubHknIG9uIGNsYXNzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSByZXBvUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSByZXBvc2l0b3J5IGRpcmVjdG9yeVxuICovXG5hc3luYyBmdW5jdGlvbiBlbmZvcmNlUmVhZG9ubHlNb2RpZmllcnMoIHJlcG9QYXRoOiBzdHJpbmcgKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIEluaXRpYWxpemUgYSBuZXcgdHMtbW9ycGggUHJvamVjdFxuICBjb25zdCBwcm9qZWN0ID0gbmV3IFByb2plY3QoIHtcbiAgICAvLyBBc3N1bWluZyB0c2NvbmZpZy5qc29uIGlzIGluIHRoZSByb290LCBhZGp1c3QgaWYgbmVjZXNzYXJ5XG4gICAgdHNDb25maWdGaWxlUGF0aDogYCR7cmVwb1BhdGh9L3RzY29uZmlnLmpzb25gXG4gICAgLy8gT3B0aW9uYWxseSBhZGQgYW55IGFkZGl0aW9uYWwgY29tcGlsZXIgb3B0aW9ucyBvciBwcm9qZWN0IHNldHRpbmdzIGhlcmVcbiAgfSApO1xuXG4gIC8vIFJldHJpZXZlIGFsbCBUeXBlU2NyaXB0IHNvdXJjZSBmaWxlcyBpbiB0aGUgJ2pzLycgZGlyZWN0b3J5XG4gIGNvbnN0IHNvdXJjZUZpbGVzID0gcHJvamVjdC5nZXRTb3VyY2VGaWxlcyggYCR7cmVwb1BhdGh9L2pzLyoqLyoudHNgICk7IC8vIEFkanVzdCB0aGUgZ2xvYiBwYXR0ZXJuIGFzIG5lY2Vzc2FyeVxuXG4gIGZvciAoIGNvbnN0IHNvdXJjZUZpbGUgb2Ygc291cmNlRmlsZXMgKSB7XG4gICAgY29uc3QgY2xhc3NlcyA9IHNvdXJjZUZpbGUuZ2V0Q2xhc3NlcygpO1xuXG4gICAgZm9yICggY29uc3QgY2xhc3NEZWNsYXJhdGlvbiBvZiBjbGFzc2VzICkge1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5nZXROYW1lKCkgfHwgJzxVbm5hbWVkIENsYXNzPic7XG4gICAgICBjb25zb2xlLmxvZyggYCMgUHJvY2Vzc2luZyBjbGFzczogJHtjbGFzc05hbWV9YCApO1xuXG4gICAgICAvLyBSZXRyaWV2ZSBhbGwgcHJvcGVydHkgZGVjbGFyYXRpb25zIChib3RoIGluc3RhbmNlIGFuZCBzdGF0aWMpXG4gICAgICBjb25zdCBwcm9wZXJ0aWVzOiBQcm9wZXJ0eURlY2xhcmF0aW9uW10gPSBjbGFzc0RlY2xhcmF0aW9uLmdldFByb3BlcnRpZXMoKTtcblxuICAgICAgZm9yICggY29uc3QgcHJvcGVydHkgb2YgcHJvcGVydGllcyApIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gcHJvcGVydHkuZ2V0TmFtZSgpO1xuICAgICAgICBjb25zdCBpc1JlYWRvbmx5ID0gcHJvcGVydHkuaXNSZWFkb25seSgpO1xuXG4gICAgICAgIGlmICggaXNSZWFkb25seSApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYCAgLSBQcm9wZXJ0eSAnJHtwcm9wZXJ0eU5hbWV9JyBpcyBhbHJlYWR5IHJlYWRvbmx5LiBTa2lwcGluZy5gICk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyggYCAgLSBBdHRlbXB0aW5nIHRvIHNldCAncmVhZG9ubHknIG9uIHByb3BlcnR5ICcke3Byb3BlcnR5TmFtZX0nLmAgKTtcblxuICAgICAgICAvLyBBZGQgJ3JlYWRvbmx5JyBtb2RpZmllclxuICAgICAgICBwcm9wZXJ0eS5zZXRJc1JlYWRvbmx5KCB0cnVlICk7XG4gICAgICAgIGF3YWl0IHNvdXJjZUZpbGUuc2F2ZSgpO1xuXG4gICAgICAgIGlmICggaXNCdWlsZFN1Y2Nlc3NmdWwoIHJlcG9QYXRoICkgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIGAgICAgU3VjY2Vzc2Z1bGx5IHNldCAncmVhZG9ubHknIG9uICcke3Byb3BlcnR5TmFtZX0nLmAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBSZXZlcnQgdGhlIGNoYW5nZSBpZiB0aGUgYnVpbGQgZmFpbHNcbiAgICAgICAgICBwcm9wZXJ0eS5zZXRJc1JlYWRvbmx5KCBmYWxzZSApO1xuICAgICAgICAgIGF3YWl0IHNvdXJjZUZpbGUuc2F2ZSgpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgICAgIEZhaWxlZCB0byBzZXQgJ3JlYWRvbmx5JyBvbiAnJHtwcm9wZXJ0eU5hbWV9Jy4gUmV2ZXJ0ZWQgdGhlIGNoYW5nZS5gICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSAtLWhlbHAgY29tbWFuZCBsaW5lIGFyZ3VtZW50XG5pZiAoIHByb2Nlc3MuYXJndi5pbmNsdWRlcyggJy0taGVscCcgKSApIHtcbiAgY29uc29sZS5sb2coIGBcblxceDFiWzFtVXNhZ2U6XFx4MWJbMG1cbiAgXFx4MWJbMzZtY2QgcGVyZW5uaWFsLWFsaWFzL1xceDFiWzBtXG4gIFxceDFiWzM2bXNhZ2UgcnVuIGpzL3NjcmlwdHMvZW5mb3JjZVJlYWRvbmx5TW9kaWZpZXJzLnRzIFtyZWxhdGl2ZS1wYXRoLXRvLXJlcG8tZGlyZWN0b3J5XVxceDFiWzBtXG5cblxceDFiWzFtUGFyYW1ldGVyczpcXHgxYlswbVxuICBcXHgxYlszM21bcmVsYXRpdmUtcGF0aC10by1yZXBvLWRpcmVjdG9yeV1cXHgxYlswbSAtIFRoZSBwYXRoIHRvIHRoZSByZXBvc2l0b3J5IHdoZXJlIFR5cGVTY3JpcHQgZmlsZXMgYXJlIGxvY2F0ZWQuIEFzc3VtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgJ3RzY29uZmlnLmpzb24nIGZpbGUgaXMgcHJlc2VudCBhdCB0aGUgcm9vdCBvZiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cblxuXFx4MWJbMW1PcHRpb25zOlxceDFiWzBtXG4gIFxceDFiWzMybS0taGVscFxceDFiWzBtICAgICAgICAgICAgICAgICAgLSBEaXNwbGF5cyB0aGlzIGhlbHAgbWVzc2FnZSBhbmQgZXhpdHMuXG5cblxceDFiWzFtRXhhbXBsZTpcXHgxYlswbVxuICBcXHgxYlszNm1zYWdlIHJ1biBqcy9zY3JpcHRzL2VuZm9yY2VSZWFkb25seU1vZGlmaWVycy50cyAuLi9teS10cy1wcm9qZWN0XFx4MWJbMG1cblxuXFx4MWJbMW1Ob3RlOlxceDFiWzBtXG4tIEVuc3VyZSB0aGF0ICd0c2NvbmZpZy5qc29uJyBpcyBjb3JyZWN0bHkgc2V0IHVwIGluIHlvdXIgcHJvamVjdCByb290LlxuLSBUaGUgc2NyaXB0IGN1cnJlbnRseSB0YXJnZXRzIGZpbGVzIHdpdGhpbiB0aGUgJ2pzLycgZGlyZWN0b3J5IGJ5IGRlZmF1bHQuIEFkanVzdCB0aGUgZ2xvYiBwYXR0ZXJuIGluIHRoZVxuICBnZXRTb3VyY2VGaWxlcyBtZXRob2QgY2FsbCBpZiB5b3VyIHByb2plY3Qgc3RydWN0dXJlIGRpZmZlcnMuXG4tIFRoaXMgc2NyaXB0IHJlcXVpcmVzIE5vZGUuanMgYW5kIHRoZSAndHMtbW9ycGgnIGFuZCAnY2hpbGRfcHJvY2VzcycgcGFja2FnZXMuXG4tIFRoZSBzY3JpcHQgbWFrZXMgY2hhbmdlcyB0byB0aGUgcmVwbyBhcyBpdCBwcm9ncmVzc2VzLiBJZiB5b3UgbG9vayBhdCB0aGUgc291cmNlIGZpbGVzIHdoaWxlIHRoaXMgc2NyaXB0IFxuICBpcyBydW5uaW5nIHlvdSB3aWxsIHNlZSB0aGUgY2hhbmdlcyBiZWluZyBtYWRlIHRvIHRyaWFsIHZhbHVlcy5cbiAgYCApO1xuICBwcm9jZXNzLmV4aXQoIDAgKTtcbn1cblxuLy8gQ2hlY2sgaWYgdGhlIHBhdGggdG8gdGhlIHJlcG9zaXRvcnkgZGlyZWN0b3J5IGlzIHByb3ZpZGVkXG5pZiAoIHByb2Nlc3MuYXJndi5sZW5ndGggPCAzICkge1xuICBjb25zb2xlLmVycm9yKCAnRXJyb3I6IFBsZWFzZSBwcm92aWRlIHRoZSBwYXRoIHRvIHRoZSByZXBvc2l0b3J5IGRpcmVjdG9yeS4gQ2hlY2sgLS1oZWxwIGZvciBpbnN0cnVjdGlvbnMuJyApO1xuICBwcm9jZXNzLmV4aXQoIDEgKTtcbn1cblxuLy8gU2V0IHRoZSBwYXRoIHRvIHRoZSByZXBvc2l0b3J5IGRpcmVjdG9yeVxuY29uc3QgcmVwb1BhdGggPSBwcm9jZXNzLmFyZ3ZbIDIgXTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgcHJvcG9zZWQgY2hhbmdlIChhbHJlYWR5IHNhdmVkIHRvIHRoZSBmaWxlc3lzdGVtKSBwYXNzZXMgdGhlIHR5cGUgY2hlY2tlci5cbiAqIEBwYXJhbSByZXBvUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSByZXBvc2l0b3J5IGRpcmVjdG9yeVxuICogQHJldHVybnMgLSBUcnVlIGlmIHRoZSBidWlsZCBpcyBzdWNjZXNzZnVsLCBlbHNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVpbGRTdWNjZXNzZnVsKCByZXBvUGF0aDogc3RyaW5nICk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIC8vIFNwZWNpZnkgdGhlIHBhdGggdG8gdGhlIFR5cGVTY3JpcHQgY29tcGlsZXIgb3IgYnVpbGQgY29tbWFuZCB5b3Ugd2FudCB0byB1c2VcbiAgICBjb25zdCBncnVudENvbW1hbmQgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9ncnVudENvbW1hbmQuanMnICk7XG5cbiAgICAvLyBSdW4gdGhlIHNwZWNpZmllZCBUeXBlU2NyaXB0IGNvbXBpbGVyIG9yIGJ1aWxkIGNvbW1hbmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgY29uc3QgcmVzdWx0ID0gZXhlY1N5bmMoIGAke2dydW50Q29tbWFuZH0gdHlwZS1jaGVja2AsIHtcbiAgICAgIC8vIHNldCB0aGUgd29ya2luZyBkaXJlY3RvcnlcbiAgICAgIGN3ZDogcmVwb1BhdGgsXG4gICAgICBzdGRpbzogJ3BpcGUnLCAvLyBDYXB0dXJlIHRoZSBvdXRwdXRcbiAgICAgIGVuY29kaW5nOiAndXRmLTgnXG4gICAgfSApO1xuXG4gICAgaWYgKCByZXN1bHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyggJ2Vycm9yJyApICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBidWlsZCBjb21tYW5kIGV4aXRzIHdpdGhvdXQgZXJyb3IsIHRoZSBidWlsZCBpcyBzdWNjZXNzZnVsXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgY2F0Y2goIGVycm9yICkge1xuICAgIC8vIElmIHRoZSBidWlsZCBjb21tYW5kIGV4aXRzIHdpdGggYW4gZXJyb3IgKG5vbi16ZXJvIGV4aXQgY29kZSksIHRoZSBidWlsZCBmYWlsZWRcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLy8gUnVuIHRoZSBzY3JpcHRcbmVuZm9yY2VSZWFkb25seU1vZGlmaWVycyggcmVwb1BhdGggKVxuICAudGhlbiggKCkgPT4gY29uc29sZS5sb2coICdGaW5pc2hlZCBwcm9jZXNzaW5nIGZpbGVzLicgKSApXG4gIC5jYXRjaCggZXJyb3IgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoICdBbiBlcnJvciBvY2N1cnJlZDonLCBlcnJvciApO1xuICAgIHByb2Nlc3MuZXhpdCggMSApO1xuICB9ICk7Il0sIm5hbWVzIjpbImV4ZWNTeW5jIiwiUHJvamVjdCIsImVuZm9yY2VSZWFkb25seU1vZGlmaWVycyIsInJlcG9QYXRoIiwicHJvamVjdCIsInRzQ29uZmlnRmlsZVBhdGgiLCJzb3VyY2VGaWxlcyIsImdldFNvdXJjZUZpbGVzIiwic291cmNlRmlsZSIsImNsYXNzZXMiLCJnZXRDbGFzc2VzIiwiY2xhc3NEZWNsYXJhdGlvbiIsImNsYXNzTmFtZSIsImdldE5hbWUiLCJjb25zb2xlIiwibG9nIiwicHJvcGVydGllcyIsImdldFByb3BlcnRpZXMiLCJwcm9wZXJ0eSIsInByb3BlcnR5TmFtZSIsImlzUmVhZG9ubHkiLCJzZXRJc1JlYWRvbmx5Iiwic2F2ZSIsImlzQnVpbGRTdWNjZXNzZnVsIiwicHJvY2VzcyIsImFyZ3YiLCJpbmNsdWRlcyIsImV4aXQiLCJsZW5ndGgiLCJlcnJvciIsImdydW50Q29tbWFuZCIsInJlcXVpcmUiLCJyZXN1bHQiLCJjd2QiLCJzdGRpbyIsImVuY29kaW5nIiwidG9Mb3dlckNhc2UiLCJ0aGVuIiwiY2F0Y2giXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2QkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsU0FBU0EsUUFBUSxRQUFRLGdCQUFnQjtBQUN6QyxTQUFTQyxPQUFPLFFBQTZCLFdBQVc7U0FNekNDLHlCQUEwQkMsUUFBZ0I7V0FBMUNEOztTQUFBQTtJQUFBQSw0QkFKZjs7O0NBR0MsR0FDRCxvQkFBQSxVQUF5Q0MsUUFBZ0I7UUFDdkQsb0NBQW9DO1FBQ3BDLE1BQU1DLFVBQVUsSUFBSUgsUUFBUztZQUMzQiw2REFBNkQ7WUFDN0RJLGtCQUFrQixHQUFHRixTQUFTLGNBQWMsQ0FBQztRQUUvQztRQUVBLDhEQUE4RDtRQUM5RCxNQUFNRyxjQUFjRixRQUFRRyxjQUFjLENBQUUsR0FBR0osU0FBUyxXQUFXLENBQUMsR0FBSSx1Q0FBdUM7UUFFL0csS0FBTSxNQUFNSyxjQUFjRixZQUFjO1lBQ3RDLE1BQU1HLFVBQVVELFdBQVdFLFVBQVU7WUFFckMsS0FBTSxNQUFNQyxvQkFBb0JGLFFBQVU7Z0JBQ3hDLE1BQU1HLFlBQVlELGlCQUFpQkUsT0FBTyxNQUFNO2dCQUNoREMsUUFBUUMsR0FBRyxDQUFFLENBQUMsb0JBQW9CLEVBQUVILFdBQVc7Z0JBRS9DLGdFQUFnRTtnQkFDaEUsTUFBTUksYUFBb0NMLGlCQUFpQk0sYUFBYTtnQkFFeEUsS0FBTSxNQUFNQyxZQUFZRixXQUFhO29CQUNuQyxNQUFNRyxlQUFlRCxTQUFTTCxPQUFPO29CQUNyQyxNQUFNTyxhQUFhRixTQUFTRSxVQUFVO29CQUV0QyxJQUFLQSxZQUFhO3dCQUNoQk4sUUFBUUMsR0FBRyxDQUFFLENBQUMsY0FBYyxFQUFFSSxhQUFhLGdDQUFnQyxDQUFDO3dCQUM1RTtvQkFDRjtvQkFFQUwsUUFBUUMsR0FBRyxDQUFFLENBQUMsOENBQThDLEVBQUVJLGFBQWEsRUFBRSxDQUFDO29CQUU5RSwwQkFBMEI7b0JBQzFCRCxTQUFTRyxhQUFhLENBQUU7b0JBQ3hCLE1BQU1iLFdBQVdjLElBQUk7b0JBRXJCLElBQUtDLGtCQUFtQnBCLFdBQWE7d0JBQ25DVyxRQUFRQyxHQUFHLENBQUUsQ0FBQyxvQ0FBb0MsRUFBRUksYUFBYSxFQUFFLENBQUM7b0JBQ3RFLE9BQ0s7d0JBQ0gsdUNBQXVDO3dCQUN2Q0QsU0FBU0csYUFBYSxDQUFFO3dCQUN4QixNQUFNYixXQUFXYyxJQUFJO3dCQUNyQlIsUUFBUUMsR0FBRyxDQUFFLENBQUMsaUNBQWlDLEVBQUVJLGFBQWEsdUJBQXVCLENBQUM7b0JBQ3hGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO1dBaERlakI7O0FBa0RmLG1EQUFtRDtBQUNuRCxJQUFLc0IsUUFBUUMsSUFBSSxDQUFDQyxRQUFRLENBQUUsV0FBYTtJQUN2Q1osUUFBUUMsR0FBRyxDQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFzQmQsQ0FBQztJQUNEUyxRQUFRRyxJQUFJLENBQUU7QUFDaEI7QUFFQSw0REFBNEQ7QUFDNUQsSUFBS0gsUUFBUUMsSUFBSSxDQUFDRyxNQUFNLEdBQUcsR0FBSTtJQUM3QmQsUUFBUWUsS0FBSyxDQUFFO0lBQ2ZMLFFBQVFHLElBQUksQ0FBRTtBQUNoQjtBQUVBLDJDQUEyQztBQUMzQyxNQUFNeEIsV0FBV3FCLFFBQVFDLElBQUksQ0FBRSxFQUFHO0FBRWxDOzs7O0NBSUMsR0FDRCxTQUFTRixrQkFBbUJwQixRQUFnQjtJQUMxQyxJQUFJO1FBQ0YsK0VBQStFO1FBQy9FLE1BQU0yQixlQUFlQyxRQUFTO1FBRTlCLGtGQUFrRjtRQUNsRixNQUFNQyxTQUFTaEMsU0FBVSxHQUFHOEIsYUFBYSxXQUFXLENBQUMsRUFBRTtZQUNyRCw0QkFBNEI7WUFDNUJHLEtBQUs5QjtZQUNMK0IsT0FBTztZQUNQQyxVQUFVO1FBQ1o7UUFFQSxJQUFLSCxPQUFPSSxXQUFXLEdBQUdWLFFBQVEsQ0FBRSxVQUFZO1lBQzlDLE9BQU87UUFDVDtRQUVBLG9FQUFvRTtRQUNwRSxPQUFPO0lBQ1QsRUFDQSxPQUFPRyxPQUFRO1FBQ2Isa0ZBQWtGO1FBQ2xGLE9BQU87SUFDVDtBQUNGO0FBRUEsaUJBQWlCO0FBQ2pCM0IseUJBQTBCQyxVQUN2QmtDLElBQUksQ0FBRSxJQUFNdkIsUUFBUUMsR0FBRyxDQUFFLCtCQUN6QnVCLEtBQUssQ0FBRVQsQ0FBQUE7SUFDTmYsUUFBUWUsS0FBSyxDQUFFLHNCQUFzQkE7SUFDckNMLFFBQVFHLElBQUksQ0FBRTtBQUNoQiJ9