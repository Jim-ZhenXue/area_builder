// Copyright 2018-2024, University of Colorado Boulder
/**
 * IOType use to signify a function has no return value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */ import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
/**
 * We sometimes use VoidIO as a workaround to indicate that an argument is passed in the simulation side, but
 * that it shouldn't be leaked to the PhET-iO client.
 */ const VoidIO = new IOType('VoidIO', {
    isValidValue: ()=>true,
    documentation: 'Type for which there is no instance, usually to mark functions without a return value',
    toStateObject: ()=>undefined
});
tandemNamespace.register('VoidIO', VoidIO);
export default VoidIO;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Wb2lkSU8udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogSU9UeXBlIHVzZSB0byBzaWduaWZ5IGEgZnVuY3Rpb24gaGFzIG5vIHJldHVybiB2YWx1ZS5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBBbmRyZXcgQWRhcmUgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHRhbmRlbU5hbWVzcGFjZSBmcm9tICcuLi90YW5kZW1OYW1lc3BhY2UuanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuL0lPVHlwZS5qcyc7XG5cbi8qKlxuICogV2Ugc29tZXRpbWVzIHVzZSBWb2lkSU8gYXMgYSB3b3JrYXJvdW5kIHRvIGluZGljYXRlIHRoYXQgYW4gYXJndW1lbnQgaXMgcGFzc2VkIGluIHRoZSBzaW11bGF0aW9uIHNpZGUsIGJ1dFxuICogdGhhdCBpdCBzaG91bGRuJ3QgYmUgbGVha2VkIHRvIHRoZSBQaEVULWlPIGNsaWVudC5cbiAqL1xuY29uc3QgVm9pZElPID0gbmV3IElPVHlwZSggJ1ZvaWRJTycsIHtcbiAgaXNWYWxpZFZhbHVlOiAoKSA9PiB0cnVlLFxuICBkb2N1bWVudGF0aW9uOiAnVHlwZSBmb3Igd2hpY2ggdGhlcmUgaXMgbm8gaW5zdGFuY2UsIHVzdWFsbHkgdG8gbWFyayBmdW5jdGlvbnMgd2l0aG91dCBhIHJldHVybiB2YWx1ZScsXG4gIHRvU3RhdGVPYmplY3Q6ICgpID0+IHVuZGVmaW5lZFxufSApO1xuXG50YW5kZW1OYW1lc3BhY2UucmVnaXN0ZXIoICdWb2lkSU8nLCBWb2lkSU8gKTtcbmV4cG9ydCBkZWZhdWx0IFZvaWRJTzsiXSwibmFtZXMiOlsidGFuZGVtTmFtZXNwYWNlIiwiSU9UeXBlIiwiVm9pZElPIiwiaXNWYWxpZFZhbHVlIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EscUJBQXFCLHdCQUF3QjtBQUNwRCxPQUFPQyxZQUFZLGNBQWM7QUFFakM7OztDQUdDLEdBQ0QsTUFBTUMsU0FBUyxJQUFJRCxPQUFRLFVBQVU7SUFDbkNFLGNBQWMsSUFBTTtJQUNwQkMsZUFBZTtJQUNmQyxlQUFlLElBQU1DO0FBQ3ZCO0FBRUFOLGdCQUFnQk8sUUFBUSxDQUFFLFVBQVVMO0FBQ3BDLGVBQWVBLE9BQU8ifQ==