// Copyright 2013-2024, University of Colorado Boulder
/**
 * Tracks a stylus ('pen') or something with tilt and pressure information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Pointer, scenery } from '../imports.js';
let Pen = class Pen extends Pointer {
    /**
   * Sets information in this Pen for a given move. (scenery-internal)
   *
   * @returns Whether the point changed
   */ move(point) {
        const pointChanged = this.hasPointChanged(point);
        this.point = point;
        return pointChanged;
    }
    /**
   * Returns an improved string representation of this object.
   */ toString() {
        return `Pen#${this.id}`;
    }
    isTouchLike() {
        return true;
    }
    constructor(id, point, event){
        super(point, 'pen'); // true: pen pointers always start in the down state
        this.id = id;
        sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`Created ${this.toString()}`);
    }
};
export { Pen as default };
scenery.register('Pen', Pen);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvUGVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRyYWNrcyBhIHN0eWx1cyAoJ3BlbicpIG9yIHNvbWV0aGluZyB3aXRoIHRpbHQgYW5kIHByZXNzdXJlIGluZm9ybWF0aW9uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFBvaW50ZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGVuIGV4dGVuZHMgUG9pbnRlciB7XG5cbiAgLy8gRm9yIHRyYWNraW5nIHdoaWNoIHBlbiBpcyB3aGljaFxuICBwdWJsaWMgaWQ6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBldmVudDogRXZlbnQgKSB7XG4gICAgc3VwZXIoIHBvaW50LCAncGVuJyApOyAvLyB0cnVlOiBwZW4gcG9pbnRlcnMgYWx3YXlzIHN0YXJ0IGluIHRoZSBkb3duIHN0YXRlXG5cbiAgICB0aGlzLmlkID0gaWQ7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUG9pbnRlciAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIoIGBDcmVhdGVkICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGluZm9ybWF0aW9uIGluIHRoaXMgUGVuIGZvciBhIGdpdmVuIG1vdmUuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBwb2ludCBjaGFuZ2VkXG4gICAqL1xuICBwdWJsaWMgbW92ZSggcG9pbnQ6IFZlY3RvcjIgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcG9pbnRDaGFuZ2VkID0gdGhpcy5oYXNQb2ludENoYW5nZWQoIHBvaW50ICk7XG5cbiAgICB0aGlzLnBvaW50ID0gcG9pbnQ7XG5cbiAgICByZXR1cm4gcG9pbnRDaGFuZ2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaW1wcm92ZWQgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgb2JqZWN0LlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBQZW4jJHt0aGlzLmlkfWA7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgaXNUb3VjaExpa2UoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1BlbicsIFBlbiApOyJdLCJuYW1lcyI6WyJQb2ludGVyIiwic2NlbmVyeSIsIlBlbiIsIm1vdmUiLCJwb2ludCIsInBvaW50Q2hhbmdlZCIsImhhc1BvaW50Q2hhbmdlZCIsInRvU3RyaW5nIiwiaWQiLCJpc1RvdWNoTGlrZSIsImV2ZW50Iiwic2NlbmVyeUxvZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELFNBQVNBLE9BQU8sRUFBRUMsT0FBTyxRQUFRLGdCQUFnQjtBQUVsQyxJQUFBLEFBQU1DLE1BQU4sTUFBTUEsWUFBWUY7SUFhL0I7Ozs7R0FJQyxHQUNELEFBQU9HLEtBQU1DLEtBQWMsRUFBWTtRQUNyQyxNQUFNQyxlQUFlLElBQUksQ0FBQ0MsZUFBZSxDQUFFRjtRQUUzQyxJQUFJLENBQUNBLEtBQUssR0FBR0E7UUFFYixPQUFPQztJQUNUO0lBRUE7O0dBRUMsR0FDRCxBQUFnQkUsV0FBbUI7UUFDakMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUNDLEVBQUUsRUFBRTtJQUN6QjtJQUVnQkMsY0FBdUI7UUFDckMsT0FBTztJQUNUO0lBOUJBLFlBQW9CRCxFQUFVLEVBQUVKLEtBQWMsRUFBRU0sS0FBWSxDQUFHO1FBQzdELEtBQUssQ0FBRU4sT0FBTyxRQUFTLG9EQUFvRDtRQUUzRSxJQUFJLENBQUNJLEVBQUUsR0FBR0E7UUFFVkcsY0FBY0EsV0FBV1gsT0FBTyxJQUFJVyxXQUFXWCxPQUFPLENBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDTyxRQUFRLElBQUk7SUFDdEY7QUF5QkY7QUFwQ0EsU0FBcUJMLGlCQW9DcEI7QUFFREQsUUFBUVcsUUFBUSxDQUFFLE9BQU9WIn0=