// Copyright 2024, University of Colorado Boulder
/**
 * In this file:
 *
 * regionAndCultureProperty is a global Property used to set aspects of i18n that are related to region and/or culture,
 * but that do not pertain to language (see localeProperty for language).
 *
 * The type RegionAndCulture defines the complete set of choices for regionAndCultureProperty. The choices supported by
 * a sim are defined in package.json via "supportedRegionsAndCultures", and determines the value of
 * supportedRegionAndCultureValues. Whether included explicitly or implicitly, 'usa' is always choice, because it
 * is the fallback.
 *
 * The initial value of regionAndCultureProperty can be specified in package.json and via a query parameter.
 * In package.json, "defaultRegionAndCulture" identifies the initial choice, and defaults to 'usa'.
 * Use the ?regionAndCulture query parameter to override the default, for example ?regionAndCulture=asia
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */ var _packageJSON_phet_simFeatures, _packageJSON_phet;
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import joist from '../joist.js';
import packageJSON from '../packageJSON.js';
export const DEFAULT_REGION_AND_CULTURE = 'usa';
// The complete set of valid values.
const RegionAndCultureValues = [
    // Inspired by the images and dress of the USA. Although many other countries may also identify with this choice,
    // as PhET being based in the USA, and having difficulty finding language that appropriately reflects all the regions
    // where that may match this value, it was decided to keep "United States of America" as the descriptor with the
    // understanding that other regions may identify with this choice.
    'usa',
    // Inspired by the images and dress of Africa.
    'africa',
    // Similar to 'africa', with adjustments to dress that is representative of more modest cultures.
    'africaModest',
    // Inspired by the images and dress of Asia.
    'asia',
    // Inspired by the images and dress of Latin America.
    'latinAmerica',
    // Inspired by the images and dress of Oceania.
    'oceania',
    // Randomly selects one of the other choices, but not the current choice.
    'random'
];
// The subset of RegionAndCultureValues that is supported by the sim, specified via "supportedRegionsAndCultures" in package.json.
export const supportedRegionAndCultureValues = _.uniq([
    DEFAULT_REGION_AND_CULTURE,
    ...(packageJSON == null ? void 0 : (_packageJSON_phet = packageJSON.phet) == null ? void 0 : (_packageJSON_phet_simFeatures = _packageJSON_phet.simFeatures) == null ? void 0 : _packageJSON_phet_simFeatures.supportedRegionsAndCultures) || []
].filter((regionAndCulture)=>RegionAndCultureValues.includes(regionAndCulture)));
// Is the specified regionAndCulture supported at runtime?
const isSupportedRegionAndCulture = (regionAndCulture)=>{
    return !!(regionAndCulture && supportedRegionAndCultureValues.includes(regionAndCulture));
};
const initialRegionAndCulture = window.phet.chipper.queryParameters.regionAndCulture;
assert && assert(isSupportedRegionAndCulture(initialRegionAndCulture), `Unsupported value for query parameter ?regionAndCulture: ${initialRegionAndCulture}`);
// Globally available, similar to phet.chipper.locale, for things that might read this (e.g. from puppeteer in the future).
phet.chipper.regionAndCulture = initialRegionAndCulture;
let RegionAndCultureProperty = class RegionAndCultureProperty extends Property {
    unguardedSet(value) {
        if (supportedRegionAndCultureValues.includes(value)) {
            super.unguardedSet(value);
        } else {
            assert && assert(false, 'Unsupported region-and-culture: ' + value);
        // Do not try to set if the value was invalid
        }
    }
};
const isInstrumented = supportedRegionAndCultureValues.length > 1;
const regionAndCultureProperty = new RegionAndCultureProperty(initialRegionAndCulture, {
    // Sorted so that changing the order of "supportedRegionsAndCultures" in package.json does not change the PhET-iO API.
    validValues: supportedRegionAndCultureValues.sort(),
    tandem: isInstrumented ? Tandem.GENERAL_MODEL.createTandem('regionAndCultureProperty') : Tandem.OPT_OUT,
    phetioFeatured: isInstrumented,
    phetioValueType: StringIO,
    phetioDocumentation: 'Describes how a region and culture will be portrayed in the sim.'
});
joist.register('regionAndCultureProperty', regionAndCultureProperty);
export default regionAndCultureProperty;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL2kxOG4vcmVnaW9uQW5kQ3VsdHVyZVByb3BlcnR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBJbiB0aGlzIGZpbGU6XG4gKlxuICogcmVnaW9uQW5kQ3VsdHVyZVByb3BlcnR5IGlzIGEgZ2xvYmFsIFByb3BlcnR5IHVzZWQgdG8gc2V0IGFzcGVjdHMgb2YgaTE4biB0aGF0IGFyZSByZWxhdGVkIHRvIHJlZ2lvbiBhbmQvb3IgY3VsdHVyZSxcbiAqIGJ1dCB0aGF0IGRvIG5vdCBwZXJ0YWluIHRvIGxhbmd1YWdlIChzZWUgbG9jYWxlUHJvcGVydHkgZm9yIGxhbmd1YWdlKS5cbiAqXG4gKiBUaGUgdHlwZSBSZWdpb25BbmRDdWx0dXJlIGRlZmluZXMgdGhlIGNvbXBsZXRlIHNldCBvZiBjaG9pY2VzIGZvciByZWdpb25BbmRDdWx0dXJlUHJvcGVydHkuIFRoZSBjaG9pY2VzIHN1cHBvcnRlZCBieVxuICogYSBzaW0gYXJlIGRlZmluZWQgaW4gcGFja2FnZS5qc29uIHZpYSBcInN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlc1wiLCBhbmQgZGV0ZXJtaW5lcyB0aGUgdmFsdWUgb2ZcbiAqIHN1cHBvcnRlZFJlZ2lvbkFuZEN1bHR1cmVWYWx1ZXMuIFdoZXRoZXIgaW5jbHVkZWQgZXhwbGljaXRseSBvciBpbXBsaWNpdGx5LCAndXNhJyBpcyBhbHdheXMgY2hvaWNlLCBiZWNhdXNlIGl0XG4gKiBpcyB0aGUgZmFsbGJhY2suXG4gKlxuICogVGhlIGluaXRpYWwgdmFsdWUgb2YgcmVnaW9uQW5kQ3VsdHVyZVByb3BlcnR5IGNhbiBiZSBzcGVjaWZpZWQgaW4gcGFja2FnZS5qc29uIGFuZCB2aWEgYSBxdWVyeSBwYXJhbWV0ZXIuXG4gKiBJbiBwYWNrYWdlLmpzb24sIFwiZGVmYXVsdFJlZ2lvbkFuZEN1bHR1cmVcIiBpZGVudGlmaWVzIHRoZSBpbml0aWFsIGNob2ljZSwgYW5kIGRlZmF1bHRzIHRvICd1c2EnLlxuICogVXNlIHRoZSA/cmVnaW9uQW5kQ3VsdHVyZSBxdWVyeSBwYXJhbWV0ZXIgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQsIGZvciBleGFtcGxlID9yZWdpb25BbmRDdWx0dXJlPWFzaWFcbiAqXG4gKiBAYXV0aG9yIE1hcmxhIFNjaHVseiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4uL2pvaXN0LmpzJztcbmltcG9ydCBwYWNrYWdlSlNPTiBmcm9tICcuLi9wYWNrYWdlSlNPTi5qcyc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1JFR0lPTl9BTkRfQ1VMVFVSRSA9ICd1c2EnO1xuXG4vLyBUaGUgY29tcGxldGUgc2V0IG9mIHZhbGlkIHZhbHVlcy5cbmNvbnN0IFJlZ2lvbkFuZEN1bHR1cmVWYWx1ZXMgPSBbXG5cbiAgLy8gSW5zcGlyZWQgYnkgdGhlIGltYWdlcyBhbmQgZHJlc3Mgb2YgdGhlIFVTQS4gQWx0aG91Z2ggbWFueSBvdGhlciBjb3VudHJpZXMgbWF5IGFsc28gaWRlbnRpZnkgd2l0aCB0aGlzIGNob2ljZSxcbiAgLy8gYXMgUGhFVCBiZWluZyBiYXNlZCBpbiB0aGUgVVNBLCBhbmQgaGF2aW5nIGRpZmZpY3VsdHkgZmluZGluZyBsYW5ndWFnZSB0aGF0IGFwcHJvcHJpYXRlbHkgcmVmbGVjdHMgYWxsIHRoZSByZWdpb25zXG4gIC8vIHdoZXJlIHRoYXQgbWF5IG1hdGNoIHRoaXMgdmFsdWUsIGl0IHdhcyBkZWNpZGVkIHRvIGtlZXAgXCJVbml0ZWQgU3RhdGVzIG9mIEFtZXJpY2FcIiBhcyB0aGUgZGVzY3JpcHRvciB3aXRoIHRoZVxuICAvLyB1bmRlcnN0YW5kaW5nIHRoYXQgb3RoZXIgcmVnaW9ucyBtYXkgaWRlbnRpZnkgd2l0aCB0aGlzIGNob2ljZS5cbiAgJ3VzYScsXG5cbiAgLy8gSW5zcGlyZWQgYnkgdGhlIGltYWdlcyBhbmQgZHJlc3Mgb2YgQWZyaWNhLlxuICAnYWZyaWNhJyxcblxuICAvLyBTaW1pbGFyIHRvICdhZnJpY2EnLCB3aXRoIGFkanVzdG1lbnRzIHRvIGRyZXNzIHRoYXQgaXMgcmVwcmVzZW50YXRpdmUgb2YgbW9yZSBtb2Rlc3QgY3VsdHVyZXMuXG4gICdhZnJpY2FNb2Rlc3QnLFxuXG4gIC8vIEluc3BpcmVkIGJ5IHRoZSBpbWFnZXMgYW5kIGRyZXNzIG9mIEFzaWEuXG4gICdhc2lhJyxcblxuICAvLyBJbnNwaXJlZCBieSB0aGUgaW1hZ2VzIGFuZCBkcmVzcyBvZiBMYXRpbiBBbWVyaWNhLlxuICAnbGF0aW5BbWVyaWNhJyxcblxuICAvLyBJbnNwaXJlZCBieSB0aGUgaW1hZ2VzIGFuZCBkcmVzcyBvZiBPY2VhbmlhLlxuICAnb2NlYW5pYScsXG5cbiAgLy8gUmFuZG9tbHkgc2VsZWN0cyBvbmUgb2YgdGhlIG90aGVyIGNob2ljZXMsIGJ1dCBub3QgdGhlIGN1cnJlbnQgY2hvaWNlLlxuICAncmFuZG9tJ1xuXG5dIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgUmVnaW9uQW5kQ3VsdHVyZSA9IHR5cGVvZiBSZWdpb25BbmRDdWx0dXJlVmFsdWVzWyBudW1iZXIgXTtcblxuLy8gVGhlIHN1YnNldCBvZiBSZWdpb25BbmRDdWx0dXJlVmFsdWVzIHRoYXQgaXMgc3VwcG9ydGVkIGJ5IHRoZSBzaW0sIHNwZWNpZmllZCB2aWEgXCJzdXBwb3J0ZWRSZWdpb25zQW5kQ3VsdHVyZXNcIiBpbiBwYWNrYWdlLmpzb24uXG5leHBvcnQgY29uc3Qgc3VwcG9ydGVkUmVnaW9uQW5kQ3VsdHVyZVZhbHVlczogUmVnaW9uQW5kQ3VsdHVyZVtdID0gXy51bmlxKCBbXG4gIERFRkFVTFRfUkVHSU9OX0FORF9DVUxUVVJFLCAvLyBBbHdheXMgc3VwcG9ydGVkLCBzaW5jZSBpdCBpcyBvdXIgZmFsbGJhY2suXG4gIC4uLiggcGFja2FnZUpTT04/LnBoZXQ/LnNpbUZlYXR1cmVzPy5zdXBwb3J0ZWRSZWdpb25zQW5kQ3VsdHVyZXMgfHwgW10gKVxuXS5maWx0ZXIoIHJlZ2lvbkFuZEN1bHR1cmUgPT4gUmVnaW9uQW5kQ3VsdHVyZVZhbHVlcy5pbmNsdWRlcyggcmVnaW9uQW5kQ3VsdHVyZSApICkgKTtcblxuLy8gSXMgdGhlIHNwZWNpZmllZCByZWdpb25BbmRDdWx0dXJlIHN1cHBvcnRlZCBhdCBydW50aW1lP1xuY29uc3QgaXNTdXBwb3J0ZWRSZWdpb25BbmRDdWx0dXJlID0gKCByZWdpb25BbmRDdWx0dXJlPzogUmVnaW9uQW5kQ3VsdHVyZSApOiBib29sZWFuID0+IHtcbiAgcmV0dXJuICEhKCByZWdpb25BbmRDdWx0dXJlICYmIHN1cHBvcnRlZFJlZ2lvbkFuZEN1bHR1cmVWYWx1ZXMuaW5jbHVkZXMoIHJlZ2lvbkFuZEN1bHR1cmUgKSApO1xufTtcblxuY29uc3QgaW5pdGlhbFJlZ2lvbkFuZEN1bHR1cmU6IFJlZ2lvbkFuZEN1bHR1cmUgPSB3aW5kb3cucGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5yZWdpb25BbmRDdWx0dXJlO1xuYXNzZXJ0ICYmIGFzc2VydCggaXNTdXBwb3J0ZWRSZWdpb25BbmRDdWx0dXJlKCBpbml0aWFsUmVnaW9uQW5kQ3VsdHVyZSApLFxuICBgVW5zdXBwb3J0ZWQgdmFsdWUgZm9yIHF1ZXJ5IHBhcmFtZXRlciA/cmVnaW9uQW5kQ3VsdHVyZTogJHtpbml0aWFsUmVnaW9uQW5kQ3VsdHVyZX1gICk7XG5cbi8vIEdsb2JhbGx5IGF2YWlsYWJsZSwgc2ltaWxhciB0byBwaGV0LmNoaXBwZXIubG9jYWxlLCBmb3IgdGhpbmdzIHRoYXQgbWlnaHQgcmVhZCB0aGlzIChlLmcuIGZyb20gcHVwcGV0ZWVyIGluIHRoZSBmdXR1cmUpLlxucGhldC5jaGlwcGVyLnJlZ2lvbkFuZEN1bHR1cmUgPSBpbml0aWFsUmVnaW9uQW5kQ3VsdHVyZTtcblxuY2xhc3MgUmVnaW9uQW5kQ3VsdHVyZVByb3BlcnR5IGV4dGVuZHMgUHJvcGVydHk8UmVnaW9uQW5kQ3VsdHVyZT4ge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdW5ndWFyZGVkU2V0KCB2YWx1ZTogUmVnaW9uQW5kQ3VsdHVyZSApOiB2b2lkIHtcbiAgICBpZiAoIHN1cHBvcnRlZFJlZ2lvbkFuZEN1bHR1cmVWYWx1ZXMuaW5jbHVkZXMoIHZhbHVlICkgKSB7XG4gICAgICBzdXBlci51bmd1YXJkZWRTZXQoIHZhbHVlICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdVbnN1cHBvcnRlZCByZWdpb24tYW5kLWN1bHR1cmU6ICcgKyB2YWx1ZSApO1xuXG4gICAgICAvLyBEbyBub3QgdHJ5IHRvIHNldCBpZiB0aGUgdmFsdWUgd2FzIGludmFsaWRcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgaXNJbnN0cnVtZW50ZWQgPSBzdXBwb3J0ZWRSZWdpb25BbmRDdWx0dXJlVmFsdWVzLmxlbmd0aCA+IDE7XG5cbmNvbnN0IHJlZ2lvbkFuZEN1bHR1cmVQcm9wZXJ0eSA9IG5ldyBSZWdpb25BbmRDdWx0dXJlUHJvcGVydHkoIGluaXRpYWxSZWdpb25BbmRDdWx0dXJlLCB7XG5cbiAgLy8gU29ydGVkIHNvIHRoYXQgY2hhbmdpbmcgdGhlIG9yZGVyIG9mIFwic3VwcG9ydGVkUmVnaW9uc0FuZEN1bHR1cmVzXCIgaW4gcGFja2FnZS5qc29uIGRvZXMgbm90IGNoYW5nZSB0aGUgUGhFVC1pTyBBUEkuXG4gIHZhbGlkVmFsdWVzOiBzdXBwb3J0ZWRSZWdpb25BbmRDdWx0dXJlVmFsdWVzLnNvcnQoKSxcbiAgdGFuZGVtOiBpc0luc3RydW1lbnRlZCA/IFRhbmRlbS5HRU5FUkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ3JlZ2lvbkFuZEN1bHR1cmVQcm9wZXJ0eScgKSA6IFRhbmRlbS5PUFRfT1VULFxuICBwaGV0aW9GZWF0dXJlZDogaXNJbnN0cnVtZW50ZWQsXG4gIHBoZXRpb1ZhbHVlVHlwZTogU3RyaW5nSU8sXG4gIHBoZXRpb0RvY3VtZW50YXRpb246ICdEZXNjcmliZXMgaG93IGEgcmVnaW9uIGFuZCBjdWx0dXJlIHdpbGwgYmUgcG9ydHJheWVkIGluIHRoZSBzaW0uJ1xufSApO1xuXG5qb2lzdC5yZWdpc3RlciggJ3JlZ2lvbkFuZEN1bHR1cmVQcm9wZXJ0eScsIHJlZ2lvbkFuZEN1bHR1cmVQcm9wZXJ0eSApO1xuXG5leHBvcnQgZGVmYXVsdCByZWdpb25BbmRDdWx0dXJlUHJvcGVydHk7Il0sIm5hbWVzIjpbInBhY2thZ2VKU09OIiwiUHJvcGVydHkiLCJUYW5kZW0iLCJTdHJpbmdJTyIsImpvaXN0IiwiREVGQVVMVF9SRUdJT05fQU5EX0NVTFRVUkUiLCJSZWdpb25BbmRDdWx0dXJlVmFsdWVzIiwic3VwcG9ydGVkUmVnaW9uQW5kQ3VsdHVyZVZhbHVlcyIsIl8iLCJ1bmlxIiwicGhldCIsInNpbUZlYXR1cmVzIiwic3VwcG9ydGVkUmVnaW9uc0FuZEN1bHR1cmVzIiwiZmlsdGVyIiwicmVnaW9uQW5kQ3VsdHVyZSIsImluY2x1ZGVzIiwiaXNTdXBwb3J0ZWRSZWdpb25BbmRDdWx0dXJlIiwiaW5pdGlhbFJlZ2lvbkFuZEN1bHR1cmUiLCJ3aW5kb3ciLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYXNzZXJ0IiwiUmVnaW9uQW5kQ3VsdHVyZVByb3BlcnR5IiwidW5ndWFyZGVkU2V0IiwidmFsdWUiLCJpc0luc3RydW1lbnRlZCIsImxlbmd0aCIsInJlZ2lvbkFuZEN1bHR1cmVQcm9wZXJ0eSIsInZhbGlkVmFsdWVzIiwic29ydCIsInRhbmRlbSIsIkdFTkVSQUxfTU9ERUwiLCJjcmVhdGVUYW5kZW0iLCJPUFRfT1VUIiwicGhldGlvRmVhdHVyZWQiLCJwaGV0aW9WYWx1ZVR5cGUiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLE9BMkNNQSwrQkFBQUE7QUF6Q1AsT0FBT0MsY0FBYywrQkFBK0I7QUFDcEQsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsT0FBT0MsV0FBVyxjQUFjO0FBQ2hDLE9BQU9KLGlCQUFpQixvQkFBb0I7QUFFNUMsT0FBTyxNQUFNSyw2QkFBNkIsTUFBTTtBQUVoRCxvQ0FBb0M7QUFDcEMsTUFBTUMseUJBQXlCO0lBRTdCLGlIQUFpSDtJQUNqSCxxSEFBcUg7SUFDckgsZ0hBQWdIO0lBQ2hILGtFQUFrRTtJQUNsRTtJQUVBLDhDQUE4QztJQUM5QztJQUVBLGlHQUFpRztJQUNqRztJQUVBLDRDQUE0QztJQUM1QztJQUVBLHFEQUFxRDtJQUNyRDtJQUVBLCtDQUErQztJQUMvQztJQUVBLHlFQUF5RTtJQUN6RTtDQUVEO0FBR0Qsa0lBQWtJO0FBQ2xJLE9BQU8sTUFBTUMsa0NBQXNEQyxFQUFFQyxJQUFJLENBQUU7SUFDekVKO09BQ0tMLENBQUFBLGdDQUFBQSxvQkFBQUEsWUFBYVUsSUFBSSxzQkFBakJWLGdDQUFBQSxrQkFBbUJXLFdBQVcscUJBQTlCWCw4QkFBZ0NZLDJCQUEyQixLQUFJLEVBQUU7Q0FDdkUsQ0FBQ0MsTUFBTSxDQUFFQyxDQUFBQSxtQkFBb0JSLHVCQUF1QlMsUUFBUSxDQUFFRCxvQkFBdUI7QUFFdEYsMERBQTBEO0FBQzFELE1BQU1FLDhCQUE4QixDQUFFRjtJQUNwQyxPQUFPLENBQUMsQ0FBR0EsQ0FBQUEsb0JBQW9CUCxnQ0FBZ0NRLFFBQVEsQ0FBRUQsaUJBQWlCO0FBQzVGO0FBRUEsTUFBTUcsMEJBQTRDQyxPQUFPUixJQUFJLENBQUNTLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDTixnQkFBZ0I7QUFDdEdPLFVBQVVBLE9BQVFMLDRCQUE2QkMsMEJBQzdDLENBQUMseURBQXlELEVBQUVBLHlCQUF5QjtBQUV2RiwySEFBMkg7QUFDM0hQLEtBQUtTLE9BQU8sQ0FBQ0wsZ0JBQWdCLEdBQUdHO0FBRWhDLElBQUEsQUFBTUssMkJBQU4sTUFBTUEsaUNBQWlDckI7SUFDbEJzQixhQUFjQyxLQUF1QixFQUFTO1FBQy9ELElBQUtqQixnQ0FBZ0NRLFFBQVEsQ0FBRVMsUUFBVTtZQUN2RCxLQUFLLENBQUNELGFBQWNDO1FBQ3RCLE9BQ0s7WUFDSEgsVUFBVUEsT0FBUSxPQUFPLHFDQUFxQ0c7UUFFOUQsNkNBQTZDO1FBQy9DO0lBQ0Y7QUFDRjtBQUVBLE1BQU1DLGlCQUFpQmxCLGdDQUFnQ21CLE1BQU0sR0FBRztBQUVoRSxNQUFNQywyQkFBMkIsSUFBSUwseUJBQTBCTCx5QkFBeUI7SUFFdEYsc0hBQXNIO0lBQ3RIVyxhQUFhckIsZ0NBQWdDc0IsSUFBSTtJQUNqREMsUUFBUUwsaUJBQWlCdkIsT0FBTzZCLGFBQWEsQ0FBQ0MsWUFBWSxDQUFFLDhCQUErQjlCLE9BQU8rQixPQUFPO0lBQ3pHQyxnQkFBZ0JUO0lBQ2hCVSxpQkFBaUJoQztJQUNqQmlDLHFCQUFxQjtBQUN2QjtBQUVBaEMsTUFBTWlDLFFBQVEsQ0FBRSw0QkFBNEJWO0FBRTVDLGVBQWVBLHlCQUF5QiJ9