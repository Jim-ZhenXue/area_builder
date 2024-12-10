// Copyright 2023, University of Colorado Boulder
/**
 * Lint detector for invalid text.
 * Lint is disabled for this file so the bad texts aren't themselves flagged.
 *
 * This file is meant for prohibiting hard dependencies on sim-specific implementations on our common and phet-library
 * code. This is in an effort to allow PhET's more fundamental code repositories to be used in outside, non-phet cases.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ const getBadTextTester = require('./getBadTextTester');
module.exports = {
    create: function(context) {
        // see getBadTextTester for schema.
        const forbiddenTextObjects = [
            // accessing the sim as a global, like `phet.joist.sim` is a classic example of a hard dependency that can be a
            // ticking time bomb for common code that isn't normally run outside phetsims (but could and may want to in the
            // future). See https://github.com/phetsims/chipper/issues/1004
            {
                id: 'phet.joist',
                codeTokens: [
                    'phet',
                    '.',
                    'joist'
                ]
            },
            'nopedy'
        ];
        return {
            Program: getBadTextTester('bad-phet-library-text', forbiddenTextObjects, context)
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9iYWQtcGhldC1saWJyYXJ5LXRleHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5cbi8qKlxuICogTGludCBkZXRlY3RvciBmb3IgaW52YWxpZCB0ZXh0LlxuICogTGludCBpcyBkaXNhYmxlZCBmb3IgdGhpcyBmaWxlIHNvIHRoZSBiYWQgdGV4dHMgYXJlbid0IHRoZW1zZWx2ZXMgZmxhZ2dlZC5cbiAqXG4gKiBUaGlzIGZpbGUgaXMgbWVhbnQgZm9yIHByb2hpYml0aW5nIGhhcmQgZGVwZW5kZW5jaWVzIG9uIHNpbS1zcGVjaWZpYyBpbXBsZW1lbnRhdGlvbnMgb24gb3VyIGNvbW1vbiBhbmQgcGhldC1saWJyYXJ5XG4gKiBjb2RlLiBUaGlzIGlzIGluIGFuIGVmZm9ydCB0byBhbGxvdyBQaEVUJ3MgbW9yZSBmdW5kYW1lbnRhbCBjb2RlIHJlcG9zaXRvcmllcyB0byBiZSB1c2VkIGluIG91dHNpZGUsIG5vbi1waGV0IGNhc2VzLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5jb25zdCBnZXRCYWRUZXh0VGVzdGVyID0gcmVxdWlyZSggJy4vZ2V0QmFkVGV4dFRlc3RlcicgKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24oIGNvbnRleHQgKSB7XG5cbiAgICAvLyBzZWUgZ2V0QmFkVGV4dFRlc3RlciBmb3Igc2NoZW1hLlxuICAgIGNvbnN0IGZvcmJpZGRlblRleHRPYmplY3RzID0gW1xuXG4gICAgICAvLyBhY2Nlc3NpbmcgdGhlIHNpbSBhcyBhIGdsb2JhbCwgbGlrZSBgcGhldC5qb2lzdC5zaW1gIGlzIGEgY2xhc3NpYyBleGFtcGxlIG9mIGEgaGFyZCBkZXBlbmRlbmN5IHRoYXQgY2FuIGJlIGFcbiAgICAgIC8vIHRpY2tpbmcgdGltZSBib21iIGZvciBjb21tb24gY29kZSB0aGF0IGlzbid0IG5vcm1hbGx5IHJ1biBvdXRzaWRlIHBoZXRzaW1zIChidXQgY291bGQgYW5kIG1heSB3YW50IHRvIGluIHRoZVxuICAgICAgLy8gZnV0dXJlKS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMDA0XG4gICAgICB7IGlkOiAncGhldC5qb2lzdCcsIGNvZGVUb2tlbnM6IFsgJ3BoZXQnLCAnLicsICdqb2lzdCcgXSB9LFxuICAgICAgJ25vcGVkeSdcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIFByb2dyYW06IGdldEJhZFRleHRUZXN0ZXIoICdiYWQtcGhldC1saWJyYXJ5LXRleHQnLCBmb3JiaWRkZW5UZXh0T2JqZWN0cywgY29udGV4dCApXG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsiZ2V0QmFkVGV4dFRlc3RlciIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiY3JlYXRlIiwiY29udGV4dCIsImZvcmJpZGRlblRleHRPYmplY3RzIiwiaWQiLCJjb2RlVG9rZW5zIiwiUHJvZ3JhbSIsInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBR2pEOzs7Ozs7OztDQVFDLEdBRUQsTUFBTUEsbUJBQW1CQyxRQUFTO0FBRWxDQyxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUSxTQUFVQyxPQUFPO1FBRXZCLG1DQUFtQztRQUNuQyxNQUFNQyx1QkFBdUI7WUFFM0IsK0dBQStHO1lBQy9HLCtHQUErRztZQUMvRywrREFBK0Q7WUFDL0Q7Z0JBQUVDLElBQUk7Z0JBQWNDLFlBQVk7b0JBQUU7b0JBQVE7b0JBQUs7aUJBQVM7WUFBQztZQUN6RDtTQUNEO1FBRUQsT0FBTztZQUNMQyxTQUFTVCxpQkFBa0IseUJBQXlCTSxzQkFBc0JEO1FBQzVFO0lBQ0Y7QUFDRjtBQUVBSCxPQUFPQyxPQUFPLENBQUNPLE1BQU0sR0FBRyxFQUV2QiJ9