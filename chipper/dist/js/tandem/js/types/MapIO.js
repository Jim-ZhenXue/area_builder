// Copyright 2021-2024, University of Colorado Boulder
/**
 * PhET-iO Type for JS's built-in Map type.
 *
 * NOTE: This has not been reviewed, tested or used in production code yet.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Validation from '../../../axon/js/Validation.js';
import IOTypeCache from '../IOTypeCache.js';
import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
import StateSchema from './StateSchema.js';
// Cache each parameterized IOType so that it is only created once.
const cache = new IOTypeCache();
const ARRAY_OF_ARRAY_VALIDATOR = {
    valueType: Array,
    isValidValue: (value)=>Array.isArray(value) && value.every((element)=>Array.isArray(element))
};
/**
 * Parametric IOType constructor.  Given an element type, this function returns an appropriate map IOType.
 * This caching implementation should be kept in sync with the other parametric IOType caching implementations.
 */ function MapIO(keyType, valueType) {
    const cacheKey = keyType.typeName + ',' + valueType.typeName;
    if (!cache.has(cacheKey)) {
        cache.set(cacheKey, new IOType(`MapIO<${keyType.typeName},${valueType.typeName}>`, {
            valueType: Map,
            isValidValue: (map)=>{
                for (const [key, value] of map){
                    if (!Validation.isValueValid(key, keyType.validator)) {
                        return false;
                    }
                    if (!Validation.isValueValid(value, valueType.validator)) {
                        return false;
                    }
                }
                return true;
            },
            parameterTypes: [
                keyType,
                valueType
            ],
            toStateObject: (map)=>{
                const array = [];
                for (const [key, value] of map){
                    array.push([
                        keyType.toStateObject(key),
                        valueType.toStateObject(value)
                    ]);
                }
                return array;
            },
            fromStateObject: (outerArray)=>{
                const result = outerArray.map((tuple)=>{
                    return [
                        keyType.fromStateObject(tuple[0]),
                        valueType.fromStateObject(tuple[1])
                    ];
                });
                // @ts-expect-error not sure how to demonstrate that the argument is readonly, since it is dynamically created
                return new Map(result);
            },
            documentation: 'PhET-iO Type for the built-in JS Map type, with the key and value types specified.',
            stateSchema: StateSchema.asValue(`Map<${keyType.typeName},${valueType.typeName}>`, {
                isValidValue: (stateObject)=>{
                    if (!Validation.isValueValid(stateObject, ARRAY_OF_ARRAY_VALIDATOR)) {
                        return false;
                    }
                    for(let i = 0; i < stateObject.length; i++){
                        const mapElementArray = stateObject[i];
                        if (!Array.isArray(mapElementArray)) {
                            return false;
                        }
                        if (mapElementArray.length !== 2) {
                            return false;
                        }
                    // TODO: check each entry based on the key and value IOType stateSchema, https://github.com/phetsims/tandem/issues/271
                    }
                    return true;
                }
            })
        }));
    }
    return cache.get(cacheKey);
}
tandemNamespace.register('MapIO', MapIO);
export default MapIO;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9NYXBJTy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQaEVULWlPIFR5cGUgZm9yIEpTJ3MgYnVpbHQtaW4gTWFwIHR5cGUuXG4gKlxuICogTk9URTogVGhpcyBoYXMgbm90IGJlZW4gcmV2aWV3ZWQsIHRlc3RlZCBvciB1c2VkIGluIHByb2R1Y3Rpb24gY29kZSB5ZXQuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWYWxpZGF0aW9uIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVmFsaWRhdGlvbi5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBJT1R5cGVDYWNoZSBmcm9tICcuLi9JT1R5cGVDYWNoZS5qcyc7XG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4uL3RhbmRlbU5hbWVzcGFjZS5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4vSU9UeXBlLmpzJztcbmltcG9ydCBTdGF0ZVNjaGVtYSBmcm9tICcuL1N0YXRlU2NoZW1hLmpzJztcblxuLy8gQ2FjaGUgZWFjaCBwYXJhbWV0ZXJpemVkIElPVHlwZSBzbyB0aGF0IGl0IGlzIG9ubHkgY3JlYXRlZCBvbmNlLlxuY29uc3QgY2FjaGUgPSBuZXcgSU9UeXBlQ2FjaGU8c3RyaW5nPigpO1xuXG5jb25zdCBBUlJBWV9PRl9BUlJBWV9WQUxJREFUT1IgPSB7XG4gIHZhbHVlVHlwZTogQXJyYXksXG4gIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogSW50ZW50aW9uYWxBbnkgKSA9PiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICYmIHZhbHVlLmV2ZXJ5KCBlbGVtZW50ID0+IEFycmF5LmlzQXJyYXkoIGVsZW1lbnQgKSApXG59O1xuXG5leHBvcnQgdHlwZSBNYXBTdGF0ZU9iamVjdDxLU3RhdGUsIFZTdGF0ZT4gPSBBcnJheTxbIEtTdGF0ZSwgVlN0YXRlIF0+O1xuXG4vKipcbiAqIFBhcmFtZXRyaWMgSU9UeXBlIGNvbnN0cnVjdG9yLiAgR2l2ZW4gYW4gZWxlbWVudCB0eXBlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgYW4gYXBwcm9wcmlhdGUgbWFwIElPVHlwZS5cbiAqIFRoaXMgY2FjaGluZyBpbXBsZW1lbnRhdGlvbiBzaG91bGQgYmUga2VwdCBpbiBzeW5jIHdpdGggdGhlIG90aGVyIHBhcmFtZXRyaWMgSU9UeXBlIGNhY2hpbmcgaW1wbGVtZW50YXRpb25zLlxuICovXG5mdW5jdGlvbiBNYXBJTzxLVHlwZSwgS1N0YXRlVHlwZSwgVlR5cGUsIFZTdGF0ZVR5cGU+KCBrZXlUeXBlOiBJT1R5cGU8S1R5cGUsIEtTdGF0ZVR5cGU+LCB2YWx1ZVR5cGU6IElPVHlwZTxWVHlwZSwgVlN0YXRlVHlwZT4gKTogSU9UeXBlIHtcblxuICBjb25zdCBjYWNoZUtleSA9IGtleVR5cGUudHlwZU5hbWUgKyAnLCcgKyB2YWx1ZVR5cGUudHlwZU5hbWU7XG4gIGlmICggIWNhY2hlLmhhcyggY2FjaGVLZXkgKSApIHtcblxuICAgIGNhY2hlLnNldCggY2FjaGVLZXksIG5ldyBJT1R5cGU8TWFwPEtUeXBlLCBWVHlwZT4sIFsgS1N0YXRlVHlwZSwgVlN0YXRlVHlwZSBdW10+KCBgTWFwSU88JHtrZXlUeXBlLnR5cGVOYW1lfSwke3ZhbHVlVHlwZS50eXBlTmFtZX0+YCwge1xuICAgICAgdmFsdWVUeXBlOiBNYXAsXG4gICAgICBpc1ZhbGlkVmFsdWU6IG1hcCA9PiB7XG4gICAgICAgIGZvciAoIGNvbnN0IFsga2V5LCB2YWx1ZSBdIG9mIG1hcCApIHtcbiAgICAgICAgICBpZiAoICFWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCgga2V5LCBrZXlUeXBlLnZhbGlkYXRvciApICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoICFWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggdmFsdWUsIHZhbHVlVHlwZS52YWxpZGF0b3IgKSApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgcGFyYW1ldGVyVHlwZXM6IFsga2V5VHlwZSwgdmFsdWVUeXBlIF0sXG4gICAgICB0b1N0YXRlT2JqZWN0OiBtYXAgPT4ge1xuICAgICAgICBjb25zdCBhcnJheTogTWFwU3RhdGVPYmplY3Q8S1N0YXRlVHlwZSwgVlN0YXRlVHlwZT4gPSBbXTtcbiAgICAgICAgZm9yICggY29uc3QgWyBrZXksIHZhbHVlIF0gb2YgbWFwICkge1xuICAgICAgICAgIGFycmF5LnB1c2goIFsga2V5VHlwZS50b1N0YXRlT2JqZWN0KCBrZXkgKSwgdmFsdWVUeXBlLnRvU3RhdGVPYmplY3QoIHZhbHVlICkgXSApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgIH0sXG4gICAgICBmcm9tU3RhdGVPYmplY3Q6IG91dGVyQXJyYXkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBvdXRlckFycmF5Lm1hcCggdHVwbGUgPT4ge1xuICAgICAgICAgIHJldHVybiBbIGtleVR5cGUuZnJvbVN0YXRlT2JqZWN0KCB0dXBsZVsgMCBdICksIHZhbHVlVHlwZS5mcm9tU3RhdGVPYmplY3QoIHR1cGxlWyAxIF0gKSBdO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBub3Qgc3VyZSBob3cgdG8gZGVtb25zdHJhdGUgdGhhdCB0aGUgYXJndW1lbnQgaXMgcmVhZG9ubHksIHNpbmNlIGl0IGlzIGR5bmFtaWNhbGx5IGNyZWF0ZWRcbiAgICAgICAgcmV0dXJuIG5ldyBNYXAoIHJlc3VsdCApO1xuICAgICAgfSxcbiAgICAgIGRvY3VtZW50YXRpb246ICdQaEVULWlPIFR5cGUgZm9yIHRoZSBidWlsdC1pbiBKUyBNYXAgdHlwZSwgd2l0aCB0aGUga2V5IGFuZCB2YWx1ZSB0eXBlcyBzcGVjaWZpZWQuJyxcbiAgICAgIHN0YXRlU2NoZW1hOiBTdGF0ZVNjaGVtYS5hc1ZhbHVlKCBgTWFwPCR7a2V5VHlwZS50eXBlTmFtZX0sJHt2YWx1ZVR5cGUudHlwZU5hbWV9PmAsIHtcbiAgICAgICAgaXNWYWxpZFZhbHVlOiBzdGF0ZU9iamVjdCA9PiB7XG4gICAgICAgICAgaWYgKCAhVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIHN0YXRlT2JqZWN0LCBBUlJBWV9PRl9BUlJBWV9WQUxJREFUT1IgKSApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVPYmplY3QubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBjb25zdCBtYXBFbGVtZW50QXJyYXkgPSBzdGF0ZU9iamVjdFsgaSBdO1xuICAgICAgICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheSggbWFwRWxlbWVudEFycmF5ICkgKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggbWFwRWxlbWVudEFycmF5Lmxlbmd0aCAhPT0gMiApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVE9ETzogY2hlY2sgZWFjaCBlbnRyeSBiYXNlZCBvbiB0aGUga2V5IGFuZCB2YWx1ZSBJT1R5cGUgc3RhdGVTY2hlbWEsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzI3MVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSApXG4gICAgfSApICk7XG4gIH1cblxuICByZXR1cm4gY2FjaGUuZ2V0KCBjYWNoZUtleSApITtcbn1cblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnTWFwSU8nLCBNYXBJTyApO1xuZXhwb3J0IGRlZmF1bHQgTWFwSU87Il0sIm5hbWVzIjpbIlZhbGlkYXRpb24iLCJJT1R5cGVDYWNoZSIsInRhbmRlbU5hbWVzcGFjZSIsIklPVHlwZSIsIlN0YXRlU2NoZW1hIiwiY2FjaGUiLCJBUlJBWV9PRl9BUlJBWV9WQUxJREFUT1IiLCJ2YWx1ZVR5cGUiLCJBcnJheSIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwiaXNBcnJheSIsImV2ZXJ5IiwiZWxlbWVudCIsIk1hcElPIiwia2V5VHlwZSIsImNhY2hlS2V5IiwidHlwZU5hbWUiLCJoYXMiLCJzZXQiLCJNYXAiLCJtYXAiLCJrZXkiLCJpc1ZhbHVlVmFsaWQiLCJ2YWxpZGF0b3IiLCJwYXJhbWV0ZXJUeXBlcyIsInRvU3RhdGVPYmplY3QiLCJhcnJheSIsInB1c2giLCJmcm9tU3RhdGVPYmplY3QiLCJvdXRlckFycmF5IiwicmVzdWx0IiwidHVwbGUiLCJkb2N1bWVudGF0aW9uIiwic3RhdGVTY2hlbWEiLCJhc1ZhbHVlIiwic3RhdGVPYmplY3QiLCJpIiwibGVuZ3RoIiwibWFwRWxlbWVudEFycmF5IiwiZ2V0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EsZ0JBQWdCLGlDQUFpQztBQUV4RCxPQUFPQyxpQkFBaUIsb0JBQW9CO0FBQzVDLE9BQU9DLHFCQUFxQix3QkFBd0I7QUFDcEQsT0FBT0MsWUFBWSxjQUFjO0FBQ2pDLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFFM0MsbUVBQW1FO0FBQ25FLE1BQU1DLFFBQVEsSUFBSUo7QUFFbEIsTUFBTUssMkJBQTJCO0lBQy9CQyxXQUFXQztJQUNYQyxjQUFjLENB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