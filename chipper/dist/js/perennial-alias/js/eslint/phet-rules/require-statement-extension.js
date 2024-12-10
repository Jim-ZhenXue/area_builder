// Copyright 2002-2024, University of Colorado Boulder
/**
 * @fileoverview Rule to check that a require statement extension is not provided for .js files.
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @copyright 2024 University of Colorado Boulder
 */ const path = require('path');
module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Ensure require statements have same extension usages',
            category: 'Best Practices',
            recommended: false
        },
        fixable: 'code' // 'code' or 'whitespace'
    },
    create: function(context) {
        const filename = context.getFilename();
        return {
            CallExpression (node) {
                var _node_callee;
                if (((_node_callee = node.callee) == null ? void 0 : _node_callee.name) === 'require' && node.arguments.length === 1 && node.arguments[0].type === 'Literal' && typeof node.arguments[0].value === 'string') {
                    const pathString = node.arguments[0].value;
                    // Extract the module name from the require path
                    let moduleName;
                    if (pathString.startsWith('.')) {
                        // Relative path
                        moduleName = path.basename(pathString);
                        // Check for and remove file extension
                        const extName = path.extname(moduleName);
                        const hasExtension = extName.length > 0;
                        if (hasExtension) {
                            moduleName = moduleName.slice(0, -extName.length);
                        }
                        // Enforce no .js suffix for relative paths in javascript files, see https://github.com/phetsims/chipper/issues/1498
                        const enforceNoJsSuffix = filename.endsWith('.js') && !pathString.includes('node_modules'); // Set to false if not enforcing
                        if (enforceNoJsSuffix && hasExtension && extName === '.js') {
                            context.report({
                                node: node.arguments[0],
                                message: `Require path '${pathString}' should never include'.js' extension. (It is harder to convert commonJS modules to TypeScript)`,
                                fix: function(fixer) {
                                    return fixer.replaceText(node.arguments[0], `'${pathString.replace('.js', '')}'`);
                                }
                            });
                        }
                    }
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9yZXF1aXJlLXN0YXRlbWVudC1leHRlbnNpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMDItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBjaGVjayB0aGF0IGEgcmVxdWlyZSBzdGF0ZW1lbnQgZXh0ZW5zaW9uIGlzIG5vdCBwcm92aWRlZCBmb3IgLmpzIGZpbGVzLlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBjb3B5cmlnaHQgMjAyNCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLCAvLyAncHJvYmxlbScsICdzdWdnZXN0aW9uJywgb3IgJ2xheW91dCdcbiAgICBkb2NzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0Vuc3VyZSByZXF1aXJlIHN0YXRlbWVudHMgaGF2ZSBzYW1lIGV4dGVuc2lvbiB1c2FnZXMnLFxuICAgICAgY2F0ZWdvcnk6ICdCZXN0IFByYWN0aWNlcycsXG4gICAgICByZWNvbW1lbmRlZDogZmFsc2VcbiAgICB9LFxuICAgIGZpeGFibGU6ICdjb2RlJyAvLyAnY29kZScgb3IgJ3doaXRlc3BhY2UnXG4gIH0sXG5cbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcbiAgICBjb25zdCBmaWxlbmFtZSA9IGNvbnRleHQuZ2V0RmlsZW5hbWUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgQ2FsbEV4cHJlc3Npb24oIG5vZGUgKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBub2RlLmNhbGxlZT8ubmFtZSA9PT0gJ3JlcXVpcmUnICYmXG4gICAgICAgICAgbm9kZS5hcmd1bWVudHMubGVuZ3RoID09PSAxICYmXG4gICAgICAgICAgbm9kZS5hcmd1bWVudHNbIDAgXS50eXBlID09PSAnTGl0ZXJhbCcgJiZcbiAgICAgICAgICB0eXBlb2Ygbm9kZS5hcmd1bWVudHNbIDAgXS52YWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgcGF0aFN0cmluZyA9IG5vZGUuYXJndW1lbnRzWyAwIF0udmFsdWU7XG5cbiAgICAgICAgICAvLyBFeHRyYWN0IHRoZSBtb2R1bGUgbmFtZSBmcm9tIHRoZSByZXF1aXJlIHBhdGhcbiAgICAgICAgICBsZXQgbW9kdWxlTmFtZTtcblxuICAgICAgICAgIGlmICggcGF0aFN0cmluZy5zdGFydHNXaXRoKCAnLicgKSApIHtcbiAgICAgICAgICAgIC8vIFJlbGF0aXZlIHBhdGhcbiAgICAgICAgICAgIG1vZHVsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKCBwYXRoU3RyaW5nICk7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBhbmQgcmVtb3ZlIGZpbGUgZXh0ZW5zaW9uXG4gICAgICAgICAgICBjb25zdCBleHROYW1lID0gcGF0aC5leHRuYW1lKCBtb2R1bGVOYW1lICk7XG4gICAgICAgICAgICBjb25zdCBoYXNFeHRlbnNpb24gPSBleHROYW1lLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICBpZiAoIGhhc0V4dGVuc2lvbiApIHtcbiAgICAgICAgICAgICAgbW9kdWxlTmFtZSA9IG1vZHVsZU5hbWUuc2xpY2UoIDAsIC1leHROYW1lLmxlbmd0aCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFbmZvcmNlIG5vIC5qcyBzdWZmaXggZm9yIHJlbGF0aXZlIHBhdGhzIGluIGphdmFzY3JpcHQgZmlsZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTQ5OFxuICAgICAgICAgICAgY29uc3QgZW5mb3JjZU5vSnNTdWZmaXggPSBmaWxlbmFtZS5lbmRzV2l0aCggJy5qcycgKSAmJiAhcGF0aFN0cmluZy5pbmNsdWRlcyggJ25vZGVfbW9kdWxlcycgKTsgLy8gU2V0IHRvIGZhbHNlIGlmIG5vdCBlbmZvcmNpbmdcblxuICAgICAgICAgICAgaWYgKCBlbmZvcmNlTm9Kc1N1ZmZpeCAmJiBoYXNFeHRlbnNpb24gJiYgZXh0TmFtZSA9PT0gJy5qcycgKSB7XG4gICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZS5hcmd1bWVudHNbIDAgXSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgUmVxdWlyZSBwYXRoICcke3BhdGhTdHJpbmd9JyBzaG91bGQgbmV2ZXIgaW5jbHVkZScuanMnIGV4dGVuc2lvbi4gKEl0IGlzIGhhcmRlciB0byBjb252ZXJ0IGNvbW1vbkpTIG1vZHVsZXMgdG8gVHlwZVNjcmlwdClgLFxuICAgICAgICAgICAgICAgIGZpeDogZnVuY3Rpb24oIGZpeGVyICkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpeGVyLnJlcGxhY2VUZXh0KFxuICAgICAgICAgICAgICAgICAgICBub2RlLmFyZ3VtZW50c1sgMCBdLFxuICAgICAgICAgICAgICAgICAgICBgJyR7cGF0aFN0cmluZy5yZXBsYWNlKCAnLmpzJywgJycgKX0nYFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59OyJdLCJuYW1lcyI6WyJwYXRoIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJkZXNjcmlwdGlvbiIsImNhdGVnb3J5IiwicmVjb21tZW5kZWQiLCJmaXhhYmxlIiwiY3JlYXRlIiwiY29udGV4dCIsImZpbGVuYW1lIiwiZ2V0RmlsZW5hbWUiLCJDYWxsRXhwcmVzc2lvbiIsIm5vZGUiLCJjYWxsZWUiLCJuYW1lIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwidmFsdWUiLCJwYXRoU3RyaW5nIiwibW9kdWxlTmFtZSIsInN0YXJ0c1dpdGgiLCJiYXNlbmFtZSIsImV4dE5hbWUiLCJleHRuYW1lIiwiaGFzRXh0ZW5zaW9uIiwic2xpY2UiLCJlbmZvcmNlTm9Kc1N1ZmZpeCIsImVuZHNXaXRoIiwiaW5jbHVkZXMiLCJyZXBvcnQiLCJtZXNzYWdlIiwiZml4IiwiZml4ZXIiLCJyZXBsYWNlVGV4dCIsInJlcGxhY2UiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RDs7Ozs7Q0FLQyxHQUVELE1BQU1BLE9BQU9DLFFBQVM7QUFFdEJDLE9BQU9DLE9BQU8sR0FBRztJQUNmQyxNQUFNO1FBQ0pDLE1BQU07UUFDTkMsTUFBTTtZQUNKQyxhQUFhO1lBQ2JDLFVBQVU7WUFDVkMsYUFBYTtRQUNmO1FBQ0FDLFNBQVMsT0FBTyx5QkFBeUI7SUFDM0M7SUFFQUMsUUFBUSxTQUFVQyxPQUFPO1FBQ3ZCLE1BQU1DLFdBQVdELFFBQVFFLFdBQVc7UUFDcEMsT0FBTztZQUNMQyxnQkFBZ0JDLElBQUk7b0JBRWhCQTtnQkFERixJQUNFQSxFQUFBQSxlQUFBQSxLQUFLQyxNQUFNLHFCQUFYRCxhQUFhRSxJQUFJLE1BQUssYUFDdEJGLEtBQUtHLFNBQVMsQ0FBQ0MsTUFBTSxLQUFLLEtBQzFCSixLQUFLRyxTQUFTLENBQUUsRUFBRyxDQUFDZCxJQUFJLEtBQUssYUFDN0IsT0FBT1csS0FBS0csU0FBUyxDQUFFLEVBQUcsQ0FBQ0UsS0FBSyxLQUFLLFVBQ3JDO29CQUNBLE1BQU1DLGFBQWFOLEtBQUtHLFNBQVMsQ0FBRSxFQUFHLENBQUNFLEtBQUs7b0JBRTVDLGdEQUFnRDtvQkFDaEQsSUFBSUU7b0JBRUosSUFBS0QsV0FBV0UsVUFBVSxDQUFFLE1BQVE7d0JBQ2xDLGdCQUFnQjt3QkFDaEJELGFBQWF2QixLQUFLeUIsUUFBUSxDQUFFSDt3QkFFNUIsc0NBQXNDO3dCQUN0QyxNQUFNSSxVQUFVMUIsS0FBSzJCLE9BQU8sQ0FBRUo7d0JBQzlCLE1BQU1LLGVBQWVGLFFBQVFOLE1BQU0sR0FBRzt3QkFDdEMsSUFBS1EsY0FBZTs0QkFDbEJMLGFBQWFBLFdBQVdNLEtBQUssQ0FBRSxHQUFHLENBQUNILFFBQVFOLE1BQU07d0JBQ25EO3dCQUVBLG9IQUFvSDt3QkFDcEgsTUFBTVUsb0JBQW9CakIsU0FBU2tCLFFBQVEsQ0FBRSxVQUFXLENBQUNULFdBQVdVLFFBQVEsQ0FBRSxpQkFBa0IsZ0NBQWdDO3dCQUVoSSxJQUFLRixxQkFBcUJGLGdCQUFnQkYsWUFBWSxPQUFROzRCQUM1RGQsUUFBUXFCLE1BQU0sQ0FBRTtnQ0FDZGpCLE1BQU1BLEtBQUtHLFNBQVMsQ0FBRSxFQUFHO2dDQUN6QmUsU0FBUyxDQUFDLGNBQWMsRUFBRVosV0FBVywrRkFBK0YsQ0FBQztnQ0FDcklhLEtBQUssU0FBVUMsS0FBSztvQ0FDbEIsT0FBT0EsTUFBTUMsV0FBVyxDQUN0QnJCLEtBQUtHLFNBQVMsQ0FBRSxFQUFHLEVBQ25CLENBQUMsQ0FBQyxFQUFFRyxXQUFXZ0IsT0FBTyxDQUFFLE9BQU8sSUFBSyxDQUFDLENBQUM7Z0NBRTFDOzRCQUNGO3dCQUNGO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0YifQ==