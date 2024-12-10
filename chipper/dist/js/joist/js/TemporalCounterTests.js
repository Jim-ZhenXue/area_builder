// Copyright 2019-2022, University of Colorado Boulder
/**
 * QUnit tests for TemporalCounter
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
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
import TemporalCounter from './TemporalCounter.js';
QUnit.test('TemporalCounter basics', /*#__PURE__*/ _async_to_generator(function*(assert) {
    const testTemporalCounter = (binSize, timeEvents, expectedCount, message)=>{
        const counter = new TemporalCounter(binSize);
        timeEvents.forEach((time)=>counter.onEvent(time));
        assert.ok(counter.counts === expectedCount, message);
    };
    testTemporalCounter(1000, [
        12,
        14,
        20
    ], 1, 'three events in one bin size');
    testTemporalCounter(1000, [
        10012,
        10014,
        10020
    ], 1, 'three events in one bin size, larger than the bin');
    testTemporalCounter(1000, [
        12,
        1014,
        10020
    ], 3, 'three events, 3 counts');
    testTemporalCounter(1000, [
        0,
        999,
        1000,
        1001,
        5000,
        5001
    ], 3, 'edge cases, 3 counts expected');
    testTemporalCounter(1, [
        12,
        14,
        20,
        39,
        40,
        41,
        50
    ], 7, 'seven events');
    testTemporalCounter(1000000, [
        1,
        11,
        111,
        1111,
        11111,
        111111
    ], 1, 'six events in one big bin size');
    testTemporalCounter(5000, [
        11,
        11,
        11,
        11,
        11,
        11,
        11,
        4000
    ], 1, 'repetition');
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1RlbXBvcmFsQ291bnRlclRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFFVbml0IHRlc3RzIGZvciBUZW1wb3JhbENvdW50ZXJcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBUZW1wb3JhbENvdW50ZXIgZnJvbSAnLi9UZW1wb3JhbENvdW50ZXIuanMnO1xuXG5RVW5pdC50ZXN0KCAnVGVtcG9yYWxDb3VudGVyIGJhc2ljcycsIGFzeW5jIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgdGVzdFRlbXBvcmFsQ291bnRlciA9ICggYmluU2l6ZTogbnVtYmVyLCB0aW1lRXZlbnRzOiBudW1iZXJbXSwgZXhwZWN0ZWRDb3VudDogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcgKSA9PiB7XG4gICAgY29uc3QgY291bnRlciA9IG5ldyBUZW1wb3JhbENvdW50ZXIoIGJpblNpemUgKTtcbiAgICB0aW1lRXZlbnRzLmZvckVhY2goIHRpbWUgPT4gY291bnRlci5vbkV2ZW50KCB0aW1lICkgKTtcbiAgICBhc3NlcnQub2soIGNvdW50ZXIuY291bnRzID09PSBleHBlY3RlZENvdW50LCBtZXNzYWdlICk7XG4gIH07XG5cbiAgdGVzdFRlbXBvcmFsQ291bnRlciggMTAwMCwgWyAxMiwgMTQsIDIwIF0sIDEsXG4gICAgJ3RocmVlIGV2ZW50cyBpbiBvbmUgYmluIHNpemUnICk7XG4gIHRlc3RUZW1wb3JhbENvdW50ZXIoIDEwMDAsIFsgMTAwMTIsIDEwMDE0LCAxMDAyMCBdLCAxLFxuICAgICd0aHJlZSBldmVudHMgaW4gb25lIGJpbiBzaXplLCBsYXJnZXIgdGhhbiB0aGUgYmluJyApO1xuICB0ZXN0VGVtcG9yYWxDb3VudGVyKCAxMDAwLCBbIDEyLCAxMDE0LCAxMDAyMCBdLCAzLFxuICAgICd0aHJlZSBldmVudHMsIDMgY291bnRzJyApO1xuICB0ZXN0VGVtcG9yYWxDb3VudGVyKCAxMDAwLCBbIDAsIDk5OSwgMTAwMCwgMTAwMSwgNTAwMCwgNTAwMSBdLCAzLFxuICAgICdlZGdlIGNhc2VzLCAzIGNvdW50cyBleHBlY3RlZCcgKTtcbiAgdGVzdFRlbXBvcmFsQ291bnRlciggMSwgWyAxMiwgMTQsIDIwLCAzOSwgNDAsIDQxLCA1MCBdLCA3LFxuICAgICdzZXZlbiBldmVudHMnICk7XG4gIHRlc3RUZW1wb3JhbENvdW50ZXIoIDEwMDAwMDAsIFsgMSwgMTEsIDExMSwgMTExMSwgMTExMTEsIDExMTExMSBdLCAxLFxuICAgICdzaXggZXZlbnRzIGluIG9uZSBiaWcgYmluIHNpemUnICk7XG4gIHRlc3RUZW1wb3JhbENvdW50ZXIoIDUwMDAsIFsgMTEsIDExLCAxMSwgMTEsIDExLCAxMSwgMTEsIDQwMDAgXSwgMSxcbiAgICAncmVwZXRpdGlvbicgKTtcbn0gKTsiXSwibmFtZXMiOlsiVGVtcG9yYWxDb3VudGVyIiwiUVVuaXQiLCJ0ZXN0IiwiYXNzZXJ0IiwidGVzdFRlbXBvcmFsQ291bnRlciIsImJpblNpemUiLCJ0aW1lRXZlbnRzIiwiZXhwZWN0ZWRDb3VudCIsIm1lc3NhZ2UiLCJjb3VudGVyIiwiZm9yRWFjaCIsInRpbWUiLCJvbkV2ZW50Iiwib2siLCJjb3VudHMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EscUJBQXFCLHVCQUF1QjtBQUVuREMsTUFBTUMsSUFBSSxDQUFFLDREQUEwQixVQUFNQztJQUUxQyxNQUFNQyxzQkFBc0IsQ0FBRUMsU0FBaUJDLFlBQXNCQyxlQUF1QkM7UUFDMUYsTUFBTUMsVUFBVSxJQUFJVCxnQkFBaUJLO1FBQ3JDQyxXQUFXSSxPQUFPLENBQUVDLENBQUFBLE9BQVFGLFFBQVFHLE9BQU8sQ0FBRUQ7UUFDN0NSLE9BQU9VLEVBQUUsQ0FBRUosUUFBUUssTUFBTSxLQUFLUCxlQUFlQztJQUMvQztJQUVBSixvQkFBcUIsTUFBTTtRQUFFO1FBQUk7UUFBSTtLQUFJLEVBQUUsR0FDekM7SUFDRkEsb0JBQXFCLE1BQU07UUFBRTtRQUFPO1FBQU87S0FBTyxFQUFFLEdBQ2xEO0lBQ0ZBLG9CQUFxQixNQUFNO1FBQUU7UUFBSTtRQUFNO0tBQU8sRUFBRSxHQUM5QztJQUNGQSxvQkFBcUIsTUFBTTtRQUFFO1FBQUc7UUFBSztRQUFNO1FBQU07UUFBTTtLQUFNLEVBQUUsR0FDN0Q7SUFDRkEsb0JBQXFCLEdBQUc7UUFBRTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtLQUFJLEVBQUUsR0FDdEQ7SUFDRkEsb0JBQXFCLFNBQVM7UUFBRTtRQUFHO1FBQUk7UUFBSztRQUFNO1FBQU87S0FBUSxFQUFFLEdBQ2pFO0lBQ0ZBLG9CQUFxQixNQUFNO1FBQUU7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtLQUFNLEVBQUUsR0FDL0Q7QUFDSiJ9