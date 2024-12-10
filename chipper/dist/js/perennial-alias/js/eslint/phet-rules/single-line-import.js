// Copyright 2016-2020, University of Colorado Boulder
/**
 * @fileoverview Rule to check that import statements are on single lines. Automated tools
 * and processes at PhET assume that imports are on a single line so this is important to enforce.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @copyright 2020 University of Colorado Boulder
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
    create: (context)=>{
        return {
            ImportDeclaration: (node)=>{
                if (node.loc.start.line !== node.loc.end.line) {
                    // AST JSON might look something like:
                    // {
                    //   "type": "ImportDeclaration",
                    //   "specifiers": [
                    //     {
                    //       "type": "ImportDefaultSpecifier",
                    //       "local": {
                    //         "type": "Identifier",
                    //         "name": "EnergySkateParkColorScheme",
                    //       }
                    //     }
                    //   ]
                    // }
                    node.specifiers.forEach((specifier)=>{
                        context.report({
                            node: node,
                            loc: node.loc,
                            message: `${specifier.local.name}: import statement should be on a single line.`
                        });
                    });
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9zaW5nbGUtbGluZS1pbXBvcnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBjaGVjayB0aGF0IGltcG9ydCBzdGF0ZW1lbnRzIGFyZSBvbiBzaW5nbGUgbGluZXMuIEF1dG9tYXRlZCB0b29sc1xuICogYW5kIHByb2Nlc3NlcyBhdCBQaEVUIGFzc3VtZSB0aGF0IGltcG9ydHMgYXJlIG9uIGEgc2luZ2xlIGxpbmUgc28gdGhpcyBpcyBpbXBvcnRhbnQgdG8gZW5mb3JjZS5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBjb3B5cmlnaHQgMjAyMCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbiAqL1xuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGNvbnRleHQgPT4ge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgSW1wb3J0RGVjbGFyYXRpb246IG5vZGUgPT4ge1xuICAgICAgICBpZiAoIG5vZGUubG9jLnN0YXJ0LmxpbmUgIT09IG5vZGUubG9jLmVuZC5saW5lICkge1xuXG4gICAgICAgICAgLy8gQVNUIEpTT04gbWlnaHQgbG9vayBzb21ldGhpbmcgbGlrZTpcbiAgICAgICAgICAvLyB7XG4gICAgICAgICAgLy8gICBcInR5cGVcIjogXCJJbXBvcnREZWNsYXJhdGlvblwiLFxuICAgICAgICAgIC8vICAgXCJzcGVjaWZpZXJzXCI6IFtcbiAgICAgICAgICAvLyAgICAge1xuICAgICAgICAgIC8vICAgICAgIFwidHlwZVwiOiBcIkltcG9ydERlZmF1bHRTcGVjaWZpZXJcIixcbiAgICAgICAgICAvLyAgICAgICBcImxvY2FsXCI6IHtcbiAgICAgICAgICAvLyAgICAgICAgIFwidHlwZVwiOiBcIklkZW50aWZpZXJcIixcbiAgICAgICAgICAvLyAgICAgICAgIFwibmFtZVwiOiBcIkVuZXJneVNrYXRlUGFya0NvbG9yU2NoZW1lXCIsXG4gICAgICAgICAgLy8gICAgICAgfVxuICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgLy8gICBdXG4gICAgICAgICAgLy8gfVxuICAgICAgICAgIG5vZGUuc3BlY2lmaWVycy5mb3JFYWNoKCBzcGVjaWZpZXIgPT4ge1xuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoIHtcbiAgICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgICAgbG9jOiBub2RlLmxvYyxcbiAgICAgICAgICAgICAgbWVzc2FnZTogYCR7c3BlY2lmaWVyLmxvY2FsLm5hbWV9OiBpbXBvcnQgc3RhdGVtZW50IHNob3VsZCBiZSBvbiBhIHNpbmdsZSBsaW5lLmBcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5zY2hlbWEgPSBbXG4gIC8vIEpTT04gU2NoZW1hIGZvciBydWxlIG9wdGlvbnMgZ29lcyBoZXJlXG5dOyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwiY3JlYXRlIiwiY29udGV4dCIsIkltcG9ydERlY2xhcmF0aW9uIiwibm9kZSIsImxvYyIsInN0YXJ0IiwibGluZSIsImVuZCIsInNwZWNpZmllcnMiLCJmb3JFYWNoIiwic3BlY2lmaWVyIiwicmVwb3J0IiwibWVzc2FnZSIsImxvY2FsIiwibmFtZSIsInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3REOzs7Ozs7Q0FNQyxHQUdELGdGQUFnRjtBQUNoRixrQkFBa0I7QUFDbEIsZ0ZBQWdGO0FBRWhGQSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUUMsQ0FBQUE7UUFFTixPQUFPO1lBRUxDLG1CQUFtQkMsQ0FBQUE7Z0JBQ2pCLElBQUtBLEtBQUtDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDQyxJQUFJLEtBQUtILEtBQUtDLEdBQUcsQ0FBQ0csR0FBRyxDQUFDRCxJQUFJLEVBQUc7b0JBRS9DLHNDQUFzQztvQkFDdEMsSUFBSTtvQkFDSixpQ0FBaUM7b0JBQ2pDLG9CQUFvQjtvQkFDcEIsUUFBUTtvQkFDUiwwQ0FBMEM7b0JBQzFDLG1CQUFtQjtvQkFDbkIsZ0NBQWdDO29CQUNoQyxnREFBZ0Q7b0JBQ2hELFVBQVU7b0JBQ1YsUUFBUTtvQkFDUixNQUFNO29CQUNOLElBQUk7b0JBQ0pILEtBQUtLLFVBQVUsQ0FBQ0MsT0FBTyxDQUFFQyxDQUFBQTt3QkFDdkJULFFBQVFVLE1BQU0sQ0FBRTs0QkFDZFIsTUFBTUE7NEJBQ05DLEtBQUtELEtBQUtDLEdBQUc7NEJBQ2JRLFNBQVMsR0FBR0YsVUFBVUcsS0FBSyxDQUFDQyxJQUFJLENBQUMsOENBQThDLENBQUM7d0JBQ2xGO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0Y7QUFFQWhCLE9BQU9DLE9BQU8sQ0FBQ2dCLE1BQU0sR0FBRyxFQUV2QiJ9