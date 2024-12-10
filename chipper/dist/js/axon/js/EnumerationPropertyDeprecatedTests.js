// Copyright 2019-2022, University of Colorado Boulder
/**
 * QUnit Tests for EnumerationDeprecatedProperty
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import EnumerationDeprecated from '../../phet-core/js/EnumerationDeprecated.js';
import EnumerationIO from '../../tandem/js/types/EnumerationIO.js';
import EnumerationDeprecatedProperty from './EnumerationDeprecatedProperty.js';
QUnit.module('EnumerationDeprecatedProperty');
QUnit.test('EnumerationDeprecatedProperty', (assert)=>{
    const Birds = EnumerationDeprecated.byKeys([
        'ROBIN',
        'JAY',
        'WREN'
    ]);
    let birdProperty = null;
    // constructor value
    assert.ok(()=>{
        birdProperty = new EnumerationDeprecatedProperty(Birds, Birds.ROBIN);
    }, 'good constructor value');
    window.assert && assert.throws(()=>{
        birdProperty = new EnumerationDeprecatedProperty(true);
    }, 'invalid constructor value');
    // set value
    assert.ok(()=>{
        birdProperty.set(Birds.JAY);
    }, 'good set value');
    window.assert && assert.throws(()=>{
        birdProperty.set(5);
    }, 'bad set value');
    // superclass options that are not supported by EnumerationDeprecatedProperty
    window.assert && assert.throws(()=>{
        birdProperty = new EnumerationDeprecatedProperty(Birds, Birds.ROBIN, {
            isValidValue: ()=>true
        });
    }, 'EnumerationDeprecatedProperty does not support isValidValue');
    // superclass options that are controlled by EnumerationDeprecatedProperty
    window.assert && assert.throws(()=>{
        birdProperty = new EnumerationDeprecatedProperty(Birds, Birds.ROBIN, {
            valueType: Birds
        });
    }, 'EnumerationDeprecatedProperty sets valueType');
    window.assert && assert.throws(()=>{
        birdProperty = new EnumerationDeprecatedProperty(Birds, Birds.ROBIN, {
            phetioType: EnumerationIO
        });
    }, 'EnumerationDeprecatedProperty sets phetioType');
    window.assert && assert.throws(()=>{
        birdProperty = new EnumerationDeprecatedProperty(Birds, {
            phetioType: EnumerationIO
        });
    }, 'Did not include initial value');
    window.assert && assert.throws(()=>{
        birdProperty = new EnumerationDeprecatedProperty({});
    }, 'That is not an enumeration');
});
QUnit.test('EnumerationIO validation', (assert)=>{
    const Birds1 = EnumerationDeprecated.byKeys([
        'ROBIN',
        'JAY',
        'WREN',
        'OTHER'
    ]);
    const Birds2 = EnumerationDeprecated.byKeys([
        'ROBIN',
        'JAY',
        'WREN',
        'OTHER1'
    ], {
        phetioDocumentation: 'the second one'
    });
    assert.ok(Birds1 !== Birds2, 'different Enumerations');
    assert.ok(Birds1.ROBIN !== Birds2.ROBIN, 'different Enumerations');
    let birdProperty = new EnumerationDeprecatedProperty(Birds1, Birds1.ROBIN);
    const birdProperty2 = new EnumerationDeprecatedProperty(Birds2, Birds2.ROBIN);
    // constructor value
    window.assert && assert.throws(()=>{
        birdProperty.set(Birds2.ROBIN);
    }, 'cannot use same string value from other EnumerationDeprecated instance');
    // new instance of birdProperty since it got messed up in the above assert.
    birdProperty = new EnumerationDeprecatedProperty(Birds1, Birds1.ROBIN);
    birdProperty.set(Birds1.WREN);
    // This should not fail! If it does then EnumerationIO and PropertyIO caching isn't working, see https://github.com/phetsims/phet-core/issues/79
    birdProperty2.set(Birds2.WREN);
});
QUnit.test('validValues as a subset of EnumerationDeprecated values', (assert)=>{
    const Birds1 = EnumerationDeprecated.byKeys([
        'ROBIN',
        'JAY',
        'WREN'
    ]);
    const Birds2 = EnumerationDeprecated.byKeys([
        'ROBIN',
        'JAY',
        'WREN',
        'OTHER2'
    ], {
        phetioDocumentation: 'the second one'
    });
    assert.ok(Birds1 !== Birds2, 'different Enumerations');
    assert.ok(Birds1.ROBIN !== Birds2.ROBIN, 'different Enumerations');
    const enumerationProperty1 = new EnumerationDeprecatedProperty(Birds1, Birds1.ROBIN, {
        validValues: [
            Birds1.ROBIN,
            Birds1.JAY
        ]
    });
    enumerationProperty1.value = Birds1.JAY;
    assert.ok(enumerationProperty1.value === Birds1.JAY, 'basic test for when assertions are not enabled');
    assert.ok(enumerationProperty1.getInitialValue() === Birds1.ROBIN, 'basic test for when assertions are not enabled for initialValue');
    window.assert && assert.throws(()=>{
        enumerationProperty1.value = Birds1.WREN;
    }, 'not a valid value');
    window.assert && assert.throws(()=>{
        enumerationProperty1.value = Birds2.ROBIN;
    }, 'not a valid value, from a different EnumerationDeprecated');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eURlcHJlY2F0ZWRUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCBUZXN0cyBmb3IgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHlcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb25JTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvRW51bWVyYXRpb25JTy5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkgZnJvbSAnLi9FbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eS5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5JyApO1xuUVVuaXQudGVzdCggJ0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5JywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCBCaXJkcyA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1JPQklOJywgJ0pBWScsICdXUkVOJyBdICk7XG4gIGxldCBiaXJkUHJvcGVydHkgPSBudWxsO1xuXG4gIC8vIGNvbnN0cnVjdG9yIHZhbHVlXG4gIGFzc2VydC5vayggKCkgPT4ge1xuICAgIGJpcmRQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSggQmlyZHMsIEJpcmRzLlJPQklOICk7XG4gIH0sICdnb29kIGNvbnN0cnVjdG9yIHZhbHVlJyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBiaXJkUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIHRydWUgKTtcbiAgfSwgJ2ludmFsaWQgY29uc3RydWN0b3IgdmFsdWUnICk7XG5cbiAgLy8gc2V0IHZhbHVlXG4gIGFzc2VydC5vayggKCkgPT4ge1xuICAgIGJpcmRQcm9wZXJ0eS5zZXQoIEJpcmRzLkpBWSApO1xuICB9LCAnZ29vZCBzZXQgdmFsdWUnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIGJpcmRQcm9wZXJ0eS5zZXQoIDUgKTtcbiAgfSwgJ2JhZCBzZXQgdmFsdWUnICk7XG5cbiAgLy8gc3VwZXJjbGFzcyBvcHRpb25zIHRoYXQgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHlcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgYmlyZFByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBCaXJkcywgQmlyZHMuUk9CSU4sIHsgaXNWYWxpZFZhbHVlOiAoKSA9PiB0cnVlIH0gKTtcbiAgfSwgJ0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5IGRvZXMgbm90IHN1cHBvcnQgaXNWYWxpZFZhbHVlJyApO1xuXG4gIC8vIHN1cGVyY2xhc3Mgb3B0aW9ucyB0aGF0IGFyZSBjb250cm9sbGVkIGJ5IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIGJpcmRQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSggQmlyZHMsIEJpcmRzLlJPQklOLCB7IHZhbHVlVHlwZTogQmlyZHMgfSApO1xuICB9LCAnRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkgc2V0cyB2YWx1ZVR5cGUnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIGJpcmRQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSggQmlyZHMsIEJpcmRzLlJPQklOLCB7IHBoZXRpb1R5cGU6IEVudW1lcmF0aW9uSU8gfSApO1xuICB9LCAnRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkgc2V0cyBwaGV0aW9UeXBlJyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBiaXJkUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIEJpcmRzLCB7IHBoZXRpb1R5cGU6IEVudW1lcmF0aW9uSU8gfSApO1xuICB9LCAnRGlkIG5vdCBpbmNsdWRlIGluaXRpYWwgdmFsdWUnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIGJpcmRQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSgge30gKTtcbiAgfSwgJ1RoYXQgaXMgbm90IGFuIGVudW1lcmF0aW9uJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnRW51bWVyYXRpb25JTyB2YWxpZGF0aW9uJywgYXNzZXJ0ID0+IHtcblxuICAgIGNvbnN0IEJpcmRzMSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1JPQklOJywgJ0pBWScsICdXUkVOJywgJ09USEVSJyBdICk7XG4gICAgY29uc3QgQmlyZHMyID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnUk9CSU4nLCAnSkFZJywgJ1dSRU4nLCAnT1RIRVIxJyBdLCB7IHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgc2Vjb25kIG9uZScgfSApO1xuICAgIGFzc2VydC5vayggQmlyZHMxICE9PSBCaXJkczIsICdkaWZmZXJlbnQgRW51bWVyYXRpb25zJyApO1xuICAgIGFzc2VydC5vayggQmlyZHMxLlJPQklOICE9PSBCaXJkczIuUk9CSU4sICdkaWZmZXJlbnQgRW51bWVyYXRpb25zJyApO1xuICAgIGxldCBiaXJkUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIEJpcmRzMSwgQmlyZHMxLlJPQklOICk7XG4gICAgY29uc3QgYmlyZFByb3BlcnR5MiA9IG5ldyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSggQmlyZHMyLCBCaXJkczIuUk9CSU4gKTtcblxuICAgIC8vIGNvbnN0cnVjdG9yIHZhbHVlXG4gICAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgICBiaXJkUHJvcGVydHkuc2V0KCBCaXJkczIuUk9CSU4gKTtcbiAgICB9LCAnY2Fubm90IHVzZSBzYW1lIHN0cmluZyB2YWx1ZSBmcm9tIG90aGVyIEVudW1lcmF0aW9uRGVwcmVjYXRlZCBpbnN0YW5jZScgKTtcblxuICAgIC8vIG5ldyBpbnN0YW5jZSBvZiBiaXJkUHJvcGVydHkgc2luY2UgaXQgZ290IG1lc3NlZCB1cCBpbiB0aGUgYWJvdmUgYXNzZXJ0LlxuICAgIGJpcmRQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSggQmlyZHMxLCBCaXJkczEuUk9CSU4gKTtcblxuICAgIGJpcmRQcm9wZXJ0eS5zZXQoIEJpcmRzMS5XUkVOICk7XG5cbiAgICAvLyBUaGlzIHNob3VsZCBub3QgZmFpbCEgSWYgaXQgZG9lcyB0aGVuIEVudW1lcmF0aW9uSU8gYW5kIFByb3BlcnR5SU8gY2FjaGluZyBpc24ndCB3b3JraW5nLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvNzlcbiAgICBiaXJkUHJvcGVydHkyLnNldCggQmlyZHMyLldSRU4gKTtcbiAgfVxuKTtcblxuUVVuaXQudGVzdCggJ3ZhbGlkVmFsdWVzIGFzIGEgc3Vic2V0IG9mIEVudW1lcmF0aW9uRGVwcmVjYXRlZCB2YWx1ZXMnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IEJpcmRzMSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1JPQklOJywgJ0pBWScsICdXUkVOJyBdICk7XG4gIGNvbnN0IEJpcmRzMiA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1JPQklOJywgJ0pBWScsICdXUkVOJywgJ09USEVSMicgXSwgeyBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIHNlY29uZCBvbmUnIH0gKTtcbiAgYXNzZXJ0Lm9rKCBCaXJkczEgIT09IEJpcmRzMiwgJ2RpZmZlcmVudCBFbnVtZXJhdGlvbnMnICk7XG4gIGFzc2VydC5vayggQmlyZHMxLlJPQklOICE9PSBCaXJkczIuUk9CSU4sICdkaWZmZXJlbnQgRW51bWVyYXRpb25zJyApO1xuXG5cbiAgY29uc3QgZW51bWVyYXRpb25Qcm9wZXJ0eTEgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIEJpcmRzMSwgQmlyZHMxLlJPQklOLCB7IHZhbGlkVmFsdWVzOiBbIEJpcmRzMS5ST0JJTiwgQmlyZHMxLkpBWSBdIH0gKTtcblxuICBlbnVtZXJhdGlvblByb3BlcnR5MS52YWx1ZSA9IEJpcmRzMS5KQVk7XG4gIGFzc2VydC5vayggZW51bWVyYXRpb25Qcm9wZXJ0eTEudmFsdWUgPT09IEJpcmRzMS5KQVksICdiYXNpYyB0ZXN0IGZvciB3aGVuIGFzc2VydGlvbnMgYXJlIG5vdCBlbmFibGVkJyApO1xuICBhc3NlcnQub2soIGVudW1lcmF0aW9uUHJvcGVydHkxLmdldEluaXRpYWxWYWx1ZSgpID09PSBCaXJkczEuUk9CSU4sICdiYXNpYyB0ZXN0IGZvciB3aGVuIGFzc2VydGlvbnMgYXJlIG5vdCBlbmFibGVkIGZvciBpbml0aWFsVmFsdWUnICk7XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgZW51bWVyYXRpb25Qcm9wZXJ0eTEudmFsdWUgPSBCaXJkczEuV1JFTjtcbiAgfSwgJ25vdCBhIHZhbGlkIHZhbHVlJyApO1xuXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIGVudW1lcmF0aW9uUHJvcGVydHkxLnZhbHVlID0gQmlyZHMyLlJPQklOO1xuICB9LCAnbm90IGEgdmFsaWQgdmFsdWUsIGZyb20gYSBkaWZmZXJlbnQgRW51bWVyYXRpb25EZXByZWNhdGVkJyApO1xuXG59ICk7Il0sIm5hbWVzIjpbIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIkVudW1lcmF0aW9uSU8iLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIkJpcmRzIiwiYnlLZXlzIiwiYmlyZFByb3BlcnR5Iiwib2siLCJST0JJTiIsIndpbmRvdyIsInRocm93cyIsInNldCIsIkpBWSIsImlzVmFsaWRWYWx1ZSIsInZhbHVlVHlwZSIsInBoZXRpb1R5cGUiLCJCaXJkczEiLCJCaXJkczIiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiYmlyZFByb3BlcnR5MiIsIldSRU4iLCJlbnVtZXJhdGlvblByb3BlcnR5MSIsInZhbGlkVmFsdWVzIiwidmFsdWUiLCJnZXRJbml0aWFsVmFsdWUiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsMkJBQTJCLDhDQUE4QztBQUNoRixPQUFPQyxtQkFBbUIseUNBQXlDO0FBQ25FLE9BQU9DLG1DQUFtQyxxQ0FBcUM7QUFFL0VDLE1BQU1DLE1BQU0sQ0FBRTtBQUNkRCxNQUFNRSxJQUFJLENBQUUsaUNBQWlDQyxDQUFBQTtJQUUzQyxNQUFNQyxRQUFRUCxzQkFBc0JRLE1BQU0sQ0FBRTtRQUFFO1FBQVM7UUFBTztLQUFRO0lBQ3RFLElBQUlDLGVBQWU7SUFFbkIsb0JBQW9CO0lBQ3BCSCxPQUFPSSxFQUFFLENBQUU7UUFDVEQsZUFBZSxJQUFJUCw4QkFBK0JLLE9BQU9BLE1BQU1JLEtBQUs7SUFDdEUsR0FBRztJQUNIQyxPQUFPTixNQUFNLElBQUlB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