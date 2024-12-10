// Copyright 2013-2024, University of Colorado Boulder
/**
 * Dimension3 is a basic width, height, and depth, like a Bounds3 but without the position defined.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */ import InfiniteNumberIO from '../../tandem/js/types/InfiniteNumberIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import Bounds3 from './Bounds3.js';
import dot from './dot.js';
const STATE_SCHEMA = {
    width: InfiniteNumberIO,
    height: InfiniteNumberIO,
    depth: InfiniteNumberIO
};
let Dimension3 = class Dimension3 {
    /**
   * Debugging string for the dimension.
   */ toString() {
        return `[${this.width}w, ${this.height}h, ${this.depth}d]`;
    }
    /**
   * Sets this dimension to be a copy of another dimension.
   * This is the mutable form of the function copy(). This will mutate (change) this dimension, in addition to returning
   * this dimension itself.
   */ set(dimension) {
        this.width = dimension.width;
        this.height = dimension.height;
        this.depth = dimension.depth;
        return this;
    }
    /**
   * Sets the width of the dimension, returning this.
   */ setWidth(width) {
        this.width = width;
        return this;
    }
    /**
   * Sets the height of the dimension, returning this.
   */ setHeight(height) {
        this.height = height;
        return this;
    }
    /**
   * Sets the depth of the dimension, returning this.
   */ setDepth(depth) {
        this.depth = depth;
        return this;
    }
    /**
   * Creates a copy of this dimension, or if a dimension is passed in, set that dimension's values to ours.
   * This is the immutable form of the function set(), if a dimension is provided. This will return a new dimension,
   * and will not modify this dimension.
   *
   * @param [dimension] - If not provided, creates a new Dimension3 with filled in values. Otherwise, fills
   *                      in the values of the provided dimension so that it equals this dimension.
   */ copy(dimension) {
        if (dimension) {
            return dimension.set(this);
        } else {
            return new Dimension3(this.width, this.height, this.depth);
        }
    }
    /**
   * Creates a Bounds2 from this dimension based on passing in the minimum (top-left) corner as (x,y).
   * @param [x] - Minimum x coordinate of the bounds, or 0 if not provided.
   * @param [y] - Minimum y coordinate of the bounds, or 0 if not provided.
   * @param [z] - Minimum z coordinate of the bounds, or 0 if not provided.
   */ toBounds(x, y, z) {
        x = x !== undefined ? x : 0;
        y = y !== undefined ? y : 0;
        z = z !== undefined ? z : 0;
        return new Bounds3(x, y, z, this.width + x, this.height + y, this.depth + z);
    }
    /**
   * Exact equality comparison between this dimension and another dimension.
   */ equals(that) {
        return this.width === that.width && this.height === that.height && this.depth === that.depth;
    }
    toStateObject() {
        return {
            width: InfiniteNumberIO.toStateObject(this.width),
            height: InfiniteNumberIO.toStateObject(this.height),
            depth: InfiniteNumberIO.toStateObject(this.depth)
        };
    }
    static fromStateObject(stateObject) {
        return new Dimension3(InfiniteNumberIO.fromStateObject(stateObject.width), InfiniteNumberIO.fromStateObject(stateObject.height), InfiniteNumberIO.fromStateObject(stateObject.depth));
    }
    constructor(width, height, depth){
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
};
Dimension3.Dimension3IO = new IOType('Dimension3IO', {
    valueType: Dimension3,
    documentation: 'A dimension with "width", "height", and "depth" members.',
    stateSchema: STATE_SCHEMA,
    toStateObject: (range)=>range.toStateObject(),
    fromStateObject: (stateObject)=>Dimension3.fromStateObject(stateObject)
});
export { Dimension3 as default };
dot.register('Dimension3', Dimension3);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERpbWVuc2lvbjMgaXMgYSBiYXNpYyB3aWR0aCwgaGVpZ2h0LCBhbmQgZGVwdGgsIGxpa2UgYSBCb3VuZHMzIGJ1dCB3aXRob3V0IHRoZSBwb3NpdGlvbiBkZWZpbmVkLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IEluZmluaXRlTnVtYmVySU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0luZmluaXRlTnVtYmVySU8uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCB7IFN0YXRlT2JqZWN0IH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0YXRlU2NoZW1hLmpzJztcbmltcG9ydCBCb3VuZHMzIGZyb20gJy4vQm91bmRzMy5qcyc7XG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcblxuY29uc3QgU1RBVEVfU0NIRU1BID0ge1xuICB3aWR0aDogSW5maW5pdGVOdW1iZXJJTyxcbiAgaGVpZ2h0OiBJbmZpbml0ZU51bWJlcklPLFxuICBkZXB0aDogSW5maW5pdGVOdW1iZXJJT1xufTtcbmV4cG9ydCB0eXBlIERpbWVuc2lvbjNTdGF0ZU9iamVjdCA9IFN0YXRlT2JqZWN0PHR5cGVvZiBTVEFURV9TQ0hFTUE+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaW1lbnNpb24zIHtcblxuICBwdWJsaWMgd2lkdGg6IG51bWJlcjtcbiAgcHVibGljIGhlaWdodDogbnVtYmVyO1xuICBwdWJsaWMgZGVwdGg6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBkZXB0aDogbnVtYmVyICkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmRlcHRoID0gZGVwdGg7XG4gIH1cblxuICAvKipcbiAgICogRGVidWdnaW5nIHN0cmluZyBmb3IgdGhlIGRpbWVuc2lvbi5cbiAgICovXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgWyR7dGhpcy53aWR0aH13LCAke3RoaXMuaGVpZ2h0fWgsICR7dGhpcy5kZXB0aH1kXWA7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIGRpbWVuc2lvbiB0byBiZSBhIGNvcHkgb2YgYW5vdGhlciBkaW1lbnNpb24uXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gY29weSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgZGltZW5zaW9uLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBkaW1lbnNpb24gaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNldCggZGltZW5zaW9uOiBEaW1lbnNpb24zICk6IERpbWVuc2lvbjMge1xuICAgIHRoaXMud2lkdGggPSBkaW1lbnNpb24ud2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0O1xuICAgIHRoaXMuZGVwdGggPSBkaW1lbnNpb24uZGVwdGg7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgd2lkdGggb2YgdGhlIGRpbWVuc2lvbiwgcmV0dXJuaW5nIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgc2V0V2lkdGgoIHdpZHRoOiBudW1iZXIgKTogRGltZW5zaW9uMyB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGhlaWdodCBvZiB0aGUgZGltZW5zaW9uLCByZXR1cm5pbmcgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBzZXRIZWlnaHQoIGhlaWdodDogbnVtYmVyICk6IERpbWVuc2lvbjMge1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlcHRoIG9mIHRoZSBkaW1lbnNpb24sIHJldHVybmluZyB0aGlzLlxuICAgKi9cbiAgcHVibGljIHNldERlcHRoKCBkZXB0aDogbnVtYmVyICk6IERpbWVuc2lvbjMge1xuICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIGRpbWVuc2lvbiwgb3IgaWYgYSBkaW1lbnNpb24gaXMgcGFzc2VkIGluLCBzZXQgdGhhdCBkaW1lbnNpb24ncyB2YWx1ZXMgdG8gb3Vycy5cbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldCgpLCBpZiBhIGRpbWVuc2lvbiBpcyBwcm92aWRlZC4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBkaW1lbnNpb24sXG4gICAqIGFuZCB3aWxsIG5vdCBtb2RpZnkgdGhpcyBkaW1lbnNpb24uXG4gICAqXG4gICAqIEBwYXJhbSBbZGltZW5zaW9uXSAtIElmIG5vdCBwcm92aWRlZCwgY3JlYXRlcyBhIG5ldyBEaW1lbnNpb24zIHdpdGggZmlsbGVkIGluIHZhbHVlcy4gT3RoZXJ3aXNlLCBmaWxsc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICBpbiB0aGUgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCBkaW1lbnNpb24gc28gdGhhdCBpdCBlcXVhbHMgdGhpcyBkaW1lbnNpb24uXG4gICAqL1xuICBwdWJsaWMgY29weSggZGltZW5zaW9uPzogRGltZW5zaW9uMyApOiBEaW1lbnNpb24zIHtcbiAgICBpZiAoIGRpbWVuc2lvbiApIHtcbiAgICAgIHJldHVybiBkaW1lbnNpb24uc2V0KCB0aGlzICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBEaW1lbnNpb24zKCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZXB0aCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgQm91bmRzMiBmcm9tIHRoaXMgZGltZW5zaW9uIGJhc2VkIG9uIHBhc3NpbmcgaW4gdGhlIG1pbmltdW0gKHRvcC1sZWZ0KSBjb3JuZXIgYXMgKHgseSkuXG4gICAqIEBwYXJhbSBbeF0gLSBNaW5pbXVtIHggY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLCBvciAwIGlmIG5vdCBwcm92aWRlZC5cbiAgICogQHBhcmFtIFt5XSAtIE1pbmltdW0geSBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMsIG9yIDAgaWYgbm90IHByb3ZpZGVkLlxuICAgKiBAcGFyYW0gW3pdIC0gTWluaW11bSB6IGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcywgb3IgMCBpZiBub3QgcHJvdmlkZWQuXG4gICAqL1xuICBwdWJsaWMgdG9Cb3VuZHMoIHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHo/OiBudW1iZXIgKTogQm91bmRzMyB7XG4gICAgeCA9IHggIT09IHVuZGVmaW5lZCA/IHggOiAwO1xuICAgIHkgPSB5ICE9PSB1bmRlZmluZWQgPyB5IDogMDtcbiAgICB6ID0geiAhPT0gdW5kZWZpbmVkID8geiA6IDA7XG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB4LCB5LCB6LCB0aGlzLndpZHRoICsgeCwgdGhpcy5oZWlnaHQgKyB5LCB0aGlzLmRlcHRoICsgeiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4YWN0IGVxdWFsaXR5IGNvbXBhcmlzb24gYmV0d2VlbiB0aGlzIGRpbWVuc2lvbiBhbmQgYW5vdGhlciBkaW1lbnNpb24uXG4gICAqL1xuICBwdWJsaWMgZXF1YWxzKCB0aGF0OiBEaW1lbnNpb24zICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLndpZHRoID09PSB0aGF0LndpZHRoICYmIHRoaXMuaGVpZ2h0ID09PSB0aGF0LmhlaWdodCAmJiB0aGlzLmRlcHRoID09PSB0aGF0LmRlcHRoO1xuICB9XG5cbiAgcHVibGljIHRvU3RhdGVPYmplY3QoKTogRGltZW5zaW9uM1N0YXRlT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IEluZmluaXRlTnVtYmVySU8udG9TdGF0ZU9iamVjdCggdGhpcy53aWR0aCApLFxuICAgICAgaGVpZ2h0OiBJbmZpbml0ZU51bWJlcklPLnRvU3RhdGVPYmplY3QoIHRoaXMuaGVpZ2h0ICksXG4gICAgICBkZXB0aDogSW5maW5pdGVOdW1iZXJJTy50b1N0YXRlT2JqZWN0KCB0aGlzLmRlcHRoIClcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBmcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0OiBEaW1lbnNpb24zU3RhdGVPYmplY3QgKTogRGltZW5zaW9uMyB7XG4gICAgcmV0dXJuIG5ldyBEaW1lbnNpb24zKFxuICAgICAgSW5maW5pdGVOdW1iZXJJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0LndpZHRoICksXG4gICAgICBJbmZpbml0ZU51bWJlcklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuaGVpZ2h0ICksXG4gICAgICBJbmZpbml0ZU51bWJlcklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuZGVwdGggKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIERpbWVuc2lvbjNJTyA9IG5ldyBJT1R5cGU8RGltZW5zaW9uMywgRGltZW5zaW9uM1N0YXRlT2JqZWN0PiggJ0RpbWVuc2lvbjNJTycsIHtcbiAgICB2YWx1ZVR5cGU6IERpbWVuc2lvbjMsXG4gICAgZG9jdW1lbnRhdGlvbjogJ0EgZGltZW5zaW9uIHdpdGggXCJ3aWR0aFwiLCBcImhlaWdodFwiLCBhbmQgXCJkZXB0aFwiIG1lbWJlcnMuJyxcbiAgICBzdGF0ZVNjaGVtYTogU1RBVEVfU0NIRU1BLFxuICAgIHRvU3RhdGVPYmplY3Q6ICggcmFuZ2U6IERpbWVuc2lvbjMgKSA9PiByYW5nZS50b1N0YXRlT2JqZWN0KCksXG4gICAgZnJvbVN0YXRlT2JqZWN0OiAoIHN0YXRlT2JqZWN0OiBEaW1lbnNpb24zU3RhdGVPYmplY3QgKSA9PiBEaW1lbnNpb24zLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QgKVxuICB9ICk7XG59XG5cbmRvdC5yZWdpc3RlciggJ0RpbWVuc2lvbjMnLCBEaW1lbnNpb24zICk7Il0sIm5hbWVzIjpbIkluZmluaXRlTnVtYmVySU8iLCJJT1R5cGUiLCJCb3VuZHMzIiwiZG90IiwiU1RBVEVfU0NIRU1BIiwid2lkdGgiLCJoZWlnaHQiLCJkZXB0aCIsIkRpbWVuc2lvbjMiLCJ0b1N0cmluZyIsInNldCIsImRpbWVuc2lvbiIsInNldFdpZHRoIiwic2V0SGVpZ2h0Iiwic2V0RGVwdGgiLCJjb3B5IiwidG9Cb3VuZHMiLCJ4IiwieSIsInoiLCJ1bmRlZmluZWQiLCJlcXVhbHMiLCJ0aGF0IiwidG9TdGF0ZU9iamVjdCIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwiRGltZW5zaW9uM0lPIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInN0YXRlU2NoZW1hIiwicmFuZ2UiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0Esc0JBQXNCLDRDQUE0QztBQUN6RSxPQUFPQyxZQUFZLGtDQUFrQztBQUVyRCxPQUFPQyxhQUFhLGVBQWU7QUFDbkMsT0FBT0MsU0FBUyxXQUFXO0FBRTNCLE1BQU1DLGVBQWU7SUFDbkJDLE9BQU9MO0lBQ1BNLFFBQVFOO0lBQ1JPLE9BQU9QO0FBQ1Q7QUFHZSxJQUFBLEFBQU1RLGFBQU4sTUFBTUE7SUFZbkI7O0dBRUMsR0FDRCxBQUFPQyxXQUFtQjtRQUN4QixPQUFPLENBQUMs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