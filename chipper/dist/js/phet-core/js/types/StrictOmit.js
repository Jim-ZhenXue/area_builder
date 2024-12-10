// Copyright 2022, University of Colorado Boulder
/**
 * Just like Omit, except it enforces the presence of omitted keys in the original type.
 * i.e.:
 * type X = { hello: number; hola: boolean; };
 * type Y1 = Omit<X, 'goodbye'>; // Wouldn't throw an error
 * type Y2 = StrictOmit<X, 'goodbye'>; // Will throw an error
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */ export { };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBKdXN0IGxpa2UgT21pdCwgZXhjZXB0IGl0IGVuZm9yY2VzIHRoZSBwcmVzZW5jZSBvZiBvbWl0dGVkIGtleXMgaW4gdGhlIG9yaWdpbmFsIHR5cGUuXG4gKiBpLmUuOlxuICogdHlwZSBYID0geyBoZWxsbzogbnVtYmVyOyBob2xhOiBib29sZWFuOyB9O1xuICogdHlwZSBZMSA9IE9taXQ8WCwgJ2dvb2RieWUnPjsgLy8gV291bGRuJ3QgdGhyb3cgYW4gZXJyb3JcbiAqIHR5cGUgWTIgPSBTdHJpY3RPbWl0PFgsICdnb29kYnllJz47IC8vIFdpbGwgdGhyb3cgYW4gZXJyb3JcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEFndXN0w61uIFZhbGxlam8gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxudHlwZSBTdHJpY3RPbWl0PE9iamVjdFR5cGUsIEtleXNUeXBlIGV4dGVuZHMga2V5b2YgT2JqZWN0VHlwZT4gPSBQaWNrPE9iamVjdFR5cGUsIEV4Y2x1ZGU8a2V5b2YgT2JqZWN0VHlwZSwgS2V5c1R5cGU+PjtcbmV4cG9ydCBkZWZhdWx0IFN0cmljdE9taXQ7Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7O0NBU0MsR0FHRCxXQUEwQiJ9