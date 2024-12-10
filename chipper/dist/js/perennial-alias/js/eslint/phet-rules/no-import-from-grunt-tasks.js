// Copyright 2024, University of Colorado Boulder
/**
 * @fileoverview no-import-from-grunt-tasks
 * Fails if import a file from grunt/tasks if you are not in that file. Note this doesn't check require() statements,
 * as that pattern is deprecated and new code shouldn't be using it anyways.
 * @copyright 2023 University of Colorado Boulder
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const hasFileSlash = /[\\/]/;
const isGruntTaskFileRegex = /[\\/]grunt[\\/]tasks[\\/]/;
const isGruntTaskUilsFileRegex = /[\\/]grunt[\\/]tasks[\\/]util[\\/]/;
const path = require('path');
module.exports = {
    create: (context)=>{
        const filename = context.filename;
        const dir = path.dirname(filename);
        if (!isGruntTaskFileRegex.test(filename)) {
            return {
                ImportDeclaration: (node)=>{
                    const importValue = node.source.value;
                    const fullImportFilename = path.join(dir, importValue); // Absolute path
                    // Don't check on something like 'fs' && check on the absolute path to support something like './tasks/x.js' &&
                    // allow using getOption/getRepo from outside the directory
                    if (hasFileSlash.test(importValue) && isGruntTaskFileRegex.test(fullImportFilename) && !isGruntTaskUilsFileRegex.test(fullImportFilename)) {
                        context.report({
                            node: node,
                            loc: node.loc,
                            message: `importing from grunt/tasks should only be done in grunt/tasks/: ${importValue.replace('/..', '')}`
                        });
                    }
                }
            };
        }
        return {};
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9uby1pbXBvcnQtZnJvbS1ncnVudC10YXNrcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBuby1pbXBvcnQtZnJvbS1ncnVudC10YXNrc1xuICogRmFpbHMgaWYgaW1wb3J0IGEgZmlsZSBmcm9tIGdydW50L3Rhc2tzIGlmIHlvdSBhcmUgbm90IGluIHRoYXQgZmlsZS4gTm90ZSB0aGlzIGRvZXNuJ3QgY2hlY2sgcmVxdWlyZSgpIHN0YXRlbWVudHMsXG4gKiBhcyB0aGF0IHBhdHRlcm4gaXMgZGVwcmVjYXRlZCBhbmQgbmV3IGNvZGUgc2hvdWxkbid0IGJlIHVzaW5nIGl0IGFueXdheXMuXG4gKiBAY29weXJpZ2h0IDIwMjMgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bGUgRGVmaW5pdGlvblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgaGFzRmlsZVNsYXNoID0gL1tcXFxcL10vO1xuY29uc3QgaXNHcnVudFRhc2tGaWxlUmVnZXggPSAvW1xcXFwvXWdydW50W1xcXFwvXXRhc2tzW1xcXFwvXS87XG5jb25zdCBpc0dydW50VGFza1VpbHNGaWxlUmVnZXggPSAvW1xcXFwvXWdydW50W1xcXFwvXXRhc2tzW1xcXFwvXXV0aWxbXFxcXC9dLztcbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogY29udGV4dCA9PiB7XG5cbiAgICBjb25zdCBmaWxlbmFtZSA9IGNvbnRleHQuZmlsZW5hbWU7XG4gICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKCBmaWxlbmFtZSApO1xuICAgIGlmICggIWlzR3J1bnRUYXNrRmlsZVJlZ2V4LnRlc3QoIGZpbGVuYW1lICkgKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBJbXBvcnREZWNsYXJhdGlvbjogbm9kZSA9PiB7XG4gICAgICAgICAgY29uc3QgaW1wb3J0VmFsdWUgPSBub2RlLnNvdXJjZS52YWx1ZTtcbiAgICAgICAgICBjb25zdCBmdWxsSW1wb3J0RmlsZW5hbWUgPSBwYXRoLmpvaW4oIGRpciwgaW1wb3J0VmFsdWUgKTsgLy8gQWJzb2x1dGUgcGF0aFxuXG4gICAgICAgICAgLy8gRG9uJ3QgY2hlY2sgb24gc29tZXRoaW5nIGxpa2UgJ2ZzJyAmJiBjaGVjayBvbiB0aGUgYWJzb2x1dGUgcGF0aCB0byBzdXBwb3J0IHNvbWV0aGluZyBsaWtlICcuL3Rhc2tzL3guanMnICYmXG4gICAgICAgICAgLy8gYWxsb3cgdXNpbmcgZ2V0T3B0aW9uL2dldFJlcG8gZnJvbSBvdXRzaWRlIHRoZSBkaXJlY3RvcnlcbiAgICAgICAgICBpZiAoIGhhc0ZpbGVTbGFzaC50ZXN0KCBpbXBvcnRWYWx1ZSApICYmIGlzR3J1bnRUYXNrRmlsZVJlZ2V4LnRlc3QoIGZ1bGxJbXBvcnRGaWxlbmFtZSApICYmXG4gICAgICAgICAgICAgICAhaXNHcnVudFRhc2tVaWxzRmlsZVJlZ2V4LnRlc3QoIGZ1bGxJbXBvcnRGaWxlbmFtZSApICkge1xuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoIHtcbiAgICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgICAgbG9jOiBub2RlLmxvYyxcbiAgICAgICAgICAgICAgbWVzc2FnZTogYGltcG9ydGluZyBmcm9tIGdydW50L3Rhc2tzIHNob3VsZCBvbmx5IGJlIGRvbmUgaW4gZ3J1bnQvdGFza3MvOiAke2ltcG9ydFZhbHVlLnJlcGxhY2UoICcvLi4nLCAnJyApfWBcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7fTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsiaGFzRmlsZVNsYXNoIiwiaXNHcnVudFRhc2tGaWxlUmVnZXgiLCJpc0dydW50VGFza1VpbHNGaWxlUmVnZXgiLCJwYXRoIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJjb250ZXh0IiwiZmlsZW5hbWUiLCJkaXIiLCJkaXJuYW1lIiwidGVzdCIsIkltcG9ydERlY2xhcmF0aW9uIiwibm9kZSIsImltcG9ydFZhbHVlIiwic291cmNlIiwidmFsdWUiLCJmdWxsSW1wb3J0RmlsZW5hbWUiLCJqb2luIiwicmVwb3J0IiwibG9jIiwibWVzc2FnZSIsInJlcGxhY2UiLCJzY2hlbWEiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7O0NBTUMsR0FFRCxnRkFBZ0Y7QUFDaEYsa0JBQWtCO0FBQ2xCLGdGQUFnRjtBQUVoRixNQUFNQSxlQUFlO0FBQ3JCLE1BQU1DLHVCQUF1QjtBQUM3QixNQUFNQywyQkFBMkI7QUFDakMsTUFBTUMsT0FBT0MsUUFBUztBQUV0QkMsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVFDLENBQUFBO1FBRU4sTUFBTUMsV0FBV0QsUUFBUUMsUUFBUTtRQUNqQyxNQUFNQyxNQUFNUCxLQUFLUSxPQUFPLENBQUVGO1FBQzFCLElBQUssQ0FBQ1IscUJBQXFCVyxJQUFJLENBQUVILFdBQWE7WUFDNUMsT0FBTztnQkFDTEksbUJBQW1CQyxDQUFBQTtvQkFDakIsTUFBTUMsY0FBY0QsS0FBS0UsTUFBTSxDQUFDQyxLQUFLO29CQUNyQyxNQUFNQyxxQkFBcUJmLEtBQUtnQixJQUFJLENBQUVULEtBQUtLLGNBQWUsZ0JBQWdCO29CQUUxRSwrR0FBK0c7b0JBQy9HLDJEQUEyRDtvQkFDM0QsSUFBS2YsYUFBYVksSUFBSSxDQUFFRyxnQkFBaUJkLHFCQUFxQlcsSUFBSSxDQUFFTSx1QkFDL0QsQ0FBQ2hCLHlCQUF5QlUsSUFBSSxDQUFFTSxxQkFBdUI7d0JBQzFEVixRQUFRWSxNQUFNLENBQUU7NEJBQ2ROLE1BQU1BOzRCQUNOTyxLQUFLUCxLQUFLTyxHQUFHOzRCQUNiQyxTQUFTLENBQUMsZ0VBQWdFLEVBQUVQLFlBQVlRLE9BQU8sQ0FBRSxPQUFPLEtBQU07d0JBQ2hIO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtRQUNBLE9BQU8sQ0FBQztJQUNWO0FBQ0Y7QUFFQWxCLE9BQU9DLE9BQU8sQ0FBQ2tCLE1BQU0sR0FBRyxFQUV2QiJ9