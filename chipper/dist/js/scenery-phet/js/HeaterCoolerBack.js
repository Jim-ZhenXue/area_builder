// Copyright 2015-2022, University of Colorado Boulder
/**
 * Representation of the back of a HeaterCoolerNode.  It is independent from the front of the HeaterCoolerNode so that
 * one can easily layer objects between the heater/cooler front and back.  The back contains the elliptical hole and the
 * fire and ice images.
 *
 * @author Siddhartha Chinthapally (Actual Concepts) on 20-11-2014.
 * @author Jesse Greenberg
 */ import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Color, Image, LinearGradient, Node, Path } from '../../scenery/js/imports.js';
import flame_png from '../images/flame_png.js';
import iceCubeStack_png from '../images/iceCubeStack_png.js';
import HeaterCoolerFront from './HeaterCoolerFront.js';
import sceneryPhet from './sceneryPhet.js';
const DEFAULT_WIDTH = 120; // in screen coords, much of the rest of the size of the stove derives from this value
let HeaterCoolerBack = class HeaterCoolerBack extends Node {
    /**
   * Convenience function that returns the correct position for the front of the HeaterCoolerNode.
   * Specifically, this returns the left center of the stove opening.
   */ getHeaterFrontPosition() {
        return new Vector2(this.leftTop.x, this.leftTop.y + this.width * HeaterCoolerBack.OPENING_HEIGHT_SCALE / 2);
    }
    /**
   * @param heatCoolAmountProperty // +1 for max heating, -1 for max cooling
   * @param providedOptions
   */ constructor(heatCoolAmountProperty, providedOptions){
        super();
        const options = optionize()({
            // SelfOptions
            baseColor: HeaterCoolerFront.DEFAULT_BASE_COLOR
        }, providedOptions);
        // Dimensions for the rest of the stove, dependent on the desired stove width.
        const stoveOpeningHeight = DEFAULT_WIDTH * HeaterCoolerBack.OPENING_HEIGHT_SCALE;
        // Create the inside bowl of the stove, which is an ellipse.
        const stoveBaseColor = Color.toColor(options.baseColor);
        const stoveInteriorShape = new Shape().ellipse(DEFAULT_WIDTH / 2, stoveOpeningHeight / 4, DEFAULT_WIDTH / 2, stoveOpeningHeight / 2, 0);
        const stoveInterior = new Path(stoveInteriorShape, {
            stroke: 'black',
            fill: new LinearGradient(0, 0, DEFAULT_WIDTH, 0).addColorStop(0, stoveBaseColor.darkerColor(0.5)).addColorStop(1, stoveBaseColor.brighterColor(0.5))
        });
        const fireNode = new Image(flame_png, {
            centerX: stoveInterior.centerX,
            top: stoveInterior.bottom,
            scale: DEFAULT_WIDTH / DEFAULT_WIDTH
        });
        const iceNode = new Image(iceCubeStack_png, {
            centerX: stoveInterior.centerX,
            top: stoveInterior.bottom,
            scale: DEFAULT_WIDTH / DEFAULT_WIDTH
        });
        heatCoolAmountProperty.link((heatCoolAmount)=>{
            // max heating and cooling is limited to +/- 1
            assert && assert(Math.abs(heatCoolAmount) <= 1);
            if (heatCoolAmount > 0) {
                fireNode.setTranslation((stoveInterior.width - fireNode.width) / 2, -heatCoolAmount * flame_png.height * 0.85);
            } else if (heatCoolAmount < 0) {
                iceNode.setTranslation((stoveInterior.width - iceNode.width) / 2, heatCoolAmount * iceCubeStack_png.height * 0.85);
            }
            iceNode.setVisible(heatCoolAmount < 0);
            fireNode.setVisible(heatCoolAmount > 0);
        });
        this.addChild(stoveInterior);
        this.addChild(fireNode);
        this.addChild(iceNode);
        this.mutate(options);
    }
};
// Scale factor that determines the height of the heater opening. Can be made an optional parameter if necessary.
HeaterCoolerBack.OPENING_HEIGHT_SCALE = 0.1;
export { HeaterCoolerBack as default };
sceneryPhet.register('HeaterCoolerBack', HeaterCoolerBack);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9IZWF0ZXJDb29sZXJCYWNrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBiYWNrIG9mIGEgSGVhdGVyQ29vbGVyTm9kZS4gIEl0IGlzIGluZGVwZW5kZW50IGZyb20gdGhlIGZyb250IG9mIHRoZSBIZWF0ZXJDb29sZXJOb2RlIHNvIHRoYXRcbiAqIG9uZSBjYW4gZWFzaWx5IGxheWVyIG9iamVjdHMgYmV0d2VlbiB0aGUgaGVhdGVyL2Nvb2xlciBmcm9udCBhbmQgYmFjay4gIFRoZSBiYWNrIGNvbnRhaW5zIHRoZSBlbGxpcHRpY2FsIGhvbGUgYW5kIHRoZVxuICogZmlyZSBhbmQgaWNlIGltYWdlcy5cbiAqXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpIG9uIDIwLTExLTIwMTQuXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xuICovXG5cbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgeyBDb2xvciwgSW1hZ2UsIExpbmVhckdyYWRpZW50LCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgZmxhbWVfcG5nIGZyb20gJy4uL2ltYWdlcy9mbGFtZV9wbmcuanMnO1xuaW1wb3J0IGljZUN1YmVTdGFja19wbmcgZnJvbSAnLi4vaW1hZ2VzL2ljZUN1YmVTdGFja19wbmcuanMnO1xuaW1wb3J0IEhlYXRlckNvb2xlckZyb250IGZyb20gJy4vSGVhdGVyQ29vbGVyRnJvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG5jb25zdCBERUZBVUxUX1dJRFRIID0gMTIwOyAvLyBpbiBzY3JlZW4gY29vcmRzLCBtdWNoIG9mIHRoZSByZXN0IG9mIHRoZSBzaXplIG9mIHRoZSBzdG92ZSBkZXJpdmVzIGZyb20gdGhpcyB2YWx1ZVxuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBiYXNlQ29sb3I/OiBDb2xvciB8IHN0cmluZzsgLy8gQmFzZSBjb2xvciB1c2VkIGZvciB0aGUgYm93bCBvZiB0aGUgc3RvdmVcbn07XG5cbmV4cG9ydCB0eXBlIEhlYXRlckNvb2xlckJhY2tPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGVhdGVyQ29vbGVyQmFjayBleHRlbmRzIE5vZGUge1xuXG4gIC8vIFNjYWxlIGZhY3RvciB0aGF0IGRldGVybWluZXMgdGhlIGhlaWdodCBvZiB0aGUgaGVhdGVyIG9wZW5pbmcuIENhbiBiZSBtYWRlIGFuIG9wdGlvbmFsIHBhcmFtZXRlciBpZiBuZWNlc3NhcnkuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT1BFTklOR19IRUlHSFRfU0NBTEUgPSAwLjE7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBoZWF0Q29vbEFtb3VudFByb3BlcnR5IC8vICsxIGZvciBtYXggaGVhdGluZywgLTEgZm9yIG1heCBjb29saW5nXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaGVhdENvb2xBbW91bnRQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksIHByb3ZpZGVkT3B0aW9ucz86IEhlYXRlckNvb2xlckJhY2tPcHRpb25zICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEhlYXRlckNvb2xlckJhY2tPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGJhc2VDb2xvcjogSGVhdGVyQ29vbGVyRnJvbnQuREVGQVVMVF9CQVNFX0NPTE9SXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBEaW1lbnNpb25zIGZvciB0aGUgcmVzdCBvZiB0aGUgc3RvdmUsIGRlcGVuZGVudCBvbiB0aGUgZGVzaXJlZCBzdG92ZSB3aWR0aC5cbiAgICBjb25zdCBzdG92ZU9wZW5pbmdIZWlnaHQgPSBERUZBVUxUX1dJRFRIICogSGVhdGVyQ29vbGVyQmFjay5PUEVOSU5HX0hFSUdIVF9TQ0FMRTtcblxuICAgIC8vIENyZWF0ZSB0aGUgaW5zaWRlIGJvd2wgb2YgdGhlIHN0b3ZlLCB3aGljaCBpcyBhbiBlbGxpcHNlLlxuICAgIGNvbnN0IHN0b3ZlQmFzZUNvbG9yID0gQ29sb3IudG9Db2xvciggb3B0aW9ucy5iYXNlQ29sb3IgKTtcbiAgICBjb25zdCBzdG92ZUludGVyaW9yU2hhcGUgPSBuZXcgU2hhcGUoKVxuICAgICAgLmVsbGlwc2UoIERFRkFVTFRfV0lEVEggLyAyLCBzdG92ZU9wZW5pbmdIZWlnaHQgLyA0LCBERUZBVUxUX1dJRFRIIC8gMiwgc3RvdmVPcGVuaW5nSGVpZ2h0IC8gMiwgMCApO1xuICAgIGNvbnN0IHN0b3ZlSW50ZXJpb3IgPSBuZXcgUGF0aCggc3RvdmVJbnRlcmlvclNoYXBlLCB7XG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIDAsIDAsIERFRkFVTFRfV0lEVEgsIDAgKVxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBzdG92ZUJhc2VDb2xvci5kYXJrZXJDb2xvciggMC41ICkgKVxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAxLCBzdG92ZUJhc2VDb2xvci5icmlnaHRlckNvbG9yKCAwLjUgKSApXG4gICAgfSApO1xuXG4gICAgY29uc3QgZmlyZU5vZGUgPSBuZXcgSW1hZ2UoIGZsYW1lX3BuZywge1xuICAgICAgY2VudGVyWDogc3RvdmVJbnRlcmlvci5jZW50ZXJYLFxuICAgICAgdG9wOiBzdG92ZUludGVyaW9yLmJvdHRvbSxcbiAgICAgIHNjYWxlOiBERUZBVUxUX1dJRFRIIC8gREVGQVVMVF9XSURUSFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGljZU5vZGUgPSBuZXcgSW1hZ2UoIGljZUN1YmVTdGFja19wbmcsIHtcbiAgICAgIGNlbnRlclg6IHN0b3ZlSW50ZXJpb3IuY2VudGVyWCxcbiAgICAgIHRvcDogc3RvdmVJbnRlcmlvci5ib3R0b20sXG4gICAgICBzY2FsZTogREVGQVVMVF9XSURUSCAvIERFRkFVTFRfV0lEVEhcbiAgICB9ICk7XG5cbiAgICBoZWF0Q29vbEFtb3VudFByb3BlcnR5LmxpbmsoIGhlYXRDb29sQW1vdW50ID0+IHtcblxuICAgICAgLy8gbWF4IGhlYXRpbmcgYW5kIGNvb2xpbmcgaXMgbGltaXRlZCB0byArLy0gMVxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIGhlYXRDb29sQW1vdW50ICkgPD0gMSApO1xuXG4gICAgICBpZiAoIGhlYXRDb29sQW1vdW50ID4gMCApIHtcbiAgICAgICAgZmlyZU5vZGUuc2V0VHJhbnNsYXRpb24oICggc3RvdmVJbnRlcmlvci53aWR0aCAtIGZpcmVOb2RlLndpZHRoICkgLyAyLCAtaGVhdENvb2xBbW91bnQgKiBmbGFtZV9wbmcuaGVpZ2h0ICogMC44NSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGhlYXRDb29sQW1vdW50IDwgMCApIHtcbiAgICAgICAgaWNlTm9kZS5zZXRUcmFuc2xhdGlvbiggKCBzdG92ZUludGVyaW9yLndpZHRoIC0gaWNlTm9kZS53aWR0aCApIC8gMiwgaGVhdENvb2xBbW91bnQgKiBpY2VDdWJlU3RhY2tfcG5nLmhlaWdodCAqIDAuODUgKTtcbiAgICAgIH1cbiAgICAgIGljZU5vZGUuc2V0VmlzaWJsZSggaGVhdENvb2xBbW91bnQgPCAwICk7XG4gICAgICBmaXJlTm9kZS5zZXRWaXNpYmxlKCBoZWF0Q29vbEFtb3VudCA+IDAgKTtcbiAgICB9ICk7XG5cbiAgICB0aGlzLmFkZENoaWxkKCBzdG92ZUludGVyaW9yICk7XG4gICAgdGhpcy5hZGRDaGlsZCggZmlyZU5vZGUgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBpY2VOb2RlICk7XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY29ycmVjdCBwb3NpdGlvbiBmb3IgdGhlIGZyb250IG9mIHRoZSBIZWF0ZXJDb29sZXJOb2RlLlxuICAgKiBTcGVjaWZpY2FsbHksIHRoaXMgcmV0dXJucyB0aGUgbGVmdCBjZW50ZXIgb2YgdGhlIHN0b3ZlIG9wZW5pbmcuXG4gICAqL1xuICBwdWJsaWMgZ2V0SGVhdGVyRnJvbnRQb3NpdGlvbigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMubGVmdFRvcC54LCB0aGlzLmxlZnRUb3AueSArIHRoaXMud2lkdGggKiBIZWF0ZXJDb29sZXJCYWNrLk9QRU5JTkdfSEVJR0hUX1NDQUxFIC8gMiApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnSGVhdGVyQ29vbGVyQmFjaycsIEhlYXRlckNvb2xlckJhY2sgKTsiXSwibmFtZXMiOlsiVmVjdG9yMiIsIlNoYXBlIiwib3B0aW9uaXplIiwiQ29sb3IiLCJJbWFnZSIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIlBhdGgiLCJmbGFtZV9wbmciLCJpY2VDdWJlU3RhY2tfcG5nIiwiSGVhdGVyQ29vbGVyRnJvbnQiLCJzY2VuZXJ5UGhldCIsIkRFRkFVTFRfV0lEVEgiLCJIZWF0ZXJDb29sZXJCYWNrIiwiZ2V0SGVhdGVyRnJvbnRQb3NpdGlvbiIsImxlZnRUb3AiLCJ4IiwieSIsIndpZHRoIiwiT1BFTklOR19IRUlHSFRfU0NBTEUiLCJoZWF0Q29vbEFtb3VudFByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImJhc2VDb2xvciIsIkRFRkFVTFRfQkFTRV9DT0xPUiIsInN0b3ZlT3BlbmluZ0hlaWdodCIsInN0b3ZlQmFzZUNvbG9yIiwidG9Db2xvciIsInN0b3ZlSW50ZXJpb3JTaGFwZSIsImVsbGlwc2UiLCJzdG92ZUludGVyaW9yIiwic3Ryb2tlIiwiZmlsbCIsImFkZENvbG9yU3RvcCIsImRhcmtlckNvbG9yIiwiYnJpZ2h0ZXJDb2xvciIsImZpcmVOb2RlIiwiY2VudGVyWCIsInRvcCIsImJvdHRvbSIsInNjYWxlIiwiaWNlTm9kZSIsImxpbmsiLCJoZWF0Q29vbEFtb3VudCIsImFzc2VydCIsIk1hdGgiLCJhYnMiLCJzZXRUcmFuc2xhdGlvbiIsImhlaWdodCIsInNldFZpc2libGUiLCJhZGRDaGlsZCIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUdELE9BQU9BLGFBQWEsMEJBQTBCO0FBQzlDLFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsU0FBU0MsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLGNBQWMsRUFBRUMsSUFBSSxFQUFlQyxJQUFJLFFBQVEsOEJBQThCO0FBQ3BHLE9BQU9DLGVBQWUseUJBQXlCO0FBQy9DLE9BQU9DLHNCQUFzQixnQ0FBZ0M7QUFDN0QsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDLE1BQU1DLGdCQUFnQixLQUFLLHNGQUFzRjtBQVFsRyxJQUFBLEFBQU1DLG1CQUFOLE1BQU1BLHlCQUF5QlA7SUFrRTVDOzs7R0FHQyxHQUNELEFBQU9RLHlCQUFrQztRQUN2QyxPQUFPLElBQUlkLFFBQVMs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