// Copyright 2020-2021, University of Colorado Boulder
/**
 * QUnit tests for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Property from '../../axon/js/Property.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import Range from '../../dot/js/Range.js';
import Tandem from '../../tandem/js/Tandem.js';
import HSlider from './HSlider.js';
QUnit.module('Slider');
QUnit.test('Node.enabledProperty in Slider', (assert)=>{
    let slider = new HSlider(new Property(0), new Range(0, 10), {
        tandem: Tandem.ROOT_TEST.createTandem('mySlider')
    });
    testEnabledNode(assert, slider, 'For Slider');
    slider.dispose();
    const myEnabledProperty = new BooleanProperty(true, {
        tandem: Tandem.ROOT_TEST.createTandem('myEnabledProperty')
    });
    slider = new HSlider(new Property(0), new Range(0, 10), {
        tandem: Tandem.ROOT_TEST.createTandem('mySlider'),
        enabledProperty: myEnabledProperty
    });
    testEnabledNode(assert, slider, 'For Slider');
    slider.dispose();
    myEnabledProperty.dispose();
});
/**
 * Test basic functionality for an object that mixes in EnabledComponent
 * @param {Object} assert - from QUnit
 * @param {Object} enabledNode - mixed in with EnabledComponent
 * @param {string} message - to tack onto assert messages
 */ function testEnabledNode(assert, enabledNode, message) {
    assert.ok(enabledNode.enabledProperty instanceof Property || enabledNode.enabledProperty instanceof TinyProperty, `${message}: enabledProperty should exist`);
    assert.ok(enabledNode.enabledProperty.value === enabledNode.enabled, `${message}: test getter`);
    enabledNode.enabled = false;
    assert.ok(enabledNode.enabled === false, `${message}: test setter`);
    assert.ok(enabledNode.enabledProperty.value === enabledNode.enabled, `${message}: test getter after setting`);
    assert.ok(enabledNode.enabledProperty.value === false, `${message}: test getter after setting`);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9TbGlkZXJUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCB0ZXN0cyBmb3IgU2xpZGVyXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW55UHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi9IU2xpZGVyLmpzJztcblxuUVVuaXQubW9kdWxlKCAnU2xpZGVyJyApO1xuXG5RVW5pdC50ZXN0KCAnTm9kZS5lbmFibGVkUHJvcGVydHkgaW4gU2xpZGVyJywgYXNzZXJ0ID0+IHtcbiAgbGV0IHNsaWRlciA9IG5ldyBIU2xpZGVyKCBuZXcgUHJvcGVydHkoIDAgKSwgbmV3IFJhbmdlKCAwLCAxMCApLCB7XG4gICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ215U2xpZGVyJyApXG4gIH0gKTtcbiAgdGVzdEVuYWJsZWROb2RlKCBhc3NlcnQsIHNsaWRlciwgJ0ZvciBTbGlkZXInICk7XG4gIHNsaWRlci5kaXNwb3NlKCk7XG5cbiAgY29uc3QgbXlFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7IHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdteUVuYWJsZWRQcm9wZXJ0eScgKSB9ICk7XG4gIHNsaWRlciA9IG5ldyBIU2xpZGVyKCBuZXcgUHJvcGVydHkoIDAgKSwgbmV3IFJhbmdlKCAwLCAxMCApLCB7XG4gICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ215U2xpZGVyJyApLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogbXlFbmFibGVkUHJvcGVydHlcbiAgfSApO1xuICB0ZXN0RW5hYmxlZE5vZGUoIGFzc2VydCwgc2xpZGVyLCAnRm9yIFNsaWRlcicgKTtcbiAgc2xpZGVyLmRpc3Bvc2UoKTtcbiAgbXlFbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xufSApO1xuXG4vKipcbiAqIFRlc3QgYmFzaWMgZnVuY3Rpb25hbGl0eSBmb3IgYW4gb2JqZWN0IHRoYXQgbWl4ZXMgaW4gRW5hYmxlZENvbXBvbmVudFxuICogQHBhcmFtIHtPYmplY3R9IGFzc2VydCAtIGZyb20gUVVuaXRcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbmFibGVkTm9kZSAtIG1peGVkIGluIHdpdGggRW5hYmxlZENvbXBvbmVudFxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSB0byB0YWNrIG9udG8gYXNzZXJ0IG1lc3NhZ2VzXG4gKi9cbmZ1bmN0aW9uIHRlc3RFbmFibGVkTm9kZSggYXNzZXJ0LCBlbmFibGVkTm9kZSwgbWVzc2FnZSApIHtcbiAgYXNzZXJ0Lm9rKCBlbmFibGVkTm9kZS5lbmFibGVkUHJvcGVydHkgaW5zdGFuY2VvZiBQcm9wZXJ0eSB8fCBlbmFibGVkTm9kZS5lbmFibGVkUHJvcGVydHkgaW5zdGFuY2VvZiBUaW55UHJvcGVydHksIGAke21lc3NhZ2V9OiBlbmFibGVkUHJvcGVydHkgc2hvdWxkIGV4aXN0YCApO1xuXG4gIGFzc2VydC5vayggZW5hYmxlZE5vZGUuZW5hYmxlZFByb3BlcnR5LnZhbHVlID09PSBlbmFibGVkTm9kZS5lbmFibGVkLCBgJHttZXNzYWdlfTogdGVzdCBnZXR0ZXJgICk7XG5cbiAgZW5hYmxlZE5vZGUuZW5hYmxlZCA9IGZhbHNlO1xuICBhc3NlcnQub2soIGVuYWJsZWROb2RlLmVuYWJsZWQgPT09IGZhbHNlLCBgJHttZXNzYWdlfTogdGVzdCBzZXR0ZXJgICk7XG4gIGFzc2VydC5vayggZW5hYmxlZE5vZGUuZW5hYmxlZFByb3BlcnR5LnZhbHVlID09PSBlbmFibGVkTm9kZS5lbmFibGVkLCBgJHttZXNzYWdlfTogdGVzdCBnZXR0ZXIgYWZ0ZXIgc2V0dGluZ2AgKTtcbiAgYXNzZXJ0Lm9rKCBlbmFibGVkTm9kZS5lbmFibGVkUHJvcGVydHkudmFsdWUgPT09IGZhbHNlLCBgJHttZXNzYWdlfTogdGVzdCBnZXR0ZXIgYWZ0ZXIgc2V0dGluZ2AgKTtcbn0iXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiUHJvcGVydHkiLCJUaW55UHJvcGVydHkiLCJSYW5nZSIsIlRhbmRlbSIsIkhTbGlkZXIiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJzbGlkZXIiLCJ0YW5kZW0iLCJST09UX1RFU1QiLCJjcmVhdGVUYW5kZW0iLCJ0ZXN0RW5hYmxlZE5vZGUiLCJkaXNwb3NlIiwibXlFbmFibGVkUHJvcGVydHkiLCJlbmFibGVkUHJvcGVydHkiLCJlbmFibGVkTm9kZSIsIm1lc3NhZ2UiLCJvayIsInZhbHVlIiwiZW5hYmxlZCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0MsY0FBYyw0QkFBNEI7QUFDakQsT0FBT0Msa0JBQWtCLGdDQUFnQztBQUN6RCxPQUFPQyxXQUFXLHdCQUF3QjtBQUMxQyxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQyxhQUFhLGVBQWU7QUFFbkNDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkRCxNQUFNRSxJQUFJLENBQUUsa0NBQWtDQyxDQUFBQTtJQUM1QyxJQUFJQyxTQUFTLElBQUlMLFFBQVMsSUFBSUosU0FBVSxJQUFLLElBQUlFLE1BQU8sR0FBRyxLQUFNO1FBQy9EUSxRQUFRUCxPQUFPUSxTQUFTLENBQUNDLFlBQVksQ0FBRTtJQUN6QztJQUNBQyxnQkFBaUJMLFFBQVFDLFFBQVE7SUFDakNBLE9BQU9LLE9BQU87SUFFZCxNQUFNQyxvQkFBb0IsSUFBSWhCLGdCQUFpQixNQUFNO1FBQUVXLFFBQVFQLE9BQU9RLFNBQVMsQ0FBQ0MsWUFBWSxDQUFFO0lBQXNCO0lBQ3BISCxTQUFTLElBQUlMLFFBQVMsSUFBSUosU0FBVSxJQUFLLElBQUlFLE1BQU8sR0FBRyxLQUFNO1FBQzNEUSxRQUFRUCxPQUFPUSxTQUFTLENBQUNDLFlBQVksQ0FBRTtRQUN2Q0ksaUJBQWlCRDtJQUNuQjtJQUNBRixnQkFBaUJMLFFBQVFDLFFBQVE7SUFDakNBLE9BQU9LLE9BQU87SUFDZEMsa0JBQWtCRCxPQUFPO0FBQzNCO0FBRUE7Ozs7O0NBS0MsR0FDRCxTQUFTRCxnQkFBaUJMLE1BQU0sRUFBRVMsV0FBVyxFQUFFQyxPQUFPO0lBQ3BEVixPQUFPVyxFQUFFLENBQUVGLFlBQVlELGVBQWUsWUFBWWhCLFlBQVlpQixZQUFZRCxlQUFlLFlBQVlmLGNBQWMsR0FBR2lCLFFBQVEsOEJBQThCLENBQUM7SUFFN0pWLE9BQU9XLEVBQUUsQ0FBRUYsWUFBWUQsZUFBZSxDQUFDSSxLQUFLLEtBQUtILFlBQVlJLE9BQU8sRUFBRSxHQUFHSCxRQUFRLGFBQWEsQ0FBQztJQUUvRkQsWUFBWUksT0FBTyxHQUFHO0lBQ3RCYixPQUFPVyxFQUFFLENBQUVGLFlBQVlJLE9BQU8sS0FBSyxPQUFPLEdBQUdILFFBQVEsYUFBYSxDQUFDO0lBQ25FVixPQUFPVyxFQUFFLENBQUVGLFlBQVlELGVBQWUsQ0FBQ0ksS0FBSyxLQUFLSCxZQUFZSSxPQUFPLEVBQUUsR0FBR0gsUUFBUSwyQkFBMkIsQ0FBQztJQUM3R1YsT0FBT1csRUFBRSxDQUFFRixZQUFZRCxlQUFlLENBQUNJLEtBQUssS0FBSyxPQUFPLEdBQUdGLFFBQVEsMkJBQTJCLENBQUM7QUFDakcifQ==