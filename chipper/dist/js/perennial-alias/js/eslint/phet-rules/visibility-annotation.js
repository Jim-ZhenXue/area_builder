// Copyright 2020, University of Colorado Boulder
/**
 * @fileoverview Rule to check for missing visibility annotations on method definitions.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @copyright 2020 University of Colorado Boulder
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
    create: function(context) {
        const annotations = [
            '@private',
            '@public',
            '@protected'
        ];
        // these are still MethodDefinition nodes, but don't require an annotation
        const exemptMethods = [
            'get',
            'set',
            'constructor'
        ];
        // documentation-based annotations are not required in TypeScript files.
        const filenameLowerCase = context.getFilename().toLowerCase();
        const isTypeScriptFile = filenameLowerCase.endsWith('.ts') || filenameLowerCase.endsWith('.tsx');
        return {
            MethodDefinition: (node)=>{
                if (!exemptMethods.includes(node.kind) && !isTypeScriptFile) {
                    let includesAnnotation = false;
                    const commentsBefore = context.getSourceCode().getCommentsBefore(node);
                    // OK as long as any comment above the method (block or line) has an annotation
                    for(let i = 0; i < commentsBefore.length; i++){
                        if (annotations.some((annotation)=>commentsBefore[i].value.includes(annotation))) {
                            includesAnnotation = true;
                            break;
                        }
                    }
                    if (!includesAnnotation) {
                        context.report({
                            node: node,
                            loc: node.loc,
                            message: `${node.key.name}: Missing visibility annotation.`
                        });
                    }
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy92aXNpYmlsaXR5LWFubm90YXRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gY2hlY2sgZm9yIG1pc3NpbmcgdmlzaWJpbGl0eSBhbm5vdGF0aW9ucyBvbiBtZXRob2QgZGVmaW5pdGlvbnMuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAY29weXJpZ2h0IDIwMjAgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4gKi9cblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcbiAgICBjb25zdCBhbm5vdGF0aW9ucyA9IFsgJ0Bwcml2YXRlJywgJ0BwdWJsaWMnLCAnQHByb3RlY3RlZCcgXTtcblxuICAgIC8vIHRoZXNlIGFyZSBzdGlsbCBNZXRob2REZWZpbml0aW9uIG5vZGVzLCBidXQgZG9uJ3QgcmVxdWlyZSBhbiBhbm5vdGF0aW9uXG4gICAgY29uc3QgZXhlbXB0TWV0aG9kcyA9IFsgJ2dldCcsICdzZXQnLCAnY29uc3RydWN0b3InIF07XG5cbiAgICAvLyBkb2N1bWVudGF0aW9uLWJhc2VkIGFubm90YXRpb25zIGFyZSBub3QgcmVxdWlyZWQgaW4gVHlwZVNjcmlwdCBmaWxlcy5cbiAgICBjb25zdCBmaWxlbmFtZUxvd2VyQ2FzZSA9IGNvbnRleHQuZ2V0RmlsZW5hbWUoKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IGlzVHlwZVNjcmlwdEZpbGUgPSBmaWxlbmFtZUxvd2VyQ2FzZS5lbmRzV2l0aCggJy50cycgKSB8fCBmaWxlbmFtZUxvd2VyQ2FzZS5lbmRzV2l0aCggJy50c3gnICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgTWV0aG9kRGVmaW5pdGlvbjogbm9kZSA9PiB7XG4gICAgICAgIGlmICggIWV4ZW1wdE1ldGhvZHMuaW5jbHVkZXMoIG5vZGUua2luZCApICYmICFpc1R5cGVTY3JpcHRGaWxlICkge1xuICAgICAgICAgIGxldCBpbmNsdWRlc0Fubm90YXRpb24gPSBmYWxzZTtcbiAgICAgICAgICBjb25zdCBjb21tZW50c0JlZm9yZSA9IGNvbnRleHQuZ2V0U291cmNlQ29kZSgpLmdldENvbW1lbnRzQmVmb3JlKCBub2RlICk7XG5cbiAgICAgICAgICAvLyBPSyBhcyBsb25nIGFzIGFueSBjb21tZW50IGFib3ZlIHRoZSBtZXRob2QgKGJsb2NrIG9yIGxpbmUpIGhhcyBhbiBhbm5vdGF0aW9uXG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29tbWVudHNCZWZvcmUubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBpZiAoIGFubm90YXRpb25zLnNvbWUoIGFubm90YXRpb24gPT4gY29tbWVudHNCZWZvcmVbIGkgXS52YWx1ZS5pbmNsdWRlcyggYW5ub3RhdGlvbiApICkgKSB7XG4gICAgICAgICAgICAgIGluY2x1ZGVzQW5ub3RhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoICFpbmNsdWRlc0Fubm90YXRpb24gKSB7XG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgICBsb2M6IG5vZGUubG9jLFxuICAgICAgICAgICAgICBtZXNzYWdlOiBgJHtub2RlLmtleS5uYW1lfTogTWlzc2luZyB2aXNpYmlsaXR5IGFubm90YXRpb24uYFxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLnNjaGVtYSA9IFtcbiAgLy8gSlNPTiBTY2hlbWEgZm9yIHJ1bGUgb3B0aW9ucyBnb2VzIGhlcmVcbl07Il0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJjb250ZXh0IiwiYW5ub3RhdGlvbnMiLCJleGVtcHRNZXRob2RzIiwiZmlsZW5hbWVMb3dlckNhc2UiLCJnZXRGaWxlbmFtZSIsInRvTG93ZXJDYXNlIiwiaXNUeXBlU2NyaXB0RmlsZSIsImVuZHNXaXRoIiwiTWV0aG9kRGVmaW5pdGlvbiIsIm5vZGUiLCJpbmNsdWRlcyIsImtpbmQiLCJpbmNsdWRlc0Fubm90YXRpb24iLCJjb21tZW50c0JlZm9yZSIsImdldFNvdXJjZUNvZGUiLCJnZXRDb21tZW50c0JlZm9yZSIsImkiLCJsZW5ndGgiLCJzb21lIiwiYW5ub3RhdGlvbiIsInZhbHVlIiwicmVwb3J0IiwibG9jIiwibWVzc2FnZSIsImtleSIsIm5hbWUiLCJzY2hlbWEiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRDs7Ozs7Q0FLQyxHQUdELGdGQUFnRjtBQUNoRixrQkFBa0I7QUFDbEIsZ0ZBQWdGO0FBRWhGQSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUSxTQUFVQyxPQUFPO1FBQ3ZCLE1BQU1DLGNBQWM7WUFBRTtZQUFZO1lBQVc7U0FBYztRQUUzRCwwRUFBMEU7UUFDMUUsTUFBTUMsZ0JBQWdCO1lBQUU7WUFBTztZQUFPO1NBQWU7UUFFckQsd0VBQXdFO1FBQ3hFLE1BQU1DLG9CQUFvQkgsUUFBUUksV0FBVyxHQUFHQyxXQUFXO1FBQzNELE1BQU1DLG1CQUFtQkgsa0JBQWtCSSxRQUFRLENBQUUsVUFBV0osa0JBQWtCSSxRQUFRLENBQUU7UUFFNUYsT0FBTztZQUNMQyxrQkFBa0JDLENBQUFBO2dCQUNoQixJQUFLLENBQUNQLGNBQWNRLFFBQVEsQ0FBRUQsS0FBS0UsSUFBSSxLQUFNLENBQUNMLGtCQUFtQjtvQkFDL0QsSUFBSU0scUJBQXFCO29CQUN6QixNQUFNQyxpQkFBaUJiLFFBQVFjLGFBQWEsR0FBR0MsaUJBQWlCLENBQUVOO29CQUVsRSwrRUFBK0U7b0JBQy9FLElBQU0sSUFBSU8sSUFBSSxHQUFHQSxJQUFJSCxlQUFlSSxNQUFNLEVBQUVELElBQU07d0JBQ2hELElBQUtmLFlBQVlpQixJQUFJLENBQUVDLENBQUFBLGFBQWNOLGNBQWMsQ0FBRUcsRUFBRyxDQUFDSSxLQUFLLENBQUNWLFFBQVEsQ0FBRVMsY0FBaUI7NEJBQ3hGUCxxQkFBcUI7NEJBQ3JCO3dCQUNGO29CQUNGO29CQUNBLElBQUssQ0FBQ0Esb0JBQXFCO3dCQUN6QlosUUFBUXFCLE1BQU0sQ0FBRTs0QkFDZFosTUFBTUE7NEJBQ05hLEtBQUtiLEtBQUthLEdBQUc7NEJBQ2JDLFNBQVMsR0FBR2QsS0FBS2UsR0FBRyxDQUFDQyxJQUFJLENBQUMsZ0NBQWdDLENBQUM7d0JBQzdEO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0Y7QUFFQTVCLE9BQU9DLE9BQU8sQ0FBQzRCLE1BQU0sR0FBRyxFQUV2QiJ9