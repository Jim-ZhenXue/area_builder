// Copyright 2013-2024, University of Colorado Boulder
/**
 * Immutable font object.
 *
 * Examples:
 * new phet.scenery.Font().font                      // "10px sans-serif" (the default)
 * new phet.scenery.Font( { family: 'serif' } ).font // "10px serif"
 * new phet.scenery.Font( { weight: 'bold' } ).font  // "bold 10px sans-serif"
 * new phet.scenery.Font( { size: 16 } ).font        // "16px sans-serif"
 * var font = new phet.scenery.Font( {
 *   family: '"Times New Roman", serif',
 *   style: 'italic',
 *   lineHeight: 10
 * } );
 * font.font;                                   // "italic 10px/10 'Times New Roman', serif"
 * font.family;                                 // "'Times New Roman', serif"
 * font.weight;                                 // 400 (the default)
 *
 * Useful specs:
 * http://www.w3.org/TR/css3-fonts/
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import IOType from '../../../tandem/js/types/IOType.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import { scenery } from '../imports.js';
// Valid values for the 'style' property of Font
const VALID_STYLES = [
    'normal',
    'italic',
    'oblique'
];
// Valid values for the 'variant' property of Font
const VALID_VARIANTS = [
    'normal',
    'small-caps'
];
// Valid values for the 'weight' property of Font
const VALID_WEIGHTS = [
    'normal',
    'bold',
    'bolder',
    'lighter',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900'
];
// Valid values for the 'stretch' property of Font
const VALID_STRETCHES = [
    'normal',
    'ultra-condensed',
    'extra-condensed',
    'condensed',
    'semi-condensed',
    'semi-expanded',
    'expanded',
    'extra-expanded',
    'ultra-expanded'
];
let Font = class Font extends PhetioObject {
    /**
   * Returns this font's CSS shorthand, which includes all of the font's information reduced into a single string.
   *
   * This can be used for CSS as the 'font' attribute, or is needed to set Canvas fonts.
   *
   * https://www.w3.org/TR/css-fonts-3/#propdef-font contains detailed information on how this is formatted.
   */ getFont() {
        return this._font;
    }
    get font() {
        return this.getFont();
    }
    /**
   * Returns this font's style. See the constructor for more details on valid values.
   */ getStyle() {
        return this._style;
    }
    get style() {
        return this.getStyle();
    }
    /**
   * Returns this font's variant. See the constructor for more details on valid values.
   */ getVariant() {
        return this._variant;
    }
    get variant() {
        return this.getVariant();
    }
    /**
   * Returns this font's weight. See the constructor for more details on valid values.
   *
   * NOTE: If a numeric weight was passed in, it has been cast to a string, and a string will be returned here.
   */ getWeight() {
        return this._weight;
    }
    get weight() {
        return this.getWeight();
    }
    /**
   * Returns this font's stretch. See the constructor for more details on valid values.
   */ getStretch() {
        return this._stretch;
    }
    get stretch() {
        return this.getStretch();
    }
    /**
   * Returns this font's size. See the constructor for more details on valid values.
   *
   * NOTE: If a numeric size was passed in, it has been cast to a string, and a string will be returned here.
   */ getSize() {
        return this._size;
    }
    get size() {
        return this.getSize();
    }
    /**
   * Returns an approximate value of this font's size in px.
   */ getNumericSize() {
        const pxMatch = this._size.match(/^(\d+)px$/);
        if (pxMatch) {
            return Number(pxMatch[1]);
        }
        const ptMatch = this._size.match(/^(\d+)pt$/);
        if (ptMatch) {
            return 0.75 * Number(ptMatch[1]);
        }
        const emMatch = this._size.match(/^(\d+)em$/);
        if (emMatch) {
            return Number(emMatch[1]) / 16;
        }
        return 12; // a guess?
    }
    get numericSize() {
        return this.getNumericSize();
    }
    /**
   * Returns this font's line-height. See the constructor for more details on valid values.
   */ getLineHeight() {
        return this._lineHeight;
    }
    get lineHeight() {
        return this.getLineHeight();
    }
    /**
   * Returns this font's family. See the constructor for more details on valid values.
   */ getFamily() {
        return this._family;
    }
    get family() {
        return this.getFamily();
    }
    /**
   * Returns a new Font object, which is a copy of this object. If options are provided, they override the current
   * values in this object.
   */ copy(options) {
        // TODO: get merge working in typescript https://github.com/phetsims/scenery/issues/1581
        return new Font(combineOptions({
            style: this._style,
            variant: this._variant,
            weight: this._weight,
            stretch: this._stretch,
            size: this._size,
            lineHeight: this._lineHeight,
            family: this._family
        }, options));
    }
    /**
   * Computes the combined CSS shorthand font string.
   *
   * https://www.w3.org/TR/css-fonts-3/#propdef-font contains details about the format.
   */ computeShorthand() {
        let ret = '';
        if (this._style !== 'normal') {
            ret += `${this._style} `;
        }
        if (this._variant !== 'normal') {
            ret += `${this._variant} `;
        }
        if (this._weight !== 'normal') {
            ret += `${this._weight} `;
        }
        if (this._stretch !== 'normal') {
            ret += `${this._stretch} `;
        }
        ret += this._size;
        if (this._lineHeight !== 'normal') {
            ret += `/${this._lineHeight}`;
        }
        ret += ` ${this._family}`;
        return ret;
    }
    /**
   * Returns this font's CSS shorthand, which includes all of the font's information reduced into a single string.
   *
   * NOTE: This is an alias of getFont().
   *
   * This can be used for CSS as the 'font' attribute, or is needed to set Canvas fonts.
   *
   * https://www.w3.org/TR/css-fonts-3/#propdef-font contains detailed information on how this is formatted.
   */ toCSS() {
        return this.getFont();
    }
    /**
   * Converts a generic size to a specific CSS pixel string, assuming 'px' for numbers.
   *
   * @param size - If it's a number, 'px' will be appended
   */ static castSize(size) {
        if (typeof size === 'number') {
            return `${size}px`; // add the pixels suffix by default for numbers
        } else {
            return size; // assume that it's a valid to-spec string
        }
    }
    static isFontStyle(style) {
        return VALID_STYLES.includes(style);
    }
    static isFontVariant(variant) {
        return VALID_VARIANTS.includes(variant);
    }
    static isFontWeight(weight) {
        return VALID_WEIGHTS.includes(weight);
    }
    static isFontStretch(stretch) {
        return VALID_STRETCHES.includes(stretch);
    }
    /**
   * Parses a CSS-compliant "font" shorthand string into a Font object.
   *
   * Font strings should be a valid CSS3 font declaration value (see http://www.w3.org/TR/css3-fonts/) which consists
   * of the following pattern:
   *   [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]? <‘font-size’>
   *   [ / <‘line-height’> ]? <‘font-family’> ]
   */ static fromCSS(cssString) {
        // parse a somewhat proper CSS3 form (not guaranteed to handle it precisely the same as browsers yet)
        const options = {};
        // split based on whitespace allowed by CSS spec (more restrictive than regular regexp whitespace)
        const tokens = _.filter(cssString.split(/[\x09\x0A\x0C\x0D\x20]/), (token)=>token.length > 0); // eslint-disable-line no-control-regex
        // pull tokens out until we reach something that doesn't match. that must be the font size (according to spec)
        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];
            if (token === 'normal') {
            // nothing has to be done, everything already normal as default
            } else if (Font.isFontStyle(token)) {
                assert && assert(options.style === undefined, `Style cannot be applied twice. Already set to "${options.style}", attempt to replace with "${token}"`);
                options.style = token;
            } else if (Font.isFontVariant(token)) {
                assert && assert(options.variant === undefined, `Variant cannot be applied twice. Already set to "${options.variant}", attempt to replace with "${token}"`);
                options.variant = token;
            } else if (Font.isFontWeight(token)) {
                assert && assert(options.weight === undefined, `Weight cannot be applied twice. Already set to "${options.weight}", attempt to replace with "${token}"`);
                options.weight = token;
            } else if (Font.isFontStretch(token)) {
                assert && assert(options.stretch === undefined, `Stretch cannot be applied twice. Already set to "${options.stretch}", attempt to replace with "${token}"`);
                options.stretch = token;
            } else {
                // not a style/variant/weight/stretch, must be a font size, possibly with an included line-height
                const subtokens = token.split(/\//); // extract font size from any line-height
                options.size = subtokens[0];
                if (subtokens[1]) {
                    options.lineHeight = subtokens[1];
                }
                // all future tokens are guaranteed to be part of the font-family if it is given according to spec
                options.family = tokens.slice(i + 1).join(' ');
                break;
            }
        }
        return new Font(options);
    }
    constructor(providedOptions){
        assert && assert(providedOptions === undefined || typeof providedOptions === 'object' && Object.getPrototypeOf(providedOptions) === Object.prototype, 'options, if provided, should be a raw object');
        const options = optionize()({
            // {string} - 'normal', 'italic' or 'oblique'
            style: 'normal',
            // {string} - 'normal' or 'small-caps'
            variant: 'normal',
            // {number|string} - 'normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700',
            // '800', '900', or a number that when cast to a string will be one of the strings above.
            weight: 'normal',
            // {string} - 'normal', 'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'semi-expanded',
            // 'expanded', 'extra-expanded' or 'ultra-expanded'
            stretch: 'normal',
            // {number|string} - A valid CSS font-size string, or a number representing a quantity of 'px'.
            size: '10px',
            // {string} - A valid CSS line-height, typically 'normal', a number, a CSS length (e.g. '15px'), or a percentage
            // of the normal height.
            lineHeight: 'normal',
            // {string} - A comma-separated list of families, which can include generic families (preferably at the end) such
            // as 'serif', 'sans-serif', 'cursive', 'fantasy' and 'monospace'. If there is any question about escaping (such
            // as spaces in a font name), the family should be surrounded by double quotes.
            family: 'sans-serif',
            phetioType: Font.FontIO
        }, providedOptions);
        assert && assert(typeof options.weight === 'string' || typeof options.weight === 'number', 'Font weight should be specified as a string or number');
        assert && assert(typeof options.size === 'string' || typeof options.size === 'number', 'Font size should be specified as a string or number');
        super(options);
        this._style = options.style;
        this._variant = options.variant;
        this._weight = `${options.weight}`; // cast to string, we'll double check it later
        this._stretch = options.stretch;
        this._size = Font.castSize(options.size);
        this._lineHeight = options.lineHeight;
        this._family = options.family;
        // sanity checks to prevent errors in interpretation or in the font shorthand usage
        assert && assert(typeof this._style === 'string' && _.includes(VALID_STYLES, this._style), 'Font style must be one of "normal", "italic", or "oblique"');
        assert && assert(typeof this._variant === 'string' && _.includes(VALID_VARIANTS, this._variant), 'Font variant must be "normal" or "small-caps"');
        assert && assert(typeof this._weight === 'string' && _.includes(VALID_WEIGHTS, this._weight), 'Font weight must be one of "normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", or "900"');
        assert && assert(typeof this._stretch === 'string' && _.includes(VALID_STRETCHES, this._stretch), 'Font stretch must be one of "normal", "ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "semi-expanded", "expanded", "extra-expanded", or "ultra-expanded"');
        assert && assert(typeof this._size === 'string' && !_.includes([
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9'
        ], this._size[this._size.length - 1]), 'Font size must be either passed as a number (not a string, interpreted as px), or must contain a suffix for percentage, absolute or relative units, or an explicit size constant');
        assert && assert(typeof this._lineHeight === 'string');
        assert && assert(typeof this._family === 'string');
        // Initialize the shorthand font property
        this._font = this.computeShorthand();
    }
};
// {Font} - Default Font object (since they are immutable).
Font.DEFAULT = new Font();
export { Font as default };
scenery.register('Font', Font);
Font.FontIO = new IOType('FontIO', {
    valueType: Font,
    documentation: 'Font handling for text drawing. Options:' + '<ul>' + '<li><strong>style:</strong> normal      &mdash; normal | italic | oblique </li>' + '<li><strong>variant:</strong> normal    &mdash; normal | small-caps </li>' + '<li><strong>weight:</strong> normal     &mdash; normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 </li>' + '<li><strong>stretch:</strong> normal    &mdash; normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded </li>' + '<li><strong>size:</strong> 10px         &mdash; absolute-size | relative-size | length | percentage -- unitless number interpreted as px. absolute suffixes: cm, mm, in, pt, pc, px. relative suffixes: em, ex, ch, rem, vw, vh, vmin, vmax. </li>' + '<li><strong>lineHeight:</strong> normal &mdash; normal | number | length | percentage -- NOTE: Canvas spec forces line-height to normal </li>' + '<li><strong>family:</strong> sans-serif &mdash; comma-separated list of families, including generic families (serif, sans-serif, cursive, fantasy, monospace). ideally escape with double-quotes</li>' + '</ul>',
    toStateObject: (font)=>({
            style: font.getStyle(),
            variant: font.getVariant(),
            weight: font.getWeight(),
            stretch: font.getStretch(),
            size: font.getSize(),
            lineHeight: font.getLineHeight(),
            family: font.getFamily()
        }),
    fromStateObject (stateObject) {
        return new Font(stateObject);
    },
    stateSchema: {
        style: StringIO,
        variant: StringIO,
        weight: StringIO,
        stretch: StringIO,
        size: StringIO,
        lineHeight: StringIO,
        family: StringIO
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9Gb250LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEltbXV0YWJsZSBmb250IG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqIG5ldyBwaGV0LnNjZW5lcnkuRm9udCgpLmZvbnQgICAgICAgICAgICAgICAgICAgICAgLy8gXCIxMHB4IHNhbnMtc2VyaWZcIiAodGhlIGRlZmF1bHQpXG4gKiBuZXcgcGhldC5zY2VuZXJ5LkZvbnQoIHsgZmFtaWx5OiAnc2VyaWYnIH0gKS5mb250IC8vIFwiMTBweCBzZXJpZlwiXG4gKiBuZXcgcGhldC5zY2VuZXJ5LkZvbnQoIHsgd2VpZ2h0OiAnYm9sZCcgfSApLmZvbnQgIC8vIFwiYm9sZCAxMHB4IHNhbnMtc2VyaWZcIlxuICogbmV3IHBoZXQuc2NlbmVyeS5Gb250KCB7IHNpemU6IDE2IH0gKS5mb250ICAgICAgICAvLyBcIjE2cHggc2Fucy1zZXJpZlwiXG4gKiB2YXIgZm9udCA9IG5ldyBwaGV0LnNjZW5lcnkuRm9udCgge1xuICogICBmYW1pbHk6ICdcIlRpbWVzIE5ldyBSb21hblwiLCBzZXJpZicsXG4gKiAgIHN0eWxlOiAnaXRhbGljJyxcbiAqICAgbGluZUhlaWdodDogMTBcbiAqIH0gKTtcbiAqIGZvbnQuZm9udDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiaXRhbGljIDEwcHgvMTAgJ1RpbWVzIE5ldyBSb21hbicsIHNlcmlmXCJcbiAqIGZvbnQuZmFtaWx5OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiJ1RpbWVzIE5ldyBSb21hbicsIHNlcmlmXCJcbiAqIGZvbnQud2VpZ2h0OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDQwMCAodGhlIGRlZmF1bHQpXG4gKlxuICogVXNlZnVsIHNwZWNzOlxuICogaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1mb250cy9cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XG5pbXBvcnQgeyBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIFZhbGlkIHZhbHVlcyBmb3IgdGhlICdzdHlsZScgcHJvcGVydHkgb2YgRm9udFxuY29uc3QgVkFMSURfU1RZTEVTID0gWyAnbm9ybWFsJywgJ2l0YWxpYycsICdvYmxpcXVlJyBdO1xuXG4vLyBWYWxpZCB2YWx1ZXMgZm9yIHRoZSAndmFyaWFudCcgcHJvcGVydHkgb2YgRm9udFxuY29uc3QgVkFMSURfVkFSSUFOVFMgPSBbICdub3JtYWwnLCAnc21hbGwtY2FwcycgXTtcblxuLy8gVmFsaWQgdmFsdWVzIGZvciB0aGUgJ3dlaWdodCcgcHJvcGVydHkgb2YgRm9udFxuY29uc3QgVkFMSURfV0VJR0hUUyA9IFsgJ25vcm1hbCcsICdib2xkJywgJ2JvbGRlcicsICdsaWdodGVyJyxcbiAgJzEwMCcsICcyMDAnLCAnMzAwJywgJzQwMCcsICc1MDAnLCAnNjAwJywgJzcwMCcsICc4MDAnLCAnOTAwJyBdO1xuXG4vLyBWYWxpZCB2YWx1ZXMgZm9yIHRoZSAnc3RyZXRjaCcgcHJvcGVydHkgb2YgRm9udFxuY29uc3QgVkFMSURfU1RSRVRDSEVTID0gWyAnbm9ybWFsJywgJ3VsdHJhLWNvbmRlbnNlZCcsICdleHRyYS1jb25kZW5zZWQnLCAnY29uZGVuc2VkJywgJ3NlbWktY29uZGVuc2VkJyxcbiAgJ3NlbWktZXhwYW5kZWQnLCAnZXhwYW5kZWQnLCAnZXh0cmEtZXhwYW5kZWQnLCAndWx0cmEtZXhwYW5kZWQnIF07XG5cbmV4cG9ydCB0eXBlIEZvbnRTdHlsZSA9ICdub3JtYWwnIHwgJ2l0YWxpYycgfCAnb2JsaXF1ZSc7XG5leHBvcnQgdHlwZSBGb250VmFyaWFudCA9ICdub3JtYWwnIHwgJ3NtYWxsLWNhcHMnO1xuZXhwb3J0IHR5cGUgRm9udFdlaWdodCA9XG4gICdub3JtYWwnXG4gIHwgJ2JvbGQnXG4gIHwgJ2JvbGRlcidcbiAgfCAnbGlnaHRlcidcbiAgfCAnMTAwJ1xuICB8ICcyMDAnXG4gIHwgJzMwMCdcbiAgfCAnNDAwJ1xuICB8ICc1MDAnXG4gIHwgJzYwMCdcbiAgfCAnNzAwJ1xuICB8ICc4MDAnXG4gIHwgJzkwMCc7XG5leHBvcnQgdHlwZSBGb250U3RyZXRjaCA9XG4gICdub3JtYWwnXG4gIHwgJ3VsdHJhLWNvbmRlbnNlZCdcbiAgfCAnZXh0cmEtY29uZGVuc2VkJ1xuICB8ICdjb25kZW5zZWQnXG4gIHwgJ3NlbWktY29uZGVuc2VkJ1xuICB8ICdzZW1pLWV4cGFuZGVkJ1xuICB8ICdleHBhbmRlZCdcbiAgfCAnZXh0cmEtZXhwYW5kZWQnXG4gIHwgJ3VsdHJhLWV4cGFuZGVkJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgc3R5bGU/OiBGb250U3R5bGU7XG4gIHZhcmlhbnQ/OiBGb250VmFyaWFudDtcbiAgd2VpZ2h0PzogbnVtYmVyIHwgRm9udFdlaWdodDtcbiAgc3RyZXRjaD86IEZvbnRTdHJldGNoO1xuICBzaXplPzogbnVtYmVyIHwgc3RyaW5nO1xuICBsaW5lSGVpZ2h0Pzogc3RyaW5nO1xuICBmYW1pbHk/OiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgRm9udE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBoZXRpb09iamVjdE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvbnQgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xuXG4gIC8vIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWZvbnRzLTMvI3Byb3BkZWYtZm9udC1zdHlsZVxuICBwcml2YXRlIHJlYWRvbmx5IF9zdHlsZTogRm9udFN0eWxlO1xuXG4gIC8vIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWZvbnRzLTMvI2ZvbnQtdmFyaWFudC1jc3MyMS12YWx1ZXNcbiAgcHJpdmF0ZSByZWFkb25seSBfdmFyaWFudDogRm9udFZhcmlhbnQ7XG5cbiAgLy8gU2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtZm9udHMtMy8jcHJvcGRlZi1mb250LXdlaWdodFxuICBwcml2YXRlIHJlYWRvbmx5IF93ZWlnaHQ6IEZvbnRXZWlnaHQ7XG5cbiAgLy8gU2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtZm9udHMtMy8jcHJvcGRlZi1mb250LXN0cmV0Y2hcbiAgcHJpdmF0ZSByZWFkb25seSBfc3RyZXRjaDogRm9udFN0cmV0Y2g7XG5cbiAgLy8gU2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtZm9udHMtMy8jcHJvcGRlZi1mb250LXNpemVcbiAgcHJpdmF0ZSByZWFkb25seSBfc2l6ZTogc3RyaW5nO1xuXG4gIC8vIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvQ1NTMi92aXN1ZGV0Lmh0bWwjcHJvcGRlZi1saW5lLWhlaWdodFxuICBwcml2YXRlIHJlYWRvbmx5IF9saW5lSGVpZ2h0OiBzdHJpbmc7XG5cbiAgLy8gU2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtZm9udHMtMy8jcHJvcGRlZi1mb250LWZhbWlseVxuICBwcml2YXRlIHJlYWRvbmx5IF9mYW1pbHk6IHN0cmluZztcblxuICAvLyBTaG9ydGhhbmQgZm9udCBwcm9wZXJ0eVxuICBwcml2YXRlIHJlYWRvbmx5IF9mb250OiBzdHJpbmc7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBGb250T3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm92aWRlZE9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBwcm92aWRlZE9wdGlvbnMgPT09ICdvYmplY3QnICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZiggcHJvdmlkZWRPcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUgKSxcbiAgICAgICdvcHRpb25zLCBpZiBwcm92aWRlZCwgc2hvdWxkIGJlIGEgcmF3IG9iamVjdCcgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Rm9udE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XG4gICAgICAvLyB7c3RyaW5nfSAtICdub3JtYWwnLCAnaXRhbGljJyBvciAnb2JsaXF1ZSdcbiAgICAgIHN0eWxlOiAnbm9ybWFsJyxcblxuICAgICAgLy8ge3N0cmluZ30gLSAnbm9ybWFsJyBvciAnc21hbGwtY2FwcydcbiAgICAgIHZhcmlhbnQ6ICdub3JtYWwnLFxuXG4gICAgICAvLyB7bnVtYmVyfHN0cmluZ30gLSAnbm9ybWFsJywgJ2JvbGQnLCAnYm9sZGVyJywgJ2xpZ2h0ZXInLCAnMTAwJywgJzIwMCcsICczMDAnLCAnNDAwJywgJzUwMCcsICc2MDAnLCAnNzAwJyxcbiAgICAgIC8vICc4MDAnLCAnOTAwJywgb3IgYSBudW1iZXIgdGhhdCB3aGVuIGNhc3QgdG8gYSBzdHJpbmcgd2lsbCBiZSBvbmUgb2YgdGhlIHN0cmluZ3MgYWJvdmUuXG4gICAgICB3ZWlnaHQ6ICdub3JtYWwnLFxuXG4gICAgICAvLyB7c3RyaW5nfSAtICdub3JtYWwnLCAndWx0cmEtY29uZGVuc2VkJywgJ2V4dHJhLWNvbmRlbnNlZCcsICdjb25kZW5zZWQnLCAnc2VtaS1jb25kZW5zZWQnLCAnc2VtaS1leHBhbmRlZCcsXG4gICAgICAvLyAnZXhwYW5kZWQnLCAnZXh0cmEtZXhwYW5kZWQnIG9yICd1bHRyYS1leHBhbmRlZCdcbiAgICAgIHN0cmV0Y2g6ICdub3JtYWwnLFxuXG4gICAgICAvLyB7bnVtYmVyfHN0cmluZ30gLSBBIHZhbGlkIENTUyBmb250LXNpemUgc3RyaW5nLCBvciBhIG51bWJlciByZXByZXNlbnRpbmcgYSBxdWFudGl0eSBvZiAncHgnLlxuICAgICAgc2l6ZTogJzEwcHgnLFxuXG4gICAgICAvLyB7c3RyaW5nfSAtIEEgdmFsaWQgQ1NTIGxpbmUtaGVpZ2h0LCB0eXBpY2FsbHkgJ25vcm1hbCcsIGEgbnVtYmVyLCBhIENTUyBsZW5ndGggKGUuZy4gJzE1cHgnKSwgb3IgYSBwZXJjZW50YWdlXG4gICAgICAvLyBvZiB0aGUgbm9ybWFsIGhlaWdodC5cbiAgICAgIGxpbmVIZWlnaHQ6ICdub3JtYWwnLFxuXG4gICAgICAvLyB7c3RyaW5nfSAtIEEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgZmFtaWxpZXMsIHdoaWNoIGNhbiBpbmNsdWRlIGdlbmVyaWMgZmFtaWxpZXMgKHByZWZlcmFibHkgYXQgdGhlIGVuZCkgc3VjaFxuICAgICAgLy8gYXMgJ3NlcmlmJywgJ3NhbnMtc2VyaWYnLCAnY3Vyc2l2ZScsICdmYW50YXN5JyBhbmQgJ21vbm9zcGFjZScuIElmIHRoZXJlIGlzIGFueSBxdWVzdGlvbiBhYm91dCBlc2NhcGluZyAoc3VjaFxuICAgICAgLy8gYXMgc3BhY2VzIGluIGEgZm9udCBuYW1lKSwgdGhlIGZhbWlseSBzaG91bGQgYmUgc3Vycm91bmRlZCBieSBkb3VibGUgcXVvdGVzLlxuICAgICAgZmFtaWx5OiAnc2Fucy1zZXJpZicsXG5cbiAgICAgIHBoZXRpb1R5cGU6IEZvbnQuRm9udElPXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy53ZWlnaHQgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBvcHRpb25zLndlaWdodCA9PT0gJ251bWJlcicsICdGb250IHdlaWdodCBzaG91bGQgYmUgc3BlY2lmaWVkIGFzIGEgc3RyaW5nIG9yIG51bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5zaXplID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygb3B0aW9ucy5zaXplID09PSAnbnVtYmVyJywgJ0ZvbnQgc2l6ZSBzaG91bGQgYmUgc3BlY2lmaWVkIGFzIGEgc3RyaW5nIG9yIG51bWJlcicgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLl9zdHlsZSA9IG9wdGlvbnMuc3R5bGU7XG4gICAgdGhpcy5fdmFyaWFudCA9IG9wdGlvbnMudmFyaWFudDtcbiAgICB0aGlzLl93ZWlnaHQgPSBgJHtvcHRpb25zLndlaWdodH1gIGFzIEZvbnRXZWlnaHQ7IC8vIGNhc3QgdG8gc3RyaW5nLCB3ZSdsbCBkb3VibGUgY2hlY2sgaXQgbGF0ZXJcbiAgICB0aGlzLl9zdHJldGNoID0gb3B0aW9ucy5zdHJldGNoO1xuICAgIHRoaXMuX3NpemUgPSBGb250LmNhc3RTaXplKCBvcHRpb25zLnNpemUgKTtcbiAgICB0aGlzLl9saW5lSGVpZ2h0ID0gb3B0aW9ucy5saW5lSGVpZ2h0O1xuICAgIHRoaXMuX2ZhbWlseSA9IG9wdGlvbnMuZmFtaWx5O1xuXG4gICAgLy8gc2FuaXR5IGNoZWNrcyB0byBwcmV2ZW50IGVycm9ycyBpbiBpbnRlcnByZXRhdGlvbiBvciBpbiB0aGUgZm9udCBzaG9ydGhhbmQgdXNhZ2VcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5fc3R5bGUgPT09ICdzdHJpbmcnICYmIF8uaW5jbHVkZXMoIFZBTElEX1NUWUxFUywgdGhpcy5fc3R5bGUgKSxcbiAgICAgICdGb250IHN0eWxlIG11c3QgYmUgb25lIG9mIFwibm9ybWFsXCIsIFwiaXRhbGljXCIsIG9yIFwib2JsaXF1ZVwiJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl92YXJpYW50ID09PSAnc3RyaW5nJyAmJiBfLmluY2x1ZGVzKCBWQUxJRF9WQVJJQU5UUywgdGhpcy5fdmFyaWFudCApLFxuICAgICAgJ0ZvbnQgdmFyaWFudCBtdXN0IGJlIFwibm9ybWFsXCIgb3IgXCJzbWFsbC1jYXBzXCInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX3dlaWdodCA9PT0gJ3N0cmluZycgJiYgXy5pbmNsdWRlcyggVkFMSURfV0VJR0hUUywgdGhpcy5fd2VpZ2h0ICksXG4gICAgICAnRm9udCB3ZWlnaHQgbXVzdCBiZSBvbmUgb2YgXCJub3JtYWxcIiwgXCJib2xkXCIsIFwiYm9sZGVyXCIsIFwibGlnaHRlclwiLCBcIjEwMFwiLCBcIjIwMFwiLCBcIjMwMFwiLCBcIjQwMFwiLCBcIjUwMFwiLCBcIjYwMFwiLCBcIjcwMFwiLCBcIjgwMFwiLCBvciBcIjkwMFwiJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9zdHJldGNoID09PSAnc3RyaW5nJyAmJiBfLmluY2x1ZGVzKCBWQUxJRF9TVFJFVENIRVMsIHRoaXMuX3N0cmV0Y2ggKSxcbiAgICAgICdGb250IHN0cmV0Y2ggbXVzdCBiZSBvbmUgb2YgXCJub3JtYWxcIiwgXCJ1bHRyYS1jb25kZW5zZWRcIiwgXCJleHRyYS1jb25kZW5zZWRcIiwgXCJjb25kZW5zZWRcIiwgXCJzZW1pLWNvbmRlbnNlZFwiLCBcInNlbWktZXhwYW5kZWRcIiwgXCJleHBhbmRlZFwiLCBcImV4dHJhLWV4cGFuZGVkXCIsIG9yIFwidWx0cmEtZXhwYW5kZWRcIicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5fc2l6ZSA9PT0gJ3N0cmluZycgJiYgIV8uaW5jbHVkZXMoIFsgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknIF0sIHRoaXMuX3NpemVbIHRoaXMuX3NpemUubGVuZ3RoIC0gMSBdICksXG4gICAgICAnRm9udCBzaXplIG11c3QgYmUgZWl0aGVyIHBhc3NlZCBhcyBhIG51bWJlciAobm90IGEgc3RyaW5nLCBpbnRlcnByZXRlZCBhcyBweCksIG9yIG11c3QgY29udGFpbiBhIHN1ZmZpeCBmb3IgcGVyY2VudGFnZSwgYWJzb2x1dGUgb3IgcmVsYXRpdmUgdW5pdHMsIG9yIGFuIGV4cGxpY2l0IHNpemUgY29uc3RhbnQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX2xpbmVIZWlnaHQgPT09ICdzdHJpbmcnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX2ZhbWlseSA9PT0gJ3N0cmluZycgKTtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHNob3J0aGFuZCBmb250IHByb3BlcnR5XG4gICAgdGhpcy5fZm9udCA9IHRoaXMuY29tcHV0ZVNob3J0aGFuZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBmb250J3MgQ1NTIHNob3J0aGFuZCwgd2hpY2ggaW5jbHVkZXMgYWxsIG9mIHRoZSBmb250J3MgaW5mb3JtYXRpb24gcmVkdWNlZCBpbnRvIGEgc2luZ2xlIHN0cmluZy5cbiAgICpcbiAgICogVGhpcyBjYW4gYmUgdXNlZCBmb3IgQ1NTIGFzIHRoZSAnZm9udCcgYXR0cmlidXRlLCBvciBpcyBuZWVkZWQgdG8gc2V0IENhbnZhcyBmb250cy5cbiAgICpcbiAgICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy1mb250cy0zLyNwcm9wZGVmLWZvbnQgY29udGFpbnMgZGV0YWlsZWQgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgaXMgZm9ybWF0dGVkLlxuICAgKi9cbiAgcHVibGljIGdldEZvbnQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZm9udDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZm9udCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5nZXRGb250KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGlzIGZvbnQncyBzdHlsZS4gU2VlIHRoZSBjb25zdHJ1Y3RvciBmb3IgbW9yZSBkZXRhaWxzIG9uIHZhbGlkIHZhbHVlcy5cbiAgICovXG4gIHB1YmxpYyBnZXRTdHlsZSgpOiBGb250U3R5bGUge1xuICAgIHJldHVybiB0aGlzLl9zdHlsZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc3R5bGUoKTogRm9udFN0eWxlIHsgcmV0dXJuIHRoaXMuZ2V0U3R5bGUoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgZm9udCdzIHZhcmlhbnQuIFNlZSB0aGUgY29uc3RydWN0b3IgZm9yIG1vcmUgZGV0YWlscyBvbiB2YWxpZCB2YWx1ZXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0VmFyaWFudCgpOiBGb250VmFyaWFudCB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhcmlhbnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHZhcmlhbnQoKTogRm9udFZhcmlhbnQgeyByZXR1cm4gdGhpcy5nZXRWYXJpYW50KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGlzIGZvbnQncyB3ZWlnaHQuIFNlZSB0aGUgY29uc3RydWN0b3IgZm9yIG1vcmUgZGV0YWlscyBvbiB2YWxpZCB2YWx1ZXMuXG4gICAqXG4gICAqIE5PVEU6IElmIGEgbnVtZXJpYyB3ZWlnaHQgd2FzIHBhc3NlZCBpbiwgaXQgaGFzIGJlZW4gY2FzdCB0byBhIHN0cmluZywgYW5kIGEgc3RyaW5nIHdpbGwgYmUgcmV0dXJuZWQgaGVyZS5cbiAgICovXG4gIHB1YmxpYyBnZXRXZWlnaHQoKTogRm9udFdlaWdodCB7XG4gICAgcmV0dXJuIHRoaXMuX3dlaWdodDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgd2VpZ2h0KCk6IEZvbnRXZWlnaHQgeyByZXR1cm4gdGhpcy5nZXRXZWlnaHQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgZm9udCdzIHN0cmV0Y2guIFNlZSB0aGUgY29uc3RydWN0b3IgZm9yIG1vcmUgZGV0YWlscyBvbiB2YWxpZCB2YWx1ZXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3RyZXRjaCgpOiBGb250U3RyZXRjaCB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmV0Y2g7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHN0cmV0Y2goKTogRm9udFN0cmV0Y2ggeyByZXR1cm4gdGhpcy5nZXRTdHJldGNoKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGlzIGZvbnQncyBzaXplLiBTZWUgdGhlIGNvbnN0cnVjdG9yIGZvciBtb3JlIGRldGFpbHMgb24gdmFsaWQgdmFsdWVzLlxuICAgKlxuICAgKiBOT1RFOiBJZiBhIG51bWVyaWMgc2l6ZSB3YXMgcGFzc2VkIGluLCBpdCBoYXMgYmVlbiBjYXN0IHRvIGEgc3RyaW5nLCBhbmQgYSBzdHJpbmcgd2lsbCBiZSByZXR1cm5lZCBoZXJlLlxuICAgKi9cbiAgcHVibGljIGdldFNpemUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2l6ZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5nZXRTaXplKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcHByb3hpbWF0ZSB2YWx1ZSBvZiB0aGlzIGZvbnQncyBzaXplIGluIHB4LlxuICAgKi9cbiAgcHVibGljIGdldE51bWVyaWNTaXplKCk6IG51bWJlciB7XG4gICAgY29uc3QgcHhNYXRjaCA9IHRoaXMuX3NpemUubWF0Y2goIC9eKFxcZCspcHgkLyApO1xuICAgIGlmICggcHhNYXRjaCApIHtcbiAgICAgIHJldHVybiBOdW1iZXIoIHB4TWF0Y2hbIDEgXSApO1xuICAgIH1cblxuICAgIGNvbnN0IHB0TWF0Y2ggPSB0aGlzLl9zaXplLm1hdGNoKCAvXihcXGQrKXB0JC8gKTtcbiAgICBpZiAoIHB0TWF0Y2ggKSB7XG4gICAgICByZXR1cm4gMC43NSAqIE51bWJlciggcHRNYXRjaFsgMSBdICk7XG4gICAgfVxuXG4gICAgY29uc3QgZW1NYXRjaCA9IHRoaXMuX3NpemUubWF0Y2goIC9eKFxcZCspZW0kLyApO1xuICAgIGlmICggZW1NYXRjaCApIHtcbiAgICAgIHJldHVybiBOdW1iZXIoIGVtTWF0Y2hbIDEgXSApIC8gMTY7XG4gICAgfVxuXG4gICAgcmV0dXJuIDEyOyAvLyBhIGd1ZXNzP1xuICB9XG5cbiAgcHVibGljIGdldCBudW1lcmljU2l6ZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXROdW1lcmljU2l6ZSgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBmb250J3MgbGluZS1oZWlnaHQuIFNlZSB0aGUgY29uc3RydWN0b3IgZm9yIG1vcmUgZGV0YWlscyBvbiB2YWxpZCB2YWx1ZXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0TGluZUhlaWdodCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9saW5lSGVpZ2h0O1xuICB9XG5cbiAgcHVibGljIGdldCBsaW5lSGVpZ2h0KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldExpbmVIZWlnaHQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgZm9udCdzIGZhbWlseS4gU2VlIHRoZSBjb25zdHJ1Y3RvciBmb3IgbW9yZSBkZXRhaWxzIG9uIHZhbGlkIHZhbHVlcy5cbiAgICovXG4gIHB1YmxpYyBnZXRGYW1pbHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZmFtaWx5O1xuICB9XG5cbiAgcHVibGljIGdldCBmYW1pbHkoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0RmFtaWx5KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBGb250IG9iamVjdCwgd2hpY2ggaXMgYSBjb3B5IG9mIHRoaXMgb2JqZWN0LiBJZiBvcHRpb25zIGFyZSBwcm92aWRlZCwgdGhleSBvdmVycmlkZSB0aGUgY3VycmVudFxuICAgKiB2YWx1ZXMgaW4gdGhpcyBvYmplY3QuXG4gICAqL1xuICBwdWJsaWMgY29weSggb3B0aW9ucz86IEZvbnRPcHRpb25zICk6IEZvbnQge1xuICAgIC8vIFRPRE86IGdldCBtZXJnZSB3b3JraW5nIGluIHR5cGVzY3JpcHQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICByZXR1cm4gbmV3IEZvbnQoIGNvbWJpbmVPcHRpb25zPEZvbnRPcHRpb25zPigge1xuICAgICAgc3R5bGU6IHRoaXMuX3N0eWxlLFxuICAgICAgdmFyaWFudDogdGhpcy5fdmFyaWFudCxcbiAgICAgIHdlaWdodDogdGhpcy5fd2VpZ2h0LFxuICAgICAgc3RyZXRjaDogdGhpcy5fc3RyZXRjaCxcbiAgICAgIHNpemU6IHRoaXMuX3NpemUsXG4gICAgICBsaW5lSGVpZ2h0OiB0aGlzLl9saW5lSGVpZ2h0LFxuICAgICAgZmFtaWx5OiB0aGlzLl9mYW1pbHlcbiAgICB9LCBvcHRpb25zICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgY29tYmluZWQgQ1NTIHNob3J0aGFuZCBmb250IHN0cmluZy5cbiAgICpcbiAgICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy1mb250cy0zLyNwcm9wZGVmLWZvbnQgY29udGFpbnMgZGV0YWlscyBhYm91dCB0aGUgZm9ybWF0LlxuICAgKi9cbiAgcHJpdmF0ZSBjb21wdXRlU2hvcnRoYW5kKCk6IHN0cmluZyB7XG4gICAgbGV0IHJldCA9ICcnO1xuICAgIGlmICggdGhpcy5fc3R5bGUgIT09ICdub3JtYWwnICkgeyByZXQgKz0gYCR7dGhpcy5fc3R5bGV9IGA7IH1cbiAgICBpZiAoIHRoaXMuX3ZhcmlhbnQgIT09ICdub3JtYWwnICkgeyByZXQgKz0gYCR7dGhpcy5fdmFyaWFudH0gYDsgfVxuICAgIGlmICggdGhpcy5fd2VpZ2h0ICE9PSAnbm9ybWFsJyApIHsgcmV0ICs9IGAke3RoaXMuX3dlaWdodH0gYDsgfVxuICAgIGlmICggdGhpcy5fc3RyZXRjaCAhPT0gJ25vcm1hbCcgKSB7IHJldCArPSBgJHt0aGlzLl9zdHJldGNofSBgOyB9XG4gICAgcmV0ICs9IHRoaXMuX3NpemU7XG4gICAgaWYgKCB0aGlzLl9saW5lSGVpZ2h0ICE9PSAnbm9ybWFsJyApIHsgcmV0ICs9IGAvJHt0aGlzLl9saW5lSGVpZ2h0fWA7IH1cbiAgICByZXQgKz0gYCAke3RoaXMuX2ZhbWlseX1gO1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGlzIGZvbnQncyBDU1Mgc2hvcnRoYW5kLCB3aGljaCBpbmNsdWRlcyBhbGwgb2YgdGhlIGZvbnQncyBpbmZvcm1hdGlvbiByZWR1Y2VkIGludG8gYSBzaW5nbGUgc3RyaW5nLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGlzIGFuIGFsaWFzIG9mIGdldEZvbnQoKS5cbiAgICpcbiAgICogVGhpcyBjYW4gYmUgdXNlZCBmb3IgQ1NTIGFzIHRoZSAnZm9udCcgYXR0cmlidXRlLCBvciBpcyBuZWVkZWQgdG8gc2V0IENhbnZhcyBmb250cy5cbiAgICpcbiAgICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy1mb250cy0zLyNwcm9wZGVmLWZvbnQgY29udGFpbnMgZGV0YWlsZWQgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgaXMgZm9ybWF0dGVkLlxuICAgKi9cbiAgcHVibGljIHRvQ1NTKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Rm9udCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgZ2VuZXJpYyBzaXplIHRvIGEgc3BlY2lmaWMgQ1NTIHBpeGVsIHN0cmluZywgYXNzdW1pbmcgJ3B4JyBmb3IgbnVtYmVycy5cbiAgICpcbiAgICogQHBhcmFtIHNpemUgLSBJZiBpdCdzIGEgbnVtYmVyLCAncHgnIHdpbGwgYmUgYXBwZW5kZWRcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY2FzdFNpemUoIHNpemU6IHN0cmluZyB8IG51bWJlciApOiBzdHJpbmcge1xuICAgIGlmICggdHlwZW9mIHNpemUgPT09ICdudW1iZXInICkge1xuICAgICAgcmV0dXJuIGAke3NpemV9cHhgOyAvLyBhZGQgdGhlIHBpeGVscyBzdWZmaXggYnkgZGVmYXVsdCBmb3IgbnVtYmVyc1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBzaXplOyAvLyBhc3N1bWUgdGhhdCBpdCdzIGEgdmFsaWQgdG8tc3BlYyBzdHJpbmdcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRm9udFN0eWxlKCBzdHlsZTogc3RyaW5nICk6IHN0eWxlIGlzIEZvbnRTdHlsZSB7XG4gICAgcmV0dXJuIFZBTElEX1NUWUxFUy5pbmNsdWRlcyggc3R5bGUgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNGb250VmFyaWFudCggdmFyaWFudDogc3RyaW5nICk6IHZhcmlhbnQgaXMgRm9udFZhcmlhbnQge1xuICAgIHJldHVybiBWQUxJRF9WQVJJQU5UUy5pbmNsdWRlcyggdmFyaWFudCApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc0ZvbnRXZWlnaHQoIHdlaWdodDogc3RyaW5nICk6IHdlaWdodCBpcyBGb250V2VpZ2h0IHtcbiAgICByZXR1cm4gVkFMSURfV0VJR0hUUy5pbmNsdWRlcyggd2VpZ2h0ICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRm9udFN0cmV0Y2goIHN0cmV0Y2g6IHN0cmluZyApOiBzdHJldGNoIGlzIEZvbnRTdHJldGNoIHtcbiAgICByZXR1cm4gVkFMSURfU1RSRVRDSEVTLmluY2x1ZGVzKCBzdHJldGNoICk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2VzIGEgQ1NTLWNvbXBsaWFudCBcImZvbnRcIiBzaG9ydGhhbmQgc3RyaW5nIGludG8gYSBGb250IG9iamVjdC5cbiAgICpcbiAgICogRm9udCBzdHJpbmdzIHNob3VsZCBiZSBhIHZhbGlkIENTUzMgZm9udCBkZWNsYXJhdGlvbiB2YWx1ZSAoc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtZm9udHMvKSB3aGljaCBjb25zaXN0c1xuICAgKiBvZiB0aGUgZm9sbG93aW5nIHBhdHRlcm46XG4gICAqICAgWyBbIDzigJhmb250LXN0eWxl4oCZPiB8fCA8Zm9udC12YXJpYW50LWNzczIxPiB8fCA84oCYZm9udC13ZWlnaHTigJk+IHx8IDzigJhmb250LXN0cmV0Y2jigJk+IF0/IDzigJhmb250LXNpemXigJk+XG4gICAqICAgWyAvIDzigJhsaW5lLWhlaWdodOKAmT4gXT8gPOKAmGZvbnQtZmFtaWx54oCZPiBdXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21DU1MoIGNzc1N0cmluZzogc3RyaW5nICk6IEZvbnQge1xuICAgIC8vIHBhcnNlIGEgc29tZXdoYXQgcHJvcGVyIENTUzMgZm9ybSAobm90IGd1YXJhbnRlZWQgdG8gaGFuZGxlIGl0IHByZWNpc2VseSB0aGUgc2FtZSBhcyBicm93c2VycyB5ZXQpXG5cbiAgICBjb25zdCBvcHRpb25zOiBGb250T3B0aW9ucyA9IHt9O1xuXG4gICAgLy8gc3BsaXQgYmFzZWQgb24gd2hpdGVzcGFjZSBhbGxvd2VkIGJ5IENTUyBzcGVjIChtb3JlIHJlc3RyaWN0aXZlIHRoYW4gcmVndWxhciByZWdleHAgd2hpdGVzcGFjZSlcbiAgICBjb25zdCB0b2tlbnMgPSBfLmZpbHRlciggY3NzU3RyaW5nLnNwbGl0KCAvW1xceDA5XFx4MEFcXHgwQ1xceDBEXFx4MjBdLyApLCB0b2tlbiA9PiB0b2tlbi5sZW5ndGggPiAwICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29udHJvbC1yZWdleFxuXG4gICAgLy8gcHVsbCB0b2tlbnMgb3V0IHVudGlsIHdlIHJlYWNoIHNvbWV0aGluZyB0aGF0IGRvZXNuJ3QgbWF0Y2guIHRoYXQgbXVzdCBiZSB0aGUgZm9udCBzaXplIChhY2NvcmRpbmcgdG8gc3BlYylcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1sgaSBdO1xuICAgICAgaWYgKCB0b2tlbiA9PT0gJ25vcm1hbCcgKSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaGFzIHRvIGJlIGRvbmUsIGV2ZXJ5dGhpbmcgYWxyZWFkeSBub3JtYWwgYXMgZGVmYXVsdFxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIEZvbnQuaXNGb250U3R5bGUoIHRva2VuICkgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuc3R5bGUgPT09IHVuZGVmaW5lZCwgYFN0eWxlIGNhbm5vdCBiZSBhcHBsaWVkIHR3aWNlLiBBbHJlYWR5IHNldCB0byBcIiR7b3B0aW9ucy5zdHlsZX1cIiwgYXR0ZW1wdCB0byByZXBsYWNlIHdpdGggXCIke3Rva2VufVwiYCApO1xuICAgICAgICBvcHRpb25zLnN0eWxlID0gdG9rZW47XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggRm9udC5pc0ZvbnRWYXJpYW50KCB0b2tlbiApICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnZhcmlhbnQgPT09IHVuZGVmaW5lZCwgYFZhcmlhbnQgY2Fubm90IGJlIGFwcGxpZWQgdHdpY2UuIEFscmVhZHkgc2V0IHRvIFwiJHtvcHRpb25zLnZhcmlhbnR9XCIsIGF0dGVtcHQgdG8gcmVwbGFjZSB3aXRoIFwiJHt0b2tlbn1cImAgKTtcbiAgICAgICAgb3B0aW9ucy52YXJpYW50ID0gdG9rZW47XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggRm9udC5pc0ZvbnRXZWlnaHQoIHRva2VuICkgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMud2VpZ2h0ID09PSB1bmRlZmluZWQsIGBXZWlnaHQgY2Fubm90IGJlIGFwcGxpZWQgdHdpY2UuIEFscmVhZHkgc2V0IHRvIFwiJHtvcHRpb25zLndlaWdodH1cIiwgYXR0ZW1wdCB0byByZXBsYWNlIHdpdGggXCIke3Rva2VufVwiYCApO1xuICAgICAgICBvcHRpb25zLndlaWdodCA9IHRva2VuO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIEZvbnQuaXNGb250U3RyZXRjaCggdG9rZW4gKSApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zdHJldGNoID09PSB1bmRlZmluZWQsIGBTdHJldGNoIGNhbm5vdCBiZSBhcHBsaWVkIHR3aWNlLiBBbHJlYWR5IHNldCB0byBcIiR7b3B0aW9ucy5zdHJldGNofVwiLCBhdHRlbXB0IHRvIHJlcGxhY2Ugd2l0aCBcIiR7dG9rZW59XCJgICk7XG4gICAgICAgIG9wdGlvbnMuc3RyZXRjaCA9IHRva2VuO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIG5vdCBhIHN0eWxlL3ZhcmlhbnQvd2VpZ2h0L3N0cmV0Y2gsIG11c3QgYmUgYSBmb250IHNpemUsIHBvc3NpYmx5IHdpdGggYW4gaW5jbHVkZWQgbGluZS1oZWlnaHRcbiAgICAgICAgY29uc3Qgc3VidG9rZW5zID0gdG9rZW4uc3BsaXQoIC9cXC8vICk7IC8vIGV4dHJhY3QgZm9udCBzaXplIGZyb20gYW55IGxpbmUtaGVpZ2h0XG4gICAgICAgIG9wdGlvbnMuc2l6ZSA9IHN1YnRva2Vuc1sgMCBdO1xuICAgICAgICBpZiAoIHN1YnRva2Vuc1sgMSBdICkge1xuICAgICAgICAgIG9wdGlvbnMubGluZUhlaWdodCA9IHN1YnRva2Vuc1sgMSBdO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFsbCBmdXR1cmUgdG9rZW5zIGFyZSBndWFyYW50ZWVkIHRvIGJlIHBhcnQgb2YgdGhlIGZvbnQtZmFtaWx5IGlmIGl0IGlzIGdpdmVuIGFjY29yZGluZyB0byBzcGVjXG4gICAgICAgIG9wdGlvbnMuZmFtaWx5ID0gdG9rZW5zLnNsaWNlKCBpICsgMSApLmpvaW4oICcgJyApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEZvbnQoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgRm9udElPOiBJT1R5cGU8Rm9udCwgRm9udFN0YXRlPjtcblxuICAvLyB7Rm9udH0gLSBEZWZhdWx0IEZvbnQgb2JqZWN0IChzaW5jZSB0aGV5IGFyZSBpbW11dGFibGUpLlxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERFRkFVTFQgPSBuZXcgRm9udCgpO1xufVxuXG50eXBlIEZvbnRTdGF0ZSA9IFJlcXVpcmVkPFNlbGZPcHRpb25zPjtcblxuc2NlbmVyeS5yZWdpc3RlciggJ0ZvbnQnLCBGb250ICk7XG5cbkZvbnQuRm9udElPID0gbmV3IElPVHlwZTxGb250LCBGb250U3RhdGU+KCAnRm9udElPJywge1xuICB2YWx1ZVR5cGU6IEZvbnQsXG4gIGRvY3VtZW50YXRpb246ICdGb250IGhhbmRsaW5nIGZvciB0ZXh0IGRyYXdpbmcuIE9wdGlvbnM6JyArXG4gICAgICAgICAgICAgICAgICc8dWw+JyArXG4gICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz5zdHlsZTo8L3N0cm9uZz4gbm9ybWFsICAgICAgJm1kYXNoOyBub3JtYWwgfCBpdGFsaWMgfCBvYmxpcXVlIDwvbGk+JyArXG4gICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz52YXJpYW50Ojwvc3Ryb25nPiBub3JtYWwgICAgJm1kYXNoOyBub3JtYWwgfCBzbWFsbC1jYXBzIDwvbGk+JyArXG4gICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz53ZWlnaHQ6PC9zdHJvbmc+IG5vcm1hbCAgICAgJm1kYXNoOyBub3JtYWwgfCBib2xkIHwgYm9sZGVyIHwgbGlnaHRlciB8IDEwMCB8IDIwMCB8IDMwMCB8IDQwMCB8IDUwMCB8IDYwMCB8IDcwMCB8IDgwMCB8IDkwMCA8L2xpPicgK1xuICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+c3RyZXRjaDo8L3N0cm9uZz4gbm9ybWFsICAgICZtZGFzaDsgbm9ybWFsIHwgdWx0cmEtY29uZGVuc2VkIHwgZXh0cmEtY29uZGVuc2VkIHwgY29uZGVuc2VkIHwgc2VtaS1jb25kZW5zZWQgfCBzZW1pLWV4cGFuZGVkIHwgZXhwYW5kZWQgfCBleHRyYS1leHBhbmRlZCB8IHVsdHJhLWV4cGFuZGVkIDwvbGk+JyArXG4gICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz5zaXplOjwvc3Ryb25nPiAxMHB4ICAgICAgICAgJm1kYXNoOyBhYnNvbHV0ZS1zaXplIHwgcmVsYXRpdmUtc2l6ZSB8IGxlbmd0aCB8IHBlcmNlbnRhZ2UgLS0gdW5pdGxlc3MgbnVtYmVyIGludGVycHJldGVkIGFzIHB4LiBhYnNvbHV0ZSBzdWZmaXhlczogY20sIG1tLCBpbiwgcHQsIHBjLCBweC4gcmVsYXRpdmUgc3VmZml4ZXM6IGVtLCBleCwgY2gsIHJlbSwgdncsIHZoLCB2bWluLCB2bWF4LiA8L2xpPicgK1xuICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+bGluZUhlaWdodDo8L3N0cm9uZz4gbm9ybWFsICZtZGFzaDsgbm9ybWFsIHwgbnVtYmVyIHwgbGVuZ3RoIHwgcGVyY2VudGFnZSAtLSBOT1RFOiBDYW52YXMgc3BlYyBmb3JjZXMgbGluZS1oZWlnaHQgdG8gbm9ybWFsIDwvbGk+JyArXG4gICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz5mYW1pbHk6PC9zdHJvbmc+IHNhbnMtc2VyaWYgJm1kYXNoOyBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBmYW1pbGllcywgaW5jbHVkaW5nIGdlbmVyaWMgZmFtaWxpZXMgKHNlcmlmLCBzYW5zLXNlcmlmLCBjdXJzaXZlLCBmYW50YXN5LCBtb25vc3BhY2UpLiBpZGVhbGx5IGVzY2FwZSB3aXRoIGRvdWJsZS1xdW90ZXM8L2xpPicgK1xuICAgICAgICAgICAgICAgICAnPC91bD4nLFxuICB0b1N0YXRlT2JqZWN0OiAoIGZvbnQ6IEZvbnQgKTogRm9udFN0YXRlID0+ICgge1xuICAgIHN0eWxlOiBmb250LmdldFN0eWxlKCksXG4gICAgdmFyaWFudDogZm9udC5nZXRWYXJpYW50KCksXG4gICAgd2VpZ2h0OiBmb250LmdldFdlaWdodCgpLFxuICAgIHN0cmV0Y2g6IGZvbnQuZ2V0U3RyZXRjaCgpLFxuICAgIHNpemU6IGZvbnQuZ2V0U2l6ZSgpLFxuICAgIGxpbmVIZWlnaHQ6IGZvbnQuZ2V0TGluZUhlaWdodCgpLFxuICAgIGZhbWlseTogZm9udC5nZXRGYW1pbHkoKVxuICB9ICksXG5cbiAgZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdDogRm9udFN0YXRlICkge1xuICAgIHJldHVybiBuZXcgRm9udCggc3RhdGVPYmplY3QgKTtcbiAgfSxcblxuICBzdGF0ZVNjaGVtYToge1xuICAgIHN0eWxlOiBTdHJpbmdJTyxcbiAgICB2YXJpYW50OiBTdHJpbmdJTyxcbiAgICB3ZWlnaHQ6IFN0cmluZ0lPLFxuICAgIHN0cmV0Y2g6IFN0cmluZ0lPLFxuICAgIHNpemU6IFN0cmluZ0lPLFxuICAgIGxpbmVIZWlnaHQ6IFN0cmluZ0lPLFxuICAgIGZhbWlseTogU3RyaW5nSU9cbiAgfVxufSApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlBoZXRpb09iamVjdCIsIklPVHlwZSIsIlN0cmluZ0lPIiwic2NlbmVyeSIsIlZBTElEX1NUWUxFUyIsIlZBTElEX1ZBUklBTlRTIiwiVkFMSURfV0VJR0hUUyIsIlZBTElEX1NUUkVUQ0hFUyIsIkZvbnQiLCJnZXRGb250IiwiX2ZvbnQiLCJmb250IiwiZ2V0U3R5bGUiLCJfc3R5bGUiLCJzdHlsZSIsImdldFZhcmlhbnQiLCJfdmFyaWFudCIsInZhcmlhbnQiLCJnZXRXZWlnaHQiLCJfd2VpZ2h0Iiwid2VpZ2h0IiwiZ2V0U3RyZXRjaCIsIl9zdHJldGNoIiwic3RyZXRjaCIsImdldFNpemUiLCJfc2l6ZSIsInNpemUiLCJnZXROdW1lcmljU2l6ZSIsInB4TWF0Y2giLCJtYXRjaCIsIk51bWJlciIsInB0TWF0Y2giLCJlbU1hdGNoIiwibnVtZXJpY1NpemUiLCJnZXRMaW5lSGVpZ2h0IiwiX2xpbmVIZWlnaHQiLCJsaW5lSGVpZ2h0IiwiZ2V0RmFtaWx5IiwiX2ZhbWlseSIsImZhbWlseSIsImNvcHkiLCJvcHRpb25zIiwiY29tcHV0ZVNob3J0aGFuZCIsInJldCIsInRvQ1NTIiwiY2FzdFNpemUiLCJpc0ZvbnRTdHlsZSIsImluY2x1ZGVzIiwiaXNGb250VmFyaWFudCIsImlzRm9udFdlaWdodCIsImlzRm9udFN0cmV0Y2giLCJmcm9tQ1NTIiwiY3NzU3RyaW5nIiwidG9rZW5zIiwiXyIsImZpbHRlciIsInNwbGl0IiwidG9rZW4iLCJsZW5ndGgiLCJpIiwiYXNzZXJ0IiwidW5kZWZpbmVkIiwic3VidG9rZW5zIiwic2xpY2UiLCJqb2luIiwicHJvdmlkZWRPcHRpb25zIiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJwaGV0aW9UeXBlIiwiRm9udElPIiwiREVGQVVMVCIsInJlZ2lzdGVyIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsInN0YXRlU2NoZW1hIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCQyxHQUVELE9BQU9BLGFBQWFDLGNBQWMsUUFBUSxxQ0FBcUM7QUFDL0UsT0FBT0Msa0JBQTJDLHFDQUFxQztBQUN2RixPQUFPQyxZQUFZLHFDQUFxQztBQUN4RCxPQUFPQyxjQUFjLHVDQUF1QztBQUM1RCxTQUFTQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXhDLGdEQUFnRDtBQUNoRCxNQUFNQyxlQUFlO0lBQUU7SUFBVTtJQUFVO0NBQVc7QUFFdEQsa0RBQWtEO0FBQ2xELE1BQU1DLGlCQUFpQjtJQUFFO0lBQVU7Q0FBYztBQUVqRCxpREFBaUQ7QUFDakQsTUFBTUMsZ0JBQWdCO0lBQUU7SUFBVTtJQUFRO0lBQVU7SUFDbEQ7SUFBTztJQUFPO0lBQU87SUFBTztJQUFPO0lBQU87SUFBTztJQUFPO0NBQU87QUFFakUsa0RBQWtEO0FBQ2xELE1BQU1DLGtCQUFrQjtJQUFFO0lBQVU7SUFBbUI7SUFBbUI7SUFBYTtJQUNyRjtJQUFpQjtJQUFZO0lBQWtCO0NBQWtCO0FBd0NwRCxJQUFBLEFBQU1DLE9BQU4sTUFBTUEsYUFBYVI7SUEyRmhDOzs7Ozs7R0FNQyxHQUNELEFBQU9TLFVBQWtCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDQyxLQUFLO0lBQ25CO0lBRUEsSUFBV0MsT0FBZTtRQUFFLE9BQU8sSUFBSSxDQUFDRixPQUFPO0lBQUk7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