// Copyright 2022-2024, University of Colorado Boulder
/**
 * PatternStringProperty tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Tandem from '../../tandem/js/Tandem.js';
import PatternStringProperty from './PatternStringProperty.js';
import TinyProperty from './TinyProperty.js';
QUnit.module('PatternStringProperty');
QUnit.test('Basic usage', (assert)=>{
    const patternProperty = new TinyProperty('Value: {{value}}');
    const valueProperty = new TinyProperty(5);
    const property = new PatternStringProperty(patternProperty, {
        value: valueProperty
    }, {
        tandem: Tandem.OPT_OUT
    });
    assert.equal(property.value, 'Value: 5');
    patternProperty.value = 'Why {{value}}?';
    assert.equal(property.value, 'Why 5?');
    valueProperty.value = 10;
    assert.equal(property.value, 'Why 10?');
});
QUnit.test('Constant usage', (assert)=>{
    const patternProperty = new TinyProperty('Value: {{value}}');
    const property = new PatternStringProperty(patternProperty, {
        value: 5
    }, {
        tandem: Tandem.OPT_OUT
    });
    assert.equal(property.value, 'Value: 5');
    patternProperty.value = 'Why {{value}}?';
    assert.equal(property.value, 'Why 5?');
});
QUnit.test('Multiple Properties', (assert)=>{
    const patternProperty = new TinyProperty('Is {{valueA}} greater than {{valueB}}?');
    const valueAProperty = new TinyProperty(4);
    const valueBProperty = new TinyProperty(6);
    const property = new PatternStringProperty(patternProperty, {
        valueA: valueAProperty,
        valueB: valueBProperty
    }, {
        tandem: Tandem.OPT_OUT
    });
    assert.equal(property.value, 'Is 4 greater than 6?');
    valueAProperty.value = 7;
    assert.equal(property.value, 'Is 7 greater than 6?');
    valueBProperty.value = 10;
    assert.equal(property.value, 'Is 7 greater than 10?');
});
QUnit.test('Decimal Places (basic)', (assert)=>{
    const patternProperty = new TinyProperty('Value: {{value}}');
    const valueProperty = new TinyProperty(4);
    const property = new PatternStringProperty(patternProperty, {
        value: valueProperty
    }, {
        tandem: Tandem.OPT_OUT,
        decimalPlaces: 2
    });
    assert.equal(property.value, 'Value: 4.00');
    valueProperty.value = Math.PI;
    assert.equal(property.value, 'Value: 3.14');
});
QUnit.test('Decimal Places (multiple)', (assert)=>{
    const patternProperty = new TinyProperty('Is {{valueA}} greater than {{valueB}}?');
    const valueAProperty = new TinyProperty(4);
    const valueBProperty = new TinyProperty(6);
    const property = new PatternStringProperty(patternProperty, {
        valueA: valueAProperty,
        valueB: valueBProperty
    }, {
        tandem: Tandem.OPT_OUT,
        decimalPlaces: {
            valueA: 1,
            valueB: 2
        }
    });
    assert.equal(property.value, 'Is 4.0 greater than 6.00?');
});
QUnit.test('Decimal Places (only one)', (assert)=>{
    const patternProperty = new TinyProperty('Is {{valueA}} greater than {{valueB}}?');
    const valueAProperty = new TinyProperty(4);
    const valueBProperty = new TinyProperty(6);
    const property = new PatternStringProperty(patternProperty, {
        valueA: valueAProperty,
        valueB: valueBProperty
    }, {
        tandem: Tandem.OPT_OUT,
        decimalPlaces: {
            valueA: null,
            valueB: 2
        }
    });
    assert.equal(property.value, 'Is 4 greater than 6.00?');
});
QUnit.test('Map (basic)', (assert)=>{
    const patternProperty = new TinyProperty('Value: {{value}}');
    const valueProperty = new TinyProperty(4);
    const property = new PatternStringProperty(patternProperty, {
        value: valueProperty
    }, {
        tandem: Tandem.OPT_OUT,
        maps: {
            value: (n)=>n * 2
        }
    });
    assert.equal(property.value, 'Value: 8');
    valueProperty.value = 1;
    assert.equal(property.value, 'Value: 2');
});
QUnit.test('Map (with decimal places)', (assert)=>{
    const patternProperty = new TinyProperty('Value: {{value}}');
    const valueProperty = new TinyProperty(2);
    const property = new PatternStringProperty(patternProperty, {
        value: valueProperty
    }, {
        tandem: Tandem.OPT_OUT,
        maps: {
            value: (n)=>n / 4
        },
        decimalPlaces: 2
    });
    assert.equal(property.value, 'Value: 0.50');
    valueProperty.value = 1;
    assert.equal(property.value, 'Value: 0.25');
});
QUnit.test('Map (string)', (assert)=>{
    const patternProperty = new TinyProperty('What does the fox say: {{value}}');
    const valueProperty = new TinyProperty('Hello');
    const property = new PatternStringProperty(patternProperty, {
        value: valueProperty
    }, {
        tandem: Tandem.OPT_OUT,
        maps: {
            value: (str)=>`${str}!`
        }
    });
    assert.equal(property.value, 'What does the fox say: Hello!');
});
QUnit.test('Map (non-value)', (assert)=>{
    const patternProperty = new TinyProperty('Sum is {{sum}}');
    const valueProperty = new TinyProperty([
        1,
        2,
        3
    ]);
    const property = new PatternStringProperty(patternProperty, {
        sum: valueProperty
    }, {
        tandem: Tandem.OPT_OUT,
        maps: {
            sum: (values)=>_.sum(values)
        }
    });
    assert.equal(property.value, 'Sum is 6');
    valueProperty.value = [
        4,
        0,
        9
    ];
    assert.equal(property.value, 'Sum is 13');
});
QUnit.test('formatNames', (assert)=>{
    const patternProperty = new TinyProperty('Values: {0} and {1}');
    const property = new PatternStringProperty(patternProperty, {
        valueA: 5,
        valueB: 7
    }, {
        tandem: Tandem.OPT_OUT,
        formatNames: [
            'valueA',
            'valueB'
        ]
    });
    assert.equal(property.value, 'Values: 5 and 7');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUGF0dGVyblN0cmluZ1Byb3BlcnR5IHRlc3RzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4vUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi9UaW55UHJvcGVydHkuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdQYXR0ZXJuU3RyaW5nUHJvcGVydHknICk7XG5cblFVbml0LnRlc3QoICdCYXNpYyB1c2FnZScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHBhdHRlcm5Qcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoICdWYWx1ZToge3t2YWx1ZX19JyApO1xuICBjb25zdCB2YWx1ZVByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggNSApO1xuICBjb25zdCBwcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIHBhdHRlcm5Qcm9wZXJ0eSwge1xuICAgIHZhbHVlOiB2YWx1ZVByb3BlcnR5XG4gIH0sIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBwcm9wZXJ0eS52YWx1ZSwgJ1ZhbHVlOiA1JyApO1xuXG4gIHBhdHRlcm5Qcm9wZXJ0eS52YWx1ZSA9ICdXaHkge3t2YWx1ZX19Pyc7XG4gIGFzc2VydC5lcXVhbCggcHJvcGVydHkudmFsdWUsICdXaHkgNT8nICk7XG5cbiAgdmFsdWVQcm9wZXJ0eS52YWx1ZSA9IDEwO1xuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5LnZhbHVlLCAnV2h5IDEwPycgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ0NvbnN0YW50IHVzYWdlJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgcGF0dGVyblByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggJ1ZhbHVlOiB7e3ZhbHVlfX0nICk7XG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggcGF0dGVyblByb3BlcnR5LCB7XG4gICAgdmFsdWU6IDVcbiAgfSwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcblxuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5LnZhbHVlLCAnVmFsdWU6IDUnICk7XG5cbiAgcGF0dGVyblByb3BlcnR5LnZhbHVlID0gJ1doeSB7e3ZhbHVlfX0/JztcbiAgYXNzZXJ0LmVxdWFsKCBwcm9wZXJ0eS52YWx1ZSwgJ1doeSA1PycgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ011bHRpcGxlIFByb3BlcnRpZXMnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBwYXR0ZXJuUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCAnSXMge3t2YWx1ZUF9fSBncmVhdGVyIHRoYW4ge3t2YWx1ZUJ9fT8nICk7XG4gIGNvbnN0IHZhbHVlQVByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggNCApO1xuICBjb25zdCB2YWx1ZUJQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIDYgKTtcbiAgY29uc3QgcHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBwYXR0ZXJuUHJvcGVydHksIHtcbiAgICB2YWx1ZUE6IHZhbHVlQVByb3BlcnR5LFxuICAgIHZhbHVlQjogdmFsdWVCUHJvcGVydHlcbiAgfSwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcblxuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5LnZhbHVlLCAnSXMgNCBncmVhdGVyIHRoYW4gNj8nICk7XG5cbiAgdmFsdWVBUHJvcGVydHkudmFsdWUgPSA3O1xuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5LnZhbHVlLCAnSXMgNyBncmVhdGVyIHRoYW4gNj8nICk7XG5cbiAgdmFsdWVCUHJvcGVydHkudmFsdWUgPSAxMDtcbiAgYXNzZXJ0LmVxdWFsKCBwcm9wZXJ0eS52YWx1ZSwgJ0lzIDcgZ3JlYXRlciB0aGFuIDEwPycgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ0RlY2ltYWwgUGxhY2VzIChiYXNpYyknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBwYXR0ZXJuUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCAnVmFsdWU6IHt7dmFsdWV9fScgKTtcbiAgY29uc3QgdmFsdWVQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIDQgKTtcbiAgY29uc3QgcHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBwYXR0ZXJuUHJvcGVydHksIHtcbiAgICB2YWx1ZTogdmFsdWVQcm9wZXJ0eVxuICB9LCB7XG4gICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCxcbiAgICBkZWNpbWFsUGxhY2VzOiAyXG4gIH0gKTtcblxuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5LnZhbHVlLCAnVmFsdWU6IDQuMDAnICk7XG5cbiAgdmFsdWVQcm9wZXJ0eS52YWx1ZSA9IE1hdGguUEk7XG4gIGFzc2VydC5lcXVhbCggcHJvcGVydHkudmFsdWUsICdWYWx1ZTogMy4xNCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ0RlY2ltYWwgUGxhY2VzIChtdWx0aXBsZSknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBwYXR0ZXJuUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCAnSXMge3t2YWx1ZUF9fSBncmVhdGVyIHRoYW4ge3t2YWx1ZUJ9fT8nICk7XG4gIGNvbnN0IHZhbHVlQVByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggNCApO1xuICBjb25zdCB2YWx1ZUJQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIDYgKTtcbiAgY29uc3QgcHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBwYXR0ZXJuUHJvcGVydHksIHtcbiAgICB2YWx1ZUE6IHZhbHVlQVByb3BlcnR5LFxuICAgIHZhbHVlQjogdmFsdWVCUHJvcGVydHlcbiAgfSwge1xuICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXG4gICAgZGVjaW1hbFBsYWNlczoge1xuICAgICAgdmFsdWVBOiAxLFxuICAgICAgdmFsdWVCOiAyXG4gICAgfVxuICB9ICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBwcm9wZXJ0eS52YWx1ZSwgJ0lzIDQuMCBncmVhdGVyIHRoYW4gNi4wMD8nICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdEZWNpbWFsIFBsYWNlcyAob25seSBvbmUpJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgcGF0dGVyblByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggJ0lzIHt7dmFsdWVBfX0gZ3JlYXRlciB0aGFuIHt7dmFsdWVCfX0/JyApO1xuICBjb25zdCB2YWx1ZUFQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIDQgKTtcbiAgY29uc3QgdmFsdWVCUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCA2ICk7XG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggcGF0dGVyblByb3BlcnR5LCB7XG4gICAgdmFsdWVBOiB2YWx1ZUFQcm9wZXJ0eSxcbiAgICB2YWx1ZUI6IHZhbHVlQlByb3BlcnR5XG4gIH0sIHtcbiAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VULFxuICAgIGRlY2ltYWxQbGFjZXM6IHtcbiAgICAgIHZhbHVlQTogbnVsbCxcbiAgICAgIHZhbHVlQjogMlxuICAgIH1cbiAgfSApO1xuXG4gIGFzc2VydC5lcXVhbCggcHJvcGVydHkudmFsdWUsICdJcyA0IGdyZWF0ZXIgdGhhbiA2LjAwPycgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ01hcCAoYmFzaWMpJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgcGF0dGVyblByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggJ1ZhbHVlOiB7e3ZhbHVlfX0nICk7XG4gIGNvbnN0IHZhbHVlUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCA0ICk7XG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggcGF0dGVyblByb3BlcnR5LCB7XG4gICAgdmFsdWU6IHZhbHVlUHJvcGVydHlcbiAgfSwge1xuICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXG4gICAgbWFwczoge1xuICAgICAgdmFsdWU6ICggbjogbnVtYmVyICkgPT4gbiAqIDJcbiAgICB9XG4gIH0gKTtcblxuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5LnZhbHVlLCAnVmFsdWU6IDgnICk7XG5cbiAgdmFsdWVQcm9wZXJ0eS52YWx1ZSA9IDE7XG4gIGFzc2VydC5lcXVhbCggcHJvcGVydHkudmFsdWUsICdWYWx1ZTogMicgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ01hcCAod2l0aCBkZWNpbWFsIHBsYWNlcyknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBwYXR0ZXJuUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCAnVmFsdWU6IHt7dmFsdWV9fScgKTtcbiAgY29uc3QgdmFsdWVQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIDIgKTtcbiAgY29uc3QgcHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBwYXR0ZXJuUHJvcGVydHksIHtcbiAgICB2YWx1ZTogdmFsdWVQcm9wZXJ0eVxuICB9LCB7XG4gICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCxcbiAgICBtYXBzOiB7XG4gICAgICB2YWx1ZTogKCBuOiBudW1iZXIgKSA9PiBuIC8gNFxuICAgIH0sXG4gICAgZGVjaW1hbFBsYWNlczogMlxuICB9ICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBwcm9wZXJ0eS52YWx1ZSwgJ1ZhbHVlOiAwLjUwJyApO1xuXG4gIHZhbHVlUHJvcGVydHkudmFsdWUgPSAxO1xuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5LnZhbHVlLCAnVmFsdWU6IDAuMjUnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdNYXAgKHN0cmluZyknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBwYXR0ZXJuUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCAnV2hhdCBkb2VzIHRoZSBmb3ggc2F5OiB7e3ZhbHVlfX0nICk7XG4gIGNvbnN0IHZhbHVlUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCAnSGVsbG8nICk7XG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggcGF0dGVyblByb3BlcnR5LCB7XG4gICAgdmFsdWU6IHZhbHVlUHJvcGVydHlcbiAgfSwge1xuICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXG4gICAgbWFwczoge1xuICAgICAgdmFsdWU6ICggc3RyOiBzdHJpbmcgKSA9PiBgJHtzdHJ9IWBcbiAgICB9XG4gIH0gKTtcblxuICBhc3NlcnQuZXF1YWwoIHByb3BlcnR5LnZhbHVlLCAnV2hhdCBkb2VzIHRoZSBmb3ggc2F5OiBIZWxsbyEnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdNYXAgKG5vbi12YWx1ZSknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBwYXR0ZXJuUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCAnU3VtIGlzIHt7c3VtfX0nICk7XG4gIGNvbnN0IHZhbHVlUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCBbIDEsIDIsIDMgXSApO1xuICBjb25zdCBwcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIHBhdHRlcm5Qcm9wZXJ0eSwge1xuICAgIHN1bTogdmFsdWVQcm9wZXJ0eVxuICB9LCB7XG4gICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCxcbiAgICBtYXBzOiB7XG4gICAgICBzdW06ICggdmFsdWVzOiBudW1iZXJbXSApID0+IF8uc3VtKCB2YWx1ZXMgKVxuICAgIH1cbiAgfSApO1xuXG4gIGFzc2VydC5lcXVhbCggcHJvcGVydHkudmFsdWUsICdTdW0gaXMgNicgKTtcblxuICB2YWx1ZVByb3BlcnR5LnZhbHVlID0gWyA0LCAwLCA5IF07XG4gIGFzc2VydC5lcXVhbCggcHJvcGVydHkudmFsdWUsICdTdW0gaXMgMTMnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdmb3JtYXROYW1lcycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHBhdHRlcm5Qcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoICdWYWx1ZXM6IHswfSBhbmQgezF9JyApO1xuICBjb25zdCBwcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIHBhdHRlcm5Qcm9wZXJ0eSwge1xuICAgIHZhbHVlQTogNSxcbiAgICB2YWx1ZUI6IDdcbiAgfSwge1xuICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXG4gICAgZm9ybWF0TmFtZXM6IFsgJ3ZhbHVlQScsICd2YWx1ZUInIF1cbiAgfSApO1xuXG4gIGFzc2VydC5lcXVhbCggcHJvcGVydHkudmFsdWUsICdWYWx1ZXM6IDUgYW5kIDcnICk7XG59ICk7Il0sIm5hbWVzIjpbIlRhbmRlbSIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIlRpbnlQcm9wZXJ0eSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsInBhdHRlcm5Qcm9wZXJ0eSIsInZhbHVlUHJvcGVydHkiLCJwcm9wZXJ0eSIsInZhbHVlIiwidGFuZGVtIiwiT1BUX09VVCIsImVxdWFsIiwidmFsdWVBUHJvcGVydHkiLCJ2YWx1ZUJQcm9wZXJ0eSIsInZhbHVlQSIsInZhbHVlQiIsImRlY2ltYWxQbGFjZXMiLCJNYXRoIiwiUEkiLCJtYXBzIiwibiIsInN0ciIsInN1bSIsInZhbHVlcyIsIl8iLCJmb3JtYXROYW1lcyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQywyQkFBMkIsNkJBQTZCO0FBQy9ELE9B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