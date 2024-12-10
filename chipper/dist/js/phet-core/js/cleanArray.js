// Copyright 2014-2023, University of Colorado Boulder
/**
 * If given an Array, removes all of its elements and returns it. Otherwise, if given a falsy value
 * (null/undefined/etc.), it will create and return a fresh Array.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
function cleanArray(arr) {
    assert && assert(!arr || Array.isArray(arr), 'cleanArray either takes an Array');
    if (arr) {
        // fastest way to clear an array (http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript, http://jsperf.com/array-destroy/32)
        // also, better than length=0, since it doesn't create significant garbage collection (like length=0), tested on Chrome 34.
        while(arr.length){
            arr.pop();
        }
        return arr;
    } else {
        return [];
    }
}
phetCore.register('cleanArray', cleanArray);
export default cleanArray;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIElmIGdpdmVuIGFuIEFycmF5LCByZW1vdmVzIGFsbCBvZiBpdHMgZWxlbWVudHMgYW5kIHJldHVybnMgaXQuIE90aGVyd2lzZSwgaWYgZ2l2ZW4gYSBmYWxzeSB2YWx1ZVxuICogKG51bGwvdW5kZWZpbmVkL2V0Yy4pLCBpdCB3aWxsIGNyZWF0ZSBhbmQgcmV0dXJuIGEgZnJlc2ggQXJyYXkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcblxuZnVuY3Rpb24gY2xlYW5BcnJheTxUPiggYXJyPzogVFtdIHwgbnVsbCB8IHVuZGVmaW5lZCApOiBUW10ge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCAhYXJyIHx8ICggQXJyYXkuaXNBcnJheSggYXJyICkgKSwgJ2NsZWFuQXJyYXkgZWl0aGVyIHRha2VzIGFuIEFycmF5JyApO1xuXG4gIGlmICggYXJyICkge1xuICAgIC8vIGZhc3Rlc3Qgd2F5IHRvIGNsZWFyIGFuIGFycmF5IChodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyMzIwNDAvaG93LXRvLWVtcHR5LWFuLWFycmF5LWluLWphdmFzY3JpcHQsIGh0dHA6Ly9qc3BlcmYuY29tL2FycmF5LWRlc3Ryb3kvMzIpXG4gICAgLy8gYWxzbywgYmV0dGVyIHRoYW4gbGVuZ3RoPTAsIHNpbmNlIGl0IGRvZXNuJ3QgY3JlYXRlIHNpZ25pZmljYW50IGdhcmJhZ2UgY29sbGVjdGlvbiAobGlrZSBsZW5ndGg9MCksIHRlc3RlZCBvbiBDaHJvbWUgMzQuXG4gICAgd2hpbGUgKCBhcnIubGVuZ3RoICkge1xuICAgICAgYXJyLnBvcCgpO1xuICAgIH1cbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5waGV0Q29yZS5yZWdpc3RlciggJ2NsZWFuQXJyYXknLCBjbGVhbkFycmF5ICk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsZWFuQXJyYXk7Il0sIm5hbWVzIjpbInBoZXRDb3JlIiwiY2xlYW5BcnJheSIsImFyciIsImFzc2VydCIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsInBvcCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxjQUFjLGdCQUFnQjtBQUVyQyxTQUFTQyxXQUFlQyxHQUE0QjtJQUNsREMsVUFBVUEsT0FBUSxDQUFDRCxPQUFTRSxNQUFNQyxPQUFPLENBQUVILE1BQVM7SUFFcEQsSUFBS0EsS0FBTTtRQUNULHFKQUFxSjtRQUNySiwySEFBMkg7UUFDM0gsTUFBUUEsSUFBSUksTUFBTSxDQUFHO1lBQ25CSixJQUFJSyxHQUFHO1FBQ1Q7UUFDQSxPQUFPTDtJQUNULE9BQ0s7UUFDSCxPQUFPLEVBQUU7SUFDWDtBQUNGO0FBRUFGLFNBQVNRLFFBQVEsQ0FBRSxjQUFjUDtBQUVqQyxlQUFlQSxXQUFXIn0=