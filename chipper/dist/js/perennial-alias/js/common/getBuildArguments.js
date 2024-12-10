// Copyright 2022, University of Colorado Boulder
/**
 * Returns a list of arguments to use with `grunt` to build a specific simulation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const assert = require('assert');
/**
 * Returns a list of arguments to use with `grunt` to build a specific simulation
 * @public
 *
 * @param {ChipperVersion} chipperVersion
 * @param {Object} [options]
 * @returns {string[]}
 */ module.exports = function(chipperVersion, options) {
    const { brands = [
        'phet'
    ], locales = 'en', allHTML = true, debugHTML = true, uglify = true, mangle = true, minify = true, lint = true, clean = true, thumbnails = false, twitterCard = false, buildForServer = false } = options || {};
    const args = [];
    // Chipper "1.0" (it was called such) had version 0.0.0 in its package.json
    if (chipperVersion.major === 0 && chipperVersion.minor === 0) {
        assert(brands.length === 1, 'chipper 0.0.0 cannot build multiple brands at a time');
        if (lint) {
            args.push('lint-all');
        }
        if (clean) {
            args.push('clean');
        }
        if (buildForServer) {
            // This is a vital flag for chipper 1.0. Do not remove until this is no longer supported.
            args.push('build-for-server');
        } else {
            args.push('build');
        }
        if (thumbnails) {
            args.push('generate-thumbnails');
        }
        if (twitterCard) {
            args.push('generate-twitter-card');
        }
        args.push(`--brand=${brands[0]}`);
        args.push(`--locales=${locales}`);
        if (!uglify) {
            args.push('--uglify=false');
        }
        if (!mangle) {
            args.push('--mangle=false');
        }
        if (allHTML && brands[0] !== 'phet-io') {
            args.push('--allHTML');
        }
        if (debugHTML) {
            args.push('--debugHTML');
        }
    } else if (chipperVersion.major === 2 && chipperVersion.minor === 0) {
        args.push(`--brands=${brands.join(',')}`);
        args.push(`--locales=${locales}`);
        if (!uglify) {
            args.push('--minify.uglify=false');
        }
        if (!mangle) {
            args.push('--minify.mangle=false');
        }
        if (!minify) {
            args.push('--minify.minify=false');
        }
        if (!lint) {
            args.push('--lint=false');
        }
        if (allHTML) {
            args.push('--allHTML'); // This option doesn't exist on main as of 8/22/24, but this is kept for backwards compatibility
        }
        if (debugHTML) {
            args.push('--debugHTML');
        }
    } else {
        throw new Error(`unsupported chipper version: ${chipperVersion.toString()}`);
    }
    return args;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0QnVpbGRBcmd1bWVudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IG9mIGFyZ3VtZW50cyB0byB1c2Ugd2l0aCBgZ3J1bnRgIHRvIGJ1aWxkIGEgc3BlY2lmaWMgc2ltdWxhdGlvblxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IG9mIGFyZ3VtZW50cyB0byB1c2Ugd2l0aCBgZ3J1bnRgIHRvIGJ1aWxkIGEgc3BlY2lmaWMgc2ltdWxhdGlvblxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7Q2hpcHBlclZlcnNpb259IGNoaXBwZXJWZXJzaW9uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJucyB7c3RyaW5nW119XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGNoaXBwZXJWZXJzaW9uLCBvcHRpb25zICkge1xuICBjb25zdCB7XG4gICAgYnJhbmRzID0gWyAncGhldCcgXSxcbiAgICBsb2NhbGVzID0gJ2VuJyxcbiAgICBhbGxIVE1MID0gdHJ1ZSxcbiAgICBkZWJ1Z0hUTUwgPSB0cnVlLCAvLyBEZXNpcmVkIGluIGFsbW9zdCBhbGwgcGVyZW5uaWFsIGJ1aWxkcywgc28gc2V0IHRvIHRydWUgaGVyZVxuICAgIHVnbGlmeSA9IHRydWUsXG4gICAgbWFuZ2xlID0gdHJ1ZSxcbiAgICBtaW5pZnkgPSB0cnVlLFxuICAgIGxpbnQgPSB0cnVlLFxuICAgIGNsZWFuID0gdHJ1ZSxcbiAgICB0aHVtYm5haWxzID0gZmFsc2UsXG4gICAgdHdpdHRlckNhcmQgPSBmYWxzZSxcbiAgICBidWlsZEZvclNlcnZlciA9IGZhbHNlXG4gIH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gIGNvbnN0IGFyZ3MgPSBbXTtcblxuICAvLyBDaGlwcGVyIFwiMS4wXCIgKGl0IHdhcyBjYWxsZWQgc3VjaCkgaGFkIHZlcnNpb24gMC4wLjAgaW4gaXRzIHBhY2thZ2UuanNvblxuICBpZiAoIGNoaXBwZXJWZXJzaW9uLm1ham9yID09PSAwICYmIGNoaXBwZXJWZXJzaW9uLm1pbm9yID09PSAwICkge1xuICAgIGFzc2VydCggYnJhbmRzLmxlbmd0aCA9PT0gMSwgJ2NoaXBwZXIgMC4wLjAgY2Fubm90IGJ1aWxkIG11bHRpcGxlIGJyYW5kcyBhdCBhIHRpbWUnICk7XG4gICAgaWYgKCBsaW50ICkge1xuICAgICAgYXJncy5wdXNoKCAnbGludC1hbGwnICk7XG4gICAgfVxuICAgIGlmICggY2xlYW4gKSB7XG4gICAgICBhcmdzLnB1c2goICdjbGVhbicgKTtcbiAgICB9XG4gICAgaWYgKCBidWlsZEZvclNlcnZlciApIHtcbiAgICAgIC8vIFRoaXMgaXMgYSB2aXRhbCBmbGFnIGZvciBjaGlwcGVyIDEuMC4gRG8gbm90IHJlbW92ZSB1bnRpbCB0aGlzIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQuXG4gICAgICBhcmdzLnB1c2goICdidWlsZC1mb3Itc2VydmVyJyApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGFyZ3MucHVzaCggJ2J1aWxkJyApO1xuICAgIH1cbiAgICBpZiAoIHRodW1ibmFpbHMgKSB7XG4gICAgICBhcmdzLnB1c2goICdnZW5lcmF0ZS10aHVtYm5haWxzJyApO1xuICAgIH1cbiAgICBpZiAoIHR3aXR0ZXJDYXJkICkge1xuICAgICAgYXJncy5wdXNoKCAnZ2VuZXJhdGUtdHdpdHRlci1jYXJkJyApO1xuICAgIH1cbiAgICBhcmdzLnB1c2goIGAtLWJyYW5kPSR7YnJhbmRzWyAwIF19YCApO1xuICAgIGFyZ3MucHVzaCggYC0tbG9jYWxlcz0ke2xvY2FsZXN9YCApO1xuICAgIGlmICggIXVnbGlmeSApIHtcbiAgICAgIGFyZ3MucHVzaCggJy0tdWdsaWZ5PWZhbHNlJyApO1xuICAgIH1cbiAgICBpZiAoICFtYW5nbGUgKSB7XG4gICAgICBhcmdzLnB1c2goICctLW1hbmdsZT1mYWxzZScgKTtcbiAgICB9XG4gICAgaWYgKCBhbGxIVE1MICYmIGJyYW5kc1sgMCBdICE9PSAncGhldC1pbycgKSB7XG4gICAgICBhcmdzLnB1c2goICctLWFsbEhUTUwnICk7XG4gICAgfVxuICAgIGlmICggZGVidWdIVE1MICkge1xuICAgICAgYXJncy5wdXNoKCAnLS1kZWJ1Z0hUTUwnICk7XG4gICAgfVxuICB9XG4gIC8vIENoaXBwZXIgMi4wXG4gIGVsc2UgaWYgKCBjaGlwcGVyVmVyc2lvbi5tYWpvciA9PT0gMiAmJiBjaGlwcGVyVmVyc2lvbi5taW5vciA9PT0gMCApIHtcbiAgICBhcmdzLnB1c2goIGAtLWJyYW5kcz0ke2JyYW5kcy5qb2luKCAnLCcgKX1gICk7XG4gICAgYXJncy5wdXNoKCBgLS1sb2NhbGVzPSR7bG9jYWxlc31gICk7XG4gICAgaWYgKCAhdWdsaWZ5ICkge1xuICAgICAgYXJncy5wdXNoKCAnLS1taW5pZnkudWdsaWZ5PWZhbHNlJyApO1xuICAgIH1cbiAgICBpZiAoICFtYW5nbGUgKSB7XG4gICAgICBhcmdzLnB1c2goICctLW1pbmlmeS5tYW5nbGU9ZmFsc2UnICk7XG4gICAgfVxuICAgIGlmICggIW1pbmlmeSApIHtcbiAgICAgIGFyZ3MucHVzaCggJy0tbWluaWZ5Lm1pbmlmeT1mYWxzZScgKTtcbiAgICB9XG4gICAgaWYgKCAhbGludCApIHtcbiAgICAgIGFyZ3MucHVzaCggJy0tbGludD1mYWxzZScgKTtcbiAgICB9XG4gICAgaWYgKCBhbGxIVE1MICkge1xuICAgICAgYXJncy5wdXNoKCAnLS1hbGxIVE1MJyApOyAvLyBUaGlzIG9wdGlvbiBkb2Vzbid0IGV4aXN0IG9uIG1haW4gYXMgb2YgOC8yMi8yNCwgYnV0IHRoaXMgaXMga2VwdCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgICB9XG4gICAgaWYgKCBkZWJ1Z0hUTUwgKSB7XG4gICAgICBhcmdzLnB1c2goICctLWRlYnVnSFRNTCcgKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgY2hpcHBlciB2ZXJzaW9uOiAke2NoaXBwZXJWZXJzaW9uLnRvU3RyaW5nKCl9YCApO1xuICB9XG5cbiAgcmV0dXJuIGFyZ3M7XG59OyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsImNoaXBwZXJWZXJzaW9uIiwib3B0aW9ucyIsImJyYW5kcyIsImxvY2FsZXMiLCJhbGxIVE1MIiwiZGVidWdIVE1MIiwidWdsaWZ5IiwibWFuZ2xlIiwibWluaWZ5IiwibGludCIsImNsZWFuIiwidGh1bWJuYWlscyIsInR3aXR0ZXJDYXJkIiwiYnVpbGRGb3JTZXJ2ZXIiLCJhcmdzIiwibWFqb3IiLCJtaW5vciIsImxlbmd0aCIsInB1c2giLCJqb2luIiwiRXJyb3IiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxNQUFNQSxTQUFTQyxRQUFTO0FBRXhCOzs7Ozs7O0NBT0MsR0FDREMsT0FBT0MsT0FBTyxHQUFHLFNBQVVDLGNBQWMsRUFBRUMsT0FBTztJQUNoRCxNQUFNLEVBQ0pDLFNBQVM7UUFBRTtLQUFRLEVBQ25CQyxVQUFVLElBQUksRUFDZEMsVUFBVSxJQUFJLEVBQ2RDLFlBQVksSUFBSSxFQUNoQkMsU0FBUyxJQUFJLEVBQ2JDLFNBQVMsSUFBSSxFQUNiQyxTQUFTLElBQUksRUFDYkMsT0FBTyxJQUFJLEVBQ1hDLFFBQVEsSUFBSSxFQUNaQyxhQUFhLEtBQUssRUFDbEJDLGNBQWMsS0FBSyxFQUNuQkMsaUJBQWlCLEtBQUssRUFDdkIsR0FBR1osV0FBVyxDQUFDO0lBRWhCLE1BQU1hLE9BQU8sRUFBRTtJQUVmLDJFQUEyRTtJQUMzRSxJQUFLZCxlQUFlZSxLQUFLLEtBQUssS0FBS2YsZUFBZWdCLEtBQUssS0FBSyxHQUFJO1FBQzlEcEIsT0FBUU0sT0FBT2UsTUFBTSxLQUFLLEdBQUc7UUFDN0IsSUFBS1IsTUFBTztZQUNWSyxLQUFLSSxJQUFJLENBQUU7UUFDYjtRQUNBLElBQUtSLE9BQVE7WUFDWEksS0FBS0ksSUFBSSxDQUFFO1FBQ2I7UUFDQSxJQUFLTCxnQkFBaUI7WUFDcEIseUZBQXlGO1lBQ3pGQyxLQUFLSSxJQUFJLENBQUU7UUFDYixPQUNLO1lBQ0hKLEtBQUtJLElBQUksQ0FBRTtRQUNiO1FBQ0EsSUFBS1AsWUFBYTtZQUNoQkcsS0FBS0ksSUFBSSxDQUFFO1FBQ2I7UUFDQSxJQUFLTixhQUFjO1lBQ2pCRSxLQUFLSSxJQUFJLENBQUU7UUFDYjtRQUNBSixLQUFLSSxJQUFJLENBQUUsQ0FBQyxRQUFRLEVBQUVoQixNQUFNLENBQUUsRUFBRyxFQUFFO1FBQ25DWSxLQUFLSSxJQUFJLENBQUUsQ0FBQyxVQUFVLEVBQUVmLFNBQVM7UUFDakMsSUFBSyxDQUFDRyxRQUFTO1lBQ2JRLEtBQUtJLElBQUksQ0FBRTtRQUNiO1FBQ0EsSUFBSyxDQUFDWCxRQUFTO1lBQ2JPLEtBQUtJLElBQUksQ0FBRTtRQUNiO1FBQ0EsSUFBS2QsV0FBV0YsTUFBTSxDQUFFLEVBQUcsS0FBSyxXQUFZO1lBQzFDWSxLQUFLSSxJQUFJLENBQUU7UUFDYjtRQUNBLElBQUtiLFdBQVk7WUFDZlMsS0FBS0ksSUFBSSxDQUFFO1FBQ2I7SUFDRixPQUVLLElBQUtsQixlQUFlZSxLQUFLLEtBQUssS0FBS2YsZUFBZWdCLEtBQUssS0FBSyxHQUFJO1FBQ25FRixLQUFLSSxJQUFJLENBQUUsQ0FBQyxTQUFTLEVBQUVoQixPQUFPaUIsSUFBSSxDQUFFLE1BQU87UUFDM0NMLEtBQUtJLElBQUksQ0FBRSxDQUFDLFVBQVUsRUFBRWYsU0FBUztRQUNqQyxJQUFLLENBQUNHLFFBQVM7WUFDYlEsS0FBS0ksSUFBSSxDQUFFO1FBQ2I7UUFDQSxJQUFLLENBQUNYLFFBQVM7WUFDYk8sS0FBS0ksSUFBSSxDQUFFO1FBQ2I7UUFDQSxJQUFLLENBQUNWLFFBQVM7WUFDYk0sS0FBS0ksSUFBSSxDQUFFO1FBQ2I7UUFDQSxJQUFLLENBQUNULE1BQU87WUFDWEssS0FBS0ksSUFBSSxDQUFFO1FBQ2I7UUFDQSxJQUFLZCxTQUFVO1lBQ2JVLEtBQUtJLElBQUksQ0FBRSxjQUFlLGdHQUFnRztRQUM1SDtRQUNBLElBQUtiLFdBQVk7WUFDZlMsS0FBS0ksSUFBSSxDQUFFO1FBQ2I7SUFDRixPQUNLO1FBQ0gsTUFBTSxJQUFJRSxNQUFPLENBQUMsNkJBQTZCLEVBQUVwQixlQUFlcUIsUUFBUSxJQUFJO0lBQzlFO0lBRUEsT0FBT1A7QUFDVCJ9