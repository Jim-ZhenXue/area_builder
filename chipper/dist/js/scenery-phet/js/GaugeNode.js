// Copyright 2013-2024, University of Colorado Boulder
/**
 * GaugeNode is a circular gauge that depicts some dynamic value.
 * This was originally ported from the speedometer node in forces-and-motion-basics.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */ import Matrix3 from '../../dot/js/Matrix3.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Circle, Node, Path, Text } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
let GaugeNode = class GaugeNode extends Node {
    dispose() {
        this.disposeGaugeNode();
        super.dispose();
    }
    /**
   * @param valueProperty
   * @param labelProperty - label to display, scaled to fit if necessary
   * @param range - range of the needle. If valueProperty exceeds this range, the needle will stop at min or max.
   * @param providedOptions
   */ constructor(valueProperty, labelProperty, range, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            radius: 100,
            backgroundFill: 'white',
            backgroundStroke: 'rgb( 85, 85, 85 )',
            backgroundLineWidth: 2,
            maxLabelWidthScale: 1.3,
            numberOfTicks: 21,
            majorTickStroke: 'gray',
            minorTickStroke: 'gray',
            majorTickLength: 10,
            minorTickLength: 5,
            majorTickLineWidth: 2,
            minorTickLineWidth: 1,
            span: Math.PI + Math.PI / 4,
            needleLineWidth: 3,
            updateWhenInvisible: true,
            labelTextOptions: {
                font: new PhetFont(20)
            },
            // NodeOptions
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Node'
        }, providedOptions);
        assert && assert(options.span <= 2 * Math.PI, `options.span must be <= 2 * Math.PI: ${options.span}`);
        super();
        this.radius = options.radius;
        const anglePerTick = options.span / options.numberOfTicks;
        this.addChild(new Circle(this.radius, {
            fill: options.backgroundFill,
            stroke: options.backgroundStroke,
            lineWidth: options.backgroundLineWidth
        }));
        const foregroundNode = new Node({
            pickable: false
        });
        this.addChild(foregroundNode);
        const needle = new Path(Shape.lineSegment(0, 0, this.radius - options.majorTickLength / 2, 0), {
            stroke: 'red',
            lineWidth: options.needleLineWidth
        });
        const labelText = new Text(labelProperty, combineOptions(options.labelTextOptions, {
            tandem: options.tandem.createTandem('labelText'),
            maxWidth: options.radius * options.maxLabelWidthScale
        }));
        labelText.boundsProperty.link(()=>{
            labelText.centerX = 0;
            labelText.centerY = -this.radius / 3;
        });
        foregroundNode.addChild(labelText);
        const pin = new Circle(2, {
            fill: 'black'
        });
        foregroundNode.addChild(pin);
        const totalAngle = (options.numberOfTicks - 1) * anglePerTick;
        const startAngle = -1 / 2 * Math.PI - totalAngle / 2;
        const endAngle = startAngle + totalAngle;
        const scratchMatrix = new Matrix3();
        const updateNeedle = ()=>{
            if (this.visibleProperty.value || options.updateWhenInvisible) {
                if (typeof valueProperty.get() === 'number') {
                    // clamp value to valid range and map it to an angle
                    const clampedValue = Utils.clamp(valueProperty.get(), range.min, range.max);
                    const needleAngle = Utils.linear(range.min, range.max, startAngle, endAngle, clampedValue);
                    // 2d rotation, but reusing our matrix above
                    needle.setMatrix(scratchMatrix.setToRotationZ(needleAngle));
                    needle.visible = true;
                } else {
                    // Hide the needle if there is no number value.
                    needle.visible = false;
                }
            }
        };
        valueProperty.link(updateNeedle);
        // If options.updateWhenInvisible is true, updateNeedle will be called by the valueProperty listener above.
        // Otherwise, we need to listen to visibleProperty, and call updateNeedle when the gauge becomes visible.
        if (!options.updateWhenInvisible) {
            this.visibleProperty.link((visible)=>{
                visible && updateNeedle();
            });
        }
        // Render all of the ticks into Shapes layers (since they have different strokes)
        // see https://github.com/phetsims/energy-skate-park-basics/issues/208
        const bigTicksShape = new Shape();
        const smallTicksShape = new Shape();
        // Add the tick marks
        for(let i = 0; i < options.numberOfTicks; i++){
            const tickAngle = i * anglePerTick + startAngle;
            const tickLength = i % 2 === 0 ? options.majorTickLength : options.minorTickLength;
            const x1 = (this.radius - tickLength) * Math.cos(tickAngle);
            const y1 = (this.radius - tickLength) * Math.sin(tickAngle);
            const x2 = this.radius * Math.cos(tickAngle);
            const y2 = this.radius * Math.sin(tickAngle);
            if (i % 2 === 0) {
                bigTicksShape.moveTo(x1, y1);
                bigTicksShape.lineTo(x2, y2);
            } else {
                smallTicksShape.moveTo(x1, y1);
                smallTicksShape.lineTo(x2, y2);
            }
        }
        foregroundNode.addChild(new Path(bigTicksShape, {
            stroke: options.majorTickStroke,
            lineWidth: options.majorTickLineWidth
        }));
        foregroundNode.addChild(new Path(smallTicksShape, {
            stroke: options.minorTickStroke,
            lineWidth: options.minorTickLineWidth
        }));
        // Add needle last, so it's on top of ticks. See https://github.com/phetsims/scenery-phet/issues/502
        foregroundNode.addChild(needle);
        this.mutate(options);
        this.disposeGaugeNode = ()=>{
            if (valueProperty.hasListener(updateNeedle)) {
                valueProperty.unlink(updateNeedle);
            }
            // de-register phet-io tandems
            foregroundNode.dispose();
            labelText.dispose();
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'GaugeNode', this);
    }
};
export { GaugeNode as default };
sceneryPhet.register('GaugeNode', GaugeNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9HYXVnZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR2F1Z2VOb2RlIGlzIGEgY2lyY3VsYXIgZ2F1Z2UgdGhhdCBkZXBpY3RzIHNvbWUgZHluYW1pYyB2YWx1ZS5cbiAqIFRoaXMgd2FzIG9yaWdpbmFsbHkgcG9ydGVkIGZyb20gdGhlIHNwZWVkb21ldGVyIG5vZGUgaW4gZm9yY2VzLWFuZC1tb3Rpb24tYmFzaWNzLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGgsIFRDb2xvciwgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuL1BoZXRGb250LmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBHYXVnZU5vZGVMYWJlbFRleHRPcHRpb25zID0gU3RyaWN0T21pdDxUZXh0T3B0aW9ucywgJ21heFdpZHRoJyB8ICd0YW5kZW0nPjtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICByYWRpdXM/OiBudW1iZXI7XG4gIGJhY2tncm91bmRGaWxsPzogVENvbG9yO1xuICBiYWNrZ3JvdW5kU3Ryb2tlPzogVENvbG9yO1xuICBiYWNrZ3JvdW5kTGluZVdpZHRoPzogbnVtYmVyO1xuICBtYXhMYWJlbFdpZHRoU2NhbGU/OiBudW1iZXI7IC8vIGRlZmluZXMgbWF4IHdpZHRoIG9mIHRoZSBsYWJlbCwgcmVsYXRpdmUgdG8gdGhlIHJhZGl1c1xuXG4gIC8vIHRpY2tzXG4gIG51bWJlck9mVGlja3M/OiBudW1iZXI7XG4gIG1ham9yVGlja1N0cm9rZT86IFRDb2xvcjtcbiAgbWlub3JUaWNrU3Ryb2tlPzogVENvbG9yO1xuICBtYWpvclRpY2tMZW5ndGg/OiBudW1iZXI7XG4gIG1pbm9yVGlja0xlbmd0aD86IG51bWJlcjtcbiAgbWFqb3JUaWNrTGluZVdpZHRoPzogbnVtYmVyO1xuICBtaW5vclRpY2tMaW5lV2lkdGg/OiBudW1iZXI7XG5cbiAgLy8gbGFiZWwgdGV4dFxuICBsYWJlbFRleHRPcHRpb25zPzogR2F1Z2VOb2RlTGFiZWxUZXh0T3B0aW9ucztcblxuICAvLyB0aGUgdG9wIGhhbGYgb2YgdGhlIGdhdWdlLCBwbHVzIFBJLzggZXh0ZW5kZWQgYmVsb3cgdGhlIHRvcCBoYWxmIG9uIGVhY2ggc2lkZVxuICBzcGFuPzogbnVtYmVyOyAvLyB0aGUgdmlzaWJsZSBzcGFuIG9mIHRoZSBnYXVnZSB2YWx1ZSByYW5nZSwgaW4gcmFkaWFuc1xuXG4gIG5lZWRsZUxpbmVXaWR0aD86IG51bWJlcjtcblxuICAvLyB0cnVlIC0gYWx3YXlzIHVwZGF0ZXMsIGV2ZW4gd2hlbiBpbnZpc2libGVcbiAgLy8gZmFsc2UgLSBkb2VzIG5vdCB1cGRhdGUgd2hlbiBpbnZpc2libGUsIHVzZSB0byBvcHRpbWl6ZSBwZXJmb3JtYW5jZVxuICB1cGRhdGVXaGVuSW52aXNpYmxlPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEdhdWdlTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYXVnZU5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICBwdWJsaWMgcmVhZG9ubHkgcmFkaXVzOiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUdhdWdlTm9kZTogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQHBhcmFtIHZhbHVlUHJvcGVydHlcbiAgICogQHBhcmFtIGxhYmVsUHJvcGVydHkgLSBsYWJlbCB0byBkaXNwbGF5LCBzY2FsZWQgdG8gZml0IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0gcmFuZ2UgLSByYW5nZSBvZiB0aGUgbmVlZGxlLiBJZiB2YWx1ZVByb3BlcnR5IGV4Y2VlZHMgdGhpcyByYW5nZSwgdGhlIG5lZWRsZSB3aWxsIHN0b3AgYXQgbWluIG9yIG1heC5cbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YWx1ZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LCBsYWJlbFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCByYW5nZTogUmFuZ2UsIHByb3ZpZGVkT3B0aW9ucz86IEdhdWdlTm9kZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdhdWdlTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgcmFkaXVzOiAxMDAsXG4gICAgICBiYWNrZ3JvdW5kRmlsbDogJ3doaXRlJyxcbiAgICAgIGJhY2tncm91bmRTdHJva2U6ICdyZ2IoIDg1LCA4NSwgODUgKScsXG4gICAgICBiYWNrZ3JvdW5kTGluZVdpZHRoOiAyLFxuICAgICAgbWF4TGFiZWxXaWR0aFNjYWxlOiAxLjMsXG4gICAgICBudW1iZXJPZlRpY2tzOiAyMSwgLy8gMTAgdGlja3MgZWFjaCBvbiB0aGUgcmlnaHQgc2lkZSBhbmQgbGVmdCBzaWRlLCBwbHVzIDEgaW4gdGhlIGNlbnRlclxuICAgICAgbWFqb3JUaWNrU3Ryb2tlOiAnZ3JheScsXG4gICAgICBtaW5vclRpY2tTdHJva2U6ICdncmF5JyxcbiAgICAgIG1ham9yVGlja0xlbmd0aDogMTAsXG4gICAgICBtaW5vclRpY2tMZW5ndGg6IDUsXG4gICAgICBtYWpvclRpY2tMaW5lV2lkdGg6IDIsXG4gICAgICBtaW5vclRpY2tMaW5lV2lkdGg6IDEsXG4gICAgICBzcGFuOiBNYXRoLlBJICsgTWF0aC5QSSAvIDQsXG4gICAgICBuZWVkbGVMaW5lV2lkdGg6IDMsXG4gICAgICB1cGRhdGVXaGVuSW52aXNpYmxlOiB0cnVlLFxuXG4gICAgICBsYWJlbFRleHRPcHRpb25zOiB7XG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKVxuICAgICAgfSxcblxuICAgICAgLy8gTm9kZU9wdGlvbnNcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ05vZGUnXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNwYW4gPD0gMiAqIE1hdGguUEksIGBvcHRpb25zLnNwYW4gbXVzdCBiZSA8PSAyICogTWF0aC5QSTogJHtvcHRpb25zLnNwYW59YCApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMucmFkaXVzID0gb3B0aW9ucy5yYWRpdXM7XG5cbiAgICBjb25zdCBhbmdsZVBlclRpY2sgPSBvcHRpb25zLnNwYW4gLyBvcHRpb25zLm51bWJlck9mVGlja3M7XG5cbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCB0aGlzLnJhZGl1cywge1xuICAgICAgZmlsbDogb3B0aW9ucy5iYWNrZ3JvdW5kRmlsbCxcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5iYWNrZ3JvdW5kU3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmJhY2tncm91bmRMaW5lV2lkdGhcbiAgICB9ICkgKTtcblxuICAgIGNvbnN0IGZvcmVncm91bmROb2RlID0gbmV3IE5vZGUoIHtcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCBmb3JlZ3JvdW5kTm9kZSApO1xuXG4gICAgY29uc3QgbmVlZGxlID0gbmV3IFBhdGgoIFNoYXBlLmxpbmVTZWdtZW50KCAwLCAwLCB0aGlzLnJhZGl1cyAtIG9wdGlvbnMubWFqb3JUaWNrTGVuZ3RoIC8gMiwgMCApLCB7XG4gICAgICBzdHJva2U6ICdyZWQnLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLm5lZWRsZUxpbmVXaWR0aFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGxhYmVsVGV4dCA9IG5ldyBUZXh0KCBsYWJlbFByb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIG9wdGlvbnMubGFiZWxUZXh0T3B0aW9ucywge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnICksXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy5yYWRpdXMgKiBvcHRpb25zLm1heExhYmVsV2lkdGhTY2FsZVxuICAgIH0gKSApO1xuXG4gICAgbGFiZWxUZXh0LmJvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcbiAgICAgIGxhYmVsVGV4dC5jZW50ZXJYID0gMDtcbiAgICAgIGxhYmVsVGV4dC5jZW50ZXJZID0gLXRoaXMucmFkaXVzIC8gMztcbiAgICB9ICk7XG4gICAgZm9yZWdyb3VuZE5vZGUuYWRkQ2hpbGQoIGxhYmVsVGV4dCApO1xuXG4gICAgY29uc3QgcGluID0gbmV3IENpcmNsZSggMiwgeyBmaWxsOiAnYmxhY2snIH0gKTtcbiAgICBmb3JlZ3JvdW5kTm9kZS5hZGRDaGlsZCggcGluICk7XG5cbiAgICBjb25zdCB0b3RhbEFuZ2xlID0gKCBvcHRpb25zLm51bWJlck9mVGlja3MgLSAxICkgKiBhbmdsZVBlclRpY2s7XG4gICAgY29uc3Qgc3RhcnRBbmdsZSA9IC0xIC8gMiAqIE1hdGguUEkgLSB0b3RhbEFuZ2xlIC8gMjtcbiAgICBjb25zdCBlbmRBbmdsZSA9IHN0YXJ0QW5nbGUgKyB0b3RhbEFuZ2xlO1xuXG4gICAgY29uc3Qgc2NyYXRjaE1hdHJpeCA9IG5ldyBNYXRyaXgzKCk7XG5cbiAgICBjb25zdCB1cGRhdGVOZWVkbGUgPSAoKSA9PiB7XG4gICAgICBpZiAoIHRoaXMudmlzaWJsZVByb3BlcnR5LnZhbHVlIHx8IG9wdGlvbnMudXBkYXRlV2hlbkludmlzaWJsZSApIHtcbiAgICAgICAgaWYgKCB0eXBlb2YgKCB2YWx1ZVByb3BlcnR5LmdldCgpICkgPT09ICdudW1iZXInICkge1xuXG4gICAgICAgICAgLy8gY2xhbXAgdmFsdWUgdG8gdmFsaWQgcmFuZ2UgYW5kIG1hcCBpdCB0byBhbiBhbmdsZVxuICAgICAgICAgIGNvbnN0IGNsYW1wZWRWYWx1ZSA9IFV0aWxzLmNsYW1wKCB2YWx1ZVByb3BlcnR5LmdldCgpLCByYW5nZS5taW4sIHJhbmdlLm1heCApO1xuICAgICAgICAgIGNvbnN0IG5lZWRsZUFuZ2xlID0gVXRpbHMubGluZWFyKCByYW5nZS5taW4sIHJhbmdlLm1heCwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNsYW1wZWRWYWx1ZSApO1xuXG4gICAgICAgICAgLy8gMmQgcm90YXRpb24sIGJ1dCByZXVzaW5nIG91ciBtYXRyaXggYWJvdmVcbiAgICAgICAgICBuZWVkbGUuc2V0TWF0cml4KCBzY3JhdGNoTWF0cml4LnNldFRvUm90YXRpb25aKCBuZWVkbGVBbmdsZSApICk7XG4gICAgICAgICAgbmVlZGxlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgLy8gSGlkZSB0aGUgbmVlZGxlIGlmIHRoZXJlIGlzIG5vIG51bWJlciB2YWx1ZS5cbiAgICAgICAgICBuZWVkbGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHVwZGF0ZU5lZWRsZSApO1xuXG4gICAgLy8gSWYgb3B0aW9ucy51cGRhdGVXaGVuSW52aXNpYmxlIGlzIHRydWUsIHVwZGF0ZU5lZWRsZSB3aWxsIGJlIGNhbGxlZCBieSB0aGUgdmFsdWVQcm9wZXJ0eSBsaXN0ZW5lciBhYm92ZS5cbiAgICAvLyBPdGhlcndpc2UsIHdlIG5lZWQgdG8gbGlzdGVuIHRvIHZpc2libGVQcm9wZXJ0eSwgYW5kIGNhbGwgdXBkYXRlTmVlZGxlIHdoZW4gdGhlIGdhdWdlIGJlY29tZXMgdmlzaWJsZS5cbiAgICBpZiAoICFvcHRpb25zLnVwZGF0ZVdoZW5JbnZpc2libGUgKSB7XG4gICAgICB0aGlzLnZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcbiAgICAgICAgdmlzaWJsZSAmJiB1cGRhdGVOZWVkbGUoKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICAvLyBSZW5kZXIgYWxsIG9mIHRoZSB0aWNrcyBpbnRvIFNoYXBlcyBsYXllcnMgKHNpbmNlIHRoZXkgaGF2ZSBkaWZmZXJlbnQgc3Ryb2tlcylcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrLWJhc2ljcy9pc3N1ZXMvMjA4XG4gICAgY29uc3QgYmlnVGlja3NTaGFwZSA9IG5ldyBTaGFwZSgpO1xuICAgIGNvbnN0IHNtYWxsVGlja3NTaGFwZSA9IG5ldyBTaGFwZSgpO1xuXG4gICAgLy8gQWRkIHRoZSB0aWNrIG1hcmtzXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5udW1iZXJPZlRpY2tzOyBpKysgKSB7XG4gICAgICBjb25zdCB0aWNrQW5nbGUgPSBpICogYW5nbGVQZXJUaWNrICsgc3RhcnRBbmdsZTtcblxuICAgICAgY29uc3QgdGlja0xlbmd0aCA9IGkgJSAyID09PSAwID8gb3B0aW9ucy5tYWpvclRpY2tMZW5ndGggOiBvcHRpb25zLm1pbm9yVGlja0xlbmd0aDtcbiAgICAgIGNvbnN0IHgxID0gKCB0aGlzLnJhZGl1cyAtIHRpY2tMZW5ndGggKSAqIE1hdGguY29zKCB0aWNrQW5nbGUgKTtcbiAgICAgIGNvbnN0IHkxID0gKCB0aGlzLnJhZGl1cyAtIHRpY2tMZW5ndGggKSAqIE1hdGguc2luKCB0aWNrQW5nbGUgKTtcbiAgICAgIGNvbnN0IHgyID0gdGhpcy5yYWRpdXMgKiBNYXRoLmNvcyggdGlja0FuZ2xlICk7XG4gICAgICBjb25zdCB5MiA9IHRoaXMucmFkaXVzICogTWF0aC5zaW4oIHRpY2tBbmdsZSApO1xuICAgICAgaWYgKCBpICUgMiA9PT0gMCApIHtcbiAgICAgICAgYmlnVGlja3NTaGFwZS5tb3ZlVG8oIHgxLCB5MSApO1xuICAgICAgICBiaWdUaWNrc1NoYXBlLmxpbmVUbyggeDIsIHkyICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc21hbGxUaWNrc1NoYXBlLm1vdmVUbyggeDEsIHkxICk7XG4gICAgICAgIHNtYWxsVGlja3NTaGFwZS5saW5lVG8oIHgyLCB5MiApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvcmVncm91bmROb2RlLmFkZENoaWxkKCBuZXcgUGF0aCggYmlnVGlja3NTaGFwZSwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLm1ham9yVGlja1N0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5tYWpvclRpY2tMaW5lV2lkdGhcbiAgICB9ICkgKTtcbiAgICBmb3JlZ3JvdW5kTm9kZS5hZGRDaGlsZCggbmV3IFBhdGgoIHNtYWxsVGlja3NTaGFwZSwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLm1pbm9yVGlja1N0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5taW5vclRpY2tMaW5lV2lkdGhcbiAgICB9ICkgKTtcblxuICAgIC8vIEFkZCBuZWVkbGUgbGFzdCwgc28gaXQncyBvbiB0b3Agb2YgdGlja3MuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy81MDJcbiAgICBmb3JlZ3JvdW5kTm9kZS5hZGRDaGlsZCggbmVlZGxlICk7XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5kaXNwb3NlR2F1Z2VOb2RlID0gKCkgPT4ge1xuICAgICAgaWYgKCB2YWx1ZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB1cGRhdGVOZWVkbGUgKSApIHtcbiAgICAgICAgdmFsdWVQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZU5lZWRsZSApO1xuICAgICAgfVxuXG4gICAgICAvLyBkZS1yZWdpc3RlciBwaGV0LWlvIHRhbmRlbXNcbiAgICAgIGZvcmVncm91bmROb2RlLmRpc3Bvc2UoKTtcbiAgICAgIGxhYmVsVGV4dC5kaXNwb3NlKCk7XG4gICAgfTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnR2F1Z2VOb2RlJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlR2F1Z2VOb2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnR2F1Z2VOb2RlJywgR2F1Z2VOb2RlICk7Il0sIm5hbWVzIjpbIk1hdHJpeDMiLCJVdGlscyIsIlNoYXBlIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQ2lyY2xlIiwiTm9kZSIsIlBhdGgiLCJUZXh0IiwiVGFuZGVtIiwiUGhldEZvbnQiLCJzY2VuZXJ5UGhldCIsIkdhdWdlTm9kZSIsImRpc3Bvc2UiLCJkaXNwb3NlR2F1Z2VOb2RlIiwidmFsdWVQcm9wZXJ0eSIsImxhYmVsUHJvcGVydHkiLCJyYW5nZSIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsIm9wdGlvbnMiLCJyYWRpdXMiLCJiYWNrZ3JvdW5kRmlsbCIsImJhY2tncm91bmRTdHJva2UiLCJiYWNrZ3JvdW5kTGluZVdpZHRoIiwibWF4TGFiZWxXaWR0aFNjYWxlIiwibnVtYmVyT2ZUaWNrcyIsIm1ham9yVGlja1N0cm9rZSIsIm1pbm9yVGlja1N0cm9rZSIsIm1ham9yVGlja0xlbmd0aCIsIm1pbm9yVGlja0xlbmd0aCIsIm1ham9yVGlja0xpbmVXaWR0aCIsIm1pbm9yVGlja0xpbmVXaWR0aCIsInNwYW4iLCJNYXRoIiwiUEkiLCJuZWVkbGVMaW5lV2lkdGgiLCJ1cGRhdGVXaGVuSW52aXNpYmxlIiwibGFiZWxUZXh0T3B0aW9ucyIsImZvbnQiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJhc3NlcnQiLCJhbmdsZVBlclRpY2siLCJhZGRDaGlsZCIsImZpbGwiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJmb3JlZ3JvdW5kTm9kZSIsInBpY2thYmxlIiwibmVlZGxlIiwibGluZVNlZ21lbnQiLCJsYWJlbFRleHQiLCJjcmVhdGVUYW5kZW0iLCJtYXhXaWR0aCIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImNlbnRlclgiLCJjZW50ZXJZIiwicGluIiwidG90YWxBbmdsZSIsInN0YXJ0QW5nbGUiLCJlbmRBbmdsZSIsInNjcmF0Y2hNYXRyaXgiLCJ1cGRhdGVOZWVkbGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJ2YWx1ZSIsImdldCIsImNsYW1wZWRWYWx1ZSIsImNsYW1wIiwibWluIiwibWF4IiwibmVlZGxlQW5nbGUiLCJsaW5lYXIiLCJzZXRNYXRyaXgiLCJzZXRUb1JvdGF0aW9uWiIsInZpc2libGUiLCJiaWdUaWNrc1NoYXBlIiwic21hbGxUaWNrc1NoYXBlIiwiaSIsInRpY2tBbmdsZSIsInRpY2tMZW5ndGgiLCJ4MSIsImNvcyIsInkxIiwic2luIiwieDIiLCJ5MiIsIm1vdmVUbyIsImxpbmVUbyIsIm11dGF0ZSIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUdELE9BQU9BLGFBQWEsMEJBQTBCO0FBRTlDLE9BQU9DLFdBQVcsd0JBQXdCO0FBQzFDLFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRTVFLFNBQVNDLE1BQU0sRUFBRUMsSUFBSSxFQUFlQyxJQUFJLEVBQVVDLElBQUksUUFBcUIsOEJBQThCO0FBQ3pHLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLGNBQWMsZ0JBQWdCO0FBQ3JDLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFvQzVCLElBQUEsQUFBTUMsWUFBTixNQUFNQSxrQkFBa0JOO0lBc0tyQk8sVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxnQkFBZ0I7UUFDckIsS0FBSyxD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