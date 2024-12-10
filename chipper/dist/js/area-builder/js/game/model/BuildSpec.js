// Copyright 2014-2021, University of Colorado Boulder
/**
 * Defines a 'build specification', which is used to define what a user should build when presented with a 'build it'
 * style challenge in the Area Builder game.
 *
 * @author John Blanco
 */ import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
let BuildSpec = class BuildSpec {
    /**
   * @param {BuildSpec} that
   * @returns {boolean}
   * @public
   */ equals(that) {
        if (!(that instanceof BuildSpec)) {
            return false;
        }
        // Compare area, which should always be defined.
        if (this.area !== that.area) {
            return false;
        }
        // Compare perimeter
        if (this.perimeter && !that.perimeter || !this.perimeter && that.perimeter || this.perimeter !== that.perimeter) {
            return false;
        }
        // Compare proportions
        if (!this.proportions && !that.proportions) {
            // Neither defines proportions, so we're good.
            return true;
        }
        if (this.proportions && !that.proportions || !this.proportions && that.proportions) {
            // One defines proportions and the other doesn't, so they don't match.
            return false;
        }
        // From here, if the proportion spec matches, the build specs are equal.
        return this.proportions.color1.equals(that.proportions.color1) && this.proportions.color2.equals(that.proportions.color2) && this.proportions.color1Proportion.equals(that.proportions.color1Proportion);
    }
    /**
   * @param area
   * @returns {BuildSpec}
   * @public
   */ static areaOnly(area) {
        return new BuildSpec(area);
    }
    /**
   * @param area
   * @param perimeter
   * @returns {BuildSpec}
   * @public
   */ static areaAndPerimeter(area, perimeter) {
        return new BuildSpec(area, perimeter);
    }
    /**
   * @param area
   * @param color1
   * @param color2
   * @param color1Proportion
   * @returns {BuildSpec}
   * @public
   */ static areaAndProportions(area, color1, color2, color1Proportion) {
        return new BuildSpec(area, null, {
            color1: color1,
            color2: color2,
            color1Proportion: color1Proportion
        });
    }
    /**
   * @param area
   * @param perimeter
   * @param color1
   * @param color2
   * @param color1Proportion
   * @returns {BuildSpec}
   * @public
   */ static areaPerimeterAndProportions(area, perimeter, color1, color2, color1Proportion) {
        return new BuildSpec(area, perimeter, {
            color1: color1,
            color2: color2,
            color1Proportion: color1Proportion
        });
    }
    /**
   * @param {number} area - Area of the shape that the user should construct from smaller shapes
   * @param {number} [perimeter] - Perimeter of the shapes that the user should construct
   * @param {Object} [colorProportionsSpec] - An object that specifies two colors and the proportion of the first color
   * that should be present in the user's solution.
   */ constructor(area, perimeter, colorProportionsSpec){
        assert && assert(typeof area === 'number' || area === AreaBuilderSharedConstants.INVALID_VALUE);
        this.area = area;
        if (typeof perimeter !== 'undefined' && perimeter !== null) {
            assert && assert(typeof perimeter === 'number' || perimeter === AreaBuilderSharedConstants.INVALID_VALUE);
            this.perimeter = perimeter;
        }
        if (colorProportionsSpec) {
            assert && assert(colorProportionsSpec.color1Proportion instanceof Fraction);
            this.proportions = {
                color1: Color.toColor(colorProportionsSpec.color1),
                color2: Color.toColor(colorProportionsSpec.color2),
                color1Proportion: colorProportionsSpec.color1Proportion
            };
        }
    }
};
areaBuilder.register('BuildSpec', BuildSpec);
export default BuildSpec;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL21vZGVsL0J1aWxkU3BlYy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZWZpbmVzIGEgJ2J1aWxkIHNwZWNpZmljYXRpb24nLCB3aGljaCBpcyB1c2VkIHRvIGRlZmluZSB3aGF0IGEgdXNlciBzaG91bGQgYnVpbGQgd2hlbiBwcmVzZW50ZWQgd2l0aCBhICdidWlsZCBpdCdcbiAqIHN0eWxlIGNoYWxsZW5nZSBpbiB0aGUgQXJlYSBCdWlsZGVyIGdhbWUuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICovXG5cbmltcG9ydCBGcmFjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL0ZyYWN0aW9uLmpzJztcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XG5pbXBvcnQgQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0FyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLmpzJztcblxuY2xhc3MgQnVpbGRTcGVjIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFyZWEgLSBBcmVhIG9mIHRoZSBzaGFwZSB0aGF0IHRoZSB1c2VyIHNob3VsZCBjb25zdHJ1Y3QgZnJvbSBzbWFsbGVyIHNoYXBlc1xuICAgKiBAcGFyYW0ge251bWJlcn0gW3BlcmltZXRlcl0gLSBQZXJpbWV0ZXIgb2YgdGhlIHNoYXBlcyB0aGF0IHRoZSB1c2VyIHNob3VsZCBjb25zdHJ1Y3RcbiAgICogQHBhcmFtIHtPYmplY3R9IFtjb2xvclByb3BvcnRpb25zU3BlY10gLSBBbiBvYmplY3QgdGhhdCBzcGVjaWZpZXMgdHdvIGNvbG9ycyBhbmQgdGhlIHByb3BvcnRpb24gb2YgdGhlIGZpcnN0IGNvbG9yXG4gICAqIHRoYXQgc2hvdWxkIGJlIHByZXNlbnQgaW4gdGhlIHVzZXIncyBzb2x1dGlvbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBhcmVhLCBwZXJpbWV0ZXIsIGNvbG9yUHJvcG9ydGlvbnNTcGVjICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiAoIGFyZWEgKSA9PT0gJ251bWJlcicgfHwgYXJlYSA9PT0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuSU5WQUxJRF9WQUxVRSApO1xuICAgIHRoaXMuYXJlYSA9IGFyZWE7XG4gICAgaWYgKCB0eXBlb2YgKCBwZXJpbWV0ZXIgKSAhPT0gJ3VuZGVmaW5lZCcgJiYgcGVyaW1ldGVyICE9PSBudWxsICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mICggcGVyaW1ldGVyICkgPT09ICdudW1iZXInIHx8IHBlcmltZXRlciA9PT0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuSU5WQUxJRF9WQUxVRSApO1xuICAgICAgdGhpcy5wZXJpbWV0ZXIgPSBwZXJpbWV0ZXI7XG4gICAgfVxuICAgIGlmICggY29sb3JQcm9wb3J0aW9uc1NwZWMgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb2xvclByb3BvcnRpb25zU3BlYy5jb2xvcjFQcm9wb3J0aW9uIGluc3RhbmNlb2YgRnJhY3Rpb24gKTtcbiAgICAgIHRoaXMucHJvcG9ydGlvbnMgPSB7XG4gICAgICAgIGNvbG9yMTogQ29sb3IudG9Db2xvciggY29sb3JQcm9wb3J0aW9uc1NwZWMuY29sb3IxICksXG4gICAgICAgIGNvbG9yMjogQ29sb3IudG9Db2xvciggY29sb3JQcm9wb3J0aW9uc1NwZWMuY29sb3IyICksXG4gICAgICAgIGNvbG9yMVByb3BvcnRpb246IGNvbG9yUHJvcG9ydGlvbnNTcGVjLmNvbG9yMVByb3BvcnRpb25cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7QnVpbGRTcGVjfSB0aGF0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAcHVibGljXG4gICAqL1xuICBlcXVhbHMoIHRoYXQgKSB7XG5cbiAgICBpZiAoICEoIHRoYXQgaW5zdGFuY2VvZiBCdWlsZFNwZWMgKSApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAvLyBDb21wYXJlIGFyZWEsIHdoaWNoIHNob3VsZCBhbHdheXMgYmUgZGVmaW5lZC5cbiAgICBpZiAoIHRoaXMuYXJlYSAhPT0gdGhhdC5hcmVhICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENvbXBhcmUgcGVyaW1ldGVyXG4gICAgaWYgKCB0aGlzLnBlcmltZXRlciAmJiAhdGhhdC5wZXJpbWV0ZXIgfHxcbiAgICAgICAgICF0aGlzLnBlcmltZXRlciAmJiB0aGF0LnBlcmltZXRlciB8fFxuICAgICAgICAgdGhpcy5wZXJpbWV0ZXIgIT09IHRoYXQucGVyaW1ldGVyICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENvbXBhcmUgcHJvcG9ydGlvbnNcbiAgICBpZiAoICF0aGlzLnByb3BvcnRpb25zICYmICF0aGF0LnByb3BvcnRpb25zICkge1xuICAgICAgLy8gTmVpdGhlciBkZWZpbmVzIHByb3BvcnRpb25zLCBzbyB3ZSdyZSBnb29kLlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLnByb3BvcnRpb25zICYmICF0aGF0LnByb3BvcnRpb25zIHx8ICF0aGlzLnByb3BvcnRpb25zICYmIHRoYXQucHJvcG9ydGlvbnMgKSB7XG4gICAgICAvLyBPbmUgZGVmaW5lcyBwcm9wb3J0aW9ucyBhbmQgdGhlIG90aGVyIGRvZXNuJ3QsIHNvIHRoZXkgZG9uJ3QgbWF0Y2guXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gRnJvbSBoZXJlLCBpZiB0aGUgcHJvcG9ydGlvbiBzcGVjIG1hdGNoZXMsIHRoZSBidWlsZCBzcGVjcyBhcmUgZXF1YWwuXG4gICAgcmV0dXJuICggdGhpcy5wcm9wb3J0aW9ucy5jb2xvcjEuZXF1YWxzKCB0aGF0LnByb3BvcnRpb25zLmNvbG9yMSApICYmXG4gICAgICAgICAgICAgdGhpcy5wcm9wb3J0aW9ucy5jb2xvcjIuZXF1YWxzKCB0aGF0LnByb3BvcnRpb25zLmNvbG9yMiApICYmXG4gICAgICAgICAgICAgdGhpcy5wcm9wb3J0aW9ucy5jb2xvcjFQcm9wb3J0aW9uLmVxdWFscyggdGhhdC5wcm9wb3J0aW9ucy5jb2xvcjFQcm9wb3J0aW9uICkgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhcmVhXG4gICAqIEByZXR1cm5zIHtCdWlsZFNwZWN9XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHN0YXRpYyBhcmVhT25seSggYXJlYSApIHtcbiAgICByZXR1cm4gbmV3IEJ1aWxkU3BlYyggYXJlYSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhcmVhXG4gICAqIEBwYXJhbSBwZXJpbWV0ZXJcbiAgICogQHJldHVybnMge0J1aWxkU3BlY31cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc3RhdGljIGFyZWFBbmRQZXJpbWV0ZXIoIGFyZWEsIHBlcmltZXRlciApIHtcbiAgICByZXR1cm4gbmV3IEJ1aWxkU3BlYyggYXJlYSwgcGVyaW1ldGVyICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGFyZWFcbiAgICogQHBhcmFtIGNvbG9yMVxuICAgKiBAcGFyYW0gY29sb3IyXG4gICAqIEBwYXJhbSBjb2xvcjFQcm9wb3J0aW9uXG4gICAqIEByZXR1cm5zIHtCdWlsZFNwZWN9XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHN0YXRpYyBhcmVhQW5kUHJvcG9ydGlvbnMoIGFyZWEsIGNvbG9yMSwgY29sb3IyLCBjb2xvcjFQcm9wb3J0aW9uICkge1xuICAgIHJldHVybiBuZXcgQnVpbGRTcGVjKCBhcmVhLCBudWxsLCB7XG4gICAgICAgIGNvbG9yMTogY29sb3IxLFxuICAgICAgICBjb2xvcjI6IGNvbG9yMixcbiAgICAgICAgY29sb3IxUHJvcG9ydGlvbjogY29sb3IxUHJvcG9ydGlvblxuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGFyZWFcbiAgICogQHBhcmFtIHBlcmltZXRlclxuICAgKiBAcGFyYW0gY29sb3IxXG4gICAqIEBwYXJhbSBjb2xvcjJcbiAgICogQHBhcmFtIGNvbG9yMVByb3BvcnRpb25cbiAgICogQHJldHVybnMge0J1aWxkU3BlY31cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc3RhdGljIGFyZWFQZXJpbWV0ZXJBbmRQcm9wb3J0aW9ucyggYXJlYSwgcGVyaW1ldGVyLCBjb2xvcjEsIGNvbG9yMiwgY29sb3IxUHJvcG9ydGlvbiApIHtcbiAgICByZXR1cm4gbmV3IEJ1aWxkU3BlYyggYXJlYSwgcGVyaW1ldGVyLCB7XG4gICAgICAgIGNvbG9yMTogY29sb3IxLFxuICAgICAgICBjb2xvcjI6IGNvbG9yMixcbiAgICAgICAgY29sb3IxUHJvcG9ydGlvbjogY29sb3IxUHJvcG9ydGlvblxuICAgICAgfVxuICAgICk7XG4gIH1cbn1cblxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdCdWlsZFNwZWMnLCBCdWlsZFNwZWMgKTtcbmV4cG9ydCBkZWZhdWx0IEJ1aWxkU3BlYzsiXSwibmFtZXMiOlsiRnJhY3Rpb24iLCJDb2xvciIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJCdWlsZFNwZWMiLCJlcXVhbHMiLCJ0aGF0IiwiYXJlYSIsInBlcmltZXRlciIsInByb3BvcnRpb25zIiwiY29sb3IxIiwiY29sb3IyIiwiY29sb3IxUHJvcG9ydGlvbiIsImFyZWFPbmx5IiwiYXJlYUFuZFBlcmltZXRlciIsImFyZWFBbmRQcm9wb3J0aW9ucyIsImFyZWFQZXJpbWV0ZXJBbmRQcm9wb3J0aW9ucyIsImNvbnN0cnVjdG9yIiwiY29sb3JQcm9w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