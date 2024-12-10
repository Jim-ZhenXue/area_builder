// Copyright 2015-2024, University of Colorado Boulder
/**
 * A Node meant to just take up horizontal space (usually for layout purposes).
 * It is never displayed, and cannot have children.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery, Spacer } from '../imports.js';
let HStrut = class HStrut extends Spacer {
    /**
   * Creates a strut with x in the range [0,width] and y=0.
   *
   * @param width - Width of the strut
   * @param [options] - Passed to Spacer/Node
   */ constructor(width, options){
        super(width, 0, options);
    }
};
export { HStrut as default };
scenery.register('HStrut', HStrut);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvSFN0cnV0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgTm9kZSBtZWFudCB0byBqdXN0IHRha2UgdXAgaG9yaXpvbnRhbCBzcGFjZSAodXN1YWxseSBmb3IgbGF5b3V0IHB1cnBvc2VzKS5cbiAqIEl0IGlzIG5ldmVyIGRpc3BsYXllZCwgYW5kIGNhbm5vdCBoYXZlIGNoaWxkcmVuLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBzY2VuZXJ5LCBTcGFjZXIsIFNwYWNlck9wdGlvbnMgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IHR5cGUgSFN0cnV0T3B0aW9ucyA9IFNwYWNlck9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhTdHJ1dCBleHRlbmRzIFNwYWNlciB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgc3RydXQgd2l0aCB4IGluIHRoZSByYW5nZSBbMCx3aWR0aF0gYW5kIHk9MC5cbiAgICpcbiAgICogQHBhcmFtIHdpZHRoIC0gV2lkdGggb2YgdGhlIHN0cnV0XG4gICAqIEBwYXJhbSBbb3B0aW9uc10gLSBQYXNzZWQgdG8gU3BhY2VyL05vZGVcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggd2lkdGg6IG51bWJlciwgb3B0aW9ucz86IEhTdHJ1dE9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIHdpZHRoLCAwLCBvcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0hTdHJ1dCcsIEhTdHJ1dCApOyJdLCJuYW1lcyI6WyJzY2VuZXJ5IiwiU3BhY2VyIiwiSFN0cnV0Iiwid2lkdGgiLCJvcHRpb25zIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELFNBQVNBLE9BQU8sRUFBRUMsTUFBTSxRQUF1QixnQkFBZ0I7QUFJaEQsSUFBQSxBQUFNQyxTQUFOLE1BQU1BLGVBQWVEO0lBQ2xDOzs7OztHQUtDLEdBQ0QsWUFBb0JFLEtBQWEsRUFBRUMsT0FBdUIsQ0FBRztRQUMzRCxLQUFLLENBQUVELE9BQU8sR0FBR0M7SUFDbkI7QUFDRjtBQVZBLFNBQXFCRixvQkFVcEI7QUFFREYsUUFBUUssUUFBUSxDQUFFLFVBQVVIIn0=