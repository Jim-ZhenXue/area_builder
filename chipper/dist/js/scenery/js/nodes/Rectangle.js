// Copyright 2013-2024, University of Colorado Boulder
/**
 * A rectangular node that inherits Path, and allows for optimized drawing and improved rectangle handling.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import { Shape } from '../../../kite/js/imports.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import { Features, Gradient, Path, Pattern, RectangleCanvasDrawable, RectangleDOMDrawable, RectangleSVGDrawable, RectangleWebGLDrawable, Renderer, scenery, Sizable } from '../imports.js';
const RECTANGLE_OPTION_KEYS = [
    'rectBounds',
    'rectSize',
    'rectX',
    'rectY',
    'rectWidth',
    'rectHeight',
    'cornerRadius',
    'cornerXRadius',
    'cornerYRadius' // {number} - Sets vertical corner radius. See setCornerYRadius() for more documentation.
];
const SuperType = Sizable(Path);
let Rectangle = class Rectangle extends SuperType {
    /**
   * Determines the maximum arc size that can be accommodated by the current width and height.
   *
   * If the corner radii are the same as the maximum arc size on a square, it will appear to be a circle (the arcs
   * take up all of the room, and leave no straight segments). In the case of a non-square, one direction of edges
   * will exist (e.g. top/bottom or left/right), while the other edges would be fully rounded.
   */ getMaximumArcSize() {
        return Math.min(this._rectWidth / 2, this._rectHeight / 2);
    }
    /**
   * Determines the default allowed renderers (returned via the Renderer bitmask) that are allowed, given the
   * current stroke options. (scenery-internal)
   *
   * We can support the DOM renderer if there is a solid-styled stroke with non-bevel line joins
   * (which otherwise wouldn't be supported).
   *
   * @returns - Renderer bitmask, see Renderer for details
   */ getStrokeRendererBitmask() {
        let bitmask = super.getStrokeRendererBitmask();
        const stroke = this.getStroke();
        // DOM stroke handling doesn't YET support gradients, patterns, or dashes (with the current implementation, it shouldn't be too hard)
        if (stroke && !(stroke instanceof Gradient) && !(stroke instanceof Pattern) && !this.hasLineDash()) {
            // we can't support the bevel line-join with our current DOM rectangle display
            if (this.getLineJoin() === 'miter' || this.getLineJoin() === 'round' && Features.borderRadius) {
                bitmask |= Renderer.bitmaskDOM;
            }
        }
        if (!this.hasStroke()) {
            bitmask |= Renderer.bitmaskWebGL;
        }
        return bitmask;
    }
    /**
   * Determines the allowed renderers that are allowed (or excluded) based on the current Path. (scenery-internal)
   *
   * @returns - Renderer bitmask, see Renderer for details
   */ getPathRendererBitmask() {
        let bitmask = Renderer.bitmaskCanvas | Renderer.bitmaskSVG;
        const maximumArcSize = this.getMaximumArcSize();
        // If the top/bottom or left/right strokes touch and overlap in the middle (small rectangle, big stroke), our DOM method won't work.
        // Additionally, if we're handling rounded rectangles or a stroke with lineJoin 'round', we'll need borderRadius
        // We also require for DOM that if it's a rounded rectangle, it's rounded with circular arcs (for now, could potentially do a transform trick!)
        if ((!this.hasStroke() || this.getLineWidth() <= this._rectHeight && this.getLineWidth() <= this._rectWidth) && (!this.isRounded() || Features.borderRadius && this._cornerXRadius === this._cornerYRadius) && this._cornerYRadius <= maximumArcSize && this._cornerXRadius <= maximumArcSize) {
            bitmask |= Renderer.bitmaskDOM;
        }
        // TODO: why check here, if we also check in the 'stroke' portion? https://github.com/phetsims/scenery/issues/1581
        if (!this.hasStroke() && !this.isRounded()) {
            bitmask |= Renderer.bitmaskWebGL;
        }
        return bitmask;
    }
    /**
   * Sets all of the shape-determining parameters for the rectangle.
   *
   * @param x - The x-position of the left side of the rectangle.
   * @param y - The y-position of the top side of the rectangle.
   * @param width - The width of the rectangle.
   * @param height - The height of the rectangle.
   * @param [cornerXRadius] - The horizontal radius of curved corners (0 for sharp corners)
   * @param [cornerYRadius] - The vertical radius of curved corners (0 for sharp corners)
   */ setRect(x, y, width, height, cornerXRadius, cornerYRadius) {
        const hasXRadius = cornerXRadius !== undefined;
        const hasYRadius = cornerYRadius !== undefined;
        assert && assert(isFinite(x) && isFinite(y) && isFinite(width) && isFinite(height), 'x/y/width/height should be finite numbers');
        assert && assert(!hasXRadius || isFinite(cornerXRadius) && (!hasYRadius || isFinite(cornerYRadius)), 'Corner radii (if provided) should be finite numbers');
        // If this doesn't change the rectangle, don't notify about changes.
        if (this._rectX === x && this._rectY === y && this._rectWidth === width && this._rectHeight === height && (!hasXRadius || this._cornerXRadius === cornerXRadius) && (!hasYRadius || this._cornerYRadius === cornerYRadius)) {
            return this;
        }
        this._rectX = x;
        this._rectY = y;
        this._rectWidth = width;
        this._rectHeight = height;
        this._cornerXRadius = hasXRadius ? cornerXRadius : this._cornerXRadius;
        this._cornerYRadius = hasYRadius ? cornerYRadius : this._cornerYRadius;
        const stateLen = this._drawables.length;
        for(let i = 0; i < stateLen; i++){
            this._drawables[i].markDirtyRectangle();
        }
        this.invalidateRectangle();
        return this;
    }
    /**
   * Sets the x coordinate of the left side of this rectangle (in the local coordinate frame).
   */ setRectX(x) {
        assert && assert(isFinite(x), 'rectX should be a finite number');
        if (this._rectX !== x) {
            this._rectX = x;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyX();
            }
            this.invalidateRectangle();
        }
        return this;
    }
    set rectX(value) {
        this.setRectX(value);
    }
    get rectX() {
        return this.getRectX();
    }
    /**
   * Returns the x coordinate of the left side of this rectangle (in the local coordinate frame).
   */ getRectX() {
        return this._rectX;
    }
    /**
   * Sets the y coordinate of the top side of this rectangle (in the local coordinate frame).
   */ setRectY(y) {
        assert && assert(isFinite(y), 'rectY should be a finite number');
        if (this._rectY !== y) {
            this._rectY = y;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyY();
            }
            this.invalidateRectangle();
        }
        return this;
    }
    set rectY(value) {
        this.setRectY(value);
    }
    get rectY() {
        return this.getRectY();
    }
    /**
   * Returns the y coordinate of the top side of this rectangle (in the local coordinate frame).
   */ getRectY() {
        return this._rectY;
    }
    /**
   * Sets the width of the rectangle (in the local coordinate frame).
   */ setRectWidth(width) {
        assert && assert(isFinite(width), 'rectWidth should be a finite number');
        if (this._rectWidth !== width) {
            this._rectWidth = width;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyWidth();
            }
            this.invalidateRectangle();
        }
        return this;
    }
    set rectWidth(value) {
        this.setRectWidth(value);
    }
    get rectWidth() {
        return this.getRectWidth();
    }
    /**
   * Returns the width of the rectangle (in the local coordinate frame).
   */ getRectWidth() {
        return this._rectWidth;
    }
    /**
   * Sets the height of the rectangle (in the local coordinate frame).
   */ setRectHeight(height) {
        assert && assert(isFinite(height), 'rectHeight should be a finite number');
        if (this._rectHeight !== height) {
            this._rectHeight = height;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyHeight();
            }
            this.invalidateRectangle();
        }
        return this;
    }
    set rectHeight(value) {
        this.setRectHeight(value);
    }
    get rectHeight() {
        return this.getRectHeight();
    }
    /**
   * Returns the height of the rectangle (in the local coordinate frame).
   */ getRectHeight() {
        return this._rectHeight;
    }
    /**
   * Sets the horizontal corner radius of the rectangle (in the local coordinate frame).
   *
   * If the cornerXRadius and cornerYRadius are the same, the corners will be rounded circular arcs with that radius
   * (or a smaller radius if the rectangle is too small).
   *
   * If the cornerXRadius and cornerYRadius are different, the corners will be elliptical arcs, and the horizontal
   * radius will be equal to cornerXRadius (or a smaller radius if the rectangle is too small).
   */ setCornerXRadius(radius) {
        assert && assert(isFinite(radius), 'cornerXRadius should be a finite number');
        if (this._cornerXRadius !== radius) {
            this._cornerXRadius = radius;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyCornerXRadius();
            }
            this.invalidateRectangle();
        }
        return this;
    }
    set cornerXRadius(value) {
        this.setCornerXRadius(value);
    }
    get cornerXRadius() {
        return this.getCornerXRadius();
    }
    /**
   * Returns the horizontal corner radius of the rectangle (in the local coordinate frame).
   */ getCornerXRadius() {
        return this._cornerXRadius;
    }
    /**
   * Sets the vertical corner radius of the rectangle (in the local coordinate frame).
   *
   * If the cornerXRadius and cornerYRadius are the same, the corners will be rounded circular arcs with that radius
   * (or a smaller radius if the rectangle is too small).
   *
   * If the cornerXRadius and cornerYRadius are different, the corners will be elliptical arcs, and the vertical
   * radius will be equal to cornerYRadius (or a smaller radius if the rectangle is too small).
   */ setCornerYRadius(radius) {
        assert && assert(isFinite(radius), 'cornerYRadius should be a finite number');
        if (this._cornerYRadius !== radius) {
            this._cornerYRadius = radius;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyCornerYRadius();
            }
            this.invalidateRectangle();
        }
        return this;
    }
    set cornerYRadius(value) {
        this.setCornerYRadius(value);
    }
    get cornerYRadius() {
        return this.getCornerYRadius();
    }
    /**
   * Returns the vertical corner radius of the rectangle (in the local coordinate frame).
   */ getCornerYRadius() {
        return this._cornerYRadius;
    }
    /**
   * Sets the Rectangle's x/y/width/height from the Bounds2 passed in.
   */ setRectBounds(bounds) {
        this.setRect(bounds.x, bounds.y, bounds.width, bounds.height);
        return this;
    }
    set rectBounds(value) {
        this.setRectBounds(value);
    }
    get rectBounds() {
        return this.getRectBounds();
    }
    /**
   * Returns a new Bounds2 generated from this Rectangle's x/y/width/height.
   */ getRectBounds() {
        return Bounds2.rect(this._rectX, this._rectY, this._rectWidth, this._rectHeight);
    }
    /**
   * Sets the Rectangle's width/height from the Dimension2 size passed in.
   */ setRectSize(size) {
        this.setRectWidth(size.width);
        this.setRectHeight(size.height);
        return this;
    }
    set rectSize(value) {
        this.setRectSize(value);
    }
    get rectSize() {
        return this.getRectSize();
    }
    /**
   * Returns a new Dimension2 generated from this Rectangle's width/height.
   */ getRectSize() {
        return new Dimension2(this._rectWidth, this._rectHeight);
    }
    /**
   * Sets the width of the rectangle while keeping its right edge (x + width) in the same position
   */ setRectWidthFromRight(width) {
        if (this._rectWidth !== width) {
            const right = this._rectX + this._rectWidth;
            this.setRectWidth(width);
            this.setRectX(right - width);
        }
        return this;
    }
    set rectWidthFromRight(value) {
        this.setRectWidthFromRight(value);
    }
    get rectWidthFromRight() {
        return this.getRectWidth();
    }
    /**
   * Sets the height of the rectangle while keeping its bottom edge (y + height) in the same position
   */ setRectHeightFromBottom(height) {
        if (this._rectHeight !== height) {
            const bottom = this._rectY + this._rectHeight;
            this.setRectHeight(height);
            this.setRectY(bottom - height);
        }
        return this;
    }
    set rectHeightFromBottom(value) {
        this.setRectHeightFromBottom(value);
    }
    get rectHeightFromBottom() {
        return this.getRectHeight();
    }
    /**
   * Returns whether this rectangle has any rounding applied at its corners. If either the x or y corner radius is 0,
   * then there is no rounding applied.
   */ isRounded() {
        return this._cornerXRadius !== 0 && this._cornerYRadius !== 0;
    }
    /**
   * Computes the bounds of the Rectangle, including any applied stroke. Overridden for efficiency.
   */ computeShapeBounds() {
        let bounds = new Bounds2(this._rectX, this._rectY, this._rectX + this._rectWidth, this._rectY + this._rectHeight);
        if (this._stroke) {
            // since we are axis-aligned, any stroke will expand our bounds by a guaranteed set amount
            bounds = bounds.dilated(this.getLineWidth() / 2);
        }
        return bounds;
    }
    /**
   * Returns a Shape that is equivalent to our rendered display. Generally used to lazily create a Shape instance
   * when one is needed, without having to do so beforehand.
   */ createRectangleShape() {
        if (this.isRounded()) {
            // copy border-radius CSS behavior in Chrome, where the arcs won't intersect, in cases where the arc segments at full size would intersect each other
            const maximumArcSize = Math.min(this._rectWidth / 2, this._rectHeight / 2);
            return Shape.roundRectangle(this._rectX, this._rectY, this._rectWidth, this._rectHeight, Math.min(maximumArcSize, this._cornerXRadius), Math.min(maximumArcSize, this._cornerYRadius)).makeImmutable();
        } else {
            return Shape.rectangle(this._rectX, this._rectY, this._rectWidth, this._rectHeight).makeImmutable();
        }
    }
    /**
   * Notifies that the rectangle has changed, and invalidates path information and our cached shape.
   */ invalidateRectangle() {
        assert && assert(isFinite(this._rectX), `A rectangle needs to have a finite x (${this._rectX})`);
        assert && assert(isFinite(this._rectY), `A rectangle needs to have a finite y (${this._rectY})`);
        assert && assert(this._rectWidth >= 0 && isFinite(this._rectWidth), `A rectangle needs to have a non-negative finite width (${this._rectWidth})`);
        assert && assert(this._rectHeight >= 0 && isFinite(this._rectHeight), `A rectangle needs to have a non-negative finite height (${this._rectHeight})`);
        assert && assert(this._cornerXRadius >= 0 && isFinite(this._cornerXRadius), `A rectangle needs to have a non-negative finite arcWidth (${this._cornerXRadius})`);
        assert && assert(this._cornerYRadius >= 0 && isFinite(this._cornerYRadius), `A rectangle needs to have a non-negative finite arcHeight (${this._cornerYRadius})`);
        // sets our 'cache' to null, so we don't always have to recompute our shape
        this._shape = null;
        // should invalidate the path and ensure a redraw
        this.invalidatePath();
        // since we changed the rectangle arc width/height, it could make DOM work or not
        this.invalidateSupportedRenderers();
    }
    updatePreferredSizes() {
        let width = this.localPreferredWidth;
        let height = this.localPreferredHeight;
        if (width !== null) {
            width = Math.max(width, this.localMinimumWidth || 0);
        }
        if (height !== null) {
            height = Math.max(height, this.localMinimumHeight || 0);
        }
        if (width !== null) {
            this.rectWidth = this.hasStroke() ? width - this.lineWidth : width;
        }
        if (height !== null) {
            this.rectHeight = this.hasStroke() ? height - this.lineWidth : height;
        }
    }
    // We need to detect stroke changes, since our preferred size computations depend on it.
    invalidateStroke() {
        super.invalidateStroke();
        this.updatePreferredSizes();
    }
    /**
   * Computes whether the provided point is "inside" (contained) in this Rectangle's self content, or "outside".
   *
   * Handles axis-aligned optionally-rounded rectangles, although can only do optimized computation if it isn't
   * rounded. If it IS rounded, we check if a corner computation is needed (usually isn't), and only need to check
   * one corner for that test.
   *
   * @param point - Considered to be in the local coordinate frame
   */ containsPointSelf(point) {
        const x = this._rectX;
        const y = this._rectY;
        const width = this._rectWidth;
        const height = this._rectHeight;
        const arcWidth = this._cornerXRadius;
        const arcHeight = this._cornerYRadius;
        const halfLine = this.getLineWidth() / 2;
        let result = true;
        if (this._strokePickable) {
            // test the outer boundary if we are stroke-pickable (if also fill-pickable, this is the only test we need)
            const rounded = this.isRounded();
            if (!rounded && this.getLineJoin() === 'bevel') {
                // fall-back for bevel
                return super.containsPointSelf(point);
            }
            const miter = this.getLineJoin() === 'miter' && !rounded;
            result = result && Rectangle.intersects(x - halfLine, y - halfLine, width + 2 * halfLine, height + 2 * halfLine, miter ? 0 : arcWidth + halfLine, miter ? 0 : arcHeight + halfLine, point);
        }
        if (this._fillPickable) {
            if (this._strokePickable) {
                return result;
            } else {
                return Rectangle.intersects(x, y, width, height, arcWidth, arcHeight, point);
            }
        } else if (this._strokePickable) {
            return result && !Rectangle.intersects(x + halfLine, y + halfLine, width - 2 * halfLine, height - 2 * halfLine, arcWidth - halfLine, arcHeight - halfLine, point);
        } else {
            return false; // either fill nor stroke is pickable
        }
    }
    /**
   * Returns whether this Rectangle's selfBounds is intersected by the specified bounds.
   *
   * @param bounds - Bounds to test, assumed to be in the local coordinate frame.
   */ intersectsBoundsSelf(bounds) {
        return !this.computeShapeBounds().intersection(bounds).isEmpty();
    }
    /**
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */ canvasPaintSelf(wrapper, matrix) {
        //TODO: Have a separate method for this, instead of touching the prototype. Can make 'this' references too easily. https://github.com/phetsims/scenery/issues/1581
        RectangleCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
    }
    /**
   * Creates a DOM drawable for this Rectangle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createDOMDrawable(renderer, instance) {
        // @ts-expect-error
        return RectangleDOMDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a SVG drawable for this Rectangle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createSVGDrawable(renderer, instance) {
        // @ts-expect-error
        return RectangleSVGDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a Canvas drawable for this Rectangle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createCanvasDrawable(renderer, instance) {
        // @ts-expect-error
        return RectangleCanvasDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a WebGL drawable for this Rectangle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createWebGLDrawable(renderer, instance) {
        // @ts-expect-error
        return RectangleWebGLDrawable.createFromPool(renderer, instance);
    }
    /*---------------------------------------------------------------------------*
   * Miscellaneous
   *----------------------------------------------------------------------------*/ /**
   * It is impossible to set another shape on this Path subtype, as its effective shape is determined by other
   * parameters.
   *
   * @param shape - Throws an error if it is not null.
   */ setShape(shape) {
        if (shape !== null) {
            throw new Error('Cannot set the shape of a Rectangle to something non-null');
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
            this._shape = this.createRectangleShape();
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
            throw new Error('Cannot set the shapeProperty of a Rectangle to something non-null, it handles this itself');
        }
        return this;
    }
    /**
   * Sets both of the corner radii to the same value, so that the rounded corners will be circular arcs.
   */ setCornerRadius(cornerRadius) {
        this.setCornerXRadius(cornerRadius);
        this.setCornerYRadius(cornerRadius);
        return this;
    }
    set cornerRadius(value) {
        this.setCornerRadius(value);
    }
    get cornerRadius() {
        return this.getCornerRadius();
    }
    /**
   * Returns the corner radius if both the horizontal and vertical corner radii are the same.
   *
   * NOTE: If there are different horizontal and vertical corner radii, this will fail an assertion and return the horizontal radius.
   */ getCornerRadius() {
        assert && assert(this._cornerXRadius === this._cornerYRadius, 'getCornerRadius() invalid if x/y radii are different');
        return this._cornerXRadius;
    }
    mutate(options) {
        return super.mutate(options);
    }
    /**
   * Returns whether a point is within a rounded rectangle.
   *
   * @param x - X value of the left side of the rectangle
   * @param y - Y value of the top side of the rectangle
   * @param width - Width of the rectangle
   * @param height - Height of the rectangle
   * @param arcWidth - Horizontal corner radius of the rectangle
   * @param arcHeight - Vertical corner radius of the rectangle
   * @param point - The point that may or may not be in the rounded rectangle
   */ static intersects(x, y, width, height, arcWidth, arcHeight, point) {
        const result = point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
        if (!result || arcWidth <= 0 || arcHeight <= 0) {
            return result;
        }
        // copy border-radius CSS behavior in Chrome, where the arcs won't intersect, in cases where the arc segments at full size would intersect each other
        const maximumArcSize = Math.min(width / 2, height / 2);
        arcWidth = Math.min(maximumArcSize, arcWidth);
        arcHeight = Math.min(maximumArcSize, arcHeight);
        // we are rounded and inside the logical rectangle (if it didn't have rounded corners)
        // closest corner arc's center (we assume the rounded rectangle's arcs are 90 degrees fully, and don't intersect)
        let closestCornerX;
        let closestCornerY;
        let guaranteedInside = false;
        // if we are to the inside of the closest corner arc's center, we are guaranteed to be in the rounded rectangle (guaranteedInside)
        if (point.x < x + width / 2) {
            closestCornerX = x + arcWidth;
            guaranteedInside = guaranteedInside || point.x >= closestCornerX;
        } else {
            closestCornerX = x + width - arcWidth;
            guaranteedInside = guaranteedInside || point.x <= closestCornerX;
        }
        if (guaranteedInside) {
            return true;
        }
        if (point.y < y + height / 2) {
            closestCornerY = y + arcHeight;
            guaranteedInside = guaranteedInside || point.y >= closestCornerY;
        } else {
            closestCornerY = y + height - arcHeight;
            guaranteedInside = guaranteedInside || point.y <= closestCornerY;
        }
        if (guaranteedInside) {
            return true;
        }
        // we are now in the rectangular region between the logical corner and the center of the closest corner's arc.
        // offset from the closest corner's arc center
        let offsetX = point.x - closestCornerX;
        let offsetY = point.y - closestCornerY;
        // normalize the coordinates so now we are dealing with a unit circle
        // (technically arc, but we are guaranteed to be in the area covered by the arc, so we just consider the circle)
        // NOTE: we are rounded, so both arcWidth and arcHeight are non-zero (this is well defined)
        offsetX /= arcWidth;
        offsetY /= arcHeight;
        offsetX *= offsetX;
        offsetY *= offsetY;
        return offsetX + offsetY <= 1; // return whether we are in the rounded corner. see the formula for an ellipse
    }
    /**
   * Creates a rectangle with the specified x/y/width/height.
   *
   * See Rectangle's constructor for detailed parameter information.
   */ static rect(x, y, width, height, options) {
        return new Rectangle(x, y, width, height, 0, 0, options);
    }
    /**
   * Creates a rounded rectangle with the specified x/y/width/height/cornerXRadius/cornerYRadius.
   *
   * See Rectangle's constructor for detailed parameter information.
   */ static roundedRect(x, y, width, height, cornerXRadius, cornerYRadius, options) {
        return new Rectangle(x, y, width, height, cornerXRadius, cornerYRadius, options);
    }
    /**
   * Creates a rectangle x/y/width/height matching the specified bounds.
   *
   * See Rectangle's constructor for detailed parameter information.
   */ static bounds(bounds, options) {
        return new Rectangle(bounds.minX, bounds.minY, bounds.width, bounds.height, options);
    }
    /**
   * Creates a rounded rectangle x/y/width/height matching the specified bounds (Rectangle.bounds, but with additional
   * cornerXRadius and cornerYRadius).
   *
   * See Rectangle's constructor for detailed parameter information.
   */ static roundedBounds(bounds, cornerXRadius, cornerYRadius, options) {
        return new Rectangle(bounds.minX, bounds.minY, bounds.width, bounds.height, cornerXRadius, cornerYRadius, options);
    }
    /**
   * Creates a rectangle with top/left of (0,0) with the specified {Dimension2}'s width and height.
   *
   * See Rectangle's constructor for detailed parameter information.
   */ static dimension(dimension, options) {
        return new Rectangle(0, 0, dimension.width, dimension.height, 0, 0, options);
    }
    constructor(x, y, width, height, cornerXRadius, cornerYRadius, providedOptions){
        // We'll want to default to sizable:false, but allow clients to pass in something conflicting like widthSizable:true
        // in the super mutate. To avoid the exclusive options, we isolate this out here.
        const initialOptions = {
            sizable: false
        };
        super(null, initialOptions);
        let options = {};
        this._rectX = 0;
        this._rectY = 0;
        this._rectWidth = 0;
        this._rectHeight = 0;
        this._cornerXRadius = 0;
        this._cornerYRadius = 0;
        if (typeof x === 'object') {
            // allow new Rectangle( bounds2, { ... } ) or new Rectangle( bounds2, cornerXRadius, cornerYRadius, { ... } )
            if (x instanceof Bounds2) {
                // new Rectangle( bounds2, { ... } )
                if (typeof y !== 'number') {
                    assert && assert(arguments.length === 1 || arguments.length === 2, 'new Rectangle( bounds, { ... } ) should only take one or two arguments');
                    assert && assert(y === undefined || typeof y === 'object', 'new Rectangle( bounds, { ... } ) second parameter should only ever be an options object');
                    assert && assert(y === undefined || Object.getPrototypeOf(y) === Object.prototype, 'Extra prototype on Node options object is a code smell');
                    if (assert && y) {
                        assert(y.rectWidth === undefined, 'Should not specify rectWidth in multiple ways');
                        assert(y.rectHeight === undefined, 'Should not specify rectHeight in multiple ways');
                        assert(y.rectBounds === undefined, 'Should not specify rectBounds in multiple ways');
                    }
                    options = combineOptions(options, {
                        rectBounds: x
                    }, y); // Our options object would be at y
                } else {
                    assert && assert(arguments.length === 3 || arguments.length === 4, 'new Rectangle( bounds, cornerXRadius, cornerYRadius, { ... } ) should only take three or four arguments');
                    assert && assert(height === undefined || typeof height === 'object', 'new Rectangle( bounds, cornerXRadius, cornerYRadius, { ... } ) fourth parameter should only ever be an options object');
                    assert && assert(height === undefined || Object.getPrototypeOf(height) === Object.prototype, 'Extra prototype on Node options object is a code smell');
                    if (assert && height) {
                        assert(height.rectWidth === undefined, 'Should not specify rectWidth in multiple ways');
                        assert(height.rectHeight === undefined, 'Should not specify rectHeight in multiple ways');
                        assert(height.rectBounds === undefined, 'Should not specify rectBounds in multiple ways');
                        assert(height.cornerXRadius === undefined, 'Should not specify cornerXRadius in multiple ways');
                        assert(height.cornerYRadius === undefined, 'Should not specify cornerYRadius in multiple ways');
                        assert(height.cornerRadius === undefined, 'Should not specify cornerRadius in multiple ways');
                    }
                    options = combineOptions(options, {
                        rectBounds: x,
                        cornerXRadius: y,
                        cornerYRadius: width // ignore Intellij warning, our cornerYRadius is the third parameter
                    }, height); // Our options object would be at height
                }
            } else {
                options = combineOptions(options, x);
            }
        } else if (cornerYRadius === undefined) {
            assert && assert(arguments.length === 4 || arguments.length === 5, 'new Rectangle( x, y, width, height, { ... } ) should only take four or five arguments');
            assert && assert(cornerXRadius === undefined || typeof cornerXRadius === 'object', 'new Rectangle( x, y, width, height, { ... } ) fifth parameter should only ever be an options object');
            assert && assert(cornerXRadius === undefined || Object.getPrototypeOf(cornerXRadius) === Object.prototype, 'Extra prototype on Node options object is a code smell');
            if (assert && cornerXRadius) {
                assert(cornerXRadius.rectX === undefined, 'Should not specify rectX in multiple ways');
                assert(cornerXRadius.rectY === undefined, 'Should not specify rectY in multiple ways');
                assert(cornerXRadius.rectWidth === undefined, 'Should not specify rectWidth in multiple ways');
                assert(cornerXRadius.rectHeight === undefined, 'Should not specify rectHeight in multiple ways');
                assert(cornerXRadius.rectBounds === undefined, 'Should not specify rectBounds in multiple ways');
            }
            options = combineOptions(options, {
                rectX: x,
                rectY: y,
                rectWidth: width,
                rectHeight: height
            }, cornerXRadius);
        } else {
            assert && assert(arguments.length === 6 || arguments.length === 7, 'new Rectangle( x, y, width, height, cornerXRadius, cornerYRadius{ ... } ) should only take six or seven arguments');
            assert && assert(options === undefined || typeof options === 'object', 'new Rectangle( x, y, width, height, cornerXRadius, cornerYRadius{ ... } ) seventh parameter should only ever be an options object');
            assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
            if (assert && providedOptions) {
                assert(providedOptions.rectX === undefined, 'Should not specify rectX in multiple ways');
                assert(providedOptions.rectY === undefined, 'Should not specify rectY in multiple ways');
                assert(providedOptions.rectWidth === undefined, 'Should not specify rectWidth in multiple ways');
                assert(providedOptions.rectHeight === undefined, 'Should not specify rectHeight in multiple ways');
                assert(providedOptions.rectBounds === undefined, 'Should not specify rectBounds in multiple ways');
                assert(providedOptions.cornerXRadius === undefined, 'Should not specify cornerXRadius in multiple ways');
                assert(providedOptions.cornerYRadius === undefined, 'Should not specify cornerYRadius in multiple ways');
                assert(providedOptions.cornerRadius === undefined, 'Should not specify cornerRadius in multiple ways');
            }
            options = combineOptions(options, {
                rectX: x,
                rectY: y,
                rectWidth: width,
                rectHeight: height,
                cornerXRadius: cornerXRadius,
                cornerYRadius: cornerYRadius
            }, providedOptions);
        }
        this.localPreferredWidthProperty.lazyLink(this.updatePreferredSizes.bind(this));
        this.localPreferredHeightProperty.lazyLink(this.updatePreferredSizes.bind(this));
        this.localMinimumWidthProperty.lazyLink(this.updatePreferredSizes.bind(this));
        this.localMinimumHeightProperty.lazyLink(this.updatePreferredSizes.bind(this));
        this.mutate(options);
    }
};
export { Rectangle as default };
/**
 * {Array.<string>} - String keys for all the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ Rectangle.prototype._mutatorKeys = [
    ...RECTANGLE_OPTION_KEYS,
    ...SuperType.prototype._mutatorKeys
];
/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */ Rectangle.prototype.drawableMarkFlags = Path.prototype.drawableMarkFlags.concat([
    'x',
    'y',
    'width',
    'height',
    'cornerXRadius',
    'cornerYRadius'
]).filter((flag)=>flag !== 'shape');
scenery.register('Rectangle', Rectangle);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvUmVjdGFuZ2xlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgcmVjdGFuZ3VsYXIgbm9kZSB0aGF0IGluaGVyaXRzIFBhdGgsIGFuZCBhbGxvd3MgZm9yIG9wdGltaXplZCBkcmF3aW5nIGFuZCBpbXByb3ZlZCByZWN0YW5nbGUgaGFuZGxpbmcuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBDYW52YXNDb250ZXh0V3JhcHBlciwgQ2FudmFzU2VsZkRyYXdhYmxlLCBET01TZWxmRHJhd2FibGUsIEZlYXR1cmVzLCBHcmFkaWVudCwgSW5zdGFuY2UsIFBhdGgsIFBhdGhPcHRpb25zLCBQYXR0ZXJuLCBSZWN0YW5nbGVDYW52YXNEcmF3YWJsZSwgUmVjdGFuZ2xlRE9NRHJhd2FibGUsIFJlY3RhbmdsZVNWR0RyYXdhYmxlLCBSZWN0YW5nbGVXZWJHTERyYXdhYmxlLCBSZW5kZXJlciwgc2NlbmVyeSwgU2l6YWJsZSwgU2l6YWJsZU9wdGlvbnMsIFNWR1NlbGZEcmF3YWJsZSwgVFJlY3RhbmdsZURyYXdhYmxlLCBXZWJHTFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBSRUNUQU5HTEVfT1BUSU9OX0tFWVMgPSBbXG4gICdyZWN0Qm91bmRzJywgLy8ge0JvdW5kczJ9IC0gU2V0cyB4L3kvd2lkdGgvaGVpZ2h0IGJhc2VkIG9uIGJvdW5kcy4gU2VlIHNldFJlY3RCb3VuZHMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxuICAncmVjdFNpemUnLCAvLyB7RGltZW5zaW9uMn0gLSBTZXRzIHdpZHRoL2hlaWdodCBiYXNlZCBvbiBkaW1lbnNpb24uIFNlZSBzZXRSZWN0U2l6ZSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXG4gICdyZWN0WCcsIC8vIHtudW1iZXJ9IC0gU2V0cyB4LiBTZWUgc2V0UmVjdFgoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxuICAncmVjdFknLCAvLyB7bnVtYmVyfSAtIFNldHMgeS4gU2VlIHNldFJlY3RZKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cbiAgJ3JlY3RXaWR0aCcsIC8vIHtudW1iZXJ9IC0gU2V0cyB3aWR0aC4gU2VlIHNldFJlY3RXaWR0aCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXG4gICdyZWN0SGVpZ2h0JywgLy8gU2V0cyBoZWlnaHQuIFNlZSBzZXRSZWN0SGVpZ2h0KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cbiAgJ2Nvcm5lclJhZGl1cycsIC8vIHtudW1iZXJ9IC0gU2V0cyBjb3JuZXIgcmFkaWkuIFNlZSBzZXRDb3JuZXJSYWRpdXMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxuICAnY29ybmVyWFJhZGl1cycsIC8vIHtudW1iZXJ9IC0gU2V0cyBob3Jpem9udGFsIGNvcm5lciByYWRpdXMuIFNlZSBzZXRDb3JuZXJYUmFkaXVzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cbiAgJ2Nvcm5lcllSYWRpdXMnIC8vIHtudW1iZXJ9IC0gU2V0cyB2ZXJ0aWNhbCBjb3JuZXIgcmFkaXVzLiBTZWUgc2V0Q29ybmVyWVJhZGl1cygpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXG5dO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICByZWN0Qm91bmRzPzogQm91bmRzMjtcbiAgcmVjdFNpemU/OiBEaW1lbnNpb24yO1xuICByZWN0WD86IG51bWJlcjtcbiAgcmVjdFk/OiBudW1iZXI7XG4gIHJlY3RXaWR0aD86IG51bWJlcjtcbiAgcmVjdEhlaWdodD86IG51bWJlcjtcbiAgY29ybmVyUmFkaXVzPzogbnVtYmVyO1xuICBjb3JuZXJYUmFkaXVzPzogbnVtYmVyO1xuICBjb3JuZXJZUmFkaXVzPzogbnVtYmVyO1xufTtcbnR5cGUgUGFyZW50T3B0aW9ucyA9IFNpemFibGVPcHRpb25zICYgUGF0aE9wdGlvbnM7XG5leHBvcnQgdHlwZSBSZWN0YW5nbGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFBhcmVudE9wdGlvbnMsICdzaGFwZScgfCAnc2hhcGVQcm9wZXJ0eSc+O1xuXG5jb25zdCBTdXBlclR5cGUgPSBTaXphYmxlKCBQYXRoICk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFN1cGVyVHlwZSB7XG4gIC8vIFggdmFsdWUgb2YgdGhlIGxlZnQgc2lkZSBvZiB0aGUgcmVjdGFuZ2xlXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX3JlY3RYOiBudW1iZXI7XG5cbiAgLy8gWSB2YWx1ZSBvZiB0aGUgdG9wIHNpZGUgb2YgdGhlIHJlY3RhbmdsZVxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9yZWN0WTogbnVtYmVyO1xuXG4gIC8vIFdpZHRoIG9mIHRoZSByZWN0YW5nbGVcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfcmVjdFdpZHRoOiBudW1iZXI7XG5cbiAgLy8gSGVpZ2h0IG9mIHRoZSByZWN0YW5nbGVcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfcmVjdEhlaWdodDogbnVtYmVyO1xuXG4gIC8vIFggcmFkaXVzIG9mIHJvdW5kZWQgY29ybmVyc1xuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9jb3JuZXJYUmFkaXVzOiBudW1iZXI7XG5cbiAgLy8gWSByYWRpdXMgb2Ygcm91bmRlZCBjb3JuZXJzXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX2Nvcm5lcllSYWRpdXM6IG51bWJlcjtcblxuICAvKipcbiAgICpcbiAgICogUG9zc2libGUgY29uc3RydWN0b3Igc2lnbmF0dXJlc1xuICAgKiBuZXcgUmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb3JuZXJYUmFkaXVzLCBjb3JuZXJZUmFkaXVzLCBbb3B0aW9uc10gKVxuICAgKiBuZXcgUmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBbb3B0aW9uc10gKVxuICAgKiBuZXcgUmVjdGFuZ2xlKCBbb3B0aW9uc10gKVxuICAgKiBuZXcgUmVjdGFuZ2xlKCBib3VuZHMyLCBbb3B0aW9uc10gKVxuICAgKiBuZXcgUmVjdGFuZ2xlKCBib3VuZHMyLCBjb3JuZXJYUmFkaXVzLCBjb3JuZXJZUmFkaXVzLCBbb3B0aW9uc10gKVxuICAgKlxuICAgKiBDdXJyZW50IGF2YWlsYWJsZSBvcHRpb25zIGZvciB0aGUgb3B0aW9ucyBvYmplY3QgKGN1c3RvbSBmb3IgUmVjdGFuZ2xlLCBub3QgUGF0aCBvciBOb2RlKTpcbiAgICogcmVjdFggLSBMZWZ0IGVkZ2Ugb2YgdGhlIHJlY3RhbmdsZSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKiByZWN0WSAtIFRvcCBlZGdlIG9mIHRoZSByZWN0YW5nbGUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICogcmVjdFdpZHRoIC0gV2lkdGggb2YgdGhlIHJlY3RhbmdsZSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKiByZWN0SGVpZ2h0IC0gSGVpZ2h0IG9mIHRoZSByZWN0YW5nbGUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICogY29ybmVyWFJhZGl1cyAtIFRoZSB4LWF4aXMgcmFkaXVzIGZvciBlbGxpcHRpY2FsL2NpcmN1bGFyIHJvdW5kZWQgY29ybmVycy5cbiAgICogY29ybmVyWVJhZGl1cyAtIFRoZSB5LWF4aXMgcmFkaXVzIGZvciBlbGxpcHRpY2FsL2NpcmN1bGFyIHJvdW5kZWQgY29ybmVycy5cbiAgICogY29ybmVyUmFkaXVzIC0gU2V0cyBib3RoIFwiWFwiIGFuZCBcIllcIiBjb3JuZXIgcmFkaWkgYWJvdmUuXG4gICAqXG4gICAqIE5PVEU6IHRoZSBYIGFuZCBZIGNvcm5lciByYWRpaSBuZWVkIHRvIGJvdGggYmUgZ3JlYXRlciB0aGFuIHplcm8gZm9yIHJvdW5kZWQgY29ybmVycyB0byBhcHBlYXIuIElmIHRoZXkgaGF2ZSB0aGVcbiAgICogc2FtZSBub24temVybyB2YWx1ZSwgY2lyY3VsYXIgcm91bmRlZCBjb3JuZXJzIHdpbGwgYmUgdXNlZC5cbiAgICpcbiAgICogQXZhaWxhYmxlIHBhcmFtZXRlcnMgdG8gdGhlIHZhcmlvdXMgY29uc3RydWN0b3Igb3B0aW9uczpcbiAgICogQHBhcmFtIHggLSB4LXBvc2l0aW9uIG9mIHRoZSB1cHBlci1sZWZ0IGNvcm5lciAobGVmdCBib3VuZClcbiAgICogQHBhcmFtIFt5XSAtIHktcG9zaXRpb24gb2YgdGhlIHVwcGVyLWxlZnQgY29ybmVyICh0b3AgYm91bmQpXG4gICAqIEBwYXJhbSBbd2lkdGhdIC0gd2lkdGggb2YgdGhlIHJlY3RhbmdsZSB0byB0aGUgcmlnaHQgb2YgdGhlIHVwcGVyLWxlZnQgY29ybmVyLCByZXF1aXJlZCB0byBiZSA+PSAwXG4gICAqIEBwYXJhbSBbaGVpZ2h0XSAtIGhlaWdodCBvZiB0aGUgcmVjdGFuZ2xlIGJlbG93IHRoZSB1cHBlci1sZWZ0IGNvcm5lciwgcmVxdWlyZWQgdG8gYmUgPj0gMFxuICAgKiBAcGFyYW0gW2Nvcm5lclhSYWRpdXNdIC0gcG9zaXRpdmUgdmVydGljYWwgcmFkaXVzICh3aWR0aCkgb2YgdGhlIHJvdW5kZWQgY29ybmVyLCBvciAwIHRvIGluZGljYXRlIHRoZSBjb3JuZXIgc2hvdWxkIGJlIHNoYXJwXG4gICAqIEBwYXJhbSBbY29ybmVyWVJhZGl1c10gLSBwb3NpdGl2ZSBob3Jpem9udGFsIHJhZGl1cyAoaGVpZ2h0KSBvZiB0aGUgcm91bmRlZCBjb3JuZXIsIG9yIDAgdG8gaW5kaWNhdGUgdGhlIGNvcm5lciBzaG91bGQgYmUgc2hhcnBcbiAgICogQHBhcmFtIFtvcHRpb25zXSAtIFJlY3RhbmdsZS1zcGVjaWZpYyBvcHRpb25zIGFyZSBkb2N1bWVudGVkIGluIFJFQ1RBTkdMRV9PUFRJT05fS0VZUyBhYm92ZSwgYW5kIGNhbiBiZSBwcm92aWRlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxvbmctc2lkZSBvcHRpb25zIGZvciBOb2RlXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICk7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYm91bmRzOiBCb3VuZHMyLCBvcHRpb25zPzogUmVjdGFuZ2xlT3B0aW9ucyApO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGJvdW5kczogQm91bmRzMiwgY29ybmVyUmFkaXVzWDogbnVtYmVyLCBjb3JuZXJSYWRpdXNZOiBudW1iZXIsIG9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICk7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBvcHRpb25zPzogUmVjdGFuZ2xlT3B0aW9ucyApO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY29ybmVyWFJhZGl1czogbnVtYmVyLCBjb3JuZXJZUmFkaXVzOiBudW1iZXIsIG9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICk7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggeD86IG51bWJlciB8IEJvdW5kczIgfCBSZWN0YW5nbGVPcHRpb25zLCB5PzogbnVtYmVyIHwgUmVjdGFuZ2xlT3B0aW9ucywgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciB8IFJlY3RhbmdsZU9wdGlvbnMsIGNvcm5lclhSYWRpdXM/OiBudW1iZXIgfCBSZWN0YW5nbGVPcHRpb25zLCBjb3JuZXJZUmFkaXVzPzogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICkge1xuXG4gICAgLy8gV2UnbGwgd2FudCB0byBkZWZhdWx0IHRvIHNpemFibGU6ZmFsc2UsIGJ1dCBhbGxvdyBjbGllbnRzIHRvIHBhc3MgaW4gc29tZXRoaW5nIGNvbmZsaWN0aW5nIGxpa2Ugd2lkdGhTaXphYmxlOnRydWVcbiAgICAvLyBpbiB0aGUgc3VwZXIgbXV0YXRlLiBUbyBhdm9pZCB0aGUgZXhjbHVzaXZlIG9wdGlvbnMsIHdlIGlzb2xhdGUgdGhpcyBvdXQgaGVyZS5cbiAgICBjb25zdCBpbml0aWFsT3B0aW9uczogUmVjdGFuZ2xlT3B0aW9ucyA9IHtcbiAgICAgIHNpemFibGU6IGZhbHNlXG4gICAgfTtcbiAgICBzdXBlciggbnVsbCwgaW5pdGlhbE9wdGlvbnMgKTtcblxuICAgIGxldCBvcHRpb25zOiBSZWN0YW5nbGVPcHRpb25zID0ge307XG5cbiAgICB0aGlzLl9yZWN0WCA9IDA7XG4gICAgdGhpcy5fcmVjdFkgPSAwO1xuICAgIHRoaXMuX3JlY3RXaWR0aCA9IDA7XG4gICAgdGhpcy5fcmVjdEhlaWdodCA9IDA7XG4gICAgdGhpcy5fY29ybmVyWFJhZGl1cyA9IDA7XG4gICAgdGhpcy5fY29ybmVyWVJhZGl1cyA9IDA7XG5cbiAgICBpZiAoIHR5cGVvZiB4ID09PSAnb2JqZWN0JyApIHtcbiAgICAgIC8vIGFsbG93IG5ldyBSZWN0YW5nbGUoIGJvdW5kczIsIHsgLi4uIH0gKSBvciBuZXcgUmVjdGFuZ2xlKCBib3VuZHMyLCBjb3JuZXJYUmFkaXVzLCBjb3JuZXJZUmFkaXVzLCB7IC4uLiB9IClcbiAgICAgIGlmICggeCBpbnN0YW5jZW9mIEJvdW5kczIgKSB7XG4gICAgICAgIC8vIG5ldyBSZWN0YW5nbGUoIGJvdW5kczIsIHsgLi4uIH0gKVxuICAgICAgICBpZiAoIHR5cGVvZiB5ICE9PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcmd1bWVudHMubGVuZ3RoID09PSAxIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIsXG4gICAgICAgICAgICAnbmV3IFJlY3RhbmdsZSggYm91bmRzLCB7IC4uLiB9ICkgc2hvdWxkIG9ubHkgdGFrZSBvbmUgb3IgdHdvIGFyZ3VtZW50cycgKTtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHkgPT09ICdvYmplY3QnLFxuICAgICAgICAgICAgJ25ldyBSZWN0YW5nbGUoIGJvdW5kcywgeyAuLi4gfSApIHNlY29uZCBwYXJhbWV0ZXIgc2hvdWxkIG9ubHkgZXZlciBiZSBhbiBvcHRpb25zIG9iamVjdCcgKTtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCB5ICkgPT09IE9iamVjdC5wcm90b3R5cGUsXG4gICAgICAgICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIE5vZGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xuXG4gICAgICAgICAgaWYgKCBhc3NlcnQgJiYgeSApIHtcbiAgICAgICAgICAgIGFzc2VydCggeS5yZWN0V2lkdGggPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSByZWN0V2lkdGggaW4gbXVsdGlwbGUgd2F5cycgKTtcbiAgICAgICAgICAgIGFzc2VydCggeS5yZWN0SGVpZ2h0ID09PSB1bmRlZmluZWQsICdTaG91bGQgbm90IHNwZWNpZnkgcmVjdEhlaWdodCBpbiBtdWx0aXBsZSB3YXlzJyApO1xuICAgICAgICAgICAgYXNzZXJ0KCB5LnJlY3RCb3VuZHMgPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSByZWN0Qm91bmRzIGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxSZWN0YW5nbGVPcHRpb25zPiggb3B0aW9ucywge1xuICAgICAgICAgICAgcmVjdEJvdW5kczogeFxuICAgICAgICAgIH0sIHkgKTsgLy8gT3VyIG9wdGlvbnMgb2JqZWN0IHdvdWxkIGJlIGF0IHlcbiAgICAgICAgfVxuICAgICAgICAvLyBSZWN0YW5nbGUoIGJvdW5kczIsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXMsIHsgLi4uIH0gKVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcmd1bWVudHMubGVuZ3RoID09PSAzIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDQsXG4gICAgICAgICAgICAnbmV3IFJlY3RhbmdsZSggYm91bmRzLCBjb3JuZXJYUmFkaXVzLCBjb3JuZXJZUmFkaXVzLCB7IC4uLiB9ICkgc2hvdWxkIG9ubHkgdGFrZSB0aHJlZSBvciBmb3VyIGFyZ3VtZW50cycgKTtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgaGVpZ2h0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgICAgICduZXcgUmVjdGFuZ2xlKCBib3VuZHMsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXMsIHsgLi4uIH0gKSBmb3VydGggcGFyYW1ldGVyIHNob3VsZCBvbmx5IGV2ZXIgYmUgYW4gb3B0aW9ucyBvYmplY3QnICk7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaGVpZ2h0ID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCBoZWlnaHQgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gTm9kZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XG5cbiAgICAgICAgICBpZiAoIGFzc2VydCAmJiBoZWlnaHQgKSB7XG4gICAgICAgICAgICBhc3NlcnQoICggaGVpZ2h0IGFzIFJlY3RhbmdsZU9wdGlvbnMgKS5yZWN0V2lkdGggPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSByZWN0V2lkdGggaW4gbXVsdGlwbGUgd2F5cycgKTtcbiAgICAgICAgICAgIGFzc2VydCggKCBoZWlnaHQgYXMgUmVjdGFuZ2xlT3B0aW9ucyApLnJlY3RIZWlnaHQgPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSByZWN0SGVpZ2h0IGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgICAgICBhc3NlcnQoICggaGVpZ2h0IGFzIFJlY3RhbmdsZU9wdGlvbnMgKS5yZWN0Qm91bmRzID09PSB1bmRlZmluZWQsICdTaG91bGQgbm90IHNwZWNpZnkgcmVjdEJvdW5kcyBpbiBtdWx0aXBsZSB3YXlzJyApO1xuICAgICAgICAgICAgYXNzZXJ0KCAoIGhlaWdodCBhcyBSZWN0YW5nbGVPcHRpb25zICkuY29ybmVyWFJhZGl1cyA9PT0gdW5kZWZpbmVkLCAnU2hvdWxkIG5vdCBzcGVjaWZ5IGNvcm5lclhSYWRpdXMgaW4gbXVsdGlwbGUgd2F5cycgKTtcbiAgICAgICAgICAgIGFzc2VydCggKCBoZWlnaHQgYXMgUmVjdGFuZ2xlT3B0aW9ucyApLmNvcm5lcllSYWRpdXMgPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSBjb3JuZXJZUmFkaXVzIGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgICAgICBhc3NlcnQoICggaGVpZ2h0IGFzIFJlY3RhbmdsZU9wdGlvbnMgKS5jb3JuZXJSYWRpdXMgPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSBjb3JuZXJSYWRpdXMgaW4gbXVsdGlwbGUgd2F5cycgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFJlY3RhbmdsZU9wdGlvbnM+KCBvcHRpb25zLCB7XG4gICAgICAgICAgICByZWN0Qm91bmRzOiB4LFxuICAgICAgICAgICAgY29ybmVyWFJhZGl1czogeSwgLy8gaWdub3JlIEludGVsbGlqIHdhcm5pbmcsIG91ciBjb3JuZXJYUmFkaXVzIGlzIHRoZSBzZWNvbmQgcGFyYW1ldGVyXG4gICAgICAgICAgICBjb3JuZXJZUmFkaXVzOiB3aWR0aCAvLyBpZ25vcmUgSW50ZWxsaWogd2FybmluZywgb3VyIGNvcm5lcllSYWRpdXMgaXMgdGhlIHRoaXJkIHBhcmFtZXRlclxuICAgICAgICAgIH0sIGhlaWdodCBhcyBSZWN0YW5nbGVPcHRpb25zIHwgdW5kZWZpbmVkICk7IC8vIE91ciBvcHRpb25zIG9iamVjdCB3b3VsZCBiZSBhdCBoZWlnaHRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gYWxsb3cgbmV3IFJlY3RhbmdsZSggeyByZWN0WDogeCwgcmVjdFk6IHksIHJlY3RXaWR0aDogd2lkdGgsIHJlY3RIZWlnaHQ6IGhlaWdodCwgLi4uIH0gKVxuICAgICAgZWxzZSB7XG4gICAgICAgIG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxSZWN0YW5nbGVPcHRpb25zPiggb3B0aW9ucywgeCApO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBuZXcgUmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB7IC4uLiB9IClcbiAgICBlbHNlIGlmICggY29ybmVyWVJhZGl1cyA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYXJndW1lbnRzLmxlbmd0aCA9PT0gNCB8fCBhcmd1bWVudHMubGVuZ3RoID09PSA1LFxuICAgICAgICAnbmV3IFJlY3RhbmdsZSggeCwgeSwgd2lkdGgsIGhlaWdodCwgeyAuLi4gfSApIHNob3VsZCBvbmx5IHRha2UgZm91ciBvciBmaXZlIGFyZ3VtZW50cycgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvcm5lclhSYWRpdXMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgY29ybmVyWFJhZGl1cyA9PT0gJ29iamVjdCcsXG4gICAgICAgICduZXcgUmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB7IC4uLiB9ICkgZmlmdGggcGFyYW1ldGVyIHNob3VsZCBvbmx5IGV2ZXIgYmUgYW4gb3B0aW9ucyBvYmplY3QnICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb3JuZXJYUmFkaXVzID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCBjb3JuZXJYUmFkaXVzICkgPT09IE9iamVjdC5wcm90b3R5cGUsXG4gICAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gTm9kZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XG5cbiAgICAgIGlmICggYXNzZXJ0ICYmIGNvcm5lclhSYWRpdXMgKSB7XG4gICAgICAgIGFzc2VydCggKCBjb3JuZXJYUmFkaXVzIGFzIFJlY3RhbmdsZU9wdGlvbnMgKS5yZWN0WCA9PT0gdW5kZWZpbmVkLCAnU2hvdWxkIG5vdCBzcGVjaWZ5IHJlY3RYIGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgIGFzc2VydCggKCBjb3JuZXJYUmFkaXVzIGFzIFJlY3RhbmdsZU9wdGlvbnMgKS5yZWN0WSA9PT0gdW5kZWZpbmVkLCAnU2hvdWxkIG5vdCBzcGVjaWZ5IHJlY3RZIGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgIGFzc2VydCggKCBjb3JuZXJYUmFkaXVzIGFzIFJlY3RhbmdsZU9wdGlvbnMgKS5yZWN0V2lkdGggPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSByZWN0V2lkdGggaW4gbXVsdGlwbGUgd2F5cycgKTtcbiAgICAgICAgYXNzZXJ0KCAoIGNvcm5lclhSYWRpdXMgYXMgUmVjdGFuZ2xlT3B0aW9ucyApLnJlY3RIZWlnaHQgPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSByZWN0SGVpZ2h0IGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgIGFzc2VydCggKCBjb3JuZXJYUmFkaXVzIGFzIFJlY3RhbmdsZU9wdGlvbnMgKS5yZWN0Qm91bmRzID09PSB1bmRlZmluZWQsICdTaG91bGQgbm90IHNwZWNpZnkgcmVjdEJvdW5kcyBpbiBtdWx0aXBsZSB3YXlzJyApO1xuICAgICAgfVxuICAgICAgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFJlY3RhbmdsZU9wdGlvbnM+KCBvcHRpb25zLCB7XG4gICAgICAgIHJlY3RYOiB4LFxuICAgICAgICByZWN0WTogeSBhcyBudW1iZXIsXG4gICAgICAgIHJlY3RXaWR0aDogd2lkdGgsXG4gICAgICAgIHJlY3RIZWlnaHQ6IGhlaWdodCBhcyBudW1iZXJcbiAgICAgIH0sIGNvcm5lclhSYWRpdXMgYXMgUmVjdGFuZ2xlT3B0aW9ucyApO1xuICAgIH1cbiAgICAvLyBuZXcgUmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb3JuZXJYUmFkaXVzLCBjb3JuZXJZUmFkaXVzLCB7IC4uLiB9IClcbiAgICBlbHNlIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyZ3VtZW50cy5sZW5ndGggPT09IDYgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gNyxcbiAgICAgICAgJ25ldyBSZWN0YW5nbGUoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXN7IC4uLiB9ICkgc2hvdWxkIG9ubHkgdGFrZSBzaXggb3Igc2V2ZW4gYXJndW1lbnRzJyApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyxcbiAgICAgICAgJ25ldyBSZWN0YW5nbGUoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXN7IC4uLiB9ICkgc2V2ZW50aCBwYXJhbWV0ZXIgc2hvdWxkIG9ubHkgZXZlciBiZSBhbiBvcHRpb25zIG9iamVjdCcgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBOb2RlIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCcgKTtcblxuICAgICAgaWYgKCBhc3NlcnQgJiYgcHJvdmlkZWRPcHRpb25zICkge1xuICAgICAgICBhc3NlcnQoIHByb3ZpZGVkT3B0aW9ucy5yZWN0WCA9PT0gdW5kZWZpbmVkLCAnU2hvdWxkIG5vdCBzcGVjaWZ5IHJlY3RYIGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLnJlY3RZID09PSB1bmRlZmluZWQsICdTaG91bGQgbm90IHNwZWNpZnkgcmVjdFkgaW4gbXVsdGlwbGUgd2F5cycgKTtcbiAgICAgICAgYXNzZXJ0KCBwcm92aWRlZE9wdGlvbnMucmVjdFdpZHRoID09PSB1bmRlZmluZWQsICdTaG91bGQgbm90IHNwZWNpZnkgcmVjdFdpZHRoIGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLnJlY3RIZWlnaHQgPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSByZWN0SGVpZ2h0IGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLnJlY3RCb3VuZHMgPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSByZWN0Qm91bmRzIGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLmNvcm5lclhSYWRpdXMgPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSBjb3JuZXJYUmFkaXVzIGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLmNvcm5lcllSYWRpdXMgPT09IHVuZGVmaW5lZCwgJ1Nob3VsZCBub3Qgc3BlY2lmeSBjb3JuZXJZUmFkaXVzIGluIG11bHRpcGxlIHdheXMnICk7XG4gICAgICAgIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLmNvcm5lclJhZGl1cyA9PT0gdW5kZWZpbmVkLCAnU2hvdWxkIG5vdCBzcGVjaWZ5IGNvcm5lclJhZGl1cyBpbiBtdWx0aXBsZSB3YXlzJyApO1xuICAgICAgfVxuICAgICAgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFJlY3RhbmdsZU9wdGlvbnM+KCBvcHRpb25zLCB7XG4gICAgICAgIHJlY3RYOiB4LFxuICAgICAgICByZWN0WTogeSBhcyBudW1iZXIsXG4gICAgICAgIHJlY3RXaWR0aDogd2lkdGgsXG4gICAgICAgIHJlY3RIZWlnaHQ6IGhlaWdodCBhcyBudW1iZXIsXG4gICAgICAgIGNvcm5lclhSYWRpdXM6IGNvcm5lclhSYWRpdXMgYXMgbnVtYmVyLFxuICAgICAgICBjb3JuZXJZUmFkaXVzOiBjb3JuZXJZUmFkaXVzXG4gICAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eS5sYXp5TGluayggdGhpcy51cGRhdGVQcmVmZXJyZWRTaXplcy5iaW5kKCB0aGlzICkgKTtcbiAgICB0aGlzLmxvY2FsUHJlZmVycmVkSGVpZ2h0UHJvcGVydHkubGF6eUxpbmsoIHRoaXMudXBkYXRlUHJlZmVycmVkU2l6ZXMuYmluZCggdGhpcyApICk7XG4gICAgdGhpcy5sb2NhbE1pbmltdW1XaWR0aFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnVwZGF0ZVByZWZlcnJlZFNpemVzLmJpbmQoIHRoaXMgKSApO1xuICAgIHRoaXMubG9jYWxNaW5pbXVtSGVpZ2h0UHJvcGVydHkubGF6eUxpbmsoIHRoaXMudXBkYXRlUHJlZmVycmVkU2l6ZXMuYmluZCggdGhpcyApICk7XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB0aGUgbWF4aW11bSBhcmMgc2l6ZSB0aGF0IGNhbiBiZSBhY2NvbW1vZGF0ZWQgYnkgdGhlIGN1cnJlbnQgd2lkdGggYW5kIGhlaWdodC5cbiAgICpcbiAgICogSWYgdGhlIGNvcm5lciByYWRpaSBhcmUgdGhlIHNhbWUgYXMgdGhlIG1heGltdW0gYXJjIHNpemUgb24gYSBzcXVhcmUsIGl0IHdpbGwgYXBwZWFyIHRvIGJlIGEgY2lyY2xlICh0aGUgYXJjc1xuICAgKiB0YWtlIHVwIGFsbCBvZiB0aGUgcm9vbSwgYW5kIGxlYXZlIG5vIHN0cmFpZ2h0IHNlZ21lbnRzKS4gSW4gdGhlIGNhc2Ugb2YgYSBub24tc3F1YXJlLCBvbmUgZGlyZWN0aW9uIG9mIGVkZ2VzXG4gICAqIHdpbGwgZXhpc3QgKGUuZy4gdG9wL2JvdHRvbSBvciBsZWZ0L3JpZ2h0KSwgd2hpbGUgdGhlIG90aGVyIGVkZ2VzIHdvdWxkIGJlIGZ1bGx5IHJvdW5kZWQuXG4gICAqL1xuICBwcml2YXRlIGdldE1heGltdW1BcmNTaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgubWluKCB0aGlzLl9yZWN0V2lkdGggLyAyLCB0aGlzLl9yZWN0SGVpZ2h0IC8gMiApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgdGhlIGRlZmF1bHQgYWxsb3dlZCByZW5kZXJlcnMgKHJldHVybmVkIHZpYSB0aGUgUmVuZGVyZXIgYml0bWFzaykgdGhhdCBhcmUgYWxsb3dlZCwgZ2l2ZW4gdGhlXG4gICAqIGN1cnJlbnQgc3Ryb2tlIG9wdGlvbnMuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBXZSBjYW4gc3VwcG9ydCB0aGUgRE9NIHJlbmRlcmVyIGlmIHRoZXJlIGlzIGEgc29saWQtc3R5bGVkIHN0cm9rZSB3aXRoIG5vbi1iZXZlbCBsaW5lIGpvaW5zXG4gICAqICh3aGljaCBvdGhlcndpc2Ugd291bGRuJ3QgYmUgc3VwcG9ydGVkKS5cbiAgICpcbiAgICogQHJldHVybnMgLSBSZW5kZXJlciBiaXRtYXNrLCBzZWUgUmVuZGVyZXIgZm9yIGRldGFpbHNcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRTdHJva2VSZW5kZXJlckJpdG1hc2soKTogbnVtYmVyIHtcbiAgICBsZXQgYml0bWFzayA9IHN1cGVyLmdldFN0cm9rZVJlbmRlcmVyQml0bWFzaygpO1xuICAgIGNvbnN0IHN0cm9rZSA9IHRoaXMuZ2V0U3Ryb2tlKCk7XG4gICAgLy8gRE9NIHN0cm9rZSBoYW5kbGluZyBkb2Vzbid0IFlFVCBzdXBwb3J0IGdyYWRpZW50cywgcGF0dGVybnMsIG9yIGRhc2hlcyAod2l0aCB0aGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbiwgaXQgc2hvdWxkbid0IGJlIHRvbyBoYXJkKVxuICAgIGlmICggc3Ryb2tlICYmICEoIHN0cm9rZSBpbnN0YW5jZW9mIEdyYWRpZW50ICkgJiYgISggc3Ryb2tlIGluc3RhbmNlb2YgUGF0dGVybiApICYmICF0aGlzLmhhc0xpbmVEYXNoKCkgKSB7XG4gICAgICAvLyB3ZSBjYW4ndCBzdXBwb3J0IHRoZSBiZXZlbCBsaW5lLWpvaW4gd2l0aCBvdXIgY3VycmVudCBET00gcmVjdGFuZ2xlIGRpc3BsYXlcbiAgICAgIGlmICggdGhpcy5nZXRMaW5lSm9pbigpID09PSAnbWl0ZXInIHx8ICggdGhpcy5nZXRMaW5lSm9pbigpID09PSAncm91bmQnICYmIEZlYXR1cmVzLmJvcmRlclJhZGl1cyApICkge1xuICAgICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tET007XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCAhdGhpcy5oYXNTdHJva2UoKSApIHtcbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza1dlYkdMO1xuICAgIH1cblxuICAgIHJldHVybiBiaXRtYXNrO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgdGhlIGFsbG93ZWQgcmVuZGVyZXJzIHRoYXQgYXJlIGFsbG93ZWQgKG9yIGV4Y2x1ZGVkKSBiYXNlZCBvbiB0aGUgY3VycmVudCBQYXRoLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHJldHVybnMgLSBSZW5kZXJlciBiaXRtYXNrLCBzZWUgUmVuZGVyZXIgZm9yIGRldGFpbHNcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRQYXRoUmVuZGVyZXJCaXRtYXNrKCk6IG51bWJlciB7XG4gICAgbGV0IGJpdG1hc2sgPSBSZW5kZXJlci5iaXRtYXNrQ2FudmFzIHwgUmVuZGVyZXIuYml0bWFza1NWRztcblxuICAgIGNvbnN0IG1heGltdW1BcmNTaXplID0gdGhpcy5nZXRNYXhpbXVtQXJjU2l6ZSgpO1xuXG4gICAgLy8gSWYgdGhlIHRvcC9ib3R0b20gb3IgbGVmdC9yaWdodCBzdHJva2VzIHRvdWNoIGFuZCBvdmVybGFwIGluIHRoZSBtaWRkbGUgKHNtYWxsIHJlY3RhbmdsZSwgYmlnIHN0cm9rZSksIG91ciBET00gbWV0aG9kIHdvbid0IHdvcmsuXG4gICAgLy8gQWRkaXRpb25hbGx5LCBpZiB3ZSdyZSBoYW5kbGluZyByb3VuZGVkIHJlY3RhbmdsZXMgb3IgYSBzdHJva2Ugd2l0aCBsaW5lSm9pbiAncm91bmQnLCB3ZSdsbCBuZWVkIGJvcmRlclJhZGl1c1xuICAgIC8vIFdlIGFsc28gcmVxdWlyZSBmb3IgRE9NIHRoYXQgaWYgaXQncyBhIHJvdW5kZWQgcmVjdGFuZ2xlLCBpdCdzIHJvdW5kZWQgd2l0aCBjaXJjdWxhciBhcmNzIChmb3Igbm93LCBjb3VsZCBwb3RlbnRpYWxseSBkbyBhIHRyYW5zZm9ybSB0cmljayEpXG4gICAgaWYgKCAoICF0aGlzLmhhc1N0cm9rZSgpIHx8ICggdGhpcy5nZXRMaW5lV2lkdGgoKSA8PSB0aGlzLl9yZWN0SGVpZ2h0ICYmIHRoaXMuZ2V0TGluZVdpZHRoKCkgPD0gdGhpcy5fcmVjdFdpZHRoICkgKSAmJlxuICAgICAgICAgKCAhdGhpcy5pc1JvdW5kZWQoKSB8fCAoIEZlYXR1cmVzLmJvcmRlclJhZGl1cyAmJiB0aGlzLl9jb3JuZXJYUmFkaXVzID09PSB0aGlzLl9jb3JuZXJZUmFkaXVzICkgKSAmJlxuICAgICAgICAgdGhpcy5fY29ybmVyWVJhZGl1cyA8PSBtYXhpbXVtQXJjU2l6ZSAmJiB0aGlzLl9jb3JuZXJYUmFkaXVzIDw9IG1heGltdW1BcmNTaXplICkge1xuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrRE9NO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHdoeSBjaGVjayBoZXJlLCBpZiB3ZSBhbHNvIGNoZWNrIGluIHRoZSAnc3Ryb2tlJyBwb3J0aW9uPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGlmICggIXRoaXMuaGFzU3Ryb2tlKCkgJiYgIXRoaXMuaXNSb3VuZGVkKCkgKSB7XG4gICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tXZWJHTDtcbiAgICB9XG5cbiAgICByZXR1cm4gYml0bWFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFsbCBvZiB0aGUgc2hhcGUtZGV0ZXJtaW5pbmcgcGFyYW1ldGVycyBmb3IgdGhlIHJlY3RhbmdsZS5cbiAgICpcbiAgICogQHBhcmFtIHggLSBUaGUgeC1wb3NpdGlvbiBvZiB0aGUgbGVmdCBzaWRlIG9mIHRoZSByZWN0YW5nbGUuXG4gICAqIEBwYXJhbSB5IC0gVGhlIHktcG9zaXRpb24gb2YgdGhlIHRvcCBzaWRlIG9mIHRoZSByZWN0YW5nbGUuXG4gICAqIEBwYXJhbSB3aWR0aCAtIFRoZSB3aWR0aCBvZiB0aGUgcmVjdGFuZ2xlLlxuICAgKiBAcGFyYW0gaGVpZ2h0IC0gVGhlIGhlaWdodCBvZiB0aGUgcmVjdGFuZ2xlLlxuICAgKiBAcGFyYW0gW2Nvcm5lclhSYWRpdXNdIC0gVGhlIGhvcml6b250YWwgcmFkaXVzIG9mIGN1cnZlZCBjb3JuZXJzICgwIGZvciBzaGFycCBjb3JuZXJzKVxuICAgKiBAcGFyYW0gW2Nvcm5lcllSYWRpdXNdIC0gVGhlIHZlcnRpY2FsIHJhZGl1cyBvZiBjdXJ2ZWQgY29ybmVycyAoMCBmb3Igc2hhcnAgY29ybmVycylcbiAgICovXG4gIHB1YmxpYyBzZXRSZWN0KCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNvcm5lclhSYWRpdXM/OiBudW1iZXIsIGNvcm5lcllSYWRpdXM/OiBudW1iZXIgKTogdGhpcyB7XG4gICAgY29uc3QgaGFzWFJhZGl1cyA9IGNvcm5lclhSYWRpdXMgIT09IHVuZGVmaW5lZDtcbiAgICBjb25zdCBoYXNZUmFkaXVzID0gY29ybmVyWVJhZGl1cyAhPT0gdW5kZWZpbmVkO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHggKSAmJiBpc0Zpbml0ZSggeSApICYmXG4gICAgaXNGaW5pdGUoIHdpZHRoICkgJiYgaXNGaW5pdGUoIGhlaWdodCApLCAneC95L3dpZHRoL2hlaWdodCBzaG91bGQgYmUgZmluaXRlIG51bWJlcnMnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWhhc1hSYWRpdXMgfHwgaXNGaW5pdGUoIGNvcm5lclhSYWRpdXMgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICggIWhhc1lSYWRpdXMgfHwgaXNGaW5pdGUoIGNvcm5lcllSYWRpdXMgKSApLFxuICAgICAgJ0Nvcm5lciByYWRpaSAoaWYgcHJvdmlkZWQpIHNob3VsZCBiZSBmaW5pdGUgbnVtYmVycycgKTtcblxuICAgIC8vIElmIHRoaXMgZG9lc24ndCBjaGFuZ2UgdGhlIHJlY3RhbmdsZSwgZG9uJ3Qgbm90aWZ5IGFib3V0IGNoYW5nZXMuXG4gICAgaWYgKCB0aGlzLl9yZWN0WCA9PT0geCAmJlxuICAgICAgICAgdGhpcy5fcmVjdFkgPT09IHkgJiZcbiAgICAgICAgIHRoaXMuX3JlY3RXaWR0aCA9PT0gd2lkdGggJiZcbiAgICAgICAgIHRoaXMuX3JlY3RIZWlnaHQgPT09IGhlaWdodCAmJlxuICAgICAgICAgKCAhaGFzWFJhZGl1cyB8fCB0aGlzLl9jb3JuZXJYUmFkaXVzID09PSBjb3JuZXJYUmFkaXVzICkgJiZcbiAgICAgICAgICggIWhhc1lSYWRpdXMgfHwgdGhpcy5fY29ybmVyWVJhZGl1cyA9PT0gY29ybmVyWVJhZGl1cyApICkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fcmVjdFggPSB4O1xuICAgIHRoaXMuX3JlY3RZID0geTtcbiAgICB0aGlzLl9yZWN0V2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLl9yZWN0SGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuX2Nvcm5lclhSYWRpdXMgPSBoYXNYUmFkaXVzID8gY29ybmVyWFJhZGl1cyA6IHRoaXMuX2Nvcm5lclhSYWRpdXM7XG4gICAgdGhpcy5fY29ybmVyWVJhZGl1cyA9IGhhc1lSYWRpdXMgPyBjb3JuZXJZUmFkaXVzIDogdGhpcy5fY29ybmVyWVJhZGl1cztcblxuICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRSZWN0YW5nbGVEcmF3YWJsZSApLm1hcmtEaXJ0eVJlY3RhbmdsZSgpO1xuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdGVSZWN0YW5nbGUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCBzaWRlIG9mIHRoaXMgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqL1xuICBwdWJsaWMgc2V0UmVjdFgoIHg6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCAncmVjdFggc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcblxuICAgIGlmICggdGhpcy5fcmVjdFggIT09IHggKSB7XG4gICAgICB0aGlzLl9yZWN0WCA9IHg7XG5cbiAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUmVjdGFuZ2xlRHJhd2FibGUgKS5tYXJrRGlydHlYKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZVJlY3RhbmdsZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmVjdFgoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0UmVjdFgoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHJlY3RYKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFJlY3RYKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgeCBjb29yZGluYXRlIG9mIHRoZSBsZWZ0IHNpZGUgb2YgdGhpcyByZWN0YW5nbGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cbiAgICovXG4gIHB1YmxpYyBnZXRSZWN0WCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9yZWN0WDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB5IGNvb3JkaW5hdGUgb2YgdGhlIHRvcCBzaWRlIG9mIHRoaXMgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqL1xuICBwdWJsaWMgc2V0UmVjdFkoIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCAncmVjdFkgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcblxuICAgIGlmICggdGhpcy5fcmVjdFkgIT09IHkgKSB7XG4gICAgICB0aGlzLl9yZWN0WSA9IHk7XG5cbiAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUmVjdGFuZ2xlRHJhd2FibGUgKS5tYXJrRGlydHlZKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZVJlY3RhbmdsZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmVjdFkoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0UmVjdFkoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHJlY3RZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFJlY3RZKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgeSBjb29yZGluYXRlIG9mIHRoZSB0b3Agc2lkZSBvZiB0aGlzIHJlY3RhbmdsZSAoaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpLlxuICAgKi9cbiAgcHVibGljIGdldFJlY3RZKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3JlY3RZO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHdpZHRoIG9mIHRoZSByZWN0YW5nbGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cbiAgICovXG4gIHB1YmxpYyBzZXRSZWN0V2lkdGgoIHdpZHRoOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHdpZHRoICksICdyZWN0V2lkdGggc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcblxuICAgIGlmICggdGhpcy5fcmVjdFdpZHRoICE9PSB3aWR0aCApIHtcbiAgICAgIHRoaXMuX3JlY3RXaWR0aCA9IHdpZHRoO1xuXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFJlY3RhbmdsZURyYXdhYmxlICkubWFya0RpcnR5V2lkdGgoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnZhbGlkYXRlUmVjdGFuZ2xlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCByZWN0V2lkdGgoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0UmVjdFdpZHRoKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCByZWN0V2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0UmVjdFdpZHRoKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIHJlY3RhbmdsZSAoaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpLlxuICAgKi9cbiAgcHVibGljIGdldFJlY3RXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9yZWN0V2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cbiAgICovXG4gIHB1YmxpYyBzZXRSZWN0SGVpZ2h0KCBoZWlnaHQ6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggaGVpZ2h0ICksICdyZWN0SGVpZ2h0IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XG5cbiAgICBpZiAoIHRoaXMuX3JlY3RIZWlnaHQgIT09IGhlaWdodCApIHtcbiAgICAgIHRoaXMuX3JlY3RIZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUmVjdGFuZ2xlRHJhd2FibGUgKS5tYXJrRGlydHlIZWlnaHQoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnZhbGlkYXRlUmVjdGFuZ2xlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCByZWN0SGVpZ2h0KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFJlY3RIZWlnaHQoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHJlY3RIZWlnaHQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0UmVjdEhlaWdodCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqL1xuICBwdWJsaWMgZ2V0UmVjdEhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9yZWN0SGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGhvcml6b250YWwgY29ybmVyIHJhZGl1cyBvZiB0aGUgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqXG4gICAqIElmIHRoZSBjb3JuZXJYUmFkaXVzIGFuZCBjb3JuZXJZUmFkaXVzIGFyZSB0aGUgc2FtZSwgdGhlIGNvcm5lcnMgd2lsbCBiZSByb3VuZGVkIGNpcmN1bGFyIGFyY3Mgd2l0aCB0aGF0IHJhZGl1c1xuICAgKiAob3IgYSBzbWFsbGVyIHJhZGl1cyBpZiB0aGUgcmVjdGFuZ2xlIGlzIHRvbyBzbWFsbCkuXG4gICAqXG4gICAqIElmIHRoZSBjb3JuZXJYUmFkaXVzIGFuZCBjb3JuZXJZUmFkaXVzIGFyZSBkaWZmZXJlbnQsIHRoZSBjb3JuZXJzIHdpbGwgYmUgZWxsaXB0aWNhbCBhcmNzLCBhbmQgdGhlIGhvcml6b250YWxcbiAgICogcmFkaXVzIHdpbGwgYmUgZXF1YWwgdG8gY29ybmVyWFJhZGl1cyAob3IgYSBzbWFsbGVyIHJhZGl1cyBpZiB0aGUgcmVjdGFuZ2xlIGlzIHRvbyBzbWFsbCkuXG4gICAqL1xuICBwdWJsaWMgc2V0Q29ybmVyWFJhZGl1cyggcmFkaXVzOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHJhZGl1cyApLCAnY29ybmVyWFJhZGl1cyBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyJyApO1xuXG4gICAgaWYgKCB0aGlzLl9jb3JuZXJYUmFkaXVzICE9PSByYWRpdXMgKSB7XG4gICAgICB0aGlzLl9jb3JuZXJYUmFkaXVzID0gcmFkaXVzO1xuXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFJlY3RhbmdsZURyYXdhYmxlICkubWFya0RpcnR5Q29ybmVyWFJhZGl1cygpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmludmFsaWRhdGVSZWN0YW5nbGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IGNvcm5lclhSYWRpdXMoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0Q29ybmVyWFJhZGl1cyggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgY29ybmVyWFJhZGl1cygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRDb3JuZXJYUmFkaXVzKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaG9yaXpvbnRhbCBjb3JuZXIgcmFkaXVzIG9mIHRoZSByZWN0YW5nbGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cbiAgICovXG4gIHB1YmxpYyBnZXRDb3JuZXJYUmFkaXVzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvcm5lclhSYWRpdXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmVydGljYWwgY29ybmVyIHJhZGl1cyBvZiB0aGUgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqXG4gICAqIElmIHRoZSBjb3JuZXJYUmFkaXVzIGFuZCBjb3JuZXJZUmFkaXVzIGFyZSB0aGUgc2FtZSwgdGhlIGNvcm5lcnMgd2lsbCBiZSByb3VuZGVkIGNpcmN1bGFyIGFyY3Mgd2l0aCB0aGF0IHJhZGl1c1xuICAgKiAob3IgYSBzbWFsbGVyIHJhZGl1cyBpZiB0aGUgcmVjdGFuZ2xlIGlzIHRvbyBzbWFsbCkuXG4gICAqXG4gICAqIElmIHRoZSBjb3JuZXJYUmFkaXVzIGFuZCBjb3JuZXJZUmFkaXVzIGFyZSBkaWZmZXJlbnQsIHRoZSBjb3JuZXJzIHdpbGwgYmUgZWxsaXB0aWNhbCBhcmNzLCBhbmQgdGhlIHZlcnRpY2FsXG4gICAqIHJhZGl1cyB3aWxsIGJlIGVxdWFsIHRvIGNvcm5lcllSYWRpdXMgKG9yIGEgc21hbGxlciByYWRpdXMgaWYgdGhlIHJlY3RhbmdsZSBpcyB0b28gc21hbGwpLlxuICAgKi9cbiAgcHVibGljIHNldENvcm5lcllSYWRpdXMoIHJhZGl1czogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCByYWRpdXMgKSwgJ2Nvcm5lcllSYWRpdXMgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcblxuICAgIGlmICggdGhpcy5fY29ybmVyWVJhZGl1cyAhPT0gcmFkaXVzICkge1xuICAgICAgdGhpcy5fY29ybmVyWVJhZGl1cyA9IHJhZGl1cztcblxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRSZWN0YW5nbGVEcmF3YWJsZSApLm1hcmtEaXJ0eUNvcm5lcllSYWRpdXMoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnZhbGlkYXRlUmVjdGFuZ2xlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBjb3JuZXJZUmFkaXVzKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldENvcm5lcllSYWRpdXMoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGNvcm5lcllSYWRpdXMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0Q29ybmVyWVJhZGl1cygpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZlcnRpY2FsIGNvcm5lciByYWRpdXMgb2YgdGhlIHJlY3RhbmdsZSAoaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpLlxuICAgKi9cbiAgcHVibGljIGdldENvcm5lcllSYWRpdXMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29ybmVyWVJhZGl1cztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBSZWN0YW5nbGUncyB4L3kvd2lkdGgvaGVpZ2h0IGZyb20gdGhlIEJvdW5kczIgcGFzc2VkIGluLlxuICAgKi9cbiAgcHVibGljIHNldFJlY3RCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiB0aGlzIHtcbiAgICB0aGlzLnNldFJlY3QoIGJvdW5kcy54LCBib3VuZHMueSwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0ICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmVjdEJvdW5kcyggdmFsdWU6IEJvdW5kczIgKSB7IHRoaXMuc2V0UmVjdEJvdW5kcyggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgcmVjdEJvdW5kcygpOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZ2V0UmVjdEJvdW5kcygpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgQm91bmRzMiBnZW5lcmF0ZWQgZnJvbSB0aGlzIFJlY3RhbmdsZSdzIHgveS93aWR0aC9oZWlnaHQuXG4gICAqL1xuICBwdWJsaWMgZ2V0UmVjdEJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gQm91bmRzMi5yZWN0KCB0aGlzLl9yZWN0WCwgdGhpcy5fcmVjdFksIHRoaXMuX3JlY3RXaWR0aCwgdGhpcy5fcmVjdEhlaWdodCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIFJlY3RhbmdsZSdzIHdpZHRoL2hlaWdodCBmcm9tIHRoZSBEaW1lbnNpb24yIHNpemUgcGFzc2VkIGluLlxuICAgKi9cbiAgcHVibGljIHNldFJlY3RTaXplKCBzaXplOiBEaW1lbnNpb24yICk6IHRoaXMge1xuICAgIHRoaXMuc2V0UmVjdFdpZHRoKCBzaXplLndpZHRoICk7XG4gICAgdGhpcy5zZXRSZWN0SGVpZ2h0KCBzaXplLmhlaWdodCApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHJlY3RTaXplKCB2YWx1ZTogRGltZW5zaW9uMiApIHsgdGhpcy5zZXRSZWN0U2l6ZSggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgcmVjdFNpemUoKTogRGltZW5zaW9uMiB7IHJldHVybiB0aGlzLmdldFJlY3RTaXplKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBEaW1lbnNpb24yIGdlbmVyYXRlZCBmcm9tIHRoaXMgUmVjdGFuZ2xlJ3Mgd2lkdGgvaGVpZ2h0LlxuICAgKi9cbiAgcHVibGljIGdldFJlY3RTaXplKCk6IERpbWVuc2lvbjIge1xuICAgIHJldHVybiBuZXcgRGltZW5zaW9uMiggdGhpcy5fcmVjdFdpZHRoLCB0aGlzLl9yZWN0SGVpZ2h0ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgd2lkdGggb2YgdGhlIHJlY3RhbmdsZSB3aGlsZSBrZWVwaW5nIGl0cyByaWdodCBlZGdlICh4ICsgd2lkdGgpIGluIHRoZSBzYW1lIHBvc2l0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0UmVjdFdpZHRoRnJvbVJpZ2h0KCB3aWR0aDogbnVtYmVyICk6IHRoaXMge1xuICAgIGlmICggdGhpcy5fcmVjdFdpZHRoICE9PSB3aWR0aCApIHtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5fcmVjdFggKyB0aGlzLl9yZWN0V2lkdGg7XG4gICAgICB0aGlzLnNldFJlY3RXaWR0aCggd2lkdGggKTtcbiAgICAgIHRoaXMuc2V0UmVjdFgoIHJpZ2h0IC0gd2lkdGggKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmVjdFdpZHRoRnJvbVJpZ2h0KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFJlY3RXaWR0aEZyb21SaWdodCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgcmVjdFdpZHRoRnJvbVJpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFJlY3RXaWR0aCgpOyB9IC8vIGJlY2F1c2UgSlNIaW50IGNvbXBsYWluc1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoZWlnaHQgb2YgdGhlIHJlY3RhbmdsZSB3aGlsZSBrZWVwaW5nIGl0cyBib3R0b20gZWRnZSAoeSArIGhlaWdodCkgaW4gdGhlIHNhbWUgcG9zaXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXRSZWN0SGVpZ2h0RnJvbUJvdHRvbSggaGVpZ2h0OiBudW1iZXIgKTogdGhpcyB7XG4gICAgaWYgKCB0aGlzLl9yZWN0SGVpZ2h0ICE9PSBoZWlnaHQgKSB7XG4gICAgICBjb25zdCBib3R0b20gPSB0aGlzLl9yZWN0WSArIHRoaXMuX3JlY3RIZWlnaHQ7XG4gICAgICB0aGlzLnNldFJlY3RIZWlnaHQoIGhlaWdodCApO1xuICAgICAgdGhpcy5zZXRSZWN0WSggYm90dG9tIC0gaGVpZ2h0ICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHJlY3RIZWlnaHRGcm9tQm90dG9tKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFJlY3RIZWlnaHRGcm9tQm90dG9tKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCByZWN0SGVpZ2h0RnJvbUJvdHRvbSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSZWN0SGVpZ2h0KCk7IH0gLy8gYmVjYXVzZSBKU0hpbnQgY29tcGxhaW5zXG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIHJlY3RhbmdsZSBoYXMgYW55IHJvdW5kaW5nIGFwcGxpZWQgYXQgaXRzIGNvcm5lcnMuIElmIGVpdGhlciB0aGUgeCBvciB5IGNvcm5lciByYWRpdXMgaXMgMCxcbiAgICogdGhlbiB0aGVyZSBpcyBubyByb3VuZGluZyBhcHBsaWVkLlxuICAgKi9cbiAgcHVibGljIGlzUm91bmRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY29ybmVyWFJhZGl1cyAhPT0gMCAmJiB0aGlzLl9jb3JuZXJZUmFkaXVzICE9PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBib3VuZHMgb2YgdGhlIFJlY3RhbmdsZSwgaW5jbHVkaW5nIGFueSBhcHBsaWVkIHN0cm9rZS4gT3ZlcnJpZGRlbiBmb3IgZWZmaWNpZW5jeS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjb21wdXRlU2hhcGVCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgbGV0IGJvdW5kcyA9IG5ldyBCb3VuZHMyKCB0aGlzLl9yZWN0WCwgdGhpcy5fcmVjdFksIHRoaXMuX3JlY3RYICsgdGhpcy5fcmVjdFdpZHRoLCB0aGlzLl9yZWN0WSArIHRoaXMuX3JlY3RIZWlnaHQgKTtcbiAgICBpZiAoIHRoaXMuX3N0cm9rZSApIHtcbiAgICAgIC8vIHNpbmNlIHdlIGFyZSBheGlzLWFsaWduZWQsIGFueSBzdHJva2Ugd2lsbCBleHBhbmQgb3VyIGJvdW5kcyBieSBhIGd1YXJhbnRlZWQgc2V0IGFtb3VudFxuICAgICAgYm91bmRzID0gYm91bmRzLmRpbGF0ZWQoIHRoaXMuZ2V0TGluZVdpZHRoKCkgLyAyICk7XG4gICAgfVxuICAgIHJldHVybiBib3VuZHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFNoYXBlIHRoYXQgaXMgZXF1aXZhbGVudCB0byBvdXIgcmVuZGVyZWQgZGlzcGxheS4gR2VuZXJhbGx5IHVzZWQgdG8gbGF6aWx5IGNyZWF0ZSBhIFNoYXBlIGluc3RhbmNlXG4gICAqIHdoZW4gb25lIGlzIG5lZWRlZCwgd2l0aG91dCBoYXZpbmcgdG8gZG8gc28gYmVmb3JlaGFuZC5cbiAgICovXG4gIHByaXZhdGUgY3JlYXRlUmVjdGFuZ2xlU2hhcGUoKTogU2hhcGUge1xuICAgIGlmICggdGhpcy5pc1JvdW5kZWQoKSApIHtcbiAgICAgIC8vIGNvcHkgYm9yZGVyLXJhZGl1cyBDU1MgYmVoYXZpb3IgaW4gQ2hyb21lLCB3aGVyZSB0aGUgYXJjcyB3b24ndCBpbnRlcnNlY3QsIGluIGNhc2VzIHdoZXJlIHRoZSBhcmMgc2VnbWVudHMgYXQgZnVsbCBzaXplIHdvdWxkIGludGVyc2VjdCBlYWNoIG90aGVyXG4gICAgICBjb25zdCBtYXhpbXVtQXJjU2l6ZSA9IE1hdGgubWluKCB0aGlzLl9yZWN0V2lkdGggLyAyLCB0aGlzLl9yZWN0SGVpZ2h0IC8gMiApO1xuICAgICAgcmV0dXJuIFNoYXBlLnJvdW5kUmVjdGFuZ2xlKCB0aGlzLl9yZWN0WCwgdGhpcy5fcmVjdFksIHRoaXMuX3JlY3RXaWR0aCwgdGhpcy5fcmVjdEhlaWdodCxcbiAgICAgICAgTWF0aC5taW4oIG1heGltdW1BcmNTaXplLCB0aGlzLl9jb3JuZXJYUmFkaXVzICksIE1hdGgubWluKCBtYXhpbXVtQXJjU2l6ZSwgdGhpcy5fY29ybmVyWVJhZGl1cyApICkubWFrZUltbXV0YWJsZSgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBTaGFwZS5yZWN0YW5nbGUoIHRoaXMuX3JlY3RYLCB0aGlzLl9yZWN0WSwgdGhpcy5fcmVjdFdpZHRoLCB0aGlzLl9yZWN0SGVpZ2h0ICkubWFrZUltbXV0YWJsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RpZmllcyB0aGF0IHRoZSByZWN0YW5nbGUgaGFzIGNoYW5nZWQsIGFuZCBpbnZhbGlkYXRlcyBwYXRoIGluZm9ybWF0aW9uIGFuZCBvdXIgY2FjaGVkIHNoYXBlLlxuICAgKi9cbiAgcHJvdGVjdGVkIGludmFsaWRhdGVSZWN0YW5nbGUoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMuX3JlY3RYICksIGBBIHJlY3RhbmdsZSBuZWVkcyB0byBoYXZlIGEgZmluaXRlIHggKCR7dGhpcy5fcmVjdFh9KWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5fcmVjdFkgKSwgYEEgcmVjdGFuZ2xlIG5lZWRzIHRvIGhhdmUgYSBmaW5pdGUgeSAoJHt0aGlzLl9yZWN0WX0pYCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3JlY3RXaWR0aCA+PSAwICYmIGlzRmluaXRlKCB0aGlzLl9yZWN0V2lkdGggKSxcbiAgICAgIGBBIHJlY3RhbmdsZSBuZWVkcyB0byBoYXZlIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSB3aWR0aCAoJHt0aGlzLl9yZWN0V2lkdGh9KWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9yZWN0SGVpZ2h0ID49IDAgJiYgaXNGaW5pdGUoIHRoaXMuX3JlY3RIZWlnaHQgKSxcbiAgICAgIGBBIHJlY3RhbmdsZSBuZWVkcyB0byBoYXZlIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBoZWlnaHQgKCR7dGhpcy5fcmVjdEhlaWdodH0pYCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2Nvcm5lclhSYWRpdXMgPj0gMCAmJiBpc0Zpbml0ZSggdGhpcy5fY29ybmVyWFJhZGl1cyApLFxuICAgICAgYEEgcmVjdGFuZ2xlIG5lZWRzIHRvIGhhdmUgYSBub24tbmVnYXRpdmUgZmluaXRlIGFyY1dpZHRoICgke3RoaXMuX2Nvcm5lclhSYWRpdXN9KWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jb3JuZXJZUmFkaXVzID49IDAgJiYgaXNGaW5pdGUoIHRoaXMuX2Nvcm5lcllSYWRpdXMgKSxcbiAgICAgIGBBIHJlY3RhbmdsZSBuZWVkcyB0byBoYXZlIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBhcmNIZWlnaHQgKCR7dGhpcy5fY29ybmVyWVJhZGl1c30pYCApO1xuXG4gICAgLy8gc2V0cyBvdXIgJ2NhY2hlJyB0byBudWxsLCBzbyB3ZSBkb24ndCBhbHdheXMgaGF2ZSB0byByZWNvbXB1dGUgb3VyIHNoYXBlXG4gICAgdGhpcy5fc2hhcGUgPSBudWxsO1xuXG4gICAgLy8gc2hvdWxkIGludmFsaWRhdGUgdGhlIHBhdGggYW5kIGVuc3VyZSBhIHJlZHJhd1xuICAgIHRoaXMuaW52YWxpZGF0ZVBhdGgoKTtcblxuICAgIC8vIHNpbmNlIHdlIGNoYW5nZWQgdGhlIHJlY3RhbmdsZSBhcmMgd2lkdGgvaGVpZ2h0LCBpdCBjb3VsZCBtYWtlIERPTSB3b3JrIG9yIG5vdFxuICAgIHRoaXMuaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVQcmVmZXJyZWRTaXplcygpOiB2b2lkIHtcbiAgICBsZXQgd2lkdGggPSB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGg7XG4gICAgbGV0IGhlaWdodCA9IHRoaXMubG9jYWxQcmVmZXJyZWRIZWlnaHQ7XG5cbiAgICBpZiAoIHdpZHRoICE9PSBudWxsICkge1xuICAgICAgd2lkdGggPSBNYXRoLm1heCggd2lkdGgsIHRoaXMubG9jYWxNaW5pbXVtV2lkdGggfHwgMCApO1xuICAgIH1cblxuICAgIGlmICggaGVpZ2h0ICE9PSBudWxsICkge1xuICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoIGhlaWdodCwgdGhpcy5sb2NhbE1pbmltdW1IZWlnaHQgfHwgMCApO1xuICAgIH1cblxuICAgIGlmICggd2lkdGggIT09IG51bGwgKSB7XG4gICAgICB0aGlzLnJlY3RXaWR0aCA9IHRoaXMuaGFzU3Ryb2tlKCkgPyB3aWR0aCAtIHRoaXMubGluZVdpZHRoIDogd2lkdGg7XG4gICAgfVxuICAgIGlmICggaGVpZ2h0ICE9PSBudWxsICkge1xuICAgICAgdGhpcy5yZWN0SGVpZ2h0ID0gdGhpcy5oYXNTdHJva2UoKSA/IGhlaWdodCAtIHRoaXMubGluZVdpZHRoIDogaGVpZ2h0O1xuICAgIH1cbiAgfVxuXG4gIC8vIFdlIG5lZWQgdG8gZGV0ZWN0IHN0cm9rZSBjaGFuZ2VzLCBzaW5jZSBvdXIgcHJlZmVycmVkIHNpemUgY29tcHV0YXRpb25zIGRlcGVuZCBvbiBpdC5cbiAgcHVibGljIG92ZXJyaWRlIGludmFsaWRhdGVTdHJva2UoKTogdm9pZCB7XG4gICAgc3VwZXIuaW52YWxpZGF0ZVN0cm9rZSgpO1xuXG4gICAgdGhpcy51cGRhdGVQcmVmZXJyZWRTaXplcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHBvaW50IGlzIFwiaW5zaWRlXCIgKGNvbnRhaW5lZCkgaW4gdGhpcyBSZWN0YW5nbGUncyBzZWxmIGNvbnRlbnQsIG9yIFwib3V0c2lkZVwiLlxuICAgKlxuICAgKiBIYW5kbGVzIGF4aXMtYWxpZ25lZCBvcHRpb25hbGx5LXJvdW5kZWQgcmVjdGFuZ2xlcywgYWx0aG91Z2ggY2FuIG9ubHkgZG8gb3B0aW1pemVkIGNvbXB1dGF0aW9uIGlmIGl0IGlzbid0XG4gICAqIHJvdW5kZWQuIElmIGl0IElTIHJvdW5kZWQsIHdlIGNoZWNrIGlmIGEgY29ybmVyIGNvbXB1dGF0aW9uIGlzIG5lZWRlZCAodXN1YWxseSBpc24ndCksIGFuZCBvbmx5IG5lZWQgdG8gY2hlY2tcbiAgICogb25lIGNvcm5lciBmb3IgdGhhdCB0ZXN0LlxuICAgKlxuICAgKiBAcGFyYW0gcG9pbnQgLSBDb25zaWRlcmVkIHRvIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY29udGFpbnNQb2ludFNlbGYoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHggPSB0aGlzLl9yZWN0WDtcbiAgICBjb25zdCB5ID0gdGhpcy5fcmVjdFk7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLl9yZWN0V2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5fcmVjdEhlaWdodDtcbiAgICBjb25zdCBhcmNXaWR0aCA9IHRoaXMuX2Nvcm5lclhSYWRpdXM7XG4gICAgY29uc3QgYXJjSGVpZ2h0ID0gdGhpcy5fY29ybmVyWVJhZGl1cztcbiAgICBjb25zdCBoYWxmTGluZSA9IHRoaXMuZ2V0TGluZVdpZHRoKCkgLyAyO1xuXG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XG4gICAgaWYgKCB0aGlzLl9zdHJva2VQaWNrYWJsZSApIHtcbiAgICAgIC8vIHRlc3QgdGhlIG91dGVyIGJvdW5kYXJ5IGlmIHdlIGFyZSBzdHJva2UtcGlja2FibGUgKGlmIGFsc28gZmlsbC1waWNrYWJsZSwgdGhpcyBpcyB0aGUgb25seSB0ZXN0IHdlIG5lZWQpXG4gICAgICBjb25zdCByb3VuZGVkID0gdGhpcy5pc1JvdW5kZWQoKTtcbiAgICAgIGlmICggIXJvdW5kZWQgJiYgdGhpcy5nZXRMaW5lSm9pbigpID09PSAnYmV2ZWwnICkge1xuICAgICAgICAvLyBmYWxsLWJhY2sgZm9yIGJldmVsXG4gICAgICAgIHJldHVybiBzdXBlci5jb250YWluc1BvaW50U2VsZiggcG9pbnQgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1pdGVyID0gdGhpcy5nZXRMaW5lSm9pbigpID09PSAnbWl0ZXInICYmICFyb3VuZGVkO1xuICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIFJlY3RhbmdsZS5pbnRlcnNlY3RzKCB4IC0gaGFsZkxpbmUsIHkgLSBoYWxmTGluZSxcbiAgICAgICAgd2lkdGggKyAyICogaGFsZkxpbmUsIGhlaWdodCArIDIgKiBoYWxmTGluZSxcbiAgICAgICAgbWl0ZXIgPyAwIDogKCBhcmNXaWR0aCArIGhhbGZMaW5lICksIG1pdGVyID8gMCA6ICggYXJjSGVpZ2h0ICsgaGFsZkxpbmUgKSxcbiAgICAgICAgcG9pbnQgKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuX2ZpbGxQaWNrYWJsZSApIHtcbiAgICAgIGlmICggdGhpcy5fc3Ryb2tlUGlja2FibGUgKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5pbnRlcnNlY3RzKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBhcmNXaWR0aCwgYXJjSGVpZ2h0LCBwb2ludCApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fc3Ryb2tlUGlja2FibGUgKSB7XG4gICAgICByZXR1cm4gcmVzdWx0ICYmICFSZWN0YW5nbGUuaW50ZXJzZWN0cyggeCArIGhhbGZMaW5lLCB5ICsgaGFsZkxpbmUsXG4gICAgICAgIHdpZHRoIC0gMiAqIGhhbGZMaW5lLCBoZWlnaHQgLSAyICogaGFsZkxpbmUsXG4gICAgICAgIGFyY1dpZHRoIC0gaGFsZkxpbmUsIGFyY0hlaWdodCAtIGhhbGZMaW5lLFxuICAgICAgICBwb2ludCApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTsgLy8gZWl0aGVyIGZpbGwgbm9yIHN0cm9rZSBpcyBwaWNrYWJsZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBSZWN0YW5nbGUncyBzZWxmQm91bmRzIGlzIGludGVyc2VjdGVkIGJ5IHRoZSBzcGVjaWZpZWQgYm91bmRzLlxuICAgKlxuICAgKiBAcGFyYW0gYm91bmRzIC0gQm91bmRzIHRvIHRlc3QsIGFzc3VtZWQgdG8gYmUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgaW50ZXJzZWN0c0JvdW5kc1NlbGYoIGJvdW5kczogQm91bmRzMiApOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuY29tcHV0ZVNoYXBlQm91bmRzKCkuaW50ZXJzZWN0aW9uKCBib3VuZHMgKS5pc0VtcHR5KCk7XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgdGhlIGN1cnJlbnQgTm9kZSdzIHNlbGYgcmVwcmVzZW50YXRpb24sIGFzc3VtaW5nIHRoZSB3cmFwcGVyJ3MgQ2FudmFzIGNvbnRleHQgaXMgYWxyZWFkeSBpbiB0aGUgbG9jYWxcbiAgICogY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGlzIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB3cmFwcGVyXG4gICAqIEBwYXJhbSBtYXRyaXggLSBUaGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGFscmVhZHkgYXBwbGllZCB0byB0aGUgY29udGV4dC5cbiAgICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSBjYW52YXNQYWludFNlbGYoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyLCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XG4gICAgLy9UT0RPOiBIYXZlIGEgc2VwYXJhdGUgbWV0aG9kIGZvciB0aGlzLCBpbnN0ZWFkIG9mIHRvdWNoaW5nIHRoZSBwcm90b3R5cGUuIENhbiBtYWtlICd0aGlzJyByZWZlcmVuY2VzIHRvbyBlYXNpbHkuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgUmVjdGFuZ2xlQ2FudmFzRHJhd2FibGUucHJvdG90eXBlLnBhaW50Q2FudmFzKCB3cmFwcGVyLCB0aGlzLCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgRE9NIGRyYXdhYmxlIGZvciB0aGlzIFJlY3RhbmdsZS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVET01EcmF3YWJsZSggcmVuZGVyZXI6IG51bWJlciwgaW5zdGFuY2U6IEluc3RhbmNlICk6IERPTVNlbGZEcmF3YWJsZSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIHJldHVybiBSZWN0YW5nbGVET01EcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIFNWRyBkcmF3YWJsZSBmb3IgdGhpcyBSZWN0YW5nbGUuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlU1ZHRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBTVkdTZWxmRHJhd2FibGUge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICByZXR1cm4gUmVjdGFuZ2xlU1ZHRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBDYW52YXMgZHJhd2FibGUgZm9yIHRoaXMgUmVjdGFuZ2xlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZUNhbnZhc0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogQ2FudmFzU2VsZkRyYXdhYmxlIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgcmV0dXJuIFJlY3RhbmdsZUNhbnZhc0RyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgV2ViR0wgZHJhd2FibGUgZm9yIHRoaXMgUmVjdGFuZ2xlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVdlYkdMRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBXZWJHTFNlbGZEcmF3YWJsZSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIHJldHVybiBSZWN0YW5nbGVXZWJHTERyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBNaXNjZWxsYW5lb3VzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEl0IGlzIGltcG9zc2libGUgdG8gc2V0IGFub3RoZXIgc2hhcGUgb24gdGhpcyBQYXRoIHN1YnR5cGUsIGFzIGl0cyBlZmZlY3RpdmUgc2hhcGUgaXMgZGV0ZXJtaW5lZCBieSBvdGhlclxuICAgKiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gc2hhcGUgLSBUaHJvd3MgYW4gZXJyb3IgaWYgaXQgaXMgbm90IG51bGwuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgc2V0U2hhcGUoIHNoYXBlOiBTaGFwZSB8IHN0cmluZyB8IG51bGwgKTogdGhpcyB7XG4gICAgaWYgKCBzaGFwZSAhPT0gbnVsbCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBzZXQgdGhlIHNoYXBlIG9mIGEgUmVjdGFuZ2xlIHRvIHNvbWV0aGluZyBub24tbnVsbCcgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBwcm9iYWJseSBjYWxsZWQgZnJvbSB0aGUgUGF0aCBjb25zdHJ1Y3RvclxuICAgICAgdGhpcy5pbnZhbGlkYXRlUGF0aCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGltbXV0YWJsZSBjb3B5IG9mIHRoaXMgUGF0aCBzdWJ0eXBlJ3MgcmVwcmVzZW50YXRpb24uXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgaXMgY3JlYXRlZCBsYXppbHksIHNvIGRvbid0IGNhbGwgaXQgaWYgeW91IGRvbid0IGhhdmUgdG8hXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0U2hhcGUoKTogU2hhcGUge1xuICAgIGlmICggIXRoaXMuX3NoYXBlICkge1xuICAgICAgdGhpcy5fc2hhcGUgPSB0aGlzLmNyZWF0ZVJlY3RhbmdsZVNoYXBlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zaGFwZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBQYXRoIGhhcyBhbiBhc3NvY2lhdGVkIFNoYXBlIChpbnN0ZWFkIG9mIG5vIHNoYXBlLCByZXByZXNlbnRlZCBieSBudWxsKVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGhhc1NoYXBlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIHNldFNoYXBlUHJvcGVydHkoIG5ld1RhcmdldDogVFJlYWRPbmx5UHJvcGVydHk8U2hhcGUgfCBzdHJpbmcgfCBudWxsPiB8IG51bGwgKTogdGhpcyB7XG4gICAgaWYgKCBuZXdUYXJnZXQgIT09IG51bGwgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdDYW5ub3Qgc2V0IHRoZSBzaGFwZVByb3BlcnR5IG9mIGEgUmVjdGFuZ2xlIHRvIHNvbWV0aGluZyBub24tbnVsbCwgaXQgaGFuZGxlcyB0aGlzIGl0c2VsZicgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGJvdGggb2YgdGhlIGNvcm5lciByYWRpaSB0byB0aGUgc2FtZSB2YWx1ZSwgc28gdGhhdCB0aGUgcm91bmRlZCBjb3JuZXJzIHdpbGwgYmUgY2lyY3VsYXIgYXJjcy5cbiAgICovXG4gIHB1YmxpYyBzZXRDb3JuZXJSYWRpdXMoIGNvcm5lclJhZGl1czogbnVtYmVyICk6IHRoaXMge1xuICAgIHRoaXMuc2V0Q29ybmVyWFJhZGl1cyggY29ybmVyUmFkaXVzICk7XG4gICAgdGhpcy5zZXRDb3JuZXJZUmFkaXVzKCBjb3JuZXJSYWRpdXMgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgY29ybmVyUmFkaXVzKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldENvcm5lclJhZGl1cyggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgY29ybmVyUmFkaXVzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldENvcm5lclJhZGl1cygpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvcm5lciByYWRpdXMgaWYgYm90aCB0aGUgaG9yaXpvbnRhbCBhbmQgdmVydGljYWwgY29ybmVyIHJhZGlpIGFyZSB0aGUgc2FtZS5cbiAgICpcbiAgICogTk9URTogSWYgdGhlcmUgYXJlIGRpZmZlcmVudCBob3Jpem9udGFsIGFuZCB2ZXJ0aWNhbCBjb3JuZXIgcmFkaWksIHRoaXMgd2lsbCBmYWlsIGFuIGFzc2VydGlvbiBhbmQgcmV0dXJuIHRoZSBob3Jpem9udGFsIHJhZGl1cy5cbiAgICovXG4gIHB1YmxpYyBnZXRDb3JuZXJSYWRpdXMoKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jb3JuZXJYUmFkaXVzID09PSB0aGlzLl9jb3JuZXJZUmFkaXVzLFxuICAgICAgJ2dldENvcm5lclJhZGl1cygpIGludmFsaWQgaWYgeC95IHJhZGlpIGFyZSBkaWZmZXJlbnQnICk7XG5cbiAgICByZXR1cm4gdGhpcy5fY29ybmVyWFJhZGl1cztcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBtdXRhdGUoIG9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICk6IHRoaXMge1xuICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYSBwb2ludCBpcyB3aXRoaW4gYSByb3VuZGVkIHJlY3RhbmdsZS5cbiAgICpcbiAgICogQHBhcmFtIHggLSBYIHZhbHVlIG9mIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHJlY3RhbmdsZVxuICAgKiBAcGFyYW0geSAtIFkgdmFsdWUgb2YgdGhlIHRvcCBzaWRlIG9mIHRoZSByZWN0YW5nbGVcbiAgICogQHBhcmFtIHdpZHRoIC0gV2lkdGggb2YgdGhlIHJlY3RhbmdsZVxuICAgKiBAcGFyYW0gaGVpZ2h0IC0gSGVpZ2h0IG9mIHRoZSByZWN0YW5nbGVcbiAgICogQHBhcmFtIGFyY1dpZHRoIC0gSG9yaXpvbnRhbCBjb3JuZXIgcmFkaXVzIG9mIHRoZSByZWN0YW5nbGVcbiAgICogQHBhcmFtIGFyY0hlaWdodCAtIFZlcnRpY2FsIGNvcm5lciByYWRpdXMgb2YgdGhlIHJlY3RhbmdsZVxuICAgKiBAcGFyYW0gcG9pbnQgLSBUaGUgcG9pbnQgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBpbiB0aGUgcm91bmRlZCByZWN0YW5nbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaW50ZXJzZWN0cyggeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBhcmNXaWR0aDogbnVtYmVyLCBhcmNIZWlnaHQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcmVzdWx0ID0gcG9pbnQueCA+PSB4ICYmXG4gICAgICAgICAgICAgICAgICAgcG9pbnQueCA8PSB4ICsgd2lkdGggJiZcbiAgICAgICAgICAgICAgICAgICBwb2ludC55ID49IHkgJiZcbiAgICAgICAgICAgICAgICAgICBwb2ludC55IDw9IHkgKyBoZWlnaHQ7XG5cbiAgICBpZiAoICFyZXN1bHQgfHwgYXJjV2lkdGggPD0gMCB8fCBhcmNIZWlnaHQgPD0gMCApIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gY29weSBib3JkZXItcmFkaXVzIENTUyBiZWhhdmlvciBpbiBDaHJvbWUsIHdoZXJlIHRoZSBhcmNzIHdvbid0IGludGVyc2VjdCwgaW4gY2FzZXMgd2hlcmUgdGhlIGFyYyBzZWdtZW50cyBhdCBmdWxsIHNpemUgd291bGQgaW50ZXJzZWN0IGVhY2ggb3RoZXJcbiAgICBjb25zdCBtYXhpbXVtQXJjU2l6ZSA9IE1hdGgubWluKCB3aWR0aCAvIDIsIGhlaWdodCAvIDIgKTtcbiAgICBhcmNXaWR0aCA9IE1hdGgubWluKCBtYXhpbXVtQXJjU2l6ZSwgYXJjV2lkdGggKTtcbiAgICBhcmNIZWlnaHQgPSBNYXRoLm1pbiggbWF4aW11bUFyY1NpemUsIGFyY0hlaWdodCApO1xuXG4gICAgLy8gd2UgYXJlIHJvdW5kZWQgYW5kIGluc2lkZSB0aGUgbG9naWNhbCByZWN0YW5nbGUgKGlmIGl0IGRpZG4ndCBoYXZlIHJvdW5kZWQgY29ybmVycylcblxuICAgIC8vIGNsb3Nlc3QgY29ybmVyIGFyYydzIGNlbnRlciAod2UgYXNzdW1lIHRoZSByb3VuZGVkIHJlY3RhbmdsZSdzIGFyY3MgYXJlIDkwIGRlZ3JlZXMgZnVsbHksIGFuZCBkb24ndCBpbnRlcnNlY3QpXG4gICAgbGV0IGNsb3Nlc3RDb3JuZXJYO1xuICAgIGxldCBjbG9zZXN0Q29ybmVyWTtcbiAgICBsZXQgZ3VhcmFudGVlZEluc2lkZSA9IGZhbHNlO1xuXG4gICAgLy8gaWYgd2UgYXJlIHRvIHRoZSBpbnNpZGUgb2YgdGhlIGNsb3Nlc3QgY29ybmVyIGFyYydzIGNlbnRlciwgd2UgYXJlIGd1YXJhbnRlZWQgdG8gYmUgaW4gdGhlIHJvdW5kZWQgcmVjdGFuZ2xlIChndWFyYW50ZWVkSW5zaWRlKVxuICAgIGlmICggcG9pbnQueCA8IHggKyB3aWR0aCAvIDIgKSB7XG4gICAgICBjbG9zZXN0Q29ybmVyWCA9IHggKyBhcmNXaWR0aDtcbiAgICAgIGd1YXJhbnRlZWRJbnNpZGUgPSBndWFyYW50ZWVkSW5zaWRlIHx8IHBvaW50LnggPj0gY2xvc2VzdENvcm5lclg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY2xvc2VzdENvcm5lclggPSB4ICsgd2lkdGggLSBhcmNXaWR0aDtcbiAgICAgIGd1YXJhbnRlZWRJbnNpZGUgPSBndWFyYW50ZWVkSW5zaWRlIHx8IHBvaW50LnggPD0gY2xvc2VzdENvcm5lclg7XG4gICAgfVxuICAgIGlmICggZ3VhcmFudGVlZEluc2lkZSApIHsgcmV0dXJuIHRydWU7IH1cblxuICAgIGlmICggcG9pbnQueSA8IHkgKyBoZWlnaHQgLyAyICkge1xuICAgICAgY2xvc2VzdENvcm5lclkgPSB5ICsgYXJjSGVpZ2h0O1xuICAgICAgZ3VhcmFudGVlZEluc2lkZSA9IGd1YXJhbnRlZWRJbnNpZGUgfHwgcG9pbnQueSA+PSBjbG9zZXN0Q29ybmVyWTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjbG9zZXN0Q29ybmVyWSA9IHkgKyBoZWlnaHQgLSBhcmNIZWlnaHQ7XG4gICAgICBndWFyYW50ZWVkSW5zaWRlID0gZ3VhcmFudGVlZEluc2lkZSB8fCBwb2ludC55IDw9IGNsb3Nlc3RDb3JuZXJZO1xuICAgIH1cbiAgICBpZiAoIGd1YXJhbnRlZWRJbnNpZGUgKSB7IHJldHVybiB0cnVlOyB9XG5cbiAgICAvLyB3ZSBhcmUgbm93IGluIHRoZSByZWN0YW5ndWxhciByZWdpb24gYmV0d2VlbiB0aGUgbG9naWNhbCBjb3JuZXIgYW5kIHRoZSBjZW50ZXIgb2YgdGhlIGNsb3Nlc3QgY29ybmVyJ3MgYXJjLlxuXG4gICAgLy8gb2Zmc2V0IGZyb20gdGhlIGNsb3Nlc3QgY29ybmVyJ3MgYXJjIGNlbnRlclxuICAgIGxldCBvZmZzZXRYID0gcG9pbnQueCAtIGNsb3Nlc3RDb3JuZXJYO1xuICAgIGxldCBvZmZzZXRZID0gcG9pbnQueSAtIGNsb3Nlc3RDb3JuZXJZO1xuXG4gICAgLy8gbm9ybWFsaXplIHRoZSBjb29yZGluYXRlcyBzbyBub3cgd2UgYXJlIGRlYWxpbmcgd2l0aCBhIHVuaXQgY2lyY2xlXG4gICAgLy8gKHRlY2huaWNhbGx5IGFyYywgYnV0IHdlIGFyZSBndWFyYW50ZWVkIHRvIGJlIGluIHRoZSBhcmVhIGNvdmVyZWQgYnkgdGhlIGFyYywgc28gd2UganVzdCBjb25zaWRlciB0aGUgY2lyY2xlKVxuICAgIC8vIE5PVEU6IHdlIGFyZSByb3VuZGVkLCBzbyBib3RoIGFyY1dpZHRoIGFuZCBhcmNIZWlnaHQgYXJlIG5vbi16ZXJvICh0aGlzIGlzIHdlbGwgZGVmaW5lZClcbiAgICBvZmZzZXRYIC89IGFyY1dpZHRoO1xuICAgIG9mZnNldFkgLz0gYXJjSGVpZ2h0O1xuXG4gICAgb2Zmc2V0WCAqPSBvZmZzZXRYO1xuICAgIG9mZnNldFkgKj0gb2Zmc2V0WTtcbiAgICByZXR1cm4gb2Zmc2V0WCArIG9mZnNldFkgPD0gMTsgLy8gcmV0dXJuIHdoZXRoZXIgd2UgYXJlIGluIHRoZSByb3VuZGVkIGNvcm5lci4gc2VlIHRoZSBmb3JtdWxhIGZvciBhbiBlbGxpcHNlXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHJlY3RhbmdsZSB3aXRoIHRoZSBzcGVjaWZpZWQgeC95L3dpZHRoL2hlaWdodC5cbiAgICpcbiAgICogU2VlIFJlY3RhbmdsZSdzIGNvbnN0cnVjdG9yIGZvciBkZXRhaWxlZCBwYXJhbWV0ZXIgaW5mb3JtYXRpb24uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlY3QoIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgb3B0aW9ucz86IFJlY3RhbmdsZU9wdGlvbnMgKTogUmVjdGFuZ2xlIHtcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSggeCwgeSwgd2lkdGgsIGhlaWdodCwgMCwgMCwgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSByb3VuZGVkIHJlY3RhbmdsZSB3aXRoIHRoZSBzcGVjaWZpZWQgeC95L3dpZHRoL2hlaWdodC9jb3JuZXJYUmFkaXVzL2Nvcm5lcllSYWRpdXMuXG4gICAqXG4gICAqIFNlZSBSZWN0YW5nbGUncyBjb25zdHJ1Y3RvciBmb3IgZGV0YWlsZWQgcGFyYW1ldGVyIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3VuZGVkUmVjdCggeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjb3JuZXJYUmFkaXVzOiBudW1iZXIsIGNvcm5lcllSYWRpdXM6IG51bWJlciwgb3B0aW9ucz86IFJlY3RhbmdsZU9wdGlvbnMgKTogUmVjdGFuZ2xlIHtcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSggeCwgeSwgd2lkdGgsIGhlaWdodCwgY29ybmVyWFJhZGl1cywgY29ybmVyWVJhZGl1cywgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSByZWN0YW5nbGUgeC95L3dpZHRoL2hlaWdodCBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIGJvdW5kcy5cbiAgICpcbiAgICogU2VlIFJlY3RhbmdsZSdzIGNvbnN0cnVjdG9yIGZvciBkZXRhaWxlZCBwYXJhbWV0ZXIgaW5mb3JtYXRpb24uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGJvdW5kcyggYm91bmRzOiBCb3VuZHMyLCBvcHRpb25zPzogUmVjdGFuZ2xlT3B0aW9ucyApOiBSZWN0YW5nbGUge1xuICAgIHJldHVybiBuZXcgUmVjdGFuZ2xlKCBib3VuZHMubWluWCwgYm91bmRzLm1pblksIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSByb3VuZGVkIHJlY3RhbmdsZSB4L3kvd2lkdGgvaGVpZ2h0IG1hdGNoaW5nIHRoZSBzcGVjaWZpZWQgYm91bmRzIChSZWN0YW5nbGUuYm91bmRzLCBidXQgd2l0aCBhZGRpdGlvbmFsXG4gICAqIGNvcm5lclhSYWRpdXMgYW5kIGNvcm5lcllSYWRpdXMpLlxuICAgKlxuICAgKiBTZWUgUmVjdGFuZ2xlJ3MgY29uc3RydWN0b3IgZm9yIGRldGFpbGVkIHBhcmFtZXRlciBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm91bmRlZEJvdW5kcyggYm91bmRzOiBCb3VuZHMyLCBjb3JuZXJYUmFkaXVzOiBudW1iZXIsIGNvcm5lcllSYWRpdXM6IG51bWJlciwgb3B0aW9ucz86IFJlY3RhbmdsZU9wdGlvbnMgKTogUmVjdGFuZ2xlIHtcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSggYm91bmRzLm1pblgsIGJvdW5kcy5taW5ZLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXMsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcmVjdGFuZ2xlIHdpdGggdG9wL2xlZnQgb2YgKDAsMCkgd2l0aCB0aGUgc3BlY2lmaWVkIHtEaW1lbnNpb24yfSdzIHdpZHRoIGFuZCBoZWlnaHQuXG4gICAqXG4gICAqIFNlZSBSZWN0YW5nbGUncyBjb25zdHJ1Y3RvciBmb3IgZGV0YWlsZWQgcGFyYW1ldGVyIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBkaW1lbnNpb24oIGRpbWVuc2lvbjogRGltZW5zaW9uMiwgb3B0aW9ucz86IFJlY3RhbmdsZU9wdGlvbnMgKTogUmVjdGFuZ2xlIHtcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSggMCwgMCwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0LCAwLCAwLCBvcHRpb25zICk7XG4gIH1cbn1cblxuLyoqXG4gKiB7QXJyYXkuPHN0cmluZz59IC0gU3RyaW5nIGtleXMgZm9yIGFsbCB0aGUgYWxsb3dlZCBvcHRpb25zIHRoYXQgd2lsbCBiZSBzZXQgYnkgbm9kZS5tdXRhdGUoIG9wdGlvbnMgKSwgaW4gdGhlXG4gKiBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkIGluLlxuICpcbiAqIE5PVEU6IFNlZSBOb2RlJ3MgX211dGF0b3JLZXlzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgb3BlcmF0ZXMsIGFuZCBwb3RlbnRpYWwgc3BlY2lhbFxuICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXG4gKi9cblJlY3RhbmdsZS5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gWyAuLi5SRUNUQU5HTEVfT1BUSU9OX0tFWVMsIC4uLlN1cGVyVHlwZS5wcm90b3R5cGUuX211dGF0b3JLZXlzIF07XG5cbi8qKlxuICoge0FycmF5LjxTdHJpbmc+fSAtIExpc3Qgb2YgYWxsIGRpcnR5IGZsYWdzIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSBvbiBkcmF3YWJsZXMgY3JlYXRlZCBmcm9tIHRoaXMgbm9kZSAob3JcbiAqICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlKS4gR2l2ZW4gYSBmbGFnIChlLmcuIHJhZGl1cyksIGl0IGluZGljYXRlcyB0aGUgZXhpc3RlbmNlIG9mIGEgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICBkcmF3YWJsZS5tYXJrRGlydHlSYWRpdXMoKSB0aGF0IHdpbGwgaW5kaWNhdGUgdG8gdGhlIGRyYXdhYmxlIHRoYXQgdGhlIHJhZGl1cyBoYXMgY2hhbmdlZC5cbiAqIChzY2VuZXJ5LWludGVybmFsKVxuICogQG92ZXJyaWRlXG4gKi9cblJlY3RhbmdsZS5wcm90b3R5cGUuZHJhd2FibGVNYXJrRmxhZ3MgPSBQYXRoLnByb3RvdHlwZS5kcmF3YWJsZU1hcmtGbGFncy5jb25jYXQoIFsgJ3gnLCAneScsICd3aWR0aCcsICdoZWlnaHQnLCAnY29ybmVyWFJhZGl1cycsICdjb3JuZXJZUmFkaXVzJyBdICkuZmlsdGVyKCBmbGFnID0+IGZsYWcgIT09ICdzaGFwZScgKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ1JlY3RhbmdsZScsIFJlY3RhbmdsZSApOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlNoYXBlIiwiY29tYmluZU9wdGlvbnMiLCJGZWF0dXJlcyIsIkdyYWRpZW50IiwiUGF0aCIsIlBhdHRlcm4iLCJSZWN0YW5nbGVDYW52YXNEcmF3YWJsZSIsIlJlY3RhbmdsZURPTURyYXdhYmxlIiwiUmVjdGFuZ2xlU1ZHRHJhd2FibGUiLCJSZWN0YW5nbGVXZWJHTERyYXdhYmxlIiwiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiU2l6YWJsZSIsIlJFQ1RBTkdMRV9PUFRJT05fS0VZUyIsIlN1cGVyVHlwZSIsIlJlY3RhbmdsZSIsImdldE1heGltdW1BcmNTaXplIiwiTWF0aCIsIm1pbiIsIl9yZWN0V2lkdGgiLCJfcmVjdEhlaWdodCIsImdldFN0cm9rZVJlbmRlcmVyQml0bWFzayIsImJpdG1hc2siLCJzdHJva2UiLCJnZXRTdHJva2UiLCJoYXNMaW5lRGFzaCIsImdldExpbmVKb2luIiwiYm9yZGVyUmFkaXVzIiwiYml0bWFza0RPTSIsImhhc1N0cm9rZSIsImJpdG1hc2tXZWJHTCIsImdldFBhdGhSZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrQ2FudmFzIiwiYml0bWFza1NWRyIsIm1heGltdW1BcmNTaXplIiwiZ2V0TGluZVdpZHRoIiwiaXNSb3VuZGVkIiwiX2Nvcm5lclhSYWRpdXMiLCJfY29ybmVyWVJhZGl1cyIsInNldFJlY3QiLCJ4IiwieSIsIndpZHRoIiwiaGVpZ2h0IiwiY29ybmVyWFJhZGl1cyIsImNvcm5lcllSYWRpdXMiLCJoYXNYUmFkaXVzIiwidW5kZWZpbmVkIiwiaGFzWVJhZGl1cyIsImFzc2VydCIsImlzRmluaXRlIiwiX3JlY3RYIiwiX3JlY3RZIiwic3RhdGVMZW4iLCJfZHJhd2FibGVzIiwibGVuZ3RoIiwiaSIsIm1hcmtEaXJ0eVJlY3RhbmdsZSIsImludmFsaWRhdGVSZWN0YW5nbGUiLCJzZXRSZWN0WCIsIm1hcmtEaXJ0eVgiLCJyZWN0WCIsInZhbHVlIiwiZ2V0UmVjdFgiLCJzZXRSZWN0WSIsIm1hcmtEaXJ0eVkiLCJyZWN0WSIsImdldFJlY3RZIiwic2V0UmVjdFdpZHRoIiwibWFya0RpcnR5V2lkdGgiLCJyZWN0V2lkdGgiLCJnZXRSZWN0V2lkdGgiLCJzZXRSZWN0SGVpZ2h0IiwibWFya0RpcnR5SGVpZ2h0IiwicmVjdEhlaWdodCIsImdldFJlY3RIZWlnaHQiLCJzZXRDb3JuZXJYUmFkaXVzIiwicmFkaXVzIiwibWFya0RpcnR5Q29ybmVyWFJhZGl1cyIsImdldENvcm5lclhSYWRpdXMiLCJzZXRDb3JuZXJZUmFkaXVzIiwibWFya0RpcnR5Q29ybmVyWVJhZGl1cyIsImdldENvcm5lcllSYWRpdXMiLCJzZXRSZWN0Qm91bmRzIiwiYm91bmRzIiwicmVjdEJvdW5kcyIsImdldFJlY3RCb3VuZHMiLCJyZWN0Iiwic2V0UmVjdFNpemUiLCJzaXplIiwicmVjdFNpemUiLCJnZXRSZWN0U2l6ZSIsInNldFJlY3RXaWR0aEZyb21SaWdodCIsInJpZ2h0IiwicmVjdFdpZHRoRnJvbVJpZ2h0Iiwic2V0UmVjdEhlaWdodEZyb21Cb3R0b20iLCJib3R0b20iLCJyZWN0SGVpZ2h0RnJvbUJvdHRvbSIsImNvbXB1dGVTaGFwZUJvdW5kcyIsIl9zdHJva2UiLCJkaWxhdGVkIiwiY3JlYXRlUmVjdGFuZ2xlU2hhcGUiLCJyb3VuZFJlY3RhbmdsZSIsIm1ha2VJbW11dGFibGUiLCJyZWN0YW5nbGUiLCJfc2hhcGUiLCJpbnZhbGlkYXRlUGF0aCIsImludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMiLCJ1cGRhdGVQcmVmZXJyZWRTaXplcyIsImxvY2FsUHJlZmVycmVkV2lkdGgiLCJsb2NhbFByZWZlcnJlZEhlaWdodCIsIm1heCIsImxvY2FsTWluaW11bVdpZHRoIiwibG9jYWxNaW5pbXVtSGVpZ2h0IiwibGluZVdpZHRoIiwiaW52YWxpZGF0ZVN0cm9rZSIsImNvbnRhaW5zUG9pbnRTZWxmIiwicG9pbnQiLCJhcmNXaWR0aCIsImFyY0hlaWdodCIsImhhbGZMaW5lIiwicmVzdWx0IiwiX3N0cm9rZVBpY2thYmxlIiwicm91bmRlZCIsIm1pdGVyIiwiaW50ZXJzZWN0cyIsIl9maWxsUGlja2FibGUiLCJpbnRlcnNlY3RzQm91bmRzU2VsZiIsImludGVyc2VjdGlvbiIsImlzRW1wdHkiLCJjYW52YXNQYWludFNlbGYiLCJ3cmFwcGVyIiwibWF0cml4IiwicHJvdG90eXBlIiwicGFpbnRDYW52YXMiLCJjcmVhdGVET01EcmF3YWJsZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJjcmVhdGVGcm9tUG9vbCIsImNyZWF0ZVNWR0RyYXdhYmxlIiwiY3JlYXRlQ2FudmFzRHJhd2FibGUiLCJjcmVhdGVXZWJHTERyYXdhYmxlIiwic2V0U2hhcGUiLCJzaGFwZSIsIkVycm9yIiwiZ2V0U2hhcGUiLCJoYXNTaGFwZSIsInNldFNoYXBlUHJvcGVydHkiLCJuZXdUYXJnZXQiLCJzZXRDb3JuZXJSYWRpdXMiLCJjb3JuZXJSYWRpdXMiLCJnZXRDb3JuZXJSYWRpdXMiLCJtdXRhdGUiLCJvcHRpb25zIiwiY2xvc2VzdENvcm5lclgiLCJjbG9zZXN0Q29ybmVyWSIsImd1YXJhbnRlZWRJbnNpZGUiLCJvZmZzZXRYIiwib2Zmc2V0WSIsInJvdW5kZWRSZWN0IiwibWluWCIsIm1pblkiLCJyb3VuZGVkQm91bmRzIiwiZGltZW5zaW9uIiwicHJvdmlkZWRPcHRpb25zIiwiaW5pdGlhbE9wdGlvbnMiLCJzaXphYmxlIiwiYXJndW1lbnRzIiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJsYXp5TGluayIsImJpbmQiLCJsb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5IiwibG9jYWxNaW5pbXVtV2lkdGhQcm9wZXJ0eSIsImxvY2FsTWluaW11bUhlaWdodFByb3BlcnR5IiwiX211dGF0b3JLZXlzIiwiZHJhd2FibGVNYXJrRmxhZ3MiLCJjb25jYXQiLCJmaWx0ZXIiLCJmbGFnIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBR0QsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsZ0JBQWdCLGdDQUFnQztBQUd2RCxTQUFTQyxLQUFLLFFBQVEsOEJBQThCO0FBQ3BELFNBQVNDLGNBQWMsUUFBUSxxQ0FBcUM7QUFFcEUsU0FBb0VDLFFBQVEsRUFBRUMsUUFBUSxFQUFZQyxJQUFJLEVBQWVDLE9BQU8sRUFBRUMsdUJBQXVCLEVBQUVDLG9CQUFvQixFQUFFQyxvQkFBb0IsRUFBRUMsc0JBQXNCLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxPQUFPLFFBQWdGLGdCQUFn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