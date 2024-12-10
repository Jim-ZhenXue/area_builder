// Copyright 2014-2022, University of Colorado Boulder
/**
 * An interval (implicit consecutive sequence of drawables) that has a recorded change in-between the two ends.
 * We store the closest drawables to the interval that aren't changed, or null itself to indicate "to the end".
 *
 * isEmpty() should be used before checking the endpoints, since it could have a null-to-null state but be empty,
 * since we arrived at that state from constriction.
 *
 * For documentation purposes, an 'internal' drawable is one that is in-between (but not including) our un-changed ends
 * (drawableBefore and drawableAfter), and 'external' drawables are outside (or including) the un-changed ends.
 *
 * For stitching purposes, a ChangeInterval effectively represents two linked lists: the "old" one that was displayed
 * in the previous frame (using oldNextDrawable for iteration across the drawable linked-list), or the "new" one that
 * will be displayed in the next frame (using nextDrawable for iteration).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../phet-core/js/Poolable.js';
import { Drawable, scenery } from '../imports.js';
let ChangeInterval = class ChangeInterval {
    /**
   * @public
   *
   * @param {Drawable} drawableBefore
   * @param {Drawable} drawableAfter
   */ initialize(drawableBefore, drawableAfter) {
        assert && assert(drawableBefore === null || drawableBefore instanceof Drawable, 'drawableBefore can either be null to indicate that there is no un-changed drawable before our changes, ' + 'or it can reference an un-changed drawable');
        assert && assert(drawableAfter === null || drawableAfter instanceof Drawable, 'drawableAfter can either be null to indicate that there is no un-changed drawable after our changes, ' + 'or it can reference an un-changed drawable');
        /*---------------------------------------------------------------------------*
     * All @public properties
     *----------------------------------------------------------------------------*/ // @public {ChangeInterval|null}, singly-linked list
        this.nextChangeInterval = null;
        // @public {Drawable|null}, the drawable before our ChangeInterval that is not modified. null indicates that we
        // don't yet have a "before" boundary, and should be connected to the closest drawable that is unchanged.
        this.drawableBefore = drawableBefore;
        // @public {Drawable|null}, the drawable after our ChangeInterval that is not modified. null indicates that we
        // don't yet have a "after" boundary, and should be connected to the closest drawable that is unchanged.
        this.drawableAfter = drawableAfter;
        // @public {boolean} If a null-to-X interval gets collapsed all the way, we want to have a flag that indicates that.
        // Otherwise, it would be interpreted as a null-to-null change interval ("change everything"), instead of the
        // correct "change nothing".
        this.collapsedEmpty = false;
    }
    /**
   * Releases references
   * @public
   */ dispose() {
        // release our references
        this.nextChangeInterval = null;
        this.drawableBefore = null;
        this.drawableAfter = null;
        this.freeToPool();
    }
    /**
   * Make our interval as tight as possible (we may have over-estimated it before)
   * @public
   *
   * @returns {boolean} - Whether it was changed
   */ constrict() {
        let changed = false;
        if (this.isEmpty()) {
            return true;
        }
        // Notes: We don't constrict null boundaries, and we should never constrict a non-null boundary to a null
        // boundary (this the this.drawableX.Xdrawable truthy check), since going from a null-to-X interval to
        // null-to-null has a completely different meaning. This should be checked by a client of this API.
        while(this.drawableBefore && this.drawableBefore.nextDrawable === this.drawableBefore.oldNextDrawable){
            this.drawableBefore = this.drawableBefore.nextDrawable;
            changed = true;
            // check for a totally-collapsed state
            if (!this.drawableBefore) {
                assert && assert(!this.drawableAfter);
                this.collapsedEmpty = true;
            }
            // if we are empty, bail out before continuing
            if (this.isEmpty()) {
                return true;
            }
        }
        while(this.drawableAfter && this.drawableAfter.previousDrawable === this.drawableAfter.oldPreviousDrawable){
            this.drawableAfter = this.drawableAfter.previousDrawable;
            changed = true;
            // check for a totally-collapsed state
            if (!this.drawableAfter) {
                assert && assert(!this.drawableBefore);
                this.collapsedEmpty = true;
            }
            // if we are empty, bail out before continuing
            if (this.isEmpty()) {
                return true;
            }
        }
        return changed;
    }
    /**
   * @public
   *
   * @returns {boolean}
   */ isEmpty() {
        return this.collapsedEmpty || this.drawableBefore !== null && this.drawableBefore === this.drawableAfter;
    }
    /**
   * The quantity of "old" internal drawables. Requires the old first/last drawables for the backbone, since
   * we need that information for null-before/after boundaries.
   * @public
   *
   * @param {Drawable} oldStitchFirstDrawable
   * @param {Drawable} oldStitchLastDrawable
   * @returns {number}
   */ getOldInternalDrawableCount(oldStitchFirstDrawable, oldStitchLastDrawable) {
        const firstInclude = this.drawableBefore ? this.drawableBefore.oldNextDrawable : oldStitchFirstDrawable;
        const lastExclude = this.drawableAfter; // null is OK here
        let count = 0;
        for(let drawable = firstInclude; drawable !== lastExclude; drawable = drawable.oldNextDrawable){
            count++;
        }
        return count;
    }
    /**
   * The quantity of "new" internal drawables. Requires the old first/last drawables for the backbone, since
   * we need that information for null-before/after boundaries.
   * @public
   *
   * @param {Drawable} newStitchFirstDrawable
   * @param {Drawable} newStitchLastDrawable
   *
   * @returns {number}
   */ getNewInternalDrawableCount(newStitchFirstDrawable, newStitchLastDrawable) {
        const firstInclude = this.drawableBefore ? this.drawableBefore.nextDrawable : newStitchFirstDrawable;
        const lastExclude = this.drawableAfter; // null is OK here
        let count = 0;
        for(let drawable = firstInclude; drawable !== lastExclude; drawable = drawable.nextDrawable){
            count++;
        }
        return count;
    }
    /**
   * Creates a ChangeInterval that will be disposed after syncTree is complete (see Display phases).
   * @public
   *
   * @param {Drawable} drawableBefore
   * @param {Drawable} drawableAfter
   * @param {Display} display
   *
   * @returns {ChangeInterval}
   */ static newForDisplay(drawableBefore, drawableAfter, display) {
        const changeInterval = ChangeInterval.createFromPool(drawableBefore, drawableAfter);
        display.markChangeIntervalToDispose(changeInterval);
        return changeInterval;
    }
    /**
   * @mixes Poolable
   *
   * @param {Drawable} drawableBefore
   * @param {Drawable} drawableAfter
   */ constructor(drawableBefore, drawableAfter){
        this.initialize(drawableBefore, drawableAfter);
    }
};
scenery.register('ChangeInterval', ChangeInterval);
Poolable.mixInto(ChangeInterval);
export default ChangeInterval;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9DaGFuZ2VJbnRlcnZhbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBbiBpbnRlcnZhbCAoaW1wbGljaXQgY29uc2VjdXRpdmUgc2VxdWVuY2Ugb2YgZHJhd2FibGVzKSB0aGF0IGhhcyBhIHJlY29yZGVkIGNoYW5nZSBpbi1iZXR3ZWVuIHRoZSB0d28gZW5kcy5cbiAqIFdlIHN0b3JlIHRoZSBjbG9zZXN0IGRyYXdhYmxlcyB0byB0aGUgaW50ZXJ2YWwgdGhhdCBhcmVuJ3QgY2hhbmdlZCwgb3IgbnVsbCBpdHNlbGYgdG8gaW5kaWNhdGUgXCJ0byB0aGUgZW5kXCIuXG4gKlxuICogaXNFbXB0eSgpIHNob3VsZCBiZSB1c2VkIGJlZm9yZSBjaGVja2luZyB0aGUgZW5kcG9pbnRzLCBzaW5jZSBpdCBjb3VsZCBoYXZlIGEgbnVsbC10by1udWxsIHN0YXRlIGJ1dCBiZSBlbXB0eSxcbiAqIHNpbmNlIHdlIGFycml2ZWQgYXQgdGhhdCBzdGF0ZSBmcm9tIGNvbnN0cmljdGlvbi5cbiAqXG4gKiBGb3IgZG9jdW1lbnRhdGlvbiBwdXJwb3NlcywgYW4gJ2ludGVybmFsJyBkcmF3YWJsZSBpcyBvbmUgdGhhdCBpcyBpbi1iZXR3ZWVuIChidXQgbm90IGluY2x1ZGluZykgb3VyIHVuLWNoYW5nZWQgZW5kc1xuICogKGRyYXdhYmxlQmVmb3JlIGFuZCBkcmF3YWJsZUFmdGVyKSwgYW5kICdleHRlcm5hbCcgZHJhd2FibGVzIGFyZSBvdXRzaWRlIChvciBpbmNsdWRpbmcpIHRoZSB1bi1jaGFuZ2VkIGVuZHMuXG4gKlxuICogRm9yIHN0aXRjaGluZyBwdXJwb3NlcywgYSBDaGFuZ2VJbnRlcnZhbCBlZmZlY3RpdmVseSByZXByZXNlbnRzIHR3byBsaW5rZWQgbGlzdHM6IHRoZSBcIm9sZFwiIG9uZSB0aGF0IHdhcyBkaXNwbGF5ZWRcbiAqIGluIHRoZSBwcmV2aW91cyBmcmFtZSAodXNpbmcgb2xkTmV4dERyYXdhYmxlIGZvciBpdGVyYXRpb24gYWNyb3NzIHRoZSBkcmF3YWJsZSBsaW5rZWQtbGlzdCksIG9yIHRoZSBcIm5ld1wiIG9uZSB0aGF0XG4gKiB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgbmV4dCBmcmFtZSAodXNpbmcgbmV4dERyYXdhYmxlIGZvciBpdGVyYXRpb24pLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IERyYXdhYmxlLCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIENoYW5nZUludGVydmFsIHtcbiAgLyoqXG4gICAqIEBtaXhlcyBQb29sYWJsZVxuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZUJlZm9yZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZUFmdGVyXG4gICAqL1xuICBjb25zdHJ1Y3RvciggZHJhd2FibGVCZWZvcmUsIGRyYXdhYmxlQWZ0ZXIgKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCBkcmF3YWJsZUJlZm9yZSwgZHJhd2FibGVBZnRlciApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVCZWZvcmVcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVBZnRlclxuICAgKi9cbiAgaW5pdGlhbGl6ZSggZHJhd2FibGVCZWZvcmUsIGRyYXdhYmxlQWZ0ZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGVCZWZvcmUgPT09IG51bGwgfHwgKCBkcmF3YWJsZUJlZm9yZSBpbnN0YW5jZW9mIERyYXdhYmxlICksXG4gICAgICAnZHJhd2FibGVCZWZvcmUgY2FuIGVpdGhlciBiZSBudWxsIHRvIGluZGljYXRlIHRoYXQgdGhlcmUgaXMgbm8gdW4tY2hhbmdlZCBkcmF3YWJsZSBiZWZvcmUgb3VyIGNoYW5nZXMsICcgK1xuICAgICAgJ29yIGl0IGNhbiByZWZlcmVuY2UgYW4gdW4tY2hhbmdlZCBkcmF3YWJsZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkcmF3YWJsZUFmdGVyID09PSBudWxsIHx8ICggZHJhd2FibGVBZnRlciBpbnN0YW5jZW9mIERyYXdhYmxlICksXG4gICAgICAnZHJhd2FibGVBZnRlciBjYW4gZWl0aGVyIGJlIG51bGwgdG8gaW5kaWNhdGUgdGhhdCB0aGVyZSBpcyBubyB1bi1jaGFuZ2VkIGRyYXdhYmxlIGFmdGVyIG91ciBjaGFuZ2VzLCAnICtcbiAgICAgICdvciBpdCBjYW4gcmVmZXJlbmNlIGFuIHVuLWNoYW5nZWQgZHJhd2FibGUnICk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICAgKiBBbGwgQHB1YmxpYyBwcm9wZXJ0aWVzXG4gICAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8vIEBwdWJsaWMge0NoYW5nZUludGVydmFsfG51bGx9LCBzaW5nbHktbGlua2VkIGxpc3RcbiAgICB0aGlzLm5leHRDaGFuZ2VJbnRlcnZhbCA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtEcmF3YWJsZXxudWxsfSwgdGhlIGRyYXdhYmxlIGJlZm9yZSBvdXIgQ2hhbmdlSW50ZXJ2YWwgdGhhdCBpcyBub3QgbW9kaWZpZWQuIG51bGwgaW5kaWNhdGVzIHRoYXQgd2VcbiAgICAvLyBkb24ndCB5ZXQgaGF2ZSBhIFwiYmVmb3JlXCIgYm91bmRhcnksIGFuZCBzaG91bGQgYmUgY29ubmVjdGVkIHRvIHRoZSBjbG9zZXN0IGRyYXdhYmxlIHRoYXQgaXMgdW5jaGFuZ2VkLlxuICAgIHRoaXMuZHJhd2FibGVCZWZvcmUgPSBkcmF3YWJsZUJlZm9yZTtcblxuICAgIC8vIEBwdWJsaWMge0RyYXdhYmxlfG51bGx9LCB0aGUgZHJhd2FibGUgYWZ0ZXIgb3VyIENoYW5nZUludGVydmFsIHRoYXQgaXMgbm90IG1vZGlmaWVkLiBudWxsIGluZGljYXRlcyB0aGF0IHdlXG4gICAgLy8gZG9uJ3QgeWV0IGhhdmUgYSBcImFmdGVyXCIgYm91bmRhcnksIGFuZCBzaG91bGQgYmUgY29ubmVjdGVkIHRvIHRoZSBjbG9zZXN0IGRyYXdhYmxlIHRoYXQgaXMgdW5jaGFuZ2VkLlxuICAgIHRoaXMuZHJhd2FibGVBZnRlciA9IGRyYXdhYmxlQWZ0ZXI7XG5cbiAgICAvLyBAcHVibGljIHtib29sZWFufSBJZiBhIG51bGwtdG8tWCBpbnRlcnZhbCBnZXRzIGNvbGxhcHNlZCBhbGwgdGhlIHdheSwgd2Ugd2FudCB0byBoYXZlIGEgZmxhZyB0aGF0IGluZGljYXRlcyB0aGF0LlxuICAgIC8vIE90aGVyd2lzZSwgaXQgd291bGQgYmUgaW50ZXJwcmV0ZWQgYXMgYSBudWxsLXRvLW51bGwgY2hhbmdlIGludGVydmFsIChcImNoYW5nZSBldmVyeXRoaW5nXCIpLCBpbnN0ZWFkIG9mIHRoZVxuICAgIC8vIGNvcnJlY3QgXCJjaGFuZ2Ugbm90aGluZ1wiLlxuICAgIHRoaXMuY29sbGFwc2VkRW1wdHkgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgLy8gcmVsZWFzZSBvdXIgcmVmZXJlbmNlc1xuICAgIHRoaXMubmV4dENoYW5nZUludGVydmFsID0gbnVsbDtcbiAgICB0aGlzLmRyYXdhYmxlQmVmb3JlID0gbnVsbDtcbiAgICB0aGlzLmRyYXdhYmxlQWZ0ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBvdXIgaW50ZXJ2YWwgYXMgdGlnaHQgYXMgcG9zc2libGUgKHdlIG1heSBoYXZlIG92ZXItZXN0aW1hdGVkIGl0IGJlZm9yZSlcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIGl0IHdhcyBjaGFuZ2VkXG4gICAqL1xuICBjb25zdHJpY3QoKSB7XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuICAgIGlmICggdGhpcy5pc0VtcHR5KCkgKSB7IHJldHVybiB0cnVlOyB9XG5cbiAgICAvLyBOb3RlczogV2UgZG9uJ3QgY29uc3RyaWN0IG51bGwgYm91bmRhcmllcywgYW5kIHdlIHNob3VsZCBuZXZlciBjb25zdHJpY3QgYSBub24tbnVsbCBib3VuZGFyeSB0byBhIG51bGxcbiAgICAvLyBib3VuZGFyeSAodGhpcyB0aGUgdGhpcy5kcmF3YWJsZVguWGRyYXdhYmxlIHRydXRoeSBjaGVjayksIHNpbmNlIGdvaW5nIGZyb20gYSBudWxsLXRvLVggaW50ZXJ2YWwgdG9cbiAgICAvLyBudWxsLXRvLW51bGwgaGFzIGEgY29tcGxldGVseSBkaWZmZXJlbnQgbWVhbmluZy4gVGhpcyBzaG91bGQgYmUgY2hlY2tlZCBieSBhIGNsaWVudCBvZiB0aGlzIEFQSS5cblxuICAgIHdoaWxlICggdGhpcy5kcmF3YWJsZUJlZm9yZSAmJiB0aGlzLmRyYXdhYmxlQmVmb3JlLm5leHREcmF3YWJsZSA9PT0gdGhpcy5kcmF3YWJsZUJlZm9yZS5vbGROZXh0RHJhd2FibGUgKSB7XG4gICAgICB0aGlzLmRyYXdhYmxlQmVmb3JlID0gdGhpcy5kcmF3YWJsZUJlZm9yZS5uZXh0RHJhd2FibGU7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcblxuICAgICAgLy8gY2hlY2sgZm9yIGEgdG90YWxseS1jb2xsYXBzZWQgc3RhdGVcbiAgICAgIGlmICggIXRoaXMuZHJhd2FibGVCZWZvcmUgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmRyYXdhYmxlQWZ0ZXIgKTtcbiAgICAgICAgdGhpcy5jb2xsYXBzZWRFbXB0eSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHdlIGFyZSBlbXB0eSwgYmFpbCBvdXQgYmVmb3JlIGNvbnRpbnVpbmdcbiAgICAgIGlmICggdGhpcy5pc0VtcHR5KCkgKSB7IHJldHVybiB0cnVlOyB9XG4gICAgfVxuXG4gICAgd2hpbGUgKCB0aGlzLmRyYXdhYmxlQWZ0ZXIgJiYgdGhpcy5kcmF3YWJsZUFmdGVyLnByZXZpb3VzRHJhd2FibGUgPT09IHRoaXMuZHJhd2FibGVBZnRlci5vbGRQcmV2aW91c0RyYXdhYmxlICkge1xuICAgICAgdGhpcy5kcmF3YWJsZUFmdGVyID0gdGhpcy5kcmF3YWJsZUFmdGVyLnByZXZpb3VzRHJhd2FibGU7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcblxuICAgICAgLy8gY2hlY2sgZm9yIGEgdG90YWxseS1jb2xsYXBzZWQgc3RhdGVcbiAgICAgIGlmICggIXRoaXMuZHJhd2FibGVBZnRlciApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuZHJhd2FibGVCZWZvcmUgKTtcbiAgICAgICAgdGhpcy5jb2xsYXBzZWRFbXB0eSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHdlIGFyZSBlbXB0eSwgYmFpbCBvdXQgYmVmb3JlIGNvbnRpbnVpbmdcbiAgICAgIGlmICggdGhpcy5pc0VtcHR5KCkgKSB7IHJldHVybiB0cnVlOyB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29sbGFwc2VkRW1wdHkgfHwgKCB0aGlzLmRyYXdhYmxlQmVmb3JlICE9PSBudWxsICYmIHRoaXMuZHJhd2FibGVCZWZvcmUgPT09IHRoaXMuZHJhd2FibGVBZnRlciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBxdWFudGl0eSBvZiBcIm9sZFwiIGludGVybmFsIGRyYXdhYmxlcy4gUmVxdWlyZXMgdGhlIG9sZCBmaXJzdC9sYXN0IGRyYXdhYmxlcyBmb3IgdGhlIGJhY2tib25lLCBzaW5jZVxuICAgKiB3ZSBuZWVkIHRoYXQgaW5mb3JtYXRpb24gZm9yIG51bGwtYmVmb3JlL2FmdGVyIGJvdW5kYXJpZXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gb2xkU3RpdGNoRmlyc3REcmF3YWJsZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBvbGRTdGl0Y2hMYXN0RHJhd2FibGVcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldE9sZEludGVybmFsRHJhd2FibGVDb3VudCggb2xkU3RpdGNoRmlyc3REcmF3YWJsZSwgb2xkU3RpdGNoTGFzdERyYXdhYmxlICkge1xuICAgIGNvbnN0IGZpcnN0SW5jbHVkZSA9IHRoaXMuZHJhd2FibGVCZWZvcmUgPyB0aGlzLmRyYXdhYmxlQmVmb3JlLm9sZE5leHREcmF3YWJsZSA6IG9sZFN0aXRjaEZpcnN0RHJhd2FibGU7XG4gICAgY29uc3QgbGFzdEV4Y2x1ZGUgPSB0aGlzLmRyYXdhYmxlQWZ0ZXI7IC8vIG51bGwgaXMgT0sgaGVyZVxuXG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBmb3IgKCBsZXQgZHJhd2FibGUgPSBmaXJzdEluY2x1ZGU7IGRyYXdhYmxlICE9PSBsYXN0RXhjbHVkZTsgZHJhd2FibGUgPSBkcmF3YWJsZS5vbGROZXh0RHJhd2FibGUgKSB7XG4gICAgICBjb3VudCsrO1xuICAgIH1cblxuICAgIHJldHVybiBjb3VudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcXVhbnRpdHkgb2YgXCJuZXdcIiBpbnRlcm5hbCBkcmF3YWJsZXMuIFJlcXVpcmVzIHRoZSBvbGQgZmlyc3QvbGFzdCBkcmF3YWJsZXMgZm9yIHRoZSBiYWNrYm9uZSwgc2luY2VcbiAgICogd2UgbmVlZCB0aGF0IGluZm9ybWF0aW9uIGZvciBudWxsLWJlZm9yZS9hZnRlciBib3VuZGFyaWVzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IG5ld1N0aXRjaEZpcnN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gbmV3U3RpdGNoTGFzdERyYXdhYmxlXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBnZXROZXdJbnRlcm5hbERyYXdhYmxlQ291bnQoIG5ld1N0aXRjaEZpcnN0RHJhd2FibGUsIG5ld1N0aXRjaExhc3REcmF3YWJsZSApIHtcbiAgICBjb25zdCBmaXJzdEluY2x1ZGUgPSB0aGlzLmRyYXdhYmxlQmVmb3JlID8gdGhpcy5kcmF3YWJsZUJlZm9yZS5uZXh0RHJhd2FibGUgOiBuZXdTdGl0Y2hGaXJzdERyYXdhYmxlO1xuICAgIGNvbnN0IGxhc3RFeGNsdWRlID0gdGhpcy5kcmF3YWJsZUFmdGVyOyAvLyBudWxsIGlzIE9LIGhlcmVcblxuICAgIGxldCBjb3VudCA9IDA7XG4gICAgZm9yICggbGV0IGRyYXdhYmxlID0gZmlyc3RJbmNsdWRlOyBkcmF3YWJsZSAhPT0gbGFzdEV4Y2x1ZGU7IGRyYXdhYmxlID0gZHJhd2FibGUubmV4dERyYXdhYmxlICkge1xuICAgICAgY291bnQrKztcbiAgICB9XG5cbiAgICByZXR1cm4gY291bnQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIENoYW5nZUludGVydmFsIHRoYXQgd2lsbCBiZSBkaXNwb3NlZCBhZnRlciBzeW5jVHJlZSBpcyBjb21wbGV0ZSAoc2VlIERpc3BsYXkgcGhhc2VzKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZUJlZm9yZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZUFmdGVyXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxuICAgKlxuICAgKiBAcmV0dXJucyB7Q2hhbmdlSW50ZXJ2YWx9XG4gICAqL1xuICBzdGF0aWMgbmV3Rm9yRGlzcGxheSggZHJhd2FibGVCZWZvcmUsIGRyYXdhYmxlQWZ0ZXIsIGRpc3BsYXkgKSB7XG4gICAgY29uc3QgY2hhbmdlSW50ZXJ2YWwgPSBDaGFuZ2VJbnRlcnZhbC5jcmVhdGVGcm9tUG9vbCggZHJhd2FibGVCZWZvcmUsIGRyYXdhYmxlQWZ0ZXIgKTtcbiAgICBkaXNwbGF5Lm1hcmtDaGFuZ2VJbnRlcnZhbFRvRGlzcG9zZSggY2hhbmdlSW50ZXJ2YWwgKTtcbiAgICByZXR1cm4gY2hhbmdlSW50ZXJ2YWw7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0NoYW5nZUludGVydmFsJywgQ2hhbmdlSW50ZXJ2YWwgKTtcblxuUG9vbGFibGUubWl4SW50byggQ2hhbmdlSW50ZXJ2YWwgKTtcblxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlSW50ZXJ2YWw7Il0sIm5hbWVzIjpbIlBvb2xhYmxlIiwiRHJhd2FibGUiLCJzY2VuZXJ5IiwiQ2hhbmdlSW50ZXJ2YWwiLCJpbml0aWFsaXplIiwiZHJhd2FibGVCZWZvcmUiLCJkcmF3YWJsZUFmdGVyIiwiYXNzZXJ0IiwibmV4dENoYW5nZUludGVydmFsIiwiY29sbGFwc2VkRW1wdHkiLCJkaXNwb3NlIiwiZnJlZVRvUG9vbCIsImNvbnN0cmljdCIsImNoYW5nZWQiLCJpc0VtcHR5IiwibmV4dERyYXdhYmxlIiwib2xkTmV4dERyYXdhYmxlIiwicHJldmlvdXNEcmF3YWJsZSIsIm9sZFByZXZpb3VzRHJhd2FibGUiLCJnZXRPbGRJbnRlcm5hbERyYXdhYmxlQ291bnQiLCJvbGRTdGl0Y2hGaXJzdERyYXdhYmxlIiwib2xkU3RpdGNoTGFzdERyYXdhYmxlIiwiZmlyc3RJbmNsdWRlIiwibGFzdEV4Y2x1ZGUiLCJjb3VudCIsImRyYXdhYmxlIiwiZ2V0TmV3SW50ZXJuYWxEcmF3YWJsZUNvdW50IiwibmV3U3RpdGNoRmlyc3REcmF3YWJsZSIsIm5ld1N0aXRjaExhc3REcmF3YWJsZSIsIm5ld0ZvckRpc3BsYXkiLCJkaXNwbGF5IiwiY2hhbmdlSW50ZXJ2YWwiLCJjcmVhdGVGcm9tUG9vbCIsIm1hcmtDaGFuZ2VJbnRlcnZhbFRvRGlzcG9zZSIsImNvbnN0cnVjdG9yIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBRUQsT0FBT0EsY0FBYyxvQ0FBb0M7QUFDekQsU0FBU0MsUUFBUSxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRWxELElBQUEsQUFBTUMsaUJBQU4sTUFBTUE7SUFXSjs7Ozs7R0FLQyxHQUNEQyxXQUFZQyxjQUFjLEVBQUVDLGFBQWEsRUFBRztRQUMxQ0MsVUFBVUEsT0FBUUYsbUJBQW1CLFFBQVVBLDBCQUEwQkosVUFDdkUsNEdBQ0E7UUFDRk0sVUFBVUEsT0FBUUQsa0JBQWtCLFFBQVVBLHlCQUF5QkwsVUFDckUsMEdBQ0E7UUFFRjs7a0ZBRThFLEdBRTlFLG9EQUFvRDtRQUNwRCxJQUFJLENBQUNPLGtCQUFrQixHQUFHO1FBRTFCLCtHQUErRztRQUMvRyx5R0FBeUc7UUFDekcsSUFBSSxDQUFDSCxjQUFjLEdBQUdBO1FBRXRCLDhHQUE4RztRQUM5Ryx3R0FBd0c7UUFDeEcsSUFBSSxDQUFDQyxhQUFhLEdBQUdBO1FBRXJCLG9IQUFvSDtRQUNwSCw2R0FBNkc7UUFDN0csNEJBQTRCO1FBQzVCLElBQUksQ0FBQ0csY0FBYyxHQUFHO0lBQ3hCO0lBRUE7OztHQUdDLEdBQ0RDLFVBQVU7UUFDUix5QkFBeUI7UUFDekIsSUFBSSxDQUFDRixrQkFBa0IsR0FBRztRQUMxQixJQUFJLENBQUNILGNBQWMsR0FBRztRQUN0QixJQUFJLENBQUNDLGFBQWEsR0FBRztRQUVyQixJQUFJLENBQUNLLFVBQVU7SUFDakI7SUFFQTs7Ozs7R0FLQyxHQUNEQyxZQUFZO1FBQ1YsSUFBSUMsVUFBVTtRQUVkLElBQUssSUFBSSxDQUFDQyxPQUFPLElBQUs7WUFBRSxPQUFPO1FBQU07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