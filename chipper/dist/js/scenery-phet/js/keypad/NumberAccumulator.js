// Copyright 2017-2024, University of Colorado Boulder
/**
 * A key accumulator that collects user input for integer and floating point values, intended for use in conjunction
 * with the common-code keypad.
 *
 * @author Aadish Gupta
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import DerivedStringProperty from '../../../axon/js/DerivedStringProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import sceneryPhet from '../sceneryPhet.js';
import AbstractKeyAccumulator from './AbstractKeyAccumulator.js';
import KeyID from './KeyID.js';
// constants
const NEGATIVE_CHAR = '\u2212';
const DECIMAL_CHAR = '.';
// Define the maximum integer that can be handled.  The portion with the explicit numeric value is necessary for IE11
// support, see https://github.com/phetsims/scenery-phet/issues/332.
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
const MAX_DIGITS = MAX_SAFE_INTEGER.toString().length - 1;
let NumberAccumulator = class NumberAccumulator extends AbstractKeyAccumulator {
    /**
   * Invoked when a key is pressed and creates proposed set of keys to be passed to the validator
   * @param keyIdentifier - identifier for the key pressed
   */ handleKeyPressed(keyIdentifier) {
        const newArray = this.handleClearOnNextKeyPress(keyIdentifier);
        if (this.isDigit(keyIdentifier)) {
            this.removeLeadingZero(newArray);
            newArray.push(keyIdentifier);
        } else if (keyIdentifier === KeyID.BACKSPACE) {
            newArray.pop();
        } else if (keyIdentifier === KeyID.PLUS_MINUS) {
            // check if first element of array is instance of this class
            if (newArray.length > 0 && newArray[0] === KeyID.PLUS_MINUS) {
                newArray.shift();
            } else {
                newArray.unshift(keyIdentifier);
            }
        } else if (keyIdentifier === KeyID.DECIMAL) {
            if (!this.containsFloatingPoint(newArray)) {
                newArray.push(keyIdentifier);
            }
        } else {
            assert && assert(false, `unsupported keyIdentifier: ${keyIdentifier}`);
        }
        // Validate and update the keys
        this.validateKeys(newArray) && this.updateKeys(newArray);
    }
    /**
   * Removes leading zeros from the array.
   */ removeLeadingZero(array) {
        if (this.valueProperty.get() === 0 && !this.containsFloatingPoint(array)) {
            array.pop();
        }
    }
    /**
   * Converts a set of keys to a string.
   */ keysToString(keys) {
        let returnValue = '';
        let i = 0;
        // the plus/minus key (if present) will be first key, and indicates that the number is negative
        if (keys.length > 0 && keys[i] === KeyID.PLUS_MINUS) {
            returnValue = NEGATIVE_CHAR;
            i++;
        }
        // process remaining keys
        for(; i < keys.length; i++){
            if (keys[i] === KeyID.DECIMAL) {
                returnValue = returnValue + DECIMAL_CHAR;
            } else {
                // the plus/minus key should be first if present
                assert && assert(this.isDigit(keys[i]), 'unexpected key type');
                returnValue = returnValue + keys[i];
            }
        }
        return returnValue;
    }
    /**
   * Converts a string representation to a number.
   */ stringToInteger(stringValue) {
        let returnValue = null;
        // if stringValue contains something other than just a minus sign...
        if (stringValue.length > 0 && !(stringValue.length === 1 && stringValue.startsWith(NEGATIVE_CHAR)) && (this.getNumberOfDigitsLeftOfMantissa(this.accumulatedKeysProperty.get()) > 0 || this.getNumberOfDigitsRightOfMantissa(this.accumulatedKeysProperty.get()) > 0)) {
            // replace Unicode minus with vanilla '-', or parseInt will fail for negative numbers
            returnValue = Number(stringValue.replace(NEGATIVE_CHAR, '-').replace(DECIMAL_CHAR, '.'));
            assert && assert(!isNaN(returnValue), `invalid number: ${returnValue}`);
        }
        return returnValue;
    }
    /**
   * Gets the number of digits to the left of mantissa in the accumulator.
   */ getNumberOfDigitsLeftOfMantissa(keys) {
        let numberOfDigits = 0;
        for(let i = 0; i < keys.length; i++){
            if (this.isDigit(keys[i])) {
                numberOfDigits++;
            }
            if (keys[i] === KeyID.DECIMAL) {
                break;
            }
        }
        return numberOfDigits;
    }
    /**
   * Gets the number of digits to the right of mantissa in the accumulator.
   */ getNumberOfDigitsRightOfMantissa(keys) {
        const decimalKeyIndex = keys.indexOf(KeyID.DECIMAL);
        let numberOfDigits = 0;
        if (decimalKeyIndex >= 0) {
            for(let i = decimalKeyIndex; i < keys.length; i++){
                if (this.isDigit(keys[i])) {
                    numberOfDigits++;
                }
            }
        }
        return numberOfDigits;
    }
    /**
   * Gets the number of digits in the accumulator.
   */ getNumberOfDigits(keys) {
        let numberOfDigits = 0;
        for(let i = 0; i < keys.length; i++){
            if (this.isDigit(keys[i])) {
                numberOfDigits++;
            }
        }
        return numberOfDigits;
    }
    /**
   * Gets the number of digits in the accumulator.
   */ containsFloatingPoint(keys) {
        return keys.includes(KeyID.DECIMAL);
    }
    /**
   * Returns whether the character is valid digit or not
   */ isDigit(char) {
        return char >= '0' && char <= '9';
    }
    /**
   * clear the accumulator
   */ clear() {
        super.clear();
        this.setClearOnNextKeyPress(false);
    }
    dispose() {
        this.valueProperty.dispose();
        this.stringProperty.dispose();
        super.dispose();
    }
    constructor(providedOptions){
        const options = optionize()({
            maxDigitsRightOfMantissa: 0,
            maxDigits: MAX_DIGITS,
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'NumberAccumulator'
        }, providedOptions);
        // verify option values
        assert && assert(options.maxDigits > 0 && options.maxDigits <= MAX_DIGITS, `maxDigits is out of range: ${options.maxDigits}`);
        assert && assert(options.maxDigitsRightOfMantissa >= 0 && options.maxDigitsRightOfMantissa <= options.maxDigits, `maxDigitsRightOfMantissa is out of range: ${options.maxDigitsRightOfMantissa}`);
        // Validators to be passed to AbstractKeyAccumulator
        const validators = [
            (proposedKeys)=>{
                return this.getNumberOfDigits(proposedKeys) <= options.maxDigits && !(this.getNumberOfDigits(proposedKeys) === options.maxDigits && proposedKeys[proposedKeys.length - 1] === KeyID.DECIMAL) && this.getNumberOfDigitsRightOfMantissa(proposedKeys) <= options.maxDigitsRightOfMantissa;
            }
        ];
        super(validators);
        this.stringProperty = new DerivedStringProperty([
            this.accumulatedKeysProperty
        ], (accumulatedKeys)=>{
            return this.keysToString(accumulatedKeys);
        }, {
            tandem: options.tandem.createTandem('stringProperty') // eslint-disable-line phet/bad-sim-text
        });
        this.valueProperty = new DerivedProperty(// Use the accumulated keys rather than the string as a dependency since it avoids issues with dependencies,
        // see https://github.com/phetsims/scenery-phet/issues/833.
        [
            this.accumulatedKeysProperty
        ], (accumulatedKeys)=>{
            const stringValue = this.keysToString(accumulatedKeys);
            return this.stringToInteger(stringValue);
        }, {
            tandem: options.tandem.createTandem('valueProperty'),
            phetioValueType: NullableIO(NumberIO)
        });
    }
};
sceneryPhet.register('NumberAccumulator', NumberAccumulator);
export default NumberAccumulator;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlwYWQvTnVtYmVyQWNjdW11bGF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBrZXkgYWNjdW11bGF0b3IgdGhhdCBjb2xsZWN0cyB1c2VyIGlucHV0IGZvciBpbnRlZ2VyIGFuZCBmbG9hdGluZyBwb2ludCB2YWx1ZXMsIGludGVuZGVkIGZvciB1c2UgaW4gY29uanVuY3Rpb25cbiAqIHdpdGggdGhlIGNvbW1vbi1jb2RlIGtleXBhZC5cbiAqXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBEZXJpdmVkU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkU3RyaW5nUHJvcGVydHkuanMnO1xuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IEFic3RyYWN0S2V5QWNjdW11bGF0b3IgZnJvbSAnLi9BYnN0cmFjdEtleUFjY3VtdWxhdG9yLmpzJztcbmltcG9ydCBLZXlJRCwgeyBLZXlJRFZhbHVlIH0gZnJvbSAnLi9LZXlJRC5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgTkVHQVRJVkVfQ0hBUiA9ICdcXHUyMjEyJztcbmNvbnN0IERFQ0lNQUxfQ0hBUiA9ICcuJztcblxuLy8gRGVmaW5lIHRoZSBtYXhpbXVtIGludGVnZXIgdGhhdCBjYW4gYmUgaGFuZGxlZC4gIFRoZSBwb3J0aW9uIHdpdGggdGhlIGV4cGxpY2l0IG51bWVyaWMgdmFsdWUgaXMgbmVjZXNzYXJ5IGZvciBJRTExXG4vLyBzdXBwb3J0LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvMzMyLlxuY29uc3QgTUFYX1NBRkVfSU5URUdFUiA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIHx8IDkwMDcxOTkyNTQ3NDA5OTE7XG5jb25zdCBNQVhfRElHSVRTID0gTUFYX1NBRkVfSU5URUdFUi50b1N0cmluZygpLmxlbmd0aCAtIDE7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIG1heERpZ2l0c1JpZ2h0T2ZNYW50aXNzYT86IG51bWJlcjtcbiAgbWF4RGlnaXRzPzogbnVtYmVyO1xufSAmIFBpY2s8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbScgfCAndGFuZGVtTmFtZVN1ZmZpeCc+O1xuXG5leHBvcnQgdHlwZSBOdW1iZXJBY2N1bXVsYXRvck9wdGlvbnMgPSBTZWxmT3B0aW9ucztcblxuY2xhc3MgTnVtYmVyQWNjdW11bGF0b3IgZXh0ZW5kcyBBYnN0cmFjdEtleUFjY3VtdWxhdG9yIHtcblxuICAvLyBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGtleXMgZW50ZXJlZCBieSB0aGUgdXNlclxuICBwdWJsaWMgcmVhZG9ubHkgc3RyaW5nUHJvcGVydHk6IFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcblxuICAvLyBudW1lcmljYWwgdmFsdWUgb2YgdGhlIGtleXMgZW50ZXJlZCBieSB0aGUgdXNlclxuICBwdWJsaWMgcmVhZG9ubHkgdmFsdWVQcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXIgfCBudWxsPjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlckFjY3VtdWxhdG9yT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TnVtYmVyQWNjdW11bGF0b3JPcHRpb25zLCBTZWxmT3B0aW9ucz4oKSgge1xuICAgICAgbWF4RGlnaXRzUmlnaHRPZk1hbnRpc3NhOiAwLFxuICAgICAgbWF4RGlnaXRzOiBNQVhfRElHSVRTLFxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnTnVtYmVyQWNjdW11bGF0b3InXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyB2ZXJpZnkgb3B0aW9uIHZhbHVlc1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMubWF4RGlnaXRzID4gMCAmJiBvcHRpb25zLm1heERpZ2l0cyA8PSBNQVhfRElHSVRTLFxuICAgICAgYG1heERpZ2l0cyBpcyBvdXQgb2YgcmFuZ2U6ICR7b3B0aW9ucy5tYXhEaWdpdHN9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMubWF4RGlnaXRzUmlnaHRPZk1hbnRpc3NhID49IDAgJiYgb3B0aW9ucy5tYXhEaWdpdHNSaWdodE9mTWFudGlzc2EgPD0gb3B0aW9ucy5tYXhEaWdpdHMsXG4gICAgICBgbWF4RGlnaXRzUmlnaHRPZk1hbnRpc3NhIGlzIG91dCBvZiByYW5nZTogJHtvcHRpb25zLm1heERpZ2l0c1JpZ2h0T2ZNYW50aXNzYX1gICk7XG5cbiAgICAvLyBWYWxpZGF0b3JzIHRvIGJlIHBhc3NlZCB0byBBYnN0cmFjdEtleUFjY3VtdWxhdG9yXG4gICAgY29uc3QgdmFsaWRhdG9ycyA9IFtcbiAgICAgICggcHJvcG9zZWRLZXlzOiBLZXlJRFZhbHVlW10gKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlck9mRGlnaXRzKCBwcm9wb3NlZEtleXMgKSA8PSBvcHRpb25zLm1heERpZ2l0c1xuICAgICAgICAgICAgICAgJiYgISggdGhpcy5nZXROdW1iZXJPZkRpZ2l0cyggcHJvcG9zZWRLZXlzICkgPT09IG9wdGlvbnMubWF4RGlnaXRzXG4gICAgICAgICAgICAgICAmJiBwcm9wb3NlZEtleXNbIHByb3Bvc2VkS2V5cy5sZW5ndGggLSAxIF0gPT09IEtleUlELkRFQ0lNQUwgKVxuICAgICAgICAgICAgICAgJiYgdGhpcy5nZXROdW1iZXJPZkRpZ2l0c1JpZ2h0T2ZNYW50aXNzYSggcHJvcG9zZWRLZXlzICkgPD0gb3B0aW9ucy5tYXhEaWdpdHNSaWdodE9mTWFudGlzc2E7XG4gICAgICB9XG4gICAgXTtcblxuICAgIHN1cGVyKCB2YWxpZGF0b3JzICk7XG5cbiAgICB0aGlzLnN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRTdHJpbmdQcm9wZXJ0eSggWyB0aGlzLmFjY3VtdWxhdGVkS2V5c1Byb3BlcnR5IF0sIGFjY3VtdWxhdGVkS2V5cyA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5rZXlzVG9TdHJpbmcoIGFjY3VtdWxhdGVkS2V5cyApO1xuICAgIH0sIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RyaW5nUHJvcGVydHknICkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgIH0gKTtcblxuICAgIHRoaXMudmFsdWVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXG5cbiAgICAgIC8vIFVzZSB0aGUgYWNjdW11bGF0ZWQga2V5cyByYXRoZXIgdGhhbiB0aGUgc3RyaW5nIGFzIGEgZGVwZW5kZW5jeSBzaW5jZSBpdCBhdm9pZHMgaXNzdWVzIHdpdGggZGVwZW5kZW5jaWVzLFxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzgzMy5cbiAgICAgIFsgdGhpcy5hY2N1bXVsYXRlZEtleXNQcm9wZXJ0eSBdLFxuICAgICAgYWNjdW11bGF0ZWRLZXlzID0+IHtcbiAgICAgICAgY29uc3Qgc3RyaW5nVmFsdWUgPSB0aGlzLmtleXNUb1N0cmluZyggYWNjdW11bGF0ZWRLZXlzICk7XG4gICAgICAgIHJldHVybiB0aGlzLnN0cmluZ1RvSW50ZWdlciggc3RyaW5nVmFsdWUgKTtcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmFsdWVQcm9wZXJ0eScgKSxcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApXG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnZva2VkIHdoZW4gYSBrZXkgaXMgcHJlc3NlZCBhbmQgY3JlYXRlcyBwcm9wb3NlZCBzZXQgb2Yga2V5cyB0byBiZSBwYXNzZWQgdG8gdGhlIHZhbGlkYXRvclxuICAgKiBAcGFyYW0ga2V5SWRlbnRpZmllciAtIGlkZW50aWZpZXIgZm9yIHRoZSBrZXkgcHJlc3NlZFxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGhhbmRsZUtleVByZXNzZWQoIGtleUlkZW50aWZpZXI6IEtleUlEVmFsdWUgKTogdm9pZCB7XG4gICAgY29uc3QgbmV3QXJyYXkgPSB0aGlzLmhhbmRsZUNsZWFyT25OZXh0S2V5UHJlc3MoIGtleUlkZW50aWZpZXIgKTtcbiAgICBpZiAoIHRoaXMuaXNEaWdpdCgga2V5SWRlbnRpZmllciApICkge1xuICAgICAgdGhpcy5yZW1vdmVMZWFkaW5nWmVybyggbmV3QXJyYXkgKTtcbiAgICAgIG5ld0FycmF5LnB1c2goIGtleUlkZW50aWZpZXIgKTtcblxuICAgIH1cbiAgICBlbHNlIGlmICgga2V5SWRlbnRpZmllciA9PT0gS2V5SUQuQkFDS1NQQUNFICkge1xuICAgICAgbmV3QXJyYXkucG9wKCk7XG5cbiAgICB9XG4gICAgZWxzZSBpZiAoIGtleUlkZW50aWZpZXIgPT09IEtleUlELlBMVVNfTUlOVVMgKSB7XG4gICAgICAvLyBjaGVjayBpZiBmaXJzdCBlbGVtZW50IG9mIGFycmF5IGlzIGluc3RhbmNlIG9mIHRoaXMgY2xhc3NcbiAgICAgIGlmICggbmV3QXJyYXkubGVuZ3RoID4gMCAmJiBuZXdBcnJheVsgMCBdID09PSBLZXlJRC5QTFVTX01JTlVTICkge1xuICAgICAgICBuZXdBcnJheS5zaGlmdCgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG5ld0FycmF5LnVuc2hpZnQoIGtleUlkZW50aWZpZXIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIGtleUlkZW50aWZpZXIgPT09IEtleUlELkRFQ0lNQUwgKSB7XG4gICAgICBpZiAoICF0aGlzLmNvbnRhaW5zRmxvYXRpbmdQb2ludCggbmV3QXJyYXkgKSApIHtcbiAgICAgICAgbmV3QXJyYXkucHVzaCgga2V5SWRlbnRpZmllciApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCBgdW5zdXBwb3J0ZWQga2V5SWRlbnRpZmllcjogJHtrZXlJZGVudGlmaWVyfWAgKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBhbmQgdXBkYXRlIHRoZSBrZXlzXG4gICAgdGhpcy52YWxpZGF0ZUtleXMoIG5ld0FycmF5ICkgJiYgdGhpcy51cGRhdGVLZXlzKCBuZXdBcnJheSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgbGVhZGluZyB6ZXJvcyBmcm9tIHRoZSBhcnJheS5cbiAgICovXG4gIHByaXZhdGUgcmVtb3ZlTGVhZGluZ1plcm8oIGFycmF5OiBLZXlJRFZhbHVlW10gKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLnZhbHVlUHJvcGVydHkuZ2V0KCkgPT09IDAgJiYgIXRoaXMuY29udGFpbnNGbG9hdGluZ1BvaW50KCBhcnJheSApICkge1xuICAgICAgYXJyYXkucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgc2V0IG9mIGtleXMgdG8gYSBzdHJpbmcuXG4gICAqL1xuICBwcml2YXRlIGtleXNUb1N0cmluZygga2V5czogS2V5SURWYWx1ZVtdICk6IHN0cmluZyB7XG5cbiAgICBsZXQgcmV0dXJuVmFsdWUgPSAnJztcbiAgICBsZXQgaSA9IDA7XG5cbiAgICAvLyB0aGUgcGx1cy9taW51cyBrZXkgKGlmIHByZXNlbnQpIHdpbGwgYmUgZmlyc3Qga2V5LCBhbmQgaW5kaWNhdGVzIHRoYXQgdGhlIG51bWJlciBpcyBuZWdhdGl2ZVxuICAgIGlmICgga2V5cy5sZW5ndGggPiAwICYmIGtleXNbIGkgXSA9PT0gS2V5SUQuUExVU19NSU5VUyApIHtcbiAgICAgIHJldHVyblZhbHVlID0gTkVHQVRJVkVfQ0hBUjtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvLyBwcm9jZXNzIHJlbWFpbmluZyBrZXlzXG4gICAgZm9yICggOyBpIDwga2V5cy5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgaWYgKCBrZXlzWyBpIF0gPT09IEtleUlELkRFQ0lNQUwgKSB7XG4gICAgICAgIHJldHVyblZhbHVlID0gcmV0dXJuVmFsdWUgKyBERUNJTUFMX0NIQVI7XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyB0aGUgcGx1cy9taW51cyBrZXkgc2hvdWxkIGJlIGZpcnN0IGlmIHByZXNlbnRcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0RpZ2l0KCBrZXlzWyBpIF0gKSwgJ3VuZXhwZWN0ZWQga2V5IHR5cGUnICk7XG4gICAgICAgIHJldHVyblZhbHVlID0gcmV0dXJuVmFsdWUgKyBrZXlzWyBpIF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIHRvIGEgbnVtYmVyLlxuICAgKi9cbiAgcHJpdmF0ZSBzdHJpbmdUb0ludGVnZXIoIHN0cmluZ1ZhbHVlOiBzdHJpbmcgKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgbGV0IHJldHVyblZhbHVlID0gbnVsbDtcblxuICAgIC8vIGlmIHN0cmluZ1ZhbHVlIGNvbnRhaW5zIHNvbWV0aGluZyBvdGhlciB0aGFuIGp1c3QgYSBtaW51cyBzaWduLi4uXG4gICAgaWYgKCBzdHJpbmdWYWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAmJiAhKCBzdHJpbmdWYWx1ZS5sZW5ndGggPT09IDEgJiYgc3RyaW5nVmFsdWUuc3RhcnRzV2l0aCggTkVHQVRJVkVfQ0hBUiApIClcbiAgICAgICAgICYmICggdGhpcy5nZXROdW1iZXJPZkRpZ2l0c0xlZnRPZk1hbnRpc3NhKCB0aGlzLmFjY3VtdWxhdGVkS2V5c1Byb3BlcnR5LmdldCgpICkgPiAwIHx8XG4gICAgICAgICAgICAgIHRoaXMuZ2V0TnVtYmVyT2ZEaWdpdHNSaWdodE9mTWFudGlzc2EoIHRoaXMuYWNjdW11bGF0ZWRLZXlzUHJvcGVydHkuZ2V0KCkgKSA+IDAgKSApIHtcblxuICAgICAgLy8gcmVwbGFjZSBVbmljb2RlIG1pbnVzIHdpdGggdmFuaWxsYSAnLScsIG9yIHBhcnNlSW50IHdpbGwgZmFpbCBmb3IgbmVnYXRpdmUgbnVtYmVyc1xuICAgICAgcmV0dXJuVmFsdWUgPSBOdW1iZXIoIHN0cmluZ1ZhbHVlLnJlcGxhY2UoIE5FR0FUSVZFX0NIQVIsICctJyApLnJlcGxhY2UoIERFQ0lNQUxfQ0hBUiwgJy4nICkgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggcmV0dXJuVmFsdWUgKSwgYGludmFsaWQgbnVtYmVyOiAke3JldHVyblZhbHVlfWAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGRpZ2l0cyB0byB0aGUgbGVmdCBvZiBtYW50aXNzYSBpbiB0aGUgYWNjdW11bGF0b3IuXG4gICAqL1xuICBwcml2YXRlIGdldE51bWJlck9mRGlnaXRzTGVmdE9mTWFudGlzc2EoIGtleXM6IEtleUlEVmFsdWVbXSApOiBudW1iZXIge1xuICAgIGxldCBudW1iZXJPZkRpZ2l0cyA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggdGhpcy5pc0RpZ2l0KCBrZXlzWyBpIF0gKSApIHtcbiAgICAgICAgbnVtYmVyT2ZEaWdpdHMrKztcbiAgICAgIH1cblxuICAgICAgaWYgKCBrZXlzWyBpIF0gPT09IEtleUlELkRFQ0lNQUwgKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVtYmVyT2ZEaWdpdHM7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGRpZ2l0cyB0byB0aGUgcmlnaHQgb2YgbWFudGlzc2EgaW4gdGhlIGFjY3VtdWxhdG9yLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXROdW1iZXJPZkRpZ2l0c1JpZ2h0T2ZNYW50aXNzYSgga2V5czogS2V5SURWYWx1ZVtdICk6IG51bWJlciB7XG4gICAgY29uc3QgZGVjaW1hbEtleUluZGV4ID0ga2V5cy5pbmRleE9mKCBLZXlJRC5ERUNJTUFMICk7XG4gICAgbGV0IG51bWJlck9mRGlnaXRzID0gMDtcbiAgICBpZiAoIGRlY2ltYWxLZXlJbmRleCA+PSAwICkge1xuICAgICAgZm9yICggbGV0IGkgPSBkZWNpbWFsS2V5SW5kZXg7IGkgPCBrZXlzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiAoIHRoaXMuaXNEaWdpdCgga2V5c1sgaSBdICkgKSB7XG4gICAgICAgICAgbnVtYmVyT2ZEaWdpdHMrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVtYmVyT2ZEaWdpdHM7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBpbiB0aGUgYWNjdW11bGF0b3IuXG4gICAqL1xuICBwcml2YXRlIGdldE51bWJlck9mRGlnaXRzKCBrZXlzOiBLZXlJRFZhbHVlW10gKTogbnVtYmVyIHtcbiAgICBsZXQgbnVtYmVyT2ZEaWdpdHMgPSAwO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiAoIHRoaXMuaXNEaWdpdCgga2V5c1sgaSBdICkgKSB7XG4gICAgICAgIG51bWJlck9mRGlnaXRzKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudW1iZXJPZkRpZ2l0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgZGlnaXRzIGluIHRoZSBhY2N1bXVsYXRvci5cbiAgICovXG4gIHByaXZhdGUgY29udGFpbnNGbG9hdGluZ1BvaW50KCBrZXlzOiBLZXlJRFZhbHVlW10gKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGtleXMuaW5jbHVkZXMoIEtleUlELkRFQ0lNQUwgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGNoYXJhY3RlciBpcyB2YWxpZCBkaWdpdCBvciBub3RcbiAgICovXG4gIHByaXZhdGUgaXNEaWdpdCggY2hhcjogS2V5SURWYWx1ZSApOiBib29sZWFuIHtcbiAgICByZXR1cm4gY2hhciA+PSAnMCcgJiYgY2hhciA8PSAnOSc7XG4gIH1cblxuICAvKipcbiAgICogY2xlYXIgdGhlIGFjY3VtdWxhdG9yXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY2xlYXIoKTogdm9pZCB7XG4gICAgc3VwZXIuY2xlYXIoKTtcbiAgICB0aGlzLnNldENsZWFyT25OZXh0S2V5UHJlc3MoIGZhbHNlICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLnZhbHVlUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIHRoaXMuc3RyaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ051bWJlckFjY3VtdWxhdG9yJywgTnVtYmVyQWNjdW11bGF0b3IgKTtcbmV4cG9ydCBkZWZhdWx0IE51bWJlckFjY3VtdWxhdG9yOyJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEZXJpdmVkU3RyaW5nUHJvcGVydHkiLCJvcHRpb25pemUiLCJUYW5kZW0iLCJOdWxsYWJsZUlPIiwiTnVtYmVySU8iLCJzY2VuZXJ5UGhldCIsIkFic3RyYWN0S2V5QWNjdW11bGF0b3IiLCJLZXlJRCIsIk5FR0FUSVZFX0NIQVIiLCJERUNJTUFMX0NIQVIiLCJNQVhfU0FGRV9JTlRFR0VSIiwiTnVtYmVyIiwiTUFYX0RJR0lUUyIsInRvU3RyaW5nIiwibGVuZ3RoIiwiTnVtYmVyQWNjdW11bGF0b3IiLCJoYW5kbGVLZXlQcmVzc2VkIiwia2V5SWRlbnRpZmllciIsIm5ld0FycmF5IiwiaGFuZGxlQ2xlYXJPbk5leHRLZXlQcmVzcyIsImlzRGlnaXQiLCJyZW1vdmVMZWFkaW5nWmVybyIsInB1c2giLCJCQUNLU1BBQ0UiLCJwb3AiLCJQTFVTX01JTlVTIiwic2hpZnQiLCJ1bnNoaWZ0IiwiREVDSU1BTCIsImNvbnRhaW5zRmxvYXRpbmdQb2ludCIsImFzc2VydCIsInZhbGlkYXRlS2V5cyIsInVwZGF0ZUtleXMiLCJhcnJheSIsInZhbHVlUHJvcGVydHkiLCJnZXQiLCJrZXlzVG9TdHJpbmciLCJrZXlzIiwicmV0dXJuVmFsdWUiLCJpIiwic3RyaW5nVG9JbnRlZ2VyIiwic3RyaW5nVmFsdWUiLCJzdGFydHNXaXRoIiwiZ2V0TnVtYmVyT2ZEaWdpdHNMZWZ0T2ZNYW50aXNzYSIsImFjY3VtdWxhdGVkS2V5c1Byb3BlcnR5IiwiZ2V0TnVtYmVyT2ZEaWdpdHNSaWdodE9mTWFudGlzc2EiLCJyZXBsYWNlIiwiaXNOYU4iLCJudW1iZXJPZkRpZ2l0cyIsImRlY2ltYWxLZXlJbmRleCIsImluZGV4T2YiLCJnZXROdW1iZXJPZkRpZ2l0cyIsImluY2x1ZGVzIiwiY2hhciIsImNsZWFyIiwic2V0Q2xlYXJPbk5leHRLZXlQcmVzcyIsImRpc3Bvc2UiLCJzdHJpbmdQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJtYXhEaWdpdHNSaWdodE9mTWFudGlzc2EiLCJtYXhEaWdpdHMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJ2YWxpZGF0b3JzIiwicHJvcG9zZWRLZXlzIiwiYWNjdW11bGF0ZWRLZXlzIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvVmFsdWVUeXBlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EscUJBQXFCLHNDQUFzQztBQUNsRSxPQUFPQywyQkFBMkIsNENBQTRDO0FBRTlFLE9BQU9DLGVBQWUscUNBQXFDO0FBRTNELE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLGdCQUFnQix5Q0FBeUM7QUFDaEUsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsT0FBT0MsaUJBQWlCLG9CQUFvQjtBQUM1QyxPQUFPQyw0QkFBNEIsOEJBQThCO0FBQ2pFLE9BQU9DLFdBQTJCLGFBQWE7QUFFL0MsWUFBWTtBQUNaLE1BQU1DLGdCQUFnQjtBQUN0QixNQUFNQyxlQUFlO0FBRXJCLHFIQUFxSDtBQUNySCxvRUFBb0U7QUFDcEUsTUFBTUMsbUJBQW1CQyxPQUFPRCxnQkFBZ0IsSUFBSTtBQUNwRCxNQUFNRSxhQUFhRixpQkFBaUJHLFFBQVEsR0FBR0MsTUFBTSxHQUFHO0FBU3hELElBQUEsQUFBTUMsb0JBQU4sTUFBTUEsMEJBQTBCVDtJQXlEOUI7OztHQUdDLEdBQ0QsQUFBZ0JVLGlCQUFrQkMsYUFBeUIsRUFB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