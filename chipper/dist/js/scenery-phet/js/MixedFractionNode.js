// Copyright 2019-2024, University of Colorado Boulder
/**
 * Capable of displaying a mixed-fraction display with three spots that can be filled with numbers (numerator,
 * denominator, and a whole number on the left).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../dot/js/Bounds2.js';
import merge from '../../phet-core/js/merge.js';
import { AlignBox, HBox, Line, Text, VBox } from '../../scenery/js/imports.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
let MixedFractionNode = class MixedFractionNode extends HBox {
    /**
   * Updates the view of the fraction when something changes.
   * @private
   */ update() {
        const hasWhole = this._whole !== null;
        const hasNumerator = this._numerator !== null;
        const hasDenominator = this._denominator !== null;
        this.children = [
            ...hasWhole ? [
                this.wholeContainer
            ] : [],
            ...hasNumerator || hasDenominator ? [
                this.vbox
            ] : []
        ];
        this.wholeText.string = hasWhole ? this._whole : ' ';
        this.numeratorText.string = hasNumerator ? this._numerator : ' ';
        this.denominatorText.string = hasDenominator ? this._denominator : ' ';
        this.vinculumNode.x1 = -this._vinculumExtension;
        this.vinculumNode.x2 = Math.max(this.numeratorContainer.width, this.denominatorContainer.width) + 2 + this._vinculumExtension;
    }
    /**
   * Sets the whole-number part of the mixed fraction.
   * @public
   *
   * @param {number|null} value
   */ set whole(value) {
        if (this._whole !== value) {
            this._whole = value;
            this.update();
        }
    }
    /**
   * Returns the current whole-number part of the mixed fraction.
   * @public
   *
   * @returns {number|null}
   */ get whole() {
        return this._whole;
    }
    /**
   * Sets the numerator part of the mixed fraction.
   * @public
   *
   * @param {number|null} value
   */ set numerator(value) {
        if (this._numerator !== value) {
            this._numerator = value;
            this.update();
        }
    }
    /**
   * Returns the current numerator part of the mixed fraction.
   * @public
   *
   * @returns {number|null}
   */ get numerator() {
        return this._numerator;
    }
    /**
   * Sets the denominator part of the mixed fraction.
   * @public
   *
   * @param {number|null} value
   */ set denominator(value) {
        if (this._denominator !== value) {
            this._denominator = value;
            this.update();
        }
    }
    /**
   * Returns the current denominator part of the mixed fraction.
   * @public
   *
   * @returns {number|null}
   */ get denominator() {
        return this._denominator;
    }
    /**
   * @param {Object} [options]
   */ constructor(options){
        super({
            spacing: 5
        });
        options = merge({
            // {number|null} - Main values for the fraction (can also be changed with setters). The spot will be empty if
            // null is the given value.
            whole: null,
            numerator: null,
            denominator: null,
            // {number|null} - If provided, it will ensure that spacing is provided from 0 up to the specified number for
            // that slot (e.g. if given maxNumerator:10, it will check the layout size for 0,1,2,...,10 and ensure that
            // changing the numerator between those values will not change the layout).
            maxWhole: null,
            maxNumerator: null,
            maxDenominator: null,
            // {ColorDef}
            wholeFill: 'black',
            numeratorFill: 'black',
            denominatorFill: 'black',
            separatorFill: 'black',
            // {Font} - Font for the whole number.
            wholeNumberFont: new PhetFont(50),
            // {Font} - Font for the numbers that appear in the fractional part, meaning the numerator and denominator.
            fractionNumbersFont: new PhetFont(30),
            // {number} - line width of the vinculum
            vinculumLineWidth: 2,
            // {number} - How far past the numbers' bounds that the vinculum should extend.
            vinculumExtension: 0,
            // {string} - The lineCap of the vinculum
            vinculumLineCap: 'butt'
        }, options);
        // @private {Text}
        this.wholeText = new Text('1', {
            font: options.wholeNumberFont,
            fill: options.wholeFill
        });
        this.numeratorText = new Text('1', {
            font: options.fractionNumbersFont,
            fill: options.numeratorFill
        });
        this.denominatorText = new Text('1', {
            font: options.fractionNumbersFont,
            fill: options.denominatorFill
        });
        const maxTextBounds = (textNode, maxNumber)=>{
            return _.reduce(_.range(0, maxNumber + 1), (bounds, number)=>{
                textNode.string = number;
                return bounds.union(textNode.bounds);
            }, Bounds2.NOTHING);
        };
        // @private {Node}
        this.wholeContainer = options.maxWhole ? new AlignBox(this.wholeText, {
            alignBounds: maxTextBounds(this.wholeText, options.maxWhole)
        }) : this.wholeText;
        this.numeratorContainer = options.maxNumerator ? new AlignBox(this.numeratorText, {
            alignBounds: maxTextBounds(this.numeratorText, options.maxNumerator)
        }) : this.numeratorText;
        this.denominatorContainer = options.maxDenominator ? new AlignBox(this.denominatorText, {
            alignBounds: maxTextBounds(this.denominatorText, options.maxDenominator)
        }) : this.denominatorText;
        // @private {Line}
        this.vinculumNode = new Line(0, 0, 10, 0, {
            stroke: options.separatorFill,
            lineWidth: options.vinculumLineWidth,
            lineCap: options.vinculumLineCap
        });
        // @private {VBox}
        this.vbox = new VBox({
            children: [
                this.numeratorContainer,
                this.vinculumNode,
                this.denominatorContainer
            ],
            spacing: 1
        });
        // @private {number|null}
        this._whole = options.whole;
        this._numerator = options.numerator;
        this._denominator = options.denominator;
        // @private {number}
        this._vinculumExtension = options.vinculumExtension;
        this.update();
        this.mutate(options);
    }
};
sceneryPhet.register('MixedFractionNode', MixedFractionNode);
export default MixedFractionNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NaXhlZEZyYWN0aW9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDYXBhYmxlIG9mIGRpc3BsYXlpbmcgYSBtaXhlZC1mcmFjdGlvbiBkaXNwbGF5IHdpdGggdGhyZWUgc3BvdHMgdGhhdCBjYW4gYmUgZmlsbGVkIHdpdGggbnVtYmVycyAobnVtZXJhdG9yLFxuICogZGVub21pbmF0b3IsIGFuZCBhIHdob2xlIG51bWJlciBvbiB0aGUgbGVmdCkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IHsgQWxpZ25Cb3gsIEhCb3gsIExpbmUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG5jbGFzcyBNaXhlZEZyYWN0aW9uTm9kZSBleHRlbmRzIEhCb3gge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIHtcbiAgICAgIHNwYWNpbmc6IDVcbiAgICB9ICk7XG5cbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcbiAgICAgIC8vIHtudW1iZXJ8bnVsbH0gLSBNYWluIHZhbHVlcyBmb3IgdGhlIGZyYWN0aW9uIChjYW4gYWxzbyBiZSBjaGFuZ2VkIHdpdGggc2V0dGVycykuIFRoZSBzcG90IHdpbGwgYmUgZW1wdHkgaWZcbiAgICAgIC8vIG51bGwgaXMgdGhlIGdpdmVuIHZhbHVlLlxuICAgICAgd2hvbGU6IG51bGwsXG4gICAgICBudW1lcmF0b3I6IG51bGwsXG4gICAgICBkZW5vbWluYXRvcjogbnVsbCxcblxuICAgICAgLy8ge251bWJlcnxudWxsfSAtIElmIHByb3ZpZGVkLCBpdCB3aWxsIGVuc3VyZSB0aGF0IHNwYWNpbmcgaXMgcHJvdmlkZWQgZnJvbSAwIHVwIHRvIHRoZSBzcGVjaWZpZWQgbnVtYmVyIGZvclxuICAgICAgLy8gdGhhdCBzbG90IChlLmcuIGlmIGdpdmVuIG1heE51bWVyYXRvcjoxMCwgaXQgd2lsbCBjaGVjayB0aGUgbGF5b3V0IHNpemUgZm9yIDAsMSwyLC4uLiwxMCBhbmQgZW5zdXJlIHRoYXRcbiAgICAgIC8vIGNoYW5naW5nIHRoZSBudW1lcmF0b3IgYmV0d2VlbiB0aG9zZSB2YWx1ZXMgd2lsbCBub3QgY2hhbmdlIHRoZSBsYXlvdXQpLlxuICAgICAgbWF4V2hvbGU6IG51bGwsXG4gICAgICBtYXhOdW1lcmF0b3I6IG51bGwsXG4gICAgICBtYXhEZW5vbWluYXRvcjogbnVsbCxcblxuICAgICAgLy8ge0NvbG9yRGVmfVxuICAgICAgd2hvbGVGaWxsOiAnYmxhY2snLFxuICAgICAgbnVtZXJhdG9yRmlsbDogJ2JsYWNrJyxcbiAgICAgIGRlbm9taW5hdG9yRmlsbDogJ2JsYWNrJyxcbiAgICAgIHNlcGFyYXRvckZpbGw6ICdibGFjaycsXG5cbiAgICAgIC8vIHtGb250fSAtIEZvbnQgZm9yIHRoZSB3aG9sZSBudW1iZXIuXG4gICAgICB3aG9sZU51bWJlckZvbnQ6IG5ldyBQaGV0Rm9udCggNTAgKSxcblxuICAgICAgLy8ge0ZvbnR9IC0gRm9udCBmb3IgdGhlIG51bWJlcnMgdGhhdCBhcHBlYXIgaW4gdGhlIGZyYWN0aW9uYWwgcGFydCwgbWVhbmluZyB0aGUgbnVtZXJhdG9yIGFuZCBkZW5vbWluYXRvci5cbiAgICAgIGZyYWN0aW9uTnVtYmVyc0ZvbnQ6IG5ldyBQaGV0Rm9udCggMzAgKSxcblxuICAgICAgLy8ge251bWJlcn0gLSBsaW5lIHdpZHRoIG9mIHRoZSB2aW5jdWx1bVxuICAgICAgdmluY3VsdW1MaW5lV2lkdGg6IDIsXG5cbiAgICAgIC8vIHtudW1iZXJ9IC0gSG93IGZhciBwYXN0IHRoZSBudW1iZXJzJyBib3VuZHMgdGhhdCB0aGUgdmluY3VsdW0gc2hvdWxkIGV4dGVuZC5cbiAgICAgIHZpbmN1bHVtRXh0ZW5zaW9uOiAwLFxuXG4gICAgICAvLyB7c3RyaW5nfSAtIFRoZSBsaW5lQ2FwIG9mIHRoZSB2aW5jdWx1bVxuICAgICAgdmluY3VsdW1MaW5lQ2FwOiAnYnV0dCdcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7VGV4dH1cbiAgICB0aGlzLndob2xlVGV4dCA9IG5ldyBUZXh0KCAnMScsIHtcbiAgICAgIGZvbnQ6IG9wdGlvbnMud2hvbGVOdW1iZXJGb250LFxuICAgICAgZmlsbDogb3B0aW9ucy53aG9sZUZpbGxcbiAgICB9ICk7XG4gICAgdGhpcy5udW1lcmF0b3JUZXh0ID0gbmV3IFRleHQoICcxJywge1xuICAgICAgZm9udDogb3B0aW9ucy5mcmFjdGlvbk51bWJlcnNGb250LFxuICAgICAgZmlsbDogb3B0aW9ucy5udW1lcmF0b3JGaWxsXG4gICAgfSApO1xuICAgIHRoaXMuZGVub21pbmF0b3JUZXh0ID0gbmV3IFRleHQoICcxJywge1xuICAgICAgZm9udDogb3B0aW9ucy5mcmFjdGlvbk51bWJlcnNGb250LFxuICAgICAgZmlsbDogb3B0aW9ucy5kZW5vbWluYXRvckZpbGxcbiAgICB9ICk7XG5cbiAgICBjb25zdCBtYXhUZXh0Qm91bmRzID0gKCB0ZXh0Tm9kZSwgbWF4TnVtYmVyICkgPT4ge1xuICAgICAgcmV0dXJuIF8ucmVkdWNlKCBfLnJhbmdlKCAwLCBtYXhOdW1iZXIgKyAxICksICggYm91bmRzLCBudW1iZXIgKSA9PiB7XG4gICAgICAgIHRleHROb2RlLnN0cmluZyA9IG51bWJlcjtcbiAgICAgICAgcmV0dXJuIGJvdW5kcy51bmlvbiggdGV4dE5vZGUuYm91bmRzICk7XG4gICAgICB9LCBCb3VuZHMyLk5PVEhJTkcgKTtcbiAgICB9O1xuXG4gICAgLy8gQHByaXZhdGUge05vZGV9XG4gICAgdGhpcy53aG9sZUNvbnRhaW5lciA9IG9wdGlvbnMubWF4V2hvbGUgPyBuZXcgQWxpZ25Cb3goIHRoaXMud2hvbGVUZXh0LCB7XG4gICAgICBhbGlnbkJvdW5kczogbWF4VGV4dEJvdW5kcyggdGhpcy53aG9sZVRleHQsIG9wdGlvbnMubWF4V2hvbGUgKVxuICAgIH0gKSA6IHRoaXMud2hvbGVUZXh0O1xuICAgIHRoaXMubnVtZXJhdG9yQ29udGFpbmVyID0gb3B0aW9ucy5tYXhOdW1lcmF0b3IgPyBuZXcgQWxpZ25Cb3goIHRoaXMubnVtZXJhdG9yVGV4dCwge1xuICAgICAgYWxpZ25Cb3VuZHM6IG1heFRleHRCb3VuZHMoIHRoaXMubnVtZXJhdG9yVGV4dCwgb3B0aW9ucy5tYXhOdW1lcmF0b3IgKVxuICAgIH0gKSA6IHRoaXMubnVtZXJhdG9yVGV4dDtcbiAgICB0aGlzLmRlbm9taW5hdG9yQ29udGFpbmVyID0gb3B0aW9ucy5tYXhEZW5vbWluYXRvciA/IG5ldyBBbGlnbkJveCggdGhpcy5kZW5vbWluYXRvclRleHQsIHtcbiAgICAgIGFsaWduQm91bmRzOiBtYXhUZXh0Qm91bmRzKCB0aGlzLmRlbm9taW5hdG9yVGV4dCwgb3B0aW9ucy5tYXhEZW5vbWluYXRvciApXG4gICAgfSApIDogdGhpcy5kZW5vbWluYXRvclRleHQ7XG5cbiAgICAvLyBAcHJpdmF0ZSB7TGluZX1cbiAgICB0aGlzLnZpbmN1bHVtTm9kZSA9IG5ldyBMaW5lKCAwLCAwLCAxMCwgMCwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLnNlcGFyYXRvckZpbGwsXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMudmluY3VsdW1MaW5lV2lkdGgsXG4gICAgICBsaW5lQ2FwOiBvcHRpb25zLnZpbmN1bHVtTGluZUNhcFxuICAgIH0gKTtcblxuICAgIC8vIEBwcml2YXRlIHtWQm94fVxuICAgIHRoaXMudmJveCA9IG5ldyBWQm94KCB7XG4gICAgICBjaGlsZHJlbjogWyB0aGlzLm51bWVyYXRvckNvbnRhaW5lciwgdGhpcy52aW5jdWx1bU5vZGUsIHRoaXMuZGVub21pbmF0b3JDb250YWluZXIgXSxcbiAgICAgIHNwYWNpbmc6IDFcbiAgICB9ICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfG51bGx9XG4gICAgdGhpcy5fd2hvbGUgPSBvcHRpb25zLndob2xlO1xuICAgIHRoaXMuX251bWVyYXRvciA9IG9wdGlvbnMubnVtZXJhdG9yO1xuICAgIHRoaXMuX2Rlbm9taW5hdG9yID0gb3B0aW9ucy5kZW5vbWluYXRvcjtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9XG4gICAgdGhpcy5fdmluY3VsdW1FeHRlbnNpb24gPSBvcHRpb25zLnZpbmN1bHVtRXh0ZW5zaW9uO1xuXG4gICAgdGhpcy51cGRhdGUoKTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgdmlldyBvZiB0aGUgZnJhY3Rpb24gd2hlbiBzb21ldGhpbmcgY2hhbmdlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZSgpIHtcbiAgICBjb25zdCBoYXNXaG9sZSA9IHRoaXMuX3dob2xlICE9PSBudWxsO1xuICAgIGNvbnN0IGhhc051bWVyYXRvciA9IHRoaXMuX251bWVyYXRvciAhPT0gbnVsbDtcbiAgICBjb25zdCBoYXNEZW5vbWluYXRvciA9IHRoaXMuX2Rlbm9taW5hdG9yICE9PSBudWxsO1xuXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcbiAgICAgIC4uLiggaGFzV2hvbGUgPyBbIHRoaXMud2hvbGVDb250YWluZXIgXSA6IFtdICksXG4gICAgICAuLi4oIGhhc051bWVyYXRvciB8fCBoYXNEZW5vbWluYXRvciA/IFsgdGhpcy52Ym94IF0gOiBbXSApXG4gICAgXTtcbiAgICB0aGlzLndob2xlVGV4dC5zdHJpbmcgPSBoYXNXaG9sZSA/IHRoaXMuX3dob2xlIDogJyAnO1xuICAgIHRoaXMubnVtZXJhdG9yVGV4dC5zdHJpbmcgPSBoYXNOdW1lcmF0b3IgPyB0aGlzLl9udW1lcmF0b3IgOiAnICc7XG4gICAgdGhpcy5kZW5vbWluYXRvclRleHQuc3RyaW5nID0gaGFzRGVub21pbmF0b3IgPyB0aGlzLl9kZW5vbWluYXRvciA6ICcgJztcblxuICAgIHRoaXMudmluY3VsdW1Ob2RlLngxID0gLXRoaXMuX3ZpbmN1bHVtRXh0ZW5zaW9uO1xuICAgIHRoaXMudmluY3VsdW1Ob2RlLngyID0gTWF0aC5tYXgoIHRoaXMubnVtZXJhdG9yQ29udGFpbmVyLndpZHRoLCB0aGlzLmRlbm9taW5hdG9yQ29udGFpbmVyLndpZHRoICkgKyAyICsgdGhpcy5fdmluY3VsdW1FeHRlbnNpb247XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgd2hvbGUtbnVtYmVyIHBhcnQgb2YgdGhlIG1peGVkIGZyYWN0aW9uLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfG51bGx9IHZhbHVlXG4gICAqL1xuICBzZXQgd2hvbGUoIHZhbHVlICkge1xuICAgIGlmICggdGhpcy5fd2hvbGUgIT09IHZhbHVlICkge1xuICAgICAgdGhpcy5fd2hvbGUgPSB2YWx1ZTtcblxuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCB3aG9sZS1udW1iZXIgcGFydCBvZiB0aGUgbWl4ZWQgZnJhY3Rpb24uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcnxudWxsfVxuICAgKi9cbiAgZ2V0IHdob2xlKCkge1xuICAgIHJldHVybiB0aGlzLl93aG9sZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBudW1lcmF0b3IgcGFydCBvZiB0aGUgbWl4ZWQgZnJhY3Rpb24uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ8bnVsbH0gdmFsdWVcbiAgICovXG4gIHNldCBudW1lcmF0b3IoIHZhbHVlICkge1xuICAgIGlmICggdGhpcy5fbnVtZXJhdG9yICE9PSB2YWx1ZSApIHtcbiAgICAgIHRoaXMuX251bWVyYXRvciA9IHZhbHVlO1xuXG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IG51bWVyYXRvciBwYXJ0IG9mIHRoZSBtaXhlZCBmcmFjdGlvbi5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfG51bGx9XG4gICAqL1xuICBnZXQgbnVtZXJhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9udW1lcmF0b3I7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVub21pbmF0b3IgcGFydCBvZiB0aGUgbWl4ZWQgZnJhY3Rpb24uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ8bnVsbH0gdmFsdWVcbiAgICovXG4gIHNldCBkZW5vbWluYXRvciggdmFsdWUgKSB7XG4gICAgaWYgKCB0aGlzLl9kZW5vbWluYXRvciAhPT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLl9kZW5vbWluYXRvciA9IHZhbHVlO1xuXG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGRlbm9taW5hdG9yIHBhcnQgb2YgdGhlIG1peGVkIGZyYWN0aW9uLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ8bnVsbH1cbiAgICovXG4gIGdldCBkZW5vbWluYXRvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVub21pbmF0b3I7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdNaXhlZEZyYWN0aW9uTm9kZScsIE1peGVkRnJhY3Rpb25Ob2RlICk7XG5leHBvcnQgZGVmYXVsdCBNaXhlZEZyYWN0aW9uTm9kZTsiXSwibmFtZXMiOlsiQm91bmRzMiIsIm1lcmdlIiwiQWxpZ25Cb3giLCJIQm94IiwiTGluZSIsIlRleHQiLCJWQm94IiwiUGhldEZvbnQiLCJzY2VuZXJ5UGhldCIsIk1peGVkRnJhY3Rpb25Ob2RlIiwidXBkYXRlIiwiaGFzV2hvbGUiLCJfd2hvbGUiLCJoYXNOdW1lcmF0b3IiLCJfbnVtZXJhdG9yIiwiaGFzRGVub21pbmF0b3IiLCJfZGVub21pbmF0b3IiLCJjaGlsZHJlbiIsIndob2xlQ29udGFpbmVyIiwidmJveCIsIndob2xlVGV4dCIsInN0cmluZyIsIm51bWVyYXRvclRleHQiLCJkZW5vbWluYXRvclRleHQiLCJ2aW5jdWx1bU5vZGUiLCJ4MSIsIl92aW5jdWx1bUV4dGVuc2lvbiIsIngyIiwiTWF0aCIsIm1heCIsIm51bWVyYXRvckNvbnRhaW5lciIsIndpZHRoIiwiZGVub21pbmF0b3JDb250YWluZXIiLCJ3aG9sZSIsInZhbHVlIiwibnVtZXJhdG9yIiwiZGVub21pbmF0b3IiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJzcGFjaW5nIiwibWF4V2hvbGUiLCJtYXhOdW1lcmF0b3IiLCJtYXhEZW5vbWluYXRvciIsIndob2xlRmlsbCIsIm51bWVyYXRvckZpbGwiLCJkZW5vbWluYXRvckZpbGwiLCJzZXBhcmF0b3JGaWxsIiwid2hvbGVOdW1iZXJGb250IiwiZnJhY3Rpb25OdW1iZXJzRm9udCIsInZpbmN1bHVtTGluZVdpZHRoIiwidmluY3VsdW1FeHRlbnNpb24iLCJ2aW5jdWx1bUxpbmVDYXAiLCJmb250IiwiZmlsbCIsIm1heFRleHRCb3VuZHMiLCJ0ZXh0Tm9kZSIsIm1heE51bWJlciIsIl8iLCJyZWR1Y2UiLCJyYW5nZSIsImJvdW5kcyIsIm51bWJlciIsInVuaW9uIiwiTk9USElORyIsImFsaWduQm91bmRzIiwic3Ryb2tlIiwibGluZVdpZHRoIiwibGluZUNhcCIsIm11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