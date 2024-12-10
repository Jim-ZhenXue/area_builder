// Copyright 2017-2023, University of Colorado Boulder
/**
 * pairs tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import pairs from './pairs.js';
QUnit.module('pairs');
QUnit.test('pairs', (assert)=>{
    assert.equal(pairs([]).length, 0);
    assert.equal(pairs([
        'a'
    ]).length, 0);
    assert.equal(pairs([
        'a',
        'b'
    ]).length, 1);
    assert.equal(pairs([
        'a',
        'b',
        'c'
    ]).length, 3);
    assert.equal(pairs([
        'a',
        'b',
        'c'
    ])[0][0], 'a');
    assert.equal(pairs([
        'a',
        'b',
        'c'
    ])[0][1], 'b');
    assert.equal(pairs([
        'a',
        'b',
        'c'
    ])[1][0], 'a');
    assert.equal(pairs([
        'a',
        'b',
        'c'
    ])[1][1], 'c');
    assert.equal(pairs([
        'a',
        'b',
        'c'
    ])[2][0], 'b');
    assert.equal(pairs([
        'a',
        'b',
        'c'
    ])[2][1], 'c');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wYWlyc1Rlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIHBhaXJzIHRlc3RzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHBhaXJzIGZyb20gJy4vcGFpcnMuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdwYWlycycgKTtcblxuUVVuaXQudGVzdCggJ3BhaXJzJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LmVxdWFsKCBwYWlycyggW10gKS5sZW5ndGgsIDAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBwYWlycyggWyAnYScgXSApLmxlbmd0aCwgMCApO1xuICBhc3NlcnQuZXF1YWwoIHBhaXJzKCBbICdhJywgJ2InIF0gKS5sZW5ndGgsIDEgKTtcbiAgYXNzZXJ0LmVxdWFsKCBwYWlycyggWyAnYScsICdiJywgJ2MnIF0gKS5sZW5ndGgsIDMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBwYWlycyggWyAnYScsICdiJywgJ2MnIF0gKVsgMCBdWyAwIF0sICdhJyApO1xuICBhc3NlcnQuZXF1YWwoIHBhaXJzKCBbICdhJywgJ2InLCAnYycgXSApWyAwIF1bIDEgXSwgJ2InICk7XG4gIGFzc2VydC5lcXVhbCggcGFpcnMoIFsgJ2EnLCAnYicsICdjJyBdIClbIDEgXVsgMCBdLCAnYScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBwYWlycyggWyAnYScsICdiJywgJ2MnIF0gKVsgMSBdWyAxIF0sICdjJyApO1xuICBhc3NlcnQuZXF1YWwoIHBhaXJzKCBbICdhJywgJ2InLCAnYycgXSApWyAyIF1bIDAgXSwgJ2InICk7XG4gIGFzc2VydC5lcXVhbCggcGFpcnMoIFsgJ2EnLCAnYicsICdjJyBdIClbIDIgXVsgMSBdLCAnYycgKTtcbn0gKTsiXSwibmFtZXMiOlsicGFpcnMiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJlcXVhbCIsImxlbmd0aCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsV0FBVyxhQUFhO0FBRS9CQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLFNBQVNDLENBQUFBO0lBQ25CQSxPQUFPQyxLQUFLLENBQUVMLE1BQU8sRUFBRSxFQUFHTSxNQUFNLEVBQUU7SUFDbENGLE9BQU9DLEtBQUssQ0FBRUwsTUFBTztRQUFFO0tBQUssRUFBR00sTUFBTSxFQUFFO0lBQ3ZDRixPQUFPQyxLQUFLLENBQUVMLE1BQU87UUFBRTtRQUFLO0tBQUssRUFBR00sTUFBTSxFQUFFO0lBQzVDRixPQUFPQyxLQUFLLENBQUVMLE1BQU87UUFBRTtRQUFLO1FBQUs7S0FBSyxFQUFHTSxNQUFNLEVBQUU7SUFDakRGLE9BQU9DLEtBQUssQ0FBRUwsTUFBTztRQUFFO1FBQUs7UUFBSztLQUFLLENBQUUsQ0FBRSxFQUFHLENBQUUsRUFBRyxFQUFFO0lBQ3BESSxPQUFPQyxLQUFLLENBQUVMLE1BQU87UUFBRTtRQUFLO1FBQUs7S0FBSyxDQUFFLENBQUUsRUFBRyxDQUFFLEVBQUcsRUFBRTtJQUNwREksT0FBT0MsS0FBSyxDQUFFTCxNQUFPO1FBQUU7UUFBSztRQUFLO0tBQUssQ0FBRSxDQUFFLEVBQUcsQ0FBRSxFQUFHLEVBQUU7SUFDcERJLE9BQU9DLEtBQUssQ0FBRUwsTUFBTztRQUFFO1FBQUs7UUFBSztLQUFLLENBQUUsQ0FBRSxFQUFHLENBQUUsRUFBRyxFQUFFO0lBQ3BESSxPQUFPQyxLQUFLLENBQUVMLE1BQU87UUFBRTtRQUFLO1FBQUs7S0FBSyxDQUFFLENBQUUsRUFBRyxDQUFFLEVBQUcsRUFBRTtJQUNwREksT0FBT0MsS0FBSyxDQUFFTCxNQUFPO1FBQUU7UUFBSztRQUFLO0tBQUssQ0FBRSxDQUFFLEVBQUcsQ0FBRSxFQUFHLEVBQUU7QUFDdEQifQ==