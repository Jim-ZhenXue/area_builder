// Copyright 2021-2024, University of Colorado Boulder
/**
 * Text tests
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import Text from './Text.js';
QUnit.module('Text');
QUnit.test('Mutually exclusive options', (assert)=>{
    assert.ok(true, 'always true, even when assertions are not on.');
    const stringProperty = new StringProperty('oh boy, here we go.');
    window.assert && assert.throws(()=>{
        return new Text({
            // @ts-expect-error for testing
            string: 'hi',
            stringProperty: stringProperty
        });
    }, 'text and stringProperty values do not match');
});
QUnit.test('DerivedProperty stringProperty', (assert)=>{
    assert.ok(true, 'always true, even when assertions are not on.');
    const string = 'oh boy, here we go';
    const stringProperty = new StringProperty(string);
    const extra = '!!';
    const aBitExtraForAStringProperty = new DerivedProperty([
        stringProperty
    ], (value)=>value + extra);
    const text = new Text(aBitExtraForAStringProperty);
    assert.ok(text.stringProperty.value === string + extra);
    stringProperty.value = string + extra;
    assert.ok(text.string === string + extra + extra);
    window.assert && assert.throws(()=>{
        text.string = 'hi';
    }, 'cannot set a derivedProperty');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvVGV4dFRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRleHQgdGVzdHNcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGV4dCBmcm9tICcuL1RleHQuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdUZXh0JyApO1xuXG5RVW5pdC50ZXN0KCAnTXV0dWFsbHkgZXhjbHVzaXZlIG9wdGlvbnMnLCBhc3NlcnQgPT4ge1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ2Fsd2F5cyB0cnVlLCBldmVuIHdoZW4gYXNzZXJ0aW9ucyBhcmUgbm90IG9uLicgKTtcblxuICBjb25zdCBzdHJpbmdQcm9wZXJ0eSA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggJ29oIGJveSwgaGVyZSB3ZSBnby4nICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHJldHVybiBuZXcgVGV4dCgge1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGZvciB0ZXN0aW5nXG4gICAgICBzdHJpbmc6ICdoaScsXG4gICAgICBzdHJpbmdQcm9wZXJ0eTogc3RyaW5nUHJvcGVydHlcbiAgICB9ICk7XG4gIH0sICd0ZXh0IGFuZCBzdHJpbmdQcm9wZXJ0eSB2YWx1ZXMgZG8gbm90IG1hdGNoJyApO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdEZXJpdmVkUHJvcGVydHkgc3RyaW5nUHJvcGVydHknLCBhc3NlcnQgPT4ge1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ2Fsd2F5cyB0cnVlLCBldmVuIHdoZW4gYXNzZXJ0aW9ucyBhcmUgbm90IG9uLicgKTtcblxuICBjb25zdCBzdHJpbmcgPSAnb2ggYm95LCBoZXJlIHdlIGdvJztcbiAgY29uc3Qgc3RyaW5nUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoIHN0cmluZyApO1xuXG4gIGNvbnN0IGV4dHJhID0gJyEhJztcbiAgY29uc3QgYUJpdEV4dHJhRm9yQVN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBzdHJpbmdQcm9wZXJ0eSBdLCB2YWx1ZSA9PiB2YWx1ZSArIGV4dHJhICk7XG5cbiAgY29uc3QgdGV4dCA9IG5ldyBUZXh0KCBhQml0RXh0cmFGb3JBU3RyaW5nUHJvcGVydHkgKTtcblxuICBhc3NlcnQub2soIHRleHQuc3RyaW5nUHJvcGVydHkudmFsdWUgPT09IHN0cmluZyArIGV4dHJhICk7XG4gIHN0cmluZ1Byb3BlcnR5LnZhbHVlID0gc3RyaW5nICsgZXh0cmE7XG4gIGFzc2VydC5vayggdGV4dC5zdHJpbmcgPT09IHN0cmluZyArIGV4dHJhICsgZXh0cmEgKTtcblxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICB0ZXh0LnN0cmluZyA9ICdoaSc7XG4gIH0sICdjYW5ub3Qgc2V0IGEgZGVyaXZlZFByb3BlcnR5JyApO1xufSApOyJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsIlRleHQiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJvayIsInN0cmluZ1Byb3BlcnR5Iiwid2luZG93IiwidGhyb3dzIiwic3RyaW5nIiwiZXh0cmEiLCJhQml0RXh0cmFGb3JBU3RyaW5nUHJvcGVydHkiLCJ2YWx1ZSIsInRleHQiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EscUJBQXFCLHNDQUFzQztBQUNsRSxPQUFPQyxvQkFBb0IscUNBQXFDO0FBQ2hFLE9BQU9DLFVBQVUsWUFBWTtBQUU3QkMsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSw4QkFBOEJDLENBQUFBO0lBRXhDQSxPQUFPQyxFQUFFLENBQUUsTUFBTTtJQUVqQixNQUFNQyxpQkFBaUIsSUFBSVAsZUFBZ0I7SUFDM0NRLE9BQU9ILE1BQU0sSUFBSUEsT0FBT0ksTUFBTSxDQUFFO1FBQzlCLE9BQU8sSUFBSVIsS0FBTTtZQUVmLCtCQUErQjtZQUMvQlMsUUFBUTtZQUNSSCxnQkFBZ0JBO1FBQ2xCO0lBQ0YsR0FBRztBQUVMO0FBRUFMLE1BQU1FLElBQUksQ0FBRSxrQ0FBa0NDLENBQUFBO0lBRTVDQSxPQUFPQyxFQUFFLENBQUUsTUFBTTtJQUVqQixNQUFNSSxTQUFTO0lBQ2YsTUFBTUgsaUJBQWlCLElBQUlQLGVBQWdCVTtJQUUzQyxNQUFNQyxRQUFRO0lBQ2QsTUFBTUMsOEJBQThCLElBQUliLGdCQUFpQjtRQUFFUTtLQUFnQixFQUFFTSxDQUFBQSxRQUFTQSxRQUFRRjtJQUU5RixNQUFNRyxPQUFPLElBQUliLEtBQU1XO0lBRXZCUCxPQUFPQyxFQUFFLENBQUVRLEtBQUtQLGNBQWMsQ0FBQ00sS0FBSyxLQUFLSCxTQUFTQztJQUNsREosZUFBZU0sS0FBSyxHQUFHSCxTQUFTQztJQUNoQ04sT0FBT0MsRUFBRSxDQUFFUSxLQUFLSixNQUFNLEtBQUtBLFNBQVNDLFFBQVFBO0lBRTVDSCxPQUFPSCxNQUFNLElBQUlBLE9BQU9JLE1BQU0sQ0FBRTtRQUM5QkssS0FBS0osTUFBTSxHQUFHO0lBQ2hCLEdBQUc7QUFDTCJ9