// Copyright 2014-2022, University of Colorado Boulder
/**
 * Type that represents a movable shape in the view.
 *
 * @author John Blanco
 */ import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color, DragListener, Node, Path } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import Grid from './Grid.js';
// constants
const SHADOW_COLOR = 'rgba( 50, 50, 50, 0.5 )';
const SHADOW_OFFSET = new Vector2(5, 5);
const OPACITY_OF_TRANSLUCENT_SHAPES = 0.65; // Value empirically determined.
const UNIT_LENGTH = AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH;
const BORDER_LINE_WIDTH = 1;
let ShapeNode = class ShapeNode extends Node {
    /**
   * release memory references
   * @public
   */ dispose() {
        this.disposeShapeNode();
        super.dispose();
    }
    /**
   * @param {MovableShape} movableShape
   * @param {Bounds2} dragBounds
   */ constructor(movableShape, dragBounds){
        super({
            cursor: 'pointer'
        });
        const self = this;
        this.color = movableShape.color; // @public
        // Set up the mouse and touch areas for this node so that this can still be grabbed when invisible.
        this.touchArea = movableShape.shape;
        this.mouseArea = movableShape.shape;
        // Set up a root node whose visibility and opacity will be manipulated below.
        const rootNode = new Node();
        this.addChild(rootNode);
        // Create the shadow
        const shadow = new Path(movableShape.shape, {
            fill: SHADOW_COLOR,
            leftTop: SHADOW_OFFSET
        });
        rootNode.addChild(shadow);
        // Create the primary representation
        const representation = new Path(movableShape.shape, {
            fill: movableShape.color,
            stroke: Color.toColor(movableShape.color).colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR),
            lineWidth: 1,
            lineJoin: 'round'
        });
        rootNode.addChild(representation);
        // Add the grid.
        const grid = new Grid(representation.bounds.dilated(-BORDER_LINE_WIDTH), UNIT_LENGTH, {
            lineDash: [
                0,
                3,
                1,
                0
            ],
            stroke: 'black'
        });
        representation.addChild(grid);
        // Move this node as the model representation moves
        const updatePosition = (position)=>{
            this.leftTop = position;
        };
        movableShape.positionProperty.link(updatePosition);
        // Because a composite shape is often used to depict the overall shape when a shape is on the placement board, this
        // element may become invisible unless it is user controlled, animating, or fading.
        const visibleProperty = new DerivedProperty([
            movableShape.userControlledProperty,
            movableShape.animatingProperty,
            movableShape.fadeProportionProperty,
            movableShape.invisibleWhenStillProperty
        ], (userControlled, animating, fadeProportion, invisibleWhenStill)=>userControlled || animating || fadeProportion > 0 || !invisibleWhenStill);
        // Opacity is also a derived property, range is 0 to 1.
        const opacityProperty = new DerivedProperty([
            movableShape.userControlledProperty,
            movableShape.animatingProperty,
            movableShape.fadeProportionProperty
        ], (userControlled, animating, fadeProportion)=>{
            if (userControlled || animating) {
                // The shape is either being dragged by the user or is moving to a position, so should be fully opaque.
                return 1;
            } else if (fadeProportion > 0) {
                // The shape is fading away.
                return 1 - fadeProportion;
            } else {
                // The shape is not controlled by the user, animated, or fading, so it is most likely placed on the board.
                // If it is visible, it will be translucent, since some of the games use shapes in this state to place over
                // other shapes for comparative purposes.
                return OPACITY_OF_TRANSLUCENT_SHAPES;
            }
        });
        opacityProperty.link((opacity)=>{
            rootNode.opacity = opacity;
        });
        visibleProperty.link((visible)=>{
            rootNode.visible = visible;
        });
        const shadowVisibilityProperty = new DerivedProperty([
            movableShape.userControlledProperty,
            movableShape.animatingProperty
        ], (userControlled, animating)=>userControlled || animating);
        shadowVisibilityProperty.linkAttribute(shadow, 'visible');
        // To avoid certain complications, this node should not be pickable if it is animating or fading.
        const updatePickability = ()=>{
            self.pickable = !movableShape.animatingProperty.get() && movableShape.fadeProportionProperty.get() === 0;
        };
        movableShape.animatingProperty.link(updatePickability);
        movableShape.fadeProportionProperty.link(updatePickability);
        // Adjust the drag bounds to compensate for the shape that that the entire shape will stay in bounds.
        const shapeDragBounds = new Bounds2(dragBounds.minX, dragBounds.minY, dragBounds.maxX - movableShape.shape.bounds.width, dragBounds.maxY - movableShape.shape.bounds.height);
        // Enclose the drag bounds in a Property so that it can be used in the drag handler.
        const dragBoundsProperty = new Property(shapeDragBounds);
        // Add the listener that will allow the user to drag the shape around.
        const dragListener = new DragListener({
            positionProperty: movableShape.positionProperty,
            dragBoundsProperty: dragBoundsProperty,
            allowTouchSnag: true,
            start: ()=>{
                movableShape.userControlledProperty.set(true);
            },
            end: ()=>{
                movableShape.userControlledProperty.set(false);
            }
        });
        this.addInputListener(dragListener);
        // @private
        this.disposeShapeNode = ()=>{
            movableShape.positionProperty.unlink(updatePosition);
            visibleProperty.dispose();
            opacityProperty.dispose();
            shadowVisibilityProperty.dispose();
            movableShape.animatingProperty.unlink(updatePickability);
            movableShape.fadeProportionProperty.unlink(updatePickability);
            representation.dispose();
            shadow.dispose();
            grid.dispose();
            dragListener.dispose();
        };
    }
};
areaBuilder.register('ShapeNode', ShapeNode);
export default ShapeNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vdmlldy9TaGFwZU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVHlwZSB0aGF0IHJlcHJlc2VudHMgYSBtb3ZhYmxlIHNoYXBlIGluIHRoZSB2aWV3LlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IENvbG9yLCBEcmFnTGlzdGVuZXIsIE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi9BcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5qcyc7XG5pbXBvcnQgR3JpZCBmcm9tICcuL0dyaWQuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFNIQURPV19DT0xPUiA9ICdyZ2JhKCA1MCwgNTAsIDUwLCAwLjUgKSc7XG5jb25zdCBTSEFET1dfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDUsIDUgKTtcbmNvbnN0IE9QQUNJVFlfT0ZfVFJBTlNMVUNFTlRfU0hBUEVTID0gMC42NTsgLy8gVmFsdWUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cbmNvbnN0IFVOSVRfTEVOR1RIID0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuVU5JVF9TUVVBUkVfTEVOR1RIO1xuY29uc3QgQk9SREVSX0xJTkVfV0lEVEggPSAxO1xuXG5jbGFzcyBTaGFwZU5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtNb3ZhYmxlU2hhcGV9IG1vdmFibGVTaGFwZVxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGRyYWdCb3VuZHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBtb3ZhYmxlU2hhcGUsIGRyYWdCb3VuZHMgKSB7XG4gICAgc3VwZXIoIHsgY3Vyc29yOiAncG9pbnRlcicgfSApO1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuY29sb3IgPSBtb3ZhYmxlU2hhcGUuY29sb3I7IC8vIEBwdWJsaWNcblxuICAgIC8vIFNldCB1cCB0aGUgbW91c2UgYW5kIHRvdWNoIGFyZWFzIGZvciB0aGlzIG5vZGUgc28gdGhhdCB0aGlzIGNhbiBzdGlsbCBiZSBncmFiYmVkIHdoZW4gaW52aXNpYmxlLlxuICAgIHRoaXMudG91Y2hBcmVhID0gbW92YWJsZVNoYXBlLnNoYXBlO1xuICAgIHRoaXMubW91c2VBcmVhID0gbW92YWJsZVNoYXBlLnNoYXBlO1xuXG4gICAgLy8gU2V0IHVwIGEgcm9vdCBub2RlIHdob3NlIHZpc2liaWxpdHkgYW5kIG9wYWNpdHkgd2lsbCBiZSBtYW5pcHVsYXRlZCBiZWxvdy5cbiAgICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgdGhpcy5hZGRDaGlsZCggcm9vdE5vZGUgKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgc2hhZG93XG4gICAgY29uc3Qgc2hhZG93ID0gbmV3IFBhdGgoIG1vdmFibGVTaGFwZS5zaGFwZSwge1xuICAgICAgZmlsbDogU0hBRE9XX0NPTE9SLFxuICAgICAgbGVmdFRvcDogU0hBRE9XX09GRlNFVFxuICAgIH0gKTtcbiAgICByb290Tm9kZS5hZGRDaGlsZCggc2hhZG93ICk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHByaW1hcnkgcmVwcmVzZW50YXRpb25cbiAgICBjb25zdCByZXByZXNlbnRhdGlvbiA9IG5ldyBQYXRoKCBtb3ZhYmxlU2hhcGUuc2hhcGUsIHtcbiAgICAgIGZpbGw6IG1vdmFibGVTaGFwZS5jb2xvcixcbiAgICAgIHN0cm9rZTogQ29sb3IudG9Db2xvciggbW92YWJsZVNoYXBlLmNvbG9yICkuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKSxcbiAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgIGxpbmVKb2luOiAncm91bmQnXG4gICAgfSApO1xuICAgIHJvb3ROb2RlLmFkZENoaWxkKCByZXByZXNlbnRhdGlvbiApO1xuXG4gICAgLy8gQWRkIHRoZSBncmlkLlxuICAgIGNvbnN0IGdyaWQgPSBuZXcgR3JpZCggcmVwcmVzZW50YXRpb24uYm91bmRzLmRpbGF0ZWQoIC1CT1JERVJfTElORV9XSURUSCApLCBVTklUX0xFTkdUSCwge1xuICAgICAgbGluZURhc2g6IFsgMCwgMywgMSwgMCBdLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snXG4gICAgfSApO1xuICAgIHJlcHJlc2VudGF0aW9uLmFkZENoaWxkKCBncmlkICk7XG5cbiAgICAvLyBNb3ZlIHRoaXMgbm9kZSBhcyB0aGUgbW9kZWwgcmVwcmVzZW50YXRpb24gbW92ZXNcbiAgICBjb25zdCB1cGRhdGVQb3NpdGlvbiA9IHBvc2l0aW9uID0+IHsgdGhpcy5sZWZ0VG9wID0gcG9zaXRpb247IH07XG4gICAgbW92YWJsZVNoYXBlLnBvc2l0aW9uUHJvcGVydHkubGluayggdXBkYXRlUG9zaXRpb24gKTtcblxuICAgIC8vIEJlY2F1c2UgYSBjb21wb3NpdGUgc2hhcGUgaXMgb2Z0ZW4gdXNlZCB0byBkZXBpY3QgdGhlIG92ZXJhbGwgc2hhcGUgd2hlbiBhIHNoYXBlIGlzIG9uIHRoZSBwbGFjZW1lbnQgYm9hcmQsIHRoaXNcbiAgICAvLyBlbGVtZW50IG1heSBiZWNvbWUgaW52aXNpYmxlIHVubGVzcyBpdCBpcyB1c2VyIGNvbnRyb2xsZWQsIGFuaW1hdGluZywgb3IgZmFkaW5nLlxuICAgIGNvbnN0IHZpc2libGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFtcbiAgICAgICAgbW92YWJsZVNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHksXG4gICAgICAgIG1vdmFibGVTaGFwZS5hbmltYXRpbmdQcm9wZXJ0eSxcbiAgICAgICAgbW92YWJsZVNoYXBlLmZhZGVQcm9wb3J0aW9uUHJvcGVydHksXG4gICAgICAgIG1vdmFibGVTaGFwZS5pbnZpc2libGVXaGVuU3RpbGxQcm9wZXJ0eSBdLFxuICAgICAgKCB1c2VyQ29udHJvbGxlZCwgYW5pbWF0aW5nLCBmYWRlUHJvcG9ydGlvbiwgaW52aXNpYmxlV2hlblN0aWxsICkgPT4gdXNlckNvbnRyb2xsZWQgfHwgYW5pbWF0aW5nIHx8IGZhZGVQcm9wb3J0aW9uID4gMCB8fCAhaW52aXNpYmxlV2hlblN0aWxsICk7XG5cbiAgICAvLyBPcGFjaXR5IGlzIGFsc28gYSBkZXJpdmVkIHByb3BlcnR5LCByYW5nZSBpcyAwIHRvIDEuXG4gICAgY29uc3Qgb3BhY2l0eVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xuICAgICAgICBtb3ZhYmxlU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eSxcbiAgICAgICAgbW92YWJsZVNoYXBlLmFuaW1hdGluZ1Byb3BlcnR5LFxuICAgICAgICBtb3ZhYmxlU2hhcGUuZmFkZVByb3BvcnRpb25Qcm9wZXJ0eSBdLFxuICAgICAgKCB1c2VyQ29udHJvbGxlZCwgYW5pbWF0aW5nLCBmYWRlUHJvcG9ydGlvbiApID0+IHtcbiAgICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCB8fCBhbmltYXRpbmcgKSB7XG5cbiAgICAgICAgICAvLyBUaGUgc2hhcGUgaXMgZWl0aGVyIGJlaW5nIGRyYWdnZWQgYnkgdGhlIHVzZXIgb3IgaXMgbW92aW5nIHRvIGEgcG9zaXRpb24sIHNvIHNob3VsZCBiZSBmdWxseSBvcGFxdWUuXG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGZhZGVQcm9wb3J0aW9uID4gMCApIHtcbiAgICAgICAgICAvLyBUaGUgc2hhcGUgaXMgZmFkaW5nIGF3YXkuXG4gICAgICAgICAgcmV0dXJuIDEgLSBmYWRlUHJvcG9ydGlvbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBUaGUgc2hhcGUgaXMgbm90IGNvbnRyb2xsZWQgYnkgdGhlIHVzZXIsIGFuaW1hdGVkLCBvciBmYWRpbmcsIHNvIGl0IGlzIG1vc3QgbGlrZWx5IHBsYWNlZCBvbiB0aGUgYm9hcmQuXG4gICAgICAgICAgLy8gSWYgaXQgaXMgdmlzaWJsZSwgaXQgd2lsbCBiZSB0cmFuc2x1Y2VudCwgc2luY2Ugc29tZSBvZiB0aGUgZ2FtZXMgdXNlIHNoYXBlcyBpbiB0aGlzIHN0YXRlIHRvIHBsYWNlIG92ZXJcbiAgICAgICAgICAvLyBvdGhlciBzaGFwZXMgZm9yIGNvbXBhcmF0aXZlIHB1cnBvc2VzLlxuICAgICAgICAgIHJldHVybiBPUEFDSVRZX09GX1RSQU5TTFVDRU5UX1NIQVBFUztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICBvcGFjaXR5UHJvcGVydHkubGluayggb3BhY2l0eSA9PiB7XG4gICAgICByb290Tm9kZS5vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICB9ICk7XG5cbiAgICB2aXNpYmxlUHJvcGVydHkubGluayggdmlzaWJsZSA9PiB7XG4gICAgICByb290Tm9kZS52aXNpYmxlID0gdmlzaWJsZTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBzaGFkb3dWaXNpYmlsaXR5UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxuICAgICAgWyBtb3ZhYmxlU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eSwgbW92YWJsZVNoYXBlLmFuaW1hdGluZ1Byb3BlcnR5IF0sXG4gICAgICAoIHVzZXJDb250cm9sbGVkLCBhbmltYXRpbmcgKSA9PiB1c2VyQ29udHJvbGxlZCB8fCBhbmltYXRpbmcgKTtcblxuICAgIHNoYWRvd1Zpc2liaWxpdHlQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBzaGFkb3csICd2aXNpYmxlJyApO1xuXG4gICAgLy8gVG8gYXZvaWQgY2VydGFpbiBjb21wbGljYXRpb25zLCB0aGlzIG5vZGUgc2hvdWxkIG5vdCBiZSBwaWNrYWJsZSBpZiBpdCBpcyBhbmltYXRpbmcgb3IgZmFkaW5nLlxuICAgIGNvbnN0IHVwZGF0ZVBpY2thYmlsaXR5ID0gKCkgPT4ge1xuICAgICAgc2VsZi5waWNrYWJsZSA9ICFtb3ZhYmxlU2hhcGUuYW5pbWF0aW5nUHJvcGVydHkuZ2V0KCkgJiYgbW92YWJsZVNoYXBlLmZhZGVQcm9wb3J0aW9uUHJvcGVydHkuZ2V0KCkgPT09IDA7XG4gICAgfTtcbiAgICBtb3ZhYmxlU2hhcGUuYW5pbWF0aW5nUHJvcGVydHkubGluayggdXBkYXRlUGlja2FiaWxpdHkgKTtcbiAgICBtb3ZhYmxlU2hhcGUuZmFkZVByb3BvcnRpb25Qcm9wZXJ0eS5saW5rKCB1cGRhdGVQaWNrYWJpbGl0eSApO1xuXG4gICAgLy8gQWRqdXN0IHRoZSBkcmFnIGJvdW5kcyB0byBjb21wZW5zYXRlIGZvciB0aGUgc2hhcGUgdGhhdCB0aGF0IHRoZSBlbnRpcmUgc2hhcGUgd2lsbCBzdGF5IGluIGJvdW5kcy5cbiAgICBjb25zdCBzaGFwZURyYWdCb3VuZHMgPSBuZXcgQm91bmRzMihcbiAgICAgIGRyYWdCb3VuZHMubWluWCxcbiAgICAgIGRyYWdCb3VuZHMubWluWSxcbiAgICAgIGRyYWdCb3VuZHMubWF4WCAtIG1vdmFibGVTaGFwZS5zaGFwZS5ib3VuZHMud2lkdGgsXG4gICAgICBkcmFnQm91bmRzLm1heFkgLSBtb3ZhYmxlU2hhcGUuc2hhcGUuYm91bmRzLmhlaWdodFxuICAgICk7XG5cbiAgICAvLyBFbmNsb3NlIHRoZSBkcmFnIGJvdW5kcyBpbiBhIFByb3BlcnR5IHNvIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gdGhlIGRyYWcgaGFuZGxlci5cbiAgICBjb25zdCBkcmFnQm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHNoYXBlRHJhZ0JvdW5kcyApO1xuXG4gICAgLy8gQWRkIHRoZSBsaXN0ZW5lciB0aGF0IHdpbGwgYWxsb3cgdGhlIHVzZXIgdG8gZHJhZyB0aGUgc2hhcGUgYXJvdW5kLlxuICAgIGNvbnN0IGRyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcblxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogbW92YWJsZVNoYXBlLnBvc2l0aW9uUHJvcGVydHksXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSxcbiAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlLFxuXG4gICAgICBzdGFydDogKCkgPT4ge1xuICAgICAgICBtb3ZhYmxlU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcbiAgICAgIH0sXG5cbiAgICAgIGVuZDogKCkgPT4ge1xuICAgICAgICBtb3ZhYmxlU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XG4gICAgICB9XG4gICAgfSApO1xuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggZHJhZ0xpc3RlbmVyICk7XG5cbiAgICAvLyBAcHJpdmF0ZVxuICAgIHRoaXMuZGlzcG9zZVNoYXBlTm9kZSA9ICgpID0+IHtcbiAgICAgIG1vdmFibGVTaGFwZS5wb3NpdGlvblByb3BlcnR5LnVubGluayggdXBkYXRlUG9zaXRpb24gKTtcbiAgICAgIHZpc2libGVQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICBvcGFjaXR5UHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgc2hhZG93VmlzaWJpbGl0eVByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIG1vdmFibGVTaGFwZS5hbmltYXRpbmdQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZVBpY2thYmlsaXR5ICk7XG4gICAgICBtb3ZhYmxlU2hhcGUuZmFkZVByb3BvcnRpb25Qcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZVBpY2thYmlsaXR5ICk7XG4gICAgICByZXByZXNlbnRhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBzaGFkb3cuZGlzcG9zZSgpO1xuICAgICAgZ3JpZC5kaXNwb3NlKCk7XG4gICAgICBkcmFnTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogcmVsZWFzZSBtZW1vcnkgcmVmZXJlbmNlc1xuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZGlzcG9zZVNoYXBlTm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ1NoYXBlTm9kZScsIFNoYXBlTm9kZSApO1xuZXhwb3J0IGRlZmF1bHQgU2hhcGVOb2RlOyJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJWZWN0b3IyIiwiQ29sb3IiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiUGF0aCIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJHcmlkIiwiU0hBRE9XX0NPTE9SIiwiU0hBRE9XX09GRlNFVCIsIk9QQUNJVFlfT0ZfVFJBTlNMVUNFTlRfU0hBUEVTIiwiVU5JVF9MRU5HVEgiLCJVTklUX1NRVUFSRV9MRU5HVEgiLCJCT1JERVJfTElORV9XSURUSCIsIlNoYXBlTm9kZSIsImRpc3Bvc2UiLCJkaXNwb3NlU2hhcGVOb2RlIiwiY29uc3RydWN0b3IiLCJtb3ZhYmxlU2hhcGUiLCJkcmFnQm91bmRzIiwiY3Vyc29yIiwic2VsZiIsImNvbG9yIiwidG91Y2hBcmVhIiwic2hhcGUiLCJtb3VzZUFyZWEiLCJyb290Tm9kZSIsImFkZENoaWxkIiwic2hhZG93IiwiZmlsbCIsImxlZnRUb3AiLCJyZXByZXNlbnRhdGlvbiIsInN0cm9rZSIsInRvQ29sb3IiLCJjb2xvclV0aWxzRGFya2VyIiwiUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IiLCJsaW5lV2lkdGgiLCJsaW5lSm9pbiIsImdyaWQiLCJib3VuZHMiLCJkaWxhdGVkIiwibGluZURhc2giLCJ1cGRhdGVQb3NpdGlvbiIsInBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImxpbmsiLCJ2aXNpYmxlUHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwiYW5pbWF0aW5nUHJvcGVydHkiLCJmYWRlUHJvcG9ydGlvblByb3BlcnR5IiwiaW52aXNpYmxlV2hlblN0aWxsUHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZCIsImFuaW1hdGluZyIsImZhZGVQcm9wb3J0aW9uIiwiaW52aXNpYmxlV2hlblN0aWxsIiwib3BhY2l0eVByb3BlcnR5Iiwib3BhY2l0eSIsInZpc2libGUiLCJzaGFkb3dWaXNpYmlsaXR5UHJvcGVydHkiLCJsaW5rQXR0cmlidXRlIiwidXBkYXRlUGlja2FiaWxpdHkiLCJwaWNrYWJsZSIsImdldCIsInNoYXBlRHJhZ0JvdW5kcyIsIm1pblgiLCJtaW5ZIiwibWF4WCIsIndpZHRoIiwibWF4WSIsImhlaWdodCIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsImRyYWdMaXN0ZW5lciIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJzZXQiLCJlbmQiLCJhZGRJbnB1dExpc3RlbmVyIiwidW5saW5rIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EscUJBQXFCLHlDQUF5QztBQUNyRSxPQUFPQyxjQUFjLGtDQUFrQztBQUN2RCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxTQUFTQyxLQUFLLEVBQUVDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ3BGLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0Ms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