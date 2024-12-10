// Copyright 2023, University of Colorado Boulder
/**
 * @author Sam Reid (PhET Interactive Simulations)
 */ module.exports = {
    create (context) {
        return {
            TSTypeReference (node) {
                const higherOrderTypes = [
                    // PhET types
                    'OptionalKeys',
                    'PickOptional',
                    'PickRequired',
                    'RequiredOption',
                    'RequiredOption',
                    'StrictOmit',
                    'WithOptional',
                    'WithRequired',
                    // Built-in TS Types
                    'Pick',
                    'Optional',
                    'Partial',
                    'Omit',
                    'Exclude',
                    'Extract'
                ];
                if (node.typeName && higherOrderTypes.includes(node.typeName.name)) {
                    const args = node.typeArguments.params;
                    if (args.some((arg)=>arg.type === 'TSTypeReference' && arg.typeName.name === 'PhetioObject')) {
                        context.report({
                            node: node,
                            message: `Do not use PhetioObject in ${node.typeName.name}. Use PhetioObjectOptions instead.`
                        });
                    }
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9waGV0LWlvLW9iamVjdC1vcHRpb25zLXNob3VsZC1ub3QtcGljay1mcm9tLXBoZXQtaW8tb2JqZWN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGUoIGNvbnRleHQgKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFRTVHlwZVJlZmVyZW5jZSggbm9kZSApIHtcbiAgICAgICAgY29uc3QgaGlnaGVyT3JkZXJUeXBlcyA9IFtcblxuICAgICAgICAgIC8vIFBoRVQgdHlwZXNcbiAgICAgICAgICAnT3B0aW9uYWxLZXlzJywgJ1BpY2tPcHRpb25hbCcsICdQaWNrUmVxdWlyZWQnLCAnUmVxdWlyZWRPcHRpb24nLCAnUmVxdWlyZWRPcHRpb24nLCAnU3RyaWN0T21pdCcsICdXaXRoT3B0aW9uYWwnLCAnV2l0aFJlcXVpcmVkJyxcblxuICAgICAgICAgIC8vIEJ1aWx0LWluIFRTIFR5cGVzXG4gICAgICAgICAgJ1BpY2snLCAnT3B0aW9uYWwnLCAnUGFydGlhbCcsICdPbWl0JywgJ0V4Y2x1ZGUnLCAnRXh0cmFjdCdcbiAgICAgICAgXTtcbiAgICAgICAgaWYgKCBub2RlLnR5cGVOYW1lICYmIGhpZ2hlck9yZGVyVHlwZXMuaW5jbHVkZXMoIG5vZGUudHlwZU5hbWUubmFtZSApICkge1xuICAgICAgICAgIGNvbnN0IGFyZ3MgPSBub2RlLnR5cGVBcmd1bWVudHMucGFyYW1zO1xuICAgICAgICAgIGlmICggYXJncy5zb21lKCBhcmcgPT4gYXJnLnR5cGUgPT09ICdUU1R5cGVSZWZlcmVuY2UnICYmIGFyZy50eXBlTmFtZS5uYW1lID09PSAnUGhldGlvT2JqZWN0JyApICkge1xuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoIHtcbiAgICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgICAgbWVzc2FnZTogYERvIG5vdCB1c2UgUGhldGlvT2JqZWN0IGluICR7bm9kZS50eXBlTmFtZS5uYW1lfS4gVXNlIFBoZXRpb09iamVjdE9wdGlvbnMgaW5zdGVhZC5gXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTsiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJUU1R5cGVSZWZlcmVuY2UiLCJub2RlIiwiaGlnaGVyT3JkZXJUeXBlcyIsInR5cGVOYW1lIiwiaW5jbHVkZXMiLCJuYW1lIiwiYXJncyIsInR5cGVBcmd1bWVudHMiLCJwYXJhbXMiLCJzb21lIiwiYXJnIiwidHlwZSIsInJlcG9ydCIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Q0FFQyxHQUVEQSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUUMsT0FBTztRQUNiLE9BQU87WUFDTEMsaUJBQWlCQyxJQUFJO2dCQUNuQixNQUFNQyxtQkFBbUI7b0JBRXZCLGFBQWE7b0JBQ2I7b0JBQWdCO29CQUFnQjtvQkFBZ0I7b0JBQWtCO29CQUFrQjtvQkFBYztvQkFBZ0I7b0JBRWxILG9CQUFvQjtvQkFDcEI7b0JBQVE7b0JBQVk7b0JBQVc7b0JBQVE7b0JBQVc7aUJBQ25EO2dCQUNELElBQUtELEtBQUtFLFFBQVEsSUFBSUQsaUJBQWlCRSxRQUFRLENBQUVILEtBQUtFLFFBQVEsQ0FBQ0UsSUFBSSxHQUFLO29CQUN0RSxNQUFNQyxPQUFPTCxLQUFLTSxhQUFhLENBQUNDLE1BQU07b0JBQ3RDLElBQUtGLEtBQUtHLElBQUksQ0FBRUMsQ0FBQUEsTUFBT0EsSUFBSUMsSUFBSSxLQUFLLHFCQUFxQkQsSUFBSVAsUUFBUSxDQUFDRSxJQUFJLEtBQUssaUJBQW1CO3dCQUNoR04sUUFBUWEsTUFBTSxDQUFFOzRCQUNkWCxNQUFNQTs0QkFDTlksU0FBUyxDQUFDLDJCQUEyQixFQUFFWixLQUFLRSxRQUFRLENBQUNFLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQzt3QkFDL0Y7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRiJ9