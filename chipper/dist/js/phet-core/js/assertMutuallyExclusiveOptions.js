// Copyright 2019-2023, University of Colorado Boulder
/**
 * Throws an assertion error if mutually exclusive options are specified.
 *
 * @example
 * assertMutuallyExclusiveOptions( { tree:1, flower:2 }, [ 'tree' ], [ 'flower' ] ) => error
 * assertMutuallyExclusiveOptions( { flower:2 }, [ 'tree' ], [ 'flower' ] ) => no error
 * assertMutuallyExclusiveOptions( { tree:1 }, [ 'tree' ], [ 'flower' ] ) => no error
 * assertMutuallyExclusiveOptions( { tree:1, mountain:2 }, [ 'tree', 'mountain' ], [ 'flower' ] ) => no error
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import phetCore from './phetCore.js';
/**
 * @param options - an options object.  Could be before or after merge, and may therefore
 *                                        - be null or undefined
 * @param sets - families of mutually exclusive option keys, see examples above.
 */ const assertMutuallyExclusiveOptions = function(options, ...sets) {
    if (assert && options) {
        // Determine which options are used from each set
        const usedElementsFromEachSet = sets.map((set)=>Object.keys(_.pick(options, ...set)));
        // If any element is used from more than one set...
        if (usedElementsFromEachSet.filter((usedElements)=>usedElements.length > 0).length > 1) {
            // Output the errant options.
            assert && assert(false, `Cannot simultaneously specify ${usedElementsFromEachSet.join(' and ')}`);
        }
    }
};
phetCore.register('assertMutuallyExclusiveOptions', assertMutuallyExclusiveOptions);
export default assertMutuallyExclusiveOptions;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpZiBtdXR1YWxseSBleGNsdXNpdmUgb3B0aW9ucyBhcmUgc3BlY2lmaWVkLlxuICpcbiAqIEBleGFtcGxlXG4gKiBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHsgdHJlZToxLCBmbG93ZXI6MiB9LCBbICd0cmVlJyBdLCBbICdmbG93ZXInIF0gKSA9PiBlcnJvclxuICogYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCB7IGZsb3dlcjoyIH0sIFsgJ3RyZWUnIF0sIFsgJ2Zsb3dlcicgXSApID0+IG5vIGVycm9yXG4gKiBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHsgdHJlZToxIH0sIFsgJ3RyZWUnIF0sIFsgJ2Zsb3dlcicgXSApID0+IG5vIGVycm9yXG4gKiBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHsgdHJlZToxLCBtb3VudGFpbjoyIH0sIFsgJ3RyZWUnLCAnbW91bnRhaW4nIF0sIFsgJ2Zsb3dlcicgXSApID0+IG5vIGVycm9yXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XG5cbi8qKlxuICogQHBhcmFtIG9wdGlvbnMgLSBhbiBvcHRpb25zIG9iamVjdC4gIENvdWxkIGJlIGJlZm9yZSBvciBhZnRlciBtZXJnZSwgYW5kIG1heSB0aGVyZWZvcmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gYmUgbnVsbCBvciB1bmRlZmluZWRcbiAqIEBwYXJhbSBzZXRzIC0gZmFtaWxpZXMgb2YgbXV0dWFsbHkgZXhjbHVzaXZlIG9wdGlvbiBrZXlzLCBzZWUgZXhhbXBsZXMgYWJvdmUuXG4gKi9cbmNvbnN0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyA9IGZ1bmN0aW9uKCBvcHRpb25zOiBvYmplY3QgfCBudWxsIHwgdW5kZWZpbmVkLCAuLi5zZXRzOiBzdHJpbmdbXVtdICk6IHZvaWQge1xuICBpZiAoIGFzc2VydCAmJiBvcHRpb25zICkge1xuXG4gICAgLy8gRGV0ZXJtaW5lIHdoaWNoIG9wdGlvbnMgYXJlIHVzZWQgZnJvbSBlYWNoIHNldFxuICAgIGNvbnN0IHVzZWRFbGVtZW50c0Zyb21FYWNoU2V0ID0gc2V0cy5tYXAoIHNldCA9PiBPYmplY3Qua2V5cyggXy5waWNrKCBvcHRpb25zLCAuLi5zZXQgKSApICk7XG5cbiAgICAvLyBJZiBhbnkgZWxlbWVudCBpcyB1c2VkIGZyb20gbW9yZSB0aGFuIG9uZSBzZXQuLi5cbiAgICBpZiAoIHVzZWRFbGVtZW50c0Zyb21FYWNoU2V0LmZpbHRlciggdXNlZEVsZW1lbnRzID0+IHVzZWRFbGVtZW50cy5sZW5ndGggPiAwICkubGVuZ3RoID4gMSApIHtcblxuICAgICAgLy8gT3V0cHV0IHRoZSBlcnJhbnQgb3B0aW9ucy5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCBgQ2Fubm90IHNpbXVsdGFuZW91c2x5IHNwZWNpZnkgJHt1c2VkRWxlbWVudHNGcm9tRWFjaFNldC5qb2luKCAnIGFuZCAnICl9YCApO1xuICAgIH1cbiAgfVxufTtcblxucGhldENvcmUucmVnaXN0ZXIoICdhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMnLCBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMgKTtcbmV4cG9ydCBkZWZhdWx0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9uczsiXSwibmFtZXMiOlsicGhldENvcmUiLCJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJvcHRpb25zIiwic2V0cyIsImFzc2VydCIsInVzZWRFbGVtZW50c0Zyb21FYWNoU2V0IiwibWFwIiwic2V0IiwiT2JqZWN0Iiwia2V5cyIsIl8iLCJwaWNrIiwiZmlsdGVyIiwidXNlZEVsZW1lbnRzIiwibGVuZ3RoIiwiam9pbiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Q0FVQyxHQUVELE9BQU9BLGNBQWMsZ0JBQWdCO0FBRXJDOzs7O0NBSUMsR0FDRCxNQUFNQyxpQ0FBaUMsU0FBVUMsT0FBa0MsRUFBRSxHQUFHQyxJQUFnQjtJQUN0RyxJQUFLQyxVQUFVRixTQUFVO1FBRXZCLGlEQUFpRDtRQUNqRCxNQUFNRywwQkFBMEJGLEtBQUtHLEdBQUcsQ0FBRUMsQ0FBQUEsTUFBT0MsT0FBT0MsSUFBSSxDQUFFQyxFQUFFQyxJQUFJLENBQUVULFlBQVlLO1FBRWxGLG1EQUFtRDtRQUNuRCxJQUFLRix3QkFBd0JPLE1BQU0sQ0FBRUMsQ0FBQUEsZUFBZ0JBLGFBQWFDLE1BQU0sR0FBRyxHQUFJQSxNQUFNLEdBQUcsR0FBSTtZQUUxRiw2QkFBNkI7WUFDN0JWLFVBQVVBLE9BQVEsT0FBTyxDQUFDLDhCQUE4QixFQUFFQyx3QkFBd0JVLElBQUksQ0FBRSxVQUFXO1FBQ3JHO0lBQ0Y7QUFDRjtBQUVBZixTQUFTZ0IsUUFBUSxDQUFFLGtDQUFrQ2Y7QUFDckQsZUFBZUEsK0JBQStCIn0=