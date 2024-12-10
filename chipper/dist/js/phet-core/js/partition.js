// Copyright 2014-2023, University of Colorado Boulder
/**
 * Partitions an array into two arrays: the first contains all elements that satisfy the predicate, and the second
 * contains all the (other) elements that do not satisfy the predicate.
 *
 * e.g. partition( [1,2,3,4], function( n ) { return n % 2 === 0; } ) will return [[2,4],[1,3]]
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
function partition(array, predicate) {
    assert && assert(Array.isArray(array));
    const satisfied = [];
    const unsatisfied = [];
    const length = array.length;
    for(let i = 0; i < length; i++){
        if (predicate(array[i])) {
            satisfied.push(array[i]);
        } else {
            unsatisfied.push(array[i]);
        }
    }
    return [
        satisfied,
        unsatisfied
    ];
}
phetCore.register('partition', partition);
export default partition;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wYXJ0aXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUGFydGl0aW9ucyBhbiBhcnJheSBpbnRvIHR3byBhcnJheXM6IHRoZSBmaXJzdCBjb250YWlucyBhbGwgZWxlbWVudHMgdGhhdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUsIGFuZCB0aGUgc2Vjb25kXG4gKiBjb250YWlucyBhbGwgdGhlIChvdGhlcikgZWxlbWVudHMgdGhhdCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICpcbiAqIGUuZy4gcGFydGl0aW9uKCBbMSwyLDMsNF0sIGZ1bmN0aW9uKCBuICkgeyByZXR1cm4gbiAlIDIgPT09IDA7IH0gKSB3aWxsIHJldHVybiBbWzIsNF0sWzEsM11dXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcblxuZnVuY3Rpb24gcGFydGl0aW9uPFQ+KCBhcnJheTogVFtdLCBwcmVkaWNhdGU6ICggZWxlbWVudDogVCApID0+IGJvb2xlYW4gKTogcmVhZG9ubHlbIFRbXSwgVFtdIF0ge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBhcnJheSApICk7XG5cbiAgY29uc3Qgc2F0aXNmaWVkID0gW107XG4gIGNvbnN0IHVuc2F0aXNmaWVkID0gW107XG4gIGNvbnN0IGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgaWYgKCBwcmVkaWNhdGUoIGFycmF5WyBpIF0gKSApIHtcbiAgICAgIHNhdGlzZmllZC5wdXNoKCBhcnJheVsgaSBdICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdW5zYXRpc2ZpZWQucHVzaCggYXJyYXlbIGkgXSApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbIHNhdGlzZmllZCwgdW5zYXRpc2ZpZWQgXTtcbn1cblxucGhldENvcmUucmVnaXN0ZXIoICdwYXJ0aXRpb24nLCBwYXJ0aXRpb24gKTtcblxuZXhwb3J0IGRlZmF1bHQgcGFydGl0aW9uOyJdLCJuYW1lcyI6WyJwaGV0Q29yZSIsInBhcnRpdGlvbiIsImFycmF5IiwicHJlZGljYXRlIiwiYXNzZXJ0IiwiQXJyYXkiLCJpc0FycmF5Iiwic2F0aXNmaWVkIiwidW5zYXRpc2ZpZWQiLCJsZW5ndGgiLCJpIiwicHVzaCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUVELE9BQU9BLGNBQWMsZ0JBQWdCO0FBRXJDLFNBQVNDLFVBQWNDLEtBQVUsRUFBRUMsU0FBb0M7SUFDckVDLFVBQVVBLE9BQVFDLE1BQU1DLE9BQU8sQ0FBRUo7SUFFakMsTUFBTUssWUFBWSxFQUFFO0lBQ3BCLE1BQU1DLGNBQWMsRUFBRTtJQUN0QixNQUFNQyxTQUFTUCxNQUFNTyxNQUFNO0lBQzNCLElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJRCxRQUFRQyxJQUFNO1FBQ2pDLElBQUtQLFVBQVdELEtBQUssQ0FBRVEsRUFBRyxHQUFLO1lBQzdCSCxVQUFVSSxJQUFJLENBQUVULEtBQUssQ0FBRVEsRUFBRztRQUM1QixPQUNLO1lBQ0hGLFlBQVlHLElBQUksQ0FBRVQsS0FBSyxDQUFFUSxFQUFHO1FBQzlCO0lBQ0Y7SUFFQSxPQUFPO1FBQUVIO1FBQVdDO0tBQWE7QUFDbkM7QUFFQVIsU0FBU1ksUUFBUSxDQUFFLGFBQWFYO0FBRWhDLGVBQWVBLFVBQVUifQ==