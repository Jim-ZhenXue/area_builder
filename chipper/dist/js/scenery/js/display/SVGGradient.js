// Copyright 2017-2024, University of Colorado Boulder
/**
 * Base type for controllers that create and keep an SVG gradient element up-to-date with a Scenery gradient.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import cleanArray from '../../../phet-core/js/cleanArray.js';
import { scenery, SVGGradientStop } from '../imports.js';
let SVGGradient = class SVGGradient {
    isActiveSVGGradient() {
        return !!this.svgBlock;
    }
    initialize(svgBlock, gradient) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradient] initialize ${gradient.id}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        this.svgBlock = svgBlock;
        this.gradient = gradient;
        const hasPreviousDefinition = this.definition !== undefined;
        this.definition = this.definition || this.createDefinition();
        if (!hasPreviousDefinition) {
            // so we don't depend on the bounds of the object being drawn with the gradient
            this.definition.setAttribute('gradientUnits', 'userSpaceOnUse');
        }
        if (gradient.transformMatrix) {
            this.definition.setAttribute('gradientTransform', gradient.transformMatrix.getSVGTransform());
        } else {
            this.definition.removeAttribute('gradientTransform');
        }
        // We need to make a function call, as stops need to be rescaled/reversed in some radial gradient cases.
        const gradientStops = gradient.getSVGStops();
        this.stops = cleanArray(this.stops);
        for(let i = 0; i < gradientStops.length; i++){
            const stop = new SVGGradientStop(this, gradientStops[i].ratio, gradientStops[i].color);
            this.stops.push(stop);
            this.definition.appendChild(stop.svgElement);
        }
        this.dirty = false;
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Called from SVGGradientStop when a stop needs to change the actual color.
   */ markDirty() {
        if (!this.dirty) {
            assert && assert(this.isActiveSVGGradient());
            const activeGradient = this;
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradient] switched to dirty: ${this.gradient.id}`);
            sceneryLog && sceneryLog.Paints && sceneryLog.push();
            this.dirty = true;
            activeGradient.svgBlock.markDirtyGradient(this);
            sceneryLog && sceneryLog.Paints && sceneryLog.pop();
        }
    }
    /**
   * Called from SVGBlock when we need to update our color stops.
   */ update() {
        if (!this.dirty) {
            return;
        }
        this.dirty = false;
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradient] update: ${this.gradient.id}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        for(let i = 0; i < this.stops.length; i++){
            this.stops[i].update();
        }
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Disposes, so that it can be reused from the pool.
   */ dispose() {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradient] dispose ${this.gradient.id}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        // Dispose and clean up stops
        for(let i = 0; i < this.stops.length; i++){
            const stop = this.stops[i]; // SVGGradientStop
            this.definition.removeChild(stop.svgElement);
            stop.dispose();
        }
        cleanArray(this.stops);
        this.svgBlock = null;
        this.gradient = null;
        this.freeToPool();
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    constructor(svgBlock, gradient){
        this.initialize(svgBlock, gradient);
    }
};
export { SVGGradient as default };
scenery.register('SVGGradient', SVGGradient);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9TVkdHcmFkaWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCYXNlIHR5cGUgZm9yIGNvbnRyb2xsZXJzIHRoYXQgY3JlYXRlIGFuZCBrZWVwIGFuIFNWRyBncmFkaWVudCBlbGVtZW50IHVwLXRvLWRhdGUgd2l0aCBhIFNjZW5lcnkgZ3JhZGllbnQuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcbmltcG9ydCBXaXRob3V0TnVsbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvV2l0aG91dE51bGwuanMnO1xuaW1wb3J0IHsgR3JhZGllbnQsIHNjZW5lcnksIFNWR0Jsb2NrLCBTVkdHcmFkaWVudFN0b3AgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IHR5cGUgQWN0aXZlU1ZHR3JhZGllbnQgPSBXaXRob3V0TnVsbDxTVkdHcmFkaWVudCwgJ3N2Z0Jsb2NrJyB8ICdncmFkaWVudCc+O1xuXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBTVkdHcmFkaWVudCB7XG5cbiAgLy8gdHJhbnNpZW50IChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgc3ZnQmxvY2shOiBTVkdCbG9jayB8IG51bGw7XG4gIHB1YmxpYyBncmFkaWVudCE6IEdyYWRpZW50IHwgbnVsbDtcbiAgcHVibGljIHN0b3BzITogU1ZHR3JhZGllbnRTdG9wW107XG5cbiAgLy8gcGVyc2lzdGVudFxuICBwdWJsaWMgZGVmaW5pdGlvbiE6IFNWR0dyYWRpZW50RWxlbWVudDtcblxuICBwcml2YXRlIGRpcnR5ITogYm9vbGVhbjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN2Z0Jsb2NrOiBTVkdCbG9jaywgZ3JhZGllbnQ6IEdyYWRpZW50ICkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSggc3ZnQmxvY2ssIGdyYWRpZW50ICk7XG4gIH1cblxuICBwdWJsaWMgaXNBY3RpdmVTVkdHcmFkaWVudCgpOiB0aGlzIGlzIEFjdGl2ZVNWR0dyYWRpZW50IHsgcmV0dXJuICEhdGhpcy5zdmdCbG9jazsgfVxuXG4gIHB1YmxpYyBpbml0aWFsaXplKCBzdmdCbG9jazogU1ZHQmxvY2ssIGdyYWRpZW50OiBHcmFkaWVudCApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgW1NWR0dyYWRpZW50XSBpbml0aWFsaXplICR7Z3JhZGllbnQuaWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB0aGlzLnN2Z0Jsb2NrID0gc3ZnQmxvY2s7XG4gICAgdGhpcy5ncmFkaWVudCA9IGdyYWRpZW50O1xuXG4gICAgY29uc3QgaGFzUHJldmlvdXNEZWZpbml0aW9uID0gdGhpcy5kZWZpbml0aW9uICE9PSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLmRlZmluaXRpb24gPSB0aGlzLmRlZmluaXRpb24gfHwgdGhpcy5jcmVhdGVEZWZpbml0aW9uKCk7XG5cbiAgICBpZiAoICFoYXNQcmV2aW91c0RlZmluaXRpb24gKSB7XG4gICAgICAvLyBzbyB3ZSBkb24ndCBkZXBlbmQgb24gdGhlIGJvdW5kcyBvZiB0aGUgb2JqZWN0IGJlaW5nIGRyYXduIHdpdGggdGhlIGdyYWRpZW50XG4gICAgICB0aGlzLmRlZmluaXRpb24uc2V0QXR0cmlidXRlKCAnZ3JhZGllbnRVbml0cycsICd1c2VyU3BhY2VPblVzZScgKTtcbiAgICB9XG5cbiAgICBpZiAoIGdyYWRpZW50LnRyYW5zZm9ybU1hdHJpeCApIHtcbiAgICAgIHRoaXMuZGVmaW5pdGlvbi5zZXRBdHRyaWJ1dGUoICdncmFkaWVudFRyYW5zZm9ybScsIGdyYWRpZW50LnRyYW5zZm9ybU1hdHJpeC5nZXRTVkdUcmFuc2Zvcm0oKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZGVmaW5pdGlvbi5yZW1vdmVBdHRyaWJ1dGUoICdncmFkaWVudFRyYW5zZm9ybScgKTtcbiAgICB9XG5cbiAgICAvLyBXZSBuZWVkIHRvIG1ha2UgYSBmdW5jdGlvbiBjYWxsLCBhcyBzdG9wcyBuZWVkIHRvIGJlIHJlc2NhbGVkL3JldmVyc2VkIGluIHNvbWUgcmFkaWFsIGdyYWRpZW50IGNhc2VzLlxuICAgIGNvbnN0IGdyYWRpZW50U3RvcHMgPSBncmFkaWVudC5nZXRTVkdTdG9wcygpO1xuXG4gICAgdGhpcy5zdG9wcyA9IGNsZWFuQXJyYXkoIHRoaXMuc3RvcHMgKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBncmFkaWVudFN0b3BzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3Qgc3RvcCA9IG5ldyBTVkdHcmFkaWVudFN0b3AoIHRoaXMgYXMgQWN0aXZlU1ZHR3JhZGllbnQsIGdyYWRpZW50U3RvcHNbIGkgXS5yYXRpbywgZ3JhZGllbnRTdG9wc1sgaSBdLmNvbG9yICk7XG4gICAgICB0aGlzLnN0b3BzLnB1c2goIHN0b3AgKTtcbiAgICAgIHRoaXMuZGVmaW5pdGlvbi5hcHBlbmRDaGlsZCggc3RvcC5zdmdFbGVtZW50ICk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGdyYWRpZW50LXR5cGUtc3BlY2lmaWMgZGVmaW5pdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVEZWZpbml0aW9uKCk6IFNWR0dyYWRpZW50RWxlbWVudDtcblxuICAvKipcbiAgICogQ2FsbGVkIGZyb20gU1ZHR3JhZGllbnRTdG9wIHdoZW4gYSBzdG9wIG5lZWRzIHRvIGNoYW5nZSB0aGUgYWN0dWFsIGNvbG9yLlxuICAgKi9cbiAgcHVibGljIG1hcmtEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoICF0aGlzLmRpcnR5ICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZVNWR0dyYWRpZW50KCkgKTtcbiAgICAgIGNvbnN0IGFjdGl2ZUdyYWRpZW50ID0gdGhpcyBhcyBBY3RpdmVTVkdHcmFkaWVudDtcblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdHcmFkaWVudF0gc3dpdGNoZWQgdG8gZGlydHk6ICR7dGhpcy5ncmFkaWVudCEuaWR9YCApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG5cbiAgICAgIGFjdGl2ZUdyYWRpZW50LnN2Z0Jsb2NrLm1hcmtEaXJ0eUdyYWRpZW50KCB0aGlzICk7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZyb20gU1ZHQmxvY2sgd2hlbiB3ZSBuZWVkIHRvIHVwZGF0ZSBvdXIgY29sb3Igc3RvcHMuXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICggIXRoaXMuZGlydHkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHR3JhZGllbnRdIHVwZGF0ZTogJHt0aGlzLmdyYWRpZW50IS5pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc3RvcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLnN0b3BzWyBpIF0udXBkYXRlKCk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzLCBzbyB0aGF0IGl0IGNhbiBiZSByZXVzZWQgZnJvbSB0aGUgcG9vbC5cbiAgICovXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHR3JhZGllbnRdIGRpc3Bvc2UgJHt0aGlzLmdyYWRpZW50IS5pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIERpc3Bvc2UgYW5kIGNsZWFuIHVwIHN0b3BzXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zdG9wcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHN0b3AgPSB0aGlzLnN0b3BzWyBpIF07IC8vIFNWR0dyYWRpZW50U3RvcFxuICAgICAgdGhpcy5kZWZpbml0aW9uLnJlbW92ZUNoaWxkKCBzdG9wLnN2Z0VsZW1lbnQgKTtcbiAgICAgIHN0b3AuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBjbGVhbkFycmF5KCB0aGlzLnN0b3BzICk7XG5cbiAgICB0aGlzLnN2Z0Jsb2NrID0gbnVsbDtcbiAgICB0aGlzLmdyYWRpZW50ID0gbnVsbDtcblxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgcHVibGljIGFic3RyYWN0IGZyZWVUb1Bvb2woKTogdm9pZDtcbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1NWR0dyYWRpZW50JywgU1ZHR3JhZGllbnQgKTsiXSwibmFtZXMiOlsiY2xlYW5BcnJheSIsInNjZW5lcnkiLCJTVkdHcmFkaWVudFN0b3AiLCJTVkdHcmFkaWVudCIsImlzQWN0aXZlU1ZHR3JhZGllbnQiLCJzdmdCbG9jayIsImluaXRpYWxpemUiLCJncmFkaWVudCIsInNjZW5lcnlMb2ciLCJQYWludHMiLCJpZCIsInB1c2giLCJoYXNQcmV2aW91c0RlZmluaXRpb24iLCJkZWZpbml0aW9uIiwidW5kZWZpbmVkIiwiY3JlYXRlRGVmaW5pdGlvbiIsInNldEF0dHJpYnV0ZSIsInRyYW5zZm9ybU1hdHJpeCIsImdldFNWR1RyYW5zZm9ybSIsInJlbW92ZUF0dHJpYnV0ZSIsImdyYWRpZW50U3RvcHMiLCJnZXRTVkdTdG9wcyIsInN0b3BzIiwiaSIsImxlbmd0aCIsInN0b3AiLCJyYXRpbyIsImNvbG9yIiwiYXBwZW5kQ2hpbGQiLCJzdmdFbGVtZW50IiwiZGlydHkiLCJwb3AiLCJtYXJrRGlydHkiLCJhc3NlcnQiLCJhY3RpdmVHcmFkaWVudCIsIm1hcmtEaXJ0eUdyYWRpZW50IiwidXBkYXRlIiwiZGlzcG9zZSIsInJlbW92ZUNoaWxkIiwiZnJlZVRvUG9vbCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGdCQUFnQixzQ0FBc0M7QUFFN0QsU0FBbUJDLE9BQU8sRUFBWUMsZUFBZSxRQUFRLGdCQUFnQjtBQUk5RCxJQUFBLEFBQWVDLGNBQWYsTUFBZUE7SUFnQnJCQyxzQkFBaUQ7UUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUNDLFFBQVE7SUFBRTtJQUUzRUMsV0FBWUQsUUFBa0IsRUFBRUUsUUFBa0IsRUFBUztRQUNoRUMsY0FBY0EsV0FBV0MsTUFBTSxJQUFJRCxXQUFXQyxNQUFNLENBQUUsQ0FBQyx5QkFBeUIsRUFBRUYsU0FBU0csRUFBRSxFQUFFO1FBQy9GRixjQUFjQSxXQUFXQyxNQUFNLElBQUlELFdBQVdHLElBQUk7UUFFbEQsSUFBSSxDQUFDTixRQUFRLEdBQUdBO1FBQ2hCLElBQUksQ0FBQ0UsUUFBUSxHQUFHQTtRQUVoQixNQUFNSyx3QkFBd0IsSUFBSSxDQUFDQyxVQUFVLEtBQUtDO1FBRWxELElBQUksQ0FBQ0QsVUFBVSxHQUFHLElBQUksQ0FBQ0EsVUFBVSxJQUFJLElBQUksQ0FBQ0UsZ0JBQWdCO1FBRTFELElBQUssQ0FBQ0gsdUJBQXdCO1lBQzVCLCtFQUErRTtZQUMvRSxJQUFJLENBQUNDLFVBQVUsQ0FBQ0csWUFBWSxDQUFFLGlCQUFpQjtRQUNqRDtRQUVBLElBQUtULFNBQVNVLGVBQWUsRUFBRztZQUM5QixJQUFJLENBQUNKLFVBQVUsQ0FBQ0csWUFBWSxDQUFFLHFCQUFxQlQsU0FBU1UsZUFBZSxDQUFDQyxlQUFlO1FBQzdGLE9BQ0s7WUFDSCxJQUFJLENBQUNMLFVBQVUsQ0FBQ00sZUFBZSxDQUFFO1FBQ25DO1FBRUEsd0dBQXdHO1FBQ3hHLE1BQU1DLGdCQUFnQmIsU0FBU2MsV0FBVztRQUUxQyxJQUFJLENBQUNDLEtBQUssR0FBR3RCLFdBQVksSUFBSSxDQUFDc0IsS0FBSztRQUNuQyxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUgsY0FBY0ksTUFBTSxFQUFFRCxJQUFNO1lBQy9DLE1BQU1FLE9BQU8sSUFBSXZCLGdCQUFpQixJQUFJLEVBQXVCa0IsYUFBYSxDQUFFRyxFQUFHLENBQUNHLEtBQUssRUFBRU4sYUFBYSxDQUFFRyxFQUFHLENBQUNJLEtBQUs7WUFDL0csSUFBSSxDQUFDTCxLQUFLLENBQUNYLElBQUksQ0FBRWM7WUFDakIsSUFBSSxDQUFDWixVQUFVLENBQUNlLFdBQVcsQ0FBRUgsS0FBS0ksVUFBVTtRQUM5QztRQUVBLElBQUksQ0FBQ0MsS0FBSyxHQUFHO1FBRWJ0QixjQUFjQSxXQUFXQyxNQUFNLElBQUlELFdBQVd1QixHQUFHO0lBQ25EO0lBT0E7O0dBRUMsR0FDRCxBQUFPQyxZQUFrQjtRQUN2QixJQUFLLENBQUMsSUFBSSxDQUFDRixLQUFLLEVBQUc7WUFDakJHLFVBQVVBLE9BQVEsSUFBSSxDQUFDN0IsbUJBQW1CO1lBQzFDLE1BQU04QixpQkFBaUIsSUFBSTtZQUUzQjFCLGNBQWNBLFdBQVdDLE1BQU0sSUFBSUQsV0FBV0MsTUFBTSxDQUFFLENBQUMsaUNBQWlDLEVBQUUsSUFBSSxDQUFDRixRQUFRLENBQUVHLEVBQUUsRUFBRTtZQUM3R0YsY0FBY0EsV0FBV0MsTUFBTSxJQUFJRCxXQUFXRyxJQUFJO1lBRWxELElBQUksQ0FBQ21CLEtBQUssR0FBRztZQUViSSxlQUFlN0IsUUFBUSxDQUFDOEIsaUJBQWlCLENBQUUsSUFBSTtZQUUvQzNCLGNBQWNBLFdBQVdDLE1BQU0sSUFBSUQsV0FBV3VCLEdBQUc7UUFDbkQ7SUFDRjtJQUVBOztHQUVDLEdBQ0QsQUFBT0ssU0FBZTtRQUNwQixJQUFLLENBQUMsSUFBSSxDQUFDTixLQUFLLEVBQUc7WUFDakI7UUFDRjtRQUNBLElBQUksQ0FBQ0EsS0FBSyxHQUFHO1FBRWJ0QixjQUFjQSxXQUFXQyxNQUFNLElBQUlELFdBQVdDLE1BQU0sQ0FBRSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQ0YsUUFBUSxDQUFFRyxFQUFFLEVBQUU7UUFDbEdGLGNBQWNBLFdBQVdDLE1BQU0sSUFBSUQsV0FBV0csSUFBSTtRQUVsRCxJQUFNLElBQUlZLElBQUksR0FBR0EsSUFBSSxJQUFJLENBQUNELEtBQUssQ0FBQ0UsTUFBTSxFQUFFRCxJQUFNO1lBQzVDLElBQUksQ0FBQ0QsS0FBSyxDQUFFQyxFQUFHLENBQUNhLE1BQU07UUFDeEI7UUFFQTVCLGNBQWNBLFdBQVdDLE1BQU0sSUFBSUQsV0FBV3VCLEdBQUc7SUFDbkQ7SUFFQTs7R0FFQyxHQUNELEFBQU9NLFVBQWdCO1FBQ3JCN0IsY0FBY0EsV0FBV0MsTUFBTSxJQUFJRCxXQUFXQyxNQUFNLENBQUUsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUNGLFFBQVEsQ0FBRUcsRUFBRSxFQUFFO1FBQ2xHRixjQUFjQSxXQUFXQyxNQUFNLElBQUlELFdBQVdHLElBQUk7UUFFbEQsNkJBQTZCO1FBQzdCLElBQU0sSUFBSVksSUFBSSxHQUFHQSxJQUFJLElBQUksQ0FBQ0QsS0FBSyxDQUFDRSxNQUFNLEVBQUVELElBQU07WUFDNUMsTUFBTUUsT0FBTyxJQUFJLENBQUNILEtBQUssQ0FBRUMsRUFBRyxFQUFFLGtCQUFrQjtZQUNoRCxJQUFJLENBQUNWLFVBQVUsQ0FBQ3lCLFdBQVcsQ0FBRWIsS0FBS0ksVUFBVTtZQUM1Q0osS0FBS1ksT0FBTztRQUNkO1FBQ0FyQyxXQUFZLElBQUksQ0FBQ3NCLEtBQUs7UUFFdEIsSUFBSSxDQUFDakIsUUFBUSxHQUFHO1FBQ2hCLElBQUksQ0FBQ0UsUUFBUSxHQUFHO1FBRWhCLElBQUksQ0FBQ2dDLFVBQVU7UUFFZi9CLGNBQWNBLFdBQVdDLE1BQU0sSUFBSUQsV0FBV3VCLEdBQUc7SUFDbkQ7SUE1R0EsWUFBb0IxQixRQUFrQixFQUFFRSxRQUFrQixDQUFHO1FBQzNELElBQUksQ0FBQ0QsVUFBVSxDQUFFRCxVQUFVRTtJQUM3QjtBQTZHRjtBQTNIQSxTQUE4QkoseUJBMkg3QjtBQUVERixRQUFRdUMsUUFBUSxDQUFFLGVBQWVyQyJ9