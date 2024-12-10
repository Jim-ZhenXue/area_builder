// Copyright 2013-2024, University of Colorado Boulder
/**
 * A circular node that inherits Path, and allows for optimized drawing and improved parameter handling.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import { Shape } from '../../../kite/js/imports.js';
import extendDefined from '../../../phet-core/js/extendDefined.js';
import { CircleCanvasDrawable, CircleDOMDrawable, CircleSVGDrawable, Features, Path, Renderer, scenery } from '../imports.js';
const CIRCLE_OPTION_KEYS = [
    'radius' // {number} - see setRadius() for more documentation
];
let Circle = class Circle extends Path {
    /**
   * Determines the default allowed renderers (returned via the Renderer bitmask) that are allowed, given the
   * current stroke options. (scenery-internal)
   *
   * We can support the DOM renderer if there is a solid-styled stroke (which otherwise wouldn't be supported).
   */ getStrokeRendererBitmask() {
        let bitmask = super.getStrokeRendererBitmask();
        // @ts-expect-error TODO isGradient/isPattern better handling https://github.com/phetsims/scenery/issues/1581
        if (this.hasStroke() && !this.getStroke().isGradient && !this.getStroke().isPattern && this.getLineWidth() <= this.getRadius()) {
            bitmask |= Renderer.bitmaskDOM;
        }
        return bitmask;
    }
    /**
   * Determines the allowed renderers that are allowed (or excluded) based on the current Path. (scenery-internal)
   */ getPathRendererBitmask() {
        // If we can use CSS borderRadius, we can support the DOM renderer.
        return Renderer.bitmaskCanvas | Renderer.bitmaskSVG | (Features.borderRadius ? Renderer.bitmaskDOM : 0);
    }
    /**
   * Notifies that the circle has changed (probably the radius), and invalidates path information and our cached
   * shape.
   */ invalidateCircle() {
        assert && assert(this._radius >= 0, 'A circle needs a non-negative radius');
        // sets our 'cache' to null, so we don't always have to recompute our shape
        this._shape = null;
        // should invalidate the path and ensure a redraw
        this.invalidatePath();
    }
    /**
   * Returns a Shape that is equivalent to our rendered display. Generally used to lazily create a Shape instance
   * when one is needed, without having to do so beforehand.
   */ createCircleShape() {
        return Shape.circle(0, 0, this._radius).makeImmutable();
    }
    /**
   * Returns whether this Circle's selfBounds is intersected by the specified bounds.
   *
   * @param bounds - Bounds to test, assumed to be in the local coordinate frame.
   */ intersectsBoundsSelf(bounds) {
        // TODO: handle intersection with somewhat-infinite bounds! https://github.com/phetsims/scenery/issues/1581
        let x = Math.abs(bounds.centerX);
        let y = Math.abs(bounds.centerY);
        const halfWidth = bounds.maxX - x;
        const halfHeight = bounds.maxY - y;
        // too far to have a possible intersection
        if (x > halfWidth + this._radius || y > halfHeight + this._radius) {
            return false;
        }
        // guaranteed intersection
        if (x <= halfWidth || y <= halfHeight) {
            return true;
        }
        // corner case
        x -= halfWidth;
        y -= halfHeight;
        return x * x + y * y <= this._radius * this._radius;
    }
    /**
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */ canvasPaintSelf(wrapper, matrix) {
        //TODO: Have a separate method for this, instead of touching the prototype. Can make 'this' references too easily. https://github.com/phetsims/scenery/issues/1581
        CircleCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
    }
    /**
   * Creates a DOM drawable for this Circle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createDOMDrawable(renderer, instance) {
        // @ts-expect-error TODO: pooling https://github.com/phetsims/scenery/issues/1581
        return CircleDOMDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a SVG drawable for this Circle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createSVGDrawable(renderer, instance) {
        // @ts-expect-error TODO: pooling https://github.com/phetsims/scenery/issues/1581
        return CircleSVGDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a Canvas drawable for this Circle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createCanvasDrawable(renderer, instance) {
        // @ts-expect-error TODO: pooling https://github.com/phetsims/scenery/issues/1581
        return CircleCanvasDrawable.createFromPool(renderer, instance);
    }
    /**
   * Sets the radius of the circle.
   */ setRadius(radius) {
        assert && assert(radius >= 0, 'A circle needs a non-negative radius');
        assert && assert(isFinite(radius), 'A circle needs a finite radius');
        if (this._radius !== radius) {
            this._radius = radius;
            this.invalidateCircle();
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyRadius();
            }
        }
        return this;
    }
    set radius(value) {
        this.setRadius(value);
    }
    get radius() {
        return this.getRadius();
    }
    /**
   * Returns the radius of the circle.
   */ getRadius() {
        return this._radius;
    }
    /**
   * Computes the bounds of the Circle, including any applied stroke. Overridden for efficiency.
   */ computeShapeBounds() {
        let bounds = new Bounds2(-this._radius, -this._radius, this._radius, this._radius);
        if (this._stroke) {
            // since we are axis-aligned, any stroke will expand our bounds by a guaranteed set amount
            bounds = bounds.dilated(this.getLineWidth() / 2);
        }
        return bounds;
    }
    /**
   * Computes whether the provided point is "inside" (contained) in this Circle's self content, or "outside".
   *
   * Exists to optimize hit detection, as it's quick to compute for circles.
   *
   * @param point - Considered to be in the local coordinate frame
   */ containsPointSelf(point) {
        const magSq = point.x * point.x + point.y * point.y;
        let result = true;
        let iRadius;
        if (this._strokePickable) {
            iRadius = this.getLineWidth() / 2;
            const outerRadius = this._radius + iRadius;
            result = result && magSq <= outerRadius * outerRadius;
        }
        if (this._fillPickable) {
            if (this._strokePickable) {
                // we were either within the outer radius, or not
                return result;
            } else {
                // just testing in the fill range
                return magSq <= this._radius * this._radius;
            }
        } else if (this._strokePickable) {
            const innerRadius = this._radius - iRadius;
            return result && magSq >= innerRadius * innerRadius;
        } else {
            return false; // neither stroke nor fill is pickable
        }
    }
    /**
   * It is impossible to set another shape on this Path subtype, as its effective shape is determined by other
   * parameters.
   *
   * @param shape - Throws an error if it is not null.
   */ setShape(shape) {
        if (shape !== null) {
            throw new Error('Cannot set the shape of a Circle to something non-null');
        } else {
            // probably called from the Path constructor
            this.invalidatePath();
        }
        return this;
    }
    /**
   * Returns an immutable copy of this Path subtype's representation.
   *
   * NOTE: This is created lazily, so don't call it if you don't have to!
   */ getShape() {
        if (!this._shape) {
            this._shape = this.createCircleShape();
        }
        return this._shape;
    }
    /**
   * Returns whether this Path has an associated Shape (instead of no shape, represented by null)
   */ hasShape() {
        // Always true for this Path subtype
        return true;
    }
    setShapeProperty(newTarget) {
        if (newTarget !== null) {
            throw new Error('Cannot set the shapeProperty of a Circle to something non-null, it handles this itself');
        }
        return this;
    }
    mutate(options) {
        return super.mutate(options);
    }
    constructor(radius, options){
        super(null);
        this._radius = 0;
        // Handle new Circle( { radius: ... } )
        if (typeof radius === 'object') {
            options = radius;
            assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
        } else {
            assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
            options = extendDefined({
                radius: radius
            }, options);
        }
        this.mutate(options);
    }
};
export { Circle as default };
/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ Circle.prototype._mutatorKeys = CIRCLE_OPTION_KEYS.concat(Path.prototype._mutatorKeys);
/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */ Circle.prototype.drawableMarkFlags = Path.prototype.drawableMarkFlags.concat([
    'radius'
]).filter((flag)=>flag !== 'shape');
scenery.register('Circle', Circle);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvQ2lyY2xlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgY2lyY3VsYXIgbm9kZSB0aGF0IGluaGVyaXRzIFBhdGgsIGFuZCBhbGxvd3MgZm9yIG9wdGltaXplZCBkcmF3aW5nIGFuZCBpbXByb3ZlZCBwYXJhbWV0ZXIgaGFuZGxpbmcuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBleHRlbmREZWZpbmVkIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9leHRlbmREZWZpbmVkLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IENhbnZhc0NvbnRleHRXcmFwcGVyLCBDYW52YXNTZWxmRHJhd2FibGUsIENpcmNsZUNhbnZhc0RyYXdhYmxlLCBDaXJjbGVET01EcmF3YWJsZSwgQ2lyY2xlU1ZHRHJhd2FibGUsIERPTVNlbGZEcmF3YWJsZSwgRmVhdHVyZXMsIEluc3RhbmNlLCBQYXRoLCBQYXRoT3B0aW9ucywgUmVuZGVyZXIsIHNjZW5lcnksIFNWR1NlbGZEcmF3YWJsZSwgVENpcmNsZURyYXdhYmxlLCBWb2ljaW5nT3B0aW9ucyB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBDSVJDTEVfT1BUSU9OX0tFWVMgPSBbXG4gICdyYWRpdXMnIC8vIHtudW1iZXJ9IC0gc2VlIHNldFJhZGl1cygpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbl07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIHJhZGl1cz86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIENpcmNsZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFZvaWNpbmdPcHRpb25zICYgU3RyaWN0T21pdDxQYXRoT3B0aW9ucywgJ3NoYXBlJyB8ICdzaGFwZVByb3BlcnR5Jz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmNsZSBleHRlbmRzIFBhdGgge1xuXG4gIC8vIFRoZSByYWRpdXMgb2YgdGhlIGNpcmNsZVxuICBwcml2YXRlIF9yYWRpdXM6IG51bWJlcjtcblxuICAvKipcbiAgICogTk9URTogVGhlcmUgYXJlIHR3byB3YXlzIG9mIGludm9raW5nIHRoZSBjb25zdHJ1Y3RvcjpcbiAgICogLSBuZXcgQ2lyY2xlKCByYWRpdXMsIHsgLi4uIH0gKVxuICAgKiAtIG5ldyBDaXJjbGUoIHsgcmFkaXVzOiByYWRpdXMsIC4uLiB9IClcbiAgICpcbiAgICogVGhpcyBhbGxvd3MgdGhlIHJhZGl1cyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgcGFyYW1ldGVyIG9iamVjdCBmb3Igd2hlbiB0aGF0IGlzIGNvbnZlbmllbnQuXG4gICAqXG4gICAqIEBwYXJhbSByYWRpdXMgLSBUaGUgKG5vbi1uZWdhdGl2ZSkgcmFkaXVzIG9mIHRoZSBjaXJjbGVcbiAgICogQHBhcmFtICBbb3B0aW9uc10gLSBDaXJjbGUtc3BlY2lmaWMgb3B0aW9ucyBhcmUgZG9jdW1lbnRlZCBpbiBDSVJDTEVfT1BUSU9OX0tFWVMgYWJvdmUsIGFuZCBjYW4gYmUgcHJvdmlkZWRcbiAgICogICAgICAgICAgICAgICAgICAgICBhbG9uZy1zaWRlIG9wdGlvbnMgZm9yIE5vZGVcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IENpcmNsZU9wdGlvbnMgKTtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCByYWRpdXM6IG51bWJlciwgb3B0aW9ucz86IENpcmNsZU9wdGlvbnMgKTtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCByYWRpdXM/OiBudW1iZXIgfCBDaXJjbGVPcHRpb25zLCBvcHRpb25zPzogQ2lyY2xlT3B0aW9ucyApIHtcbiAgICBzdXBlciggbnVsbCApO1xuXG4gICAgdGhpcy5fcmFkaXVzID0gMDtcblxuICAgIC8vIEhhbmRsZSBuZXcgQ2lyY2xlKCB7IHJhZGl1czogLi4uIH0gKVxuICAgIGlmICggdHlwZW9mIHJhZGl1cyA9PT0gJ29iamVjdCcgKSB7XG4gICAgICBvcHRpb25zID0gcmFkaXVzO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZiggb3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIE5vZGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xuICAgIH1cbiAgICAvLyBIYW5kbGUgbmV3IENpcmNsZSggcmFkaXVzLCB7IC4uLiB9IClcbiAgICBlbHNlIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBOb2RlIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCcgKTtcbiAgICAgIG9wdGlvbnMgPSBleHRlbmREZWZpbmVkKCB7XG4gICAgICAgIHJhZGl1czogcmFkaXVzXG4gICAgICB9LCBvcHRpb25zICk7XG4gICAgfVxuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgdGhlIGRlZmF1bHQgYWxsb3dlZCByZW5kZXJlcnMgKHJldHVybmVkIHZpYSB0aGUgUmVuZGVyZXIgYml0bWFzaykgdGhhdCBhcmUgYWxsb3dlZCwgZ2l2ZW4gdGhlXG4gICAqIGN1cnJlbnQgc3Ryb2tlIG9wdGlvbnMuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBXZSBjYW4gc3VwcG9ydCB0aGUgRE9NIHJlbmRlcmVyIGlmIHRoZXJlIGlzIGEgc29saWQtc3R5bGVkIHN0cm9rZSAod2hpY2ggb3RoZXJ3aXNlIHdvdWxkbid0IGJlIHN1cHBvcnRlZCkuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0U3Ryb2tlUmVuZGVyZXJCaXRtYXNrKCk6IG51bWJlciB7XG4gICAgbGV0IGJpdG1hc2sgPSBzdXBlci5nZXRTdHJva2VSZW5kZXJlckJpdG1hc2soKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gaXNHcmFkaWVudC9pc1BhdHRlcm4gYmV0dGVyIGhhbmRsaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgaWYgKCB0aGlzLmhhc1N0cm9rZSgpICYmICF0aGlzLmdldFN0cm9rZSgpIS5pc0dyYWRpZW50ICYmICF0aGlzLmdldFN0cm9rZSgpIS5pc1BhdHRlcm4gJiYgdGhpcy5nZXRMaW5lV2lkdGgoKSA8PSB0aGlzLmdldFJhZGl1cygpICkge1xuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrRE9NO1xuICAgIH1cbiAgICByZXR1cm4gYml0bWFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHRoZSBhbGxvd2VkIHJlbmRlcmVycyB0aGF0IGFyZSBhbGxvd2VkIChvciBleGNsdWRlZCkgYmFzZWQgb24gdGhlIGN1cnJlbnQgUGF0aC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0UGF0aFJlbmRlcmVyQml0bWFzaygpOiBudW1iZXIge1xuICAgIC8vIElmIHdlIGNhbiB1c2UgQ1NTIGJvcmRlclJhZGl1cywgd2UgY2FuIHN1cHBvcnQgdGhlIERPTSByZW5kZXJlci5cbiAgICByZXR1cm4gUmVuZGVyZXIuYml0bWFza0NhbnZhcyB8IFJlbmRlcmVyLmJpdG1hc2tTVkcgfCAoIEZlYXR1cmVzLmJvcmRlclJhZGl1cyA/IFJlbmRlcmVyLmJpdG1hc2tET00gOiAwICk7XG4gIH1cblxuICAvKipcbiAgICogTm90aWZpZXMgdGhhdCB0aGUgY2lyY2xlIGhhcyBjaGFuZ2VkIChwcm9iYWJseSB0aGUgcmFkaXVzKSwgYW5kIGludmFsaWRhdGVzIHBhdGggaW5mb3JtYXRpb24gYW5kIG91ciBjYWNoZWRcbiAgICogc2hhcGUuXG4gICAqL1xuICBwcml2YXRlIGludmFsaWRhdGVDaXJjbGUoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcmFkaXVzID49IDAsICdBIGNpcmNsZSBuZWVkcyBhIG5vbi1uZWdhdGl2ZSByYWRpdXMnICk7XG5cbiAgICAvLyBzZXRzIG91ciAnY2FjaGUnIHRvIG51bGwsIHNvIHdlIGRvbid0IGFsd2F5cyBoYXZlIHRvIHJlY29tcHV0ZSBvdXIgc2hhcGVcbiAgICB0aGlzLl9zaGFwZSA9IG51bGw7XG5cbiAgICAvLyBzaG91bGQgaW52YWxpZGF0ZSB0aGUgcGF0aCBhbmQgZW5zdXJlIGEgcmVkcmF3XG4gICAgdGhpcy5pbnZhbGlkYXRlUGF0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBTaGFwZSB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gb3VyIHJlbmRlcmVkIGRpc3BsYXkuIEdlbmVyYWxseSB1c2VkIHRvIGxhemlseSBjcmVhdGUgYSBTaGFwZSBpbnN0YW5jZVxuICAgKiB3aGVuIG9uZSBpcyBuZWVkZWQsIHdpdGhvdXQgaGF2aW5nIHRvIGRvIHNvIGJlZm9yZWhhbmQuXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUNpcmNsZVNoYXBlKCk6IFNoYXBlIHtcbiAgICByZXR1cm4gU2hhcGUuY2lyY2xlKCAwLCAwLCB0aGlzLl9yYWRpdXMgKS5tYWtlSW1tdXRhYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgQ2lyY2xlJ3Mgc2VsZkJvdW5kcyBpcyBpbnRlcnNlY3RlZCBieSB0aGUgc3BlY2lmaWVkIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIGJvdW5kcyAtIEJvdW5kcyB0byB0ZXN0LCBhc3N1bWVkIHRvIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGludGVyc2VjdHNCb3VuZHNTZWxmKCBib3VuZHM6IEJvdW5kczIgKTogYm9vbGVhbiB7XG4gICAgLy8gVE9ETzogaGFuZGxlIGludGVyc2VjdGlvbiB3aXRoIHNvbWV3aGF0LWluZmluaXRlIGJvdW5kcyEgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBsZXQgeCA9IE1hdGguYWJzKCBib3VuZHMuY2VudGVyWCApO1xuICAgIGxldCB5ID0gTWF0aC5hYnMoIGJvdW5kcy5jZW50ZXJZICk7XG4gICAgY29uc3QgaGFsZldpZHRoID0gYm91bmRzLm1heFggLSB4O1xuICAgIGNvbnN0IGhhbGZIZWlnaHQgPSBib3VuZHMubWF4WSAtIHk7XG5cbiAgICAvLyB0b28gZmFyIHRvIGhhdmUgYSBwb3NzaWJsZSBpbnRlcnNlY3Rpb25cbiAgICBpZiAoIHggPiBoYWxmV2lkdGggKyB0aGlzLl9yYWRpdXMgfHwgeSA+IGhhbGZIZWlnaHQgKyB0aGlzLl9yYWRpdXMgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gZ3VhcmFudGVlZCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoIHggPD0gaGFsZldpZHRoIHx8IHkgPD0gaGFsZkhlaWdodCApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGNvcm5lciBjYXNlXG4gICAgeCAtPSBoYWxmV2lkdGg7XG4gICAgeSAtPSBoYWxmSGVpZ2h0O1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5IDw9IHRoaXMuX3JhZGl1cyAqIHRoaXMuX3JhZGl1cztcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyB0aGUgY3VycmVudCBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbiwgYXNzdW1pbmcgdGhlIHdyYXBwZXIncyBDYW52YXMgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBsb2NhbFxuICAgKiBjb29yZGluYXRlIGZyYW1lIG9mIHRoaXMgbm9kZS5cbiAgICpcbiAgICogQHBhcmFtIHdyYXBwZXJcbiAgICogQHBhcmFtIG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYWxyZWFkeSBhcHBsaWVkIHRvIHRoZSBjb250ZXh0LlxuICAgKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNhbnZhc1BhaW50U2VsZiggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcbiAgICAvL1RPRE86IEhhdmUgYSBzZXBhcmF0ZSBtZXRob2QgZm9yIHRoaXMsIGluc3RlYWQgb2YgdG91Y2hpbmcgdGhlIHByb3RvdHlwZS4gQ2FuIG1ha2UgJ3RoaXMnIHJlZmVyZW5jZXMgdG9vIGVhc2lseS4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBDaXJjbGVDYW52YXNEcmF3YWJsZS5wcm90b3R5cGUucGFpbnRDYW52YXMoIHdyYXBwZXIsIHRoaXMsIG1hdHJpeCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBET00gZHJhd2FibGUgZm9yIHRoaXMgQ2lyY2xlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZURPTURyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogRE9NU2VsZkRyYXdhYmxlIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IHBvb2xpbmcgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICByZXR1cm4gQ2lyY2xlRE9NRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBTVkcgZHJhd2FibGUgZm9yIHRoaXMgQ2lyY2xlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVNWR0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogU1ZHU2VsZkRyYXdhYmxlIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IHBvb2xpbmcgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICByZXR1cm4gQ2lyY2xlU1ZHRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBDYW52YXMgZHJhd2FibGUgZm9yIHRoaXMgQ2lyY2xlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZUNhbnZhc0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogQ2FudmFzU2VsZkRyYXdhYmxlIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IHBvb2xpbmcgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICByZXR1cm4gQ2lyY2xlQ2FudmFzRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHJhZGl1cyBvZiB0aGUgY2lyY2xlLlxuICAgKi9cbiAgcHVibGljIHNldFJhZGl1cyggcmFkaXVzOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmFkaXVzID49IDAsICdBIGNpcmNsZSBuZWVkcyBhIG5vbi1uZWdhdGl2ZSByYWRpdXMnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHJhZGl1cyApLCAnQSBjaXJjbGUgbmVlZHMgYSBmaW5pdGUgcmFkaXVzJyApO1xuXG4gICAgaWYgKCB0aGlzLl9yYWRpdXMgIT09IHJhZGl1cyApIHtcbiAgICAgIHRoaXMuX3JhZGl1cyA9IHJhZGl1cztcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUNpcmNsZSgpO1xuXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVENpcmNsZURyYXdhYmxlICkubWFya0RpcnR5UmFkaXVzKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCByYWRpdXMoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0UmFkaXVzKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCByYWRpdXMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0UmFkaXVzKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmFkaXVzIG9mIHRoZSBjaXJjbGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0UmFkaXVzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3JhZGl1cztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgYm91bmRzIG9mIHRoZSBDaXJjbGUsIGluY2x1ZGluZyBhbnkgYXBwbGllZCBzdHJva2UuIE92ZXJyaWRkZW4gZm9yIGVmZmljaWVuY3kuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY29tcHV0ZVNoYXBlQm91bmRzKCk6IEJvdW5kczIge1xuICAgIGxldCBib3VuZHMgPSBuZXcgQm91bmRzMiggLXRoaXMuX3JhZGl1cywgLXRoaXMuX3JhZGl1cywgdGhpcy5fcmFkaXVzLCB0aGlzLl9yYWRpdXMgKTtcbiAgICBpZiAoIHRoaXMuX3N0cm9rZSApIHtcbiAgICAgIC8vIHNpbmNlIHdlIGFyZSBheGlzLWFsaWduZWQsIGFueSBzdHJva2Ugd2lsbCBleHBhbmQgb3VyIGJvdW5kcyBieSBhIGd1YXJhbnRlZWQgc2V0IGFtb3VudFxuICAgICAgYm91bmRzID0gYm91bmRzLmRpbGF0ZWQoIHRoaXMuZ2V0TGluZVdpZHRoKCkgLyAyICk7XG4gICAgfVxuICAgIHJldHVybiBib3VuZHM7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgd2hldGhlciB0aGUgcHJvdmlkZWQgcG9pbnQgaXMgXCJpbnNpZGVcIiAoY29udGFpbmVkKSBpbiB0aGlzIENpcmNsZSdzIHNlbGYgY29udGVudCwgb3IgXCJvdXRzaWRlXCIuXG4gICAqXG4gICAqIEV4aXN0cyB0byBvcHRpbWl6ZSBoaXQgZGV0ZWN0aW9uLCBhcyBpdCdzIHF1aWNrIHRvIGNvbXB1dGUgZm9yIGNpcmNsZXMuXG4gICAqXG4gICAqIEBwYXJhbSBwb2ludCAtIENvbnNpZGVyZWQgdG8gYmUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjb250YWluc1BvaW50U2VsZiggcG9pbnQ6IFZlY3RvcjIgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbWFnU3EgPSBwb2ludC54ICogcG9pbnQueCArIHBvaW50LnkgKiBwb2ludC55O1xuICAgIGxldCByZXN1bHQgPSB0cnVlO1xuICAgIGxldCBpUmFkaXVzOiBudW1iZXI7XG4gICAgaWYgKCB0aGlzLl9zdHJva2VQaWNrYWJsZSApIHtcbiAgICAgIGlSYWRpdXMgPSB0aGlzLmdldExpbmVXaWR0aCgpIC8gMjtcbiAgICAgIGNvbnN0IG91dGVyUmFkaXVzID0gdGhpcy5fcmFkaXVzICsgaVJhZGl1cztcbiAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiBtYWdTcSA8PSBvdXRlclJhZGl1cyAqIG91dGVyUmFkaXVzO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5fZmlsbFBpY2thYmxlICkge1xuICAgICAgaWYgKCB0aGlzLl9zdHJva2VQaWNrYWJsZSApIHtcbiAgICAgICAgLy8gd2Ugd2VyZSBlaXRoZXIgd2l0aGluIHRoZSBvdXRlciByYWRpdXMsIG9yIG5vdFxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIGp1c3QgdGVzdGluZyBpbiB0aGUgZmlsbCByYW5nZVxuICAgICAgICByZXR1cm4gbWFnU3EgPD0gdGhpcy5fcmFkaXVzICogdGhpcy5fcmFkaXVzO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fc3Ryb2tlUGlja2FibGUgKSB7XG4gICAgICBjb25zdCBpbm5lclJhZGl1cyA9IHRoaXMuX3JhZGl1cyAtICggaVJhZGl1cyEgKTtcbiAgICAgIHJldHVybiByZXN1bHQgJiYgbWFnU3EgPj0gaW5uZXJSYWRpdXMgKiBpbm5lclJhZGl1cztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIG5laXRoZXIgc3Ryb2tlIG5vciBmaWxsIGlzIHBpY2thYmxlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEl0IGlzIGltcG9zc2libGUgdG8gc2V0IGFub3RoZXIgc2hhcGUgb24gdGhpcyBQYXRoIHN1YnR5cGUsIGFzIGl0cyBlZmZlY3RpdmUgc2hhcGUgaXMgZGV0ZXJtaW5lZCBieSBvdGhlclxuICAgKiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gc2hhcGUgLSBUaHJvd3MgYW4gZXJyb3IgaWYgaXQgaXMgbm90IG51bGwuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgc2V0U2hhcGUoIHNoYXBlOiBTaGFwZSB8IG51bGwgKTogdGhpcyB7XG4gICAgaWYgKCBzaGFwZSAhPT0gbnVsbCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBzZXQgdGhlIHNoYXBlIG9mIGEgQ2lyY2xlIHRvIHNvbWV0aGluZyBub24tbnVsbCcgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBwcm9iYWJseSBjYWxsZWQgZnJvbSB0aGUgUGF0aCBjb25zdHJ1Y3RvclxuICAgICAgdGhpcy5pbnZhbGlkYXRlUGF0aCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaW1tdXRhYmxlIGNvcHkgb2YgdGhpcyBQYXRoIHN1YnR5cGUncyByZXByZXNlbnRhdGlvbi5cbiAgICpcbiAgICogTk9URTogVGhpcyBpcyBjcmVhdGVkIGxhemlseSwgc28gZG9uJ3QgY2FsbCBpdCBpZiB5b3UgZG9uJ3QgaGF2ZSB0byFcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRTaGFwZSgpOiBTaGFwZSB7XG4gICAgaWYgKCAhdGhpcy5fc2hhcGUgKSB7XG4gICAgICB0aGlzLl9zaGFwZSA9IHRoaXMuY3JlYXRlQ2lyY2xlU2hhcGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3NoYXBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIFBhdGggaGFzIGFuIGFzc29jaWF0ZWQgU2hhcGUgKGluc3RlYWQgb2Ygbm8gc2hhcGUsIHJlcHJlc2VudGVkIGJ5IG51bGwpXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgaGFzU2hhcGUoKTogYm9vbGVhbiB7XG4gICAgLy8gQWx3YXlzIHRydWUgZm9yIHRoaXMgUGF0aCBzdWJ0eXBlXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgc2V0U2hhcGVQcm9wZXJ0eSggbmV3VGFyZ2V0OiBUUmVhZE9ubHlQcm9wZXJ0eTxTaGFwZSB8IHN0cmluZyB8IG51bGw+IHwgbnVsbCApOiB0aGlzIHtcbiAgICBpZiAoIG5ld1RhcmdldCAhPT0gbnVsbCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBzZXQgdGhlIHNoYXBlUHJvcGVydHkgb2YgYSBDaXJjbGUgdG8gc29tZXRoaW5nIG5vbi1udWxsLCBpdCBoYW5kbGVzIHRoaXMgaXRzZWxmJyApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIG11dGF0ZSggb3B0aW9ucz86IENpcmNsZU9wdGlvbnMgKTogdGhpcyB7XG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cbn1cblxuLyoqXG4gKiB7QXJyYXkuPHN0cmluZz59IC0gU3RyaW5nIGtleXMgZm9yIGFsbCBvZiB0aGUgYWxsb3dlZCBvcHRpb25zIHRoYXQgd2lsbCBiZSBzZXQgYnkgbm9kZS5tdXRhdGUoIG9wdGlvbnMgKSwgaW4gdGhlXG4gKiBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkIGluLlxuICpcbiAqIE5PVEU6IFNlZSBOb2RlJ3MgX211dGF0b3JLZXlzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgb3BlcmF0ZXMsIGFuZCBwb3RlbnRpYWwgc3BlY2lhbFxuICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXG4gKi9cbkNpcmNsZS5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gQ0lSQ0xFX09QVElPTl9LRVlTLmNvbmNhdCggUGF0aC5wcm90b3R5cGUuX211dGF0b3JLZXlzICk7XG5cbi8qKlxuICoge0FycmF5LjxTdHJpbmc+fSAtIExpc3Qgb2YgYWxsIGRpcnR5IGZsYWdzIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSBvbiBkcmF3YWJsZXMgY3JlYXRlZCBmcm9tIHRoaXMgbm9kZSAob3JcbiAqICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlKS4gR2l2ZW4gYSBmbGFnIChlLmcuIHJhZGl1cyksIGl0IGluZGljYXRlcyB0aGUgZXhpc3RlbmNlIG9mIGEgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICBkcmF3YWJsZS5tYXJrRGlydHlSYWRpdXMoKSB0aGF0IHdpbGwgaW5kaWNhdGUgdG8gdGhlIGRyYXdhYmxlIHRoYXQgdGhlIHJhZGl1cyBoYXMgY2hhbmdlZC5cbiAqIChzY2VuZXJ5LWludGVybmFsKVxuICogQG92ZXJyaWRlXG4gKi9cbkNpcmNsZS5wcm90b3R5cGUuZHJhd2FibGVNYXJrRmxhZ3MgPSBQYXRoLnByb3RvdHlwZS5kcmF3YWJsZU1hcmtGbGFncy5jb25jYXQoIFsgJ3JhZGl1cycgXSApLmZpbHRlciggZmxhZyA9PiBmbGFnICE9PSAnc2hhcGUnICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdDaXJjbGUnLCBDaXJjbGUgKTsiXSwibmFtZXMiOlsiQm91bmRzMiIsIlNoYXBlIiwiZXh0ZW5kRGVmaW5lZCIsIkNpcmNsZUNhbnZhc0RyYXdhYmxlIiwiQ2lyY2xlRE9NRHJhd2FibGUiLCJDaXJjbGVTVkdEcmF3YWJsZSIsIkZlYXR1cmVzIiwiUGF0aCIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIkNJUkNMRV9PUFRJT05fS0VZUyIsIkNpcmNsZSIsImdldFN0cm9rZVJlbmRlcmVyQml0bWFzayIsImJpdG1hc2siLCJoYXNTdHJva2UiLCJnZXRTdHJva2UiLCJpc0dyYWRpZW50IiwiaXNQYXR0ZXJuIiwiZ2V0TGluZVdpZHRoIiwiZ2V0UmFkaXVzIiwiYml0bWFza0RPTSIsImdldFBhdGhSZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrQ2FudmFzIiwiYml0bWFza1NWRyIsImJvcmRlclJhZGl1cyIsImludmFsaWRhdGVDaXJjbGUiLCJhc3NlcnQiLCJfcmFkaXVzIiwiX3NoYXBlIiwiaW52YWxpZGF0ZVBhdGgiLCJjcmVhdGVDaXJjbGVTaGFwZSIsImNpcmNsZSIsIm1ha2VJbW11dGFibGUiLCJpbnRlcnNlY3RzQm91bmRzU2VsZiIsImJvdW5kcyIsIngiLCJNYXRoIiwiYWJzIiwiY2VudGVyWCIsInkiLCJjZW50ZXJZIiwiaGFsZldpZHRoIiwibWF4WCIsImhhbGZIZWlnaHQiLCJtYXhZIiwiY2FudmFzUGFpbnRTZWxmIiwid3JhcHBlciIsIm1hdHJpeCIsInByb3RvdHlwZSIsInBhaW50Q2FudmFzIiwiY3JlYXRlRE9NRHJhd2FibGUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiY3JlYXRlRnJvbVBvb2wiLCJjcmVhdGVTVkdEcmF3YWJsZSIsImNyZWF0ZUNhbnZhc0RyYXdhYmxlIiwic2V0UmFkaXVzIiwicmFkaXVzIiwiaXNGaW5pdGUiLCJzdGF0ZUxlbiIsIl9kcmF3YWJsZXMiLCJsZW5ndGgiLCJpIiwibWFya0RpcnR5UmFkaXVzIiwidmFsdWUiLCJjb21wdXRlU2hhcGVCb3VuZHMiLCJfc3Ryb2tlIiwiZGlsYXRlZCIsImNvbnRhaW5zUG9pbnRTZWxmIiwicG9pbnQiLCJtYWdTcSIsInJlc3VsdCIsImlSYWRpdXMiLCJfc3Ryb2tlUGlja2FibGUiLCJvdXRlclJhZGl1cyIsIl9maWxsUGlja2FibGUiLCJpbm5lclJhZGl1cyIsInNldFNoYXBlIiwic2hhcGUiLCJFcnJvciIsImdldFNoYXBlIiwiaGFzU2hhcGUiLCJzZXRTaGFwZVByb3BlcnR5IiwibmV3VGFyZ2V0IiwibXV0YXRlIiwib3B0aW9ucyIsInVuZGVmaW5lZCIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwiX211dGF0b3JLZXlzIiwiY29uY2F0IiwiZHJhd2FibGVNYXJrRmxhZ3MiLCJmaWx0ZXIiLCJmbGFnIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBR0QsT0FBT0EsYUFBYSw2QkFBNkI7QUFHakQsU0FBU0MsS0FBSyxRQUFRLDhCQUE4QjtBQUNwRCxPQUFPQyxtQkFBbUIseUNBQXlDO0FBRW5FLFNBQW1EQyxvQkFBb0IsRUFBRUMsaUJBQWlCLEVBQUVDLGlCQUFpQixFQUFtQkMsUUFBUSxFQUFZQyxJQUFJLEVBQWVDLFFBQVEsRUFBRUMsT0FBTyxRQUEwRCxnQkFBZ0I7QUFFbFEsTUFBTUMscUJBQXFCO0lBQ3pCLFNBQVMsb0RBQW9EO0NBQzlEO0FBUWMsSUFBQSxBQUFNQyxTQUFOLE1BQU1BLGVBQWVKO0lBMENsQzs7Ozs7R0FLQyxHQUNELEFBQWdCSywyQkFBbUM7UUFDakQsSUFBSUMsVUFBVSxLQUFLLENBQUNEO1FBQ3BCLDZHQUE2RztRQUM3RyxJQUFLLElBQUksQ0FBQ0UsU0FBUyxNQUFNLENBQUMsSUFBSSxDQUFDQyxTQUFTLEdBQUlDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQ0QsU0FBUyxHQUFJRSxTQUFTLElBQUksSUFB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