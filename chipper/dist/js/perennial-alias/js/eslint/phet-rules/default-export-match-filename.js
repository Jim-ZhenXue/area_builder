// Copyright 2023, University of Colorado Boulder
/**
 * Lint rule to detect when an exported class name does not match its file name.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ module.exports = {
    create: (context)=>{
        return {
            ExportDefaultDeclaration: (node)=>{
                if (node.declaration && node.declaration.id && node.declaration.id.name) {
                    // Get the class name from the export default declaration
                    const exportName = node.declaration.id.name;
                    // Get the filename without extension
                    const filename = context.getFilename().replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '');
                    // Check if the exported class or function name and filename match
                    if (exportName !== filename) {
                        context.report({
                            node: node,
                            message: `The default exported member "${exportName}" does not match the filename "${filename}". They should be identical.`
                        });
                    }
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9kZWZhdWx0LWV4cG9ydC1tYXRjaC1maWxlbmFtZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTGludCBydWxlIHRvIGRldGVjdCB3aGVuIGFuIGV4cG9ydGVkIGNsYXNzIG5hbWUgZG9lcyBub3QgbWF0Y2ggaXRzIGZpbGUgbmFtZS5cbiAqXG4gKiBAYXV0aG9yIE1hcmxhIFNjaHVseiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogY29udGV4dCA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIEV4cG9ydERlZmF1bHREZWNsYXJhdGlvbjogbm9kZSA9PiB7XG5cbiAgICAgICAgaWYgKCBub2RlLmRlY2xhcmF0aW9uICYmIG5vZGUuZGVjbGFyYXRpb24uaWQgJiYgbm9kZS5kZWNsYXJhdGlvbi5pZC5uYW1lICkge1xuICAgICAgICAgIC8vIEdldCB0aGUgY2xhc3MgbmFtZSBmcm9tIHRoZSBleHBvcnQgZGVmYXVsdCBkZWNsYXJhdGlvblxuICAgICAgICAgIGNvbnN0IGV4cG9ydE5hbWUgPSBub2RlLmRlY2xhcmF0aW9uLmlkLm5hbWU7XG5cbiAgICAgICAgICAvLyBHZXQgdGhlIGZpbGVuYW1lIHdpdGhvdXQgZXh0ZW5zaW9uXG4gICAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBjb250ZXh0LmdldEZpbGVuYW1lKCkucmVwbGFjZSggL14uKltcXFxcL10vLCAnJyApLnJlcGxhY2UoIC9cXC5bXi8uXSskLywgJycgKTtcblxuICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBleHBvcnRlZCBjbGFzcyBvciBmdW5jdGlvbiBuYW1lIGFuZCBmaWxlbmFtZSBtYXRjaFxuICAgICAgICAgIGlmICggZXhwb3J0TmFtZSAhPT0gZmlsZW5hbWUgKSB7XG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgICBtZXNzYWdlOiBgVGhlIGRlZmF1bHQgZXhwb3J0ZWQgbWVtYmVyIFwiJHtleHBvcnROYW1lfVwiIGRvZXMgbm90IG1hdGNoIHRoZSBmaWxlbmFtZSBcIiR7ZmlsZW5hbWV9XCIuIFRoZXkgc2hvdWxkIGJlIGlkZW50aWNhbC5gXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTsiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24iLCJub2RlIiwiZGVjbGFyYXRpb24iLCJpZCIsIm5hbWUiLCJleHBvcnROYW1lIiwiZmlsZW5hbWUiLCJnZXRGaWxlbmFtZSIsInJlcGxhY2UiLCJyZXBvcnQiLCJtZXNzYWdlIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7O0NBS0MsR0FFREEsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVFDLENBQUFBO1FBQ04sT0FBTztZQUNMQywwQkFBMEJDLENBQUFBO2dCQUV4QixJQUFLQSxLQUFLQyxXQUFXLElBQUlELEtBQUtDLFdBQVcsQ0FBQ0MsRUFBRSxJQUFJRixLQUFLQyxXQUFXLENBQUNDLEVBQUUsQ0FBQ0MsSUFBSSxFQUFHO29CQUN6RSx5REFBeUQ7b0JBQ3pELE1BQU1DLGFBQWFKLEtBQUtDLFdBQVcsQ0FBQ0MsRUFBRSxDQUFDQyxJQUFJO29CQUUzQyxxQ0FBcUM7b0JBQ3JDLE1BQU1FLFdBQVdQLFFBQVFRLFdBQVcsR0FBR0MsT0FBTyxDQUFFLFlBQVksSUFBS0EsT0FBTyxDQUFFLGFBQWE7b0JBRXZGLGtFQUFrRTtvQkFDbEUsSUFBS0gsZUFBZUMsVUFBVzt3QkFDN0JQLFFBQVFVLE1BQU0sQ0FBRTs0QkFDZFIsTUFBTUE7NEJBQ05TLFNBQVMsQ0FBQyw2QkFBNkIsRUFBRUwsV0FBVywrQkFBK0IsRUFBRUMsU0FBUyw0QkFBNEIsQ0FBQzt3QkFDN0g7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRiJ9