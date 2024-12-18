// Copyright 2018-2020, University of Colorado Boulder
/**
 * Font tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Font from './Font.js';
QUnit.module('Font');
QUnit.test('Font.fromCSS', (assert)=>{
    const font1 = Font.fromCSS('italic 1.2em "Fira Sans", sans-serif');
    assert.equal(font1.style, 'italic');
    assert.equal(font1.size, '1.2em');
    assert.equal(font1.family, '"Fira Sans", sans-serif');
    const font2 = Font.fromCSS('italic small-caps bold 16px/2 cursive');
    assert.equal(font2.style, 'italic');
    assert.equal(font2.variant, 'small-caps');
    assert.equal(font2.weight, 'bold');
    assert.equal(font2.size, '16px');
    assert.equal(font2.lineHeight, '2');
    assert.equal(font2.family, 'cursive');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9Gb250VGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRm9udCB0ZXN0c1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgRm9udCBmcm9tICcuL0ZvbnQuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdGb250JyApO1xuXG5RVW5pdC50ZXN0KCAnRm9udC5mcm9tQ1NTJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgZm9udDEgPSBGb250LmZyb21DU1MoICdpdGFsaWMgMS4yZW0gXCJGaXJhIFNhbnNcIiwgc2Fucy1zZXJpZicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmb250MS5zdHlsZSwgJ2l0YWxpYycgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmb250MS5zaXplLCAnMS4yZW0nICk7XG4gIGFzc2VydC5lcXVhbCggZm9udDEuZmFtaWx5LCAnXCJGaXJhIFNhbnNcIiwgc2Fucy1zZXJpZicgKTtcblxuICBjb25zdCBmb250MiA9IEZvbnQuZnJvbUNTUyggJ2l0YWxpYyBzbWFsbC1jYXBzIGJvbGQgMTZweC8yIGN1cnNpdmUnICk7XG4gIGFzc2VydC5lcXVhbCggZm9udDIuc3R5bGUsICdpdGFsaWMnICk7XG4gIGFzc2VydC5lcXVhbCggZm9udDIudmFyaWFudCwgJ3NtYWxsLWNhcHMnICk7XG4gIGFzc2VydC5lcXVhbCggZm9udDIud2VpZ2h0LCAnYm9sZCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmb250Mi5zaXplLCAnMTZweCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmb250Mi5saW5lSGVpZ2h0LCAnMicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmb250Mi5mYW1pbHksICdjdXJzaXZlJyApO1xufSApOyJdLCJuYW1lcyI6WyJGb250IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwiZm9udDEiLCJmcm9tQ1NTIiwiZXF1YWwiLCJzdHlsZSIsInNpemUiLCJmYW1pbHkiLCJmb250MiIsInZhcmlhbnQiLCJ3ZWlnaHQiLCJsaW5lSGVpZ2h0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFVBQVUsWUFBWTtBQUU3QkMsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSxnQkFBZ0JDLENBQUFBO0lBQzFCLE1BQU1DLFFBQVFMLEtBQUtNLE9BQU8sQ0FBRTtJQUM1QkYsT0FBT0csS0FBSyxDQUFFRixNQUFNRyxLQUFLLEVBQUU7SUFDM0JKLE9BQU9HLEtBQUssQ0FBRUYsTUFBTUksSUFBSSxFQUFFO0lBQzFCTCxPQUFPRyxLQUFLLENBQUVGLE1BQU1LLE1BQU0sRUFBRTtJQUU1QixNQUFNQyxRQUFRWCxLQUFLTSxPQUFPLENBQUU7SUFDNUJGLE9BQU9HLEtBQUssQ0FBRUksTUFBTUgsS0FBSyxFQUFFO0lBQzNCSixPQUFPRyxLQUFLLENBQUVJLE1BQU1DLE9BQU8sRUFBRTtJQUM3QlIsT0FBT0csS0FBSyxDQUFFSSxNQUFNRSxNQUFNLEVBQUU7SUFDNUJULE9BQU9HLEtBQUssQ0FBRUksTUFBTUYsSUFBSSxFQUFFO0lBQzFCTCxPQUFPRyxLQUFLLENBQUVJLE1BQU1HLFVBQVUsRUFBRTtJQUNoQ1YsT0FBT0csS0FBSyxDQUFFSSxNQUFNRCxNQUFNLEVBQUU7QUFDOUIifQ==