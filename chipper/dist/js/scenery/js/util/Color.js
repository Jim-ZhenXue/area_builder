// Copyright 2012-2024, University of Colorado Boulder
/**
 * A color with RGBA values, assuming the sRGB color space is used.
 *
 * See http://www.w3.org/TR/css3-color/
 *
 * TODO: make a getHue, getSaturation, getLightness. we can then expose them via ES5! https://github.com/phetsims/scenery/issues/1581
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../dot/js/Utils.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import { scenery } from '../imports.js';
// constants
const clamp = Utils.clamp;
const linear = Utils.linear;
// regex utilities
const rgbNumber = '(-?\\d{1,3}%?)'; // syntax allows negative integers and percentages
const aNumber = '(\\d+|\\d*\\.\\d+)'; // decimal point number. technically we allow for '255', even though this will be clamped to 1.
const rawNumber = '(\\d{1,3})'; // a 1-3 digit number
// handles negative and percentage values
function parseRGBNumber(str) {
    let multiplier = 1;
    // if it's a percentage, strip it off and handle it that way
    if (str.endsWith('%')) {
        multiplier = 2.55;
        str = str.slice(0, str.length - 1);
    }
    return Utils.roundSymmetric(Number(str) * multiplier);
}
let Color = class Color {
    /**
   * Returns a copy of this color.
   */ copy() {
        return new Color(this.r, this.g, this.b, this.a);
    }
    /**
   * Sets the values of this Color. Supported styles:
   *
   * - set( color ) is a copy constructor
   * - set( string ) will parse the string assuming it's a CSS-compatible color, e.g. set( 'red' )
   * - set( r, g, b ) is equivalent to setRGBA( r, g, b, 1 ), e.g. set( 255, 0, 128 )
   * - set( r, g, b, a ) is equivalent to setRGBA( r, g, b, a ), e.g. set( 255, 0, 128, 0.5 )
   * - set( hex ) will set RGB with alpha=1, e.g. set( 0xFF0000 )
   * - set( hex, alpha ) will set RGBA, e.g. set( 0xFF0000, 1 )
   * - set( null ) will be transparent
   *
   * @param r - See above for the possible overloaded values
   * @param [g] - If provided, should be the green value (or the alpha value if a hex color is given)
   * @param [b] - If provided, should be the blue value
   * @param [a] - If provided, should be the alpha value
   */ set(r, g, b, a) {
        assert && assert(r !== undefined, 'Can\'t call Color.set( undefined )');
        if (r === null) {
            this.setRGBA(0, 0, 0, 0);
        } else if (typeof r === 'string') {
            this.setCSS(r);
        } else if (r instanceof Color) {
            this.setRGBA(r.r, r.g, r.b, r.a);
        } else if (b === undefined) {
            assert && assert(g === undefined || typeof g === 'number');
            const red = r >> 16 & 0xFF;
            const green = r >> 8 & 0xFF;
            const blue = r >> 0 & 0xFF;
            const alpha = g === undefined ? 1 : g;
            this.setRGBA(red, green, blue, alpha);
        } else {
            assert && assert(a === undefined || typeof a === 'number');
            this.setRGBA(r, g, b, a === undefined ? 1 : a);
        }
        return this; // support chaining
    }
    /**
   * Returns the red value as an integer between 0 and 255
   */ getRed() {
        return this.r;
    }
    get red() {
        return this.getRed();
    }
    set red(value) {
        this.setRed(value);
    }
    /**
   * Sets the red value.
   *
   * @param value - Will be clamped to an integer between 0 and 255
   */ setRed(value) {
        return this.setRGBA(value, this.g, this.b, this.a);
    }
    /**
   * Returns the green value as an integer between 0 and 255
   */ getGreen() {
        return this.g;
    }
    get green() {
        return this.getGreen();
    }
    set green(value) {
        this.setGreen(value);
    }
    /**
   * Sets the green value.
   *
   * @param value - Will be clamped to an integer between 0 and 255
   */ setGreen(value) {
        return this.setRGBA(this.r, value, this.b, this.a);
    }
    /**
   * Returns the blue value as an integer between 0 and 255
   */ getBlue() {
        return this.b;
    }
    get blue() {
        return this.getBlue();
    }
    set blue(value) {
        this.setBlue(value);
    }
    /**
   * Sets the blue value.
   *
   * @param value - Will be clamped to an integer between 0 and 255
   */ setBlue(value) {
        return this.setRGBA(this.r, this.g, value, this.a);
    }
    /**
   * Returns the alpha value as a floating-point value between 0 and 1
   */ getAlpha() {
        return this.a;
    }
    get alpha() {
        return this.getAlpha();
    }
    set alpha(value) {
        this.setAlpha(value);
    }
    /**
   * Sets the alpha value.
   *
   * @param value - Will be clamped between 0 and 1
   */ setAlpha(value) {
        return this.setRGBA(this.r, this.g, this.b, value);
    }
    /**
   * Sets the value of this Color using RGB integral between 0-255, alpha (float) between 0-1.
   */ setRGBA(red, green, blue, alpha) {
        this.r = Utils.roundSymmetric(clamp(red, 0, 255));
        this.g = Utils.roundSymmetric(clamp(green, 0, 255));
        this.b = Utils.roundSymmetric(clamp(blue, 0, 255));
        this.a = clamp(alpha, 0, 1);
        this.updateColor(); // update the cached value
        return this; // allow chaining
    }
    /**
   * A linear (gamma-corrected) interpolation between this color (ratio=0) and another color (ratio=1).
   *
   * @param otherColor
   * @param ratio - Not necessarily constrained in [0, 1]
   */ blend(otherColor, ratio) {
        const gamma = 2.4;
        const linearRedA = Math.pow(this.r, gamma);
        const linearRedB = Math.pow(otherColor.r, gamma);
        const linearGreenA = Math.pow(this.g, gamma);
        const linearGreenB = Math.pow(otherColor.g, gamma);
        const linearBlueA = Math.pow(this.b, gamma);
        const linearBlueB = Math.pow(otherColor.b, gamma);
        const r = Math.pow(linearRedA + (linearRedB - linearRedA) * ratio, 1 / gamma);
        const g = Math.pow(linearGreenA + (linearGreenB - linearGreenA) * ratio, 1 / gamma);
        const b = Math.pow(linearBlueA + (linearBlueB - linearBlueA) * ratio, 1 / gamma);
        const a = this.a + (otherColor.a - this.a) * ratio;
        return new Color(r, g, b, a);
    }
    /**
   * Used internally to compute the CSS string for this color. Use toCSS()
   */ computeCSS() {
        if (this.a === 1) {
            return `rgb(${this.r},${this.g},${this.b})`;
        } else {
            // Since SVG doesn't support parsing scientific notation (e.g. 7e5), we need to output fixed decimal-point strings.
            // Since this needs to be done quickly, and we don't particularly care about slight rounding differences (it's
            // being used for display purposes only, and is never shown to the user), we use the built-in JS toFixed instead of
            // Dot's version of toFixed. See https://github.com/phetsims/kite/issues/50
            let alpha = this.a.toFixed(20); // eslint-disable-line phet/bad-sim-text
            while(alpha.length >= 2 && alpha.endsWith('0') && alpha[alpha.length - 2] !== '.'){
                alpha = alpha.slice(0, alpha.length - 1);
            }
            const alphaString = this.a === 0 || this.a === 1 ? this.a : alpha;
            return `rgba(${this.r},${this.g},${this.b},${alphaString})`;
        }
    }
    /**
   * Returns the value of this Color as a CSS string.
   */ toCSS() {
        // verify that the cached value is correct (in debugging builds only, defeats the point of caching otherwise)
        assert && assert(this._css === this.computeCSS(), `CSS cached value is ${this._css}, but the computed value appears to be ${this.computeCSS()}`);
        return this._css;
    }
    /**
   * Sets this color for a CSS color string.
   */ setCSS(cssString) {
        let success = false;
        const str = Color.preprocessCSS(cssString);
        // run through the available text formats
        for(let i = 0; i < Color.formatParsers.length; i++){
            const parser = Color.formatParsers[i];
            const matches = parser.regexp.exec(str);
            if (matches) {
                parser.apply(this, matches);
                success = true;
                break;
            }
        }
        if (!success) {
            throw new Error(`Color unable to parse color string: ${cssString}`);
        }
        this.updateColor(); // update the cached value
        return this;
    }
    /**
   * Returns this color's RGB information in the hexadecimal number equivalent, e.g. 0xFF00FF
   */ toNumber() {
        return (this.r << 16) + (this.g << 8) + this.b;
    }
    /**
   * Called to update the internally cached CSS value
   */ updateColor() {
        assert && assert(!this.immutable, 'Cannot modify an immutable color. Likely caused by trying to mutate a color after it was used for a node fill/stroke');
        assert && assert(typeof this.red === 'number' && typeof this.green === 'number' && typeof this.blue === 'number' && typeof this.alpha === 'number', `Ensure color components are numeric: ${this.toString()}`);
        assert && assert(isFinite(this.red) && isFinite(this.green) && isFinite(this.blue) && isFinite(this.alpha), 'Ensure color components are finite and not NaN');
        assert && assert(this.red >= 0 && this.red <= 255 && this.green >= 0 && this.green <= 255 && this.red >= 0 && this.red <= 255 && this.alpha >= 0 && this.alpha <= 1, `Ensure color components are in the proper ranges: ${this.toString()}`);
        const oldCSS = this._css;
        this._css = this.computeCSS();
        // notify listeners if it changed
        if (oldCSS !== this._css) {
            this.changeEmitter.emit();
        }
    }
    /**
   * Allow setting this Color to be immutable when assertions are disabled. any change will throw an error
   */ setImmutable() {
        if (assert) {
            this.immutable = true;
        }
        return this; // allow chaining
    }
    /**
   * Returns an object that can be passed to a Canvas context's fillStyle or strokeStyle.
   */ getCanvasStyle() {
        return this.toCSS(); // should be inlined, leave like this for future maintainability
    }
    /**
   * Sets this color using HSLA values.
   *
   * TODO: make a getHue, getSaturation, getLightness. we can then expose them via ES5! https://github.com/phetsims/scenery/issues/1581
   *
   * @param hue - integer modulo 360
   * @param saturation - percentage
   * @param lightness - percentage
   * @param alpha
   */ setHSLA(hue, saturation, lightness, alpha) {
        hue = hue % 360 / 360;
        saturation = clamp(saturation / 100, 0, 1);
        lightness = clamp(lightness / 100, 0, 1);
        // see http://www.w3.org/TR/css3-color/
        let m2;
        if (lightness < 0.5) {
            m2 = lightness * (saturation + 1);
        } else {
            m2 = lightness + saturation - lightness * saturation;
        }
        const m1 = lightness * 2 - m2;
        this.r = Utils.roundSymmetric(Color.hueToRGB(m1, m2, hue + 1 / 3) * 255);
        this.g = Utils.roundSymmetric(Color.hueToRGB(m1, m2, hue) * 255);
        this.b = Utils.roundSymmetric(Color.hueToRGB(m1, m2, hue - 1 / 3) * 255);
        this.a = clamp(alpha, 0, 1);
        this.updateColor(); // update the cached value
        return this; // allow chaining
    }
    equals(color) {
        return this.r === color.r && this.g === color.g && this.b === color.b && this.a === color.a;
    }
    /**
   * Returns a copy of this color with a different alpha value.
   */ withAlpha(alpha) {
        return new Color(this.r, this.g, this.b, alpha);
    }
    checkFactor(factor) {
        assert && assert(factor === undefined || factor >= 0 && factor <= 1, `factor must be between 0 and 1: ${factor}`);
        return factor === undefined ? 0.7 : factor;
    }
    /**
   * Matches Java's Color.brighter()
   */ brighterColor(factor) {
        factor = this.checkFactor(factor);
        const red = Math.min(255, Math.floor(this.r / factor));
        const green = Math.min(255, Math.floor(this.g / factor));
        const blue = Math.min(255, Math.floor(this.b / factor));
        return new Color(red, green, blue, this.a);
    }
    /**
   * Brightens a color in RGB space. Useful when creating gradients from a single base color.
   *
   * @param [factor] - 0 (no change) to 1 (white)
   * @returns - (closer to white) version of the original color.
   */ colorUtilsBrighter(factor) {
        factor = this.checkFactor(factor);
        const red = Math.min(255, this.getRed() + Math.floor(factor * (255 - this.getRed())));
        const green = Math.min(255, this.getGreen() + Math.floor(factor * (255 - this.getGreen())));
        const blue = Math.min(255, this.getBlue() + Math.floor(factor * (255 - this.getBlue())));
        return new Color(red, green, blue, this.getAlpha());
    }
    /**
   * Matches Java's Color.darker()
   */ darkerColor(factor) {
        factor = this.checkFactor(factor);
        const red = Math.max(0, Math.floor(factor * this.r));
        const green = Math.max(0, Math.floor(factor * this.g));
        const blue = Math.max(0, Math.floor(factor * this.b));
        return new Color(red, green, blue, this.a);
    }
    /**
   * Darken a color in RGB space. Useful when creating gradients from a single
   * base color.
   *
   * @param [factor] - 0 (no change) to 1 (black)
   * @returns - darker (closer to black) version of the original color.
   */ colorUtilsDarker(factor) {
        factor = this.checkFactor(factor);
        const red = Math.max(0, this.getRed() - Math.floor(factor * this.getRed()));
        const green = Math.max(0, this.getGreen() - Math.floor(factor * this.getGreen()));
        const blue = Math.max(0, this.getBlue() - Math.floor(factor * this.getBlue()));
        return new Color(red, green, blue, this.getAlpha());
    }
    /**
   * Like colorUtilsBrighter/Darker, however factor should be in the range -1 to 1, and it will call:
   *   colorUtilsBrighter( factor )   for factor >  0
   *   this                           for factor == 0
   *   colorUtilsDarker( -factor )    for factor <  0
   *
   * @param factor from -1 (black), to 0 (no change), to 1 (white)
   */ colorUtilsBrightness(factor) {
        if (factor === 0) {
            return this;
        } else if (factor > 0) {
            return this.colorUtilsBrighter(factor);
        } else {
            return this.colorUtilsDarker(-factor);
        }
    }
    /**
   * Returns a string form of this object
   */ toString() {
        return `${this.constructor.name}[r:${this.r} g:${this.g} b:${this.b} a:${this.a}]`;
    }
    /**
   * Convert to a hex string, that starts with "#".
   */ toHexString() {
        let hexString = this.toNumber().toString(16);
        while(hexString.length < 6){
            hexString = `0${hexString}`;
        }
        return `#${hexString}`;
    }
    toStateObject() {
        return {
            r: this.r,
            g: this.g,
            b: this.b,
            a: this.a
        };
    }
    /**
   * Utility function, see http://www.w3.org/TR/css3-color/
   */ static hueToRGB(m1, m2, h) {
        if (h < 0) {
            h = h + 1;
        }
        if (h > 1) {
            h = h - 1;
        }
        if (h * 6 < 1) {
            return m1 + (m2 - m1) * h * 6;
        }
        if (h * 2 < 1) {
            return m2;
        }
        if (h * 3 < 2) {
            return m1 + (m2 - m1) * (2 / 3 - h) * 6;
        }
        return m1;
    }
    /**
   * Convenience function that converts a color spec to a color object if necessary, or simply returns the color object
   * if not.
   *
   * Please note there is no defensive copy when a color is passed in unlike PaintDef.
   */ static toColor(colorSpec) {
        if (colorSpec === null) {
            return Color.TRANSPARENT;
        } else if (colorSpec instanceof Color) {
            return colorSpec;
        } else if (typeof colorSpec === 'string') {
            return new Color(colorSpec);
        } else {
            return Color.toColor(colorSpec.value);
        }
    }
    /**
   * Interpolates between 2 colors in RGBA space. When distance is 0, color1 is returned. When distance is 1, color2 is
   * returned. Other values of distance return a color somewhere between color1 and color2. Each color component is
   * interpolated separately.
   *
   * @param color1
   * @param color2
   * @param distance distance between color1 and color2, 0 <= distance <= 1
   */ static interpolateRGBA(color1, color2, distance) {
        if (distance < 0 || distance > 1) {
            throw new Error(`distance must be between 0 and 1: ${distance}`);
        }
        const r = Math.floor(linear(0, 1, color1.r, color2.r, distance));
        const g = Math.floor(linear(0, 1, color1.g, color2.g, distance));
        const b = Math.floor(linear(0, 1, color1.b, color2.b, distance));
        const a = linear(0, 1, color1.a, color2.a, distance);
        return new Color(r, g, b, a);
    }
    /**
   * Returns a blended color as a mix between the given colors.
   */ static supersampleBlend(colors) {
        // hard-coded gamma (assuming the exponential part of the sRGB curve as a simplification)
        const GAMMA = 2.2;
        // maps to [0,1] linear colorspace
        const reds = colors.map((color)=>Math.pow(color.r / 255, GAMMA));
        const greens = colors.map((color)=>Math.pow(color.g / 255, GAMMA));
        const blues = colors.map((color)=>Math.pow(color.b / 255, GAMMA));
        const alphas = colors.map((color)=>Math.pow(color.a, GAMMA));
        const alphaSum = _.sum(alphas);
        if (alphaSum === 0) {
            return new Color(0, 0, 0, 0);
        }
        // blending of pixels, weighted by alphas
        const red = _.sum(_.range(0, colors.length).map((i)=>reds[i] * alphas[i])) / alphaSum;
        const green = _.sum(_.range(0, colors.length).map((i)=>greens[i] * alphas[i])) / alphaSum;
        const blue = _.sum(_.range(0, colors.length).map((i)=>blues[i] * alphas[i])) / alphaSum;
        const alpha = alphaSum / colors.length; // average of alphas
        return new Color(Math.floor(Math.pow(red, 1 / GAMMA) * 255), Math.floor(Math.pow(green, 1 / GAMMA) * 255), Math.floor(Math.pow(blue, 1 / GAMMA) * 255), Math.pow(alpha, 1 / GAMMA));
    }
    static fromStateObject(stateObject) {
        return new Color(stateObject.r, stateObject.g, stateObject.b, stateObject.a);
    }
    static hsla(hue, saturation, lightness, alpha) {
        return new Color(0, 0, 0, 1).setHSLA(hue, saturation, lightness, alpha);
    }
    static checkPaintString(cssString) {
        if (assert) {
            try {
                scratchColor.setCSS(cssString);
            } catch (e) {
                assert(false, `The CSS string is an invalid color: ${cssString}`);
            }
        }
    }
    /**
   * A Paint of the type that Paintable accepts as fills or strokes
   */ static checkPaint(paint) {
        if (typeof paint === 'string') {
            Color.checkPaintString(paint);
        } else if (isTReadOnlyProperty(paint) && typeof paint.value === 'string') {
            Color.checkPaintString(paint.value);
        }
    }
    /**
   * Gets the luminance of a color, per ITU-R recommendation BT.709, https://en.wikipedia.org/wiki/Rec._709.
   * Green contributes the most to the intensity perceived by humans, and blue the least.
   * This algorithm works correctly with a grayscale color because the RGB coefficients sum to 1.
   *
   * @returns - a value in the range [0,255]
   */ static getLuminance(color) {
        const sceneryColor = Color.toColor(color);
        const luminance = sceneryColor.red * 0.2126 + sceneryColor.green * 0.7152 + sceneryColor.blue * 0.0722;
        assert && assert(luminance >= 0 && luminance <= 255, `unexpected luminance: ${luminance}`);
        return luminance;
    }
    /**
   * Converts a color to grayscale.
   */ static toGrayscale(color) {
        const luminance = Color.getLuminance(color);
        return new Color(luminance, luminance, luminance);
    }
    /**
   * Determines whether a color is 'dark'.
   *
   * @param color - colors with luminance < this value are dark, range [0,255], default 186
   * @param luminanceThreshold - colors with luminance < this value are dark, range [0,255], default 186
   */ static isDarkColor(color, luminanceThreshold = 186) {
        assert && assert(luminanceThreshold >= 0 && luminanceThreshold <= 255, 'invalid luminanceThreshold');
        return Color.getLuminance(color) < luminanceThreshold;
    }
    /**
   * Determines whether a color is 'light'.
   *
   * @param color
   * @param [luminanceThreshold] - colors with luminance >= this value are light, range [0,255], default 186
   */ static isLightColor(color, luminanceThreshold) {
        return !Color.isDarkColor(color, luminanceThreshold);
    }
    /**
   * Creates a Color that is a shade of gray.
   * @param rgb - used for red, blue, and green components
   * @param [a] - defaults to 1
   */ static grayColor(rgb, a) {
        return new Color(rgb, rgb, rgb, a);
    }
    /**
   * Converts a CSS color string into a standard format, lower-casing and keyword-matching it.
   */ static preprocessCSS(cssString) {
        let str = cssString.replace(/ /g, '').toLowerCase();
        // replace colors based on keywords
        const keywordMatch = Color.colorKeywords[str];
        if (keywordMatch) {
            str = `#${keywordMatch}`;
        }
        return str;
    }
    /**
   * Whether the specified CSS string is a valid CSS color string
   */ static isCSSColorString(cssString) {
        const str = Color.preprocessCSS(cssString);
        // run through the available text formats
        for(let i = 0; i < Color.formatParsers.length; i++){
            const parser = Color.formatParsers[i];
            const matches = parser.regexp.exec(str);
            if (matches) {
                return true;
            }
        }
        return false;
    }
    constructor(r, g, b, a){
        // {Emitter}
        this.changeEmitter = new TinyEmitter();
        this.set(r, g, b, a);
    }
};
Color.formatParsers = [
    {
        // 'transparent'
        regexp: /^transparent$/,
        apply: (color, matches)=>{
            color.setRGBA(0, 0, 0, 0);
        }
    },
    {
        // short hex form, a la '#fff'
        regexp: /^#(\w{1})(\w{1})(\w{1})$/,
        apply: (color, matches)=>{
            color.setRGBA(parseInt(matches[1] + matches[1], 16), parseInt(matches[2] + matches[2], 16), parseInt(matches[3] + matches[3], 16), 1);
        }
    },
    {
        // long hex form, a la '#ffffff'
        regexp: /^#(\w{2})(\w{2})(\w{2})$/,
        apply: (color, matches)=>{
            color.setRGBA(parseInt(matches[1], 16), parseInt(matches[2], 16), parseInt(matches[3], 16), 1);
        }
    },
    {
        // rgb(...)
        regexp: new RegExp(`^rgb\\(${rgbNumber},${rgbNumber},${rgbNumber}\\)$`),
        apply: (color, matches)=>{
            color.setRGBA(parseRGBNumber(matches[1]), parseRGBNumber(matches[2]), parseRGBNumber(matches[3]), 1);
        }
    },
    {
        // rgba(...)
        regexp: new RegExp(`^rgba\\(${rgbNumber},${rgbNumber},${rgbNumber},${aNumber}\\)$`),
        apply: (color, matches)=>{
            color.setRGBA(parseRGBNumber(matches[1]), parseRGBNumber(matches[2]), parseRGBNumber(matches[3]), Number(matches[4]));
        }
    },
    {
        // hsl(...)
        regexp: new RegExp(`^hsl\\(${rawNumber},${rawNumber}%,${rawNumber}%\\)$`),
        apply: (color, matches)=>{
            color.setHSLA(Number(matches[1]), Number(matches[2]), Number(matches[3]), 1);
        }
    },
    {
        // hsla(...)
        regexp: new RegExp(`^hsla\\(${rawNumber},${rawNumber}%,${rawNumber}%,${aNumber}\\)$`),
        apply: (color, matches)=>{
            color.setHSLA(Number(matches[1]), Number(matches[2]), Number(matches[3]), Number(matches[4]));
        }
    }
];
Color.basicColorKeywords = {
    aqua: '00ffff',
    black: '000000',
    blue: '0000ff',
    fuchsia: 'ff00ff',
    gray: '808080',
    green: '008000',
    lime: '00ff00',
    maroon: '800000',
    navy: '000080',
    olive: '808000',
    purple: '800080',
    red: 'ff0000',
    silver: 'c0c0c0',
    teal: '008080',
    white: 'ffffff',
    yellow: 'ffff00'
};
Color.colorKeywords = {
    aliceblue: 'f0f8ff',
    antiquewhite: 'faebd7',
    aqua: '00ffff',
    aquamarine: '7fffd4',
    azure: 'f0ffff',
    beige: 'f5f5dc',
    bisque: 'ffe4c4',
    black: '000000',
    blanchedalmond: 'ffebcd',
    blue: '0000ff',
    blueviolet: '8a2be2',
    brown: 'a52a2a',
    burlywood: 'deb887',
    cadetblue: '5f9ea0',
    chartreuse: '7fff00',
    chocolate: 'd2691e',
    coral: 'ff7f50',
    cornflowerblue: '6495ed',
    cornsilk: 'fff8dc',
    crimson: 'dc143c',
    cyan: '00ffff',
    darkblue: '00008b',
    darkcyan: '008b8b',
    darkgoldenrod: 'b8860b',
    darkgray: 'a9a9a9',
    darkgreen: '006400',
    darkgrey: 'a9a9a9',
    darkkhaki: 'bdb76b',
    darkmagenta: '8b008b',
    darkolivegreen: '556b2f',
    darkorange: 'ff8c00',
    darkorchid: '9932cc',
    darkred: '8b0000',
    darksalmon: 'e9967a',
    darkseagreen: '8fbc8f',
    darkslateblue: '483d8b',
    darkslategray: '2f4f4f',
    darkslategrey: '2f4f4f',
    darkturquoise: '00ced1',
    darkviolet: '9400d3',
    deeppink: 'ff1493',
    deepskyblue: '00bfff',
    dimgray: '696969',
    dimgrey: '696969',
    dodgerblue: '1e90ff',
    firebrick: 'b22222',
    floralwhite: 'fffaf0',
    forestgreen: '228b22',
    fuchsia: 'ff00ff',
    gainsboro: 'dcdcdc',
    ghostwhite: 'f8f8ff',
    gold: 'ffd700',
    goldenrod: 'daa520',
    gray: '808080',
    green: '008000',
    greenyellow: 'adff2f',
    grey: '808080',
    honeydew: 'f0fff0',
    hotpink: 'ff69b4',
    indianred: 'cd5c5c',
    indigo: '4b0082',
    ivory: 'fffff0',
    khaki: 'f0e68c',
    lavender: 'e6e6fa',
    lavenderblush: 'fff0f5',
    lawngreen: '7cfc00',
    lemonchiffon: 'fffacd',
    lightblue: 'add8e6',
    lightcoral: 'f08080',
    lightcyan: 'e0ffff',
    lightgoldenrodyellow: 'fafad2',
    lightgray: 'd3d3d3',
    lightgreen: '90ee90',
    lightgrey: 'd3d3d3',
    lightpink: 'ffb6c1',
    lightsalmon: 'ffa07a',
    lightseagreen: '20b2aa',
    lightskyblue: '87cefa',
    lightslategray: '778899',
    lightslategrey: '778899',
    lightsteelblue: 'b0c4de',
    lightyellow: 'ffffe0',
    lime: '00ff00',
    limegreen: '32cd32',
    linen: 'faf0e6',
    magenta: 'ff00ff',
    maroon: '800000',
    mediumaquamarine: '66cdaa',
    mediumblue: '0000cd',
    mediumorchid: 'ba55d3',
    mediumpurple: '9370db',
    mediumseagreen: '3cb371',
    mediumslateblue: '7b68ee',
    mediumspringgreen: '00fa9a',
    mediumturquoise: '48d1cc',
    mediumvioletred: 'c71585',
    midnightblue: '191970',
    mintcream: 'f5fffa',
    mistyrose: 'ffe4e1',
    moccasin: 'ffe4b5',
    navajowhite: 'ffdead',
    navy: '000080',
    oldlace: 'fdf5e6',
    olive: '808000',
    olivedrab: '6b8e23',
    orange: 'ffa500',
    orangered: 'ff4500',
    orchid: 'da70d6',
    palegoldenrod: 'eee8aa',
    palegreen: '98fb98',
    paleturquoise: 'afeeee',
    palevioletred: 'db7093',
    papayawhip: 'ffefd5',
    peachpuff: 'ffdab9',
    peru: 'cd853f',
    pink: 'ffc0cb',
    plum: 'dda0dd',
    powderblue: 'b0e0e6',
    purple: '800080',
    red: 'ff0000',
    rosybrown: 'bc8f8f',
    royalblue: '4169e1',
    saddlebrown: '8b4513',
    salmon: 'fa8072',
    sandybrown: 'f4a460',
    seagreen: '2e8b57',
    seashell: 'fff5ee',
    sienna: 'a0522d',
    silver: 'c0c0c0',
    skyblue: '87ceeb',
    slateblue: '6a5acd',
    slategray: '708090',
    slategrey: '708090',
    snow: 'fffafa',
    springgreen: '00ff7f',
    steelblue: '4682b4',
    tan: 'd2b48c',
    teal: '008080',
    thistle: 'd8bfd8',
    tomato: 'ff6347',
    turquoise: '40e0d0',
    violet: 'ee82ee',
    wheat: 'f5deb3',
    white: 'ffffff',
    whitesmoke: 'f5f5f5',
    yellow: 'ffff00',
    yellowgreen: '9acd32'
};
export { Color as default };
scenery.register('Color', Color);
// Java compatibility
Color.BLACK = Color.black = new Color(0, 0, 0).setImmutable();
Color.BLUE = Color.blue = new Color(0, 0, 255).setImmutable();
Color.CYAN = Color.cyan = new Color(0, 255, 255).setImmutable();
Color.DARK_GRAY = Color.darkGray = new Color(64, 64, 64).setImmutable();
Color.GRAY = Color.gray = new Color(128, 128, 128).setImmutable();
Color.GREEN = Color.green = new Color(0, 255, 0).setImmutable();
Color.LIGHT_GRAY = Color.lightGray = new Color(192, 192, 192).setImmutable();
Color.MAGENTA = Color.magenta = new Color(255, 0, 255).setImmutable();
Color.ORANGE = Color.orange = new Color(255, 200, 0).setImmutable();
Color.PINK = Color.pink = new Color(255, 175, 175).setImmutable();
Color.RED = Color.red = new Color(255, 0, 0).setImmutable();
Color.WHITE = Color.white = new Color(255, 255, 255).setImmutable();
Color.YELLOW = Color.yellow = new Color(255, 255, 0).setImmutable();
// Helper for transparent colors
Color.TRANSPARENT = Color.transparent = new Color(0, 0, 0, 0).setImmutable();
const scratchColor = new Color('blue');
Color.ColorIO = new IOType('ColorIO', {
    valueType: Color,
    documentation: 'A color, with rgba',
    toStateObject: (color)=>color.toStateObject(),
    fromStateObject: (stateObject)=>new Color(stateObject.r, stateObject.g, stateObject.b, stateObject.a),
    stateSchema: {
        r: NumberIO,
        g: NumberIO,
        b: NumberIO,
        a: NumberIO
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9Db2xvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIGNvbG9yIHdpdGggUkdCQSB2YWx1ZXMsIGFzc3VtaW5nIHRoZSBzUkdCIGNvbG9yIHNwYWNlIGlzIHVzZWQuXG4gKlxuICogU2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtY29sb3IvXG4gKlxuICogVE9ETzogbWFrZSBhIGdldEh1ZSwgZ2V0U2F0dXJhdGlvbiwgZ2V0TGlnaHRuZXNzLiB3ZSBjYW4gdGhlbiBleHBvc2UgdGhlbSB2aWEgRVM1ISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XG5pbXBvcnQgeyBpc1RSZWFkT25seVByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcbmltcG9ydCB7IHNjZW5lcnksIFRQYWludCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuaW1wb3J0IFRDb2xvciBmcm9tICcuL1RDb2xvci5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgY2xhbXAgPSBVdGlscy5jbGFtcDtcbmNvbnN0IGxpbmVhciA9IFV0aWxzLmxpbmVhcjtcblxudHlwZSBGb3JtYXRQYXJzZXIgPSB7XG4gIHJlZ2V4cDogUmVnRXhwO1xuICBhcHBseTogKCBjb2xvcjogQ29sb3IsIG1hdGNoZXM6IFJlZ0V4cEV4ZWNBcnJheSApID0+IHZvaWQ7XG59O1xuXG4vLyByZWdleCB1dGlsaXRpZXNcbmNvbnN0IHJnYk51bWJlciA9ICcoLT9cXFxcZHsxLDN9JT8pJzsgLy8gc3ludGF4IGFsbG93cyBuZWdhdGl2ZSBpbnRlZ2VycyBhbmQgcGVyY2VudGFnZXNcbmNvbnN0IGFOdW1iZXIgPSAnKFxcXFxkK3xcXFxcZCpcXFxcLlxcXFxkKyknOyAvLyBkZWNpbWFsIHBvaW50IG51bWJlci4gdGVjaG5pY2FsbHkgd2UgYWxsb3cgZm9yICcyNTUnLCBldmVuIHRob3VnaCB0aGlzIHdpbGwgYmUgY2xhbXBlZCB0byAxLlxuY29uc3QgcmF3TnVtYmVyID0gJyhcXFxcZHsxLDN9KSc7IC8vIGEgMS0zIGRpZ2l0IG51bWJlclxuXG4vLyBoYW5kbGVzIG5lZ2F0aXZlIGFuZCBwZXJjZW50YWdlIHZhbHVlc1xuZnVuY3Rpb24gcGFyc2VSR0JOdW1iZXIoIHN0cjogc3RyaW5nICk6IG51bWJlciB7XG4gIGxldCBtdWx0aXBsaWVyID0gMTtcblxuICAvLyBpZiBpdCdzIGEgcGVyY2VudGFnZSwgc3RyaXAgaXQgb2ZmIGFuZCBoYW5kbGUgaXQgdGhhdCB3YXlcbiAgaWYgKCBzdHIuZW5kc1dpdGgoICclJyApICkge1xuICAgIG11bHRpcGxpZXIgPSAyLjU1O1xuICAgIHN0ciA9IHN0ci5zbGljZSggMCwgc3RyLmxlbmd0aCAtIDEgKTtcbiAgfVxuXG4gIHJldHVybiBVdGlscy5yb3VuZFN5bW1ldHJpYyggTnVtYmVyKCBzdHIgKSAqIG11bHRpcGxpZXIgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29sb3Ige1xuICAvLyBSR0JBIHZhbHVlc1xuICBwdWJsaWMgciE6IG51bWJlcjtcbiAgcHVibGljIGchOiBudW1iZXI7XG4gIHB1YmxpYyBiITogbnVtYmVyO1xuICBwdWJsaWMgYSE6IG51bWJlcjtcblxuICAvLyBGb3IgY2FjaGluZyBhbmQgcGVyZm9ybWFuY2VcbiAgcHJpdmF0ZSBfY3NzPzogc3RyaW5nO1xuXG4gIC8vIElmIGFzc2VydGlvbnMgYXJlIGVuYWJsZWRcbiAgcHJpdmF0ZSBpbW11dGFibGU/OiBib29sZWFuO1xuXG4gIC8vIEZpcmVzIHdoZW4gdGhlIGNvbG9yIGlzIGNoYW5nZWRcbiAgcHVibGljIHJlYWRvbmx5IGNoYW5nZUVtaXR0ZXI6IFRFbWl0dGVyO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgQ29sb3Igd2l0aCBhbiBpbml0aWFsIHZhbHVlLiBNdWx0aXBsZSBkaWZmZXJlbnQgdHlwZXMgb2YgcGFyYW1ldGVycyBhcmUgc3VwcG9ydGVkOlxuICAgKiAtIG5ldyBDb2xvciggY29sb3IgKSBpcyBhIGNvcHkgY29uc3RydWN0b3IsIGZvciBhIHtDb2xvcn1cbiAgICogLSBuZXcgQ29sb3IoIHN0cmluZyApIHdpbGwgcGFyc2UgdGhlIHN0cmluZyBhc3N1bWluZyBpdCdzIGEgQ1NTLWNvbXBhdGlibGUgY29sb3IsIGUuZy4gc2V0KCAncmVkJyApXG4gICAqIC0gbmV3IENvbG9yKCByLCBnLCBiICkgaXMgZXF1aXZhbGVudCB0byBzZXRSR0JBKCByLCBnLCBiLCAxICksIGUuZy4gc2V0KCAyNTUsIDAsIDEyOCApXG4gICAqIC0gbmV3IENvbG9yKCByLCBnLCBiLCBhICkgaXMgZXF1aXZhbGVudCB0byBzZXRSR0JBKCByLCBnLCBiLCBhICksIGUuZy4gc2V0KCAyNTUsIDAsIDEyOCwgMC41IClcbiAgICogLSBuZXcgQ29sb3IoIGhleCApIHdpbGwgc2V0IFJHQiB3aXRoIGFscGhhPTEsIGUuZy4gc2V0KCAweEZGMDAwMCApXG4gICAqIC0gbmV3IENvbG9yKCBoZXgsIGEgKSB3aWxsIHNldCBSR0JBLCBlLmcuIHNldCggMHhGRjAwMDAsIDEgKVxuICAgKiAtIG5ldyBDb2xvciggbnVsbCApIHdpbGwgYmUgdHJhbnNwYXJlbnRcbiAgICpcbiAgICogVGhlICdyJywgJ2cnLCBhbmQgJ2InIHZhbHVlcyBzdGFuZCBmb3IgcmVkLCBncmVlbiBhbmQgYmx1ZSByZXNwZWN0aXZlbHksIGFuZCB3aWxsIGJlIGNsYW1wZWQgdG8gaW50ZWdlcnMgaW4gMC0yNTUuXG4gICAqIFRoZSAnYScgdmFsdWUgc3RhbmRzIGZvciBhbHBoYSwgYW5kIHdpbGwgYmUgY2xhbXBlZCB0byAwLTEgKGZsb2F0aW5nIHBvaW50KVxuICAgKiAnaGV4JyBpbmRpY2F0ZXMgYSA2LWRlY2ltYWwtZGlnaXQgZm9ybWF0IGhleCBudW1iZXIsIGZvciBleGFtcGxlIDB4RkZBQTAwIGlzIGVxdWl2YWxlbnQgdG8gcj0yNTUsIGc9MTcwLCBiPTAuXG4gICAqXG4gICAqIEBwYXJhbSByIC0gU2VlIGFib3ZlIGZvciB0aGUgcG9zc2libGUgb3ZlcmxvYWRlZCB2YWx1ZXNcbiAgICogQHBhcmFtIFtnXSAtIElmIHByb3ZpZGVkLCBzaG91bGQgYmUgdGhlIGdyZWVuIHZhbHVlIChvciB0aGUgYWxwaGEgdmFsdWUgaWYgYSBoZXggY29sb3IgaXMgZ2l2ZW4pXG4gICAqIEBwYXJhbSBbYl0gLSBJZiBwcm92aWRlZCwgc2hvdWxkIGJlIHRoZSBibHVlIHZhbHVlXG4gICAqIEBwYXJhbSBbYV0gLSBJZiBwcm92aWRlZCwgc2hvdWxkIGJlIHRoZSBhbHBoYSB2YWx1ZVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb2xvcjogQ29sb3IgKTtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdHJpbmc6IHN0cmluZyApO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIsIGE/OiBudW1iZXIgKTtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBoZXg6IG51bWJlciwgYT86IG51bWJlciApO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHRyYW5zcGFyZW50OiBudWxsICk7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcjogbnVtYmVyIHwgQ29sb3IgfCBzdHJpbmcgfCBudWxsLCBnPzogbnVtYmVyLCBiPzogbnVtYmVyLCBhPzogbnVtYmVyICkge1xuXG4gICAgLy8ge0VtaXR0ZXJ9XG4gICAgdGhpcy5jaGFuZ2VFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XG5cbiAgICB0aGlzLnNldCggciwgZywgYiwgYSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgY29sb3IuXG4gICAqL1xuICBwdWJsaWMgY29weSgpOiBDb2xvciB7XG4gICAgcmV0dXJuIG5ldyBDb2xvciggdGhpcy5yLCB0aGlzLmcsIHRoaXMuYiwgdGhpcy5hICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWVzIG9mIHRoaXMgQ29sb3IuIFN1cHBvcnRlZCBzdHlsZXM6XG4gICAqXG4gICAqIC0gc2V0KCBjb2xvciApIGlzIGEgY29weSBjb25zdHJ1Y3RvclxuICAgKiAtIHNldCggc3RyaW5nICkgd2lsbCBwYXJzZSB0aGUgc3RyaW5nIGFzc3VtaW5nIGl0J3MgYSBDU1MtY29tcGF0aWJsZSBjb2xvciwgZS5nLiBzZXQoICdyZWQnIClcbiAgICogLSBzZXQoIHIsIGcsIGIgKSBpcyBlcXVpdmFsZW50IHRvIHNldFJHQkEoIHIsIGcsIGIsIDEgKSwgZS5nLiBzZXQoIDI1NSwgMCwgMTI4IClcbiAgICogLSBzZXQoIHIsIGcsIGIsIGEgKSBpcyBlcXVpdmFsZW50IHRvIHNldFJHQkEoIHIsIGcsIGIsIGEgKSwgZS5nLiBzZXQoIDI1NSwgMCwgMTI4LCAwLjUgKVxuICAgKiAtIHNldCggaGV4ICkgd2lsbCBzZXQgUkdCIHdpdGggYWxwaGE9MSwgZS5nLiBzZXQoIDB4RkYwMDAwIClcbiAgICogLSBzZXQoIGhleCwgYWxwaGEgKSB3aWxsIHNldCBSR0JBLCBlLmcuIHNldCggMHhGRjAwMDAsIDEgKVxuICAgKiAtIHNldCggbnVsbCApIHdpbGwgYmUgdHJhbnNwYXJlbnRcbiAgICpcbiAgICogQHBhcmFtIHIgLSBTZWUgYWJvdmUgZm9yIHRoZSBwb3NzaWJsZSBvdmVybG9hZGVkIHZhbHVlc1xuICAgKiBAcGFyYW0gW2ddIC0gSWYgcHJvdmlkZWQsIHNob3VsZCBiZSB0aGUgZ3JlZW4gdmFsdWUgKG9yIHRoZSBhbHBoYSB2YWx1ZSBpZiBhIGhleCBjb2xvciBpcyBnaXZlbilcbiAgICogQHBhcmFtIFtiXSAtIElmIHByb3ZpZGVkLCBzaG91bGQgYmUgdGhlIGJsdWUgdmFsdWVcbiAgICogQHBhcmFtIFthXSAtIElmIHByb3ZpZGVkLCBzaG91bGQgYmUgdGhlIGFscGhhIHZhbHVlXG4gICAqL1xuICBwdWJsaWMgc2V0KCByOiBudW1iZXIgfCBDb2xvciB8IHN0cmluZyB8IG51bGwsIGc/OiBudW1iZXIsIGI/OiBudW1iZXIsIGE/OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggciAhPT0gdW5kZWZpbmVkLCAnQ2FuXFwndCBjYWxsIENvbG9yLnNldCggdW5kZWZpbmVkICknICk7XG5cbiAgICBpZiAoIHIgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLnNldFJHQkEoIDAsIDAsIDAsIDAgKTtcbiAgICB9XG4gICAgLy8gc3VwcG9ydCBmb3Igc2V0KCBzdHJpbmcgKVxuICAgIGVsc2UgaWYgKCB0eXBlb2YgciA9PT0gJ3N0cmluZycgKSB7XG4gICAgICB0aGlzLnNldENTUyggciApO1xuICAgIH1cbiAgICAvLyBzdXBwb3J0IGZvciBzZXQoIGNvbG9yIClcbiAgICBlbHNlIGlmICggciBpbnN0YW5jZW9mIENvbG9yICkge1xuICAgICAgdGhpcy5zZXRSR0JBKCByLnIsIHIuZywgci5iLCByLmEgKTtcbiAgICB9XG4gICAgLy8gc3VwcG9ydCBmb3Igc2V0KCBoZXggKSBhbmQgc2V0KCBoZXgsIGFscGhhIClcbiAgICBlbHNlIGlmICggYiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBnID09PSAnbnVtYmVyJyApO1xuXG4gICAgICBjb25zdCByZWQgPSAoIHIgPj4gMTYgKSAmIDB4RkY7XG4gICAgICBjb25zdCBncmVlbiA9ICggciA+PiA4ICkgJiAweEZGO1xuICAgICAgY29uc3QgYmx1ZSA9ICggciA+PiAwICkgJiAweEZGO1xuICAgICAgY29uc3QgYWxwaGEgPSAoIGcgPT09IHVuZGVmaW5lZCApID8gMSA6IGc7XG4gICAgICB0aGlzLnNldFJHQkEoIHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhICk7XG4gICAgfVxuICAgIC8vIHN1cHBvcnQgZm9yIHNldCggciwgZywgYiApIGFuZCBzZXQoIHIsIGcsIGIsIGEgKVxuICAgIGVsc2Uge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBhID09PSAnbnVtYmVyJyApO1xuICAgICAgdGhpcy5zZXRSR0JBKCByLCBnISwgYiwgKCBhID09PSB1bmRlZmluZWQgKSA/IDEgOiBhICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIHN1cHBvcnQgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWQgdmFsdWUgYXMgYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDI1NVxuICAgKi9cbiAgcHVibGljIGdldFJlZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnI7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHJlZCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSZWQoKTsgfVxuXG4gIHB1YmxpYyBzZXQgcmVkKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFJlZCggdmFsdWUgKTsgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSByZWQgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnRlZ2VyIGJldHdlZW4gMCBhbmQgMjU1XG4gICAqL1xuICBwdWJsaWMgc2V0UmVkKCB2YWx1ZTogbnVtYmVyICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLnNldFJHQkEoIHZhbHVlLCB0aGlzLmcsIHRoaXMuYiwgdGhpcy5hICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZ3JlZW4gdmFsdWUgYXMgYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDI1NVxuICAgKi9cbiAgcHVibGljIGdldEdyZWVuKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZztcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZ3JlZW4oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0R3JlZW4oKTsgfVxuXG4gIHB1YmxpYyBzZXQgZ3JlZW4oIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0R3JlZW4oIHZhbHVlICk7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZ3JlZW4gdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnRlZ2VyIGJldHdlZW4gMCBhbmQgMjU1XG4gICAqL1xuICBwdWJsaWMgc2V0R3JlZW4oIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0UkdCQSggdGhpcy5yLCB2YWx1ZSwgdGhpcy5iLCB0aGlzLmEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBibHVlIHZhbHVlIGFzIGFuIGludGVnZXIgYmV0d2VlbiAwIGFuZCAyNTVcbiAgICovXG4gIHB1YmxpYyBnZXRCbHVlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYmx1ZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRCbHVlKCk7IH1cblxuICBwdWJsaWMgc2V0IGJsdWUoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0Qmx1ZSggdmFsdWUgKTsgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBibHVlIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgLSBXaWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDI1NVxuICAgKi9cbiAgcHVibGljIHNldEJsdWUoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0UkdCQSggdGhpcy5yLCB0aGlzLmcsIHZhbHVlLCB0aGlzLmEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhbHBoYSB2YWx1ZSBhcyBhIGZsb2F0aW5nLXBvaW50IHZhbHVlIGJldHdlZW4gMCBhbmQgMVxuICAgKi9cbiAgcHVibGljIGdldEFscGhhKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYWxwaGEoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0QWxwaGEoKTsgfVxuXG4gIHB1YmxpYyBzZXQgYWxwaGEoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0QWxwaGEoIHZhbHVlICk7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYWxwaGEgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFdpbGwgYmUgY2xhbXBlZCBiZXR3ZWVuIDAgYW5kIDFcbiAgICovXG4gIHB1YmxpYyBzZXRBbHBoYSggdmFsdWU6IG51bWJlciApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRSR0JBKCB0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoaXMgQ29sb3IgdXNpbmcgUkdCIGludGVncmFsIGJldHdlZW4gMC0yNTUsIGFscGhhIChmbG9hdCkgYmV0d2VlbiAwLTEuXG4gICAqL1xuICBwdWJsaWMgc2V0UkdCQSggcmVkOiBudW1iZXIsIGdyZWVuOiBudW1iZXIsIGJsdWU6IG51bWJlciwgYWxwaGE6IG51bWJlciApOiB0aGlzIHtcbiAgICB0aGlzLnIgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggY2xhbXAoIHJlZCwgMCwgMjU1ICkgKTtcbiAgICB0aGlzLmcgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggY2xhbXAoIGdyZWVuLCAwLCAyNTUgKSApO1xuICAgIHRoaXMuYiA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBjbGFtcCggYmx1ZSwgMCwgMjU1ICkgKTtcbiAgICB0aGlzLmEgPSBjbGFtcCggYWxwaGEsIDAsIDEgKTtcblxuICAgIHRoaXMudXBkYXRlQ29sb3IoKTsgLy8gdXBkYXRlIHRoZSBjYWNoZWQgdmFsdWVcblxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbGluZWFyIChnYW1tYS1jb3JyZWN0ZWQpIGludGVycG9sYXRpb24gYmV0d2VlbiB0aGlzIGNvbG9yIChyYXRpbz0wKSBhbmQgYW5vdGhlciBjb2xvciAocmF0aW89MSkuXG4gICAqXG4gICAqIEBwYXJhbSBvdGhlckNvbG9yXG4gICAqIEBwYXJhbSByYXRpbyAtIE5vdCBuZWNlc3NhcmlseSBjb25zdHJhaW5lZCBpbiBbMCwgMV1cbiAgICovXG4gIHB1YmxpYyBibGVuZCggb3RoZXJDb2xvcjogQ29sb3IsIHJhdGlvOiBudW1iZXIgKTogQ29sb3Ige1xuICAgIGNvbnN0IGdhbW1hID0gMi40O1xuICAgIGNvbnN0IGxpbmVhclJlZEEgPSBNYXRoLnBvdyggdGhpcy5yLCBnYW1tYSApO1xuICAgIGNvbnN0IGxpbmVhclJlZEIgPSBNYXRoLnBvdyggb3RoZXJDb2xvci5yLCBnYW1tYSApO1xuICAgIGNvbnN0IGxpbmVhckdyZWVuQSA9IE1hdGgucG93KCB0aGlzLmcsIGdhbW1hICk7XG4gICAgY29uc3QgbGluZWFyR3JlZW5CID0gTWF0aC5wb3coIG90aGVyQ29sb3IuZywgZ2FtbWEgKTtcbiAgICBjb25zdCBsaW5lYXJCbHVlQSA9IE1hdGgucG93KCB0aGlzLmIsIGdhbW1hICk7XG4gICAgY29uc3QgbGluZWFyQmx1ZUIgPSBNYXRoLnBvdyggb3RoZXJDb2xvci5iLCBnYW1tYSApO1xuXG4gICAgY29uc3QgciA9IE1hdGgucG93KCBsaW5lYXJSZWRBICsgKCBsaW5lYXJSZWRCIC0gbGluZWFyUmVkQSApICogcmF0aW8sIDEgLyBnYW1tYSApO1xuICAgIGNvbnN0IGcgPSBNYXRoLnBvdyggbGluZWFyR3JlZW5BICsgKCBsaW5lYXJHcmVlbkIgLSBsaW5lYXJHcmVlbkEgKSAqIHJhdGlvLCAxIC8gZ2FtbWEgKTtcbiAgICBjb25zdCBiID0gTWF0aC5wb3coIGxpbmVhckJsdWVBICsgKCBsaW5lYXJCbHVlQiAtIGxpbmVhckJsdWVBICkgKiByYXRpbywgMSAvIGdhbW1hICk7XG4gICAgY29uc3QgYSA9IHRoaXMuYSArICggb3RoZXJDb2xvci5hIC0gdGhpcy5hICkgKiByYXRpbztcblxuICAgIHJldHVybiBuZXcgQ29sb3IoIHIsIGcsIGIsIGEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGludGVybmFsbHkgdG8gY29tcHV0ZSB0aGUgQ1NTIHN0cmluZyBmb3IgdGhpcyBjb2xvci4gVXNlIHRvQ1NTKClcbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZUNTUygpOiBzdHJpbmcge1xuICAgIGlmICggdGhpcy5hID09PSAxICkge1xuICAgICAgcmV0dXJuIGByZ2IoJHt0aGlzLnJ9LCR7dGhpcy5nfSwke3RoaXMuYn0pYDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBTaW5jZSBTVkcgZG9lc24ndCBzdXBwb3J0IHBhcnNpbmcgc2NpZW50aWZpYyBub3RhdGlvbiAoZS5nLiA3ZTUpLCB3ZSBuZWVkIHRvIG91dHB1dCBmaXhlZCBkZWNpbWFsLXBvaW50IHN0cmluZ3MuXG4gICAgICAvLyBTaW5jZSB0aGlzIG5lZWRzIHRvIGJlIGRvbmUgcXVpY2tseSwgYW5kIHdlIGRvbid0IHBhcnRpY3VsYXJseSBjYXJlIGFib3V0IHNsaWdodCByb3VuZGluZyBkaWZmZXJlbmNlcyAoaXQnc1xuICAgICAgLy8gYmVpbmcgdXNlZCBmb3IgZGlzcGxheSBwdXJwb3NlcyBvbmx5LCBhbmQgaXMgbmV2ZXIgc2hvd24gdG8gdGhlIHVzZXIpLCB3ZSB1c2UgdGhlIGJ1aWx0LWluIEpTIHRvRml4ZWQgaW5zdGVhZCBvZlxuICAgICAgLy8gRG90J3MgdmVyc2lvbiBvZiB0b0ZpeGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzUwXG4gICAgICBsZXQgYWxwaGEgPSB0aGlzLmEudG9GaXhlZCggMjAgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgICAgd2hpbGUgKCBhbHBoYS5sZW5ndGggPj0gMiAmJiBhbHBoYS5lbmRzV2l0aCggJzAnICkgJiYgYWxwaGFbIGFscGhhLmxlbmd0aCAtIDIgXSAhPT0gJy4nICkge1xuICAgICAgICBhbHBoYSA9IGFscGhhLnNsaWNlKCAwLCBhbHBoYS5sZW5ndGggLSAxICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFscGhhU3RyaW5nID0gdGhpcy5hID09PSAwIHx8IHRoaXMuYSA9PT0gMSA/IHRoaXMuYSA6IGFscGhhO1xuICAgICAgcmV0dXJuIGByZ2JhKCR7dGhpcy5yfSwke3RoaXMuZ30sJHt0aGlzLmJ9LCR7YWxwaGFTdHJpbmd9KWA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoaXMgQ29sb3IgYXMgYSBDU1Mgc3RyaW5nLlxuICAgKi9cbiAgcHVibGljIHRvQ1NTKCk6IHN0cmluZyB7XG4gICAgLy8gdmVyaWZ5IHRoYXQgdGhlIGNhY2hlZCB2YWx1ZSBpcyBjb3JyZWN0IChpbiBkZWJ1Z2dpbmcgYnVpbGRzIG9ubHksIGRlZmVhdHMgdGhlIHBvaW50IG9mIGNhY2hpbmcgb3RoZXJ3aXNlKVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2NzcyA9PT0gdGhpcy5jb21wdXRlQ1NTKCksIGBDU1MgY2FjaGVkIHZhbHVlIGlzICR7dGhpcy5fY3NzfSwgYnV0IHRoZSBjb21wdXRlZCB2YWx1ZSBhcHBlYXJzIHRvIGJlICR7dGhpcy5jb21wdXRlQ1NTKCl9YCApO1xuXG4gICAgcmV0dXJuIHRoaXMuX2NzcyE7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIGNvbG9yIGZvciBhIENTUyBjb2xvciBzdHJpbmcuXG4gICAqL1xuICBwdWJsaWMgc2V0Q1NTKCBjc3NTdHJpbmc6IHN0cmluZyApOiB0aGlzIHtcbiAgICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICAgIGNvbnN0IHN0ciA9IENvbG9yLnByZXByb2Nlc3NDU1MoIGNzc1N0cmluZyApO1xuXG4gICAgLy8gcnVuIHRocm91Z2ggdGhlIGF2YWlsYWJsZSB0ZXh0IGZvcm1hdHNcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBDb2xvci5mb3JtYXRQYXJzZXJzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgcGFyc2VyID0gQ29sb3IuZm9ybWF0UGFyc2Vyc1sgaSBdO1xuXG4gICAgICBjb25zdCBtYXRjaGVzID0gcGFyc2VyLnJlZ2V4cC5leGVjKCBzdHIgKTtcbiAgICAgIGlmICggbWF0Y2hlcyApIHtcbiAgICAgICAgcGFyc2VyLmFwcGx5KCB0aGlzLCBtYXRjaGVzICk7XG4gICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoICFzdWNjZXNzICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgQ29sb3IgdW5hYmxlIHRvIHBhcnNlIGNvbG9yIHN0cmluZzogJHtjc3NTdHJpbmd9YCApO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlQ29sb3IoKTsgLy8gdXBkYXRlIHRoZSBjYWNoZWQgdmFsdWVcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBjb2xvcidzIFJHQiBpbmZvcm1hdGlvbiBpbiB0aGUgaGV4YWRlY2ltYWwgbnVtYmVyIGVxdWl2YWxlbnQsIGUuZy4gMHhGRjAwRkZcbiAgICovXG4gIHB1YmxpYyB0b051bWJlcigpOiBudW1iZXIge1xuICAgIHJldHVybiAoIHRoaXMuciA8PCAxNiApICsgKCB0aGlzLmcgPDwgOCApICsgdGhpcy5iO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB0byB1cGRhdGUgdGhlIGludGVybmFsbHkgY2FjaGVkIENTUyB2YWx1ZVxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVDb2xvcigpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pbW11dGFibGUsXG4gICAgICAnQ2Fubm90IG1vZGlmeSBhbiBpbW11dGFibGUgY29sb3IuIExpa2VseSBjYXVzZWQgYnkgdHJ5aW5nIHRvIG11dGF0ZSBhIGNvbG9yIGFmdGVyIGl0IHdhcyB1c2VkIGZvciBhIG5vZGUgZmlsbC9zdHJva2UnICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5yZWQgPT09ICdudW1iZXInICYmXG4gICAgdHlwZW9mIHRoaXMuZ3JlZW4gPT09ICdudW1iZXInICYmXG4gICAgdHlwZW9mIHRoaXMuYmx1ZSA9PT0gJ251bWJlcicgJiZcbiAgICB0eXBlb2YgdGhpcy5hbHBoYSA9PT0gJ251bWJlcicsXG4gICAgICBgRW5zdXJlIGNvbG9yIGNvbXBvbmVudHMgYXJlIG51bWVyaWM6ICR7dGhpcy50b1N0cmluZygpfWAgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLnJlZCApICYmIGlzRmluaXRlKCB0aGlzLmdyZWVuICkgJiYgaXNGaW5pdGUoIHRoaXMuYmx1ZSApICYmIGlzRmluaXRlKCB0aGlzLmFscGhhICksXG4gICAgICAnRW5zdXJlIGNvbG9yIGNvbXBvbmVudHMgYXJlIGZpbml0ZSBhbmQgbm90IE5hTicgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucmVkID49IDAgJiYgdGhpcy5yZWQgPD0gMjU1ICYmXG4gICAgdGhpcy5ncmVlbiA+PSAwICYmIHRoaXMuZ3JlZW4gPD0gMjU1ICYmXG4gICAgdGhpcy5yZWQgPj0gMCAmJiB0aGlzLnJlZCA8PSAyNTUgJiZcbiAgICB0aGlzLmFscGhhID49IDAgJiYgdGhpcy5hbHBoYSA8PSAxLFxuICAgICAgYEVuc3VyZSBjb2xvciBjb21wb25lbnRzIGFyZSBpbiB0aGUgcHJvcGVyIHJhbmdlczogJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgY29uc3Qgb2xkQ1NTID0gdGhpcy5fY3NzO1xuICAgIHRoaXMuX2NzcyA9IHRoaXMuY29tcHV0ZUNTUygpO1xuXG4gICAgLy8gbm90aWZ5IGxpc3RlbmVycyBpZiBpdCBjaGFuZ2VkXG4gICAgaWYgKCBvbGRDU1MgIT09IHRoaXMuX2NzcyApIHtcbiAgICAgIHRoaXMuY2hhbmdlRW1pdHRlci5lbWl0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93IHNldHRpbmcgdGhpcyBDb2xvciB0byBiZSBpbW11dGFibGUgd2hlbiBhc3NlcnRpb25zIGFyZSBkaXNhYmxlZC4gYW55IGNoYW5nZSB3aWxsIHRocm93IGFuIGVycm9yXG4gICAqL1xuICBwdWJsaWMgc2V0SW1tdXRhYmxlKCk6IHRoaXMge1xuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgdGhpcy5pbW11dGFibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHBhc3NlZCB0byBhIENhbnZhcyBjb250ZXh0J3MgZmlsbFN0eWxlIG9yIHN0cm9rZVN0eWxlLlxuICAgKi9cbiAgcHVibGljIGdldENhbnZhc1N0eWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudG9DU1MoKTsgLy8gc2hvdWxkIGJlIGlubGluZWQsIGxlYXZlIGxpa2UgdGhpcyBmb3IgZnV0dXJlIG1haW50YWluYWJpbGl0eVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBjb2xvciB1c2luZyBIU0xBIHZhbHVlcy5cbiAgICpcbiAgICogVE9ETzogbWFrZSBhIGdldEh1ZSwgZ2V0U2F0dXJhdGlvbiwgZ2V0TGlnaHRuZXNzLiB3ZSBjYW4gdGhlbiBleHBvc2UgdGhlbSB2aWEgRVM1ISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKlxuICAgKiBAcGFyYW0gaHVlIC0gaW50ZWdlciBtb2R1bG8gMzYwXG4gICAqIEBwYXJhbSBzYXR1cmF0aW9uIC0gcGVyY2VudGFnZVxuICAgKiBAcGFyYW0gbGlnaHRuZXNzIC0gcGVyY2VudGFnZVxuICAgKiBAcGFyYW0gYWxwaGFcbiAgICovXG4gIHB1YmxpYyBzZXRIU0xBKCBodWU6IG51bWJlciwgc2F0dXJhdGlvbjogbnVtYmVyLCBsaWdodG5lc3M6IG51bWJlciwgYWxwaGE6IG51bWJlciApOiB0aGlzIHtcbiAgICBodWUgPSAoIGh1ZSAlIDM2MCApIC8gMzYwO1xuICAgIHNhdHVyYXRpb24gPSBjbGFtcCggc2F0dXJhdGlvbiAvIDEwMCwgMCwgMSApO1xuICAgIGxpZ2h0bmVzcyA9IGNsYW1wKCBsaWdodG5lc3MgLyAxMDAsIDAsIDEgKTtcblxuICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLWNvbG9yL1xuICAgIGxldCBtMjtcbiAgICBpZiAoIGxpZ2h0bmVzcyA8IDAuNSApIHtcbiAgICAgIG0yID0gbGlnaHRuZXNzICogKCBzYXR1cmF0aW9uICsgMSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG0yID0gbGlnaHRuZXNzICsgc2F0dXJhdGlvbiAtIGxpZ2h0bmVzcyAqIHNhdHVyYXRpb247XG4gICAgfVxuICAgIGNvbnN0IG0xID0gbGlnaHRuZXNzICogMiAtIG0yO1xuXG4gICAgdGhpcy5yID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIENvbG9yLmh1ZVRvUkdCKCBtMSwgbTIsIGh1ZSArIDEgLyAzICkgKiAyNTUgKTtcbiAgICB0aGlzLmcgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggQ29sb3IuaHVlVG9SR0IoIG0xLCBtMiwgaHVlICkgKiAyNTUgKTtcbiAgICB0aGlzLmIgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggQ29sb3IuaHVlVG9SR0IoIG0xLCBtMiwgaHVlIC0gMSAvIDMgKSAqIDI1NSApO1xuICAgIHRoaXMuYSA9IGNsYW1wKCBhbHBoYSwgMCwgMSApO1xuXG4gICAgdGhpcy51cGRhdGVDb2xvcigpOyAvLyB1cGRhdGUgdGhlIGNhY2hlZCB2YWx1ZVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwdWJsaWMgZXF1YWxzKCBjb2xvcjogQ29sb3IgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuciA9PT0gY29sb3IuciAmJiB0aGlzLmcgPT09IGNvbG9yLmcgJiYgdGhpcy5iID09PSBjb2xvci5iICYmIHRoaXMuYSA9PT0gY29sb3IuYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY29weSBvZiB0aGlzIGNvbG9yIHdpdGggYSBkaWZmZXJlbnQgYWxwaGEgdmFsdWUuXG4gICAqL1xuICBwdWJsaWMgd2l0aEFscGhhKCBhbHBoYTogbnVtYmVyICk6IENvbG9yIHtcbiAgICByZXR1cm4gbmV3IENvbG9yKCB0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCBhbHBoYSApO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0ZhY3RvciggZmFjdG9yPzogbnVtYmVyICk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFjdG9yID09PSB1bmRlZmluZWQgfHwgKCBmYWN0b3IgPj0gMCAmJiBmYWN0b3IgPD0gMSApLCBgZmFjdG9yIG11c3QgYmUgYmV0d2VlbiAwIGFuZCAxOiAke2ZhY3Rvcn1gICk7XG5cbiAgICByZXR1cm4gKCBmYWN0b3IgPT09IHVuZGVmaW5lZCApID8gMC43IDogZmFjdG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hdGNoZXMgSmF2YSdzIENvbG9yLmJyaWdodGVyKClcbiAgICovXG4gIHB1YmxpYyBicmlnaHRlckNvbG9yKCBmYWN0b3I/OiBudW1iZXIgKTogQ29sb3Ige1xuICAgIGZhY3RvciA9IHRoaXMuY2hlY2tGYWN0b3IoIGZhY3RvciApO1xuICAgIGNvbnN0IHJlZCA9IE1hdGgubWluKCAyNTUsIE1hdGguZmxvb3IoIHRoaXMuciAvIGZhY3RvciApICk7XG4gICAgY29uc3QgZ3JlZW4gPSBNYXRoLm1pbiggMjU1LCBNYXRoLmZsb29yKCB0aGlzLmcgLyBmYWN0b3IgKSApO1xuICAgIGNvbnN0IGJsdWUgPSBNYXRoLm1pbiggMjU1LCBNYXRoLmZsb29yKCB0aGlzLmIgLyBmYWN0b3IgKSApO1xuICAgIHJldHVybiBuZXcgQ29sb3IoIHJlZCwgZ3JlZW4sIGJsdWUsIHRoaXMuYSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEJyaWdodGVucyBhIGNvbG9yIGluIFJHQiBzcGFjZS4gVXNlZnVsIHdoZW4gY3JlYXRpbmcgZ3JhZGllbnRzIGZyb20gYSBzaW5nbGUgYmFzZSBjb2xvci5cbiAgICpcbiAgICogQHBhcmFtIFtmYWN0b3JdIC0gMCAobm8gY2hhbmdlKSB0byAxICh3aGl0ZSlcbiAgICogQHJldHVybnMgLSAoY2xvc2VyIHRvIHdoaXRlKSB2ZXJzaW9uIG9mIHRoZSBvcmlnaW5hbCBjb2xvci5cbiAgICovXG4gIHB1YmxpYyBjb2xvclV0aWxzQnJpZ2h0ZXIoIGZhY3Rvcj86IG51bWJlciApOiBDb2xvciB7XG4gICAgZmFjdG9yID0gdGhpcy5jaGVja0ZhY3RvciggZmFjdG9yICk7XG4gICAgY29uc3QgcmVkID0gTWF0aC5taW4oIDI1NSwgdGhpcy5nZXRSZWQoKSArIE1hdGguZmxvb3IoIGZhY3RvciAqICggMjU1IC0gdGhpcy5nZXRSZWQoKSApICkgKTtcbiAgICBjb25zdCBncmVlbiA9IE1hdGgubWluKCAyNTUsIHRoaXMuZ2V0R3JlZW4oKSArIE1hdGguZmxvb3IoIGZhY3RvciAqICggMjU1IC0gdGhpcy5nZXRHcmVlbigpICkgKSApO1xuICAgIGNvbnN0IGJsdWUgPSBNYXRoLm1pbiggMjU1LCB0aGlzLmdldEJsdWUoKSArIE1hdGguZmxvb3IoIGZhY3RvciAqICggMjU1IC0gdGhpcy5nZXRCbHVlKCkgKSApICk7XG4gICAgcmV0dXJuIG5ldyBDb2xvciggcmVkLCBncmVlbiwgYmx1ZSwgdGhpcy5nZXRBbHBoYSgpICk7XG4gIH1cblxuICAvKipcbiAgICogTWF0Y2hlcyBKYXZhJ3MgQ29sb3IuZGFya2VyKClcbiAgICovXG4gIHB1YmxpYyBkYXJrZXJDb2xvciggZmFjdG9yPzogbnVtYmVyICk6IENvbG9yIHtcbiAgICBmYWN0b3IgPSB0aGlzLmNoZWNrRmFjdG9yKCBmYWN0b3IgKTtcbiAgICBjb25zdCByZWQgPSBNYXRoLm1heCggMCwgTWF0aC5mbG9vciggZmFjdG9yICogdGhpcy5yICkgKTtcbiAgICBjb25zdCBncmVlbiA9IE1hdGgubWF4KCAwLCBNYXRoLmZsb29yKCBmYWN0b3IgKiB0aGlzLmcgKSApO1xuICAgIGNvbnN0IGJsdWUgPSBNYXRoLm1heCggMCwgTWF0aC5mbG9vciggZmFjdG9yICogdGhpcy5iICkgKTtcbiAgICByZXR1cm4gbmV3IENvbG9yKCByZWQsIGdyZWVuLCBibHVlLCB0aGlzLmEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEYXJrZW4gYSBjb2xvciBpbiBSR0Igc3BhY2UuIFVzZWZ1bCB3aGVuIGNyZWF0aW5nIGdyYWRpZW50cyBmcm9tIGEgc2luZ2xlXG4gICAqIGJhc2UgY29sb3IuXG4gICAqXG4gICAqIEBwYXJhbSBbZmFjdG9yXSAtIDAgKG5vIGNoYW5nZSkgdG8gMSAoYmxhY2spXG4gICAqIEByZXR1cm5zIC0gZGFya2VyIChjbG9zZXIgdG8gYmxhY2spIHZlcnNpb24gb2YgdGhlIG9yaWdpbmFsIGNvbG9yLlxuICAgKi9cbiAgcHVibGljIGNvbG9yVXRpbHNEYXJrZXIoIGZhY3Rvcj86IG51bWJlciApOiBDb2xvciB7XG4gICAgZmFjdG9yID0gdGhpcy5jaGVja0ZhY3RvciggZmFjdG9yICk7XG4gICAgY29uc3QgcmVkID0gTWF0aC5tYXgoIDAsIHRoaXMuZ2V0UmVkKCkgLSBNYXRoLmZsb29yKCBmYWN0b3IgKiB0aGlzLmdldFJlZCgpICkgKTtcbiAgICBjb25zdCBncmVlbiA9IE1hdGgubWF4KCAwLCB0aGlzLmdldEdyZWVuKCkgLSBNYXRoLmZsb29yKCBmYWN0b3IgKiB0aGlzLmdldEdyZWVuKCkgKSApO1xuICAgIGNvbnN0IGJsdWUgPSBNYXRoLm1heCggMCwgdGhpcy5nZXRCbHVlKCkgLSBNYXRoLmZsb29yKCBmYWN0b3IgKiB0aGlzLmdldEJsdWUoKSApICk7XG4gICAgcmV0dXJuIG5ldyBDb2xvciggcmVkLCBncmVlbiwgYmx1ZSwgdGhpcy5nZXRBbHBoYSgpICk7XG4gIH1cblxuICAvKipcbiAgICogTGlrZSBjb2xvclV0aWxzQnJpZ2h0ZXIvRGFya2VyLCBob3dldmVyIGZhY3RvciBzaG91bGQgYmUgaW4gdGhlIHJhbmdlIC0xIHRvIDEsIGFuZCBpdCB3aWxsIGNhbGw6XG4gICAqICAgY29sb3JVdGlsc0JyaWdodGVyKCBmYWN0b3IgKSAgIGZvciBmYWN0b3IgPiAgMFxuICAgKiAgIHRoaXMgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgZmFjdG9yID09IDBcbiAgICogICBjb2xvclV0aWxzRGFya2VyKCAtZmFjdG9yICkgICAgZm9yIGZhY3RvciA8ICAwXG4gICAqXG4gICAqIEBwYXJhbSBmYWN0b3IgZnJvbSAtMSAoYmxhY2spLCB0byAwIChubyBjaGFuZ2UpLCB0byAxICh3aGl0ZSlcbiAgICovXG4gIHB1YmxpYyBjb2xvclV0aWxzQnJpZ2h0bmVzcyggZmFjdG9yOiBudW1iZXIgKTogQ29sb3Ige1xuICAgIGlmICggZmFjdG9yID09PSAwICkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBmYWN0b3IgPiAwICkge1xuICAgICAgcmV0dXJuIHRoaXMuY29sb3JVdGlsc0JyaWdodGVyKCBmYWN0b3IgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb2xvclV0aWxzRGFya2VyKCAtZmFjdG9yICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxuICAgKi9cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1bcjoke3RoaXMucn0gZzoke3RoaXMuZ30gYjoke3RoaXMuYn0gYToke3RoaXMuYX1dYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRvIGEgaGV4IHN0cmluZywgdGhhdCBzdGFydHMgd2l0aCBcIiNcIi5cbiAgICovXG4gIHB1YmxpYyB0b0hleFN0cmluZygpOiBzdHJpbmcge1xuICAgIGxldCBoZXhTdHJpbmcgPSB0aGlzLnRvTnVtYmVyKCkudG9TdHJpbmcoIDE2ICk7XG4gICAgd2hpbGUgKCBoZXhTdHJpbmcubGVuZ3RoIDwgNiApIHtcbiAgICAgIGhleFN0cmluZyA9IGAwJHtoZXhTdHJpbmd9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAjJHtoZXhTdHJpbmd9YDtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0YXRlT2JqZWN0KCk6IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlcjsgYTogbnVtYmVyIH0ge1xuICAgIHJldHVybiB7XG4gICAgICByOiB0aGlzLnIsXG4gICAgICBnOiB0aGlzLmcsXG4gICAgICBiOiB0aGlzLmIsXG4gICAgICBhOiB0aGlzLmFcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24sIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLWNvbG9yL1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBodWVUb1JHQiggbTE6IG51bWJlciwgbTI6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgaWYgKCBoIDwgMCApIHtcbiAgICAgIGggPSBoICsgMTtcbiAgICB9XG4gICAgaWYgKCBoID4gMSApIHtcbiAgICAgIGggPSBoIC0gMTtcbiAgICB9XG4gICAgaWYgKCBoICogNiA8IDEgKSB7XG4gICAgICByZXR1cm4gbTEgKyAoIG0yIC0gbTEgKSAqIGggKiA2O1xuICAgIH1cbiAgICBpZiAoIGggKiAyIDwgMSApIHtcbiAgICAgIHJldHVybiBtMjtcbiAgICB9XG4gICAgaWYgKCBoICogMyA8IDIgKSB7XG4gICAgICByZXR1cm4gbTEgKyAoIG0yIC0gbTEgKSAqICggMiAvIDMgLSBoICkgKiA2O1xuICAgIH1cbiAgICByZXR1cm4gbTE7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24gdGhhdCBjb252ZXJ0cyBhIGNvbG9yIHNwZWMgdG8gYSBjb2xvciBvYmplY3QgaWYgbmVjZXNzYXJ5LCBvciBzaW1wbHkgcmV0dXJucyB0aGUgY29sb3Igb2JqZWN0XG4gICAqIGlmIG5vdC5cbiAgICpcbiAgICogUGxlYXNlIG5vdGUgdGhlcmUgaXMgbm8gZGVmZW5zaXZlIGNvcHkgd2hlbiBhIGNvbG9yIGlzIHBhc3NlZCBpbiB1bmxpa2UgUGFpbnREZWYuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRvQ29sb3IoIGNvbG9yU3BlYzogVENvbG9yICk6IENvbG9yIHtcbiAgICBpZiAoIGNvbG9yU3BlYyA9PT0gbnVsbCApIHtcbiAgICAgIHJldHVybiBDb2xvci5UUkFOU1BBUkVOVDtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGNvbG9yU3BlYyBpbnN0YW5jZW9mIENvbG9yICkge1xuICAgICAgcmV0dXJuIGNvbG9yU3BlYztcbiAgICB9XG4gICAgZWxzZSBpZiAoIHR5cGVvZiBjb2xvclNwZWMgPT09ICdzdHJpbmcnICkge1xuICAgICAgcmV0dXJuIG5ldyBDb2xvciggY29sb3JTcGVjICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIENvbG9yLnRvQ29sb3IoIGNvbG9yU3BlYy52YWx1ZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcnBvbGF0ZXMgYmV0d2VlbiAyIGNvbG9ycyBpbiBSR0JBIHNwYWNlLiBXaGVuIGRpc3RhbmNlIGlzIDAsIGNvbG9yMSBpcyByZXR1cm5lZC4gV2hlbiBkaXN0YW5jZSBpcyAxLCBjb2xvcjIgaXNcbiAgICogcmV0dXJuZWQuIE90aGVyIHZhbHVlcyBvZiBkaXN0YW5jZSByZXR1cm4gYSBjb2xvciBzb21ld2hlcmUgYmV0d2VlbiBjb2xvcjEgYW5kIGNvbG9yMi4gRWFjaCBjb2xvciBjb21wb25lbnQgaXNcbiAgICogaW50ZXJwb2xhdGVkIHNlcGFyYXRlbHkuXG4gICAqXG4gICAqIEBwYXJhbSBjb2xvcjFcbiAgICogQHBhcmFtIGNvbG9yMlxuICAgKiBAcGFyYW0gZGlzdGFuY2UgZGlzdGFuY2UgYmV0d2VlbiBjb2xvcjEgYW5kIGNvbG9yMiwgMCA8PSBkaXN0YW5jZSA8PSAxXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGludGVycG9sYXRlUkdCQSggY29sb3IxOiBDb2xvciwgY29sb3IyOiBDb2xvciwgZGlzdGFuY2U6IG51bWJlciApOiBDb2xvciB7XG4gICAgaWYgKCBkaXN0YW5jZSA8IDAgfHwgZGlzdGFuY2UgPiAxICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgZGlzdGFuY2UgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDE6ICR7ZGlzdGFuY2V9YCApO1xuICAgIH1cbiAgICBjb25zdCByID0gTWF0aC5mbG9vciggbGluZWFyKCAwLCAxLCBjb2xvcjEuciwgY29sb3IyLnIsIGRpc3RhbmNlICkgKTtcbiAgICBjb25zdCBnID0gTWF0aC5mbG9vciggbGluZWFyKCAwLCAxLCBjb2xvcjEuZywgY29sb3IyLmcsIGRpc3RhbmNlICkgKTtcbiAgICBjb25zdCBiID0gTWF0aC5mbG9vciggbGluZWFyKCAwLCAxLCBjb2xvcjEuYiwgY29sb3IyLmIsIGRpc3RhbmNlICkgKTtcbiAgICBjb25zdCBhID0gbGluZWFyKCAwLCAxLCBjb2xvcjEuYSwgY29sb3IyLmEsIGRpc3RhbmNlICk7XG4gICAgcmV0dXJuIG5ldyBDb2xvciggciwgZywgYiwgYSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBibGVuZGVkIGNvbG9yIGFzIGEgbWl4IGJldHdlZW4gdGhlIGdpdmVuIGNvbG9ycy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc3VwZXJzYW1wbGVCbGVuZCggY29sb3JzOiBDb2xvcltdICk6IENvbG9yIHtcbiAgICAvLyBoYXJkLWNvZGVkIGdhbW1hIChhc3N1bWluZyB0aGUgZXhwb25lbnRpYWwgcGFydCBvZiB0aGUgc1JHQiBjdXJ2ZSBhcyBhIHNpbXBsaWZpY2F0aW9uKVxuICAgIGNvbnN0IEdBTU1BID0gMi4yO1xuXG4gICAgLy8gbWFwcyB0byBbMCwxXSBsaW5lYXIgY29sb3JzcGFjZVxuICAgIGNvbnN0IHJlZHMgPSBjb2xvcnMubWFwKCBjb2xvciA9PiBNYXRoLnBvdyggY29sb3IuciAvIDI1NSwgR0FNTUEgKSApO1xuICAgIGNvbnN0IGdyZWVucyA9IGNvbG9ycy5tYXAoIGNvbG9yID0+IE1hdGgucG93KCBjb2xvci5nIC8gMjU1LCBHQU1NQSApICk7XG4gICAgY29uc3QgYmx1ZXMgPSBjb2xvcnMubWFwKCBjb2xvciA9PiBNYXRoLnBvdyggY29sb3IuYiAvIDI1NSwgR0FNTUEgKSApO1xuICAgIGNvbnN0IGFscGhhcyA9IGNvbG9ycy5tYXAoIGNvbG9yID0+IE1hdGgucG93KCBjb2xvci5hLCBHQU1NQSApICk7XG5cbiAgICBjb25zdCBhbHBoYVN1bSA9IF8uc3VtKCBhbHBoYXMgKTtcblxuICAgIGlmICggYWxwaGFTdW0gPT09IDAgKSB7XG4gICAgICByZXR1cm4gbmV3IENvbG9yKCAwLCAwLCAwLCAwICk7XG4gICAgfVxuXG4gICAgLy8gYmxlbmRpbmcgb2YgcGl4ZWxzLCB3ZWlnaHRlZCBieSBhbHBoYXNcbiAgICBjb25zdCByZWQgPSBfLnN1bSggXy5yYW5nZSggMCwgY29sb3JzLmxlbmd0aCApLm1hcCggaSA9PiByZWRzWyBpIF0gKiBhbHBoYXNbIGkgXSApICkgLyBhbHBoYVN1bTtcbiAgICBjb25zdCBncmVlbiA9IF8uc3VtKCBfLnJhbmdlKCAwLCBjb2xvcnMubGVuZ3RoICkubWFwKCBpID0+IGdyZWVuc1sgaSBdICogYWxwaGFzWyBpIF0gKSApIC8gYWxwaGFTdW07XG4gICAgY29uc3QgYmx1ZSA9IF8uc3VtKCBfLnJhbmdlKCAwLCBjb2xvcnMubGVuZ3RoICkubWFwKCBpID0+IGJsdWVzWyBpIF0gKiBhbHBoYXNbIGkgXSApICkgLyBhbHBoYVN1bTtcbiAgICBjb25zdCBhbHBoYSA9IGFscGhhU3VtIC8gY29sb3JzLmxlbmd0aDsgLy8gYXZlcmFnZSBvZiBhbHBoYXNcblxuICAgIHJldHVybiBuZXcgQ29sb3IoXG4gICAgICBNYXRoLmZsb29yKCBNYXRoLnBvdyggcmVkLCAxIC8gR0FNTUEgKSAqIDI1NSApLFxuICAgICAgTWF0aC5mbG9vciggTWF0aC5wb3coIGdyZWVuLCAxIC8gR0FNTUEgKSAqIDI1NSApLFxuICAgICAgTWF0aC5mbG9vciggTWF0aC5wb3coIGJsdWUsIDEgLyBHQU1NQSApICogMjU1ICksXG4gICAgICBNYXRoLnBvdyggYWxwaGEsIDEgLyBHQU1NQSApXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdDogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyOyBhOiBudW1iZXIgfSApOiBDb2xvciB7XG4gICAgcmV0dXJuIG5ldyBDb2xvciggc3RhdGVPYmplY3Quciwgc3RhdGVPYmplY3QuZywgc3RhdGVPYmplY3QuYiwgc3RhdGVPYmplY3QuYSApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBoc2xhKCBodWU6IG51bWJlciwgc2F0dXJhdGlvbjogbnVtYmVyLCBsaWdodG5lc3M6IG51bWJlciwgYWxwaGE6IG51bWJlciApOiBDb2xvciB7XG4gICAgcmV0dXJuIG5ldyBDb2xvciggMCwgMCwgMCwgMSApLnNldEhTTEEoIGh1ZSwgc2F0dXJhdGlvbiwgbGlnaHRuZXNzLCBhbHBoYSApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjaGVja1BhaW50U3RyaW5nKCBjc3NTdHJpbmc6IHN0cmluZyApOiB2b2lkIHtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNjcmF0Y2hDb2xvci5zZXRDU1MoIGNzc1N0cmluZyApO1xuICAgICAgfVxuICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgIGFzc2VydCggZmFsc2UsIGBUaGUgQ1NTIHN0cmluZyBpcyBhbiBpbnZhbGlkIGNvbG9yOiAke2Nzc1N0cmluZ31gICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgUGFpbnQgb2YgdGhlIHR5cGUgdGhhdCBQYWludGFibGUgYWNjZXB0cyBhcyBmaWxscyBvciBzdHJva2VzXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNoZWNrUGFpbnQoIHBhaW50OiBUUGFpbnQgKTogdm9pZCB7XG4gICAgaWYgKCB0eXBlb2YgcGFpbnQgPT09ICdzdHJpbmcnICkge1xuICAgICAgQ29sb3IuY2hlY2tQYWludFN0cmluZyggcGFpbnQgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggcGFpbnQgKSApICYmICggdHlwZW9mIHBhaW50LnZhbHVlID09PSAnc3RyaW5nJyApICkge1xuICAgICAgQ29sb3IuY2hlY2tQYWludFN0cmluZyggcGFpbnQudmFsdWUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbHVtaW5hbmNlIG9mIGEgY29sb3IsIHBlciBJVFUtUiByZWNvbW1lbmRhdGlvbiBCVC43MDksIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1JlYy5fNzA5LlxuICAgKiBHcmVlbiBjb250cmlidXRlcyB0aGUgbW9zdCB0byB0aGUgaW50ZW5zaXR5IHBlcmNlaXZlZCBieSBodW1hbnMsIGFuZCBibHVlIHRoZSBsZWFzdC5cbiAgICogVGhpcyBhbGdvcml0aG0gd29ya3MgY29ycmVjdGx5IHdpdGggYSBncmF5c2NhbGUgY29sb3IgYmVjYXVzZSB0aGUgUkdCIGNvZWZmaWNpZW50cyBzdW0gdG8gMS5cbiAgICpcbiAgICogQHJldHVybnMgLSBhIHZhbHVlIGluIHRoZSByYW5nZSBbMCwyNTVdXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldEx1bWluYW5jZSggY29sb3I6IENvbG9yIHwgc3RyaW5nICk6IG51bWJlciB7XG4gICAgY29uc3Qgc2NlbmVyeUNvbG9yID0gQ29sb3IudG9Db2xvciggY29sb3IgKTtcbiAgICBjb25zdCBsdW1pbmFuY2UgPSAoIHNjZW5lcnlDb2xvci5yZWQgKiAwLjIxMjYgKyBzY2VuZXJ5Q29sb3IuZ3JlZW4gKiAwLjcxNTIgKyBzY2VuZXJ5Q29sb3IuYmx1ZSAqIDAuMDcyMiApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGx1bWluYW5jZSA+PSAwICYmIGx1bWluYW5jZSA8PSAyNTUsIGB1bmV4cGVjdGVkIGx1bWluYW5jZTogJHtsdW1pbmFuY2V9YCApO1xuICAgIHJldHVybiBsdW1pbmFuY2U7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBjb2xvciB0byBncmF5c2NhbGUuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRvR3JheXNjYWxlKCBjb2xvcjogQ29sb3IgfCBzdHJpbmcgKTogQ29sb3Ige1xuICAgIGNvbnN0IGx1bWluYW5jZSA9IENvbG9yLmdldEx1bWluYW5jZSggY29sb3IgKTtcbiAgICByZXR1cm4gbmV3IENvbG9yKCBsdW1pbmFuY2UsIGx1bWluYW5jZSwgbHVtaW5hbmNlICk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgY29sb3IgaXMgJ2RhcmsnLlxuICAgKlxuICAgKiBAcGFyYW0gY29sb3IgLSBjb2xvcnMgd2l0aCBsdW1pbmFuY2UgPCB0aGlzIHZhbHVlIGFyZSBkYXJrLCByYW5nZSBbMCwyNTVdLCBkZWZhdWx0IDE4NlxuICAgKiBAcGFyYW0gbHVtaW5hbmNlVGhyZXNob2xkIC0gY29sb3JzIHdpdGggbHVtaW5hbmNlIDwgdGhpcyB2YWx1ZSBhcmUgZGFyaywgcmFuZ2UgWzAsMjU1XSwgZGVmYXVsdCAxODZcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaXNEYXJrQ29sb3IoIGNvbG9yOiBDb2xvciB8IHN0cmluZywgbHVtaW5hbmNlVGhyZXNob2xkID0gMTg2ICk6IGJvb2xlYW4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGx1bWluYW5jZVRocmVzaG9sZCA+PSAwICYmIGx1bWluYW5jZVRocmVzaG9sZCA8PSAyNTUsXG4gICAgICAnaW52YWxpZCBsdW1pbmFuY2VUaHJlc2hvbGQnICk7XG4gICAgcmV0dXJuICggQ29sb3IuZ2V0THVtaW5hbmNlKCBjb2xvciApIDwgbHVtaW5hbmNlVGhyZXNob2xkICk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgY29sb3IgaXMgJ2xpZ2h0Jy5cbiAgICpcbiAgICogQHBhcmFtIGNvbG9yXG4gICAqIEBwYXJhbSBbbHVtaW5hbmNlVGhyZXNob2xkXSAtIGNvbG9ycyB3aXRoIGx1bWluYW5jZSA+PSB0aGlzIHZhbHVlIGFyZSBsaWdodCwgcmFuZ2UgWzAsMjU1XSwgZGVmYXVsdCAxODZcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaXNMaWdodENvbG9yKCBjb2xvcjogQ29sb3IgfCBzdHJpbmcsIGx1bWluYW5jZVRocmVzaG9sZD86IG51bWJlciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gIUNvbG9yLmlzRGFya0NvbG9yKCBjb2xvciwgbHVtaW5hbmNlVGhyZXNob2xkICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIENvbG9yIHRoYXQgaXMgYSBzaGFkZSBvZiBncmF5LlxuICAgKiBAcGFyYW0gcmdiIC0gdXNlZCBmb3IgcmVkLCBibHVlLCBhbmQgZ3JlZW4gY29tcG9uZW50c1xuICAgKiBAcGFyYW0gW2FdIC0gZGVmYXVsdHMgdG8gMVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBncmF5Q29sb3IoIHJnYjogbnVtYmVyLCBhPzogbnVtYmVyICk6IENvbG9yIHtcbiAgICByZXR1cm4gbmV3IENvbG9yKCByZ2IsIHJnYiwgcmdiLCBhICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBDU1MgY29sb3Igc3RyaW5nIGludG8gYSBzdGFuZGFyZCBmb3JtYXQsIGxvd2VyLWNhc2luZyBhbmQga2V5d29yZC1tYXRjaGluZyBpdC5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHByZXByb2Nlc3NDU1MoIGNzc1N0cmluZzogc3RyaW5nICk6IHN0cmluZyB7XG4gICAgbGV0IHN0ciA9IGNzc1N0cmluZy5yZXBsYWNlKCAvIC9nLCAnJyApLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyByZXBsYWNlIGNvbG9ycyBiYXNlZCBvbiBrZXl3b3Jkc1xuICAgIGNvbnN0IGtleXdvcmRNYXRjaCA9IENvbG9yLmNvbG9yS2V5d29yZHNbIHN0ciBdO1xuICAgIGlmICgga2V5d29yZE1hdGNoICkge1xuICAgICAgc3RyID0gYCMke2tleXdvcmRNYXRjaH1gO1xuICAgIH1cblxuICAgIHJldHVybiBzdHI7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3BlY2lmaWVkIENTUyBzdHJpbmcgaXMgYSB2YWxpZCBDU1MgY29sb3Igc3RyaW5nXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGlzQ1NTQ29sb3JTdHJpbmcoIGNzc1N0cmluZzogc3RyaW5nICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0ciA9IENvbG9yLnByZXByb2Nlc3NDU1MoIGNzc1N0cmluZyApO1xuXG4gICAgLy8gcnVuIHRocm91Z2ggdGhlIGF2YWlsYWJsZSB0ZXh0IGZvcm1hdHNcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBDb2xvci5mb3JtYXRQYXJzZXJzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgcGFyc2VyID0gQ29sb3IuZm9ybWF0UGFyc2Vyc1sgaSBdO1xuXG4gICAgICBjb25zdCBtYXRjaGVzID0gcGFyc2VyLnJlZ2V4cC5leGVjKCBzdHIgKTtcbiAgICAgIGlmICggbWF0Y2hlcyApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBmb3JtYXRQYXJzZXJzOiBGb3JtYXRQYXJzZXJbXSA9IFtcbiAgICB7XG4gICAgICAvLyAndHJhbnNwYXJlbnQnXG4gICAgICByZWdleHA6IC9edHJhbnNwYXJlbnQkLyxcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xuICAgICAgICBjb2xvci5zZXRSR0JBKCAwLCAwLCAwLCAwICk7XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICAvLyBzaG9ydCBoZXggZm9ybSwgYSBsYSAnI2ZmZidcbiAgICAgIHJlZ2V4cDogL14jKFxcd3sxfSkoXFx3ezF9KShcXHd7MX0pJC8sXG4gICAgICBhcHBseTogKCBjb2xvcjogQ29sb3IsIG1hdGNoZXM6IFJlZ0V4cEV4ZWNBcnJheSApOiB2b2lkID0+IHtcbiAgICAgICAgY29sb3Iuc2V0UkdCQShcbiAgICAgICAgICBwYXJzZUludCggbWF0Y2hlc1sgMSBdICsgbWF0Y2hlc1sgMSBdLCAxNiApLFxuICAgICAgICAgIHBhcnNlSW50KCBtYXRjaGVzWyAyIF0gKyBtYXRjaGVzWyAyIF0sIDE2ICksXG4gICAgICAgICAgcGFyc2VJbnQoIG1hdGNoZXNbIDMgXSArIG1hdGNoZXNbIDMgXSwgMTYgKSxcbiAgICAgICAgICAxICk7XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICAvLyBsb25nIGhleCBmb3JtLCBhIGxhICcjZmZmZmZmJ1xuICAgICAgcmVnZXhwOiAvXiMoXFx3ezJ9KShcXHd7Mn0pKFxcd3syfSkkLyxcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xuICAgICAgICBjb2xvci5zZXRSR0JBKFxuICAgICAgICAgIHBhcnNlSW50KCBtYXRjaGVzWyAxIF0sIDE2ICksXG4gICAgICAgICAgcGFyc2VJbnQoIG1hdGNoZXNbIDIgXSwgMTYgKSxcbiAgICAgICAgICBwYXJzZUludCggbWF0Y2hlc1sgMyBdLCAxNiApLFxuICAgICAgICAgIDEgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIC8vIHJnYiguLi4pXG4gICAgICByZWdleHA6IG5ldyBSZWdFeHAoIGBecmdiXFxcXCgke3JnYk51bWJlcn0sJHtyZ2JOdW1iZXJ9LCR7cmdiTnVtYmVyfVxcXFwpJGAgKSxcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xuICAgICAgICBjb2xvci5zZXRSR0JBKFxuICAgICAgICAgIHBhcnNlUkdCTnVtYmVyKCBtYXRjaGVzWyAxIF0gKSxcbiAgICAgICAgICBwYXJzZVJHQk51bWJlciggbWF0Y2hlc1sgMiBdICksXG4gICAgICAgICAgcGFyc2VSR0JOdW1iZXIoIG1hdGNoZXNbIDMgXSApLFxuICAgICAgICAgIDEgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIC8vIHJnYmEoLi4uKVxuICAgICAgcmVnZXhwOiBuZXcgUmVnRXhwKCBgXnJnYmFcXFxcKCR7cmdiTnVtYmVyfSwke3JnYk51bWJlcn0sJHtyZ2JOdW1iZXJ9LCR7YU51bWJlcn1cXFxcKSRgICksXG4gICAgICBhcHBseTogKCBjb2xvcjogQ29sb3IsIG1hdGNoZXM6IFJlZ0V4cEV4ZWNBcnJheSApOiB2b2lkID0+IHtcbiAgICAgICAgY29sb3Iuc2V0UkdCQShcbiAgICAgICAgICBwYXJzZVJHQk51bWJlciggbWF0Y2hlc1sgMSBdICksXG4gICAgICAgICAgcGFyc2VSR0JOdW1iZXIoIG1hdGNoZXNbIDIgXSApLFxuICAgICAgICAgIHBhcnNlUkdCTnVtYmVyKCBtYXRjaGVzWyAzIF0gKSxcbiAgICAgICAgICBOdW1iZXIoIG1hdGNoZXNbIDQgXSApICk7XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICAvLyBoc2woLi4uKVxuICAgICAgcmVnZXhwOiBuZXcgUmVnRXhwKCBgXmhzbFxcXFwoJHtyYXdOdW1iZXJ9LCR7cmF3TnVtYmVyfSUsJHtyYXdOdW1iZXJ9JVxcXFwpJGAgKSxcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xuICAgICAgICBjb2xvci5zZXRIU0xBKFxuICAgICAgICAgIE51bWJlciggbWF0Y2hlc1sgMSBdICksXG4gICAgICAgICAgTnVtYmVyKCBtYXRjaGVzWyAyIF0gKSxcbiAgICAgICAgICBOdW1iZXIoIG1hdGNoZXNbIDMgXSApLFxuICAgICAgICAgIDEgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIC8vIGhzbGEoLi4uKVxuICAgICAgcmVnZXhwOiBuZXcgUmVnRXhwKCBgXmhzbGFcXFxcKCR7cmF3TnVtYmVyfSwke3Jhd051bWJlcn0lLCR7cmF3TnVtYmVyfSUsJHthTnVtYmVyfVxcXFwpJGAgKSxcbiAgICAgIGFwcGx5OiAoIGNvbG9yOiBDb2xvciwgbWF0Y2hlczogUmVnRXhwRXhlY0FycmF5ICk6IHZvaWQgPT4ge1xuICAgICAgICBjb2xvci5zZXRIU0xBKFxuICAgICAgICAgIE51bWJlciggbWF0Y2hlc1sgMSBdICksXG4gICAgICAgICAgTnVtYmVyKCBtYXRjaGVzWyAyIF0gKSxcbiAgICAgICAgICBOdW1iZXIoIG1hdGNoZXNbIDMgXSApLFxuICAgICAgICAgIE51bWJlciggbWF0Y2hlc1sgNCBdICkgKTtcbiAgICAgIH1cbiAgICB9XG4gIF07XG5cbiAgcHVibGljIHN0YXRpYyBiYXNpY0NvbG9yS2V5d29yZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgYXF1YTogJzAwZmZmZicsXG4gICAgYmxhY2s6ICcwMDAwMDAnLFxuICAgIGJsdWU6ICcwMDAwZmYnLFxuICAgIGZ1Y2hzaWE6ICdmZjAwZmYnLFxuICAgIGdyYXk6ICc4MDgwODAnLFxuICAgIGdyZWVuOiAnMDA4MDAwJyxcbiAgICBsaW1lOiAnMDBmZjAwJyxcbiAgICBtYXJvb246ICc4MDAwMDAnLFxuICAgIG5hdnk6ICcwMDAwODAnLFxuICAgIG9saXZlOiAnODA4MDAwJyxcbiAgICBwdXJwbGU6ICc4MDAwODAnLFxuICAgIHJlZDogJ2ZmMDAwMCcsXG4gICAgc2lsdmVyOiAnYzBjMGMwJyxcbiAgICB0ZWFsOiAnMDA4MDgwJyxcbiAgICB3aGl0ZTogJ2ZmZmZmZicsXG4gICAgeWVsbG93OiAnZmZmZjAwJ1xuICB9O1xuXG4gIHB1YmxpYyBzdGF0aWMgY29sb3JLZXl3b3JkczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICBhbGljZWJsdWU6ICdmMGY4ZmYnLFxuICAgIGFudGlxdWV3aGl0ZTogJ2ZhZWJkNycsXG4gICAgYXF1YTogJzAwZmZmZicsXG4gICAgYXF1YW1hcmluZTogJzdmZmZkNCcsXG4gICAgYXp1cmU6ICdmMGZmZmYnLFxuICAgIGJlaWdlOiAnZjVmNWRjJyxcbiAgICBiaXNxdWU6ICdmZmU0YzQnLFxuICAgIGJsYWNrOiAnMDAwMDAwJyxcbiAgICBibGFuY2hlZGFsbW9uZDogJ2ZmZWJjZCcsXG4gICAgYmx1ZTogJzAwMDBmZicsXG4gICAgYmx1ZXZpb2xldDogJzhhMmJlMicsXG4gICAgYnJvd246ICdhNTJhMmEnLFxuICAgIGJ1cmx5d29vZDogJ2RlYjg4NycsXG4gICAgY2FkZXRibHVlOiAnNWY5ZWEwJyxcbiAgICBjaGFydHJldXNlOiAnN2ZmZjAwJyxcbiAgICBjaG9jb2xhdGU6ICdkMjY5MWUnLFxuICAgIGNvcmFsOiAnZmY3ZjUwJyxcbiAgICBjb3JuZmxvd2VyYmx1ZTogJzY0OTVlZCcsXG4gICAgY29ybnNpbGs6ICdmZmY4ZGMnLFxuICAgIGNyaW1zb246ICdkYzE0M2MnLFxuICAgIGN5YW46ICcwMGZmZmYnLFxuICAgIGRhcmtibHVlOiAnMDAwMDhiJyxcbiAgICBkYXJrY3lhbjogJzAwOGI4YicsXG4gICAgZGFya2dvbGRlbnJvZDogJ2I4ODYwYicsXG4gICAgZGFya2dyYXk6ICdhOWE5YTknLFxuICAgIGRhcmtncmVlbjogJzAwNjQwMCcsXG4gICAgZGFya2dyZXk6ICdhOWE5YTknLFxuICAgIGRhcmtraGFraTogJ2JkYjc2YicsXG4gICAgZGFya21hZ2VudGE6ICc4YjAwOGInLFxuICAgIGRhcmtvbGl2ZWdyZWVuOiAnNTU2YjJmJyxcbiAgICBkYXJrb3JhbmdlOiAnZmY4YzAwJyxcbiAgICBkYXJrb3JjaGlkOiAnOTkzMmNjJyxcbiAgICBkYXJrcmVkOiAnOGIwMDAwJyxcbiAgICBkYXJrc2FsbW9uOiAnZTk5NjdhJyxcbiAgICBkYXJrc2VhZ3JlZW46ICc4ZmJjOGYnLFxuICAgIGRhcmtzbGF0ZWJsdWU6ICc0ODNkOGInLFxuICAgIGRhcmtzbGF0ZWdyYXk6ICcyZjRmNGYnLFxuICAgIGRhcmtzbGF0ZWdyZXk6ICcyZjRmNGYnLFxuICAgIGRhcmt0dXJxdW9pc2U6ICcwMGNlZDEnLFxuICAgIGRhcmt2aW9sZXQ6ICc5NDAwZDMnLFxuICAgIGRlZXBwaW5rOiAnZmYxNDkzJyxcbiAgICBkZWVwc2t5Ymx1ZTogJzAwYmZmZicsXG4gICAgZGltZ3JheTogJzY5Njk2OScsXG4gICAgZGltZ3JleTogJzY5Njk2OScsXG4gICAgZG9kZ2VyYmx1ZTogJzFlOTBmZicsXG4gICAgZmlyZWJyaWNrOiAnYjIyMjIyJyxcbiAgICBmbG9yYWx3aGl0ZTogJ2ZmZmFmMCcsXG4gICAgZm9yZXN0Z3JlZW46ICcyMjhiMjInLFxuICAgIGZ1Y2hzaWE6ICdmZjAwZmYnLFxuICAgIGdhaW5zYm9ybzogJ2RjZGNkYycsXG4gICAgZ2hvc3R3aGl0ZTogJ2Y4ZjhmZicsXG4gICAgZ29sZDogJ2ZmZDcwMCcsXG4gICAgZ29sZGVucm9kOiAnZGFhNTIwJyxcbiAgICBncmF5OiAnODA4MDgwJyxcbiAgICBncmVlbjogJzAwODAwMCcsXG4gICAgZ3JlZW55ZWxsb3c6ICdhZGZmMmYnLFxuICAgIGdyZXk6ICc4MDgwODAnLFxuICAgIGhvbmV5ZGV3OiAnZjBmZmYwJyxcbiAgICBob3RwaW5rOiAnZmY2OWI0JyxcbiAgICBpbmRpYW5yZWQ6ICdjZDVjNWMnLFxuICAgIGluZGlnbzogJzRiMDA4MicsXG4gICAgaXZvcnk6ICdmZmZmZjAnLFxuICAgIGtoYWtpOiAnZjBlNjhjJyxcbiAgICBsYXZlbmRlcjogJ2U2ZTZmYScsXG4gICAgbGF2ZW5kZXJibHVzaDogJ2ZmZjBmNScsXG4gICAgbGF3bmdyZWVuOiAnN2NmYzAwJyxcbiAgICBsZW1vbmNoaWZmb246ICdmZmZhY2QnLFxuICAgIGxpZ2h0Ymx1ZTogJ2FkZDhlNicsXG4gICAgbGlnaHRjb3JhbDogJ2YwODA4MCcsXG4gICAgbGlnaHRjeWFuOiAnZTBmZmZmJyxcbiAgICBsaWdodGdvbGRlbnJvZHllbGxvdzogJ2ZhZmFkMicsXG4gICAgbGlnaHRncmF5OiAnZDNkM2QzJyxcbiAgICBsaWdodGdyZWVuOiAnOTBlZTkwJyxcbiAgICBsaWdodGdyZXk6ICdkM2QzZDMnLFxuICAgIGxpZ2h0cGluazogJ2ZmYjZjMScsXG4gICAgbGlnaHRzYWxtb246ICdmZmEwN2EnLFxuICAgIGxpZ2h0c2VhZ3JlZW46ICcyMGIyYWEnLFxuICAgIGxpZ2h0c2t5Ymx1ZTogJzg3Y2VmYScsXG4gICAgbGlnaHRzbGF0ZWdyYXk6ICc3Nzg4OTknLFxuICAgIGxpZ2h0c2xhdGVncmV5OiAnNzc4ODk5JyxcbiAgICBsaWdodHN0ZWVsYmx1ZTogJ2IwYzRkZScsXG4gICAgbGlnaHR5ZWxsb3c6ICdmZmZmZTAnLFxuICAgIGxpbWU6ICcwMGZmMDAnLFxuICAgIGxpbWVncmVlbjogJzMyY2QzMicsXG4gICAgbGluZW46ICdmYWYwZTYnLFxuICAgIG1hZ2VudGE6ICdmZjAwZmYnLFxuICAgIG1hcm9vbjogJzgwMDAwMCcsXG4gICAgbWVkaXVtYXF1YW1hcmluZTogJzY2Y2RhYScsXG4gICAgbWVkaXVtYmx1ZTogJzAwMDBjZCcsXG4gICAgbWVkaXVtb3JjaGlkOiAnYmE1NWQzJyxcbiAgICBtZWRpdW1wdXJwbGU6ICc5MzcwZGInLFxuICAgIG1lZGl1bXNlYWdyZWVuOiAnM2NiMzcxJyxcbiAgICBtZWRpdW1zbGF0ZWJsdWU6ICc3YjY4ZWUnLFxuICAgIG1lZGl1bXNwcmluZ2dyZWVuOiAnMDBmYTlhJyxcbiAgICBtZWRpdW10dXJxdW9pc2U6ICc0OGQxY2MnLFxuICAgIG1lZGl1bXZpb2xldHJlZDogJ2M3MTU4NScsXG4gICAgbWlkbmlnaHRibHVlOiAnMTkxOTcwJyxcbiAgICBtaW50Y3JlYW06ICdmNWZmZmEnLFxuICAgIG1pc3R5cm9zZTogJ2ZmZTRlMScsXG4gICAgbW9jY2FzaW46ICdmZmU0YjUnLFxuICAgIG5hdmFqb3doaXRlOiAnZmZkZWFkJyxcbiAgICBuYXZ5OiAnMDAwMDgwJyxcbiAgICBvbGRsYWNlOiAnZmRmNWU2JyxcbiAgICBvbGl2ZTogJzgwODAwMCcsXG4gICAgb2xpdmVkcmFiOiAnNmI4ZTIzJyxcbiAgICBvcmFuZ2U6ICdmZmE1MDAnLFxuICAgIG9yYW5nZXJlZDogJ2ZmNDUwMCcsXG4gICAgb3JjaGlkOiAnZGE3MGQ2JyxcbiAgICBwYWxlZ29sZGVucm9kOiAnZWVlOGFhJyxcbiAgICBwYWxlZ3JlZW46ICc5OGZiOTgnLFxuICAgIHBhbGV0dXJxdW9pc2U6ICdhZmVlZWUnLFxuICAgIHBhbGV2aW9sZXRyZWQ6ICdkYjcwOTMnLFxuICAgIHBhcGF5YXdoaXA6ICdmZmVmZDUnLFxuICAgIHBlYWNocHVmZjogJ2ZmZGFiOScsXG4gICAgcGVydTogJ2NkODUzZicsXG4gICAgcGluazogJ2ZmYzBjYicsXG4gICAgcGx1bTogJ2RkYTBkZCcsXG4gICAgcG93ZGVyYmx1ZTogJ2IwZTBlNicsXG4gICAgcHVycGxlOiAnODAwMDgwJyxcbiAgICByZWQ6ICdmZjAwMDAnLFxuICAgIHJvc3licm93bjogJ2JjOGY4ZicsXG4gICAgcm95YWxibHVlOiAnNDE2OWUxJyxcbiAgICBzYWRkbGVicm93bjogJzhiNDUxMycsXG4gICAgc2FsbW9uOiAnZmE4MDcyJyxcbiAgICBzYW5keWJyb3duOiAnZjRhNDYwJyxcbiAgICBzZWFncmVlbjogJzJlOGI1NycsXG4gICAgc2Vhc2hlbGw6ICdmZmY1ZWUnLFxuICAgIHNpZW5uYTogJ2EwNTIyZCcsXG4gICAgc2lsdmVyOiAnYzBjMGMwJyxcbiAgICBza3libHVlOiAnODdjZWViJyxcbiAgICBzbGF0ZWJsdWU6ICc2YTVhY2QnLFxuICAgIHNsYXRlZ3JheTogJzcwODA5MCcsXG4gICAgc2xhdGVncmV5OiAnNzA4MDkwJyxcbiAgICBzbm93OiAnZmZmYWZhJyxcbiAgICBzcHJpbmdncmVlbjogJzAwZmY3ZicsXG4gICAgc3RlZWxibHVlOiAnNDY4MmI0JyxcbiAgICB0YW46ICdkMmI0OGMnLFxuICAgIHRlYWw6ICcwMDgwODAnLFxuICAgIHRoaXN0bGU6ICdkOGJmZDgnLFxuICAgIHRvbWF0bzogJ2ZmNjM0NycsXG4gICAgdHVycXVvaXNlOiAnNDBlMGQwJyxcbiAgICB2aW9sZXQ6ICdlZTgyZWUnLFxuICAgIHdoZWF0OiAnZjVkZWIzJyxcbiAgICB3aGl0ZTogJ2ZmZmZmZicsXG4gICAgd2hpdGVzbW9rZTogJ2Y1ZjVmNScsXG4gICAgeWVsbG93OiAnZmZmZjAwJyxcbiAgICB5ZWxsb3dncmVlbjogJzlhY2QzMidcbiAgfTtcblxuICBwdWJsaWMgc3RhdGljIEJMQUNLOiBDb2xvcjsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBCTFVFOiBDb2xvcjsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBDWUFOOiBDb2xvcjsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBEQVJLX0dSQVk6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuICBwdWJsaWMgc3RhdGljIEdSQVk6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuICBwdWJsaWMgc3RhdGljIEdSRUVOOiBDb2xvcjsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBMSUdIVF9HUkFZOiBDb2xvcjsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBNQUdFTlRBOiBDb2xvcjsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBPUkFOR0U6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuICBwdWJsaWMgc3RhdGljIFBJTks6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuICBwdWJsaWMgc3RhdGljIFJFRDogQ29sb3I7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XG4gIHB1YmxpYyBzdGF0aWMgV0hJVEU6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuICBwdWJsaWMgc3RhdGljIFlFTExPVzogQ29sb3I7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XG4gIHB1YmxpYyBzdGF0aWMgVFJBTlNQQVJFTlQ6IENvbG9yOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuXG4gIHB1YmxpYyBzdGF0aWMgYmxhY2s6IENvbG9yO1xuICBwdWJsaWMgc3RhdGljIGJsdWU6IENvbG9yO1xuICBwdWJsaWMgc3RhdGljIGN5YW46IENvbG9yO1xuICBwdWJsaWMgc3RhdGljIGRhcmtHcmF5OiBDb2xvcjtcbiAgcHVibGljIHN0YXRpYyBncmF5OiBDb2xvcjtcbiAgcHVibGljIHN0YXRpYyBncmVlbjogQ29sb3I7XG4gIHB1YmxpYyBzdGF0aWMgbGlnaHRHcmF5OiBDb2xvcjtcbiAgcHVibGljIHN0YXRpYyBtYWdlbnRhOiBDb2xvcjtcbiAgcHVibGljIHN0YXRpYyBvcmFuZ2U6IENvbG9yO1xuICBwdWJsaWMgc3RhdGljIHBpbms6IENvbG9yO1xuICBwdWJsaWMgc3RhdGljIHJlZDogQ29sb3I7XG4gIHB1YmxpYyBzdGF0aWMgd2hpdGU6IENvbG9yO1xuICBwdWJsaWMgc3RhdGljIHllbGxvdzogQ29sb3I7XG4gIHB1YmxpYyBzdGF0aWMgdHJhbnNwYXJlbnQ6IENvbG9yO1xuXG4gIHB1YmxpYyBzdGF0aWMgQ29sb3JJTzogSU9UeXBlO1xufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQ29sb3InLCBDb2xvciApO1xuXG4vLyBKYXZhIGNvbXBhdGliaWxpdHlcbkNvbG9yLkJMQUNLID0gQ29sb3IuYmxhY2sgPSBuZXcgQ29sb3IoIDAsIDAsIDAgKS5zZXRJbW11dGFibGUoKTtcbkNvbG9yLkJMVUUgPSBDb2xvci5ibHVlID0gbmV3IENvbG9yKCAwLCAwLCAyNTUgKS5zZXRJbW11dGFibGUoKTtcbkNvbG9yLkNZQU4gPSBDb2xvci5jeWFuID0gbmV3IENvbG9yKCAwLCAyNTUsIDI1NSApLnNldEltbXV0YWJsZSgpO1xuQ29sb3IuREFSS19HUkFZID0gQ29sb3IuZGFya0dyYXkgPSBuZXcgQ29sb3IoIDY0LCA2NCwgNjQgKS5zZXRJbW11dGFibGUoKTtcbkNvbG9yLkdSQVkgPSBDb2xvci5ncmF5ID0gbmV3IENvbG9yKCAxMjgsIDEyOCwgMTI4ICkuc2V0SW1tdXRhYmxlKCk7XG5Db2xvci5HUkVFTiA9IENvbG9yLmdyZWVuID0gbmV3IENvbG9yKCAwLCAyNTUsIDAgKS5zZXRJbW11dGFibGUoKTtcbkNvbG9yLkxJR0hUX0dSQVkgPSBDb2xvci5saWdodEdyYXkgPSBuZXcgQ29sb3IoIDE5MiwgMTkyLCAxOTIgKS5zZXRJbW11dGFibGUoKTtcbkNvbG9yLk1BR0VOVEEgPSBDb2xvci5tYWdlbnRhID0gbmV3IENvbG9yKCAyNTUsIDAsIDI1NSApLnNldEltbXV0YWJsZSgpO1xuQ29sb3IuT1JBTkdFID0gQ29sb3Iub3JhbmdlID0gbmV3IENvbG9yKCAyNTUsIDIwMCwgMCApLnNldEltbXV0YWJsZSgpO1xuQ29sb3IuUElOSyA9IENvbG9yLnBpbmsgPSBuZXcgQ29sb3IoIDI1NSwgMTc1LCAxNzUgKS5zZXRJbW11dGFibGUoKTtcbkNvbG9yLlJFRCA9IENvbG9yLnJlZCA9IG5ldyBDb2xvciggMjU1LCAwLCAwICkuc2V0SW1tdXRhYmxlKCk7XG5Db2xvci5XSElURSA9IENvbG9yLndoaXRlID0gbmV3IENvbG9yKCAyNTUsIDI1NSwgMjU1ICkuc2V0SW1tdXRhYmxlKCk7XG5Db2xvci5ZRUxMT1cgPSBDb2xvci55ZWxsb3cgPSBuZXcgQ29sb3IoIDI1NSwgMjU1LCAwICkuc2V0SW1tdXRhYmxlKCk7XG5cbi8vIEhlbHBlciBmb3IgdHJhbnNwYXJlbnQgY29sb3JzXG5Db2xvci5UUkFOU1BBUkVOVCA9IENvbG9yLnRyYW5zcGFyZW50ID0gbmV3IENvbG9yKCAwLCAwLCAwLCAwICkuc2V0SW1tdXRhYmxlKCk7XG5cbmNvbnN0IHNjcmF0Y2hDb2xvciA9IG5ldyBDb2xvciggJ2JsdWUnICk7XG5cbmV4cG9ydCB0eXBlIENvbG9yU3RhdGUgPSB7XG4gIHI6IG51bWJlcjtcbiAgZzogbnVtYmVyO1xuICBiOiBudW1iZXI7XG4gIGE6IG51bWJlcjtcbn07XG5cbkNvbG9yLkNvbG9ySU8gPSBuZXcgSU9UeXBlPENvbG9yLCBDb2xvclN0YXRlPiggJ0NvbG9ySU8nLCB7XG4gIHZhbHVlVHlwZTogQ29sb3IsXG4gIGRvY3VtZW50YXRpb246ICdBIGNvbG9yLCB3aXRoIHJnYmEnLFxuICB0b1N0YXRlT2JqZWN0OiBjb2xvciA9PiBjb2xvci50b1N0YXRlT2JqZWN0KCksXG4gIGZyb21TdGF0ZU9iamVjdDogc3RhdGVPYmplY3QgPT4gbmV3IENvbG9yKCBzdGF0ZU9iamVjdC5yLCBzdGF0ZU9iamVjdC5nLCBzdGF0ZU9iamVjdC5iLCBzdGF0ZU9iamVjdC5hICksXG4gIHN0YXRlU2NoZW1hOiB7XG4gICAgcjogTnVtYmVySU8sXG4gICAgZzogTnVtYmVySU8sXG4gICAgYjogTnVtYmVySU8sXG4gICAgYTogTnVtYmVySU9cbiAgfVxufSApOyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsImlzVFJlYWRPbmx5UHJvcGVydHkiLCJVdGlscyIsIklPVHlwZSIsIk51bWJlcklPIiwic2NlbmVyeSIsImNsYW1wIiwibGluZWFyIiwicmdiTnVtYmVyIiwiYU51bWJlciIsInJhd051bWJlciIsInBhcnNlUkdCTnVtYmVyIiwic3RyIiwibXVsdGlwbGllciIsImVuZHNXaXRoIiwic2xpY2UiLCJsZW5ndGgiLCJyb3VuZFN5bW1ldHJpYyIsIk51bWJlciIsIkNvbG9yIiwiY29weSIsInIiLCJnIiwiYiIsImEiLCJzZXQiLCJhc3NlcnQiLCJ1bmRlZmluZWQiLCJzZXRSR0JBIiwic2V0Q1NTIiwicmVkIiwiZ3JlZW4iLCJibHVlIiwiYWxwaGEiLCJnZXRSZWQiLCJ2YWx1ZSIsInNldFJlZCIsImdldEdyZWVuIiwic2V0R3JlZW4iLCJnZXRCbHVlIiwic2V0Qmx1ZSIsImdldEFscGhhIiwic2V0QWxwaGEiLCJ1cGRhdGVDb2xvciIsImJsZW5kIiwib3RoZXJDb2xvciIsInJhdGlvIiwiZ2FtbWEiLCJsaW5lYXJSZWRBIiwiTWF0aCIsInBvdyIsImxpbmVhclJlZEIiLCJsaW5lYXJHcmVlbkEiLCJsaW5lYXJHcmVlbkIiLCJsaW5lYXJCbHVlQSIsImxpbmVhckJsdWVCIiwiY29tcHV0ZUNTUyIsInRvRml4ZWQiLCJhbHBoYVN0cmluZyIsInRvQ1NTIiwiX2NzcyIsImNzc1N0cmluZyIsInN1Y2Nlc3MiLCJwcmVwcm9jZXNzQ1NTIiwiaSIsImZvcm1hdFBhcnNlcnMiLCJwYXJzZXIiLCJtYXRjaGVzIiwicmVnZXhwIiwiZXhlYyIsImFwcGx5IiwiRXJyb3IiLCJ0b051bWJlciIsImltbXV0YWJsZSIsInRvU3RyaW5nIiwiaXNGaW5pdGUiLCJvbGRDU1MiLCJjaGFuZ2VFbWl0dGVyIiwiZW1pdCIsInNldEltbXV0YWJsZSIsImdldENhbnZhc1N0eWxlIiwic2V0SFNMQSIsImh1ZSIsInNhdHVyYXRpb24iLCJsaWdodG5lc3MiLCJtMiIsIm0xIiwiaHVlVG9SR0IiLCJlcXVhbHMiLCJjb2xvciIsIndpdGhBbHBoYSIsImNoZWNrRmFjdG9yIiwiZmFjdG9yIiwiYnJpZ2h0ZXJDb2xvciIsIm1pbiIsImZsb29yIiwiY29sb3JVdGlsc0JyaWdodGVyIiwiZGFya2VyQ29sb3IiLCJtYXgiLCJjb2xvclV0aWxzRGFya2VyIiwiY29sb3JVdGlsc0JyaWdodG5lc3MiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJ0b0hleFN0cmluZyIsImhleFN0cmluZyIsInRvU3RhdGVPYmplY3QiLCJoIiwidG9Db2xvciIsImNvbG9yU3BlYyIsIlRSQU5TUEFSRU5UIiwiaW50ZXJwb2xhdGVSR0JBIiwiY29sb3IxIiwiY29sb3IyIiwiZGlzdGFuY2UiLCJzdXBlcnNhbXBsZUJsZW5kIiwiY29sb3JzIiwiR0FNTUEiLCJyZWRzIiwibWFwIiwiZ3JlZW5zIiwiYmx1ZXMiLCJhbHBoYXMiLCJhbHBoYVN1bSIsIl8iLCJzdW0iLCJyYW5nZSIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwiaHNsYSIsImNoZWNrUGFpbnRTdHJpbmciLCJzY3JhdGNoQ29sb3IiLCJlIiwiY2hlY2tQYWludCIsInBhaW50IiwiZ2V0THVtaW5hbmNlIiwic2NlbmVyeUNvbG9yIiwibHVtaW5hbmNlIiwidG9HcmF5c2NhbGUiLCJpc0RhcmtDb2xvciIsImx1bWluYW5jZVRocmVzaG9sZCIsImlzTGlnaHRDb2xvciIsImdyYXlDb2xvciIsInJnYiIsInJlcGxhY2UiLCJ0b0xvd2VyQ2FzZSIsImtleXdvcmRNYXRjaCIsImNvbG9yS2V5d29yZHMiLCJpc0NTU0NvbG9yU3RyaW5nIiwicGFyc2VJbnQiLCJSZWdFeHAiLCJiYXNpY0NvbG9yS2V5d29yZHMiLCJhcXVhIiwiYmxhY2siLCJmdWNoc2lhIiwiZ3JheSIsImxpbWUiLCJtYXJvb24iLCJuYXZ5Iiwib2xpdmUiLCJwdXJwbGUiLCJzaWx2ZXIiLCJ0ZWFsIiwid2hpdGUiLCJ5ZWxsb3ciLCJhbGljZWJsdWUiLCJhbnRpcXVld2hpdGUiLCJhcXVhbWFyaW5lIiwiYXp1cmUiLCJiZWlnZSIsImJpc3F1ZSIsImJsYW5jaGVkYWxtb25kIiwiYmx1ZXZpb2xldCIsImJyb3duIiwiYnVybHl3b29kIiwiY2FkZXRibHVlIiwiY2hhcnRyZXVzZSIsImNob2NvbGF0ZSIsImNvcmFsIiwiY29ybmZsb3dlcmJsdWUiLCJjb3Juc2lsayIsImNyaW1zb24iLCJjeWFuIiwiZGFya2JsdWUiLCJkYXJrY3lhbiIsImRhcmtnb2xkZW5yb2QiLCJkYXJrZ3JheSIsImRhcmtncmVlbiIsImRhcmtncmV5IiwiZGFya2toYWtpIiwiZGFya21hZ2VudGEiLCJkYXJrb2xpdmVncmVlbiIsImRhcmtvcmFuZ2UiLCJkYXJrb3JjaGlkIiwiZGFya3JlZCIsImRhcmtzYWxtb24iLCJkYXJrc2VhZ3JlZW4iLCJkYXJrc2xhdGVibHVlIiwiZGFya3NsYXRlZ3JheSIsImRhcmtzbGF0ZWdyZXkiLCJkYXJrdHVycXVvaXNlIiwiZGFya3Zpb2xldCIsImRlZXBwaW5rIiwiZGVlcHNreWJsdWUiLCJkaW1ncmF5IiwiZGltZ3JleSIsImRvZGdlcmJsdWUiLCJmaXJlYnJpY2siLCJmbG9yYWx3aGl0ZSIsImZvcmVzdGdyZWVuIiwiZ2FpbnNib3JvIiwiZ2hvc3R3aGl0ZSIsImdvbGQiLCJnb2xkZW5yb2QiLCJncmVlbnllbGxvdyIsImdyZXkiLCJob25leWRldyIsImhvdHBpbmsiLCJpbmRpYW5yZWQiLCJpbmRpZ28iLCJpdm9yeSIsImtoYWtpIiwibGF2ZW5kZXIiLCJsYXZlbmRlcmJsdXNoIiwibGF3bmdyZWVuIiwibGVtb25jaGlmZm9uIiwibGlnaHRibHVlIiwibGlnaHRjb3JhbCIsImxpZ2h0Y3lhbiIsImxpZ2h0Z29sZGVucm9keWVsbG93IiwibGlnaHRncmF5IiwibGlnaHRncmVlbiIsImxpZ2h0Z3JleSIsImxpZ2h0cGluayIsImxpZ2h0c2FsbW9uIiwibGlnaHRzZWFncmVlbiIsImxpZ2h0c2t5Ymx1ZSIsImxpZ2h0c2xhdGVncmF5IiwibGlnaHRzbGF0ZWdyZXkiLCJsaWdodHN0ZWVsYmx1ZSIsImxpZ2h0eWVsbG93IiwibGltZWdyZWVuIiwibGluZW4iLCJtYWdlbnRhIiwibWVkaXVtYXF1YW1hcmluZSIsIm1lZGl1bWJsdWUiLCJtZWRpdW1vcmNoaWQiLCJtZWRpdW1wdXJwbGUiLCJtZWRpdW1zZWFncmVlbiIsIm1lZGl1bXNsYXRlYmx1ZSIsIm1lZGl1bXNwcmluZ2dyZWVuIiwibWVkaXVtdHVycXVvaXNlIiwibWVkaXVtdmlvbGV0cmVkIiwibWlkbmlnaHRibHVlIiwibWludGNyZWFtIiwibWlzdHlyb3NlIiwibW9jY2FzaW4iLCJuYXZham93aGl0ZSIsIm9sZGxhY2UiLCJvbGl2ZWRyYWIiLCJvcmFuZ2UiLCJvcmFuZ2VyZWQiLCJvcmNoaWQiLCJwYWxlZ29sZGVucm9kIiwicGFsZWdyZWVuIiwicGFsZXR1cnF1b2lzZSIsInBhbGV2aW9sZXRyZWQiLCJwYXBheWF3aGlwIiwicGVhY2hwdWZmIiwicGVydSIsInBpbmsiLCJwbHVtIiwicG93ZGVyYmx1ZSIsInJvc3licm93biIsInJveWFsYmx1ZSIsInNhZGRsZWJyb3duIiwic2FsbW9uIiwic2FuZHlicm93biIsInNlYWdyZWVuIiwic2Vhc2hlbGwiLCJzaWVubmEiLCJza3libHVlIiwic2xhdGVibHVlIiwic2xhdGVncmF5Iiwic2xhdGVncmV5Iiwic25vdyIsInNwcmluZ2dyZWVuIiwic3RlZWxibHVlIiwidGFuIiwidGhpc3RsZSIsInRvbWF0byIsInR1cnF1b2lzZSIsInZpb2xldCIsIndoZWF0Iiwid2hpdGVzbW9rZSIsInllbGxvd2dyZWVuIiwicmVnaXN0ZXIiLCJCTEFDSyIsIkJMVUUiLCJDWUFOIiwiREFSS19HUkFZIiwiZGFya0dyYXkiLCJHUkFZIiwiR1JFRU4iLCJMSUdIVF9HUkFZIiwibGlnaHRHcmF5IiwiTUFHRU5UQSIsIk9SQU5HRSIsIlBJTksiLCJSRUQiLCJXSElURSIsIllFTExPVyIsInRyYW5zcGFyZW50IiwiQ29sb3JJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdGF0ZVNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7OztDQVFDLEdBR0QsT0FBT0EsaUJBQWlCLGtDQUFrQztBQUMxRCxTQUFTQyxtQkFBbUIsUUFBUSx3Q0FBd0M7QUFDNUUsT0FBT0MsV0FBVywyQkFBMkI7QUFDN0MsT0FBT0MsWUFBWSxxQ0FBcUM7QUFDeEQsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0MsT0FBTyxRQUFnQixnQkFBZ0I7QUFHaEQsWUFBWTtBQUNaLE1BQU1DLFFBQVFKLE1BQU1JLEtBQUs7QUFDekIsTUFBTUMsU0FBU0wsTUFBTUssTUFBTTtBQU8zQixrQkFBa0I7QUFDbEIsTUFBTUMsWUFBWSxrQkFBa0Isa0RBQWtEO0FBQ3RGLE1BQU1DLFVBQVUsc0JBQXNCLCtGQUErRjtBQUNySSxNQUFNQyxZQUFZLGNBQWMscUJBQXFCO0FBRXJELHlDQUF5QztBQUN6QyxTQUFTQyxlQUFnQkMsR0FBVztJQUNsQyxJQUFJQyxhQUFhO0lBRWpCLDREQUE0RDtJQUM1RCxJQUFLRCxJQUFJRSxRQUFRLENBQUUsTUFBUTtRQUN6QkQsYUFBYTtRQUNiRCxNQUFNQSxJQUFJRyxLQUFLLENBQUUsR0FBR0gsSUFBSUksTUFBTSxHQUFHO0lBQ25DO0lBRUEsT0FBT2QsTUFBTWUsY0FBYyxD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