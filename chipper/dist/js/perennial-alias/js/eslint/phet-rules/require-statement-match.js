// Copyright 2002-2015, University of Colorado Boulder
/**
 * @fileoverview Rule to check that a require statement assigns to the correct variable name.
 * @author Sam Reid (PhET Interactive Simulations)
 * @copyright 2015 University of Colorado Boulder
 */ const path = require('path');
module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Ensure require statement variable names match the module names',
            category: 'Best Practices',
            recommended: false
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                properties: {
                    exceptions: {
                        type: 'object',
                        additionalProperties: {
                            type: 'string'
                        }
                    }
                },
                additionalProperties: false
            }
        ]
    },
    create: function(context) {
        // Get a list of built-in Node.js modules
        const builtInModules = new Set(module.builtinModules);
        // Retrieve custom exceptions from rule options
        const options = context.options[0] || {};
        const exceptionModules = options.exceptions || {
            lodash: '_',
            underscore: '_',
            jquery: '$',
            'lodash-4.17': '_' // Note it is imported as lodash-4.17.4, but it mistakes .4 as the extension
        };
        function toCamelCase(str) {
            return str.replace(/[-_](.)/g, (_, group1)=>group1.toUpperCase());
        }
        function getModuleName(requirePath) {
            // Handle scoped packages like '@namespace/module-name'
            if (requirePath.startsWith('@')) {
                const parts = requirePath.split('/');
                return parts.length > 1 ? parts[1] : parts[0];
            } else {
                const parts = requirePath.split('/');
                return parts[parts.length - 1];
            }
        }
        return {
            VariableDeclaration (node) {
                // Here is the AST of a typical require statement node, for reference
                //var exemplar = {
                //  'type': 'VariableDeclaration',
                //  'declarations': [
                //    {
                //      'type': 'VariableDeclarator',
                //      'id': {
                //        'type': 'Identifier',
                //        'name': 'EquationsScreen'
                //      },
                //      'init': {
                //        'type': 'CallExpression',
                //        'callee': {
                //          'type': 'Identifier',
                //          'name': 'require'
                //        },
                //        'arguments': [
                //          {
                //            'type': 'Literal',
                //            'value': 'FUNCTION_BUILDER/equations/EquationsScreen',
                //            'raw': "'FUNCTION_BUILDER/equations/EquationsScreen'"
                //          }
                //        ]
                //      }
                //    }
                //  ],
                //  'kind': 'var'
                //};
                node.declarations.forEach((declaration)=>{
                    const init = declaration.init;
                    if (init && init.type === 'CallExpression' && init.callee.name === 'require' && init.arguments.length === 1 && init.arguments[0].type === 'Literal' && typeof init.arguments[0].value === 'string' && declaration.id.type === 'Identifier' // Skip destructuring assignments
                    ) {
                        const lhs = declaration.id.name;
                        const rhs = init.arguments[0].value;
                        // Determine if the module is built-in
                        const isBuiltIn = builtInModules.has(rhs);
                        // Extract the module name from the require path
                        let moduleName;
                        if (rhs.startsWith('.')) {
                            // Relative path
                            moduleName = path.basename(rhs);
                            // Check for and remove file extension
                            const extName = path.extname(moduleName);
                            const hasExtension = extName.length > 0;
                            if (hasExtension) {
                                moduleName = moduleName.slice(0, -extName.length);
                            }
                        } else if (!isBuiltIn) {
                            // External module from node_modules or scoped package
                            moduleName = getModuleName(rhs);
                        } else {
                            // Built-in module, skip variable name check
                            return;
                        }
                        // Convert moduleName to camelCase for comparison
                        const camelCaseModuleName = toCamelCase(moduleName);
                        // Determine the expected variable name
                        const expectedVariableName = exceptionModules[moduleName] || camelCaseModuleName;
                        // Compare the LHS variable name with the expected variable name
                        if (lhs !== expectedVariableName && lhs !== moduleName) {
                            context.report({
                                node: declaration.id,
                                message: `Variable name '${lhs}' does not match module name '${moduleName}'. Expected '${expectedVariableName} or ${moduleName}'.`
                            });
                        }
                    }
                });
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9yZXF1aXJlLXN0YXRlbWVudC1tYXRjaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAwMi0yMDE1LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qKlxuICogQGZpbGVvdmVydmlldyBSdWxlIHRvIGNoZWNrIHRoYXQgYSByZXF1aXJlIHN0YXRlbWVudCBhc3NpZ25zIHRvIHRoZSBjb3JyZWN0IHZhcmlhYmxlIG5hbWUuXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGNvcHlyaWdodCAyMDE1IFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuICovXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsIC8vICdwcm9ibGVtJywgJ3N1Z2dlc3Rpb24nLCBvciAnbGF5b3V0J1xuICAgIGRvY3M6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5zdXJlIHJlcXVpcmUgc3RhdGVtZW50IHZhcmlhYmxlIG5hbWVzIG1hdGNoIHRoZSBtb2R1bGUgbmFtZXMnLFxuICAgICAgY2F0ZWdvcnk6ICdCZXN0IFByYWN0aWNlcycsXG4gICAgICByZWNvbW1lbmRlZDogZmFsc2VcbiAgICB9LFxuICAgIGZpeGFibGU6ICdjb2RlJywgLy8gJ2NvZGUnIG9yICd3aGl0ZXNwYWNlJ1xuICAgIHNjaGVtYTogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV4Y2VwdGlvbnM6IHtcbiAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZVxuICAgICAgfVxuICAgIF1cbiAgfSxcblxuICBjcmVhdGU6IGZ1bmN0aW9uKCBjb250ZXh0ICkge1xuXG5cbiAgICAvLyBHZXQgYSBsaXN0IG9mIGJ1aWx0LWluIE5vZGUuanMgbW9kdWxlc1xuICAgIGNvbnN0IGJ1aWx0SW5Nb2R1bGVzID0gbmV3IFNldCggbW9kdWxlLmJ1aWx0aW5Nb2R1bGVzICk7XG5cbiAgICAvLyBSZXRyaWV2ZSBjdXN0b20gZXhjZXB0aW9ucyBmcm9tIHJ1bGUgb3B0aW9uc1xuICAgIGNvbnN0IG9wdGlvbnMgPSBjb250ZXh0Lm9wdGlvbnNbIDAgXSB8fCB7fTtcbiAgICBjb25zdCBleGNlcHRpb25Nb2R1bGVzID0gb3B0aW9ucy5leGNlcHRpb25zIHx8IHtcbiAgICAgIGxvZGFzaDogJ18nLFxuICAgICAgdW5kZXJzY29yZTogJ18nLFxuICAgICAganF1ZXJ5OiAnJCcsXG4gICAgICAnbG9kYXNoLTQuMTcnOiAnXycgLy8gTm90ZSBpdCBpcyBpbXBvcnRlZCBhcyBsb2Rhc2gtNC4xNy40LCBidXQgaXQgbWlzdGFrZXMgLjQgYXMgdGhlIGV4dGVuc2lvblxuICAgIH07XG5cbiAgICBmdW5jdGlvbiB0b0NhbWVsQ2FzZSggc3RyICkge1xuICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKCAvWy1fXSguKS9nLCAoIF8sIGdyb3VwMSApID0+IGdyb3VwMS50b1VwcGVyQ2FzZSgpICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TW9kdWxlTmFtZSggcmVxdWlyZVBhdGggKSB7XG4gICAgICAvLyBIYW5kbGUgc2NvcGVkIHBhY2thZ2VzIGxpa2UgJ0BuYW1lc3BhY2UvbW9kdWxlLW5hbWUnXG4gICAgICBpZiAoIHJlcXVpcmVQYXRoLnN0YXJ0c1dpdGgoICdAJyApICkge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHJlcXVpcmVQYXRoLnNwbGl0KCAnLycgKTtcbiAgICAgICAgcmV0dXJuIHBhcnRzLmxlbmd0aCA+IDEgPyBwYXJ0c1sgMSBdIDogcGFydHNbIDAgXTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHJlcXVpcmVQYXRoLnNwbGl0KCAnLycgKTtcbiAgICAgICAgcmV0dXJuIHBhcnRzWyBwYXJ0cy5sZW5ndGggLSAxIF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIFZhcmlhYmxlRGVjbGFyYXRpb24oIG5vZGUgKSB7XG5cbiAgICAgICAgLy8gSGVyZSBpcyB0aGUgQVNUIG9mIGEgdHlwaWNhbCByZXF1aXJlIHN0YXRlbWVudCBub2RlLCBmb3IgcmVmZXJlbmNlXG4gICAgICAgIC8vdmFyIGV4ZW1wbGFyID0ge1xuICAgICAgICAvLyAgJ3R5cGUnOiAnVmFyaWFibGVEZWNsYXJhdGlvbicsXG4gICAgICAgIC8vICAnZGVjbGFyYXRpb25zJzogW1xuICAgICAgICAvLyAgICB7XG4gICAgICAgIC8vICAgICAgJ3R5cGUnOiAnVmFyaWFibGVEZWNsYXJhdG9yJyxcbiAgICAgICAgLy8gICAgICAnaWQnOiB7XG4gICAgICAgIC8vICAgICAgICAndHlwZSc6ICdJZGVudGlmaWVyJyxcbiAgICAgICAgLy8gICAgICAgICduYW1lJzogJ0VxdWF0aW9uc1NjcmVlbidcbiAgICAgICAgLy8gICAgICB9LFxuICAgICAgICAvLyAgICAgICdpbml0Jzoge1xuICAgICAgICAvLyAgICAgICAgJ3R5cGUnOiAnQ2FsbEV4cHJlc3Npb24nLFxuICAgICAgICAvLyAgICAgICAgJ2NhbGxlZSc6IHtcbiAgICAgICAgLy8gICAgICAgICAgJ3R5cGUnOiAnSWRlbnRpZmllcicsXG4gICAgICAgIC8vICAgICAgICAgICduYW1lJzogJ3JlcXVpcmUnXG4gICAgICAgIC8vICAgICAgICB9LFxuICAgICAgICAvLyAgICAgICAgJ2FyZ3VtZW50cyc6IFtcbiAgICAgICAgLy8gICAgICAgICAge1xuICAgICAgICAvLyAgICAgICAgICAgICd0eXBlJzogJ0xpdGVyYWwnLFxuICAgICAgICAvLyAgICAgICAgICAgICd2YWx1ZSc6ICdGVU5DVElPTl9CVUlMREVSL2VxdWF0aW9ucy9FcXVhdGlvbnNTY3JlZW4nLFxuICAgICAgICAvLyAgICAgICAgICAgICdyYXcnOiBcIidGVU5DVElPTl9CVUlMREVSL2VxdWF0aW9ucy9FcXVhdGlvbnNTY3JlZW4nXCJcbiAgICAgICAgLy8gICAgICAgICAgfVxuICAgICAgICAvLyAgICAgICAgXVxuICAgICAgICAvLyAgICAgIH1cbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvLyAgXSxcbiAgICAgICAgLy8gICdraW5kJzogJ3ZhcidcbiAgICAgICAgLy99O1xuICAgICAgICBub2RlLmRlY2xhcmF0aW9ucy5mb3JFYWNoKCBkZWNsYXJhdGlvbiA9PiB7XG4gICAgICAgICAgY29uc3QgaW5pdCA9IGRlY2xhcmF0aW9uLmluaXQ7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaW5pdCAmJlxuICAgICAgICAgICAgaW5pdC50eXBlID09PSAnQ2FsbEV4cHJlc3Npb24nICYmXG4gICAgICAgICAgICBpbml0LmNhbGxlZS5uYW1lID09PSAncmVxdWlyZScgJiZcbiAgICAgICAgICAgIGluaXQuYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAgICAgaW5pdC5hcmd1bWVudHNbIDAgXS50eXBlID09PSAnTGl0ZXJhbCcgJiZcbiAgICAgICAgICAgIHR5cGVvZiBpbml0LmFyZ3VtZW50c1sgMCBdLnZhbHVlID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgZGVjbGFyYXRpb24uaWQudHlwZSA9PT0gJ0lkZW50aWZpZXInIC8vIFNraXAgZGVzdHJ1Y3R1cmluZyBhc3NpZ25tZW50c1xuICAgICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgbGhzID0gZGVjbGFyYXRpb24uaWQubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IHJocyA9IGluaXQuYXJndW1lbnRzWyAwIF0udmFsdWU7XG5cbiAgICAgICAgICAgIC8vIERldGVybWluZSBpZiB0aGUgbW9kdWxlIGlzIGJ1aWx0LWluXG4gICAgICAgICAgICBjb25zdCBpc0J1aWx0SW4gPSBidWlsdEluTW9kdWxlcy5oYXMoIHJocyApO1xuXG4gICAgICAgICAgICAvLyBFeHRyYWN0IHRoZSBtb2R1bGUgbmFtZSBmcm9tIHRoZSByZXF1aXJlIHBhdGhcbiAgICAgICAgICAgIGxldCBtb2R1bGVOYW1lO1xuXG4gICAgICAgICAgICBpZiAoIHJocy5zdGFydHNXaXRoKCAnLicgKSApIHtcbiAgICAgICAgICAgICAgLy8gUmVsYXRpdmUgcGF0aFxuICAgICAgICAgICAgICBtb2R1bGVOYW1lID0gcGF0aC5iYXNlbmFtZSggcmhzICk7XG5cbiAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGFuZCByZW1vdmUgZmlsZSBleHRlbnNpb25cbiAgICAgICAgICAgICAgY29uc3QgZXh0TmFtZSA9IHBhdGguZXh0bmFtZSggbW9kdWxlTmFtZSApO1xuICAgICAgICAgICAgICBjb25zdCBoYXNFeHRlbnNpb24gPSBleHROYW1lLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICAgIGlmICggaGFzRXh0ZW5zaW9uICkge1xuICAgICAgICAgICAgICAgIG1vZHVsZU5hbWUgPSBtb2R1bGVOYW1lLnNsaWNlKCAwLCAtZXh0TmFtZS5sZW5ndGggKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoICFpc0J1aWx0SW4gKSB7XG4gICAgICAgICAgICAgIC8vIEV4dGVybmFsIG1vZHVsZSBmcm9tIG5vZGVfbW9kdWxlcyBvciBzY29wZWQgcGFja2FnZVxuICAgICAgICAgICAgICBtb2R1bGVOYW1lID0gZ2V0TW9kdWxlTmFtZSggcmhzICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQnVpbHQtaW4gbW9kdWxlLCBza2lwIHZhcmlhYmxlIG5hbWUgY2hlY2tcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDb252ZXJ0IG1vZHVsZU5hbWUgdG8gY2FtZWxDYXNlIGZvciBjb21wYXJpc29uXG4gICAgICAgICAgICBjb25zdCBjYW1lbENhc2VNb2R1bGVOYW1lID0gdG9DYW1lbENhc2UoIG1vZHVsZU5hbWUgKTtcblxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBleHBlY3RlZCB2YXJpYWJsZSBuYW1lXG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZhcmlhYmxlTmFtZSA9IGV4Y2VwdGlvbk1vZHVsZXNbIG1vZHVsZU5hbWUgXSB8fCBjYW1lbENhc2VNb2R1bGVOYW1lO1xuXG4gICAgICAgICAgICAvLyBDb21wYXJlIHRoZSBMSFMgdmFyaWFibGUgbmFtZSB3aXRoIHRoZSBleHBlY3RlZCB2YXJpYWJsZSBuYW1lXG4gICAgICAgICAgICBpZiAoIGxocyAhPT0gZXhwZWN0ZWRWYXJpYWJsZU5hbWUgJiYgbGhzICE9PSBtb2R1bGVOYW1lICkge1xuICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgICAgIG5vZGU6IGRlY2xhcmF0aW9uLmlkLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBWYXJpYWJsZSBuYW1lICcke2xoc30nIGRvZXMgbm90IG1hdGNoIG1vZHVsZSBuYW1lICcke21vZHVsZU5hbWV9Jy4gRXhwZWN0ZWQgJyR7ZXhwZWN0ZWRWYXJpYWJsZU5hbWV9IG9yICR7bW9kdWxlTmFtZX0nLmBcbiAgICAgICAgICAgICAgICAvLyBObyBhdXRvZml4IGZvciB2YXJpYWJsZSBuYW1lcyB0byBhdm9pZCB1bmludGVuZGVkIHNpZGUgZWZmZWN0c1xuICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTsiXSwibmFtZXMiOlsicGF0aCIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwiZGVzY3JpcHRpb24iLCJjYXRlZ29yeSIsInJlY29tbWVuZGVkIiwiZml4YWJsZSIsInNjaGVtYSIsInByb3BlcnRpZXMiLCJleGNlcHRpb25zIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJjcmVhdGUiLCJjb250ZXh0IiwiYnVpbHRJbk1vZHVsZXMiLCJTZXQiLCJidWlsdGluTW9kdWxlcyIsIm9wdGlvbnMiLCJleGNlcHRpb25Nb2R1bGVzIiwibG9kYXNoIiwidW5kZXJzY29yZSIsImpxdWVyeSIsInRvQ2FtZWxDYXNlIiwic3RyIiwicmVwbGFjZSIsIl8iLCJncm91cDEiLCJ0b1VwcGVyQ2FzZSIsImdldE1vZHVsZU5hbWUiLCJyZXF1aXJlUGF0aCIsInN0YXJ0c1dpdGgiLCJwYXJ0cyIsInNwbGl0IiwibGVuZ3RoIiwiVmFyaWFibGVEZWNsYXJhdGlvbiIsIm5vZGUiLCJkZWNsYXJhdGlvbnMiLCJmb3JFYWNoIiwiZGVjbGFyYXRpb24iLCJpbml0IiwiY2FsbGVlIiwibmFtZSIsImFyZ3VtZW50cyIsInZhbHVlIiwiaWQiLCJsaHMiLCJyaHMiLCJpc0J1aWx0SW4iLCJoYXMiLCJtb2R1bGVOYW1lIiwiYmFzZW5hbWUiLCJleHROYW1lIiwiZXh0bmFtZSIsImhhc0V4dGVuc2lvbiIsInNsaWNlIiwiY2FtZWxDYXNlTW9kdWxlTmFtZSIsImV4cGVjdGVkVmFyaWFibGVOYW1lIiwicmVwb3J0IiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3REOzs7O0NBSUMsR0FFRCxNQUFNQSxPQUFPQyxRQUFTO0FBRXRCQyxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsTUFBTTtRQUNKQyxNQUFNO1FBQ05DLE1BQU07WUFDSkMsYUFBYTtZQUNiQyxVQUFVO1lBQ1ZDLGFBQWE7UUFDZjtRQUNBQyxTQUFTO1FBQ1RDLFFBQVE7WUFDTjtnQkFDRU4s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