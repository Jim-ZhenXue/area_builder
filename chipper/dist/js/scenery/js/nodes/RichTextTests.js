// Copyright 2021-2023, University of Colorado Boulder
/**
 * RichText tests
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import RichText from './RichText.js';
QUnit.module('RichText');
QUnit.test('Mutually exclusive options', (assert)=>{
    assert.ok(true, 'always true, even when assertions are not on.');
    const stringProperty = new StringProperty('um, hoss?');
    window.assert && assert.throws(()=>{
        return new RichText({
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
    const text = new RichText(aBitExtraForAStringProperty);
    assert.ok(text.stringProperty.value === string + extra);
    stringProperty.value = string + extra;
    assert.ok(text.string === string + extra + extra);
    window.assert && assert.throws(()=>{
        text.string = 'hi';
    }, 'cannot set a derivedProperty');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvUmljaFRleHRUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSaWNoVGV4dCB0ZXN0c1xuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBSaWNoVGV4dCBmcm9tICcuL1JpY2hUZXh0LmpzJztcblxuUVVuaXQubW9kdWxlKCAnUmljaFRleHQnICk7XG5cblFVbml0LnRlc3QoICdNdXR1YWxseSBleGNsdXNpdmUgb3B0aW9ucycsIGFzc2VydCA9PiB7XG5cbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnYWx3YXlzIHRydWUsIGV2ZW4gd2hlbiBhc3NlcnRpb25zIGFyZSBub3Qgb24uJyApO1xuXG4gIGNvbnN0IHN0cmluZ1Byb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAndW0sIGhvc3M/JyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICByZXR1cm4gbmV3IFJpY2hUZXh0KCB7XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZm9yIHRlc3RpbmdcbiAgICAgIHN0cmluZzogJ2hpJyxcbiAgICAgIHN0cmluZ1Byb3BlcnR5OiBzdHJpbmdQcm9wZXJ0eVxuICAgIH0gKTtcbiAgfSwgJ3RleHQgYW5kIHN0cmluZ1Byb3BlcnR5IHZhbHVlcyBkbyBub3QgbWF0Y2gnICk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ0Rlcml2ZWRQcm9wZXJ0eSBzdHJpbmdQcm9wZXJ0eScsIGFzc2VydCA9PiB7XG5cbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnYWx3YXlzIHRydWUsIGV2ZW4gd2hlbiBhc3NlcnRpb25zIGFyZSBub3Qgb24uJyApO1xuXG4gIGNvbnN0IHN0cmluZyA9ICdvaCBib3ksIGhlcmUgd2UgZ28nO1xuICBjb25zdCBzdHJpbmdQcm9wZXJ0eSA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggc3RyaW5nICk7XG5cbiAgY29uc3QgZXh0cmEgPSAnISEnO1xuICBjb25zdCBhQml0RXh0cmFGb3JBU3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHN0cmluZ1Byb3BlcnR5IF0sIHZhbHVlID0+IHZhbHVlICsgZXh0cmEgKTtcblxuICBjb25zdCB0ZXh0ID0gbmV3IFJpY2hUZXh0KCBhQml0RXh0cmFGb3JBU3RyaW5nUHJvcGVydHkgKTtcblxuICBhc3NlcnQub2soIHRleHQuc3RyaW5nUHJvcGVydHkudmFsdWUgPT09IHN0cmluZyArIGV4dHJhICk7XG4gIHN0cmluZ1Byb3BlcnR5LnZhbHVlID0gc3RyaW5nICsgZXh0cmE7XG4gIGFzc2VydC5vayggdGV4dC5zdHJpbmcgPT09IHN0cmluZyArIGV4dHJhICsgZXh0cmEgKTtcblxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICB0ZXh0LnN0cmluZyA9ICdoaSc7XG4gIH0sICdjYW5ub3Qgc2V0IGEgZGVyaXZlZFByb3BlcnR5JyApO1xufSApOyJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsIlJpY2hUZXh0IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siLCJzdHJpbmdQcm9wZXJ0eSIsIndpbmRvdyIsInRocm93cyIsInN0cmluZyIsImV4dHJhIiwiYUJpdEV4dHJhRm9yQVN0cmluZ1Byb3BlcnR5IiwidmFsdWUiLCJ0ZXh0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQixzQ0FBc0M7QUFDbEUsT0FBT0Msb0JBQW9CLHFDQUFxQztBQUNoRSxPQUFPQyxjQUFjLGdCQUFnQjtBQUVyQ0MsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSw4QkFBOEJDLENBQUFBO0lBRXhDQSxPQUFPQyxFQUFFLENBQUUsTUFBTTtJQUVqQixNQUFNQyxpQkFBaUIsSUFBSVAsZUFBZ0I7SUFDM0NRLE9BQU9ILE1BQU0sSUFBSUEsT0FBT0ksTUFBTSxDQUFFO1FBQzlCLE9BQU8sSUFBSVIsU0FBVTtZQUVuQiwrQkFBK0I7WUFDL0JTLFFBQVE7WUFDUkgsZ0JBQWdCQTtRQUNsQjtJQUNGLEdBQUc7QUFFTDtBQUVBTCxNQUFNRSxJQUFJLENBQUUsa0NBQWtDQyxDQUFBQTtJQUU1Q0EsT0FBT0MsRUFBRSxDQUFFLE1BQU07SUFFakIsTUFBTUksU0FBUztJQUNmLE1BQU1ILGlCQUFpQixJQUFJUCxlQUFnQlU7SUFFM0MsTUFBTUMsUUFBUTtJQUNkLE1BQU1DLDhCQUE4QixJQUFJYixnQkFBaUI7UUFBRVE7S0FBZ0IsRUFBRU0sQ0FBQUEsUUFBU0EsUUFBUUY7SUFFOUYsTUFBTUcsT0FBTyxJQUFJYixTQUFVVztJQUUzQlAsT0FBT0MsRUFBRSxDQUFFUSxLQUFLUCxjQUFjLENBQUNNLEtBQUssS0FBS0gsU0FBU0M7SUFDbERKLGVBQWVNLEtBQUssR0FBR0gsU0FBU0M7SUFDaENOLE9BQU9DLEVBQUUsQ0FBRVEsS0FBS0osTUFBTSxLQUFLQSxTQUFTQyxRQUFRQTtJQUU1Q0gsT0FBT0gsTUFBTSxJQUFJQSxPQUFPSSxNQUFNLENBQUU7UUFDOUJLLEtBQUtKLE1BQU0sR0FBRztJQUNoQixHQUFHO0FBQ0wifQ==