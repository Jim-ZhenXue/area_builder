// Copyright 2022, University of Colorado Boulder
/**
 * Class properties that are static and use uppercase syntax should be readonly, like:
 *
 * class MyClass{
 *   public static readonly MY_STATIC = 4;
 * }
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @copyright 2022 University of Colorado Boulder
 */ module.exports = {
    create: function(context) {
        return {
            PropertyDefinition: (node)=>{
                if (node.key.name && node.key.name === node.key.name.toUpperCase() && node.static && !node.readonly) {
                    context.report({
                        node: node,
                        loc: node.loc,
                        message: `Uppercase static field ${node.key.name} should be readonly`
                    });
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBDbGFzcyBwcm9wZXJ0aWVzIHRoYXQgYXJlIHN0YXRpYyBhbmQgdXNlIHVwcGVyY2FzZSBzeW50YXggc2hvdWxkIGJlIHJlYWRvbmx5LCBsaWtlOlxuICpcbiAqIGNsYXNzIE15Q2xhc3N7XG4gKiAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTVlfU1RBVElDID0gNDtcbiAqIH1cbiAqXG4gKiBAYXV0aG9yIEFndXN0w61uIFZhbGxlam8gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAY29weXJpZ2h0IDIwMjIgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24oIGNvbnRleHQgKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICBQcm9wZXJ0eURlZmluaXRpb246IG5vZGUgPT4ge1xuICAgICAgICBpZiAoIG5vZGUua2V5Lm5hbWUgJiYgbm9kZS5rZXkubmFtZSA9PT0gbm9kZS5rZXkubmFtZS50b1VwcGVyQ2FzZSgpICYmIG5vZGUuc3RhdGljICYmICFub2RlLnJlYWRvbmx5ICkge1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgbG9jOiBub2RlLmxvYyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBVcHBlcmNhc2Ugc3RhdGljIGZpZWxkICR7bm9kZS5rZXkubmFtZX0gc2hvdWxkIGJlIHJlYWRvbmx5YFxuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn07Il0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJjb250ZXh0IiwiUHJvcGVydHlEZWZpbml0aW9uIiwibm9kZSIsImtleSIsIm5hbWUiLCJ0b1VwcGVyQ2FzZSIsInN0YXRpYyIsInJlYWRvbmx5IiwicmVwb3J0IiwibG9jIiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pEOzs7Ozs7Ozs7O0NBVUMsR0FFREEsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVEsU0FBVUMsT0FBTztRQUV2QixPQUFPO1lBRUxDLG9CQUFvQkMsQ0FBQUE7Z0JBQ2xCLElBQUtBLEtBQUtDLEdBQUcsQ0FBQ0MsSUFBSSxJQUFJRixLQUFLQyxHQUFHLENBQUNDLElBQUksS0FBS0YsS0FBS0MsR0FBRyxDQUFDQyxJQUFJLENBQUNDLFdBQVcsTUFBTUgsS0FBS0ksTUFBTSxJQUFJLENBQUNKLEtBQUtLLFFBQVEsRUFBRztvQkFDckdQLFFBQVFRLE1BQU0sQ0FBRTt3QkFDZE4sTUFBTUE7d0JBQ05PLEtBQUtQLEtBQUtPLEdBQUc7d0JBQ2JDLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRVIsS0FBS0MsR0FBRyxDQUFDQyxJQUFJLENBQUMsbUJBQW1CLENBQUM7b0JBQ3ZFO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0YifQ==