// Copyright 2019-2023, University of Colorado Boulder
/**
 * Tests for assertMutuallyExclusiveOptions
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import assertMutuallyExclusiveOptions from './assertMutuallyExclusiveOptions.js';
QUnit.module('assertMutuallyExclusiveOptions');
QUnit.test('assertMutuallyExclusiveOptions', (assert)=>{
    assert.ok(true, 'one test whether or not assertions are enabled');
    if (window.assert) {
        // Should not throw error because options are all from one set.
        assertMutuallyExclusiveOptions({
            a: true,
            b: false
        }, [
            'a',
            'b'
        ], [
            'c'
        ]);
        // Should error because options are used from multiple sets
        assert.throws(()=>assertMutuallyExclusiveOptions({
                a: true,
                b: false
            }, [
                'a'
            ], [
                'b'
            ]));
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnNUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUZXN0cyBmb3IgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zIGZyb20gJy4vYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcblxuUVVuaXQubW9kdWxlKCAnYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zJyApO1xuXG5RVW5pdC50ZXN0KCAnYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnb25lIHRlc3Qgd2hldGhlciBvciBub3QgYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZCcgKTtcblxuICBpZiAoIHdpbmRvdy5hc3NlcnQgKSB7XG5cbiAgICAvLyBTaG91bGQgbm90IHRocm93IGVycm9yIGJlY2F1c2Ugb3B0aW9ucyBhcmUgYWxsIGZyb20gb25lIHNldC5cbiAgICBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHsgYTogdHJ1ZSwgYjogZmFsc2UgfSwgWyAnYScsICdiJyBdLCBbICdjJyBdICk7XG5cbiAgICAvLyBTaG91bGQgZXJyb3IgYmVjYXVzZSBvcHRpb25zIGFyZSB1c2VkIGZyb20gbXVsdGlwbGUgc2V0c1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyggeyBhOiB0cnVlLCBiOiBmYWxzZSB9LCBbICdhJyBdLCBbICdiJyBdICkgKTtcbiAgfVxufSApOyJdLCJuYW1lcyI6WyJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJvayIsIndpbmRvdyIsImEiLCJiIiwidGhyb3dzIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLG9DQUFvQyxzQ0FBc0M7QUFFakZDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkRCxNQUFNRSxJQUFJLENBQUUsa0NBQWtDQyxDQUFBQTtJQUM1Q0EsT0FBT0MsRUFBRSxDQUFFLE1BQU07SUFFakIsSUFBS0MsT0FBT0YsTUFBTSxFQUFHO1FBRW5CLCtEQUErRDtRQUMvREosK0JBQWdDO1lBQUVPLEdBQUc7WUFBTUMsR0FBRztRQUFNLEdBQUc7WUFBRTtZQUFLO1NBQUssRUFBRTtZQUFFO1NBQUs7UUFFNUUsMkRBQTJEO1FBQzNESixPQUFPSyxNQUFNLENBQUUsSUFBTVQsK0JBQWdDO2dCQUFFTyxHQUFHO2dCQUFNQyxHQUFHO1lBQU0sR0FBRztnQkFBRTthQUFLLEVBQUU7Z0JBQUU7YUFBSztJQUM5RjtBQUNGIn0=