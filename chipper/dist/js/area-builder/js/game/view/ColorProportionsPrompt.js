// Copyright 2014-2022, University of Colorado Boulder
/**
 * A Scenery node that consists of two fractions and two color patches, used when prompting the user to create a shape
 * that is comprised to two different colors.
 *
 * @author John Blanco
 */ import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import FractionNode from './FractionNode.js';
// constants
const MULTI_LINE_SPACING = 5; // Empirically determined to look good
const SINGLE_LINE_SPACING = 12; // Empirically determined to look good
const PROMPT_TO_COLOR_SPACING = 4; // Empirically determined to look good
let ColorProportionsPrompt = class ColorProportionsPrompt extends Node {
    set color1(color) {
        this.color1Patch.fill = color;
    }
    get color1() {
        return this.color1Patch.fill;
    }
    set color2(color) {
        this.color2Patch.fill = color;
    }
    get color2() {
        return this.color2Patch.fill;
    }
    set color1Proportion(color1Proportion) {
        this.color1FractionNode.fraction = color1Proportion;
        this.color2FractionNode.fraction = new Fraction(color1Proportion.denominator - color1Proportion.numerator, color1Proportion.denominator);
    }
    get color1Proportion() {
        return this.color1FractionNode.fraction;
    }
    /**
   * @param {string || Color} color1 - Color value for the 1st color patch
   * @param {string || Color} color2 - Color value for the 2nd color patch
   * @param {Fraction} color1Proportion - Fraction of the whole that is comprised of color1, must be between 0 and 1,
   * inclusive.  The proportion for color2 is deduced from this value, with the two proportions summing to 1.
   * @param {Object} [options]
   */ constructor(color1, color2, color1Proportion, options){
        super();
        options = merge({
            font: new PhetFont({
                size: 18
            }),
            textFill: 'black',
            multiLine: false
        }, options);
        this.color1FractionNode = new FractionNode(color1Proportion, {
            font: options.font,
            color: options.textFill
        });
        this.addChild(this.color1FractionNode);
        const color2Proportion = new Fraction(color1Proportion.denominator - color1Proportion.numerator, color1Proportion.denominator);
        this.color2FractionNode = new FractionNode(color2Proportion, {
            font: options.font,
            color: options.textFill
        });
        this.addChild(this.color2FractionNode);
        const colorPatchShape = Shape.ellipse(0, 0, this.color1FractionNode.bounds.height * 0.5, this.color1FractionNode.bounds.height * 0.35);
        this.color1Patch = new Path(colorPatchShape, {
            fill: color1,
            left: this.color1FractionNode.right + PROMPT_TO_COLOR_SPACING,
            centerY: this.color1FractionNode.centerY
        });
        this.addChild(this.color1Patch);
        // Position the 2nd prompt based on whether or not the options specify multi-line.
        if (options.multiLine) {
            this.color2FractionNode.top = this.color1FractionNode.bottom + MULTI_LINE_SPACING;
        } else {
            this.color2FractionNode.left = this.color1Patch.right + SINGLE_LINE_SPACING;
        }
        this.color2Patch = new Path(colorPatchShape, {
            fill: color2,
            left: this.color2FractionNode.right + PROMPT_TO_COLOR_SPACING,
            centerY: this.color2FractionNode.centerY
        });
        this.addChild(this.color2Patch);
        this.mutate(options);
    }
};
areaBuilder.register('ColorProportionsPrompt', ColorProportionsPrompt);
export default ColorProportionsPrompt;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL3ZpZXcvQ29sb3JQcm9wb3J0aW9uc1Byb21wdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIFNjZW5lcnkgbm9kZSB0aGF0IGNvbnNpc3RzIG9mIHR3byBmcmFjdGlvbnMgYW5kIHR3byBjb2xvciBwYXRjaGVzLCB1c2VkIHdoZW4gcHJvbXB0aW5nIHRoZSB1c2VyIHRvIGNyZWF0ZSBhIHNoYXBlXG4gKiB0aGF0IGlzIGNvbXByaXNlZCB0byB0d28gZGlmZmVyZW50IGNvbG9ycy5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcbmltcG9ydCB7IE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBGcmFjdGlvbk5vZGUgZnJvbSAnLi9GcmFjdGlvbk5vZGUuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IE1VTFRJX0xJTkVfU1BBQ0lORyA9IDU7IC8vIEVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gbG9vayBnb29kXG5jb25zdCBTSU5HTEVfTElORV9TUEFDSU5HID0gMTI7IC8vIEVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gbG9vayBnb29kXG5jb25zdCBQUk9NUFRfVE9fQ09MT1JfU1BBQ0lORyA9IDQ7IC8vIEVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gbG9vayBnb29kXG5cbmNsYXNzIENvbG9yUHJvcG9ydGlvbnNQcm9tcHQgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmcgfHwgQ29sb3J9IGNvbG9yMSAtIENvbG9yIHZhbHVlIGZvciB0aGUgMXN0IGNvbG9yIHBhdGNoXG4gICAqIEBwYXJhbSB7c3RyaW5nIHx8IENvbG9yfSBjb2xvcjIgLSBDb2xvciB2YWx1ZSBmb3IgdGhlIDJuZCBjb2xvciBwYXRjaFxuICAgKiBAcGFyYW0ge0ZyYWN0aW9ufSBjb2xvcjFQcm9wb3J0aW9uIC0gRnJhY3Rpb24gb2YgdGhlIHdob2xlIHRoYXQgaXMgY29tcHJpc2VkIG9mIGNvbG9yMSwgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEsXG4gICAqIGluY2x1c2l2ZS4gIFRoZSBwcm9wb3J0aW9uIGZvciBjb2xvcjIgaXMgZGVkdWNlZCBmcm9tIHRoaXMgdmFsdWUsIHdpdGggdGhlIHR3byBwcm9wb3J0aW9ucyBzdW1taW5nIHRvIDEuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBjb2xvcjEsIGNvbG9yMiwgY29sb3IxUHJvcG9ydGlvbiwgb3B0aW9ucyApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTggfSApLFxuICAgICAgdGV4dEZpbGw6ICdibGFjaycsXG4gICAgICBtdWx0aUxpbmU6IGZhbHNlXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5jb2xvcjFGcmFjdGlvbk5vZGUgPSBuZXcgRnJhY3Rpb25Ob2RlKCBjb2xvcjFQcm9wb3J0aW9uLCB7XG4gICAgICBmb250OiBvcHRpb25zLmZvbnQsXG4gICAgICBjb2xvcjogb3B0aW9ucy50ZXh0RmlsbFxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNvbG9yMUZyYWN0aW9uTm9kZSApO1xuXG4gICAgY29uc3QgY29sb3IyUHJvcG9ydGlvbiA9IG5ldyBGcmFjdGlvbiggY29sb3IxUHJvcG9ydGlvbi5kZW5vbWluYXRvciAtIGNvbG9yMVByb3BvcnRpb24ubnVtZXJhdG9yLCBjb2xvcjFQcm9wb3J0aW9uLmRlbm9taW5hdG9yICk7XG4gICAgdGhpcy5jb2xvcjJGcmFjdGlvbk5vZGUgPSBuZXcgRnJhY3Rpb25Ob2RlKCBjb2xvcjJQcm9wb3J0aW9uLCB7XG4gICAgICBmb250OiBvcHRpb25zLmZvbnQsXG4gICAgICBjb2xvcjogb3B0aW9ucy50ZXh0RmlsbFxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNvbG9yMkZyYWN0aW9uTm9kZSApO1xuXG4gICAgY29uc3QgY29sb3JQYXRjaFNoYXBlID0gU2hhcGUuZWxsaXBzZSggMCwgMCwgdGhpcy5jb2xvcjFGcmFjdGlvbk5vZGUuYm91bmRzLmhlaWdodCAqIDAuNSwgdGhpcy5jb2xvcjFGcmFjdGlvbk5vZGUuYm91bmRzLmhlaWdodCAqIDAuMzUgKTtcbiAgICB0aGlzLmNvbG9yMVBhdGNoID0gbmV3IFBhdGgoIGNvbG9yUGF0Y2hTaGFwZSwge1xuICAgICAgZmlsbDogY29sb3IxLFxuICAgICAgbGVmdDogdGhpcy5jb2xvcjFGcmFjdGlvbk5vZGUucmlnaHQgKyBQUk9NUFRfVE9fQ09MT1JfU1BBQ0lORyxcbiAgICAgIGNlbnRlclk6IHRoaXMuY29sb3IxRnJhY3Rpb25Ob2RlLmNlbnRlcllcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5jb2xvcjFQYXRjaCApO1xuXG4gICAgLy8gUG9zaXRpb24gdGhlIDJuZCBwcm9tcHQgYmFzZWQgb24gd2hldGhlciBvciBub3QgdGhlIG9wdGlvbnMgc3BlY2lmeSBtdWx0aS1saW5lLlxuICAgIGlmICggb3B0aW9ucy5tdWx0aUxpbmUgKSB7XG4gICAgICB0aGlzLmNvbG9yMkZyYWN0aW9uTm9kZS50b3AgPSB0aGlzLmNvbG9yMUZyYWN0aW9uTm9kZS5ib3R0b20gKyBNVUxUSV9MSU5FX1NQQUNJTkc7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5jb2xvcjJGcmFjdGlvbk5vZGUubGVmdCA9IHRoaXMuY29sb3IxUGF0Y2gucmlnaHQgKyBTSU5HTEVfTElORV9TUEFDSU5HO1xuICAgIH1cblxuICAgIHRoaXMuY29sb3IyUGF0Y2ggPSBuZXcgUGF0aCggY29sb3JQYXRjaFNoYXBlLCB7XG4gICAgICBmaWxsOiBjb2xvcjIsXG4gICAgICBsZWZ0OiB0aGlzLmNvbG9yMkZyYWN0aW9uTm9kZS5yaWdodCArIFBST01QVF9UT19DT0xPUl9TUEFDSU5HLFxuICAgICAgY2VudGVyWTogdGhpcy5jb2xvcjJGcmFjdGlvbk5vZGUuY2VudGVyWVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNvbG9yMlBhdGNoICk7XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cblxuICBzZXQgY29sb3IxKCBjb2xvciApIHtcbiAgICB0aGlzLmNvbG9yMVBhdGNoLmZpbGwgPSBjb2xvcjtcbiAgfVxuXG4gIGdldCBjb2xvcjEoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29sb3IxUGF0Y2guZmlsbDtcbiAgfVxuXG4gIHNldCBjb2xvcjIoIGNvbG9yICkge1xuICAgIHRoaXMuY29sb3IyUGF0Y2guZmlsbCA9IGNvbG9yO1xuICB9XG5cbiAgZ2V0IGNvbG9yMigpIHtcbiAgICByZXR1cm4gdGhpcy5jb2xvcjJQYXRjaC5maWxsO1xuICB9XG5cbiAgc2V0IGNvbG9yMVByb3BvcnRpb24oIGNvbG9yMVByb3BvcnRpb24gKSB7XG4gICAgdGhpcy5jb2xvcjFGcmFjdGlvbk5vZGUuZnJhY3Rpb24gPSBjb2xvcjFQcm9wb3J0aW9uO1xuICAgIHRoaXMuY29sb3IyRnJhY3Rpb25Ob2RlLmZyYWN0aW9uID0gbmV3IEZyYWN0aW9uKCBjb2xvcjFQcm9wb3J0aW9uLmRlbm9taW5hdG9yIC0gY29sb3IxUHJvcG9ydGlvbi5udW1lcmF0b3IsIGNvbG9yMVByb3BvcnRpb24uZGVub21pbmF0b3IgKTtcbiAgfVxuXG4gIGdldCBjb2xvcjFQcm9wb3J0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmNvbG9yMUZyYWN0aW9uTm9kZS5mcmFjdGlvbjtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0NvbG9yUHJvcG9ydGlvbnNQcm9tcHQnLCBDb2xvclByb3BvcnRpb25zUHJvbXB0ICk7XG5leHBvcnQgZGVmYXVsdCBDb2xvclByb3BvcnRpb25zUHJvbXB0OyJdLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwiRnJhY3Rpb24iLCJQaGV0Rm9udCIsIk5vZGUiLCJQYXRoIiwiYXJlYUJ1aWxkZXIiLCJGcmFjdGlvbk5vZGUiLCJNVUxUSV9MSU5FX1NQQUNJTkciLCJTSU5HTEVfTElORV9TUEFDSU5HIiwiUFJPTVBUX1RPX0NPTE9SX1NQQUNJTkciLCJDb2xvclByb3BvcnRpb25zUHJvbXB0IiwiY29sb3IxIiwiY29sb3IiLCJjb2xvcjFQYXRjaCIsImZpbGwiLCJjb2xvcjIiLCJjb2xvcjJQYXRjaCIsImNvbG9yMVByb3BvcnRpb24iLCJjb2xvcjFGcmFjdGlvbk5vZGUiLCJmcmFjdGlvbiIsImNvbG9yMkZyYWN0aW9uTm9kZSIsImRlbm9taW5hdG9yIiwibnVtZXJhdG9yIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZm9udCIsInNpemUiLCJ0ZXh0RmlsbCIsIm11bHRpTGluZSIsImFkZENoaWxkIiwiY29sb3IyUHJvcG9ydGlvbiIsImNvbG9yUGF0Y2hTaGFwZSIsImVsbGlwc2UiLCJib3VuZHMiLCJoZWlnaHQiLCJsZWZ0IiwicmlnaHQiLCJjZW50ZXJZIiwidG9wIiwiYm90dG9tIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7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