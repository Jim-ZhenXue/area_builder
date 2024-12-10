// Copyright 2015-2024, University of Colorado Boulder
/**
 * A scenery node that looks like a number key pad and allows the user to enter a number. The entered number is not
 * displayed by this node - it is intended to be used in conjunction with a separate display of some sort.
 *
 * @author John Blanco
 * @author Andrey Zelenkov (MLearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../axon/js/Property.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import { HBox, Node, Text, VBox } from '../../scenery/js/imports.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import BackspaceIcon from './BackspaceIcon.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
// string
const DECIMAL_POINT = '.'; //TODO localize, https://github.com/phetsims/scenery-phet/issues/333
/**
 * @deprecated - This keypad has been replaced by a more flexible and general version.
 * While there are no plans to go back and replace existing usages, new implementations should use Keypad.js.
 * See https://github.com/phetsims/scenery-phet/issues/283 for the history of this. -jbphet, Aug 2017
 */ let NumberKeypad = class NumberKeypad extends Node {
    get clearOnNextKeyPress() {
        return this.getClearOnNextKeyPress();
    }
    set clearOnNextKeyPress(value) {
        this.setClearOnNextKeyPress(value);
    }
    /**
   * Creates a validation function that constrains the value to a maximum number of digits, with 1 leading zero.
   * @param {Object} [options]
   * @returns {function(string, string)}
   * @public
   */ static validateMaxDigits(options) {
        options = merge({
            maxDigits: 8 // {number} the maximum number of digits (numbers)
        }, options);
        assert && assert(options.maxDigits > 0, `invalid maxDigits: ${options.maxDigits}`);
        /**
     * Creates the new string that results from pressing a key.
     * @param {string} keyString - string associated with the key that was pressed
     * @param {string} valueString - string that corresponds to the sequence of keys that have been pressed
     * @returns {string} the result
     */ return function(keyString, valueString) {
            const hasDecimalPoint = valueString.indexOf(DECIMAL_POINT) !== -1;
            const numberOfDigits = hasDecimalPoint ? valueString.length - 1 : valueString.length;
            let newValueString;
            if (valueString === '0' && keyString === '0') {
                // ignore multiple leading zeros
                newValueString = valueString;
            } else if (valueString === '0' && keyString !== '0' && keyString !== DECIMAL_POINT) {
                // replace a leading 0 that's not followed by a decimal point with this key
                newValueString = keyString;
            } else if (keyString !== DECIMAL_POINT && numberOfDigits < options.maxDigits) {
                // constrain to maxDigits
                newValueString = valueString + keyString;
            } else if (keyString === DECIMAL_POINT && valueString.indexOf(DECIMAL_POINT) === -1) {
                // allow one decimal point
                newValueString = valueString + keyString;
            } else {
                // ignore keyString
                newValueString = valueString;
            }
            return newValueString;
        };
    }
    /**
   * Clear anything that has been accumulated in the valueStringProperty field.
   * @public
   */ clear() {
        this.valueStringProperty.value = '';
    }
    /**
   * Determines whether pressing a key (except for the backspace) will clear the existing value.
   * @param {boolean} clearOnNextKeyPress
   * @public
   */ setClearOnNextKeyPress(clearOnNextKeyPress) {
        this._clearOnNextKeyPress = clearOnNextKeyPress;
    }
    /**
   * Will pressing a key (except for the backspace point) clear the existing value?
   * @returns {boolean}
   * @public
   */ getClearOnNextKeyPress() {
        return this._clearOnNextKeyPress;
    }
    /**
   * @param {Object} [options]
   * @deprecated
   */ constructor(options){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        assert && deprecationWarning('NumberKeypad is deprecated, please use Keypad instead');
        options = merge({
            buttonFont: new PhetFont({
                size: 20
            }),
            minButtonWidth: 35,
            minButtonHeight: 35,
            decimalPointKey: false,
            xSpacing: 10,
            ySpacing: 10,
            keyColor: 'white',
            valueStringProperty: new Property(''),
            // {function(string, string)} validates a key press, see example and documentation in validateMaxDigits
            validateKey: NumberKeypad.validateMaxDigits({
                maxDigits: 8
            })
        }, options);
        super();
        // @public (read-only) - sequence of key values entered by the user
        this.valueStringProperty = options.valueStringProperty;
        // @private - when true, the next key press will clear valueStringProperty
        this._clearOnNextKeyPress = false;
        // options for keys
        const keyOptions = {
            minWidth: options.minButtonWidth,
            minHeight: options.minButtonHeight,
            baseColor: options.keyColor,
            font: options.buttonFont
        };
        // create the backspace key
        const backspaceIcon = new BackspaceIcon();
        backspaceIcon.scale(Math.min(options.minButtonWidth / backspaceIcon.width * 0.7, options.minButtonHeight * 0.65 / backspaceIcon.height));
        const backspaceKey = new RectangularPushButton({
            content: backspaceIcon,
            minWidth: keyOptions.minWidth,
            minHeight: keyOptions.minHeight,
            xMargin: 1,
            baseColor: keyOptions.baseColor,
            listener: ()=>{
                if (this.valueStringProperty.value.length > 0) {
                    // The backspace key ignores and resets the clearOnNextKeyPress flag. The rationale is that if a user has
                    // entered an incorrect value and wants to correct it by using the backspace, then it should work like
                    // the backspace always does instead of clearing the display.
                    this._clearOnNextKeyPress = false;
                    // Remove the last character
                    this.valueStringProperty.set(this.valueStringProperty.get().slice(0, -1));
                }
            }
        });
        /**
     * Called when a key is pressed.
     * @param {string} keyString - string associated with the key that was pressed
     */ const keyCallback = (keyString)=>{
            // If set to clear the value on the next key press, clear the existing string.
            if (this._clearOnNextKeyPress) {
                this.valueStringProperty.value = '';
                this._clearOnNextKeyPress = false;
            }
            // process the keyString
            this.valueStringProperty.value = options.validateKey(keyString, this.valueStringProperty.value);
        };
        // create the bottom row of keys, which can vary based on options
        const bottomRowChildren = [];
        if (options.decimalPointKey) {
            // add a decimal point key plus a normal width zero key
            bottomRowChildren.push(createKey(DECIMAL_POINT, keyCallback, keyOptions));
            bottomRowChildren.push(createKey('0', keyCallback, keyOptions));
        } else {
            // add a double-width zero key instead of the decimal point key
            const doubleRowButtonKeySpec = merge({}, keyOptions, {
                minWidth: keyOptions.minWidth * 2 + options.xSpacing
            });
            bottomRowChildren.push(createKey('0', keyCallback, doubleRowButtonKeySpec));
        }
        bottomRowChildren.push(backspaceKey);
        // add the rest of the keys
        const vBox = new VBox({
            spacing: options.ySpacing,
            children: [
                new HBox({
                    spacing: options.xSpacing,
                    children: [
                        createKey('7', keyCallback, keyOptions),
                        createKey('8', keyCallback, keyOptions),
                        createKey('9', keyCallback, keyOptions)
                    ]
                }),
                new HBox({
                    spacing: options.xSpacing,
                    children: [
                        createKey('4', keyCallback, keyOptions),
                        createKey('5', keyCallback, keyOptions),
                        createKey('6', keyCallback, keyOptions)
                    ]
                }),
                new HBox({
                    spacing: options.xSpacing,
                    children: [
                        createKey('1', keyCallback, keyOptions),
                        createKey('2', keyCallback, keyOptions),
                        createKey('3', keyCallback, keyOptions)
                    ]
                }),
                new HBox({
                    spacing: options.xSpacing,
                    children: bottomRowChildren
                })
            ]
        });
        assert && assert(!options.children, 'NumberKeyPad sets children');
        options.children = [
            vBox
        ];
        this.mutate(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'NumberKeypad', this);
    }
};
/**
 * Creates a key for the keypad.
 * @param {string} keyString - string that appears on the key
 * @param {function(string)} callback - called when the key is pressed
 * @param {Object} keyOptions - see RectangularPushButton.options
 * @returns {Node}
 */ function createKey(keyString, callback, keyOptions) {
    return new RectangularPushButton({
        content: new Text(keyString, {
            font: keyOptions.font
        }),
        baseColor: keyOptions.baseColor,
        minWidth: keyOptions.minWidth,
        minHeight: keyOptions.minHeight,
        xMargin: 5,
        yMargin: 5,
        listener: function() {
            callback(keyString);
        }
    });
}
// @public
NumberKeypad.DECIMAL_POINT = DECIMAL_POINT;
sceneryPhet.register('NumberKeypad', NumberKeypad);
export default NumberKeypad;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJLZXlwYWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBzY2VuZXJ5IG5vZGUgdGhhdCBsb29rcyBsaWtlIGEgbnVtYmVyIGtleSBwYWQgYW5kIGFsbG93cyB0aGUgdXNlciB0byBlbnRlciBhIG51bWJlci4gVGhlIGVudGVyZWQgbnVtYmVyIGlzIG5vdFxuICogZGlzcGxheWVkIGJ5IHRoaXMgbm9kZSAtIGl0IGlzIGludGVuZGVkIHRvIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBhIHNlcGFyYXRlIGRpc3BsYXkgb2Ygc29tZSBzb3J0LlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNTGVhcm5lcilcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgeyBIQm94LCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBCYWNrc3BhY2VJY29uIGZyb20gJy4vQmFja3NwYWNlSWNvbi5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbi8vIHN0cmluZ1xuY29uc3QgREVDSU1BTF9QT0lOVCA9ICcuJzsgLy9UT0RPIGxvY2FsaXplLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8zMzNcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCAtIFRoaXMga2V5cGFkIGhhcyBiZWVuIHJlcGxhY2VkIGJ5IGEgbW9yZSBmbGV4aWJsZSBhbmQgZ2VuZXJhbCB2ZXJzaW9uLlxuICogV2hpbGUgdGhlcmUgYXJlIG5vIHBsYW5zIHRvIGdvIGJhY2sgYW5kIHJlcGxhY2UgZXhpc3RpbmcgdXNhZ2VzLCBuZXcgaW1wbGVtZW50YXRpb25zIHNob3VsZCB1c2UgS2V5cGFkLmpzLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzI4MyBmb3IgdGhlIGhpc3Rvcnkgb2YgdGhpcy4gLWpicGhldCwgQXVnIDIwMTdcbiAqL1xuY2xhc3MgTnVtYmVyS2V5cGFkIGV4dGVuZHMgTm9kZSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdOdW1iZXJLZXlwYWQgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBLZXlwYWQgaW5zdGVhZCcgKTtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgYnV0dG9uRm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDIwIH0gKSxcbiAgICAgIG1pbkJ1dHRvbldpZHRoOiAzNSxcbiAgICAgIG1pbkJ1dHRvbkhlaWdodDogMzUsXG4gICAgICBkZWNpbWFsUG9pbnRLZXk6IGZhbHNlLFxuICAgICAgeFNwYWNpbmc6IDEwLFxuICAgICAgeVNwYWNpbmc6IDEwLFxuICAgICAga2V5Q29sb3I6ICd3aGl0ZScsXG4gICAgICB2YWx1ZVN0cmluZ1Byb3BlcnR5OiBuZXcgUHJvcGVydHkoICcnICksXG5cbiAgICAgIC8vIHtmdW5jdGlvbihzdHJpbmcsIHN0cmluZyl9IHZhbGlkYXRlcyBhIGtleSBwcmVzcywgc2VlIGV4YW1wbGUgYW5kIGRvY3VtZW50YXRpb24gaW4gdmFsaWRhdGVNYXhEaWdpdHNcbiAgICAgIHZhbGlkYXRlS2V5OiBOdW1iZXJLZXlwYWQudmFsaWRhdGVNYXhEaWdpdHMoIHsgbWF4RGlnaXRzOiA4IH0gKVxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gc2VxdWVuY2Ugb2Yga2V5IHZhbHVlcyBlbnRlcmVkIGJ5IHRoZSB1c2VyXG4gICAgdGhpcy52YWx1ZVN0cmluZ1Byb3BlcnR5ID0gb3B0aW9ucy52YWx1ZVN0cmluZ1Byb3BlcnR5O1xuXG4gICAgLy8gQHByaXZhdGUgLSB3aGVuIHRydWUsIHRoZSBuZXh0IGtleSBwcmVzcyB3aWxsIGNsZWFyIHZhbHVlU3RyaW5nUHJvcGVydHlcbiAgICB0aGlzLl9jbGVhck9uTmV4dEtleVByZXNzID0gZmFsc2U7XG5cbiAgICAvLyBvcHRpb25zIGZvciBrZXlzXG4gICAgY29uc3Qga2V5T3B0aW9ucyA9IHtcbiAgICAgIG1pbldpZHRoOiBvcHRpb25zLm1pbkJ1dHRvbldpZHRoLFxuICAgICAgbWluSGVpZ2h0OiBvcHRpb25zLm1pbkJ1dHRvbkhlaWdodCxcbiAgICAgIGJhc2VDb2xvcjogb3B0aW9ucy5rZXlDb2xvcixcbiAgICAgIGZvbnQ6IG9wdGlvbnMuYnV0dG9uRm9udFxuICAgIH07XG5cbiAgICAvLyBjcmVhdGUgdGhlIGJhY2tzcGFjZSBrZXlcbiAgICBjb25zdCBiYWNrc3BhY2VJY29uID0gbmV3IEJhY2tzcGFjZUljb24oKTtcbiAgICBiYWNrc3BhY2VJY29uLnNjYWxlKCBNYXRoLm1pbiggb3B0aW9ucy5taW5CdXR0b25XaWR0aCAvIGJhY2tzcGFjZUljb24ud2lkdGggKiAwLjcsICggb3B0aW9ucy5taW5CdXR0b25IZWlnaHQgKiAwLjY1ICkgLyBiYWNrc3BhY2VJY29uLmhlaWdodCApICk7XG4gICAgY29uc3QgYmFja3NwYWNlS2V5ID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgICAgY29udGVudDogYmFja3NwYWNlSWNvbixcbiAgICAgIG1pbldpZHRoOiBrZXlPcHRpb25zLm1pbldpZHRoLFxuICAgICAgbWluSGVpZ2h0OiBrZXlPcHRpb25zLm1pbkhlaWdodCxcbiAgICAgIHhNYXJnaW46IDEsXG4gICAgICBiYXNlQ29sb3I6IGtleU9wdGlvbnMuYmFzZUNvbG9yLFxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgICAgaWYgKCB0aGlzLnZhbHVlU3RyaW5nUHJvcGVydHkudmFsdWUubGVuZ3RoID4gMCApIHtcblxuICAgICAgICAgIC8vIFRoZSBiYWNrc3BhY2Uga2V5IGlnbm9yZXMgYW5kIHJlc2V0cyB0aGUgY2xlYXJPbk5leHRLZXlQcmVzcyBmbGFnLiBUaGUgcmF0aW9uYWxlIGlzIHRoYXQgaWYgYSB1c2VyIGhhc1xuICAgICAgICAgIC8vIGVudGVyZWQgYW4gaW5jb3JyZWN0IHZhbHVlIGFuZCB3YW50cyB0byBjb3JyZWN0IGl0IGJ5IHVzaW5nIHRoZSBiYWNrc3BhY2UsIHRoZW4gaXQgc2hvdWxkIHdvcmsgbGlrZVxuICAgICAgICAgIC8vIHRoZSBiYWNrc3BhY2UgYWx3YXlzIGRvZXMgaW5zdGVhZCBvZiBjbGVhcmluZyB0aGUgZGlzcGxheS5cbiAgICAgICAgICB0aGlzLl9jbGVhck9uTmV4dEtleVByZXNzID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIGxhc3QgY2hhcmFjdGVyXG4gICAgICAgICAgdGhpcy52YWx1ZVN0cmluZ1Byb3BlcnR5LnNldCggdGhpcy52YWx1ZVN0cmluZ1Byb3BlcnR5LmdldCgpLnNsaWNlKCAwLCAtMSApICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2hlbiBhIGtleSBpcyBwcmVzc2VkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlTdHJpbmcgLSBzdHJpbmcgYXNzb2NpYXRlZCB3aXRoIHRoZSBrZXkgdGhhdCB3YXMgcHJlc3NlZFxuICAgICAqL1xuICAgIGNvbnN0IGtleUNhbGxiYWNrID0ga2V5U3RyaW5nID0+IHtcblxuICAgICAgLy8gSWYgc2V0IHRvIGNsZWFyIHRoZSB2YWx1ZSBvbiB0aGUgbmV4dCBrZXkgcHJlc3MsIGNsZWFyIHRoZSBleGlzdGluZyBzdHJpbmcuXG4gICAgICBpZiAoIHRoaXMuX2NsZWFyT25OZXh0S2V5UHJlc3MgKSB7XG4gICAgICAgIHRoaXMudmFsdWVTdHJpbmdQcm9wZXJ0eS52YWx1ZSA9ICcnO1xuICAgICAgICB0aGlzLl9jbGVhck9uTmV4dEtleVByZXNzID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgdGhlIGtleVN0cmluZ1xuICAgICAgdGhpcy52YWx1ZVN0cmluZ1Byb3BlcnR5LnZhbHVlID0gb3B0aW9ucy52YWxpZGF0ZUtleSgga2V5U3RyaW5nLCB0aGlzLnZhbHVlU3RyaW5nUHJvcGVydHkudmFsdWUgKTtcbiAgICB9O1xuXG4gICAgLy8gY3JlYXRlIHRoZSBib3R0b20gcm93IG9mIGtleXMsIHdoaWNoIGNhbiB2YXJ5IGJhc2VkIG9uIG9wdGlvbnNcbiAgICBjb25zdCBib3R0b21Sb3dDaGlsZHJlbiA9IFtdO1xuICAgIGlmICggb3B0aW9ucy5kZWNpbWFsUG9pbnRLZXkgKSB7XG5cbiAgICAgIC8vIGFkZCBhIGRlY2ltYWwgcG9pbnQga2V5IHBsdXMgYSBub3JtYWwgd2lkdGggemVybyBrZXlcbiAgICAgIGJvdHRvbVJvd0NoaWxkcmVuLnB1c2goIGNyZWF0ZUtleSggREVDSU1BTF9QT0lOVCwga2V5Q2FsbGJhY2ssIGtleU9wdGlvbnMgKSApO1xuICAgICAgYm90dG9tUm93Q2hpbGRyZW4ucHVzaCggY3JlYXRlS2V5KCAnMCcsIGtleUNhbGxiYWNrLCBrZXlPcHRpb25zICkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgIC8vIGFkZCBhIGRvdWJsZS13aWR0aCB6ZXJvIGtleSBpbnN0ZWFkIG9mIHRoZSBkZWNpbWFsIHBvaW50IGtleVxuICAgICAgY29uc3QgZG91YmxlUm93QnV0dG9uS2V5U3BlYyA9IG1lcmdlKCB7fSwga2V5T3B0aW9ucywgeyBtaW5XaWR0aDoga2V5T3B0aW9ucy5taW5XaWR0aCAqIDIgKyBvcHRpb25zLnhTcGFjaW5nIH0gKTtcbiAgICAgIGJvdHRvbVJvd0NoaWxkcmVuLnB1c2goIGNyZWF0ZUtleSggJzAnLCBrZXlDYWxsYmFjaywgZG91YmxlUm93QnV0dG9uS2V5U3BlYyApICk7XG4gICAgfVxuICAgIGJvdHRvbVJvd0NoaWxkcmVuLnB1c2goIGJhY2tzcGFjZUtleSApO1xuXG4gICAgLy8gYWRkIHRoZSByZXN0IG9mIHRoZSBrZXlzXG4gICAgY29uc3QgdkJveCA9IG5ldyBWQm94KCB7XG4gICAgICBzcGFjaW5nOiBvcHRpb25zLnlTcGFjaW5nLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnhTcGFjaW5nLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICBjcmVhdGVLZXkoICc3Jywga2V5Q2FsbGJhY2ssIGtleU9wdGlvbnMgKSxcbiAgICAgICAgICAgIGNyZWF0ZUtleSggJzgnLCBrZXlDYWxsYmFjaywga2V5T3B0aW9ucyApLFxuICAgICAgICAgICAgY3JlYXRlS2V5KCAnOScsIGtleUNhbGxiYWNrLCBrZXlPcHRpb25zIClcbiAgICAgICAgICBdXG4gICAgICAgIH0gKSxcbiAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnhTcGFjaW5nLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICBjcmVhdGVLZXkoICc0Jywga2V5Q2FsbGJhY2ssIGtleU9wdGlvbnMgKSxcbiAgICAgICAgICAgIGNyZWF0ZUtleSggJzUnLCBrZXlDYWxsYmFjaywga2V5T3B0aW9ucyApLFxuICAgICAgICAgICAgY3JlYXRlS2V5KCAnNicsIGtleUNhbGxiYWNrLCBrZXlPcHRpb25zIClcbiAgICAgICAgICBdXG4gICAgICAgIH0gKSxcbiAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnhTcGFjaW5nLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICBjcmVhdGVLZXkoICcxJywga2V5Q2FsbGJhY2ssIGtleU9wdGlvbnMgKSxcbiAgICAgICAgICAgIGNyZWF0ZUtleSggJzInLCBrZXlDYWxsYmFjaywga2V5T3B0aW9ucyApLFxuICAgICAgICAgICAgY3JlYXRlS2V5KCAnMycsIGtleUNhbGxiYWNrLCBrZXlPcHRpb25zIClcbiAgICAgICAgICBdXG4gICAgICAgIH0gKSxcbiAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnhTcGFjaW5nLFxuICAgICAgICAgIGNoaWxkcmVuOiBib3R0b21Sb3dDaGlsZHJlblxuICAgICAgICB9IClcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ051bWJlcktleVBhZCBzZXRzIGNoaWxkcmVuJyApO1xuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHZCb3ggXTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ051bWJlcktleXBhZCcsIHRoaXMgKTtcbiAgfVxuXG4gIGdldCBjbGVhck9uTmV4dEtleVByZXNzKCkgeyByZXR1cm4gdGhpcy5nZXRDbGVhck9uTmV4dEtleVByZXNzKCk7IH1cblxuICBzZXQgY2xlYXJPbk5leHRLZXlQcmVzcyggdmFsdWUgKSB7IHRoaXMuc2V0Q2xlYXJPbk5leHRLZXlQcmVzcyggdmFsdWUgKTsgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdmFsaWRhdGlvbiBmdW5jdGlvbiB0aGF0IGNvbnN0cmFpbnMgdGhlIHZhbHVlIHRvIGEgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzLCB3aXRoIDEgbGVhZGluZyB6ZXJvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEByZXR1cm5zIHtmdW5jdGlvbihzdHJpbmcsIHN0cmluZyl9XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZU1heERpZ2l0cyggb3B0aW9ucyApIHtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgbWF4RGlnaXRzOiA4IC8vIHtudW1iZXJ9IHRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgKG51bWJlcnMpXG4gICAgfSwgb3B0aW9ucyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMubWF4RGlnaXRzID4gMCwgYGludmFsaWQgbWF4RGlnaXRzOiAke29wdGlvbnMubWF4RGlnaXRzfWAgKTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIG5ldyBzdHJpbmcgdGhhdCByZXN1bHRzIGZyb20gcHJlc3NpbmcgYSBrZXkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVN0cmluZyAtIHN0cmluZyBhc3NvY2lhdGVkIHdpdGggdGhlIGtleSB0aGF0IHdhcyBwcmVzc2VkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlU3RyaW5nIC0gc3RyaW5nIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHNlcXVlbmNlIG9mIGtleXMgdGhhdCBoYXZlIGJlZW4gcHJlc3NlZFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSByZXN1bHRcbiAgICAgKi9cbiAgICByZXR1cm4gZnVuY3Rpb24oIGtleVN0cmluZywgdmFsdWVTdHJpbmcgKSB7XG5cbiAgICAgIGNvbnN0IGhhc0RlY2ltYWxQb2ludCA9IHZhbHVlU3RyaW5nLmluZGV4T2YoIERFQ0lNQUxfUE9JTlQgKSAhPT0gLTE7XG4gICAgICBjb25zdCBudW1iZXJPZkRpZ2l0cyA9IGhhc0RlY2ltYWxQb2ludCA/IHZhbHVlU3RyaW5nLmxlbmd0aCAtIDEgOiB2YWx1ZVN0cmluZy5sZW5ndGg7XG5cbiAgICAgIGxldCBuZXdWYWx1ZVN0cmluZztcbiAgICAgIGlmICggdmFsdWVTdHJpbmcgPT09ICcwJyAmJiBrZXlTdHJpbmcgPT09ICcwJyApIHtcblxuICAgICAgICAvLyBpZ25vcmUgbXVsdGlwbGUgbGVhZGluZyB6ZXJvc1xuICAgICAgICBuZXdWYWx1ZVN0cmluZyA9IHZhbHVlU3RyaW5nO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHZhbHVlU3RyaW5nID09PSAnMCcgJiYga2V5U3RyaW5nICE9PSAnMCcgJiYga2V5U3RyaW5nICE9PSBERUNJTUFMX1BPSU5UICkge1xuXG4gICAgICAgIC8vIHJlcGxhY2UgYSBsZWFkaW5nIDAgdGhhdCdzIG5vdCBmb2xsb3dlZCBieSBhIGRlY2ltYWwgcG9pbnQgd2l0aCB0aGlzIGtleVxuICAgICAgICBuZXdWYWx1ZVN0cmluZyA9IGtleVN0cmluZztcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBrZXlTdHJpbmcgIT09IERFQ0lNQUxfUE9JTlQgJiYgbnVtYmVyT2ZEaWdpdHMgPCBvcHRpb25zLm1heERpZ2l0cyApIHtcblxuICAgICAgICAvLyBjb25zdHJhaW4gdG8gbWF4RGlnaXRzXG4gICAgICAgIG5ld1ZhbHVlU3RyaW5nID0gdmFsdWVTdHJpbmcgKyBrZXlTdHJpbmc7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICgga2V5U3RyaW5nID09PSBERUNJTUFMX1BPSU5UICYmIHZhbHVlU3RyaW5nLmluZGV4T2YoIERFQ0lNQUxfUE9JTlQgKSA9PT0gLTEgKSB7XG5cbiAgICAgICAgLy8gYWxsb3cgb25lIGRlY2ltYWwgcG9pbnRcbiAgICAgICAgbmV3VmFsdWVTdHJpbmcgPSB2YWx1ZVN0cmluZyArIGtleVN0cmluZztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIC8vIGlnbm9yZSBrZXlTdHJpbmdcbiAgICAgICAgbmV3VmFsdWVTdHJpbmcgPSB2YWx1ZVN0cmluZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ld1ZhbHVlU3RyaW5nO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgYW55dGhpbmcgdGhhdCBoYXMgYmVlbiBhY2N1bXVsYXRlZCBpbiB0aGUgdmFsdWVTdHJpbmdQcm9wZXJ0eSBmaWVsZC5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy52YWx1ZVN0cmluZ1Byb3BlcnR5LnZhbHVlID0gJyc7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHByZXNzaW5nIGEga2V5IChleGNlcHQgZm9yIHRoZSBiYWNrc3BhY2UpIHdpbGwgY2xlYXIgdGhlIGV4aXN0aW5nIHZhbHVlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNsZWFyT25OZXh0S2V5UHJlc3NcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc2V0Q2xlYXJPbk5leHRLZXlQcmVzcyggY2xlYXJPbk5leHRLZXlQcmVzcyApIHtcbiAgICB0aGlzLl9jbGVhck9uTmV4dEtleVByZXNzID0gY2xlYXJPbk5leHRLZXlQcmVzcztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaWxsIHByZXNzaW5nIGEga2V5IChleGNlcHQgZm9yIHRoZSBiYWNrc3BhY2UgcG9pbnQpIGNsZWFyIHRoZSBleGlzdGluZyB2YWx1ZT9cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGdldENsZWFyT25OZXh0S2V5UHJlc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NsZWFyT25OZXh0S2V5UHJlc3M7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEga2V5IGZvciB0aGUga2V5cGFkLlxuICogQHBhcmFtIHtzdHJpbmd9IGtleVN0cmluZyAtIHN0cmluZyB0aGF0IGFwcGVhcnMgb24gdGhlIGtleVxuICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcpfSBjYWxsYmFjayAtIGNhbGxlZCB3aGVuIHRoZSBrZXkgaXMgcHJlc3NlZFxuICogQHBhcmFtIHtPYmplY3R9IGtleU9wdGlvbnMgLSBzZWUgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLm9wdGlvbnNcbiAqIEByZXR1cm5zIHtOb2RlfVxuICovXG5mdW5jdGlvbiBjcmVhdGVLZXkoIGtleVN0cmluZywgY2FsbGJhY2ssIGtleU9wdGlvbnMgKSB7XG4gIHJldHVybiBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XG4gICAgY29udGVudDogbmV3IFRleHQoIGtleVN0cmluZywgeyBmb250OiBrZXlPcHRpb25zLmZvbnQgfSApLFxuICAgIGJhc2VDb2xvcjoga2V5T3B0aW9ucy5iYXNlQ29sb3IsXG4gICAgbWluV2lkdGg6IGtleU9wdGlvbnMubWluV2lkdGgsXG4gICAgbWluSGVpZ2h0OiBrZXlPcHRpb25zLm1pbkhlaWdodCxcbiAgICB4TWFyZ2luOiA1LFxuICAgIHlNYXJnaW46IDUsXG4gICAgbGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyBjYWxsYmFjaygga2V5U3RyaW5nICk7IH1cbiAgfSApO1xufVxuXG4vLyBAcHVibGljXG5OdW1iZXJLZXlwYWQuREVDSU1BTF9QT0lOVCA9IERFQ0lNQUxfUE9JTlQ7XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTnVtYmVyS2V5cGFkJywgTnVtYmVyS2V5cGFkICk7XG5leHBvcnQgZGVmYXVsdCBOdW1iZXJLZXlwYWQ7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiZGVwcmVjYXRpb25XYXJuaW5nIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm1lcmdlIiwiSEJveCIsIk5vZGUiLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkJhY2tzcGFjZUljb24iLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiREVDSU1BTF9QT0lOVCIsIk51bWJlcktleXBhZCIsImNsZWFyT25OZXh0S2V5UHJlc3MiLCJnZXRDbGVhck9uTmV4dEtleVByZXNzIiwidmFsdWUiLCJzZXRDbGVhck9uTmV4dEtleVByZXNzIiwidmFsaWRhdGVNYXhEaWdpdHMiLCJvcHRpb25zIiwibWF4RGlnaXRzIiwiYXNzZXJ0Iiwia2V5U3RyaW5nIiwidmFsdWVTdHJpbmciLCJoYXNEZWNpbWFsUG9pbnQiLCJpbmRleE9mIiwibnVtYmVyT2ZEaWdpdHMiLCJsZW5ndGgiLCJuZXdWYWx1ZVN0cmluZyIsImNsZWFyIiwidmFsdWVTdHJpbmdQcm9wZXJ0eSIsIl9jbGVhck9uTmV4dEtleVByZXNzIiwiY29uc3RydWN0b3IiLCJ3aW5kb3ciLCJidXR0b25Gb250Iiwic2l6ZSIsIm1pbkJ1dHRvbldpZHRoIiwibWluQnV0dG9uSGVpZ2h0IiwiZGVjaW1hbFBvaW50S2V5IiwieFNwYWNpbmciLCJ5U3BhY2luZyIsImtleUNvbG9yIiwidmFsaWRhdGVLZXkiLCJrZXlPcHRpb25zIiwibWluV2lkdGgiLCJtaW5IZWlnaHQiLCJiYXNlQ29sb3IiLCJmb250IiwiYmFja3NwYWNlSWNvbiIsInNjYWxlIiwiTWF0aCIsIm1pbiIsIndpZHRoIiwiaGVpZ2h0IiwiYmFja3NwYWNlS2V5IiwiY29udGVudCIsInhNYXJnaW4iLCJsaXN0ZW5lciIsInNldCIsImdldCIsInNsaWNlIiwia2V5Q2FsbGJhY2siLCJib3R0b21Sb3dDaGlsZHJlbiIsInB1c2giLCJjcmVhdGVLZXkiLCJkb3VibGVSb3dCdXR0b25LZXlTcGVjIiwidkJveCIsInNwYWNpbmciLCJjaGlsZHJlbiIsIm11dGF0ZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwiY2FsbGJhY2siLCJ5TWFyZ2luIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EsY0FBYyw0QkFBNEI7QUFDakQsT0FBT0Msd0JBQXdCLDJDQUEyQztBQUMxRSxPQUFPQyxzQkFBc0IsdURBQXVEO0FBQ3BGLE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSw4QkFBOEI7QUFDckUsT0FBT0MsMkJBQTJCLGdEQUFnRDtBQUNsRixPQUFPQyxtQkFBbUIscUJBQXFCO0FBQy9DLE9BQU9DLGNBQWMsZ0JBQWdCO0FBQ3JDLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFFM0MsU0FBUztBQUNULE1BQU1DLGdCQUFnQixLQUFLLG9FQUFvRTtBQUUvRjs7OztDQUlDLEdBQ0QsSUFBQSxBQUFNQyxlQUFOLE1BQU1BLHFCQUFxQlI7SUEwSXpCLElBQUlTLHNCQUFzQjtRQUFFLE9BQU8sSUFBSSxDQUFDQyxzQkFBc0I7SUFBSTtJQUVsRSxJQUFJRCxvQkFBcUJFLEtBQUssRUFBRztRQUFFLElBQUksQ0FBQ0Msc0JBQXNCLENBQUVEO0lBQVM7SUFFekU7Ozs7O0dBS0MsR0FDRCxPQUFPRSxrQkFBbUJDLE9BQU8sRUFBRztRQUVsQ0EsVUFBVWhCLE1BQU87WUFDZmlCLFdBQVcsRUFBRSxrREFBa0Q7UUFDakUsR0FBR0Q7UUFDSEUsVUFBVUEsT0FBUUYsUUFBUUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRUQsUUFBUUMsU0FBUyxFQUFFO1FBRWxGOzs7OztLQUtDLEdB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