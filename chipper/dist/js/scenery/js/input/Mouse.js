// Copyright 2013-2024, University of Colorado Boulder
/**
 * Tracks the mouse state
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Vector3 from '../../../dot/js/Vector3.js';
import { Pointer, scenery } from '../imports.js';
let Mouse = class Mouse extends Pointer {
    /**
   * Sets information in this Mouse for a given mouse down. (scenery-internal)
   *
   * @returns - Whether the point changed
   */ down(event) {
        assert && assert(event instanceof MouseEvent); // eslint-disable-line phet/no-simple-type-checking-assertions
        const mouseEvent = event;
        switch(mouseEvent.button){
            case 0:
                this.leftDown = true;
                break;
            case 1:
                this.middleDown = true;
                break;
            case 2:
                this.rightDown = true;
                break;
            default:
        }
        return super.down(event);
    }
    /**
   * Sets information in this Mouse for a given mouse up. (scenery-internal)
   *
   * @returns - Whether the point changed
   */ up(point, event) {
        assert && assert(event instanceof MouseEvent); // eslint-disable-line phet/no-simple-type-checking-assertions
        const mouseEvent = event;
        switch(mouseEvent.button){
            case 0:
                this.leftDown = false;
                break;
            case 1:
                this.middleDown = false;
                break;
            case 2:
                this.rightDown = false;
                break;
            default:
        }
        return super.up(point, event);
    }
    /**
   * Sets information in this Mouse for a given mouse move. (scenery-internal)
   *
   * @returns - Whether the point changed
   */ move(point) {
        const pointChanged = this.hasPointChanged(point);
        point && sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`mouse move at ${point.toString()}`);
        this.point = point;
        return pointChanged;
    }
    /**
   * Sets information in this Mouse for a given mouse over. (scenery-internal)
   *
   * @returns - Whether the point changed
   */ over(point) {
        const pointChanged = this.hasPointChanged(point);
        point && sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`mouse over at ${point.toString()}`);
        this.point = point;
        return pointChanged;
    }
    /**
   * Sets information in this Mouse for a given mouse out. (scenery-internal)
   *
   * @returns - Whether the point changed
   */ out(point) {
        const pointChanged = this.hasPointChanged(point);
        point && sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`mouse out at ${point.toString()}`);
        return pointChanged;
    }
    /**
   * Sets information in this Mouse for a given mouse wheel. (scenery-internal)
   */ wheel(event) {
        assert && assert(event instanceof WheelEvent); // eslint-disable-line phet/no-simple-type-checking-assertions
        const wheelEvent = event;
        this.wheelDelta.setXYZ(wheelEvent.deltaX, wheelEvent.deltaY, wheelEvent.deltaZ);
        this.wheelDeltaMode = wheelEvent.deltaMode;
    }
    /**
   * Returns an improved string representation of this object.
   */ toString() {
        return 'Mouse'; // there is only one
    }
    constructor(point){
        super(point, 'mouse');
        this.id = null;
        this.leftDown = false;
        this.middleDown = false;
        this.rightDown = false;
        this.wheelDelta = new Vector3(0, 0, 0);
        this.wheelDeltaMode = 0;
        sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`Created ${this.toString()}`);
    }
};
export { Mouse as default };
scenery.register('Mouse', Mouse);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvTW91c2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVHJhY2tzIHRoZSBtb3VzZSBzdGF0ZVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XG5pbXBvcnQgeyBQb2ludGVyLCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdXNlIGV4dGVuZHMgUG9pbnRlciB7XG5cbiAgLy8gU2luY2Ugd2UgbmVlZCB0byB0cmFjayB0aGUgbW91c2UncyBwb2ludGVyIGlkIG9jY2FzaW9uYWxseVxuICBwdWJsaWMgaWQ6IG51bWJlciB8IG51bGw7XG5cbiAgLy8gQGRlcHJlY2F0ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODAzXG4gIHB1YmxpYyBsZWZ0RG93bjogYm9vbGVhbjsgLy8gQGRlcHJlY2F0ZWRcbiAgcHVibGljIG1pZGRsZURvd246IGJvb2xlYW47IC8vIEBkZXByZWNhdGVkXG4gIHB1YmxpYyByaWdodERvd246IGJvb2xlYW47IC8vIEBkZXByZWNhdGVkXG5cbiAgLy8gTW91c2Ugd2hlZWwgZGVsdGEgZm9yIHRoZSBsYXN0IGV2ZW50LCBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG4gIHB1YmxpYyB3aGVlbERlbHRhOiBWZWN0b3IzO1xuXG4gIC8vIE1vdXNlIHdoZWVsIG1vZGUgZm9yIHRoZSBsYXN0IGV2ZW50ICgwOiBwaXhlbHMsIDE6IGxpbmVzLCAyOiBwYWdlcyksIHNlZVxuICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvd2hlZWxcbiAgcHVibGljIHdoZWVsRGVsdGFNb2RlOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwb2ludDogVmVjdG9yMiApIHtcbiAgICBzdXBlciggcG9pbnQsICdtb3VzZScgKTtcblxuICAgIHRoaXMuaWQgPSBudWxsO1xuICAgIHRoaXMubGVmdERvd24gPSBmYWxzZTtcbiAgICB0aGlzLm1pZGRsZURvd24gPSBmYWxzZTtcbiAgICB0aGlzLnJpZ2h0RG93biA9IGZhbHNlO1xuICAgIHRoaXMud2hlZWxEZWx0YSA9IG5ldyBWZWN0b3IzKCAwLCAwLCAwICk7XG4gICAgdGhpcy53aGVlbERlbHRhTW9kZSA9IDA7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUG9pbnRlciAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIoIGBDcmVhdGVkICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGluZm9ybWF0aW9uIGluIHRoaXMgTW91c2UgZm9yIGEgZ2l2ZW4gbW91c2UgZG93bi4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGUgcG9pbnQgY2hhbmdlZFxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRvd24oIGV2ZW50OiBFdmVudCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L25vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcbiAgICBjb25zdCBtb3VzZUV2ZW50ID0gZXZlbnQgYXMgTW91c2VFdmVudDtcblxuICAgIHN3aXRjaCggbW91c2VFdmVudC5idXR0b24gKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHRoaXMubGVmdERvd24gPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgdGhpcy5taWRkbGVEb3duID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHRoaXMucmlnaHREb3duID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgLy8gbm8tb3AgdW50aWwgd2UgcmVmYWN0b3IgdGhpbmdzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgxM1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuZG93biggZXZlbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGluZm9ybWF0aW9uIGluIHRoaXMgTW91c2UgZm9yIGEgZ2l2ZW4gbW91c2UgdXAuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgdGhlIHBvaW50IGNoYW5nZWRcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSB1cCggcG9pbnQ6IFZlY3RvcjIsIGV2ZW50OiBFdmVudCApOiBib29sZWFuIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L25vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcbiAgICBjb25zdCBtb3VzZUV2ZW50ID0gZXZlbnQgYXMgTW91c2VFdmVudDtcblxuICAgIHN3aXRjaCggbW91c2VFdmVudC5idXR0b24gKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHRoaXMubWlkZGxlRG93biA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgdGhpcy5yaWdodERvd24gPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgLy8gbm8tb3AgdW50aWwgd2UgcmVmYWN0b3IgdGhpbmdzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgxM1xuICAgIH1cblxuICAgIHJldHVybiBzdXBlci51cCggcG9pbnQsIGV2ZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBpbmZvcm1hdGlvbiBpbiB0aGlzIE1vdXNlIGZvciBhIGdpdmVuIG1vdXNlIG1vdmUuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgdGhlIHBvaW50IGNoYW5nZWRcbiAgICovXG4gIHB1YmxpYyBtb3ZlKCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcbiAgICBjb25zdCBwb2ludENoYW5nZWQgPSB0aGlzLmhhc1BvaW50Q2hhbmdlZCggcG9pbnQgKTtcbiAgICBwb2ludCAmJiBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoIGBtb3VzZSBtb3ZlIGF0ICR7cG9pbnQudG9TdHJpbmcoKX1gICk7XG5cbiAgICB0aGlzLnBvaW50ID0gcG9pbnQ7XG5cbiAgICByZXR1cm4gcG9pbnRDaGFuZ2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgaW5mb3JtYXRpb24gaW4gdGhpcyBNb3VzZSBmb3IgYSBnaXZlbiBtb3VzZSBvdmVyLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIHRoZSBwb2ludCBjaGFuZ2VkXG4gICAqL1xuICBwdWJsaWMgb3ZlciggcG9pbnQ6IFZlY3RvcjIgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcG9pbnRDaGFuZ2VkID0gdGhpcy5oYXNQb2ludENoYW5nZWQoIHBvaW50ICk7XG4gICAgcG9pbnQgJiYgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50KCBgbW91c2Ugb3ZlciBhdCAke3BvaW50LnRvU3RyaW5nKCl9YCApO1xuXG4gICAgdGhpcy5wb2ludCA9IHBvaW50O1xuXG4gICAgcmV0dXJuIHBvaW50Q2hhbmdlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGluZm9ybWF0aW9uIGluIHRoaXMgTW91c2UgZm9yIGEgZ2l2ZW4gbW91c2Ugb3V0LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIHRoZSBwb2ludCBjaGFuZ2VkXG4gICAqL1xuICBwdWJsaWMgb3V0KCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcbiAgICBjb25zdCBwb2ludENoYW5nZWQgPSB0aGlzLmhhc1BvaW50Q2hhbmdlZCggcG9pbnQgKTtcbiAgICBwb2ludCAmJiBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoIGBtb3VzZSBvdXQgYXQgJHtwb2ludC50b1N0cmluZygpfWAgKTtcblxuICAgIHJldHVybiBwb2ludENoYW5nZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBpbmZvcm1hdGlvbiBpbiB0aGlzIE1vdXNlIGZvciBhIGdpdmVuIG1vdXNlIHdoZWVsLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyB3aGVlbCggZXZlbnQ6IEV2ZW50ICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50IGluc3RhbmNlb2YgV2hlZWxFdmVudCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xuICAgIGNvbnN0IHdoZWVsRXZlbnQgPSBldmVudCBhcyBXaGVlbEV2ZW50O1xuXG4gICAgdGhpcy53aGVlbERlbHRhLnNldFhZWiggd2hlZWxFdmVudC5kZWx0YVgsIHdoZWVsRXZlbnQuZGVsdGFZLCB3aGVlbEV2ZW50LmRlbHRhWiApO1xuICAgIHRoaXMud2hlZWxEZWx0YU1vZGUgPSB3aGVlbEV2ZW50LmRlbHRhTW9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGltcHJvdmVkIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIG9iamVjdC5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiAnTW91c2UnOyAvLyB0aGVyZSBpcyBvbmx5IG9uZVxuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdNb3VzZScsIE1vdXNlICk7Il0sIm5hbWVzIjpbIlZlY3RvcjMiLCJQb2ludGVyIiwic2NlbmVyeSIsIk1vdXNlIiwiZG93biIsImV2ZW50IiwiYXNzZXJ0IiwiTW91c2VFdmVudCIsIm1vdXNlRXZlbnQiLCJidXR0b24iLCJsZWZ0RG93biIsIm1pZGRsZURvd24iLCJyaWdodERvd24iLCJ1cCIsInBvaW50IiwibW92ZSIsInBvaW50Q2hhbmdlZCIsImhhc1BvaW50Q2hhbmdlZCIsInNjZW5lcnlMb2ciLCJJbnB1dEV2ZW50IiwidG9TdHJpbmciLCJvdmVyIiwib3V0Iiwid2hlZWwiLCJXaGVlbEV2ZW50Iiwid2hlZWxFdmVudCIsIndoZWVsRGVsdGEiLCJzZXRYWVoiLCJkZWx0YVgiLCJkZWx0YVkiLCJkZWx0YVoiLCJ3aGVlbERlbHRhTW9kZSIsImRlbHRhTW9kZSIsImlkIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBR0QsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsU0FBU0MsT0FBTyxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRWxDLElBQUEsQUFBTUMsUUFBTixNQUFNQSxjQUFjRjtJQThCakM7Ozs7R0FJQyxHQUNELEFBQWdCRyxLQUFNQyxLQUFZLEVBQVM7UUFDekNDLFVBQVVBLE9BQVFELGlCQUFpQkUsYUFBYyw4REFB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