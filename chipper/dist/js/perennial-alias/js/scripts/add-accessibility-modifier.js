// Copyright 2021, University of Colorado Boulder
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
const fs = require('fs');
/**
 *
 * Autofix missing accessibility modifiers. NOTE: This script is horribly inefficient, writing the same file over and over
 * N times, where N is the number of errors in that file.
 *
 * USAGE:
 * (1) Make sure you have a clean working copy
 * (2) cd directory-with-all-repos
 * (3) Generate a lint report and save it in a file
 *       cd axon
 *       grunt lint > lintreport.txt
 * (4) Run the script
 *       cd ..
 *       node perennial/js/scripts/add-accessibility-modifier axon/lintreport.txt private
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ _async_to_generator(function*() {
    const args = process.argv.slice(2);
    const filename = args[0];
    const modifier = args[1];
    const report = fs.readFileSync(filename, 'utf8').trim();
    const lines = report.split('\n').map((sim)=>sim.trim());
    let currentFile = null;
    lines.forEach((line)=>{
        if (line.endsWith('.ts') && (line.includes('/') || line.includes('\\'))) {
            currentFile = line;
        } else if (line.includes('error') && line.endsWith('@typescript-eslint/explicit-member-accessibility')) {
            const substring = line.substring(0, line.indexOf('error'));
            const terms = substring.trim().split(':');
            const lineNumber = Number(terms[0]);
            const column = Number(terms[1]);
            console.log(currentFile, lineNumber, column);
            const file = fs.readFileSync(currentFile, 'utf8');
            const lines = file.split('\n');
            lines[lineNumber - 1] = lines[lineNumber - 1].substring(0, column - 1) + modifier + ' ' + lines[lineNumber - 1].substring(column - 1);
            console.log(lines[lineNumber - 1]);
            fs.writeFileSync(currentFile, lines.join('\n'));
        }
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2FkZC1hY2Nlc3NpYmlsaXR5LW1vZGlmaWVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5cbi8qKlxuICpcbiAqIEF1dG9maXggbWlzc2luZyBhY2Nlc3NpYmlsaXR5IG1vZGlmaWVycy4gTk9URTogVGhpcyBzY3JpcHQgaXMgaG9ycmlibHkgaW5lZmZpY2llbnQsIHdyaXRpbmcgdGhlIHNhbWUgZmlsZSBvdmVyIGFuZCBvdmVyXG4gKiBOIHRpbWVzLCB3aGVyZSBOIGlzIHRoZSBudW1iZXIgb2YgZXJyb3JzIGluIHRoYXQgZmlsZS5cbiAqXG4gKiBVU0FHRTpcbiAqICgxKSBNYWtlIHN1cmUgeW91IGhhdmUgYSBjbGVhbiB3b3JraW5nIGNvcHlcbiAqICgyKSBjZCBkaXJlY3Rvcnktd2l0aC1hbGwtcmVwb3NcbiAqICgzKSBHZW5lcmF0ZSBhIGxpbnQgcmVwb3J0IGFuZCBzYXZlIGl0IGluIGEgZmlsZVxuICogICAgICAgY2QgYXhvblxuICogICAgICAgZ3J1bnQgbGludCA+IGxpbnRyZXBvcnQudHh0XG4gKiAoNCkgUnVuIHRoZSBzY3JpcHRcbiAqICAgICAgIGNkIC4uXG4gKiAgICAgICBub2RlIHBlcmVubmlhbC9qcy9zY3JpcHRzL2FkZC1hY2Nlc3NpYmlsaXR5LW1vZGlmaWVyIGF4b24vbGludHJlcG9ydC50eHQgcHJpdmF0ZVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbiggYXN5bmMgKCkgPT4ge1xuICBjb25zdCBhcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKCAyICk7XG4gIGNvbnN0IGZpbGVuYW1lID0gYXJnc1sgMCBdO1xuICBjb25zdCBtb2RpZmllciA9IGFyZ3NbIDEgXTtcblxuICBjb25zdCByZXBvcnQgPSBmcy5yZWFkRmlsZVN5bmMoIGZpbGVuYW1lLCAndXRmOCcgKS50cmltKCk7XG4gIGNvbnN0IGxpbmVzID0gcmVwb3J0LnNwbGl0KCAnXFxuJyApLm1hcCggc2ltID0+IHNpbS50cmltKCkgKTtcblxuICBsZXQgY3VycmVudEZpbGUgPSBudWxsO1xuICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcbiAgICBpZiAoIGxpbmUuZW5kc1dpdGgoICcudHMnICkgJiYgKCBsaW5lLmluY2x1ZGVzKCAnLycgKSB8fCBsaW5lLmluY2x1ZGVzKCAnXFxcXCcgKSApICkge1xuICAgICAgY3VycmVudEZpbGUgPSBsaW5lO1xuICAgIH1cbiAgICBlbHNlIGlmICggbGluZS5pbmNsdWRlcyggJ2Vycm9yJyApICYmIGxpbmUuZW5kc1dpdGgoICdAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHknICkgKSB7XG4gICAgICBjb25zdCBzdWJzdHJpbmcgPSBsaW5lLnN1YnN0cmluZyggMCwgbGluZS5pbmRleE9mKCAnZXJyb3InICkgKTtcbiAgICAgIGNvbnN0IHRlcm1zID0gc3Vic3RyaW5nLnRyaW0oKS5zcGxpdCggJzonICk7XG4gICAgICBjb25zdCBsaW5lTnVtYmVyID0gTnVtYmVyKCB0ZXJtc1sgMCBdICk7XG4gICAgICBjb25zdCBjb2x1bW4gPSBOdW1iZXIoIHRlcm1zWyAxIF0gKTtcblxuICAgICAgY29uc29sZS5sb2coIGN1cnJlbnRGaWxlLCBsaW5lTnVtYmVyLCBjb2x1bW4gKTtcblxuICAgICAgY29uc3QgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyggY3VycmVudEZpbGUsICd1dGY4JyApO1xuICAgICAgY29uc3QgbGluZXMgPSBmaWxlLnNwbGl0KCAnXFxuJyApO1xuXG4gICAgICBsaW5lc1sgbGluZU51bWJlciAtIDEgXSA9IGxpbmVzWyBsaW5lTnVtYmVyIC0gMSBdLnN1YnN0cmluZyggMCwgY29sdW1uIC0gMSApICsgbW9kaWZpZXIgKyAnICcgKyBsaW5lc1sgbGluZU51bWJlciAtIDEgXS5zdWJzdHJpbmcoIGNvbHVtbiAtIDEgKTtcbiAgICAgIGNvbnNvbGUubG9nKCBsaW5lc1sgbGluZU51bWJlciAtIDEgXSApO1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKCBjdXJyZW50RmlsZSwgbGluZXMuam9pbiggJ1xcbicgKSApO1xuICAgIH1cbiAgfSApO1xufSApKCk7Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsImFyZ3MiLCJwcm9jZXNzIiwiYXJndiIsInNsaWNlIiwiZmlsZW5hbWUiLCJtb2RpZmllciIsInJlcG9ydCIsInJlYWRGaWxlU3luYyIsInRyaW0iLCJsaW5lcyIsInNwbGl0IiwibWFwIiwic2ltIiwiY3VycmVudEZpbGUiLCJmb3JFYWNoIiwibGluZSIsImVuZHNXaXRoIiwiaW5jbHVkZXMiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwidGVybXMiLCJsaW5lTnVtYmVyIiwiTnVtYmVyIiwiY29sdW1uIiwiY29uc29sZSIsImxvZyIsImZpbGUiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFakQsTUFBTUEsS0FBS0MsUUFBUztBQUVwQjs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNDLG9CQUFBO0lBQ0EsTUFBTUMsT0FBT0MsUUFBUUMsSUFBSSxDQUFDQyxLQUFLLENBQUU7SUFDakMsTUFBTUMsV0FBV0osSUFBSSxDQUFFLEVBQUc7SUFDMUIsTUFBTUssV0FBV0wsSUFBSSxDQUFFLEVBQUc7SUFFMUIsTUFBTU0sU0FBU1IsR0FBR1MsWUFBWSxDQUFFSCxVQUFVLFFBQVNJLElBQUk7SUFDdkQsTUFBTUMsUUFBUUgsT0FBT0ksS0FBSyxDQUFFLE1BQU9DLEdBQUcsQ0FBRUMsQ0FBQUEsTUFBT0EsSUFBSUosSUFBSTtJQUV2RCxJQUFJSyxjQUFjO0lBQ2xCSixNQUFNSyxPQUFPLENBQUVDLENBQUFBO1FBQ2IsSUFBS0EsS0FBS0MsUUFBUSxDQUFFLFVBQWFELENBQUFBLEtBQUtFLFFBQVEsQ0FBRSxRQUFTRixLQUFLRSxRQUFRLENBQUUsS0FBSyxHQUFNO1lBQ2pGSixjQUFjRTtRQUNoQixPQUNLLElBQUtBLEtBQUtFLFFBQVEsQ0FBRSxZQUFhRixLQUFLQyxRQUFRLENBQUUscURBQXVEO1lBQzFHLE1BQU1FLFlBQVlILEtBQUtHLFNBQVMsQ0FBRSxHQUFHSCxLQUFLSSxPQUFPLENBQUU7WUFDbkQsTUFBTUMsUUFBUUYsVUFBVVYsSUFBSSxHQUFHRSxLQUFLLENBQUU7WUFDdEMsTUFBTVcsYUFBYUMsT0FBUUYsS0FBSyxDQUFFLEVBQUc7WUFDckMsTUFBTUcsU0FBU0QsT0FBUUYsS0FBSyxDQUFFLEVBQUc7WUFFakNJLFFBQVFDLEdBQUcsQ0FBRVosYUFBYVEsWUFBWUU7WUFFdEMsTUFBTUcsT0FBTzVCLEdBQUdTLFlBQVksQ0FBRU0sYUFBYTtZQUMzQyxNQUFNSixRQUFRaUIsS0FBS2hCLEtBQUssQ0FBRTtZQUUxQkQsS0FBSyxDQUFFWSxhQUFhLEVBQUcsR0FBR1osS0FBSyxDQUFFWSxhQUFhLEVBQUcsQ0FBQ0gsU0FBUyxDQUFFLEdBQUdLLFNBQVMsS0FBTWxCLFdBQVcsTUFBTUksS0FBSyxDQUFFWSxhQUFhLEVBQUcsQ0FBQ0gsU0FBUyxDQUFFSyxTQUFTO1lBQzVJQyxRQUFRQyxHQUFHLENBQUVoQixLQUFLLENBQUVZLGFBQWEsRUFBRztZQUVwQ3ZCLEdBQUc2QixhQUFhLENBQUVkLGFBQWFKLE1BQU1tQixJQUFJLENBQUU7UUFDN0M7SUFDRjtBQUNGIn0=