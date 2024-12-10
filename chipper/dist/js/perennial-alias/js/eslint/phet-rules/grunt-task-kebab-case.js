// Copyright 2024, University of Colorado Boulder
/**
 * @fileoverview no-import-from-grunt-tasks
 * Fails if a task in grunt/tasks/ doesn't use kebab case. This is because often these have camelCase counterparts
 * that are imported modules. These kebab-case tasks are just entry points, which hold a thin layer wrapping the module
 * plus option support.
 * @copyright 2024 University of Colorado Boulder
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const isGruntTaskFileRegex = /[\\/]grunt[\\/]tasks[\\/]?/;
const validKebabCase = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const path = require('path');
const OPT_OUT = [
    'eslint.config.mjs'
];
module.exports = {
    create: function(context) {
        return {
            Program: function(node) {
                const filePath = context.filename;
                const parsed = path.parse(filePath);
                // in grunt/tasks/
                if (isGruntTaskFileRegex.test(filePath) && // top level only
                parsed.dir.endsWith('tasks') && !OPT_OUT.includes(parsed.base) && // not valid kebab-case
                !validKebabCase.test(parsed.name)) {
                    context.report({
                        node: node,
                        loc: node.loc,
                        message: `files in "grunt/tasks/" must use kebab-case by convention (no snake or camel): ${parsed.base}`
                    });
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9ncnVudC10YXNrLWtlYmFiLWNhc2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgbm8taW1wb3J0LWZyb20tZ3J1bnQtdGFza3NcbiAqIEZhaWxzIGlmIGEgdGFzayBpbiBncnVudC90YXNrcy8gZG9lc24ndCB1c2Uga2ViYWIgY2FzZS4gVGhpcyBpcyBiZWNhdXNlIG9mdGVuIHRoZXNlIGhhdmUgY2FtZWxDYXNlIGNvdW50ZXJwYXJ0c1xuICogdGhhdCBhcmUgaW1wb3J0ZWQgbW9kdWxlcy4gVGhlc2Uga2ViYWItY2FzZSB0YXNrcyBhcmUganVzdCBlbnRyeSBwb2ludHMsIHdoaWNoIGhvbGQgYSB0aGluIGxheWVyIHdyYXBwaW5nIHRoZSBtb2R1bGVcbiAqIHBsdXMgb3B0aW9uIHN1cHBvcnQuXG4gKiBAY29weXJpZ2h0IDIwMjQgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bGUgRGVmaW5pdGlvblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgaXNHcnVudFRhc2tGaWxlUmVnZXggPSAvW1xcXFwvXWdydW50W1xcXFwvXXRhc2tzW1xcXFwvXT8vO1xuY29uc3QgdmFsaWRLZWJhYkNhc2UgPSAvXlthLXpdW2EtejAtOV0qKC1bYS16MC05XSspKiQvO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoICdwYXRoJyApO1xuXG5jb25zdCBPUFRfT1VUID0gW1xuICAnZXNsaW50LmNvbmZpZy5tanMnXG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcbiAgICByZXR1cm4ge1xuICAgICAgUHJvZ3JhbTogZnVuY3Rpb24oIG5vZGUgKSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gY29udGV4dC5maWxlbmFtZTtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGF0aC5wYXJzZSggZmlsZVBhdGggKTtcblxuICAgICAgICAvLyBpbiBncnVudC90YXNrcy9cbiAgICAgICAgaWYgKCBpc0dydW50VGFza0ZpbGVSZWdleC50ZXN0KCBmaWxlUGF0aCApICYmXG5cbiAgICAgICAgICAgICAvLyB0b3AgbGV2ZWwgb25seVxuICAgICAgICAgICAgIHBhcnNlZC5kaXIuZW5kc1dpdGgoICd0YXNrcycgKSAmJlxuXG4gICAgICAgICAgICAgIU9QVF9PVVQuaW5jbHVkZXMoIHBhcnNlZC5iYXNlICkgJiZcblxuICAgICAgICAgICAgIC8vIG5vdCB2YWxpZCBrZWJhYi1jYXNlXG4gICAgICAgICAgICAgIXZhbGlkS2ViYWJDYXNlLnRlc3QoIHBhcnNlZC5uYW1lICkgKSB7XG5cbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgIGxvYzogbm9kZS5sb2MsXG4gICAgICAgICAgICBtZXNzYWdlOiBgZmlsZXMgaW4gXCJncnVudC90YXNrcy9cIiBtdXN0IHVzZSBrZWJhYi1jYXNlIGJ5IGNvbnZlbnRpb24gKG5vIHNuYWtlIG9yIGNhbWVsKTogJHtwYXJzZWQuYmFzZX1gXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsiaXNHcnVudFRhc2tGaWxlUmVnZXgiLCJ2YWxpZEtlYmFiQ2FzZSIsInBhdGgiLCJyZXF1aXJlIiwiT1BUX09VVCIsIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJjb250ZXh0IiwiUHJvZ3JhbSIsIm5vZGUiLCJmaWxlUGF0aCIsImZpbGVuYW1lIiwicGFyc2VkIiwicGFyc2UiLCJ0ZXN0IiwiZGlyIiwiZW5kc1dpdGgiLCJpbmNsdWRlcyIsImJhc2UiLCJuYW1lIiwicmVwb3J0IiwibG9jIiwibWVzc2FnZSIsInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7O0NBT0MsR0FFRCxnRkFBZ0Y7QUFDaEYsa0JBQWtCO0FBQ2xCLGdGQUFnRjtBQUVoRixNQUFNQSx1QkFBdUI7QUFDN0IsTUFBTUMsaUJBQWlCO0FBQ3ZCLE1BQU1DLE9BQU9DLFFBQVM7QUFFdEIsTUFBTUMsVUFBVTtJQUNkO0NBQ0Q7QUFFREMsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVEsU0FBVUMsT0FBTztRQUN2QixPQUFPO1lBQ0xDLFNBQVMsU0FBVUMsSUFBSTtnQkFDckIsTUFBTUMsV0FBV0gsUUFBUUksUUFBUTtnQkFDakMsTUFBTUMsU0FBU1gsS0FBS1ksS0FBSyxDQUFFSDtnQkFFM0Isa0JBQWtCO2dCQUNsQixJQUFLWCxxQkFBcUJlLElBQUksQ0FBRUosYUFFM0IsaUJBQWlCO2dCQUNqQkUsT0FBT0csR0FBRyxDQUFDQyxRQUFRLENBQUUsWUFFckIsQ0FBQ2IsUUFBUWMsUUFBUSxDQUFFTCxPQUFPTSxJQUFJLEtBRTlCLHVCQUF1QjtnQkFDdkIsQ0FBQ2xCLGVBQWVjLElBQUksQ0FBRUYsT0FBT08sSUFBSSxHQUFLO29CQUV6Q1osUUFBUWEsTUFBTSxDQUFFO3dCQUNkWCxNQUFNQTt3QkFDTlksS0FBS1osS0FBS1ksR0FBRzt3QkFDYkMsU0FBUyxDQUFDLCtFQUErRSxFQUFFVixPQUFPTSxJQUFJLEVBQUU7b0JBQzFHO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0Y7QUFFQWQsT0FBT0MsT0FBTyxDQUFDa0IsTUFBTSxHQUFHLEVBRXZCIn0=