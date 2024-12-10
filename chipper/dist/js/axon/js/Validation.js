// Copyright 2019-2024, University of Colorado Boulder
/**
 * The definition file for "validators" used to validate values. This file holds associated logic that validates the
 * schema of the "validator" object, as well as testing if a value adheres to the restrictions provided by a validator.
 * See validate.js for usage with assertions to check that values are valid.
 *
 * Examples:
 *
 * A Validator that only accepts number values:
 * { valueType: 'number' }
 *
 * A Validator that only accepts the numbers "2" or "3":
 * { valueType: 'number', validValues: [ 2, 3 ] }
 *
 * A Validator that accepts any Object:
 * { valueType: Object }
 *
 * A Validator that accepts EnumerationDeprecated values (NOTE! This is deprecated, use the new class-based enumeration pattern as the valueType):
 * { valueType: MyEnumeration }
 * and/or
 * { validValues: MyEnumeration.VALUES }
 *
 * A Validator that accepts a string or a number greater than 2:
 * { isValidValue: value => { typeof value === 'string' || (typeof value === 'number' && value > 2)} }
 *
 * A Validator for a number that should be an even number greater than 10
 * { valueType: 'number', validators: [ { isValidValue: v => v > 10 }, { isValidValue: v => v%2 === 0 }] }
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import EnumerationDeprecated from '../../phet-core/js/EnumerationDeprecated.js';
import optionize from '../../phet-core/js/optionize.js';
import axon from './axon.js';
const TYPEOF_STRINGS = [
    'string',
    'number',
    'boolean',
    'function'
];
// Key names are verbose so this can be mixed into other contexts like AXON/Property. `undefined` and `null` have the
// same semantics so that we can use this feature without having extend and allocate new objects at every validation.
const VALIDATOR_KEYS = [
    'valueType',
    'validValues',
    'valueComparisonStrategy',
    'isValidValue',
    'phetioType',
    'validators'
];
let Validation = class Validation {
    /**
   * @returns an error string if incorrect, otherwise null if valid
   */ static getValidatorValidationError(validator) {
        if (!(validator instanceof Object)) {
            // There won't be a validationMessage on a non-object
            return 'validator must be an Object';
        }
        if (!(validator.hasOwnProperty('isValidValue') || validator.hasOwnProperty('valueType') || validator.hasOwnProperty('validValues') || validator.hasOwnProperty('valueComparisonStrategy') || validator.hasOwnProperty('phetioType') || validator.hasOwnProperty('validators'))) {
            return this.combineErrorMessages(`validator must have at least one of: ${VALIDATOR_KEYS.join(',')}`, validator.validationMessage);
        }
        if (validator.hasOwnProperty('valueType')) {
            const valueTypeValidationError = Validation.getValueOrElementTypeValidationError(validator.valueType);
            if (valueTypeValidationError) {
                return this.combineErrorMessages(`Invalid valueType: ${validator.valueType}, error: ${valueTypeValidationError}`, validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('isValidValue')) {
            if (!(typeof validator.isValidValue === 'function' || validator.isValidValue === null || validator.isValidValue === undefined)) {
                return this.combineErrorMessages(`isValidValue must be a function: ${validator.isValidValue}`, validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('valueComparisonStrategy')) {
            // Only accepted values are below
            if (!(validator.valueComparisonStrategy === 'reference' || validator.valueComparisonStrategy === 'lodashDeep' || validator.valueComparisonStrategy === 'equalsFunction' || typeof validator.valueComparisonStrategy === 'function')) {
                return this.combineErrorMessages(`valueComparisonStrategy must be "reference", "lodashDeep", 
        "equalsFunction", or a comparison function: ${validator.valueComparisonStrategy}`, validator.validationMessage);
            }
        }
        if (validator.validValues !== undefined && validator.validValues !== null) {
            if (!Array.isArray(validator.validValues)) {
                return this.combineErrorMessages(`validValues must be an array: ${validator.validValues}`, validator.validationMessage);
            }
            // Make sure each validValue matches the other rules, if any.
            const validatorWithoutValidValues = _.omit(validator, 'validValues');
            if (Validation.containsValidatorKey(validatorWithoutValidValues)) {
                for(let i = 0; i < validator.validValues.length; i++){
                    const validValue = validator.validValues[i];
                    const validValueValidationError = Validation.getValidationError(validValue, validatorWithoutValidValues);
                    if (validValueValidationError) {
                        return this.combineErrorMessages(`Item not valid in validValues: ${validValue}, error: ${validValueValidationError}`, validator.validationMessage);
                    }
                }
            }
        }
        if (validator.hasOwnProperty('phetioType')) {
            if (!validator.phetioType) {
                return this.combineErrorMessages('falsey phetioType provided', validator.validationMessage);
            }
            if (!validator.phetioType.validator) {
                return this.combineErrorMessages(`validator needed for phetioType: ${validator.phetioType.typeName}`, validator.validationMessage);
            }
            const phetioTypeValidationError = Validation.getValidatorValidationError(validator.phetioType.validator);
            if (phetioTypeValidationError) {
                return this.combineErrorMessages(phetioTypeValidationError, validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('validators')) {
            const validators = validator.validators;
            for(let i = 0; i < validators.length; i++){
                const subValidator = validators[i];
                const subValidationError = Validation.getValidatorValidationError(subValidator);
                if (subValidationError) {
                    return this.combineErrorMessages(`validators[${i}] invalid: ${subValidationError}`, validator.validationMessage);
                }
            }
        }
        return null;
    }
    /**
   * Validate that the valueType is of the expected format. Does not add validationMessage to any error it reports.
   * @returns - null if valid
   */ static getValueTypeValidatorValidationError(valueType) {
        if (!(typeof valueType === 'function' || typeof valueType === 'string' || valueType instanceof EnumerationDeprecated || valueType === null || valueType === undefined)) {
            return `valueType must be {function|string|EnumerationDeprecated|null|undefined}, valueType=${valueType}`;
        }
        // {string} valueType must be one of the primitives in TYPEOF_STRINGS, for typeof comparison
        if (typeof valueType === 'string') {
            if (!_.includes(TYPEOF_STRINGS, valueType)) {
                return `valueType not a supported primitive types: ${valueType}`;
            }
        }
        return null;
    }
    static validateValidator(validator) {
        if (assert) {
            const error = Validation.getValidatorValidationError(validator);
            error && assert(false, error);
        }
    }
    /**
   * @param validator - object which may or may not contain validation keys
   */ static containsValidatorKey(validator) {
        if (!(validator instanceof Object)) {
            return false;
        }
        for(let i = 0; i < VALIDATOR_KEYS.length; i++){
            if (validator.hasOwnProperty(VALIDATOR_KEYS[i])) {
                return true;
            }
        }
        return false;
    }
    static combineErrorMessages(genericMessage, specificMessage) {
        if (specificMessage) {
            genericMessage = `${typeof specificMessage === 'function' ? specificMessage() : specificMessage}: ${genericMessage}`;
        }
        return genericMessage;
    }
    static isValueValid(value, validator, providedOptions) {
        return this.getValidationError(value, validator, providedOptions) === null;
    }
    /**
   * Determines whether a value is valid (returning a boolean value), returning the problem as a string if invalid,
   * otherwise returning null when valid.
   */ static getValidationError(value, validator, providedOptions) {
        const options = optionize()({
            validateValidator: true
        }, providedOptions);
        if (options.validateValidator) {
            const validatorValidationError = Validation.getValidatorValidationError(validator);
            if (validatorValidationError) {
                return validatorValidationError;
            }
        }
        // Check valueType, which can be an array, string, type, or null
        if (validator.hasOwnProperty('valueType')) {
            const valueType = validator.valueType;
            if (Array.isArray(valueType)) {
                // Only one should be valid, so error out if none of them returned valid (valid=null)
                if (!_.some(valueType.map((typeInArray)=>!Validation.getValueTypeValidationError(value, typeInArray, validator.validationMessage)))) {
                    return this.combineErrorMessages(`value not valid for any valueType in ${valueType.toString().substring(0, 100)}, value: ${value}`, validator.validationMessage);
                }
            } else if (valueType) {
                const valueTypeValidationError = Validation.getValueTypeValidationError(value, valueType, validator.validationMessage);
                if (valueTypeValidationError) {
                    // getValueTypeValidationError will add the validationMessage for us
                    return valueTypeValidationError;
                }
            }
        }
        if (validator.validValues) {
            const valueComparisonStrategy = validator.valueComparisonStrategy || 'reference';
            const valueValid = validator.validValues.some((validValue)=>{
                return Validation.equalsForValidationStrategy(validValue, value, valueComparisonStrategy);
            });
            if (!valueValid) {
                return this.combineErrorMessages(`value not in validValues: ${value}`, validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('isValidValue') && !validator.isValidValue(value)) {
            return this.combineErrorMessages(`value failed isValidValue: ${value}`, validator.validationMessage);
        }
        if (validator.hasOwnProperty('phetioType')) {
            const phetioTypeValidationError = Validation.getValidationError(value, validator.phetioType.validator, options);
            if (phetioTypeValidationError) {
                return this.combineErrorMessages(`value failed phetioType validator: ${value}, error: ${phetioTypeValidationError}`, validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('validators')) {
            const validators = validator.validators;
            for(let i = 0; i < validators.length; i++){
                const subValidator = validators[i];
                const subValidationError = Validation.getValidationError(value, subValidator, options);
                if (subValidationError) {
                    return this.combineErrorMessages(`Failed validation for validators[${i}]: ${subValidationError}`, validator.validationMessage);
                }
            }
        }
        return null;
    }
    static getValueTypeValidationError(value, valueType, message) {
        if (typeof valueType === 'string' && typeof value !== valueType) {
            return this.combineErrorMessages(`value should have typeof ${valueType}, value=${value}`, message);
        } else if (valueType === Array && !Array.isArray(value)) {
            return this.combineErrorMessages(`value should have been an array, value=${value}`, message);
        } else if (valueType instanceof EnumerationDeprecated && !valueType.includes(value)) {
            return this.combineErrorMessages(`value is not a member of EnumerationDeprecated ${valueType}`, message);
        } else if (typeof valueType === 'function' && !(value instanceof valueType)) {
            return this.combineErrorMessages(`value should be instanceof ${valueType.name}, value=${value}`, message);
        }
        if (valueType === null && value !== null) {
            return this.combineErrorMessages(`value should be null, value=${value}`, message);
        }
        return null;
    }
    /**
   * Validate a type that can be a type, or an array of multiple types. Does not add validationMessage to any error
   * it reports
   */ static getValueOrElementTypeValidationError(type) {
        if (Array.isArray(type)) {
            // If not every type in the list is valid, then return false, pass options through verbatim.
            for(let i = 0; i < type.length; i++){
                const typeElement = type[i];
                const error = Validation.getValueTypeValidatorValidationError(typeElement);
                if (error) {
                    return `Array value invalid: ${error}`;
                }
            }
        } else if (type) {
            const error = Validation.getValueTypeValidatorValidationError(type);
            if (error) {
                return `Value type invalid: ${error}`;
            }
        }
        return null;
    }
    /**
   * Compare the two provided values for equality using the valueComparisonStrategy provided, see
   * ValueComparisonStrategy type.
   */ static equalsForValidationStrategy(a, b, valueComparisonStrategy = 'reference') {
        if (valueComparisonStrategy === 'reference') {
            return a === b;
        }
        if (valueComparisonStrategy === 'equalsFunction') {
            // AHH!! We're sorry. Performance really matters here, so we use double equals to test for null and undefined.
            // eslint-disable-next-line eqeqeq, no-eq-null
            if (a != null && b != null) {
                const aComparable = a;
                const bComparable = b;
                assert && assert(!!aComparable.equals, 'no equals function for 1st arg');
                assert && assert(!!bComparable.equals, 'no equals function for 2nd arg');
                // NOTE: If you hit this, and you think it is a bad assertion because of subtyping or something, then let's
                // talk about removing this. Likely this should stick around (thinks JO and MK), but we can definitely discuss.
                // Basically using the instance defined `equals` function makes assumptions, and if this assertion fails, then
                // it may be possible to have Property setting order dependencies. Likely it is just best to use a custom
                // function provided as a valueComparisonStrategy. See https://github.com/phetsims/axon/issues/428#issuecomment-2030463728
                assert && assert(aComparable.equals(bComparable) === bComparable.equals(aComparable), 'incompatible equality checks');
                const aEqualsB = aComparable.equals(bComparable);
                // Support for heterogeneous values with equalsFunction. No need to check both directions if they are the
                // same class.
                return a.constructor === b.constructor ? aEqualsB : aEqualsB && bComparable.equals(a);
            }
            return a === b; // Reference equality as a null/undefined fallback
        }
        if (valueComparisonStrategy === 'lodashDeep') {
            return _.isEqual(a, b);
        } else {
            return valueComparisonStrategy(a, b);
        }
    }
};
Validation.VALIDATOR_KEYS = VALIDATOR_KEYS;
/**
   * General validator for validating that a string doesn't have template variables in it.
   */ Validation.STRING_WITHOUT_TEMPLATE_VARS_VALIDATOR = {
    valueType: 'string',
    isValidValue: (v)=>!/\{\{\w*\}\}/.test(v)
};
export { Validation as default };
axon.register('Validation', Validation);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvVmFsaWRhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGUgZGVmaW5pdGlvbiBmaWxlIGZvciBcInZhbGlkYXRvcnNcIiB1c2VkIHRvIHZhbGlkYXRlIHZhbHVlcy4gVGhpcyBmaWxlIGhvbGRzIGFzc29jaWF0ZWQgbG9naWMgdGhhdCB2YWxpZGF0ZXMgdGhlXG4gKiBzY2hlbWEgb2YgdGhlIFwidmFsaWRhdG9yXCIgb2JqZWN0LCBhcyB3ZWxsIGFzIHRlc3RpbmcgaWYgYSB2YWx1ZSBhZGhlcmVzIHRvIHRoZSByZXN0cmljdGlvbnMgcHJvdmlkZWQgYnkgYSB2YWxpZGF0b3IuXG4gKiBTZWUgdmFsaWRhdGUuanMgZm9yIHVzYWdlIHdpdGggYXNzZXJ0aW9ucyB0byBjaGVjayB0aGF0IHZhbHVlcyBhcmUgdmFsaWQuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogQSBWYWxpZGF0b3IgdGhhdCBvbmx5IGFjY2VwdHMgbnVtYmVyIHZhbHVlczpcbiAqIHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9XG4gKlxuICogQSBWYWxpZGF0b3IgdGhhdCBvbmx5IGFjY2VwdHMgdGhlIG51bWJlcnMgXCIyXCIgb3IgXCIzXCI6XG4gKiB7IHZhbHVlVHlwZTogJ251bWJlcicsIHZhbGlkVmFsdWVzOiBbIDIsIDMgXSB9XG4gKlxuICogQSBWYWxpZGF0b3IgdGhhdCBhY2NlcHRzIGFueSBPYmplY3Q6XG4gKiB7IHZhbHVlVHlwZTogT2JqZWN0IH1cbiAqXG4gKiBBIFZhbGlkYXRvciB0aGF0IGFjY2VwdHMgRW51bWVyYXRpb25EZXByZWNhdGVkIHZhbHVlcyAoTk9URSEgVGhpcyBpcyBkZXByZWNhdGVkLCB1c2UgdGhlIG5ldyBjbGFzcy1iYXNlZCBlbnVtZXJhdGlvbiBwYXR0ZXJuIGFzIHRoZSB2YWx1ZVR5cGUpOlxuICogeyB2YWx1ZVR5cGU6IE15RW51bWVyYXRpb24gfVxuICogYW5kL29yXG4gKiB7IHZhbGlkVmFsdWVzOiBNeUVudW1lcmF0aW9uLlZBTFVFUyB9XG4gKlxuICogQSBWYWxpZGF0b3IgdGhhdCBhY2NlcHRzIGEgc3RyaW5nIG9yIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAyOlxuICogeyBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHsgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiB2YWx1ZSA+IDIpfSB9XG4gKlxuICogQSBWYWxpZGF0b3IgZm9yIGEgbnVtYmVyIHRoYXQgc2hvdWxkIGJlIGFuIGV2ZW4gbnVtYmVyIGdyZWF0ZXIgdGhhbiAxMFxuICogeyB2YWx1ZVR5cGU6ICdudW1iZXInLCB2YWxpZGF0b3JzOiBbIHsgaXNWYWxpZFZhbHVlOiB2ID0+IHYgPiAxMCB9LCB7IGlzVmFsaWRWYWx1ZTogdiA9PiB2JTIgPT09IDAgfV0gfVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgYXhvbiBmcm9tICcuL2F4b24uanMnO1xuXG5jb25zdCBUWVBFT0ZfU1RSSU5HUyA9IFsgJ3N0cmluZycsICdudW1iZXInLCAnYm9vbGVhbicsICdmdW5jdGlvbicgXTtcblxuZXhwb3J0IHR5cGUgSXNWYWxpZFZhbHVlT3B0aW9ucyA9IHtcblxuICAvLyBCeSBkZWZhdWx0IHZhbGlkYXRpb24gd2lsbCBhbHdheXMgY2hlY2sgdGhlIHZhbGlkaXR5IG9mIHRoZSB2YWxpZGF0b3IgaXRzZWxmLiBIb3dldmVyLCBmb3IgdHlwZXMgbGlrZVxuICAvLyBQcm9wZXJ0eSBhbmQgRW1pdHRlciByZS1jaGVja2luZyB0aGUgdmFsaWRhdG9yIGV2ZXJ5IHRpbWUgdGhlIFByb3BlcnR5IHZhbHVlIGNoYW5nZXMgb3IgdGhlIEVtaXR0ZXIgZW1pdHNcbiAgLy8gd2FzdGVzIGNwdS4gSGVuY2UgY2FzZXMgbGlrZSB0aG9zZSBjYW4gb3B0LW91dFxuICB2YWxpZGF0ZVZhbGlkYXRvcj86IGJvb2xlYW47XG59O1xuXG50eXBlIFZhbHVlVHlwZSA9XG4gIHN0cmluZyB8XG4gIEVudW1lcmF0aW9uRGVwcmVjYXRlZCB8XG4gIG51bGwgfFxuICBWYWx1ZVR5cGVbXSB8XG5cbiAgLy8gYWxsb3cgRnVuY3Rpb24gaGVyZSBzaW5jZSBpdCBpcyB0aGUgYXBwcm9wcmlhdGUgbGV2ZWwgb2YgYWJzdHJhY3Rpb24gZm9yIGNoZWNraW5nIGluc3RhbmNlb2ZcbiAgRnVuY3Rpb247IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlc3RyaWN0ZWQtdHlwZXNcblxudHlwZSBDb21wYXJhYmxlT2JqZWN0ID0ge1xuICBlcXVhbHM6ICggYTogdW5rbm93biApID0+IGJvb2xlYW47XG59O1xuXG50eXBlIEN1c3RvbVZhbHVlQ29tcGFyaXNvbk1ldGhvZEhvbGRlcjxUPiA9IHtcblxuICAvLyBJdCBpcyB2aXRhbCB0aGF0IHRoaXMgaXMgXCJtZXRob2RcIiBzdHlsZSBzeW50YXgsIGFuZCBub3QgXCJwcm9wZXJ0eVwiIHN0eWxlLCBsaWtlIGN1c3RvbVZhbHVlQ29tcGFyaXNvbjpcbiAgLy8gKGE6VCxiOlQpPT5ib29sZWFuLiAgVGhpcyBpcyBiZWNhdXNlIFR5cGVTY3JpcHQgc3BlY2lmaWNhbGx5IG1ha2VzIGEgY2FsbCB0byBpZ25vcmUgY29udHJhdmFyaWFudCB0eXBlIGNoZWNraW5nXG4gIC8vIGZvciBtZXRob2RzLCBidXQgaXQgZG9lc24ndCBmb3IgUHJvcGVydGllcy4gTW9zdCBpbXBvcnRhbnRseSwgdGhpcyBtYWtlcyBpdHMgd2F5IGludG8gVFJlYWRPbmx5UHJvcGVydHksIGFuZCBjYXVzZXNcbiAgLy8gbG90cyBvZiB0cm91YmxlIHdoZW4gdHJ5aW5nIHRvIHVzZSBpdCB3aXRoIGB1bmtub3duYCBwYXJhbWV0ZXIgdHlwZXMuXG4gIC8vIFBhcGVyIHRyYWlsMTogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzQyOCNpc3N1ZWNvbW1lbnQtMjAzMzA3MTQzMlxuICAvLyBQYXBlciB0cmFpbDI6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81NTk5Mjg0MC8zNDA4NTAyXG4gIC8vIFBhcGVyIHRyYWlsMzogaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svcmVsZWFzZS1ub3Rlcy90eXBlc2NyaXB0LTItNi5odG1sI3N0cmljdC1mdW5jdGlvbi10eXBlc1xuICBjdXN0b21WYWx1ZUNvbXBhcmlzb24oIGE6IFQsIGI6IFQgKTogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogVGhlIHdheSB0aGF0IHR3byB2YWx1ZXMgY2FuIGJlIGNvbXBhcmVkIGZvciBlcXVhbGl0eTpcbiAqIFwicmVmZXJlbmNlXCIgLSB1c2VzIHRyaXBsZSBlcXVhbHMgY29tcGFyaXNvbiAobW9zdCBvZnRlbiB0aGUgZGVmYXVsdClcbiAqIFwiZXF1YWxzRnVuY3Rpb25cIiAtIGFzc2VydHMgdGhhdCB0aGUgdHdvIHZhbHVlcyBoYXZlIGFuIGBlcXVhbHMoKWAgZnVuY3Rpb24gdGhhdCBjYW4gdXNlZCB0byBjb21wYXJlIChzZWUgXCJDb21wYXJhYmxlT2JqZWN0XCIgdHlwZSlcbiAqIFwibG9kYXNoRGVlcFwiIC0gdXNlcyBfLmlzRXF1YWwoKSBmb3IgY29tcGFyaXNvblxuICogY3VzdG9tIGZ1bmN0aW9uIC0gZGVmaW5lIGFueSBmdW5jdGlvbiB0aGF0IHJldHVybnMgaWYgdGhlIHR3byBwcm92aWRlZCB2YWx1ZXMgYXJlIGVxdWFsLlxuICovXG5leHBvcnQgdHlwZSBWYWx1ZUNvbXBhcmlzb25TdHJhdGVneTxUPiA9ICdlcXVhbHNGdW5jdGlvbicgfCAncmVmZXJlbmNlJyB8ICdsb2Rhc2hEZWVwJyB8IEN1c3RvbVZhbHVlQ29tcGFyaXNvbk1ldGhvZEhvbGRlcjxUPlsnY3VzdG9tVmFsdWVDb21wYXJpc29uJ107XG5cbmV4cG9ydCB0eXBlIFZhbGlkYXRpb25NZXNzYWdlID0gc3RyaW5nIHwgKCAoKSA9PiBzdHJpbmcgKTtcblxuZXhwb3J0IHR5cGUgVmFsaWRhdG9yPFQgPSB1bmtub3duPiA9IHtcblxuICAvLyBUeXBlIG9mIHRoZSB2YWx1ZS5cbiAgLy8gSWYge2Z1bmN0aW9ufSwgdGhlIGZ1bmN0aW9uIG11c3QgYmUgYSBjb25zdHJ1Y3Rvci5cbiAgLy8gSWYge3N0cmluZ30sIHRoZSBzdHJpbmcgbXVzdCBiZSBvbmUgb2YgdGhlIHByaW1pdGl2ZSB0eXBlcyBsaXN0ZWQgaW4gVFlQRU9GX1NUUklOR1MuXG4gIC8vIElmIHtudWxsfHVuZGVmaW5lZH0sIHRoZSB2YWx1ZSBtdXN0IGJlIG51bGwgKHdoaWNoIGRvZXNuJ3QgbWFrZSBzZW5zZSB1bnRpbCB0aGUgbmV4dCBsaW5lIG9mIGRvYylcbiAgLy8gSWYge0FycmF5LjxzdHJpbmd8ZnVuY3Rpb258bnVsbHx1bmRlZmluZWQ+fSwgZWFjaCBpdGVtIG11c3QgYmUgYSBsZWdhbCB2YWx1ZSBhcyBleHBsYWluZWQgaW4gdGhlIGFib3ZlIGRvY1xuICAvLyBVbnVzZWQgaWYgbnVsbC5cbiAgLy8gRXhhbXBsZXM6XG4gIC8vIHZhbHVlVHlwZTogVmVjdG9yMlxuICAvLyB2YWx1ZVR5cGU6ICdzdHJpbmcnXG4gIC8vIHZhbHVlVHlwZTogJ251bWJlcicsXG4gIC8vIHZhbHVlVHlwZTogWyAnbnVtYmVyJywgbnVsbCBdXG4gIC8vIHZhbHVlVHlwZTogWyAnbnVtYmVyJywgJ3N0cmluZycsIE5vZGUsIG51bGwgXVxuICB2YWx1ZVR5cGU/OiBWYWx1ZVR5cGUgfCBWYWx1ZVR5cGVbXTtcblxuICAvLyBWYWxpZCB2YWx1ZXMgZm9yIHRoaXMgUHJvcGVydHkuIFVudXNlZCBpZiBudWxsLlxuICAvLyBFeGFtcGxlOlxuICAvLyB2YWxpZFZhbHVlczogWyAnaG9yaXpvbnRhbCcsICd2ZXJ0aWNhbCcgXVxuICB2YWxpZFZhbHVlcz86IHJlYWRvbmx5IFRbXTtcblxuICAvLyBlcXVhbHNGdW5jdGlvbiAtPiBtdXN0IGhhdmUgLmVxdWFscygpIGZ1bmN0aW9uIG9uIHRoZSB0eXBlIFRcbiAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k/OiBWYWx1ZUNvbXBhcmlzb25TdHJhdGVneTxUPjtcblxuICAvLyBGdW5jdGlvbiB0aGF0IHZhbGlkYXRlcyB0aGUgdmFsdWUuIFNpbmdsZSBhcmd1bWVudCBpcyB0aGUgdmFsdWUsIHJldHVybnMgYm9vbGVhbi4gVW51c2VkIGlmIG51bGwuXG4gIC8vIEV4YW1wbGU6XG4gIC8vIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkgeyByZXR1cm4gTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwOyB9XG4gIGlzVmFsaWRWYWx1ZT86ICggdjogVCApID0+IGJvb2xlYW47XG5cbiAgLy8gQW4gSU9UeXBlIHVzZWQgdG8gc3BlY2lmeSB0aGUgcHVibGljIHR5cGluZyBmb3IgUGhFVC1pTy4gRWFjaCBJT1R5cGUgbXVzdCBoYXZlIGFcbiAgLy8gYHZhbGlkYXRvcmAga2V5IHNwZWNpZmllZCB0aGF0IGNhbiBiZSB1c2VkIGZvciB2YWxpZGF0aW9uLiBTZWUgSU9UeXBlIGZvciBhbiBleGFtcGxlLlxuICBwaGV0aW9UeXBlPzogSU9UeXBlO1xuXG4gIC8vIGlmIHByb3ZpZGVkLCB0aGlzIHdpbGwgcHJvdmlkZSBzdXBwbGVtZW50YWwgaW5mb3JtYXRpb24gdG8gdGhlIGFzc2VydGlvbi92YWxpZGF0aW9uIG1lc3NhZ2VzIGluIGFkZGl0aW9uIHRvIHRoZVxuICAvLyB2YWxpZGF0ZS1rZXktc3BlY2lmaWMgbWVzc2FnZSB0aGF0IHdpbGwgYmUgZ2l2ZW4uXG4gIHZhbGlkYXRpb25NZXNzYWdlPzogVmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgLy8gQSBsaXN0IG9mIFZhbGlkYXRvciBvYmplY3RzLCBlYWNoIG9mIHdoaWNoIG11c3QgcGFzcyB0byBiZSBhIHZhbGlkIHZhbHVlXG4gIHZhbGlkYXRvcnM/OiBWYWxpZGF0b3I8VD5bXTtcbn07XG5cbi8vIEtleSBuYW1lcyBhcmUgdmVyYm9zZSBzbyB0aGlzIGNhbiBiZSBtaXhlZCBpbnRvIG90aGVyIGNvbnRleHRzIGxpa2UgQVhPTi9Qcm9wZXJ0eS4gYHVuZGVmaW5lZGAgYW5kIGBudWxsYCBoYXZlIHRoZVxuLy8gc2FtZSBzZW1hbnRpY3Mgc28gdGhhdCB3ZSBjYW4gdXNlIHRoaXMgZmVhdHVyZSB3aXRob3V0IGhhdmluZyBleHRlbmQgYW5kIGFsbG9jYXRlIG5ldyBvYmplY3RzIGF0IGV2ZXJ5IHZhbGlkYXRpb24uXG5jb25zdCBWQUxJREFUT1JfS0VZUzogQXJyYXk8a2V5b2YgVmFsaWRhdG9yPiA9IFtcbiAgJ3ZhbHVlVHlwZScsXG4gICd2YWxpZFZhbHVlcycsXG4gICd2YWx1ZUNvbXBhcmlzb25TdHJhdGVneScsXG4gICdpc1ZhbGlkVmFsdWUnLFxuICAncGhldGlvVHlwZScsXG4gICd2YWxpZGF0b3JzJ1xuXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsaWRhdGlvbiB7XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIGFuIGVycm9yIHN0cmluZyBpZiBpbmNvcnJlY3QsIG90aGVyd2lzZSBudWxsIGlmIHZhbGlkXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvcjxUPiggdmFsaWRhdG9yOiBWYWxpZGF0b3I8VD4gKTogc3RyaW5nIHwgbnVsbCB7XG5cbiAgICBpZiAoICEoIHZhbGlkYXRvciBpbnN0YW5jZW9mIE9iamVjdCApICkge1xuXG4gICAgICAvLyBUaGVyZSB3b24ndCBiZSBhIHZhbGlkYXRpb25NZXNzYWdlIG9uIGEgbm9uLW9iamVjdFxuICAgICAgcmV0dXJuICd2YWxpZGF0b3IgbXVzdCBiZSBhbiBPYmplY3QnO1xuICAgIH1cblxuICAgIGlmICggISggdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCAnaXNWYWxpZFZhbHVlJyApIHx8XG4gICAgICAgICAgICB2YWxpZGF0b3IuaGFzT3duUHJvcGVydHkoICd2YWx1ZVR5cGUnICkgfHxcbiAgICAgICAgICAgIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApIHx8XG4gICAgICAgICAgICB2YWxpZGF0b3IuaGFzT3duUHJvcGVydHkoICd2YWx1ZUNvbXBhcmlzb25TdHJhdGVneScgKSB8fFxuICAgICAgICAgICAgdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCAncGhldGlvVHlwZScgKSB8fFxuICAgICAgICAgICAgdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCAndmFsaWRhdG9ycycgKSApICkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWxpZGF0b3IgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBvZjogJHtWQUxJREFUT1JfS0VZUy5qb2luKCAnLCcgKX1gLCB2YWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgKTtcbiAgICB9XG5cbiAgICBpZiAoIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3ZhbHVlVHlwZScgKSApIHtcbiAgICAgIGNvbnN0IHZhbHVlVHlwZVZhbGlkYXRpb25FcnJvciA9IFZhbGlkYXRpb24uZ2V0VmFsdWVPckVsZW1lbnRUeXBlVmFsaWRhdGlvbkVycm9yKCB2YWxpZGF0b3IudmFsdWVUeXBlISApO1xuICAgICAgaWYgKCB2YWx1ZVR5cGVWYWxpZGF0aW9uRXJyb3IgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKFxuICAgICAgICAgIGBJbnZhbGlkIHZhbHVlVHlwZTogJHt2YWxpZGF0b3IudmFsdWVUeXBlfSwgZXJyb3I6ICR7dmFsdWVUeXBlVmFsaWRhdGlvbkVycm9yfWAsXG4gICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB2YWxpZGF0b3IuaGFzT3duUHJvcGVydHkoICdpc1ZhbGlkVmFsdWUnICkgKSB7XG4gICAgICBpZiAoICEoIHR5cGVvZiB2YWxpZGF0b3IuaXNWYWxpZFZhbHVlID09PSAnZnVuY3Rpb24nIHx8XG4gICAgICAgICAgICAgIHZhbGlkYXRvci5pc1ZhbGlkVmFsdWUgPT09IG51bGwgfHxcbiAgICAgICAgICAgICAgdmFsaWRhdG9yLmlzVmFsaWRWYWx1ZSA9PT0gdW5kZWZpbmVkICkgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgaXNWYWxpZFZhbHVlIG11c3QgYmUgYSBmdW5jdGlvbjogJHt2YWxpZGF0b3IuaXNWYWxpZFZhbHVlfWAsXG4gICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB2YWxpZGF0b3IuaGFzT3duUHJvcGVydHkoICd2YWx1ZUNvbXBhcmlzb25TdHJhdGVneScgKSApIHtcblxuICAgICAgLy8gT25seSBhY2NlcHRlZCB2YWx1ZXMgYXJlIGJlbG93XG4gICAgICBpZiAoICEoIHZhbGlkYXRvci52YWx1ZUNvbXBhcmlzb25TdHJhdGVneSA9PT0gJ3JlZmVyZW5jZScgfHxcbiAgICAgICAgICAgICAgdmFsaWRhdG9yLnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ID09PSAnbG9kYXNoRGVlcCcgfHxcbiAgICAgICAgICAgICAgdmFsaWRhdG9yLnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ID09PSAnZXF1YWxzRnVuY3Rpb24nIHx8XG4gICAgICAgICAgICAgIHR5cGVvZiB2YWxpZGF0b3IudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPT09ICdmdW5jdGlvbicgKSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSBtdXN0IGJlIFwicmVmZXJlbmNlXCIsIFwibG9kYXNoRGVlcFwiLCBcbiAgICAgICAgXCJlcXVhbHNGdW5jdGlvblwiLCBvciBhIGNvbXBhcmlzb24gZnVuY3Rpb246ICR7dmFsaWRhdG9yLnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5fWAsXG4gICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB2YWxpZGF0b3IudmFsaWRWYWx1ZXMgIT09IHVuZGVmaW5lZCAmJiB2YWxpZGF0b3IudmFsaWRWYWx1ZXMgIT09IG51bGwgKSB7XG4gICAgICBpZiAoICFBcnJheS5pc0FycmF5KCB2YWxpZGF0b3IudmFsaWRWYWx1ZXMgKSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWxpZFZhbHVlcyBtdXN0IGJlIGFuIGFycmF5OiAke3ZhbGlkYXRvci52YWxpZFZhbHVlc31gLFxuICAgICAgICAgIHZhbGlkYXRvci52YWxpZGF0aW9uTWVzc2FnZSApO1xuICAgICAgfVxuXG4gICAgICAvLyBNYWtlIHN1cmUgZWFjaCB2YWxpZFZhbHVlIG1hdGNoZXMgdGhlIG90aGVyIHJ1bGVzLCBpZiBhbnkuXG4gICAgICBjb25zdCB2YWxpZGF0b3JXaXRob3V0VmFsaWRWYWx1ZXMgPSBfLm9taXQoIHZhbGlkYXRvciwgJ3ZhbGlkVmFsdWVzJyApO1xuICAgICAgaWYgKCBWYWxpZGF0aW9uLmNvbnRhaW5zVmFsaWRhdG9yS2V5KCB2YWxpZGF0b3JXaXRob3V0VmFsaWRWYWx1ZXMgKSApIHtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmFsaWRhdG9yLnZhbGlkVmFsdWVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGNvbnN0IHZhbGlkVmFsdWUgPSB2YWxpZGF0b3IudmFsaWRWYWx1ZXNbIGkgXTtcbiAgICAgICAgICBjb25zdCB2YWxpZFZhbHVlVmFsaWRhdGlvbkVycm9yID0gVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIHZhbGlkVmFsdWUsIHZhbGlkYXRvcldpdGhvdXRWYWxpZFZhbHVlcyApO1xuICAgICAgICAgIGlmICggdmFsaWRWYWx1ZVZhbGlkYXRpb25FcnJvciApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKFxuICAgICAgICAgICAgICBgSXRlbSBub3QgdmFsaWQgaW4gdmFsaWRWYWx1ZXM6ICR7dmFsaWRWYWx1ZX0sIGVycm9yOiAke3ZhbGlkVmFsdWVWYWxpZGF0aW9uRXJyb3J9YCwgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB2YWxpZGF0b3IuaGFzT3duUHJvcGVydHkoICdwaGV0aW9UeXBlJyApICkge1xuICAgICAgaWYgKCAhdmFsaWRhdG9yLnBoZXRpb1R5cGUgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCAnZmFsc2V5IHBoZXRpb1R5cGUgcHJvdmlkZWQnLCB2YWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgKTtcbiAgICAgIH1cbiAgICAgIGlmICggIXZhbGlkYXRvci5waGV0aW9UeXBlLnZhbGlkYXRvciApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWxpZGF0b3IgbmVlZGVkIGZvciBwaGV0aW9UeXBlOiAke3ZhbGlkYXRvci5waGV0aW9UeXBlLnR5cGVOYW1lfWAsXG4gICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBoZXRpb1R5cGVWYWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggdmFsaWRhdG9yLnBoZXRpb1R5cGUudmFsaWRhdG9yICk7XG4gICAgICBpZiAoIHBoZXRpb1R5cGVWYWxpZGF0aW9uRXJyb3IgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBwaGV0aW9UeXBlVmFsaWRhdGlvbkVycm9yLCB2YWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkYXRvcnMnICkgKSB7XG4gICAgICBjb25zdCB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnMhO1xuXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2YWxpZGF0b3JzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb25zdCBzdWJWYWxpZGF0b3IgPSB2YWxpZGF0b3JzWyBpIF07XG4gICAgICAgIGNvbnN0IHN1YlZhbGlkYXRpb25FcnJvciA9IFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCBzdWJWYWxpZGF0b3IgKTtcbiAgICAgICAgaWYgKCBzdWJWYWxpZGF0aW9uRXJyb3IgKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWxpZGF0b3JzWyR7aX1dIGludmFsaWQ6ICR7c3ViVmFsaWRhdGlvbkVycm9yfWAsIHZhbGlkYXRvci52YWxpZGF0aW9uTWVzc2FnZSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgdGhhdCB0aGUgdmFsdWVUeXBlIGlzIG9mIHRoZSBleHBlY3RlZCBmb3JtYXQuIERvZXMgbm90IGFkZCB2YWxpZGF0aW9uTWVzc2FnZSB0byBhbnkgZXJyb3IgaXQgcmVwb3J0cy5cbiAgICogQHJldHVybnMgLSBudWxsIGlmIHZhbGlkXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRWYWx1ZVR5cGVWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHZhbHVlVHlwZTogVmFsdWVUeXBlICk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICggISggdHlwZW9mIHZhbHVlVHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlVHlwZSA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAgIHZhbHVlVHlwZSBpbnN0YW5jZW9mIEVudW1lcmF0aW9uRGVwcmVjYXRlZCB8fFxuICAgICAgICAgICAgdmFsdWVUeXBlID09PSBudWxsIHx8XG4gICAgICAgICAgICB2YWx1ZVR5cGUgPT09IHVuZGVmaW5lZCApICkge1xuICAgICAgcmV0dXJuIGB2YWx1ZVR5cGUgbXVzdCBiZSB7ZnVuY3Rpb258c3RyaW5nfEVudW1lcmF0aW9uRGVwcmVjYXRlZHxudWxsfHVuZGVmaW5lZH0sIHZhbHVlVHlwZT0ke3ZhbHVlVHlwZX1gO1xuICAgIH1cblxuICAgIC8vIHtzdHJpbmd9IHZhbHVlVHlwZSBtdXN0IGJlIG9uZSBvZiB0aGUgcHJpbWl0aXZlcyBpbiBUWVBFT0ZfU1RSSU5HUywgZm9yIHR5cGVvZiBjb21wYXJpc29uXG4gICAgaWYgKCB0eXBlb2YgdmFsdWVUeXBlID09PSAnc3RyaW5nJyApIHtcbiAgICAgIGlmICggIV8uaW5jbHVkZXMoIFRZUEVPRl9TVFJJTkdTLCB2YWx1ZVR5cGUgKSApIHtcbiAgICAgICAgcmV0dXJuIGB2YWx1ZVR5cGUgbm90IGEgc3VwcG9ydGVkIHByaW1pdGl2ZSB0eXBlczogJHt2YWx1ZVR5cGV9YDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHZhbGlkYXRlVmFsaWRhdG9yPFQ+KCB2YWxpZGF0b3I6IFZhbGlkYXRvcjxUPiApOiB2b2lkIHtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGNvbnN0IGVycm9yID0gVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHZhbGlkYXRvciApO1xuICAgICAgZXJyb3IgJiYgYXNzZXJ0KCBmYWxzZSwgZXJyb3IgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHZhbGlkYXRvciAtIG9iamVjdCB3aGljaCBtYXkgb3IgbWF5IG5vdCBjb250YWluIHZhbGlkYXRpb24ga2V5c1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjb250YWluc1ZhbGlkYXRvcktleSggdmFsaWRhdG9yOiBJbnRlbnRpb25hbEFueSApOiBib29sZWFuIHtcbiAgICBpZiAoICEoIHZhbGlkYXRvciBpbnN0YW5jZW9mIE9iamVjdCApICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBWQUxJREFUT1JfS0VZUy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCBWQUxJREFUT1JfS0VZU1sgaSBdICkgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBjb21iaW5lRXJyb3JNZXNzYWdlcyggZ2VuZXJpY01lc3NhZ2U6IHN0cmluZywgc3BlY2lmaWNNZXNzYWdlPzogVmFsaWRhdGlvbk1lc3NhZ2UgKTogc3RyaW5nIHtcbiAgICBpZiAoIHNwZWNpZmljTWVzc2FnZSApIHtcbiAgICAgIGdlbmVyaWNNZXNzYWdlID0gYCR7dHlwZW9mIHNwZWNpZmljTWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJyA/IHNwZWNpZmljTWVzc2FnZSgpIDogc3BlY2lmaWNNZXNzYWdlfTogJHtnZW5lcmljTWVzc2FnZX1gO1xuICAgIH1cbiAgICByZXR1cm4gZ2VuZXJpY01lc3NhZ2U7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzVmFsdWVWYWxpZDxUPiggdmFsdWU6IFQsIHZhbGlkYXRvcjogVmFsaWRhdG9yPFQ+LCBwcm92aWRlZE9wdGlvbnM/OiBJc1ZhbGlkVmFsdWVPcHRpb25zICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFZhbGlkYXRpb25FcnJvciggdmFsdWUsIHZhbGlkYXRvciwgcHJvdmlkZWRPcHRpb25zICkgPT09IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgdmFsdWUgaXMgdmFsaWQgKHJldHVybmluZyBhIGJvb2xlYW4gdmFsdWUpLCByZXR1cm5pbmcgdGhlIHByb2JsZW0gYXMgYSBzdHJpbmcgaWYgaW52YWxpZCxcbiAgICogb3RoZXJ3aXNlIHJldHVybmluZyBudWxsIHdoZW4gdmFsaWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldFZhbGlkYXRpb25FcnJvcjxUPiggdmFsdWU6IEludGVudGlvbmFsQW55LCB2YWxpZGF0b3I6IFZhbGlkYXRvcjxUPiwgcHJvdmlkZWRPcHRpb25zPzogSXNWYWxpZFZhbHVlT3B0aW9ucyApOiBzdHJpbmcgfCBudWxsIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SXNWYWxpZFZhbHVlT3B0aW9ucz4oKSgge1xuICAgICAgdmFsaWRhdGVWYWxpZGF0b3I6IHRydWVcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGlmICggb3B0aW9ucy52YWxpZGF0ZVZhbGlkYXRvciApIHtcbiAgICAgIGNvbnN0IHZhbGlkYXRvclZhbGlkYXRpb25FcnJvciA9IFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB2YWxpZGF0b3IgKTtcbiAgICAgIGlmICggdmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yICkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIHZhbHVlVHlwZSwgd2hpY2ggY2FuIGJlIGFuIGFycmF5LCBzdHJpbmcsIHR5cGUsIG9yIG51bGxcbiAgICBpZiAoIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3ZhbHVlVHlwZScgKSApIHtcbiAgICAgIGNvbnN0IHZhbHVlVHlwZSA9IHZhbGlkYXRvci52YWx1ZVR5cGU7XG4gICAgICBpZiAoIEFycmF5LmlzQXJyYXkoIHZhbHVlVHlwZSApICkge1xuXG4gICAgICAgIC8vIE9ubHkgb25lIHNob3VsZCBiZSB2YWxpZCwgc28gZXJyb3Igb3V0IGlmIG5vbmUgb2YgdGhlbSByZXR1cm5lZCB2YWxpZCAodmFsaWQ9bnVsbClcbiAgICAgICAgaWYgKCAhXy5zb21lKCB2YWx1ZVR5cGUubWFwKCAoIHR5cGVJbkFycmF5OiBWYWx1ZVR5cGUgKSA9PiAhVmFsaWRhdGlvbi5nZXRWYWx1ZVR5cGVWYWxpZGF0aW9uRXJyb3IoIHZhbHVlLCB0eXBlSW5BcnJheSwgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICkgKSApICkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKFxuICAgICAgICAgICAgYHZhbHVlIG5vdCB2YWxpZCBmb3IgYW55IHZhbHVlVHlwZSBpbiAke3ZhbHVlVHlwZS50b1N0cmluZygpLnN1YnN0cmluZyggMCwgMTAwICl9LCB2YWx1ZTogJHt2YWx1ZX1gLFxuICAgICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB2YWx1ZVR5cGUgKSB7XG5cbiAgICAgICAgY29uc3QgdmFsdWVUeXBlVmFsaWRhdGlvbkVycm9yID0gVmFsaWRhdGlvbi5nZXRWYWx1ZVR5cGVWYWxpZGF0aW9uRXJyb3IoIHZhbHVlLCB2YWx1ZVR5cGUsIHZhbGlkYXRvci52YWxpZGF0aW9uTWVzc2FnZSApO1xuICAgICAgICBpZiAoIHZhbHVlVHlwZVZhbGlkYXRpb25FcnJvciApIHtcblxuICAgICAgICAgIC8vIGdldFZhbHVlVHlwZVZhbGlkYXRpb25FcnJvciB3aWxsIGFkZCB0aGUgdmFsaWRhdGlvbk1lc3NhZ2UgZm9yIHVzXG4gICAgICAgICAgcmV0dXJuIHZhbHVlVHlwZVZhbGlkYXRpb25FcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdmFsaWRhdG9yLnZhbGlkVmFsdWVzICkge1xuXG4gICAgICBjb25zdCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSA9IHZhbGlkYXRvci52YWx1ZUNvbXBhcmlzb25TdHJhdGVneSB8fCAncmVmZXJlbmNlJztcbiAgICAgIGNvbnN0IHZhbHVlVmFsaWQgPSB2YWxpZGF0b3IudmFsaWRWYWx1ZXMuc29tZSggdmFsaWRWYWx1ZSA9PiB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLmVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneTxUPiggdmFsaWRWYWx1ZSwgdmFsdWUsIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ICk7XG4gICAgICB9ICk7XG5cbiAgICAgIGlmICggIXZhbHVlVmFsaWQgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgbm90IGluIHZhbGlkVmFsdWVzOiAke3ZhbHVlfWAsIHZhbGlkYXRvci52YWxpZGF0aW9uTWVzc2FnZSApO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ2lzVmFsaWRWYWx1ZScgKSAmJiAhdmFsaWRhdG9yLmlzVmFsaWRWYWx1ZSEoIHZhbHVlICkgKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggYHZhbHVlIGZhaWxlZCBpc1ZhbGlkVmFsdWU6ICR7dmFsdWV9YCwgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XG4gICAgfVxuICAgIGlmICggdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCAncGhldGlvVHlwZScgKSApIHtcblxuICAgICAgY29uc3QgcGhldGlvVHlwZVZhbGlkYXRpb25FcnJvciA9IFZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCB2YWx1ZSwgdmFsaWRhdG9yLnBoZXRpb1R5cGUhLnZhbGlkYXRvciwgb3B0aW9ucyApO1xuICAgICAgaWYgKCBwaGV0aW9UeXBlVmFsaWRhdGlvbkVycm9yICkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggYHZhbHVlIGZhaWxlZCBwaGV0aW9UeXBlIHZhbGlkYXRvcjogJHt2YWx1ZX0sIGVycm9yOiAke3BoZXRpb1R5cGVWYWxpZGF0aW9uRXJyb3J9YCwgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB2YWxpZGF0b3IuaGFzT3duUHJvcGVydHkoICd2YWxpZGF0b3JzJyApICkge1xuICAgICAgY29uc3QgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzITtcblxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmFsaWRhdG9ycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3Qgc3ViVmFsaWRhdG9yID0gdmFsaWRhdG9yc1sgaSBdO1xuICAgICAgICBjb25zdCBzdWJWYWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggdmFsdWUsIHN1YlZhbGlkYXRvciwgb3B0aW9ucyApO1xuICAgICAgICBpZiAoIHN1YlZhbGlkYXRpb25FcnJvciApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggYEZhaWxlZCB2YWxpZGF0aW9uIGZvciB2YWxpZGF0b3JzWyR7aX1dOiAke3N1YlZhbGlkYXRpb25FcnJvcn1gLCB2YWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0VmFsdWVUeXBlVmFsaWRhdGlvbkVycm9yKCB2YWx1ZTogSW50ZW50aW9uYWxBbnksIHZhbHVlVHlwZTogVmFsdWVUeXBlLCBtZXNzYWdlPzogVmFsaWRhdGlvbk1lc3NhZ2UgKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCB0eXBlb2YgdmFsdWVUeXBlID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgdmFsdWUgIT09IHZhbHVlVHlwZSApIHsgLy8gcHJpbWl0aXZlIHR5cGVcbiAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgc2hvdWxkIGhhdmUgdHlwZW9mICR7dmFsdWVUeXBlfSwgdmFsdWU9JHt2YWx1ZX1gLCBtZXNzYWdlICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2YWx1ZVR5cGUgPT09IEFycmF5ICYmICFBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWx1ZSBzaG91bGQgaGF2ZSBiZWVuIGFuIGFycmF5LCB2YWx1ZT0ke3ZhbHVlfWAsIG1lc3NhZ2UgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHZhbHVlVHlwZSBpbnN0YW5jZW9mIEVudW1lcmF0aW9uRGVwcmVjYXRlZCAmJiAhdmFsdWVUeXBlLmluY2x1ZGVzKCB2YWx1ZSApICkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWx1ZSBpcyBub3QgYSBtZW1iZXIgb2YgRW51bWVyYXRpb25EZXByZWNhdGVkICR7dmFsdWVUeXBlfWAsIG1lc3NhZ2UgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHR5cGVvZiB2YWx1ZVR5cGUgPT09ICdmdW5jdGlvbicgJiYgISggdmFsdWUgaW5zdGFuY2VvZiB2YWx1ZVR5cGUgKSApIHsgLy8gY29uc3RydWN0b3JcbiAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgc2hvdWxkIGJlIGluc3RhbmNlb2YgJHt2YWx1ZVR5cGUubmFtZX0sIHZhbHVlPSR7dmFsdWV9YCwgbWVzc2FnZSApO1xuICAgIH1cbiAgICBpZiAoIHZhbHVlVHlwZSA9PT0gbnVsbCAmJiB2YWx1ZSAhPT0gbnVsbCApIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgc2hvdWxkIGJlIG51bGwsIHZhbHVlPSR7dmFsdWV9YCwgbWVzc2FnZSApO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBhIHR5cGUgdGhhdCBjYW4gYmUgYSB0eXBlLCBvciBhbiBhcnJheSBvZiBtdWx0aXBsZSB0eXBlcy4gRG9lcyBub3QgYWRkIHZhbGlkYXRpb25NZXNzYWdlIHRvIGFueSBlcnJvclxuICAgKiBpdCByZXBvcnRzXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRWYWx1ZU9yRWxlbWVudFR5cGVWYWxpZGF0aW9uRXJyb3IoIHR5cGU6IFZhbHVlVHlwZSApOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIEFycmF5LmlzQXJyYXkoIHR5cGUgKSApIHtcblxuICAgICAgLy8gSWYgbm90IGV2ZXJ5IHR5cGUgaW4gdGhlIGxpc3QgaXMgdmFsaWQsIHRoZW4gcmV0dXJuIGZhbHNlLCBwYXNzIG9wdGlvbnMgdGhyb3VnaCB2ZXJiYXRpbS5cbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IHR5cGVFbGVtZW50ID0gdHlwZVsgaSBdO1xuICAgICAgICBjb25zdCBlcnJvciA9IFZhbGlkYXRpb24uZ2V0VmFsdWVUeXBlVmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB0eXBlRWxlbWVudCApO1xuICAgICAgICBpZiAoIGVycm9yICkge1xuICAgICAgICAgIHJldHVybiBgQXJyYXkgdmFsdWUgaW52YWxpZDogJHtlcnJvcn1gO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0eXBlICkge1xuICAgICAgY29uc3QgZXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbHVlVHlwZVZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggdHlwZSApO1xuICAgICAgaWYgKCBlcnJvciApIHtcbiAgICAgICAgcmV0dXJuIGBWYWx1ZSB0eXBlIGludmFsaWQ6ICR7ZXJyb3J9YDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyZSB0aGUgdHdvIHByb3ZpZGVkIHZhbHVlcyBmb3IgZXF1YWxpdHkgdXNpbmcgdGhlIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5IHByb3ZpZGVkLCBzZWVcbiAgICogVmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZXF1YWxzRm9yVmFsaWRhdGlvblN0cmF0ZWd5PFQ+KCBhOiBULCBiOiBULCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogVmFsdWVDb21wYXJpc29uU3RyYXRlZ3k8VD4gPSAncmVmZXJlbmNlJyApOiBib29sZWFuIHtcblxuICAgIGlmICggdmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPT09ICdyZWZlcmVuY2UnICkge1xuICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgfVxuICAgIGlmICggdmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPT09ICdlcXVhbHNGdW5jdGlvbicgKSB7XG5cbiAgICAgIC8vIEFISCEhIFdlJ3JlIHNvcnJ5LiBQZXJmb3JtYW5jZSByZWFsbHkgbWF0dGVycyBoZXJlLCBzbyB3ZSB1c2UgZG91YmxlIGVxdWFscyB0byB0ZXN0IGZvciBudWxsIGFuZCB1bmRlZmluZWQuXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZXFlcWVxLCBuby1lcS1udWxsXG4gICAgICBpZiAoIGEgIT0gbnVsbCAmJiBiICE9IG51bGwgKSB7XG5cbiAgICAgICAgY29uc3QgYUNvbXBhcmFibGUgPSBhIGFzIHVua25vd24gYXMgQ29tcGFyYWJsZU9iamVjdDtcbiAgICAgICAgY29uc3QgYkNvbXBhcmFibGUgPSBiIGFzIHVua25vd24gYXMgQ29tcGFyYWJsZU9iamVjdDtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggISFhQ29tcGFyYWJsZS5lcXVhbHMsICdubyBlcXVhbHMgZnVuY3Rpb24gZm9yIDFzdCBhcmcnICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICEhYkNvbXBhcmFibGUuZXF1YWxzLCAnbm8gZXF1YWxzIGZ1bmN0aW9uIGZvciAybmQgYXJnJyApO1xuXG4gICAgICAgIC8vIE5PVEU6IElmIHlvdSBoaXQgdGhpcywgYW5kIHlvdSB0aGluayBpdCBpcyBhIGJhZCBhc3NlcnRpb24gYmVjYXVzZSBvZiBzdWJ0eXBpbmcgb3Igc29tZXRoaW5nLCB0aGVuIGxldCdzXG4gICAgICAgIC8vIHRhbGsgYWJvdXQgcmVtb3ZpbmcgdGhpcy4gTGlrZWx5IHRoaXMgc2hvdWxkIHN0aWNrIGFyb3VuZCAodGhpbmtzIEpPIGFuZCBNSyksIGJ1dCB3ZSBjYW4gZGVmaW5pdGVseSBkaXNjdXNzLlxuICAgICAgICAvLyBCYXNpY2FsbHkgdXNpbmcgdGhlIGluc3RhbmNlIGRlZmluZWQgYGVxdWFsc2AgZnVuY3Rpb24gbWFrZXMgYXNzdW1wdGlvbnMsIGFuZCBpZiB0aGlzIGFzc2VydGlvbiBmYWlscywgdGhlblxuICAgICAgICAvLyBpdCBtYXkgYmUgcG9zc2libGUgdG8gaGF2ZSBQcm9wZXJ0eSBzZXR0aW5nIG9yZGVyIGRlcGVuZGVuY2llcy4gTGlrZWx5IGl0IGlzIGp1c3QgYmVzdCB0byB1c2UgYSBjdXN0b21cbiAgICAgICAgLy8gZnVuY3Rpb24gcHJvdmlkZWQgYXMgYSB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy80MjgjaXNzdWVjb21tZW50LTIwMzA0NjM3MjhcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYUNvbXBhcmFibGUuZXF1YWxzKCBiQ29tcGFyYWJsZSApID09PSBiQ29tcGFyYWJsZS5lcXVhbHMoIGFDb21wYXJhYmxlICksXG4gICAgICAgICAgJ2luY29tcGF0aWJsZSBlcXVhbGl0eSBjaGVja3MnICk7XG5cbiAgICAgICAgY29uc3QgYUVxdWFsc0IgPSBhQ29tcGFyYWJsZS5lcXVhbHMoIGJDb21wYXJhYmxlICk7XG5cbiAgICAgICAgLy8gU3VwcG9ydCBmb3IgaGV0ZXJvZ2VuZW91cyB2YWx1ZXMgd2l0aCBlcXVhbHNGdW5jdGlvbi4gTm8gbmVlZCB0byBjaGVjayBib3RoIGRpcmVjdGlvbnMgaWYgdGhleSBhcmUgdGhlXG4gICAgICAgIC8vIHNhbWUgY2xhc3MuXG4gICAgICAgIHJldHVybiBhLmNvbnN0cnVjdG9yID09PSBiLmNvbnN0cnVjdG9yID8gYUVxdWFsc0IgOiBhRXF1YWxzQiAmJiBiQ29tcGFyYWJsZS5lcXVhbHMoIGEgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhID09PSBiOyAvLyBSZWZlcmVuY2UgZXF1YWxpdHkgYXMgYSBudWxsL3VuZGVmaW5lZCBmYWxsYmFja1xuICAgIH1cbiAgICBpZiAoIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ID09PSAnbG9kYXNoRGVlcCcgKSB7XG4gICAgICByZXR1cm4gXy5pc0VxdWFsKCBhLCBiICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5KCBhLCBiICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBWQUxJREFUT1JfS0VZUyA9IFZBTElEQVRPUl9LRVlTO1xuXG4gIC8qKlxuICAgKiBHZW5lcmFsIHZhbGlkYXRvciBmb3IgdmFsaWRhdGluZyB0aGF0IGEgc3RyaW5nIGRvZXNuJ3QgaGF2ZSB0ZW1wbGF0ZSB2YXJpYWJsZXMgaW4gaXQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNUUklOR19XSVRIT1VUX1RFTVBMQVRFX1ZBUlNfVkFMSURBVE9SOiBWYWxpZGF0b3I8c3RyaW5nPiA9IHtcbiAgICB2YWx1ZVR5cGU6ICdzdHJpbmcnLFxuICAgIGlzVmFsaWRWYWx1ZTogdiA9PiAhL1xce1xce1xcdypcXH1cXH0vLnRlc3QoIHYgKVxuICB9O1xufVxuXG5heG9uLnJlZ2lzdGVyKCAnVmFsaWRhdGlvbicsIFZhbGlkYXRpb24gKTsiXSwibmFtZXMiOlsiRW51bWVyYXRpb25EZXByZWNhdGVkIiwib3B0aW9uaXplIiwiYXhvbiIsIlRZUEVPRl9TVFJJTkdTIiwiVkFMSURBVE9SX0tFWVMiLCJWYWxpZGF0aW9uIiwiZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yIiwidmFsaWRhdG9yIiwiT2JqZWN0IiwiaGFzT3duUHJvcGVydHkiLCJjb21iaW5lRXJyb3JNZXNzYWdlcyIsImpvaW4iLCJ2YWxpZGF0aW9uTWVzc2FnZSIsInZhbHVlVHlwZVZhbGlkYXRpb25FcnJvciIsImdldFZhbHVlT3JFbGVtZW50VHlwZVZhbGlkYXRpb25FcnJvciIsInZhbHVlVHlwZSIsImlzVmFsaWRWYWx1ZSIsInVuZGVmaW5lZCIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5IiwidmFsaWRWYWx1ZXMiLCJBcnJheSIsImlzQXJyYXkiLCJ2YWxpZGF0b3JXaXRob3V0VmFsaWRWYWx1ZXMiLCJfIiwib21pdCIsImNvbnRhaW5zVmFsaWRhdG9yS2V5IiwiaSIsImxlbmd0aCIsInZhbGlkVmFsdWUiLCJ2YWxpZFZhbHVlVmFsaWRhdGlvbkVycm9yIiwiZ2V0VmFsaWRhdGlvbkVycm9yIiwicGhldGlvVHlwZSIsInR5cGVOYW1lIiwicGhldGlvVHlwZVZhbGlkYXRpb25FcnJvciIsInZhbGlkYXRvcnMiLCJzdWJWYWxpZGF0b3IiLCJzdWJWYWxpZGF0aW9uRXJyb3IiLCJnZXRWYWx1ZVR5cGVWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IiLCJpbmNsdWRlcyIsInZhbGlkYXRlVmFsaWRhdG9yIiwiYXNzZXJ0IiwiZXJyb3IiLCJnZW5lcmljTWVzc2FnZSIsInNwZWNpZmljTWVzc2FnZSIsImlzVmFsdWVWYWxpZCIsInZhbHVlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInZhbGlkYXRvclZhbGlkYXRpb25FcnJvciIsInNvbWUiLCJtYXAiLCJ0eXBlSW5BcnJheSIsImdldFZhbHVlVHlwZVZhbGlkYXRpb25FcnJvciIsInRvU3RyaW5nIiwic3Vic3RyaW5nIiwidmFsdWVWYWxpZCIsImVxdWFsc0ZvclZhbGlkYXRpb25TdHJhdGVneSIsIm1lc3NhZ2UiLCJuYW1lIiwidHlwZSIsInR5cGVFbGVtZW50IiwiYSIsImIiLCJhQ29tcGFyYWJsZSIsImJDb21wYXJhYmxlIiwiZXF1YWxzIiwiYUVxdWFsc0IiLCJjb25zdHJ1Y3RvciIsImlzRXF1YWwiLCJTVFJJTkdfV0lUSE9VVF9URU1QTEFURV9WQVJTX1ZBTElEQVRPUiIsInYiLCJ0ZXN0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2QkMsR0FFRCxPQUFPQSwyQkFBMkIsOENBQThDO0FBQ2hGLE9BQU9DLGVBQWUsa0NBQWtDO0FBR3hELE9BQU9DLFVBQVUsWUFBWTtBQUU3QixNQUFNQyxpQkFBaUI7SUFBRTtJQUFVO0lBQVU7SUFBVztDQUFZO0FBdUZwRSxxSEFBcUg7QUFDckgscUhBQXFIO0FBQ3JILE1BQU1DLGlCQUF5QztJQUM3QztJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRDtBQUVjLElBQUEsQUFBTUMsYUFBTixNQUFNQTtJQUVuQjs7R0FFQyxHQUNELE9BQWNDLDRCQUFnQ0MsU0FBdUIsRUFBa0I7UUFFckYsSUFBSyxDQUFHQSxDQUFBQSxxQkFBcUJDLE1BQUssR0FBTTtZQUV0QyxxREFBcUQ7WUFDckQsT0FBTztRQUNUO1FBRUEsSUFBSyxDQUFHRCxDQUFBQSxVQUFVRSxjQUFjLENBQUUsbUJBQzFCRixVQUFVRSxjQUFjLENBQUUsZ0JBQzFCRixVQUFVRSxjQUFjLENBQUUsa0JBQzFCRixVQUFVRSxjQUFjLENBQUUsOEJBQzFCRixVQUFVRSxjQUFjLENBQUUsaUJBQzFCRixVQUFVRSxjQUFjLENBQUUsYUFBYSxHQUFNO1lBQ25ELE9BQU8sSUFBSSxDQUFDQyxvQkFBb0IsQ0FBRSxDQUFDLHFDQUFxQyxFQUFFTixlQUFlTyxJQUFJLENBQUUsTUFBTyxFQUFFSixVQUFVSyxpQkFBaUI7UUFDckk7UUFFQSxJQUFLTCxVQUFVRSxjQUFjLENBQUUsY0FBZ0I7WUFDN0MsTUFBTUksMkJBQTJCUixXQUFXUyxvQ0FBb0MsQ0FBRVAsVUFBVVEsU0FBUztZQUNyRyxJQUFLRiwwQkFBMkI7Z0JBQzlCLE9BQU8sSUFBSSxDQUFDSCxvQkFBb0IsQ0FDOUIsQ0FBQyxtQkFBbUIsRUFBRUgsVUFBVVEsU0FBUyxDQUFDLFNBQVMsRUFBRUYsMEJBQTBCLEVBQy9FTixVQUFVSyxpQkFBaUI7WUFDL0I7UUFDRjtRQUVBLElBQUtMLFVBQVVFLGNBQWMsQ0FBRSxpQkFBbUI7WUFDaEQsSUFBSyxDQUFHLENBQUEsT0FBT0YsVUFBVVMsWUFBWSxLQUFLLGNBQ2xDVCxVQUFVUyxZQUFZLEtBQUssUUFDM0JULFVBQVVTLFlBQVksS0FBS0MsU0FBUSxHQUFNO2dCQUMvQyxPQUFPLElBQUksQ0FBQ1Asb0JBQW9CLENBQUUsQ0FBQyxpQ0FBaUMsRUFBRUgsVUFBVVMsWUFBWSxFQUFFLEVBQzVGVCxVQUFVSyxpQkFBaUI7WUFDL0I7UUFDRjtRQUVBLElBQUtMLFVBQVVFLGNBQWMsQ0FBRSw0QkFBOEI7WUFFM0QsaUNBQWlDO1lBQ2pDLElBQUssQ0FBR0YsQ0FBQUEsVUFBVVcsdUJBQXVCLEtBQUssZUFDdENYLFVBQVVXLHVCQUF1QixLQUFLLGdCQUN0Q1gsVUFBVVcsdUJBQXVCLEtBQUssb0JBQ3RDLE9BQU9YLFVBQVVXLHVCQUF1QixLQUFLLFVBQVMsR0FBTTtnQkFDbEUsT0FBTyxJQUFJLENBQUNSLG9CQUFvQixDQUFFLENBQUM7b0RBQ1MsRUFBRUgsVUFBVVcsdUJBQXVCLEVBQUUsRUFDL0VYLFVBQVVLLGlCQUFpQjtZQUMvQjtRQUNGO1FBRUEsSUFBS0wsVUFBVVksV0FBVyxLQUFLRixhQUFhVixVQUFVWSxXQUFXLEtBQUssTUFBTztZQUMzRSxJQUFLLENBQUNDLE1BQU1DLE9BQU8sQ0FBRWQsVUFBVVksV0FBVyxHQUFLO2dCQUM3QyxPQUFPLElBQUksQ0FBQ1Qsb0JBQW9CLENBQUUsQ0FBQyw4QkFBOEIsRUFBRUgsVUFBVVksV0FBVyxFQUFFLEVBQ3hGWixVQUFVSyxpQkFBaUI7WUFDL0I7WUFFQSw2REFBNkQ7WUFDN0QsTUFBTVUsOEJBQThCQyxFQUFFQyxJQUFJLENBQUVqQixXQUFXO1lBQ3ZELElBQUtGLFdBQVdvQixvQkFBb0IsQ0FBRUgsOEJBQWdDO2dCQUNwRSxJQUFNLElBQUlJLElBQUksR0FBR0EsSUFBSW5CLFVBQVVZLFdBQVcsQ0FBQ1EsTUFBTSxFQUFFRCxJQUFNO29CQUN2RCxNQUFNRSxhQUFhckIsVUFBVVksV0FBVyxDQUFFTyxFQUFHO29CQUM3QyxNQUFNRyw0QkFBNEJ4QixXQUFXeUIsa0JBQWtCLENBQUVGLFlBQVlOO29CQUM3RSxJQUFLTywyQkFBNEI7d0JBQy9CLE9BQU8sSUFBSSxDQUFDbkIsb0JBQW9CLENBQzlCLENBQUMsK0JBQStCLEVBQUVrQixXQUFXLFNBQVMsRUFBRUMsMkJBQTJCLEVBQUV0QixVQUFVSyxpQkFBaUI7b0JBQ3BIO2dCQUNGO1lBQ0Y7UUFDRjtRQUVBLElBQUtMLFVBQVVFLGNBQWMsQ0FBRSxlQUFpQjtZQUM5QyxJQUFLLENBQUNGLFVBQVV3QixVQUFVLEVBQUc7Z0JBQzNCLE9BQU8sSUFBSSxDQUFDckIsb0JBQW9CLENBQUUsOEJBQThCSCxVQUFVSyxpQkFBaUI7WUFDN0Y7WUFDQSxJQUFLLENBQUNMLFVBQVV3QixVQUFVLENBQUN4QixTQUFTLEVBQUc7Z0JBQ3JDLE9BQU8sSUFBSSxDQUFDRyxvQkFBb0IsQ0FBRSxDQUFDLGlDQUFpQyxFQUFFSCxVQUFVd0IsVUFBVSxDQUFDQyxRQUFRLEVBQUUsRUFDbkd6QixVQUFVSyxpQkFBaUI7WUFDL0I7WUFFQSxNQUFNcUIsNEJBQTRCNUIsV0FBV0MsMkJBQTJCLENBQUVDLFVBQVV3QixVQUFVLENBQUN4QixTQUFTO1lBQ3hHLElBQUswQiwyQkFBNEI7Z0JBQy9CLE9BQU8sSUFBSSxDQUFDdkIsb0JBQW9CLENBQUV1QiwyQkFBMkIxQixVQUFVSyxpQkFBaUI7WUFDMUY7UUFDRjtRQUVBLElBQUtMLFVBQVVFLGNBQWMsQ0FBRSxlQUFpQjtZQUM5QyxNQUFNeUIsYUFBYTNCLFVBQVUyQixVQUFVO1lBRXZDLElBQU0sSUFBSVIsSUFBSSxHQUFHQSxJQUFJUSxXQUFXUCxNQUFNLEVBQUVELElBQU07Z0JBQzVDLE1BQU1TLGVBQWVELFVBQVUsQ0FBRVIsRUFBRztnQkFDcEMsTUFBTVUscUJBQXFCL0IsV0FBV0MsMkJBQTJCLENBQUU2QjtnQkFDbkUsSUFBS0Msb0JBQXFCO29CQUN4QixPQUFPLElBQUksQ0FBQzFCLG9CQUFvQixDQUFFLENBQUMsV0FBVyxFQUFFZ0IsRUFBRSxXQUFXLEVBQUVVLG9CQUFvQixFQUFFN0IsVUFBVUssaUJBQWlCO2dCQUNsSDtZQUNGO1FBQ0Y7UUFFQSxPQUFPO0lBQ1Q7SUFFQTs7O0dBR0MsR0FDRCxPQUFleUIscUNBQXNDdEIsU0FBb0IsRUFBa0I7UUFDekYsSUFBSyxDQUFHLENBQUEsT0FBT0EsY0FBYyxjQUNyQixPQUFPQSxjQUFjLFlBQ3JCQSxxQkFBcUJmLHlCQUNyQmUsY0FBYyxRQUNkQSxjQUFjRSxTQUFRLEdBQU07WUFDbEMsT0FBTyxDQUFDLG9GQUFvRixFQUFFRixXQUFXO1FBQzNHO1FBRUEsNEZBQTRGO1FBQzVGLElBQUssT0FBT0EsY0FBYyxVQUFXO1lBQ25DLElBQUssQ0FBQ1EsRUFBRWUsUUFBUSxDQUFFbkMsZ0JBQWdCWSxZQUFjO2dCQUM5QyxPQUFPLENBQUMsMkNBQTJDLEVBQUVBLFdBQVc7WUFDbEU7UUFDRjtRQUNBLE9BQU87SUFDVDtJQUVBLE9BQWN3QixrQkFBc0JoQyxTQUF1QixFQUFTO1FBQ2xFLElBQUtpQyxRQUFTO1lBQ1osTUFBTUMsUUFBUXBDLFdBQVdDLDJCQUEyQixDQUFFQztZQUN0RGtDLFNBQVNELE9BQVEsT0FBT0M7UUFDMUI7SUFDRjtJQUVBOztHQUVDLEdBQ0QsT0FBY2hCLHFCQUFzQmxCLFNBQXlCLEVBQVk7UUFDdkUsSUFBSyxDQUFHQSxDQUFBQSxxQkFBcUJDLE1BQUssR0FBTTtZQUN0QyxPQUFPO1FBQ1Q7UUFDQSxJQUFNLElBQUlrQixJQUFJLEdBQUdBLElBQUl0QixlQUFldUIsTUFBTSxFQUFFRCxJQUFNO1lBQ2hELElBQUtuQixVQUFVRSxjQUFjLENBQUVMLGNBQWMsQ0FBRXNCLEVBQUcsR0FBSztnQkFDckQsT0FBTztZQUNUO1FBQ0Y7UUFDQSxPQUFPO0lBQ1Q7SUFFQSxPQUFlaEIscUJBQXNCZ0MsY0FBc0IsRUFBRUMsZUFBbUMsRUFBVztRQUN6RyxJQUFLQSxpQkFBa0I7WUFDckJELGlCQUFpQixHQUFHLE9BQU9DLG9CQUFvQixhQUFhQSxvQkFBb0JBLGdCQUFnQixFQUFFLEVBQUVELGdCQUFnQjtRQUN0SDtRQUNBLE9BQU9BO0lBQ1Q7SUFFQSxPQUFjRSxhQUFpQkMsS0FBUSxFQUFFdEMsU0FBdUIsRUFBRXVDLGVBQXFDLEVBQVk7UUFDakgsT0FBTyxJQUFJLENBQUNoQixrQkFBa0IsQ0FBRWUsT0FBT3RDLFdBQVd1QyxxQkFBc0I7SUFDMUU7SUFFQTs7O0dBR0MsR0FDRCxPQUFjaEIsbUJBQXVCZSxLQUFxQixFQUFFdEMsU0FBdUIsRUFBRXVDLGVBQXFDLEVBQWtCO1FBRTFJLE1BQU1DLFVBQVU5QyxZQUFrQztZQUNoRHNDLG1CQUFtQjtRQUNyQixHQUFHTztRQUVILElBQUtDLFFBQVFSLGlCQUFpQixFQUFHO1lBQy9CLE1BQU1TLDJCQUEyQjNDLFdBQVdDLDJCQUEyQixDQUFFQztZQUN6RSxJQUFLeUMsMEJBQTJCO2dCQUM5QixPQUFPQTtZQUNUO1FBQ0Y7UUFFQSxnRUFBZ0U7UUFDaEUsSUFBS3pDLFVBQVVFLGNBQWMsQ0FBRSxjQUFnQjtZQUM3QyxNQUFNTSxZQUFZUixVQUFVUSxTQUFTO1lBQ3JDLElBQUtLLE1BQU1DLE9BQU8sQ0FBRU4sWUFBYztnQkFFaEMscUZBQXFGO2dCQUNyRixJQUFLLENBQUNRLEVBQUUwQixJQUFJLENBQUVsQyxVQUFVbUMsR0FBRyxDQUFFLENBQUVDLGNBQTRCLENBQUM5QyxXQUFXK0MsMkJBQTJCLENBQUVQLE9BQU9NLGFBQWE1QyxVQUFVSyxpQkFBaUIsS0FBUztvQkFDMUosT0FBTyxJQUFJLENBQUNGLG9CQUFvQixDQUM5QixDQUFDLHFDQUFxQyxFQUFFSyxVQUFVc0MsUUFBUSxHQUFHQyxTQUFTLENBQUUsR0FBRyxLQUFNLFNBQVMsRUFBRVQsT0FBTyxFQUNuR3RDLFVBQVVLLGlCQUFpQjtnQkFDL0I7WUFDRixPQUNLLElBQUtHLFdBQVk7Z0JBRXBCLE1BQU1GLDJCQUEyQlIsV0FBVytDLDJCQUEyQixDQUFFUCxPQUFPOUIsV0FBV1IsVUFBVUssaUJBQWlCO2dCQUN0SCxJQUFLQywwQkFBMkI7b0JBRTlCLG9FQUFvRTtvQkFDcEUsT0FBT0E7Z0JBQ1Q7WUFDRjtRQUNGO1FBRUEsSUFBS04sVUFBVVksV0FBVyxFQUFHO1lBRTNCLE1BQU1ELDBCQUEwQlgsVUFBVVcsdUJBQXVCLElBQUk7WUFDckUsTUFBTXFDLGFBQWFoRCxVQUFVWSxXQUFXLENBQUM4QixJQUFJLENBQUVyQixDQUFBQTtnQkFDN0MsT0FBT3ZCLFdBQVdtRCwyQkFBMkIsQ0FBSzVCLFlBQVlpQixPQUFPM0I7WUFDdkU7WUFFQSxJQUFLLENBQUNxQyxZQUFhO2dCQUNqQixPQUFPLElBQUksQ0FBQzdDLG9CQUFvQixDQUFFLENBQUMsMEJBQTBCLEVBQUVtQyxPQUFPLEVBQUV0QyxVQUFVSyxpQkFBaUI7WUFDckc7UUFDRjtRQUNBLElBQUtMLFVBQVVFLGNBQWMsQ0FBRSxtQkFBb0IsQ0FBQ0YsVUFBVVMsWUFBWSxDQUFHNkIsUUFBVTtZQUNyRixPQUFPLElBQUksQ0FBQ25DLG9CQUFvQixDQUFFLENBQUMsMkJBQTJCLEVBQUVtQyxPQUFPLEVBQUV0QyxVQUFVSyxpQkFBaUI7UUFDdEc7UUFDQSxJQUFLTCxVQUFVRSxjQUFjLENBQUUsZUFBaUI7WUFFOUMsTUFBTXdCLDRCQUE0QjVCLFdBQVd5QixrQkFBa0IsQ0FBRWUsT0FBT3RDLFVBQVV3QixVQUFVLENBQUV4QixTQUFTLEVBQUV3QztZQUN6RyxJQUFLZCwyQkFBNEI7Z0JBQy9CLE9BQU8sSUFBSSxDQUFDdkIsb0JBQW9CLENBQUUsQ0FBQyxtQ0FBbUMsRUFBRW1DLE1BQU0sU0FBUyxFQUFFWiwyQkFBMkIsRUFBRTFCLFVBQVVLLGlCQUFpQjtZQUNuSjtRQUNGO1FBRUEsSUFBS0wsVUFBVUUsY0FBYyxDQUFFLGVBQWlCO1lBQzlDLE1BQU15QixhQUFhM0IsVUFBVTJCLFVBQVU7WUFFdkMsSUFBTSxJQUFJUixJQUFJLEdBQUdBLElBQUlRLFdBQVdQLE1BQU0sRUFBRUQsSUFBTTtnQkFDNUMsTUFBTVMsZUFBZUQsVUFBVSxDQUFFUixFQUFHO2dCQUNwQyxNQUFNVSxxQkFBcUIvQixXQUFXeUIsa0JBQWtCLENBQUVlLE9BQU9WLGNBQWNZO2dCQUMvRSxJQUFLWCxvQkFBcUI7b0JBQ3hCLE9BQU8sSUFBSSxDQUFDMUIsb0JBQW9CLENBQUUsQ0FBQyxpQ0FBaUMsRUFBRWdCLEVBQUUsR0FBRyxFQUFFVSxvQkFBb0IsRUFBRTdCLFVBQVVLLGlCQUFpQjtnQkFDaEk7WUFDRjtRQUNGO1FBRUEsT0FBTztJQUNUO0lBRUEsT0FBZXdDLDRCQUE2QlAsS0FBcUIsRUFBRTlCLFNBQW9CLEVBQUUwQyxPQUEyQixFQUFrQjtRQUNwSSxJQUFLLE9BQU8xQyxjQUFjLFlBQVksT0FBTzhCLFVBQVU5QixXQUFZO1lBQ2pFLE9BQU8sSUFBSSxDQUFDTCxvQkFBb0IsQ0FBRSxDQUFDLHlCQUF5QixFQUFFSyxVQUFVLFFBQVEsRUFBRThCLE9BQU8sRUFBRVk7UUFDN0YsT0FDSyxJQUFLMUMsY0FBY0ssU0FBUyxDQUFDQSxNQUFNQyxPQUFPLENBQUV3QixRQUFVO1lBQ3pELE9BQU8sSUFBSSxDQUFDbkMsb0JBQW9CLENBQUUsQ0FBQyx1Q0FBdUMsRUFBRW1DLE9BQU8sRUFBRVk7UUFDdkYsT0FDSyxJQUFLMUMscUJBQXFCZix5QkFBeUIsQ0FBQ2UsVUFBVXVCLFFBQVEsQ0FBRU8sUUFBVTtZQUNyRixPQUFPLElBQUksQ0FBQ25DLG9CQUFvQixDQUFFLENBQUMsK0NBQStDLEVBQUVLLFdBQVcsRUFBRTBDO1FBQ25HLE9BQ0ssSUFBSyxPQUFPMUMsY0FBYyxjQUFjLENBQUc4QixDQUFBQSxpQkFBaUI5QixTQUFRLEdBQU07WUFDN0UsT0FBTyxJQUFJLENBQUNMLG9CQUFvQixDQUFFLENBQUMsMkJBQTJCLEVBQUVLLFVBQVUyQyxJQUFJLENBQUMsUUFBUSxFQUFFYixPQUFPLEVBQUVZO1FBQ3BHO1FBQ0EsSUFBSzFDLGNBQWMsUUFBUThCLFVBQVUsTUFBTztZQUMxQyxPQUFPLElBQUksQ0FBQ25DLG9CQUFvQixDQUFFLENBQUMsNEJBQTRCLEVBQUVtQyxPQUFPLEVBQUVZO1FBQzVFO1FBQ0EsT0FBTztJQUNUO0lBRUE7OztHQUdDLEdBQ0QsT0FBZTNDLHFDQUFzQzZDLElBQWUsRUFBa0I7UUFDcEYsSUFBS3ZDLE1BQU1DLE9BQU8sQ0FBRXNDLE9BQVM7WUFFM0IsNEZBQTRGO1lBQzVGLElBQU0sSUFBSWpDLElBQUksR0FBR0EsSUFBSWlDLEtBQUtoQyxNQUFNLEVBQUVELElBQU07Z0JBQ3RDLE1BQU1rQyxjQUFjRCxJQUFJLENBQUVqQyxFQUFHO2dCQUM3QixNQUFNZSxRQUFRcEMsV0FBV2dDLG9DQUFvQyxDQUFFdUI7Z0JBQy9ELElBQUtuQixPQUFRO29CQUNYLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRUEsT0FBTztnQkFDeEM7WUFDRjtRQUNGLE9BQ0ssSUFBS2tCLE1BQU87WUFDZixNQUFNbEIsUUFBUXBDLFdBQVdnQyxvQ0FBb0MsQ0FBRXNCO1lBQy9ELElBQUtsQixPQUFRO2dCQUNYLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRUEsT0FBTztZQUN2QztRQUNGO1FBQ0EsT0FBTztJQUNUO0lBRUE7OztHQUdDLEdBQ0QsT0FBY2UsNEJBQWdDSyxDQUFJLEVBQUVDLENBQUksRUFBRTVDLDBCQUFzRCxXQUFXLEVBQVk7UUFFckksSUFBS0EsNEJBQTRCLGFBQWM7WUFDN0MsT0FBTzJDLE1BQU1DO1FBQ2Y7UUFDQSxJQUFLNUMsNEJBQTRCLGtCQUFtQjtZQUVsRCw4R0FBOEc7WUFDOUcsOENBQThDO1lBQzlDLElBQUsyQyxLQUFLLFFBQVFDLEtBQUssTUFBTztnQkFFNUIsTUFBTUMsY0FBY0Y7Z0JBQ3BCLE1BQU1HLGNBQWNGO2dCQUNwQnRCLFVBQVVBLE9BQVEsQ0FBQyxDQUFDdUIsWUFBWUUsTUFBTSxFQUFFO2dCQUN4Q3pCLFVBQVVBLE9BQVEsQ0FBQyxDQUFDd0IsWUFBWUMsTUFBTSxFQUFFO2dCQUV4QywyR0FBMkc7Z0JBQzNHLCtHQUErRztnQkFDL0csOEdBQThHO2dCQUM5Ryx5R0FBeUc7Z0JBQ3pHLDBIQUEwSDtnQkFDMUh6QixVQUFVQSxPQUFRdUIsWUFBWUUsTUFBTSxDQUFFRCxpQkFBa0JBLFlBQVlDLE1BQU0sQ0FBRUYsY0FDMUU7Z0JBRUYsTUFBTUcsV0FBV0gsWUFBWUUsTUFBTSxDQUFFRDtnQkFFckMseUdBQXlHO2dCQUN6RyxjQUFjO2dCQUNkLE9BQU9ILEVBQUVNLFdBQVcsS0FBS0wsRUFBRUssV0FBVyxHQUFHRCxXQUFXQSxZQUFZRixZQUFZQyxNQUFNLENBQUVKO1lBQ3RGO1lBQ0EsT0FBT0EsTUFBTUMsR0FBRyxrREFBa0Q7UUFDcEU7UUFDQSxJQUFLNUMsNEJBQTRCLGNBQWU7WUFDOUMsT0FBT0ssRUFBRTZDLE9BQU8sQ0FBRVAsR0FBR0M7UUFDdkIsT0FDSztZQUNILE9BQU81Qyx3QkFBeUIyQyxHQUFHQztRQUNyQztJQUNGO0FBV0Y7QUE1VXFCekQsV0FtVUlELGlCQUFpQkE7QUFFeEM7O0dBRUMsR0F2VWtCQyxXQXdVSWdFLHlDQUE0RDtJQUNqRnRELFdBQVc7SUFDWEMsY0FBY3NELENBQUFBLElBQUssQ0FBQyxjQUFjQyxJQUFJLENBQUVEO0FBQzFDO0FBM1VGLFNBQXFCakUsd0JBNFVwQjtBQUVESCxLQUFLc0UsUUFBUSxDQUFFLGNBQWNuRSJ9