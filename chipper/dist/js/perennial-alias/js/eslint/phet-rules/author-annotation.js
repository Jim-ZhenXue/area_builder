// Copyright 2024, University of Colorado Boulder
const path = require('path');
const _ = require('lodash');
// Files (or any "endsWith"-testable path) that don't need author annotations
const NO_AUTHOR_NEEDED = [
    'Gruntfile.cjs'
];
/**
 * Lint detector that requires each file to list at least one @author annotation.
 *
 *  @author Sam Reid (PhET Interactive Simulations)
 */ module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Lint rule that requires each source file to have at least one @author annotation.'
        },
        messages: {
            missingAuthor: 'Each file must have at least one @author annotation.'
        }
    },
    create: function(context) {
        return {
            Program: function(node) {
                // Get the filename of the current file
                const filename = context.getFilename();
                // Check if the file is an HTML file
                if (path.extname(filename) === '.html') {
                    // Skip linting for HTML files
                    return;
                }
                if (_.some(NO_AUTHOR_NEEDED, (noAuthorNeeded)=>filename.endsWith(noAuthorNeeded))) {
                    // Skip linting if author isn't needed
                    return;
                }
                // Get all comments in the file
                const sourceCode = context.getSourceCode();
                const comments = sourceCode.getAllComments();
                // Check if any comment contains @author
                const hasAuthor = comments.some((comment)=>/@author/.test(comment.value));
                // Report an error if no author annotation is found
                if (!hasAuthor) {
                    context.report({
                        node: node,
                        messageId: 'missingAuthor'
                    });
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9hdXRob3ItYW5ub3RhdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuXG4vLyBGaWxlcyAob3IgYW55IFwiZW5kc1dpdGhcIi10ZXN0YWJsZSBwYXRoKSB0aGF0IGRvbid0IG5lZWQgYXV0aG9yIGFubm90YXRpb25zXG5jb25zdCBOT19BVVRIT1JfTkVFREVEID0gWyAnR3J1bnRmaWxlLmNqcycgXTtcblxuLyoqXG4gKiBMaW50IGRldGVjdG9yIHRoYXQgcmVxdWlyZXMgZWFjaCBmaWxlIHRvIGxpc3QgYXQgbGVhc3Qgb25lIEBhdXRob3IgYW5ub3RhdGlvbi5cbiAqXG4gKiAgQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgZG9jczoge1xuICAgICAgZGVzY3JpcHRpb246ICdMaW50IHJ1bGUgdGhhdCByZXF1aXJlcyBlYWNoIHNvdXJjZSBmaWxlIHRvIGhhdmUgYXQgbGVhc3Qgb25lIEBhdXRob3IgYW5ub3RhdGlvbi4nXG4gICAgfSxcbiAgICBtZXNzYWdlczoge1xuICAgICAgbWlzc2luZ0F1dGhvcjogJ0VhY2ggZmlsZSBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIEBhdXRob3IgYW5ub3RhdGlvbi4nXG4gICAgfVxuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uKCBjb250ZXh0ICkge1xuICAgIHJldHVybiB7XG4gICAgICBQcm9ncmFtOiBmdW5jdGlvbiggbm9kZSApIHtcblxuICAgICAgICAvLyBHZXQgdGhlIGZpbGVuYW1lIG9mIHRoZSBjdXJyZW50IGZpbGVcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBjb250ZXh0LmdldEZpbGVuYW1lKCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGZpbGUgaXMgYW4gSFRNTCBmaWxlXG4gICAgICAgIGlmICggcGF0aC5leHRuYW1lKCBmaWxlbmFtZSApID09PSAnLmh0bWwnICkge1xuICAgICAgICAgIC8vIFNraXAgbGludGluZyBmb3IgSFRNTCBmaWxlc1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5zb21lKCBOT19BVVRIT1JfTkVFREVELCBub0F1dGhvck5lZWRlZCA9PiBmaWxlbmFtZS5lbmRzV2l0aCggbm9BdXRob3JOZWVkZWQgKSApICkge1xuICAgICAgICAgIC8vIFNraXAgbGludGluZyBpZiBhdXRob3IgaXNuJ3QgbmVlZGVkXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IGFsbCBjb21tZW50cyBpbiB0aGUgZmlsZVxuICAgICAgICBjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCk7XG4gICAgICAgIGNvbnN0IGNvbW1lbnRzID0gc291cmNlQ29kZS5nZXRBbGxDb21tZW50cygpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGFueSBjb21tZW50IGNvbnRhaW5zIEBhdXRob3JcbiAgICAgICAgY29uc3QgaGFzQXV0aG9yID0gY29tbWVudHMuc29tZSggY29tbWVudCA9PiAvQGF1dGhvci8udGVzdCggY29tbWVudC52YWx1ZSApICk7XG5cbiAgICAgICAgLy8gUmVwb3J0IGFuIGVycm9yIGlmIG5vIGF1dGhvciBhbm5vdGF0aW9uIGlzIGZvdW5kXG4gICAgICAgIGlmICggIWhhc0F1dGhvciApIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgIG1lc3NhZ2VJZDogJ21pc3NpbmdBdXRob3InXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTsiXSwibmFtZXMiOlsicGF0aCIsInJlcXVpcmUiLCJfIiwiTk9fQVVUSE9SX05FRURFRCIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJkZXNjcmlwdGlvbiIsIm1lc3NhZ2VzIiwibWlzc2luZ0F1dGhvciIsImNyZWF0ZSIsImNvbnRleHQiLCJQcm9ncmFtIiwibm9kZSIsImZpbGVuYW1lIiwiZ2V0RmlsZW5hbWUiLCJleHRuYW1lIiwic29tZSIsIm5vQXV0aG9yTmVlZGVkIiwiZW5kc1dpdGgiLCJzb3VyY2VDb2RlIiwiZ2V0U291cmNlQ29kZSIsImNvbW1lbnRzIiwiZ2V0QWxsQ29tbWVudHMiLCJoYXNBdXRob3IiLCJjb21tZW50IiwidGVzdCIsInZhbHVlIiwicmVwb3J0IiwibWVzc2FnZUlkIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQsTUFBTUEsT0FBT0MsUUFBUztBQUN0QixNQUFNQyxJQUFJRCxRQUFTO0FBRW5CLDZFQUE2RTtBQUM3RSxNQUFNRSxtQkFBbUI7SUFBRTtDQUFpQjtBQUU1Qzs7OztDQUlDLEdBQ0RDLE9BQU9DLE9BQU8sR0FBRztJQUNmQyxNQUFNO1FBQ0pDLE1BQU07UUFDTkMsTUFBTTtZQUNKQyxhQUFhO1FBQ2Y7UUFDQUMsVUFBVTtZQUNSQyxlQUFlO1FBQ2pCO0lBQ0Y7SUFDQUMsUUFBUSxTQUFVQyxPQUFPO1FBQ3ZCLE9BQU87WUFDTEMsU0FBUyxTQUFVQyxJQUFJO2dCQUVyQix1Q0FBdUM7Z0JBQ3ZDLE1BQU1DLFdBQVdILFFBQVFJLFdBQVc7Z0JBRXBDLG9DQUFvQztnQkFDcEMsSUFBS2pCLEtBQUtrQixPQUFPLENBQUVGLGNBQWUsU0FBVTtvQkFDMUMsOEJBQThCO29CQUM5QjtnQkFDRjtnQkFFQSxJQUFLZCxFQUFFaUIsSUFBSSxDQUFFaEIsa0JBQWtCaUIsQ0FBQUEsaUJBQWtCSixTQUFTSyxRQUFRLENBQUVELGtCQUFxQjtvQkFDdkYsc0NBQXNDO29CQUN0QztnQkFDRjtnQkFFQSwrQkFBK0I7Z0JBQy9CLE1BQU1FLGFBQWFULFFBQVFVLGFBQWE7Z0JBQ3hDLE1BQU1DLFdBQVdGLFdBQVdHLGNBQWM7Z0JBRTFDLHdDQUF3QztnQkFDeEMsTUFBTUMsWUFBWUYsU0FBU0wsSUFBSSxDQUFFUSxDQUFBQSxVQUFXLFVBQVVDLElBQUksQ0FBRUQsUUFBUUUsS0FBSztnQkFFekUsbURBQW1EO2dCQUNuRCxJQUFLLENBQUNILFdBQVk7b0JBQ2hCYixRQUFRaUIsTUFBTSxDQUFFO3dCQUNkZixNQUFNQTt3QkFDTmdCLFdBQVc7b0JBQ2I7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRiJ9