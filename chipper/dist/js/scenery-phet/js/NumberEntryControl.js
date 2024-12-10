// Copyright 2016-2024, University of Colorado Boulder
/**
 * A composite Scenery node that brings together a keypad and a box where the entered values are displayed.  Kind of
 * looks like a calculator, though it doesn't behave as one.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import merge from '../../phet-core/js/merge.js';
import { Node, Rectangle, Text } from '../../scenery/js/imports.js';
import NumberKeypad from './NumberKeypad.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
/**
 * @deprecated depends on NumberKeypad, which is deprecated. Modify this to use Keypad, or create something new.
 */ let NumberEntryControl = class NumberEntryControl extends Node {
    /**
   * Returns the numeric value of the currently entered number (0 for nothing entered).
   * @public
   *
   * @returns {number}
   */ getValue() {
        return this.value;
    }
    /**
   * Sets the currently entered number.
   * @public
   *
   * @param {number} number
   */ setValue(number) {
        assert && assert(typeof number === 'number');
        assert && assert(number % 1 === 0, 'Only supports integers currently');
        this.keypad.valueStringProperty.set(`${number}`);
    }
    /**
   * Clears the keypad, so nothing is entered
   * @public
   */ clear() {
        this.keypad.clear();
    }
    /**
   * Will pressing a key (except for the backspace point) clear the existing value?
   * @returns {boolean}
   * @public
   */ getClearOnNextKeyPress() {
        return this.keypad.getClearOnNextKeyPress();
    }
    get clearOnNextKeyPress() {
        return this.getClearOnNextKeyPress();
    }
    /**
   * Determines whether pressing a key (except for the backspace) will clear the existing value.
   * @public
   *
   * @param {boolean} clearOnNextKeyPress
   */ setClearOnNextKeyPress(clearOnNextKeyPress) {
        this.keypad.clearOnNextKeyPress = clearOnNextKeyPress;
    }
    set clearOnNextKeyPress(clearOnNextKeyPress) {
        this.setClearOnNextKeyPress(clearOnNextKeyPress);
    }
    /**
   * @param {Object} [options]
   */ constructor(options){
        assert && deprecationWarning('NumberEntryControl is deprecated, a rewrite is needed');
        options = merge({
            maxDigits: 5,
            readoutFont: new PhetFont(20)
        }, options);
        // options that depend on other options
        options = merge({
            // See NumberKeypad for details, if specifying this, make sure that it works with the provided maxDigits, as that
            // is used to create to display background.
            validateKey: NumberKeypad.validateMaxDigits({
                maxDigits: options.maxDigits
            })
        }, options);
        super();
        assert && assert(typeof options.maxDigits === 'number', 'maxDigits must be a number');
        // {NumberKeypad} Add the keypad.
        this.keypad = new NumberKeypad({
            validateKey: options.validateKey
        });
        this.addChild(this.keypad);
        // Add the number readout background.
        const testString = new Text('', {
            font: options.readoutFont
        });
        _.times(options.maxDigits, ()=>{
            testString.string = `${testString.string}9`;
        });
        const readoutBackground = new Rectangle(0, 0, testString.width * 1.2, testString.height * 1.2, 4, 4, {
            fill: 'white',
            stroke: '#777777',
            lineWidth: 1.5,
            centerX: this.keypad.width / 2
        });
        this.addChild(readoutBackground);
        // Add the digits.
        const digits = new Text('', {
            font: options.readoutFont
        });
        this.addChild(digits);
        this.value = 0; // @private
        this.keypad.valueStringProperty.link((valueString)=>{
            digits.string = valueString;
            digits.center = readoutBackground.center;
            this.value = Number(valueString);
        });
        // Layout
        this.keypad.top = readoutBackground.bottom + 10;
        // Pass options through to parent class.
        this.mutate(options);
    }
};
sceneryPhet.register('NumberEntryControl', NumberEntryControl);
export default NumberEntryControl;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJFbnRyeUNvbnRyb2wuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBjb21wb3NpdGUgU2NlbmVyeSBub2RlIHRoYXQgYnJpbmdzIHRvZ2V0aGVyIGEga2V5cGFkIGFuZCBhIGJveCB3aGVyZSB0aGUgZW50ZXJlZCB2YWx1ZXMgYXJlIGRpc3BsYXllZC4gIEtpbmQgb2ZcbiAqIGxvb2tzIGxpa2UgYSBjYWxjdWxhdG9yLCB0aG91Z2ggaXQgZG9lc24ndCBiZWhhdmUgYXMgb25lLlxuICpcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWZcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZGVwcmVjYXRpb25XYXJuaW5nIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kZXByZWNhdGlvbldhcm5pbmcuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IE51bWJlcktleXBhZCBmcm9tICcuL051bWJlcktleXBhZC5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgZGVwZW5kcyBvbiBOdW1iZXJLZXlwYWQsIHdoaWNoIGlzIGRlcHJlY2F0ZWQuIE1vZGlmeSB0aGlzIHRvIHVzZSBLZXlwYWQsIG9yIGNyZWF0ZSBzb21ldGhpbmcgbmV3LlxuICovXG5jbGFzcyBOdW1iZXJFbnRyeUNvbnRyb2wgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XG4gICAgYXNzZXJ0ICYmIGRlcHJlY2F0aW9uV2FybmluZyggJ051bWJlckVudHJ5Q29udHJvbCBpcyBkZXByZWNhdGVkLCBhIHJld3JpdGUgaXMgbmVlZGVkJyApO1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG4gICAgICBtYXhEaWdpdHM6IDUsIC8vIFVzZWQgZm9yIHNwYWNpbmcgb2YgdGhlIHJlYWRvdXQsIGFuZCBmb3IgdGhlIGRlZmF1bHQgdmFsaWRhdGVLZXkuXG4gICAgICByZWFkb3V0Rm9udDogbmV3IFBoZXRGb250KCAyMCApXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgLy8gb3B0aW9ucyB0aGF0IGRlcGVuZCBvbiBvdGhlciBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG5cbiAgICAgIC8vIFNlZSBOdW1iZXJLZXlwYWQgZm9yIGRldGFpbHMsIGlmIHNwZWNpZnlpbmcgdGhpcywgbWFrZSBzdXJlIHRoYXQgaXQgd29ya3Mgd2l0aCB0aGUgcHJvdmlkZWQgbWF4RGlnaXRzLCBhcyB0aGF0XG4gICAgICAvLyBpcyB1c2VkIHRvIGNyZWF0ZSB0byBkaXNwbGF5IGJhY2tncm91bmQuXG4gICAgICB2YWxpZGF0ZUtleTogTnVtYmVyS2V5cGFkLnZhbGlkYXRlTWF4RGlnaXRzKCB7IG1heERpZ2l0czogb3B0aW9ucy5tYXhEaWdpdHMgfSApXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLm1heERpZ2l0cyA9PT0gJ251bWJlcicsICdtYXhEaWdpdHMgbXVzdCBiZSBhIG51bWJlcicgKTtcblxuICAgIC8vIHtOdW1iZXJLZXlwYWR9IEFkZCB0aGUga2V5cGFkLlxuICAgIHRoaXMua2V5cGFkID0gbmV3IE51bWJlcktleXBhZCgge1xuICAgICAgdmFsaWRhdGVLZXk6IG9wdGlvbnMudmFsaWRhdGVLZXlcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5rZXlwYWQgKTtcblxuICAgIC8vIEFkZCB0aGUgbnVtYmVyIHJlYWRvdXQgYmFja2dyb3VuZC5cbiAgICBjb25zdCB0ZXN0U3RyaW5nID0gbmV3IFRleHQoICcnLCB7IGZvbnQ6IG9wdGlvbnMucmVhZG91dEZvbnQgfSApO1xuICAgIF8udGltZXMoIG9wdGlvbnMubWF4RGlnaXRzLCAoKSA9PiB7IHRlc3RTdHJpbmcuc3RyaW5nID0gYCR7dGVzdFN0cmluZy5zdHJpbmd9OWA7IH0gKTtcbiAgICBjb25zdCByZWFkb3V0QmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIHRlc3RTdHJpbmcud2lkdGggKiAxLjIsIHRlc3RTdHJpbmcuaGVpZ2h0ICogMS4yLCA0LCA0LCB7XG4gICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgc3Ryb2tlOiAnIzc3Nzc3NycsXG4gICAgICBsaW5lV2lkdGg6IDEuNSxcbiAgICAgIGNlbnRlclg6IHRoaXMua2V5cGFkLndpZHRoIC8gMlxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCByZWFkb3V0QmFja2dyb3VuZCApO1xuXG4gICAgLy8gQWRkIHRoZSBkaWdpdHMuXG4gICAgY29uc3QgZGlnaXRzID0gbmV3IFRleHQoICcnLCB7IGZvbnQ6IG9wdGlvbnMucmVhZG91dEZvbnQgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGRpZ2l0cyApO1xuICAgIHRoaXMudmFsdWUgPSAwOyAvLyBAcHJpdmF0ZVxuICAgIHRoaXMua2V5cGFkLnZhbHVlU3RyaW5nUHJvcGVydHkubGluayggdmFsdWVTdHJpbmcgPT4ge1xuICAgICAgZGlnaXRzLnN0cmluZyA9IHZhbHVlU3RyaW5nO1xuICAgICAgZGlnaXRzLmNlbnRlciA9IHJlYWRvdXRCYWNrZ3JvdW5kLmNlbnRlcjtcbiAgICAgIHRoaXMudmFsdWUgPSBOdW1iZXIoIHZhbHVlU3RyaW5nICk7XG4gICAgfSApO1xuXG4gICAgLy8gTGF5b3V0XG4gICAgdGhpcy5rZXlwYWQudG9wID0gcmVhZG91dEJhY2tncm91bmQuYm90dG9tICsgMTA7XG5cbiAgICAvLyBQYXNzIG9wdGlvbnMgdGhyb3VnaCB0byBwYXJlbnQgY2xhc3MuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBudW1lcmljIHZhbHVlIG9mIHRoZSBjdXJyZW50bHkgZW50ZXJlZCBudW1iZXIgKDAgZm9yIG5vdGhpbmcgZW50ZXJlZCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldFZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGN1cnJlbnRseSBlbnRlcmVkIG51bWJlci5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyXG4gICAqL1xuICBzZXRWYWx1ZSggbnVtYmVyICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBudW1iZXIgPT09ICdudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVyICUgMSA9PT0gMCwgJ09ubHkgc3VwcG9ydHMgaW50ZWdlcnMgY3VycmVudGx5JyApO1xuXG4gICAgdGhpcy5rZXlwYWQudmFsdWVTdHJpbmdQcm9wZXJ0eS5zZXQoIGAke251bWJlcn1gICk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIHRoZSBrZXlwYWQsIHNvIG5vdGhpbmcgaXMgZW50ZXJlZFxuICAgKiBAcHVibGljXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLmtleXBhZC5jbGVhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdpbGwgcHJlc3NpbmcgYSBrZXkgKGV4Y2VwdCBmb3IgdGhlIGJhY2tzcGFjZSBwb2ludCkgY2xlYXIgdGhlIGV4aXN0aW5nIHZhbHVlP1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZ2V0Q2xlYXJPbk5leHRLZXlQcmVzcygpIHtcbiAgICByZXR1cm4gdGhpcy5rZXlwYWQuZ2V0Q2xlYXJPbk5leHRLZXlQcmVzcygpO1xuICB9XG5cbiAgZ2V0IGNsZWFyT25OZXh0S2V5UHJlc3MoKSB7IHJldHVybiB0aGlzLmdldENsZWFyT25OZXh0S2V5UHJlc3MoKTsgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgcHJlc3NpbmcgYSBrZXkgKGV4Y2VwdCBmb3IgdGhlIGJhY2tzcGFjZSkgd2lsbCBjbGVhciB0aGUgZXhpc3RpbmcgdmFsdWUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBjbGVhck9uTmV4dEtleVByZXNzXG4gICAqL1xuICBzZXRDbGVhck9uTmV4dEtleVByZXNzKCBjbGVhck9uTmV4dEtleVByZXNzICkge1xuICAgIHRoaXMua2V5cGFkLmNsZWFyT25OZXh0S2V5UHJlc3MgPSBjbGVhck9uTmV4dEtleVByZXNzO1xuICB9XG5cbiAgc2V0IGNsZWFyT25OZXh0S2V5UHJlc3MoIGNsZWFyT25OZXh0S2V5UHJlc3MgKSB7IHRoaXMuc2V0Q2xlYXJPbk5leHRLZXlQcmVzcyggY2xlYXJPbk5leHRLZXlQcmVzcyApOyB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTnVtYmVyRW50cnlDb250cm9sJywgTnVtYmVyRW50cnlDb250cm9sICk7XG5leHBvcnQgZGVmYXVsdCBOdW1iZXJFbnRyeUNvbnRyb2w7Il0sIm5hbWVzIjpbImRlcHJlY2F0aW9uV2FybmluZyIsIm1lcmdlIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJOdW1iZXJLZXlwYWQiLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiTnVtYmVyRW50cnlDb250cm9sIiwiZ2V0VmFsdWUiLCJ2YWx1ZSIsInNldFZhbHVlIiwibnVtYmVyIiwiYXNzZXJ0Iiwia2V5cGFkIiwidmFsdWVTdHJpbmdQcm9wZXJ0eSIsInNldCIsImNsZWFyIiwiZ2V0Q2xlYXJPbk5leHRLZXlQcmVzcyIsImNsZWFyT25OZXh0S2V5UHJlc3MiLCJzZXRDbGVhck9uTmV4dEtleVByZXNzIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibWF4RGlnaXRzIiwicmVhZG91dEZvbnQiLCJ2YWxpZGF0ZUtleSIsInZhbGlkYXRlTWF4RGlnaXRzIiwiYWRkQ2hpbGQiLCJ0ZXN0U3RyaW5nIiwiZm9udCIsIl8iLCJ0aW1lcyIsInN0cmluZyIsInJlYWRvdXRCYWNrZ3JvdW5kIiwid2lkdGgiLCJoZWlnaHQiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiY2VudGVyWCIsImRpZ2l0cyIsImxpbmsiLCJ2YWx1ZVN0cmluZyIsImNlbnRlciIsIk51bWJlciIsInRvcCIsImJvdHRvbSIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUVELE9BQU9BLHdCQUF3QiwyQ0FBMkM7QUFDMUUsT0FBT0MsV0FBVyw4QkFBOEI7QUFDaEQsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSw4QkFBOEI7QUFDcEUsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQUM3QyxPQUFPQyxjQUFjLGdCQUFnQjtBQUNyQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDOztDQUVDLEdBQ0QsSUFBQSxBQUFNQyxxQkFBTixNQUFNQSwyQkFBMkJOO0lBMkQvQjs7Ozs7R0FLQyxHQUNETyxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUNDLEtBQUs7SUFDbkI7SUFFQTs7Ozs7R0FLQyxHQUNEQyxTQUFVQyxNQUFNLEVBQUc7UUFDakJDLFVBQVVBLE9BQVEsT0FBT0QsV0FBVztRQUNwQ0MsVUFBVUEsT0FBUUQsU0FBUyxNQUFNLEdBQUc7UUFFcEMsSUFBSSxDQUFDRSxNQUFNLENBQUNDLG1C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