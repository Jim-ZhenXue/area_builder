// Copyright 2014-2024, University of Colorado Boulder
/**
 * ScientificNotationNode displays a number in scientific notation, M x 10^E, where:
 * - M is the mantissa
 * - E is the exponent, a positive or negative integer
 *
 * For example, with 2 decimal places in the mantissa, 0.0002342 would be written as 2.34 x 10^-4.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Utils from '../../dot/js/Utils.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Text } from '../../scenery/js/imports.js';
import MathSymbols from './MathSymbols.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
let ScientificNotationNode = class ScientificNotationNode extends Node {
    dispose() {
        this.disposeScientificNotationNode();
        super.dispose();
    }
    update(value) {
        const options = this.options;
        // NOTE: Adding and removing nodes is more expensive than changing visibility, but results in correct bounds.
        // So this implementation sets this.children based on which child Nodes should be visible.
        if (value === null) {
            // no value
            this.mantissaNode.string = options.nullValueString;
            this.children = [
                this.mantissaNode
            ];
        } else if (!isFinite(value)) {
            // use built-in toFixed to format values that are not finite
            // NaN -> 'NaN', Infinity -> 'Infinity', etc.
            this.mantissaNode.string = value.toFixed(0); // eslint-disable-line phet/bad-sim-text
            this.children = [
                this.mantissaNode
            ];
        } else if (Math.floor(value) === value && options.showIntegersAsMantissaOnly) {
            // show integers as mantissa only, 'M'
            this.mantissaNode.string = value;
            this.children = [
                this.mantissaNode
            ];
        } else {
            const scientificNotation = ScientificNotationNode.toScientificNotation(value, options);
            if (parseFloat(scientificNotation.mantissa) === 0 && options.showZeroAsInteger) {
                // show '0 x 10^E' as '0'
                this.mantissaNode.string = '0';
                this.children = [
                    this.mantissaNode
                ];
            } else if (scientificNotation.exponent === '0' && !options.showZeroExponent) {
                // show 'M x 10^0' as 'M'
                this.mantissaNode.string = scientificNotation.mantissa;
                this.children = [
                    this.mantissaNode
                ];
            } else {
                // show 'M x 10^E'
                this.mantissaNode.string = scientificNotation.mantissa;
                this.timesTenNode.string = 'x 10';
                this.exponentNode.string = scientificNotation.exponent;
                this.children = [
                    this.mantissaNode,
                    this.exponentNode,
                    this.timesTenNode
                ];
                // adjust layout
                this.timesTenNode.left = this.mantissaNode.right + this.mantissaXSpacing;
                this.exponentNode.left = this.timesTenNode.right + options.exponentXSpacing;
            }
        }
    }
    /**
   * Converts a number to scientific-notation format: M x 10^E, with mantissa M and exponent E.
   */ static toScientificNotation(value, providedOptions) {
        assert && assert(isFinite(value), `value must be finite: ${value}`);
        const options = optionize()({
            mantissaDecimalPlaces: 1,
            exponent: null // exponent will be computed
        }, providedOptions);
        let mantissa;
        let exponent;
        if (options.exponent !== null) {
            // M x 10^E, where E is options.exponent
            mantissa = Utils.toFixed(value / Math.pow(10, options.exponent), options.mantissaDecimalPlaces);
            exponent = options.exponent.toString();
        } else {
            // Convert to a string in exponential notation, where the mantissa has 1 digit to the left of the decimal place.
            const exponentialString = value.toExponential(options.mantissaDecimalPlaces);
            // Break into mantissa and exponent tokens.
            const tokens = exponentialString.toLowerCase().split('e');
            mantissa = tokens[0];
            exponent = tokens[1];
            // The exponent token include a '+' or '-' sign. Remove the '+' sign from positive exponents.
            if (exponent.startsWith('+')) {
                exponent = exponent.substring(1, exponent.length);
            }
        }
        // mantissa x 10^exponent
        return {
            mantissa: mantissa,
            exponent: exponent
        };
    }
    constructor(valueProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            fill: 'black',
            font: new PhetFont(20),
            exponent: null,
            mantissaDecimalPlaces: 1,
            exponentScale: 0.75,
            showIntegersAsMantissaOnly: false,
            showZeroAsInteger: true,
            showZeroExponent: false,
            exponentXSpacing: 2,
            exponentYOffset: 0,
            capHeightScale: 0.75,
            nullValueString: MathSymbols.NO_VALUE
        }, providedOptions);
        super();
        this.valueProperty = valueProperty;
        this.options = options;
        const textOptions = {
            font: options.font,
            fill: options.fill
        };
        // Compute font metrics that we'll need for layout.
        const tmpText = new Text(' ', textOptions);
        this.mantissaXSpacing = tmpText.width;
        this.capHeight = options.capHeightScale * (tmpText.top - tmpText.y);
        this.mantissaNode = new Text('?', textOptions);
        this.timesTenNode = new Text('?', textOptions);
        this.exponentNode = new Text('?', optionize()({
            scale: options.exponentScale,
            centerY: this.timesTenNode.y + this.capHeight + options.exponentYOffset
        }, textOptions));
        // We'll start with just the mantissaNode. update will add the other Nodes as appropriate.
        assert && assert(!options.children, 'ScientificNotationNode sets children');
        options.children = [
            this.mantissaNode
        ];
        this.mutate(options);
        const valuePropertyObserver = this.update.bind(this);
        valueProperty.link(valuePropertyObserver);
        this.disposeScientificNotationNode = ()=>{
            if (valueProperty.hasListener(valuePropertyObserver)) {
                valueProperty.unlink(valuePropertyObserver);
            }
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'ScientificNotationNode', this);
    }
};
export { ScientificNotationNode as default };
sceneryPhet.register('ScientificNotationNode', ScientificNotationNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TY2llbnRpZmljTm90YXRpb25Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUgZGlzcGxheXMgYSBudW1iZXIgaW4gc2NpZW50aWZpYyBub3RhdGlvbiwgTSB4IDEwXkUsIHdoZXJlOlxuICogLSBNIGlzIHRoZSBtYW50aXNzYVxuICogLSBFIGlzIHRoZSBleHBvbmVudCwgYSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSBpbnRlZ2VyXG4gKlxuICogRm9yIGV4YW1wbGUsIHdpdGggMiBkZWNpbWFsIHBsYWNlcyBpbiB0aGUgbWFudGlzc2EsIDAuMDAwMjM0MiB3b3VsZCBiZSB3cml0dGVuIGFzIDIuMzQgeCAxMF4tNC5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEZvbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBUQ29sb3IsIFRleHQsIFRleHRPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuL01hdGhTeW1ib2xzLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuL1BoZXRGb250LmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgZmlsbD86IFRDb2xvcjtcbiAgZm9udD86IEZvbnQ7XG4gIGV4cG9uZW50PzogbnVtYmVyIHwgbnVsbDsgLy8gaWYgbnVsbCwgZXhwb25lbnQgd2lsbCBiZSBjb21wdXRlZCBzbyB0aGF0IG1hbnRpc3NhIGhhcyAxIGRpZ2l0IHRvIHRoZSBsZWZ0IG9mIHRoZSBkZWNpbWFsIHBvaW50XG4gIG1hbnRpc3NhRGVjaW1hbFBsYWNlcz86IG51bWJlcjtcbiAgZXhwb25lbnRTY2FsZT86IG51bWJlcjsgLy8gc2NhbGUgb2YgdGhlIGV4cG9uZW50LCByZWxhdGl2ZSB0byB0aGUgc2l6ZSBvZiB0aGUgJzEwJ1xuICBzaG93SW50ZWdlcnNBc01hbnRpc3NhT25seT86IGJvb2xlYW47IC8vIGlmIHRydWUsIHNob3cgODAwMCBhcyAnODAwMCcsIG90aGVyd2lzZSAnOCB4IDEwXjMnXG4gIHNob3daZXJvQXNJbnRlZ2VyPzogYm9vbGVhbjsgLy8gaWYgdHJ1ZSwgc2hvdyAnMCB4IDEwXkUnIGFzICcwJ1xuICBzaG93WmVyb0V4cG9uZW50PzogYm9vbGVhbjsgLy8gaWYgZmFsc2UsIHNob3cgJ00geCAxMF4wJyBhcyAnTSdcbiAgZXhwb25lbnRYU3BhY2luZz86IG51bWJlcjsgLy8gc3BhY2UgdG8gbGVmdCBvZiBleHBvbmVudFxuICBleHBvbmVudFlPZmZzZXQ/OiBudW1iZXI7IC8vIG9mZnNldCBvZiBleHBvbmVudCdzIGNlbnRlciBmcm9tIGNhcCBsaW5lXG4gIGNhcEhlaWdodFNjYWxlPzogbnVtYmVyOyAvLyBmdWRnZSBmYWN0b3IgZm9yIGNvbXB1dGluZyB0aGlzLmNhcEhlaWdodCwgY29tcGVuc2F0ZXMgZm9yIGluYWNjdXJhY3kgb2YgVGV4dC5oZWlnaHRcbiAgbnVsbFZhbHVlU3RyaW5nPzogc3RyaW5nOyAvLyBpZiB0aGUgdmFsdWUgaXMgbnVsbCwgZGlzcGxheSB0aGlzIHN0cmluZ1xufTtcblxuZXhwb3J0IHR5cGUgU2NpZW50aWZpY05vdGF0aW9uTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG4vLyBvcHRpb25zIGZvciB0b1NjaWVudGlmaWNOb3RhdGlvblxuZXhwb3J0IHR5cGUgVG9TY2llbnRpZmljTm90YXRpb25PcHRpb25zID0gUGljazxTY2llbnRpZmljTm90YXRpb25Ob2RlT3B0aW9ucywgJ21hbnRpc3NhRGVjaW1hbFBsYWNlcycgfCAnZXhwb25lbnQnPjtcblxuLy8gcmV0dXJuIHR5cGUgb2YgdG9TY2llbnRpZmljTm90YXRpb25cbmV4cG9ydCB0eXBlIFNjaWVudGlmaWNOb3RhdGlvbiA9IHtcbiAgbWFudGlzc2E6IHN0cmluZztcbiAgZXhwb25lbnQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICBwdWJsaWMgcmVhZG9ubHkgdmFsdWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyIHwgbnVsbD47XG4gIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogUmVxdWlyZWQ8U2VsZk9wdGlvbnM+O1xuXG4gIC8vIHdpZHRoIG9mIHNwYWNlIGJldHdlZW4gbWFudGlzc2EgYW5kICd4IDEwJ1xuICBwcml2YXRlIHJlYWRvbmx5IG1hbnRpc3NhWFNwYWNpbmc6IG51bWJlcjtcblxuICAvLyB0aGUgaGVpZ2h0IG9mIGNhcGl0YWwgbGV0dGVycyAoYWthIGNhcCBsaW5lKVxuICBwcml2YXRlIHJlYWRvbmx5IGNhcEhlaWdodDogbnVtYmVyO1xuXG4gIC8vIHBhcnRzIG9mIHRoZSByZXByZXNlbnRhdGlvbiwgJ00geCAxMF5FJ1xuICBwcml2YXRlIHJlYWRvbmx5IG1hbnRpc3NhTm9kZTogVGV4dDtcbiAgcHJpdmF0ZSByZWFkb25seSB0aW1lc1Rlbk5vZGU6IFRleHQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgZXhwb25lbnROb2RlOiBUZXh0O1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVNjaWVudGlmaWNOb3RhdGlvbk5vZGU6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YWx1ZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXIgfCBudWxsPiwgcHJvdmlkZWRPcHRpb25zPzogU2NpZW50aWZpY05vdGF0aW9uTm9kZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNjaWVudGlmaWNOb3RhdGlvbk5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGZpbGw6ICdibGFjaycsXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIwICksXG4gICAgICBleHBvbmVudDogbnVsbCwgLy8gZXhwb25lbnQgd2lsbCBiZSBjb21wdXRlZFxuICAgICAgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiAxLFxuICAgICAgZXhwb25lbnRTY2FsZTogMC43NSxcbiAgICAgIHNob3dJbnRlZ2Vyc0FzTWFudGlzc2FPbmx5OiBmYWxzZSxcbiAgICAgIHNob3daZXJvQXNJbnRlZ2VyOiB0cnVlLFxuICAgICAgc2hvd1plcm9FeHBvbmVudDogZmFsc2UsXG4gICAgICBleHBvbmVudFhTcGFjaW5nOiAyLFxuICAgICAgZXhwb25lbnRZT2Zmc2V0OiAwLFxuICAgICAgY2FwSGVpZ2h0U2NhbGU6IDAuNzUsXG4gICAgICBudWxsVmFsdWVTdHJpbmc6IE1hdGhTeW1ib2xzLk5PX1ZBTFVFXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy52YWx1ZVByb3BlcnR5ID0gdmFsdWVQcm9wZXJ0eTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgY29uc3QgdGV4dE9wdGlvbnMgPSB7IGZvbnQ6IG9wdGlvbnMuZm9udCwgZmlsbDogb3B0aW9ucy5maWxsIH07XG5cbiAgICAvLyBDb21wdXRlIGZvbnQgbWV0cmljcyB0aGF0IHdlJ2xsIG5lZWQgZm9yIGxheW91dC5cbiAgICBjb25zdCB0bXBUZXh0ID0gbmV3IFRleHQoICcgJywgdGV4dE9wdGlvbnMgKTtcbiAgICB0aGlzLm1hbnRpc3NhWFNwYWNpbmcgPSB0bXBUZXh0LndpZHRoO1xuICAgIHRoaXMuY2FwSGVpZ2h0ID0gb3B0aW9ucy5jYXBIZWlnaHRTY2FsZSAqICggdG1wVGV4dC50b3AgLSB0bXBUZXh0LnkgKTtcblxuICAgIHRoaXMubWFudGlzc2FOb2RlID0gbmV3IFRleHQoICc/JywgdGV4dE9wdGlvbnMgKTtcbiAgICB0aGlzLnRpbWVzVGVuTm9kZSA9IG5ldyBUZXh0KCAnPycsIHRleHRPcHRpb25zICk7XG4gICAgdGhpcy5leHBvbmVudE5vZGUgPSBuZXcgVGV4dCggJz8nLCBvcHRpb25pemU8VGV4dE9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIFRleHRPcHRpb25zPigpKCB7XG4gICAgICBzY2FsZTogb3B0aW9ucy5leHBvbmVudFNjYWxlLCAvLyBleHBvbmVudCBpcyBzY2FsZWQhXG4gICAgICBjZW50ZXJZOiB0aGlzLnRpbWVzVGVuTm9kZS55ICsgdGhpcy5jYXBIZWlnaHQgKyBvcHRpb25zLmV4cG9uZW50WU9mZnNldFxuICAgIH0sIHRleHRPcHRpb25zICkgKTtcblxuICAgIC8vIFdlJ2xsIHN0YXJ0IHdpdGgganVzdCB0aGUgbWFudGlzc2FOb2RlLiB1cGRhdGUgd2lsbCBhZGQgdGhlIG90aGVyIE5vZGVzIGFzIGFwcHJvcHJpYXRlLlxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnU2NpZW50aWZpY05vdGF0aW9uTm9kZSBzZXRzIGNoaWxkcmVuJyApO1xuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHRoaXMubWFudGlzc2FOb2RlIF07XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuXG4gICAgY29uc3QgdmFsdWVQcm9wZXJ0eU9ic2VydmVyID0gdGhpcy51cGRhdGUuYmluZCggdGhpcyApO1xuICAgIHZhbHVlUHJvcGVydHkubGluayggdmFsdWVQcm9wZXJ0eU9ic2VydmVyICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VTY2llbnRpZmljTm90YXRpb25Ob2RlID0gKCkgPT4ge1xuICAgICAgaWYgKCB2YWx1ZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB2YWx1ZVByb3BlcnR5T2JzZXJ2ZXIgKSApIHtcbiAgICAgICAgdmFsdWVQcm9wZXJ0eS51bmxpbmsoIHZhbHVlUHJvcGVydHlPYnNlcnZlciApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ1NjaWVudGlmaWNOb3RhdGlvbk5vZGUnLCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VTY2llbnRpZmljTm90YXRpb25Ob2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGUoIHZhbHVlOiBudW1iZXIgfCBudWxsICk6IHZvaWQge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgIC8vIE5PVEU6IEFkZGluZyBhbmQgcmVtb3Zpbmcgbm9kZXMgaXMgbW9yZSBleHBlbnNpdmUgdGhhbiBjaGFuZ2luZyB2aXNpYmlsaXR5LCBidXQgcmVzdWx0cyBpbiBjb3JyZWN0IGJvdW5kcy5cbiAgICAvLyBTbyB0aGlzIGltcGxlbWVudGF0aW9uIHNldHMgdGhpcy5jaGlsZHJlbiBiYXNlZCBvbiB3aGljaCBjaGlsZCBOb2RlcyBzaG91bGQgYmUgdmlzaWJsZS5cblxuICAgIGlmICggdmFsdWUgPT09IG51bGwgKSB7XG5cbiAgICAgIC8vIG5vIHZhbHVlXG4gICAgICB0aGlzLm1hbnRpc3NhTm9kZS5zdHJpbmcgPSBvcHRpb25zLm51bGxWYWx1ZVN0cmluZztcbiAgICAgIHRoaXMuY2hpbGRyZW4gPSBbIHRoaXMubWFudGlzc2FOb2RlIF07XG4gICAgfVxuICAgIGVsc2UgaWYgKCAhaXNGaW5pdGUoIHZhbHVlICkgKSB7XG5cbiAgICAgIC8vIHVzZSBidWlsdC1pbiB0b0ZpeGVkIHRvIGZvcm1hdCB2YWx1ZXMgdGhhdCBhcmUgbm90IGZpbml0ZVxuICAgICAgLy8gTmFOIC0+ICdOYU4nLCBJbmZpbml0eSAtPiAnSW5maW5pdHknLCBldGMuXG4gICAgICB0aGlzLm1hbnRpc3NhTm9kZS5zdHJpbmcgPSB2YWx1ZS50b0ZpeGVkKCAwICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgICAgIHRoaXMuY2hpbGRyZW4gPSBbIHRoaXMubWFudGlzc2FOb2RlIF07XG4gICAgfVxuICAgIGVsc2UgaWYgKCBNYXRoLmZsb29yKCB2YWx1ZSApID09PSB2YWx1ZSAmJiBvcHRpb25zLnNob3dJbnRlZ2Vyc0FzTWFudGlzc2FPbmx5ICkge1xuXG4gICAgICAvLyBzaG93IGludGVnZXJzIGFzIG1hbnRpc3NhIG9ubHksICdNJ1xuICAgICAgdGhpcy5tYW50aXNzYU5vZGUuc3RyaW5nID0gdmFsdWU7XG4gICAgICB0aGlzLmNoaWxkcmVuID0gWyB0aGlzLm1hbnRpc3NhTm9kZSBdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IHNjaWVudGlmaWNOb3RhdGlvbiA9IFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIHZhbHVlLCBvcHRpb25zICk7XG5cbiAgICAgIGlmICggcGFyc2VGbG9hdCggc2NpZW50aWZpY05vdGF0aW9uLm1hbnRpc3NhICkgPT09IDAgJiYgb3B0aW9ucy5zaG93WmVyb0FzSW50ZWdlciApIHtcblxuICAgICAgICAvLyBzaG93ICcwIHggMTBeRScgYXMgJzAnXG4gICAgICAgIHRoaXMubWFudGlzc2FOb2RlLnN0cmluZyA9ICcwJztcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFsgdGhpcy5tYW50aXNzYU5vZGUgXTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBzY2llbnRpZmljTm90YXRpb24uZXhwb25lbnQgPT09ICcwJyAmJiAhb3B0aW9ucy5zaG93WmVyb0V4cG9uZW50ICkge1xuXG4gICAgICAgIC8vIHNob3cgJ00geCAxMF4wJyBhcyAnTSdcbiAgICAgICAgdGhpcy5tYW50aXNzYU5vZGUuc3RyaW5nID0gc2NpZW50aWZpY05vdGF0aW9uLm1hbnRpc3NhO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gWyB0aGlzLm1hbnRpc3NhTm9kZSBdO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gc2hvdyAnTSB4IDEwXkUnXG4gICAgICAgIHRoaXMubWFudGlzc2FOb2RlLnN0cmluZyA9IHNjaWVudGlmaWNOb3RhdGlvbi5tYW50aXNzYTtcbiAgICAgICAgdGhpcy50aW1lc1Rlbk5vZGUuc3RyaW5nID0gJ3ggMTAnO1xuICAgICAgICB0aGlzLmV4cG9uZW50Tm9kZS5zdHJpbmcgPSBzY2llbnRpZmljTm90YXRpb24uZXhwb25lbnQ7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbIHRoaXMubWFudGlzc2FOb2RlLCB0aGlzLmV4cG9uZW50Tm9kZSwgdGhpcy50aW1lc1Rlbk5vZGUgXTtcblxuICAgICAgICAvLyBhZGp1c3QgbGF5b3V0XG4gICAgICAgIHRoaXMudGltZXNUZW5Ob2RlLmxlZnQgPSB0aGlzLm1hbnRpc3NhTm9kZS5yaWdodCArIHRoaXMubWFudGlzc2FYU3BhY2luZztcbiAgICAgICAgdGhpcy5leHBvbmVudE5vZGUubGVmdCA9IHRoaXMudGltZXNUZW5Ob2RlLnJpZ2h0ICsgb3B0aW9ucy5leHBvbmVudFhTcGFjaW5nO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIG51bWJlciB0byBzY2llbnRpZmljLW5vdGF0aW9uIGZvcm1hdDogTSB4IDEwXkUsIHdpdGggbWFudGlzc2EgTSBhbmQgZXhwb25lbnQgRS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgdG9TY2llbnRpZmljTm90YXRpb24oIHZhbHVlOiBudW1iZXIsIHByb3ZpZGVkT3B0aW9ucz86IFRvU2NpZW50aWZpY05vdGF0aW9uT3B0aW9ucyApOiBTY2llbnRpZmljTm90YXRpb24ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB2YWx1ZSApLCBgdmFsdWUgbXVzdCBiZSBmaW5pdGU6ICR7dmFsdWV9YCApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUb1NjaWVudGlmaWNOb3RhdGlvbk9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIFRvU2NpZW50aWZpY05vdGF0aW9uT3B0aW9ucz4oKSgge1xuICAgICAgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiAxLFxuICAgICAgZXhwb25lbnQ6IG51bGwgLy8gZXhwb25lbnQgd2lsbCBiZSBjb21wdXRlZFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgbGV0IG1hbnRpc3NhOiBzdHJpbmc7XG4gICAgbGV0IGV4cG9uZW50OiBzdHJpbmc7XG4gICAgaWYgKCBvcHRpb25zLmV4cG9uZW50ICE9PSBudWxsICkge1xuXG4gICAgICAvLyBNIHggMTBeRSwgd2hlcmUgRSBpcyBvcHRpb25zLmV4cG9uZW50XG4gICAgICBtYW50aXNzYSA9IFV0aWxzLnRvRml4ZWQoIHZhbHVlIC8gTWF0aC5wb3coIDEwLCBvcHRpb25zLmV4cG9uZW50ICksIG9wdGlvbnMubWFudGlzc2FEZWNpbWFsUGxhY2VzICk7XG4gICAgICBleHBvbmVudCA9IG9wdGlvbnMuZXhwb25lbnQudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgIC8vIENvbnZlcnQgdG8gYSBzdHJpbmcgaW4gZXhwb25lbnRpYWwgbm90YXRpb24sIHdoZXJlIHRoZSBtYW50aXNzYSBoYXMgMSBkaWdpdCB0byB0aGUgbGVmdCBvZiB0aGUgZGVjaW1hbCBwbGFjZS5cbiAgICAgIGNvbnN0IGV4cG9uZW50aWFsU3RyaW5nID0gdmFsdWUudG9FeHBvbmVudGlhbCggb3B0aW9ucy5tYW50aXNzYURlY2ltYWxQbGFjZXMgKTtcblxuICAgICAgLy8gQnJlYWsgaW50byBtYW50aXNzYSBhbmQgZXhwb25lbnQgdG9rZW5zLlxuICAgICAgY29uc3QgdG9rZW5zID0gZXhwb25lbnRpYWxTdHJpbmcudG9Mb3dlckNhc2UoKS5zcGxpdCggJ2UnICk7XG4gICAgICBtYW50aXNzYSA9IHRva2Vuc1sgMCBdO1xuICAgICAgZXhwb25lbnQgPSB0b2tlbnNbIDEgXTtcblxuICAgICAgLy8gVGhlIGV4cG9uZW50IHRva2VuIGluY2x1ZGUgYSAnKycgb3IgJy0nIHNpZ24uIFJlbW92ZSB0aGUgJysnIHNpZ24gZnJvbSBwb3NpdGl2ZSBleHBvbmVudHMuXG4gICAgICBpZiAoIGV4cG9uZW50LnN0YXJ0c1dpdGgoICcrJyApICkge1xuICAgICAgICBleHBvbmVudCA9IGV4cG9uZW50LnN1YnN0cmluZyggMSwgZXhwb25lbnQubGVuZ3RoICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbWFudGlzc2EgeCAxMF5leHBvbmVudFxuICAgIHJldHVybiB7XG4gICAgICBtYW50aXNzYTogbWFudGlzc2EsXG4gICAgICBleHBvbmVudDogZXhwb25lbnRcbiAgICB9O1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnU2NpZW50aWZpY05vdGF0aW9uTm9kZScsIFNjaWVudGlmaWNOb3RhdGlvbk5vZGUgKTsiXSwibmFtZXMiOlsiVXRpbHMiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiTm9kZSIsIlRleHQiLCJNYXRoU3ltYm9scyIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJTY2llbnRpZmljTm90YXRpb25Ob2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VTY2llbnRpZmljTm90YXRpb25Ob2RlIiwidXBkYXRlIiwidmFsdWUiLCJvcHRpb25zIiwibWFudGlzc2FOb2RlIiwic3RyaW5nIiwibnVsbFZhbHVlU3RyaW5nIiwiY2hpbGRyZW4iLCJpc0Zpbml0ZSIsInRvRml4ZWQiLCJNYXRoIiwiZmxvb3IiLCJzaG93SW50ZWdlcnNBc01hbnRpc3NhT25seSIsInNjaWVudGlmaWNOb3RhdGlvbiIsInRvU2NpZW50aWZpY05vdGF0aW9uIiwicGFyc2VGbG9hdCIsIm1hbnRpc3NhIiwic2hvd1plcm9Bc0ludGVnZXIiLCJleHBvbmVudCIsInNob3daZXJvRXhwb25lbnQiLCJ0aW1lc1Rlbk5vZGUiLCJleHBvbmVudE5vZGUiLCJsZWZ0IiwicmlnaHQiLCJtYW50aXNzYVhTcGFjaW5nIiwiZXhwb25lbnRYU3BhY2luZyIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsIm1hbnRpc3NhRGVjaW1hbFBsYWNlcyIsInBvdyIsInRvU3RyaW5nIiwiZXhwb25lbnRpYWxTdHJpbmciLCJ0b0V4cG9uZW50aWFsIiwidG9rZW5zIiwidG9Mb3dlckNhc2UiLCJzcGxpdCIsInN0YXJ0c1dpdGgiLCJzdWJzdHJpbmciLCJsZW5ndGgiLCJ2YWx1ZVByb3BlcnR5Iiwid2luZG93IiwiZmlsbCIsImZvbnQiLCJleHBvbmVudFNjYWxlIiwiZXhwb25lbnRZT2Zmc2V0IiwiY2FwSGVpZ2h0U2NhbGUiLCJOT19WQUxVRSIsInRleHRPcHRpb25zIiwidG1wVGV4dCIsIndpZHRoIiwiY2FwSGVpZ2h0IiwidG9wIiwieSIsInNjYWxlIiwiY2VudGVyWSIsIm11dGF0ZSIsInZhbHVlUHJvcGVydHlPYnNlcnZlciIsImJpbmQiLCJsaW5rIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7O0NBUUMsR0FHRCxPQUFPQSxXQUFXLHdCQUF3QjtBQUMxQyxPQUFPQyxzQkFBc0IsdURBQXVEO0FBQ3BGLE9BQU9DLGVBQXFDLGtDQUFrQztBQUU5RSxTQUFlQyxJQUFJLEVBQXVCQyxJQUFJLFFBQXFCLDhCQUE4QjtBQUNqRyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLGNBQWMsZ0JBQWdCO0FBQ3JDLE9BQU9DLGlCQUFpQixtQkFBbUI7QUE0QjVCLElBQUEsQUFBTUMseUJBQU4sTUFBTUEsK0JBQStCTDtJQTJFbENNLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0MsNkJBQTZCO1FBQ2xDLEtBQUssQ0FBQ0Q7SUFDUjtJQUVRRSxPQUFRQyxLQUFvQixFQUFTO1FBRTNDLE1BQU1DLFVBQVUsSUFBSSxDQUFDQSxPQUFPO1FBRTVCLDZHQUE2RztRQUM3RywwRkFBMEY7UUFFMUYsSUFBS0QsVUFBVSxNQUFPO1lBRXBCLFdBQVc7WUFDWCxJQUFJLENBQUNFLFlBQVksQ0FBQ0MsTUFBTSxHQUFHRixRQUFRRyxlQUFlO1lBQ2xELElBQUksQ0FBQ0MsUUFBUSxHQUFHO2dCQUFFLElBQUksQ0FBQ0gsWUFBWTthQUFFO1FBQ3ZDLE9BQ0ssSUFBSyxDQUFDSSxTQUFVTixRQUFVO1lBRTdCLDREQUE0RDtZQUM1RCw2Q0FBNkM7WUFDN0MsSUFBSSxDQUFDRSxZQUFZLENBQUNDLE1BQU0sR0FBR0gsTUFBTU8sT0FBTyxDQUFFLElBQUssd0NBQXdDO1lBQ3ZGLElBQUksQ0FBQ0YsUUFBUSxHQUFHO2dCQUFFLElBQUksQ0FBQ0gsWUFBWTthQUFFO1FBQ3ZD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