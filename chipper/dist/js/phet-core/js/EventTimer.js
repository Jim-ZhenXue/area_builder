// Copyright 2014-2024, University of Colorado Boulder
/**
 * Abstraction for timed-event series that helps with variable frame-rates. Useful for things that need to happen at a
 * specific rate real-time regardless of the frame-rate.
 *
 * An EventTimer is created with a specific event "model" that determines when events occur, and a callback that will
 * be triggered for each event (with its time elapsed since it should have occurred). Thus, each callback basically
 * says:
 * - "an event happened <timeElapsed> ago"
 *
 * To have the EventTimer step forward in time (firing callbacks for every event that would have occurred over that
 * time frame, if any), call step( realTimeElapsed ).
 *
 * -----------------------------------------
 *
 * For example, create a timer with a constant rate that will fire events every 1 time units:
 *
 * var timer = new phet.phetCore.EventTimer( new phetCore.ConstantEventModel( 1 ), function( timeElapsed ) {
 *   console.log( 'event with timeElapsed: ' + timeElapsed );
 * } );
 *
 * Stepping once for 1.5 time units will fire once (0.5 seconds since the "end" of the step), and will be 0.5 seconds
 * from the next step:
 *
 * timer.step( 1.5 );
 * > event with timeElapsed: 0.5
 *
 * The 0.5 above is because after 1.5 seconds of time, the event will have happened 0.5 seconds ago:
 *
 *           step 1.5
 * |------------------------>|
 * |                *        |          *                     *    <- constant time of 1 between each event
 * |                <--------|
 *                 0.5 seconds past the event now
 *
 * Stepping for a longer time will result in more events:
 *
 * timer.step( 6 );
 * > event with timeElapsed: 5.5
 * > event with timeElapsed: 4.5
 * > event with timeElapsed: 3.5
 * > event with timeElapsed: 2.5
 * > event with timeElapsed: 1.5
 * > event with timeElapsed: 0.5
 *
 *       step 1.5                                  step 6                                 step 0   step 1.5
 * |---------------->|---------------------------------------------------------------------->|---------------->|
 * |           *           *           *           *           *           *           *           *           *
 * |           <-----|     <-----------------------------------------------------------------|     <-----------|
 * |          0.5         5.5          <-----------------------------------------------------|     1           0
 * |           ^           ^          4.5          <-----------------------------------------|              event at
 * |           |           |                      3.5          <-----------------------------|              current
 * |           |           |                                  2.5          <-----------------|              time
 * |     callback( t ) called, etc.                                       1.5          <-----|
 * |
 *
 * A step with zero time will trigger no events:
 *
 * timer.step( 0 );
 *
 * The timer will fire an event once it reaches the exact point in time:
 *
 * timer.step( 1.5 );
 * > event with timeElapsed: 1
 * > event with timeElapsed: 0
 *
 * NOTE:
 * If your timer callbacks create model objects that would also get stepped forward, make sure to step forward objects
 * before calling eventTimer.step(), so that objects don't get stepped twice. Usually the callback will have:
 * - var modelElement = new ModelElement();
 * - modelElement.step( callbackTimeElapsed );
 * And you don't want to apply step( dt ) to it directly afterwards.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
let EventTimer = class EventTimer {
    /**
   * Steps the timer forward by a certain amount of time. This may cause 0 or more events to actually occur.
   */ step(dt) {
        while(dt >= this.timeBeforeNextEvent){
            dt -= this.timeBeforeNextEvent;
            this.period = this.eventModel.getPeriodBeforeNextEvent();
            this.timeBeforeNextEvent = this.period;
            // how much time has elapsed since this event began
            this.eventCallback(dt);
        }
        // use up the remaining DT
        this.timeBeforeNextEvent -= dt;
    }
    /**
   * Returns how far we are to the next event firing (where 0 is an event "just" fired, and 1 is the next event
   * firing).
   *
   * @returns In the range [0,1). Is inclusive for 0, but exclusive for 1.
   */ getRatio() {
        return (this.period - this.timeBeforeNextEvent) / this.period;
    }
    /*
   * Create an event timer with a specific model (determines the time between events), and a callback to be called
   * for events.
   *
   * @param eventModel: getPeriodBeforeNextEvent() will be called at
   *    the start and after every event to determine the time required to pass by before the next event occurs.
   * @param eventCallback - Will be called for every event. The timeElapsed passed in as the
   *    only argument denotes the time elapsed since the event would have occurred. E.g. if we step for 5 seconds and
   *    our event would have occurred 1 second into that step, the timeElapsed will be 4 seconds, since after the end
   *    of the 5 seconds the event would have happened 4 seconds ago.
   */ constructor(eventModel, eventCallback){
        this.eventModel = eventModel;
        this.eventCallback = eventCallback;
        this.period = this.eventModel.getPeriodBeforeNextEvent();
        this.timeBeforeNextEvent = this.period;
    }
};
export { EventTimer as default };
export class ConstantEventModel {
    getPeriodBeforeNextEvent() {
        return 1 / this.rate;
    }
    /*
   * Event model that will fire events at a constant rate. An event will occur every 1/rate time units.
   */ constructor(rate){
        this.rate = rate;
        assert && assert(rate > 0, 'We need to have a strictly positive rate in order to prevent infinite loops.');
    }
}
export class UniformEventModel {
    getPeriodBeforeNextEvent() {
        const uniformRandomNumber = this.pseudoRandomNumberSource();
        assert && assert(uniformRandomNumber >= 0 && uniformRandomNumber < 1, `Our uniform random number is outside of its expected range with a value of ${uniformRandomNumber}`);
        // sample the exponential distribution
        return uniformRandomNumber * 2 / this.rate;
    }
    /*
   * Event model that will fire events averaging a certain rate, but with the time between events being uniformly
   * random.
   *
   * The pseudoRandomNumberSource, when called, should generate uniformly distributed random numbers in the range [0,1).
   */ constructor(rate, pseudoRandomNumberSource){
        this.rate = rate;
        this.pseudoRandomNumberSource = pseudoRandomNumberSource;
        assert && assert(rate > 0, 'We need to have a strictly positive rate in order to prevent infinite loops.');
    }
}
export class PoissonEventModel {
    getPeriodBeforeNextEvent() {
        // A poisson process can be described as having an independent exponential distribution for the time between
        // consecutive events.
        // see http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates and
        // http://en.wikipedia.org/wiki/Poisson_process
        const uniformRandomNumber = this.pseudoRandomNumberSource();
        assert && assert(uniformRandomNumber >= 0 && uniformRandomNumber < 1, `Our uniform random number is outside of its expected range with a value of ${uniformRandomNumber}`);
        // sample the exponential distribution
        return -Math.log(uniformRandomNumber) / this.rate;
    }
    /*
   * Event model that will fire events corresponding to a Poisson process with the specified rate.
   * The pseudoRandomNumberSource, when called, should generate uniformly distributed random numbers in the range [0,1).
   */ constructor(rate, pseudoRandomNumberSource){
        this.rate = rate;
        this.pseudoRandomNumberSource = pseudoRandomNumberSource;
        assert && assert(rate > 0, 'We need to have a strictly positive poisson rate in order to prevent infinite loops.');
    }
}
phetCore.register('PoissonEventModel', PoissonEventModel);
phetCore.register('UniformEventModel', UniformEventModel);
phetCore.register('ConstantEventModel', ConstantEventModel);
phetCore.register('EventTimer', EventTimer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FdmVudFRpbWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFic3RyYWN0aW9uIGZvciB0aW1lZC1ldmVudCBzZXJpZXMgdGhhdCBoZWxwcyB3aXRoIHZhcmlhYmxlIGZyYW1lLXJhdGVzLiBVc2VmdWwgZm9yIHRoaW5ncyB0aGF0IG5lZWQgdG8gaGFwcGVuIGF0IGFcbiAqIHNwZWNpZmljIHJhdGUgcmVhbC10aW1lIHJlZ2FyZGxlc3Mgb2YgdGhlIGZyYW1lLXJhdGUuXG4gKlxuICogQW4gRXZlbnRUaW1lciBpcyBjcmVhdGVkIHdpdGggYSBzcGVjaWZpYyBldmVudCBcIm1vZGVsXCIgdGhhdCBkZXRlcm1pbmVzIHdoZW4gZXZlbnRzIG9jY3VyLCBhbmQgYSBjYWxsYmFjayB0aGF0IHdpbGxcbiAqIGJlIHRyaWdnZXJlZCBmb3IgZWFjaCBldmVudCAod2l0aCBpdHMgdGltZSBlbGFwc2VkIHNpbmNlIGl0IHNob3VsZCBoYXZlIG9jY3VycmVkKS4gVGh1cywgZWFjaCBjYWxsYmFjayBiYXNpY2FsbHlcbiAqIHNheXM6XG4gKiAtIFwiYW4gZXZlbnQgaGFwcGVuZWQgPHRpbWVFbGFwc2VkPiBhZ29cIlxuICpcbiAqIFRvIGhhdmUgdGhlIEV2ZW50VGltZXIgc3RlcCBmb3J3YXJkIGluIHRpbWUgKGZpcmluZyBjYWxsYmFja3MgZm9yIGV2ZXJ5IGV2ZW50IHRoYXQgd291bGQgaGF2ZSBvY2N1cnJlZCBvdmVyIHRoYXRcbiAqIHRpbWUgZnJhbWUsIGlmIGFueSksIGNhbGwgc3RlcCggcmVhbFRpbWVFbGFwc2VkICkuXG4gKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqXG4gKiBGb3IgZXhhbXBsZSwgY3JlYXRlIGEgdGltZXIgd2l0aCBhIGNvbnN0YW50IHJhdGUgdGhhdCB3aWxsIGZpcmUgZXZlbnRzIGV2ZXJ5IDEgdGltZSB1bml0czpcbiAqXG4gKiB2YXIgdGltZXIgPSBuZXcgcGhldC5waGV0Q29yZS5FdmVudFRpbWVyKCBuZXcgcGhldENvcmUuQ29uc3RhbnRFdmVudE1vZGVsKCAxICksIGZ1bmN0aW9uKCB0aW1lRWxhcHNlZCApIHtcbiAqICAgY29uc29sZS5sb2coICdldmVudCB3aXRoIHRpbWVFbGFwc2VkOiAnICsgdGltZUVsYXBzZWQgKTtcbiAqIH0gKTtcbiAqXG4gKiBTdGVwcGluZyBvbmNlIGZvciAxLjUgdGltZSB1bml0cyB3aWxsIGZpcmUgb25jZSAoMC41IHNlY29uZHMgc2luY2UgdGhlIFwiZW5kXCIgb2YgdGhlIHN0ZXApLCBhbmQgd2lsbCBiZSAwLjUgc2Vjb25kc1xuICogZnJvbSB0aGUgbmV4dCBzdGVwOlxuICpcbiAqIHRpbWVyLnN0ZXAoIDEuNSApO1xuICogPiBldmVudCB3aXRoIHRpbWVFbGFwc2VkOiAwLjVcbiAqXG4gKiBUaGUgMC41IGFib3ZlIGlzIGJlY2F1c2UgYWZ0ZXIgMS41IHNlY29uZHMgb2YgdGltZSwgdGhlIGV2ZW50IHdpbGwgaGF2ZSBoYXBwZW5lZCAwLjUgc2Vjb25kcyBhZ286XG4gKlxuICogICAgICAgICAgIHN0ZXAgMS41XG4gKiB8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tPnxcbiAqIHwgICAgICAgICAgICAgICAgKiAgICAgICAgfCAgICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgKiAgICA8LSBjb25zdGFudCB0aW1lIG9mIDEgYmV0d2VlbiBlYWNoIGV2ZW50XG4gKiB8ICAgICAgICAgICAgICAgIDwtLS0tLS0tLXxcbiAqICAgICAgICAgICAgICAgICAwLjUgc2Vjb25kcyBwYXN0IHRoZSBldmVudCBub3dcbiAqXG4gKiBTdGVwcGluZyBmb3IgYSBsb25nZXIgdGltZSB3aWxsIHJlc3VsdCBpbiBtb3JlIGV2ZW50czpcbiAqXG4gKiB0aW1lci5zdGVwKCA2ICk7XG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDUuNVxuICogPiBldmVudCB3aXRoIHRpbWVFbGFwc2VkOiA0LjVcbiAqID4gZXZlbnQgd2l0aCB0aW1lRWxhcHNlZDogMy41XG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDIuNVxuICogPiBldmVudCB3aXRoIHRpbWVFbGFwc2VkOiAxLjVcbiAqID4gZXZlbnQgd2l0aCB0aW1lRWxhcHNlZDogMC41XG4gKlxuICogICAgICAgc3RlcCAxLjUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcCA2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcCAwICAgc3RlcCAxLjVcbiAqIHwtLS0tLS0tLS0tLS0tLS0tPnwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tPnwtLS0tLS0tLS0tLS0tLS0tPnxcbiAqIHwgICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICpcbiAqIHwgICAgICAgICAgIDwtLS0tLXwgICAgIDwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwgICAgIDwtLS0tLS0tLS0tLXxcbiAqIHwgICAgICAgICAgMC41ICAgICAgICAgNS41ICAgICAgICAgIDwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwgICAgIDEgICAgICAgICAgIDBcbiAqIHwgICAgICAgICAgIF4gICAgICAgICAgIF4gICAgICAgICAgNC41ICAgICAgICAgIDwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwgICAgICAgICAgICAgIGV2ZW50IGF0XG4gKiB8ICAgICAgICAgICB8ICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgIDMuNSAgICAgICAgICA8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18ICAgICAgICAgICAgICBjdXJyZW50XG4gKiB8ICAgICAgICAgICB8ICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDIuNSAgICAgICAgICA8LS0tLS0tLS0tLS0tLS0tLS18ICAgICAgICAgICAgICB0aW1lXG4gKiB8ICAgICBjYWxsYmFjayggdCApIGNhbGxlZCwgZXRjLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEuNSAgICAgICAgICA8LS0tLS18XG4gKiB8XG4gKlxuICogQSBzdGVwIHdpdGggemVybyB0aW1lIHdpbGwgdHJpZ2dlciBubyBldmVudHM6XG4gKlxuICogdGltZXIuc3RlcCggMCApO1xuICpcbiAqIFRoZSB0aW1lciB3aWxsIGZpcmUgYW4gZXZlbnQgb25jZSBpdCByZWFjaGVzIHRoZSBleGFjdCBwb2ludCBpbiB0aW1lOlxuICpcbiAqIHRpbWVyLnN0ZXAoIDEuNSApO1xuICogPiBldmVudCB3aXRoIHRpbWVFbGFwc2VkOiAxXG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDBcbiAqXG4gKiBOT1RFOlxuICogSWYgeW91ciB0aW1lciBjYWxsYmFja3MgY3JlYXRlIG1vZGVsIG9iamVjdHMgdGhhdCB3b3VsZCBhbHNvIGdldCBzdGVwcGVkIGZvcndhcmQsIG1ha2Ugc3VyZSB0byBzdGVwIGZvcndhcmQgb2JqZWN0c1xuICogYmVmb3JlIGNhbGxpbmcgZXZlbnRUaW1lci5zdGVwKCksIHNvIHRoYXQgb2JqZWN0cyBkb24ndCBnZXQgc3RlcHBlZCB0d2ljZS4gVXN1YWxseSB0aGUgY2FsbGJhY2sgd2lsbCBoYXZlOlxuICogLSB2YXIgbW9kZWxFbGVtZW50ID0gbmV3IE1vZGVsRWxlbWVudCgpO1xuICogLSBtb2RlbEVsZW1lbnQuc3RlcCggY2FsbGJhY2tUaW1lRWxhcHNlZCApO1xuICogQW5kIHlvdSBkb24ndCB3YW50IHRvIGFwcGx5IHN0ZXAoIGR0ICkgdG8gaXQgZGlyZWN0bHkgYWZ0ZXJ3YXJkcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudFRpbWVyIHtcblxuICBwcml2YXRlIHBlcmlvZDogbnVtYmVyO1xuICBwcml2YXRlIHRpbWVCZWZvcmVOZXh0RXZlbnQ6IG51bWJlcjtcblxuICAvKlxuICAgKiBDcmVhdGUgYW4gZXZlbnQgdGltZXIgd2l0aCBhIHNwZWNpZmljIG1vZGVsIChkZXRlcm1pbmVzIHRoZSB0aW1lIGJldHdlZW4gZXZlbnRzKSwgYW5kIGEgY2FsbGJhY2sgdG8gYmUgY2FsbGVkXG4gICAqIGZvciBldmVudHMuXG4gICAqXG4gICAqIEBwYXJhbSBldmVudE1vZGVsOiBnZXRQZXJpb2RCZWZvcmVOZXh0RXZlbnQoKSB3aWxsIGJlIGNhbGxlZCBhdFxuICAgKiAgICB0aGUgc3RhcnQgYW5kIGFmdGVyIGV2ZXJ5IGV2ZW50IHRvIGRldGVybWluZSB0aGUgdGltZSByZXF1aXJlZCB0byBwYXNzIGJ5IGJlZm9yZSB0aGUgbmV4dCBldmVudCBvY2N1cnMuXG4gICAqIEBwYXJhbSBldmVudENhbGxiYWNrIC0gV2lsbCBiZSBjYWxsZWQgZm9yIGV2ZXJ5IGV2ZW50LiBUaGUgdGltZUVsYXBzZWQgcGFzc2VkIGluIGFzIHRoZVxuICAgKiAgICBvbmx5IGFyZ3VtZW50IGRlbm90ZXMgdGhlIHRpbWUgZWxhcHNlZCBzaW5jZSB0aGUgZXZlbnQgd291bGQgaGF2ZSBvY2N1cnJlZC4gRS5nLiBpZiB3ZSBzdGVwIGZvciA1IHNlY29uZHMgYW5kXG4gICAqICAgIG91ciBldmVudCB3b3VsZCBoYXZlIG9jY3VycmVkIDEgc2Vjb25kIGludG8gdGhhdCBzdGVwLCB0aGUgdGltZUVsYXBzZWQgd2lsbCBiZSA0IHNlY29uZHMsIHNpbmNlIGFmdGVyIHRoZSBlbmRcbiAgICogICAgb2YgdGhlIDUgc2Vjb25kcyB0aGUgZXZlbnQgd291bGQgaGF2ZSBoYXBwZW5lZCA0IHNlY29uZHMgYWdvLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcml2YXRlIHJlYWRvbmx5IGV2ZW50TW9kZWw6IHsgZ2V0UGVyaW9kQmVmb3JlTmV4dEV2ZW50OiAoKSA9PiBudW1iZXIgfSwgcHJpdmF0ZSByZWFkb25seSBldmVudENhbGxiYWNrOiAoIHRpbWVFbGFwc2VkOiBudW1iZXIgKSA9PiB2b2lkICkge1xuICAgIHRoaXMucGVyaW9kID0gdGhpcy5ldmVudE1vZGVsLmdldFBlcmlvZEJlZm9yZU5leHRFdmVudCgpO1xuICAgIHRoaXMudGltZUJlZm9yZU5leHRFdmVudCA9IHRoaXMucGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0ZXBzIHRoZSB0aW1lciBmb3J3YXJkIGJ5IGEgY2VydGFpbiBhbW91bnQgb2YgdGltZS4gVGhpcyBtYXkgY2F1c2UgMCBvciBtb3JlIGV2ZW50cyB0byBhY3R1YWxseSBvY2N1ci5cbiAgICovXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xuICAgIHdoaWxlICggZHQgPj0gdGhpcy50aW1lQmVmb3JlTmV4dEV2ZW50ICkge1xuICAgICAgZHQgLT0gdGhpcy50aW1lQmVmb3JlTmV4dEV2ZW50O1xuICAgICAgdGhpcy5wZXJpb2QgPSB0aGlzLmV2ZW50TW9kZWwuZ2V0UGVyaW9kQmVmb3JlTmV4dEV2ZW50KCk7XG4gICAgICB0aGlzLnRpbWVCZWZvcmVOZXh0RXZlbnQgPSB0aGlzLnBlcmlvZDtcblxuICAgICAgLy8gaG93IG11Y2ggdGltZSBoYXMgZWxhcHNlZCBzaW5jZSB0aGlzIGV2ZW50IGJlZ2FuXG4gICAgICB0aGlzLmV2ZW50Q2FsbGJhY2soIGR0ICk7XG4gICAgfVxuXG4gICAgLy8gdXNlIHVwIHRoZSByZW1haW5pbmcgRFRcbiAgICB0aGlzLnRpbWVCZWZvcmVOZXh0RXZlbnQgLT0gZHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBob3cgZmFyIHdlIGFyZSB0byB0aGUgbmV4dCBldmVudCBmaXJpbmcgKHdoZXJlIDAgaXMgYW4gZXZlbnQgXCJqdXN0XCIgZmlyZWQsIGFuZCAxIGlzIHRoZSBuZXh0IGV2ZW50XG4gICAqIGZpcmluZykuXG4gICAqXG4gICAqIEByZXR1cm5zIEluIHRoZSByYW5nZSBbMCwxKS4gSXMgaW5jbHVzaXZlIGZvciAwLCBidXQgZXhjbHVzaXZlIGZvciAxLlxuICAgKi9cbiAgcHVibGljIGdldFJhdGlvKCk6IG51bWJlciB7XG4gICAgcmV0dXJuICggdGhpcy5wZXJpb2QgLSB0aGlzLnRpbWVCZWZvcmVOZXh0RXZlbnQgKSAvIHRoaXMucGVyaW9kO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb25zdGFudEV2ZW50TW9kZWwge1xuXG4gIC8qXG4gICAqIEV2ZW50IG1vZGVsIHRoYXQgd2lsbCBmaXJlIGV2ZW50cyBhdCBhIGNvbnN0YW50IHJhdGUuIEFuIGV2ZW50IHdpbGwgb2NjdXIgZXZlcnkgMS9yYXRlIHRpbWUgdW5pdHMuXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHByaXZhdGUgcmVhZG9ubHkgcmF0ZTogbnVtYmVyICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJhdGUgPiAwLCAnV2UgbmVlZCB0byBoYXZlIGEgc3RyaWN0bHkgcG9zaXRpdmUgcmF0ZSBpbiBvcmRlciB0byBwcmV2ZW50IGluZmluaXRlIGxvb3BzLicgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRQZXJpb2RCZWZvcmVOZXh0RXZlbnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gMSAvIHRoaXMucmF0ZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5pZm9ybUV2ZW50TW9kZWwge1xuXG4gIC8qXG4gICAqIEV2ZW50IG1vZGVsIHRoYXQgd2lsbCBmaXJlIGV2ZW50cyBhdmVyYWdpbmcgYSBjZXJ0YWluIHJhdGUsIGJ1dCB3aXRoIHRoZSB0aW1lIGJldHdlZW4gZXZlbnRzIGJlaW5nIHVuaWZvcm1seVxuICAgKiByYW5kb20uXG4gICAqXG4gICAqIFRoZSBwc2V1ZG9SYW5kb21OdW1iZXJTb3VyY2UsIHdoZW4gY2FsbGVkLCBzaG91bGQgZ2VuZXJhdGUgdW5pZm9ybWx5IGRpc3RyaWJ1dGVkIHJhbmRvbSBudW1iZXJzIGluIHRoZSByYW5nZSBbMCwxKS5cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJpdmF0ZSByZWFkb25seSByYXRlOiBudW1iZXIsIHByaXZhdGUgcmVhZG9ubHkgcHNldWRvUmFuZG9tTnVtYmVyU291cmNlOiAoKSA9PiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmF0ZSA+IDAsICdXZSBuZWVkIHRvIGhhdmUgYSBzdHJpY3RseSBwb3NpdGl2ZSByYXRlIGluIG9yZGVyIHRvIHByZXZlbnQgaW5maW5pdGUgbG9vcHMuJyApO1xuICB9XG5cbiAgcHVibGljIGdldFBlcmlvZEJlZm9yZU5leHRFdmVudCgpOiBudW1iZXIge1xuICAgIGNvbnN0IHVuaWZvcm1SYW5kb21OdW1iZXIgPSB0aGlzLnBzZXVkb1JhbmRvbU51bWJlclNvdXJjZSgpO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHVuaWZvcm1SYW5kb21OdW1iZXIgPj0gMCAmJiB1bmlmb3JtUmFuZG9tTnVtYmVyIDwgMSxcbiAgICAgIGBPdXIgdW5pZm9ybSByYW5kb20gbnVtYmVyIGlzIG91dHNpZGUgb2YgaXRzIGV4cGVjdGVkIHJhbmdlIHdpdGggYSB2YWx1ZSBvZiAke3VuaWZvcm1SYW5kb21OdW1iZXJ9YCApO1xuXG4gICAgLy8gc2FtcGxlIHRoZSBleHBvbmVudGlhbCBkaXN0cmlidXRpb25cbiAgICByZXR1cm4gdW5pZm9ybVJhbmRvbU51bWJlciAqIDIgLyB0aGlzLnJhdGU7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBvaXNzb25FdmVudE1vZGVsIHtcblxuICAvKlxuICAgKiBFdmVudCBtb2RlbCB0aGF0IHdpbGwgZmlyZSBldmVudHMgY29ycmVzcG9uZGluZyB0byBhIFBvaXNzb24gcHJvY2VzcyB3aXRoIHRoZSBzcGVjaWZpZWQgcmF0ZS5cbiAgICogVGhlIHBzZXVkb1JhbmRvbU51bWJlclNvdXJjZSwgd2hlbiBjYWxsZWQsIHNob3VsZCBnZW5lcmF0ZSB1bmlmb3JtbHkgZGlzdHJpYnV0ZWQgcmFuZG9tIG51bWJlcnMgaW4gdGhlIHJhbmdlIFswLDEpLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcml2YXRlIHJlYWRvbmx5IHJhdGU6IG51bWJlciwgcHJpdmF0ZSByZWFkb25seSBwc2V1ZG9SYW5kb21OdW1iZXJTb3VyY2U6ICgpID0+IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByYXRlID4gMCxcbiAgICAgICdXZSBuZWVkIHRvIGhhdmUgYSBzdHJpY3RseSBwb3NpdGl2ZSBwb2lzc29uIHJhdGUgaW4gb3JkZXIgdG8gcHJldmVudCBpbmZpbml0ZSBsb29wcy4nICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0UGVyaW9kQmVmb3JlTmV4dEV2ZW50KCk6IG51bWJlciB7XG5cbiAgICAvLyBBIHBvaXNzb24gcHJvY2VzcyBjYW4gYmUgZGVzY3JpYmVkIGFzIGhhdmluZyBhbiBpbmRlcGVuZGVudCBleHBvbmVudGlhbCBkaXN0cmlidXRpb24gZm9yIHRoZSB0aW1lIGJldHdlZW5cbiAgICAvLyBjb25zZWN1dGl2ZSBldmVudHMuXG4gICAgLy8gc2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRXhwb25lbnRpYWxfZGlzdHJpYnV0aW9uI0dlbmVyYXRpbmdfZXhwb25lbnRpYWxfdmFyaWF0ZXMgYW5kXG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2lzc29uX3Byb2Nlc3NcblxuICAgIGNvbnN0IHVuaWZvcm1SYW5kb21OdW1iZXIgPSB0aGlzLnBzZXVkb1JhbmRvbU51bWJlclNvdXJjZSgpO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHVuaWZvcm1SYW5kb21OdW1iZXIgPj0gMCAmJiB1bmlmb3JtUmFuZG9tTnVtYmVyIDwgMSxcbiAgICAgIGBPdXIgdW5pZm9ybSByYW5kb20gbnVtYmVyIGlzIG91dHNpZGUgb2YgaXRzIGV4cGVjdGVkIHJhbmdlIHdpdGggYSB2YWx1ZSBvZiAke3VuaWZvcm1SYW5kb21OdW1iZXJ9YCApO1xuXG4gICAgLy8gc2FtcGxlIHRoZSBleHBvbmVudGlhbCBkaXN0cmlidXRpb25cbiAgICByZXR1cm4gLU1hdGgubG9nKCB1bmlmb3JtUmFuZG9tTnVtYmVyICkgLyB0aGlzLnJhdGU7XG4gIH1cbn1cblxucGhldENvcmUucmVnaXN0ZXIoICdQb2lzc29uRXZlbnRNb2RlbCcsIFBvaXNzb25FdmVudE1vZGVsICk7XG5waGV0Q29yZS5yZWdpc3RlciggJ1VuaWZvcm1FdmVudE1vZGVsJywgVW5pZm9ybUV2ZW50TW9kZWwgKTtcbnBoZXRDb3JlLnJlZ2lzdGVyKCAnQ29uc3RhbnRFdmVudE1vZGVsJywgQ29uc3RhbnRFdmVudE1vZGVsICk7XG5cbnBoZXRDb3JlLnJlZ2lzdGVyKCAnRXZlbnRUaW1lcicsIEV2ZW50VGltZXIgKTsiXSwibmFtZXMiOlsicGhldENvcmUiLCJFdmVudFRpbWVyIiwic3RlcCIsImR0IiwidGltZUJlZm9yZU5leHRFdmVudCIsInBlcmlvZCIsImV2ZW50TW9kZWwiLCJnZXRQZXJpb2RCZWZvcmVOZXh0RXZlbnQiLCJldmVudENhbGxiYWNrIiwiZ2V0UmF0aW8iLCJDb25zdGFudEV2ZW50TW9kZWwiLCJyYXRlIiwiYXNzZXJ0IiwiVW5pZm9ybUV2ZW50TW9kZWwiLCJ1bmlmb3JtUmFuZG9tTnVtYmVyIiwicHNldWRvUmFuZG9tTnVtYmVyU291cmNlIiwiUG9pc3NvbkV2ZW50TW9kZWwiLCJNYXRoIiwibG9nIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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