// Copyright 2018-2023, University of Colorado Boulder
/**
 * Returns a copy of an array, with generated elements interleaved (inserted in-between) every element. For example, if
 * you call `interleave( [ a, b, c ], Math.random )`, it will result in the equivalent:
 * `[ a, Math.random(), b, Math.random(), c ]`.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
/**
 * @param arr - The array in which to interleave elements
 * @param generator - function( index: {number} ):{*} - 0-based index for which "separator" it is for. e.g.
 *                               [ _, generator(0), _, generator(1), _, generator(2), ..., _ ]
 * @returns - The interleaved array
 */ function interleave(arr, generator) {
    assert && assert(Array.isArray(arr));
    const result = [];
    const finalLength = arr.length * 2 - 1;
    for(let i = 0; i < finalLength; i++){
        if (i % 2 === 0) {
            result.push(arr[i / 2]);
        } else {
            result.push(generator((i - 1) / 2));
        }
    }
    return result;
}
phetCore.register('interleave', interleave);
export default interleave;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pbnRlcmxlYXZlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJldHVybnMgYSBjb3B5IG9mIGFuIGFycmF5LCB3aXRoIGdlbmVyYXRlZCBlbGVtZW50cyBpbnRlcmxlYXZlZCAoaW5zZXJ0ZWQgaW4tYmV0d2VlbikgZXZlcnkgZWxlbWVudC4gRm9yIGV4YW1wbGUsIGlmXG4gKiB5b3UgY2FsbCBgaW50ZXJsZWF2ZSggWyBhLCBiLCBjIF0sIE1hdGgucmFuZG9tIClgLCBpdCB3aWxsIHJlc3VsdCBpbiB0aGUgZXF1aXZhbGVudDpcbiAqIGBbIGEsIE1hdGgucmFuZG9tKCksIGIsIE1hdGgucmFuZG9tKCksIGMgXWAuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcblxuLyoqXG4gKiBAcGFyYW0gYXJyIC0gVGhlIGFycmF5IGluIHdoaWNoIHRvIGludGVybGVhdmUgZWxlbWVudHNcbiAqIEBwYXJhbSBnZW5lcmF0b3IgLSBmdW5jdGlvbiggaW5kZXg6IHtudW1iZXJ9ICk6eyp9IC0gMC1iYXNlZCBpbmRleCBmb3Igd2hpY2ggXCJzZXBhcmF0b3JcIiBpdCBpcyBmb3IuIGUuZy5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsgXywgZ2VuZXJhdG9yKDApLCBfLCBnZW5lcmF0b3IoMSksIF8sIGdlbmVyYXRvcigyKSwgLi4uLCBfIF1cbiAqIEByZXR1cm5zIC0gVGhlIGludGVybGVhdmVkIGFycmF5XG4gKi9cbmZ1bmN0aW9uIGludGVybGVhdmU8VD4oIGFycjogcmVhZG9ubHkgVFtdLCBnZW5lcmF0b3I6ICggZWxlbWVudDogbnVtYmVyICkgPT4gVCApOiBUW10ge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBhcnIgKSApO1xuXG4gIGNvbnN0IHJlc3VsdCA9IFtdO1xuICBjb25zdCBmaW5hbExlbmd0aCA9IGFyci5sZW5ndGggKiAyIC0gMTtcblxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBmaW5hbExlbmd0aDsgaSsrICkge1xuICAgIGlmICggaSAlIDIgPT09IDAgKSB7XG4gICAgICByZXN1bHQucHVzaCggYXJyWyBpIC8gMiBdICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVzdWx0LnB1c2goIGdlbmVyYXRvciggKCBpIC0gMSApIC8gMiApICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxucGhldENvcmUucmVnaXN0ZXIoICdpbnRlcmxlYXZlJywgaW50ZXJsZWF2ZSApO1xuXG5leHBvcnQgZGVmYXVsdCBpbnRlcmxlYXZlOyJdLCJuYW1lcyI6WyJwaGV0Q29yZSIsImludGVybGVhdmUiLCJhcnIiLCJnZW5lcmF0b3IiLCJhc3NlcnQiLCJBcnJheSIsImlzQXJyYXkiLCJyZXN1bHQiLCJmaW5hbExlbmd0aCIsImxlbmd0aCIsImkiLCJwdXNoIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxjQUFjLGdCQUFnQjtBQUVyQzs7Ozs7Q0FLQyxHQUNELFNBQVNDLFdBQWVDLEdBQWlCLEVBQUVDLFNBQW1DO0lBQzVFQyxVQUFVQSxPQUFRQyxNQUFNQyxPQUFPLENBQUVKO0lBRWpDLE1BQU1LLFNBQVMsRUFBRTtJQUNqQixNQUFNQyxjQUFjTixJQUFJTyxNQUFNLEdBQUcsSUFBSTtJQUVyQyxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUYsYUFBYUUsSUFBTTtRQUN0QyxJQUFLQSxJQUFJLE1BQU0sR0FBSTtZQUNqQkgsT0FBT0ksSUFBSSxDQUFFVCxHQUFHLENBQUVRLElBQUksRUFBRztRQUMzQixPQUNLO1lBQ0hILE9BQU9JLElBQUksQ0FBRVIsVUFBVyxBQUFFTyxDQUFBQSxJQUFJLENBQUEsSUFBTTtRQUN0QztJQUNGO0lBRUEsT0FBT0g7QUFDVDtBQUVBUCxTQUFTWSxRQUFRLENBQUUsY0FBY1g7QUFFakMsZUFBZUEsV0FBVyJ9