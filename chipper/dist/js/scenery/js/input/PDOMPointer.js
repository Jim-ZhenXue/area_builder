// Copyright 2018-2024, University of Colorado Boulder
/**
 * Pointer type for managing accessibility, in particular the focus in the display.
 * Tracks the state of accessible focus.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Vector2 from '../../../dot/js/Vector2.js';
import { PDOMInstance, Pointer, scenery } from '../imports.js';
let PDOMPointer = class PDOMPointer extends Pointer {
    /**
   * Set up listeners, attaching blur and focus listeners to the pointer once this PDOMPointer has been attached
   * to a display.
   */ initializeListeners() {
        this.addInputListener({
            focus: (event)=>{
                assert && assert(this.trail, 'trail should have been calculated for the focused node');
                const lastNode = this.trail.lastNode();
                // NOTE: The "root" peer can't be focused (so it doesn't matter if it doesn't have a node).
                if (lastNode.focusable) {
                    const visualTrail = PDOMInstance.guessVisualTrail(this.trail, this.display.rootNode);
                    this.point = visualTrail.parentToGlobalPoint(lastNode.center);
                    // TODO: it would be better if we could use this assertion instead, but guessVisualTrail seems to not be working here, https://github.com/phetsims/phet-io/issues/1847
                    if (isNaN(this.point.x)) {
                        this.point.setXY(0, 0);
                    // assert && assert( !isNaN( this.point.x ), 'Guess visual trail should be able to get the right point' );
                    }
                }
            },
            blur: (event)=>{
                this.trail = null;
                this.keydownTargetNode = null;
            },
            keydown: (event)=>{
                if (this.blockTrustedEvents && event.domEvent.isTrusted) {
                    return;
                }
                // set the target to potentially block keyup events
                this.keydownTargetNode = event.target;
            },
            keyup: (event)=>{
                if (this.blockTrustedEvents && event.domEvent.isTrusted) {
                    return;
                }
                // The keyup event was received on a node that didn't receive a keydown event, abort to prevent any other
                // listeners from being called for this event. Done after updating KeyStateTracker so that the global state
                // of the keyboard is still accurate
                if (this.keydownTargetNode !== event.target) {
                    event.abort();
                }
            }
        });
    }
    updateTrail(trail) {
        // overwrite this.trail if we don't have a trail yet, or if the new trail doesn't equal the old one.
        if (!(this.trail && this.trail.equals(trail))) {
            this.trail = trail;
        }
        return this.trail;
    }
    constructor(display){
        // We'll start with a defined Vector2, so that pointers always have points
        super(Vector2.ZERO, 'pdom');
        this.display = display;
        this.initializeListeners();
        this.blockTrustedEvents = false;
        this.keydownTargetNode = null;
        sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`Created ${this.toString()}`);
    }
};
export { PDOMPointer as default };
scenery.register('PDOMPointer', PDOMPointer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvUERPTVBvaW50ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUG9pbnRlciB0eXBlIGZvciBtYW5hZ2luZyBhY2Nlc3NpYmlsaXR5LCBpbiBwYXJ0aWN1bGFyIHRoZSBmb2N1cyBpbiB0aGUgZGlzcGxheS5cbiAqIFRyYWNrcyB0aGUgc3RhdGUgb2YgYWNjZXNzaWJsZSBmb2N1cy5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBEaXNwbGF5LCBOb2RlLCBQRE9NSW5zdGFuY2UsIFBvaW50ZXIsIHNjZW5lcnksIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBET01Qb2ludGVyIGV4dGVuZHMgUG9pbnRlciB7XG5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIC0gUHJldmVudCBhbnkgXCJ0cnVzdGVkXCIgZXZlbnRzIGZyb20gYmVpbmcgZGlzcGF0Y2hlZCB0byB0aGUgS2V5U3RhdGVUcmFja2VyLiBXaGVuXG4gIC8vIHRydWUsIG9ubHkgc2NyaXB0ZWQgZXZlbnRzIGFyZSBwYXNzZWQgdG8gdGhlIGtleVN0YXRlVHJhY2tlci4gT3RoZXJ3aXNlLCB0aGUgbW9kZWxlZCBrZXlib2FyZCBzdGF0ZSB3aGVuIHVzaW5nXG4gIC8vIGZ1enpCb2FyZCB3aWxsIGFwcGVhciBicm9rZW4gYXMgYm90aCB1c2VyIGFuZCBLZXlib2FyZEZ1enplciBpbnRlcmFjdCB3aXRoIGRpc3BsYXkuXG4gIHB1YmxpYyBibG9ja1RydXN0ZWRFdmVudHM6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwbGF5OiBEaXNwbGF5O1xuXG4gIC8vIHRhcmdldCBvZiBhIHVzZXIgZXZlbnQsIGlmIGZvY3VzIGNoYW5nZXMgaW4gcmVzcG9uc2UgdG8ga2V5ZG93biBsaXN0ZW5lcnMsIGxpc3RlbmVyc1xuICAvLyBvbiBrZXl1cCBhcmUgcHJldmVudGVkIGJlY2F1c2UgdGhlIGtleSBwcmVzcyB3YXMgbm90IGludGVuZGVkIGZvciB0aGUgbmV3bHkgZm9jdXNlZCBub2RlLlxuICAvLyBXZSBvbmx5IGRvIHRoaXMgZm9yIGtleXVwL2tleWRvd24gYmVjYXVzZSBmb2N1cyBjYW4gY2hhbmdlIGJldHdlZW4gdGhlbSwgYnV0IGl0IGlzIG5vdCBuZWNlc3NhcnlcbiAgLy8gZm9yIG90aGVyIHNpbmdsZSBldmVudHMgbGlrZSAnY2xpY2snLCAnaW5wdXQnIG9yICdjaGFuZ2UuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvOTQyXG4gIHByaXZhdGUga2V5ZG93blRhcmdldE5vZGU6IE5vZGUgfCBudWxsO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzcGxheTogRGlzcGxheSApIHtcbiAgICAvLyBXZSdsbCBzdGFydCB3aXRoIGEgZGVmaW5lZCBWZWN0b3IyLCBzbyB0aGF0IHBvaW50ZXJzIGFsd2F5cyBoYXZlIHBvaW50c1xuICAgIHN1cGVyKCBWZWN0b3IyLlpFUk8sICdwZG9tJyApO1xuXG4gICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUxpc3RlbmVycygpO1xuXG4gICAgdGhpcy5ibG9ja1RydXN0ZWRFdmVudHMgPSBmYWxzZTtcblxuICAgIHRoaXMua2V5ZG93blRhcmdldE5vZGUgPSBudWxsO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIgJiYgc2NlbmVyeUxvZy5Qb2ludGVyKCBgQ3JlYXRlZCAke3RoaXMudG9TdHJpbmcoKX1gICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHVwIGxpc3RlbmVycywgYXR0YWNoaW5nIGJsdXIgYW5kIGZvY3VzIGxpc3RlbmVycyB0byB0aGUgcG9pbnRlciBvbmNlIHRoaXMgUERPTVBvaW50ZXIgaGFzIGJlZW4gYXR0YWNoZWRcbiAgICogdG8gYSBkaXNwbGF5LlxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplTGlzdGVuZXJzKCk6IHZvaWQge1xuXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgICBmb2N1czogZXZlbnQgPT4ge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRyYWlsLCAndHJhaWwgc2hvdWxkIGhhdmUgYmVlbiBjYWxjdWxhdGVkIGZvciB0aGUgZm9jdXNlZCBub2RlJyApO1xuXG4gICAgICAgIGNvbnN0IGxhc3ROb2RlID0gdGhpcy50cmFpbCEubGFzdE5vZGUoKTtcblxuICAgICAgICAvLyBOT1RFOiBUaGUgXCJyb290XCIgcGVlciBjYW4ndCBiZSBmb2N1c2VkIChzbyBpdCBkb2Vzbid0IG1hdHRlciBpZiBpdCBkb2Vzbid0IGhhdmUgYSBub2RlKS5cbiAgICAgICAgaWYgKCBsYXN0Tm9kZS5mb2N1c2FibGUgKSB7XG4gICAgICAgICAgY29uc3QgdmlzdWFsVHJhaWwgPSBQRE9NSW5zdGFuY2UuZ3Vlc3NWaXN1YWxUcmFpbCggdGhpcy50cmFpbCEsIHRoaXMuZGlzcGxheS5yb290Tm9kZSApO1xuICAgICAgICAgIHRoaXMucG9pbnQgPSB2aXN1YWxUcmFpbC5wYXJlbnRUb0dsb2JhbFBvaW50KCBsYXN0Tm9kZS5jZW50ZXIgKTtcblxuICAgICAgICAgIC8vIFRPRE86IGl0IHdvdWxkIGJlIGJldHRlciBpZiB3ZSBjb3VsZCB1c2UgdGhpcyBhc3NlcnRpb24gaW5zdGVhZCwgYnV0IGd1ZXNzVmlzdWFsVHJhaWwgc2VlbXMgdG8gbm90IGJlIHdvcmtpbmcgaGVyZSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE4NDdcbiAgICAgICAgICBpZiAoIGlzTmFOKCB0aGlzLnBvaW50LnggKSApIHtcbiAgICAgICAgICAgIHRoaXMucG9pbnQuc2V0WFkoIDAsIDAgKTtcbiAgICAgICAgICAgIC8vIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggdGhpcy5wb2ludC54ICksICdHdWVzcyB2aXN1YWwgdHJhaWwgc2hvdWxkIGJlIGFibGUgdG8gZ2V0IHRoZSByaWdodCBwb2ludCcgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBibHVyOiBldmVudCA9PiB7XG4gICAgICAgIHRoaXMudHJhaWwgPSBudWxsO1xuICAgICAgICB0aGlzLmtleWRvd25UYXJnZXROb2RlID0gbnVsbDtcbiAgICAgIH0sXG4gICAgICBrZXlkb3duOiBldmVudCA9PiB7XG4gICAgICAgIGlmICggdGhpcy5ibG9ja1RydXN0ZWRFdmVudHMgJiYgZXZlbnQuZG9tRXZlbnQhLmlzVHJ1c3RlZCApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXQgdGhlIHRhcmdldCB0byBwb3RlbnRpYWxseSBibG9jayBrZXl1cCBldmVudHNcbiAgICAgICAgdGhpcy5rZXlkb3duVGFyZ2V0Tm9kZSA9IGV2ZW50LnRhcmdldDtcbiAgICAgIH0sXG4gICAgICBrZXl1cDogZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIHRoaXMuYmxvY2tUcnVzdGVkRXZlbnRzICYmIGV2ZW50LmRvbUV2ZW50IS5pc1RydXN0ZWQgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGtleXVwIGV2ZW50IHdhcyByZWNlaXZlZCBvbiBhIG5vZGUgdGhhdCBkaWRuJ3QgcmVjZWl2ZSBhIGtleWRvd24gZXZlbnQsIGFib3J0IHRvIHByZXZlbnQgYW55IG90aGVyXG4gICAgICAgIC8vIGxpc3RlbmVycyBmcm9tIGJlaW5nIGNhbGxlZCBmb3IgdGhpcyBldmVudC4gRG9uZSBhZnRlciB1cGRhdGluZyBLZXlTdGF0ZVRyYWNrZXIgc28gdGhhdCB0aGUgZ2xvYmFsIHN0YXRlXG4gICAgICAgIC8vIG9mIHRoZSBrZXlib2FyZCBpcyBzdGlsbCBhY2N1cmF0ZVxuICAgICAgICBpZiAoIHRoaXMua2V5ZG93blRhcmdldE5vZGUgIT09IGV2ZW50LnRhcmdldCApIHtcbiAgICAgICAgICBldmVudC5hYm9ydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZVRyYWlsKCB0cmFpbDogVHJhaWwgKTogVHJhaWwge1xuXG4gICAgLy8gb3ZlcndyaXRlIHRoaXMudHJhaWwgaWYgd2UgZG9uJ3QgaGF2ZSBhIHRyYWlsIHlldCwgb3IgaWYgdGhlIG5ldyB0cmFpbCBkb2Vzbid0IGVxdWFsIHRoZSBvbGQgb25lLlxuICAgIGlmICggISggdGhpcy50cmFpbCAmJiB0aGlzLnRyYWlsLmVxdWFscyggdHJhaWwgKSApICkge1xuICAgICAgdGhpcy50cmFpbCA9IHRyYWlsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50cmFpbDtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUERPTVBvaW50ZXInLCBQRE9NUG9pbnRlciApOyJdLCJuYW1lcyI6WyJWZWN0b3IyIiwiUERPTUluc3RhbmNlIiwiUG9pbnRlciIsInNjZW5lcnkiLCJQRE9NUG9pbnRlciIsImluaXRpYWxpemVMaXN0ZW5lcnMiLCJhZGRJbnB1dExpc3RlbmVyIiwiZm9jdXMiLCJldmVudCIsImFzc2VydCIsInRyYWlsIiwibGFzdE5vZGUiLCJmb2N1c2FibGUiLCJ2aXN1YWxUcmFpbCIsImd1ZXNzVmlzdWFsVHJhaWwiLCJkaXNwbGF5Iiwicm9vdE5vZGUiLCJwb2ludCIsInBhcmVudFRvR2xvYmFsUG9pbnQiLCJjZW50ZXIiLCJpc05hTiIsIngiLCJzZXRYWSIsImJsdXIiLCJrZXlkb3duVGFyZ2V0Tm9kZSIsImtleWRvd24iLCJibG9ja1RydXN0ZWRFdmVudHMiLCJkb21FdmVudCIsImlzVHJ1c3RlZCIsInRhcmdldCIsImtleXVwIiwiYWJvcnQiLCJ1cGRhdGVUcmFpbCIsImVxdWFscyIsIlpFUk8iLCJzY2VuZXJ5TG9nIiwidG9TdHJpbmciLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLGFBQWEsNkJBQTZCO0FBQ2pELFNBQXdCQyxZQUFZLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxRQUFlLGdCQUFnQjtBQUV0RSxJQUFBLEFBQU1DLGNBQU4sTUFBTUEsb0JBQW9CRjtJQThCdkM7OztHQUdDLEdBQ0QsQUFBUUcsc0JBQTRCO1FBRWxDLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUU7WUFDckJDLE9BQU9DLENBQUFBO2dCQUNMQyxVQUFVQSxPQUFRLElBQUksQ0FBQ0MsS0FBSyxFQUFFO2dCQUU5QixNQUFNQyxXQUFXLElBQUksQ0FBQ0QsS0FBSyxDQUFFQyxRQUFRO2dCQUVyQywyRkFBMkY7Z0JBQzNGLElBQUtBLFNBQVNDLFNBQVMsRUFBRztvQkFDeEIsTUFBTUMsY0FBY1osYUFBYWEsZ0JBQWdCLENBQUUsSUFBSSxDQUFDSixLQUFLLEVBQUcsSUFBSSxDQUFDSyxPQUFPLENBQUNDLFFBQVE7b0JBQ3JGLElBQUksQ0FBQ0MsS0FBSyxHQUFHSixZQUFZSyxtQkFBbUIsQ0FBRVAsU0FBU1EsTUFBTTtvQkFFN0Qsc0tBQXNLO29CQUN0SyxJQUFLQyxNQUFPLElBQUksQ0FBQ0gsS0FBSyxDQUFDSSxDQUFDLEdBQUs7d0JBQzNCLElBQUksQ0FBQ0osS0FBSyxDQUFDSyxLQUFLLENBQUUsR0FBRztvQkFDckIsMEdBQTBHO29CQUM1RztnQkFDRjtZQUNGO1lBQ0FDLE1BQU1mLENBQUFBO2dCQUNKLElBQUksQ0FBQ0UsS0FBSyxHQUFHO2dCQUNiLElBQUksQ0FBQ2MsaUJBQWlCLEdBQUc7WUFDM0I7WUFDQUMsU0FBU2pCLENBQUFBO2dCQUNQLElBQUssSUFBSSxDQUFDa0Isa0JBQWtCLElBQUlsQixNQUFNbUIsUUFBUSxDQUFFQyxTQUFTLEVBQUc7b0JBQzFEO2dCQUNGO2dCQUVBLG1EQUFtRDtnQkFDbkQsSUFBSSxDQUFDSixpQkFBaUIsR0FBR2hCLE1BQU1xQixNQUFNO1lBQ3ZDO1lBQ0FDLE9BQU90QixDQUFBQTtnQkFDTCxJQUFLLElBQUksQ0FBQ2tCLGtCQUFrQixJQUFJbEIsTUFBTW1CLFFBQVEsQ0FBRUMsU0FBUyxFQUFHO29CQUMxRDtnQkFDRjtnQkFFQSx5R0FBeUc7Z0JBQ3pHLDJHQUEyRztnQkFDM0csb0NBQW9DO2dCQUNwQyxJQUFLLElBQUksQ0FBQ0osaUJBQWlCLEtBQUtoQixNQUFNcUIsTUFBTSxFQUFHO29CQUM3Q3JCLE1BQU11QixLQUFLO2dCQUNiO1lBQ0Y7UUFDRjtJQUNGO0lBRU9DLFlBQWF0QixLQUFZLEVBQVU7UUFFeEMsb0dBQW9HO1FBQ3BHLElBQUssQ0FBRyxDQUFBLElBQUksQ0FBQ0EsS0FBSyxJQUFJLElBQUksQ0FBQ0EsS0FBSyxDQUFDdUIsTUFBTSxDQUFFdkIsTUFBTSxHQUFNO1lBQ25ELElBQUksQ0FBQ0EsS0FBSyxHQUFHQTtRQUNmO1FBQ0EsT0FBTyxJQUFJLENBQUNBLEtBQUs7SUFDbkI7SUF6RUEsWUFBb0JLLE9BQWdCLENBQUc7UUFDckMsMEVBQTBFO1FBQzFFLEtBQUssQ0FBRWYsUUFBUWtDLElBQUksRUFBRTtRQUVyQixJQUFJLENBQUNuQixPQUFPLEdBQUdBO1FBRWYsSUFBSSxDQUFDVixtQkFBbUI7UUFFeEIsSUFBSSxDQUFDcUIsa0JBQWtCLEdBQUc7UUFFMUIsSUFBSSxDQUFDRixpQkFBaUIsR0FBRztRQUV6QlcsY0FBY0EsV0FBV2pDLE9BQU8sSUFBSWlDLFdBQVdqQyxPQUFPLENBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDa0MsUUFBUSxJQUFJO0lBQ3RGO0FBNkRGO0FBekZBLFNBQXFCaEMseUJBeUZwQjtBQUVERCxRQUFRa0MsUUFBUSxDQUFFLGVBQWVqQyJ9