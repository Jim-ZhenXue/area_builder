// Copyright 2017-2024, University of Colorado Boulder
/**
 * The lattice is a 2D grid with a value in each cell that represents the wave amplitude at that point.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Emitter from '../../axon/js/Emitter.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Matrix from '../../dot/js/Matrix.js';
import sceneryPhet from './sceneryPhet.js';
// constants
// The wave speed in the coordinate frame of the lattice, see http://www.mtnmath.com/whatth/node47.html. We tried
// different values, but they do not have the properer emergent behavior.  WAVE_SPEED=1 propagates out as a diamond
// rather than a circle, and WAVE_SPEED=0.1 is too slow and throws off the frequency of light.
const WAVE_SPEED = 0.5;
const WAVE_SPEED_SQUARED = WAVE_SPEED * WAVE_SPEED; // precompute to avoid work in the inner loop
const NUMBER_OF_MATRICES = 3; // The discretized wave equation algorithm requires current value + 2 history points
// This is the threshold for the wave value that determines if the light has visited.  If the value is higher,
// it will track the wavefront of the light more accurately (and hence could be used for more accurate computation of
// the speed of light), but will generate more artifacts in the initial wave.  If the value is lower, it will generate
// fewer artifacts in the initial propagation, but will lead the initial wavefront by too far and make it seem like
// light is faster than it should be measured (based on the propagation of wavefronts).
const LIGHT_VISIT_THRESHOLD = 1E-3;
let Lattice = class Lattice {
    /**
   * Gets a Bounds2 representing the full region of the lattice, including damping regions.
   */ getBounds() {
        return new Bounds2(0, 0, this.width, this.height);
    }
    /**
   * Returns true if the visible bounds contains the lattice coordinate
   * @param i - integer for the horizontal coordinate
   * @param j - integer for the vertical coordinate
   */ visibleBoundsContains(i, j) {
        const b = this.visibleBounds;
        // Note this differs from the standard Bounds2.containsCoordinate because we must exclude right and bottom edge
        // from reading one cell off the visible lattice, see https://github.com/phetsims/wave-interference/issues/86
        return b.minX <= i && i < b.maxX && b.minY <= j && j < b.maxY;
    }
    /**
   * Returns true if the given coordinate is within the lattice
   * @param i - integer for the horizontal coordinate
   * @param j - integer for the vertical coordinate
   */ contains(i, j) {
        return i >= 0 && i < this.width && j >= 0 && j < this.height;
    }
    /**
   * Read the values on the center line of the lattice (omits the out-of-bounds damping regions), for display in the
   * WaveAreaGraphNode
   * @param array - array to fill with the values for performance/memory, will be resized if necessary
   */ getCenterLineValues(array) {
        const samplingWidth = this.width - this.dampX * 2;
        // Resize array if necessary
        if (array.length !== samplingWidth) {
            array.length = 0;
        }
        const samplingVerticalPosition = Math.floor(this.height / 2); // 50.5 is the center, but we want 50.0
        for(let i = 0; i < this.width - this.dampX * 2; i++){
            array[i] = this.getCurrentValue(i + this.dampX, samplingVerticalPosition);
        }
    }
    /**
   * Returns the current value in the given cell, masked by the allowedMask.
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   */ getCurrentValue(i, j) {
        return this.allowedMask.get(i, j) === 1 ? this.matrices[this.currentMatrixIndex].get(i, j) : 0;
    }
    /**
   * Returns the interpolated value of the given cell, masked by the allowedMask.
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   */ getInterpolatedValue(i, j) {
        if (this.allowedMask.get(i, j) === 1) {
            const currentValue = this.getCurrentValue(i, j);
            const lastValue = this.getLastValue(i, j);
            return currentValue * this.interpolationRatio + lastValue * (1 - this.interpolationRatio);
        } else {
            return 0;
        }
    }
    /**
   * Sets the current value in the given cell
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   * @param value
   */ setCurrentValue(i, j, value) {
        this.matrices[this.currentMatrixIndex].set(i, j, value);
    }
    /**
   * Returns the previous value in the given cell
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   */ getLastValue(i, j) {
        return this.matrices[(this.currentMatrixIndex + 1) % this.matrices.length].get(i, j);
    }
    /**
   * Sets the previous value in the given cell
   * @param i - horizontal integer coordinate
   * @param j - vertical integer coordinate
   * @param value
   */ setLastValue(i, j, value) {
        this.matrices[(this.currentMatrixIndex + 1) % this.matrices.length].set(i, j, value);
    }
    /**
   * In order to prevent numerical artifacts in the point source scenes, we use TemporalMask to identify which cells
   * have a value because of the source oscillation.
   * @param i
   * @param j
   * @param allowed - true if the temporal mask indicates that the value could have been caused by sources
   */ setAllowed(i, j, allowed) {
        this.allowedMask.set(i, j, allowed ? 1 : 0);
    }
    /**
   * Determines whether the incoming wave has reached the cell.
   * @param i - horizontal coordinate to check
   * @param j - vertical coordinate to check
   */ hasCellBeenVisited(i, j) {
        return this.visitedMatrix.get(i, j) === 1 && this.allowedMask.get(i, j) === 1;
    }
    /**
   * Resets all of the wave values to 0.
   */ clear() {
        this.clearRight(0);
    }
    /**
   * Clear everything at and to the right of the specified column.
   * @param column - integer index of the column to start clearing at.
   */ clearRight(column) {
        for(let i = column; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                for(let k = 0; k < this.matrices.length; k++){
                    this.matrices[k].set(i, j, 0);
                }
                this.visitedMatrix.set(i, j, 0);
                this.allowedMask.set(i, j, 1); // Initialize to 1 to support plane waves, which is never masked.
            }
        }
        this.changedEmitter.emit();
    }
    /**
   * Gets the values on the right hand side of the wave (before the damping region), for determining intensity.
   */ getOutputColumn() {
        // This could be implemented in garbage-free from by require preallocating the entire intensitySample matrix and
        // using an index pointer like a circular array.  However, profiling in Mac Chrome did not show a significant
        // amount of time spent in this function, hence we use the simpler implementation.
        const column = [];
        for(let j = this.dampY; j < this.height - this.dampY; j++){
            const a = this.getCurrentValue(this.width - this.dampX - 1, j);
            const b = this.getCurrentValue(this.width - this.dampX - 2, j);
            const v = (a + b) / 2;
            column.push(v);
        }
        return column;
    }
    /**
   * Propagates the wave by one step.  This is a discrete algorithm and cannot use dt.
   */ step() {
        // Move to the next matrix
        this.currentMatrixIndex = (this.currentMatrixIndex - 1 + this.matrices.length) % this.matrices.length;
        const matrix0 = this.matrices[(this.currentMatrixIndex + 0) % this.matrices.length];
        const matrix1 = this.matrices[(this.currentMatrixIndex + 1) % this.matrices.length];
        const matrix2 = this.matrices[(this.currentMatrixIndex + 2) % this.matrices.length];
        const width = matrix0.getRowDimension();
        const height = matrix0.getColumnDimension();
        // Main loop, doesn't update cells on the edges
        for(let i = 1; i < width - 1; i++){
            for(let j = 1; j < height - 1; j++){
                const neighborSum = matrix1.get(i + 1, j) + matrix1.get(i - 1, j) + matrix1.get(i, j + 1) + matrix1.get(i, j - 1);
                const m1ij = matrix1.get(i, j);
                const value = m1ij * 2 - matrix2.get(i, j) + WAVE_SPEED_SQUARED * (neighborSum + m1ij * -4);
                matrix0.set(i, j, value);
                if (Math.abs(value) > LIGHT_VISIT_THRESHOLD) {
                    this.visitedMatrix.set(i, j, 1);
                }
            }
        }
        // Numerical computation of absorbing boundary conditions, under the assumption that the wave is perpendicular
        // to the edge, see https://www.phy.ornl.gov/csep/sw/node22.html.  This assumption does not hold everywhere, but
        // it is a helpful approximation.
        // Note there is a Fortran error on the top boundary and in the equations, replace:
        // u2 => matrix1.get
        // u1 => matrix2.get
        // cb => WAVE_SPEED
        // Left edge
        let i = 0;
        for(let j = 0; j < height; j++){
            const sum = matrix1.get(i, j) + matrix1.get(i + 1, j) - matrix2.get(i + 1, j) + WAVE_SPEED * (matrix1.get(i + 1, j) - matrix1.get(i, j) + matrix2.get(i + 1, j) - matrix2.get(i + 2, j));
            matrix0.set(i, j, sum);
        }
        // Right edge
        i = width - 1;
        for(let j = 0; j < height; j++){
            const sum = matrix1.get(i, j) + matrix1.get(i - 1, j) - matrix2.get(i - 1, j) + WAVE_SPEED * (matrix1.get(i - 1, j) - matrix1.get(i, j) + matrix2.get(i - 1, j) - matrix2.get(i - 2, j));
            matrix0.set(i, j, sum);
        }
        // Top edge
        let j = 0;
        for(let i = 0; i < width; i++){
            const sum = matrix1.get(i, j) + matrix1.get(i, j + 1) - matrix2.get(i, j + 1) + WAVE_SPEED * (matrix1.get(i, j + 1) - matrix1.get(i, j) + matrix2.get(i, j + 1) - matrix2.get(i, j + 2));
            matrix0.set(i, j, sum);
        }
        // Bottom edge
        j = height - 1;
        for(let i = 0; i < width; i++){
            const sum = matrix1.get(i, j) + matrix1.get(i, j - 1) - matrix2.get(i, j - 1) + WAVE_SPEED * (matrix1.get(i, j - 1) - matrix1.get(i, j) + matrix2.get(i, j - 1) - matrix2.get(i, j - 2));
            matrix0.set(i, j, sum);
        }
    }
    /**
   * @param width - width of the lattice (includes damping regions)
   * @param height - height of the lattice (includes damping regions)
   * @param dampX - number of cells on the left and again on the right to use for damping
   * @param dampY - number of cells on the top and again on the bottom to use for damping
   */ constructor(width, height, dampX, dampY){
        this.width = width;
        this.height = height;
        this.dampX = dampX;
        this.dampY = dampY;
        this.matrices = [];
        this.currentMatrixIndex = 0;
        this.changedEmitter = new Emitter();
        this.interpolationRatio = 0;
        for(let i = 0; i < NUMBER_OF_MATRICES; i++){
            this.matrices.push(new Matrix(width, height));
        }
        this.visitedMatrix = new Matrix(width, height);
        this.allowedMask = new Matrix(width, height, 1);
        this.width = width;
        this.height = height;
        this.visibleBounds = new Bounds2(this.dampX, this.dampY, this.width - this.dampX, this.height - this.dampY);
    }
};
Lattice.WAVE_SPEED = WAVE_SPEED;
sceneryPhet.register('Lattice', Lattice);
export default Lattice;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9MYXR0aWNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoZSBsYXR0aWNlIGlzIGEgMkQgZ3JpZCB3aXRoIGEgdmFsdWUgaW4gZWFjaCBjZWxsIHRoYXQgcmVwcmVzZW50cyB0aGUgd2F2ZSBhbXBsaXR1ZGUgYXQgdGhhdCBwb2ludC5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4IGZyb20gJy4uLy4uL2RvdC9qcy9NYXRyaXguanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG4vLyBjb25zdGFudHNcblxuLy8gVGhlIHdhdmUgc3BlZWQgaW4gdGhlIGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIGxhdHRpY2UsIHNlZSBodHRwOi8vd3d3Lm10bm1hdGguY29tL3doYXR0aC9ub2RlNDcuaHRtbC4gV2UgdHJpZWRcbi8vIGRpZmZlcmVudCB2YWx1ZXMsIGJ1dCB0aGV5IGRvIG5vdCBoYXZlIHRoZSBwcm9wZXJlciBlbWVyZ2VudCBiZWhhdmlvci4gIFdBVkVfU1BFRUQ9MSBwcm9wYWdhdGVzIG91dCBhcyBhIGRpYW1vbmRcbi8vIHJhdGhlciB0aGFuIGEgY2lyY2xlLCBhbmQgV0FWRV9TUEVFRD0wLjEgaXMgdG9vIHNsb3cgYW5kIHRocm93cyBvZmYgdGhlIGZyZXF1ZW5jeSBvZiBsaWdodC5cbmNvbnN0IFdBVkVfU1BFRUQgPSAwLjU7XG5jb25zdCBXQVZFX1NQRUVEX1NRVUFSRUQgPSBXQVZFX1NQRUVEICogV0FWRV9TUEVFRDsgLy8gcHJlY29tcHV0ZSB0byBhdm9pZCB3b3JrIGluIHRoZSBpbm5lciBsb29wXG5jb25zdCBOVU1CRVJfT0ZfTUFUUklDRVMgPSAzOyAvLyBUaGUgZGlzY3JldGl6ZWQgd2F2ZSBlcXVhdGlvbiBhbGdvcml0aG0gcmVxdWlyZXMgY3VycmVudCB2YWx1ZSArIDIgaGlzdG9yeSBwb2ludHNcblxuLy8gVGhpcyBpcyB0aGUgdGhyZXNob2xkIGZvciB0aGUgd2F2ZSB2YWx1ZSB0aGF0IGRldGVybWluZXMgaWYgdGhlIGxpZ2h0IGhhcyB2aXNpdGVkLiAgSWYgdGhlIHZhbHVlIGlzIGhpZ2hlcixcbi8vIGl0IHdpbGwgdHJhY2sgdGhlIHdhdmVmcm9udCBvZiB0aGUgbGlnaHQgbW9yZSBhY2N1cmF0ZWx5IChhbmQgaGVuY2UgY291bGQgYmUgdXNlZCBmb3IgbW9yZSBhY2N1cmF0ZSBjb21wdXRhdGlvbiBvZlxuLy8gdGhlIHNwZWVkIG9mIGxpZ2h0KSwgYnV0IHdpbGwgZ2VuZXJhdGUgbW9yZSBhcnRpZmFjdHMgaW4gdGhlIGluaXRpYWwgd2F2ZS4gIElmIHRoZSB2YWx1ZSBpcyBsb3dlciwgaXQgd2lsbCBnZW5lcmF0ZVxuLy8gZmV3ZXIgYXJ0aWZhY3RzIGluIHRoZSBpbml0aWFsIHByb3BhZ2F0aW9uLCBidXQgd2lsbCBsZWFkIHRoZSBpbml0aWFsIHdhdmVmcm9udCBieSB0b28gZmFyIGFuZCBtYWtlIGl0IHNlZW0gbGlrZVxuLy8gbGlnaHQgaXMgZmFzdGVyIHRoYW4gaXQgc2hvdWxkIGJlIG1lYXN1cmVkIChiYXNlZCBvbiB0aGUgcHJvcGFnYXRpb24gb2Ygd2F2ZWZyb250cykuXG5jb25zdCBMSUdIVF9WSVNJVF9USFJFU0hPTEQgPSAxRS0zO1xuXG5jbGFzcyBMYXR0aWNlIHtcblxuICAvLyBtYXRyaWNlcyBmb3IgY3VycmVudCB2YWx1ZSwgcHJldmlvdXMgdmFsdWUgYW5kIHZhbHVlIGJlZm9yZSBwcmV2aW91c1xuICBwcml2YXRlIHJlYWRvbmx5IG1hdHJpY2VzOiBNYXRyaXhbXSA9IFtdO1xuXG4gIC8vIGtlZXBzIHRyYWNrIG9mIHdoaWNoIGNlbGxzIGhhdmUgYmVlbiB2aXNpdGVkIGJ5IHRoZSB3YXZlXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlzaXRlZE1hdHJpeDogTWF0cml4O1xuXG4gIC8vIHRyYWNrcyB3aGljaCBjZWxscyBjb3VsZCBoYXZlIGJlZW4gYWN0aXZhdGVkIGJ5IGFuIHNvdXJjZSBkaXN0dXJiYW5jZSwgYXMgb3Bwb3NlZCB0byBhIG51bWVyaWNhbFxuICAvLyBhcnRpZmFjdCBvciByZWZsZWN0aW9uLiAgU2VlIFRlbXBvcmFsTWFzay4gIEluaXRpYWxpemUgdG8gMSB0byBzdXBwb3J0IHBsYW5lIHdhdmVzLCB3aGljaCBpcyBuZXZlciBtYXNrZWQuXG4gIHByaXZhdGUgcmVhZG9ubHkgYWxsb3dlZE1hc2s6IE1hdHJpeDtcblxuICAvLyBpbmRpY2F0ZXMgdGhlIGN1cnJlbnQgbWF0cml4LiBQcmV2aW91cyBtYXRyaXggaXMgb25lIGhpZ2hlciAod2l0aCBjb3JyZWN0IG1vZHVsdXMpXG4gIHByaXZhdGUgY3VycmVudE1hdHJpeEluZGV4ID0gMDtcblxuICAvLyBzZW5kcyBhIG5vdGlmaWNhdGlvbiBlYWNoIHRpbWUgdGhlIGxhdHRpY2UgdXBkYXRlcy5cbiAgcHVibGljIHJlYWRvbmx5IGNoYW5nZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAvLyBEZXRlcm1pbmVzIGhvdyBmYXIgd2UgaGF2ZSBhbmltYXRlZCBiZXR3ZWVuIHRoZSBcImxhc3RcIiBhbmQgXCJjdXJyZW50XCIgbWF0cmljZXMsIHNvIHRoYXQgd2VcbiAgLy8gY2FuIHVzZSBnZXRJbnRlcnBvbGF0ZWRWYWx1ZSB0byB1cGRhdGUgdGhlIHZpZXcgYXQgNjBmcHMgZXZlbiB0aG91Z2ggdGhlIG1vZGVsIGlzIHJ1bm5pbmcgYXQgYSBzbG93ZXIgcmF0ZS5cbiAgLy8gU2VlIEV2ZW50VGltZXIuZ2V0UmF0aW8gZm9yIG1vcmUgYWJvdXQgdGhpcyB2YWx1ZS5cbiAgcHVibGljIGludGVycG9sYXRpb25SYXRpbyA9IDA7XG5cbiAgLy8gYSBCb3VuZHMyIHJlcHJlc2VudGluZyB0aGUgdmlzaWJsZSAobm9uLWRhbXBpbmcpIHJlZ2lvbiBvZiB0aGUgbGF0dGljZS5cbiAgcHVibGljIHJlYWRvbmx5IHZpc2libGVCb3VuZHM6IEJvdW5kczI7XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBXQVZFX1NQRUVEID0gV0FWRV9TUEVFRDtcblxuICAvKipcbiAgICogQHBhcmFtIHdpZHRoIC0gd2lkdGggb2YgdGhlIGxhdHRpY2UgKGluY2x1ZGVzIGRhbXBpbmcgcmVnaW9ucylcbiAgICogQHBhcmFtIGhlaWdodCAtIGhlaWdodCBvZiB0aGUgbGF0dGljZSAoaW5jbHVkZXMgZGFtcGluZyByZWdpb25zKVxuICAgKiBAcGFyYW0gZGFtcFggLSBudW1iZXIgb2YgY2VsbHMgb24gdGhlIGxlZnQgYW5kIGFnYWluIG9uIHRoZSByaWdodCB0byB1c2UgZm9yIGRhbXBpbmdcbiAgICogQHBhcmFtIGRhbXBZIC0gbnVtYmVyIG9mIGNlbGxzIG9uIHRoZSB0b3AgYW5kIGFnYWluIG9uIHRoZSBib3R0b20gdG8gdXNlIGZvciBkYW1waW5nXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHB1YmxpYyByZWFkb25seSB3aWR0aDogbnVtYmVyLCBwdWJsaWMgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXIsIHB1YmxpYyByZWFkb25seSBkYW1wWDogbnVtYmVyLCBwdWJsaWMgcmVhZG9ubHkgZGFtcFk6IG51bWJlciApIHtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE5VTUJFUl9PRl9NQVRSSUNFUzsgaSsrICkge1xuICAgICAgdGhpcy5tYXRyaWNlcy5wdXNoKCBuZXcgTWF0cml4KCB3aWR0aCwgaGVpZ2h0ICkgKTtcbiAgICB9XG4gICAgdGhpcy52aXNpdGVkTWF0cml4ID0gbmV3IE1hdHJpeCggd2lkdGgsIGhlaWdodCApO1xuICAgIHRoaXMuYWxsb3dlZE1hc2sgPSBuZXcgTWF0cml4KCB3aWR0aCwgaGVpZ2h0LCAxICk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMudmlzaWJsZUJvdW5kcyA9IG5ldyBCb3VuZHMyKCB0aGlzLmRhbXBYLCB0aGlzLmRhbXBZLCB0aGlzLndpZHRoIC0gdGhpcy5kYW1wWCwgdGhpcy5oZWlnaHQgLSB0aGlzLmRhbXBZICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIEJvdW5kczIgcmVwcmVzZW50aW5nIHRoZSBmdWxsIHJlZ2lvbiBvZiB0aGUgbGF0dGljZSwgaW5jbHVkaW5nIGRhbXBpbmcgcmVnaW9ucy5cbiAgICovXG4gIHB1YmxpYyBnZXRCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIG5ldyBCb3VuZHMyKCAwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmlzaWJsZSBib3VuZHMgY29udGFpbnMgdGhlIGxhdHRpY2UgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0gaSAtIGludGVnZXIgZm9yIHRoZSBob3Jpem9udGFsIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIGogLSBpbnRlZ2VyIGZvciB0aGUgdmVydGljYWwgY29vcmRpbmF0ZVxuICAgKi9cbiAgcHVibGljIHZpc2libGVCb3VuZHNDb250YWlucyggaTogbnVtYmVyLCBqOiBudW1iZXIgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgYiA9IHRoaXMudmlzaWJsZUJvdW5kcztcblxuICAgIC8vIE5vdGUgdGhpcyBkaWZmZXJzIGZyb20gdGhlIHN0YW5kYXJkIEJvdW5kczIuY29udGFpbnNDb29yZGluYXRlIGJlY2F1c2Ugd2UgbXVzdCBleGNsdWRlIHJpZ2h0IGFuZCBib3R0b20gZWRnZVxuICAgIC8vIGZyb20gcmVhZGluZyBvbmUgY2VsbCBvZmYgdGhlIHZpc2libGUgbGF0dGljZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvODZcbiAgICByZXR1cm4gYi5taW5YIDw9IGkgJiYgaSA8IGIubWF4WCAmJiBiLm1pblkgPD0gaiAmJiBqIDwgYi5tYXhZO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gY29vcmRpbmF0ZSBpcyB3aXRoaW4gdGhlIGxhdHRpY2VcbiAgICogQHBhcmFtIGkgLSBpbnRlZ2VyIGZvciB0aGUgaG9yaXpvbnRhbCBjb29yZGluYXRlXG4gICAqIEBwYXJhbSBqIC0gaW50ZWdlciBmb3IgdGhlIHZlcnRpY2FsIGNvb3JkaW5hdGVcbiAgICovXG4gIHB1YmxpYyBjb250YWlucyggaTogbnVtYmVyLCBqOiBudW1iZXIgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGkgPj0gMCAmJiBpIDwgdGhpcy53aWR0aCAmJiBqID49IDAgJiYgaiA8IHRoaXMuaGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWQgdGhlIHZhbHVlcyBvbiB0aGUgY2VudGVyIGxpbmUgb2YgdGhlIGxhdHRpY2UgKG9taXRzIHRoZSBvdXQtb2YtYm91bmRzIGRhbXBpbmcgcmVnaW9ucyksIGZvciBkaXNwbGF5IGluIHRoZVxuICAgKiBXYXZlQXJlYUdyYXBoTm9kZVxuICAgKiBAcGFyYW0gYXJyYXkgLSBhcnJheSB0byBmaWxsIHdpdGggdGhlIHZhbHVlcyBmb3IgcGVyZm9ybWFuY2UvbWVtb3J5LCB3aWxsIGJlIHJlc2l6ZWQgaWYgbmVjZXNzYXJ5XG4gICAqL1xuICBwdWJsaWMgZ2V0Q2VudGVyTGluZVZhbHVlcyggYXJyYXk6IG51bWJlcltdICk6IHZvaWQge1xuICAgIGNvbnN0IHNhbXBsaW5nV2lkdGggPSB0aGlzLndpZHRoIC0gdGhpcy5kYW1wWCAqIDI7XG5cbiAgICAvLyBSZXNpemUgYXJyYXkgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKCBhcnJheS5sZW5ndGggIT09IHNhbXBsaW5nV2lkdGggKSB7XG4gICAgICBhcnJheS5sZW5ndGggPSAwO1xuICAgIH1cbiAgICBjb25zdCBzYW1wbGluZ1ZlcnRpY2FsUG9zaXRpb24gPSBNYXRoLmZsb29yKCB0aGlzLmhlaWdodCAvIDIgKTsgLy8gNTAuNSBpcyB0aGUgY2VudGVyLCBidXQgd2Ugd2FudCA1MC4wXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy53aWR0aCAtIHRoaXMuZGFtcFggKiAyOyBpKysgKSB7XG4gICAgICBhcnJheVsgaSBdID0gdGhpcy5nZXRDdXJyZW50VmFsdWUoIGkgKyB0aGlzLmRhbXBYLCBzYW1wbGluZ1ZlcnRpY2FsUG9zaXRpb24gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZSBpbiB0aGUgZ2l2ZW4gY2VsbCwgbWFza2VkIGJ5IHRoZSBhbGxvd2VkTWFzay5cbiAgICogQHBhcmFtIGkgLSBob3Jpem9udGFsIGludGVnZXIgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0gaiAtIHZlcnRpY2FsIGludGVnZXIgY29vcmRpbmF0ZVxuICAgKi9cbiAgcHVibGljIGdldEN1cnJlbnRWYWx1ZSggaTogbnVtYmVyLCBqOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5hbGxvd2VkTWFzay5nZXQoIGksIGogKSA9PT0gMSA/IHRoaXMubWF0cmljZXNbIHRoaXMuY3VycmVudE1hdHJpeEluZGV4IF0uZ2V0KCBpLCBqICkgOiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGludGVycG9sYXRlZCB2YWx1ZSBvZiB0aGUgZ2l2ZW4gY2VsbCwgbWFza2VkIGJ5IHRoZSBhbGxvd2VkTWFzay5cbiAgICogQHBhcmFtIGkgLSBob3Jpem9udGFsIGludGVnZXIgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0gaiAtIHZlcnRpY2FsIGludGVnZXIgY29vcmRpbmF0ZVxuICAgKi9cbiAgcHVibGljIGdldEludGVycG9sYXRlZFZhbHVlKCBpOiBudW1iZXIsIGo6IG51bWJlciApOiBudW1iZXIge1xuICAgIGlmICggdGhpcy5hbGxvd2VkTWFzay5nZXQoIGksIGogKSA9PT0gMSApIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRoaXMuZ2V0Q3VycmVudFZhbHVlKCBpLCBqICk7XG4gICAgICBjb25zdCBsYXN0VmFsdWUgPSB0aGlzLmdldExhc3RWYWx1ZSggaSwgaiApO1xuICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZSAqIHRoaXMuaW50ZXJwb2xhdGlvblJhdGlvICsgbGFzdFZhbHVlICogKCAxIC0gdGhpcy5pbnRlcnBvbGF0aW9uUmF0aW8gKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY3VycmVudCB2YWx1ZSBpbiB0aGUgZ2l2ZW4gY2VsbFxuICAgKiBAcGFyYW0gaSAtIGhvcml6b250YWwgaW50ZWdlciBjb29yZGluYXRlXG4gICAqIEBwYXJhbSBqIC0gdmVydGljYWwgaW50ZWdlciBjb29yZGluYXRlXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKi9cbiAgcHVibGljIHNldEN1cnJlbnRWYWx1ZSggaTogbnVtYmVyLCBqOiBudW1iZXIsIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5tYXRyaWNlc1sgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggXS5zZXQoIGksIGosIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJldmlvdXMgdmFsdWUgaW4gdGhlIGdpdmVuIGNlbGxcbiAgICogQHBhcmFtIGkgLSBob3Jpem9udGFsIGludGVnZXIgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0gaiAtIHZlcnRpY2FsIGludGVnZXIgY29vcmRpbmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRMYXN0VmFsdWUoIGk6IG51bWJlciwgajogbnVtYmVyICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWF0cmljZXNbICggdGhpcy5jdXJyZW50TWF0cml4SW5kZXggKyAxICkgJSB0aGlzLm1hdHJpY2VzLmxlbmd0aCBdLmdldCggaSwgaiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHByZXZpb3VzIHZhbHVlIGluIHRoZSBnaXZlbiBjZWxsXG4gICAqIEBwYXJhbSBpIC0gaG9yaXpvbnRhbCBpbnRlZ2VyIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIGogLSB2ZXJ0aWNhbCBpbnRlZ2VyIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqL1xuICBwdWJsaWMgc2V0TGFzdFZhbHVlKCBpOiBudW1iZXIsIGo6IG51bWJlciwgdmFsdWU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLm1hdHJpY2VzWyAoIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ICsgMSApICUgdGhpcy5tYXRyaWNlcy5sZW5ndGggXS5zZXQoIGksIGosIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogSW4gb3JkZXIgdG8gcHJldmVudCBudW1lcmljYWwgYXJ0aWZhY3RzIGluIHRoZSBwb2ludCBzb3VyY2Ugc2NlbmVzLCB3ZSB1c2UgVGVtcG9yYWxNYXNrIHRvIGlkZW50aWZ5IHdoaWNoIGNlbGxzXG4gICAqIGhhdmUgYSB2YWx1ZSBiZWNhdXNlIG9mIHRoZSBzb3VyY2Ugb3NjaWxsYXRpb24uXG4gICAqIEBwYXJhbSBpXG4gICAqIEBwYXJhbSBqXG4gICAqIEBwYXJhbSBhbGxvd2VkIC0gdHJ1ZSBpZiB0aGUgdGVtcG9yYWwgbWFzayBpbmRpY2F0ZXMgdGhhdCB0aGUgdmFsdWUgY291bGQgaGF2ZSBiZWVuIGNhdXNlZCBieSBzb3VyY2VzXG4gICAqL1xuICBwdWJsaWMgc2V0QWxsb3dlZCggaTogbnVtYmVyLCBqOiBudW1iZXIsIGFsbG93ZWQ6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgdGhpcy5hbGxvd2VkTWFzay5zZXQoIGksIGosIGFsbG93ZWQgPyAxIDogMCApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgaW5jb21pbmcgd2F2ZSBoYXMgcmVhY2hlZCB0aGUgY2VsbC5cbiAgICogQHBhcmFtIGkgLSBob3Jpem9udGFsIGNvb3JkaW5hdGUgdG8gY2hlY2tcbiAgICogQHBhcmFtIGogLSB2ZXJ0aWNhbCBjb29yZGluYXRlIHRvIGNoZWNrXG4gICAqL1xuICBwdWJsaWMgaGFzQ2VsbEJlZW5WaXNpdGVkKCBpOiBudW1iZXIsIGo6IG51bWJlciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdGVkTWF0cml4LmdldCggaSwgaiApID09PSAxICYmIHRoaXMuYWxsb3dlZE1hc2suZ2V0KCBpLCBqICkgPT09IDE7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIGFsbCBvZiB0aGUgd2F2ZSB2YWx1ZXMgdG8gMC5cbiAgICovXG4gIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLmNsZWFyUmlnaHQoIDAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBldmVyeXRoaW5nIGF0IGFuZCB0byB0aGUgcmlnaHQgb2YgdGhlIHNwZWNpZmllZCBjb2x1bW4uXG4gICAqIEBwYXJhbSBjb2x1bW4gLSBpbnRlZ2VyIGluZGV4IG9mIHRoZSBjb2x1bW4gdG8gc3RhcnQgY2xlYXJpbmcgYXQuXG4gICAqL1xuICBwdWJsaWMgY2xlYXJSaWdodCggY29sdW1uOiBudW1iZXIgKTogdm9pZCB7XG4gICAgZm9yICggbGV0IGkgPSBjb2x1bW47IGkgPCB0aGlzLndpZHRoOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLmhlaWdodDsgaisrICkge1xuICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCB0aGlzLm1hdHJpY2VzLmxlbmd0aDsgaysrICkge1xuICAgICAgICAgIHRoaXMubWF0cmljZXNbIGsgXS5zZXQoIGksIGosIDAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpc2l0ZWRNYXRyaXguc2V0KCBpLCBqLCAwICk7XG4gICAgICAgIHRoaXMuYWxsb3dlZE1hc2suc2V0KCBpLCBqLCAxICk7IC8vIEluaXRpYWxpemUgdG8gMSB0byBzdXBwb3J0IHBsYW5lIHdhdmVzLCB3aGljaCBpcyBuZXZlciBtYXNrZWQuXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHZhbHVlcyBvbiB0aGUgcmlnaHQgaGFuZCBzaWRlIG9mIHRoZSB3YXZlIChiZWZvcmUgdGhlIGRhbXBpbmcgcmVnaW9uKSwgZm9yIGRldGVybWluaW5nIGludGVuc2l0eS5cbiAgICovXG4gIHB1YmxpYyBnZXRPdXRwdXRDb2x1bW4oKTogbnVtYmVyW10ge1xuXG4gICAgLy8gVGhpcyBjb3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBnYXJiYWdlLWZyZWUgZnJvbSBieSByZXF1aXJlIHByZWFsbG9jYXRpbmcgdGhlIGVudGlyZSBpbnRlbnNpdHlTYW1wbGUgbWF0cml4IGFuZFxuICAgIC8vIHVzaW5nIGFuIGluZGV4IHBvaW50ZXIgbGlrZSBhIGNpcmN1bGFyIGFycmF5LiAgSG93ZXZlciwgcHJvZmlsaW5nIGluIE1hYyBDaHJvbWUgZGlkIG5vdCBzaG93IGEgc2lnbmlmaWNhbnRcbiAgICAvLyBhbW91bnQgb2YgdGltZSBzcGVudCBpbiB0aGlzIGZ1bmN0aW9uLCBoZW5jZSB3ZSB1c2UgdGhlIHNpbXBsZXIgaW1wbGVtZW50YXRpb24uXG4gICAgY29uc3QgY29sdW1uID0gW107XG4gICAgZm9yICggbGV0IGogPSB0aGlzLmRhbXBZOyBqIDwgdGhpcy5oZWlnaHQgLSB0aGlzLmRhbXBZOyBqKysgKSB7XG4gICAgICBjb25zdCBhID0gdGhpcy5nZXRDdXJyZW50VmFsdWUoIHRoaXMud2lkdGggLSB0aGlzLmRhbXBYIC0gMSwgaiApO1xuICAgICAgY29uc3QgYiA9IHRoaXMuZ2V0Q3VycmVudFZhbHVlKCB0aGlzLndpZHRoIC0gdGhpcy5kYW1wWCAtIDIsIGogKTtcbiAgICAgIGNvbnN0IHYgPSAoIGEgKyBiICkgLyAyO1xuICAgICAgY29sdW1uLnB1c2goIHYgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbHVtbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9wYWdhdGVzIHRoZSB3YXZlIGJ5IG9uZSBzdGVwLiAgVGhpcyBpcyBhIGRpc2NyZXRlIGFsZ29yaXRobSBhbmQgY2Fubm90IHVzZSBkdC5cbiAgICovXG4gIHB1YmxpYyBzdGVwKCk6IHZvaWQge1xuXG4gICAgLy8gTW92ZSB0byB0aGUgbmV4dCBtYXRyaXhcbiAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9ICggdGhpcy5jdXJyZW50TWF0cml4SW5kZXggLSAxICsgdGhpcy5tYXRyaWNlcy5sZW5ndGggKSAlIHRoaXMubWF0cmljZXMubGVuZ3RoO1xuXG4gICAgY29uc3QgbWF0cml4MCA9IHRoaXMubWF0cmljZXNbICggdGhpcy5jdXJyZW50TWF0cml4SW5kZXggKyAwICkgJSB0aGlzLm1hdHJpY2VzLmxlbmd0aCBdO1xuICAgIGNvbnN0IG1hdHJpeDEgPSB0aGlzLm1hdHJpY2VzWyAoIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ICsgMSApICUgdGhpcy5tYXRyaWNlcy5sZW5ndGggXTtcbiAgICBjb25zdCBtYXRyaXgyID0gdGhpcy5tYXRyaWNlc1sgKCB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCArIDIgKSAlIHRoaXMubWF0cmljZXMubGVuZ3RoIF07XG4gICAgY29uc3Qgd2lkdGggPSBtYXRyaXgwLmdldFJvd0RpbWVuc2lvbigpO1xuICAgIGNvbnN0IGhlaWdodCA9IG1hdHJpeDAuZ2V0Q29sdW1uRGltZW5zaW9uKCk7XG5cbiAgICAvLyBNYWluIGxvb3AsIGRvZXNuJ3QgdXBkYXRlIGNlbGxzIG9uIHRoZSBlZGdlc1xuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IHdpZHRoIC0gMTsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAxOyBqIDwgaGVpZ2h0IC0gMTsgaisrICkge1xuICAgICAgICBjb25zdCBuZWlnaGJvclN1bSA9IG1hdHJpeDEuZ2V0KCBpICsgMSwgaiApICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXgxLmdldCggaSAtIDEsIGogKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4MS5nZXQoIGksIGogKyAxICkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeDEuZ2V0KCBpLCBqIC0gMSApO1xuICAgICAgICBjb25zdCBtMWlqID0gbWF0cml4MS5nZXQoIGksIGogKTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBtMWlqICogMiAtIG1hdHJpeDIuZ2V0KCBpLCBqICkgKyBXQVZFX1NQRUVEX1NRVUFSRUQgKiAoIG5laWdoYm9yU3VtICsgbTFpaiAqIC00ICk7XG4gICAgICAgIG1hdHJpeDAuc2V0KCBpLCBqLCB2YWx1ZSApO1xuXG4gICAgICAgIGlmICggTWF0aC5hYnMoIHZhbHVlICkgPiBMSUdIVF9WSVNJVF9USFJFU0hPTEQgKSB7XG4gICAgICAgICAgdGhpcy52aXNpdGVkTWF0cml4LnNldCggaSwgaiwgMSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTnVtZXJpY2FsIGNvbXB1dGF0aW9uIG9mIGFic29yYmluZyBib3VuZGFyeSBjb25kaXRpb25zLCB1bmRlciB0aGUgYXNzdW1wdGlvbiB0aGF0IHRoZSB3YXZlIGlzIHBlcnBlbmRpY3VsYXJcbiAgICAvLyB0byB0aGUgZWRnZSwgc2VlIGh0dHBzOi8vd3d3LnBoeS5vcm5sLmdvdi9jc2VwL3N3L25vZGUyMi5odG1sLiAgVGhpcyBhc3N1bXB0aW9uIGRvZXMgbm90IGhvbGQgZXZlcnl3aGVyZSwgYnV0XG4gICAgLy8gaXQgaXMgYSBoZWxwZnVsIGFwcHJveGltYXRpb24uXG4gICAgLy8gTm90ZSB0aGVyZSBpcyBhIEZvcnRyYW4gZXJyb3Igb24gdGhlIHRvcCBib3VuZGFyeSBhbmQgaW4gdGhlIGVxdWF0aW9ucywgcmVwbGFjZTpcbiAgICAvLyB1MiA9PiBtYXRyaXgxLmdldFxuICAgIC8vIHUxID0+IG1hdHJpeDIuZ2V0XG4gICAgLy8gY2IgPT4gV0FWRV9TUEVFRFxuXG4gICAgLy8gTGVmdCBlZGdlXG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGhlaWdodDsgaisrICkge1xuICAgICAgY29uc3Qgc3VtID0gbWF0cml4MS5nZXQoIGksIGogKSArIG1hdHJpeDEuZ2V0KCBpICsgMSwgaiApIC0gbWF0cml4Mi5nZXQoIGkgKyAxLCBqICkgKyBXQVZFX1NQRUVEICpcbiAgICAgICAgICAgICAgICAgICggbWF0cml4MS5nZXQoIGkgKyAxLCBqICkgLSBtYXRyaXgxLmdldCggaSwgaiApICsgbWF0cml4Mi5nZXQoIGkgKyAxLCBqICkgLSBtYXRyaXgyLmdldCggaSArIDIsIGogKSApO1xuICAgICAgbWF0cml4MC5zZXQoIGksIGosIHN1bSApO1xuICAgIH1cblxuICAgIC8vIFJpZ2h0IGVkZ2VcbiAgICBpID0gd2lkdGggLSAxO1xuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGhlaWdodDsgaisrICkge1xuICAgICAgY29uc3Qgc3VtID0gbWF0cml4MS5nZXQoIGksIGogKSArIG1hdHJpeDEuZ2V0KCBpIC0gMSwgaiApIC0gbWF0cml4Mi5nZXQoIGkgLSAxLCBqICkgKyBXQVZFX1NQRUVEICpcbiAgICAgICAgICAgICAgICAgICggbWF0cml4MS5nZXQoIGkgLSAxLCBqICkgLSBtYXRyaXgxLmdldCggaSwgaiApICsgbWF0cml4Mi5nZXQoIGkgLSAxLCBqICkgLSBtYXRyaXgyLmdldCggaSAtIDIsIGogKSApO1xuICAgICAgbWF0cml4MC5zZXQoIGksIGosIHN1bSApO1xuICAgIH1cblxuICAgIC8vIFRvcCBlZGdlXG4gICAgbGV0IGogPSAwO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHdpZHRoOyBpKysgKSB7XG4gICAgICBjb25zdCBzdW0gPSBtYXRyaXgxLmdldCggaSwgaiApICsgbWF0cml4MS5nZXQoIGksIGogKyAxICkgLSBtYXRyaXgyLmdldCggaSwgaiArIDEgKSArIFdBVkVfU1BFRUQgKlxuICAgICAgICAgICAgICAgICAgKCBtYXRyaXgxLmdldCggaSwgaiArIDEgKSAtIG1hdHJpeDEuZ2V0KCBpLCBqICkgKyBtYXRyaXgyLmdldCggaSwgaiArIDEgKSAtIG1hdHJpeDIuZ2V0KCBpLCBqICsgMiApICk7XG4gICAgICBtYXRyaXgwLnNldCggaSwgaiwgc3VtICk7XG4gICAgfVxuXG4gICAgLy8gQm90dG9tIGVkZ2VcbiAgICBqID0gaGVpZ2h0IC0gMTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB3aWR0aDsgaSsrICkge1xuICAgICAgY29uc3Qgc3VtID0gbWF0cml4MS5nZXQoIGksIGogKSArIG1hdHJpeDEuZ2V0KCBpLCBqIC0gMSApIC0gbWF0cml4Mi5nZXQoIGksIGogLSAxICkgKyBXQVZFX1NQRUVEICpcbiAgICAgICAgICAgICAgICAgICggbWF0cml4MS5nZXQoIGksIGogLSAxICkgLSBtYXRyaXgxLmdldCggaSwgaiApICsgbWF0cml4Mi5nZXQoIGksIGogLSAxICkgLSBtYXRyaXgyLmdldCggaSwgaiAtIDIgKSApO1xuICAgICAgbWF0cml4MC5zZXQoIGksIGosIHN1bSApO1xuICAgIH1cbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0xhdHRpY2UnLCBMYXR0aWNlICk7XG5leHBvcnQgZGVmYXVsdCBMYXR0aWNlOyJdLCJuYW1lcyI6WyJFbWl0dGVyIiwiQm91bmRzMiIsIk1hdHJpeCIsInNjZW5lcnlQaGV0IiwiV0FWRV9TUEVFRCIsIldBVkVfU1BFRURfU1FVQVJFRCIsIk5VTUJFUl9PRl9NQVRSSUNFUyIsIkxJR0hUX1ZJU0lUX1RIUkVTSE9MRCIsIkxhdHRpY2UiLCJnZXRCb3VuZHMiLCJ3aWR0aCIsImhlaWdodCIsInZpc2libGVCb3VuZHNDb250YWlucyIsImkiLCJqIiwiYiIsInZpc2libGVCb3VuZHMiLCJtaW5YIiwibWF4WCIsIm1pblkiLCJtYXhZIiwiY29udGFpbnMiLCJnZXRDZW50ZXJMaW5lVmFsdWVzIiwiYXJyYXkiLCJzYW1wbGluZ1dpZHRoIiwiZGFtcFgiLCJsZW5ndGgiLCJzYW1wbGluZ1ZlcnRpY2FsUG9zaXRpb24iLCJNYXRoIiwiZmxvb3IiLCJnZXRDdXJyZW50VmFsdWUiLCJhbGxvd2VkTWFzayIsImdldCIsIm1hdHJpY2VzIiwiY3VycmVudE1hdHJpeEluZGV4IiwiZ2V0SW50ZXJwb2xhdGVkVmFsdWUiLCJjdXJyZW50VmFsdWUiLCJsYXN0VmFsdWUiLCJnZXRMYXN0VmFsdWUiLCJpbnRlcnBvbGF0aW9uUmF0aW8iLCJzZXRDdXJyZW50VmFsdWUiLCJ2YWx1ZSIsInNldCIsInNldExhc3RWYWx1ZSIsInNldEFsbG93ZWQiLCJhbGxvd2VkIiwiaGFzQ2VsbEJlZW5WaXNpdGVkIiwidmlzaXRlZE1hdHJpeCIsImNsZWFyIiwiY2xlYXJSaWdodCIsImNvbHVtbiIsImsiLCJjaGFuZ2VkRW1pdHRlciIsImVtaXQiLCJnZXRPdXRwdXRDb2x1bW4iLCJkYW1wWSIsImEiLCJ2IiwicHVzaCIsInN0ZXAiLCJtYXRyaXgwIiwibWF0cml4MSIsIm1hdHJpeDIiLCJnZXRSb3dEaW1lbnNpb24iLCJnZXRDb2x1bW5EaW1lbnNpb24iLCJuZWlnaGJvclN1bSIsIm0xaWoiLCJhYnMiLCJzdW0iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLDJCQUEyQjtBQUMvQyxPQUFPQyxhQUFhLDBCQUEwQjtBQUM5QyxPQUFPQyxZQUFZLHlCQUF5QjtBQUM1QyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDLFlBQVk7QUFFWixpSEFBaUg7QUFDakgsbUhBQW1IO0FBQ25ILDhGQUE4RjtBQUM5RixNQUFNQyxhQUFhO0FBQ25CLE1BQU1DLHFCQUFxQkQsYUFBYUEsWUFBWSw2Q0FBNkM7QUFDakcsTUFBTUUscUJBQXFCLEdBQUcsb0ZBQW9GO0FBRWxILDhHQUE4RztBQUM5RyxxSEFBcUg7QUFDckgsc0hBQXNIO0FBQ3RILG1IQUFtSDtBQUNuSCx1RkFBdUY7QUFDdkYsTUFBTUMs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