// Copyright 2016-2023, University of Colorado Boulder
/**
 * A Scenery input listener that is able to find the closest in a list of items to a "down" event and trigger an action
 * (usually a drag) on that item. Usually this will be a drag listener start/press (e.g. SimpleDragHandler/DragListener),
 * but could accommodate other uses. It's similar in use to DragListener.createForwardingListener.
 *
 * Handles items of the form:
 * {
 *   startDrag: function( event ),
 *   computeDistance: function( globalPoint ) : number
 * }
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */ import { Mouse } from '../../scenery/js/imports.js';
import sun from './sun.js';
let ClosestDragForwardingListener = class ClosestDragForwardingListener {
    /**
   * Adds an item that can be dragged.
   */ addDraggableItem(item) {
        this.items.push(item);
    }
    /**
   * Removes a previously-added item.
   */ removeDraggableItem(item) {
        const index = _.indexOf(this.items, item);
        assert && assert(index >= 0);
        this.items.splice(index, 1);
    }
    /**
   * Called on pointer down.
   */ down(event) {
        // If there was nothing else in the way
        if (event.target === event.currentTarget) {
            let threshold = 0;
            if (event.pointer.isTouchLike()) {
                threshold = this.touchThreshold;
            }
            if (event.pointer instanceof Mouse) {
                threshold = this.mouseThreshold;
            }
            if (threshold) {
                // search for the closest item
                let currentItem = null;
                let currentDistance = Number.POSITIVE_INFINITY;
                const globalPoint = event.pointer.point;
                const numItems = this.items.length;
                for(let i = 0; i < numItems; i++){
                    const item = this.items[i];
                    const distance = item.computeDistance(globalPoint);
                    if (distance < currentDistance) {
                        currentDistance = distance;
                        currentItem = item;
                    }
                }
                // if we have a closest item under the threshold, attempt to start a drag on it
                if (currentItem && currentDistance < threshold) {
                    currentItem.startDrag(event);
                }
            }
        }
    }
    constructor(touchThreshold, mouseThreshold){
        this.touchThreshold = touchThreshold;
        this.mouseThreshold = mouseThreshold;
        this.items = [];
    }
};
export { ClosestDragForwardingListener as default };
sun.register('ClosestDragForwardingListener', ClosestDragForwardingListener);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9DbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIFNjZW5lcnkgaW5wdXQgbGlzdGVuZXIgdGhhdCBpcyBhYmxlIHRvIGZpbmQgdGhlIGNsb3Nlc3QgaW4gYSBsaXN0IG9mIGl0ZW1zIHRvIGEgXCJkb3duXCIgZXZlbnQgYW5kIHRyaWdnZXIgYW4gYWN0aW9uXG4gKiAodXN1YWxseSBhIGRyYWcpIG9uIHRoYXQgaXRlbS4gVXN1YWxseSB0aGlzIHdpbGwgYmUgYSBkcmFnIGxpc3RlbmVyIHN0YXJ0L3ByZXNzIChlLmcuIFNpbXBsZURyYWdIYW5kbGVyL0RyYWdMaXN0ZW5lciksXG4gKiBidXQgY291bGQgYWNjb21tb2RhdGUgb3RoZXIgdXNlcy4gSXQncyBzaW1pbGFyIGluIHVzZSB0byBEcmFnTGlzdGVuZXIuY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyLlxuICpcbiAqIEhhbmRsZXMgaXRlbXMgb2YgdGhlIGZvcm06XG4gKiB7XG4gKiAgIHN0YXJ0RHJhZzogZnVuY3Rpb24oIGV2ZW50ICksXG4gKiAgIGNvbXB1dGVEaXN0YW5jZTogZnVuY3Rpb24oIGdsb2JhbFBvaW50ICkgOiBudW1iZXJcbiAqIH1cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IE1vdXNlLCBQcmVzc0xpc3RlbmVyRXZlbnQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XG5cbnR5cGUgRHJhZ2dhYmxlSXRlbSA9IHtcbiAgc3RhcnREcmFnOiAoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKSA9PiB2b2lkO1xuICBjb21wdXRlRGlzdGFuY2U6ICggZ2xvYmFsUG9pbnQ6IFZlY3RvcjIgKSA9PiBudW1iZXI7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciB7XG5cbiAgLy8gVGhlIG1heGltdW0gZGlzdGFuY2UgZnJvbSBhbiBpdGVtIHRoYXQgd2lsbCBjYXVzZSBhIHRvdWNoLWxpa2UgKGluY2x1ZGVzIHBlbikgdG8gc3RhcnQgYSBkcmFnXG4gIHByaXZhdGUgcmVhZG9ubHkgdG91Y2hUaHJlc2hvbGQ6IG51bWJlcjtcblxuICAvLyBUaGUgbWF4aW11bSBkaXN0YW5jZSBmcm9tIGFuIGl0ZW0gdGhhdCB3aWxsIGNhdXNlIGEgbW91c2UgZG93biBldmVudCB0byBzdGFydCBhIGRyYWdcbiAgcHJpdmF0ZSByZWFkb25seSBtb3VzZVRocmVzaG9sZDogbnVtYmVyO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgaXRlbXM6IERyYWdnYWJsZUl0ZW1bXTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRvdWNoVGhyZXNob2xkOiBudW1iZXIsIG1vdXNlVGhyZXNob2xkOiBudW1iZXIgKSB7XG4gICAgdGhpcy50b3VjaFRocmVzaG9sZCA9IHRvdWNoVGhyZXNob2xkO1xuICAgIHRoaXMubW91c2VUaHJlc2hvbGQgPSBtb3VzZVRocmVzaG9sZDtcbiAgICB0aGlzLml0ZW1zID0gW107XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBpdGVtIHRoYXQgY2FuIGJlIGRyYWdnZWQuXG4gICAqL1xuICBwdWJsaWMgYWRkRHJhZ2dhYmxlSXRlbSggaXRlbTogRHJhZ2dhYmxlSXRlbSApOiB2b2lkIHtcbiAgICB0aGlzLml0ZW1zLnB1c2goIGl0ZW0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgcHJldmlvdXNseS1hZGRlZCBpdGVtLlxuICAgKi9cbiAgcHVibGljIHJlbW92ZURyYWdnYWJsZUl0ZW0oIGl0ZW06IERyYWdnYWJsZUl0ZW0gKTogdm9pZCB7XG4gICAgY29uc3QgaW5kZXggPSBfLmluZGV4T2YoIHRoaXMuaXRlbXMsIGl0ZW0gKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICk7XG4gICAgdGhpcy5pdGVtcy5zcGxpY2UoIGluZGV4LCAxICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIHBvaW50ZXIgZG93bi5cbiAgICovXG4gIHB1YmxpYyBkb3duKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xuXG4gICAgLy8gSWYgdGhlcmUgd2FzIG5vdGhpbmcgZWxzZSBpbiB0aGUgd2F5XG4gICAgaWYgKCBldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQgKSB7XG4gICAgICBsZXQgdGhyZXNob2xkID0gMDtcbiAgICAgIGlmICggZXZlbnQucG9pbnRlci5pc1RvdWNoTGlrZSgpICkge1xuICAgICAgICB0aHJlc2hvbGQgPSB0aGlzLnRvdWNoVGhyZXNob2xkO1xuICAgICAgfVxuICAgICAgaWYgKCBldmVudC5wb2ludGVyIGluc3RhbmNlb2YgTW91c2UgKSB7XG4gICAgICAgIHRocmVzaG9sZCA9IHRoaXMubW91c2VUaHJlc2hvbGQ7XG4gICAgICB9XG4gICAgICBpZiAoIHRocmVzaG9sZCApIHtcblxuICAgICAgICAvLyBzZWFyY2ggZm9yIHRoZSBjbG9zZXN0IGl0ZW1cbiAgICAgICAgbGV0IGN1cnJlbnRJdGVtID0gbnVsbDtcbiAgICAgICAgbGV0IGN1cnJlbnREaXN0YW5jZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgICAgY29uc3QgZ2xvYmFsUG9pbnQgPSBldmVudC5wb2ludGVyLnBvaW50O1xuICAgICAgICBjb25zdCBudW1JdGVtcyA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1JdGVtczsgaSsrICkge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1zWyBpIF07XG5cbiAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IGl0ZW0uY29tcHV0ZURpc3RhbmNlKCBnbG9iYWxQb2ludCApO1xuICAgICAgICAgIGlmICggZGlzdGFuY2UgPCBjdXJyZW50RGlzdGFuY2UgKSB7XG4gICAgICAgICAgICBjdXJyZW50RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgIGN1cnJlbnRJdGVtID0gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgY2xvc2VzdCBpdGVtIHVuZGVyIHRoZSB0aHJlc2hvbGQsIGF0dGVtcHQgdG8gc3RhcnQgYSBkcmFnIG9uIGl0XG4gICAgICAgIGlmICggY3VycmVudEl0ZW0gJiYgY3VycmVudERpc3RhbmNlIDwgdGhyZXNob2xkICkge1xuICAgICAgICAgIGN1cnJlbnRJdGVtLnN0YXJ0RHJhZyggZXZlbnQgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdDbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lcicsIENsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyICk7Il0sIm5hbWVzIjpbIk1vdXNlIiwic3VuIiwiQ2xvc2VzdERyYWdGb3J3YXJkaW5nTGlzdGVuZXIiLCJhZGREcmFnZ2FibGVJdGVtIiwiaXRlbSIsIml0ZW1zIiwicHVzaCIsInJlbW92ZURyYWdnYWJsZUl0ZW0iLCJpbmRleCIsIl8iLCJpbmRleE9mIiwiYXNzZXJ0Iiwic3BsaWNlIiwiZG93biIsImV2ZW50IiwidGFyZ2V0IiwiY3VycmVudFRhcmdldCIsInRocmVzaG9sZCIsInBvaW50ZXIiLCJpc1RvdWNoTGlrZSIsInRvdWNoVGhyZXNob2xkIiwibW91c2VUaHJlc2hvbGQiLCJjdXJyZW50SXRlbSIsImN1cnJlbnREaXN0YW5jZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiZ2xvYmFsUG9pbnQiLCJwb2ludCIsIm51bUl0ZW1zIiwibGVuZ3RoIiwiaSIsImRpc3RhbmNlIiwiY29tcHV0ZURpc3RhbmNlIiwic3RhcnREcmFnIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7O0NBWUMsR0FHRCxTQUFTQSxLQUFLLFFBQTRCLDhCQUE4QjtBQUN4RSxPQUFPQyxTQUFTLFdBQVc7QUFPWixJQUFBLEFBQU1DLGdDQUFOLE1BQU1BO0lBZ0JuQjs7R0FFQyxHQUNELEFBQU9DLGlCQUFrQkMsSUFBbUIsRUFBUztRQUNuRCxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsSUFBSSxDQUFFRjtJQUNuQjtJQUVBOztHQUVDLEdBQ0QsQUFBT0csb0JBQXFCSCxJQUFtQixFQUFTO1FBQ3RELE1BQU1JLFFBQVFDLEVBQUVDLE9BQU8sQ0FBRSxJQUFJLENBQUNMLEtBQUssRUFBRUQ7UUFDckNPLFVBQVVBLE9BQVFILFNBQVM7UUFDM0IsSUFBSSxDQUFDSCxLQUFLLENBQUNPLE1BQU0sQ0FBRUosT0FBTztJQUM1QjtJQUVBOztHQUVDLEdBQ0QsQUFBT0ssS0FBTUMsS0FBeUIsRUFBUztRQUU3Qyx1Q0FBdUM7UUFDdkMsSUFBS0EsTUFBTUMsTUFBTSxLQUFLRCxNQUFNRSxhQUFhLEVBQUc7WUFDMUMsSUFBSUMsWUFBWTtZQUNoQixJQUFLSCxNQUFNSSxPQUFPLENBQUNDLFdBQVcsSUFBSztnQkFDakNGLFlBQVksSUFBSSxDQUFDRyxjQUFjO1lBQ2pDO1lBQ0EsSUFBS04sTUFBTUksT0FBTyxZQUFZbEIsT0FBUTtnQkFDcENpQixZQUFZLElBQUksQ0FBQ0ksY0FBYztZQUNqQztZQUNBLElBQUtKLFdBQVk7Z0JBRWYsOEJBQThCO2dCQUM5QixJQUFJSyxjQUFjO2dCQUNsQixJQUFJQyxrQkFBa0JDLE9BQU9DLGlCQUFpQjtnQkFDOUMsTUFBTUMsY0FBY1osTUFBTUksT0FBTyxDQUFDUyxLQUFLO2dCQUN2QyxNQUFNQyxXQUFXLElBQUksQ0FBQ3ZCLEtBQUssQ0FBQ3dCLE1BQU07Z0JBQ2xDLElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJRixVQUFVRSxJQUFNO29CQUNuQyxNQUFNMUIsT0FBTyxJQUFJLENBQUNDLEtBQUssQ0FBRXlCLEVBQUc7b0JBRTVCLE1BQU1DLFdBQVczQixLQUFLNEIsZUFBZSxDQUFFTjtvQkFDdkMsSUFBS0ssV0FBV1IsaUJBQWtCO3dCQUNoQ0Esa0JBQWtCUTt3QkFDbEJULGNBQWNsQjtvQkFDaEI7Z0JBQ0Y7Z0JBRUEsK0VBQStFO2dCQUMvRSxJQUFLa0IsZUFBZUMsa0JBQWtCTixXQUFZO29CQUNoREssWUFBWVcsU0FBUyxDQUFFbkI7Z0JBQ3pCO1lBQ0Y7UUFDRjtJQUNGO0lBM0RBLFlBQW9CTSxjQUFzQixFQUFFQyxjQUFzQixDQUFHO1FBQ25FLElBQUksQ0FBQ0QsY0FBYyxHQUFHQTtRQUN0QixJQUFJLENBQUNDLGNBQWMsR0FBR0E7UUFDdEIsSUFBSSxDQUFDaEIsS0FBSyxHQUFHLEVBQUU7SUFDakI7QUF3REY7QUF0RUEsU0FBcUJILDJDQXNFcEI7QUFFREQsSUFBSWlDLFFBQVEsQ0FBRSxpQ0FBaUNoQyJ9