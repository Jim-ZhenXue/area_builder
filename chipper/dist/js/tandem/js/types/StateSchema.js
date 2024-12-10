// Copyright 2021-2024, University of Colorado Boulder
/**
 * Class responsible for storing information about the schema of PhET-iO state. See IOType stateSchema option for usage
 * and more information.
 *
 * There are two types of StateSchema:
 * - The first is a stateSchema "value". This is when the state of an IOType is itself a value in the state. In
 * effect, this just serves as boilerplate, and isn't the primary usage of stateSchema. For example, a StringIO or
 * NumberIO.
 * - The second is a "composite", where the state of an IOType is made from subcomponents, each of which have an IOType.
 * A composite schema was named because it is a sum of its parts. For example a BunnyIO has multiple components that
 * make it up (mother/father/age/etc). Check which type of StateSchema your instance is with StateSchema.isComposite().
 *
 * When stored in the API, StateSchema values are stored as strings, see StateSchema.asValue, and composite state schemas
 * are stored as objects with values that are each IOType names.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Validation from '../../../axon/js/Validation.js';
import assertMutuallyExclusiveOptions from '../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import optionize from '../../../phet-core/js/optionize.js';
import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
let StateSchema = class StateSchema {
    /**
   * This method provides a default implementation for setting a stateObject onto an object from the stateSchema information.
   * It supports the coreObject keys as private, underscore-prefixed field, as
   * well as if the coreObject has an es5 setter instead of an actual field.
   */ defaultApplyState(coreObject, stateObject) {
        assert && assert(this.isComposite(), 'defaultApplyState from stateSchema only applies to composite stateSchemas');
        for(const stateKey in this.compositeSchema){
            if (this.compositeSchema.hasOwnProperty(stateKey)) {
                assert && assert(stateObject.hasOwnProperty(stateKey), `stateObject does not have expected schema key: ${stateKey}`);
                // The IOType for the key in the composite.
                const schemaIOType = this.compositeSchema[stateKey];
                const coreObjectAccessorName = this.getCoreObjectAccessorName(stateKey, coreObject);
                // Using fromStateObject to deserialize sub-component
                if (schemaIOType.defaultDeserializationMethod === 'fromStateObject') {
                    // @ts-expect-error, I don't know how to tell typescript that we are accessing an expected key on the PhetioObject subtype. Likely there is no way with making things generic.
                    coreObject[coreObjectAccessorName] = this.compositeSchema[stateKey].fromStateObject(stateObject[stateKey]);
                } else {
                    assert && assert(schemaIOType.defaultDeserializationMethod === 'applyState', 'unexpected deserialization method');
                    // Using applyState to deserialize sub-component
                    // @ts-expect-error, I don't know how to tell typescript that we are accessing an expected key on the PhetioObject subtype. Likely there is no way with making things generic.
                    this.compositeSchema[stateKey].applyState(coreObject[coreObjectAccessorName], stateObject[stateKey]);
                }
            }
        }
    }
    /**
   * This method provides a default implementation for creating a stateObject from the stateSchema by accessing those
   * same key names on the coreObject instance. It supports those keys as private, underscore-prefixed field, as
   * well as if the coreObject has an es5 getter instead of an actual field.
   */ defaultToStateObject(coreObject) {
        assert && assert(this.isComposite(), 'defaultToStateObject from stateSchema only applies to composite stateSchemas');
        const stateObject = {};
        for(const stateKey in this.compositeSchema){
            if (this.compositeSchema.hasOwnProperty(stateKey)) {
                const coreObjectAccessorName = this.getCoreObjectAccessorName(stateKey, coreObject);
                if (assert) {
                    const descriptor = Object.getOwnPropertyDescriptor(coreObject, coreObjectAccessorName);
                    let isGetter = false;
                    // @ts-expect-error Subtype T for this method better
                    if (coreObject.constructor.prototype) {
                        // The prototype is what has the getter on it
                        // @ts-expect-error Subtype T for this method better
                        const prototypeDescriptor = Object.getOwnPropertyDescriptor(coreObject.constructor.prototype, coreObjectAccessorName);
                        isGetter = !!prototypeDescriptor && !!prototypeDescriptor.get;
                    }
                    const isValue = !!descriptor && descriptor.hasOwnProperty('value') && descriptor.writable;
                    assert && assert(isValue || isGetter, `cannot get state because coreObject does not have expected schema key: ${coreObjectAccessorName}`);
                }
                // @ts-expect-error https://github.com/phetsims/tandem/issues/261
                stateObject[stateKey] = this.compositeSchema[stateKey].toStateObject(coreObject[coreObjectAccessorName]);
            }
        }
        return stateObject;
    }
    /**
   * Provide the member string key that should be used to get/set an instance's field. Used only internally for the
   * default implementations of toStateObject and applyState.
   */ getCoreObjectAccessorName(stateKey, coreObject) {
        assert && assert(!stateKey.startsWith('__'), 'State keys should not start with too many underscores: ' + stateKey + '. When serializing ', coreObject);
        // Does the class field start with an underscore? We need to cover two cases here. The first is where the underscore
        // was added to make a private state key. The second, is where the core class only has the underscore-prefixed
        // field key name available for setting. The easiest algorithm to cover all cases is to see if the coreObject has
        // the underscore-prefixed key name, and use that if available, otherwise use the stateKey without an underscore.
        const noUnderscore = stateKey.startsWith('_') ? stateKey.substring(1) : stateKey;
        const underscored = `_${noUnderscore}`;
        let coreObjectAccessorName;
        // @ts-expect-error - T is not specific to composite schemas, so NumberIO doesn't actually need a hasOwnProperty method
        if (coreObject.hasOwnProperty(underscored)) {
            coreObjectAccessorName = underscored;
        } else {
            coreObjectAccessorName = noUnderscore;
        }
        return coreObjectAccessorName;
    }
    /**
   * True if the StateSchema is a composite schema. See the header documentation in this file for the definition
   * of "composite" schema.
   */ isComposite() {
        return !!this.compositeSchema;
    }
    /**
   * Check if a given stateObject is as valid as can be determined by this StateSchema. Will return null if valid, but
   * needs more checking up and down the hierarchy.
   *
   * @param stateObject - the stateObject to validate against
   * @param toAssert - whether to assert when invalid
   * @param schemaKeysPresentInStateObject - to be populated with any keys this StateSchema is responsible for.
   * @returns boolean if validity can be checked, null if valid, but next in the hierarchy is needed
   */ checkStateObjectValid(stateObject, toAssert, schemaKeysPresentInStateObject) {
        if (this.isComposite()) {
            const compositeStateObject = stateObject;
            const schema = this.compositeSchema;
            let valid = null;
            if (!compositeStateObject) {
                assert && toAssert && assert(false, 'There was no stateObject, but there was a state schema saying there should be', schema);
                valid = false;
                return valid;
            }
            const keys = Object.keys(schema);
            keys.forEach((key)=>{
                if (typeof key === 'string') {
                    if (!compositeStateObject.hasOwnProperty(key)) {
                        assert && toAssert && assert(false, `${key} in state schema but not in the state object`);
                        valid = false;
                    } else {
                        if (!schema[key].isStateObjectValid(compositeStateObject[key], false)) {
                            assert && toAssert && assert(false, `stateObject is not valid for ${key}. stateObject=`, compositeStateObject[key], 'schema=', schema[key]);
                            valid = false;
                        }
                    }
                    schemaKeysPresentInStateObject.push(key);
                } else {
                    console.error('key should be a string', key);
                    assert && assert(false, 'key should be a string');
                }
            });
            return valid;
        } else {
            assert && assert(this.validator, 'validator must be present if not composite');
            const valueStateObject = stateObject;
            if (assert && toAssert) {
                const validationError = Validation.getValidationError(valueStateObject, this.validator);
                assert(validationError === null, 'valueStateObject failed validation', valueStateObject, validationError);
            }
            return Validation.isValueValid(valueStateObject, this.validator);
        }
    }
    /**
   * Get a list of all IOTypes associated with this StateSchema
   */ getRelatedTypes() {
        const relatedTypes = [];
        if (this.compositeSchema) {
            const keys = Object.keys(this.compositeSchema);
            keys.forEach((stateSchemaKey)=>{
                this.compositeSchema[stateSchemaKey] instanceof IOType && relatedTypes.push(this.compositeSchema[stateSchemaKey]);
            });
        }
        return relatedTypes;
    }
    /**
   * Returns a unique identified for this stateSchema, or an object of the stateSchemas for each sub-component in the composite
   * (phet-io internal)
   */ getStateSchemaAPI() {
        if (this.isComposite()) {
            return _.mapValues(this.compositeSchema, (value)=>value.typeName);
        } else {
            return this.displayString;
        }
    }
    /**
   * Factory function for StateSchema instances that represent a single value of state. This is opposed to a composite
   * schema of sub-components.
   */ static asValue(displayString, validator) {
        assert && assert(validator, 'validator required');
        return new StateSchema({
            validator: validator,
            displayString: displayString
        });
    }
    constructor(providedOptions){
        // Either create with compositeSchema, or specify a that this state is just a value
        assert && assertMutuallyExclusiveOptions(providedOptions, [
            'compositeSchema',
            'apiStateKeys'
        ], [
            'displayString',
            'validator'
        ]);
        const options = optionize()({
            displayString: '',
            validator: null,
            compositeSchema: null,
            apiStateKeys: null
        }, providedOptions);
        this.displayString = options.displayString;
        this.validator = options.validator;
        this.compositeSchema = options.compositeSchema;
        this.apiStateKeys = options.apiStateKeys;
        if (assert && options.apiStateKeys) {
            assert && assert(options.compositeSchema, 'apiStateKeys can only be specified by a composite state schema.');
            assert && options.apiStateKeys.forEach((apiStateKey)=>{
                assert && assert(options.compositeSchema.hasOwnProperty(apiStateKey), `apiStateKey not part of composite state schema: ${apiStateKey}`);
            });
        }
    }
};
export { StateSchema as default };
tandemNamespace.register('StateSchema', StateSchema);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdGF0ZVNjaGVtYS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDbGFzcyByZXNwb25zaWJsZSBmb3Igc3RvcmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc2NoZW1hIG9mIFBoRVQtaU8gc3RhdGUuIFNlZSBJT1R5cGUgc3RhdGVTY2hlbWEgb3B0aW9uIGZvciB1c2FnZVxuICogYW5kIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogVGhlcmUgYXJlIHR3byB0eXBlcyBvZiBTdGF0ZVNjaGVtYTpcbiAqIC0gVGhlIGZpcnN0IGlzIGEgc3RhdGVTY2hlbWEgXCJ2YWx1ZVwiLiBUaGlzIGlzIHdoZW4gdGhlIHN0YXRlIG9mIGFuIElPVHlwZSBpcyBpdHNlbGYgYSB2YWx1ZSBpbiB0aGUgc3RhdGUuIEluXG4gKiBlZmZlY3QsIHRoaXMganVzdCBzZXJ2ZXMgYXMgYm9pbGVycGxhdGUsIGFuZCBpc24ndCB0aGUgcHJpbWFyeSB1c2FnZSBvZiBzdGF0ZVNjaGVtYS4gRm9yIGV4YW1wbGUsIGEgU3RyaW5nSU8gb3JcbiAqIE51bWJlcklPLlxuICogLSBUaGUgc2Vjb25kIGlzIGEgXCJjb21wb3NpdGVcIiwgd2hlcmUgdGhlIHN0YXRlIG9mIGFuIElPVHlwZSBpcyBtYWRlIGZyb20gc3ViY29tcG9uZW50cywgZWFjaCBvZiB3aGljaCBoYXZlIGFuIElPVHlwZS5cbiAqIEEgY29tcG9zaXRlIHNjaGVtYSB3YXMgbmFtZWQgYmVjYXVzZSBpdCBpcyBhIHN1bSBvZiBpdHMgcGFydHMuIEZvciBleGFtcGxlIGEgQnVubnlJTyBoYXMgbXVsdGlwbGUgY29tcG9uZW50cyB0aGF0XG4gKiBtYWtlIGl0IHVwIChtb3RoZXIvZmF0aGVyL2FnZS9ldGMpLiBDaGVjayB3aGljaCB0eXBlIG9mIFN0YXRlU2NoZW1hIHlvdXIgaW5zdGFuY2UgaXMgd2l0aCBTdGF0ZVNjaGVtYS5pc0NvbXBvc2l0ZSgpLlxuICpcbiAqIFdoZW4gc3RvcmVkIGluIHRoZSBBUEksIFN0YXRlU2NoZW1hIHZhbHVlcyBhcmUgc3RvcmVkIGFzIHN0cmluZ3MsIHNlZSBTdGF0ZVNjaGVtYS5hc1ZhbHVlLCBhbmQgY29tcG9zaXRlIHN0YXRlIHNjaGVtYXNcbiAqIGFyZSBzdG9yZWQgYXMgb2JqZWN0cyB3aXRoIHZhbHVlcyB0aGF0IGFyZSBlYWNoIElPVHlwZSBuYW1lcy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWYWxpZGF0aW9uLCB7IFZhbGlkYXRvciB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVmFsaWRhdGlvbi5qcyc7XG5pbXBvcnQgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IHsgSU9UeXBlTmFtZSB9IGZyb20gJy4uL3BoZXQtaW8tdHlwZXMuanMnO1xuaW1wb3J0IHRhbmRlbU5hbWVzcGFjZSBmcm9tICcuLi90YW5kZW1OYW1lc3BhY2UuanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuL0lPVHlwZS5qcyc7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgcHJpbWFyeSBmdW5jdGlvbmFsaXR5IG9mIHRoZSBTdGF0ZVNjaGVtYSBjbGFzcy4gQW4gSU9UeXBlIGNhbiBiZSBwcm92aWRlZCBhIGNvbXBvc2l0ZSBzY2hlbWEgbGlrZSBzbzpcbiAqIHtcbiAqICAgc3ViY29tcG9uZW50MTogU3RyaW5nSU87XG4gKiAgIHN1YmNvbXBvbmVudDI6IE51bWJlcklPO1xuICogfVxuICogQnkgcHJvdmlkaW5nIHRoaXMsIHlvdSBhcmUgZ2l2aW5nIHRoZSBzY2hlbWEgdG8gYWxsb3cgU3RhdGVTY2hlbWEgdG8gc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBpdHNlbGYgYmFzZWQgb24gdGhlXG4gKiBjb21wb3NpdGUgc2NoZW1hLlxuICovXG5leHBvcnQgdHlwZSBDb21wb3NpdGVTY2hlbWE8U2VsZlN0YXRlVHlwZT4gPSB7XG4gIC8vIFtLIGluIGtleW9mIFNlbGZTdGF0ZVR5cGVdOiBJT1R5cGUgfCB7IG15SU9UeXBlOiBJT1R5cGU7IGlzQVBJU3RhdGVmdWw6IHRydWUgfTtcbiAgW0sgaW4ga2V5b2YgU2VsZlN0YXRlVHlwZV06IElPVHlwZVxufTtcblxuZXhwb3J0IHR5cGUgQVBJU3RhdGVLZXlzID0gc3RyaW5nW107XG5cbi8vIEFzIHByb3ZpZGVkIGluIHRoZSBQaEVULWlPIEFQSSBqc29uLlxudHlwZSBDb21wb3NpdGVTY2hlbWFBUEkgPSBSZWNvcmQ8c3RyaW5nLCBJT1R5cGVOYW1lPjtcblxuLy8gVGhlIHNjaGVtYSBvZiB0aGUgc3RhdGVPYmplY3QgdmFsdWVcbmV4cG9ydCB0eXBlIENvbXBvc2l0ZVN0YXRlT2JqZWN0VHlwZSA9IFJlY29yZDxzdHJpbmcsIEludGVudGlvbmFsQW55PjtcblxuLy8gUGx1Y2sgdGhlIHJlc3VsdCB0b1N0YXRlT2JqZWN0IHR5cGVzIGZyb20gdGhlIENvbXBvc2l0ZVNjaGVtYS4gRm9yIGluc3RhbmNlLCBtYXAgYSBzdGF0ZSBzY2hlbWEgbGlrZSBzbzpcbi8vIHtuYW1lOiBTdHJpbmdJT30gPT4ge25hbWU6IHN0cmluZ31cbmV4cG9ydCB0eXBlIFN0YXRlT2JqZWN0PFQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBJT1R5cGU+PiA9IHtcbiAgW2tleSBpbiBrZXlvZiBUXTogUmV0dXJuVHlwZTxUW2tleV1bJ3RvU3RhdGVPYmplY3QnXT47XG59O1xuXG50eXBlIFN0YXRlU2NoZW1hT3B0aW9uczxTZWxmU3RhdGVUeXBlPiA9IHtcblxuICAvLyBXaGF0IHRoZSBJT1R5cGUgd2lsbCBkaXNwbGF5IGFzIGluIHRoZSBBUEkuXG4gIGRpc3BsYXlTdHJpbmc/OiBzdHJpbmc7XG5cbiAgLy8gUHJvdmlkZWQgdG8gdmFsaWRhdGUgdGhlIGNvbnRlbnRzIG9mIHRoZSBzdGF0ZU9iamVjdC4gTm90IHRoZSBpbnN0YW5jZSBpdCBjYW1lIGZyb21cbiAgdmFsaWRhdG9yPzogVmFsaWRhdG9yPEludGVudGlvbmFsQW55PiB8IG51bGw7XG5cbiAgLy8gVGhlIHByaW1hcnkgd2F5IHRvIHByb3ZpZGUgdGhlIGRldGFpbGVkIHNjaGVtYSBhYm91dCB0aGUgc3RhdGUgZm9yIHRoaXMgaW5zdGFuY2UuIENvbXBvc2l0ZSBzY2hlbWFzIGFyZSBhIHN1bSBvZlxuICAvLyB0aGVpciBzdGF0ZWZ1bCBwYXJ0cywgaW5zdGVhZCBvZiBhIFwidmFsdWVcIiB0aGVtc2VsdmVzLlxuICAvLyBBbiBvYmplY3QgbGl0ZXJhbCBvZiBrZXlzIHRoYXQgY29ycmVzcG9uZCB0byBhbiBJT1R5cGVcbiAgY29tcG9zaXRlU2NoZW1hPzogbnVsbCB8IENvbXBvc2l0ZVNjaGVtYTxTZWxmU3RhdGVUeXBlPjtcblxuICAvLyBBIGxpc3Qgb2Yga2V5cyBmb3VuZCBpbiB0aGlzIElPVHlwZSdzIGNvbXBvc2l0ZSBzdGF0ZSB0aGF0IHNob3VsZCBiZSBBUEkgdHJhY2tlZC4gU2VlIElPVHlwZSBvcHRpb25zLmFwaVN0YXRlS2V5c1xuICAvLyBmb3IgbW9yZSBpbmZvLlxuICBhcGlTdGF0ZUtleXM/OiBBUElTdGF0ZUtleXMgfCBudWxsO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGVTY2hlbWE8VCwgU2VsZlN0YXRlVHlwZT4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGRpc3BsYXlTdHJpbmc6IHN0cmluZztcbiAgcHJpdmF0ZSByZWFkb25seSB2YWxpZGF0b3I6IFZhbGlkYXRvcjxTZWxmU3RhdGVUeXBlPiB8IG51bGw7XG5cbiAgLy8gXCJjb21wb3NpdGVcIiBzdGF0ZSBzY2hlbWFzIGFyZSB0cmVhdGVkIGRpZmZlcmVudGx5IHRoYXQgdmFsdWUgc3RhdGUgc2NoZW1hc1xuICBwdWJsaWMgcmVhZG9ubHkgY29tcG9zaXRlU2NoZW1hOiBudWxsIHwgQ29tcG9zaXRlU2NoZW1hPFNlbGZTdGF0ZVR5cGU+O1xuICBwdWJsaWMgcmVhZG9ubHkgYXBpU3RhdGVLZXlzOiBBUElTdGF0ZUtleXMgfCBudWxsO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogU3RhdGVTY2hlbWFPcHRpb25zPFNlbGZTdGF0ZVR5cGU+ICkge1xuXG4gICAgLy8gRWl0aGVyIGNyZWF0ZSB3aXRoIGNvbXBvc2l0ZVNjaGVtYSwgb3Igc3BlY2lmeSBhIHRoYXQgdGhpcyBzdGF0ZSBpcyBqdXN0IGEgdmFsdWVcbiAgICBhc3NlcnQgJiYgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBwcm92aWRlZE9wdGlvbnMsXG4gICAgICBbICdjb21wb3NpdGVTY2hlbWEnLCAnYXBpU3RhdGVLZXlzJyBdLFxuICAgICAgWyAnZGlzcGxheVN0cmluZycsICd2YWxpZGF0b3InIF1cbiAgICApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTdGF0ZVNjaGVtYU9wdGlvbnM8U2VsZlN0YXRlVHlwZT4+KCkoIHtcbiAgICAgIGRpc3BsYXlTdHJpbmc6ICcnLFxuICAgICAgdmFsaWRhdG9yOiBudWxsLFxuICAgICAgY29tcG9zaXRlU2NoZW1hOiBudWxsLFxuICAgICAgYXBpU3RhdGVLZXlzOiBudWxsXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB0aGlzLmRpc3BsYXlTdHJpbmcgPSBvcHRpb25zLmRpc3BsYXlTdHJpbmc7XG4gICAgdGhpcy52YWxpZGF0b3IgPSBvcHRpb25zLnZhbGlkYXRvcjtcblxuICAgIHRoaXMuY29tcG9zaXRlU2NoZW1hID0gb3B0aW9ucy5jb21wb3NpdGVTY2hlbWE7XG4gICAgdGhpcy5hcGlTdGF0ZUtleXMgPSBvcHRpb25zLmFwaVN0YXRlS2V5cztcblxuICAgIGlmICggYXNzZXJ0ICYmIG9wdGlvbnMuYXBpU3RhdGVLZXlzICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5jb21wb3NpdGVTY2hlbWEsICdhcGlTdGF0ZUtleXMgY2FuIG9ubHkgYmUgc3BlY2lmaWVkIGJ5IGEgY29tcG9zaXRlIHN0YXRlIHNjaGVtYS4nICk7XG4gICAgICBhc3NlcnQgJiYgb3B0aW9ucy5hcGlTdGF0ZUtleXMuZm9yRWFjaCggYXBpU3RhdGVLZXkgPT4ge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmNvbXBvc2l0ZVNjaGVtYSEuaGFzT3duUHJvcGVydHkoIGFwaVN0YXRlS2V5ICksXG4gICAgICAgICAgYGFwaVN0YXRlS2V5IG5vdCBwYXJ0IG9mIGNvbXBvc2l0ZSBzdGF0ZSBzY2hlbWE6ICR7YXBpU3RhdGVLZXl9YCApO1xuICAgICAgfSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBwcm92aWRlcyBhIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gZm9yIHNldHRpbmcgYSBzdGF0ZU9iamVjdCBvbnRvIGFuIG9iamVjdCBmcm9tIHRoZSBzdGF0ZVNjaGVtYSBpbmZvcm1hdGlvbi5cbiAgICogSXQgc3VwcG9ydHMgdGhlIGNvcmVPYmplY3Qga2V5cyBhcyBwcml2YXRlLCB1bmRlcnNjb3JlLXByZWZpeGVkIGZpZWxkLCBhc1xuICAgKiB3ZWxsIGFzIGlmIHRoZSBjb3JlT2JqZWN0IGhhcyBhbiBlczUgc2V0dGVyIGluc3RlYWQgb2YgYW4gYWN0dWFsIGZpZWxkLlxuICAgKi9cbiAgcHVibGljIGRlZmF1bHRBcHBseVN0YXRlKCBjb3JlT2JqZWN0OiBULCBzdGF0ZU9iamVjdDogQ29tcG9zaXRlU3RhdGVPYmplY3RUeXBlICk6IHZvaWQge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0NvbXBvc2l0ZSgpLCAnZGVmYXVsdEFwcGx5U3RhdGUgZnJvbSBzdGF0ZVNjaGVtYSBvbmx5IGFwcGxpZXMgdG8gY29tcG9zaXRlIHN0YXRlU2NoZW1hcycgKTtcbiAgICBmb3IgKCBjb25zdCBzdGF0ZUtleSBpbiB0aGlzLmNvbXBvc2l0ZVNjaGVtYSApIHtcbiAgICAgIGlmICggdGhpcy5jb21wb3NpdGVTY2hlbWEuaGFzT3duUHJvcGVydHkoIHN0YXRlS2V5ICkgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0YXRlT2JqZWN0Lmhhc093blByb3BlcnR5KCBzdGF0ZUtleSApLCBgc3RhdGVPYmplY3QgZG9lcyBub3QgaGF2ZSBleHBlY3RlZCBzY2hlbWEga2V5OiAke3N0YXRlS2V5fWAgKTtcblxuICAgICAgICAvLyBUaGUgSU9UeXBlIGZvciB0aGUga2V5IGluIHRoZSBjb21wb3NpdGUuXG4gICAgICAgIGNvbnN0IHNjaGVtYUlPVHlwZSA9IHRoaXMuY29tcG9zaXRlU2NoZW1hWyBzdGF0ZUtleSBdO1xuXG4gICAgICAgIGNvbnN0IGNvcmVPYmplY3RBY2Nlc3Nvck5hbWUgPSB0aGlzLmdldENvcmVPYmplY3RBY2Nlc3Nvck5hbWUoIHN0YXRlS2V5LCBjb3JlT2JqZWN0ICk7XG5cbiAgICAgICAgLy8gVXNpbmcgZnJvbVN0YXRlT2JqZWN0IHRvIGRlc2VyaWFsaXplIHN1Yi1jb21wb25lbnRcbiAgICAgICAgaWYgKCBzY2hlbWFJT1R5cGUuZGVmYXVsdERlc2VyaWFsaXphdGlvbk1ldGhvZCA9PT0gJ2Zyb21TdGF0ZU9iamVjdCcgKSB7XG5cbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yLCBJIGRvbid0IGtub3cgaG93IHRvIHRlbGwgdHlwZXNjcmlwdCB0aGF0IHdlIGFyZSBhY2Nlc3NpbmcgYW4gZXhwZWN0ZWQga2V5IG9uIHRoZSBQaGV0aW9PYmplY3Qgc3VidHlwZS4gTGlrZWx5IHRoZXJlIGlzIG5vIHdheSB3aXRoIG1ha2luZyB0aGluZ3MgZ2VuZXJpYy5cbiAgICAgICAgICBjb3JlT2JqZWN0WyBjb3JlT2JqZWN0QWNjZXNzb3JOYW1lIF0gPSB0aGlzLmNvbXBvc2l0ZVNjaGVtYVsgc3RhdGVLZXkgXS5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0WyBzdGF0ZUtleSBdICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2NoZW1hSU9UeXBlLmRlZmF1bHREZXNlcmlhbGl6YXRpb25NZXRob2QgPT09ICdhcHBseVN0YXRlJywgJ3VuZXhwZWN0ZWQgZGVzZXJpYWxpemF0aW9uIG1ldGhvZCcgKTtcblxuICAgICAgICAgIC8vIFVzaW5nIGFwcGx5U3RhdGUgdG8gZGVzZXJpYWxpemUgc3ViLWNvbXBvbmVudFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IsIEkgZG9uJ3Qga25vdyBob3cgdG8gdGVsbCB0eXBlc2NyaXB0IHRoYXQgd2UgYXJlIGFjY2Vzc2luZyBhbiBleHBlY3RlZCBrZXkgb24gdGhlIFBoZXRpb09iamVjdCBzdWJ0eXBlLiBMaWtlbHkgdGhlcmUgaXMgbm8gd2F5IHdpdGggbWFraW5nIHRoaW5ncyBnZW5lcmljLlxuICAgICAgICAgIHRoaXMuY29tcG9zaXRlU2NoZW1hWyBzdGF0ZUtleSBdLmFwcGx5U3RhdGUoIGNvcmVPYmplY3RbIGNvcmVPYmplY3RBY2Nlc3Nvck5hbWUgXSwgc3RhdGVPYmplY3RbIHN0YXRlS2V5IF0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBwcm92aWRlcyBhIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gZm9yIGNyZWF0aW5nIGEgc3RhdGVPYmplY3QgZnJvbSB0aGUgc3RhdGVTY2hlbWEgYnkgYWNjZXNzaW5nIHRob3NlXG4gICAqIHNhbWUga2V5IG5hbWVzIG9uIHRoZSBjb3JlT2JqZWN0IGluc3RhbmNlLiBJdCBzdXBwb3J0cyB0aG9zZSBrZXlzIGFzIHByaXZhdGUsIHVuZGVyc2NvcmUtcHJlZml4ZWQgZmllbGQsIGFzXG4gICAqIHdlbGwgYXMgaWYgdGhlIGNvcmVPYmplY3QgaGFzIGFuIGVzNSBnZXR0ZXIgaW5zdGVhZCBvZiBhbiBhY3R1YWwgZmllbGQuXG4gICAqL1xuICBwdWJsaWMgZGVmYXVsdFRvU3RhdGVPYmplY3QoIGNvcmVPYmplY3Q6IFQgKTogU2VsZlN0YXRlVHlwZSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0NvbXBvc2l0ZSgpLCAnZGVmYXVsdFRvU3RhdGVPYmplY3QgZnJvbSBzdGF0ZVNjaGVtYSBvbmx5IGFwcGxpZXMgdG8gY29tcG9zaXRlIHN0YXRlU2NoZW1hcycgKTtcblxuICAgIGNvbnN0IHN0YXRlT2JqZWN0ID0ge307XG4gICAgZm9yICggY29uc3Qgc3RhdGVLZXkgaW4gdGhpcy5jb21wb3NpdGVTY2hlbWEgKSB7XG4gICAgICBpZiAoIHRoaXMuY29tcG9zaXRlU2NoZW1hLmhhc093blByb3BlcnR5KCBzdGF0ZUtleSApICkge1xuXG4gICAgICAgIGNvbnN0IGNvcmVPYmplY3RBY2Nlc3Nvck5hbWUgPSB0aGlzLmdldENvcmVPYmplY3RBY2Nlc3Nvck5hbWUoIHN0YXRlS2V5LCBjb3JlT2JqZWN0ICk7XG5cbiAgICAgICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICAgICAgY29uc3QgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoIGNvcmVPYmplY3QsIGNvcmVPYmplY3RBY2Nlc3Nvck5hbWUgKSE7XG5cbiAgICAgICAgICBsZXQgaXNHZXR0ZXIgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgU3VidHlwZSBUIGZvciB0aGlzIG1ldGhvZCBiZXR0ZXJcbiAgICAgICAgICBpZiAoIGNvcmVPYmplY3QuY29uc3RydWN0b3IucHJvdG90eXBlICkge1xuXG4gICAgICAgICAgICAvLyBUaGUgcHJvdG90eXBlIGlzIHdoYXQgaGFzIHRoZSBnZXR0ZXIgb24gaXRcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgU3VidHlwZSBUIGZvciB0aGlzIG1ldGhvZCBiZXR0ZXJcbiAgICAgICAgICAgIGNvbnN0IHByb3RvdHlwZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKCBjb3JlT2JqZWN0LmNvbnN0cnVjdG9yIS5wcm90b3R5cGUsIGNvcmVPYmplY3RBY2Nlc3Nvck5hbWUgKTtcbiAgICAgICAgICAgIGlzR2V0dGVyID0gISFwcm90b3R5cGVEZXNjcmlwdG9yICYmICEhcHJvdG90eXBlRGVzY3JpcHRvci5nZXQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaXNWYWx1ZSA9ICEhZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCAndmFsdWUnICkgJiYgZGVzY3JpcHRvci53cml0YWJsZTtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1ZhbHVlIHx8IGlzR2V0dGVyLFxuICAgICAgICAgICAgYGNhbm5vdCBnZXQgc3RhdGUgYmVjYXVzZSBjb3JlT2JqZWN0IGRvZXMgbm90IGhhdmUgZXhwZWN0ZWQgc2NoZW1hIGtleTogJHtjb3JlT2JqZWN0QWNjZXNzb3JOYW1lfWAgKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy8yNjFcbiAgICAgICAgc3RhdGVPYmplY3RbIHN0YXRlS2V5IF0gPSB0aGlzLmNvbXBvc2l0ZVNjaGVtYVsgc3RhdGVLZXkgXS50b1N0YXRlT2JqZWN0KCBjb3JlT2JqZWN0WyBjb3JlT2JqZWN0QWNjZXNzb3JOYW1lIF0gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlT2JqZWN0IGFzIFNlbGZTdGF0ZVR5cGU7XG4gIH1cblxuICAvKipcbiAgICogUHJvdmlkZSB0aGUgbWVtYmVyIHN0cmluZyBrZXkgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBnZXQvc2V0IGFuIGluc3RhbmNlJ3MgZmllbGQuIFVzZWQgb25seSBpbnRlcm5hbGx5IGZvciB0aGVcbiAgICogZGVmYXVsdCBpbXBsZW1lbnRhdGlvbnMgb2YgdG9TdGF0ZU9iamVjdCBhbmQgYXBwbHlTdGF0ZS5cbiAgICovXG4gIHByaXZhdGUgZ2V0Q29yZU9iamVjdEFjY2Vzc29yTmFtZSggc3RhdGVLZXk6IHN0cmluZywgY29yZU9iamVjdDogVCApOiBzdHJpbmcge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXN0YXRlS2V5LnN0YXJ0c1dpdGgoICdfXycgKSwgJ1N0YXRlIGtleXMgc2hvdWxkIG5vdCBzdGFydCB3aXRoIHRvbyBtYW55IHVuZGVyc2NvcmVzOiAnICsgc3RhdGVLZXkgKyAnLiBXaGVuIHNlcmlhbGl6aW5nICcsIGNvcmVPYmplY3QgKTtcblxuICAgIC8vIERvZXMgdGhlIGNsYXNzIGZpZWxkIHN0YXJ0IHdpdGggYW4gdW5kZXJzY29yZT8gV2UgbmVlZCB0byBjb3ZlciB0d28gY2FzZXMgaGVyZS4gVGhlIGZpcnN0IGlzIHdoZXJlIHRoZSB1bmRlcnNjb3JlXG4gICAgLy8gd2FzIGFkZGVkIHRvIG1ha2UgYSBwcml2YXRlIHN0YXRlIGtleS4gVGhlIHNlY29uZCwgaXMgd2hlcmUgdGhlIGNvcmUgY2xhc3Mgb25seSBoYXMgdGhlIHVuZGVyc2NvcmUtcHJlZml4ZWRcbiAgICAvLyBmaWVsZCBrZXkgbmFtZSBhdmFpbGFibGUgZm9yIHNldHRpbmcuIFRoZSBlYXNpZXN0IGFsZ29yaXRobSB0byBjb3ZlciBhbGwgY2FzZXMgaXMgdG8gc2VlIGlmIHRoZSBjb3JlT2JqZWN0IGhhc1xuICAgIC8vIHRoZSB1bmRlcnNjb3JlLXByZWZpeGVkIGtleSBuYW1lLCBhbmQgdXNlIHRoYXQgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgdXNlIHRoZSBzdGF0ZUtleSB3aXRob3V0IGFuIHVuZGVyc2NvcmUuXG4gICAgY29uc3Qgbm9VbmRlcnNjb3JlID0gc3RhdGVLZXkuc3RhcnRzV2l0aCggJ18nICkgPyBzdGF0ZUtleS5zdWJzdHJpbmcoIDEgKSA6IHN0YXRlS2V5O1xuICAgIGNvbnN0IHVuZGVyc2NvcmVkID0gYF8ke25vVW5kZXJzY29yZX1gO1xuICAgIGxldCBjb3JlT2JqZWN0QWNjZXNzb3JOYW1lOiBzdHJpbmc7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVCBpcyBub3Qgc3BlY2lmaWMgdG8gY29tcG9zaXRlIHNjaGVtYXMsIHNvIE51bWJlcklPIGRvZXNuJ3QgYWN0dWFsbHkgbmVlZCBhIGhhc093blByb3BlcnR5IG1ldGhvZFxuICAgIGlmICggY29yZU9iamVjdC5oYXNPd25Qcm9wZXJ0eSggdW5kZXJzY29yZWQgKSApIHtcbiAgICAgIGNvcmVPYmplY3RBY2Nlc3Nvck5hbWUgPSB1bmRlcnNjb3JlZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb3JlT2JqZWN0QWNjZXNzb3JOYW1lID0gbm9VbmRlcnNjb3JlO1xuICAgIH1cbiAgICByZXR1cm4gY29yZU9iamVjdEFjY2Vzc29yTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnVlIGlmIHRoZSBTdGF0ZVNjaGVtYSBpcyBhIGNvbXBvc2l0ZSBzY2hlbWEuIFNlZSB0aGUgaGVhZGVyIGRvY3VtZW50YXRpb24gaW4gdGhpcyBmaWxlIGZvciB0aGUgZGVmaW5pdGlvblxuICAgKiBvZiBcImNvbXBvc2l0ZVwiIHNjaGVtYS5cbiAgICovXG4gIHB1YmxpYyBpc0NvbXBvc2l0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLmNvbXBvc2l0ZVNjaGVtYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIGdpdmVuIHN0YXRlT2JqZWN0IGlzIGFzIHZhbGlkIGFzIGNhbiBiZSBkZXRlcm1pbmVkIGJ5IHRoaXMgU3RhdGVTY2hlbWEuIFdpbGwgcmV0dXJuIG51bGwgaWYgdmFsaWQsIGJ1dFxuICAgKiBuZWVkcyBtb3JlIGNoZWNraW5nIHVwIGFuZCBkb3duIHRoZSBoaWVyYXJjaHkuXG4gICAqXG4gICAqIEBwYXJhbSBzdGF0ZU9iamVjdCAtIHRoZSBzdGF0ZU9iamVjdCB0byB2YWxpZGF0ZSBhZ2FpbnN0XG4gICAqIEBwYXJhbSB0b0Fzc2VydCAtIHdoZXRoZXIgdG8gYXNzZXJ0IHdoZW4gaW52YWxpZFxuICAgKiBAcGFyYW0gc2NoZW1hS2V5c1ByZXNlbnRJblN0YXRlT2JqZWN0IC0gdG8gYmUgcG9wdWxhdGVkIHdpdGggYW55IGtleXMgdGhpcyBTdGF0ZVNjaGVtYSBpcyByZXNwb25zaWJsZSBmb3IuXG4gICAqIEByZXR1cm5zIGJvb2xlYW4gaWYgdmFsaWRpdHkgY2FuIGJlIGNoZWNrZWQsIG51bGwgaWYgdmFsaWQsIGJ1dCBuZXh0IGluIHRoZSBoaWVyYXJjaHkgaXMgbmVlZGVkXG4gICAqL1xuICBwdWJsaWMgY2hlY2tTdGF0ZU9iamVjdFZhbGlkKCBzdGF0ZU9iamVjdDogU2VsZlN0YXRlVHlwZSwgdG9Bc3NlcnQ6IGJvb2xlYW4sIHNjaGVtYUtleXNQcmVzZW50SW5TdGF0ZU9iamVjdDogc3RyaW5nW10gKTogYm9vbGVhbiB8IG51bGwge1xuICAgIGlmICggdGhpcy5pc0NvbXBvc2l0ZSgpICkge1xuICAgICAgY29uc3QgY29tcG9zaXRlU3RhdGVPYmplY3QgPSBzdGF0ZU9iamVjdCBhcyBDb21wb3NpdGVTdGF0ZU9iamVjdFR5cGU7XG4gICAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmNvbXBvc2l0ZVNjaGVtYSE7XG5cbiAgICAgIGxldCB2YWxpZCA9IG51bGw7XG4gICAgICBpZiAoICFjb21wb3NpdGVTdGF0ZU9iamVjdCApIHtcbiAgICAgICAgYXNzZXJ0ICYmIHRvQXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdUaGVyZSB3YXMgbm8gc3RhdGVPYmplY3QsIGJ1dCB0aGVyZSB3YXMgYSBzdGF0ZSBzY2hlbWEgc2F5aW5nIHRoZXJlIHNob3VsZCBiZScsIHNjaGVtYSApO1xuICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdmFsaWQ7XG4gICAgICB9XG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoIHNjaGVtYSApIGFzICgga2V5b2YgQ29tcG9zaXRlU2NoZW1hPFNlbGZTdGF0ZVR5cGU+IClbXTtcbiAgICAgIGtleXMuZm9yRWFjaCgga2V5ID0+IHtcblxuICAgICAgICBpZiAoIHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnICkge1xuXG4gICAgICAgICAgaWYgKCAhY29tcG9zaXRlU3RhdGVPYmplY3QuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xuICAgICAgICAgICAgYXNzZXJ0ICYmIHRvQXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsIGAke2tleX0gaW4gc3RhdGUgc2NoZW1hIGJ1dCBub3QgaW4gdGhlIHN0YXRlIG9iamVjdGAgKTtcbiAgICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCAhc2NoZW1hWyBrZXkgXS5pc1N0YXRlT2JqZWN0VmFsaWQoIGNvbXBvc2l0ZVN0YXRlT2JqZWN0WyBrZXkgXSwgZmFsc2UgKSApIHtcbiAgICAgICAgICAgICAgYXNzZXJ0ICYmIHRvQXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsIGBzdGF0ZU9iamVjdCBpcyBub3QgdmFsaWQgZm9yICR7a2V5fS4gc3RhdGVPYmplY3Q9YCwgY29tcG9zaXRlU3RhdGVPYmplY3RbIGtleSBdLCAnc2NoZW1hPScsIHNjaGVtYVsga2V5IF0gKTtcbiAgICAgICAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgc2NoZW1hS2V5c1ByZXNlbnRJblN0YXRlT2JqZWN0LnB1c2goIGtleSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoICdrZXkgc2hvdWxkIGJlIGEgc3RyaW5nJywga2V5ICk7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdrZXkgc2hvdWxkIGJlIGEgc3RyaW5nJyApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgICByZXR1cm4gdmFsaWQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy52YWxpZGF0b3IsICd2YWxpZGF0b3IgbXVzdCBiZSBwcmVzZW50IGlmIG5vdCBjb21wb3NpdGUnICk7XG4gICAgICBjb25zdCB2YWx1ZVN0YXRlT2JqZWN0ID0gc3RhdGVPYmplY3Q7XG5cbiAgICAgIGlmICggYXNzZXJ0ICYmIHRvQXNzZXJ0ICkge1xuICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggdmFsdWVTdGF0ZU9iamVjdCwgdGhpcy52YWxpZGF0b3IhICk7XG4gICAgICAgIGFzc2VydCggdmFsaWRhdGlvbkVycm9yID09PSBudWxsLCAndmFsdWVTdGF0ZU9iamVjdCBmYWlsZWQgdmFsaWRhdGlvbicsIHZhbHVlU3RhdGVPYmplY3QsIHZhbGlkYXRpb25FcnJvciApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIHZhbHVlU3RhdGVPYmplY3QsIHRoaXMudmFsaWRhdG9yISApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBsaXN0IG9mIGFsbCBJT1R5cGVzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIFN0YXRlU2NoZW1hXG4gICAqL1xuICBwdWJsaWMgZ2V0UmVsYXRlZFR5cGVzKCk6IElPVHlwZVtdIHtcbiAgICBjb25zdCByZWxhdGVkVHlwZXM6IElPVHlwZVtdID0gW107XG5cbiAgICBpZiAoIHRoaXMuY29tcG9zaXRlU2NoZW1hICkge1xuXG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoIHRoaXMuY29tcG9zaXRlU2NoZW1hICkgYXMgKCBrZXlvZiBDb21wb3NpdGVTY2hlbWE8U2VsZlN0YXRlVHlwZT4gKVtdO1xuICAgICAga2V5cy5mb3JFYWNoKCBzdGF0ZVNjaGVtYUtleSA9PiB7XG4gICAgICAgIHRoaXMuY29tcG9zaXRlU2NoZW1hIVsgc3RhdGVTY2hlbWFLZXkgXSBpbnN0YW5jZW9mIElPVHlwZSAmJiByZWxhdGVkVHlwZXMucHVzaCggdGhpcy5jb21wb3NpdGVTY2hlbWEhWyBzdGF0ZVNjaGVtYUtleSBdICk7XG4gICAgICB9ICk7XG4gICAgfVxuICAgIHJldHVybiByZWxhdGVkVHlwZXM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdW5pcXVlIGlkZW50aWZpZWQgZm9yIHRoaXMgc3RhdGVTY2hlbWEsIG9yIGFuIG9iamVjdCBvZiB0aGUgc3RhdGVTY2hlbWFzIGZvciBlYWNoIHN1Yi1jb21wb25lbnQgaW4gdGhlIGNvbXBvc2l0ZVxuICAgKiAocGhldC1pbyBpbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXRTdGF0ZVNjaGVtYUFQSSgpOiBzdHJpbmcgfCBDb21wb3NpdGVTY2hlbWFBUEkge1xuICAgIGlmICggdGhpcy5pc0NvbXBvc2l0ZSgpICkge1xuICAgICAgcmV0dXJuIF8ubWFwVmFsdWVzKCB0aGlzLmNvbXBvc2l0ZVNjaGVtYSwgdmFsdWUgPT4gdmFsdWUudHlwZU5hbWUgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNwbGF5U3RyaW5nO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEZhY3RvcnkgZnVuY3Rpb24gZm9yIFN0YXRlU2NoZW1hIGluc3RhbmNlcyB0aGF0IHJlcHJlc2VudCBhIHNpbmdsZSB2YWx1ZSBvZiBzdGF0ZS4gVGhpcyBpcyBvcHBvc2VkIHRvIGEgY29tcG9zaXRlXG4gICAqIHNjaGVtYSBvZiBzdWItY29tcG9uZW50cy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYXNWYWx1ZTxULCBTdGF0ZVR5cGU+KCBkaXNwbGF5U3RyaW5nOiBzdHJpbmcsIHZhbGlkYXRvcjogVmFsaWRhdG9yPEludGVudGlvbmFsQW55PiApOiBTdGF0ZVNjaGVtYTxULCBTdGF0ZVR5cGU+IHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWxpZGF0b3IsICd2YWxpZGF0b3IgcmVxdWlyZWQnICk7XG4gICAgcmV0dXJuIG5ldyBTdGF0ZVNjaGVtYTxULCBTdGF0ZVR5cGU+KCB7XG4gICAgICB2YWxpZGF0b3I6IHZhbGlkYXRvcixcbiAgICAgIGRpc3BsYXlTdHJpbmc6IGRpc3BsYXlTdHJpbmdcbiAgICB9ICk7XG4gIH1cbn1cblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnU3RhdGVTY2hlbWEnLCBTdGF0ZVNjaGVtYSApOyJdLCJuYW1lcyI6WyJWYWxpZGF0aW9uIiwiYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zIiwib3B0aW9uaXplIiwidGFuZGVtTmFtZXNwYWNlIiwiSU9UeXBlIiwiU3RhdGVTY2hlbWEiLCJkZWZhdWx0QXBwbHlTdGF0ZSIsImNvcmVPYmplY3QiLCJzdGF0ZU9iamVjdCIsImFzc2VydCIsImlzQ29tcG9zaXRlIiwic3RhdGVLZXkiLCJjb21wb3NpdGVTY2hlbWEiLCJoYXNPd25Qcm9wZXJ0eSIsInNjaGVtYUlPVHlwZSIsImNvcmVPYmplY3RBY2Nlc3Nvck5hbWUiLCJnZXRDb3JlT2JqZWN0QWNjZXNzb3JOYW1lIiwiZGVmYXVsdERlc2VyaWFsaXphdGlvbk1ldGhvZCIsImZyb21TdGF0ZU9iamVjdCIsImFwcGx5U3RhdGUiLCJkZWZhdWx0VG9TdGF0ZU9iamVjdCIsImRlc2NyaXB0b3IiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJpc0dldHRlciIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwicHJvdG90eXBlRGVzY3JpcHRvciIsImdldCIsImlzVmFsdWUiLCJ3cml0YWJsZSIsInRvU3RhdGVPYmplY3QiLCJzdGFydHNXaXRoIiwibm9VbmRlcnNjb3JlIiwic3Vic3RyaW5nIiwidW5kZXJzY29yZWQiLCJjaGVja1N0YXRlT2JqZWN0VmFsaWQiLCJ0b0Fzc2VydCIsInNjaGVtYUtleXNQcmVzZW50SW5TdGF0ZU9iamVjdCIsImNvbXBvc2l0ZVN0YXRlT2JqZWN0Iiwic2NoZW1hIiwidmFsaWQiLCJrZXlzIiwiZm9yRWFjaCIsImtleSIsImlzU3RhdGVPYmplY3RWYWxpZCIsInB1c2giLCJjb25zb2xlIiwiZXJyb3IiLCJ2YWxpZGF0b3IiLCJ2YWx1ZVN0YXRlT2JqZWN0IiwidmFsaWRhdGlvbkVycm9yIiwiZ2V0VmFsaWRhdGlvbkVycm9yIiwiaXNWYWx1ZVZhbGlkIiwiZ2V0UmVsYXRlZFR5cGVzIiwicmVsYXRlZFR5cGVzIiwic3RhdGVTY2hlbWFLZXkiLCJnZXRTdGF0ZVNjaGVtYUFQSSIsIl8iLCJtYXBWYWx1ZXMiLCJ2YWx1ZSIsInR5cGVOYW1lIiwiZGlzcGxheVN0cmluZyIsImFzVmFsdWUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYXBpU3RhdGVLZXlzIiwiYXBpU3RhdGVLZXkiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCQyxHQUVELE9BQU9BLGdCQUErQixpQ0FBaUM7QUFDdkUsT0FBT0Msb0NBQW9DLDBEQUEwRDtBQUNyRyxPQUFPQyxlQUFlLHFDQUFxQztBQUczRCxPQUFPQyxxQkFBcUIsd0JBQXdCO0FBQ3BELE9BQU9DLFlBQVksY0FBYztBQWdEbEIsSUFBQSxBQUFNQyxjQUFOLE1BQU1BO0lBc0NuQjs7OztHQUlDLEdBQ0QsQUFBT0Msa0JBQW1CQyxVQUFhLEVBQUVDLFdBQXFDLEVBQVM7UUFFckZDLFVBQVVBLE9BQVEsSUFBSSxDQUFDQyxXQUFXLElBQUk7UUFDdEMsSUFBTSxNQUFNQyxZQUFZLElBQUksQ0FBQ0MsZUFBZSxDQUFHO1lBQzdDLElBQUssSUFBSSxDQUFDQSxlQUFlLENBQUNDLGNBQWMsQ0FBRUYsV0FBYTtnQkFDckRGLFVBQVVBLE9BQVFELFlBQVlLLGNBQWMsQ0FBRUYsV0FBWSxDQUFDLCtDQUErQyxFQUFFQSxVQUFV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