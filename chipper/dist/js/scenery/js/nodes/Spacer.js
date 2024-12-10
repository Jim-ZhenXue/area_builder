// Copyright 2015-2024, University of Colorado Boulder
/**
 * A Node meant to just take up certain bounds. It is never displayed, and cannot have children.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import { Leaf, Node, scenery } from '../imports.js';
let Spacer = class Spacer extends Leaf(Node) {
    /**
   * Creates a spacer taking up a rectangular area from x: [0,width] and y: [0,height]. Use x/y in options to control
   * its position.
   *
   * @param width - The width of the spacer
   * @param height - The height of the spacer
   * @param [options] - Passed to Node
   */ constructor(width, height, options){
        assert && assert(isFinite(width), 'width should be a finite number');
        assert && assert(isFinite(height), 'height should be a finite number');
        super();
        // override the local bounds to our area
        this.localBounds = new Bounds2(0, 0, width, height);
        this.mutate(options);
    }
};
export { Spacer as default };
scenery.register('Spacer', Spacer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvU3BhY2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgTm9kZSBtZWFudCB0byBqdXN0IHRha2UgdXAgY2VydGFpbiBib3VuZHMuIEl0IGlzIG5ldmVyIGRpc3BsYXllZCwgYW5kIGNhbm5vdCBoYXZlIGNoaWxkcmVuLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBMZWFmLCBOb2RlLCBOb2RlT3B0aW9ucywgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgdHlwZSBTcGFjZXJPcHRpb25zID0gTm9kZU9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwYWNlciBleHRlbmRzIExlYWYoIE5vZGUgKSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgc3BhY2VyIHRha2luZyB1cCBhIHJlY3Rhbmd1bGFyIGFyZWEgZnJvbSB4OiBbMCx3aWR0aF0gYW5kIHk6IFswLGhlaWdodF0uIFVzZSB4L3kgaW4gb3B0aW9ucyB0byBjb250cm9sXG4gICAqIGl0cyBwb3NpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHdpZHRoIC0gVGhlIHdpZHRoIG9mIHRoZSBzcGFjZXJcbiAgICogQHBhcmFtIGhlaWdodCAtIFRoZSBoZWlnaHQgb2YgdGhlIHNwYWNlclxuICAgKiBAcGFyYW0gW29wdGlvbnNdIC0gUGFzc2VkIHRvIE5vZGVcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG9wdGlvbnM/OiBTcGFjZXJPcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB3aWR0aCApLCAnd2lkdGggc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggaGVpZ2h0ICksICdoZWlnaHQgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBvdmVycmlkZSB0aGUgbG9jYWwgYm91bmRzIHRvIG91ciBhcmVhXG4gICAgdGhpcy5sb2NhbEJvdW5kcyA9IG5ldyBCb3VuZHMyKCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICk7XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdTcGFjZXInLCBTcGFjZXIgKTsiXSwibmFtZXMiOlsiQm91bmRzMiIsIkxlYWYiLCJOb2RlIiwic2NlbmVyeSIsIlNwYWNlciIsIndpZHRoIiwiaGVpZ2h0Iiwib3B0aW9ucyIsImFzc2VydCIsImlzRmluaXRlIiwibG9jYWxCb3VuZHMiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLDZCQUE2QjtBQUNqRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBZUMsT0FBTyxRQUFRLGdCQUFnQjtBQUlsRCxJQUFBLEFBQU1DLFNBQU4sTUFBTUEsZUFBZUgsS0FBTUM7SUFDeEM7Ozs7Ozs7R0FPQyxHQUNELFlBQW9CRyxLQUFhLEVBQUVDLE1BQWMsRUFBRUMsT0FBdUIsQ0FBRztRQUMzRUMsVUFBVUEsT0FBUUMsU0FBVUosUUFBUztRQUNyQ0csVUFBVUEsT0FBUUMsU0FBVUgsU0FBVTtRQUV0QyxLQUFLO1FBRUwsd0NBQXdDO1FBQ3hDLElBQUksQ0FBQ0ksV0FBVyxHQUFHLElBQUlWLFFBQVMsR0FBRyxHQUFHSyxPQUFPQztRQUU3QyxJQUFJLENBQUNLLE1BQU0sQ0FBRUo7SUFDZjtBQUNGO0FBcEJBLFNBQXFCSCxvQkFvQnBCO0FBRURELFFBQVFTLFFBQVEsQ0FBRSxVQUFVUiJ9