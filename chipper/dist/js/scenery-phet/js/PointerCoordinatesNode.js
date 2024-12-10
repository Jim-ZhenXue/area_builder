// Copyright 2019-2024, University of Colorado Boulder
/**
 * Shows the model and view coordinates that correspond to the cursor position.
 * Originally implemented for use in gas-properties, where it was used exclusively for debugging.
 * CAUTION! This adds a listener to the Display, see notes below.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Utils from '../../dot/js/Utils.js';
import getGlobal from '../../phet-core/js/getGlobal.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Rectangle, RichText } from '../../scenery/js/imports.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
const DEFAULT_FONT = new PhetFont(14);
let PointerCoordinatesNode = class PointerCoordinatesNode extends Node {
    /**
   * @param modelViewTransform
   * @param providedOptions - not propagated to super!
   */ constructor(modelViewTransform, providedOptions){
        const options = optionize()({
            display: getGlobal('phet.joist.display'),
            pickable: false,
            font: DEFAULT_FONT,
            textColor: 'black',
            align: 'center',
            modelDecimalPlaces: 1,
            viewDecimalPlaces: 0,
            backgroundColor: 'rgba( 255, 255, 255, 0.5 )'
        }, providedOptions);
        const textNode = new RichText('', {
            font: options.font,
            fill: options.textColor,
            align: options.align
        });
        const backgroundNode = new Rectangle(0, 0, 1, 1, {
            fill: options.backgroundColor
        });
        super({
            children: [
                backgroundNode,
                textNode
            ],
            pickable: false
        });
        // Update the coordinates to match the pointer position.
        // Add the input listener to the Display, so that other things in the sim will receive events.
        // Scenery does not support having one event sent through two different trails.
        // Note that this will continue to receive events when the current screen is inactive!
        options.display.addInputListener({
            move: (event)=>{
                // (x,y) in view coordinates
                const viewPoint = this.globalToParentPoint(event.pointer.point);
                const xView = Utils.toFixed(viewPoint.x, options.viewDecimalPlaces);
                const yView = Utils.toFixed(viewPoint.y, options.viewDecimalPlaces);
                // (x,y) in model coordinates
                const modelPoint = modelViewTransform.viewToModelPosition(viewPoint);
                const xModel = Utils.toFixed(modelPoint.x, options.modelDecimalPlaces);
                const yModel = Utils.toFixed(modelPoint.y, options.modelDecimalPlaces);
                // Update coordinates display.
                textNode.string = `(${xView},${yView})<br>(${xModel},${yModel})`;
                // Resize background
                backgroundNode.setRect(0, 0, textNode.width + 4, textNode.height + 4);
                textNode.center = backgroundNode.center;
                // Center above the cursor.
                this.centerX = viewPoint.x;
                this.bottom = viewPoint.y - 3;
            }
        });
    }
};
export { PointerCoordinatesNode as default };
sceneryPhet.register('PointerCoordinatesNode', PointerCoordinatesNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Qb2ludGVyQ29vcmRpbmF0ZXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNob3dzIHRoZSBtb2RlbCBhbmQgdmlldyBjb29yZGluYXRlcyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGN1cnNvciBwb3NpdGlvbi5cbiAqIE9yaWdpbmFsbHkgaW1wbGVtZW50ZWQgZm9yIHVzZSBpbiBnYXMtcHJvcGVydGllcywgd2hlcmUgaXQgd2FzIHVzZWQgZXhjbHVzaXZlbHkgZm9yIGRlYnVnZ2luZy5cbiAqIENBVVRJT04hIFRoaXMgYWRkcyBhIGxpc3RlbmVyIHRvIHRoZSBEaXNwbGF5LCBzZWUgbm90ZXMgYmVsb3cuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBnZXRHbG9iYWwgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2dldEdsb2JhbC5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xuaW1wb3J0IHsgRGlzcGxheSwgRm9udCwgTm9kZSwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgUmljaFRleHRBbGlnbiwgU2NlbmVyeUV2ZW50LCBUQ29sb3IgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG5jb25zdCBERUZBVUxUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgZGlzcGxheT86IERpc3BsYXk7XG4gIHBpY2thYmxlPzogYm9vbGVhbjtcblxuICAvLyBSaWNoVGV4dFxuICBmb250PzogRm9udDtcbiAgdGV4dENvbG9yPzogVENvbG9yO1xuICBhbGlnbj86IFJpY2hUZXh0QWxpZ247XG4gIG1vZGVsRGVjaW1hbFBsYWNlcz86IG51bWJlcjtcbiAgdmlld0RlY2ltYWxQbGFjZXM/OiBudW1iZXI7XG5cbiAgLy8gUmVjdGFuZ2xlXG4gIGJhY2tncm91bmRDb2xvcj86IFRDb2xvcjtcbn07XG5cbmV4cG9ydCB0eXBlIFBvaW50ZXJDb29yZGluYXRlc05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnM7IC8vIG5vdCBwcm9wYWdhdGVkIHRvIHN1cGVyIVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludGVyQ29vcmRpbmF0ZXNOb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtb2RlbFZpZXdUcmFuc2Zvcm1cbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9ucyAtIG5vdCBwcm9wYWdhdGVkIHRvIHN1cGVyIVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsIHByb3ZpZGVkT3B0aW9ucz86IFBvaW50ZXJDb29yZGluYXRlc05vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQb2ludGVyQ29vcmRpbmF0ZXNOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnM+KCkoIHtcbiAgICAgIGRpc3BsYXk6IGdldEdsb2JhbCggJ3BoZXQuam9pc3QuZGlzcGxheScgKSxcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcbiAgICAgIGZvbnQ6IERFRkFVTFRfRk9OVCxcbiAgICAgIHRleHRDb2xvcjogJ2JsYWNrJyxcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgIG1vZGVsRGVjaW1hbFBsYWNlczogMSxcbiAgICAgIHZpZXdEZWNpbWFsUGxhY2VzOiAwLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSggMjU1LCAyNTUsIDI1NSwgMC41ICknXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCB0ZXh0Tm9kZSA9IG5ldyBSaWNoVGV4dCggJycsIHtcbiAgICAgIGZvbnQ6IG9wdGlvbnMuZm9udCxcbiAgICAgIGZpbGw6IG9wdGlvbnMudGV4dENvbG9yLFxuICAgICAgYWxpZ246IG9wdGlvbnMuYWxpZ25cbiAgICB9ICk7XG5cbiAgICBjb25zdCBiYWNrZ3JvdW5kTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEsIDEsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuYmFja2dyb3VuZENvbG9yXG4gICAgfSApO1xuXG4gICAgc3VwZXIoIHtcbiAgICAgIGNoaWxkcmVuOiBbIGJhY2tncm91bmROb2RlLCB0ZXh0Tm9kZSBdLFxuICAgICAgcGlja2FibGU6IGZhbHNlXG4gICAgfSApO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBjb29yZGluYXRlcyB0byBtYXRjaCB0aGUgcG9pbnRlciBwb3NpdGlvbi5cbiAgICAvLyBBZGQgdGhlIGlucHV0IGxpc3RlbmVyIHRvIHRoZSBEaXNwbGF5LCBzbyB0aGF0IG90aGVyIHRoaW5ncyBpbiB0aGUgc2ltIHdpbGwgcmVjZWl2ZSBldmVudHMuXG4gICAgLy8gU2NlbmVyeSBkb2VzIG5vdCBzdXBwb3J0IGhhdmluZyBvbmUgZXZlbnQgc2VudCB0aHJvdWdoIHR3byBkaWZmZXJlbnQgdHJhaWxzLlxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIHdpbGwgY29udGludWUgdG8gcmVjZWl2ZSBldmVudHMgd2hlbiB0aGUgY3VycmVudCBzY3JlZW4gaXMgaW5hY3RpdmUhXG4gICAgb3B0aW9ucy5kaXNwbGF5LmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICAgIG1vdmU6ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHtcblxuICAgICAgICAvLyAoeCx5KSBpbiB2aWV3IGNvb3JkaW5hdGVzXG4gICAgICAgIGNvbnN0IHZpZXdQb2ludCA9IHRoaXMuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xuICAgICAgICBjb25zdCB4VmlldyA9IFV0aWxzLnRvRml4ZWQoIHZpZXdQb2ludC54LCBvcHRpb25zLnZpZXdEZWNpbWFsUGxhY2VzICk7XG4gICAgICAgIGNvbnN0IHlWaWV3ID0gVXRpbHMudG9GaXhlZCggdmlld1BvaW50LnksIG9wdGlvbnMudmlld0RlY2ltYWxQbGFjZXMgKTtcblxuICAgICAgICAvLyAoeCx5KSBpbiBtb2RlbCBjb29yZGluYXRlc1xuICAgICAgICBjb25zdCBtb2RlbFBvaW50ID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsUG9zaXRpb24oIHZpZXdQb2ludCApO1xuICAgICAgICBjb25zdCB4TW9kZWwgPSBVdGlscy50b0ZpeGVkKCBtb2RlbFBvaW50LngsIG9wdGlvbnMubW9kZWxEZWNpbWFsUGxhY2VzICk7XG4gICAgICAgIGNvbnN0IHlNb2RlbCA9IFV0aWxzLnRvRml4ZWQoIG1vZGVsUG9pbnQueSwgb3B0aW9ucy5tb2RlbERlY2ltYWxQbGFjZXMgKTtcblxuICAgICAgICAvLyBVcGRhdGUgY29vcmRpbmF0ZXMgZGlzcGxheS5cbiAgICAgICAgdGV4dE5vZGUuc3RyaW5nID0gYCgke3hWaWV3fSwke3lWaWV3fSk8YnI+KCR7eE1vZGVsfSwke3lNb2RlbH0pYDtcblxuICAgICAgICAvLyBSZXNpemUgYmFja2dyb3VuZFxuICAgICAgICBiYWNrZ3JvdW5kTm9kZS5zZXRSZWN0KCAwLCAwLCB0ZXh0Tm9kZS53aWR0aCArIDQsIHRleHROb2RlLmhlaWdodCArIDQgKTtcbiAgICAgICAgdGV4dE5vZGUuY2VudGVyID0gYmFja2dyb3VuZE5vZGUuY2VudGVyO1xuXG4gICAgICAgIC8vIENlbnRlciBhYm92ZSB0aGUgY3Vyc29yLlxuICAgICAgICB0aGlzLmNlbnRlclggPSB2aWV3UG9pbnQueDtcbiAgICAgICAgdGhpcy5ib3R0b20gPSB2aWV3UG9pbnQueSAtIDM7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnUG9pbnRlckNvb3JkaW5hdGVzTm9kZScsIFBvaW50ZXJDb29yZGluYXRlc05vZGUgKTsiXSwibmFtZXMiOlsiVXRpbHMiLCJnZXRHbG9iYWwiLCJvcHRpb25pemUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiUmljaFRleHQiLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiREVGQVVMVF9GT05UIiwiUG9pbnRlckNvb3JkaW5hdGVzTm9kZSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJkaXNwbGF5IiwicGlja2FibGUiLCJmb250IiwidGV4dENvbG9yIiwiYWxpZ24iLCJtb2RlbERlY2ltYWxQbGFjZXMiLCJ2aWV3RGVjaW1hbFBsYWNlcyIsImJhY2tncm91bmRDb2xvciIsInRleHROb2RlIiwiZmlsbCIsImJhY2tncm91bmROb2RlIiwiY2hpbGRyZW4iLCJhZGRJbnB1dExpc3RlbmVyIiwibW92ZSIsImV2ZW50Iiwidmlld1BvaW50IiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsInhWaWV3IiwidG9GaXhlZCIsIngiLCJ5VmlldyIsInkiLCJtb2RlbFBvaW50Iiwidmlld1RvTW9kZWxQb3NpdGlvbiIsInhNb2RlbCIsInlNb2RlbCIsInN0cmluZyIsInNldFJlY3QiLCJ3aWR0aCIsImhlaWdodCIsImNlbnRlciIsImNlbnRlclgiLCJib3R0b20iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9DLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLGVBQWUs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