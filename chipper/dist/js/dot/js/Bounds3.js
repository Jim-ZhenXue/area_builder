// Copyright 2013-2024, University of Colorado Boulder
/**
 * A 3D cuboid-shaped bounded area (bounding box).
 *
 * There are a number of convenience functions to get locations and points on the Bounds. Currently we do not
 * store these with the Bounds3 instance, since we want to lower the memory footprint.
 *
 * minX, minY, minZ, maxX, maxY, and maxZ are actually stored. We don't do x,y,z,width,height,depth because this can't properly express
 * semi-infinite bounds (like a half-plane), or easily handle what Bounds3.NOTHING and Bounds3.EVERYTHING do with
 * the constructive solid areas.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../phet-core/js/Poolable.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import dot from './dot.js';
import Vector3 from './Vector3.js';
let Bounds3 = class Bounds3 {
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
    /**
   * The depth of the bounds, defined as maxZ - minZ.
   */ getDepth() {
        return this.maxZ - this.minZ;
    }
    get depth() {
        return this.getDepth();
    }
    /*
   * Convenience locations
   * upper is in terms of the visual layout in Scenery and other programs, so the minY is the "upper", and minY is the "lower"
   *
   *             minX (x)     centerX        maxX
   *          ---------------------------------------
   * minY (y) | upperLeft   upperCenter   upperRight
   * centerY  | centerLeft    center      centerRight
   * maxY     | lowerLeft   lowerCenter   lowerRight
   */ /**
   * Alias for minX, when thinking of the bounds as an (x,y,z,width,height,depth) cuboid.
   */ getX() {
        return this.minX;
    }
    get x() {
        return this.getX();
    }
    /**
   * Alias for minY, when thinking of the bounds as an (x,y,z,width,height,depth) cuboid.
   */ getY() {
        return this.minY;
    }
    get y() {
        return this.getY();
    }
    /**
   * Alias for minZ, when thinking of the bounds as an (x,y,z,width,height,depth) cuboid.
   */ getZ() {
        return this.minZ;
    }
    get z() {
        return this.getZ();
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
   * Alias for minZ, supporting the explicit getter function style.
   */ getMinZ() {
        return this.minZ;
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
   * Alias for maxZ, supporting the explicit getter function style.
   */ getMaxZ() {
        return this.maxZ;
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
   * Alias for minZ, when thinking in the UI-layout manner.
   */ getBack() {
        return this.minZ;
    }
    get back() {
        return this.minZ;
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
   * Alias for maxZ, when thinking in the UI-layout manner.
   */ getFront() {
        return this.maxZ;
    }
    get front() {
        return this.maxZ;
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
   * The depthwise (Z-coordinate) center of the bounds, averaging the minZ and maxZ.
   */ getCenterZ() {
        return (this.maxZ + this.minZ) / 2;
    }
    get centerZ() {
        return this.getCenterZ();
    }
    /**
   * The point (centerX, centerY, centerZ), in the center of the bounds.
   */ getCenter() {
        return new Vector3(this.getCenterX(), this.getCenterY(), this.getCenterZ());
    }
    get center() {
        return this.getCenter();
    }
    /**
   * Get the volume of the Bounds3 as if it were a cube.
   */ get volume() {
        return this.width * this.height * this.depth;
    }
    /**
   * Whether we have negative width, height or depth. Bounds3.NOTHING is a prime example of an empty Bounds3.
   * Bounds with width = height = depth = 0 are considered not empty, since they include the single (0,0,0) point.
   */ isEmpty() {
        return this.getWidth() < 0 || this.getHeight() < 0 || this.getDepth() < 0;
    }
    /**
   * Whether our minimums and maximums are all finite numbers. This will exclude Bounds3.NOTHING and Bounds3.EVERYTHING.
   */ isFinite() {
        return isFinite(this.minX) && isFinite(this.minY) && isFinite(this.minZ) && isFinite(this.maxX) && isFinite(this.maxY) && isFinite(this.maxZ);
    }
    /**
   * Whether this bounds has a non-zero volume (non-zero positive width, height and depth).
   */ hasNonzeroVolume() {
        return this.getWidth() > 0 && this.getHeight() > 0 && this.getDepth() > 0;
    }
    /**
   * Whether this bounds has a finite and non-negative width, height and depth.
   */ isValid() {
        return !this.isEmpty() && this.isFinite();
    }
    /**
   * Whether the coordinates are contained inside the bounding box, or are on the boundary.
   *
   * @param x - X coordinate of the point to check
   * @param y - Y coordinate of the point to check
   * @param z - Z coordinate of the point to check
   */ containsCoordinates(x, y, z) {
        return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY && this.minZ <= z && z <= this.maxZ;
    }
    /**
   * Whether the point is contained inside the bounding box, or is on the boundary.
   */ containsPoint(point) {
        return this.containsCoordinates(point.x, point.y, point.z);
    }
    /**
   * Whether this bounding box completely contains the bounding box passed as a parameter. The boundary of a box is
   * considered to be "contained".
   */ containsBounds(bounds) {
        return this.minX <= bounds.minX && this.maxX >= bounds.maxX && this.minY <= bounds.minY && this.maxY >= bounds.maxY && this.minZ <= bounds.minZ && this.maxZ >= bounds.maxZ;
    }
    /**
   * Whether this and another bounding box have any points of intersection (including touching boundaries).
   */ intersectsBounds(bounds) {
        // TODO: more efficient way of doing this? https://github.com/phetsims/dot/issues/96
        return !this.intersection(bounds).isEmpty();
    }
    /**
   * Debugging string for the bounds.
   */ toString() {
        return `[x:(${this.minX},${this.maxX}),y:(${this.minY},${this.maxY}),z:(${this.minZ},${this.maxZ})]`;
    }
    /**
   * Exact equality comparison between this bounds and another bounds.
   */ equals(other) {
        return this.minX === other.minX && this.minY === other.minY && this.minZ === other.minZ && this.maxX === other.maxX && this.maxY === other.maxY && this.maxZ === other.maxZ;
    }
    /**
   * Approximate equality comparison between this bounds and another bounds.
   * @returns - Whether difference between the two bounds has no min/max with an absolute value greater than epsilon.
   */ equalsEpsilon(other, epsilon) {
        epsilon = epsilon !== undefined ? epsilon : 0;
        const thisFinite = this.isFinite();
        const otherFinite = other.isFinite();
        if (thisFinite && otherFinite) {
            // both are finite, so we can use Math.abs() - it would fail with non-finite values like Infinity
            return Math.abs(this.minX - other.minX) < epsilon && Math.abs(this.minY - other.minY) < epsilon && Math.abs(this.minZ - other.minZ) < epsilon && Math.abs(this.maxX - other.maxX) < epsilon && Math.abs(this.maxY - other.maxY) < epsilon && Math.abs(this.maxZ - other.maxZ) < epsilon;
        } else if (thisFinite !== otherFinite) {
            return false; // one is finite, the other is not. definitely not equal
        } else if (this === other) {
            return true; // exact same instance, must be equal
        } else {
            // epsilon only applies on finite dimensions. due to JS's handling of isFinite(), it's faster to check the sum of both
            return (isFinite(this.minX + other.minX) ? Math.abs(this.minX - other.minX) < epsilon : this.minX === other.minX) && (isFinite(this.minY + other.minY) ? Math.abs(this.minY - other.minY) < epsilon : this.minY === other.minY) && (isFinite(this.minZ + other.minZ) ? Math.abs(this.minZ - other.minZ) < epsilon : this.minZ === other.minZ) && (isFinite(this.maxX + other.maxX) ? Math.abs(this.maxX - other.maxX) < epsilon : this.maxX === other.maxX) && (isFinite(this.maxY + other.maxY) ? Math.abs(this.maxY - other.maxY) < epsilon : this.maxY === other.maxY) && (isFinite(this.maxZ + other.maxZ) ? Math.abs(this.maxZ - other.maxZ) < epsilon : this.maxZ === other.maxZ);
        }
    }
    /*---------------------------------------------------------------------------*
   * Immutable operations
   *---------------------------------------------------------------------------*/ /**
   * Creates a copy of this bounds, or if a bounds is passed in, set that bounds's values to ours.
   *
   * This is the immutable form of the function set(), if a bounds is provided. This will return a new bounds, and
   * will not modify this bounds.
   * @param bounds - If not provided, creates a new Bounds3 with filled in values. Otherwise, fills in the
   *                             values of the provided bounds so that it equals this bounds.
   */ copy(bounds) {
        if (bounds) {
            return bounds.set(this);
        } else {
            return new Bounds3(this.minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ);
        }
    }
    /**
   * The smallest bounds that contains both this bounds and the input bounds, returned as a copy.
   *
   * This is the immutable form of the function includeBounds(). This will return a new bounds, and will not modify
   * this bounds.
   */ union(bounds) {
        return new Bounds3(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.min(this.minZ, bounds.minZ), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY), Math.max(this.maxZ, bounds.maxZ));
    }
    /**
   * The smallest bounds that is contained by both this bounds and the input bounds, returned as a copy.
   *
   * This is the immutable form of the function constrainBounds(). This will return a new bounds, and will not modify
   * this bounds.
   */ intersection(bounds) {
        return new Bounds3(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.max(this.minZ, bounds.minZ), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY), Math.min(this.maxZ, bounds.maxZ));
    }
    // TODO: difference should be well-defined, but more logic is needed to compute https://github.com/phetsims/dot/issues/96
    /**
   * The smallest bounds that contains this bounds and the point (x,y,z), returned as a copy.
   *
   * This is the immutable form of the function addCoordinates(). This will return a new bounds, and will not modify
   * this bounds.
   */ withCoordinates(x, y, z) {
        return new Bounds3(Math.min(this.minX, x), Math.min(this.minY, y), Math.min(this.minZ, z), Math.max(this.maxX, x), Math.max(this.maxY, y), Math.max(this.maxZ, z));
    }
    /**
   * The smallest bounds that contains this bounds and the input point, returned as a copy.
   *
   * This is the immutable form of the function addPoint(). This will return a new bounds, and will not modify
   * this bounds.
   */ withPoint(point) {
        return this.withCoordinates(point.x, point.y, point.z);
    }
    /**
   * A copy of this bounds, with minX replaced with the input.
   *
   * This is the immutable form of the function setMinX(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMinX(minX) {
        return new Bounds3(minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ);
    }
    /**
   * A copy of this bounds, with minY replaced with the input.
   *
   * This is the immutable form of the function setMinY(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMinY(minY) {
        return new Bounds3(this.minX, minY, this.minZ, this.maxX, this.maxY, this.maxZ);
    }
    /**
   * A copy of this bounds, with minZ replaced with the input.
   *
   * This is the immutable form of the function setMinZ(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMinZ(minZ) {
        return new Bounds3(this.minX, this.minY, minZ, this.maxX, this.maxY, this.maxZ);
    }
    /**
   * A copy of this bounds, with maxX replaced with the input.
   *
   * This is the immutable form of the function setMaxX(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMaxX(maxX) {
        return new Bounds3(this.minX, this.minY, this.minZ, maxX, this.maxY, this.maxZ);
    }
    /**
   * A copy of this bounds, with maxY replaced with the input.
   *
   * This is the immutable form of the function setMaxY(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMaxY(maxY) {
        return new Bounds3(this.minX, this.minY, this.minZ, this.maxX, maxY, this.maxZ);
    }
    /**
   * A copy of this bounds, with maxZ replaced with the input.
   *
   * This is the immutable form of the function setMaxZ(). This will return a new bounds, and will not modify
   * this bounds.
   */ withMaxZ(maxZ) {
        return new Bounds3(this.minX, this.minY, this.minZ, this.maxX, this.maxY, maxZ);
    }
    /**
   * A copy of this bounds, with the minimum values rounded down to the nearest integer, and the maximum values
   * rounded up to the nearest integer. This causes the bounds to expand as necessary so that its boundaries
   * are integer-aligned.
   *
   * This is the immutable form of the function roundOut(). This will return a new bounds, and will not modify
   * this bounds.
   */ roundedOut() {
        return new Bounds3(Math.floor(this.minX), Math.floor(this.minY), Math.floor(this.minZ), Math.ceil(this.maxX), Math.ceil(this.maxY), Math.ceil(this.maxZ));
    }
    /**
   * A copy of this bounds, with the minimum values rounded up to the nearest integer, and the maximum values
   * rounded down to the nearest integer. This causes the bounds to contract as necessary so that its boundaries
   * are integer-aligned.
   *
   * This is the immutable form of the function roundIn(). This will return a new bounds, and will not modify
   * this bounds.
   */ roundedIn() {
        return new Bounds3(Math.ceil(this.minX), Math.ceil(this.minY), Math.ceil(this.minZ), Math.floor(this.maxX), Math.floor(this.maxY), Math.floor(this.maxZ));
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
        return this.dilatedXYZ(d, d, d);
    }
    /**
   * A bounding box that is expanded horizontally (on the left and right) by the specified amount.
   *
   * This is the immutable form of the function dilateX(). This will return a new bounds, and will not modify
   * this bounds.
   */ dilatedX(x) {
        return new Bounds3(this.minX - x, this.minY, this.minZ, this.maxX + x, this.maxY, this.maxZ);
    }
    /**
   * A bounding box that is expanded vertically (on the top and bottom) by the specified amount.
   *
   * This is the immutable form of the function dilateY(). This will return a new bounds, and will not modify
   * this bounds.
   */ dilatedY(y) {
        return new Bounds3(this.minX, this.minY - y, this.minZ, this.maxX, this.maxY + y, this.maxZ);
    }
    /**
   * A bounding box that is expanded depth-wise (on the front and back) by the specified amount.
   *
   * This is the immutable form of the function dilateZ(). This will return a new bounds, and will not modify
   * this bounds.
   */ dilatedZ(z) {
        return new Bounds3(this.minX, this.minY, this.minZ - z, this.maxX, this.maxY, this.maxZ + z);
    }
    /**
   * A bounding box that is expanded on all sides, with different amounts of expansion along each axis.
   * Will be identical to the bounds returned by calling bounds.dilatedX( x ).dilatedY( y ).dilatedZ( z ).
   *
   * This is the immutable form of the function dilateXYZ(). This will return a new bounds, and will not modify
   * this bounds.
   * @param x - Amount to dilate horizontally (for each side)
   * @param y - Amount to dilate vertically (for each side)
   * @param z - Amount to dilate depth-wise (for each side)
   */ dilatedXYZ(x, y, z) {
        return new Bounds3(this.minX - x, this.minY - y, this.minZ - z, this.maxX + x, this.maxY + y, this.maxZ + z);
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
   * A bounding box that is contracted depth-wise (on the front and back) by the specified amount.
   *
   * This is the immutable form of the function erodeZ(). This will return a new bounds, and will not modify
   * this bounds.
   */ erodedZ(z) {
        return this.dilatedZ(-z);
    }
    /**
   * A bounding box that is contracted on all sides, with different amounts of contraction along each axis.
   *
   * This is the immutable form of the function erodeXYZ(). This will return a new bounds, and will not modify
   * this bounds.
   * @param x - Amount to erode horizontally (for each side)
   * @param y - Amount to erode vertically (for each side)
   * @param z - Amount to erode depth-wise (for each side)
   */ erodedXYZ(x, y, z) {
        return this.dilatedXYZ(-x, -y, -z);
    }
    /**
   * Our bounds, translated horizontally by x, returned as a copy.
   *
   * This is the immutable form of the function shiftX(). This will return a new bounds, and will not modify
   * this bounds.
   */ shiftedX(x) {
        return new Bounds3(this.minX + x, this.minY, this.minZ, this.maxX + x, this.maxY, this.maxZ);
    }
    /**
   * Our bounds, translated vertically by y, returned as a copy.
   *
   * This is the immutable form of the function shiftY(). This will return a new bounds, and will not modify
   * this bounds.
   */ shiftedY(y) {
        return new Bounds3(this.minX, this.minY + y, this.minZ, this.maxX, this.maxY + y, this.maxZ);
    }
    /**
   * Our bounds, translated depth-wise by z, returned as a copy.
   *
   * This is the immutable form of the function shiftZ(). This will return a new bounds, and will not modify
   * this bounds.
   */ shiftedZ(z) {
        return new Bounds3(this.minX, this.minY, this.minZ + z, this.maxX, this.maxY, this.maxZ + z);
    }
    /**
   * Our bounds, translated by (x,y,z), returned as a copy.
   *
   * This is the immutable form of the function shift(). This will return a new bounds, and will not modify
   * this bounds.
   */ shiftedXYZ(x, y, z) {
        return new Bounds3(this.minX + x, this.minY + y, this.minZ + z, this.maxX + x, this.maxY + y, this.maxZ + z);
    }
    /**
   * Returns our bounds, translated by a vector, returned as a copy.
   */ shifted(v) {
        return this.shiftedXYZ(v.x, v.y, v.z);
    }
    /*---------------------------------------------------------------------------*
   * Mutable operations
   *
   * All mutable operations should call one of the following:
   *   setMinMax, setMinX, setMinY, setMinZ, setMaxX, setMaxY, setMaxZ
   *---------------------------------------------------------------------------*/ /**
   * Sets each value for this bounds, and returns itself.
   */ setMinMax(minX, minY, minZ, maxX, maxY, maxZ) {
        this.minX = minX;
        this.minY = minY;
        this.minZ = minZ;
        this.maxX = maxX;
        this.maxY = maxY;
        this.maxZ = maxZ;
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
   * Sets the value of minZ.
   *
   * This is the mutable form of the function withMinZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ setMinZ(minZ) {
        this.minZ = minZ;
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
   * Sets the value of maxZ.
   *
   * This is the mutable form of the function withMaxZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ setMaxZ(maxZ) {
        this.maxZ = maxZ;
        return this;
    }
    /**
   * Sets the values of this bounds to be equal to the input bounds.
   *
   * This is the mutable form of the function copy(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ set(bounds) {
        return this.setMinMax(bounds.minX, bounds.minY, bounds.minZ, bounds.maxX, bounds.maxY, bounds.maxZ);
    }
    /**
   * Modifies this bounds so that it contains both its original bounds and the input bounds.
   *
   * This is the mutable form of the function union(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ includeBounds(bounds) {
        return this.setMinMax(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.min(this.minZ, bounds.minZ), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY), Math.max(this.maxZ, bounds.maxZ));
    }
    /**
   * Modifies this bounds so that it is the largest bounds contained both in its original bounds and in the input bounds.
   *
   * This is the mutable form of the function intersection(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ constrainBounds(bounds) {
        return this.setMinMax(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.max(this.minZ, bounds.minZ), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY), Math.min(this.maxZ, bounds.maxZ));
    }
    /**
   * Modifies this bounds so that it contains both its original bounds and the input point (x,y,z).
   *
   * This is the mutable form of the function withCoordinates(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ addCoordinates(x, y, z) {
        return this.setMinMax(Math.min(this.minX, x), Math.min(this.minY, y), Math.min(this.minZ, z), Math.max(this.maxX, x), Math.max(this.maxY, y), Math.max(this.maxZ, z));
    }
    /**
   * Modifies this bounds so that it contains both its original bounds and the input point.
   *
   * This is the mutable form of the function withPoint(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ addPoint(point) {
        return this.addCoordinates(point.x, point.y, point.z);
    }
    /**
   * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries down and the
   * maximum boundaries up (expanding as necessary).
   *
   * This is the mutable form of the function roundedOut(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ roundOut() {
        return this.setMinMax(Math.floor(this.minX), Math.floor(this.minY), Math.floor(this.minZ), Math.ceil(this.maxX), Math.ceil(this.maxY), Math.ceil(this.maxZ));
    }
    /**
   * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries up and the
   * maximum boundaries down (contracting as necessary).
   *
   * This is the mutable form of the function roundedIn(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ roundIn() {
        return this.setMinMax(Math.ceil(this.minX), Math.ceil(this.minY), Math.ceil(this.minZ), Math.floor(this.maxX), Math.floor(this.maxY), Math.floor(this.maxZ));
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
        // do nothing
        if (this.isEmpty()) {
            return this;
        }
        // optimization to bail for identity matrices
        if (matrix.isIdentity()) {
            return this;
        }
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let minZ = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        let maxZ = Number.NEGATIVE_INFINITY;
        // using mutable vector so we don't create excessive instances of Vector2 during this
        // make sure all 4 corners are inside this transformed bounding box
        const vector = new Vector3(0, 0, 0);
        function withIt(vector) {
            minX = Math.min(minX, vector.x);
            minY = Math.min(minY, vector.y);
            minZ = Math.min(minZ, vector.z);
            maxX = Math.max(maxX, vector.x);
            maxY = Math.max(maxY, vector.y);
            maxZ = Math.max(maxZ, vector.z);
        }
        withIt(matrix.timesVector3(vector.setXYZ(this.minX, this.minY, this.minZ)));
        withIt(matrix.timesVector3(vector.setXYZ(this.minX, this.maxY, this.minZ)));
        withIt(matrix.timesVector3(vector.setXYZ(this.maxX, this.minY, this.minZ)));
        withIt(matrix.timesVector3(vector.setXYZ(this.maxX, this.maxY, this.minZ)));
        withIt(matrix.timesVector3(vector.setXYZ(this.minX, this.minY, this.maxZ)));
        withIt(matrix.timesVector3(vector.setXYZ(this.minX, this.maxY, this.maxZ)));
        withIt(matrix.timesVector3(vector.setXYZ(this.maxX, this.minY, this.maxZ)));
        withIt(matrix.timesVector3(vector.setXYZ(this.maxX, this.maxY, this.maxZ)));
        return this.setMinMax(minX, minY, minZ, maxX, maxY, maxZ);
    }
    /**
   * Expands this bounds on all sides by the specified amount.
   *
   * This is the mutable form of the function dilated(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ dilate(d) {
        return this.dilateXYZ(d, d, d);
    }
    /**
   * Expands this bounds horizontally (left and right) by the specified amount.
   *
   * This is the mutable form of the function dilatedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ dilateX(x) {
        return this.setMinMax(this.minX - x, this.minY, this.minZ, this.maxX + x, this.maxY, this.maxZ);
    }
    /**
   * Expands this bounds vertically (top and bottom) by the specified amount.
   *
   * This is the mutable form of the function dilatedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ dilateY(y) {
        return this.setMinMax(this.minX, this.minY - y, this.minZ, this.maxX, this.maxY + y, this.maxZ);
    }
    /**
   * Expands this bounds depth-wise (front and back) by the specified amount.
   *
   * This is the mutable form of the function dilatedZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ dilateZ(z) {
        return this.setMinMax(this.minX, this.minY, this.minZ - z, this.maxX, this.maxY, this.maxZ + z);
    }
    /**
   * Expands this bounds independently along each axis. Will be equal to calling
   * bounds.dilateX( x ).dilateY( y ).dilateZ( z ).
   *
   * This is the mutable form of the function dilatedXYZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ dilateXYZ(x, y, z) {
        return this.setMinMax(this.minX - x, this.minY - y, this.minZ - z, this.maxX + x, this.maxY + y, this.maxZ + z);
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
   * Contracts this bounds depth-wise (front and back) by the specified amount.
   *
   * This is the mutable form of the function erodedZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ erodeZ(z) {
        return this.dilateZ(-z);
    }
    /**
   * Contracts this bounds independently along each axis. Will be equal to calling
   * bounds.erodeX( x ).erodeY( y ).erodeZ( z ).
   *
   * This is the mutable form of the function erodedXYZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ erodeXYZ(x, y, z) {
        return this.dilateXYZ(-x, -y, -z);
    }
    /**
   * Translates our bounds horizontally by x.
   *
   * This is the mutable form of the function shiftedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ shiftX(x) {
        return this.setMinMax(this.minX + x, this.minY, this.minZ, this.maxX + x, this.maxY, this.maxZ);
    }
    /**
   * Translates our bounds vertically by y.
   *
   * This is the mutable form of the function shiftedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ shiftY(y) {
        return this.setMinMax(this.minX, this.minY + y, this.minZ, this.maxX, this.maxY + y, this.maxZ);
    }
    /**
   * Translates our bounds depth-wise by z.
   *
   * This is the mutable form of the function shiftedZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ shiftZ(z) {
        return this.setMinMax(this.minX, this.minY, this.minZ + z, this.maxX, this.maxY, this.maxZ + z);
    }
    /**
   * Translates our bounds by (x,y,z).
   *
   * This is the mutable form of the function shifted(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */ shiftXYZ(x, y, z) {
        return this.setMinMax(this.minX + x, this.minY + y, this.minZ + z, this.maxX + x, this.maxY + y, this.maxZ + z);
    }
    /**
   * Translates our bounds by the given vector.
   */ shift(v) {
        return this.shiftXYZ(v.x, v.y, v.z);
    }
    /**
   * Returns a new Bounds3 object, with the cuboid (3d rectangle) construction with x, y, z, width, height and depth.
   *
   * @param x - The minimum value of X for the bounds.
   * @param y - The minimum value of Y for the bounds.
   * @param z - The minimum value of Z for the bounds.
   * @param width - The width (maxX - minX) of the bounds.`
   * @param height - The height (maxY - minY) of the bounds.
   * @param depth - The depth (maxZ - minZ) of the bounds.
   */ static cuboid(x, y, z, width, height, depth) {
        return new Bounds3(x, y, z, x + width, y + height, z + depth);
    }
    /**
   * Returns a new Bounds3 object that only contains the specified point (x,y,z). Useful for being dilated to form a
   * bounding box around a point. Note that the bounds will not be "empty" as it contains (x,y,z), but it will have
   * zero area.
   */ static point(x, y, z) {
        return new Bounds3(x, y, z, x, y, z);
    }
    /**
   * Creates a 3-dimensional bounds (bounding box).
   *
   * @param minX - The initial minimum X coordinate of the bounds.
   * @param minY - The initial minimum Y coordinate of the bounds.
   * @param minZ - The initial minimum Z coordinate of the bounds.
   * @param maxX - The initial maximum X coordinate of the bounds.
   * @param maxY - The initial maximum Y coordinate of the bounds.
   * @param maxZ - The initial maximum Z coordinate of the bounds.
   */ constructor(minX, minY, minZ, maxX, maxY, maxZ){
        this.minX = minX;
        this.minY = minY;
        this.minZ = minZ;
        this.maxX = maxX;
        this.maxY = maxY;
        this.maxZ = maxZ;
        this.isBounds = true;
        this.dimension = 3;
        assert && assert(maxY !== undefined, 'Bounds3 requires 4 parameters');
    }
};
/**
   * A constant Bounds3 with minimums = $\infty$, maximums = $-\infty$, so that it represents "no bounds whatsoever".
   *
   * This allows us to take the union (union/includeBounds) of this and any other Bounds3 to get the other bounds back,
   * e.g. Bounds3.NOTHING.union( bounds ).equals( bounds ). This object naturally serves as the base case as a union of
   * zero bounds objects.
   *
   * Additionally, intersections with NOTHING will always return a Bounds3 equivalent to NOTHING.
   *
   * @constant {Bounds3} NOTHING
   */ Bounds3.NOTHING = new Bounds3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
/**
   * A constant Bounds3 with minimums = $-\infty$, maximums = $\infty$, so that it represents "all bounds".
   *
   * This allows us to take the intersection (intersection/constrainBounds) of this and any other Bounds3 to get the
   * other bounds back, e.g. Bounds3.EVERYTHING.intersection( bounds ).equals( bounds ). This object naturally serves as
   * the base case as an intersection of zero bounds objects.
   *
   * Additionally, unions with EVERYTHING will always return a Bounds3 equivalent to EVERYTHING.
   *
   * @constant {Bounds3} EVERYTHING
   */ Bounds3.EVERYTHING = new Bounds3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
Bounds3.Bounds3IO = new IOType('Bounds3IO', {
    valueType: Bounds3,
    documentation: 'a 3-dimensional bounds (bounding box)',
    stateSchema: {
        minX: NumberIO,
        minY: NumberIO,
        minZ: NumberIO,
        maxX: NumberIO,
        maxY: NumberIO,
        maxZ: NumberIO
    },
    toStateObject: (bounds3)=>({
            minX: bounds3.minX,
            minY: bounds3.minY,
            minZ: bounds3.minZ,
            maxX: bounds3.maxX,
            maxY: bounds3.maxY,
            maxZ: bounds3.maxZ
        }),
    fromStateObject: (stateObject)=>new Bounds3(stateObject.minX, stateObject.minY, stateObject.minZ, stateObject.maxX, stateObject.maxY, stateObject.maxZ)
});
dot.register('Bounds3', Bounds3);
Poolable.mixInto(Bounds3, {
    initialize: Bounds3.prototype.setMinMax
});
export default Bounds3;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgM0QgY3Vib2lkLXNoYXBlZCBib3VuZGVkIGFyZWEgKGJvdW5kaW5nIGJveCkuXG4gKlxuICogVGhlcmUgYXJlIGEgbnVtYmVyIG9mIGNvbnZlbmllbmNlIGZ1bmN0aW9ucyB0byBnZXQgbG9jYXRpb25zIGFuZCBwb2ludHMgb24gdGhlIEJvdW5kcy4gQ3VycmVudGx5IHdlIGRvIG5vdFxuICogc3RvcmUgdGhlc2Ugd2l0aCB0aGUgQm91bmRzMyBpbnN0YW5jZSwgc2luY2Ugd2Ugd2FudCB0byBsb3dlciB0aGUgbWVtb3J5IGZvb3RwcmludC5cbiAqXG4gKiBtaW5YLCBtaW5ZLCBtaW5aLCBtYXhYLCBtYXhZLCBhbmQgbWF4WiBhcmUgYWN0dWFsbHkgc3RvcmVkLiBXZSBkb24ndCBkbyB4LHkseix3aWR0aCxoZWlnaHQsZGVwdGggYmVjYXVzZSB0aGlzIGNhbid0IHByb3Blcmx5IGV4cHJlc3NcbiAqIHNlbWktaW5maW5pdGUgYm91bmRzIChsaWtlIGEgaGFsZi1wbGFuZSksIG9yIGVhc2lseSBoYW5kbGUgd2hhdCBCb3VuZHMzLk5PVEhJTkcgYW5kIEJvdW5kczMuRVZFUllUSElORyBkbyB3aXRoXG4gKiB0aGUgY29uc3RydWN0aXZlIHNvbGlkIGFyZWFzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IE1hdHJpeDQgZnJvbSAnLi9NYXRyaXg0LmpzJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XG5cbmNsYXNzIEJvdW5kczMge1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgMy1kaW1lbnNpb25hbCBib3VuZHMgKGJvdW5kaW5nIGJveCkuXG4gICAqXG4gICAqIEBwYXJhbSBtaW5YIC0gVGhlIGluaXRpYWwgbWluaW11bSBYIGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcy5cbiAgICogQHBhcmFtIG1pblkgLSBUaGUgaW5pdGlhbCBtaW5pbXVtIFkgY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxuICAgKiBAcGFyYW0gbWluWiAtIFRoZSBpbml0aWFsIG1pbmltdW0gWiBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXG4gICAqIEBwYXJhbSBtYXhYIC0gVGhlIGluaXRpYWwgbWF4aW11bSBYIGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcy5cbiAgICogQHBhcmFtIG1heFkgLSBUaGUgaW5pdGlhbCBtYXhpbXVtIFkgY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxuICAgKiBAcGFyYW0gbWF4WiAtIFRoZSBpbml0aWFsIG1heGltdW0gWiBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG1pblg6IG51bWJlcixcbiAgICBwdWJsaWMgbWluWTogbnVtYmVyLFxuICAgIHB1YmxpYyBtaW5aOiBudW1iZXIsXG4gICAgcHVibGljIG1heFg6IG51bWJlcixcbiAgICBwdWJsaWMgbWF4WTogbnVtYmVyLFxuICAgIHB1YmxpYyBtYXhaOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF4WSAhPT0gdW5kZWZpbmVkLCAnQm91bmRzMyByZXF1aXJlcyA0IHBhcmFtZXRlcnMnICk7XG4gIH1cblxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBQcm9wZXJ0aWVzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogVGhlIHdpZHRoIG9mIHRoZSBib3VuZHMsIGRlZmluZWQgYXMgbWF4WCAtIG1pblguXG4gICAqL1xuICBwdWJsaWMgZ2V0V2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWF4WCAtIHRoaXMubWluWDsgfVxuXG4gIHB1YmxpYyBnZXQgd2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBib3VuZHMsIGRlZmluZWQgYXMgbWF4WSAtIG1pblkuXG4gICAqL1xuICBwdWJsaWMgZ2V0SGVpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1heFkgLSB0aGlzLm1pblk7IH1cblxuICBwdWJsaWMgZ2V0IGhlaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRIZWlnaHQoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgZGVwdGggb2YgdGhlIGJvdW5kcywgZGVmaW5lZCBhcyBtYXhaIC0gbWluWi5cbiAgICovXG4gIHB1YmxpYyBnZXREZXB0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhaIC0gdGhpcy5taW5aOyB9XG5cbiAgcHVibGljIGdldCBkZXB0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXREZXB0aCgpOyB9XG5cbiAgLypcbiAgICogQ29udmVuaWVuY2UgbG9jYXRpb25zXG4gICAqIHVwcGVyIGlzIGluIHRlcm1zIG9mIHRoZSB2aXN1YWwgbGF5b3V0IGluIFNjZW5lcnkgYW5kIG90aGVyIHByb2dyYW1zLCBzbyB0aGUgbWluWSBpcyB0aGUgXCJ1cHBlclwiLCBhbmQgbWluWSBpcyB0aGUgXCJsb3dlclwiXG4gICAqXG4gICAqICAgICAgICAgICAgIG1pblggKHgpICAgICBjZW50ZXJYICAgICAgICBtYXhYXG4gICAqICAgICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBtaW5ZICh5KSB8IHVwcGVyTGVmdCAgIHVwcGVyQ2VudGVyICAgdXBwZXJSaWdodFxuICAgKiBjZW50ZXJZICB8IGNlbnRlckxlZnQgICAgY2VudGVyICAgICAgY2VudGVyUmlnaHRcbiAgICogbWF4WSAgICAgfCBsb3dlckxlZnQgICBsb3dlckNlbnRlciAgIGxvd2VyUmlnaHRcbiAgICovXG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5YLCB3aGVuIHRoaW5raW5nIG9mIHRoZSBib3VuZHMgYXMgYW4gKHgseSx6LHdpZHRoLGhlaWdodCxkZXB0aCkgY3Vib2lkLlxuICAgKi9cbiAgcHVibGljIGdldFgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluWDsgfVxuXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRYKCk7IH1cblxuICAvKipcbiAgICogQWxpYXMgZm9yIG1pblksIHdoZW4gdGhpbmtpbmcgb2YgdGhlIGJvdW5kcyBhcyBhbiAoeCx5LHosd2lkdGgsaGVpZ2h0LGRlcHRoKSBjdWJvaWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0WSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5ZOyB9XG5cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFkoKTsgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3IgbWluWiwgd2hlbiB0aGlua2luZyBvZiB0aGUgYm91bmRzIGFzIGFuICh4LHkseix3aWR0aCxoZWlnaHQsZGVwdGgpIGN1Ym9pZC5cbiAgICovXG4gIHB1YmxpYyBnZXRaKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1pblo7IH1cblxuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0WigpOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5YLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWluWCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5YOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5ZLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWluWSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5ZOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5aLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWluWigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5aOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtYXhYLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWF4WCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhYOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtYXhZLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWF4WSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhZOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtYXhaLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWF4WigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhaOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5YLCB3aGVuIHRoaW5raW5nIGluIHRoZSBVSS1sYXlvdXQgbWFubmVyLlxuICAgKi9cbiAgcHVibGljIGdldExlZnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluWDsgfVxuXG4gIHB1YmxpYyBnZXQgbGVmdCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5YOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtaW5ZLCB3aGVuIHRoaW5raW5nIGluIHRoZSBVSS1sYXlvdXQgbWFubmVyLlxuICAgKi9cbiAgcHVibGljIGdldFRvcCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5ZOyB9XG5cbiAgcHVibGljIGdldCB0b3AoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluWTsgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3IgbWluWiwgd2hlbiB0aGlua2luZyBpbiB0aGUgVUktbGF5b3V0IG1hbm5lci5cbiAgICovXG4gIHB1YmxpYyBnZXRCYWNrKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1pblo7IH1cblxuICBwdWJsaWMgZ2V0IGJhY2soKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluWjsgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3IgbWF4WCwgd2hlbiB0aGlua2luZyBpbiB0aGUgVUktbGF5b3V0IG1hbm5lci5cbiAgICovXG4gIHB1YmxpYyBnZXRSaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhYOyB9XG5cbiAgcHVibGljIGdldCByaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhYOyB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBtYXhZLCB3aGVuIHRoaW5raW5nIGluIHRoZSBVSS1sYXlvdXQgbWFubmVyLlxuICAgKi9cbiAgcHVibGljIGdldEJvdHRvbSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhZOyB9XG5cbiAgcHVibGljIGdldCBib3R0b20oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWF4WTsgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3IgbWF4Wiwgd2hlbiB0aGlua2luZyBpbiB0aGUgVUktbGF5b3V0IG1hbm5lci5cbiAgICovXG4gIHB1YmxpYyBnZXRGcm9udCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhaOyB9XG5cbiAgcHVibGljIGdldCBmcm9udCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhaOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBob3Jpem9udGFsIChYLWNvb3JkaW5hdGUpIGNlbnRlciBvZiB0aGUgYm91bmRzLCBhdmVyYWdpbmcgdGhlIG1pblggYW5kIG1heFguXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2VudGVyWCgpOiBudW1iZXIgeyByZXR1cm4gKCB0aGlzLm1heFggKyB0aGlzLm1pblggKSAvIDI7IH1cblxuICBwdWJsaWMgZ2V0IGNlbnRlclgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyWCgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSB2ZXJ0aWNhbCAoWS1jb29yZGluYXRlKSBjZW50ZXIgb2YgdGhlIGJvdW5kcywgYXZlcmFnaW5nIHRoZSBtaW5ZIGFuZCBtYXhZLlxuICAgKi9cbiAgcHVibGljIGdldENlbnRlclkoKTogbnVtYmVyIHsgcmV0dXJuICggdGhpcy5tYXhZICsgdGhpcy5taW5ZICkgLyAyOyB9XG5cbiAgcHVibGljIGdldCBjZW50ZXJZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldENlbnRlclkoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgZGVwdGh3aXNlIChaLWNvb3JkaW5hdGUpIGNlbnRlciBvZiB0aGUgYm91bmRzLCBhdmVyYWdpbmcgdGhlIG1pblogYW5kIG1heFouXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2VudGVyWigpOiBudW1iZXIgeyByZXR1cm4gKCB0aGlzLm1heFogKyB0aGlzLm1pblogKSAvIDI7IH1cblxuICBwdWJsaWMgZ2V0IGNlbnRlclooKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyWigpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBwb2ludCAoY2VudGVyWCwgY2VudGVyWSwgY2VudGVyWiksIGluIHRoZSBjZW50ZXIgb2YgdGhlIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBnZXRDZW50ZXIoKTogVmVjdG9yMyB7IHJldHVybiBuZXcgVmVjdG9yMyggdGhpcy5nZXRDZW50ZXJYKCksIHRoaXMuZ2V0Q2VudGVyWSgpLCB0aGlzLmdldENlbnRlclooKSApOyB9XG5cbiAgcHVibGljIGdldCBjZW50ZXIoKTogVmVjdG9yMyB7IHJldHVybiB0aGlzLmdldENlbnRlcigpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdm9sdW1lIG9mIHRoZSBCb3VuZHMzIGFzIGlmIGl0IHdlcmUgYSBjdWJlLlxuICAgKi9cbiAgcHVibGljIGdldCB2b2x1bWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIHRoaXMuZGVwdGg7fVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHdlIGhhdmUgbmVnYXRpdmUgd2lkdGgsIGhlaWdodCBvciBkZXB0aC4gQm91bmRzMy5OT1RISU5HIGlzIGEgcHJpbWUgZXhhbXBsZSBvZiBhbiBlbXB0eSBCb3VuZHMzLlxuICAgKiBCb3VuZHMgd2l0aCB3aWR0aCA9IGhlaWdodCA9IGRlcHRoID0gMCBhcmUgY29uc2lkZXJlZCBub3QgZW1wdHksIHNpbmNlIHRoZXkgaW5jbHVkZSB0aGUgc2luZ2xlICgwLDAsMCkgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgaXNFbXB0eSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKSA8IDAgfHwgdGhpcy5nZXRIZWlnaHQoKSA8IDAgfHwgdGhpcy5nZXREZXB0aCgpIDwgMDsgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG91ciBtaW5pbXVtcyBhbmQgbWF4aW11bXMgYXJlIGFsbCBmaW5pdGUgbnVtYmVycy4gVGhpcyB3aWxsIGV4Y2x1ZGUgQm91bmRzMy5OT1RISU5HIGFuZCBCb3VuZHMzLkVWRVJZVEhJTkcuXG4gICAqL1xuICBwdWJsaWMgaXNGaW5pdGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRmluaXRlKCB0aGlzLm1pblggKSAmJiBpc0Zpbml0ZSggdGhpcy5taW5ZICkgJiYgaXNGaW5pdGUoIHRoaXMubWluWiApICYmIGlzRmluaXRlKCB0aGlzLm1heFggKSAmJiBpc0Zpbml0ZSggdGhpcy5tYXhZICkgJiYgaXNGaW5pdGUoIHRoaXMubWF4WiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBib3VuZHMgaGFzIGEgbm9uLXplcm8gdm9sdW1lIChub24temVybyBwb3NpdGl2ZSB3aWR0aCwgaGVpZ2h0IGFuZCBkZXB0aCkuXG4gICAqL1xuICBwdWJsaWMgaGFzTm9uemVyb1ZvbHVtZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRXaWR0aCgpID4gMCAmJiB0aGlzLmdldEhlaWdodCgpID4gMCAmJiB0aGlzLmdldERlcHRoKCkgPiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBib3VuZHMgaGFzIGEgZmluaXRlIGFuZCBub24tbmVnYXRpdmUgd2lkdGgsIGhlaWdodCBhbmQgZGVwdGguXG4gICAqL1xuICBwdWJsaWMgaXNWYWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuaXNFbXB0eSgpICYmIHRoaXMuaXNGaW5pdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjb29yZGluYXRlcyBhcmUgY29udGFpbmVkIGluc2lkZSB0aGUgYm91bmRpbmcgYm94LCBvciBhcmUgb24gdGhlIGJvdW5kYXJ5LlxuICAgKlxuICAgKiBAcGFyYW0geCAtIFggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gY2hlY2tcbiAgICogQHBhcmFtIHkgLSBZIGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50IHRvIGNoZWNrXG4gICAqIEBwYXJhbSB6IC0gWiBjb29yZGluYXRlIG9mIHRoZSBwb2ludCB0byBjaGVja1xuICAgKi9cbiAgcHVibGljIGNvbnRhaW5zQ29vcmRpbmF0ZXMoIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWluWCA8PSB4ICYmIHggPD0gdGhpcy5tYXhYICYmIHRoaXMubWluWSA8PSB5ICYmIHkgPD0gdGhpcy5tYXhZICYmIHRoaXMubWluWiA8PSB6ICYmIHogPD0gdGhpcy5tYXhaO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHBvaW50IGlzIGNvbnRhaW5lZCBpbnNpZGUgdGhlIGJvdW5kaW5nIGJveCwgb3IgaXMgb24gdGhlIGJvdW5kYXJ5LlxuICAgKi9cbiAgcHVibGljIGNvbnRhaW5zUG9pbnQoIHBvaW50OiBWZWN0b3IzICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW5zQ29vcmRpbmF0ZXMoIHBvaW50LngsIHBvaW50LnksIHBvaW50LnogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgYm91bmRpbmcgYm94IGNvbXBsZXRlbHkgY29udGFpbnMgdGhlIGJvdW5kaW5nIGJveCBwYXNzZWQgYXMgYSBwYXJhbWV0ZXIuIFRoZSBib3VuZGFyeSBvZiBhIGJveCBpc1xuICAgKiBjb25zaWRlcmVkIHRvIGJlIFwiY29udGFpbmVkXCIuXG4gICAqL1xuICBwdWJsaWMgY29udGFpbnNCb3VuZHMoIGJvdW5kczogQm91bmRzMyApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5taW5YIDw9IGJvdW5kcy5taW5YICYmIHRoaXMubWF4WCA+PSBib3VuZHMubWF4WCAmJiB0aGlzLm1pblkgPD0gYm91bmRzLm1pblkgJiYgdGhpcy5tYXhZID49IGJvdW5kcy5tYXhZICYmIHRoaXMubWluWiA8PSBib3VuZHMubWluWiAmJiB0aGlzLm1heFogPj0gYm91bmRzLm1heFo7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGFuZCBhbm90aGVyIGJvdW5kaW5nIGJveCBoYXZlIGFueSBwb2ludHMgb2YgaW50ZXJzZWN0aW9uIChpbmNsdWRpbmcgdG91Y2hpbmcgYm91bmRhcmllcykuXG4gICAqL1xuICBwdWJsaWMgaW50ZXJzZWN0c0JvdW5kcyggYm91bmRzOiBCb3VuZHMzICk6IGJvb2xlYW4ge1xuICAgIC8vIFRPRE86IG1vcmUgZWZmaWNpZW50IHdheSBvZiBkb2luZyB0aGlzPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgIHJldHVybiAhdGhpcy5pbnRlcnNlY3Rpb24oIGJvdW5kcyApLmlzRW1wdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWJ1Z2dpbmcgc3RyaW5nIGZvciB0aGUgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBbeDooJHt0aGlzLm1pblh9LCR7dGhpcy5tYXhYfSkseTooJHt0aGlzLm1pbll9LCR7dGhpcy5tYXhZfSksejooJHt0aGlzLm1pblp9LCR7dGhpcy5tYXhafSldYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGFjdCBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyBib3VuZHMgYW5kIGFub3RoZXIgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGVxdWFscyggb3RoZXI6IEJvdW5kczMgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWluWCA9PT0gb3RoZXIubWluWCAmJlxuICAgICAgICAgICB0aGlzLm1pblkgPT09IG90aGVyLm1pblkgJiZcbiAgICAgICAgICAgdGhpcy5taW5aID09PSBvdGhlci5taW5aICYmXG4gICAgICAgICAgIHRoaXMubWF4WCA9PT0gb3RoZXIubWF4WCAmJlxuICAgICAgICAgICB0aGlzLm1heFkgPT09IG90aGVyLm1heFkgJiZcbiAgICAgICAgICAgdGhpcy5tYXhaID09PSBvdGhlci5tYXhaO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcHJveGltYXRlIGVxdWFsaXR5IGNvbXBhcmlzb24gYmV0d2VlbiB0aGlzIGJvdW5kcyBhbmQgYW5vdGhlciBib3VuZHMuXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHR3byBib3VuZHMgaGFzIG5vIG1pbi9tYXggd2l0aCBhbiBhYnNvbHV0ZSB2YWx1ZSBncmVhdGVyIHRoYW4gZXBzaWxvbi5cbiAgICovXG4gIHB1YmxpYyBlcXVhbHNFcHNpbG9uKCBvdGhlcjogQm91bmRzMywgZXBzaWxvbjogbnVtYmVyICk6IGJvb2xlYW4ge1xuICAgIGVwc2lsb24gPSBlcHNpbG9uICE9PSB1bmRlZmluZWQgPyBlcHNpbG9uIDogMDtcbiAgICBjb25zdCB0aGlzRmluaXRlID0gdGhpcy5pc0Zpbml0ZSgpO1xuICAgIGNvbnN0IG90aGVyRmluaXRlID0gb3RoZXIuaXNGaW5pdGUoKTtcbiAgICBpZiAoIHRoaXNGaW5pdGUgJiYgb3RoZXJGaW5pdGUgKSB7XG4gICAgICAvLyBib3RoIGFyZSBmaW5pdGUsIHNvIHdlIGNhbiB1c2UgTWF0aC5hYnMoKSAtIGl0IHdvdWxkIGZhaWwgd2l0aCBub24tZmluaXRlIHZhbHVlcyBsaWtlIEluZmluaXR5XG4gICAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMubWluWCAtIG90aGVyLm1pblggKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgICBNYXRoLmFicyggdGhpcy5taW5ZIC0gb3RoZXIubWluWSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm1pblogLSBvdGhlci5taW5aICkgPCBlcHNpbG9uICYmXG4gICAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubWF4WCAtIG90aGVyLm1heFggKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tYXhZIC0gb3RoZXIubWF4WSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm1heFogLSBvdGhlci5tYXhaICkgPCBlcHNpbG9uO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpc0Zpbml0ZSAhPT0gb3RoZXJGaW5pdGUgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIG9uZSBpcyBmaW5pdGUsIHRoZSBvdGhlciBpcyBub3QuIGRlZmluaXRlbHkgbm90IGVxdWFsXG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzID09PSBvdGhlciApIHtcbiAgICAgIHJldHVybiB0cnVlOyAvLyBleGFjdCBzYW1lIGluc3RhbmNlLCBtdXN0IGJlIGVxdWFsXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gZXBzaWxvbiBvbmx5IGFwcGxpZXMgb24gZmluaXRlIGRpbWVuc2lvbnMuIGR1ZSB0byBKUydzIGhhbmRsaW5nIG9mIGlzRmluaXRlKCksIGl0J3MgZmFzdGVyIHRvIGNoZWNrIHRoZSBzdW0gb2YgYm90aFxuICAgICAgcmV0dXJuICggaXNGaW5pdGUoIHRoaXMubWluWCArIG90aGVyLm1pblggKSA/ICggTWF0aC5hYnMoIHRoaXMubWluWCAtIG90aGVyLm1pblggKSA8IGVwc2lsb24gKSA6ICggdGhpcy5taW5YID09PSBvdGhlci5taW5YICkgKSAmJlxuICAgICAgICAgICAgICggaXNGaW5pdGUoIHRoaXMubWluWSArIG90aGVyLm1pblkgKSA/ICggTWF0aC5hYnMoIHRoaXMubWluWSAtIG90aGVyLm1pblkgKSA8IGVwc2lsb24gKSA6ICggdGhpcy5taW5ZID09PSBvdGhlci5taW5ZICkgKSAmJlxuICAgICAgICAgICAgICggaXNGaW5pdGUoIHRoaXMubWluWiArIG90aGVyLm1pblogKSA/ICggTWF0aC5hYnMoIHRoaXMubWluWiAtIG90aGVyLm1pblogKSA8IGVwc2lsb24gKSA6ICggdGhpcy5taW5aID09PSBvdGhlci5taW5aICkgKSAmJlxuICAgICAgICAgICAgICggaXNGaW5pdGUoIHRoaXMubWF4WCArIG90aGVyLm1heFggKSA/ICggTWF0aC5hYnMoIHRoaXMubWF4WCAtIG90aGVyLm1heFggKSA8IGVwc2lsb24gKSA6ICggdGhpcy5tYXhYID09PSBvdGhlci5tYXhYICkgKSAmJlxuICAgICAgICAgICAgICggaXNGaW5pdGUoIHRoaXMubWF4WSArIG90aGVyLm1heFkgKSA/ICggTWF0aC5hYnMoIHRoaXMubWF4WSAtIG90aGVyLm1heFkgKSA8IGVwc2lsb24gKSA6ICggdGhpcy5tYXhZID09PSBvdGhlci5tYXhZICkgKSAmJlxuICAgICAgICAgICAgICggaXNGaW5pdGUoIHRoaXMubWF4WiArIG90aGVyLm1heFogKSA/ICggTWF0aC5hYnMoIHRoaXMubWF4WiAtIG90aGVyLm1heFogKSA8IGVwc2lsb24gKSA6ICggdGhpcy5tYXhaID09PSBvdGhlci5tYXhaICkgKTtcbiAgICB9XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogSW1tdXRhYmxlIG9wZXJhdGlvbnNcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIGJvdW5kcywgb3IgaWYgYSBib3VuZHMgaXMgcGFzc2VkIGluLCBzZXQgdGhhdCBib3VuZHMncyB2YWx1ZXMgdG8gb3Vycy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldCgpLCBpZiBhIGJvdW5kcyBpcyBwcm92aWRlZC4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZFxuICAgKiB3aWxsIG5vdCBtb2RpZnkgdGhpcyBib3VuZHMuXG4gICAqIEBwYXJhbSBib3VuZHMgLSBJZiBub3QgcHJvdmlkZWQsIGNyZWF0ZXMgYSBuZXcgQm91bmRzMyB3aXRoIGZpbGxlZCBpbiB2YWx1ZXMuIE90aGVyd2lzZSwgZmlsbHMgaW4gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgb2YgdGhlIHByb3ZpZGVkIGJvdW5kcyBzbyB0aGF0IGl0IGVxdWFscyB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBjb3B5KCBib3VuZHM/OiBCb3VuZHMzICk6IEJvdW5kczMge1xuICAgIGlmICggYm91bmRzICkge1xuICAgICAgcmV0dXJuIGJvdW5kcy5zZXQoIHRoaXMgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblosIHRoaXMubWF4WCwgdGhpcy5tYXhZLCB0aGlzLm1heFogKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNtYWxsZXN0IGJvdW5kcyB0aGF0IGNvbnRhaW5zIGJvdGggdGhpcyBib3VuZHMgYW5kIHRoZSBpbnB1dCBib3VuZHMsIHJldHVybmVkIGFzIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGluY2x1ZGVCb3VuZHMoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgdW5pb24oIGJvdW5kczogQm91bmRzMyApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5YLCBib3VuZHMubWluWCApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgYm91bmRzLm1pblkgKSxcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblosIGJvdW5kcy5taW5aICksXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhYLCBib3VuZHMubWF4WCApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WSwgYm91bmRzLm1heFkgKSxcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFosIGJvdW5kcy5tYXhaIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzbWFsbGVzdCBib3VuZHMgdGhhdCBpcyBjb250YWluZWQgYnkgYm90aCB0aGlzIGJvdW5kcyBhbmQgdGhlIGlucHV0IGJvdW5kcywgcmV0dXJuZWQgYXMgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gY29uc3RyYWluQm91bmRzKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGludGVyc2VjdGlvbiggYm91bmRzOiBCb3VuZHMzICk6IEJvdW5kczMge1xuICAgIHJldHVybiBuZXcgQm91bmRzMyhcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1pblgsIGJvdW5kcy5taW5YICksXG4gICAgICBNYXRoLm1heCggdGhpcy5taW5ZLCBib3VuZHMubWluWSApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWluWiwgYm91bmRzLm1pblogKSxcbiAgICAgIE1hdGgubWluKCB0aGlzLm1heFgsIGJvdW5kcy5tYXhYICksXG4gICAgICBNYXRoLm1pbiggdGhpcy5tYXhZLCBib3VuZHMubWF4WSApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWF4WiwgYm91bmRzLm1heFogKVxuICAgICk7XG4gIH1cblxuICAvLyBUT0RPOiBkaWZmZXJlbmNlIHNob3VsZCBiZSB3ZWxsLWRlZmluZWQsIGJ1dCBtb3JlIGxvZ2ljIGlzIG5lZWRlZCB0byBjb21wdXRlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG5cbiAgLyoqXG4gICAqIFRoZSBzbWFsbGVzdCBib3VuZHMgdGhhdCBjb250YWlucyB0aGlzIGJvdW5kcyBhbmQgdGhlIHBvaW50ICh4LHkseiksIHJldHVybmVkIGFzIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZENvb3JkaW5hdGVzKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHdpdGhDb29yZGluYXRlcyggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5YLCB4ICksXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5ZLCB5ICksXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5aLCB6ICksXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhYLCB4ICksXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhZLCB5ICksXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhaLCB6IClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzbWFsbGVzdCBib3VuZHMgdGhhdCBjb250YWlucyB0aGlzIGJvdW5kcyBhbmQgdGhlIGlucHV0IHBvaW50LCByZXR1cm5lZCBhcyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBhZGRQb2ludCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyB3aXRoUG9pbnQoIHBvaW50OiBWZWN0b3IzICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLndpdGhDb29yZGluYXRlcyggcG9pbnQueCwgcG9pbnQueSwgcG9pbnQueiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgY29weSBvZiB0aGlzIGJvdW5kcywgd2l0aCBtaW5YIHJlcGxhY2VkIHdpdGggdGhlIGlucHV0LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0TWluWCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyB3aXRoTWluWCggbWluWDogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiBuZXcgQm91bmRzMyggbWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblosIHRoaXMubWF4WCwgdGhpcy5tYXhZLCB0aGlzLm1heFogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGNvcHkgb2YgdGhpcyBib3VuZHMsIHdpdGggbWluWSByZXBsYWNlZCB3aXRoIHRoZSBpbnB1dC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldE1pblkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgd2l0aE1pblkoIG1pblk6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCwgbWluWSwgdGhpcy5taW5aLCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICk7XG4gIH1cblxuICAvKipcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1pblogcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNaW5aKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHdpdGhNaW5aKCBtaW5aOiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblgsIHRoaXMubWluWSwgbWluWiwgdGhpcy5tYXhYLCB0aGlzLm1heFksIHRoaXMubWF4WiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgY29weSBvZiB0aGlzIGJvdW5kcywgd2l0aCBtYXhYIHJlcGxhY2VkIHdpdGggdGhlIGlucHV0LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0TWF4WCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyB3aXRoTWF4WCggbWF4WDogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiBuZXcgQm91bmRzMyggdGhpcy5taW5YLCB0aGlzLm1pblksIHRoaXMubWluWiwgbWF4WCwgdGhpcy5tYXhZLCB0aGlzLm1heFogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGNvcHkgb2YgdGhpcyBib3VuZHMsIHdpdGggbWF4WSByZXBsYWNlZCB3aXRoIHRoZSBpbnB1dC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldE1heFkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgd2l0aE1heFkoIG1heFk6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblosIHRoaXMubWF4WCwgbWF4WSwgdGhpcy5tYXhaICk7XG4gIH1cblxuICAvKipcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1heFogcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNYXhaKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHdpdGhNYXhaKCBtYXhaOiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5taW5aLCB0aGlzLm1heFgsIHRoaXMubWF4WSwgbWF4WiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgY29weSBvZiB0aGlzIGJvdW5kcywgd2l0aCB0aGUgbWluaW11bSB2YWx1ZXMgcm91bmRlZCBkb3duIHRvIHRoZSBuZWFyZXN0IGludGVnZXIsIGFuZCB0aGUgbWF4aW11bSB2YWx1ZXNcbiAgICogcm91bmRlZCB1cCB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyLiBUaGlzIGNhdXNlcyB0aGUgYm91bmRzIHRvIGV4cGFuZCBhcyBuZWNlc3Nhcnkgc28gdGhhdCBpdHMgYm91bmRhcmllc1xuICAgKiBhcmUgaW50ZWdlci1hbGlnbmVkLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRPdXQoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgcm91bmRlZE91dCgpOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1pblggKSxcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWluWSApLFxuICAgICAgTWF0aC5mbG9vciggdGhpcy5taW5aICksXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWF4WCApLFxuICAgICAgTWF0aC5jZWlsKCB0aGlzLm1heFkgKSxcbiAgICAgIE1hdGguY2VpbCggdGhpcy5tYXhaIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgY29weSBvZiB0aGlzIGJvdW5kcywgd2l0aCB0aGUgbWluaW11bSB2YWx1ZXMgcm91bmRlZCB1cCB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyLCBhbmQgdGhlIG1heGltdW0gdmFsdWVzXG4gICAqIHJvdW5kZWQgZG93biB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyLiBUaGlzIGNhdXNlcyB0aGUgYm91bmRzIHRvIGNvbnRyYWN0IGFzIG5lY2Vzc2FyeSBzbyB0aGF0IGl0cyBib3VuZGFyaWVzXG4gICAqIGFyZSBpbnRlZ2VyLWFsaWduZWQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiByb3VuZEluKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHJvdW5kZWRJbigpOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWluWCApLFxuICAgICAgTWF0aC5jZWlsKCB0aGlzLm1pblkgKSxcbiAgICAgIE1hdGguY2VpbCggdGhpcy5taW5aICksXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1heFggKSxcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWF4WSApLFxuICAgICAgTWF0aC5mbG9vciggdGhpcy5tYXhaIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgYm91bmRpbmcgYm94IChzdGlsbCBheGlzLWFsaWduZWQpIHRoYXQgY29udGFpbnMgdGhlIHRyYW5zZm9ybWVkIHNoYXBlIG9mIHRoaXMgYm91bmRzLCBhcHBseWluZyB0aGUgbWF0cml4IGFzXG4gICAqIGFuIGFmZmluZSB0cmFuc2Zvcm1hdGlvbi5cbiAgICpcbiAgICogTk9URTogYm91bmRzLnRyYW5zZm9ybWVkKCBtYXRyaXggKS50cmFuc2Zvcm1lZCggaW52ZXJzZSApIG1heSBiZSBsYXJnZXIgdGhhbiB0aGUgb3JpZ2luYWwgYm94LCBpZiBpdCBpbmNsdWRlc1xuICAgKiBhIHJvdGF0aW9uIHRoYXQgaXNuJ3QgYSBtdWx0aXBsZSBvZiAkXFxwaS8yJC4gVGhpcyBpcyBiZWNhdXNlIHRoZSByZXR1cm5lZCBib3VuZHMgbWF5IGV4cGFuZCBpbiBhcmVhIHRvIGNvdmVyXG4gICAqIEFMTCBvZiB0aGUgY29ybmVycyBvZiB0aGUgdHJhbnNmb3JtZWQgYm91bmRpbmcgYm94LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gdHJhbnNmb3JtKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHRyYW5zZm9ybWVkKCBtYXRyaXg6IE1hdHJpeDQgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIHRoaXMuY29weSgpLnRyYW5zZm9ybSggbWF0cml4ICk7XG4gIH1cblxuICAvKipcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBleHBhbmRlZCBvbiBhbGwgc2lkZXMgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuKVxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZWQoIGQ6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5kaWxhdGVkWFlaKCBkLCBkLCBkICk7XG4gIH1cblxuICAvKipcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBleHBhbmRlZCBob3Jpem9udGFsbHkgKG9uIHRoZSBsZWZ0IGFuZCByaWdodCkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVYKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZWRYKCB4OiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblggLSB4LCB0aGlzLm1pblksIHRoaXMubWluWiwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZLCB0aGlzLm1heFogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGV4cGFuZGVkIHZlcnRpY2FsbHkgKG9uIHRoZSB0b3AgYW5kIGJvdHRvbSkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZWRZKCB5OiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblgsIHRoaXMubWluWSAtIHksIHRoaXMubWluWiwgdGhpcy5tYXhYLCB0aGlzLm1heFkgKyB5LCB0aGlzLm1heFogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGV4cGFuZGVkIGRlcHRoLXdpc2UgKG9uIHRoZSBmcm9udCBhbmQgYmFjaykgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVaKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZWRaKCB6OiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5taW5aIC0geiwgdGhpcy5tYXhYLCB0aGlzLm1heFksIHRoaXMubWF4WiArIHogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGV4cGFuZGVkIG9uIGFsbCBzaWRlcywgd2l0aCBkaWZmZXJlbnQgYW1vdW50cyBvZiBleHBhbnNpb24gYWxvbmcgZWFjaCBheGlzLlxuICAgKiBXaWxsIGJlIGlkZW50aWNhbCB0byB0aGUgYm91bmRzIHJldHVybmVkIGJ5IGNhbGxpbmcgYm91bmRzLmRpbGF0ZWRYKCB4ICkuZGlsYXRlZFkoIHkgKS5kaWxhdGVkWiggeiApLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlWFlaKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKiBAcGFyYW0geCAtIEFtb3VudCB0byBkaWxhdGUgaG9yaXpvbnRhbGx5IChmb3IgZWFjaCBzaWRlKVxuICAgKiBAcGFyYW0geSAtIEFtb3VudCB0byBkaWxhdGUgdmVydGljYWxseSAoZm9yIGVhY2ggc2lkZSlcbiAgICogQHBhcmFtIHogLSBBbW91bnQgdG8gZGlsYXRlIGRlcHRoLXdpc2UgKGZvciBlYWNoIHNpZGUpXG4gICAqL1xuICBwdWJsaWMgZGlsYXRlZFhZWiggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCAtIHgsIHRoaXMubWluWSAtIHksIHRoaXMubWluWiAtIHosIHRoaXMubWF4WCArIHgsIHRoaXMubWF4WSArIHksIHRoaXMubWF4WiArIHogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGNvbnRyYWN0ZWQgb24gYWxsIHNpZGVzIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZXJvZGVkKCBhbW91bnQ6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5kaWxhdGVkKCAtYW1vdW50ICk7XG4gIH1cblxuICAvKipcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBjb250cmFjdGVkIGhvcml6b250YWxseSAob24gdGhlIGxlZnQgYW5kIHJpZ2h0KSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlWCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBlcm9kZWRYKCB4OiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIHRoaXMuZGlsYXRlZFgoIC14ICk7XG4gIH1cblxuICAvKipcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBjb250cmFjdGVkIHZlcnRpY2FsbHkgKG9uIHRoZSB0b3AgYW5kIGJvdHRvbSkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBlcm9kZVkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZXJvZGVkWSggeTogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLmRpbGF0ZWRZKCAteSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgY29udHJhY3RlZCBkZXB0aC13aXNlIChvbiB0aGUgZnJvbnQgYW5kIGJhY2spIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGVaKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGVyb2RlZFooIHo6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5kaWxhdGVkWiggLXogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGNvbnRyYWN0ZWQgb24gYWxsIHNpZGVzLCB3aXRoIGRpZmZlcmVudCBhbW91bnRzIG9mIGNvbnRyYWN0aW9uIGFsb25nIGVhY2ggYXhpcy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlWFlaKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgYm91bmRzLlxuICAgKiBAcGFyYW0geCAtIEFtb3VudCB0byBlcm9kZSBob3Jpem9udGFsbHkgKGZvciBlYWNoIHNpZGUpXG4gICAqIEBwYXJhbSB5IC0gQW1vdW50IHRvIGVyb2RlIHZlcnRpY2FsbHkgKGZvciBlYWNoIHNpZGUpXG4gICAqIEBwYXJhbSB6IC0gQW1vdW50IHRvIGVyb2RlIGRlcHRoLXdpc2UgKGZvciBlYWNoIHNpZGUpXG4gICAqL1xuICBwdWJsaWMgZXJvZGVkWFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLmRpbGF0ZWRYWVooIC14LCAteSwgLXogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdXIgYm91bmRzLCB0cmFuc2xhdGVkIGhvcml6b250YWxseSBieSB4LCByZXR1cm5lZCBhcyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdFgoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2hpZnRlZFgoIHg6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCArIHgsIHRoaXMubWluWSwgdGhpcy5taW5aLCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFksIHRoaXMubWF4WiApO1xuICB9XG5cbiAgLyoqXG4gICAqIE91ciBib3VuZHMsIHRyYW5zbGF0ZWQgdmVydGljYWxseSBieSB5LCByZXR1cm5lZCBhcyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdFkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2hpZnRlZFkoIHk6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCwgdGhpcy5taW5ZICsgeSwgdGhpcy5taW5aLCB0aGlzLm1heFgsIHRoaXMubWF4WSArIHksIHRoaXMubWF4WiApO1xuICB9XG5cbiAgLyoqXG4gICAqIE91ciBib3VuZHMsIHRyYW5zbGF0ZWQgZGVwdGgtd2lzZSBieSB6LCByZXR1cm5lZCBhcyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdFooKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2hpZnRlZFooIHo6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblogKyB6LCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICsgeiApO1xuICB9XG5cbiAgLyoqXG4gICAqIE91ciBib3VuZHMsIHRyYW5zbGF0ZWQgYnkgKHgseSx6KSwgcmV0dXJuZWQgYXMgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2hpZnQoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2hpZnRlZFhZWiggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCArIHgsIHRoaXMubWluWSArIHksIHRoaXMubWluWiArIHosIHRoaXMubWF4WCArIHgsIHRoaXMubWF4WSArIHksIHRoaXMubWF4WiArIHogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG91ciBib3VuZHMsIHRyYW5zbGF0ZWQgYnkgYSB2ZWN0b3IsIHJldHVybmVkIGFzIGEgY29weS5cbiAgICovXG4gIHB1YmxpYyBzaGlmdGVkKCB2OiBWZWN0b3IzICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLnNoaWZ0ZWRYWVooIHYueCwgdi55LCB2LnogKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBNdXRhYmxlIG9wZXJhdGlvbnNcbiAgICpcbiAgICogQWxsIG11dGFibGUgb3BlcmF0aW9ucyBzaG91bGQgY2FsbCBvbmUgb2YgdGhlIGZvbGxvd2luZzpcbiAgICogICBzZXRNaW5NYXgsIHNldE1pblgsIHNldE1pblksIHNldE1pblosIHNldE1heFgsIHNldE1heFksIHNldE1heFpcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBTZXRzIGVhY2ggdmFsdWUgZm9yIHRoaXMgYm91bmRzLCBhbmQgcmV0dXJucyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWluTWF4KCBtaW5YOiBudW1iZXIsIG1pblk6IG51bWJlciwgbWluWjogbnVtYmVyLCBtYXhYOiBudW1iZXIsIG1heFk6IG51bWJlciwgbWF4WjogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHRoaXMubWluWCA9IG1pblg7XG4gICAgdGhpcy5taW5ZID0gbWluWTtcbiAgICB0aGlzLm1pblogPSBtaW5aO1xuICAgIHRoaXMubWF4WCA9IG1heFg7XG4gICAgdGhpcy5tYXhZID0gbWF4WTtcbiAgICB0aGlzLm1heFogPSBtYXhaO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIG1pblguXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gd2l0aE1pblgoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzZXRNaW5YKCBtaW5YOiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgdGhpcy5taW5YID0gbWluWDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBtaW5ZLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNaW5ZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWluWSggbWluWTogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHRoaXMubWluWSA9IG1pblk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgbWluWi5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoTWluWigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNldE1pblooIG1pblo6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICB0aGlzLm1pblogPSBtaW5aO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIG1heFguXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gd2l0aE1heFgoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzZXRNYXhYKCBtYXhYOiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgdGhpcy5tYXhYID0gbWF4WDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBtYXhZLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNYXhZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWF4WSggbWF4WTogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHRoaXMubWF4WSA9IG1heFk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgbWF4Wi5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoTWF4WigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNldE1heFooIG1heFo6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICB0aGlzLm1heFogPSBtYXhaO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlcyBvZiB0aGlzIGJvdW5kcyB0byBiZSBlcXVhbCB0byB0aGUgaW5wdXQgYm91bmRzLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvcHkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzZXQoIGJvdW5kczogQm91bmRzMyApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIGJvdW5kcy5taW5YLCBib3VuZHMubWluWSwgYm91bmRzLm1pblosIGJvdW5kcy5tYXhYLCBib3VuZHMubWF4WSwgYm91bmRzLm1heFogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IGNvbnRhaW5zIGJvdGggaXRzIG9yaWdpbmFsIGJvdW5kcyBhbmQgdGhlIGlucHV0IGJvdW5kcy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB1bmlvbigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGluY2x1ZGVCb3VuZHMoIGJvdW5kczogQm91bmRzMyApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5YLCBib3VuZHMubWluWCApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgYm91bmRzLm1pblkgKSxcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblosIGJvdW5kcy5taW5aICksXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhYLCBib3VuZHMubWF4WCApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WSwgYm91bmRzLm1heFkgKSxcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFosIGJvdW5kcy5tYXhaIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoaXMgYm91bmRzIHNvIHRoYXQgaXQgaXMgdGhlIGxhcmdlc3QgYm91bmRzIGNvbnRhaW5lZCBib3RoIGluIGl0cyBvcmlnaW5hbCBib3VuZHMgYW5kIGluIHRoZSBpbnB1dCBib3VuZHMuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gaW50ZXJzZWN0aW9uKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgY29uc3RyYWluQm91bmRzKCBib3VuZHM6IEJvdW5kczMgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWluWCwgYm91bmRzLm1pblggKSxcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1pblksIGJvdW5kcy5taW5ZICksXG4gICAgICBNYXRoLm1heCggdGhpcy5taW5aLCBib3VuZHMubWluWiApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWF4WCwgYm91bmRzLm1heFggKSxcbiAgICAgIE1hdGgubWluKCB0aGlzLm1heFksIGJvdW5kcy5tYXhZICksXG4gICAgICBNYXRoLm1pbiggdGhpcy5tYXhaLCBib3VuZHMubWF4WiApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IGNvbnRhaW5zIGJvdGggaXRzIG9yaWdpbmFsIGJvdW5kcyBhbmQgdGhlIGlucHV0IHBvaW50ICh4LHkseikuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gd2l0aENvb3JkaW5hdGVzKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgYWRkQ29vcmRpbmF0ZXMoIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KFxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWCwgeCApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgeSApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWiwgeiApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WCwgeCApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WSwgeSApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WiwgeiApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IGNvbnRhaW5zIGJvdGggaXRzIG9yaWdpbmFsIGJvdW5kcyBhbmQgdGhlIGlucHV0IHBvaW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhQb2ludCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGFkZFBvaW50KCBwb2ludDogVmVjdG9yMyApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5hZGRDb29yZGluYXRlcyggcG9pbnQueCwgcG9pbnQueSwgcG9pbnQueiApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoaXMgYm91bmRzIHNvIHRoYXQgaXRzIGJvdW5kYXJpZXMgYXJlIGludGVnZXItYWxpZ25lZCwgcm91bmRpbmcgdGhlIG1pbmltdW0gYm91bmRhcmllcyBkb3duIGFuZCB0aGVcbiAgICogbWF4aW11bSBib3VuZGFyaWVzIHVwIChleHBhbmRpbmcgYXMgbmVjZXNzYXJ5KS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiByb3VuZGVkT3V0KCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgcm91bmRPdXQoKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KFxuICAgICAgTWF0aC5mbG9vciggdGhpcy5taW5YICksXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1pblkgKSxcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWluWiApLFxuICAgICAgTWF0aC5jZWlsKCB0aGlzLm1heFggKSxcbiAgICAgIE1hdGguY2VpbCggdGhpcy5tYXhZICksXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWF4WiApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0cyBib3VuZGFyaWVzIGFyZSBpbnRlZ2VyLWFsaWduZWQsIHJvdW5kaW5nIHRoZSBtaW5pbXVtIGJvdW5kYXJpZXMgdXAgYW5kIHRoZVxuICAgKiBtYXhpbXVtIGJvdW5kYXJpZXMgZG93biAoY29udHJhY3RpbmcgYXMgbmVjZXNzYXJ5KS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiByb3VuZGVkSW4oKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyByb3VuZEluKCk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heChcbiAgICAgIE1hdGguY2VpbCggdGhpcy5taW5YICksXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWluWSApLFxuICAgICAgTWF0aC5jZWlsKCB0aGlzLm1pblogKSxcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWF4WCApLFxuICAgICAgTWF0aC5mbG9vciggdGhpcy5tYXhZICksXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1heFogKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhpcyBib3VuZHMgc28gdGhhdCBpdCB3b3VsZCBmdWxseSBjb250YWluIGEgdHJhbnNmb3JtZWQgdmVyc2lvbiBpZiBpdHMgcHJldmlvdXMgdmFsdWUsIGFwcGx5aW5nIHRoZVxuICAgKiBtYXRyaXggYXMgYW4gYWZmaW5lIHRyYW5zZm9ybWF0aW9uLlxuICAgKlxuICAgKiBOT1RFOiBib3VuZHMudHJhbnNmb3JtKCBtYXRyaXggKS50cmFuc2Zvcm0oIGludmVyc2UgKSBtYXkgYmUgbGFyZ2VyIHRoYW4gdGhlIG9yaWdpbmFsIGJveCwgaWYgaXQgaW5jbHVkZXNcbiAgICogYSByb3RhdGlvbiB0aGF0IGlzbid0IGEgbXVsdGlwbGUgb2YgJFxccGkvMiQuIFRoaXMgaXMgYmVjYXVzZSB0aGUgYm91bmRzIG1heSBleHBhbmQgaW4gYXJlYSB0byBjb3ZlclxuICAgKiBBTEwgb2YgdGhlIGNvcm5lcnMgb2YgdGhlIHRyYW5zZm9ybWVkIGJvdW5kaW5nIGJveC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB0cmFuc2Zvcm1lZCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHRyYW5zZm9ybSggbWF0cml4OiBNYXRyaXg0ICk6IEJvdW5kczMge1xuICAgIC8vIGRvIG5vdGhpbmdcbiAgICBpZiAoIHRoaXMuaXNFbXB0eSgpICkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gb3B0aW1pemF0aW9uIHRvIGJhaWwgZm9yIGlkZW50aXR5IG1hdHJpY2VzXG4gICAgaWYgKCBtYXRyaXguaXNJZGVudGl0eSgpICkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbGV0IG1pblggPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgbGV0IG1pblkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgbGV0IG1pblogPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgbGV0IG1heFggPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gICAgbGV0IG1heFkgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gICAgbGV0IG1heFogPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG5cbiAgICAvLyB1c2luZyBtdXRhYmxlIHZlY3RvciBzbyB3ZSBkb24ndCBjcmVhdGUgZXhjZXNzaXZlIGluc3RhbmNlcyBvZiBWZWN0b3IyIGR1cmluZyB0aGlzXG4gICAgLy8gbWFrZSBzdXJlIGFsbCA0IGNvcm5lcnMgYXJlIGluc2lkZSB0aGlzIHRyYW5zZm9ybWVkIGJvdW5kaW5nIGJveFxuICAgIGNvbnN0IHZlY3RvciA9IG5ldyBWZWN0b3IzKCAwLCAwLCAwICk7XG5cbiAgICBmdW5jdGlvbiB3aXRoSXQoIHZlY3RvcjogVmVjdG9yMyApOiB2b2lkIHtcbiAgICAgIG1pblggPSBNYXRoLm1pbiggbWluWCwgdmVjdG9yLnggKTtcbiAgICAgIG1pblkgPSBNYXRoLm1pbiggbWluWSwgdmVjdG9yLnkgKTtcbiAgICAgIG1pblogPSBNYXRoLm1pbiggbWluWiwgdmVjdG9yLnogKTtcbiAgICAgIG1heFggPSBNYXRoLm1heCggbWF4WCwgdmVjdG9yLnggKTtcbiAgICAgIG1heFkgPSBNYXRoLm1heCggbWF4WSwgdmVjdG9yLnkgKTtcbiAgICAgIG1heFogPSBNYXRoLm1heCggbWF4WiwgdmVjdG9yLnogKTtcbiAgICB9XG5cbiAgICB3aXRoSXQoIG1hdHJpeC50aW1lc1ZlY3RvcjMoIHZlY3Rvci5zZXRYWVooIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblogKSApICk7XG4gICAgd2l0aEl0KCBtYXRyaXgudGltZXNWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1pblgsIHRoaXMubWF4WSwgdGhpcy5taW5aICkgKSApO1xuICAgIHdpdGhJdCggbWF0cml4LnRpbWVzVmVjdG9yMyggdmVjdG9yLnNldFhZWiggdGhpcy5tYXhYLCB0aGlzLm1pblksIHRoaXMubWluWiApICkgKTtcbiAgICB3aXRoSXQoIG1hdHJpeC50aW1lc1ZlY3RvcjMoIHZlY3Rvci5zZXRYWVooIHRoaXMubWF4WCwgdGhpcy5tYXhZLCB0aGlzLm1pblogKSApICk7XG4gICAgd2l0aEl0KCBtYXRyaXgudGltZXNWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5tYXhaICkgKSApO1xuICAgIHdpdGhJdCggbWF0cml4LnRpbWVzVmVjdG9yMyggdmVjdG9yLnNldFhZWiggdGhpcy5taW5YLCB0aGlzLm1heFksIHRoaXMubWF4WiApICkgKTtcbiAgICB3aXRoSXQoIG1hdHJpeC50aW1lc1ZlY3RvcjMoIHZlY3Rvci5zZXRYWVooIHRoaXMubWF4WCwgdGhpcy5taW5ZLCB0aGlzLm1heFogKSApICk7XG4gICAgd2l0aEl0KCBtYXRyaXgudGltZXNWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICkgKSApO1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggbWluWCwgbWluWSwgbWluWiwgbWF4WCwgbWF4WSwgbWF4WiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgdGhpcyBib3VuZHMgb24gYWxsIHNpZGVzIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBkaWxhdGUoIGQ6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5kaWxhdGVYWVooIGQsIGQsIGQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIHRoaXMgYm91bmRzIGhvcml6b250YWxseSAobGVmdCBhbmQgcmlnaHQpIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZWRYKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgZGlsYXRlWCggeDogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YIC0geCwgdGhpcy5taW5ZLCB0aGlzLm1pblosIHRoaXMubWF4WCArIHgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICk7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyB0aGlzIGJvdW5kcyB2ZXJ0aWNhbGx5ICh0b3AgYW5kIGJvdHRvbSkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlZFkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBkaWxhdGVZKCB5OiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCB0aGlzLm1pblgsIHRoaXMubWluWSAtIHksIHRoaXMubWluWiwgdGhpcy5tYXhYLCB0aGlzLm1heFkgKyB5LCB0aGlzLm1heFogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIHRoaXMgYm91bmRzIGRlcHRoLXdpc2UgKGZyb250IGFuZCBiYWNrKSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVkWigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZVooIHo6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblogLSB6LCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICsgeiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgdGhpcyBib3VuZHMgaW5kZXBlbmRlbnRseSBhbG9uZyBlYWNoIGF4aXMuIFdpbGwgYmUgZXF1YWwgdG8gY2FsbGluZ1xuICAgKiBib3VuZHMuZGlsYXRlWCggeCApLmRpbGF0ZVkoIHkgKS5kaWxhdGVaKCB6ICkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlZFhZWigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGRpbGF0ZVhZWiggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCAtIHgsIHRoaXMubWluWSAtIHksIHRoaXMubWluWiAtIHosIHRoaXMubWF4WCArIHgsIHRoaXMubWF4WSArIHksIHRoaXMubWF4WiArIHogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb250cmFjdHMgdGhpcyBib3VuZHMgb24gYWxsIHNpZGVzIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlZCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGVyb2RlKCBkOiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIHRoaXMuZGlsYXRlKCAtZCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnRyYWN0cyB0aGlzIGJvdW5kcyBob3Jpem9udGFsbHkgKGxlZnQgYW5kIHJpZ2h0KSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBlcm9kZWRYKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgZXJvZGVYKCB4OiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgcmV0dXJuIHRoaXMuZGlsYXRlWCggLXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb250cmFjdHMgdGhpcyBib3VuZHMgdmVydGljYWxseSAodG9wIGFuZCBib3R0b20pIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlZFkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBlcm9kZVkoIHk6IG51bWJlciApOiBCb3VuZHMzIHtcbiAgICByZXR1cm4gdGhpcy5kaWxhdGVZKCAteSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnRyYWN0cyB0aGlzIGJvdW5kcyBkZXB0aC13aXNlIChmcm9udCBhbmQgYmFjaykgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGVkWigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGVyb2RlWiggejogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLmRpbGF0ZVooIC16ICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udHJhY3RzIHRoaXMgYm91bmRzIGluZGVwZW5kZW50bHkgYWxvbmcgZWFjaCBheGlzLiBXaWxsIGJlIGVxdWFsIHRvIGNhbGxpbmdcbiAgICogYm91bmRzLmVyb2RlWCggeCApLmVyb2RlWSggeSApLmVyb2RlWiggeiApLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlZFhZWigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGVyb2RlWFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLmRpbGF0ZVhZWiggLXgsIC15LCAteiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZXMgb3VyIGJvdW5kcyBob3Jpem9udGFsbHkgYnkgeC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdGVkWCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNoaWZ0WCggeDogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YICsgeCwgdGhpcy5taW5ZLCB0aGlzLm1pblosIHRoaXMubWF4WCArIHgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlcyBvdXIgYm91bmRzIHZlcnRpY2FsbHkgYnkgeS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdGVkWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNoaWZ0WSggeTogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YLCB0aGlzLm1pblkgKyB5LCB0aGlzLm1pblosIHRoaXMubWF4WCwgdGhpcy5tYXhZICsgeSwgdGhpcy5tYXhaICk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlcyBvdXIgYm91bmRzIGRlcHRoLXdpc2UgYnkgei5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdGVkWigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNoaWZ0WiggejogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YLCB0aGlzLm1pblksIHRoaXMubWluWiArIHosIHRoaXMubWF4WCwgdGhpcy5tYXhZLCB0aGlzLm1heFogKyB6ICk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlcyBvdXIgYm91bmRzIGJ5ICh4LHkseikuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2hpZnRlZCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNoaWZ0WFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YICsgeCwgdGhpcy5taW5ZICsgeSwgdGhpcy5taW5aICsgeiwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZICsgeSwgdGhpcy5tYXhaICsgeiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZXMgb3VyIGJvdW5kcyBieSB0aGUgZ2l2ZW4gdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIHNoaWZ0KCB2OiBWZWN0b3IzICk6IEJvdW5kczMge1xuICAgIHJldHVybiB0aGlzLnNoaWZ0WFlaKCB2LngsIHYueSwgdi56ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBCb3VuZHMzIG9iamVjdCwgd2l0aCB0aGUgY3Vib2lkICgzZCByZWN0YW5nbGUpIGNvbnN0cnVjdGlvbiB3aXRoIHgsIHksIHosIHdpZHRoLCBoZWlnaHQgYW5kIGRlcHRoLlxuICAgKlxuICAgKiBAcGFyYW0geCAtIFRoZSBtaW5pbXVtIHZhbHVlIG9mIFggZm9yIHRoZSBib3VuZHMuXG4gICAqIEBwYXJhbSB5IC0gVGhlIG1pbmltdW0gdmFsdWUgb2YgWSBmb3IgdGhlIGJvdW5kcy5cbiAgICogQHBhcmFtIHogLSBUaGUgbWluaW11bSB2YWx1ZSBvZiBaIGZvciB0aGUgYm91bmRzLlxuICAgKiBAcGFyYW0gd2lkdGggLSBUaGUgd2lkdGggKG1heFggLSBtaW5YKSBvZiB0aGUgYm91bmRzLmBcbiAgICogQHBhcmFtIGhlaWdodCAtIFRoZSBoZWlnaHQgKG1heFkgLSBtaW5ZKSBvZiB0aGUgYm91bmRzLlxuICAgKiBAcGFyYW0gZGVwdGggLSBUaGUgZGVwdGggKG1heFogLSBtaW5aKSBvZiB0aGUgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjdWJvaWQoIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBkZXB0aDogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiBuZXcgQm91bmRzMyggeCwgeSwgeiwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0LCB6ICsgZGVwdGggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IEJvdW5kczMgb2JqZWN0IHRoYXQgb25seSBjb250YWlucyB0aGUgc3BlY2lmaWVkIHBvaW50ICh4LHkseikuIFVzZWZ1bCBmb3IgYmVpbmcgZGlsYXRlZCB0byBmb3JtIGFcbiAgICogYm91bmRpbmcgYm94IGFyb3VuZCBhIHBvaW50LiBOb3RlIHRoYXQgdGhlIGJvdW5kcyB3aWxsIG5vdCBiZSBcImVtcHR5XCIgYXMgaXQgY29udGFpbnMgKHgseSx6KSwgYnV0IGl0IHdpbGwgaGF2ZVxuICAgKiB6ZXJvIGFyZWEuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBvaW50KCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IEJvdW5kczMge1xuICAgIHJldHVybiBuZXcgQm91bmRzMyggeCwgeSwgeiwgeCwgeSwgeiApO1xuICB9XG5cbiAgLy8gSGVscHMgdG8gaWRlbnRpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgYm91bmRzXG4gIHB1YmxpYyByZWFkb25seSBpc0JvdW5kcyA9IHRydWU7XG4gIHB1YmxpYyByZWFkb25seSBkaW1lbnNpb24gPSAzO1xuXG4gIC8qKlxuICAgKiBBIGNvbnN0YW50IEJvdW5kczMgd2l0aCBtaW5pbXVtcyA9ICRcXGluZnR5JCwgbWF4aW11bXMgPSAkLVxcaW5mdHkkLCBzbyB0aGF0IGl0IHJlcHJlc2VudHMgXCJubyBib3VuZHMgd2hhdHNvZXZlclwiLlxuICAgKlxuICAgKiBUaGlzIGFsbG93cyB1cyB0byB0YWtlIHRoZSB1bmlvbiAodW5pb24vaW5jbHVkZUJvdW5kcykgb2YgdGhpcyBhbmQgYW55IG90aGVyIEJvdW5kczMgdG8gZ2V0IHRoZSBvdGhlciBib3VuZHMgYmFjayxcbiAgICogZS5nLiBCb3VuZHMzLk5PVEhJTkcudW5pb24oIGJvdW5kcyApLmVxdWFscyggYm91bmRzICkuIFRoaXMgb2JqZWN0IG5hdHVyYWxseSBzZXJ2ZXMgYXMgdGhlIGJhc2UgY2FzZSBhcyBhIHVuaW9uIG9mXG4gICAqIHplcm8gYm91bmRzIG9iamVjdHMuXG4gICAqXG4gICAqIEFkZGl0aW9uYWxseSwgaW50ZXJzZWN0aW9ucyB3aXRoIE5PVEhJTkcgd2lsbCBhbHdheXMgcmV0dXJuIGEgQm91bmRzMyBlcXVpdmFsZW50IHRvIE5PVEhJTkcuXG4gICAqXG4gICAqIEBjb25zdGFudCB7Qm91bmRzM30gTk9USElOR1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBOT1RISU5HID0gbmV3IEJvdW5kczMoIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgKTtcblxuICAvKipcbiAgICogQSBjb25zdGFudCBCb3VuZHMzIHdpdGggbWluaW11bXMgPSAkLVxcaW5mdHkkLCBtYXhpbXVtcyA9ICRcXGluZnR5JCwgc28gdGhhdCBpdCByZXByZXNlbnRzIFwiYWxsIGJvdW5kc1wiLlxuICAgKlxuICAgKiBUaGlzIGFsbG93cyB1cyB0byB0YWtlIHRoZSBpbnRlcnNlY3Rpb24gKGludGVyc2VjdGlvbi9jb25zdHJhaW5Cb3VuZHMpIG9mIHRoaXMgYW5kIGFueSBvdGhlciBCb3VuZHMzIHRvIGdldCB0aGVcbiAgICogb3RoZXIgYm91bmRzIGJhY2ssIGUuZy4gQm91bmRzMy5FVkVSWVRISU5HLmludGVyc2VjdGlvbiggYm91bmRzICkuZXF1YWxzKCBib3VuZHMgKS4gVGhpcyBvYmplY3QgbmF0dXJhbGx5IHNlcnZlcyBhc1xuICAgKiB0aGUgYmFzZSBjYXNlIGFzIGFuIGludGVyc2VjdGlvbiBvZiB6ZXJvIGJvdW5kcyBvYmplY3RzLlxuICAgKlxuICAgKiBBZGRpdGlvbmFsbHksIHVuaW9ucyB3aXRoIEVWRVJZVEhJTkcgd2lsbCBhbHdheXMgcmV0dXJuIGEgQm91bmRzMyBlcXVpdmFsZW50IHRvIEVWRVJZVEhJTkcuXG4gICAqXG4gICAqIEBjb25zdGFudCB7Qm91bmRzM30gRVZFUllUSElOR1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBFVkVSWVRISU5HID0gbmV3IEJvdW5kczMoIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKTtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJvdW5kczNJTyA9IG5ldyBJT1R5cGUoICdCb3VuZHMzSU8nLCB7XG4gICAgdmFsdWVUeXBlOiBCb3VuZHMzLFxuICAgIGRvY3VtZW50YXRpb246ICdhIDMtZGltZW5zaW9uYWwgYm91bmRzIChib3VuZGluZyBib3gpJyxcbiAgICBzdGF0ZVNjaGVtYToge1xuICAgICAgbWluWDogTnVtYmVySU8sIG1pblk6IE51bWJlcklPLCBtaW5aOiBOdW1iZXJJTyxcbiAgICAgIG1heFg6IE51bWJlcklPLCBtYXhZOiBOdW1iZXJJTywgbWF4WjogTnVtYmVySU9cbiAgICB9LFxuICAgIHRvU3RhdGVPYmplY3Q6IGJvdW5kczMgPT4gKCB7XG4gICAgICBtaW5YOiBib3VuZHMzLm1pblgsIG1pblk6IGJvdW5kczMubWluWSwgbWluWjogYm91bmRzMy5taW5aLFxuICAgICAgbWF4WDogYm91bmRzMy5tYXhYLCBtYXhZOiBib3VuZHMzLm1heFksIG1heFo6IGJvdW5kczMubWF4WlxuICAgIH0gKSxcbiAgICBmcm9tU3RhdGVPYmplY3Q6IHN0YXRlT2JqZWN0ID0+IG5ldyBCb3VuZHMzKFxuICAgICAgc3RhdGVPYmplY3QubWluWCwgc3RhdGVPYmplY3QubWluWSwgc3RhdGVPYmplY3QubWluWixcbiAgICAgIHN0YXRlT2JqZWN0Lm1heFgsIHN0YXRlT2JqZWN0Lm1heFksIHN0YXRlT2JqZWN0Lm1heFpcbiAgICApXG4gIH0gKTtcbn1cblxuZG90LnJlZ2lzdGVyKCAnQm91bmRzMycsIEJvdW5kczMgKTtcblxuUG9vbGFibGUubWl4SW50byggQm91bmRzMywge1xuICBpbml0aWFsaXplOiBCb3VuZHMzLnByb3RvdHlwZS5zZXRNaW5NYXhcbn0gKTtcblxuZXhwb3J0IGRlZmF1bHQgQm91bmRzMzsiXSwibmFtZXMiOlsiUG9vbGFibGUiLCJJT1R5cGUiLCJOdW1iZXJJTyIsImRvdCIsIlZlY3RvcjMiLCJCb3VuZHMzIiwiZ2V0V2lkdGgiLCJtYXhYIiwibWluWCIsIndpZHRoIiwiZ2V0SGVpZ2h0IiwibWF4WSIsIm1pblkiLCJoZWlnaHQiLCJnZXREZXB0aCIsIm1heFoiLCJtaW5aIiwiZGVwdGgiLCJnZXRYIiwieCIsImdldFkiLCJ5IiwiZ2V0WiIsInoiLCJnZXRNaW5YIiwiZ2V0TWluWSIsImdldE1pbloiLCJnZXRNYXhYIiwiZ2V0TWF4WSIsImdldE1heFoiLCJnZXRMZWZ0IiwibGVmdCIsImdldFRvcCIsInRvcCIsImdldEJhY2siLCJiYWNrIiwiZ2V0UmlnaHQiLCJyaWdodCIsImdldEJvdHRvbSIsImJvdHRvbSIsImdldEZyb250IiwiZnJvbnQiLCJnZXRDZW50ZXJYIiwiY2VudGVyWCIsImdldENlbnRlclkiLCJjZW50ZXJZIiwiZ2V0Q2VudGVyWiIsImNlbnRlcloiLCJnZXRDZW50ZXIiLCJjZW50ZXIiLCJ2b2x1bWUiLCJpc0VtcHR5IiwiaXNGaW5pdGUiLCJoYXNOb256ZXJvVm9sdW1lIiwiaXNWYWxpZCIsImNvbnRhaW5zQ29vcmRpbmF0ZXMiLCJjb250YWluc1BvaW50IiwicG9pbnQiLCJjb250YWluc0JvdW5kcyIsImJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJpbnRlcnNlY3Rpb24iLCJ0b1N0cmluZyIsImVxdWFscyIsIm90aGVyIiwiZXF1YWxzRXBzaWxvbiIsImVwc2lsb24iLCJ1bmRlZmluZWQiLCJ0aGlzRmluaXRlIiwib3RoZXJGaW5pdGUiLCJNYXRoIiwiYWJzIiwiY29weSIsInNldCIsInVuaW9uIiwibWluIiwibWF4Iiwid2l0aENvb3JkaW5hdGVzIiwid2l0aFBvaW50Iiwid2l0aE1pblgiLCJ3aXRoTWluWSIsIndpdGhNaW5aIiwid2l0aE1heFgiLCJ3aXRoTWF4WSIsIndpdGhNYXhaIiwicm91bmRlZE91dCIsImZsb29yIiwiY2VpbCIsInJvdW5kZWRJbiIsInRyYW5zZm9ybWVkIiwibWF0cml4IiwidHJhbnNmb3JtIiwiZGlsYXRlZCIsImQiLCJkaWxhdGVkWFlaIiwiZGlsYXRlZFgiLCJkaWxhdGVkWSIsImRpbGF0ZWRaIiwiZXJvZGVkIiwiYW1vdW50IiwiZXJvZGVkWCIsImVyb2RlZFkiLCJlcm9kZWRaIiwiZXJvZGVkWFlaIiwic2hpZnRlZFgiLCJzaGlmdGVkWSIsInNoaWZ0ZWRaIiwic2hpZnRlZFhZWiIsInNoaWZ0ZWQiLCJ2Iiwic2V0TWluTWF4Iiwic2V0TWluWCIsInNldE1pblkiLCJzZXRNaW5aIiwic2V0TWF4WCIsInNldE1heFkiLCJzZXRNYXhaIiwiaW5jbHVkZUJvdW5kcyIsImNvbnN0cmFpbkJvdW5kcyIsImFkZENvb3JkaW5hdGVzIiwiYWRkUG9pbnQiLCJyb3VuZE91dCIsInJvdW5kSW4iLCJpc0lkZW50aXR5IiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJORUdBVElWRV9JTkZJTklUWSIsInZlY3RvciIsIndpdGhJdCIsInRpbWVzVmVjdG9yMyIsInNldFhZWiIsImRpbGF0ZSIsImRpbGF0ZVhZWiIsImRpbGF0ZVgiLCJkaWxhdGVZIiwiZGlsYXRlWiIsImVyb2RlIiwiZXJvZGVYIiwiZXJvZGVZIiwiZXJvZGVaIiwiZXJvZGVYWVoiLCJzaGlmdFgiLCJzaGlmdFkiLCJzaGlmdFoiLCJzaGlmdFhZWiIsInNoaWZ0IiwiY3Vib2lkIiwiaXNCb3VuZHMiLCJkaW1lbnNpb24iLCJhc3NlcnQiLCJOT1RISU5HIiwiRVZFUllUSElORyIsIkJvdW5kczNJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdGF0ZVNjaGVtYSIsInRvU3RhdGVPYmplY3QiLCJib3VuZHMzIiwiZnJvbVN0YXRlT2JqZWN0Iiwic3RhdGVPYmplY3QiLCJyZWdpc3RlciIsIm1peEludG8iLCJpbml0aWFsaXplIiwicHJvdG90eXBlIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxPQUFPQSxjQUFjLGlDQUFpQztBQUN0RCxPQUFPQyxZQUFZLGtDQUFrQztBQUNyRCxPQUFPQyxjQUFjLG9DQUFvQztBQUN6RCxPQUFPQyxTQUFTLFdBQVc7QUFFM0IsT0FBT0MsYUFBYSxlQUFlO0FBRW5DLElBQUEsQUFBTUMsVUFBTixNQUFNQTtJQXVCSjs7K0VBRTZFLEdBRTdFOztHQUVDLEdBQ0QsQUFBT0MsV0FBbUI7UUFBRSxPQUFPLElBQUksQ0FBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQ0MsSUFBSTtJQUFFO0lBRTFELElBQVdDLFFBQWdCO1FBQUUsT0FBTyxJQUFJLENBQUNILFFBQVE7SUFBSTtJQUVyRDs7R0FFQyxHQUNELEFBQU9JLFlBQW9CO1FBQUUsT0FBTyxJQUFJLENBQUNDLElBQUksR0FBRyxJQUFJLENBQUNDLElBQUk7SUFBRTtJQUUzRCxJQUFXQyxTQUFpQjtRQUFFLE9BQU8sSUFBSSxDQUFDSCxTQUFTO0lBQUk7SUFFdkQ7O0dBRUMsR0FDRCxBQUFPSSxXQUFtQjtRQUFFLE9BQU8sSUFBSSxDQUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDQyxJQUFJO0lBQUU7SUFFMUQsSUFBV0MsUUFBZ0I7UUFBRSxPQUFPLElBQUksQ0FB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