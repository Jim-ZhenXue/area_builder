// Copyright 2016-2023, University of Colorado Boulder
/**
 * Different methods of detection of text bounds.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import { CanvasContextWrapper, Font, scenery, svgns, Utils } from '../imports.js';
// @private {string} - ID for a container for our SVG test element (determined to find the size of text elements with SVG)
const TEXT_SIZE_CONTAINER_ID = 'sceneryTextSizeContainer';
// @private {string} - ID for our SVG test element (determined to find the size of text elements with SVG)
const TEXT_SIZE_ELEMENT_ID = 'sceneryTextSizeElement';
// @private {SVGElement} - Container for our SVG test element (determined to find the size of text elements with SVG)
let svgTextSizeContainer;
// @private {SVGElement} - Test SVG element (determined to find the size of text elements with SVG)
let svgTextSizeElement;
// Maps CSS {string} => {Bounds2}, so that we can cache the vertical font sizes outside of the Font objects themselves.
const hybridFontVerticalCache = {};
let deliveredWarning = false;
const TextBounds = {
    /**
   * Returns a new Bounds2 that is the approximate bounds of a Text node displayed with the specified font and renderedText.
   * @public
   *
   * This method uses an SVG Text element, sets its text, and then determines its size to estimate the size of rendered text.
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {Font} font - The font of the text
   * @param {string} renderedText - Text to display (with any special characters replaced)
   * @returns {Bounds2}
   */ approximateSVGBounds (font, renderedText) {
        assert && assert(font instanceof Font, 'Font required');
        assert && assert(typeof renderedText === 'string', 'renderedText required');
        if (!svgTextSizeContainer.parentNode) {
            if (document.body) {
                document.body.appendChild(svgTextSizeContainer);
            } else {
                throw new Error('No document.body and trying to get approximate SVG bounds of a Text node');
            }
        }
        TextBounds.setSVGTextAttributes(svgTextSizeElement, font, renderedText);
        const rect = svgTextSizeElement.getBBox();
        if (rect.width === 0 && rect.height === 0 && renderedText.length > 0) {
            if (!deliveredWarning) {
                deliveredWarning = true;
                console.log('WARNING: Guessing text bounds, is the simulation hidden? See https://github.com/phetsims/chipper/issues/768');
            }
            return TextBounds.guessSVGBounds(font, renderedText);
        }
        return new Bounds2(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
    },
    /**
   * Returns a guess for what the SVG bounds of a font would be, based on PhetFont as an example.
   * @public
   *
   * @param {Font} font
   * @param {string} renderedText
   * @returns {Bounds2}
   */ guessSVGBounds (font, renderedText) {
        const px = font.getNumericSize();
        const isBold = font.weight === 'bold';
        // Our best guess, based on PhetFont in macOS Chrome. Things may differ, but hopefully this approximation
        // is useful.
        return new Bounds2(0, -0.9 * px, (isBold ? 0.435 : 0.4) * px * renderedText.length, 0.22 * px);
    },
    /**
   * Returns a new Bounds2 that is the approximate bounds of the specified Text node.
   * @public
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {scenery.Text} text - The Text node
   * @returns {Bounds2}
   */ accurateCanvasBounds (text) {
        const context = scenery.scratchContext;
        context.font = text._font.toCSS();
        context.direction = 'ltr';
        const metrics = context.measureText(text.renderedText);
        return new Bounds2(-metrics.actualBoundingBoxLeft, -metrics.actualBoundingBoxAscent, metrics.actualBoundingBoxRight, metrics.actualBoundingBoxDescent);
    },
    /**
   * Returns a new Bounds2 that is the approximate bounds of the specified Text node.
   * @public
   *
   * This method repeatedly renders the text into a Canvas and checks for what pixels are filled. Iteratively doing this for each bound
   * (top/left/bottom/right) until a tolerance results in very accurate bounds of what is displayed.
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {scenery.Text} text - The Text node
   * @returns {Bounds2}
   */ accurateCanvasBoundsFallback (text) {
        // this seems to be slower than expected, mostly due to Font getters
        const svgBounds = TextBounds.approximateSVGBounds(text._font, text.renderedText);
        //If svgBounds are zero, then return the zero bounds
        if (!text.renderedText.length || svgBounds.width === 0) {
            return svgBounds;
        }
        // NOTE: should return new instance, so that it can be mutated later
        const accurateBounds = Utils.canvasAccurateBounds((context)=>{
            context.font = text._font.toCSS();
            context.direction = 'ltr';
            context.fillText(text.renderedText, 0, 0);
            if (text.hasPaintableStroke()) {
                const fakeWrapper = new CanvasContextWrapper(null, context);
                text.beforeCanvasStroke(fakeWrapper);
                context.strokeText(text.renderedText, 0, 0);
                text.afterCanvasStroke(fakeWrapper);
            }
        }, {
            precision: 0.5,
            resolution: 128,
            initialScale: 32 / Math.max(Math.abs(svgBounds.minX), Math.abs(svgBounds.minY), Math.abs(svgBounds.maxX), Math.abs(svgBounds.maxY))
        });
        // Try falling back to SVG bounds if our accurate bounds are not finite
        return accurateBounds.isFinite() ? accurateBounds : svgBounds;
    },
    /**
   * Returns a possibly-cached (treat as immutable) Bounds2 for use mainly for vertical parameters, given a specific Font.
   * @public
   *
   * Uses SVG bounds determination for this value.
   *
   * @param {Font} font - The font of the text
   * @returns {Bounds2}
   */ getVerticalBounds (font) {
        assert && assert(font instanceof Font, 'Font required');
        const css = font.toCSS();
        // Cache these, as it's more expensive
        let verticalBounds = hybridFontVerticalCache[css];
        if (!verticalBounds) {
            verticalBounds = hybridFontVerticalCache[css] = TextBounds.approximateSVGBounds(font, 'm');
        }
        return verticalBounds;
    },
    /**
   * Returns an approximate width for text, determined by using Canvas' measureText().
   * @public
   *
   * @param {Font} font - The font of the text
   * @param {string} renderedText - Text to display (with any special characters replaced)
   * @returns {number}
   */ approximateCanvasWidth (font, renderedText) {
        assert && assert(font instanceof Font, 'Font required');
        assert && assert(typeof renderedText === 'string', 'renderedText required');
        const context = scenery.scratchContext;
        context.font = font.toCSS();
        context.direction = 'ltr';
        return context.measureText(renderedText).width;
    },
    /**
   * Returns a new Bounds2 that is the approximate bounds of a Text node displayed with the specified font and renderedText.
   * @public
   *
   * This method uses a hybrid approach, using SVG measurement to determine the height, but using Canvas to determine the width.
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {Font} font - The font of the text
   * @param {string} renderedText - Text to display (with any special characters replaced)
   * @returns {Bounds2}
   */ approximateHybridBounds (font, renderedText) {
        assert && assert(font instanceof Font, 'Font required');
        assert && assert(typeof renderedText === 'string', 'renderedText required');
        const verticalBounds = TextBounds.getVerticalBounds(font);
        const canvasWidth = TextBounds.approximateCanvasWidth(font, renderedText);
        // it seems that SVG bounds generally have x=0, so we hard code that here
        return new Bounds2(0, verticalBounds.minY, canvasWidth, verticalBounds.maxY);
    },
    /**
   * Returns a new Bounds2 that is the approximate bounds of a Text node displayed with the specified font, given a DOM element
   * @public
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {Font} font - The font of the text
   * @param {Element} element - DOM element created for the text. This is required, as the text handles HTML and non-HTML text differently.
   * @returns {Bounds2}
   */ approximateDOMBounds (font, element) {
        assert && assert(font instanceof Font, 'Font required');
        const maxHeight = 1024; // technically this will fail if the font is taller than this!
        // <div style="position: absolute; left: 0; top: 0; padding: 0 !important; margin: 0 !important;"><span id="baselineSpan" style="font-family: Verdana; font-size: 25px;">QuipTaQiy</span><div style="vertical-align: baseline; display: inline-block; width: 0; height: 500px; margin: 0 important!; padding: 0 important!;"></div></div>
        const div = document.createElement('div');
        $(div).css({
            position: 'absolute',
            left: 0,
            top: 0,
            padding: '0 !important',
            margin: '0 !important',
            display: 'hidden'
        });
        const span = document.createElement('span');
        $(span).css('font', font.toCSS());
        span.appendChild(element);
        span.setAttribute('direction', 'ltr');
        const fakeImage = document.createElement('div');
        $(fakeImage).css({
            'vertical-align': 'baseline',
            display: 'inline-block',
            width: 0,
            height: `${maxHeight}px`,
            margin: '0 !important',
            padding: '0 !important'
        });
        div.appendChild(span);
        div.appendChild(fakeImage);
        document.body.appendChild(div);
        const rect = span.getBoundingClientRect();
        const divRect = div.getBoundingClientRect();
        // add 1 pixel to rect.right to prevent HTML text wrapping
        const result = new Bounds2(rect.left, rect.top - maxHeight, rect.right + 1, rect.bottom - maxHeight).shiftedXY(-divRect.left, -divRect.top);
        document.body.removeChild(div);
        return result;
    },
    /**
   * Returns a new Bounds2 that is the approximate bounds of a Text node displayed with the specified font, given a DOM element
   * @public
   *
   * TODO: Can we use this? What are the differences? https://github.com/phetsims/scenery/issues/1581
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {Font} font - The font of the text
   * @param {Element} element - DOM element created for the text. This is required, as the text handles HTML and non-HTML text differently.
   * @returns {Bounds2}
   */ approximateImprovedDOMBounds (font, element) {
        assert && assert(font instanceof Font, 'Font required');
        // TODO: reuse this div? https://github.com/phetsims/scenery/issues/1581
        const div = document.createElement('div');
        div.style.display = 'inline-block';
        div.style.font = font.toCSS();
        div.style.color = 'transparent';
        div.style.padding = '0 !important';
        div.style.margin = '0 !important';
        div.style.position = 'absolute';
        div.style.left = '0';
        div.style.top = '0';
        div.setAttribute('direction', 'ltr');
        div.appendChild(element);
        document.body.appendChild(div);
        const bounds = new Bounds2(div.offsetLeft, div.offsetTop, div.offsetLeft + div.offsetWidth + 1, div.offsetTop + div.offsetHeight + 1);
        document.body.removeChild(div);
        // Compensate for the baseline alignment
        const verticalBounds = TextBounds.getVerticalBounds(font);
        return bounds.shiftedY(verticalBounds.minY);
    },
    /**
   * Modifies an SVG text element's properties to match the specified font and text.
   * @public
   *
   * @param {SVGTextElement} textElement
   * @param {Font} font - The font of the text
   * @param {string} renderedText - Text to display (with any special characters replaced)
   */ setSVGTextAttributes (textElement, font, renderedText) {
        assert && assert(font instanceof Font, 'Font required');
        assert && assert(typeof renderedText === 'string', 'renderedText required');
        textElement.setAttribute('direction', 'ltr');
        textElement.setAttribute('font-family', font.getFamily());
        textElement.setAttribute('font-size', font.getSize());
        textElement.setAttribute('font-style', font.getStyle());
        textElement.setAttribute('font-weight', font.getWeight());
        textElement.setAttribute('font-stretch', font.getStretch());
        textElement.lastChild.nodeValue = renderedText;
    },
    /**
   * Initializes containers and elements required for SVG text measurement.
   * @public
   */ initializeTextBounds () {
        svgTextSizeContainer = document.getElementById(TEXT_SIZE_CONTAINER_ID);
        if (!svgTextSizeContainer) {
            // set up the container and text for testing text bounds quickly (using approximateSVGBounds)
            svgTextSizeContainer = document.createElementNS(svgns, 'svg');
            svgTextSizeContainer.setAttribute('width', '2');
            svgTextSizeContainer.setAttribute('height', '2');
            svgTextSizeContainer.setAttribute('id', TEXT_SIZE_CONTAINER_ID);
            svgTextSizeContainer.setAttribute('style', 'visibility: hidden; pointer-events: none; position: absolute; left: -65535px; right: -65535px;'); // so we don't flash it in a visible way to the user
        }
        svgTextSizeElement = document.getElementById(TEXT_SIZE_ELEMENT_ID);
        // NOTE! copies createSVGElement
        if (!svgTextSizeElement) {
            svgTextSizeElement = document.createElementNS(svgns, 'text');
            svgTextSizeElement.appendChild(document.createTextNode(''));
            svgTextSizeElement.setAttribute('dominant-baseline', 'alphabetic'); // to match Canvas right now
            svgTextSizeElement.setAttribute('text-rendering', 'geometricPrecision');
            svgTextSizeElement.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
            svgTextSizeElement.setAttribute('id', TEXT_SIZE_ELEMENT_ID);
            svgTextSizeContainer.appendChild(svgTextSizeElement);
        }
    }
};
scenery.register('TextBounds', TextBounds);
export default TextBounds;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9UZXh0Qm91bmRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERpZmZlcmVudCBtZXRob2RzIG9mIGRldGVjdGlvbiBvZiB0ZXh0IGJvdW5kcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgQ2FudmFzQ29udGV4dFdyYXBwZXIsIEZvbnQsIHNjZW5lcnksIHN2Z25zLCBVdGlscyB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vLyBAcHJpdmF0ZSB7c3RyaW5nfSAtIElEIGZvciBhIGNvbnRhaW5lciBmb3Igb3VyIFNWRyB0ZXN0IGVsZW1lbnQgKGRldGVybWluZWQgdG8gZmluZCB0aGUgc2l6ZSBvZiB0ZXh0IGVsZW1lbnRzIHdpdGggU1ZHKVxuY29uc3QgVEVYVF9TSVpFX0NPTlRBSU5FUl9JRCA9ICdzY2VuZXJ5VGV4dFNpemVDb250YWluZXInO1xuXG4vLyBAcHJpdmF0ZSB7c3RyaW5nfSAtIElEIGZvciBvdXIgU1ZHIHRlc3QgZWxlbWVudCAoZGV0ZXJtaW5lZCB0byBmaW5kIHRoZSBzaXplIG9mIHRleHQgZWxlbWVudHMgd2l0aCBTVkcpXG5jb25zdCBURVhUX1NJWkVfRUxFTUVOVF9JRCA9ICdzY2VuZXJ5VGV4dFNpemVFbGVtZW50JztcblxuLy8gQHByaXZhdGUge1NWR0VsZW1lbnR9IC0gQ29udGFpbmVyIGZvciBvdXIgU1ZHIHRlc3QgZWxlbWVudCAoZGV0ZXJtaW5lZCB0byBmaW5kIHRoZSBzaXplIG9mIHRleHQgZWxlbWVudHMgd2l0aCBTVkcpXG5sZXQgc3ZnVGV4dFNpemVDb250YWluZXI7XG5cbi8vIEBwcml2YXRlIHtTVkdFbGVtZW50fSAtIFRlc3QgU1ZHIGVsZW1lbnQgKGRldGVybWluZWQgdG8gZmluZCB0aGUgc2l6ZSBvZiB0ZXh0IGVsZW1lbnRzIHdpdGggU1ZHKVxubGV0IHN2Z1RleHRTaXplRWxlbWVudDtcblxuLy8gTWFwcyBDU1Mge3N0cmluZ30gPT4ge0JvdW5kczJ9LCBzbyB0aGF0IHdlIGNhbiBjYWNoZSB0aGUgdmVydGljYWwgZm9udCBzaXplcyBvdXRzaWRlIG9mIHRoZSBGb250IG9iamVjdHMgdGhlbXNlbHZlcy5cbmNvbnN0IGh5YnJpZEZvbnRWZXJ0aWNhbENhY2hlID0ge307XG5cbmxldCBkZWxpdmVyZWRXYXJuaW5nID0gZmFsc2U7XG5cbmNvbnN0IFRleHRCb3VuZHMgPSB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IEJvdW5kczIgdGhhdCBpcyB0aGUgYXBwcm94aW1hdGUgYm91bmRzIG9mIGEgVGV4dCBub2RlIGRpc3BsYXllZCB3aXRoIHRoZSBzcGVjaWZpZWQgZm9udCBhbmQgcmVuZGVyZWRUZXh0LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHVzZXMgYW4gU1ZHIFRleHQgZWxlbWVudCwgc2V0cyBpdHMgdGV4dCwgYW5kIHRoZW4gZGV0ZXJtaW5lcyBpdHMgc2l6ZSB0byBlc3RpbWF0ZSB0aGUgc2l6ZSBvZiByZW5kZXJlZCB0ZXh0LlxuICAgKlxuICAgKiBOT1RFOiBDYWxsaW5nIGNvZGUgcmVsaWVzIG9uIHRoZSBuZXcgQm91bmRzMiBpbnN0YW5jZSwgYXMgdGhleSBtdXRhdGUgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7Rm9udH0gZm9udCAtIFRoZSBmb250IG9mIHRoZSB0ZXh0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZW5kZXJlZFRleHQgLSBUZXh0IHRvIGRpc3BsYXkgKHdpdGggYW55IHNwZWNpYWwgY2hhcmFjdGVycyByZXBsYWNlZClcbiAgICogQHJldHVybnMge0JvdW5kczJ9XG4gICAqL1xuICBhcHByb3hpbWF0ZVNWR0JvdW5kcyggZm9udCwgcmVuZGVyZWRUZXh0ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvbnQgaW5zdGFuY2VvZiBGb250LCAnRm9udCByZXF1aXJlZCcgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgcmVuZGVyZWRUZXh0ID09PSAnc3RyaW5nJywgJ3JlbmRlcmVkVGV4dCByZXF1aXJlZCcgKTtcblxuICAgIGlmICggIXN2Z1RleHRTaXplQ29udGFpbmVyLnBhcmVudE5vZGUgKSB7XG4gICAgICBpZiAoIGRvY3VtZW50LmJvZHkgKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHN2Z1RleHRTaXplQ29udGFpbmVyICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTm8gZG9jdW1lbnQuYm9keSBhbmQgdHJ5aW5nIHRvIGdldCBhcHByb3hpbWF0ZSBTVkcgYm91bmRzIG9mIGEgVGV4dCBub2RlJyApO1xuICAgICAgfVxuICAgIH1cbiAgICBUZXh0Qm91bmRzLnNldFNWR1RleHRBdHRyaWJ1dGVzKCBzdmdUZXh0U2l6ZUVsZW1lbnQsIGZvbnQsIHJlbmRlcmVkVGV4dCApO1xuICAgIGNvbnN0IHJlY3QgPSBzdmdUZXh0U2l6ZUVsZW1lbnQuZ2V0QkJveCgpO1xuXG4gICAgaWYgKCByZWN0LndpZHRoID09PSAwICYmIHJlY3QuaGVpZ2h0ID09PSAwICYmIHJlbmRlcmVkVGV4dC5sZW5ndGggPiAwICkge1xuICAgICAgaWYgKCAhZGVsaXZlcmVkV2FybmluZyApIHtcbiAgICAgICAgZGVsaXZlcmVkV2FybmluZyA9IHRydWU7XG5cbiAgICAgICAgY29uc29sZS5sb2coICdXQVJOSU5HOiBHdWVzc2luZyB0ZXh0IGJvdW5kcywgaXMgdGhlIHNpbXVsYXRpb24gaGlkZGVuPyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzc2OCcgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBUZXh0Qm91bmRzLmd1ZXNzU1ZHQm91bmRzKCBmb250LCByZW5kZXJlZFRleHQgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEJvdW5kczIoIHJlY3QueCwgcmVjdC55LCByZWN0LnggKyByZWN0LndpZHRoLCByZWN0LnkgKyByZWN0LmhlaWdodCApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZ3Vlc3MgZm9yIHdoYXQgdGhlIFNWRyBib3VuZHMgb2YgYSBmb250IHdvdWxkIGJlLCBiYXNlZCBvbiBQaGV0Rm9udCBhcyBhbiBleGFtcGxlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Rm9udH0gZm9udFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVuZGVyZWRUZXh0XG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxuICAgKi9cbiAgZ3Vlc3NTVkdCb3VuZHMoIGZvbnQsIHJlbmRlcmVkVGV4dCApIHtcbiAgICBjb25zdCBweCA9IGZvbnQuZ2V0TnVtZXJpY1NpemUoKTtcbiAgICBjb25zdCBpc0JvbGQgPSBmb250LndlaWdodCA9PT0gJ2JvbGQnO1xuXG4gICAgLy8gT3VyIGJlc3QgZ3Vlc3MsIGJhc2VkIG9uIFBoZXRGb250IGluIG1hY09TIENocm9tZS4gVGhpbmdzIG1heSBkaWZmZXIsIGJ1dCBob3BlZnVsbHkgdGhpcyBhcHByb3hpbWF0aW9uXG4gICAgLy8gaXMgdXNlZnVsLlxuICAgIHJldHVybiBuZXcgQm91bmRzMiggMCwgLTAuOSAqIHB4LCAoIGlzQm9sZCA/IDAuNDM1IDogMC40ICkgKiBweCAqIHJlbmRlcmVkVGV4dC5sZW5ndGgsIDAuMjIgKiBweCApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IEJvdW5kczIgdGhhdCBpcyB0aGUgYXBwcm94aW1hdGUgYm91bmRzIG9mIHRoZSBzcGVjaWZpZWQgVGV4dCBub2RlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIE5PVEU6IENhbGxpbmcgY29kZSByZWxpZXMgb24gdGhlIG5ldyBCb3VuZHMyIGluc3RhbmNlLCBhcyB0aGV5IG11dGF0ZSBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtzY2VuZXJ5LlRleHR9IHRleHQgLSBUaGUgVGV4dCBub2RlXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxuICAgKi9cbiAgYWNjdXJhdGVDYW52YXNCb3VuZHMoIHRleHQgKSB7XG4gICAgY29uc3QgY29udGV4dCA9IHNjZW5lcnkuc2NyYXRjaENvbnRleHQ7XG4gICAgY29udGV4dC5mb250ID0gdGV4dC5fZm9udC50b0NTUygpO1xuICAgIGNvbnRleHQuZGlyZWN0aW9uID0gJ2x0cic7XG4gICAgY29uc3QgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQoIHRleHQucmVuZGVyZWRUZXh0ICk7XG4gICAgcmV0dXJuIG5ldyBCb3VuZHMyKFxuICAgICAgLW1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hMZWZ0LFxuICAgICAgLW1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hBc2NlbnQsXG4gICAgICBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94UmlnaHQsXG4gICAgICBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94RGVzY2VudFxuICAgICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgQm91bmRzMiB0aGF0IGlzIHRoZSBhcHByb3hpbWF0ZSBib3VuZHMgb2YgdGhlIHNwZWNpZmllZCBUZXh0IG5vZGUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBtZXRob2QgcmVwZWF0ZWRseSByZW5kZXJzIHRoZSB0ZXh0IGludG8gYSBDYW52YXMgYW5kIGNoZWNrcyBmb3Igd2hhdCBwaXhlbHMgYXJlIGZpbGxlZC4gSXRlcmF0aXZlbHkgZG9pbmcgdGhpcyBmb3IgZWFjaCBib3VuZFxuICAgKiAodG9wL2xlZnQvYm90dG9tL3JpZ2h0KSB1bnRpbCBhIHRvbGVyYW5jZSByZXN1bHRzIGluIHZlcnkgYWNjdXJhdGUgYm91bmRzIG9mIHdoYXQgaXMgZGlzcGxheWVkLlxuICAgKlxuICAgKiBOT1RFOiBDYWxsaW5nIGNvZGUgcmVsaWVzIG9uIHRoZSBuZXcgQm91bmRzMiBpbnN0YW5jZSwgYXMgdGhleSBtdXRhdGUgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7c2NlbmVyeS5UZXh0fSB0ZXh0IC0gVGhlIFRleHQgbm9kZVxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cbiAgICovXG4gIGFjY3VyYXRlQ2FudmFzQm91bmRzRmFsbGJhY2soIHRleHQgKSB7XG4gICAgLy8gdGhpcyBzZWVtcyB0byBiZSBzbG93ZXIgdGhhbiBleHBlY3RlZCwgbW9zdGx5IGR1ZSB0byBGb250IGdldHRlcnNcbiAgICBjb25zdCBzdmdCb3VuZHMgPSBUZXh0Qm91bmRzLmFwcHJveGltYXRlU1ZHQm91bmRzKCB0ZXh0Ll9mb250LCB0ZXh0LnJlbmRlcmVkVGV4dCApO1xuXG4gICAgLy9JZiBzdmdCb3VuZHMgYXJlIHplcm8sIHRoZW4gcmV0dXJuIHRoZSB6ZXJvIGJvdW5kc1xuICAgIGlmICggIXRleHQucmVuZGVyZWRUZXh0Lmxlbmd0aCB8fCBzdmdCb3VuZHMud2lkdGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gc3ZnQm91bmRzO1xuICAgIH1cblxuICAgIC8vIE5PVEU6IHNob3VsZCByZXR1cm4gbmV3IGluc3RhbmNlLCBzbyB0aGF0IGl0IGNhbiBiZSBtdXRhdGVkIGxhdGVyXG4gICAgY29uc3QgYWNjdXJhdGVCb3VuZHMgPSBVdGlscy5jYW52YXNBY2N1cmF0ZUJvdW5kcyggY29udGV4dCA9PiB7XG4gICAgICBjb250ZXh0LmZvbnQgPSB0ZXh0Ll9mb250LnRvQ1NTKCk7XG4gICAgICBjb250ZXh0LmRpcmVjdGlvbiA9ICdsdHInO1xuICAgICAgY29udGV4dC5maWxsVGV4dCggdGV4dC5yZW5kZXJlZFRleHQsIDAsIDAgKTtcbiAgICAgIGlmICggdGV4dC5oYXNQYWludGFibGVTdHJva2UoKSApIHtcbiAgICAgICAgY29uc3QgZmFrZVdyYXBwZXIgPSBuZXcgQ2FudmFzQ29udGV4dFdyYXBwZXIoIG51bGwsIGNvbnRleHQgKTtcbiAgICAgICAgdGV4dC5iZWZvcmVDYW52YXNTdHJva2UoIGZha2VXcmFwcGVyICk7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlVGV4dCggdGV4dC5yZW5kZXJlZFRleHQsIDAsIDAgKTtcbiAgICAgICAgdGV4dC5hZnRlckNhbnZhc1N0cm9rZSggZmFrZVdyYXBwZXIgKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwcmVjaXNpb246IDAuNSxcbiAgICAgIHJlc29sdXRpb246IDEyOCxcbiAgICAgIGluaXRpYWxTY2FsZTogMzIgLyBNYXRoLm1heCggTWF0aC5hYnMoIHN2Z0JvdW5kcy5taW5YICksIE1hdGguYWJzKCBzdmdCb3VuZHMubWluWSApLCBNYXRoLmFicyggc3ZnQm91bmRzLm1heFggKSwgTWF0aC5hYnMoIHN2Z0JvdW5kcy5tYXhZICkgKVxuICAgIH0gKTtcbiAgICAvLyBUcnkgZmFsbGluZyBiYWNrIHRvIFNWRyBib3VuZHMgaWYgb3VyIGFjY3VyYXRlIGJvdW5kcyBhcmUgbm90IGZpbml0ZVxuICAgIHJldHVybiBhY2N1cmF0ZUJvdW5kcy5pc0Zpbml0ZSgpID8gYWNjdXJhdGVCb3VuZHMgOiBzdmdCb3VuZHM7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwb3NzaWJseS1jYWNoZWQgKHRyZWF0IGFzIGltbXV0YWJsZSkgQm91bmRzMiBmb3IgdXNlIG1haW5seSBmb3IgdmVydGljYWwgcGFyYW1ldGVycywgZ2l2ZW4gYSBzcGVjaWZpYyBGb250LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFVzZXMgU1ZHIGJvdW5kcyBkZXRlcm1pbmF0aW9uIGZvciB0aGlzIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0ge0ZvbnR9IGZvbnQgLSBUaGUgZm9udCBvZiB0aGUgdGV4dFxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cbiAgICovXG4gIGdldFZlcnRpY2FsQm91bmRzKCBmb250ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvbnQgaW5zdGFuY2VvZiBGb250LCAnRm9udCByZXF1aXJlZCcgKTtcblxuICAgIGNvbnN0IGNzcyA9IGZvbnQudG9DU1MoKTtcblxuICAgIC8vIENhY2hlIHRoZXNlLCBhcyBpdCdzIG1vcmUgZXhwZW5zaXZlXG4gICAgbGV0IHZlcnRpY2FsQm91bmRzID0gaHlicmlkRm9udFZlcnRpY2FsQ2FjaGVbIGNzcyBdO1xuICAgIGlmICggIXZlcnRpY2FsQm91bmRzICkge1xuICAgICAgdmVydGljYWxCb3VuZHMgPSBoeWJyaWRGb250VmVydGljYWxDYWNoZVsgY3NzIF0gPSBUZXh0Qm91bmRzLmFwcHJveGltYXRlU1ZHQm91bmRzKCBmb250LCAnbScgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGljYWxCb3VuZHM7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXBwcm94aW1hdGUgd2lkdGggZm9yIHRleHQsIGRldGVybWluZWQgYnkgdXNpbmcgQ2FudmFzJyBtZWFzdXJlVGV4dCgpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Rm9udH0gZm9udCAtIFRoZSBmb250IG9mIHRoZSB0ZXh0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZW5kZXJlZFRleHQgLSBUZXh0IHRvIGRpc3BsYXkgKHdpdGggYW55IHNwZWNpYWwgY2hhcmFjdGVycyByZXBsYWNlZClcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGFwcHJveGltYXRlQ2FudmFzV2lkdGgoIGZvbnQsIHJlbmRlcmVkVGV4dCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmb250IGluc3RhbmNlb2YgRm9udCwgJ0ZvbnQgcmVxdWlyZWQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHJlbmRlcmVkVGV4dCA9PT0gJ3N0cmluZycsICdyZW5kZXJlZFRleHQgcmVxdWlyZWQnICk7XG5cbiAgICBjb25zdCBjb250ZXh0ID0gc2NlbmVyeS5zY3JhdGNoQ29udGV4dDtcbiAgICBjb250ZXh0LmZvbnQgPSBmb250LnRvQ1NTKCk7XG4gICAgY29udGV4dC5kaXJlY3Rpb24gPSAnbHRyJztcbiAgICByZXR1cm4gY29udGV4dC5tZWFzdXJlVGV4dCggcmVuZGVyZWRUZXh0ICkud2lkdGg7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgQm91bmRzMiB0aGF0IGlzIHRoZSBhcHByb3hpbWF0ZSBib3VuZHMgb2YgYSBUZXh0IG5vZGUgZGlzcGxheWVkIHdpdGggdGhlIHNwZWNpZmllZCBmb250IGFuZCByZW5kZXJlZFRleHQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBtZXRob2QgdXNlcyBhIGh5YnJpZCBhcHByb2FjaCwgdXNpbmcgU1ZHIG1lYXN1cmVtZW50IHRvIGRldGVybWluZSB0aGUgaGVpZ2h0LCBidXQgdXNpbmcgQ2FudmFzIHRvIGRldGVybWluZSB0aGUgd2lkdGguXG4gICAqXG4gICAqIE5PVEU6IENhbGxpbmcgY29kZSByZWxpZXMgb24gdGhlIG5ldyBCb3VuZHMyIGluc3RhbmNlLCBhcyB0aGV5IG11dGF0ZSBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtGb250fSBmb250IC0gVGhlIGZvbnQgb2YgdGhlIHRleHRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbmRlcmVkVGV4dCAtIFRleHQgdG8gZGlzcGxheSAod2l0aCBhbnkgc3BlY2lhbCBjaGFyYWN0ZXJzIHJlcGxhY2VkKVxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cbiAgICovXG4gIGFwcHJveGltYXRlSHlicmlkQm91bmRzKCBmb250LCByZW5kZXJlZFRleHQgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZm9udCBpbnN0YW5jZW9mIEZvbnQsICdGb250IHJlcXVpcmVkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiByZW5kZXJlZFRleHQgPT09ICdzdHJpbmcnLCAncmVuZGVyZWRUZXh0IHJlcXVpcmVkJyApO1xuXG4gICAgY29uc3QgdmVydGljYWxCb3VuZHMgPSBUZXh0Qm91bmRzLmdldFZlcnRpY2FsQm91bmRzKCBmb250ICk7XG5cbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IFRleHRCb3VuZHMuYXBwcm94aW1hdGVDYW52YXNXaWR0aCggZm9udCwgcmVuZGVyZWRUZXh0ICk7XG5cbiAgICAvLyBpdCBzZWVtcyB0aGF0IFNWRyBib3VuZHMgZ2VuZXJhbGx5IGhhdmUgeD0wLCBzbyB3ZSBoYXJkIGNvZGUgdGhhdCBoZXJlXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMyKCAwLCB2ZXJ0aWNhbEJvdW5kcy5taW5ZLCBjYW52YXNXaWR0aCwgdmVydGljYWxCb3VuZHMubWF4WSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IEJvdW5kczIgdGhhdCBpcyB0aGUgYXBwcm94aW1hdGUgYm91bmRzIG9mIGEgVGV4dCBub2RlIGRpc3BsYXllZCB3aXRoIHRoZSBzcGVjaWZpZWQgZm9udCwgZ2l2ZW4gYSBET00gZWxlbWVudFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIE5PVEU6IENhbGxpbmcgY29kZSByZWxpZXMgb24gdGhlIG5ldyBCb3VuZHMyIGluc3RhbmNlLCBhcyB0aGV5IG11dGF0ZSBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtGb250fSBmb250IC0gVGhlIGZvbnQgb2YgdGhlIHRleHRcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IC0gRE9NIGVsZW1lbnQgY3JlYXRlZCBmb3IgdGhlIHRleHQuIFRoaXMgaXMgcmVxdWlyZWQsIGFzIHRoZSB0ZXh0IGhhbmRsZXMgSFRNTCBhbmQgbm9uLUhUTUwgdGV4dCBkaWZmZXJlbnRseS5cbiAgICogQHJldHVybnMge0JvdW5kczJ9XG4gICAqL1xuICBhcHByb3hpbWF0ZURPTUJvdW5kcyggZm9udCwgZWxlbWVudCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmb250IGluc3RhbmNlb2YgRm9udCwgJ0ZvbnQgcmVxdWlyZWQnICk7XG5cbiAgICBjb25zdCBtYXhIZWlnaHQgPSAxMDI0OyAvLyB0ZWNobmljYWxseSB0aGlzIHdpbGwgZmFpbCBpZiB0aGUgZm9udCBpcyB0YWxsZXIgdGhhbiB0aGlzIVxuXG4gICAgLy8gPGRpdiBzdHlsZT1cInBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMDsgdG9wOiAwOyBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7IG1hcmdpbjogMCAhaW1wb3J0YW50O1wiPjxzcGFuIGlkPVwiYmFzZWxpbmVTcGFuXCIgc3R5bGU9XCJmb250LWZhbWlseTogVmVyZGFuYTsgZm9udC1zaXplOiAyNXB4O1wiPlF1aXBUYVFpeTwvc3Bhbj48ZGl2IHN0eWxlPVwidmVydGljYWwtYWxpZ246IGJhc2VsaW5lOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHdpZHRoOiAwOyBoZWlnaHQ6IDUwMHB4OyBtYXJnaW46IDAgaW1wb3J0YW50ITsgcGFkZGluZzogMCBpbXBvcnRhbnQhO1wiPjwvZGl2PjwvZGl2PlxuXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICAkKCBkaXYgKS5jc3MoIHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgbGVmdDogMCxcbiAgICAgIHRvcDogMCxcbiAgICAgIHBhZGRpbmc6ICcwICFpbXBvcnRhbnQnLFxuICAgICAgbWFyZ2luOiAnMCAhaW1wb3J0YW50JyxcbiAgICAgIGRpc3BsYXk6ICdoaWRkZW4nXG4gICAgfSApO1xuXG4gICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzcGFuJyApO1xuICAgICQoIHNwYW4gKS5jc3MoICdmb250JywgZm9udC50b0NTUygpICk7XG4gICAgc3Bhbi5hcHBlbmRDaGlsZCggZWxlbWVudCApO1xuICAgIHNwYW4uc2V0QXR0cmlidXRlKCAnZGlyZWN0aW9uJywgJ2x0cicgKTtcblxuICAgIGNvbnN0IGZha2VJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gICAgJCggZmFrZUltYWdlICkuY3NzKCB7XG4gICAgICAndmVydGljYWwtYWxpZ24nOiAnYmFzZWxpbmUnLFxuICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogYCR7bWF4SGVpZ2h0fXB4YCxcbiAgICAgIG1hcmdpbjogJzAgIWltcG9ydGFudCcsXG4gICAgICBwYWRkaW5nOiAnMCAhaW1wb3J0YW50J1xuICAgIH0gKTtcblxuICAgIGRpdi5hcHBlbmRDaGlsZCggc3BhbiApO1xuICAgIGRpdi5hcHBlbmRDaGlsZCggZmFrZUltYWdlICk7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXYgKTtcbiAgICBjb25zdCByZWN0ID0gc3Bhbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBkaXZSZWN0ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIC8vIGFkZCAxIHBpeGVsIHRvIHJlY3QucmlnaHQgdG8gcHJldmVudCBIVE1MIHRleHQgd3JhcHBpbmdcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQm91bmRzMiggcmVjdC5sZWZ0LCByZWN0LnRvcCAtIG1heEhlaWdodCwgcmVjdC5yaWdodCArIDEsIHJlY3QuYm90dG9tIC0gbWF4SGVpZ2h0ICkuc2hpZnRlZFhZKCAtZGl2UmVjdC5sZWZ0LCAtZGl2UmVjdC50b3AgKTtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCBkaXYgKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgQm91bmRzMiB0aGF0IGlzIHRoZSBhcHByb3hpbWF0ZSBib3VuZHMgb2YgYSBUZXh0IG5vZGUgZGlzcGxheWVkIHdpdGggdGhlIHNwZWNpZmllZCBmb250LCBnaXZlbiBhIERPTSBlbGVtZW50XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVE9ETzogQ2FuIHdlIHVzZSB0aGlzPyBXaGF0IGFyZSB0aGUgZGlmZmVyZW5jZXM/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqXG4gICAqIE5PVEU6IENhbGxpbmcgY29kZSByZWxpZXMgb24gdGhlIG5ldyBCb3VuZHMyIGluc3RhbmNlLCBhcyB0aGV5IG11dGF0ZSBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtGb250fSBmb250IC0gVGhlIGZvbnQgb2YgdGhlIHRleHRcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IC0gRE9NIGVsZW1lbnQgY3JlYXRlZCBmb3IgdGhlIHRleHQuIFRoaXMgaXMgcmVxdWlyZWQsIGFzIHRoZSB0ZXh0IGhhbmRsZXMgSFRNTCBhbmQgbm9uLUhUTUwgdGV4dCBkaWZmZXJlbnRseS5cbiAgICogQHJldHVybnMge0JvdW5kczJ9XG4gICAqL1xuICBhcHByb3hpbWF0ZUltcHJvdmVkRE9NQm91bmRzKCBmb250LCBlbGVtZW50ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvbnQgaW5zdGFuY2VvZiBGb250LCAnRm9udCByZXF1aXJlZCcgKTtcblxuICAgIC8vIFRPRE86IHJldXNlIHRoaXMgZGl2PyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICBkaXYuc3R5bGUuZm9udCA9IGZvbnQudG9DU1MoKTtcbiAgICBkaXYuc3R5bGUuY29sb3IgPSAndHJhbnNwYXJlbnQnO1xuICAgIGRpdi5zdHlsZS5wYWRkaW5nID0gJzAgIWltcG9ydGFudCc7XG4gICAgZGl2LnN0eWxlLm1hcmdpbiA9ICcwICFpbXBvcnRhbnQnO1xuICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgZGl2LnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgZGl2LnN0eWxlLnRvcCA9ICcwJztcbiAgICBkaXYuc2V0QXR0cmlidXRlKCAnZGlyZWN0aW9uJywgJ2x0cicgKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQoIGVsZW1lbnQgKTtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpdiApO1xuICAgIGNvbnN0IGJvdW5kcyA9IG5ldyBCb3VuZHMyKCBkaXYub2Zmc2V0TGVmdCwgZGl2Lm9mZnNldFRvcCwgZGl2Lm9mZnNldExlZnQgKyBkaXYub2Zmc2V0V2lkdGggKyAxLCBkaXYub2Zmc2V0VG9wICsgZGl2Lm9mZnNldEhlaWdodCArIDEgKTtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCBkaXYgKTtcblxuICAgIC8vIENvbXBlbnNhdGUgZm9yIHRoZSBiYXNlbGluZSBhbGlnbm1lbnRcbiAgICBjb25zdCB2ZXJ0aWNhbEJvdW5kcyA9IFRleHRCb3VuZHMuZ2V0VmVydGljYWxCb3VuZHMoIGZvbnQgKTtcbiAgICByZXR1cm4gYm91bmRzLnNoaWZ0ZWRZKCB2ZXJ0aWNhbEJvdW5kcy5taW5ZICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIGFuIFNWRyB0ZXh0IGVsZW1lbnQncyBwcm9wZXJ0aWVzIHRvIG1hdGNoIHRoZSBzcGVjaWZpZWQgZm9udCBhbmQgdGV4dC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1NWR1RleHRFbGVtZW50fSB0ZXh0RWxlbWVudFxuICAgKiBAcGFyYW0ge0ZvbnR9IGZvbnQgLSBUaGUgZm9udCBvZiB0aGUgdGV4dFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVuZGVyZWRUZXh0IC0gVGV4dCB0byBkaXNwbGF5ICh3aXRoIGFueSBzcGVjaWFsIGNoYXJhY3RlcnMgcmVwbGFjZWQpXG4gICAqL1xuICBzZXRTVkdUZXh0QXR0cmlidXRlcyggdGV4dEVsZW1lbnQsIGZvbnQsIHJlbmRlcmVkVGV4dCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmb250IGluc3RhbmNlb2YgRm9udCwgJ0ZvbnQgcmVxdWlyZWQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHJlbmRlcmVkVGV4dCA9PT0gJ3N0cmluZycsICdyZW5kZXJlZFRleHQgcmVxdWlyZWQnICk7XG5cbiAgICB0ZXh0RWxlbWVudC5zZXRBdHRyaWJ1dGUoICdkaXJlY3Rpb24nLCAnbHRyJyApO1xuICAgIHRleHRFbGVtZW50LnNldEF0dHJpYnV0ZSggJ2ZvbnQtZmFtaWx5JywgZm9udC5nZXRGYW1pbHkoKSApO1xuICAgIHRleHRFbGVtZW50LnNldEF0dHJpYnV0ZSggJ2ZvbnQtc2l6ZScsIGZvbnQuZ2V0U2l6ZSgpICk7XG4gICAgdGV4dEVsZW1lbnQuc2V0QXR0cmlidXRlKCAnZm9udC1zdHlsZScsIGZvbnQuZ2V0U3R5bGUoKSApO1xuICAgIHRleHRFbGVtZW50LnNldEF0dHJpYnV0ZSggJ2ZvbnQtd2VpZ2h0JywgZm9udC5nZXRXZWlnaHQoKSApO1xuICAgIHRleHRFbGVtZW50LnNldEF0dHJpYnV0ZSggJ2ZvbnQtc3RyZXRjaCcsIGZvbnQuZ2V0U3RyZXRjaCgpICk7XG4gICAgdGV4dEVsZW1lbnQubGFzdENoaWxkLm5vZGVWYWx1ZSA9IHJlbmRlcmVkVGV4dDtcbiAgfSxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgY29udGFpbmVycyBhbmQgZWxlbWVudHMgcmVxdWlyZWQgZm9yIFNWRyB0ZXh0IG1lYXN1cmVtZW50LlxuICAgKiBAcHVibGljXG4gICAqL1xuICBpbml0aWFsaXplVGV4dEJvdW5kcygpIHtcbiAgICBzdmdUZXh0U2l6ZUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBURVhUX1NJWkVfQ09OVEFJTkVSX0lEICk7XG5cbiAgICBpZiAoICFzdmdUZXh0U2l6ZUNvbnRhaW5lciApIHtcbiAgICAgIC8vIHNldCB1cCB0aGUgY29udGFpbmVyIGFuZCB0ZXh0IGZvciB0ZXN0aW5nIHRleHQgYm91bmRzIHF1aWNrbHkgKHVzaW5nIGFwcHJveGltYXRlU1ZHQm91bmRzKVxuICAgICAgc3ZnVGV4dFNpemVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnc3ZnJyApO1xuICAgICAgc3ZnVGV4dFNpemVDb250YWluZXIuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCAnMicgKTtcbiAgICAgIHN2Z1RleHRTaXplQ29udGFpbmVyLnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsICcyJyApO1xuICAgICAgc3ZnVGV4dFNpemVDb250YWluZXIuc2V0QXR0cmlidXRlKCAnaWQnLCBURVhUX1NJWkVfQ09OVEFJTkVSX0lEICk7XG4gICAgICBzdmdUZXh0U2l6ZUNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoICdzdHlsZScsICd2aXNpYmlsaXR5OiBoaWRkZW47IHBvaW50ZXItZXZlbnRzOiBub25lOyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IC02NTUzNXB4OyByaWdodDogLTY1NTM1cHg7JyApOyAvLyBzbyB3ZSBkb24ndCBmbGFzaCBpdCBpbiBhIHZpc2libGUgd2F5IHRvIHRoZSB1c2VyXG4gICAgfVxuXG4gICAgc3ZnVGV4dFNpemVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIFRFWFRfU0laRV9FTEVNRU5UX0lEICk7XG5cbiAgICAvLyBOT1RFISBjb3BpZXMgY3JlYXRlU1ZHRWxlbWVudFxuICAgIGlmICggIXN2Z1RleHRTaXplRWxlbWVudCApIHtcbiAgICAgIHN2Z1RleHRTaXplRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICd0ZXh0JyApO1xuICAgICAgc3ZnVGV4dFNpemVFbGVtZW50LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggJycgKSApO1xuICAgICAgc3ZnVGV4dFNpemVFbGVtZW50LnNldEF0dHJpYnV0ZSggJ2RvbWluYW50LWJhc2VsaW5lJywgJ2FscGhhYmV0aWMnICk7IC8vIHRvIG1hdGNoIENhbnZhcyByaWdodCBub3dcbiAgICAgIHN2Z1RleHRTaXplRWxlbWVudC5zZXRBdHRyaWJ1dGUoICd0ZXh0LXJlbmRlcmluZycsICdnZW9tZXRyaWNQcmVjaXNpb24nICk7XG4gICAgICBzdmdUZXh0U2l6ZUVsZW1lbnQuc2V0QXR0cmlidXRlTlMoICdodHRwOi8vd3d3LnczLm9yZy9YTUwvMTk5OC9uYW1lc3BhY2UnLCAneG1sOnNwYWNlJywgJ3ByZXNlcnZlJyApO1xuICAgICAgc3ZnVGV4dFNpemVFbGVtZW50LnNldEF0dHJpYnV0ZSggJ2lkJywgVEVYVF9TSVpFX0VMRU1FTlRfSUQgKTtcbiAgICAgIHN2Z1RleHRTaXplQ29udGFpbmVyLmFwcGVuZENoaWxkKCBzdmdUZXh0U2l6ZUVsZW1lbnQgKTtcbiAgICB9XG4gIH1cbn07XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdUZXh0Qm91bmRzJywgVGV4dEJvdW5kcyApO1xuXG5leHBvcnQgZGVmYXVsdCBUZXh0Qm91bmRzOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwiQ2FudmFzQ29udGV4dFdyYXBwZXIiLCJGb250Iiwic2NlbmVyeSIsInN2Z25zIiwiVXRpbHMiLCJURVhUX1NJWkVfQ09OVEFJTkVSX0lEIiwiVEVYVF9TSVpFX0VMRU1FTlRfSUQiLCJzdmdUZXh0U2l6ZUNvbnRhaW5lciIsInN2Z1RleHRTaXplRWxlbWVudCIsImh5YnJpZEZvbnRWZXJ0aWNhbENhY2hlIiwiZGVsaXZlcmVkV2FybmluZyIsIlRleHRCb3VuZHMiLCJhcHByb3hpbWF0ZVNWR0JvdW5kcyIsImZvbnQiLCJyZW5kZXJlZFRleHQiLCJhc3NlcnQiLCJwYXJlbnROb2RlIiwiZG9jdW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJFcnJvciIsInNldFNWR1RleHRBdHRyaWJ1dGVzIiwicmVjdCIsImdldEJCb3giLCJ3aWR0aCIsImhlaWdodCIsImxlbmd0aCIsImNvbnNvbGUiLCJsb2ciLCJndWVzc1NWR0JvdW5kcyIsIngiLCJ5IiwicHgiLCJnZXROdW1lcmljU2l6ZSIsImlzQm9sZCIsIndlaWdodCIsImFjY3VyYXRlQ2FudmFzQm91bmRzIiwidGV4dCIsImNvbnRleHQiLCJzY3JhdGNoQ29udGV4dCIsIl9mb250IiwidG9DU1MiLCJkaXJlY3Rpb24iLCJtZXRyaWNzIiwibWVhc3VyZVRleHQiLCJhY3R1YWxCb3VuZGluZ0JveExlZnQiLCJhY3R1YWxCb3VuZGluZ0JveEFzY2VudCIsImFjdHVhbEJvdW5kaW5nQm94UmlnaHQiLCJhY3R1YWxCb3VuZGluZ0JveERlc2NlbnQiLCJhY2N1cmF0ZUNhbnZhc0JvdW5kc0ZhbGxiYWNrIiwic3ZnQm91bmRzIiwiYWNjdXJhdGVCb3VuZHMiLCJjYW52YXNBY2N1cmF0ZUJvdW5kcyIsImZpbGxUZXh0IiwiaGFzUGFpbnRhYmxlU3Ryb2tlIiwiZmFrZVdyYXBwZXIiLCJiZWZvcmVDYW52YXNTdHJva2UiLCJzdHJva2VUZXh0IiwiYWZ0ZXJDYW52YXNTdHJva2UiLCJwcmVjaXNpb24iLCJyZXNvbHV0aW9uIiwiaW5pdGlhbFNjYWxlIiwiTWF0aCIsIm1heCIsImFicyIsIm1pblgiLCJtaW5ZIiwibWF4WCIsIm1heFkiLCJpc0Zpbml0ZSIsImdldFZlcnRpY2FsQm91bmRzIiwiY3NzIiwidmVydGljYWxCb3VuZHMiLCJhcHByb3hpbWF0ZUNhbnZhc1dpZHRoIiwiYXBwcm94aW1hdGVIeWJyaWRCb3VuZHMiLCJjYW52YXNXaWR0aCIsImFwcHJveGltYXRlRE9NQm91bmRzIiwiZWxlbWVudCIsIm1heEhlaWdodCIsImRpdiIsImNyZWF0ZUVsZW1lbnQiLCIkIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwicGFkZGluZyIsIm1hcmdpbiIsImRpc3BsYXkiLCJzcGFuIiwic2V0QXR0cmlidXRlIiwiZmFrZUltYWdlIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiZGl2UmVjdCIsInJlc3VsdCIsInJpZ2h0IiwiYm90dG9tIiwic2hpZnRlZFhZIiwicmVtb3ZlQ2hpbGQiLCJhcHByb3hpbWF0ZUltcHJvdmVkRE9NQm91bmRzIiwic3R5bGUiLCJjb2xvciIsImJvdW5kcyIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJvZmZzZXRXaWR0aCIsIm9mZnNldEhlaWdodCIsInNoaWZ0ZWRZIiwidGV4dEVsZW1lbnQiLCJnZXRGYW1pbHkiLCJnZXRTaXplIiwiZ2V0U3R5bGUiLCJnZXRXZWlnaHQiLCJnZXRTdHJldGNoIiwibGFzdENoaWxkIiwibm9kZVZhbHVlIiwiaW5pdGlhbGl6ZVRleHRCb3VuZHMiLCJnZXRFbGVtZW50QnlJZCIsImNyZWF0ZUVsZW1lbnROUyIsImNyZWF0ZVRleHROb2RlIiwic2V0QXR0cmlidXRlTlMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLDZCQUE2QjtBQUNqRCxTQUFTQyxvQkFBb0IsRUFBRUMsSUFBSSxFQUFFQyxPQUFPLEVBQUVDLEtBQUssRUFBRUMsS0FBSyxRQUFRLGdCQUFnQjtBQUVsRiwwSEFBMEg7QUFDMUgsTUFBTUMseUJBQXlCO0FBRS9CLDBHQUEwRztBQUMxRyxNQUFNQyx1QkFBdUI7QUFFN0IscUhBQXFIO0FBQ3JILElBQUlDO0FBRUosbUdBQW1HO0FBQ25HLElBQUlDO0FBRUosdUhBQXVIO0FBQ3ZILE1BQU1DLDBCQUEwQixDQUFDO0FBRWpDLElBQUlDLG1CQUFtQjtBQUV2QixNQUFNQyxhQUFhO0lBQ2pCOzs7Ozs7Ozs7OztHQVdDLEdBQ0RDLHNCQUFzQkMsSUFBSSxFQUFFQyxZQUFZO1FBQ3RDQyxVQUFVQSxPQUFRRixnQkFBZ0JaLE1BQU07UUFDeENjLFVBQVVBLE9BQVEsT0FBT0QsaUJBQWlCLFVBQVU7UUFFcEQsSUFBSyxDQUFDUCxxQkFBcUJTLFVBQVUsRUFBRztZQUN0QyxJQUFLQyxTQUFTQyxJQUFJLEVBQUc7Z0JBQ25CRCxTQUFTQyxJQUFJLENBQUNDLFdBQVcsQ0FBRVo7WUFDN0IsT0FDSztnQkFDSCxNQUFNLElBQUlhLE1BQU87WUFDbkI7UUFDRjtRQUNBVCxXQUFXVSxvQkFBb0IsQ0FBRWIsb0JBQW9CSyxNQUFNQztRQUMzRCxNQUFNUSxPQUFPZCxtQkFBbUJlLE9BQU87UUFFdkMsSUFBS0QsS0FBS0UsS0FBSyxLQUFLLEtBQUtGLEtBQUtHLE1BQU0sS0FBSyxLQUFLWCxh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