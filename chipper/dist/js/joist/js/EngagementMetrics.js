// Copyright 2019-2024, University of Colorado Boulder
/**
 * Monitors the engagement as it relates to time spent on each screen of a sim. Mainly this is to provide this information
 * to a PhET-iO wrapper frame.
 *
 * The main output of this file is powered by the data stream. As a result the finest granularity of this data is based on
 * the most frequent events that are emitting. As of this writing, when emitting high frequency events, that is every
 * frame on the "stepSimulation" event. Note that this Type requires high frequency events to be emitted.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Property from '../../axon/js/Property.js';
import joist from './joist.js';
import TemporalCounter from './TemporalCounter.js';
let EngagementMetrics = class EngagementMetrics {
    /**
   * Returns true if the event signifies that the student is "engaged." The current definition is just pointer down
   * events.
   */ isEngagedEvent(event) {
        let engaged = false;
        [
            'mouseDownAction',
            'touchDownAction',
            'keydownAction',
            'penDownAction'
        ].forEach((eventName)=>{
            if (window.phetio.PhetioIDUtils.getComponentName(event.phetioID) === eventName) {
                engaged = true;
            }
        });
        return engaged;
    }
    /**
   * get the current engagement data of the simulation.
   */ getEngagementMetrics() {
        const screens = this.screens;
        return {
            sim: {
                // the timestamp of the first received model step
                startTimestamp: this.startTimestamp,
                // number of seconds since startTimestamp
                elapsedTime: _.sum(screens.map((screen)=>screen.totalTime)),
                // number of seconds in which "engagement" occurred
                engagedTime: _.sum(screens.map((screen)=>screen.engagedTime)),
                // the timestamp of the first time the sim is engaged with
                firstEngagementTimestamp: _.min(screens.map((screen)=>screen.firstTimestamp)),
                // current time of the sim
                currentTimestamp: _.max(screens.map((screen)=>screen.lastTimestamp))
            },
            screens: screens.map((screen)=>screen.getData())
        };
    }
    constructor(sim){
        this.screens = [] // {ScreenData[]}
        ;
        this.startTimestamp = null // number, the timestamp of the start of the sim.
        ;
        const dataStream = phet && phet.phetio && phet.phetio.dataStream;
        assert && assert(dataStream, 'cannot add dataStream listener because dataStream is not defined');
        let currentScreenEntry = this.screens[sim.screens.indexOf(sim.selectedScreenProperty.value)];
        sim.screens.forEach((screen)=>{
            this.screens.push(new ScreenData(screen.tandem.name));
        });
        const updateCurrentScreenEntry = (event)=>{
            currentScreenEntry = this.screens[sim.screens.indexOf(sim.selectedScreenProperty.value)];
            // initial condition if first time on this screen
            currentScreenEntry.firstTimestamp = currentScreenEntry.firstTimestamp || event.time;
        };
        // phet-io data stream listener for every sim event.
        dataStream.addAllEventListener((event)=>{
            // initial condition
            if (this.startTimestamp === null) {
                this.startTimestamp = event.time;
                updateCurrentScreenEntry(event);
            }
            // screenIndex changedr
            if (event.phetioID === sim.selectedScreenProperty.tandem.phetioID && event.name === Property.CHANGED_EVENT_NAME) {
                updateCurrentScreenEntry(event);
            }
            // Handle the case if the event signifies engagement with the simulation.
            this.isEngagedEvent(event) && currentScreenEntry.onEngagedEvent(event, this.startTimestamp);
            if (event.phetioID === sim.stepSimulationAction.tandem.phetioID) {
                // TODO: counted even when not in the active browser tab, perhaps we need to use browserTabVisibleProperty, https://github.com/phetsims/joist/issues/553
                // TODO: or just be adding up dt values instead of trying to use event.time, which is just from Date.now(), https://github.com/phetsims/joist/issues/553
                currentScreenEntry.lastTimestamp = event.time;
                currentScreenEntry.totalTime += Math.floor(event.data.dt * 1000);
            }
        });
    }
};
// private class to keep track of data for each screen.
let ScreenData = class ScreenData {
    /**
   * Getter to keep things a bit more modular
   * @returns - the ms of engagement for the sim
   */ get engagedTime() {
        return this.temporalCounter.counts * 1000;
    }
    onEngagedEvent(event, simStartTimestamp) {
        this.temporalCounter.onEvent(event.time - simStartTimestamp);
        // case for first engaged event
        this.firstTimestamp = this.firstTimestamp || event.time;
    }
    /**
   * Public facing info, mainer getter for this POJSO.
   */ getData() {
        return {
            name: this.name,
            totalTime: this.totalTime,
            engagedTime: this.engagedTime,
            firstTimestamp: this.firstTimestamp,
            lastTimestamp: this.lastTimestamp
        };
    }
    constructor(name){
        this.firstTimestamp = null;
        this.lastTimestamp = null;
        this.totalTime = 0;
        this.firstEngagedTimestamp = null;
        this.temporalCounter = new TemporalCounter(1000);
        this.name = name;
    }
};
joist.register('EngagementMetrics', EngagementMetrics);
export default EngagementMetrics;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0VuZ2FnZW1lbnRNZXRyaWNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1vbml0b3JzIHRoZSBlbmdhZ2VtZW50IGFzIGl0IHJlbGF0ZXMgdG8gdGltZSBzcGVudCBvbiBlYWNoIHNjcmVlbiBvZiBhIHNpbS4gTWFpbmx5IHRoaXMgaXMgdG8gcHJvdmlkZSB0aGlzIGluZm9ybWF0aW9uXG4gKiB0byBhIFBoRVQtaU8gd3JhcHBlciBmcmFtZS5cbiAqXG4gKiBUaGUgbWFpbiBvdXRwdXQgb2YgdGhpcyBmaWxlIGlzIHBvd2VyZWQgYnkgdGhlIGRhdGEgc3RyZWFtLiBBcyBhIHJlc3VsdCB0aGUgZmluZXN0IGdyYW51bGFyaXR5IG9mIHRoaXMgZGF0YSBpcyBiYXNlZCBvblxuICogdGhlIG1vc3QgZnJlcXVlbnQgZXZlbnRzIHRoYXQgYXJlIGVtaXR0aW5nLiBBcyBvZiB0aGlzIHdyaXRpbmcsIHdoZW4gZW1pdHRpbmcgaGlnaCBmcmVxdWVuY3kgZXZlbnRzLCB0aGF0IGlzIGV2ZXJ5XG4gKiBmcmFtZSBvbiB0aGUgXCJzdGVwU2ltdWxhdGlvblwiIGV2ZW50LiBOb3RlIHRoYXQgdGhpcyBUeXBlIHJlcXVpcmVzIGhpZ2ggZnJlcXVlbmN5IGV2ZW50cyB0byBiZSBlbWl0dGVkLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgeyBQaGV0aW9JRCB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9waGV0LWlvLXR5cGVzLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBTaW0gZnJvbSAnLi9TaW0uanMnO1xuaW1wb3J0IFRlbXBvcmFsQ291bnRlciBmcm9tICcuL1RlbXBvcmFsQ291bnRlci5qcyc7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVE9ETzogRHVwbGljYXRpb24gYWxlcnQhIE1LIGRvZXNuJ3Qgd2FudCB0byBpbXBvcnQgZnJvbSBwaGV0LWlvIGludG8gam9pc3QsIHNvIHdlIHdpbGwganVzdCBkdXBsaWNhdGUgdGhlIHR5cGUgZm9yIG5vdy4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy81NTNcbnR5cGUgUGhldGlvRXZlbnREYXRhID0gUmVjb3JkPHN0cmluZywgSW50ZW50aW9uYWxBbnk+O1xudHlwZSBQaGV0aW9FdmVudCA9IHtcbiAgaW5kZXg6IG51bWJlcjtcbiAgdGltZTogbnVtYmVyO1xuICB0eXBlOiBzdHJpbmc7XG4gIHBoZXRpb0lEOiBQaGV0aW9JRDtcbiAgbmFtZTogc3RyaW5nO1xuICBjb21wb25lbnRUeXBlOiBzdHJpbmc7XG4gIGNoaWxkcmVuPzogUGhldGlvRXZlbnRbXTtcbiAgZGF0YT86IFBoZXRpb0V2ZW50RGF0YTtcbiAgbWV0YWRhdGE/OiBQaGV0aW9FdmVudERhdGE7XG59O1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudHlwZSBTY3JlZW5EYXRhVHlwZSA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICB0b3RhbFRpbWU6IG51bWJlcjtcbiAgZW5nYWdlZFRpbWU6IG51bWJlcjtcbiAgZmlyc3RUaW1lc3RhbXA6IG51bWJlcjtcbiAgbGFzdFRpbWVzdGFtcDogbnVtYmVyO1xufTtcbnR5cGUgRW5nYWdlbWVudE1ldHJpY3NEYXRhID0ge1xuICBzaW06IHtcblxuICAgIC8vIHRoZSB0aW1lc3RhbXAgb2YgdGhlIGZpcnN0IHJlY2VpdmVkIG1vZGVsIHN0ZXBcbiAgICBzdGFydFRpbWVzdGFtcDogbnVtYmVyO1xuXG4gICAgLy8gbnVtYmVyIG9mIHNlY29uZHMgc2luY2Ugc3RhcnRUaW1lc3RhbXBcbiAgICBlbGFwc2VkVGltZTogbnVtYmVyO1xuXG4gICAgLy8gbnVtYmVyIG9mIHNlY29uZHMgaW4gd2hpY2ggXCJlbmdhZ2VtZW50XCIgb2NjdXJyZWRcbiAgICBlbmdhZ2VkVGltZTogbnVtYmVyO1xuXG4gICAgLy8gdGhlIHRpbWVzdGFtcCBvZiB0aGUgZmlyc3QgdGltZSB0aGUgc2ltIGlzIGVuZ2FnZWQgd2l0aFxuICAgIGZpcnN0RW5nYWdlbWVudFRpbWVzdGFtcDogbnVtYmVyO1xuXG4gICAgLy8gY3VycmVudCB0aW1lIG9mIHRoZSBzaW1cbiAgICBjdXJyZW50VGltZXN0YW1wOiBudW1iZXI7XG4gIH07XG4gIHNjcmVlbnM6IFNjcmVlbkRhdGFUeXBlW107XG59O1xuXG5cbmNsYXNzIEVuZ2FnZW1lbnRNZXRyaWNzIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IHNjcmVlbnM6IFNjcmVlbkRhdGFbXSA9IFtdOyAvLyB7U2NyZWVuRGF0YVtdfVxuXG4gIHByaXZhdGUgc3RhcnRUaW1lc3RhbXA6IG51bWJlciB8IG51bGwgPSBudWxsOyAvLyBudW1iZXIsIHRoZSB0aW1lc3RhbXAgb2YgdGhlIHN0YXJ0IG9mIHRoZSBzaW0uXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzaW06IFNpbSApIHtcbiAgICBjb25zdCBkYXRhU3RyZWFtID0gcGhldCAmJiBwaGV0LnBoZXRpbyAmJiBwaGV0LnBoZXRpby5kYXRhU3RyZWFtO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRhdGFTdHJlYW0sICdjYW5ub3QgYWRkIGRhdGFTdHJlYW0gbGlzdGVuZXIgYmVjYXVzZSBkYXRhU3RyZWFtIGlzIG5vdCBkZWZpbmVkJyApO1xuXG4gICAgbGV0IGN1cnJlbnRTY3JlZW5FbnRyeSA9IHRoaXMuc2NyZWVuc1sgc2ltLnNjcmVlbnMuaW5kZXhPZiggc2ltLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWUgKSBdO1xuXG4gICAgc2ltLnNjcmVlbnMuZm9yRWFjaCggc2NyZWVuID0+IHtcbiAgICAgIHRoaXMuc2NyZWVucy5wdXNoKCBuZXcgU2NyZWVuRGF0YSggc2NyZWVuLnRhbmRlbS5uYW1lICkgKTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCB1cGRhdGVDdXJyZW50U2NyZWVuRW50cnkgPSAoIGV2ZW50OiBQaGV0aW9FdmVudCApID0+IHtcbiAgICAgIGN1cnJlbnRTY3JlZW5FbnRyeSA9IHRoaXMuc2NyZWVuc1sgc2ltLnNjcmVlbnMuaW5kZXhPZiggc2ltLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWUgKSBdO1xuXG4gICAgICAvLyBpbml0aWFsIGNvbmRpdGlvbiBpZiBmaXJzdCB0aW1lIG9uIHRoaXMgc2NyZWVuXG4gICAgICBjdXJyZW50U2NyZWVuRW50cnkuZmlyc3RUaW1lc3RhbXAgPSBjdXJyZW50U2NyZWVuRW50cnkuZmlyc3RUaW1lc3RhbXAhIHx8IGV2ZW50LnRpbWU7XG4gICAgfTtcblxuICAgIC8vIHBoZXQtaW8gZGF0YSBzdHJlYW0gbGlzdGVuZXIgZm9yIGV2ZXJ5IHNpbSBldmVudC5cbiAgICBkYXRhU3RyZWFtLmFkZEFsbEV2ZW50TGlzdGVuZXIoICggZXZlbnQ6IFBoZXRpb0V2ZW50ICkgPT4ge1xuXG4gICAgICAvLyBpbml0aWFsIGNvbmRpdGlvblxuICAgICAgaWYgKCB0aGlzLnN0YXJ0VGltZXN0YW1wID09PSBudWxsICkge1xuICAgICAgICB0aGlzLnN0YXJ0VGltZXN0YW1wID0gZXZlbnQudGltZTtcbiAgICAgICAgdXBkYXRlQ3VycmVudFNjcmVlbkVudHJ5KCBldmVudCApO1xuICAgICAgfVxuXG4gICAgICAvLyBzY3JlZW5JbmRleCBjaGFuZ2VkclxuICAgICAgaWYgKCBldmVudC5waGV0aW9JRCA9PT0gc2ltLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudGFuZGVtLnBoZXRpb0lEICYmXG4gICAgICAgICAgIGV2ZW50Lm5hbWUgPT09IFByb3BlcnR5LkNIQU5HRURfRVZFTlRfTkFNRSApIHtcbiAgICAgICAgdXBkYXRlQ3VycmVudFNjcmVlbkVudHJ5KCBldmVudCApO1xuICAgICAgfVxuXG4gICAgICAvLyBIYW5kbGUgdGhlIGNhc2UgaWYgdGhlIGV2ZW50IHNpZ25pZmllcyBlbmdhZ2VtZW50IHdpdGggdGhlIHNpbXVsYXRpb24uXG4gICAgICB0aGlzLmlzRW5nYWdlZEV2ZW50KCBldmVudCApICYmIGN1cnJlbnRTY3JlZW5FbnRyeS5vbkVuZ2FnZWRFdmVudCggZXZlbnQsIHRoaXMuc3RhcnRUaW1lc3RhbXAgKTtcblxuICAgICAgaWYgKCBldmVudC5waGV0aW9JRCA9PT0gc2ltLnN0ZXBTaW11bGF0aW9uQWN0aW9uLnRhbmRlbS5waGV0aW9JRCApIHtcblxuICAgICAgICAvLyBUT0RPOiBjb3VudGVkIGV2ZW4gd2hlbiBub3QgaW4gdGhlIGFjdGl2ZSBicm93c2VyIHRhYiwgcGVyaGFwcyB3ZSBuZWVkIHRvIHVzZSBicm93c2VyVGFiVmlzaWJsZVByb3BlcnR5LCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzU1M1xuICAgICAgICAvLyBUT0RPOiBvciBqdXN0IGJlIGFkZGluZyB1cCBkdCB2YWx1ZXMgaW5zdGVhZCBvZiB0cnlpbmcgdG8gdXNlIGV2ZW50LnRpbWUsIHdoaWNoIGlzIGp1c3QgZnJvbSBEYXRlLm5vdygpLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzU1M1xuICAgICAgICBjdXJyZW50U2NyZWVuRW50cnkubGFzdFRpbWVzdGFtcCA9IGV2ZW50LnRpbWU7XG4gICAgICAgIGN1cnJlbnRTY3JlZW5FbnRyeS50b3RhbFRpbWUgKz0gTWF0aC5mbG9vciggZXZlbnQuZGF0YSEuZHQgKiAxMDAwICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZXZlbnQgc2lnbmlmaWVzIHRoYXQgdGhlIHN0dWRlbnQgaXMgXCJlbmdhZ2VkLlwiIFRoZSBjdXJyZW50IGRlZmluaXRpb24gaXMganVzdCBwb2ludGVyIGRvd25cbiAgICogZXZlbnRzLlxuICAgKi9cbiAgcHJpdmF0ZSBpc0VuZ2FnZWRFdmVudCggZXZlbnQ6IFBoZXRpb0V2ZW50ICk6IGJvb2xlYW4ge1xuICAgIGxldCBlbmdhZ2VkID0gZmFsc2U7XG4gICAgWyAnbW91c2VEb3duQWN0aW9uJywgJ3RvdWNoRG93bkFjdGlvbicsICdrZXlkb3duQWN0aW9uJywgJ3BlbkRvd25BY3Rpb24nIF0uZm9yRWFjaCggZXZlbnROYW1lID0+IHtcbiAgICAgIGlmICggd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLmdldENvbXBvbmVudE5hbWUoIGV2ZW50LnBoZXRpb0lEICkgPT09IGV2ZW50TmFtZSApIHtcbiAgICAgICAgZW5nYWdlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSApO1xuICAgIHJldHVybiBlbmdhZ2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldCB0aGUgY3VycmVudCBlbmdhZ2VtZW50IGRhdGEgb2YgdGhlIHNpbXVsYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZ2V0RW5nYWdlbWVudE1ldHJpY3MoKTogRW5nYWdlbWVudE1ldHJpY3NEYXRhIHtcbiAgICBjb25zdCBzY3JlZW5zID0gdGhpcy5zY3JlZW5zO1xuICAgIHJldHVybiB7XG4gICAgICBzaW06IHtcblxuICAgICAgICAvLyB0aGUgdGltZXN0YW1wIG9mIHRoZSBmaXJzdCByZWNlaXZlZCBtb2RlbCBzdGVwXG4gICAgICAgIHN0YXJ0VGltZXN0YW1wOiB0aGlzLnN0YXJ0VGltZXN0YW1wISxcblxuICAgICAgICAvLyBudW1iZXIgb2Ygc2Vjb25kcyBzaW5jZSBzdGFydFRpbWVzdGFtcFxuICAgICAgICBlbGFwc2VkVGltZTogXy5zdW0oIHNjcmVlbnMubWFwKCBzY3JlZW4gPT4gc2NyZWVuLnRvdGFsVGltZSApICksXG5cbiAgICAgICAgLy8gbnVtYmVyIG9mIHNlY29uZHMgaW4gd2hpY2ggXCJlbmdhZ2VtZW50XCIgb2NjdXJyZWRcbiAgICAgICAgZW5nYWdlZFRpbWU6IF8uc3VtKCBzY3JlZW5zLm1hcCggc2NyZWVuID0+IHNjcmVlbi5lbmdhZ2VkVGltZSApICksXG5cbiAgICAgICAgLy8gdGhlIHRpbWVzdGFtcCBvZiB0aGUgZmlyc3QgdGltZSB0aGUgc2ltIGlzIGVuZ2FnZWQgd2l0aFxuICAgICAgICBmaXJzdEVuZ2FnZW1lbnRUaW1lc3RhbXA6IF8ubWluKCBzY3JlZW5zLm1hcCggc2NyZWVuID0+IHNjcmVlbi5maXJzdFRpbWVzdGFtcCApICkhLFxuXG4gICAgICAgIC8vIGN1cnJlbnQgdGltZSBvZiB0aGUgc2ltXG4gICAgICAgIGN1cnJlbnRUaW1lc3RhbXA6IF8ubWF4KCBzY3JlZW5zLm1hcCggc2NyZWVuID0+IHNjcmVlbi5sYXN0VGltZXN0YW1wICkgKSFcbiAgICAgIH0sXG4gICAgICBzY3JlZW5zOiBzY3JlZW5zLm1hcCggc2NyZWVuID0+IHNjcmVlbi5nZXREYXRhKCkgKVxuICAgIH07XG4gIH1cbn1cblxuLy8gcHJpdmF0ZSBjbGFzcyB0byBrZWVwIHRyYWNrIG9mIGRhdGEgZm9yIGVhY2ggc2NyZWVuLlxuY2xhc3MgU2NyZWVuRGF0YSB7XG5cbiAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgcHVibGljIGZpcnN0VGltZXN0YW1wOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHVibGljIGxhc3RUaW1lc3RhbXA6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICBwdWJsaWMgdG90YWxUaW1lID0gMDtcbiAgcHVibGljIGZpcnN0RW5nYWdlZFRpbWVzdGFtcCA9IG51bGw7XG4gIHB1YmxpYyByZWFkb25seSB0ZW1wb3JhbENvdW50ZXIgPSBuZXcgVGVtcG9yYWxDb3VudGVyKCAxMDAwICk7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBuYW1lOiBzdHJpbmcgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXR0ZXIgdG8ga2VlcCB0aGluZ3MgYSBiaXQgbW9yZSBtb2R1bGFyXG4gICAqIEByZXR1cm5zIC0gdGhlIG1zIG9mIGVuZ2FnZW1lbnQgZm9yIHRoZSBzaW1cbiAgICovXG4gIHB1YmxpYyBnZXQgZW5nYWdlZFRpbWUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50ZW1wb3JhbENvdW50ZXIuY291bnRzICogMTAwMDtcbiAgfVxuXG4gIHB1YmxpYyBvbkVuZ2FnZWRFdmVudCggZXZlbnQ6IFBoZXRpb0V2ZW50LCBzaW1TdGFydFRpbWVzdGFtcDogbnVtYmVyICk6IHZvaWQge1xuXG4gICAgdGhpcy50ZW1wb3JhbENvdW50ZXIub25FdmVudCggZXZlbnQudGltZSAtIHNpbVN0YXJ0VGltZXN0YW1wICk7XG5cbiAgICAvLyBjYXNlIGZvciBmaXJzdCBlbmdhZ2VkIGV2ZW50XG4gICAgdGhpcy5maXJzdFRpbWVzdGFtcCA9IHRoaXMuZmlyc3RUaW1lc3RhbXAhIHx8IGV2ZW50LnRpbWU7XG4gIH1cblxuICAvKipcbiAgICogUHVibGljIGZhY2luZyBpbmZvLCBtYWluZXIgZ2V0dGVyIGZvciB0aGlzIFBPSlNPLlxuICAgKi9cbiAgcHVibGljIGdldERhdGEoKTogU2NyZWVuRGF0YVR5cGUge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICB0b3RhbFRpbWU6IHRoaXMudG90YWxUaW1lLFxuICAgICAgZW5nYWdlZFRpbWU6IHRoaXMuZW5nYWdlZFRpbWUsXG4gICAgICBmaXJzdFRpbWVzdGFtcDogdGhpcy5maXJzdFRpbWVzdGFtcCEsXG4gICAgICBsYXN0VGltZXN0YW1wOiB0aGlzLmxhc3RUaW1lc3RhbXAhXG4gICAgfTtcbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ0VuZ2FnZW1lbnRNZXRyaWNzJywgRW5nYWdlbWVudE1ldHJpY3MgKTtcbmV4cG9ydCBkZWZhdWx0IEVuZ2FnZW1lbnRNZXRyaWNzOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsImpvaXN0IiwiVGVtcG9yYWxDb3VudGVyIiwiRW5nYWdlbWVudE1ldHJpY3MiLCJpc0VuZ2FnZWRFdmVudCIsImV2ZW50IiwiZW5nYWdlZCIsImZvckVhY2giLCJldmVudE5hbWUiLCJ3aW5kb3ciLCJwaGV0aW8iLCJQaGV0aW9JRFV0aWxzIiwiZ2V0Q29tcG9uZW50TmFtZSIsInBoZXRpb0lEIiwiZ2V0RW5nYWdlbWVudE1ldHJpY3MiLCJzY3JlZW5zIiwic2ltIiwic3RhcnRUaW1lc3RhbXAiLCJlbGFwc2VkVGltZSIsIl8iLCJzdW0iLCJtYXAiLCJzY3JlZW4iLCJ0b3RhbFRpbWUiLCJlbmdhZ2VkVGltZSIsImZpcnN0RW5nYWdlbWVudFRpbWVzdGFtcCIsIm1pbiIsImZpcnN0VGltZXN0YW1wIiwiY3VycmVudFRpbWVzdGFtcCIsIm1heCIsImxhc3RUaW1lc3RhbXAiLCJnZXREYXRhIiwiZGF0YVN0cmVhbSIsInBoZXQiLCJhc3NlcnQiLCJjdXJyZW50U2NyZWVuRW50cnkiLCJpbmRleE9mIiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsInZhbHVlIiwicHVzaCIsIlNjcmVlbkRhdGEiLCJ0YW5kZW0iLCJuYW1lIiwidXBkYXRlQ3VycmVudFNjcmVlbkVudHJ5IiwidGltZSIsImFkZEFsbEV2ZW50TGlzdGVuZXIiLCJDSEFOR0VEX0VWRU5UX05BTUUiLCJvbkVuZ2FnZWRFdmVudCIsInN0ZXBTaW11bGF0aW9uQWN0aW9uIiwiTWF0aCIsImZsb29yIiwiZGF0YSIsImR0IiwidGVtcG9yYWxDb3VudGVyIiwiY291bnRzIiwic2ltU3RhcnRUaW1lc3RhbXAiLCJvbkV2ZW50IiwiZmlyc3RFbmdhZ2VkVGltZXN0YW1wIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Q0FX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