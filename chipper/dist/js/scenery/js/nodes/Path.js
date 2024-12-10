// Copyright 2013-2024, University of Colorado Boulder
/**
 * A Path draws a Shape with a specific type of fill and stroke. Mixes in Paintable.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyForwardingProperty from '../../../axon/js/TinyForwardingProperty.js';
import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { Node, Paint, Paintable, PAINTABLE_DRAWABLE_MARK_FLAGS, PAINTABLE_OPTION_KEYS, PathCanvasDrawable, PathSVGDrawable, Renderer, scenery } from '../imports.js';
const PATH_OPTION_KEYS = [
    'boundsMethod',
    'shape',
    'shapeProperty'
];
const DEFAULT_OPTIONS = {
    shape: null,
    boundsMethod: 'accurate'
};
let Path = class Path extends Paintable(Node) {
    setShape(shape) {
        assert && assert(shape === null || typeof shape === 'string' || shape instanceof Shape, 'A path\'s shape should either be null, a string, or a Shape');
        this._shapeProperty.value = shape;
        return this;
    }
    set shape(value) {
        this.setShape(value);
    }
    get shape() {
        return this.getShape();
    }
    /**
   * Returns the shape that was set for this Path (or for subtypes like Line and Rectangle, will return an immutable
   * Shape that is equivalent in appearance).
   *
   * It is best to generally assume modifications to the Shape returned is not supported. If there is no shape
   * currently, null will be returned.
   */ getShape() {
        return this._shape;
    }
    onShapePropertyChange(shape) {
        assert && assert(shape === null || typeof shape === 'string' || shape instanceof Shape, 'A path\'s shape should either be null, a string, or a Shape');
        if (this._shape !== shape) {
            // Remove Shape invalidation listener if applicable
            if (this._invalidShapeListenerAttached) {
                this.detachShapeListener();
            }
            if (typeof shape === 'string') {
                // be content with onShapePropertyChange always invalidating the shape?
                shape = new Shape(shape);
            }
            this._shape = shape;
            this.invalidateShape();
            // Add Shape invalidation listener if applicable
            if (this._shape && !this._shape.isImmutable()) {
                this.attachShapeListener();
            }
        }
    }
    /**
   * See documentation for Node.setVisibleProperty, except this is for the shape
   */ setShapeProperty(newTarget) {
        return this._shapeProperty.setTargetProperty(newTarget);
    }
    set shapeProperty(property) {
        this.setShapeProperty(property);
    }
    get shapeProperty() {
        return this.getShapeProperty();
    }
    /**
   * Like Node.getVisibleProperty(), but for the shape. Note this is not the same as the Property provided in
   * setShapeProperty. Thus is the nature of TinyForwardingProperty.
   */ getShapeProperty() {
        return this._shapeProperty;
    }
    /**
   * Returns a lazily-created Shape that has the appearance of the Path's shape but stroked using the current
   * stroke style of the Path.
   *
   * NOTE: It is invalid to call this on a Path that does not currently have a Shape (usually a Path where
   *       the shape is set to null).
   */ getStrokedShape() {
        assert && assert(this.hasShape(), 'We cannot stroke a non-existing shape');
        // Lazily compute the stroked shape. It should be set to null when we need to recompute it
        if (!this._strokedShape) {
            this._strokedShape = this.getShape().getStrokedShape(this._lineDrawingStyles);
        }
        return this._strokedShape;
    }
    /**
   * Returns a bitmask representing the supported renderers for the current configuration of the Path or subtype.
   *
   * Should be overridden by subtypes to either extend or restrict renderers, depending on what renderers are
   * supported.
   *
   * @returns - A bitmask that includes supported renderers, see Renderer for details.
   */ getPathRendererBitmask() {
        // By default, Canvas and SVG are accepted.
        return Renderer.bitmaskCanvas | Renderer.bitmaskSVG;
    }
    /**
   * Triggers a check and update for what renderers the current configuration of this Path or subtype supports.
   * This should be called whenever something that could potentially change supported renderers happen (which can
   * be the shape, properties of the strokes or fills, etc.)
   */ invalidateSupportedRenderers() {
        this.setRendererBitmask(this.getFillRendererBitmask() & this.getStrokeRendererBitmask() & this.getPathRendererBitmask());
    }
    /**
   * Notifies the Path that the Shape has changed (either the Shape itself has be mutated, a new Shape has been
   * provided).
   *
   * NOTE: This should not be called on subtypes of Path after they have been constructed, like Line, Rectangle, etc.
   */ invalidateShape() {
        this.invalidatePath();
        const stateLen = this._drawables.length;
        for(let i = 0; i < stateLen; i++){
            this._drawables[i].markDirtyShape(); // subtypes of Path may not have this, but it's called during construction
        }
        // Disconnect our Shape listener if our Shape has become immutable.
        // see https://github.com/phetsims/sun/issues/270#issuecomment-250266174
        if (this._invalidShapeListenerAttached && this._shape && this._shape.isImmutable()) {
            this.detachShapeListener();
        }
    }
    /**
   * Invalidates the node's self-bounds and any other recorded metadata about the outline or bounds of the Shape.
   *
   * This is meant to be used for all Path subtypes (unlike invalidateShape).
   */ invalidatePath() {
        this._strokedShape = null;
        this.invalidateSelf(); // We don't immediately compute the bounds
    }
    /**
   * Attaches a listener to our Shape that will be called whenever the Shape changes.
   */ attachShapeListener() {
        assert && assert(!this._invalidShapeListenerAttached, 'We do not want to have two listeners attached!');
        // Do not attach shape listeners if we are disposed
        if (!this.isDisposed) {
            this._shape.invalidatedEmitter.addListener(this._invalidShapeListener);
            this._invalidShapeListenerAttached = true;
        }
    }
    /**
   * Detaches a previously-attached listener added to our Shape (see attachShapeListener).
   */ detachShapeListener() {
        assert && assert(this._invalidShapeListenerAttached, 'We cannot detach an unattached listener');
        this._shape.invalidatedEmitter.removeListener(this._invalidShapeListener);
        this._invalidShapeListenerAttached = false;
    }
    /**
   * Computes a more efficient selfBounds for our Path.
   *
   * @returns - Whether the self bounds changed.
   */ updateSelfBounds() {
        const selfBounds = this.hasShape() ? this.computeShapeBounds() : Bounds2.NOTHING;
        const changed = !selfBounds.equals(this.selfBoundsProperty._value);
        if (changed) {
            this.selfBoundsProperty._value.set(selfBounds);
        }
        return changed;
    }
    setBoundsMethod(boundsMethod) {
        assert && assert(boundsMethod === 'accurate' || boundsMethod === 'unstroked' || boundsMethod === 'tightPadding' || boundsMethod === 'safePadding' || boundsMethod === 'none');
        if (this._boundsMethod !== boundsMethod) {
            this._boundsMethod = boundsMethod;
            this.invalidatePath();
            this.rendererSummaryRefreshEmitter.emit(); // whether our self bounds are valid may have changed
        }
        return this;
    }
    set boundsMethod(value) {
        this.setBoundsMethod(value);
    }
    get boundsMethod() {
        return this.getBoundsMethod();
    }
    /**
   * Returns the current bounds method. See setBoundsMethod for details.
   */ getBoundsMethod() {
        return this._boundsMethod;
    }
    /**
   * Computes the bounds of the Path (or subtype when overridden). Meant to be overridden in subtypes for more
   * efficient bounds computations (but this will work as a fallback). Includes the stroked region if there is a
   * stroke applied to the Path.
   */ computeShapeBounds() {
        const shape = this.getShape();
        // boundsMethod: 'none' will return no bounds
        if (this._boundsMethod === 'none' || !shape) {
            return Bounds2.NOTHING;
        } else {
            // boundsMethod: 'unstroked', or anything without a stroke will then just use the normal shape bounds
            if (!this.hasPaintableStroke() || this._boundsMethod === 'unstroked') {
                return shape.bounds;
            } else {
                // 'accurate' will always require computing the full stroked shape, and taking its bounds
                if (this._boundsMethod === 'accurate') {
                    return shape.getStrokedBounds(this.getLineStyles());
                } else {
                    let factor;
                    // If miterLength (inside corner to outside corner) exceeds miterLimit * strokeWidth, it will get turned to
                    // a bevel, so our factor will be based just on the miterLimit.
                    if (this._boundsMethod === 'safePadding' && this.getLineJoin() === 'miter') {
                        factor = this.getMiterLimit();
                    } else if (this.getLineCap() === 'square') {
                        factor = Math.SQRT2;
                    } else {
                        factor = 1;
                    }
                    return shape.bounds.dilated(factor * this.getLineWidth() / 2);
                }
            }
        }
    }
    /**
   * Whether this Node's selfBounds are considered to be valid (always containing the displayed self content
   * of this node). Meant to be overridden in subtypes when this can change (e.g. Text).
   *
   * If this value would potentially change, please trigger the event 'selfBoundsValid'.
   */ areSelfBoundsValid() {
        if (this._boundsMethod === 'accurate' || this._boundsMethod === 'safePadding') {
            return true;
        } else if (this._boundsMethod === 'none') {
            return false;
        } else {
            return !this.hasStroke(); // 'tightPadding' and 'unstroked' options
        }
    }
    /**
   * Returns our self bounds when our rendered self is transformed by the matrix.
   */ getTransformedSelfBounds(matrix) {
        assert && assert(this.hasShape());
        return (this._stroke ? this.getStrokedShape() : this.getShape()).getBoundsWithTransform(matrix);
    }
    /**
   * Returns our safe self bounds when our rendered self is transformed by the matrix.
   */ getTransformedSafeSelfBounds(matrix) {
        return this.getTransformedSelfBounds(matrix);
    }
    /**
   * Called from (and overridden in) the Paintable trait, invalidates our current stroke, triggering recomputation of
   * anything that depended on the old stroke's value. (scenery-internal)
   */ invalidateStroke() {
        this.invalidatePath();
        this.rendererSummaryRefreshEmitter.emit(); // Stroke changing could have changed our self-bounds-validitity (unstroked/etc)
        super.invalidateStroke();
    }
    /**
   * Returns whether this Path has an associated Shape (instead of no shape, represented by null)
   */ hasShape() {
        return !!this._shape;
    }
    /**
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */ canvasPaintSelf(wrapper, matrix) {
        //TODO: Have a separate method for this, instead of touching the prototype. Can make 'this' references too easily. https://github.com/phetsims/scenery/issues/1581
        PathCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
    }
    /**
   * Creates a SVG drawable for this Path. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createSVGDrawable(renderer, instance) {
        // @ts-expect-error
        return PathSVGDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a Canvas drawable for this Path. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createCanvasDrawable(renderer, instance) {
        // @ts-expect-error
        return PathCanvasDrawable.createFromPool(renderer, instance);
    }
    /**
   * Whether this Node itself is painted (displays something itself).
   */ isPainted() {
        // Always true for Path nodes
        return true;
    }
    /**
   * Computes whether the provided point is "inside" (contained) in this Path's self content, or "outside".
   *
   * @param point - Considered to be in the local coordinate frame
   */ containsPointSelf(point) {
        let result = false;
        if (!this.hasShape()) {
            return result;
        }
        // if this node is fillPickable, we will return true if the point is inside our fill area
        if (this._fillPickable) {
            result = this.getShape().containsPoint(point);
        }
        // also include the stroked region in the hit area if strokePickable
        if (!result && this._strokePickable) {
            result = this.getStrokedShape().containsPoint(point);
        }
        return result;
    }
    /**
   * Returns a Shape that represents the area covered by containsPointSelf.
   */ getSelfShape() {
        return Shape.union([
            ...this.hasShape() && this._fillPickable ? [
                this.getShape()
            ] : [],
            ...this.hasShape() && this._strokePickable ? [
                this.getStrokedShape()
            ] : []
        ]);
    }
    /**
   * Returns whether this Path's selfBounds is intersected by the specified bounds.
   *
   * @param bounds - Bounds to test, assumed to be in the local coordinate frame.
   */ intersectsBoundsSelf(bounds) {
        // TODO: should a shape's stroke be included? https://github.com/phetsims/scenery/issues/1581
        return this._shape ? this._shape.intersectsBounds(bounds) : false;
    }
    /**
   * Returns whether we need to apply a transform workaround for https://github.com/phetsims/scenery/issues/196, which
   * only applies when we have a pattern or gradient (e.g. subtypes of Paint).
   */ requiresSVGBoundsWorkaround() {
        if (!this._stroke || !(this._stroke instanceof Paint) || !this.hasShape()) {
            return false;
        }
        const bounds = this.computeShapeBounds();
        return bounds.width * bounds.height === 0; // at least one of them was zero, so the bounding box has no area
    }
    /**
   * Override for extra information in the debugging output (from Display.getDebugHTML()). (scenery-internal)
   */ getDebugHTMLExtras() {
        return this._shape ? ` (<span style="color: #88f" onclick="window.open( 'data:text/plain;charset=utf-8,' + encodeURIComponent( '${this._shape.getSVGPath()}' ) );">path</span>)` : '';
    }
    /**
   * Disposes the path, releasing shape listeners if needed (and preventing new listeners from being added).
   */ dispose() {
        if (this._invalidShapeListenerAttached) {
            this.detachShapeListener();
        }
        this._shapeProperty.dispose();
        super.dispose();
    }
    mutate(options) {
        return super.mutate(options);
    }
    /**
   * Creates a Path with a given shape specifier (a Shape, a string in the SVG path format, or null to indicate no
   * shape).
   *
   * Path has two additional options (above what Node provides):
   * - shape: The actual Shape (or a string representing an SVG path, or null).
   * - boundsMethod: Determines how the bounds of a shape are determined.
   *
   * @param shape - The initial Shape to display. See onShapePropertyChange() for more details and documentation.
   * @param [providedOptions] - Path-specific options are documented in PATH_OPTION_KEYS above, and can be provided
   *                             along-side options for Node
   */ constructor(shape, providedOptions){
        assert && assert(providedOptions === undefined || Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on Node options object is a code smell');
        if (shape || (providedOptions == null ? void 0 : providedOptions.shape)) {
            assert && assert(!shape || !(providedOptions == null ? void 0 : providedOptions.shape), 'Do not define shape twice. Check constructor and providedOptions.');
        }
        const initPathOptions = {
            boundsMethod: DEFAULT_OPTIONS.boundsMethod
        };
        if (isTReadOnlyProperty(shape)) {
            initPathOptions.shapeProperty = shape;
        } else {
            initPathOptions.shape = shape;
        }
        // Strict omit because one WILL be defined
        const options = optionize()(initPathOptions, providedOptions);
        super();
        // We'll initialize this by mutating.
        this._shapeProperty = new TinyForwardingProperty(null, false, this.onShapePropertyChange.bind(this));
        this._shape = DEFAULT_OPTIONS.shape;
        this._strokedShape = null;
        this._boundsMethod = DEFAULT_OPTIONS.boundsMethod;
        this._invalidShapeListener = this.invalidateShape.bind(this);
        this._invalidShapeListenerAttached = false;
        this.invalidateSupportedRenderers();
        this.mutate(options);
    }
};
// Initial values for most Node mutator options
Path.DEFAULT_PATH_OPTIONS = combineOptions({}, Node.DEFAULT_NODE_OPTIONS, DEFAULT_OPTIONS);
export { Path as default };
/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ Path.prototype._mutatorKeys = [
    ...PAINTABLE_OPTION_KEYS,
    ...PATH_OPTION_KEYS,
    ...Node.prototype._mutatorKeys
];
/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */ Path.prototype.drawableMarkFlags = [
    ...Node.prototype.drawableMarkFlags,
    ...PAINTABLE_DRAWABLE_MARK_FLAGS,
    'shape'
];
scenery.register('Path', Path);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvUGF0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIFBhdGggZHJhd3MgYSBTaGFwZSB3aXRoIGEgc3BlY2lmaWMgdHlwZSBvZiBmaWxsIGFuZCBzdHJva2UuIE1peGVzIGluIFBhaW50YWJsZS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFRpbnlGb3J3YXJkaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55Rm9yd2FyZGluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5LCB7IGlzVFJlYWRPbmx5UHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBXaXRoUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1dpdGhSZXF1aXJlZC5qcyc7XG5pbXBvcnQgeyBDYW52YXNDb250ZXh0V3JhcHBlciwgQ2FudmFzU2VsZkRyYXdhYmxlLCBJbnN0YW5jZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhaW50LCBQYWludGFibGUsIFBBSU5UQUJMRV9EUkFXQUJMRV9NQVJLX0ZMQUdTLCBQQUlOVEFCTEVfT1BUSU9OX0tFWVMsIFBhaW50YWJsZU9wdGlvbnMsIFBhdGhDYW52YXNEcmF3YWJsZSwgUGF0aFNWR0RyYXdhYmxlLCBSZW5kZXJlciwgc2NlbmVyeSwgU1ZHU2VsZkRyYXdhYmxlLCBUUGF0aERyYXdhYmxlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IFBBVEhfT1BUSU9OX0tFWVMgPSBbXG4gICdib3VuZHNNZXRob2QnLFxuICAnc2hhcGUnLFxuICAnc2hhcGVQcm9wZXJ0eSdcbl07XG5cbmNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgc2hhcGU6IG51bGwsXG4gIGJvdW5kc01ldGhvZDogJ2FjY3VyYXRlJyBhcyBjb25zdFxufTtcblxuZXhwb3J0IHR5cGUgUGF0aEJvdW5kc01ldGhvZCA9ICdhY2N1cmF0ZScgfCAndW5zdHJva2VkJyB8ICd0aWdodFBhZGRpbmcnIHwgJ3NhZmVQYWRkaW5nJyB8ICdub25lJztcblxuLyoqXG4gKiBUaGUgdmFsaWQgcGFyYW1ldGVyIHR5cGVzIGFyZTpcbiAqIC0gU2hhcGU6IChmcm9tIEtpdGUpLCBub3JtYWxseSB1c2VkLlxuICogLSBzdHJpbmc6IFVzZXMgdGhlIFNWRyBQYXRoIGZvcm1hdCwgc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbCAodGhlIFBBVEggcGFydCBvZiA8cGF0aCBkPVwiUEFUSFwiLz4pLlxuICogICAgICAgICAgIFRoaXMgd2lsbCBpbW1lZGlhdGVseSBiZSBjb252ZXJ0ZWQgdG8gYSBTaGFwZSBvYmplY3Qgd2hlbiBzZXQsIGFuZCBnZXRTaGFwZSgpIG9yIGVxdWl2YWxlbnRzIHdpbGwgcmV0dXJuXG4gKiAgICAgICAgICAgdGhlIHBhcnNlZCBTaGFwZSBpbnN0YW5jZSBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbCBzdHJpbmcuIFNlZSBcIlBhcnNlZFNoYXBlXCJcbiAqIC0gbnVsbDogSW5kaWNhdGVzIHRoYXQgdGhlcmUgaXMgbm8gU2hhcGUsIGFuZCBub3RoaW5nIGlzIGRyYXduLiBVc3VhbGx5IHVzZWQgYXMgYSBwbGFjZWhvbGRlci5cbiAqXG4gKiBOT1RFOiBCZSBhd2FyZSBvZiB0aGUgcG90ZW50aWFsIGZvciBtZW1vcnkgbGVha3MuIElmIGEgU2hhcGUgaXMgbm90IG1hcmtlZCBhcyBpbW11dGFibGUgKHdpdGggbWFrZUltbXV0YWJsZSgpKSxcbiAqICAgICAgIFBhdGggd2lsbCBhZGQgYSBsaXN0ZW5lciBzbyB0aGF0IGl0IGlzIHVwZGF0ZWQgd2hlbiB0aGUgU2hhcGUgaXRzZWxmIGNoYW5nZXMuIElmIHRoZXJlIGlzIGEgbGlzdGVuZXJcbiAqICAgICAgIGFkZGVkLCBrZWVwaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBTaGFwZSB3aWxsIGFsc28ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgUGF0aCBvYmplY3QgKGFuZCB0aHVzIHdoYXRldmVyXG4gKiAgICAgICBOb2RlcyBhcmUgY29ubmVjdGVkIHRvIHRoZSBQYXRoKS4gRm9yIG5vdywgc2V0IHBhdGguc2hhcGUgPSBudWxsIGlmIHlvdSBuZWVkIHRvIHJlbGVhc2UgdGhlIHJlZmVyZW5jZVxuICogICAgICAgdGhhdCB0aGUgU2hhcGUgd291bGQgaGF2ZSwgb3IgY2FsbCBkaXNwb3NlKCkgb24gdGhlIFBhdGggaWYgaXQgaXMgbm90IG5lZWRlZCBhbnltb3JlLlxuICovXG5leHBvcnQgdHlwZSBJbnB1dFNoYXBlID0gU2hhcGUgfCBzdHJpbmcgfCBudWxsO1xuXG4vKipcbiAqIFNlZSBJbnB1dFNoYXBlIGZvciBkZXRhaWxzLCBidXQgdGhpcyB0eXBlIGRpZmZlcnMgaW4gdGhhdCBpdCBvbmx5IHN1cHBvcnRzIGEgU2hhcGUsIGFuZCBhbnkgXCJzdHJpbmdcIiBkYXRhIHdpbGxcbiAqIGJlIHBhcnNlZCBpbnRvIGEgU2hhcGUgaW5zdGFuY2UuXG4gKi9cbnR5cGUgUGFyc2VkU2hhcGUgPSBTaGFwZSB8IG51bGw7XG5cbi8vIFByb3ZpZGUgdGhlc2UgYXMgYW4gb3B0aW9uLlxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvKipcbiAgICogVGhpcyBzZXRzIHRoZSBzaGFwZSBvZiB0aGUgUGF0aCwgd2hpY2ggZGV0ZXJtaW5lcyB0aGUgc2hhcGUgb2YgaXRzIGFwcGVhcmFuY2UuIEl0IHNob3VsZCBnZW5lcmFsbHkgbm90IGJlIGNhbGxlZFxuICAgKiBvbiBQYXRoIHN1YnR5cGVzIGxpa2UgTGluZSwgUmVjdGFuZ2xlLCBldGMuIFNlZSBJbnB1dFNoYXBlIGZvciBkZXRhaWxzIGFib3V0IHdoYXQgdG8gcHJvdmlkZSBmb3IgdGhlIHNoYXBlLlxuICAgKlxuICAgKiBOT1RFOiBXaGVuIHlvdSBjcmVhdGUgYSBQYXRoIHdpdGggYSBzaGFwZSBpbiB0aGUgY29uc3RydWN0b3IsIHRoaXMgc2V0dGVyIHdpbGwgYmUgY2FsbGVkIChkb24ndCBvdmVybG9hZCB0aGUgb3B0aW9uKS5cbiAgICovXG4gIHNoYXBlPzogSW5wdXRTaGFwZTtcblxuICAvKipcbiAgICogU2ltaWxhciB0byBgc2hhcGVgLCBidXQgYWxsb3dzIHNldHRpbmcgdGhlIHNoYXBlIGFzIGEgUHJvcGVydHkuXG4gICAqL1xuICBzaGFwZVByb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8SW5wdXRTaGFwZT47XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGJvdW5kcyBtZXRob2QgZm9yIHRoZSBQYXRoLiBUaGlzIGRldGVybWluZXMgaG93IG91ciAoc2VsZikgYm91bmRzIGFyZSBjb21wdXRlZCwgYW5kIGNhbiBwYXJ0aWN1bGFybHlcbiAgICogZGV0ZXJtaW5lIGhvdyBleHBlbnNpdmUgdG8gY29tcHV0ZSBvdXIgYm91bmRzIGFyZSBpZiB3ZSBoYXZlIGEgc3Ryb2tlLlxuICAgKlxuICAgKiBUaGVyZSBhcmUgdGhlIGZvbGxvd2luZyBvcHRpb25zOlxuICAgKiAtICdhY2N1cmF0ZScgLSBBbHdheXMgdXNlcyB0aGUgbW9zdCBhY2N1cmF0ZSB3YXkgb2YgZ2V0dGluZyBib3VuZHMuIENvbXB1dGVzIHRoZSBleGFjdCBzdHJva2VkIGJvdW5kcy5cbiAgICogLSAndW5zdHJva2VkJyAtIElnbm9yZXMgYW55IHN0cm9rZSwganVzdCBnaXZlcyB0aGUgZmlsbGVkIGJvdW5kcy5cbiAgICogICAgICAgICAgICAgICAgIElmIHRoZXJlIGlzIGEgc3Ryb2tlLCB0aGUgYm91bmRzIHdpbGwgYmUgbWFya2VkIGFzIGluYWNjdXJhdGVcbiAgICogLSAndGlnaHRQYWRkaW5nJyAtIFBhZHMgdGhlIGZpbGxlZCBib3VuZHMgYnkgZW5vdWdoIHRvIGNvdmVyIGV2ZXJ5dGhpbmcgZXhjZXB0IG1pdGVyZWQgam9pbnRzLlxuICAgKiAgICAgICAgICAgICAgICAgICAgIElmIHRoZXJlIGlzIGEgc3Ryb2tlLCB0aGUgYm91bmRzIHdpbCBiZSBtYXJrZWQgYXMgaW5hY2N1cmF0ZS5cbiAgICogLSAnc2FmZVBhZGRpbmcnIC0gUGFkcyB0aGUgZmlsbGVkIGJvdW5kcyBieSBlbm91Z2ggdG8gY292ZXIgYWxsIGxpbmUgam9pbnMvY2Fwcy5cbiAgICogLSAnbm9uZScgLSBSZXR1cm5zIEJvdW5kczIuTk9USElORy4gVGhlIGJvdW5kcyB3aWxsIGJlIG1hcmtlZCBhcyBpbmFjY3VyYXRlLlxuICAgKiAgICAgICAgICAgIE5PVEU6IEl0J3MgaW1wb3J0YW50IHRvIHByb3ZpZGUgYSBsb2NhbEJvdW5kcyBvdmVycmlkZSBpZiB5b3UgdXNlIHRoaXMgb3B0aW9uLCBzbyBpdHMgYm91bmRzIGNvdmVyIHRoZVxuICAgKiAgICAgICAgICAgIFBhdGgncyBzaGFwZS4gKHBhdGgubG9jYWxCb3VuZHMgPSAuLi4pXG4gICAqL1xuICBib3VuZHNNZXRob2Q/OiBQYXRoQm91bmRzTWV0aG9kO1xufTtcbnR5cGUgUGFyZW50T3B0aW9ucyA9IFBhaW50YWJsZU9wdGlvbnMgJiBOb2RlT3B0aW9ucztcbmV4cG9ydCB0eXBlIFBhdGhPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQYXJlbnRPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoIGV4dGVuZHMgUGFpbnRhYmxlKCBOb2RlICkge1xuXG4gIC8vIFRoZSBTaGFwZSB1c2VkIGZvciBkaXNwbGF5aW5nIHRoaXMgUGF0aC5cbiAgLy8gTk9URTogX3NoYXBlIGNhbiBiZSBsYXppbHkgY29uc3RydWN0ZWQgaW4gc3VidHlwZXMgKG1heSBiZSBudWxsKSBpZiBoYXNTaGFwZSgpIGlzIG92ZXJyaWRkZW4gdG8gcmV0dXJuIHRydWUsXG4gIC8vICAgICAgIGxpa2UgaW4gUmVjdGFuZ2xlLiBUaGlzIGlzIGJlY2F1c2UgdXN1YWxseSB0aGUgYWN0dWFsIFNoYXBlIGlzIGFscmVhZHkgaW1wbGllZCBieSBvdGhlciBwYXJhbWV0ZXJzLFxuICAvLyAgICAgICBzbyBpdCBpcyBiZXN0IHRvIG5vdCBoYXZlIHRvIGNvbXB1dGUgaXQgb24gY2hhbmdlcy5cbiAgLy8gTk9URTogUGxlYXNlIHVzZSBoYXNTaGFwZSgpIHRvIGRldGVybWluZSBpZiB3ZSBhcmUgYWN0dWFsbHkgZHJhd2luZyB0aGluZ3MsIGFzIGl0IGlzIHN1YnR5cGUtc2FmZS5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfc2hhcGU6IFBhcnNlZFNoYXBlO1xuXG4gIC8vIEZvciBzaGFwZVByb3BlcnR5XG4gIHByaXZhdGUgcmVhZG9ubHkgX3NoYXBlUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8SW5wdXRTaGFwZT47XG5cbiAgLy8gVGhpcyBzdG9yZXMgYSBzdHJva2VkIGNvcHkgb2YgdGhlIFNoYXBlIHdoaWNoIGlzIGxhemlseSBjb21wdXRlZC4gVGhpcyBjYW4gYmUgcmVxdWlyZWQgZm9yIGNvbXB1dGluZyBib3VuZHNcbiAgLy8gb2YgYSBTaGFwZSB3aXRoIGEgc3Ryb2tlLlxuICBwcml2YXRlIF9zdHJva2VkU2hhcGU6IFBhcnNlZFNoYXBlO1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX2JvdW5kc01ldGhvZDogUGF0aEJvdW5kc01ldGhvZDtcblxuICAvLyBVc2VkIGFzIGEgbGlzdGVuZXIgdG8gU2hhcGVzIGZvciB3aGVuIHRoZXkgYXJlIGludmFsaWRhdGVkLiBUaGUgbGlzdGVuZXJzIGFyZSBub3QgYWRkZWQgaWYgdGhlIFNoYXBlIGlzXG4gIC8vIGltbXV0YWJsZSwgYW5kIGlmIHRoZSBTaGFwZSBiZWNvbWVzIGltbXV0YWJsZSwgdGhlbiB0aGUgbGlzdGVuZXJzIGFyZSByZW1vdmVkLlxuICBwcml2YXRlIHJlYWRvbmx5IF9pbnZhbGlkU2hhcGVMaXN0ZW5lcjogKCkgPT4gdm9pZDtcblxuICAvLyBXaGV0aGVyIG91ciBzaGFwZSBsaXN0ZW5lciBpcyBhdHRhY2hlZCB0byBhIHNoYXBlLlxuICBwcml2YXRlIF9pbnZhbGlkU2hhcGVMaXN0ZW5lckF0dGFjaGVkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgUGF0aCB3aXRoIGEgZ2l2ZW4gc2hhcGUgc3BlY2lmaWVyIChhIFNoYXBlLCBhIHN0cmluZyBpbiB0aGUgU1ZHIHBhdGggZm9ybWF0LCBvciBudWxsIHRvIGluZGljYXRlIG5vXG4gICAqIHNoYXBlKS5cbiAgICpcbiAgICogUGF0aCBoYXMgdHdvIGFkZGl0aW9uYWwgb3B0aW9ucyAoYWJvdmUgd2hhdCBOb2RlIHByb3ZpZGVzKTpcbiAgICogLSBzaGFwZTogVGhlIGFjdHVhbCBTaGFwZSAob3IgYSBzdHJpbmcgcmVwcmVzZW50aW5nIGFuIFNWRyBwYXRoLCBvciBudWxsKS5cbiAgICogLSBib3VuZHNNZXRob2Q6IERldGVybWluZXMgaG93IHRoZSBib3VuZHMgb2YgYSBzaGFwZSBhcmUgZGV0ZXJtaW5lZC5cbiAgICpcbiAgICogQHBhcmFtIHNoYXBlIC0gVGhlIGluaXRpYWwgU2hhcGUgdG8gZGlzcGxheS4gU2VlIG9uU2hhcGVQcm9wZXJ0eUNoYW5nZSgpIGZvciBtb3JlIGRldGFpbHMgYW5kIGRvY3VtZW50YXRpb24uXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXSAtIFBhdGgtc3BlY2lmaWMgb3B0aW9ucyBhcmUgZG9jdW1lbnRlZCBpbiBQQVRIX09QVElPTl9LRVlTIGFib3ZlLCBhbmQgY2FuIGJlIHByb3ZpZGVkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbG9uZy1zaWRlIG9wdGlvbnMgZm9yIE5vZGVcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2hhcGU6IElucHV0U2hhcGUgfCBUUmVhZE9ubHlQcm9wZXJ0eTxJbnB1dFNoYXBlPiwgcHJvdmlkZWRPcHRpb25zPzogUGF0aE9wdGlvbnMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvdmlkZWRPcHRpb25zID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCBwcm92aWRlZE9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gTm9kZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XG5cbiAgICBpZiAoIHNoYXBlIHx8IHByb3ZpZGVkT3B0aW9ucz8uc2hhcGUgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhc2hhcGUgfHwgIXByb3ZpZGVkT3B0aW9ucz8uc2hhcGUsICdEbyBub3QgZGVmaW5lIHNoYXBlIHR3aWNlLiBDaGVjayBjb25zdHJ1Y3RvciBhbmQgcHJvdmlkZWRPcHRpb25zLicgKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbml0UGF0aE9wdGlvbnM6IFdpdGhSZXF1aXJlZDxQYXRoT3B0aW9ucywgJ2JvdW5kc01ldGhvZCc+ID0ge1xuICAgICAgYm91bmRzTWV0aG9kOiBERUZBVUxUX09QVElPTlMuYm91bmRzTWV0aG9kXG4gICAgfTtcbiAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHNoYXBlICkgKSB7XG4gICAgICBpbml0UGF0aE9wdGlvbnMuc2hhcGVQcm9wZXJ0eSA9IHNoYXBlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGluaXRQYXRoT3B0aW9ucy5zaGFwZSA9IHNoYXBlO1xuICAgIH1cblxuICAgIC8vIFN0cmljdCBvbWl0IGJlY2F1c2Ugb25lIFdJTEwgYmUgZGVmaW5lZFxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGF0aE9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdzaGFwZScgfCAnc2hhcGVQcm9wZXJ0eSc+LCBQYXJlbnRPcHRpb25zPigpKCBpbml0UGF0aE9wdGlvbnMsIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIC8vIFdlJ2xsIGluaXRpYWxpemUgdGhpcyBieSBtdXRhdGluZy5cbiAgICB0aGlzLl9zaGFwZVByb3BlcnR5ID0gbmV3IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8SW5wdXRTaGFwZT4oIG51bGwsIGZhbHNlLCB0aGlzLm9uU2hhcGVQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICkgKTtcblxuICAgIHRoaXMuX3NoYXBlID0gREVGQVVMVF9PUFRJT05TLnNoYXBlO1xuICAgIHRoaXMuX3N0cm9rZWRTaGFwZSA9IG51bGw7XG4gICAgdGhpcy5fYm91bmRzTWV0aG9kID0gREVGQVVMVF9PUFRJT05TLmJvdW5kc01ldGhvZDtcbiAgICB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZVNoYXBlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lckF0dGFjaGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG4gIH1cblxuICBwdWJsaWMgc2V0U2hhcGUoIHNoYXBlOiBJbnB1dFNoYXBlICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNoYXBlID09PSBudWxsIHx8IHR5cGVvZiBzaGFwZSA9PT0gJ3N0cmluZycgfHwgc2hhcGUgaW5zdGFuY2VvZiBTaGFwZSxcbiAgICAgICdBIHBhdGhcXCdzIHNoYXBlIHNob3VsZCBlaXRoZXIgYmUgbnVsbCwgYSBzdHJpbmcsIG9yIGEgU2hhcGUnICk7XG5cbiAgICB0aGlzLl9zaGFwZVByb3BlcnR5LnZhbHVlID0gc2hhcGU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgc2hhcGUoIHZhbHVlOiBJbnB1dFNoYXBlICkgeyB0aGlzLnNldFNoYXBlKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBzaGFwZSgpOiBQYXJzZWRTaGFwZSB7IHJldHVybiB0aGlzLmdldFNoYXBlKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2hhcGUgdGhhdCB3YXMgc2V0IGZvciB0aGlzIFBhdGggKG9yIGZvciBzdWJ0eXBlcyBsaWtlIExpbmUgYW5kIFJlY3RhbmdsZSwgd2lsbCByZXR1cm4gYW4gaW1tdXRhYmxlXG4gICAqIFNoYXBlIHRoYXQgaXMgZXF1aXZhbGVudCBpbiBhcHBlYXJhbmNlKS5cbiAgICpcbiAgICogSXQgaXMgYmVzdCB0byBnZW5lcmFsbHkgYXNzdW1lIG1vZGlmaWNhdGlvbnMgdG8gdGhlIFNoYXBlIHJldHVybmVkIGlzIG5vdCBzdXBwb3J0ZWQuIElmIHRoZXJlIGlzIG5vIHNoYXBlXG4gICAqIGN1cnJlbnRseSwgbnVsbCB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgcHVibGljIGdldFNoYXBlKCk6IFBhcnNlZFNoYXBlIHtcbiAgICByZXR1cm4gdGhpcy5fc2hhcGU7XG4gIH1cblxuICBwcml2YXRlIG9uU2hhcGVQcm9wZXJ0eUNoYW5nZSggc2hhcGU6IElucHV0U2hhcGUgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2hhcGUgPT09IG51bGwgfHwgdHlwZW9mIHNoYXBlID09PSAnc3RyaW5nJyB8fCBzaGFwZSBpbnN0YW5jZW9mIFNoYXBlLFxuICAgICAgJ0EgcGF0aFxcJ3Mgc2hhcGUgc2hvdWxkIGVpdGhlciBiZSBudWxsLCBhIHN0cmluZywgb3IgYSBTaGFwZScgKTtcblxuICAgIGlmICggdGhpcy5fc2hhcGUgIT09IHNoYXBlICkge1xuICAgICAgLy8gUmVtb3ZlIFNoYXBlIGludmFsaWRhdGlvbiBsaXN0ZW5lciBpZiBhcHBsaWNhYmxlXG4gICAgICBpZiAoIHRoaXMuX2ludmFsaWRTaGFwZUxpc3RlbmVyQXR0YWNoZWQgKSB7XG4gICAgICAgIHRoaXMuZGV0YWNoU2hhcGVMaXN0ZW5lcigpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIHR5cGVvZiBzaGFwZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgIC8vIGJlIGNvbnRlbnQgd2l0aCBvblNoYXBlUHJvcGVydHlDaGFuZ2UgYWx3YXlzIGludmFsaWRhdGluZyB0aGUgc2hhcGU/XG4gICAgICAgIHNoYXBlID0gbmV3IFNoYXBlKCBzaGFwZSApO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2hhcGUgPSBzaGFwZTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVNoYXBlKCk7XG5cbiAgICAgIC8vIEFkZCBTaGFwZSBpbnZhbGlkYXRpb24gbGlzdGVuZXIgaWYgYXBwbGljYWJsZVxuICAgICAgaWYgKCB0aGlzLl9zaGFwZSAmJiAhdGhpcy5fc2hhcGUuaXNJbW11dGFibGUoKSApIHtcbiAgICAgICAgdGhpcy5hdHRhY2hTaGFwZUxpc3RlbmVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBkb2N1bWVudGF0aW9uIGZvciBOb2RlLnNldFZpc2libGVQcm9wZXJ0eSwgZXhjZXB0IHRoaXMgaXMgZm9yIHRoZSBzaGFwZVxuICAgKi9cbiAgcHVibGljIHNldFNoYXBlUHJvcGVydHkoIG5ld1RhcmdldDogVFJlYWRPbmx5UHJvcGVydHk8SW5wdXRTaGFwZT4gfCBudWxsICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLl9zaGFwZVByb3BlcnR5LnNldFRhcmdldFByb3BlcnR5KCBuZXdUYXJnZXQgYXMgVFByb3BlcnR5PElucHV0U2hhcGU+ICk7XG4gIH1cblxuICBwdWJsaWMgc2V0IHNoYXBlUHJvcGVydHkoIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxJbnB1dFNoYXBlPiB8IG51bGwgKSB7IHRoaXMuc2V0U2hhcGVQcm9wZXJ0eSggcHJvcGVydHkgKTsgfVxuXG4gIHB1YmxpYyBnZXQgc2hhcGVQcm9wZXJ0eSgpOiBUUHJvcGVydHk8SW5wdXRTaGFwZT4geyByZXR1cm4gdGhpcy5nZXRTaGFwZVByb3BlcnR5KCk7IH1cblxuICAvKipcbiAgICogTGlrZSBOb2RlLmdldFZpc2libGVQcm9wZXJ0eSgpLCBidXQgZm9yIHRoZSBzaGFwZS4gTm90ZSB0aGlzIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgUHJvcGVydHkgcHJvdmlkZWQgaW5cbiAgICogc2V0U2hhcGVQcm9wZXJ0eS4gVGh1cyBpcyB0aGUgbmF0dXJlIG9mIFRpbnlGb3J3YXJkaW5nUHJvcGVydHkuXG4gICAqL1xuICBwdWJsaWMgZ2V0U2hhcGVQcm9wZXJ0eSgpOiBUUHJvcGVydHk8SW5wdXRTaGFwZT4ge1xuICAgIHJldHVybiB0aGlzLl9zaGFwZVByb3BlcnR5O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsYXppbHktY3JlYXRlZCBTaGFwZSB0aGF0IGhhcyB0aGUgYXBwZWFyYW5jZSBvZiB0aGUgUGF0aCdzIHNoYXBlIGJ1dCBzdHJva2VkIHVzaW5nIHRoZSBjdXJyZW50XG4gICAqIHN0cm9rZSBzdHlsZSBvZiB0aGUgUGF0aC5cbiAgICpcbiAgICogTk9URTogSXQgaXMgaW52YWxpZCB0byBjYWxsIHRoaXMgb24gYSBQYXRoIHRoYXQgZG9lcyBub3QgY3VycmVudGx5IGhhdmUgYSBTaGFwZSAodXN1YWxseSBhIFBhdGggd2hlcmVcbiAgICogICAgICAgdGhlIHNoYXBlIGlzIHNldCB0byBudWxsKS5cbiAgICovXG4gIHB1YmxpYyBnZXRTdHJva2VkU2hhcGUoKTogU2hhcGUge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaGFzU2hhcGUoKSwgJ1dlIGNhbm5vdCBzdHJva2UgYSBub24tZXhpc3Rpbmcgc2hhcGUnICk7XG5cbiAgICAvLyBMYXppbHkgY29tcHV0ZSB0aGUgc3Ryb2tlZCBzaGFwZS4gSXQgc2hvdWxkIGJlIHNldCB0byBudWxsIHdoZW4gd2UgbmVlZCB0byByZWNvbXB1dGUgaXRcbiAgICBpZiAoICF0aGlzLl9zdHJva2VkU2hhcGUgKSB7XG4gICAgICB0aGlzLl9zdHJva2VkU2hhcGUgPSB0aGlzLmdldFNoYXBlKCkhLmdldFN0cm9rZWRTaGFwZSggdGhpcy5fbGluZURyYXdpbmdTdHlsZXMgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc3Ryb2tlZFNoYXBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiaXRtYXNrIHJlcHJlc2VudGluZyB0aGUgc3VwcG9ydGVkIHJlbmRlcmVycyBmb3IgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBvZiB0aGUgUGF0aCBvciBzdWJ0eXBlLlxuICAgKlxuICAgKiBTaG91bGQgYmUgb3ZlcnJpZGRlbiBieSBzdWJ0eXBlcyB0byBlaXRoZXIgZXh0ZW5kIG9yIHJlc3RyaWN0IHJlbmRlcmVycywgZGVwZW5kaW5nIG9uIHdoYXQgcmVuZGVyZXJzIGFyZVxuICAgKiBzdXBwb3J0ZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIC0gQSBiaXRtYXNrIHRoYXQgaW5jbHVkZXMgc3VwcG9ydGVkIHJlbmRlcmVycywgc2VlIFJlbmRlcmVyIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldFBhdGhSZW5kZXJlckJpdG1hc2soKTogbnVtYmVyIHtcbiAgICAvLyBCeSBkZWZhdWx0LCBDYW52YXMgYW5kIFNWRyBhcmUgYWNjZXB0ZWQuXG4gICAgcmV0dXJuIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgfCBSZW5kZXJlci5iaXRtYXNrU1ZHO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgY2hlY2sgYW5kIHVwZGF0ZSBmb3Igd2hhdCByZW5kZXJlcnMgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBvZiB0aGlzIFBhdGggb3Igc3VidHlwZSBzdXBwb3J0cy5cbiAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIHdoZW5ldmVyIHNvbWV0aGluZyB0aGF0IGNvdWxkIHBvdGVudGlhbGx5IGNoYW5nZSBzdXBwb3J0ZWQgcmVuZGVyZXJzIGhhcHBlbiAod2hpY2ggY2FuXG4gICAqIGJlIHRoZSBzaGFwZSwgcHJvcGVydGllcyBvZiB0aGUgc3Ryb2tlcyBvciBmaWxscywgZXRjLilcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBpbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0UmVuZGVyZXJCaXRtYXNrKCB0aGlzLmdldEZpbGxSZW5kZXJlckJpdG1hc2soKSAmIHRoaXMuZ2V0U3Ryb2tlUmVuZGVyZXJCaXRtYXNrKCkgJiB0aGlzLmdldFBhdGhSZW5kZXJlckJpdG1hc2soKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHRoZSBQYXRoIHRoYXQgdGhlIFNoYXBlIGhhcyBjaGFuZ2VkIChlaXRoZXIgdGhlIFNoYXBlIGl0c2VsZiBoYXMgYmUgbXV0YXRlZCwgYSBuZXcgU2hhcGUgaGFzIGJlZW5cbiAgICogcHJvdmlkZWQpLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIHNob3VsZCBub3QgYmUgY2FsbGVkIG9uIHN1YnR5cGVzIG9mIFBhdGggYWZ0ZXIgdGhleSBoYXZlIGJlZW4gY29uc3RydWN0ZWQsIGxpa2UgTGluZSwgUmVjdGFuZ2xlLCBldGMuXG4gICAqL1xuICBwcml2YXRlIGludmFsaWRhdGVTaGFwZSgpOiB2b2lkIHtcbiAgICB0aGlzLmludmFsaWRhdGVQYXRoKCk7XG5cbiAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcbiAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGF0aERyYXdhYmxlICkubWFya0RpcnR5U2hhcGUoKTsgLy8gc3VidHlwZXMgb2YgUGF0aCBtYXkgbm90IGhhdmUgdGhpcywgYnV0IGl0J3MgY2FsbGVkIGR1cmluZyBjb25zdHJ1Y3Rpb25cbiAgICB9XG5cbiAgICAvLyBEaXNjb25uZWN0IG91ciBTaGFwZSBsaXN0ZW5lciBpZiBvdXIgU2hhcGUgaGFzIGJlY29tZSBpbW11dGFibGUuXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzI3MCNpc3N1ZWNvbW1lbnQtMjUwMjY2MTc0XG4gICAgaWYgKCB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lckF0dGFjaGVkICYmIHRoaXMuX3NoYXBlICYmIHRoaXMuX3NoYXBlLmlzSW1tdXRhYmxlKCkgKSB7XG4gICAgICB0aGlzLmRldGFjaFNoYXBlTGlzdGVuZXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW52YWxpZGF0ZXMgdGhlIG5vZGUncyBzZWxmLWJvdW5kcyBhbmQgYW55IG90aGVyIHJlY29yZGVkIG1ldGFkYXRhIGFib3V0IHRoZSBvdXRsaW5lIG9yIGJvdW5kcyBvZiB0aGUgU2hhcGUuXG4gICAqXG4gICAqIFRoaXMgaXMgbWVhbnQgdG8gYmUgdXNlZCBmb3IgYWxsIFBhdGggc3VidHlwZXMgKHVubGlrZSBpbnZhbGlkYXRlU2hhcGUpLlxuICAgKi9cbiAgcHJvdGVjdGVkIGludmFsaWRhdGVQYXRoKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0cm9rZWRTaGFwZSA9IG51bGw7XG5cbiAgICB0aGlzLmludmFsaWRhdGVTZWxmKCk7IC8vIFdlIGRvbid0IGltbWVkaWF0ZWx5IGNvbXB1dGUgdGhlIGJvdW5kc1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGEgbGlzdGVuZXIgdG8gb3VyIFNoYXBlIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbmV2ZXIgdGhlIFNoYXBlIGNoYW5nZXMuXG4gICAqL1xuICBwcml2YXRlIGF0dGFjaFNoYXBlTGlzdGVuZXIoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuX2ludmFsaWRTaGFwZUxpc3RlbmVyQXR0YWNoZWQsICdXZSBkbyBub3Qgd2FudCB0byBoYXZlIHR3byBsaXN0ZW5lcnMgYXR0YWNoZWQhJyApO1xuXG4gICAgLy8gRG8gbm90IGF0dGFjaCBzaGFwZSBsaXN0ZW5lcnMgaWYgd2UgYXJlIGRpc3Bvc2VkXG4gICAgaWYgKCAhdGhpcy5pc0Rpc3Bvc2VkICkge1xuICAgICAgdGhpcy5fc2hhcGUhLmludmFsaWRhdGVkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5faW52YWxpZFNoYXBlTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuX2ludmFsaWRTaGFwZUxpc3RlbmVyQXR0YWNoZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRhY2hlcyBhIHByZXZpb3VzbHktYXR0YWNoZWQgbGlzdGVuZXIgYWRkZWQgdG8gb3VyIFNoYXBlIChzZWUgYXR0YWNoU2hhcGVMaXN0ZW5lcikuXG4gICAqL1xuICBwcml2YXRlIGRldGFjaFNoYXBlTGlzdGVuZXIoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5faW52YWxpZFNoYXBlTGlzdGVuZXJBdHRhY2hlZCwgJ1dlIGNhbm5vdCBkZXRhY2ggYW4gdW5hdHRhY2hlZCBsaXN0ZW5lcicgKTtcblxuICAgIHRoaXMuX3NoYXBlIS5pbnZhbGlkYXRlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX2ludmFsaWRTaGFwZUxpc3RlbmVyICk7XG4gICAgdGhpcy5faW52YWxpZFNoYXBlTGlzdGVuZXJBdHRhY2hlZCA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIGEgbW9yZSBlZmZpY2llbnQgc2VsZkJvdW5kcyBmb3Igb3VyIFBhdGguXG4gICAqXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGUgc2VsZiBib3VuZHMgY2hhbmdlZC5cbiAgICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSB1cGRhdGVTZWxmQm91bmRzKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNlbGZCb3VuZHMgPSB0aGlzLmhhc1NoYXBlKCkgPyB0aGlzLmNvbXB1dGVTaGFwZUJvdW5kcygpIDogQm91bmRzMi5OT1RISU5HO1xuICAgIGNvbnN0IGNoYW5nZWQgPSAhc2VsZkJvdW5kcy5lcXVhbHMoIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZSApO1xuICAgIGlmICggY2hhbmdlZCApIHtcbiAgICAgIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZS5zZXQoIHNlbGZCb3VuZHMgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICBwdWJsaWMgc2V0Qm91bmRzTWV0aG9kKCBib3VuZHNNZXRob2Q6IFBhdGhCb3VuZHNNZXRob2QgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYm91bmRzTWV0aG9kID09PSAnYWNjdXJhdGUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgYm91bmRzTWV0aG9kID09PSAndW5zdHJva2VkJyB8fFxuICAgICAgICAgICAgICAgICAgICAgIGJvdW5kc01ldGhvZCA9PT0gJ3RpZ2h0UGFkZGluZycgfHxcbiAgICAgICAgICAgICAgICAgICAgICBib3VuZHNNZXRob2QgPT09ICdzYWZlUGFkZGluZycgfHxcbiAgICAgICAgICAgICAgICAgICAgICBib3VuZHNNZXRob2QgPT09ICdub25lJyApO1xuICAgIGlmICggdGhpcy5fYm91bmRzTWV0aG9kICE9PSBib3VuZHNNZXRob2QgKSB7XG4gICAgICB0aGlzLl9ib3VuZHNNZXRob2QgPSBib3VuZHNNZXRob2Q7XG4gICAgICB0aGlzLmludmFsaWRhdGVQYXRoKCk7XG5cbiAgICAgIHRoaXMucmVuZGVyZXJTdW1tYXJ5UmVmcmVzaEVtaXR0ZXIuZW1pdCgpOyAvLyB3aGV0aGVyIG91ciBzZWxmIGJvdW5kcyBhcmUgdmFsaWQgbWF5IGhhdmUgY2hhbmdlZFxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYm91bmRzTWV0aG9kKCB2YWx1ZTogUGF0aEJvdW5kc01ldGhvZCApIHsgdGhpcy5zZXRCb3VuZHNNZXRob2QoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGJvdW5kc01ldGhvZCgpOiBQYXRoQm91bmRzTWV0aG9kIHsgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzTWV0aG9kKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBib3VuZHMgbWV0aG9kLiBTZWUgc2V0Qm91bmRzTWV0aG9kIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgcHVibGljIGdldEJvdW5kc01ldGhvZCgpOiBQYXRoQm91bmRzTWV0aG9kIHtcbiAgICByZXR1cm4gdGhpcy5fYm91bmRzTWV0aG9kO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBib3VuZHMgb2YgdGhlIFBhdGggKG9yIHN1YnR5cGUgd2hlbiBvdmVycmlkZGVuKS4gTWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJ0eXBlcyBmb3IgbW9yZVxuICAgKiBlZmZpY2llbnQgYm91bmRzIGNvbXB1dGF0aW9ucyAoYnV0IHRoaXMgd2lsbCB3b3JrIGFzIGEgZmFsbGJhY2spLiBJbmNsdWRlcyB0aGUgc3Ryb2tlZCByZWdpb24gaWYgdGhlcmUgaXMgYVxuICAgKiBzdHJva2UgYXBwbGllZCB0byB0aGUgUGF0aC5cbiAgICovXG4gIHB1YmxpYyBjb21wdXRlU2hhcGVCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgY29uc3Qgc2hhcGUgPSB0aGlzLmdldFNoYXBlKCk7XG4gICAgLy8gYm91bmRzTWV0aG9kOiAnbm9uZScgd2lsbCByZXR1cm4gbm8gYm91bmRzXG4gICAgaWYgKCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdub25lJyB8fCAhc2hhcGUgKSB7XG4gICAgICByZXR1cm4gQm91bmRzMi5OT1RISU5HO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGJvdW5kc01ldGhvZDogJ3Vuc3Ryb2tlZCcsIG9yIGFueXRoaW5nIHdpdGhvdXQgYSBzdHJva2Ugd2lsbCB0aGVuIGp1c3QgdXNlIHRoZSBub3JtYWwgc2hhcGUgYm91bmRzXG4gICAgICBpZiAoICF0aGlzLmhhc1BhaW50YWJsZVN0cm9rZSgpIHx8IHRoaXMuX2JvdW5kc01ldGhvZCA9PT0gJ3Vuc3Ryb2tlZCcgKSB7XG4gICAgICAgIHJldHVybiBzaGFwZS5ib3VuZHM7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gJ2FjY3VyYXRlJyB3aWxsIGFsd2F5cyByZXF1aXJlIGNvbXB1dGluZyB0aGUgZnVsbCBzdHJva2VkIHNoYXBlLCBhbmQgdGFraW5nIGl0cyBib3VuZHNcbiAgICAgICAgaWYgKCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdhY2N1cmF0ZScgKSB7XG4gICAgICAgICAgcmV0dXJuIHNoYXBlLmdldFN0cm9rZWRCb3VuZHMoIHRoaXMuZ2V0TGluZVN0eWxlcygpICk7XG4gICAgICAgIH1cbiAgICAgICAgICAvLyBPdGhlcndpc2Ugd2UgY29tcHV0ZSBib3VuZHMgYmFzZWQgb24gJ3RpZ2h0UGFkZGluZycgYW5kICdzYWZlUGFkZGluZycsIHRoZSBvbmUgZGlmZmVyZW5jZSBiZWluZyB0aGF0XG4gICAgICAgICAgLy8gJ3NhZmVQYWRkaW5nJyB3aWxsIGluY2x1ZGUgd2hhdGV2ZXIgYm91bmRzIG5lY2Vzc2FyeSB0byBpbmNsdWRlIG1pdGVycy4gU3F1YXJlIGxpbmUtY2FwIHJlcXVpcmVzIGFcbiAgICAgICAgLy8gc2xpZ2h0bHkgZXh0ZW5kZWQgYm91bmRzIGluIGVpdGhlciBjYXNlLlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgZmFjdG9yO1xuICAgICAgICAgIC8vIElmIG1pdGVyTGVuZ3RoIChpbnNpZGUgY29ybmVyIHRvIG91dHNpZGUgY29ybmVyKSBleGNlZWRzIG1pdGVyTGltaXQgKiBzdHJva2VXaWR0aCwgaXQgd2lsbCBnZXQgdHVybmVkIHRvXG4gICAgICAgICAgLy8gYSBiZXZlbCwgc28gb3VyIGZhY3RvciB3aWxsIGJlIGJhc2VkIGp1c3Qgb24gdGhlIG1pdGVyTGltaXQuXG4gICAgICAgICAgaWYgKCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdzYWZlUGFkZGluZycgJiYgdGhpcy5nZXRMaW5lSm9pbigpID09PSAnbWl0ZXInICkge1xuICAgICAgICAgICAgZmFjdG9yID0gdGhpcy5nZXRNaXRlckxpbWl0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCB0aGlzLmdldExpbmVDYXAoKSA9PT0gJ3NxdWFyZScgKSB7XG4gICAgICAgICAgICBmYWN0b3IgPSBNYXRoLlNRUlQyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZhY3RvciA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBzaGFwZS5ib3VuZHMuZGlsYXRlZCggZmFjdG9yICogdGhpcy5nZXRMaW5lV2lkdGgoKSAvIDIgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgTm9kZSdzIHNlbGZCb3VuZHMgYXJlIGNvbnNpZGVyZWQgdG8gYmUgdmFsaWQgKGFsd2F5cyBjb250YWluaW5nIHRoZSBkaXNwbGF5ZWQgc2VsZiBjb250ZW50XG4gICAqIG9mIHRoaXMgbm9kZSkuIE1lYW50IHRvIGJlIG92ZXJyaWRkZW4gaW4gc3VidHlwZXMgd2hlbiB0aGlzIGNhbiBjaGFuZ2UgKGUuZy4gVGV4dCkuXG4gICAqXG4gICAqIElmIHRoaXMgdmFsdWUgd291bGQgcG90ZW50aWFsbHkgY2hhbmdlLCBwbGVhc2UgdHJpZ2dlciB0aGUgZXZlbnQgJ3NlbGZCb3VuZHNWYWxpZCcuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgYXJlU2VsZkJvdW5kc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIGlmICggdGhpcy5fYm91bmRzTWV0aG9kID09PSAnYWNjdXJhdGUnIHx8IHRoaXMuX2JvdW5kc01ldGhvZCA9PT0gJ3NhZmVQYWRkaW5nJyApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fYm91bmRzTWV0aG9kID09PSAnbm9uZScgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuICF0aGlzLmhhc1N0cm9rZSgpOyAvLyAndGlnaHRQYWRkaW5nJyBhbmQgJ3Vuc3Ryb2tlZCcgb3B0aW9uc1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG91ciBzZWxmIGJvdW5kcyB3aGVuIG91ciByZW5kZXJlZCBzZWxmIGlzIHRyYW5zZm9ybWVkIGJ5IHRoZSBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0VHJhbnNmb3JtZWRTZWxmQm91bmRzKCBtYXRyaXg6IE1hdHJpeDMgKTogQm91bmRzMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNTaGFwZSgpICk7XG5cbiAgICByZXR1cm4gKCB0aGlzLl9zdHJva2UgPyB0aGlzLmdldFN0cm9rZWRTaGFwZSgpIDogdGhpcy5nZXRTaGFwZSgpICkhLmdldEJvdW5kc1dpdGhUcmFuc2Zvcm0oIG1hdHJpeCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgb3VyIHNhZmUgc2VsZiBib3VuZHMgd2hlbiBvdXIgcmVuZGVyZWQgc2VsZiBpcyB0cmFuc2Zvcm1lZCBieSB0aGUgbWF0cml4LlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGdldFRyYW5zZm9ybWVkU2FmZVNlbGZCb3VuZHMoIG1hdHJpeDogTWF0cml4MyApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUcmFuc2Zvcm1lZFNlbGZCb3VuZHMoIG1hdHJpeCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBmcm9tIChhbmQgb3ZlcnJpZGRlbiBpbikgdGhlIFBhaW50YWJsZSB0cmFpdCwgaW52YWxpZGF0ZXMgb3VyIGN1cnJlbnQgc3Ryb2tlLCB0cmlnZ2VyaW5nIHJlY29tcHV0YXRpb24gb2ZcbiAgICogYW55dGhpbmcgdGhhdCBkZXBlbmRlZCBvbiB0aGUgb2xkIHN0cm9rZSdzIHZhbHVlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBpbnZhbGlkYXRlU3Ryb2tlKCk6IHZvaWQge1xuICAgIHRoaXMuaW52YWxpZGF0ZVBhdGgoKTtcblxuICAgIHRoaXMucmVuZGVyZXJTdW1tYXJ5UmVmcmVzaEVtaXR0ZXIuZW1pdCgpOyAvLyBTdHJva2UgY2hhbmdpbmcgY291bGQgaGF2ZSBjaGFuZ2VkIG91ciBzZWxmLWJvdW5kcy12YWxpZGl0aXR5ICh1bnN0cm9rZWQvZXRjKVxuXG4gICAgc3VwZXIuaW52YWxpZGF0ZVN0cm9rZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIFBhdGggaGFzIGFuIGFzc29jaWF0ZWQgU2hhcGUgKGluc3RlYWQgb2Ygbm8gc2hhcGUsIHJlcHJlc2VudGVkIGJ5IG51bGwpXG4gICAqL1xuICBwdWJsaWMgaGFzU2hhcGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5fc2hhcGU7XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgdGhlIGN1cnJlbnQgTm9kZSdzIHNlbGYgcmVwcmVzZW50YXRpb24sIGFzc3VtaW5nIHRoZSB3cmFwcGVyJ3MgQ2FudmFzIGNvbnRleHQgaXMgYWxyZWFkeSBpbiB0aGUgbG9jYWxcbiAgICogY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGlzIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB3cmFwcGVyXG4gICAqIEBwYXJhbSBtYXRyaXggLSBUaGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGFscmVhZHkgYXBwbGllZCB0byB0aGUgY29udGV4dC5cbiAgICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSBjYW52YXNQYWludFNlbGYoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyLCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XG4gICAgLy9UT0RPOiBIYXZlIGEgc2VwYXJhdGUgbWV0aG9kIGZvciB0aGlzLCBpbnN0ZWFkIG9mIHRvdWNoaW5nIHRoZSBwcm90b3R5cGUuIENhbiBtYWtlICd0aGlzJyByZWZlcmVuY2VzIHRvbyBlYXNpbHkuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgUGF0aENhbnZhc0RyYXdhYmxlLnByb3RvdHlwZS5wYWludENhbnZhcyggd3JhcHBlciwgdGhpcywgbWF0cml4ICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIFNWRyBkcmF3YWJsZSBmb3IgdGhpcyBQYXRoLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVNWR0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogU1ZHU2VsZkRyYXdhYmxlIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgcmV0dXJuIFBhdGhTVkdEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIENhbnZhcyBkcmF3YWJsZSBmb3IgdGhpcyBQYXRoLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZUNhbnZhc0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogQ2FudmFzU2VsZkRyYXdhYmxlIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgcmV0dXJuIFBhdGhDYW52YXNEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIE5vZGUgaXRzZWxmIGlzIHBhaW50ZWQgKGRpc3BsYXlzIHNvbWV0aGluZyBpdHNlbGYpLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGlzUGFpbnRlZCgpOiBib29sZWFuIHtcbiAgICAvLyBBbHdheXMgdHJ1ZSBmb3IgUGF0aCBub2Rlc1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHBvaW50IGlzIFwiaW5zaWRlXCIgKGNvbnRhaW5lZCkgaW4gdGhpcyBQYXRoJ3Mgc2VsZiBjb250ZW50LCBvciBcIm91dHNpZGVcIi5cbiAgICpcbiAgICogQHBhcmFtIHBvaW50IC0gQ29uc2lkZXJlZCB0byBiZSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNvbnRhaW5zUG9pbnRTZWxmKCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcbiAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKCAhdGhpcy5oYXNTaGFwZSgpICkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBpZiB0aGlzIG5vZGUgaXMgZmlsbFBpY2thYmxlLCB3ZSB3aWxsIHJldHVybiB0cnVlIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgb3VyIGZpbGwgYXJlYVxuICAgIGlmICggdGhpcy5fZmlsbFBpY2thYmxlICkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXRTaGFwZSgpIS5jb250YWluc1BvaW50KCBwb2ludCApO1xuICAgIH1cblxuICAgIC8vIGFsc28gaW5jbHVkZSB0aGUgc3Ryb2tlZCByZWdpb24gaW4gdGhlIGhpdCBhcmVhIGlmIHN0cm9rZVBpY2thYmxlXG4gICAgaWYgKCAhcmVzdWx0ICYmIHRoaXMuX3N0cm9rZVBpY2thYmxlICkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXRTdHJva2VkU2hhcGUoKS5jb250YWluc1BvaW50KCBwb2ludCApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBTaGFwZSB0aGF0IHJlcHJlc2VudHMgdGhlIGFyZWEgY292ZXJlZCBieSBjb250YWluc1BvaW50U2VsZi5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRTZWxmU2hhcGUoKTogU2hhcGUge1xuICAgIHJldHVybiBTaGFwZS51bmlvbiggW1xuICAgICAgLi4uKCAoIHRoaXMuaGFzU2hhcGUoKSAmJiB0aGlzLl9maWxsUGlja2FibGUgKSA/IFsgdGhpcy5nZXRTaGFwZSgpISBdIDogW10gKSxcbiAgICAgIC4uLiggKCB0aGlzLmhhc1NoYXBlKCkgJiYgdGhpcy5fc3Ryb2tlUGlja2FibGUgKSA/IFsgdGhpcy5nZXRTdHJva2VkU2hhcGUoKSBdIDogW10gKVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBQYXRoJ3Mgc2VsZkJvdW5kcyBpcyBpbnRlcnNlY3RlZCBieSB0aGUgc3BlY2lmaWVkIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIGJvdW5kcyAtIEJvdW5kcyB0byB0ZXN0LCBhc3N1bWVkIHRvIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGludGVyc2VjdHNCb3VuZHNTZWxmKCBib3VuZHM6IEJvdW5kczIgKTogYm9vbGVhbiB7XG4gICAgLy8gVE9ETzogc2hvdWxkIGEgc2hhcGUncyBzdHJva2UgYmUgaW5jbHVkZWQ/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgcmV0dXJuIHRoaXMuX3NoYXBlID8gdGhpcy5fc2hhcGUuaW50ZXJzZWN0c0JvdW5kcyggYm91bmRzICkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgd2UgbmVlZCB0byBhcHBseSBhIHRyYW5zZm9ybSB3b3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTk2LCB3aGljaFxuICAgKiBvbmx5IGFwcGxpZXMgd2hlbiB3ZSBoYXZlIGEgcGF0dGVybiBvciBncmFkaWVudCAoZS5nLiBzdWJ0eXBlcyBvZiBQYWludCkuXG4gICAqL1xuICBwcml2YXRlIHJlcXVpcmVzU1ZHQm91bmRzV29ya2Fyb3VuZCgpOiBib29sZWFuIHtcbiAgICBpZiAoICF0aGlzLl9zdHJva2UgfHwgISggdGhpcy5fc3Ryb2tlIGluc3RhbmNlb2YgUGFpbnQgKSB8fCAhdGhpcy5oYXNTaGFwZSgpICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGJvdW5kcyA9IHRoaXMuY29tcHV0ZVNoYXBlQm91bmRzKCk7XG4gICAgcmV0dXJuICggYm91bmRzLndpZHRoICogYm91bmRzLmhlaWdodCApID09PSAwOyAvLyBhdCBsZWFzdCBvbmUgb2YgdGhlbSB3YXMgemVybywgc28gdGhlIGJvdW5kaW5nIGJveCBoYXMgbm8gYXJlYVxuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlIGZvciBleHRyYSBpbmZvcm1hdGlvbiBpbiB0aGUgZGVidWdnaW5nIG91dHB1dCAoZnJvbSBEaXNwbGF5LmdldERlYnVnSFRNTCgpKS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0RGVidWdIVE1MRXh0cmFzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3NoYXBlID8gYCAoPHNwYW4gc3R5bGU9XCJjb2xvcjogIzg4ZlwiIG9uY2xpY2s9XCJ3aW5kb3cub3BlbiggJ2RhdGE6dGV4dC9wbGFpbjtjaGFyc2V0PXV0Zi04LCcgKyBlbmNvZGVVUklDb21wb25lbnQoICcke3RoaXMuX3NoYXBlLmdldFNWR1BhdGgoKX0nICkgKTtcIj5wYXRoPC9zcGFuPilgIDogJyc7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIHBhdGgsIHJlbGVhc2luZyBzaGFwZSBsaXN0ZW5lcnMgaWYgbmVlZGVkIChhbmQgcHJldmVudGluZyBuZXcgbGlzdGVuZXJzIGZyb20gYmVpbmcgYWRkZWQpLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lckF0dGFjaGVkICkge1xuICAgICAgdGhpcy5kZXRhY2hTaGFwZUxpc3RlbmVyKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2hhcGVQcm9wZXJ0eS5kaXNwb3NlKCk7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogUGF0aE9wdGlvbnMgKTogdGhpcyB7XG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cbiAgLy8gSW5pdGlhbCB2YWx1ZXMgZm9yIG1vc3QgTm9kZSBtdXRhdG9yIG9wdGlvbnNcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERUZBVUxUX1BBVEhfT1BUSU9OUyA9IGNvbWJpbmVPcHRpb25zPFBhdGhPcHRpb25zPigge30sIE5vZGUuREVGQVVMVF9OT0RFX09QVElPTlMsIERFRkFVTFRfT1BUSU9OUyApO1xufVxuXG4vKipcbiAqIHtBcnJheS48c3RyaW5nPn0gLSBTdHJpbmcga2V5cyBmb3IgYWxsIG9mIHRoZSBhbGxvd2VkIG9wdGlvbnMgdGhhdCB3aWxsIGJlIHNldCBieSBub2RlLm11dGF0ZSggb3B0aW9ucyApLCBpbiB0aGVcbiAqIG9yZGVyIHRoZXkgd2lsbCBiZSBldmFsdWF0ZWQgaW4uXG4gKlxuICogTk9URTogU2VlIE5vZGUncyBfbXV0YXRvcktleXMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdGhpcyBvcGVyYXRlcywgYW5kIHBvdGVudGlhbCBzcGVjaWFsXG4gKiAgICAgICBjYXNlcyB0aGF0IG1heSBhcHBseS5cbiAqL1xuUGF0aC5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gWyAuLi5QQUlOVEFCTEVfT1BUSU9OX0tFWVMsIC4uLlBBVEhfT1BUSU9OX0tFWVMsIC4uLk5vZGUucHJvdG90eXBlLl9tdXRhdG9yS2V5cyBdO1xuXG4vKipcbiAqIHtBcnJheS48U3RyaW5nPn0gLSBMaXN0IG9mIGFsbCBkaXJ0eSBmbGFncyB0aGF0IHNob3VsZCBiZSBhdmFpbGFibGUgb24gZHJhd2FibGVzIGNyZWF0ZWQgZnJvbSB0aGlzIG5vZGUgKG9yXG4gKiAgICAgICAgICAgICAgICAgICAgc3VidHlwZSkuIEdpdmVuIGEgZmxhZyAoZS5nLiByYWRpdXMpLCBpdCBpbmRpY2F0ZXMgdGhlIGV4aXN0ZW5jZSBvZiBhIGZ1bmN0aW9uXG4gKiAgICAgICAgICAgICAgICAgICAgZHJhd2FibGUubWFya0RpcnR5UmFkaXVzKCkgdGhhdCB3aWxsIGluZGljYXRlIHRvIHRoZSBkcmF3YWJsZSB0aGF0IHRoZSByYWRpdXMgaGFzIGNoYW5nZWQuXG4gKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAqIEBvdmVycmlkZVxuICovXG5QYXRoLnByb3RvdHlwZS5kcmF3YWJsZU1hcmtGbGFncyA9IFsgLi4uTm9kZS5wcm90b3R5cGUuZHJhd2FibGVNYXJrRmxhZ3MsIC4uLlBBSU5UQUJMRV9EUkFXQUJMRV9NQVJLX0ZMQUdTLCAnc2hhcGUnIF07XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQYXRoJywgUGF0aCApOyJdLCJuYW1lcyI6WyJUaW55Rm9yd2FyZGluZ1Byb3BlcnR5IiwiaXNUUmVhZE9ubHlQcm9wZXJ0eSIsIkJvdW5kczIiLCJTaGFwZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiTm9kZSIsIlBhaW50IiwiUGFpbnRhYmxlIiwiUEFJTlRBQkxFX0RSQVdBQkxFX01BUktfRkxBR1MiLCJQQUlOVEFCTEVfT1BUSU9OX0tFWVMiLCJQYXRoQ2FudmFzRHJhd2FibGUiLCJQYXRoU1ZHRHJhd2FibGUiLCJSZW5kZXJlciIsInNjZW5lcnkiLCJQQVRIX09QVElPTl9LRVlTIiwiREVGQVVMVF9PUFRJT05TIiwic2hhcGUiLCJib3VuZHNNZXRob2QiLCJQYXRoIiwic2V0U2hhcGUiLCJhc3NlcnQiLCJfc2hhcGVQcm9wZXJ0eSIsInZhbHVlIiwiZ2V0U2hhcGUiLCJfc2hhcGUiLCJvblNoYXBlUHJvcGVydHlDaGFuZ2UiLCJfaW52YWxpZFNoYXBlTGlzdGVuZXJBdHRhY2hlZCIsImRldGFjaFNoYXBlTGlzdGVuZXIiLCJpbnZhbGlkYXRlU2hhcGUiLCJpc0ltbXV0YWJsZSIsImF0dGFjaFNoYXBlTGlzdGVuZXIiLCJzZXRTaGFwZVByb3BlcnR5IiwibmV3VGFyZ2V0Iiwic2V0VGFyZ2V0UHJvcGVydHkiLCJzaGFwZVByb3BlcnR5IiwicHJvcGVydHkiLCJnZXRTaGFwZVByb3BlcnR5IiwiZ2V0U3Ryb2tlZFNoYXBlIiwiaGFzU2hhcGUiLCJfc3Ryb2tlZFNoYXBlIiwiX2xpbmVEcmF3aW5nU3R5bGVzIiwiZ2V0UGF0aFJlbmRlcmVyQml0bWFzayIsImJpdG1hc2tDYW52YXMiLCJiaXRtYXNrU1ZHIiwiaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycyIsInNldFJlbmRlcmVyQml0bWFzayIsImdldEZpbGxSZW5kZXJlckJpdG1hc2siLCJnZXRTdHJva2VSZW5kZXJlckJpdG1hc2siLCJpbnZhbGlkYXRlUGF0aCIsInN0YXRlTGVuIiwiX2RyYXdhYmxlcyIsImxlbmd0aCIsImkiLCJtYXJrRGlydHlTaGFwZSIsImludmFsaWRhdGVTZWxmIiwiaXNEaXNwb3NlZCIsImludmFsaWRhdGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiX2ludmFsaWRTaGFwZUxpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJ1cGRhdGVTZWxmQm91bmRzIiwic2VsZkJvdW5kcyIsImNvbXB1dGVTaGFwZUJvdW5kcyIsIk5PVEhJTkciLCJjaGFuZ2VkIiwiZXF1YWxzIiwic2VsZkJvdW5kc1Byb3BlcnR5IiwiX3ZhbHVlIiwic2V0Iiwic2V0Qm91bmRzTWV0aG9kIiwiX2JvdW5kc01ldGhvZCIsInJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyIiwiZW1pdCIsImdldEJvdW5kc01ldGhvZCIsImhhc1BhaW50YWJsZVN0cm9rZSIsImJvdW5kcyIsImdldFN0cm9rZWRCb3VuZHMiLCJnZXRMaW5lU3R5bGVzIiwiZmFjdG9yIiwiZ2V0TGluZUpvaW4iLCJnZXRNaXRlckxpbWl0IiwiZ2V0TGluZUNhcCIsIk1hdGgiLCJTUVJUMiIsImRpbGF0ZWQiLCJnZXRMaW5lV2lkdGgiLCJhcmVTZWxmQm91bmRzVmFsaWQiLCJoYXNTdHJva2UiLCJnZXRUcmFuc2Zvcm1lZFNlbGZCb3VuZHMiLCJtYXRyaXgiLCJfc3Ryb2tlIiwiZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSIsImdldFRyYW5zZm9ybWVkU2FmZVNlbGZCb3VuZHMiLCJpbnZhbGlkYXRlU3Ryb2tlIiwiY2FudmFzUGFpbnRTZWxmIiwid3JhcHBlciIsInByb3RvdHlwZSIsInBhaW50Q2FudmFzIiwiY3JlYXRlU1ZHRHJhd2FibGUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiY3JlYXRlRnJvbVBvb2wiLCJjcmVhdGVDYW52YXNEcmF3YWJsZSIsImlzUGFpbnRlZCIsImNvbnRhaW5zUG9pbnRTZWxmIiwicG9pbnQiLCJyZXN1bHQiLCJfZmlsbFBpY2thYmxlIiwiY29udGFpbnNQb2ludCIsIl9zdHJva2VQaWNrYWJsZSIsImdldFNlbGZTaGFwZSIsInVuaW9uIiwiaW50ZXJzZWN0c0JvdW5kc1NlbGYiLCJpbnRlcnNlY3RzQm91bmRzIiwicmVxdWlyZXNTVkdCb3VuZHNXb3JrYXJvdW5kIiwid2lkdGgiLCJoZWlnaHQiLCJnZXREZWJ1Z0hUTUxFeHRyYXMiLCJnZXRTVkdQYXRoIiwiZGlzcG9zZSIsIm11dGF0ZSIsIm9wdGlvbnMiLCJwcm92aWRlZE9wdGlvbnMiLCJ1bmRlZmluZWQiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsImluaXRQYXRoT3B0aW9ucyIsImJpbmQiLCJERUZBVUxUX1BBVEhfT1BUSU9OUyIsIkRFRkFVTFRfTk9ERV9PUFRJT05TIiwiX211dGF0b3JLZXlzIiwiZHJhd2FibGVNYXJrRmxhZ3MiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSw0QkFBNEIsNkNBQTZDO0FBRWhGLFNBQTRCQyxtQkFBbUIsUUFBUSx3Q0FBd0M7QUFDL0YsT0FBT0MsYUFBYSw2QkFBNkI7QUFHakQsU0FBU0MsS0FBSyxRQUFRLDhCQUE4QjtBQUNwRCxPQUFPQyxhQUFhQyxjQUFjLFFBQVEscUNBQXFDO0FBRy9FLFNBQTZEQyxJQUFJLEVBQWVDLEtBQUssRUFBRUMsU0FBUyxFQUFFQyw2QkFBNkIsRUFBRUMscUJBQXFCLEVBQW9CQyxrQkFBa0IsRUFBRUMsZUFBZSxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sUUFBd0MsZ0JBQWdCO0FBRXhSLE1BQU1DLG1CQUFtQjtJQUN2QjtJQUNBO0lBQ0E7Q0FDRDtBQUVELE1BQU1DLGtCQUFrQjtJQUN0QkMsT0FBTztJQUNQQyxjQUFjO0FBQ2hCO0FBOERlLElBQUEsQUFBTUMsT0FBTixNQUFNQSxhQUFhWCxVQUFXRjtJQTRFcENjLFNBQVVILEtBQWlCLEVBQVM7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