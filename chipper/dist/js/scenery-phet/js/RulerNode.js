// Copyright 2013-2024, University of Colorado Boulder
/**
 * RulerNode is the visual representation of a ruler.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Path, Rectangle, Text } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
// constants
const DEFAULT_FONT = new PhetFont(18);
let RulerNode = class RulerNode extends Node {
    dispose() {
        this.disposeRulerNode();
        super.dispose();
    }
    /**
   * @param rulerWidth  distance between left-most and right-most tick, insets will be added to this
   * @param rulerHeight
   * @param majorTickWidth
   * @param majorTickLabels
   * @param units
   * @param providedOptions
   */ constructor(rulerWidth, rulerHeight, majorTickWidth, majorTickLabels, units, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        // default options
        const options = optionize()({
            // SelfOptions
            backgroundFill: RulerNode.DEFAULT_FILL,
            backgroundStroke: 'black',
            backgroundLineWidth: 1,
            insetsWidth: 14,
            majorTickFont: DEFAULT_FONT,
            majorTickHeight: 0.4 * rulerHeight / 2,
            majorTickStroke: 'black',
            majorTickLineWidth: 1,
            minorTickFont: DEFAULT_FONT,
            minorTickHeight: 0.2 * rulerHeight / 2,
            minorTickStroke: 'black',
            minorTickLineWidth: 1,
            minorTicksPerMajorTick: 0,
            unitsFont: DEFAULT_FONT,
            unitsMajorTickIndex: 0,
            unitsSpacing: 3,
            tickMarksOnTop: true,
            tickMarksOnBottom: true,
            // NodeOptions
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'RulerNode'
        }, providedOptions);
        // things you're likely to mess up, add more as needed
        assert && assert(Math.floor(rulerWidth / majorTickWidth) + 1 === majorTickLabels.length); // do we have enough major tick labels?
        assert && assert(options.unitsMajorTickIndex < majorTickLabels.length);
        assert && assert(options.majorTickHeight < rulerHeight / 2);
        assert && assert(options.minorTickHeight < rulerHeight / 2);
        super();
        // background
        const backgroundNode = new Rectangle(0, 0, rulerWidth + 2 * options.insetsWidth, rulerHeight, {
            fill: options.backgroundFill,
            stroke: options.backgroundStroke,
            lineWidth: options.backgroundLineWidth
        });
        this.addChild(backgroundNode);
        // Lay out tick marks from left to right
        const minorTickWidth = majorTickWidth / (options.minorTicksPerMajorTick + 1);
        const numberOfTicks = Math.floor(rulerWidth / minorTickWidth) + 1;
        let x = options.insetsWidth;
        let majorTickIndex = 0;
        // Minimize number of nodes by using one path for each type of tick line
        const majorTickLinesShape = new Shape();
        const minorTickLinesShape = new Shape();
        // Units label, which is positioned and (if necessary) scaled later
        const unitsLabelText = new Text(units, {
            font: options.unitsFont,
            pickable: false,
            tandem: options.tandem.createTandem('unitsLabelText')
        });
        let unitsLabelMaxWidth = Number.POSITIVE_INFINITY;
        this.addChild(unitsLabelText);
        for(let i = 0; i < numberOfTicks; i++){
            if (i % (options.minorTicksPerMajorTick + 1) === 0) {
                // Major tick
                // Create the tick label regardless of whether we add it, since it's required to layout the units label
                const majorTickLabel = majorTickLabels[majorTickIndex];
                const majorTickLabelNode = new Text(majorTickLabel, {
                    font: options.majorTickFont,
                    centerX: x,
                    centerY: backgroundNode.centerY,
                    pickable: false
                });
                // Only add a major tick at leftmost or rightmost end if the insetsWidth is nonzero
                if (options.insetsWidth !== 0 || i !== 0 && i !== numberOfTicks - 1) {
                    // label, only added as a child if it's non-empty (and non-null)
                    if (majorTickLabel) {
                        this.addChild(majorTickLabelNode);
                    }
                    // line
                    if (options.tickMarksOnTop) {
                        majorTickLinesShape.moveTo(x, 0).lineTo(x, options.majorTickHeight);
                    }
                    if (options.tickMarksOnBottom) {
                        majorTickLinesShape.moveTo(x, rulerHeight - options.majorTickHeight).lineTo(x, rulerHeight);
                    }
                }
                // Position the units label
                if (majorTickIndex === options.unitsMajorTickIndex) {
                    unitsLabelText.left = majorTickLabelNode.right + options.unitsSpacing;
                    unitsLabelText.y = majorTickLabelNode.y;
                } else if (majorTickIndex > options.unitsMajorTickIndex && unitsLabelMaxWidth === Number.POSITIVE_INFINITY && majorTickLabelNode.width > 0) {
                    // make sure the units label fits between the tick mark labels
                    unitsLabelMaxWidth = majorTickLabelNode.left - options.unitsSpacing - unitsLabelText.left;
                    assert && assert(unitsLabelMaxWidth > 0, 'space for units label is negative or zero');
                    unitsLabelText.maxWidth = unitsLabelMaxWidth;
                }
                majorTickIndex++;
            } else {
                // Minor tick
                // Only add a minor tick at leftmost or rightmost end if the insetsWidth is nonzero
                if (options.insetsWidth !== 0 || i !== 0 && i !== numberOfTicks - 1) {
                    if (options.tickMarksOnTop) {
                        minorTickLinesShape.moveTo(x, 0).lineTo(x, options.minorTickHeight);
                    }
                    if (options.tickMarksOnBottom) {
                        minorTickLinesShape.moveTo(x, rulerHeight - options.minorTickHeight).lineTo(x, rulerHeight);
                    }
                }
            }
            x += minorTickWidth;
        }
        // Handle the case where the units label extends off the edge of the ruler.  This is kind of a corner case, but was
        // seen when testing long strings on Pendulum Lab.
        if (unitsLabelText.bounds.maxX > backgroundNode.bounds.maxX - options.unitsSpacing) {
            unitsLabelMaxWidth = backgroundNode.bounds.maxX - options.unitsSpacing - unitsLabelText.x;
            unitsLabelText.scale(unitsLabelMaxWidth / unitsLabelText.width);
        }
        // Major tick lines
        this.addChild(new Path(majorTickLinesShape, {
            stroke: options.majorTickStroke,
            lineWidth: options.majorTickLineWidth,
            pickable: false
        }));
        // Minor tick lines
        this.addChild(new Path(minorTickLinesShape, {
            stroke: options.minorTickStroke,
            lineWidth: options.minorTickLineWidth,
            pickable: false
        }));
        this.mutate(options);
        this.disposeRulerNode = ()=>{
            unitsLabelText.dispose(); // because may be linked to a translated StringProperty
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'RulerNode', this);
    }
};
RulerNode.DEFAULT_FILL = 'rgb(236, 225, 113)';
sceneryPhet.register('RulerNode', RulerNode);
export default RulerNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9SdWxlck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUnVsZXJOb2RlIGlzIHRoZSB2aXN1YWwgcmVwcmVzZW50YXRpb24gb2YgYSBydWxlci5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEZvbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBSZWN0YW5nbGUsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IERFRkFVTFRfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTggKTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBib2R5IG9mIHRoZSBydWxlclxuICBiYWNrZ3JvdW5kRmlsbD86IFRDb2xvcjtcbiAgYmFja2dyb3VuZFN0cm9rZT86IFRDb2xvcjtcbiAgYmFja2dyb3VuZExpbmVXaWR0aD86IG51bWJlcjtcbiAgaW5zZXRzV2lkdGg/OiBudW1iZXI7IC8vIHNwYWNlIGJldHdlZW4gdGhlIGVuZHMgb2YgdGhlIHJ1bGVyIGFuZCB0aGUgZmlyc3QgYW5kIGxhc3QgdGljayBtYXJrc1xuXG4gIC8vIG1ham9yIHRpY2sgb3B0aW9uc1xuICBtYWpvclRpY2tGb250PzogRm9udDtcbiAgbWFqb3JUaWNrSGVpZ2h0PzogbnVtYmVyO1xuICBtYWpvclRpY2tTdHJva2U/OiBUQ29sb3I7XG4gIG1ham9yVGlja0xpbmVXaWR0aD86IG51bWJlcjtcblxuICAvLyBtaW5vciB0aWNrIG9wdGlvbnNcbiAgbWlub3JUaWNrRm9udD86IEZvbnQ7XG4gIG1pbm9yVGlja0hlaWdodD86IG51bWJlcjtcbiAgbWlub3JUaWNrU3Ryb2tlPzogVENvbG9yO1xuICBtaW5vclRpY2tMaW5lV2lkdGg/OiBudW1iZXI7XG4gIG1pbm9yVGlja3NQZXJNYWpvclRpY2s/OiBudW1iZXI7XG5cbiAgLy8gdW5pdHMgb3B0aW9uc1xuICB1bml0c0ZvbnQ/OiBGb250O1xuICB1bml0c01ham9yVGlja0luZGV4PzogbnVtYmVyOyAvLyB1bml0cyB3aWxsIGJlIHBsYWNlZCB0byB0aGUgcmlnaHQgb2YgdGhpcyBtYWpvciB0aWNrXG4gIHVuaXRzU3BhY2luZz86IG51bWJlcjsgLy8gaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIHRoZSB0aWNrIGxhYmVsIGFuZCB0aGUgdW5pdHNcblxuICAvLyBhcHBlYXJhbmNlIG9wdGlvbnNcbiAgdGlja01hcmtzT25Ub3A/OiBib29sZWFuO1xuICB0aWNrTWFya3NPbkJvdHRvbT86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBSdWxlck5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuY2xhc3MgUnVsZXJOb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUnVsZXJOb2RlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9GSUxMID0gJ3JnYigyMzYsIDIyNSwgMTEzKSc7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBydWxlcldpZHRoICBkaXN0YW5jZSBiZXR3ZWVuIGxlZnQtbW9zdCBhbmQgcmlnaHQtbW9zdCB0aWNrLCBpbnNldHMgd2lsbCBiZSBhZGRlZCB0byB0aGlzXG4gICAqIEBwYXJhbSBydWxlckhlaWdodFxuICAgKiBAcGFyYW0gbWFqb3JUaWNrV2lkdGhcbiAgICogQHBhcmFtIG1ham9yVGlja0xhYmVsc1xuICAgKiBAcGFyYW0gdW5pdHNcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBydWxlcldpZHRoOiBudW1iZXIsIHJ1bGVySGVpZ2h0OiBudW1iZXIsIG1ham9yVGlja1dpZHRoOiBudW1iZXIsIG1ham9yVGlja0xhYmVsczogc3RyaW5nW10sXG4gICAgICAgICAgICAgICAgICAgICAgdW5pdHM6IHN0cmluZyB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIHByb3ZpZGVkT3B0aW9ucz86IFJ1bGVyTm9kZU9wdGlvbnMgKSB7XG5cbiAgICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJ1bGVyTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgYmFja2dyb3VuZEZpbGw6IFJ1bGVyTm9kZS5ERUZBVUxUX0ZJTEwsXG4gICAgICBiYWNrZ3JvdW5kU3Ryb2tlOiAnYmxhY2snLFxuICAgICAgYmFja2dyb3VuZExpbmVXaWR0aDogMSxcbiAgICAgIGluc2V0c1dpZHRoOiAxNCxcbiAgICAgIG1ham9yVGlja0ZvbnQ6IERFRkFVTFRfRk9OVCxcbiAgICAgIG1ham9yVGlja0hlaWdodDogKCAwLjQgKiBydWxlckhlaWdodCApIC8gMixcbiAgICAgIG1ham9yVGlja1N0cm9rZTogJ2JsYWNrJyxcbiAgICAgIG1ham9yVGlja0xpbmVXaWR0aDogMSxcbiAgICAgIG1pbm9yVGlja0ZvbnQ6IERFRkFVTFRfRk9OVCxcbiAgICAgIG1pbm9yVGlja0hlaWdodDogKCAwLjIgKiBydWxlckhlaWdodCApIC8gMixcbiAgICAgIG1pbm9yVGlja1N0cm9rZTogJ2JsYWNrJyxcbiAgICAgIG1pbm9yVGlja0xpbmVXaWR0aDogMSxcbiAgICAgIG1pbm9yVGlja3NQZXJNYWpvclRpY2s6IDAsXG4gICAgICB1bml0c0ZvbnQ6IERFRkFVTFRfRk9OVCxcbiAgICAgIHVuaXRzTWFqb3JUaWNrSW5kZXg6IDAsXG4gICAgICB1bml0c1NwYWNpbmc6IDMsXG4gICAgICB0aWNrTWFya3NPblRvcDogdHJ1ZSxcbiAgICAgIHRpY2tNYXJrc09uQm90dG9tOiB0cnVlLFxuXG4gICAgICAvLyBOb2RlT3B0aW9uc1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnUnVsZXJOb2RlJ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gdGhpbmdzIHlvdSdyZSBsaWtlbHkgdG8gbWVzcyB1cCwgYWRkIG1vcmUgYXMgbmVlZGVkXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5mbG9vciggcnVsZXJXaWR0aCAvIG1ham9yVGlja1dpZHRoICkgKyAxID09PSBtYWpvclRpY2tMYWJlbHMubGVuZ3RoICk7IC8vIGRvIHdlIGhhdmUgZW5vdWdoIG1ham9yIHRpY2sgbGFiZWxzP1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMudW5pdHNNYWpvclRpY2tJbmRleCA8IG1ham9yVGlja0xhYmVscy5sZW5ndGggKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLm1ham9yVGlja0hlaWdodCA8IHJ1bGVySGVpZ2h0IC8gMiApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMubWlub3JUaWNrSGVpZ2h0IDwgcnVsZXJIZWlnaHQgLyAyICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgLy8gYmFja2dyb3VuZFxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgcnVsZXJXaWR0aCArICggMiAqIG9wdGlvbnMuaW5zZXRzV2lkdGggKSwgcnVsZXJIZWlnaHQsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuYmFja2dyb3VuZEZpbGwsXG4gICAgICBzdHJva2U6IG9wdGlvbnMuYmFja2dyb3VuZFN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5iYWNrZ3JvdW5kTGluZVdpZHRoXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGJhY2tncm91bmROb2RlICk7XG5cbiAgICAvLyBMYXkgb3V0IHRpY2sgbWFya3MgZnJvbSBsZWZ0IHRvIHJpZ2h0XG4gICAgY29uc3QgbWlub3JUaWNrV2lkdGggPSBtYWpvclRpY2tXaWR0aCAvICggb3B0aW9ucy5taW5vclRpY2tzUGVyTWFqb3JUaWNrICsgMSApO1xuICAgIGNvbnN0IG51bWJlck9mVGlja3MgPSBNYXRoLmZsb29yKCBydWxlcldpZHRoIC8gbWlub3JUaWNrV2lkdGggKSArIDE7XG4gICAgbGV0IHggPSBvcHRpb25zLmluc2V0c1dpZHRoO1xuICAgIGxldCBtYWpvclRpY2tJbmRleCA9IDA7XG5cbiAgICAvLyBNaW5pbWl6ZSBudW1iZXIgb2Ygbm9kZXMgYnkgdXNpbmcgb25lIHBhdGggZm9yIGVhY2ggdHlwZSBvZiB0aWNrIGxpbmVcbiAgICBjb25zdCBtYWpvclRpY2tMaW5lc1NoYXBlID0gbmV3IFNoYXBlKCk7XG4gICAgY29uc3QgbWlub3JUaWNrTGluZXNTaGFwZSA9IG5ldyBTaGFwZSgpO1xuXG4gICAgLy8gVW5pdHMgbGFiZWwsIHdoaWNoIGlzIHBvc2l0aW9uZWQgYW5kIChpZiBuZWNlc3NhcnkpIHNjYWxlZCBsYXRlclxuICAgIGNvbnN0IHVuaXRzTGFiZWxUZXh0ID0gbmV3IFRleHQoIHVuaXRzLCB7XG4gICAgICBmb250OiBvcHRpb25zLnVuaXRzRm9udCxcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndW5pdHNMYWJlbFRleHQnIClcbiAgICB9ICk7XG4gICAgbGV0IHVuaXRzTGFiZWxNYXhXaWR0aCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICB0aGlzLmFkZENoaWxkKCB1bml0c0xhYmVsVGV4dCApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZUaWNrczsgaSsrICkge1xuXG4gICAgICBpZiAoIGkgJSAoIG9wdGlvbnMubWlub3JUaWNrc1Blck1ham9yVGljayArIDEgKSA9PT0gMCApIHsgIC8vIGFzc3VtZXMgdGhhdCB0aGUgZmlyc3QgKGxlZnRtb3N0KSB0aWNrIGlzIGEgbWFqb3IgdGlja1xuXG4gICAgICAgIC8vIE1ham9yIHRpY2tcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIHRpY2sgbGFiZWwgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHdlIGFkZCBpdCwgc2luY2UgaXQncyByZXF1aXJlZCB0byBsYXlvdXQgdGhlIHVuaXRzIGxhYmVsXG4gICAgICAgIGNvbnN0IG1ham9yVGlja0xhYmVsID0gbWFqb3JUaWNrTGFiZWxzWyBtYWpvclRpY2tJbmRleCBdO1xuICAgICAgICBjb25zdCBtYWpvclRpY2tMYWJlbE5vZGUgPSBuZXcgVGV4dCggbWFqb3JUaWNrTGFiZWwsIHtcbiAgICAgICAgICBmb250OiBvcHRpb25zLm1ham9yVGlja0ZvbnQsXG4gICAgICAgICAgY2VudGVyWDogeCxcbiAgICAgICAgICBjZW50ZXJZOiBiYWNrZ3JvdW5kTm9kZS5jZW50ZXJZLFxuICAgICAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gT25seSBhZGQgYSBtYWpvciB0aWNrIGF0IGxlZnRtb3N0IG9yIHJpZ2h0bW9zdCBlbmQgaWYgdGhlIGluc2V0c1dpZHRoIGlzIG5vbnplcm9cbiAgICAgICAgaWYgKCBvcHRpb25zLmluc2V0c1dpZHRoICE9PSAwIHx8ICggaSAhPT0gMCAmJiBpICE9PSBudW1iZXJPZlRpY2tzIC0gMSApICkge1xuXG4gICAgICAgICAgLy8gbGFiZWwsIG9ubHkgYWRkZWQgYXMgYSBjaGlsZCBpZiBpdCdzIG5vbi1lbXB0eSAoYW5kIG5vbi1udWxsKVxuICAgICAgICAgIGlmICggbWFqb3JUaWNrTGFiZWwgKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKCBtYWpvclRpY2tMYWJlbE5vZGUgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBsaW5lXG4gICAgICAgICAgaWYgKCBvcHRpb25zLnRpY2tNYXJrc09uVG9wICkge1xuICAgICAgICAgICAgbWFqb3JUaWNrTGluZXNTaGFwZS5tb3ZlVG8oIHgsIDAgKS5saW5lVG8oIHgsIG9wdGlvbnMubWFqb3JUaWNrSGVpZ2h0ICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggb3B0aW9ucy50aWNrTWFya3NPbkJvdHRvbSApIHtcbiAgICAgICAgICAgIG1ham9yVGlja0xpbmVzU2hhcGUubW92ZVRvKCB4LCBydWxlckhlaWdodCAtIG9wdGlvbnMubWFqb3JUaWNrSGVpZ2h0ICkubGluZVRvKCB4LCBydWxlckhlaWdodCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBvc2l0aW9uIHRoZSB1bml0cyBsYWJlbFxuICAgICAgICBpZiAoIG1ham9yVGlja0luZGV4ID09PSBvcHRpb25zLnVuaXRzTWFqb3JUaWNrSW5kZXggKSB7XG4gICAgICAgICAgdW5pdHNMYWJlbFRleHQubGVmdCA9IG1ham9yVGlja0xhYmVsTm9kZS5yaWdodCArIG9wdGlvbnMudW5pdHNTcGFjaW5nO1xuICAgICAgICAgIHVuaXRzTGFiZWxUZXh0LnkgPSBtYWpvclRpY2tMYWJlbE5vZGUueTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggbWFqb3JUaWNrSW5kZXggPiBvcHRpb25zLnVuaXRzTWFqb3JUaWNrSW5kZXggJiYgdW5pdHNMYWJlbE1heFdpZHRoID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgJiYgbWFqb3JUaWNrTGFiZWxOb2RlLndpZHRoID4gMCApIHtcblxuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgdW5pdHMgbGFiZWwgZml0cyBiZXR3ZWVuIHRoZSB0aWNrIG1hcmsgbGFiZWxzXG4gICAgICAgICAgdW5pdHNMYWJlbE1heFdpZHRoID0gbWFqb3JUaWNrTGFiZWxOb2RlLmxlZnQgLSBvcHRpb25zLnVuaXRzU3BhY2luZyAtIHVuaXRzTGFiZWxUZXh0LmxlZnQ7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdW5pdHNMYWJlbE1heFdpZHRoID4gMCwgJ3NwYWNlIGZvciB1bml0cyBsYWJlbCBpcyBuZWdhdGl2ZSBvciB6ZXJvJyApO1xuICAgICAgICAgIHVuaXRzTGFiZWxUZXh0Lm1heFdpZHRoID0gdW5pdHNMYWJlbE1heFdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgbWFqb3JUaWNrSW5kZXgrKztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBNaW5vciB0aWNrXG4gICAgICAgIC8vIE9ubHkgYWRkIGEgbWlub3IgdGljayBhdCBsZWZ0bW9zdCBvciByaWdodG1vc3QgZW5kIGlmIHRoZSBpbnNldHNXaWR0aCBpcyBub256ZXJvXG4gICAgICAgIGlmICggb3B0aW9ucy5pbnNldHNXaWR0aCAhPT0gMCB8fCAoIGkgIT09IDAgJiYgaSAhPT0gbnVtYmVyT2ZUaWNrcyAtIDEgKSApIHtcbiAgICAgICAgICBpZiAoIG9wdGlvbnMudGlja01hcmtzT25Ub3AgKSB7XG4gICAgICAgICAgICBtaW5vclRpY2tMaW5lc1NoYXBlLm1vdmVUbyggeCwgMCApLmxpbmVUbyggeCwgb3B0aW9ucy5taW5vclRpY2tIZWlnaHQgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCBvcHRpb25zLnRpY2tNYXJrc09uQm90dG9tICkge1xuICAgICAgICAgICAgbWlub3JUaWNrTGluZXNTaGFwZS5tb3ZlVG8oIHgsIHJ1bGVySGVpZ2h0IC0gb3B0aW9ucy5taW5vclRpY2tIZWlnaHQgKS5saW5lVG8oIHgsIHJ1bGVySGVpZ2h0ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB4ICs9IG1pbm9yVGlja1dpZHRoO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSB0aGUgY2FzZSB3aGVyZSB0aGUgdW5pdHMgbGFiZWwgZXh0ZW5kcyBvZmYgdGhlIGVkZ2Ugb2YgdGhlIHJ1bGVyLiAgVGhpcyBpcyBraW5kIG9mIGEgY29ybmVyIGNhc2UsIGJ1dCB3YXNcbiAgICAvLyBzZWVuIHdoZW4gdGVzdGluZyBsb25nIHN0cmluZ3Mgb24gUGVuZHVsdW0gTGFiLlxuICAgIGlmICggdW5pdHNMYWJlbFRleHQuYm91bmRzLm1heFggPiBiYWNrZ3JvdW5kTm9kZS5ib3VuZHMubWF4WCAtIG9wdGlvbnMudW5pdHNTcGFjaW5nICkge1xuICAgICAgdW5pdHNMYWJlbE1heFdpZHRoID0gKCBiYWNrZ3JvdW5kTm9kZS5ib3VuZHMubWF4WCAtIG9wdGlvbnMudW5pdHNTcGFjaW5nICkgLSB1bml0c0xhYmVsVGV4dC54O1xuICAgICAgdW5pdHNMYWJlbFRleHQuc2NhbGUoIHVuaXRzTGFiZWxNYXhXaWR0aCAvIHVuaXRzTGFiZWxUZXh0LndpZHRoICk7XG4gICAgfVxuXG4gICAgLy8gTWFqb3IgdGljayBsaW5lc1xuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCBtYWpvclRpY2tMaW5lc1NoYXBlLCB7XG4gICAgICBzdHJva2U6IG9wdGlvbnMubWFqb3JUaWNrU3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLm1ham9yVGlja0xpbmVXaWR0aCxcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKSApO1xuXG4gICAgLy8gTWlub3IgdGljayBsaW5lc1xuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCBtaW5vclRpY2tMaW5lc1NoYXBlLCB7XG4gICAgICBzdHJva2U6IG9wdGlvbnMubWlub3JUaWNrU3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLm1pbm9yVGlja0xpbmVXaWR0aCxcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKSApO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcG9zZVJ1bGVyTm9kZSA9ICgpID0+IHtcbiAgICAgIHVuaXRzTGFiZWxUZXh0LmRpc3Bvc2UoKTsgLy8gYmVjYXVzZSBtYXkgYmUgbGlua2VkIHRvIGEgdHJhbnNsYXRlZCBTdHJpbmdQcm9wZXJ0eVxuICAgIH07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ1J1bGVyTm9kZScsIHRoaXMgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZVJ1bGVyTm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1J1bGVyTm9kZScsIFJ1bGVyTm9kZSApO1xuZXhwb3J0IGRlZmF1bHQgUnVsZXJOb2RlOyJdLCJuYW1lcyI6WyJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJUYW5kZW0iLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiREVGQVVMVF9GT05UIiwiUnVsZXJOb2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VSdWxlck5vZGUiLCJydWxlcldpZHRoIiwicnVsZXJIZWlnaHQiLCJtYWpvclRpY2tXaWR0aCIsIm1ham9yVGlja0xhYmVscyIsInVuaXRzIiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsImJhY2tncm91bmRGaWxsIiwiREVGQVVMVF9GSUxMIiwiYmFja2dyb3VuZFN0cm9rZSIsImJhY2tncm91bmRMaW5lV2lkdGgiLCJpbnNldHNXaWR0aCIsIm1ham9yVGlja0ZvbnQiLCJtYWpvclRpY2tIZWlnaHQiLCJtYWpvclRpY2tTdHJva2UiLCJtYWpvclRpY2tMaW5lV2lkdGgiLCJtaW5vclRpY2tGb250IiwibWlub3JUaWNrSGVpZ2h0IiwibWlub3JUaWNrU3Ryb2tlIiwibWlub3JUaWNrTGluZVdpZHRoIiwibWlub3JUaWNrc1Blck1ham9yVGljayIsInVuaXRzRm9udCIsInVuaXRzTWFqb3JUaWNrSW5kZXgiLCJ1bml0c1NwYWNpbmciLCJ0aWNrTWFya3NPblRvcCIsInRpY2tNYXJrc09uQm90dG9tIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwiYXNzZXJ0IiwiTWF0aCIsImZsb29yIiwibGVuZ3RoIiwiYmFja2dyb3VuZE5vZGUiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiYWRkQ2hpbGQiLCJtaW5vclRpY2tXaWR0aCIsIm51bWJlck9mVGlja3MiLCJ4IiwibWFqb3JUaWNrSW5kZXgiLCJtYWpvclRpY2tMaW5lc1NoYXBlIiwibWlub3JUaWNrTGluZXNTaGFwZSIsInVuaXRzTGFiZWxUZXh0IiwiZm9udCIsInBpY2thYmxlIiwiY3JlYXRlVGFuZGVtIiwidW5pdHNMYWJlbE1heFdpZHRoIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJpIiwibWFqb3JUaWNrTGFiZWwiLCJtYWpvclRpY2tMYWJlbE5vZGUiLCJjZW50ZXJYIiwiY2VudGVyWSIsIm1vdmVUbyIsImxpbmVUbyIsImxlZnQiLCJyaWdodCIsInkiLCJ3aWR0aCIsIm1heFdpZHRoIiwiYm91bmRzIiwibWF4WCIsInNjYWxlIiwibXV0YXRlIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxTQUFTQSxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLHNCQUFzQix1REFBdUQ7QUFDcEYsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsU0FBZUMsSUFBSSxFQUFlQyxJQUFJLEVBQUVDLFNBQVMsRUFBVUMsSUFBSSxRQUFRLDhCQUE4QjtBQUNyRyxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQyxjQUFjLGdCQUFnQjtBQUNyQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDLFlBQVk7QUFDWixNQUFNQyxlQUFlLElBQUlGLFNBQVU7QUFtQ25DLElBQUEsQUFBTUcsWUFBTixNQUFNQSxrQkFBa0JSO0lBNktOUyxVQUFnQjtRQUM5QixJQUFJLENBQUNDLGdCQUFnQjtRQUNyQixLQUFLLENBQUNEO0lBQ1I7SUExS0E7Ozs7Ozs7R0FPQyxHQUNELFlBQW9CRSxVQUFrQixFQUFFQyxXQUFtQixFQUFFQyxjQUFzQixFQUFFQyxlQUF5QixFQUMxRkMsS0FBeUMsRUFBRUMsZUFBa0MsQ0FBRztZQTJKeEZDLHNDQUFBQSxzQkFBQUE7UUF6SlYsa0JBQWtCO1FBQ2xCLE1BQU1DLFVBQVVuQixZQUF5RDtZQUV2RSxjQUFjO1lBQ2RvQixnQkFBZ0JYLFVBQVVZLFlBQVk7WUFDdENDLGtCQUFrQjtZQUNsQkMscUJBQXFCO1lBQ3JCQyxhQUFhO1lBQ2JDLGVBQWVqQjtZQUNma0IsaUJBQWlCLEFBQUUsTUFBTWIsY0FBZ0I7WUFDekNjLGlCQUFpQjtZQUNqQkMsb0JBQW9CO1lBQ3BCQyxlQUFlckI7WUFDZnNCLGlCQUFpQixBQUFFLE1BQU1qQixjQUFnQjtZQUN6Q2tCLGlCQUFpQjtZQUNqQkMs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