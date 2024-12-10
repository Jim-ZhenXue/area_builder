// Copyright 2013-2023, University of Colorado Boulder
/**
 * Creates an array of results from an iterator that takes a callback.
 *
 * For instance, if calling a function f( g ) will call g( 1 ), g( 2 ), and g( 3 ),
 * collect( function( callback ) { f( callback ); } );
 * will return [1,2,3].
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
function collect(iterate) {
    const result = [];
    iterate((ob)=>{
        result.push(ob);
    });
    return result;
}
phetCore.register('collect', collect);
export default collect;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jb2xsZWN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgcmVzdWx0cyBmcm9tIGFuIGl0ZXJhdG9yIHRoYXQgdGFrZXMgYSBjYWxsYmFjay5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIGNhbGxpbmcgYSBmdW5jdGlvbiBmKCBnICkgd2lsbCBjYWxsIGcoIDEgKSwgZyggMiApLCBhbmQgZyggMyApLFxuICogY29sbGVjdCggZnVuY3Rpb24oIGNhbGxiYWNrICkgeyBmKCBjYWxsYmFjayApOyB9ICk7XG4gKiB3aWxsIHJldHVybiBbMSwyLDNdLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XG5cbmZ1bmN0aW9uIGNvbGxlY3Q8VD4oIGl0ZXJhdGU6ICggZnVuYzogKCBpdGVtOiBUICkgPT4gdm9pZCApID0+IHZvaWQgKTogVFtdIHtcbiAgY29uc3QgcmVzdWx0OiBUW10gPSBbXTtcbiAgaXRlcmF0ZSggb2IgPT4ge1xuICAgIHJlc3VsdC5wdXNoKCBvYiApO1xuICB9ICk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnBoZXRDb3JlLnJlZ2lzdGVyKCAnY29sbGVjdCcsIGNvbGxlY3QgKTtcblxuZXhwb3J0IGRlZmF1bHQgY29sbGVjdDsiXSwibmFtZXMiOlsicGhldENvcmUiLCJjb2xsZWN0IiwiaXRlcmF0ZSIsInJlc3VsdCIsIm9iIiwicHVzaCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7O0NBUUMsR0FFRCxPQUFPQSxjQUFjLGdCQUFnQjtBQUVyQyxTQUFTQyxRQUFZQyxPQUE4QztJQUNqRSxNQUFNQyxTQUFjLEVBQUU7SUFDdEJELFFBQVNFLENBQUFBO1FBQ1BELE9BQU9FLElBQUksQ0FBRUQ7SUFDZjtJQUNBLE9BQU9EO0FBQ1Q7QUFFQUgsU0FBU00sUUFBUSxDQUFFLFdBQVdMO0FBRTlCLGVBQWVBLFFBQVEifQ==