// Copyright 2017-2024, University of Colorado Boulder
/**
 * Displays rich text by interpreting the input text as HTML, supporting a limited set of tags that prevent any
 * security vulnerabilities. It does this by parsing the input HTML and splitting it into multiple Text children
 * recursively.
 *
 * NOTE: Encoding HTML entities is required, and malformed HTML is not accepted.
 *
 * NOTE: Currently it can line-wrap at the start and end of tags. This will probably be fixed in the future to only
 *       potentially break on whitespace.
 *
 * It supports the following markup and features in the string content (in addition to other options as listed in
 * RICH_TEXT_OPTION_KEYS):
 * - <a href="{{placeholder}}"> for links (pass in { links: { placeholder: ACTUAL_HREF } })
 * - <b> and <strong> for bold text
 * - <i> and <em> for italic text
 * - <sub> and <sup> for subscripts / superscripts
 * - <u> for underlined text
 * - <s> for strikethrough text
 * - <span> tags with a dir="ltr" / dir="rtl" attribute
 * - <br> for explicit line breaks
 * - <node id="id"> for embedding a Node into the text (pass in { nodes: { id: NODE } }), with optional align attribute
 * - Custom Scenery wrapping around arbitrary tags, e.g. <blur>...</blur>, pass in { tags: { blur: ... } }, see below
 * - Unicode bidirectional marks (present in PhET strings) for full RTL support
 * - CSS style="..." attributes, with color and font settings, see https://github.com/phetsims/scenery/issues/807
 *
 * Examples from the scenery-phet demo:
 *
 * new RichText( 'RichText can have <b>bold</b> and <i>italic</i> text.' ),
 * new RichText( 'Can do H<sub>2</sub>O (A<sub>sub</sub> and A<sup>sup</sup>), or nesting: x<sup>2<sup>2</sup></sup>' ),
 * new RichText( 'Additionally: <span style="color: blue;">color</span>, <span style="font-size: 30px;">sizes</span>, <span style="font-family: serif;">faces</span>, <s>strikethrough</s>, and <u>underline</u>' ),
 * new RichText( 'These <b><em>can</em> <u><span style="color: red;">be</span> mixed<sup>1</sup></u></b>.' ),
 * new RichText( '\u202aHandles bidirectional text: \u202b<span style="color: #0a0;">مقابض</span> النص ثنائي <b>الاتجاه</b><sub>2</sub>\u202c\u202c' ),
 * new RichText( '\u202b\u062a\u0633\u062a (\u0632\u0628\u0627\u0646)\u202c' ),
 * new RichText( 'HTML entities need to be escaped, like &amp; and &lt;.' ),
 * new RichText( 'Supports <a href="{{phetWebsite}}"><em>links</em> with <b>markup</b></a>, and <a href="{{callback}}">links that call functions</a>.', {
 *   links: {
 *     phetWebsite: 'https://phet.colorado.edu',
 *     callback: function() {
 *       console.log( 'Link was clicked' );
 *     }
 *   }
 * } ),
 * new RichText( 'Or also <a href="https://phet.colorado.edu">links directly in the string</a>.', {
 *   links: true
 * } ),
 * new RichText( 'Links not found <a href="{{bogus}}">are ignored</a> for security.' ),
 * new HBox( {
 *   spacing: 30,
 *   children: [
 *     new RichText( 'Multi-line text with the<br>separator &lt;br&gt; and <a href="https://phet.colorado.edu">handles<br>links</a> and other <b>tags<br>across lines</b>', {
 *       links: true
 *     } ),
 *     new RichText( 'Supposedly RichText supports line wrapping. Here is a lineWrap of 300, which should probably wrap multiple times here', { lineWrap: 300 } )
 *   ]
 * } )
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import DerivedStringProperty from '../../../axon/js/DerivedStringProperty.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import TinyForwardingProperty from '../../../axon/js/TinyForwardingProperty.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import phetioElementSelectionProperty from '../../../tandem/js/phetioElementSelectionProperty.js';
import '../../../sherpa/lib/himalaya-1.1.0.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import { allowLinksProperty, assertNoAdditionalChildren, Color, Font, getLineBreakRanges, isHimalayaElementNode, isHimalayaTextNode, Line, Node, RichTextElement, RichTextLeaf, RichTextLink, RichTextNode, RichTextUtils, RichTextVerticalSpacer, scenery, Text, WidthSizable } from '../imports.js';
// @ts-expect-error - Since himalaya isn't in tsconfig
const himalayaVar = himalaya;
assert && assert(himalayaVar, 'himalaya dependency needed for RichText.');
// Options that can be used in the constructor, with mutate(), or directly as setters/getters
// each of these options has an associated setter, see setter methods for more documentation
const RICH_TEXT_OPTION_KEYS = [
    'boundsMethod',
    'font',
    'fill',
    'stroke',
    'lineWidth',
    'subScale',
    'subXSpacing',
    'subYOffset',
    'supScale',
    'supXSpacing',
    'supYOffset',
    'capHeightScale',
    'underlineLineWidth',
    'underlineHeightScale',
    'strikethroughLineWidth',
    'strikethroughHeightScale',
    'linkFill',
    'linkEventsHandled',
    'links',
    'nodes',
    'tags',
    'replaceNewlines',
    'align',
    'leading',
    'lineWrap',
    Text.STRING_PROPERTY_NAME,
    'string'
];
// Used only for guarding against assertions, we want to know that we aren't in stringTesting mode
const isStringTest = window.QueryStringMachine && QueryStringMachine.containsKey('stringTest');
const DEFAULT_FONT = new Font({
    size: 20
});
// Tags that should be included in accessible innerContent, see https://github.com/phetsims/joist/issues/430
const ACCESSIBLE_TAGS = [
    'b',
    'strong',
    'i',
    'em',
    'sub',
    'sup',
    'u',
    's'
];
// What type of line-break situations we can be in during our recursive process
const LineBreakState = {
    // There was a line break, but it was at the end of the element (or was a <br>). The relevant element can be fully
    // removed from the tree.
    COMPLETE: 'COMPLETE',
    // There was a line break, but there is some content left in this element after the line break. DO NOT remove it.
    INCOMPLETE: 'INCOMPLETE',
    // There was NO line break
    NONE: 'NONE'
};
// We'll store an array here that will record which links/nodes were used in the last rebuild (so we can assert out if
// there were some that were not used).
const usedLinks = [];
const usedNodes = [];
// himalaya converts dash separated CSS to camel case - use CSS compatible style with dashes, see above for examples
const FONT_STYLE_MAP = {
    'font-family': 'family',
    'font-size': 'size',
    'font-stretch': 'stretch',
    'font-style': 'style',
    'font-variant': 'variant',
    'font-weight': 'weight',
    'line-height': 'lineHeight'
};
const FONT_STYLE_KEYS = Object.keys(FONT_STYLE_MAP);
const STYLE_KEYS = [
    'color'
].concat(FONT_STYLE_KEYS);
let RichText = class RichText extends WidthSizable(Node) {
    /**
   * Called when our stringProperty changes values.
   */ onStringPropertyChange() {
        this.rebuildRichText();
    }
    /**
   * See documentation for Node.setVisibleProperty, except this is for the text string.
   *
   * NOTE: Setting the .string after passing a truly read-only Property will fail at runtime. We choose to allow passing
   * in read-only Properties for convenience.
   */ setStringProperty(newTarget) {
        return this._stringProperty.setTargetProperty(newTarget, this, RichText.STRING_PROPERTY_TANDEM_NAME);
    }
    set stringProperty(property) {
        this.setStringProperty(property);
    }
    get stringProperty() {
        return this.getStringProperty();
    }
    /**
   * Like Node.getVisibleProperty, but for the text string. Note this is not the same as the Property provided in
   * setStringProperty. Thus is the nature of TinyForwardingProperty.
   */ getStringProperty() {
        return this._stringProperty;
    }
    /**
   * RichText supports a "string" selection mode, in which it will map to its stringProperty (if applicable), otherwise is
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
   * See documentation and comments in Node.initializePhetioObject
   */ initializePhetioObject(baseOptions, providedOptions) {
        const options = optionize()({}, providedOptions);
        // Track this, so we only override our stringProperty once.
        const wasInstrumented = this.isPhetioInstrumented();
        super.initializePhetioObject(baseOptions, options);
        if (Tandem.PHET_IO_ENABLED && !wasInstrumented && this.isPhetioInstrumented()) {
            this._stringProperty.initializePhetio(this, RichText.STRING_PROPERTY_TANDEM_NAME, ()=>{
                return new StringProperty(this.string, combineOptions({
                    // by default, texts should be readonly. Editable texts most likely pass in editable Properties from i18n model Properties, see https://github.com/phetsims/scenery/issues/1443
                    phetioReadOnly: true,
                    tandem: this.tandem.createTandem(RichText.STRING_PROPERTY_TANDEM_NAME),
                    phetioDocumentation: 'Property for the displayed text'
                }, options.stringPropertyOptions));
            });
        }
    }
    /**
   * When called, will rebuild the node structure for this RichText
   */ rebuildRichText() {
        assert && cleanArray(usedLinks);
        assert && cleanArray(usedNodes);
        const hasDynamicWidth = this._lineWrap === 'stretch';
        this.widthSizable = hasDynamicWidth;
        this.pendingMinimumWidth = 0;
        this.needPendingMinimumWidth = hasDynamicWidth;
        // NOTE: can't use hasDynamicWidth here, since TypeScript isn't inferring it yet
        const effectiveLineWrap = this._lineWrap === 'stretch' ? this.localPreferredWidth : this._lineWrap;
        this.freeChildrenToPool();
        // Bail early, particularly if we are being constructed.
        if (this.string === '') {
            this.appendEmptyLeaf();
            return;
        }
        sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`RichText#${this.id} rebuild`);
        sceneryLog && sceneryLog.RichText && sceneryLog.push();
        // Turn bidirectional marks into explicit elements, so that the nesting is applied correctly.
        let mappedText = this.string.replace(/\u202a/g, '<span dir="ltr">').replace(/\u202b/g, '<span dir="rtl">').replace(/\u202c/g, '</span>');
        // Optional replacement of newlines, see https://github.com/phetsims/scenery/issues/1542
        if (this._replaceNewlines) {
            mappedText = mappedText.replace(/\n/g, '<br>');
        }
        let rootElements;
        // Start appending all top-level elements
        try {
            rootElements = himalayaVar.parse(mappedText);
        } catch (e) {
            // If we error out, don't kill the sim. Instead, replace the string with something that looks obviously like an
            // error. See https://github.com/phetsims/chipper/issues/1361 (we don't want translations to error out our
            // build process).
            rootElements = himalayaVar.parse('INVALID TRANSLATION');
        }
        // Clear out link items, as we'll need to reconstruct them later
        this._linkItems.length = 0;
        const widthAvailable = effectiveLineWrap === null ? Number.POSITIVE_INFINITY : effectiveLineWrap;
        const isRootLTR = true;
        let currentLine = RichTextElement.pool.create(isRootLTR);
        this._hasAddedLeafToLine = false; // notify that if nothing has been added, the first leaf always gets added.
        // Himalaya can give us multiple top-level items, so we need to iterate over those
        while(rootElements.length){
            const element = rootElements[0];
            // How long our current line is already
            const currentLineWidth = currentLine.bounds.isValid() ? currentLine.width : 0;
            // Add the element in
            const lineBreakState = this.appendElement(currentLine, element, this._font, this._fill, isRootLTR, widthAvailable - currentLineWidth, 1);
            sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`lineBreakState: ${lineBreakState}`);
            // If there was a line break (we'll need to swap to a new line node)
            if (lineBreakState !== LineBreakState.NONE) {
                // Add the line if it works
                if (currentLine.bounds.isValid()) {
                    sceneryLog && sceneryLog.RichText && sceneryLog.RichText('Adding line due to lineBreak');
                    this.appendLine(currentLine);
                } else {
                    this.appendLine(RichTextVerticalSpacer.pool.create(RichTextUtils.scratchText.setString('X').setFont(this._font).height));
                }
                // Set up a new line
                currentLine = RichTextElement.pool.create(isRootLTR);
                this._hasAddedLeafToLine = false;
            }
            // If it's COMPLETE or NONE, then we fully processed the line
            if (lineBreakState !== LineBreakState.INCOMPLETE) {
                sceneryLog && sceneryLog.RichText && sceneryLog.RichText('Finished root element');
                rootElements.splice(0, 1);
            }
        }
        // Only add the final line if it's valid (we don't want to add unnecessary padding at the bottom)
        if (currentLine.bounds.isValid()) {
            sceneryLog && sceneryLog.RichText && sceneryLog.RichText('Adding final line');
            this.appendLine(currentLine);
        }
        // If we reached here and have no children, we probably ran into a degenerate "no layout" case like `' '`. Add in
        // the empty leaf.
        if (this.lineContainer.getChildrenCount() === 0) {
            this.appendEmptyLeaf();
        }
        // All lines are constructed, so we can align them now
        this.alignLines();
        // Handle regrouping of links (so that all fragments of a link across multiple lines are contained under a single
        // ancestor that has listeners and a11y)
        while(this._linkItems.length){
            // Close over the href and other references
            (()=>{
                const linkElement = this._linkItems[0].element;
                const href = this._linkItems[0].href;
                let i;
                // Find all nodes that are for the same link
                const nodes = [];
                for(i = this._linkItems.length - 1; i >= 0; i--){
                    const item = this._linkItems[i];
                    if (item.element === linkElement) {
                        nodes.push(item.node);
                        this._linkItems.splice(i, 1);
                    }
                }
                const linkRootNode = RichTextLink.pool.create(linkElement.innerContent, href);
                this.lineContainer.addChild(linkRootNode);
                // Detach the node from its location, adjust its transform, and reattach under the link. This should keep each
                // fragment in the same place, but changes its parent.
                for(i = 0; i < nodes.length; i++){
                    const node = nodes[i];
                    const matrix = node.getUniqueTrailTo(this.lineContainer).getMatrix();
                    node.detach();
                    node.matrix = matrix;
                    linkRootNode.addChild(node);
                }
            })();
        }
        // Clear them out afterwards, for memory purposes
        this._linkItems.length = 0;
        if (assert) {
            if (this._links && this._links !== true) {
                Object.keys(this._links).forEach((link)=>{
                    assert && allowLinksProperty.value && !isStringTest && assert(usedLinks.includes(link), `Unused RichText link: ${link}`);
                });
            }
            if (this._nodes) {
                Object.keys(this._nodes).forEach((node)=>{
                    assert && allowLinksProperty.value && !isStringTest && assert(usedNodes.includes(node), `Unused RichText node: ${node}`);
                });
            }
        }
        // NOTE: If this is failing or causing infinite loops in the future, refactor RichText to use a LayoutConstraint.
        this.localMinimumWidth = hasDynamicWidth ? this.pendingMinimumWidth : this.localBounds.width;
        sceneryLog && sceneryLog.RichText && sceneryLog.pop();
    }
    /**
   * Cleans "recursively temporary disposes" the children.
   */ freeChildrenToPool() {
        // Clear any existing lines or link fragments (higher performance, and return them to pools also)
        while(this.lineContainer._children.length){
            const child = this.lineContainer._children[this.lineContainer._children.length - 1];
            this.lineContainer.removeChild(child);
            child.clean();
        }
    }
    /**
   * Releases references.
   */ dispose() {
        this.freeChildrenToPool();
        super.dispose();
        this._stringProperty.dispose();
    }
    /**
   * Appends a finished line, applying any necessary leading.
   */ appendLine(lineNode) {
        // Apply leading
        if (this.lineContainer.bounds.isValid()) {
            lineNode.top = this.lineContainer.bottom + this._leading;
            // This ensures RTL lines will still be laid out properly with the main origin (handled by alignLines later)
            lineNode.left = 0;
        }
        this.lineContainer.addChild(lineNode);
    }
    /**
   * If we end up with the equivalent of "no" content, toss in a basically empty leaf so that we get valid bounds
   * (0 width, correctly-positioned height). See https://github.com/phetsims/scenery/issues/769.
   */ appendEmptyLeaf() {
        assert && assert(this.lineContainer.getChildrenCount() === 0);
        this.appendLine(RichTextLeaf.pool.create('', true, this._font, this._boundsMethod, this._fill, this._stroke, this._lineWidth));
    }
    /**
   * Aligns all lines attached to the lineContainer.
   */ alignLines() {
        // All nodes will either share a 'left', 'centerX' or 'right'.
        const coordinateName = this._align === 'center' ? 'centerX' : this._align;
        const ideal = this.lineContainer[coordinateName];
        for(let i = 0; i < this.lineContainer.getChildrenCount(); i++){
            this.lineContainer.getChildAt(i)[coordinateName] = ideal;
        }
    }
    /**
   * Main recursive function for constructing the RichText Node tree.
   *
   * We'll add any relevant content to the containerNode. The element will be mutated as things are added, so that
   * whenever content is added to the Node tree it will be removed from the element tree. This means we can pause
   * whenever (e.g. when a line-break is encountered) and the rest will be ready for parsing the next line.
   *
   * @param containerNode - The node where child elements should be placed
   * @param element - See Himalaya's element specification
   *                      (https://github.com/andrejewski/himalaya/blob/master/text/ast-spec-v0.md)
   * @param font - The font to apply at this level
   * @param fill - Fill to apply
   * @param isLTR - True if LTR, false if RTL (handles RTL strings properly)
   * @param widthAvailable - How much width we have available before forcing a line break (for lineWrap)
   * @returns - Whether a line break was reached
   */ appendElement(containerNode, element, font, fill, isLTR, widthAvailable, appliedScale) {
        let lineBreakState = LineBreakState.NONE;
        // The main Node for the element that we are adding
        let node;
        // If this content gets added, it will need to be pushed over by this amount
        const containerSpacing = isLTR ? containerNode.rightSpacing : containerNode.leftSpacing;
        // Container spacing cuts into our effective available width
        const widthAvailableWithSpacing = widthAvailable - containerSpacing;
        // If we're a leaf
        if (isHimalayaTextNode(element)) {
            sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`appending leaf: ${element.content}`);
            sceneryLog && sceneryLog.RichText && sceneryLog.push();
            node = RichTextLeaf.pool.create(element.content, isLTR, font, this._boundsMethod, fill, this._stroke, this._lineWidth);
            if (this.needPendingMinimumWidth) {
                this.pendingMinimumWidth = Math.max(this.pendingMinimumWidth, Math.max(...getLineBreakRanges(element.content).map((range)=>{
                    const string = element.content.slice(range.min, range.max);
                    const temporaryNode = RichTextLeaf.pool.create(string, isLTR, font, this._boundsMethod, fill, this._stroke, this._lineWidth);
                    const localMininumWidth = temporaryNode.width * appliedScale;
                    temporaryNode.dispose();
                    return localMininumWidth;
                })));
            }
            // Handle wrapping if required. Container spacing cuts into our available width
            if (!node.fitsIn(widthAvailableWithSpacing, this._hasAddedLeafToLine, isLTR)) {
                // Didn't fit, lets break into words to see what we can fit. We'll create ranges for all the individual
                // elements we could split the lines into. If we split into different lines, we can ignore the characters
                // in-between, however if not, we need to include them.
                const ranges = getLineBreakRanges(element.content);
                // Convert a group of ranges into a string (grab the content from the string).
                const rangesToString = (ranges)=>{
                    if (ranges.length === 0) {
                        return '';
                    } else {
                        return element.content.slice(ranges[0].min, ranges[ranges.length - 1].max);
                    }
                };
                sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`Overflow leafAdded:${this._hasAddedLeafToLine}, words: ${ranges.length}`);
                // If we need to add something (and there is only a single word), then add it
                if (this._hasAddedLeafToLine || ranges.length > 1) {
                    sceneryLog && sceneryLog.RichText && sceneryLog.RichText('Skipping words');
                    const skippedRanges = [];
                    let success = false;
                    skippedRanges.unshift(ranges.pop()); // We didn't fit with the last one!
                    // Keep shortening by removing words until it fits (or if we NEED to fit it) or it doesn't fit.
                    while(ranges.length){
                        node.clean(); // We're tossing the old one, so we'll free up memory for the new one
                        node = RichTextLeaf.pool.create(rangesToString(ranges), isLTR, font, this._boundsMethod, fill, this._stroke, this._lineWidth);
                        // If we haven't added anything to the line AND we are down to the first word, we need to just add it.
                        if (!node.fitsIn(widthAvailableWithSpacing, this._hasAddedLeafToLine, isLTR) && (this._hasAddedLeafToLine || ranges.length > 1)) {
                            sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`Skipping word ${rangesToString([
                                ranges[ranges.length - 1]
                            ])}`);
                            skippedRanges.unshift(ranges.pop());
                        } else {
                            sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`Success with ${rangesToString(ranges)}`);
                            success = true;
                            break;
                        }
                    }
                    // If we haven't added anything yet to this line, we'll permit the overflow
                    if (success) {
                        lineBreakState = LineBreakState.INCOMPLETE;
                        element.content = rangesToString(skippedRanges);
                        sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`Remaining content: ${element.content}`);
                    } else {
                        // We won't use this one, so we'll free it back to the pool
                        node.clean();
                        return LineBreakState.INCOMPLETE;
                    }
                }
            }
            this._hasAddedLeafToLine = true;
            sceneryLog && sceneryLog.RichText && sceneryLog.pop();
        } else if (isHimalayaElementNode(element)) {
            // Bail out quickly for a line break
            if (element.tagName === 'br') {
                sceneryLog && sceneryLog.RichText && sceneryLog.RichText('manual line break');
                return LineBreakState.COMPLETE;
            }
            // Span (dir attribute) -- we need the LTR/RTL knowledge before most other operations
            if (element.tagName === 'span') {
                const dirAttributeString = RichTextUtils.himalayaGetAttribute('dir', element);
                if (dirAttributeString) {
                    assert && assert(dirAttributeString === 'ltr' || dirAttributeString === 'rtl', 'Span dir attributes should be ltr or rtl.');
                    isLTR = dirAttributeString === 'ltr';
                }
            }
            // Handle <node> tags, which should not have content
            if (element.tagName === 'node') {
                const referencedId = RichTextUtils.himalayaGetAttribute('id', element);
                const referencedNode = referencedId ? this._nodes[referencedId] || null : null;
                assert && assert(referencedNode, referencedId ? `Could not find a matching item in RichText's nodes for ${referencedId}. It should be provided in the nodes option` : 'No id attribute provided for a given <node> element');
                if (referencedNode) {
                    assert && usedNodes.push(referencedId);
                    node = RichTextNode.pool.create(referencedNode);
                    if (this._hasAddedLeafToLine && !node.fitsIn(widthAvailableWithSpacing)) {
                        // If we don't fit, we'll toss this node to the pool and create it on the next line
                        node.clean();
                        return LineBreakState.INCOMPLETE;
                    }
                    const nodeAlign = RichTextUtils.himalayaGetAttribute('align', element);
                    if (nodeAlign === 'center' || nodeAlign === 'top' || nodeAlign === 'bottom') {
                        const textBounds = RichTextUtils.scratchText.setString('Test').setFont(font).bounds;
                        if (nodeAlign === 'center') {
                            node.centerY = textBounds.centerY;
                        } else if (nodeAlign === 'top') {
                            node.top = textBounds.top;
                        } else if (nodeAlign === 'bottom') {
                            node.bottom = textBounds.bottom;
                        }
                    }
                } else {
                    // If there is no node in our map, we'll just skip it
                    return lineBreakState;
                }
                this._hasAddedLeafToLine = true;
            } else {
                node = RichTextElement.pool.create(isLTR);
            }
            sceneryLog && sceneryLog.RichText && sceneryLog.RichText('appending element');
            sceneryLog && sceneryLog.RichText && sceneryLog.push();
            const styleAttributeString = RichTextUtils.himalayaGetAttribute('style', element);
            if (styleAttributeString) {
                const css = RichTextUtils.himalayaStyleStringToMap(styleAttributeString);
                assert && Object.keys(css).forEach((key)=>{
                    assert(_.includes(STYLE_KEYS, key), 'See supported style CSS keys');
                });
                // Fill
                if (css.color) {
                    fill = new Color(css.color);
                }
                // Font
                const fontOptions = {};
                for(let i = 0; i < FONT_STYLE_KEYS.length; i++){
                    const styleKey = FONT_STYLE_KEYS[i];
                    if (css[styleKey]) {
                        fontOptions[FONT_STYLE_MAP[styleKey]] = css[styleKey];
                    }
                }
                font = (typeof font === 'string' ? Font.fromCSS(font) : font).copy(fontOptions);
            }
            // Anchor (link)
            if (element.tagName === 'a') {
                let href = RichTextUtils.himalayaGetAttribute('href', element);
                const originalHref = href;
                // Try extracting the href from the links object
                if (href !== null && this._links !== true) {
                    if (href.startsWith('{{') && href.indexOf('}}') === href.length - 2) {
                        const linkName = href.slice(2, -2);
                        href = this._links[linkName];
                        assert && usedLinks.push(linkName);
                    } else {
                        href = null;
                    }
                }
                // Ignore things if there is no matching href
                assert && assert(href, `Could not find a matching item in RichText's links for ${originalHref}. It should be provided in the links option, or links should be turned to true (to allow the string to create its own urls`);
                if (href) {
                    if (this._linkFill !== null) {
                        fill = this._linkFill; // Link color
                    }
                    // Don't overwrite only innerContents once things have been "torn down"
                    if (!element.innerContent) {
                        element.innerContent = RichText.himalayaElementToAccessibleString(element);
                    }
                    // Store information about it for the "regroup links" step
                    this._linkItems.push({
                        element: element,
                        node: node,
                        href: href
                    });
                }
            } else if (element.tagName === 'b' || element.tagName === 'strong') {
                font = (typeof font === 'string' ? Font.fromCSS(font) : font).copy({
                    weight: 'bold'
                });
            } else if (element.tagName === 'i' || element.tagName === 'em') {
                font = (typeof font === 'string' ? Font.fromCSS(font) : font).copy({
                    style: 'italic'
                });
            } else if (element.tagName === 'sub') {
                node.scale(this._subScale);
                node.addExtraBeforeSpacing(this._subXSpacing);
                node.y += this._subYOffset;
            } else if (element.tagName === 'sup') {
                node.scale(this._supScale);
                node.addExtraBeforeSpacing(this._supXSpacing);
                node.y += this._supYOffset;
            }
            // If we've added extra spacing, we'll need to subtract it off of our available width
            const scale = node.getScaleVector().x;
            // Process children
            if (element.tagName !== 'node') {
                while(lineBreakState === LineBreakState.NONE && element.children.length){
                    const widthBefore = node.bounds.isValid() ? node.width : 0;
                    const childElement = element.children[0];
                    lineBreakState = this.appendElement(node, childElement, font, fill, isLTR, widthAvailable / scale, appliedScale * scale);
                    // for COMPLETE or NONE, we'll want to remove the childElement from the tree (we fully processed it)
                    if (lineBreakState !== LineBreakState.INCOMPLETE) {
                        element.children.splice(0, 1);
                    }
                    const widthAfter = node.bounds.isValid() ? node.width : 0;
                    // Remove the amount of width taken up by the child
                    widthAvailable += widthBefore - widthAfter;
                }
                // If there is a line break and there are still more things to process, we are incomplete
                if (lineBreakState === LineBreakState.COMPLETE && element.children.length) {
                    lineBreakState = LineBreakState.INCOMPLETE;
                }
            }
            // Subscript positioning
            if (element.tagName === 'sub') {
                if (isFinite(node.height)) {
                    node.centerY = 0;
                }
            } else if (element.tagName === 'sup') {
                if (isFinite(node.height)) {
                    node.centerY = RichTextUtils.scratchText.setString('X').setFont(font).top * this._capHeightScale;
                }
            } else if (element.tagName === 'u') {
                const underlineY = -node.top * this._underlineHeightScale;
                if (isFinite(node.top)) {
                    node.addChild(new Line(node.localLeft, underlineY, node.localRight, underlineY, {
                        stroke: fill,
                        lineWidth: this._underlineLineWidth
                    }));
                }
            } else if (element.tagName === 's') {
                const strikethroughY = node.top * this._strikethroughHeightScale;
                if (isFinite(node.top)) {
                    node.addChild(new Line(node.localLeft, strikethroughY, node.localRight, strikethroughY, {
                        stroke: fill,
                        lineWidth: this._strikethroughLineWidth
                    }));
                }
            }
            if (this._tags && this._tags[element.tagName] && node.bounds.isValid()) {
                const originalNode = node;
                const originalBounds = node.bounds;
                node = RichTextNode.pool.create(this._tags[element.tagName](node));
                if (originalNode !== node) {
                    node.localBounds = originalBounds;
                }
            }
            sceneryLog && sceneryLog.RichText && sceneryLog.pop();
        }
        if (node) {
            const wasAdded = containerNode.addElement(node);
            if (!wasAdded) {
                // Remove it from the linkItems if we didn't actually add it.
                this._linkItems = this._linkItems.filter((item)=>item.node !== node);
                // And since we won't dispose it (since it's not a child), clean it here
                node.clean();
            }
        }
        return lineBreakState;
    }
    /**
   * Sets the string displayed by our node.
   *
   * NOTE: Encoding HTML entities is required, and malformed HTML is not accepted.
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
   */ getString() {
        return this._stringProperty.value;
    }
    /**
   * Sets the method that is used to determine bounds from the text. See Text.setBoundsMethod for details
   */ setBoundsMethod(method) {
        assert && assert(method === 'fast' || method === 'fastCanvas' || method === 'accurate' || method === 'hybrid', 'Unknown Text boundsMethod');
        if (method !== this._boundsMethod) {
            this._boundsMethod = method;
            this.rebuildRichText();
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
   * Sets the font of our node.
   */ setFont(font) {
        if (this._font !== font) {
            this._font = font;
            this.rebuildRichText();
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
   * Returns the current Font
   */ getFont() {
        return this._font;
    }
    /**
   * Sets the fill of our text.
   */ setFill(fill) {
        if (this._fill !== fill) {
            this._fill = fill;
            this.rebuildRichText();
        }
        return this;
    }
    set fill(value) {
        this.setFill(value);
    }
    get fill() {
        return this.getFill();
    }
    /**
   * Returns the current fill.
   */ getFill() {
        return this._fill;
    }
    /**
   * Sets the stroke of our text.
   */ setStroke(stroke) {
        if (this._stroke !== stroke) {
            this._stroke = stroke;
            this.rebuildRichText();
        }
        return this;
    }
    set stroke(value) {
        this.setStroke(value);
    }
    get stroke() {
        return this.getStroke();
    }
    /**
   * Returns the current stroke.
   */ getStroke() {
        return this._stroke;
    }
    /**
   * Sets the lineWidth of our text.
   */ setLineWidth(lineWidth) {
        if (this._lineWidth !== lineWidth) {
            this._lineWidth = lineWidth;
            this.rebuildRichText();
        }
        return this;
    }
    set lineWidth(value) {
        this.setLineWidth(value);
    }
    get lineWidth() {
        return this.getLineWidth();
    }
    /**
   * Returns the current lineWidth.
   */ getLineWidth() {
        return this._lineWidth;
    }
    /**
   * Sets the scale (relative to 1) of any string under subscript (<sub>) elements.
   */ setSubScale(subScale) {
        assert && assert(isFinite(subScale) && subScale > 0);
        if (this._subScale !== subScale) {
            this._subScale = subScale;
            this.rebuildRichText();
        }
        return this;
    }
    set subScale(value) {
        this.setSubScale(value);
    }
    get subScale() {
        return this.getSubScale();
    }
    /**
   * Returns the scale (relative to 1) of any string under subscript (<sub>) elements.
   */ getSubScale() {
        return this._subScale;
    }
    /**
   * Sets the horizontal spacing before any subscript (<sub>) elements.
   */ setSubXSpacing(subXSpacing) {
        assert && assert(isFinite(subXSpacing));
        if (this._subXSpacing !== subXSpacing) {
            this._subXSpacing = subXSpacing;
            this.rebuildRichText();
        }
        return this;
    }
    set subXSpacing(value) {
        this.setSubXSpacing(value);
    }
    get subXSpacing() {
        return this.getSubXSpacing();
    }
    /**
   * Returns the horizontal spacing before any subscript (<sub>) elements.
   */ getSubXSpacing() {
        return this._subXSpacing;
    }
    /**
   * Sets the adjustment offset to the vertical placement of any subscript (<sub>) elements.
   */ setSubYOffset(subYOffset) {
        assert && assert(isFinite(subYOffset));
        if (this._subYOffset !== subYOffset) {
            this._subYOffset = subYOffset;
            this.rebuildRichText();
        }
        return this;
    }
    set subYOffset(value) {
        this.setSubYOffset(value);
    }
    get subYOffset() {
        return this.getSubYOffset();
    }
    /**
   * Returns the adjustment offset to the vertical placement of any subscript (<sub>) elements.
   */ getSubYOffset() {
        return this._subYOffset;
    }
    /**
   * Sets the scale (relative to 1) of any string under superscript (<sup>) elements.
   */ setSupScale(supScale) {
        assert && assert(isFinite(supScale) && supScale > 0);
        if (this._supScale !== supScale) {
            this._supScale = supScale;
            this.rebuildRichText();
        }
        return this;
    }
    set supScale(value) {
        this.setSupScale(value);
    }
    get supScale() {
        return this.getSupScale();
    }
    /**
   * Returns the scale (relative to 1) of any string under superscript (<sup>) elements.
   */ getSupScale() {
        return this._supScale;
    }
    /**
   * Sets the horizontal spacing before any superscript (<sup>) elements.
   */ setSupXSpacing(supXSpacing) {
        assert && assert(isFinite(supXSpacing));
        if (this._supXSpacing !== supXSpacing) {
            this._supXSpacing = supXSpacing;
            this.rebuildRichText();
        }
        return this;
    }
    set supXSpacing(value) {
        this.setSupXSpacing(value);
    }
    get supXSpacing() {
        return this.getSupXSpacing();
    }
    /**
   * Returns the horizontal spacing before any superscript (<sup>) elements.
   */ getSupXSpacing() {
        return this._supXSpacing;
    }
    /**
   * Sets the adjustment offset to the vertical placement of any superscript (<sup>) elements.
   */ setSupYOffset(supYOffset) {
        assert && assert(isFinite(supYOffset));
        if (this._supYOffset !== supYOffset) {
            this._supYOffset = supYOffset;
            this.rebuildRichText();
        }
        return this;
    }
    set supYOffset(value) {
        this.setSupYOffset(value);
    }
    get supYOffset() {
        return this.getSupYOffset();
    }
    /**
   * Returns the adjustment offset to the vertical placement of any superscript (<sup>) elements.
   */ getSupYOffset() {
        return this._supYOffset;
    }
    /**
   * Sets the expected cap height (baseline to top of capital letters) as a scale of the detected distance from the
   * baseline to the top of the text bounds.
   */ setCapHeightScale(capHeightScale) {
        assert && assert(isFinite(capHeightScale) && capHeightScale > 0);
        if (this._capHeightScale !== capHeightScale) {
            this._capHeightScale = capHeightScale;
            this.rebuildRichText();
        }
        return this;
    }
    set capHeightScale(value) {
        this.setCapHeightScale(value);
    }
    get capHeightScale() {
        return this.getCapHeightScale();
    }
    /**
   * Returns the expected cap height (baseline to top of capital letters) as a scale of the detected distance from the
   * baseline to the top of the text bounds.
   */ getCapHeightScale() {
        return this._capHeightScale;
    }
    /**
   * Sets the lineWidth of underline lines.
   */ setUnderlineLineWidth(underlineLineWidth) {
        assert && assert(isFinite(underlineLineWidth) && underlineLineWidth > 0);
        if (this._underlineLineWidth !== underlineLineWidth) {
            this._underlineLineWidth = underlineLineWidth;
            this.rebuildRichText();
        }
        return this;
    }
    set underlineLineWidth(value) {
        this.setUnderlineLineWidth(value);
    }
    get underlineLineWidth() {
        return this.getUnderlineLineWidth();
    }
    /**
   * Returns the lineWidth of underline lines.
   */ getUnderlineLineWidth() {
        return this._underlineLineWidth;
    }
    /**
   * Sets the underline height adjustment as a proportion of the detected distance from the baseline to the top of the
   * text bounds.
   */ setUnderlineHeightScale(underlineHeightScale) {
        assert && assert(isFinite(underlineHeightScale) && underlineHeightScale > 0);
        if (this._underlineHeightScale !== underlineHeightScale) {
            this._underlineHeightScale = underlineHeightScale;
            this.rebuildRichText();
        }
        return this;
    }
    set underlineHeightScale(value) {
        this.setUnderlineHeightScale(value);
    }
    get underlineHeightScale() {
        return this.getUnderlineHeightScale();
    }
    /**
   * Returns the underline height adjustment as a proportion of the detected distance from the baseline to the top of the
   * text bounds.
   */ getUnderlineHeightScale() {
        return this._underlineHeightScale;
    }
    /**
   * Sets the lineWidth of strikethrough lines.
   */ setStrikethroughLineWidth(strikethroughLineWidth) {
        assert && assert(isFinite(strikethroughLineWidth) && strikethroughLineWidth > 0);
        if (this._strikethroughLineWidth !== strikethroughLineWidth) {
            this._strikethroughLineWidth = strikethroughLineWidth;
            this.rebuildRichText();
        }
        return this;
    }
    set strikethroughLineWidth(value) {
        this.setStrikethroughLineWidth(value);
    }
    get strikethroughLineWidth() {
        return this.getStrikethroughLineWidth();
    }
    /**
   * Returns the lineWidth of strikethrough lines.
   */ getStrikethroughLineWidth() {
        return this._strikethroughLineWidth;
    }
    /**
   * Sets the strikethrough height adjustment as a proportion of the detected distance from the baseline to the top of the
   * text bounds.
   */ setStrikethroughHeightScale(strikethroughHeightScale) {
        assert && assert(isFinite(strikethroughHeightScale) && strikethroughHeightScale > 0);
        if (this._strikethroughHeightScale !== strikethroughHeightScale) {
            this._strikethroughHeightScale = strikethroughHeightScale;
            this.rebuildRichText();
        }
        return this;
    }
    set strikethroughHeightScale(value) {
        this.setStrikethroughHeightScale(value);
    }
    get strikethroughHeightScale() {
        return this.getStrikethroughHeightScale();
    }
    /**
   * Returns the strikethrough height adjustment as a proportion of the detected distance from the baseline to the top of the
   * text bounds.
   */ getStrikethroughHeightScale() {
        return this._strikethroughHeightScale;
    }
    /**
   * Sets the color of links. If null, no fill will be overridden.
   */ setLinkFill(linkFill) {
        if (this._linkFill !== linkFill) {
            this._linkFill = linkFill;
            this.rebuildRichText();
        }
        return this;
    }
    set linkFill(value) {
        this.setLinkFill(value);
    }
    get linkFill() {
        return this.getLinkFill();
    }
    /**
   * Returns the color of links.
   */ getLinkFill() {
        return this._linkFill;
    }
    /**
   * Sets whether link clicks will call event.handle().
   */ setLinkEventsHandled(linkEventsHandled) {
        if (this._linkEventsHandled !== linkEventsHandled) {
            this._linkEventsHandled = linkEventsHandled;
            this.rebuildRichText();
        }
        return this;
    }
    set linkEventsHandled(value) {
        this.setLinkEventsHandled(value);
    }
    get linkEventsHandled() {
        return this.getLinkEventsHandled();
    }
    /**
   * Returns whether link events will be handled.
   */ getLinkEventsHandled() {
        return this._linkEventsHandled;
    }
    setLinks(links) {
        assert && assert(links === true || Object.getPrototypeOf(links) === Object.prototype);
        if (this._links !== links) {
            this._links = links;
            this.rebuildRichText();
        }
        return this;
    }
    /**
   * Returns whether link events will be handled.
   */ getLinks() {
        return this._links;
    }
    set links(value) {
        this.setLinks(value);
    }
    get links() {
        return this.getLinks();
    }
    setNodes(nodes) {
        assert && assert(Object.getPrototypeOf(nodes) === Object.prototype);
        if (this._nodes !== nodes) {
            this._nodes = nodes;
            this.rebuildRichText();
        }
        return this;
    }
    getNodes() {
        return this._nodes;
    }
    set nodes(value) {
        this.setNodes(value);
    }
    get nodes() {
        return this.getNodes();
    }
    setTags(tags) {
        assert && assert(Object.getPrototypeOf(tags) === Object.prototype);
        if (this._tags !== tags) {
            this._tags = tags;
            this.rebuildRichText();
        }
        return this;
    }
    getTags() {
        return this._tags;
    }
    set tags(value) {
        this.setTags(value);
    }
    get tags() {
        return this.getTags();
    }
    /**
   * Sets whether newlines are replaced with <br>
   */ setReplaceNewlines(replaceNewlines) {
        if (this._replaceNewlines !== replaceNewlines) {
            this._replaceNewlines = replaceNewlines;
            this.rebuildRichText();
        }
        return this;
    }
    set replaceNewlines(value) {
        this.setReplaceNewlines(value);
    }
    get replaceNewlines() {
        return this.getReplaceNewlines();
    }
    getReplaceNewlines() {
        return this._replaceNewlines;
    }
    /**
   * Sets the alignment of text (only relevant if there are multiple lines).
   */ setAlign(align) {
        assert && assert(align === 'left' || align === 'center' || align === 'right');
        if (this._align !== align) {
            this._align = align;
            this.rebuildRichText();
        }
        return this;
    }
    set align(value) {
        this.setAlign(value);
    }
    get align() {
        return this.getAlign();
    }
    /**
   * Returns the current alignment of the text (only relevant if there are multiple lines).
   */ getAlign() {
        return this._align;
    }
    /**
   * Sets the leading (spacing between lines)
   */ setLeading(leading) {
        assert && assert(isFinite(leading));
        if (this._leading !== leading) {
            this._leading = leading;
            this.rebuildRichText();
        }
        return this;
    }
    set leading(value) {
        this.setLeading(value);
    }
    get leading() {
        return this.getLeading();
    }
    /**
   * Returns the leading (spacing between lines)
   */ getLeading() {
        return this._leading;
    }
    /**
   * Sets the line wrap width for the text (or null if none is desired). Lines longer than this length will wrap
   * automatically to the next line.
   *
   * @param lineWrap - If it's a number, it should be greater than 0.
   */ setLineWrap(lineWrap) {
        assert && assert(lineWrap === null || lineWrap === 'stretch' || isFinite(lineWrap) && lineWrap > 0);
        if (this._lineWrap !== lineWrap) {
            this._lineWrap = lineWrap;
            this.rebuildRichText();
        }
        return this;
    }
    set lineWrap(value) {
        this.setLineWrap(value);
    }
    get lineWrap() {
        return this.getLineWrap();
    }
    /**
   * Returns the line wrap width.
   */ getLineWrap() {
        return this._lineWrap;
    }
    mutate(options) {
        if (assert && options && options.hasOwnProperty('string') && options.hasOwnProperty(Text.STRING_PROPERTY_NAME) && options.stringProperty) {
            assert && assert(options.stringProperty.value === options.string, 'If both string and stringProperty are provided, then values should match');
        }
        return super.mutate(options);
    }
    /**
   * Returns a wrapped version of the string with a font specifier that uses the given font object.
   *
   * NOTE: Does an approximation of some font values (using <b> or <i>), and cannot force the lack of those if it is
   * included in bold/italic exterior tags.
   */ static stringWithFont(str, font) {
        // TODO: ES6 string interpolation. https://github.com/phetsims/scenery/issues/1581
        return `${'<span style=\'' + 'font-style: '}${font.style};` + `font-variant: ${font.variant};` + `font-weight: ${font.weight};` + `font-stretch: ${font.stretch};` + `font-size: ${font.size};` + `font-family: ${font.family};` + `line-height: ${font.lineHeight};` + `'>${str}</span>`;
    }
    /**
   * Stringifies an HTML subtree defined by the given element.
   */ static himalayaElementToString(element) {
        if (isHimalayaTextNode(element)) {
            return RichText.contentToString(element.content);
        } else if (isHimalayaElementNode(element)) {
            const content = element.children.map((child)=>RichText.himalayaElementToString(child)).join('');
            const dir = RichTextUtils.himalayaGetAttribute('dir', element);
            if (dir === 'ltr' || dir === 'rtl') {
                return StringUtils.wrapDirection(content, dir);
            } else {
                return content;
            }
        } else {
            return '';
        }
    }
    /**
   * Stringifies an HTML subtree defined by the given element, but removing certain tags that we don't need for
   * accessibility (like <a>, <span>, etc.), and adding in tags we do want (see ACCESSIBLE_TAGS).
   */ static himalayaElementToAccessibleString(element) {
        if (isHimalayaTextNode(element)) {
            return RichText.contentToString(element.content);
        } else if (isHimalayaElementNode(element)) {
            let content = element.children.map((child)=>RichText.himalayaElementToAccessibleString(child)).join('');
            const dir = RichTextUtils.himalayaGetAttribute('dir', element);
            if (dir === 'ltr' || dir === 'rtl') {
                content = StringUtils.wrapDirection(content, dir);
            }
            if (_.includes(ACCESSIBLE_TAGS, element.tagName)) {
                return `<${element.tagName}>${content}</${element.tagName}>`;
            } else {
                return content;
            }
        } else {
            return '';
        }
    }
    /**
   * Transforms a given string with HTML markup into a string suitable for screen readers.
   * Preserves basic styling tags while removing non-accessible markup.
   */ static getAccessibleStringProperty(stringProperty) {
        return new DerivedStringProperty([
            stringProperty
        ], (string)=>{
            const rootElements = himalayaVar.parse(string);
            let accessibleString = '';
            rootElements.forEach((element)=>{
                accessibleString += RichText.himalayaElementToAccessibleString(element);
            });
            return accessibleString;
        });
    }
    /**
   * Takes the element.content from himalaya, unescapes HTML entities, and applies the proper directional tags.
   *
   * See https://github.com/phetsims/scenery-phet/issues/315
   */ static contentToString(content, isLTR) {
        // @ts-expect-error - we should get a string from this
        const unescapedContent = he.decode(content);
        return isLTR === undefined ? unescapedContent : `${isLTR ? '\u202a' : '\u202b'}${unescapedContent}\u202c`;
    }
    constructor(string, providedOptions){
        // We only fill in some defaults, since the other defaults are defined below (and mutate is relied on)
        const options = optionize()({
            fill: '#000000',
            // phet-io
            tandemNameSuffix: 'Text',
            phetioType: RichText.RichTextIO,
            phetioVisiblePropertyInstrumented: false
        }, providedOptions);
        if (typeof string === 'string' || typeof string === 'number') {
            options.string = string;
        } else {
            options.stringProperty = string;
        }
        super(), this._font = DEFAULT_FONT, this._boundsMethod = 'hybrid', this._fill = '#000000', this._stroke = null, this._lineWidth = 1, this._subScale = 0.75, this._subXSpacing = 0, this._subYOffset = 0, this._supScale = 0.75, this._supXSpacing = 0, this._supYOffset = 0, this._capHeightScale = 0.75, this._underlineLineWidth = 1, this._underlineHeightScale = 0.15, this._strikethroughLineWidth = 1, this._strikethroughHeightScale = 0.3, this._linkFill = 'rgb(27,0,241)', this._linkEventsHandled = false, // If an object, values are either {string} or {function}
        this._links = {}, this._nodes = {}, this._tags = {}, this._replaceNewlines = false, this._align = 'left', this._leading = 0, this._lineWrap = null, // We need to consolidate links (that could be split across multiple lines) under one "link" node, so we track created
        // link fragments here so they can get pieced together later.
        this._linkItems = [], // Whether something has been added to this line yet. We don't want to infinite-loop out if something is longer than
        // our lineWrap, so we'll place one item on its own on an otherwise empty line.
        this._hasAddedLeafToLine = false, // For lineWrap:stretch, we'll need to compute a new minimum width for the RichText, so these control
        // (a) whether we're computing this (it does a lot of unnecessary work otherwise if we don't need it), and (b)
        // the actual minimumWidth that we'll have.
        this.needPendingMinimumWidth = false, this.pendingMinimumWidth = 0;
        this._stringProperty = new TinyForwardingProperty('', true, this.onStringPropertyChange.bind(this));
        this.lineContainer = new Node({});
        this.addChild(this.lineContainer);
        // Initialize to an empty state, so we are immediately valid (since now we need to create an empty leaf even if we
        // have empty text).
        this.rebuildRichText();
        this.localPreferredWidthProperty.lazyLink(()=>this.rebuildRichText());
        this.mutate(options);
        // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
        assert && assertNoAdditionalChildren(this);
    }
};
// Text and RichText currently use the same tandem name for their stringProperty.
RichText.STRING_PROPERTY_TANDEM_NAME = Text.STRING_PROPERTY_TANDEM_NAME;
export { RichText as default };
/**
 * {Array.<string>} - String keys for all the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ RichText.prototype._mutatorKeys = RICH_TEXT_OPTION_KEYS.concat(Node.prototype._mutatorKeys);
scenery.register('RichText', RichText);
RichText.RichTextIO = new IOType('RichTextIO', {
    valueType: RichText,
    supertype: Node.NodeIO,
    documentation: 'The PhET-iO Type for the scenery RichText node'
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvUmljaFRleHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGlzcGxheXMgcmljaCB0ZXh0IGJ5IGludGVycHJldGluZyB0aGUgaW5wdXQgdGV4dCBhcyBIVE1MLCBzdXBwb3J0aW5nIGEgbGltaXRlZCBzZXQgb2YgdGFncyB0aGF0IHByZXZlbnQgYW55XG4gKiBzZWN1cml0eSB2dWxuZXJhYmlsaXRpZXMuIEl0IGRvZXMgdGhpcyBieSBwYXJzaW5nIHRoZSBpbnB1dCBIVE1MIGFuZCBzcGxpdHRpbmcgaXQgaW50byBtdWx0aXBsZSBUZXh0IGNoaWxkcmVuXG4gKiByZWN1cnNpdmVseS5cbiAqXG4gKiBOT1RFOiBFbmNvZGluZyBIVE1MIGVudGl0aWVzIGlzIHJlcXVpcmVkLCBhbmQgbWFsZm9ybWVkIEhUTUwgaXMgbm90IGFjY2VwdGVkLlxuICpcbiAqIE5PVEU6IEN1cnJlbnRseSBpdCBjYW4gbGluZS13cmFwIGF0IHRoZSBzdGFydCBhbmQgZW5kIG9mIHRhZ3MuIFRoaXMgd2lsbCBwcm9iYWJseSBiZSBmaXhlZCBpbiB0aGUgZnV0dXJlIHRvIG9ubHlcbiAqICAgICAgIHBvdGVudGlhbGx5IGJyZWFrIG9uIHdoaXRlc3BhY2UuXG4gKlxuICogSXQgc3VwcG9ydHMgdGhlIGZvbGxvd2luZyBtYXJrdXAgYW5kIGZlYXR1cmVzIGluIHRoZSBzdHJpbmcgY29udGVudCAoaW4gYWRkaXRpb24gdG8gb3RoZXIgb3B0aW9ucyBhcyBsaXN0ZWQgaW5cbiAqIFJJQ0hfVEVYVF9PUFRJT05fS0VZUyk6XG4gKiAtIDxhIGhyZWY9XCJ7e3BsYWNlaG9sZGVyfX1cIj4gZm9yIGxpbmtzIChwYXNzIGluIHsgbGlua3M6IHsgcGxhY2Vob2xkZXI6IEFDVFVBTF9IUkVGIH0gfSlcbiAqIC0gPGI+IGFuZCA8c3Ryb25nPiBmb3IgYm9sZCB0ZXh0XG4gKiAtIDxpPiBhbmQgPGVtPiBmb3IgaXRhbGljIHRleHRcbiAqIC0gPHN1Yj4gYW5kIDxzdXA+IGZvciBzdWJzY3JpcHRzIC8gc3VwZXJzY3JpcHRzXG4gKiAtIDx1PiBmb3IgdW5kZXJsaW5lZCB0ZXh0XG4gKiAtIDxzPiBmb3Igc3RyaWtldGhyb3VnaCB0ZXh0XG4gKiAtIDxzcGFuPiB0YWdzIHdpdGggYSBkaXI9XCJsdHJcIiAvIGRpcj1cInJ0bFwiIGF0dHJpYnV0ZVxuICogLSA8YnI+IGZvciBleHBsaWNpdCBsaW5lIGJyZWFrc1xuICogLSA8bm9kZSBpZD1cImlkXCI+IGZvciBlbWJlZGRpbmcgYSBOb2RlIGludG8gdGhlIHRleHQgKHBhc3MgaW4geyBub2RlczogeyBpZDogTk9ERSB9IH0pLCB3aXRoIG9wdGlvbmFsIGFsaWduIGF0dHJpYnV0ZVxuICogLSBDdXN0b20gU2NlbmVyeSB3cmFwcGluZyBhcm91bmQgYXJiaXRyYXJ5IHRhZ3MsIGUuZy4gPGJsdXI+Li4uPC9ibHVyPiwgcGFzcyBpbiB7IHRhZ3M6IHsgYmx1cjogLi4uIH0gfSwgc2VlIGJlbG93XG4gKiAtIFVuaWNvZGUgYmlkaXJlY3Rpb25hbCBtYXJrcyAocHJlc2VudCBpbiBQaEVUIHN0cmluZ3MpIGZvciBmdWxsIFJUTCBzdXBwb3J0XG4gKiAtIENTUyBzdHlsZT1cIi4uLlwiIGF0dHJpYnV0ZXMsIHdpdGggY29sb3IgYW5kIGZvbnQgc2V0dGluZ3MsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODA3XG4gKlxuICogRXhhbXBsZXMgZnJvbSB0aGUgc2NlbmVyeS1waGV0IGRlbW86XG4gKlxuICogbmV3IFJpY2hUZXh0KCAnUmljaFRleHQgY2FuIGhhdmUgPGI+Ym9sZDwvYj4gYW5kIDxpPml0YWxpYzwvaT4gdGV4dC4nICksXG4gKiBuZXcgUmljaFRleHQoICdDYW4gZG8gSDxzdWI+Mjwvc3ViPk8gKEE8c3ViPnN1Yjwvc3ViPiBhbmQgQTxzdXA+c3VwPC9zdXA+KSwgb3IgbmVzdGluZzogeDxzdXA+MjxzdXA+Mjwvc3VwPjwvc3VwPicgKSxcbiAqIG5ldyBSaWNoVGV4dCggJ0FkZGl0aW9uYWxseTogPHNwYW4gc3R5bGU9XCJjb2xvcjogYmx1ZTtcIj5jb2xvcjwvc3Bhbj4sIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAzMHB4O1wiPnNpemVzPC9zcGFuPiwgPHNwYW4gc3R5bGU9XCJmb250LWZhbWlseTogc2VyaWY7XCI+ZmFjZXM8L3NwYW4+LCA8cz5zdHJpa2V0aHJvdWdoPC9zPiwgYW5kIDx1PnVuZGVybGluZTwvdT4nICksXG4gKiBuZXcgUmljaFRleHQoICdUaGVzZSA8Yj48ZW0+Y2FuPC9lbT4gPHU+PHNwYW4gc3R5bGU9XCJjb2xvcjogcmVkO1wiPmJlPC9zcGFuPiBtaXhlZDxzdXA+MTwvc3VwPjwvdT48L2I+LicgKSxcbiAqIG5ldyBSaWNoVGV4dCggJ1xcdTIwMmFIYW5kbGVzIGJpZGlyZWN0aW9uYWwgdGV4dDogXFx1MjAyYjxzcGFuIHN0eWxlPVwiY29sb3I6ICMwYTA7XCI+2YXZgtin2KjYtjwvc3Bhbj4g2KfZhNmG2LUg2KvZhtin2KbZiiA8Yj7Yp9mE2KfYqtis2KfZhzwvYj48c3ViPjI8L3N1Yj5cXHUyMDJjXFx1MjAyYycgKSxcbiAqIG5ldyBSaWNoVGV4dCggJ1xcdTIwMmJcXHUwNjJhXFx1MDYzM1xcdTA2MmEgKFxcdTA2MzJcXHUwNjI4XFx1MDYyN1xcdTA2NDYpXFx1MjAyYycgKSxcbiAqIG5ldyBSaWNoVGV4dCggJ0hUTUwgZW50aXRpZXMgbmVlZCB0byBiZSBlc2NhcGVkLCBsaWtlICZhbXA7IGFuZCAmbHQ7LicgKSxcbiAqIG5ldyBSaWNoVGV4dCggJ1N1cHBvcnRzIDxhIGhyZWY9XCJ7e3BoZXRXZWJzaXRlfX1cIj48ZW0+bGlua3M8L2VtPiB3aXRoIDxiPm1hcmt1cDwvYj48L2E+LCBhbmQgPGEgaHJlZj1cInt7Y2FsbGJhY2t9fVwiPmxpbmtzIHRoYXQgY2FsbCBmdW5jdGlvbnM8L2E+LicsIHtcbiAqICAgbGlua3M6IHtcbiAqICAgICBwaGV0V2Vic2l0ZTogJ2h0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUnLFxuICogICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAqICAgICAgIGNvbnNvbGUubG9nKCAnTGluayB3YXMgY2xpY2tlZCcgKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH0gKSxcbiAqIG5ldyBSaWNoVGV4dCggJ09yIGFsc28gPGEgaHJlZj1cImh0dHBzOi8vcGhldC5jb2xvcmFkby5lZHVcIj5saW5rcyBkaXJlY3RseSBpbiB0aGUgc3RyaW5nPC9hPi4nLCB7XG4gKiAgIGxpbmtzOiB0cnVlXG4gKiB9ICksXG4gKiBuZXcgUmljaFRleHQoICdMaW5rcyBub3QgZm91bmQgPGEgaHJlZj1cInt7Ym9ndXN9fVwiPmFyZSBpZ25vcmVkPC9hPiBmb3Igc2VjdXJpdHkuJyApLFxuICogbmV3IEhCb3goIHtcbiAqICAgc3BhY2luZzogMzAsXG4gKiAgIGNoaWxkcmVuOiBbXG4gKiAgICAgbmV3IFJpY2hUZXh0KCAnTXVsdGktbGluZSB0ZXh0IHdpdGggdGhlPGJyPnNlcGFyYXRvciAmbHQ7YnImZ3Q7IGFuZCA8YSBocmVmPVwiaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdVwiPmhhbmRsZXM8YnI+bGlua3M8L2E+IGFuZCBvdGhlciA8Yj50YWdzPGJyPmFjcm9zcyBsaW5lczwvYj4nLCB7XG4gKiAgICAgICBsaW5rczogdHJ1ZVxuICogICAgIH0gKSxcbiAqICAgICBuZXcgUmljaFRleHQoICdTdXBwb3NlZGx5IFJpY2hUZXh0IHN1cHBvcnRzIGxpbmUgd3JhcHBpbmcuIEhlcmUgaXMgYSBsaW5lV3JhcCBvZiAzMDAsIHdoaWNoIHNob3VsZCBwcm9iYWJseSB3cmFwIG11bHRpcGxlIHRpbWVzIGhlcmUnLCB7IGxpbmVXcmFwOiAzMDAgfSApXG4gKiAgIF1cbiAqIH0gKVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCB7IFByb3BlcnR5T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xuaW1wb3J0IFRpbnlGb3J3YXJkaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55Rm9yd2FyZGluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgUmVxdWlyZWRPcHRpb24gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1JlcXVpcmVkT3B0aW9uLmpzJztcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IHBoZXRpb0VsZW1lbnRTZWxlY3Rpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvcGhldGlvRWxlbWVudFNlbGVjdGlvblByb3BlcnR5LmpzJztcbmltcG9ydCAnLi4vLi4vLi4vc2hlcnBhL2xpYi9oaW1hbGF5YS0xLjEuMC5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IHsgYWxsb3dMaW5rc1Byb3BlcnR5LCBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiwgQ29sb3IsIEZvbnQsIGdldExpbmVCcmVha1JhbmdlcywgSGltYWxheWFOb2RlLCBpc0hpbWFsYXlhRWxlbWVudE5vZGUsIGlzSGltYWxheWFUZXh0Tm9kZSwgTGluZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFJpY2hUZXh0Q2xlYW5hYmxlTm9kZSwgUmljaFRleHRFbGVtZW50LCBSaWNoVGV4dExlYWYsIFJpY2hUZXh0TGluaywgUmljaFRleHROb2RlLCBSaWNoVGV4dFV0aWxzLCBSaWNoVGV4dFZlcnRpY2FsU3BhY2VyLCBzY2VuZXJ5LCBUZXh0LCBUZXh0Qm91bmRzTWV0aG9kLCBUUGFpbnQsIFdpZHRoU2l6YWJsZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vLyBAdHMtZXhwZWN0LWVycm9yIC0gU2luY2UgaGltYWxheWEgaXNuJ3QgaW4gdHNjb25maWdcbmNvbnN0IGhpbWFsYXlhVmFyID0gaGltYWxheWE7XG5hc3NlcnQgJiYgYXNzZXJ0KCBoaW1hbGF5YVZhciwgJ2hpbWFsYXlhIGRlcGVuZGVuY3kgbmVlZGVkIGZvciBSaWNoVGV4dC4nICk7XG5cbi8vIE9wdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCBpbiB0aGUgY29uc3RydWN0b3IsIHdpdGggbXV0YXRlKCksIG9yIGRpcmVjdGx5IGFzIHNldHRlcnMvZ2V0dGVyc1xuLy8gZWFjaCBvZiB0aGVzZSBvcHRpb25zIGhhcyBhbiBhc3NvY2lhdGVkIHNldHRlciwgc2VlIHNldHRlciBtZXRob2RzIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbmNvbnN0IFJJQ0hfVEVYVF9PUFRJT05fS0VZUyA9IFtcbiAgJ2JvdW5kc01ldGhvZCcsXG4gICdmb250JyxcbiAgJ2ZpbGwnLFxuICAnc3Ryb2tlJyxcbiAgJ2xpbmVXaWR0aCcsXG4gICdzdWJTY2FsZScsXG4gICdzdWJYU3BhY2luZycsXG4gICdzdWJZT2Zmc2V0JyxcbiAgJ3N1cFNjYWxlJyxcbiAgJ3N1cFhTcGFjaW5nJyxcbiAgJ3N1cFlPZmZzZXQnLFxuICAnY2FwSGVpZ2h0U2NhbGUnLFxuICAndW5kZXJsaW5lTGluZVdpZHRoJyxcbiAgJ3VuZGVybGluZUhlaWdodFNjYWxlJyxcbiAgJ3N0cmlrZXRocm91Z2hMaW5lV2lkdGgnLFxuICAnc3RyaWtldGhyb3VnaEhlaWdodFNjYWxlJyxcbiAgJ2xpbmtGaWxsJyxcbiAgJ2xpbmtFdmVudHNIYW5kbGVkJyxcbiAgJ2xpbmtzJyxcbiAgJ25vZGVzJyxcbiAgJ3RhZ3MnLFxuICAncmVwbGFjZU5ld2xpbmVzJyxcbiAgJ2FsaWduJyxcbiAgJ2xlYWRpbmcnLFxuICAnbGluZVdyYXAnLFxuICBUZXh0LlNUUklOR19QUk9QRVJUWV9OQU1FLFxuICAnc3RyaW5nJ1xuXTtcblxuZXhwb3J0IHR5cGUgUmljaFRleHRBbGlnbiA9ICdsZWZ0JyB8ICdjZW50ZXInIHwgJ3JpZ2h0JztcbmV4cG9ydCB0eXBlIFJpY2hUZXh0SHJlZiA9ICggKCkgPT4gdm9pZCApIHwgc3RyaW5nO1xudHlwZSBSaWNoVGV4dExpbmtzT2JqZWN0ID0gUmVjb3JkPHN0cmluZywgUmljaFRleHRIcmVmPjtcbmV4cG9ydCB0eXBlIFJpY2hUZXh0TGlua3MgPSBSaWNoVGV4dExpbmtzT2JqZWN0IHwgdHJ1ZTtcblxuLy8gVXNlZCBvbmx5IGZvciBndWFyZGluZyBhZ2FpbnN0IGFzc2VydGlvbnMsIHdlIHdhbnQgdG8ga25vdyB0aGF0IHdlIGFyZW4ndCBpbiBzdHJpbmdUZXN0aW5nIG1vZGVcbmNvbnN0IGlzU3RyaW5nVGVzdCA9IHdpbmRvdy5RdWVyeVN0cmluZ01hY2hpbmUgJiYgUXVlcnlTdHJpbmdNYWNoaW5lLmNvbnRhaW5zS2V5KCAnc3RyaW5nVGVzdCcgKTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgLy8gU2V0cyBob3cgYm91bmRzIGFyZSBkZXRlcm1pbmVkIGZvciB0ZXh0XG4gIGJvdW5kc01ldGhvZD86IFRleHRCb3VuZHNNZXRob2Q7XG5cbiAgLy8gU2V0cyB0aGUgZm9udCBmb3IgdGhlIHRleHRcbiAgZm9udD86IEZvbnQgfCBzdHJpbmc7XG5cbiAgLy8gU2V0cyB0aGUgZmlsbCBvZiB0aGUgdGV4dFxuICBmaWxsPzogVFBhaW50O1xuXG4gIC8vIFNldHMgdGhlIHN0cm9rZSBhcm91bmQgdGhlIHRleHRcbiAgc3Ryb2tlPzogVFBhaW50O1xuXG4gIC8vIFNldHMgdGhlIGxpbmVXaWR0aCBhcm91bmQgdGhlIHRleHRcbiAgbGluZVdpZHRoPzogbnVtYmVyO1xuXG4gIC8vIFNldHMgdGhlIHNjYWxlIG9mIGFueSBzdWJzY3JpcHQgZWxlbWVudHNcbiAgc3ViU2NhbGU/OiBudW1iZXI7XG5cbiAgLy8gU2V0cyBob3Jpem9udGFsIHNwYWNpbmcgYmVmb3JlIGFueSBzdWJzY3JpcHQgZWxlbWVudHNcbiAgc3ViWFNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gU2V0cyB2ZXJ0aWNhbCBvZmZzZXQgZm9yIGFueSBzdWJzY3JpcHQgZWxlbWVudHNcbiAgc3ViWU9mZnNldD86IG51bWJlcjtcblxuICAvLyBTZXRzIHRoZSBzY2FsZSBmb3IgYW55IHN1cGVyc2NyaXB0IGVsZW1lbnRzXG4gIHN1cFNjYWxlPzogbnVtYmVyO1xuXG4gIC8vIFNldHMgdGhlIGhvcml6b250YWwgb2Zmc2V0IGJlZm9yZSBhbnkgc3VwZXJzY3JpcHQgZWxlbWVudHNcbiAgc3VwWFNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gU2V0cyB0aGUgdmVydGljYWwgb2Zmc2V0IGZvciBhbnkgc3VwZXJzY3JpcHQgZWxlbWVudHNcbiAgc3VwWU9mZnNldD86IG51bWJlcjtcblxuICAvLyBTZXRzIHRoZSBleHBlY3RlZCBjYXAgaGVpZ2h0IGNhcCBoZWlnaHQgKGJhc2VsaW5lIHRvIHRvcCBvZiBjYXBpdGFsIGxldHRlcnMpIGFzIGEgc2NhbGVcbiAgY2FwSGVpZ2h0U2NhbGU/OiBudW1iZXI7XG5cbiAgLy8gU2V0cyB0aGUgbGluZSB3aWR0aCBmb3IgdW5kZXJsaW5lc1xuICB1bmRlcmxpbmVMaW5lV2lkdGg/OiBudW1iZXI7XG5cbiAgLy8gU2V0cyB0aGUgdW5kZXJsaW5lIGhlaWdodCBhcyBhIHNjYWxlIHJlbGF0aXZlIHRvIHRleHQgYm91bmRzIGhlaWdodFxuICB1bmRlcmxpbmVIZWlnaHRTY2FsZT86IG51bWJlcjtcblxuICAvLyBTZXRzIGxpbmUgd2lkdGggZm9yIHN0cmlrZXRocm91Z2hcbiAgc3RyaWtldGhyb3VnaExpbmVXaWR0aD86IG51bWJlcjtcblxuICAvLyBTZXRzIGhlaWdodCBvZiBzdHJpa2V0aHJvdWdoIGFzIGEgc2NhbGUgcmVsYXRpdmUgdG8gdGV4dCBib3VuZHMgaGVpZ2h0XG4gIHN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZT86IG51bWJlcjtcblxuICAvLyBTZXRzIHRoZSBmaWxsIGZvciBsaW5rcyB3aXRoaW4gdGhlIHRleHRcbiAgbGlua0ZpbGw/OiBUUGFpbnQ7XG5cbiAgLy8gU2V0cyB3aGV0aGVyIGxpbmsgY2xpY2tzIHdpbGwgY2FsbCBldmVudC5oYW5kbGUoKVxuICBsaW5rRXZlbnRzSGFuZGxlZD86IGJvb2xlYW47XG5cbiAgLy8gU2V0cyB0aGUgbWFwIG9mIGhyZWYgcGxhY2Vob2xkZXIgPT4gYWN0dWFsIGhyZWYvY2FsbGJhY2sgdXNlZCBmb3IgbGlua3MuIEhvd2V2ZXIsIGlmIHNldCB0byB0cnVlICh7Ym9vbGVhbn0pIGFzIGFcbiAgLy8gZnVsbCBvYmplY3QsIGxpbmtzIGluIHRoZSBzdHJpbmcgd2lsbCBub3QgYmUgbWFwcGVkLCBidXQgd2lsbCBiZSBkaXJlY3RseSBhZGRlZC5cbiAgLy9cbiAgLy8gRm9yIGluc3RhbmNlLCB0aGUgZGVmYXVsdCBpcyB0byBtYXAgaHJlZnMgZm9yIHNlY3VyaXR5IHB1cnBvc2VzOlxuICAvL1xuICAvLyBuZXcgUmljaFRleHQoICc8YSBocmVmPVwie3thbGlua319XCI+Y29udGVudDwvYT4nLCB7XG4gIC8vICAgbGlua3M6IHtcbiAgLy8gICAgIGFsaW5rOiAnaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdSdcbiAgLy8gICB9XG4gIC8vIH0gKTtcbiAgLy9cbiAgLy8gQnV0IGxpbmtzIHdpdGggYW4gaHJlZiBub3QgbWF0Y2hpbmcgd2lsbCBiZSBpZ25vcmVkLiBUaGlzIGNhbiBiZSBhdm9pZGVkIGJ5IHBhc3NpbmcgbGlua3M6IHRydWUgdG8gZGlyZWN0bHlcbiAgLy8gZW1iZWQgbGlua3M6XG4gIC8vXG4gIC8vIG5ldyBSaWNoVGV4dCggJzxhIGhyZWY9XCJodHRwczovL3BoZXQuY29sb3JhZG8uZWR1XCI+Y29udGVudDwvYT4nLCB7IGxpbmtzOiB0cnVlIH0gKTtcbiAgLy9cbiAgLy8gQ2FsbGJhY2tzIChpbnN0ZWFkIG9mIGEgVVJMKSBhcmUgYWxzbyBzdXBwb3J0ZWQsIGUuZy46XG4gIC8vXG4gIC8vIG5ldyBSaWNoVGV4dCggJzxhIGhyZWY9XCJ7e2FjYWxsYmFja319XCI+Y29udGVudDwvYT4nLCB7XG4gIC8vICAgbGlua3M6IHtcbiAgLy8gICAgIGFjYWxsYmFjazogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCAnY2xpY2tlZCcgKSB9XG4gIC8vICAgfVxuICAvLyB9ICk7XG4gIC8vXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8zMTYgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIGxpbmtzPzogUmljaFRleHRMaW5rcztcblxuICAvLyBBIG1hcCBvZiBzdHJpbmcgPT4gTm9kZSwgd2hlcmUgYDxub2RlIGlkPVwic3RyaW5nXCIvPmAgd2lsbCBnZXQgcmVwbGFjZWQgYnkgdGhlIGdpdmVuIE5vZGUgKERBRyBzdXBwb3J0ZWQpXG4gIC8vXG4gIC8vIEZvciBleGFtcGxlOlxuICAvL1xuICAvLyBuZXcgUmljaFRleHQoICdUaGlzIGlzIGEgPG5vZGUgaWQ9XCJ0ZXN0XCIvPicsIHtcbiAgLy8gICBub2Rlczoge1xuICAvLyAgICAgdGVzdDogbmV3IFRleHQoICdOb2RlJyApXG4gIC8vICAgfVxuICAvLyB9XG4gIC8vXG4gIC8vIEFsaWdubWVudCBpcyBhbHNvIHN1cHBvcnRlZCwgd2l0aCB0aGUgYWxpZ24gYXR0cmlidXRlIChjZW50ZXIvdG9wL2JvdHRvbS9vcmlnaW4pLlxuICAvLyBUaGlzIGFsaWdubWVudCBpcyBpbiByZWxhdGlvbiB0byB0aGUgY3VycmVudCB0ZXh0L2ZvbnQgc2l6ZSBpbiB0aGUgSFRNTCB3aGVyZSB0aGUgPG5vZGU+IHRhZyBpcyBwbGFjZWQuXG4gIC8vIEFuIGV4YW1wbGU6XG4gIC8vXG4gIC8vIG5ldyBSaWNoVGV4dCggJ1RoaXMgaXMgYSA8bm9kZSBpZD1cInRlc3RcIiBhbGlnbj1cInRvcFwiLz4nLCB7XG4gIC8vICAgbm9kZXM6IHtcbiAgLy8gICAgIHRlc3Q6IG5ldyBUZXh0KCAnTm9kZScgKVxuICAvLyAgIH1cbiAgLy8gfVxuICAvLyBOT1RFOiBXaGVuIGFsaWdubWVudCBpc24ndCBzdXBwbGllZCwgb3JpZ2luIGlzIHVzZWQgYXMgYSBkZWZhdWx0LiBPcmlnaW4gbWVhbnMgXCJ5PTAgaXMgcGxhY2VkIGF0IHRoZSBiYXNlbGluZSBvZlxuICAvLyB0aGUgdGV4dFwiLlxuICBub2Rlcz86IFJlY29yZDxzdHJpbmcsIE5vZGU+O1xuXG4gIC8vIEEgbWFwIG9mIHN0cmluZyA9PiBOb2RlIHJlcGxhY2VtZW50IGZ1bmN0aW9uICggbm9kZTogTm9kZSApID0+IE5vZGUsIHdoZXJlIFJpY2hUZXh0IHdpbGwgXCJyZW5kZXJcIiBsaW5lIGNvbnRlbnRcbiAgLy8gaW5zaWRlIHRoZSB0YWcsIGFuZCB0aGVuIHBhc3MgaXQgdG8gdGhlIGZ1bmN0aW9uIHRvIHJlcGxhY2UgdGhlIGNvbnRlbnQgb2YgdGhlIE5vZGUuIEVhY2ggdGFnIGZ1bmN0aW9uIHNob3VsZFxuICAvLyByZXR1cm4gYSBuZXcgTm9kZS5cbiAgLy9cbiAgLy8gRm9yIGV4YW1wbGU6XG4gIC8vXG4gIC8vICAgbmV3IFJpY2hUZXh0KCAnVGhlcmUgaXMgPGJsdWU+Ymx1ZSB0ZXh0PC9ibHVlPiBhbmQgPGJsdXI+Ymx1cnJ5IHRleHQ8L2JsdXI+Jywge1xuICAvLyAgICAgdGFnczoge1xuICAvLyAgICAgICBibHVyOiBub2RlID0+IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIG5vZGUgXSwgZmlsdGVyczogWyBuZXcgR2F1c3NpYW5CbHVyKCAxLjUgKSBdIH0gKSxcbiAgLy8gICAgICAgYmx1ZTogbm9kZSA9PiBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBSZWN0YW5nbGUuYm91bmRzKCBub2RlLmJvdW5kcywgeyBmaWxsOiAnIzg4ZicgfSApLCBub2RlIF0gfSApXG4gIC8vICAgICB9XG4gIC8vICAgfSApXG4gIC8vXG4gIC8vIE5PVEU6IFRoaXMgZG9lcyBOT1QgYWZmZWN0IHRoZSBsYXlvdXQgb3IgYm91bmRzIG9mIHRoZSByZXN1bHRpbmcgY29udGVudCwgc2luY2UgdGhlIGxheW91dCBpcyBkb25lIEJFRk9SRSB0aGlzXG4gIC8vIHdyYXBwaW5nIGlzIGRvbmUuIElmIHdlIGV2ZXIgbmVlZCB0aGUgd3JhcHBpbmcgdG8gYmUgZG9uZSBCRUZPUkUsIHRoZSB3cmFwcGluZyB3aWxsIG5lZWQgdG8gYmUgY2FsbGVkIG1hbnkgdGltZXNcbiAgLy8gd2hlbiBsaW5lLXdyYXBwaW5nIGlzIGRvbmUuXG4gIC8vXG4gIC8vIEhlcmUgaXMgYSBtb3JlIGluLWRlcHRoIGV4YW1wbGUgd2l0aCBtYW55IGVsZW1lbnRzOlxuICAvL1xuICAvLyAgIG5ldyBSaWNoVGV4dCggJ1RoaXMgaXMgYSB0ZXN0IHdpdGggPGJsdWU+Ymx1ZTwvYmx1ZT4gdGV4dCBiZWluZyA8Ymx1ZT53cmFwcGVkIGluIGEgYmx1ZSBjb2xvciB0aGF0IHNob3VsZCBzdXBwb3J0IGxpbmUgd3JhcDwvYmx1ZT4uIFRleHQgY2FuIGFsc28gYmUgPHRyYW5zbHVjZW50Pm1vcmUgdHJhbnNwYXJlbnQ8L3RyYW5zbHVjZW50Piwgb3IgY2FuIGJlIDxibHVyPmJsdXJyZWQ8L2JsdXI+IG9yIGhhdmUgPHNoYWRvdz5kcm9wIHNoYWRvdzwvc2hhZG93Pi4gVGFncyBjYW4gYmUgPGJsdWU+cmVwZWF0ZWQgb3IgPGJsdXI+bmVzdGVkPC9ibHVyPjwvYmx1ZT4nLCB7XG4gIC8vICAgICBsaW5lV3JhcDogMzAwLFxuICAvLyAgICAgdGFnczoge1xuICAvLyAgICAgICBibHVyOiBub2RlID0+IHtcbiAgLy8gICAgICAgICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgLy8gICAgICAgICAgIGNoaWxkcmVuOiBbIG5vZGUgXSxcbiAgLy8gICAgICAgICAgIGZpbHRlcnM6IFsgbmV3IEdhdXNzaWFuQmx1ciggMS41ICkgXVxuICAvLyAgICAgICAgIH0gKTtcbiAgLy8gICAgICAgfSxcbiAgLy8gICAgICAgc2hhZG93OiBub2RlID0+IHtcbiAgLy8gICAgICAgICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgLy8gICAgICAgICAgIGNoaWxkcmVuOiBbIG5vZGUgXSxcbiAgLy8gICAgICAgICAgIGZpbHRlcnM6IFsgbmV3IERyb3BTaGFkb3coIG5ldyBWZWN0b3IyKCAyLCAxICksIDIsICdyZWQnICkgXVxuICAvLyAgICAgICAgIH0gKTtcbiAgLy8gICAgICAgfSxcbiAgLy8gICAgICAgdHJhbnNsdWNlbnQ6IG5vZGUgPT4ge1xuICAvLyAgICAgICAgIHJldHVybiBuZXcgTm9kZSgge1xuICAvLyAgICAgICAgICAgY2hpbGRyZW46IFsgbm9kZSBdLFxuICAvLyAgICAgICAgICAgb3BhY2l0eTogMC41XG4gIC8vICAgICAgICAgfSApO1xuICAvLyAgICAgICB9LFxuICAvLyAgICAgICBibHVlOiBub2RlID0+IHtcbiAgLy8gICAgICAgICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgLy8gICAgICAgICAgIGNoaWxkcmVuOiBbXG4gIC8vICAgICAgICAgICAgIFJlY3RhbmdsZS5ib3VuZHMoIG5vZGUuYm91bmRzLmRpbGF0ZWQoIDEgKSwgeyBmaWxsOiAnIzg4ZicgfSApLFxuICAvLyAgICAgICAgICAgICBub2RlXG4gIC8vICAgICAgICAgICBdXG4gIC8vICAgICAgICAgfSApO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9XG4gIC8vICAgfSApXG4gIHRhZ3M/OiBSZWNvcmQ8c3RyaW5nLCAoIG5vZGU6IE5vZGUgKSA9PiBOb2RlPjtcblxuICAvLyBXaWxsIHJlcGxhY2UgbmV3bGluZXMgKGBcXG5gKSB3aXRoIDxicj4sIHNpbWlsYXIgdG8gdGhlIG9sZCBNdWx0aUxpbmVUZXh0IChkZWZhdWx0cyB0byBmYWxzZSlcbiAgcmVwbGFjZU5ld2xpbmVzPzogYm9vbGVhbjtcblxuICAvLyBTZXRzIHRleHQgYWxpZ25tZW50IGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBsaW5lc1xuICBhbGlnbj86IFJpY2hUZXh0QWxpZ247XG5cbiAgLy8gU2V0cyB0aGUgc3BhY2luZyBiZXR3ZWVuIGxpbmVzIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBsaW5lc1xuICBsZWFkaW5nPzogbnVtYmVyO1xuXG4gIC8vIFNldHMgd2lkdGggb2YgdGV4dCBiZWZvcmUgY3JlYXRpbmcgYSBuZXcgbGluZS5cbiAgLy8gV2hlbiBzZXQgdG8gJ3N0cmV0Y2gnIGNvbnRyb2xzIHdoZXRoZXIgaXRzIFdpZHRoU2l6YWJsZS4gSW4gdGhpcyBjYXNlIGl0IHdpbGwgdXNlIHRoZSBwcmVmZXJyZWQgd2lkdGhcbiAgLy8gdG8gZGV0ZXJtaW5lIHRoZSBsaW5lIHdyYXAuXG4gIGxpbmVXcmFwPzogbnVtYmVyIHwgJ3N0cmV0Y2gnIHwgbnVsbDtcblxuICAvLyBTZXRzIGZvcndhcmRpbmcgb2YgdGhlIHN0cmluZ1Byb3BlcnR5LCBzZWUgc2V0U3RyaW5nUHJvcGVydHkoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gIHN0cmluZ1Byb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IG51bGw7XG5cbiAgc3RyaW5nUHJvcGVydHlPcHRpb25zPzogUHJvcGVydHlPcHRpb25zPHN0cmluZz47XG5cbiAgLy8gU2V0cyB0aGUgc3RyaW5nIHRvIGJlIGRpc3BsYXllZCBieSB0aGlzIE5vZGVcbiAgc3RyaW5nPzogc3RyaW5nIHwgbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUmljaFRleHRPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuY29uc3QgREVGQVVMVF9GT05UID0gbmV3IEZvbnQoIHtcbiAgc2l6ZTogMjBcbn0gKTtcblxuLy8gVGFncyB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbiBhY2Nlc3NpYmxlIGlubmVyQ29udGVudCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNDMwXG5jb25zdCBBQ0NFU1NJQkxFX1RBR1MgPSBbXG4gICdiJywgJ3N0cm9uZycsICdpJywgJ2VtJywgJ3N1YicsICdzdXAnLCAndScsICdzJ1xuXTtcblxuLy8gV2hhdCB0eXBlIG9mIGxpbmUtYnJlYWsgc2l0dWF0aW9ucyB3ZSBjYW4gYmUgaW4gZHVyaW5nIG91ciByZWN1cnNpdmUgcHJvY2Vzc1xuY29uc3QgTGluZUJyZWFrU3RhdGUgPSB7XG4gIC8vIFRoZXJlIHdhcyBhIGxpbmUgYnJlYWssIGJ1dCBpdCB3YXMgYXQgdGhlIGVuZCBvZiB0aGUgZWxlbWVudCAob3Igd2FzIGEgPGJyPikuIFRoZSByZWxldmFudCBlbGVtZW50IGNhbiBiZSBmdWxseVxuICAvLyByZW1vdmVkIGZyb20gdGhlIHRyZWUuXG4gIENPTVBMRVRFOiAnQ09NUExFVEUnLFxuXG4gIC8vIFRoZXJlIHdhcyBhIGxpbmUgYnJlYWssIGJ1dCB0aGVyZSBpcyBzb21lIGNvbnRlbnQgbGVmdCBpbiB0aGlzIGVsZW1lbnQgYWZ0ZXIgdGhlIGxpbmUgYnJlYWsuIERPIE5PVCByZW1vdmUgaXQuXG4gIElOQ09NUExFVEU6ICdJTkNPTVBMRVRFJyxcblxuICAvLyBUaGVyZSB3YXMgTk8gbGluZSBicmVha1xuICBOT05FOiAnTk9ORSdcbn07XG5cbi8vIFdlJ2xsIHN0b3JlIGFuIGFycmF5IGhlcmUgdGhhdCB3aWxsIHJlY29yZCB3aGljaCBsaW5rcy9ub2RlcyB3ZXJlIHVzZWQgaW4gdGhlIGxhc3QgcmVidWlsZCAoc28gd2UgY2FuIGFzc2VydCBvdXQgaWZcbi8vIHRoZXJlIHdlcmUgc29tZSB0aGF0IHdlcmUgbm90IHVzZWQpLlxuY29uc3QgdXNlZExpbmtzOiBzdHJpbmdbXSA9IFtdO1xuY29uc3QgdXNlZE5vZGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4vLyBoaW1hbGF5YSBjb252ZXJ0cyBkYXNoIHNlcGFyYXRlZCBDU1MgdG8gY2FtZWwgY2FzZSAtIHVzZSBDU1MgY29tcGF0aWJsZSBzdHlsZSB3aXRoIGRhc2hlcywgc2VlIGFib3ZlIGZvciBleGFtcGxlc1xuY29uc3QgRk9OVF9TVFlMRV9NQVAgPSB7XG4gICdmb250LWZhbWlseSc6ICdmYW1pbHknLFxuICAnZm9udC1zaXplJzogJ3NpemUnLFxuICAnZm9udC1zdHJldGNoJzogJ3N0cmV0Y2gnLFxuICAnZm9udC1zdHlsZSc6ICdzdHlsZScsXG4gICdmb250LXZhcmlhbnQnOiAndmFyaWFudCcsXG4gICdmb250LXdlaWdodCc6ICd3ZWlnaHQnLFxuICAnbGluZS1oZWlnaHQnOiAnbGluZUhlaWdodCdcbn0gYXMgY29uc3Q7XG5cbmNvbnN0IEZPTlRfU1RZTEVfS0VZUyA9IE9iamVjdC5rZXlzKCBGT05UX1NUWUxFX01BUCApIGFzICgga2V5b2YgdHlwZW9mIEZPTlRfU1RZTEVfTUFQIClbXTtcbmNvbnN0IFNUWUxFX0tFWVMgPSBbICdjb2xvcicgXS5jb25jYXQoIEZPTlRfU1RZTEVfS0VZUyApO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSaWNoVGV4dCBleHRlbmRzIFdpZHRoU2l6YWJsZSggTm9kZSApIHtcblxuICAvLyBUaGUgc3RyaW5nIHRvIGRpc3BsYXkuIFdlJ2xsIGluaXRpYWxpemUgdGhpcyBieSBtdXRhdGluZy5cbiAgcHJpdmF0ZSByZWFkb25seSBfc3RyaW5nUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8c3RyaW5nPjtcblxuICBwcml2YXRlIF9mb250OiBGb250IHwgc3RyaW5nID0gREVGQVVMVF9GT05UO1xuICBwcml2YXRlIF9ib3VuZHNNZXRob2Q6IFRleHRCb3VuZHNNZXRob2QgPSAnaHlicmlkJztcbiAgcHJpdmF0ZSBfZmlsbDogVFBhaW50ID0gJyMwMDAwMDAnO1xuICBwcml2YXRlIF9zdHJva2U6IFRQYWludCA9IG51bGw7XG4gIHByaXZhdGUgX2xpbmVXaWR0aCA9IDE7XG5cbiAgcHJpdmF0ZSBfc3ViU2NhbGUgPSAwLjc1O1xuICBwcml2YXRlIF9zdWJYU3BhY2luZyA9IDA7XG4gIHByaXZhdGUgX3N1YllPZmZzZXQgPSAwO1xuXG4gIHByaXZhdGUgX3N1cFNjYWxlID0gMC43NTtcbiAgcHJpdmF0ZSBfc3VwWFNwYWNpbmcgPSAwO1xuICBwcml2YXRlIF9zdXBZT2Zmc2V0ID0gMDtcblxuICBwcml2YXRlIF9jYXBIZWlnaHRTY2FsZSA9IDAuNzU7XG5cbiAgcHJpdmF0ZSBfdW5kZXJsaW5lTGluZVdpZHRoID0gMTtcbiAgcHJpdmF0ZSBfdW5kZXJsaW5lSGVpZ2h0U2NhbGUgPSAwLjE1O1xuXG4gIHByaXZhdGUgX3N0cmlrZXRocm91Z2hMaW5lV2lkdGggPSAxO1xuICBwcml2YXRlIF9zdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUgPSAwLjM7XG5cbiAgcHJpdmF0ZSBfbGlua0ZpbGw6IFRQYWludCA9ICdyZ2IoMjcsMCwyNDEpJztcblxuICBwcml2YXRlIF9saW5rRXZlbnRzSGFuZGxlZCA9IGZhbHNlO1xuXG4gIC8vIElmIGFuIG9iamVjdCwgdmFsdWVzIGFyZSBlaXRoZXIge3N0cmluZ30gb3Ige2Z1bmN0aW9ufVxuICBwcml2YXRlIF9saW5rczogUmljaFRleHRMaW5rcyA9IHt9O1xuXG4gIHByaXZhdGUgX25vZGVzOiBSZWNvcmQ8c3RyaW5nLCBOb2RlPiA9IHt9O1xuICBwcml2YXRlIF90YWdzOiBSZWNvcmQ8c3RyaW5nLCAoIG5vZGU6IE5vZGUgKSA9PiBOb2RlPiA9IHt9O1xuXG4gIHByaXZhdGUgX3JlcGxhY2VOZXdsaW5lcyA9IGZhbHNlO1xuICBwcml2YXRlIF9hbGlnbjogUmljaFRleHRBbGlnbiA9ICdsZWZ0JztcbiAgcHJpdmF0ZSBfbGVhZGluZyA9IDA7XG4gIHByaXZhdGUgX2xpbmVXcmFwOiBSZXF1aXJlZE9wdGlvbjxTZWxmT3B0aW9ucywgJ2xpbmVXcmFwJz4gPSBudWxsO1xuXG4gIC8vIFdlIG5lZWQgdG8gY29uc29saWRhdGUgbGlua3MgKHRoYXQgY291bGQgYmUgc3BsaXQgYWNyb3NzIG11bHRpcGxlIGxpbmVzKSB1bmRlciBvbmUgXCJsaW5rXCIgbm9kZSwgc28gd2UgdHJhY2sgY3JlYXRlZFxuICAvLyBsaW5rIGZyYWdtZW50cyBoZXJlIHNvIHRoZXkgY2FuIGdldCBwaWVjZWQgdG9nZXRoZXIgbGF0ZXIuXG4gIHByaXZhdGUgX2xpbmtJdGVtczogeyBlbGVtZW50OiBIaW1hbGF5YU5vZGU7IG5vZGU6IE5vZGU7IGhyZWY6IFJpY2hUZXh0SHJlZiB9W10gPSBbXTtcblxuICAvLyBXaGV0aGVyIHNvbWV0aGluZyBoYXMgYmVlbiBhZGRlZCB0byB0aGlzIGxpbmUgeWV0LiBXZSBkb24ndCB3YW50IHRvIGluZmluaXRlLWxvb3Agb3V0IGlmIHNvbWV0aGluZyBpcyBsb25nZXIgdGhhblxuICAvLyBvdXIgbGluZVdyYXAsIHNvIHdlJ2xsIHBsYWNlIG9uZSBpdGVtIG9uIGl0cyBvd24gb24gYW4gb3RoZXJ3aXNlIGVtcHR5IGxpbmUuXG4gIHByaXZhdGUgX2hhc0FkZGVkTGVhZlRvTGluZSA9IGZhbHNlO1xuXG4gIC8vIE5vcm1hbCBsYXlvdXQgY29udGFpbmVyIG9mIGxpbmVzIChzZXBhcmF0ZSwgc28gd2UgY2FuIGNsZWFyIGl0IGVhc2lseSlcbiAgcHJpdmF0ZSBsaW5lQ29udGFpbmVyOiBOb2RlO1xuXG4gIC8vIEZvciBsaW5lV3JhcDpzdHJldGNoLCB3ZSdsbCBuZWVkIHRvIGNvbXB1dGUgYSBuZXcgbWluaW11bSB3aWR0aCBmb3IgdGhlIFJpY2hUZXh0LCBzbyB0aGVzZSBjb250cm9sXG4gIC8vIChhKSB3aGV0aGVyIHdlJ3JlIGNvbXB1dGluZyB0aGlzIChpdCBkb2VzIGEgbG90IG9mIHVubmVjZXNzYXJ5IHdvcmsgb3RoZXJ3aXNlIGlmIHdlIGRvbid0IG5lZWQgaXQpLCBhbmQgKGIpXG4gIC8vIHRoZSBhY3R1YWwgbWluaW11bVdpZHRoIHRoYXQgd2UnbGwgaGF2ZS5cbiAgcHJpdmF0ZSBuZWVkUGVuZGluZ01pbmltdW1XaWR0aCA9IGZhbHNlO1xuICBwcml2YXRlIHBlbmRpbmdNaW5pbXVtV2lkdGggPSAwO1xuXG4gIC8vIFRleHQgYW5kIFJpY2hUZXh0IGN1cnJlbnRseSB1c2UgdGhlIHNhbWUgdGFuZGVtIG5hbWUgZm9yIHRoZWlyIHN0cmluZ1Byb3BlcnR5LlxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSA9IFRleHQuU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RyaW5nOiBzdHJpbmcgfCBudW1iZXIgfCBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBwcm92aWRlZE9wdGlvbnM/OiBSaWNoVGV4dE9wdGlvbnMgKSB7XG5cbiAgICAvLyBXZSBvbmx5IGZpbGwgaW4gc29tZSBkZWZhdWx0cywgc2luY2UgdGhlIG90aGVyIGRlZmF1bHRzIGFyZSBkZWZpbmVkIGJlbG93IChhbmQgbXV0YXRlIGlzIHJlbGllZCBvbilcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJpY2hUZXh0T3B0aW9ucywgUGljazxTZWxmT3B0aW9ucywgJ2ZpbGwnPiwgTm9kZU9wdGlvbnM+KCkoIHtcbiAgICAgIGZpbGw6ICcjMDAwMDAwJyxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1RleHQnLFxuICAgICAgcGhldGlvVHlwZTogUmljaFRleHQuUmljaFRleHRJTyxcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGlmICggdHlwZW9mIHN0cmluZyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHN0cmluZyA9PT0gJ251bWJlcicgKSB7XG4gICAgICBvcHRpb25zLnN0cmluZyA9IHN0cmluZztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBvcHRpb25zLnN0cmluZ1Byb3BlcnR5ID0gc3RyaW5nO1xuICAgIH1cblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9zdHJpbmdQcm9wZXJ0eSA9IG5ldyBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5KCAnJywgdHJ1ZSwgdGhpcy5vblN0cmluZ1Byb3BlcnR5Q2hhbmdlLmJpbmQoIHRoaXMgKSApO1xuXG4gICAgdGhpcy5saW5lQ29udGFpbmVyID0gbmV3IE5vZGUoIHt9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5saW5lQ29udGFpbmVyICk7XG5cbiAgICAvLyBJbml0aWFsaXplIHRvIGFuIGVtcHR5IHN0YXRlLCBzbyB3ZSBhcmUgaW1tZWRpYXRlbHkgdmFsaWQgKHNpbmNlIG5vdyB3ZSBuZWVkIHRvIGNyZWF0ZSBhbiBlbXB0eSBsZWFmIGV2ZW4gaWYgd2VcbiAgICAvLyBoYXZlIGVtcHR5IHRleHQpLlxuICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XG5cbiAgICB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4gdGhpcy5yZWJ1aWxkUmljaFRleHQoKSApO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIC8vIERlY29yYXRpbmcgd2l0aCBhZGRpdGlvbmFsIGNvbnRlbnQgaXMgYW4gYW50aS1wYXR0ZXJuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvODYwXG4gICAgYXNzZXJ0ICYmIGFzc2VydE5vQWRkaXRpb25hbENoaWxkcmVuKCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gb3VyIHN0cmluZ1Byb3BlcnR5IGNoYW5nZXMgdmFsdWVzLlxuICAgKi9cbiAgcHJpdmF0ZSBvblN0cmluZ1Byb3BlcnR5Q2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGRvY3VtZW50YXRpb24gZm9yIE5vZGUuc2V0VmlzaWJsZVByb3BlcnR5LCBleGNlcHQgdGhpcyBpcyBmb3IgdGhlIHRleHQgc3RyaW5nLlxuICAgKlxuICAgKiBOT1RFOiBTZXR0aW5nIHRoZSAuc3RyaW5nIGFmdGVyIHBhc3NpbmcgYSB0cnVseSByZWFkLW9ubHkgUHJvcGVydHkgd2lsbCBmYWlsIGF0IHJ1bnRpbWUuIFdlIGNob29zZSB0byBhbGxvdyBwYXNzaW5nXG4gICAqIGluIHJlYWQtb25seSBQcm9wZXJ0aWVzIGZvciBjb252ZW5pZW5jZS5cbiAgICovXG4gIHB1YmxpYyBzZXRTdHJpbmdQcm9wZXJ0eSggbmV3VGFyZ2V0OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHwgbnVsbCApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5nUHJvcGVydHkuc2V0VGFyZ2V0UHJvcGVydHkoIG5ld1RhcmdldCBhcyBUUHJvcGVydHk8c3RyaW5nPiwgdGhpcywgUmljaFRleHQuU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FICk7XG4gIH1cblxuICBwdWJsaWMgc2V0IHN0cmluZ1Byb3BlcnR5KCBwcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IG51bGwgKSB7IHRoaXMuc2V0U3RyaW5nUHJvcGVydHkoIHByb3BlcnR5ICk7IH1cblxuICBwdWJsaWMgZ2V0IHN0cmluZ1Byb3BlcnR5KCk6IFRQcm9wZXJ0eTxzdHJpbmc+IHsgcmV0dXJuIHRoaXMuZ2V0U3RyaW5nUHJvcGVydHkoKTsgfVxuXG4gIC8qKlxuICAgKiBMaWtlIE5vZGUuZ2V0VmlzaWJsZVByb3BlcnR5LCBidXQgZm9yIHRoZSB0ZXh0IHN0cmluZy4gTm90ZSB0aGlzIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgUHJvcGVydHkgcHJvdmlkZWQgaW5cbiAgICogc2V0U3RyaW5nUHJvcGVydHkuIFRodXMgaXMgdGhlIG5hdHVyZSBvZiBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5LlxuICAgKi9cbiAgcHVibGljIGdldFN0cmluZ1Byb3BlcnR5KCk6IFRQcm9wZXJ0eTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5nUHJvcGVydHk7XG4gIH1cblxuICAvKipcbiAgICogUmljaFRleHQgc3VwcG9ydHMgYSBcInN0cmluZ1wiIHNlbGVjdGlvbiBtb2RlLCBpbiB3aGljaCBpdCB3aWxsIG1hcCB0byBpdHMgc3RyaW5nUHJvcGVydHkgKGlmIGFwcGxpY2FibGUpLCBvdGhlcndpc2UgaXNcbiAgICogdXNlcyB0aGUgZGVmYXVsdCBtb3VzZS1oaXQgdGFyZ2V0IGZyb20gdGhlIHN1cGVydHlwZS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCggZnJvbUxpbmtpbmcgPSBmYWxzZSApOiBQaGV0aW9PYmplY3QgfCAncGhldGlvTm90U2VsZWN0YWJsZScge1xuICAgIHJldHVybiBwaGV0aW9FbGVtZW50U2VsZWN0aW9uUHJvcGVydHkudmFsdWUgPT09ICdzdHJpbmcnID9cbiAgICAgICAgICAgdGhpcy5nZXRTdHJpbmdQcm9wZXJ0eVBoZXRpb01vdXNlSGl0VGFyZ2V0KCBmcm9tTGlua2luZyApIDpcbiAgICAgICAgICAgc3VwZXIuZ2V0UGhldGlvTW91c2VIaXRUYXJnZXQoIGZyb21MaW5raW5nICk7XG4gIH1cblxuICBwcml2YXRlIGdldFN0cmluZ1Byb3BlcnR5UGhldGlvTW91c2VIaXRUYXJnZXQoIGZyb21MaW5raW5nID0gZmFsc2UgKTogUGhldGlvT2JqZWN0IHwgJ3BoZXRpb05vdFNlbGVjdGFibGUnIHtcbiAgICBjb25zdCB0YXJnZXRTdHJpbmdQcm9wZXJ0eSA9IHRoaXMuX3N0cmluZ1Byb3BlcnR5LmdldFRhcmdldFByb3BlcnR5KCk7XG5cbiAgICAvLyBFdmVuIGlmIHRoaXMgaXNuJ3QgUGhFVC1pTyBpbnN0cnVtZW50ZWQsIGl0IHN0aWxsIHF1YWxpZmllcyBhcyB0aGlzIFJpY2hUZXh0J3MgaGl0XG4gICAgcmV0dXJuIHRhcmdldFN0cmluZ1Byb3BlcnR5IGluc3RhbmNlb2YgUGhldGlvT2JqZWN0ID9cbiAgICAgICAgICAgdGFyZ2V0U3RyaW5nUHJvcGVydHkuZ2V0UGhldGlvTW91c2VIaXRUYXJnZXQoIGZyb21MaW5raW5nICkgOlxuICAgICAgICAgICAncGhldGlvTm90U2VsZWN0YWJsZSc7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGRvY3VtZW50YXRpb24gYW5kIGNvbW1lbnRzIGluIE5vZGUuaW5pdGlhbGl6ZVBoZXRpb09iamVjdFxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGluaXRpYWxpemVQaGV0aW9PYmplY3QoIGJhc2VPcHRpb25zOiBQYXJ0aWFsPFBoZXRpb09iamVjdE9wdGlvbnM+LCBwcm92aWRlZE9wdGlvbnM6IFJpY2hUZXh0T3B0aW9ucyApOiB2b2lkIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmljaFRleHRPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBSaWNoVGV4dE9wdGlvbnM+KCkoIHt9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIFRyYWNrIHRoaXMsIHNvIHdlIG9ubHkgb3ZlcnJpZGUgb3VyIHN0cmluZ1Byb3BlcnR5IG9uY2UuXG4gICAgY29uc3Qgd2FzSW5zdHJ1bWVudGVkID0gdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpO1xuXG4gICAgc3VwZXIuaW5pdGlhbGl6ZVBoZXRpb09iamVjdCggYmFzZU9wdGlvbnMsIG9wdGlvbnMgKTtcblxuICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiAhd2FzSW5zdHJ1bWVudGVkICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSApIHtcblxuICAgICAgdGhpcy5fc3RyaW5nUHJvcGVydHkuaW5pdGlhbGl6ZVBoZXRpbyggdGhpcywgUmljaFRleHQuU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgU3RyaW5nUHJvcGVydHkoIHRoaXMuc3RyaW5nLCBjb21iaW5lT3B0aW9uczxSaWNoVGV4dE9wdGlvbnM+KCB7XG5cbiAgICAgICAgICAvLyBieSBkZWZhdWx0LCB0ZXh0cyBzaG91bGQgYmUgcmVhZG9ubHkuIEVkaXRhYmxlIHRleHRzIG1vc3QgbGlrZWx5IHBhc3MgaW4gZWRpdGFibGUgUHJvcGVydGllcyBmcm9tIGkxOG4gbW9kZWwgUHJvcGVydGllcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNDQzXG4gICAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXG4gICAgICAgICAgdGFuZGVtOiB0aGlzLnRhbmRlbS5jcmVhdGVUYW5kZW0oIFJpY2hUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSApLFxuICAgICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdQcm9wZXJ0eSBmb3IgdGhlIGRpc3BsYXllZCB0ZXh0J1xuICAgICAgICB9LCBvcHRpb25zLnN0cmluZ1Byb3BlcnR5T3B0aW9ucyApICk7XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gY2FsbGVkLCB3aWxsIHJlYnVpbGQgdGhlIG5vZGUgc3RydWN0dXJlIGZvciB0aGlzIFJpY2hUZXh0XG4gICAqL1xuICBwcml2YXRlIHJlYnVpbGRSaWNoVGV4dCgpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgY2xlYW5BcnJheSggdXNlZExpbmtzICk7XG4gICAgYXNzZXJ0ICYmIGNsZWFuQXJyYXkoIHVzZWROb2RlcyApO1xuXG4gICAgY29uc3QgaGFzRHluYW1pY1dpZHRoID0gdGhpcy5fbGluZVdyYXAgPT09ICdzdHJldGNoJztcblxuICAgIHRoaXMud2lkdGhTaXphYmxlID0gaGFzRHluYW1pY1dpZHRoO1xuXG4gICAgdGhpcy5wZW5kaW5nTWluaW11bVdpZHRoID0gMDtcbiAgICB0aGlzLm5lZWRQZW5kaW5nTWluaW11bVdpZHRoID0gaGFzRHluYW1pY1dpZHRoO1xuXG4gICAgLy8gTk9URTogY2FuJ3QgdXNlIGhhc0R5bmFtaWNXaWR0aCBoZXJlLCBzaW5jZSBUeXBlU2NyaXB0IGlzbid0IGluZmVycmluZyBpdCB5ZXRcbiAgICBjb25zdCBlZmZlY3RpdmVMaW5lV3JhcCA9IHRoaXMuX2xpbmVXcmFwID09PSAnc3RyZXRjaCcgPyB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGggOiB0aGlzLl9saW5lV3JhcDtcblxuICAgIHRoaXMuZnJlZUNoaWxkcmVuVG9Qb29sKCk7XG5cbiAgICAvLyBCYWlsIGVhcmx5LCBwYXJ0aWN1bGFybHkgaWYgd2UgYXJlIGJlaW5nIGNvbnN0cnVjdGVkLlxuICAgIGlmICggdGhpcy5zdHJpbmcgPT09ICcnICkge1xuICAgICAgdGhpcy5hcHBlbmRFbXB0eUxlYWYoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCggYFJpY2hUZXh0IyR7dGhpcy5pZH0gcmVidWlsZGAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBUdXJuIGJpZGlyZWN0aW9uYWwgbWFya3MgaW50byBleHBsaWNpdCBlbGVtZW50cywgc28gdGhhdCB0aGUgbmVzdGluZyBpcyBhcHBsaWVkIGNvcnJlY3RseS5cbiAgICBsZXQgbWFwcGVkVGV4dCA9IHRoaXMuc3RyaW5nLnJlcGxhY2UoIC9cXHUyMDJhL2csICc8c3BhbiBkaXI9XCJsdHJcIj4nIClcbiAgICAgIC5yZXBsYWNlKCAvXFx1MjAyYi9nLCAnPHNwYW4gZGlyPVwicnRsXCI+JyApXG4gICAgICAucmVwbGFjZSggL1xcdTIwMmMvZywgJzwvc3Bhbj4nICk7XG5cbiAgICAvLyBPcHRpb25hbCByZXBsYWNlbWVudCBvZiBuZXdsaW5lcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTQyXG4gICAgaWYgKCB0aGlzLl9yZXBsYWNlTmV3bGluZXMgKSB7XG4gICAgICBtYXBwZWRUZXh0ID0gbWFwcGVkVGV4dC5yZXBsYWNlKCAvXFxuL2csICc8YnI+JyApO1xuICAgIH1cblxuICAgIGxldCByb290RWxlbWVudHM6IEhpbWFsYXlhTm9kZVtdO1xuXG4gICAgLy8gU3RhcnQgYXBwZW5kaW5nIGFsbCB0b3AtbGV2ZWwgZWxlbWVudHNcbiAgICB0cnkge1xuICAgICAgcm9vdEVsZW1lbnRzID0gaGltYWxheWFWYXIucGFyc2UoIG1hcHBlZFRleHQgKTtcbiAgICB9XG4gICAgY2F0Y2goIGUgKSB7XG4gICAgICAvLyBJZiB3ZSBlcnJvciBvdXQsIGRvbid0IGtpbGwgdGhlIHNpbS4gSW5zdGVhZCwgcmVwbGFjZSB0aGUgc3RyaW5nIHdpdGggc29tZXRoaW5nIHRoYXQgbG9va3Mgb2J2aW91c2x5IGxpa2UgYW5cbiAgICAgIC8vIGVycm9yLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEzNjEgKHdlIGRvbid0IHdhbnQgdHJhbnNsYXRpb25zIHRvIGVycm9yIG91dCBvdXJcbiAgICAgIC8vIGJ1aWxkIHByb2Nlc3MpLlxuXG4gICAgICByb290RWxlbWVudHMgPSBoaW1hbGF5YVZhci5wYXJzZSggJ0lOVkFMSUQgVFJBTlNMQVRJT04nICk7XG4gICAgfVxuXG4gICAgLy8gQ2xlYXIgb3V0IGxpbmsgaXRlbXMsIGFzIHdlJ2xsIG5lZWQgdG8gcmVjb25zdHJ1Y3QgdGhlbSBsYXRlclxuICAgIHRoaXMuX2xpbmtJdGVtcy5sZW5ndGggPSAwO1xuXG4gICAgY29uc3Qgd2lkdGhBdmFpbGFibGUgPSBlZmZlY3RpdmVMaW5lV3JhcCA9PT0gbnVsbCA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IGVmZmVjdGl2ZUxpbmVXcmFwO1xuICAgIGNvbnN0IGlzUm9vdExUUiA9IHRydWU7XG5cbiAgICBsZXQgY3VycmVudExpbmUgPSBSaWNoVGV4dEVsZW1lbnQucG9vbC5jcmVhdGUoIGlzUm9vdExUUiApO1xuICAgIHRoaXMuX2hhc0FkZGVkTGVhZlRvTGluZSA9IGZhbHNlOyAvLyBub3RpZnkgdGhhdCBpZiBub3RoaW5nIGhhcyBiZWVuIGFkZGVkLCB0aGUgZmlyc3QgbGVhZiBhbHdheXMgZ2V0cyBhZGRlZC5cblxuICAgIC8vIEhpbWFsYXlhIGNhbiBnaXZlIHVzIG11bHRpcGxlIHRvcC1sZXZlbCBpdGVtcywgc28gd2UgbmVlZCB0byBpdGVyYXRlIG92ZXIgdGhvc2VcbiAgICB3aGlsZSAoIHJvb3RFbGVtZW50cy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gcm9vdEVsZW1lbnRzWyAwIF07XG5cbiAgICAgIC8vIEhvdyBsb25nIG91ciBjdXJyZW50IGxpbmUgaXMgYWxyZWFkeVxuICAgICAgY29uc3QgY3VycmVudExpbmVXaWR0aCA9IGN1cnJlbnRMaW5lLmJvdW5kcy5pc1ZhbGlkKCkgPyBjdXJyZW50TGluZS53aWR0aCA6IDA7XG5cbiAgICAgIC8vIEFkZCB0aGUgZWxlbWVudCBpblxuICAgICAgY29uc3QgbGluZUJyZWFrU3RhdGUgPSB0aGlzLmFwcGVuZEVsZW1lbnQoIGN1cnJlbnRMaW5lLCBlbGVtZW50LCB0aGlzLl9mb250LCB0aGlzLl9maWxsLCBpc1Jvb3RMVFIsIHdpZHRoQXZhaWxhYmxlIC0gY3VycmVudExpbmVXaWR0aCwgMSApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoIGBsaW5lQnJlYWtTdGF0ZTogJHtsaW5lQnJlYWtTdGF0ZX1gICk7XG5cbiAgICAgIC8vIElmIHRoZXJlIHdhcyBhIGxpbmUgYnJlYWsgKHdlJ2xsIG5lZWQgdG8gc3dhcCB0byBhIG5ldyBsaW5lIG5vZGUpXG4gICAgICBpZiAoIGxpbmVCcmVha1N0YXRlICE9PSBMaW5lQnJlYWtTdGF0ZS5OT05FICkge1xuICAgICAgICAvLyBBZGQgdGhlIGxpbmUgaWYgaXQgd29ya3NcbiAgICAgICAgaWYgKCBjdXJyZW50TGluZS5ib3VuZHMuaXNWYWxpZCgpICkge1xuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0KCAnQWRkaW5nIGxpbmUgZHVlIHRvIGxpbmVCcmVhaycgKTtcbiAgICAgICAgICB0aGlzLmFwcGVuZExpbmUoIGN1cnJlbnRMaW5lICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIGl0J3MgYSBibGFuayBsaW5lLCBhZGQgaW4gYSBzdHJ1dCAoPGJyPjxicj4gc2hvdWxkIHJlc3VsdCBpbiBhIGJsYW5rIGxpbmUpXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuYXBwZW5kTGluZSggUmljaFRleHRWZXJ0aWNhbFNwYWNlci5wb29sLmNyZWF0ZSggUmljaFRleHRVdGlscy5zY3JhdGNoVGV4dC5zZXRTdHJpbmcoICdYJyApLnNldEZvbnQoIHRoaXMuX2ZvbnQgKS5oZWlnaHQgKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHVwIGEgbmV3IGxpbmVcbiAgICAgICAgY3VycmVudExpbmUgPSBSaWNoVGV4dEVsZW1lbnQucG9vbC5jcmVhdGUoIGlzUm9vdExUUiApO1xuICAgICAgICB0aGlzLl9oYXNBZGRlZExlYWZUb0xpbmUgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgaXQncyBDT01QTEVURSBvciBOT05FLCB0aGVuIHdlIGZ1bGx5IHByb2Nlc3NlZCB0aGUgbGluZVxuICAgICAgaWYgKCBsaW5lQnJlYWtTdGF0ZSAhPT0gTGluZUJyZWFrU3RhdGUuSU5DT01QTEVURSApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoICdGaW5pc2hlZCByb290IGVsZW1lbnQnICk7XG4gICAgICAgIHJvb3RFbGVtZW50cy5zcGxpY2UoIDAsIDEgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPbmx5IGFkZCB0aGUgZmluYWwgbGluZSBpZiBpdCdzIHZhbGlkICh3ZSBkb24ndCB3YW50IHRvIGFkZCB1bm5lY2Vzc2FyeSBwYWRkaW5nIGF0IHRoZSBib3R0b20pXG4gICAgaWYgKCBjdXJyZW50TGluZS5ib3VuZHMuaXNWYWxpZCgpICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoICdBZGRpbmcgZmluYWwgbGluZScgKTtcbiAgICAgIHRoaXMuYXBwZW5kTGluZSggY3VycmVudExpbmUgKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSByZWFjaGVkIGhlcmUgYW5kIGhhdmUgbm8gY2hpbGRyZW4sIHdlIHByb2JhYmx5IHJhbiBpbnRvIGEgZGVnZW5lcmF0ZSBcIm5vIGxheW91dFwiIGNhc2UgbGlrZSBgJyAnYC4gQWRkIGluXG4gICAgLy8gdGhlIGVtcHR5IGxlYWYuXG4gICAgaWYgKCB0aGlzLmxpbmVDb250YWluZXIuZ2V0Q2hpbGRyZW5Db3VudCgpID09PSAwICkge1xuICAgICAgdGhpcy5hcHBlbmRFbXB0eUxlYWYoKTtcbiAgICB9XG5cbiAgICAvLyBBbGwgbGluZXMgYXJlIGNvbnN0cnVjdGVkLCBzbyB3ZSBjYW4gYWxpZ24gdGhlbSBub3dcbiAgICB0aGlzLmFsaWduTGluZXMoKTtcblxuICAgIC8vIEhhbmRsZSByZWdyb3VwaW5nIG9mIGxpbmtzIChzbyB0aGF0IGFsbCBmcmFnbWVudHMgb2YgYSBsaW5rIGFjcm9zcyBtdWx0aXBsZSBsaW5lcyBhcmUgY29udGFpbmVkIHVuZGVyIGEgc2luZ2xlXG4gICAgLy8gYW5jZXN0b3IgdGhhdCBoYXMgbGlzdGVuZXJzIGFuZCBhMTF5KVxuICAgIHdoaWxlICggdGhpcy5fbGlua0l0ZW1zLmxlbmd0aCApIHtcbiAgICAgIC8vIENsb3NlIG92ZXIgdGhlIGhyZWYgYW5kIG90aGVyIHJlZmVyZW5jZXNcbiAgICAgICggKCkgPT4ge1xuICAgICAgICBjb25zdCBsaW5rRWxlbWVudCA9IHRoaXMuX2xpbmtJdGVtc1sgMCBdLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGhyZWYgPSB0aGlzLl9saW5rSXRlbXNbIDAgXS5ocmVmO1xuICAgICAgICBsZXQgaTtcblxuICAgICAgICAvLyBGaW5kIGFsbCBub2RlcyB0aGF0IGFyZSBmb3IgdGhlIHNhbWUgbGlua1xuICAgICAgICBjb25zdCBub2RlcyA9IFtdO1xuICAgICAgICBmb3IgKCBpID0gdGhpcy5fbGlua0l0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9saW5rSXRlbXNbIGkgXTtcbiAgICAgICAgICBpZiAoIGl0ZW0uZWxlbWVudCA9PT0gbGlua0VsZW1lbnQgKSB7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKCBpdGVtLm5vZGUgKTtcbiAgICAgICAgICAgIHRoaXMuX2xpbmtJdGVtcy5zcGxpY2UoIGksIDEgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsaW5rUm9vdE5vZGUgPSBSaWNoVGV4dExpbmsucG9vbC5jcmVhdGUoIGxpbmtFbGVtZW50LmlubmVyQ29udGVudCwgaHJlZiApO1xuICAgICAgICB0aGlzLmxpbmVDb250YWluZXIuYWRkQ2hpbGQoIGxpbmtSb290Tm9kZSApO1xuXG4gICAgICAgIC8vIERldGFjaCB0aGUgbm9kZSBmcm9tIGl0cyBsb2NhdGlvbiwgYWRqdXN0IGl0cyB0cmFuc2Zvcm0sIGFuZCByZWF0dGFjaCB1bmRlciB0aGUgbGluay4gVGhpcyBzaG91bGQga2VlcCBlYWNoXG4gICAgICAgIC8vIGZyYWdtZW50IGluIHRoZSBzYW1lIHBsYWNlLCBidXQgY2hhbmdlcyBpdHMgcGFyZW50LlxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1sgaSBdO1xuICAgICAgICAgIGNvbnN0IG1hdHJpeCA9IG5vZGUuZ2V0VW5pcXVlVHJhaWxUbyggdGhpcy5saW5lQ29udGFpbmVyICkuZ2V0TWF0cml4KCk7XG4gICAgICAgICAgbm9kZS5kZXRhY2goKTtcbiAgICAgICAgICBub2RlLm1hdHJpeCA9IG1hdHJpeDtcbiAgICAgICAgICBsaW5rUm9vdE5vZGUuYWRkQ2hpbGQoIG5vZGUgKTtcbiAgICAgICAgfVxuICAgICAgfSApKCk7XG4gICAgfVxuXG4gICAgLy8gQ2xlYXIgdGhlbSBvdXQgYWZ0ZXJ3YXJkcywgZm9yIG1lbW9yeSBwdXJwb3Nlc1xuICAgIHRoaXMuX2xpbmtJdGVtcy5sZW5ndGggPSAwO1xuXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBpZiAoIHRoaXMuX2xpbmtzICYmIHRoaXMuX2xpbmtzICE9PSB0cnVlICkge1xuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5fbGlua3MgKS5mb3JFYWNoKCBsaW5rID0+IHtcbiAgICAgICAgICBhc3NlcnQgJiYgYWxsb3dMaW5rc1Byb3BlcnR5LnZhbHVlICYmICFpc1N0cmluZ1Rlc3QgJiYgYXNzZXJ0KCB1c2VkTGlua3MuaW5jbHVkZXMoIGxpbmsgKSwgYFVudXNlZCBSaWNoVGV4dCBsaW5rOiAke2xpbmt9YCApO1xuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBpZiAoIHRoaXMuX25vZGVzICkge1xuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5fbm9kZXMgKS5mb3JFYWNoKCBub2RlID0+IHtcbiAgICAgICAgICBhc3NlcnQgJiYgYWxsb3dMaW5rc1Byb3BlcnR5LnZhbHVlICYmICFpc1N0cmluZ1Rlc3QgJiYgYXNzZXJ0KCB1c2VkTm9kZXMuaW5jbHVkZXMoIG5vZGUgKSwgYFVudXNlZCBSaWNoVGV4dCBub2RlOiAke25vZGV9YCApO1xuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTk9URTogSWYgdGhpcyBpcyBmYWlsaW5nIG9yIGNhdXNpbmcgaW5maW5pdGUgbG9vcHMgaW4gdGhlIGZ1dHVyZSwgcmVmYWN0b3IgUmljaFRleHQgdG8gdXNlIGEgTGF5b3V0Q29uc3RyYWludC5cbiAgICB0aGlzLmxvY2FsTWluaW11bVdpZHRoID0gaGFzRHluYW1pY1dpZHRoID8gdGhpcy5wZW5kaW5nTWluaW11bVdpZHRoIDogdGhpcy5sb2NhbEJvdW5kcy53aWR0aDtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFucyBcInJlY3Vyc2l2ZWx5IHRlbXBvcmFyeSBkaXNwb3Nlc1wiIHRoZSBjaGlsZHJlbi5cbiAgICovXG4gIHByaXZhdGUgZnJlZUNoaWxkcmVuVG9Qb29sKCk6IHZvaWQge1xuICAgIC8vIENsZWFyIGFueSBleGlzdGluZyBsaW5lcyBvciBsaW5rIGZyYWdtZW50cyAoaGlnaGVyIHBlcmZvcm1hbmNlLCBhbmQgcmV0dXJuIHRoZW0gdG8gcG9vbHMgYWxzbylcbiAgICB3aGlsZSAoIHRoaXMubGluZUNvbnRhaW5lci5fY2hpbGRyZW4ubGVuZ3RoICkge1xuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLmxpbmVDb250YWluZXIuX2NoaWxkcmVuWyB0aGlzLmxpbmVDb250YWluZXIuX2NoaWxkcmVuLmxlbmd0aCAtIDEgXSBhcyBSaWNoVGV4dENsZWFuYWJsZU5vZGU7XG4gICAgICB0aGlzLmxpbmVDb250YWluZXIucmVtb3ZlQ2hpbGQoIGNoaWxkICk7XG5cbiAgICAgIGNoaWxkLmNsZWFuKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXMuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmZyZWVDaGlsZHJlblRvUG9vbCgpO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuXG4gICAgdGhpcy5fc3RyaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgYSBmaW5pc2hlZCBsaW5lLCBhcHBseWluZyBhbnkgbmVjZXNzYXJ5IGxlYWRpbmcuXG4gICAqL1xuICBwcml2YXRlIGFwcGVuZExpbmUoIGxpbmVOb2RlOiBSaWNoVGV4dEVsZW1lbnQgfCBOb2RlICk6IHZvaWQge1xuICAgIC8vIEFwcGx5IGxlYWRpbmdcbiAgICBpZiAoIHRoaXMubGluZUNvbnRhaW5lci5ib3VuZHMuaXNWYWxpZCgpICkge1xuICAgICAgbGluZU5vZGUudG9wID0gdGhpcy5saW5lQ29udGFpbmVyLmJvdHRvbSArIHRoaXMuX2xlYWRpbmc7XG5cbiAgICAgIC8vIFRoaXMgZW5zdXJlcyBSVEwgbGluZXMgd2lsbCBzdGlsbCBiZSBsYWlkIG91dCBwcm9wZXJseSB3aXRoIHRoZSBtYWluIG9yaWdpbiAoaGFuZGxlZCBieSBhbGlnbkxpbmVzIGxhdGVyKVxuICAgICAgbGluZU5vZGUubGVmdCA9IDA7XG4gICAgfVxuXG4gICAgdGhpcy5saW5lQ29udGFpbmVyLmFkZENoaWxkKCBsaW5lTm9kZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHdlIGVuZCB1cCB3aXRoIHRoZSBlcXVpdmFsZW50IG9mIFwibm9cIiBjb250ZW50LCB0b3NzIGluIGEgYmFzaWNhbGx5IGVtcHR5IGxlYWYgc28gdGhhdCB3ZSBnZXQgdmFsaWQgYm91bmRzXG4gICAqICgwIHdpZHRoLCBjb3JyZWN0bHktcG9zaXRpb25lZCBoZWlnaHQpLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzc2OS5cbiAgICovXG4gIHByaXZhdGUgYXBwZW5kRW1wdHlMZWFmKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubGluZUNvbnRhaW5lci5nZXRDaGlsZHJlbkNvdW50KCkgPT09IDAgKTtcblxuICAgIHRoaXMuYXBwZW5kTGluZSggUmljaFRleHRMZWFmLnBvb2wuY3JlYXRlKCAnJywgdHJ1ZSwgdGhpcy5fZm9udCwgdGhpcy5fYm91bmRzTWV0aG9kLCB0aGlzLl9maWxsLCB0aGlzLl9zdHJva2UsIHRoaXMuX2xpbmVXaWR0aCApICk7XG4gIH1cblxuICAvKipcbiAgICogQWxpZ25zIGFsbCBsaW5lcyBhdHRhY2hlZCB0byB0aGUgbGluZUNvbnRhaW5lci5cbiAgICovXG4gIHByaXZhdGUgYWxpZ25MaW5lcygpOiB2b2lkIHtcbiAgICAvLyBBbGwgbm9kZXMgd2lsbCBlaXRoZXIgc2hhcmUgYSAnbGVmdCcsICdjZW50ZXJYJyBvciAncmlnaHQnLlxuICAgIGNvbnN0IGNvb3JkaW5hdGVOYW1lID0gdGhpcy5fYWxpZ24gPT09ICdjZW50ZXInID8gJ2NlbnRlclgnIDogdGhpcy5fYWxpZ247XG5cbiAgICBjb25zdCBpZGVhbCA9IHRoaXMubGluZUNvbnRhaW5lclsgY29vcmRpbmF0ZU5hbWUgXTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxpbmVDb250YWluZXIuZ2V0Q2hpbGRyZW5Db3VudCgpOyBpKysgKSB7XG4gICAgICB0aGlzLmxpbmVDb250YWluZXIuZ2V0Q2hpbGRBdCggaSApWyBjb29yZGluYXRlTmFtZSBdID0gaWRlYWw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1haW4gcmVjdXJzaXZlIGZ1bmN0aW9uIGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJpY2hUZXh0IE5vZGUgdHJlZS5cbiAgICpcbiAgICogV2UnbGwgYWRkIGFueSByZWxldmFudCBjb250ZW50IHRvIHRoZSBjb250YWluZXJOb2RlLiBUaGUgZWxlbWVudCB3aWxsIGJlIG11dGF0ZWQgYXMgdGhpbmdzIGFyZSBhZGRlZCwgc28gdGhhdFxuICAgKiB3aGVuZXZlciBjb250ZW50IGlzIGFkZGVkIHRvIHRoZSBOb2RlIHRyZWUgaXQgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnQgdHJlZS4gVGhpcyBtZWFucyB3ZSBjYW4gcGF1c2VcbiAgICogd2hlbmV2ZXIgKGUuZy4gd2hlbiBhIGxpbmUtYnJlYWsgaXMgZW5jb3VudGVyZWQpIGFuZCB0aGUgcmVzdCB3aWxsIGJlIHJlYWR5IGZvciBwYXJzaW5nIHRoZSBuZXh0IGxpbmUuXG4gICAqXG4gICAqIEBwYXJhbSBjb250YWluZXJOb2RlIC0gVGhlIG5vZGUgd2hlcmUgY2hpbGQgZWxlbWVudHMgc2hvdWxkIGJlIHBsYWNlZFxuICAgKiBAcGFyYW0gZWxlbWVudCAtIFNlZSBIaW1hbGF5YSdzIGVsZW1lbnQgc3BlY2lmaWNhdGlvblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAoaHR0cHM6Ly9naXRodWIuY29tL2FuZHJlamV3c2tpL2hpbWFsYXlhL2Jsb2IvbWFzdGVyL3RleHQvYXN0LXNwZWMtdjAubWQpXG4gICAqIEBwYXJhbSBmb250IC0gVGhlIGZvbnQgdG8gYXBwbHkgYXQgdGhpcyBsZXZlbFxuICAgKiBAcGFyYW0gZmlsbCAtIEZpbGwgdG8gYXBwbHlcbiAgICogQHBhcmFtIGlzTFRSIC0gVHJ1ZSBpZiBMVFIsIGZhbHNlIGlmIFJUTCAoaGFuZGxlcyBSVEwgc3RyaW5ncyBwcm9wZXJseSlcbiAgICogQHBhcmFtIHdpZHRoQXZhaWxhYmxlIC0gSG93IG11Y2ggd2lkdGggd2UgaGF2ZSBhdmFpbGFibGUgYmVmb3JlIGZvcmNpbmcgYSBsaW5lIGJyZWFrIChmb3IgbGluZVdyYXApXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciBhIGxpbmUgYnJlYWsgd2FzIHJlYWNoZWRcbiAgICovXG4gIHByaXZhdGUgYXBwZW5kRWxlbWVudChcbiAgICBjb250YWluZXJOb2RlOiBSaWNoVGV4dEVsZW1lbnQsXG4gICAgZWxlbWVudDogSGltYWxheWFOb2RlLFxuICAgIGZvbnQ6IEZvbnQgfCBzdHJpbmcsXG4gICAgZmlsbDogVFBhaW50LFxuICAgIGlzTFRSOiBib29sZWFuLFxuICAgIHdpZHRoQXZhaWxhYmxlOiBudW1iZXIsXG4gICAgYXBwbGllZFNjYWxlOiBudW1iZXJcbiAgKTogc3RyaW5nIHtcbiAgICBsZXQgbGluZUJyZWFrU3RhdGUgPSBMaW5lQnJlYWtTdGF0ZS5OT05FO1xuXG4gICAgLy8gVGhlIG1haW4gTm9kZSBmb3IgdGhlIGVsZW1lbnQgdGhhdCB3ZSBhcmUgYWRkaW5nXG4gICAgbGV0IG5vZGUhOiBSaWNoVGV4dExlYWYgfCBSaWNoVGV4dE5vZGUgfCBSaWNoVGV4dEVsZW1lbnQ7XG5cbiAgICAvLyBJZiB0aGlzIGNvbnRlbnQgZ2V0cyBhZGRlZCwgaXQgd2lsbCBuZWVkIHRvIGJlIHB1c2hlZCBvdmVyIGJ5IHRoaXMgYW1vdW50XG4gICAgY29uc3QgY29udGFpbmVyU3BhY2luZyA9IGlzTFRSID8gY29udGFpbmVyTm9kZS5yaWdodFNwYWNpbmcgOiBjb250YWluZXJOb2RlLmxlZnRTcGFjaW5nO1xuXG4gICAgLy8gQ29udGFpbmVyIHNwYWNpbmcgY3V0cyBpbnRvIG91ciBlZmZlY3RpdmUgYXZhaWxhYmxlIHdpZHRoXG4gICAgY29uc3Qgd2lkdGhBdmFpbGFibGVXaXRoU3BhY2luZyA9IHdpZHRoQXZhaWxhYmxlIC0gY29udGFpbmVyU3BhY2luZztcblxuICAgIC8vIElmIHdlJ3JlIGEgbGVhZlxuICAgIGlmICggaXNIaW1hbGF5YVRleHROb2RlKCBlbGVtZW50ICkgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCggYGFwcGVuZGluZyBsZWFmOiAke2VsZW1lbnQuY29udGVudH1gICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgIG5vZGUgPSBSaWNoVGV4dExlYWYucG9vbC5jcmVhdGUoIGVsZW1lbnQuY29udGVudCwgaXNMVFIsIGZvbnQsIHRoaXMuX2JvdW5kc01ldGhvZCwgZmlsbCwgdGhpcy5fc3Ryb2tlLCB0aGlzLl9saW5lV2lkdGggKTtcblxuICAgICAgaWYgKCB0aGlzLm5lZWRQZW5kaW5nTWluaW11bVdpZHRoICkge1xuICAgICAgICB0aGlzLnBlbmRpbmdNaW5pbXVtV2lkdGggPSBNYXRoLm1heCggdGhpcy5wZW5kaW5nTWluaW11bVdpZHRoLCBNYXRoLm1heCggLi4uZ2V0TGluZUJyZWFrUmFuZ2VzKCBlbGVtZW50LmNvbnRlbnQgKS5tYXAoIHJhbmdlID0+IHtcbiAgICAgICAgICBjb25zdCBzdHJpbmcgPSBlbGVtZW50LmNvbnRlbnQuc2xpY2UoIHJhbmdlLm1pbiwgcmFuZ2UubWF4ICk7XG4gICAgICAgICAgY29uc3QgdGVtcG9yYXJ5Tm9kZSA9IFJpY2hUZXh0TGVhZi5wb29sLmNyZWF0ZSggc3RyaW5nLCBpc0xUUiwgZm9udCwgdGhpcy5fYm91bmRzTWV0aG9kLCBmaWxsLCB0aGlzLl9zdHJva2UsIHRoaXMuX2xpbmVXaWR0aCApO1xuICAgICAgICAgIGNvbnN0IGxvY2FsTWluaW51bVdpZHRoID0gdGVtcG9yYXJ5Tm9kZS53aWR0aCAqIGFwcGxpZWRTY2FsZTtcbiAgICAgICAgICB0ZW1wb3JhcnlOb2RlLmRpc3Bvc2UoKTtcbiAgICAgICAgICByZXR1cm4gbG9jYWxNaW5pbnVtV2lkdGg7XG4gICAgICAgIH0gKSApICk7XG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSB3cmFwcGluZyBpZiByZXF1aXJlZC4gQ29udGFpbmVyIHNwYWNpbmcgY3V0cyBpbnRvIG91ciBhdmFpbGFibGUgd2lkdGhcbiAgICAgIGlmICggIW5vZGUuZml0c0luKCB3aWR0aEF2YWlsYWJsZVdpdGhTcGFjaW5nLCB0aGlzLl9oYXNBZGRlZExlYWZUb0xpbmUsIGlzTFRSICkgKSB7XG4gICAgICAgIC8vIERpZG4ndCBmaXQsIGxldHMgYnJlYWsgaW50byB3b3JkcyB0byBzZWUgd2hhdCB3ZSBjYW4gZml0LiBXZSdsbCBjcmVhdGUgcmFuZ2VzIGZvciBhbGwgdGhlIGluZGl2aWR1YWxcbiAgICAgICAgLy8gZWxlbWVudHMgd2UgY291bGQgc3BsaXQgdGhlIGxpbmVzIGludG8uIElmIHdlIHNwbGl0IGludG8gZGlmZmVyZW50IGxpbmVzLCB3ZSBjYW4gaWdub3JlIHRoZSBjaGFyYWN0ZXJzXG4gICAgICAgIC8vIGluLWJldHdlZW4sIGhvd2V2ZXIgaWYgbm90LCB3ZSBuZWVkIHRvIGluY2x1ZGUgdGhlbS5cbiAgICAgICAgY29uc3QgcmFuZ2VzID0gZ2V0TGluZUJyZWFrUmFuZ2VzKCBlbGVtZW50LmNvbnRlbnQgKTtcblxuICAgICAgICAvLyBDb252ZXJ0IGEgZ3JvdXAgb2YgcmFuZ2VzIGludG8gYSBzdHJpbmcgKGdyYWIgdGhlIGNvbnRlbnQgZnJvbSB0aGUgc3RyaW5nKS5cbiAgICAgICAgY29uc3QgcmFuZ2VzVG9TdHJpbmcgPSAoIHJhbmdlczogUmFuZ2VbXSApOiBzdHJpbmcgPT4ge1xuICAgICAgICAgIGlmICggcmFuZ2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jb250ZW50LnNsaWNlKCByYW5nZXNbIDAgXS5taW4sIHJhbmdlc1sgcmFuZ2VzLmxlbmd0aCAtIDEgXS5tYXggKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoIGBPdmVyZmxvdyBsZWFmQWRkZWQ6JHt0aGlzLl9oYXNBZGRlZExlYWZUb0xpbmV9LCB3b3JkczogJHtyYW5nZXMubGVuZ3RofWAgKTtcblxuICAgICAgICAvLyBJZiB3ZSBuZWVkIHRvIGFkZCBzb21ldGhpbmcgKGFuZCB0aGVyZSBpcyBvbmx5IGEgc2luZ2xlIHdvcmQpLCB0aGVuIGFkZCBpdFxuICAgICAgICBpZiAoIHRoaXMuX2hhc0FkZGVkTGVhZlRvTGluZSB8fCByYW5nZXMubGVuZ3RoID4gMSApIHtcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCggJ1NraXBwaW5nIHdvcmRzJyApO1xuXG4gICAgICAgICAgY29uc3Qgc2tpcHBlZFJhbmdlczogUmFuZ2VbXSA9IFtdO1xuICAgICAgICAgIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgc2tpcHBlZFJhbmdlcy51bnNoaWZ0KCByYW5nZXMucG9wKCkhICk7IC8vIFdlIGRpZG4ndCBmaXQgd2l0aCB0aGUgbGFzdCBvbmUhXG5cbiAgICAgICAgICAvLyBLZWVwIHNob3J0ZW5pbmcgYnkgcmVtb3Zpbmcgd29yZHMgdW50aWwgaXQgZml0cyAob3IgaWYgd2UgTkVFRCB0byBmaXQgaXQpIG9yIGl0IGRvZXNuJ3QgZml0LlxuICAgICAgICAgIHdoaWxlICggcmFuZ2VzLmxlbmd0aCApIHtcbiAgICAgICAgICAgIG5vZGUuY2xlYW4oKTsgLy8gV2UncmUgdG9zc2luZyB0aGUgb2xkIG9uZSwgc28gd2UnbGwgZnJlZSB1cCBtZW1vcnkgZm9yIHRoZSBuZXcgb25lXG4gICAgICAgICAgICBub2RlID0gUmljaFRleHRMZWFmLnBvb2wuY3JlYXRlKCByYW5nZXNUb1N0cmluZyggcmFuZ2VzICksIGlzTFRSLCBmb250LCB0aGlzLl9ib3VuZHNNZXRob2QsIGZpbGwsIHRoaXMuX3N0cm9rZSwgdGhpcy5fbGluZVdpZHRoICk7XG5cbiAgICAgICAgICAgIC8vIElmIHdlIGhhdmVuJ3QgYWRkZWQgYW55dGhpbmcgdG8gdGhlIGxpbmUgQU5EIHdlIGFyZSBkb3duIHRvIHRoZSBmaXJzdCB3b3JkLCB3ZSBuZWVkIHRvIGp1c3QgYWRkIGl0LlxuICAgICAgICAgICAgaWYgKCAhbm9kZS5maXRzSW4oIHdpZHRoQXZhaWxhYmxlV2l0aFNwYWNpbmcsIHRoaXMuX2hhc0FkZGVkTGVhZlRvTGluZSwgaXNMVFIgKSAmJlxuICAgICAgICAgICAgICAgICAoIHRoaXMuX2hhc0FkZGVkTGVhZlRvTGluZSB8fCByYW5nZXMubGVuZ3RoID4gMSApICkge1xuICAgICAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCggYFNraXBwaW5nIHdvcmQgJHtyYW5nZXNUb1N0cmluZyggWyByYW5nZXNbIHJhbmdlcy5sZW5ndGggLSAxIF0gXSApfWAgKTtcbiAgICAgICAgICAgICAgc2tpcHBlZFJhbmdlcy51bnNoaWZ0KCByYW5nZXMucG9wKCkhICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoIGBTdWNjZXNzIHdpdGggJHtyYW5nZXNUb1N0cmluZyggcmFuZ2VzICl9YCApO1xuICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZW4ndCBhZGRlZCBhbnl0aGluZyB5ZXQgdG8gdGhpcyBsaW5lLCB3ZSdsbCBwZXJtaXQgdGhlIG92ZXJmbG93XG4gICAgICAgICAgaWYgKCBzdWNjZXNzICkge1xuICAgICAgICAgICAgbGluZUJyZWFrU3RhdGUgPSBMaW5lQnJlYWtTdGF0ZS5JTkNPTVBMRVRFO1xuICAgICAgICAgICAgZWxlbWVudC5jb250ZW50ID0gcmFuZ2VzVG9TdHJpbmcoIHNraXBwZWRSYW5nZXMgKTtcbiAgICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0KCBgUmVtYWluaW5nIGNvbnRlbnQ6ICR7ZWxlbWVudC5jb250ZW50fWAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSB3b24ndCB1c2UgdGhpcyBvbmUsIHNvIHdlJ2xsIGZyZWUgaXQgYmFjayB0byB0aGUgcG9vbFxuICAgICAgICAgICAgbm9kZS5jbGVhbigpO1xuXG4gICAgICAgICAgICByZXR1cm4gTGluZUJyZWFrU3RhdGUuSU5DT01QTEVURTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5faGFzQWRkZWRMZWFmVG9MaW5lID0gdHJ1ZTtcblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSBwcmVzdW1hYmx5IGFuIGVsZW1lbnQgd2l0aCBjb250ZW50XG4gICAgZWxzZSBpZiAoIGlzSGltYWxheWFFbGVtZW50Tm9kZSggZWxlbWVudCApICkge1xuICAgICAgLy8gQmFpbCBvdXQgcXVpY2tseSBmb3IgYSBsaW5lIGJyZWFrXG4gICAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ2JyJyApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoICdtYW51YWwgbGluZSBicmVhaycgKTtcbiAgICAgICAgcmV0dXJuIExpbmVCcmVha1N0YXRlLkNPTVBMRVRFO1xuICAgICAgfVxuXG4gICAgICAvLyBTcGFuIChkaXIgYXR0cmlidXRlKSAtLSB3ZSBuZWVkIHRoZSBMVFIvUlRMIGtub3dsZWRnZSBiZWZvcmUgbW9zdCBvdGhlciBvcGVyYXRpb25zXG4gICAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ3NwYW4nICkge1xuICAgICAgICBjb25zdCBkaXJBdHRyaWJ1dGVTdHJpbmcgPSBSaWNoVGV4dFV0aWxzLmhpbWFsYXlhR2V0QXR0cmlidXRlKCAnZGlyJywgZWxlbWVudCApO1xuXG4gICAgICAgIGlmICggZGlyQXR0cmlidXRlU3RyaW5nICkge1xuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRpckF0dHJpYnV0ZVN0cmluZyA9PT0gJ2x0cicgfHwgZGlyQXR0cmlidXRlU3RyaW5nID09PSAncnRsJyxcbiAgICAgICAgICAgICdTcGFuIGRpciBhdHRyaWJ1dGVzIHNob3VsZCBiZSBsdHIgb3IgcnRsLicgKTtcbiAgICAgICAgICBpc0xUUiA9IGRpckF0dHJpYnV0ZVN0cmluZyA9PT0gJ2x0cic7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSGFuZGxlIDxub2RlPiB0YWdzLCB3aGljaCBzaG91bGQgbm90IGhhdmUgY29udGVudFxuICAgICAgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdub2RlJyApIHtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlZElkID0gUmljaFRleHRVdGlscy5oaW1hbGF5YUdldEF0dHJpYnV0ZSggJ2lkJywgZWxlbWVudCApO1xuICAgICAgICBjb25zdCByZWZlcmVuY2VkTm9kZSA9IHJlZmVyZW5jZWRJZCA/ICggdGhpcy5fbm9kZXNbIHJlZmVyZW5jZWRJZCBdIHx8IG51bGwgKSA6IG51bGw7XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcmVmZXJlbmNlZE5vZGUsXG4gICAgICAgICAgcmVmZXJlbmNlZElkXG4gICAgICAgICAgPyBgQ291bGQgbm90IGZpbmQgYSBtYXRjaGluZyBpdGVtIGluIFJpY2hUZXh0J3Mgbm9kZXMgZm9yICR7cmVmZXJlbmNlZElkfS4gSXQgc2hvdWxkIGJlIHByb3ZpZGVkIGluIHRoZSBub2RlcyBvcHRpb25gXG4gICAgICAgICAgOiAnTm8gaWQgYXR0cmlidXRlIHByb3ZpZGVkIGZvciBhIGdpdmVuIDxub2RlPiBlbGVtZW50JyApO1xuICAgICAgICBpZiAoIHJlZmVyZW5jZWROb2RlICkge1xuICAgICAgICAgIGFzc2VydCAmJiB1c2VkTm9kZXMucHVzaCggcmVmZXJlbmNlZElkISApO1xuICAgICAgICAgIG5vZGUgPSBSaWNoVGV4dE5vZGUucG9vbC5jcmVhdGUoIHJlZmVyZW5jZWROb2RlICk7XG5cbiAgICAgICAgICBpZiAoIHRoaXMuX2hhc0FkZGVkTGVhZlRvTGluZSAmJiAhbm9kZS5maXRzSW4oIHdpZHRoQXZhaWxhYmxlV2l0aFNwYWNpbmcgKSApIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGZpdCwgd2UnbGwgdG9zcyB0aGlzIG5vZGUgdG8gdGhlIHBvb2wgYW5kIGNyZWF0ZSBpdCBvbiB0aGUgbmV4dCBsaW5lXG4gICAgICAgICAgICBub2RlLmNsZWFuKCk7XG4gICAgICAgICAgICByZXR1cm4gTGluZUJyZWFrU3RhdGUuSU5DT01QTEVURTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBub2RlQWxpZ24gPSBSaWNoVGV4dFV0aWxzLmhpbWFsYXlhR2V0QXR0cmlidXRlKCAnYWxpZ24nLCBlbGVtZW50ICk7XG4gICAgICAgICAgaWYgKCBub2RlQWxpZ24gPT09ICdjZW50ZXInIHx8IG5vZGVBbGlnbiA9PT0gJ3RvcCcgfHwgbm9kZUFsaWduID09PSAnYm90dG9tJyApIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHRCb3VuZHMgPSBSaWNoVGV4dFV0aWxzLnNjcmF0Y2hUZXh0LnNldFN0cmluZyggJ1Rlc3QnICkuc2V0Rm9udCggZm9udCApLmJvdW5kcztcbiAgICAgICAgICAgIGlmICggbm9kZUFsaWduID09PSAnY2VudGVyJyApIHtcbiAgICAgICAgICAgICAgbm9kZS5jZW50ZXJZID0gdGV4dEJvdW5kcy5jZW50ZXJZO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIG5vZGVBbGlnbiA9PT0gJ3RvcCcgKSB7XG4gICAgICAgICAgICAgIG5vZGUudG9wID0gdGV4dEJvdW5kcy50b3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICggbm9kZUFsaWduID09PSAnYm90dG9tJyApIHtcbiAgICAgICAgICAgICAgbm9kZS5ib3R0b20gPSB0ZXh0Qm91bmRzLmJvdHRvbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gbm9kZSBpbiBvdXIgbWFwLCB3ZSdsbCBqdXN0IHNraXAgaXRcbiAgICAgICAgICByZXR1cm4gbGluZUJyZWFrU3RhdGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9oYXNBZGRlZExlYWZUb0xpbmUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gSWYgbm90IGEgPG5vZGU+IHRhZ1xuICAgICAgZWxzZSB7XG4gICAgICAgIG5vZGUgPSBSaWNoVGV4dEVsZW1lbnQucG9vbC5jcmVhdGUoIGlzTFRSICk7XG4gICAgICB9XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0KCAnYXBwZW5kaW5nIGVsZW1lbnQnICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgIGNvbnN0IHN0eWxlQXR0cmlidXRlU3RyaW5nID0gUmljaFRleHRVdGlscy5oaW1hbGF5YUdldEF0dHJpYnV0ZSggJ3N0eWxlJywgZWxlbWVudCApO1xuXG4gICAgICBpZiAoIHN0eWxlQXR0cmlidXRlU3RyaW5nICkge1xuICAgICAgICBjb25zdCBjc3MgPSBSaWNoVGV4dFV0aWxzLmhpbWFsYXlhU3R5bGVTdHJpbmdUb01hcCggc3R5bGVBdHRyaWJ1dGVTdHJpbmcgKTtcbiAgICAgICAgYXNzZXJ0ICYmIE9iamVjdC5rZXlzKCBjc3MgKS5mb3JFYWNoKCBrZXkgPT4ge1xuICAgICAgICAgIGFzc2VydCEoIF8uaW5jbHVkZXMoIFNUWUxFX0tFWVMsIGtleSApLCAnU2VlIHN1cHBvcnRlZCBzdHlsZSBDU1Mga2V5cycgKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8vIEZpbGxcbiAgICAgICAgaWYgKCBjc3MuY29sb3IgKSB7XG4gICAgICAgICAgZmlsbCA9IG5ldyBDb2xvciggY3NzLmNvbG9yICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb250XG4gICAgICAgIGNvbnN0IGZvbnRPcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IEZPTlRfU1RZTEVfS0VZUy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCBzdHlsZUtleSA9IEZPTlRfU1RZTEVfS0VZU1sgaSBdO1xuICAgICAgICAgIGlmICggY3NzWyBzdHlsZUtleSBdICkge1xuICAgICAgICAgICAgZm9udE9wdGlvbnNbIEZPTlRfU1RZTEVfTUFQWyBzdHlsZUtleSBdIF0gPSBjc3NbIHN0eWxlS2V5IF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvbnQgPSAoIHR5cGVvZiBmb250ID09PSAnc3RyaW5nJyA/IEZvbnQuZnJvbUNTUyggZm9udCApIDogZm9udCApLmNvcHkoIGZvbnRPcHRpb25zICk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFuY2hvciAobGluaylcbiAgICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnYScgKSB7XG4gICAgICAgIGxldCBocmVmOiBSaWNoVGV4dEhyZWYgfCBudWxsID0gUmljaFRleHRVdGlscy5oaW1hbGF5YUdldEF0dHJpYnV0ZSggJ2hyZWYnLCBlbGVtZW50ICk7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsSHJlZiA9IGhyZWY7XG5cbiAgICAgICAgLy8gVHJ5IGV4dHJhY3RpbmcgdGhlIGhyZWYgZnJvbSB0aGUgbGlua3Mgb2JqZWN0XG4gICAgICAgIGlmICggaHJlZiAhPT0gbnVsbCAmJiB0aGlzLl9saW5rcyAhPT0gdHJ1ZSApIHtcbiAgICAgICAgICBpZiAoIGhyZWYuc3RhcnRzV2l0aCggJ3t7JyApICYmIGhyZWYuaW5kZXhPZiggJ319JyApID09PSBocmVmLmxlbmd0aCAtIDIgKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5rTmFtZSA9IGhyZWYuc2xpY2UoIDIsIC0yICk7XG4gICAgICAgICAgICBocmVmID0gdGhpcy5fbGlua3NbIGxpbmtOYW1lIF07XG4gICAgICAgICAgICBhc3NlcnQgJiYgdXNlZExpbmtzLnB1c2goIGxpbmtOYW1lICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaHJlZiA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWdub3JlIHRoaW5ncyBpZiB0aGVyZSBpcyBubyBtYXRjaGluZyBocmVmXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGhyZWYsXG4gICAgICAgICAgYENvdWxkIG5vdCBmaW5kIGEgbWF0Y2hpbmcgaXRlbSBpbiBSaWNoVGV4dCdzIGxpbmtzIGZvciAke29yaWdpbmFsSHJlZn0uIEl0IHNob3VsZCBiZSBwcm92aWRlZCBpbiB0aGUgbGlua3Mgb3B0aW9uLCBvciBsaW5rcyBzaG91bGQgYmUgdHVybmVkIHRvIHRydWUgKHRvIGFsbG93IHRoZSBzdHJpbmcgdG8gY3JlYXRlIGl0cyBvd24gdXJsc2AgKTtcbiAgICAgICAgaWYgKCBocmVmICkge1xuICAgICAgICAgIGlmICggdGhpcy5fbGlua0ZpbGwgIT09IG51bGwgKSB7XG4gICAgICAgICAgICBmaWxsID0gdGhpcy5fbGlua0ZpbGw7IC8vIExpbmsgY29sb3JcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gRG9uJ3Qgb3ZlcndyaXRlIG9ubHkgaW5uZXJDb250ZW50cyBvbmNlIHRoaW5ncyBoYXZlIGJlZW4gXCJ0b3JuIGRvd25cIlxuICAgICAgICAgIGlmICggIWVsZW1lbnQuaW5uZXJDb250ZW50ICkge1xuICAgICAgICAgICAgZWxlbWVudC5pbm5lckNvbnRlbnQgPSBSaWNoVGV4dC5oaW1hbGF5YUVsZW1lbnRUb0FjY2Vzc2libGVTdHJpbmcoIGVsZW1lbnQgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTdG9yZSBpbmZvcm1hdGlvbiBhYm91dCBpdCBmb3IgdGhlIFwicmVncm91cCBsaW5rc1wiIHN0ZXBcbiAgICAgICAgICB0aGlzLl9saW5rSXRlbXMucHVzaCgge1xuICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBCb2xkXG4gICAgICBlbHNlIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnYicgfHwgZWxlbWVudC50YWdOYW1lID09PSAnc3Ryb25nJyApIHtcbiAgICAgICAgZm9udCA9ICggdHlwZW9mIGZvbnQgPT09ICdzdHJpbmcnID8gRm9udC5mcm9tQ1NTKCBmb250ICkgOiBmb250ICkuY29weSgge1xuICAgICAgICAgIHdlaWdodDogJ2JvbGQnXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIC8vIEl0YWxpY1xuICAgICAgZWxzZSBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ2knIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gJ2VtJyApIHtcbiAgICAgICAgZm9udCA9ICggdHlwZW9mIGZvbnQgPT09ICdzdHJpbmcnID8gRm9udC5mcm9tQ1NTKCBmb250ICkgOiBmb250ICkuY29weSgge1xuICAgICAgICAgIHN0eWxlOiAnaXRhbGljJ1xuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICAvLyBTdWJzY3JpcHRcbiAgICAgIGVsc2UgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdzdWInICkge1xuICAgICAgICBub2RlLnNjYWxlKCB0aGlzLl9zdWJTY2FsZSApO1xuICAgICAgICAoIG5vZGUgYXMgUmljaFRleHRFbGVtZW50ICkuYWRkRXh0cmFCZWZvcmVTcGFjaW5nKCB0aGlzLl9zdWJYU3BhY2luZyApO1xuICAgICAgICBub2RlLnkgKz0gdGhpcy5fc3ViWU9mZnNldDtcbiAgICAgIH1cbiAgICAgIC8vIFN1cGVyc2NyaXB0XG4gICAgICBlbHNlIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnc3VwJyApIHtcbiAgICAgICAgbm9kZS5zY2FsZSggdGhpcy5fc3VwU2NhbGUgKTtcbiAgICAgICAgKCBub2RlIGFzIFJpY2hUZXh0RWxlbWVudCApLmFkZEV4dHJhQmVmb3JlU3BhY2luZyggdGhpcy5fc3VwWFNwYWNpbmcgKTtcbiAgICAgICAgbm9kZS55ICs9IHRoaXMuX3N1cFlPZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHdlJ3ZlIGFkZGVkIGV4dHJhIHNwYWNpbmcsIHdlJ2xsIG5lZWQgdG8gc3VidHJhY3QgaXQgb2ZmIG9mIG91ciBhdmFpbGFibGUgd2lkdGhcbiAgICAgIGNvbnN0IHNjYWxlID0gbm9kZS5nZXRTY2FsZVZlY3RvcigpLng7XG5cbiAgICAgIC8vIFByb2Nlc3MgY2hpbGRyZW5cbiAgICAgIGlmICggZWxlbWVudC50YWdOYW1lICE9PSAnbm9kZScgKSB7XG4gICAgICAgIHdoaWxlICggbGluZUJyZWFrU3RhdGUgPT09IExpbmVCcmVha1N0YXRlLk5PTkUgJiYgZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggKSB7XG4gICAgICAgICAgY29uc3Qgd2lkdGhCZWZvcmUgPSBub2RlLmJvdW5kcy5pc1ZhbGlkKCkgPyBub2RlLndpZHRoIDogMDtcblxuICAgICAgICAgIGNvbnN0IGNoaWxkRWxlbWVudCA9IGVsZW1lbnQuY2hpbGRyZW5bIDAgXTtcbiAgICAgICAgICBsaW5lQnJlYWtTdGF0ZSA9IHRoaXMuYXBwZW5kRWxlbWVudCggbm9kZSBhcyBSaWNoVGV4dEVsZW1lbnQsIGNoaWxkRWxlbWVudCwgZm9udCwgZmlsbCwgaXNMVFIsIHdpZHRoQXZhaWxhYmxlIC8gc2NhbGUsIGFwcGxpZWRTY2FsZSAqIHNjYWxlICk7XG5cbiAgICAgICAgICAvLyBmb3IgQ09NUExFVEUgb3IgTk9ORSwgd2UnbGwgd2FudCB0byByZW1vdmUgdGhlIGNoaWxkRWxlbWVudCBmcm9tIHRoZSB0cmVlICh3ZSBmdWxseSBwcm9jZXNzZWQgaXQpXG4gICAgICAgICAgaWYgKCBsaW5lQnJlYWtTdGF0ZSAhPT0gTGluZUJyZWFrU3RhdGUuSU5DT01QTEVURSApIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2hpbGRyZW4uc3BsaWNlKCAwLCAxICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgd2lkdGhBZnRlciA9IG5vZGUuYm91bmRzLmlzVmFsaWQoKSA/IG5vZGUud2lkdGggOiAwO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBhbW91bnQgb2Ygd2lkdGggdGFrZW4gdXAgYnkgdGhlIGNoaWxkXG4gICAgICAgICAgd2lkdGhBdmFpbGFibGUgKz0gd2lkdGhCZWZvcmUgLSB3aWR0aEFmdGVyO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgbGluZSBicmVhayBhbmQgdGhlcmUgYXJlIHN0aWxsIG1vcmUgdGhpbmdzIHRvIHByb2Nlc3MsIHdlIGFyZSBpbmNvbXBsZXRlXG4gICAgICAgIGlmICggbGluZUJyZWFrU3RhdGUgPT09IExpbmVCcmVha1N0YXRlLkNPTVBMRVRFICYmIGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoICkge1xuICAgICAgICAgIGxpbmVCcmVha1N0YXRlID0gTGluZUJyZWFrU3RhdGUuSU5DT01QTEVURTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTdWJzY3JpcHQgcG9zaXRpb25pbmdcbiAgICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnc3ViJyApIHtcbiAgICAgICAgaWYgKCBpc0Zpbml0ZSggbm9kZS5oZWlnaHQgKSApIHtcbiAgICAgICAgICBub2RlLmNlbnRlclkgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBTdXBlcnNjcmlwdCBwb3NpdGlvbmluZ1xuICAgICAgZWxzZSBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ3N1cCcgKSB7XG4gICAgICAgIGlmICggaXNGaW5pdGUoIG5vZGUuaGVpZ2h0ICkgKSB7XG4gICAgICAgICAgbm9kZS5jZW50ZXJZID0gUmljaFRleHRVdGlscy5zY3JhdGNoVGV4dC5zZXRTdHJpbmcoICdYJyApLnNldEZvbnQoIGZvbnQgKS50b3AgKiB0aGlzLl9jYXBIZWlnaHRTY2FsZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gVW5kZXJsaW5lXG4gICAgICBlbHNlIGlmICggZWxlbWVudC50YWdOYW1lID09PSAndScgKSB7XG4gICAgICAgIGNvbnN0IHVuZGVybGluZVkgPSAtbm9kZS50b3AgKiB0aGlzLl91bmRlcmxpbmVIZWlnaHRTY2FsZTtcbiAgICAgICAgaWYgKCBpc0Zpbml0ZSggbm9kZS50b3AgKSApIHtcbiAgICAgICAgICBub2RlLmFkZENoaWxkKCBuZXcgTGluZSggbm9kZS5sb2NhbExlZnQsIHVuZGVybGluZVksIG5vZGUubG9jYWxSaWdodCwgdW5kZXJsaW5lWSwge1xuICAgICAgICAgICAgc3Ryb2tlOiBmaWxsLFxuICAgICAgICAgICAgbGluZVdpZHRoOiB0aGlzLl91bmRlcmxpbmVMaW5lV2lkdGhcbiAgICAgICAgICB9ICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gU3RyaWtldGhyb3VnaFxuICAgICAgZWxzZSBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ3MnICkge1xuICAgICAgICBjb25zdCBzdHJpa2V0aHJvdWdoWSA9IG5vZGUudG9wICogdGhpcy5fc3RyaWtldGhyb3VnaEhlaWdodFNjYWxlO1xuICAgICAgICBpZiAoIGlzRmluaXRlKCBub2RlLnRvcCApICkge1xuICAgICAgICAgIG5vZGUuYWRkQ2hpbGQoIG5ldyBMaW5lKCBub2RlLmxvY2FsTGVmdCwgc3RyaWtldGhyb3VnaFksIG5vZGUubG9jYWxSaWdodCwgc3RyaWtldGhyb3VnaFksIHtcbiAgICAgICAgICAgIHN0cm9rZTogZmlsbCxcbiAgICAgICAgICAgIGxpbmVXaWR0aDogdGhpcy5fc3RyaWtldGhyb3VnaExpbmVXaWR0aFxuICAgICAgICAgIH0gKSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICggdGhpcy5fdGFncyAmJiB0aGlzLl90YWdzWyBlbGVtZW50LnRhZ05hbWUgXSAmJiBub2RlLmJvdW5kcy5pc1ZhbGlkKCkgKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsTm9kZSA9IG5vZGU7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsQm91bmRzID0gbm9kZS5ib3VuZHM7XG4gICAgICAgIG5vZGUgPSBSaWNoVGV4dE5vZGUucG9vbC5jcmVhdGUoIHRoaXMuX3RhZ3NbIGVsZW1lbnQudGFnTmFtZSBdKCBub2RlICkgKTtcbiAgICAgICAgaWYgKCBvcmlnaW5hbE5vZGUgIT09IG5vZGUgKSB7XG4gICAgICAgICAgbm9kZS5sb2NhbEJvdW5kcyA9IG9yaWdpbmFsQm91bmRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH1cblxuICAgIGlmICggbm9kZSApIHtcbiAgICAgIGNvbnN0IHdhc0FkZGVkID0gY29udGFpbmVyTm9kZS5hZGRFbGVtZW50KCBub2RlICk7XG4gICAgICBpZiAoICF3YXNBZGRlZCApIHtcbiAgICAgICAgLy8gUmVtb3ZlIGl0IGZyb20gdGhlIGxpbmtJdGVtcyBpZiB3ZSBkaWRuJ3QgYWN0dWFsbHkgYWRkIGl0LlxuICAgICAgICB0aGlzLl9saW5rSXRlbXMgPSB0aGlzLl9saW5rSXRlbXMuZmlsdGVyKCBpdGVtID0+IGl0ZW0ubm9kZSAhPT0gbm9kZSApO1xuXG4gICAgICAgIC8vIEFuZCBzaW5jZSB3ZSB3b24ndCBkaXNwb3NlIGl0IChzaW5jZSBpdCdzIG5vdCBhIGNoaWxkKSwgY2xlYW4gaXQgaGVyZVxuICAgICAgICBub2RlLmNsZWFuKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVCcmVha1N0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHN0cmluZyBkaXNwbGF5ZWQgYnkgb3VyIG5vZGUuXG4gICAqXG4gICAqIE5PVEU6IEVuY29kaW5nIEhUTUwgZW50aXRpZXMgaXMgcmVxdWlyZWQsIGFuZCBtYWxmb3JtZWQgSFRNTCBpcyBub3QgYWNjZXB0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSBzdHJpbmcgLSBUaGUgc3RyaW5nIHRvIGRpc3BsYXkuIElmIGl0J3MgYSBudW1iZXIsIGl0IHdpbGwgYmUgY2FzdCB0byBhIHN0cmluZ1xuICAgKi9cbiAgcHVibGljIHNldFN0cmluZyggc3RyaW5nOiBzdHJpbmcgfCBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RyaW5nICE9PSBudWxsICYmIHN0cmluZyAhPT0gdW5kZWZpbmVkLCAnU3RyaW5nIHNob3VsZCBiZSBkZWZpbmVkIGFuZCBub24tbnVsbC4gVXNlIHRoZSBlbXB0eSBzdHJpbmcgaWYgbmVlZGVkLicgKTtcblxuICAgIC8vIGNhc3QgaXQgdG8gYSBzdHJpbmcgKGZvciBudW1iZXJzLCBldGMuLCBhbmQgZG8gaXQgYmVmb3JlIHRoZSBjaGFuZ2UgZ3VhcmQgc28gd2UgZG9uJ3QgYWNjaWRlbnRhbGx5IHRyaWdnZXIgb24gbm9uLWNoYW5nZWQgc3RyaW5nKVxuICAgIHN0cmluZyA9IGAke3N0cmluZ31gO1xuXG4gICAgdGhpcy5fc3RyaW5nUHJvcGVydHkuc2V0KCBzdHJpbmcgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBzdHJpbmcoIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgKSB7IHRoaXMuc2V0U3RyaW5nKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBzdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0U3RyaW5nKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3RyaW5nIGRpc3BsYXllZCBieSBvdXIgdGV4dCBOb2RlLlxuICAgKi9cbiAgcHVibGljIGdldFN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdHJpbmdQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGRldGVybWluZSBib3VuZHMgZnJvbSB0aGUgdGV4dC4gU2VlIFRleHQuc2V0Qm91bmRzTWV0aG9kIGZvciBkZXRhaWxzXG4gICAqL1xuICBwdWJsaWMgc2V0Qm91bmRzTWV0aG9kKCBtZXRob2Q6IFRleHRCb3VuZHNNZXRob2QgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWV0aG9kID09PSAnZmFzdCcgfHwgbWV0aG9kID09PSAnZmFzdENhbnZhcycgfHwgbWV0aG9kID09PSAnYWNjdXJhdGUnIHx8IG1ldGhvZCA9PT0gJ2h5YnJpZCcsICdVbmtub3duIFRleHQgYm91bmRzTWV0aG9kJyApO1xuICAgIGlmICggbWV0aG9kICE9PSB0aGlzLl9ib3VuZHNNZXRob2QgKSB7XG4gICAgICB0aGlzLl9ib3VuZHNNZXRob2QgPSBtZXRob2Q7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYm91bmRzTWV0aG9kKCB2YWx1ZTogVGV4dEJvdW5kc01ldGhvZCApIHsgdGhpcy5zZXRCb3VuZHNNZXRob2QoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGJvdW5kc01ldGhvZCgpOiBUZXh0Qm91bmRzTWV0aG9kIHsgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzTWV0aG9kKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBtZXRob2QgdG8gZXN0aW1hdGUgdGhlIGJvdW5kcyBvZiB0aGUgdGV4dC4gU2VlIHNldEJvdW5kc01ldGhvZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIGdldEJvdW5kc01ldGhvZCgpOiBUZXh0Qm91bmRzTWV0aG9kIHtcbiAgICByZXR1cm4gdGhpcy5fYm91bmRzTWV0aG9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGZvbnQgb2Ygb3VyIG5vZGUuXG4gICAqL1xuICBwdWJsaWMgc2V0Rm9udCggZm9udDogRm9udCB8IHN0cmluZyApOiB0aGlzIHtcblxuICAgIGlmICggdGhpcy5fZm9udCAhPT0gZm9udCApIHtcbiAgICAgIHRoaXMuX2ZvbnQgPSBmb250O1xuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IGZvbnQoIHZhbHVlOiBGb250IHwgc3RyaW5nICkgeyB0aGlzLnNldEZvbnQoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGZvbnQoKTogRm9udCB8IHN0cmluZyB7IHJldHVybiB0aGlzLmdldEZvbnQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IEZvbnRcbiAgICovXG4gIHB1YmxpYyBnZXRGb250KCk6IEZvbnQgfCBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9mb250O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGZpbGwgb2Ygb3VyIHRleHQuXG4gICAqL1xuICBwdWJsaWMgc2V0RmlsbCggZmlsbDogVFBhaW50ICk6IHRoaXMge1xuICAgIGlmICggdGhpcy5fZmlsbCAhPT0gZmlsbCApIHtcbiAgICAgIHRoaXMuX2ZpbGwgPSBmaWxsO1xuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IGZpbGwoIHZhbHVlOiBUUGFpbnQgKSB7IHRoaXMuc2V0RmlsbCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgZmlsbCgpOiBUUGFpbnQgeyByZXR1cm4gdGhpcy5nZXRGaWxsKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBmaWxsLlxuICAgKi9cbiAgcHVibGljIGdldEZpbGwoKTogVFBhaW50IHtcbiAgICByZXR1cm4gdGhpcy5fZmlsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdHJva2Ugb2Ygb3VyIHRleHQuXG4gICAqL1xuICBwdWJsaWMgc2V0U3Ryb2tlKCBzdHJva2U6IFRQYWludCApOiB0aGlzIHtcbiAgICBpZiAoIHRoaXMuX3N0cm9rZSAhPT0gc3Ryb2tlICkge1xuICAgICAgdGhpcy5fc3Ryb2tlID0gc3Ryb2tlO1xuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHN0cm9rZSggdmFsdWU6IFRQYWludCApIHsgdGhpcy5zZXRTdHJva2UoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHN0cm9rZSgpOiBUUGFpbnQgeyByZXR1cm4gdGhpcy5nZXRTdHJva2UoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHN0cm9rZS5cbiAgICovXG4gIHB1YmxpYyBnZXRTdHJva2UoKTogVFBhaW50IHtcbiAgICByZXR1cm4gdGhpcy5fc3Ryb2tlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxpbmVXaWR0aCBvZiBvdXIgdGV4dC5cbiAgICovXG4gIHB1YmxpYyBzZXRMaW5lV2lkdGgoIGxpbmVXaWR0aDogbnVtYmVyICk6IHRoaXMge1xuICAgIGlmICggdGhpcy5fbGluZVdpZHRoICE9PSBsaW5lV2lkdGggKSB7XG4gICAgICB0aGlzLl9saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgbGluZVdpZHRoKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldExpbmVXaWR0aCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgbGluZVdpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldExpbmVXaWR0aCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgbGluZVdpZHRoLlxuICAgKi9cbiAgcHVibGljIGdldExpbmVXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9saW5lV2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc2NhbGUgKHJlbGF0aXZlIHRvIDEpIG9mIGFueSBzdHJpbmcgdW5kZXIgc3Vic2NyaXB0ICg8c3ViPikgZWxlbWVudHMuXG4gICAqL1xuICBwdWJsaWMgc2V0U3ViU2NhbGUoIHN1YlNjYWxlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHN1YlNjYWxlICkgJiYgc3ViU2NhbGUgPiAwICk7XG5cbiAgICBpZiAoIHRoaXMuX3N1YlNjYWxlICE9PSBzdWJTY2FsZSApIHtcbiAgICAgIHRoaXMuX3N1YlNjYWxlID0gc3ViU2NhbGU7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgc3ViU2NhbGUoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0U3ViU2NhbGUoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHN1YlNjYWxlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFN1YlNjYWxlKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2NhbGUgKHJlbGF0aXZlIHRvIDEpIG9mIGFueSBzdHJpbmcgdW5kZXIgc3Vic2NyaXB0ICg8c3ViPikgZWxlbWVudHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3ViU2NhbGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fc3ViU2NhbGU7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaG9yaXpvbnRhbCBzcGFjaW5nIGJlZm9yZSBhbnkgc3Vic2NyaXB0ICg8c3ViPikgZWxlbWVudHMuXG4gICAqL1xuICBwdWJsaWMgc2V0U3ViWFNwYWNpbmcoIHN1YlhTcGFjaW5nOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHN1YlhTcGFjaW5nICkgKTtcblxuICAgIGlmICggdGhpcy5fc3ViWFNwYWNpbmcgIT09IHN1YlhTcGFjaW5nICkge1xuICAgICAgdGhpcy5fc3ViWFNwYWNpbmcgPSBzdWJYU3BhY2luZztcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBzdWJYU3BhY2luZyggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdWJYU3BhY2luZyggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgc3ViWFNwYWNpbmcoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0U3ViWFNwYWNpbmcoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBob3Jpem9udGFsIHNwYWNpbmcgYmVmb3JlIGFueSBzdWJzY3JpcHQgKDxzdWI+KSBlbGVtZW50cy5cbiAgICovXG4gIHB1YmxpYyBnZXRTdWJYU3BhY2luZygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zdWJYU3BhY2luZztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhZGp1c3RtZW50IG9mZnNldCB0byB0aGUgdmVydGljYWwgcGxhY2VtZW50IG9mIGFueSBzdWJzY3JpcHQgKDxzdWI+KSBlbGVtZW50cy5cbiAgICovXG4gIHB1YmxpYyBzZXRTdWJZT2Zmc2V0KCBzdWJZT2Zmc2V0OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHN1YllPZmZzZXQgKSApO1xuXG4gICAgaWYgKCB0aGlzLl9zdWJZT2Zmc2V0ICE9PSBzdWJZT2Zmc2V0ICkge1xuICAgICAgdGhpcy5fc3ViWU9mZnNldCA9IHN1YllPZmZzZXQ7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgc3ViWU9mZnNldCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdWJZT2Zmc2V0KCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBzdWJZT2Zmc2V0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFN1YllPZmZzZXQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhZGp1c3RtZW50IG9mZnNldCB0byB0aGUgdmVydGljYWwgcGxhY2VtZW50IG9mIGFueSBzdWJzY3JpcHQgKDxzdWI+KSBlbGVtZW50cy5cbiAgICovXG4gIHB1YmxpYyBnZXRTdWJZT2Zmc2V0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YllPZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc2NhbGUgKHJlbGF0aXZlIHRvIDEpIG9mIGFueSBzdHJpbmcgdW5kZXIgc3VwZXJzY3JpcHQgKDxzdXA+KSBlbGVtZW50cy5cbiAgICovXG4gIHB1YmxpYyBzZXRTdXBTY2FsZSggc3VwU2NhbGU6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3VwU2NhbGUgKSAmJiBzdXBTY2FsZSA+IDAgKTtcblxuICAgIGlmICggdGhpcy5fc3VwU2NhbGUgIT09IHN1cFNjYWxlICkge1xuICAgICAgdGhpcy5fc3VwU2NhbGUgPSBzdXBTY2FsZTtcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBzdXBTY2FsZSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdXBTY2FsZSggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgc3VwU2NhbGUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0U3VwU2NhbGUoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzY2FsZSAocmVsYXRpdmUgdG8gMSkgb2YgYW55IHN0cmluZyB1bmRlciBzdXBlcnNjcmlwdCAoPHN1cD4pIGVsZW1lbnRzLlxuICAgKi9cbiAgcHVibGljIGdldFN1cFNjYWxlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N1cFNjYWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGhvcml6b250YWwgc3BhY2luZyBiZWZvcmUgYW55IHN1cGVyc2NyaXB0ICg8c3VwPikgZWxlbWVudHMuXG4gICAqL1xuICBwdWJsaWMgc2V0U3VwWFNwYWNpbmcoIHN1cFhTcGFjaW5nOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHN1cFhTcGFjaW5nICkgKTtcblxuICAgIGlmICggdGhpcy5fc3VwWFNwYWNpbmcgIT09IHN1cFhTcGFjaW5nICkge1xuICAgICAgdGhpcy5fc3VwWFNwYWNpbmcgPSBzdXBYU3BhY2luZztcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBzdXBYU3BhY2luZyggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdXBYU3BhY2luZyggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgc3VwWFNwYWNpbmcoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0U3VwWFNwYWNpbmcoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBob3Jpem9udGFsIHNwYWNpbmcgYmVmb3JlIGFueSBzdXBlcnNjcmlwdCAoPHN1cD4pIGVsZW1lbnRzLlxuICAgKi9cbiAgcHVibGljIGdldFN1cFhTcGFjaW5nKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N1cFhTcGFjaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFkanVzdG1lbnQgb2Zmc2V0IHRvIHRoZSB2ZXJ0aWNhbCBwbGFjZW1lbnQgb2YgYW55IHN1cGVyc2NyaXB0ICg8c3VwPikgZWxlbWVudHMuXG4gICAqL1xuICBwdWJsaWMgc2V0U3VwWU9mZnNldCggc3VwWU9mZnNldDogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBzdXBZT2Zmc2V0ICkgKTtcblxuICAgIGlmICggdGhpcy5fc3VwWU9mZnNldCAhPT0gc3VwWU9mZnNldCApIHtcbiAgICAgIHRoaXMuX3N1cFlPZmZzZXQgPSBzdXBZT2Zmc2V0O1xuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHN1cFlPZmZzZXQoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0U3VwWU9mZnNldCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgc3VwWU9mZnNldCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRTdXBZT2Zmc2V0KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWRqdXN0bWVudCBvZmZzZXQgdG8gdGhlIHZlcnRpY2FsIHBsYWNlbWVudCBvZiBhbnkgc3VwZXJzY3JpcHQgKDxzdXA+KSBlbGVtZW50cy5cbiAgICovXG4gIHB1YmxpYyBnZXRTdXBZT2Zmc2V0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N1cFlPZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZXhwZWN0ZWQgY2FwIGhlaWdodCAoYmFzZWxpbmUgdG8gdG9wIG9mIGNhcGl0YWwgbGV0dGVycykgYXMgYSBzY2FsZSBvZiB0aGUgZGV0ZWN0ZWQgZGlzdGFuY2UgZnJvbSB0aGVcbiAgICogYmFzZWxpbmUgdG8gdGhlIHRvcCBvZiB0aGUgdGV4dCBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2V0Q2FwSGVpZ2h0U2NhbGUoIGNhcEhlaWdodFNjYWxlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGNhcEhlaWdodFNjYWxlICkgJiYgY2FwSGVpZ2h0U2NhbGUgPiAwICk7XG5cbiAgICBpZiAoIHRoaXMuX2NhcEhlaWdodFNjYWxlICE9PSBjYXBIZWlnaHRTY2FsZSApIHtcbiAgICAgIHRoaXMuX2NhcEhlaWdodFNjYWxlID0gY2FwSGVpZ2h0U2NhbGU7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgY2FwSGVpZ2h0U2NhbGUoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0Q2FwSGVpZ2h0U2NhbGUoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGNhcEhlaWdodFNjYWxlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldENhcEhlaWdodFNjYWxlKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZXhwZWN0ZWQgY2FwIGhlaWdodCAoYmFzZWxpbmUgdG8gdG9wIG9mIGNhcGl0YWwgbGV0dGVycykgYXMgYSBzY2FsZSBvZiB0aGUgZGV0ZWN0ZWQgZGlzdGFuY2UgZnJvbSB0aGVcbiAgICogYmFzZWxpbmUgdG8gdGhlIHRvcCBvZiB0aGUgdGV4dCBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2FwSGVpZ2h0U2NhbGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY2FwSGVpZ2h0U2NhbGU7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbGluZVdpZHRoIG9mIHVuZGVybGluZSBsaW5lcy5cbiAgICovXG4gIHB1YmxpYyBzZXRVbmRlcmxpbmVMaW5lV2lkdGgoIHVuZGVybGluZUxpbmVXaWR0aDogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB1bmRlcmxpbmVMaW5lV2lkdGggKSAmJiB1bmRlcmxpbmVMaW5lV2lkdGggPiAwICk7XG5cbiAgICBpZiAoIHRoaXMuX3VuZGVybGluZUxpbmVXaWR0aCAhPT0gdW5kZXJsaW5lTGluZVdpZHRoICkge1xuICAgICAgdGhpcy5fdW5kZXJsaW5lTGluZVdpZHRoID0gdW5kZXJsaW5lTGluZVdpZHRoO1xuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHVuZGVybGluZUxpbmVXaWR0aCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRVbmRlcmxpbmVMaW5lV2lkdGgoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHVuZGVybGluZUxpbmVXaWR0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRVbmRlcmxpbmVMaW5lV2lkdGgoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsaW5lV2lkdGggb2YgdW5kZXJsaW5lIGxpbmVzLlxuICAgKi9cbiAgcHVibGljIGdldFVuZGVybGluZUxpbmVXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl91bmRlcmxpbmVMaW5lV2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdW5kZXJsaW5lIGhlaWdodCBhZGp1c3RtZW50IGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgZGV0ZWN0ZWQgZGlzdGFuY2UgZnJvbSB0aGUgYmFzZWxpbmUgdG8gdGhlIHRvcCBvZiB0aGVcbiAgICogdGV4dCBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2V0VW5kZXJsaW5lSGVpZ2h0U2NhbGUoIHVuZGVybGluZUhlaWdodFNjYWxlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHVuZGVybGluZUhlaWdodFNjYWxlICkgJiYgdW5kZXJsaW5lSGVpZ2h0U2NhbGUgPiAwICk7XG5cbiAgICBpZiAoIHRoaXMuX3VuZGVybGluZUhlaWdodFNjYWxlICE9PSB1bmRlcmxpbmVIZWlnaHRTY2FsZSApIHtcbiAgICAgIHRoaXMuX3VuZGVybGluZUhlaWdodFNjYWxlID0gdW5kZXJsaW5lSGVpZ2h0U2NhbGU7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdW5kZXJsaW5lSGVpZ2h0U2NhbGUoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0VW5kZXJsaW5lSGVpZ2h0U2NhbGUoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHVuZGVybGluZUhlaWdodFNjYWxlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFVuZGVybGluZUhlaWdodFNjYWxlKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdW5kZXJsaW5lIGhlaWdodCBhZGp1c3RtZW50IGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgZGV0ZWN0ZWQgZGlzdGFuY2UgZnJvbSB0aGUgYmFzZWxpbmUgdG8gdGhlIHRvcCBvZiB0aGVcbiAgICogdGV4dCBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0VW5kZXJsaW5lSGVpZ2h0U2NhbGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdW5kZXJsaW5lSGVpZ2h0U2NhbGU7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbGluZVdpZHRoIG9mIHN0cmlrZXRocm91Z2ggbGluZXMuXG4gICAqL1xuICBwdWJsaWMgc2V0U3RyaWtldGhyb3VnaExpbmVXaWR0aCggc3RyaWtldGhyb3VnaExpbmVXaWR0aDogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBzdHJpa2V0aHJvdWdoTGluZVdpZHRoICkgJiYgc3RyaWtldGhyb3VnaExpbmVXaWR0aCA+IDAgKTtcblxuICAgIGlmICggdGhpcy5fc3RyaWtldGhyb3VnaExpbmVXaWR0aCAhPT0gc3RyaWtldGhyb3VnaExpbmVXaWR0aCApIHtcbiAgICAgIHRoaXMuX3N0cmlrZXRocm91Z2hMaW5lV2lkdGggPSBzdHJpa2V0aHJvdWdoTGluZVdpZHRoO1xuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHN0cmlrZXRocm91Z2hMaW5lV2lkdGgoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0U3RyaWtldGhyb3VnaExpbmVXaWR0aCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgc3RyaWtldGhyb3VnaExpbmVXaWR0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRTdHJpa2V0aHJvdWdoTGluZVdpZHRoKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGluZVdpZHRoIG9mIHN0cmlrZXRocm91Z2ggbGluZXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3RyaWtldGhyb3VnaExpbmVXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zdHJpa2V0aHJvdWdoTGluZVdpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHN0cmlrZXRocm91Z2ggaGVpZ2h0IGFkanVzdG1lbnQgYXMgYSBwcm9wb3J0aW9uIG9mIHRoZSBkZXRlY3RlZCBkaXN0YW5jZSBmcm9tIHRoZSBiYXNlbGluZSB0byB0aGUgdG9wIG9mIHRoZVxuICAgKiB0ZXh0IGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBzZXRTdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUoIHN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZTogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBzdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUgKSAmJiBzdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUgPiAwICk7XG5cbiAgICBpZiAoIHRoaXMuX3N0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSAhPT0gc3RyaWtldGhyb3VnaEhlaWdodFNjYWxlICkge1xuICAgICAgdGhpcy5fc3RyaWtldGhyb3VnaEhlaWdodFNjYWxlID0gc3RyaWtldGhyb3VnaEhlaWdodFNjYWxlO1xuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRTdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdHJpa2V0aHJvdWdoIGhlaWdodCBhZGp1c3RtZW50IGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgZGV0ZWN0ZWQgZGlzdGFuY2UgZnJvbSB0aGUgYmFzZWxpbmUgdG8gdGhlIHRvcCBvZiB0aGVcbiAgICogdGV4dCBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3RyaWtldGhyb3VnaEhlaWdodFNjYWxlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmlrZXRocm91Z2hIZWlnaHRTY2FsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjb2xvciBvZiBsaW5rcy4gSWYgbnVsbCwgbm8gZmlsbCB3aWxsIGJlIG92ZXJyaWRkZW4uXG4gICAqL1xuICBwdWJsaWMgc2V0TGlua0ZpbGwoIGxpbmtGaWxsOiBUUGFpbnQgKTogdGhpcyB7XG4gICAgaWYgKCB0aGlzLl9saW5rRmlsbCAhPT0gbGlua0ZpbGwgKSB7XG4gICAgICB0aGlzLl9saW5rRmlsbCA9IGxpbmtGaWxsO1xuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IGxpbmtGaWxsKCB2YWx1ZTogVFBhaW50ICkgeyB0aGlzLnNldExpbmtGaWxsKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBsaW5rRmlsbCgpOiBUUGFpbnQgeyByZXR1cm4gdGhpcy5nZXRMaW5rRmlsbCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbG9yIG9mIGxpbmtzLlxuICAgKi9cbiAgcHVibGljIGdldExpbmtGaWxsKCk6IFRQYWludCB7XG4gICAgcmV0dXJuIHRoaXMuX2xpbmtGaWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciBsaW5rIGNsaWNrcyB3aWxsIGNhbGwgZXZlbnQuaGFuZGxlKCkuXG4gICAqL1xuICBwdWJsaWMgc2V0TGlua0V2ZW50c0hhbmRsZWQoIGxpbmtFdmVudHNIYW5kbGVkOiBib29sZWFuICk6IHRoaXMge1xuICAgIGlmICggdGhpcy5fbGlua0V2ZW50c0hhbmRsZWQgIT09IGxpbmtFdmVudHNIYW5kbGVkICkge1xuICAgICAgdGhpcy5fbGlua0V2ZW50c0hhbmRsZWQgPSBsaW5rRXZlbnRzSGFuZGxlZDtcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBsaW5rRXZlbnRzSGFuZGxlZCggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0TGlua0V2ZW50c0hhbmRsZWQoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGxpbmtFdmVudHNIYW5kbGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRMaW5rRXZlbnRzSGFuZGxlZCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBsaW5rIGV2ZW50cyB3aWxsIGJlIGhhbmRsZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0TGlua0V2ZW50c0hhbmRsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2xpbmtFdmVudHNIYW5kbGVkO1xuICB9XG5cbiAgcHVibGljIHNldExpbmtzKCBsaW5rczogUmljaFRleHRMaW5rcyApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsaW5rcyA9PT0gdHJ1ZSB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIGxpbmtzICkgPT09IE9iamVjdC5wcm90b3R5cGUgKTtcblxuICAgIGlmICggdGhpcy5fbGlua3MgIT09IGxpbmtzICkge1xuICAgICAgdGhpcy5fbGlua3MgPSBsaW5rcztcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBsaW5rIGV2ZW50cyB3aWxsIGJlIGhhbmRsZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0TGlua3MoKTogUmljaFRleHRMaW5rcyB7XG4gICAgcmV0dXJuIHRoaXMuX2xpbmtzO1xuICB9XG5cbiAgcHVibGljIHNldCBsaW5rcyggdmFsdWU6IFJpY2hUZXh0TGlua3MgKSB7IHRoaXMuc2V0TGlua3MoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGxpbmtzKCk6IFJpY2hUZXh0TGlua3MgeyByZXR1cm4gdGhpcy5nZXRMaW5rcygpOyB9XG5cbiAgcHVibGljIHNldE5vZGVzKCBub2RlczogUmVjb3JkPHN0cmluZywgTm9kZT4gKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggT2JqZWN0LmdldFByb3RvdHlwZU9mKCBub2RlcyApID09PSBPYmplY3QucHJvdG90eXBlICk7XG5cbiAgICBpZiAoIHRoaXMuX25vZGVzICE9PSBub2RlcyApIHtcbiAgICAgIHRoaXMuX25vZGVzID0gbm9kZXM7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIGdldE5vZGVzKCk6IFJlY29yZDxzdHJpbmcsIE5vZGU+IHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IG5vZGVzKCB2YWx1ZTogUmVjb3JkPHN0cmluZywgTm9kZT4gKSB7IHRoaXMuc2V0Tm9kZXMoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IG5vZGVzKCk6IFJlY29yZDxzdHJpbmcsIE5vZGU+IHsgcmV0dXJuIHRoaXMuZ2V0Tm9kZXMoKTsgfVxuXG4gIHB1YmxpYyBzZXRUYWdzKCB0YWdzOiBSZWNvcmQ8c3RyaW5nLCAoIG5vZGU6IE5vZGUgKSA9PiBOb2RlPiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIHRhZ3MgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSApO1xuXG4gICAgaWYgKCB0aGlzLl90YWdzICE9PSB0YWdzICkge1xuICAgICAgdGhpcy5fdGFncyA9IHRhZ3M7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIGdldFRhZ3MoKTogUmVjb3JkPHN0cmluZywgKCBub2RlOiBOb2RlICkgPT4gTm9kZT4ge1xuICAgIHJldHVybiB0aGlzLl90YWdzO1xuICB9XG5cbiAgcHVibGljIHNldCB0YWdzKCB2YWx1ZTogUmVjb3JkPHN0cmluZywgKCBub2RlOiBOb2RlICkgPT4gTm9kZT4gKSB7IHRoaXMuc2V0VGFncyggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgdGFncygpOiBSZWNvcmQ8c3RyaW5nLCAoIG5vZGU6IE5vZGUgKSA9PiBOb2RlPiB7IHJldHVybiB0aGlzLmdldFRhZ3MoKTsgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoZXRoZXIgbmV3bGluZXMgYXJlIHJlcGxhY2VkIHdpdGggPGJyPlxuICAgKi9cbiAgcHVibGljIHNldFJlcGxhY2VOZXdsaW5lcyggcmVwbGFjZU5ld2xpbmVzOiBib29sZWFuICk6IHRoaXMge1xuICAgIGlmICggdGhpcy5fcmVwbGFjZU5ld2xpbmVzICE9PSByZXBsYWNlTmV3bGluZXMgKSB7XG4gICAgICB0aGlzLl9yZXBsYWNlTmV3bGluZXMgPSByZXBsYWNlTmV3bGluZXM7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmVwbGFjZU5ld2xpbmVzKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRSZXBsYWNlTmV3bGluZXMoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHJlcGxhY2VOZXdsaW5lcygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0UmVwbGFjZU5ld2xpbmVzKCk7IH1cblxuICBwdWJsaWMgZ2V0UmVwbGFjZU5ld2xpbmVzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9yZXBsYWNlTmV3bGluZXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYWxpZ25tZW50IG9mIHRleHQgKG9ubHkgcmVsZXZhbnQgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGxpbmVzKS5cbiAgICovXG4gIHB1YmxpYyBzZXRBbGlnbiggYWxpZ246IFJpY2hUZXh0QWxpZ24gKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYWxpZ24gPT09ICdsZWZ0JyB8fCBhbGlnbiA9PT0gJ2NlbnRlcicgfHwgYWxpZ24gPT09ICdyaWdodCcgKTtcblxuICAgIGlmICggdGhpcy5fYWxpZ24gIT09IGFsaWduICkge1xuICAgICAgdGhpcy5fYWxpZ24gPSBhbGlnbjtcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBhbGlnbiggdmFsdWU6IFJpY2hUZXh0QWxpZ24gKSB7IHRoaXMuc2V0QWxpZ24oIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGFsaWduKCk6IFJpY2hUZXh0QWxpZ24geyByZXR1cm4gdGhpcy5nZXRBbGlnbigpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgYWxpZ25tZW50IG9mIHRoZSB0ZXh0IChvbmx5IHJlbGV2YW50IGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBsaW5lcykuXG4gICAqL1xuICBwdWJsaWMgZ2V0QWxpZ24oKTogUmljaFRleHRBbGlnbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FsaWduO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxlYWRpbmcgKHNwYWNpbmcgYmV0d2VlbiBsaW5lcylcbiAgICovXG4gIHB1YmxpYyBzZXRMZWFkaW5nKCBsZWFkaW5nOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGxlYWRpbmcgKSApO1xuXG4gICAgaWYgKCB0aGlzLl9sZWFkaW5nICE9PSBsZWFkaW5nICkge1xuICAgICAgdGhpcy5fbGVhZGluZyA9IGxlYWRpbmc7XG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgbGVhZGluZyggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRMZWFkaW5nKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBsZWFkaW5nKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldExlYWRpbmcoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsZWFkaW5nIChzcGFjaW5nIGJldHdlZW4gbGluZXMpXG4gICAqL1xuICBwdWJsaWMgZ2V0TGVhZGluZygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9sZWFkaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxpbmUgd3JhcCB3aWR0aCBmb3IgdGhlIHRleHQgKG9yIG51bGwgaWYgbm9uZSBpcyBkZXNpcmVkKS4gTGluZXMgbG9uZ2VyIHRoYW4gdGhpcyBsZW5ndGggd2lsbCB3cmFwXG4gICAqIGF1dG9tYXRpY2FsbHkgdG8gdGhlIG5leHQgbGluZS5cbiAgICpcbiAgICogQHBhcmFtIGxpbmVXcmFwIC0gSWYgaXQncyBhIG51bWJlciwgaXQgc2hvdWxkIGJlIGdyZWF0ZXIgdGhhbiAwLlxuICAgKi9cbiAgcHVibGljIHNldExpbmVXcmFwKCBsaW5lV3JhcDogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnMsICdsaW5lV3JhcCc+ICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpbmVXcmFwID09PSBudWxsIHx8IGxpbmVXcmFwID09PSAnc3RyZXRjaCcgfHwgKCBpc0Zpbml0ZSggbGluZVdyYXAgKSAmJiBsaW5lV3JhcCA+IDAgKSApO1xuXG4gICAgaWYgKCB0aGlzLl9saW5lV3JhcCAhPT0gbGluZVdyYXAgKSB7XG4gICAgICB0aGlzLl9saW5lV3JhcCA9IGxpbmVXcmFwO1xuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IGxpbmVXcmFwKCB2YWx1ZTogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnMsICdsaW5lV3JhcCc+ICkgeyB0aGlzLnNldExpbmVXcmFwKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBsaW5lV3JhcCgpOiBSZXF1aXJlZE9wdGlvbjxTZWxmT3B0aW9ucywgJ2xpbmVXcmFwJz4geyByZXR1cm4gdGhpcy5nZXRMaW5lV3JhcCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxpbmUgd3JhcCB3aWR0aC5cbiAgICovXG4gIHB1YmxpYyBnZXRMaW5lV3JhcCgpOiBSZXF1aXJlZE9wdGlvbjxTZWxmT3B0aW9ucywgJ2xpbmVXcmFwJz4ge1xuICAgIHJldHVybiB0aGlzLl9saW5lV3JhcDtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBtdXRhdGUoIG9wdGlvbnM/OiBSaWNoVGV4dE9wdGlvbnMgKTogdGhpcyB7XG5cbiAgICBpZiAoIGFzc2VydCAmJiBvcHRpb25zICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdzdHJpbmcnICkgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggVGV4dC5TVFJJTkdfUFJPUEVSVFlfTkFNRSApICYmIG9wdGlvbnMuc3RyaW5nUHJvcGVydHkgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnN0cmluZ1Byb3BlcnR5LnZhbHVlID09PSBvcHRpb25zLnN0cmluZywgJ0lmIGJvdGggc3RyaW5nIGFuZCBzdHJpbmdQcm9wZXJ0eSBhcmUgcHJvdmlkZWQsIHRoZW4gdmFsdWVzIHNob3VsZCBtYXRjaCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIubXV0YXRlKCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHdyYXBwZWQgdmVyc2lvbiBvZiB0aGUgc3RyaW5nIHdpdGggYSBmb250IHNwZWNpZmllciB0aGF0IHVzZXMgdGhlIGdpdmVuIGZvbnQgb2JqZWN0LlxuICAgKlxuICAgKiBOT1RFOiBEb2VzIGFuIGFwcHJveGltYXRpb24gb2Ygc29tZSBmb250IHZhbHVlcyAodXNpbmcgPGI+IG9yIDxpPiksIGFuZCBjYW5ub3QgZm9yY2UgdGhlIGxhY2sgb2YgdGhvc2UgaWYgaXQgaXNcbiAgICogaW5jbHVkZWQgaW4gYm9sZC9pdGFsaWMgZXh0ZXJpb3IgdGFncy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc3RyaW5nV2l0aEZvbnQoIHN0cjogc3RyaW5nLCBmb250OiBGb250ICk6IHN0cmluZyB7XG4gICAgLy8gVE9ETzogRVM2IHN0cmluZyBpbnRlcnBvbGF0aW9uLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHJldHVybiBgJHsnPHNwYW4gc3R5bGU9XFwnJyArXG4gICAgICAgICAgICdmb250LXN0eWxlOiAnfSR7Zm9udC5zdHlsZX07YCArXG4gICAgICAgICAgIGBmb250LXZhcmlhbnQ6ICR7Zm9udC52YXJpYW50fTtgICtcbiAgICAgICAgICAgYGZvbnQtd2VpZ2h0OiAke2ZvbnQud2VpZ2h0fTtgICtcbiAgICAgICAgICAgYGZvbnQtc3RyZXRjaDogJHtmb250LnN0cmV0Y2h9O2AgK1xuICAgICAgICAgICBgZm9udC1zaXplOiAke2ZvbnQuc2l6ZX07YCArXG4gICAgICAgICAgIGBmb250LWZhbWlseTogJHtmb250LmZhbWlseX07YCArXG4gICAgICAgICAgIGBsaW5lLWhlaWdodDogJHtmb250LmxpbmVIZWlnaHR9O2AgK1xuICAgICAgICAgICBgJz4ke3N0cn08L3NwYW4+YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdHJpbmdpZmllcyBhbiBIVE1MIHN1YnRyZWUgZGVmaW5lZCBieSB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaGltYWxheWFFbGVtZW50VG9TdHJpbmcoIGVsZW1lbnQ6IEhpbWFsYXlhTm9kZSApOiBzdHJpbmcge1xuICAgIGlmICggaXNIaW1hbGF5YVRleHROb2RlKCBlbGVtZW50ICkgKSB7XG4gICAgICByZXR1cm4gUmljaFRleHQuY29udGVudFRvU3RyaW5nKCBlbGVtZW50LmNvbnRlbnQgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGlzSGltYWxheWFFbGVtZW50Tm9kZSggZWxlbWVudCApICkge1xuICAgICAgY29uc3QgY29udGVudCA9IGVsZW1lbnQuY2hpbGRyZW4ubWFwKCBjaGlsZCA9PiBSaWNoVGV4dC5oaW1hbGF5YUVsZW1lbnRUb1N0cmluZyggY2hpbGQgKSApLmpvaW4oICcnICk7XG5cbiAgICAgIGNvbnN0IGRpciA9IFJpY2hUZXh0VXRpbHMuaGltYWxheWFHZXRBdHRyaWJ1dGUoICdkaXInLCBlbGVtZW50ICk7XG5cbiAgICAgIGlmICggZGlyID09PSAnbHRyJyB8fCBkaXIgPT09ICdydGwnICkge1xuICAgICAgICByZXR1cm4gU3RyaW5nVXRpbHMud3JhcERpcmVjdGlvbiggY29udGVudCwgZGlyICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdHJpbmdpZmllcyBhbiBIVE1MIHN1YnRyZWUgZGVmaW5lZCBieSB0aGUgZ2l2ZW4gZWxlbWVudCwgYnV0IHJlbW92aW5nIGNlcnRhaW4gdGFncyB0aGF0IHdlIGRvbid0IG5lZWQgZm9yXG4gICAqIGFjY2Vzc2liaWxpdHkgKGxpa2UgPGE+LCA8c3Bhbj4sIGV0Yy4pLCBhbmQgYWRkaW5nIGluIHRhZ3Mgd2UgZG8gd2FudCAoc2VlIEFDQ0VTU0lCTEVfVEFHUykuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGhpbWFsYXlhRWxlbWVudFRvQWNjZXNzaWJsZVN0cmluZyggZWxlbWVudDogSGltYWxheWFOb2RlICk6IHN0cmluZyB7XG4gICAgaWYgKCBpc0hpbWFsYXlhVGV4dE5vZGUoIGVsZW1lbnQgKSApIHtcbiAgICAgIHJldHVybiBSaWNoVGV4dC5jb250ZW50VG9TdHJpbmcoIGVsZW1lbnQuY29udGVudCApO1xuICAgIH1cbiAgICBlbHNlIGlmICggaXNIaW1hbGF5YUVsZW1lbnROb2RlKCBlbGVtZW50ICkgKSB7XG4gICAgICBsZXQgY29udGVudCA9IGVsZW1lbnQuY2hpbGRyZW4ubWFwKCBjaGlsZCA9PiBSaWNoVGV4dC5oaW1hbGF5YUVsZW1lbnRUb0FjY2Vzc2libGVTdHJpbmcoIGNoaWxkICkgKS5qb2luKCAnJyApO1xuXG4gICAgICBjb25zdCBkaXIgPSBSaWNoVGV4dFV0aWxzLmhpbWFsYXlhR2V0QXR0cmlidXRlKCAnZGlyJywgZWxlbWVudCApO1xuXG4gICAgICBpZiAoIGRpciA9PT0gJ2x0cicgfHwgZGlyID09PSAncnRsJyApIHtcbiAgICAgICAgY29udGVudCA9IFN0cmluZ1V0aWxzLndyYXBEaXJlY3Rpb24oIGNvbnRlbnQsIGRpciApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIF8uaW5jbHVkZXMoIEFDQ0VTU0lCTEVfVEFHUywgZWxlbWVudC50YWdOYW1lICkgKSB7XG4gICAgICAgIHJldHVybiBgPCR7ZWxlbWVudC50YWdOYW1lfT4ke2NvbnRlbnR9PC8ke2VsZW1lbnQudGFnTmFtZX0+YDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgYSBnaXZlbiBzdHJpbmcgd2l0aCBIVE1MIG1hcmt1cCBpbnRvIGEgc3RyaW5nIHN1aXRhYmxlIGZvciBzY3JlZW4gcmVhZGVycy5cbiAgICogUHJlc2VydmVzIGJhc2ljIHN0eWxpbmcgdGFncyB3aGlsZSByZW1vdmluZyBub24tYWNjZXNzaWJsZSBtYXJrdXAuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldEFjY2Vzc2libGVTdHJpbmdQcm9wZXJ0eSggc3RyaW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gKTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBEZXJpdmVkU3RyaW5nUHJvcGVydHkoIFsgc3RyaW5nUHJvcGVydHkgXSwgc3RyaW5nID0+IHtcbiAgICAgIGNvbnN0IHJvb3RFbGVtZW50czogSGltYWxheWFOb2RlW10gPSBoaW1hbGF5YVZhci5wYXJzZSggc3RyaW5nICk7XG5cbiAgICAgIGxldCBhY2Nlc3NpYmxlU3RyaW5nID0gJyc7XG4gICAgICByb290RWxlbWVudHMuZm9yRWFjaCggZWxlbWVudCA9PiB7XG4gICAgICAgIGFjY2Vzc2libGVTdHJpbmcgKz0gUmljaFRleHQuaGltYWxheWFFbGVtZW50VG9BY2Nlc3NpYmxlU3RyaW5nKCBlbGVtZW50ICk7XG4gICAgICB9ICk7XG5cbiAgICAgIHJldHVybiBhY2Nlc3NpYmxlU3RyaW5nO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyB0aGUgZWxlbWVudC5jb250ZW50IGZyb20gaGltYWxheWEsIHVuZXNjYXBlcyBIVE1MIGVudGl0aWVzLCBhbmQgYXBwbGllcyB0aGUgcHJvcGVyIGRpcmVjdGlvbmFsIHRhZ3MuXG4gICAqXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8zMTVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY29udGVudFRvU3RyaW5nKCBjb250ZW50OiBzdHJpbmcsIGlzTFRSPzogYm9vbGVhbiApOiBzdHJpbmcge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSB3ZSBzaG91bGQgZ2V0IGEgc3RyaW5nIGZyb20gdGhpc1xuICAgIGNvbnN0IHVuZXNjYXBlZENvbnRlbnQ6IHN0cmluZyA9IGhlLmRlY29kZSggY29udGVudCApO1xuXG4gICAgcmV0dXJuIGlzTFRSID09PSB1bmRlZmluZWQgPyB1bmVzY2FwZWRDb250ZW50IDogYCR7aXNMVFIgPyAnXFx1MjAyYScgOiAnXFx1MjAyYid9JHt1bmVzY2FwZWRDb250ZW50fVxcdTIwMmNgO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBSaWNoVGV4dElPOiBJT1R5cGU7XG59XG5cbi8qKlxuICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IG5vZGUubXV0YXRlKCBvcHRpb25zICksIGluIHRoZVxuICogb3JkZXIgdGhleSB3aWxsIGJlIGV2YWx1YXRlZCBpbi5cbiAqXG4gKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcbiAqICAgICAgIGNhc2VzIHRoYXQgbWF5IGFwcGx5LlxuICovXG5SaWNoVGV4dC5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gUklDSF9URVhUX09QVElPTl9LRVlTLmNvbmNhdCggTm9kZS5wcm90b3R5cGUuX211dGF0b3JLZXlzICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdSaWNoVGV4dCcsIFJpY2hUZXh0ICk7XG5cblJpY2hUZXh0LlJpY2hUZXh0SU8gPSBuZXcgSU9UeXBlKCAnUmljaFRleHRJTycsIHtcbiAgdmFsdWVUeXBlOiBSaWNoVGV4dCxcbiAgc3VwZXJ0eXBlOiBOb2RlLk5vZGVJTyxcbiAgZG9jdW1lbnRhdGlvbjogJ1RoZSBQaEVULWlPIFR5cGUgZm9yIHRoZSBzY2VuZXJ5IFJpY2hUZXh0IG5vZGUnXG59ICk7Il0sIm5hbWVzIjpbIkRlcml2ZWRTdHJpbmdQcm9wZXJ0eSIsIlN0cmluZ1Byb3BlcnR5IiwiVGlueUZvcndhcmRpbmdQcm9wZXJ0eSIsImNsZWFuQXJyYXkiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlN0cmluZ1V0aWxzIiwicGhldGlvRWxlbWVudFNlbGVjdGlvblByb3BlcnR5IiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiSU9UeXBlIiwiYWxsb3dMaW5rc1Byb3BlcnR5IiwiYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4iLCJDb2xvciIsIkZvbnQiLCJnZXRMaW5lQnJlYWtSYW5nZXMiLCJpc0hpbWFsYXlhRWxlbWVudE5vZGUiLCJpc0hpbWFsYXlhVGV4dE5vZGUiLCJMaW5lIiwiTm9kZSIsIlJpY2hUZXh0RWxlbWVudCIsIlJpY2hUZXh0TGVhZiIsIlJpY2hUZXh0TGluayIsIlJpY2hUZXh0Tm9kZSIsIlJpY2hUZXh0VXRpbHMiLCJSaWNoVGV4dFZlcnRpY2FsU3BhY2VyIiwic2NlbmVyeSIsIlRleHQiLCJXaWR0aFNpemFibGUiLCJoaW1hbGF5YVZhciIsImhpbWFsYXlhIiwiYXNzZXJ0IiwiUklDSF9URVhUX09QVElPTl9LRVlTIiwiU1RSSU5HX1BST1BFUlRZX05BTUUiLCJpc1N0cmluZ1Rlc3QiLCJ3aW5kb3ciLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJjb250YWluc0tleSIsIkRFRkFVTFRfRk9OVCIsInNpemUiLCJBQ0NFU1NJQkxFX1RBR1MiLCJMaW5lQnJlYWtTdGF0ZSIsIkNPTVBMRVRFIiwiSU5DT01QTEVURSIsIk5PTkUiLCJ1c2VkTGlua3MiLCJ1c2VkTm9kZXMiLCJGT05UX1NUWUxFX01BUCIsIkZPTlRfU1RZTEVfS0VZUyIsIk9iamVjdCIsImtleXMiLCJTVFlMRV9LRVlTIiwiY29uY2F0IiwiUmljaFRleHQiLCJvblN0cmluZ1Byb3BlcnR5Q2hhbmdlIiwicmVidWlsZFJpY2hUZXh0Iiwic2V0U3RyaW5nUHJvcGVydHkiLCJuZXdUYXJnZXQiLCJfc3RyaW5nUHJvcGVydHkiLCJzZXRUYXJnZXRQcm9wZXJ0eSIsIlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSIsInN0cmluZ1Byb3BlcnR5IiwicHJvcGVydHkiLCJnZXRTdHJpbmdQcm9wZXJ0eSIsImdldFBoZXRpb01vdXNlSGl0VGFyZ2V0IiwiZnJvbUxpbmtpbmciLCJ2YWx1ZSIsImdldFN0cmluZ1Byb3BlcnR5UGhldGlvTW91c2VIaXRUYXJnZXQiLCJ0YXJnZXRTdHJpbmdQcm9wZXJ0eSIsImdldFRhcmdldFByb3BlcnR5IiwiaW5pdGlhbGl6ZVBoZXRpb09iamVjdCIsImJhc2VPcHRpb25zIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIndhc0luc3RydW1lbnRlZCIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwiUEhFVF9JT19FTkFCTEVEIiwiaW5pdGlhbGl6ZVBoZXRpbyIsInN0cmluZyIsInBoZXRpb1JlYWRPbmx5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInN0cmluZ1Byb3BlcnR5T3B0aW9ucyIsImhhc0R5bmFtaWNXaWR0aCIsIl9saW5lV3JhcCIsIndpZHRoU2l6YWJsZSIsInBlbmRpbmdNaW5pbXVtV2lkdGgiLCJuZWVkUGVuZGluZ01pbmltdW1XaWR0aCIsImVmZmVjdGl2ZUxpbmVXcmFwIiwibG9jYWxQcmVmZXJyZWRXaWR0aCIsImZyZWVDaGlsZHJlblRvUG9vbCIsImFwcGVuZEVtcHR5TGVhZiIsInNjZW5lcnlMb2ciLCJpZCIsInB1c2giLCJtYXBwZWRUZXh0IiwicmVwbGFjZSIsIl9yZXBsYWNlTmV3bGluZXMiLCJyb290RWxlbWVudHMiLCJwYXJzZSIsImUiLCJfbGlua0l0ZW1zIiwibGVuZ3RoIiwid2lkdGhBdmFpbGFibGUiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImlzUm9vdExUUiIsImN1cnJlbnRMaW5lIiwicG9vbCIsImNyZWF0ZSIsIl9oYXNBZGRlZExlYWZUb0xpbmUiLCJlbGVtZW50IiwiY3VycmVudExpbmVXaWR0aCIsImJvdW5kcyIsImlzVmFsaWQiLCJ3aWR0aCIsImxpbmVCcmVha1N0YXRlIiwiYXBwZW5kRWxlbWVudCIsIl9mb250IiwiX2ZpbGwiLCJhcHBlbmRMaW5lIiwic2NyYXRjaFRleHQiLCJzZXRTdHJpbmciLCJzZXRGb250IiwiaGVpZ2h0Iiwic3BsaWNlIiwibGluZUNvbnRhaW5lciIsImdldENoaWxkcmVuQ291bnQiLCJhbGlnbkxpbmVzIiwibGlua0VsZW1lbnQiLCJocmVmIiwiaSIsIm5vZGVzIiwiaXRlbSIsIm5vZGUiLCJsaW5rUm9vdE5vZGUiLCJpbm5lckNvbnRlbnQiLCJhZGRDaGlsZCIsIm1hdHJpeCIsImdldFVuaXF1ZVRyYWlsVG8iLCJnZXRNYXRyaXgiLCJkZXRhY2giLCJfbGlua3MiLCJmb3JFYWNoIiwibGluayIsImluY2x1ZGVzIiwiX25vZGVzIiwibG9jYWxNaW5pbXVtV2lkdGgiLCJsb2NhbEJvdW5kcyIsInBvcCIsIl9jaGlsZHJlbiIsImNoaWxkIiwicmVtb3ZlQ2hpbGQiLCJjbGVhbiIsImRpc3Bvc2UiLCJsaW5lTm9kZSIsInRvcCIsImJvdHRvbSIsIl9sZWFkaW5nIiwibGVmdCIsIl9ib3VuZHNNZXRob2QiLCJfc3Ryb2tlIiwiX2xpbmVXaWR0aCIsImNvb3JkaW5hdGVOYW1lIiwiX2FsaWduIiwiaWRlYWwiLCJnZXRDaGlsZEF0IiwiY29udGFpbmVyTm9kZSIsImZvbnQiLCJmaWxsIiwiaXNMVFIiLCJhcHBsaWVkU2NhbGUiLCJjb250YWluZXJTcGFjaW5nIiwicmlnaHRTcGFjaW5nIiwibGVmdFNwYWNpbmciLCJ3aWR0aEF2YWlsYWJsZVdpdGhTcGFjaW5nIiwiY29udGVudCIsIk1hdGgiLCJtYXgiLCJtYXAiLCJyYW5nZSIsInNsaWNlIiwibWluIiwidGVtcG9yYXJ5Tm9kZSIsImxvY2FsTWluaW51bVdpZHRoIiwiZml0c0luIiwicmFuZ2VzIiwicmFuZ2VzVG9TdHJpbmciLCJza2lwcGVkUmFuZ2VzIiwic3VjY2VzcyIsInVuc2hpZnQiLCJ0YWdOYW1lIiwiZGlyQXR0cmlidXRlU3RyaW5nIiwiaGltYWxheWFHZXRBdHRyaWJ1dGUiLCJyZWZlcmVuY2VkSWQiLCJyZWZlcmVuY2VkTm9kZSIsIm5vZGVBbGlnbiIsInRleHRCb3VuZHMiLCJjZW50ZXJZIiwic3R5bGVBdHRyaWJ1dGVTdHJpbmciLCJjc3MiLCJoaW1hbGF5YVN0eWxlU3RyaW5nVG9NYXAiLCJrZXkiLCJfIiwiY29sb3IiLCJmb250T3B0aW9ucyIsInN0eWxlS2V5IiwiZnJvbUNTUyIsImNvcHkiLCJvcmlnaW5hbEhyZWYiLCJzdGFydHNXaXRoIiwiaW5kZXhPZiIsImxpbmtOYW1lIiwiX2xpbmtGaWxsIiwiaGltYWxheWFFbGVtZW50VG9BY2Nlc3NpYmxlU3RyaW5nIiwid2VpZ2h0Iiwic3R5bGUiLCJzY2FsZSIsIl9zdWJTY2FsZSIsImFkZEV4dHJhQmVmb3JlU3BhY2luZyIsIl9zdWJYU3BhY2luZyIsInkiLCJfc3ViWU9mZnNldCIsIl9zdXBTY2FsZSIsIl9zdXBYU3BhY2luZyIsIl9zdXBZT2Zmc2V0IiwiZ2V0U2NhbGVWZWN0b3IiLCJ4IiwiY2hpbGRyZW4iLCJ3aWR0aEJlZm9yZSIsImNoaWxkRWxlbWVudCIsIndpZHRoQWZ0ZXIiLCJpc0Zpbml0ZSIsIl9jYXBIZWlnaHRTY2FsZSIsInVuZGVybGluZVkiLCJfdW5kZXJsaW5lSGVpZ2h0U2NhbGUiLCJsb2NhbExlZnQiLCJsb2NhbFJpZ2h0Iiwic3Ryb2tlIiwibGluZVdpZHRoIiwiX3VuZGVybGluZUxpbmVXaWR0aCIsInN0cmlrZXRocm91Z2hZIiwiX3N0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSIsIl9zdHJpa2V0aHJvdWdoTGluZVdpZHRoIiwiX3RhZ3MiLCJvcmlnaW5hbE5vZGUiLCJvcmlnaW5hbEJvdW5kcyIsIndhc0FkZGVkIiwiYWRkRWxlbWVudCIsImZpbHRlciIsInVuZGVmaW5lZCIsInNldCIsImdldFN0cmluZyIsInNldEJvdW5kc01ldGhvZCIsIm1ldGhvZCIsImJvdW5kc01ldGhvZCIsImdldEJvdW5kc01ldGhvZCIsImdldEZvbnQiLCJzZXRGaWxsIiwiZ2V0RmlsbCIsInNldFN0cm9rZSIsImdldFN0cm9rZSIsInNldExpbmVXaWR0aCIsImdldExpbmVXaWR0aCIsInNldFN1YlNjYWxlIiwic3ViU2NhbGUiLCJnZXRTdWJTY2FsZSIsInNldFN1YlhTcGFjaW5nIiwic3ViWFNwYWNpbmciLCJnZXRTdWJYU3BhY2luZyIsInNldFN1YllPZmZzZXQiLCJzdWJZT2Zmc2V0IiwiZ2V0U3ViWU9mZnNldCIsInNldFN1cFNjYWxlIiwic3VwU2NhbGUiLCJnZXRTdXBTY2FsZSIsInNldFN1cFhTcGFjaW5nIiwic3VwWFNwYWNpbmciLCJnZXRTdXBYU3BhY2luZyIsInNldFN1cFlPZmZzZXQiLCJzdXBZT2Zmc2V0IiwiZ2V0U3VwWU9mZnNldCIsInNldENhcEhlaWdodFNjYWxlIiwiY2FwSGVpZ2h0U2NhbGUiLCJnZXRDYXBIZWlnaHRTY2FsZSIsInNldFVuZGVybGluZUxpbmVXaWR0aCIsInVuZGVybGluZUxpbmVXaWR0aCIsImdldFVuZGVybGluZUxpbmVXaWR0aCIsInNldFVuZGVybGluZUhlaWdodFNjYWxlIiwidW5kZXJsaW5lSGVpZ2h0U2NhbGUiLCJnZXRVbmRlcmxpbmVIZWlnaHRTY2FsZSIsInNldFN0cmlrZXRocm91Z2hMaW5lV2lkdGgiLCJzdHJpa2V0aHJvdWdoTGluZVdpZHRoIiwiZ2V0U3RyaWtldGhyb3VnaExpbmVXaWR0aCIsInNldFN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSIsInN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSIsImdldFN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSIsInNldExpbmtGaWxsIiwibGlua0ZpbGwiLCJnZXRMaW5rRmlsbCIsInNldExpbmtFdmVudHNIYW5kbGVkIiwibGlua0V2ZW50c0hhbmRsZWQiLCJfbGlua0V2ZW50c0hhbmRsZWQiLCJnZXRMaW5rRXZlbnRzSGFuZGxlZCIsInNldExpbmtzIiwibGlua3MiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsImdldExpbmtzIiwic2V0Tm9kZXMiLCJnZXROb2RlcyIsInNldFRhZ3MiLCJ0YWdzIiwiZ2V0VGFncyIsInNldFJlcGxhY2VOZXdsaW5lcyIsInJlcGxhY2VOZXdsaW5lcyIsImdldFJlcGxhY2VOZXdsaW5lcyIsInNldEFsaWduIiwiYWxpZ24iLCJnZXRBbGlnbiIsInNldExlYWRpbmciLCJsZWFkaW5nIiwiZ2V0TGVhZGluZyIsInNldExpbmVXcmFwIiwibGluZVdyYXAiLCJnZXRMaW5lV3JhcCIsIm11dGF0ZSIsImhhc093blByb3BlcnR5Iiwic3RyaW5nV2l0aEZvbnQiLCJzdHIiLCJ2YXJpYW50Iiwic3RyZXRjaCIsImZhbWlseSIsImxpbmVIZWlnaHQiLCJoaW1hbGF5YUVsZW1lbnRUb1N0cmluZyIsImNvbnRlbnRUb1N0cmluZyIsImpvaW4iLCJkaXIiLCJ3cmFwRGlyZWN0aW9uIiwiZ2V0QWNjZXNzaWJsZVN0cmluZ1Byb3BlcnR5IiwiYWNjZXNzaWJsZVN0cmluZyIsInVuZXNjYXBlZENvbnRlbnQiLCJoZSIsImRlY29kZSIsInRhbmRlbU5hbWVTdWZmaXgiLCJwaGV0aW9UeXBlIiwiUmljaFRleHRJTyIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsImJpbmQiLCJsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJsYXp5TGluayIsIl9tdXRhdG9yS2V5cyIsInJlZ2lzdGVyIiwidmFsdWVUeXBlIiwic3VwZXJ0eXBlIiwiTm9kZUlPIiwiZG9jdW1lbnRhdGlvbiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F5REMsR0FFRCxPQUFPQSwyQkFBMkIsNENBQTRDO0FBRTlFLE9BQU9DLG9CQUFvQixxQ0FBcUM7QUFDaEUsT0FBT0MsNEJBQTRCLDZDQUE2QztBQUloRixPQUFPQyxnQkFBZ0Isc0NBQXNDO0FBQzdELE9BQU9DLGFBQWFDLGNBQWMsUUFBMEIscUNBQXFDO0FBRWpHLE9BQU9DLGlCQUFpQiw2Q0FBNkM7QUFDckUsT0FBT0Msb0NBQW9DLHVEQUF1RDtBQUNs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