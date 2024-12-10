// Copyright 2014-2023, University of Colorado Boulder
/**
 * A Scenery node that represents a shape that is defined by lists of perimeter points.  The perimeter points are
 * supplied in terms of external and internal perimeters.  This node also allows specification of a unit length that is
 * used to depict a grid on the shape, and can also show dimensions of the shape.
 *
 * @author John Blanco
 */ import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import Grid from './Grid.js';
// constants
const DIMENSION_LABEL_FONT = new PhetFont({
    size: 14
});
const COMPARISON_TOLERANCE = 1E-6;
let PerimeterShapeNode = class PerimeterShapeNode extends Node {
    /**
   * @param {Property.<PerimeterShape>} perimeterShapeProperty
   * @param {Bounds2} maxBounds
   * @param {number} unitSquareLength
   * @param {boolean} showDimensionsProperty
   * @param {boolean} showGridProperty
   * @param {Object} [options]
   */ constructor(perimeterShapeProperty, maxBounds, unitSquareLength, showDimensionsProperty, showGridProperty, options){
        super();
        const perimeterDefinesViableShapeProperty = new Property(false);
        // Set up the shape, edge, and grid, which will be updated as the perimeter changes.  The order in which these
        // are added is important for proper layering.
        const perimeterShapeNode = new Path(null);
        this.addChild(perimeterShapeNode);
        const grid = new Grid(maxBounds, unitSquareLength, {
            lineDash: [
                0,
                3,
                1,
                0
            ],
            stroke: 'black'
        });
        this.addChild(grid);
        const perimeterNode = new Path(null, {
            lineWidth: 2
        });
        this.addChild(perimeterNode);
        const dimensionsLayer = new Node();
        this.addChild(dimensionsLayer);
        // Create a pool of text nodes that will be used to portray the dimension values.  This is done as a performance
        // optimization, since changing text nodes is more efficient that recreating them on each update.
        const textNodePool = [];
        function addDimensionLabelNode() {
            const textNode = new Text('', {
                font: DIMENSION_LABEL_FONT,
                centerX: maxBounds.centerX,
                centerY: maxBounds.centerY
            });
            textNode.visible = false;
            textNodePool.push(textNode);
            dimensionsLayer.addChild(textNode);
        }
        _.times(16, addDimensionLabelNode); // Initial size empirically chosen, can be adjusted if needed.
        // Define function for updating the appearance of the perimeter shape.
        function update() {
            let i;
            // Update the colors
            assert && assert(perimeterShapeProperty.value.fillColor || perimeterShapeProperty.value.edgeColor, 'PerimeterShape can\'t have null values for both the fill and the edge.');
            perimeterShapeNode.fill = perimeterShapeProperty.value.fillColor;
            perimeterNode.stroke = perimeterShapeProperty.value.edgeColor;
            // Define the shape of the outer perimeter.
            const mainShape = new Shape();
            perimeterShapeProperty.value.exteriorPerimeters.forEach((exteriorPerimeters)=>{
                mainShape.moveToPoint(exteriorPerimeters[0]);
                for(i = 1; i < exteriorPerimeters.length; i++){
                    mainShape.lineToPoint(exteriorPerimeters[i]);
                }
                mainShape.lineToPoint(exteriorPerimeters[0]);
                mainShape.close();
            });
            // Hide all dimension labels in the pool, they will be shown later if used.
            textNodePool.forEach((textNode)=>{
                textNode.visible = false;
            });
            // The resulting shape will be empty if there are no points in the external perimeter, so we need to check for that.
            if (!mainShape.bounds.isEmpty()) {
                // Make sure the shape fits within its specified bounds.
                assert && assert(maxBounds.containsBounds(mainShape.bounds));
                // Turn on visibility of the perimeter and the interior fill.
                perimeterShapeNode.visible = true;
                perimeterNode.visible = true;
                // Handling any interior perimeters, a.k.a. holes, in the shape.
                perimeterShapeProperty.value.interiorPerimeters.forEach((interiorPerimeter)=>{
                    mainShape.moveToPoint(interiorPerimeter[0]);
                    for(i = 1; i < interiorPerimeter.length; i++){
                        mainShape.lineToPoint(interiorPerimeter[i]);
                    }
                    mainShape.lineToPoint(interiorPerimeter[0]);
                    mainShape.close();
                });
                perimeterShapeNode.setShape(mainShape);
                perimeterNode.setShape(mainShape);
                grid.clipArea = mainShape;
                // Add the dimension labels for the perimeters, but only if there is only 1 exterior perimeter (multiple
                // interior perimeters if fine).
                if (perimeterShapeProperty.value.exteriorPerimeters.length === 1) {
                    // Create a list of the perimeters to be labeled.
                    const perimetersToLabel = [];
                    perimetersToLabel.push(perimeterShapeProperty.value.exteriorPerimeters[0]);
                    perimeterShapeProperty.value.interiorPerimeters.forEach((interiorPerimeter)=>{
                        perimetersToLabel.push(interiorPerimeter);
                    });
                    // Identify the segments in each of the perimeters, exterior and interior, to be labeled.
                    const segmentLabelsInfo = [];
                    perimetersToLabel.forEach((perimeterToLabel)=>{
                        let segment = {
                            startIndex: 0,
                            endIndex: 0
                        };
                        do {
                            segment = identifySegment(perimeterToLabel, segment.endIndex);
                            // Only put labels on segments that have integer lengths.
                            const segmentLabelInfo = {
                                unitLength: perimeterToLabel[segment.startIndex].distance(perimeterToLabel[segment.endIndex]) / unitSquareLength,
                                position: new Vector2((perimeterToLabel[segment.startIndex].x + perimeterToLabel[segment.endIndex].x) / 2, (perimeterToLabel[segment.startIndex].y + perimeterToLabel[segment.endIndex].y) / 2),
                                edgeAngle: Math.atan2(perimeterToLabel[segment.endIndex].y - perimeterToLabel[segment.startIndex].y, perimeterToLabel[segment.endIndex].x - perimeterToLabel[segment.startIndex].x)
                            };
                            // Only include the labels that are integer values.
                            if (Math.abs(Utils.roundSymmetric(segmentLabelInfo.unitLength) - segmentLabelInfo.unitLength) < COMPARISON_TOLERANCE) {
                                segmentLabelInfo.unitLength = Utils.roundSymmetric(segmentLabelInfo.unitLength);
                                segmentLabelsInfo.push(segmentLabelInfo);
                            }
                        }while (segment.endIndex !== 0)
                    });
                    // Make sure that there are enough labels in the pool.
                    if (segmentLabelsInfo.length > textNodePool.length) {
                        _.times(segmentLabelsInfo.length - textNodePool.length, addDimensionLabelNode);
                    }
                    // Get labels from the pool and place them on each segment, just outside of the shape.
                    segmentLabelsInfo.forEach((segmentLabelInfo, segmentIndex)=>{
                        const dimensionLabel = textNodePool[segmentIndex];
                        dimensionLabel.visible = true;
                        dimensionLabel.string = segmentLabelInfo.unitLength;
                        const labelPositionOffset = new Vector2(0, 0);
                        //TODO https://github.com/phetsims/area-builder/issues/127
                        // At the time of this writing there is an issue with Shape.containsPoint() that can make
                        // containment testing unreliable if there is an edge on the same line as the containment test.  As a
                        // workaround, the containment test offset is tweaked a little below.  Once this issue is fixed, the
                        // label offset itself can be used for the test. See https://github.com/phetsims/kite/issues/3
                        let containmentTestOffset;
                        if (segmentLabelInfo.edgeAngle === 0 || segmentLabelInfo.edgeAngle === Math.PI) {
                            // Label is on horizontal edge, so use height to determine offset.
                            labelPositionOffset.setXY(0, dimensionLabel.height / 2);
                            containmentTestOffset = labelPositionOffset.plusXY(1, 0);
                        } else {
                            // Label is on a vertical edge
                            labelPositionOffset.setXY(dimensionLabel.width * 0.8, 0);
                            containmentTestOffset = labelPositionOffset.plusXY(0, 1);
                        }
                        if (mainShape.containsPoint(segmentLabelInfo.position.plus(containmentTestOffset))) {
                            // Flip the offset vector to keep the label outside of the shape.
                            labelPositionOffset.rotate(Math.PI);
                        }
                        dimensionLabel.center = segmentLabelInfo.position.plus(labelPositionOffset);
                    });
                }
                perimeterDefinesViableShapeProperty.value = true;
            } else {
                perimeterShapeNode.visible = false;
                perimeterNode.visible = false;
                perimeterDefinesViableShapeProperty.value = false;
            }
        }
        // Control visibility of the dimension indicators.
        showDimensionsProperty.linkAttribute(dimensionsLayer, 'visible');
        // Control visibility of the grid.
        Multilink.multilink([
            showGridProperty,
            perimeterDefinesViableShapeProperty
        ], (showGrid, perimeterDefinesViableShape)=>{
            grid.visible = showGrid && perimeterDefinesViableShape;
        });
        // Update the shape, grid, and dimensions if the perimeter shape itself changes.
        perimeterShapeProperty.link(()=>{
            update();
        });
        // Pass options through to parent class.
        this.mutate(options);
    }
};
// Utility function for identifying a perimeter segment with no bends.
function identifySegment(perimeterPoints, startIndex) {
    // Parameter checking.
    if (startIndex >= perimeterPoints.length) {
        throw new Error('Illegal use of function for identifying perimeter segments.');
    }
    // Set up initial portion of segment.
    const segmentStartPoint = perimeterPoints[startIndex];
    let endIndex = (startIndex + 1) % perimeterPoints.length;
    let segmentEndPoint = perimeterPoints[endIndex];
    const previousAngle = Math.atan2(segmentEndPoint.y - segmentStartPoint.y, segmentEndPoint.x - segmentStartPoint.x);
    let segmentComplete = false;
    while(!segmentComplete && endIndex !== 0){
        const candidatePoint = perimeterPoints[(endIndex + 1) % perimeterPoints.length];
        const angleToCandidatePoint = Math.atan2(candidatePoint.y - segmentEndPoint.y, candidatePoint.x - segmentEndPoint.x);
        if (previousAngle === angleToCandidatePoint) {
            // This point is an extension of the current segment.
            segmentEndPoint = candidatePoint;
            endIndex = (endIndex + 1) % perimeterPoints.length;
        } else {
            // This point isn't part of this segment.
            segmentComplete = true;
        }
    }
    return {
        startIndex: startIndex,
        endIndex: endIndex
    };
}
areaBuilder.register('PerimeterShapeNode', PerimeterShapeNode);
export default PerimeterShapeNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vdmlldy9QZXJpbWV0ZXJTaGFwZU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBTY2VuZXJ5IG5vZGUgdGhhdCByZXByZXNlbnRzIGEgc2hhcGUgdGhhdCBpcyBkZWZpbmVkIGJ5IGxpc3RzIG9mIHBlcmltZXRlciBwb2ludHMuICBUaGUgcGVyaW1ldGVyIHBvaW50cyBhcmVcbiAqIHN1cHBsaWVkIGluIHRlcm1zIG9mIGV4dGVybmFsIGFuZCBpbnRlcm5hbCBwZXJpbWV0ZXJzLiAgVGhpcyBub2RlIGFsc28gYWxsb3dzIHNwZWNpZmljYXRpb24gb2YgYSB1bml0IGxlbmd0aCB0aGF0IGlzXG4gKiB1c2VkIHRvIGRlcGljdCBhIGdyaWQgb24gdGhlIHNoYXBlLCBhbmQgY2FuIGFsc28gc2hvdyBkaW1lbnNpb25zIG9mIHRoZSBzaGFwZS5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgTm9kZSwgUGF0aCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xuaW1wb3J0IEdyaWQgZnJvbSAnLi9HcmlkLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBESU1FTlNJT05fTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxNCB9ICk7XG5jb25zdCBDT01QQVJJU09OX1RPTEVSQU5DRSA9IDFFLTY7XG5cbmNsYXNzIFBlcmltZXRlclNoYXBlTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxQZXJpbWV0ZXJTaGFwZT59IHBlcmltZXRlclNoYXBlUHJvcGVydHlcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBtYXhCb3VuZHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IHVuaXRTcXVhcmVMZW5ndGhcbiAgICogQHBhcmFtIHtib29sZWFufSBzaG93RGltZW5zaW9uc1Byb3BlcnR5XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd0dyaWRQcm9wZXJ0eVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqL1xuICBjb25zdHJ1Y3RvciggcGVyaW1ldGVyU2hhcGVQcm9wZXJ0eSwgbWF4Qm91bmRzLCB1bml0U3F1YXJlTGVuZ3RoLCBzaG93RGltZW5zaW9uc1Byb3BlcnR5LCBzaG93R3JpZFByb3BlcnR5LCBvcHRpb25zICkge1xuXG4gICAgc3VwZXIoKTtcblxuICAgIGNvbnN0IHBlcmltZXRlckRlZmluZXNWaWFibGVTaGFwZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xuXG4gICAgLy8gU2V0IHVwIHRoZSBzaGFwZSwgZWRnZSwgYW5kIGdyaWQsIHdoaWNoIHdpbGwgYmUgdXBkYXRlZCBhcyB0aGUgcGVyaW1ldGVyIGNoYW5nZXMuICBUaGUgb3JkZXIgaW4gd2hpY2ggdGhlc2VcbiAgICAvLyBhcmUgYWRkZWQgaXMgaW1wb3J0YW50IGZvciBwcm9wZXIgbGF5ZXJpbmcuXG4gICAgY29uc3QgcGVyaW1ldGVyU2hhcGVOb2RlID0gbmV3IFBhdGgoIG51bGwgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBwZXJpbWV0ZXJTaGFwZU5vZGUgKTtcbiAgICBjb25zdCBncmlkID0gbmV3IEdyaWQoIG1heEJvdW5kcywgdW5pdFNxdWFyZUxlbmd0aCwge1xuICAgICAgbGluZURhc2g6IFsgMCwgMywgMSwgMCBdLCAvLyBUd2Vha2VkIHRvIHdvcmsgd2VsbCB3aXRoIHVuaXQgc2l6ZVxuICAgICAgc3Ryb2tlOiAnYmxhY2snXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGdyaWQgKTtcbiAgICBjb25zdCBwZXJpbWV0ZXJOb2RlID0gbmV3IFBhdGgoIG51bGwsIHsgbGluZVdpZHRoOiAyIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCBwZXJpbWV0ZXJOb2RlICk7XG4gICAgY29uc3QgZGltZW5zaW9uc0xheWVyID0gbmV3IE5vZGUoKTtcbiAgICB0aGlzLmFkZENoaWxkKCBkaW1lbnNpb25zTGF5ZXIgKTtcblxuICAgIC8vIENyZWF0ZSBhIHBvb2wgb2YgdGV4dCBub2RlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byBwb3J0cmF5IHRoZSBkaW1lbnNpb24gdmFsdWVzLiAgVGhpcyBpcyBkb25lIGFzIGEgcGVyZm9ybWFuY2VcbiAgICAvLyBvcHRpbWl6YXRpb24sIHNpbmNlIGNoYW5naW5nIHRleHQgbm9kZXMgaXMgbW9yZSBlZmZpY2llbnQgdGhhdCByZWNyZWF0aW5nIHRoZW0gb24gZWFjaCB1cGRhdGUuXG4gICAgY29uc3QgdGV4dE5vZGVQb29sID0gW107XG5cbiAgICBmdW5jdGlvbiBhZGREaW1lbnNpb25MYWJlbE5vZGUoKSB7XG4gICAgICBjb25zdCB0ZXh0Tm9kZSA9IG5ldyBUZXh0KCAnJywge1xuICAgICAgICBmb250OiBESU1FTlNJT05fTEFCRUxfRk9OVCxcbiAgICAgICAgY2VudGVyWDogbWF4Qm91bmRzLmNlbnRlclgsXG4gICAgICAgIGNlbnRlclk6IG1heEJvdW5kcy5jZW50ZXJZXG4gICAgICB9ICk7XG4gICAgICB0ZXh0Tm9kZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICB0ZXh0Tm9kZVBvb2wucHVzaCggdGV4dE5vZGUgKTtcbiAgICAgIGRpbWVuc2lvbnNMYXllci5hZGRDaGlsZCggdGV4dE5vZGUgKTtcbiAgICB9XG5cbiAgICBfLnRpbWVzKCAxNiwgYWRkRGltZW5zaW9uTGFiZWxOb2RlICk7IC8vIEluaXRpYWwgc2l6ZSBlbXBpcmljYWxseSBjaG9zZW4sIGNhbiBiZSBhZGp1c3RlZCBpZiBuZWVkZWQuXG5cbiAgICAvLyBEZWZpbmUgZnVuY3Rpb24gZm9yIHVwZGF0aW5nIHRoZSBhcHBlYXJhbmNlIG9mIHRoZSBwZXJpbWV0ZXIgc2hhcGUuXG4gICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgbGV0IGk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgY29sb3JzXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwZXJpbWV0ZXJTaGFwZVByb3BlcnR5LnZhbHVlLmZpbGxDb2xvciB8fCBwZXJpbWV0ZXJTaGFwZVByb3BlcnR5LnZhbHVlLmVkZ2VDb2xvcixcbiAgICAgICAgJ1BlcmltZXRlclNoYXBlIGNhblxcJ3QgaGF2ZSBudWxsIHZhbHVlcyBmb3IgYm90aCB0aGUgZmlsbCBhbmQgdGhlIGVkZ2UuJyApO1xuICAgICAgcGVyaW1ldGVyU2hhcGVOb2RlLmZpbGwgPSBwZXJpbWV0ZXJTaGFwZVByb3BlcnR5LnZhbHVlLmZpbGxDb2xvcjtcbiAgICAgIHBlcmltZXRlck5vZGUuc3Ryb2tlID0gcGVyaW1ldGVyU2hhcGVQcm9wZXJ0eS52YWx1ZS5lZGdlQ29sb3I7XG5cbiAgICAgIC8vIERlZmluZSB0aGUgc2hhcGUgb2YgdGhlIG91dGVyIHBlcmltZXRlci5cbiAgICAgIGNvbnN0IG1haW5TaGFwZSA9IG5ldyBTaGFwZSgpO1xuICAgICAgcGVyaW1ldGVyU2hhcGVQcm9wZXJ0eS52YWx1ZS5leHRlcmlvclBlcmltZXRlcnMuZm9yRWFjaCggZXh0ZXJpb3JQZXJpbWV0ZXJzID0+IHtcbiAgICAgICAgbWFpblNoYXBlLm1vdmVUb1BvaW50KCBleHRlcmlvclBlcmltZXRlcnNbIDAgXSApO1xuICAgICAgICBmb3IgKCBpID0gMTsgaSA8IGV4dGVyaW9yUGVyaW1ldGVycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBtYWluU2hhcGUubGluZVRvUG9pbnQoIGV4dGVyaW9yUGVyaW1ldGVyc1sgaSBdICk7XG4gICAgICAgIH1cbiAgICAgICAgbWFpblNoYXBlLmxpbmVUb1BvaW50KCBleHRlcmlvclBlcmltZXRlcnNbIDAgXSApO1xuICAgICAgICBtYWluU2hhcGUuY2xvc2UoKTtcbiAgICAgIH0gKTtcblxuICAgICAgLy8gSGlkZSBhbGwgZGltZW5zaW9uIGxhYmVscyBpbiB0aGUgcG9vbCwgdGhleSB3aWxsIGJlIHNob3duIGxhdGVyIGlmIHVzZWQuXG4gICAgICB0ZXh0Tm9kZVBvb2wuZm9yRWFjaCggdGV4dE5vZGUgPT4geyB0ZXh0Tm9kZS52aXNpYmxlID0gZmFsc2U7IH0gKTtcblxuICAgICAgLy8gVGhlIHJlc3VsdGluZyBzaGFwZSB3aWxsIGJlIGVtcHR5IGlmIHRoZXJlIGFyZSBubyBwb2ludHMgaW4gdGhlIGV4dGVybmFsIHBlcmltZXRlciwgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgdGhhdC5cbiAgICAgIGlmICggIW1haW5TaGFwZS5ib3VuZHMuaXNFbXB0eSgpICkge1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc2hhcGUgZml0cyB3aXRoaW4gaXRzIHNwZWNpZmllZCBib3VuZHMuXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG1heEJvdW5kcy5jb250YWluc0JvdW5kcyggbWFpblNoYXBlLmJvdW5kcyApICk7XG5cbiAgICAgICAgLy8gVHVybiBvbiB2aXNpYmlsaXR5IG9mIHRoZSBwZXJpbWV0ZXIgYW5kIHRoZSBpbnRlcmlvciBmaWxsLlxuICAgICAgICBwZXJpbWV0ZXJTaGFwZU5vZGUudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIHBlcmltZXRlck5vZGUudmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgLy8gSGFuZGxpbmcgYW55IGludGVyaW9yIHBlcmltZXRlcnMsIGEuay5hLiBob2xlcywgaW4gdGhlIHNoYXBlLlxuICAgICAgICBwZXJpbWV0ZXJTaGFwZVByb3BlcnR5LnZhbHVlLmludGVyaW9yUGVyaW1ldGVycy5mb3JFYWNoKCBpbnRlcmlvclBlcmltZXRlciA9PiB7XG4gICAgICAgICAgbWFpblNoYXBlLm1vdmVUb1BvaW50KCBpbnRlcmlvclBlcmltZXRlclsgMCBdICk7XG4gICAgICAgICAgZm9yICggaSA9IDE7IGkgPCBpbnRlcmlvclBlcmltZXRlci5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIG1haW5TaGFwZS5saW5lVG9Qb2ludCggaW50ZXJpb3JQZXJpbWV0ZXJbIGkgXSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtYWluU2hhcGUubGluZVRvUG9pbnQoIGludGVyaW9yUGVyaW1ldGVyWyAwIF0gKTtcbiAgICAgICAgICBtYWluU2hhcGUuY2xvc2UoKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgIHBlcmltZXRlclNoYXBlTm9kZS5zZXRTaGFwZSggbWFpblNoYXBlICk7XG4gICAgICAgIHBlcmltZXRlck5vZGUuc2V0U2hhcGUoIG1haW5TaGFwZSApO1xuXG4gICAgICAgIGdyaWQuY2xpcEFyZWEgPSBtYWluU2hhcGU7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBkaW1lbnNpb24gbGFiZWxzIGZvciB0aGUgcGVyaW1ldGVycywgYnV0IG9ubHkgaWYgdGhlcmUgaXMgb25seSAxIGV4dGVyaW9yIHBlcmltZXRlciAobXVsdGlwbGVcbiAgICAgICAgLy8gaW50ZXJpb3IgcGVyaW1ldGVycyBpZiBmaW5lKS5cbiAgICAgICAgaWYgKCBwZXJpbWV0ZXJTaGFwZVByb3BlcnR5LnZhbHVlLmV4dGVyaW9yUGVyaW1ldGVycy5sZW5ndGggPT09IDEgKSB7XG5cbiAgICAgICAgICAvLyBDcmVhdGUgYSBsaXN0IG9mIHRoZSBwZXJpbWV0ZXJzIHRvIGJlIGxhYmVsZWQuXG4gICAgICAgICAgY29uc3QgcGVyaW1ldGVyc1RvTGFiZWwgPSBbXTtcbiAgICAgICAgICBwZXJpbWV0ZXJzVG9MYWJlbC5wdXNoKCBwZXJpbWV0ZXJTaGFwZVByb3BlcnR5LnZhbHVlLmV4dGVyaW9yUGVyaW1ldGVyc1sgMCBdICk7XG4gICAgICAgICAgcGVyaW1ldGVyU2hhcGVQcm9wZXJ0eS52YWx1ZS5pbnRlcmlvclBlcmltZXRlcnMuZm9yRWFjaCggaW50ZXJpb3JQZXJpbWV0ZXIgPT4ge1xuICAgICAgICAgICAgcGVyaW1ldGVyc1RvTGFiZWwucHVzaCggaW50ZXJpb3JQZXJpbWV0ZXIgKTtcbiAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAvLyBJZGVudGlmeSB0aGUgc2VnbWVudHMgaW4gZWFjaCBvZiB0aGUgcGVyaW1ldGVycywgZXh0ZXJpb3IgYW5kIGludGVyaW9yLCB0byBiZSBsYWJlbGVkLlxuICAgICAgICAgIGNvbnN0IHNlZ21lbnRMYWJlbHNJbmZvID0gW107XG4gICAgICAgICAgcGVyaW1ldGVyc1RvTGFiZWwuZm9yRWFjaCggcGVyaW1ldGVyVG9MYWJlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc2VnbWVudCA9IHsgc3RhcnRJbmRleDogMCwgZW5kSW5kZXg6IDAgfTtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgc2VnbWVudCA9IGlkZW50aWZ5U2VnbWVudCggcGVyaW1ldGVyVG9MYWJlbCwgc2VnbWVudC5lbmRJbmRleCApO1xuICAgICAgICAgICAgICAvLyBPbmx5IHB1dCBsYWJlbHMgb24gc2VnbWVudHMgdGhhdCBoYXZlIGludGVnZXIgbGVuZ3Rocy5cbiAgICAgICAgICAgICAgY29uc3Qgc2VnbWVudExhYmVsSW5mbyA9IHtcbiAgICAgICAgICAgICAgICB1bml0TGVuZ3RoOiBwZXJpbWV0ZXJUb0xhYmVsWyBzZWdtZW50LnN0YXJ0SW5kZXggXS5kaXN0YW5jZSggcGVyaW1ldGVyVG9MYWJlbFsgc2VnbWVudC5lbmRJbmRleCBdICkgLyB1bml0U3F1YXJlTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggKCBwZXJpbWV0ZXJUb0xhYmVsWyBzZWdtZW50LnN0YXJ0SW5kZXggXS54ICsgcGVyaW1ldGVyVG9MYWJlbFsgc2VnbWVudC5lbmRJbmRleCBdLnggKSAvIDIsXG4gICAgICAgICAgICAgICAgICAoIHBlcmltZXRlclRvTGFiZWxbIHNlZ21lbnQuc3RhcnRJbmRleCBdLnkgKyBwZXJpbWV0ZXJUb0xhYmVsWyBzZWdtZW50LmVuZEluZGV4IF0ueSApIC8gMiApLFxuICAgICAgICAgICAgICAgIGVkZ2VBbmdsZTogTWF0aC5hdGFuMiggcGVyaW1ldGVyVG9MYWJlbFsgc2VnbWVudC5lbmRJbmRleCBdLnkgLSBwZXJpbWV0ZXJUb0xhYmVsWyBzZWdtZW50LnN0YXJ0SW5kZXggXS55LFxuICAgICAgICAgICAgICAgICAgcGVyaW1ldGVyVG9MYWJlbFsgc2VnbWVudC5lbmRJbmRleCBdLnggLSBwZXJpbWV0ZXJUb0xhYmVsWyBzZWdtZW50LnN0YXJ0SW5kZXggXS54XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIC8vIE9ubHkgaW5jbHVkZSB0aGUgbGFiZWxzIHRoYXQgYXJlIGludGVnZXIgdmFsdWVzLlxuICAgICAgICAgICAgICBpZiAoIE1hdGguYWJzKCBVdGlscy5yb3VuZFN5bW1ldHJpYyggc2VnbWVudExhYmVsSW5mby51bml0TGVuZ3RoICkgLSBzZWdtZW50TGFiZWxJbmZvLnVuaXRMZW5ndGggKSA8IENPTVBBUklTT05fVE9MRVJBTkNFICkge1xuICAgICAgICAgICAgICAgIHNlZ21lbnRMYWJlbEluZm8udW5pdExlbmd0aCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBzZWdtZW50TGFiZWxJbmZvLnVuaXRMZW5ndGggKTtcbiAgICAgICAgICAgICAgICBzZWdtZW50TGFiZWxzSW5mby5wdXNoKCBzZWdtZW50TGFiZWxJbmZvICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gd2hpbGUgKCBzZWdtZW50LmVuZEluZGV4ICE9PSAwICk7XG4gICAgICAgICAgfSApO1xuXG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgdGhlcmUgYXJlIGVub3VnaCBsYWJlbHMgaW4gdGhlIHBvb2wuXG4gICAgICAgICAgaWYgKCBzZWdtZW50TGFiZWxzSW5mby5sZW5ndGggPiB0ZXh0Tm9kZVBvb2wubGVuZ3RoICkge1xuICAgICAgICAgICAgXy50aW1lcyggc2VnbWVudExhYmVsc0luZm8ubGVuZ3RoIC0gdGV4dE5vZGVQb29sLmxlbmd0aCwgYWRkRGltZW5zaW9uTGFiZWxOb2RlICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gR2V0IGxhYmVscyBmcm9tIHRoZSBwb29sIGFuZCBwbGFjZSB0aGVtIG9uIGVhY2ggc2VnbWVudCwganVzdCBvdXRzaWRlIG9mIHRoZSBzaGFwZS5cbiAgICAgICAgICBzZWdtZW50TGFiZWxzSW5mby5mb3JFYWNoKCAoIHNlZ21lbnRMYWJlbEluZm8sIHNlZ21lbnRJbmRleCApID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRpbWVuc2lvbkxhYmVsID0gdGV4dE5vZGVQb29sWyBzZWdtZW50SW5kZXggXTtcbiAgICAgICAgICAgIGRpbWVuc2lvbkxhYmVsLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgZGltZW5zaW9uTGFiZWwuc3RyaW5nID0gc2VnbWVudExhYmVsSW5mby51bml0TGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgbGFiZWxQb3NpdGlvbk9mZnNldCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gICAgICAgICAgICAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtYnVpbGRlci9pc3N1ZXMvMTI3XG4gICAgICAgICAgICAvLyBBdCB0aGUgdGltZSBvZiB0aGlzIHdyaXRpbmcgdGhlcmUgaXMgYW4gaXNzdWUgd2l0aCBTaGFwZS5jb250YWluc1BvaW50KCkgdGhhdCBjYW4gbWFrZVxuICAgICAgICAgICAgLy8gY29udGFpbm1lbnQgdGVzdGluZyB1bnJlbGlhYmxlIGlmIHRoZXJlIGlzIGFuIGVkZ2Ugb24gdGhlIHNhbWUgbGluZSBhcyB0aGUgY29udGFpbm1lbnQgdGVzdC4gIEFzIGFcbiAgICAgICAgICAgIC8vIHdvcmthcm91bmQsIHRoZSBjb250YWlubWVudCB0ZXN0IG9mZnNldCBpcyB0d2Vha2VkIGEgbGl0dGxlIGJlbG93LiAgT25jZSB0aGlzIGlzc3VlIGlzIGZpeGVkLCB0aGVcbiAgICAgICAgICAgIC8vIGxhYmVsIG9mZnNldCBpdHNlbGYgY2FuIGJlIHVzZWQgZm9yIHRoZSB0ZXN0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzNcbiAgICAgICAgICAgIGxldCBjb250YWlubWVudFRlc3RPZmZzZXQ7XG4gICAgICAgICAgICBpZiAoIHNlZ21lbnRMYWJlbEluZm8uZWRnZUFuZ2xlID09PSAwIHx8IHNlZ21lbnRMYWJlbEluZm8uZWRnZUFuZ2xlID09PSBNYXRoLlBJICkge1xuICAgICAgICAgICAgICAvLyBMYWJlbCBpcyBvbiBob3Jpem9udGFsIGVkZ2UsIHNvIHVzZSBoZWlnaHQgdG8gZGV0ZXJtaW5lIG9mZnNldC5cbiAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbk9mZnNldC5zZXRYWSggMCwgZGltZW5zaW9uTGFiZWwuaGVpZ2h0IC8gMiApO1xuICAgICAgICAgICAgICBjb250YWlubWVudFRlc3RPZmZzZXQgPSBsYWJlbFBvc2l0aW9uT2Zmc2V0LnBsdXNYWSggMSwgMCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7IC8vIE5PVEU6IEFuZ2xlZCBlZGdlcyBhcmUgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQuXG4gICAgICAgICAgICAgIC8vIExhYmVsIGlzIG9uIGEgdmVydGljYWwgZWRnZVxuICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uT2Zmc2V0LnNldFhZKCBkaW1lbnNpb25MYWJlbC53aWR0aCAqIDAuOCwgMCApO1xuICAgICAgICAgICAgICBjb250YWlubWVudFRlc3RPZmZzZXQgPSBsYWJlbFBvc2l0aW9uT2Zmc2V0LnBsdXNYWSggMCwgMSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCBtYWluU2hhcGUuY29udGFpbnNQb2ludCggc2VnbWVudExhYmVsSW5mby5wb3NpdGlvbi5wbHVzKCBjb250YWlubWVudFRlc3RPZmZzZXQgKSApICkge1xuICAgICAgICAgICAgICAvLyBGbGlwIHRoZSBvZmZzZXQgdmVjdG9yIHRvIGtlZXAgdGhlIGxhYmVsIG91dHNpZGUgb2YgdGhlIHNoYXBlLlxuICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uT2Zmc2V0LnJvdGF0ZSggTWF0aC5QSSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGltZW5zaW9uTGFiZWwuY2VudGVyID0gc2VnbWVudExhYmVsSW5mby5wb3NpdGlvbi5wbHVzKCBsYWJlbFBvc2l0aW9uT2Zmc2V0ICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIHBlcmltZXRlckRlZmluZXNWaWFibGVTaGFwZVByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBwZXJpbWV0ZXJTaGFwZU5vZGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICBwZXJpbWV0ZXJOb2RlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgcGVyaW1ldGVyRGVmaW5lc1ZpYWJsZVNoYXBlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb250cm9sIHZpc2liaWxpdHkgb2YgdGhlIGRpbWVuc2lvbiBpbmRpY2F0b3JzLlxuICAgIHNob3dEaW1lbnNpb25zUHJvcGVydHkubGlua0F0dHJpYnV0ZSggZGltZW5zaW9uc0xheWVyLCAndmlzaWJsZScgKTtcblxuICAgIC8vIENvbnRyb2wgdmlzaWJpbGl0eSBvZiB0aGUgZ3JpZC5cbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHNob3dHcmlkUHJvcGVydHksIHBlcmltZXRlckRlZmluZXNWaWFibGVTaGFwZVByb3BlcnR5IF0sICggc2hvd0dyaWQsIHBlcmltZXRlckRlZmluZXNWaWFibGVTaGFwZSApID0+IHtcbiAgICAgIGdyaWQudmlzaWJsZSA9IHNob3dHcmlkICYmIHBlcmltZXRlckRlZmluZXNWaWFibGVTaGFwZTtcbiAgICB9ICk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHNoYXBlLCBncmlkLCBhbmQgZGltZW5zaW9ucyBpZiB0aGUgcGVyaW1ldGVyIHNoYXBlIGl0c2VsZiBjaGFuZ2VzLlxuICAgIHBlcmltZXRlclNoYXBlUHJvcGVydHkubGluayggKCkgPT4ge1xuICAgICAgdXBkYXRlKCk7XG4gICAgfSApO1xuXG4gICAgLy8gUGFzcyBvcHRpb25zIHRocm91Z2ggdG8gcGFyZW50IGNsYXNzLlxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG4gIH1cbn1cblxuLy8gVXRpbGl0eSBmdW5jdGlvbiBmb3IgaWRlbnRpZnlpbmcgYSBwZXJpbWV0ZXIgc2VnbWVudCB3aXRoIG5vIGJlbmRzLlxuZnVuY3Rpb24gaWRlbnRpZnlTZWdtZW50KCBwZXJpbWV0ZXJQb2ludHMsIHN0YXJ0SW5kZXggKSB7XG5cbiAgLy8gUGFyYW1ldGVyIGNoZWNraW5nLlxuICBpZiAoIHN0YXJ0SW5kZXggPj0gcGVyaW1ldGVyUG9pbnRzLmxlbmd0aCApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdJbGxlZ2FsIHVzZSBvZiBmdW5jdGlvbiBmb3IgaWRlbnRpZnlpbmcgcGVyaW1ldGVyIHNlZ21lbnRzLicgKTtcbiAgfVxuXG4gIC8vIFNldCB1cCBpbml0aWFsIHBvcnRpb24gb2Ygc2VnbWVudC5cbiAgY29uc3Qgc2VnbWVudFN0YXJ0UG9pbnQgPSBwZXJpbWV0ZXJQb2ludHNbIHN0YXJ0SW5kZXggXTtcbiAgbGV0IGVuZEluZGV4ID0gKCBzdGFydEluZGV4ICsgMSApICUgcGVyaW1ldGVyUG9pbnRzLmxlbmd0aDtcbiAgbGV0IHNlZ21lbnRFbmRQb2ludCA9IHBlcmltZXRlclBvaW50c1sgZW5kSW5kZXggXTtcbiAgY29uc3QgcHJldmlvdXNBbmdsZSA9IE1hdGguYXRhbjIoIHNlZ21lbnRFbmRQb2ludC55IC0gc2VnbWVudFN0YXJ0UG9pbnQueSwgc2VnbWVudEVuZFBvaW50LnggLSBzZWdtZW50U3RhcnRQb2ludC54ICk7XG4gIGxldCBzZWdtZW50Q29tcGxldGUgPSBmYWxzZTtcblxuICB3aGlsZSAoICFzZWdtZW50Q29tcGxldGUgJiYgZW5kSW5kZXggIT09IDAgKSB7XG4gICAgY29uc3QgY2FuZGlkYXRlUG9pbnQgPSBwZXJpbWV0ZXJQb2ludHNbICggZW5kSW5kZXggKyAxICkgJSBwZXJpbWV0ZXJQb2ludHMubGVuZ3RoIF07XG4gICAgY29uc3QgYW5nbGVUb0NhbmRpZGF0ZVBvaW50ID0gTWF0aC5hdGFuMiggY2FuZGlkYXRlUG9pbnQueSAtIHNlZ21lbnRFbmRQb2ludC55LCBjYW5kaWRhdGVQb2ludC54IC0gc2VnbWVudEVuZFBvaW50LnggKTtcbiAgICBpZiAoIHByZXZpb3VzQW5nbGUgPT09IGFuZ2xlVG9DYW5kaWRhdGVQb2ludCApIHtcbiAgICAgIC8vIFRoaXMgcG9pbnQgaXMgYW4gZXh0ZW5zaW9uIG9mIHRoZSBjdXJyZW50IHNlZ21lbnQuXG4gICAgICBzZWdtZW50RW5kUG9pbnQgPSBjYW5kaWRhdGVQb2ludDtcbiAgICAgIGVuZEluZGV4ID0gKCBlbmRJbmRleCArIDEgKSAlIHBlcmltZXRlclBvaW50cy5sZW5ndGg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gVGhpcyBwb2ludCBpc24ndCBwYXJ0IG9mIHRoaXMgc2VnbWVudC5cbiAgICAgIHNlZ21lbnRDb21wbGV0ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydEluZGV4OiBzdGFydEluZGV4LFxuICAgIGVuZEluZGV4OiBlbmRJbmRleFxuICB9O1xufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ1BlcmltZXRlclNoYXBlTm9kZScsIFBlcmltZXRlclNoYXBlTm9kZSApO1xuZXhwb3J0IGRlZmF1bHQgUGVyaW1ldGVyU2hhcGVOb2RlOyJdLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIlV0aWxzIiwiVmVjdG9yMiIsIlNoYXBlIiwiUGhldEZvbnQiLCJOb2RlIiwiUGF0aCIsIlRleHQiLCJhcmVhQnVpbGRlciIsIkdyaWQiLCJESU1FTlNJT05fTEFCRUxfRk9OVCIsInNpemUiLCJDT01QQVJJU09OX1RPTEVSQU5DRSIsIlBlcmltZXRlclNoYXBlTm9kZSIsImNvbnN0cnVjdG9yIiwicGVyaW1ldGVyU2hhcGVQcm9wZXJ0eSIsIm1heEJvdW5kcyIsInVuaXRTcXVhcmVMZW5ndGgiLCJzaG93RGltZW5zaW9uc1Byb3BlcnR5Iiwic2hvd0dyaWRQcm9wZXJ0eSIsIm9wdGlvbnMiLCJwZXJpbWV0ZXJEZWZpbmVzVmlhYmxlU2hhcGVQcm9wZXJ0eSIsInBlcmltZXRlclNoYXBlTm9kZSIsImFkZENoaWxkIiwiZ3JpZCIsImxpbmVEYXNoIiwic3Ryb2tlIiwicGVyaW1ldGVyTm9kZSIsImxpbmVXaWR0aCIsImRpbWVuc2lvbnNMYXllciIsInRleHROb2RlUG9vbCIsImFkZERpbWVuc2lvbkxhYmVsTm9kZSIsInRleHROb2RlIiwiZm9udCIsImNlbnRlclgiLCJjZW50ZXJZIiwidmlzaWJsZSIsInB1c2giLCJfIiwidGltZXMiLCJ1cGRhdGUiLCJpIiwiYXNzZXJ0IiwidmFsdWUiLCJmaWxsQ29sb3IiLCJlZGdlQ29sb3IiLCJmaWxsIiwibWFpblNoYXBlIiwiZXh0ZXJpb3JQZXJpbWV0ZXJzIiwiZm9yRWFjaCIsIm1vdmVUb1BvaW50IiwibGVuZ3RoIiwibGluZVRvUG9pbnQiLCJjbG9zZSIsImJvdW5kcyIsImlzRW1wdHkiLCJjb250YWluc0JvdW5kcyIsImludGVyaW9yUGVyaW1ldGVycyIsImludGVyaW9yUGVyaW1ldGVyIiwic2V0U2hhcGUiLCJjbGlwQXJlYSIsInBlcmltZXRlcnNUb0xhYmVsIiwic2VnbWVudExhYmVsc0luZm8iLCJwZXJpbWV0ZXJUb0xhYmVsIiwic2VnbWVudCIsInN0YXJ0SW5kZXgiLCJlbmRJbmRleCIsImlkZW50aWZ5U2VnbWVudCIsInNlZ21lbnRMYWJlbEluZm8iLCJ1bml0TGVuZ3RoIiwiZGlzdGFuY2UiLCJwb3NpdGlvbiIsIngiLCJ5IiwiZWRnZUFuZ2xlIiwiTWF0aCIsImF0YW4yIiwiYWJzIiwicm91bmRTeW1tZXRyaWMiLCJzZWdtZW50SW5kZXgiLCJkaW1lbnNpb25MYWJlbCIsInN0cmluZyIsImxhYmVsUG9zaXRpb25PZmZzZXQiLCJjb250YWlubWVudFRlc3RPZmZzZXQiLCJQSSIsInNldFhZIiwiaGVpZ2h0IiwicGx1c1hZIiwid2lkdGgiLCJjb250YWluc1BvaW50IiwicGx1cyIsInJvdGF0ZSIsImNlbnRlciIsImxpbmtBdHRyaWJ1dGUiLCJtdWx0aWxpbmsiLCJzaG93R3JpZCIsInBlcmltZXRlckRlZmluZXNWaWFibGVTaGFwZSIsImxpbmsiLCJtdXRhdGUiLCJwZXJpbWV0ZXJQb2ludHMiLCJFcnJvciIsInNlZ21lbnRTdGFydFBvaW50Iiwic2VnbWVudEVuZFBvaW50IiwicHJldmlvdXNBbmdsZSIsInNlZ21lbnRDb21wbGV0ZSIsImNhbmRpZGF0ZVBvaW50IiwiYW5nbGVUb0NhbmRpZGF0ZVBvaW50IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxlQUFlLG1DQUFtQztBQUN6RCxPQUFPQyxjQUFjLGtDQUFrQztBQUN2RCxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxTQUFTQyxLQUFLLFFBQVEsaUNBQWlDO0FBQ3ZELE9BQU9DLGNBQWMsMENBQTBDO0FBQy9ELFNBQVNDLElBQUks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