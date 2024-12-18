// Copyright 2019-2022, University of Colorado Boulder
/**
 * Error to be thrown if a failure occurs downstream of setting state because another state setting operation needs
 * to occur before "this" operation can succeed. For example, in reference serialization for dynamic PhetioObjects,
 * the dynamic instance must be created by the state engine before anything can reference it. By triggering this error,
 * we say "a failure here is alright, we will try again on the next iteration of setting the state. See
 * `phetioStateEngine.iterate` for more information.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import tandemNamespace from './tandemNamespace.js';
let CouldNotYetDeserializeError = class CouldNotYetDeserializeError extends Error {
    constructor(){
        super('CouldNotYetDeserializeError'); // Do not change this message without consulting appropriate usages.
    }
};
tandemNamespace.register('CouldNotYetDeserializeError', CouldNotYetDeserializeError);
export default CouldNotYetDeserializeError;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9Db3VsZE5vdFlldERlc2VyaWFsaXplRXJyb3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRXJyb3IgdG8gYmUgdGhyb3duIGlmIGEgZmFpbHVyZSBvY2N1cnMgZG93bnN0cmVhbSBvZiBzZXR0aW5nIHN0YXRlIGJlY2F1c2UgYW5vdGhlciBzdGF0ZSBzZXR0aW5nIG9wZXJhdGlvbiBuZWVkc1xuICogdG8gb2NjdXIgYmVmb3JlIFwidGhpc1wiIG9wZXJhdGlvbiBjYW4gc3VjY2VlZC4gRm9yIGV4YW1wbGUsIGluIHJlZmVyZW5jZSBzZXJpYWxpemF0aW9uIGZvciBkeW5hbWljIFBoZXRpb09iamVjdHMsXG4gKiB0aGUgZHluYW1pYyBpbnN0YW5jZSBtdXN0IGJlIGNyZWF0ZWQgYnkgdGhlIHN0YXRlIGVuZ2luZSBiZWZvcmUgYW55dGhpbmcgY2FuIHJlZmVyZW5jZSBpdC4gQnkgdHJpZ2dlcmluZyB0aGlzIGVycm9yLFxuICogd2Ugc2F5IFwiYSBmYWlsdXJlIGhlcmUgaXMgYWxyaWdodCwgd2Ugd2lsbCB0cnkgYWdhaW4gb24gdGhlIG5leHQgaXRlcmF0aW9uIG9mIHNldHRpbmcgdGhlIHN0YXRlLiBTZWVcbiAqIGBwaGV0aW9TdGF0ZUVuZ2luZS5pdGVyYXRlYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCB0YW5kZW1OYW1lc3BhY2UgZnJvbSAnLi90YW5kZW1OYW1lc3BhY2UuanMnO1xuXG5jbGFzcyBDb3VsZE5vdFlldERlc2VyaWFsaXplRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlciggJ0NvdWxkTm90WWV0RGVzZXJpYWxpemVFcnJvcicgKTsgIC8vIERvIG5vdCBjaGFuZ2UgdGhpcyBtZXNzYWdlIHdpdGhvdXQgY29uc3VsdGluZyBhcHByb3ByaWF0ZSB1c2FnZXMuXG4gIH1cbn1cblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnQ291bGROb3RZZXREZXNlcmlhbGl6ZUVycm9yJywgQ291bGROb3RZZXREZXNlcmlhbGl6ZUVycm9yICk7XG5leHBvcnQgZGVmYXVsdCBDb3VsZE5vdFlldERlc2VyaWFsaXplRXJyb3I7Il0sIm5hbWVzIjpbInRhbmRlbU5hbWVzcGFjZSIsIkNvdWxkTm90WWV0RGVzZXJpYWxpemVFcnJvciIsIkVycm9yIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7OztDQVVDLEdBRUQsT0FBT0EscUJBQXFCLHVCQUF1QjtBQUVuRCxJQUFBLEFBQU1DLDhCQUFOLE1BQU1BLG9DQUFvQ0M7SUFDeEMsYUFBcUI7UUFDbkIsS0FBSyxDQUFFLGdDQUFrQyxvRUFBb0U7SUFDL0c7QUFDRjtBQUVBRixnQkFBZ0JHLFFBQVEsQ0FBRSwrQkFBK0JGO0FBQ3pELGVBQWVBLDRCQUE0QiJ9