// Copyright 2015-2024, University of Colorado Boulder
/**
 * Constants used throughout chipper.
 * All fields are public (read-only)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ const ChipperConstants = {
    // Locale to use when no locale is specified
    FALLBACK_LOCALE: 'en',
    // Media types, also the directory names where the media files live
    MEDIA_TYPES: [
        'sounds',
        'images',
        'mipmaps'
    ],
    // Used to fill in sim.html, the sim template
    START_THIRD_PARTY_LICENSE_ENTRIES: '### START THIRD PARTY LICENSE ENTRIES ###',
    // Used to fill in sim.html, the sim template
    END_THIRD_PARTY_LICENSE_ENTRIES: '### END THIRD PARTY LICENSE ENTRIES ###',
    // (a11y) tail suffix of the a11y-view template. Expected usage: {{repository-name}}{{A11Y_VIEW_HTML_SUFFIX}}
    A11Y_VIEW_HTML_SUFFIX: '_a11y_view.html',
    // All brands that should be taken into account for dependency handling
    BRANDS: [
        'phet',
        'phet-io',
        'adapted-from-phet'
    ],
    // Where temporary build output will go in chipper, see https://github.com/phetsims/chipper/issues/900
    BUILD_DIR: 'build'
};
export default ChipperConstants;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9DaGlwcGVyQ29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENvbnN0YW50cyB1c2VkIHRocm91Z2hvdXQgY2hpcHBlci5cbiAqIEFsbCBmaWVsZHMgYXJlIHB1YmxpYyAocmVhZC1vbmx5KVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmNvbnN0IENoaXBwZXJDb25zdGFudHMgPSB7XG5cbiAgLy8gTG9jYWxlIHRvIHVzZSB3aGVuIG5vIGxvY2FsZSBpcyBzcGVjaWZpZWRcbiAgRkFMTEJBQ0tfTE9DQUxFOiAnZW4nLFxuXG4gIC8vIE1lZGlhIHR5cGVzLCBhbHNvIHRoZSBkaXJlY3RvcnkgbmFtZXMgd2hlcmUgdGhlIG1lZGlhIGZpbGVzIGxpdmVcbiAgTUVESUFfVFlQRVM6IFsgJ3NvdW5kcycsICdpbWFnZXMnLCAnbWlwbWFwcycgXSxcblxuICAvLyBVc2VkIHRvIGZpbGwgaW4gc2ltLmh0bWwsIHRoZSBzaW0gdGVtcGxhdGVcbiAgU1RBUlRfVEhJUkRfUEFSVFlfTElDRU5TRV9FTlRSSUVTOiAnIyMjIFNUQVJUIFRISVJEIFBBUlRZIExJQ0VOU0UgRU5UUklFUyAjIyMnLFxuXG4gIC8vIFVzZWQgdG8gZmlsbCBpbiBzaW0uaHRtbCwgdGhlIHNpbSB0ZW1wbGF0ZVxuICBFTkRfVEhJUkRfUEFSVFlfTElDRU5TRV9FTlRSSUVTOiAnIyMjIEVORCBUSElSRCBQQVJUWSBMSUNFTlNFIEVOVFJJRVMgIyMjJyxcblxuICAvLyAoYTExeSkgdGFpbCBzdWZmaXggb2YgdGhlIGExMXktdmlldyB0ZW1wbGF0ZS4gRXhwZWN0ZWQgdXNhZ2U6IHt7cmVwb3NpdG9yeS1uYW1lfX17e0ExMVlfVklFV19IVE1MX1NVRkZJWH19XG4gIEExMVlfVklFV19IVE1MX1NVRkZJWDogJ19hMTF5X3ZpZXcuaHRtbCcsXG5cbiAgLy8gQWxsIGJyYW5kcyB0aGF0IHNob3VsZCBiZSB0YWtlbiBpbnRvIGFjY291bnQgZm9yIGRlcGVuZGVuY3kgaGFuZGxpbmdcbiAgQlJBTkRTOiBbICdwaGV0JywgJ3BoZXQtaW8nLCAnYWRhcHRlZC1mcm9tLXBoZXQnIF0sXG5cbiAgLy8gV2hlcmUgdGVtcG9yYXJ5IGJ1aWxkIG91dHB1dCB3aWxsIGdvIGluIGNoaXBwZXIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvOTAwXG4gIEJVSUxEX0RJUjogJ2J1aWxkJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ2hpcHBlckNvbnN0YW50czsiXSwibmFtZXMiOlsiQ2hpcHBlckNvbnN0YW50cyIsIkZBTExCQUNLX0xPQ0FMRSIsIk1FRElBX1RZUEVTIiwiU1RBUlRfVEhJUkRfUEFSVFlfTElDRU5TRV9FTlRSSUVTIiwiRU5EX1RISVJEX1BBUlRZX0xJQ0VOU0VfRU5UUklFUyIsIkExMVlfVklFV19IVE1MX1NVRkZJWCIsIkJSQU5EUyIsIkJVSUxEX0RJUiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE1BQU1BLG1CQUFtQjtJQUV2Qiw0Q0FBNEM7SUFDNUNDLGlCQUFpQjtJQUVqQixtRUFBbUU7SUFDbkVDLGFBQWE7UUFBRTtRQUFVO1FBQVU7S0FBVztJQUU5Qyw2Q0FBNkM7SUFDN0NDLG1DQUFtQztJQUVuQyw2Q0FBNkM7SUFDN0NDLGlDQUFpQztJQUVqQyw2R0FBNkc7SUFDN0dDLHVCQUF1QjtJQUV2Qix1RUFBdUU7SUFDdkVDLFFBQVE7UUFBRTtRQUFRO1FBQVc7S0FBcUI7SUFFbEQsc0dBQXNHO0lBQ3RHQyxXQUFXO0FBQ2I7QUFFQSxlQUFlUCxpQkFBaUIifQ==