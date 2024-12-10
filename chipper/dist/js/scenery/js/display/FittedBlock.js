// Copyright 2014-2024, University of Colorado Boulder
/**
 * A Block that needs to be fitted to either the screen bounds or other local bounds. This potentially reduces memory
 * usage and can make graphical operations in the browser faster, yet if the fit is rapidly changing could cause
 * performance degradation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import { Block, scenery } from '../imports.js';
const scratchBounds2 = Bounds2.NOTHING.copy();
let FittedBlock = class FittedBlock extends Block {
    /**
   * @public
   *
   * @param {Display} display
   * @param {number} renderer
   * @param {Instance} transformRootInstance - All transforms of this instance and its ancestors will already have been
   *                                           applied. This block will only be responsible for applying transforms of
   *                                           this instance's descendants.
   * @param {FittedBlock.Fit} preferredFit
   * @returns {FittedBlock} - For chaining
   */ initialize(display, renderer, transformRootInstance, preferredFit) {
        super.initialize(display, renderer);
        // @private {Instance}
        this.transformRootInstance = transformRootInstance;
        assert && assert(typeof transformRootInstance.isDisplayRoot === 'boolean');
        // @private {boolean}
        this.canBeFullDisplay = transformRootInstance.isDisplayRoot;
        assert && assert(preferredFit === FittedBlock.FULL_DISPLAY || preferredFit === FittedBlock.COMMON_ANCESTOR);
        // @private {FittedBlock.Fit} - Our preferred fit IF we can be fitted. Our fit can fall back if something's unfittable.
        this.preferredFit = preferredFit;
        // @protected {FittedBlock.Fit} - Our current fitting method.
        this.fit = preferredFit;
        // @protected {boolean}
        this.dirtyFit = true;
        // @private {Instance|null} - filled in if COMMON_ANCESTOR
        this.commonFitInstance = null;
        // @public {Bounds2} - tracks the "tight" bounds for fitting, not the actually-displayed bounds
        this.fitBounds = Bounds2.NOTHING.copy();
        // @private {Bounds2} - copy for storage
        this.oldFitBounds = Bounds2.NOTHING.copy();
        // {number} - Number of child drawables that are marked as unfittable.
        this.unfittableDrawableCount = 0;
        // @private {function}
        this.dirtyFitListener = this.dirtyFitListener || this.markDirtyFit.bind(this);
        this.fittableListener = this.fittableListener || this.onFittabilityChange.bind(this);
        // now we always add a listener to the display size to invalidate our fit
        this.display.sizeProperty.lazyLink(this.dirtyFitListener);
        // TODO: add count of boundsless objects? https://github.com/phetsims/scenery/issues/1581
        return this;
    }
    /**
   * Changes the current fit, if it's currently different from the argument.
   * @private
   *
   * @param {FittedBlock.Fit} fit
   */ setFit(fit) {
        // We can't allow full-display fits sometimes
        if (!this.canBeFullDisplay && fit === FittedBlock.FULL_DISPLAY) {
            fit = FittedBlock.COMMON_ANCESTOR;
        }
        if (this.fit !== fit) {
            this.fit = fit;
            // updateFit() needs to be called in the repaint phase
            this.markDirtyFit();
            // Reset the oldFitBounds so that any updates that check bounds changes will update it.
            // TODO: remove duplication here with updateFit() https://github.com/phetsims/scenery/issues/1581
            this.oldFitBounds.set(Bounds2.NOTHING);
            // If we switched to the common-ancestor fit, we need to compute the common-ancestor instance.
            if (fit === FittedBlock.COMMON_ANCESTOR) {
                this.removeCommonFitInstance();
            }
        }
    }
    /**
   * @public
   */ markDirtyFit() {
        sceneryLog && sceneryLog.dirty && sceneryLog.dirty(`markDirtyFit on FittedBlock#${this.id}`);
        this.dirtyFit = true;
        // Make sure we are visited in the repaint phase
        this.markDirty();
    }
    /**
   * Should be called from update() whenever this block is dirty
   * @protected
   */ updateFit() {
        assert && assert(this.fit === FittedBlock.FULL_DISPLAY || this.fit === FittedBlock.COMMON_ANCESTOR, 'Unsupported fit');
        // check to see if we don't need to re-fit
        if (!this.dirtyFit && this.fit === FittedBlock.FULL_DISPLAY) {
            return;
        }
        sceneryLog && sceneryLog.FittedBlock && sceneryLog.FittedBlock(`updateFit #${this.id}`);
        this.dirtyFit = false;
        if (this.fit === FittedBlock.COMMON_ANCESTOR && this.commonFitInstance === null) {
            this.addCommonFitInstance(this.computeCommonAncestorInstance());
        }
        // If our fit WAS common-ancestor and our common fit instance's subtree as something unfittable, switch to
        // full-display fit.
        if (this.fit === FittedBlock.COMMON_ANCESTOR && this.commonFitInstance.fittability.subtreeUnfittableCount > 0 && this.canBeFullDisplay) {
            // Reset the oldFitBounds so that any updates that check bounds changes will update it.
            this.oldFitBounds.set(Bounds2.NOTHING);
            this.fit = FittedBlock.FULL_DISPLAY;
        }
        if (this.fit === FittedBlock.FULL_DISPLAY) {
            this.fitBounds.set(Bounds2.NOTHING);
            this.setSizeFullDisplay();
        } else if (this.fit === FittedBlock.COMMON_ANCESTOR) {
            assert && assert(this.commonFitInstance.trail.length >= this.transformRootInstance.trail.length);
            // will trigger bounds validation (for now) until we have a better way of handling this
            this.fitBounds.set(this.commonFitInstance.node.getLocalBounds());
            // walk it up, transforming so it is relative to our transform root
            let instance = this.commonFitInstance;
            while(instance !== this.transformRootInstance){
                // shouldn't infinite loop, we'll null-pointer beforehand unless something is seriously wrong
                this.fitBounds.transform(instance.node.getMatrix());
                instance = instance.parent;
            }
            this.fitBounds.roundOut();
            this.fitBounds.dilate(4); // for safety, modify in the future
            // ensure that our fitted bounds don't go outside of our display's bounds (see https://github.com/phetsims/scenery/issues/390)
            if (this.transformRootInstance.isDisplayRoot) {
                // Only apply this effect if our transform root is the display root. Otherwise we might be transformed, and
                // this could cause buggy situations. See https://github.com/phetsims/scenery/issues/454
                scratchBounds2.setMinMax(0, 0, this.display.width, this.display.height);
                this.fitBounds.constrainBounds(scratchBounds2);
            }
            if (!this.fitBounds.isValid()) {
                this.fitBounds.setMinMax(0, 0, 0, 0);
            }
            if (!this.fitBounds.equals(this.oldFitBounds)) {
                // store our copy for future checks (and do it before we modify this.fitBounds)
                this.oldFitBounds.set(this.fitBounds);
                this.setSizeFitBounds();
            }
        } else {
            throw new Error('unknown fit');
        }
    }
    /**
   * @public
   */ setSizeFullDisplay() {
    // override in subtypes, use this.display.getSize()
    }
    /**
   * @public
   */ setSizeFitBounds() {
    // override in subtypes, use this.fitBounds
    }
    /**
   * @public
   *
   * @param {Instance|null} instance
   */ addCommonFitInstance(instance) {
        assert && assert(this.commonFitInstance === null);
        if (instance) {
            this.commonFitInstance = instance;
            this.commonFitInstance.fittability.subtreeFittabilityChangeEmitter.addListener(this.dirtyFitListener);
        }
    }
    /**
   * @public
   */ removeCommonFitInstance() {
        if (this.commonFitInstance) {
            this.commonFitInstance.fittability.subtreeFittabilityChangeEmitter.removeListener(this.dirtyFitListener);
            this.commonFitInstance = null;
        }
    }
    /**
   * Releases references
   * @public
   * @override
   */ dispose() {
        sceneryLog && sceneryLog.FittedBlock && sceneryLog.FittedBlock(`dispose #${this.id}`);
        this.display.sizeProperty.unlink(this.dirtyFitListener);
        this.removeCommonFitInstance();
        // clear references
        this.transformRootInstance = null;
        super.dispose();
    }
    /**
   * Track the fittability of the added drawable.
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ addDrawable(drawable) {
        super.addDrawable(drawable);
        drawable.fittableProperty.lazyLink(this.fittableListener);
        if (!drawable.fittable) {
            this.incrementUnfittable();
        }
    }
    /**
   * Stop tracking the fittability of the removed drawable.
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ removeDrawable(drawable) {
        super.removeDrawable(drawable);
        drawable.fittableProperty.unlink(this.fittableListener);
        if (!drawable.fittable) {
            this.decrementUnfittable();
        }
    }
    /**
   * Called from the fittability listener attached to child drawables when their fittability changes.
   * @private
   *
   * @param {boolean} fittable - Whether the particular child drawable is fittable
   */ onFittabilityChange(fittable) {
        if (fittable) {
            this.decrementUnfittable();
        } else {
            this.incrementUnfittable();
        }
    }
    /**
   * The number of unfittable child drawables was increased by 1.
   * @private
   */ incrementUnfittable() {
        this.unfittableDrawableCount++;
        if (this.unfittableDrawableCount === 1) {
            this.checkFitConstraints();
        }
    }
    /**
   * The number of unfittable child drawables was decreased by 1.
   * @private
   */ decrementUnfittable() {
        this.unfittableDrawableCount--;
        if (this.unfittableDrawableCount === 0) {
            this.checkFitConstraints();
        }
    }
    /**
   * Check to make sure we are using the correct current fit.
   * @private
   */ checkFitConstraints() {
        // If we have ANY unfittable drawables, take up the full display.
        if (this.unfittableDrawableCount > 0 && this.canBeFullDisplay) {
            this.setFit(FittedBlock.FULL_DISPLAY);
        } else {
            this.setFit(this.preferredFit);
        }
    }
    /**
   * @private
   *
   * @returns {Instance}
   */ computeCommonAncestorInstance() {
        assert && assert(this.firstDrawable.instance && this.lastDrawable.instance, 'For common-ancestor fits, we need the first and last drawables to have direct instance references');
        let firstInstance = this.firstDrawable.instance;
        let lastInstance = this.lastDrawable.instance;
        // walk down the longest one until they are a common length
        const minLength = Math.min(firstInstance.trail.length, lastInstance.trail.length);
        while(firstInstance.trail.length > minLength){
            firstInstance = firstInstance.parent;
        }
        while(lastInstance.trail.length > minLength){
            lastInstance = lastInstance.parent;
        }
        // step down until they match
        while(firstInstance !== lastInstance){
            firstInstance = firstInstance.parent;
            lastInstance = lastInstance.parent;
        }
        const commonFitInstance = firstInstance;
        assert && assert(commonFitInstance.trail.length >= this.transformRootInstance.trail.length);
        return commonFitInstance;
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */ onIntervalChange(firstDrawable, lastDrawable) {
        sceneryLog && sceneryLog.FittedBlock && sceneryLog.FittedBlock(`#${this.id}.onIntervalChange ${firstDrawable.toString()} to ${lastDrawable.toString()}`);
        super.onIntervalChange(firstDrawable, lastDrawable);
        // if we use a common ancestor fit, find the common ancestor instance
        if (this.fit === FittedBlock.COMMON_ANCESTOR) {
            this.removeCommonFitInstance();
            this.markDirtyFit();
        }
    }
};
scenery.register('FittedBlock', FittedBlock);
// Defines the FittedBlock.Fit enumeration type.
FittedBlock.FULL_DISPLAY = 1;
FittedBlock.COMMON_ANCESTOR = 2;
// TODO: enumeration these? https://github.com/phetsims/scenery/issues/1581
FittedBlock.fitString = {
    1: 'fullDisplay',
    2: 'commonAncestor'
};
export default FittedBlock;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9GaXR0ZWRCbG9jay5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIEJsb2NrIHRoYXQgbmVlZHMgdG8gYmUgZml0dGVkIHRvIGVpdGhlciB0aGUgc2NyZWVuIGJvdW5kcyBvciBvdGhlciBsb2NhbCBib3VuZHMuIFRoaXMgcG90ZW50aWFsbHkgcmVkdWNlcyBtZW1vcnlcbiAqIHVzYWdlIGFuZCBjYW4gbWFrZSBncmFwaGljYWwgb3BlcmF0aW9ucyBpbiB0aGUgYnJvd3NlciBmYXN0ZXIsIHlldCBpZiB0aGUgZml0IGlzIHJhcGlkbHkgY2hhbmdpbmcgY291bGQgY2F1c2VcbiAqIHBlcmZvcm1hbmNlIGRlZ3JhZGF0aW9uLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBCbG9jaywgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBzY3JhdGNoQm91bmRzMiA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XG5cbmNsYXNzIEZpdHRlZEJsb2NrIGV4dGVuZHMgQmxvY2sge1xuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IHRyYW5zZm9ybVJvb3RJbnN0YW5jZSAtIEFsbCB0cmFuc2Zvcm1zIG9mIHRoaXMgaW5zdGFuY2UgYW5kIGl0cyBhbmNlc3RvcnMgd2lsbCBhbHJlYWR5IGhhdmUgYmVlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWVkLiBUaGlzIGJsb2NrIHdpbGwgb25seSBiZSByZXNwb25zaWJsZSBmb3IgYXBwbHlpbmcgdHJhbnNmb3JtcyBvZlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIGluc3RhbmNlJ3MgZGVzY2VuZGFudHMuXG4gICAqIEBwYXJhbSB7Rml0dGVkQmxvY2suRml0fSBwcmVmZXJyZWRGaXRcbiAgICogQHJldHVybnMge0ZpdHRlZEJsb2NrfSAtIEZvciBjaGFpbmluZ1xuICAgKi9cbiAgaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgcHJlZmVycmVkRml0ICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIGRpc3BsYXksIHJlbmRlcmVyICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7SW5zdGFuY2V9XG4gICAgdGhpcy50cmFuc2Zvcm1Sb290SW5zdGFuY2UgPSB0cmFuc2Zvcm1Sb290SW5zdGFuY2U7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdHJhbnNmb3JtUm9vdEluc3RhbmNlLmlzRGlzcGxheVJvb3QgPT09ICdib29sZWFuJyApO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59XG4gICAgdGhpcy5jYW5CZUZ1bGxEaXNwbGF5ID0gdHJhbnNmb3JtUm9vdEluc3RhbmNlLmlzRGlzcGxheVJvb3Q7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcmVmZXJyZWRGaXQgPT09IEZpdHRlZEJsb2NrLkZVTExfRElTUExBWSB8fCBwcmVmZXJyZWRGaXQgPT09IEZpdHRlZEJsb2NrLkNPTU1PTl9BTkNFU1RPUiApO1xuXG4gICAgLy8gQHByaXZhdGUge0ZpdHRlZEJsb2NrLkZpdH0gLSBPdXIgcHJlZmVycmVkIGZpdCBJRiB3ZSBjYW4gYmUgZml0dGVkLiBPdXIgZml0IGNhbiBmYWxsIGJhY2sgaWYgc29tZXRoaW5nJ3MgdW5maXR0YWJsZS5cbiAgICB0aGlzLnByZWZlcnJlZEZpdCA9IHByZWZlcnJlZEZpdDtcblxuICAgIC8vIEBwcm90ZWN0ZWQge0ZpdHRlZEJsb2NrLkZpdH0gLSBPdXIgY3VycmVudCBmaXR0aW5nIG1ldGhvZC5cbiAgICB0aGlzLmZpdCA9IHByZWZlcnJlZEZpdDtcblxuICAgIC8vIEBwcm90ZWN0ZWQge2Jvb2xlYW59XG4gICAgdGhpcy5kaXJ0eUZpdCA9IHRydWU7XG5cbiAgICAvLyBAcHJpdmF0ZSB7SW5zdGFuY2V8bnVsbH0gLSBmaWxsZWQgaW4gaWYgQ09NTU9OX0FOQ0VTVE9SXG4gICAgdGhpcy5jb21tb25GaXRJbnN0YW5jZSA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtCb3VuZHMyfSAtIHRyYWNrcyB0aGUgXCJ0aWdodFwiIGJvdW5kcyBmb3IgZml0dGluZywgbm90IHRoZSBhY3R1YWxseS1kaXNwbGF5ZWQgYm91bmRzXG4gICAgdGhpcy5maXRCb3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xuXG4gICAgLy8gQHByaXZhdGUge0JvdW5kczJ9IC0gY29weSBmb3Igc3RvcmFnZVxuICAgIHRoaXMub2xkRml0Qm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcblxuICAgIC8vIHtudW1iZXJ9IC0gTnVtYmVyIG9mIGNoaWxkIGRyYXdhYmxlcyB0aGF0IGFyZSBtYXJrZWQgYXMgdW5maXR0YWJsZS5cbiAgICB0aGlzLnVuZml0dGFibGVEcmF3YWJsZUNvdW50ID0gMDtcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cbiAgICB0aGlzLmRpcnR5Rml0TGlzdGVuZXIgPSB0aGlzLmRpcnR5Rml0TGlzdGVuZXIgfHwgdGhpcy5tYXJrRGlydHlGaXQuYmluZCggdGhpcyApO1xuICAgIHRoaXMuZml0dGFibGVMaXN0ZW5lciA9IHRoaXMuZml0dGFibGVMaXN0ZW5lciB8fCB0aGlzLm9uRml0dGFiaWxpdHlDaGFuZ2UuYmluZCggdGhpcyApO1xuXG4gICAgLy8gbm93IHdlIGFsd2F5cyBhZGQgYSBsaXN0ZW5lciB0byB0aGUgZGlzcGxheSBzaXplIHRvIGludmFsaWRhdGUgb3VyIGZpdFxuICAgIHRoaXMuZGlzcGxheS5zaXplUHJvcGVydHkubGF6eUxpbmsoIHRoaXMuZGlydHlGaXRMaXN0ZW5lciApO1xuXG4gICAgLy8gVE9ETzogYWRkIGNvdW50IG9mIGJvdW5kc2xlc3Mgb2JqZWN0cz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IGZpdCwgaWYgaXQncyBjdXJyZW50bHkgZGlmZmVyZW50IGZyb20gdGhlIGFyZ3VtZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0ZpdHRlZEJsb2NrLkZpdH0gZml0XG4gICAqL1xuICBzZXRGaXQoIGZpdCApIHtcbiAgICAvLyBXZSBjYW4ndCBhbGxvdyBmdWxsLWRpc3BsYXkgZml0cyBzb21ldGltZXNcbiAgICBpZiAoICF0aGlzLmNhbkJlRnVsbERpc3BsYXkgJiYgZml0ID09PSBGaXR0ZWRCbG9jay5GVUxMX0RJU1BMQVkgKSB7XG4gICAgICBmaXQgPSBGaXR0ZWRCbG9jay5DT01NT05fQU5DRVNUT1I7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLmZpdCAhPT0gZml0ICkge1xuICAgICAgdGhpcy5maXQgPSBmaXQ7XG5cbiAgICAgIC8vIHVwZGF0ZUZpdCgpIG5lZWRzIHRvIGJlIGNhbGxlZCBpbiB0aGUgcmVwYWludCBwaGFzZVxuICAgICAgdGhpcy5tYXJrRGlydHlGaXQoKTtcblxuICAgICAgLy8gUmVzZXQgdGhlIG9sZEZpdEJvdW5kcyBzbyB0aGF0IGFueSB1cGRhdGVzIHRoYXQgY2hlY2sgYm91bmRzIGNoYW5nZXMgd2lsbCB1cGRhdGUgaXQuXG4gICAgICAvLyBUT0RPOiByZW1vdmUgZHVwbGljYXRpb24gaGVyZSB3aXRoIHVwZGF0ZUZpdCgpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICB0aGlzLm9sZEZpdEJvdW5kcy5zZXQoIEJvdW5kczIuTk9USElORyApO1xuXG4gICAgICAvLyBJZiB3ZSBzd2l0Y2hlZCB0byB0aGUgY29tbW9uLWFuY2VzdG9yIGZpdCwgd2UgbmVlZCB0byBjb21wdXRlIHRoZSBjb21tb24tYW5jZXN0b3IgaW5zdGFuY2UuXG4gICAgICBpZiAoIGZpdCA9PT0gRml0dGVkQmxvY2suQ09NTU9OX0FOQ0VTVE9SICkge1xuICAgICAgICB0aGlzLnJlbW92ZUNvbW1vbkZpdEluc3RhbmNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIG1hcmtEaXJ0eUZpdCgpIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuZGlydHkgJiYgc2NlbmVyeUxvZy5kaXJ0eSggYG1hcmtEaXJ0eUZpdCBvbiBGaXR0ZWRCbG9jayMke3RoaXMuaWR9YCApO1xuICAgIHRoaXMuZGlydHlGaXQgPSB0cnVlO1xuXG4gICAgLy8gTWFrZSBzdXJlIHdlIGFyZSB2aXNpdGVkIGluIHRoZSByZXBhaW50IHBoYXNlXG4gICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG91bGQgYmUgY2FsbGVkIGZyb20gdXBkYXRlKCkgd2hlbmV2ZXIgdGhpcyBibG9jayBpcyBkaXJ0eVxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICB1cGRhdGVGaXQoKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5maXQgPT09IEZpdHRlZEJsb2NrLkZVTExfRElTUExBWSB8fCB0aGlzLmZpdCA9PT0gRml0dGVkQmxvY2suQ09NTU9OX0FOQ0VTVE9SLFxuICAgICAgJ1Vuc3VwcG9ydGVkIGZpdCcgKTtcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBkb24ndCBuZWVkIHRvIHJlLWZpdFxuICAgIGlmICggIXRoaXMuZGlydHlGaXQgJiYgdGhpcy5maXQgPT09IEZpdHRlZEJsb2NrLkZVTExfRElTUExBWSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRml0dGVkQmxvY2sgJiYgc2NlbmVyeUxvZy5GaXR0ZWRCbG9jayggYHVwZGF0ZUZpdCAjJHt0aGlzLmlkfWAgKTtcblxuICAgIHRoaXMuZGlydHlGaXQgPSBmYWxzZTtcblxuICAgIGlmICggdGhpcy5maXQgPT09IEZpdHRlZEJsb2NrLkNPTU1PTl9BTkNFU1RPUiAmJiB0aGlzLmNvbW1vbkZpdEluc3RhbmNlID09PSBudWxsICkge1xuICAgICAgdGhpcy5hZGRDb21tb25GaXRJbnN0YW5jZSggdGhpcy5jb21wdXRlQ29tbW9uQW5jZXN0b3JJbnN0YW5jZSgpICk7XG4gICAgfVxuXG4gICAgLy8gSWYgb3VyIGZpdCBXQVMgY29tbW9uLWFuY2VzdG9yIGFuZCBvdXIgY29tbW9uIGZpdCBpbnN0YW5jZSdzIHN1YnRyZWUgYXMgc29tZXRoaW5nIHVuZml0dGFibGUsIHN3aXRjaCB0b1xuICAgIC8vIGZ1bGwtZGlzcGxheSBmaXQuXG4gICAgaWYgKCB0aGlzLmZpdCA9PT0gRml0dGVkQmxvY2suQ09NTU9OX0FOQ0VTVE9SICYmXG4gICAgICAgICB0aGlzLmNvbW1vbkZpdEluc3RhbmNlLmZpdHRhYmlsaXR5LnN1YnRyZWVVbmZpdHRhYmxlQ291bnQgPiAwICYmXG4gICAgICAgICB0aGlzLmNhbkJlRnVsbERpc3BsYXkgKSB7XG4gICAgICAvLyBSZXNldCB0aGUgb2xkRml0Qm91bmRzIHNvIHRoYXQgYW55IHVwZGF0ZXMgdGhhdCBjaGVjayBib3VuZHMgY2hhbmdlcyB3aWxsIHVwZGF0ZSBpdC5cbiAgICAgIHRoaXMub2xkRml0Qm91bmRzLnNldCggQm91bmRzMi5OT1RISU5HICk7XG5cbiAgICAgIHRoaXMuZml0ID0gRml0dGVkQmxvY2suRlVMTF9ESVNQTEFZO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5maXQgPT09IEZpdHRlZEJsb2NrLkZVTExfRElTUExBWSApIHtcbiAgICAgIHRoaXMuZml0Qm91bmRzLnNldCggQm91bmRzMi5OT1RISU5HICk7XG5cbiAgICAgIHRoaXMuc2V0U2l6ZUZ1bGxEaXNwbGF5KCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLmZpdCA9PT0gRml0dGVkQmxvY2suQ09NTU9OX0FOQ0VTVE9SICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jb21tb25GaXRJbnN0YW5jZS50cmFpbC5sZW5ndGggPj0gdGhpcy50cmFuc2Zvcm1Sb290SW5zdGFuY2UudHJhaWwubGVuZ3RoICk7XG5cbiAgICAgIC8vIHdpbGwgdHJpZ2dlciBib3VuZHMgdmFsaWRhdGlvbiAoZm9yIG5vdykgdW50aWwgd2UgaGF2ZSBhIGJldHRlciB3YXkgb2YgaGFuZGxpbmcgdGhpc1xuICAgICAgdGhpcy5maXRCb3VuZHMuc2V0KCB0aGlzLmNvbW1vbkZpdEluc3RhbmNlLm5vZGUuZ2V0TG9jYWxCb3VuZHMoKSApO1xuXG4gICAgICAvLyB3YWxrIGl0IHVwLCB0cmFuc2Zvcm1pbmcgc28gaXQgaXMgcmVsYXRpdmUgdG8gb3VyIHRyYW5zZm9ybSByb290XG4gICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzLmNvbW1vbkZpdEluc3RhbmNlO1xuICAgICAgd2hpbGUgKCBpbnN0YW5jZSAhPT0gdGhpcy50cmFuc2Zvcm1Sb290SW5zdGFuY2UgKSB7XG4gICAgICAgIC8vIHNob3VsZG4ndCBpbmZpbml0ZSBsb29wLCB3ZSdsbCBudWxsLXBvaW50ZXIgYmVmb3JlaGFuZCB1bmxlc3Mgc29tZXRoaW5nIGlzIHNlcmlvdXNseSB3cm9uZ1xuICAgICAgICB0aGlzLmZpdEJvdW5kcy50cmFuc2Zvcm0oIGluc3RhbmNlLm5vZGUuZ2V0TWF0cml4KCkgKTtcbiAgICAgICAgaW5zdGFuY2UgPSBpbnN0YW5jZS5wYXJlbnQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZml0Qm91bmRzLnJvdW5kT3V0KCk7XG4gICAgICB0aGlzLmZpdEJvdW5kcy5kaWxhdGUoIDQgKTsgLy8gZm9yIHNhZmV0eSwgbW9kaWZ5IGluIHRoZSBmdXR1cmVcblxuICAgICAgLy8gZW5zdXJlIHRoYXQgb3VyIGZpdHRlZCBib3VuZHMgZG9uJ3QgZ28gb3V0c2lkZSBvZiBvdXIgZGlzcGxheSdzIGJvdW5kcyAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8zOTApXG4gICAgICBpZiAoIHRoaXMudHJhbnNmb3JtUm9vdEluc3RhbmNlLmlzRGlzcGxheVJvb3QgKSB7XG4gICAgICAgIC8vIE9ubHkgYXBwbHkgdGhpcyBlZmZlY3QgaWYgb3VyIHRyYW5zZm9ybSByb290IGlzIHRoZSBkaXNwbGF5IHJvb3QuIE90aGVyd2lzZSB3ZSBtaWdodCBiZSB0cmFuc2Zvcm1lZCwgYW5kXG4gICAgICAgIC8vIHRoaXMgY291bGQgY2F1c2UgYnVnZ3kgc2l0dWF0aW9ucy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy80NTRcbiAgICAgICAgc2NyYXRjaEJvdW5kczIuc2V0TWluTWF4KCAwLCAwLCB0aGlzLmRpc3BsYXkud2lkdGgsIHRoaXMuZGlzcGxheS5oZWlnaHQgKTtcbiAgICAgICAgdGhpcy5maXRCb3VuZHMuY29uc3RyYWluQm91bmRzKCBzY3JhdGNoQm91bmRzMiApO1xuICAgICAgfVxuXG4gICAgICBpZiAoICF0aGlzLmZpdEJvdW5kcy5pc1ZhbGlkKCkgKSB7XG4gICAgICAgIHRoaXMuZml0Qm91bmRzLnNldE1pbk1heCggMCwgMCwgMCwgMCApO1xuICAgICAgfVxuXG4gICAgICBpZiAoICF0aGlzLmZpdEJvdW5kcy5lcXVhbHMoIHRoaXMub2xkRml0Qm91bmRzICkgKSB7XG4gICAgICAgIC8vIHN0b3JlIG91ciBjb3B5IGZvciBmdXR1cmUgY2hlY2tzIChhbmQgZG8gaXQgYmVmb3JlIHdlIG1vZGlmeSB0aGlzLmZpdEJvdW5kcylcbiAgICAgICAgdGhpcy5vbGRGaXRCb3VuZHMuc2V0KCB0aGlzLmZpdEJvdW5kcyApO1xuXG4gICAgICAgIHRoaXMuc2V0U2l6ZUZpdEJvdW5kcygpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ3Vua25vd24gZml0JyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBzZXRTaXplRnVsbERpc3BsYXkoKSB7XG4gICAgLy8gb3ZlcnJpZGUgaW4gc3VidHlwZXMsIHVzZSB0aGlzLmRpc3BsYXkuZ2V0U2l6ZSgpXG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc2V0U2l6ZUZpdEJvdW5kcygpIHtcbiAgICAvLyBvdmVycmlkZSBpbiBzdWJ0eXBlcywgdXNlIHRoaXMuZml0Qm91bmRzXG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0luc3RhbmNlfG51bGx9IGluc3RhbmNlXG4gICAqL1xuICBhZGRDb21tb25GaXRJbnN0YW5jZSggaW5zdGFuY2UgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jb21tb25GaXRJbnN0YW5jZSA9PT0gbnVsbCApO1xuXG4gICAgaWYgKCBpbnN0YW5jZSApIHtcbiAgICAgIHRoaXMuY29tbW9uRml0SW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICAgIHRoaXMuY29tbW9uRml0SW5zdGFuY2UuZml0dGFiaWxpdHkuc3VidHJlZUZpdHRhYmlsaXR5Q2hhbmdlRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5kaXJ0eUZpdExpc3RlbmVyICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHJlbW92ZUNvbW1vbkZpdEluc3RhbmNlKCkge1xuICAgIGlmICggdGhpcy5jb21tb25GaXRJbnN0YW5jZSApIHtcbiAgICAgIHRoaXMuY29tbW9uRml0SW5zdGFuY2UuZml0dGFiaWxpdHkuc3VidHJlZUZpdHRhYmlsaXR5Q2hhbmdlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5kaXJ0eUZpdExpc3RlbmVyICk7XG4gICAgICB0aGlzLmNvbW1vbkZpdEluc3RhbmNlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRml0dGVkQmxvY2sgJiYgc2NlbmVyeUxvZy5GaXR0ZWRCbG9jayggYGRpc3Bvc2UgIyR7dGhpcy5pZH1gICk7XG5cbiAgICB0aGlzLmRpc3BsYXkuc2l6ZVByb3BlcnR5LnVubGluayggdGhpcy5kaXJ0eUZpdExpc3RlbmVyICk7XG5cbiAgICB0aGlzLnJlbW92ZUNvbW1vbkZpdEluc3RhbmNlKCk7XG5cbiAgICAvLyBjbGVhciByZWZlcmVuY2VzXG4gICAgdGhpcy50cmFuc2Zvcm1Sb290SW5zdGFuY2UgPSBudWxsO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYWNrIHRoZSBmaXR0YWJpbGl0eSBvZiB0aGUgYWRkZWQgZHJhd2FibGUuXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqL1xuICBhZGREcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgc3VwZXIuYWRkRHJhd2FibGUoIGRyYXdhYmxlICk7XG5cbiAgICBkcmF3YWJsZS5maXR0YWJsZVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLmZpdHRhYmxlTGlzdGVuZXIgKTtcblxuICAgIGlmICggIWRyYXdhYmxlLmZpdHRhYmxlICkge1xuICAgICAgdGhpcy5pbmNyZW1lbnRVbmZpdHRhYmxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdHJhY2tpbmcgdGhlIGZpdHRhYmlsaXR5IG9mIHRoZSByZW1vdmVkIGRyYXdhYmxlLlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgcmVtb3ZlRHJhd2FibGUoIGRyYXdhYmxlICkge1xuICAgIHN1cGVyLnJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApO1xuXG4gICAgZHJhd2FibGUuZml0dGFibGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMuZml0dGFibGVMaXN0ZW5lciApO1xuXG4gICAgaWYgKCAhZHJhd2FibGUuZml0dGFibGUgKSB7XG4gICAgICB0aGlzLmRlY3JlbWVudFVuZml0dGFibGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZyb20gdGhlIGZpdHRhYmlsaXR5IGxpc3RlbmVyIGF0dGFjaGVkIHRvIGNoaWxkIGRyYXdhYmxlcyB3aGVuIHRoZWlyIGZpdHRhYmlsaXR5IGNoYW5nZXMuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZml0dGFibGUgLSBXaGV0aGVyIHRoZSBwYXJ0aWN1bGFyIGNoaWxkIGRyYXdhYmxlIGlzIGZpdHRhYmxlXG4gICAqL1xuICBvbkZpdHRhYmlsaXR5Q2hhbmdlKCBmaXR0YWJsZSApIHtcbiAgICBpZiAoIGZpdHRhYmxlICkge1xuICAgICAgdGhpcy5kZWNyZW1lbnRVbmZpdHRhYmxlKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5pbmNyZW1lbnRVbmZpdHRhYmxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgdW5maXR0YWJsZSBjaGlsZCBkcmF3YWJsZXMgd2FzIGluY3JlYXNlZCBieSAxLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5jcmVtZW50VW5maXR0YWJsZSgpIHtcbiAgICB0aGlzLnVuZml0dGFibGVEcmF3YWJsZUNvdW50Kys7XG5cbiAgICBpZiAoIHRoaXMudW5maXR0YWJsZURyYXdhYmxlQ291bnQgPT09IDEgKSB7XG4gICAgICB0aGlzLmNoZWNrRml0Q29uc3RyYWludHMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiB1bmZpdHRhYmxlIGNoaWxkIGRyYXdhYmxlcyB3YXMgZGVjcmVhc2VkIGJ5IDEuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNyZW1lbnRVbmZpdHRhYmxlKCkge1xuICAgIHRoaXMudW5maXR0YWJsZURyYXdhYmxlQ291bnQtLTtcblxuICAgIGlmICggdGhpcy51bmZpdHRhYmxlRHJhd2FibGVDb3VudCA9PT0gMCApIHtcbiAgICAgIHRoaXMuY2hlY2tGaXRDb25zdHJhaW50cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB0byBtYWtlIHN1cmUgd2UgYXJlIHVzaW5nIHRoZSBjb3JyZWN0IGN1cnJlbnQgZml0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tGaXRDb25zdHJhaW50cygpIHtcbiAgICAvLyBJZiB3ZSBoYXZlIEFOWSB1bmZpdHRhYmxlIGRyYXdhYmxlcywgdGFrZSB1cCB0aGUgZnVsbCBkaXNwbGF5LlxuICAgIGlmICggdGhpcy51bmZpdHRhYmxlRHJhd2FibGVDb3VudCA+IDAgJiYgdGhpcy5jYW5CZUZ1bGxEaXNwbGF5ICkge1xuICAgICAgdGhpcy5zZXRGaXQoIEZpdHRlZEJsb2NrLkZVTExfRElTUExBWSApO1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2UgZmFsbCBiYWNrIHRvIG91ciBcImRlZmF1bHRcIlxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zZXRGaXQoIHRoaXMucHJlZmVycmVkRml0ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEByZXR1cm5zIHtJbnN0YW5jZX1cbiAgICovXG4gIGNvbXB1dGVDb21tb25BbmNlc3Rvckluc3RhbmNlKCkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZmlyc3REcmF3YWJsZS5pbnN0YW5jZSAmJiB0aGlzLmxhc3REcmF3YWJsZS5pbnN0YW5jZSxcbiAgICAgICdGb3IgY29tbW9uLWFuY2VzdG9yIGZpdHMsIHdlIG5lZWQgdGhlIGZpcnN0IGFuZCBsYXN0IGRyYXdhYmxlcyB0byBoYXZlIGRpcmVjdCBpbnN0YW5jZSByZWZlcmVuY2VzJyApO1xuXG4gICAgbGV0IGZpcnN0SW5zdGFuY2UgPSB0aGlzLmZpcnN0RHJhd2FibGUuaW5zdGFuY2U7XG4gICAgbGV0IGxhc3RJbnN0YW5jZSA9IHRoaXMubGFzdERyYXdhYmxlLmluc3RhbmNlO1xuXG4gICAgLy8gd2FsayBkb3duIHRoZSBsb25nZXN0IG9uZSB1bnRpbCB0aGV5IGFyZSBhIGNvbW1vbiBsZW5ndGhcbiAgICBjb25zdCBtaW5MZW5ndGggPSBNYXRoLm1pbiggZmlyc3RJbnN0YW5jZS50cmFpbC5sZW5ndGgsIGxhc3RJbnN0YW5jZS50cmFpbC5sZW5ndGggKTtcbiAgICB3aGlsZSAoIGZpcnN0SW5zdGFuY2UudHJhaWwubGVuZ3RoID4gbWluTGVuZ3RoICkge1xuICAgICAgZmlyc3RJbnN0YW5jZSA9IGZpcnN0SW5zdGFuY2UucGFyZW50O1xuICAgIH1cbiAgICB3aGlsZSAoIGxhc3RJbnN0YW5jZS50cmFpbC5sZW5ndGggPiBtaW5MZW5ndGggKSB7XG4gICAgICBsYXN0SW5zdGFuY2UgPSBsYXN0SW5zdGFuY2UucGFyZW50O1xuICAgIH1cblxuICAgIC8vIHN0ZXAgZG93biB1bnRpbCB0aGV5IG1hdGNoXG4gICAgd2hpbGUgKCBmaXJzdEluc3RhbmNlICE9PSBsYXN0SW5zdGFuY2UgKSB7XG4gICAgICBmaXJzdEluc3RhbmNlID0gZmlyc3RJbnN0YW5jZS5wYXJlbnQ7XG4gICAgICBsYXN0SW5zdGFuY2UgPSBsYXN0SW5zdGFuY2UucGFyZW50O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbW1vbkZpdEluc3RhbmNlID0gZmlyc3RJbnN0YW5jZTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbW1vbkZpdEluc3RhbmNlLnRyYWlsLmxlbmd0aCA+PSB0aGlzLnRyYW5zZm9ybVJvb3RJbnN0YW5jZS50cmFpbC5sZW5ndGggKTtcblxuICAgIHJldHVybiBjb21tb25GaXRJbnN0YW5jZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBmaXJzdERyYXdhYmxlXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGxhc3REcmF3YWJsZVxuICAgKi9cbiAgb25JbnRlcnZhbENoYW5nZSggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5GaXR0ZWRCbG9jayAmJiBzY2VuZXJ5TG9nLkZpdHRlZEJsb2NrKCBgIyR7dGhpcy5pZH0ub25JbnRlcnZhbENoYW5nZSAke2ZpcnN0RHJhd2FibGUudG9TdHJpbmcoKX0gdG8gJHtsYXN0RHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG5cbiAgICBzdXBlci5vbkludGVydmFsQ2hhbmdlKCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKTtcblxuICAgIC8vIGlmIHdlIHVzZSBhIGNvbW1vbiBhbmNlc3RvciBmaXQsIGZpbmQgdGhlIGNvbW1vbiBhbmNlc3RvciBpbnN0YW5jZVxuICAgIGlmICggdGhpcy5maXQgPT09IEZpdHRlZEJsb2NrLkNPTU1PTl9BTkNFU1RPUiApIHtcbiAgICAgIHRoaXMucmVtb3ZlQ29tbW9uRml0SW5zdGFuY2UoKTtcbiAgICAgIHRoaXMubWFya0RpcnR5Rml0KCk7XG4gICAgfVxuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdGaXR0ZWRCbG9jaycsIEZpdHRlZEJsb2NrICk7XG5cbi8vIERlZmluZXMgdGhlIEZpdHRlZEJsb2NrLkZpdCBlbnVtZXJhdGlvbiB0eXBlLlxuRml0dGVkQmxvY2suRlVMTF9ESVNQTEFZID0gMTtcbkZpdHRlZEJsb2NrLkNPTU1PTl9BTkNFU1RPUiA9IDI7XG5cbi8vIFRPRE86IGVudW1lcmF0aW9uIHRoZXNlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuRml0dGVkQmxvY2suZml0U3RyaW5nID0ge1xuICAxOiAnZnVsbERpc3BsYXknLFxuICAyOiAnY29tbW9uQW5jZXN0b3InXG59O1xuXG5leHBvcnQgZGVmYXVsdCBGaXR0ZWRCbG9jazsiXSwibmFtZXMiOlsiQm91bmRzMiIsIkJsb2NrIiwic2NlbmVyeSIsInNjcmF0Y2hCb3VuZHMyIiwiTk9USElORyIsImNvcHkiLCJGaXR0ZWRCbG9jayIsImluaXRpYWxpemUiLCJkaXNwbGF5IiwicmVuZGVyZXIiLCJ0cmFuc2Zvcm1Sb290SW5zdGFuY2UiLCJwcmVmZXJyZWRGaXQiLCJhc3NlcnQiLCJpc0Rpc3BsYXlSb290IiwiY2FuQmVGdWxsRGlzcGxheSIsIkZVTExfRElTUExBWSIsIkNPTU1PTl9BTkNFU1RPUiIsImZpdCIsImRpcnR5Rml0IiwiY29tbW9uRml0SW5zdGFuY2UiLCJmaXRCb3VuZHMiLCJvbGRGaXRCb3VuZHMiLCJ1bmZpdHRhYmxlRHJhd2FibGVDb3VudCIsImRpcnR5Rml0TGlzdGVuZXIiLCJtYXJrRGlydHlGaXQiLCJiaW5kIiwiZml0dGFibGVMaXN0ZW5lciIsIm9uRml0dGFiaWxpdHlDaGFuZ2UiLCJzaXplUHJvcGVydHkiLCJsYXp5TGluayIsInNldEZpdCIsInNldCIsInJlbW92ZUNvbW1vbkZpdEluc3RhbmNlIiwic2NlbmVyeUxvZyIsImRpcnR5IiwiaWQiLCJtYXJrRGlydHkiLCJ1cGRhdGVGaXQiLCJhZGRDb21tb25GaXRJbnN0YW5jZSIsImNvbXB1dGVDb21tb25BbmNlc3Rvckluc3RhbmNlIiwiZml0dGFiaWxpdHkiLCJzdWJ0cmVlVW5maXR0YWJsZUNvdW50Iiwic2V0U2l6ZUZ1bGxEaXNwbGF5IiwidHJhaWwiLCJsZW5ndGgiLCJub2RlIiwiZ2V0TG9jYWxCb3VuZHMiLCJpbnN0YW5jZSIsInRyYW5zZm9ybSIsImdldE1hdHJpeCIsInBhcmVudCIsInJvdW5kT3V0IiwiZGlsYXRlIiwic2V0TWluTWF4Iiwid2lkdGgiLCJoZWlnaHQiLCJjb25zdHJhaW5Cb3VuZHMiLCJpc1ZhbGlkIiwiZXF1YWxzIiwic2V0U2l6ZUZpdEJvdW5kcyIsIkVycm9yIiwic3VidHJlZUZpdHRhYmlsaXR5Q2hhbmdlRW1pdHRlciIsImFkZExpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJkaXNwb3NlIiwidW5saW5rIiwiYWRkRHJhd2FibGUiLCJkcmF3YWJsZSIsImZpdHRhYmxlUHJvcGVydHkiLCJmaXR0YWJsZSIsImluY3JlbWVudFVuZml0dGFibGUiLCJyZW1vdmVEcmF3YWJsZSIsImRlY3JlbWVudFVuZml0dGFibGUiLCJjaGVja0ZpdENvbnN0cmFpbnRzIiwiZmlyc3REcmF3YWJsZSIsImxhc3REcmF3YWJsZSIsImZpcnN0SW5zdGFuY2UiLCJsYXN0SW5zdGFuY2UiLCJtaW5MZW5ndGgiLCJNYXRoIiwibWluIiwib25JbnRlcnZhbENoYW5nZSIsInRvU3RyaW5nIiwicmVnaXN0ZXIiLCJmaXRTdHJpbmciXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxhQUFhLDZCQUE2QjtBQUNqRCxTQUFTQyxLQUFLLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFL0MsTUFBTUMsaUJBQWlCSCxRQUFRSSxPQUFPLENBQUNDLElBQUk7QUFFM0MsSUFBQSxBQUFNQyxjQUFOLE1BQU1BLG9CQUFvQkw7SUFDeEI7Ozs7Ozs7Ozs7R0FVQyxHQUNETSxXQUFZQyxPQUFPLEVBQUVDLFFBQVEsRUFBRUMscUJBQXFCLEVBQUVDLFlBQVksRUFBRztRQUNuRSxLQUFLLENBQUNKLFdBQVlDLFNBQVNDO1FBRTNCLHNCQUFzQjtRQUN0QixJQUFJLENBQUNDLHFCQUFxQixHQUFHQTtRQUU3QkUsVUFBVUEsT0FBUSxPQUFPRixzQkFBc0JHLGFBQWEsS0FBSztRQUVqRSxxQkFBcUI7UUFDckIsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBR0osc0JBQXNCRyxhQUFhO1FBRTNERCxVQUFVQSxPQUFRRCxpQkFBaUJMLFlBQVlTLFlBQVksSUFBSUosaUJBQWlC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