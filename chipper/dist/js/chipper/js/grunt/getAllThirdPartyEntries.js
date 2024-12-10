// Copyright 2017-2024, University of Colorado Boulder
/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import getThirdPartyLibEntries from './getThirdPartyLibEntries.js';
/**
 * Returns an object with information about third-party license entries.
 *
 * NOTE: This pulls entries from some of the chipper globals. Should be done only after the build
 */ // TODO: type alias for TLicenseEntry, see https://github.com/phetsims/chipper/issues/1538
export default function getAllThirdPartyEntries(repo, brand, licenseEntries) {
    const thirdPartyEntries = {
        lib: getThirdPartyLibEntries(repo, brand)
    };
    if (licenseEntries) {
        for(const mediaType in licenseEntries){
            if (licenseEntries.hasOwnProperty(mediaType)) {
                const mediaEntry = licenseEntries[mediaType];
                // For each resource of that type
                for(const resourceName in mediaEntry){
                    if (mediaEntry.hasOwnProperty(resourceName)) {
                        const licenseEntry = mediaEntry[resourceName];
                        // If it is not from PhET, it is from a 3rd party and we must include it in the report
                        // But lift this restriction when building a non-phet brand
                        if (!licenseEntry) {
                            // Fail if there is no license entry.  Though this error should have been caught
                            if (brand === 'phet' || brand === 'phet-io') {
                                // during plugin loading, so this is a "double check"
                                grunt.log.error(`No license.json entry for ${resourceName}`);
                            }
                        } else if (licenseEntry.projectURL !== 'https://phet.colorado.edu' && licenseEntry.projectURL !== 'http://phet.colorado.edu') {
                            thirdPartyEntries[mediaType] = thirdPartyEntries[mediaType] || {};
                            thirdPartyEntries[mediaType][resourceName] = licenseEntry;
                        }
                    }
                }
            }
        }
    }
    return thirdPartyEntries;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dldEFsbFRoaXJkUGFydHlFbnRyaWVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZ3J1bnQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL25wbS1kZXBlbmRlbmNpZXMvZ3J1bnQuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgZ2V0VGhpcmRQYXJ0eUxpYkVudHJpZXMgZnJvbSAnLi9nZXRUaGlyZFBhcnR5TGliRW50cmllcy5qcyc7XG5cbnR5cGUgTGljZW5zZUVudHJ5ID0gUmVjb3JkPHN0cmluZywgeyBwcm9qZWN0VVJMOiBzdHJpbmcgfT47XG5leHBvcnQgdHlwZSBMaWNlbnNlRW50cmllcyA9IFJlY29yZDxzdHJpbmcsIExpY2Vuc2VFbnRyeT47XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGlyZC1wYXJ0eSBsaWNlbnNlIGVudHJpZXMuXG4gKlxuICogTk9URTogVGhpcyBwdWxscyBlbnRyaWVzIGZyb20gc29tZSBvZiB0aGUgY2hpcHBlciBnbG9iYWxzLiBTaG91bGQgYmUgZG9uZSBvbmx5IGFmdGVyIHRoZSBidWlsZFxuICovXG4vLyBUT0RPOiB0eXBlIGFsaWFzIGZvciBUTGljZW5zZUVudHJ5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzE1MzhcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEFsbFRoaXJkUGFydHlFbnRyaWVzKCByZXBvOiBzdHJpbmcsIGJyYW5kOiBzdHJpbmcsIGxpY2Vuc2VFbnRyaWVzPzogTGljZW5zZUVudHJpZXMgKTogUmVjb3JkPHN0cmluZywgSW50ZW50aW9uYWxBbnk+IHtcbiAgY29uc3QgdGhpcmRQYXJ0eUVudHJpZXM6IFJlY29yZDxzdHJpbmcsIEludGVudGlvbmFsQW55PiA9IHtcbiAgICBsaWI6IGdldFRoaXJkUGFydHlMaWJFbnRyaWVzKCByZXBvLCBicmFuZCApXG4gIH07XG4gIGlmICggbGljZW5zZUVudHJpZXMgKSB7XG4gICAgZm9yICggY29uc3QgbWVkaWFUeXBlIGluIGxpY2Vuc2VFbnRyaWVzICkge1xuICAgICAgaWYgKCBsaWNlbnNlRW50cmllcy5oYXNPd25Qcm9wZXJ0eSggbWVkaWFUeXBlICkgKSB7XG5cbiAgICAgICAgY29uc3QgbWVkaWFFbnRyeSA9IGxpY2Vuc2VFbnRyaWVzWyBtZWRpYVR5cGUgXTtcblxuICAgICAgICAvLyBGb3IgZWFjaCByZXNvdXJjZSBvZiB0aGF0IHR5cGVcbiAgICAgICAgZm9yICggY29uc3QgcmVzb3VyY2VOYW1lIGluIG1lZGlhRW50cnkgKSB7XG4gICAgICAgICAgaWYgKCBtZWRpYUVudHJ5Lmhhc093blByb3BlcnR5KCByZXNvdXJjZU5hbWUgKSApIHtcblxuICAgICAgICAgICAgY29uc3QgbGljZW5zZUVudHJ5ID0gbWVkaWFFbnRyeVsgcmVzb3VyY2VOYW1lIF07XG5cbiAgICAgICAgICAgIC8vIElmIGl0IGlzIG5vdCBmcm9tIFBoRVQsIGl0IGlzIGZyb20gYSAzcmQgcGFydHkgYW5kIHdlIG11c3QgaW5jbHVkZSBpdCBpbiB0aGUgcmVwb3J0XG4gICAgICAgICAgICAvLyBCdXQgbGlmdCB0aGlzIHJlc3RyaWN0aW9uIHdoZW4gYnVpbGRpbmcgYSBub24tcGhldCBicmFuZFxuICAgICAgICAgICAgaWYgKCAhbGljZW5zZUVudHJ5ICkge1xuXG4gICAgICAgICAgICAgIC8vIEZhaWwgaWYgdGhlcmUgaXMgbm8gbGljZW5zZSBlbnRyeS4gIFRob3VnaCB0aGlzIGVycm9yIHNob3VsZCBoYXZlIGJlZW4gY2F1Z2h0XG4gICAgICAgICAgICAgIGlmICggYnJhbmQgPT09ICdwaGV0JyB8fCBicmFuZCA9PT0gJ3BoZXQtaW8nICkge1xuICAgICAgICAgICAgICAgIC8vIGR1cmluZyBwbHVnaW4gbG9hZGluZywgc28gdGhpcyBpcyBhIFwiZG91YmxlIGNoZWNrXCJcbiAgICAgICAgICAgICAgICBncnVudC5sb2cuZXJyb3IoIGBObyBsaWNlbnNlLmpzb24gZW50cnkgZm9yICR7cmVzb3VyY2VOYW1lfWAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIGxpY2Vuc2VFbnRyeS5wcm9qZWN0VVJMICE9PSAnaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdScgJiZcbiAgICAgICAgICAgICAgICAgICAgICBsaWNlbnNlRW50cnkucHJvamVjdFVSTCAhPT0gJ2h0dHA6Ly9waGV0LmNvbG9yYWRvLmVkdScgKSB7XG4gICAgICAgICAgICAgIHRoaXJkUGFydHlFbnRyaWVzWyBtZWRpYVR5cGUgXSA9IHRoaXJkUGFydHlFbnRyaWVzWyBtZWRpYVR5cGUgXSB8fCB7fTtcbiAgICAgICAgICAgICAgdGhpcmRQYXJ0eUVudHJpZXNbIG1lZGlhVHlwZSBdWyByZXNvdXJjZU5hbWUgXSA9IGxpY2Vuc2VFbnRyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcmRQYXJ0eUVudHJpZXM7XG59Il0sIm5hbWVzIjpbImdydW50IiwiZ2V0VGhpcmRQYXJ0eUxpYkVudHJpZXMiLCJnZXRBbGxUaGlyZFBhcnR5RW50cmllcyIsInJlcG8iLCJicmFuZCIsImxpY2Vuc2VFbnRyaWVzIiwidGhpcmRQYXJ0eUVudHJpZXMiLCJsaWIiLCJtZWRpYVR5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsIm1lZGlhRW50cnkiLCJyZXNvdXJjZU5hbWUiLCJsaWNlbnNlRW50cnkiLCJsb2ciLCJlcnJvciIsInByb2plY3RVUkwiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Q0FFQyxHQUVELE9BQU9BLFdBQVcsd0RBQXdEO0FBRTFFLE9BQU9DLDZCQUE2QiwrQkFBK0I7QUFLbkU7Ozs7Q0FJQyxHQUNELDBGQUEwRjtBQUMxRixlQUFlLFNBQVNDLHdCQUF5QkMsSUFBWSxFQUFFQyxLQUFhLEVBQUVDLGNBQStCO0lBQzNHLE1BQU1DLG9CQUFvRDtRQUN4REMsS0FBS04sd0JBQXlCRSxNQUFNQztJQUN0QztJQUNBLElBQUtDLGdCQUFpQjtRQUNwQixJQUFNLE1BQU1HLGFBQWFILGVBQWlCO1lBQ3hDLElBQUtBLGVBQWVJLGNBQWMsQ0FBRUQsWUFBYztnQkFFaEQsTUFBTUUsYUFBYUwsY0FBYyxDQUFFRyxVQUFXO2dCQUU5QyxpQ0FBaUM7Z0JBQ2pDLElBQU0sTUFBTUcsZ0JBQWdCRCxXQUFhO29CQUN2QyxJQUFLQSxXQUFXRCxjQUFjLENBQUVFLGVBQWlCO3dCQUUvQyxNQUFNQyxlQUFlRixVQUFVLENBQUVDLGFBQWM7d0JBRS9DLHNGQUFzRjt3QkFDdEYsMkRBQTJEO3dCQUMzRCxJQUFLLENBQUNDLGNBQWU7NEJBRW5CLGdGQUFnRjs0QkFDaEYsSUFBS1IsVUFBVSxVQUFVQSxVQUFVLFdBQVk7Z0NBQzdDLHFEQUFxRDtnQ0FDckRKLE1BQU1hLEdBQUcsQ0FBQ0MsS0FBSyxDQUFFLENBQUMsMEJBQTBCLEVBQUVILGNBQWM7NEJBQzlEO3dCQUNGLE9BQ0ssSUFBS0MsYUFBYUcsVUFBVSxLQUFLLCtCQUM1QkgsYUFBYUcsVUFBVSxLQUFLLDRCQUE2Qjs0QkFDakVULGlCQUFpQixDQUFFRSxVQUFXLEdBQUdGLGlCQUFpQixDQUFFRSxVQUFXLElBQUksQ0FBQzs0QkFDcEVGLGlCQUFpQixDQUFFRSxVQUFXLENBQUVHLGFBQWMsR0FBR0M7d0JBQ25EO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0lBRUEsT0FBT047QUFDVCJ9