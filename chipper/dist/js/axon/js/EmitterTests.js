// Copyright 2018-2024, University of Colorado Boulder
/**
 * QUnit tests for Emitter
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import Emitter from './Emitter.js';
QUnit.module('Emitter');
QUnit.test('Emitter Constructing and options', (assert)=>{
    assert.ok(true, 'Token test in case assertions are disabled, because each test must have at least one assert.');
    const e1 = new Emitter({
        parameters: [
            {
                valueType: 'number'
            }
        ]
    });
    e1.emit(1);
    // emitting with an object as parameter
    const e2 = new Emitter({
        parameters: [
            {
                valueType: Emitter
            },
            {
                valueType: Object
            },
            {
                valueType: 'function'
            }
        ]
    });
    e2.emit(new Emitter(), {}, _.noop);
    const e3 = new Emitter({
        parameters: [
            {
                valueType: 'number'
            },
            {
                valueType: [
                    'string',
                    null
                ]
            }
        ]
    });
    e3.emit(1, 'hi');
    e3.emit(1, null);
});
QUnit.test('Test emit timing Emitter', (assert)=>{
    const e = new Emitter();
    let x = 0;
    e.addListener(()=>{
        x++;
    });
    e.addListener(()=>{
        x++;
    });
    e.addListener(()=>{
        x++;
    });
    e.addListener(()=>{
        x++;
    });
    e.addListener(()=>{
        x++;
    });
    e.emit();
    assert.ok(x === 5, 'fired all listeners');
    const e1 = new Emitter();
    e1.addListener(_.noop);
    const testEmitter = (emitter, numberOfLoopings)=>{
        const start = Date.now();
        for(let i = 0; i < numberOfLoopings; i++){
            emitter.emit();
        }
        const end = Date.now();
        const totalTime = end - start;
        console.log(`Time for ${numberOfLoopings}: `, totalTime, totalTime / numberOfLoopings);
    };
    // No assertions here, but it can be nice to test how expensive emit calls are
    testEmitter(e1, 100000);
    testEmitter(e, 100000);
});
QUnit.test('Emitter Basics', (assert)=>{
    const stack = [];
    const emitter = new Emitter();
    const a = ()=>{
        stack.push('a');
        emitter.removeListener(b);
    };
    const b = ()=>{
        stack.push('b');
    };
    emitter.addListener(a);
    emitter.addListener(b);
    emitter.emit();
    assert.equal(stack.length, 2, 'Should have received 2 callbacks');
    assert.equal(stack[0], 'a', 'true');
    assert.equal(stack[1], 'b', 'true');
    assert.equal(emitter.hasListener(b), false, 'b should have been removed');
});
QUnit.test('Emitter Tricks', (assert)=>{
    const entries = [];
    const emitter = new Emitter({
        parameters: [
            {
                valueType: 'string'
            }
        ]
    });
    const a = (arg)=>{
        entries.push({
            listener: 'a',
            arg: arg
        });
        if (arg === 'first') {
            emitter.emit('second');
        }
    };
    const b = (arg)=>{
        entries.push({
            listener: 'b',
            arg: arg
        });
        if (arg === 'second') {
            emitter.addListener(c);
            emitter.emit('third');
        }
    };
    const c = (arg)=>{
        entries.push({
            listener: 'c',
            arg: arg
        });
    };
    emitter.addListener(a);
    emitter.addListener(b);
    emitter.emit('first');
    /*
   * Expected order:
   *   a first
   *     a second
   *     b second
   *       a third
   *       b third
   *       c third
   *   b first
   *
   * It looks like "c first" is (currently?) being triggered since defendCallbacks only defends the top of the stack.
   * If the stack is [ undefended, undefended ], changing listeners copies only the top, leaving
   * [ undefended, defended ], and our first event triggers a listener that wasn't listening when it was called.
   */ _.each(entries, (entry)=>{
        assert.ok(!(entry.listener === 'c' && entry.arg === 'first'), 'not C,first');
    });
    assert.equal(entries.length, 7, 'Should have 7 callbacks');
    assert.equal(entries[0].listener, 'a');
    assert.equal(entries[0].arg, 'first');
    assert.equal(entries[1].listener, 'a');
    assert.equal(entries[1].arg, 'second');
    assert.equal(entries[2].listener, 'b');
    assert.equal(entries[2].arg, 'second');
    assert.equal(entries[3].listener, 'a');
    assert.equal(entries[3].arg, 'third');
    assert.equal(entries[4].listener, 'b');
    assert.equal(entries[4].arg, 'third');
    assert.equal(entries[5].listener, 'c');
    assert.equal(entries[5].arg, 'third');
    assert.equal(entries[6].listener, 'b');
    assert.equal(entries[6].arg, 'first');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlclRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBRVW5pdCB0ZXN0cyBmb3IgRW1pdHRlclxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi9FbWl0dGVyLmpzJztcbmltcG9ydCBURW1pdHRlciBmcm9tICcuL1RFbWl0dGVyLmpzJztcblxuUVVuaXQubW9kdWxlKCAnRW1pdHRlcicgKTtcblxuUVVuaXQudGVzdCggJ0VtaXR0ZXIgQ29uc3RydWN0aW5nIGFuZCBvcHRpb25zJywgYXNzZXJ0ID0+IHtcblxuICBhc3NlcnQub2soIHRydWUsICdUb2tlbiB0ZXN0IGluIGNhc2UgYXNzZXJ0aW9ucyBhcmUgZGlzYWJsZWQsIGJlY2F1c2UgZWFjaCB0ZXN0IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgYXNzZXJ0LicgKTtcbiAgY29uc3QgZTEgPSBuZXcgRW1pdHRlcjxbIG51bWJlciBdPigge1xuICAgIHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6ICdudW1iZXInIH0gXVxuICB9ICk7XG5cbiAgZTEuZW1pdCggMSApO1xuXG4gIC8vIFdvcmthcm91bmQgZm9yIGEgbGludCBydWxlXG4gIHR5cGUgVm9pZEZ1bmMgPSAoKSA9PiB2b2lkO1xuXG4gIC8vIGVtaXR0aW5nIHdpdGggYW4gb2JqZWN0IGFzIHBhcmFtZXRlclxuICBjb25zdCBlMiA9IG5ldyBFbWl0dGVyPFsgRW1pdHRlciwgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIFZvaWRGdW5jIF0+KCB7XG4gICAgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogRW1pdHRlciB9LCB7IHZhbHVlVHlwZTogT2JqZWN0IH0sIHsgdmFsdWVUeXBlOiAnZnVuY3Rpb24nIH0gXVxuICB9ICk7XG5cbiAgZTIuZW1pdCggbmV3IEVtaXR0ZXIoKSwge30sIF8ubm9vcCApO1xuXG4gIGNvbnN0IGUzID0gbmV3IEVtaXR0ZXI8WyBudW1iZXIsIHN0cmluZyB8IG51bGwgXT4oIHtcbiAgICBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9LCB7IHZhbHVlVHlwZTogWyAnc3RyaW5nJywgbnVsbCBdIH0gXVxuICB9ICk7XG5cbiAgZTMuZW1pdCggMSwgJ2hpJyApO1xuICBlMy5lbWl0KCAxLCBudWxsICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0IGVtaXQgdGltaW5nIEVtaXR0ZXInLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IGUgPSBuZXcgRW1pdHRlcigpO1xuICBsZXQgeCA9IDA7XG4gIGUuYWRkTGlzdGVuZXIoICgpID0+IHt4Kys7fSApO1xuICBlLmFkZExpc3RlbmVyKCAoKSA9PiB7eCsrO30gKTtcbiAgZS5hZGRMaXN0ZW5lciggKCkgPT4ge3grKzt9ICk7XG4gIGUuYWRkTGlzdGVuZXIoICgpID0+IHt4Kys7fSApO1xuICBlLmFkZExpc3RlbmVyKCAoKSA9PiB7eCsrO30gKTtcblxuICBlLmVtaXQoKTtcblxuICBhc3NlcnQub2soIHggPT09IDUsICdmaXJlZCBhbGwgbGlzdGVuZXJzJyApO1xuXG4gIGNvbnN0IGUxID0gbmV3IEVtaXR0ZXIoKTtcbiAgZTEuYWRkTGlzdGVuZXIoIF8ubm9vcCApO1xuXG4gIGNvbnN0IHRlc3RFbWl0dGVyID0gKCBlbWl0dGVyOiBURW1pdHRlciwgbnVtYmVyT2ZMb29waW5nczogbnVtYmVyICkgPT4ge1xuXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZMb29waW5nczsgaSsrICkge1xuICAgICAgZW1pdHRlci5lbWl0KCk7XG4gICAgfVxuICAgIGNvbnN0IGVuZCA9IERhdGUubm93KCk7XG4gICAgY29uc3QgdG90YWxUaW1lID0gZW5kIC0gc3RhcnQ7XG4gICAgY29uc29sZS5sb2coIGBUaW1lIGZvciAke251bWJlck9mTG9vcGluZ3N9OiBgLCB0b3RhbFRpbWUsIHRvdGFsVGltZSAvIG51bWJlck9mTG9vcGluZ3MgKTtcbiAgfTtcblxuICAvLyBObyBhc3NlcnRpb25zIGhlcmUsIGJ1dCBpdCBjYW4gYmUgbmljZSB0byB0ZXN0IGhvdyBleHBlbnNpdmUgZW1pdCBjYWxscyBhcmVcbiAgdGVzdEVtaXR0ZXIoIGUxLCAxMDAwMDAgKTtcbiAgdGVzdEVtaXR0ZXIoIGUsIDEwMDAwMCApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnRW1pdHRlciBCYXNpY3MnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBzdGFjazogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gIGNvbnN0IGEgPSAoKSA9PiB7XG4gICAgc3RhY2sucHVzaCggJ2EnICk7XG4gICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lciggYiApO1xuICB9O1xuICBjb25zdCBiID0gKCkgPT4ge1xuICAgIHN0YWNrLnB1c2goICdiJyApO1xuICB9O1xuICBlbWl0dGVyLmFkZExpc3RlbmVyKCBhICk7XG4gIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIGIgKTtcbiAgZW1pdHRlci5lbWl0KCk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBzdGFjay5sZW5ndGgsIDIsICdTaG91bGQgaGF2ZSByZWNlaXZlZCAyIGNhbGxiYWNrcycgKTtcbiAgYXNzZXJ0LmVxdWFsKCBzdGFja1sgMCBdLCAnYScsICd0cnVlJyApO1xuICBhc3NlcnQuZXF1YWwoIHN0YWNrWyAxIF0sICdiJywgJ3RydWUnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBlbWl0dGVyLmhhc0xpc3RlbmVyKCBiICksIGZhbHNlLCAnYiBzaG91bGQgaGF2ZSBiZWVuIHJlbW92ZWQnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdFbWl0dGVyIFRyaWNrcycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGVudHJpZXM6IEFycmF5PHsgbGlzdGVuZXI6IHN0cmluZzsgYXJnOiBzdHJpbmcgfT4gPSBbXTtcblxuICBjb25zdCBlbWl0dGVyID0gbmV3IEVtaXR0ZXI8WyBzdHJpbmcgXT4oIHtcbiAgICBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiAnc3RyaW5nJyB9IF1cbiAgfSApO1xuXG4gIGNvbnN0IGEgPSAoIGFyZzogc3RyaW5nICkgPT4ge1xuICAgIGVudHJpZXMucHVzaCggeyBsaXN0ZW5lcjogJ2EnLCBhcmc6IGFyZyB9ICk7XG5cbiAgICBpZiAoIGFyZyA9PT0gJ2ZpcnN0JyApIHtcbiAgICAgIGVtaXR0ZXIuZW1pdCggJ3NlY29uZCcgKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IGIgPSAoIGFyZzogc3RyaW5nICkgPT4ge1xuICAgIGVudHJpZXMucHVzaCggeyBsaXN0ZW5lcjogJ2InLCBhcmc6IGFyZyB9ICk7XG5cbiAgICBpZiAoIGFyZyA9PT0gJ3NlY29uZCcgKSB7XG4gICAgICBlbWl0dGVyLmFkZExpc3RlbmVyKCBjICk7XG4gICAgICBlbWl0dGVyLmVtaXQoICd0aGlyZCcgKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IGMgPSAoIGFyZzogc3RyaW5nICkgPT4ge1xuICAgIGVudHJpZXMucHVzaCggeyBsaXN0ZW5lcjogJ2MnLCBhcmc6IGFyZyB9ICk7XG4gIH07XG5cbiAgZW1pdHRlci5hZGRMaXN0ZW5lciggYSApO1xuICBlbWl0dGVyLmFkZExpc3RlbmVyKCBiICk7XG4gIGVtaXR0ZXIuZW1pdCggJ2ZpcnN0JyApO1xuXG4gIC8qXG4gICAqIEV4cGVjdGVkIG9yZGVyOlxuICAgKiAgIGEgZmlyc3RcbiAgICogICAgIGEgc2Vjb25kXG4gICAqICAgICBiIHNlY29uZFxuICAgKiAgICAgICBhIHRoaXJkXG4gICAqICAgICAgIGIgdGhpcmRcbiAgICogICAgICAgYyB0aGlyZFxuICAgKiAgIGIgZmlyc3RcbiAgICpcbiAgICogSXQgbG9va3MgbGlrZSBcImMgZmlyc3RcIiBpcyAoY3VycmVudGx5PykgYmVpbmcgdHJpZ2dlcmVkIHNpbmNlIGRlZmVuZENhbGxiYWNrcyBvbmx5IGRlZmVuZHMgdGhlIHRvcCBvZiB0aGUgc3RhY2suXG4gICAqIElmIHRoZSBzdGFjayBpcyBbIHVuZGVmZW5kZWQsIHVuZGVmZW5kZWQgXSwgY2hhbmdpbmcgbGlzdGVuZXJzIGNvcGllcyBvbmx5IHRoZSB0b3AsIGxlYXZpbmdcbiAgICogWyB1bmRlZmVuZGVkLCBkZWZlbmRlZCBdLCBhbmQgb3VyIGZpcnN0IGV2ZW50IHRyaWdnZXJzIGEgbGlzdGVuZXIgdGhhdCB3YXNuJ3QgbGlzdGVuaW5nIHdoZW4gaXQgd2FzIGNhbGxlZC5cbiAgICovXG4gIF8uZWFjaCggZW50cmllcywgZW50cnkgPT4ge1xuICAgIGFzc2VydC5vayggISggZW50cnkubGlzdGVuZXIgPT09ICdjJyAmJiBlbnRyeS5hcmcgPT09ICdmaXJzdCcgKSwgJ25vdCBDLGZpcnN0JyApO1xuICB9ICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBlbnRyaWVzLmxlbmd0aCwgNywgJ1Nob3VsZCBoYXZlIDcgY2FsbGJhY2tzJyApO1xuXG4gIGFzc2VydC5lcXVhbCggZW50cmllc1sgMCBdLmxpc3RlbmVyLCAnYScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBlbnRyaWVzWyAwIF0uYXJnLCAnZmlyc3QnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBlbnRyaWVzWyAxIF0ubGlzdGVuZXIsICdhJyApO1xuICBhc3NlcnQuZXF1YWwoIGVudHJpZXNbIDEgXS5hcmcsICdzZWNvbmQnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBlbnRyaWVzWyAyIF0ubGlzdGVuZXIsICdiJyApO1xuICBhc3NlcnQuZXF1YWwoIGVudHJpZXNbIDIgXS5hcmcsICdzZWNvbmQnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBlbnRyaWVzWyAzIF0ubGlzdGVuZXIsICdhJyApO1xuICBhc3NlcnQuZXF1YWwoIGVudHJpZXNbIDMgXS5hcmcsICd0aGlyZCcgKTtcblxuICBhc3NlcnQuZXF1YWwoIGVudHJpZXNbIDQgXS5saXN0ZW5lciwgJ2InICk7XG4gIGFzc2VydC5lcXVhbCggZW50cmllc1sgNCBdLmFyZywgJ3RoaXJkJyApO1xuXG4gIGFzc2VydC5lcXVhbCggZW50cmllc1sgNSBdLmxpc3RlbmVyLCAnYycgKTtcbiAgYXNzZXJ0LmVxdWFsKCBlbnRyaWVzWyA1IF0uYXJnLCAndGhpcmQnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBlbnRyaWVzWyA2IF0ubGlzdGVuZXIsICdiJyApO1xuICBhc3NlcnQuZXF1YWwoIGVudHJpZXNbIDYgXS5hcmcsICdmaXJzdCcgKTtcbn0gKTsiXSwibmFtZXMiOlsiRW1pdHRlciIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwiZTEiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwiZW1pdCIsImUyIiwiT2JqZWN0IiwiXyIsIm5vb3AiLCJlMyIsImUiLCJ4IiwiYWRkTGlzdGVuZXIiLCJ0ZXN0RW1pdHRlciIsImVtaXR0ZXIiLCJudW1iZXJPZkxvb3BpbmdzIiwic3RhcnQiLCJEYXRlIiwibm93IiwiaSIsImVuZCIsInRvdGFsVGltZSIsImNvbnNvbGUiLCJsb2ciLCJzdGFjayIsImEiLCJwdXNoIiwicmVtb3ZlTGlzdGVuZXIiLCJiIiwiZXF1YWwiLCJsZW5ndGgiLCJoYXNMaXN0ZW5lciIsImVudHJpZXMiLCJhcmciLCJsaXN0ZW5lciIsImMiLCJlYWNoIiwiZW50cnkiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxhQUFhLGVBQWU7QUFHbkNDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkRCxNQUFNRSxJQUFJLENBQUUsb0NBQW9DQyxDQUFBQTtJQUU5Q0EsT0FBT0MsRUFBRSxDQUFF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R0FBRyxFQUFFO0lBRWhDbEMsT0FBTzhCLEtBQUssQ0FBRUcsT0FBTyxDQUFFLEVBQUcsQ0FBQ0UsUUFBUSxFQUFFO0lBQ3JDbkMsT0FBTzhCLEtBQUssQ0FBRUcsT0FBTyxDQUFFLEVBQUcsQ0FBQ0MsR0FBRyxFQUFFO0lBRWhDbEMsT0FBTzhCLEtBQUssQ0FBRUcsT0FBTyxDQUFFLEVBQUcsQ0FBQ0UsUUFBUSxFQUFFO0lBQ3JDbkMsT0FBTzhCLEtBQUssQ0FBRUcsT0FBTyxDQUFFLEVBQUcsQ0FBQ0MsR0FBRyxFQUFFO0lBRWhDbEMsT0FBTzhCLEtBQUssQ0FBRUcsT0FBTyxDQUFFLEVBQUcsQ0FBQ0UsUUFBUSxFQUFFO0lBQ3JDbkMsT0FBTzhCLEtBQUssQ0FBRUcsT0FBTyxDQUFFLEVBQUcsQ0FBQ0MsR0FBRyxFQUFFO0lBRWhDbEMsT0FBTzhCLEtBQUssQ0FBRUcsT0FBTyxDQUFFLEVBQUcsQ0FBQ0UsUUFBUSxFQUFFO0lBQ3JDbkMsT0FBTzhCLEtBQUssQ0FBRUcsT0FBTyxDQUFFLEVBQUcsQ0FBQ0MsR0FBRyxFQUFFO0FBQ2xDIn0=