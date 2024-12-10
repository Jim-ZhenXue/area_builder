// Copyright 2022, University of Colorado Boulder
/**
 * Do not allow basic assertions in typescript files where typescript types make that redundant. This rule applies in
 * cases like:
 *
 * assert && assert( typeof x === 'number', 'should be a number' );
 * assert && assert( x instanceof Node, 'why is this thing not a Node );
 *
 * In typescript, x should just have the correct type to begin with, instead of relying on runtime assertions.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ const getBadTextTester = require('./getBadTextTester');
module.exports = {
    create: function(context) {
        // see getBadTextTester for schema.
        const forbiddenTextObject = [
            {
                id: 'asserting values are instanceof or typeof in TypeScript is redundant',
                regex: /^ *(assert && )?assert\( ((\w+ instanceof \w+)|(typeof \w+ === '\w+'))(,| \))/
            }
        ];
        return {
            Program: getBadTextTester('bad-typescript-text', forbiddenTextObject, context)
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9uby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbiBcblxuLyoqXG4gKiBEbyBub3QgYWxsb3cgYmFzaWMgYXNzZXJ0aW9ucyBpbiB0eXBlc2NyaXB0IGZpbGVzIHdoZXJlIHR5cGVzY3JpcHQgdHlwZXMgbWFrZSB0aGF0IHJlZHVuZGFudC4gVGhpcyBydWxlIGFwcGxpZXMgaW5cbiAqIGNhc2VzIGxpa2U6XG4gKlxuICogYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHggPT09ICdudW1iZXInLCAnc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xuICogYXNzZXJ0ICYmIGFzc2VydCggeCBpbnN0YW5jZW9mIE5vZGUsICd3aHkgaXMgdGhpcyB0aGluZyBub3QgYSBOb2RlICk7XG4gKlxuICogSW4gdHlwZXNjcmlwdCwgeCBzaG91bGQganVzdCBoYXZlIHRoZSBjb3JyZWN0IHR5cGUgdG8gYmVnaW4gd2l0aCwgaW5zdGVhZCBvZiByZWx5aW5nIG9uIHJ1bnRpbWUgYXNzZXJ0aW9ucy5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgZ2V0QmFkVGV4dFRlc3RlciA9IHJlcXVpcmUoICcuL2dldEJhZFRleHRUZXN0ZXInICk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uKCBjb250ZXh0ICkge1xuXG4gICAgLy8gc2VlIGdldEJhZFRleHRUZXN0ZXIgZm9yIHNjaGVtYS5cbiAgICBjb25zdCBmb3JiaWRkZW5UZXh0T2JqZWN0ID0gW1xuICAgICAge1xuICAgICAgICBpZDogJ2Fzc2VydGluZyB2YWx1ZXMgYXJlIGluc3RhbmNlb2Ygb3IgdHlwZW9mIGluIFR5cGVTY3JpcHQgaXMgcmVkdW5kYW50JyxcbiAgICAgICAgcmVnZXg6IC9eICooYXNzZXJ0ICYmICk/YXNzZXJ0XFwoICgoXFx3KyBpbnN0YW5jZW9mIFxcdyspfCh0eXBlb2YgXFx3KyA9PT0gJ1xcdysnKSkoLHwgXFwpKS9cbiAgICAgIH1cbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIFByb2dyYW06IGdldEJhZFRleHRUZXN0ZXIoICdiYWQtdHlwZXNjcmlwdC10ZXh0JywgZm9yYmlkZGVuVGV4dE9iamVjdCwgY29udGV4dCApXG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsiZ2V0QmFkVGV4dFRlc3RlciIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiY3JlYXRlIiwiY29udGV4dCIsImZvcmJpZGRlblRleHRPYmplY3QiLCJpZCIsInJlZ2V4IiwiUHJvZ3JhbSIsInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBR2pEOzs7Ozs7Ozs7O0NBVUMsR0FFRCxNQUFNQSxtQkFBbUJDLFFBQVM7QUFFbENDLE9BQU9DLE9BQU8sR0FBRztJQUNmQyxRQUFRLFNBQVVDLE9BQU87UUFFdkIsbUNBQW1DO1FBQ25DLE1BQU1DLHNCQUFzQjtZQUMxQjtnQkFDRUMsSUFBSTtnQkFDSkMsT0FBTztZQUNUO1NBQ0Q7UUFFRCxPQUFPO1lBQ0xDLFNBQVNULGlCQUFrQix1QkFBdUJNLHFCQUFxQkQ7UUFDekU7SUFDRjtBQUNGO0FBRUFILE9BQU9DLE9BQU8sQ0FBQ08sTUFBTSxHQUFHLEVBRXZCIn0=