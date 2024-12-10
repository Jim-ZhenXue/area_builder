// Copyright 2017-2024, University of Colorado Boulder
/**
 * QUnit tests for NumberProperty
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Range from '../../dot/js/Range.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberProperty, { DEFAULT_RANGE } from './NumberProperty.js';
import Property from './Property.js';
QUnit.module('NumberProperty');
QUnit.test('Test NumberProperty', (assert)=>{
    assert.ok(true, 'one test needed when running without assertions');
    let property = new NumberProperty(42); // highly random, do not change
    // valueType
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL
        property = new NumberProperty('foo');
    }, 'initial value has invalid valueType');
    property = new NumberProperty(0);
    property.value = 1;
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL
        property.value = 'foo';
    }, 'set value has invalid valueType');
    // numberType
    property = new NumberProperty(0, {
        numberType: 'FloatingPoint'
    });
    property.value = 1;
    property.value = 1.2;
    window.assert && assert.throws(()=>{
        property = new NumberProperty(1.2, {
            numberType: 'Integer'
        });
    }, 'initial value has invalid numberType');
    window.assert && assert.throws(()=>{
        property = new NumberProperty(0, {
            numberType: 'Integer',
            validValues: [
                0,
                1,
                1.2,
                2
            ]
        });
    }, 'member of validValues has invalid numberType');
    property = new NumberProperty(0, {
        numberType: 'Integer'
    });
    property.value = 1;
    window.assert && assert.throws(()=>{
        property.value = 1.2;
    }, 'set value has invalid numberType');
    // range
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL
        property = new NumberProperty(0, {
            range: [
                0,
                10
            ]
        });
    }, 'bad range');
    window.assert && assert.throws(()=>{
        property = new NumberProperty(11, {
            range: new Range(0, 10)
        });
    }, 'initial value is greater than range.max');
    window.assert && assert.throws(()=>{
        property = new NumberProperty(-1, {
            range: new Range(0, 10)
        });
    }, 'initial value is less than range.min');
    window.assert && assert.throws(()=>{
        property = new NumberProperty(0, {
            range: new Range(0, 10),
            validValues: [
                0,
                1,
                2,
                11
            ]
        });
    }, 'member of validValues is greater than range.max');
    window.assert && assert.throws(()=>{
        property = new NumberProperty(0, {
            range: new Range(0, 10),
            validValues: [
                -1,
                0,
                1,
                2
            ]
        });
    }, 'member of validValues is less than range.min');
    property = new NumberProperty(0, {
        range: new Range(0, 10)
    });
    property.value = 5;
    window.assert && assert.throws(()=>{
        property.value = 11;
    }, 'set value is greater than range.max');
    window.assert && assert.throws(()=>{
        property.value = -1;
    }, 'set value is less than range.min');
    // units
    window.assert && assert.throws(()=>{
        property = new NumberProperty(0, {
            // @ts-expect-error - elephants is not a supported unit
            units: 'elephants'
        });
    }, 'bad units');
    ///////////////////////////////
    property = new NumberProperty(0, {
        range: new Range(0, 10)
    });
    property.rangeProperty.value = new Range(0, 100);
    property.value = 99;
    property.rangeProperty.value = new Range(90, 100);
    // This should not fail, but will until we support nested deferral for PhET-iO support, see https://github.com/phetsims/axon/issues/282
    // p.reset();
    ///////////////////////////////
    property = new NumberProperty(0, {
        range: new Range(0, 10)
    });
    property.value = 5;
    property.rangeProperty.value = new Range(4, 10);
    property.reset();
    assert.ok(property.value === 0, 'reset');
    assert.ok(property.rangeProperty.value.min === 0, 'reset range');
});
QUnit.test('Test NumberProperty range option as Property', (assert)=>{
    let rangeProperty = new Property(new Range(0, 1));
    let property = new NumberProperty(4);
    // valueType
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL
        property = new NumberProperty(0, {
            range: 'hi'
        });
    }, 'incorrect range type');
    property = new NumberProperty(0, {
        range: rangeProperty
    });
    assert.ok(property.rangeProperty === rangeProperty, 'rangeProperty should be set');
    assert.ok(property.range === rangeProperty.value, 'rangeProperty value should be set NumberProperty.set on construction');
    property.value = 1;
    property.value = 0;
    property.value = 0.5;
    window.assert && assert.throws(()=>{
        property.value = 2;
    }, 'larger than range');
    window.assert && assert.throws(()=>{
        property.value = -2;
    }, 'smaller than range');
    window.assert && assert.throws(()=>{
        rangeProperty.value = new Range(5, 10);
    }, 'current value outside of range');
    // reset from previous test setting to [5,10]
    property.dispose();
    rangeProperty.dispose();
    rangeProperty = new Property(new Range(0, 1));
    property = new NumberProperty(0, {
        range: rangeProperty
    });
    rangeProperty.value = new Range(0, 10);
    property.value = 2;
    property.setValueAndRange(100, new Range(99, 101));
    const myRange = new Range(5, 10);
    property.setValueAndRange(6, myRange);
    assert.ok(myRange === property.rangeProperty.value, 'reference should be kept');
    property = new NumberProperty(0, {
        range: new Range(0, 1)
    });
    assert.ok(property.rangeProperty instanceof Property, 'created a rangeProperty from a range');
    // deferring ordering dependencies
    ///////////////////////////////////////////////////////
    let pCalled = 0;
    let pRangeCalled = 0;
    property.lazyLink(()=>pCalled++);
    property.rangeProperty.lazyLink(()=>pRangeCalled++);
    property.setDeferred(true);
    property.rangeProperty.setDeferred(true);
    property.set(3);
    assert.ok(pCalled === 0, 'p is still deferred, should not call listeners');
    property.rangeProperty.set(new Range(2, 3));
    assert.ok(pRangeCalled === 0, 'p.rangeProperty is still deferred, should not call listeners');
    const notifyPListeners = property.setDeferred(false);
    if (window.assert) {
        assert.throws(()=>{
            notifyPListeners && notifyPListeners();
        }, 'rangeProperty is not yet undeferred and so has the wrong value');
        property['notifying'] = false; // since the above threw an error, reset
    }
    const notifyRangeListeners = property.rangeProperty.setDeferred(false);
    notifyPListeners && notifyPListeners();
    assert.ok(pCalled === 1, 'p listeners should have been called');
    notifyRangeListeners && notifyRangeListeners();
    assert.ok(pRangeCalled === 1, 'p.rangeProperty is still deferred, should not call listeners');
    property.setValueAndRange(-100, new Range(-101, -99));
    assert.ok(pCalled === 2, 'p listeners should have been called again');
    assert.ok(pRangeCalled === 2, 'p.rangeProperty is still deferred, should not call listeners again');
    property = new NumberProperty(0);
    property.value = 4;
    assert.ok(property.rangeProperty.value === DEFAULT_RANGE, 'rangeProperty should have been created');
    property.rangeProperty.value = new Range(0, 4);
    window.assert && assert.throws(()=>{
        property.value = 5;
    }, 'current value outside of range');
});
QUnit.test('Test NumberProperty phet-io options', (assert)=>{
    const tandem = Tandem.ROOT_TEST;
    let numberProperty = new NumberProperty(0, {
        range: new Range(0, 20),
        tandem: tandem.createTandem('numberProperty'),
        rangePropertyOptions: {
            tandem: tandem.createTandem('rangeProperty')
        }
    });
    assert.ok(numberProperty.rangeProperty.isPhetioInstrumented(), 'rangeProperty instrumented');
    assert.ok(numberProperty.rangeProperty.tandem.name === 'rangeProperty', 'rangeProperty instrumented');
    numberProperty.dispose();
    numberProperty = new NumberProperty(0, {
        range: DEFAULT_RANGE
    });
    assert.ok(!numberProperty.rangeProperty.isPhetioInstrumented(), 'null ranges do not get instrumented rangeProperty');
    window.assert && Tandem.VALIDATION && assert.throws(()=>{
        numberProperty = new NumberProperty(0, {
            range: new Range(0, 20),
            tandem: tandem.createTandem('numberProperty2'),
            rangePropertyOptions: {
                tandem: tandem.createTandem('rangePropertyfdsa')
            }
        });
    }, 'cannot instrument default rangeProperty with tandem other than "rangeProperty"');
    numberProperty.dispose();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHlUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCB0ZXN0cyBmb3IgTnVtYmVyUHJvcGVydHlcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgTnVtYmVyUHJvcGVydHksIHsgREVGQVVMVF9SQU5HRSB9IGZyb20gJy4vTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4vUHJvcGVydHkuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdOdW1iZXJQcm9wZXJ0eScgKTtcblxuUVVuaXQudGVzdCggJ1Rlc3QgTnVtYmVyUHJvcGVydHknLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQub2soIHRydWUsICdvbmUgdGVzdCBuZWVkZWQgd2hlbiBydW5uaW5nIHdpdGhvdXQgYXNzZXJ0aW9ucycgKTtcblxuICBsZXQgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDQyICk7IC8vIGhpZ2hseSByYW5kb20sIGRvIG5vdCBjaGFuZ2VcblxuICAvLyB2YWx1ZVR5cGVcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMXG4gICAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoICdmb28nICk7XG4gIH0sICdpbml0aWFsIHZhbHVlIGhhcyBpbnZhbGlkIHZhbHVlVHlwZScgKTtcbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcbiAgcHJvcGVydHkudmFsdWUgPSAxO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUxcbiAgICBwcm9wZXJ0eS52YWx1ZSA9ICdmb28nO1xuICB9LCAnc2V0IHZhbHVlIGhhcyBpbnZhbGlkIHZhbHVlVHlwZScgKTtcblxuICAvLyBudW1iZXJUeXBlXG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IG51bWJlclR5cGU6ICdGbG9hdGluZ1BvaW50JyB9ICk7XG4gIHByb3BlcnR5LnZhbHVlID0gMTtcbiAgcHJvcGVydHkudmFsdWUgPSAxLjI7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLjIsIHsgbnVtYmVyVHlwZTogJ0ludGVnZXInIH0gKTtcbiAgfSwgJ2luaXRpYWwgdmFsdWUgaGFzIGludmFsaWQgbnVtYmVyVHlwZScgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcbiAgICAgIHZhbGlkVmFsdWVzOiBbIDAsIDEsIDEuMiwgMiBdXG4gICAgfSApO1xuICB9LCAnbWVtYmVyIG9mIHZhbGlkVmFsdWVzIGhhcyBpbnZhbGlkIG51bWJlclR5cGUnICk7XG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IG51bWJlclR5cGU6ICdJbnRlZ2VyJyB9ICk7XG4gIHByb3BlcnR5LnZhbHVlID0gMTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcHJvcGVydHkudmFsdWUgPSAxLjI7XG4gIH0sICdzZXQgdmFsdWUgaGFzIGludmFsaWQgbnVtYmVyVHlwZScgKTtcblxuICAvLyByYW5nZVxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUxcbiAgICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwgeyByYW5nZTogWyAwLCAxMCBdIH0gKTtcbiAgfSwgJ2JhZCByYW5nZScgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDExLCB7IHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEwICkgfSApO1xuICB9LCAnaW5pdGlhbCB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gcmFuZ2UubWF4JyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggLTEsIHsgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKSB9ICk7XG4gIH0sICdpbml0aWFsIHZhbHVlIGlzIGxlc3MgdGhhbiByYW5nZS5taW4nICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxMCApLFxuICAgICAgdmFsaWRWYWx1ZXM6IFsgMCwgMSwgMiwgMTEgXVxuICAgIH0gKTtcbiAgfSwgJ21lbWJlciBvZiB2YWxpZFZhbHVlcyBpcyBncmVhdGVyIHRoYW4gcmFuZ2UubWF4JyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKSxcbiAgICAgIHZhbGlkVmFsdWVzOiBbIC0xLCAwLCAxLCAyIF1cbiAgICB9ICk7XG4gIH0sICdtZW1iZXIgb2YgdmFsaWRWYWx1ZXMgaXMgbGVzcyB0aGFuIHJhbmdlLm1pbicgKTtcbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHsgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKSB9ICk7XG4gIHByb3BlcnR5LnZhbHVlID0gNTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcHJvcGVydHkudmFsdWUgPSAxMTtcbiAgfSwgJ3NldCB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gcmFuZ2UubWF4JyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBwcm9wZXJ0eS52YWx1ZSA9IC0xO1xuICB9LCAnc2V0IHZhbHVlIGlzIGxlc3MgdGhhbiByYW5nZS5taW4nICk7XG5cbiAgLy8gdW5pdHNcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGVsZXBoYW50cyBpcyBub3QgYSBzdXBwb3J0ZWQgdW5pdFxuICAgICAgdW5pdHM6ICdlbGVwaGFudHMnXG4gICAgfSApO1xuICB9LCAnYmFkIHVuaXRzJyApO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHsgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKSB9ICk7XG4gIHByb3BlcnR5LnJhbmdlUHJvcGVydHkudmFsdWUgPSBuZXcgUmFuZ2UoIDAsIDEwMCApO1xuICBwcm9wZXJ0eS52YWx1ZSA9IDk5O1xuICBwcm9wZXJ0eS5yYW5nZVByb3BlcnR5LnZhbHVlID0gbmV3IFJhbmdlKCA5MCwgMTAwICk7XG5cbiAgLy8gVGhpcyBzaG91bGQgbm90IGZhaWwsIGJ1dCB3aWxsIHVudGlsIHdlIHN1cHBvcnQgbmVzdGVkIGRlZmVycmFsIGZvciBQaEVULWlPIHN1cHBvcnQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvMjgyXG4gIC8vIHAucmVzZXQoKTtcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEwICkgfSApO1xuICBwcm9wZXJ0eS52YWx1ZSA9IDU7XG4gIHByb3BlcnR5LnJhbmdlUHJvcGVydHkudmFsdWUgPSBuZXcgUmFuZ2UoIDQsIDEwICk7XG4gIHByb3BlcnR5LnJlc2V0KCk7XG4gIGFzc2VydC5vayggcHJvcGVydHkudmFsdWUgPT09IDAsICdyZXNldCcgKTtcbiAgYXNzZXJ0Lm9rKCBwcm9wZXJ0eS5yYW5nZVByb3BlcnR5LnZhbHVlLm1pbiA9PT0gMCwgJ3Jlc2V0IHJhbmdlJyApO1xufSApO1xuXG5cblFVbml0LnRlc3QoICdUZXN0IE51bWJlclByb3BlcnR5IHJhbmdlIG9wdGlvbiBhcyBQcm9wZXJ0eScsIGFzc2VydCA9PiB7XG5cbiAgbGV0IHJhbmdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG5ldyBSYW5nZSggMCwgMSApICk7XG4gIGxldCBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggNCApO1xuXG4gIC8vIHZhbHVlVHlwZVxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUxcbiAgICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwgeyByYW5nZTogJ2hpJyB9ICk7XG4gIH0sICdpbmNvcnJlY3QgcmFuZ2UgdHlwZScgKTtcblxuICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwgeyByYW5nZTogcmFuZ2VQcm9wZXJ0eSB9ICk7XG4gIGFzc2VydC5vayggcHJvcGVydHkucmFuZ2VQcm9wZXJ0eSA9PT0gcmFuZ2VQcm9wZXJ0eSwgJ3JhbmdlUHJvcGVydHkgc2hvdWxkIGJlIHNldCcgKTtcbiAgYXNzZXJ0Lm9rKCBwcm9wZXJ0eS5yYW5nZSA9PT0gcmFuZ2VQcm9wZXJ0eS52YWx1ZSwgJ3JhbmdlUHJvcGVydHkgdmFsdWUgc2hvdWxkIGJlIHNldCBOdW1iZXJQcm9wZXJ0eS5zZXQgb24gY29uc3RydWN0aW9uJyApO1xuICBwcm9wZXJ0eS52YWx1ZSA9IDE7XG4gIHByb3BlcnR5LnZhbHVlID0gMDtcbiAgcHJvcGVydHkudmFsdWUgPSAwLjU7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHByb3BlcnR5LnZhbHVlID0gMjtcbiAgfSwgJ2xhcmdlciB0aGFuIHJhbmdlJyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBwcm9wZXJ0eS52YWx1ZSA9IC0yO1xuICB9LCAnc21hbGxlciB0aGFuIHJhbmdlJyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICByYW5nZVByb3BlcnR5LnZhbHVlID0gbmV3IFJhbmdlKCA1LCAxMCApO1xuICB9LCAnY3VycmVudCB2YWx1ZSBvdXRzaWRlIG9mIHJhbmdlJyApO1xuXG4gIC8vIHJlc2V0IGZyb20gcHJldmlvdXMgdGVzdCBzZXR0aW5nIHRvIFs1LDEwXVxuICBwcm9wZXJ0eS5kaXNwb3NlKCk7XG4gIHJhbmdlUHJvcGVydHkuZGlzcG9zZSgpO1xuICByYW5nZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBuZXcgUmFuZ2UoIDAsIDEgKSApO1xuXG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IHJhbmdlOiByYW5nZVByb3BlcnR5IH0gKTtcbiAgcmFuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5ldyBSYW5nZSggMCwgMTAgKTtcbiAgcHJvcGVydHkudmFsdWUgPSAyO1xuXG4gIHByb3BlcnR5LnNldFZhbHVlQW5kUmFuZ2UoIDEwMCwgbmV3IFJhbmdlKCA5OSwgMTAxICkgKTtcblxuICBjb25zdCBteVJhbmdlID0gbmV3IFJhbmdlKCA1LCAxMCApO1xuICBwcm9wZXJ0eS5zZXRWYWx1ZUFuZFJhbmdlKCA2LCBteVJhbmdlICk7XG5cbiAgYXNzZXJ0Lm9rKCBteVJhbmdlID09PSBwcm9wZXJ0eS5yYW5nZVByb3BlcnR5LnZhbHVlLCAncmVmZXJlbmNlIHNob3VsZCBiZSBrZXB0JyApO1xuXG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEgKSB9ICk7XG4gIGFzc2VydC5vayggcHJvcGVydHkucmFuZ2VQcm9wZXJ0eSBpbnN0YW5jZW9mIFByb3BlcnR5LCAnY3JlYXRlZCBhIHJhbmdlUHJvcGVydHkgZnJvbSBhIHJhbmdlJyApO1xuXG4gIC8vIGRlZmVycmluZyBvcmRlcmluZyBkZXBlbmRlbmNpZXNcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICBsZXQgcENhbGxlZCA9IDA7XG4gIGxldCBwUmFuZ2VDYWxsZWQgPSAwO1xuICBwcm9wZXJ0eS5sYXp5TGluayggKCkgPT4gcENhbGxlZCsrICk7XG4gIHByb3BlcnR5LnJhbmdlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHBSYW5nZUNhbGxlZCsrICk7XG4gIHByb3BlcnR5LnNldERlZmVycmVkKCB0cnVlICk7XG4gIHByb3BlcnR5LnJhbmdlUHJvcGVydHkuc2V0RGVmZXJyZWQoIHRydWUgKTtcbiAgcHJvcGVydHkuc2V0KCAzICk7XG4gIGFzc2VydC5vayggcENhbGxlZCA9PT0gMCwgJ3AgaXMgc3RpbGwgZGVmZXJyZWQsIHNob3VsZCBub3QgY2FsbCBsaXN0ZW5lcnMnICk7XG4gIHByb3BlcnR5LnJhbmdlUHJvcGVydHkuc2V0KCBuZXcgUmFuZ2UoIDIsIDMgKSApO1xuICBhc3NlcnQub2soIHBSYW5nZUNhbGxlZCA9PT0gMCwgJ3AucmFuZ2VQcm9wZXJ0eSBpcyBzdGlsbCBkZWZlcnJlZCwgc2hvdWxkIG5vdCBjYWxsIGxpc3RlbmVycycgKTtcbiAgY29uc3Qgbm90aWZ5UExpc3RlbmVycyA9IHByb3BlcnR5LnNldERlZmVycmVkKCBmYWxzZSApO1xuXG5cbiAgaWYgKCB3aW5kb3cuYXNzZXJ0ICkge1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICAgIG5vdGlmeVBMaXN0ZW5lcnMgJiYgbm90aWZ5UExpc3RlbmVycygpO1xuICAgIH0sICdyYW5nZVByb3BlcnR5IGlzIG5vdCB5ZXQgdW5kZWZlcnJlZCBhbmQgc28gaGFzIHRoZSB3cm9uZyB2YWx1ZScgKTtcblxuICAgIHByb3BlcnR5WyAnbm90aWZ5aW5nJyBdID0gZmFsc2U7IC8vIHNpbmNlIHRoZSBhYm92ZSB0aHJldyBhbiBlcnJvciwgcmVzZXRcbiAgfVxuICBjb25zdCBub3RpZnlSYW5nZUxpc3RlbmVycyA9IHByb3BlcnR5LnJhbmdlUHJvcGVydHkuc2V0RGVmZXJyZWQoIGZhbHNlICk7XG4gIG5vdGlmeVBMaXN0ZW5lcnMgJiYgbm90aWZ5UExpc3RlbmVycygpO1xuICBhc3NlcnQub2soIHBDYWxsZWQgPT09IDEsICdwIGxpc3RlbmVycyBzaG91bGQgaGF2ZSBiZWVuIGNhbGxlZCcgKTtcbiAgbm90aWZ5UmFuZ2VMaXN0ZW5lcnMgJiYgbm90aWZ5UmFuZ2VMaXN0ZW5lcnMoKTtcbiAgYXNzZXJ0Lm9rKCBwUmFuZ2VDYWxsZWQgPT09IDEsICdwLnJhbmdlUHJvcGVydHkgaXMgc3RpbGwgZGVmZXJyZWQsIHNob3VsZCBub3QgY2FsbCBsaXN0ZW5lcnMnICk7XG5cbiAgcHJvcGVydHkuc2V0VmFsdWVBbmRSYW5nZSggLTEwMCwgbmV3IFJhbmdlKCAtMTAxLCAtOTkgKSApO1xuICBhc3NlcnQub2soIHBDYWxsZWQgPT09IDIsICdwIGxpc3RlbmVycyBzaG91bGQgaGF2ZSBiZWVuIGNhbGxlZCBhZ2FpbicgKTtcbiAgYXNzZXJ0Lm9rKCBwUmFuZ2VDYWxsZWQgPT09IDIsICdwLnJhbmdlUHJvcGVydHkgaXMgc3RpbGwgZGVmZXJyZWQsIHNob3VsZCBub3QgY2FsbCBsaXN0ZW5lcnMgYWdhaW4nICk7XG5cbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcbiAgcHJvcGVydHkudmFsdWUgPSA0O1xuICBhc3NlcnQub2soIHByb3BlcnR5LnJhbmdlUHJvcGVydHkudmFsdWUgPT09IERFRkFVTFRfUkFOR0UsICdyYW5nZVByb3BlcnR5IHNob3VsZCBoYXZlIGJlZW4gY3JlYXRlZCcgKTtcbiAgcHJvcGVydHkucmFuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5ldyBSYW5nZSggMCwgNCApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBwcm9wZXJ0eS52YWx1ZSA9IDU7XG4gIH0sICdjdXJyZW50IHZhbHVlIG91dHNpZGUgb2YgcmFuZ2UnICk7XG59ICk7XG5RVW5pdC50ZXN0KCAnVGVzdCBOdW1iZXJQcm9wZXJ0eSBwaGV0LWlvIG9wdGlvbnMnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IHRhbmRlbSA9IFRhbmRlbS5ST09UX1RFU1Q7XG4gIGxldCBudW1iZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDIwICksXG4gICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyUHJvcGVydHknICksXG4gICAgcmFuZ2VQcm9wZXJ0eU9wdGlvbnM6IHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmFuZ2VQcm9wZXJ0eScgKSB9XG4gIH0gKTtcblxuICBhc3NlcnQub2soIG51bWJlclByb3BlcnR5LnJhbmdlUHJvcGVydHkuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3JhbmdlUHJvcGVydHkgaW5zdHJ1bWVudGVkJyApO1xuICBhc3NlcnQub2soIG51bWJlclByb3BlcnR5LnJhbmdlUHJvcGVydHkudGFuZGVtLm5hbWUgPT09ICdyYW5nZVByb3BlcnR5JywgJ3JhbmdlUHJvcGVydHkgaW5zdHJ1bWVudGVkJyApO1xuXG4gIG51bWJlclByb3BlcnR5LmRpc3Bvc2UoKTtcblxuICBudW1iZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgIHJhbmdlOiBERUZBVUxUX1JBTkdFXG4gIH0gKTtcbiAgYXNzZXJ0Lm9rKCAhbnVtYmVyUHJvcGVydHkucmFuZ2VQcm9wZXJ0eS5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCAnbnVsbCByYW5nZXMgZG8gbm90IGdldCBpbnN0cnVtZW50ZWQgcmFuZ2VQcm9wZXJ0eScgKTtcblxuICB3aW5kb3cuYXNzZXJ0ICYmIFRhbmRlbS5WQUxJREFUSU9OICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBudW1iZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMjAgKSxcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251bWJlclByb3BlcnR5MicgKSxcbiAgICAgIHJhbmdlUHJvcGVydHlPcHRpb25zOiB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JhbmdlUHJvcGVydHlmZHNhJyApIH1cbiAgICB9ICk7XG4gIH0sICdjYW5ub3QgaW5zdHJ1bWVudCBkZWZhdWx0IHJhbmdlUHJvcGVydHkgd2l0aCB0YW5kZW0gb3RoZXIgdGhhbiBcInJhbmdlUHJvcGVydHlcIicgKTtcbiAgbnVtYmVyUHJvcGVydHkuZGlzcG9zZSgpO1xufSApOyJdLCJuYW1lcyI6WyJSYW5nZSIsIlRhbmRlbSIsIk51bWJlclByb3BlcnR5IiwiREVGQVVMVF9SQU5HRSIsIlByb3BlcnR5IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siLCJwcm9wZXJ0eSIsIndpbmRvdyIsInRocm93cyIsInZhbHVlIiwibnVtYmVyVHlwZSIsInZhbGlkVmFsdWVzIiwicmFuZ2UiLCJ1bml0cyIsInJhbmdlUHJvcGVydHkiLCJyZXNldCIsIm1pbiIsImRpc3Bvc2UiLCJzZXRWYWx1ZUFuZFJhbmdlIiwibXlSYW5nZSIsInBDYWxsZWQiLCJwUmFuZ2VDYWxsZWQiLCJsYXp5TGluayIsInNldERlZmVycmVkIiwic2V0Iiwibm90aWZ5UExpc3RlbmVycyIsIm5vdGlmeVJhbmdlTGlzdGVuZXJzIiwidGFuZGVtIiwiUk9PVF9URVNUIiwibnVtYmVyUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJyYW5nZVByb3BlcnR5T3B0aW9ucyIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwibmFtZSIsIlZBTElEQVRJT04iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLGtCQUFrQkMsYUFBYSxRQUFRLHNCQUFzQjtBQUNwRSxPQUFPQyxjQUFjLGdCQUFnQjtBQUVyQ0MsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSx1QkFBdUJDLENBQUFBO0lBQ2pDQSxPQUFPQyxFQUFFLENBQUUsTUFBTTtJQUVqQixJQUFJQyxXQUFXLElBQUlSLGVBQWdCLEtBQU0sK0JBQStCO0lBRXhFLFlBQVk7SUFDWlMsT0FBT0gsTUFBTSxJQUFJQSxPQUFPSSxNQUFNLENBQUU7UUFFOUIsK0JBQStCO1FBQy9CRixXQUFXLElBQUlSLGVBQWdCO0lBQ2pDLEdBQUc7SUFDSFEsV0FBVyxJQUFJUixlQUFnQjtJQUMvQlEsU0FBU0csS0FBSyxHQUFHO0lBQ2pCRixPQUFPSCxNQUFNLElBQUlBLE9BQU9JLE1BQU0sQ0FBRTtRQUU5QiwrQkFBK0I7UUFDL0JGLFNBQVNHLEtBQUssR0FBRztJQUNuQixHQUFHO0lBRUgsYUFBYTtJQUNiSCxXQUFXLElBQUlSLGVBQWdCLEdBQUc7UUFBRVksWUFBWTtJQUFnQjtJ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