// Copyright 2021-2024, University of Colorado Boulder
/**
 * A listener that can be added to a Display to (typically) dismiss a UI component after we receive a press.
 * Provide a listener to be called when the Pointer is released. It will be called unless this there is
 * listener cancel/interruption.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import dotRandom from '../../dot/js/dotRandom.js';
import optionize from '../../phet-core/js/optionize.js';
import { DisplayedProperty } from '../../scenery/js/imports.js';
import joist from './joist.js';
let DisplayClickToDismissListener = class DisplayClickToDismissListener {
    /**
   * Part of the scenery Input API.
   */ down(event) {
        // When fuzz testing we want to exercise the component that is going to be dismissed so this should keep it up
        // long enough to hopefully receive some fuzzing.
        if (phet.chipper.isFuzzEnabled() && dotRandom.nextDouble() < 0.99) {
            return;
        }
        this.observePointer(event.pointer);
    }
    /**
   * Attach a listener to the Pointer that will watch when it goes up.
   */ observePointer(pointer) {
        if (// Only observe one Pointer (for multitouch) and don't try to add a listener if the Pointer is already attached.
        this.pointer === null && !pointer.isAttached() && // There is no displayedProperty, or it is true meaning the displayedNode is displayed.
        (this.displayedProperty === null || this.displayedProperty.value)) {
            this.pointer = pointer;
            this.pointer.addInputListener(this.pointerListener, true);
        }
    }
    /**
   * Remove the attached listener from the Pointer and clear it (if we are observing currently observing a Pointer).
   */ dismissPointer(pointer) {
        if (this.pointer !== null) {
            assert && assert(this.pointerListener, 'There should be a pointerListener to remove.');
            this.pointer.removeInputListener(this.pointerListener);
            this.pointer = null;
        }
    }
    dispose() {
        this.dismissPointer(this.pointer);
        this.displayedProperty && this.displayedProperty.dispose();
    }
    /**
   * @param listener - The listener to be called when the Pointer goes up, likely to dismiss something.
   * @param [providedOptions]
   */ constructor(listener, providedOptions){
        // If optional displayedNode is provided, this property will be true when the displayedNode is 'displayed'. Controls
        // whether the listener is active and attaches to a Pointer.
        this.displayedProperty = null;
        const options = optionize()({
            displayedNode: null
        }, providedOptions);
        // The active Pointer for this listener, after a down event a subsequent up event on this Pointer will trigger
        // the behavior of `listener`.
        this.pointer = null;
        // A listener added to the Pointer on a down event which will do the work of `listener` when the pointer is
        // released. If this Pointer listener is interrupted we will never call the `listener`.
        this.pointerListener = {
            up: (event)=>{
                listener(event);
                this.dismissPointer(this.pointer);
            },
            interrupt: ()=>{
                this.dismissPointer(this.pointer);
            },
            cancel: ()=>{
                this.dismissPointer(this.pointer);
            }
        };
        if (options.displayedNode) {
            this.displayedProperty = new DisplayedProperty(options.displayedNode);
        }
    }
};
joist.register('DisplayClickToDismissListener', DisplayClickToDismissListener);
export default DisplayClickToDismissListener;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0Rpc3BsYXlDbGlja1RvRGlzbWlzc0xpc3RlbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgbGlzdGVuZXIgdGhhdCBjYW4gYmUgYWRkZWQgdG8gYSBEaXNwbGF5IHRvICh0eXBpY2FsbHkpIGRpc21pc3MgYSBVSSBjb21wb25lbnQgYWZ0ZXIgd2UgcmVjZWl2ZSBhIHByZXNzLlxuICogUHJvdmlkZSBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBQb2ludGVyIGlzIHJlbGVhc2VkLiBJdCB3aWxsIGJlIGNhbGxlZCB1bmxlc3MgdGhpcyB0aGVyZSBpc1xuICogbGlzdGVuZXIgY2FuY2VsL2ludGVycnVwdGlvbi5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IERpc3BsYXllZFByb3BlcnR5LCBOb2RlLCBQb2ludGVyLCBTY2VuZXJ5RXZlbnQsIFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uLCBUSW5wdXRMaXN0ZW5lciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XG5cbmV4cG9ydCB0eXBlIERpc3BsYXlDbGlja1RvRGlzbWlzc0xpc3RlbmVyT3B0aW9ucyA9IHtcblxuICAvLyBBIE5vZGUgdGhhdCBzaG91bGQgYmUgJ2Rpc3BsYXllZCcgKHZpc3VhbGx5IGRpc3BsYXllZCBvbiBhIHNjZW5lcnkgRGlzcGxheSkgZm9yIHRoaXMgbGlzdGVuZXIgdG8gYmUgYWN0aXZlLlxuICAvLyBJZiB0aGlzIGlzIG51bGwsIHRoZSBsaXN0ZW5lciB3aWxsIGFsd2F5cyBiZSBhY3RpdmUuXG4gIGRpc3BsYXllZE5vZGU/OiBOb2RlIHwgbnVsbDtcbn07XG5cbmNsYXNzIERpc3BsYXlDbGlja1RvRGlzbWlzc0xpc3RlbmVyIHtcbiAgcHJpdmF0ZSBwb2ludGVyOiBudWxsIHwgUG9pbnRlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBwb2ludGVyTGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyO1xuXG4gIC8vIElmIG9wdGlvbmFsIGRpc3BsYXllZE5vZGUgaXMgcHJvdmlkZWQsIHRoaXMgcHJvcGVydHkgd2lsbCBiZSB0cnVlIHdoZW4gdGhlIGRpc3BsYXllZE5vZGUgaXMgJ2Rpc3BsYXllZCcuIENvbnRyb2xzXG4gIC8vIHdoZXRoZXIgdGhlIGxpc3RlbmVyIGlzIGFjdGl2ZSBhbmQgYXR0YWNoZXMgdG8gYSBQb2ludGVyLlxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3BsYXllZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbGlzdGVuZXIgLSBUaGUgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIFBvaW50ZXIgZ29lcyB1cCwgbGlrZWx5IHRvIGRpc21pc3Mgc29tZXRoaW5nLlxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGlzdGVuZXI6IFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uLCBwcm92aWRlZE9wdGlvbnM/OiBEaXNwbGF5Q2xpY2tUb0Rpc21pc3NMaXN0ZW5lck9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPERpc3BsYXlDbGlja1RvRGlzbWlzc0xpc3RlbmVyT3B0aW9ucz4oKSgge1xuICAgICAgZGlzcGxheWVkTm9kZTogbnVsbFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gVGhlIGFjdGl2ZSBQb2ludGVyIGZvciB0aGlzIGxpc3RlbmVyLCBhZnRlciBhIGRvd24gZXZlbnQgYSBzdWJzZXF1ZW50IHVwIGV2ZW50IG9uIHRoaXMgUG9pbnRlciB3aWxsIHRyaWdnZXJcbiAgICAvLyB0aGUgYmVoYXZpb3Igb2YgYGxpc3RlbmVyYC5cbiAgICB0aGlzLnBvaW50ZXIgPSBudWxsO1xuXG4gICAgLy8gQSBsaXN0ZW5lciBhZGRlZCB0byB0aGUgUG9pbnRlciBvbiBhIGRvd24gZXZlbnQgd2hpY2ggd2lsbCBkbyB0aGUgd29yayBvZiBgbGlzdGVuZXJgIHdoZW4gdGhlIHBvaW50ZXIgaXNcbiAgICAvLyByZWxlYXNlZC4gSWYgdGhpcyBQb2ludGVyIGxpc3RlbmVyIGlzIGludGVycnVwdGVkIHdlIHdpbGwgbmV2ZXIgY2FsbCB0aGUgYGxpc3RlbmVyYC5cbiAgICB0aGlzLnBvaW50ZXJMaXN0ZW5lciA9IHtcbiAgICAgIHVwOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XG4gICAgICAgIGxpc3RlbmVyKCBldmVudCApO1xuICAgICAgICB0aGlzLmRpc21pc3NQb2ludGVyKCB0aGlzLnBvaW50ZXIgKTtcbiAgICAgIH0sXG5cbiAgICAgIGludGVycnVwdDogKCkgPT4ge1xuICAgICAgICB0aGlzLmRpc21pc3NQb2ludGVyKCB0aGlzLnBvaW50ZXIgKTtcbiAgICAgIH0sXG4gICAgICBjYW5jZWw6ICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXNtaXNzUG9pbnRlciggdGhpcy5wb2ludGVyICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICggb3B0aW9ucy5kaXNwbGF5ZWROb2RlICkge1xuICAgICAgdGhpcy5kaXNwbGF5ZWRQcm9wZXJ0eSA9IG5ldyBEaXNwbGF5ZWRQcm9wZXJ0eSggb3B0aW9ucy5kaXNwbGF5ZWROb2RlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhcnQgb2YgdGhlIHNjZW5lcnkgSW5wdXQgQVBJLlxuICAgKi9cbiAgcHVibGljIGRvd24oIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZCB7XG5cbiAgICAvLyBXaGVuIGZ1enogdGVzdGluZyB3ZSB3YW50IHRvIGV4ZXJjaXNlIHRoZSBjb21wb25lbnQgdGhhdCBpcyBnb2luZyB0byBiZSBkaXNtaXNzZWQgc28gdGhpcyBzaG91bGQga2VlcCBpdCB1cFxuICAgIC8vIGxvbmcgZW5vdWdoIHRvIGhvcGVmdWxseSByZWNlaXZlIHNvbWUgZnV6emluZy5cbiAgICBpZiAoIHBoZXQuY2hpcHBlci5pc0Z1enpFbmFibGVkKCkgJiYgZG90UmFuZG9tLm5leHREb3VibGUoKSA8IDAuOTkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5vYnNlcnZlUG9pbnRlciggZXZlbnQucG9pbnRlciApO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIGxpc3RlbmVyIHRvIHRoZSBQb2ludGVyIHRoYXQgd2lsbCB3YXRjaCB3aGVuIGl0IGdvZXMgdXAuXG4gICAqL1xuICBwcml2YXRlIG9ic2VydmVQb2ludGVyKCBwb2ludGVyOiBQb2ludGVyICk6IHZvaWQge1xuXG4gICAgaWYgKFxuXG4gICAgICAvLyBPbmx5IG9ic2VydmUgb25lIFBvaW50ZXIgKGZvciBtdWx0aXRvdWNoKSBhbmQgZG9uJ3QgdHJ5IHRvIGFkZCBhIGxpc3RlbmVyIGlmIHRoZSBQb2ludGVyIGlzIGFscmVhZHkgYXR0YWNoZWQuXG4gICAgICB0aGlzLnBvaW50ZXIgPT09IG51bGwgJiYgIXBvaW50ZXIuaXNBdHRhY2hlZCgpICYmXG5cbiAgICAgIC8vIFRoZXJlIGlzIG5vIGRpc3BsYXllZFByb3BlcnR5LCBvciBpdCBpcyB0cnVlIG1lYW5pbmcgdGhlIGRpc3BsYXllZE5vZGUgaXMgZGlzcGxheWVkLlxuICAgICAgKCB0aGlzLmRpc3BsYXllZFByb3BlcnR5ID09PSBudWxsIHx8IHRoaXMuZGlzcGxheWVkUHJvcGVydHkudmFsdWUgKVxuICAgICkge1xuICAgICAgdGhpcy5wb2ludGVyID0gcG9pbnRlcjtcbiAgICAgIHRoaXMucG9pbnRlci5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLnBvaW50ZXJMaXN0ZW5lciwgdHJ1ZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGF0dGFjaGVkIGxpc3RlbmVyIGZyb20gdGhlIFBvaW50ZXIgYW5kIGNsZWFyIGl0IChpZiB3ZSBhcmUgb2JzZXJ2aW5nIGN1cnJlbnRseSBvYnNlcnZpbmcgYSBQb2ludGVyKS5cbiAgICovXG4gIHByaXZhdGUgZGlzbWlzc1BvaW50ZXIoIHBvaW50ZXI6IFBvaW50ZXIgfCBudWxsICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5wb2ludGVyICE9PSBudWxsICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wb2ludGVyTGlzdGVuZXIsICdUaGVyZSBzaG91bGQgYmUgYSBwb2ludGVyTGlzdGVuZXIgdG8gcmVtb3ZlLicgKTtcbiAgICAgIHRoaXMucG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLnBvaW50ZXJMaXN0ZW5lciApO1xuICAgICAgdGhpcy5wb2ludGVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc21pc3NQb2ludGVyKCB0aGlzLnBvaW50ZXIgKTtcbiAgICB0aGlzLmRpc3BsYXllZFByb3BlcnR5ICYmIHRoaXMuZGlzcGxheWVkUHJvcGVydHkuZGlzcG9zZSgpO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnRGlzcGxheUNsaWNrVG9EaXNtaXNzTGlzdGVuZXInLCBEaXNwbGF5Q2xpY2tUb0Rpc21pc3NMaXN0ZW5lciApO1xuZXhwb3J0IGRlZmF1bHQgRGlzcGxheUNsaWNrVG9EaXNtaXNzTGlzdGVuZXI7Il0sIm5hbWVzIjpbImRvdFJhbmRvbSIsIm9wdGlvbml6ZSIsIkRpc3BsYXllZFByb3BlcnR5Iiwiam9pc3QiLCJEaXNwbGF5Q2xpY2tUb0Rpc21pc3NMaXN0ZW5lciIsImRvd24iLCJldmVudCIsInBoZXQiLCJjaGlwcGVyIiwiaXNGdXp6RW5hYmxlZCIsIm5leHREb3VibGUiLCJvYnNlcnZlUG9pbnRlciIsInBvaW50ZXIiLCJpc0F0dGFjaGVkIiwiZGlzcGxheWVkUHJvcGVydHkiLCJ2YWx1ZSIsImFkZElucHV0TGlzdGVuZXIiLCJwb2ludGVyTGlzdGVuZXIiLCJkaXNtaXNzUG9pbnRlciIsImFzc2VydCIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJkaXNwb3NlIiwibGlzdGVuZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZGlzcGxheWVkTm9kZSIsInVwIiwiaW50ZXJydXB0IiwiY2FuY2VsIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FHRCxPQUFPQSxlQUFlLDRCQUE0QjtBQUNsRCxPQUFPQyxlQUFlLGtDQUFrQztBQUN4RCxTQUFTQyxpQkFBaUIsUUFBOEUsOEJBQThCO0FBQ3RJLE9BQU9DLFdBQVcsYUFBYTtBQVMvQixJQUFBLEFBQU1DLGdDQUFOLE1BQU1BO0lBMkNKOztHQUVDLEdBQ0QsQUFBT0MsS0FBTUMsS0FBbUIsRUFBUztRQUV2Qyw4R0FBOEc7UUFDOUcsaURBQWlEO1FBQ2pELElBQUtDLEtBQUtDLE9BQU8sQ0FBQ0MsYUFBYSxNQUFNVCxVQUFVVSxVQUFVLEtBQUssTUFBTztZQUNuRTtRQUNGO1FBRUEsSUFBSSxDQUFDQyxjQUFjLENBQUVMLE1BQU1NLE9BQU87SUFDcEM7SUFFQTs7R0FFQyxHQUNELEFBQVFELGVBQWdCQyxPQUFnQixFQUFTO1FBRS9DLElBRUUsZ0hBQWdIO1FBQ2hILElBQUksQ0FBQ0EsT0FBTyxLQUFLLFFBQVEsQ0FBQ0EsUUFBUUMsVUFBVSxNQUU1Qyx1RkFBdUY7UUFDckYsQ0FBQSxJQUFJLENBQUNDLGlCQUFpQixLQUFLLFFBQVEsSUFBSSxDQUFDQSxpQkFBaUIsQ0FBQ0MsS0FBSyxBQUFELEdBQ2hFO1lBQ0EsSUFBSSxDQUFDSCxPQUFPLEdBQUdBO1lBQ2YsSUFBSSxDQUFDQSxPQUFPLENBQUNJLGdCQUFnQixDQUFFLElBQUksQ0FBQ0MsZUFBZSxFQUFFO1FBQ3ZEO0lBQ0Y7SUFFQTs7R0FFQyxHQUNELEFBQVFDLGVBQWdCTixPQUF1QixFQUFTO1FBQ3RELElBQUssSUFBSSxDQUFDQSxPQUFPLEtBQUssTUFBTztZQUMzQk8sVUFBVUEsT0FBUSxJQUFJLENBQUNGLGVBQWUsRUFBRTtZQUN4QyxJQUFJLENBQUNMLE9BQU8sQ0FBQ1EsbUJBQW1CLENBQUUsSUFBSSxDQUFDSCxlQUFlO1lBQ3RELElBQUksQ0FBQ0wsT0FBTyxHQUFHO1FBQ2pCO0lBQ0Y7SUFFT1MsVUFBZ0I7UUFDckIsSUFBSSxDQUFDSCxjQUFjLENBQUUsSUFBSSxDQUFDTixPQUFPO1FBQ2pDLElBQUksQ0FBQ0UsaUJBQWlCLElBQUksSUFBSSxDQUFDQSxpQkFBaUIsQ0FBQ08sT0FBTztJQUMxRDtJQWpGQTs7O0dBR0MsR0FDRCxZQUFvQkMsUUFBaUMsRUFBRUMsZUFBc0QsQ0FBRztRQVJoSCxvSEFBb0g7UUFDcEgsNERBQTREO2FBQzNDVCxvQkFBdUQ7UUFRdEUsTUFBTVUsVUFBVXZCLFlBQW1EO1lBQ2pFd0IsZUFBZTtRQUNqQixHQUFHRjtRQUVILDhHQUE4RztRQUM5Ryw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDWCxPQUFPLEdBQUc7UUFFZiwyR0FBMkc7UUFDM0csdUZBQXVGO1FBQ3ZGLElBQUksQ0FBQ0ssZUFBZSxHQUFHO1lBQ3JCUyxJQUFJLENBQUVwQjtnQkFDSmdCLFNBQVVoQjtnQkFDVixJQUFJLENBQUNZLGNBQWMsQ0FBRSxJQUFJLENBQUNOLE9BQU87WUFDbkM7WUFFQWUsV0FBVztnQkFDVCxJQUFJLENBQUNULGNBQWMsQ0FBRSxJQUFJLENBQUNOLE9BQU87WUFDbkM7WUFDQWdCLFFBQVE7Z0JBQ04sSUFBSSxDQUFDVixjQUFjLENBQUUsSUFBSSxDQUFDTixPQUFPO1lBQ25DO1FBQ0Y7UUFFQSxJQUFLWSxRQUFRQyxhQUFhLEVBQUc7WUFDM0IsSUFBSSxDQUFDWCxpQkFBaUIsR0FBRyxJQUFJWixrQkFBbUJzQixRQUFRQyxhQUFhO1FBQ3ZFO0lBQ0Y7QUFpREY7QUFFQXRCLE1BQU0wQixRQUFRLENBQUUsaUNBQWlDekI7QUFDakQsZUFBZUEsOEJBQThCIn0=