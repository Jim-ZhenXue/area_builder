// Copyright 2015-2024, University of Colorado Boulder
/**
 * Given a rectangular containing area, takes care of allocating and deallocating smaller rectangular "bins" that fit
 * together inside the area and do not overlap. Optimized more for runtime CPU usage than space currently.
 *
 * For example:
 * #begin canvasExample binPacker 256x256
 * #on
 * var binPacker = new phet.dot.BinPacker( new dot.Bounds2( 0, 0, 256, 256 ) );
 * var bins = [];
 * for ( var i = 0; i < 100; i++ ) {
 *   var bin = binPacker.allocate( Math.random() * 64, Math.random() * 64 );
 *   if ( bin ) {
 *     bins.push( bin );
 *   }
 * }
 * #off
 *
 * context.strokeStyle = '#000';
 * bins.forEach( function( bin ) {
 *   var bounds = bin.bounds;
 *   context.strokeRect( bounds.x, bounds.y, bounds.width, bounds.height );
 * } );
 * #end canvasExample
 *
 * @author Sharfudeen Ashraf
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from './Bounds2.js';
import dot from './dot.js';
let BinPacker = class BinPacker {
    /**
   * Allocates a bin with the specified width and height if possible (returning a {Bin}), otherwise returns null.
   */ allocate(width, height) {
        // find a leaf bin that has available room (or null)
        const bin = this.rootBin.findAvailableBin(width, height);
        if (bin) {
            // split it into a sized sub-bin for our purpose that we will use, and other bins for future allocations
            const sizedBin = bin.split(width, height);
            // mark our bin as used
            sizedBin.use();
            return sizedBin;
        } else {
            return null;
        }
    }
    /**
   * Deallocates a bin, so that its area can be reused by future allocations.
   *
   * @param bin - The bin that was returned from allocate().
   */ deallocate(bin) {
        bin.unuse();
    }
    toString() {
        let result = '';
        let padding = '';
        function binTree(bin) {
            result += `${padding + bin.toString()}\n`;
            padding = `${padding}  `;
            _.each(bin.children, binTree);
            padding = padding.substring(2);
        }
        binTree(this.rootBin);
        return result;
    }
    /**
   * Creates a BinPacker with the specified containing bounds.
   *
   * @param bounds - The available bounds to pack bins inside.
   */ constructor(bounds){
        this.rootBin = new Bin(bounds, null);
    }
};
export { BinPacker as default };
dot.register('BinPacker', BinPacker);
export class Bin {
    /**
   * Finds an unused bin with open area that is at least width-x-height in size. (dot-internal)
   */ findAvailableBin(width, height) {
        assert && assert(width > 0 && height > 0, 'Empty bin requested?');
        // If we are marked as used ourself, we can't be used
        if (this.isUsed) {
            return null;
        } else if (this.bounds.width < width || this.bounds.height < height) {
            return null;
        } else if (this.isSplit) {
            for(let i = 0; i < this.children.length; i++){
                const result = this.children[i].findAvailableBin(width, height);
                if (result) {
                    return result;
                }
            }
            // No child can fit the area
            return null;
        } else {
            return this;
        }
    }
    /**
   * Splits this bin into multiple child bins, and returns the child with the dimensions (width,height). (dot-internal)
   */ split(width, height) {
        assert && assert(this.bounds.width >= width && this.bounds.height >= height, 'Bin does not have space');
        assert && assert(!this.isSplit, 'Bin should not be re-split');
        assert && assert(!this.isUsed, 'Bin should not be split when used');
        assert && assert(width > 0 && height > 0, 'Empty bin requested?');
        // if our dimensions match exactly, don't split (return ourself)
        if (width === this.bounds.width && height === this.bounds.height) {
            return this;
        }
        // mark as split
        this.isSplit = true;
        // locations of the split
        const splitX = this.bounds.minX + width;
        const splitY = this.bounds.minY + height;
        /*
     * How an area is split (for now). In the future, splitting more after determining what we need to fit next would
     * potentially be better, but this preserves the width better (which many times we need).
     *
     *   ************************************
     *   *                  *               *
     *   *                  *               *
     *   *       main       *     right     *
     *   * (width x height) *               *
     *   *                  *               *
     *   ************************************
     *   *                                  *
     *   *              bottom              *
     *   *                                  *
     *   ************************************
     */ const mainBounds = new Bounds2(this.bounds.minX, this.bounds.minY, splitX, splitY);
        const rightBounds = new Bounds2(splitX, this.bounds.minY, this.bounds.maxX, splitY);
        const bottomBounds = new Bounds2(this.bounds.minX, splitY, this.bounds.maxX, this.bounds.maxY);
        const mainBin = new Bin(mainBounds, this);
        this.children.push(mainBin);
        // only add right/bottom if they take up area
        if (rightBounds.hasNonzeroArea()) {
            this.children.push(new Bin(rightBounds, this));
        }
        if (bottomBounds.hasNonzeroArea()) {
            this.children.push(new Bin(bottomBounds, this));
        }
        return mainBin;
    }
    /**
   * Mark this bin as used. (dot-internal)
   */ use() {
        assert && assert(!this.isSplit, 'Should not mark a split bin as used');
        assert && assert(!this.isUsed, 'Should not mark a used bin as used');
        this.isUsed = true;
    }
    /**
   * Mark this bin as not used, and attempt to collapse split parents if all children are unused. (dot-internal)
   */ unuse() {
        assert && assert(this.isUsed, 'Can only unuse a used instance');
        this.isUsed = false;
        this.parent && this.parent.attemptToCollapse();
    }
    /**
   * If our bin can be collapsed (it is split and has children that are not used AND not split), then we will become
   * not split, and will remove our children. If successful, it will also call this on our parent, fully attempting
   * to clean up unused data structures.
   */ attemptToCollapse() {
        assert && assert(this.isSplit, 'Should only attempt to collapse split bins');
        // Bail out if a single child isn't able to be collapsed. If it is not split or used, it won't have any children
        // or needs.
        for(let i = 0; i < this.children.length; i++){
            const child = this.children[i];
            if (child.isSplit || child.isUsed) {
                return;
            }
        }
        // We can now collapse ourselves neatly
        this.children = [];
        this.isSplit = false;
        // And attempt to collapse our parent
        this.parent && this.parent.attemptToCollapse();
    }
    toString() {
        return this.bounds.toString() + (this.isUsed ? ' used' : '');
    }
    /**
   * A rectangular bin that can be used itself or split into sub-bins.
   */ constructor(bounds, parent){
        this.bounds = bounds;
        this.parent = parent;
        this.isSplit = false;
        this.isUsed = false;
        this.children = [];
    }
}
BinPacker.Bin = Bin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9CaW5QYWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR2l2ZW4gYSByZWN0YW5ndWxhciBjb250YWluaW5nIGFyZWEsIHRha2VzIGNhcmUgb2YgYWxsb2NhdGluZyBhbmQgZGVhbGxvY2F0aW5nIHNtYWxsZXIgcmVjdGFuZ3VsYXIgXCJiaW5zXCIgdGhhdCBmaXRcbiAqIHRvZ2V0aGVyIGluc2lkZSB0aGUgYXJlYSBhbmQgZG8gbm90IG92ZXJsYXAuIE9wdGltaXplZCBtb3JlIGZvciBydW50aW1lIENQVSB1c2FnZSB0aGFuIHNwYWNlIGN1cnJlbnRseS5cbiAqXG4gKiBGb3IgZXhhbXBsZTpcbiAqICNiZWdpbiBjYW52YXNFeGFtcGxlIGJpblBhY2tlciAyNTZ4MjU2XG4gKiAjb25cbiAqIHZhciBiaW5QYWNrZXIgPSBuZXcgcGhldC5kb3QuQmluUGFja2VyKCBuZXcgZG90LkJvdW5kczIoIDAsIDAsIDI1NiwgMjU2ICkgKTtcbiAqIHZhciBiaW5zID0gW107XG4gKiBmb3IgKCB2YXIgaSA9IDA7IGkgPCAxMDA7IGkrKyApIHtcbiAqICAgdmFyIGJpbiA9IGJpblBhY2tlci5hbGxvY2F0ZSggTWF0aC5yYW5kb20oKSAqIDY0LCBNYXRoLnJhbmRvbSgpICogNjQgKTtcbiAqICAgaWYgKCBiaW4gKSB7XG4gKiAgICAgYmlucy5wdXNoKCBiaW4gKTtcbiAqICAgfVxuICogfVxuICogI29mZlxuICpcbiAqIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnIzAwMCc7XG4gKiBiaW5zLmZvckVhY2goIGZ1bmN0aW9uKCBiaW4gKSB7XG4gKiAgIHZhciBib3VuZHMgPSBiaW4uYm91bmRzO1xuICogICBjb250ZXh0LnN0cm9rZVJlY3QoIGJvdW5kcy54LCBib3VuZHMueSwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0ICk7XG4gKiB9ICk7XG4gKiAjZW5kIGNhbnZhc0V4YW1wbGVcbiAqXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi9Cb3VuZHMyLmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCaW5QYWNrZXIge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgcm9vdEJpbjogQmluO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgQmluUGFja2VyIHdpdGggdGhlIHNwZWNpZmllZCBjb250YWluaW5nIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIGJvdW5kcyAtIFRoZSBhdmFpbGFibGUgYm91bmRzIHRvIHBhY2sgYmlucyBpbnNpZGUuXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGJvdW5kczogQm91bmRzMiApIHtcbiAgICB0aGlzLnJvb3RCaW4gPSBuZXcgQmluKCBib3VuZHMsIG51bGwgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvY2F0ZXMgYSBiaW4gd2l0aCB0aGUgc3BlY2lmaWVkIHdpZHRoIGFuZCBoZWlnaHQgaWYgcG9zc2libGUgKHJldHVybmluZyBhIHtCaW59KSwgb3RoZXJ3aXNlIHJldHVybnMgbnVsbC5cbiAgICovXG4gIHB1YmxpYyBhbGxvY2F0ZSggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogQmluIHwgbnVsbCB7XG4gICAgLy8gZmluZCBhIGxlYWYgYmluIHRoYXQgaGFzIGF2YWlsYWJsZSByb29tIChvciBudWxsKVxuICAgIGNvbnN0IGJpbiA9IHRoaXMucm9vdEJpbi5maW5kQXZhaWxhYmxlQmluKCB3aWR0aCwgaGVpZ2h0ICk7XG5cbiAgICBpZiAoIGJpbiApIHtcbiAgICAgIC8vIHNwbGl0IGl0IGludG8gYSBzaXplZCBzdWItYmluIGZvciBvdXIgcHVycG9zZSB0aGF0IHdlIHdpbGwgdXNlLCBhbmQgb3RoZXIgYmlucyBmb3IgZnV0dXJlIGFsbG9jYXRpb25zXG4gICAgICBjb25zdCBzaXplZEJpbiA9IGJpbi5zcGxpdCggd2lkdGgsIGhlaWdodCApO1xuXG4gICAgICAvLyBtYXJrIG91ciBiaW4gYXMgdXNlZFxuICAgICAgc2l6ZWRCaW4udXNlKCk7XG5cbiAgICAgIHJldHVybiBzaXplZEJpbjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVhbGxvY2F0ZXMgYSBiaW4sIHNvIHRoYXQgaXRzIGFyZWEgY2FuIGJlIHJldXNlZCBieSBmdXR1cmUgYWxsb2NhdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBiaW4gLSBUaGUgYmluIHRoYXQgd2FzIHJldHVybmVkIGZyb20gYWxsb2NhdGUoKS5cbiAgICovXG4gIHB1YmxpYyBkZWFsbG9jYXRlKCBiaW46IEJpbiApOiB2b2lkIHtcbiAgICBiaW4udW51c2UoKTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGxldCByZXN1bHQgPSAnJztcblxuICAgIGxldCBwYWRkaW5nID0gJyc7XG5cbiAgICBmdW5jdGlvbiBiaW5UcmVlKCBiaW46IEJpbiApOiB2b2lkIHtcbiAgICAgIHJlc3VsdCArPSBgJHtwYWRkaW5nICsgYmluLnRvU3RyaW5nKCl9XFxuYDtcbiAgICAgIHBhZGRpbmcgPSBgJHtwYWRkaW5nfSAgYDtcbiAgICAgIF8uZWFjaCggYmluLmNoaWxkcmVuLCBiaW5UcmVlICk7XG4gICAgICBwYWRkaW5nID0gcGFkZGluZy5zdWJzdHJpbmcoIDIgKTtcbiAgICB9XG5cbiAgICBiaW5UcmVlKCB0aGlzLnJvb3RCaW4gKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIEJpbjogdHlwZW9mIEJpbjtcbn1cblxuZG90LnJlZ2lzdGVyKCAnQmluUGFja2VyJywgQmluUGFja2VyICk7XG5cbmV4cG9ydCBjbGFzcyBCaW4ge1xuXG4gIC8vIE91ciBjb250YWluaW5nIGJvdW5kc1xuICBwdWJsaWMgYm91bmRzOiBCb3VuZHMyO1xuXG4gIC8vIFBhcmVudCBiaW4sIGlmIGFwcGxpY2FibGVcbiAgcHJpdmF0ZSBwYXJlbnQ6IEJpbiB8IG51bGw7XG5cbiAgLy8gV2hldGhlciBvdXIgY2hpbGRyZW4gYXJlIHJlc3BvbnNpYmxlIGZvciBvdXIgYXJlYVxuICBwcml2YXRlIGlzU3BsaXQ6IGJvb2xlYW47XG5cbiAgLy8gV2hldGhlciB3ZSBhcmUgbWFya2VkIGFzIGEgYmluIHRoYXQgaXMgdXNlZFxuICBwcml2YXRlIGlzVXNlZDogYm9vbGVhbjtcblxuICBwdWJsaWMgY2hpbGRyZW46IEJpbltdOyAvLyAoZG90LWludGVybmFsKVxuXG4gIC8qKlxuICAgKiBBIHJlY3Rhbmd1bGFyIGJpbiB0aGF0IGNhbiBiZSB1c2VkIGl0c2VsZiBvciBzcGxpdCBpbnRvIHN1Yi1iaW5zLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBib3VuZHM6IEJvdW5kczIsIHBhcmVudDogQmluIHwgbnVsbCApIHtcbiAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmlzU3BsaXQgPSBmYWxzZTtcbiAgICB0aGlzLmlzVXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbiB1bnVzZWQgYmluIHdpdGggb3BlbiBhcmVhIHRoYXQgaXMgYXQgbGVhc3Qgd2lkdGgteC1oZWlnaHQgaW4gc2l6ZS4gKGRvdC1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBmaW5kQXZhaWxhYmxlQmluKCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiBCaW4gfCBudWxsIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3aWR0aCA+IDAgJiYgaGVpZ2h0ID4gMCwgJ0VtcHR5IGJpbiByZXF1ZXN0ZWQ/JyApO1xuXG4gICAgLy8gSWYgd2UgYXJlIG1hcmtlZCBhcyB1c2VkIG91cnNlbGYsIHdlIGNhbid0IGJlIHVzZWRcbiAgICBpZiAoIHRoaXMuaXNVc2VkICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIElmIG91ciBib3VuZHMgY2FuJ3QgZml0IGl0LCBza2lwIHRoaXMgZW50aXJlIHN1Yi10cmVlXG4gICAgZWxzZSBpZiAoIHRoaXMuYm91bmRzLndpZHRoIDwgd2lkdGggfHwgdGhpcy5ib3VuZHMuaGVpZ2h0IDwgaGVpZ2h0ICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIElmIHdlIGhhdmUgYmVlbiBzcGxpdCwgY2hlY2sgb3VyIGNoaWxkcmVuXG4gICAgZWxzZSBpZiAoIHRoaXMuaXNTcGxpdCApIHtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY2hpbGRyZW5bIGkgXS5maW5kQXZhaWxhYmxlQmluKCB3aWR0aCwgaGVpZ2h0ICk7XG4gICAgICAgIGlmICggcmVzdWx0ICkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIE5vIGNoaWxkIGNhbiBmaXQgdGhlIGFyZWFcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2Ugd2UgYXJlIGZyZWUgYW5kIG91ciBkaW1lbnNpb25zIGFyZSBjb21wYXRpYmxlIChjaGVja2VkIGFib3ZlKVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNwbGl0cyB0aGlzIGJpbiBpbnRvIG11bHRpcGxlIGNoaWxkIGJpbnMsIGFuZCByZXR1cm5zIHRoZSBjaGlsZCB3aXRoIHRoZSBkaW1lbnNpb25zICh3aWR0aCxoZWlnaHQpLiAoZG90LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHNwbGl0KCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiBCaW4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYm91bmRzLndpZHRoID49IHdpZHRoICYmIHRoaXMuYm91bmRzLmhlaWdodCA+PSBoZWlnaHQsXG4gICAgICAnQmluIGRvZXMgbm90IGhhdmUgc3BhY2UnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNTcGxpdCwgJ0JpbiBzaG91bGQgbm90IGJlIHJlLXNwbGl0JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzVXNlZCwgJ0JpbiBzaG91bGQgbm90IGJlIHNwbGl0IHdoZW4gdXNlZCcgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3aWR0aCA+IDAgJiYgaGVpZ2h0ID4gMCwgJ0VtcHR5IGJpbiByZXF1ZXN0ZWQ/JyApO1xuXG4gICAgLy8gaWYgb3VyIGRpbWVuc2lvbnMgbWF0Y2ggZXhhY3RseSwgZG9uJ3Qgc3BsaXQgKHJldHVybiBvdXJzZWxmKVxuICAgIGlmICggd2lkdGggPT09IHRoaXMuYm91bmRzLndpZHRoICYmIGhlaWdodCA9PT0gdGhpcy5ib3VuZHMuaGVpZ2h0ICkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gbWFyayBhcyBzcGxpdFxuICAgIHRoaXMuaXNTcGxpdCA9IHRydWU7XG5cbiAgICAvLyBsb2NhdGlvbnMgb2YgdGhlIHNwbGl0XG4gICAgY29uc3Qgc3BsaXRYID0gdGhpcy5ib3VuZHMubWluWCArIHdpZHRoO1xuICAgIGNvbnN0IHNwbGl0WSA9IHRoaXMuYm91bmRzLm1pblkgKyBoZWlnaHQ7XG5cbiAgICAvKlxuICAgICAqIEhvdyBhbiBhcmVhIGlzIHNwbGl0IChmb3Igbm93KS4gSW4gdGhlIGZ1dHVyZSwgc3BsaXR0aW5nIG1vcmUgYWZ0ZXIgZGV0ZXJtaW5pbmcgd2hhdCB3ZSBuZWVkIHRvIGZpdCBuZXh0IHdvdWxkXG4gICAgICogcG90ZW50aWFsbHkgYmUgYmV0dGVyLCBidXQgdGhpcyBwcmVzZXJ2ZXMgdGhlIHdpZHRoIGJldHRlciAod2hpY2ggbWFueSB0aW1lcyB3ZSBuZWVkKS5cbiAgICAgKlxuICAgICAqICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogICAqICAgICAgICAgICAgICAgICAgKiAgICAgICAgICAgICAgICpcbiAgICAgKiAgICogICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgKlxuICAgICAqICAgKiAgICAgICBtYWluICAgICAgICogICAgIHJpZ2h0ICAgICAqXG4gICAgICogICAqICh3aWR0aCB4IGhlaWdodCkgKiAgICAgICAgICAgICAgICpcbiAgICAgKiAgICogICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgKlxuICAgICAqICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgKiAgICogICAgICAgICAgICAgIGJvdHRvbSAgICAgICAgICAgICAgKlxuICAgICAqICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICogICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgKi9cbiAgICBjb25zdCBtYWluQm91bmRzID0gbmV3IEJvdW5kczIoIHRoaXMuYm91bmRzLm1pblgsIHRoaXMuYm91bmRzLm1pblksIHNwbGl0WCwgc3BsaXRZICk7XG4gICAgY29uc3QgcmlnaHRCb3VuZHMgPSBuZXcgQm91bmRzMiggc3BsaXRYLCB0aGlzLmJvdW5kcy5taW5ZLCB0aGlzLmJvdW5kcy5tYXhYLCBzcGxpdFkgKTtcbiAgICBjb25zdCBib3R0b21Cb3VuZHMgPSBuZXcgQm91bmRzMiggdGhpcy5ib3VuZHMubWluWCwgc3BsaXRZLCB0aGlzLmJvdW5kcy5tYXhYLCB0aGlzLmJvdW5kcy5tYXhZICk7XG5cbiAgICBjb25zdCBtYWluQmluID0gbmV3IEJpbiggbWFpbkJvdW5kcywgdGhpcyApO1xuICAgIHRoaXMuY2hpbGRyZW4ucHVzaCggbWFpbkJpbiApO1xuXG4gICAgLy8gb25seSBhZGQgcmlnaHQvYm90dG9tIGlmIHRoZXkgdGFrZSB1cCBhcmVhXG4gICAgaWYgKCByaWdodEJvdW5kcy5oYXNOb256ZXJvQXJlYSgpICkge1xuICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKCBuZXcgQmluKCByaWdodEJvdW5kcywgdGhpcyApICk7XG4gICAgfVxuICAgIGlmICggYm90dG9tQm91bmRzLmhhc05vbnplcm9BcmVhKCkgKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLnB1c2goIG5ldyBCaW4oIGJvdHRvbUJvdW5kcywgdGhpcyApICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1haW5CaW47XG4gIH1cblxuICAvKipcbiAgICogTWFyayB0aGlzIGJpbiBhcyB1c2VkLiAoZG90LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHVzZSgpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc1NwbGl0LCAnU2hvdWxkIG5vdCBtYXJrIGEgc3BsaXQgYmluIGFzIHVzZWQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNVc2VkLCAnU2hvdWxkIG5vdCBtYXJrIGEgdXNlZCBiaW4gYXMgdXNlZCcgKTtcblxuICAgIHRoaXMuaXNVc2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrIHRoaXMgYmluIGFzIG5vdCB1c2VkLCBhbmQgYXR0ZW1wdCB0byBjb2xsYXBzZSBzcGxpdCBwYXJlbnRzIGlmIGFsbCBjaGlsZHJlbiBhcmUgdW51c2VkLiAoZG90LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHVudXNlKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNVc2VkLCAnQ2FuIG9ubHkgdW51c2UgYSB1c2VkIGluc3RhbmNlJyApO1xuXG4gICAgdGhpcy5pc1VzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmF0dGVtcHRUb0NvbGxhcHNlKCk7XG4gIH1cblxuICAvKipcbiAgICogSWYgb3VyIGJpbiBjYW4gYmUgY29sbGFwc2VkIChpdCBpcyBzcGxpdCBhbmQgaGFzIGNoaWxkcmVuIHRoYXQgYXJlIG5vdCB1c2VkIEFORCBub3Qgc3BsaXQpLCB0aGVuIHdlIHdpbGwgYmVjb21lXG4gICAqIG5vdCBzcGxpdCwgYW5kIHdpbGwgcmVtb3ZlIG91ciBjaGlsZHJlbi4gSWYgc3VjY2Vzc2Z1bCwgaXQgd2lsbCBhbHNvIGNhbGwgdGhpcyBvbiBvdXIgcGFyZW50LCBmdWxseSBhdHRlbXB0aW5nXG4gICAqIHRvIGNsZWFuIHVwIHVudXNlZCBkYXRhIHN0cnVjdHVyZXMuXG4gICAqL1xuICBwcml2YXRlIGF0dGVtcHRUb0NvbGxhcHNlKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNTcGxpdCwgJ1Nob3VsZCBvbmx5IGF0dGVtcHQgdG8gY29sbGFwc2Ugc3BsaXQgYmlucycgKTtcblxuICAgIC8vIEJhaWwgb3V0IGlmIGEgc2luZ2xlIGNoaWxkIGlzbid0IGFibGUgdG8gYmUgY29sbGFwc2VkLiBJZiBpdCBpcyBub3Qgc3BsaXQgb3IgdXNlZCwgaXQgd29uJ3QgaGF2ZSBhbnkgY2hpbGRyZW5cbiAgICAvLyBvciBuZWVkcy5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLmNoaWxkcmVuWyBpIF07XG5cbiAgICAgIGlmICggY2hpbGQuaXNTcGxpdCB8fCBjaGlsZC5pc1VzZWQgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSBjYW4gbm93IGNvbGxhcHNlIG91cnNlbHZlcyBuZWF0bHlcbiAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gICAgdGhpcy5pc1NwbGl0ID0gZmFsc2U7XG5cbiAgICAvLyBBbmQgYXR0ZW1wdCB0byBjb2xsYXBzZSBvdXIgcGFyZW50XG4gICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuYXR0ZW1wdFRvQ29sbGFwc2UoKTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy50b1N0cmluZygpICsgKCB0aGlzLmlzVXNlZCA/ICcgdXNlZCcgOiAnJyApO1xuICB9XG59XG5cbkJpblBhY2tlci5CaW4gPSBCaW47Il0sIm5hbWVzIjpbIkJvdW5kczIiLCJkb3QiLCJCaW5QYWNrZXIiLCJhbGxvY2F0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiYmluIiwicm9vdEJpbiIsImZpbmRBdmFpbGFibGVCaW4iLCJzaXplZEJpbiIsInNwbGl0IiwidXNlIiwiZGVhbGxvY2F0ZSIsInVudXNlIiwidG9TdHJpbmciLCJyZXN1bHQiLCJwYWRkaW5nIiwiYmluVHJlZSIsIl8iLCJlYWNoIiwiY2hpbGRyZW4iLCJzdWJzdHJpbmciLCJib3VuZHMiLCJCaW4iLCJyZWdpc3RlciIsImFzc2VydCIsImlzVXNlZCIsImlzU3BsaXQiLCJpIiwibGVuZ3RoIiwic3BsaXRYIiwibWluWCIsInNwbGl0WSIsIm1pblkiLCJtYWluQm91bmRzIiwicmlnaHRCb3VuZHMiLCJtYXhYIiwiYm90dG9tQm91bmRzIiwibWF4WSIsIm1haW5CaW4iLCJwdXNoIiwiaGFzTm9uemVyb0FyZWEiLCJwYXJlbnQiLCJhdHRlbXB0VG9Db2xsYXBzZSIsImNoaWxkIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMEJDLEdBRUQsT0FBT0EsYUFBYSxlQUFlO0FBQ25DLE9BQU9DLFNBQVMsV0FBVztBQUVaLElBQUEsQUFBTUMsWUFBTixNQUFNQTtJQWFuQjs7R0FFQyxHQUNELEFBQU9DLFNBQVVDLEtBQWEsRUFBRUMsTUFBYyxFQUFlO1FBQzNELG9EQUFvRDtR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