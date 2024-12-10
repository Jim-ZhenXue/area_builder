// Copyright 2019-2022, University of Colorado Boulder
/**
 * Lint detector for invalid text, where repo-specific text can be identified. We were unable to find a way to combine
 * this with phet/bad-sim-text, so we just left it separate. Only supports string literals (not predicates or regex).
 *
 *  @author Sam Reid (PhET Interactive Simulations)
 */ // Sample usage:
// "rules": {
//   "phet/additional-bad-text": [
//     "error",
//     {
//       "forbiddenTextObjects": [
//         "dispose"
//       ]
//     }
//   ]
// }
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Lint detector for invalid text.'
        },
        schema: [
            {
                type: 'object',
                properties: {
                    forbiddenTextObjects: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                }
            }
        ]
    },
    create: function(context) {
        const getBadTextTester = require('./getBadTextTester');
        const options = context.options[0];
        return {
            Program: getBadTextTester('bad-sim-text', options.forbiddenTextObjects, context)
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9hZGRpdGlvbmFsLWJhZC10ZXh0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIExpbnQgZGV0ZWN0b3IgZm9yIGludmFsaWQgdGV4dCwgd2hlcmUgcmVwby1zcGVjaWZpYyB0ZXh0IGNhbiBiZSBpZGVudGlmaWVkLiBXZSB3ZXJlIHVuYWJsZSB0byBmaW5kIGEgd2F5IHRvIGNvbWJpbmVcbiAqIHRoaXMgd2l0aCBwaGV0L2JhZC1zaW0tdGV4dCwgc28gd2UganVzdCBsZWZ0IGl0IHNlcGFyYXRlLiBPbmx5IHN1cHBvcnRzIHN0cmluZyBsaXRlcmFscyAobm90IHByZWRpY2F0ZXMgb3IgcmVnZXgpLlxuICpcbiAqICBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG4vLyBTYW1wbGUgdXNhZ2U6XG4vLyBcInJ1bGVzXCI6IHtcbi8vICAgXCJwaGV0L2FkZGl0aW9uYWwtYmFkLXRleHRcIjogW1xuLy8gICAgIFwiZXJyb3JcIixcbi8vICAgICB7XG4vLyAgICAgICBcImZvcmJpZGRlblRleHRPYmplY3RzXCI6IFtcbi8vICAgICAgICAgXCJkaXNwb3NlXCJcbi8vICAgICAgIF1cbi8vICAgICB9XG4vLyAgIF1cbi8vIH1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgZG9jczoge1xuICAgICAgZGVzY3JpcHRpb246ICdMaW50IGRldGVjdG9yIGZvciBpbnZhbGlkIHRleHQuJ1xuICAgIH0sXG4gICAgc2NoZW1hOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZm9yYmlkZGVuVGV4dE9iamVjdHM6IHtcbiAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcbiAgICBjb25zdCBnZXRCYWRUZXh0VGVzdGVyID0gcmVxdWlyZSggJy4vZ2V0QmFkVGV4dFRlc3RlcicgKTtcbiAgICBjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWyAwIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgUHJvZ3JhbTogZ2V0QmFkVGV4dFRlc3RlciggJ2JhZC1zaW0tdGV4dCcsIG9wdGlvbnMuZm9yYmlkZGVuVGV4dE9iamVjdHMsIGNvbnRleHQgKVxuICAgIH07XG4gIH1cbn07Il0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJkZXNjcmlwdGlvbiIsInNjaGVtYSIsInByb3BlcnRpZXMiLCJmb3JiaWRkZW5UZXh0T2JqZWN0cyIsIml0ZW1zIiwiY3JlYXRlIiwiY29udGV4dCIsImdldEJhZFRleHRUZXN0ZXIiLCJyZXF1aXJlIiwib3B0aW9ucyIsIlByb2dyYW0iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUNELGdCQUFnQjtBQUNoQixhQUFhO0FBQ2Isa0NBQWtDO0FBQ2xDLGVBQWU7QUFDZixRQUFRO0FBQ1Isa0NBQWtDO0FBQ2xDLG9CQUFvQjtBQUNwQixVQUFVO0FBQ1YsUUFBUTtBQUNSLE1BQU07QUFDTixJQUFJO0FBRUpBLE9BQU9DLE9BQU8sR0FBRztJQUNmQyxNQUFNO1FBQ0pDLE1BQU07UUFDTkMsTUFBTTtZQUNKQyxhQUFhO1FBQ2Y7UUFDQUMsUUFBUTtZQUNOO2dCQUNFSCxNQUFNO2dCQUNOSSxZQUFZO29CQUNWQyxzQkFBc0I7d0JBQ3BCTCxNQUFNO3dCQUNOTSxPQUFPOzRCQUNMTixNQUFNO3dCQUNSO29CQUNGO2dCQUNGO1lBQ0Y7U0FDRDtJQUNIO0lBQ0FPLFFBQVEsU0FBVUMsT0FBTztRQUN2QixNQUFNQyxtQkFBbUJDLFFBQVM7UUFDbEMsTUFBTUMsVUFBVUgsUUFBUUcsT0FBTyxDQUFFLEVBQUc7UUFFcEMsT0FBTztZQUNMQyxTQUFTSCxpQkFBa0IsZ0JBQWdCRSxRQUFRTixvQkFBb0IsRUFBRUc7UUFDM0U7SUFDRjtBQUNGIn0=