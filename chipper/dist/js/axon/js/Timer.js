// Copyright 2019-2024, University of Colorado Boulder
/**
 * Timer so that other modules can run timing related code through the simulation's requestAnimationFrame. Use its
 * Emitter interface for adding/removing listeners.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import axon from './axon.js';
import TinyEmitter from './TinyEmitter.js';
let Timer = class Timer extends TinyEmitter {
    /**
   * Adds a listener to be called back once after the specified time in milliseconds
   * @param listener - called with no arguments
   * @param timeout in milliseconds
   * @returns an internally-wrapped listener which can be removed with clearTimeout
   */ setTimeout(listener, timeout) {
        let elapsed = 0;
        const callback = (dt)=>{
            elapsed += dt;
            // Convert seconds to ms and see if item has timed out
            if (elapsed * 1000 >= timeout) {
                // make sure that this callback hasn't already been removed by another listener while emit() is in progress
                if (this.hasListener(callback)) {
                    listener();
                    this.removeListener(callback);
                }
            }
        };
        this.addListener(callback);
        // Return the callback so it can be removed with removeStepListener
        return callback;
    }
    /**
   * Clear a scheduled timeout. If there was no timeout, nothing is done.
   */ clearTimeout(listener) {
        if (this.hasListener(listener)) {
            this.removeListener(listener);
        }
    }
    /**
   * Adds a listener to be called at specified intervals (in milliseconds)
   * @param listener - called with no arguments
   * @param interval - in milliseconds
   * @returns an internally-wrapped listener which can be removed with clearInterval
   */ setInterval(listener, interval) {
        let elapsed = 0;
        const callback = (dt)=>{
            elapsed += dt;
            // Convert seconds to ms and see if item has timed out
            while(elapsed * 1000 >= interval && this.hasListener(callback)){
                listener();
                elapsed = elapsed - interval / 1000.0; // Save the leftover time so it won't accumulate
            }
        };
        this.addListener(callback);
        // Return the callback so it can be removed if needed.
        return callback;
    }
    /**
   * Clear a scheduled interval. If there was no interval, nothing is done.
   */ clearInterval(listener) {
        if (this.hasListener(listener)) {
            this.removeListener(listener);
        }
    }
    /**
   * Run a callback on the next frame. This method is largely for clarity.
   */ runOnNextTick(listener) {
        this.setTimeout(listener, 0);
    }
};
export { Timer as default };
axon.register('Timer', Timer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvVGltZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGltZXIgc28gdGhhdCBvdGhlciBtb2R1bGVzIGNhbiBydW4gdGltaW5nIHJlbGF0ZWQgY29kZSB0aHJvdWdoIHRoZSBzaW11bGF0aW9uJ3MgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLiBVc2UgaXRzXG4gKiBFbWl0dGVyIGludGVyZmFjZSBmb3IgYWRkaW5nL3JlbW92aW5nIGxpc3RlbmVycy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi9UaW55RW1pdHRlci5qcyc7XG5cbmV4cG9ydCB0eXBlIFRpbWVyTGlzdGVuZXIgPSAoIGR0OiBudW1iZXIgKSA9PiB2b2lkO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lciBleHRlbmRzIFRpbnlFbWl0dGVyPFsgbnVtYmVyIF0+IHtcblxuICAvKipcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCBiYWNrIG9uY2UgYWZ0ZXIgdGhlIHNwZWNpZmllZCB0aW1lIGluIG1pbGxpc2Vjb25kc1xuICAgKiBAcGFyYW0gbGlzdGVuZXIgLSBjYWxsZWQgd2l0aCBubyBhcmd1bWVudHNcbiAgICogQHBhcmFtIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzXG4gICAqIEByZXR1cm5zIGFuIGludGVybmFsbHktd3JhcHBlZCBsaXN0ZW5lciB3aGljaCBjYW4gYmUgcmVtb3ZlZCB3aXRoIGNsZWFyVGltZW91dFxuICAgKi9cbiAgcHVibGljIHNldFRpbWVvdXQoIGxpc3RlbmVyOiAoKSA9PiB2b2lkLCB0aW1lb3V0OiBudW1iZXIgKTogVGltZXJMaXN0ZW5lciB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgICBsZXQgZWxhcHNlZCA9IDA7XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoIGR0OiBudW1iZXIgKSA9PiB7XG4gICAgICBlbGFwc2VkICs9IGR0O1xuXG4gICAgICAvLyBDb252ZXJ0IHNlY29uZHMgdG8gbXMgYW5kIHNlZSBpZiBpdGVtIGhhcyB0aW1lZCBvdXRcbiAgICAgIGlmICggZWxhcHNlZCAqIDEwMDAgPj0gdGltZW91dCApIHtcblxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGlzIGNhbGxiYWNrIGhhc24ndCBhbHJlYWR5IGJlZW4gcmVtb3ZlZCBieSBhbm90aGVyIGxpc3RlbmVyIHdoaWxlIGVtaXQoKSBpcyBpbiBwcm9ncmVzc1xuICAgICAgICBpZiAoIHRoaXMuaGFzTGlzdGVuZXIoIGNhbGxiYWNrICkgKSB7XG4gICAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCBjYWxsYmFjayApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmFkZExpc3RlbmVyKCBjYWxsYmFjayApO1xuXG4gICAgLy8gUmV0dXJuIHRoZSBjYWxsYmFjayBzbyBpdCBjYW4gYmUgcmVtb3ZlZCB3aXRoIHJlbW92ZVN0ZXBMaXN0ZW5lclxuICAgIHJldHVybiBjYWxsYmFjaztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBhIHNjaGVkdWxlZCB0aW1lb3V0LiBJZiB0aGVyZSB3YXMgbm8gdGltZW91dCwgbm90aGluZyBpcyBkb25lLlxuICAgKi9cbiAgcHVibGljIGNsZWFyVGltZW91dCggbGlzdGVuZXI6IFRpbWVyTGlzdGVuZXIgKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmhhc0xpc3RlbmVyKCBsaXN0ZW5lciApICkge1xuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lciggbGlzdGVuZXIgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCBhdCBzcGVjaWZpZWQgaW50ZXJ2YWxzIChpbiBtaWxsaXNlY29uZHMpXG4gICAqIEBwYXJhbSBsaXN0ZW5lciAtIGNhbGxlZCB3aXRoIG5vIGFyZ3VtZW50c1xuICAgKiBAcGFyYW0gaW50ZXJ2YWwgLSBpbiBtaWxsaXNlY29uZHNcbiAgICogQHJldHVybnMgYW4gaW50ZXJuYWxseS13cmFwcGVkIGxpc3RlbmVyIHdoaWNoIGNhbiBiZSByZW1vdmVkIHdpdGggY2xlYXJJbnRlcnZhbFxuICAgKi9cbiAgcHVibGljIHNldEludGVydmFsKCBsaXN0ZW5lcjogKCkgPT4gdm9pZCwgaW50ZXJ2YWw6IG51bWJlciApOiBUaW1lckxpc3RlbmVyIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgIGxldCBlbGFwc2VkID0gMDtcbiAgICBjb25zdCBjYWxsYmFjayA9ICggZHQ6IG51bWJlciApID0+IHtcbiAgICAgIGVsYXBzZWQgKz0gZHQ7XG5cbiAgICAgIC8vIENvbnZlcnQgc2Vjb25kcyB0byBtcyBhbmQgc2VlIGlmIGl0ZW0gaGFzIHRpbWVkIG91dFxuICAgICAgd2hpbGUgKCBlbGFwc2VkICogMTAwMCA+PSBpbnRlcnZhbCAmJiB0aGlzLmhhc0xpc3RlbmVyKCBjYWxsYmFjayApICkge1xuICAgICAgICBsaXN0ZW5lcigpO1xuICAgICAgICBlbGFwc2VkID0gZWxhcHNlZCAtIGludGVydmFsIC8gMTAwMC4wOyAvLyBTYXZlIHRoZSBsZWZ0b3ZlciB0aW1lIHNvIGl0IHdvbid0IGFjY3VtdWxhdGVcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuYWRkTGlzdGVuZXIoIGNhbGxiYWNrICk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGNhbGxiYWNrIHNvIGl0IGNhbiBiZSByZW1vdmVkIGlmIG5lZWRlZC5cbiAgICByZXR1cm4gY2FsbGJhY2s7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgYSBzY2hlZHVsZWQgaW50ZXJ2YWwuIElmIHRoZXJlIHdhcyBubyBpbnRlcnZhbCwgbm90aGluZyBpcyBkb25lLlxuICAgKi9cbiAgcHVibGljIGNsZWFySW50ZXJ2YWwoIGxpc3RlbmVyOiBUaW1lckxpc3RlbmVyICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5oYXNMaXN0ZW5lciggbGlzdGVuZXIgKSApIHtcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoIGxpc3RlbmVyICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhIGNhbGxiYWNrIG9uIHRoZSBuZXh0IGZyYW1lLiBUaGlzIG1ldGhvZCBpcyBsYXJnZWx5IGZvciBjbGFyaXR5LlxuICAgKi9cbiAgcHVibGljIHJ1bk9uTmV4dFRpY2soIGxpc3RlbmVyOiAoKSA9PiB2b2lkICk6IHZvaWQge1xuICAgIHRoaXMuc2V0VGltZW91dCggbGlzdGVuZXIsIDAgKTtcbiAgfVxufVxuXG5heG9uLnJlZ2lzdGVyKCAnVGltZXInLCBUaW1lciApOyJdLCJuYW1lcyI6WyJheG9uIiwiVGlueUVtaXR0ZXIiLCJUaW1lciIsInNldFRpbWVvdXQiLCJsaXN0ZW5lciIsInRpbWVvdXQiLCJlbGFwc2VkIiwiY2FsbGJhY2siLCJkdCIsImhhc0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJhZGRMaXN0ZW5lciIsImNsZWFyVGltZW91dCIsInNldEludGVydmFsIiwiaW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwicnVuT25OZXh0VGljayIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxVQUFVLFlBQVk7QUFDN0IsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUk1QixJQUFBLEFBQU1DLFFBQU4sTUFBTUEsY0FBY0Q7SUFFakM7Ozs7O0dBS0MsR0FDRCxBQUFPRSxXQUFZQyxRQUFvQixFQUFFQyxPQUFlLEVBQWtCO1FBQ3hFLElBQUlDLFVBQVU7UUFDZCxNQUFNQyxXQUFXLENBQUVDO1lBQ2pCRixXQUFXRTtZQUVYLHNEQUFzRDtZQUN0RCxJQUFLRixVQUFVLFFBQVFELFNBQVU7Z0JBRS9CLDJHQUEyRztnQkFDM0csSUFBSyxJQUFJLENBQUNJLFdBQVcsQ0FBRUYsV0FBYTtvQkFDbENIO29CQUNBLElBQUksQ0FBQ00sY0FBYyxDQUFFSDtnQkFDdkI7WUFDRjtRQUNGO1FBQ0EsSUFBSSxDQUFDSSxXQUFXLENBQUVKO1FBRWxCLG1FQUFtRTtRQUNuRSxPQUFPQTtJQUNUO0lBRUE7O0dBRUMsR0FDRCxBQUFPSyxhQUFjUixRQUF1QixFQUFTO1FBQ25ELElBQUssSUFBSSxDQUFDSyxXQUFXLENBQUVMLFdBQWE7WUFDbEMsSUFBSSxDQUFDTSxjQUFjLENBQUVOO1FBQ3ZCO0lBQ0Y7SUFFQTs7Ozs7R0FLQyxHQUNELEFBQU9TLFlBQWFULFFBQW9CLEVBQUVVLFFBQWdCLEVBQWtCO1FBQzFFLElBQUlSLFVBQVU7UUFDZCxNQUFNQyxXQUFXLENBQUVDO1lBQ2pCRixXQUFXRTtZQUVYLHNEQUFzRDtZQUN0RCxNQUFRRixVQUFVLFFBQVFRLFlBQVksSUFBSSxDQUFDTCxXQUFXLENBQUVGLFVBQWE7Z0JBQ25FSDtnQkFDQUUsVUFBVUEsVUFBVVEsV0FBVyxRQUFRLGdEQUFnRDtZQUN6RjtRQUNGO1FBQ0EsSUFBSSxDQUFDSCxXQUFXLENBQUVKO1FBRWxCLHNEQUFzRDtRQUN0RCxPQUFPQTtJQUNUO0lBRUE7O0dBRUMsR0FDRCxBQUFPUSxjQUFlWCxRQUF1QixFQUFTO1FBQ3BELElBQUssSUFBSSxDQUFDSyxXQUFXLENBQUVMLFdBQWE7WUFDbEMsSUFBSSxDQUFDTSxjQUFjLENBQUVOO1FBQ3ZCO0lBQ0Y7SUFFQTs7R0FFQyxHQUNELEFBQU9ZLGNBQWVaLFFBQW9CLEVBQVM7UUFDakQsSUFBSSxDQUFDRCxVQUFVLENBQUVDLFVBQVU7SUFDN0I7QUFDRjtBQTVFQSxTQUFxQkYsbUJBNEVwQjtBQUVERixLQUFLaUIsUUFBUSxDQUFFLFNBQVNmIn0=