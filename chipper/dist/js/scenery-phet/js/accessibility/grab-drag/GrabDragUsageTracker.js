// Copyright 2024, University of Colorado Boulder
/**
 * The model of the grab drag cueing logic. This is a separate model in part so that different interaction instances
 * can share the same info about whether the cues should be shown.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import sceneryPhet from '../../sceneryPhet.js';
let GrabDragUsageTracker = class GrabDragUsageTracker {
    reset() {
        this.numberOfGrabs = 0;
        this.numberOfKeyboardGrabs = 0;
        this.shouldShowDragCue = true;
    }
    constructor(){
        // The number of times the component has been picked up for dragging, regardless
        // of pickup method for things like determining content for "hints" describing the interaction
        // to the user
        this.numberOfGrabs = 0;
        // The number of times this component has been picked up with a keyboard specifically to provide hints specific
        // to alternative input.
        this.numberOfKeyboardGrabs = 0;
        // Clients can provide application-specific logic for when to show the drag cue. Typically, they will want to hide it
        // after the user has interacted with it in a certain way.
        this.shouldShowDragCue = true;
    }
};
export { GrabDragUsageTracker as default };
sceneryPhet.register('GrabDragUsageTracker', GrabDragUsageTracker);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2dyYWItZHJhZy9HcmFiRHJhZ1VzYWdlVHJhY2tlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIG1vZGVsIG9mIHRoZSBncmFiIGRyYWcgY3VlaW5nIGxvZ2ljLiBUaGlzIGlzIGEgc2VwYXJhdGUgbW9kZWwgaW4gcGFydCBzbyB0aGF0IGRpZmZlcmVudCBpbnRlcmFjdGlvbiBpbnN0YW5jZXNcbiAqIGNhbiBzaGFyZSB0aGUgc2FtZSBpbmZvIGFib3V0IHdoZXRoZXIgdGhlIGN1ZXMgc2hvdWxkIGJlIHNob3duLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFiRHJhZ1VzYWdlVHJhY2tlciB7XG5cbiAgLy8gVGhlIG51bWJlciBvZiB0aW1lcyB0aGUgY29tcG9uZW50IGhhcyBiZWVuIHBpY2tlZCB1cCBmb3IgZHJhZ2dpbmcsIHJlZ2FyZGxlc3NcbiAgLy8gb2YgcGlja3VwIG1ldGhvZCBmb3IgdGhpbmdzIGxpa2UgZGV0ZXJtaW5pbmcgY29udGVudCBmb3IgXCJoaW50c1wiIGRlc2NyaWJpbmcgdGhlIGludGVyYWN0aW9uXG4gIC8vIHRvIHRoZSB1c2VyXG4gIHB1YmxpYyBudW1iZXJPZkdyYWJzID0gMDtcblxuICAvLyBUaGUgbnVtYmVyIG9mIHRpbWVzIHRoaXMgY29tcG9uZW50IGhhcyBiZWVuIHBpY2tlZCB1cCB3aXRoIGEga2V5Ym9hcmQgc3BlY2lmaWNhbGx5IHRvIHByb3ZpZGUgaGludHMgc3BlY2lmaWNcbiAgLy8gdG8gYWx0ZXJuYXRpdmUgaW5wdXQuXG4gIHB1YmxpYyBudW1iZXJPZktleWJvYXJkR3JhYnMgPSAwO1xuXG4gIC8vIENsaWVudHMgY2FuIHByb3ZpZGUgYXBwbGljYXRpb24tc3BlY2lmaWMgbG9naWMgZm9yIHdoZW4gdG8gc2hvdyB0aGUgZHJhZyBjdWUuIFR5cGljYWxseSwgdGhleSB3aWxsIHdhbnQgdG8gaGlkZSBpdFxuICAvLyBhZnRlciB0aGUgdXNlciBoYXMgaW50ZXJhY3RlZCB3aXRoIGl0IGluIGEgY2VydGFpbiB3YXkuXG4gIHB1YmxpYyBzaG91bGRTaG93RHJhZ0N1ZSA9IHRydWU7XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMubnVtYmVyT2ZHcmFicyA9IDA7XG4gICAgdGhpcy5udW1iZXJPZktleWJvYXJkR3JhYnMgPSAwO1xuICAgIHRoaXMuc2hvdWxkU2hvd0RyYWdDdWUgPSB0cnVlO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnR3JhYkRyYWdVc2FnZVRyYWNrZXInLCBHcmFiRHJhZ1VzYWdlVHJhY2tlciApOyJdLCJuYW1lcyI6WyJzY2VuZXJ5UGhldCIsIkdyYWJEcmFnVXNhZ2VUcmFja2VyIiwicmVzZXQiLCJudW1iZXJPZkdyYWJzIiwibnVtYmVyT2ZLZXlib2FyZEdyYWJzIiwic2hvdWxkU2hvd0RyYWdDdWUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxpQkFBaUIsdUJBQXVCO0FBRWhDLElBQUEsQUFBTUMsdUJBQU4sTUFBTUE7SUFlWkMsUUFBYztRQUNuQixJQUFJLENBQUNDLGFBQWEsR0FBRztRQUNyQixJQUFJLENBQUNDLHFCQUFxQixHQUFHO1FBQzdCLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUc7SUFDM0I7O1FBakJBLGdGQUFnRjtRQUNoRiw4RkFBOEY7UUFDOUYsY0FBYzthQUNQRixnQkFBZ0I7UUFFdkIsK0dBQStHO1FBQy9HLHdCQUF3QjthQUNqQkMsd0JBQXdCO1FBRS9CLHFIQUFxSDtRQUNySCwwREFBMEQ7YUFDbkRDLG9CQUFvQjs7QUFPN0I7QUFwQkEsU0FBcUJKLGtDQW9CcEI7QUFFREQsWUFBWU0sUUFBUSxDQUFFLHdCQUF3QkwifQ==