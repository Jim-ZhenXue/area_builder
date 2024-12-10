// Copyright 2018-2021, University of Colorado Boulder
/**
 * Animation tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import NumberProperty from '../../axon/js/NumberProperty.js';
import Animation from './Animation.js';
QUnit.module('Animation');
QUnit.test('basic animation tests', (assert)=>{
    assert.equal(1, 1, 'sanity check');
    const numberProperty = new NumberProperty(0);
    const targetValue = 7;
    const animation = new Animation({
        // Options for the Animation as a whole
        duration: 2,
        // Options for the one target to change
        property: numberProperty,
        to: targetValue,
        stepEmitter: null
    });
    animation.start();
    for(let i = 0; i < 10; i++){
        animation.step(0.1);
    }
    assert.ok(Math.abs(numberProperty.value - targetValue / 2) < 1E-6, 'should be halfway there');
    for(let i = 0; i < 10; i++){
        animation.step(0.1);
    }
    assert.ok(Math.abs(numberProperty.value - targetValue) < 1E-6, 'should be all the way there');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvblRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFuaW1hdGlvbiB0ZXN0c1xuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuL0FuaW1hdGlvbi5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ0FuaW1hdGlvbicgKTtcblxuUVVuaXQudGVzdCggJ2Jhc2ljIGFuaW1hdGlvbiB0ZXN0cycsIGFzc2VydCA9PiB7XG4gIGFzc2VydC5lcXVhbCggMSwgMSwgJ3Nhbml0eSBjaGVjaycgKTtcblxuICBjb25zdCBudW1iZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xuXG4gIGNvbnN0IHRhcmdldFZhbHVlID0gNztcbiAgY29uc3QgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xuICAgIC8vIE9wdGlvbnMgZm9yIHRoZSBBbmltYXRpb24gYXMgYSB3aG9sZVxuICAgIGR1cmF0aW9uOiAyLFxuXG4gICAgLy8gT3B0aW9ucyBmb3IgdGhlIG9uZSB0YXJnZXQgdG8gY2hhbmdlXG4gICAgcHJvcGVydHk6IG51bWJlclByb3BlcnR5LFxuICAgIHRvOiB0YXJnZXRWYWx1ZSxcblxuICAgIHN0ZXBFbWl0dGVyOiBudWxsXG4gIH0gKTtcbiAgYW5pbWF0aW9uLnN0YXJ0KCk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDEwOyBpKysgKSB7XG4gICAgYW5pbWF0aW9uLnN0ZXAoIDAuMSApO1xuICB9XG4gIGFzc2VydC5vayggTWF0aC5hYnMoIG51bWJlclByb3BlcnR5LnZhbHVlIC0gdGFyZ2V0VmFsdWUgLyAyICkgPCAxRS02LCAnc2hvdWxkIGJlIGhhbGZ3YXkgdGhlcmUnICk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDEwOyBpKysgKSB7XG4gICAgYW5pbWF0aW9uLnN0ZXAoIDAuMSApO1xuICB9XG4gIGFzc2VydC5vayggTWF0aC5hYnMoIG51bWJlclByb3BlcnR5LnZhbHVlIC0gdGFyZ2V0VmFsdWUgKSA8IDFFLTYsICdzaG91bGQgYmUgYWxsIHRoZSB3YXkgdGhlcmUnICk7XG59ICk7Il0sIm5hbWVzIjpbIk51bWJlclByb3BlcnR5IiwiQW5pbWF0aW9uIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwiZXF1YWwiLCJudW1iZXJQcm9wZXJ0eSIsInRhcmdldFZhbHVlIiwiYW5pbWF0aW9uIiwiZHVyYXRpb24iLCJwcm9wZXJ0eSIsInRvIiwic3RlcEVtaXR0ZXIiLCJzdGFydCIsImkiLCJzdGVwIiwib2siLCJNYXRoIiwiYWJzIiwidmFsdWUiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esb0JBQW9CLGtDQUFrQztBQUM3RCxPQUFPQyxlQUFlLGlCQUFpQjtBQUV2Q0MsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSx5QkFBeUJDLENBQUFBO0lBQ25DQSxPQUFPQyxLQUFLLENBQUUsR0FBRyxHQUFHO0lBRXBCLE1BQU1DLGlCQUFpQixJQUFJUCxlQUFnQjtJQUUzQyxNQUFNUSxjQUFjO0lBQ3BCLE1BQU1DLFlBQVksSUFBSVIsVUFBVztRQUMvQix1Q0FBdUM7UUFDdkNTLFVBQVU7UUFFVix1Q0FBdUM7UUFDdkNDLFVBQVVKO1FBQ1ZLLElBQUlKO1FBRUpLLGFBQWE7SUFDZjtJQUNBSixVQUFVSyxLQUFLO0lBQ2YsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElBQUksSUFBSUEsSUFBTTtRQUM3Qk4sVUFBVU8sSUFBSSxDQUFFO0lBQ2xCO0lBQ0FYLE9BQU9ZLEVBQUUsQ0FBRUMsS0FBS0MsR0FBRyxDQUFFWixlQUFlYSxLQUFLLEdBQUdaLGNBQWMsS0FBTSxNQUFNO0lBQ3RFLElBQU0sSUFBSU8sSUFBSSxHQUFHQSxJQUFJLElBQUlBLElBQU07UUFDN0JOLFVBQVVPLElBQUksQ0FBRTtJQUNsQjtJQUNBWCxPQUFPWSxFQUFFLENBQUVDLEtBQUtDLEdBQUcsQ0FBRVosZUFBZWEsS0FBSyxHQUFHWixlQUFnQixNQUFNO0FBQ3BFIn0=