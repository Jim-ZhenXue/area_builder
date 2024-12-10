// Copyright 2015-2024, University of Colorado Boulder
/**
 * Shows the bounds of current fitted blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Matrix3 from '../../../dot/js/Matrix3.js';
import { Shape } from '../../../kite/js/imports.js';
import { BackboneDrawable, FittedBlock, scenery, ShapeBasedOverlay } from '../imports.js';
let FittedBlockBoundsOverlay = class FittedBlockBoundsOverlay extends ShapeBasedOverlay {
    addShapes() {
        const self = this; // eslint-disable-line @typescript-eslint/no-this-alias
        function processBackbone(backbone, matrix) {
            if (backbone.willApplyTransform) {
                matrix = matrix.timesMatrix(backbone.backboneInstance.relativeTransform.matrix);
            }
            backbone.blocks.forEach((block)=>{
                processBlock(block, matrix);
            });
        }
        function processBlock(block, matrix) {
            if (block instanceof FittedBlock && !block.fitBounds.isEmpty()) {
                self.addShape(Shape.bounds(block.fitBounds).transformed(matrix), 'rgba(255,0,0,0.8)', true);
            }
            if (block.firstDrawable && block.lastDrawable) {
                for(let childDrawable = block.firstDrawable; childDrawable !== block.lastDrawable; childDrawable = childDrawable.nextDrawable){
                    processDrawable(childDrawable, matrix);
                }
                processDrawable(block.lastDrawable, matrix);
            }
        }
        function processDrawable(drawable, matrix) {
            // How we detect backbones (for now)
            if (drawable instanceof BackboneDrawable) {
                processBackbone(drawable, matrix);
            }
        }
        processBackbone(this.display.rootBackbone, Matrix3.IDENTITY);
    }
    constructor(display, rootNode){
        super(display, rootNode, 'canvasNodeBoundsOverlay');
    }
};
export { FittedBlockBoundsOverlay as default };
scenery.register('FittedBlockBoundsOverlay', FittedBlockBoundsOverlay);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvb3ZlcmxheXMvRml0dGVkQmxvY2tCb3VuZHNPdmVybGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNob3dzIHRoZSBib3VuZHMgb2YgY3VycmVudCBmaXR0ZWQgYmxvY2tzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBCYWNrYm9uZURyYXdhYmxlLCBCbG9jaywgRGlzcGxheSwgRHJhd2FibGUsIEZpdHRlZEJsb2NrLCBOb2RlLCBzY2VuZXJ5LCBTaGFwZUJhc2VkT3ZlcmxheSwgVE92ZXJsYXkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRml0dGVkQmxvY2tCb3VuZHNPdmVybGF5IGV4dGVuZHMgU2hhcGVCYXNlZE92ZXJsYXkgaW1wbGVtZW50cyBUT3ZlcmxheSB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzcGxheTogRGlzcGxheSwgcm9vdE5vZGU6IE5vZGUgKSB7XG4gICAgc3VwZXIoIGRpc3BsYXksIHJvb3ROb2RlLCAnY2FudmFzTm9kZUJvdW5kc092ZXJsYXknICk7XG4gIH1cblxuICBwdWJsaWMgYWRkU2hhcGVzKCk6IHZvaWQge1xuXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcblxuICAgIGZ1bmN0aW9uIHByb2Nlc3NCYWNrYm9uZSggYmFja2JvbmU6IEJhY2tib25lRHJhd2FibGUsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcbiAgICAgIGlmICggYmFja2JvbmUud2lsbEFwcGx5VHJhbnNmb3JtICkge1xuICAgICAgICBtYXRyaXggPSBtYXRyaXgudGltZXNNYXRyaXgoIGJhY2tib25lLmJhY2tib25lSW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ubWF0cml4ICk7XG4gICAgICB9XG4gICAgICBiYWNrYm9uZS5ibG9ja3MuZm9yRWFjaCggKCBibG9jazogQmxvY2sgKSA9PiB7XG4gICAgICAgIHByb2Nlc3NCbG9jayggYmxvY2ssIG1hdHJpeCApO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByb2Nlc3NCbG9jayggYmxvY2s6IEJsb2NrLCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XG4gICAgICBpZiAoIGJsb2NrIGluc3RhbmNlb2YgRml0dGVkQmxvY2sgJiYgIWJsb2NrLmZpdEJvdW5kcyEuaXNFbXB0eSgpICkge1xuICAgICAgICBzZWxmLmFkZFNoYXBlKCBTaGFwZS5ib3VuZHMoIGJsb2NrLmZpdEJvdW5kcyEgKS50cmFuc2Zvcm1lZCggbWF0cml4ICksICdyZ2JhKDI1NSwwLDAsMC44KScsIHRydWUgKTtcbiAgICAgIH1cbiAgICAgIGlmICggYmxvY2suZmlyc3REcmF3YWJsZSAmJiBibG9jay5sYXN0RHJhd2FibGUgKSB7XG4gICAgICAgIGZvciAoIGxldCBjaGlsZERyYXdhYmxlID0gYmxvY2suZmlyc3REcmF3YWJsZTsgY2hpbGREcmF3YWJsZSAhPT0gYmxvY2subGFzdERyYXdhYmxlOyBjaGlsZERyYXdhYmxlID0gY2hpbGREcmF3YWJsZS5uZXh0RHJhd2FibGUgKSB7XG4gICAgICAgICAgcHJvY2Vzc0RyYXdhYmxlKCBjaGlsZERyYXdhYmxlLCBtYXRyaXggKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzRHJhd2FibGUoIGJsb2NrLmxhc3REcmF3YWJsZSwgbWF0cml4ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0RyYXdhYmxlKCBkcmF3YWJsZTogRHJhd2FibGUsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcbiAgICAgIC8vIEhvdyB3ZSBkZXRlY3QgYmFja2JvbmVzIChmb3Igbm93KVxuICAgICAgaWYgKCBkcmF3YWJsZSBpbnN0YW5jZW9mIEJhY2tib25lRHJhd2FibGUgKSB7XG4gICAgICAgIHByb2Nlc3NCYWNrYm9uZSggZHJhd2FibGUsIG1hdHJpeCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHByb2Nlc3NCYWNrYm9uZSggdGhpcy5kaXNwbGF5LnJvb3RCYWNrYm9uZSwgTWF0cml4My5JREVOVElUWSApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdGaXR0ZWRCbG9ja0JvdW5kc092ZXJsYXknLCBGaXR0ZWRCbG9ja0JvdW5kc092ZXJsYXkgKTsiXSwibmFtZXMiOlsiTWF0cml4MyIsIlNoYXBlIiwiQmFja2JvbmVEcmF3YWJsZSIsIkZpdHRlZEJsb2NrIiwic2NlbmVyeSIsIlNoYXBlQmFzZWRPdmVybGF5IiwiRml0dGVkQmxvY2tCb3VuZHNPdmVybGF5IiwiYWRkU2hhcGVzIiwic2VsZiIsInByb2Nlc3NCYWNrYm9uZSIsImJhY2tib25lIiwibWF0cml4Iiwid2lsbEFwcGx5VHJhbnNmb3JtIiwidGltZXNNYXRyaXgiLCJiYWNrYm9uZUluc3RhbmNlIiwicmVsYXRpdmVUcmFuc2Zvcm0iLCJibG9ja3MiLCJmb3JFYWNoIiwiYmxvY2siLCJwcm9jZXNzQmxvY2siLCJmaXRCb3VuZHMiLCJpc0VtcHR5IiwiYWRkU2hhcGUiLCJib3VuZHMiLCJ0cmFuc2Zvcm1lZCIsImZpcnN0RHJhd2FibGUiLCJsYXN0RHJhd2FibGUiLCJjaGlsZERyYXdhYmxlIiwibmV4dERyYXdhYmxlIiwicHJvY2Vzc0RyYXdhYmxlIiwiZHJhd2FibGUiLCJkaXNwbGF5Iiwicm9vdEJhY2tib25lIiwiSURFTlRJVFkiLCJyb290Tm9kZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGFBQWEsNkJBQTZCO0FBQ2pELFNBQVNDLEtBQUssUUFBUSw4QkFBOEI7QUFDcEQsU0FBU0MsZ0JBQWdCLEVBQTRCQyxXQUFXLEVBQVFDLE9BQU8sRUFBRUMsaUJBQWlCLFFBQWtCLGdCQUFnQjtBQUVySCxJQUFBLEFBQU1DLDJCQUFOLE1BQU1BLGlDQUFpQ0Q7SUFLN0NFLFlBQWtCO1FBRXZCLE1BQU1DLE9BQU8sSUFBSSxFQUFFLHVEQUF1RDtRQUUxRSxTQUFTQyxnQkFBaUJDLFFBQTBCLEVBQUVDLE1BQWU7WUFDbkUsSUFBS0QsU0FBU0Usa0JBQWtCLEVBQUc7Z0JBQ2pDRCxTQUFTQSxPQUFPRSxXQUFXLENBQUVILFNBQVNJLGdCQUFnQixDQUFDQyxpQkFBaUIsQ0FBQ0osTUFBTTtZQUNqRjtZQUNBRCxTQUFTTSxNQUFNLENBQUNDLE9BQU8sQ0FBRSxDQUFFQztnQkFDekJDLGFBQWNELE9BQU9QO1lBQ3ZCO1FBQ0Y7UUFFQSxTQUFTUSxhQUFjRCxLQUFZLEVBQUVQLE1BQWU7WUFDbEQsSUFBS08saUJBQWlCZixlQUFlLENBQUNlLE1BQU1FLFNBQVMsQ0FBRUMsT0FBTyxJQUFLO2dCQUNqRWIsS0FBS2MsUUFBUSxDQUFFckIsTUFBTXNCLE1BQU0sQ0FBRUwsTUFBTUUsU0FBUyxFQUFJSSxXQUFXLENBQUViLFNBQVUscUJBQXFCO1lBQzlGO1lBQ0EsSUFBS08sTUFBTU8sYUFBYSxJQUFJUCxNQUFNUSxZQUFZLEVBQUc7Z0JBQy9DLElBQU0sSUFBSUMsZ0JBQWdCVCxNQUFNTyxhQUFhLEVBQUVFLGtCQUFrQlQsTUFBTVEsWUFBWSxFQUFFQyxnQkFBZ0JBLGNBQWNDLFlBQVksQ0FBRztvQkFDaElDLGdCQUFpQkYsZUFBZWhCO2dCQUNsQztnQkFDQWtCLGdCQUFpQlgsTUFBTVEsWUFBWSxFQUFFZjtZQUN2QztRQUNGO1FBRUEsU0FBU2tCLGdCQUFpQkMsUUFBa0IsRUFBRW5CLE1BQWU7WUFDM0Qsb0NBQW9DO1lBQ3BDLElBQUttQixvQkFBb0I1QixrQkFBbUI7Z0JBQzFDTyxnQkFBaUJxQixVQUFVbkI7WUFDN0I7UUFDRjtRQUVBRixnQkFBaUIsSUFBSSxDQUFDc0IsT0FBTyxDQUFDQyxZQUFZLEVBQUVoQyxRQUFRaUMsUUFBUTtJQUM5RDtJQXJDQSxZQUFvQkYsT0FBZ0IsRUFBRUcsUUFBYyxDQUFHO1FBQ3JELEtBQUssQ0FBRUgsU0FBU0csVUFBVTtJQUM1QjtBQW9DRjtBQXZDQSxTQUFxQjVCLHNDQXVDcEI7QUFFREYsUUFBUStCLFFBQVEsQ0FBRSw0QkFBNEI3QiJ9