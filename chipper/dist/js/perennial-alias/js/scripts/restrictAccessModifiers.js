// Copyright 2024, University of Colorado Boulder
/**
 * This script automates the process of tightening access modifiers within TypeScript files in a specified project.
 * It iterates over TypeScript files in the 'js/' directory, attempting to change public and protected class members
 * to private. It then runs the TypeScript type checker to validate these changes. If the type checker fails, it
 * escalates the access level from private to protected, and if necessary, back to public, testing the build at each
 * stage. This helps in enforcing stricter encapsulation in the codebase.
 *
 * Usage:
 * cd perennial-alias/
 * sage run js/scripts/restrictAccessModifiers.ts [relative-path-to-repo-directory]
 *
 * Parameters:
 * [relative-path-to-repo-directory] - The path to the repository where TypeScript files are located. This script assumes
 *                            a 'tsconfig.json' file is present at the root of the specified directory.
 *
 * Options:
 * --help                   - Displays this help message and exits.
 *
 * Example:
 * sage run js/scripts/restrictAccessModifiers.ts ../my-ts-project
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
 * @author Matt Blackman (PhET Interactive Simulations)
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
import { Project, Scope } from 'ts-morph';
function restrictAccessModifiers(repoPath) {
    return _restrictAccessModifiers.apply(this, arguments);
}
function _restrictAccessModifiers() {
    _restrictAccessModifiers = // Function to tighten accessibility annotations
    _async_to_generator(function*(repoPath) {
        // Initialize a new ts-morph Project
        const project = new Project({
            // Assuming tsconfig.json is in the root, adjust if necessary
            tsConfigFilePath: `${repoPath}/tsconfig.json`
        });
        const sourceFiles = project.getSourceFiles(`${repoPath}/js/**/*.ts`); // Adjust the glob pattern as necessary
        for (const sourceFile of sourceFiles){
            const classes = sourceFile.getClasses();
            for (const classDeclaration of classes){
                console.log(`# Processing class: ${classDeclaration.getName()}`);
                const members = [
                    ...classDeclaration.getInstanceProperties(),
                    ...classDeclaration.getInstanceMethods(),
                    ...classDeclaration.getStaticProperties(),
                    ...classDeclaration.getStaticMethods()
                ];
                for (const member of members){
                    console.log(member.getScope() + ' ' + member.getName());
                    if (member.getScope() === 'public' || member.getScope() === 'protected') {
                        // Try setting to private
                        member.setScope(Scope.Private);
                        yield sourceFile.save();
                        if (!isBuildSuccessful()) {
                            // If not successful, try protected
                            member.setScope(Scope.Protected);
                            yield sourceFile.save();
                            if (!isBuildSuccessful()) {
                                // If still not successful, revert to public
                                member.setScope(Scope.Public);
                                yield sourceFile.save();
                            } else {
                                console.log(`    Successfully changed ${member.getName()} to protected.`);
                            }
                        } else {
                            console.log(`    Successfully changed ${member.getName()} to private.`);
                        }
                    }
                }
            }
        }
    });
    return _restrictAccessModifiers.apply(this, arguments);
}
// Check if there is a --help command line argument
if (process.argv.includes('--help')) {
    console.log(`
\x1b[1mUsage:\x1b[0m
  \x1b[36mcd chipper/\x1b[0m
  \x1b[36msage run js/scripts/restrictAccessModifiers.ts [relative-path-to-repo-directory]\x1b[0m

\x1b[1mParameters:\x1b[0m
  \x1b[33m[relative-path-to-repo-directory]\x1b[0m - The path to the repository where TypeScript files are located. Assumes
                           a 'tsconfig.json' file is present at the root of the specified directory.

\x1b[1mOptions:\x1b[0m
  \x1b[32m--help\x1b[0m                  - Displays this help message and exits.

\x1b[1mExample:\x1b[0m
  \x1b[36msage run js/scripts/restrictAccessModifiers.ts ../my-ts-project\x1b[0m

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
 */ function isBuildSuccessful() {
    try {
        // Specify the path to the TypeScript compiler you want to use
        const gruntCommand = require('../../../perennial-alias/js/common/gruntCommand.js');
        // Run the specified TypeScript compiler in the current directory
        const result = execSync(`${gruntCommand} type-check`, {
            // set the working directory
            cwd: repoPath
        });
        if (result.toString().includes('error')) {
            return false;
        }
        // If type-check exits without error, the build is successful
        return true;
    } catch (error) {
        // If type-check exits with an error (non-zero exit code), the build failed
        return false;
    }
}
// Run the script
restrictAccessModifiers(repoPath).then(()=>console.log('Finished processing files.'));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3Jlc3RyaWN0QWNjZXNzTW9kaWZpZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGlzIHNjcmlwdCBhdXRvbWF0ZXMgdGhlIHByb2Nlc3Mgb2YgdGlnaHRlbmluZyBhY2Nlc3MgbW9kaWZpZXJzIHdpdGhpbiBUeXBlU2NyaXB0IGZpbGVzIGluIGEgc3BlY2lmaWVkIHByb2plY3QuXG4gKiBJdCBpdGVyYXRlcyBvdmVyIFR5cGVTY3JpcHQgZmlsZXMgaW4gdGhlICdqcy8nIGRpcmVjdG9yeSwgYXR0ZW1wdGluZyB0byBjaGFuZ2UgcHVibGljIGFuZCBwcm90ZWN0ZWQgY2xhc3MgbWVtYmVyc1xuICogdG8gcHJpdmF0ZS4gSXQgdGhlbiBydW5zIHRoZSBUeXBlU2NyaXB0IHR5cGUgY2hlY2tlciB0byB2YWxpZGF0ZSB0aGVzZSBjaGFuZ2VzLiBJZiB0aGUgdHlwZSBjaGVja2VyIGZhaWxzLCBpdFxuICogZXNjYWxhdGVzIHRoZSBhY2Nlc3MgbGV2ZWwgZnJvbSBwcml2YXRlIHRvIHByb3RlY3RlZCwgYW5kIGlmIG5lY2Vzc2FyeSwgYmFjayB0byBwdWJsaWMsIHRlc3RpbmcgdGhlIGJ1aWxkIGF0IGVhY2hcbiAqIHN0YWdlLiBUaGlzIGhlbHBzIGluIGVuZm9yY2luZyBzdHJpY3RlciBlbmNhcHN1bGF0aW9uIGluIHRoZSBjb2RlYmFzZS5cbiAqXG4gKiBVc2FnZTpcbiAqIGNkIHBlcmVubmlhbC1hbGlhcy9cbiAqIHNhZ2UgcnVuIGpzL3NjcmlwdHMvcmVzdHJpY3RBY2Nlc3NNb2RpZmllcnMudHMgW3JlbGF0aXZlLXBhdGgtdG8tcmVwby1kaXJlY3RvcnldXG4gKlxuICogUGFyYW1ldGVyczpcbiAqIFtyZWxhdGl2ZS1wYXRoLXRvLXJlcG8tZGlyZWN0b3J5XSAtIFRoZSBwYXRoIHRvIHRoZSByZXBvc2l0b3J5IHdoZXJlIFR5cGVTY3JpcHQgZmlsZXMgYXJlIGxvY2F0ZWQuIFRoaXMgc2NyaXB0IGFzc3VtZXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgJ3RzY29uZmlnLmpzb24nIGZpbGUgaXMgcHJlc2VudCBhdCB0aGUgcm9vdCBvZiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cbiAqXG4gKiBPcHRpb25zOlxuICogLS1oZWxwICAgICAgICAgICAgICAgICAgIC0gRGlzcGxheXMgdGhpcyBoZWxwIG1lc3NhZ2UgYW5kIGV4aXRzLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBzYWdlIHJ1biBqcy9zY3JpcHRzL3Jlc3RyaWN0QWNjZXNzTW9kaWZpZXJzLnRzIC4uL215LXRzLXByb2plY3RcbiAqXG4gKiBOb3RlOlxuICogLSBFbnN1cmUgdGhhdCAndHNjb25maWcuanNvbicgaXMgY29ycmVjdGx5IHNldCB1cCBpbiB5b3VyIHByb2plY3Qgcm9vdC5cbiAqIC0gVGhlIHNjcmlwdCBjdXJyZW50bHkgdGFyZ2V0cyBmaWxlcyB3aXRoaW4gdGhlICdqcy8nIGRpcmVjdG9yeSBieSBkZWZhdWx0LiBBZGp1c3QgdGhlIGdsb2IgcGF0dGVybiBpbiB0aGVcbiAqICAgZ2V0U291cmNlRmlsZXMgbWV0aG9kIGNhbGwgaWYgeW91ciBwcm9qZWN0IHN0cnVjdHVyZSBkaWZmZXJzLlxuICogLSBUaGlzIHNjcmlwdCByZXF1aXJlcyBOb2RlLmpzIGFuZCB0aGUgJ3RzLW1vcnBoJyBhbmQgJ2NoaWxkX3Byb2Nlc3MnIHBhY2thZ2VzLlxuICogLSBUaGUgc2NyaXB0IG1ha2VzIGNoYW5nZXMgdG8gdGhlIHJlcG8gYXMgaXQgcHJvZ3Jlc3Nlcy4gSWYgeW91IGxvb2sgYXQgdGhlIHNvdXJjZSBmaWxlcyB3aGlsZSB0aGlzIHNjcmlwdCBpcyBydW5uaW5nXG4gKiAgIHlvdSB3aWxsIHNlZSB0aGUgY2hhbmdlcyBiZWluZyBtYWRlIHRvIHRyaWFsIHZhbHVlcy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNYXR0IEJsYWNrbWFuIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBQcm9qZWN0LCBTY29wZSB9IGZyb20gJ3RzLW1vcnBoJztcblxuLy8gRnVuY3Rpb24gdG8gdGlnaHRlbiBhY2Nlc3NpYmlsaXR5IGFubm90YXRpb25zXG5hc3luYyBmdW5jdGlvbiByZXN0cmljdEFjY2Vzc01vZGlmaWVycyggcmVwb1BhdGg6IHN0cmluZyApOiBQcm9taXNlPHZvaWQ+IHtcblxuICAvLyBJbml0aWFsaXplIGEgbmV3IHRzLW1vcnBoIFByb2plY3RcbiAgY29uc3QgcHJvamVjdCA9IG5ldyBQcm9qZWN0KCB7XG5cbiAgICAvLyBBc3N1bWluZyB0c2NvbmZpZy5qc29uIGlzIGluIHRoZSByb290LCBhZGp1c3QgaWYgbmVjZXNzYXJ5XG4gICAgdHNDb25maWdGaWxlUGF0aDogYCR7cmVwb1BhdGh9L3RzY29uZmlnLmpzb25gXG4gIH0gKTtcblxuICBjb25zdCBzb3VyY2VGaWxlcyA9IHByb2plY3QuZ2V0U291cmNlRmlsZXMoIGAke3JlcG9QYXRofS9qcy8qKi8qLnRzYCApOyAvLyBBZGp1c3QgdGhlIGdsb2IgcGF0dGVybiBhcyBuZWNlc3NhcnlcblxuICBmb3IgKCBjb25zdCBzb3VyY2VGaWxlIG9mIHNvdXJjZUZpbGVzICkge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBzb3VyY2VGaWxlLmdldENsYXNzZXMoKTtcblxuICAgIGZvciAoIGNvbnN0IGNsYXNzRGVjbGFyYXRpb24gb2YgY2xhc3NlcyApIHtcblxuICAgICAgY29uc29sZS5sb2coIGAjIFByb2Nlc3NpbmcgY2xhc3M6ICR7Y2xhc3NEZWNsYXJhdGlvbi5nZXROYW1lKCl9YCApO1xuXG4gICAgICBjb25zdCBtZW1iZXJzID0gW1xuICAgICAgICAuLi5jbGFzc0RlY2xhcmF0aW9uLmdldEluc3RhbmNlUHJvcGVydGllcygpLFxuICAgICAgICAuLi5jbGFzc0RlY2xhcmF0aW9uLmdldEluc3RhbmNlTWV0aG9kcygpLFxuICAgICAgICAuLi5jbGFzc0RlY2xhcmF0aW9uLmdldFN0YXRpY1Byb3BlcnRpZXMoKSxcbiAgICAgICAgLi4uY2xhc3NEZWNsYXJhdGlvbi5nZXRTdGF0aWNNZXRob2RzKClcbiAgICAgIF07XG5cbiAgICAgIGZvciAoIGNvbnN0IG1lbWJlciBvZiBtZW1iZXJzICkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCBtZW1iZXIuZ2V0U2NvcGUoKSArICcgJyArIG1lbWJlci5nZXROYW1lKCkgKTtcblxuICAgICAgICBpZiAoIG1lbWJlci5nZXRTY29wZSgpID09PSAncHVibGljJyB8fCBtZW1iZXIuZ2V0U2NvcGUoKSA9PT0gJ3Byb3RlY3RlZCcgKSB7XG5cbiAgICAgICAgICAvLyBUcnkgc2V0dGluZyB0byBwcml2YXRlXG4gICAgICAgICAgbWVtYmVyLnNldFNjb3BlKCBTY29wZS5Qcml2YXRlICk7XG4gICAgICAgICAgYXdhaXQgc291cmNlRmlsZS5zYXZlKCk7XG5cbiAgICAgICAgICBpZiAoICFpc0J1aWxkU3VjY2Vzc2Z1bCgpICkge1xuXG4gICAgICAgICAgICAvLyBJZiBub3Qgc3VjY2Vzc2Z1bCwgdHJ5IHByb3RlY3RlZFxuICAgICAgICAgICAgbWVtYmVyLnNldFNjb3BlKCBTY29wZS5Qcm90ZWN0ZWQgKTtcbiAgICAgICAgICAgIGF3YWl0IHNvdXJjZUZpbGUuc2F2ZSgpO1xuXG4gICAgICAgICAgICBpZiAoICFpc0J1aWxkU3VjY2Vzc2Z1bCgpICkge1xuXG4gICAgICAgICAgICAgIC8vIElmIHN0aWxsIG5vdCBzdWNjZXNzZnVsLCByZXZlcnQgdG8gcHVibGljXG4gICAgICAgICAgICAgIG1lbWJlci5zZXRTY29wZSggU2NvcGUuUHVibGljICk7XG4gICAgICAgICAgICAgIGF3YWl0IHNvdXJjZUZpbGUuc2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBgICAgIFN1Y2Nlc3NmdWxseSBjaGFuZ2VkICR7bWVtYmVyLmdldE5hbWUoKX0gdG8gcHJvdGVjdGVkLmAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggYCAgICBTdWNjZXNzZnVsbHkgY2hhbmdlZCAke21lbWJlci5nZXROYW1lKCl9IHRvIHByaXZhdGUuYCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBDaGVjayBpZiB0aGVyZSBpcyBhIC0taGVscCBjb21tYW5kIGxpbmUgYXJndW1lbnRcbmlmICggcHJvY2Vzcy5hcmd2LmluY2x1ZGVzKCAnLS1oZWxwJyApICkge1xuICBjb25zb2xlLmxvZyggYFxuXFx4MWJbMW1Vc2FnZTpcXHgxYlswbVxuICBcXHgxYlszNm1jZCBjaGlwcGVyL1xceDFiWzBtXG4gIFxceDFiWzM2bXNhZ2UgcnVuIGpzL3NjcmlwdHMvcmVzdHJpY3RBY2Nlc3NNb2RpZmllcnMudHMgW3JlbGF0aXZlLXBhdGgtdG8tcmVwby1kaXJlY3RvcnldXFx4MWJbMG1cblxuXFx4MWJbMW1QYXJhbWV0ZXJzOlxceDFiWzBtXG4gIFxceDFiWzMzbVtyZWxhdGl2ZS1wYXRoLXRvLXJlcG8tZGlyZWN0b3J5XVxceDFiWzBtIC0gVGhlIHBhdGggdG8gdGhlIHJlcG9zaXRvcnkgd2hlcmUgVHlwZVNjcmlwdCBmaWxlcyBhcmUgbG9jYXRlZC4gQXNzdW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYSAndHNjb25maWcuanNvbicgZmlsZSBpcyBwcmVzZW50IGF0IHRoZSByb290IG9mIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LlxuXG5cXHgxYlsxbU9wdGlvbnM6XFx4MWJbMG1cbiAgXFx4MWJbMzJtLS1oZWxwXFx4MWJbMG0gICAgICAgICAgICAgICAgICAtIERpc3BsYXlzIHRoaXMgaGVscCBtZXNzYWdlIGFuZCBleGl0cy5cblxuXFx4MWJbMW1FeGFtcGxlOlxceDFiWzBtXG4gIFxceDFiWzM2bXNhZ2UgcnVuIGpzL3NjcmlwdHMvcmVzdHJpY3RBY2Nlc3NNb2RpZmllcnMudHMgLi4vbXktdHMtcHJvamVjdFxceDFiWzBtXG5cblxceDFiWzFtTm90ZTpcXHgxYlswbVxuLSBFbnN1cmUgdGhhdCAndHNjb25maWcuanNvbicgaXMgY29ycmVjdGx5IHNldCB1cCBpbiB5b3VyIHByb2plY3Qgcm9vdC5cbi0gVGhlIHNjcmlwdCBjdXJyZW50bHkgdGFyZ2V0cyBmaWxlcyB3aXRoaW4gdGhlICdqcy8nIGRpcmVjdG9yeSBieSBkZWZhdWx0LiBBZGp1c3QgdGhlIGdsb2IgcGF0dGVybiBpbiB0aGVcbiAgZ2V0U291cmNlRmlsZXMgbWV0aG9kIGNhbGwgaWYgeW91ciBwcm9qZWN0IHN0cnVjdHVyZSBkaWZmZXJzLlxuLSBUaGlzIHNjcmlwdCByZXF1aXJlcyBOb2RlLmpzIGFuZCB0aGUgJ3RzLW1vcnBoJyBhbmQgJ2NoaWxkX3Byb2Nlc3MnIHBhY2thZ2VzLlxuLSBUaGUgc2NyaXB0IG1ha2VzIGNoYW5nZXMgdG8gdGhlIHJlcG8gYXMgaXQgcHJvZ3Jlc3Nlcy4gSWYgeW91IGxvb2sgYXQgdGhlIHNvdXJjZSBmaWxlcyB3aGlsZSB0aGlzIHNjcmlwdCBcbiAgaXMgcnVubmluZyB5b3Ugd2lsbCBzZWUgdGhlIGNoYW5nZXMgYmVpbmcgbWFkZSB0byB0cmlhbCB2YWx1ZXMuXG4gIGAgKTtcbiAgcHJvY2Vzcy5leGl0KCAwICk7XG59XG5cbi8vIENoZWNrIGlmIHRoZSBwYXRoIHRvIHRoZSByZXBvc2l0b3J5IGRpcmVjdG9yeSBpcyBwcm92aWRlZFxuaWYgKCBwcm9jZXNzLmFyZ3YubGVuZ3RoIDwgMyApIHtcbiAgY29uc29sZS5lcnJvciggJ0Vycm9yOiBQbGVhc2UgcHJvdmlkZSB0aGUgcGF0aCB0byB0aGUgcmVwb3NpdG9yeSBkaXJlY3RvcnkuIENoZWNrIC0taGVscCBmb3IgaW5zdHJ1Y3Rpb25zLicgKTtcbiAgcHJvY2Vzcy5leGl0KCAxICk7XG59XG5cbi8vIFNldCB0aGUgcGF0aCB0byB0aGUgcmVwb3NpdG9yeSBkaXJlY3RvcnlcbmNvbnN0IHJlcG9QYXRoID0gcHJvY2Vzcy5hcmd2WyAyIF07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHByb3Bvc2VkIGNoYW5nZSAoYWxyZWFkeSBzYXZlZCB0byB0aGUgZmlsZXN5c3RlbSkgcGFzc2VzIHRoZSB0eXBlIGNoZWNrZXIuXG4gKi9cbmZ1bmN0aW9uIGlzQnVpbGRTdWNjZXNzZnVsKCk6IGJvb2xlYW4ge1xuICB0cnkge1xuXG4gICAgLy8gU3BlY2lmeSB0aGUgcGF0aCB0byB0aGUgVHlwZVNjcmlwdCBjb21waWxlciB5b3Ugd2FudCB0byB1c2VcbiAgICBjb25zdCBncnVudENvbW1hbmQgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9ncnVudENvbW1hbmQuanMnICk7XG5cbiAgICAvLyBSdW4gdGhlIHNwZWNpZmllZCBUeXBlU2NyaXB0IGNvbXBpbGVyIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeVxuICAgIGNvbnN0IHJlc3VsdCA9IGV4ZWNTeW5jKCBgJHtncnVudENvbW1hbmR9IHR5cGUtY2hlY2tgLCB7XG5cbiAgICAgIC8vIHNldCB0aGUgd29ya2luZyBkaXJlY3RvcnlcbiAgICAgIGN3ZDogcmVwb1BhdGhcbiAgICB9ICk7XG4gICAgaWYgKCByZXN1bHQudG9TdHJpbmcoKS5pbmNsdWRlcyggJ2Vycm9yJyApICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHR5cGUtY2hlY2sgZXhpdHMgd2l0aG91dCBlcnJvciwgdGhlIGJ1aWxkIGlzIHN1Y2Nlc3NmdWxcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBjYXRjaCggZXJyb3IgKSB7XG5cbiAgICAvLyBJZiB0eXBlLWNoZWNrIGV4aXRzIHdpdGggYW4gZXJyb3IgKG5vbi16ZXJvIGV4aXQgY29kZSksIHRoZSBidWlsZCBmYWlsZWRcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLy8gUnVuIHRoZSBzY3JpcHRcbnJlc3RyaWN0QWNjZXNzTW9kaWZpZXJzKCByZXBvUGF0aCApLnRoZW4oICgpID0+IGNvbnNvbGUubG9nKCAnRmluaXNoZWQgcHJvY2Vzc2luZyBmaWxlcy4nICkgKTsiXSwibmFtZXMiOlsiZXhlY1N5bmMiLCJQcm9qZWN0IiwiU2NvcGUiLCJyZXN0cmljdEFjY2Vzc01vZGlmaWVycyIsInJlcG9QYXRoIiwicHJvamVjdCIsInRzQ29uZmlnRmlsZVBhdGgiLCJzb3VyY2VGaWxlcyIsImdldFNvdXJjZUZpbGVzIiwic291cmNlRmlsZSIsImNsYXNzZXMiLCJnZXRDbGFzc2VzIiwiY2xhc3NEZWNsYXJhdGlvbiIsImNvbnNvbGUiLCJsb2ciLCJnZXROYW1lIiwibWVtYmVycyIsImdldEluc3RhbmNlUHJvcGVydGllcyIsImdldEluc3RhbmNlTWV0aG9kcyIsImdldFN0YXRpY1Byb3BlcnRpZXMiLCJnZXRTdGF0aWNNZXRob2RzIiwibWVtYmVyIiwiZ2V0U2NvcGUiLCJzZXRTY29wZSIsIlByaXZhdGUiLCJzYXZlIiwiaXNCdWlsZFN1Y2Nlc3NmdWwiLCJQcm90ZWN0ZWQiLCJQdWJsaWMiLCJwcm9jZXNzIiwiYXJndiIsImluY2x1ZGVzIiwiZXhpdCIsImxlbmd0aCIsImVycm9yIiwiZ3J1bnRDb21tYW5kIiwicmVxdWlyZSIsInJlc3VsdCIsImN3ZCIsInRvU3RyaW5nIiwidGhlbiJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBK0JDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELFNBQVNBLFFBQVEsUUFBUSxnQkFBZ0I7QUFDekMsU0FBU0MsT0FBTyxFQUFFQyxLQUFLLFFBQVEsV0FBVztTQUczQkMsd0JBQXlCQyxRQUFnQjtXQUF6Q0Q7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