// Copyright 2020, University of Colorado Boulder
/**
 * @fileoverview Rule to check for usages of namespace.register( key, value ) to enforce that the key and value match.
 * One exception to this rule is when a function is added directly to the namespace. This is valid and useful
 * particularly in common libraries like dot and scenery.
 *
 * Note that this rule looks for ANY CallExpression whose first argument is a Literal node and whose second
 * argument is an Identifier node. So it will test any usage of register(), even if it isn't called
 * on a namespace. There is no way for the rule to determine if the type of the CallExpression.object is a Namespace,
 * so it cannot be more exclusive.
 *
 * The line namespace.register( 'ClassName', ClassName ) will have an AST node that looks like
 *{
 *   "type": "CallExpression",
 *   "callee": {
 *     "type": "MemberExpression",
 *     "object": {
 *       "type": "Identifier",
 *       "name": "namespace",
 *     },
 *     "property": {
 *       "type": "Identifier",
 *       "name": "register",
 *     },
 *   },
 *   "arguments": [
 *     {
 *       "type": "Literal",
 *       "value": "ClassName",
 *       "raw": "'ClassName'",
 *     },
 *     {
 *       "type": "Identifier",
 *       "name": "ClassName",
 *     }
 *   ]
 * }
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @copyright 2020 University of Colorado Boulder
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
    create: function(context) {
        return {
            CallExpression: (node)=>{
                if (node.callee && node.callee.type === 'MemberExpression') {
                    if (node.callee.property.name === 'register') {
                        const registerArgs = node.arguments;
                        if (registerArgs.length === 2) {
                            const firstArg = registerArgs[0];
                            const secondArg = registerArgs[1];
                            // we allow adding functions directly to the namespace
                            if (firstArg.type === 'Literal' && secondArg.type === 'Identifier') {
                                const firstArgValue = firstArg.value; // string from the Literal node value
                                const secondArgName = secondArg.name; // string from the Identifier node name
                                if (firstArgValue !== secondArgName) {
                                    context.report({
                                        node: node,
                                        loc: node.loc,
                                        message: `namespace key must match value - key: ${firstArgValue}, value: ${secondArgName}`
                                    });
                                }
                            }
                        }
                    }
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9uYW1lc3BhY2UtbWF0Y2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gY2hlY2sgZm9yIHVzYWdlcyBvZiBuYW1lc3BhY2UucmVnaXN0ZXIoIGtleSwgdmFsdWUgKSB0byBlbmZvcmNlIHRoYXQgdGhlIGtleSBhbmQgdmFsdWUgbWF0Y2guXG4gKiBPbmUgZXhjZXB0aW9uIHRvIHRoaXMgcnVsZSBpcyB3aGVuIGEgZnVuY3Rpb24gaXMgYWRkZWQgZGlyZWN0bHkgdG8gdGhlIG5hbWVzcGFjZS4gVGhpcyBpcyB2YWxpZCBhbmQgdXNlZnVsXG4gKiBwYXJ0aWN1bGFybHkgaW4gY29tbW9uIGxpYnJhcmllcyBsaWtlIGRvdCBhbmQgc2NlbmVyeS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBydWxlIGxvb2tzIGZvciBBTlkgQ2FsbEV4cHJlc3Npb24gd2hvc2UgZmlyc3QgYXJndW1lbnQgaXMgYSBMaXRlcmFsIG5vZGUgYW5kIHdob3NlIHNlY29uZFxuICogYXJndW1lbnQgaXMgYW4gSWRlbnRpZmllciBub2RlLiBTbyBpdCB3aWxsIHRlc3QgYW55IHVzYWdlIG9mIHJlZ2lzdGVyKCksIGV2ZW4gaWYgaXQgaXNuJ3QgY2FsbGVkXG4gKiBvbiBhIG5hbWVzcGFjZS4gVGhlcmUgaXMgbm8gd2F5IGZvciB0aGUgcnVsZSB0byBkZXRlcm1pbmUgaWYgdGhlIHR5cGUgb2YgdGhlIENhbGxFeHByZXNzaW9uLm9iamVjdCBpcyBhIE5hbWVzcGFjZSxcbiAqIHNvIGl0IGNhbm5vdCBiZSBtb3JlIGV4Y2x1c2l2ZS5cbiAqXG4gKiBUaGUgbGluZSBuYW1lc3BhY2UucmVnaXN0ZXIoICdDbGFzc05hbWUnLCBDbGFzc05hbWUgKSB3aWxsIGhhdmUgYW4gQVNUIG5vZGUgdGhhdCBsb29rcyBsaWtlXG4gKntcbiAqICAgXCJ0eXBlXCI6IFwiQ2FsbEV4cHJlc3Npb25cIixcbiAqICAgXCJjYWxsZWVcIjoge1xuICogICAgIFwidHlwZVwiOiBcIk1lbWJlckV4cHJlc3Npb25cIixcbiAqICAgICBcIm9iamVjdFwiOiB7XG4gKiAgICAgICBcInR5cGVcIjogXCJJZGVudGlmaWVyXCIsXG4gKiAgICAgICBcIm5hbWVcIjogXCJuYW1lc3BhY2VcIixcbiAqICAgICB9LFxuICogICAgIFwicHJvcGVydHlcIjoge1xuICogICAgICAgXCJ0eXBlXCI6IFwiSWRlbnRpZmllclwiLFxuICogICAgICAgXCJuYW1lXCI6IFwicmVnaXN0ZXJcIixcbiAqICAgICB9LFxuICogICB9LFxuICogICBcImFyZ3VtZW50c1wiOiBbXG4gKiAgICAge1xuICogICAgICAgXCJ0eXBlXCI6IFwiTGl0ZXJhbFwiLFxuICogICAgICAgXCJ2YWx1ZVwiOiBcIkNsYXNzTmFtZVwiLFxuICogICAgICAgXCJyYXdcIjogXCInQ2xhc3NOYW1lJ1wiLFxuICogICAgIH0sXG4gKiAgICAge1xuICogICAgICAgXCJ0eXBlXCI6IFwiSWRlbnRpZmllclwiLFxuICogICAgICAgXCJuYW1lXCI6IFwiQ2xhc3NOYW1lXCIsXG4gKiAgICAgfVxuICogICBdXG4gKiB9XG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAY29weXJpZ2h0IDIwMjAgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4gKi9cblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcbiAgICByZXR1cm4ge1xuICAgICAgQ2FsbEV4cHJlc3Npb246IG5vZGUgPT4ge1xuICAgICAgICBpZiAoIG5vZGUuY2FsbGVlICYmIG5vZGUuY2FsbGVlLnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJyApIHtcbiAgICAgICAgICBpZiAoIG5vZGUuY2FsbGVlLnByb3BlcnR5Lm5hbWUgPT09ICdyZWdpc3RlcicgKSB7XG4gICAgICAgICAgICBjb25zdCByZWdpc3RlckFyZ3MgPSBub2RlLmFyZ3VtZW50cztcbiAgICAgICAgICAgIGlmICggcmVnaXN0ZXJBcmdzLmxlbmd0aCA9PT0gMiApIHtcbiAgICAgICAgICAgICAgY29uc3QgZmlyc3RBcmcgPSByZWdpc3RlckFyZ3NbIDAgXTtcbiAgICAgICAgICAgICAgY29uc3Qgc2Vjb25kQXJnID0gcmVnaXN0ZXJBcmdzWyAxIF07XG5cbiAgICAgICAgICAgICAgLy8gd2UgYWxsb3cgYWRkaW5nIGZ1bmN0aW9ucyBkaXJlY3RseSB0byB0aGUgbmFtZXNwYWNlXG4gICAgICAgICAgICAgIGlmICggZmlyc3RBcmcudHlwZSA9PT0gJ0xpdGVyYWwnICYmIHNlY29uZEFyZy50eXBlID09PSAnSWRlbnRpZmllcicgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RBcmdWYWx1ZSA9IGZpcnN0QXJnLnZhbHVlOyAvLyBzdHJpbmcgZnJvbSB0aGUgTGl0ZXJhbCBub2RlIHZhbHVlXG4gICAgICAgICAgICAgICAgY29uc3Qgc2Vjb25kQXJnTmFtZSA9IHNlY29uZEFyZy5uYW1lOyAvLyBzdHJpbmcgZnJvbSB0aGUgSWRlbnRpZmllciBub2RlIG5hbWVcblxuICAgICAgICAgICAgICAgIGlmICggZmlyc3RBcmdWYWx1ZSAhPT0gc2Vjb25kQXJnTmFtZSApIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGxvYzogbm9kZS5sb2MsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBuYW1lc3BhY2Uga2V5IG11c3QgbWF0Y2ggdmFsdWUgLSBrZXk6ICR7Zmlyc3RBcmdWYWx1ZX0sIHZhbHVlOiAke3NlY29uZEFyZ05hbWV9YFxuICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLnNjaGVtYSA9IFtcbiAgLy8gSlNPTiBTY2hlbWEgZm9yIHJ1bGUgb3B0aW9ucyBnb2VzIGhlcmVcbl07Il0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJjb250ZXh0IiwiQ2FsbEV4cHJlc3Npb24iLCJub2RlIiwiY2FsbGVlIiwidHlwZSIsInByb3BlcnR5IiwibmFtZSIsInJlZ2lzdGVyQXJncyIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZpcnN0QXJnIiwic2Vjb25kQXJnIiwiZmlyc3RBcmdWYWx1ZSIsInZhbHVlIiwic2Vjb25kQXJnTmFtZSIsInJlcG9ydCIsImxvYyIsIm1lc3NhZ2UiLCJzY2hlbWEiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUNDLEdBR0QsZ0ZBQWdGO0FBQ2hGLGtCQUFrQjtBQUNsQixnRkFBZ0Y7QUFFaEZBLE9BQU9DLE9BQU8sR0FBRztJQUNmQyxRQUFRLFNBQVVDLE9BQU87UUFDdkIsT0FBTztZQUNMQyxnQkFBZ0JDLENBQUFBO2dCQUNkLElBQUtBLEtBQUtDLE1BQU0sSUFBSUQsS0FBS0MsTUFBTSxDQUFDQyxJQUFJLEtBQUssb0JBQXFCO29CQUM1RCxJQUFLRixLQUFLQyxNQUFNLENBQUNFLFFBQVEsQ0FBQ0MsSUFBSSxLQUFLLFlBQWE7d0JBQzlDLE1BQU1DLGVBQWVMLEtBQUtNLFNBQVM7d0JBQ25DLElBQUtELGFBQWFFLE1BQU0sS0FBSyxHQUFJOzRCQUMvQixNQUFNQyxXQUFXSCxZQUFZLENBQUUsRUFBRzs0QkFDbEMsTUFBTUksWUFBWUosWUFBWSxDQUFFLEVBQUc7NEJBRW5DLHNEQUFzRDs0QkFDdEQsSUFBS0csU0FBU04sSUFBSSxLQUFLLGFBQWFPLFVBQVVQLElBQUksS0FBSyxjQUFlO2dDQUNwRSxNQUFNUSxnQkFBZ0JGLFNBQVNHLEtBQUssRUFBRSxxQ0FBcUM7Z0NBQzNFLE1BQU1DLGdCQUFnQkgsVUFBVUwsSUFBSSxFQUFFLHVDQUF1QztnQ0FFN0UsSUFBS00sa0JBQWtCRSxlQUFnQjtvQ0FDckNkLFFBQVFlLE1BQU0sQ0FBRTt3Q0FDZGIsTUFBTUE7d0NBQ05jLEtBQUtkLEtBQUtjLEdBQUc7d0NBQ2JDLFNBQVMsQ0FBQyxzQ0FBc0MsRUFBRUwsY0FBYyxTQUFTLEVBQUVFLGVBQWU7b0NBQzVGO2dDQUNGOzRCQUNGO3dCQUNGO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0Y7QUFFQWpCLE9BQU9DLE9BQU8sQ0FBQ29CLE1BQU0sR0FBRyxFQUV2QiJ9