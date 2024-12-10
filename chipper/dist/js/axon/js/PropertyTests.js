// Copyright 2017-2024, University of Colorado Boulder
/**
 * QUnit tests for Property
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Vector2 from '../../dot/js/Vector2.js';
import Tandem from '../../tandem/js/Tandem.js';
import Multilink from './Multilink.js';
import NumberProperty from './NumberProperty.js';
import Property from './Property.js';
QUnit.module('Property');
QUnit.test('Test unlink', (assert)=>{
    const property = new Property(1);
    const startingPListenerCount = property['getListenerCount']();
    const a = function(a) {
        _.noop;
    };
    const b = function(b) {
        _.noop;
    };
    const c = function(c) {
        _.noop;
    };
    property.link(a);
    property.link(b);
    property.link(c);
    assert.equal(property['getListenerCount'](), 3 + startingPListenerCount, 'should have 3 observers now');
    property.unlink(b);
    assert.ok(property.hasListener(a), 'should have removed b');
    assert.ok(property.hasListener(c), 'should have removed b');
    assert.equal(property['getListenerCount'](), 2 + startingPListenerCount, 'should have removed an item');
});
QUnit.test('Test Multilink.multilink', (assert)=>{
    const aProperty = new Property(1);
    const bProperty = new Property(2);
    let callbacks = 0;
    Multilink.multilink([
        aProperty,
        bProperty
    ], (a, b)=>{
        callbacks++;
        assert.equal(a, 1, 'first value should pass through');
        assert.equal(b, 2, 'second value should pass through');
    });
    assert.equal(callbacks, 1, 'should have called back to a multilink');
});
QUnit.test('Test Multilink.lazyMultilink', (assert)=>{
    const aProperty = new Property(1);
    const bProperty = new Property(2);
    let callbacks = 0;
    Multilink.lazyMultilink([
        aProperty,
        bProperty
    ], (a, b)=>{
        callbacks++;
        assert.equal(a, 1);
        assert.equal(b, 2);
    });
    assert.equal(callbacks, 0, 'should not call back to a lazy multilink');
});
QUnit.test('Test defer', (assert)=>{
    const property = new Property(0);
    let callbacks = 0;
    property.lazyLink((newValue, oldValue)=>{
        callbacks++;
        assert.equal(newValue, 2, 'newValue should be the final value after the transaction');
        assert.equal(oldValue, 0, 'oldValue should be the original value before the transaction');
    });
    property.setDeferred(true);
    property.value = 1;
    property.value = 2;
    assert.equal(property.value, 0, 'should have original value');
    const update = property.setDeferred(false);
    assert.equal(callbacks, 0, 'should not call back while deferred');
    assert.equal(property.value, 2, 'should have new value');
    // @ts-expect-error .setDeferred(false) will always return () => void
    update();
    assert.equal(callbacks, 1, 'should have been called back after update');
    assert.equal(property.value, 2, 'should take final value');
});
QUnit.test('Property ID checks', (assert)=>{
    assert.ok(new Property(1)['id'] !== new Property(1)['id'], 'Properties should have unique IDs'); // eslint-disable-line no-self-compare
});
QUnit.test('Property link parameters', (assert)=>{
    const property = new Property(1);
    const calls = [];
    property.link((newValue, oldValue, property)=>{
        calls.push({
            newValue: newValue,
            oldValue: oldValue,
            property: property
        });
    });
    property.value = 2;
    assert.ok(calls.length === 2);
    assert.ok(calls[0].newValue === 1);
    assert.ok(calls[0].oldValue === null);
    assert.ok(calls[0].property === property);
    assert.ok(calls[1].newValue === 2);
    assert.ok(calls[1].oldValue === 1);
    assert.ok(calls[1].property === property);
});
/**
 * Make sure linking attributes and unlinking attributes works on Property
 */ QUnit.test('Property.linkAttribute', (assert)=>{
    const property = new Property(7);
    const state = {
        age: 99
    };
    const listener = (age)=>{
        state.age = age;
    };
    property.link(listener);
    assert.equal(state.age, 7, 'link should synchronize values');
    property.value = 8;
    assert.equal(state.age, 8, 'link should update values');
    property.unlink(listener);
    property.value = 9;
    assert.equal(state.age, 8, 'state should not have changed after unlink');
});
QUnit.test('Property value validation', (assert)=>{
    // Type that is specific to valueType tests
    let TestType = class TestType {
        constructor(){
            _.noop();
        }
    };
    let property = null;
    let options = {};
    // valueType is a primitive type (typeof validation)
    options = {
        valueType: 'string'
    };
    window.assert && assert.throws(()=>{
        new Property(0, {
            valueType: 'foo'
        }); // eslint-disable-line no-new
    }, 'options.valueType is invalid, expected a primitive data type');
    window.assert && assert.throws(()=>{
        new Property(0, options); // eslint-disable-line no-new
    }, 'invalid initial value with options.valueType typeof validation');
    property = new Property('horizontal', options);
    property.set('vertical');
    window.assert && assert.throws(()=>{
        property.set(0);
    }, 'invalid set value with options.valueType typeof validation');
    // valueType is a constructor (instanceof validation)
    options = {
        valueType: TestType
    };
    window.assert && assert.throws(()=>{
        new Property(0, options); // eslint-disable-line no-new
    }, 'invalid initial value for options.valueType instanceof validation');
    property = new Property(new TestType(), options);
    property.set(new TestType());
    window.assert && assert.throws(()=>{
        property.set(0);
    }, 'invalid set value with options.valueType instanceof validation');
    // validValues
    options = {
        validValues: [
            1,
            2,
            3
        ]
    };
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL value is invalid for testing
        new Property(0, {
            validValues: 0
        }); // eslint-disable-line no-new
    }, 'options.validValues is invalid');
    window.assert && assert.throws(()=>{
        new Property(0, options); // eslint-disable-line no-new
    }, 'invalid initial value with options.validValues');
    property = new Property(1, options);
    property.set(3);
    window.assert && assert.throws(()=>{
        property.set(4);
    }, 'invalid set value with options.validValues');
    // isValidValues
    options = {
        isValidValue: function(value) {
            return value > 0 && value < 4;
        }
    };
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL value is invalid for testing
        new Property(0, {
            isValidValue: 0
        }); // eslint-disable-line no-new
    }, 'options.isValidValue is invalid');
    window.assert && assert.throws(()=>{
        new Property(0, options); // eslint-disable-line no-new
    }, 'invalid initial value with options.isValidValue');
    property = new Property(1, options);
    property.set(3);
    window.assert && assert.throws(()=>{
        property.set(4);
    }, 'invalid set value with options.isValidValue');
    // Compatible combinations of validation options, possibly redundant (not exhaustive)
    options = {
        valueType: 'string',
        validValues: [
            'bob',
            'joe',
            'sam'
        ],
        isValidValue: function(value) {
            return value.length === 3;
        }
    };
    property = new Property('bob', options);
    window.assert && assert.throws(()=>{
        property.set(0);
    }, 'invalid set value with compatible combination of validation options');
    window.assert && assert.throws(()=>{
        property.set('ted');
    }, 'invalid set value with compatible combination of validation options');
    // Incompatible combinations of validation options (not exhaustive)
    // These tests will always fail on initialization, since the validation criteria are contradictory.
    options = {
        valueType: 'number',
        validValues: [
            'bob',
            'joe',
            'sam'
        ],
        isValidValue: function(value) {
            return value.length === 4;
        }
    };
    window.assert && assert.throws(()=>{
        property = new Property(0, options);
    }, 'invalid initial value with incompatible combination of validation options');
    window.assert && assert.throws(()=>{
        property = new Property('bob', options);
    }, 'invalid initial value with incompatible combination of validation options');
    window.assert && assert.throws(()=>{
        property = new Property('fred', options);
    }, 'invalid initial value with incompatible combination of validation options');
    assert.ok(true, 'so we have at least 1 test in this set');
});
QUnit.test('reentrantNotificationStrategy', (assert)=>{
    assert.ok(new Property('hi')['tinyProperty']['reentrantNotificationStrategy'] === 'queue', 'default notification strategy for Property should be "queue"');
    ////////////////////////////////////////////
    // queue
    let queueCount = 2; // starts as a value of 1, so 2 is the first value we change to.
    // queue is default
    const queueProperty = new Property(1, {
        reentrantNotificationStrategy: 'queue',
        reentrant: true
    });
    queueProperty.lazyLink((value)=>{
        if (value < 10) {
            queueProperty.value = value + 1;
        }
    });
    // notify-queue:
    // 1->2
    // 2->3
    // 3->4
    // ...
    // 8->9
    queueProperty.lazyLink((value, oldValue)=>{
        assert.ok(value === oldValue + 1, `increment each time: ${oldValue} -> ${value}`);
        assert.ok(value === queueCount++, `increment by most recent changed: ${queueCount - 2}->${queueCount - 1}, received: ${oldValue} -> ${value}`);
    });
    queueProperty.value = queueCount;
    let stackCount = 2; // starts as a value of 1, so 2 is the first value we change to.
    const finalCount = 10;
    let lastListenerCount = 10;
    ////////////////////////////////////////////
    ////////////////////////////////////////////
    // stack
    const stackProperty = new Property(stackCount - 1, {
        reentrantNotificationStrategy: 'stack',
        reentrant: true
    });
    stackProperty.lazyLink((value)=>{
        if (value < finalCount) {
            stackProperty.value = value + 1;
        }
    });
    // stack-notify:
    // 8->9
    // 7->8
    // 6->7
    // ...
    // 1->2
    stackProperty.lazyLink((value, oldValue)=>{
        stackCount++;
        assert.ok(value === oldValue + 1, `increment each time: ${oldValue} -> ${value}`);
        assert.ok(value === lastListenerCount--, `increment in order expected: ${lastListenerCount}->${lastListenerCount + 1}, received: ${oldValue} -> ${value}`);
        assert.ok(oldValue === lastListenerCount, `new count is ${lastListenerCount}: the oldValue (most recent first in stack first`);
    });
    stackProperty.value = stackCount;
//////////////////////////////////////////////////
});
QUnit.test('options.valueComparisonStrategy', (assert)=>{
    let calledCount = 0;
    let myProperty = new Property(new Vector2(0, 0), {
        valueComparisonStrategy: 'equalsFunction'
    });
    myProperty.lazyLink(()=>calledCount++);
    myProperty.value = new Vector2(0, 0);
    assert.ok(calledCount === 0, 'equal');
    myProperty.value = new Vector2(0, 3);
    assert.ok(calledCount === 1, 'not equal');
    calledCount = 0;
    myProperty = new Property(new Vector2(0, 0), {
        valueComparisonStrategy: 'lodashDeep'
    });
    myProperty.lazyLink(()=>calledCount++);
    myProperty.value = {
        something: 'hi'
    };
    assert.ok(calledCount === 1, 'not equal');
    myProperty.value = {
        something: 'hi'
    };
    assert.ok(calledCount === 1, 'equal');
    myProperty.value = {
        something: 'hi',
        other: false
    };
    assert.ok(calledCount === 2, 'not equal with other key');
});
// Tests that can only run in phet-io mode
if (Tandem.PHET_IO_ENABLED) {
    QUnit.test('Test PropertyIO toStateObject/fromStateObject', (assert)=>{
        const done = assert.async();
        const tandem = Tandem.ROOT_TEST.createTandem('testTandemProperty');
        const phetioType = NumberProperty.NumberPropertyIO;
        const propertyValue = 123;
        const validValues = [
            0,
            1,
            2,
            3,
            propertyValue
        ];
        // @ts-expect-error redefining function for testing
        tandem.addPhetioObject = function(instance, options) {
            // PhET-iO operates under the assumption that nothing will access a PhetioObject until the next animation frame
            // when the object is fully constructed.  For example, Property state variables are set after the callback
            // to addPhetioObject, which occurs during Property.constructor.super().
            setTimeout(()=>{
                // Run in the next frame after the object finished getting constructed
                const stateObject = phetioType.toStateObject(instance);
                assert.equal(stateObject.value, propertyValue, 'toStateObject should match');
                assert.deepEqual(stateObject.validValues, validValues, 'toStateObject should match');
                done();
            }, 0);
        };
        new NumberProperty(propertyValue, {
            tandem: tandem,
            validValues: validValues
        });
    });
} ///////////////////////////////
 // END PHET_IO ONLY TESTS
 ///////////////////////////////

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHlUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCB0ZXN0cyBmb3IgUHJvcGVydHlcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4vTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4vUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4vVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdQcm9wZXJ0eScgKTtcblxuUVVuaXQudGVzdCggJ1Rlc3QgdW5saW5rJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgcHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDEgKTtcbiAgY29uc3Qgc3RhcnRpbmdQTGlzdGVuZXJDb3VudCA9IHByb3BlcnR5WyAnZ2V0TGlzdGVuZXJDb3VudCcgXSgpO1xuICBjb25zdCBhID0gZnVuY3Rpb24oIGE6IHVua25vd24gKSB7IF8ubm9vcDsgfTtcbiAgY29uc3QgYiA9IGZ1bmN0aW9uKCBiOiB1bmtub3duICkgeyBfLm5vb3A7IH07XG4gIGNvbnN0IGMgPSBmdW5jdGlvbiggYzogdW5rbm93biApIHsgXy5ub29wOyB9O1xuICBwcm9wZXJ0eS5saW5rKCBhICk7XG4gIHByb3BlcnR5LmxpbmsoIGIgKTtcbiAgcHJvcGVydHkubGluayggYyApO1xuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5WyAnZ2V0TGlzdGVuZXJDb3VudCcgXSgpLCAzICsgc3RhcnRpbmdQTGlzdGVuZXJDb3VudCwgJ3Nob3VsZCBoYXZlIDMgb2JzZXJ2ZXJzIG5vdycgKTtcbiAgcHJvcGVydHkudW5saW5rKCBiICk7XG4gIGFzc2VydC5vayggcHJvcGVydHkuaGFzTGlzdGVuZXIoIGEgKSwgJ3Nob3VsZCBoYXZlIHJlbW92ZWQgYicgKTtcbiAgYXNzZXJ0Lm9rKCBwcm9wZXJ0eS5oYXNMaXN0ZW5lciggYyApLCAnc2hvdWxkIGhhdmUgcmVtb3ZlZCBiJyApO1xuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5WyAnZ2V0TGlzdGVuZXJDb3VudCcgXSgpLCAyICsgc3RhcnRpbmdQTGlzdGVuZXJDb3VudCwgJ3Nob3VsZCBoYXZlIHJlbW92ZWQgYW4gaXRlbScgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1Rlc3QgTXVsdGlsaW5rLm11bHRpbGluaycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGFQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMSApO1xuICBjb25zdCBiUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDIgKTtcbiAgbGV0IGNhbGxiYWNrcyA9IDA7XG4gIE11bHRpbGluay5tdWx0aWxpbmsoIFsgYVByb3BlcnR5LCBiUHJvcGVydHkgXSwgKCBhLCBiICkgPT4ge1xuICAgIGNhbGxiYWNrcysrO1xuICAgIGFzc2VydC5lcXVhbCggYSwgMSwgJ2ZpcnN0IHZhbHVlIHNob3VsZCBwYXNzIHRocm91Z2gnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBiLCAyLCAnc2Vjb25kIHZhbHVlIHNob3VsZCBwYXNzIHRocm91Z2gnICk7XG4gIH0gKTtcbiAgYXNzZXJ0LmVxdWFsKCBjYWxsYmFja3MsIDEsICdzaG91bGQgaGF2ZSBjYWxsZWQgYmFjayB0byBhIG11bHRpbGluaycgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1Rlc3QgTXVsdGlsaW5rLmxhenlNdWx0aWxpbmsnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBhUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDEgKTtcbiAgY29uc3QgYlByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAyICk7XG4gIGxldCBjYWxsYmFja3MgPSAwO1xuICBNdWx0aWxpbmsubGF6eU11bHRpbGluayggWyBhUHJvcGVydHksIGJQcm9wZXJ0eSBdLCAoIGEsIGIgKSA9PiB7XG4gICAgY2FsbGJhY2tzKys7XG4gICAgYXNzZXJ0LmVxdWFsKCBhLCAxICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBiLCAyICk7XG4gIH0gKTtcbiAgYXNzZXJ0LmVxdWFsKCBjYWxsYmFja3MsIDAsICdzaG91bGQgbm90IGNhbGwgYmFjayB0byBhIGxhenkgbXVsdGlsaW5rJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGVzdCBkZWZlcicsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XG4gIGxldCBjYWxsYmFja3MgPSAwO1xuICBwcm9wZXJ0eS5sYXp5TGluayggKCBuZXdWYWx1ZSwgb2xkVmFsdWUgKSA9PiB7XG4gICAgY2FsbGJhY2tzKys7XG4gICAgYXNzZXJ0LmVxdWFsKCBuZXdWYWx1ZSwgMiwgJ25ld1ZhbHVlIHNob3VsZCBiZSB0aGUgZmluYWwgdmFsdWUgYWZ0ZXIgdGhlIHRyYW5zYWN0aW9uJyApO1xuICAgIGFzc2VydC5lcXVhbCggb2xkVmFsdWUsIDAsICdvbGRWYWx1ZSBzaG91bGQgYmUgdGhlIG9yaWdpbmFsIHZhbHVlIGJlZm9yZSB0aGUgdHJhbnNhY3Rpb24nICk7XG4gIH0gKTtcbiAgcHJvcGVydHkuc2V0RGVmZXJyZWQoIHRydWUgKTtcbiAgcHJvcGVydHkudmFsdWUgPSAxO1xuICBwcm9wZXJ0eS52YWx1ZSA9IDI7XG4gIGFzc2VydC5lcXVhbCggcHJvcGVydHkudmFsdWUsIDAsICdzaG91bGQgaGF2ZSBvcmlnaW5hbCB2YWx1ZScgKTtcbiAgY29uc3QgdXBkYXRlID0gcHJvcGVydHkuc2V0RGVmZXJyZWQoIGZhbHNlICk7XG4gIGFzc2VydC5lcXVhbCggY2FsbGJhY2tzLCAwLCAnc2hvdWxkIG5vdCBjYWxsIGJhY2sgd2hpbGUgZGVmZXJyZWQnICk7XG4gIGFzc2VydC5lcXVhbCggcHJvcGVydHkudmFsdWUsIDIsICdzaG91bGQgaGF2ZSBuZXcgdmFsdWUnICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciAuc2V0RGVmZXJyZWQoZmFsc2UpIHdpbGwgYWx3YXlzIHJldHVybiAoKSA9PiB2b2lkXG4gIHVwZGF0ZSgpO1xuICBhc3NlcnQuZXF1YWwoIGNhbGxiYWNrcywgMSwgJ3Nob3VsZCBoYXZlIGJlZW4gY2FsbGVkIGJhY2sgYWZ0ZXIgdXBkYXRlJyApO1xuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5LnZhbHVlLCAyLCAnc2hvdWxkIHRha2UgZmluYWwgdmFsdWUnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdQcm9wZXJ0eSBJRCBjaGVja3MnLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQub2soIG5ldyBQcm9wZXJ0eSggMSApWyAnaWQnIF0gIT09IG5ldyBQcm9wZXJ0eSggMSApWyAnaWQnIF0sICdQcm9wZXJ0aWVzIHNob3VsZCBoYXZlIHVuaXF1ZSBJRHMnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59ICk7XG5cbnR5cGUgY2FsbFZhbHVlcyA9IHtcbiAgbmV3VmFsdWU6IG51bWJlcjtcbiAgb2xkVmFsdWU6IG51bWJlciB8IG51bGw7XG4gIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+O1xufTtcblxuUVVuaXQudGVzdCggJ1Byb3BlcnR5IGxpbmsgcGFyYW1ldGVycycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAxICk7XG4gIGNvbnN0IGNhbGxzOiBBcnJheTxjYWxsVmFsdWVzPiA9IFtdO1xuICBwcm9wZXJ0eS5saW5rKCAoIG5ld1ZhbHVlLCBvbGRWYWx1ZSwgcHJvcGVydHkgKSA9PiB7XG4gICAgY2FsbHMucHVzaCgge1xuICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgb2xkVmFsdWU6IG9sZFZhbHVlLFxuICAgICAgcHJvcGVydHk6IHByb3BlcnR5XG4gICAgfSApO1xuICB9ICk7XG4gIHByb3BlcnR5LnZhbHVlID0gMjtcblxuICBhc3NlcnQub2soIGNhbGxzLmxlbmd0aCA9PT0gMiApO1xuXG4gIGFzc2VydC5vayggY2FsbHNbIDAgXS5uZXdWYWx1ZSA9PT0gMSApO1xuICBhc3NlcnQub2soIGNhbGxzWyAwIF0ub2xkVmFsdWUgPT09IG51bGwgKTtcbiAgYXNzZXJ0Lm9rKCBjYWxsc1sgMCBdLnByb3BlcnR5ID09PSBwcm9wZXJ0eSApO1xuXG4gIGFzc2VydC5vayggY2FsbHNbIDEgXS5uZXdWYWx1ZSA9PT0gMiApO1xuICBhc3NlcnQub2soIGNhbGxzWyAxIF0ub2xkVmFsdWUgPT09IDEgKTtcbiAgYXNzZXJ0Lm9rKCBjYWxsc1sgMSBdLnByb3BlcnR5ID09PSBwcm9wZXJ0eSApO1xufSApO1xuXG4vKipcbiAqIE1ha2Ugc3VyZSBsaW5raW5nIGF0dHJpYnV0ZXMgYW5kIHVubGlua2luZyBhdHRyaWJ1dGVzIHdvcmtzIG9uIFByb3BlcnR5XG4gKi9cblFVbml0LnRlc3QoICdQcm9wZXJ0eS5saW5rQXR0cmlidXRlJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgcHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDcgKTtcbiAgY29uc3Qgc3RhdGUgPSB7IGFnZTogOTkgfTtcbiAgY29uc3QgbGlzdGVuZXIgPSAoIGFnZTogbnVtYmVyICkgPT4ge1xuICAgIHN0YXRlLmFnZSA9IGFnZTtcbiAgfTtcbiAgcHJvcGVydHkubGluayggbGlzdGVuZXIgKTtcbiAgYXNzZXJ0LmVxdWFsKCBzdGF0ZS5hZ2UsIDcsICdsaW5rIHNob3VsZCBzeW5jaHJvbml6ZSB2YWx1ZXMnICk7XG4gIHByb3BlcnR5LnZhbHVlID0gODtcbiAgYXNzZXJ0LmVxdWFsKCBzdGF0ZS5hZ2UsIDgsICdsaW5rIHNob3VsZCB1cGRhdGUgdmFsdWVzJyApO1xuICBwcm9wZXJ0eS51bmxpbmsoIGxpc3RlbmVyICk7XG4gIHByb3BlcnR5LnZhbHVlID0gOTtcbiAgYXNzZXJ0LmVxdWFsKCBzdGF0ZS5hZ2UsIDgsICdzdGF0ZSBzaG91bGQgbm90IGhhdmUgY2hhbmdlZCBhZnRlciB1bmxpbmsnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdQcm9wZXJ0eSB2YWx1ZSB2YWxpZGF0aW9uJywgYXNzZXJ0ID0+IHtcblxuICAvLyBUeXBlIHRoYXQgaXMgc3BlY2lmaWMgdG8gdmFsdWVUeXBlIHRlc3RzXG4gIGNsYXNzIFRlc3RUeXBlIHtcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7IF8ubm9vcCgpOyB9XG4gIH1cblxuICBsZXQgcHJvcGVydHk6IEludGVudGlvbmFsQW55ID0gbnVsbDtcbiAgbGV0IG9wdGlvbnMgPSB7fTtcblxuICAvLyB2YWx1ZVR5cGUgaXMgYSBwcmltaXRpdmUgdHlwZSAodHlwZW9mIHZhbGlkYXRpb24pXG4gIG9wdGlvbnMgPSB7XG4gICAgdmFsdWVUeXBlOiAnc3RyaW5nJ1xuICB9O1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBuZXcgUHJvcGVydHkoIDAsIHsgdmFsdWVUeXBlOiAnZm9vJyB9ICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3XG4gIH0sICdvcHRpb25zLnZhbHVlVHlwZSBpcyBpbnZhbGlkLCBleHBlY3RlZCBhIHByaW1pdGl2ZSBkYXRhIHR5cGUnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIG5ldyBQcm9wZXJ0eSggMCwgb3B0aW9ucyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICB9LCAnaW52YWxpZCBpbml0aWFsIHZhbHVlIHdpdGggb3B0aW9ucy52YWx1ZVR5cGUgdHlwZW9mIHZhbGlkYXRpb24nICk7XG4gIHByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnaG9yaXpvbnRhbCcsIG9wdGlvbnMgKTtcbiAgcHJvcGVydHkuc2V0KCAndmVydGljYWwnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHByb3BlcnR5LnNldCggMCApO1xuICB9LCAnaW52YWxpZCBzZXQgdmFsdWUgd2l0aCBvcHRpb25zLnZhbHVlVHlwZSB0eXBlb2YgdmFsaWRhdGlvbicgKTtcblxuICAvLyB2YWx1ZVR5cGUgaXMgYSBjb25zdHJ1Y3RvciAoaW5zdGFuY2VvZiB2YWxpZGF0aW9uKVxuICBvcHRpb25zID0ge1xuICAgIHZhbHVlVHlwZTogVGVzdFR5cGVcbiAgfTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgbmV3IFByb3BlcnR5KCAwLCBvcHRpb25zICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3XG4gIH0sICdpbnZhbGlkIGluaXRpYWwgdmFsdWUgZm9yIG9wdGlvbnMudmFsdWVUeXBlIGluc3RhbmNlb2YgdmFsaWRhdGlvbicgKTtcbiAgcHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG5ldyBUZXN0VHlwZSgpLCBvcHRpb25zICk7XG4gIHByb3BlcnR5LnNldCggbmV3IFRlc3RUeXBlKCkgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcHJvcGVydHkuc2V0KCAwICk7XG4gIH0sICdpbnZhbGlkIHNldCB2YWx1ZSB3aXRoIG9wdGlvbnMudmFsdWVUeXBlIGluc3RhbmNlb2YgdmFsaWRhdGlvbicgKTtcblxuICAvLyB2YWxpZFZhbHVlc1xuICBvcHRpb25zID0ge1xuICAgIHZhbGlkVmFsdWVzOiBbIDEsIDIsIDMgXVxuICB9O1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUwgdmFsdWUgaXMgaW52YWxpZCBmb3IgdGVzdGluZ1xuICAgIG5ldyBQcm9wZXJ0eSggMCwgeyB2YWxpZFZhbHVlczogMCB9ICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3XG4gIH0sICdvcHRpb25zLnZhbGlkVmFsdWVzIGlzIGludmFsaWQnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIG5ldyBQcm9wZXJ0eSggMCwgb3B0aW9ucyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICB9LCAnaW52YWxpZCBpbml0aWFsIHZhbHVlIHdpdGggb3B0aW9ucy52YWxpZFZhbHVlcycgKTtcbiAgcHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDEsIG9wdGlvbnMgKTtcbiAgcHJvcGVydHkuc2V0KCAzICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHByb3BlcnR5LnNldCggNCApO1xuICB9LCAnaW52YWxpZCBzZXQgdmFsdWUgd2l0aCBvcHRpb25zLnZhbGlkVmFsdWVzJyApO1xuXG4gIC8vIGlzVmFsaWRWYWx1ZXNcbiAgb3B0aW9ucyA9IHtcbiAgICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZTogbnVtYmVyICkge1xuICAgICAgcmV0dXJuICggdmFsdWUgPiAwICYmIHZhbHVlIDwgNCApO1xuICAgIH1cbiAgfTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMIHZhbHVlIGlzIGludmFsaWQgZm9yIHRlc3RpbmdcbiAgICBuZXcgUHJvcGVydHkoIDAsIHsgaXNWYWxpZFZhbHVlOiAwIH0gKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgfSwgJ29wdGlvbnMuaXNWYWxpZFZhbHVlIGlzIGludmFsaWQnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIG5ldyBQcm9wZXJ0eSggMCwgb3B0aW9ucyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICB9LCAnaW52YWxpZCBpbml0aWFsIHZhbHVlIHdpdGggb3B0aW9ucy5pc1ZhbGlkVmFsdWUnICk7XG4gIHByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAxLCBvcHRpb25zICk7XG4gIHByb3BlcnR5LnNldCggMyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBwcm9wZXJ0eS5zZXQoIDQgKTtcbiAgfSwgJ2ludmFsaWQgc2V0IHZhbHVlIHdpdGggb3B0aW9ucy5pc1ZhbGlkVmFsdWUnICk7XG5cbiAgLy8gQ29tcGF0aWJsZSBjb21iaW5hdGlvbnMgb2YgdmFsaWRhdGlvbiBvcHRpb25zLCBwb3NzaWJseSByZWR1bmRhbnQgKG5vdCBleGhhdXN0aXZlKVxuICBvcHRpb25zID0ge1xuICAgIHZhbHVlVHlwZTogJ3N0cmluZycsXG4gICAgdmFsaWRWYWx1ZXM6IFsgJ2JvYicsICdqb2UnLCAnc2FtJyBdLFxuICAgIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlOiBzdHJpbmcgKSB7XG4gICAgICByZXR1cm4gdmFsdWUubGVuZ3RoID09PSAzO1xuICAgIH1cbiAgfTtcbiAgcHJvcGVydHkgPSBuZXcgUHJvcGVydHkoICdib2InLCBvcHRpb25zICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHByb3BlcnR5LnNldCggMCApO1xuICB9LCAnaW52YWxpZCBzZXQgdmFsdWUgd2l0aCBjb21wYXRpYmxlIGNvbWJpbmF0aW9uIG9mIHZhbGlkYXRpb24gb3B0aW9ucycgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcHJvcGVydHkuc2V0KCAndGVkJyApO1xuICB9LCAnaW52YWxpZCBzZXQgdmFsdWUgd2l0aCBjb21wYXRpYmxlIGNvbWJpbmF0aW9uIG9mIHZhbGlkYXRpb24gb3B0aW9ucycgKTtcblxuICAvLyBJbmNvbXBhdGlibGUgY29tYmluYXRpb25zIG9mIHZhbGlkYXRpb24gb3B0aW9ucyAobm90IGV4aGF1c3RpdmUpXG4gIC8vIFRoZXNlIHRlc3RzIHdpbGwgYWx3YXlzIGZhaWwgb24gaW5pdGlhbGl6YXRpb24sIHNpbmNlIHRoZSB2YWxpZGF0aW9uIGNyaXRlcmlhIGFyZSBjb250cmFkaWN0b3J5LlxuICBvcHRpb25zID0ge1xuICAgIHZhbHVlVHlwZTogJ251bWJlcicsXG4gICAgdmFsaWRWYWx1ZXM6IFsgJ2JvYicsICdqb2UnLCAnc2FtJyBdLFxuICAgIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlOiBzdHJpbmcgKSB7XG4gICAgICByZXR1cm4gdmFsdWUubGVuZ3RoID09PSA0O1xuICAgIH1cbiAgfTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAsIG9wdGlvbnMgKTtcbiAgfSwgJ2ludmFsaWQgaW5pdGlhbCB2YWx1ZSB3aXRoIGluY29tcGF0aWJsZSBjb21iaW5hdGlvbiBvZiB2YWxpZGF0aW9uIG9wdGlvbnMnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnYm9iJywgb3B0aW9ucyApO1xuICB9LCAnaW52YWxpZCBpbml0aWFsIHZhbHVlIHdpdGggaW5jb21wYXRpYmxlIGNvbWJpbmF0aW9uIG9mIHZhbGlkYXRpb24gb3B0aW9ucycgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcHJvcGVydHkgPSBuZXcgUHJvcGVydHkoICdmcmVkJywgb3B0aW9ucyApO1xuICB9LCAnaW52YWxpZCBpbml0aWFsIHZhbHVlIHdpdGggaW5jb21wYXRpYmxlIGNvbWJpbmF0aW9uIG9mIHZhbGlkYXRpb24gb3B0aW9ucycgKTtcblxuICBhc3NlcnQub2soIHRydWUsICdzbyB3ZSBoYXZlIGF0IGxlYXN0IDEgdGVzdCBpbiB0aGlzIHNldCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3JlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5JywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCBuZXcgUHJvcGVydHkoICdoaScgKVsgJ3RpbnlQcm9wZXJ0eScgXVsgJ3JlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5JyBdID09PSAncXVldWUnLFxuICAgICdkZWZhdWx0IG5vdGlmaWNhdGlvbiBzdHJhdGVneSBmb3IgUHJvcGVydHkgc2hvdWxkIGJlIFwicXVldWVcIicgKTtcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBxdWV1ZVxuICBsZXQgcXVldWVDb3VudCA9IDI7IC8vIHN0YXJ0cyBhcyBhIHZhbHVlIG9mIDEsIHNvIDIgaXMgdGhlIGZpcnN0IHZhbHVlIHdlIGNoYW5nZSB0by5cblxuICAvLyBxdWV1ZSBpcyBkZWZhdWx0XG4gIGNvbnN0IHF1ZXVlUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8bnVtYmVyPiggMSwge1xuICAgIHJlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5OiAncXVldWUnLFxuICAgIHJlZW50cmFudDogdHJ1ZVxuICB9ICk7XG5cbiAgcXVldWVQcm9wZXJ0eS5sYXp5TGluayggdmFsdWUgPT4ge1xuICAgIGlmICggdmFsdWUgPCAxMCApIHtcbiAgICAgIHF1ZXVlUHJvcGVydHkudmFsdWUgPSB2YWx1ZSArIDE7XG4gICAgfVxuICB9ICk7XG5cbiAgLy8gbm90aWZ5LXF1ZXVlOlxuICAvLyAxLT4yXG4gIC8vIDItPjNcbiAgLy8gMy0+NFxuICAvLyAuLi5cbiAgLy8gOC0+OVxuXG4gIHF1ZXVlUHJvcGVydHkubGF6eUxpbmsoICggdmFsdWUsIG9sZFZhbHVlICkgPT4ge1xuICAgIGFzc2VydC5vayggdmFsdWUgPT09IG9sZFZhbHVlICsgMSwgYGluY3JlbWVudCBlYWNoIHRpbWU6ICR7b2xkVmFsdWV9IC0+ICR7dmFsdWV9YCApO1xuICAgIGFzc2VydC5vayggdmFsdWUgPT09IHF1ZXVlQ291bnQrKywgYGluY3JlbWVudCBieSBtb3N0IHJlY2VudCBjaGFuZ2VkOiAke3F1ZXVlQ291bnQgLSAyfS0+JHtxdWV1ZUNvdW50IC0gMX0sIHJlY2VpdmVkOiAke29sZFZhbHVlfSAtPiAke3ZhbHVlfWAgKTtcbiAgfSApO1xuICBxdWV1ZVByb3BlcnR5LnZhbHVlID0gcXVldWVDb3VudDtcblxuICBsZXQgc3RhY2tDb3VudCA9IDI7IC8vIHN0YXJ0cyBhcyBhIHZhbHVlIG9mIDEsIHNvIDIgaXMgdGhlIGZpcnN0IHZhbHVlIHdlIGNoYW5nZSB0by5cbiAgY29uc3QgZmluYWxDb3VudCA9IDEwO1xuICBsZXQgbGFzdExpc3RlbmVyQ291bnQgPSAxMDtcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBzdGFja1xuICBjb25zdCBzdGFja1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5PG51bWJlcj4oIHN0YWNrQ291bnQgLSAxLCB7XG4gICAgcmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3k6ICdzdGFjaycsXG4gICAgcmVlbnRyYW50OiB0cnVlXG4gIH0gKTtcblxuICBzdGFja1Byb3BlcnR5LmxhenlMaW5rKCB2YWx1ZSA9PiB7XG4gICAgaWYgKCB2YWx1ZSA8IGZpbmFsQ291bnQgKSB7XG4gICAgICBzdGFja1Byb3BlcnR5LnZhbHVlID0gdmFsdWUgKyAxO1xuICAgIH1cbiAgfSApO1xuXG4gIC8vIHN0YWNrLW5vdGlmeTpcbiAgLy8gOC0+OVxuICAvLyA3LT44XG4gIC8vIDYtPjdcbiAgLy8gLi4uXG4gIC8vIDEtPjJcbiAgc3RhY2tQcm9wZXJ0eS5sYXp5TGluayggKCB2YWx1ZSwgb2xkVmFsdWUgKSA9PiB7XG4gICAgc3RhY2tDb3VudCsrO1xuICAgIGFzc2VydC5vayggdmFsdWUgPT09IG9sZFZhbHVlICsgMSwgYGluY3JlbWVudCBlYWNoIHRpbWU6ICR7b2xkVmFsdWV9IC0+ICR7dmFsdWV9YCApO1xuICAgIGFzc2VydC5vayggdmFsdWUgPT09IGxhc3RMaXN0ZW5lckNvdW50LS0sIGBpbmNyZW1lbnQgaW4gb3JkZXIgZXhwZWN0ZWQ6ICR7bGFzdExpc3RlbmVyQ291bnR9LT4ke2xhc3RMaXN0ZW5lckNvdW50ICsgMX0sIHJlY2VpdmVkOiAke29sZFZhbHVlfSAtPiAke3ZhbHVlfWAgKTtcbiAgICBhc3NlcnQub2soIG9sZFZhbHVlID09PSBsYXN0TGlzdGVuZXJDb3VudCwgYG5ldyBjb3VudCBpcyAke2xhc3RMaXN0ZW5lckNvdW50fTogdGhlIG9sZFZhbHVlIChtb3N0IHJlY2VudCBmaXJzdCBpbiBzdGFjayBmaXJzdGAgKTtcbiAgfSApO1xuICBzdGFja1Byb3BlcnR5LnZhbHVlID0gc3RhY2tDb3VudDtcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxufSApO1xuXG5RVW5pdC50ZXN0KCAnb3B0aW9ucy52YWx1ZUNvbXBhcmlzb25TdHJhdGVneScsIGFzc2VydCA9PiB7XG5cbiAgbGV0IGNhbGxlZENvdW50ID0gMDtcbiAgbGV0IG15UHJvcGVydHkgPSBuZXcgUHJvcGVydHk8SW50ZW50aW9uYWxBbnk+KCBuZXcgVmVjdG9yMiggMCwgMCApLCB7XG4gICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbidcbiAgfSApO1xuICBteVByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiBjYWxsZWRDb3VudCsrICk7XG5cbiAgbXlQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gIGFzc2VydC5vayggY2FsbGVkQ291bnQgPT09IDAsICdlcXVhbCcgKTtcbiAgbXlQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKCAwLCAzICk7XG4gIGFzc2VydC5vayggY2FsbGVkQ291bnQgPT09IDEsICdub3QgZXF1YWwnICk7XG5cbiAgY2FsbGVkQ291bnQgPSAwO1xuICBteVByb3BlcnR5ID0gbmV3IFByb3BlcnR5PEludGVudGlvbmFsQW55PiggbmV3IFZlY3RvcjIoIDAsIDAgKSwge1xuICAgIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnbG9kYXNoRGVlcCdcbiAgfSApO1xuICBteVByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiBjYWxsZWRDb3VudCsrICk7XG5cbiAgbXlQcm9wZXJ0eS52YWx1ZSA9IHsgc29tZXRoaW5nOiAnaGknIH07XG4gIGFzc2VydC5vayggY2FsbGVkQ291bnQgPT09IDEsICdub3QgZXF1YWwnICk7XG4gIG15UHJvcGVydHkudmFsdWUgPSB7IHNvbWV0aGluZzogJ2hpJyB9O1xuICBhc3NlcnQub2soIGNhbGxlZENvdW50ID09PSAxLCAnZXF1YWwnICk7XG4gIG15UHJvcGVydHkudmFsdWUgPSB7IHNvbWV0aGluZzogJ2hpJywgb3RoZXI6IGZhbHNlIH07XG4gIGFzc2VydC5vayggY2FsbGVkQ291bnQgPT09IDIsICdub3QgZXF1YWwgd2l0aCBvdGhlciBrZXknICk7XG59ICk7XG5cbi8vIFRlc3RzIHRoYXQgY2FuIG9ubHkgcnVuIGluIHBoZXQtaW8gbW9kZVxuaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xuICBRVW5pdC50ZXN0KCAnVGVzdCBQcm9wZXJ0eUlPIHRvU3RhdGVPYmplY3QvZnJvbVN0YXRlT2JqZWN0JywgYXNzZXJ0ID0+IHtcbiAgICBjb25zdCBkb25lID0gYXNzZXJ0LmFzeW5jKCk7XG4gICAgY29uc3QgdGFuZGVtID0gVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICd0ZXN0VGFuZGVtUHJvcGVydHknICk7XG4gICAgY29uc3QgcGhldGlvVHlwZSA9IE51bWJlclByb3BlcnR5Lk51bWJlclByb3BlcnR5SU87XG4gICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IDEyMztcbiAgICBjb25zdCB2YWxpZFZhbHVlcyA9IFsgMCwgMSwgMiwgMywgcHJvcGVydHlWYWx1ZSBdO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciByZWRlZmluaW5nIGZ1bmN0aW9uIGZvciB0ZXN0aW5nXG4gICAgdGFuZGVtLmFkZFBoZXRpb09iamVjdCA9IGZ1bmN0aW9uKCBpbnN0YW5jZTogTnVtYmVyUHJvcGVydHksIG9wdGlvbnM6IEludGVudGlvbmFsQW55ICk6IHZvaWQge1xuXG4gICAgICAvLyBQaEVULWlPIG9wZXJhdGVzIHVuZGVyIHRoZSBhc3N1bXB0aW9uIHRoYXQgbm90aGluZyB3aWxsIGFjY2VzcyBhIFBoZXRpb09iamVjdCB1bnRpbCB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWVcbiAgICAgIC8vIHdoZW4gdGhlIG9iamVjdCBpcyBmdWxseSBjb25zdHJ1Y3RlZC4gIEZvciBleGFtcGxlLCBQcm9wZXJ0eSBzdGF0ZSB2YXJpYWJsZXMgYXJlIHNldCBhZnRlciB0aGUgY2FsbGJhY2tcbiAgICAgIC8vIHRvIGFkZFBoZXRpb09iamVjdCwgd2hpY2ggb2NjdXJzIGR1cmluZyBQcm9wZXJ0eS5jb25zdHJ1Y3Rvci5zdXBlcigpLlxuICAgICAgc2V0VGltZW91dCggKCkgPT4geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG5cbiAgICAgICAgLy8gUnVuIGluIHRoZSBuZXh0IGZyYW1lIGFmdGVyIHRoZSBvYmplY3QgZmluaXNoZWQgZ2V0dGluZyBjb25zdHJ1Y3RlZFxuICAgICAgICBjb25zdCBzdGF0ZU9iamVjdCA9IHBoZXRpb1R5cGUudG9TdGF0ZU9iamVjdCggaW5zdGFuY2UgKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKCBzdGF0ZU9iamVjdC52YWx1ZSwgcHJvcGVydHlWYWx1ZSwgJ3RvU3RhdGVPYmplY3Qgc2hvdWxkIG1hdGNoJyApO1xuICAgICAgICBhc3NlcnQuZGVlcEVxdWFsKCBzdGF0ZU9iamVjdC52YWxpZFZhbHVlcywgdmFsaWRWYWx1ZXMsICd0b1N0YXRlT2JqZWN0IHNob3VsZCBtYXRjaCcgKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSwgMCApO1xuICAgIH07XG4gICAgbmV3IE51bWJlclByb3BlcnR5KCBwcm9wZXJ0eVZhbHVlLCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3XG4gICAgICB0YW5kZW06IHRhbmRlbSxcbiAgICAgIHZhbGlkVmFsdWVzOiB2YWxpZFZhbHVlc1xuICAgIH0gKTtcbiAgfSApO1xufVxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gRU5EIFBIRVRfSU8gT05MWSBURVNUU1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyJdLCJuYW1lcyI6WyJWZWN0b3IyIiwiVGFuZGVtIiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsInByb3BlcnR5Iiwic3RhcnRpbmdQTGlzdGVuZXJDb3VudCIsImEiLCJfIiwibm9vcCIsImIiLCJjIiwibGluayIsImVxdWFsIiwidW5saW5rIiwib2siLCJoYXNMaXN0ZW5lciIsImFQcm9wZXJ0eSIsImJQcm9wZXJ0eSIsImNhbGxiYWNrcyIsIm11bHRpbGluayIsImxhenlNdWx0aWxpbmsiLCJsYXp5TGluayIsIm5ld1ZhbHVlIiwib2xkVmFsdWUiLCJzZXREZWZlcnJlZCIsInZhbHVlIiwidXBkYXRlIiwiY2FsbHMiLCJwdXNoIiwibGVuZ3RoIiwic3RhdGUiLCJhZ2UiLCJsaXN0ZW5lciIsIlRlc3RUeXBlIiwib3B0aW9ucyIsInZhbHVlVHlwZSIsIndpbmRvdyIsInRocm93cyIsInNldCIsInZhbGlkVmFsdWVzIiwiaXNWYWxpZFZhbHVlIiwicXVldWVDb3VudCIsInF1ZXVlUHJvcGVydHkiLCJyZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneSIsInJlZW50cmFudCIsInN0YWNrQ291bnQiLCJmaW5hbENvdW50IiwibGFzdExpc3RlbmVyQ291bnQiLCJzdGFja1Byb3BlcnR5IiwiY2FsbGVkQ291bnQiLCJteVByb3BlcnR5IiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJzb21ldGhpbmciLCJvdGhlciIsIlBIRVRfSU9fRU5BQkxFRCIsImRvbmUiLCJhc3luYyIsInRhbmRlbSIsIlJPT1RfVEVTVCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1R5cGUiLCJOdW1iZXJQcm9wZXJ0eUlPIiwicHJvcGVydHlWYWx1ZSIsImFkZFBoZXRpb09iamVjdCIsImluc3RhbmNlIiwic2V0VGltZW91dCIsInN0YXRlT2JqZWN0IiwidG9TdGF0ZU9iamVjdCIsImRlZXBFcXVhbCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLDBCQUEwQjtBQUU5QyxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQyxlQUFlLGlCQUFpQjtBQUN2QyxPQUFPQyxvQkFBb0Isc0JBQXNCO0FBQ2pELE9BQU9DLGNBQWMsZ0JBQWdCO0FBR3JDQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLGVBQWVDLENBQUFBO0lBQ3pCLE1BQU1DLFdBQVcsSUFBSUwsU0FBVTtJQUMvQixNQUFNTSx5QkFBeUJELFFBQVEsQ0FBRSxtQkFBb0I7SUFDN0QsTUFBTUUsSUFBSSxTQUFVQSxDQUFVO1FBQUtDLEVBQUVDLElBQUk7SUFBRTtJQUMzQyxNQUFNQyxJQUFJLFNBQVVBLENBQVU7UUFBS0YsRUFBRUMsSUFBSTtJQUFFO0lBQzNDLE1BQU1FLElBQUksU0FBVUEsQ0FBVTtRQUFLSCxFQUFFQyxJQUFJO0lBQUU7SUFDM0NKLFNBQVNPLElBQUksQ0FBRUw7SUFDZkYsU0FBU08sSUFBSSxDQUFFRjtJQUNmTCxTQUFTTyxJQUFJLENBQUVEO0lBQ2ZQLE9BQU9TLEtBQUssQ0FBRVIsUUFBUSxDQUFFLG1CQUFvQixJQUFJLElBQUlDLHdCQUF3QjtJQUM1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