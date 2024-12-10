// Copyright 2022-2024, University of Colorado Boulder
/**
 * Converts either an entire object (or a subset of keys of it) into non-null forms.
 *
 * type T = {
 *   a: number | null;
 *   b: string | number[] | null;
 *   c: { x: number; };
 * };
 * type X = WithoutNull<T>; // { a: number, b: string | number[], c: { x: 5 } }
 * type Y = WithoutNull<T, 'a'>; // { a: number, b: string | number[] | null, c: { x: 5 } }
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ export { };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9XaXRob3V0TnVsbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb252ZXJ0cyBlaXRoZXIgYW4gZW50aXJlIG9iamVjdCAob3IgYSBzdWJzZXQgb2Yga2V5cyBvZiBpdCkgaW50byBub24tbnVsbCBmb3Jtcy5cbiAqXG4gKiB0eXBlIFQgPSB7XG4gKiAgIGE6IG51bWJlciB8IG51bGw7XG4gKiAgIGI6IHN0cmluZyB8IG51bWJlcltdIHwgbnVsbDtcbiAqICAgYzogeyB4OiBudW1iZXI7IH07XG4gKiB9O1xuICogdHlwZSBYID0gV2l0aG91dE51bGw8VD47IC8vIHsgYTogbnVtYmVyLCBiOiBzdHJpbmcgfCBudW1iZXJbXSwgYzogeyB4OiA1IH0gfVxuICogdHlwZSBZID0gV2l0aG91dE51bGw8VCwgJ2EnPjsgLy8geyBhOiBudW1iZXIsIGI6IHN0cmluZyB8IG51bWJlcltdIHwgbnVsbCwgYzogeyB4OiA1IH0gfVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgTm90TnVsbCBmcm9tICcuL05vdE51bGwuanMnO1xuXG50eXBlIFdpdGhvdXROdWxsPFQgZXh0ZW5kcyBvYmplY3QsIGtleXMgZXh0ZW5kcyBrZXlvZiBUID0ga2V5b2YgVD4gPSBUICYgeyBba2V5IGluIGtleXNdOiBOb3ROdWxsPFRbIGtleSBdPiB9O1xuZXhwb3J0IGRlZmF1bHQgV2l0aG91dE51bGw7Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7O0NBWUMsR0FLRCxXQUEyQiJ9