// Copyright 2014-2023, University of Colorado Boulder
/**
 * Type that defines a shape that can be moved by the user and placed on the shape placement boards.
 *
 * @author John Blanco
 */ import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
// constants
const FADE_RATE = 2; // proportion per second
let MovableShape = class MovableShape {
    /**
   * @param {number} dt
   * @public
   */ step(dt) {
        if (!this.userControlledProperty.get()) {
            // Perform any animation.
            const currentPosition = this.positionProperty.get();
            const distanceToDestination = currentPosition.distance(this.destination);
            if (distanceToDestination > dt * AreaBuilderSharedConstants.ANIMATION_SPEED) {
                // Move a step toward the destination.
                const stepAngle = Math.atan2(this.destination.y - currentPosition.y, this.destination.x - currentPosition.x);
                const stepVector = Vector2.createPolar(AreaBuilderSharedConstants.ANIMATION_SPEED * dt, stepAngle);
                this.positionProperty.set(currentPosition.plus(stepVector));
            } else if (this.animatingProperty.get()) {
                // Less than one time step away, so just go to the destination.
                this.positionProperty.set(this.destination);
                this.animatingProperty.set(false);
            }
            // Perform any fading.
            if (this.fading) {
                this.fadeProportionProperty.set(Math.min(1, this.fadeProportionProperty.get() + dt * FADE_RATE));
                if (this.fadeProportionProperty.get() >= 1) {
                    this.fading = false;
                }
            }
        }
    }
    /**
   * Set the destination for this shape.
   * @param {Vector2} destination
   * @param {boolean} animate
   * @public
   */ setDestination(destination, animate) {
        this.destination = destination;
        if (animate) {
            this.animatingProperty.set(true);
        } else {
            this.animatingProperty.set(false);
            this.positionProperty.set(this.destination);
        }
    }
    /**
   * Return the shape to the place where it was originally created.
   * @param {boolean} animate
   * @public
   */ returnToOrigin(animate) {
        this.setDestination(this.positionProperty.initialValue, animate);
    }
    /**
   * @public
   */ fadeAway() {
        this.fading = true;
        this.fadeProportionProperty.set(0.0001); // this is done to make sure the shape is made unpickable as soon as fading starts
    }
    /**
   * Returns a set of squares that are of the specified size and are positioned correctly such that they collectively
   * make up the same shape as this rectangle.  The specified length must be an integer value of the length and
   * width or things will get weird.
   *
   * NOTE: This only works properly for rectangular shapes!
   *
   * @param squareLength
   * @public
   */ decomposeIntoSquares(squareLength) {
        assert && assert(this.shape.bounds.width % squareLength === 0 && this.shape.bounds.height % squareLength === 0, 'Error: A dimension of this movable shape is not an integer multiple of the provided dimension');
        const shapes = [];
        const unitSquareShape = Shape.rect(0, 0, squareLength, squareLength);
        for(let column = 0; column < this.shape.bounds.width; column += squareLength){
            for(let row = 0; row < this.shape.bounds.height; row += squareLength){
                const constituentShape = new MovableShape(unitSquareShape, this.color, this.positionProperty.initialValue);
                constituentShape.setDestination(this.positionProperty.get().plusXY(column, row), false);
                constituentShape.invisibleWhenStillProperty.set(this.invisibleWhenStillProperty.get());
                shapes.push(constituentShape);
            }
        }
        return shapes;
    }
    /**
   * @param {Shape} shape
   * @param {Color || string} color
   * @param {Vector2} initialPosition
   */ constructor(shape, color, initialPosition){
        // Property that indicates where in model space the upper left corner of this shape is.  In general, this should
        // not be set directly outside of this type, and should only be manipulated through the methods defined below.
        this.positionProperty = new Property(initialPosition);
        // Flag that tracks whether the user is dragging this shape around.  Should be set externally ; generally by the a
        // view node.
        this.userControlledProperty = new Property(false);
        // Flag that indicates whether this element is animating from one position to another ; should not be set externally.
        this.animatingProperty = new Property(false, {
            reentrant: true,
            hasListenerOrderDependencies: true // TODO: https://github.com/phetsims/area-builder/issues/124
        });
        // Value that indicates how faded out this shape is.  This is used as part of a feature where shapes can fade
        // out.  Once fade has started ; it doesn't stop until it is fully faded ; i.e. the value is 1.  This should not be
        // set externally.
        this.fadeProportionProperty = new Property(0, {
            hasListenerOrderDependencies: true
        }); // TODO: https://github.com/phetsims/area-builder/issues/124
        // A flag that indicates whether this individual shape should become invisible when it is done animating.  This
        // is generally used in cases where it becomes part of a larger composite shape that is depicted instead.
        this.invisibleWhenStillProperty = new Property(true);
        // Destination is used for animation, and should be set through accessor methods only.
        this.destination = initialPosition.copy(); // @private
        // Emit an event whenever this shape returns to its original position.
        this.returnedToOriginEmitter = new Emitter();
        this.positionProperty.lazyLink((position)=>{
            if (position.equals(initialPosition)) {
                this.returnedToOriginEmitter.emit();
            }
        });
        // Non-dynamic attributes
        this.shape = shape; // @public, read only
        this.color = Color.toColor(color); // @public
        // Internal vars
        this.fading = false; // @private
    }
};
areaBuilder.register('MovableShape', MovableShape);
export default MovableShape;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vbW9kZWwvTW92YWJsZVNoYXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFR5cGUgdGhhdCBkZWZpbmVzIGEgc2hhcGUgdGhhdCBjYW4gYmUgbW92ZWQgYnkgdGhlIHVzZXIgYW5kIHBsYWNlZCBvbiB0aGUgc2hhcGUgcGxhY2VtZW50IGJvYXJkcy5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XG5pbXBvcnQgQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMgZnJvbSAnLi4vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IEZBREVfUkFURSA9IDI7IC8vIHByb3BvcnRpb24gcGVyIHNlY29uZFxuXG5jbGFzcyBNb3ZhYmxlU2hhcGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgKiBAcGFyYW0ge0NvbG9yIHx8IHN0cmluZ30gY29sb3JcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBpbml0aWFsUG9zaXRpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBzaGFwZSwgY29sb3IsIGluaXRpYWxQb3NpdGlvbiApIHtcblxuICAgIC8vIFByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIHdoZXJlIGluIG1vZGVsIHNwYWNlIHRoZSB1cHBlciBsZWZ0IGNvcm5lciBvZiB0aGlzIHNoYXBlIGlzLiAgSW4gZ2VuZXJhbCwgdGhpcyBzaG91bGRcbiAgICAvLyBub3QgYmUgc2V0IGRpcmVjdGx5IG91dHNpZGUgb2YgdGhpcyB0eXBlLCBhbmQgc2hvdWxkIG9ubHkgYmUgbWFuaXB1bGF0ZWQgdGhyb3VnaCB0aGUgbWV0aG9kcyBkZWZpbmVkIGJlbG93LlxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggaW5pdGlhbFBvc2l0aW9uICk7XG5cbiAgICAvLyBGbGFnIHRoYXQgdHJhY2tzIHdoZXRoZXIgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgdGhpcyBzaGFwZSBhcm91bmQuICBTaG91bGQgYmUgc2V0IGV4dGVybmFsbHkgOyBnZW5lcmFsbHkgYnkgdGhlIGFcbiAgICAvLyB2aWV3IG5vZGUuXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xuXG4gICAgLy8gRmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHRoaXMgZWxlbWVudCBpcyBhbmltYXRpbmcgZnJvbSBvbmUgcG9zaXRpb24gdG8gYW5vdGhlciA7IHNob3VsZCBub3QgYmUgc2V0IGV4dGVybmFsbHkuXG4gICAgdGhpcy5hbmltYXRpbmdQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UsIHtcbiAgICAgIHJlZW50cmFudDogdHJ1ZSxcbiAgICAgIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM6IHRydWUgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtYnVpbGRlci9pc3N1ZXMvMTI0XG4gICAgfSApO1xuXG4gICAgLy8gVmFsdWUgdGhhdCBpbmRpY2F0ZXMgaG93IGZhZGVkIG91dCB0aGlzIHNoYXBlIGlzLiAgVGhpcyBpcyB1c2VkIGFzIHBhcnQgb2YgYSBmZWF0dXJlIHdoZXJlIHNoYXBlcyBjYW4gZmFkZVxuICAgIC8vIG91dC4gIE9uY2UgZmFkZSBoYXMgc3RhcnRlZCA7IGl0IGRvZXNuJ3Qgc3RvcCB1bnRpbCBpdCBpcyBmdWxseSBmYWRlZCA7IGkuZS4gdGhlIHZhbHVlIGlzIDEuICBUaGlzIHNob3VsZCBub3QgYmVcbiAgICAvLyBzZXQgZXh0ZXJuYWxseS5cbiAgICB0aGlzLmZhZGVQcm9wb3J0aW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAsIHsgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llczogdHJ1ZSB9ICk7IC8vIFRPRE86IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcmVhLWJ1aWxkZXIvaXNzdWVzLzEyNFxuXG4gICAgLy8gQSBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBpbmRpdmlkdWFsIHNoYXBlIHNob3VsZCBiZWNvbWUgaW52aXNpYmxlIHdoZW4gaXQgaXMgZG9uZSBhbmltYXRpbmcuICBUaGlzXG4gICAgLy8gaXMgZ2VuZXJhbGx5IHVzZWQgaW4gY2FzZXMgd2hlcmUgaXQgYmVjb21lcyBwYXJ0IG9mIGEgbGFyZ2VyIGNvbXBvc2l0ZSBzaGFwZSB0aGF0IGlzIGRlcGljdGVkIGluc3RlYWQuXG4gICAgdGhpcy5pbnZpc2libGVXaGVuU3RpbGxQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdHJ1ZSApO1xuXG4gICAgLy8gRGVzdGluYXRpb24gaXMgdXNlZCBmb3IgYW5pbWF0aW9uLCBhbmQgc2hvdWxkIGJlIHNldCB0aHJvdWdoIGFjY2Vzc29yIG1ldGhvZHMgb25seS5cbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gaW5pdGlhbFBvc2l0aW9uLmNvcHkoKTsgLy8gQHByaXZhdGVcblxuICAgIC8vIEVtaXQgYW4gZXZlbnQgd2hlbmV2ZXIgdGhpcyBzaGFwZSByZXR1cm5zIHRvIGl0cyBvcmlnaW5hbCBwb3NpdGlvbi5cbiAgICB0aGlzLnJldHVybmVkVG9PcmlnaW5FbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoIHBvc2l0aW9uID0+IHtcbiAgICAgIGlmICggcG9zaXRpb24uZXF1YWxzKCBpbml0aWFsUG9zaXRpb24gKSApIHtcbiAgICAgICAgdGhpcy5yZXR1cm5lZFRvT3JpZ2luRW1pdHRlci5lbWl0KCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gTm9uLWR5bmFtaWMgYXR0cmlidXRlc1xuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTsgLy8gQHB1YmxpYywgcmVhZCBvbmx5XG4gICAgdGhpcy5jb2xvciA9IENvbG9yLnRvQ29sb3IoIGNvbG9yICk7IC8vIEBwdWJsaWNcblxuICAgIC8vIEludGVybmFsIHZhcnNcbiAgICB0aGlzLmZhZGluZyA9IGZhbHNlOyAvLyBAcHJpdmF0ZVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxuICAgKiBAcHVibGljXG4gICAqL1xuICBzdGVwKCBkdCApIHtcbiAgICBpZiAoICF0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkuZ2V0KCkgKSB7XG5cbiAgICAgIC8vIFBlcmZvcm0gYW55IGFuaW1hdGlvbi5cbiAgICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcbiAgICAgIGNvbnN0IGRpc3RhbmNlVG9EZXN0aW5hdGlvbiA9IGN1cnJlbnRQb3NpdGlvbi5kaXN0YW5jZSggdGhpcy5kZXN0aW5hdGlvbiApO1xuICAgICAgaWYgKCBkaXN0YW5jZVRvRGVzdGluYXRpb24gPiBkdCAqIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkFOSU1BVElPTl9TUEVFRCApIHtcblxuICAgICAgICAvLyBNb3ZlIGEgc3RlcCB0b3dhcmQgdGhlIGRlc3RpbmF0aW9uLlxuICAgICAgICBjb25zdCBzdGVwQW5nbGUgPSBNYXRoLmF0YW4yKCB0aGlzLmRlc3RpbmF0aW9uLnkgLSBjdXJyZW50UG9zaXRpb24ueSwgdGhpcy5kZXN0aW5hdGlvbi54IC0gY3VycmVudFBvc2l0aW9uLnggKTtcbiAgICAgICAgY29uc3Qgc3RlcFZlY3RvciA9IFZlY3RvcjIuY3JlYXRlUG9sYXIoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkFOSU1BVElPTl9TUEVFRCAqIGR0LCBzdGVwQW5nbGUgKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldCggY3VycmVudFBvc2l0aW9uLnBsdXMoIHN0ZXBWZWN0b3IgKSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMuYW5pbWF0aW5nUHJvcGVydHkuZ2V0KCkgKSB7XG5cbiAgICAgICAgLy8gTGVzcyB0aGFuIG9uZSB0aW1lIHN0ZXAgYXdheSwgc28ganVzdCBnbyB0byB0aGUgZGVzdGluYXRpb24uXG4gICAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIHRoaXMuZGVzdGluYXRpb24gKTtcbiAgICAgICAgdGhpcy5hbmltYXRpbmdQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBlcmZvcm0gYW55IGZhZGluZy5cbiAgICAgIGlmICggdGhpcy5mYWRpbmcgKSB7XG4gICAgICAgIHRoaXMuZmFkZVByb3BvcnRpb25Qcm9wZXJ0eS5zZXQoIE1hdGgubWluKCAxLCB0aGlzLmZhZGVQcm9wb3J0aW9uUHJvcGVydHkuZ2V0KCkgKyAoIGR0ICogRkFERV9SQVRFICkgKSApO1xuICAgICAgICBpZiAoIHRoaXMuZmFkZVByb3BvcnRpb25Qcm9wZXJ0eS5nZXQoKSA+PSAxICkge1xuICAgICAgICAgIHRoaXMuZmFkaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBkZXN0aW5hdGlvbiBmb3IgdGhpcyBzaGFwZS5cbiAgICogQHBhcmFtIHtWZWN0b3IyfSBkZXN0aW5hdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFuaW1hdGVcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc2V0RGVzdGluYXRpb24oIGRlc3RpbmF0aW9uLCBhbmltYXRlICkge1xuICAgIHRoaXMuZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbjtcbiAgICBpZiAoIGFuaW1hdGUgKSB7XG4gICAgICB0aGlzLmFuaW1hdGluZ1Byb3BlcnR5LnNldCggdHJ1ZSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuYW5pbWF0aW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xuICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldCggdGhpcy5kZXN0aW5hdGlvbiApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHNoYXBlIHRvIHRoZSBwbGFjZSB3aGVyZSBpdCB3YXMgb3JpZ2luYWxseSBjcmVhdGVkLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFuaW1hdGVcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcmV0dXJuVG9PcmlnaW4oIGFuaW1hdGUgKSB7XG4gICAgdGhpcy5zZXREZXN0aW5hdGlvbiggdGhpcy5wb3NpdGlvblByb3BlcnR5LmluaXRpYWxWYWx1ZSwgYW5pbWF0ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGZhZGVBd2F5KCkge1xuICAgIHRoaXMuZmFkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmZhZGVQcm9wb3J0aW9uUHJvcGVydHkuc2V0KCAwLjAwMDEgKTsgLy8gdGhpcyBpcyBkb25lIHRvIG1ha2Ugc3VyZSB0aGUgc2hhcGUgaXMgbWFkZSB1bnBpY2thYmxlIGFzIHNvb24gYXMgZmFkaW5nIHN0YXJ0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzZXQgb2Ygc3F1YXJlcyB0aGF0IGFyZSBvZiB0aGUgc3BlY2lmaWVkIHNpemUgYW5kIGFyZSBwb3NpdGlvbmVkIGNvcnJlY3RseSBzdWNoIHRoYXQgdGhleSBjb2xsZWN0aXZlbHlcbiAgICogbWFrZSB1cCB0aGUgc2FtZSBzaGFwZSBhcyB0aGlzIHJlY3RhbmdsZS4gIFRoZSBzcGVjaWZpZWQgbGVuZ3RoIG11c3QgYmUgYW4gaW50ZWdlciB2YWx1ZSBvZiB0aGUgbGVuZ3RoIGFuZFxuICAgKiB3aWR0aCBvciB0aGluZ3Mgd2lsbCBnZXQgd2VpcmQuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgb25seSB3b3JrcyBwcm9wZXJseSBmb3IgcmVjdGFuZ3VsYXIgc2hhcGVzIVxuICAgKlxuICAgKiBAcGFyYW0gc3F1YXJlTGVuZ3RoXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRlY29tcG9zZUludG9TcXVhcmVzKCBzcXVhcmVMZW5ndGggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zaGFwZS5ib3VuZHMud2lkdGggJSBzcXVhcmVMZW5ndGggPT09IDAgJiYgdGhpcy5zaGFwZS5ib3VuZHMuaGVpZ2h0ICUgc3F1YXJlTGVuZ3RoID09PSAwLFxuICAgICAgJ0Vycm9yOiBBIGRpbWVuc2lvbiBvZiB0aGlzIG1vdmFibGUgc2hhcGUgaXMgbm90IGFuIGludGVnZXIgbXVsdGlwbGUgb2YgdGhlIHByb3ZpZGVkIGRpbWVuc2lvbicgKTtcbiAgICBjb25zdCBzaGFwZXMgPSBbXTtcbiAgICBjb25zdCB1bml0U3F1YXJlU2hhcGUgPSBTaGFwZS5yZWN0KCAwLCAwLCBzcXVhcmVMZW5ndGgsIHNxdWFyZUxlbmd0aCApO1xuICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCB0aGlzLnNoYXBlLmJvdW5kcy53aWR0aDsgY29sdW1uICs9IHNxdWFyZUxlbmd0aCApIHtcbiAgICAgIGZvciAoIGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnNoYXBlLmJvdW5kcy5oZWlnaHQ7IHJvdyArPSBzcXVhcmVMZW5ndGggKSB7XG4gICAgICAgIGNvbnN0IGNvbnN0aXR1ZW50U2hhcGUgPSBuZXcgTW92YWJsZVNoYXBlKCB1bml0U3F1YXJlU2hhcGUsIHRoaXMuY29sb3IsIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5pbml0aWFsVmFsdWUgKTtcbiAgICAgICAgY29uc3RpdHVlbnRTaGFwZS5zZXREZXN0aW5hdGlvbiggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnBsdXNYWSggY29sdW1uLCByb3cgKSwgZmFsc2UgKTtcbiAgICAgICAgY29uc3RpdHVlbnRTaGFwZS5pbnZpc2libGVXaGVuU3RpbGxQcm9wZXJ0eS5zZXQoIHRoaXMuaW52aXNpYmxlV2hlblN0aWxsUHJvcGVydHkuZ2V0KCkgKTtcbiAgICAgICAgc2hhcGVzLnB1c2goIGNvbnN0aXR1ZW50U2hhcGUgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNoYXBlcztcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ01vdmFibGVTaGFwZScsIE1vdmFibGVTaGFwZSApO1xuZXhwb3J0IGRlZmF1bHQgTW92YWJsZVNoYXBlOyJdLCJuYW1lcyI6WyJFbWl0dGVyIiwiUHJvcGVydHkiLCJWZWN0b3IyIiwiU2hhcGUiLCJDb2xvciIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJGQURFX1JBVEUiLCJNb3ZhYmxlU2hhcGUiLCJzdGVwIiwiZHQiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwiZ2V0IiwiY3VycmVudFBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRpc3RhbmNlVG9EZXN0aW5hdGlvbiIsImRpc3RhbmNlIiwiZGVzdGluYXRpb24iLCJBTklNQVRJT05fU1BFRUQiLCJzdGVwQW5nbGUiLCJNYXRoIiwiYXRhbjIiLCJ5IiwieCIsInN0ZXBWZWN0b3IiLCJjcmVhdGVQb2xhciIsInNldCIsInBsdXMiLCJhbmltYXRpbmdQcm9wZXJ0eSIsImZhZGluZyIsImZhZGVQcm9wb3J0aW9uUHJvcGVydHkiLCJtaW4iLCJzZXREZXN0aW5hdGlvbiIsImFuaW1hdGUiLCJyZXR1cm5Ub09yaWdpbiIsImluaXRpYWxWYWx1ZSIsImZhZGVBd2F5IiwiZGVjb21wb3NlSW50b1NxdWFyZXMiLCJzcXVhcmVMZW5ndGgiLCJhc3NlcnQiLCJzaGFwZSIsImJvdW5kcyIsIndpZHRoIiwiaGVpZ2h0Iiwic2hhcGVzIiwidW5pdFNxdWFyZVNoYXBlIiwicmVjdCIsImNvbHVtbiIsInJvdyIsImNvbnN0aXR1ZW50U2hhcGUiLCJjb2xvciIsInBsdXNYWSIsImludmlzaWJsZVdoZW5TdGlsbFByb3BlcnR5IiwicHVzaCIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbFBvc2l0aW9uIiwicmVlbnRyYW50IiwiaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcyIsImNvcHkiLCJyZXR1cm5lZFRvT3JpZ2luRW1pdHRlciIsImxhenlMaW5rIiwicG9zaXRpb24iLCJlcXVhbHMiLCJlbWl0IiwidG9Db2xvciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGFBQWEsaUNBQWlDO0FBQ3JELE9BQU9DLGNBQWMsa0NBQWtDO0FBQ3ZELE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELFNBQVNDLEtBQUssUUFBUSxpQ0FBaUM7QUFDdkQsU0FBU0MsS0FBSyxRQUFRLG9DQUFvQztBQUMxRCxPQUFPQyxpQkFBaUIsdUJBQXVCO0FBQy9DLE9BQU9DLGdDQUFnQyxtQ0FBbUM7QUFFMUUsWUFBWTtBQUNaLE1BQU1DLFlBQVksR0FBRyx3QkFBd0I7QUFFN0MsSUFBQSxBQUFNQyxlQUFOLE1BQU1BO0lBbURKOzs7R0FHQyxHQUNEQyxLQUFNQyxFQUFFLEVBQUc7UUFDVCxJQUFLLENBQUMsSUFBSSxDQUFDQyxzQkFBc0IsQ0FBQ0MsR0FBRyxJQUFLO1lBRXhDLHlCQUF5QjtZQUN6QixNQUFNQyxrQkFBa0IsSUFBSSxDQUFDQyxnQkFBZ0IsQ0FBQ0YsR0FBRztZQUNqRCxNQUFNRyx3QkFBd0JGLGdCQUFnQkcsUUFBUSxDQUFFLElBQUksQ0FBQ0MsV0FBVztZQUN4RSxJQUFLRix3QkFBd0JMLEtBQUtKLDJCQUEyQlksZUFBZSxFQUFHO2dCQUU3RSxzQ0FBc0M7Z0JBQ3RDLE1BQU1DLFlBQVlDLEtBQUtDLEtBQUssQ0FBRSxJQUFJLENBQUNKLFdBQVcsQ0FBQ0ssQ0FBQyxHQUFHVCxnQkFBZ0JTLENBQUMsRUFBRSxJQUFJLENBQUNMLFdBQVcsQ0FBQ00sQ0FBQyxHQUFHVixnQkFBZ0JVLENBQUM7Z0JBQzVHLE1BQU1DLGFBQWF0QixRQUFRdUIsV0FBVyxDQUFFbkIsMkJBQTJCWSxlQUFlLEdBQUdSLElBQUlTO2dCQUN6RixJQUFJLENBQUNMLGdCQUFnQixDQUFDWSxHQUFHLENBQUViLGdCQUFnQmMsSUFBSSxDQUFFSDtZQUNuRCxPQUNLLElBQUssSUFBSSxDQUFDSSxpQkFBaUIsQ0FBQ2hCLEdBQUcsSUFBSztnQkFFdkMsK0RBQStEO2dCQUMvRCxJQUFJLENBQUNFLGdCQUFnQixDQUFDWSxHQUFHLENBQUUsSUFBSSxDQUFDVCxXQUFXO2dCQUMzQyxJQUFJLENBQUNXLGlCQUFpQixDQUFDRixHQUFHLENBQUU7WUFDOUI7WUFFQSxzQkFBc0I7WUFDdEIsSUFBSyxJQUFJLENBQUNHLE1BQU0sRUFBRztnQkFDakIsSUFBSSxDQUFDQyxzQkFBc0IsQ0FBQ0osR0FBRyxDQUFFTixLQUFLVyxHQUFHLENBQUUsR0FBRyxJQUFJLENBQUNELHNCQUFzQixDQUFDbEIsR0FBRyxLQUFPRixLQUFLSDtnQkFDekYsSUFBSyxJQUFJLENBQUN1QixzQkFBc0IsQ0FBQ2xCLEdBQUcsTUFBTSxHQUFJO29CQUM1QyxJQUFJLENBQUNpQixNQUFNLEdBQUc7Z0JBQ2hCO1lBQ0Y7UUFDRjtJQUNGO0lBRUE7Ozs7O0dBS0MsR0FDREcsZUFBZ0JmLFdBQVcsRUFBRWdCLE9BQU8sRUFBRztRQUNyQyxJQUFJLENBQUNoQixXQUFXLEdBQUdBO1FBQ25CLElBQUtnQixTQUFVO1lBQ2IsSUFBSSxDQUFDTCxpQkFBaUIsQ0FBQ0YsR0FBRyxDQUFFO1FBQzlCLE9BQ0s7WUFDSCxJQUFJLENBQUNFLGlCQUFpQixDQUFDRixHQUFHLENBQUU7WUFDNUIsSUFBSSxDQUFDWixnQkFBZ0IsQ0FBQ1ksR0FBRyxDQUFFLElBQUksQ0FBQ1QsV0FBVztRQUM3QztJQUNGO0lBRUE7Ozs7R0FJQyxHQUNEaUIsZUFBZ0JELE9BQU8sRUFBRztRQUN4QixJQUFJLENBQUNELGNBQWMsQ0FBRSxJQUFJLENBQUNsQixnQkFBZ0IsQ0FBQ3FCLFlBQVksRUFBRUY7SUFDM0Q7SUFFQTs7R0FFQyxHQUNERyxXQUFXO1FBQ1QsSUFBSSxDQUFDUCxNQUFNLEdBQUc7UUFDZCxJQUFJLENBQUNDLHNCQUFzQixDQUFDSixHQUFHLENBQUUsU0FBVSxrRkFBa0Y7SUFDL0g7SUFFQTs7Ozs7Ozs7O0dBU0MsR0FDRFcscUJBQXNCQyxZQUFZLEVBQUc7UUFDbkNDLFVBQVVBLE9BQVEsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE1BQU0sQ0FBQ0MsS0FBSyxHQUFHSixpQkFBaUIsS0FBSyxJQUFJLENBQUNFLEtBQUssQ0FBQ0MsTUFBTSxDQUFDRSxNQUFNLEdBQUdMLGlCQUFpQixHQUM1RztRQUNGLE1BQU1NLFNBQVMsRUFBRTtRQUNqQixNQUFNQyxrQkFBa0IxQyxNQUFNMkMsSUFBSSxDQUFFLEdBQUcsR0FBR1IsY0FBY0E7UUFDeEQsSUFBTSxJQUFJUyxTQUFTLEdBQUdBLFNBQVMsSUFBSSxDQUFDUCxLQUFLLENBQUNDLE1BQU0sQ0FBQ0MsS0FBSyxFQUFFSyxVQUFVVCxhQUFlO1lBQy9FLElBQU0sSUFBSVUsTUFBTSxHQUFHQSxNQUFNLElBQUksQ0FBQ1IsS0FBSyxDQUFDQyxNQUFNLENBQUNFLE1BQU0sRUFBRUssT0FBT1YsYUFBZTtnQkFDdkUsTUFBTVcsbUJBQW1CLElBQUl6QyxhQUFjcUMsaUJBQWlCLElBQUksQ0FBQ0ssS0FBSyxFQUFFLElBQUksQ0FBQ3BDLGdCQUFnQixDQUFDcUIsWUFBWTtnQkFDMUdjLGlCQUFpQmpCLGNBQWMsQ0FBRSxJQUFJLENBQUNsQixnQkFBZ0IsQ0FBQ0YsR0FBRyxHQUFHdUMsTUFBTSxDQUFFSixRQUFRQyxNQUFPO2dCQUNwRkMsaUJBQWlCRywwQkFBMEIsQ0FBQzFCLEdBQUcsQ0FBRSxJQUFJLENBQUMwQiwwQkFBMEIsQ0FBQ3hDLEdBQUc7Z0JBQ3BGZ0MsT0FBT1MsSUFBSSxDQUFFSjtZQUNmO1FBQ0Y7UUFDQSxPQUFPTDtJQUNUO0lBN0lBOzs7O0dBSUMsR0FDRFUsWUFBYWQsS0FBSyxFQUFFVSxLQUFLLEVBQUVLLGVBQWUsQ0FBRztRQUUzQyxnSEFBZ0g7UUFDaEgsOEdBQThHO1FBQzlHLElBQUksQ0FBQ3pDLGdCQUFnQixHQUFHLElBQUliLFNBQVVzRDtRQUV0QyxrSEFBa0g7UUFDbEgsYUFBYTtRQUNiLElBQUksQ0FBQzVDLHNCQUFzQixHQUFHLElBQUlWLFNBQVU7UUFFNUMscUhBQXFIO1FBQ3JILElBQUksQ0FBQzJCLGlCQUFpQixHQUFHLElBQUkzQixTQUFVLE9BQU87WUFDNUN1RCxXQUFXO1lBQ1hDLDhCQUE4QixLQUFLLDREQUE0RDtRQUNqRztRQUVBLDZHQUE2RztRQUM3RyxtSEFBbUg7UUFDbkgsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQzNCLHNCQUFzQixHQUFHLElBQUk3QixTQUFVLEdBQUc7WUFBRXdELDhCQUE4QjtRQUFLLElBQUssNERBQTREO1FBRXJKLCtHQUErRztRQUMvRyx5R0FBeUc7UUFDekcsSUFBSSxDQUFDTCwwQkFBMEIsR0FBRyxJQUFJbkQsU0FBVTtRQUVoRCxzRkFBc0Y7UUFDdEYsSUFBSSxDQUFDZ0IsV0FBVyxHQUFHc0MsZ0JBQWdCRyxJQUFJLElBQUksV0FBVztRQUV0RCxzRUFBc0U7UUFDdEUsSUFBSSxDQUFDQyx1QkFBdUIsR0FBRyxJQUFJM0Q7UUFDbkMsSUFBSSxDQUFDYyxnQkFBZ0IsQ0FBQzhDLFFBQVEsQ0FBRUMsQ0FBQUE7WUFDOUIsSUFBS0EsU0FBU0MsTUFBTSxDQUFFUCxrQkFBb0I7Z0JBQ3hDLElBQUksQ0FBQ0ksdUJBQXVCLENBQUNJLElBQUk7WUFDbkM7UUFDRjtRQUVBLHlCQUF5QjtRQUN6QixJQUFJLENBQUN2QixLQUFLLEdBQUdBLE9BQU8scUJBQXFCO1FBQ3pDLElBQUksQ0FBQ1UsS0FBSyxHQUFHOUMsTUFBTTRELE9BQU8sQ0FBRWQsUUFBUyxVQUFVO1FBRS9DLGdCQUFnQjtRQUNoQixJQUFJLENBQUNyQixNQUFNLEdBQUcsT0FBTyxXQUFXO0lBQ2xDO0FBK0ZGO0FBRUF4QixZQUFZNEQsUUFBUSxDQUFFLGdCQUFnQnpEO0FBQ3RDLGVBQWVBLGFBQWEifQ==