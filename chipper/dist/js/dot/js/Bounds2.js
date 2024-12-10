// Copyright 2013-2024, University of Colorado Boulder
/**
 * A 2D rectangle-shaped bounded area (bounding box).
 *
 * There are a number of convenience functions to get positions and points on the Bounds. Currently we do not
 * store these with the Bounds2 instance, since we want to lower the memory footprint.
 *
 * minX, minY, maxX, and maxY are actually stored. We don't do x,y,width,height because this can't properly express
 * semi-infinite bounds (like a half-plane), or easily handle what Bounds2.NOTHING and Bounds2.EVERYTHING do with
 * the constructive solid areas.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Orientation from '../../phet-core/js/Orientation.js';
import Pool from '../../phet-core/js/Pool.js';
import InfiniteNumberIO from '../../tandem/js/types/InfiniteNumberIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import dot from './dot.js';
import Range from './Range.js';
import Vector2 from './Vector2.js';
// Temporary instances to be used in the transform method.
const scratchVector2 = new Vector2(0, 0);
let Bounds2 = class Bounds2 {
    /*---------------------------------------------------------------------------*
   * Properties
   *---------------------------------------------------------------------------*/ /**
   * The width of the bounds, defined as maxX - minX.
   */ getWidth() {
        return this.maxX - this.minX;
    }
    get width() {
        return this.getWidth();
    }
    /**
   * The height of the bounds, defined as maxY - minY.
   */ getHeight() {
        return this.maxY - this.minY;
    }
    get height() {
        return this.getHeight();
    }
    /*
   * Convenience positions
   * upper is in terms of the visual layout in Scenery and other programs, so the minY is the "upper", and minY is the "lower"
   *
   *             minX (x)     centerX        maxX
   *          ---------------------------------------
   * minY (y) | leftTop     centerTop     rightTop
   * centerY  | leftCenter  center        rightCenter
   * maxY     | leftBottom  centerBottom  rightBottom
   */ /**
   * Alias for minX, when thinking of the bounds as an (x,y,width,height) rectangle.
   */ getX() {
        return this.minX;
    }
    get x() {
        return this.getX();
    }
    /**
   * Alias for minY, when thinking of the bounds as an (x,y,width,height) rectangle.
   */ getY() {
        return this.minY;
    }
    get y() {
        return this.getY();
    }
    /**
   * Alias for minX, supporting the explicit getter function style.
   */ getMinX() {
        return this.minX;
    }
    /**
   * Alias for minY, supporting the explicit getter function style.
   */ getMinY() {
        return this.minY;
    }
    /**
   * Alias for maxX, supporting the explicit getter function style.
   */ getMaxX() {
        return this.maxX;
    }
    /**
   * Alias for maxY, supporting the explicit getter function style.
   */ getMaxY() {
        return this.maxY;
    }
    /**
   * Alias for minX, when thinking in the UI-layout manner.
   */ getLeft() {
        return this.minX;
    }
    get left() {
        return this.minX;
    }
    /**
   * Alias for minY, when thinking in the UI-layout manner.
   */ getTop() {
        return this.minY;
    }
    get top() {
        return this.minY;
    }
    /**
   * Alias for maxX, when thinking in the UI-layout manner.
   */ getRight() {
        return this.maxX;
    }
    get right() {
        return this.maxX;
    }
    /**
   * Alias for maxY, when thinking in the UI-layout manner.
   */ getBottom() {
        return this.maxY;
    }
    get bottom() {
        return this.maxY;
    }
    /**
   * The horizontal (X-coordinate) center of the bounds, averaging the minX and maxX.
   */ getCenterX() {
        return (this.maxX + this.minX) / 2;
    }
    get centerX() {
        return this.getCenterX();
    }
    /**
   * The vertical (Y-coordinate) center of the bounds, averaging the minY and maxY.
   */ getCenterY() {
        return (this.maxY + this.minY) / 2;
    }
    get centerY() {
        return this.getCenterY();
    }
    /**
   * The point (minX, minY), in the UI-coordinate upper-left.
   */ getLeftTop() {
        return new Vector2(this.minX, this.minY);
    }
    get leftTop() {
        return this.getLeftTop();
    }
    /**
   * The point (centerX, minY), in the UI-coordinate upper-center.
   */ getCenterTop() {
        return new Vector2(this.getCenterX(), this.minY);
    }
    get centerTop() {
        return this.getCenterTop();
    }
    /**
   * The point (right, minY), in the UI-coordinate upper-right.
   */ getRightTop() {
        return new Vector2(this.maxX, this.minY);
    }
    get rightTop() {
        return this.getRightTop();
    }
    /**
   * The point (left, centerY), in the UI-coordinate center-left.
   */ getLeftCenter() {
        return new Vector2(this.minX, this.getCenterY());
    }
    get leftCenter() {
        return this.getLeftCenter();
    }
    /**
   * The point (centerX, centerY), in the center of the bounds.
   */ getCenter() {
        return new Vector2(this.getCenterX(), this.getCenterY());
    }
    get center() {
        return this.getCenter();
    }
    /**
   * The point (maxX, centerY), in the UI-coordinate center-right
   */ getRightCenter() {
        return new Vector2(this.maxX, this.getCenterY());
    }
    get rightCenter() {
        return this.getRightCenter();
    }
    /**
   * The point (minX, maxY), in the UI-coordinate lower-left
   */ getLeftBottom() {
        return new Vector2(this.minX, this.maxY);
    }
    get leftBottom() {
        return this.getLeftBottom();
    }
    /**
   * The point (centerX, maxY), in the UI-coordinate lower-center
   */ getCenterBottom() {
        return new Vector2(this.getCenterX(), this.maxY);
    }
    get centerBottom() {
        return this.getCenterBottom();
    }
    /**
   * The point (maxX, maxY), in the UI-coordinate lower-right
   */ getRightBottom() {
        return new Vector2(this.maxX, this.maxY);
    }
    get rightBottom() {
        return this.getRightBottom();
    }
    /**
   * Whether we have negative width or height. Bounds2.NOTHING is a prime example of an empty Bounds2.
   * Bounds with width = height = 0 are considered not empty, since they include the single (0,0) point.
   */ isEmpty() {
        return this.getWidth() < 0 || this.getHeight() < 0;
    }
    /**
   * Whether our minimums and maximums are all finite numbers. This will exclude Bounds2.NOTHING and Bounds2.EVERYTHING.
   */ isFinite() {
        return isFinite(this.minX) && isFinite(this.minY) && isFinite(this.maxX) && isFinite(this.maxY);
    }
    /**
   * Whether this bounds has a non-zero area (non-zero positive width and height).
   */ hasNonzeroArea() {
        return this.getWidth() > 0 && this.getHeight() > 0;
    }
    /**
   * Whether this bounds has a finite and non-negative width and height.
   */ isValid() {
        return !this.isEmpty() && this.isFinite();
    }
    /**
   * If the point is inside the bounds, the point will be returned. Otherwise, this will return a new point
   * on the edge of the bounds that is the closest to the provided point.
   */ closestPointTo(point) {
        if (this.containsCoordinates(point.x, point.y)) {
            return point;
        } else {
            return this.getConstrainedPoint(point);
        }
    }
    /**
   * Find the point on the boundary of the Bounds2 that is closest to the provided point.
   */ closestBoundaryPointTo(point) {
        if (this.containsCoordinates(point.x, point.y)) {
            const closestXEdge = point.x < this.centerX ? this.minX : this.maxX;
            const closestYEdge = point.y < this.centerY ? this.minY : this.maxY;
            // Decide which cardinal direction to go based on simple distance.
            if (Math.abs(closestXEdge - point.x) < Math.abs(closestYEdge - point.y)) {
                return new Vector2(closestXEdge, point.y);
            } else {
                return new Vector2(point.x, closestYEdge);
            }
        } else {
            return this.getConstrainedPoint(point);
        }
    }
    /**
   * Give a point outside of this Bounds2, constrain it to a point on the boundary of this Bounds2.
   */ getConstrainedPoint(point) {
        const xConstrained = Math.max(Math.min(point.x, this.maxX), this.x);
        const yConstrained = Math.max(Math.min(point.y, this.maxY), this.y);
        return new Vector2(xConstrained, yConstrained);
    }
    /**
   * Whether the coordinates are contained inside the bounding box, or are on the boundary.
   *
   * @param x - X coordinate of the point to check
   * @param y - Y coordinate of the point to check
   */ containsCoordinates(x, y) {
        return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY;
    }
    /**
   * Whether the point is contained inside the bounding box, or is on the boundary.
   */ containsPoint(point) {
        return this.containsCoordinates(point.x, point.y);
    }
    /**
   * Whether this bounding box completely contains the bounding box passed as a parameter. The boundary of a box is
   * considered to be "contained".
   */ containsBounds(bounds) {
        return this.minX <= bounds.minX && this.maxX >= bounds.maxX && this.minY <= bounds.minY && this.maxY >= bounds.maxY;
    }
    /**
   * Whether this and another bounding box have any points of intersection (including touching boundaries).
   */ intersectsBounds(bounds) {
        const minX = Math.max(this.minX, bounds.minX);
        const minY = Math.max(this.minY, bounds.minY);
        const maxX = Math.min(this.maxX, bounds.maxX);
        const maxY = Math.min(this.maxY, bounds.maxY);
        return maxX - minX >= 0 && maxY - minY >= 0;
    }
    /**
   * The squared distance from the input point to the point closest to it inside the bounding box.
   */ minimumDistanceToPointSquared(point) {
        const closeX = point.x < this.minX ? this.minX : point.x > this.maxX ? this.maxX : null;
        const closeY = point.y < this.minY ? this.minY : point.y > this.maxY ? this.maxY : null;
        let d;
        if (closeX === null && closeY === null) {
            // inside, or on the boundary
            return 0;
        } else if (closeX === null) {
            // vertically directly above/below
            d = closeY - point.y;
            return d * d;
        } else if (closeY === null) {
            // horizontally directly to the left/right
            d = closeX - point.x;
            return d * d;
        } else {
            // corner case
            const dx = closeX - point.x;
            const dy = closeY - point.y;
            return dx * dx + dy * dy;
        }
    }
    /**
   * The squared distance from the input point to the point furthest from it inside the bounding box.
   */ maximumDistanceToPointSquared(point) {
        let x = point.x > this.getCenterX() ? this.minX : this.maxX;
        let y = point.y > this.getCenterY() ? this.minY : this.maxY;
        x -= point.x;
        y -= point.y;
        return x * x + y * y;
    }
    /**
   * Debugging string for the bounds.
   */ toString() {
        return `[x:(${this.minX},${this.maxX}),y:(${this.minY},${this.maxY})]`;
    }
    /**
   * Exact equality comparison between this bounds and another bounds.
   *
   * @returns - Whether the two bounds are equal
   */ equals(other) {
        return this.minX === other.minX && this.minY === other.minY && this.maxX === other.maxX && this.maxY === other.maxY;
    }
    /**
   * Approximate equality comparison between this bounds and another bounds.
   *
   * @returns - Whether difference between the two bounds has no min/max with an absolute value greater
   *            than epsilon.
   */ equalsEpsilon(other, epsilon) {
        epsilon = epsilon !== undefined ? epsilon : 0;
        const thisFinite = this.isFinite();
        const otherFinite = other.isFinite();
        if (thisFinite && otherFinite) {
            // both are finite, so we can use Math.abs() - it would fail with non-finite values like Infinity
            return Math.abs(this.minX - other.minX) < epsilon && Math.abs(this.minY - other.minY) < epsilon && Math.abs(this.maxX - other.maxX) < epsilon && Math.abs(this.maxY - other.maxY) < epsilon;
        } else if (thisFinite !== otherFinite) {
            return false; // one is finite, the other is not. definitely not equal
        } else if (this === other) {
            return true; // exact same instance, must be equal
        } else {
            // epsilon only applies on finite dimensions. due to JS's handling of isFinite(), it's faster to check the sum of both
            return (isFinite(this.minX + other.minX) ? Math.abs(this.minX - other.minX) < epsilon : this.minX === other.minX) && (isFinite(this.minY + other.minY) ? Math.abs(this.minY - other.minY) < epsilon : this.minY === other.minY) && (isFinite(this.maxX + other.maxX) ? Math.abs(this.maxX - other.maxX) < epsilon : this.maxX === other.maxX) && (isFinite(this.maxY + other.maxY) ? Math.abs(this.maxY - other.maxY) < epsilon : this.maxY === other.maxY);
        }
    }
    /*---------------------------------------------------------------------------*
   * Immutable operations
   *---------------------------------------------------------------------------*/ /**
   * Creates a copy of this bounds, or if a bounds is passed in, set that bounds's values to ours.
   *
   * This is the immutable form of the function set(), if a bounds is provided. This will return a new bounds, and
   * will not modify this bounds.
   *
   * @param [bounds] - If not provided, creates a new Bounds2 with filled in values. Otherwise, fills in the
   *                   values of the provided bounds so that it equals this bounds.
   */ copy(bounds) {
        if (bounds) {
            return bounds.set(this);
        } else {
            return b2(this.minX, this.minY, this.maxX, this.maxY);
        }
    }
    /**
   * Static factory method
   */ static create(bounds) {
        return b2(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    }
    /**
   * The smallest bounds that contains both this bounds and the input bounds, returned as a copy.
   *
   * This is the immutable form of the function includeBounds(). This will return a new bounds, and will not modify
   * this bounds.
   */ union(bounds) {
        return b2(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY));
    }
    /**
   * The smallest bounds that is contained by both this bounds and the input bounds, returned as a copy.
   *
   * This is the immutable form of the function constrainBounds(). This will return a new bounds, and will not modify
   * this bounds.
   */ intersection(bounds) {
        return b2(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY));
    }
    // TODO: difference should be well-defined, but more logic is needed to compute https://github.com/phetsims/dot/issues/96
    /**
   * The smallest bounds that contains this bounds and the point (x,y), returned as a copy.
   *
   * This is the immutable form of the function addCoordinates(). This will return a new bounds, and will not modify
   * this bounds.
   */ withCoordinates(x, y) {
        return b2(Math.min(this.minX, x), Math.min(this.minY, y), Math.max(this.maxX, x), Math.max(this.maxY, y));
    }
    /**
   * The smallest bounds that contains this bounds and the input point, returned as a copy.
   *
   * This is the immutable form of the function addPoint(). This will return a new bounds, and will not modify
   * this bounds.
   */ withPoint(point) {
        return this.withCoordinates(point.x, point.y);
    }
    /**
   * Returns the smallest bounds that contains both this bounds and the x value provided.
   *
   * This is the immutable form of the function addX(). This will return a new bounds, and will not modify
   * this bounds.
   */ withX(x) {
        return this.copy().addX(x);
    }
    /**
   * Returns the smallest bounds that contains both this bounds and the y value provided.
   *
   * This is the immutable form of the function addY(). This will return a new bounds, and will not modify
   * this bounds.
   */ withY(y) {
        return this.copy().addY(y);
    }
    /**
   * A copy of this bounds, with minX replaced with the input.
   *
   * This is the immutable form of the function setMinX(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMinX(minX) {
        return b2(minX, this.minY, this.maxX, this.maxY);
    }
    /**
   * A copy of this bounds, with minY replaced with the input.
   *
   * This is the immutable form of the function setMinY(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMinY(minY) {
        return b2(this.minX, minY, this.maxX, this.maxY);
    }
    /**
   * A copy of this bounds, with maxX replaced with the input.
   *
   * This is the immutable form of the function setMaxX(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMaxX(maxX) {
        return b2(this.minX, this.minY, maxX, this.maxY);
    }
    /**
   * A copy of this bounds, with maxY replaced with the input.
   *
   * This is the immutable form of the function setMaxY(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMaxY(maxY) {
        return b2(this.minX, this.minY, this.maxX, maxY);
    }
    /**
   * A copy of this bounds, with the minimum values rounded down to the nearest integer, and the maximum values
   * rounded up to the nearest integer. This causes the bounds to expand as necessary so that its boundaries
   * are integer-aligned.
   *
   * This is the immutable form of the function roundOut(). This will return a new bounds, and will not modify
   * this bounds.
   */ roundedOut() {
        return b2(Math.floor(this.minX), Math.floor(this.minY), Math.ceil(this.maxX), Math.ceil(this.maxY));
    }
    /**
   * A copy of this bounds, with the minimum values rounded up to the nearest integer, and the maximum values
   * rounded down to the nearest integer. This causes the bounds to contract as necessary so that its boundaries
   * are integer-aligned.
   *
   * This is the immutable form of the function roundIn(). This will return a new bounds, and will not modify
   * this bounds.
   */ roundedIn() {
        return b2(Math.ceil(this.minX), Math.ceil(this.minY), Math.floor(this.maxX), Math.floor(this.maxY));
    }
    /**
   * A bounding box (still axis-aligned) that contains the transformed shape of this bounds, applying the matrix as
   * an affine transformation.
   *
   * NOTE: bounds.transformed( matrix ).transformed( inverse ) may be larger than the original box, if it includes
   * a rotation that isn't a multiple of $\pi/2$. This is because the returned bounds may expand in area to cover
   * ALL of the corners of the transformed bounding box.
   *
   * This is the immutable form of the function transform(). This will return a new bounds, and will not modify
   * this bounds.
   */ transformed(matrix) {
        return this.copy().transform(matrix);
    }
    /**
   * A bounding box that is expanded on all sides by the specified amount.)
   *
   * This is the immutable form of the function dilate(). This will return a new bounds, and will not modify
   * this bounds.
   */ dilated(d) {
        return this.dilatedXY(d, d);
    }
    /**
   * A bounding box that is expanded horizontally (on the left and right) by the specified amount.
   *
   * This is the immutable form of the function dilateX(). This will return a new bounds, and will not modify
   * this bounds.
   */ dilatedX(x) {
        return b2(this.minX - x, this.minY, this.maxX + x, this.maxY);
    }
    /**
   * A bounding box that is expanded vertically (on the top and bottom) by the specified amount.
   *
   * This is the immutable form of the function dilateY(). This will return a new bounds, and will not modify
   * this bounds.
   */ dilatedY(y) {
        return b2(this.minX, this.minY - y, this.maxX, this.maxY + y);
    }
    /**
   * A bounding box that is expanded on all sides, with different amounts of expansion horizontally and vertically.
   * Will be identical to the bounds returned by calling bounds.dilatedX( x ).dilatedY( y ).
   *
   * This is the immutable form of the function dilateXY(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param x - Amount to dilate horizontally (for each side)
   * @param y - Amount to dilate vertically (for each side)
   */ dilatedXY(x, y) {
        return b2(this.minX - x, this.minY - y, this.maxX + x, this.maxY + y);
    }
    /**
   * A bounding box that is contracted on all sides by the specified amount.
   *
   * This is the immutable form of the function erode(). This will return a new bounds, and will not modify
   * this bounds.
   */ eroded(amount) {
        return this.dilated(-amount);
    }
    /**
   * A bounding box that is contracted horizontally (on the left and right) by the specified amount.
   *
   * This is the immutable form of the function erodeX(). This will return a new bounds, and will not modify
   * this bounds.
   */ erodedX(x) {
        return this.dilatedX(-x);
    }
    /**
   * A bounding box that is contracted vertically (on the top and bottom) by the specified amount.
   *
   * This is the immutable form of the function erodeY(). This will return a new bounds, and will not modify
   * this bounds.
   */ erodedY(y) {
        return this.dilatedY(-y);
    }
    /**
   * A bounding box that is contracted on all sides, with different amounts of contraction horizontally and vertically.
   *
   * This is the immutable form of the function erodeXY(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param x - Amount to erode horizontally (for each side)
   * @param y - Amount to erode vertically (for each side)
   */ erodedXY(x, y) {
        return this.dilatedXY(-x, -y);
    }
    /**
   * A bounding box that is expanded by a specific amount on all sides (or if some offsets are negative, will contract
   * those sides).
   *
   * This is the immutable form of the function offset(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param left - Amount to expand to the left (subtracts from minX)
   * @param top - Amount to expand to the top (subtracts from minY)
   * @param right - Amount to expand to the right (adds to maxX)
   * @param bottom - Amount to expand to the bottom (adds to maxY)
   */ withOffsets(left, top, right, bottom) {
        return b2(this.minX - left, this.minY - top, this.maxX + right, this.maxY + bottom);
    }
    /**
   * Our bounds, translated horizontally by x, returned as a copy.
   *
   * This is the immutable form of the function shiftX(). This will return a new bounds, and will not modify
   * this bounds.
   */ shiftedX(x) {
        return b2(this.minX + x, this.minY, this.maxX + x, this.maxY);
    }
    /**
   * Our bounds, translated vertically by y, returned as a copy.
   *
   * This is the immutable form of the function shiftY(). This will return a new bounds, and will not modify
   * this bounds.
   */ shiftedY(y) {
        return b2(this.minX, this.minY + y, this.maxX, this.maxY + y);
    }
    /**
   * Our bounds, translated by (x,y), returned as a copy.
   *
   * This is the immutable form of the function shift(). This will return a new bounds, and will not modify
   * this bounds.
   */ shiftedXY(x, y) {
        return b2(this.minX + x, this.minY + y, this.maxX + x, this.maxY + y);
    }
    /**
   * Returns our bounds, translated by a vector, returned as a copy.
   */ shifted(v) {
        return this.shiftedXY(v.x, v.y);
    }
    /**
   * Returns an interpolated value of this bounds and the argument.
   *
   * @param bounds
   * @param ratio - 0 will result in a copy of `this`, 1 will result in bounds, and in-between controls the
   *                         amount of each.
   */ blend(bounds, ratio) {
        const t = 1 - ratio;
        return b2(t * this.minX + ratio * bounds.minX, t * this.minY + ratio * bounds.minY, t * this.maxX + ratio * bounds.maxX, t * this.maxY + ratio * bounds.maxY);
    }
    /*---------------------------------------------------------------------------*
   * Mutable operations
   *
   * All mutable operations should call one of the following:
   *   setMinMax, setMinX, setMinY, setMaxX, setMaxY
   *---------------------------------------------------------------------------*/ /**
   * Sets each value for this bounds, and returns itself.
   */ setMinMax(minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
        return this;
    }
    /**
   * Sets the value of minX.
   *
   * This is the mutable form of the function withMinX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ setMinX(minX) {
        this.minX = minX;
        return this;
    }
    /**
   * Sets the value of minY.
   *
   * This is the mutable form of the function withMinY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ setMinY(minY) {
        this.minY = minY;
        return this;
    }
    /**
   * Sets the value of maxX.
   *
   * This is the mutable form of the function withMaxX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ setMaxX(maxX) {
        this.maxX = maxX;
        return this;
    }
    /**
   * Sets the value of maxY.
   *
   * This is the mutable form of the function withMaxY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ setMaxY(maxY) {
        this.maxY = maxY;
        return this;
    }
    /**
   * Sets the values of this bounds to be equal to the input bounds.
   *
   * This is the mutable form of the function copy(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ set(bounds) {
        return this.setMinMax(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    }
    /**
   * Modifies this bounds so that it contains both its original bounds and the input bounds.
   *
   * This is the mutable form of the function union(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ includeBounds(bounds) {
        return this.setMinMax(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY));
    }
    /**
   * Modifies this bounds so that it is the largest bounds contained both in its original bounds and in the input bounds.
   *
   * This is the mutable form of the function intersection(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ constrainBounds(bounds) {
        return this.setMinMax(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY));
    }
    /**
   * Modifies this bounds so that it contains both its original bounds and the input point (x,y).
   *
   * This is the mutable form of the function withCoordinates(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ addCoordinates(x, y) {
        return this.setMinMax(Math.min(this.minX, x), Math.min(this.minY, y), Math.max(this.maxX, x), Math.max(this.maxY, y));
    }
    /**
   * Modifies this bounds so that it contains both its original bounds and the input point.
   *
   * This is the mutable form of the function withPoint(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ addPoint(point) {
        return this.addCoordinates(point.x, point.y);
    }
    /**
   * Modifies this bounds so that it is guaranteed to include the given x value (if it didn't already). If the x value
   * was already contained, nothing will be done.
   *
   * This is the mutable form of the function withX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ addX(x) {
        this.minX = Math.min(x, this.minX);
        this.maxX = Math.max(x, this.maxX);
        return this;
    }
    /**
   * Modifies this bounds so that it is guaranteed to include the given y value (if it didn't already). If the y value
   * was already contained, nothing will be done.
   *
   * This is the mutable form of the function withY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ addY(y) {
        this.minY = Math.min(y, this.minY);
        this.maxY = Math.max(y, this.maxY);
        return this;
    }
    /**
   * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries down and the
   * maximum boundaries up (expanding as necessary).
   *
   * This is the mutable form of the function roundedOut(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ roundOut() {
        return this.setMinMax(Math.floor(this.minX), Math.floor(this.minY), Math.ceil(this.maxX), Math.ceil(this.maxY));
    }
    /**
   * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries up and the
   * maximum boundaries down (contracting as necessary).
   *
   * This is the mutable form of the function roundedIn(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ roundIn() {
        return this.setMinMax(Math.ceil(this.minX), Math.ceil(this.minY), Math.floor(this.maxX), Math.floor(this.maxY));
    }
    /**
   * Modifies this bounds so that it would fully contain a transformed version if its previous value, applying the
   * matrix as an affine transformation.
   *
   * NOTE: bounds.transform( matrix ).transform( inverse ) may be larger than the original box, if it includes
   * a rotation that isn't a multiple of $\pi/2$. This is because the bounds may expand in area to cover
   * ALL of the corners of the transformed bounding box.
   *
   * This is the mutable form of the function transformed(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ transform(matrix) {
        // if we contain no area, no change is needed
        if (this.isEmpty()) {
            return this;
        }
        // optimization to bail for identity matrices
        if (matrix.isIdentity()) {
            return this;
        }
        const minX = this.minX;
        const minY = this.minY;
        const maxX = this.maxX;
        const maxY = this.maxY;
        this.set(Bounds2.NOTHING);
        // using mutable vector so we don't create excessive instances of Vector2 during this
        // make sure all 4 corners are inside this transformed bounding box
        this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(minX, minY)));
        this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(minX, maxY)));
        this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(maxX, minY)));
        this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(maxX, maxY)));
        return this;
    }
    /**
   * Expands this bounds on all sides by the specified amount.
   *
   * This is the mutable form of the function dilated(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ dilate(d) {
        return this.dilateXY(d, d);
    }
    /**
   * Expands this bounds horizontally (left and right) by the specified amount.
   *
   * This is the mutable form of the function dilatedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ dilateX(x) {
        return this.setMinMax(this.minX - x, this.minY, this.maxX + x, this.maxY);
    }
    /**
   * Expands this bounds vertically (top and bottom) by the specified amount.
   *
   * This is the mutable form of the function dilatedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ dilateY(y) {
        return this.setMinMax(this.minX, this.minY - y, this.maxX, this.maxY + y);
    }
    /**
   * Expands this bounds independently in the horizontal and vertical directions. Will be equal to calling
   * bounds.dilateX( x ).dilateY( y ).
   *
   * This is the mutable form of the function dilatedXY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ dilateXY(x, y) {
        return this.setMinMax(this.minX - x, this.minY - y, this.maxX + x, this.maxY + y);
    }
    /**
   * Contracts this bounds on all sides by the specified amount.
   *
   * This is the mutable form of the function eroded(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ erode(d) {
        return this.dilate(-d);
    }
    /**
   * Contracts this bounds horizontally (left and right) by the specified amount.
   *
   * This is the mutable form of the function erodedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ erodeX(x) {
        return this.dilateX(-x);
    }
    /**
   * Contracts this bounds vertically (top and bottom) by the specified amount.
   *
   * This is the mutable form of the function erodedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ erodeY(y) {
        return this.dilateY(-y);
    }
    /**
   * Contracts this bounds independently in the horizontal and vertical directions. Will be equal to calling
   * bounds.erodeX( x ).erodeY( y ).
   *
   * This is the mutable form of the function erodedXY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ erodeXY(x, y) {
        return this.dilateXY(-x, -y);
    }
    /**
   * Expands this bounds independently for each side (or if some offsets are negative, will contract those sides).
   *
   * This is the mutable form of the function withOffsets(). This will mutate (change) this bounds, in addition to
   * returning this bounds itself.
   *
   * @param left - Amount to expand to the left (subtracts from minX)
   * @param top - Amount to expand to the top (subtracts from minY)
   * @param right - Amount to expand to the right (adds to maxX)
   * @param bottom - Amount to expand to the bottom (adds to maxY)
   */ offset(left, top, right, bottom) {
        return b2(this.minX - left, this.minY - top, this.maxX + right, this.maxY + bottom);
    }
    /**
   * Translates our bounds horizontally by x.
   *
   * This is the mutable form of the function shiftedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ shiftX(x) {
        return this.setMinMax(this.minX + x, this.minY, this.maxX + x, this.maxY);
    }
    /**
   * Translates our bounds vertically by y.
   *
   * This is the mutable form of the function shiftedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ shiftY(y) {
        return this.setMinMax(this.minX, this.minY + y, this.maxX, this.maxY + y);
    }
    /**
   * Translates our bounds by (x,y).
   *
   * This is the mutable form of the function shifted(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ shiftXY(x, y) {
        return this.setMinMax(this.minX + x, this.minY + y, this.maxX + x, this.maxY + y);
    }
    /**
   * Translates our bounds by the given vector.
   */ shift(v) {
        return this.shiftXY(v.x, v.y);
    }
    /**
   * Returns the range of the x-values of this bounds.
   */ getXRange() {
        return new Range(this.minX, this.maxX);
    }
    /**
   * Sets the x-range of this bounds.
   */ setXRange(range) {
        return this.setMinMax(range.min, this.minY, range.max, this.maxY);
    }
    get xRange() {
        return this.getXRange();
    }
    set xRange(range) {
        this.setXRange(range);
    }
    /**
   * Returns the range of the y-values of this bounds.
   */ getYRange() {
        return new Range(this.minY, this.maxY);
    }
    /**
   * Sets the y-range of this bounds.
   */ setYRange(range) {
        return this.setMinMax(this.minX, range.min, this.maxX, range.max);
    }
    get yRange() {
        return this.getYRange();
    }
    set yRange(range) {
        this.setYRange(range);
    }
    /**
   * Find a point in the bounds closest to the specified point.
   *
   * @param x - X coordinate of the point to test.
   * @param y - Y coordinate of the point to test.
   * @param [result] - Vector2 that can store the return value to avoid allocations.
   */ getClosestPoint(x, y, result) {
        if (result) {
            result.setXY(x, y);
        } else {
            result = new Vector2(x, y);
        }
        if (result.x < this.minX) {
            result.x = this.minX;
        }
        if (result.x > this.maxX) {
            result.x = this.maxX;
        }
        if (result.y < this.minY) {
            result.y = this.minY;
        }
        if (result.y > this.maxY) {
            result.y = this.maxY;
        }
        return result;
    }
    freeToPool() {
        Bounds2.pool.freeToPool(this);
    }
    /**
   * Returns a new Bounds2 object, with the familiar rectangle construction with x, y, width, and height.
   *
   * @param x - The minimum value of X for the bounds.
   * @param y - The minimum value of Y for the bounds.
   * @param width - The width (maxX - minX) of the bounds.
   * @param height - The height (maxY - minY) of the bounds.
   */ static rect(x, y, width, height) {
        return b2(x, y, x + width, y + height);
    }
    /**
   * Returns a new Bounds2 object with a given orientation (min/max specified for both the given (primary) orientation,
   * and also the secondary orientation).
   */ static oriented(orientation, minPrimary, minSecondary, maxPrimary, maxSecondary) {
        return orientation === Orientation.HORIZONTAL ? new Bounds2(minPrimary, minSecondary, maxPrimary, maxSecondary) : new Bounds2(minSecondary, minPrimary, maxSecondary, maxPrimary);
    }
    static point(x, y) {
        if (x instanceof Vector2) {
            const p = x;
            return b2(p.x, p.y, p.x, p.y);
        } else {
            return b2(x, y, x, y);
        }
    }
    /**
   * Creates a 2-dimensional bounds (bounding box).
   *
   * @param minX - The initial minimum X coordinate of the bounds.
   * @param minY - The initial minimum Y coordinate of the bounds.
   * @param maxX - The initial maximum X coordinate of the bounds.
   * @param maxY - The initial maximum Y coordinate of the bounds.
   */ constructor(minX, minY, maxX, maxY){
        assert && assert(maxY !== undefined, 'Bounds2 requires 4 parameters');
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }
};
Bounds2.pool = new Pool(Bounds2, {
    maxSize: 1000,
    initialize: Bounds2.prototype.setMinMax,
    defaultArguments: [
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY
    ]
});
/**
   * A constant Bounds2 with minimums = $\infty$, maximums = $-\infty$, so that it represents "no bounds whatsoever".
   *
   * This allows us to take the union (union/includeBounds) of this and any other Bounds2 to get the other bounds back,
   * e.g. Bounds2.NOTHING.union( bounds ).equals( bounds ). This object naturally serves as the base case as a union of
   * zero bounds objects.
   *
   * Additionally, intersections with NOTHING will always return a Bounds2 equivalent to NOTHING.
   */ Bounds2.NOTHING = new Bounds2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
