// Copyright 2024, University of Colorado Boulder
// This PhET-iO file requires a license
// USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.
// For licensing, please contact phethelp@colorado.edu
/**
 * Checks if the test value is compatible with the groundTruth value. This does so recursively on component values of state.
 * Compatability relies on treating one as the correct value, and determining if the other is compatible with it.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 *
 * @param groundTruthValue - The new value/schema to validate compatibility.
 * @param testValue - The original value to check against.
 * @returns `true` if compatible, `false` otherwise.
 */ function areCompatible(groundTruthValue, testValue) {
    // If groundTruthValue is an array, handle array compatibility with ordered elements
    if (Array.isArray(groundTruthValue)) {
        if (!Array.isArray(testValue)) {
            // Type mismatch: new expects an array, but old is not
            return false;
        }
        // The old array must have at least as many items as the new array
        // TODO: Hard code something for validValues for supporting sets? https://github.com/phetsims/phet-io/issues/1999
        //       key === 'validValues' -> treat as set
        if (testValue.length !== groundTruthValue.length) {
            return false;
        }
        // Iterate through each item in the new array by index
        for(let i = 0; i < groundTruthValue.length; i++){
            const newItem = groundTruthValue[i];
            const oldItem = testValue[i];
            // Check compatibility of the current indexed items
            if (!areCompatible(newItem, oldItem)) {
                return false;
            }
        }
        // All new items are compatible with corresponding old items
        return true;
    }
    // If groundTruthValue is an object (but not an array), handle object compatibility
    if (typeof groundTruthValue === 'object' && groundTruthValue !== null) {
        if (typeof testValue !== 'object' || testValue === null || Array.isArray(testValue)) {
            // Type mismatch: new expects an object, but old is not an object or is an array
            return false;
        }
        // Iterate through each key in the new object
        for(const key in groundTruthValue){
            if (groundTruthValue.hasOwnProperty(key)) {
                if (!testValue.hasOwnProperty(key)) {
                    // Key missing in old object
                    return false;
                }
                // Recursively check compatibility for the nested key
                if (!areCompatible(groundTruthValue[key], testValue[key])) {
                    return false;
                }
            }
        }
        // All keys in the new object are compatible
        return true;
    }
    // For primitive values, perform a strict equality check
    return testValue === groundTruthValue;
}
/**
 * Tests if the initialState as found in the PhET-iO API file is compatible with another. This implementation treats
 * the groundTruthState as the correct definition, and compares it to the test state to see if the testState is
 * "compatible". Compatible means that for every entry/value in the ground truth (recursively), there is that same
 * structure and value in the test state. Extra data in the testState is acceptable, but data missing from testState that
 * is in the groundTruthState is incompatible.
 *
 * Compatibility cheat sheet:
 *   Extra key in the testState that isn't in the groundTruthState: ---- compatible
 *   Extra element in an array in testState: --------------------------- compatible
 *   One less element in an array in testState: ------------------------ NOT compatible
 *   Both have the same key and the same numeric value: ---------------- compatible
 *   Both have the same key but different numeric value: --------------- NOT Compatible
 */ const isInitialStateCompatible = (groundTruthState, testState)=>{
    return areCompatible(groundTruthState, testState);
};
export default isInitialStateCompatible;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXItYW5kLW5vZGUvaXNJbml0aWFsU3RhdGVDb21wYXRpYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIFRoaXMgUGhFVC1pTyBmaWxlIHJlcXVpcmVzIGEgbGljZW5zZVxuLy8gVVNFIFdJVEhPVVQgQSBMSUNFTlNFIEFHUkVFTUVOVCBJUyBTVFJJQ1RMWSBQUk9ISUJJVEVELlxuLy8gRm9yIGxpY2Vuc2luZywgcGxlYXNlIGNvbnRhY3QgcGhldGhlbHBAY29sb3JhZG8uZWR1XG5cbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IHsgUGhldGlvRWxlbWVudFN0YXRlIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3BoZXQtaW8tdHlwZXMuanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgdGVzdCB2YWx1ZSBpcyBjb21wYXRpYmxlIHdpdGggdGhlIGdyb3VuZFRydXRoIHZhbHVlLiBUaGlzIGRvZXMgc28gcmVjdXJzaXZlbHkgb24gY29tcG9uZW50IHZhbHVlcyBvZiBzdGF0ZS5cbiAqIENvbXBhdGFiaWxpdHkgcmVsaWVzIG9uIHRyZWF0aW5nIG9uZSBhcyB0aGUgY29ycmVjdCB2YWx1ZSwgYW5kIGRldGVybWluaW5nIGlmIHRoZSBvdGhlciBpcyBjb21wYXRpYmxlIHdpdGggaXQuXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICpcbiAqIEBwYXJhbSBncm91bmRUcnV0aFZhbHVlIC0gVGhlIG5ldyB2YWx1ZS9zY2hlbWEgdG8gdmFsaWRhdGUgY29tcGF0aWJpbGl0eS5cbiAqIEBwYXJhbSB0ZXN0VmFsdWUgLSBUaGUgb3JpZ2luYWwgdmFsdWUgdG8gY2hlY2sgYWdhaW5zdC5cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBjb21wYXRpYmxlLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gYXJlQ29tcGF0aWJsZSggZ3JvdW5kVHJ1dGhWYWx1ZTogSW50ZW50aW9uYWxBbnksIHRlc3RWYWx1ZTogSW50ZW50aW9uYWxBbnkgKTogYm9vbGVhbiB7XG4gIC8vIElmIGdyb3VuZFRydXRoVmFsdWUgaXMgYW4gYXJyYXksIGhhbmRsZSBhcnJheSBjb21wYXRpYmlsaXR5IHdpdGggb3JkZXJlZCBlbGVtZW50c1xuICBpZiAoIEFycmF5LmlzQXJyYXkoIGdyb3VuZFRydXRoVmFsdWUgKSApIHtcbiAgICBpZiAoICFBcnJheS5pc0FycmF5KCB0ZXN0VmFsdWUgKSApIHtcbiAgICAgIC8vIFR5cGUgbWlzbWF0Y2g6IG5ldyBleHBlY3RzIGFuIGFycmF5LCBidXQgb2xkIGlzIG5vdFxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRoZSBvbGQgYXJyYXkgbXVzdCBoYXZlIGF0IGxlYXN0IGFzIG1hbnkgaXRlbXMgYXMgdGhlIG5ldyBhcnJheVxuICAgIC8vIFRPRE86IEhhcmQgY29kZSBzb21ldGhpbmcgZm9yIHZhbGlkVmFsdWVzIGZvciBzdXBwb3J0aW5nIHNldHM/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xOTk5XG4gICAgLy8gICAgICAga2V5ID09PSAndmFsaWRWYWx1ZXMnIC0+IHRyZWF0IGFzIHNldFxuICAgIGlmICggdGVzdFZhbHVlLmxlbmd0aCAhPT0gZ3JvdW5kVHJ1dGhWYWx1ZS5sZW5ndGggKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggaXRlbSBpbiB0aGUgbmV3IGFycmF5IGJ5IGluZGV4XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZ3JvdW5kVHJ1dGhWYWx1ZS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IG5ld0l0ZW0gPSBncm91bmRUcnV0aFZhbHVlWyBpIF07XG4gICAgICBjb25zdCBvbGRJdGVtID0gdGVzdFZhbHVlWyBpIF07XG5cbiAgICAgIC8vIENoZWNrIGNvbXBhdGliaWxpdHkgb2YgdGhlIGN1cnJlbnQgaW5kZXhlZCBpdGVtc1xuICAgICAgaWYgKCAhYXJlQ29tcGF0aWJsZSggbmV3SXRlbSwgb2xkSXRlbSApICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWxsIG5ldyBpdGVtcyBhcmUgY29tcGF0aWJsZSB3aXRoIGNvcnJlc3BvbmRpbmcgb2xkIGl0ZW1zXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBJZiBncm91bmRUcnV0aFZhbHVlIGlzIGFuIG9iamVjdCAoYnV0IG5vdCBhbiBhcnJheSksIGhhbmRsZSBvYmplY3QgY29tcGF0aWJpbGl0eVxuICBpZiAoIHR5cGVvZiBncm91bmRUcnV0aFZhbHVlID09PSAnb2JqZWN0JyAmJiBncm91bmRUcnV0aFZhbHVlICE9PSBudWxsICkge1xuICAgIGlmICggdHlwZW9mIHRlc3RWYWx1ZSAhPT0gJ29iamVjdCcgfHwgdGVzdFZhbHVlID09PSBudWxsIHx8IEFycmF5LmlzQXJyYXkoIHRlc3RWYWx1ZSApICkge1xuICAgICAgLy8gVHlwZSBtaXNtYXRjaDogbmV3IGV4cGVjdHMgYW4gb2JqZWN0LCBidXQgb2xkIGlzIG5vdCBhbiBvYmplY3Qgb3IgaXMgYW4gYXJyYXlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBrZXkgaW4gdGhlIG5ldyBvYmplY3RcbiAgICBmb3IgKCBjb25zdCBrZXkgaW4gZ3JvdW5kVHJ1dGhWYWx1ZSApIHtcbiAgICAgIGlmICggZ3JvdW5kVHJ1dGhWYWx1ZS5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgIGlmICggIXRlc3RWYWx1ZS5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgICAgLy8gS2V5IG1pc3NpbmcgaW4gb2xkIG9iamVjdFxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlY3Vyc2l2ZWx5IGNoZWNrIGNvbXBhdGliaWxpdHkgZm9yIHRoZSBuZXN0ZWQga2V5XG4gICAgICAgIGlmICggIWFyZUNvbXBhdGlibGUoIGdyb3VuZFRydXRoVmFsdWVbIGtleSBdLCB0ZXN0VmFsdWVbIGtleSBdICkgKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWxsIGtleXMgaW4gdGhlIG5ldyBvYmplY3QgYXJlIGNvbXBhdGlibGVcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEZvciBwcmltaXRpdmUgdmFsdWVzLCBwZXJmb3JtIGEgc3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gIHJldHVybiB0ZXN0VmFsdWUgPT09IGdyb3VuZFRydXRoVmFsdWU7XG59XG5cbi8qKlxuICogVGVzdHMgaWYgdGhlIGluaXRpYWxTdGF0ZSBhcyBmb3VuZCBpbiB0aGUgUGhFVC1pTyBBUEkgZmlsZSBpcyBjb21wYXRpYmxlIHdpdGggYW5vdGhlci4gVGhpcyBpbXBsZW1lbnRhdGlvbiB0cmVhdHNcbiAqIHRoZSBncm91bmRUcnV0aFN0YXRlIGFzIHRoZSBjb3JyZWN0IGRlZmluaXRpb24sIGFuZCBjb21wYXJlcyBpdCB0byB0aGUgdGVzdCBzdGF0ZSB0byBzZWUgaWYgdGhlIHRlc3RTdGF0ZSBpc1xuICogXCJjb21wYXRpYmxlXCIuIENvbXBhdGlibGUgbWVhbnMgdGhhdCBmb3IgZXZlcnkgZW50cnkvdmFsdWUgaW4gdGhlIGdyb3VuZCB0cnV0aCAocmVjdXJzaXZlbHkpLCB0aGVyZSBpcyB0aGF0IHNhbWVcbiAqIHN0cnVjdHVyZSBhbmQgdmFsdWUgaW4gdGhlIHRlc3Qgc3RhdGUuIEV4dHJhIGRhdGEgaW4gdGhlIHRlc3RTdGF0ZSBpcyBhY2NlcHRhYmxlLCBidXQgZGF0YSBtaXNzaW5nIGZyb20gdGVzdFN0YXRlIHRoYXRcbiAqIGlzIGluIHRoZSBncm91bmRUcnV0aFN0YXRlIGlzIGluY29tcGF0aWJsZS5cbiAqXG4gKiBDb21wYXRpYmlsaXR5IGNoZWF0IHNoZWV0OlxuICogICBFeHRyYSBrZXkgaW4gdGhlIHRlc3RTdGF0ZSB0aGF0IGlzbid0IGluIHRoZSBncm91bmRUcnV0aFN0YXRlOiAtLS0tIGNvbXBhdGlibGVcbiAqICAgRXh0cmEgZWxlbWVudCBpbiBhbiBhcnJheSBpbiB0ZXN0U3RhdGU6IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBjb21wYXRpYmxlXG4gKiAgIE9uZSBsZXNzIGVsZW1lbnQgaW4gYW4gYXJyYXkgaW4gdGVzdFN0YXRlOiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gTk9UIGNvbXBhdGlibGVcbiAqICAgQm90aCBoYXZlIHRoZSBzYW1lIGtleSBhbmQgdGhlIHNhbWUgbnVtZXJpYyB2YWx1ZTogLS0tLS0tLS0tLS0tLS0tLSBjb21wYXRpYmxlXG4gKiAgIEJvdGggaGF2ZSB0aGUgc2FtZSBrZXkgYnV0IGRpZmZlcmVudCBudW1lcmljIHZhbHVlOiAtLS0tLS0tLS0tLS0tLS0gTk9UIENvbXBhdGlibGVcbiAqL1xuY29uc3QgaXNJbml0aWFsU3RhdGVDb21wYXRpYmxlID0gKCBncm91bmRUcnV0aFN0YXRlOiBQaGV0aW9FbGVtZW50U3RhdGUsIHRlc3RTdGF0ZTogUGhldGlvRWxlbWVudFN0YXRlICk6IGJvb2xlYW4gPT4ge1xuICByZXR1cm4gYXJlQ29tcGF0aWJsZSggZ3JvdW5kVHJ1dGhTdGF0ZSwgdGVzdFN0YXRlICk7XG59O1xuZXhwb3J0IGRlZmF1bHQgaXNJbml0aWFsU3RhdGVDb21wYXRpYmxlOyJdLCJuYW1lcyI6WyJhcmVDb21wYXRpYmxlIiwiZ3JvdW5kVHJ1dGhWYWx1ZSIsInRlc3RWYWx1ZSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsImkiLCJuZXdJdGVtIiwib2xkSXRlbSIsImtleSIsImhhc093blByb3BlcnR5IiwiaXNJbml0aWFsU3RhdGVDb21wYXRpYmxlIiwiZ3JvdW5kVHJ1dGhTdGF0ZSIsInRlc3RTdGF0ZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pELHVDQUF1QztBQUN2QywwREFBMEQ7QUFDMUQsc0RBQXNEO0FBS3REOzs7Ozs7Ozs7Q0FTQyxHQUNELFNBQVNBLGNBQWVDLGdCQUFnQyxFQUFFQyxTQUF5QjtJQUNqRixvRkFBb0Y7SUFDcEYsSUFBS0MsTUFBTUMsT0FBTyxDQUFFSCxtQkFBcUI7UUFDdkMsSUFBSyxDQUFDRSxNQUFNQyxPQUFPLENBQUVGLFlBQWM7WUFDakMsc0RBQXNEO1lBQ3RELE9BQU87UUFDVDtRQUVBLGtFQUFrRTtRQUNsRSxpSEFBaUg7UUFDakgsOENBQThDO1FBQzlDLElBQUtBLFVBQVVHLE1BQU0sS0FBS0osaUJBQWlCSSxNQUFNLEVBQUc7WUFDbEQsT0FBTztRQUNUO1FBRUEsc0RBQXNEO1FBQ3RELElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJTCxpQkFBaUJJLE1BQU0sRUFBRUMsSUFBTTtZQUNsRCxNQUFNQyxVQUFVTixnQkFBZ0IsQ0FBRUssRUFBRztZQUNyQyxNQUFNRSxVQUFVTixTQUFTLENBQUVJLEVBQUc7WUFFOUIsbURBQW1EO1lBQ25ELElBQUssQ0FBQ04sY0FBZU8sU0FBU0MsVUFBWTtnQkFDeEMsT0FBTztZQUNUO1FBQ0Y7UUFFQSw0REFBNEQ7UUFDNUQsT0FBTztJQUNUO0lBRUEsbUZBQW1GO0lBQ25GLElBQUssT0FBT1AscUJBQXFCLFlBQVlBLHFCQUFxQixNQUFPO1FBQ3ZFLElBQUssT0FBT0MsY0FBYyxZQUFZQSxjQUFjLFFBQVFDLE1BQU1DLE9BQU8sQ0FBRUYsWUFBYztZQUN2RixnRkFBZ0Y7WUFDaEYsT0FBTztRQUNUO1FBRUEsNkNBQTZDO1FBQzdDLElBQU0sTUFBTU8sT0FBT1IsaUJBQW1CO1lBQ3BDLElBQUtBLGlCQUFpQlMsY0FBYyxDQUFFRCxNQUFRO2dCQUM1QyxJQUFLLENBQUNQLFVBQVVRLGNBQWMsQ0FBRUQsTUFBUTtvQkFDdEMsNEJBQTRCO29CQUM1QixPQUFPO2dCQUNUO2dCQUVBLHFEQUFxRDtnQkFDckQsSUFBSyxDQUFDVCxjQUFlQyxnQkFBZ0IsQ0FBRVEsSUFBSyxFQUFFUCxTQUFTLENBQUVPLElBQUssR0FBSztvQkFDakUsT0FBTztnQkFDVDtZQUNGO1FBQ0Y7UUFFQSw0Q0FBNEM7UUFDNUMsT0FBTztJQUNUO0lBRUEsd0RBQXdEO0lBQ3hELE9BQU9QLGNBQWNEO0FBQ3ZCO0FBRUE7Ozs7Ozs7Ozs7Ozs7Q0FhQyxHQUNELE1BQU1VLDJCQUEyQixDQUFFQyxrQkFBc0NDO0lBQ3ZFLE9BQU9iLGNBQWVZLGtCQUFrQkM7QUFDMUM7QUFDQSxlQUFlRix5QkFBeUIifQ==