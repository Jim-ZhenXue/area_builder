// Copyright 2013-2024, University of Colorado Boulder
/**
 * Encapsulation of the font used for PhET simulations.
 * Provides PhET-specific defaults, and guarantees a fallback for font family.
 *
 * Sample use:
 * new PhetFont( { family: 'Futura', size: 24, weight: 'bold' } )
 * new PhetFont( 24 )
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { combineOptions } from '../../phet-core/js/optionize.js';
import { Font } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
import sceneryPhetQueryParameters from './sceneryPhetQueryParameters.js';
let PhetFont = class PhetFont extends Font {
    /**
   * @param providedOptions - number or string indicate the font size, otherwise same options as phet.scenery.Font
   */ constructor(providedOptions){
        assert && assert(arguments.length === 0 || arguments.length === 1, 'Too many arguments');
        // convenience constructor: new PhetFont( {number|string} size )
        let options;
        if (typeof providedOptions === 'number' || typeof providedOptions === 'string') {
            options = {
                size: providedOptions
            };
        } else {
            options = providedOptions || {};
        }
        // PhET defaults
        options = combineOptions({
            family: sceneryPhetQueryParameters.fontFamily
        }, options);
        // Guarantee a fallback family
        assert && assert(options.family);
        options.family = [
            options.family,
            'sans-serif'
        ].join(', ');
        super(options);
    }
};
export { PhetFont as default };
sceneryPhet.register('PhetFont', PhetFont);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBFbmNhcHN1bGF0aW9uIG9mIHRoZSBmb250IHVzZWQgZm9yIFBoRVQgc2ltdWxhdGlvbnMuXG4gKiBQcm92aWRlcyBQaEVULXNwZWNpZmljIGRlZmF1bHRzLCBhbmQgZ3VhcmFudGVlcyBhIGZhbGxiYWNrIGZvciBmb250IGZhbWlseS5cbiAqXG4gKiBTYW1wbGUgdXNlOlxuICogbmV3IFBoZXRGb250KCB7IGZhbWlseTogJ0Z1dHVyYScsIHNpemU6IDI0LCB3ZWlnaHQ6ICdib2xkJyB9IClcbiAqIG5ldyBQaGV0Rm9udCggMjQgKVxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEZvbnQsIEZvbnRPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldFF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuL3NjZW5lcnlQaGV0UXVlcnlQYXJhbWV0ZXJzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGhldEZvbnQgZXh0ZW5kcyBGb250IHtcblxuICAvKipcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9ucyAtIG51bWJlciBvciBzdHJpbmcgaW5kaWNhdGUgdGhlIGZvbnQgc2l6ZSwgb3RoZXJ3aXNlIHNhbWUgb3B0aW9ucyBhcyBwaGV0LnNjZW5lcnkuRm9udFxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBudW1iZXIgfCBzdHJpbmcgfCBGb250T3B0aW9ucyApIHtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMSwgJ1RvbyBtYW55IGFyZ3VtZW50cycgKTtcblxuICAgIC8vIGNvbnZlbmllbmNlIGNvbnN0cnVjdG9yOiBuZXcgUGhldEZvbnQoIHtudW1iZXJ8c3RyaW5nfSBzaXplIClcbiAgICBsZXQgb3B0aW9uczogRm9udE9wdGlvbnM7XG4gICAgaWYgKCB0eXBlb2YgcHJvdmlkZWRPcHRpb25zID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgcHJvdmlkZWRPcHRpb25zID09PSAnc3RyaW5nJyApIHtcbiAgICAgIG9wdGlvbnMgPSB7IHNpemU6IHByb3ZpZGVkT3B0aW9ucyB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSBwcm92aWRlZE9wdGlvbnMgfHwge307XG4gICAgfVxuXG4gICAgLy8gUGhFVCBkZWZhdWx0c1xuICAgIG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxGb250T3B0aW9ucz4oIHtcbiAgICAgIGZhbWlseTogc2NlbmVyeVBoZXRRdWVyeVBhcmFtZXRlcnMuZm9udEZhbWlseSFcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICAvLyBHdWFyYW50ZWUgYSBmYWxsYmFjayBmYW1pbHlcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmZhbWlseSApO1xuXG4gICAgb3B0aW9ucy5mYW1pbHkgPSBbXG4gICAgICBvcHRpb25zLmZhbWlseSxcbiAgICAgICdzYW5zLXNlcmlmJ1xuICAgIF0uam9pbiggJywgJyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1BoZXRGb250JywgUGhldEZvbnQgKTsiXSwibmFtZXMiOlsiY29tYmluZU9wdGlvbnMiLCJGb250Iiwic2NlbmVyeVBoZXQiLCJzY2VuZXJ5UGhldFF1ZXJ5UGFyYW1ldGVycyIsIlBoZXRGb250IiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwiYXJndW1lbnRzIiwibGVuZ3RoIiwib3B0aW9ucyIsInNpemUiLCJmYW1pbHkiLCJmb250RmFtaWx5Iiwiam9pbiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7OztDQVNDLEdBRUQsU0FBU0EsY0FBYyxRQUFRLGtDQUFrQztBQUNqRSxTQUFTQyxJQUFJLFFBQXFCLDhCQUE4QjtBQUNoRSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLGdDQUFnQyxrQ0FBa0M7QUFFMUQsSUFBQSxBQUFNQyxXQUFOLE1BQU1BLGlCQUFpQkg7SUFFcEM7O0dBRUMsR0FDRCxZQUFvQkksZUFBK0MsQ0FBRztRQUVwRUMsVUFBVUEsT0FBUUMsVUFBVUMsTUFBTSxLQUFLLEtBQUtELFVBQVVDLE1BQU0sS0FBSyxHQUFHO1FBRXBFLGdFQUFnRTtRQUNoRSxJQUFJQztRQUNKLElBQUssT0FBT0osb0JBQW9CLFlBQVksT0FBT0Esb0JBQW9CLFVBQVc7WUFDaEZJLFVBQVU7Z0JBQUVDLE1BQU1MO1lBQWdCO1FBQ3BDLE9BQ0s7WUFDSEksVUFBVUosbUJBQW1CLENBQUM7UUFDaEM7UUFFQSxnQkFBZ0I7UUFDaEJJLFVBQVVULGVBQTZCO1lBQ3JDVyxRQUFRUiwyQkFBMkJTLFVBQVU7UUFDL0MsR0FBR0g7UUFFSCw4QkFBOEI7UUFDOUJILFVBQVVBLE9BQVFHLFFBQVFFLE1BQU07UUFFaENGLFFBQVFFLE1BQU0sR0FBRztZQUNmRixRQUFRRSxNQUFNO1lBQ2Q7U0FDRCxDQUFDRSxJQUFJLENBQUU7UUFFUixLQUFLLENBQUVKO0lBQ1Q7QUFDRjtBQWpDQSxTQUFxQkwsc0JBaUNwQjtBQUVERixZQUFZWSxRQUFRLENBQUUsWUFBWVYifQ==