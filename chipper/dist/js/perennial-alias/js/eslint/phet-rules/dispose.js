// Copyright 2002-2015, University of Colorado Boulder
/**
 * @fileoverview Rule to check that a dispose function is present for objects that register observers and listeners.
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @copyright 2015 University of Colorado Boulder
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
    create: function(context) {
        // the following holds the possible ways to register various PhET listeners and observers
        // TODO: derivedProperty, https://github.com/phetsims/chipper/issues/418
        const OBSERVER_REGISTRATIONS = {
            LINK: 'link',
            LAZY_LINK: 'lazyLink',
            ON: 'on',
            MULTILINK: 'multilink',
            ADD_LISTENER: 'addListener',
            ADD_EVENT_LISTENER: 'addEventListener',
            ADD_INSTANCE: 'addInstance'
        };
        return {
            ExpressionStatement: function(node) {
                // look through the AST of a typical observer registration, see https://github.com/phetsims/chipper/issues/418
                if (node.expression && node.expression.callee && node.expression.callee.property && node.expression.callee.property.name) {
                    const calleeName = node.expression.callee.property.name;
                    for(const key in OBSERVER_REGISTRATIONS){
                        if (OBSERVER_REGISTRATIONS.hasOwnProperty(key)) {
                            if (calleeName === OBSERVER_REGISTRATIONS[key]) {
                                // we have found an observer registration, start at the root and look through its tokens for dispose
                                let disposeFound = false;
                                const rootNode = context.getSourceCode().ast;
                                if (rootNode && rootNode.tokens) {
                                    rootNode.tokens.forEach((token)=>{
                                        if (token) {
                                            if (token.type === 'Identifier' && token.value === 'dispose') {
                                                // we have found a dispose function
                                                disposeFound = true;
                                            }
                                        }
                                    });
                                }
                                if (!disposeFound) {
                                    context.report({
                                        node: node,
                                        loc: node.loc.start,
                                        message: 'observer registration missing dispose function'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9kaXNwb3NlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDAyLTIwMTUsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gY2hlY2sgdGhhdCBhIGRpc3Bvc2UgZnVuY3Rpb24gaXMgcHJlc2VudCBmb3Igb2JqZWN0cyB0aGF0IHJlZ2lzdGVyIG9ic2VydmVycyBhbmQgbGlzdGVuZXJzLlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAY29weXJpZ2h0IDIwMTUgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4gKi9cblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcblxuICAgIC8vIHRoZSBmb2xsb3dpbmcgaG9sZHMgdGhlIHBvc3NpYmxlIHdheXMgdG8gcmVnaXN0ZXIgdmFyaW91cyBQaEVUIGxpc3RlbmVycyBhbmQgb2JzZXJ2ZXJzXG4gICAgLy8gVE9ETzogZGVyaXZlZFByb3BlcnR5LCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNDE4XG4gICAgY29uc3QgT0JTRVJWRVJfUkVHSVNUUkFUSU9OUyA9IHtcbiAgICAgIExJTks6ICdsaW5rJyxcbiAgICAgIExBWllfTElOSzogJ2xhenlMaW5rJyxcbiAgICAgIE9OOiAnb24nLFxuICAgICAgTVVMVElMSU5LOiAnbXVsdGlsaW5rJyxcbiAgICAgIEFERF9MSVNURU5FUjogJ2FkZExpc3RlbmVyJyxcbiAgICAgIEFERF9FVkVOVF9MSVNURU5FUjogJ2FkZEV2ZW50TGlzdGVuZXInLFxuICAgICAgQUREX0lOU1RBTkNFOiAnYWRkSW5zdGFuY2UnXG4gICAgfTtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIEV4cHJlc3Npb25TdGF0ZW1lbnQ6IGZ1bmN0aW9uKCBub2RlICkge1xuXG4gICAgICAgIC8vIGxvb2sgdGhyb3VnaCB0aGUgQVNUIG9mIGEgdHlwaWNhbCBvYnNlcnZlciByZWdpc3RyYXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNDE4XG4gICAgICAgIGlmICggbm9kZS5leHByZXNzaW9uICYmXG4gICAgICAgICAgICAgbm9kZS5leHByZXNzaW9uLmNhbGxlZSAmJlxuICAgICAgICAgICAgIG5vZGUuZXhwcmVzc2lvbi5jYWxsZWUucHJvcGVydHkgJiZcbiAgICAgICAgICAgICBub2RlLmV4cHJlc3Npb24uY2FsbGVlLnByb3BlcnR5Lm5hbWUgKSB7XG4gICAgICAgICAgY29uc3QgY2FsbGVlTmFtZSA9IG5vZGUuZXhwcmVzc2lvbi5jYWxsZWUucHJvcGVydHkubmFtZTtcbiAgICAgICAgICBmb3IgKCBjb25zdCBrZXkgaW4gT0JTRVJWRVJfUkVHSVNUUkFUSU9OUyApIHtcbiAgICAgICAgICAgIGlmICggT0JTRVJWRVJfUkVHSVNUUkFUSU9OUy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgICAgICAgIGlmICggY2FsbGVlTmFtZSA9PT0gT0JTRVJWRVJfUkVHSVNUUkFUSU9OU1sga2V5IF0gKSB7XG4gICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSBmb3VuZCBhbiBvYnNlcnZlciByZWdpc3RyYXRpb24sIHN0YXJ0IGF0IHRoZSByb290IGFuZCBsb29rIHRocm91Z2ggaXRzIHRva2VucyBmb3IgZGlzcG9zZVxuICAgICAgICAgICAgICAgIGxldCBkaXNwb3NlRm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zdCByb290Tm9kZSA9IGNvbnRleHQuZ2V0U291cmNlQ29kZSgpLmFzdDtcbiAgICAgICAgICAgICAgICBpZiAoIHJvb3ROb2RlICYmXG4gICAgICAgICAgICAgICAgICAgICByb290Tm9kZS50b2tlbnMgKSB7XG4gICAgICAgICAgICAgICAgICByb290Tm9kZS50b2tlbnMuZm9yRWFjaCggdG9rZW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHRva2VuICkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICggdG9rZW4udHlwZSA9PT0gJ0lkZW50aWZpZXInICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi52YWx1ZSA9PT0gJ2Rpc3Bvc2UnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSBmb3VuZCBhIGRpc3Bvc2UgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3Bvc2VGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICggIWRpc3Bvc2VGb3VuZCApIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGxvYzogbm9kZS5sb2Muc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdvYnNlcnZlciByZWdpc3RyYXRpb24gbWlzc2luZyBkaXNwb3NlIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLnNjaGVtYSA9IFtcbiAgLy8gSlNPTiBTY2hlbWEgZm9yIHJ1bGUgb3B0aW9ucyBnb2VzIGhlcmVcbl07Il0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJjb250ZXh0IiwiT0JTRVJWRVJfUkVHSVNUUkFUSU9OUyIsIkxJTksiLCJMQVpZX0xJTksiLCJPTiIsIk1VTFRJTElOSyIsIkFERF9MSVNURU5FUiIsIkFERF9FVkVOVF9MSVNURU5FUiIsIkFERF9JTlNUQU5DRSIsIkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJub2RlIiwiZXhwcmVzc2lvbiIsImNhbGxlZSIsInByb3BlcnR5IiwibmFtZSIsImNhbGxlZU5hbWUiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsImRpc3Bvc2VGb3VuZCIsInJvb3ROb2RlIiwiZ2V0U291cmNlQ29kZSIsImFzdCIsInRva2VucyIsImZvckVhY2giLCJ0b2tlbiIsInR5cGUiLCJ2YWx1ZSIsInJlcG9ydCIsImxvYyIsInN0YXJ0IiwibWVzc2FnZSIsInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3REOzs7O0NBSUMsR0FHRCxnRkFBZ0Y7QUFDaEYsa0JBQWtCO0FBQ2xCLGdGQUFnRjtBQUVoRkEsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVEsU0FBVUMsT0FBTztRQUV2Qix5RkFBeUY7UUFDekYsd0VBQXdFO1FBQ3hFLE1BQU1DLHlCQUF5QjtZQUM3QkMsTUFBTTtZQUNOQyxXQUFXO1lBQ1hDLElBQUk7WUFDSkMsV0FBVztZQUNYQyxjQUFjO1lBQ2RDLG9CQUFvQjtZQUNwQkMsY0FBYztRQUNoQjtRQUVBLE9BQU87WUFFTEMscUJBQXFCLFNBQVVDLElBQUk7Z0JBRWpDLDhHQUE4RztnQkFDOUcsSUFBS0EsS0FBS0MsVUFBVSxJQUNmRCxLQUFLQyxVQUFVLENBQUNDLE1BQU0sSUFDdEJGLEtBQUtDLFVBQVUsQ0FBQ0MsTUFBTSxDQUFDQyxRQUFRLElBQy9CSCxLQUFLQyxVQUFVLENBQUNDLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDQyxJQUFJLEVBQUc7b0JBQzFDLE1BQU1DLGFBQWFMLEtBQUtDLFVBQVUsQ0FBQ0MsTUFBTSxDQUFDQyxRQUFRLENBQUNDLElBQUk7b0JBQ3ZELElBQU0sTUFBTUUsT0FBT2YsdUJBQXlCO3dCQUMxQyxJQUFLQSx1QkFBdUJnQixjQUFjLENBQUVELE1BQVE7NEJBQ2xELElBQUtELGVBQWVkLHNCQUFzQixDQUFFZSxJQUFLLEVBQUc7Z0NBQ2xELG9HQUFvRztnQ0FDcEcsSUFBSUUsZUFBZTtnQ0FDbkIsTUFBTUMsV0FBV25CLFFBQVFvQixhQUFhLEdBQUdDLEdBQUc7Z0NBQzVDLElBQUtGLFlBQ0FBLFNBQVNHLE1BQU0sRUFBRztvQ0FDckJILFNBQVNHLE1BQU0sQ0FBQ0MsT0FBTyxDQUFFQyxDQUFBQTt3Q0FDdkIsSUFBS0EsT0FBUTs0Q0FDWCxJQUFLQSxNQUFNQyxJQUFJLEtBQUssZ0JBQ2ZELE1BQU1FLEtBQUssS0FBSyxXQUFZO2dEQUMvQixtQ0FBbUM7Z0RBQ25DUixlQUFlOzRDQUNqQjt3Q0FDRjtvQ0FDRjtnQ0FDRjtnQ0FDQSxJQUFLLENBQUNBLGNBQWU7b0NBQ25CbEIsUUFBUTJCLE1BQU0sQ0FBRTt3Q0FDZGpCLE1BQU1BO3dDQUNOa0IsS0FBS2xCLEtBQUtrQixHQUFHLENBQUNDLEtBQUs7d0NBQ25CQyxTQUFTO29DQUNYO2dDQUNGOzRCQUNGO3dCQUNGO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0Y7QUFFQWpDLE9BQU9DLE9BQU8sQ0FBQ2lDLE1BQU0sR0FBRyxFQUV2QiJ9