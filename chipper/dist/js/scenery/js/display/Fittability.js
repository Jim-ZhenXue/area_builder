// Copyright 2015-2024, University of Colorado Boulder
/**
 * A sub-component of an Instance that handles matters relating to whether fitted blocks should not fit if possible.
 * We mostly mark our own drawables as fittable, and track whether our subtree is all fittable (so that common-ancestor
 * fits can determine if their bounds will change).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import { scenery } from '../imports.js';
let Fittability = class Fittability {
    /**
   * Responsible for initialization and cleaning of this. If the parameters are both null, we'll want to clean our
   * external references (like Instance does).
   * @public
   *
   * @param {Display|null} display
   * @param {Trail|null} trail
   * @returns {Fittability} - Returns this, to allow chaining.
   */ initialize(display, trail) {
        this.display = display; // @private {Display}
        this.trail = trail; // @private {Trail}
        this.node = trail && trail.lastNode(); // @private {Node}
        // @public {boolean} - When our instance's node has a particular combination of features and/or flags (like
        // preventDefault:true) that should make any FittedBlock containing drawables under that node OR that would
        // include the bounds of the node in its FittedBlock to not compute the relevant fit (e.g. have it take up the
        // full display instead).
        this.selfFittable = !!trail && this.isSelfFitSupported();
        // @public {boolean} - Whether this instance AND all of its ancestor instances (down to the root instance for the
        // display) all are self-fittable.
        this.ancestorsFittable = this.selfFittable;
        // @public {number} - The number of children whose subtrees have an unfittable instance, plus 1 if this instance
        // itself is unfittable. Using a number allows us to quickly increment/decrement when a particular child changes
        // its fittability (so we don't have to check other subtrees or traverse further up the tree). For a more
        // complete description of this technique, see RendererSummary.
        // This is important, since if it's 0, it indicates that this entire subtree has NO unfittable content. Thus if
        // a FittedBlock's common ancestor (for the common-ancestor fit) is this instance, we shouldn't have issues
        // updating our bounds.
        this.subtreeUnfittableCount = this.selfFittable ? 0 : 1;
        // @public {TinyEmitter} - Called with no arguments when the subtree fittability changes (whether
        // subtreeUnfittableCount is greater than zero or not).
        this.subtreeFittabilityChangeEmitter = this.subtreeFittabilityChangeEmitter || new TinyEmitter();
        return this; // allow chaining
    }
    /**
   * Easy access to our parent Instance's Fittability, if it exists.
   * @private
   *
   * @returns {Fittability|null}
   */ get parent() {
        return this.instance.parent ? this.instance.parent.fittability : null;
    }
    /**
   * Called when the instance is updating its rendering state (as any fittability changes to existing instances will
   * trigger an update there).
   * @public
   */ checkSelfFittability() {
        const newSelfFittable = this.isSelfFitSupported();
        if (this.selfFittable !== newSelfFittable) {
            this.updateSelfFittable();
        }
    }
    /**
   * Whether our node's performance flags allows the subtree to be fitted.
   * @private
   *
   * Any updates to flags (for instance, a 'dynamic' flag perhaps?) should be added here.
   *
   * @returns {boolean}
   */ isSelfFitSupported() {
        return this.display._allowLayerFitting && !this.node.isPreventFit();
    }
    /**
   * Called when our parent just became fittable. Responsible for flagging subtrees with the ancestorsFittable flag,
   * up to the point where they are fittable.
   * @private
   */ markSubtreeFittable() {
        // Bail if we can't be fittable ourselves
        if (!this.selfFittable) {
            return;
        }
        this.ancestorsFittable = true;
        const children = this.instance.children;
        for(let i = 0; i < children.length; i++){
            children[i].fittability.markSubtreeFittable();
        }
        // Update the Instance's drawables, so that their blocks can potentially now be fitted.
        this.instance.updateDrawableFittability(true);
    }
    /**
   * Called when our parent just became unfittable and we are fittable. Responsible for flagging subtrees with
   * the !ancestorsFittable flag, up to the point where they are unfittable.
   * @private
   */ markSubtreeUnfittable() {
        // Bail if we are already unfittable
        if (!this.ancestorsFittable) {
            return;
        }
        this.ancestorsFittable = false;
        const children = this.instance.children;
        for(let i = 0; i < children.length; i++){
            children[i].fittability.markSubtreeUnfittable();
        }
        // Update the Instance's drawables, so that their blocks can potentially now be prevented from being fitted.
        this.instance.updateDrawableFittability(false);
    }
    /**
   * Called when our Node's self fit-ability has changed.
   * @private
   */ updateSelfFittable() {
        const newSelfFittable = this.isSelfFitSupported();
        assert && assert(this.selfFittable !== newSelfFittable);
        this.selfFittable = newSelfFittable;
        if (this.selfFittable && (!this.parent || this.parent.ancestorsFittable)) {
            this.markSubtreeFittable();
        } else if (!this.selfFittable) {
            this.markSubtreeUnfittable();
        }
        if (this.selfFittable) {
            this.decrementSubtreeUnfittableCount();
        } else {
            this.incrementSubtreeUnfittableCount();
        }
    }
    /**
   * A child instance's subtree became unfittable, OR our 'self' became unfittable. This is responsible for updating
   * the subtreeFittableCount for this instance AND up to all ancestors that would be affected by the change.
   * @private
   */ incrementSubtreeUnfittableCount() {
        this.subtreeUnfittableCount++;
        // If now something in our subtree can't be fitted, we need to notify our parent
        if (this.subtreeUnfittableCount === 1) {
            this.parent && this.parent.incrementSubtreeUnfittableCount();
            // Notify anything listening that the condition ( this.subtreeUnfittableCount > 0 ) changed.
            this.subtreeFittabilityChangeEmitter.emit();
        }
    }
    /**
   * A child instance's subtree became fittable, OR our 'self' became fittable. This is responsible for updating
   * the subtreeFittableCount for this instance AND up to all ancestors that would be affected by the change.
   * @private
   */ decrementSubtreeUnfittableCount() {
        this.subtreeUnfittableCount--;
        // If now our subtree can all be fitted, we need to notify our parent
        if (this.subtreeUnfittableCount === 0) {
            this.parent && this.parent.decrementSubtreeUnfittableCount();
            // Notify anything listening that the condition ( this.subtreeUnfittableCount > 0 ) changed.
            this.subtreeFittabilityChangeEmitter.emit();
        }
    }
    /**
   * Called when an instance is added as a child to our instance. Updates necessary counts.
   * @public
   *
   * @param {Fittability} childFittability - The Fittability of the new child instance.
   */ onInsert(childFittability) {
        if (!this.ancestorsFittable) {
            childFittability.markSubtreeUnfittable();
        }
        if (childFittability.subtreeUnfittableCount > 0) {
            this.incrementSubtreeUnfittableCount();
        }
    }
    /**
   * Called when a child instance is removed from our instance. Updates necessary counts.
   * @public
   *
   * @param {Fittability} childFittability - The Fittability of the old child instance.
   */ onRemove(childFittability) {
        if (!this.ancestorsFittable) {
            childFittability.markSubtreeFittable();
        }
        if (childFittability.subtreeUnfittableCount > 0) {
            this.decrementSubtreeUnfittableCount();
        }
    }
    /**
   * Sanity checks that run when slow assertions are enabled. Enforces the invariants of the Fittability subsystem.
   * @public
   */ audit() {
        if (assertSlow) {
            assertSlow(this.selfFittable === this.isSelfFitSupported(), 'selfFittable diverged from isSelfFitSupported()');
            assertSlow(this.ancestorsFittable === ((this.parent ? this.parent.ancestorsFittable : true) && this.selfFittable), 'Our ancestorsFittable should be false if our parent or our self is not fittable.');
            // Our subtree unfittable count should be the sum of children that have a non-zero count, plus 1 if our self
            // is not fittable
            let subtreeUnfittableCount = 0;
            if (!this.selfFittable) {
                subtreeUnfittableCount++;
            }
            _.each(this.instance.children, (instance)=>{
                if (instance.fittability.subtreeUnfittableCount > 0) {
                    subtreeUnfittableCount++;
                }
            });
            assertSlow(this.subtreeUnfittableCount === subtreeUnfittableCount, 'Incorrect subtreeUnfittableCount');
        }
    }
    /**
   * @param {Instance} instance - Our Instance, never changes.
   */ constructor(instance){
        // @private {Instance}
        this.instance = instance;
    }
};
scenery.register('Fittability', Fittability);
export default Fittability;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9GaXR0YWJpbGl0eS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHN1Yi1jb21wb25lbnQgb2YgYW4gSW5zdGFuY2UgdGhhdCBoYW5kbGVzIG1hdHRlcnMgcmVsYXRpbmcgdG8gd2hldGhlciBmaXR0ZWQgYmxvY2tzIHNob3VsZCBub3QgZml0IGlmIHBvc3NpYmxlLlxuICogV2UgbW9zdGx5IG1hcmsgb3VyIG93biBkcmF3YWJsZXMgYXMgZml0dGFibGUsIGFuZCB0cmFjayB3aGV0aGVyIG91ciBzdWJ0cmVlIGlzIGFsbCBmaXR0YWJsZSAoc28gdGhhdCBjb21tb24tYW5jZXN0b3JcbiAqIGZpdHMgY2FuIGRldGVybWluZSBpZiB0aGVpciBib3VuZHMgd2lsbCBjaGFuZ2UpLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XG5pbXBvcnQgeyBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIEZpdHRhYmlsaXR5IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlIC0gT3VyIEluc3RhbmNlLCBuZXZlciBjaGFuZ2VzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoIGluc3RhbmNlICkge1xuICAgIC8vIEBwcml2YXRlIHtJbnN0YW5jZX1cbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogUmVzcG9uc2libGUgZm9yIGluaXRpYWxpemF0aW9uIGFuZCBjbGVhbmluZyBvZiB0aGlzLiBJZiB0aGUgcGFyYW1ldGVycyBhcmUgYm90aCBudWxsLCB3ZSdsbCB3YW50IHRvIGNsZWFuIG91clxuICAgKiBleHRlcm5hbCByZWZlcmVuY2VzIChsaWtlIEluc3RhbmNlIGRvZXMpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RGlzcGxheXxudWxsfSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7VHJhaWx8bnVsbH0gdHJhaWxcbiAgICogQHJldHVybnMge0ZpdHRhYmlsaXR5fSAtIFJldHVybnMgdGhpcywgdG8gYWxsb3cgY2hhaW5pbmcuXG4gICAqL1xuICBpbml0aWFsaXplKCBkaXNwbGF5LCB0cmFpbCApIHtcbiAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5OyAvLyBAcHJpdmF0ZSB7RGlzcGxheX1cbiAgICB0aGlzLnRyYWlsID0gdHJhaWw7IC8vIEBwcml2YXRlIHtUcmFpbH1cbiAgICB0aGlzLm5vZGUgPSB0cmFpbCAmJiB0cmFpbC5sYXN0Tm9kZSgpOyAvLyBAcHJpdmF0ZSB7Tm9kZX1cblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gV2hlbiBvdXIgaW5zdGFuY2UncyBub2RlIGhhcyBhIHBhcnRpY3VsYXIgY29tYmluYXRpb24gb2YgZmVhdHVyZXMgYW5kL29yIGZsYWdzIChsaWtlXG4gICAgLy8gcHJldmVudERlZmF1bHQ6dHJ1ZSkgdGhhdCBzaG91bGQgbWFrZSBhbnkgRml0dGVkQmxvY2sgY29udGFpbmluZyBkcmF3YWJsZXMgdW5kZXIgdGhhdCBub2RlIE9SIHRoYXQgd291bGRcbiAgICAvLyBpbmNsdWRlIHRoZSBib3VuZHMgb2YgdGhlIG5vZGUgaW4gaXRzIEZpdHRlZEJsb2NrIHRvIG5vdCBjb21wdXRlIHRoZSByZWxldmFudCBmaXQgKGUuZy4gaGF2ZSBpdCB0YWtlIHVwIHRoZVxuICAgIC8vIGZ1bGwgZGlzcGxheSBpbnN0ZWFkKS5cbiAgICB0aGlzLnNlbGZGaXR0YWJsZSA9ICEhdHJhaWwgJiYgdGhpcy5pc1NlbGZGaXRTdXBwb3J0ZWQoKTtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gV2hldGhlciB0aGlzIGluc3RhbmNlIEFORCBhbGwgb2YgaXRzIGFuY2VzdG9yIGluc3RhbmNlcyAoZG93biB0byB0aGUgcm9vdCBpbnN0YW5jZSBmb3IgdGhlXG4gICAgLy8gZGlzcGxheSkgYWxsIGFyZSBzZWxmLWZpdHRhYmxlLlxuICAgIHRoaXMuYW5jZXN0b3JzRml0dGFibGUgPSB0aGlzLnNlbGZGaXR0YWJsZTtcblxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBUaGUgbnVtYmVyIG9mIGNoaWxkcmVuIHdob3NlIHN1YnRyZWVzIGhhdmUgYW4gdW5maXR0YWJsZSBpbnN0YW5jZSwgcGx1cyAxIGlmIHRoaXMgaW5zdGFuY2VcbiAgICAvLyBpdHNlbGYgaXMgdW5maXR0YWJsZS4gVXNpbmcgYSBudW1iZXIgYWxsb3dzIHVzIHRvIHF1aWNrbHkgaW5jcmVtZW50L2RlY3JlbWVudCB3aGVuIGEgcGFydGljdWxhciBjaGlsZCBjaGFuZ2VzXG4gICAgLy8gaXRzIGZpdHRhYmlsaXR5IChzbyB3ZSBkb24ndCBoYXZlIHRvIGNoZWNrIG90aGVyIHN1YnRyZWVzIG9yIHRyYXZlcnNlIGZ1cnRoZXIgdXAgdGhlIHRyZWUpLiBGb3IgYSBtb3JlXG4gICAgLy8gY29tcGxldGUgZGVzY3JpcHRpb24gb2YgdGhpcyB0ZWNobmlxdWUsIHNlZSBSZW5kZXJlclN1bW1hcnkuXG4gICAgLy8gVGhpcyBpcyBpbXBvcnRhbnQsIHNpbmNlIGlmIGl0J3MgMCwgaXQgaW5kaWNhdGVzIHRoYXQgdGhpcyBlbnRpcmUgc3VidHJlZSBoYXMgTk8gdW5maXR0YWJsZSBjb250ZW50LiBUaHVzIGlmXG4gICAgLy8gYSBGaXR0ZWRCbG9jaydzIGNvbW1vbiBhbmNlc3RvciAoZm9yIHRoZSBjb21tb24tYW5jZXN0b3IgZml0KSBpcyB0aGlzIGluc3RhbmNlLCB3ZSBzaG91bGRuJ3QgaGF2ZSBpc3N1ZXNcbiAgICAvLyB1cGRhdGluZyBvdXIgYm91bmRzLlxuICAgIHRoaXMuc3VidHJlZVVuZml0dGFibGVDb3VudCA9IHRoaXMuc2VsZkZpdHRhYmxlID8gMCA6IDE7XG5cbiAgICAvLyBAcHVibGljIHtUaW55RW1pdHRlcn0gLSBDYWxsZWQgd2l0aCBubyBhcmd1bWVudHMgd2hlbiB0aGUgc3VidHJlZSBmaXR0YWJpbGl0eSBjaGFuZ2VzICh3aGV0aGVyXG4gICAgLy8gc3VidHJlZVVuZml0dGFibGVDb3VudCBpcyBncmVhdGVyIHRoYW4gemVybyBvciBub3QpLlxuICAgIHRoaXMuc3VidHJlZUZpdHRhYmlsaXR5Q2hhbmdlRW1pdHRlciA9IHRoaXMuc3VidHJlZUZpdHRhYmlsaXR5Q2hhbmdlRW1pdHRlciB8fCBuZXcgVGlueUVtaXR0ZXIoKTtcblxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIEVhc3kgYWNjZXNzIHRvIG91ciBwYXJlbnQgSW5zdGFuY2UncyBGaXR0YWJpbGl0eSwgaWYgaXQgZXhpc3RzLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Rml0dGFiaWxpdHl8bnVsbH1cbiAgICovXG4gIGdldCBwYXJlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zdGFuY2UucGFyZW50ID8gdGhpcy5pbnN0YW5jZS5wYXJlbnQuZml0dGFiaWxpdHkgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBpbnN0YW5jZSBpcyB1cGRhdGluZyBpdHMgcmVuZGVyaW5nIHN0YXRlIChhcyBhbnkgZml0dGFiaWxpdHkgY2hhbmdlcyB0byBleGlzdGluZyBpbnN0YW5jZXMgd2lsbFxuICAgKiB0cmlnZ2VyIGFuIHVwZGF0ZSB0aGVyZSkuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNoZWNrU2VsZkZpdHRhYmlsaXR5KCkge1xuICAgIGNvbnN0IG5ld1NlbGZGaXR0YWJsZSA9IHRoaXMuaXNTZWxmRml0U3VwcG9ydGVkKCk7XG4gICAgaWYgKCB0aGlzLnNlbGZGaXR0YWJsZSAhPT0gbmV3U2VsZkZpdHRhYmxlICkge1xuICAgICAgdGhpcy51cGRhdGVTZWxmRml0dGFibGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciBvdXIgbm9kZSdzIHBlcmZvcm1hbmNlIGZsYWdzIGFsbG93cyB0aGUgc3VidHJlZSB0byBiZSBmaXR0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEFueSB1cGRhdGVzIHRvIGZsYWdzIChmb3IgaW5zdGFuY2UsIGEgJ2R5bmFtaWMnIGZsYWcgcGVyaGFwcz8pIHNob3VsZCBiZSBhZGRlZCBoZXJlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU2VsZkZpdFN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwbGF5Ll9hbGxvd0xheWVyRml0dGluZyAmJiAhdGhpcy5ub2RlLmlzUHJldmVudEZpdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIG91ciBwYXJlbnQganVzdCBiZWNhbWUgZml0dGFibGUuIFJlc3BvbnNpYmxlIGZvciBmbGFnZ2luZyBzdWJ0cmVlcyB3aXRoIHRoZSBhbmNlc3RvcnNGaXR0YWJsZSBmbGFnLFxuICAgKiB1cCB0byB0aGUgcG9pbnQgd2hlcmUgdGhleSBhcmUgZml0dGFibGUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXJrU3VidHJlZUZpdHRhYmxlKCkge1xuICAgIC8vIEJhaWwgaWYgd2UgY2FuJ3QgYmUgZml0dGFibGUgb3Vyc2VsdmVzXG4gICAgaWYgKCAhdGhpcy5zZWxmRml0dGFibGUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5hbmNlc3RvcnNGaXR0YWJsZSA9IHRydWU7XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuaW5zdGFuY2UuY2hpbGRyZW47XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjaGlsZHJlblsgaSBdLmZpdHRhYmlsaXR5Lm1hcmtTdWJ0cmVlRml0dGFibGUoKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIEluc3RhbmNlJ3MgZHJhd2FibGVzLCBzbyB0aGF0IHRoZWlyIGJsb2NrcyBjYW4gcG90ZW50aWFsbHkgbm93IGJlIGZpdHRlZC5cbiAgICB0aGlzLmluc3RhbmNlLnVwZGF0ZURyYXdhYmxlRml0dGFiaWxpdHkoIHRydWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBvdXIgcGFyZW50IGp1c3QgYmVjYW1lIHVuZml0dGFibGUgYW5kIHdlIGFyZSBmaXR0YWJsZS4gUmVzcG9uc2libGUgZm9yIGZsYWdnaW5nIHN1YnRyZWVzIHdpdGhcbiAgICogdGhlICFhbmNlc3RvcnNGaXR0YWJsZSBmbGFnLCB1cCB0byB0aGUgcG9pbnQgd2hlcmUgdGhleSBhcmUgdW5maXR0YWJsZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1hcmtTdWJ0cmVlVW5maXR0YWJsZSgpIHtcbiAgICAvLyBCYWlsIGlmIHdlIGFyZSBhbHJlYWR5IHVuZml0dGFibGVcbiAgICBpZiAoICF0aGlzLmFuY2VzdG9yc0ZpdHRhYmxlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYW5jZXN0b3JzRml0dGFibGUgPSBmYWxzZTtcblxuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5pbnN0YW5jZS5jaGlsZHJlbjtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNoaWxkcmVuWyBpIF0uZml0dGFiaWxpdHkubWFya1N1YnRyZWVVbmZpdHRhYmxlKCk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBJbnN0YW5jZSdzIGRyYXdhYmxlcywgc28gdGhhdCB0aGVpciBibG9ja3MgY2FuIHBvdGVudGlhbGx5IG5vdyBiZSBwcmV2ZW50ZWQgZnJvbSBiZWluZyBmaXR0ZWQuXG4gICAgdGhpcy5pbnN0YW5jZS51cGRhdGVEcmF3YWJsZUZpdHRhYmlsaXR5KCBmYWxzZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIG91ciBOb2RlJ3Mgc2VsZiBmaXQtYWJpbGl0eSBoYXMgY2hhbmdlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVNlbGZGaXR0YWJsZSgpIHtcbiAgICBjb25zdCBuZXdTZWxmRml0dGFibGUgPSB0aGlzLmlzU2VsZkZpdFN1cHBvcnRlZCgpO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc2VsZkZpdHRhYmxlICE9PSBuZXdTZWxmRml0dGFibGUgKTtcblxuICAgIHRoaXMuc2VsZkZpdHRhYmxlID0gbmV3U2VsZkZpdHRhYmxlO1xuXG4gICAgaWYgKCB0aGlzLnNlbGZGaXR0YWJsZSAmJiAoICF0aGlzLnBhcmVudCB8fCB0aGlzLnBhcmVudC5hbmNlc3RvcnNGaXR0YWJsZSApICkge1xuICAgICAgdGhpcy5tYXJrU3VidHJlZUZpdHRhYmxlKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCAhdGhpcy5zZWxmRml0dGFibGUgKSB7XG4gICAgICB0aGlzLm1hcmtTdWJ0cmVlVW5maXR0YWJsZSgpO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5zZWxmRml0dGFibGUgKSB7XG4gICAgICB0aGlzLmRlY3JlbWVudFN1YnRyZWVVbmZpdHRhYmxlQ291bnQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmluY3JlbWVudFN1YnRyZWVVbmZpdHRhYmxlQ291bnQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBjaGlsZCBpbnN0YW5jZSdzIHN1YnRyZWUgYmVjYW1lIHVuZml0dGFibGUsIE9SIG91ciAnc2VsZicgYmVjYW1lIHVuZml0dGFibGUuIFRoaXMgaXMgcmVzcG9uc2libGUgZm9yIHVwZGF0aW5nXG4gICAqIHRoZSBzdWJ0cmVlRml0dGFibGVDb3VudCBmb3IgdGhpcyBpbnN0YW5jZSBBTkQgdXAgdG8gYWxsIGFuY2VzdG9ycyB0aGF0IHdvdWxkIGJlIGFmZmVjdGVkIGJ5IHRoZSBjaGFuZ2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbmNyZW1lbnRTdWJ0cmVlVW5maXR0YWJsZUNvdW50KCkge1xuICAgIHRoaXMuc3VidHJlZVVuZml0dGFibGVDb3VudCsrO1xuXG4gICAgLy8gSWYgbm93IHNvbWV0aGluZyBpbiBvdXIgc3VidHJlZSBjYW4ndCBiZSBmaXR0ZWQsIHdlIG5lZWQgdG8gbm90aWZ5IG91ciBwYXJlbnRcbiAgICBpZiAoIHRoaXMuc3VidHJlZVVuZml0dGFibGVDb3VudCA9PT0gMSApIHtcbiAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmluY3JlbWVudFN1YnRyZWVVbmZpdHRhYmxlQ291bnQoKTtcblxuICAgICAgLy8gTm90aWZ5IGFueXRoaW5nIGxpc3RlbmluZyB0aGF0IHRoZSBjb25kaXRpb24gKCB0aGlzLnN1YnRyZWVVbmZpdHRhYmxlQ291bnQgPiAwICkgY2hhbmdlZC5cbiAgICAgIHRoaXMuc3VidHJlZUZpdHRhYmlsaXR5Q2hhbmdlRW1pdHRlci5lbWl0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgY2hpbGQgaW5zdGFuY2UncyBzdWJ0cmVlIGJlY2FtZSBmaXR0YWJsZSwgT1Igb3VyICdzZWxmJyBiZWNhbWUgZml0dGFibGUuIFRoaXMgaXMgcmVzcG9uc2libGUgZm9yIHVwZGF0aW5nXG4gICAqIHRoZSBzdWJ0cmVlRml0dGFibGVDb3VudCBmb3IgdGhpcyBpbnN0YW5jZSBBTkQgdXAgdG8gYWxsIGFuY2VzdG9ycyB0aGF0IHdvdWxkIGJlIGFmZmVjdGVkIGJ5IHRoZSBjaGFuZ2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNyZW1lbnRTdWJ0cmVlVW5maXR0YWJsZUNvdW50KCkge1xuICAgIHRoaXMuc3VidHJlZVVuZml0dGFibGVDb3VudC0tO1xuXG4gICAgLy8gSWYgbm93IG91ciBzdWJ0cmVlIGNhbiBhbGwgYmUgZml0dGVkLCB3ZSBuZWVkIHRvIG5vdGlmeSBvdXIgcGFyZW50XG4gICAgaWYgKCB0aGlzLnN1YnRyZWVVbmZpdHRhYmxlQ291bnQgPT09IDAgKSB7XG4gICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5kZWNyZW1lbnRTdWJ0cmVlVW5maXR0YWJsZUNvdW50KCk7XG5cbiAgICAgIC8vIE5vdGlmeSBhbnl0aGluZyBsaXN0ZW5pbmcgdGhhdCB0aGUgY29uZGl0aW9uICggdGhpcy5zdWJ0cmVlVW5maXR0YWJsZUNvdW50ID4gMCApIGNoYW5nZWQuXG4gICAgICB0aGlzLnN1YnRyZWVGaXR0YWJpbGl0eUNoYW5nZUVtaXR0ZXIuZW1pdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhbiBpbnN0YW5jZSBpcyBhZGRlZCBhcyBhIGNoaWxkIHRvIG91ciBpbnN0YW5jZS4gVXBkYXRlcyBuZWNlc3NhcnkgY291bnRzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Rml0dGFiaWxpdHl9IGNoaWxkRml0dGFiaWxpdHkgLSBUaGUgRml0dGFiaWxpdHkgb2YgdGhlIG5ldyBjaGlsZCBpbnN0YW5jZS5cbiAgICovXG4gIG9uSW5zZXJ0KCBjaGlsZEZpdHRhYmlsaXR5ICkge1xuICAgIGlmICggIXRoaXMuYW5jZXN0b3JzRml0dGFibGUgKSB7XG4gICAgICBjaGlsZEZpdHRhYmlsaXR5Lm1hcmtTdWJ0cmVlVW5maXR0YWJsZSgpO1xuICAgIH1cblxuICAgIGlmICggY2hpbGRGaXR0YWJpbGl0eS5zdWJ0cmVlVW5maXR0YWJsZUNvdW50ID4gMCApIHtcbiAgICAgIHRoaXMuaW5jcmVtZW50U3VidHJlZVVuZml0dGFibGVDb3VudCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGNoaWxkIGluc3RhbmNlIGlzIHJlbW92ZWQgZnJvbSBvdXIgaW5zdGFuY2UuIFVwZGF0ZXMgbmVjZXNzYXJ5IGNvdW50cy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0ZpdHRhYmlsaXR5fSBjaGlsZEZpdHRhYmlsaXR5IC0gVGhlIEZpdHRhYmlsaXR5IG9mIHRoZSBvbGQgY2hpbGQgaW5zdGFuY2UuXG4gICAqL1xuICBvblJlbW92ZSggY2hpbGRGaXR0YWJpbGl0eSApIHtcbiAgICBpZiAoICF0aGlzLmFuY2VzdG9yc0ZpdHRhYmxlICkge1xuICAgICAgY2hpbGRGaXR0YWJpbGl0eS5tYXJrU3VidHJlZUZpdHRhYmxlKCk7XG4gICAgfVxuXG4gICAgaWYgKCBjaGlsZEZpdHRhYmlsaXR5LnN1YnRyZWVVbmZpdHRhYmxlQ291bnQgPiAwICkge1xuICAgICAgdGhpcy5kZWNyZW1lbnRTdWJ0cmVlVW5maXR0YWJsZUNvdW50KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0eSBjaGVja3MgdGhhdCBydW4gd2hlbiBzbG93IGFzc2VydGlvbnMgYXJlIGVuYWJsZWQuIEVuZm9yY2VzIHRoZSBpbnZhcmlhbnRzIG9mIHRoZSBGaXR0YWJpbGl0eSBzdWJzeXN0ZW0uXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGF1ZGl0KCkge1xuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgIGFzc2VydFNsb3coIHRoaXMuc2VsZkZpdHRhYmxlID09PSB0aGlzLmlzU2VsZkZpdFN1cHBvcnRlZCgpLFxuICAgICAgICAnc2VsZkZpdHRhYmxlIGRpdmVyZ2VkIGZyb20gaXNTZWxmRml0U3VwcG9ydGVkKCknICk7XG5cbiAgICAgIGFzc2VydFNsb3coIHRoaXMuYW5jZXN0b3JzRml0dGFibGUgPT09ICggKCB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmFuY2VzdG9yc0ZpdHRhYmxlIDogdHJ1ZSApICYmIHRoaXMuc2VsZkZpdHRhYmxlICksXG4gICAgICAgICdPdXIgYW5jZXN0b3JzRml0dGFibGUgc2hvdWxkIGJlIGZhbHNlIGlmIG91ciBwYXJlbnQgb3Igb3VyIHNlbGYgaXMgbm90IGZpdHRhYmxlLicgKTtcblxuICAgICAgLy8gT3VyIHN1YnRyZWUgdW5maXR0YWJsZSBjb3VudCBzaG91bGQgYmUgdGhlIHN1bSBvZiBjaGlsZHJlbiB0aGF0IGhhdmUgYSBub24temVybyBjb3VudCwgcGx1cyAxIGlmIG91ciBzZWxmXG4gICAgICAvLyBpcyBub3QgZml0dGFibGVcbiAgICAgIGxldCBzdWJ0cmVlVW5maXR0YWJsZUNvdW50ID0gMDtcbiAgICAgIGlmICggIXRoaXMuc2VsZkZpdHRhYmxlICkge1xuICAgICAgICBzdWJ0cmVlVW5maXR0YWJsZUNvdW50Kys7XG4gICAgICB9XG4gICAgICBfLmVhY2goIHRoaXMuaW5zdGFuY2UuY2hpbGRyZW4sIGluc3RhbmNlID0+IHtcbiAgICAgICAgaWYgKCBpbnN0YW5jZS5maXR0YWJpbGl0eS5zdWJ0cmVlVW5maXR0YWJsZUNvdW50ID4gMCApIHtcbiAgICAgICAgICBzdWJ0cmVlVW5maXR0YWJsZUNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIGFzc2VydFNsb3coIHRoaXMuc3VidHJlZVVuZml0dGFibGVDb3VudCA9PT0gc3VidHJlZVVuZml0dGFibGVDb3VudCwgJ0luY29ycmVjdCBzdWJ0cmVlVW5maXR0YWJsZUNvdW50JyApO1xuICAgIH1cbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnRml0dGFiaWxpdHknLCBGaXR0YWJpbGl0eSApO1xuZXhwb3J0IGRlZmF1bHQgRml0dGFiaWxpdHk7Il0sIm5hbWVzIjpbIlRpbnlFbWl0dGVyIiwic2NlbmVyeSIsIkZpdHRhYmlsaXR5IiwiaW5pdGlhbGl6ZSIsImRpc3BsYXkiLCJ0cmFpbCIsIm5vZGUiLCJsYXN0Tm9kZSIsInNlbGZGaXR0YWJsZSIsImlzU2VsZkZpdFN1cHBvcnRlZCIsImFuY2VzdG9yc0ZpdHRhYmxlIiwic3VidHJlZVVuZml0dGFibGVDb3VudCIsInN1YnRyZWVGaXR0YWJpbGl0eUNoYW5nZUVtaXR0ZXIiLCJwYXJlbnQiLCJpbnN0YW5jZSIsImZpdHRhYmlsaXR5IiwiY2hlY2tTZWxmRml0dGFiaWxpdHkiLCJuZXdTZWxmRml0dGFibGUiLCJ1cGRhdGVTZWxmRml0dGFibGUiLCJfYWxsb3dMYXllckZpdHRpbmciLCJpc1ByZXZlbnRGaXQiLCJtYXJrU3VidHJlZUZpdHRhYmxlIiwiY2hpbGRyZW4iLCJpIiwibGVuZ3RoIiwidXBkYXRlRHJhd2FibGVGaXR0YWJpbGl0eSIsIm1hcmtTdWJ0cmVlVW5maXR0YWJsZSIsImFzc2VydCIsImRlY3JlbWVudFN1YnRyZWVVbmZpdHRhYmxlQ291bnQiLCJpbmNyZW1lbnRTdWJ0cmVlVW5maXR0YWJsZUNvdW50IiwiZW1pdCIsIm9uSW5zZXJ0IiwiY2hpbGRGaXR0YWJpbGl0eSIsIm9uUmVtb3ZlIiwiYXVkaXQiLCJhc3NlcnRTbG93IiwiXyIsImVhY2giLCJjb25zdHJ1Y3RvciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsaUJBQWlCLGtDQUFrQztBQUMxRCxTQUFTQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXhDLElBQUEsQUFBTUMsY0FBTixNQUFNQTtJQVNKOzs7Ozs7OztHQVFDLEdBQ0RDLFdBQVlDLE9BQU8sRUFBRUMsS0FBSyxFQUFHO1FBQzNCLElBQUksQ0FBQ0QsT0FBTyxHQUFHQSxTQUFTLHFCQUFxQjtRQUM3QyxJQUFJLENBQUNDLEtBQUssR0FBR0EsT0FBTyxtQkFBbUI7UUFDdkMsSUFBSSxDQUFDQyxJQUFJLEdBQUdELFNBQVNBLE1BQU1FLFFBQVEsSUFBSSxrQkFBa0I7UUFFekQsMkdBQTJHO1FBQzNHLDJHQUEyRztRQUMzRyw4R0FBOEc7UUFDOUcseUJBQXlCO1FBQ3pCLElBQUksQ0FBQ0MsWUFBWSxHQUFHLENBQUMsQ0FBQ0gsU0FBUyxJQUFJLENBQUNJLGtCQUFrQjtRQUV0RCxpSEFBaUg7UUFDakgsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUcsSUFBSSxDQUFDRixZQUFZO1FBRTFDLGdIQUFnSDtRQUNoSCxnSEFBZ0g7UUFDaEgseUdBQXlHO1FBQ3pHLCtEQUErRDtRQUMvRCwrR0FBK0c7UUFDL0csMkdBQTJHO1FBQzNHLHVCQUF1QjtRQUN2QixJQUFJLENBQUNHLHNCQUFzQixHQUFHLElBQUksQ0FB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