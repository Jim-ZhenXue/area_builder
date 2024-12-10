// Copyright 2020-2021, University of Colorado Boulder
/**
 * Data structure that handles creating/destroying related objects that need to exist when something's count is >=1
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../phet-core/js/Poolable.js';
import { scenery } from '../imports.js';
let CountMap = class CountMap {
    /**
   * @public
   *
   * @param {*} key
   * @param {number} [quantity]
   */ increment(key, quantity = 1) {
        assert && assert(typeof quantity === 'number');
        assert && assert(quantity >= 1);
        if (this.map.has(key)) {
            this.map.get(key).count += quantity;
        } else {
            const value = this.create(key);
            const entry = CountMapEntry.createFromPool(quantity, key, value);
            this.map.set(key, entry);
        }
    }
    /**
   * @public
   *
   * @param {*} key
   * @param {number} [quantity]
   */ decrement(key, quantity = 1) {
        assert && assert(typeof quantity === 'number');
        assert && assert(quantity >= 1);
        const entry = this.map.get(key);
        // Was an old comment of
        // > since the block may have been disposed (yikes!), we have a defensive set-up here
        // So we're playing it extra defensive here for now
        if (entry) {
            entry.count -= quantity;
            if (entry.count < 1) {
                this.destroy(key, entry.value);
                this.map.delete(key);
                entry.dispose();
            }
        }
    }
    /**
   * @public
   *
   * @param {*} key
   * @returns {*}
   */ get(key) {
        return this.map.get(key).value;
    }
    /**
   * @public
   *
   * NOTE: We COULD try to collect all of the CountMapEntries... but that seems like an awful lot of CPU.
   * If GC is an issue from this, we can add more logic
   */ clear() {
        this.map.clear();
    }
    /**
   * @param {function(*):*} create
   * @param {function(*,*)} destroy
   */ constructor(create, destroy){
        // @private
        this.create = create;
        this.destroy = destroy;
        // @private {Map.<*,Entry>}
        this.map = new Map();
    }
};
let CountMapEntry = class CountMapEntry {
    /**
   * @public
   *
   * @param {number} count
   * @param {*} key
   * @param {*} value
   */ initialize(count, key, value) {
        // @public {number}
        this.count = count;
        // @public {*}
        this.key = key;
        this.value = value;
    }
    /**
   * Releases references
   * @public
   */ dispose() {
        // Null things out, to prevent leaks (in case)
        this.key = null;
        this.value = null;
        this.freeToPool();
    }
    /**
   * @param {number} count
   * @param {*} key
   * @param {*} value
   */ constructor(count, key, value){
        this.initialize(count, key, value);
    }
};
Poolable.mixInto(CountMapEntry, {
    initialize: CountMapEntry.prototype.initialize
});
scenery.register('CountMap', CountMap);
export default CountMap;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9Db3VudE1hcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEYXRhIHN0cnVjdHVyZSB0aGF0IGhhbmRsZXMgY3JlYXRpbmcvZGVzdHJveWluZyByZWxhdGVkIG9iamVjdHMgdGhhdCBuZWVkIHRvIGV4aXN0IHdoZW4gc29tZXRoaW5nJ3MgY291bnQgaXMgPj0xXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBDb3VudE1hcCB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCopOip9IGNyZWF0ZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCosKil9IGRlc3Ryb3lcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBjcmVhdGUsIGRlc3Ryb3kgKSB7XG5cbiAgICAvLyBAcHJpdmF0ZVxuICAgIHRoaXMuY3JlYXRlID0gY3JlYXRlO1xuICAgIHRoaXMuZGVzdHJveSA9IGRlc3Ryb3k7XG5cbiAgICAvLyBAcHJpdmF0ZSB7TWFwLjwqLEVudHJ5Pn1cbiAgICB0aGlzLm1hcCA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0ga2V5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbcXVhbnRpdHldXG4gICAqL1xuICBpbmNyZW1lbnQoIGtleSwgcXVhbnRpdHkgPSAxICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBxdWFudGl0eSA9PT0gJ251bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBxdWFudGl0eSA+PSAxICk7XG5cbiAgICBpZiAoIHRoaXMubWFwLmhhcygga2V5ICkgKSB7XG4gICAgICB0aGlzLm1hcC5nZXQoIGtleSApLmNvdW50ICs9IHF1YW50aXR5O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5jcmVhdGUoIGtleSApO1xuICAgICAgY29uc3QgZW50cnkgPSBDb3VudE1hcEVudHJ5LmNyZWF0ZUZyb21Qb29sKCBxdWFudGl0eSwga2V5LCB2YWx1ZSApO1xuICAgICAgdGhpcy5tYXAuc2V0KCBrZXksIGVudHJ5ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHsqfSBrZXlcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtxdWFudGl0eV1cbiAgICovXG4gIGRlY3JlbWVudCgga2V5LCBxdWFudGl0eSA9IDEgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHF1YW50aXR5ID09PSAnbnVtYmVyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHF1YW50aXR5ID49IDEgKTtcblxuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5tYXAuZ2V0KCBrZXkgKTtcblxuICAgIC8vIFdhcyBhbiBvbGQgY29tbWVudCBvZlxuICAgIC8vID4gc2luY2UgdGhlIGJsb2NrIG1heSBoYXZlIGJlZW4gZGlzcG9zZWQgKHlpa2VzISksIHdlIGhhdmUgYSBkZWZlbnNpdmUgc2V0LXVwIGhlcmVcbiAgICAvLyBTbyB3ZSdyZSBwbGF5aW5nIGl0IGV4dHJhIGRlZmVuc2l2ZSBoZXJlIGZvciBub3dcbiAgICBpZiAoIGVudHJ5ICkge1xuICAgICAgZW50cnkuY291bnQgLT0gcXVhbnRpdHk7XG4gICAgICBpZiAoIGVudHJ5LmNvdW50IDwgMSApIHtcbiAgICAgICAgdGhpcy5kZXN0cm95KCBrZXksIGVudHJ5LnZhbHVlICk7XG4gICAgICAgIHRoaXMubWFwLmRlbGV0ZSgga2V5ICk7XG4gICAgICAgIGVudHJ5LmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0geyp9IGtleVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldCgga2V5ICkge1xuICAgIHJldHVybiB0aGlzLm1hcC5nZXQoIGtleSApLnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogTk9URTogV2UgQ09VTEQgdHJ5IHRvIGNvbGxlY3QgYWxsIG9mIHRoZSBDb3VudE1hcEVudHJpZXMuLi4gYnV0IHRoYXQgc2VlbXMgbGlrZSBhbiBhd2Z1bCBsb3Qgb2YgQ1BVLlxuICAgKiBJZiBHQyBpcyBhbiBpc3N1ZSBmcm9tIHRoaXMsIHdlIGNhbiBhZGQgbW9yZSBsb2dpY1xuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5tYXAuY2xlYXIoKTtcbiAgfVxufVxuXG5jbGFzcyBDb3VudE1hcEVudHJ5IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudFxuICAgKiBAcGFyYW0geyp9IGtleVxuICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAqL1xuICBjb25zdHJ1Y3RvciggY291bnQsIGtleSwgdmFsdWUgKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCBjb3VudCwga2V5LCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50XG4gICAqIEBwYXJhbSB7Kn0ga2V5XG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICovXG4gIGluaXRpYWxpemUoIGNvdW50LCBrZXksIHZhbHVlICkge1xuXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxuICAgIHRoaXMuY291bnQgPSBjb3VudDtcblxuICAgIC8vIEBwdWJsaWMgeyp9XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICAvLyBOdWxsIHRoaW5ncyBvdXQsIHRvIHByZXZlbnQgbGVha3MgKGluIGNhc2UpXG4gICAgdGhpcy5rZXkgPSBudWxsO1xuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuXG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XG4gIH1cbn1cblxuUG9vbGFibGUubWl4SW50byggQ291bnRNYXBFbnRyeSwge1xuICBpbml0aWFsaXplOiBDb3VudE1hcEVudHJ5LnByb3RvdHlwZS5pbml0aWFsaXplXG59ICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdDb3VudE1hcCcsIENvdW50TWFwICk7XG5leHBvcnQgZGVmYXVsdCBDb3VudE1hcDsiXSwibmFtZXMiOlsiUG9vbGFibGUiLCJzY2VuZXJ5IiwiQ291bnRNYXAiLCJpbmNyZW1lbnQiLCJrZXkiLCJxdWFudGl0eSIsImFzc2VydCIsIm1hcCIsImhhcyIsImdldCIsImNvdW50IiwidmFsdWUiLCJjcmVhdGUiLCJlbnRyeSIsIkNvdW50TWFwRW50cnkiLCJjcmVhdGVGcm9tUG9vbCIsInNldCIsImRlY3JlbWVudCIsImRlc3Ryb3kiLCJkZWxldGUiLCJkaXNwb3NlIiwiY2xlYXIiLCJjb25zdHJ1Y3RvciIsIk1hcCIsImluaXRpYWxpemUiLCJmcmVlVG9Qb29sIiwibWl4SW50byIsInByb3RvdHlwZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsb0NBQW9DO0FBQ3pELFNBQVNDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFeEMsSUFBQSxBQUFNQyxXQUFOLE1BQU1BO0lBZUo7Ozs7O0dBS0MsR0FDREMsVUFBV0MsR0FBRyxFQUFFQyxXQUFXLENBQUMsRUFBRztRQUM3QkMsVUFBVUEsT0FBUSxPQUFPRCxhQUFhO1FBQ3RDQyxVQUFVQSxPQUFRRCxZQUFZO1FB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