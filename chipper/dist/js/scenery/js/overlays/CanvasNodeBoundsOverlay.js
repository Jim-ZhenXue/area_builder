// Copyright 2013-2024, University of Colorado Boulder
/**
 * Displays CanvasNode bounds.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Shape } from '../../../kite/js/imports.js';
import { CanvasNode, scenery, ShapeBasedOverlay, Trail } from '../imports.js';
let CanvasNodeBoundsOverlay = class CanvasNodeBoundsOverlay extends ShapeBasedOverlay {
    addShapes() {
        new Trail(this.rootNode).eachTrailUnder((trail)=>{
            const node = trail.lastNode();
            if (!node.isVisible()) {
                // skip this subtree if the node is invisible
                return true;
            }
            if (node instanceof CanvasNode && trail.isVisible()) {
                const transform = trail.getTransform();
                this.addShape(transform.transformShape(Shape.bounds(node.selfBounds)), 'rgba(0,255,0,0.8)', true);
            }
            return false;
        });
    }
    constructor(display, rootNode){
        super(display, rootNode, 'canvasNodeBoundsOverlay');
    }
};
export { CanvasNodeBoundsOverlay as default };
scenery.register('CanvasNodeBoundsOverlay', CanvasNodeBoundsOverlay);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvb3ZlcmxheXMvQ2FudmFzTm9kZUJvdW5kc092ZXJsYXkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGlzcGxheXMgQ2FudmFzTm9kZSBib3VuZHMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IENhbnZhc05vZGUsIERpc3BsYXksIE5vZGUsIHNjZW5lcnksIFNoYXBlQmFzZWRPdmVybGF5LCBUT3ZlcmxheSwgVHJhaWwgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FudmFzTm9kZUJvdW5kc092ZXJsYXkgZXh0ZW5kcyBTaGFwZUJhc2VkT3ZlcmxheSBpbXBsZW1lbnRzIFRPdmVybGF5IHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkaXNwbGF5OiBEaXNwbGF5LCByb290Tm9kZTogTm9kZSApIHtcbiAgICBzdXBlciggZGlzcGxheSwgcm9vdE5vZGUsICdjYW52YXNOb2RlQm91bmRzT3ZlcmxheScgKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRTaGFwZXMoKTogdm9pZCB7XG4gICAgbmV3IFRyYWlsKCB0aGlzLnJvb3ROb2RlICkuZWFjaFRyYWlsVW5kZXIoIHRyYWlsID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0cmFpbC5sYXN0Tm9kZSgpO1xuICAgICAgaWYgKCAhbm9kZS5pc1Zpc2libGUoKSApIHtcbiAgICAgICAgLy8gc2tpcCB0aGlzIHN1YnRyZWUgaWYgdGhlIG5vZGUgaXMgaW52aXNpYmxlXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKCAoIG5vZGUgaW5zdGFuY2VvZiBDYW52YXNOb2RlICkgJiYgdHJhaWwuaXNWaXNpYmxlKCkgKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHRyYWlsLmdldFRyYW5zZm9ybSgpO1xuXG4gICAgICAgIHRoaXMuYWRkU2hhcGUoIHRyYW5zZm9ybS50cmFuc2Zvcm1TaGFwZSggU2hhcGUuYm91bmRzKCBub2RlLnNlbGZCb3VuZHMgKSApLCAncmdiYSgwLDI1NSwwLDAuOCknLCB0cnVlICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdDYW52YXNOb2RlQm91bmRzT3ZlcmxheScsIENhbnZhc05vZGVCb3VuZHNPdmVybGF5ICk7Il0sIm5hbWVzIjpbIlNoYXBlIiwiQ2FudmFzTm9kZSIsInNjZW5lcnkiLCJTaGFwZUJhc2VkT3ZlcmxheSIsIlRyYWlsIiwiQ2FudmFzTm9kZUJvdW5kc092ZXJsYXkiLCJhZGRTaGFwZXMiLCJyb290Tm9kZSIsImVhY2hUcmFpbFVuZGVyIiwidHJhaWwiLCJub2RlIiwibGFzdE5vZGUiLCJpc1Zpc2libGUiLCJ0cmFuc2Zvcm0iLCJnZXRUcmFuc2Zvcm0iLCJhZGRTaGFwZSIsInRyYW5zZm9ybVNoYXBlIiwiYm91bmRzIiwic2VsZkJvdW5kcyIsImRpc3BsYXkiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxTQUFTQSxLQUFLLFFBQVEsOEJBQThCO0FBQ3BELFNBQVNDLFVBQVUsRUFBaUJDLE9BQU8sRUFBRUMsaUJBQWlCLEVBQVlDLEtBQUssUUFBUSxnQkFBZ0I7QUFFeEYsSUFBQSxBQUFNQywwQkFBTixNQUFNQSxnQ0FBZ0NGO0lBSzVDRyxZQUFrQjtRQUN2QixJQUFJRixNQUFPLElBQUksQ0FBQ0csUUFBUSxFQUFHQyxjQUFjLENBQUVDLENBQUFBO1lBQ3pDLE1BQU1DLE9BQU9ELE1BQU1FLFFBQVE7WUFDM0IsSUFBSyxDQUFDRCxLQUFLRSxTQUFTLElBQUs7Z0JBQ3ZCLDZDQUE2QztnQkFDN0MsT0FBTztZQUNUO1lBQ0EsSUFBSyxBQUFFRixnQkFBZ0JULGNBQWdCUSxNQUFNRyxTQUFTLElBQUs7Z0JBQ3pELE1BQU1DLFlBQVlKLE1BQU1LLFlBQVk7Z0JBRXBDLElBQUksQ0FBQ0MsUUFBUSxDQUFFRixVQUFVRyxjQUFjLENBQUVoQixNQUFNaUIsTUFBTSxDQUFFUCxLQUFLUSxVQUFVLElBQU0scUJBQXFCO1lBQ25HO1lBQ0EsT0FBTztRQUNUO0lBQ0Y7SUFsQkEsWUFBb0JDLE9BQWdCLEVBQUVaLFFBQWMsQ0FBRztRQUNyRCxLQUFLLENBQUVZLFNBQVNaLFVBQVU7SUFDNUI7QUFpQkY7QUFwQkEsU0FBcUJGLHFDQW9CcEI7QUFFREgsUUFBUWtCLFFBQVEsQ0FBRSwyQkFBMkJmIn0=