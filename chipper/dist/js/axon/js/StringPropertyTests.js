// Copyright 2017-2023, University of Colorado Boulder
/**
 * QUnit tests for StringProperty
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import StringProperty from './StringProperty.js';
QUnit.module('StringProperty');
QUnit.test('Test StringProperty', (assert)=>{
    let p = null;
    // valueType
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL setting valueType option for testing
        p = new StringProperty('foo', {
            valueType: 'string'
        });
    }, 'valueType cannot be set by client');
    p = new StringProperty('foo');
    p.value = 'bar';
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL setting wrong value for testing
        p.value = 0;
    }, 'set value fails valueType test');
    // validValues
    window.assert && assert.throws(()=>{
        p = new StringProperty('bad', {
            validValues: [
                'foo',
                'bar'
            ]
        });
    }, 'initial value is not a member of validValues');
    window.assert && assert.throws(()=>{
        p = new StringProperty('foo', {
            // @ts-expect-error INTENTIONAL incorrect valueType for testing
            validValues: [
                'foo',
                'bar',
                0
            ]
        });
    }, 'member of validValues has incorrect valueType');
    window.assert && assert.throws(()=>{
        p = new StringProperty('foo', {
            validValues: [
                'foo',
                'bar'
            ],
            isValidValue: function(value) {
                return value.startsWith('f');
            }
        });
    }, 'member of validValues fails isValidValue test');
    p = new StringProperty('foo', {
        validValues: [
            'foo',
            'bar'
        ]
    });
    p.value = 'bar';
    window.assert && assert.throws(()=>{
        p.value = 'bad';
    }, 'set value is not a member of validValues');
    // isValidValue
    p = new StringProperty('foo', {
        isValidValue: function(value) {
            return value.startsWith('f');
        }
    });
    p.value = 'five';
    window.assert && assert.throws(()=>{
        p.value = 'bad';
    }, 'set value fails isValidValue test');
    // multiple compatible options
    p = new StringProperty('foo', {
        validValues: [
            'foo',
            'bar'
        ],
        isValidValue: function(value) {
            return value.length === 3;
        }
    });
    // multiple incompatible options
    window.assert && assert.throws(()=>{
        p = new StringProperty('foo', {
            validValues: [
                'foo',
                'bar'
            ],
            isValidValue: function(value) {
                return value.length === 4;
            }
        });
    }, 'incompatible validation options fail on initialization');
    assert.ok(true, 'so we have at least 1 test in this set');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHlUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCB0ZXN0cyBmb3IgU3RyaW5nUHJvcGVydHlcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi9TdHJpbmdQcm9wZXJ0eS5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ1N0cmluZ1Byb3BlcnR5JyApO1xuUVVuaXQudGVzdCggJ1Rlc3QgU3RyaW5nUHJvcGVydHknLCBhc3NlcnQgPT4ge1xuXG4gIGxldCBwOiBTdHJpbmdQcm9wZXJ0eSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIHZhbHVlVHlwZVxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUwgc2V0dGluZyB2YWx1ZVR5cGUgb3B0aW9uIGZvciB0ZXN0aW5nXG4gICAgcCA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggJ2ZvbycsIHsgdmFsdWVUeXBlOiAnc3RyaW5nJyB9ICk7XG4gIH0sICd2YWx1ZVR5cGUgY2Fubm90IGJlIHNldCBieSBjbGllbnQnICk7XG4gIHAgPSBuZXcgU3RyaW5nUHJvcGVydHkoICdmb28nICk7XG4gIHAudmFsdWUgPSAnYmFyJztcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMIHNldHRpbmcgd3JvbmcgdmFsdWUgZm9yIHRlc3RpbmdcbiAgICBwLnZhbHVlID0gMDtcbiAgfSwgJ3NldCB2YWx1ZSBmYWlscyB2YWx1ZVR5cGUgdGVzdCcgKTtcblxuICAvLyB2YWxpZFZhbHVlc1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBwID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnYmFkJywge1xuICAgICAgdmFsaWRWYWx1ZXM6IFsgJ2ZvbycsICdiYXInIF1cbiAgICB9ICk7XG4gIH0sICdpbml0aWFsIHZhbHVlIGlzIG5vdCBhIG1lbWJlciBvZiB2YWxpZFZhbHVlcycgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcCA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggJ2ZvbycsIHtcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTCBpbmNvcnJlY3QgdmFsdWVUeXBlIGZvciB0ZXN0aW5nXG4gICAgICB2YWxpZFZhbHVlczogWyAnZm9vJywgJ2JhcicsIDAgXVxuICAgIH0gKTtcbiAgfSwgJ21lbWJlciBvZiB2YWxpZFZhbHVlcyBoYXMgaW5jb3JyZWN0IHZhbHVlVHlwZScgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcCA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggJ2ZvbycsIHtcbiAgICAgIHZhbGlkVmFsdWVzOiBbICdmb28nLCAnYmFyJyBdLFxuICAgICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7IHJldHVybiB2YWx1ZS5zdGFydHNXaXRoKCAnZicgKTsgfVxuICAgIH0gKTtcbiAgfSwgJ21lbWJlciBvZiB2YWxpZFZhbHVlcyBmYWlscyBpc1ZhbGlkVmFsdWUgdGVzdCcgKTtcbiAgcCA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggJ2ZvbycsIHtcbiAgICB2YWxpZFZhbHVlczogWyAnZm9vJywgJ2JhcicgXVxuICB9ICk7XG4gIHAudmFsdWUgPSAnYmFyJztcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcCEudmFsdWUgPSAnYmFkJztcbiAgfSwgJ3NldCB2YWx1ZSBpcyBub3QgYSBtZW1iZXIgb2YgdmFsaWRWYWx1ZXMnICk7XG5cbiAgLy8gaXNWYWxpZFZhbHVlXG4gIHAgPSBuZXcgU3RyaW5nUHJvcGVydHkoICdmb28nLCB7XG4gICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7IHJldHVybiB2YWx1ZS5zdGFydHNXaXRoKCAnZicgKTsgfVxuICB9ICk7XG4gIHAudmFsdWUgPSAnZml2ZSc7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHAhLnZhbHVlID0gJ2JhZCc7XG4gIH0sICdzZXQgdmFsdWUgZmFpbHMgaXNWYWxpZFZhbHVlIHRlc3QnICk7XG5cbiAgLy8gbXVsdGlwbGUgY29tcGF0aWJsZSBvcHRpb25zXG4gIHAgPSBuZXcgU3RyaW5nUHJvcGVydHkoICdmb28nLCB7XG4gICAgdmFsaWRWYWx1ZXM6IFsgJ2ZvbycsICdiYXInIF0sXG4gICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7IHJldHVybiB2YWx1ZS5sZW5ndGggPT09IDM7IH1cbiAgfSApO1xuXG4gIC8vIG11bHRpcGxlIGluY29tcGF0aWJsZSBvcHRpb25zXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHAgPSBuZXcgU3RyaW5nUHJvcGVydHkoICdmb28nLCB7XG4gICAgICB2YWxpZFZhbHVlczogWyAnZm9vJywgJ2JhcicgXSxcbiAgICAgIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkgeyByZXR1cm4gdmFsdWUubGVuZ3RoID09PSA0OyB9XG4gICAgfSApO1xuICB9LCAnaW5jb21wYXRpYmxlIHZhbGlkYXRpb24gb3B0aW9ucyBmYWlsIG9uIGluaXRpYWxpemF0aW9uJyApO1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xufSApOyJdLCJuYW1lcyI6WyJTdHJpbmdQcm9wZXJ0eSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsInAiLCJ3aW5kb3ciLCJ0aHJvd3MiLCJ2YWx1ZVR5cGUiLCJ2YWx1ZSIsInZhbGlkVmFsdWVzIiwiaXNWYWxpZFZhbHVlIiwic3RhcnRzV2l0aCIsImxlbmd0aCIsIm9rIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxvQkFBb0Isc0JBQXNCO0FBRWpEQyxNQUFNQyxNQUFNLENBQUU7QUFDZEQsTUFBTUUsSUFBSSxDQUFFLHVCQUF1QkMsQ0FBQUE7SUFFakMsSUFBSUMsSUFBMkI7SUFFL0IsWUFBWTtJQUNaQyxPQUFPRixNQUFNLElBQUlBLE9BQU9HLE1BQU0sQ0FBRTtRQUU5QixvRUFBb0U7UUFDcEVGLElBQUksSUFBSUwsZUFBZ0IsT0FBTztZQUFFUSxXQUFXO1FBQVM7SUFDdkQsR0FBRztJQUNISCxJQUFJLElBQUlMLGVBQWdCO0lBQ3hCSyxFQUFFSSxLQUFLLEdBQUc7SUFDVkgsT0FBT0YsTUFBTSxJQUFJQSxPQUFPRyxNQUFNLENBQUU7UUFFOUIsK0RBQStEO1FBQy9ERixFQUFFSSxLQUFLLEdBQUc7SUFDWixHQUFHO0lBRUgsY0FBYztJQUNkSCxPQUFPRixNQUFNLElBQUlBLE9BQU9HLE1BQU0sQ0FBRTtRQUM5QkYsSUFBSSxJQUFJTCxlQUFnQixPQUFPO1lBQzdCVSxhQUFhO2dCQUFFO2dCQUFPO2FBQU87UUFDL0I7SUFDRixHQUFHO0lBQ0hKLE9BQU9GLE1BQU0sSUFBSUEsT0FBT0csTUFBTSxDQUFFO1FBQzlCRixJQUFJLElBQUlMLGVBQWdCLE9BQU87WUFFN0IsK0RBQStEO1lBQy9EVSxhQUFhO2dCQUFFO2dCQUFPO2dCQUFPO2FBQUc7UUFDbEM7SUFDRixHQUFHO0lBQ0hKLE9BQU9GLE1BQU0sSUFBSUEsT0FBT0csTUFBTSxDQUFFO1FBQzlCRixJQUFJLElBQUlMLGVBQWdCLE9BQU87WUFDN0JVLGFBQWE7Z0JBQUU7Z0JBQU87YUFBTztZQUM3QkMsY0FBYyxTQUFVRixLQUFLO2dCQUFLLE9BQU9BLE1BQU1HLFVBQVUsQ0FBRTtZQUFPO1FBQ3BFO0lBQ0YsR0FBRztJQUNIUCxJQUFJLElBQUlMLGVBQWdCLE9BQU87UUFDN0JVLGFBQWE7WUFBRTtZQUFPO1NBQU87SUFDL0I7SUFDQUwsRUFBRUksS0FBSyxHQUFHO0lBQ1ZILE9BQU9GLE1BQU0sSUFBSUEsT0FBT0csTUFBTSxDQUFFO1FBQzlCRixFQUFHSSxLQUFLLEdBQUc7SUFDYixHQUFHO0lBRUgsZUFBZTtJQUNmSixJQUFJLElBQUlMLGVBQWdCLE9BQU87UUFDN0JXLGNBQWMsU0FBVUYsS0FBSztZQUFLLE9BQU9BLE1BQU1HLFVBQVUsQ0FBRTtRQUFPO0lBQ3BFO0lBQ0FQLEVBQUVJLEtBQUssR0FBRztJQUNWSCxPQUFPRixNQUFNLElBQUlBLE9BQU9HLE1BQU0sQ0FBRTtRQUM5QkYsRUFBR0ksS0FBSyxHQUFHO0lBQ2IsR0FBRztJQUVILDhCQUE4QjtJQUM5QkosSUFBSSxJQUFJTCxlQUFnQixPQUFPO1FBQzdCVSxhQUFhO1lBQUU7WUFBTztTQUFPO1FBQzdCQyxjQUFjLFNBQVVGLEtBQUs7WUFBSyxPQUFPQSxNQUFNSSxNQUFNLEtBQUs7UUFBRztJQUMvRDtJQUVBLGdDQUFnQztJQUNoQ1AsT0FBT0YsTUFBTSxJQUFJQSxPQUFPRyxNQUFNLENBQUU7UUFDOUJGLElBQUksSUFBSUwsZUFBZ0IsT0FBTztZQUM3QlUsYUFBYTtnQkFBRTtnQkFBTzthQUFPO1lBQzdCQyxjQUFjLFNBQVVGLEtBQUs7Z0JBQUssT0FBT0EsTUFBTUksTUFBTSxLQUFLO1lBQUc7UUFDL0Q7SUFDRixHQUFHO0lBRUhULE9BQU9VLEVBQUUsQ0FBRSxNQUFNO0FBQ25CIn0=