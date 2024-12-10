// Copyright 2024, University of Colorado Boulder
/**
 * Disallows importing files with ".ts", ".tsx", or ".mts" extensions.
 * Enforces the use of ".js", ".jsx", or ".mjs" extensions instead.
 * Automatically fixes the import paths by replacing the disallowed extensions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow specific TypeScript-related file extensions in relative import paths and enforce JavaScript equivalents.',
            category: 'Best Practices',
            recommended: false
        },
        fixable: 'code',
        schema: [] // no options
    },
    create: function(context) {
        // Define a mapping from disallowed extensions to their preferred JavaScript counterparts
        const extensionMapping = {
            '.ts': '.js',
            '.tsx': '.jsx',
            '.mts': '.mjs'
        };
        // Create a regular expression to match the disallowed extensions
        const disallowedExtensionsRegex = /\.(ts|tsx|mts)$/;
        return {
            ImportDeclaration (node) {
                const source = node.source.value;
                // Only process relative import paths
                if (source.startsWith('.')) {
                    const match = source.match(disallowedExtensionsRegex);
                    if (match) {
                        const currentExtension = match[0];
                        const newExtension = extensionMapping[currentExtension];
                        if (newExtension) {
                            context.report({
                                node: node.source,
                                message: `Importing "${currentExtension}" files is not allowed. Use "${newExtension}" instead.`,
                                fix: function(fixer) {
                                    const importSource = node.source;
                                    const raw = importSource.raw;
                                    // Determine which quote is used (single or double)
                                    const quote = raw[0]; // Assumes the first character is the quote
                                    // Replace the disallowed extension with the new extension
                                    const newValue = source.replace(disallowedExtensionsRegex, newExtension);
                                    // Construct the new import path with the original quotes
                                    const newImportPath = `${quote}${newValue}${quote}`;
                                    // Replace the entire source node with the new import path
                                    return fixer.replaceText(importSource, newImportPath);
                                }
                            });
                        }
                    }
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9pbXBvcnQtc3RhdGVtZW50LWV4dGVuc2lvbi1qcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGlzYWxsb3dzIGltcG9ydGluZyBmaWxlcyB3aXRoIFwiLnRzXCIsIFwiLnRzeFwiLCBvciBcIi5tdHNcIiBleHRlbnNpb25zLlxuICogRW5mb3JjZXMgdGhlIHVzZSBvZiBcIi5qc1wiLCBcIi5qc3hcIiwgb3IgXCIubWpzXCIgZXh0ZW5zaW9ucyBpbnN0ZWFkLlxuICogQXV0b21hdGljYWxseSBmaXhlcyB0aGUgaW1wb3J0IHBhdGhzIGJ5IHJlcGxhY2luZyB0aGUgZGlzYWxsb3dlZCBleHRlbnNpb25zLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgZG9jczoge1xuICAgICAgZGVzY3JpcHRpb246ICdEaXNhbGxvdyBzcGVjaWZpYyBUeXBlU2NyaXB0LXJlbGF0ZWQgZmlsZSBleHRlbnNpb25zIGluIHJlbGF0aXZlIGltcG9ydCBwYXRocyBhbmQgZW5mb3JjZSBKYXZhU2NyaXB0IGVxdWl2YWxlbnRzLicsXG4gICAgICBjYXRlZ29yeTogJ0Jlc3QgUHJhY3RpY2VzJyxcbiAgICAgIHJlY29tbWVuZGVkOiBmYWxzZVxuICAgIH0sXG4gICAgZml4YWJsZTogJ2NvZGUnLFxuICAgIHNjaGVtYTogW10gLy8gbm8gb3B0aW9uc1xuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uKCBjb250ZXh0ICkge1xuICAgIC8vIERlZmluZSBhIG1hcHBpbmcgZnJvbSBkaXNhbGxvd2VkIGV4dGVuc2lvbnMgdG8gdGhlaXIgcHJlZmVycmVkIEphdmFTY3JpcHQgY291bnRlcnBhcnRzXG4gICAgY29uc3QgZXh0ZW5zaW9uTWFwcGluZyA9IHtcbiAgICAgICcudHMnOiAnLmpzJyxcbiAgICAgICcudHN4JzogJy5qc3gnLFxuICAgICAgJy5tdHMnOiAnLm1qcydcbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGEgcmVndWxhciBleHByZXNzaW9uIHRvIG1hdGNoIHRoZSBkaXNhbGxvd2VkIGV4dGVuc2lvbnNcbiAgICBjb25zdCBkaXNhbGxvd2VkRXh0ZW5zaW9uc1JlZ2V4ID0gL1xcLih0c3x0c3h8bXRzKSQvO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIEltcG9ydERlY2xhcmF0aW9uKCBub2RlICkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBub2RlLnNvdXJjZS52YWx1ZTtcblxuICAgICAgICAvLyBPbmx5IHByb2Nlc3MgcmVsYXRpdmUgaW1wb3J0IHBhdGhzXG4gICAgICAgIGlmICggc291cmNlLnN0YXJ0c1dpdGgoICcuJyApICkge1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gc291cmNlLm1hdGNoKCBkaXNhbGxvd2VkRXh0ZW5zaW9uc1JlZ2V4ICk7XG5cbiAgICAgICAgICBpZiAoIG1hdGNoICkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudEV4dGVuc2lvbiA9IG1hdGNoWyAwIF07XG4gICAgICAgICAgICBjb25zdCBuZXdFeHRlbnNpb24gPSBleHRlbnNpb25NYXBwaW5nWyBjdXJyZW50RXh0ZW5zaW9uIF07XG5cbiAgICAgICAgICAgIGlmICggbmV3RXh0ZW5zaW9uICkge1xuICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUuc291cmNlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBJbXBvcnRpbmcgXCIke2N1cnJlbnRFeHRlbnNpb259XCIgZmlsZXMgaXMgbm90IGFsbG93ZWQuIFVzZSBcIiR7bmV3RXh0ZW5zaW9ufVwiIGluc3RlYWQuYCxcbiAgICAgICAgICAgICAgICBmaXg6IGZ1bmN0aW9uKCBmaXhlciApIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGltcG9ydFNvdXJjZSA9IG5vZGUuc291cmNlO1xuICAgICAgICAgICAgICAgICAgY29uc3QgcmF3ID0gaW1wb3J0U291cmNlLnJhdztcblxuICAgICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHF1b3RlIGlzIHVzZWQgKHNpbmdsZSBvciBkb3VibGUpXG4gICAgICAgICAgICAgICAgICBjb25zdCBxdW90ZSA9IHJhd1sgMCBdOyAvLyBBc3N1bWVzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgaXMgdGhlIHF1b3RlXG5cbiAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgdGhlIGRpc2FsbG93ZWQgZXh0ZW5zaW9uIHdpdGggdGhlIG5ldyBleHRlbnNpb25cbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gc291cmNlLnJlcGxhY2UoIGRpc2FsbG93ZWRFeHRlbnNpb25zUmVnZXgsIG5ld0V4dGVuc2lvbiApO1xuXG4gICAgICAgICAgICAgICAgICAvLyBDb25zdHJ1Y3QgdGhlIG5ldyBpbXBvcnQgcGF0aCB3aXRoIHRoZSBvcmlnaW5hbCBxdW90ZXNcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0ltcG9ydFBhdGggPSBgJHtxdW90ZX0ke25ld1ZhbHVlfSR7cXVvdGV9YDtcblxuICAgICAgICAgICAgICAgICAgLy8gUmVwbGFjZSB0aGUgZW50aXJlIHNvdXJjZSBub2RlIHdpdGggdGhlIG5ldyBpbXBvcnQgcGF0aFxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpeGVyLnJlcGxhY2VUZXh0KCBpbXBvcnRTb3VyY2UsIG5ld0ltcG9ydFBhdGggKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59OyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwiZGVzY3JpcHRpb24iLCJjYXRlZ29yeSIsInJlY29tbWVuZGVkIiwiZml4YWJsZSIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJleHRlbnNpb25NYXBwaW5nIiwiZGlzYWxsb3dlZEV4dGVuc2lvbnNSZWdleCIsIkltcG9ydERlY2xhcmF0aW9uIiwibm9kZSIsInNvdXJjZSIsInZhbHVlIiwic3RhcnRzV2l0aCIsIm1hdGNoIiwiY3VycmVudEV4dGVuc2lvbiIsIm5ld0V4dGVuc2lvbiIsInJlcG9ydCIsIm1lc3NhZ2UiLCJmaXgiLCJmaXhlciIsImltcG9ydFNvdXJjZSIsInJhdyIsInF1b3RlIiwibmV3VmFsdWUiLCJyZXBsYWNlIiwibmV3SW1wb3J0UGF0aCIsInJlcGxhY2VUZXh0Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7OztDQU1DLEdBRURBLE9BQU9DLE9BQU8sR0FBRztJQUNmQyxNQUFNO1FBQ0pDLE1BQU07UUFDTkMsTUFBTTtZQUNKQyxhQUFhO1lBQ2JDLFVBQVU7WUFDVkMsYUFBYTtRQUNmO1FBQ0FDLFNBQVM7UUFDVEMsUUFBUSxFQUFFLENBQUMsYUFBYTtJQUMxQjtJQUNBQyxRQUFRLFNBQVVDLE9BQU87UUFDdkIseUZBQXlGO1FBQ3pGLE1BQU1DLG1CQUFtQjtZQUN2QixPQUFPO1lBQ1AsUUFBUTtZQUNSLFFBQVE7UUFDVjtRQUVBLGlFQUFpRTtRQUNqRSxNQUFNQyw0QkFBNEI7UUFFbEMsT0FBTztZQUNMQyxtQkFBbUJDLElBQUk7Z0JBQ3JCLE1BQU1DLFNBQVNELEtBQUtDLE1BQU0sQ0FBQ0MsS0FBSztnQkFFaEMscUNBQXFDO2dCQUNyQyxJQUFLRCxPQUFPRSxVQUFVLENBQUUsTUFBUTtvQkFDOUIsTUFBTUMsUUFBUUgsT0FBT0csS0FBSyxDQUFFTjtvQkFFNUIsSUFBS00sT0FBUTt3QkFDWCxNQUFNQyxtQkFBbUJELEtBQUssQ0FBRSxFQUFHO3dCQUNuQyxNQUFNRSxlQUFlVCxnQkFBZ0IsQ0FBRVEsaUJBQWtCO3dCQUV6RCxJQUFLQyxjQUFlOzRCQUNsQlYsUUFBUVcsTUFBTSxDQUFFO2dDQUNkUCxNQUFNQSxLQUFLQyxNQUFNO2dDQUNqQk8sU0FBUyxDQUFDLFdBQVcsRUFBRUgsaUJBQWlCLDZCQUE2QixFQUFFQyxhQUFhLFVBQVUsQ0FBQztnQ0FDL0ZHLEtBQUssU0FBVUMsS0FBSztvQ0FDbEIsTUFBTUMsZUFBZVgsS0FBS0MsTUFBTTtvQ0FDaEMsTUFBTVcsTUFBTUQsYUFBYUMsR0FBRztvQ0FFNUIsbURBQW1EO29DQUNuRCxNQUFNQyxRQUFRRCxHQUFHLENBQUUsRUFBRyxFQUFFLDJDQUEyQztvQ0FFbkUsMERBQTBEO29DQUMxRCxNQUFNRSxXQUFXYixPQUFPYyxPQUFPLENBQUVqQiwyQkFBMkJRO29DQUU1RCx5REFBeUQ7b0NBQ3pELE1BQU1VLGdCQUFnQixHQUFHSCxRQUFRQyxXQUFXRCxPQUFPO29DQUVuRCwwREFBMEQ7b0NBQzFELE9BQU9ILE1BQU1PLFdBQVcsQ0FBRU4sY0FBY0s7Z0NBQzFDOzRCQUNGO3dCQUNGO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0YifQ==