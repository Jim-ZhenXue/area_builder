// Copyright 2013-2022, University of Colorado Boulder
/**
 * Miscellaneous tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ QUnit.module('Miscellaneous');
const includeBleedingEdgeCanvasTests = false;
QUnit.test('ES5 Object.defineProperty get/set', (assert)=>{
    const ob = {
        _key: 5
    };
    Object.defineProperty(ob, 'key', {
        enumerable: true,
        configurable: true,
        get: function() {
            return this._key;
        },
        set: function(val) {
            this._key = val;
        }
    });
    ob.key += 1;
    assert.equal(ob._key, 6, 'incremented object value');
});
// QUnit.test( 'Canvas WebGL Context and Features', function(assert) {
//   var canvas = document.createElement( 'canvas' );
//   var context = canvas.getContext( "webgl" ) || canvas.getContext( "experimental-webgl" );
//   assert.ok( context, 'context' );
// } );
if (includeBleedingEdgeCanvasTests) {
    // v5 canvas additions
    QUnit.module('Bleeding Edge Canvas Support');
    QUnit.test('Canvas 2D v5 Features', (assert)=>{
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const neededMethods = [
            'addHitRegion',
            'ellipse',
            'resetClip',
            'resetTransform'
        ];
        _.each(neededMethods, (method)=>{
            assert.ok(context[method] !== undefined, `context.${method}`);
        });
    });
    QUnit.test('Path object support', (assert)=>{
        new Path(null); // eslint-disable-line no-new, no-undef
    });
    QUnit.test('Text width measurement in canvas', (assert)=>{
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const metrics = context.measureText('Hello World');
        _.each([
            'actualBoundingBoxLeft',
            'actualBoundingBoxRight',
            'actualBoundingBoxAscent',
            'actualBoundingBoxDescent'
        ], (method)=>{
            assert.ok(metrics[method] !== undefined, `metrics.${method}`);
        });
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdGVzdHMvTWlzY2VsbGFuZW91c1Rlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1pc2NlbGxhbmVvdXMgdGVzdHNcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cblFVbml0Lm1vZHVsZSggJ01pc2NlbGxhbmVvdXMnICk7XG5cbmNvbnN0IGluY2x1ZGVCbGVlZGluZ0VkZ2VDYW52YXNUZXN0cyA9IGZhbHNlO1xuXG5RVW5pdC50ZXN0KCAnRVM1IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBnZXQvc2V0JywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgb2IgPSB7IF9rZXk6IDUgfTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBvYiwgJ2tleScsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fa2V5OyB9LFxuICAgIHNldDogZnVuY3Rpb24oIHZhbCApIHsgdGhpcy5fa2V5ID0gdmFsOyB9XG4gIH0gKTtcbiAgb2Iua2V5ICs9IDE7XG4gIGFzc2VydC5lcXVhbCggb2IuX2tleSwgNiwgJ2luY3JlbWVudGVkIG9iamVjdCB2YWx1ZScgKTtcbn0gKTtcblxuLy8gUVVuaXQudGVzdCggJ0NhbnZhcyBXZWJHTCBDb250ZXh0IGFuZCBGZWF0dXJlcycsIGZ1bmN0aW9uKGFzc2VydCkge1xuLy8gICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbi8vICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggXCJ3ZWJnbFwiICkgfHwgY2FudmFzLmdldENvbnRleHQoIFwiZXhwZXJpbWVudGFsLXdlYmdsXCIgKTtcbi8vICAgYXNzZXJ0Lm9rKCBjb250ZXh0LCAnY29udGV4dCcgKTtcbi8vIH0gKTtcblxuaWYgKCBpbmNsdWRlQmxlZWRpbmdFZGdlQ2FudmFzVGVzdHMgKSB7XG4gIC8vIHY1IGNhbnZhcyBhZGRpdGlvbnNcbiAgUVVuaXQubW9kdWxlKCAnQmxlZWRpbmcgRWRnZSBDYW52YXMgU3VwcG9ydCcgKTtcblxuICBRVW5pdC50ZXN0KCAnQ2FudmFzIDJEIHY1IEZlYXR1cmVzJywgYXNzZXJ0ID0+IHtcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuXG4gICAgY29uc3QgbmVlZGVkTWV0aG9kcyA9IFtcbiAgICAgICdhZGRIaXRSZWdpb24nLFxuICAgICAgJ2VsbGlwc2UnLFxuICAgICAgJ3Jlc2V0Q2xpcCcsXG4gICAgICAncmVzZXRUcmFuc2Zvcm0nXG4gICAgXTtcbiAgICBfLmVhY2goIG5lZWRlZE1ldGhvZHMsIG1ldGhvZCA9PiB7XG4gICAgICBhc3NlcnQub2soIGNvbnRleHRbIG1ldGhvZCBdICE9PSB1bmRlZmluZWQsIGBjb250ZXh0LiR7bWV0aG9kfWAgKTtcbiAgICB9ICk7XG4gIH0gKTtcblxuICBRVW5pdC50ZXN0KCAnUGF0aCBvYmplY3Qgc3VwcG9ydCcsIGFzc2VydCA9PiB7XG4gICAgbmV3IFBhdGgoIG51bGwgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXcsIG5vLXVuZGVmXG4gIH0gKTtcblxuICBRVW5pdC50ZXN0KCAnVGV4dCB3aWR0aCBtZWFzdXJlbWVudCBpbiBjYW52YXMnLCBhc3NlcnQgPT4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG4gICAgY29uc3QgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQoICdIZWxsbyBXb3JsZCcgKTtcbiAgICBfLmVhY2goIFsgJ2FjdHVhbEJvdW5kaW5nQm94TGVmdCcsICdhY3R1YWxCb3VuZGluZ0JveFJpZ2h0JywgJ2FjdHVhbEJvdW5kaW5nQm94QXNjZW50JywgJ2FjdHVhbEJvdW5kaW5nQm94RGVzY2VudCcgXSwgbWV0aG9kID0+IHtcbiAgICAgIGFzc2VydC5vayggbWV0cmljc1sgbWV0aG9kIF0gIT09IHVuZGVmaW5lZCwgYG1ldHJpY3MuJHttZXRob2R9YCApO1xuICAgIH0gKTtcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJRVW5pdCIsIm1vZHVsZSIsImluY2x1ZGVCbGVlZGluZ0VkZ2VDYW52YXNUZXN0cyIsInRlc3QiLCJhc3NlcnQiLCJvYiIsIl9rZXkiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJnZXQiLCJzZXQiLCJ2YWwiLCJrZXkiLCJlcXVhbCIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwibmVlZGVkTWV0aG9kcyIsIl8iLCJlYWNoIiwibWV0aG9kIiwib2siLCJ1bmRlZmluZWQiLCJQYXRoIiwibWV0cmljcyIsIm1lYXN1cmVUZXh0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVEQSxNQUFNQyxNQUFNLENBQUU7QUFFZCxNQUFNQyxpQ0FBaUM7QUFFdkNGLE1BQU1HLElBQUksQ0FBRSxxQ0FBcUNDLENBQUFBO0lBQy9DLE1BQU1DLEtBQUs7UUFBRUMsTUFBTTtJQUFFO0lBQ3JCQyxPQUFPQyxjQUFjLENBQUVILElBQUksT0FBTztRQUNoQ0ksWUFBWTtRQUNaQyxjQUFjO1FBQ2RDLEtBQUs7WUFBYSxPQUFPLElBQUksQ0FBQ0wsSUFBSTtRQUFFO1FBQ3BDTSxLQUFLLFNBQVVDLEdBQUc7WUFBSyxJQUFJLENBQUNQLElBQUksR0FBR087UUFBSztJQUMxQztJQUNBUixHQUFHUyxHQUFHLElBQUk7SUFDVlYsT0FBT1csS0FBSyxDQUFFVixHQUFHQyxJQUFJLEVBQUUsR0FBRztBQUM1QjtBQUVBLHNFQUFzRTtBQUN0RSxxREFBcUQ7QUFDckQsNkZBQTZGO0FBQzdGLHFDQUFxQztBQUNyQyxPQUFPO0FBRVAsSUFBS0osZ0NBQWlDO0lBQ3BDLHNCQUFzQjtJQUN0QkYsTUFBTUMsTUFBTSxDQUFFO0lBRWRELE1BQU1HLElBQUksQ0FBRSx5QkFBeUJDLENBQUFBO1FBQ25DLE1BQU1ZLFNBQVNDLFNBQVNDLGFBQWEsQ0FBRTtRQUN2QyxNQUFNQyxVQUFVSCxPQUFPSSxVQUFVLENBQUU7UUFFbkMsTUFBTUMsZ0JBQWdCO1lBQ3BCO1lBQ0E7WUFDQTtZQUNBO1NBQ0Q7UUFDREMsRUFBRUMsSUFBSSxDQUFFRixlQUFlRyxDQUFBQTtZQUNyQnBCLE9BQU9xQixFQUFFLENBQUVOLE9BQU8sQ0FBRUssT0FBUSxLQUFLRSxXQUFXLENBQUMsUUFBUSxFQUFFRixRQUFRO1FBQ2pFO0lBQ0Y7SUFFQXhCLE1BQU1HLElBQUksQ0FBRSx1QkFBdUJDLENBQUFBO1FBQ2pDLElBQUl1QixLQUFNLE9BQVEsdUNBQXVDO0lBQzNEO0lBRUEzQixNQUFNRyxJQUFJLENBQUUsb0NBQW9DQyxDQUFBQTtRQUM5QyxNQUFNWSxTQUFTQyxTQUFTQyxhQUFhLENBQUU7UUFDdkMsTUFBTUMsVUFBVUgsT0FBT0ksVUFBVSxDQUFFO1FBQ25DLE1BQU1RLFVBQVVULFFBQVFVLFdBQVcsQ0FBRTtRQUNyQ1AsRUFBRUMsSUFBSSxDQUFFO1lBQUU7WUFBeUI7WUFBMEI7WUFBMkI7U0FBNEIsRUFBRUMsQ0FBQUE7WUFDcEhwQixPQUFPcUIsRUFBRSxDQUFFRyxPQUFPLENBQUVKLE9BQVEsS0FBS0UsV0FBVyxDQUFDLFFBQVEsRUFBRUYsUUFBUTtRQUNqRTtJQUNGO0FBQ0YifQ==