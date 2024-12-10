// Copyright 2019-2024, University of Colorado Boulder
/**
 * PiecewiseLinearFunction tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import PiecewiseLinearFunction from './PiecewiseLinearFunction.js';
QUnit.module('PiecewiseLinearFunction');
function approximateEquals(assert, a, b) {
    assert.ok(Math.abs(a - b) < 0.00000001, `expected: ${b}, result: ${a}`);
}
QUnit.test('PiecewiseLinearFunction', (assert)=>{
    approximateEquals(assert, PiecewiseLinearFunction.evaluate([
        0,
        0,
        1,
        1
    ], 0), 0);
    approximateEquals(assert, PiecewiseLinearFunction.evaluate([
        0,
        0,
        1,
        1
    ], 0.5), 0.5);
    approximateEquals(assert, PiecewiseLinearFunction.evaluate([
        0,
        0,
        1,
        2
    ], 0.5), 1);
    approximateEquals(assert, PiecewiseLinearFunction.evaluate([
        1,
        -1,
        -1,
        1
    ], 0), 0);
    approximateEquals(assert, PiecewiseLinearFunction.evaluate([
        100,
        100,
        1,
        -1,
        -1,
        1
    ], 0), 0);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9QaWVjZXdpc2VMaW5lYXJGdW5jdGlvblRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIHRlc3RzXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgUGllY2V3aXNlTGluZWFyRnVuY3Rpb24gZnJvbSAnLi9QaWVjZXdpc2VMaW5lYXJGdW5jdGlvbi5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ1BpZWNld2lzZUxpbmVhckZ1bmN0aW9uJyApO1xuXG5mdW5jdGlvbiBhcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0OiBBc3NlcnQsIGE6IG51bWJlciwgYjogbnVtYmVyICk6IHZvaWQge1xuICBhc3NlcnQub2soIE1hdGguYWJzKCBhIC0gYiApIDwgMC4wMDAwMDAwMSwgYGV4cGVjdGVkOiAke2J9LCByZXN1bHQ6ICR7YX1gICk7XG59XG5cblFVbml0LnRlc3QoICdQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbicsIGFzc2VydCA9PiB7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLmV2YWx1YXRlKCBbIDAsIDAsIDEsIDEgXSwgMCApLCAwICk7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLmV2YWx1YXRlKCBbIDAsIDAsIDEsIDEgXSwgMC41ICksIDAuNSApO1xuICBhcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbi5ldmFsdWF0ZSggWyAwLCAwLCAxLCAyIF0sIDAuNSApLCAxICk7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLmV2YWx1YXRlKCBbIDEsIC0xLCAtMSwgMSBdLCAwICksIDAgKTtcbiAgYXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgUGllY2V3aXNlTGluZWFyRnVuY3Rpb24uZXZhbHVhdGUoIFsgMTAwLCAxMDAsIDEsIC0xLCAtMSwgMSBdLCAwICksIDAgKTtcbn0gKTsiXSwibmFtZXMiOlsiUGllY2V3aXNlTGluZWFyRnVuY3Rpb24iLCJRVW5pdCIsIm1vZHVsZSIsImFwcHJveGltYXRlRXF1YWxzIiwiYXNzZXJ0IiwiYSIsImIiLCJvayIsIk1hdGgiLCJhYnMiLCJ0ZXN0IiwiZXZhbHVhdGUiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsNkJBQTZCLCtCQUErQjtBQUVuRUMsTUFBTUMsTUFBTSxDQUFFO0FBRWQsU0FBU0Msa0JBQW1CQyxNQUFjLEVBQUVDLENBQVMsRUFBRUMsQ0FBUztJQUM5REYsT0FBT0csRUFBRSxDQUFFQyxLQUFLQyxHQUFHLENBQUVKLElBQUlDLEtBQU0sWUFBWSxDQUFDLFVBQVUsRUFBRUEsRUFBRSxVQUFVLEVBQUVELEdBQUc7QUFDM0U7QUFFQUosTUFBTVMsSUFBSSxDQUFFLDJCQUEyQk4sQ0FBQUE7SUFDckNELGtCQUFtQkMsUUFBUUosd0JBQXdCVyxRQUFRLENBQUU7UUFBRTtRQUFHO1FBQUc7UUFBRztLQUFHLEVBQUUsSUFBSztJQUNsRlIsa0JBQW1CQyxRQUFRSix3QkFBd0JXLFFBQVEsQ0FBRTtRQUFFO1FBQUc7UUFBRztRQUFHO0tBQUcsRUFBRSxNQUFPO0lBQ3BGUixrQkFBbUJDLFFBQVFKLHdCQUF3QlcsUUFBUSxDQUFFO1FBQUU7UUFBRztRQUFHO1FBQUc7S0FBRyxFQUFFLE1BQU87SUFDcEZSLGtCQUFtQkMsUUFBUUosd0JBQXdCVyxRQUFRLENBQUU7UUFBRTtRQUFHLENBQUM7UUFBRyxDQUFDO1FBQUc7S0FBRyxFQUFFLElBQUs7SUFDcEZSLGtCQUFtQkMsUUFBUUosd0JBQXdCVyxRQUFRLENBQUU7UUFBRTtRQUFLO1FBQUs7UUFBRyxDQUFDO1FBQUcsQ0FBQztRQUFHO0tBQUcsRUFBRSxJQUFLO0FBQ2hHIn0=