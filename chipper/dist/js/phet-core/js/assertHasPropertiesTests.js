// Copyright 2020-2023, University of Colorado Boulder
/**
 * Tests for assertHasProperties
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import assertHasProperties from './assertHasProperties.js';
QUnit.module('assertHasProperties');
QUnit.test('assertHasProperties', (assert)=>{
    assert.ok(true, 'one test whether or not assertions are enabled');
    if (window.assert) {
        let MyObject = class MyObject {
            aFunction() {
            // Empty
            }
            get getter() {
                return 'hi';
            }
        };
        let MyChild = class MyChild extends MyObject {
            childMethod() {
            // Empty
            }
            get childGetter() {
                return 'I am a middle child';
            }
        };
        // Should not throw error because options are all from one set.
        assertHasProperties({
            a: true,
            b: false
        }, [
            'a'
        ]);
        assertHasProperties({
            a: true,
            b: false
        }, [
            'a',
            'b'
        ]);
        assertHasProperties({
            b: undefined
        }, [
            'b'
        ]);
        assertHasProperties({
            b: null
        }, [
            'b'
        ]);
        assertHasProperties({
            get b () {
                return 5;
            }
        }, [
            'b'
        ]);
        assertHasProperties({
            b () {}
        }, [
            'b'
        ]);
        assertHasProperties({
            set b (b){}
        }, [
            'b'
        ]);
        assertHasProperties(new MyObject(), [
            'aFunction',
            'getter'
        ]);
        assertHasProperties(new MyChild(), [
            'aFunction',
            'getter',
            'childMethod',
            'childGetter'
        ]);
        // Simulate scenery Node style types
        let Parent = class Parent {
            getOpacity() {
                return 0;
            }
            get opacity() {
                return 0;
            }
            constructor(){
                this.opacityProperty = {};
            }
        };
        let Circle = class Circle extends Parent {
        };
        // on direct prototype
        assertHasProperties(new Parent(), [
            'getOpacity',
            'opacity',
            'opacityProperty'
        ]);
        // on ancestor parent prototype
        assertHasProperties(new Circle(), [
            'getOpacity',
            'opacity',
            'opacityProperty'
        ]);
        // Should error because properties are not provided
        assert.throws(()=>assertHasProperties({
                b: false
            }, [
                'a'
            ]));
        assert.throws(()=>assertHasProperties({}, [
                'a'
            ]));
        assert.throws(()=>assertHasProperties({
                ab: 'something'
            }, [
                'a'
            ]));
        assert.throws(()=>assertHasProperties({
                a: true,
                b: false
            }, [
                'a',
                'b',
                'c'
            ]));
        assert.throws(()=>assertHasProperties({
                a: true,
                c: undefined
            }, [
                'a',
                'b',
                'c'
            ]));
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRIYXNQcm9wZXJ0aWVzVGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGVzdHMgZm9yIGFzc2VydEhhc1Byb3BlcnRpZXNcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGFzc2VydEhhc1Byb3BlcnRpZXMgZnJvbSAnLi9hc3NlcnRIYXNQcm9wZXJ0aWVzLmpzJztcblxuUVVuaXQubW9kdWxlKCAnYXNzZXJ0SGFzUHJvcGVydGllcycgKTtcblxuUVVuaXQudGVzdCggJ2Fzc2VydEhhc1Byb3BlcnRpZXMnLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQub2soIHRydWUsICdvbmUgdGVzdCB3aGV0aGVyIG9yIG5vdCBhc3NlcnRpb25zIGFyZSBlbmFibGVkJyApO1xuXG4gIGlmICggd2luZG93LmFzc2VydCApIHtcblxuICAgIGNsYXNzIE15T2JqZWN0IHtcblxuICAgICAgcHVibGljIGFGdW5jdGlvbigpOiB2b2lkIHtcbiAgICAgICAgLy8gRW1wdHlcbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCBnZXR0ZXIoKSB7IHJldHVybiAnaGknOyB9XG4gICAgfVxuXG4gICAgY2xhc3MgTXlDaGlsZCBleHRlbmRzIE15T2JqZWN0IHtcblxuICAgICAgcHVibGljIGNoaWxkTWV0aG9kKCk6IHZvaWQge1xuICAgICAgICAvLyBFbXB0eVxuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IGNoaWxkR2V0dGVyKCkgeyByZXR1cm4gJ0kgYW0gYSBtaWRkbGUgY2hpbGQnOyB9XG4gICAgfVxuXG4gICAgLy8gU2hvdWxkIG5vdCB0aHJvdyBlcnJvciBiZWNhdXNlIG9wdGlvbnMgYXJlIGFsbCBmcm9tIG9uZSBzZXQuXG4gICAgYXNzZXJ0SGFzUHJvcGVydGllcyggeyBhOiB0cnVlLCBiOiBmYWxzZSB9LCBbICdhJyBdICk7XG4gICAgYXNzZXJ0SGFzUHJvcGVydGllcyggeyBhOiB0cnVlLCBiOiBmYWxzZSB9LCBbICdhJywgJ2InIF0gKTtcbiAgICBhc3NlcnRIYXNQcm9wZXJ0aWVzKCB7IGI6IHVuZGVmaW5lZCB9LCBbICdiJyBdICk7XG4gICAgYXNzZXJ0SGFzUHJvcGVydGllcyggeyBiOiBudWxsIH0sIFsgJ2InIF0gKTtcbiAgICBhc3NlcnRIYXNQcm9wZXJ0aWVzKCB7IGdldCBiKCkgeyByZXR1cm4gNTsgfSB9LCBbICdiJyBdICk7XG4gICAgYXNzZXJ0SGFzUHJvcGVydGllcyggeyBiKCkgeyAvKmVtcHR5Ki8gfSB9LCBbICdiJyBdICk7XG4gICAgYXNzZXJ0SGFzUHJvcGVydGllcyggeyBzZXQgYiggYjogdW5rbm93biApIHsgLyplbXB0eSovIH0gfSwgWyAnYicgXSApO1xuICAgIGFzc2VydEhhc1Byb3BlcnRpZXMoIG5ldyBNeU9iamVjdCgpLCBbICdhRnVuY3Rpb24nLCAnZ2V0dGVyJyBdICk7XG4gICAgYXNzZXJ0SGFzUHJvcGVydGllcyggbmV3IE15Q2hpbGQoKSwgWyAnYUZ1bmN0aW9uJywgJ2dldHRlcicsICdjaGlsZE1ldGhvZCcsICdjaGlsZEdldHRlcicgXSApO1xuXG4gICAgLy8gU2ltdWxhdGUgc2NlbmVyeSBOb2RlIHN0eWxlIHR5cGVzXG4gICAgY2xhc3MgUGFyZW50IHtcbiAgICAgIHB1YmxpYyBvcGFjaXR5UHJvcGVydHk6IG9iamVjdDtcblxuICAgICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLm9wYWNpdHlQcm9wZXJ0eSA9IHt9O1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0T3BhY2l0eSgpOiBudW1iZXIge3JldHVybiAwO31cblxuICAgICAgcHVibGljIGdldCBvcGFjaXR5KCkgeyByZXR1cm4gMDt9XG4gICAgfVxuXG4gICAgY2xhc3MgQ2lyY2xlIGV4dGVuZHMgUGFyZW50IHt9XG5cbiAgICAvLyBvbiBkaXJlY3QgcHJvdG90eXBlXG4gICAgYXNzZXJ0SGFzUHJvcGVydGllcyggbmV3IFBhcmVudCgpLCBbICdnZXRPcGFjaXR5JywgJ29wYWNpdHknLCAnb3BhY2l0eVByb3BlcnR5JyBdICk7XG5cbiAgICAvLyBvbiBhbmNlc3RvciBwYXJlbnQgcHJvdG90eXBlXG4gICAgYXNzZXJ0SGFzUHJvcGVydGllcyggbmV3IENpcmNsZSgpLCBbICdnZXRPcGFjaXR5JywgJ29wYWNpdHknLCAnb3BhY2l0eVByb3BlcnR5JyBdICk7XG5cbiAgICAvLyBTaG91bGQgZXJyb3IgYmVjYXVzZSBwcm9wZXJ0aWVzIGFyZSBub3QgcHJvdmlkZWRcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBhc3NlcnRIYXNQcm9wZXJ0aWVzKCB7IGI6IGZhbHNlIH0sIFsgJ2EnIF0gKSApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IGFzc2VydEhhc1Byb3BlcnRpZXMoIHt9LCBbICdhJyBdICkgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBhc3NlcnRIYXNQcm9wZXJ0aWVzKCB7IGFiOiAnc29tZXRoaW5nJyB9LCBbICdhJyBdICkgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBhc3NlcnRIYXNQcm9wZXJ0aWVzKCB7IGE6IHRydWUsIGI6IGZhbHNlIH0sIFsgJ2EnLCAnYicsICdjJyBdICkgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBhc3NlcnRIYXNQcm9wZXJ0aWVzKCB7IGE6IHRydWUsIGM6IHVuZGVmaW5lZCB9LCBbICdhJywgJ2InLCAnYycgXSApICk7XG4gIH1cbn0gKTsiXSwibmFtZXMiOlsiYXNzZXJ0SGFzUHJvcGVydGllcyIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwid2luZG93IiwiTXlPYmplY3QiLCJhRnVuY3Rpb24iLCJnZXR0ZXIiLCJNeUNoaWxkIiwiY2hpbGRNZXRob2QiLCJjaGlsZEdldHRlciIsImEiLCJiIiwidW5kZWZpbmVkIiwiUGFyZW50IiwiZ2V0T3BhY2l0eSIsIm9wYWNpdHkiLCJvcGFjaXR5UHJvcGVydHkiLCJDaXJjbGUiLCJ0aHJvd3MiLCJhYiIsImMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EseUJBQXlCLDJCQUEyQjtBQUUzREMsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSx1QkFBdUJDLENBQUFBO0lBQ2pDQSxPQUFPQyxFQUFFLENBQUUsTUFBTTtJQUVqQixJQUFLQyxPQUFPRixNQUFNLEVBQUc7UUFFbkIsSUFBQSxBQUFNRyxXQUFOLE1BQU1BO1lBRUdDLFlBQWtCO1lBQ3ZCLFFBQVE7WUFDVjtZQUVBLElBQVdDLFNBQVM7Z0JBQUUsT0FBTztZQUFNO1FBQ3JDO1FBRUEsSUFBQSxBQUFNQyxVQUFOLE1BQU1BLGdCQUFnQkg7WUFFYkksY0FBb0I7WUFDekIsUUFBUTtZQUNWO1lBRUEsSUFBV0MsY0FBYztnQkFBRSxPQUFPO1lBQXVCO1FBQzNEO1FBRUEsK0RBQStEO1FBQy9EWixvQkFBcUI7WUFBRWEsR0FBRztZQUFNQyxHQUFHO1FBQU0sR0FBRztZQUFFO1NBQUs7UUFDbkRkLG9CQUFxQjtZQUFFYSxHQUFHO1lBQU1DLEdBQUc7UUFBTSxHQUFHO1lBQUU7WUFBSztTQUFLO1FBQ3hEZCxvQkFBcUI7WUFBRWMsR0FBR0M7UUFBVSxHQUFHO1lBQUU7U0FBSztRQUM5Q2Ysb0JBQXFCO1lBQUVjLEdBQUc7UUFBSyxHQUFHO1lBQUU7U0FBSztRQUN6Q2Qsb0JBQXFCO1lBQUUsSUFBSWMsS0FBSTtnQkFBRSxPQUFPO1lBQUc7UUFBRSxHQUFHO1lBQUU7U0FBSztRQUN2RGQsb0JBQXFCO1lBQUVjLE1BQWdCO1FBQUUsR0FBRztZQUFFO1NBQUs7UUFDbkRkLG9CQUFxQjtZQUFFLElBQUljLEdBQUdBLEVBQWEsQ0FBWTtRQUFFLEdBQUc7WUFBRTtTQUFLO1FBQ25FZCxvQkFBcUIsSUFBSU8sWUFBWTtZQUFFO1lBQWE7U0FBVTtRQUM5RFAsb0JBQXFCLElBQUlVLFdBQVc7WUFBRTtZQUFhO1lBQVU7WUFBZTtTQUFlO1FBRTNGLG9DQUFvQztRQUNwQyxJQUFBLEFBQU1NLFNBQU4sTUFBTUE7WUFPR0MsYUFBcUI7Z0JBQUMsT0FBTztZQUFFO1lBRXRDLElBQVdDLFVBQVU7Z0JBQUUsT0FBTztZQUFFO1lBTmhDLGFBQXFCO2dCQUNuQixJQUFJLENBQUNDLGVBQWUsR0FBRyxDQUFDO1lBQzFCO1FBS0Y7UUFFQSxJQUFBLEFBQU1DLFNBQU4sTUFBTUEsZUFBZUo7UUFBUTtRQUU3QixzQkFBc0I7UUFDdEJoQixvQkFBcUIsSUFBSWdCLFVBQVU7WUFBRTtZQUFjO1lBQVc7U0FBbUI7UUFFakYsK0JBQStCO1FBQy9CaEIsb0JBQXFCLElBQUlvQixVQUFVO1lBQUU7WUFBYztZQUFXO1NBQW1CO1FBRWpGLG1EQUFtRDtRQUNuRGhCLE9BQU9pQixNQUFNLENBQUUsSUFBTXJCLG9CQUFxQjtnQkFBRWMsR0FBRztZQUFNLEdBQUc7Z0JBQUU7YUFBSztRQUMvRFYsT0FBT2lCLE1BQU0sQ0FBRSxJQUFNckIsb0JBQXFCLENBQUMsR0FBRztnQkFBRTthQUFLO1FBQ3JESSxPQUFPaUIsTUFBTSxDQUFFLElBQU1yQixvQkFBcUI7Z0JBQUVzQixJQUFJO1lBQVksR0FBRztnQkFBRTthQUFLO1FBQ3RFbEIsT0FBT2lCLE1BQU0sQ0FBRSxJQUFNckIsb0JBQXFCO2dCQUFFYSxHQUFHO2dCQUFNQyxHQUFHO1lBQU0sR0FBRztnQkFBRTtnQkFBSztnQkFBSzthQUFLO1FBQ2xGVixPQUFPaUIsTUFBTSxDQUFFLElBQU1yQixvQkFBcUI7Z0JBQUVhLEdBQUc7Z0JBQU1VLEdBQUdSO1lBQVUsR0FBRztnQkFBRTtnQkFBSztnQkFBSzthQUFLO0lBQ3hGO0FBQ0YifQ==