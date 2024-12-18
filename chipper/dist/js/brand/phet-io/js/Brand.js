// Copyright 2002-2016, University of Colorado Boulder
// Returns branding information for the simulations, see https://github.com/phetsims/brand/issues/1
// @author Michael Kauzmann (PhET Interactive Simulations)
import brand from '../../js/brand.js';
import getLinks from '../../js/getLinks.js';
import logo_png from '../images/logo_png.js';
import logoOnWhite_png from '../images/logoOnWhite_png.js';
// Documentation for all properties is available in brand/adapted-from-phet/js/Brand.js
const Brand = {
    id: 'phet-io',
    name: 'PhET\u2122 Interactive Simulations',
    copyright: 'Copyright © 2002-{{year}} University of Colorado Boulder',
    additionalLicenseStatement: 'This PhET-iO interoperable simulation file requires a license.<br>' + 'USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.<br>' + 'Contact phethelp@colorado.edu regarding licensing.',
    getLinks: getLinks,
    logoOnBlackBackground: logo_png,
    logoOnWhiteBackground: logoOnWhite_png
};
brand.register('Brand', Brand);
export default Brand;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2JyYW5kL3BoZXQtaW8vanMvQnJhbmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMDItMjAxNiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8vIFJldHVybnMgYnJhbmRpbmcgaW5mb3JtYXRpb24gZm9yIHRoZSBzaW11bGF0aW9ucywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9icmFuZC9pc3N1ZXMvMVxuLy8gQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG5cbmltcG9ydCBicmFuZCBmcm9tICcuLi8uLi9qcy9icmFuZC5qcyc7XG5pbXBvcnQgZ2V0TGlua3MgZnJvbSAnLi4vLi4vanMvZ2V0TGlua3MuanMnO1xuaW1wb3J0IFRCcmFuZCBmcm9tICcuLi8uLi9qcy9UQnJhbmQuanMnO1xuaW1wb3J0IGxvZ29fcG5nIGZyb20gJy4uL2ltYWdlcy9sb2dvX3BuZy5qcyc7XG5pbXBvcnQgbG9nb09uV2hpdGVfcG5nIGZyb20gJy4uL2ltYWdlcy9sb2dvT25XaGl0ZV9wbmcuanMnO1xuXG4vLyBEb2N1bWVudGF0aW9uIGZvciBhbGwgcHJvcGVydGllcyBpcyBhdmFpbGFibGUgaW4gYnJhbmQvYWRhcHRlZC1mcm9tLXBoZXQvanMvQnJhbmQuanNcbmNvbnN0IEJyYW5kOiBUQnJhbmQgPSB7XG4gIGlkOiAncGhldC1pbycsXG4gIG5hbWU6ICdQaEVUXFx1MjEyMiBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucycsIC8vIG5vIGkxOG5cbiAgY29weXJpZ2h0OiAnQ29weXJpZ2h0IMKpIDIwMDIte3t5ZWFyfX0gVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyJyxcbiAgYWRkaXRpb25hbExpY2Vuc2VTdGF0ZW1lbnQ6ICdUaGlzIFBoRVQtaU8gaW50ZXJvcGVyYWJsZSBzaW11bGF0aW9uIGZpbGUgcmVxdWlyZXMgYSBsaWNlbnNlLjxicj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdVU0UgV0lUSE9VVCBBIExJQ0VOU0UgQUdSRUVNRU5UIElTIFNUUklDVExZIFBST0hJQklURUQuPGJyPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnRhY3QgcGhldGhlbHBAY29sb3JhZG8uZWR1IHJlZ2FyZGluZyBsaWNlbnNpbmcuJyxcbiAgZ2V0TGlua3M6IGdldExpbmtzLFxuICBsb2dvT25CbGFja0JhY2tncm91bmQ6IGxvZ29fcG5nLFxuICBsb2dvT25XaGl0ZUJhY2tncm91bmQ6IGxvZ29PbldoaXRlX3BuZ1xufTtcblxuYnJhbmQucmVnaXN0ZXIoICdCcmFuZCcsIEJyYW5kICk7XG5cbmV4cG9ydCBkZWZhdWx0IEJyYW5kOyJdLCJuYW1lcyI6WyJicmFuZCIsImdldExpbmtzIiwibG9nb19wbmciLCJsb2dvT25XaGl0ZV9wbmciLCJCcmFuZCIsImlkIiwibmFtZSIsImNvcHlyaWdodCIsImFkZGl0aW9uYWxMaWNlbnNlU3RhdGVtZW50IiwibG9nb09uQmxhY2tCYWNrZ3JvdW5kIiwibG9nb09uV2hpdGVCYWNrZ3JvdW5kIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RCxtR0FBbUc7QUFDbkcsMERBQTBEO0FBRzFELE9BQU9BLFdBQVcsb0JBQW9CO0FBQ3RDLE9BQU9DLGNBQWMsdUJBQXVCO0FBRTVDLE9BQU9DLGNBQWMsd0JBQXdCO0FBQzdDLE9BQU9DLHFCQUFxQiwrQkFBK0I7QUFFM0QsdUZBQXVGO0FBQ3ZGLE1BQU1DLFFBQWdCO0lBQ3BCQyxJQUFJO0lBQ0pDLE1BQU07SUFDTkMsV0FBVztJQUNYQyw0QkFBNEIsdUVBQ0EsZ0VBQ0E7SUFDNUJQLFVBQVVBO0lBQ1ZRLHVCQUF1QlA7SUFDdkJRLHVCQUF1QlA7QUFDekI7QUFFQUgsTUFBTVcsUUFBUSxDQUFFLFNBQVNQO0FBRXpCLGVBQWVBLE1BQU0ifQ==