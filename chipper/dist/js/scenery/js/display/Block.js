// Copyright 2014-2023, University of Colorado Boulder
/**
 * A specialized drawable for a layer of drawables with the same renderer (basically, it's a Canvas element, SVG
 * element, or some type of DOM container). Doesn't strictly have to have its DOM element used directly (Canvas block
 * used for caches).  This type is abstract, and meant to be subclassed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import cleanArray from '../../../phet-core/js/cleanArray.js';
import { Drawable, scenery } from '../imports.js';
let Block = class Block extends Drawable {
    /**
   * @public
   *
   * @param {Display} display
   * @param {number} renderer
   */ initialize(display, renderer) {
        assert && assert(!display._isDisposing, 'Should not create a block for a Display that is being disposed of');
        assert && assert(!display._isDisposed, 'Should not create a block for a disposed Display');
        super.initialize(renderer);
        // @public {Display}
        this.display = display;
        // @public {number}
        this.drawableCount = 0;
        // @public {boolean} - flag handled in the stitch
        this.used = true;
        // @public {Drawable|null}
        this.firstDrawable = null;
        this.lastDrawable = null;
        this.pendingFirstDrawable = null;
        this.pendingLastDrawable = null;
        // @public {Block|null} - linked-list handling for blocks
        this.previousBlock = null;
        this.nextBlock = null;
        // @public {number} - last set z-index, valid if > 0.
        this.zIndex = 0;
        if (assertSlow) {
            this.drawableList = cleanArray(this.drawableList);
        }
    }
    /**
   * Releases references
   * @public
   * @override
   */ dispose() {
        assert && assert(this.drawableCount === 0, 'There should be no drawables on a block when it is disposed');
        // clear references
        this.display = null;
        this.firstDrawable = null;
        this.lastDrawable = null;
        this.pendingFirstDrawable = null;
        this.pendingLastDrawable = null;
        this.previousBlock = null;
        this.nextBlock = null;
        // TODO: are we potentially leaking drawable lists here? https://github.com/phetsims/scenery/issues/1581
        if (assertSlow) {
            cleanArray(this.drawableList);
        }
        super.dispose();
    }
    /**
   * Adds a drawable to this block.
   * @public
   *
   * @param {Drawable} drawable
   */ addDrawable(drawable) {
        this.drawableCount++;
        this.markDirtyDrawable(drawable);
        if (assertSlow) {
            const idx = _.indexOf(this.drawableList, drawable);
            assertSlow && assertSlow(idx === -1, 'Drawable should not be added when it has not been removed');
            this.drawableList.push(drawable);
            assertSlow && assertSlow(this.drawableCount === this.drawableList.length, 'Count sanity check, to make sure our assertions are not buggy');
        }
    }
    /**
   * Removes a drawable from this block.
   * @public
   *
   * @param {Drawable} drawable
   */ removeDrawable(drawable) {
        this.drawableCount--;
        this.markDirty();
        if (assertSlow) {
            const idx = _.indexOf(this.drawableList, drawable);
            assertSlow && assertSlow(idx !== -1, 'Drawable should be already added when it is removed');
            this.drawableList.splice(idx, 1);
            assertSlow && assertSlow(this.drawableCount === this.drawableList.length, 'Count sanity check, to make sure our assertions are not buggy');
        }
    }
    /**
   * @protected
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */ onIntervalChange(firstDrawable, lastDrawable) {
    // stub, should be filled in with behavior in blocks
    }
    /**
   * @public
   */ updateInterval() {
        if (this.pendingFirstDrawable !== this.firstDrawable || this.pendingLastDrawable !== this.lastDrawable) {
            this.onIntervalChange(this.pendingFirstDrawable, this.pendingLastDrawable);
            this.firstDrawable = this.pendingFirstDrawable;
            this.lastDrawable = this.pendingLastDrawable;
        }
    }
    /**
   * @public
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */ notifyInterval(firstDrawable, lastDrawable) {
        this.pendingFirstDrawable = firstDrawable;
        this.pendingLastDrawable = lastDrawable;
        this.updateInterval();
    }
    /**
   * Runs checks on the drawable, based on certain flags.
   * @public
   * @override
   *
   * @param {boolean} allowPendingBlock
   * @param {boolean} allowPendingList
   * @param {boolean} allowDirty
   */ audit(allowPendingBlock, allowPendingList, allowDirty) {
        if (assertSlow) {
            super.audit(allowPendingBlock, allowPendingList, allowDirty);
            let count = 0;
            if (!allowPendingList) {
                // audit children, and get a count
                for(let drawable = this.firstDrawable; drawable !== null; drawable = drawable.nextDrawable){
                    drawable.audit(allowPendingBlock, allowPendingList, allowDirty);
                    count++;
                    if (drawable === this.lastDrawable) {
                        break;
                    }
                }
                if (!allowPendingBlock) {
                    assertSlow && assertSlow(count === this.drawableCount, 'drawableCount should match');
                    assertSlow && assertSlow(this.firstDrawable === this.pendingFirstDrawable, 'No pending first drawable');
                    assertSlow && assertSlow(this.lastDrawable === this.pendingLastDrawable, 'No pending last drawable');
                    // scan through to make sure our drawable lists are identical
                    for(let d = this.firstDrawable; d !== null; d = d.nextDrawable){
                        assertSlow && assertSlow(d.renderer === this.renderer, 'Renderers should match');
                        assertSlow && assertSlow(d.parentDrawable === this, 'This block should be this drawable\'s parent');
                        assertSlow && assertSlow(_.indexOf(this.drawableList, d) >= 0);
                        if (d === this.lastDrawable) {
                            break;
                        }
                    }
                }
            }
        }
    }
};
scenery.register('Block', Block);
export default Block;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9CbG9jay5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIGRyYXdhYmxlIGZvciBhIGxheWVyIG9mIGRyYXdhYmxlcyB3aXRoIHRoZSBzYW1lIHJlbmRlcmVyIChiYXNpY2FsbHksIGl0J3MgYSBDYW52YXMgZWxlbWVudCwgU1ZHXG4gKiBlbGVtZW50LCBvciBzb21lIHR5cGUgb2YgRE9NIGNvbnRhaW5lcikuIERvZXNuJ3Qgc3RyaWN0bHkgaGF2ZSB0byBoYXZlIGl0cyBET00gZWxlbWVudCB1c2VkIGRpcmVjdGx5IChDYW52YXMgYmxvY2tcbiAqIHVzZWQgZm9yIGNhY2hlcykuICBUaGlzIHR5cGUgaXMgYWJzdHJhY3QsIGFuZCBtZWFudCB0byBiZSBzdWJjbGFzc2VkLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgeyBEcmF3YWJsZSwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBCbG9jayBleHRlbmRzIERyYXdhYmxlIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKi9cbiAgaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWRpc3BsYXkuX2lzRGlzcG9zaW5nLCAnU2hvdWxkIG5vdCBjcmVhdGUgYSBibG9jayBmb3IgYSBEaXNwbGF5IHRoYXQgaXMgYmVpbmcgZGlzcG9zZWQgb2YnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWRpc3BsYXkuX2lzRGlzcG9zZWQsICdTaG91bGQgbm90IGNyZWF0ZSBhIGJsb2NrIGZvciBhIGRpc3Bvc2VkIERpc3BsYXknICk7XG5cbiAgICBzdXBlci5pbml0aWFsaXplKCByZW5kZXJlciApO1xuXG4gICAgLy8gQHB1YmxpYyB7RGlzcGxheX1cbiAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5O1xuXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxuICAgIHRoaXMuZHJhd2FibGVDb3VudCA9IDA7XG5cbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIGZsYWcgaGFuZGxlZCBpbiB0aGUgc3RpdGNoXG4gICAgdGhpcy51c2VkID0gdHJ1ZTtcblxuICAgIC8vIEBwdWJsaWMge0RyYXdhYmxlfG51bGx9XG4gICAgdGhpcy5maXJzdERyYXdhYmxlID0gbnVsbDtcbiAgICB0aGlzLmxhc3REcmF3YWJsZSA9IG51bGw7XG4gICAgdGhpcy5wZW5kaW5nRmlyc3REcmF3YWJsZSA9IG51bGw7XG4gICAgdGhpcy5wZW5kaW5nTGFzdERyYXdhYmxlID0gbnVsbDtcblxuICAgIC8vIEBwdWJsaWMge0Jsb2NrfG51bGx9IC0gbGlua2VkLWxpc3QgaGFuZGxpbmcgZm9yIGJsb2Nrc1xuICAgIHRoaXMucHJldmlvdXNCbG9jayA9IG51bGw7XG4gICAgdGhpcy5uZXh0QmxvY2sgPSBudWxsO1xuXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIGxhc3Qgc2V0IHotaW5kZXgsIHZhbGlkIGlmID4gMC5cbiAgICB0aGlzLnpJbmRleCA9IDA7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICB0aGlzLmRyYXdhYmxlTGlzdCA9IGNsZWFuQXJyYXkoIHRoaXMuZHJhd2FibGVMaXN0ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5kcmF3YWJsZUNvdW50ID09PSAwLCAnVGhlcmUgc2hvdWxkIGJlIG5vIGRyYXdhYmxlcyBvbiBhIGJsb2NrIHdoZW4gaXQgaXMgZGlzcG9zZWQnICk7XG5cbiAgICAvLyBjbGVhciByZWZlcmVuY2VzXG4gICAgdGhpcy5kaXNwbGF5ID0gbnVsbDtcbiAgICB0aGlzLmZpcnN0RHJhd2FibGUgPSBudWxsO1xuICAgIHRoaXMubGFzdERyYXdhYmxlID0gbnVsbDtcbiAgICB0aGlzLnBlbmRpbmdGaXJzdERyYXdhYmxlID0gbnVsbDtcbiAgICB0aGlzLnBlbmRpbmdMYXN0RHJhd2FibGUgPSBudWxsO1xuXG4gICAgdGhpcy5wcmV2aW91c0Jsb2NrID0gbnVsbDtcbiAgICB0aGlzLm5leHRCbG9jayA9IG51bGw7XG5cbiAgICAvLyBUT0RPOiBhcmUgd2UgcG90ZW50aWFsbHkgbGVha2luZyBkcmF3YWJsZSBsaXN0cyBoZXJlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgIGNsZWFuQXJyYXkoIHRoaXMuZHJhd2FibGVMaXN0ICk7XG4gICAgfVxuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBkcmF3YWJsZSB0byB0aGlzIGJsb2NrLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqL1xuICBhZGREcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgdGhpcy5kcmF3YWJsZUNvdW50Kys7XG4gICAgdGhpcy5tYXJrRGlydHlEcmF3YWJsZSggZHJhd2FibGUgKTtcblxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgIGNvbnN0IGlkeCA9IF8uaW5kZXhPZiggdGhpcy5kcmF3YWJsZUxpc3QsIGRyYXdhYmxlICk7XG4gICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIGlkeCA9PT0gLTEsICdEcmF3YWJsZSBzaG91bGQgbm90IGJlIGFkZGVkIHdoZW4gaXQgaGFzIG5vdCBiZWVuIHJlbW92ZWQnICk7XG4gICAgICB0aGlzLmRyYXdhYmxlTGlzdC5wdXNoKCBkcmF3YWJsZSApO1xuXG4gICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIHRoaXMuZHJhd2FibGVDb3VudCA9PT0gdGhpcy5kcmF3YWJsZUxpc3QubGVuZ3RoLCAnQ291bnQgc2FuaXR5IGNoZWNrLCB0byBtYWtlIHN1cmUgb3VyIGFzc2VydGlvbnMgYXJlIG5vdCBidWdneScgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGRyYXdhYmxlIGZyb20gdGhpcyBibG9jay5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgcmVtb3ZlRHJhd2FibGUoIGRyYXdhYmxlICkge1xuICAgIHRoaXMuZHJhd2FibGVDb3VudC0tO1xuICAgIHRoaXMubWFya0RpcnR5KCk7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICBjb25zdCBpZHggPSBfLmluZGV4T2YoIHRoaXMuZHJhd2FibGVMaXN0LCBkcmF3YWJsZSApO1xuICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCBpZHggIT09IC0xLCAnRHJhd2FibGUgc2hvdWxkIGJlIGFscmVhZHkgYWRkZWQgd2hlbiBpdCBpcyByZW1vdmVkJyApO1xuICAgICAgdGhpcy5kcmF3YWJsZUxpc3Quc3BsaWNlKCBpZHgsIDEgKTtcblxuICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCB0aGlzLmRyYXdhYmxlQ291bnQgPT09IHRoaXMuZHJhd2FibGVMaXN0Lmxlbmd0aCwgJ0NvdW50IHNhbml0eSBjaGVjaywgdG8gbWFrZSBzdXJlIG91ciBhc3NlcnRpb25zIGFyZSBub3QgYnVnZ3knICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcm90ZWN0ZWRcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcbiAgICovXG4gIG9uSW50ZXJ2YWxDaGFuZ2UoIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSApIHtcbiAgICAvLyBzdHViLCBzaG91bGQgYmUgZmlsbGVkIGluIHdpdGggYmVoYXZpb3IgaW4gYmxvY2tzXG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgdXBkYXRlSW50ZXJ2YWwoKSB7XG4gICAgaWYgKCB0aGlzLnBlbmRpbmdGaXJzdERyYXdhYmxlICE9PSB0aGlzLmZpcnN0RHJhd2FibGUgfHxcbiAgICAgICAgIHRoaXMucGVuZGluZ0xhc3REcmF3YWJsZSAhPT0gdGhpcy5sYXN0RHJhd2FibGUgKSB7XG4gICAgICB0aGlzLm9uSW50ZXJ2YWxDaGFuZ2UoIHRoaXMucGVuZGluZ0ZpcnN0RHJhd2FibGUsIHRoaXMucGVuZGluZ0xhc3REcmF3YWJsZSApO1xuXG4gICAgICB0aGlzLmZpcnN0RHJhd2FibGUgPSB0aGlzLnBlbmRpbmdGaXJzdERyYXdhYmxlO1xuICAgICAgdGhpcy5sYXN0RHJhd2FibGUgPSB0aGlzLnBlbmRpbmdMYXN0RHJhd2FibGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcbiAgICovXG4gIG5vdGlmeUludGVydmFsKCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKSB7XG4gICAgdGhpcy5wZW5kaW5nRmlyc3REcmF3YWJsZSA9IGZpcnN0RHJhd2FibGU7XG4gICAgdGhpcy5wZW5kaW5nTGFzdERyYXdhYmxlID0gbGFzdERyYXdhYmxlO1xuXG4gICAgdGhpcy51cGRhdGVJbnRlcnZhbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgY2hlY2tzIG9uIHRoZSBkcmF3YWJsZSwgYmFzZWQgb24gY2VydGFpbiBmbGFncy5cbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBhbGxvd1BlbmRpbmdCbG9ja1xuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93UGVuZGluZ0xpc3RcbiAgICogQHBhcmFtIHtib29sZWFufSBhbGxvd0RpcnR5XG4gICAqL1xuICBhdWRpdCggYWxsb3dQZW5kaW5nQmxvY2ssIGFsbG93UGVuZGluZ0xpc3QsIGFsbG93RGlydHkgKSB7XG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xuICAgICAgc3VwZXIuYXVkaXQoIGFsbG93UGVuZGluZ0Jsb2NrLCBhbGxvd1BlbmRpbmdMaXN0LCBhbGxvd0RpcnR5ICk7XG5cbiAgICAgIGxldCBjb3VudCA9IDA7XG5cbiAgICAgIGlmICggIWFsbG93UGVuZGluZ0xpc3QgKSB7XG5cbiAgICAgICAgLy8gYXVkaXQgY2hpbGRyZW4sIGFuZCBnZXQgYSBjb3VudFxuICAgICAgICBmb3IgKCBsZXQgZHJhd2FibGUgPSB0aGlzLmZpcnN0RHJhd2FibGU7IGRyYXdhYmxlICE9PSBudWxsOyBkcmF3YWJsZSA9IGRyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcbiAgICAgICAgICBkcmF3YWJsZS5hdWRpdCggYWxsb3dQZW5kaW5nQmxvY2ssIGFsbG93UGVuZGluZ0xpc3QsIGFsbG93RGlydHkgKTtcbiAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgIGlmICggZHJhd2FibGUgPT09IHRoaXMubGFzdERyYXdhYmxlICkgeyBicmVhazsgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCAhYWxsb3dQZW5kaW5nQmxvY2sgKSB7XG4gICAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCBjb3VudCA9PT0gdGhpcy5kcmF3YWJsZUNvdW50LCAnZHJhd2FibGVDb3VudCBzaG91bGQgbWF0Y2gnICk7XG5cbiAgICAgICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIHRoaXMuZmlyc3REcmF3YWJsZSA9PT0gdGhpcy5wZW5kaW5nRmlyc3REcmF3YWJsZSwgJ05vIHBlbmRpbmcgZmlyc3QgZHJhd2FibGUnICk7XG4gICAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCB0aGlzLmxhc3REcmF3YWJsZSA9PT0gdGhpcy5wZW5kaW5nTGFzdERyYXdhYmxlLCAnTm8gcGVuZGluZyBsYXN0IGRyYXdhYmxlJyApO1xuXG4gICAgICAgICAgLy8gc2NhbiB0aHJvdWdoIHRvIG1ha2Ugc3VyZSBvdXIgZHJhd2FibGUgbGlzdHMgYXJlIGlkZW50aWNhbFxuICAgICAgICAgIGZvciAoIGxldCBkID0gdGhpcy5maXJzdERyYXdhYmxlOyBkICE9PSBudWxsOyBkID0gZC5uZXh0RHJhd2FibGUgKSB7XG4gICAgICAgICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIGQucmVuZGVyZXIgPT09IHRoaXMucmVuZGVyZXIsICdSZW5kZXJlcnMgc2hvdWxkIG1hdGNoJyApO1xuICAgICAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCBkLnBhcmVudERyYXdhYmxlID09PSB0aGlzLCAnVGhpcyBibG9jayBzaG91bGQgYmUgdGhpcyBkcmF3YWJsZVxcJ3MgcGFyZW50JyApO1xuICAgICAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCBfLmluZGV4T2YoIHRoaXMuZHJhd2FibGVMaXN0LCBkICkgPj0gMCApO1xuICAgICAgICAgICAgaWYgKCBkID09PSB0aGlzLmxhc3REcmF3YWJsZSApIHsgYnJlYWs7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0Jsb2NrJywgQmxvY2sgKTtcbmV4cG9ydCBkZWZhdWx0IEJsb2NrOyJdLCJuYW1lcyI6WyJjbGVhbkFycmF5IiwiRHJhd2FibGUiLCJzY2VuZXJ5IiwiQmxvY2siLCJpbml0aWFsaXplIiwiZGlzcGxheSIsInJlbmRlcmVyIiwiYXNzZXJ0IiwiX2lzRGlzcG9zaW5nIiwiX2lzRGlzcG9zZWQiLCJkcmF3YWJsZUNvdW50IiwidXNlZCIsImZpcnN0RHJhd2FibGUiLCJsYXN0RHJhd2FibGUiLCJwZW5kaW5nRmlyc3REcmF3YWJsZSIsInBlbmRpbmdMYXN0RHJhd2FibGUiLCJwcmV2aW91c0Jsb2NrIiwibmV4dEJsb2NrIiwiekluZGV4IiwiYXNzZXJ0U2xvdyIsImRyYXdhYmxlTGlzdCIsImRpc3Bvc2UiLCJhZGREcmF3YWJsZSIsImRyYXdhYmxlIiwibWFya0RpcnR5RHJhd2FibGUiLCJpZHgiLCJfIiwiaW5kZXhPZiIsInB1c2giLCJsZW5ndGgiLCJyZW1vdmVEcmF3YWJsZSIsIm1hcmtEaXJ0eSIsInNwbGljZSIsIm9uSW50ZXJ2YWxDaGFuZ2UiLCJ1cGRhdGVJbnRlcnZhbCIsIm5vdGlmeUludGVydmFsIiwiYXVkaXQiLCJhbGxvd1BlbmRpbmdCbG9jayIsImFsbG93UGVuZGluZ0xpc3QiLCJhbGxvd0RpcnR5IiwiY291bnQiLCJuZXh0RHJhd2FibGUiLCJkIiwicGFyZW50RHJhd2FibGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLGdCQUFnQixzQ0FBc0M7QUFDN0QsU0FBU0MsUUFBUSxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRWxELElBQUEsQUFBTUMsUUFBTixNQUFNQSxjQUFjRjtJQUNsQjs7Ozs7R0FLQyxHQUNERyxXQUFZQyxPQUFPLEVBQUVDLFFBQVEsRUFBRztRQUM5QkMsVUFBVUEsT0FBUSxDQUFDRixRQUFRRyxZQUFZLEVBQUU7UUFDekNELFVBQVVBLE9BQVEsQ0FBQ0YsUUFBUUksV0FBVyxFQUFFO1FBRXhDLEtBQUssQ0FBQ0wsV0FBWUU7UUFFbEIsb0JBQW9CO1FBQ3BCLElBQUksQ0FBQ0QsT0FBTyxHQUFHQTtRQUVmLG1CQUFtQjtRQUNuQixJQUFJLENB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