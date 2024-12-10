// Copyright 2018-2024, University of Colorado Boulder
/**
 * QUnit tests for Emitter
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import TinyEmitter from './TinyEmitter.js';
QUnit.module('TinyEmitter');
QUnit.test('TinyEmitter can emit anything', (assert)=>{
    assert.ok(true, 'Token test, because each test must have at least one assert.');
    const e1 = new TinyEmitter();
    e1.emit(1);
    e1.emit(2, 2);
    e1.emit(true);
    e1.emit('2, 2');
    e1.emit(undefined);
    e1.emit(null);
    const e2 = new TinyEmitter();
    e2.emit(new TinyEmitter(), {}, _.noop());
    e2.emit(2, 2);
    e2.emit(true);
    e2.emit('2, 2');
    e2.emit(undefined);
    e2.emit(null);
    e2.emit(new TinyEmitter(), 7, _.noop());
    e2.emit(new TinyEmitter());
});
QUnit.test('Test emit timing TinyEmitter', (assert)=>{
    const e = new TinyEmitter();
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
    const e1 = new TinyEmitter();
    e1.addListener(()=>{
        _.noop();
    });
// const testEmitter = ( emitter, numberOfLoopings ) => {
//
//   const start = Date.now();
//
//   for ( let i = 0; i < numberOfLoopings; i++ ) {
//     emitter.emit();
//   }
//   const end = Date.now();
//   const totalTime = end - start;
//   console.log( `Time for ${numberOfLoopings}: `, totalTime, totalTime / numberOfLoopings );
// };
//
// // No assertions here, but it can be nice to test how expensive emit calls are
// testEmitter( e1, 10000000 );
// testEmitter( e, 10000000 );
});
QUnit.test('TinyEmitter Basics', (assert)=>{
    const stack = [];
    const emitter = new TinyEmitter();
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
    emitter.dispose();
    window.assert && assert.throws(()=>emitter.addListener(()=>{
            _.noop();
        }), 'should throw error when adding a listener to disposed');
});
QUnit.test('TinyEmitter Tricks', (assert)=>{
    const create = (reentrantNotificationStrategy)=>{
        const entries = [];
        const emitter = new TinyEmitter(null, null, reentrantNotificationStrategy);
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
        return entries;
    };
    const stackEntries = create('stack');
    /**
   * Stack notify strategy
   *
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
   */ _.each(stackEntries, (entry)=>{
        assert.ok(!(entry.listener === 'c' && entry.arg === 'first'), 'not C,first');
    });
    assert.equal(stackEntries.length, 7, 'Should have 7 callbacks');
    assert.equal(stackEntries[0].listener, 'a');
    assert.equal(stackEntries[0].arg, 'first');
    assert.equal(stackEntries[1].listener, 'a');
    assert.equal(stackEntries[1].arg, 'second');
    assert.equal(stackEntries[2].listener, 'b');
    assert.equal(stackEntries[2].arg, 'second');
    assert.equal(stackEntries[3].listener, 'a');
    assert.equal(stackEntries[3].arg, 'third');
    assert.equal(stackEntries[4].listener, 'b');
    assert.equal(stackEntries[4].arg, 'third');
    assert.equal(stackEntries[5].listener, 'c');
    assert.equal(stackEntries[5].arg, 'third');
    assert.equal(stackEntries[6].listener, 'b');
    assert.equal(stackEntries[6].arg, 'first');
    /////////////////////////////////////////
    // Queue notify strategy
    const queueEntries = create('queue');
    _.each(stackEntries, (entry)=>{
        assert.ok(!(entry.listener === 'c' && entry.arg === 'first'), 'not C,first');
    });
    const testCorrect = (index, listenerName, emitCall)=>{
        assert.equal(queueEntries[index].listener, listenerName, `${index} correctness`);
        assert.equal(queueEntries[index].arg, emitCall, `${index} correctness`);
    };
    testCorrect(0, 'a', 'first');
    testCorrect(1, 'b', 'first');
    testCorrect(2, 'a', 'second');
    testCorrect(3, 'b', 'second');
    testCorrect(4, 'a', 'third');
    testCorrect(5, 'b', 'third');
    testCorrect(6, 'c', 'third');
});
QUnit.test('TinyEmitter onBeforeNotify', (assert)=>{
    const state = {
        happiness: 0
    };
    const callForHappinessEmitter = new TinyEmitter(()=>{
        state.happiness++;
    });
    let countCalled = 0;
    callForHappinessEmitter.addListener(()=>{
        assert.ok(++countCalled === state.happiness, `happiness should change as emitted: ${countCalled}`);
    });
    callForHappinessEmitter.emit();
    callForHappinessEmitter.emit();
    callForHappinessEmitter.emit();
    callForHappinessEmitter.emit();
    callForHappinessEmitter.emit();
    assert.ok(state.happiness === 5, 'end count');
});
QUnit.test('TinyEmitter reverse and random', (assert)=>{
    assert.ok(true, 'first test');
    const emitter = new TinyEmitter();
    const values = [];
    emitter.addListener(()=>values.push('a'));
    emitter.addListener(()=>values.push('b'));
    emitter.addListener(()=>values.push('c'));
    emitter.addListener(()=>values.push('d'));
    emitter.emit();
    assert.ok(values.join('') === 'abcd', 'normal order');
    // Check these values when running with ?listenerOrder=reverse or ?listenerOrder=random or ?listenerOrder=random(123)
    console.log(values.join(''));
});
QUnit.test('TinyEmitter listener order should match emit order (reentrantNotify:queue)', (assert)=>{
    const emitter = new TinyEmitter(null, null, 'queue');
    let count = 1;
    emitter.addListener((number)=>{
        if (number < 10) {
            emitter.emit(number + 1);
            console.log(number);
        }
    });
    emitter.addListener((number)=>{
        assert.ok(number === count++, `should go in order of emitting: ${number}`);
    });
    emitter.emit(count);
});
QUnit.test('TinyEmitter listener order should match emit order (reentrantNotify:stack)', (assert)=>{
    const emitter = new TinyEmitter(null, null, 'stack');
    let finalCount = 10;
    emitter.addListener((number)=>{
        if (number < 10) {
            emitter.emit(number + 1);
            console.log(number);
        }
    });
    emitter.addListener((number)=>{
        assert.ok(number === finalCount--, `should go in order of emitting: ${number}`);
    });
    emitter.emit(1);
});
QUnit.test('TinyEmitter reentrant listener order should not call newly added listener (reentrant:queue)', (assert)=>{
    const emitter = new TinyEmitter(null, null, 'queue');
    let count = 1;
    const neverCall = (addedNumber)=>{
        return (number)=>{
            assert.ok(number > addedNumber, `this should never be called for ${addedNumber} or earlier since it was added after that number's emit call`);
        };
    };
    emitter.addListener((number)=>{
        if (number < 10) {
            emitter.addListener(neverCall(number));
            emitter.emit(number + 1);
        }
    });
    emitter.addListener((number)=>{
        assert.ok(number === count++, `should go in order of emitting: ${number}`);
    });
    emitter.emit(count);
});
QUnit.test('TinyEmitter reentrant listener order should not call newly added listener (reentrant:stack)', (assert)=>{
    const emitter = new TinyEmitter(null, null, 'stack');
    const finalNumber = 10;
    let countDown = finalNumber;
    const neverCall = (addedNumber)=>{
        return (number)=>{
            assert.ok(number > addedNumber, `this should never be called for ${addedNumber} or earlier since it was added after that number's emit call`);
        };
    };
    emitter.addListener((number)=>{
        if (number < finalNumber) {
            emitter.addListener(neverCall(number));
            emitter.emit(number + 1);
        }
    });
    emitter.addListener((number)=>{
        console.log(number);
        assert.ok(number === countDown--, `should go in order of emitting: ${number}`);
    });
    emitter.emit(1);
});
QUnit.test('TinyEmitter reentrant emit and addListener (reentrantNotify:queue)', (assert)=>{
    const emitter = new TinyEmitter(null, null, 'queue');
    assert.ok('hi');
    // don't change this number without consulting startNumber below
    let count = 1;
    const beforeNestedEmitListenerCalls = [];
    const afterNestedEmitListenerCalls = [];
    emitter.addListener((number)=>{
        if (number < 10) {
            // This listener should be called update the next emit, even though it is recursive
            emitter.addListener((nestedNumber)=>{
                assert.ok(nestedNumber !== number, 'nope');
                if (nestedNumber === number + 1) {
                    beforeNestedEmitListenerCalls.push(nestedNumber);
                }
            });
            emitter.emit(number + 1);
            // This listener won't be called until n+2 since it was added after then n+1 emit
            emitter.addListener((nestedNumber)=>{
                assert.ok(nestedNumber !== number, 'nope');
                assert.ok(nestedNumber !== number + 1, 'nope');
                if (nestedNumber === number + 2) {
                    afterNestedEmitListenerCalls.push(nestedNumber);
                }
            });
        }
    });
    emitter.addListener((number)=>{
        assert.ok(number === count++, `should go in order of emitting: ${number}`);
    });
    emitter.emit(count);
    [
        beforeNestedEmitListenerCalls,
        afterNestedEmitListenerCalls
    ].forEach((collection, index)=>{
        const startNumber = index + 2;
        collection.forEach((number, index)=>{
            assert.ok(number === startNumber + index, `called correctly when emitting ${number}`);
        });
    });
});
QUnit.test('Test multiple reentrant emitters (notify:queue)', (assert)=>{
    const lotsInMiddleEmitter = new TinyEmitter(null, null, 'queue');
    const firstLastEmitter = new TinyEmitter(null, null, 'queue');
    lotsInMiddleEmitter.addListener((number)=>{
        if (number === 1 || number === 10) {
            firstLastEmitter.emit(number);
        }
        if (number < 10) {
            lotsInMiddleEmitter.emit(number + 1);
        }
    });
    firstLastEmitter.addListener((number)=>{
        if (number < 20) {
            firstLastEmitter.emit(number + 1);
        }
    });
    const actual = [];
    lotsInMiddleEmitter.addListener((number)=>{
        actual.push([
            'middle',
            number
        ]);
    });
    firstLastEmitter.addListener((number)=>{
        actual.push([
            'firstLast',
            number
        ]);
    });
    lotsInMiddleEmitter.emit(1);
    const expected = [
        ..._.range(1, 21).map((number)=>[
                'firstLast',
                number
            ]),
        ..._.range(1, 10).map((number)=>[
                'middle',
                number
            ]),
        ..._.range(10, 21).map((number)=>[
                'firstLast',
                number
            ]),
        [
            'middle',
            10
        ]
    ];
    assert.deepEqual(actual, expected, 'notifications should happen like a queueu');
});
QUnit.test('Test multiple reentrant emitters (notify:stack)', (assert)=>{
    const firstEmitter = new TinyEmitter(null, null, 'stack');
    const secondEmitter = new TinyEmitter(null, null, 'stack');
    secondEmitter.addListener((number)=>{
        if (number === 1 || number === 10) {
            firstEmitter.emit(number);
        }
        if (number < 10) {
            secondEmitter.emit(number + 1);
        }
    });
    firstEmitter.addListener((number)=>{
        if (number < 20) {
            firstEmitter.emit(number + 1);
        }
    });
    const actual = [];
    secondEmitter.addListener((number)=>{
        actual.push([
            'first',
            number
        ]);
    });
    firstEmitter.addListener((number)=>{
        actual.push([
            'last',
            number
        ]);
    });
    secondEmitter.emit(1);
    const expected = [
        ..._.range(20, 0).map((number)=>[
                'last',
                number
            ]),
        ..._.range(20, 9).map((number)=>[
                'last',
                number
            ]),
        ..._.range(10, 0).map((number)=>[
                'first',
                number
            ])
    ];
    assert.deepEqual(actual, expected, 'Notifications should happen like a stack');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXJUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCB0ZXN0cyBmb3IgRW1pdHRlclxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4vVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlFbWl0dGVyLCB7IFJlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5IH0gZnJvbSAnLi9UaW55RW1pdHRlci5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ1RpbnlFbWl0dGVyJyApO1xuXG5RVW5pdC50ZXN0KCAnVGlueUVtaXR0ZXIgY2FuIGVtaXQgYW55dGhpbmcnLCBhc3NlcnQgPT4ge1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ1Rva2VuIHRlc3QsIGJlY2F1c2UgZWFjaCB0ZXN0IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgYXNzZXJ0LicgKTtcblxuICBjb25zdCBlMTogVEVtaXR0ZXI8WyBhcmcxOiB1bmtub3duLCBhcmcyPzogdW5rbm93biBdPiA9IG5ldyBUaW55RW1pdHRlcigpO1xuICBlMS5lbWl0KCAxICk7XG4gIGUxLmVtaXQoIDIsIDIgKTtcbiAgZTEuZW1pdCggdHJ1ZSApO1xuICBlMS5lbWl0KCAnMiwgMicgKTtcbiAgZTEuZW1pdCggdW5kZWZpbmVkICk7XG4gIGUxLmVtaXQoIG51bGwgKTtcblxuICBjb25zdCBlMjogVEVtaXR0ZXI8WyBhcmcxOiB1bmtub3duLCBhcmcyPzogdW5rbm93biwgYXJnMz86IHVua25vd24gXT4gPSBuZXcgVGlueUVtaXR0ZXIoKTtcbiAgZTIuZW1pdCggbmV3IFRpbnlFbWl0dGVyKCksIHt9LCBfLm5vb3AoKSApO1xuICBlMi5lbWl0KCAyLCAyICk7XG4gIGUyLmVtaXQoIHRydWUgKTtcbiAgZTIuZW1pdCggJzIsIDInICk7XG4gIGUyLmVtaXQoIHVuZGVmaW5lZCApO1xuICBlMi5lbWl0KCBudWxsICk7XG4gIGUyLmVtaXQoIG5ldyBUaW55RW1pdHRlcigpLCA3LCBfLm5vb3AoKSApO1xuICBlMi5lbWl0KCBuZXcgVGlueUVtaXR0ZXIoKSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGVzdCBlbWl0IHRpbWluZyBUaW55RW1pdHRlcicsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgZSA9IG5ldyBUaW55RW1pdHRlcigpO1xuICBsZXQgeCA9IDA7XG4gIGUuYWRkTGlzdGVuZXIoICgpID0+IHt4Kys7fSApO1xuICBlLmFkZExpc3RlbmVyKCAoKSA9PiB7eCsrO30gKTtcbiAgZS5hZGRMaXN0ZW5lciggKCkgPT4ge3grKzt9ICk7XG4gIGUuYWRkTGlzdGVuZXIoICgpID0+IHt4Kys7fSApO1xuICBlLmFkZExpc3RlbmVyKCAoKSA9PiB7eCsrO30gKTtcblxuICBlLmVtaXQoKTtcblxuICBhc3NlcnQub2soIHggPT09IDUsICdmaXJlZCBhbGwgbGlzdGVuZXJzJyApO1xuXG4gIGNvbnN0IGUxID0gbmV3IFRpbnlFbWl0dGVyKCk7XG4gIGUxLmFkZExpc3RlbmVyKCAoKSA9PiB7IF8ubm9vcCgpOyB9ICk7XG5cbiAgLy8gY29uc3QgdGVzdEVtaXR0ZXIgPSAoIGVtaXR0ZXIsIG51bWJlck9mTG9vcGluZ3MgKSA9PiB7XG4gIC8vXG4gIC8vICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAvL1xuICAvLyAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mTG9vcGluZ3M7IGkrKyApIHtcbiAgLy8gICAgIGVtaXR0ZXIuZW1pdCgpO1xuICAvLyAgIH1cbiAgLy8gICBjb25zdCBlbmQgPSBEYXRlLm5vdygpO1xuICAvLyAgIGNvbnN0IHRvdGFsVGltZSA9IGVuZCAtIHN0YXJ0O1xuICAvLyAgIGNvbnNvbGUubG9nKCBgVGltZSBmb3IgJHtudW1iZXJPZkxvb3BpbmdzfTogYCwgdG90YWxUaW1lLCB0b3RhbFRpbWUgLyBudW1iZXJPZkxvb3BpbmdzICk7XG4gIC8vIH07XG4gIC8vXG4gIC8vIC8vIE5vIGFzc2VydGlvbnMgaGVyZSwgYnV0IGl0IGNhbiBiZSBuaWNlIHRvIHRlc3QgaG93IGV4cGVuc2l2ZSBlbWl0IGNhbGxzIGFyZVxuICAvLyB0ZXN0RW1pdHRlciggZTEsIDEwMDAwMDAwICk7XG4gIC8vIHRlc3RFbWl0dGVyKCBlLCAxMDAwMDAwMCApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGlueUVtaXR0ZXIgQmFzaWNzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgc3RhY2s6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgY29uc3QgZW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuICBjb25zdCBhID0gKCkgPT4ge1xuICAgIHN0YWNrLnB1c2goICdhJyApO1xuICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGIgKTtcbiAgfTtcbiAgY29uc3QgYiA9ICgpID0+IHtcbiAgICBzdGFjay5wdXNoKCAnYicgKTtcbiAgfTtcbiAgZW1pdHRlci5hZGRMaXN0ZW5lciggYSApO1xuICBlbWl0dGVyLmFkZExpc3RlbmVyKCBiICk7XG4gIGVtaXR0ZXIuZW1pdCgpO1xuXG4gIGFzc2VydC5lcXVhbCggc3RhY2subGVuZ3RoLCAyLCAnU2hvdWxkIGhhdmUgcmVjZWl2ZWQgMiBjYWxsYmFja3MnICk7XG4gIGFzc2VydC5lcXVhbCggc3RhY2tbIDAgXSwgJ2EnLCAndHJ1ZScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBzdGFja1sgMSBdLCAnYicsICd0cnVlJyApO1xuXG4gIGFzc2VydC5lcXVhbCggZW1pdHRlci5oYXNMaXN0ZW5lciggYiApLCBmYWxzZSwgJ2Igc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkJyApO1xuXG4gIGVtaXR0ZXIuZGlzcG9zZSgpO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IGVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHsgXy5ub29wKCk7IH0gKSwgJ3Nob3VsZCB0aHJvdyBlcnJvciB3aGVuIGFkZGluZyBhIGxpc3RlbmVyIHRvIGRpc3Bvc2VkJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGlueUVtaXR0ZXIgVHJpY2tzJywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCBjcmVhdGUgPSAoIHJlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5OiBSZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneSApOiBBcnJheTx7IGxpc3RlbmVyOiBzdHJpbmc7IGFyZzogc3RyaW5nIH0+ID0+IHtcbiAgICBjb25zdCBlbnRyaWVzOiBBcnJheTx7IGxpc3RlbmVyOiBzdHJpbmc7IGFyZzogc3RyaW5nIH0+ID0gW107XG5cbiAgICBjb25zdCBlbWl0dGVyOiBURW1pdHRlcjxbIHN0cmluZyBdPiA9IG5ldyBUaW55RW1pdHRlciggbnVsbCwgbnVsbCwgcmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3kgKTtcblxuICAgIGNvbnN0IGEgPSAoIGFyZzogc3RyaW5nICkgPT4ge1xuICAgICAgZW50cmllcy5wdXNoKCB7IGxpc3RlbmVyOiAnYScsIGFyZzogYXJnIH0gKTtcblxuICAgICAgaWYgKCBhcmcgPT09ICdmaXJzdCcgKSB7XG4gICAgICAgIGVtaXR0ZXIuZW1pdCggJ3NlY29uZCcgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGIgPSAoIGFyZzogc3RyaW5nICkgPT4ge1xuICAgICAgZW50cmllcy5wdXNoKCB7IGxpc3RlbmVyOiAnYicsIGFyZzogYXJnIH0gKTtcblxuICAgICAgaWYgKCBhcmcgPT09ICdzZWNvbmQnICkge1xuICAgICAgICBlbWl0dGVyLmFkZExpc3RlbmVyKCBjICk7XG4gICAgICAgIGVtaXR0ZXIuZW1pdCggJ3RoaXJkJyApO1xuICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgYyA9ICggYXJnOiBzdHJpbmcgKSA9PiB7XG4gICAgICBlbnRyaWVzLnB1c2goIHsgbGlzdGVuZXI6ICdjJywgYXJnOiBhcmcgfSApO1xuICAgIH07XG5cbiAgICBlbWl0dGVyLmFkZExpc3RlbmVyKCBhICk7XG4gICAgZW1pdHRlci5hZGRMaXN0ZW5lciggYiApO1xuICAgIGVtaXR0ZXIuZW1pdCggJ2ZpcnN0JyApO1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9O1xuXG4gIGNvbnN0IHN0YWNrRW50cmllcyA9IGNyZWF0ZSggJ3N0YWNrJyApO1xuXG4gIC8qKlxuICAgKiBTdGFjayBub3RpZnkgc3RyYXRlZ3lcbiAgICpcbiAgICogRXhwZWN0ZWQgb3JkZXI6XG4gICAqICAgYSBmaXJzdFxuICAgKiAgICAgYSBzZWNvbmRcbiAgICogICAgIGIgc2Vjb25kXG4gICAqICAgICAgIGEgdGhpcmRcbiAgICogICAgICAgYiB0aGlyZFxuICAgKiAgICAgICBjIHRoaXJkXG4gICAqICAgYiBmaXJzdFxuICAgKlxuICAgKiBJdCBsb29rcyBsaWtlIFwiYyBmaXJzdFwiIGlzIChjdXJyZW50bHk/KSBiZWluZyB0cmlnZ2VyZWQgc2luY2UgZGVmZW5kQ2FsbGJhY2tzIG9ubHkgZGVmZW5kcyB0aGUgdG9wIG9mIHRoZSBzdGFjay5cbiAgICogSWYgdGhlIHN0YWNrIGlzIFsgdW5kZWZlbmRlZCwgdW5kZWZlbmRlZCBdLCBjaGFuZ2luZyBsaXN0ZW5lcnMgY29waWVzIG9ubHkgdGhlIHRvcCwgbGVhdmluZ1xuICAgKiBbIHVuZGVmZW5kZWQsIGRlZmVuZGVkIF0sIGFuZCBvdXIgZmlyc3QgZXZlbnQgdHJpZ2dlcnMgYSBsaXN0ZW5lciB0aGF0IHdhc24ndCBsaXN0ZW5pbmcgd2hlbiBpdCB3YXMgY2FsbGVkLlxuICAgKi9cbiAgXy5lYWNoKCBzdGFja0VudHJpZXMsIGVudHJ5ID0+IHtcbiAgICBhc3NlcnQub2soICEoIGVudHJ5Lmxpc3RlbmVyID09PSAnYycgJiYgZW50cnkuYXJnID09PSAnZmlyc3QnICksICdub3QgQyxmaXJzdCcgKTtcbiAgfSApO1xuXG4gIGFzc2VydC5lcXVhbCggc3RhY2tFbnRyaWVzLmxlbmd0aCwgNywgJ1Nob3VsZCBoYXZlIDcgY2FsbGJhY2tzJyApO1xuXG4gIGFzc2VydC5lcXVhbCggc3RhY2tFbnRyaWVzWyAwIF0ubGlzdGVuZXIsICdhJyApO1xuICBhc3NlcnQuZXF1YWwoIHN0YWNrRW50cmllc1sgMCBdLmFyZywgJ2ZpcnN0JyApO1xuXG4gIGFzc2VydC5lcXVhbCggc3RhY2tFbnRyaWVzWyAxIF0ubGlzdGVuZXIsICdhJyApO1xuICBhc3NlcnQuZXF1YWwoIHN0YWNrRW50cmllc1sgMSBdLmFyZywgJ3NlY29uZCcgKTtcblxuICBhc3NlcnQuZXF1YWwoIHN0YWNrRW50cmllc1sgMiBdLmxpc3RlbmVyLCAnYicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBzdGFja0VudHJpZXNbIDIgXS5hcmcsICdzZWNvbmQnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBzdGFja0VudHJpZXNbIDMgXS5saXN0ZW5lciwgJ2EnICk7XG4gIGFzc2VydC5lcXVhbCggc3RhY2tFbnRyaWVzWyAzIF0uYXJnLCAndGhpcmQnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBzdGFja0VudHJpZXNbIDQgXS5saXN0ZW5lciwgJ2InICk7XG4gIGFzc2VydC5lcXVhbCggc3RhY2tFbnRyaWVzWyA0IF0uYXJnLCAndGhpcmQnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBzdGFja0VudHJpZXNbIDUgXS5saXN0ZW5lciwgJ2MnICk7XG4gIGFzc2VydC5lcXVhbCggc3RhY2tFbnRyaWVzWyA1IF0uYXJnLCAndGhpcmQnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBzdGFja0VudHJpZXNbIDYgXS5saXN0ZW5lciwgJ2InICk7XG4gIGFzc2VydC5lcXVhbCggc3RhY2tFbnRyaWVzWyA2IF0uYXJnLCAnZmlyc3QnICk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gUXVldWUgbm90aWZ5IHN0cmF0ZWd5XG4gIGNvbnN0IHF1ZXVlRW50cmllcyA9IGNyZWF0ZSggJ3F1ZXVlJyApO1xuXG4gIF8uZWFjaCggc3RhY2tFbnRyaWVzLCBlbnRyeSA9PiB7XG4gICAgYXNzZXJ0Lm9rKCAhKCBlbnRyeS5saXN0ZW5lciA9PT0gJ2MnICYmIGVudHJ5LmFyZyA9PT0gJ2ZpcnN0JyApLCAnbm90IEMsZmlyc3QnICk7XG4gIH0gKTtcbiAgY29uc3QgdGVzdENvcnJlY3QgPSAoIGluZGV4OiBudW1iZXIsIGxpc3RlbmVyTmFtZTogc3RyaW5nLCBlbWl0Q2FsbDogc3RyaW5nICkgPT4ge1xuICAgIGFzc2VydC5lcXVhbCggcXVldWVFbnRyaWVzWyBpbmRleCBdLmxpc3RlbmVyLCBsaXN0ZW5lck5hbWUsIGAke2luZGV4fSBjb3JyZWN0bmVzc2AgKTtcbiAgICBhc3NlcnQuZXF1YWwoIHF1ZXVlRW50cmllc1sgaW5kZXggXS5hcmcsIGVtaXRDYWxsLCBgJHtpbmRleH0gY29ycmVjdG5lc3NgICk7XG4gIH07XG4gIHRlc3RDb3JyZWN0KCAwLCAnYScsICdmaXJzdCcgKTtcbiAgdGVzdENvcnJlY3QoIDEsICdiJywgJ2ZpcnN0JyApO1xuICB0ZXN0Q29ycmVjdCggMiwgJ2EnLCAnc2Vjb25kJyApO1xuICB0ZXN0Q29ycmVjdCggMywgJ2InLCAnc2Vjb25kJyApO1xuICB0ZXN0Q29ycmVjdCggNCwgJ2EnLCAndGhpcmQnICk7XG4gIHRlc3RDb3JyZWN0KCA1LCAnYicsICd0aGlyZCcgKTtcbiAgdGVzdENvcnJlY3QoIDYsICdjJywgJ3RoaXJkJyApO1xufSApO1xuXG5cblFVbml0LnRlc3QoICdUaW55RW1pdHRlciBvbkJlZm9yZU5vdGlmeScsIGFzc2VydCA9PiB7XG5cbiAgY29uc3Qgc3RhdGUgPSB7IGhhcHBpbmVzczogMCB9O1xuXG4gIGNvbnN0IGNhbGxGb3JIYXBwaW5lc3NFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCAoKSA9PiB7XG4gICAgc3RhdGUuaGFwcGluZXNzKys7XG4gIH0gKTtcblxuICBsZXQgY291bnRDYWxsZWQgPSAwO1xuICBjYWxsRm9ySGFwcGluZXNzRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuXG4gICAgYXNzZXJ0Lm9rKCArK2NvdW50Q2FsbGVkID09PSBzdGF0ZS5oYXBwaW5lc3MsIGBoYXBwaW5lc3Mgc2hvdWxkIGNoYW5nZSBhcyBlbWl0dGVkOiAke2NvdW50Q2FsbGVkfWAgKTtcblxuICB9ICk7XG5cbiAgY2FsbEZvckhhcHBpbmVzc0VtaXR0ZXIuZW1pdCgpO1xuICBjYWxsRm9ySGFwcGluZXNzRW1pdHRlci5lbWl0KCk7XG4gIGNhbGxGb3JIYXBwaW5lc3NFbWl0dGVyLmVtaXQoKTtcbiAgY2FsbEZvckhhcHBpbmVzc0VtaXR0ZXIuZW1pdCgpO1xuICBjYWxsRm9ySGFwcGluZXNzRW1pdHRlci5lbWl0KCk7XG4gIGFzc2VydC5vayggc3RhdGUuaGFwcGluZXNzID09PSA1LCAnZW5kIGNvdW50JyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGlueUVtaXR0ZXIgcmV2ZXJzZSBhbmQgcmFuZG9tJywgYXNzZXJ0ID0+IHtcblxuICBhc3NlcnQub2soIHRydWUsICdmaXJzdCB0ZXN0JyApO1xuXG4gIGNvbnN0IGVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcbiAgY29uc3QgdmFsdWVzOiBzdHJpbmdbXSA9IFtdO1xuICBlbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB2YWx1ZXMucHVzaCggJ2EnICkgKTtcbiAgZW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gdmFsdWVzLnB1c2goICdiJyApICk7XG4gIGVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHZhbHVlcy5wdXNoKCAnYycgKSApO1xuICBlbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB2YWx1ZXMucHVzaCggJ2QnICkgKTtcblxuICBlbWl0dGVyLmVtaXQoKTtcbiAgYXNzZXJ0Lm9rKCB2YWx1ZXMuam9pbiggJycgKSA9PT0gJ2FiY2QnLCAnbm9ybWFsIG9yZGVyJyApO1xuXG4gIC8vIENoZWNrIHRoZXNlIHZhbHVlcyB3aGVuIHJ1bm5pbmcgd2l0aCA/bGlzdGVuZXJPcmRlcj1yZXZlcnNlIG9yID9saXN0ZW5lck9yZGVyPXJhbmRvbSBvciA/bGlzdGVuZXJPcmRlcj1yYW5kb20oMTIzKVxuICBjb25zb2xlLmxvZyggdmFsdWVzLmpvaW4oICcnICkgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1RpbnlFbWl0dGVyIGxpc3RlbmVyIG9yZGVyIHNob3VsZCBtYXRjaCBlbWl0IG9yZGVyIChyZWVudHJhbnROb3RpZnk6cXVldWUpJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgZW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcjxbIG51bWJlciBdPiggbnVsbCwgbnVsbCwgJ3F1ZXVlJyApO1xuICBsZXQgY291bnQgPSAxO1xuICBlbWl0dGVyLmFkZExpc3RlbmVyKCBudW1iZXIgPT4ge1xuICAgIGlmICggbnVtYmVyIDwgMTAgKSB7XG4gICAgICBlbWl0dGVyLmVtaXQoIG51bWJlciArIDEgKTtcbiAgICAgIGNvbnNvbGUubG9nKCBudW1iZXIgKTtcbiAgICB9XG4gIH0gKTtcbiAgZW1pdHRlci5hZGRMaXN0ZW5lciggbnVtYmVyID0+IHtcbiAgICBhc3NlcnQub2soIG51bWJlciA9PT0gY291bnQrKywgYHNob3VsZCBnbyBpbiBvcmRlciBvZiBlbWl0dGluZzogJHtudW1iZXJ9YCApO1xuICB9ICk7XG4gIGVtaXR0ZXIuZW1pdCggY291bnQgKTtcbn0gKTtcblxuXG5RVW5pdC50ZXN0KCAnVGlueUVtaXR0ZXIgbGlzdGVuZXIgb3JkZXIgc2hvdWxkIG1hdGNoIGVtaXQgb3JkZXIgKHJlZW50cmFudE5vdGlmeTpzdGFjayknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBlbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyPFsgbnVtYmVyIF0+KCBudWxsLCBudWxsLCAnc3RhY2snICk7XG4gIGxldCBmaW5hbENvdW50ID0gMTA7XG4gIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIG51bWJlciA9PiB7XG4gICAgaWYgKCBudW1iZXIgPCAxMCApIHtcbiAgICAgIGVtaXR0ZXIuZW1pdCggbnVtYmVyICsgMSApO1xuICAgICAgY29uc29sZS5sb2coIG51bWJlciApO1xuICAgIH1cbiAgfSApO1xuICBlbWl0dGVyLmFkZExpc3RlbmVyKCBudW1iZXIgPT4ge1xuICAgIGFzc2VydC5vayggbnVtYmVyID09PSBmaW5hbENvdW50LS0sIGBzaG91bGQgZ28gaW4gb3JkZXIgb2YgZW1pdHRpbmc6ICR7bnVtYmVyfWAgKTtcbiAgfSApO1xuICBlbWl0dGVyLmVtaXQoIDEgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1RpbnlFbWl0dGVyIHJlZW50cmFudCBsaXN0ZW5lciBvcmRlciBzaG91bGQgbm90IGNhbGwgbmV3bHkgYWRkZWQgbGlzdGVuZXIgKHJlZW50cmFudDpxdWV1ZSknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBlbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyPFsgbnVtYmVyIF0+KCBudWxsLCBudWxsLCAncXVldWUnICk7XG4gIGxldCBjb3VudCA9IDE7XG4gIGNvbnN0IG5ldmVyQ2FsbCA9ICggYWRkZWROdW1iZXI6IG51bWJlciApID0+IHtcbiAgICByZXR1cm4gKCBudW1iZXI6IG51bWJlciApID0+IHtcbiAgICAgIGFzc2VydC5vayggbnVtYmVyID4gYWRkZWROdW1iZXIsIGB0aGlzIHNob3VsZCBuZXZlciBiZSBjYWxsZWQgZm9yICR7YWRkZWROdW1iZXJ9IG9yIGVhcmxpZXIgc2luY2UgaXQgd2FzIGFkZGVkIGFmdGVyIHRoYXQgbnVtYmVyJ3MgZW1pdCBjYWxsYCApO1xuICAgIH07XG4gIH07XG4gIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIG51bWJlciA9PiB7XG4gICAgaWYgKCBudW1iZXIgPCAxMCApIHtcbiAgICAgIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIG5ldmVyQ2FsbCggbnVtYmVyICkgKTtcbiAgICAgIGVtaXR0ZXIuZW1pdCggbnVtYmVyICsgMSApO1xuICAgIH1cbiAgfSApO1xuICBlbWl0dGVyLmFkZExpc3RlbmVyKCBudW1iZXIgPT4ge1xuICAgIGFzc2VydC5vayggbnVtYmVyID09PSBjb3VudCsrLCBgc2hvdWxkIGdvIGluIG9yZGVyIG9mIGVtaXR0aW5nOiAke251bWJlcn1gICk7XG4gIH0gKTtcbiAgZW1pdHRlci5lbWl0KCBjb3VudCApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGlueUVtaXR0ZXIgcmVlbnRyYW50IGxpc3RlbmVyIG9yZGVyIHNob3VsZCBub3QgY2FsbCBuZXdseSBhZGRlZCBsaXN0ZW5lciAocmVlbnRyYW50OnN0YWNrKScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXI8WyBudW1iZXIgXT4oIG51bGwsIG51bGwsICdzdGFjaycgKTtcbiAgY29uc3QgZmluYWxOdW1iZXIgPSAxMDtcbiAgbGV0IGNvdW50RG93biA9IGZpbmFsTnVtYmVyO1xuICBjb25zdCBuZXZlckNhbGwgPSAoIGFkZGVkTnVtYmVyOiBudW1iZXIgKSA9PiB7XG4gICAgcmV0dXJuICggbnVtYmVyOiBudW1iZXIgKSA9PiB7XG4gICAgICBhc3NlcnQub2soIG51bWJlciA+IGFkZGVkTnVtYmVyLCBgdGhpcyBzaG91bGQgbmV2ZXIgYmUgY2FsbGVkIGZvciAke2FkZGVkTnVtYmVyfSBvciBlYXJsaWVyIHNpbmNlIGl0IHdhcyBhZGRlZCBhZnRlciB0aGF0IG51bWJlcidzIGVtaXQgY2FsbGAgKTtcbiAgICB9O1xuICB9O1xuICBlbWl0dGVyLmFkZExpc3RlbmVyKCBudW1iZXIgPT4ge1xuICAgIGlmICggbnVtYmVyIDwgZmluYWxOdW1iZXIgKSB7XG4gICAgICBlbWl0dGVyLmFkZExpc3RlbmVyKCBuZXZlckNhbGwoIG51bWJlciApICk7XG4gICAgICBlbWl0dGVyLmVtaXQoIG51bWJlciArIDEgKTtcbiAgICB9XG4gIH0gKTtcbiAgZW1pdHRlci5hZGRMaXN0ZW5lciggbnVtYmVyID0+IHtcbiAgICBjb25zb2xlLmxvZyggbnVtYmVyICk7XG4gICAgYXNzZXJ0Lm9rKCBudW1iZXIgPT09IGNvdW50RG93bi0tLCBgc2hvdWxkIGdvIGluIG9yZGVyIG9mIGVtaXR0aW5nOiAke251bWJlcn1gICk7XG4gIH0gKTtcbiAgZW1pdHRlci5lbWl0KCAxICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUaW55RW1pdHRlciByZWVudHJhbnQgZW1pdCBhbmQgYWRkTGlzdGVuZXIgKHJlZW50cmFudE5vdGlmeTpxdWV1ZSknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBlbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyPFsgbnVtYmVyIF0+KCBudWxsLCBudWxsLCAncXVldWUnICk7XG4gIGFzc2VydC5vayggJ2hpJyApO1xuXG4gIC8vIGRvbid0IGNoYW5nZSB0aGlzIG51bWJlciB3aXRob3V0IGNvbnN1bHRpbmcgc3RhcnROdW1iZXIgYmVsb3dcbiAgbGV0IGNvdW50ID0gMTtcbiAgY29uc3QgYmVmb3JlTmVzdGVkRW1pdExpc3RlbmVyQ2FsbHM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGFmdGVyTmVzdGVkRW1pdExpc3RlbmVyQ2FsbHM6IG51bWJlcltdID0gW107XG4gIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIG51bWJlciA9PiB7XG4gICAgaWYgKCBudW1iZXIgPCAxMCApIHtcblxuICAgICAgLy8gVGhpcyBsaXN0ZW5lciBzaG91bGQgYmUgY2FsbGVkIHVwZGF0ZSB0aGUgbmV4dCBlbWl0LCBldmVuIHRob3VnaCBpdCBpcyByZWN1cnNpdmVcbiAgICAgIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIG5lc3RlZE51bWJlciA9PiB7XG4gICAgICAgIGFzc2VydC5vayggbmVzdGVkTnVtYmVyICE9PSBudW1iZXIsICdub3BlJyApO1xuICAgICAgICBpZiAoIG5lc3RlZE51bWJlciA9PT0gbnVtYmVyICsgMSApIHtcbiAgICAgICAgICBiZWZvcmVOZXN0ZWRFbWl0TGlzdGVuZXJDYWxscy5wdXNoKCBuZXN0ZWROdW1iZXIgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgICAgZW1pdHRlci5lbWl0KCBudW1iZXIgKyAxICk7XG5cbiAgICAgIC8vIFRoaXMgbGlzdGVuZXIgd29uJ3QgYmUgY2FsbGVkIHVudGlsIG4rMiBzaW5jZSBpdCB3YXMgYWRkZWQgYWZ0ZXIgdGhlbiBuKzEgZW1pdFxuICAgICAgZW1pdHRlci5hZGRMaXN0ZW5lciggbmVzdGVkTnVtYmVyID0+IHtcbiAgICAgICAgYXNzZXJ0Lm9rKCBuZXN0ZWROdW1iZXIgIT09IG51bWJlciwgJ25vcGUnICk7XG4gICAgICAgIGFzc2VydC5vayggbmVzdGVkTnVtYmVyICE9PSBudW1iZXIgKyAxLCAnbm9wZScgKTtcbiAgICAgICAgaWYgKCBuZXN0ZWROdW1iZXIgPT09IG51bWJlciArIDIgKSB7XG4gICAgICAgICAgYWZ0ZXJOZXN0ZWRFbWl0TGlzdGVuZXJDYWxscy5wdXNoKCBuZXN0ZWROdW1iZXIgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfSApO1xuXG4gIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIG51bWJlciA9PiB7XG4gICAgYXNzZXJ0Lm9rKCBudW1iZXIgPT09IGNvdW50KyssIGBzaG91bGQgZ28gaW4gb3JkZXIgb2YgZW1pdHRpbmc6ICR7bnVtYmVyfWAgKTtcbiAgfSApO1xuICBlbWl0dGVyLmVtaXQoIGNvdW50ICk7XG5cbiAgW1xuICAgIGJlZm9yZU5lc3RlZEVtaXRMaXN0ZW5lckNhbGxzLFxuICAgIGFmdGVyTmVzdGVkRW1pdExpc3RlbmVyQ2FsbHNcbiAgXS5mb3JFYWNoKCAoIGNvbGxlY3Rpb24sIGluZGV4ICkgPT4ge1xuXG4gICAgY29uc3Qgc3RhcnROdW1iZXIgPSBpbmRleCArIDI7XG4gICAgY29sbGVjdGlvbi5mb3JFYWNoKCAoIG51bWJlciwgaW5kZXggKSA9PiB7XG4gICAgICBhc3NlcnQub2soIG51bWJlciA9PT0gc3RhcnROdW1iZXIgKyBpbmRleCwgYGNhbGxlZCBjb3JyZWN0bHkgd2hlbiBlbWl0dGluZyAke251bWJlcn1gICk7XG4gICAgfSApO1xuICB9ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0IG11bHRpcGxlIHJlZW50cmFudCBlbWl0dGVycyAobm90aWZ5OnF1ZXVlKScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGxvdHNJbk1pZGRsZUVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXI8WyBudW1iZXIgXT4oIG51bGwsIG51bGwsICdxdWV1ZScgKTtcbiAgY29uc3QgZmlyc3RMYXN0RW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcjxbIG51bWJlciBdPiggbnVsbCwgbnVsbCwgJ3F1ZXVlJyApO1xuICBsb3RzSW5NaWRkbGVFbWl0dGVyLmFkZExpc3RlbmVyKCBudW1iZXIgPT4ge1xuICAgIGlmICggbnVtYmVyID09PSAxIHx8IG51bWJlciA9PT0gMTAgKSB7XG4gICAgICBmaXJzdExhc3RFbWl0dGVyLmVtaXQoIG51bWJlciApO1xuICAgIH1cbiAgICBpZiAoIG51bWJlciA8IDEwICkge1xuICAgICAgbG90c0luTWlkZGxlRW1pdHRlci5lbWl0KCBudW1iZXIgKyAxICk7XG4gICAgfVxuICB9ICk7XG4gIGZpcnN0TGFzdEVtaXR0ZXIuYWRkTGlzdGVuZXIoIG51bWJlciA9PiB7XG4gICAgaWYgKCBudW1iZXIgPCAyMCApIHtcbiAgICAgIGZpcnN0TGFzdEVtaXR0ZXIuZW1pdCggbnVtYmVyICsgMSApO1xuICAgIH1cbiAgfSApO1xuICBjb25zdCBhY3R1YWw6IEFycmF5PHJlYWRvbmx5IFsgc3RyaW5nLCBudW1iZXIgXT4gPSBbXTtcbiAgbG90c0luTWlkZGxlRW1pdHRlci5hZGRMaXN0ZW5lciggbnVtYmVyID0+IHtcbiAgICBhY3R1YWwucHVzaCggWyAnbWlkZGxlJywgbnVtYmVyIF0gYXMgY29uc3QgKTtcbiAgfSApO1xuICBmaXJzdExhc3RFbWl0dGVyLmFkZExpc3RlbmVyKCBudW1iZXIgPT4ge1xuICAgIGFjdHVhbC5wdXNoKCBbICdmaXJzdExhc3QnLCBudW1iZXIgXSBhcyBjb25zdCApO1xuICB9ICk7XG4gIGxvdHNJbk1pZGRsZUVtaXR0ZXIuZW1pdCggMSApO1xuXG4gIGNvbnN0IGV4cGVjdGVkOiBBcnJheTxyZWFkb25seSBbIHN0cmluZywgbnVtYmVyIF0+ID0gW1xuICAgIC4uLl8ucmFuZ2UoIDEsIDIxICkubWFwKCBudW1iZXIgPT4gWyAnZmlyc3RMYXN0JywgbnVtYmVyIF0gYXMgY29uc3QgKSxcbiAgICAuLi5fLnJhbmdlKCAxLCAxMCApLm1hcCggbnVtYmVyID0+IFsgJ21pZGRsZScsIG51bWJlciBdIGFzIGNvbnN0ICksXG4gICAgLi4uXy5yYW5nZSggMTAsIDIxICkubWFwKCBudW1iZXIgPT4gWyAnZmlyc3RMYXN0JywgbnVtYmVyIF0gYXMgY29uc3QgKSxcbiAgICBbICdtaWRkbGUnLCAxMCBdXG4gIF07XG4gIGFzc2VydC5kZWVwRXF1YWwoIGFjdHVhbCwgZXhwZWN0ZWQsICdub3RpZmljYXRpb25zIHNob3VsZCBoYXBwZW4gbGlrZSBhIHF1ZXVldScgKTtcbn0gKTtcblxuXG5RVW5pdC50ZXN0KCAnVGVzdCBtdWx0aXBsZSByZWVudHJhbnQgZW1pdHRlcnMgKG5vdGlmeTpzdGFjayknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBmaXJzdEVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXI8WyBudW1iZXIgXT4oIG51bGwsIG51bGwsICdzdGFjaycgKTtcbiAgY29uc3Qgc2Vjb25kRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcjxbIG51bWJlciBdPiggbnVsbCwgbnVsbCwgJ3N0YWNrJyApO1xuICBzZWNvbmRFbWl0dGVyLmFkZExpc3RlbmVyKCBudW1iZXIgPT4ge1xuICAgIGlmICggbnVtYmVyID09PSAxIHx8IG51bWJlciA9PT0gMTAgKSB7XG4gICAgICBmaXJzdEVtaXR0ZXIuZW1pdCggbnVtYmVyICk7XG4gICAgfVxuICAgIGlmICggbnVtYmVyIDwgMTAgKSB7XG4gICAgICBzZWNvbmRFbWl0dGVyLmVtaXQoIG51bWJlciArIDEgKTtcbiAgICB9XG4gIH0gKTtcbiAgZmlyc3RFbWl0dGVyLmFkZExpc3RlbmVyKCBudW1iZXIgPT4ge1xuICAgIGlmICggbnVtYmVyIDwgMjAgKSB7XG4gICAgICBmaXJzdEVtaXR0ZXIuZW1pdCggbnVtYmVyICsgMSApO1xuICAgIH1cbiAgfSApO1xuICBjb25zdCBhY3R1YWw6IEFycmF5PHJlYWRvbmx5IFsgc3RyaW5nLCBudW1iZXIgXT4gPSBbXTtcbiAgc2Vjb25kRW1pdHRlci5hZGRMaXN0ZW5lciggbnVtYmVyID0+IHtcbiAgICBhY3R1YWwucHVzaCggWyAnZmlyc3QnLCBudW1iZXIgXSBhcyBjb25zdCApO1xuICB9ICk7XG4gIGZpcnN0RW1pdHRlci5hZGRMaXN0ZW5lciggbnVtYmVyID0+IHtcbiAgICBhY3R1YWwucHVzaCggWyAnbGFzdCcsIG51bWJlciBdIGFzIGNvbnN0ICk7XG4gIH0gKTtcbiAgc2Vjb25kRW1pdHRlci5lbWl0KCAxICk7XG5cbiAgY29uc3QgZXhwZWN0ZWQ6IEFycmF5PHJlYWRvbmx5IFsgc3RyaW5nLCBudW1iZXIgXT4gPSBbXG4gICAgLi4uXy5yYW5nZSggMjAsIDAgKS5tYXAoIG51bWJlciA9PiBbICdsYXN0JywgbnVtYmVyIF0gYXMgY29uc3QgKSxcbiAgICAuLi5fLnJhbmdlKCAyMCwgOSApLm1hcCggbnVtYmVyID0+IFsgJ2xhc3QnLCBudW1iZXIgXSBhcyBjb25zdCApLFxuICAgIC4uLl8ucmFuZ2UoIDEwLCAwICkubWFwKCBudW1iZXIgPT4gWyAnZmlyc3QnLCBudW1iZXIgXSBhcyBjb25zdCApXG4gIF07XG4gIGFzc2VydC5kZWVwRXF1YWwoIGFjdHVhbCwgZXhwZWN0ZWQsICdOb3RpZmljYXRpb25zIHNob3VsZCBoYXBwZW4gbGlrZSBhIHN0YWNrJyApO1xufSApOyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwiZTEiLCJlbWl0IiwidW5kZWZpbmVkIiwiZTIiLCJfIiwibm9vcCIsImUiLCJ4IiwiYWRkTGlzdGVuZXIiLCJzdGFjayIsImVtaXR0ZXIiLCJhIiwicHVzaCIsInJlbW92ZUxpc3RlbmVyIiwiYiIsImVxdWFsIiwibGVuZ3RoIiwiaGFzTGlzdGVuZXIiLCJkaXNwb3NlIiwid2luZG93IiwidGhyb3dzIiwiY3JlYXRlIiwicmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3kiLCJlbnRyaWVzIiwiYXJnIiwibGlzdGVuZXIiLCJjIiwic3RhY2tFbnRyaWVzIiwiZWFjaCIsImVudHJ5IiwicXVldWVFbnRyaWVzIiwidGVzdENvcnJlY3QiLCJpbmRleCIsImxpc3RlbmVyTmFtZSIsImVtaXRDYWxsIiwic3RhdGUiLCJoYXBwaW5lc3MiLCJjYWxsRm9ySGFwcGluZXNzRW1pdHRlciIsImNvdW50Q2FsbGVkIiwidmFsdWVzIiwiam9pbiIsImNvbnNvbGUiLCJsb2ciLCJjb3VudCIsIm51bWJlciIsImZpbmFsQ291bnQiLCJuZXZlckNhbGwiLCJhZGRlZE51bWJlciIsImZpbmFsTnVtYmVyIiwiY291bnREb3duIiwiYmVmb3JlTmVzdGVkRW1pdExpc3RlbmVyQ2FsbHMiLCJhZnRlck5lc3RlZEVtaXRMaXN0ZW5lckNhbGxzIiwibmVzdGVkTnVtYmVyIiwiZm9yRWFjaCIsImNvbGxlY3Rpb24iLCJzdGFydE51bWJlciIsImxvdHNJbk1pZGRsZUVtaXR0ZXIiLCJmaXJzdExhc3RFbWl0dGVyIiwiYWN0dWFsIiwiZXhwZWN0ZWQiLCJyYW5nZSIsIm1hcCIsImRlZXBFcXVhbCIsImZpcnN0RW1pdHRlciIsInNlY29uZEVtaXR0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FHRCxPQUFPQSxpQkFBb0QsbUJBQW1CO0FBRTlFQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLGlDQUFpQ0MsQ0FBQUE7SUFFM0NBLE9BQU9DLEVBQUUsQ0FBRSxNQUFNO0lBRWpCLE1BQU1DLEtBQWtELElBQUlOO0lBQzVETSxHQUFHQyxJQUFJLENBQUU7SUFDVEQsR0FBR0Ms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