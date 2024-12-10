// Copyright 2014-2023, University of Colorado Boulder
/**
 * Creates an array of arrays, which consists of pairs of objects from the input array without duplication.
 *
 * For example, phet.phetCore.pairs( [ 'a', 'b', 'c' ] ) will return:
 * [ [ 'a', 'b' ], [ 'a', 'c' ], [ 'b', 'c' ] ]
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
function pairs(array) {
    const result = [];
    const length = array.length;
    if (length > 1) {
        for(let i = 0; i < length - 1; i++){
            const first = array[i];
            for(let j = i + 1; j < length; j++){
                result.push([
                    first,
                    array[j]
                ]);
            }
        }
    }
    return result;
}
phetCore.register('pairs', pairs);
export default pairs;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wYWlycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIGFycmF5cywgd2hpY2ggY29uc2lzdHMgb2YgcGFpcnMgb2Ygb2JqZWN0cyBmcm9tIHRoZSBpbnB1dCBhcnJheSB3aXRob3V0IGR1cGxpY2F0aW9uLlxuICpcbiAqIEZvciBleGFtcGxlLCBwaGV0LnBoZXRDb3JlLnBhaXJzKCBbICdhJywgJ2InLCAnYycgXSApIHdpbGwgcmV0dXJuOlxuICogWyBbICdhJywgJ2InIF0sIFsgJ2EnLCAnYycgXSwgWyAnYicsICdjJyBdIF1cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4vdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuXG50eXBlIEFycmF5T2ZQYWlycyA9IEFycmF5PHJlYWRvbmx5IFsgSW50ZW50aW9uYWxBbnksIEludGVudGlvbmFsQW55IF0+O1xuXG5mdW5jdGlvbiBwYWlycyggYXJyYXk6IEludGVudGlvbmFsQW55W10gKTogQXJyYXlPZlBhaXJzIHtcbiAgY29uc3QgcmVzdWx0OiBBcnJheU9mUGFpcnMgPSBbXTtcbiAgY29uc3QgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICBpZiAoIGxlbmd0aCA+IDEgKSB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoIC0gMTsgaSsrICkge1xuICAgICAgY29uc3QgZmlyc3QgPSBhcnJheVsgaSBdO1xuICAgICAgZm9yICggbGV0IGogPSBpICsgMTsgaiA8IGxlbmd0aDsgaisrICkge1xuICAgICAgICByZXN1bHQucHVzaCggWyBmaXJzdCwgYXJyYXlbIGogXSBdIGFzIGNvbnN0ICk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnBoZXRDb3JlLnJlZ2lzdGVyKCAncGFpcnMnLCBwYWlycyApO1xuXG5leHBvcnQgZGVmYXVsdCBwYWlyczsiXSwibmFtZXMiOlsicGhldENvcmUiLCJwYWlycyIsImFycmF5IiwicmVzdWx0IiwibGVuZ3RoIiwiaSIsImZpcnN0IiwiaiIsInB1c2giLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxjQUFjLGdCQUFnQjtBQUtyQyxTQUFTQyxNQUFPQyxLQUF1QjtJQUNyQyxNQUFNQyxTQUF1QixFQUFFO0lBQy9CLE1BQU1DLFNBQVNGLE1BQU1FLE1BQU07SUFDM0IsSUFBS0EsU0FBUyxHQUFJO1FBQ2hCLElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJRCxTQUFTLEdBQUdDLElBQU07WUFDckMsTUFBTUMsUUFBUUosS0FBSyxDQUFFRyxFQUFHO1lBQ3hCLElBQU0sSUFBSUUsSUFBSUYsSUFBSSxHQUFHRSxJQUFJSCxRQUFRRyxJQUFNO2dCQUNyQ0osT0FBT0ssSUFBSSxDQUFFO29CQUFFRjtvQkFBT0osS0FBSyxDQUFFSyxFQUFHO2lCQUFFO1lBQ3BDO1FBQ0Y7SUFDRjtJQUNBLE9BQU9KO0FBQ1Q7QUFFQUgsU0FBU1MsUUFBUSxDQUFFLFNBQVNSO0FBRTVCLGVBQWVBLE1BQU0ifQ==