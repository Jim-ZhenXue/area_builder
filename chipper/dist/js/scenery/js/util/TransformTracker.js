// Copyright 2015-2022, University of Colorado Boulder
/**
 * Used for identifying when any ancestor transform of a node in a trail causes that node's global transform to change.
 * It also provides fast computation of that global matrix, NOT recomputing every matrix, even on most transform
 * changes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Jesse Greenberg
 */ import Matrix3 from '../../../dot/js/Matrix3.js';
import optionize from '../../../phet-core/js/optionize.js';
import { scenery } from '../imports.js';
let TransformTracker = class TransformTracker {
    /**
   * Gets rid of all external references and listeners. This object is inoperable afterwards.
   */ dispose() {
        for(let j = 1; j < this.trail.length; j++){
            const nodeTransformListener = this._nodeTransformListeners[j - 1];
            if (this.trail.nodes[j].transformEmitter.hasListener(nodeTransformListener)) {
                this.trail.nodes[j].transformEmitter.removeListener(nodeTransformListener);
            }
        }
    }
    /**
   * Adds a listener function that will be synchronously called whenever the transform for this Trail changes.
   */ addListener(listener) {
        this._listeners.push(listener);
    }
    /**
   * Removes a listener that was previously added with addListener().
   */ removeListener(listener) {
        const index = _.indexOf(this._listeners, listener);
        assert && assert(index >= 0, 'TransformTracker listener not found');
        this._listeners.splice(index, 1);
    }
    /**
   * Notifies listeners of a transform change.
   */ notifyListeners() {
        let listeners = this._listeners;
        if (!this._isStatic) {
            listeners = listeners.slice();
        }
        const length = listeners.length;
        for(let i = 0; i < length; i++){
            listeners[i]();
        }
    }
    /**
   * Called when one of the nodes' transforms is changed.
   *
   * @param matrixIndex - The index into our matrices array, e.g. this._matrices[ matrixIndex ].
   */ onTransformChange(matrixIndex) {
        this._dirtyIndex = Math.min(this._dirtyIndex, matrixIndex);
        this.notifyListeners();
    }
    /**
   * Returns the local-to-global transformation matrix for the Trail, which transforms its leaf node's local
   * coordinate frame into the global coordinate frame.
   *
   * NOTE: The matrix returned should not be mutated. Please make a copy if needed.
   */ getMatrix() {
        if (this._matrices === null) {
            this._matrices = [];
            // Start at 1, so that we don't include the root node's transform
            for(let i = 1; i < this.trail.length; i++){
                this._matrices.push(new Matrix3());
            }
        }
        // If the trail isn't long enough to have a transform, return the identity matrix
        if (this._matrices.length <= 0) {
            return Matrix3.IDENTITY;
        }
        // Starting at the dirty index, recompute matrices.
        const numMatrices = this._matrices.length;
        for(let index = this._dirtyIndex; index < numMatrices; index++){
            const nodeMatrix = this.trail.nodes[index + 1].matrix;
            if (index === 0) {
                this._matrices[index].set(nodeMatrix);
            } else {
                this._matrices[index].set(this._matrices[index - 1]);
                this._matrices[index].multiplyMatrix(nodeMatrix);
            }
        }
        // Reset the dirty index to mark all matrices as 'clean'.
        this._dirtyIndex = numMatrices;
        // Return the last matrix, which contains our composite transformation.
        return this._matrices[numMatrices - 1];
    }
    get matrix() {
        return this.getMatrix();
    }
    /**
   * Creates a transform-tracking object, where it can send out updates on transform changes, and also efficiently
   * compute the transform.
   */ constructor(trail, providedOptions){
        // this._matrices[ i ] will be equal to: trail.nodes[ 1 ].matrix * ... * trail.nodes[ i + 1 ].matrix
        // Will be initialized on first need.
        this._matrices = null;
        // this._matrices[ i ] where i >= this._dirtyIndex will need to be recomputed
        this._dirtyIndex = 0;
        // Listeners added by client, will be called on transform changes.
        this._listeners = [];
        // Listeners to each Node in the trail (so we are notified of changes). Will be removed on disposal.
        this._nodeTransformListeners = [];
        const options = optionize()({
            isStatic: false
        }, providedOptions);
        this._isStatic = options.isStatic;
        this.trail = trail;
        // Hook up listeners to each Node in the trail
        this._nodeTransformListeners = [];
        for(let j = 1; j < this.trail.length; j++){
            // Wrapping with closure to prevent changes
            const nodeTransformListener = ((index)=>()=>{
                    this.onTransformChange(index);
                })(j - 1);
            this._nodeTransformListeners.push(nodeTransformListener);
            trail.nodes[j].transformEmitter.addListener(nodeTransformListener);
        }
    }
};
scenery.register('TransformTracker', TransformTracker);
export default TransformTracker;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9UcmFuc2Zvcm1UcmFja2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFVzZWQgZm9yIGlkZW50aWZ5aW5nIHdoZW4gYW55IGFuY2VzdG9yIHRyYW5zZm9ybSBvZiBhIG5vZGUgaW4gYSB0cmFpbCBjYXVzZXMgdGhhdCBub2RlJ3MgZ2xvYmFsIHRyYW5zZm9ybSB0byBjaGFuZ2UuXG4gKiBJdCBhbHNvIHByb3ZpZGVzIGZhc3QgY29tcHV0YXRpb24gb2YgdGhhdCBnbG9iYWwgbWF0cml4LCBOT1QgcmVjb21wdXRpbmcgZXZlcnkgbWF0cml4LCBldmVuIG9uIG1vc3QgdHJhbnNmb3JtXG4gKiBjaGFuZ2VzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IHNjZW5lcnksIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIC8vIFdoZXRoZXIgdGhlIGJvdW5kcyBsaXN0ZW5lcnMgc2hvdWxkIGJlIGFkZGVkIHdpdGggb24oKSBvciBvblN0YXRpYygpLlxuICBpc1N0YXRpYz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBUcmFuc2Zvcm1UcmFja2VyT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xuXG5jbGFzcyBUcmFuc2Zvcm1UcmFja2VyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IHRyYWlsOiBUcmFpbDtcblxuICAvLyB0aGlzLl9tYXRyaWNlc1sgaSBdIHdpbGwgYmUgZXF1YWwgdG86IHRyYWlsLm5vZGVzWyAxIF0ubWF0cml4ICogLi4uICogdHJhaWwubm9kZXNbIGkgKyAxIF0ubWF0cml4XG4gIC8vIFdpbGwgYmUgaW5pdGlhbGl6ZWQgb24gZmlyc3QgbmVlZC5cbiAgcHJpdmF0ZSBfbWF0cmljZXM6IE1hdHJpeDNbXSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIHRoaXMuX21hdHJpY2VzWyBpIF0gd2hlcmUgaSA+PSB0aGlzLl9kaXJ0eUluZGV4IHdpbGwgbmVlZCB0byBiZSByZWNvbXB1dGVkXG4gIHByaXZhdGUgX2RpcnR5SW5kZXggPSAwO1xuXG4gIC8vIExpc3RlbmVycyBhZGRlZCBieSBjbGllbnQsIHdpbGwgYmUgY2FsbGVkIG9uIHRyYW5zZm9ybSBjaGFuZ2VzLlxuICBwcml2YXRlIF9saXN0ZW5lcnM6ICggKCkgPT4gdm9pZCApW10gPSBbXTtcblxuICAvLyBMaXN0ZW5lcnMgdG8gZWFjaCBOb2RlIGluIHRoZSB0cmFpbCAoc28gd2UgYXJlIG5vdGlmaWVkIG9mIGNoYW5nZXMpLiBXaWxsIGJlIHJlbW92ZWQgb24gZGlzcG9zYWwuXG4gIHByaXZhdGUgcmVhZG9ubHkgX25vZGVUcmFuc2Zvcm1MaXN0ZW5lcnM6ICggKCkgPT4gdm9pZCApW10gPSBbXTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9pc1N0YXRpYzogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHRyYW5zZm9ybS10cmFja2luZyBvYmplY3QsIHdoZXJlIGl0IGNhbiBzZW5kIG91dCB1cGRhdGVzIG9uIHRyYW5zZm9ybSBjaGFuZ2VzLCBhbmQgYWxzbyBlZmZpY2llbnRseVxuICAgKiBjb21wdXRlIHRoZSB0cmFuc2Zvcm0uXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHRyYWlsOiBUcmFpbCwgcHJvdmlkZWRPcHRpb25zPzogVHJhbnNmb3JtVHJhY2tlck9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFRyYW5zZm9ybVRyYWNrZXJPcHRpb25zLCBTZWxmT3B0aW9ucz4oKSgge1xuICAgICAgaXNTdGF0aWM6IGZhbHNlXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB0aGlzLl9pc1N0YXRpYyA9IG9wdGlvbnMuaXNTdGF0aWM7XG4gICAgdGhpcy50cmFpbCA9IHRyYWlsO1xuXG4gICAgLy8gSG9vayB1cCBsaXN0ZW5lcnMgdG8gZWFjaCBOb2RlIGluIHRoZSB0cmFpbFxuICAgIHRoaXMuX25vZGVUcmFuc2Zvcm1MaXN0ZW5lcnMgPSBbXTtcbiAgICBmb3IgKCBsZXQgaiA9IDE7IGogPCB0aGlzLnRyYWlsLmxlbmd0aDsgaisrICkge1xuICAgICAgLy8gV3JhcHBpbmcgd2l0aCBjbG9zdXJlIHRvIHByZXZlbnQgY2hhbmdlc1xuICAgICAgY29uc3Qgbm9kZVRyYW5zZm9ybUxpc3RlbmVyID0gKCBpbmRleCA9PiAoKSA9PiB7XG4gICAgICAgIHRoaXMub25UcmFuc2Zvcm1DaGFuZ2UoIGluZGV4ICk7XG4gICAgICB9ICkoIGogLSAxICk7XG5cbiAgICAgIHRoaXMuX25vZGVUcmFuc2Zvcm1MaXN0ZW5lcnMucHVzaCggbm9kZVRyYW5zZm9ybUxpc3RlbmVyICk7XG5cbiAgICAgIHRyYWlsLm5vZGVzWyBqIF0udHJhbnNmb3JtRW1pdHRlci5hZGRMaXN0ZW5lciggbm9kZVRyYW5zZm9ybUxpc3RlbmVyICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgcmlkIG9mIGFsbCBleHRlcm5hbCByZWZlcmVuY2VzIGFuZCBsaXN0ZW5lcnMuIFRoaXMgb2JqZWN0IGlzIGlub3BlcmFibGUgYWZ0ZXJ3YXJkcy5cbiAgICovXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGZvciAoIGxldCBqID0gMTsgaiA8IHRoaXMudHJhaWwubGVuZ3RoOyBqKysgKSB7XG4gICAgICBjb25zdCBub2RlVHJhbnNmb3JtTGlzdGVuZXIgPSB0aGlzLl9ub2RlVHJhbnNmb3JtTGlzdGVuZXJzWyBqIC0gMSBdO1xuXG4gICAgICBpZiAoIHRoaXMudHJhaWwubm9kZXNbIGogXS50cmFuc2Zvcm1FbWl0dGVyLmhhc0xpc3RlbmVyKCBub2RlVHJhbnNmb3JtTGlzdGVuZXIgKSApIHtcbiAgICAgICAgdGhpcy50cmFpbC5ub2Rlc1sgaiBdLnRyYW5zZm9ybUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIG5vZGVUcmFuc2Zvcm1MaXN0ZW5lciApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbGlzdGVuZXIgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHN5bmNocm9ub3VzbHkgY2FsbGVkIHdoZW5ldmVyIHRoZSB0cmFuc2Zvcm0gZm9yIHRoaXMgVHJhaWwgY2hhbmdlcy5cbiAgICovXG4gIHB1YmxpYyBhZGRMaXN0ZW5lciggbGlzdGVuZXI6ICgpID0+IHZvaWQgKTogdm9pZCB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2goIGxpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGxpc3RlbmVyIHRoYXQgd2FzIHByZXZpb3VzbHkgYWRkZWQgd2l0aCBhZGRMaXN0ZW5lcigpLlxuICAgKi9cbiAgcHVibGljIHJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lcjogKCkgPT4gdm9pZCApOiB2b2lkIHtcbiAgICBjb25zdCBpbmRleCA9IF8uaW5kZXhPZiggdGhpcy5fbGlzdGVuZXJzLCBsaXN0ZW5lciApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ID49IDAsICdUcmFuc2Zvcm1UcmFja2VyIGxpc3RlbmVyIG5vdCBmb3VuZCcgKTtcblxuICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoIGluZGV4LCAxICk7XG4gIH1cblxuICAvKipcbiAgICogTm90aWZpZXMgbGlzdGVuZXJzIG9mIGEgdHJhbnNmb3JtIGNoYW5nZS5cbiAgICovXG4gIHByaXZhdGUgbm90aWZ5TGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIGxldCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cbiAgICBpZiAoICF0aGlzLl9pc1N0YXRpYyApIHtcbiAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICBsaXN0ZW5lcnNbIGkgXSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBvbmUgb2YgdGhlIG5vZGVzJyB0cmFuc2Zvcm1zIGlzIGNoYW5nZWQuXG4gICAqXG4gICAqIEBwYXJhbSBtYXRyaXhJbmRleCAtIFRoZSBpbmRleCBpbnRvIG91ciBtYXRyaWNlcyBhcnJheSwgZS5nLiB0aGlzLl9tYXRyaWNlc1sgbWF0cml4SW5kZXggXS5cbiAgICovXG4gIHByaXZhdGUgb25UcmFuc2Zvcm1DaGFuZ2UoIG1hdHJpeEluZGV4OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fZGlydHlJbmRleCA9IE1hdGgubWluKCB0aGlzLl9kaXJ0eUluZGV4LCBtYXRyaXhJbmRleCApO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbG9jYWwtdG8tZ2xvYmFsIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBmb3IgdGhlIFRyYWlsLCB3aGljaCB0cmFuc2Zvcm1zIGl0cyBsZWFmIG5vZGUncyBsb2NhbFxuICAgKiBjb29yZGluYXRlIGZyYW1lIGludG8gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxuICAgKlxuICAgKiBOT1RFOiBUaGUgbWF0cml4IHJldHVybmVkIHNob3VsZCBub3QgYmUgbXV0YXRlZC4gUGxlYXNlIG1ha2UgYSBjb3B5IGlmIG5lZWRlZC5cbiAgICovXG4gIHB1YmxpYyBnZXRNYXRyaXgoKTogTWF0cml4MyB7XG4gICAgaWYgKCB0aGlzLl9tYXRyaWNlcyA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuX21hdHJpY2VzID0gW107XG5cbiAgICAgIC8vIFN0YXJ0IGF0IDEsIHNvIHRoYXQgd2UgZG9uJ3QgaW5jbHVkZSB0aGUgcm9vdCBub2RlJ3MgdHJhbnNmb3JtXG4gICAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCB0aGlzLnRyYWlsLmxlbmd0aDsgaSsrICkge1xuICAgICAgICB0aGlzLl9tYXRyaWNlcy5wdXNoKCBuZXcgTWF0cml4MygpICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHRyYWlsIGlzbid0IGxvbmcgZW5vdWdoIHRvIGhhdmUgYSB0cmFuc2Zvcm0sIHJldHVybiB0aGUgaWRlbnRpdHkgbWF0cml4XG4gICAgaWYgKCB0aGlzLl9tYXRyaWNlcy5sZW5ndGggPD0gMCApIHtcbiAgICAgIHJldHVybiBNYXRyaXgzLklERU5USVRZO1xuICAgIH1cblxuICAgIC8vIFN0YXJ0aW5nIGF0IHRoZSBkaXJ0eSBpbmRleCwgcmVjb21wdXRlIG1hdHJpY2VzLlxuICAgIGNvbnN0IG51bU1hdHJpY2VzID0gdGhpcy5fbWF0cmljZXMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpbmRleCA9IHRoaXMuX2RpcnR5SW5kZXg7IGluZGV4IDwgbnVtTWF0cmljZXM7IGluZGV4KysgKSB7XG4gICAgICBjb25zdCBub2RlTWF0cml4ID0gdGhpcy50cmFpbC5ub2Rlc1sgaW5kZXggKyAxIF0ubWF0cml4O1xuXG4gICAgICBpZiAoIGluZGV4ID09PSAwICkge1xuICAgICAgICB0aGlzLl9tYXRyaWNlc1sgaW5kZXggXS5zZXQoIG5vZGVNYXRyaXggKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9tYXRyaWNlc1sgaW5kZXggXS5zZXQoIHRoaXMuX21hdHJpY2VzWyBpbmRleCAtIDEgXSApO1xuICAgICAgICB0aGlzLl9tYXRyaWNlc1sgaW5kZXggXS5tdWx0aXBseU1hdHJpeCggbm9kZU1hdHJpeCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlc2V0IHRoZSBkaXJ0eSBpbmRleCB0byBtYXJrIGFsbCBtYXRyaWNlcyBhcyAnY2xlYW4nLlxuICAgIHRoaXMuX2RpcnR5SW5kZXggPSBudW1NYXRyaWNlcztcblxuICAgIC8vIFJldHVybiB0aGUgbGFzdCBtYXRyaXgsIHdoaWNoIGNvbnRhaW5zIG91ciBjb21wb3NpdGUgdHJhbnNmb3JtYXRpb24uXG4gICAgcmV0dXJuIHRoaXMuX21hdHJpY2VzWyBudW1NYXRyaWNlcyAtIDEgXTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF0cml4KCk6IE1hdHJpeDMgeyByZXR1cm4gdGhpcy5nZXRNYXRyaXgoKTsgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnVHJhbnNmb3JtVHJhY2tlcicsIFRyYW5zZm9ybVRyYWNrZXIgKTtcbmV4cG9ydCBkZWZhdWx0IFRyYW5zZm9ybVRyYWNrZXI7Il0sIm5hbWVzIjpbIk1hdHJpeDMiLCJvcHRpb25pemUiLCJzY2VuZXJ5IiwiVHJhbnNmb3JtVHJhY2tlciIsImRpc3Bvc2UiLCJqIiwidHJhaWwiLCJsZW5ndGgiLCJub2RlVHJhbnNmb3JtTGlzdGVuZXIiLCJfbm9kZVRyYW5zZm9ybUxpc3RlbmVycyIsIm5vZGVzIiwidHJhbnNmb3JtRW1pdHRlciIsImhhc0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJhZGRMaXN0ZW5lciIsImxpc3RlbmVyIiwiX2xpc3RlbmVycyIsInB1c2giLCJpbmRleCIsIl8iLCJpbmRleE9mIiwiYXNzZXJ0Iiwic3BsaWNlIiwibm90aWZ5TGlzdGVuZXJzIiwibGlzdGVuZXJzIiwiX2lzU3RhdGljIiwic2xpY2UiLCJpIiwib25UcmFuc2Zvcm1DaGFuZ2UiLCJtYXRyaXhJbmRleCIsIl9kaXJ0eUluZGV4IiwiTWF0aCIsIm1pbiIsImdldE1hdHJpeCIsIl9tYXRyaWNlcyIsIklERU5USVRZIiwibnVtTWF0cmljZXMiLCJub2RlTWF0cml4IiwibWF0cml4Iiwic2V0IiwibXVsdGlwbHlNYXRyaXgiLCJwcm92aWRlZE9w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