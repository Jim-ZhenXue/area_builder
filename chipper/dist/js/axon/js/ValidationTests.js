// Copyright 2019-2024, University of Colorado Boulder
/**
 * QUnit tests for Validator
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Vector2 from '../../dot/js/Vector2.js';
import Vector3 from '../../dot/js/Vector3.js';
import EnumerationDeprecated from '../../phet-core/js/EnumerationDeprecated.js';
import { Node } from '../../scenery/js/imports.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import Emitter from './Emitter.js';
import Property from './Property.js';
import validate from './validate.js';
import Validation from './Validation.js';
// constants
const ASSERTIONS_TRUE = {
    assertions: true
};
QUnit.module('Validator');
// Note that many validation tests are in PropertyTests
QUnit.test('Test validate and Validation.isValidValue', (assert)=>{
    window.assert && assert.throws(()=>validate(4, {
            validValues: [
                1,
                2,
                3
            ]
        }), 'invalid number');
    window.assert && assert.throws(()=>validate('hello', {
            valueType: Array
        }), 'string isn\'t Array');
    assert.ok(Validation.isValueValid(3, {
        validValues: [
            1,
            2,
            3
        ]
    }));
    assert.ok(Validation.isValueValid([], {
        valueType: Array
    }));
    assert.ok(Validation.isValueValid(7, {
        valueType: 'number',
        isValidValue: (v)=>v > 5
    }));
    assert.ok(!Validation.isValueValid(7, {
        valueType: 'number',
        isValidValue: (v)=>v > 7
    }));
    assert.ok(!Validation.isValueValid(7, {
        valueType: 'number',
        isValidValue: (v)=>v < 3
    }));
});
QUnit.test('Test containsValidatorKey', (assert)=>{
    assert.ok(Validation.containsValidatorKey({
        validValues: []
    }), 'has key validValues');
    assert.ok(!Validation.containsValidatorKey({
        shmalidValues: []
    }), 'does not have key: validValues');
    assert.ok(Validation.containsValidatorKey({
        validValues: [],
        valueType: []
    }), 'does have keys: valueType and validValues');
    assert.ok(Validation.containsValidatorKey({
        validValue: [],
        valueType: []
    }), 'still have valueType and be ok even though it doesn\'t have validValues');
    assert.ok(!Validation.containsValidatorKey(undefined), 'undefined: no validator key');
    assert.ok(!Validation.containsValidatorKey(null), 'null: no validator key');
    assert.ok(!Validation.containsValidatorKey(5), 'number: no validator key');
    assert.ok(!Validation.containsValidatorKey({
        fdsaf: true
    }), 'undefined: no validator key');
    assert.ok(!Validation.containsValidatorKey(new IOType('TestIO', {
        valueType: 'string'
    })), 'undefined: no validator key');
    assert.ok(Validation.containsValidatorKey({
        valueType: 'fdsaf'
    }), 'has valueType, even though valueType has the wrong value');
});
QUnit.test('Test getValidatorValidationError and validateValidator', (assert)=>{
    window.assert && assert.throws(()=>Validation.validateValidator({
            valueType: Array,
            // @ts-expect-error INTENTIONAL
            isValidValue: 4
        }), 'isValidValue should be function');
    window.assert && assert.ok(typeof Validation.getValidatorValidationError({
        valueType: Array,
        validValues: [
            'hi'
        ]
    }) === 'string', 'validValues contains invalid value');
    assert.ok(!Validation.getValidatorValidationError({
        valueType: 'number'
    }), 'good valueType');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        validValue: 'number'
    }), 'no validator keys supplied');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        validValue: 4
    }), 'no validator keys supplied');
    assert.ok(Validation.getValidatorValidationError({
        valueType: 'blaradysharady'
    }), 'invalid valueType string');
    assert.ok(!Validation.getValidatorValidationError({
        isValidValue: ()=>true
    }), 'isValidValue is a function');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        isValidValue: 'hi'
    }), 'isValidValue should not be string');
    assert.ok(!Validation.getValidatorValidationError({
        valueType: null
    }), 'null is valid');
    assert.ok(!Validation.getValidatorValidationError({
        valueType: [
            'number',
            null
        ]
    }), 'array of null and number is valid');
    assert.ok(!Validation.getValidatorValidationError({
        valueType: [
            'number',
            null,
            Node
        ]
    }), 'array of null and number is valid');
    assert.ok(Validation.getValidatorValidationError({
        valueType: [
            'numberf',
            null,
            Node
        ]
    }), 'numberf is not a valid valueType');
    assert.ok(!Validation.isValueValid(undefined, {
        valueType: [
            'number',
            'sstring'
        ]
    }), 'sstring is not a valid valueType');
    // @ts-expect-error
    assert.ok(!Validation.isValueValid(undefined, {
        valueType: [
            7
        ]
    }, ASSERTIONS_TRUE), '7 is not a valid valueType');
    // @ts-expect-error
    assert.ok(!Validation.isValueValid(undefined, {
        valueType: [
            'number',
            {}
        ]
    }, ASSERTIONS_TRUE), 'Object literal  is not a valid valueType');
});
QUnit.test('Test valueType: {Array.<number|null|string|function|EnumerationDeprecated>}', (assert)=>{
    assert.ok(Validation.isValueValid(null, {
        valueType: null
    }), 'null is valid');
    assert.ok(Validation.isValueValid(7, {
        valueType: [
            'number',
            null
        ]
    }), '7 is valid for null and number');
    assert.ok(Validation.isValueValid(null, {
        valueType: [
            'number',
            null
        ]
    }), 'null is valid for null and number');
    assert.ok(Validation.isValueValid(new Node(), {
        valueType: [
            'number',
            null,
            Node
        ]
    }), 'Node is valid');
    assert.ok(Validation.isValueValid(EnumerationDeprecated.byKeys([
        'ROBIN',
        'JAY',
        'WREN'
    ]), {
        valueType: [
            EnumerationDeprecated,
            null,
            Node
        ]
    }), 'Node is valid');
    assert.ok(!Validation.isValueValid('hello', {
        valueType: [
            'number',
            null,
            Node
        ]
    }), 'string not valid');
    window.assert && assert.throws(()=>validate(true, {
            valueType: [
                'number',
                'string'
            ]
        }), 'number and string do not validate boolean');
    window.assert && assert.throws(()=>validate(null, {
            valueType: [
                'number',
                'string'
            ]
        }), 'number and string do not validate null');
    window.assert && assert.throws(()=>validate(undefined, {
            valueType: [
                'number',
                'string'
            ]
        }), 'number and string do not validate undefined');
    window.assert && assert.throws(()=>validate(_.noop, {
            valueType: [
                'number',
                'string'
            ]
        }), 'number and string do not validate undefined');
    const Birds = EnumerationDeprecated.byKeys([
        'ROBIN',
        'JAY',
        'WREN'
    ]);
    window.assert && assert.throws(()=>validate(_.noop, {
            valueType: [
                Birds,
                'string'
            ]
        }), 'number and string do not validate undefined');
});
QUnit.test('Test valueType: {EnumerationDeprecated}', (assert)=>{
    const Birds = EnumerationDeprecated.byKeys([
        'ROBIN',
        'JAY',
        'WREN'
    ]);
    assert.ok(!Validation.getValidatorValidationError({
        valueType: Birds
    }), 'good valueType');
    // @ts-expect-error
    assert.ok(Validation.isValueValid(Birds.ROBIN, {
        valueType: Birds
    }), 'good value');
    assert.ok(!Validation.isValueValid(4, {
        valueType: Birds
    }), 'bad value');
});
QUnit.test('Test phetioType', (assert)=>{
    // Stub phetioType here for testing. ts-expect-errors may be able to be removed when IOType is in typescript.
    // @ts-expect-error
    assert.ok(!Validation.getValidatorValidationError({
        phetioType: {
            validator: {
                valueType: 'number'
            }
        }
    }), 'good phetioType');
    // @ts-expect-error
    assert.ok(!Validation.getValidatorValidationError({
        phetioType: {
            validator: {
                isValidValue: ()=>true
            }
        }
    }), 'good phetioType');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        phetioType: {
            notValidator: {
                isValidValue: ()=>true
            }
        }
    }), 'bad phetioType');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        phetioType: {
            validator: {
                isValidValue: 'number'
            }
        }
    }), 'bad phetioType');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        phetioType: {
            validator: {}
        }
    }), 'bad phetioType');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        phetioType: {
            validator: null
        }
    }), 'bad phetioType');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        phetioType: 'null'
    }), 'bad phetioType');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        phetioType: null
    }), 'bad phetioType');
    assert.ok(Validation.isValueValid('hello', {
        phetioType: StringIO
    }), 'string valid');
    assert.ok(!Validation.isValueValid(null, {
        phetioType: StringIO
    }), 'null not valid');
    assert.ok(!Validation.isValueValid(undefined, {
        phetioType: StringIO
    }), 'undefined not valid');
    assert.ok(Validation.isValueValid('oh hi', {
        phetioType: StringIO
    }), 'string valid');
    assert.ok(Validation.isValueValid('oh no', {
        phetioType: StringIO,
        isValidValue: (v)=>v.startsWith('o')
    }), 'string valid');
    assert.ok(!Validation.isValueValid('ho on', {
        phetioType: StringIO,
        isValidValue: (v)=>v.startsWith('o')
    }), 'string not valid');
    assert.ok(Validation.isValueValid(new Emitter(), {
        phetioType: Emitter.EmitterIO([])
    }), 'emitter is valid');
});
QUnit.test('validationMessage is presented for all validation errors', (assert)=>{
    const testContainsErrorMessage = (value, validator, validationMessage = validator.validationMessage)=>{
        const message = typeof validationMessage === 'function' ? validationMessage() : validationMessage;
        assert.ok(message, 'should have a message');
        const validationError = Validation.getValidationError(value, validator);
        assert.ok(validationError && validationError.includes(message), message);
    };
    testContainsErrorMessage(5, {
        valueType: 'boolean',
        validationMessage: 'valueType boolean, value number'
    });
    testContainsErrorMessage(true, {
        valueType: 'number',
        validationMessage: 'valueType number, value boolean'
    });
    testContainsErrorMessage(true, {
        valueType: [
            'string',
            'number'
        ],
        validationMessage: 'valueType string`,number value boolean'
    });
    testContainsErrorMessage(true, {
        valueType: [
            null,
            'number'
        ],
        validationMessage: 'valueType null,number value boolean'
    });
    testContainsErrorMessage(false, {
        validValues: [
            'hi',
            true
        ],
        validationMessage: 'validValues with value:false'
    });
    testContainsErrorMessage(5, {
        validValues: [
            'hi',
            true
        ],
        validationMessage: 'validValues with value:5'
    });
    testContainsErrorMessage(4, {
        isValidValue: (v)=>v === 3,
        validationMessage: 'isValidValue 3, value 4'
    });
    testContainsErrorMessage(4, {
        isValidValue: (v)=>v === 3,
        validationMessage: ()=>'isValidValue 3, value 4'
    });
    const myVar = 5;
    testContainsErrorMessage(4, {
        isValidValue: (v)=>v === myVar,
        validationMessage: ()=>`isValidValue ${myVar}, value 4`
    });
    testContainsErrorMessage('oh hello', {
        phetioType: Property.PropertyIO(BooleanIO),
        validationMessage: 'isValidValue 3, value string'
    });
    const ioType = new IOType('TestIO', {
        valueType: 'boolean'
    });
    const ioTypeValidationMessage = 'should be a boolean from this IOType in tests';
    ioType.validator.validationMessage = ioTypeValidationMessage;
    testContainsErrorMessage('hi', {
        phetioType: ioType
    }, ioTypeValidationMessage);
});
QUnit.test('test Validator.validators', (assert)=>{
    assert.ok(!Validation.getValidatorValidationError({
        validators: [
            {
                valueType: 'boolean'
            },
            {
                isValidValue: (v)=>v === false
            }
        ]
    }), 'correct validator');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        validators: [
            {
                valueType: 'boolean'
            },
            {
                isValidValue: 7
            }
        ]
    }), 'incorrect validator');
    // @ts-expect-error
    assert.ok(Validation.getValidatorValidationError({
        validators: [
            {
                valueType: 'boolean'
            },
            7
        ]
    }), 'incorrect validator2');
    assert.ok(Validation.getValidationError('7', {
        validators: [
            {
                valueType: 'boolean'
            },
            {
                isValidValue: (v)=>v === false
            }
        ]
    }));
    assert.ok(Validation.getValidationError(true, {
        validators: [
            {
                valueType: 'boolean'
            },
            {
                isValidValue: (v)=>v === false
            }
        ]
    }));
    assert.ok(Validation.getValidationError(undefined, {
        validators: [
            {
                valueType: 'boolean'
            },
            {
                isValidValue: (v)=>v === false
            }
        ]
    }));
    assert.ok(!Validation.getValidationError(false, {
        validators: [
            {
                valueType: 'boolean'
            },
            {
                isValidValue: (v)=>v === false
            }
        ]
    }));
});
// See similar tests in TinyProperty for valueComparisonStrategy
QUnit.test('Validator.equalsForValidationStrategy', (assert)=>{
    assert.ok(Validation.equalsForValidationStrategy(1, 1, 'reference'));
    assert.ok(Validation.equalsForValidationStrategy(1, 1));
    assert.ok(!Validation.equalsForValidationStrategy(1, '1'));
    const object = {};
    assert.ok(!Validation.equalsForValidationStrategy(object, {}, 'reference'));
    assert.ok(Validation.equalsForValidationStrategy(object, object, 'reference'));
    assert.ok(Validation.equalsForValidationStrategy({}, {}, (a, b)=>a instanceof Object && b instanceof Object));
    assert.ok(Validation.equalsForValidationStrategy(new Vector2(0, 0), new Vector2(0, 0), 'equalsFunction'));
    assert.ok(Validation.equalsForValidationStrategy(new Vector2(0, 0), Vector2.ZERO, 'equalsFunction'));
    assert.ok(!Validation.equalsForValidationStrategy(new Vector2(0, 1), new Vector2(0, 0), 'equalsFunction'));
    assert.ok(Validation.equalsForValidationStrategy(new Vector2(0, 1), new Vector2(0, 3), (a, b)=>a.x === b.x));
    assert.ok(Validation.equalsForValidationStrategy(new Vector2(0, 1), new Vector3(0, 4, 3), ()=>true));
    assert.ok(Validation.equalsForValidationStrategy({}, {}, 'lodashDeep'));
    assert.ok(Validation.equalsForValidationStrategy({
        hi: true
    }, {
        hi: true
    }, 'lodashDeep'));
    assert.ok(!Validation.equalsForValidationStrategy({
        hi: true
    }, {
        hi: true,
        other: false
    }, 'lodashDeep'));
});
// See similar tests in TinyProperty for valueComparisonStrategy
QUnit.test('equalsFunction quirks', (assert)=>{
    // DIFFERENT CONSTRUCTORS
    let MyNumber = class MyNumber {
        equals(other) {
            return this.value === other.value;
        }
        constructor(value){
            this.value = value;
        }
    };
    let MyNumberEqualsWhenSameSideOf5 = class MyNumberEqualsWhenSameSideOf5 {
        // If both are greater than or both are less than 5. Unequal if different. Equals 5 is treated as less than.
        equals(other) {
            return this.value > 5 === other.value > 5;
        }
        constructor(value){
            this.value = value;
        }
    };
    assert.ok(Validation.equalsForValidationStrategy(new MyNumber(1), new MyNumber(1), 'equalsFunction'));
    assert.ok(!Validation.equalsForValidationStrategy(new MyNumber(2), new MyNumber(1), 'equalsFunction'));
    assert.ok(Validation.equalsForValidationStrategy(new MyNumber(1), new MyNumberEqualsWhenSameSideOf5(1), 'equalsFunction'));
    assert.ok(Validation.equalsForValidationStrategy(new MyNumberEqualsWhenSameSideOf5(6), new MyNumberEqualsWhenSameSideOf5(7), 'equalsFunction'));
    assert.ok(!Validation.equalsForValidationStrategy(new MyNumberEqualsWhenSameSideOf5(3), new MyNumberEqualsWhenSameSideOf5(7), 'equalsFunction'));
    window.assert && assert.throws(()=>!Validation.equalsForValidationStrategy(new MyNumber(6), new MyNumberEqualsWhenSameSideOf5(7), 'equalsFunction'));
    //////////////////////////////////////
    // SUPPORT NULL AND UNDEFINED
    assert.ok(Validation.equalsForValidationStrategy(null, null, 'equalsFunction'));
    assert.ok(!Validation.equalsForValidationStrategy(null, undefined, 'equalsFunction'));
    assert.ok(!Validation.equalsForValidationStrategy(null, new MyNumber(3), 'equalsFunction'));
    assert.ok(!Validation.equalsForValidationStrategy(undefined, new MyNumber(3), 'equalsFunction'));
    assert.ok(!Validation.equalsForValidationStrategy(new MyNumber(3), null, 'equalsFunction'));
    assert.ok(!Validation.equalsForValidationStrategy(new MyNumber(3), undefined, 'equalsFunction'));
    window.assert && assert.throws(()=>Validation.equalsForValidationStrategy(false, 7, 'equalsFunction'));
    window.assert && assert.throws(()=>Validation.equalsForValidationStrategy(false, new MyNumber(3), 'equalsFunction'));
    window.assert && assert.throws(()=>Validation.equalsForValidationStrategy('', new MyNumber(3), 'equalsFunction'));
/////////////////////////////
});
QUnit.test('Validator.valueComparisonStrategy', (assert)=>{
    const myValueArray = [
        7,
        6,
        5
    ];
    // @ts-expect-error wrong value for valueComparisonStrategy
    assert.ok(Validation.getValidatorValidationError({
        valueComparisonStrategy: 'referfdsafdsence'
    }), 'that is not a correct valueComparisonStrategy');
    assert.ok(!Validation.getValidationError(myValueArray, {
        validators: [
            {
                validValues: [
                    myValueArray
                ],
                valueComparisonStrategy: 'reference'
            }
        ]
    }));
    assert.ok(!Validation.getValidationError(myValueArray, {
        validators: [
            {
                validValues: [
                    [
                        7,
                        6,
                        5
                    ]
                ],
                valueComparisonStrategy: 'lodashDeep'
            }
        ]
    }));
    assert.ok(Validation.getValidationError(myValueArray, {
        validators: [
            {
                validValues: [
                    [
                        7,
                        6,
                        5
                    ]
                ],
                valueComparisonStrategy: 'reference'
            }
        ]
    }), 'That isn\'t the same array!');
    window.assert && assert.throws(()=>{
        Validation.getValidationError(myValueArray, {
            validators: [
                {
                    validValues: [
                        [
                            7,
                            6,
                            5
                        ]
                    ],
                    valueComparisonStrategy: 'equalsFunction'
                }
            ]
        });
    }, 'arrays do not have an equals function');
    const sameInstanceVector = new Vector2(2, 6);
    assert.ok(!Validation.getValidationError(sameInstanceVector, {
        validators: [
            {
                validValues: [
                    new Vector2(0, 1),
                    sameInstanceVector
                ],
                valueComparisonStrategy: 'equalsFunction'
            }
        ]
    }));
    assert.ok(!Validation.getValidationError(new Vector2(0, 0), {
        validators: [
            {
                validValues: [
                    new Vector2(0, 1),
                    new Vector2(0, 0)
                ],
                valueComparisonStrategy: 'equalsFunction'
            }
        ]
    }));
    assert.ok(Validation.getValidationError(new Vector2(0, 2), {
        validators: [
            {
                validValues: [
                    new Vector2(0, 1),
                    new Vector2(0, 0)
                ],
                valueComparisonStrategy: 'equalsFunction'
            }
        ]
    }));
    assert.ok(!Validation.getValidationError(sameInstanceVector, {
        validators: [
            {
                validValues: [
                    new Vector2(0, 1),
                    sameInstanceVector
                ],
                valueComparisonStrategy: (a, b)=>a.x === b.x
            }
        ]
    }));
    assert.ok(!Validation.getValidationError(new Vector2(0, 0), {
        validators: [
            {
                validValues: [
                    new Vector2(5, 1),
                    new Vector2(0, 3)
                ],
                valueComparisonStrategy: (a, b)=>a.x === b.x
            }
        ]
    }));
    assert.ok(Validation.getValidationError(new Vector2(0, 0), {
        validators: [
            {
                validValues: [
                    new Vector2(1, 1),
                    new Vector2(2, 0)
                ],
                valueComparisonStrategy: (a, b)=>a.x === b.x
            }
        ]
    }));
    assert.ok(!Validation.equalsForValidationStrategy(new Vector2(0, 0), new Vector2(0, 0), (a, b)=>a === b));
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvVmFsaWRhdGlvblRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFFVbml0IHRlc3RzIGZvciBWYWxpZGF0b3JcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IzLmpzJztcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4vRW1pdHRlci5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZS5qcyc7XG5pbXBvcnQgVmFsaWRhdGlvbiwgeyBWYWxpZGF0b3IgfSBmcm9tICcuL1ZhbGlkYXRpb24uanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IEFTU0VSVElPTlNfVFJVRSA9IHsgYXNzZXJ0aW9uczogdHJ1ZSB9O1xuXG5RVW5pdC5tb2R1bGUoICdWYWxpZGF0b3InICk7XG5cbi8vIE5vdGUgdGhhdCBtYW55IHZhbGlkYXRpb24gdGVzdHMgYXJlIGluIFByb3BlcnR5VGVzdHNcblFVbml0LnRlc3QoICdUZXN0IHZhbGlkYXRlIGFuZCBWYWxpZGF0aW9uLmlzVmFsaWRWYWx1ZScsIGFzc2VydCA9PiB7XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB2YWxpZGF0ZSggNCwgeyB2YWxpZFZhbHVlczogWyAxLCAyLCAzIF0gfSApLCAnaW52YWxpZCBudW1iZXInICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4gdmFsaWRhdGUoICdoZWxsbycsIHsgdmFsdWVUeXBlOiBBcnJheSB9ICksICdzdHJpbmcgaXNuXFwndCBBcnJheScgKTtcblxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCAzLCB7IHZhbGlkVmFsdWVzOiBbIDEsIDIsIDMgXSB9ICkgKTtcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggW10sIHsgdmFsdWVUeXBlOiBBcnJheSB9ICkgKTtcblxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCA3LCB7IHZhbHVlVHlwZTogJ251bWJlcicsIGlzVmFsaWRWYWx1ZTogKCB2OiBudW1iZXIgKSA9PiB2ID4gNSB9ICkgKTtcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIDcsIHsgdmFsdWVUeXBlOiAnbnVtYmVyJywgaXNWYWxpZFZhbHVlOiAoIHY6IG51bWJlciApID0+IHYgPiA3IH0gKSApO1xuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggNywgeyB2YWx1ZVR5cGU6ICdudW1iZXInLCBpc1ZhbGlkVmFsdWU6ICggdjogbnVtYmVyICkgPT4gdiA8IDMgfSApICk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ1Rlc3QgY29udGFpbnNWYWxpZGF0b3JLZXknLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQub2soIFZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIHsgdmFsaWRWYWx1ZXM6IFtdIH0gKSwgJ2hhcyBrZXkgdmFsaWRWYWx1ZXMnICk7XG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIHsgc2htYWxpZFZhbHVlczogW10gfSApLCAnZG9lcyBub3QgaGF2ZSBrZXk6IHZhbGlkVmFsdWVzJyApO1xuICBhc3NlcnQub2soIFZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIHtcbiAgICB2YWxpZFZhbHVlczogW10sXG4gICAgdmFsdWVUeXBlOiBbXVxuICB9ICksICdkb2VzIGhhdmUga2V5czogdmFsdWVUeXBlIGFuZCB2YWxpZFZhbHVlcycgKTtcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmNvbnRhaW5zVmFsaWRhdG9yS2V5KCB7XG4gICAgdmFsaWRWYWx1ZTogW10sXG4gICAgdmFsdWVUeXBlOiBbXVxuICB9ICksICdzdGlsbCBoYXZlIHZhbHVlVHlwZSBhbmQgYmUgb2sgZXZlbiB0aG91Z2ggaXQgZG9lc25cXCd0IGhhdmUgdmFsaWRWYWx1ZXMnICk7XG5cbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5jb250YWluc1ZhbGlkYXRvcktleSggdW5kZWZpbmVkICksICd1bmRlZmluZWQ6IG5vIHZhbGlkYXRvciBrZXknICk7XG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIG51bGwgKSwgJ251bGw6IG5vIHZhbGlkYXRvciBrZXknICk7XG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIDUgKSwgJ251bWJlcjogbm8gdmFsaWRhdG9yIGtleScgKTtcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5jb250YWluc1ZhbGlkYXRvcktleSggeyBmZHNhZjogdHJ1ZSB9ICksICd1bmRlZmluZWQ6IG5vIHZhbGlkYXRvciBrZXknICk7XG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIG5ldyBJT1R5cGUoICdUZXN0SU8nLCB7IHZhbHVlVHlwZTogJ3N0cmluZycgfSApICksXG4gICAgJ3VuZGVmaW5lZDogbm8gdmFsaWRhdG9yIGtleScgKTtcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmNvbnRhaW5zVmFsaWRhdG9yS2V5KCB7IHZhbHVlVHlwZTogJ2Zkc2FmJyB9ICksXG4gICAgJ2hhcyB2YWx1ZVR5cGUsIGV2ZW4gdGhvdWdoIHZhbHVlVHlwZSBoYXMgdGhlIHdyb25nIHZhbHVlJyApO1xufSApO1xuXG5cblFVbml0LnRlc3QoICdUZXN0IGdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciBhbmQgdmFsaWRhdGVWYWxpZGF0b3InLCBhc3NlcnQgPT4ge1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IFZhbGlkYXRpb24udmFsaWRhdGVWYWxpZGF0b3IoIHtcbiAgICB2YWx1ZVR5cGU6IEFycmF5LFxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTFxuICAgIGlzVmFsaWRWYWx1ZTogNFxuICB9ICksICdpc1ZhbGlkVmFsdWUgc2hvdWxkIGJlIGZ1bmN0aW9uJyApO1xuXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0Lm9rKCB0eXBlb2YgVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHtcbiAgICB2YWx1ZVR5cGU6IEFycmF5LFxuICAgIHZhbGlkVmFsdWVzOiBbICdoaScgXVxuXG4gIH0gKSA9PT0gJ3N0cmluZycsICd2YWxpZFZhbHVlcyBjb250YWlucyBpbnZhbGlkIHZhbHVlJyApO1xuXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbHVlVHlwZTogJ251bWJlcicgfSApLCAnZ29vZCB2YWx1ZVR5cGUnICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbGlkVmFsdWU6ICdudW1iZXInIH0gKSwgJ25vIHZhbGlkYXRvciBrZXlzIHN1cHBsaWVkJyApO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyB2YWxpZFZhbHVlOiA0IH0gKSwgJ25vIHZhbGlkYXRvciBrZXlzIHN1cHBsaWVkJyApO1xuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbHVlVHlwZTogJ2JsYXJhZHlzaGFyYWR5JyB9ICksICdpbnZhbGlkIHZhbHVlVHlwZSBzdHJpbmcnICk7XG5cbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgaXNWYWxpZFZhbHVlOiAoKSA9PiB0cnVlIH0gKSwgJ2lzVmFsaWRWYWx1ZSBpcyBhIGZ1bmN0aW9uJyApO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyBpc1ZhbGlkVmFsdWU6ICdoaScgfSApLCAnaXNWYWxpZFZhbHVlIHNob3VsZCBub3QgYmUgc3RyaW5nJyApO1xuXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbHVlVHlwZTogbnVsbCB9ICksICdudWxsIGlzIHZhbGlkJyApO1xuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsIG51bGwgXSB9ICksXG4gICAgJ2FycmF5IG9mIG51bGwgYW5kIG51bWJlciBpcyB2YWxpZCcgKTtcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgdmFsdWVUeXBlOiBbICdudW1iZXInLCBudWxsLCBOb2RlIF0gfSApLFxuICAgICdhcnJheSBvZiBudWxsIGFuZCBudW1iZXIgaXMgdmFsaWQnICk7XG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgdmFsdWVUeXBlOiBbICdudW1iZXJmJywgbnVsbCwgTm9kZSBdIH0gKSxcbiAgICAnbnVtYmVyZiBpcyBub3QgYSB2YWxpZCB2YWx1ZVR5cGUnICk7XG5cbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIHVuZGVmaW5lZCwgeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsICdzc3RyaW5nJyBdIH0gKSxcbiAgICAnc3N0cmluZyBpcyBub3QgYSB2YWxpZCB2YWx1ZVR5cGUnICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggdW5kZWZpbmVkLCB7IHZhbHVlVHlwZTogWyA3IF0gfSwgQVNTRVJUSU9OU19UUlVFICksXG4gICAgJzcgaXMgbm90IGEgdmFsaWQgdmFsdWVUeXBlJyApO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIHVuZGVmaW5lZCwgeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsIHt9IF0gfSwgQVNTRVJUSU9OU19UUlVFICksXG4gICAgJ09iamVjdCBsaXRlcmFsICBpcyBub3QgYSB2YWxpZCB2YWx1ZVR5cGUnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0IHZhbHVlVHlwZToge0FycmF5LjxudW1iZXJ8bnVsbHxzdHJpbmd8ZnVuY3Rpb258RW51bWVyYXRpb25EZXByZWNhdGVkPn0nLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCBudWxsLCB7IHZhbHVlVHlwZTogbnVsbCB9ICksICdudWxsIGlzIHZhbGlkJyApO1xuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCA3LCB7IHZhbHVlVHlwZTogWyAnbnVtYmVyJywgbnVsbCBdIH0gKSwgJzcgaXMgdmFsaWQgZm9yIG51bGwgYW5kIG51bWJlcicgKTtcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggbnVsbCwgeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsIG51bGwgXSB9ICksXG4gICAgJ251bGwgaXMgdmFsaWQgZm9yIG51bGwgYW5kIG51bWJlcicgKTtcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggbmV3IE5vZGUoKSwgeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsIG51bGwsIE5vZGUgXSB9ICksICdOb2RlIGlzIHZhbGlkJyApO1xuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbICdST0JJTicsICdKQVknLCAnV1JFTicgXSApLCB7XG4gICAgdmFsdWVUeXBlOiBbIEVudW1lcmF0aW9uRGVwcmVjYXRlZCwgbnVsbCwgTm9kZSBdXG4gIH0gKSwgJ05vZGUgaXMgdmFsaWQnICk7XG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCAnaGVsbG8nLCB7IHZhbHVlVHlwZTogWyAnbnVtYmVyJywgbnVsbCwgTm9kZSBdIH0gKSwgJ3N0cmluZyBub3QgdmFsaWQnICk7XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB2YWxpZGF0ZSggdHJ1ZSwgeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsICdzdHJpbmcnIF0gfSApLFxuICAgICdudW1iZXIgYW5kIHN0cmluZyBkbyBub3QgdmFsaWRhdGUgYm9vbGVhbicgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB2YWxpZGF0ZSggbnVsbCwgeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsICdzdHJpbmcnIF0gfSApLFxuICAgICdudW1iZXIgYW5kIHN0cmluZyBkbyBub3QgdmFsaWRhdGUgbnVsbCcgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB2YWxpZGF0ZSggdW5kZWZpbmVkLCB7IHZhbHVlVHlwZTogWyAnbnVtYmVyJywgJ3N0cmluZycgXSB9ICksXG4gICAgJ251bWJlciBhbmQgc3RyaW5nIGRvIG5vdCB2YWxpZGF0ZSB1bmRlZmluZWQnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4gdmFsaWRhdGUoIF8ubm9vcCwgeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsICdzdHJpbmcnIF0gfSApLFxuICAgICdudW1iZXIgYW5kIHN0cmluZyBkbyBub3QgdmFsaWRhdGUgdW5kZWZpbmVkJyApO1xuXG4gIGNvbnN0IEJpcmRzID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnUk9CSU4nLCAnSkFZJywgJ1dSRU4nIF0gKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB2YWxpZGF0ZSggXy5ub29wLCB7IHZhbHVlVHlwZTogWyBCaXJkcywgJ3N0cmluZycgXSB9ICksXG4gICAgJ251bWJlciBhbmQgc3RyaW5nIGRvIG5vdCB2YWxpZGF0ZSB1bmRlZmluZWQnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0IHZhbHVlVHlwZToge0VudW1lcmF0aW9uRGVwcmVjYXRlZH0nLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IEJpcmRzID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnUk9CSU4nLCAnSkFZJywgJ1dSRU4nIF0gKTtcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgdmFsdWVUeXBlOiBCaXJkcyB9ICksICdnb29kIHZhbHVlVHlwZScgKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIEJpcmRzLlJPQklOLCB7IHZhbHVlVHlwZTogQmlyZHMgfSApLCAnZ29vZCB2YWx1ZScgKTtcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIDQsIHsgdmFsdWVUeXBlOiBCaXJkcyB9ICksICdiYWQgdmFsdWUnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0IHBoZXRpb1R5cGUnLCBhc3NlcnQgPT4ge1xuXG4gIC8vIFN0dWIgcGhldGlvVHlwZSBoZXJlIGZvciB0ZXN0aW5nLiB0cy1leHBlY3QtZXJyb3JzIG1heSBiZSBhYmxlIHRvIGJlIHJlbW92ZWQgd2hlbiBJT1R5cGUgaXMgaW4gdHlwZXNjcmlwdC5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyBwaGV0aW9UeXBlOiB7IHZhbGlkYXRvcjogeyB2YWx1ZVR5cGU6ICdudW1iZXInIH0gfSB9ICksXG4gICAgJ2dvb2QgcGhldGlvVHlwZScgKTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyBwaGV0aW9UeXBlOiB7IHZhbGlkYXRvcjogeyBpc1ZhbGlkVmFsdWU6ICgpID0+IHRydWUgfSB9IH0gKSxcbiAgICAnZ29vZCBwaGV0aW9UeXBlJyApO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgcGhldGlvVHlwZTogeyBub3RWYWxpZGF0b3I6IHsgaXNWYWxpZFZhbHVlOiAoKSA9PiB0cnVlIH0gfSB9ICksXG4gICAgJ2JhZCBwaGV0aW9UeXBlJyApO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgcGhldGlvVHlwZTogeyB2YWxpZGF0b3I6IHsgaXNWYWxpZFZhbHVlOiAnbnVtYmVyJyB9IH0gfSApLFxuICAgICdiYWQgcGhldGlvVHlwZScgKTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHBoZXRpb1R5cGU6IHsgdmFsaWRhdG9yOiB7fSB9IH0gKSwgJ2JhZCBwaGV0aW9UeXBlJyApO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgcGhldGlvVHlwZTogeyB2YWxpZGF0b3I6IG51bGwgfSB9ICksICdiYWQgcGhldGlvVHlwZScgKTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHBoZXRpb1R5cGU6ICdudWxsJyB9ICksICdiYWQgcGhldGlvVHlwZScgKTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHBoZXRpb1R5cGU6IG51bGwgfSApLCAnYmFkIHBoZXRpb1R5cGUnICk7XG5cbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggJ2hlbGxvJywgeyBwaGV0aW9UeXBlOiBTdHJpbmdJTyB9ICksICdzdHJpbmcgdmFsaWQnICk7XG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCBudWxsLCB7IHBoZXRpb1R5cGU6IFN0cmluZ0lPIH0gKSwgJ251bGwgbm90IHZhbGlkJyApO1xuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggdW5kZWZpbmVkLCB7IHBoZXRpb1R5cGU6IFN0cmluZ0lPIH0gKSwgJ3VuZGVmaW5lZCBub3QgdmFsaWQnICk7XG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoICdvaCBoaScsIHsgcGhldGlvVHlwZTogU3RyaW5nSU8gfSApLCAnc3RyaW5nIHZhbGlkJyApO1xuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCAnb2ggbm8nLCB7XG4gICAgcGhldGlvVHlwZTogU3RyaW5nSU8sXG4gICAgaXNWYWxpZFZhbHVlOiB2ID0+IHYuc3RhcnRzV2l0aCggJ28nIClcbiAgfSApLCAnc3RyaW5nIHZhbGlkJyApO1xuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggJ2hvIG9uJywge1xuICAgIHBoZXRpb1R5cGU6IFN0cmluZ0lPLFxuICAgIGlzVmFsaWRWYWx1ZTogdiA9PiB2LnN0YXJ0c1dpdGgoICdvJyApXG4gIH0gKSwgJ3N0cmluZyBub3QgdmFsaWQnICk7XG5cbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggbmV3IEVtaXR0ZXIoKSwgeyBwaGV0aW9UeXBlOiBFbWl0dGVyLkVtaXR0ZXJJTyggW10gKSB9ICksXG4gICAgJ2VtaXR0ZXIgaXMgdmFsaWQnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICd2YWxpZGF0aW9uTWVzc2FnZSBpcyBwcmVzZW50ZWQgZm9yIGFsbCB2YWxpZGF0aW9uIGVycm9ycycsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgdGVzdENvbnRhaW5zRXJyb3JNZXNzYWdlID0gKCB2YWx1ZTogbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZyB8IG51bWJlcltdIHwgQXJyYXk8bnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yOiBWYWxpZGF0b3IsIHZhbGlkYXRpb25NZXNzYWdlID0gdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICkgPT4ge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSB0eXBlb2YgdmFsaWRhdGlvbk1lc3NhZ2UgPT09ICdmdW5jdGlvbicgPyB2YWxpZGF0aW9uTWVzc2FnZSgpIDogdmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgYXNzZXJ0Lm9rKCBtZXNzYWdlLCAnc2hvdWxkIGhhdmUgYSBtZXNzYWdlJyApO1xuICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvciA9IFZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCB2YWx1ZSwgdmFsaWRhdG9yICk7XG4gICAgYXNzZXJ0Lm9rKCB2YWxpZGF0aW9uRXJyb3IgJiYgdmFsaWRhdGlvbkVycm9yLmluY2x1ZGVzKCBtZXNzYWdlISApLCBtZXNzYWdlICk7XG4gIH07XG5cbiAgdGVzdENvbnRhaW5zRXJyb3JNZXNzYWdlKCA1LCB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nLCB2YWxpZGF0aW9uTWVzc2FnZTogJ3ZhbHVlVHlwZSBib29sZWFuLCB2YWx1ZSBudW1iZXInIH0gKTtcbiAgdGVzdENvbnRhaW5zRXJyb3JNZXNzYWdlKCB0cnVlLCB7IHZhbHVlVHlwZTogJ251bWJlcicsIHZhbGlkYXRpb25NZXNzYWdlOiAndmFsdWVUeXBlIG51bWJlciwgdmFsdWUgYm9vbGVhbicgfSApO1xuICB0ZXN0Q29udGFpbnNFcnJvck1lc3NhZ2UoIHRydWUsIHsgdmFsdWVUeXBlOiBbICdzdHJpbmcnLCAnbnVtYmVyJyBdLCB2YWxpZGF0aW9uTWVzc2FnZTogJ3ZhbHVlVHlwZSBzdHJpbmdgLG51bWJlciB2YWx1ZSBib29sZWFuJyB9ICk7XG4gIHRlc3RDb250YWluc0Vycm9yTWVzc2FnZSggdHJ1ZSwgeyB2YWx1ZVR5cGU6IFsgbnVsbCwgJ251bWJlcicgXSwgdmFsaWRhdGlvbk1lc3NhZ2U6ICd2YWx1ZVR5cGUgbnVsbCxudW1iZXIgdmFsdWUgYm9vbGVhbicgfSApO1xuICB0ZXN0Q29udGFpbnNFcnJvck1lc3NhZ2UoIGZhbHNlLCB7IHZhbGlkVmFsdWVzOiBbICdoaScsIHRydWUgXSwgdmFsaWRhdGlvbk1lc3NhZ2U6ICd2YWxpZFZhbHVlcyB3aXRoIHZhbHVlOmZhbHNlJyB9ICk7XG4gIHRlc3RDb250YWluc0Vycm9yTWVzc2FnZSggNSwgeyB2YWxpZFZhbHVlczogWyAnaGknLCB0cnVlIF0sIHZhbGlkYXRpb25NZXNzYWdlOiAndmFsaWRWYWx1ZXMgd2l0aCB2YWx1ZTo1JyB9ICk7XG4gIHRlc3RDb250YWluc0Vycm9yTWVzc2FnZSggNCwgeyBpc1ZhbGlkVmFsdWU6IHYgPT4gdiA9PT0gMywgdmFsaWRhdGlvbk1lc3NhZ2U6ICdpc1ZhbGlkVmFsdWUgMywgdmFsdWUgNCcgfSApO1xuICB0ZXN0Q29udGFpbnNFcnJvck1lc3NhZ2UoIDQsIHsgaXNWYWxpZFZhbHVlOiB2ID0+IHYgPT09IDMsIHZhbGlkYXRpb25NZXNzYWdlOiAoKSA9PiAnaXNWYWxpZFZhbHVlIDMsIHZhbHVlIDQnIH0gKTtcbiAgY29uc3QgbXlWYXIgPSA1O1xuICB0ZXN0Q29udGFpbnNFcnJvck1lc3NhZ2UoIDQsIHsgaXNWYWxpZFZhbHVlOiB2ID0+IHYgPT09IG15VmFyLCB2YWxpZGF0aW9uTWVzc2FnZTogKCkgPT4gYGlzVmFsaWRWYWx1ZSAke215VmFyfSwgdmFsdWUgNGAgfSApO1xuICB0ZXN0Q29udGFpbnNFcnJvck1lc3NhZ2UoICdvaCBoZWxsbycsIHsgcGhldGlvVHlwZTogUHJvcGVydHkuUHJvcGVydHlJTyggQm9vbGVhbklPICksIHZhbGlkYXRpb25NZXNzYWdlOiAnaXNWYWxpZFZhbHVlIDMsIHZhbHVlIHN0cmluZycgfSApO1xuXG4gIGNvbnN0IGlvVHlwZSA9IG5ldyBJT1R5cGUoICdUZXN0SU8nLCB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH0gKTtcbiAgY29uc3QgaW9UeXBlVmFsaWRhdGlvbk1lc3NhZ2UgPSAnc2hvdWxkIGJlIGEgYm9vbGVhbiBmcm9tIHRoaXMgSU9UeXBlIGluIHRlc3RzJztcblxuICBpb1R5cGUudmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlID0gaW9UeXBlVmFsaWRhdGlvbk1lc3NhZ2U7XG4gIHRlc3RDb250YWluc0Vycm9yTWVzc2FnZSggJ2hpJywgeyBwaGV0aW9UeXBlOiBpb1R5cGUgfSwgaW9UeXBlVmFsaWRhdGlvbk1lc3NhZ2UgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3Rlc3QgVmFsaWRhdG9yLnZhbGlkYXRvcnMnLCBhc3NlcnQgPT4ge1xuXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbGlkYXRvcnM6IFsgeyB2YWx1ZVR5cGU6ICdib29sZWFuJyB9LCB7IGlzVmFsaWRWYWx1ZTogdiA9PiB2ID09PSBmYWxzZSB9IF0gfSApLCAnY29ycmVjdCB2YWxpZGF0b3InICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbGlkYXRvcnM6IFsgeyB2YWx1ZVR5cGU6ICdib29sZWFuJyB9LCB7IGlzVmFsaWRWYWx1ZTogNyB9IF0gfSApLCAnaW5jb3JyZWN0IHZhbGlkYXRvcicgKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgdmFsaWRhdG9yczogWyB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH0sIDcgXSB9ICksICdpbmNvcnJlY3QgdmFsaWRhdG9yMicgKTtcblxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCAnNycsIHsgdmFsaWRhdG9yczogWyB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH0sIHsgaXNWYWxpZFZhbHVlOiB2ID0+IHYgPT09IGZhbHNlIH0gXSB9ICkgKTtcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggdHJ1ZSwgeyB2YWxpZGF0b3JzOiBbIHsgdmFsdWVUeXBlOiAnYm9vbGVhbicgfSwgeyBpc1ZhbGlkVmFsdWU6IHYgPT4gdiA9PT0gZmFsc2UgfSBdIH0gKSApO1xuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCB1bmRlZmluZWQsIHsgdmFsaWRhdG9yczogWyB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH0sIHsgaXNWYWxpZFZhbHVlOiB2ID0+IHYgPT09IGZhbHNlIH0gXSB9ICkgKTtcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIGZhbHNlLCB7IHZhbGlkYXRvcnM6IFsgeyB2YWx1ZVR5cGU6ICdib29sZWFuJyB9LCB7IGlzVmFsaWRWYWx1ZTogdiA9PiB2ID09PSBmYWxzZSB9IF0gfSApICk7XG59ICk7XG5cbi8vIFNlZSBzaW1pbGFyIHRlc3RzIGluIFRpbnlQcm9wZXJ0eSBmb3IgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3lcblFVbml0LnRlc3QoICdWYWxpZGF0b3IuZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5JywgYXNzZXJ0ID0+IHtcblxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5KCAxLCAxLCAncmVmZXJlbmNlJyApICk7XG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3koIDEsIDEgKSApO1xuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneTxJbnRlbnRpb25hbEFueT4oIDEsICcxJyApICk7XG4gIGNvbnN0IG9iamVjdCA9IHt9O1xuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneTxJbnRlbnRpb25hbEFueT4oIG9iamVjdCwge30sICdyZWZlcmVuY2UnICkgKTtcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneTxJbnRlbnRpb25hbEFueT4oIG9iamVjdCwgb2JqZWN0LCAncmVmZXJlbmNlJyApICk7XG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3k8SW50ZW50aW9uYWxBbnk+KCB7fSwge30sICggYSwgYiApID0+ICggYSBpbnN0YW5jZW9mIE9iamVjdCAmJiBiIGluc3RhbmNlb2YgT2JqZWN0ICkgKSApO1xuXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3koIG5ldyBWZWN0b3IyKCAwLCAwICksIG5ldyBWZWN0b3IyKCAwLCAwICksICdlcXVhbHNGdW5jdGlvbicgKSApO1xuXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3koIG5ldyBWZWN0b3IyKCAwLCAwICksIFZlY3RvcjIuWkVSTywgJ2VxdWFsc0Z1bmN0aW9uJyApICk7XG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5KCBuZXcgVmVjdG9yMiggMCwgMSApLCBuZXcgVmVjdG9yMiggMCwgMCApLCAnZXF1YWxzRnVuY3Rpb24nICkgKTtcblxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5KCBuZXcgVmVjdG9yMiggMCwgMSApLCBuZXcgVmVjdG9yMiggMCwgMyApLCAoIGEsIGIgKSA9PiBhLnggPT09IGIueCApICk7XG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3k8SW50ZW50aW9uYWxBbnk+KCBuZXcgVmVjdG9yMiggMCwgMSApLCBuZXcgVmVjdG9yMyggMCwgNCwgMyApLCAoKSA9PiB0cnVlICkgKTtcblxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5KCB7fSwge30sICdsb2Rhc2hEZWVwJyApICk7XG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3koIHsgaGk6IHRydWUgfSwgeyBoaTogdHJ1ZSB9LCAnbG9kYXNoRGVlcCcgKSApO1xuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneSggeyBoaTogdHJ1ZSB9LCB7IGhpOiB0cnVlLCBvdGhlcjogZmFsc2UgfSwgJ2xvZGFzaERlZXAnICkgKTtcbn0gKTtcblxuXG4vLyBTZWUgc2ltaWxhciB0ZXN0cyBpbiBUaW55UHJvcGVydHkgZm9yIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5XG5RVW5pdC50ZXN0KCAnZXF1YWxzRnVuY3Rpb24gcXVpcmtzJywgYXNzZXJ0ID0+IHtcblxuICAvLyBESUZGRVJFTlQgQ09OU1RSVUNUT1JTXG4gIGNsYXNzIE15TnVtYmVyIHtcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoIHB1YmxpYyByZWFkb25seSB2YWx1ZTogbnVtYmVyICkge31cblxuICAgIHB1YmxpYyBlcXVhbHMoIG90aGVyOiB7IHZhbHVlOiBudW1iZXIgfSApOiBib29sZWFuIHsgcmV0dXJuIHRoaXMudmFsdWUgPT09IG90aGVyLnZhbHVlO31cbiAgfVxuXG4gIGNsYXNzIE15TnVtYmVyRXF1YWxzV2hlblNhbWVTaWRlT2Y1IHtcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoIHB1YmxpYyByZWFkb25seSB2YWx1ZTogbnVtYmVyICkge31cblxuICAgIC8vIElmIGJvdGggYXJlIGdyZWF0ZXIgdGhhbiBvciBib3RoIGFyZSBsZXNzIHRoYW4gNS4gVW5lcXVhbCBpZiBkaWZmZXJlbnQuIEVxdWFscyA1IGlzIHRyZWF0ZWQgYXMgbGVzcyB0aGFuLlxuICAgIHB1YmxpYyBlcXVhbHMoIG90aGVyOiB7IHZhbHVlOiBudW1iZXIgfSApOiBib29sZWFuIHsgcmV0dXJuIHRoaXMudmFsdWUgPiA1ID09PSBvdGhlci52YWx1ZSA+IDU7fVxuICB9XG5cbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneTxJbnRlbnRpb25hbEFueT4oIG5ldyBNeU51bWJlciggMSApLCBuZXcgTXlOdW1iZXIoIDEgKSwgJ2VxdWFsc0Z1bmN0aW9uJyApICk7XG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5PEludGVudGlvbmFsQW55PiggbmV3IE15TnVtYmVyKCAyICksIG5ldyBNeU51bWJlciggMSApLCAnZXF1YWxzRnVuY3Rpb24nICkgKTtcblxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5PEludGVudGlvbmFsQW55PihcbiAgICBuZXcgTXlOdW1iZXIoIDEgKSxcbiAgICBuZXcgTXlOdW1iZXJFcXVhbHNXaGVuU2FtZVNpZGVPZjUoIDEgKSxcbiAgICAnZXF1YWxzRnVuY3Rpb24nICkgKTtcblxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5PEludGVudGlvbmFsQW55PihcbiAgICBuZXcgTXlOdW1iZXJFcXVhbHNXaGVuU2FtZVNpZGVPZjUoIDYgKSxcbiAgICBuZXcgTXlOdW1iZXJFcXVhbHNXaGVuU2FtZVNpZGVPZjUoIDcgKSxcbiAgICAnZXF1YWxzRnVuY3Rpb24nICkgKTtcblxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneTxJbnRlbnRpb25hbEFueT4oXG4gICAgbmV3IE15TnVtYmVyRXF1YWxzV2hlblNhbWVTaWRlT2Y1KCAzICksXG4gICAgbmV3IE15TnVtYmVyRXF1YWxzV2hlblNhbWVTaWRlT2Y1KCA3ICksXG4gICAgJ2VxdWFsc0Z1bmN0aW9uJyApICk7XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiAhVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3k8SW50ZW50aW9uYWxBbnk+KFxuICAgIG5ldyBNeU51bWJlciggNiApLFxuICAgIG5ldyBNeU51bWJlckVxdWFsc1doZW5TYW1lU2lkZU9mNSggNyApLFxuICAgICdlcXVhbHNGdW5jdGlvbicgKSApO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIFNVUFBPUlQgTlVMTCBBTkQgVU5ERUZJTkVEXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3k8SW50ZW50aW9uYWxBbnk+KCBudWxsLCBudWxsLCAnZXF1YWxzRnVuY3Rpb24nICkgKTtcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3k8SW50ZW50aW9uYWxBbnk+KCBudWxsLCB1bmRlZmluZWQsICdlcXVhbHNGdW5jdGlvbicgKSApO1xuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneTxJbnRlbnRpb25hbEFueT4oIG51bGwsIG5ldyBNeU51bWJlciggMyApLCAnZXF1YWxzRnVuY3Rpb24nICkgKTtcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3k8SW50ZW50aW9uYWxBbnk+KCB1bmRlZmluZWQsIG5ldyBNeU51bWJlciggMyApLCAnZXF1YWxzRnVuY3Rpb24nICkgKTtcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3k8SW50ZW50aW9uYWxBbnk+KCBuZXcgTXlOdW1iZXIoIDMgKSwgbnVsbCwgJ2VxdWFsc0Z1bmN0aW9uJyApICk7XG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5PEludGVudGlvbmFsQW55PiggbmV3IE15TnVtYmVyKCAzICksIHVuZGVmaW5lZCwgJ2VxdWFsc0Z1bmN0aW9uJyApICk7XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiBWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneTxJbnRlbnRpb25hbEFueT4oIGZhbHNlLCA3LCAnZXF1YWxzRnVuY3Rpb24nICkgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiBWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneTxJbnRlbnRpb25hbEFueT4oIGZhbHNlLCBuZXcgTXlOdW1iZXIoIDMgKSwgJ2VxdWFsc0Z1bmN0aW9uJyApICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4gVmFsaWRhdGlvbi5lcXVhbHNGb3JWYWxpZGF0aW9uU3RyYXRlZ3k8SW50ZW50aW9uYWxBbnk+KCAnJywgbmV3IE15TnVtYmVyKCAzICksICdlcXVhbHNGdW5jdGlvbicgKSApO1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVmFsaWRhdG9yLnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5JywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCBteVZhbHVlQXJyYXkgPSBbIDcsIDYsIDUgXTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHdyb25nIHZhbHVlIGZvciB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneVxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAncmVmZXJmZHNhZmRzZW5jZScgfSApLFxuICAgICd0aGF0IGlzIG5vdCBhIGNvcnJlY3QgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3knICk7XG5cbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIG15VmFsdWVBcnJheSwge1xuICAgIHZhbGlkYXRvcnM6IFsgeyB2YWxpZFZhbHVlczogWyBteVZhbHVlQXJyYXkgXSwgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdyZWZlcmVuY2UnIH0gXVxuICB9ICkgKTtcblxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggbXlWYWx1ZUFycmF5LCB7XG4gICAgdmFsaWRhdG9yczogWyB7IHZhbGlkVmFsdWVzOiBbIFsgNywgNiwgNSBdIF0sIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnbG9kYXNoRGVlcCcgfSBdXG4gIH0gKSApO1xuXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIG15VmFsdWVBcnJheSwge1xuICAgIHZhbGlkYXRvcnM6IFsgeyB2YWxpZFZhbHVlczogWyBbIDcsIDYsIDUgXSBdLCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ3JlZmVyZW5jZScgfSBdXG4gIH0gKSwgJ1RoYXQgaXNuXFwndCB0aGUgc2FtZSBhcnJheSEnICk7XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIG15VmFsdWVBcnJheSwge1xuICAgICAgdmFsaWRhdG9yczogWyB7IHZhbGlkVmFsdWVzOiBbIFsgNywgNiwgNSBdIF0sIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnZXF1YWxzRnVuY3Rpb24nIH0gXVxuICAgIH0gKTtcbiAgfSwgJ2FycmF5cyBkbyBub3QgaGF2ZSBhbiBlcXVhbHMgZnVuY3Rpb24nICk7XG5cbiAgY29uc3Qgc2FtZUluc3RhbmNlVmVjdG9yID0gbmV3IFZlY3RvcjIoIDIsIDYgKTtcblxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggc2FtZUluc3RhbmNlVmVjdG9yLCB7XG4gICAgdmFsaWRhdG9yczogWyB7IHZhbGlkVmFsdWVzOiBbIG5ldyBWZWN0b3IyKCAwLCAxICksIHNhbWVJbnN0YW5jZVZlY3RvciBdLCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJyB9IF1cbiAgfSApICk7XG5cbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIG5ldyBWZWN0b3IyKCAwLCAwICksIHtcbiAgICB2YWxpZGF0b3JzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgbmV3IFZlY3RvcjIoIDAsIDEgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSBdLCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJyB9IF1cbiAgfSApICk7XG5cbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggbmV3IFZlY3RvcjIoIDAsIDIgKSwge1xuICAgIHZhbGlkYXRvcnM6IFsgeyB2YWxpZFZhbHVlczogWyBuZXcgVmVjdG9yMiggMCwgMSApLCBuZXcgVmVjdG9yMiggMCwgMCApIF0sIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnZXF1YWxzRnVuY3Rpb24nIH0gXVxuICB9ICkgKTtcblxuXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCBzYW1lSW5zdGFuY2VWZWN0b3IsIHtcbiAgICB2YWxpZGF0b3JzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgbmV3IFZlY3RvcjIoIDAsIDEgKSwgc2FtZUluc3RhbmNlVmVjdG9yIF0sIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAoIGEsIGIgKSA9PiBhLnggPT09IGIueCB9IF1cbiAgfSApICk7XG5cbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIG5ldyBWZWN0b3IyKCAwLCAwICksIHtcbiAgICB2YWxpZGF0b3JzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgbmV3IFZlY3RvcjIoIDUsIDEgKSwgbmV3IFZlY3RvcjIoIDAsIDMgKSBdLCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogKCBhLCBiICkgPT4gYS54ID09PSBiLnggfSBdXG4gIH0gKSApO1xuXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIG5ldyBWZWN0b3IyKCAwLCAwICksIHtcbiAgICB2YWxpZGF0b3JzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgbmV3IFZlY3RvcjIoIDEsIDEgKSwgbmV3IFZlY3RvcjIoIDIsIDAgKSBdLCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogKCBhLCBiICkgPT4gYS54ID09PSBiLnggfSBdXG4gIH0gKSApO1xuXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5PHVua25vd24+KCBuZXcgVmVjdG9yMiggMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMCApLCAoIGEsIGIgKSA9PiBhID09PSBiICkgKTtcbn0gKTsiXSwibmFtZXMiOlsiVmVjdG9yMiIsIlZlY3RvcjMiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJOb2RlIiwiQm9vbGVhbklPIiwiSU9UeXBlIiwiU3RyaW5nSU8iLCJFbWl0dGVyIiwiUHJvcGVydHkiLCJ2YWxpZGF0ZSIsIlZhbGlkYXRpb24iLCJBU1NFUlRJT05TX1RSVUUiLCJhc3NlcnRpb25zIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwid2luZG93IiwidGhyb3dzIiwidmFsaWRWYWx1ZXMiLCJ2YWx1ZVR5cGUiLCJBcnJheSIsIm9rIiwiaXNWYWx1ZVZhbGlkIiwiaXNWYWxpZFZhbHVlIiwidiIsImNvbnRhaW5zVmFsaWRhdG9yS2V5Iiwic2htYWxpZFZhbHVlcyIsInZhbGlkVmFsdWUiLCJ1bmRlZmluZWQiLCJmZHNhZiIsInZhbGlkYXRlVmFsaWRhdG9yIiwiZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yIiwiYnlLZXlzIiwiXyIsIm5vb3AiLCJCaXJkcyIsIlJPQklOIiwicGhldGlvVHlwZSIsInZhbGlkYXRvciIsIm5vdFZhbGlkYXRvciIsInN0YXJ0c1dpdGgiLCJFbWl0dGVySU8iLCJ0ZXN0Q29udGFpbnNFcnJvck1lc3NhZ2UiLCJ2YWx1ZSIsInZhbGlkYXRpb25NZXNzYWdlIiwibWVzc2FnZSIsInZhbGlkYXRpb25FcnJvciIsImdldFZhbGlkYXRpb25FcnJvciIsImluY2x1ZGVzIiwibXlWYXIiLCJQcm9wZXJ0eUlPIiwiaW9UeXBlIiwiaW9UeXBlVmFsaWRhdGlvbk1lc3NhZ2UiLCJ2YWxpZGF0b3JzIiwiZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5Iiwib2JqZWN0IiwiYSIsImIiLCJPYmplY3QiLCJaRVJPIiwieCIsImhpIiwib3RoZXIiLCJNeU51bWJlciIsImVxdWFscyIsIk15TnVtYmVyRXF1YWxzV2hlblNhbWVTaWRlT2Y1IiwibXlWYWx1ZUFycmF5IiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJzYW1lSW5zdGFuY2VWZWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSwwQkFBMEI7QUFDOUMsT0FBT0MsYUFBYSwwQkFBMEI7QUFDOUMsT0FBT0MsMkJBQTJCLDhDQUE4QztBQUVoRixTQUFTQyxJQUFJLFFBQVEsOEJBQThCO0FBQ25ELE9BQU9DLGVBQWUscUNBQXFDO0FBQzNELE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELE9BQU9DLGFBQWEsZUFBZTtBQUNuQyxPQUFPQyxjQUFjLGdCQUFnQjtBQUNyQyxPQUFPQyxjQUFjLGdCQUFnQjtBQUNyQyxPQUFPQyxnQkFBK0Isa0JBQWtCO0FBRXhELFlBQVk7QUFDWixNQUFNQyxrQkFBa0I7SUFBRUMsWUFBWTtBQUFLO0FBRTNDQyxNQUFNQyxNQUFNLENBQUU7QUFFZCx1REFBdUQ7QUFDdkRELE1BQU1FLElBQUksQ0FBRSw2Q0FBNkNDLENBQUFBO0lBRXZEQyxPQUFPRCxNQUFNLElBQUlBLE9BQU9FLE1BQU0sQ0FBRSxJQUFNVCxTQUFVLEdBQUc7WUFBRVUsYUFBYTtnQkFBRTtnQkFBRztnQkFBRzthQUFHO1FBQUMsSUFBSztJQUNuRkYsT0FBT0QsTUFBTSxJQUFJQSxPQUFPRSxNQUFNLENBQUUsSUFBTVQsU0FBVSxTQUFTO1lBQUVXLFdBQVdDO1FBQU0sSUFBSztJQUVqRkwsT0FBT00sRUFBRSxDQUFFWixXQUFXYSxZQUFZLENBQUUsR0FBRztRQUFFSixhQUFhO1lBQUU7WUFBRztZQUFHO1NBQUc7SUFBQztJQUNsRUgs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