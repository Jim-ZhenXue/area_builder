// Copyright 2013-2024, University of Colorado Boulder
/**
 * Displays text that can be filled/stroked.
 *
 * For many font/text-related properties, it's helpful to understand the CSS equivalents (http://www.w3.org/TR/css3-fonts/).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import StringProperty from '../../../axon/js/StringProperty.js';
import TinyForwardingProperty from '../../../axon/js/TinyForwardingProperty.js';
import escapeHTML from '../../../phet-core/js/escapeHTML.js';
import extendDefined from '../../../phet-core/js/extendDefined.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import platform from '../../../phet-core/js/platform.js';
import phetioElementSelectionProperty from '../../../tandem/js/phetioElementSelectionProperty.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import { Font, Node, Paintable, PAINTABLE_DRAWABLE_MARK_FLAGS, PAINTABLE_OPTION_KEYS, Renderer, scenery, TextBounds, TextCanvasDrawable, TextDOMDrawable, TextSVGDrawable } from '../imports.js';
const STRING_PROPERTY_NAME = 'stringProperty'; // eslint-disable-line phet/bad-sim-text
// constants
const TEXT_OPTION_KEYS = [
    'boundsMethod',
    STRING_PROPERTY_NAME,
    'string',
    'font',
    'fontWeight',
    'fontFamily',
    'fontStretch',
    'fontStyle',
    'fontSize' // {string|number} - Sets the size of the current font, see setFont() for more documentation
];
// SVG bounds seems to be malfunctioning for Safari 5. Since we don't have a reproducible test machine for
// fast iteration, we'll guess the user agent and use DOM bounds instead of SVG.
// Hopefully the two constraints rule out any future Safari versions (fairly safe, but not impossible!)
const useDOMAsFastBounds = window.navigator.userAgent.includes('like Gecko) Version/5') && window.navigator.userAgent.includes('Safari/');
let Text = class Text extends Paintable(Node) {
    mutate(options) {
        if (assert && options && options.hasOwnProperty('string') && options.hasOwnProperty(STRING_PROPERTY_NAME)) {
            assert && assert(options.stringProperty.value === options.string, 'If both string and stringProperty are provided, then values should match');
        }
        return super.mutate(options);
    }
    /**
   * Sets the string displayed by our node.
   *
   * @param string - The string to display. If it's a number, it will be cast to a string
   */ setString(string) {
        assert && assert(string !== null && string !== undefined, 'String should be defined and non-null. Use the empty string if needed.');
        // cast it to a string (for numbers, etc., and do it before the change guard so we don't accidentally trigger on non-changed string)
        string = `${string}`;
        this._stringProperty.set(string);
        return this;
    }
    set string(value) {
        this.setString(value);
    }
    get string() {
        return this.getString();
    }
    /**
   * Returns the string displayed by our text Node.
   *
   * NOTE: If a number was provided to setString(), it will not be returned as a number here.
   */ getString() {
        return this._stringProperty.value;
    }
    /**
   * Returns a potentially modified version of this.string, where spaces are replaced with non-breaking spaces,
   * and embedding marks are potentially simplified.
   */ getRenderedText() {
        if (this._cachedRenderedText === null) {
            // Using the non-breaking space (&nbsp;) encoded as 0x00A0 in UTF-8
            this._cachedRenderedText = this.string.replace(' ', '\xA0');
            if (platform.edge) {
                // Simplify embedding marks to work around an Edge bug, see https://github.com/phetsims/scenery/issues/520
                this._cachedRenderedText = Text.simplifyEmbeddingMarks(this._cachedRenderedText);
            }
        }
        return this._cachedRenderedText;
    }
    get renderedText() {
        return this.getRenderedText();
    }
    /**
   * Called when our string Property changes values.
   */ onStringPropertyChange() {
        this._cachedRenderedText = null;
        const stateLen = this._drawables.length;
        for(let i = 0; i < stateLen; i++){
            this._drawables[i].markDirtyText();
        }
        this.invalidateText();
    }
    /**
   * See documentation for Node.setVisibleProperty, except this is for the text string.
   *
   * NOTE: Setting the .string after passing a truly read-only Property will fail at runtime. We choose to allow passing
   * in read-only Properties for convenience.
   */ setStringProperty(newTarget) {
        return this._stringProperty.setTargetProperty(newTarget, this, Text.STRING_PROPERTY_TANDEM_NAME);
    }
    set stringProperty(property) {
        this.setStringProperty(property);
    }
    get stringProperty() {
        return this.getStringProperty();
    }
    /**
   * Like Node.getVisibleProperty(), but for the text string. Note this is not the same as the Property provided in
   * setStringProperty. Thus is the nature of TinyForwardingProperty.
   */ getStringProperty() {
        return this._stringProperty;
    }
    /**
   * See documentation and comments in Node.initializePhetioObject
   */ initializePhetioObject(baseOptions, config) {
        // Track this, so we only override our stringProperty once.
        const wasInstrumented = this.isPhetioInstrumented();
        super.initializePhetioObject(baseOptions, config);
        if (Tandem.PHET_IO_ENABLED && !wasInstrumented && this.isPhetioInstrumented()) {
            this._stringProperty.initializePhetio(this, Text.STRING_PROPERTY_TANDEM_NAME, ()=>{
                return new StringProperty(this.string, combineOptions({
                    // by default, texts should be readonly. Editable texts most likely pass in editable Properties from i18n model Properties, see https://github.com/phetsims/scenery/issues/1443
                    phetioReadOnly: true,
                    tandem: this.tandem.createTandem(Text.STRING_PROPERTY_TANDEM_NAME),
                    phetioDocumentation: 'Property for the displayed text'
                }, config.stringPropertyOptions));
            });
        }
    }
    /**
   * Text supports a "string" selection mode, in which it will map to its stringProperty (if applicable), otherwise is
   * uses the default mouse-hit target from the supertype.
   */ getPhetioMouseHitTarget(fromLinking = false) {
        return phetioElementSelectionProperty.value === 'string' ? this.getStringPropertyPhetioMouseHitTarget(fromLinking) : super.getPhetioMouseHitTarget(fromLinking);
    }
    getStringPropertyPhetioMouseHitTarget(fromLinking = false) {
        const targetStringProperty = this._stringProperty.getTargetProperty();
        // Even if this isn't PhET-iO instrumented, it still qualifies as this RichText's hit
        return targetStringProperty instanceof PhetioObject ? targetStringProperty.getPhetioMouseHitTarget(fromLinking) : 'phetioNotSelectable';
    }
    /**
   * Sets the method that is used to determine bounds from the text.
   *
   * Possible values:
   * - 'fast' - Measures using SVG, can be inaccurate. Can't be rendered in Canvas.
   * - 'fastCanvas' - Like 'fast', but allows rendering in Canvas.
   * - 'accurate' - Recursively renders to a Canvas to accurately determine bounds. Slow, but works with all renderers.
   * - 'hybrid' - [default] Cache SVG height, and uses Canvas measureText for the width.
   *
   * TODO: deprecate fast/fastCanvas options? https://github.com/phetsims/scenery/issues/1581
   *
   * NOTE: Most of these are unfortunately not hard guarantees that content is all inside of the returned bounds.
   *       'accurate' should probably be the only one where that guarantee can be assumed. Things like cyrillic in
   *       italic, combining marks and other unicode features can fail to be detected. This is particularly relevant
   *       for the height, as certain stacked accent marks or descenders can go outside of the prescribed range,
   *       and fast/canvasCanvas/hybrid will always return the same vertical bounds (top and bottom) for a given font
   *       when the text isn't the empty string.
   */ setBoundsMethod(method) {
        assert && assert(method === 'fast' || method === 'fastCanvas' || method === 'accurate' || method === 'hybrid', 'Unknown Text boundsMethod');
        if (method !== this._boundsMethod) {
            this._boundsMethod = method;
            this.invalidateSupportedRenderers();
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyBounds();
            }
            this.invalidateText();
            this.rendererSummaryRefreshEmitter.emit(); // whether our self bounds are valid may have changed
        }
        return this;
    }
    set boundsMethod(value) {
        this.setBoundsMethod(value);
    }
    get boundsMethod() {
        return this.getBoundsMethod();
    }
    /**
   * Returns the current method to estimate the bounds of the text. See setBoundsMethod() for more information.
   */ getBoundsMethod() {
        return this._boundsMethod;
    }
    /**
   * Returns a bitmask representing the supported renderers for the current configuration of the Text node.
   *
   * @returns - A bitmask that includes supported renderers, see Renderer for details.
   */ getTextRendererBitmask() {
        let bitmask = 0;
        // canvas support (fast bounds may leak out of dirty rectangles)
        if (this._boundsMethod !== 'fast' && !this._isHTML) {
            bitmask |= Renderer.bitmaskCanvas;
        }
        if (!this._isHTML) {
            bitmask |= Renderer.bitmaskSVG;
        }
        // fill and stroke will determine whether we have DOM text support
        bitmask |= Renderer.bitmaskDOM;
        return bitmask;
    }
    /**
   * Triggers a check and update for what renderers the current configuration supports.
   * This should be called whenever something that could potentially change supported renderers happen (which can
   * be isHTML, boundsMethod, etc.)
   */ invalidateSupportedRenderers() {
        this.setRendererBitmask(this.getFillRendererBitmask() & this.getStrokeRendererBitmask() & this.getTextRendererBitmask());
    }
    /**
   * Notifies that something about the text's potential bounds have changed (different string, different stroke or font,
   * etc.)
   */ invalidateText() {
        this.invalidateSelf();
        // TODO: consider replacing this with a general dirty flag notification, and have DOM update bounds every frame? https://github.com/phetsims/scenery/issues/1581
        const stateLen = this._drawables.length;
        for(let i = 0; i < stateLen; i++){
            this._drawables[i].markDirtyBounds();
        }
        // we may have changed renderers if parameters were changed!
        this.invalidateSupportedRenderers();
    }
    /**
   * Computes a more efficient selfBounds for our Text.
   *
   * @returns - Whether the self bounds changed.
   */ updateSelfBounds() {
        // TODO: don't create another Bounds2 object just for this! https://github.com/phetsims/scenery/issues/1581
        let selfBounds;
        // investigate http://mudcu.be/journal/2011/01/html5-typographic-metrics/
        if (this._isHTML || useDOMAsFastBounds && this._boundsMethod !== 'accurate') {
            selfBounds = TextBounds.approximateDOMBounds(this._font, this.getDOMTextNode());
        } else if (this._boundsMethod === 'hybrid') {
            selfBounds = TextBounds.approximateHybridBounds(this._font, this.renderedText);
        } else if (this._boundsMethod === 'accurate') {
            selfBounds = TextBounds.accurateCanvasBounds(this);
        } else {
            assert && assert(this._boundsMethod === 'fast' || this._boundsMethod === 'fastCanvas');
            selfBounds = TextBounds.approximateSVGBounds(this._font, this.renderedText);
        }
        // for now, just add extra on, ignoring the possibility of mitered joints passing beyond
        if (this.hasStroke()) {
            selfBounds.dilate(this.getLineWidth() / 2);
        }
        const changed = !selfBounds.equals(this.selfBoundsProperty._value);
        if (changed) {
            this.selfBoundsProperty._value.set(selfBounds);
        }
        return changed;
    }
    /**
   * Called from (and overridden in) the Paintable trait, invalidates our current stroke, triggering recomputation of
   * anything that depended on the old stroke's value. (scenery-internal)
   */ invalidateStroke() {
        // stroke can change both the bounds and renderer
        this.invalidateText();
        super.invalidateStroke();
    }
    /**
   * Called from (and overridden in) the Paintable trait, invalidates our current fill, triggering recomputation of
   * anything that depended on the old fill's value. (scenery-internal)
   */ invalidateFill() {
        // fill type can change the renderer (gradient/fill not supported by DOM)
        this.invalidateText();
        super.invalidateFill();
    }
    /**
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */ canvasPaintSelf(wrapper, matrix) {
        //TODO: Have a separate method for this, instead of touching the prototype. Can make 'this' references too easily. https://github.com/phetsims/scenery/issues/1581
        TextCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
    }
    /**
   * Creates a DOM drawable for this Text. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createDOMDrawable(renderer, instance) {
        // @ts-expect-error
        return TextDOMDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a SVG drawable for this Text. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createSVGDrawable(renderer, instance) {
        // @ts-expect-error
        return TextSVGDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a Canvas drawable for this Text. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createCanvasDrawable(renderer, instance) {
        // @ts-expect-error
        return TextCanvasDrawable.createFromPool(renderer, instance);
    }
    /**
   * Returns a DOM element that contains the specified string. (scenery-internal)
   *
   * This is needed since we have to handle HTML text differently.
   */ getDOMTextNode() {
        if (this._isHTML) {
            const span = document.createElement('span');
            span.innerHTML = this.string;
            return span;
        } else {
            return document.createTextNode(this.renderedText);
        }
    }
    /**
   * Returns a bounding box that should contain all self content in the local coordinate frame (our normal self bounds
   * aren't guaranteed this for Text)
   *
   * We need to add additional padding around the text when the text is in a container that could clip things badly
   * if the text is larger than the normal bounds computation.
   */ getSafeSelfBounds() {
        const expansionFactor = 1; // we use a new bounding box with a new size of size * ( 1 + 2 * expansionFactor )
        const selfBounds = this.getSelfBounds();
        // NOTE: we'll keep this as an estimate for the bounds including stroke miters
        return selfBounds.dilatedXY(expansionFactor * selfBounds.width, expansionFactor * selfBounds.height);
    }
    /**
   * Sets the font of the Text node.
   *
   * This can either be a Scenery Font object, or a string. The string format is described by Font's constructor, and
   * is basically the CSS3 font shortcut format. If a string is provided, it will be wrapped with a new (immutable)
   * Scenery Font object.
   */ setFont(font) {
        // We need to detect whether things have updated in a different way depending on whether we are passed a string
        // or a Font object.
        const changed = font !== (typeof font === 'string' ? this._font.toCSS() : this._font);
        if (changed) {
            // Wrap so that our _font is of type {Font}
            this._font = typeof font === 'string' ? Font.fromCSS(font) : font;
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyFont();
            }
            this.invalidateText();
        }
        return this;
    }
    set font(value) {
        this.setFont(value);
    }
    get font() {
        return this.getFont();
    }
    /**
   * Returns a string representation of the current Font.
   *
   * This returns the CSS3 font shortcut that is a possible input to setFont(). See Font's constructor for detailed
   * information on the ordering of information.
   *
   * NOTE: If a Font object was provided to setFont(), this will not currently return it.
   * TODO: Can we refactor so we can have access to (a) the Font object, and possibly (b) the initially provided value. https://github.com/phetsims/scenery/issues/1581
   */ getFont() {
        return this._font.getFont();
    }
    /**
   * Sets the weight of this node's font.
   *
   * The font weight supports the following options:
   *   'normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900',
   *   or a number that when cast to a string will be one of the strings above.
   */ setFontWeight(weight) {
        return this.setFont(this._font.copy({
            weight: weight
        }));
    }
    set fontWeight(value) {
        this.setFontWeight(value);
    }
    get fontWeight() {
        return this.getFontWeight();
    }
    /**
   * Returns the weight of this node's font, see setFontWeight() for details.
   *
   * NOTE: If a numeric weight was passed in, it has been cast to a string, and a string will be returned here.
   */ getFontWeight() {
        return this._font.getWeight();
    }
    /**
   * Sets the family of this node's font.
   *
   * @param family - A comma-separated list of families, which can include generic families (preferably at
   *                 the end) such as 'serif', 'sans-serif', 'cursive', 'fantasy' and 'monospace'. If there
   *                 is any question about escaping (such as spaces in a font name), the family should be
   *                 surrounded by double quotes.
   */ setFontFamily(family) {
        return this.setFont(this._font.copy({
            family: family
        }));
    }
    set fontFamily(value) {
        this.setFontFamily(value);
    }
    get fontFamily() {
        return this.getFontFamily();
    }
    /**
   * Returns the family of this node's font, see setFontFamily() for details.
   */ getFontFamily() {
        return this._font.getFamily();
    }
    /**
   * Sets the stretch of this node's font.
   *
   * The font stretch supports the following options:
   *   'normal', 'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed',
   *   'semi-expanded', 'expanded', 'extra-expanded' or 'ultra-expanded'
   */ setFontStretch(stretch) {
        return this.setFont(this._font.copy({
            stretch: stretch
        }));
    }
    set fontStretch(value) {
        this.setFontStretch(value);
    }
    get fontStretch() {
        return this.getFontStretch();
    }
    /**
   * Returns the stretch of this node's font, see setFontStretch() for details.
   */ getFontStretch() {
        return this._font.getStretch();
    }
    /**
   * Sets the style of this node's font.
   *
   * The font style supports the following options: 'normal', 'italic' or 'oblique'
   */ setFontStyle(style) {
        return this.setFont(this._font.copy({
            style: style
        }));
    }
    set fontStyle(value) {
        this.setFontStyle(value);
    }
    get fontStyle() {
        return this.getFontStyle();
    }
    /**
   * Returns the style of this node's font, see setFontStyle() for details.
   */ getFontStyle() {
        return this._font.getStyle();
    }
    /**
   * Sets the size of this node's font.
   *
   * The size can either be a number (created as a quantity of 'px'), or any general CSS font-size string (for
   * example, '30pt', '5em', etc.)
   */ setFontSize(size) {
        return this.setFont(this._font.copy({
            size: size
        }));
    }
    set fontSize(value) {
        this.setFontSize(value);
    }
    get fontSize() {
        return this.getFontSize();
    }
    /**
   * Returns the size of this node's font, see setFontSize() for details.
   *
   * NOTE: If a numeric size was passed in, it has been converted to a string with 'px', and a string will be
   * returned here.
   */ getFontSize() {
        return this._font.getSize();
    }
    /**
   * Whether this Node itself is painted (displays something itself).
   */ isPainted() {
        // Always true for Text nodes
        return true;
    }
    /**
   * Whether this Node's selfBounds are considered to be valid (always containing the displayed self content
   * of this node). Meant to be overridden in subtypes when this can change (e.g. Text).
   *
   * If this value would potentially change, please trigger the event 'selfBoundsValid'.
   */ areSelfBoundsValid() {
        return this._boundsMethod === 'accurate';
    }
    /**
   * Override for extra information in the debugging output (from Display.getDebugHTML()). (scenery-internal)
   */ getDebugHTMLExtras() {
        return ` "${escapeHTML(this.renderedText)}"${this._isHTML ? ' (html)' : ''}`;
    }
    dispose() {
        super.dispose();
        this._stringProperty.dispose();
    }
    /**
   * Replaces embedding mark characters with visible strings. Useful for debugging for strings with embedding marks.
   *
   * @returns - With embedding marks replaced.
   */ static embeddedDebugString(string) {
        return string.replace(/\u202a/g, '[LTR]').replace(/\u202b/g, '[RTL]').replace(/\u202c/g, '[POP]');
    }
    /**
   * Returns a (potentially) modified string where embedding marks have been simplified.
   *
   * This simplification wouldn't usually be necessary, but we need to prevent cases like
   * https://github.com/phetsims/scenery/issues/520 where Edge decides to turn [POP][LTR] (after another [LTR]) into
   * a 'box' character, when nothing should be rendered.
   *
   * This will remove redundant nesting:
   *   e.g. [LTR][LTR]boo[POP][POP] => [LTR]boo[POP])
   * and will also combine adjacent directions:
   *   e.g. [LTR]Mail[POP][LTR]Man[POP] => [LTR]MailMan[Pop]
   *
   * Note that it will NOT combine in this way if there was a space between the two LTRs:
   *   e.g. [LTR]Mail[POP] [LTR]Man[Pop])
   * as in the general case, we'll want to preserve the break there between embeddings.
   *
   * TODO: A stack-based implementation that doesn't create a bunch of objects/closures would be nice for performance.
   */ static simplifyEmbeddingMarks(string) {
        // Root node (no direction, so we preserve root LTR/RTLs)
        const root = {
            dir: null,
            children: [],
            parent: null
        };
        let current = root;
        for(let i = 0; i < string.length; i++){
            const chr = string.charAt(i);
            // Push a direction
            if (chr === LTR || chr === RTL) {
                const node = {
                    dir: chr,
                    children: [],
                    parent: current
                };
                current.children.push(node);
                current = node;
            } else if (chr === POP) {
                assert && assert(current.parent, `Bad nesting of embedding marks: ${Text.embeddedDebugString(string)}`);
                current = current.parent;
            } else {
                current.children.push(chr);
            }
        }
        assert && assert(current === root, `Bad nesting of embedding marks: ${Text.embeddedDebugString(string)}`);
        // Remove redundant nesting (e.g. [LTR][LTR]...[POP][POP])
        function collapseNesting(node) {
            for(let i = node.children.length - 1; i >= 0; i--){
                const child = node.children[i];
                if (typeof child !== 'string' && node.dir === child.dir) {
                    node.children.splice(i, 1, ...child.children);
                }
            }
        }
        // Remove overridden nesting (e.g. [LTR][RTL]...[POP][POP]), since the outer one is not needed
        function collapseUnnecessary(node) {
            if (node.children.length === 1 && typeof node.children[0] !== 'string' && node.children[0].dir) {
                node.dir = node.children[0].dir;
                node.children = node.children[0].children;
            }
        }
        // Collapse adjacent matching dirs, e.g. [LTR]...[POP][LTR]...[POP]
        function collapseAdjacent(node) {
            for(let i = node.children.length - 1; i >= 1; i--){
                const previousChild = node.children[i - 1];
                const child = node.children[i];
                if (typeof child !== 'string' && typeof previousChild !== 'string' && child.dir && previousChild.dir === child.dir) {
                    previousChild.children = previousChild.children.concat(child.children);
                    node.children.splice(i, 1);
                    // Now try to collapse adjacent items in the child, since we combined children arrays
                    collapseAdjacent(previousChild);
                }
            }
        }
        // Simplifies the tree using the above functions
        function simplify(node) {
            if (typeof node !== 'string') {
                for(let i = 0; i < node.children.length; i++){
                    simplify(node.children[i]);
                }
                collapseUnnecessary(node);
                collapseNesting(node);
                collapseAdjacent(node);
            }
            return node;
        }
        // Turns a tree into a string
        function stringify(node) {
            if (typeof node === 'string') {
                return node;
            }
            const childString = node.children.map(stringify).join('');
            if (node.dir) {
                return `${node.dir + childString}\u202c`;
            } else {
                return childString;
            }
        }
        return stringify(simplify(root));
    }
    /**
   * @param string - See setString() for more documentation
   * @param [options] - Text-specific options are documented in TEXT_OPTION_KEYS above, and can be provided
   *                             along-side options for Node
   */ constructor(string, options){
        assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
        super();
        // We'll initialize this by mutating.
        this._stringProperty = new TinyForwardingProperty('', true, this.onStringPropertyChange.bind(this));
        this._font = Font.DEFAULT;
        this._boundsMethod = 'hybrid';
        this._isHTML = false; // TODO: clean this up https://github.com/phetsims/scenery/issues/1581
        this._cachedRenderedText = null;
        const definedOptions = extendDefined({
            fill: '#000000',
            // phet-io
            tandemNameSuffix: 'Text',
            phetioType: Text.TextIO,
            phetioVisiblePropertyInstrumented: false
        }, options);
        assert && assert(!definedOptions.hasOwnProperty('string') && !definedOptions.hasOwnProperty(Text.STRING_PROPERTY_TANDEM_NAME), 'provide string and stringProperty through constructor arg please');
        if (typeof string === 'string' || typeof string === 'number') {
            definedOptions.string = string;
        } else {
            definedOptions.stringProperty = string;
        }
        this.mutate(definedOptions);
        this.invalidateSupportedRenderers(); // takes care of setting up supported renderers
    }
};
Text.STRING_PROPERTY_NAME = STRING_PROPERTY_NAME;
Text.STRING_PROPERTY_TANDEM_NAME = STRING_PROPERTY_NAME;
export { Text as default };
/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ Text.prototype._mutatorKeys = [
    ...PAINTABLE_OPTION_KEYS,
    ...TEXT_OPTION_KEYS,
    ...Node.prototype._mutatorKeys
];
/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */ Text.prototype.drawableMarkFlags = [
    ...Node.prototype.drawableMarkFlags,
    ...PAINTABLE_DRAWABLE_MARK_FLAGS,
    'text',
    'font',
    'bounds'
];
scenery.register('Text', Text);
// Unicode embedding marks that we can combine to work around the Edge issue.
// See https://github.com/phetsims/scenery/issues/520
const LTR = '\u202a';
const RTL = '\u202b';
const POP = '\u202c';
// Initialize computation of hybrid text
TextBounds.initializeTextBounds();
Text.TextIO = new IOType('TextIO', {
    valueType: Text,
    supertype: Node.NodeIO,
    documentation: 'Text that is displayed in the simulation. TextIO has a nested PropertyIO.&lt;String&gt; for ' + 'the current string value.'
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvVGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEaXNwbGF5cyB0ZXh0IHRoYXQgY2FuIGJlIGZpbGxlZC9zdHJva2VkLlxuICpcbiAqIEZvciBtYW55IGZvbnQvdGV4dC1yZWxhdGVkIHByb3BlcnRpZXMsIGl0J3MgaGVscGZ1bCB0byB1bmRlcnN0YW5kIHRoZSBDU1MgZXF1aXZhbGVudHMgKGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtZm9udHMvKS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgU3RyaW5nUHJvcGVydHksIHsgU3RyaW5nUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlGb3J3YXJkaW5nUHJvcGVydHkuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgZXNjYXBlSFRNTCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZXNjYXBlSFRNTC5qcyc7XG5pbXBvcnQgZXh0ZW5kRGVmaW5lZCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZXh0ZW5kRGVmaW5lZC5qcyc7XG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgcGhldGlvRWxlbWVudFNlbGVjdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9waGV0aW9FbGVtZW50U2VsZWN0aW9uUHJvcGVydHkuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCB7IENhbnZhc0NvbnRleHRXcmFwcGVyLCBDYW52YXNTZWxmRHJhd2FibGUsIERPTVNlbGZEcmF3YWJsZSwgRm9udCwgRm9udFN0cmV0Y2gsIEZvbnRTdHlsZSwgRm9udFdlaWdodCwgSW5zdGFuY2UsIE5vZGUsIE5vZGVPcHRpb25zLCBQYWludGFibGUsIFBBSU5UQUJMRV9EUkFXQUJMRV9NQVJLX0ZMQUdTLCBQQUlOVEFCTEVfT1BUSU9OX0tFWVMsIFBhaW50YWJsZU9wdGlvbnMsIFJlbmRlcmVyLCBzY2VuZXJ5LCBTVkdTZWxmRHJhd2FibGUsIFRleHRCb3VuZHMsIFRleHRDYW52YXNEcmF3YWJsZSwgVGV4dERPTURyYXdhYmxlLCBUZXh0U1ZHRHJhd2FibGUsIFRUZXh0RHJhd2FibGUgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY29uc3QgU1RSSU5HX1BST1BFUlRZX05BTUUgPSAnc3RyaW5nUHJvcGVydHknOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgVEVYVF9PUFRJT05fS0VZUyA9IFtcbiAgJ2JvdW5kc01ldGhvZCcsIC8vIHtzdHJpbmd9IC0gU2V0cyBob3cgYm91bmRzIGFyZSBkZXRlcm1pbmVkIGZvciB0ZXh0LCBzZWUgc2V0Qm91bmRzTWV0aG9kKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICBTVFJJTkdfUFJPUEVSVFlfTkFNRSwgLy8ge1Byb3BlcnR5LjxzdHJpbmc+fG51bGx9IC0gU2V0cyBmb3J3YXJkaW5nIG9mIHRoZSBzdHJpbmdQcm9wZXJ0eSwgc2VlIHNldFN0cmluZ1Byb3BlcnR5KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnc3RyaW5nJywgLy8ge3N0cmluZ3xudW1iZXJ9IC0gU2V0cyB0aGUgc3RyaW5nIHRvIGJlIGRpc3BsYXllZCBieSB0aGlzIFRleHQsIHNlZSBzZXRTdHJpbmcoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdmb250JywgLy8ge0ZvbnR8c3RyaW5nfSAtIFNldHMgdGhlIGZvbnQgdXNlZCBmb3IgdGhlIHRleHQsIHNlZSBzZXRGb250KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnZm9udFdlaWdodCcsIC8vIHtzdHJpbmd8bnVtYmVyfSAtIFNldHMgdGhlIHdlaWdodCBvZiB0aGUgY3VycmVudCBmb250LCBzZWUgc2V0Rm9udCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2ZvbnRGYW1pbHknLCAvLyB7c3RyaW5nfSAtIFNldHMgdGhlIGZhbWlseSBvZiB0aGUgY3VycmVudCBmb250LCBzZWUgc2V0Rm9udCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2ZvbnRTdHJldGNoJywgLy8ge3N0cmluZ30gLSBTZXRzIHRoZSBzdHJldGNoIG9mIHRoZSBjdXJyZW50IGZvbnQsIHNlZSBzZXRGb250KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnZm9udFN0eWxlJywgLy8ge3N0cmluZ30gLSBTZXRzIHRoZSBzdHlsZSBvZiB0aGUgY3VycmVudCBmb250LCBzZWUgc2V0Rm9udCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2ZvbnRTaXplJyAvLyB7c3RyaW5nfG51bWJlcn0gLSBTZXRzIHRoZSBzaXplIG9mIHRoZSBjdXJyZW50IGZvbnQsIHNlZSBzZXRGb250KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuXTtcblxuLy8gU1ZHIGJvdW5kcyBzZWVtcyB0byBiZSBtYWxmdW5jdGlvbmluZyBmb3IgU2FmYXJpIDUuIFNpbmNlIHdlIGRvbid0IGhhdmUgYSByZXByb2R1Y2libGUgdGVzdCBtYWNoaW5lIGZvclxuLy8gZmFzdCBpdGVyYXRpb24sIHdlJ2xsIGd1ZXNzIHRoZSB1c2VyIGFnZW50IGFuZCB1c2UgRE9NIGJvdW5kcyBpbnN0ZWFkIG9mIFNWRy5cbi8vIEhvcGVmdWxseSB0aGUgdHdvIGNvbnN0cmFpbnRzIHJ1bGUgb3V0IGFueSBmdXR1cmUgU2FmYXJpIHZlcnNpb25zIChmYWlybHkgc2FmZSwgYnV0IG5vdCBpbXBvc3NpYmxlISlcbmNvbnN0IHVzZURPTUFzRmFzdEJvdW5kcyA9IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCAnbGlrZSBHZWNrbykgVmVyc2lvbi81JyApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyggJ1NhZmFyaS8nICk7XG5cbmV4cG9ydCB0eXBlIFRleHRCb3VuZHNNZXRob2QgPSAnZmFzdCcgfCAnZmFzdENhbnZhcycgfCAnYWNjdXJhdGUnIHwgJ2h5YnJpZCc7XG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBib3VuZHNNZXRob2Q/OiBUZXh0Qm91bmRzTWV0aG9kO1xuICBzdHJpbmdQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gfCBudWxsO1xuICBzdHJpbmc/OiBzdHJpbmcgfCBudW1iZXI7XG4gIGZvbnQ/OiBGb250IHwgc3RyaW5nO1xuICBmb250V2VpZ2h0Pzogc3RyaW5nIHwgbnVtYmVyO1xuICBmb250RmFtaWx5Pzogc3RyaW5nO1xuICBmb250U3RyZXRjaD86IHN0cmluZztcbiAgZm9udFN0eWxlPzogc3RyaW5nO1xuICBmb250U2l6ZT86IHN0cmluZyB8IG51bWJlcjtcbiAgc3RyaW5nUHJvcGVydHlPcHRpb25zPzogUHJvcGVydHlPcHRpb25zPHN0cmluZz47XG59O1xudHlwZSBQYXJlbnRPcHRpb25zID0gUGFpbnRhYmxlT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xuZXhwb3J0IHR5cGUgVGV4dE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhcmVudE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHQgZXh0ZW5kcyBQYWludGFibGUoIE5vZGUgKSB7XG5cbiAgLy8gVGhlIHN0cmluZyB0byBkaXNwbGF5XG4gIHByaXZhdGUgcmVhZG9ubHkgX3N0cmluZ1Byb3BlcnR5OiBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5PHN0cmluZz47XG5cbiAgLy8gVGhlIGZvbnQgd2l0aCB3aGljaCB0byBkaXNwbGF5IHRoZSB0ZXh0LlxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9mb250OiBGb250O1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX2JvdW5kc01ldGhvZDogVGV4dEJvdW5kc01ldGhvZDtcblxuICAvLyBXaGV0aGVyIHRoZSB0ZXh0IGlzIHJlbmRlcmVkIGFzIEhUTUwgb3Igbm90LiBpZiBkZWZpbmVkIChpbiBhIHN1YnR5cGUgY29uc3RydWN0b3IpLCB1c2UgdGhhdCB2YWx1ZSBpbnN0ZWFkXG4gIHByaXZhdGUgX2lzSFRNTDogYm9vbGVhbjtcblxuICAvLyBUaGUgYWN0dWFsIHN0cmluZyBkaXNwbGF5ZWQgKGNhbiBoYXZlIG5vbi1icmVha2luZyBzcGFjZXMgYW5kIGVtYmVkZGluZyBtYXJrcyByZXdyaXR0ZW4pLlxuICAvLyBXaGVuIHRoaXMgaXMgbnVsbCwgaXRzIHZhbHVlIG5lZWRzIHRvIGJlIHJlY29tcHV0ZWRcbiAgcHJpdmF0ZSBfY2FjaGVkUmVuZGVyZWRUZXh0OiBzdHJpbmcgfCBudWxsO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RSSU5HX1BST1BFUlRZX05BTUUgPSBTVFJJTkdfUFJPUEVSVFlfTkFNRTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUgPSBTVFJJTkdfUFJPUEVSVFlfTkFNRTtcblxuICAvKipcbiAgICogQHBhcmFtIHN0cmluZyAtIFNlZSBzZXRTdHJpbmcoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICAqIEBwYXJhbSBbb3B0aW9uc10gLSBUZXh0LXNwZWNpZmljIG9wdGlvbnMgYXJlIGRvY3VtZW50ZWQgaW4gVEVYVF9PUFRJT05fS0VZUyBhYm92ZSwgYW5kIGNhbiBiZSBwcm92aWRlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxvbmctc2lkZSBvcHRpb25zIGZvciBOb2RlXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHN0cmluZzogc3RyaW5nIHwgbnVtYmVyIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgb3B0aW9ucz86IFRleHRPcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gTm9kZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgLy8gV2UnbGwgaW5pdGlhbGl6ZSB0aGlzIGJ5IG11dGF0aW5nLlxuICAgIHRoaXMuX3N0cmluZ1Byb3BlcnR5ID0gbmV3IFRpbnlGb3J3YXJkaW5nUHJvcGVydHkoICcnLCB0cnVlLCB0aGlzLm9uU3RyaW5nUHJvcGVydHlDaGFuZ2UuYmluZCggdGhpcyApICk7XG4gICAgdGhpcy5fZm9udCA9IEZvbnQuREVGQVVMVDtcbiAgICB0aGlzLl9ib3VuZHNNZXRob2QgPSAnaHlicmlkJztcbiAgICB0aGlzLl9pc0hUTUwgPSBmYWxzZTsgLy8gVE9ETzogY2xlYW4gdGhpcyB1cCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHRoaXMuX2NhY2hlZFJlbmRlcmVkVGV4dCA9IG51bGw7XG5cbiAgICBjb25zdCBkZWZpbmVkT3B0aW9ucyA9IGV4dGVuZERlZmluZWQ8VGV4dE9wdGlvbnM+KCB7XG4gICAgICBmaWxsOiAnIzAwMDAwMCcsIC8vIERlZmF1bHQgdG8gYmxhY2sgZmlsbGVkIHN0cmluZ1xuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnVGV4dCcsXG4gICAgICBwaGV0aW9UeXBlOiBUZXh0LlRleHRJTyxcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhZGVmaW5lZE9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdzdHJpbmcnICkgJiYgIWRlZmluZWRPcHRpb25zLmhhc093blByb3BlcnR5KCBUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSApLFxuICAgICAgJ3Byb3ZpZGUgc3RyaW5nIGFuZCBzdHJpbmdQcm9wZXJ0eSB0aHJvdWdoIGNvbnN0cnVjdG9yIGFyZyBwbGVhc2UnICk7XG5cbiAgICBpZiAoIHR5cGVvZiBzdHJpbmcgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzdHJpbmcgPT09ICdudW1iZXInICkge1xuICAgICAgZGVmaW5lZE9wdGlvbnMuc3RyaW5nID0gc3RyaW5nO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGRlZmluZWRPcHRpb25zLnN0cmluZ1Byb3BlcnR5ID0gc3RyaW5nO1xuICAgIH1cblxuICAgIHRoaXMubXV0YXRlKCBkZWZpbmVkT3B0aW9ucyApO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzKCk7IC8vIHRha2VzIGNhcmUgb2Ygc2V0dGluZyB1cCBzdXBwb3J0ZWQgcmVuZGVyZXJzXG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogVGV4dE9wdGlvbnMgKTogdGhpcyB7XG5cbiAgICBpZiAoIGFzc2VydCAmJiBvcHRpb25zICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdzdHJpbmcnICkgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggU1RSSU5HX1BST1BFUlRZX05BTUUgKSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuc3RyaW5nUHJvcGVydHkhLnZhbHVlID09PSBvcHRpb25zLnN0cmluZywgJ0lmIGJvdGggc3RyaW5nIGFuZCBzdHJpbmdQcm9wZXJ0eSBhcmUgcHJvdmlkZWQsIHRoZW4gdmFsdWVzIHNob3VsZCBtYXRjaCcgKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHN0cmluZyBkaXNwbGF5ZWQgYnkgb3VyIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSBzdHJpbmcgLSBUaGUgc3RyaW5nIHRvIGRpc3BsYXkuIElmIGl0J3MgYSBudW1iZXIsIGl0IHdpbGwgYmUgY2FzdCB0byBhIHN0cmluZ1xuICAgKi9cbiAgcHVibGljIHNldFN0cmluZyggc3RyaW5nOiBzdHJpbmcgfCBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RyaW5nICE9PSBudWxsICYmIHN0cmluZyAhPT0gdW5kZWZpbmVkLCAnU3RyaW5nIHNob3VsZCBiZSBkZWZpbmVkIGFuZCBub24tbnVsbC4gVXNlIHRoZSBlbXB0eSBzdHJpbmcgaWYgbmVlZGVkLicgKTtcblxuICAgIC8vIGNhc3QgaXQgdG8gYSBzdHJpbmcgKGZvciBudW1iZXJzLCBldGMuLCBhbmQgZG8gaXQgYmVmb3JlIHRoZSBjaGFuZ2UgZ3VhcmQgc28gd2UgZG9uJ3QgYWNjaWRlbnRhbGx5IHRyaWdnZXIgb24gbm9uLWNoYW5nZWQgc3RyaW5nKVxuICAgIHN0cmluZyA9IGAke3N0cmluZ31gO1xuXG4gICAgdGhpcy5fc3RyaW5nUHJvcGVydHkuc2V0KCBzdHJpbmcgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBzdHJpbmcoIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgKSB7IHRoaXMuc2V0U3RyaW5nKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBzdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0U3RyaW5nKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3RyaW5nIGRpc3BsYXllZCBieSBvdXIgdGV4dCBOb2RlLlxuICAgKlxuICAgKiBOT1RFOiBJZiBhIG51bWJlciB3YXMgcHJvdmlkZWQgdG8gc2V0U3RyaW5nKCksIGl0IHdpbGwgbm90IGJlIHJldHVybmVkIGFzIGEgbnVtYmVyIGhlcmUuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZ1Byb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwb3RlbnRpYWxseSBtb2RpZmllZCB2ZXJzaW9uIG9mIHRoaXMuc3RyaW5nLCB3aGVyZSBzcGFjZXMgYXJlIHJlcGxhY2VkIHdpdGggbm9uLWJyZWFraW5nIHNwYWNlcyxcbiAgICogYW5kIGVtYmVkZGluZyBtYXJrcyBhcmUgcG90ZW50aWFsbHkgc2ltcGxpZmllZC5cbiAgICovXG4gIHB1YmxpYyBnZXRSZW5kZXJlZFRleHQoKTogc3RyaW5nIHtcbiAgICBpZiAoIHRoaXMuX2NhY2hlZFJlbmRlcmVkVGV4dCA9PT0gbnVsbCApIHtcbiAgICAgIC8vIFVzaW5nIHRoZSBub24tYnJlYWtpbmcgc3BhY2UgKCZuYnNwOykgZW5jb2RlZCBhcyAweDAwQTAgaW4gVVRGLThcbiAgICAgIHRoaXMuX2NhY2hlZFJlbmRlcmVkVGV4dCA9IHRoaXMuc3RyaW5nLnJlcGxhY2UoICcgJywgJ1xceEEwJyApO1xuXG4gICAgICBpZiAoIHBsYXRmb3JtLmVkZ2UgKSB7XG4gICAgICAgIC8vIFNpbXBsaWZ5IGVtYmVkZGluZyBtYXJrcyB0byB3b3JrIGFyb3VuZCBhbiBFZGdlIGJ1Zywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MjBcbiAgICAgICAgdGhpcy5fY2FjaGVkUmVuZGVyZWRUZXh0ID0gVGV4dC5zaW1wbGlmeUVtYmVkZGluZ01hcmtzKCB0aGlzLl9jYWNoZWRSZW5kZXJlZFRleHQgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkUmVuZGVyZWRUZXh0O1xuICB9XG5cbiAgcHVibGljIGdldCByZW5kZXJlZFRleHQoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0UmVuZGVyZWRUZXh0KCk7IH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gb3VyIHN0cmluZyBQcm9wZXJ0eSBjaGFuZ2VzIHZhbHVlcy5cbiAgICovXG4gIHByaXZhdGUgb25TdHJpbmdQcm9wZXJ0eUNoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jYWNoZWRSZW5kZXJlZFRleHQgPSBudWxsO1xuXG4gICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XG4gICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFRleHREcmF3YWJsZSApLm1hcmtEaXJ0eVRleHQoKTtcbiAgICB9XG5cbiAgICB0aGlzLmludmFsaWRhdGVUZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGRvY3VtZW50YXRpb24gZm9yIE5vZGUuc2V0VmlzaWJsZVByb3BlcnR5LCBleGNlcHQgdGhpcyBpcyBmb3IgdGhlIHRleHQgc3RyaW5nLlxuICAgKlxuICAgKiBOT1RFOiBTZXR0aW5nIHRoZSAuc3RyaW5nIGFmdGVyIHBhc3NpbmcgYSB0cnVseSByZWFkLW9ubHkgUHJvcGVydHkgd2lsbCBmYWlsIGF0IHJ1bnRpbWUuIFdlIGNob29zZSB0byBhbGxvdyBwYXNzaW5nXG4gICAqIGluIHJlYWQtb25seSBQcm9wZXJ0aWVzIGZvciBjb252ZW5pZW5jZS5cbiAgICovXG4gIHB1YmxpYyBzZXRTdHJpbmdQcm9wZXJ0eSggbmV3VGFyZ2V0OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHwgbnVsbCApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5nUHJvcGVydHkuc2V0VGFyZ2V0UHJvcGVydHkoIG5ld1RhcmdldCBhcyBUUHJvcGVydHk8c3RyaW5nPiwgdGhpcywgVGV4dC5TVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUgKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgc3RyaW5nUHJvcGVydHkoIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHwgbnVsbCApIHsgdGhpcy5zZXRTdHJpbmdQcm9wZXJ0eSggcHJvcGVydHkgKTsgfVxuXG4gIHB1YmxpYyBnZXQgc3RyaW5nUHJvcGVydHkoKTogVFByb3BlcnR5PHN0cmluZz4geyByZXR1cm4gdGhpcy5nZXRTdHJpbmdQcm9wZXJ0eSgpOyB9XG5cbiAgLyoqXG4gICAqIExpa2UgTm9kZS5nZXRWaXNpYmxlUHJvcGVydHkoKSwgYnV0IGZvciB0aGUgdGV4dCBzdHJpbmcuIE5vdGUgdGhpcyBpcyBub3QgdGhlIHNhbWUgYXMgdGhlIFByb3BlcnR5IHByb3ZpZGVkIGluXG4gICAqIHNldFN0cmluZ1Byb3BlcnR5LiBUaHVzIGlzIHRoZSBuYXR1cmUgb2YgVGlueUZvcndhcmRpbmdQcm9wZXJ0eS5cbiAgICovXG4gIHB1YmxpYyBnZXRTdHJpbmdQcm9wZXJ0eSgpOiBUUHJvcGVydHk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZ1Byb3BlcnR5O1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBkb2N1bWVudGF0aW9uIGFuZCBjb21tZW50cyBpbiBOb2RlLmluaXRpYWxpemVQaGV0aW9PYmplY3RcbiAgICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSBpbml0aWFsaXplUGhldGlvT2JqZWN0KCBiYXNlT3B0aW9uczogUGFydGlhbDxQaGV0aW9PYmplY3RPcHRpb25zPiwgY29uZmlnOiBUZXh0T3B0aW9ucyApOiB2b2lkIHtcblxuICAgIC8vIFRyYWNrIHRoaXMsIHNvIHdlIG9ubHkgb3ZlcnJpZGUgb3VyIHN0cmluZ1Byb3BlcnR5IG9uY2UuXG4gICAgY29uc3Qgd2FzSW5zdHJ1bWVudGVkID0gdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpO1xuXG4gICAgc3VwZXIuaW5pdGlhbGl6ZVBoZXRpb09iamVjdCggYmFzZU9wdGlvbnMsIGNvbmZpZyApO1xuXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmICF3YXNJbnN0cnVtZW50ZWQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICkge1xuICAgICAgdGhpcy5fc3RyaW5nUHJvcGVydHkuaW5pdGlhbGl6ZVBoZXRpbyggdGhpcywgVGV4dC5TVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFN0cmluZ1Byb3BlcnR5KCB0aGlzLnN0cmluZywgY29tYmluZU9wdGlvbnM8U3RyaW5nUHJvcGVydHlPcHRpb25zPigge1xuXG4gICAgICAgICAgICAvLyBieSBkZWZhdWx0LCB0ZXh0cyBzaG91bGQgYmUgcmVhZG9ubHkuIEVkaXRhYmxlIHRleHRzIG1vc3QgbGlrZWx5IHBhc3MgaW4gZWRpdGFibGUgUHJvcGVydGllcyBmcm9tIGkxOG4gbW9kZWwgUHJvcGVydGllcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNDQzXG4gICAgICAgICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcbiAgICAgICAgICAgIHRhbmRlbTogdGhpcy50YW5kZW0uY3JlYXRlVGFuZGVtKCBUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSApLFxuICAgICAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1Byb3BlcnR5IGZvciB0aGUgZGlzcGxheWVkIHRleHQnXG5cbiAgICAgICAgICB9LCBjb25maWcuc3RyaW5nUHJvcGVydHlPcHRpb25zICkgKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGV4dCBzdXBwb3J0cyBhIFwic3RyaW5nXCIgc2VsZWN0aW9uIG1vZGUsIGluIHdoaWNoIGl0IHdpbGwgbWFwIHRvIGl0cyBzdHJpbmdQcm9wZXJ0eSAoaWYgYXBwbGljYWJsZSksIG90aGVyd2lzZSBpc1xuICAgKiB1c2VzIHRoZSBkZWZhdWx0IG1vdXNlLWhpdCB0YXJnZXQgZnJvbSB0aGUgc3VwZXJ0eXBlLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGdldFBoZXRpb01vdXNlSGl0VGFyZ2V0KCBmcm9tTGlua2luZyA9IGZhbHNlICk6IFBoZXRpb09iamVjdCB8ICdwaGV0aW9Ob3RTZWxlY3RhYmxlJyB7XG4gICAgcmV0dXJuIHBoZXRpb0VsZW1lbnRTZWxlY3Rpb25Qcm9wZXJ0eS52YWx1ZSA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICB0aGlzLmdldFN0cmluZ1Byb3BlcnR5UGhldGlvTW91c2VIaXRUYXJnZXQoIGZyb21MaW5raW5nICkgOlxuICAgICAgICAgICBzdXBlci5nZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCggZnJvbUxpbmtpbmcgKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U3RyaW5nUHJvcGVydHlQaGV0aW9Nb3VzZUhpdFRhcmdldCggZnJvbUxpbmtpbmcgPSBmYWxzZSApOiBQaGV0aW9PYmplY3QgfCAncGhldGlvTm90U2VsZWN0YWJsZScge1xuICAgIGNvbnN0IHRhcmdldFN0cmluZ1Byb3BlcnR5ID0gdGhpcy5fc3RyaW5nUHJvcGVydHkuZ2V0VGFyZ2V0UHJvcGVydHkoKTtcblxuICAgIC8vIEV2ZW4gaWYgdGhpcyBpc24ndCBQaEVULWlPIGluc3RydW1lbnRlZCwgaXQgc3RpbGwgcXVhbGlmaWVzIGFzIHRoaXMgUmljaFRleHQncyBoaXRcbiAgICByZXR1cm4gdGFyZ2V0U3RyaW5nUHJvcGVydHkgaW5zdGFuY2VvZiBQaGV0aW9PYmplY3QgP1xuICAgICAgICAgICB0YXJnZXRTdHJpbmdQcm9wZXJ0eS5nZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCggZnJvbUxpbmtpbmcgKSA6XG4gICAgICAgICAgICdwaGV0aW9Ob3RTZWxlY3RhYmxlJztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGRldGVybWluZSBib3VuZHMgZnJvbSB0aGUgdGV4dC5cbiAgICpcbiAgICogUG9zc2libGUgdmFsdWVzOlxuICAgKiAtICdmYXN0JyAtIE1lYXN1cmVzIHVzaW5nIFNWRywgY2FuIGJlIGluYWNjdXJhdGUuIENhbid0IGJlIHJlbmRlcmVkIGluIENhbnZhcy5cbiAgICogLSAnZmFzdENhbnZhcycgLSBMaWtlICdmYXN0JywgYnV0IGFsbG93cyByZW5kZXJpbmcgaW4gQ2FudmFzLlxuICAgKiAtICdhY2N1cmF0ZScgLSBSZWN1cnNpdmVseSByZW5kZXJzIHRvIGEgQ2FudmFzIHRvIGFjY3VyYXRlbHkgZGV0ZXJtaW5lIGJvdW5kcy4gU2xvdywgYnV0IHdvcmtzIHdpdGggYWxsIHJlbmRlcmVycy5cbiAgICogLSAnaHlicmlkJyAtIFtkZWZhdWx0XSBDYWNoZSBTVkcgaGVpZ2h0LCBhbmQgdXNlcyBDYW52YXMgbWVhc3VyZVRleHQgZm9yIHRoZSB3aWR0aC5cbiAgICpcbiAgICogVE9ETzogZGVwcmVjYXRlIGZhc3QvZmFzdENhbnZhcyBvcHRpb25zPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKlxuICAgKiBOT1RFOiBNb3N0IG9mIHRoZXNlIGFyZSB1bmZvcnR1bmF0ZWx5IG5vdCBoYXJkIGd1YXJhbnRlZXMgdGhhdCBjb250ZW50IGlzIGFsbCBpbnNpZGUgb2YgdGhlIHJldHVybmVkIGJvdW5kcy5cbiAgICogICAgICAgJ2FjY3VyYXRlJyBzaG91bGQgcHJvYmFibHkgYmUgdGhlIG9ubHkgb25lIHdoZXJlIHRoYXQgZ3VhcmFudGVlIGNhbiBiZSBhc3N1bWVkLiBUaGluZ3MgbGlrZSBjeXJpbGxpYyBpblxuICAgKiAgICAgICBpdGFsaWMsIGNvbWJpbmluZyBtYXJrcyBhbmQgb3RoZXIgdW5pY29kZSBmZWF0dXJlcyBjYW4gZmFpbCB0byBiZSBkZXRlY3RlZC4gVGhpcyBpcyBwYXJ0aWN1bGFybHkgcmVsZXZhbnRcbiAgICogICAgICAgZm9yIHRoZSBoZWlnaHQsIGFzIGNlcnRhaW4gc3RhY2tlZCBhY2NlbnQgbWFya3Mgb3IgZGVzY2VuZGVycyBjYW4gZ28gb3V0c2lkZSBvZiB0aGUgcHJlc2NyaWJlZCByYW5nZSxcbiAgICogICAgICAgYW5kIGZhc3QvY2FudmFzQ2FudmFzL2h5YnJpZCB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgdmVydGljYWwgYm91bmRzICh0b3AgYW5kIGJvdHRvbSkgZm9yIGEgZ2l2ZW4gZm9udFxuICAgKiAgICAgICB3aGVuIHRoZSB0ZXh0IGlzbid0IHRoZSBlbXB0eSBzdHJpbmcuXG4gICAqL1xuICBwdWJsaWMgc2V0Qm91bmRzTWV0aG9kKCBtZXRob2Q6IFRleHRCb3VuZHNNZXRob2QgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWV0aG9kID09PSAnZmFzdCcgfHwgbWV0aG9kID09PSAnZmFzdENhbnZhcycgfHwgbWV0aG9kID09PSAnYWNjdXJhdGUnIHx8IG1ldGhvZCA9PT0gJ2h5YnJpZCcsICdVbmtub3duIFRleHQgYm91bmRzTWV0aG9kJyApO1xuICAgIGlmICggbWV0aG9kICE9PSB0aGlzLl9ib3VuZHNNZXRob2QgKSB7XG4gICAgICB0aGlzLl9ib3VuZHNNZXRob2QgPSBtZXRob2Q7XG4gICAgICB0aGlzLmludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTtcblxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRUZXh0RHJhd2FibGUgKS5tYXJrRGlydHlCb3VuZHMoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnZhbGlkYXRlVGV4dCgpO1xuXG4gICAgICB0aGlzLnJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyLmVtaXQoKTsgLy8gd2hldGhlciBvdXIgc2VsZiBib3VuZHMgYXJlIHZhbGlkIG1heSBoYXZlIGNoYW5nZWRcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IGJvdW5kc01ldGhvZCggdmFsdWU6IFRleHRCb3VuZHNNZXRob2QgKSB7IHRoaXMuc2V0Qm91bmRzTWV0aG9kKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBib3VuZHNNZXRob2QoKTogVGV4dEJvdW5kc01ldGhvZCB7IHJldHVybiB0aGlzLmdldEJvdW5kc01ldGhvZCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgbWV0aG9kIHRvIGVzdGltYXRlIHRoZSBib3VuZHMgb2YgdGhlIHRleHQuIFNlZSBzZXRCb3VuZHNNZXRob2QoKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBnZXRCb3VuZHNNZXRob2QoKTogVGV4dEJvdW5kc01ldGhvZCB7XG4gICAgcmV0dXJuIHRoaXMuX2JvdW5kc01ldGhvZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYml0bWFzayByZXByZXNlbnRpbmcgdGhlIHN1cHBvcnRlZCByZW5kZXJlcnMgZm9yIHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24gb2YgdGhlIFRleHQgbm9kZS5cbiAgICpcbiAgICogQHJldHVybnMgLSBBIGJpdG1hc2sgdGhhdCBpbmNsdWRlcyBzdXBwb3J0ZWQgcmVuZGVyZXJzLCBzZWUgUmVuZGVyZXIgZm9yIGRldGFpbHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0VGV4dFJlbmRlcmVyQml0bWFzaygpOiBudW1iZXIge1xuICAgIGxldCBiaXRtYXNrID0gMDtcblxuICAgIC8vIGNhbnZhcyBzdXBwb3J0IChmYXN0IGJvdW5kcyBtYXkgbGVhayBvdXQgb2YgZGlydHkgcmVjdGFuZ2xlcylcbiAgICBpZiAoIHRoaXMuX2JvdW5kc01ldGhvZCAhPT0gJ2Zhc3QnICYmICF0aGlzLl9pc0hUTUwgKSB7XG4gICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tDYW52YXM7XG4gICAgfVxuICAgIGlmICggIXRoaXMuX2lzSFRNTCApIHtcbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza1NWRztcbiAgICB9XG5cbiAgICAvLyBmaWxsIGFuZCBzdHJva2Ugd2lsbCBkZXRlcm1pbmUgd2hldGhlciB3ZSBoYXZlIERPTSB0ZXh0IHN1cHBvcnRcbiAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tET007XG5cbiAgICByZXR1cm4gYml0bWFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGNoZWNrIGFuZCB1cGRhdGUgZm9yIHdoYXQgcmVuZGVyZXJzIHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24gc3VwcG9ydHMuXG4gICAqIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciBzb21ldGhpbmcgdGhhdCBjb3VsZCBwb3RlbnRpYWxseSBjaGFuZ2Ugc3VwcG9ydGVkIHJlbmRlcmVycyBoYXBwZW4gKHdoaWNoIGNhblxuICAgKiBiZSBpc0hUTUwsIGJvdW5kc01ldGhvZCwgZXRjLilcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBpbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0UmVuZGVyZXJCaXRtYXNrKCB0aGlzLmdldEZpbGxSZW5kZXJlckJpdG1hc2soKSAmIHRoaXMuZ2V0U3Ryb2tlUmVuZGVyZXJCaXRtYXNrKCkgJiB0aGlzLmdldFRleHRSZW5kZXJlckJpdG1hc2soKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHRoYXQgc29tZXRoaW5nIGFib3V0IHRoZSB0ZXh0J3MgcG90ZW50aWFsIGJvdW5kcyBoYXZlIGNoYW5nZWQgKGRpZmZlcmVudCBzdHJpbmcsIGRpZmZlcmVudCBzdHJva2Ugb3IgZm9udCxcbiAgICogZXRjLilcbiAgICovXG4gIHByaXZhdGUgaW52YWxpZGF0ZVRleHQoKTogdm9pZCB7XG4gICAgdGhpcy5pbnZhbGlkYXRlU2VsZigpO1xuXG4gICAgLy8gVE9ETzogY29uc2lkZXIgcmVwbGFjaW5nIHRoaXMgd2l0aCBhIGdlbmVyYWwgZGlydHkgZmxhZyBub3RpZmljYXRpb24sIGFuZCBoYXZlIERPTSB1cGRhdGUgYm91bmRzIGV2ZXJ5IGZyYW1lPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRUZXh0RHJhd2FibGUgKS5tYXJrRGlydHlCb3VuZHMoKTtcbiAgICB9XG5cbiAgICAvLyB3ZSBtYXkgaGF2ZSBjaGFuZ2VkIHJlbmRlcmVycyBpZiBwYXJhbWV0ZXJzIHdlcmUgY2hhbmdlZCFcbiAgICB0aGlzLmludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyBhIG1vcmUgZWZmaWNpZW50IHNlbGZCb3VuZHMgZm9yIG91ciBUZXh0LlxuICAgKlxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgdGhlIHNlbGYgYm91bmRzIGNoYW5nZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdXBkYXRlU2VsZkJvdW5kcygpOiBib29sZWFuIHtcbiAgICAvLyBUT0RPOiBkb24ndCBjcmVhdGUgYW5vdGhlciBCb3VuZHMyIG9iamVjdCBqdXN0IGZvciB0aGlzISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGxldCBzZWxmQm91bmRzO1xuXG4gICAgLy8gaW52ZXN0aWdhdGUgaHR0cDovL211ZGN1LmJlL2pvdXJuYWwvMjAxMS8wMS9odG1sNS10eXBvZ3JhcGhpYy1tZXRyaWNzL1xuICAgIGlmICggdGhpcy5faXNIVE1MIHx8ICggdXNlRE9NQXNGYXN0Qm91bmRzICYmIHRoaXMuX2JvdW5kc01ldGhvZCAhPT0gJ2FjY3VyYXRlJyApICkge1xuICAgICAgc2VsZkJvdW5kcyA9IFRleHRCb3VuZHMuYXBwcm94aW1hdGVET01Cb3VuZHMoIHRoaXMuX2ZvbnQsIHRoaXMuZ2V0RE9NVGV4dE5vZGUoKSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fYm91bmRzTWV0aG9kID09PSAnaHlicmlkJyApIHtcbiAgICAgIHNlbGZCb3VuZHMgPSBUZXh0Qm91bmRzLmFwcHJveGltYXRlSHlicmlkQm91bmRzKCB0aGlzLl9mb250LCB0aGlzLnJlbmRlcmVkVGV4dCApO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fYm91bmRzTWV0aG9kID09PSAnYWNjdXJhdGUnICkge1xuICAgICAgc2VsZkJvdW5kcyA9IFRleHRCb3VuZHMuYWNjdXJhdGVDYW52YXNCb3VuZHMoIHRoaXMgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdmYXN0JyB8fCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdmYXN0Q2FudmFzJyApO1xuICAgICAgc2VsZkJvdW5kcyA9IFRleHRCb3VuZHMuYXBwcm94aW1hdGVTVkdCb3VuZHMoIHRoaXMuX2ZvbnQsIHRoaXMucmVuZGVyZWRUZXh0ICk7XG4gICAgfVxuXG4gICAgLy8gZm9yIG5vdywganVzdCBhZGQgZXh0cmEgb24sIGlnbm9yaW5nIHRoZSBwb3NzaWJpbGl0eSBvZiBtaXRlcmVkIGpvaW50cyBwYXNzaW5nIGJleW9uZFxuICAgIGlmICggdGhpcy5oYXNTdHJva2UoKSApIHtcbiAgICAgIHNlbGZCb3VuZHMuZGlsYXRlKCB0aGlzLmdldExpbmVXaWR0aCgpIC8gMiApO1xuICAgIH1cblxuICAgIGNvbnN0IGNoYW5nZWQgPSAhc2VsZkJvdW5kcy5lcXVhbHMoIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZSApO1xuICAgIGlmICggY2hhbmdlZCApIHtcbiAgICAgIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZS5zZXQoIHNlbGZCb3VuZHMgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZyb20gKGFuZCBvdmVycmlkZGVuIGluKSB0aGUgUGFpbnRhYmxlIHRyYWl0LCBpbnZhbGlkYXRlcyBvdXIgY3VycmVudCBzdHJva2UsIHRyaWdnZXJpbmcgcmVjb21wdXRhdGlvbiBvZlxuICAgKiBhbnl0aGluZyB0aGF0IGRlcGVuZGVkIG9uIHRoZSBvbGQgc3Ryb2tlJ3MgdmFsdWUuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGludmFsaWRhdGVTdHJva2UoKTogdm9pZCB7XG4gICAgLy8gc3Ryb2tlIGNhbiBjaGFuZ2UgYm90aCB0aGUgYm91bmRzIGFuZCByZW5kZXJlclxuICAgIHRoaXMuaW52YWxpZGF0ZVRleHQoKTtcblxuICAgIHN1cGVyLmludmFsaWRhdGVTdHJva2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgZnJvbSAoYW5kIG92ZXJyaWRkZW4gaW4pIHRoZSBQYWludGFibGUgdHJhaXQsIGludmFsaWRhdGVzIG91ciBjdXJyZW50IGZpbGwsIHRyaWdnZXJpbmcgcmVjb21wdXRhdGlvbiBvZlxuICAgKiBhbnl0aGluZyB0aGF0IGRlcGVuZGVkIG9uIHRoZSBvbGQgZmlsbCdzIHZhbHVlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBpbnZhbGlkYXRlRmlsbCgpOiB2b2lkIHtcbiAgICAvLyBmaWxsIHR5cGUgY2FuIGNoYW5nZSB0aGUgcmVuZGVyZXIgKGdyYWRpZW50L2ZpbGwgbm90IHN1cHBvcnRlZCBieSBET00pXG4gICAgdGhpcy5pbnZhbGlkYXRlVGV4dCgpO1xuXG4gICAgc3VwZXIuaW52YWxpZGF0ZUZpbGwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyB0aGUgY3VycmVudCBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbiwgYXNzdW1pbmcgdGhlIHdyYXBwZXIncyBDYW52YXMgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBsb2NhbFxuICAgKiBjb29yZGluYXRlIGZyYW1lIG9mIHRoaXMgbm9kZS5cbiAgICpcbiAgICogQHBhcmFtIHdyYXBwZXJcbiAgICogQHBhcmFtIG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYWxyZWFkeSBhcHBsaWVkIHRvIHRoZSBjb250ZXh0LlxuICAgKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNhbnZhc1BhaW50U2VsZiggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcbiAgICAvL1RPRE86IEhhdmUgYSBzZXBhcmF0ZSBtZXRob2QgZm9yIHRoaXMsIGluc3RlYWQgb2YgdG91Y2hpbmcgdGhlIHByb3RvdHlwZS4gQ2FuIG1ha2UgJ3RoaXMnIHJlZmVyZW5jZXMgdG9vIGVhc2lseS4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBUZXh0Q2FudmFzRHJhd2FibGUucHJvdG90eXBlLnBhaW50Q2FudmFzKCB3cmFwcGVyLCB0aGlzLCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgRE9NIGRyYXdhYmxlIGZvciB0aGlzIFRleHQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlRE9NRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBET01TZWxmRHJhd2FibGUge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICByZXR1cm4gVGV4dERPTURyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgU1ZHIGRyYXdhYmxlIGZvciB0aGlzIFRleHQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlU1ZHRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBTVkdTZWxmRHJhd2FibGUge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICByZXR1cm4gVGV4dFNWR0RyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgQ2FudmFzIGRyYXdhYmxlIGZvciB0aGlzIFRleHQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlQ2FudmFzRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBDYW52YXNTZWxmRHJhd2FibGUge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICByZXR1cm4gVGV4dENhbnZhc0RyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgRE9NIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgc3BlY2lmaWVkIHN0cmluZy4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIFRoaXMgaXMgbmVlZGVkIHNpbmNlIHdlIGhhdmUgdG8gaGFuZGxlIEhUTUwgdGV4dCBkaWZmZXJlbnRseS5cbiAgICovXG4gIHB1YmxpYyBnZXRET01UZXh0Tm9kZSgpOiBFbGVtZW50IHtcbiAgICBpZiAoIHRoaXMuX2lzSFRNTCApIHtcbiAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcbiAgICAgIHNwYW4uaW5uZXJIVE1MID0gdGhpcy5zdHJpbmc7XG4gICAgICByZXR1cm4gc3BhbjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoIHRoaXMucmVuZGVyZWRUZXh0ICkgYXMgdW5rbm93biBhcyBFbGVtZW50O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm91bmRpbmcgYm94IHRoYXQgc2hvdWxkIGNvbnRhaW4gYWxsIHNlbGYgY29udGVudCBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSAob3VyIG5vcm1hbCBzZWxmIGJvdW5kc1xuICAgKiBhcmVuJ3QgZ3VhcmFudGVlZCB0aGlzIGZvciBUZXh0KVxuICAgKlxuICAgKiBXZSBuZWVkIHRvIGFkZCBhZGRpdGlvbmFsIHBhZGRpbmcgYXJvdW5kIHRoZSB0ZXh0IHdoZW4gdGhlIHRleHQgaXMgaW4gYSBjb250YWluZXIgdGhhdCBjb3VsZCBjbGlwIHRoaW5ncyBiYWRseVxuICAgKiBpZiB0aGUgdGV4dCBpcyBsYXJnZXIgdGhhbiB0aGUgbm9ybWFsIGJvdW5kcyBjb21wdXRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRTYWZlU2VsZkJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICBjb25zdCBleHBhbnNpb25GYWN0b3IgPSAxOyAvLyB3ZSB1c2UgYSBuZXcgYm91bmRpbmcgYm94IHdpdGggYSBuZXcgc2l6ZSBvZiBzaXplICogKCAxICsgMiAqIGV4cGFuc2lvbkZhY3RvciApXG5cbiAgICBjb25zdCBzZWxmQm91bmRzID0gdGhpcy5nZXRTZWxmQm91bmRzKCk7XG5cbiAgICAvLyBOT1RFOiB3ZSdsbCBrZWVwIHRoaXMgYXMgYW4gZXN0aW1hdGUgZm9yIHRoZSBib3VuZHMgaW5jbHVkaW5nIHN0cm9rZSBtaXRlcnNcbiAgICByZXR1cm4gc2VsZkJvdW5kcy5kaWxhdGVkWFkoIGV4cGFuc2lvbkZhY3RvciAqIHNlbGZCb3VuZHMud2lkdGgsIGV4cGFuc2lvbkZhY3RvciAqIHNlbGZCb3VuZHMuaGVpZ2h0ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZm9udCBvZiB0aGUgVGV4dCBub2RlLlxuICAgKlxuICAgKiBUaGlzIGNhbiBlaXRoZXIgYmUgYSBTY2VuZXJ5IEZvbnQgb2JqZWN0LCBvciBhIHN0cmluZy4gVGhlIHN0cmluZyBmb3JtYXQgaXMgZGVzY3JpYmVkIGJ5IEZvbnQncyBjb25zdHJ1Y3RvciwgYW5kXG4gICAqIGlzIGJhc2ljYWxseSB0aGUgQ1NTMyBmb250IHNob3J0Y3V0IGZvcm1hdC4gSWYgYSBzdHJpbmcgaXMgcHJvdmlkZWQsIGl0IHdpbGwgYmUgd3JhcHBlZCB3aXRoIGEgbmV3IChpbW11dGFibGUpXG4gICAqIFNjZW5lcnkgRm9udCBvYmplY3QuXG4gICAqL1xuICBwdWJsaWMgc2V0Rm9udCggZm9udDogRm9udCB8IHN0cmluZyApOiB0aGlzIHtcblxuICAgIC8vIFdlIG5lZWQgdG8gZGV0ZWN0IHdoZXRoZXIgdGhpbmdzIGhhdmUgdXBkYXRlZCBpbiBhIGRpZmZlcmVudCB3YXkgZGVwZW5kaW5nIG9uIHdoZXRoZXIgd2UgYXJlIHBhc3NlZCBhIHN0cmluZ1xuICAgIC8vIG9yIGEgRm9udCBvYmplY3QuXG4gICAgY29uc3QgY2hhbmdlZCA9IGZvbnQgIT09ICggKCB0eXBlb2YgZm9udCA9PT0gJ3N0cmluZycgKSA/IHRoaXMuX2ZvbnQudG9DU1MoKSA6IHRoaXMuX2ZvbnQgKTtcbiAgICBpZiAoIGNoYW5nZWQgKSB7XG4gICAgICAvLyBXcmFwIHNvIHRoYXQgb3VyIF9mb250IGlzIG9mIHR5cGUge0ZvbnR9XG4gICAgICB0aGlzLl9mb250ID0gKCB0eXBlb2YgZm9udCA9PT0gJ3N0cmluZycgKSA/IEZvbnQuZnJvbUNTUyggZm9udCApIDogZm9udDtcblxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRUZXh0RHJhd2FibGUgKS5tYXJrRGlydHlGb250KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZVRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IGZvbnQoIHZhbHVlOiBGb250IHwgc3RyaW5nICkgeyB0aGlzLnNldEZvbnQoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGZvbnQoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0Rm9udCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGN1cnJlbnQgRm9udC5cbiAgICpcbiAgICogVGhpcyByZXR1cm5zIHRoZSBDU1MzIGZvbnQgc2hvcnRjdXQgdGhhdCBpcyBhIHBvc3NpYmxlIGlucHV0IHRvIHNldEZvbnQoKS4gU2VlIEZvbnQncyBjb25zdHJ1Y3RvciBmb3IgZGV0YWlsZWRcbiAgICogaW5mb3JtYXRpb24gb24gdGhlIG9yZGVyaW5nIG9mIGluZm9ybWF0aW9uLlxuICAgKlxuICAgKiBOT1RFOiBJZiBhIEZvbnQgb2JqZWN0IHdhcyBwcm92aWRlZCB0byBzZXRGb250KCksIHRoaXMgd2lsbCBub3QgY3VycmVudGx5IHJldHVybiBpdC5cbiAgICogVE9ETzogQ2FuIHdlIHJlZmFjdG9yIHNvIHdlIGNhbiBoYXZlIGFjY2VzcyB0byAoYSkgdGhlIEZvbnQgb2JqZWN0LCBhbmQgcG9zc2libHkgKGIpIHRoZSBpbml0aWFsbHkgcHJvdmlkZWQgdmFsdWUuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgZ2V0Rm9udCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9mb250LmdldEZvbnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB3ZWlnaHQgb2YgdGhpcyBub2RlJ3MgZm9udC5cbiAgICpcbiAgICogVGhlIGZvbnQgd2VpZ2h0IHN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgb3B0aW9uczpcbiAgICogICAnbm9ybWFsJywgJ2JvbGQnLCAnYm9sZGVyJywgJ2xpZ2h0ZXInLCAnMTAwJywgJzIwMCcsICczMDAnLCAnNDAwJywgJzUwMCcsICc2MDAnLCAnNzAwJywgJzgwMCcsICc5MDAnLFxuICAgKiAgIG9yIGEgbnVtYmVyIHRoYXQgd2hlbiBjYXN0IHRvIGEgc3RyaW5nIHdpbGwgYmUgb25lIG9mIHRoZSBzdHJpbmdzIGFib3ZlLlxuICAgKi9cbiAgcHVibGljIHNldEZvbnRXZWlnaHQoIHdlaWdodDogRm9udFdlaWdodCB8IG51bWJlciApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRGb250KCB0aGlzLl9mb250LmNvcHkoIHtcbiAgICAgIHdlaWdodDogd2VpZ2h0XG4gICAgfSApICk7XG4gIH1cblxuICBwdWJsaWMgc2V0IGZvbnRXZWlnaHQoIHZhbHVlOiBGb250V2VpZ2h0IHwgbnVtYmVyICkgeyB0aGlzLnNldEZvbnRXZWlnaHQoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGZvbnRXZWlnaHQoKTogRm9udFdlaWdodCB7IHJldHVybiB0aGlzLmdldEZvbnRXZWlnaHQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB3ZWlnaHQgb2YgdGhpcyBub2RlJ3MgZm9udCwgc2VlIHNldEZvbnRXZWlnaHQoKSBmb3IgZGV0YWlscy5cbiAgICpcbiAgICogTk9URTogSWYgYSBudW1lcmljIHdlaWdodCB3YXMgcGFzc2VkIGluLCBpdCBoYXMgYmVlbiBjYXN0IHRvIGEgc3RyaW5nLCBhbmQgYSBzdHJpbmcgd2lsbCBiZSByZXR1cm5lZCBoZXJlLlxuICAgKi9cbiAgcHVibGljIGdldEZvbnRXZWlnaHQoKTogRm9udFdlaWdodCB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvbnQuZ2V0V2VpZ2h0KCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZmFtaWx5IG9mIHRoaXMgbm9kZSdzIGZvbnQuXG4gICAqXG4gICAqIEBwYXJhbSBmYW1pbHkgLSBBIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGZhbWlsaWVzLCB3aGljaCBjYW4gaW5jbHVkZSBnZW5lcmljIGZhbWlsaWVzIChwcmVmZXJhYmx5IGF0XG4gICAqICAgICAgICAgICAgICAgICB0aGUgZW5kKSBzdWNoIGFzICdzZXJpZicsICdzYW5zLXNlcmlmJywgJ2N1cnNpdmUnLCAnZmFudGFzeScgYW5kICdtb25vc3BhY2UnLiBJZiB0aGVyZVxuICAgKiAgICAgICAgICAgICAgICAgaXMgYW55IHF1ZXN0aW9uIGFib3V0IGVzY2FwaW5nIChzdWNoIGFzIHNwYWNlcyBpbiBhIGZvbnQgbmFtZSksIHRoZSBmYW1pbHkgc2hvdWxkIGJlXG4gICAqICAgICAgICAgICAgICAgICBzdXJyb3VuZGVkIGJ5IGRvdWJsZSBxdW90ZXMuXG4gICAqL1xuICBwdWJsaWMgc2V0Rm9udEZhbWlseSggZmFtaWx5OiBzdHJpbmcgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0Rm9udCggdGhpcy5fZm9udC5jb3B5KCB7XG4gICAgICBmYW1pbHk6IGZhbWlseVxuICAgIH0gKSApO1xuICB9XG5cbiAgcHVibGljIHNldCBmb250RmFtaWx5KCB2YWx1ZTogc3RyaW5nICkgeyB0aGlzLnNldEZvbnRGYW1pbHkoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGZvbnRGYW1pbHkoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0Rm9udEZhbWlseSgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZhbWlseSBvZiB0aGlzIG5vZGUncyBmb250LCBzZWUgc2V0Rm9udEZhbWlseSgpIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgcHVibGljIGdldEZvbnRGYW1pbHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZm9udC5nZXRGYW1pbHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdHJldGNoIG9mIHRoaXMgbm9kZSdzIGZvbnQuXG4gICAqXG4gICAqIFRoZSBmb250IHN0cmV0Y2ggc3VwcG9ydHMgdGhlIGZvbGxvd2luZyBvcHRpb25zOlxuICAgKiAgICdub3JtYWwnLCAndWx0cmEtY29uZGVuc2VkJywgJ2V4dHJhLWNvbmRlbnNlZCcsICdjb25kZW5zZWQnLCAnc2VtaS1jb25kZW5zZWQnLFxuICAgKiAgICdzZW1pLWV4cGFuZGVkJywgJ2V4cGFuZGVkJywgJ2V4dHJhLWV4cGFuZGVkJyBvciAndWx0cmEtZXhwYW5kZWQnXG4gICAqL1xuICBwdWJsaWMgc2V0Rm9udFN0cmV0Y2goIHN0cmV0Y2g6IEZvbnRTdHJldGNoICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLnNldEZvbnQoIHRoaXMuX2ZvbnQuY29weSgge1xuICAgICAgc3RyZXRjaDogc3RyZXRjaFxuICAgIH0gKSApO1xuICB9XG5cbiAgcHVibGljIHNldCBmb250U3RyZXRjaCggdmFsdWU6IEZvbnRTdHJldGNoICkgeyB0aGlzLnNldEZvbnRTdHJldGNoKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBmb250U3RyZXRjaCgpOiBGb250U3RyZXRjaCB7IHJldHVybiB0aGlzLmdldEZvbnRTdHJldGNoKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3RyZXRjaCBvZiB0aGlzIG5vZGUncyBmb250LCBzZWUgc2V0Rm9udFN0cmV0Y2goKSBmb3IgZGV0YWlscy5cbiAgICovXG4gIHB1YmxpYyBnZXRGb250U3RyZXRjaCgpOiBGb250U3RyZXRjaCB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvbnQuZ2V0U3RyZXRjaCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHN0eWxlIG9mIHRoaXMgbm9kZSdzIGZvbnQuXG4gICAqXG4gICAqIFRoZSBmb250IHN0eWxlIHN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgb3B0aW9uczogJ25vcm1hbCcsICdpdGFsaWMnIG9yICdvYmxpcXVlJ1xuICAgKi9cbiAgcHVibGljIHNldEZvbnRTdHlsZSggc3R5bGU6IEZvbnRTdHlsZSApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRGb250KCB0aGlzLl9mb250LmNvcHkoIHtcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH0gKSApO1xuICB9XG5cbiAgcHVibGljIHNldCBmb250U3R5bGUoIHZhbHVlOiBGb250U3R5bGUgKSB7IHRoaXMuc2V0Rm9udFN0eWxlKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBmb250U3R5bGUoKTogRm9udFN0eWxlIHsgcmV0dXJuIHRoaXMuZ2V0Rm9udFN0eWxlKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3R5bGUgb2YgdGhpcyBub2RlJ3MgZm9udCwgc2VlIHNldEZvbnRTdHlsZSgpIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgcHVibGljIGdldEZvbnRTdHlsZSgpOiBGb250U3R5bGUge1xuICAgIHJldHVybiB0aGlzLl9mb250LmdldFN0eWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc2l6ZSBvZiB0aGlzIG5vZGUncyBmb250LlxuICAgKlxuICAgKiBUaGUgc2l6ZSBjYW4gZWl0aGVyIGJlIGEgbnVtYmVyIChjcmVhdGVkIGFzIGEgcXVhbnRpdHkgb2YgJ3B4JyksIG9yIGFueSBnZW5lcmFsIENTUyBmb250LXNpemUgc3RyaW5nIChmb3JcbiAgICogZXhhbXBsZSwgJzMwcHQnLCAnNWVtJywgZXRjLilcbiAgICovXG4gIHB1YmxpYyBzZXRGb250U2l6ZSggc2l6ZTogc3RyaW5nIHwgbnVtYmVyICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLnNldEZvbnQoIHRoaXMuX2ZvbnQuY29weSgge1xuICAgICAgc2l6ZTogc2l6ZVxuICAgIH0gKSApO1xuICB9XG5cbiAgcHVibGljIHNldCBmb250U2l6ZSggdmFsdWU6IHN0cmluZyB8IG51bWJlciApIHsgdGhpcy5zZXRGb250U2l6ZSggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgZm9udFNpemUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0Rm9udFNpemUoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzaXplIG9mIHRoaXMgbm9kZSdzIGZvbnQsIHNlZSBzZXRGb250U2l6ZSgpIGZvciBkZXRhaWxzLlxuICAgKlxuICAgKiBOT1RFOiBJZiBhIG51bWVyaWMgc2l6ZSB3YXMgcGFzc2VkIGluLCBpdCBoYXMgYmVlbiBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgd2l0aCAncHgnLCBhbmQgYSBzdHJpbmcgd2lsbCBiZVxuICAgKiByZXR1cm5lZCBoZXJlLlxuICAgKi9cbiAgcHVibGljIGdldEZvbnRTaXplKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvbnQuZ2V0U2l6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBOb2RlIGl0c2VsZiBpcyBwYWludGVkIChkaXNwbGF5cyBzb21ldGhpbmcgaXRzZWxmKS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBpc1BhaW50ZWQoKTogYm9vbGVhbiB7XG4gICAgLy8gQWx3YXlzIHRydWUgZm9yIFRleHQgbm9kZXNcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgTm9kZSdzIHNlbGZCb3VuZHMgYXJlIGNvbnNpZGVyZWQgdG8gYmUgdmFsaWQgKGFsd2F5cyBjb250YWluaW5nIHRoZSBkaXNwbGF5ZWQgc2VsZiBjb250ZW50XG4gICAqIG9mIHRoaXMgbm9kZSkuIE1lYW50IHRvIGJlIG92ZXJyaWRkZW4gaW4gc3VidHlwZXMgd2hlbiB0aGlzIGNhbiBjaGFuZ2UgKGUuZy4gVGV4dCkuXG4gICAqXG4gICAqIElmIHRoaXMgdmFsdWUgd291bGQgcG90ZW50aWFsbHkgY2hhbmdlLCBwbGVhc2UgdHJpZ2dlciB0aGUgZXZlbnQgJ3NlbGZCb3VuZHNWYWxpZCcuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgYXJlU2VsZkJvdW5kc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdhY2N1cmF0ZSc7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGUgZm9yIGV4dHJhIGluZm9ybWF0aW9uIGluIHRoZSBkZWJ1Z2dpbmcgb3V0cHV0IChmcm9tIERpc3BsYXkuZ2V0RGVidWdIVE1MKCkpLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXREZWJ1Z0hUTUxFeHRyYXMoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCBcIiR7ZXNjYXBlSFRNTCggdGhpcy5yZW5kZXJlZFRleHQgKX1cIiR7dGhpcy5faXNIVE1MID8gJyAoaHRtbCknIDogJyd9YDtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcblxuICAgIHRoaXMuX3N0cmluZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyBlbWJlZGRpbmcgbWFyayBjaGFyYWN0ZXJzIHdpdGggdmlzaWJsZSBzdHJpbmdzLiBVc2VmdWwgZm9yIGRlYnVnZ2luZyBmb3Igc3RyaW5ncyB3aXRoIGVtYmVkZGluZyBtYXJrcy5cbiAgICpcbiAgICogQHJldHVybnMgLSBXaXRoIGVtYmVkZGluZyBtYXJrcyByZXBsYWNlZC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZW1iZWRkZWREZWJ1Z1N0cmluZyggc3RyaW5nOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoIC9cXHUyMDJhL2csICdbTFRSXScgKS5yZXBsYWNlKCAvXFx1MjAyYi9nLCAnW1JUTF0nICkucmVwbGFjZSggL1xcdTIwMmMvZywgJ1tQT1BdJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSAocG90ZW50aWFsbHkpIG1vZGlmaWVkIHN0cmluZyB3aGVyZSBlbWJlZGRpbmcgbWFya3MgaGF2ZSBiZWVuIHNpbXBsaWZpZWQuXG4gICAqXG4gICAqIFRoaXMgc2ltcGxpZmljYXRpb24gd291bGRuJ3QgdXN1YWxseSBiZSBuZWNlc3NhcnksIGJ1dCB3ZSBuZWVkIHRvIHByZXZlbnQgY2FzZXMgbGlrZVxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNTIwIHdoZXJlIEVkZ2UgZGVjaWRlcyB0byB0dXJuIFtQT1BdW0xUUl0gKGFmdGVyIGFub3RoZXIgW0xUUl0pIGludG9cbiAgICogYSAnYm94JyBjaGFyYWN0ZXIsIHdoZW4gbm90aGluZyBzaG91bGQgYmUgcmVuZGVyZWQuXG4gICAqXG4gICAqIFRoaXMgd2lsbCByZW1vdmUgcmVkdW5kYW50IG5lc3Rpbmc6XG4gICAqICAgZS5nLiBbTFRSXVtMVFJdYm9vW1BPUF1bUE9QXSA9PiBbTFRSXWJvb1tQT1BdKVxuICAgKiBhbmQgd2lsbCBhbHNvIGNvbWJpbmUgYWRqYWNlbnQgZGlyZWN0aW9uczpcbiAgICogICBlLmcuIFtMVFJdTWFpbFtQT1BdW0xUUl1NYW5bUE9QXSA9PiBbTFRSXU1haWxNYW5bUG9wXVxuICAgKlxuICAgKiBOb3RlIHRoYXQgaXQgd2lsbCBOT1QgY29tYmluZSBpbiB0aGlzIHdheSBpZiB0aGVyZSB3YXMgYSBzcGFjZSBiZXR3ZWVuIHRoZSB0d28gTFRSczpcbiAgICogICBlLmcuIFtMVFJdTWFpbFtQT1BdIFtMVFJdTWFuW1BvcF0pXG4gICAqIGFzIGluIHRoZSBnZW5lcmFsIGNhc2UsIHdlJ2xsIHdhbnQgdG8gcHJlc2VydmUgdGhlIGJyZWFrIHRoZXJlIGJldHdlZW4gZW1iZWRkaW5ncy5cbiAgICpcbiAgICogVE9ETzogQSBzdGFjay1iYXNlZCBpbXBsZW1lbnRhdGlvbiB0aGF0IGRvZXNuJ3QgY3JlYXRlIGEgYnVuY2ggb2Ygb2JqZWN0cy9jbG9zdXJlcyB3b3VsZCBiZSBuaWNlIGZvciBwZXJmb3JtYW5jZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2ltcGxpZnlFbWJlZGRpbmdNYXJrcyggc3RyaW5nOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgICAvLyBGaXJzdCwgd2UnbGwgY29udmVydCB0aGUgc3RyaW5nIGludG8gYSB0cmVlIGZvcm0sIHdoZXJlIGVhY2ggbm9kZSBpcyBlaXRoZXIgYSBzdHJpbmcgb2JqZWN0IE9SIGFuIG9iamVjdCBvZiB0aGVcbiAgICAvLyBub2RlIHR5cGUgeyBkaXI6IHtMVFJ8fFJUTH0sIGNoaWxkcmVuOiB7QXJyYXkuPG5vZGU+fSwgcGFyZW50OiB7bnVsbHxub2RlfSB9LiBUaHVzIGVhY2ggTFRSLi4uUE9QIGFuZCBSVEwuLi5QT1BcbiAgICAvLyBiZWNvbWUgYSBub2RlIHdpdGggdGhlaXIgaW50ZXJpb3JzIGJlY29taW5nIGNoaWxkcmVuLlxuXG4gICAgdHlwZSBFbWJlZE5vZGUgPSB7XG4gICAgICBkaXI6IG51bGwgfCAnXFx1MjAyYScgfCAnXFx1MjAyYic7XG4gICAgICBjaGlsZHJlbjogKCBFbWJlZE5vZGUgfCBzdHJpbmcgKVtdO1xuICAgICAgcGFyZW50OiBFbWJlZE5vZGUgfCBudWxsO1xuICAgIH07XG5cbiAgICAvLyBSb290IG5vZGUgKG5vIGRpcmVjdGlvbiwgc28gd2UgcHJlc2VydmUgcm9vdCBMVFIvUlRMcylcbiAgICBjb25zdCByb290ID0ge1xuICAgICAgZGlyOiBudWxsLFxuICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgcGFyZW50OiBudWxsXG4gICAgfSBhcyBFbWJlZE5vZGU7XG4gICAgbGV0IGN1cnJlbnQ6IEVtYmVkTm9kZSA9IHJvb3Q7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY2hyID0gc3RyaW5nLmNoYXJBdCggaSApO1xuXG4gICAgICAvLyBQdXNoIGEgZGlyZWN0aW9uXG4gICAgICBpZiAoIGNociA9PT0gTFRSIHx8IGNociA9PT0gUlRMICkge1xuICAgICAgICBjb25zdCBub2RlID0ge1xuICAgICAgICAgIGRpcjogY2hyLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICBwYXJlbnQ6IGN1cnJlbnRcbiAgICAgICAgfSBhcyBFbWJlZE5vZGU7XG4gICAgICAgIGN1cnJlbnQuY2hpbGRyZW4ucHVzaCggbm9kZSApO1xuICAgICAgICBjdXJyZW50ID0gbm9kZTtcbiAgICAgIH1cbiAgICAgIC8vIFBvcCBhIGRpcmVjdGlvblxuICAgICAgZWxzZSBpZiAoIGNociA9PT0gUE9QICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjdXJyZW50LnBhcmVudCwgYEJhZCBuZXN0aW5nIG9mIGVtYmVkZGluZyBtYXJrczogJHtUZXh0LmVtYmVkZGVkRGVidWdTdHJpbmcoIHN0cmluZyApfWAgKTtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50ITtcbiAgICAgIH1cbiAgICAgIC8vIEFwcGVuZCBjaGFyYWN0ZXJzIHRvIHRoZSBjdXJyZW50IGRpcmVjdGlvblxuICAgICAgZWxzZSB7XG4gICAgICAgIGN1cnJlbnQuY2hpbGRyZW4ucHVzaCggY2hyICk7XG4gICAgICB9XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGN1cnJlbnQgPT09IHJvb3QsIGBCYWQgbmVzdGluZyBvZiBlbWJlZGRpbmcgbWFya3M6ICR7VGV4dC5lbWJlZGRlZERlYnVnU3RyaW5nKCBzdHJpbmcgKX1gICk7XG5cbiAgICAvLyBSZW1vdmUgcmVkdW5kYW50IG5lc3RpbmcgKGUuZy4gW0xUUl1bTFRSXS4uLltQT1BdW1BPUF0pXG4gICAgZnVuY3Rpb24gY29sbGFwc2VOZXN0aW5nKCBub2RlOiBFbWJlZE5vZGUgKTogdm9pZCB7XG4gICAgICBmb3IgKCBsZXQgaSA9IG5vZGUuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlblsgaSBdO1xuICAgICAgICBpZiAoIHR5cGVvZiBjaGlsZCAhPT0gJ3N0cmluZycgJiYgbm9kZS5kaXIgPT09IGNoaWxkLmRpciApIHtcbiAgICAgICAgICBub2RlLmNoaWxkcmVuLnNwbGljZSggaSwgMSwgLi4uY2hpbGQuY2hpbGRyZW4gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBvdmVycmlkZGVuIG5lc3RpbmcgKGUuZy4gW0xUUl1bUlRMXS4uLltQT1BdW1BPUF0pLCBzaW5jZSB0aGUgb3V0ZXIgb25lIGlzIG5vdCBuZWVkZWRcbiAgICBmdW5jdGlvbiBjb2xsYXBzZVVubmVjZXNzYXJ5KCBub2RlOiBFbWJlZE5vZGUgKTogdm9pZCB7XG4gICAgICBpZiAoIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIHR5cGVvZiBub2RlLmNoaWxkcmVuWyAwIF0gIT09ICdzdHJpbmcnICYmIG5vZGUuY2hpbGRyZW5bIDAgXS5kaXIgKSB7XG4gICAgICAgIG5vZGUuZGlyID0gbm9kZS5jaGlsZHJlblsgMCBdLmRpcjtcbiAgICAgICAgbm9kZS5jaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb2xsYXBzZSBhZGphY2VudCBtYXRjaGluZyBkaXJzLCBlLmcuIFtMVFJdLi4uW1BPUF1bTFRSXS4uLltQT1BdXG4gICAgZnVuY3Rpb24gY29sbGFwc2VBZGphY2VudCggbm9kZTogRW1iZWROb2RlICk6IHZvaWQge1xuICAgICAgZm9yICggbGV0IGkgPSBub2RlLmNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMTsgaS0tICkge1xuICAgICAgICBjb25zdCBwcmV2aW91c0NoaWxkID0gbm9kZS5jaGlsZHJlblsgaSAtIDEgXTtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuWyBpIF07XG4gICAgICAgIGlmICggdHlwZW9mIGNoaWxkICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgcHJldmlvdXNDaGlsZCAhPT0gJ3N0cmluZycgJiYgY2hpbGQuZGlyICYmIHByZXZpb3VzQ2hpbGQuZGlyID09PSBjaGlsZC5kaXIgKSB7XG4gICAgICAgICAgcHJldmlvdXNDaGlsZC5jaGlsZHJlbiA9IHByZXZpb3VzQ2hpbGQuY2hpbGRyZW4uY29uY2F0KCBjaGlsZC5jaGlsZHJlbiApO1xuICAgICAgICAgIG5vZGUuY2hpbGRyZW4uc3BsaWNlKCBpLCAxICk7XG5cbiAgICAgICAgICAvLyBOb3cgdHJ5IHRvIGNvbGxhcHNlIGFkamFjZW50IGl0ZW1zIGluIHRoZSBjaGlsZCwgc2luY2Ugd2UgY29tYmluZWQgY2hpbGRyZW4gYXJyYXlzXG4gICAgICAgICAgY29sbGFwc2VBZGphY2VudCggcHJldmlvdXNDaGlsZCApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2ltcGxpZmllcyB0aGUgdHJlZSB1c2luZyB0aGUgYWJvdmUgZnVuY3Rpb25zXG4gICAgZnVuY3Rpb24gc2ltcGxpZnkoIG5vZGU6IEVtYmVkTm9kZSB8IHN0cmluZyApOiBzdHJpbmcgfCBFbWJlZE5vZGUge1xuICAgICAgaWYgKCB0eXBlb2Ygbm9kZSAhPT0gJ3N0cmluZycgKSB7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgc2ltcGxpZnkoIG5vZGUuY2hpbGRyZW5bIGkgXSApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29sbGFwc2VVbm5lY2Vzc2FyeSggbm9kZSApO1xuICAgICAgICBjb2xsYXBzZU5lc3RpbmcoIG5vZGUgKTtcbiAgICAgICAgY29sbGFwc2VBZGphY2VudCggbm9kZSApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICAvLyBUdXJucyBhIHRyZWUgaW50byBhIHN0cmluZ1xuICAgIGZ1bmN0aW9uIHN0cmluZ2lmeSggbm9kZTogRW1iZWROb2RlIHwgc3RyaW5nICk6IHN0cmluZyB7XG4gICAgICBpZiAoIHR5cGVvZiBub2RlID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG4gICAgICBjb25zdCBjaGlsZFN0cmluZyA9IG5vZGUuY2hpbGRyZW4ubWFwKCBzdHJpbmdpZnkgKS5qb2luKCAnJyApO1xuICAgICAgaWYgKCBub2RlLmRpciApIHtcbiAgICAgICAgcmV0dXJuIGAke25vZGUuZGlyICsgY2hpbGRTdHJpbmd9XFx1MjAyY2A7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkU3RyaW5nO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmdpZnkoIHNpbXBsaWZ5KCByb290ICkgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgVGV4dElPOiBJT1R5cGU7XG59XG5cbi8qKlxuICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgb2YgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IG5vZGUubXV0YXRlKCBvcHRpb25zICksIGluIHRoZVxuICogb3JkZXIgdGhleSB3aWxsIGJlIGV2YWx1YXRlZCBpbi5cbiAqXG4gKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcbiAqICAgICAgIGNhc2VzIHRoYXQgbWF5IGFwcGx5LlxuICovXG5UZXh0LnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBbIC4uLlBBSU5UQUJMRV9PUFRJT05fS0VZUywgLi4uVEVYVF9PUFRJT05fS0VZUywgLi4uTm9kZS5wcm90b3R5cGUuX211dGF0b3JLZXlzIF07XG5cbi8qKlxuICoge0FycmF5LjxTdHJpbmc+fSAtIExpc3Qgb2YgYWxsIGRpcnR5IGZsYWdzIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSBvbiBkcmF3YWJsZXMgY3JlYXRlZCBmcm9tIHRoaXMgbm9kZSAob3JcbiAqICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlKS4gR2l2ZW4gYSBmbGFnIChlLmcuIHJhZGl1cyksIGl0IGluZGljYXRlcyB0aGUgZXhpc3RlbmNlIG9mIGEgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICBkcmF3YWJsZS5tYXJrRGlydHlSYWRpdXMoKSB0aGF0IHdpbGwgaW5kaWNhdGUgdG8gdGhlIGRyYXdhYmxlIHRoYXQgdGhlIHJhZGl1cyBoYXMgY2hhbmdlZC5cbiAqIChzY2VuZXJ5LWludGVybmFsKVxuICogQG92ZXJyaWRlXG4gKi9cblRleHQucHJvdG90eXBlLmRyYXdhYmxlTWFya0ZsYWdzID0gWyAuLi5Ob2RlLnByb3RvdHlwZS5kcmF3YWJsZU1hcmtGbGFncywgLi4uUEFJTlRBQkxFX0RSQVdBQkxFX01BUktfRkxBR1MsICd0ZXh0JywgJ2ZvbnQnLCAnYm91bmRzJyBdO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnVGV4dCcsIFRleHQgKTtcblxuLy8gVW5pY29kZSBlbWJlZGRpbmcgbWFya3MgdGhhdCB3ZSBjYW4gY29tYmluZSB0byB3b3JrIGFyb3VuZCB0aGUgRWRnZSBpc3N1ZS5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNTIwXG5jb25zdCBMVFIgPSAnXFx1MjAyYSc7XG5jb25zdCBSVEwgPSAnXFx1MjAyYic7XG5jb25zdCBQT1AgPSAnXFx1MjAyYyc7XG5cbi8vIEluaXRpYWxpemUgY29tcHV0YXRpb24gb2YgaHlicmlkIHRleHRcblRleHRCb3VuZHMuaW5pdGlhbGl6ZVRleHRCb3VuZHMoKTtcblxuVGV4dC5UZXh0SU8gPSBuZXcgSU9UeXBlKCAnVGV4dElPJywge1xuICB2YWx1ZVR5cGU6IFRleHQsXG4gIHN1cGVydHlwZTogTm9kZS5Ob2RlSU8sXG4gIGRvY3VtZW50YXRpb246ICdUZXh0IHRoYXQgaXMgZGlzcGxheWVkIGluIHRoZSBzaW11bGF0aW9uLiBUZXh0SU8gaGFzIGEgbmVzdGVkIFByb3BlcnR5SU8uJmx0O1N0cmluZyZndDsgZm9yICcgK1xuICAgICAgICAgICAgICAgICAndGhlIGN1cnJlbnQgc3RyaW5nIHZhbHVlLidcbn0gKTsiXSwibmFtZXMiOlsiU3RyaW5nUHJvcGVydHkiLCJUaW55Rm9yd2FyZGluZ1Byb3BlcnR5IiwiZXNjYXBlSFRNTCIsImV4dGVuZERlZmluZWQiLCJjb21iaW5lT3B0aW9ucyIsInBsYXRmb3JtIiwicGhldGlvRWxlbWVudFNlbGVjdGlvblByb3BlcnR5IiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiSU9UeXBlIiwiRm9udCIsIk5vZGUiLCJQYWludGFibGUiLCJQQUlOVEFCTEVfRFJBV0FCTEVfTUFSS19GTEFHUyIsIlBBSU5UQUJMRV9PUFRJT05fS0VZUyIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIlRleHRCb3VuZHMiLCJUZXh0Q2FudmFzRHJhd2FibGUiLCJUZXh0RE9NRHJhd2FibGUiLCJUZXh0U1ZHRHJhd2FibGUiLCJTVFJJTkdfUFJPUEVSVFlfTkFNRSIsIlRFWFRfT1BUSU9OX0tFWVMiLCJ1c2VET01Bc0Zhc3RCb3VuZHMiLCJ3aW5kb3ciLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJpbmNsdWRlcyIsIlRleHQiLCJtdXRhdGUiLCJvcHRpb25zIiwiYXNzZXJ0IiwiaGFzT3duUHJvcGVydHkiLCJzdHJpbmdQcm9wZXJ0eSIsInZhbHVlIiwic3RyaW5nIiwic2V0U3RyaW5nIiwidW5kZWZpbmVkIiwiX3N0cmluZ1Byb3BlcnR5Iiwic2V0IiwiZ2V0U3RyaW5nIiwiZ2V0UmVuZGVyZWRUZXh0IiwiX2NhY2hlZFJlbmRlcmVkVGV4dCIsInJlcGxhY2UiLCJlZGdlIiwic2ltcGxpZnlFbWJlZGRpbmdNYXJrcyIsInJlbmRlcmVkVGV4dCIsIm9uU3RyaW5nUHJvcGVydHlDaGFuZ2UiLCJzdGF0ZUxlbiIsIl9kcmF3YWJsZXMiLCJsZW5ndGgiLCJpIiwibWFya0RpcnR5VGV4dCIsImludmFsaWRhdGVUZXh0Iiwic2V0U3RyaW5nUHJvcGVydHkiLCJuZXdUYXJnZXQiLCJzZXRUYXJnZXRQcm9wZXJ0eSIsIlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSIsInByb3BlcnR5IiwiZ2V0U3RyaW5nUHJvcGVydHkiLCJpbml0aWFsaXplUGhldGlvT2JqZWN0IiwiYmFzZU9wdGlvbnMiLCJjb25maWciLCJ3YXNJbnN0cnVtZW50ZWQiLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsIlBIRVRfSU9fRU5BQkxFRCIsImluaXRpYWxpemVQaGV0aW8iLCJwaGV0aW9SZWFkT25seSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJzdHJpbmdQcm9wZXJ0eU9wdGlvbnMiLCJnZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCIsImZyb21MaW5raW5nIiwiZ2V0U3RyaW5nUHJvcGVydHlQaGV0aW9Nb3VzZUhpdFRhcmdldCIsInRhcmdldFN0cmluZ1Byb3BlcnR5IiwiZ2V0VGFyZ2V0UHJvcGVydHkiLCJzZXRCb3VuZHNNZXRob2QiLCJtZXRob2QiLCJfYm91bmRzTWV0aG9kIiwiaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycyIsIm1hcmtEaXJ0eUJvdW5kcyIsInJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyIiwiZW1pdCIsImJvdW5kc01ldGhvZCIsImdldEJvdW5kc01ldGhvZCIsImdldFRleHRSZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrIiwiX2lzSFRNTCIsImJpdG1hc2tDYW52YXMiLCJiaXRtYXNrU1ZHIiwiYml0bWFza0RPTSIsInNldFJlbmRlcmVyQml0bWFzayIsImdldEZpbGxSZW5kZXJlckJpdG1hc2siLCJnZXRTdHJva2VSZW5kZXJlckJpdG1hc2siLCJpbnZhbGlkYXRlU2VsZiIsInVwZGF0ZVNlbGZCb3VuZHMiLCJzZWxmQm91bmRzIiwiYXBwcm94aW1hdGVET01Cb3VuZHMiLCJfZm9udCIsImdldERPTVRleHROb2RlIiwiYXBwcm94aW1hdGVIeWJyaWRCb3VuZHMiLCJhY2N1cmF0ZUNhbnZhc0JvdW5kcyIsImFwcHJveGltYXRlU1ZHQm91bmRzIiwiaGFzU3Ryb2tlIiwiZGlsYXRlIiwiZ2V0TGluZVdpZHRoIiwiY2hhbmdlZCIsImVxdWFscyIsInNlbGZCb3VuZHNQcm9wZXJ0eSIsIl92YWx1ZSIsImludmFsaWRhdGVTdHJva2UiLCJpbnZhbGlkYXRlRmlsbCIsImNhbnZhc1BhaW50U2VsZiIsIndyYXBwZXIiLCJtYXRyaXgiLCJwcm90b3R5cGUiLCJwYWludENhbnZhcyIsImNyZWF0ZURPTURyYXdhYmxlIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImNyZWF0ZUZyb21Qb29sIiwiY3JlYXRlU1ZHRHJhd2FibGUiLCJjcmVhdGVDYW52YXNEcmF3YWJsZSIsInNwYW4iLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJjcmVhdGVUZXh0Tm9kZSIsImdldFNhZmVTZWxmQm91bmRzIiwiZXhwYW5zaW9uRmFjdG9yIiwiZ2V0U2VsZkJvdW5kcyIsImRpbGF0ZWRYWSIsIndpZHRoIiwiaGVpZ2h0Iiwic2V0Rm9udCIsImZvbnQiLCJ0b0NTUyIsImZyb21DU1MiLCJtYXJrRGlydHlGb250IiwiZ2V0Rm9udCIsInNldEZvbnRXZWlnaHQiLCJ3ZWlnaHQiLCJjb3B5IiwiZm9udFdlaWdodCIsImdldEZvbnRXZWlnaHQiLCJnZXRXZWlnaHQiLCJzZXRGb250RmFtaWx5IiwiZmFtaWx5IiwiZm9udEZhbWlseSIsImdldEZvbnRGYW1pbHkiLCJnZXRGYW1pbHkiLCJzZXRGb250U3RyZXRjaCIsInN0cmV0Y2giLCJmb250U3RyZXRjaCIsImdldEZvbnRTdHJldGNoIiwiZ2V0U3RyZXRjaCIsInNldEZvbnRTdHlsZSIsInN0eWxlIiwiZm9udFN0eWxlIiwiZ2V0Rm9udFN0eWxlIiwiZ2V0U3R5bGUiLCJzZXRGb250U2l6ZSIsInNpemUiLCJmb250U2l6ZSIsImdldEZvbnRTaXplIiwiZ2V0U2l6ZSIsImlzUGFpbnRlZCIsImFyZVNlbGZCb3VuZHNWYWxpZCIsImdldERlYnVnSFRNTEV4dHJhcyIsImRpc3Bvc2UiLCJlbWJlZGRlZERlYnVnU3RyaW5nIiwicm9vdCIsImRpciIsImNoaWxkcmVuIiwicGFyZW50IiwiY3VycmVudCIsImNociIsImNoYXJBdCIsIkxUUiIsIlJUTCIsIm5vZGUiLCJwdXNoIiwiUE9QIiwiY29sbGFwc2VOZXN0aW5nIiwiY2hpbGQiLCJzcGxpY2UiLCJjb2xsYXBzZVVubmVjZXNzYXJ5IiwiY29sbGFwc2VBZGphY2VudCIsInByZXZpb3VzQ2hpbGQiLCJjb25jYXQiLCJzaW1wbGlmeSIsInN0cmluZ2lmeSIsImNoaWxkU3RyaW5nIiwibWFwIiwiam9pbiIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwiYmluZCIsIkRFRkFVTFQiLCJkZWZpbmVkT3B0aW9ucyIsImZpbGwiLCJ0YW5kZW1OYW1lU3VmZml4IiwicGhldGlvVHlwZSIsIlRleHRJTyIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsIl9tdXRhdG9yS2V5cyIsImRyYXdhYmxlTWFya0ZsYWdzIiwicmVnaXN0ZXIiLCJpbml0aWFsaXplVGV4dEJvdW5kcyIsInZhbHVlVHlwZSIsInN1cGVydHlwZSIsIk5vZGVJTyIsImRvY3VtZW50YXRpb24iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FHRCxPQUFPQSxvQkFBK0MscUNBQXFDO0FBQzNGLE9BQU9DLDRCQUE0Qiw2Q0FBNkM7QUFLaEYsT0FBT0MsZ0JBQWdCLHNDQUFzQztBQUM3RCxPQUFPQyxtQkFBbUIseUNBQXlDO0FBQ25FLFNBQVNDLGNBQWMsUUFBUSxxQ0FBcUM7QUFDcEUsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsT0FBT0Msb0NBQW9DLHVEQUF1RDtBQUNsRyxPQUFPQyxrQkFBMkMscUNBQXFDO0FBQ3ZGLE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLFlBQVkscUNBQXFDO0FBQ3hELFNBQW9FQyxJQUFJLEVBQWdEQyxJQUFJLEVBQWVDLFNBQVMsRUFBRUMsNkJBQTZCLEVBQUVDLHFCQUFxQixFQUFvQkMsUUFBUSxFQUFFQyxPQUFPLEVBQW1CQyxVQUFVLEVBQUVDLGtCQUFrQixFQUFFQyxlQUFlLEVBQUVDLGVBQWUsUUFBdUIsZ0JBQWdCO0FBRXpXLE1BQU1DLHVCQUF1QixrQkFBa0Isd0NBQXdDO0FBRXZGLFlBQVk7QUFDWixNQUFNQyxtQkFBbUI7SUFDdkI7SUFDQUQ7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxXQUFXLDRGQUE0RjtDQUN4RztBQUVELDBHQUEwRztBQUMxRyxnRkFBZ0Y7QUFDaEYsdUdBQXVHO0FBQ3ZHLE1BQU1FLHFCQUFxQkMsT0FBT0MsU0FBUyxDQUFDQyxTQUFTLENBQUNDLFFBQVEsQ0FBRSw0QkFDckNILE9BQU9DLFNBQVMsQ0FBQ0MsU0FBUyxDQUFDQyxRQUFRLENBQUU7QUFrQmpELElBQUEsQUFBTUMsT0FBTixNQUFNQSxhQUFhaEIsVUFBV0Q7SUFnRTNCa0IsT0FBUUMsT0FBcUIsRUFBUztRQUVwRCxJQUFLQyxVQUFVRCxXQUFXQSxRQUFRRSxjQUFjLENBQUUsYUFBY0YsUUFBUUUsY0FBYyxDQUFFWCx1QkFBeUI7WUFDL0dVLFVBQVVBLE9BQVFELFFBQVFHLGNBQWMsQ0FBRUMsS0FBSyxLQUFLSixRQUFRSyxNQUFNLEVBQUU7UUFDdEU7UUFDQSxPQUFPLEtBQUssQ0FBQ04sT0FBUUM7SUFDdkI7SUFFQTs7OztHQUlDLEdBQ0QsQUFBT00sVUFBV0QsTUFBdUIsRUFBUztRQUNoREosVUFBVUEsT0FBUUksV0FBVyxRQUFRQSxXQUFXRSxXQUFXO1FBRTNELG9JQUFvSTtRQUNwSUYsU0FBUyxHQUFHQSxRQUFRO1FBRXBCLElBQUksQ0FBQ0csZUFBZSxDQUFDQyxHQUFHLENBQUVKO1FBRTFCLE9BQU8sSUFBSTtJQUNiO0lBRUEsSUFBV0EsT0FBUUQsS0FBc0IsRUFBRztRQUFFLElBQUksQ0FBQ0UsU0FBUyxDQUFFRjtJQUFTO0lBRXZFLElBQVdDLFNBQWlCO1FBQUUsT0FBTyxJQUFJLENBQUNLLFNBQVM7SUFBSTtJQUV2RDs7OztHQUlDLEdBQ0QsQUFBT0EsWUFBb0I7UUFDekIsT0FBTyxJQUFJLENBQUNGLGVBQWUsQ0FBQ0osS0FBSztJQUNuQztJQUVBOzs7R0FHQyxHQUNELEFBQU9PLGtCQUEwQjtRQUMvQixJQUFLLElBQUksQ0FBQ0MsbUJBQW1CLEtBQUssTUFBTztZQUN2QyxtRUFBbUU7WUFDbkUsSUFBSSxDQUFDQSxtQkFBbUIsR0FBRyxJQUFJLENBQUNQLE1BQU0sQ0FBQ1EsT0FBTyxDQUFFLEtBQUs7WUFFckQsSUFBS3RDLFNBQVN1QyxJQUFJLEVBQUc7Z0JBQ25CLDBHQUEwRztnQkFDMUcsSUFBSSxDQUFDRixtQkFBbUIsR0FBR2QsS0FBS2lCLHNCQUFzQixDQUFFLElBQUksQ0FBQ0gsbUJBQW1CO1lBQ2xGO1FBQ0Y7UUFFQSxPQUFPLElBQUksQ0FBQ0EsbUJBQW1CO0lBQ2pDO0lBRUEsSUFBV0ksZUFBdUI7UUFBRSxPQUFPLElBQUksQ0FBQ0wsZUFBZTtJQUFJO0lBRW5FOztHQUVDLEdBQ0QsQUFBUU0seUJBQStCO1FBQ3JDLElBQUksQ0FBQ0wsbUJBQW1CLEdBQUc7UUFFM0IsTUFBTU0sV0FBVyxJQUFJLENBQUNDLFVBQVUsQ0FBQ0MsTUFBTTtRQUN2QyxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUgsVUFBVUcsSUFBTTtZQUNqQyxJQUFJLENBQUNGLFVBQVUsQ0FBRUUsRUFBRyxDQUErQkMsYUFBYTtRQUNwRTtRQUVBLElBQUksQ0FBQ0MsY0FBYztJQUNyQjtJQUVBOzs7OztHQUtDLEdBQ0QsQUFBT0Msa0JBQW1CQyxTQUEyQyxFQUFTO1FBQzVFLE9BQU8sSUFBSSxDQUFDakIsZUFBZSxDQUFDa0IsaUJBQWlCLENBQUVELFdBQWdDLElBQUksRUFBRTNCLEtBQUs2QiwyQkFBMkI7SUFDdkg7SUFFQSxJQUFXeEIsZUFBZ0J5QixRQUEwQyxFQUFHO1FBQUUsSUFBSSxDQUFDSixpQkFBaUIsQ0FBRUk7SUFBWTtJQUU5RyxJQUFXekIsaUJBQW9DO1FBQUUsT0FBTyxJQUFJLENBQUMwQixpQkFBaUI7SUFBSTtJQUVsRjs7O0dBR0MsR0FDRCxBQUFPQSxvQkFBdUM7UUFDNUMsT0FBTyxJQUFJLENBQUNyQixlQUFlO0lBQzdCO0lBRUE7O0dBRUMsR0FDRCxBQUFtQnNCLHVCQUF3QkMsV0FBeUMsRUFBRUMsTUFBbUIsRUFBUztRQUVoSCwyREFBMkQ7UUFDM0QsTUFBTUMsa0JBQWtCLElBQUksQ0FBQ0Msb0JBQW9CO1FBRWpELEtBQUssQ0FBQ0osdUJBQXdCQyxhQUFhQztRQUUzQyxJQUFLdEQsT0FBT3lELGVBQWUsSUFBSSxDQUFDRixtQkFBbUIsSUFBSSxDQUFDQyxvQkFBb0IsSUFBSztZQUMvRSxJQUFJLENBQUMxQixlQUFlLENBQUM0QixnQkFBZ0IsQ0FBRSxJQUFJLEVBQUV0QyxLQUFLNkIsMkJBQTJCLEVBQUU7Z0JBQzNFLE9BQU8sSUFBSXpELGVBQWdCLElBQUksQ0FBQ21DLE1BQU0sRUFBRS9CLGVBQXVDO29CQUU3RSwrS0FBK0s7b0JBQy9LK0QsZ0JBQWdCO29CQUNoQkMsUUFBUSxJQUFJLENBQUNBLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFekMsS0FBSzZCLDJCQUEyQjtvQkFDbEVhLHFCQUFxQjtnQkFFdkIsR0FBR1IsT0FBT1MscUJBQXFCO1lBQ2pDO1FBRUo7SUFDRjtJQUVBOzs7R0FHQyxHQUNELEFBQWdCQyx3QkFBeUJDLGNBQWMsS0FBSyxFQUF5QztRQUNuRyxPQUFPbkUsK0JBQStCNEIsS0FBSyxLQUFLLFdBQ3pDLElBQUksQ0FBQ3dDLHFDQUFxQyxDQUFFRCxlQUM1QyxLQUFLLENBQUNELHdCQUF5QkM7SUFDeEM7SUFFUUMsc0NBQXVDRCxjQUFjLEtBQUssRUFBeUM7UUFDekcsTUFBTUUsdUJBQXVCLElBQUksQ0FBQ3JDLGVBQWUsQ0FBQ3NDLGlCQUFpQjtRQUVuRSxxRkFBcUY7UUFDckYsT0FBT0QsZ0NBQWdDcEUsZUFDaENvRSxxQkFBcUJILHVCQUF1QixDQUFFQyxlQUM5QztJQUNUO0lBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJDLEdBQ0QsQUFBT0ksZ0JBQWlCQyxNQUF3QixFQUFTO1FBQ3ZEL0MsVUFBVUEsT0FBUStDLFdBQVcsVUFBVUEsV0FBVyxnQkFBZ0JBLFdBQVcsY0FBY0EsV0FBVyxVQUFVO1FBQ2hILElBQUtBLFdBQVcsSUFBSSxDQUFDQyxhQUFhLEVBQUc7WUFDbkMsSUFBSSxDQUFDQSxhQUFhLEdBQUdEO1lBQ3JCLElBQUksQ0FBQ0UsNEJBQTRCO1lBRWpDLE1BQU1oQyxXQUFXLElBQUksQ0FBQ0MsVUFBVSxDQUFDQyxNQUFNO1lBQ3ZDLElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJSCxVQUFVRyxJQUFNO2dCQUNqQyxJQUFJLENBQUNGLFVBQVUsQ0FBRUUsRUFBRyxDQUErQjhCLGVBQWU7WUFDdEU7WUFFQSxJQUFJLENBQUM1QixjQUFjO1lBRW5CLElBQUksQ0FBQzZCLDZCQUE2QixDQUFDQyxJQUFJLElBQUkscURBQXFEO1FBQ2xHO1FBQ0EsT0FBTyxJQUFJO0lBQ2I7SUFFQSxJQUFXQyxhQUFjbEQsS0FBdUIsRUFBRztRQUFFLElBQUksQ0FBQzJDLGVBQWUsQ0FBRTNDO0lBQVM7SUFFcEYsSUFBV2tELGVBQWlDO1FBQUUsT0FBTyxJQUFJLENBQUNDLGVBQWU7SUFBSTtJQUU3RTs7R0FFQyxHQUNELEFBQU9BLGtCQUFvQztRQUN6QyxPQUFPLElBQUksQ0FBQ04sYUFBYTtJQUMzQjtJQUVBOzs7O0dBSUMsR0FDRCxBQUFVTyx5QkFBaUM7UUFDekMsSUFBSUMsVUFBVTtRQUVkLGdFQUFnRTtRQUNoRSxJQUFLLElBQUksQ0FBQ1IsYUFBYSxLQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUNTLE9BQU8sRUFBRztZQUNwREQsV0FBV3hFLFNBQVMwRSxhQUFhO1FBQ25DO1FBQ0EsSUFBSyxDQUFDLElBQUksQ0FBQ0QsT0FBTyxFQUFHO1lBQ25CRCxXQUFXeEUsU0FBUzJFLFVBQVU7UUFDaEM7UUFFQSxrRUFBa0U7UUFDbEVILFdBQVd4RSxTQUFTNEUsVUFBVTtRQUU5QixPQUFPSjtJQUNUO0lBRUE7Ozs7R0FJQyxHQUNELEFBQWdCUCwrQkFBcUM7UUFDbkQsSUFBSSxDQUFDWSxrQkFBa0IsQ0FBRSxJQUFJLENBQUNDLHNCQUFzQixLQUFLLElBQUksQ0FBQ0Msd0JBQXdCLEtBQUssSUFBSSxDQUFDUixzQkFBc0I7SUFDeEg7SUFFQTs7O0dBR0MsR0FDRCxBQUFRakMsaUJBQXVCO1FBQzdCLElBQUksQ0FBQzBDLGNBQWM7UUFFbkIsZ0tBQWdLO1FBQ2hLLE1BQU0vQyxXQUFXLElBQUksQ0FBQ0MsVUFBVSxDQUFDQyxNQUFNO1FBQ3ZDLElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJSCxVQUFVRyxJQUFNO1lBQ2pDLElBQUksQ0FBQ0YsVUFBVSxDQUFFRSxFQUFHLENBQStCOEIsZUFBZTtRQUN0RTtRQUVBLDREQUE0RDtRQUM1RCxJQUFJLENBQUNELDRCQUE0QjtJQUNuQztJQUVBOzs7O0dBSUMsR0FDRCxBQUFtQmdCLG1CQUE0QjtRQUM3QywyR0FBMkc7UUFDM0csSUFBSUM7UUFFSix5RUFBeUU7UUFDekUsSUFBSyxJQUFJLENBQUNULE9BQU8sSUFBTWpFLHNCQUFzQixJQUFJLENBQUN3RCxhQUFhLEtBQUssWUFBZTtZQUNqRmtCLGFBQWFoRixXQUFXaUYsb0JBQW9CLENBQUUsSUFBSSxDQUFDQyxLQUFLLEVBQUUsSUFBSSxDQUFDQyxjQUFjO1FBQy9FLE9BQ0ssSUFBSyxJQUFJLENBQUNyQixhQUFhLEtBQUssVUFBVztZQUMxQ2tCLGFBQWFoRixXQUFXb0YsdUJBQXVCLENBQUUsSUFBSSxDQUFDRixLQUFLLEVBQUUsSUFBSSxDQUFDckQsWUFBWTtRQUNoRixPQUNLLElBQUssSUFBSSxDQUFDaUMsYUFBYSxLQUFLLFlBQWE7WUFDNUNrQixhQUFhaEYsV0FBV3FGLG9CQUFvQixDQUFFLElBQUk7UUFDcEQsT0FDSztZQUNIdkUsVUFBVUEsT0FBUSxJQUFJLENBQUNnRCxhQUFhLEtBQUssVUFBVSxJQUFJLENBQUNBLGFBQWEsS0FBSztZQUMxRWtCLGFBQWFoRixXQUFXc0Ysb0JBQW9CLENBQUUsSUFBSSxDQUFDSixLQUFLLEVBQUUsSUFBSSxDQUFDckQsWUFBWTtRQUM3RTtRQUVBLHdGQUF3RjtRQUN4RixJQUFLLElBQUksQ0FBQzBELFNBQVMsSUFBSztZQUN0QlAsV0FBV1EsTUFBTSxDQUFFLElBQUksQ0FBQ0MsWUFBWSxLQUFLO1FBQzNDO1FBRUEsTUFBTUMsVUFBVSxDQUFDVixXQUFXVyxNQUFNLENBQUUsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQ0MsTUFBTTtRQUNsRSxJQUFLSCxTQUFVO1lBQ2IsSUFBSSxDQUFDRSxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFDdkUsR0FBRyxDQUFFMEQ7UUFDdEM7UUFDQSxPQUFPVTtJQUNUO0lBRUE7OztHQUdDLEdBQ0QsQUFBZ0JJLG1CQUF5QjtRQUN2QyxpREFBaUQ7UUFDakQsSUFBSSxDQUFDMUQsY0FBYztRQUVuQixLQUFLLENBQUMwRDtJQUNSO0lBRUE7OztHQUdDLEdBQ0QsQUFBZ0JDLGlCQUF1QjtRQUNyQyx5RUFBeUU7UUFDekUsSUFBSSxDQUFDM0QsY0FBYztRQUVuQixLQUFLLENBQUMyRDtJQUNSO0lBRUE7Ozs7OztHQU1DLEdBQ0QsQUFBbUJDLGdCQUFpQkMsT0FBNkIsRUFBRUMsTUFBZSxFQUFTO1FBQ3pGLGtLQUFrSztRQUNsS2pHLG1CQUFtQmtHLFNBQVMsQ0FBQ0MsV0FBVyxDQUFFSCxTQUFTLElBQUksRUFBRUM7SUFDM0Q7SUFFQTs7Ozs7R0FLQyxHQUNELEFBQWdCRyxrQkFBbUJDLFFBQWdCLEVBQUVDLFFBQWtCLEVBQW9CO1FBQ3pGLG1CQUFtQjtRQUNuQixPQUFPckcsZ0JBQWdCc0csY0FBYyxDQUFFRixVQUFVQztJQUNuRDtJQUVBOzs7OztHQUtDLEdBQ0QsQUFBZ0JFLGtCQUFtQkgsUUFBZ0IsRUFBRUMsUUFBa0IsRUFBb0I7UUFDekYsbUJBQW1CO1FBQ25CLE9BQU9wRyxnQkFBZ0JxRyxjQUFjLENBQUVGLFVBQVVDO0lBQ25EO0lBRUE7Ozs7O0dBS0MsR0FDRCxBQUFnQkcscUJBQXNCSixRQUFnQixFQUFFQyxRQUFrQixFQUF1QjtRQUMvRixtQkFBbUI7UUFDbkIsT0FBT3RHLG1CQUFtQnVHLGNBQWMsQ0FBRUYsVUFBVUM7SUFDdEQ7SUFFQTs7OztHQUlDLEdBQ0QsQUFBT3BCLGlCQUEwQjtRQUMvQixJQUFLLElBQUksQ0FBQ1osT0FBTyxFQUFHO1lBQ2xCLE1BQU1vQyxPQUFPQyxTQUFTQyxhQUFhLENBQUU7WUFDckNGLEtBQUtHLFNBQVMsR0FBRyxJQUFJLENBQUM1RixNQUFNO1lBQzVCLE9BQU95RjtRQUNULE9BQ0s7WUFDSCxPQUFPQyxTQUFTRyxjQUFjLENBQUUsSUFBSSxDQUFDbEYsWUFBWTtRQUNuRDtJQUNGO0lBRUE7Ozs7OztHQU1DLEdBQ0QsQUFBZ0JtRixvQkFBNkI7UUFDM0MsTUFBTUMsa0JBQWtCLEdBQUcsa0ZBQWtGO1FBRTdHLE1BQU1qQyxhQUFhLElBQUksQ0FBQ2tDLGFBQWE7UUFFckMsOEVBQThFO1FBQzlFLE9BQU9sQyxXQUFXbUMsU0FBUyxDQUFFRixrQkFBa0JqQyxXQUFXb0MsS0FBSyxFQUFFSCxrQkFBa0JqQyxXQUFXcUMsTUFBTTtJQUN0RztJQUVBOzs7Ozs7R0FNQyxHQUNELEFBQU9DLFFBQVNDLElBQW1CLEVBQVM7UUFFMUMsK0dBQStHO1FBQy9HLG9CQUFvQjtRQUNwQixNQUFNN0IsVUFBVTZCLFNBQVcsQ0FBQSxBQUFFLE9BQU9BLFNBQVMsV0FBYSxJQUFJLENBQUNyQyxLQUFLLENBQUNzQyxLQUFLLEtBQUssSUFBSSxDQUFDdEMsS0FBSyxBQUFEO1FBQ3hGLElBQUtRLFNBQVU7WUFDYiwyQ0FBMkM7WUFDM0MsSUFBSSxDQUFDUixLQUFLLEdBQUcsQUFBRSxPQUFPcUMsU0FBUyxXQUFhOUgsS0FBS2dJLE9BQU8sQ0FBRUYsUUFBU0E7WUFFbkUsTUFBTXhGLFdBQVcsSUFBSSxDQUFDQyxVQUFVLENBQUNDLE1BQU07WUFDdkMsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElBQUlILFVBQVVHLElBQU07Z0JBQ2pDLElBQUksQ0FBQ0YsVUFBVSxDQUFFRSxFQUFHLENBQStCd0YsYUFBYTtZQUNwRTtZQUVBLElBQUksQ0FBQ3RGLGNBQWM7UUFDckI7UUFDQSxPQUFPLElBQUk7SUFDYjtJQUVBLElBQVdtRixLQUFNdEcsS0FBb0IsRUFBRztRQUFFLElBQUksQ0FBQ3FHLE9BQU8sQ0FBRXJHO0lBQVM7SUFFakUsSUFBV3NHLE9BQWU7UUFBRSxPQUFPLElBQUksQ0FBQ0ksT0FBTztJQUFJO0lBRW5EOzs7Ozs7OztHQVFDLEdBQ0QsQUFBT0EsVUFBa0I7UUFDdkIsT0FBTyxJQUFJLENBQUN6QyxLQUFLLENBQUN5QyxPQUFPO0lBQzNCO0lBRUE7Ozs7OztHQU1DLEdBQ0QsQUFBT0MsY0FBZUMsTUFBMkIsRUFBUztRQUN4RCxPQUFPLElBQUksQ0FBQ1AsT0FBTyxDQUFFLElBQUksQ0FBQ3BDLEtBQUssQ0FBQzRDLElBQUksQ0FBRTtZQUNwQ0QsUUFBUUE7UUFDVjtJQUNGO0lBRUEsSUFBV0UsV0FBWTlHLEtBQTBCLEVBQUc7UUFBRSxJQUFJLENBQUMyRyxhQUFhLENBQUUzRztJQUFTO0lBRW5GLElBQVc4RyxhQUF5QjtRQUFFLE9BQU8sSUFBSSxDQUFDQyxhQUFhO0lBQUk7SUFFbkU7Ozs7R0FJQyxHQUNELEFBQU9BLGdCQUE0QjtRQUNqQyxPQUFPLElBQUksQ0FBQzlDLEtBQUssQ0FBQytDLFNBQVM7SUFDN0I7SUFFQTs7Ozs7OztHQU9DLEdBQ0QsQUFBT0MsY0FBZUMsTUFBYyxFQUFTO1FBQzNDLE9BQU8sSUFBSSxDQUFDYixPQUFPLENBQUUsSUFBSSxDQUFDcEMsS0FBSyxDQUFDNEMsSUFBSSxDQUFFO1lBQ3BDSyxRQUFRQTtRQUNWO0lBQ0Y7SUFFQSxJQUFXQyxXQUFZbkgsS0FBYSxFQUFHO1FBQUUsSUFBSSxDQUFDaUgsYUFBYSxDQUFFakg7SUFBUztJQUV0RSxJQUFXbUgsYUFBcUI7UUFBRSxPQUFPLElBQUksQ0FBQ0MsYUFBYTtJQUFJO0lBRS9EOztHQUVDLEdBQ0QsQUFBT0EsZ0JBQXdCO1FBQzdCLE9BQU8sSUFBSSxDQUFDbkQsS0FBSyxDQUFDb0QsU0FBUztJQUM3QjtJQUVBOzs7Ozs7R0FNQyxHQUNELEFBQU9DLGVBQWdCQyxPQUFvQixFQUFTO1FBQ2xELE9BQU8sSUFBSSxDQUFDbEIsT0FBTyxDQUFFLElBQUksQ0FBQ3BDLEtBQUssQ0FBQzRDLElBQUksQ0FBRTtZQUNwQ1UsU0FBU0E7UUFDWDtJQUNGO0lBRUEsSUFBV0MsWUFBYXhILEtBQWtCLEVBQUc7UUFBRSxJQUFJLENBQUNzSCxjQUFjLENBQUV0SDtJQUFTO0lBRTdFLElBQVd3SCxjQUEyQjtRQUFFLE9BQU8sSUFBSSxDQUFDQyxjQUFjO0lBQUk7SUFFdEU7O0dBRUMsR0FDRCxBQUFPQSxpQkFBOEI7UUFDbkMsT0FBTyxJQUFJLENBQUN4RCxLQUFLLENBQUN5RCxVQUFVO0lBQzlCO0lBRUE7Ozs7R0FJQyxHQUNELEFBQU9DLGFBQWNDLEtBQWdCLEVBQVM7UUFDNUMsT0FBTyxJQUFJLENBQUN2QixPQUFPLENBQUUsSUFBSSxDQUFDcEMsS0FBSyxDQUFDNEMsSUFBSSxDQUFFO1lBQ3BDZSxPQUFPQTtRQUNUO0lBQ0Y7SUFFQSxJQUFXQyxVQUFXN0gsS0FBZ0IsRUFBRztRQUFFLElBQUksQ0FBQzJILFlBQVksQ0FBRTNIO0lBQVM7SUFFdkUsSUFBVzZILFlBQXVCO1FBQUUsT0FBTyxJQUFJLENBQUNDLFlBQVk7SUFBSTtJQUVoRTs7R0FFQyxHQUNELEFBQU9BLGVBQTBCO1FBQy9CLE9BQU8sSUFBSSxDQUFDN0QsS0FBSyxDQUFDOEQsUUFBUTtJQUM1QjtJQUVBOzs7OztHQUtDLEdBQ0QsQUFBT0MsWUFBYUMsSUFBcUIsRUFBUztRQUNoRCxPQUFPLElBQUksQ0FBQzVCLE9BQU8sQ0FBRSxJQUFJLENBQUNwQyxLQUFLLENBQUM0QyxJQUFJLENBQUU7WUFDcENvQixNQUFNQTtRQUNSO0lBQ0Y7SUFFQSxJQUFXQyxTQUFVbEksS0FBc0IsRUFBRztRQUFFLElBQUksQ0FBQ2dJLFdBQVcsQ0FBRWhJO0lBQVM7SUFFM0UsSUFBV2tJLFdBQW1CO1FBQUUsT0FBTyxJQUFJLENBQUNDLFdBQVc7SUFBSTtJQUUzRDs7Ozs7R0FLQyxHQUNELEFBQU9BLGNBQXNCO1FBQzNCLE9BQU8sSUFBSSxDQUFDbEUsS0FBSyxDQUFDbUUsT0FBTztJQUMzQjtJQUVBOztHQUVDLEdBQ0QsQUFBZ0JDLFlBQXFCO1FBQ25DLDZCQUE2QjtRQUM3QixPQUFPO0lBQ1Q7SUFFQTs7Ozs7R0FLQyxHQUNELEFBQWdCQyxxQkFBOEI7UUFDNUMsT0FBTyxJQUFJLENBQUN6RixhQUFhLEtBQUs7SUFDaEM7SUFFQTs7R0FFQyxHQUNELEFBQWdCMEYscUJBQTZCO1FBQzNDLE9BQU8sQ0FBQyxFQUFFLEVBQUV2SyxXQUFZLElBQUksQ0FBQzRDLFlBQVksRUFBRyxDQUFDLEVBQUUsSUFBSSxDQUFDMEMsT0FBTyxHQUFHLFlBQVksSUFBSTtJQUNoRjtJQUVnQmtGLFVBQWdCO1FBQzlCLEtBQUssQ0FBQ0E7UUFFTixJQUFJLENBQUNwSSxlQUFlLENBQUNvSSxPQUFPO0lBQzlCO0lBRUE7Ozs7R0FJQyxHQUNELE9BQWNDLG9CQUFxQnhJLE1BQWMsRUFBVztRQUMxRCxPQUFPQSxPQUFPUSxPQUFPLENBQUUsV0FBVyxTQUFVQSxPQUFPLENBQUUsV0FBVyxTQUFVQSxPQUFPLENBQUUsV0FBVztJQUNoRztJQUVBOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCQyxHQUNELE9BQWNFLHVCQUF3QlYsTUFBYyxFQUFXO1FBVzdELHlEQUF5RDtRQUN6RCxNQUFNeUksT0FBTztZQUNYQyxLQUFLO1lBQ0xDLFVBQVUsRUFBRTtZQUNaQyxRQUFRO1FBQ1Y7UUFDQSxJQUFJQyxVQUFxQko7UUFDekIsSUFBTSxJQUFJekgsSUFBSSxHQUFHQSxJQUFJaEIsT0FBT2UsTUFBTSxFQUFFQyxJQUFNO1lBQ3hDLE1BQU04SCxNQUFNOUksT0FBTytJLE1BQU0sQ0FBRS9IO1lBRTNCLG1CQUFtQjtZQUNuQixJQUFLOEgsUUFBUUUsT0FBT0YsUUFBUUcsS0FBTTtnQkFDaEMsTUFBTUMsT0FBTztvQkFDWFIsS0FBS0k7b0JBQ0xILFVBQVUsRUFBRTtvQkFDWkMsUUFBUUM7Z0JBQ1Y7Z0JBQ0FBLFFBQVFGLFFBQVEsQ0FBQ1EsSUFBSSxDQUFFRDtnQkFDdkJMLFVBQVVLO1lBQ1osT0FFSyxJQUFLSixRQUFRTSxLQUFNO2dCQUN0QnhKLFVBQVVBLE9BQVFpSixRQUFRRCxNQUFNLEVBQUUsQ0FBQyxnQ0FBZ0MsRUFBRW5KLEtBQUsrSSxtQkFBbUIsQ0FBRXhJLFNBQVU7Z0JBQ3pHNkksVUFBVUEsUUFBUUQsTUFBTTtZQUMxQixPQUVLO2dCQUNIQyxRQUFRRixRQUFRLENBQUNRLElBQUksQ0FBRUw7WUFDekI7UUFDRjtRQUNBbEosVUFBVUEsT0FBUWlKLFlBQVlKLE1BQU0sQ0FBQyxnQ0FBZ0MsRUFBRWhKLEtBQUsrSSxtQkFBbUIsQ0FBRXhJLFNBQVU7UUFFM0csMERBQTBEO1FBQzFELFNBQVNxSixnQkFBaUJILElBQWU7WUFDdkMsSUFBTSxJQUFJbEksSUFBSWtJLEtBQUtQLFFBQVEsQ0FBQzVILE1BQU0sR0FBRyxHQUFHQyxLQUFLLEdBQUdBLElBQU07Z0JBQ3BELE1BQU1zSSxRQUFRSixLQUFLUCxRQUFRLENBQUUzSCxFQUFHO2dCQUNoQyxJQUFLLE9BQU9zSSxVQUFVLFlBQVlKLEtBQUtSLEdBQUcsS0FBS1ksTUFBTVosR0FBRyxFQUFHO29CQUN6RFEsS0FBS1AsUUFBUSxDQUFDWSxNQUFNLENBQUV2SSxHQUFHLE1BQU1zSSxNQUFNWCxRQUFRO2dCQUMvQztZQUNGO1FBQ0Y7UUFFQSw4RkFBOEY7UUFDOUYsU0FBU2Esb0JBQXFCTixJQUFlO1lBQzNDLElBQUtBLEtBQUtQLFFBQVEsQ0FBQzVILE1BQU0sS0FBSyxLQUFLLE9BQU9tSSxLQUFLUCxRQUFRLENBQUUsRUFBRyxLQUFLLFlBQVlPLEtBQUtQLFFBQVEsQ0FBRSxFQUFHLENBQUNELEdBQUcsRUFBRztnQkFDcEdRLEtBQUtSLEdBQUcsR0FBR1EsS0FBS1AsUUFBUSxDQUFFLEVBQUcsQ0FBQ0QsR0FBRztnQkFDakNRLEtBQUtQLFFBQVEsR0FBR08sS0FBS1AsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUTtZQUM3QztRQUNGO1FBRUEsbUVBQW1FO1FBQ25FLFNBQVNjLGlCQUFrQlAsSUFBZTtZQUN4QyxJQUFNLElBQUlsSSxJQUFJa0ksS0FBS1AsUUFBUSxDQUFDNUgsTUFBTSxHQUFHLEdBQUdDLEtBQUssR0FBR0EsSUFBTTtnQkFDcEQsTUFBTTBJLGdCQUFnQlIsS0FBS1AsUUFBUSxDQUFFM0gsSUFBSSxFQUFHO2dCQUM1QyxNQUFNc0ksUUFBUUosS0FBS1AsUUFBUSxDQUFFM0gsRUFBRztnQkFDaEMsSUFBSyxPQUFPc0ksVUFBVSxZQUFZLE9BQU9JLGtCQUFrQixZQUFZSixNQUFNWixHQUFHLElBQUlnQixjQUFjaEIsR0FBRyxLQUFLWSxNQUFNWixHQUFHLEVBQUc7b0JBQ3BIZ0IsY0FBY2YsUUFBUSxHQUFHZSxjQUFjZixRQUFRLENBQUNnQixNQUFNLENBQUVMLE1BQU1YLFFBQVE7b0JBQ3RFTyxLQUFLUCxRQUFRLENBQUNZLE1BQU0sQ0FBRXZJLEdBQUc7b0JBRXpCLHFGQUFxRjtvQkFDckZ5SSxpQkFBa0JDO2dCQUNwQjtZQUNGO1FBQ0Y7UUFFQSxnREFBZ0Q7UUFDaEQsU0FBU0UsU0FBVVYsSUFBd0I7WUFDekMsSUFBSyxPQUFPQSxTQUFTLFVBQVc7Z0JBQzlCLElBQU0sSUFBSWxJLElBQUksR0FBR0EsSUFBSWtJLEtBQUtQLFFBQVEsQ0FBQzVILE1BQU0sRUFBRUMsSUFBTTtvQkFDL0M0SSxTQUFVVixLQUFLUCxRQUFRLENBQUUzSCxFQUFHO2dCQUM5QjtnQkFFQXdJLG9CQUFxQk47Z0JBQ3JCRyxnQkFBaUJIO2dCQUNqQk8saUJBQWtCUDtZQUNwQjtZQUVBLE9BQU9BO1FBQ1Q7UUFFQSw2QkFBNkI7UUFDN0IsU0FBU1csVUFBV1gsSUFBd0I7WUFDMUMsSUFBSyxPQUFPQSxTQUFTLFVBQVc7Z0JBQzlCLE9BQU9BO1lBQ1Q7WUFDQSxNQUFNWSxjQUFjWixLQUFLUCxRQUFRLENBQUNvQixHQUFHLENBQUVGLFdBQVlHLElBQUksQ0FBRTtZQUN6RCxJQUFLZCxLQUFLUixHQUFHLEVBQUc7Z0JBQ2QsT0FBTyxHQUFHUSxLQUFLUixHQUFHLEdBQUdvQixZQUFZLE1BQU0sQ0FBQztZQUMxQyxPQUNLO2dCQUNILE9BQU9BO1lBQ1Q7UUFDRjtRQUVBLE9BQU9ELFVBQVdELFNBQVVuQjtJQUM5QjtJQW51QkE7Ozs7R0FJQyxHQUNELFlBQW9CekksTUFBbUQsRUFBRUwsT0FBcUIsQ0FBRztRQUMvRkMsVUFBVUEsT0FBUUQsWUFBWU8sYUFBYStKLE9BQU9DLGNBQWMsQ0FBRXZLLGFBQWNzSyxPQUFPaEYsU0FBUyxFQUM5RjtRQUVGLEtBQUs7UUFFTCxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDOUUsZUFBZSxHQUFHLElBQUlyQyx1QkFBd0IsSUFBSSxNQUFNLElBQUksQ0FBQzhDLHNCQUFzQixDQUFDdUosSUFBSSxDQUFFLElBQUk7UUFDbkcsSUFBSSxDQUFDbkcsS0FBSyxHQUFHekYsS0FBSzZMLE9BQU87UUFDekIsSUFBSSxDQUFDeEgsYUFBYSxHQUFHO1FBQ3JCLElBQUksQ0FBQ1MsT0FBTyxHQUFHLE9BQU8sc0VBQXNFO1FBQzVGLElBQUksQ0FBQzlDLG1CQUFtQixHQUFHO1FBRTNCLE1BQU04SixpQkFBaUJyTSxjQUE0QjtZQUNqRHNNLE1BQU07WUFFTixVQUFVO1lBQ1ZDLGtCQUFrQjtZQUNsQkMsWUFBWS9LLEtBQUtnTCxNQUFNO1lBQ3ZCQyxtQ0FBbUM7UUFDckMsR0FBRy9LO1FBRUhDLFVBQVVBLE9BQVEsQ0FBQ3lLLGVBQWV4SyxjQUFjLENBQUUsYUFBYyxDQUFDd0ssZUFBZXhLLGNBQWMsQ0FBRUosS0FBSzZCLDJCQUEyQixHQUM5SDtRQUVGLElBQUssT0FBT3RCLFdBQVcsWUFBWSxPQUFPQSxXQUFXLFVBQVc7WUFDOURxSyxlQUFlckssTUFBTSxHQUFHQTtRQUMxQixPQUNLO1lBQ0hxSyxlQUFldkssY0FBYyxHQUFHRTtRQUNsQztRQUVBLElBQUksQ0FBQ04sTUFBTSxDQUFFMks7UUFFYixJQUFJLENBQUN4SCw0QkFBNEIsSUFBSSwrQ0FBK0M7SUFDdEY7QUE4ckJGO0FBNXZCcUJwRCxLQW1CSVAsdUJBQXVCQTtBQW5CM0JPLEtBb0JJNkIsOEJBQThCcEM7QUFwQnZELFNBQXFCTyxrQkE0dkJwQjtBQUVEOzs7Ozs7Q0FNQyxHQUNEQSxLQUFLd0YsU0FBUyxDQUFDMEYsWUFBWSxHQUFHO09BQUtoTTtPQUEwQlE7T0FBcUJYLEtBQUt5RyxTQUFTLENBQUMwRixZQUFZO0NBQUU7QUFFL0c7Ozs7OztDQU1DLEdBQ0RsTCxLQUFLd0YsU0FBUyxDQUFDMkYsaUJBQWlCLEdBQUc7T0FBS3BNLEtBQUt5RyxTQUFTLENBQUMyRixpQkFBaUI7T0FBS2xNO0lBQStCO0lBQVE7SUFBUTtDQUFVO0FBRXRJRyxRQUFRZ00sUUFBUSxDQUFFLFFBQVFwTDtBQUUxQiw2RUFBNkU7QUFDN0UscURBQXFEO0FBQ3JELE1BQU11SixNQUFNO0FBQ1osTUFBTUMsTUFBTTtBQUNaLE1BQU1HLE1BQU07QUFFWix3Q0FBd0M7QUFDeEN0SyxXQUFXZ00sb0JBQW9CO0FBRS9CckwsS0FBS2dMLE1BQU0sR0FBRyxJQUFJbk0sT0FBUSxVQUFVO0lBQ2xDeU0sV0FBV3RMO0lBQ1h1TCxXQUFXeE0sS0FBS3lNLE1BQU07SUFDdEJDLGVBQWUsaUdBQ0E7QUFDakIifQ==