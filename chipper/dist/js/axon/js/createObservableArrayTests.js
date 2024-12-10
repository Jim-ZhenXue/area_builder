// Copyright 2020-2024, University of Colorado Boulder
/**
 * QUnit tests for createObservableArray
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Random from '../../dot/js/Random.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import createObservableArray from './createObservableArray.js';
QUnit.module('createObservableArray');
QUnit.test('Hello', (assert)=>{
    assert.ok('first test');
    const run = (name, command)=>{
        console.log(`START: ${name}`);
        const result = command();
        console.log(`END: ${name}\n\n`);
        return result;
    };
    const observableArray = run('create', ()=>createObservableArray({
            elements: [
                'a',
                'bc'
            ]
        }));
    assert.ok(Array.isArray(observableArray), 'isArray check');
    assert.ok(observableArray instanceof Array, 'instanceof check'); // eslint-disable-line phet/no-instanceof-array
    run('push hello', ()=>observableArray.push('hello'));
    run('set element 0', ()=>{
        observableArray[0] = 'dinosaur';
    });
    run('set element 5', ()=>{
        observableArray[5] = 'hamburger';
    });
    run('length = 0', ()=>{
        observableArray.length = 0;
    });
    run('a,b,c', ()=>{
        observableArray.push('a');
        observableArray.push('b');
        observableArray.push('c');
    });
    run('splice', ()=>observableArray.splice(0, 1));
});
// Creates an array that is tested with the given modifiers against the expected results.
const testArrayEmitters = (assert, modifier, expected)=>{
    const array = createObservableArray();
    const deltas = [];
    array.elementAddedEmitter.addListener((e)=>deltas.push({
            type: 'added',
            value: e
        }));
    array.elementRemovedEmitter.addListener((e)=>deltas.push({
            type: 'removed',
            value: e
        }));
    modifier(array);
    assert.deepEqual(deltas, expected);
};
QUnit.test('Test axon array length', (assert)=>{
    const array = createObservableArray();
    array.push('hello');
    assert.equal(array.lengthProperty.value, 1, 'array lengthProperty test');
    assert.equal(array.length, 1, 'array length test');
    array.pop();
    assert.equal(array.lengthProperty.value, 0, 'array lengthProperty test');
    assert.equal(array.length, 0, 'array length test');
    array.push(1, 2, 3);
    assert.equal(array.lengthProperty.value, 3, 'array lengthProperty test');
    assert.equal(array.length, 3, 'array length test');
    array.shift();
    assert.equal(array.lengthProperty.value, 2, 'array lengthProperty test');
    assert.equal(array.length, 2, 'array length test');
    array.splice(0, 2, 'parrot', 'anemone', 'blue');
    assert.equal(array.lengthProperty.value, 3, 'array lengthProperty test');
    assert.equal(array.length, 3, 'array length test');
    array.unshift('qunit', 'test');
    assert.equal(array.lengthProperty.value, 5, 'array lengthProperty test');
    assert.equal(array.length, 5, 'array length test');
    array.length = 0;
    assert.equal(array.lengthProperty.value, 0, 'array lengthProperty test after setLengthAndNotify');
    assert.equal(array.length, 0, 'array length test after setLengthAndNotify');
});
QUnit.test('Test delete', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push('test');
        delete array[0];
        // FOR REVIEWER: The commented out code does not appear to have been testing anything. Expected does not include any
        // return value comparisons for array.hello. Should this be actually testing something or safe to delete?
        // array.hello = 'there';
        // delete array.hello;
        array[-7] = 'time';
        delete array[-7];
    }, [
        {
            type: 'added',
            value: 'test'
        },
        {
            type: 'removed',
            value: 'test'
        }
    ]);
});
QUnit.test('Test same value', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push('test');
        array.shuffle(new Random()); // eslint-disable-line phet/bad-sim-text
    }, [
        {
            type: 'added',
            value: 'test'
        }
    ]);
});
QUnit.test('Test axon array', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push('test');
        array.push('test');
        array.push('test');
        array.push('test');
        array.length = 1;
        array.pop();
        array.push('hello');
        array.push('hello');
        array.push('hello');
        array.push('time');
        arrayRemove(array, 'hello');
    }, [
        {
            type: 'added',
            value: 'test'
        },
        {
            type: 'added',
            value: 'test'
        },
        {
            type: 'added',
            value: 'test'
        },
        {
            type: 'added',
            value: 'test'
        },
        {
            type: 'removed',
            value: 'test'
        },
        {
            type: 'removed',
            value: 'test'
        },
        {
            type: 'removed',
            value: 'test'
        },
        {
            type: 'removed',
            value: 'test'
        },
        {
            type: 'added',
            value: 'hello'
        },
        {
            type: 'added',
            value: 'hello'
        },
        {
            type: 'added',
            value: 'hello'
        },
        {
            type: 'added',
            value: 'time'
        },
        {
            type: 'removed',
            value: 'hello'
        }
    ]);
});
QUnit.test('Test axon array using Array.prototype.push.call etc', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push('test');
        array.push('test');
        array.push('test');
        array.push('test');
        array.length = 1;
        array.pop();
        array.push('hello');
        Array.prototype.push.call(array, 'hello');
        array.push('hello');
        Array.prototype.push.apply(array, [
            'time'
        ]);
        arrayRemove(array, 'hello');
    }, [
        {
            type: 'added',
            value: 'test'
        },
        {
            type: 'added',
            value: 'test'
        },
        {
            type: 'added',
            value: 'test'
        },
        {
            type: 'added',
            value: 'test'
        },
        {
            type: 'removed',
            value: 'test'
        },
        {
            type: 'removed',
            value: 'test'
        },
        {
            type: 'removed',
            value: 'test'
        },
        {
            type: 'removed',
            value: 'test'
        },
        {
            type: 'added',
            value: 'hello'
        },
        {
            type: 'added',
            value: 'hello'
        },
        {
            type: 'added',
            value: 'hello'
        },
        {
            type: 'added',
            value: 'time'
        },
        {
            type: 'removed',
            value: 'hello'
        }
    ]);
});
QUnit.test('Test axon array setLength', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push('hello');
        array.length = 0;
        array.length = 4;
        array[12] = 'cheetah';
    }, [
        {
            type: 'added',
            value: 'hello'
        },
        {
            type: 'removed',
            value: 'hello'
        },
        {
            type: 'added',
            value: 'cheetah'
        }
    ]);
});
QUnit.test('Test createObservableArray.push', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push('hello', 'there', 'old', undefined);
    }, [
        {
            type: 'added',
            value: 'hello'
        },
        {
            type: 'added',
            value: 'there'
        },
        {
            type: 'added',
            value: 'old'
        },
        {
            type: 'added',
            value: undefined
        }
    ]);
});
QUnit.test('Test createObservableArray.pop', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push(7);
        const popped = array.pop();
        assert.equal(popped, 7);
    }, [
        {
            type: 'added',
            value: 7
        },
        {
            type: 'removed',
            value: 7
        }
    ]);
});
QUnit.test('Test createObservableArray.shift', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push(7, 3);
        const removed = array.shift();
        assert.equal(removed, 7);
    }, [
        {
            type: 'added',
            value: 7
        },
        {
            type: 'added',
            value: 3
        },
        {
            type: 'removed',
            value: 7
        }
    ]);
});
QUnit.test('Test createObservableArray.unshift', (assert)=>{
    // From this example: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    testArrayEmitters(assert, (array)=>{
        array.push('angel', 'clown', 'drum', 'sturgeon');
        array.unshift('trumpet', 'dino');
        assert.ok(array[0] === 'trumpet');
    }, [
        {
            type: 'added',
            value: 'angel'
        },
        {
            type: 'added',
            value: 'clown'
        },
        {
            type: 'added',
            value: 'drum'
        },
        {
            type: 'added',
            value: 'sturgeon'
        },
        {
            type: 'added',
            value: 'trumpet'
        },
        {
            type: 'added',
            value: 'dino'
        }
    ]);
});
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin
QUnit.test('Test createObservableArray.copyWithin', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3, 4, 5);
        array.copyWithin(-2, 0); // [1, 2, 3, 1, 2]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        },
        {
            type: 'added',
            value: 4
        },
        {
            type: 'added',
            value: 5
        },
        {
            type: 'removed',
            value: 4
        },
        {
            type: 'removed',
            value: 5
        },
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3, 4, 5);
        array.copyWithin(0, 3); //  [4, 5, 3, 4, 5]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        },
        {
            type: 'added',
            value: 4
        },
        {
            type: 'added',
            value: 5
        },
        {
            type: 'removed',
            value: 1
        },
        {
            type: 'removed',
            value: 2
        },
        {
            type: 'added',
            value: 4
        },
        {
            type: 'added',
            value: 5
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3, 4, 5);
        array.copyWithin(0, 3, 4); //  [4, 2, 3, 4, 5]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        },
        {
            type: 'added',
            value: 4
        },
        {
            type: 'added',
            value: 5
        },
        {
            type: 'removed',
            value: 1
        },
        {
            type: 'added',
            value: 4
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3, 4, 5);
        array.copyWithin(-2, -3, -1); //   [1, 2, 3, 3, 4]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        },
        {
            type: 'added',
            value: 4
        },
        {
            type: 'added',
            value: 5
        },
        {
            type: 'removed',
            value: 5
        },
        {
            type: 'added',
            value: 3
        }
    ]);
});
// Examples from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
QUnit.test('Test createObservableArray.fill', (assert)=>{
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3);
        array.fill(4); // [4,4,4]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        },
        {
            type: 'removed',
            value: 1
        },
        {
            type: 'removed',
            value: 2
        },
        {
            type: 'removed',
            value: 3
        },
        {
            type: 'added',
            value: 4
        },
        {
            type: 'added',
            value: 4
        },
        {
            type: 'added',
            value: 4
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3);
        array.fill(4, 1); // [1,4,4]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        },
        {
            type: 'removed',
            value: 2
        },
        {
            type: 'removed',
            value: 3
        },
        {
            type: 'added',
            value: 4
        },
        {
            type: 'added',
            value: 4
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3);
        array.fill(4, 1, 2); // [1,4,3]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        },
        {
            type: 'removed',
            value: 2
        },
        {
            type: 'added',
            value: 4
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3);
        array.fill(4, 1, 1); // [1,2,3]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3);
        array.fill(4, 3, 3); // [1,2,3]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3);
        array.fill(4, -3, -2); // [4,2,3]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        },
        {
            type: 'removed',
            value: 1
        },
        {
            type: 'added',
            value: 4
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3);
        array.fill(4, NaN, NaN); // [1,2,3]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        }
    ]);
    testArrayEmitters(assert, (array)=>{
        array.push(1, 2, 3);
        array.fill(4, 3, 5); // [1,2,3]
    }, [
        {
            type: 'added',
            value: 1
        },
        {
            type: 'added',
            value: 2
        },
        {
            type: 'added',
            value: 3
        }
    ]);
});
QUnit.test('Test that length is correct in emitter callbacks after push', (assert)=>{
    const a = createObservableArray();
    a.elementAddedEmitter.addListener((element)=>{
        assert.equal(a.length, 1);
        assert.equal(a.lengthProperty.value, 1);
        assert.equal(element, 'hello');
    });
    a.push('hello');
});
QUnit.test('Test return types', (assert)=>{
    assert.ok(true);
    const a = createObservableArray();
    a.push('hello');
    const x = a.slice();
    x.unshift(7);
    assert.ok(true, 'make sure it is safe to unshift on a sliced createObservableArray');
});
QUnit.test('Test constructor arguments', (assert)=>{
    const a1 = createObservableArray({
        length: 7
    });
    assert.equal(a1.lengthProperty.value, 7, 'array length test');
    a1.push('hello');
    assert.equal(a1.lengthProperty.value, 8, 'array length test');
    assert.equal(a1[7], 'hello', 'for push, element should be added at the end of the array');
    const a2 = createObservableArray({
        elements: [
            'hi',
            'there'
        ]
    });
    assert.equal(a2.length, 2, 'array length test');
    assert.equal(a2[0], 'hi', 'first element correct');
    assert.equal(a2[1], 'there', 'second element correct');
    assert.equal(a2.length, 2, 'length correct');
    let a3 = null;
    window.assert && assert.throws(()=>{
        a3 = createObservableArray({
            elements: [
                3
            ],
            length: 1
        });
    }, 'length and elements are mutually exclusive');
    assert.equal(a3, null, 'should not have been assigned');
    // valid element types should succeed
    const a4 = createObservableArray({
        elements: [
            'a',
            'b'
        ],
        // @ts-expect-error, force set value type for testing
        valueType: 'string'
    });
    assert.ok(!!a4, 'correct element types should succeed');
    // invalid element types should fail
    window.assert && assert.throws(()=>createObservableArray({
            elements: [
                'a',
                'b'
            ],
            // @ts-expect-error, force set value type for testing
            valueType: 'number'
        }), 'should fail for invalid element types');
});
QUnit.test('Test function values', (assert)=>{
    const array = createObservableArray();
    let number = 7;
    array.push(()=>{
        number++;
    });
    array[0]();
    assert.equal(8, number, 'array should support function values');
});
QUnit.test('createObservableArrayTests misc', (assert)=>{
    const array = createObservableArray();
    assert.ok(Array.isArray(array), 'should be an array');
});
QUnit.test('createObservableArrayTests notification deferring', (assert)=>{
    const array = createObservableArray();
    // @ts-expect-error
    array.setNotificationsDeferred(true);
    // @ts-expect-error
    assert.ok(array.notificationsDeferred, 'should be');
    let fullCount = 0;
    array.addItemAddedListener((count)=>{
        fullCount += count;
    });
    array.push(5);
    assert.equal(fullCount, 0);
    // @ts-expect-error
    array.setNotificationsDeferred(false);
    // @ts-expect-error
    assert.ok(!array.notificationsDeferred, 'should be');
    assert.equal(fullCount, 5);
    array.push(5);
    assert.equal(fullCount, 10);
    // @ts-expect-error
    array.setNotificationsDeferred(true);
    array.push(5);
    array.push(4);
    array.push(6);
    assert.equal(fullCount, 10);
    // @ts-expect-error
    array.setNotificationsDeferred(false);
    assert.equal(fullCount, 25);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUVVuaXQgdGVzdHMgZm9yIGNyZWF0ZU9ic2VydmFibGVBcnJheVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFJhbmRvbSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZG9tLmpzJztcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4vY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcblxuUVVuaXQubW9kdWxlKCAnY3JlYXRlT2JzZXJ2YWJsZUFycmF5JyApO1xuXG50eXBlIHJ1bkNhbGxiYWNrID0gKCkgPT4gSW50ZW50aW9uYWxBbnk7XG5cbnR5cGUgdGVzdEFycmF5RW1pdHRlcnNDYWxsYmFjayA9IHsgKCBhcnJheTogT2JzZXJ2YWJsZUFycmF5PHVua25vd24+ICk6IHZvaWQgfTtcblxuUVVuaXQudGVzdCggJ0hlbGxvJywgYXNzZXJ0ID0+IHtcblxuICBhc3NlcnQub2soICdmaXJzdCB0ZXN0JyApO1xuXG4gIGNvbnN0IHJ1biA9ICggbmFtZTogc3RyaW5nLCBjb21tYW5kOiBydW5DYWxsYmFjayApID0+IHtcbiAgICBjb25zb2xlLmxvZyggYFNUQVJUOiAke25hbWV9YCApO1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvbW1hbmQoKTtcbiAgICBjb25zb2xlLmxvZyggYEVORDogJHtuYW1lfVxcblxcbmAgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIGNvbnN0IG9ic2VydmFibGVBcnJheSA9IHJ1biggJ2NyZWF0ZScsICgpID0+IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xuICAgIGVsZW1lbnRzOiBbICdhJywgJ2JjJyBdXG4gIH0gKSApO1xuXG4gIGFzc2VydC5vayggQXJyYXkuaXNBcnJheSggb2JzZXJ2YWJsZUFycmF5ICksICdpc0FycmF5IGNoZWNrJyApO1xuICBhc3NlcnQub2soIG9ic2VydmFibGVBcnJheSBpbnN0YW5jZW9mIEFycmF5LCAnaW5zdGFuY2VvZiBjaGVjaycgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L25vLWluc3RhbmNlb2YtYXJyYXlcblxuICBydW4oICdwdXNoIGhlbGxvJywgKCkgPT4gb2JzZXJ2YWJsZUFycmF5LnB1c2goICdoZWxsbycgKSApO1xuICBydW4oICdzZXQgZWxlbWVudCAwJywgKCkgPT4geyBvYnNlcnZhYmxlQXJyYXlbIDAgXSA9ICdkaW5vc2F1cic7IH0gKTtcbiAgcnVuKCAnc2V0IGVsZW1lbnQgNScsICgpID0+IHsgb2JzZXJ2YWJsZUFycmF5WyA1IF0gPSAnaGFtYnVyZ2VyJzsgfSApO1xuICBydW4oICdsZW5ndGggPSAwJywgKCkgPT4geyBvYnNlcnZhYmxlQXJyYXkubGVuZ3RoID0gMDsgfSApO1xuICBydW4oICdhLGIsYycsICgpID0+IHtcbiAgICBvYnNlcnZhYmxlQXJyYXkucHVzaCggJ2EnICk7XG4gICAgb2JzZXJ2YWJsZUFycmF5LnB1c2goICdiJyApO1xuICAgIG9ic2VydmFibGVBcnJheS5wdXNoKCAnYycgKTtcbiAgfSApO1xuICBydW4oICdzcGxpY2UnLCAoKSA9PiBvYnNlcnZhYmxlQXJyYXkuc3BsaWNlKCAwLCAxICkgKTtcbn0gKTtcblxuLy8gQ3JlYXRlcyBhbiBhcnJheSB0aGF0IGlzIHRlc3RlZCB3aXRoIHRoZSBnaXZlbiBtb2RpZmllcnMgYWdhaW5zdCB0aGUgZXhwZWN0ZWQgcmVzdWx0cy5cbmNvbnN0IHRlc3RBcnJheUVtaXR0ZXJzID0gKCBhc3NlcnQ6IEFzc2VydCwgbW9kaWZpZXI6IHRlc3RBcnJheUVtaXR0ZXJzQ2FsbGJhY2ssIGV4cGVjdGVkOiBBcnJheTx1bmtub3duPiApID0+IHtcbiAgY29uc3QgYXJyYXkgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcbiAgY29uc3QgZGVsdGFzOiBBcnJheTx1bmtub3duPiA9IFtdO1xuICBhcnJheS5lbGVtZW50QWRkZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBlID0+IGRlbHRhcy5wdXNoKCB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiBlIH0gKSApO1xuICBhcnJheS5lbGVtZW50UmVtb3ZlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGUgPT4gZGVsdGFzLnB1c2goIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogZSB9ICkgKTtcbiAgbW9kaWZpZXIoIGFycmF5ICk7XG4gIGFzc2VydC5kZWVwRXF1YWwoIGRlbHRhcywgZXhwZWN0ZWQgKTtcbn07XG5cblFVbml0LnRlc3QoICdUZXN0IGF4b24gYXJyYXkgbGVuZ3RoJywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCBhcnJheSA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xuICBhcnJheS5wdXNoKCAnaGVsbG8nICk7XG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoUHJvcGVydHkudmFsdWUsIDEsICdhcnJheSBsZW5ndGhQcm9wZXJ0eSB0ZXN0JyApO1xuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aCwgMSwgJ2FycmF5IGxlbmd0aCB0ZXN0JyApO1xuICBhcnJheS5wb3AoKTtcbiAgYXNzZXJ0LmVxdWFsKCBhcnJheS5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgMCwgJ2FycmF5IGxlbmd0aFByb3BlcnR5IHRlc3QnICk7XG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoLCAwLCAnYXJyYXkgbGVuZ3RoIHRlc3QnICk7XG4gIGFycmF5LnB1c2goIDEsIDIsIDMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBhcnJheS5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgMywgJ2FycmF5IGxlbmd0aFByb3BlcnR5IHRlc3QnICk7XG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoLCAzLCAnYXJyYXkgbGVuZ3RoIHRlc3QnICk7XG4gIGFycmF5LnNoaWZ0KCk7XG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoUHJvcGVydHkudmFsdWUsIDIsICdhcnJheSBsZW5ndGhQcm9wZXJ0eSB0ZXN0JyApO1xuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aCwgMiwgJ2FycmF5IGxlbmd0aCB0ZXN0JyApO1xuICBhcnJheS5zcGxpY2UoIDAsIDIsICdwYXJyb3QnLCAnYW5lbW9uZScsICdibHVlJyApO1xuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aFByb3BlcnR5LnZhbHVlLCAzLCAnYXJyYXkgbGVuZ3RoUHJvcGVydHkgdGVzdCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBhcnJheS5sZW5ndGgsIDMsICdhcnJheSBsZW5ndGggdGVzdCcgKTtcbiAgYXJyYXkudW5zaGlmdCggJ3F1bml0JywgJ3Rlc3QnICk7XG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoUHJvcGVydHkudmFsdWUsIDUsICdhcnJheSBsZW5ndGhQcm9wZXJ0eSB0ZXN0JyApO1xuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aCwgNSwgJ2FycmF5IGxlbmd0aCB0ZXN0JyApO1xuICBhcnJheS5sZW5ndGggPSAwO1xuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aFByb3BlcnR5LnZhbHVlLCAwLCAnYXJyYXkgbGVuZ3RoUHJvcGVydHkgdGVzdCBhZnRlciBzZXRMZW5ndGhBbmROb3RpZnknICk7XG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoLCAwLCAnYXJyYXkgbGVuZ3RoIHRlc3QgYWZ0ZXIgc2V0TGVuZ3RoQW5kTm90aWZ5JyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGVzdCBkZWxldGUnLCBhc3NlcnQgPT4ge1xuXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcblxuICAgIGFycmF5LnB1c2goICd0ZXN0JyApO1xuICAgIGRlbGV0ZSBhcnJheVsgMCBdO1xuXG4gICAgLy8gRk9SIFJFVklFV0VSOiBUaGUgY29tbWVudGVkIG91dCBjb2RlIGRvZXMgbm90IGFwcGVhciB0byBoYXZlIGJlZW4gdGVzdGluZyBhbnl0aGluZy4gRXhwZWN0ZWQgZG9lcyBub3QgaW5jbHVkZSBhbnlcbiAgICAvLyByZXR1cm4gdmFsdWUgY29tcGFyaXNvbnMgZm9yIGFycmF5LmhlbGxvLiBTaG91bGQgdGhpcyBiZSBhY3R1YWxseSB0ZXN0aW5nIHNvbWV0aGluZyBvciBzYWZlIHRvIGRlbGV0ZT9cbiAgICAvLyBhcnJheS5oZWxsbyA9ICd0aGVyZSc7XG4gICAgLy8gZGVsZXRlIGFycmF5LmhlbGxvO1xuXG4gICAgYXJyYXlbIC03IF0gPSAndGltZSc7XG4gICAgZGVsZXRlIGFycmF5WyAtNyBdO1xuICB9LCBbXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAndGVzdCcgfVxuICBdICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0IHNhbWUgdmFsdWUnLCBhc3NlcnQgPT4ge1xuXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcblxuICAgIGFycmF5LnB1c2goICd0ZXN0JyApO1xuICAgIGFycmF5LnNodWZmbGUoIG5ldyBSYW5kb20oKSApOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgfSwgW1xuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0ZXN0JyB9XG4gIF0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1Rlc3QgYXhvbiBhcnJheScsIGFzc2VydCA9PiB7XG5cbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xuXG4gICAgYXJyYXkucHVzaCggJ3Rlc3QnICk7XG4gICAgYXJyYXkucHVzaCggJ3Rlc3QnICk7XG4gICAgYXJyYXkucHVzaCggJ3Rlc3QnICk7XG4gICAgYXJyYXkucHVzaCggJ3Rlc3QnICk7XG5cbiAgICBhcnJheS5sZW5ndGggPSAxO1xuXG4gICAgYXJyYXkucG9wKCk7XG4gICAgYXJyYXkucHVzaCggJ2hlbGxvJyApO1xuICAgIGFycmF5LnB1c2goICdoZWxsbycgKTtcbiAgICBhcnJheS5wdXNoKCAnaGVsbG8nICk7XG4gICAgYXJyYXkucHVzaCggJ3RpbWUnICk7XG5cbiAgICBhcnJheVJlbW92ZSggYXJyYXksICdoZWxsbycgKTtcbiAgfSwgW1xuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0ZXN0JyB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0ZXN0JyB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0ZXN0JyB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0ZXN0JyB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAndGVzdCcgfSxcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICd0ZXN0JyB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2hlbGxvJyB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICdoZWxsbycgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnaGVsbG8nIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3RpbWUnIH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAnaGVsbG8nIH1cbiAgXSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGVzdCBheG9uIGFycmF5IHVzaW5nIEFycmF5LnByb3RvdHlwZS5wdXNoLmNhbGwgZXRjJywgYXNzZXJ0ID0+IHtcblxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XG5cbiAgICBhcnJheS5wdXNoKCAndGVzdCcgKTtcbiAgICBhcnJheS5wdXNoKCAndGVzdCcgKTtcbiAgICBhcnJheS5wdXNoKCAndGVzdCcgKTtcbiAgICBhcnJheS5wdXNoKCAndGVzdCcgKTtcblxuICAgIGFycmF5Lmxlbmd0aCA9IDE7XG5cbiAgICBhcnJheS5wb3AoKTtcbiAgICBhcnJheS5wdXNoKCAnaGVsbG8nICk7XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guY2FsbCggYXJyYXksICdoZWxsbycgKTtcbiAgICBhcnJheS5wdXNoKCAnaGVsbG8nICk7XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoIGFycmF5LCBbICd0aW1lJyBdICk7XG4gICAgYXJyYXlSZW1vdmUoIGFycmF5LCAnaGVsbG8nICk7XG4gIH0sIFtcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAndGVzdCcgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAndGVzdCcgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAndGVzdCcgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAndGVzdCcgfSxcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICd0ZXN0JyB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAndGVzdCcgfSxcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICd0ZXN0JyB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICdoZWxsbycgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnaGVsbG8nIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2hlbGxvJyB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0aW1lJyB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogJ2hlbGxvJyB9XG4gIF0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1Rlc3QgYXhvbiBhcnJheSBzZXRMZW5ndGgnLCBhc3NlcnQgPT4ge1xuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XG4gICAgYXJyYXkucHVzaCggJ2hlbGxvJyApO1xuICAgIGFycmF5Lmxlbmd0aCA9IDA7XG4gICAgYXJyYXkubGVuZ3RoID0gNDtcbiAgICBhcnJheVsgMTIgXSA9ICdjaGVldGFoJztcbiAgfSwgW1xuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICdoZWxsbycgfSxcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICdoZWxsbycgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnY2hlZXRhaCcgfVxuICBdICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0IGNyZWF0ZU9ic2VydmFibGVBcnJheS5wdXNoJywgYXNzZXJ0ID0+IHtcbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xuICAgIGFycmF5LnB1c2goICdoZWxsbycsICd0aGVyZScsICdvbGQnLCB1bmRlZmluZWQgKTtcbiAgfSwgW1xuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICdoZWxsbycgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAndGhlcmUnIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ29sZCcgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiB1bmRlZmluZWQgfVxuICBdICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0IGNyZWF0ZU9ic2VydmFibGVBcnJheS5wb3AnLCBhc3NlcnQgPT4ge1xuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XG4gICAgYXJyYXkucHVzaCggNyApO1xuICAgIGNvbnN0IHBvcHBlZCA9IGFycmF5LnBvcCgpO1xuICAgIGFzc2VydC5lcXVhbCggcG9wcGVkLCA3ICk7XG4gIH0sIFtcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA3IH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiA3IH1cbiAgXSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGVzdCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuc2hpZnQnLCBhc3NlcnQgPT4ge1xuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XG4gICAgYXJyYXkucHVzaCggNywgMyApO1xuICAgIGNvbnN0IHJlbW92ZWQgPSBhcnJheS5zaGlmdCgpO1xuICAgIGFzc2VydC5lcXVhbCggcmVtb3ZlZCwgNyApO1xuICB9LCBbXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNyB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfSxcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IDcgfVxuICBdICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0IGNyZWF0ZU9ic2VydmFibGVBcnJheS51bnNoaWZ0JywgYXNzZXJ0ID0+IHtcblxuICAvLyBGcm9tIHRoaXMgZXhhbXBsZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvc3BsaWNlXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcbiAgICBhcnJheS5wdXNoKCAnYW5nZWwnLCAnY2xvd24nLCAnZHJ1bScsICdzdHVyZ2VvbicgKTtcbiAgICBhcnJheS51bnNoaWZ0KCAndHJ1bXBldCcsICdkaW5vJyApO1xuXG4gICAgYXNzZXJ0Lm9rKCBhcnJheVsgMCBdID09PSAndHJ1bXBldCcgKTtcbiAgfSwgW1xuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICdhbmdlbCcgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnY2xvd24nIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2RydW0nIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3N0dXJnZW9uJyB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0cnVtcGV0JyB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICdkaW5vJyB9XG4gIF0gKTtcbn0gKTtcblxuLy8gRnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9jb3B5V2l0aGluXG5RVW5pdC50ZXN0KCAnVGVzdCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuY29weVdpdGhpbicsIGFzc2VydCA9PiB7XG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcbiAgICBhcnJheS5wdXNoKCAxLCAyLCAzLCA0LCA1ICk7XG4gICAgYXJyYXkuY29weVdpdGhpbiggLTIsIDAgKTsgLy8gWzEsIDIsIDMsIDEsIDJdXG4gIH0sIFtcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNSB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogNCB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogNSB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDEgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAyIH1cbiAgXSApO1xuXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcbiAgICBhcnJheS5wdXNoKCAxLCAyLCAzLCA0LCA1ICk7XG4gICAgYXJyYXkuY29weVdpdGhpbiggMCwgMyApOyAvLyAgWzQsIDUsIDMsIDQsIDVdXG4gIH0sIFtcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNSB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogMSB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogMiB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDQgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA1IH1cbiAgXSApO1xuXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcbiAgICBhcnJheS5wdXNoKCAxLCAyLCAzLCA0LCA1ICk7XG4gICAgYXJyYXkuY29weVdpdGhpbiggMCwgMywgNCApOyAvLyAgWzQsIDIsIDMsIDQsIDVdXG4gIH0sIFtcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNSB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogMSB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDQgfVxuICBdICk7XG5cbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xuICAgIGFycmF5LnB1c2goIDEsIDIsIDMsIDQsIDUgKTtcbiAgICBhcnJheS5jb3B5V2l0aGluKCAtMiwgLTMsIC0xICk7IC8vICAgWzEsIDIsIDMsIDMsIDRdXG4gIH0sIFtcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNSB9LFxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogNSB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfVxuICBdICk7XG59ICk7XG5cbi8vIEV4YW1wbGVzIGZyb20gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZmlsbFxuUVVuaXQudGVzdCggJ1Rlc3QgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmZpbGwnLCBhc3NlcnQgPT4ge1xuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XG4gICAgYXJyYXkucHVzaCggMSwgMiwgMyApO1xuICAgIGFycmF5LmZpbGwoIDQgKTsgLy8gWzQsNCw0XVxuICB9LCBbXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMSB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAzIH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAxIH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAyIH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAzIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNCB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDQgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH1cbiAgXSApO1xuXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcbiAgICBhcnJheS5wdXNoKCAxLCAyLCAzICk7XG4gICAgYXJyYXkuZmlsbCggNCwgMSApOyAvLyBbMSw0LDRdXG4gIH0sIFtcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfSxcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IDIgfSxcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IDMgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNCB9XG4gIF0gKTtcblxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XG4gICAgYXJyYXkucHVzaCggMSwgMiwgMyApO1xuICAgIGFycmF5LmZpbGwoIDQsIDEsIDIgKTsgLy8gWzEsNCwzXVxuICB9LCBbXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMSB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAzIH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAyIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNCB9XG4gIF0gKTtcblxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XG4gICAgYXJyYXkucHVzaCggMSwgMiwgMyApO1xuICAgIGFycmF5LmZpbGwoIDQsIDEsIDEgKTsgLy8gWzEsMiwzXVxuICB9LCBbXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMSB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAzIH1cbiAgXSApO1xuXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcbiAgICBhcnJheS5wdXNoKCAxLCAyLCAzICk7XG4gICAgYXJyYXkuZmlsbCggNCwgMywgMyApOyAvLyBbMSwyLDNdXG4gIH0sIFtcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfVxuICBdICk7XG5cbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xuICAgIGFycmF5LnB1c2goIDEsIDIsIDMgKTtcbiAgICBhcnJheS5maWxsKCA0LCAtMywgLTIgKTsgLy8gWzQsMiwzXVxuICB9LCBbXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMSB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAzIH0sXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAxIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNCB9XG4gIF0gKTtcblxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XG4gICAgYXJyYXkucHVzaCggMSwgMiwgMyApO1xuICAgIGFycmF5LmZpbGwoIDQsIE5hTiwgTmFOICk7IC8vIFsxLDIsM11cbiAgfSwgW1xuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDEgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAyIH0sXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMyB9XG4gIF0gKTtcblxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XG4gICAgYXJyYXkucHVzaCggMSwgMiwgMyApO1xuICAgIGFycmF5LmZpbGwoIDQsIDMsIDUgKTsgLy8gWzEsMiwzXVxuICB9LCBbXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMSB9LFxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfSxcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAzIH1cbiAgXSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGVzdCB0aGF0IGxlbmd0aCBpcyBjb3JyZWN0IGluIGVtaXR0ZXIgY2FsbGJhY2tzIGFmdGVyIHB1c2gnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBhID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XG4gIGEuZWxlbWVudEFkZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggZWxlbWVudCA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKCBhLmxlbmd0aCwgMSApO1xuICAgIGFzc2VydC5lcXVhbCggYS5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgMSApO1xuICAgIGFzc2VydC5lcXVhbCggZWxlbWVudCwgJ2hlbGxvJyApO1xuICB9ICk7XG4gIGEucHVzaCggJ2hlbGxvJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGVzdCByZXR1cm4gdHlwZXMnLCBhc3NlcnQgPT4ge1xuXG4gIGFzc2VydC5vayggdHJ1ZSApO1xuICBjb25zdCBhID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XG4gIGEucHVzaCggJ2hlbGxvJyApO1xuXG4gIGNvbnN0IHggPSBhLnNsaWNlKCk7XG4gIHgudW5zaGlmdCggNyApO1xuICBhc3NlcnQub2soIHRydWUsICdtYWtlIHN1cmUgaXQgaXMgc2FmZSB0byB1bnNoaWZ0IG9uIGEgc2xpY2VkIGNyZWF0ZU9ic2VydmFibGVBcnJheScgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1Rlc3QgY29uc3RydWN0b3IgYXJndW1lbnRzJywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCBhMSA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xuICAgIGxlbmd0aDogN1xuICB9ICk7XG4gIGFzc2VydC5lcXVhbCggYTEubGVuZ3RoUHJvcGVydHkudmFsdWUsIDcsICdhcnJheSBsZW5ndGggdGVzdCcgKTtcbiAgYTEucHVzaCggJ2hlbGxvJyApO1xuICBhc3NlcnQuZXF1YWwoIGExLmxlbmd0aFByb3BlcnR5LnZhbHVlLCA4LCAnYXJyYXkgbGVuZ3RoIHRlc3QnICk7XG4gIGFzc2VydC5lcXVhbCggYTFbIDcgXSwgJ2hlbGxvJywgJ2ZvciBwdXNoLCBlbGVtZW50IHNob3VsZCBiZSBhZGRlZCBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheScgKTtcblxuICBjb25zdCBhMiA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xuICAgIGVsZW1lbnRzOiBbICdoaScsICd0aGVyZScgXVxuICB9ICk7XG4gIGFzc2VydC5lcXVhbCggYTIubGVuZ3RoLCAyLCAnYXJyYXkgbGVuZ3RoIHRlc3QnICk7XG4gIGFzc2VydC5lcXVhbCggYTJbIDAgXSwgJ2hpJywgJ2ZpcnN0IGVsZW1lbnQgY29ycmVjdCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBhMlsgMSBdLCAndGhlcmUnLCAnc2Vjb25kIGVsZW1lbnQgY29ycmVjdCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBhMi5sZW5ndGgsIDIsICdsZW5ndGggY29ycmVjdCcgKTtcblxuICBsZXQgYTMgPSBudWxsO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBhMyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSggeyBlbGVtZW50czogWyAzIF0sIGxlbmd0aDogMSB9ICk7XG4gIH0sICdsZW5ndGggYW5kIGVsZW1lbnRzIGFyZSBtdXR1YWxseSBleGNsdXNpdmUnICk7XG4gIGFzc2VydC5lcXVhbCggYTMsIG51bGwsICdzaG91bGQgbm90IGhhdmUgYmVlbiBhc3NpZ25lZCcgKTtcblxuICAvLyB2YWxpZCBlbGVtZW50IHR5cGVzIHNob3VsZCBzdWNjZWVkXG4gIGNvbnN0IGE0ID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XG4gICAgZWxlbWVudHM6IFsgJ2EnLCAnYicgXSxcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IsIGZvcmNlIHNldCB2YWx1ZSB0eXBlIGZvciB0ZXN0aW5nXG4gICAgdmFsdWVUeXBlOiAnc3RyaW5nJ1xuICB9ICk7XG4gIGFzc2VydC5vayggISFhNCwgJ2NvcnJlY3QgZWxlbWVudCB0eXBlcyBzaG91bGQgc3VjY2VlZCcgKTtcblxuICAvLyBpbnZhbGlkIGVsZW1lbnQgdHlwZXMgc2hvdWxkIGZhaWxcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcbiAgICBlbGVtZW50czogWyAnYScsICdiJyBdLFxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciwgZm9yY2Ugc2V0IHZhbHVlIHR5cGUgZm9yIHRlc3RpbmdcbiAgICB2YWx1ZVR5cGU6ICdudW1iZXInXG4gIH0gKSwgJ3Nob3VsZCBmYWlsIGZvciBpbnZhbGlkIGVsZW1lbnQgdHlwZXMnICk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ1Rlc3QgZnVuY3Rpb24gdmFsdWVzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgYXJyYXk6IEFycmF5PCgpID0+IHZvaWQ+ID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XG4gIGxldCBudW1iZXIgPSA3O1xuICBhcnJheS5wdXNoKCAoKSA9PiB7XG4gICAgbnVtYmVyKys7XG4gIH0gKTtcbiAgYXJyYXlbIDAgXSgpO1xuICBhc3NlcnQuZXF1YWwoIDgsIG51bWJlciwgJ2FycmF5IHNob3VsZCBzdXBwb3J0IGZ1bmN0aW9uIHZhbHVlcycgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ2NyZWF0ZU9ic2VydmFibGVBcnJheVRlc3RzIG1pc2MnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBhcnJheSA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xuICBhc3NlcnQub2soIEFycmF5LmlzQXJyYXkoIGFycmF5ICksICdzaG91bGQgYmUgYW4gYXJyYXknICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdjcmVhdGVPYnNlcnZhYmxlQXJyYXlUZXN0cyBub3RpZmljYXRpb24gZGVmZXJyaW5nJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgYXJyYXkgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXk8bnVtYmVyPigpO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgYXJyYXkuc2V0Tm90aWZpY2F0aW9uc0RlZmVycmVkKCB0cnVlICk7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgYXNzZXJ0Lm9rKCBhcnJheS5ub3RpZmljYXRpb25zRGVmZXJyZWQsICdzaG91bGQgYmUnICk7XG4gIGxldCBmdWxsQ291bnQgPSAwO1xuICBhcnJheS5hZGRJdGVtQWRkZWRMaXN0ZW5lciggY291bnQgPT4ge1xuICAgIGZ1bGxDb3VudCArPSBjb3VudDtcbiAgfSApO1xuXG4gIGFycmF5LnB1c2goIDUgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmdWxsQ291bnQsIDAgKTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhcnJheS5zZXROb3RpZmljYXRpb25zRGVmZXJyZWQoIGZhbHNlICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhc3NlcnQub2soICFhcnJheS5ub3RpZmljYXRpb25zRGVmZXJyZWQsICdzaG91bGQgYmUnICk7XG4gIGFzc2VydC5lcXVhbCggZnVsbENvdW50LCA1ICk7XG5cbiAgYXJyYXkucHVzaCggNSApO1xuICBhc3NlcnQuZXF1YWwoIGZ1bGxDb3VudCwgMTAgKTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhcnJheS5zZXROb3RpZmljYXRpb25zRGVmZXJyZWQoIHRydWUgKTtcbiAgYXJyYXkucHVzaCggNSApO1xuICBhcnJheS5wdXNoKCA0ICk7XG4gIGFycmF5LnB1c2goIDYgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmdWxsQ291bnQsIDEwICk7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgYXJyYXkuc2V0Tm90aWZpY2F0aW9uc0RlZmVycmVkKCBmYWxzZSApO1xuICBhc3NlcnQuZXF1YWwoIGZ1bGxDb3VudCwgMjUgKTtcbn0gKTsiXSwibmFtZXMiOlsiUmFuZG9tIiwiYXJyYXlSZW1vdmUiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJvayIsInJ1biIsIm5hbWUiLCJjb21tYW5kIiwiY29uc29sZSIsImxvZyIsInJlc3VsdCIsIm9ic2VydmFibGVBcnJheSIsImVsZW1lbnRzIiwiQXJyYXkiLCJpc0FycmF5IiwicHVzaCIsImxlbmd0aCIsInNwbGljZSIsInRlc3RBcnJheUVtaXR0ZXJzIiwibW9kaWZpZXIiLCJleHBlY3RlZCIsImFycmF5IiwiZGVsdGFzIiwiZWxlbWVudEFkZGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZSIsInR5cGUiLCJ2YWx1ZSIsImVsZW1lbnRSZW1vdmVkRW1pdHRlciIsImRlZXBFcXVhbCIsImVxdWFsIiwibGVuZ3RoUHJvcGVydHkiLCJwb3AiLCJzaGlmdCIsInVuc2hpZnQiLCJzaHVmZmxlIiwicHJvdG90eXBlIiwiY2FsbCIsImFwcGx5IiwidW5kZWZpbmVkIiwicG9wcGVkIiwicmVtb3ZlZCIsImNvcHlXaXRoaW4iLCJmaWxsIiwiTmFOIiwiYSIsImVsZW1lbnQiLCJ4Iiwic2xpY2UiLCJhMSIsImEyIiwiYTMiLCJ3aW5kb3ciLCJ0aHJvd3MiLCJhNCIsInZhbHVlVHlwZSIsIm51bWJlciIsInNldE5vdGlmaWNhdGlvbnNEZWZlcnJlZCIsIm5vdGlmaWNhdGlvbnNEZWZlcnJlZCIsImZ1bGxDb3VudCIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiY291bnQiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsWUFBWSx5QkFBeUI7QUFDNUMsT0FBT0MsaUJBQWlCLG9DQUFvQztBQUU1RCxPQUFPQywyQkFBZ0QsNkJBQTZCO0FBRXBGQyxNQUFNQyxNQUFNLENBQUU7QUFNZEQsTUFBTUUsSUFBSSxDQUFFLFNBQVNDLENBQUFBO0lBRW5CQSxPQUFPQyxFQUFFLENBQUU7SUFFWCxNQUFNQyxNQUFNLENBQUVDLE1BQWNDO1FBQzFCQyxRQUFRQyxHQUFHLENBQUUsQ0FBQyxPQUFPLEVBQUVILE1BQU07UUFDN0IsTUFBTUksU0FBU0g7UUFDZkMs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