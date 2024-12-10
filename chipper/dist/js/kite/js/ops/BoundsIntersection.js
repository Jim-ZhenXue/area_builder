// Copyright 2017-2024, University of Colorado Boulder
/**
 * A region of two segments that intersects (contains static functions for segment intersection).
 *
 * BoundsIntersection.intersect( a, b ) should be used for most general intersection routines as a fallback.
 * Other segment-specific routines may be much faster.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../../phet-core/js/Pool.js';
import { kite, SegmentIntersection } from '../imports.js';
let BoundsIntersection = class BoundsIntersection {
    /**
   * @param a
   * @param b
   * @param atMin - Lower t value for the region of the 'a' segment
   * @param atMax - Higher t value for the region of the 'a' segment
   * @param btMin - Lower t value for the region of the 'b' segment
   * @param btMax - Higher t value for the region of the 'b' segment
   * @param aMin - Location of the lower t value for the 'a' segment's region
   * @param aMax - Location of the higher t value for the 'a' segment's region
   * @param bMin - Location of the lower t value for the 'b' segment's region
   * @param bMax - Location of the higher t value for the 'b' segment's region
   * @returns -  This reference for chaining
   */ initialize(a, b, atMin, atMax, btMin, btMax, aMin, aMax, bMin, bMax) {
        this.a = a;
        this.b = b;
        this.atMin = atMin;
        this.atMax = atMax;
        this.btMin = btMin;
        this.btMax = btMax;
        this.aMin = aMin;
        this.aMax = aMax;
        this.bMin = bMin;
        this.bMax = bMax;
        return this;
    }
    /**
   * Handles subdivision of the regions into 2 for the 'a' segment and 2 for the 'b' segment, then pushes any
   * intersecting bounding box regions (between 'a' and 'b') to the array.
   */ pushSubdivisions(intersections) {
        // We are not in the pool, so our things aren't null
        const thisActive = this;
        const atMid = (thisActive.atMax + thisActive.atMin) / 2;
        const btMid = (thisActive.btMax + thisActive.btMin) / 2;
        // If we reached the point where no higher precision can be obtained, return the given intersection
        if (atMid === this.atMin || atMid === this.atMax || btMid === this.btMin || btMid === this.btMax) {
            intersections.push(this);
            return;
        }
        const aMid = thisActive.a.positionAt(atMid);
        const bMid = thisActive.b.positionAt(btMid);
        if (BoundsIntersection.boxIntersects(thisActive.aMin, aMid, thisActive.bMin, bMid)) {
            intersections.push(BoundsIntersection.pool.create(thisActive.a, thisActive.b, thisActive.atMin, atMid, thisActive.btMin, btMid, thisActive.aMin, aMid, thisActive.bMin, bMid));
        }
        if (BoundsIntersection.boxIntersects(aMid, thisActive.aMax, thisActive.bMin, bMid)) {
            intersections.push(BoundsIntersection.pool.create(thisActive.a, thisActive.b, atMid, thisActive.atMax, thisActive.btMin, btMid, aMid, thisActive.aMax, thisActive.bMin, bMid));
        }
        if (BoundsIntersection.boxIntersects(thisActive.aMin, aMid, bMid, thisActive.bMax)) {
            intersections.push(BoundsIntersection.pool.create(thisActive.a, thisActive.b, thisActive.atMin, atMid, btMid, thisActive.btMax, thisActive.aMin, aMid, bMid, thisActive.bMax));
        }
        if (BoundsIntersection.boxIntersects(aMid, thisActive.aMax, bMid, thisActive.bMax)) {
            intersections.push(BoundsIntersection.pool.create(thisActive.a, thisActive.b, atMid, thisActive.atMax, btMid, thisActive.btMax, aMid, thisActive.aMax, bMid, thisActive.bMax));
        }
        this.freeToPool();
    }
    /**
   * A measure of distance between this and another intersection.
   */ distance(otherIntersection) {
        const daMin = this.atMin - otherIntersection.atMin;
        const daMax = this.atMax - otherIntersection.atMax;
        const dbMin = this.btMin - otherIntersection.btMin;
        const dbMax = this.btMax - otherIntersection.btMax;
        return daMin * daMin + daMax * daMax + dbMin * dbMin + dbMax * dbMax;
    }
    /**
   * Removes references (so it can allow other objects to be GC'ed or pooled)
   */ clean() {
        this.a = null;
        this.b = null;
        this.aMin = null;
        this.aMax = null;
        this.bMin = null;
        this.bMax = null;
    }
    /**
   * Determine (finite) points of intersection between two arbitrary segments.
   *
   * Does repeated subdivision and excludes a-b region pairs that don't intersect. Doing this repeatedly narrows down
   * intersections, to the point that they can be combined for a fairly accurate answer.
   */ static intersect(a, b) {
        if (!a.bounds.intersectsBounds(b.bounds)) {
            return [];
        }
        const intersections = BoundsIntersection.getIntersectionRanges(a, b);
        // Group together intersections that are very close (in parametric value space) so we can only return
        // one intersection (averaged value) for them.
        const groups = [];
        // NOTE: Doesn't have to be the fastest, won't be a crazy huge amount of these unless something went
        //       seriously wrong (degenerate case?)
        for(let i = 0; i < intersections.length; i++){
            const intersection = intersections[i];
            let wasAdded = false;
            nextComparison: for(let j = 0; j < groups.length; j++){
                const group = groups[j];
                for(let k = 0; k < group.length; k++){
                    const otherIntersection = group[k];
                    if (intersection.distance(otherIntersection) < 1e-13) {
                        group.push(intersection);
                        wasAdded = true;
                        break nextComparison; // eslint-disable-line no-labels
                    }
                }
            }
            if (!wasAdded) {
                groups.push([
                    intersection
                ]);
            }
        }
        const results = [];
        // For each group, average its parametric values, and create a "result intersection" from it.
        for(let i = 0; i < groups.length; i++){
            const group = groups[i];
            let aT = 0;
            let bT = 0;
            for(let j = 0; j < group.length; j++){
                aT += group[j].atMin + group[j].atMax;
                bT += group[j].btMin + group[j].btMax;
            }
            aT /= 2 * group.length;
            bT /= 2 * group.length;
            const positionA = a.positionAt(aT);
            const positionB = b.positionAt(bT);
            assert && assert(positionA.distance(positionB) < 1e-10);
            results.push(new SegmentIntersection(positionA.average(positionB), aT, bT));
        }
        // Clean up
        for(let i = 0; i < intersections.length; i++){
            intersections[i].freeToPool();
        }
        BoundsIntersection.cleanPool();
        return results;
    }
    /**
   * Given two segments, returns an array of candidate intersection ranges.
   */ static getIntersectionRanges(a, b) {
        // Internal t-values that have a local min/max in at least one coordinate. We'll split based on these, so we only
        // check intersections between monotone segments (won't have to check self-intersection).
        const aExtrema = a.getInteriorExtremaTs();
        const bExtrema = b.getInteriorExtremaTs();
        // T-value pairs
        const aInternals = _.zip([
            0
        ].concat(aExtrema), aExtrema.concat([
            1
        ]));
        const bInternals = _.zip([
            0
        ].concat(bExtrema), bExtrema.concat([
            1
        ]));
        // Set up initial candidate intersection ranges
        let intersections = [];
        for(let i = 0; i < aInternals.length; i++){
            for(let j = 0; j < bInternals.length; j++){
                const atMin = aInternals[i][0];
                const atMax = aInternals[i][1];
                const btMin = bInternals[j][0];
                const btMax = bInternals[j][1];
                const aMin = a.positionAt(atMin);
                const aMax = a.positionAt(atMax);
                const bMin = b.positionAt(btMin);
                const bMax = b.positionAt(btMax);
                if (BoundsIntersection.boxIntersects(aMin, aMax, bMin, bMax)) {
                    intersections.push(BoundsIntersection.pool.create(a, b, atMin, atMax, btMin, btMax, aMin, aMax, bMin, bMax));
                }
            }
        }
        // Subdivide continuously
        // TODO: is 50 the proper number of iterations? https://github.com/phetsims/kite/issues/76
        for(let i = 0; i < 50; i++){
            const newIntersections = [];
            for(let j = intersections.length - 1; j >= 0; j--){
                intersections[j].pushSubdivisions(newIntersections);
            }
            intersections = newIntersections;
        }
        return intersections;
    }
    /**
   * Given the endpoints of two monotone segment regions, returns whether their bounding boxes intersect.
   */ static boxIntersects(aMin, aMax, bMin, bMax) {
        // e.g. Bounds2.includeBounds
        const minX = Math.max(Math.min(aMin.x, aMax.x), Math.min(bMin.x, bMax.x));
        const minY = Math.max(Math.min(aMin.y, aMax.y), Math.min(bMin.y, bMax.y));
        const maxX = Math.min(Math.max(aMin.x, aMax.x), Math.max(bMin.x, bMax.x));
        const maxY = Math.min(Math.max(aMin.y, aMax.y), Math.max(bMin.y, bMax.y));
        return maxX - minX >= 0 && maxY - minY >= 0;
    }
    /**
   * Since we'll burn through a lot of pooled instances, we only remove external references fully once the full
   * process is done.
   */ static cleanPool() {
        BoundsIntersection.pool.forEach((intersection)=>intersection.clean());
    }
    freeToPool() {
        BoundsIntersection.pool.freeToPool(this);
    }
    /**
   * @param a
   * @param b
   * @param atMin - Lower t value for the region of the 'a' segment
   * @param atMax - Higher t value for the region of the 'a' segment
   * @param btMin - Lower t value for the region of the 'b' segment
   * @param btMax - Higher t value for the region of the 'b' segment
   * @param aMin - Location of the lower t value for the 'a' segment's region
   * @param aMax - Location of the higher t value for the 'a' segment's region
   * @param bMin - Location of the lower t value for the 'b' segment's region
   * @param bMax - Location of the higher t value for the 'b' segment's region
   */ constructor(a, b, atMin, atMax, btMin, btMax, aMin, aMax, bMin, bMax){
        this.initialize(a, b, atMin, atMax, btMin, btMax, aMin, aMax, bMin, bMax);
    }
};
BoundsIntersection.pool = new Pool(BoundsIntersection);
export { BoundsIntersection as default };
kite.register('BoundsIntersection', BoundsIntersection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL0JvdW5kc0ludGVyc2VjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHJlZ2lvbiBvZiB0d28gc2VnbWVudHMgdGhhdCBpbnRlcnNlY3RzIChjb250YWlucyBzdGF0aWMgZnVuY3Rpb25zIGZvciBzZWdtZW50IGludGVyc2VjdGlvbikuXG4gKlxuICogQm91bmRzSW50ZXJzZWN0aW9uLmludGVyc2VjdCggYSwgYiApIHNob3VsZCBiZSB1c2VkIGZvciBtb3N0IGdlbmVyYWwgaW50ZXJzZWN0aW9uIHJvdXRpbmVzIGFzIGEgZmFsbGJhY2suXG4gKiBPdGhlciBzZWdtZW50LXNwZWNpZmljIHJvdXRpbmVzIG1heSBiZSBtdWNoIGZhc3Rlci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IHsga2l0ZSwgU2VnbWVudCwgU2VnbWVudEludGVyc2VjdGlvbiB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG50eXBlIEFjdGl2ZUJvdW5kc0ludGVyc2VjdGlvbiA9IHtcbiAgWyBQcm9wZXJ0eU5hbWUgaW4ga2V5b2YgQm91bmRzSW50ZXJzZWN0aW9uIF06IEJvdW5kc0ludGVyc2VjdGlvbltQcm9wZXJ0eU5hbWVdIGV4dGVuZHMgKCBpbmZlciBUIHwgbnVsbCApID8gVCA6IEJvdW5kc0ludGVyc2VjdGlvbltQcm9wZXJ0eU5hbWVdO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm91bmRzSW50ZXJzZWN0aW9uIHtcblxuICAvLyBOdWxsIGlmIGNsZWFuZWQgb2YgcmVmZXJlbmNlc1xuICBwdWJsaWMgYSE6IFNlZ21lbnQgfCBudWxsO1xuICBwdWJsaWMgYiE6IFNlZ21lbnQgfCBudWxsO1xuXG4gIHB1YmxpYyBhdE1pbiE6IG51bWJlcjtcbiAgcHVibGljIGF0TWF4ITogbnVtYmVyO1xuICBwdWJsaWMgYnRNaW4hOiBudW1iZXI7XG4gIHB1YmxpYyBidE1heCE6IG51bWJlcjtcblxuICAvLyBOdWxsIGlmIGNsZWFuZWQgb2YgcmVmZXJlbmNlc1xuICBwdWJsaWMgYU1pbiE6IFZlY3RvcjIgfCBudWxsO1xuICBwdWJsaWMgYU1heCE6IFZlY3RvcjIgfCBudWxsO1xuICBwdWJsaWMgYk1pbiE6IFZlY3RvcjIgfCBudWxsO1xuICBwdWJsaWMgYk1heCE6IFZlY3RvcjIgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gYVxuICAgKiBAcGFyYW0gYlxuICAgKiBAcGFyYW0gYXRNaW4gLSBMb3dlciB0IHZhbHVlIGZvciB0aGUgcmVnaW9uIG9mIHRoZSAnYScgc2VnbWVudFxuICAgKiBAcGFyYW0gYXRNYXggLSBIaWdoZXIgdCB2YWx1ZSBmb3IgdGhlIHJlZ2lvbiBvZiB0aGUgJ2EnIHNlZ21lbnRcbiAgICogQHBhcmFtIGJ0TWluIC0gTG93ZXIgdCB2YWx1ZSBmb3IgdGhlIHJlZ2lvbiBvZiB0aGUgJ2InIHNlZ21lbnRcbiAgICogQHBhcmFtIGJ0TWF4IC0gSGlnaGVyIHQgdmFsdWUgZm9yIHRoZSByZWdpb24gb2YgdGhlICdiJyBzZWdtZW50XG4gICAqIEBwYXJhbSBhTWluIC0gTG9jYXRpb24gb2YgdGhlIGxvd2VyIHQgdmFsdWUgZm9yIHRoZSAnYScgc2VnbWVudCdzIHJlZ2lvblxuICAgKiBAcGFyYW0gYU1heCAtIExvY2F0aW9uIG9mIHRoZSBoaWdoZXIgdCB2YWx1ZSBmb3IgdGhlICdhJyBzZWdtZW50J3MgcmVnaW9uXG4gICAqIEBwYXJhbSBiTWluIC0gTG9jYXRpb24gb2YgdGhlIGxvd2VyIHQgdmFsdWUgZm9yIHRoZSAnYicgc2VnbWVudCdzIHJlZ2lvblxuICAgKiBAcGFyYW0gYk1heCAtIExvY2F0aW9uIG9mIHRoZSBoaWdoZXIgdCB2YWx1ZSBmb3IgdGhlICdiJyBzZWdtZW50J3MgcmVnaW9uXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGE6IFNlZ21lbnQsIGI6IFNlZ21lbnQsIGF0TWluOiBudW1iZXIsIGF0TWF4OiBudW1iZXIsIGJ0TWluOiBudW1iZXIsIGJ0TWF4OiBudW1iZXIsIGFNaW46IFZlY3RvcjIsIGFNYXg6IFZlY3RvcjIsIGJNaW46IFZlY3RvcjIsIGJNYXg6IFZlY3RvcjIgKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCBhLCBiLCBhdE1pbiwgYXRNYXgsIGJ0TWluLCBidE1heCwgYU1pbiwgYU1heCwgYk1pbiwgYk1heCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhXG4gICAqIEBwYXJhbSBiXG4gICAqIEBwYXJhbSBhdE1pbiAtIExvd2VyIHQgdmFsdWUgZm9yIHRoZSByZWdpb24gb2YgdGhlICdhJyBzZWdtZW50XG4gICAqIEBwYXJhbSBhdE1heCAtIEhpZ2hlciB0IHZhbHVlIGZvciB0aGUgcmVnaW9uIG9mIHRoZSAnYScgc2VnbWVudFxuICAgKiBAcGFyYW0gYnRNaW4gLSBMb3dlciB0IHZhbHVlIGZvciB0aGUgcmVnaW9uIG9mIHRoZSAnYicgc2VnbWVudFxuICAgKiBAcGFyYW0gYnRNYXggLSBIaWdoZXIgdCB2YWx1ZSBmb3IgdGhlIHJlZ2lvbiBvZiB0aGUgJ2InIHNlZ21lbnRcbiAgICogQHBhcmFtIGFNaW4gLSBMb2NhdGlvbiBvZiB0aGUgbG93ZXIgdCB2YWx1ZSBmb3IgdGhlICdhJyBzZWdtZW50J3MgcmVnaW9uXG4gICAqIEBwYXJhbSBhTWF4IC0gTG9jYXRpb24gb2YgdGhlIGhpZ2hlciB0IHZhbHVlIGZvciB0aGUgJ2EnIHNlZ21lbnQncyByZWdpb25cbiAgICogQHBhcmFtIGJNaW4gLSBMb2NhdGlvbiBvZiB0aGUgbG93ZXIgdCB2YWx1ZSBmb3IgdGhlICdiJyBzZWdtZW50J3MgcmVnaW9uXG4gICAqIEBwYXJhbSBiTWF4IC0gTG9jYXRpb24gb2YgdGhlIGhpZ2hlciB0IHZhbHVlIGZvciB0aGUgJ2InIHNlZ21lbnQncyByZWdpb25cbiAgICogQHJldHVybnMgLSAgVGhpcyByZWZlcmVuY2UgZm9yIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgaW5pdGlhbGl6ZSggYTogU2VnbWVudCwgYjogU2VnbWVudCwgYXRNaW46IG51bWJlciwgYXRNYXg6IG51bWJlciwgYnRNaW46IG51bWJlciwgYnRNYXg6IG51bWJlciwgYU1pbjogVmVjdG9yMiwgYU1heDogVmVjdG9yMiwgYk1pbjogVmVjdG9yMiwgYk1heDogVmVjdG9yMiApOiBCb3VuZHNJbnRlcnNlY3Rpb24ge1xuXG4gICAgdGhpcy5hID0gYTtcbiAgICB0aGlzLmIgPSBiO1xuICAgIHRoaXMuYXRNaW4gPSBhdE1pbjtcbiAgICB0aGlzLmF0TWF4ID0gYXRNYXg7XG4gICAgdGhpcy5idE1pbiA9IGJ0TWluO1xuICAgIHRoaXMuYnRNYXggPSBidE1heDtcbiAgICB0aGlzLmFNaW4gPSBhTWluO1xuICAgIHRoaXMuYU1heCA9IGFNYXg7XG4gICAgdGhpcy5iTWluID0gYk1pbjtcbiAgICB0aGlzLmJNYXggPSBiTWF4O1xuXG4gICAgcmV0dXJuIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHNJbnRlcnNlY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBzdWJkaXZpc2lvbiBvZiB0aGUgcmVnaW9ucyBpbnRvIDIgZm9yIHRoZSAnYScgc2VnbWVudCBhbmQgMiBmb3IgdGhlICdiJyBzZWdtZW50LCB0aGVuIHB1c2hlcyBhbnlcbiAgICogaW50ZXJzZWN0aW5nIGJvdW5kaW5nIGJveCByZWdpb25zIChiZXR3ZWVuICdhJyBhbmQgJ2InKSB0byB0aGUgYXJyYXkuXG4gICAqL1xuICBwcml2YXRlIHB1c2hTdWJkaXZpc2lvbnMoIGludGVyc2VjdGlvbnM6IEJvdW5kc0ludGVyc2VjdGlvbltdICk6IHZvaWQge1xuXG4gICAgLy8gV2UgYXJlIG5vdCBpbiB0aGUgcG9vbCwgc28gb3VyIHRoaW5ncyBhcmVuJ3QgbnVsbFxuICAgIGNvbnN0IHRoaXNBY3RpdmUgPSB0aGlzIGFzIHVua25vd24gYXMgQWN0aXZlQm91bmRzSW50ZXJzZWN0aW9uO1xuXG4gICAgY29uc3QgYXRNaWQgPSAoIHRoaXNBY3RpdmUuYXRNYXggKyB0aGlzQWN0aXZlLmF0TWluICkgLyAyO1xuICAgIGNvbnN0IGJ0TWlkID0gKCB0aGlzQWN0aXZlLmJ0TWF4ICsgdGhpc0FjdGl2ZS5idE1pbiApIC8gMjtcblxuICAgIC8vIElmIHdlIHJlYWNoZWQgdGhlIHBvaW50IHdoZXJlIG5vIGhpZ2hlciBwcmVjaXNpb24gY2FuIGJlIG9idGFpbmVkLCByZXR1cm4gdGhlIGdpdmVuIGludGVyc2VjdGlvblxuICAgIGlmICggYXRNaWQgPT09IHRoaXMuYXRNaW4gfHwgYXRNaWQgPT09IHRoaXMuYXRNYXggfHwgYnRNaWQgPT09IHRoaXMuYnRNaW4gfHwgYnRNaWQgPT09IHRoaXMuYnRNYXggKSB7XG4gICAgICBpbnRlcnNlY3Rpb25zLnB1c2goIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHNJbnRlcnNlY3Rpb24gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYU1pZCA9IHRoaXNBY3RpdmUuYS5wb3NpdGlvbkF0KCBhdE1pZCApO1xuICAgIGNvbnN0IGJNaWQgPSB0aGlzQWN0aXZlLmIucG9zaXRpb25BdCggYnRNaWQgKTtcblxuICAgIGlmICggQm91bmRzSW50ZXJzZWN0aW9uLmJveEludGVyc2VjdHMoIHRoaXNBY3RpdmUuYU1pbiwgYU1pZCwgdGhpc0FjdGl2ZS5iTWluLCBiTWlkICkgKSB7XG4gICAgICBpbnRlcnNlY3Rpb25zLnB1c2goIEJvdW5kc0ludGVyc2VjdGlvbi5wb29sLmNyZWF0ZShcbiAgICAgICAgdGhpc0FjdGl2ZS5hLCB0aGlzQWN0aXZlLmIsIHRoaXNBY3RpdmUuYXRNaW4sIGF0TWlkLCB0aGlzQWN0aXZlLmJ0TWluLCBidE1pZCwgdGhpc0FjdGl2ZS5hTWluLCBhTWlkLCB0aGlzQWN0aXZlLmJNaW4sIGJNaWRcbiAgICAgICkgKTtcbiAgICB9XG4gICAgaWYgKCBCb3VuZHNJbnRlcnNlY3Rpb24uYm94SW50ZXJzZWN0cyggYU1pZCwgdGhpc0FjdGl2ZS5hTWF4LCB0aGlzQWN0aXZlLmJNaW4sIGJNaWQgKSApIHtcbiAgICAgIGludGVyc2VjdGlvbnMucHVzaCggQm91bmRzSW50ZXJzZWN0aW9uLnBvb2wuY3JlYXRlKFxuICAgICAgICB0aGlzQWN0aXZlLmEsIHRoaXNBY3RpdmUuYiwgYXRNaWQsIHRoaXNBY3RpdmUuYXRNYXgsIHRoaXNBY3RpdmUuYnRNaW4sIGJ0TWlkLCBhTWlkLCB0aGlzQWN0aXZlLmFNYXgsIHRoaXNBY3RpdmUuYk1pbiwgYk1pZFxuICAgICAgKSApO1xuICAgIH1cbiAgICBpZiAoIEJvdW5kc0ludGVyc2VjdGlvbi5ib3hJbnRlcnNlY3RzKCB0aGlzQWN0aXZlLmFNaW4sIGFNaWQsIGJNaWQsIHRoaXNBY3RpdmUuYk1heCApICkge1xuICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKCBCb3VuZHNJbnRlcnNlY3Rpb24ucG9vbC5jcmVhdGUoXG4gICAgICAgIHRoaXNBY3RpdmUuYSwgdGhpc0FjdGl2ZS5iLCB0aGlzQWN0aXZlLmF0TWluLCBhdE1pZCwgYnRNaWQsIHRoaXNBY3RpdmUuYnRNYXgsIHRoaXNBY3RpdmUuYU1pbiwgYU1pZCwgYk1pZCwgdGhpc0FjdGl2ZS5iTWF4XG4gICAgICApICk7XG4gICAgfVxuICAgIGlmICggQm91bmRzSW50ZXJzZWN0aW9uLmJveEludGVyc2VjdHMoIGFNaWQsIHRoaXNBY3RpdmUuYU1heCwgYk1pZCwgdGhpc0FjdGl2ZS5iTWF4ICkgKSB7XG4gICAgICBpbnRlcnNlY3Rpb25zLnB1c2goIEJvdW5kc0ludGVyc2VjdGlvbi5wb29sLmNyZWF0ZShcbiAgICAgICAgdGhpc0FjdGl2ZS5hLCB0aGlzQWN0aXZlLmIsIGF0TWlkLCB0aGlzQWN0aXZlLmF0TWF4LCBidE1pZCwgdGhpc0FjdGl2ZS5idE1heCwgYU1pZCwgdGhpc0FjdGl2ZS5hTWF4LCBiTWlkLCB0aGlzQWN0aXZlLmJNYXhcbiAgICAgICkgKTtcbiAgICB9XG5cbiAgICAoIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHNJbnRlcnNlY3Rpb24gKS5mcmVlVG9Qb29sKCk7XG4gIH1cblxuICAvKipcbiAgICogQSBtZWFzdXJlIG9mIGRpc3RhbmNlIGJldHdlZW4gdGhpcyBhbmQgYW5vdGhlciBpbnRlcnNlY3Rpb24uXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2UoIG90aGVySW50ZXJzZWN0aW9uOiBCb3VuZHNJbnRlcnNlY3Rpb24gKTogbnVtYmVyIHtcbiAgICBjb25zdCBkYU1pbiA9IHRoaXMuYXRNaW4gLSBvdGhlckludGVyc2VjdGlvbi5hdE1pbjtcbiAgICBjb25zdCBkYU1heCA9IHRoaXMuYXRNYXggLSBvdGhlckludGVyc2VjdGlvbi5hdE1heDtcbiAgICBjb25zdCBkYk1pbiA9IHRoaXMuYnRNaW4gLSBvdGhlckludGVyc2VjdGlvbi5idE1pbjtcbiAgICBjb25zdCBkYk1heCA9IHRoaXMuYnRNYXggLSBvdGhlckludGVyc2VjdGlvbi5idE1heDtcbiAgICByZXR1cm4gZGFNaW4gKiBkYU1pbiArIGRhTWF4ICogZGFNYXggKyBkYk1pbiAqIGRiTWluICsgZGJNYXggKiBkYk1heDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHJlZmVyZW5jZXMgKHNvIGl0IGNhbiBhbGxvdyBvdGhlciBvYmplY3RzIHRvIGJlIEdDJ2VkIG9yIHBvb2xlZClcbiAgICovXG4gIHB1YmxpYyBjbGVhbigpOiB2b2lkIHtcbiAgICB0aGlzLmEgPSBudWxsO1xuICAgIHRoaXMuYiA9IG51bGw7XG4gICAgdGhpcy5hTWluID0gbnVsbDtcbiAgICB0aGlzLmFNYXggPSBudWxsO1xuICAgIHRoaXMuYk1pbiA9IG51bGw7XG4gICAgdGhpcy5iTWF4ID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgKGZpbml0ZSkgcG9pbnRzIG9mIGludGVyc2VjdGlvbiBiZXR3ZWVuIHR3byBhcmJpdHJhcnkgc2VnbWVudHMuXG4gICAqXG4gICAqIERvZXMgcmVwZWF0ZWQgc3ViZGl2aXNpb24gYW5kIGV4Y2x1ZGVzIGEtYiByZWdpb24gcGFpcnMgdGhhdCBkb24ndCBpbnRlcnNlY3QuIERvaW5nIHRoaXMgcmVwZWF0ZWRseSBuYXJyb3dzIGRvd25cbiAgICogaW50ZXJzZWN0aW9ucywgdG8gdGhlIHBvaW50IHRoYXQgdGhleSBjYW4gYmUgY29tYmluZWQgZm9yIGEgZmFpcmx5IGFjY3VyYXRlIGFuc3dlci5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaW50ZXJzZWN0KCBhOiBTZWdtZW50LCBiOiBTZWdtZW50ICk6IFNlZ21lbnRJbnRlcnNlY3Rpb25bXSB7XG4gICAgaWYgKCAhYS5ib3VuZHMuaW50ZXJzZWN0c0JvdW5kcyggYi5ib3VuZHMgKSApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBpbnRlcnNlY3Rpb25zID0gQm91bmRzSW50ZXJzZWN0aW9uLmdldEludGVyc2VjdGlvblJhbmdlcyggYSwgYiApO1xuXG4gICAgLy8gR3JvdXAgdG9nZXRoZXIgaW50ZXJzZWN0aW9ucyB0aGF0IGFyZSB2ZXJ5IGNsb3NlIChpbiBwYXJhbWV0cmljIHZhbHVlIHNwYWNlKSBzbyB3ZSBjYW4gb25seSByZXR1cm5cbiAgICAvLyBvbmUgaW50ZXJzZWN0aW9uIChhdmVyYWdlZCB2YWx1ZSkgZm9yIHRoZW0uXG4gICAgY29uc3QgZ3JvdXBzID0gW107XG5cbiAgICAvLyBOT1RFOiBEb2Vzbid0IGhhdmUgdG8gYmUgdGhlIGZhc3Rlc3QsIHdvbid0IGJlIGEgY3JhenkgaHVnZSBhbW91bnQgb2YgdGhlc2UgdW5sZXNzIHNvbWV0aGluZyB3ZW50XG4gICAgLy8gICAgICAgc2VyaW91c2x5IHdyb25nIChkZWdlbmVyYXRlIGNhc2U/KVxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGludGVyc2VjdGlvbnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBpbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb25zWyBpIF07XG4gICAgICBsZXQgd2FzQWRkZWQgPSBmYWxzZTtcbiAgICAgIG5leHRDb21wYXJpc29uOiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxhYmVsc1xuICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBncm91cHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgY29uc3QgZ3JvdXAgPSBncm91cHNbIGogXTtcbiAgICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBncm91cC5sZW5ndGg7IGsrKyApIHtcbiAgICAgICAgICAgIGNvbnN0IG90aGVySW50ZXJzZWN0aW9uID0gZ3JvdXBbIGsgXTtcbiAgICAgICAgICAgIGlmICggaW50ZXJzZWN0aW9uLmRpc3RhbmNlKCBvdGhlckludGVyc2VjdGlvbiApIDwgMWUtMTMgKSB7XG4gICAgICAgICAgICAgIGdyb3VwLnB1c2goIGludGVyc2VjdGlvbiApO1xuICAgICAgICAgICAgICB3YXNBZGRlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrIG5leHRDb21wYXJpc29uOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxhYmVsc1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgaWYgKCAhd2FzQWRkZWQgKSB7XG4gICAgICAgIGdyb3Vwcy5wdXNoKCBbIGludGVyc2VjdGlvbiBdICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0czogU2VnbWVudEludGVyc2VjdGlvbltdID0gW107XG5cbiAgICAvLyBGb3IgZWFjaCBncm91cCwgYXZlcmFnZSBpdHMgcGFyYW1ldHJpYyB2YWx1ZXMsIGFuZCBjcmVhdGUgYSBcInJlc3VsdCBpbnRlcnNlY3Rpb25cIiBmcm9tIGl0LlxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGdyb3Vwcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGdyb3VwID0gZ3JvdXBzWyBpIF07XG5cbiAgICAgIGxldCBhVCA9IDA7XG4gICAgICBsZXQgYlQgPSAwO1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgZ3JvdXAubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGFUICs9IGdyb3VwWyBqIF0uYXRNaW4gKyBncm91cFsgaiBdLmF0TWF4O1xuICAgICAgICBiVCArPSBncm91cFsgaiBdLmJ0TWluICsgZ3JvdXBbIGogXS5idE1heDtcbiAgICAgIH1cbiAgICAgIGFUIC89IDIgKiBncm91cC5sZW5ndGg7XG4gICAgICBiVCAvPSAyICogZ3JvdXAubGVuZ3RoO1xuXG4gICAgICBjb25zdCBwb3NpdGlvbkEgPSBhLnBvc2l0aW9uQXQoIGFUICk7XG4gICAgICBjb25zdCBwb3NpdGlvbkIgPSBiLnBvc2l0aW9uQXQoIGJUICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3NpdGlvbkEuZGlzdGFuY2UoIHBvc2l0aW9uQiApIDwgMWUtMTAgKTtcblxuICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggcG9zaXRpb25BLmF2ZXJhZ2UoIHBvc2l0aW9uQiApLCBhVCwgYlQgKSApO1xuICAgIH1cblxuICAgIC8vIENsZWFuIHVwXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaW50ZXJzZWN0aW9ucy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGludGVyc2VjdGlvbnNbIGkgXS5mcmVlVG9Qb29sKCk7XG4gICAgfVxuICAgIEJvdW5kc0ludGVyc2VjdGlvbi5jbGVhblBvb2woKTtcblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIHR3byBzZWdtZW50cywgcmV0dXJucyBhbiBhcnJheSBvZiBjYW5kaWRhdGUgaW50ZXJzZWN0aW9uIHJhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldEludGVyc2VjdGlvblJhbmdlcyggYTogU2VnbWVudCwgYjogU2VnbWVudCApOiBCb3VuZHNJbnRlcnNlY3Rpb25bXSB7XG4gICAgLy8gSW50ZXJuYWwgdC12YWx1ZXMgdGhhdCBoYXZlIGEgbG9jYWwgbWluL21heCBpbiBhdCBsZWFzdCBvbmUgY29vcmRpbmF0ZS4gV2UnbGwgc3BsaXQgYmFzZWQgb24gdGhlc2UsIHNvIHdlIG9ubHlcbiAgICAvLyBjaGVjayBpbnRlcnNlY3Rpb25zIGJldHdlZW4gbW9ub3RvbmUgc2VnbWVudHMgKHdvbid0IGhhdmUgdG8gY2hlY2sgc2VsZi1pbnRlcnNlY3Rpb24pLlxuICAgIGNvbnN0IGFFeHRyZW1hID0gYS5nZXRJbnRlcmlvckV4dHJlbWFUcygpO1xuICAgIGNvbnN0IGJFeHRyZW1hID0gYi5nZXRJbnRlcmlvckV4dHJlbWFUcygpO1xuXG4gICAgLy8gVC12YWx1ZSBwYWlyc1xuICAgIGNvbnN0IGFJbnRlcm5hbHMgPSBfLnppcCggWyAwIF0uY29uY2F0KCBhRXh0cmVtYSApLCBhRXh0cmVtYS5jb25jYXQoIFsgMSBdICkgKTtcbiAgICBjb25zdCBiSW50ZXJuYWxzID0gXy56aXAoIFsgMCBdLmNvbmNhdCggYkV4dHJlbWEgKSwgYkV4dHJlbWEuY29uY2F0KCBbIDEgXSApICk7XG5cbiAgICAvLyBTZXQgdXAgaW5pdGlhbCBjYW5kaWRhdGUgaW50ZXJzZWN0aW9uIHJhbmdlc1xuICAgIGxldCBpbnRlcnNlY3Rpb25zID0gW107XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYUludGVybmFscy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGJJbnRlcm5hbHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGNvbnN0IGF0TWluID0gYUludGVybmFsc1sgaSBdWyAwIF0hO1xuICAgICAgICBjb25zdCBhdE1heCA9IGFJbnRlcm5hbHNbIGkgXVsgMSBdITtcbiAgICAgICAgY29uc3QgYnRNaW4gPSBiSW50ZXJuYWxzWyBqIF1bIDAgXSE7XG4gICAgICAgIGNvbnN0IGJ0TWF4ID0gYkludGVybmFsc1sgaiBdWyAxIF0hO1xuICAgICAgICBjb25zdCBhTWluID0gYS5wb3NpdGlvbkF0KCBhdE1pbiApO1xuICAgICAgICBjb25zdCBhTWF4ID0gYS5wb3NpdGlvbkF0KCBhdE1heCApO1xuICAgICAgICBjb25zdCBiTWluID0gYi5wb3NpdGlvbkF0KCBidE1pbiApO1xuICAgICAgICBjb25zdCBiTWF4ID0gYi5wb3NpdGlvbkF0KCBidE1heCApO1xuICAgICAgICBpZiAoIEJvdW5kc0ludGVyc2VjdGlvbi5ib3hJbnRlcnNlY3RzKCBhTWluLCBhTWF4LCBiTWluLCBiTWF4ICkgKSB7XG4gICAgICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKCBCb3VuZHNJbnRlcnNlY3Rpb24ucG9vbC5jcmVhdGUoXG4gICAgICAgICAgICBhLCBiLCBhdE1pbiwgYXRNYXgsIGJ0TWluLCBidE1heCwgYU1pbiwgYU1heCwgYk1pbiwgYk1heFxuICAgICAgICAgICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN1YmRpdmlkZSBjb250aW51b3VzbHlcbiAgICAvLyBUT0RPOiBpcyA1MCB0aGUgcHJvcGVyIG51bWJlciBvZiBpdGVyYXRpb25zPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCA1MDsgaSsrICkge1xuICAgICAgY29uc3QgbmV3SW50ZXJzZWN0aW9uczogQm91bmRzSW50ZXJzZWN0aW9uW10gPSBbXTtcbiAgICAgIGZvciAoIGxldCBqID0gaW50ZXJzZWN0aW9ucy5sZW5ndGggLSAxOyBqID49IDA7IGotLSApIHtcbiAgICAgICAgaW50ZXJzZWN0aW9uc1sgaiBdLnB1c2hTdWJkaXZpc2lvbnMoIG5ld0ludGVyc2VjdGlvbnMgKTtcbiAgICAgIH1cbiAgICAgIGludGVyc2VjdGlvbnMgPSBuZXdJbnRlcnNlY3Rpb25zO1xuICAgIH1cblxuICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIHRoZSBlbmRwb2ludHMgb2YgdHdvIG1vbm90b25lIHNlZ21lbnQgcmVnaW9ucywgcmV0dXJucyB3aGV0aGVyIHRoZWlyIGJvdW5kaW5nIGJveGVzIGludGVyc2VjdC5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGJveEludGVyc2VjdHMoIGFNaW46IFZlY3RvcjIsIGFNYXg6IFZlY3RvcjIsIGJNaW46IFZlY3RvcjIsIGJNYXg6IFZlY3RvcjIgKTogYm9vbGVhbiB7XG5cbiAgICAvLyBlLmcuIEJvdW5kczIuaW5jbHVkZUJvdW5kc1xuICAgIGNvbnN0IG1pblggPSBNYXRoLm1heCggTWF0aC5taW4oIGFNaW4ueCwgYU1heC54ICksIE1hdGgubWluKCBiTWluLngsIGJNYXgueCApICk7XG4gICAgY29uc3QgbWluWSA9IE1hdGgubWF4KCBNYXRoLm1pbiggYU1pbi55LCBhTWF4LnkgKSwgTWF0aC5taW4oIGJNaW4ueSwgYk1heC55ICkgKTtcbiAgICBjb25zdCBtYXhYID0gTWF0aC5taW4oIE1hdGgubWF4KCBhTWluLngsIGFNYXgueCApLCBNYXRoLm1heCggYk1pbi54LCBiTWF4LnggKSApO1xuICAgIGNvbnN0IG1heFkgPSBNYXRoLm1pbiggTWF0aC5tYXgoIGFNaW4ueSwgYU1heC55ICksIE1hdGgubWF4KCBiTWluLnksIGJNYXgueSApICk7XG4gICAgcmV0dXJuICggbWF4WCAtIG1pblggKSA+PSAwICYmICggbWF4WSAtIG1pblkgPj0gMCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpbmNlIHdlJ2xsIGJ1cm4gdGhyb3VnaCBhIGxvdCBvZiBwb29sZWQgaW5zdGFuY2VzLCB3ZSBvbmx5IHJlbW92ZSBleHRlcm5hbCByZWZlcmVuY2VzIGZ1bGx5IG9uY2UgdGhlIGZ1bGxcbiAgICogcHJvY2VzcyBpcyBkb25lLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2xlYW5Qb29sKCk6IHZvaWQge1xuICAgIEJvdW5kc0ludGVyc2VjdGlvbi5wb29sLmZvckVhY2goIGludGVyc2VjdGlvbiA9PiBpbnRlcnNlY3Rpb24uY2xlYW4oKSApO1xuICB9XG5cbiAgcHVibGljIGZyZWVUb1Bvb2woKTogdm9pZCB7XG4gICAgQm91bmRzSW50ZXJzZWN0aW9uLnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIEJvdW5kc0ludGVyc2VjdGlvbiApO1xufVxuXG5raXRlLnJlZ2lzdGVyKCAnQm91bmRzSW50ZXJzZWN0aW9uJywgQm91bmRzSW50ZXJzZWN0aW9uICk7Il0sIm5hbWVzIjpbIlBvb2wiLCJraXRlIiwiU2VnbWVudEludGVyc2VjdGlvbiIsIkJvdW5kc0ludGVyc2VjdGlvbiIsImluaXRpYWxpemUiLCJhIiwiYiIsImF0TWluIiwiYXRNYXgiLCJidE1pbiIsImJ0TWF4IiwiYU1pbiIsImFNYXgiLCJiTWluIiwiYk1heCIsInB1c2hTdWJkaXZpc2lvbnMiLCJpbnRlcnNlY3Rpb25zIiwidGhpc0FjdGl2ZSIsImF0TWlkIiwiYnRNaWQiLCJwdXNoIiwiYU1pZCIsInBvc2l0aW9uQXQiLCJiTWlkIiwiYm94SW50ZXJzZWN0cyIsInBvb2wiLCJjcmVhdGUiLCJmcmVlVG9Qb29sIiwiZGlzdGFuY2UiLCJvdGhlckludGVyc2VjdGlvbiIsImRhTWluIiwiZGFNYXgiLCJkYk1pbiIsImRiTWF4IiwiY2xlYW4iLCJpbnRlcnNlY3QiLCJib3VuZHMiLCJpbnRlcnNlY3RzQm91bmRzIiwiZ2V0SW50ZXJzZWN0aW9uUmFuZ2VzIiwiZ3JvdXBzIiwiaSIsImxlbmd0aCIsImludGVyc2VjdGlvbiIsIndhc0FkZGVkIiwibmV4dENvbXBhcmlzb24iLCJqIiwiZ3JvdXAiLCJrIiwicmVzdWx0cyIsImFUIiwiYlQiLCJwb3NpdGlvbkEiLCJwb3NpdGlvbkIiLCJhc3NlcnQiLCJhdmVyYWdlIiwiY2xlYW5Qb29sIiwiYUV4dHJlbWEiLCJnZXRJbnRlcmlvckV4dHJlbWFUcyIsImJFeHRyZW1hIiwiYUludGVybmFscyIsIl8iLCJ6aXAiLCJjb25jYXQiLCJiSW50ZXJuYWxzIiwibmV3SW50ZXJzZWN0aW9ucyIsIm1pblgiLCJNYXRoIiwibWF4IiwibWluIiwieCIsIm1pblkiLCJ5IiwibWF4WCIsIm1heFkiLCJmb3JFYWNoIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBR0QsT0FBT0EsVUFBVSxnQ0FBZ0M7QUFDakQsU0FBU0MsSUFBSSxFQUFXQyxtQkFBbUIsUUFBUSxnQkFBZ0I7QUFNcEQsSUFBQSxBQUFNQyxxQkFBTixNQUFNQTtJQWlDbkI7Ozs7Ozs7Ozs7OztHQVlDLEdBQ0QsQUFBT0MsV0FBWUMsQ0FBVSxFQUFFQyxDQUFVLEVBQUVDLEtBQWEsRUFBRUMsS0FBYSxFQUFFQyxLQUFhLEVBQUVDLEtBQWEsRUFBRUMsSUFBYSxFQUFFQyxJQUFhLEVBQUVDLElBQWEsRUFBRUMsSUFBYSxFQUF1QjtRQUV0TCxJQUFJLENBQUNULENBQUMsR0FBR0E7UUFDVCxJQUFJLENBQUNDLENBQUMsR0FBR0E7UUFDVCxJQUFJLENBQUNDLEtBQUssR0FBR0E7UUFDYixJQUFJLENBQUNDLEtBQUssR0FBR0E7UUFDYixJQUFJLENBQUNDLEtBQUssR0FBR0E7UUFDYixJQUFJLENBQUNDLEtBQUssR0FBR0E7UUFDYixJQUFJLENBQUNDLElBQUksR0FBR0E7UUFDWixJQUFJLENBQUNDLElBQUksR0FBR0E7UUFDWixJQUFJLENBQUNDLElBQUksR0FBR0E7UUFDWixJQUFJLENBQUNDLElBQUksR0FBR0E7UUFFWixPQUFPLElBQUk7SUFDYjtJQUVBOzs7R0FHQyxHQUNELEFBQVFDLGlCQUFrQkMsYUFBbUMsRUFBUztRQUVwRSxvREFBb0Q7UUFDcEQsTUFBTUMsYUFBYSxJQUFJO1FBRXZCLE1BQU1DLFFBQVEsQUFBRUQsQ0FBQUEsV0FBV1QsS0FBSyxHQUFHUyxXQUFXVixLQUFLLEFBQUQsSUFBTTtRQUN4RCxNQUFNWSxRQUFRLEFBQUVGLENBQUFBLFdBQVdQLEtBQUssR0FBR08sV0FBV1Is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