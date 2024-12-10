// Copyright 2020-2022, University of Colorado Boulder
/**
 * ProtractorNode is a device for measuring angles.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import NumberProperty from '../../axon/js/NumberProperty.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import sceneryPhet from '../../scenery-phet/js/sceneryPhet.js';
import protractor_png from '../../scenery-phet/mipmaps/protractor_png.js';
import { DragListener, Image, Node, Path } from '../../scenery/js/imports.js';
let ProtractorNode = class ProtractorNode extends Node {
    reset() {
        this.angleProperty.reset();
    }
    /**
   * Creates an icon, to be used for toolboxes, checkboxes, etc.
   */ static createIcon(options) {
        return new Image(protractor_png, options);
    }
    constructor(providedOptions){
        const options = optionize()({
            angle: 0,
            rotatable: false,
            cursor: 'pointer'
        }, providedOptions);
        super();
        // Image
        const protractor_pngNode = new Image(protractor_png, {
            hitTestPixels: true // hit test only non-transparent pixels in the image
        });
        this.addChild(protractor_pngNode);
        this.angleProperty = new NumberProperty(options.angle);
        if (options.rotatable) {
            // Use nicknames for width and height, to make the Shape code easier to understand.
            const w = protractor_pngNode.getWidth();
            const h = protractor_pngNode.getHeight();
            // Outer ring of the protractor. Shape must match protractor_png!
            const outerRingShape = new Shape().moveTo(w, h / 2).ellipticalArc(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, true).lineTo(w * 0.2, h / 2).ellipticalArc(w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, false).lineTo(w, h / 2).ellipticalArc(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, false).lineTo(w * 0.2, h / 2).ellipticalArc(w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, true);
            const outerRingPath = new Path(outerRingShape, {
                stroke: phet.chipper.queryParameters.dev ? 'red' : null // show the Shape with ?dev
            });
            this.addChild(outerRingPath);
            // Rotate the protractor when its outer ring is dragged.
            let start;
            outerRingPath.addInputListener(new DragListener({
                start: (event)=>{
                    start = this.globalToParentPoint(event.pointer.point);
                },
                drag: (event)=>{
                    // compute the change in angle based on the new drag event
                    const end = this.globalToParentPoint(event.pointer.point);
                    const centerX = this.getCenterX();
                    const centerY = this.getCenterY();
                    const startAngle = Math.atan2(centerY - start.y, centerX - start.x);
                    const angle = Math.atan2(centerY - end.y, centerX - end.x);
                    // rotate the protractor model
                    this.angleProperty.value += angle - startAngle;
                    start = end;
                }
            }));
            // Rotate to match the protractor angle
            this.angleProperty.link((angle)=>{
                this.rotateAround(this.center, angle - this.getRotation());
            });
        }
        this.mutate(options);
    }
};
export { ProtractorNode as default };
sceneryPhet.register('ProtractorNode', ProtractorNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Qcm90cmFjdG9yTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcm90cmFjdG9yTm9kZSBpcyBhIGRldmljZSBmb3IgbWVhc3VyaW5nIGFuZ2xlcy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaGFuZHJhc2hla2FyIEJlbWFnb25pIChBY3R1YWwgQ29uY2VwdHMpXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBwcm90cmFjdG9yX3BuZyBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvbWlwbWFwcy9wcm90cmFjdG9yX3BuZy5qcyc7XG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIEltYWdlLCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gd2hldGhlciB0aGUgcHJvdHJhY3RvciBpcyByb3RhdGFibGUgdmlhIHVzZXIgaW50ZXJhY3Rpb25cbiAgcm90YXRhYmxlPzogYm9vbGVhbjtcblxuICAvLyB0aGUgaW5pdGlhbCBhbmdsZSBvZiB0aGUgcHJvdHJhY3RvciwgaW4gcmFkaWFuc1xuICBhbmdsZT86IG51bWJlcjtcbn07XG5leHBvcnQgdHlwZSBQcm90cmFjdG9yTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm90cmFjdG9yTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIC8vIGFuZ2xlIG9mIHRoZSBwcm90cmFjdG9yLCBpbiByYWRpYW5zXG4gIHB1YmxpYyByZWFkb25seSBhbmdsZVByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUHJvdHJhY3Rvck5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQcm90cmFjdG9yTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAgYW5nbGU6IDAsXG4gICAgICByb3RhdGFibGU6IGZhbHNlLFxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBJbWFnZVxuICAgIGNvbnN0IHByb3RyYWN0b3JfcG5nTm9kZSA9IG5ldyBJbWFnZSggcHJvdHJhY3Rvcl9wbmcsIHtcbiAgICAgIGhpdFRlc3RQaXhlbHM6IHRydWUgLy8gaGl0IHRlc3Qgb25seSBub24tdHJhbnNwYXJlbnQgcGl4ZWxzIGluIHRoZSBpbWFnZVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCBwcm90cmFjdG9yX3BuZ05vZGUgKTtcblxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5hbmdsZSApO1xuXG4gICAgaWYgKCBvcHRpb25zLnJvdGF0YWJsZSApIHtcblxuICAgICAgLy8gVXNlIG5pY2tuYW1lcyBmb3Igd2lkdGggYW5kIGhlaWdodCwgdG8gbWFrZSB0aGUgU2hhcGUgY29kZSBlYXNpZXIgdG8gdW5kZXJzdGFuZC5cbiAgICAgIGNvbnN0IHcgPSBwcm90cmFjdG9yX3BuZ05vZGUuZ2V0V2lkdGgoKTtcbiAgICAgIGNvbnN0IGggPSBwcm90cmFjdG9yX3BuZ05vZGUuZ2V0SGVpZ2h0KCk7XG5cbiAgICAgIC8vIE91dGVyIHJpbmcgb2YgdGhlIHByb3RyYWN0b3IuIFNoYXBlIG11c3QgbWF0Y2ggcHJvdHJhY3Rvcl9wbmchXG4gICAgICBjb25zdCBvdXRlclJpbmdTaGFwZSA9IG5ldyBTaGFwZSgpXG4gICAgICAgIC5tb3ZlVG8oIHcsIGggLyAyIClcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIHcgLyAyLCBoIC8gMiwgdyAvIDIsIGggLyAyLCAwLCAwLCBNYXRoLlBJLCB0cnVlIClcbiAgICAgICAgLmxpbmVUbyggdyAqIDAuMiwgaCAvIDIgKVxuICAgICAgICAuZWxsaXB0aWNhbEFyYyggdyAvIDIsIGggLyAyLCB3ICogMC4zLCBoICogMC4zLCAwLCBNYXRoLlBJLCAwLCBmYWxzZSApXG4gICAgICAgIC5saW5lVG8oIHcsIGggLyAyIClcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIHcgLyAyLCBoIC8gMiwgdyAvIDIsIGggLyAyLCAwLCAwLCBNYXRoLlBJLCBmYWxzZSApXG4gICAgICAgIC5saW5lVG8oIHcgKiAwLjIsIGggLyAyIClcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIHcgLyAyLCBoIC8gMiwgdyAqIDAuMywgaCAqIDAuMywgMCwgTWF0aC5QSSwgMCwgdHJ1ZSApO1xuICAgICAgY29uc3Qgb3V0ZXJSaW5nUGF0aCA9IG5ldyBQYXRoKCBvdXRlclJpbmdTaGFwZSwge1xuICAgICAgICBzdHJva2U6IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZGV2ID8gJ3JlZCcgOiBudWxsIC8vIHNob3cgdGhlIFNoYXBlIHdpdGggP2RldlxuICAgICAgfSApO1xuICAgICAgdGhpcy5hZGRDaGlsZCggb3V0ZXJSaW5nUGF0aCApO1xuXG4gICAgICAvLyBSb3RhdGUgdGhlIHByb3RyYWN0b3Igd2hlbiBpdHMgb3V0ZXIgcmluZyBpcyBkcmFnZ2VkLlxuICAgICAgbGV0IHN0YXJ0OiBWZWN0b3IyO1xuICAgICAgb3V0ZXJSaW5nUGF0aC5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XG4gICAgICAgIHN0YXJ0OiBldmVudCA9PiB7XG4gICAgICAgICAgc3RhcnQgPSB0aGlzLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcbiAgICAgICAgfSxcbiAgICAgICAgZHJhZzogZXZlbnQgPT4ge1xuXG4gICAgICAgICAgLy8gY29tcHV0ZSB0aGUgY2hhbmdlIGluIGFuZ2xlIGJhc2VkIG9uIHRoZSBuZXcgZHJhZyBldmVudFxuICAgICAgICAgIGNvbnN0IGVuZCA9IHRoaXMuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xuICAgICAgICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLmdldENlbnRlclgoKTtcbiAgICAgICAgICBjb25zdCBjZW50ZXJZID0gdGhpcy5nZXRDZW50ZXJZKCk7XG4gICAgICAgICAgY29uc3Qgc3RhcnRBbmdsZSA9IE1hdGguYXRhbjIoIGNlbnRlclkgLSBzdGFydC55LCBjZW50ZXJYIC0gc3RhcnQueCApO1xuICAgICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMiggY2VudGVyWSAtIGVuZC55LCBjZW50ZXJYIC0gZW5kLnggKTtcblxuICAgICAgICAgIC8vIHJvdGF0ZSB0aGUgcHJvdHJhY3RvciBtb2RlbFxuICAgICAgICAgIHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSArPSBhbmdsZSAtIHN0YXJ0QW5nbGU7XG4gICAgICAgICAgc3RhcnQgPSBlbmQ7XG4gICAgICAgIH1cbiAgICAgIH0gKSApO1xuXG4gICAgICAvLyBSb3RhdGUgdG8gbWF0Y2ggdGhlIHByb3RyYWN0b3IgYW5nbGVcbiAgICAgIHRoaXMuYW5nbGVQcm9wZXJ0eS5saW5rKCBhbmdsZSA9PiB7XG4gICAgICAgIHRoaXMucm90YXRlQXJvdW5kKCB0aGlzLmNlbnRlciwgYW5nbGUgLSB0aGlzLmdldFJvdGF0aW9uKCkgKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eS5yZXNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaWNvbiwgdG8gYmUgdXNlZCBmb3IgdG9vbGJveGVzLCBjaGVja2JveGVzLCBldGMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUljb24oIG9wdGlvbnM6IE5vZGVPcHRpb25zICk6IE5vZGUge1xuICAgIHJldHVybiBuZXcgSW1hZ2UoIHByb3RyYWN0b3JfcG5nLCBvcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdQcm90cmFjdG9yTm9kZScsIFByb3RyYWN0b3JOb2RlICk7Il0sIm5hbWVzIjpbIk51bWJlclByb3BlcnR5IiwiU2hhcGUiLCJvcHRpb25pemUiLCJzY2VuZXJ5UGhldCIsInByb3RyYWN0b3JfcG5nIiwiRHJhZ0xpc3RlbmVyIiwiSW1hZ2UiLCJOb2RlIiwiUGF0aCIsIlByb3RyYWN0b3JOb2RlIiwicmVzZXQiLCJhbmdsZVByb3BlcnR5IiwiY3JlYXRlSWNvbiIsIm9wdGlvbnMiLCJwcm92aWRlZE9wdGlvbnMiLCJhbmdsZSIsInJvdGF0YWJsZSIsImN1cnNvciIsInByb3RyYWN0b3JfcG5nTm9kZSIsImhpdFRlc3RQaXhlbHMiLCJhZGRDaGlsZCIsInciLCJnZXRXaWR0aCIsImgiLCJnZXRIZWlnaHQiLCJvdXRlclJpbmdTaGFwZSIsIm1vdmVUbyIsImVsbGlwdGljYWxBcmMiLCJNYXRoIiwiUEkiLCJsaW5lVG8iLCJvdXRlclJpbmdQYXRoIiwic3Ryb2tlIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJkZXYiLCJzdGFydCIsImFkZElucHV0TGlzdGVuZXIiLCJldmVudCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJkcmFnIiwiZW5kIiwiY2VudGVyWCIsImdldENlbnRlclgiLCJjZW50ZXJZIiwiZ2V0Q2VudGVyWSIsInN0YXJ0QW5nbGUiLCJhdGFuMiIsInkiLCJ4IiwidmFsdWUiLCJsaW5rIiwicm90YXRlQXJvdW5kIiwiY2VudGVyIiwiZ2V0Um90YXRpb24iLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLG9CQUFvQixrQ0FBa0M7QUFHN0QsU0FBU0MsS0FBSyxRQUFRLDJCQUEyQjtBQUNqRCxPQUFPQyxlQUFlLGtDQUFrQztBQUV4RCxPQUFPQyxpQkFBaUIsdUNBQXVDO0FBQy9ELE9BQU9DLG9CQUFvQiwrQ0FBK0M7QUFDMUUsU0FBU0MsWUFBWSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBZUMsSUFBSSxRQUFRLDhCQUE4QjtBQVk1RSxJQUFBLEFBQU1DLGlCQUFOLE1BQU1BLHVCQUF1QkY7SUEwRW5DRyxRQUFjO1FBQ25CLElBQUksQ0FBQ0MsYUFBYSxDQUFDRCxLQUFLO0lBQzFCO0lBRUE7O0dBRUMsR0FDRCxPQUFjRSxXQUFZQyxPQUFvQixFQUFTO1FBQ3JELE9BQU8sSUFBSVAsTUFBT0YsZ0JBQWdCUztJQUNwQztJQTlFQSxZQUFvQkMsZUFBdUMsQ0FBRztRQUU1RCxNQUFNRCxVQUFVWCxZQUE4RDtZQUM1RWEsT0FBTztZQUNQQyxX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