// Copyright 2014-2024, University of Colorado Boulder
/**
 * A Scenery node that can be clicked upon to create new movable shapes in the model.
 *
 * @author John Blanco
 */ import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, DragListener, Node, Path } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import MovableShape from '../model/MovableShape.js';
import Grid from './Grid.js';
// constants
const BORDER_LINE_WIDTH = 1;
let ShapeCreatorNode = class ShapeCreatorNode extends Node {
    /**
   * release memory references
   * @public
   */ dispose() {
        this.disposeShapeCreatorNode();
        super.dispose();
    }
    /**
   * @param {Shape} shape
   * @param {string|Color} color
   * @param {function(MovableShape)} addShapeToModel - A function for adding the created shape to the model
   * @param {Object} [options]
   */ constructor(shape, color, addShapeToModel, options){
        assert && assert(shape.bounds.minX === 0 && shape.bounds.minY === 0, 'Error: Shape is expected to be located at 0, 0');
        super({
            cursor: 'pointer'
        });
        options = merge({
            // Allow input to continue after the shape creator node goes invisible.
            interruptSubtreeOnInvisible: false,
            // Spacing of the grid, if any, that should be shown on the creator node.  Null indicates no grid.
            gridSpacing: null,
            // Max number of shapes that can be created by this node.
            creationLimit: Number.POSITIVE_INFINITY,
            // Drag bounds for the created shapes.
            shapeDragBounds: Bounds2.EVERYTHING,
            // This is a node that is or will be somewhere up the scene graph tree from this ShapeCreatorNode, doesn't move,
            // and whose parent has the coordinate frame needed to do the appropriate transformations when the a drag takes
            // place on this ShapeCreatorNode. This is needed in cases where the ShapeCreatorNode can be moved while a drag
            // of a created node is still in progress.  This can occur when the ShapeCreatorNode is placed on a carousel and
            // the sim is being used in a multi-touch environment.  See https://github.com/phetsims/area-builder/issues/95 for
            // more information.
            nonMovingAncestor: null
        }, options);
        // parameter check
        if (options.creationLimit < Number.POSITIVE_INFINITY && (shape.bounds.width !== AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH || shape.bounds.height !== AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH)) {
            // The ability to set a creation limit ONLY works for unit squares.  The reason for this is that non-unit shapes
            // are generally decomposed into unit squares when added to the placement board, so it's hard to track when they
            // get returned to their origin.  It would be possible to do this, but the requirements of the sim at the time of
            // this writing make it unnecessary.  So, if you're hitting this exception, the code may need to be revamped to
            // support creation limits for shapes that are not unit squares.
            throw new Error('Creation limit is only supported for unit squares.');
        }
        // Create the node that the user will click upon to add a model element to the view.
        const representation = new Path(shape, {
            fill: color,
            stroke: Color.toColor(color).colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR),
            lineWidth: BORDER_LINE_WIDTH,
            lineJoin: 'round'
        });
        this.addChild(representation);
        // Add grid if specified.
        if (options.gridSpacing) {
            const gridNode = new Grid(representation.bounds.dilated(-BORDER_LINE_WIDTH), options.gridSpacing, {
                lineDash: [
                    0,
                    3,
                    1,
                    0
                ],
                stroke: 'black'
            });
            this.addChild(gridNode);
        }
        const createdCountProperty = new Property(0); // Used to track the number of shapes created and not returned.
        // If the created count exceeds the max, make this node invisible (which also makes it unusable).
        createdCountProperty.link((numCreated)=>{
            this.visible = numCreated < options.creationLimit;
        });
        // variables used by the drag handler
        let parentScreenView = null; // needed for coordinate transforms
        let movableShape;
        let dragOffset;
        // Adjust the drag bounds to compensate for the shape that that the entire shape will stay in bounds.
        const shapeDragBounds = options.shapeDragBounds.copy();
        shapeDragBounds.setMaxX(shapeDragBounds.maxX - shape.bounds.width);
        shapeDragBounds.setMaxY(shapeDragBounds.maxY - shape.bounds.height);
        // Enclose the drag bounds in a Property so that it can be used in the drag handler.
        const dragBoundsProperty = new Property(shapeDragBounds);
        // Add the listener that will allow the user to click on this and create a new shape, then position it in the model.
        const dragListener = new DragListener({
            dragBoundsProperty: dragBoundsProperty,
            targetNode: options.nonMovingAncestor,
            // Allow moving a finger (touch) across this node to interact with it
            allowTouchSnag: true,
            start: (event)=>{
                if (!parentScreenView) {
                    // Find the parent screen view by moving up the scene graph.
                    let testNode = this.parents[0];
                    while(testNode !== null){
                        if (testNode instanceof ScreenView) {
                            parentScreenView = testNode;
                            break;
                        }
                        testNode = testNode.parents[0]; // move up the scene graph by one level
                    }
                    assert && assert(parentScreenView, 'unable to find parent screen view');
                }
                // Determine the initial position of the new element as a function of the event position and this node's bounds.
                const upperLeftCornerGlobal = this.parentToGlobalPoint(this.leftTop);
                dragOffset = upperLeftCornerGlobal.minus(event.pointer.point);
                const initialPosition = parentScreenView.globalToLocalPoint(event.pointer.point.plus(dragOffset));
                // Create and add the new model element.
                movableShape = new MovableShape(shape, color, initialPosition);
                movableShape.userControlledProperty.set(true);
                addShapeToModel(movableShape);
                // If the creation count is limited, adjust the value and monitor the created shape for if/when it is returned.
                if (options.creationLimit < Number.POSITIVE_INFINITY) {
                    // Use an IIFE to keep a reference of the movable shape in a closure.
                    (()=>{
                        createdCountProperty.value++;
                        const localRefToMovableShape = movableShape;
                        localRefToMovableShape.returnedToOriginEmitter.addListener(function returnedToOriginListener() {
                            if (!localRefToMovableShape.userControlledProperty.get()) {
                                // The shape has been returned to its origin.
                                createdCountProperty.value--;
                                localRefToMovableShape.returnedToOriginEmitter.removeListener(returnedToOriginListener);
                            }
                        });
                    })();
                }
            },
            drag: (event)=>{
                assert && assert(movableShape, 'no movable shape for drag');
                movableShape.positionProperty.set(parentScreenView.globalToLocalPoint(event.pointer.point.plus(dragOffset)));
            },
            end: ()=>{
                movableShape.userControlledProperty.set(false);
                movableShape = null;
            }
        });
        this.addInputListener(dragListener);
        // Pass options through to parent.
        this.mutate(options);
        // @private
        this.disposeShapeCreatorNode = ()=>{
            dragListener.dispose();
        };
    }
};
areaBuilder.register('ShapeCreatorNode', ShapeCreatorNode);
export default ShapeCreatorNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vdmlldy9TaGFwZUNyZWF0b3JOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgU2NlbmVyeSBub2RlIHRoYXQgY2FuIGJlIGNsaWNrZWQgdXBvbiB0byBjcmVhdGUgbmV3IG1vdmFibGUgc2hhcGVzIGluIHRoZSBtb2RlbC5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCB7IENvbG9yLCBEcmFnTGlzdGVuZXIsIE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi9BcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5qcyc7XG5pbXBvcnQgTW92YWJsZVNoYXBlIGZyb20gJy4uL21vZGVsL01vdmFibGVTaGFwZS5qcyc7XG5pbXBvcnQgR3JpZCBmcm9tICcuL0dyaWQuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IEJPUkRFUl9MSU5FX1dJRFRIID0gMTtcblxuY2xhc3MgU2hhcGVDcmVhdG9yTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgKiBAcGFyYW0ge3N0cmluZ3xDb2xvcn0gY29sb3JcbiAgICogQHBhcmFtIHtmdW5jdGlvbihNb3ZhYmxlU2hhcGUpfSBhZGRTaGFwZVRvTW9kZWwgLSBBIGZ1bmN0aW9uIGZvciBhZGRpbmcgdGhlIGNyZWF0ZWQgc2hhcGUgdG8gdGhlIG1vZGVsXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBzaGFwZSwgY29sb3IsIGFkZFNoYXBlVG9Nb2RlbCwgb3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaGFwZS5ib3VuZHMubWluWCA9PT0gMCAmJiBzaGFwZS5ib3VuZHMubWluWSA9PT0gMCwgJ0Vycm9yOiBTaGFwZSBpcyBleHBlY3RlZCB0byBiZSBsb2NhdGVkIGF0IDAsIDAnICk7XG4gICAgc3VwZXIoIHsgY3Vyc29yOiAncG9pbnRlcicgfSApO1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG5cbiAgICAgIC8vIEFsbG93IGlucHV0IHRvIGNvbnRpbnVlIGFmdGVyIHRoZSBzaGFwZSBjcmVhdG9yIG5vZGUgZ29lcyBpbnZpc2libGUuXG4gICAgICBpbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGU6IGZhbHNlLFxuXG4gICAgICAvLyBTcGFjaW5nIG9mIHRoZSBncmlkLCBpZiBhbnksIHRoYXQgc2hvdWxkIGJlIHNob3duIG9uIHRoZSBjcmVhdG9yIG5vZGUuICBOdWxsIGluZGljYXRlcyBubyBncmlkLlxuICAgICAgZ3JpZFNwYWNpbmc6IG51bGwsXG5cbiAgICAgIC8vIE1heCBudW1iZXIgb2Ygc2hhcGVzIHRoYXQgY2FuIGJlIGNyZWF0ZWQgYnkgdGhpcyBub2RlLlxuICAgICAgY3JlYXRpb25MaW1pdDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuXG4gICAgICAvLyBEcmFnIGJvdW5kcyBmb3IgdGhlIGNyZWF0ZWQgc2hhcGVzLlxuICAgICAgc2hhcGVEcmFnQm91bmRzOiBCb3VuZHMyLkVWRVJZVEhJTkcsXG5cbiAgICAgIC8vIFRoaXMgaXMgYSBub2RlIHRoYXQgaXMgb3Igd2lsbCBiZSBzb21ld2hlcmUgdXAgdGhlIHNjZW5lIGdyYXBoIHRyZWUgZnJvbSB0aGlzIFNoYXBlQ3JlYXRvck5vZGUsIGRvZXNuJ3QgbW92ZSxcbiAgICAgIC8vIGFuZCB3aG9zZSBwYXJlbnQgaGFzIHRoZSBjb29yZGluYXRlIGZyYW1lIG5lZWRlZCB0byBkbyB0aGUgYXBwcm9wcmlhdGUgdHJhbnNmb3JtYXRpb25zIHdoZW4gdGhlIGEgZHJhZyB0YWtlc1xuICAgICAgLy8gcGxhY2Ugb24gdGhpcyBTaGFwZUNyZWF0b3JOb2RlLiBUaGlzIGlzIG5lZWRlZCBpbiBjYXNlcyB3aGVyZSB0aGUgU2hhcGVDcmVhdG9yTm9kZSBjYW4gYmUgbW92ZWQgd2hpbGUgYSBkcmFnXG4gICAgICAvLyBvZiBhIGNyZWF0ZWQgbm9kZSBpcyBzdGlsbCBpbiBwcm9ncmVzcy4gIFRoaXMgY2FuIG9jY3VyIHdoZW4gdGhlIFNoYXBlQ3JlYXRvck5vZGUgaXMgcGxhY2VkIG9uIGEgY2Fyb3VzZWwgYW5kXG4gICAgICAvLyB0aGUgc2ltIGlzIGJlaW5nIHVzZWQgaW4gYSBtdWx0aS10b3VjaCBlbnZpcm9ubWVudC4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXJlYS1idWlsZGVyL2lzc3Vlcy85NSBmb3JcbiAgICAgIC8vIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICBub25Nb3ZpbmdBbmNlc3RvcjogbnVsbFxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIC8vIHBhcmFtZXRlciBjaGVja1xuICAgIGlmICggb3B0aW9ucy5jcmVhdGlvbkxpbWl0IDwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICYmXG4gICAgICAgICAoIHNoYXBlLmJvdW5kcy53aWR0aCAhPT0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuVU5JVF9TUVVBUkVfTEVOR1RIIHx8XG4gICAgICAgICAgIHNoYXBlLmJvdW5kcy5oZWlnaHQgIT09IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlVOSVRfU1FVQVJFX0xFTkdUSCApICkge1xuXG4gICAgICAvLyBUaGUgYWJpbGl0eSB0byBzZXQgYSBjcmVhdGlvbiBsaW1pdCBPTkxZIHdvcmtzIGZvciB1bml0IHNxdWFyZXMuICBUaGUgcmVhc29uIGZvciB0aGlzIGlzIHRoYXQgbm9uLXVuaXQgc2hhcGVzXG4gICAgICAvLyBhcmUgZ2VuZXJhbGx5IGRlY29tcG9zZWQgaW50byB1bml0IHNxdWFyZXMgd2hlbiBhZGRlZCB0byB0aGUgcGxhY2VtZW50IGJvYXJkLCBzbyBpdCdzIGhhcmQgdG8gdHJhY2sgd2hlbiB0aGV5XG4gICAgICAvLyBnZXQgcmV0dXJuZWQgdG8gdGhlaXIgb3JpZ2luLiAgSXQgd291bGQgYmUgcG9zc2libGUgdG8gZG8gdGhpcywgYnV0IHRoZSByZXF1aXJlbWVudHMgb2YgdGhlIHNpbSBhdCB0aGUgdGltZSBvZlxuICAgICAgLy8gdGhpcyB3cml0aW5nIG1ha2UgaXQgdW5uZWNlc3NhcnkuICBTbywgaWYgeW91J3JlIGhpdHRpbmcgdGhpcyBleGNlcHRpb24sIHRoZSBjb2RlIG1heSBuZWVkIHRvIGJlIHJldmFtcGVkIHRvXG4gICAgICAvLyBzdXBwb3J0IGNyZWF0aW9uIGxpbWl0cyBmb3Igc2hhcGVzIHRoYXQgYXJlIG5vdCB1bml0IHNxdWFyZXMuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdDcmVhdGlvbiBsaW1pdCBpcyBvbmx5IHN1cHBvcnRlZCBmb3IgdW5pdCBzcXVhcmVzLicgKTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5vZGUgdGhhdCB0aGUgdXNlciB3aWxsIGNsaWNrIHVwb24gdG8gYWRkIGEgbW9kZWwgZWxlbWVudCB0byB0aGUgdmlldy5cbiAgICBjb25zdCByZXByZXNlbnRhdGlvbiA9IG5ldyBQYXRoKCBzaGFwZSwge1xuICAgICAgZmlsbDogY29sb3IsXG4gICAgICBzdHJva2U6IENvbG9yLnRvQ29sb3IoIGNvbG9yICkuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKSxcbiAgICAgIGxpbmVXaWR0aDogQk9SREVSX0xJTkVfV0lEVEgsXG4gICAgICBsaW5lSm9pbjogJ3JvdW5kJ1xuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCByZXByZXNlbnRhdGlvbiApO1xuXG4gICAgLy8gQWRkIGdyaWQgaWYgc3BlY2lmaWVkLlxuICAgIGlmICggb3B0aW9ucy5ncmlkU3BhY2luZyApIHtcbiAgICAgIGNvbnN0IGdyaWROb2RlID0gbmV3IEdyaWQoIHJlcHJlc2VudGF0aW9uLmJvdW5kcy5kaWxhdGVkKCAtQk9SREVSX0xJTkVfV0lEVEggKSwgb3B0aW9ucy5ncmlkU3BhY2luZywge1xuICAgICAgICBsaW5lRGFzaDogWyAwLCAzLCAxLCAwIF0sXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJ1xuICAgICAgfSApO1xuICAgICAgdGhpcy5hZGRDaGlsZCggZ3JpZE5vZGUgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjcmVhdGVkQ291bnRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCApOyAvLyBVc2VkIHRvIHRyYWNrIHRoZSBudW1iZXIgb2Ygc2hhcGVzIGNyZWF0ZWQgYW5kIG5vdCByZXR1cm5lZC5cblxuICAgIC8vIElmIHRoZSBjcmVhdGVkIGNvdW50IGV4Y2VlZHMgdGhlIG1heCwgbWFrZSB0aGlzIG5vZGUgaW52aXNpYmxlICh3aGljaCBhbHNvIG1ha2VzIGl0IHVudXNhYmxlKS5cbiAgICBjcmVhdGVkQ291bnRQcm9wZXJ0eS5saW5rKCBudW1DcmVhdGVkID0+IHtcbiAgICAgIHRoaXMudmlzaWJsZSA9IG51bUNyZWF0ZWQgPCBvcHRpb25zLmNyZWF0aW9uTGltaXQ7XG4gICAgfSApO1xuXG4gICAgLy8gdmFyaWFibGVzIHVzZWQgYnkgdGhlIGRyYWcgaGFuZGxlclxuICAgIGxldCBwYXJlbnRTY3JlZW5WaWV3ID0gbnVsbDsgLy8gbmVlZGVkIGZvciBjb29yZGluYXRlIHRyYW5zZm9ybXNcbiAgICBsZXQgbW92YWJsZVNoYXBlO1xuICAgIGxldCBkcmFnT2Zmc2V0O1xuXG4gICAgLy8gQWRqdXN0IHRoZSBkcmFnIGJvdW5kcyB0byBjb21wZW5zYXRlIGZvciB0aGUgc2hhcGUgdGhhdCB0aGF0IHRoZSBlbnRpcmUgc2hhcGUgd2lsbCBzdGF5IGluIGJvdW5kcy5cbiAgICBjb25zdCBzaGFwZURyYWdCb3VuZHMgPSBvcHRpb25zLnNoYXBlRHJhZ0JvdW5kcy5jb3B5KCk7XG4gICAgc2hhcGVEcmFnQm91bmRzLnNldE1heFgoIHNoYXBlRHJhZ0JvdW5kcy5tYXhYIC0gc2hhcGUuYm91bmRzLndpZHRoICk7XG4gICAgc2hhcGVEcmFnQm91bmRzLnNldE1heFkoIHNoYXBlRHJhZ0JvdW5kcy5tYXhZIC0gc2hhcGUuYm91bmRzLmhlaWdodCApO1xuXG4gICAgLy8gRW5jbG9zZSB0aGUgZHJhZyBib3VuZHMgaW4gYSBQcm9wZXJ0eSBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIGluIHRoZSBkcmFnIGhhbmRsZXIuXG4gICAgY29uc3QgZHJhZ0JvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBzaGFwZURyYWdCb3VuZHMgKTtcblxuICAgIC8vIEFkZCB0aGUgbGlzdGVuZXIgdGhhdCB3aWxsIGFsbG93IHRoZSB1c2VyIHRvIGNsaWNrIG9uIHRoaXMgYW5kIGNyZWF0ZSBhIG5ldyBzaGFwZSwgdGhlbiBwb3NpdGlvbiBpdCBpbiB0aGUgbW9kZWwuXG4gICAgY29uc3QgZHJhZ0xpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xuXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSxcbiAgICAgIHRhcmdldE5vZGU6IG9wdGlvbnMubm9uTW92aW5nQW5jZXN0b3IsXG5cbiAgICAgIC8vIEFsbG93IG1vdmluZyBhIGZpbmdlciAodG91Y2gpIGFjcm9zcyB0aGlzIG5vZGUgdG8gaW50ZXJhY3Qgd2l0aCBpdFxuICAgICAgYWxsb3dUb3VjaFNuYWc6IHRydWUsXG5cbiAgICAgIHN0YXJ0OiBldmVudCA9PiB7XG4gICAgICAgIGlmICggIXBhcmVudFNjcmVlblZpZXcgKSB7XG5cbiAgICAgICAgICAvLyBGaW5kIHRoZSBwYXJlbnQgc2NyZWVuIHZpZXcgYnkgbW92aW5nIHVwIHRoZSBzY2VuZSBncmFwaC5cbiAgICAgICAgICBsZXQgdGVzdE5vZGUgPSB0aGlzLnBhcmVudHNbIDAgXTtcbiAgICAgICAgICB3aGlsZSAoIHRlc3ROb2RlICE9PSBudWxsICkge1xuICAgICAgICAgICAgaWYgKCB0ZXN0Tm9kZSBpbnN0YW5jZW9mIFNjcmVlblZpZXcgKSB7XG4gICAgICAgICAgICAgIHBhcmVudFNjcmVlblZpZXcgPSB0ZXN0Tm9kZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZXN0Tm9kZSA9IHRlc3ROb2RlLnBhcmVudHNbIDAgXTsgLy8gbW92ZSB1cCB0aGUgc2NlbmUgZ3JhcGggYnkgb25lIGxldmVsXG4gICAgICAgICAgfVxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcmVudFNjcmVlblZpZXcsICd1bmFibGUgdG8gZmluZCBwYXJlbnQgc2NyZWVuIHZpZXcnICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIGluaXRpYWwgcG9zaXRpb24gb2YgdGhlIG5ldyBlbGVtZW50IGFzIGEgZnVuY3Rpb24gb2YgdGhlIGV2ZW50IHBvc2l0aW9uIGFuZCB0aGlzIG5vZGUncyBib3VuZHMuXG4gICAgICAgIGNvbnN0IHVwcGVyTGVmdENvcm5lckdsb2JhbCA9IHRoaXMucGFyZW50VG9HbG9iYWxQb2ludCggdGhpcy5sZWZ0VG9wICk7XG4gICAgICAgIGRyYWdPZmZzZXQgPSB1cHBlckxlZnRDb3JuZXJHbG9iYWwubWludXMoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcbiAgICAgICAgY29uc3QgaW5pdGlhbFBvc2l0aW9uID0gcGFyZW50U2NyZWVuVmlldy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQucGx1cyggZHJhZ09mZnNldCApICk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIG5ldyBtb2RlbCBlbGVtZW50LlxuICAgICAgICBtb3ZhYmxlU2hhcGUgPSBuZXcgTW92YWJsZVNoYXBlKCBzaGFwZSwgY29sb3IsIGluaXRpYWxQb3NpdGlvbiApO1xuICAgICAgICBtb3ZhYmxlU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcbiAgICAgICAgYWRkU2hhcGVUb01vZGVsKCBtb3ZhYmxlU2hhcGUgKTtcblxuICAgICAgICAvLyBJZiB0aGUgY3JlYXRpb24gY291bnQgaXMgbGltaXRlZCwgYWRqdXN0IHRoZSB2YWx1ZSBhbmQgbW9uaXRvciB0aGUgY3JlYXRlZCBzaGFwZSBmb3IgaWYvd2hlbiBpdCBpcyByZXR1cm5lZC5cbiAgICAgICAgaWYgKCBvcHRpb25zLmNyZWF0aW9uTGltaXQgPCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKSB7XG5cbiAgICAgICAgICAvLyBVc2UgYW4gSUlGRSB0byBrZWVwIGEgcmVmZXJlbmNlIG9mIHRoZSBtb3ZhYmxlIHNoYXBlIGluIGEgY2xvc3VyZS5cbiAgICAgICAgICAoICgpID0+IHtcbiAgICAgICAgICAgIGNyZWF0ZWRDb3VudFByb3BlcnR5LnZhbHVlKys7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFJlZlRvTW92YWJsZVNoYXBlID0gbW92YWJsZVNoYXBlO1xuICAgICAgICAgICAgbG9jYWxSZWZUb01vdmFibGVTaGFwZS5yZXR1cm5lZFRvT3JpZ2luRW1pdHRlci5hZGRMaXN0ZW5lciggZnVuY3Rpb24gcmV0dXJuZWRUb09yaWdpbkxpc3RlbmVyKCkge1xuICAgICAgICAgICAgICBpZiAoICFsb2NhbFJlZlRvTW92YWJsZVNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHkuZ2V0KCkgKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgc2hhcGUgaGFzIGJlZW4gcmV0dXJuZWQgdG8gaXRzIG9yaWdpbi5cbiAgICAgICAgICAgICAgICBjcmVhdGVkQ291bnRQcm9wZXJ0eS52YWx1ZS0tO1xuICAgICAgICAgICAgICAgIGxvY2FsUmVmVG9Nb3ZhYmxlU2hhcGUucmV0dXJuZWRUb09yaWdpbkVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHJldHVybmVkVG9PcmlnaW5MaXN0ZW5lciApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfSApKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGRyYWc6IGV2ZW50ID0+IHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbW92YWJsZVNoYXBlLCAnbm8gbW92YWJsZSBzaGFwZSBmb3IgZHJhZycgKTtcbiAgICAgICAgbW92YWJsZVNoYXBlLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBwYXJlbnRTY3JlZW5WaWV3Lmdsb2JhbFRvTG9jYWxQb2ludCggZXZlbnQucG9pbnRlci5wb2ludC5wbHVzKCBkcmFnT2Zmc2V0ICkgKSApO1xuICAgICAgfSxcblxuICAgICAgZW5kOiAoKSA9PiB7XG4gICAgICAgIG1vdmFibGVTaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcbiAgICAgICAgbW92YWJsZVNoYXBlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBkcmFnTGlzdGVuZXIgKTtcblxuICAgIC8vIFBhc3Mgb3B0aW9ucyB0aHJvdWdoIHRvIHBhcmVudC5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuXG4gICAgLy8gQHByaXZhdGVcbiAgICB0aGlzLmRpc3Bvc2VTaGFwZUNyZWF0b3JOb2RlID0gKCkgPT4ge1xuICAgICAgZHJhZ0xpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIHJlbGVhc2UgbWVtb3J5IHJlZmVyZW5jZXNcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmRpc3Bvc2VTaGFwZUNyZWF0b3JOb2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnU2hhcGVDcmVhdG9yTm9kZScsIFNoYXBlQ3JlYXRvck5vZGUgKTtcbmV4cG9ydCBkZWZhdWx0IFNoYXBlQ3JlYXRvck5vZGU7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiQm91bmRzMiIsIlNjcmVlblZpZXciLCJtZXJnZSIsIkNvbG9yIiwiRHJhZ0xpc3RlbmVyIiwiTm9kZSIsIlBhdGgiLCJhcmVhQnVpbGRlciIsIkFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIiwiTW92YWJsZVNoYXBlIiwiR3JpZCIsIkJPUkRFUl9MSU5FX1dJRFRIIiwiU2hhcGVDcmVhdG9yTm9kZSIsImRpc3Bvc2UiLCJkaXNwb3NlU2hhcGVDcmVhdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwic2hhcGUiLCJjb2xvciIsImFkZFNoYXBlVG9Nb2RlbCIsIm9wdGlvbnMiLCJhc3NlcnQiLCJib3VuZHMiLCJtaW5YIiwibWluWSIsImN1cnNvciIsImludGVycnVwdFN1YnRyZWVPbkludmlzaWJsZSIsImdyaWRTcGFjaW5nIiwiY3JlYXRpb25MaW1pdCIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwic2hhcGVEcmFnQm91bmRzIiwiRVZFUllUSElORyIsIm5vbk1vdmluZ0FuY2VzdG9yIiwid2lkdGgiLCJVTklUX1NRVUFSRV9MRU5HVEgiLCJoZWlnaHQiLCJFcnJvciIsInJlcHJlc2VudGF0aW9uIiwiZmlsbCIsInN0cm9rZSIsInRvQ29sb3IiLCJjb2xvclV0aWxzRGFya2VyIiwiUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IiLCJsaW5lV2lkdGgiLCJsaW5lSm9pbiIsImFkZENoaWxkIiwiZ3JpZE5vZGUiLCJkaWxhdGVkIiwibGluZURhc2giLCJjcmVhdGVkQ291bnRQcm9wZXJ0eSIsImxpbmsiLCJudW1DcmVhdGVkIiwidmlzaWJsZSIsInBhcmVudFNjcmVlblZpZXciLCJtb3ZhYmxlU2hhcGUiLCJkcmFnT2Zmc2V0IiwiY29weSIsInNldE1heFgiLCJtYXhYIiwic2V0TWF4WSIsIm1heFkiLCJkcmFnQm91bmRzUHJvcGVydHkiLCJkcmFnTGlzdGVuZXIiLCJ0YXJnZXROb2RlIiwiYWxsb3dUb3VjaFNuYWciLCJzdGFydCIsImV2ZW50IiwidGVzdE5vZGUiLCJwYXJlbnRzIiwidXBwZXJMZWZ0Q29ybmVyR2xvYmFsIiwicGFyZW50VG9HbG9iYWxQb2ludCIsImxlZnRUb3AiLCJtaW51cyIsInBvaW50ZXIiLCJwb2ludCIsImluaXRpYWxQb3NpdGlvbiIsImdsb2JhbFRvTG9jYWxQb2ludCIsInBsdXMiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5Iiwic2V0IiwidmFsdWUiLCJsb2NhbFJlZlRvTW92YWJsZVNoYXBlIiwicmV0dXJuZWRUb09yaWdpbkVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInJldHVybmVkVG9PcmlnaW5MaXN0ZW5lciIsImdldCIsInJlbW92ZUxpc3RlbmVyIiwiZHJhZyIsInBvc2l0aW9uUHJvcGVydHkiLCJlbmQiLCJhZGRJbnB1dExpc3RlbmVyIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyxrQ0FBa0M7QUFDdkQsT0FBT0MsYUFBYSxnQ0FBZ0M7QUFDcEQsT0FBT0MsZ0JBQWdCLHFDQUFxQztBQUM1RCxPQUFPQyxXQUFXLG9DQUFvQztBQUN0RCxTQUFTQyxLQUFLLEVBQUVDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ3BGLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0MsZ0NBQWdDLG1DQUFtQztBQUMxRSxPQUFPQyxrQkFBa0IsMkJBQTJCO0FBQ3BELE9BQU9DLFVBQVUsWUFBWTtBQUU3QixZQUFZO0FBQ1os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