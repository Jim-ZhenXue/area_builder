// Copyright 2024, University of Colorado Boulder
/**
 * Node qunit tests for registerTasks
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
const { getArgsToForward } = require('./registerTasks');
const registerTasks = require('./registerTasks');
const qunit = require('qunit');
qunit.module('registerTasks');
qunit.test('registerTasks', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.ok(getArgsToForward, 'need that function');
    assert.ok(registerTasks, 'need that function');
    const test = (actual, expected, message)=>{
        assert.equal(actual.join(','), expected, message);
    };
    test(getArgsToForward([
        'grunt',
        'lint',
        '--hi'
    ]), '--hi');
    test(getArgsToForward([
        'grunt',
        '--hi'
    ]), '--hi');
    test(getArgsToForward([
        'node',
        'grunt',
        '--hi'
    ]), '--hi');
    test(getArgsToForward([
        'node',
        'something',
        'grunt',
        '--hi'
    ]), '--hi');
    test(getArgsToForward([
        'node',
        '/pm2.',
        'task',
        'grunt',
        '--hi'
    ]), 'grunt,--hi');
    test(getArgsToForward([
        'node',
        'grunt'
    ]), '');
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9jb21tb25qcy9yZWdpc3RlclRhc2tzVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE5vZGUgcXVuaXQgdGVzdHMgZm9yIHJlZ2lzdGVyVGFza3NcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5jb25zdCB7IGdldEFyZ3NUb0ZvcndhcmQgfSA9IHJlcXVpcmUoICcuL3JlZ2lzdGVyVGFza3MnICk7XG5jb25zdCByZWdpc3RlclRhc2tzID0gcmVxdWlyZSggJy4vcmVnaXN0ZXJUYXNrcycgKTtcbmNvbnN0IHF1bml0ID0gcmVxdWlyZSggJ3F1bml0JyApO1xuXG5xdW5pdC5tb2R1bGUoICdyZWdpc3RlclRhc2tzJyApO1xuXG5cbnF1bml0LnRlc3QoICdyZWdpc3RlclRhc2tzJywgYXN5bmMgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCBnZXRBcmdzVG9Gb3J3YXJkLCAnbmVlZCB0aGF0IGZ1bmN0aW9uJyApO1xuICBhc3NlcnQub2soIHJlZ2lzdGVyVGFza3MsICduZWVkIHRoYXQgZnVuY3Rpb24nICk7XG5cbiAgY29uc3QgdGVzdCA9ICggYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSApID0+IHtcbiAgICBhc3NlcnQuZXF1YWwoIGFjdHVhbC5qb2luKCAnLCcgKSwgZXhwZWN0ZWQsIG1lc3NhZ2UgKTtcbiAgfTtcblxuICB0ZXN0KCBnZXRBcmdzVG9Gb3J3YXJkKCBbICdncnVudCcsICdsaW50JywgJy0taGknIF0gKSwgJy0taGknICk7XG4gIHRlc3QoIGdldEFyZ3NUb0ZvcndhcmQoIFsgJ2dydW50JywgJy0taGknIF0gKSwgJy0taGknICk7XG4gIHRlc3QoIGdldEFyZ3NUb0ZvcndhcmQoIFsgJ25vZGUnLCAnZ3J1bnQnLCAnLS1oaScgXSApLCAnLS1oaScgKTtcbiAgdGVzdCggZ2V0QXJnc1RvRm9yd2FyZCggWyAnbm9kZScsICdzb21ldGhpbmcnLCAnZ3J1bnQnLCAnLS1oaScgXSApLCAnLS1oaScgKTtcbiAgdGVzdCggZ2V0QXJnc1RvRm9yd2FyZCggWyAnbm9kZScsICcvcG0yLicsICd0YXNrJywgJ2dydW50JywgJy0taGknIF0gKSwgJ2dydW50LC0taGknICk7XG4gIHRlc3QoIGdldEFyZ3NUb0ZvcndhcmQoIFsgJ25vZGUnLCAnZ3J1bnQnIF0gKSwgJycgKTtcbn0gKTsiXSwibmFtZXMiOlsiZ2V0QXJnc1RvRm9yd2FyZCIsInJlcXVpcmUiLCJyZWdpc3RlclRhc2tzIiwicXVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siLCJhY3R1YWwiLCJleHBlY3RlZCIsIm1lc3NhZ2UiLCJlcXVhbCIsImpvaW4iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7O0NBR0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTSxFQUFFQSxnQkFBZ0IsRUFBRSxHQUFHQyxRQUFTO0FBQ3RDLE1BQU1DLGdCQUFnQkQsUUFBUztBQUMvQixNQUFNRSxRQUFRRixRQUFTO0FBRXZCRSxNQUFNQyxNQUFNLENBQUU7QUFHZEQsTUFBTUUsSUFBSSxDQUFFLG1EQUFpQixVQUFNQztJQUNqQ0EsT0FBT0MsRUFBRSxDQUFFUCxrQkFBa0I7SUFDN0JNLE9BQU9DLEVBQUUsQ0FBRUwsZUFBZTtJQUUxQixNQUFNRyxPQUFPLENBQUVHLFFBQVFDLFVBQVVDO1FBQy9CSixPQUFPSyxLQUFLLENBQUVILE9BQU9JLElBQUksQ0FBRSxNQUFPSCxVQUFVQztJQUM5QztJQUVBTCxLQUFNTCxpQkFBa0I7UUFBRTtRQUFTO1FBQVE7S0FBUSxHQUFJO0lBQ3ZESyxLQUFNTCxpQkFBa0I7UUFBRTtRQUFTO0tBQVEsR0FBSTtJQUMvQ0ssS0FBTUwsaUJBQWtCO1FBQUU7UUFBUTtRQUFTO0tBQVEsR0FBSTtJQUN2REssS0FBTUwsaUJBQWtCO1FBQUU7UUFBUTtRQUFhO1FBQVM7S0FBUSxHQUFJO0lBQ3BFSyxLQUFNTCxpQkFBa0I7UUFBRTtRQUFRO1FBQVM7UUFBUTtRQUFTO0tBQVEsR0FBSTtJQUN4RUssS0FBTUwsaUJBQWtCO1FBQUU7UUFBUTtLQUFTLEdBQUk7QUFDakQifQ==