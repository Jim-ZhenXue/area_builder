// Copyright 2015-2024, University of Colorado Boulder
/**
 * A Node meant to just take up vertical space (usually for layout purposes).
 * It is never displayed, and cannot have children.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery, Spacer } from '../imports.js';
let VStrut = class VStrut extends Spacer {
    /**
   * Creates a strut with x=0 and y in the range [0,height].
   *
   * @param height - Height of the strut
   * @param [options] - Passed to Spacer/Node
   */ constructor(height, options){
        super(0, height, options);
    }
};
export { VStrut as default };
scenery.register('VStrut', VStrut);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvVlN0cnV0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgTm9kZSBtZWFudCB0byBqdXN0IHRha2UgdXAgdmVydGljYWwgc3BhY2UgKHVzdWFsbHkgZm9yIGxheW91dCBwdXJwb3NlcykuXG4gKiBJdCBpcyBuZXZlciBkaXNwbGF5ZWQsIGFuZCBjYW5ub3QgaGF2ZSBjaGlsZHJlbi5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgc2NlbmVyeSwgU3BhY2VyLCBTcGFjZXJPcHRpb25zIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCB0eXBlIFZTdHJ1dE9wdGlvbnMgPSBTcGFjZXJPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWU3RydXQgZXh0ZW5kcyBTcGFjZXIge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIHN0cnV0IHdpdGggeD0wIGFuZCB5IGluIHRoZSByYW5nZSBbMCxoZWlnaHRdLlxuICAgKlxuICAgKiBAcGFyYW0gaGVpZ2h0IC0gSGVpZ2h0IG9mIHRoZSBzdHJ1dFxuICAgKiBAcGFyYW0gW29wdGlvbnNdIC0gUGFzc2VkIHRvIFNwYWNlci9Ob2RlXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGhlaWdodDogbnVtYmVyLCBvcHRpb25zPzogVlN0cnV0T3B0aW9ucyApIHtcbiAgICBzdXBlciggMCwgaGVpZ2h0LCBvcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1ZTdHJ1dCcsIFZTdHJ1dCApOyJdLCJuYW1lcyI6WyJzY2VuZXJ5IiwiU3BhY2VyIiwiVlN0cnV0IiwiaGVpZ2h0Iiwib3B0aW9ucyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxTQUFTQSxPQUFPLEVBQUVDLE1BQU0sUUFBdUIsZ0JBQWdCO0FBSWhELElBQUEsQUFBTUMsU0FBTixNQUFNQSxlQUFlRDtJQUNsQzs7Ozs7R0FLQyxHQUNELFlBQW9CRSxNQUFjLEVBQUVDLE9BQXVCLENBQUc7UUFDNUQsS0FBSyxDQUFFLEdBQUdELFFBQVFDO0lBQ3BCO0FBQ0Y7QUFWQSxTQUFxQkYsb0JBVXBCO0FBRURGLFFBQVFLLFFBQVEsQ0FBRSxVQUFVSCJ9