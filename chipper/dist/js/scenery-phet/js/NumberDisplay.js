// Copyright 2015-2024, University of Colorado Boulder
/**
 * Displays a Property of type {number} in a background rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import { ManualConstraint, Node, Rectangle, RichText, Text } from '../../scenery/js/imports.js';
import SunConstants from '../../sun/js/SunConstants.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import MathSymbols from './MathSymbols.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
// constants
const DEFAULT_FONT = new PhetFont(20);
// valid values for options.align and options.noValueAlign
const ALIGN_VALUES = [
    'center',
    'left',
    'right'
];
const DEFAULT_DECIMAL_PLACES = 0;
let NumberDisplay = class NumberDisplay extends Node {
    dispose() {
        this.disposeNumberDisplay();
        super.dispose();
    }
    /**
   * Sets the number text font.
   */ setNumberFont(font) {
        this.valueText.font = font;
    }
    set numberFont(value) {
        this.setNumberFont(value);
    }
    /**
   * Sets the number text fill.
   */ setNumberFill(fill) {
        this.valueText.fill = fill;
    }
    set numberFill(value) {
        this.setNumberFill(value);
    }
    /**
   * Sets the background fill.
   */ setBackgroundFill(fill) {
        this.backgroundNode.fill = fill;
    }
    set backgroundFill(value) {
        this.setBackgroundFill(value);
    }
    get backgroundFill() {
        return this.getBackgroundFill();
    }
    /**
   * Gets the background fill.
   */ getBackgroundFill() {
        return this.backgroundNode.fill;
    }
    /**
   * Sets the background stroke.
   */ setBackgroundStroke(stroke) {
        this.backgroundNode.stroke = stroke;
    }
    set backgroundStroke(value) {
        this.setBackgroundStroke(value);
    }
    /**
   * Get the width of the background.
   */ getBackgroundWidth() {
        return this.backgroundNode.getRectWidth();
    }
    /**
   * Set the width of the background node.
   */ setBackgroundWidth(width) {
        this.backgroundNode.setRectWidth(width);
    }
    get backgroundWidth() {
        return this.getBackgroundWidth();
    }
    set backgroundWidth(width) {
        this.setBackgroundWidth(width);
    }
    /**
   * @param numberProperty
   * @param displayRange - this range, with options.decimals or numberFormatter applied, is used to determine
   *                     - the display width. It is unrelated to the range of numberProperty.
   * @param providedOptions
   */ constructor(numberProperty, displayRange, providedOptions){
        var _phet_chipper_queryParameters, _phet_chipper, _phet, _phet_chipper_queryParameters1, _phet_chipper1, _phet1;
        const options = optionize()({
            align: 'right',
            valuePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,
            decimalPlaces: DEFAULT_DECIMAL_PLACES,
            numberFormatter: null,
            numberFormatterDependencies: [],
            useRichText: false,
            useFullHeight: false,
            textOptions: {
                font: DEFAULT_FONT,
                fill: 'black',
                maxWidth: null,
                phetioReadOnly: true
            },
            xMargin: 8,
            yMargin: 2,
            cornerRadius: 0,
            backgroundFill: 'white',
            backgroundStroke: 'lightGray',
            backgroundLineWidth: 1,
            backgroundLineDash: [],
            minBackgroundWidth: 0,
            noValueString: MathSymbols.NO_VALUE,
            noValueAlign: null,
            noValuePattern: null,
            // phet-io
            tandem: Tandem.OPT_OUT,
            phetioType: NumberDisplay.NumberDisplayIO
        }, providedOptions);
        // valuePattern|decimalPlaces is mutually exclusive with numberFormatter
        if (assert) {
            const numberFormatterProvided = !!options.numberFormatter;
            const decimalPlacesProvided = options.decimalPlaces !== DEFAULT_DECIMAL_PLACES;
            const valuePatternProvided = options.valuePattern !== SunConstants.VALUE_NAMED_PLACEHOLDER;
            const decimalOrValueProvided = decimalPlacesProvided || valuePatternProvided;
            if (numberFormatterProvided || decimalOrValueProvided) {
                assert && assert(numberFormatterProvided !== decimalOrValueProvided, 'options.numberFormatter is mutually exclusive with options.valuePattern and options.decimalPlaces');
            }
        }
        const numberFormatterProperty = new TinyProperty(options.numberFormatter ? options.numberFormatter : (value)=>{
            if (options.decimalPlaces === null) {
                return `${value}`;
            } else {
                return Utils.toFixed(value, options.decimalPlaces);
            }
        });
        assert && assert(!options.hasOwnProperty('unitsNode'), 'unitsNode is not a supported option');
        // Set default alignments and validate
        assert && assert(_.includes(ALIGN_VALUES, options.align), `invalid align: ${options.align}`);
        if (!options.noValueAlign) {
            options.noValueAlign = options.align;
        }
        assert && assert(_.includes(ALIGN_VALUES, options.noValueAlign), `invalid noValueAlign: ${options.noValueAlign}`);
        assert && assert(options.textOptions, 'did you accidentally set textOptions to null?');
        // Support numbered (old-style) placeholder by replacing it with the corresponding named placeholder.
        // See https://github.com/phetsims/scenery-phet/issues/446
        const replaceValuePatternValue = (valuePattern)=>{
            if (valuePattern.includes(SunConstants.VALUE_NUMBERED_PLACEHOLDER)) {
                return StringUtils.format(valuePattern, SunConstants.VALUE_NAMED_PLACEHOLDER);
            } else {
                return valuePattern;
            }
        };
        const valuePatternProperty = typeof options.valuePattern === 'string' ? new TinyProperty(replaceValuePatternValue(options.valuePattern)) : new DerivedProperty([
            options.valuePattern
        ], replaceValuePatternValue);
        assert && assert(!!((_phet = phet) == null ? void 0 : (_phet_chipper = _phet.chipper) == null ? void 0 : (_phet_chipper_queryParameters = _phet_chipper.queryParameters) == null ? void 0 : _phet_chipper_queryParameters.stringTest) || valuePatternProperty.value.includes(SunConstants.VALUE_NAMED_PLACEHOLDER), `missing value placeholder in options.valuePattern: ${valuePatternProperty.value}`);
        // Set default and validate
        if (!options.noValuePattern) {
            // So we don't have duplicated Properties in our DerivedProperty (it's not supported by that)
            options.noValuePattern = new DerivedProperty([
                valuePatternProperty
            ], (x)=>x);
        }
        const noValuePatternProperty = typeof options.noValuePattern === 'string' ? new TinyProperty(options.noValuePattern) : options.noValuePattern;
        assert && assert(!!((_phet1 = phet) == null ? void 0 : (_phet_chipper1 = _phet1.chipper) == null ? void 0 : (_phet_chipper_queryParameters1 = _phet_chipper1.queryParameters) == null ? void 0 : _phet_chipper_queryParameters1.stringTest) || noValuePatternProperty.value.includes(SunConstants.VALUE_NAMED_PLACEHOLDER), `missing value placeholder in options.noValuePattern: ${noValuePatternProperty.value}`);
        // determine the widest value
        const minStringProperty = DerivedProperty.deriveAny([
            numberFormatterProperty,
            ...options.numberFormatterDependencies
        ], ()=>{
            return valueToString(displayRange.min, options.noValueString, numberFormatterProperty.value);
        });
        const maxStringProperty = DerivedProperty.deriveAny([
            numberFormatterProperty,
            ...options.numberFormatterDependencies
        ], ()=>{
            return valueToString(displayRange.max, options.noValueString, numberFormatterProperty.value);
        });
        const longestStringProperty = new DerivedProperty([
            valuePatternProperty,
            minStringProperty,
            maxStringProperty
        ], (valuePattern, minString, maxString)=>{
            return StringUtils.fillIn(valuePattern, {
                value: minString.length > maxString.length ? minString : maxString
            });
        });
        // value
        const ValueTextConstructor = options.useRichText ? RichText : Text;
        const valueTextTandem = options.textOptions.tandem || options.tandem.createTandem('valueText');
        const valueStringProperty = DerivedProperty.deriveAny([
            numberProperty,
            noValuePatternProperty,
            valuePatternProperty,
            numberFormatterProperty,
            ...options.numberFormatterDependencies
        ], ()=>{
            const value = numberProperty.value;
            const noValuePattern = noValuePatternProperty.value;
            const valuePatternValue = valuePatternProperty.value;
            const numberFormatter = numberFormatterProperty.value;
            const valuePattern = value === null && noValuePattern ? noValuePattern : valuePatternValue;
            const stringValue = valueToString(value, options.noValueString, numberFormatter);
            return StringUtils.fillIn(valuePattern, {
                value: stringValue
            });
        }, {
            // These options were copied here when we moved from DerivedStringProperty to DerivedProperty.
            phetioFeatured: true,
            phetioValueType: StringIO,
            tandemNameSuffix: 'StringProperty',
            tandem: valueTextTandem.createTandem(Text.STRING_PROPERTY_TANDEM_NAME)
        });
        const valueTextOptions = combineOptions({
            tandem: valueTextTandem
        }, options.textOptions, {
            maxWidth: null // we are handling maxWidth manually, so we don't want to provide it initially.
        });
        const valueText = new ValueTextConstructor(valueStringProperty, valueTextOptions);
        const originalTextHeight = valueText.height;
        // background rectangle
        const backgroundNode = new Rectangle({
            cornerRadius: options.cornerRadius,
            fill: options.backgroundFill,
            stroke: options.backgroundStroke,
            lineWidth: options.backgroundLineWidth,
            lineDash: options.backgroundLineDash
        });
        // Manually set maxWidth later, adjusting it to the width of the longest string if it's null
        longestStringProperty.link((longestString)=>{
            const demoText = new ValueTextConstructor(longestString, _.omit(valueTextOptions, 'tandem'));
            valueText.maxWidth = options.textOptions.maxWidth !== null ? options.textOptions.maxWidth : demoText.width !== 0 ? demoText.width : null;
            demoText.maxWidth = valueText.maxWidth;
            backgroundNode.rectWidth = Math.max(options.minBackgroundWidth, demoText.width + 2 * options.xMargin);
            backgroundNode.rectHeight = (options.useFullHeight ? originalTextHeight : demoText.height) + 2 * options.yMargin;
        });
        // Avoid infinite loops like https://github.com/phetsims/axon/issues/447 by applying the maxWidth to a different Node
        // than the one that is used for layout.
        const valueTextContainer = new Node({
            children: [
                valueText
            ]
        });
        options.children = [
            backgroundNode,
            valueTextContainer
        ];
        super();
        this.numberFormatterProperty = numberFormatterProperty;
        this.valueText = valueText;
        this.backgroundNode = backgroundNode;
        this.valueStringProperty = valueStringProperty;
        // Align the value in the background.
        ManualConstraint.create(this, [
            valueTextContainer,
            backgroundNode
        ], (valueTextContainerProxy, backgroundNodeProxy)=>{
            // Alignment depends on whether we have a non-null value.
            const align = numberProperty.value === null ? options.noValueAlign : options.align;
            // vertical alignment
            const centerY = backgroundNodeProxy.centerY;
            // horizontal alignment
            if (align === 'center') {
                valueTextContainerProxy.center = new Vector2(backgroundNodeProxy.centerX, centerY);
            } else if (align === 'left') {
                valueTextContainerProxy.leftCenter = new Vector2(backgroundNodeProxy.left + options.xMargin, centerY);
            } else {
                valueTextContainerProxy.rightCenter = new Vector2(backgroundNodeProxy.right - options.xMargin, centerY);
            }
        });
        this.mutate(options);
        this.disposeNumberDisplay = ()=>{
            valueStringProperty.dispose();
            valuePatternProperty.dispose();
        };
    }
};
NumberDisplay.NumberDisplayIO = new IOType('NumberDisplayIO', {
    valueType: NumberDisplay,
    supertype: Node.NodeIO,
    documentation: 'A numeric readout with a background'
});
export { NumberDisplay as default };
sceneryPhet.register('NumberDisplay', NumberDisplay);
/**
 * Converts a numeric value to a string.
 * @param value
 * @param decimalPlaces - if null, use the full value
 * @param noValueString
 * @param numberFormatter - if provided, function that converts {number} => {string}
 */ const valueToString = (value, noValueString, numberFormatter)=>{
    let stringValue = noValueString;
    if (value !== null) {
        stringValue = numberFormatter(value);
    }
    return stringValue;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJEaXNwbGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERpc3BsYXlzIGEgUHJvcGVydHkgb2YgdHlwZSB7bnVtYmVyfSBpbiBhIGJhY2tncm91bmQgcmVjdGFuZ2xlLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IHsgRm9udCwgTWFudWFsQ29uc3RyYWludCwgTm9kZSwgTm9kZU9wdGlvbnMsIFJlY3RhbmdsZSwgUmljaFRleHQsIFJpY2hUZXh0T3B0aW9ucywgVGV4dCwgVGV4dE9wdGlvbnMsIFRQYWludCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgU3VuQ29uc3RhbnRzIGZyb20gJy4uLy4uL3N1bi9qcy9TdW5Db25zdGFudHMuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuL01hdGhTeW1ib2xzLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuL1BoZXRGb250LmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBERUZBVUxUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDIwICk7XG5cbi8vIHZhbGlkIHZhbHVlcyBmb3Igb3B0aW9ucy5hbGlnbiBhbmQgb3B0aW9ucy5ub1ZhbHVlQWxpZ25cbmNvbnN0IEFMSUdOX1ZBTFVFUyA9IFsgJ2NlbnRlcicsICdsZWZ0JywgJ3JpZ2h0JyBdIGFzIGNvbnN0O1xudHlwZSBOdW1iZXJEaXNwbGF5QWxpZ24gPSB0eXBlb2YgQUxJR05fVkFMVUVTW251bWJlcl07XG5cbmNvbnN0IERFRkFVTFRfREVDSU1BTF9QTEFDRVMgPSAwO1xuXG50eXBlIE51bWJlckZvcm1hdHRlciA9ICggbjogbnVtYmVyICkgPT4gc3RyaW5nO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIGFsaWduPzogTnVtYmVyRGlzcGxheUFsaWduO1xuXG4gIC8vIFBhdHRlcm4gdXNlZCB0byBmb3JtYXQgdGhlIHZhbHVlLlxuICAvLyBNdXN0IGNvbnRhaW4gU3VuQ29uc3RhbnRzLlZBTFVFX05BTUVEX1BMQUNFSE9MREVSIG9yIFN1bkNvbnN0YW50cy5WQUxVRV9OVU1CRVJFRF9QTEFDRUhPTERFUi5cbiAgdmFsdWVQYXR0ZXJuPzogc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcblxuICAvLyBUaGUgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIHNob3cuIElmIG51bGwsIHRoZSBmdWxsIHZhbHVlIGlzIGRpc3BsYXllZC5cbiAgLy8gV2UgYXR0ZW1wdGVkIHRvIGNoYW5nZSB0aGUgZGVmYXVsdCB0byBudWxsLCBidXQgdGhlcmUgd2VyZSB0b28gbWFueSB1c2FnZXMgdGhhdCByZWxpZWQgb24gdGhlIDAgZGVmYXVsdC5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzUxMVxuICBkZWNpbWFsUGxhY2VzPzogbnVtYmVyIHwgbnVsbDtcblxuICAvLyBUYWtlcyBhIHtudW1iZXJ9IGFuZCByZXR1cm5zIGEge3N0cmluZ30gZm9yIGZ1bGwgY29udHJvbC4gTXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggdmFsdWVQYXR0ZXJuIGFuZFxuICAvLyBkZWNpbWFsUGxhY2VzLiAgTmFtZWQgXCJudW1iZXJGb3JtYXR0ZXJcIiBpbnN0ZWFkIG9mIFwiZm9ybWF0dGVyXCIgdG8gaGVscCBjbGFyaWZ5IHRoYXQgaXQgaXMgc2VwYXJhdGUgZnJvbSB0aGVcbiAgLy8gbm9WYWx1ZVN0cmluZy9BbGlnbi9QYXR0ZXJuIGRlZmluZWQgYmVsb3cuIFBsZWFzZSBzZWUgYWxzbyBudW1iZXJGb3JtYXR0ZXJEZXBlbmRlbmNpZXNcbiAgbnVtYmVyRm9ybWF0dGVyPzogKCAoIG46IG51bWJlciApID0+IHN0cmluZyApIHwgbnVsbDtcblxuICAvLyBJZiB5b3VyIG51bWJlckZvcm1hdHRlciBkZXBlbmRzIG9uIG90aGVyIFByb3BlcnRpZXMsIHlvdSBtdXN0IHNwZWNpZnkgdGhlbSBzbyB0aGF0IHRoZSB0ZXh0IHdpbGwgdXBkYXRlIHdoZW4gdGhvc2VcbiAgLy8gZGVwZW5kZW5jaWVzIGNoYW5nZS5cbiAgbnVtYmVyRm9ybWF0dGVyRGVwZW5kZW5jaWVzPzogVFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj5bXTtcblxuICB1c2VSaWNoVGV4dD86IGJvb2xlYW47XG5cbiAgLy8gSWYgc2V0IHRvIHRydWUsIHRoZSBzbWFsbGVyIHRleHQgaGVpZ2h0IChmcm9tIGFwcGx5aW5nIHRoZSBtYXhXaWR0aCkgd2lsbCBOT1QgYmUgdXNlZCwgYW5kIGluc3RlYWRcbiAgLy8gdGhlIGhlaWdodCBvZiB0aGUgdGV4dCAoYXMgaWYgdGhlcmUgd2FzIG5vIG1heFdpZHRoKSB3aWxsIGJlIHVzZWQgZm9yIGxheW91dCBhbmQgdGhlIGJhY2tncm91bmQuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZGVuc2l0eS9pc3N1ZXMvMzQuXG4gIHVzZUZ1bGxIZWlnaHQ/OiBib29sZWFuO1xuXG4gIC8vIC8vIG9wdGlvbnMgcGFzc2VkIHRvIFRleHQgb3IgUmljaFRleHQgKGRlcGVuZGluZyBvbiB0aGUgdmFsdWUgb2Ygb3B0aW9ucy51c2VSaWNoVGV4dCkgdGhhdCBkaXNwbGF5cyB0aGUgdmFsdWVcbiAgdGV4dE9wdGlvbnM/OiBUZXh0T3B0aW9ucyB8IFJpY2hUZXh0T3B0aW9ucztcblxuICB4TWFyZ2luPzogbnVtYmVyO1xuICB5TWFyZ2luPzogbnVtYmVyO1xuICBjb3JuZXJSYWRpdXM/OiBudW1iZXI7XG4gIGJhY2tncm91bmRGaWxsPzogVFBhaW50O1xuICBiYWNrZ3JvdW5kU3Ryb2tlPzogVFBhaW50O1xuICBiYWNrZ3JvdW5kTGluZVdpZHRoPzogbnVtYmVyO1xuICBiYWNrZ3JvdW5kTGluZURhc2g/OiBudW1iZXJbXTtcbiAgbWluQmFja2dyb3VuZFdpZHRoPzogbnVtYmVyO1xuXG4gIC8vIG9wdGlvbnMgcmVsYXRlZCB0byBkaXNwbGF5IHdoZW4gbnVtYmVyUHJvcGVydHkudmFsdWUgPT09IG51bGxcbiAgbm9WYWx1ZVN0cmluZz86IHN0cmluZzsgLy8gZGVmYXVsdCBpcyB0aGUgUGhFVCBzdGFuZGFyZCwgZG8gbm90IG92ZXJyaWRlIGxpZ2h0bHkuXG4gIG5vVmFsdWVBbGlnbj86IE51bWJlckRpc3BsYXlBbGlnbiB8IG51bGw7IC8vIHNlZSBBTElHTl9WQUxVRVMuIElmIG51bGwsIGRlZmF1bHRzIHRvIG9wdGlvbnMuYWxpZ25cbiAgbm9WYWx1ZVBhdHRlcm4/OiBzdHJpbmcgfCBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHwgbnVsbDsgLy8gSWYgbnVsbCwgZGVmYXVsdHMgdG8gb3B0aW9ucy52YWx1ZVBhdHRlcm5cbn07XG5leHBvcnQgdHlwZSBOdW1iZXJEaXNwbGF5T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxOb2RlT3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51bWJlckRpc3BsYXkgZXh0ZW5kcyBOb2RlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IG51bWJlckZvcm1hdHRlclByb3BlcnR5OiBUUHJvcGVydHk8TnVtYmVyRm9ybWF0dGVyPjtcbiAgcHJpdmF0ZSByZWFkb25seSB2YWx1ZVRleHQ6IFJpY2hUZXh0IHwgVGV4dDtcbiAgcHJpdmF0ZSByZWFkb25seSBiYWNrZ3JvdW5kTm9kZTogUmVjdGFuZ2xlO1xuICBwdWJsaWMgcmVhZG9ubHkgdmFsdWVTdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlTnVtYmVyRGlzcGxheTogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGJ5IGRpc3Bvc2VcblxuICAvKipcbiAgICogQHBhcmFtIG51bWJlclByb3BlcnR5XG4gICAqIEBwYXJhbSBkaXNwbGF5UmFuZ2UgLSB0aGlzIHJhbmdlLCB3aXRoIG9wdGlvbnMuZGVjaW1hbHMgb3IgbnVtYmVyRm9ybWF0dGVyIGFwcGxpZWQsIGlzIHVzZWQgdG8gZGV0ZXJtaW5lXG4gICAqICAgICAgICAgICAgICAgICAgICAgLSB0aGUgZGlzcGxheSB3aWR0aC4gSXQgaXMgdW5yZWxhdGVkIHRvIHRoZSByYW5nZSBvZiBudW1iZXJQcm9wZXJ0eS5cbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBudW1iZXJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyIHwgbnVsbD4sIGRpc3BsYXlSYW5nZTogUmFuZ2UsIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlckRpc3BsYXlPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxOdW1iZXJEaXNwbGF5T3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XG4gICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgIHZhbHVlUGF0dGVybjogU3VuQ29uc3RhbnRzLlZBTFVFX05BTUVEX1BMQUNFSE9MREVSLFxuICAgICAgZGVjaW1hbFBsYWNlczogREVGQVVMVF9ERUNJTUFMX1BMQUNFUyxcbiAgICAgIG51bWJlckZvcm1hdHRlcjogbnVsbCxcbiAgICAgIG51bWJlckZvcm1hdHRlckRlcGVuZGVuY2llczogW10sXG4gICAgICB1c2VSaWNoVGV4dDogZmFsc2UsXG4gICAgICB1c2VGdWxsSGVpZ2h0OiBmYWxzZSxcbiAgICAgIHRleHRPcHRpb25zOiB7XG4gICAgICAgIGZvbnQ6IERFRkFVTFRfRk9OVCxcbiAgICAgICAgZmlsbDogJ2JsYWNrJyxcbiAgICAgICAgbWF4V2lkdGg6IG51bGwsIC8vIHtudW1iZXJ8bnVsbH0gaWYgbnVsbCwgdGhlbiBpdCB3aWxsIGJlIGNvbXB1dGVkIGJhc2VkIG9uIGRpc3BsYXlSYW5nZVxuICAgICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxuICAgICAgfSxcblxuICAgICAgeE1hcmdpbjogOCxcbiAgICAgIHlNYXJnaW46IDIsXG4gICAgICBjb3JuZXJSYWRpdXM6IDAsXG4gICAgICBiYWNrZ3JvdW5kRmlsbDogJ3doaXRlJyxcbiAgICAgIGJhY2tncm91bmRTdHJva2U6ICdsaWdodEdyYXknLFxuICAgICAgYmFja2dyb3VuZExpbmVXaWR0aDogMSxcbiAgICAgIGJhY2tncm91bmRMaW5lRGFzaDogW10sXG4gICAgICBtaW5CYWNrZ3JvdW5kV2lkdGg6IDAsXG5cbiAgICAgIG5vVmFsdWVTdHJpbmc6IE1hdGhTeW1ib2xzLk5PX1ZBTFVFLFxuICAgICAgbm9WYWx1ZUFsaWduOiBudWxsLFxuICAgICAgbm9WYWx1ZVBhdHRlcm46IG51bGwsXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXG4gICAgICBwaGV0aW9UeXBlOiBOdW1iZXJEaXNwbGF5Lk51bWJlckRpc3BsYXlJT1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gdmFsdWVQYXR0ZXJufGRlY2ltYWxQbGFjZXMgaXMgbXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggbnVtYmVyRm9ybWF0dGVyXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBjb25zdCBudW1iZXJGb3JtYXR0ZXJQcm92aWRlZCA9ICEhb3B0aW9ucy5udW1iZXJGb3JtYXR0ZXI7XG4gICAgICBjb25zdCBkZWNpbWFsUGxhY2VzUHJvdmlkZWQgPSBvcHRpb25zLmRlY2ltYWxQbGFjZXMgIT09IERFRkFVTFRfREVDSU1BTF9QTEFDRVM7XG4gICAgICBjb25zdCB2YWx1ZVBhdHRlcm5Qcm92aWRlZCA9IG9wdGlvbnMudmFsdWVQYXR0ZXJuICE9PSBTdW5Db25zdGFudHMuVkFMVUVfTkFNRURfUExBQ0VIT0xERVI7XG4gICAgICBjb25zdCBkZWNpbWFsT3JWYWx1ZVByb3ZpZGVkID0gZGVjaW1hbFBsYWNlc1Byb3ZpZGVkIHx8IHZhbHVlUGF0dGVyblByb3ZpZGVkO1xuICAgICAgaWYgKCBudW1iZXJGb3JtYXR0ZXJQcm92aWRlZCB8fCBkZWNpbWFsT3JWYWx1ZVByb3ZpZGVkICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJGb3JtYXR0ZXJQcm92aWRlZCAhPT0gZGVjaW1hbE9yVmFsdWVQcm92aWRlZCxcbiAgICAgICAgICAnb3B0aW9ucy5udW1iZXJGb3JtYXR0ZXIgaXMgbXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggb3B0aW9ucy52YWx1ZVBhdHRlcm4gYW5kIG9wdGlvbnMuZGVjaW1hbFBsYWNlcycgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBudW1iZXJGb3JtYXR0ZXJQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIG9wdGlvbnMubnVtYmVyRm9ybWF0dGVyID8gb3B0aW9ucy5udW1iZXJGb3JtYXR0ZXIgOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB7XG4gICAgICBpZiAoIG9wdGlvbnMuZGVjaW1hbFBsYWNlcyA9PT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGAke3ZhbHVlfWA7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLnRvRml4ZWQoIHZhbHVlLCBvcHRpb25zLmRlY2ltYWxQbGFjZXMgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3VuaXRzTm9kZScgKSwgJ3VuaXRzTm9kZSBpcyBub3QgYSBzdXBwb3J0ZWQgb3B0aW9uJyApO1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgYWxpZ25tZW50cyBhbmQgdmFsaWRhdGVcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBBTElHTl9WQUxVRVMsIG9wdGlvbnMuYWxpZ24gKSwgYGludmFsaWQgYWxpZ246ICR7b3B0aW9ucy5hbGlnbn1gICk7XG4gICAgaWYgKCAhb3B0aW9ucy5ub1ZhbHVlQWxpZ24gKSB7XG4gICAgICBvcHRpb25zLm5vVmFsdWVBbGlnbiA9IG9wdGlvbnMuYWxpZ247XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIEFMSUdOX1ZBTFVFUywgb3B0aW9ucy5ub1ZhbHVlQWxpZ24gKSwgYGludmFsaWQgbm9WYWx1ZUFsaWduOiAke29wdGlvbnMubm9WYWx1ZUFsaWdufWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnRleHRPcHRpb25zLCAnZGlkIHlvdSBhY2NpZGVudGFsbHkgc2V0IHRleHRPcHRpb25zIHRvIG51bGw/JyApO1xuXG4gICAgLy8gU3VwcG9ydCBudW1iZXJlZCAob2xkLXN0eWxlKSBwbGFjZWhvbGRlciBieSByZXBsYWNpbmcgaXQgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBuYW1lZCBwbGFjZWhvbGRlci5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNDQ2XG4gICAgY29uc3QgcmVwbGFjZVZhbHVlUGF0dGVyblZhbHVlID0gKCB2YWx1ZVBhdHRlcm46IHN0cmluZyApID0+IHtcbiAgICAgIGlmICggdmFsdWVQYXR0ZXJuLmluY2x1ZGVzKCBTdW5Db25zdGFudHMuVkFMVUVfTlVNQkVSRURfUExBQ0VIT0xERVIgKSApIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZvcm1hdCggdmFsdWVQYXR0ZXJuLCBTdW5Db25zdGFudHMuVkFMVUVfTkFNRURfUExBQ0VIT0xERVIgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWVQYXR0ZXJuO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB2YWx1ZVBhdHRlcm5Qcm9wZXJ0eSA9ICggdHlwZW9mIG9wdGlvbnMudmFsdWVQYXR0ZXJuID09PSAnc3RyaW5nJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBUaW55UHJvcGVydHkoIHJlcGxhY2VWYWx1ZVBhdHRlcm5WYWx1ZSggb3B0aW9ucy52YWx1ZVBhdHRlcm4gKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgb3B0aW9ucy52YWx1ZVBhdHRlcm4gXSwgcmVwbGFjZVZhbHVlUGF0dGVyblZhbHVlICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uc3RyaW5nVGVzdCB8fFxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlUGF0dGVyblByb3BlcnR5LnZhbHVlLmluY2x1ZGVzKCBTdW5Db25zdGFudHMuVkFMVUVfTkFNRURfUExBQ0VIT0xERVIgKSxcbiAgICAgIGBtaXNzaW5nIHZhbHVlIHBsYWNlaG9sZGVyIGluIG9wdGlvbnMudmFsdWVQYXR0ZXJuOiAke3ZhbHVlUGF0dGVyblByb3BlcnR5LnZhbHVlfWAgKTtcblxuICAgIC8vIFNldCBkZWZhdWx0IGFuZCB2YWxpZGF0ZVxuICAgIGlmICggIW9wdGlvbnMubm9WYWx1ZVBhdHRlcm4gKSB7XG4gICAgICAvLyBTbyB3ZSBkb24ndCBoYXZlIGR1cGxpY2F0ZWQgUHJvcGVydGllcyBpbiBvdXIgRGVyaXZlZFByb3BlcnR5IChpdCdzIG5vdCBzdXBwb3J0ZWQgYnkgdGhhdClcbiAgICAgIG9wdGlvbnMubm9WYWx1ZVBhdHRlcm4gPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHZhbHVlUGF0dGVyblByb3BlcnR5IF0sIHggPT4geCApO1xuICAgIH1cbiAgICBjb25zdCBub1ZhbHVlUGF0dGVyblByb3BlcnR5ID0gdHlwZW9mIG9wdGlvbnMubm9WYWx1ZVBhdHRlcm4gPT09ICdzdHJpbmcnID8gbmV3IFRpbnlQcm9wZXJ0eSggb3B0aW9ucy5ub1ZhbHVlUGF0dGVybiApIDogb3B0aW9ucy5ub1ZhbHVlUGF0dGVybjtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICEhcGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5zdHJpbmdUZXN0IHx8XG4gICAgICAgICAgICAgICAgICAgICAgbm9WYWx1ZVBhdHRlcm5Qcm9wZXJ0eS52YWx1ZS5pbmNsdWRlcyggU3VuQ29uc3RhbnRzLlZBTFVFX05BTUVEX1BMQUNFSE9MREVSICksXG4gICAgICBgbWlzc2luZyB2YWx1ZSBwbGFjZWhvbGRlciBpbiBvcHRpb25zLm5vVmFsdWVQYXR0ZXJuOiAke25vVmFsdWVQYXR0ZXJuUHJvcGVydHkudmFsdWV9YCApO1xuXG4gICAgLy8gZGV0ZXJtaW5lIHRoZSB3aWRlc3QgdmFsdWVcbiAgICBjb25zdCBtaW5TdHJpbmdQcm9wZXJ0eSA9IERlcml2ZWRQcm9wZXJ0eS5kZXJpdmVBbnkoIFsgbnVtYmVyRm9ybWF0dGVyUHJvcGVydHksIC4uLm9wdGlvbnMubnVtYmVyRm9ybWF0dGVyRGVwZW5kZW5jaWVzIF0sICgpID0+IHtcbiAgICAgIHJldHVybiB2YWx1ZVRvU3RyaW5nKCBkaXNwbGF5UmFuZ2UubWluLCBvcHRpb25zLm5vVmFsdWVTdHJpbmcsIG51bWJlckZvcm1hdHRlclByb3BlcnR5LnZhbHVlICk7XG4gICAgfSApO1xuICAgIGNvbnN0IG1heFN0cmluZ1Byb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5LmRlcml2ZUFueSggWyBudW1iZXJGb3JtYXR0ZXJQcm9wZXJ0eSwgLi4ub3B0aW9ucy5udW1iZXJGb3JtYXR0ZXJEZXBlbmRlbmNpZXMgXSwgKCkgPT4ge1xuICAgICAgcmV0dXJuIHZhbHVlVG9TdHJpbmcoIGRpc3BsYXlSYW5nZS5tYXgsIG9wdGlvbnMubm9WYWx1ZVN0cmluZywgbnVtYmVyRm9ybWF0dGVyUHJvcGVydHkudmFsdWUgKTtcbiAgICB9ICk7XG4gICAgY29uc3QgbG9uZ2VzdFN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xuICAgICAgdmFsdWVQYXR0ZXJuUHJvcGVydHksXG4gICAgICBtaW5TdHJpbmdQcm9wZXJ0eSxcbiAgICAgIG1heFN0cmluZ1Byb3BlcnR5XG4gICAgXSwgKCB2YWx1ZVBhdHRlcm4sIG1pblN0cmluZywgbWF4U3RyaW5nICkgPT4ge1xuICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggdmFsdWVQYXR0ZXJuLCB7XG4gICAgICAgIHZhbHVlOiAoICggbWluU3RyaW5nLmxlbmd0aCA+IG1heFN0cmluZy5sZW5ndGggKSA/IG1pblN0cmluZyA6IG1heFN0cmluZyApXG4gICAgICB9ICk7XG4gICAgfSApO1xuXG4gICAgLy8gdmFsdWVcbiAgICBjb25zdCBWYWx1ZVRleHRDb25zdHJ1Y3RvciA9IG9wdGlvbnMudXNlUmljaFRleHQgPyBSaWNoVGV4dCA6IFRleHQ7XG4gICAgY29uc3QgdmFsdWVUZXh0VGFuZGVtID0gb3B0aW9ucy50ZXh0T3B0aW9ucy50YW5kZW0gfHwgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmFsdWVUZXh0JyApO1xuICAgIGNvbnN0IHZhbHVlU3RyaW5nUHJvcGVydHkgPSBEZXJpdmVkUHJvcGVydHkuZGVyaXZlQW55KFxuICAgICAgWyBudW1iZXJQcm9wZXJ0eSwgbm9WYWx1ZVBhdHRlcm5Qcm9wZXJ0eSwgdmFsdWVQYXR0ZXJuUHJvcGVydHksIG51bWJlckZvcm1hdHRlclByb3BlcnR5LCAuLi5vcHRpb25zLm51bWJlckZvcm1hdHRlckRlcGVuZGVuY2llcyBdLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IG51bWJlclByb3BlcnR5LnZhbHVlO1xuICAgICAgICBjb25zdCBub1ZhbHVlUGF0dGVybiA9IG5vVmFsdWVQYXR0ZXJuUHJvcGVydHkudmFsdWU7XG4gICAgICAgIGNvbnN0IHZhbHVlUGF0dGVyblZhbHVlID0gdmFsdWVQYXR0ZXJuUHJvcGVydHkudmFsdWU7XG4gICAgICAgIGNvbnN0IG51bWJlckZvcm1hdHRlciA9IG51bWJlckZvcm1hdHRlclByb3BlcnR5LnZhbHVlO1xuXG4gICAgICAgIGNvbnN0IHZhbHVlUGF0dGVybiA9ICggdmFsdWUgPT09IG51bGwgJiYgbm9WYWx1ZVBhdHRlcm4gKSA/IG5vVmFsdWVQYXR0ZXJuIDogdmFsdWVQYXR0ZXJuVmFsdWU7XG5cbiAgICAgICAgY29uc3Qgc3RyaW5nVmFsdWUgPSB2YWx1ZVRvU3RyaW5nKCB2YWx1ZSwgb3B0aW9ucy5ub1ZhbHVlU3RyaW5nLCBudW1iZXJGb3JtYXR0ZXIgKTtcbiAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggdmFsdWVQYXR0ZXJuLCB7XG4gICAgICAgICAgdmFsdWU6IHN0cmluZ1ZhbHVlXG4gICAgICAgIH0gKTtcbiAgICAgIH0sIHtcblxuICAgICAgICAvLyBUaGVzZSBvcHRpb25zIHdlcmUgY29waWVkIGhlcmUgd2hlbiB3ZSBtb3ZlZCBmcm9tIERlcml2ZWRTdHJpbmdQcm9wZXJ0eSB0byBEZXJpdmVkUHJvcGVydHkuXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IFN0cmluZ0lPLFxuICAgICAgICB0YW5kZW1OYW1lU3VmZml4OiAnU3RyaW5nUHJvcGVydHknLFxuXG4gICAgICAgIHRhbmRlbTogdmFsdWVUZXh0VGFuZGVtLmNyZWF0ZVRhbmRlbSggVGV4dC5TVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUgKVxuICAgICAgfSApO1xuXG4gICAgY29uc3QgdmFsdWVUZXh0T3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zIHwgUmljaFRleHRPcHRpb25zPigge1xuICAgICAgdGFuZGVtOiB2YWx1ZVRleHRUYW5kZW1cbiAgICB9LCBvcHRpb25zLnRleHRPcHRpb25zLCB7XG4gICAgICBtYXhXaWR0aDogbnVsbCAvLyB3ZSBhcmUgaGFuZGxpbmcgbWF4V2lkdGggbWFudWFsbHksIHNvIHdlIGRvbid0IHdhbnQgdG8gcHJvdmlkZSBpdCBpbml0aWFsbHkuXG4gICAgfSApO1xuXG4gICAgY29uc3QgdmFsdWVUZXh0OiBUZXh0IHwgUmljaFRleHQgPSBuZXcgVmFsdWVUZXh0Q29uc3RydWN0b3IoIHZhbHVlU3RyaW5nUHJvcGVydHksIHZhbHVlVGV4dE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IG9yaWdpbmFsVGV4dEhlaWdodCA9IHZhbHVlVGV4dC5oZWlnaHQ7XG5cbiAgICAvLyBiYWNrZ3JvdW5kIHJlY3RhbmdsZVxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSgge1xuICAgICAgY29ybmVyUmFkaXVzOiBvcHRpb25zLmNvcm5lclJhZGl1cyxcbiAgICAgIGZpbGw6IG9wdGlvbnMuYmFja2dyb3VuZEZpbGwsXG4gICAgICBzdHJva2U6IG9wdGlvbnMuYmFja2dyb3VuZFN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5iYWNrZ3JvdW5kTGluZVdpZHRoLFxuICAgICAgbGluZURhc2g6IG9wdGlvbnMuYmFja2dyb3VuZExpbmVEYXNoXG4gICAgfSApO1xuXG4gICAgLy8gTWFudWFsbHkgc2V0IG1heFdpZHRoIGxhdGVyLCBhZGp1c3RpbmcgaXQgdG8gdGhlIHdpZHRoIG9mIHRoZSBsb25nZXN0IHN0cmluZyBpZiBpdCdzIG51bGxcbiAgICBsb25nZXN0U3RyaW5nUHJvcGVydHkubGluayggbG9uZ2VzdFN0cmluZyA9PiB7XG4gICAgICBjb25zdCBkZW1vVGV4dCA9IG5ldyBWYWx1ZVRleHRDb25zdHJ1Y3RvciggbG9uZ2VzdFN0cmluZywgXy5vbWl0KCB2YWx1ZVRleHRPcHRpb25zLCAndGFuZGVtJyApICk7XG5cbiAgICAgIHZhbHVlVGV4dC5tYXhXaWR0aCA9ICggb3B0aW9ucy50ZXh0T3B0aW9ucy5tYXhXaWR0aCAhPT0gbnVsbCApID8gb3B0aW9ucy50ZXh0T3B0aW9ucy5tYXhXaWR0aCEgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBkZW1vVGV4dC53aWR0aCAhPT0gMCApID8gZGVtb1RleHQud2lkdGggOiBudWxsO1xuICAgICAgZGVtb1RleHQubWF4V2lkdGggPSB2YWx1ZVRleHQubWF4V2lkdGg7XG5cbiAgICAgIGJhY2tncm91bmROb2RlLnJlY3RXaWR0aCA9IE1hdGgubWF4KCBvcHRpb25zLm1pbkJhY2tncm91bmRXaWR0aCwgZGVtb1RleHQud2lkdGggKyAyICogb3B0aW9ucy54TWFyZ2luICk7XG4gICAgICBiYWNrZ3JvdW5kTm9kZS5yZWN0SGVpZ2h0ID0gKCBvcHRpb25zLnVzZUZ1bGxIZWlnaHQgPyBvcmlnaW5hbFRleHRIZWlnaHQgOiBkZW1vVGV4dC5oZWlnaHQgKSArIDIgKiBvcHRpb25zLnlNYXJnaW47XG4gICAgfSApO1xuXG4gICAgLy8gQXZvaWQgaW5maW5pdGUgbG9vcHMgbGlrZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvNDQ3IGJ5IGFwcGx5aW5nIHRoZSBtYXhXaWR0aCB0byBhIGRpZmZlcmVudCBOb2RlXG4gICAgLy8gdGhhbiB0aGUgb25lIHRoYXQgaXMgdXNlZCBmb3IgbGF5b3V0LlxuICAgIGNvbnN0IHZhbHVlVGV4dENvbnRhaW5lciA9IG5ldyBOb2RlKCB7XG4gICAgICBjaGlsZHJlbjogWyB2YWx1ZVRleHQgXVxuICAgIH0gKTtcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBiYWNrZ3JvdW5kTm9kZSwgdmFsdWVUZXh0Q29udGFpbmVyIF07XG5cbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5udW1iZXJGb3JtYXR0ZXJQcm9wZXJ0eSA9IG51bWJlckZvcm1hdHRlclByb3BlcnR5O1xuICAgIHRoaXMudmFsdWVUZXh0ID0gdmFsdWVUZXh0O1xuICAgIHRoaXMuYmFja2dyb3VuZE5vZGUgPSBiYWNrZ3JvdW5kTm9kZTtcbiAgICB0aGlzLnZhbHVlU3RyaW5nUHJvcGVydHkgPSB2YWx1ZVN0cmluZ1Byb3BlcnR5O1xuXG4vLyBBbGlnbiB0aGUgdmFsdWUgaW4gdGhlIGJhY2tncm91bmQuXG4gICAgTWFudWFsQ29uc3RyYWludC5jcmVhdGUoIHRoaXMsIFsgdmFsdWVUZXh0Q29udGFpbmVyLCBiYWNrZ3JvdW5kTm9kZSBdLCAoIHZhbHVlVGV4dENvbnRhaW5lclByb3h5LCBiYWNrZ3JvdW5kTm9kZVByb3h5ICkgPT4ge1xuXG4gICAgICAvLyBBbGlnbm1lbnQgZGVwZW5kcyBvbiB3aGV0aGVyIHdlIGhhdmUgYSBub24tbnVsbCB2YWx1ZS5cbiAgICAgIGNvbnN0IGFsaWduID0gKCBudW1iZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApID8gb3B0aW9ucy5ub1ZhbHVlQWxpZ24gOiBvcHRpb25zLmFsaWduO1xuXG4gICAgICAvLyB2ZXJ0aWNhbCBhbGlnbm1lbnRcbiAgICAgIGNvbnN0IGNlbnRlclkgPSBiYWNrZ3JvdW5kTm9kZVByb3h5LmNlbnRlclk7XG5cbiAgICAgIC8vIGhvcml6b250YWwgYWxpZ25tZW50XG4gICAgICBpZiAoIGFsaWduID09PSAnY2VudGVyJyApIHtcbiAgICAgICAgdmFsdWVUZXh0Q29udGFpbmVyUHJveHkuY2VudGVyID0gbmV3IFZlY3RvcjIoIGJhY2tncm91bmROb2RlUHJveHkuY2VudGVyWCwgY2VudGVyWSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGFsaWduID09PSAnbGVmdCcgKSB7XG4gICAgICAgIHZhbHVlVGV4dENvbnRhaW5lclByb3h5LmxlZnRDZW50ZXIgPSBuZXcgVmVjdG9yMiggYmFja2dyb3VuZE5vZGVQcm94eS5sZWZ0ICsgb3B0aW9ucy54TWFyZ2luLCBjZW50ZXJZICk7XG4gICAgICB9XG4gICAgICBlbHNlIHsgLy8gcmlnaHRcbiAgICAgICAgdmFsdWVUZXh0Q29udGFpbmVyUHJveHkucmlnaHRDZW50ZXIgPSBuZXcgVmVjdG9yMiggYmFja2dyb3VuZE5vZGVQcm94eS5yaWdodCAtIG9wdGlvbnMueE1hcmdpbiwgY2VudGVyWSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VOdW1iZXJEaXNwbGF5ID0gKCkgPT4ge1xuICAgICAgdmFsdWVTdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICB2YWx1ZVBhdHRlcm5Qcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZU51bWJlckRpc3BsYXkoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbnVtYmVyIHRleHQgZm9udC5cbiAgICovXG4gIHB1YmxpYyBzZXROdW1iZXJGb250KCBmb250OiBGb250ICk6IHZvaWQge1xuICAgIHRoaXMudmFsdWVUZXh0LmZvbnQgPSBmb250O1xuICB9XG5cbiAgcHVibGljIHNldCBudW1iZXJGb250KCB2YWx1ZTogRm9udCApIHsgdGhpcy5zZXROdW1iZXJGb250KCB2YWx1ZSApOyB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG51bWJlciB0ZXh0IGZpbGwuXG4gICAqL1xuICBwdWJsaWMgc2V0TnVtYmVyRmlsbCggZmlsbDogVFBhaW50ICk6IHZvaWQge1xuICAgIHRoaXMudmFsdWVUZXh0LmZpbGwgPSBmaWxsO1xuICB9XG5cbiAgcHVibGljIHNldCBudW1iZXJGaWxsKCB2YWx1ZTogVFBhaW50ICkgeyB0aGlzLnNldE51bWJlckZpbGwoIHZhbHVlICk7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYmFja2dyb3VuZCBmaWxsLlxuICAgKi9cbiAgcHVibGljIHNldEJhY2tncm91bmRGaWxsKCBmaWxsOiBUUGFpbnQgKTogdm9pZCB7XG4gICAgdGhpcy5iYWNrZ3JvdW5kTm9kZS5maWxsID0gZmlsbDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYmFja2dyb3VuZEZpbGwoIHZhbHVlOiBUUGFpbnQgKSB7IHRoaXMuc2V0QmFja2dyb3VuZEZpbGwoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGJhY2tncm91bmRGaWxsKCk6IFRQYWludCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QmFja2dyb3VuZEZpbGwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBiYWNrZ3JvdW5kIGZpbGwuXG4gICAqL1xuICBwdWJsaWMgZ2V0QmFja2dyb3VuZEZpbGwoKTogVFBhaW50IHtcbiAgICByZXR1cm4gdGhpcy5iYWNrZ3JvdW5kTm9kZS5maWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGJhY2tncm91bmQgc3Ryb2tlLlxuICAgKi9cbiAgcHVibGljIHNldEJhY2tncm91bmRTdHJva2UoIHN0cm9rZTogVFBhaW50ICk6IHZvaWQge1xuICAgIHRoaXMuYmFja2dyb3VuZE5vZGUuc3Ryb2tlID0gc3Ryb2tlO1xuICB9XG5cbiAgcHVibGljIHNldCBiYWNrZ3JvdW5kU3Ryb2tlKCB2YWx1ZTogVFBhaW50ICkgeyB0aGlzLnNldEJhY2tncm91bmRTdHJva2UoIHZhbHVlICk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSB3aWR0aCBvZiB0aGUgYmFja2dyb3VuZC5cbiAgICovXG4gIHB1YmxpYyBnZXRCYWNrZ3JvdW5kV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrZ3JvdW5kTm9kZS5nZXRSZWN0V2lkdGgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHdpZHRoIG9mIHRoZSBiYWNrZ3JvdW5kIG5vZGUuXG4gICAqL1xuICBwdWJsaWMgc2V0QmFja2dyb3VuZFdpZHRoKCB3aWR0aDogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuYmFja2dyb3VuZE5vZGUuc2V0UmVjdFdpZHRoKCB3aWR0aCApO1xuICB9XG5cbiAgcHVibGljIGdldCBiYWNrZ3JvdW5kV2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0QmFja2dyb3VuZFdpZHRoKCk7IH1cblxuICBwdWJsaWMgc2V0IGJhY2tncm91bmRXaWR0aCggd2lkdGg6IG51bWJlciApIHsgdGhpcy5zZXRCYWNrZ3JvdW5kV2lkdGgoIHdpZHRoICk7IH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE51bWJlckRpc3BsYXlJTyA9IG5ldyBJT1R5cGUoICdOdW1iZXJEaXNwbGF5SU8nLCB7XG4gICAgdmFsdWVUeXBlOiBOdW1iZXJEaXNwbGF5LFxuICAgIHN1cGVydHlwZTogTm9kZS5Ob2RlSU8sXG4gICAgZG9jdW1lbnRhdGlvbjogJ0EgbnVtZXJpYyByZWFkb3V0IHdpdGggYSBiYWNrZ3JvdW5kJ1xuICB9ICk7XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTnVtYmVyRGlzcGxheScsIE51bWJlckRpc3BsYXkgKTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIG51bWVyaWMgdmFsdWUgdG8gYSBzdHJpbmcuXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSBkZWNpbWFsUGxhY2VzIC0gaWYgbnVsbCwgdXNlIHRoZSBmdWxsIHZhbHVlXG4gKiBAcGFyYW0gbm9WYWx1ZVN0cmluZ1xuICogQHBhcmFtIG51bWJlckZvcm1hdHRlciAtIGlmIHByb3ZpZGVkLCBmdW5jdGlvbiB0aGF0IGNvbnZlcnRzIHtudW1iZXJ9ID0+IHtzdHJpbmd9XG4gKi9cbmNvbnN0IHZhbHVlVG9TdHJpbmcgPSA8UyBleHRlbmRzIG51bWJlciB8IG51bGw+KCB2YWx1ZTogUywgbm9WYWx1ZVN0cmluZzogc3RyaW5nLCBudW1iZXJGb3JtYXR0ZXI6IE51bWJlckZvcm1hdHRlciApOiAoIFMgZXh0ZW5kcyBudWxsID8gKCBzdHJpbmcgfCBudWxsICkgOiBzdHJpbmcgKSA9PiB7XG4gIGxldCBzdHJpbmdWYWx1ZSA9IG5vVmFsdWVTdHJpbmc7XG4gIGlmICggdmFsdWUgIT09IG51bGwgKSB7XG4gICAgc3RyaW5nVmFsdWUgPSBudW1iZXJGb3JtYXR0ZXIoIHZhbHVlICk7XG4gIH1cbiAgcmV0dXJuIHN0cmluZ1ZhbHVlO1xufTsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5IiwiVGlueVByb3BlcnR5IiwiVXRpbHMiLCJWZWN0b3IyIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJTdHJpbmdVdGlscyIsIk1hbnVhbENvbnN0cmFpbnQiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiUmljaFRleHQiLCJUZXh0IiwiU3VuQ29uc3RhbnRzIiwiVGFuZGVtIiwiSU9UeXBlIiwiU3RyaW5nSU8iLCJNYXRoU3ltYm9scyIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJERUZBVUxUX0ZPTlQiLCJBTElHTl9WQUxVRVMiLCJERUZBVUxUX0RFQ0lNQUxfUExBQ0VTIiwiTnVtYmVyRGlzcGxheSIsImRpc3Bvc2UiLCJkaXNwb3NlTnVtYmVyRGlzcGxheSIsInNldE51bWJlckZvbnQiLCJmb250IiwidmFsdWVUZXh0IiwibnVtYmVyRm9udCIsInZhbHVlIiwic2V0TnVtYmVyRmlsbCIsImZpbGwiLCJudW1iZXJGaWxsIiwic2V0QmFja2dyb3VuZEZpbGwiLCJiYWNrZ3JvdW5kTm9kZSIsImJhY2tncm91bmRGaWxsIiwiZ2V0QmFja2dyb3VuZEZpbGwiLCJzZXRCYWNrZ3JvdW5kU3Ryb2tlIiwic3Ryb2tlIiwiYmFja2dyb3VuZFN0cm9rZSIsImdldEJhY2tncm91bmRXaWR0aCIsImdldFJlY3RXaWR0aCIsInNldEJhY2tncm91bmRXaWR0aCIsIndpZHRoIiwic2V0UmVjdFdpZHRoIiwiYmFja2dyb3VuZFdpZHRoIiwibnVtYmVyUHJvcGVydHkiLCJkaXNwbGF5UmFuZ2UiLCJwcm92aWRlZE9wdGlvbnMiLCJwaGV0Iiwib3B0aW9ucyIsImFsaWduIiwidmFsdWVQYXR0ZXJuIiwiVkFMVUVfTkFNRURfUExBQ0VIT0xERVIiLCJkZWNpbWFsUGxhY2VzIiwibnVtYmVyRm9ybWF0dGVyIiwibnVtYmVyRm9ybWF0dGVyRGVwZW5kZW5jaWVzIiwidXNlUmljaFRleHQiLCJ1c2VGdWxsSGVpZ2h0IiwidGV4dE9wdGlvbnMiLCJtYXhXaWR0aCIsInBoZXRpb1JlYWRPbmx5IiwieE1hcmdpbiIsInlNYXJnaW4iLCJjb3JuZXJSYWRpdXMiLCJiYWNrZ3JvdW5kTGluZVdpZHRoIiwiYmFja2dyb3VuZExpbmVEYXNoIiwibWluQmFja2dyb3VuZFdpZHRoIiwibm9WYWx1ZVN0cmluZyIsIk5PX1ZBTFVFIiwibm9WYWx1ZUFsaWduIiwibm9WYWx1ZVBhdHRlcm4iLCJ0YW5kZW0iLCJPUFRfT1VUIiwicGhldGlvVHlwZSIsIk51bWJlckRpc3BsYXlJTyIsImFzc2VydCIsIm51bWJlckZvcm1hdHRlclByb3ZpZGVkIiwiZGVjaW1hbFBsYWNlc1Byb3ZpZGVkIiwidmFsdWVQYXR0ZXJuUHJvdmlkZWQiLCJkZWNpbWFsT3JWYWx1ZVByb3ZpZGVkIiwibnVtYmVyRm9ybWF0dGVyUHJvcGVydHkiLCJ0b0ZpeGVkIiwiaGFzT3duUHJvcGVydHkiLCJfIiwiaW5jbHVkZXMiLCJyZXBsYWNlVmFsdWVQYXR0ZXJuVmFsdWUiLCJWQUxVRV9OVU1CRVJFRF9QTEFDRUhPTERFUiIsImZvcm1hdCIsInZhbHVlUGF0dGVyblByb3BlcnR5IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsInN0cmluZ1Rlc3QiLCJ4Iiwibm9WYWx1ZVBhdHRlcm5Qcm9wZXJ0eSIsIm1pblN0cmluZ1Byb3BlcnR5IiwiZGVyaXZlQW55IiwidmFsdWVUb1N0cmluZyIsIm1pbiIsIm1heFN0cmluZ1Byb3BlcnR5IiwibWF4IiwibG9uZ2VzdFN0cmluZ1Byb3BlcnR5IiwibWluU3RyaW5nIiwibWF4U3RyaW5nIiwiZmlsbEluIiwibGVuZ3RoIiwiVmFsdWVUZXh0Q29uc3RydWN0b3IiLCJ2YWx1ZVRleHRUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJ2YWx1ZVN0cmluZ1Byb3BlcnR5IiwidmFsdWVQYXR0ZXJuVmFsdWUiLCJzdHJpbmdWYWx1ZSIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvVmFsdWVUeXBlIiwidGFuZGVtTmFtZVN1ZmZpeCIsIlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSIsInZhbHVlVGV4dE9wdGlvbnMiLCJvcmlnaW5hbFRleHRIZWlnaHQiLCJoZWlnaHQiLCJsaW5lV2lkdGgiLCJsaW5lRGFzaCIsImxpbmsiLCJsb25nZXN0U3RyaW5nIiwiZGVtb1RleHQiLCJvbWl0IiwicmVjdFdpZHRoIiwiTWF0aCIsInJlY3RIZWlnaHQiLCJ2YWx1ZVRleHRDb250YWluZXIiLCJjaGlsZHJlbiIsImNyZWF0ZSIsInZhbHVlVGV4dENvbnRhaW5lclByb3h5IiwiYmFja2dyb3VuZE5vZGVQcm94eSIsImNlbnRlclkiLCJjZW50ZXIiLCJjZW50ZXJYIiwibGVmdENlbnRlciIsImxlZnQiLCJyaWdodENlbnRlciIsInJpZ2h0IiwibXV0YXRlIiwidmFsdWVUeXBlIiwic3VwZXJ0eXBlIiwiTm9kZUlPIiwiZG9jdW1lbnRhdGlvbiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0Msa0JBQWtCLGdDQUFnQztBQUl6RCxPQUFPQyxXQUFXLHdCQUF3QjtBQUMxQyxPQUFPQyxhQUFhLDBCQUEwQjtBQUM5QyxPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRTVFLE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsU0FBZUMsZ0JBQWdCLEVBQUVDLElBQUksRUFBZUMsU0FBUyxFQUFFQyxRQUFRLEVBQW1CQyxJQUFJLFFBQTZCLDhCQUE4QjtBQUN6SixPQUFPQyxrQkFBa0IsK0JBQStCO0FBQ3hELE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELE9BQU9DLGlCQUFpQixtQkFBbUI7QUFDM0MsT0FBT0MsY0FBYyxnQkFBZ0I7QUFDckMsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUUzQyxZQUFZO0FBQ1osTUFBTUMsZUFBZSxJQUFJRixTQUFVO0FBRW5DLDBEQUEwRDtBQUMxRCxNQUFNRyxlQUFlO0lBQUU7SUFBVTtJQUFRO0NBQVM7QUFHbEQsTUFBTUMseUJBQXlCO0FBb0RoQixJQUFBLEFBQU1DLGdCQUFOLE1BQU1BLHNCQUFzQmQ7SUFvT3pCZSxVQUFnQjtRQUM5QixJQUFJLENBQUNDLG9CQUFvQjtRQUN6QixLQUFLLENBQUNEO0lBQ1I7SUFFQTs7R0FFQyxHQUNELEFBQU9FLGNBQWVDLElBQVUsRUFBUztRQUN2QyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0QsSUFBSSxHQUFHQTtJQUN4QjtJQUVBLElBQVdFLFdBQVlDLEtBQVcsRUFBRztRQUFFLElBQUksQ0FBQ0osYUFBYSxDQUFFSTtJQUFTO0lBRXBFOztHQUVDLEdBQ0Qs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