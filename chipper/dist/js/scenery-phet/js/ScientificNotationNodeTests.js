// Copyright 2022-2023, University of Colorado Boulder
/**
 * QUnit tests for ScientificNotationNode.toScientificNotation, the part of ScientificNotationNode that is unit-testable.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import ScientificNotationNode from './ScientificNotationNode.js';
QUnit.module('ScientificNotationNode');
QUnit.test('value === 0', (assert)=>{
    // For value === 0, the specified exponent should be used.
    assert.deepEqual(ScientificNotationNode.toScientificNotation(0, {
        exponent: 2,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '0.0',
        exponent: '2'
    });
    // For value === 0, if no exponent is requested, exponent should be 0.
    assert.deepEqual(ScientificNotationNode.toScientificNotation(0, {
        exponent: null,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '0.0',
        exponent: '0'
    });
});
QUnit.test('exponent === 0', (assert)=>{
    const ZERO_EXPONENT = 0;
    // For exponent === 0, we use phet.dot.Utils.toFixed to create the mantissa. This example adds zeros to decimal places.
    assert.deepEqual(ScientificNotationNode.toScientificNotation(424.8, {
        exponent: ZERO_EXPONENT,
        mantissaDecimalPlaces: 3
    }), {
        mantissa: '424.800',
        exponent: '0'
    });
    // For exponent === 0, we use phet.dot.Utils.toFixed to create the mantissa. This example rounds decimal places.
    assert.deepEqual(ScientificNotationNode.toScientificNotation(424.856, {
        exponent: ZERO_EXPONENT,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '424.9',
        exponent: '0'
    });
// This case was reported in https://github.com/phetsims/scenery-phet/issues/747, with bad mantissa '35.85'
// assert.deepEqual( ScientificNotationNode.toScientificNotation( 35.855, {
//   exponent: ZERO_EXPONENT,
//   mantissaDecimalPlaces: 2
// } ), { mantissa: '35.86', exponent: '0' } );
});
QUnit.test('exponent === null', (assert)=>{
    const NULL_EXPONENT = null;
    // This case was reported in https://github.com/phetsims/build-a-nucleus/issues/24 with bad mantissa '4.3'
    assert.deepEqual(ScientificNotationNode.toScientificNotation(424.8, {
        exponent: NULL_EXPONENT,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '4.2',
        exponent: '2'
    });
    assert.deepEqual(ScientificNotationNode.toScientificNotation(425.8, {
        exponent: NULL_EXPONENT,
        mantissaDecimalPlaces: 2
    }), {
        mantissa: '4.26',
        exponent: '2'
    });
    // This case was reported in https://github.com/phetsims/build-a-nucleus/issues/24, with bad mantissa '9.7'
    assert.deepEqual(ScientificNotationNode.toScientificNotation(9648, {
        exponent: NULL_EXPONENT,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '9.6',
        exponent: '3'
    });
    assert.deepEqual(ScientificNotationNode.toScientificNotation(9658, {
        exponent: NULL_EXPONENT,
        mantissaDecimalPlaces: 2
    }), {
        mantissa: '9.66',
        exponent: '3'
    });
    // This case was reported in https://github.com/phetsims/ph-scale/issues/235, with bad exponent sign.
    assert.deepEqual(ScientificNotationNode.toScientificNotation(1.0484477197064377e-7, {
        exponent: NULL_EXPONENT,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '1.0',
        exponent: '-7'
    });
});
QUnit.test('exponent !== 0 && exponent !== null', (assert)=>{
    assert.deepEqual(ScientificNotationNode.toScientificNotation(9648, {
        exponent: 1,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '964.8',
        exponent: '1'
    });
    assert.deepEqual(ScientificNotationNode.toScientificNotation(9648, {
        exponent: 2,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '96.5',
        exponent: '2'
    });
    assert.deepEqual(ScientificNotationNode.toScientificNotation(9648, {
        exponent: 3,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '9.6',
        exponent: '3'
    });
    assert.deepEqual(ScientificNotationNode.toScientificNotation(9648, {
        exponent: 3,
        mantissaDecimalPlaces: 2
    }), {
        mantissa: '9.65',
        exponent: '3'
    });
    assert.deepEqual(ScientificNotationNode.toScientificNotation(9648, {
        exponent: 4,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '1.0',
        exponent: '4'
    });
    assert.deepEqual(ScientificNotationNode.toScientificNotation(9648, {
        exponent: 4,
        mantissaDecimalPlaces: 3
    }), {
        mantissa: '0.965',
        exponent: '4'
    });
    assert.deepEqual(ScientificNotationNode.toScientificNotation(9648, {
        exponent: 5,
        mantissaDecimalPlaces: 1
    }), {
        mantissa: '0.1',
        exponent: '5'
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TY2llbnRpZmljTm90YXRpb25Ob2RlVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUVVuaXQgdGVzdHMgZm9yIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24sIHRoZSBwYXJ0IG9mIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUgdGhhdCBpcyB1bml0LXRlc3RhYmxlLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFNjaWVudGlmaWNOb3RhdGlvbk5vZGUgZnJvbSAnLi9TY2llbnRpZmljTm90YXRpb25Ob2RlLmpzJztcblxuUVVuaXQubW9kdWxlKCAnU2NpZW50aWZpY05vdGF0aW9uTm9kZScgKTtcblxuUVVuaXQudGVzdCggJ3ZhbHVlID09PSAwJywgYXNzZXJ0ID0+IHtcblxuICAvLyBGb3IgdmFsdWUgPT09IDAsIHRoZSBzcGVjaWZpZWQgZXhwb25lbnQgc2hvdWxkIGJlIHVzZWQuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIDAsIHtcbiAgICBleHBvbmVudDogMixcbiAgICBtYW50aXNzYURlY2ltYWxQbGFjZXM6IDFcbiAgfSApLCB7IG1hbnRpc3NhOiAnMC4wJywgZXhwb25lbnQ6ICcyJyB9ICk7XG5cbiAgLy8gRm9yIHZhbHVlID09PSAwLCBpZiBubyBleHBvbmVudCBpcyByZXF1ZXN0ZWQsIGV4cG9uZW50IHNob3VsZCBiZSAwLlxuICBhc3NlcnQuZGVlcEVxdWFsKCBTY2llbnRpZmljTm90YXRpb25Ob2RlLnRvU2NpZW50aWZpY05vdGF0aW9uKCAwLCB7XG4gICAgZXhwb25lbnQ6IG51bGwsXG4gICAgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiAxXG4gIH0gKSwgeyBtYW50aXNzYTogJzAuMCcsIGV4cG9uZW50OiAnMCcgfSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnZXhwb25lbnQgPT09IDAnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IFpFUk9fRVhQT05FTlQgPSAwO1xuXG4gIC8vIEZvciBleHBvbmVudCA9PT0gMCwgd2UgdXNlIHBoZXQuZG90LlV0aWxzLnRvRml4ZWQgdG8gY3JlYXRlIHRoZSBtYW50aXNzYS4gVGhpcyBleGFtcGxlIGFkZHMgemVyb3MgdG8gZGVjaW1hbCBwbGFjZXMuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIDQyNC44LCB7XG4gICAgZXhwb25lbnQ6IFpFUk9fRVhQT05FTlQsXG4gICAgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiAzXG4gIH0gKSwgeyBtYW50aXNzYTogJzQyNC44MDAnLCBleHBvbmVudDogJzAnIH0gKTtcblxuICAvLyBGb3IgZXhwb25lbnQgPT09IDAsIHdlIHVzZSBwaGV0LmRvdC5VdGlscy50b0ZpeGVkIHRvIGNyZWF0ZSB0aGUgbWFudGlzc2EuIFRoaXMgZXhhbXBsZSByb3VuZHMgZGVjaW1hbCBwbGFjZXMuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIDQyNC44NTYsIHtcbiAgICBleHBvbmVudDogWkVST19FWFBPTkVOVCxcbiAgICBtYW50aXNzYURlY2ltYWxQbGFjZXM6IDFcbiAgfSApLCB7IG1hbnRpc3NhOiAnNDI0LjknLCBleHBvbmVudDogJzAnIH0gKTtcblxuICAvLyBUaGlzIGNhc2Ugd2FzIHJlcG9ydGVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzc0Nywgd2l0aCBiYWQgbWFudGlzc2EgJzM1Ljg1J1xuICAvLyBhc3NlcnQuZGVlcEVxdWFsKCBTY2llbnRpZmljTm90YXRpb25Ob2RlLnRvU2NpZW50aWZpY05vdGF0aW9uKCAzNS44NTUsIHtcbiAgLy8gICBleHBvbmVudDogWkVST19FWFBPTkVOVCxcbiAgLy8gICBtYW50aXNzYURlY2ltYWxQbGFjZXM6IDJcbiAgLy8gfSApLCB7IG1hbnRpc3NhOiAnMzUuODYnLCBleHBvbmVudDogJzAnIH0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ2V4cG9uZW50ID09PSBudWxsJywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCBOVUxMX0VYUE9ORU5UID0gbnVsbDtcblxuICAvLyBUaGlzIGNhc2Ugd2FzIHJlcG9ydGVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9idWlsZC1hLW51Y2xldXMvaXNzdWVzLzI0IHdpdGggYmFkIG1hbnRpc3NhICc0LjMnXG4gIGFzc2VydC5kZWVwRXF1YWwoIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIDQyNC44LCB7XG4gICAgZXhwb25lbnQ6IE5VTExfRVhQT05FTlQsXG4gICAgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiAxXG4gIH0gKSwgeyBtYW50aXNzYTogJzQuMicsIGV4cG9uZW50OiAnMicgfSApO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIDQyNS44LCB7XG4gICAgZXhwb25lbnQ6IE5VTExfRVhQT05FTlQsXG4gICAgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiAyXG4gIH0gKSwgeyBtYW50aXNzYTogJzQuMjYnLCBleHBvbmVudDogJzInIH0gKTtcblxuICAvLyBUaGlzIGNhc2Ugd2FzIHJlcG9ydGVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9idWlsZC1hLW51Y2xldXMvaXNzdWVzLzI0LCB3aXRoIGJhZCBtYW50aXNzYSAnOS43J1xuICBhc3NlcnQuZGVlcEVxdWFsKCBTY2llbnRpZmljTm90YXRpb25Ob2RlLnRvU2NpZW50aWZpY05vdGF0aW9uKCA5NjQ4LCB7XG4gICAgZXhwb25lbnQ6IE5VTExfRVhQT05FTlQsXG4gICAgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiAxXG4gIH0gKSwgeyBtYW50aXNzYTogJzkuNicsIGV4cG9uZW50OiAnMycgfSApO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIDk2NTgsIHtcbiAgICBleHBvbmVudDogTlVMTF9FWFBPTkVOVCxcbiAgICBtYW50aXNzYURlY2ltYWxQbGFjZXM6IDJcbiAgfSApLCB7IG1hbnRpc3NhOiAnOS42NicsIGV4cG9uZW50OiAnMycgfSApO1xuXG4gIC8vIFRoaXMgY2FzZSB3YXMgcmVwb3J0ZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoLXNjYWxlL2lzc3Vlcy8yMzUsIHdpdGggYmFkIGV4cG9uZW50IHNpZ24uXG4gIGFzc2VydC5kZWVwRXF1YWwoIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIDEuMDQ4NDQ3NzE5NzA2NDM3N2UtNywge1xuICAgIGV4cG9uZW50OiBOVUxMX0VYUE9ORU5ULFxuICAgIG1hbnRpc3NhRGVjaW1hbFBsYWNlczogMVxuICB9ICksIHsgbWFudGlzc2E6ICcxLjAnLCBleHBvbmVudDogJy03JyB9ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdleHBvbmVudCAhPT0gMCAmJiBleHBvbmVudCAhPT0gbnVsbCcsIGFzc2VydCA9PiB7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbCggU2NpZW50aWZpY05vdGF0aW9uTm9kZS50b1NjaWVudGlmaWNOb3RhdGlvbiggOTY0OCwge1xuICAgIGV4cG9uZW50OiAxLFxuICAgIG1hbnRpc3NhRGVjaW1hbFBsYWNlczogMVxuICB9ICksIHsgbWFudGlzc2E6ICc5NjQuOCcsIGV4cG9uZW50OiAnMScgfSApO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIDk2NDgsIHtcbiAgICBleHBvbmVudDogMixcbiAgICBtYW50aXNzYURlY2ltYWxQbGFjZXM6IDFcbiAgfSApLCB7IG1hbnRpc3NhOiAnOTYuNScsIGV4cG9uZW50OiAnMicgfSApO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIDk2NDgsIHtcbiAgICBleHBvbmVudDogMyxcbiAgICBtYW50aXNzYURlY2ltYWxQbGFjZXM6IDFcbiAgfSApLCB7IG1hbnRpc3NhOiAnOS42JywgZXhwb25lbnQ6ICczJyB9ICk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbCggU2NpZW50aWZpY05vdGF0aW9uTm9kZS50b1NjaWVudGlmaWNOb3RhdGlvbiggOTY0OCwge1xuICAgIGV4cG9uZW50OiAzLFxuICAgIG1hbnRpc3NhRGVjaW1hbFBsYWNlczogMlxuICB9ICksIHsgbWFudGlzc2E6ICc5LjY1JywgZXhwb25lbnQ6ICczJyB9ICk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbCggU2NpZW50aWZpY05vdGF0aW9uTm9kZS50b1NjaWVudGlmaWNOb3RhdGlvbiggOTY0OCwge1xuICAgIGV4cG9uZW50OiA0LFxuICAgIG1hbnRpc3NhRGVjaW1hbFBsYWNlczogMVxuICB9ICksIHsgbWFudGlzc2E6ICcxLjAnLCBleHBvbmVudDogJzQnIH0gKTtcblxuICBhc3NlcnQuZGVlcEVxdWFsKCBTY2llbnRpZmljTm90YXRpb25Ob2RlLnRvU2NpZW50aWZpY05vdGF0aW9uKCA5NjQ4LCB7XG4gICAgZXhwb25lbnQ6IDQsXG4gICAgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiAzXG4gIH0gKSwgeyBtYW50aXNzYTogJzAuOTY1JywgZXhwb25lbnQ6ICc0JyB9ICk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbCggU2NpZW50aWZpY05vdGF0aW9uTm9kZS50b1NjaWVudGlmaWNOb3RhdGlvbiggOTY0OCwge1xuICAgIGV4cG9uZW50OiA1LFxuICAgIG1hbnRpc3NhRGVjaW1hbFBsYWNlczogMVxuICB9ICksIHsgbWFudGlzc2E6ICcwLjEnLCBleHBvbmVudDogJzUnIH0gKTtcbn0gKTsiXSwibmFtZXMiOlsiU2NpZW50aWZpY05vdGF0aW9uTm9kZSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsImRlZXBFcXVhbCIsInRvU2NpZW50aWZpY05vdGF0aW9uIiwiZXhwb25lbnQiLCJtYW50aXNzYURlY2ltYWxQbGFjZXMiLCJtYW50aXNzYSIsIlpFUk9fRVhQT05FTlQiLCJOVUxMX0VYUE9ORU5UIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLDRCQUE0Qiw4QkFBOEI7QUFFakVDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkRCxNQUFNRSxJQUFJLENBQUUsZUFBZUMsQ0FBQUE7SUFFekIsMERBQTBEO0lBQzFEQSxPQUFPQyxTQUFTLENBQUVMLHVCQUF1Qk0sb0JBQW9CLENBQUUsR0FBRztRQUNoRUMsVUFBVTtRQUNWQyx1QkFBdUI7SUFDekIsSUFBSztRQUFFQyxVQUFVO1FBQU9GLFVBQVU7SUFBSTtJQUV0QyxzRUFBc0U7SUFDdEVILE9BQU9DLFNBQVMsQ0FBRUwsdUJBQXVCTSxvQkFBb0IsQ0FBRSxHQUFHO1FBQ2hFQyxVQUFVO1FBQ1ZDLHVCQUF1QjtJQUN6QixJQUFLO1FBQUVDLFVBQVU7UUFBT0YsVUFBVTtJQUFJO0FBQ3hDO0FBRUFOLE1BQU1FLElBQUksQ0FBRSxrQkFBa0JDLENBQUFBO0lBRTVCLE1BQU1NLGdCQUFnQjtJQUV0Qix1SEFBdUg7SUFDdkhOLE9BQU9DLFNBQVMsQ0FBRUwsdUJBQXVCTSxvQkFBb0IsQ0FBRSxPQUFPO1FBQ3BFQyxVQUFVRztRQUNWRix1QkFBdUI7SUFDekIsSUFBSztRQUFFQyxVQUFVO1FBQVdGLFVBQVU7SUFBSTtJQUUxQyxnSEFBZ0g7SUFDaEhILE9BQU9DLFNBQVMsQ0FBRUwsdUJBQXVCTSxvQkFBb0IsQ0FBRSxTQUFTO1FB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