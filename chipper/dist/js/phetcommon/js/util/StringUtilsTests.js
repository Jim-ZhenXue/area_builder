// Copyright 2017-2021, University of Colorado Boulder
/**
 * StringUtils tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import StringUtils from './StringUtils.js';
QUnit.module('StringUtils');
QUnit.test('capitalize', (assert)=>{
    assert.equal(StringUtils.capitalize('hello'), 'Hello', 'word should be capitalized');
});
// See https://github.com/phetsims/phetcommon/issues/36
QUnit.test('fillIn', (assert)=>{
    assert.equal(StringUtils.fillIn('no placeholders here', {
        name: 'Fred'
    }), 'no placeholders here', '0 placeholders');
    assert.equal(StringUtils.fillIn('{{name}} is smart', {
        name: 'Fred'
    }), 'Fred is smart', '1 placeholder');
    assert.equal(StringUtils.fillIn('{{name}} is {{age}} years old', {
        name: 'Fred',
        age: 23
    }), 'Fred is 23 years old', '> 1 placeholders');
    assert.equal(StringUtils.fillIn('{{name}} is {{age}} years old', {
        name: 'Fred',
        age: 23,
        height: 60
    }), 'Fred is 23 years old', 'extra value in hash is ignored');
    assert.equal(StringUtils.fillIn('{{name}} is {{age}} years old {really}', {
        name: 'Fred',
        age: 23
    }), 'Fred is 23 years old {really}', 'OK to use curly braces in the string');
    assert.equal(StringUtils.fillIn('{{value}} {{units}}', {
        units: 'm'
    }), '{{value}} m', 'OK to omit a placeholder value');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlsc1Rlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFN0cmluZ1V0aWxzIHRlc3RzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4vU3RyaW5nVXRpbHMuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdTdHJpbmdVdGlscycgKTtcblxuUVVuaXQudGVzdCggJ2NhcGl0YWxpemUnLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQuZXF1YWwoIFN0cmluZ1V0aWxzLmNhcGl0YWxpemUoICdoZWxsbycgKSwgJ0hlbGxvJywgJ3dvcmQgc2hvdWxkIGJlIGNhcGl0YWxpemVkJyApO1xufSApO1xuXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXRjb21tb24vaXNzdWVzLzM2XG5RVW5pdC50ZXN0KCAnZmlsbEluJywgYXNzZXJ0ID0+IHtcblxuICBhc3NlcnQuZXF1YWwoIFN0cmluZ1V0aWxzLmZpbGxJbiggJ25vIHBsYWNlaG9sZGVycyBoZXJlJywgeyBuYW1lOiAnRnJlZCcgfSApLFxuICAgICdubyBwbGFjZWhvbGRlcnMgaGVyZScsICcwIHBsYWNlaG9sZGVycycgKTtcbiAgYXNzZXJ0LmVxdWFsKCBTdHJpbmdVdGlscy5maWxsSW4oICd7e25hbWV9fSBpcyBzbWFydCcsIHsgbmFtZTogJ0ZyZWQnIH0gKSxcbiAgICAnRnJlZCBpcyBzbWFydCcsICcxIHBsYWNlaG9sZGVyJyApO1xuICBhc3NlcnQuZXF1YWwoIFN0cmluZ1V0aWxzLmZpbGxJbiggJ3t7bmFtZX19IGlzIHt7YWdlfX0geWVhcnMgb2xkJywge1xuICAgIG5hbWU6ICdGcmVkJyxcbiAgICBhZ2U6IDIzXG4gIH0gKSwgJ0ZyZWQgaXMgMjMgeWVhcnMgb2xkJywgJz4gMSBwbGFjZWhvbGRlcnMnICk7XG4gIGFzc2VydC5lcXVhbCggU3RyaW5nVXRpbHMuZmlsbEluKCAne3tuYW1lfX0gaXMge3thZ2V9fSB5ZWFycyBvbGQnLCB7XG4gICAgbmFtZTogJ0ZyZWQnLFxuICAgIGFnZTogMjMsXG4gICAgaGVpZ2h0OiA2MFxuICB9ICksICdGcmVkIGlzIDIzIHllYXJzIG9sZCcsICdleHRyYSB2YWx1ZSBpbiBoYXNoIGlzIGlnbm9yZWQnICk7XG4gIGFzc2VydC5lcXVhbCggU3RyaW5nVXRpbHMuZmlsbEluKCAne3tuYW1lfX0gaXMge3thZ2V9fSB5ZWFycyBvbGQge3JlYWxseX0nLCB7XG4gICAgbmFtZTogJ0ZyZWQnLFxuICAgIGFnZTogMjNcbiAgfSApLCAnRnJlZCBpcyAyMyB5ZWFycyBvbGQge3JlYWxseX0nLCAnT0sgdG8gdXNlIGN1cmx5IGJyYWNlcyBpbiB0aGUgc3RyaW5nJyApO1xuICBhc3NlcnQuZXF1YWwoIFN0cmluZ1V0aWxzLmZpbGxJbiggJ3t7dmFsdWV9fSB7e3VuaXRzfX0nLCB7IHVuaXRzOiAnbScgfSApLFxuICAgICd7e3ZhbHVlfX0gbScsICdPSyB0byBvbWl0IGEgcGxhY2Vob2xkZXIgdmFsdWUnICk7XG59ICk7Il0sIm5hbWVzIjpbIlN0cmluZ1V0aWxzIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwiZXF1YWwiLCJjYXBpdGFsaXplIiwiZmlsbEluIiwibmFtZSIsImFnZSIsImhlaWdodCIsInVuaXRzIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxpQkFBaUIsbUJBQW1CO0FBRTNDQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLGNBQWNDLENBQUFBO0lBQ3hCQSxPQUFPQyxLQUFLLENBQUVMLFlBQVlNLFVBQVUsQ0FBRSxVQUFXLFNBQVM7QUFDNUQ7QUFFQSx1REFBdUQ7QUFDdkRMLE1BQU1FLElBQUksQ0FBRSxVQUFVQyxDQUFBQTtJQUVwQkEsT0FBT0MsS0FBSyxDQUFFTCxZQUFZTyxNQUFNLENBQUUsd0JBQXdCO1FBQUVDLE1BQU07SUFBTyxJQUN2RSx3QkFBd0I7SUFDMUJKLE9BQU9DLEtBQUssQ0FBRUwsWUFBWU8sTUFBTSxDQUFFLHFCQUFxQjtRQUFFQyxNQUFNO0lBQU8sSUFDcEUsaUJBQWlCO0lBQ25CSixPQUFPQyxLQUFLLENBQUVMLFlBQVlPLE1BQU0sQ0FBRSxpQ0FBaUM7UUFDakVDLE1BQU07UUFDTkMsS0FBSztJQUNQLElBQUssd0JBQXdCO0lBQzdCTCxPQUFPQyxLQUFLLENBQUVMLFlBQVlPLE1BQU0sQ0FBRSxpQ0FBaUM7UUFDakVDLE1BQU07UUFDTkMsS0FBSztRQUNMQyxRQUFRO0lBQ1YsSUFBSyx3QkFBd0I7SUFDN0JOLE9BQU9DLEtBQUssQ0FBRUwsWUFBWU8sTUFBTSxDQUFFLDBDQUEwQztRQUMxRUMsTUFBTTtRQUNOQyxLQUFLO0lBQ1AsSUFBSyxpQ0FBaUM7SUFDdENMLE9BQU9DLEtBQUssQ0FBRUwsWUFBWU8sTUFBTSxDQUFFLHVCQUF1QjtRQUFFSSxPQUFPO0lBQUksSUFDcEUsZUFBZTtBQUNuQiJ9