// Copyright 2017-2022, University of Colorado Boulder
/**
 * QUnit Tests for BooleanProperty
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import BooleanProperty from './BooleanProperty.js';
QUnit.module('BooleanProperty');
QUnit.test('BooleanProperty', (assert)=>{
    let fixtureProperty;
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL, this is purposefully failing typescript checks for testing
        fixtureProperty = new BooleanProperty('hello');
    }, 'invalid initial value');
    fixtureProperty = new BooleanProperty(true);
    fixtureProperty.set(true);
    fixtureProperty.set(false);
    fixtureProperty.set(true);
    window.assert && assert.throws(()=>{
        // @ts-expect-error INTENTIONAL, this is purposefully failing typescript checks for testing
        fixtureProperty.set(123);
    }, 'invalid set value');
    window.assert && assert.throws(()=>{
        //@ts-expect-error INTENTIONAL, force set phetioType for testing.
        fixtureProperty = new BooleanProperty(true, {
            phetioType: BooleanIO
        });
    }, 'BooleanProperty');
    assert.ok(true, 'so we have at least 1 test in this set');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUVVuaXQgVGVzdHMgZm9yIEJvb2xlYW5Qcm9wZXJ0eVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4vQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuL1Byb3BlcnR5LmpzJztcblxuUVVuaXQubW9kdWxlKCAnQm9vbGVhblByb3BlcnR5JyApO1xuUVVuaXQudGVzdCggJ0Jvb2xlYW5Qcm9wZXJ0eScsIGFzc2VydCA9PiB7XG5cbiAgbGV0IGZpeHR1cmVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMLCB0aGlzIGlzIHB1cnBvc2VmdWxseSBmYWlsaW5nIHR5cGVzY3JpcHQgY2hlY2tzIGZvciB0ZXN0aW5nXG4gICAgZml4dHVyZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggJ2hlbGxvJyApO1xuICB9LCAnaW52YWxpZCBpbml0aWFsIHZhbHVlJyApO1xuXG4gIGZpeHR1cmVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcbiAgZml4dHVyZVByb3BlcnR5LnNldCggdHJ1ZSApO1xuICBmaXh0dXJlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xuICBmaXh0dXJlUHJvcGVydHkuc2V0KCB0cnVlICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTCwgdGhpcyBpcyBwdXJwb3NlZnVsbHkgZmFpbGluZyB0eXBlc2NyaXB0IGNoZWNrcyBmb3IgdGVzdGluZ1xuICAgIGZpeHR1cmVQcm9wZXJ0eS5zZXQoIDEyMyApO1xuICB9LCAnaW52YWxpZCBzZXQgdmFsdWUnICk7XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG5cbiAgICAvL0B0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUwsIGZvcmNlIHNldCBwaGV0aW9UeXBlIGZvciB0ZXN0aW5nLlxuICAgIGZpeHR1cmVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHsgcGhldGlvVHlwZTogQm9vbGVhbklPIH0gKTtcbiAgfSwgJ0Jvb2xlYW5Qcm9wZXJ0eScgKTtcblxuICBhc3NlcnQub2soIHRydWUsICdzbyB3ZSBoYXZlIGF0IGxlYXN0IDEgdGVzdCBpbiB0aGlzIHNldCcgKTtcbn0gKTsiXSwibmFtZXMiOlsiQm9vbGVhbklPIiwiQm9vbGVhblByb3BlcnR5IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwiZml4dHVyZVByb3BlcnR5Iiwid2luZG93IiwidGhyb3dzIiwic2V0IiwicGhldGlvVHlwZSIsIm9rIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxlQUFlLHFDQUFxQztBQUMzRCxPQUFPQyxxQkFBcUIsdUJBQXVCO0FBR25EQyxNQUFNQyxNQUFNLENBQUU7QUFDZEQsTUFBTUUsSUFBSSxDQUFFLG1CQUFtQkMsQ0FBQUE7SUFFN0IsSUFBSUM7SUFFSkMsT0FBT0YsTUFBTSxJQUFJQSxPQUFPRyxNQUFNLENBQUU7UUFFOUIsMkZBQTJGO1FBQzNGRixrQkFBa0IsSUFBSUwsZ0JBQWlCO0lBQ3pDLEdBQUc7SUFFSEssa0JBQWtCLElBQUlMLGdCQUFpQjtJQUN2Q0ssZ0JBQWdCRyxHQUFHLENBQUU7SUFDckJILGdCQUFnQkcsR0FBRyxDQUFFO0lBQ3JCSCxnQkFBZ0JHLEdBQUcsQ0FBRTtJQUNyQkYsT0FBT0YsTUFBTSxJQUFJQSxPQUFPRyxNQUFNLENBQUU7UUFFOUIsMkZBQTJGO1FBQzNGRixnQkFBZ0JHLEdBQUcsQ0FBRTtJQUN2QixHQUFHO0lBRUhGLE9BQU9GLE1BQU0sSUFBSUEsT0FBT0csTUFBTSxDQUFFO1FBRTlCLGlFQUFpRTtRQUNqRUYsa0JBQWtCLElBQUlMLGdCQUFpQixNQUFNO1lBQUVTLFlBQVlWO1FBQVU7SUFDdkUsR0FBRztJQUVISyxPQUFPTSxFQUFFLENBQUUsTUFBTTtBQUNuQiJ9