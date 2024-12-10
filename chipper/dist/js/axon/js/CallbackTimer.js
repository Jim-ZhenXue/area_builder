// Copyright 2019-2023, University of Colorado Boulder
/**
 * CallbackTimer is a timer that calls a set of registered callbacks.
 * It utilizes AXON/stepTimer, but provides a higher level of abstraction, hiding the details of managing stepTimer.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import axon from './axon.js';
import stepTimer from './stepTimer.js';
let CallbackTimer = class CallbackTimer {
    isRunning() {
        return this.delayID !== null || this.intervalID !== null;
    }
    start() {
        if (!this.isRunning()) {
            this.fired = false;
            this.delayID = stepTimer.setTimeout(()=>{
                this.delayID = null;
                this.intervalID = stepTimer.setInterval(()=>this.fire(), this.interval);
                // fire after scheduling the intervalID, so that isRunning will be true for callbacks, see sun#216
                this.fire();
            }, this.delay);
        }
    }
    /**
   * Stops the timer.
   * @param fire - should we fire if we haven't fired already?
   */ stop(fire) {
        if (this.isRunning()) {
            if (this.delayID) {
                stepTimer.clearTimeout(this.delayID);
                this.delayID = null;
            }
            if (this.intervalID) {
                stepTimer.clearInterval(this.intervalID);
                this.intervalID = null;
            }
            if (fire && !this.fired) {
                this.fire();
            }
        }
    }
    addCallback(callback) {
        if (!this.callbacks.includes(callback)) {
            this.callbacks.push(callback);
        }
    }
    removeCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index !== -1) {
            this.callbacks.splice(index, 1);
        }
    }
    /**
   * Calls all callbacks. Clients are free to call this when the timer is not running.
   */ fire() {
        const callbacksCopy = this.callbacks.slice(0);
        for(let i = 0; i < callbacksCopy.length; i++){
            callbacksCopy[i]();
        }
        this.fired = true;
    }
    set delay(delay) {
        assert && assert(delay >= 0, `bad value for delay: ${delay}`);
        this._delay = delay;
    }
    get delay() {
        return this._delay;
    }
    set interval(interval) {
        assert && assert(interval > 0, `bad value for interval: ${interval}`);
        this._interval = interval;
    }
    get interval() {
        return this._interval;
    }
    dispose() {
        this.stop(false);
        this.callbacks.length = 0;
    }
    constructor(options){
        this.callbacks = [];
        // initial delay between when start is called and the timer first fires, in ms
        this._delay = 400;
        // fire the timer at this continuous interval, in ms
        this._interval = 100;
        // identifier for timer associated with the initial delay
        this.delayID = null;
        // identifier for timer associated with the continuous interval
        this.intervalID = null;
        // has the timer fired since it was started?
        this.fired = false;
        if ((options == null ? void 0 : options.delay) !== undefined) {
            this.delay = options.delay;
        }
        if ((options == null ? void 0 : options.interval) !== undefined) {
            this.interval = options.interval;
        }
        if (options == null ? void 0 : options.callback) {
            this.callbacks.push(options.callback);
        }
    }
};
export { CallbackTimer as default };
axon.register('CallbackTimer', CallbackTimer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvQ2FsbGJhY2tUaW1lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDYWxsYmFja1RpbWVyIGlzIGEgdGltZXIgdGhhdCBjYWxscyBhIHNldCBvZiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqIEl0IHV0aWxpemVzIEFYT04vc3RlcFRpbWVyLCBidXQgcHJvdmlkZXMgYSBoaWdoZXIgbGV2ZWwgb2YgYWJzdHJhY3Rpb24sIGhpZGluZyB0aGUgZGV0YWlscyBvZiBtYW5hZ2luZyBzdGVwVGltZXIuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgYXhvbiBmcm9tICcuL2F4b24uanMnO1xuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgeyBUaW1lckxpc3RlbmVyIH0gZnJvbSAnLi9UaW1lci5qcyc7XG5cbmV4cG9ydCB0eXBlIENhbGxiYWNrVGltZXJDYWxsYmFjayA9ICgpID0+IHZvaWQ7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gY29udmVuaWVuY2UgZm9yIGFkZGluZyAxIGNhbGxiYWNrXG4gIGNhbGxiYWNrPzogQ2FsbGJhY2tUaW1lckNhbGxiYWNrO1xuXG4gIC8vIHN0YXJ0IHRvIGZpcmUgY29udGludW91c2x5IGFmdGVyIHByZXNzaW5nIGZvciB0aGlzIGxvbmcsIGluIG1zXG4gIGRlbGF5PzogbnVtYmVyO1xuXG4gIC8vIGZpcmUgY29udGludW91c2x5IGF0IHRoaXMgaW50ZXJ2YWwsIGluIG1zXG4gIGludGVydmFsPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgQ2FsbGJhY2tUaW1lck9wdGlvbnMgPSBTZWxmT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FsbGJhY2tUaW1lciB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBjYWxsYmFja3M6IENhbGxiYWNrVGltZXJDYWxsYmFja1tdID0gW107XG5cbiAgLy8gaW5pdGlhbCBkZWxheSBiZXR3ZWVuIHdoZW4gc3RhcnQgaXMgY2FsbGVkIGFuZCB0aGUgdGltZXIgZmlyc3QgZmlyZXMsIGluIG1zXG4gIHByaXZhdGUgX2RlbGF5ID0gNDAwO1xuXG4gIC8vIGZpcmUgdGhlIHRpbWVyIGF0IHRoaXMgY29udGludW91cyBpbnRlcnZhbCwgaW4gbXNcbiAgcHJpdmF0ZSBfaW50ZXJ2YWwgPSAxMDA7XG5cbiAgLy8gaWRlbnRpZmllciBmb3IgdGltZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbml0aWFsIGRlbGF5XG4gIHByaXZhdGUgZGVsYXlJRDogVGltZXJMaXN0ZW5lciB8IG51bGwgPSBudWxsO1xuXG4gIC8vIGlkZW50aWZpZXIgZm9yIHRpbWVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgY29udGludW91cyBpbnRlcnZhbFxuICBwcml2YXRlIGludGVydmFsSUQ6IFRpbWVyTGlzdGVuZXIgfCBudWxsID0gbnVsbDtcblxuICAvLyBoYXMgdGhlIHRpbWVyIGZpcmVkIHNpbmNlIGl0IHdhcyBzdGFydGVkP1xuICBwcml2YXRlIGZpcmVkID0gZmFsc2U7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogQ2FsbGJhY2tUaW1lck9wdGlvbnMgKSB7XG5cbiAgICBpZiAoIG9wdGlvbnM/LmRlbGF5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheTtcbiAgICB9XG4gICAgaWYgKCBvcHRpb25zPy5pbnRlcnZhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgdGhpcy5pbnRlcnZhbCA9IG9wdGlvbnMuaW50ZXJ2YWw7XG4gICAgfVxuICAgIGlmICggb3B0aW9ucz8uY2FsbGJhY2sgKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKCBvcHRpb25zLmNhbGxiYWNrICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGlzUnVubmluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKCB0aGlzLmRlbGF5SUQgIT09IG51bGwgfHwgdGhpcy5pbnRlcnZhbElEICE9PSBudWxsICk7XG4gIH1cblxuICBwdWJsaWMgc3RhcnQoKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5pc1J1bm5pbmcoKSApIHtcbiAgICAgIHRoaXMuZmlyZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsYXlJRCA9IHN0ZXBUaW1lci5zZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZGVsYXlJRCA9IG51bGw7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxJRCA9IHN0ZXBUaW1lci5zZXRJbnRlcnZhbCggKCkgPT4gdGhpcy5maXJlKCksIHRoaXMuaW50ZXJ2YWwgKTtcblxuICAgICAgICAvLyBmaXJlIGFmdGVyIHNjaGVkdWxpbmcgdGhlIGludGVydmFsSUQsIHNvIHRoYXQgaXNSdW5uaW5nIHdpbGwgYmUgdHJ1ZSBmb3IgY2FsbGJhY2tzLCBzZWUgc3VuIzIxNlxuICAgICAgICB0aGlzLmZpcmUoKTtcbiAgICAgIH0sIHRoaXMuZGVsYXkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgdGhlIHRpbWVyLlxuICAgKiBAcGFyYW0gZmlyZSAtIHNob3VsZCB3ZSBmaXJlIGlmIHdlIGhhdmVuJ3QgZmlyZWQgYWxyZWFkeT9cbiAgICovXG4gIHB1YmxpYyBzdG9wKCBmaXJlOiBib29sZWFuICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5pc1J1bm5pbmcoKSApIHtcbiAgICAgIGlmICggdGhpcy5kZWxheUlEICkge1xuICAgICAgICBzdGVwVGltZXIuY2xlYXJUaW1lb3V0KCB0aGlzLmRlbGF5SUQgKTtcbiAgICAgICAgdGhpcy5kZWxheUlEID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy5pbnRlcnZhbElEICkge1xuICAgICAgICBzdGVwVGltZXIuY2xlYXJJbnRlcnZhbCggdGhpcy5pbnRlcnZhbElEICk7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxJRCA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoIGZpcmUgJiYgIXRoaXMuZmlyZWQgKSB7XG4gICAgICAgIHRoaXMuZmlyZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhZGRDYWxsYmFjayggY2FsbGJhY2s6IENhbGxiYWNrVGltZXJDYWxsYmFjayApOiB2b2lkIHtcbiAgICBpZiAoICF0aGlzLmNhbGxiYWNrcy5pbmNsdWRlcyggY2FsbGJhY2sgKSApIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goIGNhbGxiYWNrICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlbW92ZUNhbGxiYWNrKCBjYWxsYmFjazogQ2FsbGJhY2tUaW1lckNhbGxiYWNrICk6IHZvaWQge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jYWxsYmFja3MuaW5kZXhPZiggY2FsbGJhY2sgKTtcbiAgICBpZiAoIGluZGV4ICE9PSAtMSApIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgYWxsIGNhbGxiYWNrcy4gQ2xpZW50cyBhcmUgZnJlZSB0byBjYWxsIHRoaXMgd2hlbiB0aGUgdGltZXIgaXMgbm90IHJ1bm5pbmcuXG4gICAqL1xuICBwdWJsaWMgZmlyZSgpOiB2b2lkIHtcbiAgICBjb25zdCBjYWxsYmFja3NDb3B5ID0gdGhpcy5jYWxsYmFja3Muc2xpY2UoIDAgKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjYWxsYmFja3NDb3B5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgY2FsbGJhY2tzQ29weVsgaSBdKCk7XG4gICAgfVxuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICB9XG5cbiAgcHVibGljIHNldCBkZWxheSggZGVsYXk6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkZWxheSA+PSAwLCBgYmFkIHZhbHVlIGZvciBkZWxheTogJHtkZWxheX1gICk7XG5cbiAgICB0aGlzLl9kZWxheSA9IGRlbGF5O1xuICB9XG5cbiAgcHVibGljIGdldCBkZWxheSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9kZWxheTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgaW50ZXJ2YWwoIGludGVydmFsOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW50ZXJ2YWwgPiAwLCBgYmFkIHZhbHVlIGZvciBpbnRlcnZhbDogJHtpbnRlcnZhbH1gICk7XG5cbiAgICB0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xuICB9XG5cbiAgcHVibGljIGdldCBpbnRlcnZhbCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbnRlcnZhbDtcbiAgfVxuXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcCggZmFsc2UgKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG59XG5cbmF4b24ucmVnaXN0ZXIoICdDYWxsYmFja1RpbWVyJywgQ2FsbGJhY2tUaW1lciApOyJdLCJuYW1lcyI6WyJheG9uIiwic3RlcFRpbWVyIiwiQ2FsbGJhY2tUaW1lciIsImlzUnVubmluZyIsImRlbGF5SUQiLCJpbnRlcnZhbElEIiwic3RhcnQiLCJmaXJlZCIsInNldFRpbWVvdXQiLCJzZXRJbnRlcnZhbCIsImZpcmUiLCJpbnRlcnZhbCIsImRlbGF5Iiwic3RvcCIsImNsZWFyVGltZW91dCIsImNsZWFySW50ZXJ2YWwiLCJhZGRDYWxsYmFjayIsImNhbGxiYWNrIiwiY2FsbGJhY2tzIiwiaW5jbHVkZXMiLCJwdXNoIiwicmVtb3ZlQ2FsbGJhY2siLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJjYWxsYmFja3NDb3B5Iiwic2xpY2UiLCJpIiwibGVuZ3RoIiwiYXNzZXJ0IiwiX2RlbGF5IiwiX2ludGVydmFsIiwiZGlzcG9zZSIsIm9wdGlvbnMiLCJ1bmRlZmluZWQi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