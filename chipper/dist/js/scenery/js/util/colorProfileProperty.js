// Copyright 2021-2022, University of Colorado Boulder
/**
 * Singleton Property<string> which chooses between the available color profiles of a simulation, such as 'default',
 * 'project', 'basics', etc.
 *
 * The color profile names available to a simulation are specified in package.json under phet.colorProfiles (or, if not
 * specified, defaults to [ "default" ].  The first color profile that is listed will appear in the sim on startup,
 * unless overridden by the sim or the colorProfile query parameter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import StringProperty from '../../../axon/js/StringProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { scenery, SceneryConstants } from '../imports.js';
// Use the color profile specified in query parameters, or default to 'default'
const initialProfileName = _.hasIn(window, 'phet.chipper.queryParameters.colorProfile') ? phet.chipper.queryParameters.colorProfile : SceneryConstants.DEFAULT_COLOR_PROFILE;
// List of all supported colorProfiles for this simulation
const colorProfiles = _.hasIn(window, 'phet.chipper.colorProfiles') ? phet.chipper.colorProfiles : [
    SceneryConstants.DEFAULT_COLOR_PROFILE
];
// @public {Property.<string>}
// The current profile name. Change this Property's value to change which profile is currently active.
const colorProfileProperty = new StringProperty(initialProfileName, {
    tandem: Tandem.GENERAL_VIEW.createTandem('colorProfileProperty'),
    phetioFeatured: true,
    validValues: colorProfiles
});
scenery.register('colorProfileProperty', colorProfileProperty);
export default colorProfileProperty;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9jb2xvclByb2ZpbGVQcm9wZXJ0eS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTaW5nbGV0b24gUHJvcGVydHk8c3RyaW5nPiB3aGljaCBjaG9vc2VzIGJldHdlZW4gdGhlIGF2YWlsYWJsZSBjb2xvciBwcm9maWxlcyBvZiBhIHNpbXVsYXRpb24sIHN1Y2ggYXMgJ2RlZmF1bHQnLFxuICogJ3Byb2plY3QnLCAnYmFzaWNzJywgZXRjLlxuICpcbiAqIFRoZSBjb2xvciBwcm9maWxlIG5hbWVzIGF2YWlsYWJsZSB0byBhIHNpbXVsYXRpb24gYXJlIHNwZWNpZmllZCBpbiBwYWNrYWdlLmpzb24gdW5kZXIgcGhldC5jb2xvclByb2ZpbGVzIChvciwgaWYgbm90XG4gKiBzcGVjaWZpZWQsIGRlZmF1bHRzIHRvIFsgXCJkZWZhdWx0XCIgXS4gIFRoZSBmaXJzdCBjb2xvciBwcm9maWxlIHRoYXQgaXMgbGlzdGVkIHdpbGwgYXBwZWFyIGluIHRoZSBzaW0gb24gc3RhcnR1cCxcbiAqIHVubGVzcyBvdmVycmlkZGVuIGJ5IHRoZSBzaW0gb3IgdGhlIGNvbG9yUHJvZmlsZSBxdWVyeSBwYXJhbWV0ZXIuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCB7IHNjZW5lcnksIFNjZW5lcnlDb25zdGFudHMgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuLy8gVXNlIHRoZSBjb2xvciBwcm9maWxlIHNwZWNpZmllZCBpbiBxdWVyeSBwYXJhbWV0ZXJzLCBvciBkZWZhdWx0IHRvICdkZWZhdWx0J1xuY29uc3QgaW5pdGlhbFByb2ZpbGVOYW1lID0gXy5oYXNJbiggd2luZG93LCAncGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5jb2xvclByb2ZpbGUnICkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5jb2xvclByb2ZpbGUgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgU2NlbmVyeUNvbnN0YW50cy5ERUZBVUxUX0NPTE9SX1BST0ZJTEU7XG5cbi8vIExpc3Qgb2YgYWxsIHN1cHBvcnRlZCBjb2xvclByb2ZpbGVzIGZvciB0aGlzIHNpbXVsYXRpb25cbmNvbnN0IGNvbG9yUHJvZmlsZXMgPSBfLmhhc0luKCB3aW5kb3csICdwaGV0LmNoaXBwZXIuY29sb3JQcm9maWxlcycgKSA/IHBoZXQuY2hpcHBlci5jb2xvclByb2ZpbGVzIDogWyBTY2VuZXJ5Q29uc3RhbnRzLkRFRkFVTFRfQ09MT1JfUFJPRklMRSBdO1xuXG4vLyBAcHVibGljIHtQcm9wZXJ0eS48c3RyaW5nPn1cbi8vIFRoZSBjdXJyZW50IHByb2ZpbGUgbmFtZS4gQ2hhbmdlIHRoaXMgUHJvcGVydHkncyB2YWx1ZSB0byBjaGFuZ2Ugd2hpY2ggcHJvZmlsZSBpcyBjdXJyZW50bHkgYWN0aXZlLlxuY29uc3QgY29sb3JQcm9maWxlUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoIGluaXRpYWxQcm9maWxlTmFtZSwge1xuICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX1ZJRVcuY3JlYXRlVGFuZGVtKCAnY29sb3JQcm9maWxlUHJvcGVydHknICksXG4gIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxuICB2YWxpZFZhbHVlczogY29sb3JQcm9maWxlc1xufSApO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnY29sb3JQcm9maWxlUHJvcGVydHknLCBjb2xvclByb2ZpbGVQcm9wZXJ0eSApO1xuXG5leHBvcnQgZGVmYXVsdCBjb2xvclByb2ZpbGVQcm9wZXJ0eTsiXSwibmFtZXMiOlsiU3RyaW5nUHJvcGVydHkiLCJUYW5kZW0iLCJzY2VuZXJ5IiwiU2NlbmVyeUNvbnN0YW50cyIsImluaXRpYWxQcm9maWxlTmFtZSIsIl8iLCJoYXNJbiIsIndpbmRvdyIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiY29sb3JQcm9maWxlIiwiREVGQVVMVF9DT0xPUl9QUk9GSUxFIiwiY29sb3JQcm9maWxlcyIsImNvbG9yUHJvZmlsZVByb3BlcnR5IiwidGFuZGVtIiwiR0VORVJBTF9WSUVXIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRmVhdHVyZWQiLCJ2YWxpZFZhbHVlcyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7OztDQVNDLEdBQ0QsT0FBT0Esb0JBQW9CLHFDQUFxQztBQUNoRSxPQUFPQyxZQUFZLCtCQUErQjtBQUNsRCxTQUFTQyxPQUFPLEVBQUVDLGdCQUFnQixRQUFRLGdCQUFnQjtBQUUxRCwrRUFBK0U7QUFDL0UsTUFBTUMscUJBQXFCQyxFQUFFQyxLQUFLLENBQUVDLFFBQVEsK0NBQ2pCQyxLQUFLQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsWUFBWSxHQUN6Q1IsaUJBQWlCUyxxQkFBcUI7QUFFakUsMERBQTBEO0FBQzFELE1BQU1DLGdCQUFnQlIsRUFBRUMsS0FBSyxDQUFFQyxRQUFRLGdDQUFpQ0MsS0FBS0MsT0FBTyxDQUFDSSxhQUFhLEdBQUc7SUFBRVYsaUJBQWlCUyxxQkFBcUI7Q0FBRTtBQUUvSSw4QkFBOEI7QUFDOUIsc0dBQXNHO0FBQ3RHLE1BQU1FLHVCQUF1QixJQUFJZCxlQUFnQkksb0JBQW9CO0lBQ25FVyxRQUFRZCxPQUFPZSxZQUFZLENBQUNDLFlBQVksQ0FBRTtJQUMxQ0MsZ0JBQWdCO0lBQ2hCQyxhQUFhTjtBQUNmO0FBRUFYLFFBQVFrQixRQUFRLENBQUUsd0JBQXdCTjtBQUUxQyxlQUFlQSxxQkFBcUIifQ==