// Copyright 2014-2022, University of Colorado Boulder
/**
 * View representation of a ShapePlacementBoard, which is a board (like a whiteboard or bulletin board) where shapes
 * can be placed.
 *
 * @author John Blanco
 */ import Property from '../../../../axon/js/Property.js';
import { Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import Grid from './Grid.js';
import PerimeterShapeNode from './PerimeterShapeNode.js';
let ShapePlacementBoardNode = class ShapePlacementBoardNode extends Node {
    /**
   * @param {ShapePlacementBoard} shapePlacementBoard
   */ constructor(shapePlacementBoard){
        super();
        // Create and add the board itself.
        const board = Rectangle.bounds(shapePlacementBoard.bounds, {
            fill: 'white',
            stroke: 'black'
        });
        this.addChild(board);
        // Create and add the grid
        const grid = new Grid(shapePlacementBoard.bounds, shapePlacementBoard.unitSquareLength, {
            stroke: '#C0C0C0'
        });
        this.addChild(grid);
        // Track and update the grid visibility
        shapePlacementBoard.showGridProperty.linkAttribute(grid, 'visible');
        // Monitor the background shape and add/remove/update it as it changes.
        this.backgroundShape = new PerimeterShapeNode(shapePlacementBoard.backgroundShapeProperty, shapePlacementBoard.bounds, shapePlacementBoard.unitSquareLength, shapePlacementBoard.showDimensionsProperty, shapePlacementBoard.showGridOnBackgroundShapeProperty);
        this.addChild(this.backgroundShape);
        // Monitor the shapes added by the user to the board and create an equivalent shape with no edges for each.  This
        // may seem a little odd - why hide the shapes that the user placed and depict them with essentially the same
        // thing minus the edge stroke?  The reason is that this makes layering and control of visual modes much easier.
        const shapesLayer = new Node();
        this.addChild(shapesLayer);
        shapePlacementBoard.residentShapes.addItemAddedListener((addedShape)=>{
            if (shapePlacementBoard.formCompositeProperty.get()) {
                // Add a representation of the shape.
                const representation = new Path(addedShape.shape, {
                    fill: addedShape.color,
                    left: addedShape.positionProperty.get().x,
                    top: addedShape.positionProperty.get().y
                });
                shapesLayer.addChild(representation);
                shapePlacementBoard.residentShapes.addItemRemovedListener(function removalListener(removedShape) {
                    if (removedShape === addedShape) {
                        shapesLayer.removeChild(representation);
                        representation.dispose();
                        shapePlacementBoard.residentShapes.removeItemRemovedListener(removalListener);
                    }
                });
            }
        });
        // Add the perimeter shape, which depicts the exterior and interior perimeters formed by the placed shapes.
        this.addChild(new PerimeterShapeNode(shapePlacementBoard.compositeShapeProperty, shapePlacementBoard.bounds, shapePlacementBoard.unitSquareLength, shapePlacementBoard.showDimensionsProperty, new Property(true) // grid on shape - always shown for the composite shape
        ));
    }
};
areaBuilder.register('ShapePlacementBoardNode', ShapePlacementBoardNode);
export default ShapePlacementBoardNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vdmlldy9TaGFwZVBsYWNlbWVudEJvYXJkTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBWaWV3IHJlcHJlc2VudGF0aW9uIG9mIGEgU2hhcGVQbGFjZW1lbnRCb2FyZCwgd2hpY2ggaXMgYSBib2FyZCAobGlrZSBhIHdoaXRlYm9hcmQgb3IgYnVsbGV0aW4gYm9hcmQpIHdoZXJlIHNoYXBlc1xuICogY2FuIGJlIHBsYWNlZC5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IHsgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XG5pbXBvcnQgR3JpZCBmcm9tICcuL0dyaWQuanMnO1xuaW1wb3J0IFBlcmltZXRlclNoYXBlTm9kZSBmcm9tICcuL1BlcmltZXRlclNoYXBlTm9kZS5qcyc7XG5cbmNsYXNzIFNoYXBlUGxhY2VtZW50Qm9hcmROb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7U2hhcGVQbGFjZW1lbnRCb2FyZH0gc2hhcGVQbGFjZW1lbnRCb2FyZFxuICAgKi9cbiAgY29uc3RydWN0b3IoIHNoYXBlUGxhY2VtZW50Qm9hcmQgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBib2FyZCBpdHNlbGYuXG4gICAgY29uc3QgYm9hcmQgPSBSZWN0YW5nbGUuYm91bmRzKCBzaGFwZVBsYWNlbWVudEJvYXJkLmJvdW5kcywgeyBmaWxsOiAnd2hpdGUnLCBzdHJva2U6ICdibGFjaycgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGJvYXJkICk7XG5cbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgZ3JpZFxuICAgIGNvbnN0IGdyaWQgPSBuZXcgR3JpZCggc2hhcGVQbGFjZW1lbnRCb2FyZC5ib3VuZHMsIHNoYXBlUGxhY2VtZW50Qm9hcmQudW5pdFNxdWFyZUxlbmd0aCwgeyBzdHJva2U6ICcjQzBDMEMwJyB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggZ3JpZCApO1xuXG4gICAgLy8gVHJhY2sgYW5kIHVwZGF0ZSB0aGUgZ3JpZCB2aXNpYmlsaXR5XG4gICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5zaG93R3JpZFByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIGdyaWQsICd2aXNpYmxlJyApO1xuXG4gICAgLy8gTW9uaXRvciB0aGUgYmFja2dyb3VuZCBzaGFwZSBhbmQgYWRkL3JlbW92ZS91cGRhdGUgaXQgYXMgaXQgY2hhbmdlcy5cbiAgICB0aGlzLmJhY2tncm91bmRTaGFwZSA9IG5ldyBQZXJpbWV0ZXJTaGFwZU5vZGUoXG4gICAgICBzaGFwZVBsYWNlbWVudEJvYXJkLmJhY2tncm91bmRTaGFwZVByb3BlcnR5LFxuICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5ib3VuZHMsXG4gICAgICBzaGFwZVBsYWNlbWVudEJvYXJkLnVuaXRTcXVhcmVMZW5ndGgsXG4gICAgICBzaGFwZVBsYWNlbWVudEJvYXJkLnNob3dEaW1lbnNpb25zUHJvcGVydHksXG4gICAgICBzaGFwZVBsYWNlbWVudEJvYXJkLnNob3dHcmlkT25CYWNrZ3JvdW5kU2hhcGVQcm9wZXJ0eVxuICAgICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5iYWNrZ3JvdW5kU2hhcGUgKTtcblxuICAgIC8vIE1vbml0b3IgdGhlIHNoYXBlcyBhZGRlZCBieSB0aGUgdXNlciB0byB0aGUgYm9hcmQgYW5kIGNyZWF0ZSBhbiBlcXVpdmFsZW50IHNoYXBlIHdpdGggbm8gZWRnZXMgZm9yIGVhY2guICBUaGlzXG4gICAgLy8gbWF5IHNlZW0gYSBsaXR0bGUgb2RkIC0gd2h5IGhpZGUgdGhlIHNoYXBlcyB0aGF0IHRoZSB1c2VyIHBsYWNlZCBhbmQgZGVwaWN0IHRoZW0gd2l0aCBlc3NlbnRpYWxseSB0aGUgc2FtZVxuICAgIC8vIHRoaW5nIG1pbnVzIHRoZSBlZGdlIHN0cm9rZT8gIFRoZSByZWFzb24gaXMgdGhhdCB0aGlzIG1ha2VzIGxheWVyaW5nIGFuZCBjb250cm9sIG9mIHZpc3VhbCBtb2RlcyBtdWNoIGVhc2llci5cbiAgICBjb25zdCBzaGFwZXNMYXllciA9IG5ldyBOb2RlKCk7XG4gICAgdGhpcy5hZGRDaGlsZCggc2hhcGVzTGF5ZXIgKTtcbiAgICBzaGFwZVBsYWNlbWVudEJvYXJkLnJlc2lkZW50U2hhcGVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBhZGRlZFNoYXBlID0+IHtcbiAgICAgIGlmICggc2hhcGVQbGFjZW1lbnRCb2FyZC5mb3JtQ29tcG9zaXRlUHJvcGVydHkuZ2V0KCkgKSB7XG5cbiAgICAgICAgLy8gQWRkIGEgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNoYXBlLlxuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbiA9IG5ldyBQYXRoKCBhZGRlZFNoYXBlLnNoYXBlLCB7XG4gICAgICAgICAgZmlsbDogYWRkZWRTaGFwZS5jb2xvcixcbiAgICAgICAgICBsZWZ0OiBhZGRlZFNoYXBlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCxcbiAgICAgICAgICB0b3A6IGFkZGVkU2hhcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55XG4gICAgICAgIH0gKTtcbiAgICAgICAgc2hhcGVzTGF5ZXIuYWRkQ2hpbGQoIHJlcHJlc2VudGF0aW9uICk7XG5cbiAgICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5yZXNpZGVudFNoYXBlcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBmdW5jdGlvbiByZW1vdmFsTGlzdGVuZXIoIHJlbW92ZWRTaGFwZSApIHtcbiAgICAgICAgICBpZiAoIHJlbW92ZWRTaGFwZSA9PT0gYWRkZWRTaGFwZSApIHtcbiAgICAgICAgICAgIHNoYXBlc0xheWVyLnJlbW92ZUNoaWxkKCByZXByZXNlbnRhdGlvbiApO1xuICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgICAgc2hhcGVQbGFjZW1lbnRCb2FyZC5yZXNpZGVudFNoYXBlcy5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmFsTGlzdGVuZXIgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBBZGQgdGhlIHBlcmltZXRlciBzaGFwZSwgd2hpY2ggZGVwaWN0cyB0aGUgZXh0ZXJpb3IgYW5kIGludGVyaW9yIHBlcmltZXRlcnMgZm9ybWVkIGJ5IHRoZSBwbGFjZWQgc2hhcGVzLlxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQZXJpbWV0ZXJTaGFwZU5vZGUoXG4gICAgICBzaGFwZVBsYWNlbWVudEJvYXJkLmNvbXBvc2l0ZVNoYXBlUHJvcGVydHksXG4gICAgICBzaGFwZVBsYWNlbWVudEJvYXJkLmJvdW5kcyxcbiAgICAgIHNoYXBlUGxhY2VtZW50Qm9hcmQudW5pdFNxdWFyZUxlbmd0aCxcbiAgICAgIHNoYXBlUGxhY2VtZW50Qm9hcmQuc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eSxcbiAgICAgIG5ldyBQcm9wZXJ0eSggdHJ1ZSApIC8vIGdyaWQgb24gc2hhcGUgLSBhbHdheXMgc2hvd24gZm9yIHRoZSBjb21wb3NpdGUgc2hhcGVcbiAgICApICk7XG4gIH1cbn1cblxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdTaGFwZVBsYWNlbWVudEJvYXJkTm9kZScsIFNoYXBlUGxhY2VtZW50Qm9hcmROb2RlICk7XG5leHBvcnQgZGVmYXVsdCBTaGFwZVBsYWNlbWVudEJvYXJkTm9kZTsiXSwibmFtZXMiOlsiUHJvcGVydHkiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsImFyZWFCdWlsZGVyIiwiR3JpZCIsIlBlcmltZXRlclNoYXBlTm9kZSIsIlNoYXBlUGxhY2VtZW50Qm9hcmROb2RlIiwiY29uc3RydWN0b3IiLCJzaGFwZVBsYWNlbWVudEJvYXJkIiwiYm9hcmQiLCJib3VuZHMiLCJmaWxsIiwic3Ryb2tlIiwiYWRkQ2hpbGQiLCJncmlkIiwidW5pdFNxdWFyZUxlbmd0aCIsInNob3dHcmlkUHJvcGVydHkiLCJsaW5rQXR0cmlidXRlIiwiYmFja2dyb3VuZFNoYXBlIiwiYmFja2dyb3VuZFNoYXBlUHJvcGVydHkiLCJzaG93RGltZW5zaW9uc1Byb3BlcnR5Iiwic2hvd0dyaWRPbkJhY2tncm91bmRTaGFwZVByb3BlcnR5Iiwic2hhcGVzTGF5ZXIiLCJyZXNpZGVudFNoYXBlcyIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiYWRkZWRTaGFwZSIsImZvcm1Db21wb3NpdGVQcm9wZXJ0eSIsImdldCIsInJlcHJlc2VudGF0aW9uIiwic2hhcGUiLCJjb2xvciIsImxlZnQiLCJwb3NpdGlvblByb3BlcnR5IiwieCIsInRvcCIsInkiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwicmVtb3ZhbExpc3RlbmVyIiwicmVtb3ZlZFNoYXBlIiwicmVtb3ZlQ2hpbGQiLCJkaXNwb3NlIiwicmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciIsImNvbXBvc2l0ZVNoYXBlUHJvcGVydHkiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsY0FBYyxrQ0FBa0M7QUFDdkQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxvQ0FBb0M7QUFDMUUsT0FBT0MsaUJBQWlCLHVCQUF1QjtBQUMvQyxPQUFPQyxVQUFVLFlBQVk7QUFDN0IsT0FBT0Msd0JBQXdCLDBCQUEwQjtBQUV6RCxJQUFBLEFBQU1DLDBCQUFOLE1BQU1BLGdDQUFnQ047SUFFcEM7O0dBRUMsR0FDRE8sWUFBYUMsbUJBQW1CLENBQUc7UUFDakMsS0FBSztRQUVMLG1DQUFtQztRQUNuQyxNQUFNQyxRQUFRUCxVQUFVUSxNQUFNLENBQUVGLG9CQUFvQkUsTUFBTSxFQUFFO1lBQUVDLE1BQU07WUFBU0MsUUFBUTtRQUFRO1FBQzdGLElBQUksQ0FBQ0MsUUFBUSxDQUFFSjtRQUVmLDBCQUEwQjtRQUMxQixNQUFNSyxPQUFPLElBQUlWLEtBQU1JLG9CQUFvQkUsTUFBTSxFQUFFRixvQkFBb0JPLGdCQUFnQixFQUFFO1lBQUVILFFBQVE7UUFBVTtRQUM3RyxJQUFJLENBQUNDLFFBQVEsQ0FBRUM7UUFFZix1Q0FBdUM7UUFDdkNOLG9CQUFvQlEsZ0JBQWdCLENBQUNDLGFBQWEsQ0FBRUgsTUFBTTtRQUUxRCx1RUFBdUU7UUFDdkUsSUFBSSxDQUFDSSxlQUFlLEdBQUcsSUFBSWIsbUJBQ3pCRyxvQkFBb0JXLHVCQUF1QixFQUMzQ1gsb0JBQW9CRSxNQUFNLEVBQzFCRixvQkFBb0JPLGdCQUFnQixFQUNwQ1Asb0JBQW9CWSxzQkFBc0IsRUFDMUNaLG9CQUFvQmEsaUNBQWlDO1FBRXZELElBQUksQ0FBQ1IsUUFBUSxDQUFFLElBQUksQ0FBQ0ssZUFBZTtRQUVuQyxpSEFBaUg7UUFDakgsNkdBQTZHO1FBQzdHLGdIQUFnSDtRQUNoSCxNQUFNSSxjQUFjLElBQUl0QjtRQUN4QixJQUFJLENBQUNhLFFBQVEsQ0FBRVM7UUFDZmQsb0JBQW9CZSxjQUFjLENBQUNDLG9CQUFvQixDQUFFQyxDQUFBQTtZQUN2RCxJQUFLakIsb0JBQW9Ca0IscUJBQXFCLENBQUNDLEdBQUcsSUFBSztnQkFFckQscUNBQXFDO2dCQUNyQyxNQUFNQyxpQkFBaUIsSUFBSTNCLEtBQU13QixXQUFXSSxLQUFLLEVBQUU7b0JBQ2pEbEIsTUFBTWMsV0FBV0ssS0FBSztvQkFDdEJDLE1BQU1OLFdBQVdPLGdCQUFnQixDQUFDTCxHQUFHLEdBQUdNLENBQUM7b0JBQ3pDQyxLQUFLVCxXQUFXTyxnQkFBZ0IsQ0FBQ0wsR0FBRyxHQUFHUSxDQUFDO2dCQUMxQztnQkFDQWIsWUFBWVQsUUFBUSxDQUFFZTtnQkFFdEJwQixvQkFBb0JlLGNBQWMsQ0FBQ2Esc0JBQXNCLENBQUUsU0FBU0MsZ0JBQWlCQyxZQUFZO29CQUMvRixJQUFLQSxpQkFBaUJiLFlBQWE7d0JBQ2pDSCxZQUFZaUIsV0FBVyxDQUFFWDt3QkFDekJBLGVBQWVZLE9BQU87d0JBQ3RCaEMsb0JBQW9CZSxjQUFjLENBQUNrQix5QkFBeUIsQ0FBRUo7b0JBQ2hFO2dCQUNGO1lBQ0Y7UUFDRjtRQUVBLDJHQUEyRztRQUMzRyxJQUFJLENBQUN4QixRQUFRLENBQUUsSUFBSVIsbUJBQ2pCRyxvQkFBb0JrQyxzQkFBc0IsRUFDMUNsQyxvQkFBb0JFLE1BQU0sRUFDMUJGLG9CQUFvQk8sZ0JBQWdCLEVBQ3BDUCxvQkFBb0JZLHNCQUFzQixFQUMxQyxJQUFJckIsU0FBVSxNQUFPLHVEQUF1RDs7SUFFaEY7QUFDRjtBQUVBSSxZQUFZd0MsUUFBUSxDQUFFLDJCQUEyQnJDO0FBQ2pELGVBQWVBLHdCQUF3QiJ9