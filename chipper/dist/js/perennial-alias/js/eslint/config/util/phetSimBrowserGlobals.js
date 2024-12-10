// Copyright 2024, University of Colorado Boulder
/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ export const phetSimBrowserGlobalsObject = {
    //=============================================================================================
    // globals that should never be accessed
    //=============================================================================================
    // Using `event` is most likely a bug, instead the event should be passed through via a parameter, discovered in
    // https://github.com/phetsims/scenery/issues/1053. Alternatively, if you must use `event`, you can refer to
    // window.event or disable the lint rule with an override or directive.
    event: 'off',
    //=============================================================================================
    // read-only globals
    //=============================================================================================
    phet: 'readonly',
    phetio: 'readonly',
    assert: 'readonly',
    assertSlow: 'readonly',
    QueryStringMachine: 'readonly',
    Fluent: 'readonly',
    _: 'readonly',
    $: 'readonly' // jQuery
};
const phetSimBrowserGlobals = {
    languageOptions: {
        globals: phetSimBrowserGlobalsObject
    }
};
export default phetSimBrowserGlobals;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL3V0aWwvcGhldFNpbUJyb3dzZXJHbG9iYWxzLm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuZXhwb3J0IGNvbnN0IHBoZXRTaW1Ccm93c2VyR2xvYmFsc09iamVjdCA9IHtcblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBnbG9iYWxzIHRoYXQgc2hvdWxkIG5ldmVyIGJlIGFjY2Vzc2VkXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgLy8gVXNpbmcgYGV2ZW50YCBpcyBtb3N0IGxpa2VseSBhIGJ1ZywgaW5zdGVhZCB0aGUgZXZlbnQgc2hvdWxkIGJlIHBhc3NlZCB0aHJvdWdoIHZpYSBhIHBhcmFtZXRlciwgZGlzY292ZXJlZCBpblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTA1My4gQWx0ZXJuYXRpdmVseSwgaWYgeW91IG11c3QgdXNlIGBldmVudGAsIHlvdSBjYW4gcmVmZXIgdG9cbiAgLy8gd2luZG93LmV2ZW50IG9yIGRpc2FibGUgdGhlIGxpbnQgcnVsZSB3aXRoIGFuIG92ZXJyaWRlIG9yIGRpcmVjdGl2ZS5cbiAgZXZlbnQ6ICdvZmYnLFxuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIHJlYWQtb25seSBnbG9iYWxzXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgcGhldDogJ3JlYWRvbmx5JyxcbiAgcGhldGlvOiAncmVhZG9ubHknLFxuICBhc3NlcnQ6ICdyZWFkb25seScsIC8vIGFsbG93IGFzc2VydGlvbnNcbiAgYXNzZXJ0U2xvdzogJ3JlYWRvbmx5JywgLy8gYWxsb3cgc2xvdyBhc3NlcnRpb25zXG4gIFF1ZXJ5U3RyaW5nTWFjaGluZTogJ3JlYWRvbmx5JyxcbiAgRmx1ZW50OiAncmVhZG9ubHknLFxuXG4gIF86ICdyZWFkb25seScsIC8vIHVuZGVyc2NvcmUsIGxvZGFzaFxuICAkOiAncmVhZG9ubHknIC8vIGpRdWVyeVxufTtcblxuY29uc3QgcGhldFNpbUJyb3dzZXJHbG9iYWxzID0ge1xuICBsYW5ndWFnZU9wdGlvbnM6IHtcbiAgICBnbG9iYWxzOiBwaGV0U2ltQnJvd3Nlckdsb2JhbHNPYmplY3RcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcGhldFNpbUJyb3dzZXJHbG9iYWxzOyJdLCJuYW1lcyI6WyJwaGV0U2ltQnJvd3Nlckdsb2JhbHNPYmplY3QiLCJldmVudCIsInBoZXQiLCJwaGV0aW8iLCJhc3NlcnQiLCJhc3NlcnRTbG93IiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiRmx1ZW50IiwiXyIsIiQiLCJwaGV0U2ltQnJvd3Nlckdsb2JhbHMiLCJsYW5ndWFnZU9wdGlvbnMiLCJnbG9iYWxzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7OztDQUdDLEdBQ0QsT0FBTyxNQUFNQSw4QkFBOEI7SUFFekMsK0ZBQStGO0lBQy9GLHdDQUF3QztJQUN4QywrRkFBK0Y7SUFFL0YsZ0hBQWdIO0lBQ2hILDRHQUE0RztJQUM1Ryx1RUFBdUU7SUFDdkVDLE9BQU87SUFFUCwrRkFBK0Y7SUFDL0Ysb0JBQW9CO0lBQ3BCLCtGQUErRjtJQUUvRkMsTUFBTTtJQUNOQyxRQUFRO0lBQ1JDLFFBQVE7SUFDUkMsWUFBWTtJQUNaQyxvQkFBb0I7SUFDcEJDLFFBQVE7SUFFUkMsR0FBRztJQUNIQyxHQUFHLFdBQVcsU0FBUztBQUN6QixFQUFFO0FBRUYsTUFBTUMsd0JBQXdCO0lBQzVCQyxpQkFBaUI7UUFDZkMsU0FBU1o7SUFDWDtBQUNGO0FBRUEsZUFBZVUsc0JBQXNCIn0=