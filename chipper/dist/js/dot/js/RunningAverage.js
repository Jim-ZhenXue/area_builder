// Copyright 2017-2020, University of Colorado Boulder
/**
 * Data structure that keeps track of running average over a given window.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */ import dot from './dot.js';
let RunningAverage = class RunningAverage {
    /**
   * Clear the running average.
   * @public
   */ clear() {
        this.total = 0;
        this.numSamples = 0;
        // Need to clear all of the samples
        for(let i = 0; i < this.windowSize; i++){
            this.samples[i] = 0;
        }
    }
    /**
   * Gets the current value of the running average.
   * @public
   *
   * @returns {number}
   */ getRunningAverage() {
        return this.total / this.numSamples;
    }
    /**
   * Returns whether the number of samples is at least as large as the window size (the buffer is full).
   * @public
   *
   * @returns {boolean}
   */ isSaturated() {
        return this.numSamples >= this.windowSize;
    }
    /**
   * Add a data point to the average and return the new running average.
   * @public
   *
   * @param {number} sample
   * @returns {number}
   */ updateRunningAverage(sample) {
        assert && assert(typeof sample === 'number' && isFinite(sample));
        // Limit at the window size
        this.numSamples = Math.min(this.windowSize, this.numSamples + 1);
        // Remove the old sample (will be 0 if there was no sample yet, due to clear())
        this.total -= this.samples[this.sampleIndex];
        assert && assert(isFinite(this.total));
        // Add in the new sample
        this.total += sample;
        assert && assert(isFinite(this.total));
        // Overwrite in the array and move to the next index
        this.samples[this.sampleIndex] = sample;
        this.sampleIndex = (this.sampleIndex + 1) % this.windowSize;
        return this.getRunningAverage();
    }
    /**
   * @param {number} windowSize - number of points to average
   */ constructor(windowSize){
        assert && assert(windowSize > 0, 'window size must be positive');
        // @private {number}
        this.windowSize = windowSize;
        // @private {number[]} - Used circularly.
        this.samples = new Array(windowSize);
        // @private {number} - We add/subtract samples in a circular array pattern using this index.
        this.sampleIndex = 0;
        // @private {number} - Total sum of the samples within the window (not yet divided by number of samples)
        this.total = 0;
        // @private {number} - number of samples received so far
        this.numSamples = 0;
        this.clear();
    }
};
dot.register('RunningAverage', RunningAverage);
export default RunningAverage;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SdW5uaW5nQXZlcmFnZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEYXRhIHN0cnVjdHVyZSB0aGF0IGtlZXBzIHRyYWNrIG9mIHJ1bm5pbmcgYXZlcmFnZSBvdmVyIGEgZ2l2ZW4gd2luZG93LlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuXG5jbGFzcyBSdW5uaW5nQXZlcmFnZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gd2luZG93U2l6ZSAtIG51bWJlciBvZiBwb2ludHMgdG8gYXZlcmFnZVxuICAgKi9cbiAgY29uc3RydWN0b3IoIHdpbmRvd1NpemUgKSB7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3aW5kb3dTaXplID4gMCwgJ3dpbmRvdyBzaXplIG11c3QgYmUgcG9zaXRpdmUnICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxuICAgIHRoaXMud2luZG93U2l6ZSA9IHdpbmRvd1NpemU7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyW119IC0gVXNlZCBjaXJjdWxhcmx5LlxuICAgIHRoaXMuc2FtcGxlcyA9IG5ldyBBcnJheSggd2luZG93U2l6ZSApO1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBXZSBhZGQvc3VidHJhY3Qgc2FtcGxlcyBpbiBhIGNpcmN1bGFyIGFycmF5IHBhdHRlcm4gdXNpbmcgdGhpcyBpbmRleC5cbiAgICB0aGlzLnNhbXBsZUluZGV4ID0gMDtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gVG90YWwgc3VtIG9mIHRoZSBzYW1wbGVzIHdpdGhpbiB0aGUgd2luZG93IChub3QgeWV0IGRpdmlkZWQgYnkgbnVtYmVyIG9mIHNhbXBsZXMpXG4gICAgdGhpcy50b3RhbCA9IDA7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIG51bWJlciBvZiBzYW1wbGVzIHJlY2VpdmVkIHNvIGZhclxuICAgIHRoaXMubnVtU2FtcGxlcyA9IDA7XG5cbiAgICB0aGlzLmNsZWFyKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgcnVubmluZyBhdmVyYWdlLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLnRvdGFsID0gMDtcbiAgICB0aGlzLm51bVNhbXBsZXMgPSAwO1xuXG4gICAgLy8gTmVlZCB0byBjbGVhciBhbGwgb2YgdGhlIHNhbXBsZXNcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLndpbmRvd1NpemU7IGkrKyApIHtcbiAgICAgIHRoaXMuc2FtcGxlc1sgaSBdID0gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgcnVubmluZyBhdmVyYWdlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBnZXRSdW5uaW5nQXZlcmFnZSgpIHtcbiAgICByZXR1cm4gdGhpcy50b3RhbCAvIHRoaXMubnVtU2FtcGxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIG51bWJlciBvZiBzYW1wbGVzIGlzIGF0IGxlYXN0IGFzIGxhcmdlIGFzIHRoZSB3aW5kb3cgc2l6ZSAodGhlIGJ1ZmZlciBpcyBmdWxsKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU2F0dXJhdGVkKCkge1xuICAgIHJldHVybiB0aGlzLm51bVNhbXBsZXMgPj0gdGhpcy53aW5kb3dTaXplO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGRhdGEgcG9pbnQgdG8gdGhlIGF2ZXJhZ2UgYW5kIHJldHVybiB0aGUgbmV3IHJ1bm5pbmcgYXZlcmFnZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2FtcGxlXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICB1cGRhdGVSdW5uaW5nQXZlcmFnZSggc2FtcGxlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBzYW1wbGUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBzYW1wbGUgKSApO1xuXG4gICAgLy8gTGltaXQgYXQgdGhlIHdpbmRvdyBzaXplXG4gICAgdGhpcy5udW1TYW1wbGVzID0gTWF0aC5taW4oIHRoaXMud2luZG93U2l6ZSwgdGhpcy5udW1TYW1wbGVzICsgMSApO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBvbGQgc2FtcGxlICh3aWxsIGJlIDAgaWYgdGhlcmUgd2FzIG5vIHNhbXBsZSB5ZXQsIGR1ZSB0byBjbGVhcigpKVxuICAgIHRoaXMudG90YWwgLT0gdGhpcy5zYW1wbGVzWyB0aGlzLnNhbXBsZUluZGV4IF07XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMudG90YWwgKSApO1xuXG4gICAgLy8gQWRkIGluIHRoZSBuZXcgc2FtcGxlXG4gICAgdGhpcy50b3RhbCArPSBzYW1wbGU7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMudG90YWwgKSApO1xuXG4gICAgLy8gT3ZlcndyaXRlIGluIHRoZSBhcnJheSBhbmQgbW92ZSB0byB0aGUgbmV4dCBpbmRleFxuICAgIHRoaXMuc2FtcGxlc1sgdGhpcy5zYW1wbGVJbmRleCBdID0gc2FtcGxlO1xuICAgIHRoaXMuc2FtcGxlSW5kZXggPSAoIHRoaXMuc2FtcGxlSW5kZXggKyAxICkgJSB0aGlzLndpbmRvd1NpemU7XG5cbiAgICByZXR1cm4gdGhpcy5nZXRSdW5uaW5nQXZlcmFnZSgpO1xuICB9XG59XG5cbmRvdC5yZWdpc3RlciggJ1J1bm5pbmdBdmVyYWdlJywgUnVubmluZ0F2ZXJhZ2UgKTtcblxuZXhwb3J0IGRlZmF1bHQgUnVubmluZ0F2ZXJhZ2U7Il0sIm5hbWVzIjpbImRvdCIsIlJ1bm5pbmdBdmVyYWdlIiwiY2xlYXIiLCJ0b3RhbCIsIm51bVNhbXBsZXMiLCJpIiwid2luZG93U2l6ZSIsInNhbXBsZXMiLCJnZXRSdW5uaW5nQXZlcmFnZSIsImlzU2F0dXJhdGVkIiwidXBkYXRlUnVubmluZ0F2ZXJhZ2UiLCJzYW1wbGUiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsIk1hdGgiLCJtaW4iLCJzYW1wbGVJbmRleCIsImNvbnN0cnVjdG9yIiwiQXJyYXkiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsU0FBUyxXQUFXO0FBRTNCLElBQUEsQUFBTUMsaUJBQU4sTUFBTUE7SUEyQko7OztHQUdDLEdBQ0RDLFFBQVE7UUFDTixJQUFJLENBQUNDLEtBQUssR0FBRztRQUNiLElBQUksQ0FBQ0MsVUFBVSxHQUFHO1FBRWxCLG1DQUFtQztRQUNuQyxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSSxJQUFJLENBQUNDLFVBQVUsRUFBRUQsSUFBTTtZQUMxQyxJQUFJLENBQUNFLE9BQU8sQ0FBRUYsRUFBRyxHQUFHO1FBQ3RCO0lBQ0Y7SUFFQTs7Ozs7R0FLQyxHQUNERyxvQkFBb0I7UUFDbEIsT0FBTyxJQUFJLENBQUNMLEtBQUssR0FBRyxJQUFJLENBQUNDLFVBQVU7SUFDckM7SUFFQTs7Ozs7R0FLQyxHQUNESyxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUNMLFVBQVUsSUFBSSxJQUFJLENBQUNFLFVBQVU7SUFDM0M7SUFFQTs7Ozs7O0dBTUMsR0FDREkscUJBQXNCQyxNQUFNLEVBQUc7UUFDN0JDLFVBQVVBLE9BQVEsT0FBT0QsV0FBVyxZQUFZRSxTQUFVRjtRQUUxRCwyQkFBMkI7UUFDM0IsSUFBSSxDQUFDUCxVQUFVLEdBQUdVLEtBQUtDLEdBQUcsQ0FBRSxJQUFJLENBQUNULFVBQVUsRUFBRSxJQUFJLENBQUNGLFVBQVUsR0FBRztRQUUvRCwrRUFBK0U7UUFDL0UsSUFBSSxDQUFDRCxLQUFLLElBQUksSUFBSSxDQUFDSSxPQUFPLENBQUUsSUFBSSxDQUFDUyxXQUFXLENBQUU7UUFDOUNKLFVBQVVBLE9BQVFDLFNBQVUsSUFBSSxDQUFDVixLQUFLO1FBRXRDLHdCQUF3QjtRQUN4QixJQUFJLENBQUNBLEtBQUssSUFBSVE7UUFDZEMsVUFBVUEsT0FBUUMsU0FBVSxJQUFJLENBQUNWLEtBQUs7UUFFdEMsb0RBQW9EO1FBQ3BELElBQUksQ0FBQ0ksT0FBTyxDQUFFLElBQUksQ0FBQ1MsV0FBVyxDQUFFLEdBQUdMO1FBQ25DLElBQUksQ0FBQ0ssV0FBVyxHQUFHLEFBQUUsQ0FBQSxJQUFJLENBQUNBLFdBQVcsR0FBRyxDQUFBLElBQU0sSUFBSSxDQUFDVixVQUFVO1FBRTdELE9BQU8sSUFBSSxDQUFDRSxpQkFBaUI7SUFDL0I7SUF0RkE7O0dBRUMsR0FDRFMsWUFBYVgsVUFBVSxDQUFHO1FBRXhCTSxVQUFVQSxPQUFRTixhQUFhLEdBQUc7UUFFbEMsb0JBQW9CO1FBQ3BCLElBQUksQ0FBQ0EsVUFBVSxHQUFHQTtRQUVsQix5Q0FBeUM7UUFDekMsSUFBSSxDQUFDQyxPQUFPLEdBQUcsSUFBSVcsTUFBT1o7UUFFMUIsNEZBQTRGO1FBQzVGLElBQUksQ0FBQ1UsV0FBVyxHQUFHO1FBRW5CLHdHQUF3RztRQUN4RyxJQUFJLENBQUNiLEtBQUssR0FBRztRQUViLHdEQUF3RDtRQUN4RCxJQUFJLENBQUNDLFVBQVUsR0FBRztRQUVsQixJQUFJLENBQUNGLEtBQUs7SUFDWjtBQWdFRjtBQUVBRixJQUFJbUIsUUFBUSxDQUFFLGtCQUFrQmxCO0FBRWhDLGVBQWVBLGVBQWUifQ==