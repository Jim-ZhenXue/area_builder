// Copyright 2013-2024, University of Colorado Boulder
/**
 * Displays a (stroked) line. Inherits Path, and allows for optimized drawing and improved parameter handling.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import extendDefined from '../../../phet-core/js/extendDefined.js';
import { LineCanvasDrawable, LineSVGDrawable, Path, Renderer, scenery } from '../imports.js';
const LINE_OPTION_KEYS = [
    'p1',
    'p2',
    'x1',
    'y1',
    'x2',
    'y2' // {number} - End y position
];
let Line = class Line extends Path {
    /**
   * Set all of the line's x and y values.
   *
   * @param x1 - the start x coordinate
   * @param y1 - the start y coordinate
   * @param x2 - the end x coordinate
   * @param y2 - the end y coordinate
   */ setLine(x1, y1, x2, y2) {
        assert && assert(x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined, 'parameters need to be defined');
        this._x1 = x1;
        this._y1 = y1;
        this._x2 = x2;
        this._y2 = y2;
        const stateLen = this._drawables.length;
        for(let i = 0; i < stateLen; i++){
            const state = this._drawables[i];
            state.markDirtyLine();
        }
        this.invalidateLine();
        return this;
    }
    setPoint1(x1, y1) {
        if (typeof x1 === 'number') {
            // setPoint1( x1, y1 );
            assert && assert(x1 !== undefined && y1 !== undefined, 'parameters need to be defined');
            this._x1 = x1;
            this._y1 = y1;
        } else {
            // setPoint1( Vector2 )
            assert && assert(x1.x !== undefined && x1.y !== undefined, 'parameters need to be defined');
            this._x1 = x1.x;
            this._y1 = x1.y;
        }
        const numDrawables = this._drawables.length;
        for(let i = 0; i < numDrawables; i++){
            this._drawables[i].markDirtyP1();
        }
        this.invalidateLine();
        return this;
    }
    set p1(point) {
        this.setPoint1(point);
    }
    get p1() {
        return new Vector2(this._x1, this._y1);
    }
    setPoint2(x2, y2) {
        if (typeof x2 === 'number') {
            // setPoint2( x2, y2 );
            assert && assert(x2 !== undefined && y2 !== undefined, 'parameters need to be defined');
            this._x2 = x2;
            this._y2 = y2;
        } else {
            // setPoint2( Vector2 )
            assert && assert(x2.x !== undefined && x2.y !== undefined, 'parameters need to be defined');
            this._x2 = x2.x;
            this._y2 = x2.y;
        }
        const numDrawables = this._drawables.length;
        for(let i = 0; i < numDrawables; i++){
            this._drawables[i].markDirtyP2();
        }
        this.invalidateLine();
        return this;
    }
    set p2(point) {
        this.setPoint2(point);
    }
    get p2() {
        return new Vector2(this._x2, this._y2);
    }
    /**
   * Sets the x coordinate of the first point of the line.
   */ setX1(x1) {
        if (this._x1 !== x1) {
            this._x1 = x1;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyX1();
            }
            this.invalidateLine();
        }
        return this;
    }
    set x1(value) {
        this.setX1(value);
    }
    get x1() {
        return this.getX1();
    }
    /**
   * Returns the x coordinate of the first point of the line.
   */ getX1() {
        return this._x1;
    }
    /**
   * Sets the y coordinate of the first point of the line.
   */ setY1(y1) {
        if (this._y1 !== y1) {
            this._y1 = y1;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyY1();
            }
            this.invalidateLine();
        }
        return this;
    }
    set y1(value) {
        this.setY1(value);
    }
    get y1() {
        return this.getY1();
    }
    /**
   * Returns the y coordinate of the first point of the line.
   */ getY1() {
        return this._y1;
    }
    /**
   * Sets the x coordinate of the second point of the line.
   */ setX2(x2) {
        if (this._x2 !== x2) {
            this._x2 = x2;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyX2();
            }
            this.invalidateLine();
        }
        return this;
    }
    set x2(value) {
        this.setX2(value);
    }
    get x2() {
        return this.getX2();
    }
    /**
   * Returns the x coordinate of the second point of the line.
   */ getX2() {
        return this._x2;
    }
    /**
   * Sets the y coordinate of the second point of the line.
   */ setY2(y2) {
        if (this._y2 !== y2) {
            this._y2 = y2;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyY2();
            }
            this.invalidateLine();
        }
        return this;
    }
    set y2(value) {
        this.setY2(value);
    }
    get y2() {
        return this.getY2();
    }
    /**
   * Returns the y coordinate of the second point of the line.
   */ getY2() {
        return this._y2;
    }
    /**
   * Returns a Shape that is equivalent to our rendered display. Generally used to lazily create a Shape instance
   * when one is needed, without having to do so beforehand.
   */ createLineShape() {
        return Shape.lineSegment(this._x1, this._y1, this._x2, this._y2).makeImmutable();
    }
    /**
   * Notifies that the line has changed and invalidates path information and our cached shape.
   */ invalidateLine() {
        assert && assert(isFinite(this._x1), `A line needs to have a finite x1 (${this._x1})`);
        assert && assert(isFinite(this._y1), `A line needs to have a finite y1 (${this._y1})`);
        assert && assert(isFinite(this._x2), `A line needs to have a finite x2 (${this._x2})`);
        assert && assert(isFinite(this._y2), `A line needs to have a finite y2 (${this._y2})`);
        // sets our 'cache' to null, so we don't always have to recompute our shape
        this._shape = null;
        // should invalidate the path and ensure a redraw
        this.invalidatePath();
    }
    /**
   * Computes whether the provided point is "inside" (contained) in this Line's self content, or "outside".
   *
   * Since an unstroked Line contains no area, we can quickly shortcut this operation.
   *
   * @param point - Considered to be in the local coordinate frame
   */ containsPointSelf(point) {
        if (this._strokePickable) {
            return super.containsPointSelf(point);
        } else {
            return false; // nothing is in a line! (although maybe we should handle edge points properly?)
        }
    }
    /**
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */ canvasPaintSelf(wrapper, matrix) {
        //TODO: Have a separate method for this, instead of touching the prototype. Can make 'this' references too easily. https://github.com/phetsims/scenery/issues/1581
        LineCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
    }
    /**
   * Computes the bounds of the Line, including any applied stroke. Overridden for efficiency.
   */ computeShapeBounds() {
        // optimized form for a single line segment (no joins, just two caps)
        if (this._stroke) {
            const lineCap = this.getLineCap();
            const halfLineWidth = this.getLineWidth() / 2;
            if (lineCap === 'round') {
                // we can simply dilate by half the line width
                return new Bounds2(Math.min(this._x1, this._x2) - halfLineWidth, Math.min(this._y1, this._y2) - halfLineWidth, Math.max(this._x1, this._x2) + halfLineWidth, Math.max(this._y1, this._y2) + halfLineWidth);
            } else {
                // (dx,dy) is a vector p2-p1
                const dx = this._x2 - this._x1;
                const dy = this._y2 - this._y1;
                const magnitude = Math.sqrt(dx * dx + dy * dy);
                if (magnitude === 0) {
                    // if our line is a point, just dilate by halfLineWidth
                    return new Bounds2(this._x1 - halfLineWidth, this._y1 - halfLineWidth, this._x2 + halfLineWidth, this._y2 + halfLineWidth);
                }
                // (sx,sy) is a vector with a magnitude of halfLineWidth pointed in the direction of (dx,dy)
                const sx = halfLineWidth * dx / magnitude;
                const sy = halfLineWidth * dy / magnitude;
                const bounds = Bounds2.NOTHING.copy();
                if (lineCap === 'butt') {
                    // four points just using the perpendicular stroked offsets (sy,-sx) and (-sy,sx)
                    bounds.addCoordinates(this._x1 - sy, this._y1 + sx);
                    bounds.addCoordinates(this._x1 + sy, this._y1 - sx);
                    bounds.addCoordinates(this._x2 - sy, this._y2 + sx);
                    bounds.addCoordinates(this._x2 + sy, this._y2 - sx);
                } else {
                    assert && assert(lineCap === 'square');
                    // four points just using the perpendicular stroked offsets (sy,-sx) and (-sy,sx) and parallel stroked offsets
                    bounds.addCoordinates(this._x1 - sx - sy, this._y1 - sy + sx);
                    bounds.addCoordinates(this._x1 - sx + sy, this._y1 - sy - sx);
                    bounds.addCoordinates(this._x2 + sx - sy, this._y2 + sy + sx);
                    bounds.addCoordinates(this._x2 + sx + sy, this._y2 + sy - sx);
                }
                return bounds;
            }
        } else {
            // It might have a fill? Just include the fill bounds for now.
            const fillBounds = Bounds2.NOTHING.copy();
            fillBounds.addCoordinates(this._x1, this._y1);
            fillBounds.addCoordinates(this._x2, this._y2);
            return fillBounds;
        }
    }
    /**
   * Creates a SVG drawable for this Line.
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createSVGDrawable(renderer, instance) {
        // @ts-expect-error
        return LineSVGDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a Canvas drawable for this Line.
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createCanvasDrawable(renderer, instance) {
        // @ts-expect-error
        return LineCanvasDrawable.createFromPool(renderer, instance);
    }
    /**
   * It is impossible to set another shape on this Path subtype, as its effective shape is determined by other
   * parameters.
   *
   * Throws an error if it is not null.
   */ setShape(shape) {
        if (shape !== null) {
            throw new Error('Cannot set the shape of a Line to something non-null');
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
            this._shape = this.createLineShape();
        }
        return this._shape;
    }
    /**
   * Returns whether this Path has an associated Shape (instead of no shape, represented by null)
   */ hasShape() {
        return true;
    }
    setShapeProperty(newTarget) {
        if (newTarget !== null) {
            throw new Error('Cannot set the shapeProperty of a Line to something non-null, it handles this itself');
        }
        return this;
    }
    mutate(options) {
        return super.mutate(options);
    }
    /**
   * Returns available fill renderers. (scenery-internal)
   *
   * Since our line can't be filled, we support all fill renderers.
   *
   * See Renderer for more information on the bitmasks
   */ getFillRendererBitmask() {
        return Renderer.bitmaskCanvas | Renderer.bitmaskSVG | Renderer.bitmaskDOM | Renderer.bitmaskWebGL;
    }
    constructor(x1, y1, x2, y2, options){
        super(null);
        this._x1 = 0;
        this._y1 = 0;
        this._x2 = 0;
        this._y2 = 0;
        // Remap constructor parameters to options
        if (typeof x1 === 'object') {
            if (x1 instanceof Vector2) {
                // assumes Line( Vector2, Vector2, options ), where x2 is our options
                assert && assert(x2 === undefined || typeof x2 === 'object');
                assert && assert(x2 === undefined || Object.getPrototypeOf(x2) === Object.prototype, 'Extra prototype on Node options object is a code smell');
                options = extendDefined({
                    // First Vector2 is under the x1 name
                    x1: x1.x,
                    y1: x1.y,
                    // Second Vector2 is under the y1 name
                    x2: y1.x,
                    y2: y1.y,
                    strokePickable: true
                }, x2); // Options object (if available) is under the x2 name
            } else {
                // assumes Line( { ... } ), init to zero for now
                assert && assert(y1 === undefined);
                // Options object is under the x1 name
                assert && assert(x1 === undefined || Object.getPrototypeOf(x1) === Object.prototype, 'Extra prototype on Node options object is a code smell');
                options = extendDefined({
                    strokePickable: true
                }, x1); // Options object (if available) is under the x1 name
            }
        } else {
            // new Line( x1, y1, x2, y2, [options] )
            assert && assert(x1 !== undefined && typeof y1 === 'number' && typeof x2 === 'number' && typeof y2 === 'number');
            assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
            options = extendDefined({
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                strokePickable: true
            }, options);
        }
        this.mutate(options);
    }
};
export { Line as default };
/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ Line.prototype._mutatorKeys = LINE_OPTION_KEYS.concat(Path.prototype._mutatorKeys);
/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */ Line.prototype.drawableMarkFlags = Path.prototype.drawableMarkFlags.concat([
    'line',
    'p1',
    'p2',
    'x1',
    'x2',
    'y1',
    'y2'
]).filter((flag)=>flag !== 'shape');
scenery.register('Line', Line);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvTGluZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEaXNwbGF5cyBhIChzdHJva2VkKSBsaW5lLiBJbmhlcml0cyBQYXRoLCBhbmQgYWxsb3dzIGZvciBvcHRpbWl6ZWQgZHJhd2luZyBhbmQgaW1wcm92ZWQgcGFyYW1ldGVyIGhhbmRsaW5nLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgZXh0ZW5kRGVmaW5lZCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZXh0ZW5kRGVmaW5lZC5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBDYW52YXNDb250ZXh0V3JhcHBlciwgQ2FudmFzU2VsZkRyYXdhYmxlLCBJbnN0YW5jZSwgTGluZUNhbnZhc0RyYXdhYmxlLCBMaW5lU1ZHRHJhd2FibGUsIFBhdGgsIFBhdGhPcHRpb25zLCBSZW5kZXJlciwgc2NlbmVyeSwgU1ZHU2VsZkRyYXdhYmxlLCBUTGluZURyYXdhYmxlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IExJTkVfT1BUSU9OX0tFWVMgPSBbXG4gICdwMScsIC8vIHtWZWN0b3IyfSAtIFN0YXJ0IHBvc2l0aW9uXG4gICdwMicsIC8vIHtWZWN0b3IyfSAtIEVuZCBwb3NpdGlvblxuICAneDEnLCAvLyB7bnVtYmVyfSAtIFN0YXJ0IHggcG9zaXRpb25cbiAgJ3kxJywgLy8ge251bWJlcn0gLSBTdGFydCB5IHBvc2l0aW9uXG4gICd4MicsIC8vIHtudW1iZXJ9IC0gRW5kIHggcG9zaXRpb25cbiAgJ3kyJyAvLyB7bnVtYmVyfSAtIEVuZCB5IHBvc2l0aW9uXG5dO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBwMT86IFZlY3RvcjI7XG4gIHAyPzogVmVjdG9yMjtcbiAgeDE/OiBudW1iZXI7XG4gIHkxPzogbnVtYmVyO1xuICB4Mj86IG51bWJlcjtcbiAgeTI/OiBudW1iZXI7XG59O1xuZXhwb3J0IHR5cGUgTGluZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UGF0aE9wdGlvbnMsICdzaGFwZScgfCAnc2hhcGVQcm9wZXJ0eSc+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW5lIGV4dGVuZHMgUGF0aCB7XG5cbiAgLy8gVGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHBvaW50IDEpXG4gIHByaXZhdGUgX3gxOiBudW1iZXI7XG5cbiAgLy8gVGhlIFkgY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHBvaW50IDEpXG4gIHByaXZhdGUgX3kxOiBudW1iZXI7XG5cbiAgLy8gVGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHBvaW50IDIpXG4gIHByaXZhdGUgX3gyOiBudW1iZXI7XG5cbiAgLy8gVGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHBvaW50IDIpXG4gIHByaXZhdGUgX3kyOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogTGluZU9wdGlvbnMgKTtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwMTogVmVjdG9yMiwgcDI6IFZlY3RvcjIsIG9wdGlvbnM/OiBMaW5lT3B0aW9ucyApO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIG9wdGlvbnM/OiBMaW5lT3B0aW9ucyApO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHgxPzogbnVtYmVyIHwgVmVjdG9yMiB8IExpbmVPcHRpb25zLCB5MT86IG51bWJlciB8IFZlY3RvcjIsIHgyPzogbnVtYmVyIHwgTGluZU9wdGlvbnMsIHkyPzogbnVtYmVyLCBvcHRpb25zPzogTGluZU9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIG51bGwgKTtcblxuICAgIHRoaXMuX3gxID0gMDtcbiAgICB0aGlzLl95MSA9IDA7XG4gICAgdGhpcy5feDIgPSAwO1xuICAgIHRoaXMuX3kyID0gMDtcblxuICAgIC8vIFJlbWFwIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnMgdG8gb3B0aW9uc1xuICAgIGlmICggdHlwZW9mIHgxID09PSAnb2JqZWN0JyApIHtcbiAgICAgIGlmICggeDEgaW5zdGFuY2VvZiBWZWN0b3IyICkge1xuICAgICAgICAvLyBhc3N1bWVzIExpbmUoIFZlY3RvcjIsIFZlY3RvcjIsIG9wdGlvbnMgKSwgd2hlcmUgeDIgaXMgb3VyIG9wdGlvbnNcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDIgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeDIgPT09ICdvYmplY3QnICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHgyID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCB4MiApID09PSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gTm9kZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XG5cbiAgICAgICAgb3B0aW9ucyA9IGV4dGVuZERlZmluZWQ8TGluZU9wdGlvbnM+KCB7XG4gICAgICAgICAgLy8gRmlyc3QgVmVjdG9yMiBpcyB1bmRlciB0aGUgeDEgbmFtZVxuICAgICAgICAgIHgxOiB4MS54LFxuICAgICAgICAgIHkxOiB4MS55LFxuICAgICAgICAgIC8vIFNlY29uZCBWZWN0b3IyIGlzIHVuZGVyIHRoZSB5MSBuYW1lXG4gICAgICAgICAgeDI6ICggeTEgYXMgVmVjdG9yMiApLngsXG4gICAgICAgICAgeTI6ICggeTEgYXMgVmVjdG9yMiApLnksXG5cbiAgICAgICAgICBzdHJva2VQaWNrYWJsZTogdHJ1ZVxuICAgICAgICB9LCB4MiBhcyBMaW5lT3B0aW9ucyApOyAvLyBPcHRpb25zIG9iamVjdCAoaWYgYXZhaWxhYmxlKSBpcyB1bmRlciB0aGUgeDIgbmFtZVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIGFzc3VtZXMgTGluZSggeyAuLi4gfSApLCBpbml0IHRvIHplcm8gZm9yIG5vd1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5MSA9PT0gdW5kZWZpbmVkICk7XG5cbiAgICAgICAgLy8gT3B0aW9ucyBvYmplY3QgaXMgdW5kZXIgdGhlIHgxIG5hbWVcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDEgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIHgxICkgPT09IE9iamVjdC5wcm90b3R5cGUsXG4gICAgICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBOb2RlIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCcgKTtcblxuICAgICAgICBvcHRpb25zID0gZXh0ZW5kRGVmaW5lZCgge1xuICAgICAgICAgIHN0cm9rZVBpY2thYmxlOiB0cnVlXG4gICAgICAgIH0sIHgxICk7IC8vIE9wdGlvbnMgb2JqZWN0IChpZiBhdmFpbGFibGUpIGlzIHVuZGVyIHRoZSB4MSBuYW1lXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gbmV3IExpbmUoIHgxLCB5MSwgeDIsIHkyLCBbb3B0aW9uc10gKVxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDEgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgdHlwZW9mIHkxID09PSAnbnVtYmVyJyAmJlxuICAgICAgdHlwZW9mIHgyID09PSAnbnVtYmVyJyAmJlxuICAgICAgdHlwZW9mIHkyID09PSAnbnVtYmVyJyApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZiggb3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIE5vZGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kRGVmaW5lZDxMaW5lT3B0aW9ucz4oIHtcbiAgICAgICAgeDE6IHgxLFxuICAgICAgICB5MTogeTEgYXMgbnVtYmVyLFxuICAgICAgICB4MjogeDIgYXMgbnVtYmVyLFxuICAgICAgICB5MjogeTIsXG4gICAgICAgIHN0cm9rZVBpY2thYmxlOiB0cnVlXG4gICAgICB9LCBvcHRpb25zICk7XG4gICAgfVxuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYWxsIG9mIHRoZSBsaW5lJ3MgeCBhbmQgeSB2YWx1ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB4MSAtIHRoZSBzdGFydCB4IGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHkxIC0gdGhlIHN0YXJ0IHkgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0geDIgLSB0aGUgZW5kIHggY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0geTIgLSB0aGUgZW5kIHkgY29vcmRpbmF0ZVxuICAgKi9cbiAgcHVibGljIHNldExpbmUoIHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeDEgIT09IHVuZGVmaW5lZCAmJlxuICAgIHkxICE9PSB1bmRlZmluZWQgJiZcbiAgICB4MiAhPT0gdW5kZWZpbmVkICYmXG4gICAgeTIgIT09IHVuZGVmaW5lZCwgJ3BhcmFtZXRlcnMgbmVlZCB0byBiZSBkZWZpbmVkJyApO1xuXG4gICAgdGhpcy5feDEgPSB4MTtcbiAgICB0aGlzLl95MSA9IHkxO1xuICAgIHRoaXMuX3gyID0geDI7XG4gICAgdGhpcy5feTIgPSB5MjtcblxuICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9kcmF3YWJsZXNbIGkgXTtcbiAgICAgICggc3RhdGUgYXMgdW5rbm93biBhcyBUTGluZURyYXdhYmxlICkubWFya0RpcnR5TGluZSgpO1xuICAgIH1cblxuICAgIHRoaXMuaW52YWxpZGF0ZUxpbmUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgbGluZSdzIGZpcnN0IHBvaW50J3MgeCBhbmQgeSB2YWx1ZXNcbiAgICovXG4gIHB1YmxpYyBzZXRQb2ludDEoIHAxOiBWZWN0b3IyICk6IHRoaXM7XG4gIHNldFBvaW50MSggeDE6IG51bWJlciwgeTE6IG51bWJlciApOiB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxuICBzZXRQb2ludDEoIHgxOiBudW1iZXIgfCBWZWN0b3IyLCB5MT86IG51bWJlciApOiB0aGlzIHsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XG4gICAgaWYgKCB0eXBlb2YgeDEgPT09ICdudW1iZXInICkge1xuXG4gICAgICAvLyBzZXRQb2ludDEoIHgxLCB5MSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDEgIT09IHVuZGVmaW5lZCAmJiB5MSAhPT0gdW5kZWZpbmVkLCAncGFyYW1ldGVycyBuZWVkIHRvIGJlIGRlZmluZWQnICk7XG4gICAgICB0aGlzLl94MSA9IHgxO1xuICAgICAgdGhpcy5feTEgPSB5MSE7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBzZXRQb2ludDEoIFZlY3RvcjIgKVxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDEueCAhPT0gdW5kZWZpbmVkICYmIHgxLnkgIT09IHVuZGVmaW5lZCwgJ3BhcmFtZXRlcnMgbmVlZCB0byBiZSBkZWZpbmVkJyApO1xuICAgICAgdGhpcy5feDEgPSB4MS54O1xuICAgICAgdGhpcy5feTEgPSB4MS55O1xuICAgIH1cbiAgICBjb25zdCBudW1EcmF3YWJsZXMgPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bURyYXdhYmxlczsgaSsrICkge1xuICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRMaW5lRHJhd2FibGUgKS5tYXJrRGlydHlQMSgpO1xuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdGVMaW5lKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcDEoIHBvaW50OiBWZWN0b3IyICkgeyB0aGlzLnNldFBvaW50MSggcG9pbnQgKTsgfVxuXG4gIHB1YmxpYyBnZXQgcDEoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5feDEsIHRoaXMuX3kxICk7IH1cblxuICAvKipcbiAgICogU2V0IHRoZSBsaW5lJ3Mgc2Vjb25kIHBvaW50J3MgeCBhbmQgeSB2YWx1ZXNcbiAgICovXG4gIHB1YmxpYyBzZXRQb2ludDIoIHAxOiBWZWN0b3IyICk6IHRoaXM7XG4gIHNldFBvaW50MiggeDI6IG51bWJlciwgeTI6IG51bWJlciApOiB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxuICBzZXRQb2ludDIoIHgyOiBudW1iZXIgfCBWZWN0b3IyLCB5Mj86IG51bWJlciApOiB0aGlzIHsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XG4gICAgaWYgKCB0eXBlb2YgeDIgPT09ICdudW1iZXInICkge1xuICAgICAgLy8gc2V0UG9pbnQyKCB4MiwgeTIgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHgyICE9PSB1bmRlZmluZWQgJiYgeTIgIT09IHVuZGVmaW5lZCwgJ3BhcmFtZXRlcnMgbmVlZCB0byBiZSBkZWZpbmVkJyApO1xuICAgICAgdGhpcy5feDIgPSB4MjtcbiAgICAgIHRoaXMuX3kyID0geTIhO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHNldFBvaW50MiggVmVjdG9yMiApXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB4Mi54ICE9PSB1bmRlZmluZWQgJiYgeDIueSAhPT0gdW5kZWZpbmVkLCAncGFyYW1ldGVycyBuZWVkIHRvIGJlIGRlZmluZWQnICk7XG4gICAgICB0aGlzLl94MiA9IHgyLng7XG4gICAgICB0aGlzLl95MiA9IHgyLnk7XG4gICAgfVxuICAgIGNvbnN0IG51bURyYXdhYmxlcyA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtRHJhd2FibGVzOyBpKysgKSB7XG4gICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVExpbmVEcmF3YWJsZSApLm1hcmtEaXJ0eVAyKCk7XG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0ZUxpbmUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBwMiggcG9pbnQ6IFZlY3RvcjIgKSB7IHRoaXMuc2V0UG9pbnQyKCBwb2ludCApOyB9XG5cbiAgcHVibGljIGdldCBwMigpOiBWZWN0b3IyIHsgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLl94MiwgdGhpcy5feTIgKTsgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB4IGNvb3JkaW5hdGUgb2YgdGhlIGZpcnN0IHBvaW50IG9mIHRoZSBsaW5lLlxuICAgKi9cbiAgcHVibGljIHNldFgxKCB4MTogbnVtYmVyICk6IHRoaXMge1xuICAgIGlmICggdGhpcy5feDEgIT09IHgxICkge1xuICAgICAgdGhpcy5feDEgPSB4MTtcblxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRMaW5lRHJhd2FibGUgKS5tYXJrRGlydHlYMSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmludmFsaWRhdGVMaW5lKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCB4MSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRYMSggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgeDEoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0WDEoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB4IGNvb3JkaW5hdGUgb2YgdGhlIGZpcnN0IHBvaW50IG9mIHRoZSBsaW5lLlxuICAgKi9cbiAgcHVibGljIGdldFgxKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3gxO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgZmlyc3QgcG9pbnQgb2YgdGhlIGxpbmUuXG4gICAqL1xuICBwdWJsaWMgc2V0WTEoIHkxOiBudW1iZXIgKTogdGhpcyB7XG4gICAgaWYgKCB0aGlzLl95MSAhPT0geTEgKSB7XG4gICAgICB0aGlzLl95MSA9IHkxO1xuXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVExpbmVEcmF3YWJsZSApLm1hcmtEaXJ0eVkxKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZUxpbmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHkxKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFkxKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCB5MSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRZMSgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgZmlyc3QgcG9pbnQgb2YgdGhlIGxpbmUuXG4gICAqL1xuICBwdWJsaWMgZ2V0WTEoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5feTE7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgeCBjb29yZGluYXRlIG9mIHRoZSBzZWNvbmQgcG9pbnQgb2YgdGhlIGxpbmUuXG4gICAqL1xuICBwdWJsaWMgc2V0WDIoIHgyOiBudW1iZXIgKTogdGhpcyB7XG4gICAgaWYgKCB0aGlzLl94MiAhPT0geDIgKSB7XG4gICAgICB0aGlzLl94MiA9IHgyO1xuXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVExpbmVEcmF3YWJsZSApLm1hcmtEaXJ0eVgyKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZUxpbmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHgyKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFgyKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCB4MigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRYMigpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgc2Vjb25kIHBvaW50IG9mIHRoZSBsaW5lLlxuICAgKi9cbiAgcHVibGljIGdldFgyKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3gyO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgc2Vjb25kIHBvaW50IG9mIHRoZSBsaW5lLlxuICAgKi9cbiAgcHVibGljIHNldFkyKCB5MjogbnVtYmVyICk6IHRoaXMge1xuICAgIGlmICggdGhpcy5feTIgIT09IHkyICkge1xuICAgICAgdGhpcy5feTIgPSB5MjtcblxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRMaW5lRHJhd2FibGUgKS5tYXJrRGlydHlZMigpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmludmFsaWRhdGVMaW5lKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCB5MiggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRZMiggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgeTIoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0WTIoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB5IGNvb3JkaW5hdGUgb2YgdGhlIHNlY29uZCBwb2ludCBvZiB0aGUgbGluZS5cbiAgICovXG4gIHB1YmxpYyBnZXRZMigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl95MjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgU2hhcGUgdGhhdCBpcyBlcXVpdmFsZW50IHRvIG91ciByZW5kZXJlZCBkaXNwbGF5LiBHZW5lcmFsbHkgdXNlZCB0byBsYXppbHkgY3JlYXRlIGEgU2hhcGUgaW5zdGFuY2VcbiAgICogd2hlbiBvbmUgaXMgbmVlZGVkLCB3aXRob3V0IGhhdmluZyB0byBkbyBzbyBiZWZvcmVoYW5kLlxuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVMaW5lU2hhcGUoKTogU2hhcGUge1xuICAgIHJldHVybiBTaGFwZS5saW5lU2VnbWVudCggdGhpcy5feDEsIHRoaXMuX3kxLCB0aGlzLl94MiwgdGhpcy5feTIgKS5tYWtlSW1tdXRhYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm90aWZpZXMgdGhhdCB0aGUgbGluZSBoYXMgY2hhbmdlZCBhbmQgaW52YWxpZGF0ZXMgcGF0aCBpbmZvcm1hdGlvbiBhbmQgb3VyIGNhY2hlZCBzaGFwZS5cbiAgICovXG4gIHByaXZhdGUgaW52YWxpZGF0ZUxpbmUoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMuX3gxICksIGBBIGxpbmUgbmVlZHMgdG8gaGF2ZSBhIGZpbml0ZSB4MSAoJHt0aGlzLl94MX0pYCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLl95MSApLCBgQSBsaW5lIG5lZWRzIHRvIGhhdmUgYSBmaW5pdGUgeTEgKCR7dGhpcy5feTF9KWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5feDIgKSwgYEEgbGluZSBuZWVkcyB0byBoYXZlIGEgZmluaXRlIHgyICgke3RoaXMuX3gyfSlgICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMuX3kyICksIGBBIGxpbmUgbmVlZHMgdG8gaGF2ZSBhIGZpbml0ZSB5MiAoJHt0aGlzLl95Mn0pYCApO1xuXG4gICAgLy8gc2V0cyBvdXIgJ2NhY2hlJyB0byBudWxsLCBzbyB3ZSBkb24ndCBhbHdheXMgaGF2ZSB0byByZWNvbXB1dGUgb3VyIHNoYXBlXG4gICAgdGhpcy5fc2hhcGUgPSBudWxsO1xuXG4gICAgLy8gc2hvdWxkIGludmFsaWRhdGUgdGhlIHBhdGggYW5kIGVuc3VyZSBhIHJlZHJhd1xuICAgIHRoaXMuaW52YWxpZGF0ZVBhdGgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB3aGV0aGVyIHRoZSBwcm92aWRlZCBwb2ludCBpcyBcImluc2lkZVwiIChjb250YWluZWQpIGluIHRoaXMgTGluZSdzIHNlbGYgY29udGVudCwgb3IgXCJvdXRzaWRlXCIuXG4gICAqXG4gICAqIFNpbmNlIGFuIHVuc3Ryb2tlZCBMaW5lIGNvbnRhaW5zIG5vIGFyZWEsIHdlIGNhbiBxdWlja2x5IHNob3J0Y3V0IHRoaXMgb3BlcmF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gcG9pbnQgLSBDb25zaWRlcmVkIHRvIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY29udGFpbnNQb2ludFNlbGYoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xuICAgIGlmICggdGhpcy5fc3Ryb2tlUGlja2FibGUgKSB7XG4gICAgICByZXR1cm4gc3VwZXIuY29udGFpbnNQb2ludFNlbGYoIHBvaW50ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBub3RoaW5nIGlzIGluIGEgbGluZSEgKGFsdGhvdWdoIG1heWJlIHdlIHNob3VsZCBoYW5kbGUgZWRnZSBwb2ludHMgcHJvcGVybHk/KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyB0aGUgY3VycmVudCBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbiwgYXNzdW1pbmcgdGhlIHdyYXBwZXIncyBDYW52YXMgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBsb2NhbFxuICAgKiBjb29yZGluYXRlIGZyYW1lIG9mIHRoaXMgbm9kZS5cbiAgICpcbiAgICogQHBhcmFtIHdyYXBwZXJcbiAgICogQHBhcmFtIG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYWxyZWFkeSBhcHBsaWVkIHRvIHRoZSBjb250ZXh0LlxuICAgKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNhbnZhc1BhaW50U2VsZiggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcbiAgICAvL1RPRE86IEhhdmUgYSBzZXBhcmF0ZSBtZXRob2QgZm9yIHRoaXMsIGluc3RlYWQgb2YgdG91Y2hpbmcgdGhlIHByb3RvdHlwZS4gQ2FuIG1ha2UgJ3RoaXMnIHJlZmVyZW5jZXMgdG9vIGVhc2lseS4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBMaW5lQ2FudmFzRHJhd2FibGUucHJvdG90eXBlLnBhaW50Q2FudmFzKCB3cmFwcGVyLCB0aGlzLCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgYm91bmRzIG9mIHRoZSBMaW5lLCBpbmNsdWRpbmcgYW55IGFwcGxpZWQgc3Ryb2tlLiBPdmVycmlkZGVuIGZvciBlZmZpY2llbmN5LlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNvbXB1dGVTaGFwZUJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICAvLyBvcHRpbWl6ZWQgZm9ybSBmb3IgYSBzaW5nbGUgbGluZSBzZWdtZW50IChubyBqb2lucywganVzdCB0d28gY2FwcylcbiAgICBpZiAoIHRoaXMuX3N0cm9rZSApIHtcbiAgICAgIGNvbnN0IGxpbmVDYXAgPSB0aGlzLmdldExpbmVDYXAoKTtcbiAgICAgIGNvbnN0IGhhbGZMaW5lV2lkdGggPSB0aGlzLmdldExpbmVXaWR0aCgpIC8gMjtcbiAgICAgIGlmICggbGluZUNhcCA9PT0gJ3JvdW5kJyApIHtcbiAgICAgICAgLy8gd2UgY2FuIHNpbXBseSBkaWxhdGUgYnkgaGFsZiB0aGUgbGluZSB3aWR0aFxuICAgICAgICByZXR1cm4gbmV3IEJvdW5kczIoXG4gICAgICAgICAgTWF0aC5taW4oIHRoaXMuX3gxLCB0aGlzLl94MiApIC0gaGFsZkxpbmVXaWR0aCwgTWF0aC5taW4oIHRoaXMuX3kxLCB0aGlzLl95MiApIC0gaGFsZkxpbmVXaWR0aCxcbiAgICAgICAgICBNYXRoLm1heCggdGhpcy5feDEsIHRoaXMuX3gyICkgKyBoYWxmTGluZVdpZHRoLCBNYXRoLm1heCggdGhpcy5feTEsIHRoaXMuX3kyICkgKyBoYWxmTGluZVdpZHRoICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gKGR4LGR5KSBpcyBhIHZlY3RvciBwMi1wMVxuICAgICAgICBjb25zdCBkeCA9IHRoaXMuX3gyIC0gdGhpcy5feDE7XG4gICAgICAgIGNvbnN0IGR5ID0gdGhpcy5feTIgLSB0aGlzLl95MTtcbiAgICAgICAgY29uc3QgbWFnbml0dWRlID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuICAgICAgICBpZiAoIG1hZ25pdHVkZSA9PT0gMCApIHtcbiAgICAgICAgICAvLyBpZiBvdXIgbGluZSBpcyBhIHBvaW50LCBqdXN0IGRpbGF0ZSBieSBoYWxmTGluZVdpZHRoXG4gICAgICAgICAgcmV0dXJuIG5ldyBCb3VuZHMyKCB0aGlzLl94MSAtIGhhbGZMaW5lV2lkdGgsIHRoaXMuX3kxIC0gaGFsZkxpbmVXaWR0aCwgdGhpcy5feDIgKyBoYWxmTGluZVdpZHRoLCB0aGlzLl95MiArIGhhbGZMaW5lV2lkdGggKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAoc3gsc3kpIGlzIGEgdmVjdG9yIHdpdGggYSBtYWduaXR1ZGUgb2YgaGFsZkxpbmVXaWR0aCBwb2ludGVkIGluIHRoZSBkaXJlY3Rpb24gb2YgKGR4LGR5KVxuICAgICAgICBjb25zdCBzeCA9IGhhbGZMaW5lV2lkdGggKiBkeCAvIG1hZ25pdHVkZTtcbiAgICAgICAgY29uc3Qgc3kgPSBoYWxmTGluZVdpZHRoICogZHkgLyBtYWduaXR1ZGU7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XG5cbiAgICAgICAgaWYgKCBsaW5lQ2FwID09PSAnYnV0dCcgKSB7XG4gICAgICAgICAgLy8gZm91ciBwb2ludHMganVzdCB1c2luZyB0aGUgcGVycGVuZGljdWxhciBzdHJva2VkIG9mZnNldHMgKHN5LC1zeCkgYW5kICgtc3ksc3gpXG4gICAgICAgICAgYm91bmRzLmFkZENvb3JkaW5hdGVzKCB0aGlzLl94MSAtIHN5LCB0aGlzLl95MSArIHN4ICk7XG4gICAgICAgICAgYm91bmRzLmFkZENvb3JkaW5hdGVzKCB0aGlzLl94MSArIHN5LCB0aGlzLl95MSAtIHN4ICk7XG4gICAgICAgICAgYm91bmRzLmFkZENvb3JkaW5hdGVzKCB0aGlzLl94MiAtIHN5LCB0aGlzLl95MiArIHN4ICk7XG4gICAgICAgICAgYm91bmRzLmFkZENvb3JkaW5hdGVzKCB0aGlzLl94MiArIHN5LCB0aGlzLl95MiAtIHN4ICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGluZUNhcCA9PT0gJ3NxdWFyZScgKTtcblxuICAgICAgICAgIC8vIGZvdXIgcG9pbnRzIGp1c3QgdXNpbmcgdGhlIHBlcnBlbmRpY3VsYXIgc3Ryb2tlZCBvZmZzZXRzIChzeSwtc3gpIGFuZCAoLXN5LHN4KSBhbmQgcGFyYWxsZWwgc3Ryb2tlZCBvZmZzZXRzXG4gICAgICAgICAgYm91bmRzLmFkZENvb3JkaW5hdGVzKCB0aGlzLl94MSAtIHN4IC0gc3ksIHRoaXMuX3kxIC0gc3kgKyBzeCApO1xuICAgICAgICAgIGJvdW5kcy5hZGRDb29yZGluYXRlcyggdGhpcy5feDEgLSBzeCArIHN5LCB0aGlzLl95MSAtIHN5IC0gc3ggKTtcbiAgICAgICAgICBib3VuZHMuYWRkQ29vcmRpbmF0ZXMoIHRoaXMuX3gyICsgc3ggLSBzeSwgdGhpcy5feTIgKyBzeSArIHN4ICk7XG4gICAgICAgICAgYm91bmRzLmFkZENvb3JkaW5hdGVzKCB0aGlzLl94MiArIHN4ICsgc3ksIHRoaXMuX3kyICsgc3kgLSBzeCApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gSXQgbWlnaHQgaGF2ZSBhIGZpbGw/IEp1c3QgaW5jbHVkZSB0aGUgZmlsbCBib3VuZHMgZm9yIG5vdy5cbiAgICAgIGNvbnN0IGZpbGxCb3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xuICAgICAgZmlsbEJvdW5kcy5hZGRDb29yZGluYXRlcyggdGhpcy5feDEsIHRoaXMuX3kxICk7XG4gICAgICBmaWxsQm91bmRzLmFkZENvb3JkaW5hdGVzKCB0aGlzLl94MiwgdGhpcy5feTIgKTtcbiAgICAgIHJldHVybiBmaWxsQm91bmRzO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgU1ZHIGRyYXdhYmxlIGZvciB0aGlzIExpbmUuXG4gICAqXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVTVkdEcmF3YWJsZSggcmVuZGVyZXI6IG51bWJlciwgaW5zdGFuY2U6IEluc3RhbmNlICk6IFNWR1NlbGZEcmF3YWJsZSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIHJldHVybiBMaW5lU1ZHRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBDYW52YXMgZHJhd2FibGUgZm9yIHRoaXMgTGluZS5cbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZUNhbnZhc0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogQ2FudmFzU2VsZkRyYXdhYmxlIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgcmV0dXJuIExpbmVDYW52YXNEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XG4gIH1cblxuICAvKipcbiAgICogSXQgaXMgaW1wb3NzaWJsZSB0byBzZXQgYW5vdGhlciBzaGFwZSBvbiB0aGlzIFBhdGggc3VidHlwZSwgYXMgaXRzIGVmZmVjdGl2ZSBzaGFwZSBpcyBkZXRlcm1pbmVkIGJ5IG90aGVyXG4gICAqIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiBpdCBpcyBub3QgbnVsbC5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRTaGFwZSggc2hhcGU6IFNoYXBlIHwgbnVsbCApOiB0aGlzIHtcbiAgICBpZiAoIHNoYXBlICE9PSBudWxsICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQ2Fubm90IHNldCB0aGUgc2hhcGUgb2YgYSBMaW5lIHRvIHNvbWV0aGluZyBub24tbnVsbCcgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBwcm9iYWJseSBjYWxsZWQgZnJvbSB0aGUgUGF0aCBjb25zdHJ1Y3RvclxuICAgICAgdGhpcy5pbnZhbGlkYXRlUGF0aCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaW1tdXRhYmxlIGNvcHkgb2YgdGhpcyBQYXRoIHN1YnR5cGUncyByZXByZXNlbnRhdGlvbi5cbiAgICpcbiAgICogTk9URTogVGhpcyBpcyBjcmVhdGVkIGxhemlseSwgc28gZG9uJ3QgY2FsbCBpdCBpZiB5b3UgZG9uJ3QgaGF2ZSB0byFcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRTaGFwZSgpOiBTaGFwZSB7XG4gICAgaWYgKCAhdGhpcy5fc2hhcGUgKSB7XG4gICAgICB0aGlzLl9zaGFwZSA9IHRoaXMuY3JlYXRlTGluZVNoYXBlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zaGFwZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBQYXRoIGhhcyBhbiBhc3NvY2lhdGVkIFNoYXBlIChpbnN0ZWFkIG9mIG5vIHNoYXBlLCByZXByZXNlbnRlZCBieSBudWxsKVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGhhc1NoYXBlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIHNldFNoYXBlUHJvcGVydHkoIG5ld1RhcmdldDogVFJlYWRPbmx5UHJvcGVydHk8U2hhcGUgfCBzdHJpbmcgfCBudWxsPiB8IG51bGwgKTogdGhpcyB7XG4gICAgaWYgKCBuZXdUYXJnZXQgIT09IG51bGwgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdDYW5ub3Qgc2V0IHRoZSBzaGFwZVByb3BlcnR5IG9mIGEgTGluZSB0byBzb21ldGhpbmcgbm9uLW51bGwsIGl0IGhhbmRsZXMgdGhpcyBpdHNlbGYnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogTGluZU9wdGlvbnMgKTogdGhpcyB7XG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYXZhaWxhYmxlIGZpbGwgcmVuZGVyZXJzLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogU2luY2Ugb3VyIGxpbmUgY2FuJ3QgYmUgZmlsbGVkLCB3ZSBzdXBwb3J0IGFsbCBmaWxsIHJlbmRlcmVycy5cbiAgICpcbiAgICogU2VlIFJlbmRlcmVyIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBiaXRtYXNrc1xuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGdldEZpbGxSZW5kZXJlckJpdG1hc2soKTogbnVtYmVyIHtcbiAgICByZXR1cm4gUmVuZGVyZXIuYml0bWFza0NhbnZhcyB8IFJlbmRlcmVyLmJpdG1hc2tTVkcgfCBSZW5kZXJlci5iaXRtYXNrRE9NIHwgUmVuZGVyZXIuYml0bWFza1dlYkdMO1xuICB9XG59XG5cbi8qKlxuICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgb2YgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IG5vZGUubXV0YXRlKCBvcHRpb25zICksIGluIHRoZVxuICogb3JkZXIgdGhleSB3aWxsIGJlIGV2YWx1YXRlZCBpbi5cbiAqXG4gKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcbiAqICAgICAgIGNhc2VzIHRoYXQgbWF5IGFwcGx5LlxuICovXG5MaW5lLnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBMSU5FX09QVElPTl9LRVlTLmNvbmNhdCggUGF0aC5wcm90b3R5cGUuX211dGF0b3JLZXlzICk7XG5cbi8qKlxuICoge0FycmF5LjxTdHJpbmc+fSAtIExpc3Qgb2YgYWxsIGRpcnR5IGZsYWdzIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSBvbiBkcmF3YWJsZXMgY3JlYXRlZCBmcm9tIHRoaXMgbm9kZSAob3JcbiAqICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlKS4gR2l2ZW4gYSBmbGFnIChlLmcuIHJhZGl1cyksIGl0IGluZGljYXRlcyB0aGUgZXhpc3RlbmNlIG9mIGEgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICBkcmF3YWJsZS5tYXJrRGlydHlSYWRpdXMoKSB0aGF0IHdpbGwgaW5kaWNhdGUgdG8gdGhlIGRyYXdhYmxlIHRoYXQgdGhlIHJhZGl1cyBoYXMgY2hhbmdlZC5cbiAqIChzY2VuZXJ5LWludGVybmFsKVxuICogQG92ZXJyaWRlXG4gKi9cbkxpbmUucHJvdG90eXBlLmRyYXdhYmxlTWFya0ZsYWdzID0gUGF0aC5wcm90b3R5cGUuZHJhd2FibGVNYXJrRmxhZ3MuY29uY2F0KCBbICdsaW5lJywgJ3AxJywgJ3AyJywgJ3gxJywgJ3gyJywgJ3kxJywgJ3kyJyBdICkuZmlsdGVyKCBmbGFnID0+IGZsYWcgIT09ICdzaGFwZScgKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ0xpbmUnLCBMaW5lICk7Il0sIm5hbWVzIjpbIkJvdW5kczIiLCJWZWN0b3IyIiwiU2hhcGUiLCJleHRlbmREZWZpbmVkIiwiTGluZUNhbnZhc0RyYXdhYmxlIiwiTGluZVNWR0RyYXdhYmxlIiwiUGF0aCIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIkxJTkVfT1BUSU9OX0tFWVMiLCJMaW5lIiwic2V0TGluZSIsIngxIiwieTEiLCJ4MiIsInkyIiwiYXNzZXJ0IiwidW5kZWZpbmVkIiwiX3gxIiwiX3kxIiwiX3gyIiwiX3kyIiwic3RhdGVMZW4iLCJfZHJhd2FibGVzIiwibGVuZ3RoIiwiaSIsInN0YXRlIiwibWFya0RpcnR5TGluZSIsImludmFsaWRhdGVMaW5lIiwic2V0UG9pbnQxIiwieCIsInkiLCJudW1EcmF3YWJsZXMiLCJtYXJrRGlydHlQMSIsInAxIiwicG9pbnQiLCJzZXRQb2ludDIiLCJtYXJrRGlydHlQMiIsInAyIiwic2V0WDEiLCJtYXJrRGlydHlYMSIsInZhbHVlIiwiZ2V0WDEiLCJzZXRZMSIsIm1hcmtEaXJ0eVkxIiwiZ2V0WTEiLCJzZXRYMiIsIm1hcmtEaXJ0eVgyIiwiZ2V0WDIiLCJzZXRZMiIsIm1hcmtEaXJ0eVkyIiwiZ2V0WTIiLCJjcmVhdGVMaW5lU2hhcGUiLCJsaW5lU2VnbWVudCIsIm1ha2VJbW11dGFibGUiLCJpc0Zpbml0ZSIsIl9zaGFwZSIsImludmFsaWRhdGVQYXRoIiwiY29udGFpbnNQb2ludFNlbGYiLCJfc3Ryb2tlUGlja2FibGUiLCJjYW52YXNQYWludFNlbGYiLCJ3cmFwcGVyIiwibWF0cml4IiwicHJvdG90eXBlIiwicGFpbnRDYW52YXMiLCJjb21wdXRlU2hhcGVCb3VuZHMiLCJfc3Ryb2tlIiwibGluZUNhcCIsImdldExpbmVDYXAiLCJoYWxmTGluZVdpZHRoIiwiZ2V0TGluZVdpZHRoIiwiTWF0aCIsIm1pbiIsIm1heCIsImR4IiwiZHkiLCJtYWduaXR1ZGUiLCJzcXJ0Iiwic3giLCJzeSIsImJvdW5kcyIsIk5PVEhJTkciLCJjb3B5IiwiYWRkQ29vcmRpbmF0ZXMiLCJmaWxsQm91bmRzIiwiY3JlYXRlU1ZHRHJhd2FibGUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiY3JlYXRlRnJvbVBvb2wiLCJjcmVhdGVDYW52YXNEcmF3YWJsZSIsInNldFNoYXBlIiwic2hhcGUiLCJFcnJvciIsImdldFNoYXBlIiwiaGFzU2hhcGUiLCJzZXRTaGFwZVByb3BlcnR5IiwibmV3VGFyZ2V0IiwibXV0YXRlIiwib3B0aW9ucyIsImdldEZpbGxSZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrQ2FudmFzIiwiYml0bWFza1NWRyIsImJpdG1hc2tET00iLCJiaXRtYXNrV2ViR0wiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInN0cm9rZVBpY2thYmxlIiwiX211dGF0b3JLZXlzIiwiY29uY2F0IiwiZHJhd2FibGVNYXJrRmxhZ3MiLCJmaWx0ZXIiLCJmbGFnIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBR0QsT0FB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