/**
   * A constant Bounds2 with minimums = $-\infty$, maximums = $\infty$, so that it represents "all bounds".
   *
   * This allows us to take the intersection (intersection/constrainBounds) of this and any other Bounds2 to get the
   * other bounds back, e.g. Bounds2.EVERYTHING.intersection( bounds ).equals( bounds ). This object naturally serves as
   * the base case as an intersection of zero bounds objects.
   *
   * Additionally, unions with EVERYTHING will always return a Bounds2 equivalent to EVERYTHING.
   */ Bounds2.EVERYTHING = new Bounds2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
Bounds2.Bounds2IO = new IOType('Bounds2IO', {
    valueType: Bounds2,
    documentation: 'a 2-dimensional bounds rectangle',
    toStateObject: (bounds2)=>({
            minX: bounds2.minX,
            minY: bounds2.minY,
            maxX: bounds2.maxX,
            maxY: bounds2.maxY
        }),
    fromStateObject: (stateObject)=>{
        return new Bounds2(InfiniteNumberIO.fromStateObject(stateObject.minX), InfiniteNumberIO.fromStateObject(stateObject.minY), InfiniteNumberIO.fromStateObject(stateObject.maxX), InfiniteNumberIO.fromStateObject(stateObject.maxY));
    },
    stateSchema: {
        minX: InfiniteNumberIO,
        maxX: InfiniteNumberIO,
        minY: InfiniteNumberIO,
        maxY: InfiniteNumberIO
    }
});
export { Bounds2 as default };
dot.register('Bounds2', Bounds2);
const b2 = Bounds2.pool.create.bind(Bounds2.pool);
dot.register('b2', b2);
Bounds2.prototype.isBounds = true;
Bounds2.prototype.dimension = 2;
function catchImmutableSetterLowHangingFruit(bounds) {
    bounds.setMinMax = ()=>{
        throw new Error('Attempt to set "setMinMax" of an immutable Bounds2 object');
    };
    bounds.set = ()=>{
        throw new Error('Attempt to set "set" of an immutable Bounds2 object');
    };
    bounds.includeBounds = ()=>{
        throw new Error('Attempt to set "includeBounds" of an immutable Bounds2 object');
    };
    bounds.constrainBounds = ()=>{
        throw new Error('Attempt to set "constrainBounds" of an immutable Bounds2 object');
    };
    bounds.addCoordinates = ()=>{
        throw new Error('Attempt to set "addCoordinates" of an immutable Bounds2 object');
    };
    bounds.transform = ()=>{
        throw new Error('Attempt to set "transform" of an immutable Bounds2 object');
    };
}
if (assert) {
    catchImmutableSetterLowHangingFruit(Bounds2.EVERYTHING);
    catchImmutableSetterLowHangingFruit(Bounds2.NOTHING);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgMkQgcmVjdGFuZ2xlLXNoYXBlZCBib3VuZGVkIGFyZWEgKGJvdW5kaW5nIGJveCkuXG4gKlxuICogVGhlcmUgYXJlIGEgbnVtYmVyIG9mIGNvbnZlbmllbmNlIGZ1bmN0aW9ucyB0byBnZXQgcG9zaXRpb25zIGFuZCBwb2ludHMgb24gdGhlIEJvdW5kcy4gQ3VycmVudGx5IHdlIGRvIG5vdFxuICogc3RvcmUgdGhlc2Ugd2l0aCB0aGUgQm91bmRzMiBpbnN0YW5jZSwgc2luY2Ugd2Ugd2FudCB0byBsb3dlciB0aGUgbWVtb3J5IGZvb3RwcmludC5cbiAqXG4gKiBtaW5YLCBtaW5ZLCBtYXhYLCBhbmQgbWF4WSBhcmUgYWN0dWFsbHkgc3RvcmVkLiBXZSBkb24ndCBkbyB4LHksd2lkdGgsaGVpZ2h0IGJlY2F1c2UgdGhpcyBjYW4ndCBwcm9wZXJseSBleHByZXNzXG4gKiBzZW1pLWluZmluaXRlIGJvdW5kcyAobGlrZSBhIGhhbGYtcGxhbmUpLCBvciBlYXNpbHkgaGFuZGxlIHdoYXQgQm91bmRzMi5OT1RISU5HIGFuZCBCb3VuZHMyLkVWRVJZVEhJTkcgZG8gd2l0aFxuICogdGhlIGNvbnN0cnVjdGl2ZSBzb2xpZCBhcmVhcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XG5pbXBvcnQgUG9vbCwgeyBUUG9vbGFibGUgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvUG9vbC5qcyc7XG5pbXBvcnQgSW5maW5pdGVOdW1iZXJJTywgeyBJbmZpbml0ZU51bWJlclN0YXRlT2JqZWN0IH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0luZmluaXRlTnVtYmVySU8uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi9NYXRyaXgzLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuL1JhbmdlLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4vVmVjdG9yMi5qcyc7XG5cbi8vIFRlbXBvcmFyeSBpbnN0YW5jZXMgdG8gYmUgdXNlZCBpbiB0aGUgdHJhbnNmb3JtIG1ldGhvZC5cbmNvbnN0IHNjcmF0Y2hWZWN0b3IyID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcblxuLy8gRm9yIFBoRVQtaU8gc2VyaWFsaXphdGlvblxuZXhwb3J0IHR5cGUgQm91bmRzMlN0YXRlT2JqZWN0ID0ge1xuICBtaW5YOiBJbmZpbml0ZU51bWJlclN0YXRlT2JqZWN0O1xuICBtaW5ZOiBJbmZpbml0ZU51bWJlclN0YXRlT2JqZWN0O1xuICBtYXhYOiBJbmZpbml0ZU51bWJlclN0YXRlT2JqZWN0O1xuICBtYXhZOiBJbmZpbml0ZU51bWJlclN0YXRlT2JqZWN0O1xufTtcblxuLy8gRHVjayB0eXBlZCBmb3Igd2hlbiBjcmVhdGluZyBhIEJvdW5kczIgd2l0aCBzdXBwb3J0IGZvciBCb3VuZHMzIG9yIG90aGVyIHN0cnVjdHVyYWxseSBzaW1pbGFyIG9iamVjdC5cbnR5cGUgQm91bmRzMkxpa2UgPSB7XG4gIG1pblg6IG51bWJlcjtcbiAgbWluWTogbnVtYmVyO1xuICBtYXhYOiBudW1iZXI7XG4gIG1heFk6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvdW5kczIgaW1wbGVtZW50cyBUUG9vbGFibGUge1xuXG4gIC8vIFRoZSBtaW5pbXVtIFggY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxuICBwdWJsaWMgbWluWDogbnVtYmVyO1xuXG4gIC8vIFRoZSBtaW5pbXVtIFkgY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxuICBwdWJsaWMgbWluWTogbnVtYmVyO1xuXG4gIC8vIFRoZSBtYXhpbXVtIFggY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxuICBwdWJsaWMgbWF4WDogbnVtYmVyO1xuXG4gIC8vIFRoZSBtYXhpbXVtIFkgY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxuICBwdWJsaWMgbWF4WTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgMi1kaW1lbnNpb25hbCBib3VuZHMgKGJvdW5kaW5nIGJveCkuXG4gICAqXG4gICAqIEBwYXJhbSBtaW5YIC0gVGhlIGluaXRpYWwgbWluaW11bSBYIGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcy5cbiAgICogQHBhcmFtIG1pblkgLSBUaGUgaW5pdGlhbCBtaW5pbXVtIFkgY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxuICAgKiBAcGFyYW0gbWF4WCAtIFRoZSBpbml0aWFsIG1heGltdW0gWCBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXG4gICAqIEBwYXJhbSBtYXhZIC0gVGhlIGluaXRpYWwgbWF4aW11bSBZIGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWluWDogbnVtYmVyLCBtaW5ZOiBudW1iZXIsIG1heFg6IG51bWJlciwgbWF4WTogbnVtYmVyICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1heFkgIT09IHVuZGVmaW5lZCwgJ0JvdW5kczIgcmVxdWlyZXMgNCBwYXJhbWV0ZXJzJyApO1xuXG4gICAgdGhpcy5taW5YID0gbWluWDtcbiAgICB0aGlzLm1pblkgPSBtaW5ZO1xuICAgIHRoaXMubWF4WCA9IG1heFg7XG4gICAgdGhpcy5tYXhZID0gbWF4WTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBQcm9wZXJ0aWVzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogVGhlIHdpZHRoIG9mIHRoZSBib3VuZHMsIGRlZmluZWQgYXMgbWF4WCAtIG1pblguXG4gICAqL1xuICBwdWJsaWMgZ2V0V2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWF4WCAtIHRoaXMubWluWDsgfVxuXG4gIHB1YmxpYyBnZXQgd2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBib3VuZHMsIGRlZmluZWQgYXMgbWF4WSAtIG1pblkuXG4gICAqL1xuICBwdWJsaWMgZ2V0SGVpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1heFkgLSB0aGlzLm1pblk7IH1cblxuICBwdWJsaWMgZ2V0IGhlaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRIZWlnaHQoKTsgfVxuXG4gIC8qXG4gICAqIENvbnZlbmllbmNlIHBvc2l0aW9uc1xuICAgKiB1cHBlciBpcyBpbiB0ZXJtcyBvZiB0aGUgdmlzdWFsIGxheW91dCBpbiBTY2VuZXJ5IGFuZCBvdGhlciBwcm9ncmFtcywgc28gdGhlIG1pblkgaXMgdGhlIFwidXBwZXJcIiwgYW5kIG1pblkgaXMgdGhlIFwibG93ZXJcIlxuICAgKlxuICAgKiAgICAgICAgICAgICBtaW5YICh4KSAgICAgY2VudGVyWCAgICAgICAgbWF4WFxuICAgKiAgICAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogbWluWSAoeSkgfCBsZWZ0VG9wICAgICBjZW50ZXJUb3AgICAgIHJpZ2h0VG9wXG4gICAqIGNlbnRlclkgIHwgbGVmdENlbnRlciAgY2VudGVyICAgICAgICByaWdodENlbnRlclxuICAgKiBtYXhZICAgICB8IGxlZnRCb3R0b20gIGNlbnRlckJvdHRvbSAgcmlnaHRCb3R0b21cbiAgICovXG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5YLCB3aGVuIHRoaW5raW5nIG9mIHRoZSBib3VuZHMgYXMgYW4gKHgseSx3aWR0aCxoZWlnaHQpIHJlY3RhbmdsZS5cbiAgICovXG4gIHB1YmxpYyBnZXRYKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1pblg7IH1cblxuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0WCgpOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5ZLCB3aGVuIHRoaW5raW5nIG9mIHRoZSBib3VuZHMgYXMgYW4gKHgseSx3aWR0aCxoZWlnaHQpIHJlY3RhbmdsZS5cbiAgICovXG4gIHB1YmxpYyBnZXRZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1pblk7IH1cblxuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0WSgpOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5YLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWluWCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5YOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5ZLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWluWSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5ZOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtYXhYLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWF4WCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhYOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtYXhZLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWF4WSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhZOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5YLCB3aGVuIHRoaW5raW5nIGluIHRoZSBVSS1sYXlvdXQgbWFubmVyLlxuICAgKi9cbiAgcHVibGljIGdldExlZnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluWDsgfVxuXG4gIHB1YmxpYyBnZXQgbGVmdCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5YOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5ZLCB3aGVuIHRoaW5raW5nIGluIHRoZSBVSS1sYXlvdXQgbWFubmVyLlxuICAgKi9cbiAgcHVibGljIGdldFRvcCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5ZOyB9XG5cbiAgcHVibGljIGdldCB0b3AoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluWTsgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3IgbWF4WCwgd2hlbiB0aGlua2luZyBpbiB0aGUgVUktbGF5b3V0IG1hbm5lci5cbiAgICovXG4gIHB1YmxpYyBnZXRSaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhYOyB9XG5cbiAgcHVibGljIGdldCByaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhYOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtYXhZLCB3aGVuIHRoaW5raW5nIGluIHRoZSBVSS1sYXlvdXQgbWFubmVyLlxuICAgKi9cbiAgcHVibGljIGdldEJvdHRvbSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhZOyB9XG5cbiAgcHVibGljIGdldCBib3R0b20oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWF4WTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgaG9yaXpvbnRhbCAoWC1jb29yZGluYXRlKSBjZW50ZXIgb2YgdGhlIGJvdW5kcywgYXZlcmFnaW5nIHRoZSBtaW5YIGFuZCBtYXhYLlxuICAgKi9cbiAgcHVibGljIGdldENlbnRlclgoKTogbnVtYmVyIHsgcmV0dXJuICggdGhpcy5tYXhYICsgdGhpcy5taW5YICkgLyAyOyB9XG5cbiAgcHVibGljIGdldCBjZW50ZXJYKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldENlbnRlclgoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgdmVydGljYWwgKFktY29vcmRpbmF0ZSkgY2VudGVyIG9mIHRoZSBib3VuZHMsIGF2ZXJhZ2luZyB0aGUgbWluWSBhbmQgbWF4WS5cbiAgICovXG4gIHB1YmxpYyBnZXRDZW50ZXJZKCk6IG51bWJlciB7IHJldHVybiAoIHRoaXMubWF4WSArIHRoaXMubWluWSApIC8gMjsgfVxuXG4gIHB1YmxpYyBnZXQgY2VudGVyWSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRDZW50ZXJZKCk7IH1cblxuICAvKipcbiAgICogVGhlIHBvaW50IChtaW5YLCBtaW5ZKSwgaW4gdGhlIFVJLWNvb3JkaW5hdGUgdXBwZXItbGVmdC5cbiAgICovXG4gIHB1YmxpYyBnZXRMZWZ0VG9wKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMubWluWCwgdGhpcy5taW5ZICk7IH1cblxuICBwdWJsaWMgZ2V0IGxlZnRUb3AoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldExlZnRUb3AoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnQgKGNlbnRlclgsIG1pblkpLCBpbiB0aGUgVUktY29vcmRpbmF0ZSB1cHBlci1jZW50ZXIuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2VudGVyVG9wKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMuZ2V0Q2VudGVyWCgpLCB0aGlzLm1pblkgKTsgfVxuXG4gIHB1YmxpYyBnZXQgY2VudGVyVG9wKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRDZW50ZXJUb3AoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnQgKHJpZ2h0LCBtaW5ZKSwgaW4gdGhlIFVJLWNvb3JkaW5hdGUgdXBwZXItcmlnaHQuXG4gICAqL1xuICBwdWJsaWMgZ2V0UmlnaHRUb3AoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5tYXhYLCB0aGlzLm1pblkgKTsgfVxuXG4gIHB1YmxpYyBnZXQgcmlnaHRUb3AoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFJpZ2h0VG9wKCk7IH1cblxuICAvKipcbiAgICogVGhlIHBvaW50IChsZWZ0LCBjZW50ZXJZKSwgaW4gdGhlIFVJLWNvb3JkaW5hdGUgY2VudGVyLWxlZnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0TGVmdENlbnRlcigpOiBWZWN0b3IyIHsgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLm1pblgsIHRoaXMuZ2V0Q2VudGVyWSgpICk7IH1cblxuICBwdWJsaWMgZ2V0IGxlZnRDZW50ZXIoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldExlZnRDZW50ZXIoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnQgKGNlbnRlclgsIGNlbnRlclkpLCBpbiB0aGUgY2VudGVyIG9mIHRoZSBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2VudGVyKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMuZ2V0Q2VudGVyWCgpLCB0aGlzLmdldENlbnRlclkoKSApOyB9XG5cbiAgcHVibGljIGdldCBjZW50ZXIoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldENlbnRlcigpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBwb2ludCAobWF4WCwgY2VudGVyWSksIGluIHRoZSBVSS1jb29yZGluYXRlIGNlbnRlci1yaWdodFxuICAgKi9cbiAgcHVibGljIGdldFJpZ2h0Q2VudGVyKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMubWF4WCwgdGhpcy5nZXRDZW50ZXJZKCkgKTsgfVxuXG4gIHB1YmxpYyBnZXQgcmlnaHRDZW50ZXIoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFJpZ2h0Q2VudGVyKCk7IH1cblxuICAvKipcbiAgICogVGhlIHBvaW50IChtaW5YLCBtYXhZKSwgaW4gdGhlIFVJLWNvb3JkaW5hdGUgbG93ZXItbGVmdFxuICAgKi9cbiAgcHVibGljIGdldExlZnRCb3R0b20oKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5taW5YLCB0aGlzLm1heFkgKTsgfVxuXG4gIHB1YmxpYyBnZXQgbGVmdEJvdHRvbSgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0TGVmdEJvdHRvbSgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBwb2ludCAoY2VudGVyWCwgbWF4WSksIGluIHRoZSBVSS1jb29yZGluYXRlIGxvd2VyLWNlbnRlclxuICAgKi9cbiAgcHVibGljIGdldENlbnRlckJvdHRvbSgpOiBWZWN0b3IyIHsgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLmdldENlbnRlclgoKSwgdGhpcy5tYXhZICk7IH1cblxuICBwdWJsaWMgZ2V0IGNlbnRlckJvdHRvbSgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyQm90dG9tKCk7IH1cblxuICAvKipcbiAgICogVGhlIHBvaW50IChtYXhYLCBtYXhZKSwgaW4gdGhlIFVJLWNvb3JkaW5hdGUgbG93ZXItcmlnaHRcbiAgICovXG4gIHB1YmxpYyBnZXRSaWdodEJvdHRvbSgpOiBWZWN0b3IyIHsgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLm1heFgsIHRoaXMubWF4WSApOyB9XG5cbiAgcHVibGljIGdldCByaWdodEJvdHRvbSgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0UmlnaHRCb3R0b20oKTsgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHdlIGhhdmUgbmVnYXRpdmUgd2lkdGggb3IgaGVpZ2h0LiBCb3VuZHMyLk5PVEhJTkcgaXMgYSBwcmltZSBleGFtcGxlIG9mIGFuIGVtcHR5IEJvdW5kczIuXG4gICAqIEJvdW5kcyB3aXRoIHdpZHRoID0gaGVpZ2h0ID0gMCBhcmUgY29uc2lkZXJlZCBub3QgZW1wdHksIHNpbmNlIHRoZXkgaW5jbHVkZSB0aGUgc2luZ2xlICgwLDApIHBvaW50LlxuICAgKi9cbiAgcHVibGljIGlzRW1wdHkoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldFdpZHRoKCkgPCAwIHx8IHRoaXMuZ2V0SGVpZ2h0KCkgPCAwOyB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3VyIG1pbmltdW1zIGFuZCBtYXhpbXVtcyBhcmUgYWxsIGZpbml0ZSBudW1iZXJzLiBUaGlzIHdpbGwgZXhjbHVkZSBCb3VuZHMyLk5PVEhJTkcgYW5kIEJvdW5kczIuRVZFUllUSElORy5cbiAgICovXG4gIHB1YmxpYyBpc0Zpbml0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNGaW5pdGUoIHRoaXMubWluWCApICYmIGlzRmluaXRlKCB0aGlzLm1pblkgKSAmJiBpc0Zpbml0ZSggdGhpcy5tYXhYICkgJiYgaXNGaW5pdGUoIHRoaXMubWF4WSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBib3VuZHMgaGFzIGEgbm9uLXplcm8gYXJlYSAobm9uLXplcm8gcG9zaXRpdmUgd2lkdGggYW5kIGhlaWdodCkuXG4gICAqL1xuICBwdWJsaWMgaGFzTm9uemVyb0FyZWEoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKSA+IDAgJiYgdGhpcy5nZXRIZWlnaHQoKSA+IDA7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGJvdW5kcyBoYXMgYSBmaW5pdGUgYW5kIG5vbi1uZWdhdGl2ZSB3aWR0aCBhbmQgaGVpZ2h0LlxuICAgKi9cbiAgcHVibGljIGlzVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLmlzRW1wdHkoKSAmJiB0aGlzLmlzRmluaXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgYm91bmRzLCB0aGUgcG9pbnQgd2lsbCBiZSByZXR1cm5lZC4gT3RoZXJ3aXNlLCB0aGlzIHdpbGwgcmV0dXJuIGEgbmV3IHBvaW50XG4gICAqIG9uIHRoZSBlZGdlIG9mIHRoZSBib3VuZHMgdGhhdCBpcyB0aGUgY2xvc2VzdCB0byB0aGUgcHJvdmlkZWQgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgY2xvc2VzdFBvaW50VG8oIHBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIGlmICggdGhpcy5jb250YWluc0Nvb3JkaW5hdGVzKCBwb2ludC54LCBwb2ludC55ICkgKSB7XG4gICAgICByZXR1cm4gcG9pbnQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29uc3RyYWluZWRQb2ludCggcG9pbnQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgcG9pbnQgb24gdGhlIGJvdW5kYXJ5IG9mIHRoZSBCb3VuZHMyIHRoYXQgaXMgY2xvc2VzdCB0byB0aGUgcHJvdmlkZWQgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgY2xvc2VzdEJvdW5kYXJ5UG9pbnRUbyggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgaWYgKCB0aGlzLmNvbnRhaW5zQ29vcmRpbmF0ZXMoIHBvaW50LngsIHBvaW50LnkgKSApIHtcbiAgICAgIGNvbnN0IGNsb3Nlc3RYRWRnZSA9IHBvaW50LnggPCB0aGlzLmNlbnRlclggPyB0aGlzLm1pblggOiB0aGlzLm1heFg7XG4gICAgICBjb25zdCBjbG9zZXN0WUVkZ2UgPSBwb2ludC55IDwgdGhpcy5jZW50ZXJZID8gdGhpcy5taW5ZIDogdGhpcy5tYXhZO1xuXG4gICAgICAvLyBEZWNpZGUgd2hpY2ggY2FyZGluYWwgZGlyZWN0aW9uIHRvIGdvIGJhc2VkIG9uIHNpbXBsZSBkaXN0YW5jZS5cbiAgICAgIGlmICggTWF0aC5hYnMoIGNsb3Nlc3RYRWRnZSAtIHBvaW50LnggKSA8IE1hdGguYWJzKCBjbG9zZXN0WUVkZ2UgLSBwb2ludC55ICkgKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yMiggY2xvc2VzdFhFZGdlLCBwb2ludC55ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKCBwb2ludC54LCBjbG9zZXN0WUVkZ2UgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRDb25zdHJhaW5lZFBvaW50KCBwb2ludCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlIGEgcG9pbnQgb3V0c2lkZSBvZiB0aGlzIEJvdW5kczIsIGNvbnN0cmFpbiBpdCB0byBhIHBvaW50IG9uIHRoZSBib3VuZGFyeSBvZiB0aGlzIEJvdW5kczIuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q29uc3RyYWluZWRQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgY29uc3QgeENvbnN0cmFpbmVkID0gTWF0aC5tYXgoIE1hdGgubWluKCBwb2ludC54LCB0aGlzLm1heFggKSwgdGhpcy54ICk7XG4gICAgY29uc3QgeUNvbnN0cmFpbmVkID0gTWF0aC5tYXgoIE1hdGgubWluKCBwb2ludC55LCB0aGlzLm1heFkgKSwgdGhpcy55ICk7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4Q29uc3RyYWluZWQsIHlDb25zdHJhaW5lZCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGNvb3JkaW5hdGVzIGFyZSBjb250YWluZWQgaW5zaWRlIHRoZSBib3VuZGluZyBib3gsIG9yIGFyZSBvbiB0aGUgYm91bmRhcnkuXG4gICAqXG4gICAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlIG9mIHRoZSBwb2ludCB0byBjaGVja1xuICAgKiBAcGFyYW0geSAtIFkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gY2hlY2tcbiAgICovXG4gIHB1YmxpYyBjb250YWluc0Nvb3JkaW5hdGVzKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5taW5YIDw9IHggJiYgeCA8PSB0aGlzLm1heFggJiYgdGhpcy5taW5ZIDw9IHkgJiYgeSA8PSB0aGlzLm1heFk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgcG9pbnQgaXMgY29udGFpbmVkIGluc2lkZSB0aGUgYm91bmRpbmcgYm94LCBvciBpcyBvbiB0aGUgYm91bmRhcnkuXG4gICAqL1xuICBwdWJsaWMgY29udGFpbnNQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbnNDb29yZGluYXRlcyggcG9pbnQueCwgcG9pbnQueSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBib3VuZGluZyBib3ggY29tcGxldGVseSBjb250YWlucyB0aGUgYm91bmRpbmcgYm94IHBhc3NlZCBhcyBhIHBhcmFtZXRlci4gVGhlIGJvdW5kYXJ5IG9mIGEgYm94IGlzXG4gICAqIGNvbnNpZGVyZWQgdG8gYmUgXCJjb250YWluZWRcIi5cbiAgICovXG4gIHB1YmxpYyBjb250YWluc0JvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1pblggPD0gYm91bmRzLm1pblggJiYgdGhpcy5tYXhYID49IGJvdW5kcy5tYXhYICYmIHRoaXMubWluWSA8PSBib3VuZHMubWluWSAmJiB0aGlzLm1heFkgPj0gYm91bmRzLm1heFk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGFuZCBhbm90aGVyIGJvdW5kaW5nIGJveCBoYXZlIGFueSBwb2ludHMgb2YgaW50ZXJzZWN0aW9uIChpbmNsdWRpbmcgdG91Y2hpbmcgYm91bmRhcmllcykuXG4gICAqL1xuICBwdWJsaWMgaW50ZXJzZWN0c0JvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1pblggPSBNYXRoLm1heCggdGhpcy5taW5YLCBib3VuZHMubWluWCApO1xuICAgIGNvbnN0IG1pblkgPSBNYXRoLm1heCggdGhpcy5taW5ZLCBib3VuZHMubWluWSApO1xuICAgIGNvbnN0IG1heFggPSBNYXRoLm1pbiggdGhpcy5tYXhYLCBib3VuZHMubWF4WCApO1xuICAgIGNvbnN0IG1heFkgPSBNYXRoLm1pbiggdGhpcy5tYXhZLCBib3VuZHMubWF4WSApO1xuICAgIHJldHVybiAoIG1heFggLSBtaW5YICkgPj0gMCAmJiAoIG1heFkgLSBtaW5ZID49IDAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc3F1YXJlZCBkaXN0YW5jZSBmcm9tIHRoZSBpbnB1dCBwb2ludCB0byB0aGUgcG9pbnQgY2xvc2VzdCB0byBpdCBpbnNpZGUgdGhlIGJvdW5kaW5nIGJveC5cbiAgICovXG4gIHB1YmxpYyBtaW5pbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggcG9pbnQ6IFZlY3RvcjIgKTogbnVtYmVyIHtcbiAgICBjb25zdCBjbG9zZVggPSBwb2ludC54IDwgdGhpcy5taW5YID8gdGhpcy5taW5YIDogKCBwb2ludC54ID4gdGhpcy5tYXhYID8gdGhpcy5tYXhYIDogbnVsbCApO1xuICAgIGNvbnN0IGNsb3NlWSA9IHBvaW50LnkgPCB0aGlzLm1pblkgPyB0aGlzLm1pblkgOiAoIHBvaW50LnkgPiB0aGlzLm1heFkgPyB0aGlzLm1heFkgOiBudWxsICk7XG4gICAgbGV0IGQ7XG4gICAgaWYgKCBjbG9zZVggPT09IG51bGwgJiYgY2xvc2VZID09PSBudWxsICkge1xuICAgICAgLy8gaW5zaWRlLCBvciBvbiB0aGUgYm91bmRhcnlcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBlbHNlIGlmICggY2xvc2VYID09PSBudWxsICkge1xuICAgICAgLy8gdmVydGljYWxseSBkaXJlY3RseSBhYm92ZS9iZWxvd1xuICAgICAgZCA9IGNsb3NlWSEgLSBwb2ludC55O1xuICAgICAgcmV0dXJuIGQgKiBkO1xuICAgIH1cbiAgICBlbHNlIGlmICggY2xvc2VZID09PSBudWxsICkge1xuICAgICAgLy8gaG9yaXpvbnRhbGx5IGRpcmVjdGx5IHRvIHRoZSBsZWZ0L3JpZ2h0XG4gICAgICBkID0gY2xvc2VYIC0gcG9pbnQueDtcbiAgICAgIHJldHVybiBkICogZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBjb3JuZXIgY2FzZVxuICAgICAgY29uc3QgZHggPSBjbG9zZVggLSBwb2ludC54O1xuICAgICAgY29uc3QgZHkgPSBjbG9zZVkgLSBwb2ludC55O1xuICAgICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc3F1YXJlZCBkaXN0YW5jZSBmcm9tIHRoZSBpbnB1dCBwb2ludCB0byB0aGUgcG9pbnQgZnVydGhlc3QgZnJvbSBpdCBpbnNpZGUgdGhlIGJvdW5kaW5nIGJveC5cbiAgICovXG4gIHB1YmxpYyBtYXhpbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggcG9pbnQ6IFZlY3RvcjIgKTogbnVtYmVyIHtcbiAgICBsZXQgeCA9IHBvaW50LnggPiB0aGlzLmdldENlbnRlclgoKSA/IHRoaXMubWluWCA6IHRoaXMubWF4WDtcbiAgICBsZXQgeSA9IHBvaW50LnkgPiB0aGlzLmdldENlbnRlclkoKSA/IHRoaXMubWluWSA6IHRoaXMubWF4WTtcbiAgICB4IC09IHBvaW50Lng7XG4gICAgeSAtPSBwb2ludC55O1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5O1xuICB9XG5cbiAgLyoqXG4gICAqIERlYnVnZ2luZyBzdHJpbmcgZm9yIHRoZSBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFt4Oigke3RoaXMubWluWH0sJHt0aGlzLm1heFh9KSx5Oigke3RoaXMubWluWX0sJHt0aGlzLm1heFl9KV1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4YWN0IGVxdWFsaXR5IGNvbXBhcmlzb24gYmV0d2VlbiB0aGlzIGJvdW5kcyBhbmQgYW5vdGhlciBib3VuZHMuXG4gICAqXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGUgdHdvIGJvdW5kcyBhcmUgZXF1YWxcbiAgICovXG4gIHB1YmxpYyBlcXVhbHMoIG90aGVyOiBCb3VuZHMyICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1pblggPT09IG90aGVyLm1pblggJiYgdGhpcy5taW5ZID09PSBvdGhlci5taW5ZICYmIHRoaXMubWF4WCA9PT0gb3RoZXIubWF4WCAmJiB0aGlzLm1heFkgPT09IG90aGVyLm1heFk7XG4gIH1cblxuICAvKipcbiAgICogQXBwcm94aW1hdGUgZXF1YWxpdHkgY29tcGFyaXNvbiBiZXR3ZWVuIHRoaXMgYm91bmRzIGFuZCBhbm90aGVyIGJvdW5kcy5cbiAgICpcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIGJvdW5kcyBoYXMgbm8gbWluL21heCB3aXRoIGFuIGFic29sdXRlIHZhbHVlIGdyZWF0ZXJcbiAgICogICAgICAgICAgICB0aGFuIGVwc2lsb24uXG4gICAqL1xuICBwdWJsaWMgZXF1YWxzRXBzaWxvbiggb3RoZXI6IEJvdW5kczIsIGVwc2lsb246IG51bWJlciApOiBib29sZWFuIHtcbiAgICBlcHNpbG9uID0gZXBzaWxvbiAhPT0gdW5kZWZpbmVkID8gZXBzaWxvbiA6IDA7XG4gICAgY29uc3QgdGhpc0Zpbml0ZSA9IHRoaXMuaXNGaW5pdGUoKTtcbiAgICBjb25zdCBvdGhlckZpbml0ZSA9IG90aGVyLmlzRmluaXRlKCk7XG4gICAgaWYgKCB0aGlzRmluaXRlICYmIG90aGVyRmluaXRlICkge1xuICAgICAgLy8gYm90aCBhcmUgZmluaXRlLCBzbyB3ZSBjYW4gdXNlIE1hdGguYWJzKCkgLSBpdCB3b3VsZCBmYWlsIHdpdGggbm9uLWZpbml0ZSB2YWx1ZXMgbGlrZSBJbmZpbml0eVxuICAgICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLm1pblggLSBvdGhlci5taW5YICkgPCBlcHNpbG9uICYmXG4gICAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubWluWSAtIG90aGVyLm1pblkgKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tYXhYIC0gb3RoZXIubWF4WCApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm1heFkgLSBvdGhlci5tYXhZICkgPCBlcHNpbG9uO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpc0Zpbml0ZSAhPT0gb3RoZXJGaW5pdGUgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIG9uZSBpcyBmaW5pdGUsIHRoZSBvdGhlciBpcyBub3QuIGRlZmluaXRlbHkgbm90IGVxdWFsXG4gICAgfVxuICAgIGVsc2UgaWYgKCAoIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHMyICkgPT09IG90aGVyICkge1xuICAgICAgcmV0dXJuIHRydWU7IC8vIGV4YWN0IHNhbWUgaW5zdGFuY2UsIG11c3QgYmUgZXF1YWxcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBlcHNpbG9uIG9ubHkgYXBwbGllcyBvbiBmaW5pdGUgZGltZW5zaW9ucy4gZHVlIHRvIEpTJ3MgaGFuZGxpbmcgb2YgaXNGaW5pdGUoKSwgaXQncyBmYXN0ZXIgdG8gY2hlY2sgdGhlIHN1bSBvZiBib3RoXG4gICAgICByZXR1cm4gKCBpc0Zpbml0ZSggdGhpcy5taW5YICsgb3RoZXIubWluWCApID8gKCBNYXRoLmFicyggdGhpcy5taW5YIC0gb3RoZXIubWluWCApIDwgZXBzaWxvbiApIDogKCB0aGlzLm1pblggPT09IG90aGVyLm1pblggKSApICYmXG4gICAgICAgICAgICAgKCBpc0Zpbml0ZSggdGhpcy5taW5ZICsgb3RoZXIubWluWSApID8gKCBNYXRoLmFicyggdGhpcy5taW5ZIC0gb3RoZXIubWluWSApIDwgZXBzaWxvbiApIDogKCB0aGlzLm1pblkgPT09IG90aGVyLm1pblkgKSApICYmXG4gICAgICAgICAgICAgKCBpc0Zpbml0ZSggdGhpcy5tYXhYICsgb3RoZXIubWF4WCApID8gKCBNYXRoLmFicyggdGhpcy5tYXhYIC0gb3RoZXIubWF4WCApIDwgZXBzaWxvbiApIDogKCB0aGlzLm1heFggPT09IG90aGVyLm1heFggKSApICYmXG4gICAgICAgICAgICAgKCBpc0Zpbml0ZSggdGhpcy5tYXhZICsgb3RoZXIubWF4WSApID8gKCBNYXRoLmFicyggdGhpcy5tYXhZIC0gb3RoZXIubWF4WSApIDwgZXBzaWxvbiApIDogKCB0aGlzLm1heFkgPT09IG90aGVyLm1heFkgKSApO1xuICAgIH1cbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBJbW11dGFibGUgb3BlcmF0aW9uc1xuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgYm91bmRzLCBvciBpZiBhIGJvdW5kcyBpcyBwYXNzZWQgaW4sIHNldCB0aGF0IGJvdW5kcydzIHZhbHVlcyB0byBvdXJzLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0KCksIGlmIGEgYm91bmRzIGlzIHByb3ZpZGVkLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kXG4gICAqIHdpbGwgbm90IG1vZGlmeSB0aGlzIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIFtib3VuZHNdIC0gSWYgbm90IHByb3ZpZGVkLCBjcmVhdGVzIGEgbmV3IEJvdW5kczIgd2l0aCBmaWxsZWQgaW4gdmFsdWVzLiBPdGhlcndpc2UsIGZpbGxzIGluIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICB2YWx1ZXMgb2YgdGhlIHByb3ZpZGVkIGJvdW5kcyBzbyB0aGF0IGl0IGVxdWFscyB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBjb3B5KCBib3VuZHM/OiBCb3VuZHMyICk6IEJvdW5kczIge1xuICAgIGlmICggYm91bmRzICkge1xuICAgICAgcmV0dXJuIGJvdW5kcy5zZXQoIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHMyICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIGIyKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5tYXhYLCB0aGlzLm1heFkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIGZhY3RvcnkgbWV0aG9kXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNyZWF0ZSggYm91bmRzOiBCb3VuZHMyTGlrZSApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gYjIoIGJvdW5kcy5taW5YLCBib3VuZHMubWluWSwgYm91bmRzLm1heFgsIGJvdW5kcy5tYXhZICk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNtYWxsZXN0IGJvdW5kcyB0aGF0IGNvbnRhaW5zIGJvdGggdGhpcyBib3VuZHMgYW5kIHRoZSBpbnB1dCBib3VuZHMsIHJldHVybmVkIGFzIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGluY2x1ZGVCb3VuZHMoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgdW5pb24oIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gYjIoXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5YLCBib3VuZHMubWluWCApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgYm91bmRzLm1pblkgKSxcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFgsIGJvdW5kcy5tYXhYICksXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhZLCBib3VuZHMubWF4WSApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc21hbGxlc3QgYm91bmRzIHRoYXQgaXMgY29udGFpbmVkIGJ5IGJvdGggdGhpcyBib3VuZHMgYW5kIHRoZSBpbnB1dCBib3VuZHMsIHJldHVybmVkIGFzIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvbnN0cmFpbkJvdW5kcygpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnNlY3Rpb24oIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gYjIoXG4gICAgICBNYXRoLm1heCggdGhpcy5taW5YLCBib3VuZHMubWluWCApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWluWSwgYm91bmRzLm1pblkgKSxcbiAgICAgIE1hdGgubWluKCB0aGlzLm1heFgsIGJvdW5kcy5tYXhYICksXG4gICAgICBNYXRoLm1pbiggdGhpcy5tYXhZLCBib3VuZHMubWF4WSApXG4gICAgKTtcbiAgfVxuXG4gIC8vIFRPRE86IGRpZmZlcmVuY2Ugc2hvdWxkIGJlIHdlbGwtZGVmaW5lZCwgYnV0IG1vcmUgbG9naWMgaXMgbmVlZGVkIHRvIGNvbXB1dGUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcblxuICAvKipcbiAgICogVGhlIHNtYWxsZXN0IGJvdW5kcyB0aGF0IGNvbnRhaW5zIHRoaXMgYm91bmRzIGFuZCB0aGUgcG9pbnQgKHgseSksIHJldHVybmVkIGFzIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZENvb3JkaW5hdGVzKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHdpdGhDb29yZGluYXRlcyggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGIyKFxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWCwgeCApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgeSApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WCwgeCApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WSwgeSApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc21hbGxlc3QgYm91bmRzIHRoYXQgY29udGFpbnMgdGhpcyBib3VuZHMgYW5kIHRoZSBpbnB1dCBwb2ludCwgcmV0dXJuZWQgYXMgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYWRkUG9pbnQoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgd2l0aFBvaW50KCBwb2ludDogVmVjdG9yMiApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy53aXRoQ29vcmRpbmF0ZXMoIHBvaW50LngsIHBvaW50LnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzbWFsbGVzdCBib3VuZHMgdGhhdCBjb250YWlucyBib3RoIHRoaXMgYm91bmRzIGFuZCB0aGUgeCB2YWx1ZSBwcm92aWRlZC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZFgoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgd2l0aFgoIHg6IG51bWJlciApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5KCkuYWRkWCggeCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNtYWxsZXN0IGJvdW5kcyB0aGF0IGNvbnRhaW5zIGJvdGggdGhpcyBib3VuZHMgYW5kIHRoZSB5IHZhbHVlIHByb3ZpZGVkLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYWRkWSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyB3aXRoWSggeTogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmNvcHkoKS5hZGRZKCB5ICk7XG4gIH1cblxuICAvKipcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1pblggcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNaW5YKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHdpdGhNaW5YKCBtaW5YOiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGIyKCBtaW5YLCB0aGlzLm1pblksIHRoaXMubWF4WCwgdGhpcy5tYXhZICk7XG4gIH1cblxuICAvKipcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1pblkgcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNaW5ZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHdpdGhNaW5ZKCBtaW5ZOiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGIyKCB0aGlzLm1pblgsIG1pblksIHRoaXMubWF4WCwgdGhpcy5tYXhZICk7XG4gIH1cblxuICAvKipcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1heFggcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNYXhYKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHdpdGhNYXhYKCBtYXhYOiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGIyKCB0aGlzLm1pblgsIHRoaXMubWluWSwgbWF4WCwgdGhpcy5tYXhZICk7XG4gIH1cblxuICAvKipcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1heFkgcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNYXhZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHdpdGhNYXhZKCBtYXhZOiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGIyKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5tYXhYLCBtYXhZICk7XG4gIH1cblxuICAvKipcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIHRoZSBtaW5pbXVtIHZhbHVlcyByb3VuZGVkIGRvd24gdG8gdGhlIG5lYXJlc3QgaW50ZWdlciwgYW5kIHRoZSBtYXhpbXVtIHZhbHVlc1xuICAgKiByb3VuZGVkIHVwIHRvIHRoZSBuZWFyZXN0IGludGVnZXIuIFRoaXMgY2F1c2VzIHRoZSBib3VuZHMgdG8gZXhwYW5kIGFzIG5lY2Vzc2FyeSBzbyB0aGF0IGl0cyBib3VuZGFyaWVzXG4gICAqIGFyZSBpbnRlZ2VyLWFsaWduZWQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiByb3VuZE91dCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyByb3VuZGVkT3V0KCk6IEJvdW5kczIge1xuICAgIHJldHVybiBiMihcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWluWCApLFxuICAgICAgTWF0aC5mbG9vciggdGhpcy5taW5ZICksXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWF4WCApLFxuICAgICAgTWF0aC5jZWlsKCB0aGlzLm1heFkgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIHRoZSBtaW5pbXVtIHZhbHVlcyByb3VuZGVkIHVwIHRvIHRoZSBuZWFyZXN0IGludGVnZXIsIGFuZCB0aGUgbWF4aW11bSB2YWx1ZXNcbiAgICogcm91bmRlZCBkb3duIHRvIHRoZSBuZWFyZXN0IGludGVnZXIuIFRoaXMgY2F1c2VzIHRoZSBib3VuZHMgdG8gY29udHJhY3QgYXMgbmVjZXNzYXJ5IHNvIHRoYXQgaXRzIGJvdW5kYXJpZXNcbiAgICogYXJlIGludGVnZXItYWxpZ25lZC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHJvdW5kSW4oKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgcm91bmRlZEluKCk6IEJvdW5kczIge1xuICAgIHJldHVybiBiMihcbiAgICAgIE1hdGguY2VpbCggdGhpcy5taW5YICksXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWluWSApLFxuICAgICAgTWF0aC5mbG9vciggdGhpcy5tYXhYICksXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1heFkgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQSBib3VuZGluZyBib3ggKHN0aWxsIGF4aXMtYWxpZ25lZCkgdGhhdCBjb250YWlucyB0aGUgdHJhbnNmb3JtZWQgc2hhcGUgb2YgdGhpcyBib3VuZHMsIGFwcGx5aW5nIHRoZSBtYXRyaXggYXNcbiAgICogYW4gYWZmaW5lIHRyYW5zZm9ybWF0aW9uLlxuICAgKlxuICAgKiBOT1RFOiBib3VuZHMudHJhbnNmb3JtZWQoIG1hdHJpeCApLnRyYW5zZm9ybWVkKCBpbnZlcnNlICkgbWF5IGJlIGxhcmdlciB0aGFuIHRoZSBvcmlnaW5hbCBib3gsIGlmIGl0IGluY2x1ZGVzXG4gICAqIGEgcm90YXRpb24gdGhhdCBpc24ndCBhIG11bHRpcGxlIG9mICRcXHBpLzIkLiBUaGlzIGlzIGJlY2F1c2UgdGhlIHJldHVybmVkIGJvdW5kcyBtYXkgZXhwYW5kIGluIGFyZWEgdG8gY292ZXJcbiAgICogQUxMIG9mIHRoZSBjb3JuZXJzIG9mIHRoZSB0cmFuc2Zvcm1lZCBib3VuZGluZyBib3guXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB0cmFuc2Zvcm0oKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgdHJhbnNmb3JtZWQoIG1hdHJpeDogTWF0cml4MyApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5KCkudHJhbnNmb3JtKCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGV4cGFuZGVkIG9uIGFsbCBzaWRlcyBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC4pXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZGlsYXRlZCggZDogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmRpbGF0ZWRYWSggZCwgZCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgZXhwYW5kZWQgaG9yaXpvbnRhbGx5IChvbiB0aGUgbGVmdCBhbmQgcmlnaHQpIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlWCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBkaWxhdGVkWCggeDogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHJldHVybiBiMiggdGhpcy5taW5YIC0geCwgdGhpcy5taW5ZLCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGV4cGFuZGVkIHZlcnRpY2FsbHkgKG9uIHRoZSB0b3AgYW5kIGJvdHRvbSkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZWRZKCB5OiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGIyKCB0aGlzLm1pblgsIHRoaXMubWluWSAtIHksIHRoaXMubWF4WCwgdGhpcy5tYXhZICsgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgZXhwYW5kZWQgb24gYWxsIHNpZGVzLCB3aXRoIGRpZmZlcmVudCBhbW91bnRzIG9mIGV4cGFuc2lvbiBob3Jpem9udGFsbHkgYW5kIHZlcnRpY2FsbHkuXG4gICAqIFdpbGwgYmUgaWRlbnRpY2FsIHRvIHRoZSBib3VuZHMgcmV0dXJuZWQgYnkgY2FsbGluZyBib3VuZHMuZGlsYXRlZFgoIHggKS5kaWxhdGVkWSggeSApLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlWFkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqXG4gICAqIEBwYXJhbSB4IC0gQW1vdW50IHRvIGRpbGF0ZSBob3Jpem9udGFsbHkgKGZvciBlYWNoIHNpZGUpXG4gICAqIEBwYXJhbSB5IC0gQW1vdW50IHRvIGRpbGF0ZSB2ZXJ0aWNhbGx5IChmb3IgZWFjaCBzaWRlKVxuICAgKi9cbiAgcHVibGljIGRpbGF0ZWRYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGIyKCB0aGlzLm1pblggLSB4LCB0aGlzLm1pblkgLSB5LCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKyB5ICk7XG4gIH1cblxuICAvKipcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBjb250cmFjdGVkIG9uIGFsbCBzaWRlcyBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGVyb2RlZCggYW1vdW50OiBudW1iZXIgKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmRpbGF0ZWQoIC1hbW91bnQgKTsgfVxuXG4gIC8qKlxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGNvbnRyYWN0ZWQgaG9yaXpvbnRhbGx5IChvbiB0aGUgbGVmdCBhbmQgcmlnaHQpIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGVYKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGVyb2RlZFgoIHg6IG51bWJlciApOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZGlsYXRlZFgoIC14ICk7IH1cblxuICAvKipcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBjb250cmFjdGVkIHZlcnRpY2FsbHkgKG9uIHRoZSB0b3AgYW5kIGJvdHRvbSkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBlcm9kZVkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZXJvZGVkWSggeTogbnVtYmVyICk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5kaWxhdGVkWSggLXkgKTsgfVxuXG4gIC8qKlxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGNvbnRyYWN0ZWQgb24gYWxsIHNpZGVzLCB3aXRoIGRpZmZlcmVudCBhbW91bnRzIG9mIGNvbnRyYWN0aW9uIGhvcml6b250YWxseSBhbmQgdmVydGljYWxseS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlWFkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqXG4gICAqIEBwYXJhbSB4IC0gQW1vdW50IHRvIGVyb2RlIGhvcml6b250YWxseSAoZm9yIGVhY2ggc2lkZSlcbiAgICogQHBhcmFtIHkgLSBBbW91bnQgdG8gZXJvZGUgdmVydGljYWxseSAoZm9yIGVhY2ggc2lkZSlcbiAgICovXG4gIHB1YmxpYyBlcm9kZWRYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmRpbGF0ZWRYWSggLXgsIC15ICk7IH1cblxuICAvKipcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBleHBhbmRlZCBieSBhIHNwZWNpZmljIGFtb3VudCBvbiBhbGwgc2lkZXMgKG9yIGlmIHNvbWUgb2Zmc2V0cyBhcmUgbmVnYXRpdmUsIHdpbGwgY29udHJhY3RcbiAgICogdGhvc2Ugc2lkZXMpLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gb2Zmc2V0KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKlxuICAgKiBAcGFyYW0gbGVmdCAtIEFtb3VudCB0byBleHBhbmQgdG8gdGhlIGxlZnQgKHN1YnRyYWN0cyBmcm9tIG1pblgpXG4gICAqIEBwYXJhbSB0b3AgLSBBbW91bnQgdG8gZXhwYW5kIHRvIHRoZSB0b3AgKHN1YnRyYWN0cyBmcm9tIG1pblkpXG4gICAqIEBwYXJhbSByaWdodCAtIEFtb3VudCB0byBleHBhbmQgdG8gdGhlIHJpZ2h0IChhZGRzIHRvIG1heFgpXG4gICAqIEBwYXJhbSBib3R0b20gLSBBbW91bnQgdG8gZXhwYW5kIHRvIHRoZSBib3R0b20gKGFkZHMgdG8gbWF4WSlcbiAgICovXG4gIHB1YmxpYyB3aXRoT2Zmc2V0cyggbGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlciwgYm90dG9tOiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGIyKCB0aGlzLm1pblggLSBsZWZ0LCB0aGlzLm1pblkgLSB0b3AsIHRoaXMubWF4WCArIHJpZ2h0LCB0aGlzLm1heFkgKyBib3R0b20gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdXIgYm91bmRzLCB0cmFuc2xhdGVkIGhvcml6b250YWxseSBieSB4LCByZXR1cm5lZCBhcyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdFgoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2hpZnRlZFgoIHg6IG51bWJlciApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gYjIoIHRoaXMubWluWCArIHgsIHRoaXMubWluWSwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZICk7XG4gIH1cblxuICAvKipcbiAgICogT3VyIGJvdW5kcywgdHJhbnNsYXRlZCB2ZXJ0aWNhbGx5IGJ5IHksIHJldHVybmVkIGFzIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNoaWZ0WSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBzaGlmdGVkWSggeTogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHJldHVybiBiMiggdGhpcy5taW5YLCB0aGlzLm1pblkgKyB5LCB0aGlzLm1heFgsIHRoaXMubWF4WSArIHkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdXIgYm91bmRzLCB0cmFuc2xhdGVkIGJ5ICh4LHkpLCByZXR1cm5lZCBhcyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBzaGlmdGVkWFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHJldHVybiBiMiggdGhpcy5taW5YICsgeCwgdGhpcy5taW5ZICsgeSwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZICsgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgb3VyIGJvdW5kcywgdHJhbnNsYXRlZCBieSBhIHZlY3RvciwgcmV0dXJuZWQgYXMgYSBjb3B5LlxuICAgKi9cbiAgcHVibGljIHNoaWZ0ZWQoIHY6IFZlY3RvcjIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuc2hpZnRlZFhZKCB2LngsIHYueSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaW50ZXJwb2xhdGVkIHZhbHVlIG9mIHRoaXMgYm91bmRzIGFuZCB0aGUgYXJndW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSBib3VuZHNcbiAgICogQHBhcmFtIHJhdGlvIC0gMCB3aWxsIHJlc3VsdCBpbiBhIGNvcHkgb2YgYHRoaXNgLCAxIHdpbGwgcmVzdWx0IGluIGJvdW5kcywgYW5kIGluLWJldHdlZW4gY29udHJvbHMgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgIGFtb3VudCBvZiBlYWNoLlxuICAgKi9cbiAgcHVibGljIGJsZW5kKCBib3VuZHM6IEJvdW5kczIsIHJhdGlvOiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgY29uc3QgdCA9IDEgLSByYXRpbztcbiAgICByZXR1cm4gYjIoXG4gICAgICB0ICogdGhpcy5taW5YICsgcmF0aW8gKiBib3VuZHMubWluWCxcbiAgICAgIHQgKiB0aGlzLm1pblkgKyByYXRpbyAqIGJvdW5kcy5taW5ZLFxuICAgICAgdCAqIHRoaXMubWF4WCArIHJhdGlvICogYm91bmRzLm1heFgsXG4gICAgICB0ICogdGhpcy5tYXhZICsgcmF0aW8gKiBib3VuZHMubWF4WVxuICAgICk7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogTXV0YWJsZSBvcGVyYXRpb25zXG4gICAqXG4gICAqIEFsbCBtdXRhYmxlIG9wZXJhdGlvbnMgc2hvdWxkIGNhbGwgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG4gICAqICAgc2V0TWluTWF4LCBzZXRNaW5YLCBzZXRNaW5ZLCBzZXRNYXhYLCBzZXRNYXhZXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogU2V0cyBlYWNoIHZhbHVlIGZvciB0aGlzIGJvdW5kcywgYW5kIHJldHVybnMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNldE1pbk1heCggbWluWDogbnVtYmVyLCBtaW5ZOiBudW1iZXIsIG1heFg6IG51bWJlciwgbWF4WTogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHRoaXMubWluWCA9IG1pblg7XG4gICAgdGhpcy5taW5ZID0gbWluWTtcbiAgICB0aGlzLm1heFggPSBtYXhYO1xuICAgIHRoaXMubWF4WSA9IG1heFk7XG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBtaW5YLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNaW5YKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWluWCggbWluWDogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHRoaXMubWluWCA9IG1pblg7XG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBtaW5ZLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNaW5ZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWluWSggbWluWTogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHRoaXMubWluWSA9IG1pblk7XG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBtYXhYLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNYXhYKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWF4WCggbWF4WDogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHRoaXMubWF4WCA9IG1heFg7XG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBtYXhZLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNYXhZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWF4WSggbWF4WTogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHRoaXMubWF4WSA9IG1heFk7XG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZXMgb2YgdGhpcyBib3VuZHMgdG8gYmUgZXF1YWwgdG8gdGhlIGlucHV0IGJvdW5kcy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBjb3B5KCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0KCBib3VuZHM6IEJvdW5kczJMaWtlICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggYm91bmRzLm1pblgsIGJvdW5kcy5taW5ZLCBib3VuZHMubWF4WCwgYm91bmRzLm1heFkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IGNvbnRhaW5zIGJvdGggaXRzIG9yaWdpbmFsIGJvdW5kcyBhbmQgdGhlIGlucHV0IGJvdW5kcy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB1bmlvbigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGluY2x1ZGVCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5YLCBib3VuZHMubWluWCApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgYm91bmRzLm1pblkgKSxcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFgsIGJvdW5kcy5tYXhYICksXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhZLCBib3VuZHMubWF4WSApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IGlzIHRoZSBsYXJnZXN0IGJvdW5kcyBjb250YWluZWQgYm90aCBpbiBpdHMgb3JpZ2luYWwgYm91bmRzIGFuZCBpbiB0aGUgaW5wdXQgYm91bmRzLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGludGVyc2VjdGlvbigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cmFpbkJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heChcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1pblgsIGJvdW5kcy5taW5YICksXG4gICAgICBNYXRoLm1heCggdGhpcy5taW5ZLCBib3VuZHMubWluWSApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWF4WCwgYm91bmRzLm1heFggKSxcbiAgICAgIE1hdGgubWluKCB0aGlzLm1heFksIGJvdW5kcy5tYXhZIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoaXMgYm91bmRzIHNvIHRoYXQgaXQgY29udGFpbnMgYm90aCBpdHMgb3JpZ2luYWwgYm91bmRzIGFuZCB0aGUgaW5wdXQgcG9pbnQgKHgseSkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gd2l0aENvb3JkaW5hdGVzKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgYWRkQ29vcmRpbmF0ZXMoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heChcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblgsIHggKSxcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblksIHkgKSxcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFgsIHggKSxcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFksIHkgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhpcyBib3VuZHMgc28gdGhhdCBpdCBjb250YWlucyBib3RoIGl0cyBvcmlnaW5hbCBib3VuZHMgYW5kIHRoZSBpbnB1dCBwb2ludC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoUG9pbnQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBhZGRQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuYWRkQ29vcmRpbmF0ZXMoIHBvaW50LngsIHBvaW50LnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IGlzIGd1YXJhbnRlZWQgdG8gaW5jbHVkZSB0aGUgZ2l2ZW4geCB2YWx1ZSAoaWYgaXQgZGlkbid0IGFscmVhZHkpLiBJZiB0aGUgeCB2YWx1ZVxuICAgKiB3YXMgYWxyZWFkeSBjb250YWluZWQsIG5vdGhpbmcgd2lsbCBiZSBkb25lLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhYKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgYWRkWCggeDogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHRoaXMubWluWCA9IE1hdGgubWluKCB4LCB0aGlzLm1pblggKTtcbiAgICB0aGlzLm1heFggPSBNYXRoLm1heCggeCwgdGhpcy5tYXhYICk7XG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IGlzIGd1YXJhbnRlZWQgdG8gaW5jbHVkZSB0aGUgZ2l2ZW4geSB2YWx1ZSAoaWYgaXQgZGlkbid0IGFscmVhZHkpLiBJZiB0aGUgeSB2YWx1ZVxuICAgKiB3YXMgYWxyZWFkeSBjb250YWluZWQsIG5vdGhpbmcgd2lsbCBiZSBkb25lLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgYWRkWSggeTogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHRoaXMubWluWSA9IE1hdGgubWluKCB5LCB0aGlzLm1pblkgKTtcbiAgICB0aGlzLm1heFkgPSBNYXRoLm1heCggeSwgdGhpcy5tYXhZICk7XG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0cyBib3VuZGFyaWVzIGFyZSBpbnRlZ2VyLWFsaWduZWQsIHJvdW5kaW5nIHRoZSBtaW5pbXVtIGJvdW5kYXJpZXMgZG93biBhbmQgdGhlXG4gICAqIG1heGltdW0gYm91bmRhcmllcyB1cCAoZXhwYW5kaW5nIGFzIG5lY2Vzc2FyeSkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRlZE91dCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHJvdW5kT3V0KCk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heChcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWluWCApLFxuICAgICAgTWF0aC5mbG9vciggdGhpcy5taW5ZICksXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWF4WCApLFxuICAgICAgTWF0aC5jZWlsKCB0aGlzLm1heFkgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhpcyBib3VuZHMgc28gdGhhdCBpdHMgYm91bmRhcmllcyBhcmUgaW50ZWdlci1hbGlnbmVkLCByb3VuZGluZyB0aGUgbWluaW11bSBib3VuZGFyaWVzIHVwIGFuZCB0aGVcbiAgICogbWF4aW11bSBib3VuZGFyaWVzIGRvd24gKGNvbnRyYWN0aW5nIGFzIG5lY2Vzc2FyeSkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRlZEluKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgcm91bmRJbigpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWluWCApLFxuICAgICAgTWF0aC5jZWlsKCB0aGlzLm1pblkgKSxcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWF4WCApLFxuICAgICAgTWF0aC5mbG9vciggdGhpcy5tYXhZIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoaXMgYm91bmRzIHNvIHRoYXQgaXQgd291bGQgZnVsbHkgY29udGFpbiBhIHRyYW5zZm9ybWVkIHZlcnNpb24gaWYgaXRzIHByZXZpb3VzIHZhbHVlLCBhcHBseWluZyB0aGVcbiAgICogbWF0cml4IGFzIGFuIGFmZmluZSB0cmFuc2Zvcm1hdGlvbi5cbiAgICpcbiAgICogTk9URTogYm91bmRzLnRyYW5zZm9ybSggbWF0cml4ICkudHJhbnNmb3JtKCBpbnZlcnNlICkgbWF5IGJlIGxhcmdlciB0aGFuIHRoZSBvcmlnaW5hbCBib3gsIGlmIGl0IGluY2x1ZGVzXG4gICAqIGEgcm90YXRpb24gdGhhdCBpc24ndCBhIG11bHRpcGxlIG9mICRcXHBpLzIkLiBUaGlzIGlzIGJlY2F1c2UgdGhlIGJvdW5kcyBtYXkgZXhwYW5kIGluIGFyZWEgdG8gY292ZXJcbiAgICogQUxMIG9mIHRoZSBjb3JuZXJzIG9mIHRoZSB0cmFuc2Zvcm1lZCBib3VuZGluZyBib3guXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gdHJhbnNmb3JtZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyB0cmFuc2Zvcm0oIG1hdHJpeDogTWF0cml4MyApOiBCb3VuZHMyIHtcbiAgICAvLyBpZiB3ZSBjb250YWluIG5vIGFyZWEsIG5vIGNoYW5nZSBpcyBuZWVkZWRcbiAgICBpZiAoIHRoaXMuaXNFbXB0eSgpICkge1xuICAgICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcbiAgICB9XG5cbiAgICAvLyBvcHRpbWl6YXRpb24gdG8gYmFpbCBmb3IgaWRlbnRpdHkgbWF0cmljZXNcbiAgICBpZiAoIG1hdHJpeC5pc0lkZW50aXR5KCkgKSB7XG4gICAgICByZXR1cm4gKCB0aGlzIGFzIHVua25vd24gYXMgQm91bmRzMiApO1xuICAgIH1cblxuICAgIGNvbnN0IG1pblggPSB0aGlzLm1pblg7XG4gICAgY29uc3QgbWluWSA9IHRoaXMubWluWTtcbiAgICBjb25zdCBtYXhYID0gdGhpcy5tYXhYO1xuICAgIGNvbnN0IG1heFkgPSB0aGlzLm1heFk7XG4gICAgdGhpcy5zZXQoIEJvdW5kczIuTk9USElORyApO1xuXG4gICAgLy8gdXNpbmcgbXV0YWJsZSB2ZWN0b3Igc28gd2UgZG9uJ3QgY3JlYXRlIGV4Y2Vzc2l2ZSBpbnN0YW5jZXMgb2YgVmVjdG9yMiBkdXJpbmcgdGhpc1xuICAgIC8vIG1ha2Ugc3VyZSBhbGwgNCBjb3JuZXJzIGFyZSBpbnNpZGUgdGhpcyB0cmFuc2Zvcm1lZCBib3VuZGluZyBib3hcblxuICAgIHRoaXMuYWRkUG9pbnQoIG1hdHJpeC5tdWx0aXBseVZlY3RvcjIoIHNjcmF0Y2hWZWN0b3IyLnNldFhZKCBtaW5YLCBtaW5ZICkgKSApO1xuICAgIHRoaXMuYWRkUG9pbnQoIG1hdHJpeC5tdWx0aXBseVZlY3RvcjIoIHNjcmF0Y2hWZWN0b3IyLnNldFhZKCBtaW5YLCBtYXhZICkgKSApO1xuICAgIHRoaXMuYWRkUG9pbnQoIG1hdHJpeC5tdWx0aXBseVZlY3RvcjIoIHNjcmF0Y2hWZWN0b3IyLnNldFhZKCBtYXhYLCBtaW5ZICkgKSApO1xuICAgIHRoaXMuYWRkUG9pbnQoIG1hdHJpeC5tdWx0aXBseVZlY3RvcjIoIHNjcmF0Y2hWZWN0b3IyLnNldFhZKCBtYXhYLCBtYXhZICkgKSApO1xuICAgIHJldHVybiAoIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHMyICk7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyB0aGlzIGJvdW5kcyBvbiBhbGwgc2lkZXMgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlZCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZSggZDogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmRpbGF0ZVhZKCBkLCBkICk7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyB0aGlzIGJvdW5kcyBob3Jpem9udGFsbHkgKGxlZnQgYW5kIHJpZ2h0KSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVkWCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZVgoIHg6IG51bWJlciApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCAtIHgsIHRoaXMubWluWSwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZICk7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyB0aGlzIGJvdW5kcyB2ZXJ0aWNhbGx5ICh0b3AgYW5kIGJvdHRvbSkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlZFkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBkaWxhdGVZKCB5OiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCB0aGlzLm1pblgsIHRoaXMubWluWSAtIHksIHRoaXMubWF4WCwgdGhpcy5tYXhZICsgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgdGhpcyBib3VuZHMgaW5kZXBlbmRlbnRseSBpbiB0aGUgaG9yaXpvbnRhbCBhbmQgdmVydGljYWwgZGlyZWN0aW9ucy4gV2lsbCBiZSBlcXVhbCB0byBjYWxsaW5nXG4gICAqIGJvdW5kcy5kaWxhdGVYKCB4ICkuZGlsYXRlWSggeSApLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZWRYWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZVhZKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCAtIHgsIHRoaXMubWluWSAtIHksIHRoaXMubWF4WCArIHgsIHRoaXMubWF4WSArIHkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb250cmFjdHMgdGhpcyBib3VuZHMgb24gYWxsIHNpZGVzIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlZCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGVyb2RlKCBkOiBudW1iZXIgKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmRpbGF0ZSggLWQgKTsgfVxuXG4gIC8qKlxuICAgKiBDb250cmFjdHMgdGhpcyBib3VuZHMgaG9yaXpvbnRhbGx5IChsZWZ0IGFuZCByaWdodCkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGVkWCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGVyb2RlWCggeDogbnVtYmVyICk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5kaWxhdGVYKCAteCApOyB9XG5cbiAgLyoqXG4gICAqIENvbnRyYWN0cyB0aGlzIGJvdW5kcyB2ZXJ0aWNhbGx5ICh0b3AgYW5kIGJvdHRvbSkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGVkWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGVyb2RlWSggeTogbnVtYmVyICk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5kaWxhdGVZKCAteSApOyB9XG5cbiAgLyoqXG4gICAqIENvbnRyYWN0cyB0aGlzIGJvdW5kcyBpbmRlcGVuZGVudGx5IGluIHRoZSBob3Jpem9udGFsIGFuZCB2ZXJ0aWNhbCBkaXJlY3Rpb25zLiBXaWxsIGJlIGVxdWFsIHRvIGNhbGxpbmdcbiAgICogYm91bmRzLmVyb2RlWCggeCApLmVyb2RlWSggeSApLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlZFhZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgZXJvZGVYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmRpbGF0ZVhZKCAteCwgLXkgKTsgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIHRoaXMgYm91bmRzIGluZGVwZW5kZW50bHkgZm9yIGVhY2ggc2lkZSAob3IgaWYgc29tZSBvZmZzZXRzIGFyZSBuZWdhdGl2ZSwgd2lsbCBjb250cmFjdCB0aG9zZSBzaWRlcykuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gd2l0aE9mZnNldHMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICpcbiAgICogQHBhcmFtIGxlZnQgLSBBbW91bnQgdG8gZXhwYW5kIHRvIHRoZSBsZWZ0IChzdWJ0cmFjdHMgZnJvbSBtaW5YKVxuICAgKiBAcGFyYW0gdG9wIC0gQW1vdW50IHRvIGV4cGFuZCB0byB0aGUgdG9wIChzdWJ0cmFjdHMgZnJvbSBtaW5ZKVxuICAgKiBAcGFyYW0gcmlnaHQgLSBBbW91bnQgdG8gZXhwYW5kIHRvIHRoZSByaWdodCAoYWRkcyB0byBtYXhYKVxuICAgKiBAcGFyYW0gYm90dG9tIC0gQW1vdW50IHRvIGV4cGFuZCB0byB0aGUgYm90dG9tIChhZGRzIHRvIG1heFkpXG4gICAqL1xuICBwdWJsaWMgb2Zmc2V0KCBsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCByaWdodDogbnVtYmVyLCBib3R0b206IG51bWJlciApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gYjIoIHRoaXMubWluWCAtIGxlZnQsIHRoaXMubWluWSAtIHRvcCwgdGhpcy5tYXhYICsgcmlnaHQsIHRoaXMubWF4WSArIGJvdHRvbSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZXMgb3VyIGJvdW5kcyBob3Jpem9udGFsbHkgYnkgeC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdGVkWCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNoaWZ0WCggeDogbnVtYmVyICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YICsgeCwgdGhpcy5taW5ZLCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2xhdGVzIG91ciBib3VuZHMgdmVydGljYWxseSBieSB5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNoaWZ0ZWRZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2hpZnRZKCB5OiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCB0aGlzLm1pblgsIHRoaXMubWluWSArIHksIHRoaXMubWF4WCwgdGhpcy5tYXhZICsgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZXMgb3VyIGJvdW5kcyBieSAoeCx5KS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdGVkKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2hpZnRYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCB0aGlzLm1pblggKyB4LCB0aGlzLm1pblkgKyB5LCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKyB5ICk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlcyBvdXIgYm91bmRzIGJ5IHRoZSBnaXZlbiB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgc2hpZnQoIHY6IFZlY3RvcjIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuc2hpZnRYWSggdi54LCB2LnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByYW5nZSBvZiB0aGUgeC12YWx1ZXMgb2YgdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0WFJhbmdlKCk6IFJhbmdlIHtcbiAgICByZXR1cm4gbmV3IFJhbmdlKCB0aGlzLm1pblgsIHRoaXMubWF4WCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHgtcmFuZ2Ugb2YgdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2V0WFJhbmdlKCByYW5nZTogUmFuZ2UgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCByYW5nZS5taW4sIHRoaXMubWluWSwgcmFuZ2UubWF4LCB0aGlzLm1heFkgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgeFJhbmdlKCk6IFJhbmdlIHsgcmV0dXJuIHRoaXMuZ2V0WFJhbmdlKCk7IH1cblxuICBwdWJsaWMgc2V0IHhSYW5nZSggcmFuZ2U6IFJhbmdlICkgeyB0aGlzLnNldFhSYW5nZSggcmFuZ2UgKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByYW5nZSBvZiB0aGUgeS12YWx1ZXMgb2YgdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0WVJhbmdlKCk6IFJhbmdlIHtcbiAgICByZXR1cm4gbmV3IFJhbmdlKCB0aGlzLm1pblksIHRoaXMubWF4WSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHktcmFuZ2Ugb2YgdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2V0WVJhbmdlKCByYW5nZTogUmFuZ2UgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCB0aGlzLm1pblgsIHJhbmdlLm1pbiwgdGhpcy5tYXhYLCByYW5nZS5tYXggKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgeVJhbmdlKCk6IFJhbmdlIHsgcmV0dXJuIHRoaXMuZ2V0WVJhbmdlKCk7IH1cblxuICBwdWJsaWMgc2V0IHlSYW5nZSggcmFuZ2U6IFJhbmdlICkgeyB0aGlzLnNldFlSYW5nZSggcmFuZ2UgKTsgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGEgcG9pbnQgaW4gdGhlIGJvdW5kcyBjbG9zZXN0IHRvIHRoZSBzcGVjaWZpZWQgcG9pbnQuXG4gICAqXG4gICAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlIG9mIHRoZSBwb2ludCB0byB0ZXN0LlxuICAgKiBAcGFyYW0geSAtIFkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gdGVzdC5cbiAgICogQHBhcmFtIFtyZXN1bHRdIC0gVmVjdG9yMiB0aGF0IGNhbiBzdG9yZSB0aGUgcmV0dXJuIHZhbHVlIHRvIGF2b2lkIGFsbG9jYXRpb25zLlxuICAgKi9cbiAgcHVibGljIGdldENsb3Nlc3RQb2ludCggeDogbnVtYmVyLCB5OiBudW1iZXIsIHJlc3VsdD86IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgaWYgKCByZXN1bHQgKSB7XG4gICAgICByZXN1bHQuc2V0WFkoIHgsIHkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXN1bHQgPSBuZXcgVmVjdG9yMiggeCwgeSApO1xuICAgIH1cbiAgICBpZiAoIHJlc3VsdC54IDwgdGhpcy5taW5YICkgeyByZXN1bHQueCA9IHRoaXMubWluWDsgfVxuICAgIGlmICggcmVzdWx0LnggPiB0aGlzLm1heFggKSB7IHJlc3VsdC54ID0gdGhpcy5tYXhYOyB9XG4gICAgaWYgKCByZXN1bHQueSA8IHRoaXMubWluWSApIHsgcmVzdWx0LnkgPSB0aGlzLm1pblk7IH1cbiAgICBpZiAoIHJlc3VsdC55ID4gdGhpcy5tYXhZICkgeyByZXN1bHQueSA9IHRoaXMubWF4WTsgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcbiAgICBCb3VuZHMyLnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIEJvdW5kczIsIHtcbiAgICBtYXhTaXplOiAxMDAwLFxuICAgIGluaXRpYWxpemU6IEJvdW5kczIucHJvdG90eXBlLnNldE1pbk1heCxcbiAgICBkZWZhdWx0QXJndW1lbnRzOiBbIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSBdXG4gIH0gKTtcblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBCb3VuZHMyIG9iamVjdCwgd2l0aCB0aGUgZmFtaWxpYXIgcmVjdGFuZ2xlIGNvbnN0cnVjdGlvbiB3aXRoIHgsIHksIHdpZHRoLCBhbmQgaGVpZ2h0LlxuICAgKlxuICAgKiBAcGFyYW0geCAtIFRoZSBtaW5pbXVtIHZhbHVlIG9mIFggZm9yIHRoZSBib3VuZHMuXG4gICAqIEBwYXJhbSB5IC0gVGhlIG1pbmltdW0gdmFsdWUgb2YgWSBmb3IgdGhlIGJvdW5kcy5cbiAgICogQHBhcmFtIHdpZHRoIC0gVGhlIHdpZHRoIChtYXhYIC0gbWluWCkgb2YgdGhlIGJvdW5kcy5cbiAgICogQHBhcmFtIGhlaWdodCAtIFRoZSBoZWlnaHQgKG1heFkgLSBtaW5ZKSBvZiB0aGUgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWN0KCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGIyKCB4LCB5LCB4ICsgd2lkdGgsIHkgKyBoZWlnaHQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IEJvdW5kczIgb2JqZWN0IHdpdGggYSBnaXZlbiBvcmllbnRhdGlvbiAobWluL21heCBzcGVjaWZpZWQgZm9yIGJvdGggdGhlIGdpdmVuIChwcmltYXJ5KSBvcmllbnRhdGlvbixcbiAgICogYW5kIGFsc28gdGhlIHNlY29uZGFyeSBvcmllbnRhdGlvbikuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG9yaWVudGVkKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24sIG1pblByaW1hcnk6IG51bWJlciwgbWluU2Vjb25kYXJ5OiBudW1iZXIsIG1heFByaW1hcnk6IG51bWJlciwgbWF4U2Vjb25kYXJ5OiBudW1iZXIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gbmV3IEJvdW5kczIoXG4gICAgICBtaW5QcmltYXJ5LFxuICAgICAgbWluU2Vjb25kYXJ5LFxuICAgICAgbWF4UHJpbWFyeSxcbiAgICAgIG1heFNlY29uZGFyeVxuICAgICkgOiBuZXcgQm91bmRzMihcbiAgICAgIG1pblNlY29uZGFyeSxcbiAgICAgIG1pblByaW1hcnksXG4gICAgICBtYXhTZWNvbmRhcnksXG4gICAgICBtYXhQcmltYXJ5XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IEJvdW5kczIgb2JqZWN0IHRoYXQgb25seSBjb250YWlucyB0aGUgc3BlY2lmaWVkIHBvaW50ICh4LHkpLiBVc2VmdWwgZm9yIGJlaW5nIGRpbGF0ZWQgdG8gZm9ybSBhXG4gICAqIGJvdW5kaW5nIGJveCBhcm91bmQgYSBwb2ludC4gTm90ZSB0aGF0IHRoZSBib3VuZHMgd2lsbCBub3QgYmUgXCJlbXB0eVwiIGFzIGl0IGNvbnRhaW5zICh4LHkpLCBidXQgaXQgd2lsbCBoYXZlXG4gICAqIHplcm8gYXJlYS4gVGhlIHggYW5kIHkgY29vcmRpbmF0ZXMgY2FuIGJlIHNwZWNpZmllZCBieSBudW1iZXJzIG9yIHdpdGggYXQgVmVjdG9yMlxuICAgKlxuICAgKiBAcGFyYW0geFxuICAgKiBAcGFyYW0geVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwb2ludCggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMjtcbiAgc3RhdGljIHBvaW50KCB2OiBWZWN0b3IyICk6IEJvdW5kczI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XG4gIHN0YXRpYyBwb2ludCggeDogVmVjdG9yMiB8IG51bWJlciwgeT86IG51bWJlciApOiBCb3VuZHMyIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcbiAgICBpZiAoIHggaW5zdGFuY2VvZiBWZWN0b3IyICkge1xuICAgICAgY29uc3QgcCA9IHg7XG4gICAgICByZXR1cm4gYjIoIHAueCwgcC55LCBwLngsIHAueSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBiMiggeCwgeSEsIHgsIHkhICk7XG4gICAgfVxuICB9XG5cbiAgLy8gSGVscHMgdG8gaWRlbnRpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgYm91bmRzXG4gIHB1YmxpYyBpc0JvdW5kcyE6IGJvb2xlYW47XG4gIHB1YmxpYyBkaW1lbnNpb24/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEEgY29uc3RhbnQgQm91bmRzMiB3aXRoIG1pbmltdW1zID0gJFxcaW5mdHkkLCBtYXhpbXVtcyA9ICQtXFxpbmZ0eSQsIHNvIHRoYXQgaXQgcmVwcmVzZW50cyBcIm5vIGJvdW5kcyB3aGF0c29ldmVyXCIuXG4gICAqXG4gICAqIFRoaXMgYWxsb3dzIHVzIHRvIHRha2UgdGhlIHVuaW9uICh1bmlvbi9pbmNsdWRlQm91bmRzKSBvZiB0aGlzIGFuZCBhbnkgb3RoZXIgQm91bmRzMiB0byBnZXQgdGhlIG90aGVyIGJvdW5kcyBiYWNrLFxuICAgKiBlLmcuIEJvdW5kczIuTk9USElORy51bmlvbiggYm91bmRzICkuZXF1YWxzKCBib3VuZHMgKS4gVGhpcyBvYmplY3QgbmF0dXJhbGx5IHNlcnZlcyBhcyB0aGUgYmFzZSBjYXNlIGFzIGEgdW5pb24gb2ZcbiAgICogemVybyBib3VuZHMgb2JqZWN0cy5cbiAgICpcbiAgICogQWRkaXRpb25hbGx5LCBpbnRlcnNlY3Rpb25zIHdpdGggTk9USElORyB3aWxsIGFsd2F5cyByZXR1cm4gYSBCb3VuZHMyIGVxdWl2YWxlbnQgdG8gTk9USElORy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTk9USElORyA9IG5ldyBCb3VuZHMyKCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgKTtcblxuICAvKipcbiAgICogQSBjb25zdGFudCBCb3VuZHMyIHdpdGggbWluaW11bXMgPSAkLVxcaW5mdHkkLCBtYXhpbXVtcyA9ICRcXGluZnR5JCwgc28gdGhhdCBpdCByZXByZXNlbnRzIFwiYWxsIGJvdW5kc1wiLlxuICAgKlxuICAgKiBUaGlzIGFsbG93cyB1cyB0byB0YWtlIHRoZSBpbnRlcnNlY3Rpb24gKGludGVyc2VjdGlvbi9jb25zdHJhaW5Cb3VuZHMpIG9mIHRoaXMgYW5kIGFueSBvdGhlciBCb3VuZHMyIHRvIGdldCB0aGVcbiAgICogb3RoZXIgYm91bmRzIGJhY2ssIGUuZy4gQm91bmRzMi5FVkVSWVRISU5HLmludGVyc2VjdGlvbiggYm91bmRzICkuZXF1YWxzKCBib3VuZHMgKS4gVGhpcyBvYmplY3QgbmF0dXJhbGx5IHNlcnZlcyBhc1xuICAgKiB0aGUgYmFzZSBjYXNlIGFzIGFuIGludGVyc2VjdGlvbiBvZiB6ZXJvIGJvdW5kcyBvYmplY3RzLlxuICAgKlxuICAgKiBBZGRpdGlvbmFsbHksIHVuaW9ucyB3aXRoIEVWRVJZVEhJTkcgd2lsbCBhbHdheXMgcmV0dXJuIGEgQm91bmRzMiBlcXVpdmFsZW50IHRvIEVWRVJZVEhJTkcuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEVWRVJZVEhJTkcgPSBuZXcgQm91bmRzMiggTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICk7XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBCb3VuZHMySU8gPSBuZXcgSU9UeXBlKCAnQm91bmRzMklPJywge1xuICAgIHZhbHVlVHlwZTogQm91bmRzMixcbiAgICBkb2N1bWVudGF0aW9uOiAnYSAyLWRpbWVuc2lvbmFsIGJvdW5kcyByZWN0YW5nbGUnLFxuICAgIHRvU3RhdGVPYmplY3Q6ICggYm91bmRzMjogQm91bmRzMiApID0+ICggeyBtaW5YOiBib3VuZHMyLm1pblgsIG1pblk6IGJvdW5kczIubWluWSwgbWF4WDogYm91bmRzMi5tYXhYLCBtYXhZOiBib3VuZHMyLm1heFkgfSApLFxuICAgIGZyb21TdGF0ZU9iamVjdDogKCBzdGF0ZU9iamVjdDogQm91bmRzMlN0YXRlT2JqZWN0ICkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBCb3VuZHMyKFxuICAgICAgICBJbmZpbml0ZU51bWJlcklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QubWluWCApLFxuICAgICAgICBJbmZpbml0ZU51bWJlcklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QubWluWSApLFxuICAgICAgICBJbmZpbml0ZU51bWJlcklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QubWF4WCApLFxuICAgICAgICBJbmZpbml0ZU51bWJlcklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QubWF4WSApXG4gICAgICApO1xuICAgIH0sXG4gICAgc3RhdGVTY2hlbWE6IHtcbiAgICAgIG1pblg6IEluZmluaXRlTnVtYmVySU8sXG4gICAgICBtYXhYOiBJbmZpbml0ZU51bWJlcklPLFxuICAgICAgbWluWTogSW5maW5pdGVOdW1iZXJJTyxcbiAgICAgIG1heFk6IEluZmluaXRlTnVtYmVySU9cbiAgICB9XG4gIH0gKTtcbn1cblxuZG90LnJlZ2lzdGVyKCAnQm91bmRzMicsIEJvdW5kczIgKTtcblxuY29uc3QgYjIgPSBCb3VuZHMyLnBvb2wuY3JlYXRlLmJpbmQoIEJvdW5kczIucG9vbCApO1xuZG90LnJlZ2lzdGVyKCAnYjInLCBiMiApO1xuXG5Cb3VuZHMyLnByb3RvdHlwZS5pc0JvdW5kcyA9IHRydWU7XG5Cb3VuZHMyLnByb3RvdHlwZS5kaW1lbnNpb24gPSAyO1xuXG5mdW5jdGlvbiBjYXRjaEltbXV0YWJsZVNldHRlckxvd0hhbmdpbmdGcnVpdCggYm91bmRzOiBCb3VuZHMyICk6IHZvaWQge1xuICBib3VuZHMuc2V0TWluTWF4ID0gKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoICdBdHRlbXB0IHRvIHNldCBcInNldE1pbk1heFwiIG9mIGFuIGltbXV0YWJsZSBCb3VuZHMyIG9iamVjdCcgKTsgfTtcbiAgYm91bmRzLnNldCA9ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKCAnQXR0ZW1wdCB0byBzZXQgXCJzZXRcIiBvZiBhbiBpbW11dGFibGUgQm91bmRzMiBvYmplY3QnICk7IH07XG4gIGJvdW5kcy5pbmNsdWRlQm91bmRzID0gKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoICdBdHRlbXB0IHRvIHNldCBcImluY2x1ZGVCb3VuZHNcIiBvZiBhbiBpbW11dGFibGUgQm91bmRzMiBvYmplY3QnICk7IH07XG4gIGJvdW5kcy5jb25zdHJhaW5Cb3VuZHMgPSAoKSA9PiB7IHRocm93IG5ldyBFcnJvciggJ0F0dGVtcHQgdG8gc2V0IFwiY29uc3RyYWluQm91bmRzXCIgb2YgYW4gaW1tdXRhYmxlIEJvdW5kczIgb2JqZWN0JyApOyB9O1xuICBib3VuZHMuYWRkQ29vcmRpbmF0ZXMgPSAoKSA9PiB7IHRocm93IG5ldyBFcnJvciggJ0F0dGVtcHQgdG8gc2V0IFwiYWRkQ29vcmRpbmF0ZXNcIiBvZiBhbiBpbW11dGFibGUgQm91bmRzMiBvYmplY3QnICk7IH07XG4gIGJvdW5kcy50cmFuc2Zvcm0gPSAoKSA9PiB7IHRocm93IG5ldyBFcnJvciggJ0F0dGVtcHQgdG8gc2V0IFwidHJhbnNmb3JtXCIgb2YgYW4gaW1tdXRhYmxlIEJvdW5kczIgb2JqZWN0JyApOyB9O1xufVxuXG5pZiAoIGFzc2VydCApIHtcbiAgY2F0Y2hJbW11dGFibGVTZXR0ZXJMb3dIYW5naW5nRnJ1aXQoIEJvdW5kczIuRVZFUllUSElORyApO1xuICBjYXRjaEltbXV0YWJsZVNldHRlckxvd0hhbmdpbmdGcnVpdCggQm91bmRzMi5OT1RISU5HICk7XG59Il0sIm5hbWVzIjpbIk9yaWVudGF0aW9uIiwiUG9vbCIsIkluZmluaXRlTnVtYmVySU8iLCJJT1R5cGUiLCJkb3QiLCJSYW5nZSIsIlZlY3RvcjIiLCJzY3JhdGNoVmVjdG9yMiIsIkJvdW5kczIiLCJnZXRXaWR0aCIsIm1heFgiLCJtaW5YIiwid2lkdGgiLCJnZXRIZWlnaHQiLCJtYXhZIiwibWluWSIsImhlaWdodCIsImdldFgiLCJ4IiwiZ2V0WSIsInkiLCJnZXRNaW5YIiwiZ2V0TWluWSIsImdldE1heFgiLCJnZXRNYXhZIiwiZ2V0TGVmdCIsImxlZnQiLCJnZXRUb3AiLCJ0b3AiLCJnZXRSaWdodCIsInJpZ2h0IiwiZ2V0Qm90dG9tIiwiYm90dG9tIiwiZ2V0Q2VudGVyWCIsImNlbnRlclgiLCJnZXRDZW50ZXJZIiwiY2VudGVyWSIsImdldExlZnRUb3AiLCJsZWZ0VG9wIiwiZ2V0Q2VudGVyVG9wIiwiY2VudGVyVG9wIiwiZ2V0UmlnaHRUb3AiLCJyaWdodFRvcCIsImdldExlZnRDZW50ZXIiLCJsZWZ0Q2VudGVyIiwiZ2V0Q2VudGVyIiwiY2VudGVyIiwiZ2V0UmlnaHRDZW50ZXIiLCJyaWdodENlbnRlciIsImdldExlZnRCb3R0b20iLCJsZWZ0Qm90dG9tIiwiZ2V0Q2VudGVyQm90dG9tIiwiY2VudGVyQm90dG9tIiwiZ2V0UmlnaHRCb3R0b20iLCJyaWdodEJvdHRvbSIsImlzRW1wdHkiLCJpc0Zpbml0ZSIsImhhc05vbnplcm9BcmVhIiwiaXNWYWxpZCIsImNsb3Nlc3RQb2ludFRvIiwicG9pbnQiLCJjb250YWluc0Nvb3JkaW5hdGVzIiwiZ2V0Q29uc3RyYWluZWRQb2ludCIsImNsb3Nlc3RCb3VuZGFyeVBvaW50VG8iLCJjbG9zZXN0WEVkZ2UiLCJjbG9zZXN0WUVkZ2UiLCJNYXRoIiwiYWJzIiwieENvbnN0cmFpbmVkIiwibWF4IiwibWluIiwieUNvbnN0cmFpbmVkIiwiY29udGFpbnNQb2ludCIsImNvbnRhaW5zQm91bmRzIiwiYm91bmRzIiwiaW50ZXJzZWN0c0JvdW5kcyIsIm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkIiwiY2xvc2VYIiwiY2xvc2VZIiwiZCIsImR4IiwiZHkiLCJtYXhpbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCIsInRvU3RyaW5nIiwiZXF1YWxzIiwib3RoZXIiLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsInVuZGVmaW5lZCIsInRoaXNGaW5pdGUiLCJvdGhlckZpbml0ZSIsImNvcHkiLCJzZXQiLCJiMiIsImNyZWF0ZSIsInVuaW9uIiwiaW50ZXJzZWN0aW9uIiwid2l0aENvb3JkaW5hdGVzIiwid2l0aFBvaW50Iiwid2l0aFgiLCJhZGRYIiwid2l0aFkiLCJhZGRZIiwid2l0aE1pblgiLCJ3aXRoTWluWSIsIndpdGhNYXhYIiwid2l0aE1heFkiLCJyb3VuZGVkT3V0IiwiZmxvb3IiLCJjZWlsIiwicm91bmRlZEluIiwidHJhbnNmb3JtZWQiLCJtYXRyaXgiLCJ0cmFuc2Zvcm0iLCJkaWxhdGVkIiwiZGlsYXRlZFhZIiwiZGlsYXRlZFgiLCJkaWxhdGVkWSIsImVyb2RlZCIsImFtb3VudCIsImVyb2RlZFgiLCJlcm9kZWRZIiwiZXJvZGVkWFkiLCJ3aXRoT2Zmc2V0cyIsInNoaWZ0ZWRYIiwic2hpZnRlZFkiLCJzaGlmdGVkWFkiLCJzaGlmdGVkIiwidiIsImJsZW5kIiwicmF0aW8iLCJ0Iiwic2V0TWluTWF4Iiwic2V0TWluWCIsInNldE1pblkiLCJzZXRNYXhYIiwic2V0TWF4WSIsImluY2x1ZGVCb3VuZHMiLCJjb25zdHJhaW5Cb3VuZHMiLCJhZGRDb29yZGluYXRlcyIsImFkZFBvaW50Iiwicm91bmRPdXQiLCJyb3VuZEluIiwiaXNJZGVudGl0eSIsIk5PVEhJTkciLCJtdWx0aXBseVZlY3RvcjIiLCJzZXRYWSIsImRpbGF0ZSIsImRpbGF0ZVhZIiwiZGlsYXRlWCIsImRpbGF0ZVkiLCJlcm9kZSIsImVyb2RlWCIsImVyb2RlWSIsImVyb2RlWFkiLCJvZmZzZXQiLCJzaGlmdFgiLCJzaGlmdFkiLCJzaGlmdFhZIiwic2hpZnQiLCJnZXRYUmFuZ2UiLCJzZXRYUmFuZ2UiLCJyYW5nZSIsInhSYW5nZSIsImdldFlSYW5nZSIsInNldFlSYW5nZSIsInlSYW5nZSIsImdldENsb3Nlc3RQb2ludCIsInJlc3VsdCIsImZyZWVUb1Bvb2wiLCJwb29sIiwicmVjdCIsIm9yaWVudGVkIiwib3JpZW50YXRpb24iLCJtaW5QcmltYXJ5IiwibWluU2Vjb25kYXJ5IiwibWF4UHJpbWFyeSIsIm1heFNlY29uZGFyeSIsIkhPUklaT05UQUwiLCJwIiwiYXNzZXJ0IiwibWF4U2l6ZSIsImluaXRpYWxpemUiLCJwcm90b3R5cGUiLCJkZWZhdWx0QXJndW1lbnRzIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJORUdBVElWRV9JTkZJTklUWSIsIkVWRVJZVEhJTkciLCJCb3VuZHMySU8iLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwidG9TdGF0ZU9iamVjdCIsImJvdW5kczIiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsInN0YXRlU2NoZW1hIiwicmVnaXN0ZXIiLCJiaW5kIiwiaXNCb3VuZHMiLCJkaW1lbnNpb24iLCJjYXRjaEltbXV0YWJsZVNldHRlckxvd0hhbmdpbmdGcnVpdCIsIkVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxPQUFPQSxpQkFBaUIsb0NBQW9DO0FBQzVELE9BQU9DLFVBQXlCLDZCQUE2QjtBQUM3RCxPQUFPQyxzQkFBcUQsNENBQTRDO0FBQ3hHLE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLFNBQVMsV0FBVztBQUUzQixPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0MsYUFBYSxlQUFlO0FBRW5DLDBEQUEwRDtBQUMxRCxNQUFNQyxpQkFBaUIsSUFBSUQsUUFBUyxHQUFHO0FBa0J4QixJQUFBLEFBQU1FLFVBQU4sTUFBTUE7SUErQm5COzsrRUFFNkUsR0FFN0U7O0dBRUMsR0FDRCxBQUFPQyxXQUFtQjtRQUFFLE9BQU8sSUFBSSxDQUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDQyxJQUFJO0lBQUU7SUFFMUQsSUFBV0MsUUFBZ0I7UUFBRSxPQUFPLElBQUksQ0FBQ0gsUUFBUTtJQUFJO0lBRXJEOztHQUVDLEdBQ0QsQUFBT0ksWUFBb0I7UUFBRSxPQUFPLElBQUksQ0FBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQ0MsSUFBSTtJQUFFO0lBRTNELElBQVdDLFNBQWlCO1FBQUUsT0FBTyxJQUFJLENBQUNILFNBQVM7SUFBSTtJQUV2RDs7Ozs7Ozs7O0dBU0MsR0FFRDs7R0FFQyxHQUNELEFBQU9JLE9BQWU7UUFBRSxPQUFPLElBQUksQ0FBQ04sSUFBSTtJQUFFO0lBRTFDLElBQVdPLElBQVk7UUFBRSxPQUFPLElBQUksQ0FBQ0QsSUFBSTtJQUFJO0lBRTdDOztHQUVDLEdBQ0QsQUFBT0UsT0FBZTtRQUFFLE9BQU8sSUFBSSxDQUFDSixJQUFJO0lBQUU7SUFFMUMsSUFBV0ssSUFBWTtRQUFFLE9BQU8sSUFBSSxDQUFDRCxJQUFJO0lBQUk7SUFF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