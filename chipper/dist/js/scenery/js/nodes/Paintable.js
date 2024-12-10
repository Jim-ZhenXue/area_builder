// Copyright 2021-2024, University of Colorado Boulder
/**
 * Trait for Nodes that support a standard fill and/or stroke (e.g. Text, Path and Path subtypes).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import { LINE_STYLE_DEFAULT_OPTIONS, LineStyles } from '../../../kite/js/imports.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import inheritance from '../../../phet-core/js/inheritance.js';
import memoize from '../../../phet-core/js/memoize.js';
import platform from '../../../phet-core/js/platform.js';
import { Color, Gradient, Node, Paint, PaintDef, Pattern, Renderer, scenery } from '../imports.js';
const isSafari5 = platform.safari5;
const PAINTABLE_OPTION_KEYS = [
    'fill',
    'fillPickable',
    'stroke',
    'strokePickable',
    'lineWidth',
    'lineCap',
    'lineJoin',
    'miterLimit',
    'lineDash',
    'lineDashOffset',
    'cachedPaints' // {Array.<PaintDef>} - Sets which paints should be cached, even if not displayed. See setCachedPaints()
];
const DEFAULT_OPTIONS = {
    fill: null,
    fillPickable: true,
    stroke: null,
    strokePickable: false,
    // Not set initially, but they are the LineStyles defaults
    lineWidth: LINE_STYLE_DEFAULT_OPTIONS.lineWidth,
    lineCap: LINE_STYLE_DEFAULT_OPTIONS.lineCap,
    lineJoin: LINE_STYLE_DEFAULT_OPTIONS.lineJoin,
    lineDashOffset: LINE_STYLE_DEFAULT_OPTIONS.lineDashOffset,
    miterLimit: LINE_STYLE_DEFAULT_OPTIONS.miterLimit
};
const PAINTABLE_DRAWABLE_MARK_FLAGS = [
    'fill',
    'stroke',
    'lineWidth',
    'lineOptions',
    'cachedPaints'
];
const Paintable = memoize((Type)=>{
    assert && assert(_.includes(inheritance(Type), Node), 'Only Node subtypes should mix Paintable');
    return class PaintableMixin extends Type {
        /**
     * Sets the fill color for the Node.
     *
     * The fill determines the appearance of the interior part of a Path or Text.
     *
     * Please use null for indicating "no fill" (that is the default). Strings and Scenery Color objects can be
     * provided for a single-color flat appearance, and can be wrapped with an Axon Property. Gradients and patterns
     * can also be provided.
     */ setFill(fill) {
            assert && assert(PaintDef.isPaintDef(fill), 'Invalid fill type');
            if (assert && typeof fill === 'string') {
                Color.checkPaintString(fill);
            }
            // Instance equality used here since it would be more expensive to parse all CSS
            // colors and compare every time the fill changes. Right now, usually we don't have
            // to parse CSS colors. See https://github.com/phetsims/scenery/issues/255
            if (this._fill !== fill) {
                this._fill = fill;
                this.invalidateFill();
            }
            return this;
        }
        set fill(value) {
            this.setFill(value);
        }
        get fill() {
            return this.getFill();
        }
        /**
     * Returns the fill (if any) for this Node.
     */ getFill() {
            return this._fill;
        }
        /**
     * Returns whether there is a fill applied to this Node.
     */ hasFill() {
            return this.getFillValue() !== null;
        }
        /**
     * Returns a property-unwrapped fill if applicable.
     */ getFillValue() {
            const fill = this.getFill();
            return isTReadOnlyProperty(fill) ? fill.get() : fill;
        }
        get fillValue() {
            return this.getFillValue();
        }
        /**
     * Sets the stroke color for the Node.
     *
     * The stroke determines the appearance of the region along the boundary of the Path or Text. The shape of the
     * stroked area depends on the base shape (that of the Path or Text) and multiple parameters:
     * lineWidth/lineCap/lineJoin/miterLimit/lineDash/lineDashOffset. It will be drawn on top of any fill on the
     * same Node.
     *
     * Please use null for indicating "no stroke" (that is the default). Strings and Scenery Color objects can be
     * provided for a single-color flat appearance, and can be wrapped with an Axon Property. Gradients and patterns
     * can also be provided.
     */ setStroke(stroke) {
            assert && assert(PaintDef.isPaintDef(stroke), 'Invalid stroke type');
            if (assert && typeof stroke === 'string') {
                Color.checkPaintString(stroke);
            }
            // Instance equality used here since it would be more expensive to parse all CSS
            // colors and compare every time the fill changes. Right now, usually we don't have
            // to parse CSS colors. See https://github.com/phetsims/scenery/issues/255
            if (this._stroke !== stroke) {
                this._stroke = stroke;
                if (assert && stroke instanceof Paint && stroke.transformMatrix) {
                    const scaleVector = stroke.transformMatrix.getScaleVector();
                    assert(Math.abs(scaleVector.x - scaleVector.y) < 1e-7, 'You cannot specify a pattern or gradient to a stroke that does not have a symmetric scale.');
                }
                this.invalidateStroke();
            }
            return this;
        }
        set stroke(value) {
            this.setStroke(value);
        }
        get stroke() {
            return this.getStroke();
        }
        /**
     * Returns the stroke (if any) for this Node.
     */ getStroke() {
            return this._stroke;
        }
        /**
     * Returns whether there is a stroke applied to this Node.
     */ hasStroke() {
            return this.getStrokeValue() !== null;
        }
        /**
     * Returns whether there will appear to be a stroke for this Node. Properly handles the lineWidth:0 case.
     */ hasPaintableStroke() {
            // Should not be stroked if the lineWidth is 0, see https://github.com/phetsims/scenery/issues/658
            // and https://github.com/phetsims/scenery/issues/523
            return this.hasStroke() && this.getLineWidth() > 0;
        }
        /**
     * Returns a property-unwrapped stroke if applicable.
     */ getStrokeValue() {
            const stroke = this.getStroke();
            return isTReadOnlyProperty(stroke) ? stroke.get() : stroke;
        }
        get strokeValue() {
            return this.getStrokeValue();
        }
        /**
     * Sets whether the fill is marked as pickable.
     */ setFillPickable(pickable) {
            if (this._fillPickable !== pickable) {
                this._fillPickable = pickable;
                // TODO: better way of indicating that only the Node under pointers could have changed, but no paint change is needed? https://github.com/phetsims/scenery/issues/1581
                this.invalidateFill();
            }
            return this;
        }
        set fillPickable(value) {
            this.setFillPickable(value);
        }
        get fillPickable() {
            return this.isFillPickable();
        }
        /**
     * Returns whether the fill is marked as pickable.
     */ isFillPickable() {
            return this._fillPickable;
        }
        /**
     * Sets whether the stroke is marked as pickable.
     */ setStrokePickable(pickable) {
            if (this._strokePickable !== pickable) {
                this._strokePickable = pickable;
                // TODO: better way of indicating that only the Node under pointers could have changed, but no paint change is needed? https://github.com/phetsims/scenery/issues/1581
                this.invalidateStroke();
            }
            return this;
        }
        set strokePickable(value) {
            this.setStrokePickable(value);
        }
        get strokePickable() {
            return this.isStrokePickable();
        }
        /**
     * Returns whether the stroke is marked as pickable.
     */ isStrokePickable() {
            return this._strokePickable;
        }
        /**
     * Sets the line width that will be applied to strokes on this Node.
     */ setLineWidth(lineWidth) {
            assert && assert(lineWidth >= 0, `lineWidth should be non-negative instead of ${lineWidth}`);
            if (this.getLineWidth() !== lineWidth) {
                this._lineDrawingStyles.lineWidth = lineWidth;
                this.invalidateStroke();
                const stateLen = this._drawables.length;
                for(let i = 0; i < stateLen; i++){
                    this._drawables[i].markDirtyLineWidth();
                }
            }
            return this;
        }
        set lineWidth(value) {
            this.setLineWidth(value);
        }
        get lineWidth() {
            return this.getLineWidth();
        }
        /**
     * Returns the line width that would be applied to strokes.
     */ getLineWidth() {
            return this._lineDrawingStyles.lineWidth;
        }
        /**
     * Sets the line cap style. There are three options:
     * - 'butt' (the default) stops the line at the end point
     * - 'round' draws a semicircular arc around the end point
     * - 'square' draws a square outline around the end point (like butt, but extended by 1/2 line width out)
     */ setLineCap(lineCap) {
            assert && assert(lineCap === 'butt' || lineCap === 'round' || lineCap === 'square', `lineCap should be one of "butt", "round" or "square", not ${lineCap}`);
            if (this._lineDrawingStyles.lineCap !== lineCap) {
                this._lineDrawingStyles.lineCap = lineCap;
                this.invalidateStroke();
                const stateLen = this._drawables.length;
                for(let i = 0; i < stateLen; i++){
                    this._drawables[i].markDirtyLineOptions();
                }
            }
            return this;
        }
        set lineCap(value) {
            this.setLineCap(value);
        }
        get lineCap() {
            return this.getLineCap();
        }
        /**
     * Returns the line cap style (controls appearance at the start/end of paths)
     */ getLineCap() {
            return this._lineDrawingStyles.lineCap;
        }
        /**
     * Sets the line join style. There are three options:
     * - 'miter' (default) joins by extending the segments out in a line until they meet. For very sharp
     *           corners, they will be chopped off and will act like 'bevel', depending on what the miterLimit is.
     * - 'round' draws a circular arc to connect the two stroked areas.
     * - 'bevel' connects with a single line segment.
     */ setLineJoin(lineJoin) {
            assert && assert(lineJoin === 'miter' || lineJoin === 'round' || lineJoin === 'bevel', `lineJoin should be one of "miter", "round" or "bevel", not ${lineJoin}`);
            if (this._lineDrawingStyles.lineJoin !== lineJoin) {
                this._lineDrawingStyles.lineJoin = lineJoin;
                this.invalidateStroke();
                const stateLen = this._drawables.length;
                for(let i = 0; i < stateLen; i++){
                    this._drawables[i].markDirtyLineOptions();
                }
            }
            return this;
        }
        set lineJoin(value) {
            this.setLineJoin(value);
        }
        get lineJoin() {
            return this.getLineJoin();
        }
        /**
     * Returns the current line join style (controls join appearance between drawn segments).
     */ getLineJoin() {
            return this._lineDrawingStyles.lineJoin;
        }
        /**
     * Sets the miterLimit value. This determines how sharp a corner with lineJoin: 'miter' will need to be before
     * it gets cut off to the 'bevel' behavior.
     */ setMiterLimit(miterLimit) {
            assert && assert(isFinite(miterLimit), 'miterLimit should be a finite number');
            if (this._lineDrawingStyles.miterLimit !== miterLimit) {
                this._lineDrawingStyles.miterLimit = miterLimit;
                this.invalidateStroke();
                const stateLen = this._drawables.length;
                for(let i = 0; i < stateLen; i++){
                    this._drawables[i].markDirtyLineOptions();
                }
            }
            return this;
        }
        set miterLimit(value) {
            this.setMiterLimit(value);
        }
        get miterLimit() {
            return this.getMiterLimit();
        }
        /**
     * Returns the miterLimit value.
     */ getMiterLimit() {
            return this._lineDrawingStyles.miterLimit;
        }
        /**
     * Sets the line dash pattern. Should be an array of numbers "on" and "off" alternating. An empty array
     * indicates no dashing.
     */ setLineDash(lineDash) {
            assert && assert(Array.isArray(lineDash) && lineDash.every((n)=>typeof n === 'number' && isFinite(n) && n >= 0), 'lineDash should be an array of finite non-negative numbers');
            if (this._lineDrawingStyles.lineDash !== lineDash) {
                this._lineDrawingStyles.lineDash = lineDash || [];
                this.invalidateStroke();
                const stateLen = this._drawables.length;
                for(let i = 0; i < stateLen; i++){
                    this._drawables[i].markDirtyLineOptions();
                }
            }
            return this;
        }
        set lineDash(value) {
            this.setLineDash(value);
        }
        get lineDash() {
            return this.getLineDash();
        }
        /**
     * Gets the line dash pattern. An empty array is the default, indicating no dashing.
     */ getLineDash() {
            return this._lineDrawingStyles.lineDash;
        }
        /**
     * Returns whether the stroke will be dashed.
     */ hasLineDash() {
            return !!this._lineDrawingStyles.lineDash.length;
        }
        /**
     * Sets the offset of the line dash pattern from the start of the stroke. Defaults to 0.
     */ setLineDashOffset(lineDashOffset) {
            assert && assert(isFinite(lineDashOffset), `lineDashOffset should be a number, not ${lineDashOffset}`);
            if (this._lineDrawingStyles.lineDashOffset !== lineDashOffset) {
                this._lineDrawingStyles.lineDashOffset = lineDashOffset;
                this.invalidateStroke();
                const stateLen = this._drawables.length;
                for(let i = 0; i < stateLen; i++){
                    this._drawables[i].markDirtyLineOptions();
                }
            }
            return this;
        }
        set lineDashOffset(value) {
            this.setLineDashOffset(value);
        }
        get lineDashOffset() {
            return this.getLineDashOffset();
        }
        /**
     * Returns the offset of the line dash pattern from the start of the stroke.
     */ getLineDashOffset() {
            return this._lineDrawingStyles.lineDashOffset;
        }
        /**
     * Sets the LineStyles object (it determines stroke appearance). The passed-in object will be mutated as needed.
     */ setLineStyles(lineStyles) {
            this._lineDrawingStyles = lineStyles;
            this.invalidateStroke();
            return this;
        }
        set lineStyles(value) {
            this.setLineStyles(value);
        }
        get lineStyles() {
            return this.getLineStyles();
        }
        /**
     * Returns the composite {LineStyles} object, that determines stroke appearance.
     */ getLineStyles() {
            return this._lineDrawingStyles;
        }
        /**
     * Sets the cached paints to the input array (a defensive copy). Note that it also filters out fills that are
     * not considered paints (e.g. strings, Colors, etc.).
     *
     * When this Node is displayed in SVG, it will force the presence of the cached paint to be stored in the SVG's
     * <defs> element, so that we can switch quickly to use the given paint (instead of having to create it on the
     * SVG-side whenever the switch is made).
     *
     * Also note that duplicate paints are acceptable, and don't need to be filtered out before-hand.
     */ setCachedPaints(paints) {
            this._cachedPaints = paints.filter((paint)=>paint instanceof Paint);
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyCachedPaints();
            }
            return this;
        }
        set cachedPaints(value) {
            this.setCachedPaints(value);
        }
        get cachedPaints() {
            return this.getCachedPaints();
        }
        /**
     * Returns the cached paints.
     */ getCachedPaints() {
            return this._cachedPaints;
        }
        /**
     * Adds a cached paint. Does nothing if paint is just a normal fill (string, Color), but for gradients and
     * patterns, it will be made faster to switch to.
     *
     * When this Node is displayed in SVG, it will force the presence of the cached paint to be stored in the SVG's
     * <defs> element, so that we can switch quickly to use the given paint (instead of having to create it on the
     * SVG-side whenever the switch is made).
     *
     * Also note that duplicate paints are acceptable, and don't need to be filtered out before-hand.
     */ addCachedPaint(paint) {
            if (paint instanceof Paint) {
                this._cachedPaints.push(paint);
                const stateLen = this._drawables.length;
                for(let i = 0; i < stateLen; i++){
                    this._drawables[i].markDirtyCachedPaints();
                }
            }
        }
        /**
     * Removes a cached paint. Does nothing if paint is just a normal fill (string, Color), but for gradients and
     * patterns it will remove any existing cached paint. If it was added more than once, it will need to be removed
     * more than once.
     *
     * When this Node is displayed in SVG, it will force the presence of the cached paint to be stored in the SVG's
     * <defs> element, so that we can switch quickly to use the given paint (instead of having to create it on the
     * SVG-side whenever the switch is made).
     */ removeCachedPaint(paint) {
            if (paint instanceof Paint) {
                assert && assert(_.includes(this._cachedPaints, paint));
                arrayRemove(this._cachedPaints, paint);
                const stateLen = this._drawables.length;
                for(let i = 0; i < stateLen; i++){
                    this._drawables[i].markDirtyCachedPaints();
                }
            }
        }
        /**
     * Applies the fill to a Canvas context wrapper, before filling. (scenery-internal)
     */ beforeCanvasFill(wrapper) {
            assert && assert(this.getFillValue() !== null);
            const fillValue = this.getFillValue();
            wrapper.setFillStyle(fillValue);
            // @ts-expect-error - For performance, we could check this by ruling out string and 'transformMatrix' in fillValue
            if (fillValue.transformMatrix) {
                wrapper.context.save();
                // @ts-expect-error
                fillValue.transformMatrix.canvasAppendTransform(wrapper.context);
            }
        }
        /**
     * Un-applies the fill to a Canvas context wrapper, after filling. (scenery-internal)
     */ afterCanvasFill(wrapper) {
            const fillValue = this.getFillValue();
            // @ts-expect-error
            if (fillValue.transformMatrix) {
                wrapper.context.restore();
            }
        }
        /**
     * Applies the stroke to a Canvas context wrapper, before stroking. (scenery-internal)
     */ beforeCanvasStroke(wrapper) {
            const strokeValue = this.getStrokeValue();
            // TODO: is there a better way of not calling so many things on each stroke? https://github.com/phetsims/scenery/issues/1581
            wrapper.setStrokeStyle(this._stroke);
            wrapper.setLineCap(this.getLineCap());
            wrapper.setLineJoin(this.getLineJoin());
            // @ts-expect-error - for performance
            if (strokeValue.transformMatrix) {
                // @ts-expect-error
                const scaleVector = strokeValue.transformMatrix.getScaleVector();
                assert && assert(Math.abs(scaleVector.x - scaleVector.y) < 1e-7, 'You cannot specify a pattern or gradient to a stroke that does not have a symmetric scale.');
                const matrixMultiplier = 1 / scaleVector.x;
                wrapper.context.save();
                // @ts-expect-error
                strokeValue.transformMatrix.canvasAppendTransform(wrapper.context);
                wrapper.setLineWidth(this.getLineWidth() * matrixMultiplier);
                wrapper.setMiterLimit(this.getMiterLimit() * matrixMultiplier);
                wrapper.setLineDash(this.getLineDash().map((dash)=>dash * matrixMultiplier));
                wrapper.setLineDashOffset(this.getLineDashOffset() * matrixMultiplier);
            } else {
                wrapper.setLineWidth(this.getLineWidth());
                wrapper.setMiterLimit(this.getMiterLimit());
                wrapper.setLineDash(this.getLineDash());
                wrapper.setLineDashOffset(this.getLineDashOffset());
            }
        }
        /**
     * Un-applies the stroke to a Canvas context wrapper, after stroking. (scenery-internal)
     */ afterCanvasStroke(wrapper) {
            const strokeValue = this.getStrokeValue();
            // @ts-expect-error - for performance
            if (strokeValue.transformMatrix) {
                wrapper.context.restore();
            }
        }
        /**
     * If applicable, returns the CSS color for the fill.
     */ getCSSFill() {
            const fillValue = this.getFillValue();
            // if it's a Color object, get the corresponding CSS
            // 'transparent' will make us invisible if the fill is null
            // @ts-expect-error - toCSS checks for color, left for performance
            return fillValue ? fillValue.toCSS ? fillValue.toCSS() : fillValue : 'transparent';
        }
        /**
     * If applicable, returns the CSS color for the stroke.
     */ getSimpleCSSStroke() {
            const strokeValue = this.getStrokeValue();
            // if it's a Color object, get the corresponding CSS
            // 'transparent' will make us invisible if the fill is null
            // @ts-expect-error - toCSS checks for color, left for performance
            return strokeValue ? strokeValue.toCSS ? strokeValue.toCSS() : strokeValue : 'transparent';
        }
        /**
     * Returns the fill-specific property string for use with toString(). (scenery-internal)
     *
     * @param spaces - Whitespace to add
     * @param result
     */ appendFillablePropString(spaces, result) {
            if (this._fill) {
                if (result) {
                    result += ',\n';
                }
                if (typeof this.getFillValue() === 'string') {
                    result += `${spaces}fill: '${this.getFillValue()}'`;
                } else {
                    result += `${spaces}fill: ${this.getFillValue()}`;
                }
            }
            return result;
        }
        /**
     * Returns the stroke-specific property string for use with toString(). (scenery-internal)
     *
     * @param spaces - Whitespace to add
     * @param result
     */ appendStrokablePropString(spaces, result) {
            function addProp(key, value, nowrap) {
                if (result) {
                    result += ',\n';
                }
                if (!nowrap && typeof value === 'string') {
                    result += `${spaces + key}: '${value}'`;
                } else {
                    result += `${spaces + key}: ${value}`;
                }
            }
            if (this._stroke) {
                const defaultStyles = new LineStyles();
                const strokeValue = this.getStrokeValue();
                if (typeof strokeValue === 'string') {
                    addProp('stroke', strokeValue);
                } else {
                    addProp('stroke', strokeValue ? strokeValue.toString() : 'null', true);
                }
                _.each([
                    'lineWidth',
                    'lineCap',
                    'miterLimit',
                    'lineJoin',
                    'lineDashOffset'
                ], (prop)=>{
                    // @ts-expect-error
                    if (this[prop] !== defaultStyles[prop]) {
                        // @ts-expect-error
                        addProp(prop, this[prop]);
                    }
                });
                if (this.lineDash.length) {
                    addProp('lineDash', JSON.stringify(this.lineDash), true);
                }
            }
            return result;
        }
        /**
     * Determines the default allowed renderers (returned via the Renderer bitmask) that are allowed, given the
     * current fill options. (scenery-internal)
     *
     * This will be used for all types that directly mix in Paintable (i.e. Path and Text), but may be overridden
     * by subtypes.
     *
     * @returns - Renderer bitmask, see Renderer for details
     */ getFillRendererBitmask() {
            let bitmask = 0;
            // Safari 5 has buggy issues with SVG gradients
            if (!(isSafari5 && this._fill instanceof Gradient)) {
                bitmask |= Renderer.bitmaskSVG;
            }
            // we always have Canvas support?
            bitmask |= Renderer.bitmaskCanvas;
            if (!this.hasFill()) {
                // if there is no fill, it is supported by DOM and WebGL
                bitmask |= Renderer.bitmaskDOM;
                bitmask |= Renderer.bitmaskWebGL;
            } else if (this._fill instanceof Pattern) {
            // no pattern support for DOM or WebGL (for now!)
            } else if (this._fill instanceof Gradient) {
            // no gradient support for DOM or WebGL (for now!)
            } else {
                // solid fills always supported for DOM and WebGL
                bitmask |= Renderer.bitmaskDOM;
                bitmask |= Renderer.bitmaskWebGL;
            }
            return bitmask;
        }
        /**
     * Determines the default allowed renderers (returned via the Renderer bitmask) that are allowed, given the
     * current stroke options. (scenery-internal)
     *
     * This will be used for all types that directly mix in Paintable (i.e. Path and Text), but may be overridden
     * by subtypes.
     *
     * @returns - Renderer bitmask, see Renderer for details
     */ getStrokeRendererBitmask() {
            let bitmask = 0;
            bitmask |= Renderer.bitmaskCanvas;
            // always have SVG support (for now?)
            bitmask |= Renderer.bitmaskSVG;
            if (!this.hasStroke()) {
                // allow DOM support if there is no stroke (since the fill will determine what is available)
                bitmask |= Renderer.bitmaskDOM;
                bitmask |= Renderer.bitmaskWebGL;
            }
            return bitmask;
        }
        /**
     * Invalidates our current fill, triggering recomputation of anything that depended on the old fill's value
     */ invalidateFill() {
            this.invalidateSupportedRenderers();
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyFill();
            }
        }
        /**
     * Invalidates our current stroke, triggering recomputation of anything that depended on the old stroke's value
     */ invalidateStroke() {
            this.invalidateSupportedRenderers();
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyStroke();
            }
        }
        constructor(...args){
            super(...args);
            assertHasProperties(this, [
                '_drawables'
            ]);
            this._fill = DEFAULT_OPTIONS.fill;
            this._fillPickable = DEFAULT_OPTIONS.fillPickable;
            this._stroke = DEFAULT_OPTIONS.stroke;
            this._strokePickable = DEFAULT_OPTIONS.strokePickable;
            this._cachedPaints = [];
            this._lineDrawingStyles = new LineStyles();
        }
    };
});
scenery.register('Paintable', Paintable);
// @ts-expect-error
Paintable.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
export { Paintable as default, PAINTABLE_DRAWABLE_MARK_FLAGS, PAINTABLE_OPTION_KEYS, DEFAULT_OPTIONS, DEFAULT_OPTIONS as PAINTABLE_DEFAULT_OPTIONS };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvUGFpbnRhYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRyYWl0IGZvciBOb2RlcyB0aGF0IHN1cHBvcnQgYSBzdGFuZGFyZCBmaWxsIGFuZC9vciBzdHJva2UgKGUuZy4gVGV4dCwgUGF0aCBhbmQgUGF0aCBzdWJ0eXBlcykuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB7IGlzVFJlYWRPbmx5UHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IExJTkVfU1RZTEVfREVGQVVMVF9PUFRJT05TLCBMaW5lQ2FwLCBMaW5lSm9pbiwgTGluZVN0eWxlcyB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcbmltcG9ydCBhc3NlcnRIYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRIYXNQcm9wZXJ0aWVzLmpzJztcbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgQ29uc3RydWN0b3IgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0NvbnN0cnVjdG9yLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IHsgQ2FudmFzQ29udGV4dFdyYXBwZXIsIENvbG9yLCBHcmFkaWVudCwgTGluZWFyR3JhZGllbnQsIE5vZGUsIFBhaW50LCBQYWludERlZiwgUGF0aCwgUGF0dGVybiwgUmFkaWFsR3JhZGllbnQsIFJlbmRlcmVyLCBzY2VuZXJ5LCBUZXh0LCBUUGFpbnQsIFRQYWludGFibGVEcmF3YWJsZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBpc1NhZmFyaTUgPSBwbGF0Zm9ybS5zYWZhcmk1O1xuXG5jb25zdCBQQUlOVEFCTEVfT1BUSU9OX0tFWVMgPSBbXG4gICdmaWxsJywgLy8ge1BhaW50RGVmfSAtIFNldHMgdGhlIGZpbGwgb2YgdGhpcyBOb2RlLCBzZWUgc2V0RmlsbCgpIGZvciBkb2N1bWVudGF0aW9uLlxuICAnZmlsbFBpY2thYmxlJywgLy8ge2Jvb2xlYW59IC0gU2V0cyB3aGV0aGVyIHRoZSBmaWxsZWQgYXJlYSBvZiB0aGUgTm9kZSB3aWxsIGJlIHRyZWF0ZWQgYXMgJ2luc2lkZScuIFNlZSBzZXRGaWxsUGlja2FibGUoKVxuICAnc3Ryb2tlJywgLy8ge1BhaW50RGVmfSAtIFNldHMgdGhlIHN0cm9rZSBvZiB0aGlzIE5vZGUsIHNlZSBzZXRTdHJva2UoKSBmb3IgZG9jdW1lbnRhdGlvbi5cbiAgJ3N0cm9rZVBpY2thYmxlJywgLy8ge2Jvb2xlYW59IC0gU2V0cyB3aGV0aGVyIHRoZSBzdHJva2VkIGFyZWEgb2YgdGhlIE5vZGUgd2lsbCBiZSB0cmVhdGVkIGFzICdpbnNpZGUnLiBTZWUgc2V0U3Ryb2tlUGlja2FibGUoKVxuICAnbGluZVdpZHRoJywgLy8ge251bWJlcn0gLSBTZXRzIHRoZSB3aWR0aCBvZiB0aGUgc3Ryb2tlZCBhcmVhLCBzZWUgc2V0TGluZVdpZHRoIGZvciBkb2N1bWVudGF0aW9uLlxuICAnbGluZUNhcCcsIC8vIHtzdHJpbmd9IC0gU2V0cyB0aGUgc2hhcGUgb2YgdGhlIHN0cm9rZWQgYXJlYSBhdCB0aGUgc3RhcnQvZW5kIG9mIHRoZSBwYXRoLCBzZWUgc2V0TGluZUNhcCgpIGZvciBkb2N1bWVudGF0aW9uLlxuICAnbGluZUpvaW4nLCAvLyB7c3RyaW5nfSAtIFNldHMgdGhlIHNoYXBlIG9mIHRoZSBzdHJva2VkIGFyZWEgYXQgam9pbnRzLCBzZWUgc2V0TGluZUpvaW4oKSBmb3IgZG9jdW1lbnRhdGlvbi5cbiAgJ21pdGVyTGltaXQnLCAvLyB7bnVtYmVyfSAtIFNldHMgd2hlbiBsaW5lSm9pbiB3aWxsIHN3aXRjaCBmcm9tIG1pdGVyIHRvIGJldmVsLCBzZWUgc2V0TWl0ZXJMaW1pdCgpIGZvciBkb2N1bWVudGF0aW9uLlxuICAnbGluZURhc2gnLCAvLyB7QXJyYXkuPG51bWJlcj59IC0gU2V0cyBhIGxpbmUtZGFzaCBwYXR0ZXJuIGZvciB0aGUgc3Ryb2tlLCBzZWUgc2V0TGluZURhc2goKSBmb3IgZG9jdW1lbnRhdGlvblxuICAnbGluZURhc2hPZmZzZXQnLCAvLyB7bnVtYmVyfSAtIFNldHMgdGhlIG9mZnNldCBvZiB0aGUgbGluZS1kYXNoIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBzdHJva2UsIHNlZSBzZXRMaW5lRGFzaE9mZnNldCgpXG4gICdjYWNoZWRQYWludHMnIC8vIHtBcnJheS48UGFpbnREZWY+fSAtIFNldHMgd2hpY2ggcGFpbnRzIHNob3VsZCBiZSBjYWNoZWQsIGV2ZW4gaWYgbm90IGRpc3BsYXllZC4gU2VlIHNldENhY2hlZFBhaW50cygpXG5dO1xuXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIGZpbGw6IG51bGwsXG4gIGZpbGxQaWNrYWJsZTogdHJ1ZSxcbiAgc3Ryb2tlOiBudWxsLFxuICBzdHJva2VQaWNrYWJsZTogZmFsc2UsXG5cbiAgLy8gTm90IHNldCBpbml0aWFsbHksIGJ1dCB0aGV5IGFyZSB0aGUgTGluZVN0eWxlcyBkZWZhdWx0c1xuICBsaW5lV2lkdGg6IExJTkVfU1RZTEVfREVGQVVMVF9PUFRJT05TLmxpbmVXaWR0aCxcbiAgbGluZUNhcDogTElORV9TVFlMRV9ERUZBVUxUX09QVElPTlMubGluZUNhcCxcbiAgbGluZUpvaW46IExJTkVfU1RZTEVfREVGQVVMVF9PUFRJT05TLmxpbmVKb2luLFxuICBsaW5lRGFzaE9mZnNldDogTElORV9TVFlMRV9ERUZBVUxUX09QVElPTlMubGluZURhc2hPZmZzZXQsXG4gIG1pdGVyTGltaXQ6IExJTkVfU1RZTEVfREVGQVVMVF9PUFRJT05TLm1pdGVyTGltaXRcbn07XG5cbmV4cG9ydCB0eXBlIFBhaW50YWJsZU9wdGlvbnMgPSB7XG4gIGZpbGw/OiBUUGFpbnQ7XG4gIGZpbGxQaWNrYWJsZT86IGJvb2xlYW47XG4gIHN0cm9rZT86IFRQYWludDtcbiAgc3Ryb2tlUGlja2FibGU/OiBib29sZWFuO1xuICBsaW5lV2lkdGg/OiBudW1iZXI7XG4gIGxpbmVDYXA/OiBMaW5lQ2FwO1xuICBsaW5lSm9pbj86IExpbmVKb2luO1xuICBtaXRlckxpbWl0PzogbnVtYmVyO1xuICBsaW5lRGFzaD86IG51bWJlcltdO1xuICBsaW5lRGFzaE9mZnNldD86IG51bWJlcjtcbiAgY2FjaGVkUGFpbnRzPzogVFBhaW50W107XG59O1xuXG4vLyBXb3JrYXJvdW5kIHR5cGUgc2luY2Ugd2UgY2FuJ3QgZGV0ZWN0IG1peGlucyBpbiB0aGUgdHlwZSBzeXN0ZW0gd2VsbFxuZXhwb3J0IHR5cGUgUGFpbnRhYmxlTm9kZSA9IFBhdGggfCBUZXh0O1xuXG5jb25zdCBQQUlOVEFCTEVfRFJBV0FCTEVfTUFSS19GTEFHUyA9IFsgJ2ZpbGwnLCAnc3Ryb2tlJywgJ2xpbmVXaWR0aCcsICdsaW5lT3B0aW9ucycsICdjYWNoZWRQYWludHMnIF07XG5cbi8vIE5vcm1hbGx5IG91ciBwcm9qZWN0IHByZWZlcnMgdHlwZSBhbGlhc2VzIHRvIGludGVyZmFjZXMsIGJ1dCBpbnRlcmZhY2VzIGFyZSBuZWNlc3NhcnkgZm9yIGNvcnJlY3QgdXNhZ2Ugb2YgXCJ0aGlzXCIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFza3MvaXNzdWVzLzExMzJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvY29uc2lzdGVudC10eXBlLWRlZmluaXRpb25zXG5leHBvcnQgaW50ZXJmYWNlIFRQYWludGFibGUge1xuXG4gIF9maWxsOiBUUGFpbnQ7XG4gIF9maWxsUGlja2FibGU6IGJvb2xlYW47XG4gIF9zdHJva2U6IFRQYWludDtcbiAgX3N0cm9rZVBpY2thYmxlOiBib29sZWFuO1xuICBfY2FjaGVkUGFpbnRzOiBQYWludFtdO1xuICBfbGluZURyYXdpbmdTdHlsZXM6IExpbmVTdHlsZXM7XG5cbiAgc2V0RmlsbCggZmlsbDogVFBhaW50ICk6IHRoaXM7XG5cbiAgZmlsbDogVFBhaW50O1xuXG4gIGdldEZpbGwoKTogVFBhaW50O1xuXG4gIGhhc0ZpbGwoKTogYm9vbGVhbjtcblxuICBnZXRGaWxsVmFsdWUoKTogbnVsbCB8IHN0cmluZyB8IENvbG9yIHwgTGluZWFyR3JhZGllbnQgfCBSYWRpYWxHcmFkaWVudCB8IFBhdHRlcm4gfCBQYWludDtcblxuICBnZXQgZmlsbFZhbHVlKCk6IG51bGwgfCBzdHJpbmcgfCBDb2xvciB8IExpbmVhckdyYWRpZW50IHwgUmFkaWFsR3JhZGllbnQgfCBQYXR0ZXJuIHwgUGFpbnQ7XG5cbiAgc2V0U3Ryb2tlKCBzdHJva2U6IFRQYWludCApOiB0aGlzO1xuXG4gIHN0cm9rZTogVFBhaW50O1xuXG4gIGdldFN0cm9rZSgpOiBUUGFpbnQ7XG5cbiAgaGFzU3Ryb2tlKCk6IGJvb2xlYW47XG5cbiAgaGFzUGFpbnRhYmxlU3Ryb2tlKCk6IGJvb2xlYW47XG5cbiAgZ2V0U3Ryb2tlVmFsdWUoKTogbnVsbCB8IHN0cmluZyB8IENvbG9yIHwgTGluZWFyR3JhZGllbnQgfCBSYWRpYWxHcmFkaWVudCB8IFBhdHRlcm4gfCBQYWludDtcblxuICBnZXQgc3Ryb2tlVmFsdWUoKTogbnVsbCB8IHN0cmluZyB8IENvbG9yIHwgTGluZWFyR3JhZGllbnQgfCBSYWRpYWxHcmFkaWVudCB8IFBhdHRlcm4gfCBQYWludDtcblxuICBzZXRGaWxsUGlja2FibGUoIHBpY2thYmxlOiBib29sZWFuICk6IHRoaXM7XG5cbiAgZmlsbFBpY2thYmxlOiBib29sZWFuO1xuXG4gIGlzRmlsbFBpY2thYmxlKCk6IGJvb2xlYW47XG5cbiAgc2V0U3Ryb2tlUGlja2FibGUoIHBpY2thYmxlOiBib29sZWFuICk6IHRoaXM7XG5cbiAgc3Ryb2tlUGlja2FibGU6IGJvb2xlYW47XG5cbiAgaXNTdHJva2VQaWNrYWJsZSgpOiBib29sZWFuO1xuXG4gIHNldExpbmVXaWR0aCggbGluZVdpZHRoOiBudW1iZXIgKTogdGhpcztcblxuICBsaW5lV2lkdGg6IG51bWJlcjtcblxuICBnZXRMaW5lV2lkdGgoKTogbnVtYmVyO1xuXG4gIHNldExpbmVDYXAoIGxpbmVDYXA6IExpbmVDYXAgKTogdGhpcztcblxuICBsaW5lQ2FwOiBMaW5lQ2FwO1xuXG4gIGdldExpbmVDYXAoKTogTGluZUNhcDtcblxuICBzZXRMaW5lSm9pbiggbGluZUpvaW46IExpbmVKb2luICk6IHRoaXM7XG5cbiAgbGluZUpvaW46IExpbmVKb2luO1xuXG4gIGdldExpbmVKb2luKCk6IExpbmVKb2luO1xuXG4gIHNldE1pdGVyTGltaXQoIG1pdGVyTGltaXQ6IG51bWJlciApOiB0aGlzO1xuXG4gIG1pdGVyTGltaXQ6IG51bWJlcjtcblxuICBnZXRNaXRlckxpbWl0KCk6IG51bWJlcjtcblxuICBzZXRMaW5lRGFzaCggbGluZURhc2g6IG51bWJlcltdICk6IHRoaXM7XG5cbiAgbGluZURhc2g6IG51bWJlcltdO1xuXG4gIGdldExpbmVEYXNoKCk6IG51bWJlcltdO1xuXG4gIGhhc0xpbmVEYXNoKCk6IGJvb2xlYW47XG5cbiAgc2V0TGluZURhc2hPZmZzZXQoIGxpbmVEYXNoT2Zmc2V0OiBudW1iZXIgKTogdGhpcztcblxuICBsaW5lRGFzaE9mZnNldDogbnVtYmVyO1xuXG4gIGdldExpbmVEYXNoT2Zmc2V0KCk6IG51bWJlcjtcblxuICBzZXRMaW5lU3R5bGVzKCBsaW5lU3R5bGVzOiBMaW5lU3R5bGVzICk6IHRoaXM7XG5cbiAgbGluZVN0eWxlczogTGluZVN0eWxlcztcblxuICBnZXRMaW5lU3R5bGVzKCk6IExpbmVTdHlsZXM7XG5cbiAgc2V0Q2FjaGVkUGFpbnRzKCBwYWludHM6IFRQYWludFtdICk6IHRoaXM7XG5cbiAgY2FjaGVkUGFpbnRzOiBUUGFpbnRbXTtcblxuICBnZXRDYWNoZWRQYWludHMoKTogVFBhaW50W107XG5cbiAgYWRkQ2FjaGVkUGFpbnQoIHBhaW50OiBUUGFpbnQgKTogdm9pZDtcblxuICByZW1vdmVDYWNoZWRQYWludCggcGFpbnQ6IFRQYWludCApOiB2b2lkO1xuXG4gIGJlZm9yZUNhbnZhc0ZpbGwoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyICk6IHZvaWQ7XG5cbiAgYWZ0ZXJDYW52YXNGaWxsKCB3cmFwcGVyOiBDYW52YXNDb250ZXh0V3JhcHBlciApOiB2b2lkO1xuXG4gIGJlZm9yZUNhbnZhc1N0cm9rZSggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIgKTogdm9pZDtcblxuICBhZnRlckNhbnZhc1N0cm9rZSggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIgKTogdm9pZDtcblxuICBnZXRDU1NGaWxsKCk6IHN0cmluZztcblxuICBnZXRTaW1wbGVDU1NTdHJva2UoKTogc3RyaW5nO1xuXG4gIGFwcGVuZEZpbGxhYmxlUHJvcFN0cmluZyggc3BhY2VzOiBzdHJpbmcsIHJlc3VsdDogc3RyaW5nICk6IHN0cmluZztcblxuICBhcHBlbmRTdHJva2FibGVQcm9wU3RyaW5nKCBzcGFjZXM6IHN0cmluZywgcmVzdWx0OiBzdHJpbmcgKTogc3RyaW5nO1xuXG4gIGdldEZpbGxSZW5kZXJlckJpdG1hc2soKTogbnVtYmVyO1xuXG4gIGdldFN0cm9rZVJlbmRlcmVyQml0bWFzaygpOiBudW1iZXI7XG5cbiAgaW52YWxpZGF0ZUZpbGwoKTogdm9pZDtcblxuICBpbnZhbGlkYXRlU3Ryb2tlKCk6IHZvaWQ7XG59XG5cbmNvbnN0IFBhaW50YWJsZSA9IG1lbW9pemUoIDxTdXBlclR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3RvcjxOb2RlPj4oIFR5cGU6IFN1cGVyVHlwZSApOiBTdXBlclR5cGUgJiBDb25zdHJ1Y3RvcjxUUGFpbnRhYmxlPiA9PiB7XG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGluaGVyaXRhbmNlKCBUeXBlICksIE5vZGUgKSwgJ09ubHkgTm9kZSBzdWJ0eXBlcyBzaG91bGQgbWl4IFBhaW50YWJsZScgKTtcblxuICByZXR1cm4gY2xhc3MgUGFpbnRhYmxlTWl4aW4gZXh0ZW5kcyBUeXBlIGltcGxlbWVudHMgVFBhaW50YWJsZSB7XG5cbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICBwdWJsaWMgX2ZpbGw6IFRQYWludDtcbiAgICBwdWJsaWMgX2ZpbGxQaWNrYWJsZTogYm9vbGVhbjtcblxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICAgIHB1YmxpYyBfc3Ryb2tlOiBUUGFpbnQ7XG4gICAgcHVibGljIF9zdHJva2VQaWNrYWJsZTogYm9vbGVhbjtcblxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICAgIHB1YmxpYyBfY2FjaGVkUGFpbnRzOiBQYWludFtdO1xuICAgIHB1YmxpYyBfbGluZURyYXdpbmdTdHlsZXM6IExpbmVTdHlsZXM7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoIC4uLmFyZ3M6IEludGVudGlvbmFsQW55W10gKSB7XG4gICAgICBzdXBlciggLi4uYXJncyApO1xuXG4gICAgICBhc3NlcnRIYXNQcm9wZXJ0aWVzKCB0aGlzLCBbICdfZHJhd2FibGVzJyBdICk7XG5cbiAgICAgIHRoaXMuX2ZpbGwgPSBERUZBVUxUX09QVElPTlMuZmlsbDtcbiAgICAgIHRoaXMuX2ZpbGxQaWNrYWJsZSA9IERFRkFVTFRfT1BUSU9OUy5maWxsUGlja2FibGU7XG5cbiAgICAgIHRoaXMuX3N0cm9rZSA9IERFRkFVTFRfT1BUSU9OUy5zdHJva2U7XG4gICAgICB0aGlzLl9zdHJva2VQaWNrYWJsZSA9IERFRkFVTFRfT1BUSU9OUy5zdHJva2VQaWNrYWJsZTtcblxuICAgICAgdGhpcy5fY2FjaGVkUGFpbnRzID0gW107XG4gICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcyA9IG5ldyBMaW5lU3R5bGVzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgZmlsbCBjb2xvciBmb3IgdGhlIE5vZGUuXG4gICAgICpcbiAgICAgKiBUaGUgZmlsbCBkZXRlcm1pbmVzIHRoZSBhcHBlYXJhbmNlIG9mIHRoZSBpbnRlcmlvciBwYXJ0IG9mIGEgUGF0aCBvciBUZXh0LlxuICAgICAqXG4gICAgICogUGxlYXNlIHVzZSBudWxsIGZvciBpbmRpY2F0aW5nIFwibm8gZmlsbFwiICh0aGF0IGlzIHRoZSBkZWZhdWx0KS4gU3RyaW5ncyBhbmQgU2NlbmVyeSBDb2xvciBvYmplY3RzIGNhbiBiZVxuICAgICAqIHByb3ZpZGVkIGZvciBhIHNpbmdsZS1jb2xvciBmbGF0IGFwcGVhcmFuY2UsIGFuZCBjYW4gYmUgd3JhcHBlZCB3aXRoIGFuIEF4b24gUHJvcGVydHkuIEdyYWRpZW50cyBhbmQgcGF0dGVybnNcbiAgICAgKiBjYW4gYWxzbyBiZSBwcm92aWRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RmlsbCggZmlsbDogVFBhaW50ICk6IHRoaXMge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggUGFpbnREZWYuaXNQYWludERlZiggZmlsbCApLCAnSW52YWxpZCBmaWxsIHR5cGUnICk7XG5cbiAgICAgIGlmICggYXNzZXJ0ICYmIHR5cGVvZiBmaWxsID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgQ29sb3IuY2hlY2tQYWludFN0cmluZyggZmlsbCApO1xuICAgICAgfVxuXG4gICAgICAvLyBJbnN0YW5jZSBlcXVhbGl0eSB1c2VkIGhlcmUgc2luY2UgaXQgd291bGQgYmUgbW9yZSBleHBlbnNpdmUgdG8gcGFyc2UgYWxsIENTU1xuICAgICAgLy8gY29sb3JzIGFuZCBjb21wYXJlIGV2ZXJ5IHRpbWUgdGhlIGZpbGwgY2hhbmdlcy4gUmlnaHQgbm93LCB1c3VhbGx5IHdlIGRvbid0IGhhdmVcbiAgICAgIC8vIHRvIHBhcnNlIENTUyBjb2xvcnMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMjU1XG4gICAgICBpZiAoIHRoaXMuX2ZpbGwgIT09IGZpbGwgKSB7XG4gICAgICAgIHRoaXMuX2ZpbGwgPSBmaWxsO1xuXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUZpbGwoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZmlsbCggdmFsdWU6IFRQYWludCApIHsgdGhpcy5zZXRGaWxsKCB2YWx1ZSApOyB9XG5cbiAgICBwdWJsaWMgZ2V0IGZpbGwoKTogVFBhaW50IHsgcmV0dXJuIHRoaXMuZ2V0RmlsbCgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBmaWxsIChpZiBhbnkpIGZvciB0aGlzIE5vZGUuXG4gICAgICovXG4gICAgcHVibGljIGdldEZpbGwoKTogVFBhaW50IHtcbiAgICAgIHJldHVybiB0aGlzLl9maWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGVyZSBpcyBhIGZpbGwgYXBwbGllZCB0byB0aGlzIE5vZGUuXG4gICAgICovXG4gICAgcHVibGljIGhhc0ZpbGwoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGaWxsVmFsdWUoKSAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgcHJvcGVydHktdW53cmFwcGVkIGZpbGwgaWYgYXBwbGljYWJsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RmlsbFZhbHVlKCk6IG51bGwgfCBzdHJpbmcgfCBDb2xvciB8IExpbmVhckdyYWRpZW50IHwgUmFkaWFsR3JhZGllbnQgfCBQYXR0ZXJuIHwgUGFpbnQge1xuICAgICAgY29uc3QgZmlsbCA9IHRoaXMuZ2V0RmlsbCgpO1xuXG4gICAgICByZXR1cm4gaXNUUmVhZE9ubHlQcm9wZXJ0eSggZmlsbCApID8gZmlsbC5nZXQoKSA6IGZpbGw7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBmaWxsVmFsdWUoKTogbnVsbCB8IHN0cmluZyB8IENvbG9yIHwgTGluZWFyR3JhZGllbnQgfCBSYWRpYWxHcmFkaWVudCB8IFBhdHRlcm4gfCBQYWludCB7IHJldHVybiB0aGlzLmdldEZpbGxWYWx1ZSgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBzdHJva2UgY29sb3IgZm9yIHRoZSBOb2RlLlxuICAgICAqXG4gICAgICogVGhlIHN0cm9rZSBkZXRlcm1pbmVzIHRoZSBhcHBlYXJhbmNlIG9mIHRoZSByZWdpb24gYWxvbmcgdGhlIGJvdW5kYXJ5IG9mIHRoZSBQYXRoIG9yIFRleHQuIFRoZSBzaGFwZSBvZiB0aGVcbiAgICAgKiBzdHJva2VkIGFyZWEgZGVwZW5kcyBvbiB0aGUgYmFzZSBzaGFwZSAodGhhdCBvZiB0aGUgUGF0aCBvciBUZXh0KSBhbmQgbXVsdGlwbGUgcGFyYW1ldGVyczpcbiAgICAgKiBsaW5lV2lkdGgvbGluZUNhcC9saW5lSm9pbi9taXRlckxpbWl0L2xpbmVEYXNoL2xpbmVEYXNoT2Zmc2V0LiBJdCB3aWxsIGJlIGRyYXduIG9uIHRvcCBvZiBhbnkgZmlsbCBvbiB0aGVcbiAgICAgKiBzYW1lIE5vZGUuXG4gICAgICpcbiAgICAgKiBQbGVhc2UgdXNlIG51bGwgZm9yIGluZGljYXRpbmcgXCJubyBzdHJva2VcIiAodGhhdCBpcyB0aGUgZGVmYXVsdCkuIFN0cmluZ3MgYW5kIFNjZW5lcnkgQ29sb3Igb2JqZWN0cyBjYW4gYmVcbiAgICAgKiBwcm92aWRlZCBmb3IgYSBzaW5nbGUtY29sb3IgZmxhdCBhcHBlYXJhbmNlLCBhbmQgY2FuIGJlIHdyYXBwZWQgd2l0aCBhbiBBeG9uIFByb3BlcnR5LiBHcmFkaWVudHMgYW5kIHBhdHRlcm5zXG4gICAgICogY2FuIGFsc28gYmUgcHJvdmlkZWQuXG4gICAgICovXG4gICAgcHVibGljIHNldFN0cm9rZSggc3Ryb2tlOiBUUGFpbnQgKTogdGhpcyB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQYWludERlZi5pc1BhaW50RGVmKCBzdHJva2UgKSwgJ0ludmFsaWQgc3Ryb2tlIHR5cGUnICk7XG5cbiAgICAgIGlmICggYXNzZXJ0ICYmIHR5cGVvZiBzdHJva2UgPT09ICdzdHJpbmcnICkge1xuICAgICAgICBDb2xvci5jaGVja1BhaW50U3RyaW5nKCBzdHJva2UgKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW5zdGFuY2UgZXF1YWxpdHkgdXNlZCBoZXJlIHNpbmNlIGl0IHdvdWxkIGJlIG1vcmUgZXhwZW5zaXZlIHRvIHBhcnNlIGFsbCBDU1NcbiAgICAgIC8vIGNvbG9ycyBhbmQgY29tcGFyZSBldmVyeSB0aW1lIHRoZSBmaWxsIGNoYW5nZXMuIFJpZ2h0IG5vdywgdXN1YWxseSB3ZSBkb24ndCBoYXZlXG4gICAgICAvLyB0byBwYXJzZSBDU1MgY29sb3JzLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzI1NVxuICAgICAgaWYgKCB0aGlzLl9zdHJva2UgIT09IHN0cm9rZSApIHtcbiAgICAgICAgdGhpcy5fc3Ryb2tlID0gc3Ryb2tlO1xuXG4gICAgICAgIGlmICggYXNzZXJ0ICYmIHN0cm9rZSBpbnN0YW5jZW9mIFBhaW50ICYmIHN0cm9rZS50cmFuc2Zvcm1NYXRyaXggKSB7XG4gICAgICAgICAgY29uc3Qgc2NhbGVWZWN0b3IgPSBzdHJva2UudHJhbnNmb3JtTWF0cml4LmdldFNjYWxlVmVjdG9yKCk7XG4gICAgICAgICAgYXNzZXJ0KCBNYXRoLmFicyggc2NhbGVWZWN0b3IueCAtIHNjYWxlVmVjdG9yLnkgKSA8IDFlLTcsICdZb3UgY2Fubm90IHNwZWNpZnkgYSBwYXR0ZXJuIG9yIGdyYWRpZW50IHRvIGEgc3Ryb2tlIHRoYXQgZG9lcyBub3QgaGF2ZSBhIHN5bW1ldHJpYyBzY2FsZS4nICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlU3Ryb2tlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHN0cm9rZSggdmFsdWU6IFRQYWludCApIHsgdGhpcy5zZXRTdHJva2UoIHZhbHVlICk7IH1cblxuICAgIHB1YmxpYyBnZXQgc3Ryb2tlKCk6IFRQYWludCB7IHJldHVybiB0aGlzLmdldFN0cm9rZSgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzdHJva2UgKGlmIGFueSkgZm9yIHRoaXMgTm9kZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U3Ryb2tlKCk6IFRQYWludCB7XG4gICAgICByZXR1cm4gdGhpcy5fc3Ryb2tlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGVyZSBpcyBhIHN0cm9rZSBhcHBsaWVkIHRvIHRoaXMgTm9kZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgaGFzU3Ryb2tlKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0U3Ryb2tlVmFsdWUoKSAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlcmUgd2lsbCBhcHBlYXIgdG8gYmUgYSBzdHJva2UgZm9yIHRoaXMgTm9kZS4gUHJvcGVybHkgaGFuZGxlcyB0aGUgbGluZVdpZHRoOjAgY2FzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgaGFzUGFpbnRhYmxlU3Ryb2tlKCk6IGJvb2xlYW4ge1xuICAgICAgLy8gU2hvdWxkIG5vdCBiZSBzdHJva2VkIGlmIHRoZSBsaW5lV2lkdGggaXMgMCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy82NThcbiAgICAgIC8vIGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNTIzXG4gICAgICByZXR1cm4gdGhpcy5oYXNTdHJva2UoKSAmJiB0aGlzLmdldExpbmVXaWR0aCgpID4gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgcHJvcGVydHktdW53cmFwcGVkIHN0cm9rZSBpZiBhcHBsaWNhYmxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTdHJva2VWYWx1ZSgpOiBudWxsIHwgc3RyaW5nIHwgQ29sb3IgfCBMaW5lYXJHcmFkaWVudCB8IFJhZGlhbEdyYWRpZW50IHwgUGF0dGVybiB8IFBhaW50IHtcbiAgICAgIGNvbnN0IHN0cm9rZSA9IHRoaXMuZ2V0U3Ryb2tlKCk7XG5cbiAgICAgIHJldHVybiBpc1RSZWFkT25seVByb3BlcnR5KCBzdHJva2UgKSA/IHN0cm9rZS5nZXQoKSA6IHN0cm9rZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHN0cm9rZVZhbHVlKCk6IG51bGwgfCBzdHJpbmcgfCBDb2xvciB8IExpbmVhckdyYWRpZW50IHwgUmFkaWFsR3JhZGllbnQgfCBQYXR0ZXJuIHwgUGFpbnQgeyByZXR1cm4gdGhpcy5nZXRTdHJva2VWYWx1ZSgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHdoZXRoZXIgdGhlIGZpbGwgaXMgbWFya2VkIGFzIHBpY2thYmxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRGaWxsUGlja2FibGUoIHBpY2thYmxlOiBib29sZWFuICk6IHRoaXMge1xuICAgICAgaWYgKCB0aGlzLl9maWxsUGlja2FibGUgIT09IHBpY2thYmxlICkge1xuICAgICAgICB0aGlzLl9maWxsUGlja2FibGUgPSBwaWNrYWJsZTtcblxuICAgICAgICAvLyBUT0RPOiBiZXR0ZXIgd2F5IG9mIGluZGljYXRpbmcgdGhhdCBvbmx5IHRoZSBOb2RlIHVuZGVyIHBvaW50ZXJzIGNvdWxkIGhhdmUgY2hhbmdlZCwgYnV0IG5vIHBhaW50IGNoYW5nZSBpcyBuZWVkZWQ/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUZpbGwoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZmlsbFBpY2thYmxlKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRGaWxsUGlja2FibGUoIHZhbHVlICk7IH1cblxuICAgIHB1YmxpYyBnZXQgZmlsbFBpY2thYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc0ZpbGxQaWNrYWJsZSgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGZpbGwgaXMgbWFya2VkIGFzIHBpY2thYmxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0ZpbGxQaWNrYWJsZSgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLl9maWxsUGlja2FibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB3aGV0aGVyIHRoZSBzdHJva2UgaXMgbWFya2VkIGFzIHBpY2thYmxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRTdHJva2VQaWNrYWJsZSggcGlja2FibGU6IGJvb2xlYW4gKTogdGhpcyB7XG5cbiAgICAgIGlmICggdGhpcy5fc3Ryb2tlUGlja2FibGUgIT09IHBpY2thYmxlICkge1xuICAgICAgICB0aGlzLl9zdHJva2VQaWNrYWJsZSA9IHBpY2thYmxlO1xuXG4gICAgICAgIC8vIFRPRE86IGJldHRlciB3YXkgb2YgaW5kaWNhdGluZyB0aGF0IG9ubHkgdGhlIE5vZGUgdW5kZXIgcG9pbnRlcnMgY291bGQgaGF2ZSBjaGFuZ2VkLCBidXQgbm8gcGFpbnQgY2hhbmdlIGlzIG5lZWRlZD8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlU3Ryb2tlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHN0cm9rZVBpY2thYmxlKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRTdHJva2VQaWNrYWJsZSggdmFsdWUgKTsgfVxuXG4gICAgcHVibGljIGdldCBzdHJva2VQaWNrYWJsZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaXNTdHJva2VQaWNrYWJsZSgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHN0cm9rZSBpcyBtYXJrZWQgYXMgcGlja2FibGUuXG4gICAgICovXG4gICAgcHVibGljIGlzU3Ryb2tlUGlja2FibGUoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5fc3Ryb2tlUGlja2FibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbGluZSB3aWR0aCB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byBzdHJva2VzIG9uIHRoaXMgTm9kZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TGluZVdpZHRoKCBsaW5lV2lkdGg6IG51bWJlciApOiB0aGlzIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpbmVXaWR0aCA+PSAwLCBgbGluZVdpZHRoIHNob3VsZCBiZSBub24tbmVnYXRpdmUgaW5zdGVhZCBvZiAke2xpbmVXaWR0aH1gICk7XG5cbiAgICAgIGlmICggdGhpcy5nZXRMaW5lV2lkdGgoKSAhPT0gbGluZVdpZHRoICkge1xuICAgICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVN0cm9rZSgpO1xuXG4gICAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcbiAgICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFBhaW50YWJsZURyYXdhYmxlICkubWFya0RpcnR5TGluZVdpZHRoKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgbGluZVdpZHRoKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldExpbmVXaWR0aCggdmFsdWUgKTsgfVxuXG4gICAgcHVibGljIGdldCBsaW5lV2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0TGluZVdpZHRoKCk7IH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGxpbmUgd2lkdGggdGhhdCB3b3VsZCBiZSBhcHBsaWVkIHRvIHN0cm9rZXMuXG4gICAgICovXG4gICAgcHVibGljIGdldExpbmVXaWR0aCgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVXaWR0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBsaW5lIGNhcCBzdHlsZS4gVGhlcmUgYXJlIHRocmVlIG9wdGlvbnM6XG4gICAgICogLSAnYnV0dCcgKHRoZSBkZWZhdWx0KSBzdG9wcyB0aGUgbGluZSBhdCB0aGUgZW5kIHBvaW50XG4gICAgICogLSAncm91bmQnIGRyYXdzIGEgc2VtaWNpcmN1bGFyIGFyYyBhcm91bmQgdGhlIGVuZCBwb2ludFxuICAgICAqIC0gJ3NxdWFyZScgZHJhd3MgYSBzcXVhcmUgb3V0bGluZSBhcm91bmQgdGhlIGVuZCBwb2ludCAobGlrZSBidXR0LCBidXQgZXh0ZW5kZWQgYnkgMS8yIGxpbmUgd2lkdGggb3V0KVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRMaW5lQ2FwKCBsaW5lQ2FwOiBMaW5lQ2FwICk6IHRoaXMge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGluZUNhcCA9PT0gJ2J1dHQnIHx8IGxpbmVDYXAgPT09ICdyb3VuZCcgfHwgbGluZUNhcCA9PT0gJ3NxdWFyZScsXG4gICAgICAgIGBsaW5lQ2FwIHNob3VsZCBiZSBvbmUgb2YgXCJidXR0XCIsIFwicm91bmRcIiBvciBcInNxdWFyZVwiLCBub3QgJHtsaW5lQ2FwfWAgKTtcblxuICAgICAgaWYgKCB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lQ2FwICE9PSBsaW5lQ2FwICkge1xuICAgICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lQ2FwID0gbGluZUNhcDtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlU3Ryb2tlKCk7XG5cbiAgICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlMaW5lT3B0aW9ucygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGxpbmVDYXAoIHZhbHVlOiBMaW5lQ2FwICkgeyB0aGlzLnNldExpbmVDYXAoIHZhbHVlICk7IH1cblxuICAgIHB1YmxpYyBnZXQgbGluZUNhcCgpOiBMaW5lQ2FwIHsgcmV0dXJuIHRoaXMuZ2V0TGluZUNhcCgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBsaW5lIGNhcCBzdHlsZSAoY29udHJvbHMgYXBwZWFyYW5jZSBhdCB0aGUgc3RhcnQvZW5kIG9mIHBhdGhzKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRMaW5lQ2FwKCk6IExpbmVDYXAge1xuICAgICAgcmV0dXJuIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVDYXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbGluZSBqb2luIHN0eWxlLiBUaGVyZSBhcmUgdGhyZWUgb3B0aW9uczpcbiAgICAgKiAtICdtaXRlcicgKGRlZmF1bHQpIGpvaW5zIGJ5IGV4dGVuZGluZyB0aGUgc2VnbWVudHMgb3V0IGluIGEgbGluZSB1bnRpbCB0aGV5IG1lZXQuIEZvciB2ZXJ5IHNoYXJwXG4gICAgICogICAgICAgICAgIGNvcm5lcnMsIHRoZXkgd2lsbCBiZSBjaG9wcGVkIG9mZiBhbmQgd2lsbCBhY3QgbGlrZSAnYmV2ZWwnLCBkZXBlbmRpbmcgb24gd2hhdCB0aGUgbWl0ZXJMaW1pdCBpcy5cbiAgICAgKiAtICdyb3VuZCcgZHJhd3MgYSBjaXJjdWxhciBhcmMgdG8gY29ubmVjdCB0aGUgdHdvIHN0cm9rZWQgYXJlYXMuXG4gICAgICogLSAnYmV2ZWwnIGNvbm5lY3RzIHdpdGggYSBzaW5nbGUgbGluZSBzZWdtZW50LlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRMaW5lSm9pbiggbGluZUpvaW46IExpbmVKb2luICk6IHRoaXMge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGluZUpvaW4gPT09ICdtaXRlcicgfHwgbGluZUpvaW4gPT09ICdyb3VuZCcgfHwgbGluZUpvaW4gPT09ICdiZXZlbCcsXG4gICAgICAgIGBsaW5lSm9pbiBzaG91bGQgYmUgb25lIG9mIFwibWl0ZXJcIiwgXCJyb3VuZFwiIG9yIFwiYmV2ZWxcIiwgbm90ICR7bGluZUpvaW59YCApO1xuXG4gICAgICBpZiAoIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVKb2luICE9PSBsaW5lSm9pbiApIHtcbiAgICAgICAgdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubGluZUpvaW4gPSBsaW5lSm9pbjtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlU3Ryb2tlKCk7XG5cbiAgICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlMaW5lT3B0aW9ucygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGxpbmVKb2luKCB2YWx1ZTogTGluZUpvaW4gKSB7IHRoaXMuc2V0TGluZUpvaW4oIHZhbHVlICk7IH1cblxuICAgIHB1YmxpYyBnZXQgbGluZUpvaW4oKTogTGluZUpvaW4geyByZXR1cm4gdGhpcy5nZXRMaW5lSm9pbigpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGxpbmUgam9pbiBzdHlsZSAoY29udHJvbHMgam9pbiBhcHBlYXJhbmNlIGJldHdlZW4gZHJhd24gc2VnbWVudHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRMaW5lSm9pbigpOiBMaW5lSm9pbiB7XG4gICAgICByZXR1cm4gdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubGluZUpvaW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbWl0ZXJMaW1pdCB2YWx1ZS4gVGhpcyBkZXRlcm1pbmVzIGhvdyBzaGFycCBhIGNvcm5lciB3aXRoIGxpbmVKb2luOiAnbWl0ZXInIHdpbGwgbmVlZCB0byBiZSBiZWZvcmVcbiAgICAgKiBpdCBnZXRzIGN1dCBvZmYgdG8gdGhlICdiZXZlbCcgYmVoYXZpb3IuXG4gICAgICovXG4gICAgcHVibGljIHNldE1pdGVyTGltaXQoIG1pdGVyTGltaXQ6IG51bWJlciApOiB0aGlzIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBtaXRlckxpbWl0ICksICdtaXRlckxpbWl0IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XG5cbiAgICAgIGlmICggdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubWl0ZXJMaW1pdCAhPT0gbWl0ZXJMaW1pdCApIHtcbiAgICAgICAgdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubWl0ZXJMaW1pdCA9IG1pdGVyTGltaXQ7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVN0cm9rZSgpO1xuXG4gICAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcbiAgICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFBhaW50YWJsZURyYXdhYmxlICkubWFya0RpcnR5TGluZU9wdGlvbnMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBtaXRlckxpbWl0KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldE1pdGVyTGltaXQoIHZhbHVlICk7IH1cblxuICAgIHB1YmxpYyBnZXQgbWl0ZXJMaW1pdCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRNaXRlckxpbWl0KCk7IH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG1pdGVyTGltaXQgdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIGdldE1pdGVyTGltaXQoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5taXRlckxpbWl0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGxpbmUgZGFzaCBwYXR0ZXJuLiBTaG91bGQgYmUgYW4gYXJyYXkgb2YgbnVtYmVycyBcIm9uXCIgYW5kIFwib2ZmXCIgYWx0ZXJuYXRpbmcuIEFuIGVtcHR5IGFycmF5XG4gICAgICogaW5kaWNhdGVzIG5vIGRhc2hpbmcuXG4gICAgICovXG4gICAgcHVibGljIHNldExpbmVEYXNoKCBsaW5lRGFzaDogbnVtYmVyW10gKTogdGhpcyB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBsaW5lRGFzaCApICYmIGxpbmVEYXNoLmV2ZXJ5KCBuID0+IHR5cGVvZiBuID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggbiApICYmIG4gPj0gMCApLFxuICAgICAgICAnbGluZURhc2ggc2hvdWxkIGJlIGFuIGFycmF5IG9mIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVycycgKTtcblxuICAgICAgaWYgKCB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lRGFzaCAhPT0gbGluZURhc2ggKSB7XG4gICAgICAgIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVEYXNoID0gbGluZURhc2ggfHwgW107XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVN0cm9rZSgpO1xuXG4gICAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcbiAgICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFBhaW50YWJsZURyYXdhYmxlICkubWFya0RpcnR5TGluZU9wdGlvbnMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBsaW5lRGFzaCggdmFsdWU6IG51bWJlcltdICkgeyB0aGlzLnNldExpbmVEYXNoKCB2YWx1ZSApOyB9XG5cbiAgICBwdWJsaWMgZ2V0IGxpbmVEYXNoKCk6IG51bWJlcltdIHsgcmV0dXJuIHRoaXMuZ2V0TGluZURhc2goKTsgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbGluZSBkYXNoIHBhdHRlcm4uIEFuIGVtcHR5IGFycmF5IGlzIHRoZSBkZWZhdWx0LCBpbmRpY2F0aW5nIG5vIGRhc2hpbmcuXG4gICAgICovXG4gICAgcHVibGljIGdldExpbmVEYXNoKCk6IG51bWJlcltdIHtcbiAgICAgIHJldHVybiB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lRGFzaDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHN0cm9rZSB3aWxsIGJlIGRhc2hlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgaGFzTGluZURhc2goKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gISF0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lRGFzaC5sZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgb2Zmc2V0IG9mIHRoZSBsaW5lIGRhc2ggcGF0dGVybiBmcm9tIHRoZSBzdGFydCBvZiB0aGUgc3Ryb2tlLiBEZWZhdWx0cyB0byAwLlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRMaW5lRGFzaE9mZnNldCggbGluZURhc2hPZmZzZXQ6IG51bWJlciApOiB0aGlzIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBsaW5lRGFzaE9mZnNldCApLFxuICAgICAgICBgbGluZURhc2hPZmZzZXQgc2hvdWxkIGJlIGEgbnVtYmVyLCBub3QgJHtsaW5lRGFzaE9mZnNldH1gICk7XG5cbiAgICAgIGlmICggdGhpcy5fbGluZURyYXdpbmdTdHlsZXMubGluZURhc2hPZmZzZXQgIT09IGxpbmVEYXNoT2Zmc2V0ICkge1xuICAgICAgICB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcy5saW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xuICAgICAgICB0aGlzLmludmFsaWRhdGVTdHJva2UoKTtcblxuICAgICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XG4gICAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRQYWludGFibGVEcmF3YWJsZSApLm1hcmtEaXJ0eUxpbmVPcHRpb25zKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgbGluZURhc2hPZmZzZXQoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0TGluZURhc2hPZmZzZXQoIHZhbHVlICk7IH1cblxuICAgIHB1YmxpYyBnZXQgbGluZURhc2hPZmZzZXQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0TGluZURhc2hPZmZzZXQoKTsgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgb2Zmc2V0IG9mIHRoZSBsaW5lIGRhc2ggcGF0dGVybiBmcm9tIHRoZSBzdGFydCBvZiB0aGUgc3Ryb2tlLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRMaW5lRGFzaE9mZnNldCgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzLmxpbmVEYXNoT2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIExpbmVTdHlsZXMgb2JqZWN0IChpdCBkZXRlcm1pbmVzIHN0cm9rZSBhcHBlYXJhbmNlKS4gVGhlIHBhc3NlZC1pbiBvYmplY3Qgd2lsbCBiZSBtdXRhdGVkIGFzIG5lZWRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TGluZVN0eWxlcyggbGluZVN0eWxlczogTGluZVN0eWxlcyApOiB0aGlzIHtcbiAgICAgIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzID0gbGluZVN0eWxlcztcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVN0cm9rZSgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBsaW5lU3R5bGVzKCB2YWx1ZTogTGluZVN0eWxlcyApIHsgdGhpcy5zZXRMaW5lU3R5bGVzKCB2YWx1ZSApOyB9XG5cbiAgICBwdWJsaWMgZ2V0IGxpbmVTdHlsZXMoKTogTGluZVN0eWxlcyB7IHJldHVybiB0aGlzLmdldExpbmVTdHlsZXMoKTsgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29tcG9zaXRlIHtMaW5lU3R5bGVzfSBvYmplY3QsIHRoYXQgZGV0ZXJtaW5lcyBzdHJva2UgYXBwZWFyYW5jZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TGluZVN0eWxlcygpOiBMaW5lU3R5bGVzIHtcbiAgICAgIHJldHVybiB0aGlzLl9saW5lRHJhd2luZ1N0eWxlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBjYWNoZWQgcGFpbnRzIHRvIHRoZSBpbnB1dCBhcnJheSAoYSBkZWZlbnNpdmUgY29weSkuIE5vdGUgdGhhdCBpdCBhbHNvIGZpbHRlcnMgb3V0IGZpbGxzIHRoYXQgYXJlXG4gICAgICogbm90IGNvbnNpZGVyZWQgcGFpbnRzIChlLmcuIHN0cmluZ3MsIENvbG9ycywgZXRjLikuXG4gICAgICpcbiAgICAgKiBXaGVuIHRoaXMgTm9kZSBpcyBkaXNwbGF5ZWQgaW4gU1ZHLCBpdCB3aWxsIGZvcmNlIHRoZSBwcmVzZW5jZSBvZiB0aGUgY2FjaGVkIHBhaW50IHRvIGJlIHN0b3JlZCBpbiB0aGUgU1ZHJ3NcbiAgICAgKiA8ZGVmcz4gZWxlbWVudCwgc28gdGhhdCB3ZSBjYW4gc3dpdGNoIHF1aWNrbHkgdG8gdXNlIHRoZSBnaXZlbiBwYWludCAoaW5zdGVhZCBvZiBoYXZpbmcgdG8gY3JlYXRlIGl0IG9uIHRoZVxuICAgICAqIFNWRy1zaWRlIHdoZW5ldmVyIHRoZSBzd2l0Y2ggaXMgbWFkZSkuXG4gICAgICpcbiAgICAgKiBBbHNvIG5vdGUgdGhhdCBkdXBsaWNhdGUgcGFpbnRzIGFyZSBhY2NlcHRhYmxlLCBhbmQgZG9uJ3QgbmVlZCB0byBiZSBmaWx0ZXJlZCBvdXQgYmVmb3JlLWhhbmQuXG4gICAgICovXG4gICAgcHVibGljIHNldENhY2hlZFBhaW50cyggcGFpbnRzOiBUUGFpbnRbXSApOiB0aGlzIHtcbiAgICAgIHRoaXMuX2NhY2hlZFBhaW50cyA9IHBhaW50cy5maWx0ZXIoICggcGFpbnQ6IFRQYWludCApOiBwYWludCBpcyBQYWludCA9PiBwYWludCBpbnN0YW5jZW9mIFBhaW50ICk7XG5cbiAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlDYWNoZWRQYWludHMoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBjYWNoZWRQYWludHMoIHZhbHVlOiBUUGFpbnRbXSApIHsgdGhpcy5zZXRDYWNoZWRQYWludHMoIHZhbHVlICk7IH1cblxuICAgIHB1YmxpYyBnZXQgY2FjaGVkUGFpbnRzKCk6IFRQYWludFtdIHsgcmV0dXJuIHRoaXMuZ2V0Q2FjaGVkUGFpbnRzKCk7IH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNhY2hlZCBwYWludHMuXG4gICAgICovXG4gICAgcHVibGljIGdldENhY2hlZFBhaW50cygpOiBUUGFpbnRbXSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkUGFpbnRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBjYWNoZWQgcGFpbnQuIERvZXMgbm90aGluZyBpZiBwYWludCBpcyBqdXN0IGEgbm9ybWFsIGZpbGwgKHN0cmluZywgQ29sb3IpLCBidXQgZm9yIGdyYWRpZW50cyBhbmRcbiAgICAgKiBwYXR0ZXJucywgaXQgd2lsbCBiZSBtYWRlIGZhc3RlciB0byBzd2l0Y2ggdG8uXG4gICAgICpcbiAgICAgKiBXaGVuIHRoaXMgTm9kZSBpcyBkaXNwbGF5ZWQgaW4gU1ZHLCBpdCB3aWxsIGZvcmNlIHRoZSBwcmVzZW5jZSBvZiB0aGUgY2FjaGVkIHBhaW50IHRvIGJlIHN0b3JlZCBpbiB0aGUgU1ZHJ3NcbiAgICAgKiA8ZGVmcz4gZWxlbWVudCwgc28gdGhhdCB3ZSBjYW4gc3dpdGNoIHF1aWNrbHkgdG8gdXNlIHRoZSBnaXZlbiBwYWludCAoaW5zdGVhZCBvZiBoYXZpbmcgdG8gY3JlYXRlIGl0IG9uIHRoZVxuICAgICAqIFNWRy1zaWRlIHdoZW5ldmVyIHRoZSBzd2l0Y2ggaXMgbWFkZSkuXG4gICAgICpcbiAgICAgKiBBbHNvIG5vdGUgdGhhdCBkdXBsaWNhdGUgcGFpbnRzIGFyZSBhY2NlcHRhYmxlLCBhbmQgZG9uJ3QgbmVlZCB0byBiZSBmaWx0ZXJlZCBvdXQgYmVmb3JlLWhhbmQuXG4gICAgICovXG4gICAgcHVibGljIGFkZENhY2hlZFBhaW50KCBwYWludDogVFBhaW50ICk6IHZvaWQge1xuICAgICAgaWYgKCBwYWludCBpbnN0YW5jZW9mIFBhaW50ICkge1xuICAgICAgICB0aGlzLl9jYWNoZWRQYWludHMucHVzaCggcGFpbnQgKTtcblxuICAgICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XG4gICAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRQYWludGFibGVEcmF3YWJsZSApLm1hcmtEaXJ0eUNhY2hlZFBhaW50cygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIGNhY2hlZCBwYWludC4gRG9lcyBub3RoaW5nIGlmIHBhaW50IGlzIGp1c3QgYSBub3JtYWwgZmlsbCAoc3RyaW5nLCBDb2xvciksIGJ1dCBmb3IgZ3JhZGllbnRzIGFuZFxuICAgICAqIHBhdHRlcm5zIGl0IHdpbGwgcmVtb3ZlIGFueSBleGlzdGluZyBjYWNoZWQgcGFpbnQuIElmIGl0IHdhcyBhZGRlZCBtb3JlIHRoYW4gb25jZSwgaXQgd2lsbCBuZWVkIHRvIGJlIHJlbW92ZWRcbiAgICAgKiBtb3JlIHRoYW4gb25jZS5cbiAgICAgKlxuICAgICAqIFdoZW4gdGhpcyBOb2RlIGlzIGRpc3BsYXllZCBpbiBTVkcsIGl0IHdpbGwgZm9yY2UgdGhlIHByZXNlbmNlIG9mIHRoZSBjYWNoZWQgcGFpbnQgdG8gYmUgc3RvcmVkIGluIHRoZSBTVkcnc1xuICAgICAqIDxkZWZzPiBlbGVtZW50LCBzbyB0aGF0IHdlIGNhbiBzd2l0Y2ggcXVpY2tseSB0byB1c2UgdGhlIGdpdmVuIHBhaW50IChpbnN0ZWFkIG9mIGhhdmluZyB0byBjcmVhdGUgaXQgb24gdGhlXG4gICAgICogU1ZHLXNpZGUgd2hlbmV2ZXIgdGhlIHN3aXRjaCBpcyBtYWRlKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlQ2FjaGVkUGFpbnQoIHBhaW50OiBUUGFpbnQgKTogdm9pZCB7XG4gICAgICBpZiAoIHBhaW50IGluc3RhbmNlb2YgUGFpbnQgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIHRoaXMuX2NhY2hlZFBhaW50cywgcGFpbnQgKSApO1xuXG4gICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLl9jYWNoZWRQYWludHMsIHBhaW50ICk7XG5cbiAgICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlDYWNoZWRQYWludHMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgdGhlIGZpbGwgdG8gYSBDYW52YXMgY29udGV4dCB3cmFwcGVyLCBiZWZvcmUgZmlsbGluZy4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGJlZm9yZUNhbnZhc0ZpbGwoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyICk6IHZvaWQge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5nZXRGaWxsVmFsdWUoKSAhPT0gbnVsbCApO1xuXG4gICAgICBjb25zdCBmaWxsVmFsdWUgPSB0aGlzLmdldEZpbGxWYWx1ZSgpITtcblxuICAgICAgd3JhcHBlci5zZXRGaWxsU3R5bGUoIGZpbGxWYWx1ZSApO1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEZvciBwZXJmb3JtYW5jZSwgd2UgY291bGQgY2hlY2sgdGhpcyBieSBydWxpbmcgb3V0IHN0cmluZyBhbmQgJ3RyYW5zZm9ybU1hdHJpeCcgaW4gZmlsbFZhbHVlXG4gICAgICBpZiAoIGZpbGxWYWx1ZS50cmFuc2Zvcm1NYXRyaXggKSB7XG4gICAgICAgIHdyYXBwZXIuY29udGV4dC5zYXZlKCk7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgZmlsbFZhbHVlLnRyYW5zZm9ybU1hdHJpeC5jYW52YXNBcHBlbmRUcmFuc2Zvcm0oIHdyYXBwZXIuY29udGV4dCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuLWFwcGxpZXMgdGhlIGZpbGwgdG8gYSBDYW52YXMgY29udGV4dCB3cmFwcGVyLCBhZnRlciBmaWxsaW5nLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgYWZ0ZXJDYW52YXNGaWxsKCB3cmFwcGVyOiBDYW52YXNDb250ZXh0V3JhcHBlciApOiB2b2lkIHtcbiAgICAgIGNvbnN0IGZpbGxWYWx1ZSA9IHRoaXMuZ2V0RmlsbFZhbHVlKCk7XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIGlmICggZmlsbFZhbHVlLnRyYW5zZm9ybU1hdHJpeCApIHtcbiAgICAgICAgd3JhcHBlci5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIHRoZSBzdHJva2UgdG8gYSBDYW52YXMgY29udGV4dCB3cmFwcGVyLCBiZWZvcmUgc3Ryb2tpbmcuIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBiZWZvcmVDYW52YXNTdHJva2UoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyICk6IHZvaWQge1xuICAgICAgY29uc3Qgc3Ryb2tlVmFsdWUgPSB0aGlzLmdldFN0cm9rZVZhbHVlKCk7XG5cbiAgICAgIC8vIFRPRE86IGlzIHRoZXJlIGEgYmV0dGVyIHdheSBvZiBub3QgY2FsbGluZyBzbyBtYW55IHRoaW5ncyBvbiBlYWNoIHN0cm9rZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIHdyYXBwZXIuc2V0U3Ryb2tlU3R5bGUoIHRoaXMuX3N0cm9rZSApO1xuICAgICAgd3JhcHBlci5zZXRMaW5lQ2FwKCB0aGlzLmdldExpbmVDYXAoKSApO1xuICAgICAgd3JhcHBlci5zZXRMaW5lSm9pbiggdGhpcy5nZXRMaW5lSm9pbigpICk7XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBmb3IgcGVyZm9ybWFuY2VcbiAgICAgIGlmICggc3Ryb2tlVmFsdWUudHJhbnNmb3JtTWF0cml4ICkge1xuXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgY29uc3Qgc2NhbGVWZWN0b3I6IFZlY3RvcjIgPSBzdHJva2VWYWx1ZS50cmFuc2Zvcm1NYXRyaXguZ2V0U2NhbGVWZWN0b3IoKTtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIHNjYWxlVmVjdG9yLnggLSBzY2FsZVZlY3Rvci55ICkgPCAxZS03LCAnWW91IGNhbm5vdCBzcGVjaWZ5IGEgcGF0dGVybiBvciBncmFkaWVudCB0byBhIHN0cm9rZSB0aGF0IGRvZXMgbm90IGhhdmUgYSBzeW1tZXRyaWMgc2NhbGUuJyApO1xuICAgICAgICBjb25zdCBtYXRyaXhNdWx0aXBsaWVyID0gMSAvIHNjYWxlVmVjdG9yLng7XG5cbiAgICAgICAgd3JhcHBlci5jb250ZXh0LnNhdmUoKTtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBzdHJva2VWYWx1ZS50cmFuc2Zvcm1NYXRyaXguY2FudmFzQXBwZW5kVHJhbnNmb3JtKCB3cmFwcGVyLmNvbnRleHQgKTtcblxuICAgICAgICB3cmFwcGVyLnNldExpbmVXaWR0aCggdGhpcy5nZXRMaW5lV2lkdGgoKSAqIG1hdHJpeE11bHRpcGxpZXIgKTtcbiAgICAgICAgd3JhcHBlci5zZXRNaXRlckxpbWl0KCB0aGlzLmdldE1pdGVyTGltaXQoKSAqIG1hdHJpeE11bHRpcGxpZXIgKTtcbiAgICAgICAgd3JhcHBlci5zZXRMaW5lRGFzaCggdGhpcy5nZXRMaW5lRGFzaCgpLm1hcCggZGFzaCA9PiBkYXNoICogbWF0cml4TXVsdGlwbGllciApICk7XG4gICAgICAgIHdyYXBwZXIuc2V0TGluZURhc2hPZmZzZXQoIHRoaXMuZ2V0TGluZURhc2hPZmZzZXQoKSAqIG1hdHJpeE11bHRpcGxpZXIgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB3cmFwcGVyLnNldExpbmVXaWR0aCggdGhpcy5nZXRMaW5lV2lkdGgoKSApO1xuICAgICAgICB3cmFwcGVyLnNldE1pdGVyTGltaXQoIHRoaXMuZ2V0TWl0ZXJMaW1pdCgpICk7XG4gICAgICAgIHdyYXBwZXIuc2V0TGluZURhc2goIHRoaXMuZ2V0TGluZURhc2goKSApO1xuICAgICAgICB3cmFwcGVyLnNldExpbmVEYXNoT2Zmc2V0KCB0aGlzLmdldExpbmVEYXNoT2Zmc2V0KCkgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbi1hcHBsaWVzIHRoZSBzdHJva2UgdG8gYSBDYW52YXMgY29udGV4dCB3cmFwcGVyLCBhZnRlciBzdHJva2luZy4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGFmdGVyQ2FudmFzU3Ryb2tlKCB3cmFwcGVyOiBDYW52YXNDb250ZXh0V3JhcHBlciApOiB2b2lkIHtcbiAgICAgIGNvbnN0IHN0cm9rZVZhbHVlID0gdGhpcy5nZXRTdHJva2VWYWx1ZSgpO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gZm9yIHBlcmZvcm1hbmNlXG4gICAgICBpZiAoIHN0cm9rZVZhbHVlLnRyYW5zZm9ybU1hdHJpeCApIHtcbiAgICAgICAgd3JhcHBlci5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiBhcHBsaWNhYmxlLCByZXR1cm5zIHRoZSBDU1MgY29sb3IgZm9yIHRoZSBmaWxsLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRDU1NGaWxsKCk6IHN0cmluZyB7XG4gICAgICBjb25zdCBmaWxsVmFsdWUgPSB0aGlzLmdldEZpbGxWYWx1ZSgpO1xuICAgICAgLy8gaWYgaXQncyBhIENvbG9yIG9iamVjdCwgZ2V0IHRoZSBjb3JyZXNwb25kaW5nIENTU1xuICAgICAgLy8gJ3RyYW5zcGFyZW50JyB3aWxsIG1ha2UgdXMgaW52aXNpYmxlIGlmIHRoZSBmaWxsIGlzIG51bGxcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSB0b0NTUyBjaGVja3MgZm9yIGNvbG9yLCBsZWZ0IGZvciBwZXJmb3JtYW5jZVxuICAgICAgcmV0dXJuIGZpbGxWYWx1ZSA/ICggZmlsbFZhbHVlLnRvQ1NTID8gZmlsbFZhbHVlLnRvQ1NTKCkgOiBmaWxsVmFsdWUgKSA6ICd0cmFuc3BhcmVudCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgYXBwbGljYWJsZSwgcmV0dXJucyB0aGUgQ1NTIGNvbG9yIGZvciB0aGUgc3Ryb2tlLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTaW1wbGVDU1NTdHJva2UoKTogc3RyaW5nIHtcbiAgICAgIGNvbnN0IHN0cm9rZVZhbHVlID0gdGhpcy5nZXRTdHJva2VWYWx1ZSgpO1xuICAgICAgLy8gaWYgaXQncyBhIENvbG9yIG9iamVjdCwgZ2V0IHRoZSBjb3JyZXNwb25kaW5nIENTU1xuICAgICAgLy8gJ3RyYW5zcGFyZW50JyB3aWxsIG1ha2UgdXMgaW52aXNpYmxlIGlmIHRoZSBmaWxsIGlzIG51bGxcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSB0b0NTUyBjaGVja3MgZm9yIGNvbG9yLCBsZWZ0IGZvciBwZXJmb3JtYW5jZVxuICAgICAgcmV0dXJuIHN0cm9rZVZhbHVlID8gKCBzdHJva2VWYWx1ZS50b0NTUyA/IHN0cm9rZVZhbHVlLnRvQ1NTKCkgOiBzdHJva2VWYWx1ZSApIDogJ3RyYW5zcGFyZW50JztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBmaWxsLXNwZWNpZmljIHByb3BlcnR5IHN0cmluZyBmb3IgdXNlIHdpdGggdG9TdHJpbmcoKS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3BhY2VzIC0gV2hpdGVzcGFjZSB0byBhZGRcbiAgICAgKiBAcGFyYW0gcmVzdWx0XG4gICAgICovXG4gICAgcHVibGljIGFwcGVuZEZpbGxhYmxlUHJvcFN0cmluZyggc3BhY2VzOiBzdHJpbmcsIHJlc3VsdDogc3RyaW5nICk6IHN0cmluZyB7XG4gICAgICBpZiAoIHRoaXMuX2ZpbGwgKSB7XG4gICAgICAgIGlmICggcmVzdWx0ICkge1xuICAgICAgICAgIHJlc3VsdCArPSAnLFxcbic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCB0eXBlb2YgdGhpcy5nZXRGaWxsVmFsdWUoKSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgcmVzdWx0ICs9IGAke3NwYWNlc31maWxsOiAnJHt0aGlzLmdldEZpbGxWYWx1ZSgpfSdgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJlc3VsdCArPSBgJHtzcGFjZXN9ZmlsbDogJHt0aGlzLmdldEZpbGxWYWx1ZSgpfWA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzdHJva2Utc3BlY2lmaWMgcHJvcGVydHkgc3RyaW5nIGZvciB1c2Ugd2l0aCB0b1N0cmluZygpLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzcGFjZXMgLSBXaGl0ZXNwYWNlIHRvIGFkZFxuICAgICAqIEBwYXJhbSByZXN1bHRcbiAgICAgKi9cbiAgICBwdWJsaWMgYXBwZW5kU3Ryb2thYmxlUHJvcFN0cmluZyggc3BhY2VzOiBzdHJpbmcsIHJlc3VsdDogc3RyaW5nICk6IHN0cmluZyB7XG4gICAgICBmdW5jdGlvbiBhZGRQcm9wKCBrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgbm93cmFwPzogYm9vbGVhbiApOiB2b2lkIHtcbiAgICAgICAgaWYgKCByZXN1bHQgKSB7XG4gICAgICAgICAgcmVzdWx0ICs9ICcsXFxuJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoICFub3dyYXAgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICByZXN1bHQgKz0gYCR7c3BhY2VzICsga2V5fTogJyR7dmFsdWV9J2A7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVzdWx0ICs9IGAke3NwYWNlcyArIGtleX06ICR7dmFsdWV9YDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIHRoaXMuX3N0cm9rZSApIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdFN0eWxlcyA9IG5ldyBMaW5lU3R5bGVzKCk7XG4gICAgICAgIGNvbnN0IHN0cm9rZVZhbHVlID0gdGhpcy5nZXRTdHJva2VWYWx1ZSgpO1xuICAgICAgICBpZiAoIHR5cGVvZiBzdHJva2VWYWx1ZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgYWRkUHJvcCggJ3N0cm9rZScsIHN0cm9rZVZhbHVlICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYWRkUHJvcCggJ3N0cm9rZScsIHN0cm9rZVZhbHVlID8gc3Ryb2tlVmFsdWUudG9TdHJpbmcoKSA6ICdudWxsJywgdHJ1ZSApO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5lYWNoKCBbICdsaW5lV2lkdGgnLCAnbGluZUNhcCcsICdtaXRlckxpbWl0JywgJ2xpbmVKb2luJywgJ2xpbmVEYXNoT2Zmc2V0JyBdLCBwcm9wID0+IHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgICAgaWYgKCB0aGlzWyBwcm9wIF0gIT09IGRlZmF1bHRTdHlsZXNbIHByb3AgXSApIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgICAgIGFkZFByb3AoIHByb3AsIHRoaXNbIHByb3AgXSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgIGlmICggdGhpcy5saW5lRGFzaC5sZW5ndGggKSB7XG4gICAgICAgICAgYWRkUHJvcCggJ2xpbmVEYXNoJywgSlNPTi5zdHJpbmdpZnkoIHRoaXMubGluZURhc2ggKSwgdHJ1ZSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB0aGUgZGVmYXVsdCBhbGxvd2VkIHJlbmRlcmVycyAocmV0dXJuZWQgdmlhIHRoZSBSZW5kZXJlciBiaXRtYXNrKSB0aGF0IGFyZSBhbGxvd2VkLCBnaXZlbiB0aGVcbiAgICAgKiBjdXJyZW50IGZpbGwgb3B0aW9ucy4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICpcbiAgICAgKiBUaGlzIHdpbGwgYmUgdXNlZCBmb3IgYWxsIHR5cGVzIHRoYXQgZGlyZWN0bHkgbWl4IGluIFBhaW50YWJsZSAoaS5lLiBQYXRoIGFuZCBUZXh0KSwgYnV0IG1heSBiZSBvdmVycmlkZGVuXG4gICAgICogYnkgc3VidHlwZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlciBmb3IgZGV0YWlsc1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRGaWxsUmVuZGVyZXJCaXRtYXNrKCk6IG51bWJlciB7XG4gICAgICBsZXQgYml0bWFzayA9IDA7XG5cbiAgICAgIC8vIFNhZmFyaSA1IGhhcyBidWdneSBpc3N1ZXMgd2l0aCBTVkcgZ3JhZGllbnRzXG4gICAgICBpZiAoICEoIGlzU2FmYXJpNSAmJiB0aGlzLl9maWxsIGluc3RhbmNlb2YgR3JhZGllbnQgKSApIHtcbiAgICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrU1ZHO1xuICAgICAgfVxuXG4gICAgICAvLyB3ZSBhbHdheXMgaGF2ZSBDYW52YXMgc3VwcG9ydD9cbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza0NhbnZhcztcblxuICAgICAgaWYgKCAhdGhpcy5oYXNGaWxsKCkgKSB7XG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGZpbGwsIGl0IGlzIHN1cHBvcnRlZCBieSBET00gYW5kIFdlYkdMXG4gICAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza0RPTTtcbiAgICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrV2ViR0w7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5fZmlsbCBpbnN0YW5jZW9mIFBhdHRlcm4gKSB7XG4gICAgICAgIC8vIG5vIHBhdHRlcm4gc3VwcG9ydCBmb3IgRE9NIG9yIFdlYkdMIChmb3Igbm93ISlcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0aGlzLl9maWxsIGluc3RhbmNlb2YgR3JhZGllbnQgKSB7XG4gICAgICAgIC8vIG5vIGdyYWRpZW50IHN1cHBvcnQgZm9yIERPTSBvciBXZWJHTCAoZm9yIG5vdyEpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gc29saWQgZmlsbHMgYWx3YXlzIHN1cHBvcnRlZCBmb3IgRE9NIGFuZCBXZWJHTFxuICAgICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tET007XG4gICAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza1dlYkdMO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYml0bWFzaztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHRoZSBkZWZhdWx0IGFsbG93ZWQgcmVuZGVyZXJzIChyZXR1cm5lZCB2aWEgdGhlIFJlbmRlcmVyIGJpdG1hc2spIHRoYXQgYXJlIGFsbG93ZWQsIGdpdmVuIHRoZVxuICAgICAqIGN1cnJlbnQgc3Ryb2tlIG9wdGlvbnMuIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqXG4gICAgICogVGhpcyB3aWxsIGJlIHVzZWQgZm9yIGFsbCB0eXBlcyB0aGF0IGRpcmVjdGx5IG1peCBpbiBQYWludGFibGUgKGkuZS4gUGF0aCBhbmQgVGV4dCksIGJ1dCBtYXkgYmUgb3ZlcnJpZGRlblxuICAgICAqIGJ5IHN1YnR5cGVzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgLSBSZW5kZXJlciBiaXRtYXNrLCBzZWUgUmVuZGVyZXIgZm9yIGRldGFpbHNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U3Ryb2tlUmVuZGVyZXJCaXRtYXNrKCk6IG51bWJlciB7XG4gICAgICBsZXQgYml0bWFzayA9IDA7XG5cbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza0NhbnZhcztcblxuICAgICAgLy8gYWx3YXlzIGhhdmUgU1ZHIHN1cHBvcnQgKGZvciBub3c/KVxuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrU1ZHO1xuXG4gICAgICBpZiAoICF0aGlzLmhhc1N0cm9rZSgpICkge1xuICAgICAgICAvLyBhbGxvdyBET00gc3VwcG9ydCBpZiB0aGVyZSBpcyBubyBzdHJva2UgKHNpbmNlIHRoZSBmaWxsIHdpbGwgZGV0ZXJtaW5lIHdoYXQgaXMgYXZhaWxhYmxlKVxuICAgICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tET007XG4gICAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza1dlYkdMO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYml0bWFzaztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZhbGlkYXRlcyBvdXIgY3VycmVudCBmaWxsLCB0cmlnZ2VyaW5nIHJlY29tcHV0YXRpb24gb2YgYW55dGhpbmcgdGhhdCBkZXBlbmRlZCBvbiB0aGUgb2xkIGZpbGwncyB2YWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyBpbnZhbGlkYXRlRmlsbCgpOiB2b2lkIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpO1xuXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFBhaW50YWJsZURyYXdhYmxlICkubWFya0RpcnR5RmlsbCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludmFsaWRhdGVzIG91ciBjdXJyZW50IHN0cm9rZSwgdHJpZ2dlcmluZyByZWNvbXB1dGF0aW9uIG9mIGFueXRoaW5nIHRoYXQgZGVwZW5kZWQgb24gdGhlIG9sZCBzdHJva2UncyB2YWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyBpbnZhbGlkYXRlU3Ryb2tlKCk6IHZvaWQge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzKCk7XG5cbiAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUGFpbnRhYmxlRHJhd2FibGUgKS5tYXJrRGlydHlTdHJva2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59ICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQYWludGFibGUnLCBQYWludGFibGUgKTtcblxuLy8gQHRzLWV4cGVjdC1lcnJvclxuUGFpbnRhYmxlLkRFRkFVTFRfT1BUSU9OUyA9IERFRkFVTFRfT1BUSU9OUztcblxuZXhwb3J0IHtcbiAgUGFpbnRhYmxlIGFzIGRlZmF1bHQsXG4gIFBBSU5UQUJMRV9EUkFXQUJMRV9NQVJLX0ZMQUdTLFxuICBQQUlOVEFCTEVfT1BUSU9OX0tFWVMsXG4gIERFRkFVTFRfT1BUSU9OUyxcbiAgREVGQVVMVF9PUFRJT05TIGFzIFBBSU5UQUJMRV9ERUZBVUxUX09QVElPTlNcbn07Il0sIm5hbWVzIjpbImlzVFJlYWRPbmx5UHJvcGVydHkiLCJMSU5FX1NUWUxFX0RFRkFVTFRfT1BUSU9OUyIsIkxpbmVTdHlsZXMiLCJhcnJheVJlbW92ZSIsImFzc2VydEhhc1Byb3BlcnRpZXMiLCJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJwbGF0Zm9ybSIsIkNvbG9yIiwiR3JhZGllbnQiLCJOb2RlIiwiUGFpbnQiLCJQYWludERlZiIsIlBhdHRlcm4iLCJSZW5kZXJlciIsInNjZW5lcnkiLCJpc1NhZmFyaTUiLCJzYWZhcmk1IiwiUEFJTlRBQkxFX09QVElPTl9LRVlTIiwiREVGQVVMVF9PUFRJT05TIiwiZmlsbCIsImZpbGxQaWNrYWJsZSIsInN0cm9rZSIsInN0cm9rZVBpY2thYmxlIiwibGluZVdpZHRoIiwibGluZUNhcCIsImxpbmVKb2luIiwibGluZURhc2hPZmZzZXQiLCJtaXRlckxpbWl0IiwiUEFJTlRBQkxFX0RSQVdBQkxFX01BUktfRkxBR1MiLCJQYWludGFibGUiLCJUeXBlIiwiYXNzZXJ0IiwiXyIsImluY2x1ZGVzIiwiUGFpbnRhYmxlTWl4aW4iLCJzZXRGaWxsIiwiaXNQYWludERlZiIsImNoZWNrUGFpbnRTdHJpbmciLCJfZmlsbCIsImludmFsaWRhdGVGaWxsIiwidmFsdWUiLCJnZXRGaWxsIiwiaGFzRmlsbCIsImdldEZpbGxWYWx1ZSIsImdldCIsImZpbGxWYWx1ZSIsInNldFN0cm9rZSIsIl9zdHJva2UiLCJ0cmFuc2Zvcm1NYXRyaXgiLCJzY2FsZVZlY3RvciIsImdldFNjYWxlVmVjdG9yIiwiTWF0aCIsImFicyIsIngiLCJ5IiwiaW52YWxpZGF0ZVN0cm9rZSIsImdldFN0cm9rZSIsImhhc1N0cm9rZSIsImdldFN0cm9rZVZhbHVlIiwiaGFzUGFpbnRhYmxlU3Ryb2tlIiwiZ2V0TGluZVdpZHRoIiwic3Ryb2tlVmFsdWUiLCJzZXRGaWxsUGlja2FibGUiLCJwaWNrYWJsZSIsIl9maWxsUGlja2FibGUiLCJpc0ZpbGxQaWNrYWJsZSIsInNldFN0cm9rZVBpY2thYmxlIiwiX3N0cm9rZVBpY2thYmxlIiwiaXNTdHJva2VQaWNrYWJsZSIsInNldExpbmVXaWR0aCIsIl9saW5lRHJhd2luZ1N0eWxlcyIsInN0YXRlTGVuIiwiX2RyYXdhYmxlcyIsImxlbmd0aCIsImkiLCJtYXJrRGlydHlMaW5lV2lkdGgiLCJzZXRMaW5lQ2FwIiwibWFya0RpcnR5TGluZU9wdGlvbnMiLCJnZXRMaW5lQ2FwIiwic2V0TGluZUpvaW4iLCJnZXRMaW5lSm9pbiIsInNldE1pdGVyTGltaXQiLCJpc0Zpbml0ZSIsImdldE1pdGVyTGltaXQiLCJzZXRMaW5lRGFzaCIsImxpbmVEYXNoIiwiQXJyYXkiLCJpc0FycmF5IiwiZXZlcnkiLCJuIiwiZ2V0TGluZURhc2giLCJoYXNMaW5lRGFzaCIsInNldExpbmVEYXNoT2Zmc2V0IiwiZ2V0TGluZURhc2hPZmZzZXQiLCJzZXRMaW5lU3R5bGVzIiwibGluZVN0eWxlcyIsImdldExpbmVTdHlsZXMiLCJzZXRDYWNoZWRQYWludHMiLCJwYWludHMiLCJfY2FjaGVkUGFpbnRzIiwiZmlsdGVyIiwicGFpbnQiLCJtYXJrRGlydHlDYWNoZWRQYWludHMiLCJjYWNoZWRQYWludHMiLCJnZXRDYWNoZWRQYWludHMiLCJhZGRDYWNoZWRQYWludCIsInB1c2giLCJyZW1vdmVDYWNoZWRQYWludCIsImJlZm9yZUNhbnZhc0ZpbGwiLCJ3cmFwcGVyIiwic2V0RmlsbFN0eWxlIiwiY29udGV4dCIsInNhdmUiLCJjYW52YXNBcHBlbmRUcmFuc2Zvcm0iLCJhZnRlckNhbnZhc0ZpbGwiLCJyZXN0b3JlIiwiYmVmb3JlQ2FudmFzU3Ryb2tlIiwic2V0U3Ryb2tlU3R5bGUiLCJtYXRyaXhNdWx0aXBsaWVyIiwibWFwIiwiZGFzaCIsImFmdGVyQ2FudmFzU3Ryb2tlIiwiZ2V0Q1NTRmlsbCIsInRvQ1NTIiwiZ2V0U2ltcGxlQ1NTU3Ryb2tlIiwiYXBwZW5kRmlsbGFibGVQcm9wU3RyaW5nIiwic3BhY2VzIiwicmVzdWx0IiwiYXBwZW5kU3Ryb2thYmxlUHJvcFN0cmluZyIsImFkZFByb3AiLCJrZXkiLCJub3dyYXAiLCJkZWZhdWx0U3R5bGVzIiwidG9TdHJpbmciLCJlYWNoIiwicHJvcCIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZXRGaWxsUmVuZGVyZXJCaXRtYXNrIiwiYml0bWFzayIsImJpdG1hc2tTVkciLCJiaXRtYXNrQ2FudmFzIiwiYml0bWFza0RPTSIsImJpdG1hc2tXZWJHTCIsImdldFN0cm9rZVJlbmRlcmVyQml0bWFzayIsImludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMiLCJtYXJrRGlydHlGaWxsIiwibWFya0RpcnR5U3Ryb2tlIiwiYXJncyIsInJlZ2lzdGVyIiwiZGVmYXVsdCIsIlBBSU5UQUJMRV9ERUZBVUxUX09QVElPTlMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsU0FBU0EsbUJBQW1CLFFBQVEsd0NBQXdDO0FBRTVFLFNBQVNDLDBCQUEwQixFQUFxQkMsVUFBVSxRQUFRLDhCQUE4QjtBQUN4RyxPQUFPQyxpQkFBaUIsdUNBQXVDO0FBQy9ELE9BQU9DLHlCQUF5QiwrQ0FBK0M7QUFDL0UsT0FBT0MsaUJBQWlCLHVDQUF1QztBQUMvRCxPQUFPQyxhQUFhLG1DQUFtQztBQUN2RCxPQUFPQyxjQUFjLG9DQUFvQztBQUd6RCxTQUErQkMsS0FBSyxFQUFFQyxRQUFRLEVBQWtCQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMsUUFBUSxFQUFRQyxPQUFPLEVBQWtCQyxRQUFRLEVBQUVDLE9BQU8sUUFBMEMsZ0JBQWdCO0FBRWpNLE1BQU1DLFlBQVlULFNBQVNVLE9BQU87QUFFbEMsTUFBTUMsd0JBQXdCO0lBQzVCO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsZUFBZSx3R0FBd0c7Q0FDeEg7QUFFRCxNQUFNQyxrQkFBa0I7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