// Copyright 2013-2024, University of Colorado Boulder
/**
 * Dimension2 is a basic width and height, like a Bounds2 but without the position defined.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import InfiniteNumberIO from '../../tandem/js/types/InfiniteNumberIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import Bounds2 from './Bounds2.js';
import dot from './dot.js';
const STATE_SCHEMA = {
    width: InfiniteNumberIO,
    height: InfiniteNumberIO
};
let Dimension2 = class Dimension2 {
    /**
   * Debugging string for the dimension.
   */ toString() {
        return `[${this.width}w, ${this.height}h]`;
    }
    /**
   * Sets this dimension to be a copy of another dimension.
   * This is the mutable form of the function copy(). This will mutate (change) this dimension, in addition to returning
   * this dimension itself.
   */ set(dimension) {
        this.width = dimension.width;
        this.height = dimension.height;
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
   * Creates a copy of this dimension, or if a dimension is passed in, set that dimension's values to ours.
   * This is the immutable form of the function set(), if a dimension is provided. This will return a new dimension,
   * and will not modify this dimension.
   *
   * @param [dimension] - If not provided, creates a new Dimension2 with filled in values. Otherwise, fills
   *                      in the values of the provided dimension so that it equals this dimension.
   */ copy(dimension) {
        if (dimension) {
            return dimension.set(this);
        } else {
            return new Dimension2(this.width, this.height);
        }
    }
    /**
   * Swap width and height and return a new Dimension2
   */ swapped() {
        return new Dimension2(this.height, this.width);
    }
    /**
   * Creates a Bounds2 from this dimension based on passing in the minimum (top-left) corner as (x,y).
   * @param [x] - Minimum x coordinate of the bounds, or 0 if not provided.
   * @param [y] - Minimum y coordinate of the bounds, or 0 if not provided.
   */ toBounds(x, y) {
        x = x !== undefined ? x : 0;
        y = y !== undefined ? y : 0;
        return new Bounds2(x, y, this.width + x, this.height + y);
    }
    /**
   * Exact equality comparison between this dimension and another dimension.
   */ equals(that) {
        return this.width === that.width && this.height === that.height;
    }
    /**
   * Exact equality comparison between this dimension and another dimension.
   *
   * Whether difference between the two dimensions has no component with an absolute value greater than epsilon.
   */ equalsEpsilon(that, epsilon = 0) {
        return Math.max(Math.abs(this.width - that.width), Math.abs(this.height - that.height)) <= epsilon;
    }
    toStateObject() {
        return {
            width: InfiniteNumberIO.toStateObject(this.width),
            height: InfiniteNumberIO.toStateObject(this.height)
        };
    }
    static fromStateObject(stateObject) {
        return new Dimension2(InfiniteNumberIO.fromStateObject(stateObject.width), InfiniteNumberIO.fromStateObject(stateObject.height));
    }
    constructor(width, height){
        this.width = width;
        this.height = height;
    }
};
Dimension2.Dimension2IO = new IOType('Dimension2IO', {
    valueType: Dimension2,
    documentation: 'A dimension with "width" and "height" members.',
    stateSchema: STATE_SCHEMA,
    toStateObject: (range)=>range.toStateObject(),
    fromStateObject: (stateObject)=>Dimension2.fromStateObject(stateObject)
});
export { Dimension2 as default };
dot.register('Dimension2', Dimension2);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERpbWVuc2lvbjIgaXMgYSBiYXNpYyB3aWR0aCBhbmQgaGVpZ2h0LCBsaWtlIGEgQm91bmRzMiBidXQgd2l0aG91dCB0aGUgcG9zaXRpb24gZGVmaW5lZC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IEluZmluaXRlTnVtYmVySU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0luZmluaXRlTnVtYmVySU8uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCB7IFN0YXRlT2JqZWN0IH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0YXRlU2NoZW1hLmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4vQm91bmRzMi5qcyc7XG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcblxuY29uc3QgU1RBVEVfU0NIRU1BID0ge1xuICB3aWR0aDogSW5maW5pdGVOdW1iZXJJTyxcbiAgaGVpZ2h0OiBJbmZpbml0ZU51bWJlcklPXG59O1xuZXhwb3J0IHR5cGUgRGltZW5zaW9uMlN0YXRlT2JqZWN0ID0gU3RhdGVPYmplY3Q8dHlwZW9mIFNUQVRFX1NDSEVNQT47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpbWVuc2lvbjIge1xuXG4gIC8vIFdpZHRoIG9mIHRoZSBkaW1lbnNpb25cbiAgcHVibGljIHdpZHRoOiBudW1iZXI7XG5cbiAgLy8gSGVpZ2h0IG9mIHRoZSBkaW1lbnNpb25cbiAgcHVibGljIGhlaWdodDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIERlYnVnZ2luZyBzdHJpbmcgZm9yIHRoZSBkaW1lbnNpb24uXG4gICAqL1xuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFske3RoaXMud2lkdGh9dywgJHt0aGlzLmhlaWdodH1oXWA7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIGRpbWVuc2lvbiB0byBiZSBhIGNvcHkgb2YgYW5vdGhlciBkaW1lbnNpb24uXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gY29weSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgZGltZW5zaW9uLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBkaW1lbnNpb24gaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHNldCggZGltZW5zaW9uOiBEaW1lbnNpb24yICk6IERpbWVuc2lvbjIge1xuICAgIHRoaXMud2lkdGggPSBkaW1lbnNpb24ud2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHdpZHRoIG9mIHRoZSBkaW1lbnNpb24sIHJldHVybmluZyB0aGlzLlxuICAgKi9cbiAgcHVibGljIHNldFdpZHRoKCB3aWR0aDogbnVtYmVyICk6IERpbWVuc2lvbjIge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoZWlnaHQgb2YgdGhlIGRpbWVuc2lvbiwgcmV0dXJuaW5nIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgc2V0SGVpZ2h0KCBoZWlnaHQ6IG51bWJlciApOiBEaW1lbnNpb24yIHtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIGRpbWVuc2lvbiwgb3IgaWYgYSBkaW1lbnNpb24gaXMgcGFzc2VkIGluLCBzZXQgdGhhdCBkaW1lbnNpb24ncyB2YWx1ZXMgdG8gb3Vycy5cbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldCgpLCBpZiBhIGRpbWVuc2lvbiBpcyBwcm92aWRlZC4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBkaW1lbnNpb24sXG4gICAqIGFuZCB3aWxsIG5vdCBtb2RpZnkgdGhpcyBkaW1lbnNpb24uXG4gICAqXG4gICAqIEBwYXJhbSBbZGltZW5zaW9uXSAtIElmIG5vdCBwcm92aWRlZCwgY3JlYXRlcyBhIG5ldyBEaW1lbnNpb24yIHdpdGggZmlsbGVkIGluIHZhbHVlcy4gT3RoZXJ3aXNlLCBmaWxsc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICBpbiB0aGUgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCBkaW1lbnNpb24gc28gdGhhdCBpdCBlcXVhbHMgdGhpcyBkaW1lbnNpb24uXG4gICAqL1xuICBwdWJsaWMgY29weSggZGltZW5zaW9uPzogRGltZW5zaW9uMiApOiBEaW1lbnNpb24yIHtcbiAgICBpZiAoIGRpbWVuc2lvbiApIHtcbiAgICAgIHJldHVybiBkaW1lbnNpb24uc2V0KCB0aGlzICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTd2FwIHdpZHRoIGFuZCBoZWlnaHQgYW5kIHJldHVybiBhIG5ldyBEaW1lbnNpb24yXG4gICAqL1xuICBwdWJsaWMgc3dhcHBlZCgpOiBEaW1lbnNpb24yIHtcbiAgICByZXR1cm4gbmV3IERpbWVuc2lvbjIoIHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIEJvdW5kczIgZnJvbSB0aGlzIGRpbWVuc2lvbiBiYXNlZCBvbiBwYXNzaW5nIGluIHRoZSBtaW5pbXVtICh0b3AtbGVmdCkgY29ybmVyIGFzICh4LHkpLlxuICAgKiBAcGFyYW0gW3hdIC0gTWluaW11bSB4IGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcywgb3IgMCBpZiBub3QgcHJvdmlkZWQuXG4gICAqIEBwYXJhbSBbeV0gLSBNaW5pbXVtIHkgY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLCBvciAwIGlmIG5vdCBwcm92aWRlZC5cbiAgICovXG4gIHB1YmxpYyB0b0JvdW5kcyggeD86IG51bWJlciwgeT86IG51bWJlciApOiBCb3VuZHMyIHtcbiAgICB4ID0geCAhPT0gdW5kZWZpbmVkID8geCA6IDA7XG4gICAgeSA9IHkgIT09IHVuZGVmaW5lZCA/IHkgOiAwO1xuICAgIHJldHVybiBuZXcgQm91bmRzMiggeCwgeSwgdGhpcy53aWR0aCArIHgsIHRoaXMuaGVpZ2h0ICsgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4YWN0IGVxdWFsaXR5IGNvbXBhcmlzb24gYmV0d2VlbiB0aGlzIGRpbWVuc2lvbiBhbmQgYW5vdGhlciBkaW1lbnNpb24uXG4gICAqL1xuICBwdWJsaWMgZXF1YWxzKCB0aGF0OiBEaW1lbnNpb24yICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLndpZHRoID09PSB0aGF0LndpZHRoICYmIHRoaXMuaGVpZ2h0ID09PSB0aGF0LmhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGFjdCBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyBkaW1lbnNpb24gYW5kIGFub3RoZXIgZGltZW5zaW9uLlxuICAgKlxuICAgKiBXaGV0aGVyIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIGRpbWVuc2lvbnMgaGFzIG5vIGNvbXBvbmVudCB3aXRoIGFuIGFic29sdXRlIHZhbHVlIGdyZWF0ZXIgdGhhbiBlcHNpbG9uLlxuICAgKi9cbiAgcHVibGljIGVxdWFsc0Vwc2lsb24oIHRoYXQ6IERpbWVuc2lvbjIsIGVwc2lsb24gPSAwICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgIE1hdGguYWJzKCB0aGlzLndpZHRoIC0gdGhhdC53aWR0aCApLFxuICAgICAgTWF0aC5hYnMoIHRoaXMuaGVpZ2h0IC0gdGhhdC5oZWlnaHQgKVxuICAgICkgPD0gZXBzaWxvbjtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0YXRlT2JqZWN0KCk6IERpbWVuc2lvbjJTdGF0ZU9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiBJbmZpbml0ZU51bWJlcklPLnRvU3RhdGVPYmplY3QoIHRoaXMud2lkdGggKSxcbiAgICAgIGhlaWdodDogSW5maW5pdGVOdW1iZXJJTy50b1N0YXRlT2JqZWN0KCB0aGlzLmhlaWdodCApXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdDogRGltZW5zaW9uMlN0YXRlT2JqZWN0ICk6IERpbWVuc2lvbjIge1xuICAgIHJldHVybiBuZXcgRGltZW5zaW9uMihcbiAgICAgIEluZmluaXRlTnVtYmVySU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC53aWR0aCApLFxuICAgICAgSW5maW5pdGVOdW1iZXJJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0LmhlaWdodCApXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgRGltZW5zaW9uMklPID0gbmV3IElPVHlwZTxEaW1lbnNpb24yLCBEaW1lbnNpb24yU3RhdGVPYmplY3Q+KCAnRGltZW5zaW9uMklPJywge1xuICAgIHZhbHVlVHlwZTogRGltZW5zaW9uMixcbiAgICBkb2N1bWVudGF0aW9uOiAnQSBkaW1lbnNpb24gd2l0aCBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgbWVtYmVycy4nLFxuICAgIHN0YXRlU2NoZW1hOiBTVEFURV9TQ0hFTUEsXG4gICAgdG9TdGF0ZU9iamVjdDogKCByYW5nZTogRGltZW5zaW9uMiApID0+IHJhbmdlLnRvU3RhdGVPYmplY3QoKSxcbiAgICBmcm9tU3RhdGVPYmplY3Q6ICggc3RhdGVPYmplY3Q6IERpbWVuc2lvbjJTdGF0ZU9iamVjdCApID0+IERpbWVuc2lvbjIuZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdCApXG4gIH0gKTtcbn1cblxuZG90LnJlZ2lzdGVyKCAnRGltZW5zaW9uMicsIERpbWVuc2lvbjIgKTsiXSwibmFtZXMiOlsiSW5maW5pdGVOdW1iZXJJTyIsIklPVHlwZSIsIkJvdW5kczIiLCJkb3QiLCJTVEFURV9TQ0hFTUEiLCJ3aWR0aCIsImhlaWdodCIsIkRpbWVuc2lvbjIiLCJ0b1N0cmluZyIsInNldCIsImRpbWVuc2lvbiIsInNldFdpZHRoIiwic2V0SGVpZ2h0IiwiY29weSIsInN3YXBwZWQiLCJ0b0JvdW5kcyIsIngiLCJ5IiwidW5kZWZpbmVkIiwiZXF1YWxzIiwidGhhdCIsImVxdWFsc0Vwc2lsb24iLCJlcHNpbG9uIiwiTWF0aCIsIm1heCIsImFicyIsInRvU3RhdGVPYmplY3QiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsIkRpbWVuc2lvbjJJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdGF0ZVNjaGVtYSIsInJhbmdlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esc0JBQXNCLDRDQUE0QztBQUN6RSxPQUFPQyxZQUFZLGtDQUFrQztBQUVyRCxPQUFPQyxhQUFhLGVBQWU7QUFDbkMsT0FBT0MsU0FBUyxXQUFXO0FBRTNCLE1BQU1DLGVBQWU7SUFDbkJDLE9BQU9MO0lBQ1BNLFFBQVFOO0FBQ1Y7QUFHZSxJQUFBLEFBQU1PLGFBQU4sTUFBTUE7SUFhbkI7O0dBRUMsR0FDRCxBQUFPQyxXQUFtQjtRQUN4QixPQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FB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