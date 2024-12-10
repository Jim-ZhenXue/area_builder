// Copyright 2002-2015, University of Colorado Boulder
/**
 * @fileoverview Rule to check that the PhET copyright statement is present and correct.
 *
 * Note it also supports PhET-iO licenses
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @copyright 2015 University of Colorado Boulder
 */ const _ = require('lodash');
const path = require('path');
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
/*
The top of a private phet-io-licensed file should look like this:

// Copyright 2015-2022, University of Colorado Boulder
// This PhET-iO file requires a license
// USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.
// For licensing, please contact phethelp@colorado.edu
 */ const phetioComments = [
    ' This PhET-iO file requires a license',
    ' USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.',
    ' For licensing, please contact phethelp@colorado.edu'
];
// A list of files in phet-io repos that don't need a phet-io license
const nonPhetioLicensedFiles = [
    'Gruntfile.cjs',
    'eslint.config.mjs',
    '-phet-io-overrides.js'
];
// Repos that get the extra check for PhET-iO licensing too.
const phetioLicenseRepos = [
    'phet-io',
    'phet-io-sim-specific',
    'phet-io-website',
    'phet-io-wrapper-classroom-activity',
    'phet-io-wrapper-haptics',
    'phet-io-wrapper-lab-book',
    'phet-io-wrappers',
    'studio'
].map((repo)=>repo + path.sep);
const gitRootPath = path.resolve(__dirname, '../../../../') + path.sep;
// Match for a PhET-iO license if in a PhET-iO licensed repo, but not an opted out of file.
const needsPhetioLicense = (filePath)=>{
    // Just use the path from git root, starting with something like 'chipper/'
    const localFilePath = filePath.replace(gitRootPath, '');
    return !_.some(nonPhetioLicensedFiles, (optOutFile)=>localFilePath.endsWith(optOutFile)) && _.some(phetioLicenseRepos, (repo)=>localFilePath.startsWith(repo));
};
module.exports = {
    create: function(context) {
        return {
            Program: function(node) {
                // Get the whole source code, not for node only.
                const comments = context.getSourceCode().getAllComments();
                const filename = context.getFilename();
                const isHTML = filename.endsWith('.html');
                if (isHTML) {
                    return;
                }
                const report = (loc, isPhetio)=>{
                    context.report({
                        node: node,
                        loc: loc,
                        message: `Incorrect copyright statement in first comment${isPhetio ? ', phet-io repos require phet-io licensing' : ''}`
                    });
                };
                if (!comments || comments.length === 0) {
                    report(1);
                } else {
                    // years must be between 2000 and 2099, inclusive.  A script can be used to check that the dates
                    // match the GitHub creation and last-modified dates
                    const isDateRangeOK = /^ Copyright 20\d\d-20\d\d, University of Colorado Boulder$/.test(comments[0].value);
                    const isSingleDateOK = /^ Copyright 20\d\d, University of Colorado Boulder$/.test(comments[0].value);
                    if (!isDateRangeOK && !isSingleDateOK) {
                        report(comments[0].loc.start);
                    } else if (needsPhetioLicense(filename)) {
                        // Handle the case where PhET-iO files need more comments for licensing.
                        // phet-io needs 4 line comments at the start of the file.
                        if (comments.length < 4) {
                            report(1, true);
                        }
                        const hopefulPhetioComments = comments.slice(1, 4);
                        for(let i = 0; i < hopefulPhetioComments.length; i++){
                            const comment = hopefulPhetioComments[i].value;
                            if (comment !== phetioComments[i]) {
                                report(hopefulPhetioComments[i].loc.start, true);
                                break;
                            }
                        }
                    }
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9jb3B5cmlnaHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMDItMjAxNSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBjaGVjayB0aGF0IHRoZSBQaEVUIGNvcHlyaWdodCBzdGF0ZW1lbnQgaXMgcHJlc2VudCBhbmQgY29ycmVjdC5cbiAqXG4gKiBOb3RlIGl0IGFsc28gc3VwcG9ydHMgUGhFVC1pTyBsaWNlbnNlc1xuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAY29weXJpZ2h0IDIwMTUgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4gKi9cblxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuLypcblRoZSB0b3Agb2YgYSBwcml2YXRlIHBoZXQtaW8tbGljZW5zZWQgZmlsZSBzaG91bGQgbG9vayBsaWtlIHRoaXM6XG5cbi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLy8gVGhpcyBQaEVULWlPIGZpbGUgcmVxdWlyZXMgYSBsaWNlbnNlXG4vLyBVU0UgV0lUSE9VVCBBIExJQ0VOU0UgQUdSRUVNRU5UIElTIFNUUklDVExZIFBST0hJQklURUQuXG4vLyBGb3IgbGljZW5zaW5nLCBwbGVhc2UgY29udGFjdCBwaGV0aGVscEBjb2xvcmFkby5lZHVcbiAqL1xuY29uc3QgcGhldGlvQ29tbWVudHMgPSBbXG4gICcgVGhpcyBQaEVULWlPIGZpbGUgcmVxdWlyZXMgYSBsaWNlbnNlJyxcbiAgJyBVU0UgV0lUSE9VVCBBIExJQ0VOU0UgQUdSRUVNRU5UIElTIFNUUklDVExZIFBST0hJQklURUQuJyxcbiAgJyBGb3IgbGljZW5zaW5nLCBwbGVhc2UgY29udGFjdCBwaGV0aGVscEBjb2xvcmFkby5lZHUnXG5dO1xuXG4vLyBBIGxpc3Qgb2YgZmlsZXMgaW4gcGhldC1pbyByZXBvcyB0aGF0IGRvbid0IG5lZWQgYSBwaGV0LWlvIGxpY2Vuc2VcbmNvbnN0IG5vblBoZXRpb0xpY2Vuc2VkRmlsZXMgPSBbXG4gICdHcnVudGZpbGUuY2pzJyxcbiAgJ2VzbGludC5jb25maWcubWpzJyxcbiAgJy1waGV0LWlvLW92ZXJyaWRlcy5qcydcbl07XG5cbi8vIFJlcG9zIHRoYXQgZ2V0IHRoZSBleHRyYSBjaGVjayBmb3IgUGhFVC1pTyBsaWNlbnNpbmcgdG9vLlxuY29uc3QgcGhldGlvTGljZW5zZVJlcG9zID0gW1xuICAncGhldC1pbycsXG4gICdwaGV0LWlvLXNpbS1zcGVjaWZpYycsXG4gICdwaGV0LWlvLXdlYnNpdGUnLFxuICAncGhldC1pby13cmFwcGVyLWNsYXNzcm9vbS1hY3Rpdml0eScsXG4gICdwaGV0LWlvLXdyYXBwZXItaGFwdGljcycsXG4gICdwaGV0LWlvLXdyYXBwZXItbGFiLWJvb2snLFxuICAncGhldC1pby13cmFwcGVycycsXG4gICdzdHVkaW8nXG5dLm1hcCggcmVwbyA9PiByZXBvICsgcGF0aC5zZXAgKTtcblxuY29uc3QgZ2l0Um9vdFBhdGggPSBwYXRoLnJlc29sdmUoIF9fZGlybmFtZSwgJy4uLy4uLy4uLy4uLycgKSArIHBhdGguc2VwO1xuXG4vLyBNYXRjaCBmb3IgYSBQaEVULWlPIGxpY2Vuc2UgaWYgaW4gYSBQaEVULWlPIGxpY2Vuc2VkIHJlcG8sIGJ1dCBub3QgYW4gb3B0ZWQgb3V0IG9mIGZpbGUuXG5jb25zdCBuZWVkc1BoZXRpb0xpY2Vuc2UgPSBmaWxlUGF0aCA9PiB7XG5cbiAgLy8gSnVzdCB1c2UgdGhlIHBhdGggZnJvbSBnaXQgcm9vdCwgc3RhcnRpbmcgd2l0aCBzb21ldGhpbmcgbGlrZSAnY2hpcHBlci8nXG4gIGNvbnN0IGxvY2FsRmlsZVBhdGggPSBmaWxlUGF0aC5yZXBsYWNlKCBnaXRSb290UGF0aCwgJycgKTtcbiAgcmV0dXJuICFfLnNvbWUoIG5vblBoZXRpb0xpY2Vuc2VkRmlsZXMsIG9wdE91dEZpbGUgPT4gbG9jYWxGaWxlUGF0aC5lbmRzV2l0aCggb3B0T3V0RmlsZSApICkgJiZcbiAgICAgICAgIF8uc29tZSggcGhldGlvTGljZW5zZVJlcG9zLCByZXBvID0+IGxvY2FsRmlsZVBhdGguc3RhcnRzV2l0aCggcmVwbyApICk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcblxuICAgIHJldHVybiB7XG4gICAgICBQcm9ncmFtOiBmdW5jdGlvbiggbm9kZSApIHtcbiAgICAgICAgLy8gR2V0IHRoZSB3aG9sZSBzb3VyY2UgY29kZSwgbm90IGZvciBub2RlIG9ubHkuXG4gICAgICAgIGNvbnN0IGNvbW1lbnRzID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCkuZ2V0QWxsQ29tbWVudHMoKTtcblxuICAgICAgICBjb25zdCBmaWxlbmFtZSA9IGNvbnRleHQuZ2V0RmlsZW5hbWUoKTtcbiAgICAgICAgY29uc3QgaXNIVE1MID0gZmlsZW5hbWUuZW5kc1dpdGgoICcuaHRtbCcgKTtcblxuICAgICAgICBpZiAoIGlzSFRNTCApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBvcnQgPSAoIGxvYywgaXNQaGV0aW8gKSA9PiB7XG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoIHtcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICBsb2M6IGxvYyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBJbmNvcnJlY3QgY29weXJpZ2h0IHN0YXRlbWVudCBpbiBmaXJzdCBjb21tZW50JHtpc1BoZXRpbyA/ICcsIHBoZXQtaW8gcmVwb3MgcmVxdWlyZSBwaGV0LWlvIGxpY2Vuc2luZycgOiAnJ31gXG4gICAgICAgICAgfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICggIWNvbW1lbnRzIHx8IGNvbW1lbnRzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICByZXBvcnQoIDEgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyB5ZWFycyBtdXN0IGJlIGJldHdlZW4gMjAwMCBhbmQgMjA5OSwgaW5jbHVzaXZlLiAgQSBzY3JpcHQgY2FuIGJlIHVzZWQgdG8gY2hlY2sgdGhhdCB0aGUgZGF0ZXNcbiAgICAgICAgICAvLyBtYXRjaCB0aGUgR2l0SHViIGNyZWF0aW9uIGFuZCBsYXN0LW1vZGlmaWVkIGRhdGVzXG4gICAgICAgICAgY29uc3QgaXNEYXRlUmFuZ2VPSyA9IC9eIENvcHlyaWdodCAyMFxcZFxcZC0yMFxcZFxcZCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyJC8udGVzdCggY29tbWVudHNbIDAgXS52YWx1ZSApO1xuICAgICAgICAgIGNvbnN0IGlzU2luZ2xlRGF0ZU9LID0gL14gQ29weXJpZ2h0IDIwXFxkXFxkLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXIkLy50ZXN0KCBjb21tZW50c1sgMCBdLnZhbHVlICk7XG4gICAgICAgICAgaWYgKCAhaXNEYXRlUmFuZ2VPSyAmJiAhaXNTaW5nbGVEYXRlT0sgKSB7XG4gICAgICAgICAgICByZXBvcnQoIGNvbW1lbnRzWyAwIF0ubG9jLnN0YXJ0ICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZWxzZSBpZiAoIG5lZWRzUGhldGlvTGljZW5zZSggZmlsZW5hbWUgKSApIHtcbiAgICAgICAgICAgIC8vIEhhbmRsZSB0aGUgY2FzZSB3aGVyZSBQaEVULWlPIGZpbGVzIG5lZWQgbW9yZSBjb21tZW50cyBmb3IgbGljZW5zaW5nLlxuXG4gICAgICAgICAgICAvLyBwaGV0LWlvIG5lZWRzIDQgbGluZSBjb21tZW50cyBhdCB0aGUgc3RhcnQgb2YgdGhlIGZpbGUuXG4gICAgICAgICAgICBpZiAoIGNvbW1lbnRzLmxlbmd0aCA8IDQgKSB7XG4gICAgICAgICAgICAgIHJlcG9ydCggMSwgdHJ1ZSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBob3BlZnVsUGhldGlvQ29tbWVudHMgPSBjb21tZW50cy5zbGljZSggMSwgNCApO1xuICAgICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaG9wZWZ1bFBoZXRpb0NvbW1lbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICBjb25zdCBjb21tZW50ID0gaG9wZWZ1bFBoZXRpb0NvbW1lbnRzWyBpIF0udmFsdWU7XG4gICAgICAgICAgICAgIGlmICggY29tbWVudCAhPT0gcGhldGlvQ29tbWVudHNbIGkgXSApIHtcbiAgICAgICAgICAgICAgICByZXBvcnQoIGhvcGVmdWxQaGV0aW9Db21tZW50c1sgaSBdLmxvYy5zdGFydCwgdHJ1ZSApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsiXyIsInJlcXVpcmUiLCJwYXRoIiwicGhldGlvQ29tbWVudHMiLCJub25QaGV0aW9MaWNlbnNlZEZpbGVzIiwicGhldGlvTGljZW5zZVJlcG9zIiwibWFwIiwicmVwbyIsInNlcCIsImdpdFJvb3RQYXRoIiwicmVzb2x2ZSIsIl9fZGlybmFtZSIsIm5lZWRzUGhldGlvTGljZW5zZSIsImZpbGVQYXRoIiwibG9jYWxGaWxlUGF0aCIsInJlcGxhY2UiLCJzb21lIiwib3B0T3V0RmlsZSIsImVuZHNXaXRoIiwic3RhcnRzV2l0aCIsIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJjb250ZXh0IiwiUHJvZ3JhbSIsIm5vZGUiLCJjb21tZW50cyIsImdldFNvdXJjZUNvZGUiLCJnZXRBbGxDb21tZW50cyIsImZpbGVuYW1lIiwiZ2V0RmlsZW5hbWUiLCJpc0hUTUwiLCJyZXBvcnQiLCJsb2MiLCJpc1BoZXRpbyIsIm1lc3NhZ2UiLCJsZW5ndGgiLCJpc0RhdGVSYW5nZU9LIiwidGVzdCIsInZhbHVlIiwiaXNTaW5nbGVEYXRlT0siLCJzdGFydCIsImhvcGVmdWxQaGV0aW9Db21tZW50cyIsInNsaWNlIiwiaSIsImNvbW1lbnQiLCJzY2hlbWEiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RDs7Ozs7OztDQU9DLEdBRUQsTUFBTUEsSUFBSUMsUUFBUztBQUNuQixNQUFNQyxPQUFPRCxRQUFTO0FBRXRCLGdGQUFnRjtBQUNoRixrQkFBa0I7QUFDbEIsZ0ZBQWdGO0FBR2hGOzs7Ozs7O0NBT0MsR0FDRCxNQUFNRSxpQkFBaUI7SUFDckI7SUFDQTtJQUNBO0NBQ0Q7QUFFRCxxRUFBcUU7QUFDckUsTUFBTUMseUJBQXlCO0lBQzdCO0lBQ0E7SUFDQTtDQUNEO0FBRUQsNERBQTREO0FBQzVELE1BQU1DLHFCQUFxQjtJQUN6QjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0NBQ0QsQ0FBQ0MsR0FBRyxDQUFFQyxDQUFBQSxPQUFRQSxPQUFPTCxLQUFLTSxHQUFHO0FBRTlCLE1BQU1DLGNBQWNQLEtBQUtRLE9BQU8sQ0FBRUMsV0FBVyxrQkFBbUJULEtBQUtNLEdBQUc7QUFFeEUsMkZBQTJGO0FBQzNGLE1BQU1JLHFCQUFxQkMsQ0FBQUE7SUFFekIsMkVBQTJFO0lBQzNFLE1BQU1DLGdCQUFnQkQsU0FBU0UsT0FBTyxDQUFFTixhQUFhO0lBQ3JELE9BQU8sQ0FBQ1QsRUFBRWdCLElBQUksQ0FBRVosd0JBQXdCYSxDQUFBQSxhQUFjSCxjQUFjSSxRQUFRLENBQUVELGdCQUN2RWpCLEVBQUVnQixJQUFJLENBQUVYLG9CQUFvQkUsQ0FBQUEsT0FBUU8sY0FBY0ssVUFBVSxDQUFFWjtBQUN2RTtBQUVBYSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUSxTQUFVQyxPQUFPO1FBRXZCLE9BQU87WUFDTEMsU0FBUyxTQUFVQyxJQUFJO2dCQUNyQixnREFBZ0Q7Z0JBQ2hELE1BQU1DLFdBQVdILFFBQVFJLGFBQWEsR0FBR0MsY0FBYztnQkFFdkQsTUFBTUMsV0FBV04sUUFBUU8sV0FBVztnQkFDcEMsTUFBTUMsU0FBU0YsU0FBU1gsUUFBUSxDQUFFO2dCQUVsQyxJQUFLYSxRQUFTO29CQUNaO2dCQUNGO2dCQUVBLE1BQU1DLFNBQVMsQ0FBRUMsS0FBS0M7b0JBQ3BCWCxRQUFRUyxNQUFNLENBQUU7d0JBQ2RQLE1BQU1BO3dCQUNOUSxLQUFLQTt3QkFDTEUsU0FBUyxDQUFDLDhDQUE4QyxFQUFFRCxXQUFXLDhDQUE4QyxJQUFJO29CQUN6SDtnQkFDRjtnQkFFQSxJQUFLLENBQUNSLFlBQVlBLFNBQVNVLE1BQU0sS0FBSyxHQUFJO29CQUN4Q0osT0FBUTtnQkFDVixPQUNLO29CQUNILGdHQUFnRztvQkFDaEcsb0RBQW9EO29CQUNwRCxNQUFNSyxnQkFBZ0IsNkRBQTZEQyxJQUFJLENBQUVaLFFBQVEsQ0FBRSxFQUFHLENBQUNhLEtBQUs7b0JBQzVHLE1BQU1DLGlCQUFpQixzREFBc0RGLElBQUksQ0FBRVosUUFBUSxDQUFFLEVBQUcsQ0FBQ2EsS0FBSztvQkFDdEcsSUFBSyxDQUFDRixpQkFBaUIsQ0FBQ0csZ0JBQWlCO3dCQUN2Q1IsT0FBUU4sUUFBUSxDQUFFLEVBQUcsQ0FBQ08sR0FBRyxDQUFDUSxLQUFLO29CQUNqQyxPQUVLLElBQUs3QixtQkFBb0JpQixXQUFhO3dCQUN6Qyx3RUFBd0U7d0JBRXhFLDBEQUEwRDt3QkFDMUQsSUFBS0gsU0FBU1UsTUFBTSxHQUFHLEdBQUk7NEJBQ3pCSixPQUFRLEdBQUc7d0JBQ2I7d0JBRUEsTUFBTVUsd0JBQXdCaEIsU0FBU2lCLEtBQUssQ0FBRSxHQUFHO3dCQUNqRCxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUYsc0JBQXNCTixNQUFNLEVBQUVRLElBQU07NEJBQ3ZELE1BQU1DLFVBQVVILHFCQUFxQixDQUFFRSxFQUFHLENBQUNMLEtBQUs7NEJBQ2hELElBQUtNLFlBQVkxQyxjQUFjLENBQUV5QyxFQUFHLEVBQUc7Z0NBQ3JDWixPQUFRVSxxQkFBcUIsQ0FBRUUsRUFBRyxDQUFDWCxHQUFHLENBQUNRLEtBQUssRUFBRTtnQ0FDOUM7NEJBQ0Y7d0JBQ0Y7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRjtBQUVBckIsT0FBT0MsT0FBTyxDQUFDeUIsTUFBTSxHQUFHLEVBRXZCIn0=