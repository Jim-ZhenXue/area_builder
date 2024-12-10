// Copyright 2021-2022, University of Colorado Boulder
/**
 * This file defines an AudioWorklet processor for a peak detector.  This code is intended to run on the audio rendering
 * thread in the AudioWorkletGlobalScope.  It must be loaded using audioWorklet.addModule in the main JavaScript thread.
 *
 * Since it is directly loaded onto a separate thread, this file should be in JavaScript and should not be converted to
 * TypeScript.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ const UPDATE_PERIOD = 1000; // in ms
let PeakDetectorProcessor = class PeakDetectorProcessor extends AudioWorkletProcessor {
    /**
   * Process the audio information - see the Web Audio documentation for details about the parameters for this method.
   * @param inputs
   * @param outputs
   * @param parameters
   * @returns {boolean}
   * @public
   */ process(inputs, outputs, parameters) {
        const now = Date.now();
        const input = inputs[0];
        // Scan through the input data and see if the peak value has been exceeded and, if so, set a new value.  This only
        // looks at one channel of the first input, since that's all that has been needed so far.
        const channelData = input[0];
        for(let i = 0; i < channelData.length; i++){
            this.peak = Math.max(Math.abs(channelData[i]), this.peak);
        }
        // If the update period has been exceeded, send a message to the main thread with the current peak and reset it.
        if (now - this.lastUpdateTime >= UPDATE_PERIOD) {
            this.port.postMessage({
                peak: this.peak
            });
            // Reset the timer and the peak.
            this.lastUpdateTime = now;
            this.peak = 0;
        }
        return true;
    }
    constructor(){
        super();
        this.lastUpdateTime = 0;
        this.peak = 0;
    }
};
registerProcessor('peak-detector', PeakDetectorProcessor);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3BlYWstZGV0ZWN0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhpcyBmaWxlIGRlZmluZXMgYW4gQXVkaW9Xb3JrbGV0IHByb2Nlc3NvciBmb3IgYSBwZWFrIGRldGVjdG9yLiAgVGhpcyBjb2RlIGlzIGludGVuZGVkIHRvIHJ1biBvbiB0aGUgYXVkaW8gcmVuZGVyaW5nXG4gKiB0aHJlYWQgaW4gdGhlIEF1ZGlvV29ya2xldEdsb2JhbFNjb3BlLiAgSXQgbXVzdCBiZSBsb2FkZWQgdXNpbmcgYXVkaW9Xb3JrbGV0LmFkZE1vZHVsZSBpbiB0aGUgbWFpbiBKYXZhU2NyaXB0IHRocmVhZC5cbiAqXG4gKiBTaW5jZSBpdCBpcyBkaXJlY3RseSBsb2FkZWQgb250byBhIHNlcGFyYXRlIHRocmVhZCwgdGhpcyBmaWxlIHNob3VsZCBiZSBpbiBKYXZhU2NyaXB0IGFuZCBzaG91bGQgbm90IGJlIGNvbnZlcnRlZCB0b1xuICogVHlwZVNjcmlwdC5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IFVQREFURV9QRVJJT0QgPSAxMDAwOyAvLyBpbiBtc1xuXG5jbGFzcyBQZWFrRGV0ZWN0b3JQcm9jZXNzb3IgZXh0ZW5kcyBBdWRpb1dvcmtsZXRQcm9jZXNzb3Ige1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5sYXN0VXBkYXRlVGltZSA9IDA7XG4gICAgdGhpcy5wZWFrID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIHRoZSBhdWRpbyBpbmZvcm1hdGlvbiAtIHNlZSB0aGUgV2ViIEF1ZGlvIGRvY3VtZW50YXRpb24gZm9yIGRldGFpbHMgYWJvdXQgdGhlIHBhcmFtZXRlcnMgZm9yIHRoaXMgbWV0aG9kLlxuICAgKiBAcGFyYW0gaW5wdXRzXG4gICAqIEBwYXJhbSBvdXRwdXRzXG4gICAqIEBwYXJhbSBwYXJhbWV0ZXJzXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAcHVibGljXG4gICAqL1xuICBwcm9jZXNzKCBpbnB1dHMsIG91dHB1dHMsIHBhcmFtZXRlcnMgKSB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBpbnB1dCA9IGlucHV0c1sgMCBdO1xuXG4gICAgLy8gU2NhbiB0aHJvdWdoIHRoZSBpbnB1dCBkYXRhIGFuZCBzZWUgaWYgdGhlIHBlYWsgdmFsdWUgaGFzIGJlZW4gZXhjZWVkZWQgYW5kLCBpZiBzbywgc2V0IGEgbmV3IHZhbHVlLiAgVGhpcyBvbmx5XG4gICAgLy8gbG9va3MgYXQgb25lIGNoYW5uZWwgb2YgdGhlIGZpcnN0IGlucHV0LCBzaW5jZSB0aGF0J3MgYWxsIHRoYXQgaGFzIGJlZW4gbmVlZGVkIHNvIGZhci5cbiAgICBjb25zdCBjaGFubmVsRGF0YSA9IGlucHV0WyAwIF07XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY2hhbm5lbERhdGEubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLnBlYWsgPSBNYXRoLm1heCggTWF0aC5hYnMoIGNoYW5uZWxEYXRhWyBpIF0gKSwgdGhpcy5wZWFrICk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHVwZGF0ZSBwZXJpb2QgaGFzIGJlZW4gZXhjZWVkZWQsIHNlbmQgYSBtZXNzYWdlIHRvIHRoZSBtYWluIHRocmVhZCB3aXRoIHRoZSBjdXJyZW50IHBlYWsgYW5kIHJlc2V0IGl0LlxuICAgIGlmICggbm93IC0gdGhpcy5sYXN0VXBkYXRlVGltZSA+PSBVUERBVEVfUEVSSU9EICkge1xuICAgICAgdGhpcy5wb3J0LnBvc3RNZXNzYWdlKCB7IHBlYWs6IHRoaXMucGVhayB9ICk7XG5cbiAgICAgIC8vIFJlc2V0IHRoZSB0aW1lciBhbmQgdGhlIHBlYWsuXG4gICAgICB0aGlzLmxhc3RVcGRhdGVUaW1lID0gbm93O1xuICAgICAgdGhpcy5wZWFrID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5yZWdpc3RlclByb2Nlc3NvciggJ3BlYWstZGV0ZWN0b3InLCBQZWFrRGV0ZWN0b3JQcm9jZXNzb3IgKTsiXSwibmFtZXMiOlsiVVBEQVRFX1BFUklPRCIsIlBlYWtEZXRlY3RvclByb2Nlc3NvciIsIkF1ZGlvV29ya2xldFByb2Nlc3NvciIsInByb2Nlc3MiLCJpbnB1dHMiLCJvdXRwdXRzIiwicGFyYW1ldGVycyIsIm5vdyIsIkRhdGUiLCJpbnB1dCIsImNoYW5uZWxEYXRhIiwiaSIsImxlbmd0aCIsInBlYWsiLCJNYXRoIiwibWF4IiwiYWJzIiwibGFzdFVwZGF0ZVRpbWUiLCJwb3J0IiwicG9zdE1lc3NhZ2UiLCJjb25zdHJ1Y3RvciIsInJlZ2lzdGVyUHJvY2Vzc29yIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7O0NBUUMsR0FFRCxNQUFNQSxnQkFBZ0IsTUFBTSxRQUFRO0FBRXBDLElBQUEsQUFBTUMsd0JBQU4sTUFBTUEsOEJBQThCQztJQVFsQzs7Ozs7OztHQU9DLEdBQ0RDLFFBQVNDLE1BQU0sRUFBRUMsT0FBTyxFQUFFQyxVQUFVLEVBQUc7UUFDckMsTUFBTUMsTUFBTUMsS0FBS0QsR0FBRztRQUNwQixNQUFNRSxRQUFRTCxNQUFNLENBQUUsRUFBRztRQUV6QixrSEFBa0g7UUFDbEgseUZBQXlGO1FBQ3pGLE1BQU1NLGNBQWNELEtBQUssQ0FBRSxFQUFHO1FBQzlCLElBQU0sSUFBSUUsSUFBSSxHQUFHQSxJQUFJRCxZQUFZRSxNQUFNLEVBQUVELElBQU07WUFDN0MsSUFBSSxDQUFDRSxJQUFJLEdBQUdDLEtBQUtDLEdBQUcsQ0FBRUQsS0FBS0UsR0FBRyxDQUFFTixXQUFXLENBQUVDLEVBQUcsR0FBSSxJQUFJLENBQUNFLElBQUk7UUFDL0Q7UUFFQSxnSEFBZ0g7UUFDaEgsSUFBS04sTUFBTSxJQUFJLENBQUNVLGNBQWMsSUFBSWpCLGVBQWdCO1lBQ2hELElBQUksQ0FBQ2tCLElBQUksQ0FBQ0MsV0FBVyxDQUFFO2dCQUFFTixNQUFNLElBQUksQ0FBQ0EsSUFBSTtZQUFDO1lBRXpDLGdDQUFnQztZQUNoQyxJQUFJLENBQUNJLGNBQWMsR0FBR1Y7WUFDdEIsSUFBSSxDQUFDTSxJQUFJLEdBQUc7UUFDZDtRQUVBLE9BQU87SUFDVDtJQW5DQU8sYUFBYztRQUNaLEtBQUs7UUFDTCxJQUFJLENBQUNILGNBQWMsR0FBRztRQUN0QixJQUFJLENBQUNKLElBQUksR0FBRztJQUNkO0FBZ0NGO0FBRUFRLGtCQUFtQixpQkFBaUJwQiJ9