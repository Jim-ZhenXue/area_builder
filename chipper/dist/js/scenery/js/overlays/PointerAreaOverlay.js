// Copyright 2013-2024, University of Colorado Boulder
/**
 * Displays mouse and touch areas when they are customized. Expensive to display!
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import { Shape } from '../../../kite/js/imports.js';
import { scenery, ShapeBasedOverlay, Trail } from '../imports.js';
let PointerAreaOverlay = class PointerAreaOverlay extends ShapeBasedOverlay {
    addShapes() {
        new Trail(this.rootNode).eachTrailUnder((trail)=>{
            const node = trail.lastNode();
            if (!node.isVisible()) {
                // skip this subtree if the node is invisible
                return true;
            }
            if ((node.mouseArea || node.touchArea) && trail.isVisible()) {
                const transform = trail.getTransform();
                if (node.mouseArea) {
                    this.addShape(transform.transformShape(node.mouseArea instanceof Bounds2 ? Shape.bounds(node.mouseArea) : node.mouseArea), 'rgba(0,0,255,0.8)', true);
                }
                if (node.touchArea) {
                    this.addShape(transform.transformShape(node.touchArea instanceof Bounds2 ? Shape.bounds(node.touchArea) : node.touchArea), 'rgba(255,0,0,0.8)', false);
                }
            }
            return false;
        });
    }
    constructor(display, rootNode){
        super(display, rootNode, 'mouseTouchAreaOverlay');
    }
};
export { PointerAreaOverlay as default };
scenery.register('PointerAreaOverlay', PointerAreaOverlay);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvb3ZlcmxheXMvUG9pbnRlckFyZWFPdmVybGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERpc3BsYXlzIG1vdXNlIGFuZCB0b3VjaCBhcmVhcyB3aGVuIHRoZXkgYXJlIGN1c3RvbWl6ZWQuIEV4cGVuc2l2ZSB0byBkaXNwbGF5IVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBEaXNwbGF5LCBOb2RlLCBzY2VuZXJ5LCBTaGFwZUJhc2VkT3ZlcmxheSwgVE92ZXJsYXksIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvaW50ZXJBcmVhT3ZlcmxheSBleHRlbmRzIFNoYXBlQmFzZWRPdmVybGF5IGltcGxlbWVudHMgVE92ZXJsYXkge1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRpc3BsYXk6IERpc3BsYXksIHJvb3ROb2RlOiBOb2RlICkge1xuICAgIHN1cGVyKCBkaXNwbGF5LCByb290Tm9kZSwgJ21vdXNlVG91Y2hBcmVhT3ZlcmxheScgKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRTaGFwZXMoKTogdm9pZCB7XG4gICAgbmV3IFRyYWlsKCB0aGlzLnJvb3ROb2RlICkuZWFjaFRyYWlsVW5kZXIoIHRyYWlsID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0cmFpbC5sYXN0Tm9kZSgpO1xuICAgICAgaWYgKCAhbm9kZS5pc1Zpc2libGUoKSApIHtcbiAgICAgICAgLy8gc2tpcCB0aGlzIHN1YnRyZWUgaWYgdGhlIG5vZGUgaXMgaW52aXNpYmxlXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKCAoIG5vZGUubW91c2VBcmVhIHx8IG5vZGUudG91Y2hBcmVhICkgJiYgdHJhaWwuaXNWaXNpYmxlKCkgKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHRyYWlsLmdldFRyYW5zZm9ybSgpO1xuXG4gICAgICAgIGlmICggbm9kZS5tb3VzZUFyZWEgKSB7XG4gICAgICAgICAgdGhpcy5hZGRTaGFwZSggdHJhbnNmb3JtLnRyYW5zZm9ybVNoYXBlKCBub2RlLm1vdXNlQXJlYSBpbnN0YW5jZW9mIEJvdW5kczIgPyBTaGFwZS5ib3VuZHMoIG5vZGUubW91c2VBcmVhICkgOiBub2RlLm1vdXNlQXJlYSApLCAncmdiYSgwLDAsMjU1LDAuOCknLCB0cnVlICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBub2RlLnRvdWNoQXJlYSApIHtcbiAgICAgICAgICB0aGlzLmFkZFNoYXBlKCB0cmFuc2Zvcm0udHJhbnNmb3JtU2hhcGUoIG5vZGUudG91Y2hBcmVhIGluc3RhbmNlb2YgQm91bmRzMiA/IFNoYXBlLmJvdW5kcyggbm9kZS50b3VjaEFyZWEgKSA6IG5vZGUudG91Y2hBcmVhICksICdyZ2JhKDI1NSwwLDAsMC44KScsIGZhbHNlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9ICk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1BvaW50ZXJBcmVhT3ZlcmxheScsIFBvaW50ZXJBcmVhT3ZlcmxheSApOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwiU2hhcGUiLCJzY2VuZXJ5IiwiU2hhcGVCYXNlZE92ZXJsYXkiLCJUcmFpbCIsIlBvaW50ZXJBcmVhT3ZlcmxheSIsImFkZFNoYXBlcyIsInJvb3ROb2RlIiwiZWFjaFRyYWlsVW5kZXIiLCJ0cmFpbCIsIm5vZGUiLCJsYXN0Tm9kZSIsImlzVmlzaWJsZSIsIm1vdXNlQXJlYSIsInRvdWNoQXJlYSIsInRyYW5zZm9ybSIsImdldFRyYW5zZm9ybSIsImFkZFNoYXBlIiwidHJhbnNmb3JtU2hhcGUiLCJib3VuZHMiLCJkaXNwbGF5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsU0FBU0MsS0FBSyxRQUFRLDhCQUE4QjtBQUNwRCxTQUF3QkMsT0FBTyxFQUFFQyxpQkFBaUIsRUFBWUMsS0FBSyxRQUFRLGdCQUFnQjtBQUU1RSxJQUFBLEFBQU1DLHFCQUFOLE1BQU1BLDJCQUEyQkY7SUFLdkNHLFlBQWtCO1FBQ3ZCLElBQUlGLE1BQU8sSUFBSSxDQUFDRyxRQUFRLEVBQUdDLGNBQWMsQ0FBRUMsQ0FBQUE7WUFDekMsTUFBTUMsT0FBT0QsTUFBTUUsUUFBUTtZQUMzQixJQUFLLENBQUNELEtBQUtFLFNBQVMsSUFBSztnQkFDdkIsNkNBQTZDO2dCQUM3QyxPQUFPO1lBQ1Q7WUFDQSxJQUFLLEFBQUVGLENBQUFBLEtBQUtHLFNBQVMsSUFBSUgsS0FBS0ksU0FBUyxBQUFELEtBQU9MLE1BQU1HLFNBQVMsSUFBSztnQkFDL0QsTUFBTUcsWUFBWU4sTUFBTU8sWUFBWTtnQkFFcEMsSUFBS04sS0FBS0csU0FBUyxFQUFHO29CQUNwQixJQUFJLENBQUNJLFFBQVEsQ0FBRUYsVUFBVUcsY0FBYyxDQUFFUixLQUFLRyxTQUFTLFlBQVliLFVBQVVDLE1BQU1rQixNQUFNLENBQUVULEtBQUtHLFNBQVMsSUFBS0gsS0FBS0csU0FBUyxHQUFJLHFCQUFxQjtnQkFDdko7Z0JBQ0EsSUFBS0gsS0FBS0ksU0FBUyxFQUFHO29CQUNwQixJQUFJLENBQUNHLFFBQVEsQ0FBRUYsVUFBVUcsY0FBYyxDQUFFUixLQUFLSSxTQUFTLFlBQVlkLFVBQVVDLE1BQU1rQixNQUFNLENBQUVULEtBQUtJLFNBQVMsSUFBS0osS0FBS0ksU0FBUyxHQUFJLHFCQUFxQjtnQkFDdko7WUFDRjtZQUNBLE9BQU87UUFDVDtJQUNGO0lBdkJBLFlBQW9CTSxPQUFnQixFQUFFYixRQUFjLENBQUc7UUFDckQsS0FBSyxDQUFFYSxTQUFTYixVQUFVO0lBQzVCO0FBc0JGO0FBekJBLFNBQXFCRixnQ0F5QnBCO0FBRURILFFBQVFtQixRQUFRLENBQUUsc0JBQXNCaEIifQ==