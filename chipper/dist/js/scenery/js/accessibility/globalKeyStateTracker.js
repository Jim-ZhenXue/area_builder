// Copyright 2020-2022, University of Colorado Boulder
/**
 * A global object that tracks the state of the keyboard for the Window. Use this
 * to get information about which keyboard keys are pressed down and for how long.
 *
 * @author Michael Kauzmann
 * @author Jesse Greenberg
 */ import Tandem from '../../../tandem/js/Tandem.js';
import { KeyStateTracker, scenery } from '../imports.js';
let GlobalKeyStateTracker = class GlobalKeyStateTracker extends KeyStateTracker {
    constructor(options){
        super(options);
    }
};
const globalKeyStateTracker = new GlobalKeyStateTracker({
    tandem: Tandem.GENERAL_CONTROLLER.createTandem('keyStateTracker')
});
scenery.register('globalKeyStateTracker', globalKeyStateTracker);
export default globalKeyStateTracker;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9nbG9iYWxLZXlTdGF0ZVRyYWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBnbG9iYWwgb2JqZWN0IHRoYXQgdHJhY2tzIHRoZSBzdGF0ZSBvZiB0aGUga2V5Ym9hcmQgZm9yIHRoZSBXaW5kb3cuIFVzZSB0aGlzXG4gKiB0byBnZXQgaW5mb3JtYXRpb24gYWJvdXQgd2hpY2gga2V5Ym9hcmQga2V5cyBhcmUgcHJlc3NlZCBkb3duIGFuZCBmb3IgaG93IGxvbmcuXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xuICovXG5cbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgeyBLZXlTdGF0ZVRyYWNrZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcbmltcG9ydCB7IEtleVN0YXRlVHJhY2tlck9wdGlvbnMgfSBmcm9tICcuL0tleVN0YXRlVHJhY2tlci5qcyc7XG5cbmNsYXNzIEdsb2JhbEtleVN0YXRlVHJhY2tlciBleHRlbmRzIEtleVN0YXRlVHJhY2tlciB7XG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IEtleVN0YXRlVHJhY2tlck9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5jb25zdCBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIgPSBuZXcgR2xvYmFsS2V5U3RhdGVUcmFja2VyKCB7XG4gIHRhbmRlbTogVGFuZGVtLkdFTkVSQUxfQ09OVFJPTExFUi5jcmVhdGVUYW5kZW0oICdrZXlTdGF0ZVRyYWNrZXInIClcbn0gKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ2dsb2JhbEtleVN0YXRlVHJhY2tlcicsIGdsb2JhbEtleVN0YXRlVHJhY2tlciApO1xuZXhwb3J0IGRlZmF1bHQgZ2xvYmFsS2V5U3RhdGVUcmFja2VyOyJdLCJuYW1lcyI6WyJUYW5kZW0iLCJLZXlTdGF0ZVRyYWNrZXIiLCJzY2VuZXJ5IiwiR2xvYmFsS2V5U3RhdGVUcmFja2VyIiwib3B0aW9ucyIsImdsb2JhbEtleVN0YXRlVHJhY2tlciIsInRhbmRlbSIsIkdFTkVSQUxfQ09OVFJPTExFUiIsImNyZWF0ZVRhbmRlbSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsWUFBWSwrQkFBK0I7QUFDbEQsU0FBU0MsZUFBZSxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBR3pELElBQUEsQUFBTUMsd0JBQU4sTUFBTUEsOEJBQThCRjtJQUNsQyxZQUFvQkcsT0FBZ0MsQ0FBRztRQUNyRCxLQUFLLENBQUVBO0lBQ1Q7QUFDRjtBQUVBLE1BQU1DLHdCQUF3QixJQUFJRixzQkFBdUI7SUFDdkRHLFFBQVFOLE9BQU9PLGtCQUFrQixDQUFDQyxZQUFZLENBQUU7QUFDbEQ7QUFFQU4sUUFBUU8sUUFBUSxDQUFFLHlCQUF5Qko7QUFDM0MsZUFBZUEsc0JBQXNCIn0=