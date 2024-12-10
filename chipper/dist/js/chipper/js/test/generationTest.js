// Copyright 2017-2024, University of Colorado Boulder
/**
 * Unit tests, run with `qunit` at the top-level of chipper. May need `npm install -g qunit` beforehand, if it hasn't been run yet.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
import execute from '../../../perennial-alias/js/common/execute.js';
import gruntCommand from '../../../perennial-alias/js/common/gruntCommand.js';
import qunit from '../../../perennial-alias/js/npm-dependencies/qunit.js';
qunit.module('Generation', {
    afterEach: /*#__PURE__*/ _async_to_generator(function*() {
        // Hard reset to undo what we just did
        yield execute('git', [
            'reset',
            '--hard'
        ], '../chains');
        yield execute('git', [
            'clean',
            '-f'
        ], '../chains');
    })
});
qunit.test('Development HTML', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        'generate-development-html'
    ], '../chains');
    assert.expect(0);
}));
qunit.test('Test HTML', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        'generate-test-html'
    ], '../chains');
    assert.expect(0);
}));
qunit.test('A11Y View HTML', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        'generate-a11y-view-html'
    ], '../chains');
    assert.expect(0);
}));
qunit.test('Published README', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        'published-readme'
    ], '../chains');
    assert.expect(0);
}));
qunit.test('Unpublished README', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        'unpublished-readme'
    ], '../chains');
    assert.expect(0);
}));
qunit.test('Copyright', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        'update-copyright-dates'
    ], '../chains');
    assert.expect(0);
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL3Rlc3QvZ2VuZXJhdGlvblRlc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVW5pdCB0ZXN0cywgcnVuIHdpdGggYHF1bml0YCBhdCB0aGUgdG9wLWxldmVsIG9mIGNoaXBwZXIuIE1heSBuZWVkIGBucG0gaW5zdGFsbCAtZyBxdW5pdGAgYmVmb3JlaGFuZCwgaWYgaXQgaGFzbid0IGJlZW4gcnVuIHlldC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGV4ZWN1dGUgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9leGVjdXRlLmpzJztcbmltcG9ydCBncnVudENvbW1hbmQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9ncnVudENvbW1hbmQuanMnO1xuaW1wb3J0IHF1bml0IGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ucG0tZGVwZW5kZW5jaWVzL3F1bml0LmpzJztcblxucXVuaXQubW9kdWxlKCAnR2VuZXJhdGlvbicsIHtcbiAgYWZ0ZXJFYWNoOiBhc3luYyAoKSA9PiB7XG4gICAgLy8gSGFyZCByZXNldCB0byB1bmRvIHdoYXQgd2UganVzdCBkaWRcbiAgICBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAncmVzZXQnLCAnLS1oYXJkJyBdLCAnLi4vY2hhaW5zJyApO1xuICAgIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdjbGVhbicsICctZicgXSwgJy4uL2NoYWlucycgKTtcbiAgfVxufSApO1xuXG5xdW5pdC50ZXN0KCAnRGV2ZWxvcG1lbnQgSFRNTCcsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGFzc2VydC50aW1lb3V0KCAxMjAwMDAgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdnZW5lcmF0ZS1kZXZlbG9wbWVudC1odG1sJyBdLCAnLi4vY2hhaW5zJyApO1xuICBhc3NlcnQuZXhwZWN0KCAwICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdUZXN0IEhUTUwnLCBhc3luYyBhc3NlcnQgPT4ge1xuICBhc3NlcnQudGltZW91dCggMTIwMDAwICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnZ2VuZXJhdGUtdGVzdC1odG1sJyBdLCAnLi4vY2hhaW5zJyApO1xuICBhc3NlcnQuZXhwZWN0KCAwICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdBMTFZIFZpZXcgSFRNTCcsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGFzc2VydC50aW1lb3V0KCAxMjAwMDAgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdnZW5lcmF0ZS1hMTF5LXZpZXctaHRtbCcgXSwgJy4uL2NoYWlucycgKTtcbiAgYXNzZXJ0LmV4cGVjdCggMCApO1xufSApO1xuXG5xdW5pdC50ZXN0KCAnUHVibGlzaGVkIFJFQURNRScsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGFzc2VydC50aW1lb3V0KCAxMjAwMDAgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdwdWJsaXNoZWQtcmVhZG1lJyBdLCAnLi4vY2hhaW5zJyApO1xuICBhc3NlcnQuZXhwZWN0KCAwICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdVbnB1Ymxpc2hlZCBSRUFETUUnLCBhc3luYyBhc3NlcnQgPT4ge1xuICBhc3NlcnQudGltZW91dCggMTIwMDAwICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAndW5wdWJsaXNoZWQtcmVhZG1lJyBdLCAnLi4vY2hhaW5zJyApO1xuICBhc3NlcnQuZXhwZWN0KCAwICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdDb3B5cmlnaHQnLCBhc3luYyBhc3NlcnQgPT4ge1xuICBhc3NlcnQudGltZW91dCggMTIwMDAwICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAndXBkYXRlLWNvcHlyaWdodC1kYXRlcycgXSwgJy4uL2NoYWlucycgKTtcbiAgYXNzZXJ0LmV4cGVjdCggMCApO1xufSApOyJdLCJuYW1lcyI6WyJleGVjdXRlIiwiZ3J1bnRDb21tYW5kIiwicXVuaXQiLCJtb2R1bGUiLCJhZnRlckVhY2giLCJ0ZXN0IiwiYXNzZXJ0IiwidGltZW91dCIsImV4cGVjdCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsYUFBYSxnREFBZ0Q7QUFDcEUsT0FBT0Msa0JBQWtCLHFEQUFxRDtBQUM5RSxPQUFPQyxXQUFXLHdEQUF3RDtBQUUxRUEsTUFBTUMsTUFBTSxDQUFFLGNBQWM7SUFDMUJDLFNBQVMsb0NBQUU7UUFDVCxzQ0FBc0M7UUFDdEMsTUFBTUosUUFBUyxPQUFPO1lBQUU7WUFBUztTQUFVLEVBQUU7UUFDN0MsTUFBTUEsUUFBUyxPQUFPO1lBQUU7WUFBUztTQUFNLEVBQUU7SUFDM0M7QUFDRjtBQUVBRSxNQUFNRyxJQUFJLENBQUUsc0RBQW9CLFVBQU1DO0lBQ3BDQSxPQUFPQyxPQUFPLENBQUU7SUFDaEIsTUFBTVAsUUFBU0MsY0FBYztRQUFFO0tBQTZCLEVBQUU7SUFDOURLLE9BQU9FLE1BQU0sQ0FBRTtBQUNqQjtBQUVBTixNQUFNRyxJQUFJLENBQUUsK0NBQWEsVUFBTUM7SUFDN0JBLE9BQU9DLE9BQU8sQ0FBRTtJQUNoQixNQUFNUCxRQUFTQyxjQUFjO1FBQUU7S0FBc0IsRUFBRTtJQUN2REssT0FBT0UsTUFBTSxDQUFFO0FBQ2pCO0FBRUFOLE1BQU1HLElBQUksQ0FBRSxvREFBa0IsVUFBTUM7SUFDbENBLE9BQU9DLE9BQU8sQ0FBRTtJQUNoQixNQUFNUCxRQUFTQyxjQUFjO1FBQUU7S0FBMkIsRUFBRTtJQUM1REssT0FBT0UsTUFBTSxDQUFFO0FBQ2pCO0FBRUFOLE1BQU1HLElBQUksQ0FBRSxzREFBb0IsVUFBTUM7SUFDcENBLE9BQU9DLE9BQU8sQ0FBRTtJQUNoQixNQUFNUCxRQUFTQyxjQUFjO1FBQUU7S0FBb0IsRUFBRTtJQUNyREssT0FBT0UsTUFBTSxDQUFFO0FBQ2pCO0FBRUFOLE1BQU1HLElBQUksQ0FBRSx3REFBc0IsVUFBTUM7SUFDdENBLE9BQU9DLE9BQU8sQ0FBRTtJQUNoQixNQUFNUCxRQUFTQyxjQUFjO1FBQUU7S0FBc0IsRUFBRTtJQUN2REssT0FBT0UsTUFBTSxDQUFFO0FBQ2pCO0FBRUFOLE1BQU1HLElBQUksQ0FBRSwrQ0FBYSxVQUFNQztJQUM3QkEsT0FBT0MsT0FBTyxDQUFFO0lBQ2hCLE1BQU1QLFFBQVNDLGNBQWM7UUFBRTtLQUEwQixFQUFFO0lBQzNESyxPQUFPRSxNQUFNLENBQUU7QUFDakIifQ==