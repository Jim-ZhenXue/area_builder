/* eslint-disable phet/copyright */ /**
 * @fileoverview Rule to enforce disallowing of shorthand for object properties. Object method shorthand is allowed
 * @author Jamund Ferguson (original author of eslint file)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 *
 * This rule was adapted straight from eslint's object shorthand rule, and adapted/simplified for PhET purposes, see
 * original file: https://github.com/eslint/eslint/blob/550de1e611a1e9af873bcb18d74cf2056e8d2e1b/lib/rules/object-shorthand.js
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
    meta: {
        fixable: 'code'
    },
    create (context) {
        return {
            fixable: 'code',
            'Property:exit' (node) {
                // Ignore destructuring assignment
                if (node.parent.type === 'ObjectPattern') {
                    return;
                }
                // getters and setters are ignored
                if (node.kind === 'get' || node.kind === 'set') {
                    return;
                }
                // only computed methods can fail the following checks
                if (node.computed && node.value.type !== 'FunctionExpression' && node.value.type !== 'ArrowFunctionExpression') {
                    return;
                }
                // { x } should be written as { x: x }
                node.shorthand && context.report({
                    node: node,
                    message: 'Expected longform property syntax.',
                    fix: (fixer)=>fixer.insertTextAfter(node.key, `: ${node.key.name}`)
                });
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9waGV0LW9iamVjdC1zaG9ydGhhbmQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgcGhldC9jb3B5cmlnaHQgKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gZW5mb3JjZSBkaXNhbGxvd2luZyBvZiBzaG9ydGhhbmQgZm9yIG9iamVjdCBwcm9wZXJ0aWVzLiBPYmplY3QgbWV0aG9kIHNob3J0aGFuZCBpcyBhbGxvd2VkXG4gKiBAYXV0aG9yIEphbXVuZCBGZXJndXNvbiAob3JpZ2luYWwgYXV0aG9yIG9mIGVzbGludCBmaWxlKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICpcbiAqIFRoaXMgcnVsZSB3YXMgYWRhcHRlZCBzdHJhaWdodCBmcm9tIGVzbGludCdzIG9iamVjdCBzaG9ydGhhbmQgcnVsZSwgYW5kIGFkYXB0ZWQvc2ltcGxpZmllZCBmb3IgUGhFVCBwdXJwb3Nlcywgc2VlXG4gKiBvcmlnaW5hbCBmaWxlOiBodHRwczovL2dpdGh1Yi5jb20vZXNsaW50L2VzbGludC9ibG9iLzU1MGRlMWU2MTFhMWU5YWY4NzNiY2IxOGQ3NGNmMjA1NmU4ZDJlMWIvbGliL3J1bGVzL29iamVjdC1zaG9ydGhhbmQuanNcbiAqL1xuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YTogeyBmaXhhYmxlOiAnY29kZScgfSxcbiAgY3JlYXRlKCBjb250ZXh0ICkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZpeGFibGU6ICdjb2RlJyxcbiAgICAgICdQcm9wZXJ0eTpleGl0Jyggbm9kZSApIHtcblxuICAgICAgICAvLyBJZ25vcmUgZGVzdHJ1Y3R1cmluZyBhc3NpZ25tZW50XG4gICAgICAgIGlmICggbm9kZS5wYXJlbnQudHlwZSA9PT0gJ09iamVjdFBhdHRlcm4nICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdldHRlcnMgYW5kIHNldHRlcnMgYXJlIGlnbm9yZWRcbiAgICAgICAgaWYgKCBub2RlLmtpbmQgPT09ICdnZXQnIHx8IG5vZGUua2luZCA9PT0gJ3NldCcgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb25seSBjb21wdXRlZCBtZXRob2RzIGNhbiBmYWlsIHRoZSBmb2xsb3dpbmcgY2hlY2tzXG4gICAgICAgIGlmICggbm9kZS5jb21wdXRlZCAmJiBub2RlLnZhbHVlLnR5cGUgIT09ICdGdW5jdGlvbkV4cHJlc3Npb24nICYmIG5vZGUudmFsdWUudHlwZSAhPT0gJ0Fycm93RnVuY3Rpb25FeHByZXNzaW9uJyApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB7IHggfSBzaG91bGQgYmUgd3JpdHRlbiBhcyB7IHg6IHggfVxuICAgICAgICBub2RlLnNob3J0aGFuZCAmJiBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgbWVzc2FnZTogJ0V4cGVjdGVkIGxvbmdmb3JtIHByb3BlcnR5IHN5bnRheC4nLFxuICAgICAgICAgIGZpeDogZml4ZXIgPT4gZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKCBub2RlLmtleSwgYDogJHtub2RlLmtleS5uYW1lfWAgKVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTsiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJmaXhhYmxlIiwiY3JlYXRlIiwiY29udGV4dCIsIm5vZGUiLCJwYXJlbnQiLCJ0eXBlIiwia2luZCIsImNvbXB1dGVkIiwidmFsdWUiLCJzaG9ydGhhbmQiLCJyZXBvcnQiLCJtZXNzYWdlIiwiZml4IiwiZml4ZXIiLCJpbnNlcnRUZXh0QWZ0ZXIiLCJrZXkiLCJuYW1lIl0sIm1hcHBpbmdzIjoiQUFBQSxpQ0FBaUMsR0FFakM7Ozs7Ozs7Q0FPQyxHQUdELGdGQUFnRjtBQUNoRixrQkFBa0I7QUFDbEIsZ0ZBQWdGO0FBQ2hGQSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsTUFBTTtRQUFFQyxTQUFTO0lBQU87SUFDeEJDLFFBQVFDLE9BQU87UUFFYixPQUFPO1lBQ0xGLFNBQVM7WUFDVCxpQkFBaUJHLElBQUk7Z0JBRW5CLGtDQUFrQztnQkFDbEMsSUFBS0EsS0FBS0MsTUFBTSxDQUFDQyxJQUFJLEtBQUssaUJBQWtCO29CQUMxQztnQkFDRjtnQkFFQSxrQ0FBa0M7Z0JBQ2xDLElBQUtGLEtBQUtHLElBQUksS0FBSyxTQUFTSCxLQUFLRyxJQUFJLEtBQUssT0FBUTtvQkFDaEQ7Z0JBQ0Y7Z0JBRUEsc0RBQXNEO2dCQUN0RCxJQUFLSCxLQUFLSSxRQUFRLElBQUlKLEtBQUtLLEtBQUssQ0FBQ0gsSUFBSSxLQUFLLHdCQUF3QkYsS0FBS0ssS0FBSyxDQUFDSCxJQUFJLEtBQUssMkJBQTRCO29CQUNoSDtnQkFDRjtnQkFFQSxzQ0FBc0M7Z0JBQ3RDRixLQUFLTSxTQUFTLElBQUlQLFFBQVFRLE1BQU0sQ0FBRTtvQkFDaENQLE1BQU1BO29CQUNOUSxTQUFTO29CQUNUQyxLQUFLQyxDQUFBQSxRQUFTQSxNQUFNQyxlQUFlLENBQUVYLEtBQUtZLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRVosS0FBS1ksR0FBRyxDQUFDQyxJQUFJLEVBQUU7Z0JBQ3JFO1lBQ0Y7UUFDRjtJQUNGO0FBQ0YifQ==