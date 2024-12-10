// Copyright 2019-2024, University of Colorado Boulder
/**
 * Displays the "hittable" mouse/touch regions for items with input listeners.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Shape } from '../../../kite/js/imports.js';
import { scenery, ShapeBasedOverlay, Trail } from '../imports.js';
let HitAreaOverlay = class HitAreaOverlay extends ShapeBasedOverlay {
    addShapes() {
        new Trail(this.rootNode).eachTrailUnder((trail)=>{
            const node = trail.lastNode();
            if (!node.isVisible() || node.pickable === false) {
                // skip this subtree if the node is invisible
                return true;
            }
            if (node.inputListeners.length && trail.isVisible()) {
                const mouseShape = HitAreaOverlay.getLocalMouseShape(node);
                const touchShape = HitAreaOverlay.getLocalTouchShape(node);
                const matrix = trail.getMatrix();
                if (!mouseShape.bounds.isEmpty()) {
                    this.addShape(mouseShape.transformed(matrix), 'rgba(0,0,255,0.8)', true);
                }
                if (!touchShape.bounds.isEmpty()) {
                    this.addShape(touchShape.transformed(matrix), 'rgba(255,0,0,0.8)', false);
                }
            }
            return false;
        });
    }
    static getLocalMouseShape(node) {
        let shape = Shape.union([
            node.mouseArea ? node.mouseArea instanceof Shape ? node.mouseArea : Shape.bounds(node.mouseArea) : node.getSelfShape(),
            ...node.children.filter((child)=>{
                return node.visible && node.pickable !== false;
            }).map((child)=>{
                return HitAreaOverlay.getLocalMouseShape(child).transformed(child.matrix);
            })
        ]);
        if (node.hasClipArea()) {
            shape = shape.shapeIntersection(node.clipArea);
        }
        return shape;
    }
    static getLocalTouchShape(node) {
        let shape = Shape.union([
            node.touchArea ? node.touchArea instanceof Shape ? node.touchArea : Shape.bounds(node.touchArea) : node.getSelfShape(),
            ...node.children.filter((child)=>{
                return node.visible && node.pickable !== false;
            }).map((child)=>{
                return HitAreaOverlay.getLocalTouchShape(child).transformed(child.matrix);
            })
        ]);
        if (node.hasClipArea()) {
            shape = shape.shapeIntersection(node.clipArea);
        }
        return shape;
    }
    constructor(display, rootNode){
        super(display, rootNode, 'hitAreaOverlay');
    }
};
export { HitAreaOverlay as default };
scenery.register('HitAreaOverlay', HitAreaOverlay);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvb3ZlcmxheXMvSGl0QXJlYU92ZXJsYXkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGlzcGxheXMgdGhlIFwiaGl0dGFibGVcIiBtb3VzZS90b3VjaCByZWdpb25zIGZvciBpdGVtcyB3aXRoIGlucHV0IGxpc3RlbmVycy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHsgRGlzcGxheSwgTm9kZSwgc2NlbmVyeSwgU2hhcGVCYXNlZE92ZXJsYXksIFRPdmVybGF5LCBUcmFpbCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaXRBcmVhT3ZlcmxheSBleHRlbmRzIFNoYXBlQmFzZWRPdmVybGF5IGltcGxlbWVudHMgVE92ZXJsYXkge1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRpc3BsYXk6IERpc3BsYXksIHJvb3ROb2RlOiBOb2RlICkge1xuICAgIHN1cGVyKCBkaXNwbGF5LCByb290Tm9kZSwgJ2hpdEFyZWFPdmVybGF5JyApO1xuICB9XG5cbiAgcHVibGljIGFkZFNoYXBlcygpOiB2b2lkIHtcbiAgICBuZXcgVHJhaWwoIHRoaXMucm9vdE5vZGUgKS5lYWNoVHJhaWxVbmRlciggdHJhaWwgPT4ge1xuICAgICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XG5cbiAgICAgIGlmICggIW5vZGUuaXNWaXNpYmxlKCkgfHwgbm9kZS5waWNrYWJsZSA9PT0gZmFsc2UgKSB7XG4gICAgICAgIC8vIHNraXAgdGhpcyBzdWJ0cmVlIGlmIHRoZSBub2RlIGlzIGludmlzaWJsZVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBub2RlLmlucHV0TGlzdGVuZXJzLmxlbmd0aCAmJiB0cmFpbC5pc1Zpc2libGUoKSApIHtcbiAgICAgICAgY29uc3QgbW91c2VTaGFwZSA9IEhpdEFyZWFPdmVybGF5LmdldExvY2FsTW91c2VTaGFwZSggbm9kZSApO1xuICAgICAgICBjb25zdCB0b3VjaFNoYXBlID0gSGl0QXJlYU92ZXJsYXkuZ2V0TG9jYWxUb3VjaFNoYXBlKCBub2RlICk7XG4gICAgICAgIGNvbnN0IG1hdHJpeCA9IHRyYWlsLmdldE1hdHJpeCgpO1xuXG4gICAgICAgIGlmICggIW1vdXNlU2hhcGUuYm91bmRzLmlzRW1wdHkoKSApIHtcbiAgICAgICAgICB0aGlzLmFkZFNoYXBlKCBtb3VzZVNoYXBlLnRyYW5zZm9ybWVkKCBtYXRyaXggKSwgJ3JnYmEoMCwwLDI1NSwwLjgpJywgdHJ1ZSApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggIXRvdWNoU2hhcGUuYm91bmRzLmlzRW1wdHkoKSApIHtcbiAgICAgICAgICB0aGlzLmFkZFNoYXBlKCB0b3VjaFNoYXBlLnRyYW5zZm9ybWVkKCBtYXRyaXggKSwgJ3JnYmEoMjU1LDAsMCwwLjgpJywgZmFsc2UgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSApO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0TG9jYWxNb3VzZVNoYXBlKCBub2RlOiBOb2RlICk6IFNoYXBlIHtcbiAgICBsZXQgc2hhcGUgPSBTaGFwZS51bmlvbiggW1xuICAgICAgbm9kZS5tb3VzZUFyZWEgPyAoIG5vZGUubW91c2VBcmVhIGluc3RhbmNlb2YgU2hhcGUgPyBub2RlLm1vdXNlQXJlYSA6IFNoYXBlLmJvdW5kcyggbm9kZS5tb3VzZUFyZWEgKSApIDogbm9kZS5nZXRTZWxmU2hhcGUoKSxcbiAgICAgIC4uLm5vZGUuY2hpbGRyZW4uZmlsdGVyKCAoIGNoaWxkOiBOb2RlICkgPT4ge1xuICAgICAgICByZXR1cm4gbm9kZS52aXNpYmxlICYmIG5vZGUucGlja2FibGUgIT09IGZhbHNlO1xuICAgICAgfSApLm1hcCggY2hpbGQgPT4ge1xuICAgICAgICByZXR1cm4gSGl0QXJlYU92ZXJsYXkuZ2V0TG9jYWxNb3VzZVNoYXBlKCBjaGlsZCApLnRyYW5zZm9ybWVkKCBjaGlsZC5tYXRyaXggKTtcbiAgICAgIH0gKVxuICAgIF0gKTtcbiAgICBpZiAoIG5vZGUuaGFzQ2xpcEFyZWEoKSApIHtcbiAgICAgIHNoYXBlID0gc2hhcGUuc2hhcGVJbnRlcnNlY3Rpb24oIG5vZGUuY2xpcEFyZWEhICk7XG4gICAgfVxuICAgIHJldHVybiBzaGFwZTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIGdldExvY2FsVG91Y2hTaGFwZSggbm9kZTogTm9kZSApOiBTaGFwZSB7XG4gICAgbGV0IHNoYXBlID0gU2hhcGUudW5pb24oIFtcbiAgICAgIG5vZGUudG91Y2hBcmVhID8gKCBub2RlLnRvdWNoQXJlYSBpbnN0YW5jZW9mIFNoYXBlID8gbm9kZS50b3VjaEFyZWEgOiBTaGFwZS5ib3VuZHMoIG5vZGUudG91Y2hBcmVhICkgKSA6IG5vZGUuZ2V0U2VsZlNoYXBlKCksXG4gICAgICAuLi5ub2RlLmNoaWxkcmVuLmZpbHRlciggKCBjaGlsZDogTm9kZSApID0+IHtcbiAgICAgICAgcmV0dXJuIG5vZGUudmlzaWJsZSAmJiBub2RlLnBpY2thYmxlICE9PSBmYWxzZTtcbiAgICAgIH0gKS5tYXAoIGNoaWxkID0+IHtcbiAgICAgICAgcmV0dXJuIEhpdEFyZWFPdmVybGF5LmdldExvY2FsVG91Y2hTaGFwZSggY2hpbGQgKS50cmFuc2Zvcm1lZCggY2hpbGQubWF0cml4ICk7XG4gICAgICB9IClcbiAgICBdICk7XG4gICAgaWYgKCBub2RlLmhhc0NsaXBBcmVhKCkgKSB7XG4gICAgICBzaGFwZSA9IHNoYXBlLnNoYXBlSW50ZXJzZWN0aW9uKCBub2RlLmNsaXBBcmVhISApO1xuICAgIH1cbiAgICByZXR1cm4gc2hhcGU7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0hpdEFyZWFPdmVybGF5JywgSGl0QXJlYU92ZXJsYXkgKTsiXSwibmFtZXMiOlsiU2hhcGUiLCJzY2VuZXJ5IiwiU2hhcGVCYXNlZE92ZXJsYXkiLCJUcmFpbCIsIkhpdEFyZWFPdmVybGF5IiwiYWRkU2hhcGVzIiwicm9vdE5vZGUiLCJlYWNoVHJhaWxVbmRlciIsInRyYWlsIiwibm9kZSIsImxhc3ROb2RlIiwiaXNWaXNpYmxlIiwicGlja2FibGUiLCJpbnB1dExpc3RlbmVycyIsImxlbmd0aCIsIm1vdXNlU2hhcGUiLCJnZXRMb2NhbE1vdXNlU2hhcGUiLCJ0b3VjaFNoYXBlIiwiZ2V0TG9jYWxUb3VjaFNoYXBlIiwibWF0cml4IiwiZ2V0TWF0cml4IiwiYm91bmRzIiwiaXNFbXB0eSIsImFkZFNoYXBlIiwidHJhbnNmb3JtZWQiLCJzaGFwZSIsInVuaW9uIiwibW91c2VBcmVhIiwiZ2V0U2VsZlNoYXBlIiwiY2hpbGRyZW4iLCJmaWx0ZXIiLCJjaGlsZCIsInZpc2libGUiLCJtYXAiLCJoYXNDbGlwQXJlYSIsInNoYXBlSW50ZXJzZWN0aW9uIiwiY2xpcEFyZWEiLCJ0b3VjaEFyZWEiLCJkaXNwbGF5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsU0FBU0EsS0FBSyxRQUFRLDhCQUE4QjtBQUNwRCxTQUF3QkMsT0FBTyxFQUFFQyxpQkFBaUIsRUFBWUMsS0FBSyxRQUFRLGdCQUFnQjtBQUU1RSxJQUFBLEFBQU1DLGlCQUFOLE1BQU1BLHVCQUF1QkY7SUFLbkNHLFlBQWtCO1FBQ3ZCLElBQUlGLE1BQU8sSUFBSSxDQUFDRyxRQUFRLEVBQUdDLGNBQWMsQ0FBRUMsQ0FBQUE7WUFDekMsTUFBTUMsT0FBT0QsTUFBTUUsUUFBUTtZQUUzQixJQUFLLENBQUNELEtBQUtFLFNBQVMsTUFBTUYsS0FBS0csUUFBUSxLQUFLLE9BQVE7Z0JBQ2xELDZDQUE2Qztn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