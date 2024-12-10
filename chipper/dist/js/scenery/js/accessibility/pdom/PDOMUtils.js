// Copyright 2017-2024, University of Colorado Boulder
/**
 * Utility functions for scenery that are specifically useful for ParallelDOM.
 * These generally pertain to DOM traversal and manipulation.
 *
 * For the most part this file's methods are public in a scenery-internal context. Some exceptions apply. Please
 * consult @jessegreenberg and/or @zepumph before using this outside of scenery.
 *
 * @author Jesse Greenberg
 */ import { isTReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import validate from '../../../../axon/js/validate.js';
import Validation from '../../../../axon/js/Validation.js';
import merge from '../../../../phet-core/js/merge.js';
import stripEmbeddingMarks from '../../../../phet-core/js/stripEmbeddingMarks.js';
import { PDOMSiblingStyle, RichText, scenery, Text } from '../../imports.js';
// constants
const NEXT = 'NEXT';
const PREVIOUS = 'PREVIOUS';
// HTML tag names
const INPUT_TAG = 'INPUT';
const LABEL_TAG = 'LABEL';
const BUTTON_TAG = 'BUTTON';
const TEXTAREA_TAG = 'TEXTAREA';
const SELECT_TAG = 'SELECT';
const OPTGROUP_TAG = 'OPTGROUP';
const DATALIST_TAG = 'DATALIST';
const OUTPUT_TAG = 'OUTPUT';
const DIV_TAG = 'DIV';
const A_TAG = 'A';
const AREA_TAG = 'AREA';
const P_TAG = 'P';
const IFRAME_TAG = 'IFRAME';
// tag names with special behavior
const BOLD_TAG = 'B';
const STRONG_TAG = 'STRONG';
const I_TAG = 'I';
const EM_TAG = 'EM';
const MARK_TAG = 'MARK';
const SMALL_TAG = 'SMALL';
const DEL_TAG = 'DEL';
const INS_TAG = 'INS';
const SUB_TAG = 'SUB';
const SUP_TAG = 'SUP';
const BR_TAG = 'BR';
// These browser tags are a definition of default focusable elements, converted from Javascript types,
// see https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus
const DEFAULT_FOCUSABLE_TAGS = [
    A_TAG,
    AREA_TAG,
    INPUT_TAG,
    SELECT_TAG,
    TEXTAREA_TAG,
    BUTTON_TAG,
    IFRAME_TAG
];
// collection of tags that are used for formatting text
const FORMATTING_TAGS = [
    BOLD_TAG,
    STRONG_TAG,
    I_TAG,
    EM_TAG,
    MARK_TAG,
    SMALL_TAG,
    DEL_TAG,
    INS_TAG,
    SUB_TAG,
    SUP_TAG,
    BR_TAG
];
// these elements do not have a closing tag, so they won't support features like innerHTML. This is how PhET treats
// these elements, not necessary what is legal html.
const ELEMENTS_WITHOUT_CLOSING_TAG = [
    INPUT_TAG
];
// valid DOM events that the display adds listeners to. For a list of scenery events that support pdom features
// see Input.PDOM_EVENT_TYPES
// NOTE: Update BrowserEvents if this is added to
const DOM_EVENTS = [
    'focusin',
    'focusout',
    'input',
    'change',
    'click',
    'keydown',
    'keyup'
];
// DOM events that must have been triggered from user input of some kind, and will trigger the
// Display.userGestureEmitter. focus and blur events will trigger from scripting so they must be excluded.
const USER_GESTURE_EVENTS = [
    'input',
    'change',
    'click',
    'keydown',
    'keyup'
];
// A collection of DOM events which should be blocked from reaching the scenery Display div
// if they are targeted at an ancestor of the PDOM. Some screen readers try to send fake
// mouse/touch/pointer events to elements but for the purposes of Accessibility we only
// want to respond to DOM_EVENTS.
const BLOCKED_DOM_EVENTS = [
    // touch
    'touchstart',
    'touchend',
    'touchmove',
    'touchcancel',
    // mouse
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseover',
    'mouseout',
    // pointer
    'pointerdown',
    'pointerup',
    'pointermove',
    'pointerover',
    'pointerout',
    'pointercancel',
    'gotpointercapture',
    'lostpointercapture'
];
const ARIA_LABELLEDBY = 'aria-labelledby';
const ARIA_DESCRIBEDBY = 'aria-describedby';
const ARIA_ACTIVE_DESCENDANT = 'aria-activedescendant';
// data attribute to flag whether an element is focusable - cannot check tabindex because IE11 and Edge assign
// tabIndex=0 internally for all HTML elements, including those that should not receive focus
const DATA_FOCUSABLE = 'data-focusable';
// data attribute which contains the unique ID of a Trail that allows us to find the PDOMPeer associated
// with a particular DOM element. This is used in several places in scenery accessibility, mostly PDOMPeer and Input.
const DATA_PDOM_UNIQUE_ID = 'data-unique-id';
// {Array.<String>} attributes that put an ID of another attribute as the value, see https://github.com/phetsims/scenery/issues/819
const ASSOCIATION_ATTRIBUTES = [
    ARIA_LABELLEDBY,
    ARIA_DESCRIBEDBY,
    ARIA_ACTIVE_DESCENDANT
];
/**
 * Get all 'element' nodes off the parent element, placing them in an array for easy traversal.  Note that this
 * includes all elements, even those that are 'hidden' or purely for structure.
 *
 * @param  {HTMLElement} domElement - parent whose children will be linearized
 * @returns {HTMLElement[]}
 */ function getLinearDOMElements(domElement) {
    // gets ALL descendant children for the element
    const children = domElement.getElementsByTagName('*');
    const linearDOM = [];
    for(let i = 0; i < children.length; i++){
        // searching for the HTML element nodes (NOT Scenery nodes)
        if (children[i].nodeType === Node.ELEMENT_NODE) {
            linearDOM[i] = children[i];
        }
    }
    return linearDOM;
}
/**
 * Determine if an element is hidden.  An element is considered 'hidden' if it (or any of its ancestors) has the
 * 'hidden' attribute.
 *
 * @param {HTMLElement} domElement
 * @returns {Boolean}
 */ function isElementHidden(domElement) {
    if (domElement.hidden) {
        return true;
    } else if (domElement === document.body) {
        return false;
    } else {
        return isElementHidden(domElement.parentElement);
    }
}
/**
 * Get the next or previous focusable element in the parallel DOM under the parent element and relative to the currently
 * focused element. Useful if you need to set focus dynamically or need to prevent default behavior
 * when focus changes. If no next or previous focusable is found, it returns the currently focused element.
 * This function should not be used directly, use getNextFocusable() or getPreviousFocusable() instead.
 *
 * @param {string} direction - direction of traversal, one of 'NEXT' | 'PREVIOUS'
 * @param {HTMLElement} [parentElement] - optional, search will be limited to children of this element
 * @returns {HTMLElement}
 */ function getNextPreviousFocusable(direction, parentElement) {
    // linearize the document [or the desired parent] for traversal
    const parent = parentElement || document.body;
    const linearDOM = getLinearDOMElements(parent);
    const activeElement = document.activeElement;
    const activeIndex = linearDOM.indexOf(activeElement);
    const delta = direction === NEXT ? +1 : -1;
    // find the next focusable element in the DOM
    let nextIndex = activeIndex + delta;
    while(nextIndex < linearDOM.length && nextIndex >= 0){
        const nextElement = linearDOM[nextIndex];
        nextIndex += delta;
        if (PDOMUtils.isElementFocusable(nextElement)) {
            return nextElement;
        }
    }
    // if no next focusable is found, return the active DOM element
    return activeElement;
}
/**
 * Trims the white space from the left of the string.
 * Solution from https://stackoverflow.com/questions/1593859/left-trim-in-javascript
 * @param  {string} string
 * @returns {string}
 */ function trimLeft(string) {
    // ^ - from the beginning of the string
    // \s - whitespace character
    // + - greedy
    return string.replace(/^\s+/, '');
}
/**
 * Returns whether or not the tagName supports innerHTML or textContent in PhET.
 * @private
 * @param {string} tagName
 * @returns {boolean}
 */ function tagNameSupportsContent(tagName) {
    return !_.includes(ELEMENTS_WITHOUT_CLOSING_TAG, tagName.toUpperCase());
}
const PDOMUtils = {
    /**
   * Given a Property or string, return the Propergy value if it is a property. Otherwise just return the string.
   * Useful for forwarding the string to DOM content, but allowing the API to take a StringProperty. Eventually
   * PDOM may support dynamic strings.
   * @param valueOrProperty
   * @returns {string|Property}
   */ unwrapStringProperty (valueOrProperty) {
        const result = valueOrProperty === null ? null : typeof valueOrProperty === 'string' ? valueOrProperty : valueOrProperty.value;
        assert && assert(result === null || typeof result === 'string');
        return result;
    },
    /**
   * Get the next focusable element relative to the currently focused element and under the parentElement.
   * Can be useful if you want to emulate the 'Tab' key behavior or just transition focus to the next element
   * in the document. If no next focusable can be found, it will return the currently focused element.
   * @public
   *
   * @param {HTMLElement} [parentElement] - optional, search will be limited to elements under this element
   * @returns {HTMLElement}
   */ getNextFocusable (parentElement) {
        return getNextPreviousFocusable(NEXT, parentElement);
    },
    /**
   * Get the previous focusable element relative to the currently focused element under the parentElement. Can be
   * useful if you want to emulate 'Shift+Tab' behavior. If no next focusable can be found, it will return the
   * currently focused element.
   * @public
   *
   * @param {HTMLElement} [parentElement] - optional, search will be limited to elements under this parent
   * @returns {HTMLElement}
   */ getPreviousFocusable (parentElement) {
        return getNextPreviousFocusable(PREVIOUS, parentElement);
    },
    /**
   * Get the first focusable element under the parentElement. If no element is available, the document.body is
   * returned.
   *
   * @param {HTMLElement} [parentElement] - optionally restrict the search to elements under this parent
   * @returns {HTMLElement}
   */ getFirstFocusable (parentElement) {
        const parent = parentElement || document.body;
        const linearDOM = getLinearDOMElements(parent);
        // return the document.body if no element is found
        let firstFocusable = document.body;
        let nextIndex = 0;
        while(nextIndex < linearDOM.length){
            const nextElement = linearDOM[nextIndex];
            nextIndex++;
            if (PDOMUtils.isElementFocusable(nextElement)) {
                firstFocusable = nextElement;
                break;
            }
        }
        return firstFocusable;
    },
    /**
   * Return a random focusable element in the document. Particularly useful for fuzz testing.
   * @public
   *
   * @parma {Random} random
   * @returns {HTMLElement}
   */ getRandomFocusable (random) {
        assert && assert(random, 'Random expected');
        const linearDOM = getLinearDOMElements(document.body);
        const focusableElements = [];
        for(let i = 0; i < linearDOM.length; i++){
            PDOMUtils.isElementFocusable(linearDOM[i]) && focusableElements.push(linearDOM[i]);
        }
        return focusableElements[random.nextInt(focusableElements.length)];
    },
    /**
   * ParallelDOM trait values may be in a Property to support dynamic locales. This function
   * returns the Property value in that case. The value may be a string, boolean, or number -
   * all of which are valid values for native HTML attributes.
   *
   * @param {string | boolean | number | TReadOnlyProperty<string|boolean|number>} valueOrProperty
   * @returns {string|boolean|number}
   */ unwrapProperty (valueOrProperty) {
        return isTReadOnlyProperty(valueOrProperty) ? valueOrProperty.value : valueOrProperty;
    },
    /**
   * If the textContent has any tags that are not formatting tags, return false. Only checking for
   * tags that are not in the allowed FORMATTING_TAGS. If there are no tags at all, return false.
   * @public
   *
   * @param {string} textContent
   * @returns {boolean}
   */ containsFormattingTags (textContent) {
        // no-op for null case
        if (textContent === null) {
            return false;
        }
        assert && assert(typeof textContent === 'string', 'unsupported type for textContent.');
        let i = 0;
        const openIndices = [];
        const closeIndices = [];
        // find open/close tag pairs in the text content
        while(i < textContent.length){
            const openIndex = textContent.indexOf('<', i);
            const closeIndex = textContent.indexOf('>', i);
            if (openIndex > -1) {
                openIndices.push(openIndex);
                i = openIndex + 1;
            }
            if (closeIndex > -1) {
                closeIndices.push(closeIndex);
                i = closeIndex + 1;
            } else {
                i++;
            }
        }
        // malformed tags or no tags at all, return false immediately
        if (openIndices.length !== closeIndices.length || openIndices.length === 0) {
            return false;
        }
        // check the name in between the open and close brackets - if anything other than formatting tags, return false
        let onlyFormatting = true;
        const upperCaseContent = textContent.toUpperCase();
        for(let j = 0; j < openIndices.length; j++){
            // get the name and remove the closing slash
            let subString = upperCaseContent.substring(openIndices[j] + 1, closeIndices[j]);
            subString = subString.replace('/', '');
            // if the left of the substring contains space, it is not a valid tag so allow
            const trimmed = trimLeft(subString);
            if (subString.length - trimmed.length > 0) {
                continue;
            }
            if (!_.includes(FORMATTING_TAGS, subString)) {
                onlyFormatting = false;
            }
        }
        return onlyFormatting;
    },
    /**
   * If the text content uses formatting tags, set the content as innerHTML. Otherwise, set as textContent.
   * In general, textContent is more secure and much faster because it doesn't trigger DOM styling and
   * element insertions.
   * @public
   *
   * @param {Element} domElement
   * @param {string|number|null} textContent - domElement is cleared of content if null, could have acceptable HTML
   *                                    "formatting" tags in it
   */ setTextContent (domElement, textContent) {
        assert && assert(domElement instanceof Element); // parent to HTMLElement, to support other namespaces
        assert && assert(textContent === null || typeof textContent === 'string');
        if (textContent === null) {
            domElement.innerHTML = '';
        } else {
            // XHTML requires <br/> instead of <br>, but <br/> is still valid in HTML. See
            // https://github.com/phetsims/scenery/issues/1309
            const textWithoutBreaks = textContent.replaceAll('<br>', '<br/>');
            // TODO: this line must be removed to support i18n Interactive Description, see https://github.com/phetsims/chipper/issues/798
            const textWithoutEmbeddingMarks = stripEmbeddingMarks(textWithoutBreaks);
            // Disallow any unfilled template variables to be set in the PDOM.
            validate(textWithoutEmbeddingMarks, Validation.STRING_WITHOUT_TEMPLATE_VARS_VALIDATOR);
            if (tagNameSupportsContent(domElement.tagName)) {
                // only returns true if content contains listed formatting tags
                if (PDOMUtils.containsFormattingTags(textWithoutEmbeddingMarks)) {
                    domElement.innerHTML = textWithoutEmbeddingMarks;
                } else {
                    domElement.textContent = textWithoutEmbeddingMarks;
                }
            }
        }
    },
    /**
   * Given a tagName, test if the element will be focuable by default by the browser.
   * Different from isElementFocusable, because this only looks at tags that the browser will automatically put
   * a >=0 tab index on.
   * @public
   *
   * NOTE: Uses a set of browser types as the definition of default focusable elements,
   * see https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus
   *
   * @param tagName
   * @returns {boolean}
   */ tagIsDefaultFocusable (tagName) {
        return _.includes(DEFAULT_FOCUSABLE_TAGS, tagName.toUpperCase());
    },
    /**
   * Returns true if the element is focusable. Assumes that all focusable  elements have tabIndex >= 0, which
   * is only true for elements of the Parallel DOM.
   *
   * @param {HTMLElement} domElement
   * @returns {boolean}
   */ isElementFocusable (domElement) {
        if (!document.body.contains(domElement)) {
            return false;
        }
        // continue to next element if this one is meant to be hidden
        if (isElementHidden(domElement)) {
            return false;
        }
        // if element is for formatting, skipe over it - required since IE gives these tabindex="0"
        if (_.includes(FORMATTING_TAGS, domElement.tagName)) {
            return false;
        }
        return domElement.getAttribute(DATA_FOCUSABLE) === 'true';
    },
    /**
   * @public
   *
   * @param {string} tagName
   * @returns {boolean} - true if the tag does support inner content
   */ tagNameSupportsContent (tagName) {
        return tagNameSupportsContent(tagName);
    },
    /**
   * Helper function to remove multiple HTMLElements from another HTMLElement
   * @public
   *
   * @param {HTMLElement} element
   * @param {Array.<HTMLElement>} childrenToRemove
   */ removeElements (element, childrenToRemove) {
        for(let i = 0; i < childrenToRemove.length; i++){
            const childToRemove = childrenToRemove[i];
            assert && assert(element.contains(childToRemove), 'element does not contain child to be removed: ', childToRemove);
            element.removeChild(childToRemove);
        }
    },
    /**
   * Helper function to add multiple elements as children to a parent
   * @public
   *
   * @param {HTMLElement} element - to add children to
   * @param {Array.<HTMLElement>} childrenToAdd
   * @param {HTMLElement} [beforeThisElement] - if not supplied, the insertBefore call will just use 'null'
   */ insertElements (element, childrenToAdd, beforeThisElement) {
        assert && assert(element instanceof window.Element);
        assert && assert(Array.isArray(childrenToAdd));
        for(let i = 0; i < childrenToAdd.length; i++){
            const childToAdd = childrenToAdd[i];
            element.insertBefore(childToAdd, beforeThisElement || null);
        }
    },
    /**
   * Create an HTML element.  Unless this is a form element or explicitly marked as focusable, add a negative
   * tab index. IE gives all elements a tabIndex of 0 and handles tab navigation internally, so this marks
   * which elements should not be in the focus order.
   *
   * @public
   * @param  {string} tagName
   * @param {boolean} focusable - should the element be explicitly added to the focus order?
   * @param {Object} [options]
   * @returns {HTMLElement}
   */ createElement (tagName, focusable, options) {
        options = merge({
            // {string|null} - If non-null, the element will be created with the specific namespace
            namespace: null,
            // {string|null} - A string id that uniquely represents this element in the DOM, must be completely
            // unique in the DOM.
            id: null
        }, options);
        const domElement = options.namespace ? document.createElementNS(options.namespace, tagName) : document.createElement(tagName);
        if (options.id) {
            domElement.id = options.id;
        }
        // set tab index if we are overriding default browser behavior
        PDOMUtils.overrideFocusWithTabIndex(domElement, focusable);
        // gives this element styling from SceneryStyle
        domElement.classList.add(PDOMSiblingStyle.SIBLING_CLASS_NAME);
        return domElement;
    },
    /**
   * Add a tab index to an element when overriding the default focus behavior for the element. Adding tabindex
   * to an element can only be done when overriding the default browser behavior because tabindex interferes with
   * the way JAWS reads through content on Chrome, see https://github.com/phetsims/scenery/issues/893
   *
   * If default behavior and focusable align, the tabindex attribute is removed so that can't interfere with a
   * screen reader.
   * @public (scenery-internal)
   *
   * @param {HTMLElement} element
   * @param {boolean} focusable
   */ overrideFocusWithTabIndex (element, focusable) {
        const defaultFocusable = PDOMUtils.tagIsDefaultFocusable(element.tagName);
        // only add a tabindex when we are overriding the default focusable bahvior of the browser for the tag name
        if (defaultFocusable !== focusable) {
            element.tabIndex = focusable ? 0 : -1;
        } else {
            element.removeAttribute('tabindex');
        }
        element.setAttribute(DATA_FOCUSABLE, focusable);
    },
    /**
   * Given a Node, search for a stringProperty in the Node or its children, recursively. This
   * is useful for finding a string to set as ParallelDOM content.
   *
   * This uses a depth first search to find the first instance of Text or RichText under the Node.
   * It won't necessarily be the closest to the root of the Node or most "prominent" Text/RichText
   * if there are multiple Text/RichText nodes.
   *
   * @public
   * @returns {TReadOnlyProperty<string>|null}
   */ findStringProperty (node) {
        // Check if the node is an instance of Text or RichText and return the stringProperty
        if (node instanceof Text || node instanceof RichText) {
            return node.stringProperty;
        }
        // If the node has children, iterate over them recursively
        if (node.children) {
            for (const child of node.children){
                const text = PDOMUtils.findStringProperty(child);
                if (text) {
                    return text;
                }
            }
        }
        // Return null if text is not found
        return null;
    },
    TAGS: {
        INPUT: INPUT_TAG,
        LABEL: LABEL_TAG,
        BUTTON: BUTTON_TAG,
        TEXTAREA: TEXTAREA_TAG,
        SELECT: SELECT_TAG,
        OPTGROUP: OPTGROUP_TAG,
        DATALIST: DATALIST_TAG,
        OUTPUT: OUTPUT_TAG,
        DIV: DIV_TAG,
        A: A_TAG,
        P: P_TAG,
        B: BOLD_TAG,
        STRONG: STRONG_TAG,
        I: I_TAG,
        EM: EM_TAG,
        MARK: MARK_TAG,
        SMALL: SMALL_TAG,
        DEL: DEL_TAG,
        INS: INS_TAG,
        SUB: SUB_TAG,
        SUP: SUP_TAG
    },
    // these elements are typically associated with forms, and support certain attributes
    FORM_ELEMENTS: [
        INPUT_TAG,
        BUTTON_TAG,
        TEXTAREA_TAG,
        SELECT_TAG,
        OPTGROUP_TAG,
        DATALIST_TAG,
        OUTPUT_TAG,
        A_TAG
    ],
    // default tags for html elements of the Node.
    DEFAULT_CONTAINER_TAG_NAME: DIV_TAG,
    DEFAULT_DESCRIPTION_TAG_NAME: P_TAG,
    DEFAULT_LABEL_TAG_NAME: P_TAG,
    ASSOCIATION_ATTRIBUTES: ASSOCIATION_ATTRIBUTES,
    // valid input types that support the "checked" property/attribute for input elements
    INPUT_TYPES_THAT_SUPPORT_CHECKED: [
        'RADIO',
        'CHECKBOX'
    ],
    DOM_EVENTS: DOM_EVENTS,
    USER_GESTURE_EVENTS: USER_GESTURE_EVENTS,
    BLOCKED_DOM_EVENTS: BLOCKED_DOM_EVENTS,
    DATA_PDOM_UNIQUE_ID: DATA_PDOM_UNIQUE_ID,
    PDOM_UNIQUE_ID_SEPARATOR: '-',
    // attribute used for elements which Scenery should not dispatch SceneryEvents when DOM event input is received on
    // them, see ParallelDOM.setExcludeLabelSiblingFromInput for more information
    DATA_EXCLUDE_FROM_INPUT: 'data-exclude-from-input'
};
scenery.register('PDOMUtils', PDOMUtils);
export default PDOMUtils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BET01VdGlscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyBmb3Igc2NlbmVyeSB0aGF0IGFyZSBzcGVjaWZpY2FsbHkgdXNlZnVsIGZvciBQYXJhbGxlbERPTS5cbiAqIFRoZXNlIGdlbmVyYWxseSBwZXJ0YWluIHRvIERPTSB0cmF2ZXJzYWwgYW5kIG1hbmlwdWxhdGlvbi5cbiAqXG4gKiBGb3IgdGhlIG1vc3QgcGFydCB0aGlzIGZpbGUncyBtZXRob2RzIGFyZSBwdWJsaWMgaW4gYSBzY2VuZXJ5LWludGVybmFsIGNvbnRleHQuIFNvbWUgZXhjZXB0aW9ucyBhcHBseS4gUGxlYXNlXG4gKiBjb25zdWx0IEBqZXNzZWdyZWVuYmVyZyBhbmQvb3IgQHplcHVtcGggYmVmb3JlIHVzaW5nIHRoaXMgb3V0c2lkZSBvZiBzY2VuZXJ5LlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IHsgaXNUUmVhZE9ubHlQcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvdmFsaWRhdGUuanMnO1xuaW1wb3J0IFZhbGlkYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9WYWxpZGF0aW9uLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IHN0cmlwRW1iZWRkaW5nTWFya3MgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3N0cmlwRW1iZWRkaW5nTWFya3MuanMnO1xuaW1wb3J0IHsgUERPTVNpYmxpbmdTdHlsZSwgUmljaFRleHQsIHNjZW5lcnksIFRleHQgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBORVhUID0gJ05FWFQnO1xuY29uc3QgUFJFVklPVVMgPSAnUFJFVklPVVMnO1xuXG4vLyBIVE1MIHRhZyBuYW1lc1xuY29uc3QgSU5QVVRfVEFHID0gJ0lOUFVUJztcbmNvbnN0IExBQkVMX1RBRyA9ICdMQUJFTCc7XG5jb25zdCBCVVRUT05fVEFHID0gJ0JVVFRPTic7XG5jb25zdCBURVhUQVJFQV9UQUcgPSAnVEVYVEFSRUEnO1xuY29uc3QgU0VMRUNUX1RBRyA9ICdTRUxFQ1QnO1xuY29uc3QgT1BUR1JPVVBfVEFHID0gJ09QVEdST1VQJztcbmNvbnN0IERBVEFMSVNUX1RBRyA9ICdEQVRBTElTVCc7XG5jb25zdCBPVVRQVVRfVEFHID0gJ09VVFBVVCc7XG5jb25zdCBESVZfVEFHID0gJ0RJVic7XG5jb25zdCBBX1RBRyA9ICdBJztcbmNvbnN0IEFSRUFfVEFHID0gJ0FSRUEnO1xuY29uc3QgUF9UQUcgPSAnUCc7XG5jb25zdCBJRlJBTUVfVEFHID0gJ0lGUkFNRSc7XG5cbi8vIHRhZyBuYW1lcyB3aXRoIHNwZWNpYWwgYmVoYXZpb3JcbmNvbnN0IEJPTERfVEFHID0gJ0InO1xuY29uc3QgU1RST05HX1RBRyA9ICdTVFJPTkcnO1xuY29uc3QgSV9UQUcgPSAnSSc7XG5jb25zdCBFTV9UQUcgPSAnRU0nO1xuY29uc3QgTUFSS19UQUcgPSAnTUFSSyc7XG5jb25zdCBTTUFMTF9UQUcgPSAnU01BTEwnO1xuY29uc3QgREVMX1RBRyA9ICdERUwnO1xuY29uc3QgSU5TX1RBRyA9ICdJTlMnO1xuY29uc3QgU1VCX1RBRyA9ICdTVUInO1xuY29uc3QgU1VQX1RBRyA9ICdTVVAnO1xuY29uc3QgQlJfVEFHID0gJ0JSJztcblxuLy8gVGhlc2UgYnJvd3NlciB0YWdzIGFyZSBhIGRlZmluaXRpb24gb2YgZGVmYXVsdCBmb2N1c2FibGUgZWxlbWVudHMsIGNvbnZlcnRlZCBmcm9tIEphdmFzY3JpcHQgdHlwZXMsXG4vLyBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTU5OTY2MC93aGljaC1odG1sLWVsZW1lbnRzLWNhbi1yZWNlaXZlLWZvY3VzXG5jb25zdCBERUZBVUxUX0ZPQ1VTQUJMRV9UQUdTID0gWyBBX1RBRywgQVJFQV9UQUcsIElOUFVUX1RBRywgU0VMRUNUX1RBRywgVEVYVEFSRUFfVEFHLCBCVVRUT05fVEFHLCBJRlJBTUVfVEFHIF07XG5cbi8vIGNvbGxlY3Rpb24gb2YgdGFncyB0aGF0IGFyZSB1c2VkIGZvciBmb3JtYXR0aW5nIHRleHRcbmNvbnN0IEZPUk1BVFRJTkdfVEFHUyA9IFsgQk9MRF9UQUcsIFNUUk9OR19UQUcsIElfVEFHLCBFTV9UQUcsIE1BUktfVEFHLCBTTUFMTF9UQUcsIERFTF9UQUcsIElOU19UQUcsIFNVQl9UQUcsXG4gIFNVUF9UQUcsIEJSX1RBRyBdO1xuXG4vLyB0aGVzZSBlbGVtZW50cyBkbyBub3QgaGF2ZSBhIGNsb3NpbmcgdGFnLCBzbyB0aGV5IHdvbid0IHN1cHBvcnQgZmVhdHVyZXMgbGlrZSBpbm5lckhUTUwuIFRoaXMgaXMgaG93IFBoRVQgdHJlYXRzXG4vLyB0aGVzZSBlbGVtZW50cywgbm90IG5lY2Vzc2FyeSB3aGF0IGlzIGxlZ2FsIGh0bWwuXG5jb25zdCBFTEVNRU5UU19XSVRIT1VUX0NMT1NJTkdfVEFHID0gWyBJTlBVVF9UQUcgXTtcblxuLy8gdmFsaWQgRE9NIGV2ZW50cyB0aGF0IHRoZSBkaXNwbGF5IGFkZHMgbGlzdGVuZXJzIHRvLiBGb3IgYSBsaXN0IG9mIHNjZW5lcnkgZXZlbnRzIHRoYXQgc3VwcG9ydCBwZG9tIGZlYXR1cmVzXG4vLyBzZWUgSW5wdXQuUERPTV9FVkVOVF9UWVBFU1xuLy8gTk9URTogVXBkYXRlIEJyb3dzZXJFdmVudHMgaWYgdGhpcyBpcyBhZGRlZCB0b1xuY29uc3QgRE9NX0VWRU5UUyA9IFsgJ2ZvY3VzaW4nLCAnZm9jdXNvdXQnLCAnaW5wdXQnLCAnY2hhbmdlJywgJ2NsaWNrJywgJ2tleWRvd24nLCAna2V5dXAnIF07XG5cbi8vIERPTSBldmVudHMgdGhhdCBtdXN0IGhhdmUgYmVlbiB0cmlnZ2VyZWQgZnJvbSB1c2VyIGlucHV0IG9mIHNvbWUga2luZCwgYW5kIHdpbGwgdHJpZ2dlciB0aGVcbi8vIERpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyLiBmb2N1cyBhbmQgYmx1ciBldmVudHMgd2lsbCB0cmlnZ2VyIGZyb20gc2NyaXB0aW5nIHNvIHRoZXkgbXVzdCBiZSBleGNsdWRlZC5cbmNvbnN0IFVTRVJfR0VTVFVSRV9FVkVOVFMgPSBbICdpbnB1dCcsICdjaGFuZ2UnLCAnY2xpY2snLCAna2V5ZG93bicsICdrZXl1cCcgXTtcblxuLy8gQSBjb2xsZWN0aW9uIG9mIERPTSBldmVudHMgd2hpY2ggc2hvdWxkIGJlIGJsb2NrZWQgZnJvbSByZWFjaGluZyB0aGUgc2NlbmVyeSBEaXNwbGF5IGRpdlxuLy8gaWYgdGhleSBhcmUgdGFyZ2V0ZWQgYXQgYW4gYW5jZXN0b3Igb2YgdGhlIFBET00uIFNvbWUgc2NyZWVuIHJlYWRlcnMgdHJ5IHRvIHNlbmQgZmFrZVxuLy8gbW91c2UvdG91Y2gvcG9pbnRlciBldmVudHMgdG8gZWxlbWVudHMgYnV0IGZvciB0aGUgcHVycG9zZXMgb2YgQWNjZXNzaWJpbGl0eSB3ZSBvbmx5XG4vLyB3YW50IHRvIHJlc3BvbmQgdG8gRE9NX0VWRU5UUy5cbmNvbnN0IEJMT0NLRURfRE9NX0VWRU5UUyA9IFtcblxuICAvLyB0b3VjaFxuICAndG91Y2hzdGFydCcsXG4gICd0b3VjaGVuZCcsXG4gICd0b3VjaG1vdmUnLFxuICAndG91Y2hjYW5jZWwnLFxuXG4gIC8vIG1vdXNlXG4gICdtb3VzZWRvd24nLFxuICAnbW91c2V1cCcsXG4gICdtb3VzZW1vdmUnLFxuICAnbW91c2VvdmVyJyxcbiAgJ21vdXNlb3V0JyxcblxuICAvLyBwb2ludGVyXG4gICdwb2ludGVyZG93bicsXG4gICdwb2ludGVydXAnLFxuICAncG9pbnRlcm1vdmUnLFxuICAncG9pbnRlcm92ZXInLFxuICAncG9pbnRlcm91dCcsXG4gICdwb2ludGVyY2FuY2VsJyxcbiAgJ2dvdHBvaW50ZXJjYXB0dXJlJyxcbiAgJ2xvc3Rwb2ludGVyY2FwdHVyZSdcbl07XG5cbmNvbnN0IEFSSUFfTEFCRUxMRURCWSA9ICdhcmlhLWxhYmVsbGVkYnknO1xuY29uc3QgQVJJQV9ERVNDUklCRURCWSA9ICdhcmlhLWRlc2NyaWJlZGJ5JztcbmNvbnN0IEFSSUFfQUNUSVZFX0RFU0NFTkRBTlQgPSAnYXJpYS1hY3RpdmVkZXNjZW5kYW50JztcblxuLy8gZGF0YSBhdHRyaWJ1dGUgdG8gZmxhZyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgZm9jdXNhYmxlIC0gY2Fubm90IGNoZWNrIHRhYmluZGV4IGJlY2F1c2UgSUUxMSBhbmQgRWRnZSBhc3NpZ25cbi8vIHRhYkluZGV4PTAgaW50ZXJuYWxseSBmb3IgYWxsIEhUTUwgZWxlbWVudHMsIGluY2x1ZGluZyB0aG9zZSB0aGF0IHNob3VsZCBub3QgcmVjZWl2ZSBmb2N1c1xuY29uc3QgREFUQV9GT0NVU0FCTEUgPSAnZGF0YS1mb2N1c2FibGUnO1xuXG4vLyBkYXRhIGF0dHJpYnV0ZSB3aGljaCBjb250YWlucyB0aGUgdW5pcXVlIElEIG9mIGEgVHJhaWwgdGhhdCBhbGxvd3MgdXMgdG8gZmluZCB0aGUgUERPTVBlZXIgYXNzb2NpYXRlZFxuLy8gd2l0aCBhIHBhcnRpY3VsYXIgRE9NIGVsZW1lbnQuIFRoaXMgaXMgdXNlZCBpbiBzZXZlcmFsIHBsYWNlcyBpbiBzY2VuZXJ5IGFjY2Vzc2liaWxpdHksIG1vc3RseSBQRE9NUGVlciBhbmQgSW5wdXQuXG5jb25zdCBEQVRBX1BET01fVU5JUVVFX0lEID0gJ2RhdGEtdW5pcXVlLWlkJztcblxuLy8ge0FycmF5LjxTdHJpbmc+fSBhdHRyaWJ1dGVzIHRoYXQgcHV0IGFuIElEIG9mIGFub3RoZXIgYXR0cmlidXRlIGFzIHRoZSB2YWx1ZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84MTlcbmNvbnN0IEFTU09DSUFUSU9OX0FUVFJJQlVURVMgPSBbIEFSSUFfTEFCRUxMRURCWSwgQVJJQV9ERVNDUklCRURCWSwgQVJJQV9BQ1RJVkVfREVTQ0VOREFOVCBdO1xuXG4vKipcbiAqIEdldCBhbGwgJ2VsZW1lbnQnIG5vZGVzIG9mZiB0aGUgcGFyZW50IGVsZW1lbnQsIHBsYWNpbmcgdGhlbSBpbiBhbiBhcnJheSBmb3IgZWFzeSB0cmF2ZXJzYWwuICBOb3RlIHRoYXQgdGhpc1xuICogaW5jbHVkZXMgYWxsIGVsZW1lbnRzLCBldmVuIHRob3NlIHRoYXQgYXJlICdoaWRkZW4nIG9yIHB1cmVseSBmb3Igc3RydWN0dXJlLlxuICpcbiAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBkb21FbGVtZW50IC0gcGFyZW50IHdob3NlIGNoaWxkcmVuIHdpbGwgYmUgbGluZWFyaXplZFxuICogQHJldHVybnMge0hUTUxFbGVtZW50W119XG4gKi9cbmZ1bmN0aW9uIGdldExpbmVhckRPTUVsZW1lbnRzKCBkb21FbGVtZW50ICkge1xuXG4gIC8vIGdldHMgQUxMIGRlc2NlbmRhbnQgY2hpbGRyZW4gZm9yIHRoZSBlbGVtZW50XG4gIGNvbnN0IGNoaWxkcmVuID0gZG9tRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJyonICk7XG5cbiAgY29uc3QgbGluZWFyRE9NID0gW107XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuXG4gICAgLy8gc2VhcmNoaW5nIGZvciB0aGUgSFRNTCBlbGVtZW50IG5vZGVzIChOT1QgU2NlbmVyeSBub2RlcylcbiAgICBpZiAoIGNoaWxkcmVuWyBpIF0ubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICkge1xuICAgICAgbGluZWFyRE9NWyBpIF0gPSAoIGNoaWxkcmVuWyBpIF0gKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGxpbmVhckRPTTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYW4gZWxlbWVudCBpcyBoaWRkZW4uICBBbiBlbGVtZW50IGlzIGNvbnNpZGVyZWQgJ2hpZGRlbicgaWYgaXQgKG9yIGFueSBvZiBpdHMgYW5jZXN0b3JzKSBoYXMgdGhlXG4gKiAnaGlkZGVuJyBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZG9tRWxlbWVudFxuICogQHJldHVybnMge0Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRWxlbWVudEhpZGRlbiggZG9tRWxlbWVudCApIHtcbiAgaWYgKCBkb21FbGVtZW50LmhpZGRlbiApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBlbHNlIGlmICggZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQuYm9keSApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGlzRWxlbWVudEhpZGRlbiggZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50ICk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIG5leHQgb3IgcHJldmlvdXMgZm9jdXNhYmxlIGVsZW1lbnQgaW4gdGhlIHBhcmFsbGVsIERPTSB1bmRlciB0aGUgcGFyZW50IGVsZW1lbnQgYW5kIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50bHlcbiAqIGZvY3VzZWQgZWxlbWVudC4gVXNlZnVsIGlmIHlvdSBuZWVkIHRvIHNldCBmb2N1cyBkeW5hbWljYWxseSBvciBuZWVkIHRvIHByZXZlbnQgZGVmYXVsdCBiZWhhdmlvclxuICogd2hlbiBmb2N1cyBjaGFuZ2VzLiBJZiBubyBuZXh0IG9yIHByZXZpb3VzIGZvY3VzYWJsZSBpcyBmb3VuZCwgaXQgcmV0dXJucyB0aGUgY3VycmVudGx5IGZvY3VzZWQgZWxlbWVudC5cbiAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5LCB1c2UgZ2V0TmV4dEZvY3VzYWJsZSgpIG9yIGdldFByZXZpb3VzRm9jdXNhYmxlKCkgaW5zdGVhZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uIC0gZGlyZWN0aW9uIG9mIHRyYXZlcnNhbCwgb25lIG9mICdORVhUJyB8ICdQUkVWSU9VUydcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtwYXJlbnRFbGVtZW50XSAtIG9wdGlvbmFsLCBzZWFyY2ggd2lsbCBiZSBsaW1pdGVkIHRvIGNoaWxkcmVuIG9mIHRoaXMgZWxlbWVudFxuICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICovXG5mdW5jdGlvbiBnZXROZXh0UHJldmlvdXNGb2N1c2FibGUoIGRpcmVjdGlvbiwgcGFyZW50RWxlbWVudCApIHtcblxuICAvLyBsaW5lYXJpemUgdGhlIGRvY3VtZW50IFtvciB0aGUgZGVzaXJlZCBwYXJlbnRdIGZvciB0cmF2ZXJzYWxcbiAgY29uc3QgcGFyZW50ID0gcGFyZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuICBjb25zdCBsaW5lYXJET00gPSBnZXRMaW5lYXJET01FbGVtZW50cyggcGFyZW50ICk7XG5cbiAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIGNvbnN0IGFjdGl2ZUluZGV4ID0gbGluZWFyRE9NLmluZGV4T2YoIGFjdGl2ZUVsZW1lbnQgKTtcbiAgY29uc3QgZGVsdGEgPSBkaXJlY3Rpb24gPT09IE5FWFQgPyArMSA6IC0xO1xuXG4gIC8vIGZpbmQgdGhlIG5leHQgZm9jdXNhYmxlIGVsZW1lbnQgaW4gdGhlIERPTVxuICBsZXQgbmV4dEluZGV4ID0gYWN0aXZlSW5kZXggKyBkZWx0YTtcbiAgd2hpbGUgKCBuZXh0SW5kZXggPCBsaW5lYXJET00ubGVuZ3RoICYmIG5leHRJbmRleCA+PSAwICkge1xuICAgIGNvbnN0IG5leHRFbGVtZW50ID0gbGluZWFyRE9NWyBuZXh0SW5kZXggXTtcbiAgICBuZXh0SW5kZXggKz0gZGVsdGE7XG5cbiAgICBpZiAoIFBET01VdGlscy5pc0VsZW1lbnRGb2N1c2FibGUoIG5leHRFbGVtZW50ICkgKSB7XG4gICAgICByZXR1cm4gbmV4dEVsZW1lbnQ7XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgbm8gbmV4dCBmb2N1c2FibGUgaXMgZm91bmQsIHJldHVybiB0aGUgYWN0aXZlIERPTSBlbGVtZW50XG4gIHJldHVybiBhY3RpdmVFbGVtZW50O1xufVxuXG4vKipcbiAqIFRyaW1zIHRoZSB3aGl0ZSBzcGFjZSBmcm9tIHRoZSBsZWZ0IG9mIHRoZSBzdHJpbmcuXG4gKiBTb2x1dGlvbiBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1OTM4NTkvbGVmdC10cmltLWluLWphdmFzY3JpcHRcbiAqIEBwYXJhbSAge3N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiB0cmltTGVmdCggc3RyaW5nICkge1xuXG4gIC8vIF4gLSBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuICAvLyBcXHMgLSB3aGl0ZXNwYWNlIGNoYXJhY3RlclxuICAvLyArIC0gZ3JlZWR5XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZSggL15cXHMrLywgJycgKTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHRhZ05hbWUgc3VwcG9ydHMgaW5uZXJIVE1MIG9yIHRleHRDb250ZW50IGluIFBoRVQuXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHRhZ05hbWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiB0YWdOYW1lU3VwcG9ydHNDb250ZW50KCB0YWdOYW1lICkge1xuICByZXR1cm4gIV8uaW5jbHVkZXMoIEVMRU1FTlRTX1dJVEhPVVRfQ0xPU0lOR19UQUcsIHRhZ05hbWUudG9VcHBlckNhc2UoKSApO1xufVxuXG5jb25zdCBQRE9NVXRpbHMgPSB7XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgUHJvcGVydHkgb3Igc3RyaW5nLCByZXR1cm4gdGhlIFByb3Blcmd5IHZhbHVlIGlmIGl0IGlzIGEgcHJvcGVydHkuIE90aGVyd2lzZSBqdXN0IHJldHVybiB0aGUgc3RyaW5nLlxuICAgKiBVc2VmdWwgZm9yIGZvcndhcmRpbmcgdGhlIHN0cmluZyB0byBET00gY29udGVudCwgYnV0IGFsbG93aW5nIHRoZSBBUEkgdG8gdGFrZSBhIFN0cmluZ1Byb3BlcnR5LiBFdmVudHVhbGx5XG4gICAqIFBET00gbWF5IHN1cHBvcnQgZHluYW1pYyBzdHJpbmdzLlxuICAgKiBAcGFyYW0gdmFsdWVPclByb3BlcnR5XG4gICAqIEByZXR1cm5zIHtzdHJpbmd8UHJvcGVydHl9XG4gICAqL1xuICB1bndyYXBTdHJpbmdQcm9wZXJ0eSggdmFsdWVPclByb3BlcnR5ICkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHZhbHVlT3JQcm9wZXJ0eSA9PT0gbnVsbCA/IG51bGwgOiAoIHR5cGVvZiB2YWx1ZU9yUHJvcGVydHkgPT09ICdzdHJpbmcnID8gdmFsdWVPclByb3BlcnR5IDogdmFsdWVPclByb3BlcnR5LnZhbHVlICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycgKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbmV4dCBmb2N1c2FibGUgZWxlbWVudCByZWxhdGl2ZSB0byB0aGUgY3VycmVudGx5IGZvY3VzZWQgZWxlbWVudCBhbmQgdW5kZXIgdGhlIHBhcmVudEVsZW1lbnQuXG4gICAqIENhbiBiZSB1c2VmdWwgaWYgeW91IHdhbnQgdG8gZW11bGF0ZSB0aGUgJ1RhYicga2V5IGJlaGF2aW9yIG9yIGp1c3QgdHJhbnNpdGlvbiBmb2N1cyB0byB0aGUgbmV4dCBlbGVtZW50XG4gICAqIGluIHRoZSBkb2N1bWVudC4gSWYgbm8gbmV4dCBmb2N1c2FibGUgY2FuIGJlIGZvdW5kLCBpdCB3aWxsIHJldHVybiB0aGUgY3VycmVudGx5IGZvY3VzZWQgZWxlbWVudC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbcGFyZW50RWxlbWVudF0gLSBvcHRpb25hbCwgc2VhcmNoIHdpbGwgYmUgbGltaXRlZCB0byBlbGVtZW50cyB1bmRlciB0aGlzIGVsZW1lbnRcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICAgKi9cbiAgZ2V0TmV4dEZvY3VzYWJsZSggcGFyZW50RWxlbWVudCApIHtcbiAgICByZXR1cm4gZ2V0TmV4dFByZXZpb3VzRm9jdXNhYmxlKCBORVhULCBwYXJlbnRFbGVtZW50ICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcHJldmlvdXMgZm9jdXNhYmxlIGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnRseSBmb2N1c2VkIGVsZW1lbnQgdW5kZXIgdGhlIHBhcmVudEVsZW1lbnQuIENhbiBiZVxuICAgKiB1c2VmdWwgaWYgeW91IHdhbnQgdG8gZW11bGF0ZSAnU2hpZnQrVGFiJyBiZWhhdmlvci4gSWYgbm8gbmV4dCBmb2N1c2FibGUgY2FuIGJlIGZvdW5kLCBpdCB3aWxsIHJldHVybiB0aGVcbiAgICogY3VycmVudGx5IGZvY3VzZWQgZWxlbWVudC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbcGFyZW50RWxlbWVudF0gLSBvcHRpb25hbCwgc2VhcmNoIHdpbGwgYmUgbGltaXRlZCB0byBlbGVtZW50cyB1bmRlciB0aGlzIHBhcmVudFxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gICAqL1xuICBnZXRQcmV2aW91c0ZvY3VzYWJsZSggcGFyZW50RWxlbWVudCApIHtcbiAgICByZXR1cm4gZ2V0TmV4dFByZXZpb3VzRm9jdXNhYmxlKCBQUkVWSU9VUywgcGFyZW50RWxlbWVudCApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50IHVuZGVyIHRoZSBwYXJlbnRFbGVtZW50LiBJZiBubyBlbGVtZW50IGlzIGF2YWlsYWJsZSwgdGhlIGRvY3VtZW50LmJvZHkgaXNcbiAgICogcmV0dXJuZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtwYXJlbnRFbGVtZW50XSAtIG9wdGlvbmFsbHkgcmVzdHJpY3QgdGhlIHNlYXJjaCB0byBlbGVtZW50cyB1bmRlciB0aGlzIHBhcmVudFxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gICAqL1xuICBnZXRGaXJzdEZvY3VzYWJsZSggcGFyZW50RWxlbWVudCApIHtcbiAgICBjb25zdCBwYXJlbnQgPSBwYXJlbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG4gICAgY29uc3QgbGluZWFyRE9NID0gZ2V0TGluZWFyRE9NRWxlbWVudHMoIHBhcmVudCApO1xuXG4gICAgLy8gcmV0dXJuIHRoZSBkb2N1bWVudC5ib2R5IGlmIG5vIGVsZW1lbnQgaXMgZm91bmRcbiAgICBsZXQgZmlyc3RGb2N1c2FibGUgPSBkb2N1bWVudC5ib2R5O1xuXG4gICAgbGV0IG5leHRJbmRleCA9IDA7XG4gICAgd2hpbGUgKCBuZXh0SW5kZXggPCBsaW5lYXJET00ubGVuZ3RoICkge1xuICAgICAgY29uc3QgbmV4dEVsZW1lbnQgPSBsaW5lYXJET01bIG5leHRJbmRleCBdO1xuICAgICAgbmV4dEluZGV4Kys7XG5cbiAgICAgIGlmICggUERPTVV0aWxzLmlzRWxlbWVudEZvY3VzYWJsZSggbmV4dEVsZW1lbnQgKSApIHtcbiAgICAgICAgZmlyc3RGb2N1c2FibGUgPSBuZXh0RWxlbWVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpcnN0Rm9jdXNhYmxlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSByYW5kb20gZm9jdXNhYmxlIGVsZW1lbnQgaW4gdGhlIGRvY3VtZW50LiBQYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBmdXp6IHRlc3RpbmcuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcm1hIHtSYW5kb219IHJhbmRvbVxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gICAqL1xuICBnZXRSYW5kb21Gb2N1c2FibGUoIHJhbmRvbSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByYW5kb20sICdSYW5kb20gZXhwZWN0ZWQnICk7XG5cbiAgICBjb25zdCBsaW5lYXJET00gPSBnZXRMaW5lYXJET01FbGVtZW50cyggZG9jdW1lbnQuYm9keSApO1xuICAgIGNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gW107XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGluZWFyRE9NLmxlbmd0aDsgaSsrICkge1xuICAgICAgUERPTVV0aWxzLmlzRWxlbWVudEZvY3VzYWJsZSggbGluZWFyRE9NWyBpIF0gKSAmJiBmb2N1c2FibGVFbGVtZW50cy5wdXNoKCBsaW5lYXJET01bIGkgXSApO1xuICAgIH1cblxuICAgIHJldHVybiBmb2N1c2FibGVFbGVtZW50c1sgcmFuZG9tLm5leHRJbnQoIGZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCApIF07XG4gIH0sXG5cbiAgLyoqXG4gICAqIFBhcmFsbGVsRE9NIHRyYWl0IHZhbHVlcyBtYXkgYmUgaW4gYSBQcm9wZXJ0eSB0byBzdXBwb3J0IGR5bmFtaWMgbG9jYWxlcy4gVGhpcyBmdW5jdGlvblxuICAgKiByZXR1cm5zIHRoZSBQcm9wZXJ0eSB2YWx1ZSBpbiB0aGF0IGNhc2UuIFRoZSB2YWx1ZSBtYXkgYmUgYSBzdHJpbmcsIGJvb2xlYW4sIG9yIG51bWJlciAtXG4gICAqIGFsbCBvZiB3aGljaCBhcmUgdmFsaWQgdmFsdWVzIGZvciBuYXRpdmUgSFRNTCBhdHRyaWJ1dGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IGJvb2xlYW4gfCBudW1iZXIgfCBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmd8Ym9vbGVhbnxudW1iZXI+fSB2YWx1ZU9yUHJvcGVydHlcbiAgICogQHJldHVybnMge3N0cmluZ3xib29sZWFufG51bWJlcn1cbiAgICovXG4gIHVud3JhcFByb3BlcnR5KCB2YWx1ZU9yUHJvcGVydHkgKSB7XG4gICAgcmV0dXJuIGlzVFJlYWRPbmx5UHJvcGVydHkoIHZhbHVlT3JQcm9wZXJ0eSApID8gdmFsdWVPclByb3BlcnR5LnZhbHVlIDogdmFsdWVPclByb3BlcnR5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBJZiB0aGUgdGV4dENvbnRlbnQgaGFzIGFueSB0YWdzIHRoYXQgYXJlIG5vdCBmb3JtYXR0aW5nIHRhZ3MsIHJldHVybiBmYWxzZS4gT25seSBjaGVja2luZyBmb3JcbiAgICogdGFncyB0aGF0IGFyZSBub3QgaW4gdGhlIGFsbG93ZWQgRk9STUFUVElOR19UQUdTLiBJZiB0aGVyZSBhcmUgbm8gdGFncyBhdCBhbGwsIHJldHVybiBmYWxzZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dENvbnRlbnRcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBjb250YWluc0Zvcm1hdHRpbmdUYWdzKCB0ZXh0Q29udGVudCApIHtcblxuICAgIC8vIG5vLW9wIGZvciBudWxsIGNhc2VcbiAgICBpZiAoIHRleHRDb250ZW50ID09PSBudWxsICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGV4dENvbnRlbnQgPT09ICdzdHJpbmcnLCAndW5zdXBwb3J0ZWQgdHlwZSBmb3IgdGV4dENvbnRlbnQuJyApO1xuXG4gICAgbGV0IGkgPSAwO1xuICAgIGNvbnN0IG9wZW5JbmRpY2VzID0gW107XG4gICAgY29uc3QgY2xvc2VJbmRpY2VzID0gW107XG5cbiAgICAvLyBmaW5kIG9wZW4vY2xvc2UgdGFnIHBhaXJzIGluIHRoZSB0ZXh0IGNvbnRlbnRcbiAgICB3aGlsZSAoIGkgPCB0ZXh0Q29udGVudC5sZW5ndGggKSB7XG4gICAgICBjb25zdCBvcGVuSW5kZXggPSB0ZXh0Q29udGVudC5pbmRleE9mKCAnPCcsIGkgKTtcbiAgICAgIGNvbnN0IGNsb3NlSW5kZXggPSB0ZXh0Q29udGVudC5pbmRleE9mKCAnPicsIGkgKTtcblxuICAgICAgaWYgKCBvcGVuSW5kZXggPiAtMSApIHtcbiAgICAgICAgb3BlbkluZGljZXMucHVzaCggb3BlbkluZGV4ICk7XG4gICAgICAgIGkgPSBvcGVuSW5kZXggKyAxO1xuICAgICAgfVxuICAgICAgaWYgKCBjbG9zZUluZGV4ID4gLTEgKSB7XG4gICAgICAgIGNsb3NlSW5kaWNlcy5wdXNoKCBjbG9zZUluZGV4ICk7XG4gICAgICAgIGkgPSBjbG9zZUluZGV4ICsgMTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbWFsZm9ybWVkIHRhZ3Mgb3Igbm8gdGFncyBhdCBhbGwsIHJldHVybiBmYWxzZSBpbW1lZGlhdGVseVxuICAgIGlmICggb3BlbkluZGljZXMubGVuZ3RoICE9PSBjbG9zZUluZGljZXMubGVuZ3RoIHx8IG9wZW5JbmRpY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayB0aGUgbmFtZSBpbiBiZXR3ZWVuIHRoZSBvcGVuIGFuZCBjbG9zZSBicmFja2V0cyAtIGlmIGFueXRoaW5nIG90aGVyIHRoYW4gZm9ybWF0dGluZyB0YWdzLCByZXR1cm4gZmFsc2VcbiAgICBsZXQgb25seUZvcm1hdHRpbmcgPSB0cnVlO1xuICAgIGNvbnN0IHVwcGVyQ2FzZUNvbnRlbnQgPSB0ZXh0Q29udGVudC50b1VwcGVyQ2FzZSgpO1xuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IG9wZW5JbmRpY2VzLmxlbmd0aDsgaisrICkge1xuXG4gICAgICAvLyBnZXQgdGhlIG5hbWUgYW5kIHJlbW92ZSB0aGUgY2xvc2luZyBzbGFzaFxuICAgICAgbGV0IHN1YlN0cmluZyA9IHVwcGVyQ2FzZUNvbnRlbnQuc3Vic3RyaW5nKCBvcGVuSW5kaWNlc1sgaiBdICsgMSwgY2xvc2VJbmRpY2VzWyBqIF0gKTtcbiAgICAgIHN1YlN0cmluZyA9IHN1YlN0cmluZy5yZXBsYWNlKCAnLycsICcnICk7XG5cbiAgICAgIC8vIGlmIHRoZSBsZWZ0IG9mIHRoZSBzdWJzdHJpbmcgY29udGFpbnMgc3BhY2UsIGl0IGlzIG5vdCBhIHZhbGlkIHRhZyBzbyBhbGxvd1xuICAgICAgY29uc3QgdHJpbW1lZCA9IHRyaW1MZWZ0KCBzdWJTdHJpbmcgKTtcbiAgICAgIGlmICggc3ViU3RyaW5nLmxlbmd0aCAtIHRyaW1tZWQubGVuZ3RoID4gMCApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICggIV8uaW5jbHVkZXMoIEZPUk1BVFRJTkdfVEFHUywgc3ViU3RyaW5nICkgKSB7XG4gICAgICAgIG9ubHlGb3JtYXR0aW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9ubHlGb3JtYXR0aW5nO1xuICB9LFxuXG4gIC8qKlxuICAgKiBJZiB0aGUgdGV4dCBjb250ZW50IHVzZXMgZm9ybWF0dGluZyB0YWdzLCBzZXQgdGhlIGNvbnRlbnQgYXMgaW5uZXJIVE1MLiBPdGhlcndpc2UsIHNldCBhcyB0ZXh0Q29udGVudC5cbiAgICogSW4gZ2VuZXJhbCwgdGV4dENvbnRlbnQgaXMgbW9yZSBzZWN1cmUgYW5kIG11Y2ggZmFzdGVyIGJlY2F1c2UgaXQgZG9lc24ndCB0cmlnZ2VyIERPTSBzdHlsaW5nIGFuZFxuICAgKiBlbGVtZW50IGluc2VydGlvbnMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtFbGVtZW50fSBkb21FbGVtZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcnxudWxsfSB0ZXh0Q29udGVudCAtIGRvbUVsZW1lbnQgaXMgY2xlYXJlZCBvZiBjb250ZW50IGlmIG51bGwsIGNvdWxkIGhhdmUgYWNjZXB0YWJsZSBIVE1MXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmb3JtYXR0aW5nXCIgdGFncyBpbiBpdFxuICAgKi9cbiAgc2V0VGV4dENvbnRlbnQoIGRvbUVsZW1lbnQsIHRleHRDb250ZW50ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbUVsZW1lbnQgaW5zdGFuY2VvZiBFbGVtZW50ICk7IC8vIHBhcmVudCB0byBIVE1MRWxlbWVudCwgdG8gc3VwcG9ydCBvdGhlciBuYW1lc3BhY2VzXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGV4dENvbnRlbnQgPT09IG51bGwgfHwgdHlwZW9mIHRleHRDb250ZW50ID09PSAnc3RyaW5nJyApO1xuXG4gICAgaWYgKCB0ZXh0Q29udGVudCA9PT0gbnVsbCApIHtcbiAgICAgIGRvbUVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBYSFRNTCByZXF1aXJlcyA8YnIvPiBpbnN0ZWFkIG9mIDxicj4sIGJ1dCA8YnIvPiBpcyBzdGlsbCB2YWxpZCBpbiBIVE1MLiBTZWVcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMzA5XG4gICAgICBjb25zdCB0ZXh0V2l0aG91dEJyZWFrcyA9IHRleHRDb250ZW50LnJlcGxhY2VBbGwoICc8YnI+JywgJzxici8+JyApO1xuXG4gICAgICAvLyBUT0RPOiB0aGlzIGxpbmUgbXVzdCBiZSByZW1vdmVkIHRvIHN1cHBvcnQgaTE4biBJbnRlcmFjdGl2ZSBEZXNjcmlwdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy83OThcbiAgICAgIGNvbnN0IHRleHRXaXRob3V0RW1iZWRkaW5nTWFya3MgPSBzdHJpcEVtYmVkZGluZ01hcmtzKCB0ZXh0V2l0aG91dEJyZWFrcyApO1xuXG4gICAgICAvLyBEaXNhbGxvdyBhbnkgdW5maWxsZWQgdGVtcGxhdGUgdmFyaWFibGVzIHRvIGJlIHNldCBpbiB0aGUgUERPTS5cbiAgICAgIHZhbGlkYXRlKCB0ZXh0V2l0aG91dEVtYmVkZGluZ01hcmtzLCBWYWxpZGF0aW9uLlNUUklOR19XSVRIT1VUX1RFTVBMQVRFX1ZBUlNfVkFMSURBVE9SICk7XG5cbiAgICAgIGlmICggdGFnTmFtZVN1cHBvcnRzQ29udGVudCggZG9tRWxlbWVudC50YWdOYW1lICkgKSB7XG5cbiAgICAgICAgLy8gb25seSByZXR1cm5zIHRydWUgaWYgY29udGVudCBjb250YWlucyBsaXN0ZWQgZm9ybWF0dGluZyB0YWdzXG4gICAgICAgIGlmICggUERPTVV0aWxzLmNvbnRhaW5zRm9ybWF0dGluZ1RhZ3MoIHRleHRXaXRob3V0RW1iZWRkaW5nTWFya3MgKSApIHtcbiAgICAgICAgICBkb21FbGVtZW50LmlubmVySFRNTCA9IHRleHRXaXRob3V0RW1iZWRkaW5nTWFya3M7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZG9tRWxlbWVudC50ZXh0Q29udGVudCA9IHRleHRXaXRob3V0RW1iZWRkaW5nTWFya3M7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgdGFnTmFtZSwgdGVzdCBpZiB0aGUgZWxlbWVudCB3aWxsIGJlIGZvY3VhYmxlIGJ5IGRlZmF1bHQgYnkgdGhlIGJyb3dzZXIuXG4gICAqIERpZmZlcmVudCBmcm9tIGlzRWxlbWVudEZvY3VzYWJsZSwgYmVjYXVzZSB0aGlzIG9ubHkgbG9va3MgYXQgdGFncyB0aGF0IHRoZSBicm93c2VyIHdpbGwgYXV0b21hdGljYWxseSBwdXRcbiAgICogYSA+PTAgdGFiIGluZGV4IG9uLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIE5PVEU6IFVzZXMgYSBzZXQgb2YgYnJvd3NlciB0eXBlcyBhcyB0aGUgZGVmaW5pdGlvbiBvZiBkZWZhdWx0IGZvY3VzYWJsZSBlbGVtZW50cyxcbiAgICogc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1OTk2NjAvd2hpY2gtaHRtbC1lbGVtZW50cy1jYW4tcmVjZWl2ZS1mb2N1c1xuICAgKlxuICAgKiBAcGFyYW0gdGFnTmFtZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIHRhZ0lzRGVmYXVsdEZvY3VzYWJsZSggdGFnTmFtZSApIHtcbiAgICByZXR1cm4gXy5pbmNsdWRlcyggREVGQVVMVF9GT0NVU0FCTEVfVEFHUywgdGFnTmFtZS50b1VwcGVyQ2FzZSgpICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCBpcyBmb2N1c2FibGUuIEFzc3VtZXMgdGhhdCBhbGwgZm9jdXNhYmxlICBlbGVtZW50cyBoYXZlIHRhYkluZGV4ID49IDAsIHdoaWNoXG4gICAqIGlzIG9ubHkgdHJ1ZSBmb3IgZWxlbWVudHMgb2YgdGhlIFBhcmFsbGVsIERPTS5cbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZG9tRWxlbWVudFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRWxlbWVudEZvY3VzYWJsZSggZG9tRWxlbWVudCApIHtcblxuICAgIGlmICggIWRvY3VtZW50LmJvZHkuY29udGFpbnMoIGRvbUVsZW1lbnQgKSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBjb250aW51ZSB0byBuZXh0IGVsZW1lbnQgaWYgdGhpcyBvbmUgaXMgbWVhbnQgdG8gYmUgaGlkZGVuXG4gICAgaWYgKCBpc0VsZW1lbnRIaWRkZW4oIGRvbUVsZW1lbnQgKSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBpZiBlbGVtZW50IGlzIGZvciBmb3JtYXR0aW5nLCBza2lwZSBvdmVyIGl0IC0gcmVxdWlyZWQgc2luY2UgSUUgZ2l2ZXMgdGhlc2UgdGFiaW5kZXg9XCIwXCJcbiAgICBpZiAoIF8uaW5jbHVkZXMoIEZPUk1BVFRJTkdfVEFHUywgZG9tRWxlbWVudC50YWdOYW1lICkgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvbUVsZW1lbnQuZ2V0QXR0cmlidXRlKCBEQVRBX0ZPQ1VTQUJMRSApID09PSAndHJ1ZSc7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZ05hbWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gdHJ1ZSBpZiB0aGUgdGFnIGRvZXMgc3VwcG9ydCBpbm5lciBjb250ZW50XG4gICAqL1xuICB0YWdOYW1lU3VwcG9ydHNDb250ZW50KCB0YWdOYW1lICkge1xuICAgIHJldHVybiB0YWdOYW1lU3VwcG9ydHNDb250ZW50KCB0YWdOYW1lICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byByZW1vdmUgbXVsdGlwbGUgSFRNTEVsZW1lbnRzIGZyb20gYW5vdGhlciBIVE1MRWxlbWVudFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtBcnJheS48SFRNTEVsZW1lbnQ+fSBjaGlsZHJlblRvUmVtb3ZlXG4gICAqL1xuICByZW1vdmVFbGVtZW50cyggZWxlbWVudCwgY2hpbGRyZW5Ub1JlbW92ZSApIHtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkcmVuVG9SZW1vdmUubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBjaGlsZFRvUmVtb3ZlID0gY2hpbGRyZW5Ub1JlbW92ZVsgaSBdO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbGVtZW50LmNvbnRhaW5zKCBjaGlsZFRvUmVtb3ZlICksICdlbGVtZW50IGRvZXMgbm90IGNvbnRhaW4gY2hpbGQgdG8gYmUgcmVtb3ZlZDogJywgY2hpbGRUb1JlbW92ZSApO1xuXG4gICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKCBjaGlsZFRvUmVtb3ZlICk7XG4gICAgfVxuXG4gIH0sXG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byBhZGQgbXVsdGlwbGUgZWxlbWVudHMgYXMgY2hpbGRyZW4gdG8gYSBwYXJlbnRcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gdG8gYWRkIGNoaWxkcmVuIHRvXG4gICAqIEBwYXJhbSB7QXJyYXkuPEhUTUxFbGVtZW50Pn0gY2hpbGRyZW5Ub0FkZFxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbYmVmb3JlVGhpc0VsZW1lbnRdIC0gaWYgbm90IHN1cHBsaWVkLCB0aGUgaW5zZXJ0QmVmb3JlIGNhbGwgd2lsbCBqdXN0IHVzZSAnbnVsbCdcbiAgICovXG4gIGluc2VydEVsZW1lbnRzKCBlbGVtZW50LCBjaGlsZHJlblRvQWRkLCBiZWZvcmVUaGlzRWxlbWVudCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbGVtZW50IGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBjaGlsZHJlblRvQWRkICkgKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZHJlblRvQWRkLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY2hpbGRUb0FkZCA9IGNoaWxkcmVuVG9BZGRbIGkgXTtcbiAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKCBjaGlsZFRvQWRkLCBiZWZvcmVUaGlzRWxlbWVudCB8fCBudWxsICk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gSFRNTCBlbGVtZW50LiAgVW5sZXNzIHRoaXMgaXMgYSBmb3JtIGVsZW1lbnQgb3IgZXhwbGljaXRseSBtYXJrZWQgYXMgZm9jdXNhYmxlLCBhZGQgYSBuZWdhdGl2ZVxuICAgKiB0YWIgaW5kZXguIElFIGdpdmVzIGFsbCBlbGVtZW50cyBhIHRhYkluZGV4IG9mIDAgYW5kIGhhbmRsZXMgdGFiIG5hdmlnYXRpb24gaW50ZXJuYWxseSwgc28gdGhpcyBtYXJrc1xuICAgKiB3aGljaCBlbGVtZW50cyBzaG91bGQgbm90IGJlIGluIHRoZSBmb2N1cyBvcmRlci5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRhZ05hbWVcbiAgICogQHBhcmFtIHtib29sZWFufSBmb2N1c2FibGUgLSBzaG91bGQgdGhlIGVsZW1lbnQgYmUgZXhwbGljaXRseSBhZGRlZCB0byB0aGUgZm9jdXMgb3JkZXI/XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICAgKi9cbiAgY3JlYXRlRWxlbWVudCggdGFnTmFtZSwgZm9jdXNhYmxlLCBvcHRpb25zICkge1xuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgLy8ge3N0cmluZ3xudWxsfSAtIElmIG5vbi1udWxsLCB0aGUgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWMgbmFtZXNwYWNlXG4gICAgICBuYW1lc3BhY2U6IG51bGwsXG5cbiAgICAgIC8vIHtzdHJpbmd8bnVsbH0gLSBBIHN0cmluZyBpZCB0aGF0IHVuaXF1ZWx5IHJlcHJlc2VudHMgdGhpcyBlbGVtZW50IGluIHRoZSBET00sIG11c3QgYmUgY29tcGxldGVseVxuICAgICAgLy8gdW5pcXVlIGluIHRoZSBET00uXG4gICAgICBpZDogbnVsbFxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIGNvbnN0IGRvbUVsZW1lbnQgPSBvcHRpb25zLm5hbWVzcGFjZVxuICAgICAgICAgICAgICAgICAgICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggb3B0aW9ucy5uYW1lc3BhY2UsIHRhZ05hbWUgKVxuICAgICAgICAgICAgICAgICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIHRhZ05hbWUgKTtcblxuICAgIGlmICggb3B0aW9ucy5pZCApIHtcbiAgICAgIGRvbUVsZW1lbnQuaWQgPSBvcHRpb25zLmlkO1xuICAgIH1cblxuICAgIC8vIHNldCB0YWIgaW5kZXggaWYgd2UgYXJlIG92ZXJyaWRpbmcgZGVmYXVsdCBicm93c2VyIGJlaGF2aW9yXG4gICAgUERPTVV0aWxzLm92ZXJyaWRlRm9jdXNXaXRoVGFiSW5kZXgoIGRvbUVsZW1lbnQsIGZvY3VzYWJsZSApO1xuXG4gICAgLy8gZ2l2ZXMgdGhpcyBlbGVtZW50IHN0eWxpbmcgZnJvbSBTY2VuZXJ5U3R5bGVcbiAgICBkb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoIFBET01TaWJsaW5nU3R5bGUuU0lCTElOR19DTEFTU19OQU1FICk7XG5cbiAgICByZXR1cm4gZG9tRWxlbWVudDtcbiAgfSxcblxuICAvKipcbiAgICogQWRkIGEgdGFiIGluZGV4IHRvIGFuIGVsZW1lbnQgd2hlbiBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGZvY3VzIGJlaGF2aW9yIGZvciB0aGUgZWxlbWVudC4gQWRkaW5nIHRhYmluZGV4XG4gICAqIHRvIGFuIGVsZW1lbnQgY2FuIG9ubHkgYmUgZG9uZSB3aGVuIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvciBiZWNhdXNlIHRhYmluZGV4IGludGVyZmVyZXMgd2l0aFxuICAgKiB0aGUgd2F5IEpBV1MgcmVhZHMgdGhyb3VnaCBjb250ZW50IG9uIENocm9tZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84OTNcbiAgICpcbiAgICogSWYgZGVmYXVsdCBiZWhhdmlvciBhbmQgZm9jdXNhYmxlIGFsaWduLCB0aGUgdGFiaW5kZXggYXR0cmlidXRlIGlzIHJlbW92ZWQgc28gdGhhdCBjYW4ndCBpbnRlcmZlcmUgd2l0aCBhXG4gICAqIHNjcmVlbiByZWFkZXIuXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtib29sZWFufSBmb2N1c2FibGVcbiAgICovXG4gIG92ZXJyaWRlRm9jdXNXaXRoVGFiSW5kZXgoIGVsZW1lbnQsIGZvY3VzYWJsZSApIHtcbiAgICBjb25zdCBkZWZhdWx0Rm9jdXNhYmxlID0gUERPTVV0aWxzLnRhZ0lzRGVmYXVsdEZvY3VzYWJsZSggZWxlbWVudC50YWdOYW1lICk7XG5cbiAgICAvLyBvbmx5IGFkZCBhIHRhYmluZGV4IHdoZW4gd2UgYXJlIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgZm9jdXNhYmxlIGJhaHZpb3Igb2YgdGhlIGJyb3dzZXIgZm9yIHRoZSB0YWcgbmFtZVxuICAgIGlmICggZGVmYXVsdEZvY3VzYWJsZSAhPT0gZm9jdXNhYmxlICkge1xuICAgICAgZWxlbWVudC50YWJJbmRleCA9IGZvY3VzYWJsZSA/IDAgOiAtMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSggJ3RhYmluZGV4JyApO1xuICAgIH1cblxuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCBEQVRBX0ZPQ1VTQUJMRSwgZm9jdXNhYmxlICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgTm9kZSwgc2VhcmNoIGZvciBhIHN0cmluZ1Byb3BlcnR5IGluIHRoZSBOb2RlIG9yIGl0cyBjaGlsZHJlbiwgcmVjdXJzaXZlbHkuIFRoaXNcbiAgICogaXMgdXNlZnVsIGZvciBmaW5kaW5nIGEgc3RyaW5nIHRvIHNldCBhcyBQYXJhbGxlbERPTSBjb250ZW50LlxuICAgKlxuICAgKiBUaGlzIHVzZXMgYSBkZXB0aCBmaXJzdCBzZWFyY2ggdG8gZmluZCB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgVGV4dCBvciBSaWNoVGV4dCB1bmRlciB0aGUgTm9kZS5cbiAgICogSXQgd29uJ3QgbmVjZXNzYXJpbHkgYmUgdGhlIGNsb3Nlc3QgdG8gdGhlIHJvb3Qgb2YgdGhlIE5vZGUgb3IgbW9zdCBcInByb21pbmVudFwiIFRleHQvUmljaFRleHRcbiAgICogaWYgdGhlcmUgYXJlIG11bHRpcGxlIFRleHQvUmljaFRleHQgbm9kZXMuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge1RSZWFkT25seVByb3BlcnR5PHN0cmluZz58bnVsbH1cbiAgICovXG4gIGZpbmRTdHJpbmdQcm9wZXJ0eSggbm9kZSApIHtcblxuICAgIC8vIENoZWNrIGlmIHRoZSBub2RlIGlzIGFuIGluc3RhbmNlIG9mIFRleHQgb3IgUmljaFRleHQgYW5kIHJldHVybiB0aGUgc3RyaW5nUHJvcGVydHlcbiAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBUZXh0IHx8IG5vZGUgaW5zdGFuY2VvZiBSaWNoVGV4dCApIHtcbiAgICAgIHJldHVybiBub2RlLnN0cmluZ1Byb3BlcnR5O1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBub2RlIGhhcyBjaGlsZHJlbiwgaXRlcmF0ZSBvdmVyIHRoZW0gcmVjdXJzaXZlbHlcbiAgICBpZiAoIG5vZGUuY2hpbGRyZW4gKSB7XG4gICAgICBmb3IgKCBjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuICkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gUERPTVV0aWxzLmZpbmRTdHJpbmdQcm9wZXJ0eSggY2hpbGQgKTtcbiAgICAgICAgaWYgKCB0ZXh0ICkge1xuICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIG51bGwgaWYgdGV4dCBpcyBub3QgZm91bmRcbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICBUQUdTOiB7XG4gICAgSU5QVVQ6IElOUFVUX1RBRyxcbiAgICBMQUJFTDogTEFCRUxfVEFHLFxuICAgIEJVVFRPTjogQlVUVE9OX1RBRyxcbiAgICBURVhUQVJFQTogVEVYVEFSRUFfVEFHLFxuICAgIFNFTEVDVDogU0VMRUNUX1RBRyxcbiAgICBPUFRHUk9VUDogT1BUR1JPVVBfVEFHLFxuICAgIERBVEFMSVNUOiBEQVRBTElTVF9UQUcsXG4gICAgT1VUUFVUOiBPVVRQVVRfVEFHLFxuICAgIERJVjogRElWX1RBRyxcbiAgICBBOiBBX1RBRyxcbiAgICBQOiBQX1RBRyxcbiAgICBCOiBCT0xEX1RBRyxcbiAgICBTVFJPTkc6IFNUUk9OR19UQUcsXG4gICAgSTogSV9UQUcsXG4gICAgRU06IEVNX1RBRyxcbiAgICBNQVJLOiBNQVJLX1RBRyxcbiAgICBTTUFMTDogU01BTExfVEFHLFxuICAgIERFTDogREVMX1RBRyxcbiAgICBJTlM6IElOU19UQUcsXG4gICAgU1VCOiBTVUJfVEFHLFxuICAgIFNVUDogU1VQX1RBR1xuICB9LFxuXG4gIC8vIHRoZXNlIGVsZW1lbnRzIGFyZSB0eXBpY2FsbHkgYXNzb2NpYXRlZCB3aXRoIGZvcm1zLCBhbmQgc3VwcG9ydCBjZXJ0YWluIGF0dHJpYnV0ZXNcbiAgRk9STV9FTEVNRU5UUzogWyBJTlBVVF9UQUcsIEJVVFRPTl9UQUcsIFRFWFRBUkVBX1RBRywgU0VMRUNUX1RBRywgT1BUR1JPVVBfVEFHLCBEQVRBTElTVF9UQUcsIE9VVFBVVF9UQUcsIEFfVEFHIF0sXG5cbiAgLy8gZGVmYXVsdCB0YWdzIGZvciBodG1sIGVsZW1lbnRzIG9mIHRoZSBOb2RlLlxuICBERUZBVUxUX0NPTlRBSU5FUl9UQUdfTkFNRTogRElWX1RBRyxcbiAgREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRTogUF9UQUcsXG4gIERFRkFVTFRfTEFCRUxfVEFHX05BTUU6IFBfVEFHLFxuXG4gIEFTU09DSUFUSU9OX0FUVFJJQlVURVM6IEFTU09DSUFUSU9OX0FUVFJJQlVURVMsXG5cbiAgLy8gdmFsaWQgaW5wdXQgdHlwZXMgdGhhdCBzdXBwb3J0IHRoZSBcImNoZWNrZWRcIiBwcm9wZXJ0eS9hdHRyaWJ1dGUgZm9yIGlucHV0IGVsZW1lbnRzXG4gIElOUFVUX1RZUEVTX1RIQVRfU1VQUE9SVF9DSEVDS0VEOiBbICdSQURJTycsICdDSEVDS0JPWCcgXSxcblxuICBET01fRVZFTlRTOiBET01fRVZFTlRTLFxuICBVU0VSX0dFU1RVUkVfRVZFTlRTOiBVU0VSX0dFU1RVUkVfRVZFTlRTLFxuICBCTE9DS0VEX0RPTV9FVkVOVFM6IEJMT0NLRURfRE9NX0VWRU5UUyxcblxuICBEQVRBX1BET01fVU5JUVVFX0lEOiBEQVRBX1BET01fVU5JUVVFX0lELFxuICBQRE9NX1VOSVFVRV9JRF9TRVBBUkFUT1I6ICctJyxcblxuICAvLyBhdHRyaWJ1dGUgdXNlZCBmb3IgZWxlbWVudHMgd2hpY2ggU2NlbmVyeSBzaG91bGQgbm90IGRpc3BhdGNoIFNjZW5lcnlFdmVudHMgd2hlbiBET00gZXZlbnQgaW5wdXQgaXMgcmVjZWl2ZWQgb25cbiAgLy8gdGhlbSwgc2VlIFBhcmFsbGVsRE9NLnNldEV4Y2x1ZGVMYWJlbFNpYmxpbmdGcm9tSW5wdXQgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgREFUQV9FWENMVURFX0ZST01fSU5QVVQ6ICdkYXRhLWV4Y2x1ZGUtZnJvbS1pbnB1dCdcbn07XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQRE9NVXRpbHMnLCBQRE9NVXRpbHMgKTtcblxuZXhwb3J0IGRlZmF1bHQgUERPTVV0aWxzOyJdLCJuYW1lcyI6WyJpc1RSZWFkT25seVByb3BlcnR5IiwidmFsaWRhdGUiLCJWYWxpZGF0aW9uIiwibWVyZ2UiLCJzdHJpcEVtYmVkZGluZ01hcmtzIiwiUERPTVNpYmxpbmdTdHlsZSIsIlJpY2hUZXh0Iiwic2NlbmVyeSIsIlRleHQiLCJORVhUIiwiUFJFVklPVVMiLCJJTlBVVF9UQUciLCJMQUJFTF9UQUciLCJCVVRUT05fVEFHIiwiVEVYVEFSRUFfVEFHIiwiU0VMRUNUX1RBRyIsIk9QVEdST1VQX1RBRyIsIkRBVEFMSVNUX1RBRyIsIk9VVFBVVF9UQUciLCJESVZfVEFHIiwiQV9UQUciLCJBUkVBX1RBRyIsIlBfVEFHIiwiSUZSQU1FX1RBRyIsIkJPTERfVEFHIiwiU1RST05HX1RBRyIsIklfVEFHIiwiRU1fVEFHIiwiTUFSS19UQUciLCJTTUFMTF9UQUciLCJERUxfVEFHIiwiSU5TX1RBRyIsIlNVQl9UQUciLCJTVVBfVEFHIiwiQlJfVEFHIiwiREVGQVVMVF9GT0NVU0FCTEVfVEFHUyIsIkZPUk1BVFRJTkdfVEFHUyIsIkVMRU1FTlRTX1dJVEhPVVRfQ0xPU0lOR19UQUciLCJET01fRVZFTlRTIiwiVVNFUl9HRVNUVVJFX0VWRU5UUyIsIkJMT0NLRURfRE9NX0VWRU5UUyIsIkFSSUFfTEFCRUxMRURCWSIsIkFSSUFfREVTQ1JJQkVEQlkiLCJBUklBX0FDVElWRV9ERVNDRU5EQU5UIiwiREFUQV9GT0NVU0FCTEUiLCJEQVRBX1BET01fVU5JUVVFX0lEIiwiQVNTT0NJQVRJT05fQVRUUklCVVRFUyIsImdldExpbmVhckRPTUVsZW1lbnRzIiwiZG9tRWxlbWVudCIsImNoaWxkcmVuIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJsaW5lYXJET00iLCJpIiwibGVuZ3RoIiwibm9kZVR5cGUiLCJOb2RlIiwiRUxFTUVOVF9OT0RFIiwiaXNFbGVtZW50SGlkZGVuIiwiaGlkZGVuIiwiZG9jdW1lbnQiLCJib2R5IiwicGFyZW50RWxlbWVudCIsImdldE5leHRQcmV2aW91c0ZvY3VzYWJsZSIsImRpcmVjdGlvbiIsInBhcmVudCIsImFjdGl2ZUVsZW1lbnQiLCJhY3RpdmVJbmRleCIsImluZGV4T2YiLCJkZWx0YSIsIm5leHRJbmRleCIsIm5leHRFbGVtZW50IiwiUERPTVV0aWxzIiwiaXNFbGVtZW50Rm9jdXNhYmxlIiwidHJpbUxlZnQiLCJzdHJpbmciLCJyZXBsYWNlIiwidGFnTmFtZVN1cHBvcnRzQ29udGVudCIsInRhZ05hbWUiLCJfIiwiaW5jbHVkZXMiLCJ0b1VwcGVyQ2FzZSIsInVud3JhcFN0cmluZ1Byb3BlcnR5IiwidmFsdWVPclByb3BlcnR5IiwicmVzdWx0IiwidmFsdWUiLCJhc3NlcnQiLCJnZXROZXh0Rm9jdXNhYmxlIiwiZ2V0UHJldmlvdXNGb2N1c2FibGUiLCJnZXRGaXJzdEZvY3VzYWJsZSIsImZpcnN0Rm9jdXNhYmxlIiwiZ2V0UmFuZG9tRm9jdXNhYmxlIiwicmFuZG9tIiwiZm9jdXNhYmxlRWxlbWVudHMiLCJwdXNoIiwibmV4dEludCIsInVud3JhcFByb3BlcnR5IiwiY29udGFpbnNGb3JtYXR0aW5nVGFncyIsInRleHRDb250ZW50Iiwib3BlbkluZGljZXMiLCJjbG9zZUluZGljZXMiLCJvcGVuSW5kZXgiLCJjbG9zZUluZGV4Iiwib25seUZvcm1hdHRpbmciLCJ1cHBlckNhc2VDb250ZW50IiwiaiIsInN1YlN0cmluZyIsInN1YnN0cmluZyIsInRyaW1tZWQiLCJzZXRUZXh0Q29udGVudCIsIkVsZW1lbnQiLCJpbm5lckhUTUwiLCJ0ZXh0V2l0aG91dEJyZWFrcyIsInJlcGxhY2VBbGwiLCJ0ZXh0V2l0aG91dEVtYmVkZGluZ01hcmtzIiwiU1RSSU5HX1dJVEhPVVRfVEVNUExBVEVfVkFSU19WQUxJREFUT1IiLCJ0YWdJc0RlZmF1bHRGb2N1c2FibGUiLCJjb250YWlucyIsImdldEF0dHJpYnV0ZSIsInJlbW92ZUVsZW1lbnRzIiwiZWxlbWVudCIsImNoaWxkcmVuVG9SZW1vdmUiLCJjaGlsZFRvUmVtb3ZlIiwicmVtb3ZlQ2hpbGQiLCJpbnNlcnRFbGVtZW50cyIsImNoaWxkcmVuVG9BZGQiLCJiZWZvcmVUaGlzRWxlbWVudCIsIndpbmRvdyIsIkFycmF5IiwiaXNBcnJheSIsImNoaWxkVG9BZGQiLCJpbnNlcnRCZWZvcmUiLCJjcmVhdGVFbGVtZW50IiwiZm9jdXNhYmxlIiwib3B0aW9ucyIsIm5hbWVzcGFjZSIsImlkIiwiY3JlYXRlRWxlbWVudE5TIiwib3ZlcnJpZGVGb2N1c1dpdGhUYWJJbmRleCIsImNsYXNzTGlzdCIsImFkZCIsIlNJQkxJTkdfQ0xBU1NfTkFNRSIsImRlZmF1bHRGb2N1c2FibGUiLCJ0YWJJbmRleCIsInJlbW92ZUF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsImZpbmRTdHJpbmdQcm9wZXJ0eSIsIm5vZGUiLCJzdHJpbmdQcm9wZXJ0eSIsImNoaWxkIiwidGV4dCIsIlRBR1MiLCJJTlBVVCIsIkxBQkVMIiwiQlVUVE9OIiwiVEVYVEFSRUEiLCJTRUxFQ1QiLCJPUFRHUk9VUCIsIkRBVEFMSVNUIiwiT1VUUFVUIiwiRElWIiwiQSIsIlAiLCJCIiwiU1RST05HIiwiSSIsIkVNIiwiTUFSSyIsIlNNQUxMIiwiREVMIiwiSU5TIiwiU1VCIiwiU1VQIiwiRk9STV9FTEVNRU5UUyIsIkRFRkFVTFRfQ09OVEFJTkVSX1RBR19OQU1FIiwiREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSIsIkRFRkFVTFRfTEFCRUxfVEFHX05BTUUiLCJJTlBVVF9UWVBFU19USEFUX1NVUFBPUlRfQ0hFQ0tFRCIsIlBET01fVU5JUVVFX0lEX1NFUEFSQVRPUiIsIkRBVEFfRVhDTFVERV9GUk9NX0lOUFVUIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Q0FRQyxHQUVELFNBQVNBLG1CQUFtQixRQUFRLDJDQUEyQztBQUMvRSxPQUFPQyxjQUFjLGtDQUFrQztBQUN2RCxPQUFPQyxnQkFBZ0Isb0NBQW9DO0FBQzNELE9BQU9DLFdBQVcsb0NBQW9DO0FBQ3RELE9BQU9DLHlCQUF5QixrREFBa0Q7QUFDbEYsU0FBU0MsZ0JBQWdCLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxJQUFJLFFBQVEsbUJBQW1CO0FBRTdFLFlBQVk7QUFDWixNQUFNQyxPQUFPO0FBQ2IsTUFBTUMsV0FBVztBQUVqQixpQkFBaUI7QUFDakIsTUFBTUMsWUFBWTtBQUNsQixNQUFNQyxZQUFZO0FBQ2xCLE1BQU1DLGFBQWE7QUFDbkIsTUFBTUMsZUFBZTtBQUNyQixNQUFNQyxhQUFhO0FBQ25CLE1BQU1DLGVBQWU7QUFDckIsTUFBTUMsZUFBZTtBQUNyQixNQUFNQyxhQUFhO0FBQ25CLE1BQU1DLFVBQVU7QUFDaEIsTUFBTUMsUUFBUTtBQUNkLE1BQU1DLFdBQVc7QUFDakIsTUFBTUMsUUFBUTtBQUNkLE1BQU1DLGFBQWE7QUFFbkIsa0NBQWtDO0FBQ2xDLE1BQU1DLFdBQVc7QUFDakIsTUFBTUMsYUFBYTtBQUNuQixNQUFNQyxRQUFRO0FBQ2QsTUFBTUMsU0FBUztBQUNmLE1BQU1DLFdBQVc7QUFDakIsTUFBTUMsWUFBWTtBQUNsQixNQUFNQyxVQUFVO0FBQ2hCLE1BQU1DLFVBQVU7QUFDaEIsTUFBTUMsVUFBVTtBQUNoQixNQUFNQyxVQUFVO0FBQ2hCLE1BQU1DLFNBQVM7QUFFZixzR0FBc0c7QUFDdEcsd0ZBQXdGO0FBQ3hGLE1BQU1DLHlCQUF5QjtJQUFFZjtJQUFPQztJ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