// Copyright 2019-2022, University of Colorado Boulder
/**
 * QUnit Tests for Vector2Property
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Bounds2 from './Bounds2.js';
import Vector2 from './Vector2.js';
import Vector2Property from './Vector2Property.js';
QUnit.module('Vector2Property');
QUnit.test('Vector2Property', (assert)=>{
    let vectorProperty = null;
    // constructor value
    assert.ok(()=>{
        vectorProperty = new Vector2Property(Vector2.ZERO);
    }, 'good constructor value');
    window.assert && assert.throws(()=>{
        vectorProperty = new Vector2Property(true);
    }, 'bad constructor value');
    // set value
    assert.ok(()=>{
        vectorProperty.set(new Vector2(1, 1));
    }, 'good set value');
    window.assert && assert.throws(()=>{
        vectorProperty.set(5);
    }, 'bad set value');
    // validValues option
    assert.ok(()=>{
        vectorProperty = new Vector2Property(Vector2.ZERO, {
            validValues: [
                Vector2.ZERO,
                new Vector2(1, 1)
            ]
        });
    }, 'good validValues');
    window.assert && assert.throws(()=>{
        vectorProperty = new Vector2Property(Vector2.ZERO, {
            validValues: [
                1,
                2,
                3
            ]
        });
    }, 'bad validValues');
    // isValidValue option
    assert.ok(()=>{
        vectorProperty = new Vector2Property(Vector2.ZERO, {
            isValidValue: (value)=>value.x >= 0 && value.y <= 0
        });
    }, 'good isValidValue');
    window.assert && assert.throws(()=>{
        vectorProperty = new Vector2Property(Vector2.ZERO, {
            isValidValue: (value)=>typeof value === 'string'
        });
    }, 'bad isValidValue');
    assert.ok(true, 'so we have at least 1 test in this set');
});
QUnit.test('Vector2Property.validBounds', (assert)=>{
    let vectorProperty = null;
    window.assert && assert.throws(()=>{
        vectorProperty = new Vector2Property(Vector2.ZERO, {
            validBounds: 'fdsa'
        });
    }, 'validBounds as a string');
    window.assert && assert.throws(()=>{
        vectorProperty = new Vector2Property(Vector2.ZERO, {
            validBounds: 543
        });
    }, 'validBounds as a string');
    vectorProperty = new Vector2Property(Vector2.ZERO, {
        validBounds: null
    });
    vectorProperty = new Vector2Property(Vector2.ZERO, {
        validBounds: Bounds2.EVERYTHING
    });
    const myBounds = new Bounds2(1, 1, 2, 2);
    window.assert && assert.throws(()=>{
        vectorProperty = new Vector2Property(Vector2.ZERO, {
            validBounds: myBounds
        });
    }, 'starting value outside of validBounds');
    vectorProperty = new Vector2Property(new Vector2(1, 2), {
        validBounds: myBounds
    });
    assert.ok(vectorProperty.validBounds === myBounds, 'same Bounds2 reference');
    vectorProperty.value = new Vector2(1, 1);
    vectorProperty.value = new Vector2(1.5, 1.5);
    vectorProperty.value = new Vector2(2, 2);
    window.assert && assert.throws(()=>{
        vectorProperty.value = new Vector2(10, 10);
    }, 'value outside of validBounds');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHlUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCBUZXN0cyBmb3IgVmVjdG9yMlByb3BlcnR5XG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuL0JvdW5kczIuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi9WZWN0b3IyUHJvcGVydHkuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdWZWN0b3IyUHJvcGVydHknICk7XG5RVW5pdC50ZXN0KCAnVmVjdG9yMlByb3BlcnR5JywgYXNzZXJ0ID0+IHtcblxuICBsZXQgdmVjdG9yUHJvcGVydHkgPSBudWxsO1xuXG4gIC8vIGNvbnN0cnVjdG9yIHZhbHVlXG4gIGFzc2VydC5vayggKCkgPT4ge1xuICAgIHZlY3RvclByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPICk7XG4gIH0sICdnb29kIGNvbnN0cnVjdG9yIHZhbHVlJyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICB2ZWN0b3JQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIHRydWUgKTtcbiAgfSwgJ2JhZCBjb25zdHJ1Y3RvciB2YWx1ZScgKTtcblxuICAvLyBzZXQgdmFsdWVcbiAgYXNzZXJ0Lm9rKCAoKSA9PiB7XG4gICAgdmVjdG9yUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggMSwgMSApICk7XG4gIH0sICdnb29kIHNldCB2YWx1ZScgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgdmVjdG9yUHJvcGVydHkuc2V0KCA1ICk7XG4gIH0sICdiYWQgc2V0IHZhbHVlJyApO1xuXG4gIC8vIHZhbGlkVmFsdWVzIG9wdGlvblxuICBhc3NlcnQub2soICgpID0+IHtcbiAgICB2ZWN0b3JQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xuICAgICAgdmFsaWRWYWx1ZXM6IFsgVmVjdG9yMi5aRVJPLCBuZXcgVmVjdG9yMiggMSwgMSApIF1cbiAgICB9ICk7XG4gIH0sICdnb29kIHZhbGlkVmFsdWVzJyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICB2ZWN0b3JQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xuICAgICAgdmFsaWRWYWx1ZXM6IFsgMSwgMiwgMyBdXG4gICAgfSApO1xuICB9LCAnYmFkIHZhbGlkVmFsdWVzJyApO1xuXG4gIC8vIGlzVmFsaWRWYWx1ZSBvcHRpb25cbiAgYXNzZXJ0Lm9rKCAoKSA9PiB7XG4gICAgdmVjdG9yUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcbiAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZS54ID49IDAgJiYgdmFsdWUueSA8PSAwIClcbiAgICB9ICk7XG4gIH0sICdnb29kIGlzVmFsaWRWYWx1ZScgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgdmVjdG9yUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcbiAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJ1xuICAgIH0gKTtcbiAgfSwgJ2JhZCBpc1ZhbGlkVmFsdWUnICk7XG5cbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdWZWN0b3IyUHJvcGVydHkudmFsaWRCb3VuZHMnLCBhc3NlcnQgPT4ge1xuICBsZXQgdmVjdG9yUHJvcGVydHkgPSBudWxsO1xuXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHZlY3RvclByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XG4gICAgICB2YWxpZEJvdW5kczogJ2Zkc2EnXG4gICAgfSApO1xuICB9LCAndmFsaWRCb3VuZHMgYXMgYSBzdHJpbmcnICk7XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgdmVjdG9yUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcbiAgICAgIHZhbGlkQm91bmRzOiA1NDNcbiAgICB9ICk7XG4gIH0sICd2YWxpZEJvdW5kcyBhcyBhIHN0cmluZycgKTtcblxuICB2ZWN0b3JQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xuICAgIHZhbGlkQm91bmRzOiBudWxsXG4gIH0gKTtcblxuICB2ZWN0b3JQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xuICAgIHZhbGlkQm91bmRzOiBCb3VuZHMyLkVWRVJZVEhJTkdcbiAgfSApO1xuXG4gIGNvbnN0IG15Qm91bmRzID0gbmV3IEJvdW5kczIoIDEsIDEsIDIsIDIgKTtcblxuXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHZlY3RvclByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XG4gICAgICB2YWxpZEJvdW5kczogbXlCb3VuZHNcbiAgICB9ICk7XG4gIH0sICdzdGFydGluZyB2YWx1ZSBvdXRzaWRlIG9mIHZhbGlkQm91bmRzJyApO1xuXG4gIHZlY3RvclByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDEsIDIgKSwge1xuICAgIHZhbGlkQm91bmRzOiBteUJvdW5kc1xuICB9ICk7XG4gIGFzc2VydC5vayggdmVjdG9yUHJvcGVydHkudmFsaWRCb3VuZHMgPT09IG15Qm91bmRzLCAnc2FtZSBCb3VuZHMyIHJlZmVyZW5jZScgKTtcblxuICB2ZWN0b3JQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKCAxLCAxICk7XG4gIHZlY3RvclByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIDEuNSwgMS41ICk7XG4gIHZlY3RvclByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIDIsIDIgKTtcblxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICB2ZWN0b3JQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKCAxMCwgMTAgKTtcbiAgfSwgJ3ZhbHVlIG91dHNpZGUgb2YgdmFsaWRCb3VuZHMnICk7XG59ICk7Il0sIm5hbWVzIjpbIkJvdW5kczIiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwidmVjdG9yUHJvcGVydHkiLCJvayIsIlpFUk8iLCJ3aW5kb3ciLCJ0aHJvd3MiLCJzZXQiLCJ2YWxpZFZhbHVlcyIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwieCIsInkiLCJ2YWxpZEJvdW5kcyIsIkVWRVJZVEhJTkciLCJteUJvdW5kcyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLGVBQWU7QUFDbkMsT0FBT0MsYUFBYSxlQUFlO0FBQ25DLE9BQU9DLHFCQUFxQix1QkFBdUI7QUFFbkRDLE1BQU1DLE1BQU0sQ0FBRTtBQUNkRCxNQUFNRSxJQUFJLENBQUUsbUJBQW1CQyxDQUFBQTtJQUU3QixJQUFJQyxpQkFBaUI7SUFFckIsb0JBQW9CO0lBQ3BCRCxPQUFPRSxFQUFFLENBQUU7UUFDVEQsaUJBQWlCLElBQUlMLGdCQUFpQkQsUUFBUVEsSUFBSTtJQUNwRCxHQUFHO0lBQ0hDLE9BQU9KLE1BQU0sSUFBSUEsT0FBT0ssTUFBTSxDQUFFO1FBQzlCSixpQkFBaUIsSUFBSUwsZ0JBQWlCO0lBQ3hDLEdBQUc7SUFFSCxZQUFZO0lBQ1pJLE9BQU9FLEVBQUUsQ0FBRTtRQUNURCxlQUFlSyxHQUFHLENBQUUsSUFBSVgsUUFBUyxHQUFHO0lBQ3RDLEdBQUc7SUFDSFMsT0FBT0osTUFBTSxJQUFJQSxPQUFPSyxNQUFNLENBQUU7UUFDOUJKLGVBQWVLLEdBQUcsQ0FBRTtJQUN0QixHQUFHO0lBRUgscUJBQXFCO0lBQ3JCTixPQUFPRSxFQUFFLENBQUU7UUFDVEQsaUJBQWlCLElBQUlMLGdCQUFpQkQsUUFBUVEsSUFBSSxFQUFFO1lBQ2xESSxhQUFhO2dCQUFFWixRQUFRUSxJQUFJO2dCQUFFLElBQUlSLFFBQVMsR0FBRzthQUFLO1FBQ3BEO0lBQ0YsR0FBRztJQUNIUyxPQUFPSixNQUFNLElBQUlBLE9BQU9LLE1BQU0sQ0FBRTtRQUM5QkosaUJBQWlCLElBQUlMLGdCQUFpQkQsUUFBUVEsSUFBSSxFQUFFO1lBQ2xESSxhQUFhO2dCQUFFO2dCQUFHO2dCQUFHO2FBQUc7UUFDMUI7SUFDRixHQUFHO0lBRUgsc0JBQXNCO0lBQ3RCUCxPQUFPRSxFQUFFLENBQUU7UUFDVEQsaUJBQWlCLElBQUlMLGdCQUFpQkQsUUFBUVEsSUFBSSxFQUFFO1lBQ2xESyxjQUFjQyxDQUFBQSxRQUFXQSxNQUFNQyxDQUFDLElBQUksS0FBS0QsTUFBTUUsQ0FBQyxJQUFJO1FBQ3REO0lBQ0YsR0FBRztJQUNIUCxPQUFPSixNQUFNLElBQUlBLE9BQU9LLE1BQU0sQ0FBRTtRQUM5QkosaUJBQWlCLElBQUlMLGdCQUFpQkQsUUFBUVEsSUFBSSxFQUFFO1lBQ2xESyxjQUFjQyxDQUFBQSxRQUFTLE9BQU9BLFVBQVU7UUFDMUM7SUFDRixHQUFHO0lBRUhULE9BQU9FLEVBQUUsQ0FBRSxNQUFNO0FBQ25CO0FBRUFMLE1BQU1FLElBQUksQ0FBRSwrQkFBK0JDLENBQUFBO0lBQ3pDLElBQUlDLGlCQUFpQjtJQUVyQkcsT0FBT0osTUFBTSxJQUFJQSxPQUFPSyxNQUFNLENBQUU7UUFDOUJKLGlCQUFpQixJQUFJTCxnQkFBaUJELFFBQVFRLElBQUksRUFBRTtZQUNsRFMsYUFBYTtRQUNmO0lBQ0YsR0FBRztJQUVIUixPQUFPSixNQUFNLElBQUlBLE9BQU9LLE1BQU0sQ0FBRTtRQUM5QkosaUJBQWlCLElBQUlMLGdCQUFpQkQsUUFBUVEsSUFBSSxFQUFFO1lBQ2xEUyxhQUFhO1FBQ2Y7SUFDRixHQUFHO0lBRUhYLGlCQUFpQixJQUFJTCxnQkFBaUJELFFBQVFRLElBQUksRUFBRTtRQUNsRFMsYUFBYTtJQUNmO0lBRUFYLGlCQUFpQixJQUFJTCxnQkFBaUJELFFBQVFRLElBQUksRUFBRTtRQUNsRFMsYUFBYWxCLFFBQVFtQixVQUFVO0lBQ2pDO0lBRUEsTUFBTUMsV0FBVyxJQUFJcEIsUUFBUyxHQUFHLEdBQUcsR0FBRztJQUd2Q1UsT0FBT0osTUFBTSxJQUFJQSxPQUFPSyxNQUFNLENBQUU7UUFDOUJKLGlCQUFpQixJQUFJTCxnQkFBaUJELFFBQVFRLElBQUksRUFBRTtZQUNsRFMsYUFBYUU7UUFDZjtJQUNGLEdBQUc7SUFFSGIsaUJBQWlCLElBQUlMLGdCQUFpQixJQUFJRCxRQUFTLEdBQUcsSUFBSztRQUN6RGlCLGFBQWFFO0lBQ2Y7SUFDQWQsT0FBT0UsRUFBRSxDQUFFRCxlQUFlVyxXQUFXLEtBQUtFLFVBQVU7SUFFcERiLGVBQWVRLEtBQUssR0FBRyxJQUFJZCxRQUFTLEdBQUc7SUFDdkNNLGVBQWVRLEtBQUssR0FBRyxJQUFJZCxRQUFTLEtBQUs7SUFDekNNLGVBQWVRLEtBQUssR0FBRyxJQUFJZCxRQUFTLEdBQUc7SUFFdkNTLE9BQU9KLE1BQU0sSUFBSUEsT0FBT0ssTUFBTSxDQUFFO1FBQzlCSixlQUFlUSxLQUFLLEdBQUcsSUFBSWQsUUFBUyxJQUFJO0lBQzFDLEdBQUc7QUFDTCJ9