// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for ScientificNotationNode. This also serves as a test harness.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import { HBox, HSeparator, Node, Text, VBox, VSeparator } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import Panel from '../../../../sun/js/Panel.js';
import Keypad from '../../keypad/Keypad.js';
import PhetColorScheme from '../../PhetColorScheme.js';
import PhetFont from '../../PhetFont.js';
import ScientificNotationNode from '../../ScientificNotationNode.js';
const SCIENTIFIC_NOTATION_FONT = new PhetFont(30);
const TITLE_FONT = new PhetFont({
    size: 20,
    weight: 'bold'
});
const CONTROL_FONT = new PhetFont(14);
const KEYPAD_FONT = new PhetFont(20);
export default function demoScientificNotationNode(layoutBounds) {
    // Properties related to ScientificNotationNode options
    const mantissaDecimalPlacesProperty = new NumberProperty(2, {
        numberType: 'Integer',
        range: new Range(0, 10)
    });
    const showIntegersAsMantissaOnlyProperty = new BooleanProperty(false);
    const showZeroAsIntegerProperty = new BooleanProperty(true);
    const exponentProperty = new NumberProperty(1, {
        numberType: 'Integer',
        range: new Range(0, 10)
    });
    const nullExponentProperty = new BooleanProperty(false);
    const showZeroExponentProperty = new BooleanProperty(false);
    const controlPanel = new ControlPanel(mantissaDecimalPlacesProperty, showIntegersAsMantissaOnlyProperty, showZeroAsIntegerProperty, exponentProperty, nullExponentProperty, showZeroExponentProperty);
    // The value to be displayed in scientific notation
    const valueProperty = new NumberProperty(0);
    let scientificNotationNode;
    const scientificNotationNodeParent = new Node();
    // Creates a new ScientificNotationNode instance with the configuration specified in the control panel.
    const apply = ()=>{
        const keypadString = controlPanel.keypad.stringProperty.value;
        if (keypadString.length > 0) {
            valueProperty.value = parseFloat(keypadString);
        }
        if (scientificNotationNode) {
            scientificNotationNode.dispose();
        }
        scientificNotationNode = new ScientificNotationNode(valueProperty, {
            font: SCIENTIFIC_NOTATION_FONT,
            // mantissa
            mantissaDecimalPlaces: mantissaDecimalPlacesProperty.value,
            showZeroAsInteger: showZeroAsIntegerProperty.value,
            showIntegersAsMantissaOnly: showIntegersAsMantissaOnlyProperty.value,
            // exponent
            exponent: nullExponentProperty.value ? null : exponentProperty.value,
            showZeroExponent: showZeroExponentProperty.value
        });
        scientificNotationNodeParent.children = [
            scientificNotationNode
        ];
    };
    apply();
    // Pressing this button calls apply().
    const applyButton = new RectangularPushButton({
        content: new Text('Apply \u2192', {
            font: new PhetFont(22)
        }),
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        listener: ()=>apply(),
        // Disable the button if the keypad shows no value.
        enabledProperty: new DerivedProperty([
            controlPanel.keypad.stringProperty
        ], (keypadString)=>keypadString.length !== 0)
    });
    // layout
    return new HBox({
        spacing: 60,
        children: [
            controlPanel,
            applyButton,
            scientificNotationNodeParent
        ],
        left: layoutBounds.left + 40,
        centerY: layoutBounds.centerY
    });
}
/**
 * This is the control panel for this demo. It contains controls for setting options related to ScientificNotationNode,
 * and a keypad for entering the value to be displayed.
 */ let ControlPanel = class ControlPanel extends Panel {
    constructor(mantissaDecimalPlacesProperty, showIntegersAsMantissaOnlyProperty, showZeroAsIntegerProperty, exponentProperty, nullExponentProperty, showZeroExponentProperty){
        const textOptions = {
            font: CONTROL_FONT
        };
        const mantissaControl = new HBox({
            spacing: 10,
            children: [
                new NumberSpinner(mantissaDecimalPlacesProperty, new Property(mantissaDecimalPlacesProperty.range)),
                new Text('mantissaDecimalPlaces', textOptions)
            ]
        });
        const showIntegersAsMantissaOnlyCheckbox = new Checkbox(showIntegersAsMantissaOnlyProperty, new Text('showIntegersAsMantissaOnly', textOptions));
        const showZeroAsIntegerCheckbox = new Checkbox(showZeroAsIntegerProperty, new Text('showZeroAsInteger', textOptions));
        const exponentControl = new HBox({
            spacing: 10,
            children: [
                new NumberSpinner(exponentProperty, new Property(exponentProperty.range)),
                new Text('exponent', textOptions)
            ]
        });
        const nullExponentCheckbox = new Checkbox(nullExponentProperty, new Text('exponent: null', textOptions));
        nullExponentProperty.link((nullExponent)=>{
            exponentControl.enabled = !nullExponent;
        });
        const showZeroExponentCheckbox = new Checkbox(showZeroExponentProperty, new Text('showZeroExponent', textOptions));
        // controls for mantissa options
        const mantissaBox = new VBox({
            align: 'left',
            spacing: 20,
            children: [
                new Text('mantissa options', {
                    font: TITLE_FONT
                }),
                mantissaControl,
                showIntegersAsMantissaOnlyCheckbox,
                showZeroAsIntegerCheckbox
            ]
        });
        // controls for exponent options
        const exponentBox = new VBox({
            align: 'left',
            spacing: 20,
            children: [
                new Text('exponent options', {
                    font: TITLE_FONT
                }),
                exponentControl,
                nullExponentCheckbox,
                showZeroExponentCheckbox
            ]
        });
        const leftContent = new VBox({
            align: 'left',
            spacing: 20,
            children: [
                mantissaBox,
                new HSeparator(),
                exponentBox
            ]
        });
        const maxDigits = mantissaDecimalPlacesProperty.range.max + 1;
        const keypad = new Keypad(Keypad.PositiveDecimalLayout, {
            accumulatorOptions: {
                maxDigits: maxDigits,
                maxDigitsRightOfMantissa: maxDigits
            },
            buttonWidth: 35,
            buttonHeight: 35,
            buttonFont: KEYPAD_FONT
        });
        const keypadValueText = new Text('', {
            font: KEYPAD_FONT
        });
        const clearButton = new RectangularPushButton({
            content: new Text('Clear', {
                font: KEYPAD_FONT
            }),
            baseColor: 'white',
            listener: ()=>keypad.clear(),
            // Disabled if there is no value to clear
            enabledProperty: new DerivedProperty([
                keypad.stringProperty
            ], (keypadString)=>keypadString.length !== 0)
        });
        const keypadBox = new VBox({
            align: 'center',
            spacing: 20,
            children: [
                keypadValueText,
                keypad,
                clearButton
            ]
        });
        keypad.stringProperty.link((keypadString)=>{
            if (keypadString.length === 0) {
                keypadValueText.string = 'no value';
                keypadValueText.fill = 'red';
            } else {
                keypadValueText.string = keypadString;
                keypadValueText.fill = 'black';
            }
        });
        const content = new HBox({
            align: 'center',
            spacing: 20,
            children: [
                leftContent,
                new VSeparator(),
                keypadBox
            ]
        });
        super(content, {
            xMargin: 20,
            yMargin: 20
        });
        this.keypad = keypad;
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1NjaWVudGlmaWNOb3RhdGlvbk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgU2NpZW50aWZpY05vdGF0aW9uTm9kZS4gVGhpcyBhbHNvIHNlcnZlcyBhcyBhIHRlc3QgaGFybmVzcy5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCB7IEhCb3gsIEhTZXBhcmF0b3IsIE5vZGUsIFRleHQsIFZCb3gsIFZTZXBhcmF0b3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XG5pbXBvcnQgTnVtYmVyU3Bpbm5lciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvTnVtYmVyU3Bpbm5lci5qcyc7XG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcbmltcG9ydCBLZXlwYWQgZnJvbSAnLi4vLi4va2V5cGFkL0tleXBhZC5qcyc7XG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uL1BoZXRDb2xvclNjaGVtZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuaW1wb3J0IFNjaWVudGlmaWNOb3RhdGlvbk5vZGUgZnJvbSAnLi4vLi4vU2NpZW50aWZpY05vdGF0aW9uTm9kZS5qcyc7XG5cbmNvbnN0IFNDSUVOVElGSUNfTk9UQVRJT05fRk9OVCA9IG5ldyBQaGV0Rm9udCggMzAgKTtcbmNvbnN0IFRJVExFX0ZPTlQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjAsIHdlaWdodDogJ2JvbGQnIH0gKTtcbmNvbnN0IENPTlRST0xfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTQgKTtcbmNvbnN0IEtFWVBBRF9GT05UID0gbmV3IFBoZXRGb250KCAyMCApO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vU2NpZW50aWZpY05vdGF0aW9uTm9kZSggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIC8vIFByb3BlcnRpZXMgcmVsYXRlZCB0byBTY2llbnRpZmljTm90YXRpb25Ob2RlIG9wdGlvbnNcbiAgY29uc3QgbWFudGlzc2FEZWNpbWFsUGxhY2VzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDIsIHtcbiAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXG4gICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKVxuICB9ICk7XG4gIGNvbnN0IHNob3dJbnRlZ2Vyc0FzTWFudGlzc2FPbmx5UHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuICBjb25zdCBzaG93WmVyb0FzSW50ZWdlclByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xuICBjb25zdCBleHBvbmVudFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLCB7XG4gICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxuICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEwIClcbiAgfSApO1xuICBjb25zdCBudWxsRXhwb25lbnRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG4gIGNvbnN0IHNob3daZXJvRXhwb25lbnRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgY29uc3QgY29udHJvbFBhbmVsID0gbmV3IENvbnRyb2xQYW5lbCggbWFudGlzc2FEZWNpbWFsUGxhY2VzUHJvcGVydHksXG4gICAgc2hvd0ludGVnZXJzQXNNYW50aXNzYU9ubHlQcm9wZXJ0eSxcbiAgICBzaG93WmVyb0FzSW50ZWdlclByb3BlcnR5LFxuICAgIGV4cG9uZW50UHJvcGVydHksXG4gICAgbnVsbEV4cG9uZW50UHJvcGVydHksXG4gICAgc2hvd1plcm9FeHBvbmVudFByb3BlcnR5XG4gICk7XG5cbiAgLy8gVGhlIHZhbHVlIHRvIGJlIGRpc3BsYXllZCBpbiBzY2llbnRpZmljIG5vdGF0aW9uXG4gIGNvbnN0IHZhbHVlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcblxuICBsZXQgc2NpZW50aWZpY05vdGF0aW9uTm9kZTogTm9kZTtcbiAgY29uc3Qgc2NpZW50aWZpY05vdGF0aW9uTm9kZVBhcmVudCA9IG5ldyBOb2RlKCk7XG5cbiAgLy8gQ3JlYXRlcyBhIG5ldyBTY2llbnRpZmljTm90YXRpb25Ob2RlIGluc3RhbmNlIHdpdGggdGhlIGNvbmZpZ3VyYXRpb24gc3BlY2lmaWVkIGluIHRoZSBjb250cm9sIHBhbmVsLlxuICBjb25zdCBhcHBseSA9ICgpID0+IHtcblxuICAgIGNvbnN0IGtleXBhZFN0cmluZyA9IGNvbnRyb2xQYW5lbC5rZXlwYWQuc3RyaW5nUHJvcGVydHkudmFsdWU7XG4gICAgaWYgKCBrZXlwYWRTdHJpbmcubGVuZ3RoID4gMCApIHtcbiAgICAgIHZhbHVlUHJvcGVydHkudmFsdWUgPSBwYXJzZUZsb2F0KCBrZXlwYWRTdHJpbmcgKTtcbiAgICB9XG5cbiAgICBpZiAoIHNjaWVudGlmaWNOb3RhdGlvbk5vZGUgKSB7XG4gICAgICBzY2llbnRpZmljTm90YXRpb25Ob2RlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgc2NpZW50aWZpY05vdGF0aW9uTm9kZSA9IG5ldyBTY2llbnRpZmljTm90YXRpb25Ob2RlKCB2YWx1ZVByb3BlcnR5LCB7XG5cbiAgICAgIGZvbnQ6IFNDSUVOVElGSUNfTk9UQVRJT05fRk9OVCxcblxuICAgICAgLy8gbWFudGlzc2FcbiAgICAgIG1hbnRpc3NhRGVjaW1hbFBsYWNlczogbWFudGlzc2FEZWNpbWFsUGxhY2VzUHJvcGVydHkudmFsdWUsXG4gICAgICBzaG93WmVyb0FzSW50ZWdlcjogc2hvd1plcm9Bc0ludGVnZXJQcm9wZXJ0eS52YWx1ZSxcbiAgICAgIHNob3dJbnRlZ2Vyc0FzTWFudGlzc2FPbmx5OiBzaG93SW50ZWdlcnNBc01hbnRpc3NhT25seVByb3BlcnR5LnZhbHVlLFxuXG4gICAgICAvLyBleHBvbmVudFxuICAgICAgZXhwb25lbnQ6ICggbnVsbEV4cG9uZW50UHJvcGVydHkudmFsdWUgKSA/IG51bGwgOiBleHBvbmVudFByb3BlcnR5LnZhbHVlLFxuICAgICAgc2hvd1plcm9FeHBvbmVudDogc2hvd1plcm9FeHBvbmVudFByb3BlcnR5LnZhbHVlXG4gICAgfSApO1xuICAgIHNjaWVudGlmaWNOb3RhdGlvbk5vZGVQYXJlbnQuY2hpbGRyZW4gPSBbIHNjaWVudGlmaWNOb3RhdGlvbk5vZGUgXTtcbiAgfTtcbiAgYXBwbHkoKTtcblxuICAvLyBQcmVzc2luZyB0aGlzIGJ1dHRvbiBjYWxscyBhcHBseSgpLlxuICBjb25zdCBhcHBseUJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJ0FwcGx5IFxcdTIxOTInLCB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIyIClcbiAgICB9ICksXG4gICAgYmFzZUNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuQlVUVE9OX1lFTExPVyxcbiAgICBsaXN0ZW5lcjogKCkgPT4gYXBwbHkoKSxcblxuICAgIC8vIERpc2FibGUgdGhlIGJ1dHRvbiBpZiB0aGUga2V5cGFkIHNob3dzIG5vIHZhbHVlLlxuICAgIGVuYWJsZWRQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBjb250cm9sUGFuZWwua2V5cGFkLnN0cmluZ1Byb3BlcnR5IF0sXG4gICAgICAoIGtleXBhZFN0cmluZzogc3RyaW5nICkgPT4gKCBrZXlwYWRTdHJpbmcubGVuZ3RoICE9PSAwICkgKVxuICB9ICk7XG5cbiAgLy8gbGF5b3V0XG4gIHJldHVybiBuZXcgSEJveCgge1xuICAgIHNwYWNpbmc6IDYwLFxuICAgIGNoaWxkcmVuOiBbIGNvbnRyb2xQYW5lbCwgYXBwbHlCdXR0b24sIHNjaWVudGlmaWNOb3RhdGlvbk5vZGVQYXJlbnQgXSxcbiAgICBsZWZ0OiBsYXlvdXRCb3VuZHMubGVmdCArIDQwLFxuICAgIGNlbnRlclk6IGxheW91dEJvdW5kcy5jZW50ZXJZXG4gIH0gKTtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBjb250cm9sIHBhbmVsIGZvciB0aGlzIGRlbW8uIEl0IGNvbnRhaW5zIGNvbnRyb2xzIGZvciBzZXR0aW5nIG9wdGlvbnMgcmVsYXRlZCB0byBTY2llbnRpZmljTm90YXRpb25Ob2RlLFxuICogYW5kIGEga2V5cGFkIGZvciBlbnRlcmluZyB0aGUgdmFsdWUgdG8gYmUgZGlzcGxheWVkLlxuICovXG5jbGFzcyBDb250cm9sUGFuZWwgZXh0ZW5kcyBQYW5lbCB7XG5cbiAgcHVibGljIHJlYWRvbmx5IGtleXBhZDogS2V5cGFkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWFudGlzc2FEZWNpbWFsUGxhY2VzUHJvcGVydHk6IE51bWJlclByb3BlcnR5LFxuICAgICAgICAgICAgICAgICAgICAgIHNob3dJbnRlZ2Vyc0FzTWFudGlzc2FPbmx5UHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LFxuICAgICAgICAgICAgICAgICAgICAgIHNob3daZXJvQXNJbnRlZ2VyUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LFxuICAgICAgICAgICAgICAgICAgICAgIGV4cG9uZW50UHJvcGVydHk6IE51bWJlclByb3BlcnR5LFxuICAgICAgICAgICAgICAgICAgICAgIG51bGxFeHBvbmVudFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcbiAgICAgICAgICAgICAgICAgICAgICBzaG93WmVyb0V4cG9uZW50UHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+ICkge1xuXG4gICAgY29uc3QgdGV4dE9wdGlvbnMgPSB7XG4gICAgICBmb250OiBDT05UUk9MX0ZPTlRcbiAgICB9O1xuXG4gICAgY29uc3QgbWFudGlzc2FDb250cm9sID0gbmV3IEhCb3goIHtcbiAgICAgIHNwYWNpbmc6IDEwLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IE51bWJlclNwaW5uZXIoIG1hbnRpc3NhRGVjaW1hbFBsYWNlc1Byb3BlcnR5LCBuZXcgUHJvcGVydHkoIG1hbnRpc3NhRGVjaW1hbFBsYWNlc1Byb3BlcnR5LnJhbmdlICkgKSxcbiAgICAgICAgbmV3IFRleHQoICdtYW50aXNzYURlY2ltYWxQbGFjZXMnLCB0ZXh0T3B0aW9ucyApXG4gICAgICBdXG4gICAgfSApO1xuXG4gICAgY29uc3Qgc2hvd0ludGVnZXJzQXNNYW50aXNzYU9ubHlDaGVja2JveCA9IG5ldyBDaGVja2JveCggc2hvd0ludGVnZXJzQXNNYW50aXNzYU9ubHlQcm9wZXJ0eSwgbmV3IFRleHQoICdzaG93SW50ZWdlcnNBc01hbnRpc3NhT25seScsIHRleHRPcHRpb25zICkgKTtcblxuICAgIGNvbnN0IHNob3daZXJvQXNJbnRlZ2VyQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIHNob3daZXJvQXNJbnRlZ2VyUHJvcGVydHksIG5ldyBUZXh0KCAnc2hvd1plcm9Bc0ludGVnZXInLCB0ZXh0T3B0aW9ucyApICk7XG5cbiAgICBjb25zdCBleHBvbmVudENvbnRyb2wgPSBuZXcgSEJveCgge1xuICAgICAgc3BhY2luZzogMTAsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgTnVtYmVyU3Bpbm5lciggZXhwb25lbnRQcm9wZXJ0eSwgbmV3IFByb3BlcnR5KCBleHBvbmVudFByb3BlcnR5LnJhbmdlICkgKSxcbiAgICAgICAgbmV3IFRleHQoICdleHBvbmVudCcsIHRleHRPcHRpb25zIClcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBudWxsRXhwb25lbnRDaGVja2JveCA9IG5ldyBDaGVja2JveCggbnVsbEV4cG9uZW50UHJvcGVydHksIG5ldyBUZXh0KCAnZXhwb25lbnQ6IG51bGwnLCB0ZXh0T3B0aW9ucyApICk7XG4gICAgbnVsbEV4cG9uZW50UHJvcGVydHkubGluayggbnVsbEV4cG9uZW50ID0+IHtcbiAgICAgIGV4cG9uZW50Q29udHJvbC5lbmFibGVkID0gIW51bGxFeHBvbmVudDtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBzaG93WmVyb0V4cG9uZW50Q2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIHNob3daZXJvRXhwb25lbnRQcm9wZXJ0eSwgbmV3IFRleHQoICdzaG93WmVyb0V4cG9uZW50JywgdGV4dE9wdGlvbnMgKSApO1xuXG4gICAgLy8gY29udHJvbHMgZm9yIG1hbnRpc3NhIG9wdGlvbnNcbiAgICBjb25zdCBtYW50aXNzYUJveCA9IG5ldyBWQm94KCB7XG4gICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgc3BhY2luZzogMjAsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgVGV4dCggJ21hbnRpc3NhIG9wdGlvbnMnLCB7IGZvbnQ6IFRJVExFX0ZPTlQgfSApLFxuICAgICAgICBtYW50aXNzYUNvbnRyb2wsXG4gICAgICAgIHNob3dJbnRlZ2Vyc0FzTWFudGlzc2FPbmx5Q2hlY2tib3gsXG4gICAgICAgIHNob3daZXJvQXNJbnRlZ2VyQ2hlY2tib3hcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICAvLyBjb250cm9scyBmb3IgZXhwb25lbnQgb3B0aW9uc1xuICAgIGNvbnN0IGV4cG9uZW50Qm94ID0gbmV3IFZCb3goIHtcbiAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICBzcGFjaW5nOiAyMCxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIG5ldyBUZXh0KCAnZXhwb25lbnQgb3B0aW9ucycsIHsgZm9udDogVElUTEVfRk9OVCB9ICksXG4gICAgICAgIGV4cG9uZW50Q29udHJvbCxcbiAgICAgICAgbnVsbEV4cG9uZW50Q2hlY2tib3gsXG4gICAgICAgIHNob3daZXJvRXhwb25lbnRDaGVja2JveFxuICAgICAgXVxuICAgIH0gKTtcblxuICAgIGNvbnN0IGxlZnRDb250ZW50ID0gbmV3IFZCb3goIHtcbiAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICBzcGFjaW5nOiAyMCxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIG1hbnRpc3NhQm94LFxuICAgICAgICBuZXcgSFNlcGFyYXRvcigpLFxuICAgICAgICBleHBvbmVudEJveFxuICAgICAgXVxuICAgIH0gKTtcblxuICAgIGNvbnN0IG1heERpZ2l0cyA9IG1hbnRpc3NhRGVjaW1hbFBsYWNlc1Byb3BlcnR5LnJhbmdlLm1heCArIDE7XG4gICAgY29uc3Qga2V5cGFkID0gbmV3IEtleXBhZCggS2V5cGFkLlBvc2l0aXZlRGVjaW1hbExheW91dCwge1xuICAgICAgYWNjdW11bGF0b3JPcHRpb25zOiB7XG4gICAgICAgIG1heERpZ2l0czogbWF4RGlnaXRzLFxuICAgICAgICBtYXhEaWdpdHNSaWdodE9mTWFudGlzc2E6IG1heERpZ2l0c1xuICAgICAgfSxcbiAgICAgIGJ1dHRvbldpZHRoOiAzNSxcbiAgICAgIGJ1dHRvbkhlaWdodDogMzUsXG4gICAgICBidXR0b25Gb250OiBLRVlQQURfRk9OVFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGtleXBhZFZhbHVlVGV4dCA9IG5ldyBUZXh0KCAnJywge1xuICAgICAgZm9udDogS0VZUEFEX0ZPTlRcbiAgICB9ICk7XG5cbiAgICBjb25zdCBjbGVhckJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnQ2xlYXInLCB7IGZvbnQ6IEtFWVBBRF9GT05UIH0gKSxcbiAgICAgIGJhc2VDb2xvcjogJ3doaXRlJyxcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiBrZXlwYWQuY2xlYXIoKSxcblxuICAgICAgLy8gRGlzYWJsZWQgaWYgdGhlcmUgaXMgbm8gdmFsdWUgdG8gY2xlYXJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBrZXlwYWQuc3RyaW5nUHJvcGVydHkgXSxcbiAgICAgICAgKCBrZXlwYWRTdHJpbmc6IHN0cmluZyApID0+ICgga2V5cGFkU3RyaW5nLmxlbmd0aCAhPT0gMCApXG4gICAgICApXG4gICAgfSApO1xuXG4gICAgY29uc3Qga2V5cGFkQm94ID0gbmV3IFZCb3goIHtcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgIHNwYWNpbmc6IDIwLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAga2V5cGFkVmFsdWVUZXh0LFxuICAgICAgICBrZXlwYWQsXG4gICAgICAgIGNsZWFyQnV0dG9uXG4gICAgICBdXG4gICAgfSApO1xuXG4gICAga2V5cGFkLnN0cmluZ1Byb3BlcnR5LmxpbmsoICgga2V5cGFkU3RyaW5nOiBzdHJpbmcgKSA9PiB7XG4gICAgICBpZiAoIGtleXBhZFN0cmluZy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgIGtleXBhZFZhbHVlVGV4dC5zdHJpbmcgPSAnbm8gdmFsdWUnO1xuICAgICAgICBrZXlwYWRWYWx1ZVRleHQuZmlsbCA9ICdyZWQnO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGtleXBhZFZhbHVlVGV4dC5zdHJpbmcgPSBrZXlwYWRTdHJpbmc7XG4gICAgICAgIGtleXBhZFZhbHVlVGV4dC5maWxsID0gJ2JsYWNrJztcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBjb250ZW50ID0gbmV3IEhCb3goIHtcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgIHNwYWNpbmc6IDIwLFxuICAgICAgY2hpbGRyZW46IFsgbGVmdENvbnRlbnQsIG5ldyBWU2VwYXJhdG9yKCksIGtleXBhZEJveCBdXG4gICAgfSApO1xuXG4gICAgc3VwZXIoIGNvbnRlbnQsIHtcbiAgICAgIHhNYXJnaW46IDIwLFxuICAgICAgeU1hcmdpbjogMjBcbiAgICB9ICk7XG5cbiAgICB0aGlzLmtleXBhZCA9IGtleXBhZDtcbiAgfVxufSJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiUmFuZ2UiLCJIQm94IiwiSFNlcGFyYXRvciIsIk5vZGUiLCJUZXh0IiwiVkJveCIsIlZTZXBhcmF0b3IiLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJDaGVja2JveCIsIk51bWJlclNwaW5uZXIiLCJQYW5lbCIsIktleXBhZCIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiU2NpZW50aWZpY05vdGF0aW9uTm9kZSIsIlNDSUVOVElGSUNfTk9UQVRJT05fRk9OVCIsIlRJVExFX0ZPTlQiLCJzaXplIiwid2VpZ2h0IiwiQ09OVFJPTF9GT05UIiwiS0VZUEFEX0ZPTlQiLCJkZW1vU2NpZW50aWZpY05vdGF0aW9uTm9kZSIsImxheW91dEJvdW5kcyIsIm1hbnRpc3NhRGVjaW1hbFBsYWNlc1Byb3BlcnR5IiwibnVtYmVyVHlwZSIsInJhbmdlIiwic2hvd0ludGVnZXJzQXNNYW50aXNzYU9ubHlQcm9wZXJ0eSIsInNob3daZXJvQXNJbnRlZ2VyUHJvcGVydHkiLCJleHBvbmVudFByb3BlcnR5IiwibnVsbEV4cG9uZW50UHJvcGVydHkiLCJzaG93WmVyb0V4cG9uZW50UHJvcGVydHkiLCJjb250cm9sUGFuZWwiLCJDb250cm9sUGFuZWwiLCJ2YWx1ZVByb3BlcnR5Iiwic2NpZW50aWZpY05vdGF0aW9uTm9kZSIsInNjaWVudGlmaWNOb3RhdGlvbk5vZGVQYXJlbnQiLCJhcHBseSIsImtleXBhZFN0cmluZyIsImtleXBhZCIsInN0cmluZ1Byb3BlcnR5IiwidmFsdWUiLCJsZW5ndGgiLCJwYXJzZUZsb2F0IiwiZGlzcG9zZSIsImZvbnQiLCJtYW50aXNzYURlY2ltYWxQbGFjZXMiLCJzaG93WmVyb0FzSW50ZWdlciIsInNob3dJbnRlZ2Vyc0FzTWFudGlzc2FPbmx5IiwiZXhwb25lbnQiLCJzaG93WmVyb0V4cG9uZW50IiwiY2hpbGRyZW4iLCJhcHBseUJ1dHRvbiIsImNvbnRlbnQiLCJiYXNlQ29sb3IiLCJCVVRUT05fWUVMTE9XIiwibGlzdGVuZXIiLCJlbmFibGVkUHJvcGVydHkiLCJzcGFjaW5nIiwibGVmdCIsImNlbnRlclkiLCJ0ZXh0T3B0aW9ucyIsIm1hbnRpc3NhQ29udHJvbCIsInNob3dJbnRlZ2Vyc0FzTWFudGlzc2FPbmx5Q2hlY2tib3giLCJzaG93WmVyb0FzSW50ZWdlckNoZWNrYm94IiwiZXhwb25lbnRDb250cm9sIiwibnVsbEV4cG9uZW50Q2hlY2tib3giLCJsaW5rIiwibnVsbEV4cG9uZW50IiwiZW5hYmxlZCIsInNob3daZXJvRXhwb25lbnRDaGVja2JveCIsIm1hbnRpc3NhQm94IiwiYWxpZ24iLCJleHBvbmVudEJveCIsImxlZnRDb250ZW50IiwibWF4RGlnaXRzIiwibWF4IiwiUG9zaXRpdmVEZWNpbWFsTGF5b3V0IiwiYWNjdW11bGF0b3JPcHRpb25zIiwibWF4RGlnaXRzUmlnaHRPZk1hbnRpc3NhIiwiYnV0dG9uV2lkdGgiLCJidXR0b25IZWlnaHQiLCJidXR0b25Gb250Iiwia2V5cGFkVmFsdWVUZXh0IiwiY2xlYXJCdXR0b24iLCJjbGVhciIsImtleXBhZEJveCIsInN0cmluZyIsImZpbGwiLCJ4TWFyZ2luIiwieU1hcmdpbiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxxQkFBcUIseUNBQXlDO0FBQ3JFLE9BQU9DLHFCQUFxQix5Q0FBeUM7QUFDckUsT0FBT0Msb0JBQW9CLHdDQUF3QztBQUNuRSxPQUFPQyxjQUFjLGtDQUFrQztBQUV2RCxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxTQUFTQyxJQUFJLEVBQUVDLFVBQVUsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsVUFBVSxRQUFRLG9DQUFvQztBQUNuRyxPQUFPQywyQkFBMkIsc0RBQXNEO0FBQ3hGLE9BQU9DLGNBQWMsaUNBQWlDO0FBQ3RELE9BQU9DLG1CQUFtQixzQ0FBc0M7QUFDaEUsT0FBT0MsV0FBVyw4QkFBOEI7QUFDaEQsT0FBT0MsWUFBWSx5QkFBeUI7QUFDNUMsT0FBT0MscUJBQXFCLDJCQUEyQjtBQUN2RCxPQUFPQyxjQUFjLG9CQUFvQjtBQUN6QyxPQUFPQyw0QkFBNEIsa0NBQWtDO0FBRXJFLE1BQU1DLDJCQUEyQixJQUFJRixTQUFVO0FBQy9DLE1BQU1HLGFBQWEsSUFBSUgsU0FBVTtJQUFFSSxNQUFNO0lBQUlDLFFBQVE7QUFBTztBQUM1RCxNQUFNQyxlQUFlLElBQUlOLFNBQVU7QUFDbkMsTUFBTU8sY0FBYyxJQUFJUCxTQUFVO0FBRWxDLGVBQWUsU0FBU1EsMkJBQTRCQyxZQUFxQjtJQUV2RSx1REFBdUQ7SUFDdkQsTUFBTUMsZ0NBQWdDLElBQUl6QixlQUFnQixHQUFHO1FBQzNEMEIsWUFBWTtRQUNaQyxPQUFPLElBQUl6QixNQUFPLEdBQUc7SUFDdkI7SUFDQSxNQUFNMEIscUNBQXFDLElBQUk5QixnQkFBaUI7SUFDaEUsTUFBTStCLDRCQUE0QixJQUFJL0IsZ0JBQWlCO0lBQ3ZELE1B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