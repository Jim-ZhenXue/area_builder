// Copyright 2014-2022, University of Colorado Boulder
/**
 * A composite node that depicts a shape placement board, a bucket containing shapes to go on the board, an area and
 * perimeter readout, and an erase button.  These are consolidated together in this node to avoid code duplication.
 *
 * @author John Blanco
 */ import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import { Color, Node } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import ShapeCreatorNode from '../../common/view/ShapeCreatorNode.js';
import ShapeNode from '../../common/view/ShapeNode.js';
import ShapePlacementBoardNode from '../../common/view/ShapePlacementBoardNode.js';
import AreaAndPerimeterDisplay from './AreaAndPerimeterDisplay.js';
// constants
const SPACE_AROUND_SHAPE_PLACEMENT_BOARD = AreaBuilderSharedConstants.CONTROLS_INSET;
const IDENTITY_TRANSFORM = ModelViewTransform2.createIdentity();
const UNIT_SQUARE_LENGTH = AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH;
const UNIT_RECTANGLE_SHAPE = Shape.rect(0, 0, UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH);
const SHAPE_CREATOR_OFFSET_POSITIONS = [
    // Offsets used for initial position of shape, relative to bucket hole center.  Empirically determined.
    new Vector2(-20 - UNIT_SQUARE_LENGTH / 2, 0 - UNIT_SQUARE_LENGTH / 2),
    new Vector2(-10 - UNIT_SQUARE_LENGTH / 2, -2 - UNIT_SQUARE_LENGTH / 2),
    new Vector2(9 - UNIT_SQUARE_LENGTH / 2, 1 - UNIT_SQUARE_LENGTH / 2),
    new Vector2(18 - UNIT_SQUARE_LENGTH / 2, 3 - UNIT_SQUARE_LENGTH / 2),
    new Vector2(3 - UNIT_SQUARE_LENGTH / 2, 5 - UNIT_SQUARE_LENGTH / 2)
];
let ExploreNode = class ExploreNode extends Node {
    /**
   * @public
   */ reset() {
        this.areaAndPerimeterDisplay.reset();
    }
    /**
   * @param {ShapePlacementBoard} shapePlacementBoard
   * @param {function} addShapeToModel - Function for adding a newly created shape to the model.
   * @param {ObservableArrayDef} movableShapeList - The array that tracks the movable shapes.
   * @param {Bucket} bucket - Model of the bucket that is to be portrayed
   * @param {Object} [options]
   */ constructor(shapePlacementBoard, addShapeToModel, movableShapeList, bucket, options){
        options = merge({
            // drag bounds for the shapes that can go on the board
            shapeDragBounds: Bounds2.EVERYTHING,
            // An optional layer (scenery node) on which movable shapes will be placed.  Passing it in allows it to be
            // created outside this node, which supports some layering which is otherwise not possible.
            shapesLayer: null
        }, options);
        // Verify that the shape placement board is set up to handle a specific color, rather than all colors, since other
        // code below depends on this.
        assert && assert(shapePlacementBoard.colorHandled !== '*');
        const shapeColor = Color.toColor(shapePlacementBoard.colorHandled);
        super();
        // Create the nodes that will be used to layer things visually.
        const backLayer = new Node();
        this.addChild(backLayer);
        let movableShapesLayer;
        if (!options.shapesLayer) {
            movableShapesLayer = new Node({
                layerSplit: true
            }); // Force the moving shape into a separate layer for performance reasons.
            this.addChild(movableShapesLayer);
        } else {
            // Assume that this layer was added to the scene graph elsewhere, and doesn't need to be added here.
            movableShapesLayer = options.shapesLayer;
        }
        const bucketFrontLayer = new Node();
        this.addChild(bucketFrontLayer);
        const singleBoardControlsLayer = new Node();
        this.addChild(singleBoardControlsLayer);
        // Add the node that represents the shape placement board.  This is positioned based on this model position, and
        // all other nodes (such as the bucket) are positioned relative to this.
        const shapePlacementBoardNode = new ShapePlacementBoardNode(shapePlacementBoard);
        backLayer.addChild(shapePlacementBoardNode);
        // Add the area and perimeter display
        this.areaAndPerimeterDisplay = new AreaAndPerimeterDisplay(shapePlacementBoard.areaAndPerimeterProperty, shapeColor, shapeColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR), {
            centerX: shapePlacementBoardNode.centerX,
            bottom: shapePlacementBoardNode.top - SPACE_AROUND_SHAPE_PLACEMENT_BOARD
        });
        this.addChild(this.areaAndPerimeterDisplay);
        // Add the bucket view elements
        const bucketFront = new BucketFront(bucket, IDENTITY_TRANSFORM);
        bucketFrontLayer.addChild(bucketFront);
        const bucketHole = new BucketHole(bucket, IDENTITY_TRANSFORM);
        backLayer.addChild(bucketHole);
        // Add the shape creator nodes.  These must be added after the bucket hole for proper layering.
        SHAPE_CREATOR_OFFSET_POSITIONS.forEach((offset)=>{
            backLayer.addChild(new ShapeCreatorNode(UNIT_RECTANGLE_SHAPE, shapeColor, addShapeToModel, {
                left: bucketHole.centerX + offset.x,
                top: bucketHole.centerY + offset.y,
                shapeDragBounds: options.shapeDragBounds
            }));
        });
        // Add the button that allows the board to be cleared of all shapes.
        this.addChild(new EraserButton({
            right: bucketFront.right - 3,
            top: bucketFront.bottom + 5,
            touchAreaXDilation: 5,
            touchAreaYDilation: 5,
            listener: ()=>{
                shapePlacementBoard.releaseAllShapes('fade');
            }
        }));
        // Handle the comings and goings of movable shapes.
        movableShapeList.addItemAddedListener((addedShape)=>{
            if (addedShape.color.equals(shapeColor)) {
                // Create and add the view representation for this shape.
                const shapeNode = new ShapeNode(addedShape, options.shapeDragBounds);
                movableShapesLayer.addChild(shapeNode);
                // Move the shape to the front of this layer when grabbed by the user.
                addedShape.userControlledProperty.link((userControlled)=>{
                    if (userControlled) {
                        shapeNode.moveToFront();
                    }
                });
                // Add the removal listener for if and when this shape is removed from the model.
                movableShapeList.addItemRemovedListener(function removalListener(removedShape) {
                    if (removedShape === addedShape) {
                        movableShapesLayer.removeChild(shapeNode);
                        movableShapeList.removeItemRemovedListener(removalListener);
                        shapeNode.dispose();
                    }
                });
            }
        });
    }
};
areaBuilder.register('ExploreNode', ExploreNode);
export default ExploreNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9leHBsb3JlL3ZpZXcvRXhwbG9yZU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBjb21wb3NpdGUgbm9kZSB0aGF0IGRlcGljdHMgYSBzaGFwZSBwbGFjZW1lbnQgYm9hcmQsIGEgYnVja2V0IGNvbnRhaW5pbmcgc2hhcGVzIHRvIGdvIG9uIHRoZSBib2FyZCwgYW4gYXJlYSBhbmRcbiAqIHBlcmltZXRlciByZWFkb3V0LCBhbmQgYW4gZXJhc2UgYnV0dG9uLiAgVGhlc2UgYXJlIGNvbnNvbGlkYXRlZCB0b2dldGhlciBpbiB0aGlzIG5vZGUgdG8gYXZvaWQgY29kZSBkdXBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XG5pbXBvcnQgQnVja2V0RnJvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1Y2tldC9CdWNrZXRGcm9udC5qcyc7XG5pbXBvcnQgQnVja2V0SG9sZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnVja2V0L0J1Y2tldEhvbGUuanMnO1xuaW1wb3J0IEVyYXNlckJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9FcmFzZXJCdXR0b24uanMnO1xuaW1wb3J0IHsgQ29sb3IsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xuaW1wb3J0IFNoYXBlQ3JlYXRvck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2hhcGVDcmVhdG9yTm9kZS5qcyc7XG5pbXBvcnQgU2hhcGVOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NoYXBlTm9kZS5qcyc7XG5pbXBvcnQgU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUuanMnO1xuaW1wb3J0IEFyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5IGZyb20gJy4vQXJlYUFuZFBlcmltZXRlckRpc3BsYXkuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFNQQUNFX0FST1VORF9TSEFQRV9QTEFDRU1FTlRfQk9BUkQgPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5DT05UUk9MU19JTlNFVDtcbmNvbnN0IElERU5USVRZX1RSQU5TRk9STSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlSWRlbnRpdHkoKTtcbmNvbnN0IFVOSVRfU1FVQVJFX0xFTkdUSCA9IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlVOSVRfU1FVQVJFX0xFTkdUSDtcbmNvbnN0IFVOSVRfUkVDVEFOR0xFX1NIQVBFID0gU2hhcGUucmVjdCggMCwgMCwgVU5JVF9TUVVBUkVfTEVOR1RILCBVTklUX1NRVUFSRV9MRU5HVEggKTtcbmNvbnN0IFNIQVBFX0NSRUFUT1JfT0ZGU0VUX1BPU0lUSU9OUyA9IFtcblxuICAvLyBPZmZzZXRzIHVzZWQgZm9yIGluaXRpYWwgcG9zaXRpb24gb2Ygc2hhcGUsIHJlbGF0aXZlIHRvIGJ1Y2tldCBob2xlIGNlbnRlci4gIEVtcGlyaWNhbGx5IGRldGVybWluZWQuXG4gIG5ldyBWZWN0b3IyKCAtMjAgLSBVTklUX1NRVUFSRV9MRU5HVEggLyAyLCAwIC0gVU5JVF9TUVVBUkVfTEVOR1RIIC8gMiApLFxuICBuZXcgVmVjdG9yMiggLTEwIC0gVU5JVF9TUVVBUkVfTEVOR1RIIC8gMiwgLTIgLSBVTklUX1NRVUFSRV9MRU5HVEggLyAyICksXG4gIG5ldyBWZWN0b3IyKCA5IC0gVU5JVF9TUVVBUkVfTEVOR1RIIC8gMiwgMSAtIFVOSVRfU1FVQVJFX0xFTkdUSCAvIDIgKSxcbiAgbmV3IFZlY3RvcjIoIDE4IC0gVU5JVF9TUVVBUkVfTEVOR1RIIC8gMiwgMyAtIFVOSVRfU1FVQVJFX0xFTkdUSCAvIDIgKSxcbiAgbmV3IFZlY3RvcjIoIDMgLSBVTklUX1NRVUFSRV9MRU5HVEggLyAyLCA1IC0gVU5JVF9TUVVBUkVfTEVOR1RIIC8gMiApXG5dO1xuXG5jbGFzcyBFeHBsb3JlTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1NoYXBlUGxhY2VtZW50Qm9hcmR9IHNoYXBlUGxhY2VtZW50Qm9hcmRcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gYWRkU2hhcGVUb01vZGVsIC0gRnVuY3Rpb24gZm9yIGFkZGluZyBhIG5ld2x5IGNyZWF0ZWQgc2hhcGUgdG8gdGhlIG1vZGVsLlxuICAgKiBAcGFyYW0ge09ic2VydmFibGVBcnJheURlZn0gbW92YWJsZVNoYXBlTGlzdCAtIFRoZSBhcnJheSB0aGF0IHRyYWNrcyB0aGUgbW92YWJsZSBzaGFwZXMuXG4gICAqIEBwYXJhbSB7QnVja2V0fSBidWNrZXQgLSBNb2RlbCBvZiB0aGUgYnVja2V0IHRoYXQgaXMgdG8gYmUgcG9ydHJheWVkXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBzaGFwZVBsYWNlbWVudEJvYXJkLCBhZGRTaGFwZVRvTW9kZWwsIG1vdmFibGVTaGFwZUxpc3QsIGJ1Y2tldCwgb3B0aW9ucyApIHtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuXG4gICAgICAvLyBkcmFnIGJvdW5kcyBmb3IgdGhlIHNoYXBlcyB0aGF0IGNhbiBnbyBvbiB0aGUgYm9hcmRcbiAgICAgIHNoYXBlRHJhZ0JvdW5kczogQm91bmRzMi5FVkVSWVRISU5HLFxuXG4gICAgICAvLyBBbiBvcHRpb25hbCBsYXllciAoc2NlbmVyeSBub2RlKSBvbiB3aGljaCBtb3ZhYmxlIHNoYXBlcyB3aWxsIGJlIHBsYWNlZC4gIFBhc3NpbmcgaXQgaW4gYWxsb3dzIGl0IHRvIGJlXG4gICAgICAvLyBjcmVhdGVkIG91dHNpZGUgdGhpcyBub2RlLCB3aGljaCBzdXBwb3J0cyBzb21lIGxheWVyaW5nIHdoaWNoIGlzIG90aGVyd2lzZSBub3QgcG9zc2libGUuXG4gICAgICBzaGFwZXNMYXllcjogbnVsbFxuXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgLy8gVmVyaWZ5IHRoYXQgdGhlIHNoYXBlIHBsYWNlbWVudCBib2FyZCBpcyBzZXQgdXAgdG8gaGFuZGxlIGEgc3BlY2lmaWMgY29sb3IsIHJhdGhlciB0aGFuIGFsbCBjb2xvcnMsIHNpbmNlIG90aGVyXG4gICAgLy8gY29kZSBiZWxvdyBkZXBlbmRzIG9uIHRoaXMuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2hhcGVQbGFjZW1lbnRCb2FyZC5jb2xvckhhbmRsZWQgIT09ICcqJyApO1xuICAgIGNvbnN0IHNoYXBlQ29sb3IgPSBDb2xvci50b0NvbG9yKCBzaGFwZVBsYWNlbWVudEJvYXJkLmNvbG9ySGFuZGxlZCApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbm9kZXMgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbGF5ZXIgdGhpbmdzIHZpc3VhbGx5LlxuICAgIGNvbnN0IGJhY2tMYXllciA9IG5ldyBOb2RlKCk7XG4gICAgdGhpcy5hZGRDaGlsZCggYmFja0xheWVyICk7XG4gICAgbGV0IG1vdmFibGVTaGFwZXNMYXllcjtcbiAgICBpZiAoICFvcHRpb25zLnNoYXBlc0xheWVyICkge1xuICAgICAgbW92YWJsZVNoYXBlc0xheWVyID0gbmV3IE5vZGUoIHsgbGF5ZXJTcGxpdDogdHJ1ZSB9ICk7IC8vIEZvcmNlIHRoZSBtb3Zpbmcgc2hhcGUgaW50byBhIHNlcGFyYXRlIGxheWVyIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLlxuICAgICAgdGhpcy5hZGRDaGlsZCggbW92YWJsZVNoYXBlc0xheWVyICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gQXNzdW1lIHRoYXQgdGhpcyBsYXllciB3YXMgYWRkZWQgdG8gdGhlIHNjZW5lIGdyYXBoIGVsc2V3aGVyZSwgYW5kIGRvZXNuJ3QgbmVlZCB0byBiZSBhZGRlZCBoZXJlLlxuICAgICAgbW92YWJsZVNoYXBlc0xheWVyID0gb3B0aW9ucy5zaGFwZXNMYXllcjtcbiAgICB9XG4gICAgY29uc3QgYnVja2V0RnJvbnRMYXllciA9IG5ldyBOb2RlKCk7XG4gICAgdGhpcy5hZGRDaGlsZCggYnVja2V0RnJvbnRMYXllciApO1xuICAgIGNvbnN0IHNpbmdsZUJvYXJkQ29udHJvbHNMYXllciA9IG5ldyBOb2RlKCk7XG4gICAgdGhpcy5hZGRDaGlsZCggc2luZ2xlQm9hcmRDb250cm9sc0xheWVyICk7XG5cbiAgICAvLyBBZGQgdGhlIG5vZGUgdGhhdCByZXByZXNlbnRzIHRoZSBzaGFwZSBwbGFjZW1lbnQgYm9hcmQuICBUaGlzIGlzIHBvc2l0aW9uZWQgYmFzZWQgb24gdGhpcyBtb2RlbCBwb3NpdGlvbiwgYW5kXG4gICAgLy8gYWxsIG90aGVyIG5vZGVzIChzdWNoIGFzIHRoZSBidWNrZXQpIGFyZSBwb3NpdGlvbmVkIHJlbGF0aXZlIHRvIHRoaXMuXG4gICAgY29uc3Qgc2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUgPSBuZXcgU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUoIHNoYXBlUGxhY2VtZW50Qm9hcmQgKTtcbiAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIHNoYXBlUGxhY2VtZW50Qm9hcmROb2RlICk7XG5cbiAgICAvLyBBZGQgdGhlIGFyZWEgYW5kIHBlcmltZXRlciBkaXNwbGF5XG4gICAgdGhpcy5hcmVhQW5kUGVyaW1ldGVyRGlzcGxheSA9IG5ldyBBcmVhQW5kUGVyaW1ldGVyRGlzcGxheShcbiAgICAgIHNoYXBlUGxhY2VtZW50Qm9hcmQuYXJlYUFuZFBlcmltZXRlclByb3BlcnR5LFxuICAgICAgc2hhcGVDb2xvcixcbiAgICAgIHNoYXBlQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKSxcbiAgICAgIHtcbiAgICAgICAgY2VudGVyWDogc2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUuY2VudGVyWCxcbiAgICAgICAgYm90dG9tOiBzaGFwZVBsYWNlbWVudEJvYXJkTm9kZS50b3AgLSBTUEFDRV9BUk9VTkRfU0hBUEVfUExBQ0VNRU5UX0JPQVJEXG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmFyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5ICk7XG5cbiAgICAvLyBBZGQgdGhlIGJ1Y2tldCB2aWV3IGVsZW1lbnRzXG4gICAgY29uc3QgYnVja2V0RnJvbnQgPSBuZXcgQnVja2V0RnJvbnQoIGJ1Y2tldCwgSURFTlRJVFlfVFJBTlNGT1JNICk7XG4gICAgYnVja2V0RnJvbnRMYXllci5hZGRDaGlsZCggYnVja2V0RnJvbnQgKTtcbiAgICBjb25zdCBidWNrZXRIb2xlID0gbmV3IEJ1Y2tldEhvbGUoIGJ1Y2tldCwgSURFTlRJVFlfVFJBTlNGT1JNICk7XG4gICAgYmFja0xheWVyLmFkZENoaWxkKCBidWNrZXRIb2xlICk7XG5cbiAgICAvLyBBZGQgdGhlIHNoYXBlIGNyZWF0b3Igbm9kZXMuICBUaGVzZSBtdXN0IGJlIGFkZGVkIGFmdGVyIHRoZSBidWNrZXQgaG9sZSBmb3IgcHJvcGVyIGxheWVyaW5nLlxuICAgIFNIQVBFX0NSRUFUT1JfT0ZGU0VUX1BPU0lUSU9OUy5mb3JFYWNoKCBvZmZzZXQgPT4ge1xuICAgICAgYmFja0xheWVyLmFkZENoaWxkKCBuZXcgU2hhcGVDcmVhdG9yTm9kZSggVU5JVF9SRUNUQU5HTEVfU0hBUEUsIHNoYXBlQ29sb3IsIGFkZFNoYXBlVG9Nb2RlbCwge1xuICAgICAgICBsZWZ0OiBidWNrZXRIb2xlLmNlbnRlclggKyBvZmZzZXQueCxcbiAgICAgICAgdG9wOiBidWNrZXRIb2xlLmNlbnRlclkgKyBvZmZzZXQueSxcbiAgICAgICAgc2hhcGVEcmFnQm91bmRzOiBvcHRpb25zLnNoYXBlRHJhZ0JvdW5kc1xuICAgICAgfSApICk7XG4gICAgfSApO1xuXG4gICAgLy8gQWRkIHRoZSBidXR0b24gdGhhdCBhbGxvd3MgdGhlIGJvYXJkIHRvIGJlIGNsZWFyZWQgb2YgYWxsIHNoYXBlcy5cbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgRXJhc2VyQnV0dG9uKCB7XG4gICAgICByaWdodDogYnVja2V0RnJvbnQucmlnaHQgLSAzLFxuICAgICAgdG9wOiBidWNrZXRGcm9udC5ib3R0b20gKyA1LFxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA1LFxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA1LFxuICAgICAgbGlzdGVuZXI6ICgpID0+IHsgc2hhcGVQbGFjZW1lbnRCb2FyZC5yZWxlYXNlQWxsU2hhcGVzKCAnZmFkZScgKTsgfVxuICAgIH0gKSApO1xuXG4gICAgLy8gSGFuZGxlIHRoZSBjb21pbmdzIGFuZCBnb2luZ3Mgb2YgbW92YWJsZSBzaGFwZXMuXG4gICAgbW92YWJsZVNoYXBlTGlzdC5hZGRJdGVtQWRkZWRMaXN0ZW5lciggYWRkZWRTaGFwZSA9PiB7XG5cbiAgICAgIGlmICggYWRkZWRTaGFwZS5jb2xvci5lcXVhbHMoIHNoYXBlQ29sb3IgKSApIHtcblxuICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgdmlldyByZXByZXNlbnRhdGlvbiBmb3IgdGhpcyBzaGFwZS5cbiAgICAgICAgY29uc3Qgc2hhcGVOb2RlID0gbmV3IFNoYXBlTm9kZSggYWRkZWRTaGFwZSwgb3B0aW9ucy5zaGFwZURyYWdCb3VuZHMgKTtcbiAgICAgICAgbW92YWJsZVNoYXBlc0xheWVyLmFkZENoaWxkKCBzaGFwZU5vZGUgKTtcblxuICAgICAgICAvLyBNb3ZlIHRoZSBzaGFwZSB0byB0aGUgZnJvbnQgb2YgdGhpcyBsYXllciB3aGVuIGdyYWJiZWQgYnkgdGhlIHVzZXIuXG4gICAgICAgIGFkZGVkU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCB1c2VyQ29udHJvbGxlZCA9PiB7XG4gICAgICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCApIHtcbiAgICAgICAgICAgIHNoYXBlTm9kZS5tb3ZlVG9Gcm9udCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgcmVtb3ZhbCBsaXN0ZW5lciBmb3IgaWYgYW5kIHdoZW4gdGhpcyBzaGFwZSBpcyByZW1vdmVkIGZyb20gdGhlIG1vZGVsLlxuICAgICAgICBtb3ZhYmxlU2hhcGVMaXN0LmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGZ1bmN0aW9uIHJlbW92YWxMaXN0ZW5lciggcmVtb3ZlZFNoYXBlICkge1xuICAgICAgICAgIGlmICggcmVtb3ZlZFNoYXBlID09PSBhZGRlZFNoYXBlICkge1xuICAgICAgICAgICAgbW92YWJsZVNoYXBlc0xheWVyLnJlbW92ZUNoaWxkKCBzaGFwZU5vZGUgKTtcbiAgICAgICAgICAgIG1vdmFibGVTaGFwZUxpc3QucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XG4gICAgICAgICAgICBzaGFwZU5vZGUuZGlzcG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLmFyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5LnJlc2V0KCk7XG4gIH1cbn1cblxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdFeHBsb3JlTm9kZScsIEV4cGxvcmVOb2RlICk7XG5leHBvcnQgZGVmYXVsdCBFeHBsb3JlTm9kZTsiXSwibmFtZXMiOlsiQm91bmRzMiIsIlZlY3RvcjIiLCJTaGFwZSIsIm1lcmdlIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIkJ1Y2tldEZyb250IiwiQnVja2V0SG9sZSIsIkVyYXNlckJ1dHRvbiIsIkNvbG9yIiwiTm9kZSIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJTaGFwZUNyZWF0b3JOb2RlIiwiU2hhcGVOb2RlIiwiU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUiLCJBcmVhQW5kUGVyaW1ldGVyRGlzcGxheSIsIlNQQUNFX0FST1VORF9TSEFQRV9QTEFDRU1FTlRfQk9BUkQiLCJDT05UUk9MU19JTlNFVCIsIklERU5USVRZX1RSQU5TRk9STSIsImNyZWF0ZUlkZW50aXR5IiwiVU5JVF9TUVVBUkVfTEVOR1RIIiwiVU5JVF9SRUNUQU5HTEVfU0hBUEUiLCJyZWN0IiwiU0hBUEVfQ1JFQVRPUl9PRkZTRVRfUE9TSVRJT05TIiwiRXhwbG9yZU5vZGUiLCJyZXNldCIsImFyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5IiwiY29uc3RydWN0b3IiLCJzaGFwZVBsYWNlbWVudEJvYXJkIiwiYWRkU2hhcGVUb01vZGVsIiwibW92YWJsZVNoYXBlTGlzdCIsImJ1Y2tldCIsIm9wdGlvbnMiLCJzaGFwZURyYWdCb3VuZHMiLCJFVkVSWVRISU5HIiwic2hhcGVzTGF5ZXIiLCJhc3NlcnQiLCJjb2xvckhhbmRsZWQiLCJzaGFwZUNvbG9yIiwidG9Db2xvciIsImJhY2tMYXllciIsImFkZENoaWxkIiwibW92YWJsZVNoYXBlc0xheWVyIiwibGF5ZXJTcGxpdCIsImJ1Y2tldEZyb250TGF5ZXIiLCJzaW5nbGVCb2FyZENvbnRyb2xzTGF5ZXIiLCJzaGFwZVBsYWNlbWVudEJvYXJkTm9kZSIsImFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eSIsImNvbG9yVXRpbHNEYXJrZXIiLCJQRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiIsImNlbnRlclgiLCJib3R0b20iLCJ0b3AiLCJidWNrZXRGcm9udCIsImJ1Y2tldEhvbGUiLCJmb3JFYWNoIiwib2Zmc2V0IiwibGVmdCIsIngiLCJjZW50ZXJZIiwieSIsInJpZ2h0IiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibGlzdGVuZXIiLCJyZWxlYXNlQWxsU2hhcGVzIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRlZFNoYXBlIiwiY29sb3IiLCJlcXVhbHMiLCJzaGFwZU5vZGUiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwibGluayIsInVzZXJDb250cm9sbGVkIiwibW92ZVRvRnJvbnQiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwicmVtb3ZhbExpc3RlbmVyIiwicmVtb3ZlZFNoYXBlIiwicmVtb3ZlQ2hpbGQiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxTQUFTQyxLQUFLLFFBQVEsaUNBQWlDO0FBQ3ZELE9BQU9DLFdBQVcsb0NBQW9DO0FBQ3RELE9BQU9DLHlCQUF5Qix3REFBd0Q7QUFDeEYsT0FBT0MsaUJBQWlCLG9EQUFvRDtBQUM1RSxPQUFPQyxnQkFBZ0IsbURBQW1EO0FBQzFFLE9BQU9DLGtCQUFrQixzREFBc0Q7QUFDL0UsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ2hFLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFD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