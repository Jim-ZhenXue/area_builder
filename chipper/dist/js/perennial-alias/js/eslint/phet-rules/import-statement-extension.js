// Copyright 2024, University of Colorado Boulder
/**
 * Importing a relative path should include a file extension.
 * This rule ensures that all relative import paths have a suffix.
 * If no suffix is provided, it automatically adds the '.js' extension.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Require a file extension on relative import paths',
            category: 'Best Practices',
            recommended: false
        },
        fixable: 'code',
        schema: [] // no options
    },
    create: function(context) {
        return {
            ImportDeclaration (node) {
                const source = node.source.value;
                // Only process relative import paths
                if (source.startsWith('.')) {
                    // Regular expression to check for a file extension
                    const hasExtension = /\.[^./\\]+$/.test(source);
                    if (!hasExtension) {
                        context.report({
                            node: node,
                            message: 'Relative import paths must include a file extension.',
                            fix: function(fixer) {
                                const importSource = node.source;
                                const raw = importSource.raw;
                                // Determine which quote is used (single or double)
                                const quote = raw[0]; // Assumes the first character is the quote
                                // Append the default extension (.js) to the current source value
                                const newValue = source + '.js';
                                // Construct the new import path with the original quotes
                                const newImportPath = `${quote}${newValue}${quote}`;
                                // Replace the entire source node with the new import path
                                return fixer.replaceText(importSource, newImportPath);
                            }
                        });
                    }
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9pbXBvcnQtc3RhdGVtZW50LWV4dGVuc2lvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogSW1wb3J0aW5nIGEgcmVsYXRpdmUgcGF0aCBzaG91bGQgaW5jbHVkZSBhIGZpbGUgZXh0ZW5zaW9uLlxuICogVGhpcyBydWxlIGVuc3VyZXMgdGhhdCBhbGwgcmVsYXRpdmUgaW1wb3J0IHBhdGhzIGhhdmUgYSBzdWZmaXguXG4gKiBJZiBubyBzdWZmaXggaXMgcHJvdmlkZWQsIGl0IGF1dG9tYXRpY2FsbHkgYWRkcyB0aGUgJy5qcycgZXh0ZW5zaW9uLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgZG9jczoge1xuICAgICAgZGVzY3JpcHRpb246ICdSZXF1aXJlIGEgZmlsZSBleHRlbnNpb24gb24gcmVsYXRpdmUgaW1wb3J0IHBhdGhzJyxcbiAgICAgIGNhdGVnb3J5OiAnQmVzdCBQcmFjdGljZXMnLFxuICAgICAgcmVjb21tZW5kZWQ6IGZhbHNlXG4gICAgfSxcbiAgICBmaXhhYmxlOiAnY29kZScsXG4gICAgc2NoZW1hOiBbXSAvLyBubyBvcHRpb25zXG4gIH0sXG4gIGNyZWF0ZTogZnVuY3Rpb24oIGNvbnRleHQgKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIEltcG9ydERlY2xhcmF0aW9uKCBub2RlICkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBub2RlLnNvdXJjZS52YWx1ZTtcblxuICAgICAgICAvLyBPbmx5IHByb2Nlc3MgcmVsYXRpdmUgaW1wb3J0IHBhdGhzXG4gICAgICAgIGlmICggc291cmNlLnN0YXJ0c1dpdGgoICcuJyApICkge1xuICAgICAgICAgIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBjaGVjayBmb3IgYSBmaWxlIGV4dGVuc2lvblxuICAgICAgICAgIGNvbnN0IGhhc0V4dGVuc2lvbiA9IC9cXC5bXi4vXFxcXF0rJC8udGVzdCggc291cmNlICk7XG5cbiAgICAgICAgICBpZiAoICFoYXNFeHRlbnNpb24gKSB7XG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgICBtZXNzYWdlOiAnUmVsYXRpdmUgaW1wb3J0IHBhdGhzIG11c3QgaW5jbHVkZSBhIGZpbGUgZXh0ZW5zaW9uLicsXG4gICAgICAgICAgICAgIGZpeDogZnVuY3Rpb24oIGZpeGVyICkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGltcG9ydFNvdXJjZSA9IG5vZGUuc291cmNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IGltcG9ydFNvdXJjZS5yYXc7XG5cbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggcXVvdGUgaXMgdXNlZCAoc2luZ2xlIG9yIGRvdWJsZSlcbiAgICAgICAgICAgICAgICBjb25zdCBxdW90ZSA9IHJhd1sgMCBdOyAvLyBBc3N1bWVzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgaXMgdGhlIHF1b3RlXG5cbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgdGhlIGRlZmF1bHQgZXh0ZW5zaW9uICguanMpIHRvIHRoZSBjdXJyZW50IHNvdXJjZSB2YWx1ZVxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gc291cmNlICsgJy5qcyc7XG5cbiAgICAgICAgICAgICAgICAvLyBDb25zdHJ1Y3QgdGhlIG5ldyBpbXBvcnQgcGF0aCB3aXRoIHRoZSBvcmlnaW5hbCBxdW90ZXNcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdJbXBvcnRQYXRoID0gYCR7cXVvdGV9JHtuZXdWYWx1ZX0ke3F1b3RlfWA7XG5cbiAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBlbnRpcmUgc291cmNlIG5vZGUgd2l0aCB0aGUgbmV3IGltcG9ydCBwYXRoXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpeGVyLnJlcGxhY2VUZXh0KCBpbXBvcnRTb3VyY2UsIG5ld0ltcG9ydFBhdGggKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn07Il0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJkZXNjcmlwdGlvbiIsImNhdGVnb3J5IiwicmVjb21tZW5kZWQiLCJmaXhhYmxlIiwic2NoZW1hIiwiY3JlYXRlIiwiY29udGV4dCIsIkltcG9ydERlY2xhcmF0aW9uIiwibm9kZSIsInNvdXJjZSIsInZhbHVlIiwic3RhcnRzV2l0aCIsImhhc0V4dGVuc2lvbiIsInRlc3QiLCJyZXBvcnQiLCJtZXNzYWdlIiwiZml4IiwiZml4ZXIiLCJpbXBvcnRTb3VyY2UiLCJyYXciLCJxdW90ZSIsIm5ld1ZhbHVlIiwibmV3SW1wb3J0UGF0aCIsInJlcGxhY2VUZXh0Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7OztDQU1DLEdBRURBLE9BQU9DLE9BQU8sR0FBRztJQUNmQyxNQUFNO1FBQ0pDLE1BQU07UUFDTkMsTUFBTTtZQUNKQyxhQUFhO1lBQ2JDLFVBQVU7WUFDVkMsYUFBYTtRQUNmO1FBQ0FDLFNBQVM7UUFDVEMsUUFBUSxFQUFFLENBQUMsYUFBYTtJQUMxQjtJQUNBQyxRQUFRLFNBQVVDLE9BQU87UUFDdkIsT0FBTztZQUNMQyxtQkFBbUJDLElBQUk7Z0JBQ3JCLE1BQU1DLFNBQVNELEtBQUtDLE1BQU0sQ0FBQ0MsS0FBSztnQkFFaEMscUNBQXFDO2dCQUNyQyxJQUFLRCxPQUFPRSxVQUFVLENBQUUsTUFBUTtvQkFDOUIsbURBQW1EO29CQUNuRCxNQUFNQyxlQUFlLGNBQWNDLElBQUksQ0FBRUo7b0JBRXpDLElBQUssQ0FBQ0csY0FBZTt3QkFDbkJOLFFBQVFRLE1BQU0sQ0FBRTs0QkFDZE4sTUFBTUE7NEJBQ05PLFNBQVM7NEJBQ1RDLEtBQUssU0FBVUMsS0FBSztnQ0FDbEIsTUFBTUMsZUFBZVYsS0FBS0MsTUFBTTtnQ0FDaEMsTUFBTVUsTUFBTUQsYUFBYUMsR0FBRztnQ0FFNUIsbURBQW1EO2dDQUNuRCxNQUFNQyxRQUFRRCxHQUFHLENBQUUsRUFBRyxFQUFFLDJDQUEyQztnQ0FFbkUsaUVBQWlFO2dDQUNqRSxNQUFNRSxXQUFXWixTQUFTO2dDQUUxQix5REFBeUQ7Z0NBQ3pELE1BQU1hLGdCQUFnQixHQUFHRixRQUFRQyxXQUFXRCxPQUFPO2dDQUVuRCwwREFBMEQ7Z0NBQzFELE9BQU9ILE1BQU1NLFdBQVcsQ0FBRUwsY0FBY0k7NEJBQzFDO3dCQUNGO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0YifQ==