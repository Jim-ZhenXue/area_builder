// Copyright 2019-2024, University of Colorado Boulder
/**
 * Throws an assertion error if assertions are enabled and the value is invalid, otherwise returns the value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import axon from './axon.js';
import Validation from './Validation.js';
/**
 * If assertions are enabled, assert out if the value does not adhere to the validator. No-op without assertions.
 * @deprecated - this solution is worse than a direct assertion (or otherwise call Validation.getValidationError directly)
 */ const validate = (value, validator, providedOptions)=>{
    if (assert) {
        // Throws an error if not valid
        const result = Validation.getValidationError(value, validator, providedOptions);
        if (result) {
            // Just pick the helpful keys to print for the assertion message, so stub out the type of this
            const validatorKeys = _.pick(validator, Validation.VALIDATOR_KEYS);
            if (validatorKeys.phetioType) {
                validatorKeys.phetioType = _.pick(validator.phetioType, [
                    'validator',
                    'typeName'
                ]);
            }
            const prunedValidator = JSON.stringify(validatorKeys, null, 2);
            assert && assert(false, 'validation failed for value:', value, result, 'prunedValidator:', prunedValidator);
        }
    }
};
axon.register('validate', validate);
export default validate;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvdmFsaWRhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpZiBhc3NlcnRpb25zIGFyZSBlbmFibGVkIGFuZCB0aGUgdmFsdWUgaXMgaW52YWxpZCwgb3RoZXJ3aXNlIHJldHVybnMgdGhlIHZhbHVlLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgYXhvbiBmcm9tICcuL2F4b24uanMnO1xuaW1wb3J0IFZhbGlkYXRpb24sIHsgSXNWYWxpZFZhbHVlT3B0aW9ucywgVmFsaWRhdG9yIH0gZnJvbSAnLi9WYWxpZGF0aW9uLmpzJztcblxuLyoqXG4gKiBJZiBhc3NlcnRpb25zIGFyZSBlbmFibGVkLCBhc3NlcnQgb3V0IGlmIHRoZSB2YWx1ZSBkb2VzIG5vdCBhZGhlcmUgdG8gdGhlIHZhbGlkYXRvci4gTm8tb3Agd2l0aG91dCBhc3NlcnRpb25zLlxuICogQGRlcHJlY2F0ZWQgLSB0aGlzIHNvbHV0aW9uIGlzIHdvcnNlIHRoYW4gYSBkaXJlY3QgYXNzZXJ0aW9uIChvciBvdGhlcndpc2UgY2FsbCBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciBkaXJlY3RseSlcbiAqL1xuY29uc3QgdmFsaWRhdGUgPSA8VD4oIHZhbHVlOiBJbnRlbnRpb25hbEFueSwgdmFsaWRhdG9yOiBWYWxpZGF0b3I8VD4sIHByb3ZpZGVkT3B0aW9ucz86IElzVmFsaWRWYWx1ZU9wdGlvbnMgKTogdm9pZCA9PiB7XG5cbiAgaWYgKCBhc3NlcnQgKSB7XG5cbiAgICAvLyBUaHJvd3MgYW4gZXJyb3IgaWYgbm90IHZhbGlkXG4gICAgY29uc3QgcmVzdWx0ID0gVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIHZhbHVlLCB2YWxpZGF0b3IsIHByb3ZpZGVkT3B0aW9ucyApO1xuICAgIGlmICggcmVzdWx0ICkge1xuXG4gICAgICAvLyBKdXN0IHBpY2sgdGhlIGhlbHBmdWwga2V5cyB0byBwcmludCBmb3IgdGhlIGFzc2VydGlvbiBtZXNzYWdlLCBzbyBzdHViIG91dCB0aGUgdHlwZSBvZiB0aGlzXG4gICAgICBjb25zdCB2YWxpZGF0b3JLZXlzOiBJbnRlbnRpb25hbEFueSA9IF8ucGljayggdmFsaWRhdG9yLCBWYWxpZGF0aW9uLlZBTElEQVRPUl9LRVlTICk7XG4gICAgICBpZiAoIHZhbGlkYXRvcktleXMucGhldGlvVHlwZSApIHtcbiAgICAgICAgdmFsaWRhdG9yS2V5cy5waGV0aW9UeXBlID0gXy5waWNrKCB2YWxpZGF0b3IucGhldGlvVHlwZSwgWyAndmFsaWRhdG9yJywgJ3R5cGVOYW1lJyBdICk7XG4gICAgICB9XG4gICAgICBjb25zdCBwcnVuZWRWYWxpZGF0b3IgPSBKU09OLnN0cmluZ2lmeSggdmFsaWRhdG9yS2V5cywgbnVsbCwgMiApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICd2YWxpZGF0aW9uIGZhaWxlZCBmb3IgdmFsdWU6JywgdmFsdWUsIHJlc3VsdCwgJ3BydW5lZFZhbGlkYXRvcjonLCBwcnVuZWRWYWxpZGF0b3IgKTtcbiAgICB9XG4gIH1cbn07XG5cblxuYXhvbi5yZWdpc3RlciggJ3ZhbGlkYXRlJywgdmFsaWRhdGUgKTtcbmV4cG9ydCBkZWZhdWx0IHZhbGlkYXRlOyJdLCJuYW1lcyI6WyJheG9uIiwiVmFsaWRhdGlvbiIsInZhbGlkYXRlIiwidmFsdWUiLCJ2YWxpZGF0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJyZXN1bHQiLCJnZXRWYWxpZGF0aW9uRXJyb3IiLCJ2YWxpZGF0b3JLZXlzIiwiXyIsInBpY2siLCJWQUxJREFUT1JfS0VZUyIsInBoZXRpb1R5cGUiLCJwcnVuZWRWYWxpZGF0b3IiLCJKU09OIiwic3RyaW5naWZ5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUdELE9BQU9BLFVBQVUsWUFBWTtBQUM3QixPQUFPQyxnQkFBb0Qsa0JBQWtCO0FBRTdFOzs7Q0FHQyxHQUNELE1BQU1DLFdBQVcsQ0FBS0MsT0FBdUJDLFdBQXlCQztJQUVwRSxJQUFLQyxRQUFTO1FBRVosK0JBQStCO1FBQy9CLE1BQU1DLFNBQVNOLFdBQVdPLGtCQUFrQixDQUFFTCxPQUFPQyxXQUFXQztRQUNoRSxJQUFLRSxRQUFTO1lBRVosOEZBQThGO1lBQzlGLE1BQU1FLGdCQUFnQ0MsRUFBRUMsSUFBSSxDQUFFUCxXQUFXSCxXQUFXVyxjQUFjO1lBQ2xGLElBQUtILGNBQWNJLFVBQVUsRUFBRztnQkFDOUJKLGNBQWNJLFVBQVUsR0FBR0gsRUFBRUMsSUFBSSxDQUFFUCxVQUFVUyxVQUFVLEVBQUU7b0JBQUU7b0JBQWE7aUJBQVk7WUFDdEY7WUFDQSxNQUFNQyxrQkFBa0JDLEtBQUtDLFNBQVMsQ0FBRVAsZUFBZSxNQUFNO1lBQzdESCxVQUFVQSxPQUFRLE9BQU8sZ0NBQWdDSCxPQUFPSSxRQUFRLG9CQUFvQk87UUFDOUY7SUFDRjtBQUNGO0FBR0FkLEtBQUtpQixRQUFRLENBQUUsWUFBWWY7QUFDM0IsZUFBZUEsU0FBUyJ9