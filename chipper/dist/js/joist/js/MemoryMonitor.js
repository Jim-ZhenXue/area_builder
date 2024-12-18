// Copyright 2018-2022, University of Colorado Boulder
/**
 * Monitors the memory usage over time.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import RunningAverage from '../../dot/js/RunningAverage.js';
import optionize from '../../phet-core/js/optionize.js';
import joist from './joist.js';
// constants
const MB = 1024 * 1024;
// globals
let hadMemoryFailure = false;
let MemoryMonitor = class MemoryMonitor {
    /**
   * Records a memory measurement.
   */ measure() {
        // @ts-expect-error Until we make typescript know about performance.memory
        if (!window.performance || !window.performance.memory || !window.performance.memory.usedJSHeapSize) {
            return;
        }
        // @ts-expect-error Until we make typescript know about performance.memory
        const currentMemory = window.performance.memory.usedJSHeapSize;
        this.lastMemory = currentMemory;
        const averageMemory = this.runningAverage.updateRunningAverage(currentMemory);
        if (this.memoryLimit && this.runningAverage.isSaturated() && !hadMemoryFailure && averageMemory > this.memoryLimit && currentMemory > this.memoryLimit * 0.5) {
            hadMemoryFailure = true;
            throw new Error(`Average memory used (${MemoryMonitor.memoryString(averageMemory)}) is above our memoryLimit (${MemoryMonitor.memoryString(this.memoryLimit)}). Current memory: ${MemoryMonitor.memoryString(currentMemory)}.`);
        }
    }
    /**
   * Converts a number of bytes into a quick-to-read memory string.
   */ static memoryString(bytes) {
        return `${Math.ceil(bytes / MB)}MB`;
    }
    constructor(providedOptions){
        const options = optionize()({
            // {number} - Quantity of measurements in the running average
            windowSize: 2000,
            // {number} - Number of megabytes before operations will throw an error
            memoryLimit: phet.chipper.queryParameters.memoryLimit
        }, providedOptions);
        this.memoryLimit = options.memoryLimit * MB;
        this.runningAverage = new RunningAverage(options.windowSize);
        this.lastMemory = 0;
    }
};
joist.register('MemoryMonitor', MemoryMonitor);
export default MemoryMonitor;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL01lbW9yeU1vbml0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTW9uaXRvcnMgdGhlIG1lbW9yeSB1c2FnZSBvdmVyIHRpbWUuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBSdW5uaW5nQXZlcmFnZSBmcm9tICcuLi8uLi9kb3QvanMvUnVubmluZ0F2ZXJhZ2UuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBNQiA9IDEwMjQgKiAxMDI0O1xuXG4vLyBnbG9iYWxzXG5sZXQgaGFkTWVtb3J5RmFpbHVyZSA9IGZhbHNlO1xuXG50eXBlIE1lbW9yeU1vbml0b3JPcHRpb25zID0ge1xuICB3aW5kb3dTaXplPzogbnVtYmVyO1xuICBtZW1vcnlMaW1pdD86IG51bWJlcjtcbn07XG5cbmNsYXNzIE1lbW9yeU1vbml0b3Ige1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgbWVtb3J5TGltaXQ6IG51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IHJ1bm5pbmdBdmVyYWdlOiBSdW5uaW5nQXZlcmFnZTtcbiAgcHJpdmF0ZSBsYXN0TWVtb3J5OiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBNZW1vcnlNb25pdG9yT3B0aW9ucyApIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE1lbW9yeU1vbml0b3JPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIHtudW1iZXJ9IC0gUXVhbnRpdHkgb2YgbWVhc3VyZW1lbnRzIGluIHRoZSBydW5uaW5nIGF2ZXJhZ2VcbiAgICAgIHdpbmRvd1NpemU6IDIwMDAsXG5cbiAgICAgIC8vIHtudW1iZXJ9IC0gTnVtYmVyIG9mIG1lZ2FieXRlcyBiZWZvcmUgb3BlcmF0aW9ucyB3aWxsIHRocm93IGFuIGVycm9yXG4gICAgICBtZW1vcnlMaW1pdDogcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5tZW1vcnlMaW1pdFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgdGhpcy5tZW1vcnlMaW1pdCA9IG9wdGlvbnMubWVtb3J5TGltaXQgKiBNQjtcbiAgICB0aGlzLnJ1bm5pbmdBdmVyYWdlID0gbmV3IFJ1bm5pbmdBdmVyYWdlKCBvcHRpb25zLndpbmRvd1NpemUgKTtcbiAgICB0aGlzLmxhc3RNZW1vcnkgPSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY29yZHMgYSBtZW1vcnkgbWVhc3VyZW1lbnQuXG4gICAqL1xuICBwdWJsaWMgbWVhc3VyZSgpOiB2b2lkIHtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVW50aWwgd2UgbWFrZSB0eXBlc2NyaXB0IGtub3cgYWJvdXQgcGVyZm9ybWFuY2UubWVtb3J5XG4gICAgaWYgKCAhd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2UubWVtb3J5IHx8ICF3aW5kb3cucGVyZm9ybWFuY2UubWVtb3J5LnVzZWRKU0hlYXBTaXplICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVW50aWwgd2UgbWFrZSB0eXBlc2NyaXB0IGtub3cgYWJvdXQgcGVyZm9ybWFuY2UubWVtb3J5XG4gICAgY29uc3QgY3VycmVudE1lbW9yeSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5tZW1vcnkudXNlZEpTSGVhcFNpemU7XG4gICAgdGhpcy5sYXN0TWVtb3J5ID0gY3VycmVudE1lbW9yeTtcbiAgICBjb25zdCBhdmVyYWdlTWVtb3J5ID0gdGhpcy5ydW5uaW5nQXZlcmFnZS51cGRhdGVSdW5uaW5nQXZlcmFnZSggY3VycmVudE1lbW9yeSApO1xuXG4gICAgaWYgKCB0aGlzLm1lbW9yeUxpbWl0ICYmXG4gICAgICAgICB0aGlzLnJ1bm5pbmdBdmVyYWdlLmlzU2F0dXJhdGVkKCkgJiZcbiAgICAgICAgICFoYWRNZW1vcnlGYWlsdXJlICYmXG4gICAgICAgICBhdmVyYWdlTWVtb3J5ID4gdGhpcy5tZW1vcnlMaW1pdCAmJlxuICAgICAgICAgY3VycmVudE1lbW9yeSA+IHRoaXMubWVtb3J5TGltaXQgKiAwLjUgKSB7XG4gICAgICBoYWRNZW1vcnlGYWlsdXJlID0gdHJ1ZTtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYEF2ZXJhZ2UgbWVtb3J5IHVzZWQgKCR7TWVtb3J5TW9uaXRvci5tZW1vcnlTdHJpbmcoIGF2ZXJhZ2VNZW1vcnkgKX0pIGlzIGFib3ZlIG91ciBtZW1vcnlMaW1pdCAoJHtNZW1vcnlNb25pdG9yLm1lbW9yeVN0cmluZyggdGhpcy5tZW1vcnlMaW1pdCApfSkuIEN1cnJlbnQgbWVtb3J5OiAke01lbW9yeU1vbml0b3IubWVtb3J5U3RyaW5nKCBjdXJyZW50TWVtb3J5ICl9LmAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBudW1iZXIgb2YgYnl0ZXMgaW50byBhIHF1aWNrLXRvLXJlYWQgbWVtb3J5IHN0cmluZy5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIG1lbW9yeVN0cmluZyggYnl0ZXM6IG51bWJlciApOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtNYXRoLmNlaWwoIGJ5dGVzIC8gTUIgKX1NQmA7XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdNZW1vcnlNb25pdG9yJywgTWVtb3J5TW9uaXRvciApO1xuZXhwb3J0IGRlZmF1bHQgTWVtb3J5TW9uaXRvcjsiXSwibmFtZXMiOlsiUnVubmluZ0F2ZXJhZ2UiLCJvcHRpb25pemUiLCJqb2lzdCIsIk1CIiwiaGFkTWVtb3J5RmFpbHVyZSIsIk1lbW9yeU1vbml0b3IiLCJtZWFzdXJlIiwid2luZG93IiwicGVyZm9ybWFuY2UiLCJtZW1vcnkiLCJ1c2VkSlNIZWFwU2l6ZSIsImN1cnJlbnRNZW1vcnkiLCJsYXN0TWVtb3J5IiwiYXZlcmFnZU1lbW9yeSIsInJ1bm5pbmdBdmVyYWdlIiwidXBkYXRlUnVubmluZ0F2ZXJhZ2UiLCJtZW1vcnlMaW1pdCIsImlzU2F0dXJhdGVkIiwiRXJyb3IiLCJtZW1vcnlTdHJpbmciLCJieXRlcyIsIk1hdGgiLCJjZWlsIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIndpbmRvd1NpemUiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLG9CQUFvQixpQ0FBaUM7QUFDNUQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsT0FBT0MsV0FBVyxhQUFhO0FBRS9CLFlBQVk7QUFDWixNQUFNQyxLQUFLLE9BQU87QUFFbEIsVUFBVTtBQUNWLElBQUlDLG1CQUFtQjtBQU92QixJQUFBLEFBQU1DLGdCQUFOLE1BQU1BO0lBcUJKOztHQUVDLEdBQ0QsQUFBT0MsVUFBZ0I7UUFFckIsMEVBQTBFO1FBQzFFLElBQUssQ0FBQ0MsT0FBT0MsV0FBVyxJQUFJLENBQUNELE9BQU9DLFdBQVcsQ0FBQ0MsTUFBTSxJQUFJLENBQUNGLE9BQU9DLFdBQVcsQ0FBQ0MsTUFBTSxDQUFDQyxjQUFjLEVBQUc7WUFDcEc7UUFDRjtRQUVBLDBFQUEwRTtRQUMxRSxNQUFNQyxnQkFBZ0JKLE9BQU9DLFdBQVcsQ0FBQ0MsTUFBTSxDQUFDQyxjQUFjO1FBQzlELElBQUksQ0FBQ0UsVUFBVSxHQUFHRDtRQUNsQixNQUFNRSxnQkFBZ0IsSUFBSSxDQUFDQyxjQUFjLENBQUNDLG9CQUFvQixDQUFFSjtRQUVoRSxJQUFLLElBQUksQ0FBQ0ssV0FBVyxJQUNoQixJQUFJLENBQUNGLGNBQWMsQ0FBQ0csV0FBVyxNQUMvQixDQUFDYixvQkFDRFMsZ0JBQWdCLElBQUksQ0FBQ0csV0FBVyxJQUNoQ0wsZ0JBQWdCLElBQUksQ0FBQ0ssV0FBVyxHQUFHLEtBQU07WUFDNUNaLG1CQUFtQjtZQUNuQixNQUFNLElBQUljLE1BQU8sQ0FBQyxxQkFBcUIsRUFBRWIsY0FBY2MsWUFBWSxDQUFFTixlQUFnQiw0QkFBNEIsRUFBRVIsY0FBY2MsWUFBWSxDQUFFLElBQUksQ0FBQ0gsV0FBVyxFQUFHLG1CQUFtQixFQUFFWCxjQUFjYyxZQUFZLENBQUVSLGVBQWdCLENBQUMsQ0FBQztRQUN2TztJQUNGO0lBRUE7O0dBRUMsR0FDRCxPQUFlUSxhQUFjQyxLQUFhLEVBQVc7UUFDbkQsT0FBTyxHQUFHQyxLQUFLQyxJQUFJLENBQUVGLFFBQVFqQixJQUFLLEVBQUUsQ0FBQztJQUN2QztJQTdDQSxZQUFvQm9CLGVBQXNDLENBQUc7UUFDM0QsTUFBTUMsVUFBVXZCLFlBQW1DO1lBRWpELDZEQUE2RDtZQUM3RHdCLFlBQVk7WUFFWix1RUFBdUU7WUFDdkVULGFBQWFVLEtBQUtDLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDWixXQUFXO1FBQ3ZELEdBQUdPO1FBRUgsSUFBSSxDQUFDUCxXQUFXLEdBQUdRLFFBQVFSLFdBQVcsR0FBR2I7UUFDekMsSUFBSSxDQUFDVyxjQUFjLEdBQUcsSUFBSWQsZUFBZ0J3QixRQUFRQyxVQUFVO1FBQzVELElBQUksQ0FBQ2IsVUFBVSxHQUFHO0lBQ3BCO0FBaUNGO0FBRUFWLE1BQU0yQixRQUFRLENBQUUsaUJBQWlCeEI7QUFDakMsZUFBZUEsY0FBYyJ9