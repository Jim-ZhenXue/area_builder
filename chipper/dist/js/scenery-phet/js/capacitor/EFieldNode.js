// Copyright 2019-2022, University of Colorado Boulder
/**
 * Visual representation of the effective E-field (E_effective) between the capacitor plates.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Emily Randall (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ //modules
import Multilink from '../../../axon/js/Multilink.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import { CanvasNode } from '../../../scenery/js/imports.js';
import sceneryPhet from '../sceneryPhet.js';
// constants
const ARROW_SIZE = new Dimension2(6, 7);
const LINE_WIDTH = 1;
const ARROW_COLOR = 'black';
const ArrowDirection = EnumerationDeprecated.byKeys([
    'UP',
    'DOWN'
]);
// determines spacing of electric field lines, chosen by inspection to match spacing from Java
const SPACING_CONSTANT = 0.0258;
/**
 * Draw one EField line with the provided parameters using HTML5 Canvas
 *
 * @param {Vector2} position - origin, at the center of the line
 * @param {number} length length of the line in view coordinates
 * @param {string} direction
 * @param {CanvasRenderingContext2D} context
 */ const drawEFieldLine = (position, length, direction, context)=>{
    // line, origin at center
    context.moveTo(position.x, position.y - length / 2 - 3);
    context.lineTo(position.x, position.y + length / 2 - 3);
    // pull out for readability
    const w = ARROW_SIZE.width;
    const h = ARROW_SIZE.height;
    // make sure that the arrow path is centered along the field line.
    // dividing by 4 aligns better than dividing by 2 for the narrow line width.
    const xOffset = LINE_WIDTH / 4;
    const arrowCenter = direction === ArrowDirection.UP ? position.x - xOffset : position.x + xOffset;
    // path for the UP arrow
    if (direction === ArrowDirection.UP) {
        context.moveTo(arrowCenter, position.y - h / 2);
        context.lineTo(arrowCenter + w / 2, position.y + h / 2);
        context.lineTo(arrowCenter - w / 2, position.y + h / 2);
    } else if (direction === ArrowDirection.DOWN) {
        context.moveTo(arrowCenter, position.y + h / 2);
        context.lineTo(arrowCenter - w / 2, position.y - h / 2);
        context.lineTo(arrowCenter + w / 2, position.y - h / 2);
    } else {
        assert && assert(false, 'EFieldLine must be of orientation UP or DOWN');
    }
};
let EFieldNode = class EFieldNode extends CanvasNode {
    /**
   * Rendering
   * @public
   *
   * @param {CanvasRenderingContext2D} context
   */ paintCanvas(context) {
        // compute density (spacing) of field lines
        const effectiveEField = this.capacitor.getEffectiveEField();
        const lineSpacing = this.getLineSpacing(effectiveEField);
        if (lineSpacing > 0) {
            context.beginPath();
            // relevant model values
            const plateWidth = this.capacitor.plateSizeProperty.value.width;
            const plateDepth = plateWidth;
            const plateSeparation = this.capacitor.plateSeparationProperty.value;
            /*
       * Create field lines, working from the center outwards so that lines appear/disappear at edges of plate as
       * E_effective changes.
       */ const length = this.modelViewTransform.modelToViewDeltaXYZ(0, plateSeparation, 0).y;
            const direction = effectiveEField >= 0 ? ArrowDirection.DOWN : ArrowDirection.UP;
            let x = lineSpacing / 2;
            while(x <= plateWidth / 2){
                let z = lineSpacing / 2;
                while(z <= plateDepth / 2){
                    // calculate position for the lines
                    const y = 0;
                    const line0Translation = this.modelViewTransform.modelToViewXYZ(x, y, z);
                    const line1Translation = this.modelViewTransform.modelToViewXYZ(-x, y, z);
                    const line2Translation = this.modelViewTransform.modelToViewXYZ(x, y, -z);
                    const line3Translation = this.modelViewTransform.modelToViewXYZ(-x, y, -z);
                    // add 4 lines, one for each quadrant
                    drawEFieldLine(line0Translation, length, direction, context);
                    drawEFieldLine(line1Translation, length, direction, context);
                    drawEFieldLine(line2Translation, length, direction, context);
                    drawEFieldLine(line3Translation, length, direction, context);
                    z += lineSpacing;
                }
                x += lineSpacing;
            }
            // stroke the whole path
            context.strokeStyle = ARROW_COLOR;
            context.fillStyle = ARROW_COLOR;
            context.lineWidth = LINE_WIDTH;
            context.fill();
            context.stroke();
        }
    }
    /**
   * Gets the spacing of E-field lines. Higher E-field results in higher density,
   * therefore lower spacing. Density is computed for the minimum plate size.
   * @public
   *
   * @param {number} effectiveEField
   * @returns {number} spacing, in model coordinates
   */ getLineSpacing(effectiveEField) {
        if (effectiveEField === 0) {
            return 0;
        } else {
            // sqrt looks best for a square plate
            return SPACING_CONSTANT / Math.sqrt(Math.abs(effectiveEField));
        }
    }
    /**
   * @param {Capacitor} capacitor
   * @param {YawPitchModelViewTransform3} modelViewTransform
   * @param {number} maxEffectiveEField
   * @param {Bounds2} canvasBounds
   */ constructor(capacitor, modelViewTransform, maxEffectiveEField, canvasBounds){
        super({
            canvasBounds: canvasBounds
        });
        const self = this;
        // @private
        this.capacitor = capacitor;
        this.modelViewTransform = modelViewTransform;
        this.maxEffectiveEField = maxEffectiveEField;
        Multilink.multilink([
            capacitor.plateSizeProperty,
            capacitor.plateSeparationProperty,
            capacitor.plateVoltageProperty
        ], ()=>{
            if (self.isVisible()) {
                self.invalidatePaint();
            }
        });
        // Update when this Node becomes visible.
        this.visibleProperty.link((visible)=>visible && this.invalidatePaint());
    }
};
sceneryPhet.register('EFieldNode', EFieldNode);
export default EFieldNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9jYXBhY2l0b3IvRUZpZWxkTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBWaXN1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVmZmVjdGl2ZSBFLWZpZWxkIChFX2VmZmVjdGl2ZSkgYmV0d2VlbiB0aGUgY2FwYWNpdG9yIHBsYXRlcy5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBFbWlseSBSYW5kYWxsIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuXG4vL21vZHVsZXNcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcbmltcG9ydCB7IENhbnZhc05vZGUgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uL3NjZW5lcnlQaGV0LmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBBUlJPV19TSVpFID0gbmV3IERpbWVuc2lvbjIoIDYsIDcgKTtcbmNvbnN0IExJTkVfV0lEVEggPSAxO1xuY29uc3QgQVJST1dfQ09MT1IgPSAnYmxhY2snO1xuY29uc3QgQXJyb3dEaXJlY3Rpb24gPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbICdVUCcsICdET1dOJyBdICk7XG5cbi8vIGRldGVybWluZXMgc3BhY2luZyBvZiBlbGVjdHJpYyBmaWVsZCBsaW5lcywgY2hvc2VuIGJ5IGluc3BlY3Rpb24gdG8gbWF0Y2ggc3BhY2luZyBmcm9tIEphdmFcbmNvbnN0IFNQQUNJTkdfQ09OU1RBTlQgPSAwLjAyNTg7XG5cbi8qKlxuICogRHJhdyBvbmUgRUZpZWxkIGxpbmUgd2l0aCB0aGUgcHJvdmlkZWQgcGFyYW1ldGVycyB1c2luZyBIVE1MNSBDYW52YXNcbiAqXG4gKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uIC0gb3JpZ2luLCBhdCB0aGUgY2VudGVyIG9mIHRoZSBsaW5lXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIGxlbmd0aCBvZiB0aGUgbGluZSBpbiB2aWV3IGNvb3JkaW5hdGVzXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uXG4gKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dFxuICovXG5jb25zdCBkcmF3RUZpZWxkTGluZSA9ICggcG9zaXRpb24sIGxlbmd0aCwgZGlyZWN0aW9uLCBjb250ZXh0ICkgPT4ge1xuXG4gIC8vIGxpbmUsIG9yaWdpbiBhdCBjZW50ZXJcbiAgY29udGV4dC5tb3ZlVG8oIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSBsZW5ndGggLyAyIC0gMyApO1xuICBjb250ZXh0LmxpbmVUbyggcG9zaXRpb24ueCwgcG9zaXRpb24ueSArIGxlbmd0aCAvIDIgLSAzICk7XG5cbiAgLy8gcHVsbCBvdXQgZm9yIHJlYWRhYmlsaXR5XG4gIGNvbnN0IHcgPSBBUlJPV19TSVpFLndpZHRoO1xuICBjb25zdCBoID0gQVJST1dfU0laRS5oZWlnaHQ7XG5cbiAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIGFycm93IHBhdGggaXMgY2VudGVyZWQgYWxvbmcgdGhlIGZpZWxkIGxpbmUuXG4gIC8vIGRpdmlkaW5nIGJ5IDQgYWxpZ25zIGJldHRlciB0aGFuIGRpdmlkaW5nIGJ5IDIgZm9yIHRoZSBuYXJyb3cgbGluZSB3aWR0aC5cbiAgY29uc3QgeE9mZnNldCA9IExJTkVfV0lEVEggLyA0O1xuICBjb25zdCBhcnJvd0NlbnRlciA9IGRpcmVjdGlvbiA9PT0gQXJyb3dEaXJlY3Rpb24uVVAgPyBwb3NpdGlvbi54IC0geE9mZnNldCA6IHBvc2l0aW9uLnggKyB4T2Zmc2V0O1xuXG4gIC8vIHBhdGggZm9yIHRoZSBVUCBhcnJvd1xuICBpZiAoIGRpcmVjdGlvbiA9PT0gQXJyb3dEaXJlY3Rpb24uVVAgKSB7XG4gICAgY29udGV4dC5tb3ZlVG8oIGFycm93Q2VudGVyLCBwb3NpdGlvbi55IC0gaCAvIDIgKTtcbiAgICBjb250ZXh0LmxpbmVUbyggYXJyb3dDZW50ZXIgKyB3IC8gMiwgcG9zaXRpb24ueSArIGggLyAyICk7XG4gICAgY29udGV4dC5saW5lVG8oIGFycm93Q2VudGVyIC0gdyAvIDIsIHBvc2l0aW9uLnkgKyBoIC8gMiApO1xuICB9XG5cbiAgLy8gcGF0aCBmb3IgdGhlIERPV04gYXJyb3dcbiAgZWxzZSBpZiAoIGRpcmVjdGlvbiA9PT0gQXJyb3dEaXJlY3Rpb24uRE9XTiApIHtcbiAgICBjb250ZXh0Lm1vdmVUbyggYXJyb3dDZW50ZXIsIHBvc2l0aW9uLnkgKyBoIC8gMiApO1xuICAgIGNvbnRleHQubGluZVRvKCBhcnJvd0NlbnRlciAtIHcgLyAyLCBwb3NpdGlvbi55IC0gaCAvIDIgKTtcbiAgICBjb250ZXh0LmxpbmVUbyggYXJyb3dDZW50ZXIgKyB3IC8gMiwgcG9zaXRpb24ueSAtIGggLyAyICk7XG4gIH1cblxuICBlbHNlIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ0VGaWVsZExpbmUgbXVzdCBiZSBvZiBvcmllbnRhdGlvbiBVUCBvciBET1dOJyApO1xuICB9XG59O1xuXG5jbGFzcyBFRmllbGROb2RlIGV4dGVuZHMgQ2FudmFzTm9kZSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q2FwYWNpdG9yfSBjYXBhY2l0b3JcbiAgICogQHBhcmFtIHtZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTN9IG1vZGVsVmlld1RyYW5zZm9ybVxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4RWZmZWN0aXZlRUZpZWxkXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gY2FudmFzQm91bmRzXG4gICAqL1xuICBjb25zdHJ1Y3RvciggY2FwYWNpdG9yLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG1heEVmZmVjdGl2ZUVGaWVsZCwgY2FudmFzQm91bmRzICkge1xuXG4gICAgc3VwZXIoIHsgY2FudmFzQm91bmRzOiBjYW52YXNCb3VuZHMgfSApO1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gQHByaXZhdGVcbiAgICB0aGlzLmNhcGFjaXRvciA9IGNhcGFjaXRvcjtcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcbiAgICB0aGlzLm1heEVmZmVjdGl2ZUVGaWVsZCA9IG1heEVmZmVjdGl2ZUVGaWVsZDtcblxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcbiAgICAgIGNhcGFjaXRvci5wbGF0ZVNpemVQcm9wZXJ0eSxcbiAgICAgIGNhcGFjaXRvci5wbGF0ZVNlcGFyYXRpb25Qcm9wZXJ0eSxcbiAgICAgIGNhcGFjaXRvci5wbGF0ZVZvbHRhZ2VQcm9wZXJ0eVxuICAgIF0sICgpID0+IHtcbiAgICAgIGlmICggc2VsZi5pc1Zpc2libGUoKSApIHtcbiAgICAgICAgc2VsZi5pbnZhbGlkYXRlUGFpbnQoKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBVcGRhdGUgd2hlbiB0aGlzIE5vZGUgYmVjb21lcyB2aXNpYmxlLlxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4gdmlzaWJsZSAmJiB0aGlzLmludmFsaWRhdGVQYWludCgpICk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyaW5nXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGNvbnRleHRcbiAgICovXG4gIHBhaW50Q2FudmFzKCBjb250ZXh0ICkge1xuXG4gICAgLy8gY29tcHV0ZSBkZW5zaXR5IChzcGFjaW5nKSBvZiBmaWVsZCBsaW5lc1xuICAgIGNvbnN0IGVmZmVjdGl2ZUVGaWVsZCA9IHRoaXMuY2FwYWNpdG9yLmdldEVmZmVjdGl2ZUVGaWVsZCgpO1xuICAgIGNvbnN0IGxpbmVTcGFjaW5nID0gdGhpcy5nZXRMaW5lU3BhY2luZyggZWZmZWN0aXZlRUZpZWxkICk7XG5cbiAgICBpZiAoIGxpbmVTcGFjaW5nID4gMCApIHtcblxuICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgICAgLy8gcmVsZXZhbnQgbW9kZWwgdmFsdWVzXG4gICAgICBjb25zdCBwbGF0ZVdpZHRoID0gdGhpcy5jYXBhY2l0b3IucGxhdGVTaXplUHJvcGVydHkudmFsdWUud2lkdGg7XG4gICAgICBjb25zdCBwbGF0ZURlcHRoID0gcGxhdGVXaWR0aDtcbiAgICAgIGNvbnN0IHBsYXRlU2VwYXJhdGlvbiA9IHRoaXMuY2FwYWNpdG9yLnBsYXRlU2VwYXJhdGlvblByb3BlcnR5LnZhbHVlO1xuXG4gICAgICAvKlxuICAgICAgICogQ3JlYXRlIGZpZWxkIGxpbmVzLCB3b3JraW5nIGZyb20gdGhlIGNlbnRlciBvdXR3YXJkcyBzbyB0aGF0IGxpbmVzIGFwcGVhci9kaXNhcHBlYXIgYXQgZWRnZXMgb2YgcGxhdGUgYXNcbiAgICAgICAqIEVfZWZmZWN0aXZlIGNoYW5nZXMuXG4gICAgICAgKi9cbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYWVooIDAsIHBsYXRlU2VwYXJhdGlvbiwgMCApLnk7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSAoIGVmZmVjdGl2ZUVGaWVsZCA+PSAwICkgPyBBcnJvd0RpcmVjdGlvbi5ET1dOIDogQXJyb3dEaXJlY3Rpb24uVVA7XG4gICAgICBsZXQgeCA9IGxpbmVTcGFjaW5nIC8gMjtcbiAgICAgIHdoaWxlICggeCA8PSBwbGF0ZVdpZHRoIC8gMiApIHtcbiAgICAgICAgbGV0IHogPSBsaW5lU3BhY2luZyAvIDI7XG4gICAgICAgIHdoaWxlICggeiA8PSBwbGF0ZURlcHRoIC8gMiApIHtcblxuICAgICAgICAgIC8vIGNhbGN1bGF0ZSBwb3NpdGlvbiBmb3IgdGhlIGxpbmVzXG4gICAgICAgICAgY29uc3QgeSA9IDA7XG4gICAgICAgICAgY29uc3QgbGluZTBUcmFuc2xhdGlvbiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFlaKCB4LCB5LCB6ICk7XG4gICAgICAgICAgY29uc3QgbGluZTFUcmFuc2xhdGlvbiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFlaKCAteCwgeSwgeiApO1xuICAgICAgICAgIGNvbnN0IGxpbmUyVHJhbnNsYXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCwgeSwgLXogKTtcbiAgICAgICAgICBjb25zdCBsaW5lM1RyYW5zbGF0aW9uID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIC14LCB5LCAteiApO1xuXG4gICAgICAgICAgLy8gYWRkIDQgbGluZXMsIG9uZSBmb3IgZWFjaCBxdWFkcmFudFxuICAgICAgICAgIGRyYXdFRmllbGRMaW5lKCBsaW5lMFRyYW5zbGF0aW9uLCBsZW5ndGgsIGRpcmVjdGlvbiwgY29udGV4dCApO1xuICAgICAgICAgIGRyYXdFRmllbGRMaW5lKCBsaW5lMVRyYW5zbGF0aW9uLCBsZW5ndGgsIGRpcmVjdGlvbiwgY29udGV4dCApO1xuICAgICAgICAgIGRyYXdFRmllbGRMaW5lKCBsaW5lMlRyYW5zbGF0aW9uLCBsZW5ndGgsIGRpcmVjdGlvbiwgY29udGV4dCApO1xuICAgICAgICAgIGRyYXdFRmllbGRMaW5lKCBsaW5lM1RyYW5zbGF0aW9uLCBsZW5ndGgsIGRpcmVjdGlvbiwgY29udGV4dCApO1xuXG4gICAgICAgICAgeiArPSBsaW5lU3BhY2luZztcbiAgICAgICAgfVxuICAgICAgICB4ICs9IGxpbmVTcGFjaW5nO1xuICAgICAgfVxuICAgICAgLy8gc3Ryb2tlIHRoZSB3aG9sZSBwYXRoXG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gQVJST1dfQ09MT1I7XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IEFSUk9XX0NPTE9SO1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSBMSU5FX1dJRFRIO1xuICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzcGFjaW5nIG9mIEUtZmllbGQgbGluZXMuIEhpZ2hlciBFLWZpZWxkIHJlc3VsdHMgaW4gaGlnaGVyIGRlbnNpdHksXG4gICAqIHRoZXJlZm9yZSBsb3dlciBzcGFjaW5nLiBEZW5zaXR5IGlzIGNvbXB1dGVkIGZvciB0aGUgbWluaW11bSBwbGF0ZSBzaXplLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlZmZlY3RpdmVFRmllbGRcbiAgICogQHJldHVybnMge251bWJlcn0gc3BhY2luZywgaW4gbW9kZWwgY29vcmRpbmF0ZXNcbiAgICovXG4gIGdldExpbmVTcGFjaW5nKCBlZmZlY3RpdmVFRmllbGQgKSB7XG4gICAgaWYgKCBlZmZlY3RpdmVFRmllbGQgPT09IDAgKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBzcXJ0IGxvb2tzIGJlc3QgZm9yIGEgc3F1YXJlIHBsYXRlXG4gICAgICByZXR1cm4gU1BBQ0lOR19DT05TVEFOVCAvIE1hdGguc3FydCggTWF0aC5hYnMoIGVmZmVjdGl2ZUVGaWVsZCApICk7XG4gICAgfVxuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnRUZpZWxkTm9kZScsIEVGaWVsZE5vZGUgKTtcbmV4cG9ydCBkZWZhdWx0IEVGaWVsZE5vZGU7Il0sIm5hbWVzIjpbIk11bHRpbGluayIsIkRpbWVuc2lvbjIiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJDYW52YXNOb2RlIiwic2NlbmVyeVBoZXQiLCJBUlJPV19TSVpFIiwiTElORV9XSURUSCIsIkFSUk9XX0NPTE9SIiwiQXJyb3dEaXJlY3Rpb24iLCJieUtleXMiLCJTUEFDSU5HX0NPTlNUQU5UIiwiZHJhd0VGaWVsZExpbmUiLCJwb3NpdGlvbiIsImxlbmd0aCIsImRpcmVjdGlvbiIsImNvbnRleHQiLCJtb3ZlVG8iLCJ4IiwieSIsImxpbmVUbyIsInciLCJ3aWR0aCIsImgiLCJoZWlnaHQiLCJ4T2Zmc2V0IiwiYXJyb3dDZW50ZXIiLCJVUCIsIkRPV04iLCJhc3NlcnQiLCJFRmllbGROb2RlIiwicGFpbnRDYW52YXMiLCJlZmZlY3RpdmVFRmllbGQiLCJjYXBhY2l0b3IiLCJnZXRFZmZlY3RpdmVFRmllbGQiLCJsaW5lU3BhY2luZyIsImdldExpbmVTcGFjaW5nIiwiYmVnaW5QYXRoIiwicGxhdGVXaWR0aCIsInBsYXRlU2l6ZVByb3BlcnR5IiwidmFsdWUiLCJwbGF0ZURlcHRoIiwicGxhdGVTZXBhcmF0aW9uIiwicGxhdGVTZXBhcmF0aW9uUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJtb2RlbFRvVmlld0RlbHRhWFlaIiwieiIsImxpbmUwVHJhbnNsYXRpb24iLCJtb2RlbFRvVmlld1hZWiIsImxpbmUxVHJhbnNsYXRpb24iLCJsaW5lMlRyYW5zbGF0aW9uIiwibGluZTNUcmFuc2xhdGlvbiIsInN0cm9rZVN0eWxlIiwiZmlsbFN0eWxlIiwibGluZVdpZHRoIiwiZmlsbCIsInN0cm9rZSIsIk1hdGgiLCJzcXJ0IiwiYWJzIiwiY29uc3RydWN0b3IiLCJtYXhFZmZlY3RpdmVFRmllbGQiLCJjYW52YXNCb3VuZHMiLCJzZWxmIiwibXVsdGlsaW5rIiwicGxhdGVWb2x0YWdlUHJvcGVydHkiLCJpc1Zpc2libGUiLCJpbnZhbGlkYXRlUGFpbnQiLCJ2aXNp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