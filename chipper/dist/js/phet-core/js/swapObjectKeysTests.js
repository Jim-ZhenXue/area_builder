// Copyright 2019-2023, University of Colorado Boulder
/**
 * swapObjectKeys tests
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import swapObjectKeys from './swapObjectKeys.js';
QUnit.module('swapObjectKeys');
QUnit.test('swapObjectKeys', (assert)=>{
    let object = {
        x: 3,
        y: 4
    };
    swapObjectKeys(object, 'x', 'y');
    assert.ok(object.x === 4);
    assert.ok(object.y === 3);
    object = {
        x: 3,
        y: undefined
    };
    swapObjectKeys(object, 'x', 'y');
    assert.ok(object.x === undefined);
    assert.ok(object.hasOwnProperty('x'));
    assert.ok(object.y === 3);
    object = {
        x: 3,
        y: new RegExp('matchOnThis')
    };
    const regex = object.y; // store the reference
    swapObjectKeys(object, 'x', 'y');
    assert.ok(object.x === regex, 'reference to object');
    assert.ok(object.y === 3, 'reference to primitive');
    object = {
        x: 4
    };
    swapObjectKeys(object, 'x', 'y');
    assert.ok(object.y === 4);
    assert.ok(!Object.hasOwnProperty('x'));
    object = {
        otherStuff: 'hi'
    };
    swapObjectKeys(object, 'x', 'y');
    assert.ok(object.otherStuff === 'hi');
    assert.ok(!Object.hasOwnProperty('x'));
    assert.ok(!Object.hasOwnProperty('y'));
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9zd2FwT2JqZWN0S2V5c1Rlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIHN3YXBPYmplY3RLZXlzIHRlc3RzXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBzd2FwT2JqZWN0S2V5cyBmcm9tICcuL3N3YXBPYmplY3RLZXlzLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcblxuUVVuaXQubW9kdWxlKCAnc3dhcE9iamVjdEtleXMnICk7XG5cblFVbml0LnRlc3QoICdzd2FwT2JqZWN0S2V5cycsIGFzc2VydCA9PiB7XG4gIGxldCBvYmplY3Q6IFJlY29yZDxzdHJpbmcsIEludGVudGlvbmFsQW55PiA9IHsgeDogMywgeTogNCB9O1xuICBzd2FwT2JqZWN0S2V5cyggb2JqZWN0LCAneCcsICd5JyApO1xuICBhc3NlcnQub2soIG9iamVjdC54ID09PSA0ICk7XG4gIGFzc2VydC5vayggb2JqZWN0LnkgPT09IDMgKTtcblxuICBvYmplY3QgPSB7IHg6IDMsIHk6IHVuZGVmaW5lZCB9O1xuICBzd2FwT2JqZWN0S2V5cyggb2JqZWN0LCAneCcsICd5JyApO1xuICBhc3NlcnQub2soIG9iamVjdC54ID09PSB1bmRlZmluZWQgKTtcbiAgYXNzZXJ0Lm9rKCBvYmplY3QuaGFzT3duUHJvcGVydHkoICd4JyApICk7XG4gIGFzc2VydC5vayggb2JqZWN0LnkgPT09IDMgKTtcblxuICBvYmplY3QgPSB7IHg6IDMsIHk6IG5ldyBSZWdFeHAoICdtYXRjaE9uVGhpcycgKSB9O1xuICBjb25zdCByZWdleCA9IG9iamVjdC55OyAvLyBzdG9yZSB0aGUgcmVmZXJlbmNlXG4gIHN3YXBPYmplY3RLZXlzKCBvYmplY3QsICd4JywgJ3knICk7XG4gIGFzc2VydC5vayggb2JqZWN0LnggPT09IHJlZ2V4LCAncmVmZXJlbmNlIHRvIG9iamVjdCcgKTtcbiAgYXNzZXJ0Lm9rKCBvYmplY3QueSA9PT0gMywgJ3JlZmVyZW5jZSB0byBwcmltaXRpdmUnICk7XG5cbiAgb2JqZWN0ID0geyB4OiA0IH07XG4gIHN3YXBPYmplY3RLZXlzKCBvYmplY3QsICd4JywgJ3knICk7XG4gIGFzc2VydC5vayggb2JqZWN0LnkgPT09IDQgKTtcbiAgYXNzZXJ0Lm9rKCAhT2JqZWN0Lmhhc093blByb3BlcnR5KCAneCcgKSApO1xuXG4gIG9iamVjdCA9IHsgb3RoZXJTdHVmZjogJ2hpJyB9O1xuICBzd2FwT2JqZWN0S2V5cyggb2JqZWN0LCAneCcsICd5JyApO1xuICBhc3NlcnQub2soIG9iamVjdC5vdGhlclN0dWZmID09PSAnaGknICk7XG4gIGFzc2VydC5vayggIU9iamVjdC5oYXNPd25Qcm9wZXJ0eSggJ3gnICkgKTtcbiAgYXNzZXJ0Lm9rKCAhT2JqZWN0Lmhhc093blByb3BlcnR5KCAneScgKSApO1xufSApOyJdLCJuYW1lcyI6WyJzd2FwT2JqZWN0S2V5cyIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9iamVjdCIsIngiLCJ5Iiwib2siLCJ1bmRlZmluZWQiLCJoYXNPd25Qcm9wZXJ0eSIsIlJlZ0V4cCIsInJlZ2V4IiwiT2JqZWN0Iiwib3RoZXJTdHVmZiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxvQkFBb0Isc0JBQXNCO0FBR2pEQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLGtCQUFrQkMsQ0FBQUE7SUFDNUIsSUFBSUMsU0FBeUM7UUFBRUMsR0FBRztRQUFHQyxHQUFHO0lBQUU7SUFDMURQLGVBQWdCSyxRQUFRLEtBQUs7SUFDN0JELE9BQU9JLEVBQUUsQ0FBRUgsT0FBT0MsQ0FBQyxLQUFLO0lBQ3hCRixPQUFPSSxFQUFFLENBQUVILE9BQU9FLENBQUMsS0FBSztJQUV4QkYsU0FBUztRQUFFQyxHQUFHO1FBQUdDLEdBQUdFO0lBQVU7SUFDOUJULGVBQWdCSyxRQUFRLEtBQUs7SUFDN0JELE9BQU9JLEVBQUUsQ0FBRUgsT0FBT0MsQ0FBQyxLQUFLRztJQUN4QkwsT0FBT0ksRUFBRSxDQUFFSCxPQUFPSyxjQUFjLENBQUU7SUFDbENOLE9BQU9JLEVBQUUsQ0FBRUgsT0FBT0UsQ0FBQyxLQUFLO0lBRXhCRixTQUFTO1FBQUVDLEdBQUc7UUFBR0MsR0FBRyxJQUFJSSxPQUFRO0lBQWdCO0lBQ2hELE1BQU1DLFFBQVFQLE9BQU9FLENBQUMsRUFBRSxzQkFBc0I7SUFDOUNQLGVBQWdCSyxRQUFRLEtBQUs7SUFDN0JELE9BQU9JLEVBQUUsQ0FBRUgsT0FBT0MsQ0FBQyxLQUFLTSxPQUFPO0lBQy9CUixPQUFPSSxFQUFFLENBQUVILE9BQU9FLENBQUMsS0FBSyxHQUFHO0lBRTNCRixTQUFTO1FBQUVDLEdBQUc7SUFBRTtJQUNoQk4sZUFBZ0JLLFFBQVEsS0FBSztJQUM3QkQsT0FBT0ksRUFBRSxDQUFFSCxPQUFPRSxDQUFDLEtBQUs7SUFDeEJILE9BQU9JLEVBQUUsQ0FBRSxDQUFDSyxPQUFPSCxjQUFjLENBQUU7SUFFbkNMLFNBQVM7UUFBRVMsWUFBWTtJQUFLO0lBQzVCZCxlQUFnQkssUUFBUSxLQUFLO0lBQzdCRCxPQUFPSSxFQUFFLENBQUVILE9BQU9TLFVBQVUsS0FBSztJQUNqQ1YsT0FBT0ksRUFBRSxDQUFFLENBQUNLLE9BQU9ILGNBQWMsQ0FBRTtJQUNuQ04sT0FBT0ksRUFBRSxDQUFFLENBQUNLLE9BQU9ILGNBQWMsQ0FBRTtBQUNyQyJ9