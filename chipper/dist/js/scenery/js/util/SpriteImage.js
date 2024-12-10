// Copyright 2019-2024, University of Colorado Boulder
/**
 * Represents an image with a specific center "offset". Considered immutable (with an immutable image, the Canvas if
 * provided should not change).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import mutate from '../../../phet-core/js/mutate.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Imageable, scenery } from '../imports.js';
let globalIdCounter = 1;
const scratchVector = new Vector2(0, 0);
let SpriteImage = class SpriteImage extends Imageable(Object) {
    get width() {
        return this.imageWidth;
    }
    get height() {
        return this.imageHeight;
    }
    /**
   * Returns a Shape that represents the hit-testable area of this SpriteImage.
   */ getShape() {
        if (!this.pickable) {
            return new Shape();
        }
        if (!this.shape) {
            if (this.hitTestPixels) {
                this.ensureImageData();
                if (this.imageData) {
                    this.shape = Imageable.hitTestDataToShape(this.imageData, this.width, this.height);
                } else {
                    // Empty, if we haven't been able to load image data (even if we have a width/height)
                    return new Shape();
                }
            } else if (this.width && this.height) {
                this.shape = Shape.rect(0, 0, this.width, this.height);
            } else {
                // If we have no width/height
                return new Shape();
            }
            // Apply our offset
            this.shape = this.shape.transformed(Matrix3.translation(-this.offset.x, -this.offset.y));
        }
        return this.shape;
    }
    /**
   * Ensures we have a computed imageData (computes it lazily if necessary).
   */ ensureImageData() {
        if (!this.imageData && this.width && this.height) {
            this.imageData = Imageable.getHitTestData(this.image, this.width, this.height);
        }
    }
    /**
   * Returns whether a given point is considered "inside" the SpriteImage.
   */ containsPoint(point) {
        if (!this.pickable) {
            return false;
        }
        const width = this.width;
        const height = this.height;
        // If our image isn't really loaded yet, bail out
        if (!width && !height) {
            return false;
        }
        const position = scratchVector.set(point).add(this.offset);
        // Initial position check (are we within the rectangle)
        if (position.x < 0 || position.y < 0 || position.x > width || position.y > height) {
            return false;
        }
        if (!this.hitTestPixels) {
            return true;
        } else {
            // Lazy-load image data
            this.ensureImageData();
            // And test if it's available
            if (this.imageData) {
                return Imageable.testHitTestData(this.imageData, width, height, position);
            } else {
                return false;
            }
        }
    }
    /**
   * @param image
   * @param offset - A 2d offset from the upper-left of the image which is considered the "center".
   * @param [providedOptions]
   */ constructor(image, offset, providedOptions){
        assert && assert(image instanceof HTMLImageElement || image instanceof HTMLCanvasElement);
        const initImageableOptions = {
            hitTestPixels: false,
            pickable: true
        };
        if (isTReadOnlyProperty(image)) {
            initImageableOptions.imageProperty = image;
        } else {
            initImageableOptions.image = image;
        }
        const options = optionize()(initImageableOptions, providedOptions);
        super();
        this.id = globalIdCounter++;
        this.offset = offset;
        this.pickable = options.pickable;
        this.shape = null;
        this.imageData = null;
        // Initialize Imageable items (including the image itself)
        if (isTReadOnlyProperty(image)) {
            this.imageProperty = image;
        } else {
            this.image = image;
        }
        mutate(this, Object.keys(Imageable.DEFAULT_OPTIONS), options);
    }
};
export { SpriteImage as default };
scenery.register('SpriteImage', SpriteImage);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9TcHJpdGVJbWFnZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGltYWdlIHdpdGggYSBzcGVjaWZpYyBjZW50ZXIgXCJvZmZzZXRcIi4gQ29uc2lkZXJlZCBpbW11dGFibGUgKHdpdGggYW4gaW1tdXRhYmxlIGltYWdlLCB0aGUgQ2FudmFzIGlmXG4gKiBwcm92aWRlZCBzaG91bGQgbm90IGNoYW5nZSkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSwgeyBpc1RSZWFkT25seVByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgbXV0YXRlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tdXRhdGUuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XG5pbXBvcnQgeyBJbWFnZWFibGUsIEltYWdlYWJsZUltYWdlLCBJbWFnZWFibGVPcHRpb25zLCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmxldCBnbG9iYWxJZENvdW50ZXIgPSAxO1xuY29uc3Qgc2NyYXRjaFZlY3RvciA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGhpdFRlc3RQaXhlbHM/OiBib29sZWFuO1xuICBwaWNrYWJsZT86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBTcHJpdGVJbWFnZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEltYWdlYWJsZU9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwcml0ZUltYWdlIGV4dGVuZHMgSW1hZ2VhYmxlKCBPYmplY3QgKSB7XG5cbiAgcHVibGljIHJlYWRvbmx5IGlkOiBudW1iZXI7XG4gIHB1YmxpYyByZWFkb25seSBvZmZzZXQ6IFZlY3RvcjI7XG4gIHB1YmxpYyByZWFkb25seSBwaWNrYWJsZTogYm9vbGVhbjtcbiAgcHJpdmF0ZSBzaGFwZTogU2hhcGUgfCBudWxsOyAvLyBsYXppbHktY29uc3RydWN0ZWRcbiAgcHJpdmF0ZSBpbWFnZURhdGE6IEltYWdlRGF0YSB8IG51bGw7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBpbWFnZVxuICAgKiBAcGFyYW0gb2Zmc2V0IC0gQSAyZCBvZmZzZXQgZnJvbSB0aGUgdXBwZXItbGVmdCBvZiB0aGUgaW1hZ2Ugd2hpY2ggaXMgY29uc2lkZXJlZCB0aGUgXCJjZW50ZXJcIi5cbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGltYWdlOiBJbWFnZWFibGVJbWFnZSB8IFRSZWFkT25seVByb3BlcnR5PEltYWdlYWJsZUltYWdlPiwgb2Zmc2V0OiBWZWN0b3IyLCBwcm92aWRlZE9wdGlvbnM/OiBTcHJpdGVJbWFnZU9wdGlvbnMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQgKTtcblxuICAgIGNvbnN0IGluaXRJbWFnZWFibGVPcHRpb25zID0ge1xuICAgICAgaGl0VGVzdFBpeGVsczogZmFsc2UsXG4gICAgICBwaWNrYWJsZTogdHJ1ZVxuICAgIH0gYXMgUGlja1JlcXVpcmVkPFNwcml0ZUltYWdlT3B0aW9ucywgJ2ltYWdlJyB8ICdpbWFnZVByb3BlcnR5JyB8ICdoaXRUZXN0UGl4ZWxzJyB8ICdwaWNrYWJsZSc+O1xuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggaW1hZ2UgKSApIHtcbiAgICAgIGluaXRJbWFnZWFibGVPcHRpb25zLmltYWdlUHJvcGVydHkgPSBpbWFnZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpbml0SW1hZ2VhYmxlT3B0aW9ucy5pbWFnZSA9IGltYWdlO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3ByaXRlSW1hZ2VPcHRpb25zLCBTZWxmT3B0aW9ucywgSW1hZ2VhYmxlT3B0aW9ucz4oKSggaW5pdEltYWdlYWJsZU9wdGlvbnMsIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuaWQgPSBnbG9iYWxJZENvdW50ZXIrKztcbiAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICB0aGlzLnBpY2thYmxlID0gb3B0aW9ucy5waWNrYWJsZTtcbiAgICB0aGlzLnNoYXBlID0gbnVsbDtcbiAgICB0aGlzLmltYWdlRGF0YSA9IG51bGw7XG5cbiAgICAvLyBJbml0aWFsaXplIEltYWdlYWJsZSBpdGVtcyAoaW5jbHVkaW5nIHRoZSBpbWFnZSBpdHNlbGYpXG4gICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCBpbWFnZSApICkge1xuICAgICAgdGhpcy5pbWFnZVByb3BlcnR5ID0gaW1hZ2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgIH1cblxuICAgIG11dGF0ZSggdGhpcywgT2JqZWN0LmtleXMoIEltYWdlYWJsZS5ERUZBVUxUX09QVElPTlMgKSwgb3B0aW9ucyApO1xuICB9XG5cbiAgcHVibGljIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmltYWdlV2lkdGg7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmltYWdlSGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBTaGFwZSB0aGF0IHJlcHJlc2VudHMgdGhlIGhpdC10ZXN0YWJsZSBhcmVhIG9mIHRoaXMgU3ByaXRlSW1hZ2UuXG4gICAqL1xuICBwdWJsaWMgZ2V0U2hhcGUoKTogU2hhcGUge1xuICAgIGlmICggIXRoaXMucGlja2FibGUgKSB7XG4gICAgICByZXR1cm4gbmV3IFNoYXBlKCk7XG4gICAgfVxuXG4gICAgaWYgKCAhdGhpcy5zaGFwZSApIHtcbiAgICAgIGlmICggdGhpcy5oaXRUZXN0UGl4ZWxzICkge1xuICAgICAgICB0aGlzLmVuc3VyZUltYWdlRGF0YSgpO1xuICAgICAgICBpZiAoIHRoaXMuaW1hZ2VEYXRhICkge1xuICAgICAgICAgIHRoaXMuc2hhcGUgPSBJbWFnZWFibGUuaGl0VGVzdERhdGFUb1NoYXBlKCB0aGlzLmltYWdlRGF0YSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBFbXB0eSwgaWYgd2UgaGF2ZW4ndCBiZWVuIGFibGUgdG8gbG9hZCBpbWFnZSBkYXRhIChldmVuIGlmIHdlIGhhdmUgYSB3aWR0aC9oZWlnaHQpXG4gICAgICAgICAgcmV0dXJuIG5ldyBTaGFwZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy53aWR0aCAmJiB0aGlzLmhlaWdodCApIHtcbiAgICAgICAgdGhpcy5zaGFwZSA9IFNoYXBlLnJlY3QoIDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBubyB3aWR0aC9oZWlnaHRcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBBcHBseSBvdXIgb2Zmc2V0XG4gICAgICB0aGlzLnNoYXBlID0gdGhpcy5zaGFwZS50cmFuc2Zvcm1lZCggTWF0cml4My50cmFuc2xhdGlvbiggLXRoaXMub2Zmc2V0LngsIC10aGlzLm9mZnNldC55ICkgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zaGFwZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHdlIGhhdmUgYSBjb21wdXRlZCBpbWFnZURhdGEgKGNvbXB1dGVzIGl0IGxhemlseSBpZiBuZWNlc3NhcnkpLlxuICAgKi9cbiAgcHJpdmF0ZSBlbnN1cmVJbWFnZURhdGEoKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5pbWFnZURhdGEgJiYgdGhpcy53aWR0aCAmJiB0aGlzLmhlaWdodCApIHtcbiAgICAgIHRoaXMuaW1hZ2VEYXRhID0gSW1hZ2VhYmxlLmdldEhpdFRlc3REYXRhKCB0aGlzLmltYWdlLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYSBnaXZlbiBwb2ludCBpcyBjb25zaWRlcmVkIFwiaW5zaWRlXCIgdGhlIFNwcml0ZUltYWdlLlxuICAgKi9cbiAgcHVibGljIGNvbnRhaW5zUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xuXG4gICAgaWYgKCAhdGhpcy5waWNrYWJsZSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAvLyBJZiBvdXIgaW1hZ2UgaXNuJ3QgcmVhbGx5IGxvYWRlZCB5ZXQsIGJhaWwgb3V0XG4gICAgaWYgKCAhd2lkdGggJiYgIWhlaWdodCApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwb3NpdGlvbiA9IHNjcmF0Y2hWZWN0b3Iuc2V0KCBwb2ludCApLmFkZCggdGhpcy5vZmZzZXQgKTtcblxuICAgIC8vIEluaXRpYWwgcG9zaXRpb24gY2hlY2sgKGFyZSB3ZSB3aXRoaW4gdGhlIHJlY3RhbmdsZSlcbiAgICBpZiAoIHBvc2l0aW9uLnggPCAwIHx8IHBvc2l0aW9uLnkgPCAwIHx8IHBvc2l0aW9uLnggPiB3aWR0aCB8fCBwb3NpdGlvbi55ID4gaGVpZ2h0ICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICggIXRoaXMuaGl0VGVzdFBpeGVscyApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIExhenktbG9hZCBpbWFnZSBkYXRhXG4gICAgICB0aGlzLmVuc3VyZUltYWdlRGF0YSgpO1xuXG4gICAgICAvLyBBbmQgdGVzdCBpZiBpdCdzIGF2YWlsYWJsZVxuICAgICAgaWYgKCB0aGlzLmltYWdlRGF0YSApIHtcbiAgICAgICAgcmV0dXJuIEltYWdlYWJsZS50ZXN0SGl0VGVzdERhdGEoIHRoaXMuaW1hZ2VEYXRhLCB3aWR0aCwgaGVpZ2h0LCBwb3NpdGlvbiApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1Nwcml0ZUltYWdlJywgU3ByaXRlSW1hZ2UgKTsiXSwibmFtZXMiOlsiaXNUUmVhZE9ubHlQcm9wZXJ0eSIsIk1hdHJpeDMiLCJWZWN0b3IyIiwiU2hhcGUiLCJtdXRhdGUiLCJvcHRpb25pemUiLCJJbWFnZWFibGUiLCJzY2VuZXJ5IiwiZ2xvYmFsSWRDb3VudGVyIiwic2NyYXRjaFZlY3RvciIsIlNwcml0ZUltYWdlIiwiT2JqZWN0Iiwid2lkdGgiLCJpbWFnZVdpZHRoIiwiaGVpZ2h0IiwiaW1hZ2VIZWlnaHQiLCJnZXRTaGFwZSIsInBpY2thYmxlIiwic2hhcGUiLCJoaXRUZXN0UGl4ZWxzIiwiZW5zdXJlSW1hZ2VEYXRhIiwiaW1hZ2VEYXRhIiwiaGl0VGVzdERhdGFUb1NoYXBlIiwicmVjdCIsInRyYW5zZm9ybWVkIiwidHJhbnNsYXRpb24iLCJvZmZzZXQiLCJ4IiwieSIsImdldEhpdFRlc3REYXRhIiwiaW1hZ2UiLCJjb250YWluc1BvaW50IiwicG9pbnQiLCJwb3NpdGlvbiIsInNldCIsImFkZCIsInRlc3RIaXRUZXN0RGF0YSIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsIkhUTUxJbWFnZUVsZW1lbnQiLCJIVE1MQ2FudmFzRWxlbWVudCIsImluaXRJbWFnZWFibGVPcHRpb25zIiwiaW1hZ2VQcm9wZXJ0eSIsIm9wdGlvbnMiLCJpZCIsImtleXMiLCJERUZBVUxUX09QVElPTlMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsU0FBNEJBLG1CQUFtQixRQUFRLHdDQUF3QztBQUMvRixPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxTQUFTQyxLQUFLLFFBQVEsOEJBQThCO0FBQ3BELE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLGVBQWUscUNBQXFDO0FBRTNELFNBQVNDLFNBQVMsRUFBb0NDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFckYsSUFBSUMsa0JBQWtCO0FBQ3RCLE1BQU1DLGdCQUFnQixJQUFJUCxRQUFTLEdBQUc7QUFTdkIsSUFBQSxBQUFNUSxjQUFOLE1BQU1BLG9CQUFvQkosVUFBV0s7SUFnRGxELElBQVdDLFFBQWdCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDQyxVQUFVO0lBQ3hCO0lBRUEsSUFBV0MsU0FBaUI7UUFDMUIsT0FBTyxJQUFJLENBQUNDLFdBQVc7SUFDekI7SUFFQTs7R0FFQyxHQUNELEFBQU9DLFdBQWtCO1FBQ3ZCLElBQUssQ0FBQyxJQUFJLENBQUNDLFFBQVEsRUFBRztZQUNwQixPQUFPLElB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