// Copyright 2023, University of Colorado Boulder
/**
 * @fileoverview no-view-imported-from-model
 * Fails is you import something from /view/ inside a model file with a path like /model/
 * @copyright 2023 University of Colorado Boulder
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const isModelFileRegex = /[\\/]model[\\/]/;
const isViewFileRegex = /[\\/]view[\\/]/;
const isModelScreenViewFolder = /[\\/]model[\\/]view[\\/]/; // for the rare case where a `model` screen has a `view` folder.
module.exports = {
    create: (context)=>{
        const filename = context.getFilename();
        // select paths like "/model/" without the false positive of "/model/view/" which could happen if the screen was model
        if (isModelFileRegex.test(filename) && !isModelScreenViewFolder.test(filename)) {
            return {
                ImportDeclaration: (node)=>{
                    const importValue = node.source.value;
                    // If the import has /view/ in it.
                    if (isViewFileRegex.test(importValue)) {
                        // Some special cases that are too common for PhET to care about this failure for.
                        if (node.importKind !== 'type' && // importing types is not as bad
                        !importValue.endsWith('Colors.js') && // Colors files are auto generated and in the view
                        !importValue.endsWith('ModelViewTransform2.js')) {
                            context.report({
                                node: node,
                                loc: node.loc,
                                message: `model import statement should not import the view: ${importValue.replace('/..', '')}`
                            });
                        }
                    }
                }
            };
        }
        return {};
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9uby12aWV3LWltcG9ydGVkLWZyb20tbW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgbm8tdmlldy1pbXBvcnRlZC1mcm9tLW1vZGVsXG4gKiBGYWlscyBpcyB5b3UgaW1wb3J0IHNvbWV0aGluZyBmcm9tIC92aWV3LyBpbnNpZGUgYSBtb2RlbCBmaWxlIHdpdGggYSBwYXRoIGxpa2UgL21vZGVsL1xuICogQGNvcHlyaWdodCAyMDIzIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGlzTW9kZWxGaWxlUmVnZXggPSAvW1xcXFwvXW1vZGVsW1xcXFwvXS87XG5jb25zdCBpc1ZpZXdGaWxlUmVnZXggPSAvW1xcXFwvXXZpZXdbXFxcXC9dLztcbmNvbnN0IGlzTW9kZWxTY3JlZW5WaWV3Rm9sZGVyID0gL1tcXFxcL11tb2RlbFtcXFxcL112aWV3W1xcXFwvXS87IC8vIGZvciB0aGUgcmFyZSBjYXNlIHdoZXJlIGEgYG1vZGVsYCBzY3JlZW4gaGFzIGEgYHZpZXdgIGZvbGRlci5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogY29udGV4dCA9PiB7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBjb250ZXh0LmdldEZpbGVuYW1lKCk7XG5cbiAgICAvLyBzZWxlY3QgcGF0aHMgbGlrZSBcIi9tb2RlbC9cIiB3aXRob3V0IHRoZSBmYWxzZSBwb3NpdGl2ZSBvZiBcIi9tb2RlbC92aWV3L1wiIHdoaWNoIGNvdWxkIGhhcHBlbiBpZiB0aGUgc2NyZWVuIHdhcyBtb2RlbFxuICAgIGlmICggaXNNb2RlbEZpbGVSZWdleC50ZXN0KCBmaWxlbmFtZSApICYmICFpc01vZGVsU2NyZWVuVmlld0ZvbGRlci50ZXN0KCBmaWxlbmFtZSApICkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgSW1wb3J0RGVjbGFyYXRpb246IG5vZGUgPT4ge1xuICAgICAgICAgIGNvbnN0IGltcG9ydFZhbHVlID0gbm9kZS5zb3VyY2UudmFsdWU7XG5cbiAgICAgICAgICAvLyBJZiB0aGUgaW1wb3J0IGhhcyAvdmlldy8gaW4gaXQuXG4gICAgICAgICAgaWYgKCBpc1ZpZXdGaWxlUmVnZXgudGVzdCggaW1wb3J0VmFsdWUgKSApIHtcblxuICAgICAgICAgICAgLy8gU29tZSBzcGVjaWFsIGNhc2VzIHRoYXQgYXJlIHRvbyBjb21tb24gZm9yIFBoRVQgdG8gY2FyZSBhYm91dCB0aGlzIGZhaWx1cmUgZm9yLlxuICAgICAgICAgICAgaWYgKCBub2RlLmltcG9ydEtpbmQgIT09ICd0eXBlJyAmJiAvLyBpbXBvcnRpbmcgdHlwZXMgaXMgbm90IGFzIGJhZFxuICAgICAgICAgICAgICAgICAhaW1wb3J0VmFsdWUuZW5kc1dpdGgoICdDb2xvcnMuanMnICkgJiYgLy8gQ29sb3JzIGZpbGVzIGFyZSBhdXRvIGdlbmVyYXRlZCBhbmQgaW4gdGhlIHZpZXdcbiAgICAgICAgICAgICAgICAgIWltcG9ydFZhbHVlLmVuZHNXaXRoKCAnTW9kZWxWaWV3VHJhbnNmb3JtMi5qcycgKSApIHsgLy8gRW5vdWdoIGNhc2VzIHRvIHdhcnJhbnQgdGFraW5nIGl0IG91dCBoZXJlLlxuICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgbG9jOiBub2RlLmxvYyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgbW9kZWwgaW1wb3J0IHN0YXRlbWVudCBzaG91bGQgbm90IGltcG9ydCB0aGUgdmlldzogJHtpbXBvcnRWYWx1ZS5yZXBsYWNlKCAnLy4uJywgJycgKX1gXG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7fTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsiaXNNb2RlbEZpbGVSZWdleCIsImlzVmlld0ZpbGVSZWdleCIsImlzTW9kZWxTY3JlZW5WaWV3Rm9sZGVyIiwibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJmaWxlbmFtZSIsImdldEZpbGVuYW1lIiwidGVzdCIsIkltcG9ydERlY2xhcmF0aW9uIiwibm9kZSIsImltcG9ydFZhbHVlIiwic291cmNlIiwidmFsdWUiLCJpbXBvcnRLaW5kIiwiZW5kc1dpdGgiLCJyZXBvcnQiLCJsb2MiLCJtZXNzYWdlIiwicmVwbGFjZSIsInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7OztDQUtDLEdBRUQsZ0ZBQWdGO0FBQ2hGLGtCQUFrQjtBQUNsQixnRkFBZ0Y7QUFFaEYsTUFBTUEsbUJBQW1CO0FBQ3pCLE1BQU1DLGtCQUFrQjtBQUN4QixNQUFNQywwQkFBMEIsNEJBQTRCLGdFQUFnRTtBQUU1SEMsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVFDLENBQUFBO1FBQ04sTUFBTUMsV0FBV0QsUUFBUUUsV0FBVztRQUVwQyxzSEFBc0g7UUFDdEgsSUFBS1IsaUJBQWlCUyxJQUFJLENBQUVGLGFBQWMsQ0FBQ0wsd0JBQXdCTyxJQUFJLENBQUVGLFdBQWE7WUFDcEYsT0FBTztnQkFDTEcsbUJBQW1CQyxDQUFBQTtvQkFDakIsTUFBTUMsY0FBY0QsS0FBS0UsTUFBTSxDQUFDQyxLQUFLO29CQUVyQyxrQ0FBa0M7b0JBQ2xDLElBQUtiLGdCQUFnQlEsSUFBSSxDQUFFRyxjQUFnQjt3QkFFekMsa0ZBQWtGO3dCQUNsRixJQUFLRCxLQUFLSSxVQUFVLEtBQUssVUFBVSxnQ0FBZ0M7d0JBQzlELENBQUNILFlBQVlJLFFBQVEsQ0FBRSxnQkFBaUIsa0RBQWtEO3dCQUMxRixDQUFDSixZQUFZSSxRQUFRLENBQUUsMkJBQTZCOzRCQUN2RFYsUUFBUVcsTUFBTSxDQUFFO2dDQUNkTixNQUFNQTtnQ0FDTk8sS0FBS1AsS0FBS08sR0FBRztnQ0FDYkMsU0FBUyxDQUFDLG1EQUFtRCxFQUFFUCxZQUFZUSxPQUFPLENBQUUsT0FBTyxLQUFNOzRCQUNuRzt3QkFDRjtvQkFDRjtnQkFDRjtZQUNGO1FBQ0Y7UUFDQSxPQUFPLENBQUM7SUFDVjtBQUNGO0FBRUFqQixPQUFPQyxPQUFPLENBQUNpQixNQUFNLEdBQUcsRUFFdkIifQ==