// Copyright 2023-2024, University of Colorado Boulder
/**
 * A collection of information about an event and the environment when it was fired
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import IOType from '../../../tandem/js/types/IOType.js';
import { EventIO, Input, scenery } from '../imports.js';
let EventContext = class EventContext {
    static createSynthetic() {
        return new EventContext(new window.Event('synthetic'));
    }
    /**
   * DOM (Scenery) nodes set dataset.sceneryAllowInput on their container if they don't want preventDefault to be called,
   * or other effects that block input (e.g. setPointerCapture). We search up the tree to detect this.
   */ allowsDOMInput() {
        var _this_domEvent;
        const target = (_this_domEvent = this.domEvent) == null ? void 0 : _this_domEvent.target;
        if (target instanceof Element) {
            let element = target;
            while(element){
                var _element_dataset;
                // For DOM nodes, we can check for a data attribute
                if (element instanceof HTMLElement && ((_element_dataset = element.dataset) == null ? void 0 : _element_dataset.sceneryAllowInput) === 'true') {
                    return true;
                }
                element = element.parentNode;
            }
        }
        return false;
    }
    constructor(domEvent){
        this.domEvent = domEvent;
        this.activeElement = document.activeElement;
    }
};
export { EventContext as default };
export const EventContextIO = new IOType('EventContextIO', {
    valueType: EventContext,
    documentation: 'A DOM event and its context',
    toStateObject: (eventContext)=>{
        return {
            domEvent: Input.serializeDomEvent(eventContext.domEvent)
        };
    },
    fromStateObject: (stateObject)=>{
        return new EventContext(Input.deserializeDomEvent(stateObject.domEvent));
    },
    // This should remain the same as Input.domEventPropertiesToSerialize (local var). Each key can be null depending on
    // what Event interface is being serialized (which depends on what DOM Event the instance is).
    stateSchema: ()=>({
            domEvent: EventIO
        })
});
scenery.register('EventContext', EventContext);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvRXZlbnRDb250ZXh0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgY29sbGVjdGlvbiBvZiBpbmZvcm1hdGlvbiBhYm91dCBhbiBldmVudCBhbmQgdGhlIGVudmlyb25tZW50IHdoZW4gaXQgd2FzIGZpcmVkXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgeyBFdmVudElPLCBJbnB1dCwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudENvbnRleHQ8b3V0IERPTUV2ZW50IGV4dGVuZHMgRXZlbnQgPSBFdmVudD4ge1xuXG4gIC8vIFJhdyBET00gSW5wdXRFdmVudCAoVG91Y2hFdmVudCwgUG9pbnRlckV2ZW50LCBNb3VzZUV2ZW50LC4uLilcbiAgcHVibGljIHJlYWRvbmx5IGRvbUV2ZW50OiBET01FdmVudDtcblxuICAvLyBUaGUgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCB3aGVuIHRoZSBldmVudCB3YXMgZmlyZWRcbiAgcHVibGljIHJlYWRvbmx5IGFjdGl2ZUVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZG9tRXZlbnQ6IERPTUV2ZW50ICkge1xuICAgIHRoaXMuZG9tRXZlbnQgPSBkb21FdmVudDtcbiAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVTeW50aGV0aWMoKTogRXZlbnRDb250ZXh0IHtcbiAgICByZXR1cm4gbmV3IEV2ZW50Q29udGV4dCggbmV3IHdpbmRvdy5FdmVudCggJ3N5bnRoZXRpYycgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERPTSAoU2NlbmVyeSkgbm9kZXMgc2V0IGRhdGFzZXQuc2NlbmVyeUFsbG93SW5wdXQgb24gdGhlaXIgY29udGFpbmVyIGlmIHRoZXkgZG9uJ3Qgd2FudCBwcmV2ZW50RGVmYXVsdCB0byBiZSBjYWxsZWQsXG4gICAqIG9yIG90aGVyIGVmZmVjdHMgdGhhdCBibG9jayBpbnB1dCAoZS5nLiBzZXRQb2ludGVyQ2FwdHVyZSkuIFdlIHNlYXJjaCB1cCB0aGUgdHJlZSB0byBkZXRlY3QgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBhbGxvd3NET01JbnB1dCgpOiBib29sZWFuIHtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmRvbUV2ZW50Py50YXJnZXQ7XG5cblxuICAgIGlmICggdGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCApIHtcbiAgICAgIGxldCBlbGVtZW50OiBOb2RlIHwgbnVsbCA9IHRhcmdldDtcblxuICAgICAgd2hpbGUgKCBlbGVtZW50ICkge1xuICAgICAgICAvLyBGb3IgRE9NIG5vZGVzLCB3ZSBjYW4gY2hlY2sgZm9yIGEgZGF0YSBhdHRyaWJ1dGVcbiAgICAgICAgaWYgKCBlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgZWxlbWVudC5kYXRhc2V0Py5zY2VuZXJ5QWxsb3dJbnB1dCA9PT0gJ3RydWUnICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEV2ZW50Q29udGV4dElPID0gbmV3IElPVHlwZSggJ0V2ZW50Q29udGV4dElPJywge1xuICB2YWx1ZVR5cGU6IEV2ZW50Q29udGV4dCxcbiAgZG9jdW1lbnRhdGlvbjogJ0EgRE9NIGV2ZW50IGFuZCBpdHMgY29udGV4dCcsXG4gIHRvU3RhdGVPYmplY3Q6IGV2ZW50Q29udGV4dCA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvbUV2ZW50OiBJbnB1dC5zZXJpYWxpemVEb21FdmVudCggZXZlbnRDb250ZXh0LmRvbUV2ZW50IClcblxuICAgICAgLy8gSWdub3JlcyB0aGUgYWN0aXZlRWxlbWVudCwgc2luY2Ugd2UgZG9uJ3QgaGF2ZSBhIGdvb2Qgd2F5IG9mIHNlcmlhbGl6aW5nIHRoYXQgYXQgdGhpcyBwb2ludD9cbiAgICB9O1xuICB9LFxuICBmcm9tU3RhdGVPYmplY3Q6IHN0YXRlT2JqZWN0ID0+IHtcbiAgICByZXR1cm4gbmV3IEV2ZW50Q29udGV4dCggSW5wdXQuZGVzZXJpYWxpemVEb21FdmVudCggc3RhdGVPYmplY3QuZG9tRXZlbnQgKSApO1xuICB9LFxuXG4gIC8vIFRoaXMgc2hvdWxkIHJlbWFpbiB0aGUgc2FtZSBhcyBJbnB1dC5kb21FdmVudFByb3BlcnRpZXNUb1NlcmlhbGl6ZSAobG9jYWwgdmFyKS4gRWFjaCBrZXkgY2FuIGJlIG51bGwgZGVwZW5kaW5nIG9uXG4gIC8vIHdoYXQgRXZlbnQgaW50ZXJmYWNlIGlzIGJlaW5nIHNlcmlhbGl6ZWQgKHdoaWNoIGRlcGVuZHMgb24gd2hhdCBET00gRXZlbnQgdGhlIGluc3RhbmNlIGlzKS5cbiAgc3RhdGVTY2hlbWE6ICgpID0+ICgge1xuICAgIGRvbUV2ZW50OiBFdmVudElPXG5cbiAgICAvLyBJZ25vcmVzIHRoZSBhY3RpdmVFbGVtZW50LCBzaW5jZSB3ZSBkb24ndCBoYXZlIGEgZ29vZCB3YXkgb2Ygc2VyaWFsaXppbmcgdGhhdCBhdCB0aGlzIHBvaW50P1xuICB9IClcbn0gKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ0V2ZW50Q29udGV4dCcsIEV2ZW50Q29udGV4dCApOyJdLCJuYW1lcyI6WyJJT1R5cGUiLCJFdmVudElPIiwiSW5wdXQiLCJzY2VuZXJ5IiwiRXZlbnRDb250ZXh0IiwiY3JlYXRlU3ludGhldGljIiwid2luZG93IiwiRXZlbnQiLCJhbGxvd3NET01JbnB1dCIsInRhcmdldCIsImRvbUV2ZW50IiwiRWxlbWVudCIsImVsZW1lbnQiLCJIVE1MRWxlbWVudCIsImRhdGFzZXQiLCJzY2VuZXJ5QWxsb3dJbnB1dCIsInBhcmVudE5vZGUiLCJhY3RpdmVFbGVtZW50IiwiZG9jdW1lbnQiLCJFdmVudENvbnRleHRJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJ0b1N0YXRlT2JqZWN0IiwiZXZlbnRDb250ZXh0Iiwic2VyaWFsaXplRG9tRXZlbnQiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsImRlc2VyaWFsaXplRG9tRXZlbnQiLCJzdGF0ZVNjaGVtYSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFlBQVkscUNBQXFDO0FBQ3hELFNBQVNDLE9BQU8sRUFBRUMsS0FBSyxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXpDLElBQUEsQUFBTUMsZUFBTixNQUFNQTtJQWFuQixPQUFjQyxrQkFBZ0M7UUFDNUMsT0FBTyxJQUFJRCxhQUFjLElBQUlFLE9BQU9DLEtBQUssQ0FBRTtJQUM3QztJQUVBOzs7R0FHQyxHQUNELEFBQU9DLGlCQUEwQjtZQUNoQjtRQUFmLE1BQU1DLFVBQVMsaUJBQUEsSUFBSSxDQUFDQyxRQUFRLHFCQUFiLGVBQWVELE1BQU07UUFHcEMsSUFBS0Esa0JBQWtCRSxTQUFVO1lBQy9CLElBQUlDLFVBQXVCSDtZQUUzQixNQUFRRyxRQUFVO29CQUV1QkE7Z0JBRHZDLG1EQUFtRDtnQkFDbkQsSUFBS0EsbUJBQW1CQyxlQUFlRCxFQUFBQSxtQkFBQUEsUUFBUUUsT0FBTyxxQkFBZkYsaUJBQWlCRyxpQkFBaUIsTUFBSyxRQUFTO29CQUNyRixPQUFPO2dCQUNUO2dCQUVBSCxVQUFVQSxRQUFRSSxVQUFVO1lBQzlCO1FBQ0Y7UUFFQSxPQUFPO0lBQ1Q7SUEvQkEsWUFBb0JOLFFBQWtCLENBQUc7UUFDdkMsSUFBSSxDQUFDQSxRQUFRLEdBQUdBO1FBQ2hCLElBQUksQ0FBQ08sYUFBYSxHQUFHQyxTQUFTRCxhQUFhO0lBQzdDO0FBNkJGO0FBeENBLFNBQXFCYiwwQkF3Q3BCO0FBRUQsT0FBTyxNQUFNZSxpQkFBaUIsSUFBSW5CLE9BQVEsa0JBQWtCO0lBQzFEb0IsV0FBV2hCO0lBQ1hpQixlQUFlO0lBQ2ZDLGVBQWVDLENBQUFBO1FBQ2IsT0FBTztZQUNMYixVQUFVUixNQUFNc0IsaUJBQWlCLENBQUVELGFBQWFiLFFBQVE7UUFHMUQ7SUFDRjtJQUNBZSxpQkFBaUJDLENBQUFBO1FBQ2YsT0FBTyxJQUFJdEIsYUFBY0YsTUFBTXlCLG1CQUFtQixDQUFFRCxZQUFZaEIsUUFBUTtJQUMxRTtJQUVBLG9IQUFvSDtJQUNwSCw4RkFBOEY7SUFDOUZrQixhQUFhLElBQVEsQ0FBQTtZQUNuQmxCLFVBQVVUO1FBR1osQ0FBQTtBQUNGLEdBQUk7QUFFSkUsUUFBUTBCLFFBQVEsQ0FBRSxnQkFBZ0J6QiJ9