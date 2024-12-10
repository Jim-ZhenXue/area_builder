// Copyright 2014-2022, University of Colorado Boulder
/**
 * A Scenery node that depicts a grid with squares on it.  This is used in several places in the simulation to create
 * icons that look like the things that the user might create when using the simulation.
 *
 * @author John Blanco
 */ import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, Node, Rectangle } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import Grid from './Grid.js';
let GridIcon = class GridIcon extends Node {
    /**
   * @param {number} columns
   * @param {number} rows
   * @param {number} cellLength
   * @param {string} shapeFillColor
   * @param {Array.<Vector2>} occupiedCells
   * @param {Object} [options]
   */ constructor(columns, rows, cellLength, shapeFillColor, occupiedCells, options){
        super();
        options = merge({
            // defaults
            gridStroke: 'black',
            gridLineWidth: 1,
            backgroundStroke: null,
            backgroundFill: 'white',
            backgroundLineWidth: 1,
            shapeStroke: new Color(shapeFillColor).colorUtilsDarker(0.2),
            shapeLineWidth: 1
        }, options);
        this.addChild(new Rectangle(0, 0, columns * cellLength, rows * cellLength, 0, 0, {
            fill: options.backgroundFill,
            stroke: options.backgroundStroke,
            lineWidth: options.backgroundLineWidth
        }));
        this.addChild(new Grid(new Bounds2(0, 0, columns * cellLength, rows * cellLength), cellLength, {
            stroke: options.gridStroke,
            lineWidth: options.gridLineWidth,
            fill: options.gridFill
        }));
        occupiedCells.forEach((occupiedCell)=>{
            this.addChild(new Rectangle(0, 0, cellLength, cellLength, 0, 0, {
                fill: shapeFillColor,
                stroke: options.shapeStroke,
                lineWidth: options.shapeLineWidth,
                left: occupiedCell.x * cellLength,
                top: occupiedCell.y * cellLength
            }));
        });
        // Pass options through to the parent class.
        this.mutate(options);
    }
};
areaBuilder.register('GridIcon', GridIcon);
export default GridIcon;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vdmlldy9HcmlkSWNvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIFNjZW5lcnkgbm9kZSB0aGF0IGRlcGljdHMgYSBncmlkIHdpdGggc3F1YXJlcyBvbiBpdC4gIFRoaXMgaXMgdXNlZCBpbiBzZXZlcmFsIHBsYWNlcyBpbiB0aGUgc2ltdWxhdGlvbiB0byBjcmVhdGVcbiAqIGljb25zIHRoYXQgbG9vayBsaWtlIHRoZSB0aGluZ3MgdGhhdCB0aGUgdXNlciBtaWdodCBjcmVhdGUgd2hlbiB1c2luZyB0aGUgc2ltdWxhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgeyBDb2xvciwgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XG5pbXBvcnQgR3JpZCBmcm9tICcuL0dyaWQuanMnO1xuXG5jbGFzcyBHcmlkSWNvbiBleHRlbmRzIE5vZGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gY29sdW1uc1xuICAgKiBAcGFyYW0ge251bWJlcn0gcm93c1xuICAgKiBAcGFyYW0ge251bWJlcn0gY2VsbExlbmd0aFxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2hhcGVGaWxsQ29sb3JcbiAgICogQHBhcmFtIHtBcnJheS48VmVjdG9yMj59IG9jY3VwaWVkQ2VsbHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIGNvbHVtbnMsIHJvd3MsIGNlbGxMZW5ndGgsIHNoYXBlRmlsbENvbG9yLCBvY2N1cGllZENlbGxzLCBvcHRpb25zICkge1xuXG4gICAgc3VwZXIoKTtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgLy8gZGVmYXVsdHNcbiAgICAgIGdyaWRTdHJva2U6ICdibGFjaycsXG4gICAgICBncmlkTGluZVdpZHRoOiAxLFxuICAgICAgYmFja2dyb3VuZFN0cm9rZTogbnVsbCxcbiAgICAgIGJhY2tncm91bmRGaWxsOiAnd2hpdGUnLFxuICAgICAgYmFja2dyb3VuZExpbmVXaWR0aDogMSxcbiAgICAgIHNoYXBlU3Ryb2tlOiBuZXcgQ29sb3IoIHNoYXBlRmlsbENvbG9yICkuY29sb3JVdGlsc0RhcmtlciggMC4yICksIC8vIGRhcmtlbmluZyBmYWN0b3IgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxuICAgICAgc2hhcGVMaW5lV2lkdGg6IDFcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBjb2x1bW5zICogY2VsbExlbmd0aCwgcm93cyAqIGNlbGxMZW5ndGgsIDAsIDAsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuYmFja2dyb3VuZEZpbGwsXG4gICAgICBzdHJva2U6IG9wdGlvbnMuYmFja2dyb3VuZFN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5iYWNrZ3JvdW5kTGluZVdpZHRoXG4gICAgfSApICk7XG5cbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgR3JpZCggbmV3IEJvdW5kczIoIDAsIDAsIGNvbHVtbnMgKiBjZWxsTGVuZ3RoLCByb3dzICogY2VsbExlbmd0aCApLCBjZWxsTGVuZ3RoLCB7XG4gICAgICBzdHJva2U6IG9wdGlvbnMuZ3JpZFN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5ncmlkTGluZVdpZHRoLFxuICAgICAgZmlsbDogb3B0aW9ucy5ncmlkRmlsbFxuICAgIH0gKSApO1xuXG4gICAgb2NjdXBpZWRDZWxscy5mb3JFYWNoKCBvY2N1cGllZENlbGwgPT4ge1xuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggMCwgMCwgY2VsbExlbmd0aCwgY2VsbExlbmd0aCwgMCwgMCwge1xuICAgICAgICBmaWxsOiBzaGFwZUZpbGxDb2xvcixcbiAgICAgICAgc3Ryb2tlOiBvcHRpb25zLnNoYXBlU3Ryb2tlLFxuICAgICAgICBsaW5lV2lkdGg6IG9wdGlvbnMuc2hhcGVMaW5lV2lkdGgsXG4gICAgICAgIGxlZnQ6IG9jY3VwaWVkQ2VsbC54ICogY2VsbExlbmd0aCxcbiAgICAgICAgdG9wOiBvY2N1cGllZENlbGwueSAqIGNlbGxMZW5ndGhcbiAgICAgIH0gKSApO1xuICAgIH0gKTtcblxuICAgIC8vIFBhc3Mgb3B0aW9ucyB0aHJvdWdoIHRvIHRoZSBwYXJlbnQgY2xhc3MuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0dyaWRJY29uJywgR3JpZEljb24gKTtcbmV4cG9ydCBkZWZhdWx0IEdyaWRJY29uOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwibWVyZ2UiLCJDb2xvciIsIk5vZGUiLCJSZWN0YW5nbGUiLCJhcmVhQnVpbGRlciIsIkdyaWQiLCJHcmlkSWNvbiIsImNvbnN0cnVjdG9yIiwiY29sdW1ucyIsInJvd3MiLCJjZWxsTGVuZ3RoIiwic2hhcGVGaWxsQ29sb3IiLCJvY2N1cGllZENlbGxzIiwib3B0aW9ucyIsImdyaWRTdHJva2UiLCJncmlkTGluZVdpZHRoIiwiYmFja2dyb3VuZFN0cm9rZSIsImJhY2tncm91bmRGaWxsIiwiYmFja2dyb3VuZExpbmVXaWR0aCIsInNoYXBlU3Ryb2tlIiwiY29sb3JVdGlsc0RhcmtlciIsInNoYXBlTGluZVdpZHRoIiwiYWRkQ2hpbGQiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiZ3JpZEZpbGwiLCJmb3JFYWNoIiwib2NjdXBpZWRDZWxsIiwibGVmdCIsIngiLCJ0b3AiLCJ5IiwibXV0YXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLFdBQVcsb0NBQW9DO0FBQ3RELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxTQUFTLFFBQVEsb0NBQW9DO0FBQzNFLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0MsVUFBVSxZQUFZO0FBRTdCLElBQUEsQUFBTUMsV0FBTixNQUFNQSxpQkFBaUJKO0lBRXJCOzs7Ozs7O0dBT0MsR0FDREssWUFBYUMsT0FBTyxFQUFFQyxJQUFJLEVBQUVDLFVBQVUsRUFBRUMsY0FBYyxFQUFFQyxhQUFhLEVBQUVDLE9BQU8sQ0FBRztRQUUvRSxLQUFLO1FBRUxBLFVBQVViLE1BQU87WUFDZixXQUFXO1lBQ1hjLFlBQVk7WUFDWkMsZUFBZTtZQUNmQyxrQkFBa0I7WUFDbEJDLGdCQUFnQjtZQUNoQkMscUJBQXFCO1lBQ3JCQyxhQUFhLElBQUlsQixNQUFPVSxnQkFBaUJTLGdCQUFnQixDQUFFO1lBQzNEQyxnQkFBZ0I7UUFDbEIsR0FBR1I7UUFFSCxJQUFJLENBQUNTLFFBQVEsQ0FBRSxJQUFJbkIsVUFBVyxHQUFHLEdBQUdLLFVBQVVFLFlBQVlELE9BQU9DLFlBQVksR0FBRyxHQUFHO1lBQ2pGYSxNQUFNVixRQUFRSSxjQUFjO1lBQzVCTyxRQUFRWCxRQUFRRyxnQkFBZ0I7WUFDaENTLFdBQVdaLFFBQVFLLG1CQUFtQjtRQUN4QztRQUVBLElBQUksQ0FBQ0ksUUFBUSxDQUFFLElBQUlqQixLQUFNLElBQUlOLFFBQVMsR0FBRyxHQUFHUyxVQUFVRSxZQUFZRCxPQUFPQyxhQUFjQSxZQUFZO1lBQ2pHYyxRQUFRWCxRQUFRQyxVQUFVO1lBQzFCVyxXQUFXWixRQUFRRSxhQUFhO1lBQ2hDUSxNQUFNVixRQUFRYSxRQUFRO1FBQ3hCO1FBRUFkLGNBQWNlLE9BQU8sQ0FBRUMsQ0FBQUE7WUFDckIsSUFBSSxDQUFDTixRQUFRLENBQUUsSUFBSW5CLFVBQVcsR0FBRyxHQUFHTyxZQUFZQSxZQUFZLEdBQUcsR0FBRztnQkFDaEVhLE1BQU1aO2dCQUNOYSxRQUFRWCxRQUFRTSxXQUFXO2dCQUMzQk0sV0FBV1osUUFBUVEsY0FBYztnQkFDakNRLE1BQU1ELGFBQWFFLENBQUMsR0FBR3BCO2dCQUN2QnFCLEtBQUtILGFBQWFJLENBQUMsR0FBR3RCO1lBQ3hCO1FBQ0Y7UUFFQSw0Q0FBNEM7UUFDNUMsSUFBSSxDQUFDdUIsTUFBTSxDQUFFcEI7SUFDZjtBQUNGO0FBRUFULFlBQVk4QixRQUFRLENBQUUsWUFBWTVCO0FBQ2xDLGVBQWVBLFNBQVMifQ==