// Copyright 2022-2023, University of Colorado Boulder
/**
 * Use PickRequired to pick properties of a type T and make them required.
 * This is useful when picking superclass options that you want to expose in a subclass API.
 * It makes life a little easier because you have to fiddle with fewer '<' and '>' characters.
 *
 * Example:
 * type MyClassOptions = PickRequired<PhetioObjectOptions, 'tandem' | 'phetioDocumentation'>;
 * Result:
 * { tandem: Tandem, phetioDocumentation: string }
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ export { };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVXNlIFBpY2tSZXF1aXJlZCB0byBwaWNrIHByb3BlcnRpZXMgb2YgYSB0eXBlIFQgYW5kIG1ha2UgdGhlbSByZXF1aXJlZC5cbiAqIFRoaXMgaXMgdXNlZnVsIHdoZW4gcGlja2luZyBzdXBlcmNsYXNzIG9wdGlvbnMgdGhhdCB5b3Ugd2FudCB0byBleHBvc2UgaW4gYSBzdWJjbGFzcyBBUEkuXG4gKiBJdCBtYWtlcyBsaWZlIGEgbGl0dGxlIGVhc2llciBiZWNhdXNlIHlvdSBoYXZlIHRvIGZpZGRsZSB3aXRoIGZld2VyICc8JyBhbmQgJz4nIGNoYXJhY3RlcnMuXG4gKlxuICogRXhhbXBsZTpcbiAqIHR5cGUgTXlDbGFzc09wdGlvbnMgPSBQaWNrUmVxdWlyZWQ8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbScgfCAncGhldGlvRG9jdW1lbnRhdGlvbic+O1xuICogUmVzdWx0OlxuICogeyB0YW5kZW06IFRhbmRlbSwgcGhldGlvRG9jdW1lbnRhdGlvbjogc3RyaW5nIH1cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbnR5cGUgUGlja1JlcXVpcmVkPFQsIGxpc3QgZXh0ZW5kcyBrZXlvZiBUPiA9IFBpY2s8UmVxdWlyZWQ8VD4sIGxpc3Q+O1xuZXhwb3J0IGRlZmF1bHQgUGlja1JlcXVpcmVkOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FHRCxXQUE0QiJ9