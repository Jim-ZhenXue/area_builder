// Copyright 2023-2024, University of Colorado Boulder
/**
 * Property that controls the selection view of PhET-iO Elements, predominately in Studio.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Property from '../../axon/js/Property.js';
import Tandem from './Tandem.js';
import tandemNamespace from './tandemNamespace.js';
import StringIO from './types/StringIO.js';
export const PhetioElementSelectionValues = [
    'view',
    'linked',
    'string',
    'none' // No selection
];
const phetioElementSelectionProperty = new Property('none', {
    tandem: Tandem.GENERAL_VIEW.createTandem('phetioElementSelectionProperty'),
    phetioValueType: StringIO,
    validValues: PhetioElementSelectionValues,
    phetioState: false,
    phetioDocumentation: 'Specifies how PhET-iO Elements are being selected. "view": the target view element, ' + '"linked": the corresponding linked element of the view element (if there is one), "string": ' + 'select only string elements in the sim, "none": no active selection.'
});
tandemNamespace.register('phetioElementSelectionProperty', phetioElementSelectionProperty);
export default phetioElementSelectionProperty;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9waGV0aW9FbGVtZW50U2VsZWN0aW9uUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUHJvcGVydHkgdGhhdCBjb250cm9scyB0aGUgc2VsZWN0aW9uIHZpZXcgb2YgUGhFVC1pTyBFbGVtZW50cywgcHJlZG9taW5hdGVseSBpbiBTdHVkaW8uXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4vVGFuZGVtLmpzJztcbmltcG9ydCB0YW5kZW1OYW1lc3BhY2UgZnJvbSAnLi90YW5kZW1OYW1lc3BhY2UuanMnO1xuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4vdHlwZXMvU3RyaW5nSU8uanMnO1xuXG5leHBvcnQgY29uc3QgUGhldGlvRWxlbWVudFNlbGVjdGlvblZhbHVlcyA9IFtcbiAgJ3ZpZXcnLCAvLyBTZWxlY3QgdGhlIHZpZXcgZWxlbWVudCB1bmRlciB0aGUgbW91c2VcbiAgJ2xpbmtlZCcsIC8vIE1hcCB0byB0aGUgbGlua2VkIGVsZW1lbnQgaWYgcG9zc2libGVcbiAgJ3N0cmluZycsIC8vIE9ubHkgc3RyaW5nIGVsZW1lbnRzIGFyZSBzZWxlY3RhYmxlXG4gICdub25lJyAvLyBObyBzZWxlY3Rpb25cbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIFBoZXRpb0VsZW1lbnRTZWxlY3Rpb24gPSAoIHR5cGVvZiBQaGV0aW9FbGVtZW50U2VsZWN0aW9uVmFsdWVzIClbbnVtYmVyXTtcblxuY29uc3QgcGhldGlvRWxlbWVudFNlbGVjdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5PFBoZXRpb0VsZW1lbnRTZWxlY3Rpb24+KCAnbm9uZScsIHtcbiAgdGFuZGVtOiBUYW5kZW0uR0VORVJBTF9WSUVXLmNyZWF0ZVRhbmRlbSggJ3BoZXRpb0VsZW1lbnRTZWxlY3Rpb25Qcm9wZXJ0eScgKSxcbiAgcGhldGlvVmFsdWVUeXBlOiBTdHJpbmdJTyxcbiAgdmFsaWRWYWx1ZXM6IFBoZXRpb0VsZW1lbnRTZWxlY3Rpb25WYWx1ZXMsXG4gIHBoZXRpb1N0YXRlOiBmYWxzZSxcbiAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1NwZWNpZmllcyBob3cgUGhFVC1pTyBFbGVtZW50cyBhcmUgYmVpbmcgc2VsZWN0ZWQuIFwidmlld1wiOiB0aGUgdGFyZ2V0IHZpZXcgZWxlbWVudCwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICdcImxpbmtlZFwiOiB0aGUgY29ycmVzcG9uZGluZyBsaW5rZWQgZWxlbWVudCBvZiB0aGUgdmlldyBlbGVtZW50IChpZiB0aGVyZSBpcyBvbmUpLCBcInN0cmluZ1wiOiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgJ3NlbGVjdCBvbmx5IHN0cmluZyBlbGVtZW50cyBpbiB0aGUgc2ltLCBcIm5vbmVcIjogbm8gYWN0aXZlIHNlbGVjdGlvbi4nXG59ICk7XG5cbnRhbmRlbU5hbWVzcGFjZS5yZWdpc3RlciggJ3BoZXRpb0VsZW1lbnRTZWxlY3Rpb25Qcm9wZXJ0eScsIHBoZXRpb0VsZW1lbnRTZWxlY3Rpb25Qcm9wZXJ0eSApO1xuXG5leHBvcnQgZGVmYXVsdCBwaGV0aW9FbGVtZW50U2VsZWN0aW9uUHJvcGVydHk7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiVGFuZGVtIiwidGFuZGVtTmFtZXNwYWNlIiwiU3RyaW5nSU8iLCJQaGV0aW9FbGVtZW50U2VsZWN0aW9uVmFsdWVzIiwicGhldGlvRWxlbWVudFNlbGVjdGlvblByb3BlcnR5IiwidGFuZGVtIiwiR0VORVJBTF9WSUVXIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvVmFsdWVUeXBlIiwidmFsaWRWYWx1ZXMiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsY0FBYyw0QkFBNEI7QUFDakQsT0FBT0MsWUFBWSxjQUFjO0FBQ2pDLE9BQU9DLHFCQUFxQix1QkFBdUI7QUFDbkQsT0FBT0MsY0FBYyxzQkFBc0I7QUFFM0MsT0FBTyxNQUFNQywrQkFBK0I7SUFDMUM7SUFDQTtJQUNBO0lBQ0EsT0FBTyxlQUFlO0NBQ3ZCLENBQVU7QUFJWCxNQUFNQyxpQ0FBaUMsSUFBSUwsU0FBa0MsUUFBUTtJQUNuRk0sUUFBUUwsT0FBT00sWUFBWSxDQUFDQyxZQUFZLENBQUU7SUFDMUNDLGlCQUFpQk47SUFDakJPLGFBQWFOO0lBQ2JPLGFBQWE7SUFDYkMscUJBQXFCLHlGQUNBLGlHQUNBO0FBQ3ZCO0FBRUFWLGdCQUFnQlcsUUFBUSxDQUFFLGtDQUFrQ1I7QUFFNUQsZUFBZUEsK0JBQStCIn0=