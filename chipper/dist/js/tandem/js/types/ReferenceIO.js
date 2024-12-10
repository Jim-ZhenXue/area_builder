// Copyright 2019-2024, University of Colorado Boulder
/**
 * ReferenceIO uses reference identity for toStateObject/fromStateObject
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Validation from '../../../axon/js/Validation.js';
import CouldNotYetDeserializeError from '../CouldNotYetDeserializeError.js';
import IOTypeCache from '../IOTypeCache.js';
import Tandem from '../Tandem.js';
import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
import StringIO from './StringIO.js';
// Cache each parameterized ReferenceIO so that it is only created once
const cache = new IOTypeCache();
const ReferenceIO = (parameterType)=>{
    assert && assert(parameterType, 'ReferenceIO needs parameterType');
    const cacheKey = parameterType;
    if (!cache.has(cacheKey)) {
        assert && assert(typeof parameterType.typeName === 'string', 'type name should be a string');
        cache.set(cacheKey, new IOType(`ReferenceIO<${parameterType.typeName}>`, {
            isValidValue: (value)=>Validation.isValueValid(value, parameterType.validator),
            documentation: 'Uses reference identity for serializing and deserializing, and validates based on its parameter PhET-iO Type.',
            parameterTypes: [
                parameterType
            ],
            /**
       * Return the json that ReferenceIO is wrapping.  This can be overridden by subclasses, or types can use ReferenceIO type
       * directly to use this implementation.
       */ toStateObject (phetioObject) {
                assert && Tandem.VALIDATION && assert(phetioObject.isPhetioInstrumented(), 'Cannot reference an uninstrumented object', phetioObject);
                // NOTE: We cannot assert that phetioObject.phetioState === false here because sometimes ReferenceIO is used statically like
                // ReferenceIO( Vector2IO ).toStateObject( myVector );
                return {
                    phetioID: phetioObject.tandem.phetioID
                };
            },
            stateSchema: {
                phetioID: StringIO
            },
            /**
       * Decodes the object from a state, used in PhetioStateEngine.setState.  This can be overridden by subclasses, or types can
       * use ReferenceIO type directly to use this implementation.
       * @throws CouldNotYetDeserializeError
       */ fromStateObject (stateObject) {
                assert && assert(stateObject && typeof stateObject.phetioID === 'string', 'phetioID should be a string');
                if (phet.phetio.phetioEngine.hasPhetioObject(stateObject.phetioID)) {
                    return phet.phetio.phetioEngine.getPhetioElement(stateObject.phetioID);
                } else {
                    throw new CouldNotYetDeserializeError();
                }
            },
            /**
       * References should be using fromStateObject to get a copy of the PhET-iO Element.
       */ applyState (coreObject) {
                assert && assert(false, `ReferenceIO is meant to be used as DataType serialization (see fromStateObject) for phetioID: ${coreObject.tandem.phetioID}`);
            }
        }));
    }
    return cache.get(cacheKey);
};
tandemNamespace.register('ReferenceIO', ReferenceIO);
export default ReferenceIO;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZWZlcmVuY2VJTyB1c2VzIHJlZmVyZW5jZSBpZGVudGl0eSBmb3IgdG9TdGF0ZU9iamVjdC9mcm9tU3RhdGVPYmplY3RcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWYWxpZGF0aW9uIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVmFsaWRhdGlvbi5qcyc7XG5pbXBvcnQgQ291bGROb3RZZXREZXNlcmlhbGl6ZUVycm9yIGZyb20gJy4uL0NvdWxkTm90WWV0RGVzZXJpYWxpemVFcnJvci5qcyc7XG5pbXBvcnQgSU9UeXBlQ2FjaGUgZnJvbSAnLi4vSU9UeXBlQ2FjaGUuanMnO1xuaW1wb3J0IHsgUGhldGlvSUQgfSBmcm9tICcuLi9waGV0LWlvLXR5cGVzLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vVGFuZGVtLmpzJztcbmltcG9ydCB0YW5kZW1OYW1lc3BhY2UgZnJvbSAnLi4vdGFuZGVtTmFtZXNwYWNlLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi9JT1R5cGUuanMnO1xuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4vU3RyaW5nSU8uanMnO1xuXG4vLyBDYWNoZSBlYWNoIHBhcmFtZXRlcml6ZWQgUmVmZXJlbmNlSU8gc28gdGhhdCBpdCBpcyBvbmx5IGNyZWF0ZWQgb25jZVxuY29uc3QgY2FjaGUgPSBuZXcgSU9UeXBlQ2FjaGUoKTtcblxuZXhwb3J0IHR5cGUgUmVmZXJlbmNlSU9TdGF0ZSA9IHtcbiAgcGhldGlvSUQ6IFBoZXRpb0lEO1xufTtcblxuY29uc3QgUmVmZXJlbmNlSU8gPSAoIHBhcmFtZXRlclR5cGU6IElPVHlwZSApOiBJT1R5cGUgPT4ge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJhbWV0ZXJUeXBlLCAnUmVmZXJlbmNlSU8gbmVlZHMgcGFyYW1ldGVyVHlwZScgKTtcblxuICBjb25zdCBjYWNoZUtleSA9IHBhcmFtZXRlclR5cGU7XG5cbiAgaWYgKCAhY2FjaGUuaGFzKCBjYWNoZUtleSApICkge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHBhcmFtZXRlclR5cGUudHlwZU5hbWUgPT09ICdzdHJpbmcnLCAndHlwZSBuYW1lIHNob3VsZCBiZSBhIHN0cmluZycgKTtcbiAgICBjYWNoZS5zZXQoIGNhY2hlS2V5LCBuZXcgSU9UeXBlKCBgUmVmZXJlbmNlSU88JHtwYXJhbWV0ZXJUeXBlLnR5cGVOYW1lfT5gLCB7XG4gICAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCB2YWx1ZSwgcGFyYW1ldGVyVHlwZS52YWxpZGF0b3IgKSxcbiAgICAgIGRvY3VtZW50YXRpb246ICdVc2VzIHJlZmVyZW5jZSBpZGVudGl0eSBmb3Igc2VyaWFsaXppbmcgYW5kIGRlc2VyaWFsaXppbmcsIGFuZCB2YWxpZGF0ZXMgYmFzZWQgb24gaXRzIHBhcmFtZXRlciBQaEVULWlPIFR5cGUuJyxcbiAgICAgIHBhcmFtZXRlclR5cGVzOiBbIHBhcmFtZXRlclR5cGUgXSxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm4gdGhlIGpzb24gdGhhdCBSZWZlcmVuY2VJTyBpcyB3cmFwcGluZy4gIFRoaXMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgc3ViY2xhc3Nlcywgb3IgdHlwZXMgY2FuIHVzZSBSZWZlcmVuY2VJTyB0eXBlXG4gICAgICAgKiBkaXJlY3RseSB0byB1c2UgdGhpcyBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAqL1xuICAgICAgdG9TdGF0ZU9iamVjdCggcGhldGlvT2JqZWN0ICk6IFJlZmVyZW5jZUlPU3RhdGUge1xuICAgICAgICBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgYXNzZXJ0KCBwaGV0aW9PYmplY3QuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ0Nhbm5vdCByZWZlcmVuY2UgYW4gdW5pbnN0cnVtZW50ZWQgb2JqZWN0JywgcGhldGlvT2JqZWN0ICk7XG5cbiAgICAgICAgLy8gTk9URTogV2UgY2Fubm90IGFzc2VydCB0aGF0IHBoZXRpb09iamVjdC5waGV0aW9TdGF0ZSA9PT0gZmFsc2UgaGVyZSBiZWNhdXNlIHNvbWV0aW1lcyBSZWZlcmVuY2VJTyBpcyB1c2VkIHN0YXRpY2FsbHkgbGlrZVxuICAgICAgICAvLyBSZWZlcmVuY2VJTyggVmVjdG9yMklPICkudG9TdGF0ZU9iamVjdCggbXlWZWN0b3IgKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwaGV0aW9JRDogcGhldGlvT2JqZWN0LnRhbmRlbS5waGV0aW9JRFxuICAgICAgICB9O1xuICAgICAgfSxcblxuICAgICAgc3RhdGVTY2hlbWE6IHtcbiAgICAgICAgcGhldGlvSUQ6IFN0cmluZ0lPXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIERlY29kZXMgdGhlIG9iamVjdCBmcm9tIGEgc3RhdGUsIHVzZWQgaW4gUGhldGlvU3RhdGVFbmdpbmUuc2V0U3RhdGUuICBUaGlzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMsIG9yIHR5cGVzIGNhblxuICAgICAgICogdXNlIFJlZmVyZW5jZUlPIHR5cGUgZGlyZWN0bHkgdG8gdXNlIHRoaXMgaW1wbGVtZW50YXRpb24uXG4gICAgICAgKiBAdGhyb3dzIENvdWxkTm90WWV0RGVzZXJpYWxpemVFcnJvclxuICAgICAgICovXG4gICAgICBmcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0OiBSZWZlcmVuY2VJT1N0YXRlICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGF0ZU9iamVjdCAmJiB0eXBlb2Ygc3RhdGVPYmplY3QucGhldGlvSUQgPT09ICdzdHJpbmcnLCAncGhldGlvSUQgc2hvdWxkIGJlIGEgc3RyaW5nJyApO1xuICAgICAgICBpZiAoIHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5oYXNQaGV0aW9PYmplY3QoIHN0YXRlT2JqZWN0LnBoZXRpb0lEICkgKSB7XG4gICAgICAgICAgcmV0dXJuIHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5nZXRQaGV0aW9FbGVtZW50KCBzdGF0ZU9iamVjdC5waGV0aW9JRCApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBDb3VsZE5vdFlldERlc2VyaWFsaXplRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZWZlcmVuY2VzIHNob3VsZCBiZSB1c2luZyBmcm9tU3RhdGVPYmplY3QgdG8gZ2V0IGEgY29weSBvZiB0aGUgUGhFVC1pTyBFbGVtZW50LlxuICAgICAgICovXG4gICAgICBhcHBseVN0YXRlKCBjb3JlT2JqZWN0ICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgYFJlZmVyZW5jZUlPIGlzIG1lYW50IHRvIGJlIHVzZWQgYXMgRGF0YVR5cGUgc2VyaWFsaXphdGlvbiAoc2VlIGZyb21TdGF0ZU9iamVjdCkgZm9yIHBoZXRpb0lEOiAke2NvcmVPYmplY3QudGFuZGVtLnBoZXRpb0lEfWAgKTtcbiAgICAgIH1cbiAgICB9ICkgKTtcbiAgfVxuXG4gIHJldHVybiBjYWNoZS5nZXQoIGNhY2hlS2V5ICkhO1xufTtcblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnUmVmZXJlbmNlSU8nLCBSZWZlcmVuY2VJTyApO1xuZXhwb3J0IGRlZmF1bHQgUmVmZXJlbmNlSU87Il0sIm5hbWVzIjpbIlZhbGlkYXRpb24iLCJDb3VsZE5vdFlldERlc2VyaWFsaXplRXJyb3IiLCJJT1R5cGVDYWNoZSIsIlRhbmRlbSIsInRhbmRlbU5hbWVzcGFjZSIsIklPVHlwZSIsIlN0cmluZ0lPIiwiY2FjaGUiLCJSZWZlcmVuY2VJTyIsInBhcmFtZXRlclR5cGUiLCJhc3NlcnQiLCJjYWNoZUtleSIsImhhcyIsInR5cGVOYW1lIiwic2V0IiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJpc1ZhbHVlVmFsaWQiLCJ2YWxpZGF0b3IiLCJkb2N1bWVudGF0aW9uIiwicGFyYW1ldGVyVHlwZXMiLCJ0b1N0YXRlT2JqZWN0IiwicGhldGlvT2JqZWN0IiwiVkFMSURBVElPTiIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwicGhldGlvSUQiLCJ0YW5kZW0iLCJzdGF0ZVNjaGVtYSIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwicGhldCIsInBoZXRpbyIsInBoZXRpb0VuZ2luZSIsImhhc1BoZXRpb09iamVjdCIsImdldFBoZXRpb0VsZW1lbnQiLCJhcHBseVN0YXRlIiwiY29yZU9iamVjdCIsImdldCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsZ0JBQWdCLGlDQUFpQztBQUN4RCxPQUFPQyxpQ0FBaUMsb0NBQW9DO0FBQzVFLE9BQU9DLGlCQUFpQixvQkFBb0I7QUFFNUMsT0FBT0MsWUFBWSxlQUFlO0FBQ2xDLE9BQU9DLHFCQUFxQix3QkFBd0I7QUFDcEQsT0FBT0MsWUFBWSxjQUFjO0FBQ2pDLE9BQU9DLGNBQWMsZ0JBQWdCO0FBRXJDLHVFQUF1RTtBQUN2RSxNQUFNQyxRQUFRLElBQUlMO0FBTWxCLE1BQU1NLGNBQWMsQ0FBRUM7SUFDcEJDLFVBQVVBLE9BQVFELGVBQWU7SUFFakMsTUFBTUUsV0FBV0Y7SUFFakIsSUFBSyxDQUFDRixNQUFNSyxHQUFHLENBQUVELFdBQWE7UUFFNUJELFVBQVVBLE9BQVEsT0FBT0QsY0FBY0ksUUFBUSxLQUFLLFVBQVU7UUFDOUROLE1BQU1PLEdBQUcsQ0FBRUgsVUFBVSxJQUFJTixPQUFRLENBQUMsWUFBWSxFQUFFSSxjQUFjSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDekVFLGNBQWNDLENBQUFBLFFBQVNoQixXQUFXaUIsWUFBWSxDQUFFRCxPQUFPUCxjQUFjUyxTQUFTO1lBQzlFQyxlQUFlO1lBQ2ZDLGdCQUFnQjtnQkFBRVg7YUFBZTtZQUVqQzs7O09BR0MsR0FDRFksZUFBZUMsWUFBWTtnQkFDekJaLFVBQVVQLE9BQU9vQixVQUFVLElBQUliLE9BQVFZLGFBQWFFLG9CQUFvQixJQUFJLDZDQUE2Q0Y7Z0JBRXpILDRIQUE0SDtnQkFDNUgsc0RBQXNEO2dCQUN0RCxPQUFPO29CQUNMRyxVQUFVSCxhQUFhSSxNQUFNLENBQUNELFFBQVE7Z0JBQ3hDO1lBQ0Y7WUFFQUUsYUFBYTtnQkFDWEYsVUFBVW5CO1lBQ1o7WUFFQTs7OztPQUlDLEdBQ0RzQixpQkFBaUJDLFdBQTZCO2dCQUM1Q25CLFVBQVVBLE9BQVFtQixlQUFlLE9BQU9BLFlBQVlKLFFBQVEsS0FBSyxVQUFVO2dCQUMzRSxJQUFLSyxLQUFLQyxNQUFNLENBQUNDLFlBQVksQ0FBQ0MsZUFBZSxDQUFFSixZQUFZSixRQUFRLEdBQUs7b0JBQ3RFLE9BQU9LLEtBQUtDLE1BQU0sQ0FBQ0MsWUFBWSxDQUFDRSxnQkFBZ0IsQ0FBRUwsWUFBWUosUUFBUTtnQkFDeEUsT0FDSztvQkFDSCxNQUFNLElBQUl4QjtnQkFDWjtZQUNGO1lBRUE7O09BRUMsR0FDRGtDLFlBQVlDLFVBQVU7Z0JBQ3BCMUIsVUFBVUEsT0FBUSxPQUFPLENBQUMsOEZBQThGLEVBQUUwQixXQUFXVixNQUFNLENBQUNELFFBQVEsRUFBRTtZQUN4SjtRQUNGO0lBQ0Y7SUFFQSxPQUFPbEIsTUFBTThCLEdBQUcsQ0FBRTFCO0FBQ3BCO0FBRUFQLGdCQUFnQmtDLFFBQVEsQ0FBRSxlQUFlOUI7QUFDekMsZUFBZUEsWUFBWSJ9