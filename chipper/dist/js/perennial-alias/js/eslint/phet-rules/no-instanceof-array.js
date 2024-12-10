// Copyright 2002-2015, University of Colorado Boulder
/**
 * @fileoverview Rule to guarantee we do not use instanceof Array
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @copyright 2018 University of Colorado Boulder
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
    create: function(context) {
        return {
            BinaryExpression: function(node) {
                if (node.operator === 'instanceof' && node.right.type === 'Identifier' && node.right.name === 'Array') {
                    context.report({
                        node: node,
                        message: 'Use Array.isArray() instead of instanceof Array',
                        data: {
                            identifier: node.name
                        }
                    });
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9uby1pbnN0YW5jZW9mLWFycmF5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDAyLTIwMTUsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gZ3VhcmFudGVlIHdlIGRvIG5vdCB1c2UgaW5zdGFuY2VvZiBBcnJheVxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAY29weXJpZ2h0IDIwMTggVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4gKi9cblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcblxuICAgIHJldHVybiB7XG4gICAgICBCaW5hcnlFeHByZXNzaW9uOiBmdW5jdGlvbiggbm9kZSApIHtcbiAgICAgICAgaWYgKCBub2RlLm9wZXJhdG9yID09PSAnaW5zdGFuY2VvZicgJiYgbm9kZS5yaWdodC50eXBlID09PSAnSWRlbnRpZmllcicgJiYgbm9kZS5yaWdodC5uYW1lID09PSAnQXJyYXknICkge1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1VzZSBBcnJheS5pc0FycmF5KCkgaW5zdGVhZCBvZiBpbnN0YW5jZW9mIEFycmF5JyxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgaWRlbnRpZmllcjogbm9kZS5uYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJCaW5hcnlFeHByZXNzaW9uIiwibm9kZSIsIm9wZXJhdG9yIiwicmlnaHQiLCJ0eXBlIiwibmFtZSIsInJlcG9ydCIsIm1lc3NhZ2UiLCJkYXRhIiwiaWRlbnRpZmllciIsInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3REOzs7O0NBSUMsR0FHRCxnRkFBZ0Y7QUFDaEYsa0JBQWtCO0FBQ2xCLGdGQUFnRjtBQUVoRkEsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVEsU0FBVUMsT0FBTztRQUV2QixPQUFPO1lBQ0xDLGtCQUFrQixTQUFVQyxJQUFJO2dCQUM5QixJQUFLQSxLQUFLQyxRQUFRLEtBQUssZ0JBQWdCRCxLQUFLRSxLQUFLLENBQUNDLElBQUksS0FBSyxnQkFBZ0JILEtBQUtFLEtBQUssQ0FBQ0UsSUFBSSxLQUFLLFNBQVU7b0JBQ3ZHTixRQUFRTyxNQUFNLENBQUU7d0JBQ2RMLE1BQU1BO3dCQUNOTSxTQUFTO3dCQUNUQyxNQUFNOzRCQUNKQyxZQUFZUixLQUFLSSxJQUFJO3dCQUN2QjtvQkFDRjtnQkFDRjtZQUNGO1FBQ0Y7SUFDRjtBQUNGO0FBRUFULE9BQU9DLE9BQU8sQ0FBQ2EsTUFBTSxHQUFHLEVBRXZCIn0=