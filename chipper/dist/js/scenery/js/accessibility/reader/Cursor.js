// Copyright 2016-2023, University of Colorado Boulder
/**
 * Prototype for a cursor that implements the typical navigation strategies of a screen reader.  The output
 * text is meant to be read to a user by the Web Speech API synthesizer.
 *
 * NOTE: This is a prototype for screen reader behavior, and is an initial implementation for
 * a cursor that is to be used together with the web speech API, see
 * https://github.com/phetsims/scenery/issues/538
 *
 * NOTE: We are no longer actively developing this since we know that users would much rather use their own
 * dedicated software. But we are keeping it around for when we want to explore any other voicing features
 * using the web speech API.
 *
 * @author Jesse Greenberg
 */ import Property from '../../../../axon/js/Property.js';
import { scenery } from '../../imports.js';
// constants
const SPACE = ' '; // space to insert between words of text content
const END_OF_DOCUMENT = 'End of Document'; // flag thrown when there is no more content
const COMMA = ','; // some bits of text content should be separated with a comma for clear synth output
const LINE_WORD_LENGTH = 15; // number of words read in a single line
const NEXT = 'NEXT'; // constant that marks the direction of traversal
const PREVIOUS = 'PREVIOUS'; // constant that marks the direction of tragersal through the DOM
let Cursor = class Cursor {
    /**
   * Get all 'element' nodes off the parent element, placing them in an array
   * for easy traversal.  Note that this includes all elements, even those
   * that are 'hidden' or purely for structure.
   * @private
   *
   * @param  {HTMLElement} domElement - the parent element to linearize
   * @returns {Array.<HTMLElement>}
   */ getLinearDOMElements(domElement) {
        // gets ALL descendent children for the element
        const children = domElement.getElementsByTagName('*');
        const linearDOM = [];
        for(let i = 0; i < children.length; i++){
            if (children[i].nodeType === Node.ELEMENT_NODE) {
                linearDOM[i] = children[i];
            }
        }
        return linearDOM;
    }
    /**
   * Get the live role from the DOM element.  If the element is not live, return null.
   * @private
   *
   * @param {HTMLElement} domElement
   * @returns {string}
   */ getLiveRole(domElement) {
        let liveRole = null;
        // collection of all roles that can produce 'live region' behavior
        // see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
        const roles = [
            'log',
            'status',
            'alert',
            'progressbar',
            'marquee',
            'timer',
            'assertive',
            'polite'
        ];
        roles.forEach((role)=>{
            if (domElement.getAttribute('aria-live') === role || domElement.getAttribute('role') === role) {
                liveRole = role;
            }
        });
        return liveRole;
    }
    /**
   * Get the next or previous element in the DOM, depending on the desired direction.
   * @private
   *
   * @param {[type]} direction - NEXT || PREVIOUS
   * @returns {HTMLElement}
   */ getNextPreviousElement(direction) {
        if (!this.activeElement) {
            this.activeElement = this.linearDOM[0];
        }
        const searchDelta = direction === 'NEXT' ? 1 : -1;
        const activeIndex = this.linearDOM.indexOf(this.activeElement);
        const nextIndex = activeIndex + searchDelta;
        return this.linearDOM[nextIndex];
    }
    /**
   * Get the label for a particular id
   * @private

   * @param {string} id
   * @returns {HTMLElement}
   */ getLabel(id) {
        const labels = document.getElementsByTagName('label');
        // loop through NodeList
        let labelWithId;
        Array.prototype.forEach.call(labels, (label)=>{
            if (label.getAttribute('for')) {
                labelWithId = label;
            }
        });
        assert && assert(labelWithId, 'No label found for id');
        return labelWithId;
    }
    /**
   * Get the accessible text from the element.  Depending on the navigation strategy,
   * we may or may not want to include all application content text from the markup.
   * @private
   *
   * @param {HTMLElement} element
   * @param {boolean} withApplicationContent - do you want to include all aria text content?
   * @returns {string}
   */ getAccessibleText(element, withApplicationContent) {
        // placeholder for the text content that we will build up from the markup
        let textContent = '';
        // if the element is undefined, we have reached the end of the document
        if (!element) {
            return END_OF_DOCUMENT;
        }
        // filter out structural elements that do not have accessible text
        if (element.getAttribute('class') === 'ScreenView') {
            return null;
        }
        if (element.tagName === 'HEADER') {
            // TODO: Headers should have some behavior https://github.com/phetsims/scenery/issues/1581
            return null;
        }
        if (element.tagName === 'SECTION') {
            // TODO: What do you we do for sections? Read section + aria-labelledby? https://github.com/phetsims/scenery/issues/1581
            return null;
        }
        if (element.tagName === 'LABEL') {
            // label content is added like 'aria-describedby', do not read this yet
            return null;
        }
        // search up through the ancestors to see if this element should be hidden
        let childElement = element;
        while(childElement.parentElement){
            if (childElement.getAttribute('aria-hidden') || childElement.hidden) {
                return null;
            } else {
                childElement = childElement.parentElement;
            }
        }
        // search for elements that will have content and should be read
        if (element.tagName === 'P') {
            textContent += element.textContent;
        }
        if (element.tagName === 'H1') {
            textContent += `Heading Level 1, ${element.textContent}`;
        }
        if (element.tagName === 'H2') {
            textContent += `Heading Level 2, ${element.textContent}`;
        }
        if (element.tagName === 'H3') {
            textContent += `Heading Level 3, ${element.textContent}`;
        }
        if (element.tagName === 'UL') {
            const listLength = element.children.length;
            textContent += `List with ${listLength} items`;
        }
        if (element.tagName === 'LI') {
            textContent += `List Item: ${element.textContent}`;
        }
        if (element.tagName === 'BUTTON') {
            const buttonLabel = ' Button';
            // check to see if this is a 'toggle' button with the 'aria-pressed' attribute
            if (element.getAttribute('aria-pressed')) {
                let toggleLabel = ' toggle';
                const pressedLabel = ' pressed';
                const notLabel = ' not';
                // insert a comma for readibility of the synth
                toggleLabel += buttonLabel + COMMA;
                if (element.getAttribute('aria-pressed') === 'true') {
                    toggleLabel += pressedLabel;
                } else {
                    toggleLabel += notLabel + pressedLabel;
                }
                textContent += element.textContent + COMMA + toggleLabel;
            } else {
                textContent += element.textContent + buttonLabel;
            }
        }
        if (element.tagName === 'INPUT') {
            if (element.type === 'reset') {
                textContent += `${element.getAttribute('value')} Button`;
            }
            if (element.type === 'checkbox') {
                // the checkbox should have a label - find the correct one
                const checkboxLabel = this.getLabel(element.id);
                const labelContent = checkboxLabel.textContent;
                // describe as a switch if it has the role
                if (element.getAttribute('role') === 'switch') {
                    // required for a checkbox
                    const ariaChecked = element.getAttribute('aria-checked');
                    if (ariaChecked) {
                        const switchedString = ariaChecked === 'true' ? 'On' : 'Off';
                        textContent += `${labelContent + COMMA + SPACE}switch${COMMA}${SPACE}${switchedString}`;
                    } else {
                        assert && assert(false, 'checkbox switch must have aria-checked attribute');
                    }
                } else {
                    const checkedString = element.checked ? ' Checked' : ' Not Checked';
                    textContent += `${element.textContent} Checkbox${checkedString}`;
                }
            }
        }
        // if we are in an 'application' style of navigation, we want to add additional information
        // from the markup
        // Order of additions to textContent is important, and is designed to make sense
        // when textContent is read continuously
        // TODO: support more markup! https://github.com/phetsims/scenery/issues/1581
        if (withApplicationContent) {
            // insert a comma at the end of the content to enhance the output of the synth
            if (textContent.length > 0) {
                textContent += COMMA;
            }
            // look for an aria-label
            const ariaLabel = element.getAttribute('aria-label');
            if (ariaLabel) {
                textContent += SPACE + ariaLabel + COMMA;
            }
            // look for an aria-labelledBy attribute to see if there is another element in the DOM that
            // describes this one
            const ariaLabelledById = element.getAttribute('aria-labelledBy');
            if (ariaLabelledById) {
                const ariaLabelledBy = document.getElementById(ariaLabelledById);
                const ariaLabelledByText = ariaLabelledBy.textContent;
                textContent += SPACE + ariaLabelledByText + COMMA;
            }
            // search up through the ancestors to find if the element has 'application' or 'document' content
            // TODO: Factor out into a searchUp type of function. https://github.com/phetsims/scenery/issues/1581
            childElement = element;
            let role;
            while(childElement.parentElement){
                role = childElement.getAttribute('role');
                if (role === 'document' || role === 'application') {
                    textContent += SPACE + role + COMMA;
                    break;
                } else {
                    childElement = childElement.parentElement;
                }
            }
            // check to see if this element has an aria-role
            if (element.getAttribute('role')) {
                role = element.getAttribute('role');
                // TODO handle all the different roles! https://github.com/phetsims/scenery/issues/1581
                // label if the role is a button
                if (role === 'button') {
                    textContent += `${SPACE}Button`;
                }
            }
            // check to see if this element is draggable
            if (element.draggable) {
                textContent += `${SPACE}draggable${COMMA}`;
            }
            // look for aria-grabbed markup to let the user know if the element is grabbed
            if (element.getAttribute('aria-grabbed') === 'true') {
                textContent += `${SPACE}grabbed${COMMA}`;
            }
            // look for an element in the DOM that describes this one
            const ariaDescribedBy = element.getAttribute('aria-describedby');
            if (ariaDescribedBy) {
                // the aria spec supports multiple description ID's for a single element
                const descriptionIDs = ariaDescribedBy.split(SPACE);
                let descriptionElement;
                let descriptionText;
                descriptionIDs.forEach((descriptionID)=>{
                    descriptionElement = document.getElementById(descriptionID);
                    descriptionText = descriptionElement.textContent;
                    textContent += SPACE + descriptionText;
                });
            }
        }
        // delete the trailing comma if it exists at the end of the textContent
        if (textContent[textContent.length - 1] === ',') {
            textContent = textContent.slice(0, -1);
        }
        return textContent;
    }
    /**
   * Get the next or previous element in the DOM that has accessible text content, relative to the current
   * active element.
   * @private
   *
   * @param  {string} direction - NEXT || PREVIOUS
   * @returns {HTMLElement}
   */ getNextPreviousElementWithPDOMContent(direction) {
        let pdomContent;
        while(!pdomContent){
            // set the selected element to the next element in the DOM
            this.activeElement = this.getNextPreviousElement(direction);
            pdomContent = this.getAccessibleText(this.activeElement, false);
        }
        return this.activeElement;
    }
    /**
   * Get the next element in the DOM with on of the desired tagNames, types, or roles.  This does not set the active element, it
   * only traverses the document looking for elements.
   * @private
   *
   * @param  {Array.<string>} roles - list of desired DOM tag names, types, or aria roles
   * @param  {[type]} direction - direction flag for to search through the DOM - NEXT || PREVIOUS
   * @returns {HTMLElement}
   */ getNextPreviousElementWithRole(roles, direction) {
        let element = null;
        const searchDelta = direction === NEXT ? 1 : -1;
        // if there is not an active element, use the first element in the DOM.
        if (!this.activeElement) {
            this.activeElement = this.linearDOM[0];
        }
        // start search from the next or previous element and set up the traversal conditions
        let searchIndex = this.linearDOM.indexOf(this.activeElement) + searchDelta;
        while(this.linearDOM[searchIndex]){
            for(let j = 0; j < roles.length; j++){
                const elementTag = this.linearDOM[searchIndex].tagName;
                const elementType = this.linearDOM[searchIndex].type;
                const elementRole = this.linearDOM[searchIndex].getAttribute('role');
                const searchRole = roles[j];
                if (elementTag === searchRole || elementRole === searchRole || elementType === searchRole) {
                    element = this.linearDOM[searchIndex];
                    break;
                }
            }
            if (element) {
                break;
            }
            searchIndex += searchDelta;
        }
        return element;
    }
    /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */ readNextPreviousLine(direction) {
        let line = '';
        // reset the content letter and word positions because we are reading a new line
        this.letterPosition = 0;
        this.wordPosition = 0;
        // if there is no active element, set to the next element with accessible content
        if (!this.activeElement) {
            this.activeElement = this.getNextPreviousElementWithPDOMContent(direction);
        }
        // get the accessible content for the active element, without any 'application' content, and split into words
        let accessibleText = this.getAccessibleText(this.activeElement, false).split(SPACE);
        // if traversing backwards, position in line needs be at the start of previous line
        if (direction === PREVIOUS) {
            this.positionInLine = this.positionInLine - 2 * LINE_WORD_LENGTH;
        }
        // if there is no content at the line position, it is time to find the next element
        if (!accessibleText[this.positionInLine]) {
            // reset the position in the line
            this.positionInLine = 0;
            // save the active element in case it needs to be restored
            const previousElement = this.activeElement;
            // update the active element and set the accessible content from this element
            this.activeElement = this.getNextPreviousElementWithPDOMContent(direction);
            accessibleText = this.getAccessibleText(this.activeElement, false).split(' ');
            // restore the previous active element if we are at the end of the document
            if (!this.activeElement) {
                this.activeElement = previousElement;
            }
        }
        // read the next line of the accessible content
        const lineLimit = this.positionInLine + LINE_WORD_LENGTH;
        for(let i = this.positionInLine; i < lineLimit; i++){
            if (accessibleText[i]) {
                line += accessibleText[i];
                this.positionInLine += 1;
                if (accessibleText[i + 1]) {
                    line += SPACE;
                } else {
                    // we have reached the end of this content, there are no more words
                    // wrap the line position to the end so we can easily read back the previous line
                    this.positionInLine += LINE_WORD_LENGTH - this.positionInLine % LINE_WORD_LENGTH;
                    break;
                }
            }
        }
        this.activeLine = line;
        return line;
    }
    /**
   * Read the active line without incrementing the word count.
   * @private
   *
   * @returns {[type]} [description]
   */ readActiveLine() {
        let line = '';
        // if there is no active line, find the next one
        if (!this.activeLine) {
            this.activeLine = this.readNextPreviousLine(NEXT);
        }
        // split up the active line into an array of words
        const activeWords = this.activeLine.split(SPACE);
        // read this line of content
        for(let i = 0; i < LINE_WORD_LENGTH; i++){
            if (activeWords[i]) {
                line += activeWords[i];
                if (activeWords[i + 1]) {
                    // add space if there are more words
                    line += SPACE;
                } else {
                    break;
                }
            }
        }
        return line;
    }
    /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */ readNextPreviousWord(direction) {
        // if there is no active line, find the next one
        if (!this.activeLine) {
            this.activeLine = this.readNextPreviousLine(direction);
        }
        // split the active line into an array of words
        const activeWords = this.activeLine.split(SPACE);
        // direction dependent variables
        let searchDelta;
        let contentEnd;
        if (direction === NEXT) {
            contentEnd = activeWords.length;
            searchDelta = 1;
        } else if (direction === PREVIOUS) {
            contentEnd = 0;
            searchDelta = -2;
        }
        // if there is no more content, read the next/previous line
        if (this.wordPosition === contentEnd) {
            this.activeLine = this.readNextPreviousLine(direction);
        }
        // get the word to read update word position
        const outputText = activeWords[this.wordPosition];
        this.wordPosition += searchDelta;
        return outputText;
    }
    /**
   * Read the next or previous heading with one of the levels specified in headingLevels and in the direction
   * specified by the direction flag.
   * @private
   *
   * @param  {Array.<string>} headingLevels
   * @param  {[type]} direction - direction of traversal through the DOM - NEXT || PREVIOUS
   * @returns {string}
   */ readNextPreviousHeading(headingLevels, direction) {
        // get the next element in the DOM with one of the above heading levels which has accessible content
        // to read
        let accessibleText;
        let nextElement;
        // track the previous element - if there are no more headings, store it here
        let previousElement;
        while(!accessibleText){
            previousElement = this.activeElement;
            nextElement = this.getNextPreviousElementWithRole(headingLevels, direction);
            this.activeElement = nextElement;
            accessibleText = this.getAccessibleText(nextElement);
        }
        if (!nextElement) {
            // restore the active element
            this.activeElement = previousElement;
            // let the user know that there are no more headings at the desired level
            const directionDescriptionString = direction === NEXT ? 'more' : 'previous';
            if (headingLevels.length === 1) {
                const noNextHeadingString = `No ${directionDescriptionString} headings at `;
                const headingLevel = headingLevels[0];
                const levelString = headingLevel === 'H1' ? 'Level 1' : headingLevel === 'H2' ? 'Level 2' : headingLevel === 'H3' ? 'Level 3' : headingLevel === 'H4' ? 'Level 4' : headingLevel === 'H5' ? 'Level 5' : 'Level 6';
                return noNextHeadingString + levelString;
            }
            return `No ${directionDescriptionString} headings`;
        }
        // set element as the next active element and return the text
        this.activeElement = nextElement;
        return accessibleText;
    }
    /**
   * Read the next/previous button element.  A button can have the tagname button, have the aria button role, or
   * or have one of the following types: submit, button, reset
   * @private
   *
   * @param  {string}} direction
   * @returns {HTMLElement}
   */ readNextPreviousButton(direction) {
        // the following roles should handle 'role=button', 'type=button', 'tagName=BUTTON'
        const roles = [
            'button',
            'BUTTON',
            'submit',
            'reset'
        ];
        let nextElement;
        let accessibleText;
        let previousElement;
        while(!accessibleText){
            previousElement = this.activeElement;
            nextElement = this.getNextPreviousElementWithRole(roles, direction);
            this.activeElement = nextElement;
            // get the accessible text with application descriptions
            accessibleText = this.getAccessibleText(nextElement, true);
        }
        if (!nextElement) {
            this.activeElement = previousElement;
            const directionDescriptionString = direction === NEXT ? 'more' : 'previous';
            return `No ${directionDescriptionString} buttons`;
        }
        this.activeElement = nextElement;
        return accessibleText;
    }
    /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */ readNextPreviousFormElement(direction) {
        // TODO: support more form elements! https://github.com/phetsims/scenery/issues/1581
        const tagNames = [
            'INPUT',
            'BUTTON'
        ];
        const ariaRoles = [
            'button'
        ];
        const roles = tagNames.concat(ariaRoles);
        let nextElement;
        let accessibleText;
        // track the previous element - if there are no more form elements it will need to be restored
        let previousElement;
        while(!accessibleText){
            previousElement = this.activeElement;
            nextElement = this.getNextPreviousElementWithRole(roles, direction);
            this.activeElement = nextElement;
            // get the accessible text with aria descriptions
            accessibleText = this.getAccessibleText(nextElement, true);
        }
        if (accessibleText === END_OF_DOCUMENT) {
            this.activeElement = previousElement;
            const directionDescriptionString = direction === NEXT ? 'next' : 'previous';
            return `No ${directionDescriptionString} form field`;
        }
        this.activeElement = nextElement;
        return accessibleText;
    }
    /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */ readNextPreviousListItem(direction) {
        if (!this.activeElement) {
            this.activeElement = this.getNextPreviousElementWithPDOMContent(direction);
        }
        let accessibleText;
        // if we are inside of a list, get the next peer, or find the next list
        const parentElement = this.activeElement.parentElement;
        if (parentElement.tagName === 'UL' || parentElement.tagName === 'OL') {
            const searchDelta = direction === NEXT ? 1 : -1;
            // Array.prototype must be used on the NodeList
            let searchIndex = Array.prototype.indexOf.call(parentElement.children, this.activeElement) + searchDelta;
            while(parentElement.children[searchIndex]){
                accessibleText = this.getAccessibleText(parentElement.children[searchIndex]);
                if (accessibleText) {
                    this.activeElement = parentElement.children[searchIndex];
                    break;
                }
                searchIndex += searchDelta;
            }
            if (!accessibleText) {
                // there was no accessible text in the list items, so read the next / previous list
                accessibleText = this.readNextPreviousList(direction);
            }
        } else {
            // not inside of a list, so read the next/previous one and its first item
            accessibleText = this.readNextPreviousList(direction);
        }
        if (!accessibleText) {
            const directionDescriptionString = direction === NEXT ? 'more' : 'previous';
            return `No ${directionDescriptionString} list items`;
        }
        return accessibleText;
    }
    /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */ readNextPreviousList(direction) {
        if (!this.activeElement) {
            this.activeElement = this.getNextPreviousElementWithPDOMContent(direction);
        }
        // if we are inside of a list already, step out of it to begin searching there
        const parentElement = this.activeElement.parentElement;
        let activeElement;
        if (parentElement.tagName === 'UL' || parentElement.tagName === 'OL') {
            // save the previous active element - if there are no more lists, this should not change
            activeElement = this.activeElement;
            this.activeElement = parentElement;
        }
        const listElement = this.getNextPreviousElementWithRole([
            'UL',
            'OL'
        ], direction);
        if (!listElement) {
            // restore the previous active element
            if (activeElement) {
                this.activeElement = activeElement;
            }
            // let the user know that there are no more lists and move to the next element
            const directionDescriptionString = direction === NEXT ? 'more' : 'previous';
            return `No ${directionDescriptionString} lists`;
        }
        // get the content from the list element
        const listText = this.getAccessibleText(listElement);
        // include the content from the first item in the list
        let itemText = '';
        const firstItem = listElement.children[0];
        if (firstItem) {
            itemText = this.getAccessibleText(firstItem);
            this.activeElement = firstItem;
        }
        return `${listText}, ${itemText}`;
    }
    /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */ readNextPreviousCharacter(direction) {
        // if there is no active line, find the next one
        if (!this.activeLine) {
            this.activeLine = this.readNextPreviousLine(NEXT);
        }
        // directional dependent variables
        let contentEnd;
        let searchDelta;
        let normalizeDirection;
        if (direction === NEXT) {
            contentEnd = this.activeLine.length;
            searchDelta = 1;
            normalizeDirection = 0;
        } else if (direction === PREVIOUS) {
            // for backwards traversal, read from two characters behind
            contentEnd = 2;
            searchDelta = -1;
            normalizeDirection = -2;
        }
        // if we are at the end of the content, read the next/previous line
        if (this.letterPosition === contentEnd) {
            this.activeLine = this.readNextPreviousLine(direction);
            // if reading backwards, letter position should be at the end of the active line
            this.letterPosition = this.activeLine.length;
        }
        // get the letter to read and increment the letter position
        const outputText = this.activeLine[this.letterPosition + normalizeDirection];
        this.letterPosition += searchDelta;
        return outputText;
    }
    /**
   * Update the list of elements, and add Mutation Observers to each one.  MutationObservers
   * provide a way to listen to changes in the DOM,
   * see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
   * @private
   */ updateLiveElementList() {
        // remove all previous observers
        // TODO: only update the observer list if necessary https://github.com/phetsims/scenery/issues/1581
        for(let i = 0; i < this.observers.length; i++){
            if (this.observers[i]) {
                this.observers[i].disconnect();
            }
        }
        // clear the list of observers
        this.observers = [];
        // search through the DOM, looking for elements with a 'live region' attribute
        for(let i = 0; i < this.linearDOM.length; i++){
            const domElement = this.linearDOM[i];
            const liveRole = this.getLiveRole(domElement);
            if (liveRole) {
                const mutationObserverCallback = (mutations)=>{
                    mutations.forEach((mutation)=>{
                        let liveRole;
                        let mutatedElement = mutation.target;
                        // look for the type of live role that is associated with this mutation
                        // if the target has no live attribute, search through the element's ancestors to find the attribute
                        while(!liveRole){
                            liveRole = this.getLiveRole(mutatedElement);
                            mutatedElement = mutatedElement.parentElement;
                        }
                        // we only care about nodes added
                        if (mutation.addedNodes[0]) {
                            const updatedText = mutation.addedNodes[0].data;
                            this.outputUtteranceProperty.set(new Utterance(updatedText, liveRole));
                        }
                    });
                };
                // create a mutation observer for this live element
                const observer = new MutationObserver((mutations)=>{
                    mutationObserverCallback(mutations);
                });
                // listen for changes to the subtree in case children of the aria-live parent change their textContent
                const observerConfig = {
                    childList: true,
                    subtree: true
                };
                observer.observe(domElement, observerConfig);
                this.observers.push(observer);
            }
        }
    }
    /**
   * Read continuously from the current active element.  Accessible content is read by reader with a 'polite'
   * utterance so that new text is added to the queue line by line.
   * @private
   *
   * TODO: If the read is cancelled, the active element should be set appropriately. https://github.com/phetsims/scenery/issues/1581
   *
   * @returns {string}
   */ readEntireDocument() {
        const liveRole = 'polite';
        let outputText = this.getAccessibleText(this.activeElement);
        let activeElement = this.activeElement;
        while(outputText !== END_OF_DOCUMENT){
            activeElement = this.activeElement;
            outputText = this.readNextPreviousLine(NEXT);
            if (outputText === END_OF_DOCUMENT) {
                this.activeElement = activeElement;
            }
            this.outputUtteranceProperty.set(new Utterance(outputText, liveRole));
        }
    }
    /**
   * Return true if the element is focusable.  A focusable element has a tab index, is a
   * form element, or has a role which adds it to the navigation order.
   * @private
   *
   * TODO: Populate with the rest of the focusable elements. https://github.com/phetsims/scenery/issues/1581
   * @param  {HTMLElement} domElement
   * @returns {boolean}
   */ isFocusable(domElement) {
        // list of attributes and tag names which should be in the navigation order
        // TODO: more roles! https://github.com/phetsims/scenery/issues/1581
        const focusableRoles = [
            'tabindex',
            'BUTTON',
            'INPUT'
        ];
        let focusable = false;
        focusableRoles.forEach((role)=>{
            if (domElement.getAttribute(role)) {
                focusable = true;
            } else if (domElement.tagName === role) {
                focusable = true;
            }
        });
        return focusable;
    }
    /**
   * @param {Element} domElement
   */ constructor(domElement){
        const self = this;
        // the output utterance for the cursor, to be read by the synth and handled in various ways
        // initial output is the document title
        // @public (read-only)
        this.outputUtteranceProperty = new Property(new Utterance(document.title, 'off'));
        // @private - a linear representation of the DOM which is navigated by the user
        this.linearDOM = this.getLinearDOMElements(domElement);
        // @private - the active element is element that is under navigation in the parallel DOM
        this.activeElement = null;
        // @private - the active line is the current line being read and navigated with the cursor
        this.activeLine = null;
        // the letter position is the position of the cursor in the active line to support reading on a
        // letter by letter basis.  This is relative to the length of the active line.
        // @private
        this.letterPosition = 0;
        // the positionInLine is the position in words marking the end location of the active line
        // this must be tracked to support content and descriptions longer than 15 words
        // @private
        this.positionInLine = 0;
        // the position of the word in the active line to support navigation on a word by word basis
        // @private
        this.wordPosition = 0;
        // we need to track the mutation observers so that they can be discconnected
        // @private
        this.observers = [];
        // track a keystate in order to handle when multiple key presses happen at once
        // @private
        this.keyState = {};
        // the document will listen for keyboard interactions
        // this listener implements common navigation strategies for a typical screen reader
        //
        // see https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts
        // for a list of common navigation strategies
        //
        // TODO: Use this.keyState object instead of referencing the event directly https://github.com/phetsims/scenery/issues/1581
        document.addEventListener('keydown', (event)=>{
            // update the keystate object
            this.keyState[event.keyCode] = true;
            // store the output text here
            let outputText;
            // check to see if shift key pressed
            // TODO: we can optionally use the keyState object for this https://github.com/phetsims/scenery/issues/1581
            const shiftKeyDown = event.shiftKey;
            // direction to navigate through the DOM - usually, holding shift indicates the user wants to travers
            // backwards through the DOM
            const direction = shiftKeyDown ? PREVIOUS : NEXT;
            // the dom can change at any time, make sure that we are reading a copy that is up to date
            this.linearDOM = this.getLinearDOMElements(domElement);
            // update the list of live elements
            this.updateLiveElementList();
            // if the element has an 'application' like behavior, keyboard should be free for the application
            // TODO: This may be insufficient if we need the 'arrow' keys to continue to work for an application role https://github.com/phetsims/scenery/issues/1581
            if (this.activeElement && this.activeElement.getAttribute('role') === 'application') {
                return;
            }
            // otherwise, handle all key events here
            if (this.keyState[40] && !this.keyState[45]) {
                // read the next line on 'down arrow'
                outputText = this.readNextPreviousLine(NEXT);
            } else if (this.keyState[38] && !this.keyState[45]) {
                // read the previous line on 'up arrow'
                outputText = this.readNextPreviousLine(PREVIOUS);
            } else if (this.keyState[72]) {
                // read the previous or next headings depending on whether the shift key is pressed
                const headingLevels = [
                    'H1',
                    'H2',
                    'H3',
                    'H4',
                    'H5',
                    'H6'
                ];
                outputText = this.readNextPreviousHeading(headingLevels, direction);
            } else if (this.keyState[9]) {
            // let the browser naturally handle 'tab' for forms elements and elements with a tabIndex
            } else if (this.keyState[39] && !this.keyState[17]) {
                // read the next character of the active line on 'right arrow'
                outputText = this.readNextPreviousCharacter(NEXT);
            } else if (this.keyState[37] && !this.keyState[17]) {
                // read the previous character on 'left arrow'
                outputText = this.readNextPreviousCharacter(PREVIOUS);
            } else if (this.keyState[37] && this.keyState[17]) {
                // read the previous word on 'control + left arrow'
                outputText = this.readNextPreviousWord(PREVIOUS);
            } else if (this.keyState[39] && this.keyState[17]) {
                // read the next word on 'control + right arrow'
                outputText = this.readNextPreviousWord(NEXT);
            } else if (this.keyState[45] && this.keyState[38]) {
                // repeat the active line on 'insert + up arrow'
                outputText = this.readActiveLine();
            } else if (this.keyState[49]) {
                // find the previous/next heading level 1 on '1'
                outputText = this.readNextPreviousHeading([
                    'H1'
                ], direction);
            } else if (this.keyState[50]) {
                // find the previous/next heading level 2 on '2'
                outputText = this.readNextPreviousHeading([
                    'H2'
                ], direction);
            } else if (this.keyState[51]) {
                // find the previous/next heading level 3 on '3'
                outputText = this.readNextPreviousHeading([
                    'H3'
                ], direction);
            } else if (this.keyState[52]) {
                // find the previous/next heading level 4 on '4'
                outputText = this.readNextPreviousHeading([
                    'H4'
                ], direction);
            } else if (this.keyState[53]) {
                // find the previous/next heading level 5 on '5'
                outputText = this.readNextPreviousHeading([
                    'H5'
                ], direction);
            } else if (this.keyState[54]) {
                // find the previous/next heading level 6 on '6'
                outputText = this.readNextPreviousHeading([
                    'H6'
                ], direction);
            } else if (this.keyState[70]) {
                // find the previous/next form element on 'f'
                outputText = this.readNextPreviousFormElement(direction);
            } else if (this.keyState[66]) {
                // find the previous/next button element on 'b'
                outputText = this.readNextPreviousButton(direction);
            } else if (this.keyState[76]) {
                // find the previous/next list on 'L'
                outputText = this.readNextPreviousList(direction);
            } else if (this.keyState[73]) {
                // find the previous/next list item on 'I'
                outputText = this.readNextPreviousListItem(direction);
            } else if (this.keyState[45] && this.keyState[40]) {
                // read entire document on 'insert + down arrow'
                this.readEntireDocument();
            }
            // if the active element is focusable, set the focus to it so that the virtual cursor can
            // directly interact with elements
            if (this.activeElement && this.isFocusable(this.activeElement)) {
                this.activeElement.focus();
            }
            // if the output text is a space, we want it to be read as 'blank' or 'space'
            if (outputText === SPACE) {
                outputText = 'space';
            }
            if (outputText) {
                // for now, all utterances are off for aria-live
                this.outputUtteranceProperty.set(new Utterance(outputText, 'off'));
            }
        // TODO: everything else in https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts https://github.com/phetsims/scenery/issues/1581
        });
        // update the keystate object on keyup to handle multiple key presses at once
        document.addEventListener('keyup', (event)=>{
            this.keyState[event.keyCode] = false;
        });
        // listen for when an element is about to receive focus
        // we are using focusin (and not focus) because we want the event to bubble up the document
        // this will handle both tab navigation AND programatic focus by the simulation
        document.addEventListener('focusin', function(event) {
            // anounce the new focus if it is different from the active element
            if (event.target !== self.activeElement) {
                self.activeElement = event.target;
                // so read out all content from aria markup since focus moved via application behavior
                const withApplicationContent = true;
                const outputText = self.getAccessibleText(this.activeElement, withApplicationContent);
                if (outputText) {
                    const liveRole = self.activeElement.getAttribute('aria-live');
                    self.outputUtteranceProperty.set(new Utterance(outputText, liveRole));
                }
            }
        });
    }
};
scenery.register('Cursor', Cursor);
let Utterance = class Utterance {
    /**
   * Create an experimental type to create unique utterances for the reader.
   * Type is simply a collection of text and a priority for aria-live that
   * lets the reader know whether to queue the next utterance or cancel it in the order.
   *
   * TODO: This is where we could deviate from traditional screen reader behavior. For instance, instead of https://github.com/phetsims/scenery/issues/1581
   * just liveRole, perhaps we should have a liveIndex that specifies order of the live update? We may also
   * need additional flags here for the reader.
   *
   * @param {string} text - the text to be read as the utterance for the synth
   * @param {string} liveRole - see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
   */ constructor(text, liveRole){
        this.text = text;
        this.liveRole = liveRole;
    }
};
export default Cursor;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9yZWFkZXIvQ3Vyc29yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFByb3RvdHlwZSBmb3IgYSBjdXJzb3IgdGhhdCBpbXBsZW1lbnRzIHRoZSB0eXBpY2FsIG5hdmlnYXRpb24gc3RyYXRlZ2llcyBvZiBhIHNjcmVlbiByZWFkZXIuICBUaGUgb3V0cHV0XG4gKiB0ZXh0IGlzIG1lYW50IHRvIGJlIHJlYWQgdG8gYSB1c2VyIGJ5IHRoZSBXZWIgU3BlZWNoIEFQSSBzeW50aGVzaXplci5cbiAqXG4gKiBOT1RFOiBUaGlzIGlzIGEgcHJvdG90eXBlIGZvciBzY3JlZW4gcmVhZGVyIGJlaGF2aW9yLCBhbmQgaXMgYW4gaW5pdGlhbCBpbXBsZW1lbnRhdGlvbiBmb3JcbiAqIGEgY3Vyc29yIHRoYXQgaXMgdG8gYmUgdXNlZCB0b2dldGhlciB3aXRoIHRoZSB3ZWIgc3BlZWNoIEFQSSwgc2VlXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNTM4XG4gKlxuICogTk9URTogV2UgYXJlIG5vIGxvbmdlciBhY3RpdmVseSBkZXZlbG9waW5nIHRoaXMgc2luY2Ugd2Uga25vdyB0aGF0IHVzZXJzIHdvdWxkIG11Y2ggcmF0aGVyIHVzZSB0aGVpciBvd25cbiAqIGRlZGljYXRlZCBzb2Z0d2FyZS4gQnV0IHdlIGFyZSBrZWVwaW5nIGl0IGFyb3VuZCBmb3Igd2hlbiB3ZSB3YW50IHRvIGV4cGxvcmUgYW55IG90aGVyIHZvaWNpbmcgZmVhdHVyZXNcbiAqIHVzaW5nIHRoZSB3ZWIgc3BlZWNoIEFQSS5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBTUEFDRSA9ICcgJzsgLy8gc3BhY2UgdG8gaW5zZXJ0IGJldHdlZW4gd29yZHMgb2YgdGV4dCBjb250ZW50XG5jb25zdCBFTkRfT0ZfRE9DVU1FTlQgPSAnRW5kIG9mIERvY3VtZW50JzsgLy8gZmxhZyB0aHJvd24gd2hlbiB0aGVyZSBpcyBubyBtb3JlIGNvbnRlbnRcbmNvbnN0IENPTU1BID0gJywnOyAvLyBzb21lIGJpdHMgb2YgdGV4dCBjb250ZW50IHNob3VsZCBiZSBzZXBhcmF0ZWQgd2l0aCBhIGNvbW1hIGZvciBjbGVhciBzeW50aCBvdXRwdXRcbmNvbnN0IExJTkVfV09SRF9MRU5HVEggPSAxNTsgLy8gbnVtYmVyIG9mIHdvcmRzIHJlYWQgaW4gYSBzaW5nbGUgbGluZVxuY29uc3QgTkVYVCA9ICdORVhUJzsgLy8gY29uc3RhbnQgdGhhdCBtYXJrcyB0aGUgZGlyZWN0aW9uIG9mIHRyYXZlcnNhbFxuY29uc3QgUFJFVklPVVMgPSAnUFJFVklPVVMnOyAvLyBjb25zdGFudCB0aGF0IG1hcmtzIHRoZSBkaXJlY3Rpb24gb2YgdHJhZ2Vyc2FsIHRocm91Z2ggdGhlIERPTVxuXG5jbGFzcyBDdXJzb3Ige1xuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBkb21FbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvciggZG9tRWxlbWVudCApIHtcblxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gdGhlIG91dHB1dCB1dHRlcmFuY2UgZm9yIHRoZSBjdXJzb3IsIHRvIGJlIHJlYWQgYnkgdGhlIHN5bnRoIGFuZCBoYW5kbGVkIGluIHZhcmlvdXMgd2F5c1xuICAgIC8vIGluaXRpYWwgb3V0cHV0IGlzIHRoZSBkb2N1bWVudCB0aXRsZVxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcbiAgICB0aGlzLm91dHB1dFV0dGVyYW5jZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBuZXcgVXR0ZXJhbmNlKCBkb2N1bWVudC50aXRsZSwgJ29mZicgKSApO1xuXG4gICAgLy8gQHByaXZhdGUgLSBhIGxpbmVhciByZXByZXNlbnRhdGlvbiBvZiB0aGUgRE9NIHdoaWNoIGlzIG5hdmlnYXRlZCBieSB0aGUgdXNlclxuICAgIHRoaXMubGluZWFyRE9NID0gdGhpcy5nZXRMaW5lYXJET01FbGVtZW50cyggZG9tRWxlbWVudCApO1xuXG4gICAgLy8gQHByaXZhdGUgLSB0aGUgYWN0aXZlIGVsZW1lbnQgaXMgZWxlbWVudCB0aGF0IGlzIHVuZGVyIG5hdmlnYXRpb24gaW4gdGhlIHBhcmFsbGVsIERPTVxuICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IG51bGw7XG5cbiAgICAvLyBAcHJpdmF0ZSAtIHRoZSBhY3RpdmUgbGluZSBpcyB0aGUgY3VycmVudCBsaW5lIGJlaW5nIHJlYWQgYW5kIG5hdmlnYXRlZCB3aXRoIHRoZSBjdXJzb3JcbiAgICB0aGlzLmFjdGl2ZUxpbmUgPSBudWxsO1xuXG4gICAgLy8gdGhlIGxldHRlciBwb3NpdGlvbiBpcyB0aGUgcG9zaXRpb24gb2YgdGhlIGN1cnNvciBpbiB0aGUgYWN0aXZlIGxpbmUgdG8gc3VwcG9ydCByZWFkaW5nIG9uIGFcbiAgICAvLyBsZXR0ZXIgYnkgbGV0dGVyIGJhc2lzLiAgVGhpcyBpcyByZWxhdGl2ZSB0byB0aGUgbGVuZ3RoIG9mIHRoZSBhY3RpdmUgbGluZS5cbiAgICAvLyBAcHJpdmF0ZVxuICAgIHRoaXMubGV0dGVyUG9zaXRpb24gPSAwO1xuXG4gICAgLy8gdGhlIHBvc2l0aW9uSW5MaW5lIGlzIHRoZSBwb3NpdGlvbiBpbiB3b3JkcyBtYXJraW5nIHRoZSBlbmQgbG9jYXRpb24gb2YgdGhlIGFjdGl2ZSBsaW5lXG4gICAgLy8gdGhpcyBtdXN0IGJlIHRyYWNrZWQgdG8gc3VwcG9ydCBjb250ZW50IGFuZCBkZXNjcmlwdGlvbnMgbG9uZ2VyIHRoYW4gMTUgd29yZHNcbiAgICAvLyBAcHJpdmF0ZVxuICAgIHRoaXMucG9zaXRpb25JbkxpbmUgPSAwO1xuXG4gICAgLy8gdGhlIHBvc2l0aW9uIG9mIHRoZSB3b3JkIGluIHRoZSBhY3RpdmUgbGluZSB0byBzdXBwb3J0IG5hdmlnYXRpb24gb24gYSB3b3JkIGJ5IHdvcmQgYmFzaXNcbiAgICAvLyBAcHJpdmF0ZVxuICAgIHRoaXMud29yZFBvc2l0aW9uID0gMDtcblxuICAgIC8vIHdlIG5lZWQgdG8gdHJhY2sgdGhlIG11dGF0aW9uIG9ic2VydmVycyBzbyB0aGF0IHRoZXkgY2FuIGJlIGRpc2Njb25uZWN0ZWRcbiAgICAvLyBAcHJpdmF0ZVxuICAgIHRoaXMub2JzZXJ2ZXJzID0gW107XG5cbiAgICAvLyB0cmFjayBhIGtleXN0YXRlIGluIG9yZGVyIHRvIGhhbmRsZSB3aGVuIG11bHRpcGxlIGtleSBwcmVzc2VzIGhhcHBlbiBhdCBvbmNlXG4gICAgLy8gQHByaXZhdGVcbiAgICB0aGlzLmtleVN0YXRlID0ge307XG5cbiAgICAvLyB0aGUgZG9jdW1lbnQgd2lsbCBsaXN0ZW4gZm9yIGtleWJvYXJkIGludGVyYWN0aW9uc1xuICAgIC8vIHRoaXMgbGlzdGVuZXIgaW1wbGVtZW50cyBjb21tb24gbmF2aWdhdGlvbiBzdHJhdGVnaWVzIGZvciBhIHR5cGljYWwgc2NyZWVuIHJlYWRlclxuICAgIC8vXG4gICAgLy8gc2VlIGh0dHBzOi8vZGVxdWV1bml2ZXJzaXR5LmNvbS9zY3JlZW5yZWFkZXJzL252ZGEta2V5Ym9hcmQtc2hvcnRjdXRzXG4gICAgLy8gZm9yIGEgbGlzdCBvZiBjb21tb24gbmF2aWdhdGlvbiBzdHJhdGVnaWVzXG4gICAgLy9cbiAgICAvLyBUT0RPOiBVc2UgdGhpcy5rZXlTdGF0ZSBvYmplY3QgaW5zdGVhZCBvZiByZWZlcmVuY2luZyB0aGUgZXZlbnQgZGlyZWN0bHkgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGV2ZW50ID0+IHtcblxuICAgICAgLy8gdXBkYXRlIHRoZSBrZXlzdGF0ZSBvYmplY3RcbiAgICAgIHRoaXMua2V5U3RhdGVbIGV2ZW50LmtleUNvZGUgXSA9IHRydWU7XG5cbiAgICAgIC8vIHN0b3JlIHRoZSBvdXRwdXQgdGV4dCBoZXJlXG4gICAgICBsZXQgb3V0cHV0VGV4dDtcblxuICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHNoaWZ0IGtleSBwcmVzc2VkXG4gICAgICAvLyBUT0RPOiB3ZSBjYW4gb3B0aW9uYWxseSB1c2UgdGhlIGtleVN0YXRlIG9iamVjdCBmb3IgdGhpcyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgY29uc3Qgc2hpZnRLZXlEb3duID0gZXZlbnQuc2hpZnRLZXk7XG5cbiAgICAgIC8vIGRpcmVjdGlvbiB0byBuYXZpZ2F0ZSB0aHJvdWdoIHRoZSBET00gLSB1c3VhbGx5LCBob2xkaW5nIHNoaWZ0IGluZGljYXRlcyB0aGUgdXNlciB3YW50cyB0byB0cmF2ZXJzXG4gICAgICAvLyBiYWNrd2FyZHMgdGhyb3VnaCB0aGUgRE9NXG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBzaGlmdEtleURvd24gPyBQUkVWSU9VUyA6IE5FWFQ7XG5cbiAgICAgIC8vIHRoZSBkb20gY2FuIGNoYW5nZSBhdCBhbnkgdGltZSwgbWFrZSBzdXJlIHRoYXQgd2UgYXJlIHJlYWRpbmcgYSBjb3B5IHRoYXQgaXMgdXAgdG8gZGF0ZVxuICAgICAgdGhpcy5saW5lYXJET00gPSB0aGlzLmdldExpbmVhckRPTUVsZW1lbnRzKCBkb21FbGVtZW50ICk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgbGlzdCBvZiBsaXZlIGVsZW1lbnRzXG4gICAgICB0aGlzLnVwZGF0ZUxpdmVFbGVtZW50TGlzdCgpO1xuXG4gICAgICAvLyBpZiB0aGUgZWxlbWVudCBoYXMgYW4gJ2FwcGxpY2F0aW9uJyBsaWtlIGJlaGF2aW9yLCBrZXlib2FyZCBzaG91bGQgYmUgZnJlZSBmb3IgdGhlIGFwcGxpY2F0aW9uXG4gICAgICAvLyBUT0RPOiBUaGlzIG1heSBiZSBpbnN1ZmZpY2llbnQgaWYgd2UgbmVlZCB0aGUgJ2Fycm93JyBrZXlzIHRvIGNvbnRpbnVlIHRvIHdvcmsgZm9yIGFuIGFwcGxpY2F0aW9uIHJvbGUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGlmICggdGhpcy5hY3RpdmVFbGVtZW50ICYmIHRoaXMuYWN0aXZlRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdyb2xlJyApID09PSAnYXBwbGljYXRpb24nICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIG90aGVyd2lzZSwgaGFuZGxlIGFsbCBrZXkgZXZlbnRzIGhlcmVcbiAgICAgIGlmICggdGhpcy5rZXlTdGF0ZVsgNDAgXSAmJiAhdGhpcy5rZXlTdGF0ZVsgNDUgXSApIHtcbiAgICAgICAgLy8gcmVhZCB0aGUgbmV4dCBsaW5lIG9uICdkb3duIGFycm93J1xuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGluZSggTkVYVCApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMua2V5U3RhdGVbIDM4IF0gJiYgIXRoaXMua2V5U3RhdGVbIDQ1IF0gKSB7XG4gICAgICAgIC8vIHJlYWQgdGhlIHByZXZpb3VzIGxpbmUgb24gJ3VwIGFycm93J1xuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGluZSggUFJFVklPVVMgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyA3MiBdICkge1xuICAgICAgICAvLyByZWFkIHRoZSBwcmV2aW91cyBvciBuZXh0IGhlYWRpbmdzIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBzaGlmdCBrZXkgaXMgcHJlc3NlZFxuICAgICAgICBjb25zdCBoZWFkaW5nTGV2ZWxzID0gWyAnSDEnLCAnSDInLCAnSDMnLCAnSDQnLCAnSDUnLCAnSDYnIF07XG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBoZWFkaW5nTGV2ZWxzLCBkaXJlY3Rpb24gKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyA5IF0gKSB7XG4gICAgICAgIC8vIGxldCB0aGUgYnJvd3NlciBuYXR1cmFsbHkgaGFuZGxlICd0YWInIGZvciBmb3JtcyBlbGVtZW50cyBhbmQgZWxlbWVudHMgd2l0aCBhIHRhYkluZGV4XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgMzkgXSAmJiAhdGhpcy5rZXlTdGF0ZVsgMTcgXSApIHtcbiAgICAgICAgLy8gcmVhZCB0aGUgbmV4dCBjaGFyYWN0ZXIgb2YgdGhlIGFjdGl2ZSBsaW5lIG9uICdyaWdodCBhcnJvdydcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c0NoYXJhY3RlciggTkVYVCApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMua2V5U3RhdGVbIDM3IF0gJiYgIXRoaXMua2V5U3RhdGVbIDE3IF0gKSB7XG4gICAgICAgIC8vIHJlYWQgdGhlIHByZXZpb3VzIGNoYXJhY3RlciBvbiAnbGVmdCBhcnJvdydcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c0NoYXJhY3RlciggUFJFVklPVVMgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyAzNyBdICYmIHRoaXMua2V5U3RhdGVbIDE3IF0gKSB7XG4gICAgICAgIC8vIHJlYWQgdGhlIHByZXZpb3VzIHdvcmQgb24gJ2NvbnRyb2wgKyBsZWZ0IGFycm93J1xuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzV29yZCggUFJFVklPVVMgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyAzOSBdICYmIHRoaXMua2V5U3RhdGVbIDE3IF0gKSB7XG4gICAgICAgIC8vIHJlYWQgdGhlIG5leHQgd29yZCBvbiAnY29udHJvbCArIHJpZ2h0IGFycm93J1xuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzV29yZCggTkVYVCApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMua2V5U3RhdGVbIDQ1IF0gJiYgdGhpcy5rZXlTdGF0ZVsgMzggXSApIHtcbiAgICAgICAgLy8gcmVwZWF0IHRoZSBhY3RpdmUgbGluZSBvbiAnaW5zZXJ0ICsgdXAgYXJyb3cnXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWRBY3RpdmVMaW5lKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNDkgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBoZWFkaW5nIGxldmVsIDEgb24gJzEnXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBbICdIMScgXSwgZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNTAgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBoZWFkaW5nIGxldmVsIDIgb24gJzInXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBbICdIMicgXSwgZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNTEgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBoZWFkaW5nIGxldmVsIDMgb24gJzMnXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBbICdIMycgXSwgZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNTIgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBoZWFkaW5nIGxldmVsIDQgb24gJzQnXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBbICdINCcgXSwgZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNTMgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBoZWFkaW5nIGxldmVsIDUgb24gJzUnXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBbICdINScgXSwgZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNTQgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBoZWFkaW5nIGxldmVsIDYgb24gJzYnXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBbICdINicgXSwgZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNzAgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBmb3JtIGVsZW1lbnQgb24gJ2YnXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNGb3JtRWxlbWVudCggZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNjYgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBidXR0b24gZWxlbWVudCBvbiAnYidcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c0J1dHRvbiggZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNzYgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBsaXN0IG9uICdMJ1xuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGlzdCggZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNzMgXSApIHtcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBsaXN0IGl0ZW0gb24gJ0knXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNMaXN0SXRlbSggZGlyZWN0aW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNDUgXSAmJiB0aGlzLmtleVN0YXRlWyA0MCBdICkge1xuICAgICAgICAvLyByZWFkIGVudGlyZSBkb2N1bWVudCBvbiAnaW5zZXJ0ICsgZG93biBhcnJvdydcbiAgICAgICAgdGhpcy5yZWFkRW50aXJlRG9jdW1lbnQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhlIGFjdGl2ZSBlbGVtZW50IGlzIGZvY3VzYWJsZSwgc2V0IHRoZSBmb2N1cyB0byBpdCBzbyB0aGF0IHRoZSB2aXJ0dWFsIGN1cnNvciBjYW5cbiAgICAgIC8vIGRpcmVjdGx5IGludGVyYWN0IHdpdGggZWxlbWVudHNcbiAgICAgIGlmICggdGhpcy5hY3RpdmVFbGVtZW50ICYmIHRoaXMuaXNGb2N1c2FibGUoIHRoaXMuYWN0aXZlRWxlbWVudCApICkge1xuICAgICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhlIG91dHB1dCB0ZXh0IGlzIGEgc3BhY2UsIHdlIHdhbnQgaXQgdG8gYmUgcmVhZCBhcyAnYmxhbmsnIG9yICdzcGFjZSdcbiAgICAgIGlmICggb3V0cHV0VGV4dCA9PT0gU1BBQ0UgKSB7XG4gICAgICAgIG91dHB1dFRleHQgPSAnc3BhY2UnO1xuICAgICAgfVxuXG4gICAgICBpZiAoIG91dHB1dFRleHQgKSB7XG4gICAgICAgIC8vIGZvciBub3csIGFsbCB1dHRlcmFuY2VzIGFyZSBvZmYgZm9yIGFyaWEtbGl2ZVxuICAgICAgICB0aGlzLm91dHB1dFV0dGVyYW5jZVByb3BlcnR5LnNldCggbmV3IFV0dGVyYW5jZSggb3V0cHV0VGV4dCwgJ29mZicgKSApO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBldmVyeXRoaW5nIGVsc2UgaW4gaHR0cHM6Ly9kZXF1ZXVuaXZlcnNpdHkuY29tL3NjcmVlbnJlYWRlcnMvbnZkYS1rZXlib2FyZC1zaG9ydGN1dHMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcblxuICAgIH0gKTtcblxuICAgIC8vIHVwZGF0ZSB0aGUga2V5c3RhdGUgb2JqZWN0IG9uIGtleXVwIHRvIGhhbmRsZSBtdWx0aXBsZSBrZXkgcHJlc3NlcyBhdCBvbmNlXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgZXZlbnQgPT4ge1xuICAgICAgdGhpcy5rZXlTdGF0ZVsgZXZlbnQua2V5Q29kZSBdID0gZmFsc2U7XG4gICAgfSApO1xuXG4gICAgLy8gbGlzdGVuIGZvciB3aGVuIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gcmVjZWl2ZSBmb2N1c1xuICAgIC8vIHdlIGFyZSB1c2luZyBmb2N1c2luIChhbmQgbm90IGZvY3VzKSBiZWNhdXNlIHdlIHdhbnQgdGhlIGV2ZW50IHRvIGJ1YmJsZSB1cCB0aGUgZG9jdW1lbnRcbiAgICAvLyB0aGlzIHdpbGwgaGFuZGxlIGJvdGggdGFiIG5hdmlnYXRpb24gQU5EIHByb2dyYW1hdGljIGZvY3VzIGJ5IHRoZSBzaW11bGF0aW9uXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2ZvY3VzaW4nLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cbiAgICAgIC8vIGFub3VuY2UgdGhlIG5ldyBmb2N1cyBpZiBpdCBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgYWN0aXZlIGVsZW1lbnRcbiAgICAgIGlmICggZXZlbnQudGFyZ2V0ICE9PSBzZWxmLmFjdGl2ZUVsZW1lbnQgKSB7XG4gICAgICAgIHNlbGYuYWN0aXZlRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgICAvLyBzbyByZWFkIG91dCBhbGwgY29udGVudCBmcm9tIGFyaWEgbWFya3VwIHNpbmNlIGZvY3VzIG1vdmVkIHZpYSBhcHBsaWNhdGlvbiBiZWhhdmlvclxuICAgICAgICBjb25zdCB3aXRoQXBwbGljYXRpb25Db250ZW50ID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qgb3V0cHV0VGV4dCA9IHNlbGYuZ2V0QWNjZXNzaWJsZVRleHQoIHRoaXMuYWN0aXZlRWxlbWVudCwgd2l0aEFwcGxpY2F0aW9uQ29udGVudCApO1xuXG4gICAgICAgIGlmICggb3V0cHV0VGV4dCApIHtcbiAgICAgICAgICBjb25zdCBsaXZlUm9sZSA9IHNlbGYuYWN0aXZlRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxpdmUnICk7XG4gICAgICAgICAgc2VsZi5vdXRwdXRVdHRlcmFuY2VQcm9wZXJ0eS5zZXQoIG5ldyBVdHRlcmFuY2UoIG91dHB1dFRleHQsIGxpdmVSb2xlICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsICdlbGVtZW50JyBub2RlcyBvZmYgdGhlIHBhcmVudCBlbGVtZW50LCBwbGFjaW5nIHRoZW0gaW4gYW4gYXJyYXlcbiAgICogZm9yIGVhc3kgdHJhdmVyc2FsLiAgTm90ZSB0aGF0IHRoaXMgaW5jbHVkZXMgYWxsIGVsZW1lbnRzLCBldmVuIHRob3NlXG4gICAqIHRoYXQgYXJlICdoaWRkZW4nIG9yIHB1cmVseSBmb3Igc3RydWN0dXJlLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZG9tRWxlbWVudCAtIHRoZSBwYXJlbnQgZWxlbWVudCB0byBsaW5lYXJpemVcbiAgICogQHJldHVybnMge0FycmF5LjxIVE1MRWxlbWVudD59XG4gICAqL1xuICBnZXRMaW5lYXJET01FbGVtZW50cyggZG9tRWxlbWVudCApIHtcbiAgICAvLyBnZXRzIEFMTCBkZXNjZW5kZW50IGNoaWxkcmVuIGZvciB0aGUgZWxlbWVudFxuICAgIGNvbnN0IGNoaWxkcmVuID0gZG9tRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJyonICk7XG5cbiAgICBjb25zdCBsaW5lYXJET00gPSBbXTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggY2hpbGRyZW5bIGkgXS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUgKSB7XG4gICAgICAgIGxpbmVhckRPTVsgaSBdID0gKCBjaGlsZHJlblsgaSBdICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lYXJET007XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsaXZlIHJvbGUgZnJvbSB0aGUgRE9NIGVsZW1lbnQuICBJZiB0aGUgZWxlbWVudCBpcyBub3QgbGl2ZSwgcmV0dXJuIG51bGwuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRvbUVsZW1lbnRcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldExpdmVSb2xlKCBkb21FbGVtZW50ICkge1xuICAgIGxldCBsaXZlUm9sZSA9IG51bGw7XG5cbiAgICAvLyBjb2xsZWN0aW9uIG9mIGFsbCByb2xlcyB0aGF0IGNhbiBwcm9kdWNlICdsaXZlIHJlZ2lvbicgYmVoYXZpb3JcbiAgICAvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQWNjZXNzaWJpbGl0eS9BUklBL0FSSUFfTGl2ZV9SZWdpb25zXG4gICAgY29uc3Qgcm9sZXMgPSBbICdsb2cnLCAnc3RhdHVzJywgJ2FsZXJ0JywgJ3Byb2dyZXNzYmFyJywgJ21hcnF1ZWUnLCAndGltZXInLCAnYXNzZXJ0aXZlJywgJ3BvbGl0ZScgXTtcblxuICAgIHJvbGVzLmZvckVhY2goIHJvbGUgPT4ge1xuICAgICAgaWYgKCBkb21FbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtbGl2ZScgKSA9PT0gcm9sZSB8fCBkb21FbGVtZW50LmdldEF0dHJpYnV0ZSggJ3JvbGUnICkgPT09IHJvbGUgKSB7XG4gICAgICAgIGxpdmVSb2xlID0gcm9sZTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICByZXR1cm4gbGl2ZVJvbGU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBuZXh0IG9yIHByZXZpb3VzIGVsZW1lbnQgaW4gdGhlIERPTSwgZGVwZW5kaW5nIG9uIHRoZSBkZXNpcmVkIGRpcmVjdGlvbi5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtbdHlwZV19IGRpcmVjdGlvbiAtIE5FWFQgfHwgUFJFVklPVVNcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICAgKi9cbiAgZ2V0TmV4dFByZXZpb3VzRWxlbWVudCggZGlyZWN0aW9uICkge1xuICAgIGlmICggIXRoaXMuYWN0aXZlRWxlbWVudCApIHtcbiAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IHRoaXMubGluZWFyRE9NWyAwIF07XG4gICAgfVxuXG4gICAgY29uc3Qgc2VhcmNoRGVsdGEgPSBkaXJlY3Rpb24gPT09ICdORVhUJyA/IDEgOiAtMTtcbiAgICBjb25zdCBhY3RpdmVJbmRleCA9IHRoaXMubGluZWFyRE9NLmluZGV4T2YoIHRoaXMuYWN0aXZlRWxlbWVudCApO1xuXG4gICAgY29uc3QgbmV4dEluZGV4ID0gYWN0aXZlSW5kZXggKyBzZWFyY2hEZWx0YTtcbiAgICByZXR1cm4gdGhpcy5saW5lYXJET01bIG5leHRJbmRleCBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGFiZWwgZm9yIGEgcGFydGljdWxhciBpZFxuICAgKiBAcHJpdmF0ZVxuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gICAqL1xuICBnZXRMYWJlbCggaWQgKSB7XG4gICAgY29uc3QgbGFiZWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoICdsYWJlbCcgKTtcblxuICAgIC8vIGxvb3AgdGhyb3VnaCBOb2RlTGlzdFxuICAgIGxldCBsYWJlbFdpdGhJZDtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKCBsYWJlbHMsIGxhYmVsID0+IHtcbiAgICAgIGlmICggbGFiZWwuZ2V0QXR0cmlidXRlKCAnZm9yJyApICkge1xuICAgICAgICBsYWJlbFdpdGhJZCA9IGxhYmVsO1xuICAgICAgfVxuICAgIH0gKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsYWJlbFdpdGhJZCwgJ05vIGxhYmVsIGZvdW5kIGZvciBpZCcgKTtcblxuICAgIHJldHVybiBsYWJlbFdpdGhJZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGFjY2Vzc2libGUgdGV4dCBmcm9tIHRoZSBlbGVtZW50LiAgRGVwZW5kaW5nIG9uIHRoZSBuYXZpZ2F0aW9uIHN0cmF0ZWd5LFxuICAgKiB3ZSBtYXkgb3IgbWF5IG5vdCB3YW50IHRvIGluY2x1ZGUgYWxsIGFwcGxpY2F0aW9uIGNvbnRlbnQgdGV4dCBmcm9tIHRoZSBtYXJrdXAuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtib29sZWFufSB3aXRoQXBwbGljYXRpb25Db250ZW50IC0gZG8geW91IHdhbnQgdG8gaW5jbHVkZSBhbGwgYXJpYSB0ZXh0IGNvbnRlbnQ/XG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBnZXRBY2Nlc3NpYmxlVGV4dCggZWxlbWVudCwgd2l0aEFwcGxpY2F0aW9uQ29udGVudCApIHtcblxuICAgIC8vIHBsYWNlaG9sZGVyIGZvciB0aGUgdGV4dCBjb250ZW50IHRoYXQgd2Ugd2lsbCBidWlsZCB1cCBmcm9tIHRoZSBtYXJrdXBcbiAgICBsZXQgdGV4dENvbnRlbnQgPSAnJztcblxuICAgIC8vIGlmIHRoZSBlbGVtZW50IGlzIHVuZGVmaW5lZCwgd2UgaGF2ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGRvY3VtZW50XG4gICAgaWYgKCAhZWxlbWVudCApIHtcbiAgICAgIHJldHVybiBFTkRfT0ZfRE9DVU1FTlQ7XG4gICAgfVxuXG4gICAgLy8gZmlsdGVyIG91dCBzdHJ1Y3R1cmFsIGVsZW1lbnRzIHRoYXQgZG8gbm90IGhhdmUgYWNjZXNzaWJsZSB0ZXh0XG4gICAgaWYgKCBlbGVtZW50LmdldEF0dHJpYnV0ZSggJ2NsYXNzJyApID09PSAnU2NyZWVuVmlldycgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdIRUFERVInICkge1xuICAgICAgLy8gVE9ETzogSGVhZGVycyBzaG91bGQgaGF2ZSBzb21lIGJlaGF2aW9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdTRUNUSU9OJyApIHtcbiAgICAgIC8vIFRPRE86IFdoYXQgZG8geW91IHdlIGRvIGZvciBzZWN0aW9ucz8gUmVhZCBzZWN0aW9uICsgYXJpYS1sYWJlbGxlZGJ5PyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnTEFCRUwnICkge1xuICAgICAgLy8gbGFiZWwgY29udGVudCBpcyBhZGRlZCBsaWtlICdhcmlhLWRlc2NyaWJlZGJ5JywgZG8gbm90IHJlYWQgdGhpcyB5ZXRcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIHNlYXJjaCB1cCB0aHJvdWdoIHRoZSBhbmNlc3RvcnMgdG8gc2VlIGlmIHRoaXMgZWxlbWVudCBzaG91bGQgYmUgaGlkZGVuXG4gICAgbGV0IGNoaWxkRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgd2hpbGUgKCBjaGlsZEVsZW1lbnQucGFyZW50RWxlbWVudCApIHtcbiAgICAgIGlmICggY2hpbGRFbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtaGlkZGVuJyApIHx8IGNoaWxkRWxlbWVudC5oaWRkZW4gKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSB7IGNoaWxkRWxlbWVudCA9IGNoaWxkRWxlbWVudC5wYXJlbnRFbGVtZW50OyB9XG4gICAgfVxuXG4gICAgLy8gc2VhcmNoIGZvciBlbGVtZW50cyB0aGF0IHdpbGwgaGF2ZSBjb250ZW50IGFuZCBzaG91bGQgYmUgcmVhZFxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnUCcgKSB7XG4gICAgICB0ZXh0Q29udGVudCArPSBlbGVtZW50LnRleHRDb250ZW50O1xuICAgIH1cbiAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ0gxJyApIHtcbiAgICAgIHRleHRDb250ZW50ICs9IGBIZWFkaW5nIExldmVsIDEsICR7ZWxlbWVudC50ZXh0Q29udGVudH1gO1xuICAgIH1cbiAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ0gyJyApIHtcbiAgICAgIHRleHRDb250ZW50ICs9IGBIZWFkaW5nIExldmVsIDIsICR7ZWxlbWVudC50ZXh0Q29udGVudH1gO1xuICAgIH1cbiAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ0gzJyApIHtcbiAgICAgIHRleHRDb250ZW50ICs9IGBIZWFkaW5nIExldmVsIDMsICR7ZWxlbWVudC50ZXh0Q29udGVudH1gO1xuICAgIH1cbiAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ1VMJyApIHtcbiAgICAgIGNvbnN0IGxpc3RMZW5ndGggPSBlbGVtZW50LmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgIHRleHRDb250ZW50ICs9IGBMaXN0IHdpdGggJHtsaXN0TGVuZ3RofSBpdGVtc2A7XG4gICAgfVxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnTEknICkge1xuICAgICAgdGV4dENvbnRlbnQgKz0gYExpc3QgSXRlbTogJHtlbGVtZW50LnRleHRDb250ZW50fWA7XG4gICAgfVxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnQlVUVE9OJyApIHtcbiAgICAgIGNvbnN0IGJ1dHRvbkxhYmVsID0gJyBCdXR0b24nO1xuICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgYSAndG9nZ2xlJyBidXR0b24gd2l0aCB0aGUgJ2FyaWEtcHJlc3NlZCcgYXR0cmlidXRlXG4gICAgICBpZiAoIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1wcmVzc2VkJyApICkge1xuICAgICAgICBsZXQgdG9nZ2xlTGFiZWwgPSAnIHRvZ2dsZSc7XG4gICAgICAgIGNvbnN0IHByZXNzZWRMYWJlbCA9ICcgcHJlc3NlZCc7XG4gICAgICAgIGNvbnN0IG5vdExhYmVsID0gJyBub3QnO1xuXG4gICAgICAgIC8vIGluc2VydCBhIGNvbW1hIGZvciByZWFkaWJpbGl0eSBvZiB0aGUgc3ludGhcbiAgICAgICAgdG9nZ2xlTGFiZWwgKz0gYnV0dG9uTGFiZWwgKyBDT01NQTtcbiAgICAgICAgaWYgKCBlbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtcHJlc3NlZCcgKSA9PT0gJ3RydWUnICkge1xuICAgICAgICAgIHRvZ2dsZUxhYmVsICs9IHByZXNzZWRMYWJlbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0b2dnbGVMYWJlbCArPSBub3RMYWJlbCArIHByZXNzZWRMYWJlbDtcbiAgICAgICAgfVxuICAgICAgICB0ZXh0Q29udGVudCArPSBlbGVtZW50LnRleHRDb250ZW50ICsgQ09NTUEgKyB0b2dnbGVMYWJlbDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0ZXh0Q29udGVudCArPSBlbGVtZW50LnRleHRDb250ZW50ICsgYnV0dG9uTGFiZWw7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnSU5QVVQnICkge1xuICAgICAgaWYgKCBlbGVtZW50LnR5cGUgPT09ICdyZXNldCcgKSB7XG4gICAgICAgIHRleHRDb250ZW50ICs9IGAke2VsZW1lbnQuZ2V0QXR0cmlidXRlKCAndmFsdWUnICl9IEJ1dHRvbmA7XG4gICAgICB9XG4gICAgICBpZiAoIGVsZW1lbnQudHlwZSA9PT0gJ2NoZWNrYm94JyApIHtcbiAgICAgICAgLy8gdGhlIGNoZWNrYm94IHNob3VsZCBoYXZlIGEgbGFiZWwgLSBmaW5kIHRoZSBjb3JyZWN0IG9uZVxuICAgICAgICBjb25zdCBjaGVja2JveExhYmVsID0gdGhpcy5nZXRMYWJlbCggZWxlbWVudC5pZCApO1xuICAgICAgICBjb25zdCBsYWJlbENvbnRlbnQgPSBjaGVja2JveExhYmVsLnRleHRDb250ZW50O1xuXG4gICAgICAgIC8vIGRlc2NyaWJlIGFzIGEgc3dpdGNoIGlmIGl0IGhhcyB0aGUgcm9sZVxuICAgICAgICBpZiAoIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAncm9sZScgKSA9PT0gJ3N3aXRjaCcgKSB7XG4gICAgICAgICAgLy8gcmVxdWlyZWQgZm9yIGEgY2hlY2tib3hcbiAgICAgICAgICBjb25zdCBhcmlhQ2hlY2tlZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1jaGVja2VkJyApO1xuICAgICAgICAgIGlmICggYXJpYUNoZWNrZWQgKSB7XG4gICAgICAgICAgICBjb25zdCBzd2l0Y2hlZFN0cmluZyA9ICggYXJpYUNoZWNrZWQgPT09ICd0cnVlJyApID8gJ09uJyA6ICdPZmYnO1xuICAgICAgICAgICAgdGV4dENvbnRlbnQgKz0gYCR7bGFiZWxDb250ZW50ICsgQ09NTUEgKyBTUEFDRX1zd2l0Y2gke0NPTU1BfSR7U1BBQ0V9JHtzd2l0Y2hlZFN0cmluZ31gO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnY2hlY2tib3ggc3dpdGNoIG11c3QgaGF2ZSBhcmlhLWNoZWNrZWQgYXR0cmlidXRlJyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjaGVja2VkU3RyaW5nID0gZWxlbWVudC5jaGVja2VkID8gJyBDaGVja2VkJyA6ICcgTm90IENoZWNrZWQnO1xuICAgICAgICAgIHRleHRDb250ZW50ICs9IGAke2VsZW1lbnQudGV4dENvbnRlbnR9IENoZWNrYm94JHtjaGVja2VkU3RyaW5nfWA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB3ZSBhcmUgaW4gYW4gJ2FwcGxpY2F0aW9uJyBzdHlsZSBvZiBuYXZpZ2F0aW9uLCB3ZSB3YW50IHRvIGFkZCBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4gICAgLy8gZnJvbSB0aGUgbWFya3VwXG4gICAgLy8gT3JkZXIgb2YgYWRkaXRpb25zIHRvIHRleHRDb250ZW50IGlzIGltcG9ydGFudCwgYW5kIGlzIGRlc2lnbmVkIHRvIG1ha2Ugc2Vuc2VcbiAgICAvLyB3aGVuIHRleHRDb250ZW50IGlzIHJlYWQgY29udGludW91c2x5XG4gICAgLy8gVE9ETzogc3VwcG9ydCBtb3JlIG1hcmt1cCEgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBpZiAoIHdpdGhBcHBsaWNhdGlvbkNvbnRlbnQgKSB7XG5cbiAgICAgIC8vIGluc2VydCBhIGNvbW1hIGF0IHRoZSBlbmQgb2YgdGhlIGNvbnRlbnQgdG8gZW5oYW5jZSB0aGUgb3V0cHV0IG9mIHRoZSBzeW50aFxuICAgICAgaWYgKCB0ZXh0Q29udGVudC5sZW5ndGggPiAwICkge1xuICAgICAgICB0ZXh0Q29udGVudCArPSBDT01NQTtcbiAgICAgIH1cblxuICAgICAgLy8gbG9vayBmb3IgYW4gYXJpYS1sYWJlbFxuICAgICAgY29uc3QgYXJpYUxhYmVsID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApO1xuICAgICAgaWYgKCBhcmlhTGFiZWwgKSB7XG4gICAgICAgIHRleHRDb250ZW50ICs9IFNQQUNFICsgYXJpYUxhYmVsICsgQ09NTUE7XG4gICAgICB9XG5cbiAgICAgIC8vIGxvb2sgZm9yIGFuIGFyaWEtbGFiZWxsZWRCeSBhdHRyaWJ1dGUgdG8gc2VlIGlmIHRoZXJlIGlzIGFub3RoZXIgZWxlbWVudCBpbiB0aGUgRE9NIHRoYXRcbiAgICAgIC8vIGRlc2NyaWJlcyB0aGlzIG9uZVxuICAgICAgY29uc3QgYXJpYUxhYmVsbGVkQnlJZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZEJ5JyApO1xuICAgICAgaWYgKCBhcmlhTGFiZWxsZWRCeUlkICkge1xuXG4gICAgICAgIGNvbnN0IGFyaWFMYWJlbGxlZEJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGFyaWFMYWJlbGxlZEJ5SWQgKTtcbiAgICAgICAgY29uc3QgYXJpYUxhYmVsbGVkQnlUZXh0ID0gYXJpYUxhYmVsbGVkQnkudGV4dENvbnRlbnQ7XG5cbiAgICAgICAgdGV4dENvbnRlbnQgKz0gU1BBQ0UgKyBhcmlhTGFiZWxsZWRCeVRleHQgKyBDT01NQTtcbiAgICAgIH1cblxuICAgICAgLy8gc2VhcmNoIHVwIHRocm91Z2ggdGhlIGFuY2VzdG9ycyB0byBmaW5kIGlmIHRoZSBlbGVtZW50IGhhcyAnYXBwbGljYXRpb24nIG9yICdkb2N1bWVudCcgY29udGVudFxuICAgICAgLy8gVE9ETzogRmFjdG9yIG91dCBpbnRvIGEgc2VhcmNoVXAgdHlwZSBvZiBmdW5jdGlvbi4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGNoaWxkRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICBsZXQgcm9sZTtcbiAgICAgIHdoaWxlICggY2hpbGRFbGVtZW50LnBhcmVudEVsZW1lbnQgKSB7XG4gICAgICAgIHJvbGUgPSBjaGlsZEVsZW1lbnQuZ2V0QXR0cmlidXRlKCAncm9sZScgKTtcbiAgICAgICAgaWYgKCByb2xlID09PSAnZG9jdW1lbnQnIHx8IHJvbGUgPT09ICdhcHBsaWNhdGlvbicgKSB7XG4gICAgICAgICAgdGV4dENvbnRlbnQgKz0gU1BBQ0UgKyByb2xlICsgQ09NTUE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IGNoaWxkRWxlbWVudCA9IGNoaWxkRWxlbWVudC5wYXJlbnRFbGVtZW50OyB9XG4gICAgICB9XG5cbiAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGVsZW1lbnQgaGFzIGFuIGFyaWEtcm9sZVxuICAgICAgaWYgKCBlbGVtZW50LmdldEF0dHJpYnV0ZSggJ3JvbGUnICkgKSB7XG4gICAgICAgIHJvbGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSggJ3JvbGUnICk7XG4gICAgICAgIC8vIFRPRE8gaGFuZGxlIGFsbCB0aGUgZGlmZmVyZW50IHJvbGVzISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuXG4gICAgICAgIC8vIGxhYmVsIGlmIHRoZSByb2xlIGlzIGEgYnV0dG9uXG4gICAgICAgIGlmICggcm9sZSA9PT0gJ2J1dHRvbicgKSB7XG4gICAgICAgICAgdGV4dENvbnRlbnQgKz0gYCR7U1BBQ0V9QnV0dG9uYDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhpcyBlbGVtZW50IGlzIGRyYWdnYWJsZVxuICAgICAgaWYgKCBlbGVtZW50LmRyYWdnYWJsZSApIHtcbiAgICAgICAgdGV4dENvbnRlbnQgKz0gYCR7U1BBQ0V9ZHJhZ2dhYmxlJHtDT01NQX1gO1xuICAgICAgfVxuXG4gICAgICAvLyBsb29rIGZvciBhcmlhLWdyYWJiZWQgbWFya3VwIHRvIGxldCB0aGUgdXNlciBrbm93IGlmIHRoZSBlbGVtZW50IGlzIGdyYWJiZWRcbiAgICAgIGlmICggZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWdyYWJiZWQnICkgPT09ICd0cnVlJyApIHtcbiAgICAgICAgdGV4dENvbnRlbnQgKz0gYCR7U1BBQ0V9Z3JhYmJlZCR7Q09NTUF9YDtcbiAgICAgIH1cblxuICAgICAgLy8gbG9vayBmb3IgYW4gZWxlbWVudCBpbiB0aGUgRE9NIHRoYXQgZGVzY3JpYmVzIHRoaXMgb25lXG4gICAgICBjb25zdCBhcmlhRGVzY3JpYmVkQnkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtZGVzY3JpYmVkYnknICk7XG4gICAgICBpZiAoIGFyaWFEZXNjcmliZWRCeSApIHtcbiAgICAgICAgLy8gdGhlIGFyaWEgc3BlYyBzdXBwb3J0cyBtdWx0aXBsZSBkZXNjcmlwdGlvbiBJRCdzIGZvciBhIHNpbmdsZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uSURzID0gYXJpYURlc2NyaWJlZEJ5LnNwbGl0KCBTUEFDRSApO1xuXG4gICAgICAgIGxldCBkZXNjcmlwdGlvbkVsZW1lbnQ7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvblRleHQ7XG4gICAgICAgIGRlc2NyaXB0aW9uSURzLmZvckVhY2goIGRlc2NyaXB0aW9uSUQgPT4ge1xuICAgICAgICAgIGRlc2NyaXB0aW9uRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBkZXNjcmlwdGlvbklEICk7XG4gICAgICAgICAgZGVzY3JpcHRpb25UZXh0ID0gZGVzY3JpcHRpb25FbGVtZW50LnRleHRDb250ZW50O1xuXG4gICAgICAgICAgdGV4dENvbnRlbnQgKz0gU1BBQ0UgKyBkZXNjcmlwdGlvblRleHQ7XG4gICAgICAgIH0gKTtcblxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRlbGV0ZSB0aGUgdHJhaWxpbmcgY29tbWEgaWYgaXQgZXhpc3RzIGF0IHRoZSBlbmQgb2YgdGhlIHRleHRDb250ZW50XG4gICAgaWYgKCB0ZXh0Q29udGVudFsgdGV4dENvbnRlbnQubGVuZ3RoIC0gMSBdID09PSAnLCcgKSB7XG4gICAgICB0ZXh0Q29udGVudCA9IHRleHRDb250ZW50LnNsaWNlKCAwLCAtMSApO1xuICAgIH1cblxuICAgIHJldHVybiB0ZXh0Q29udGVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5leHQgb3IgcHJldmlvdXMgZWxlbWVudCBpbiB0aGUgRE9NIHRoYXQgaGFzIGFjY2Vzc2libGUgdGV4dCBjb250ZW50LCByZWxhdGl2ZSB0byB0aGUgY3VycmVudFxuICAgKiBhY3RpdmUgZWxlbWVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSBkaXJlY3Rpb24gLSBORVhUIHx8IFBSRVZJT1VTXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAgICovXG4gIGdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUERPTUNvbnRlbnQoIGRpcmVjdGlvbiApIHtcbiAgICBsZXQgcGRvbUNvbnRlbnQ7XG4gICAgd2hpbGUgKCAhcGRvbUNvbnRlbnQgKSB7XG4gICAgICAvLyBzZXQgdGhlIHNlbGVjdGVkIGVsZW1lbnQgdG8gdGhlIG5leHQgZWxlbWVudCBpbiB0aGUgRE9NXG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSB0aGlzLmdldE5leHRQcmV2aW91c0VsZW1lbnQoIGRpcmVjdGlvbiApO1xuICAgICAgcGRvbUNvbnRlbnQgPSB0aGlzLmdldEFjY2Vzc2libGVUZXh0KCB0aGlzLmFjdGl2ZUVsZW1lbnQsIGZhbHNlICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlRWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5leHQgZWxlbWVudCBpbiB0aGUgRE9NIHdpdGggb24gb2YgdGhlIGRlc2lyZWQgdGFnTmFtZXMsIHR5cGVzLCBvciByb2xlcy4gIFRoaXMgZG9lcyBub3Qgc2V0IHRoZSBhY3RpdmUgZWxlbWVudCwgaXRcbiAgICogb25seSB0cmF2ZXJzZXMgdGhlIGRvY3VtZW50IGxvb2tpbmcgZm9yIGVsZW1lbnRzLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtBcnJheS48c3RyaW5nPn0gcm9sZXMgLSBsaXN0IG9mIGRlc2lyZWQgRE9NIHRhZyBuYW1lcywgdHlwZXMsIG9yIGFyaWEgcm9sZXNcbiAgICogQHBhcmFtICB7W3R5cGVdfSBkaXJlY3Rpb24gLSBkaXJlY3Rpb24gZmxhZyBmb3IgdG8gc2VhcmNoIHRocm91Z2ggdGhlIERPTSAtIE5FWFQgfHwgUFJFVklPVVNcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICAgKi9cbiAgZ2V0TmV4dFByZXZpb3VzRWxlbWVudFdpdGhSb2xlKCByb2xlcywgZGlyZWN0aW9uICkge1xuXG4gICAgbGV0IGVsZW1lbnQgPSBudWxsO1xuICAgIGNvbnN0IHNlYXJjaERlbHRhID0gKCBkaXJlY3Rpb24gPT09IE5FWFQgKSA/IDEgOiAtMTtcblxuICAgIC8vIGlmIHRoZXJlIGlzIG5vdCBhbiBhY3RpdmUgZWxlbWVudCwgdXNlIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBET00uXG4gICAgaWYgKCAhdGhpcy5hY3RpdmVFbGVtZW50ICkge1xuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gdGhpcy5saW5lYXJET01bIDAgXTtcbiAgICB9XG5cbiAgICAvLyBzdGFydCBzZWFyY2ggZnJvbSB0aGUgbmV4dCBvciBwcmV2aW91cyBlbGVtZW50IGFuZCBzZXQgdXAgdGhlIHRyYXZlcnNhbCBjb25kaXRpb25zXG4gICAgbGV0IHNlYXJjaEluZGV4ID0gdGhpcy5saW5lYXJET00uaW5kZXhPZiggdGhpcy5hY3RpdmVFbGVtZW50ICkgKyBzZWFyY2hEZWx0YTtcbiAgICB3aGlsZSAoIHRoaXMubGluZWFyRE9NWyBzZWFyY2hJbmRleCBdICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgcm9sZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRUYWcgPSB0aGlzLmxpbmVhckRPTVsgc2VhcmNoSW5kZXggXS50YWdOYW1lO1xuICAgICAgICBjb25zdCBlbGVtZW50VHlwZSA9IHRoaXMubGluZWFyRE9NWyBzZWFyY2hJbmRleCBdLnR5cGU7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRSb2xlID0gdGhpcy5saW5lYXJET01bIHNlYXJjaEluZGV4IF0uZ2V0QXR0cmlidXRlKCAncm9sZScgKTtcbiAgICAgICAgY29uc3Qgc2VhcmNoUm9sZSA9IHJvbGVzWyBqIF07XG4gICAgICAgIGlmICggZWxlbWVudFRhZyA9PT0gc2VhcmNoUm9sZSB8fCBlbGVtZW50Um9sZSA9PT0gc2VhcmNoUm9sZSB8fCBlbGVtZW50VHlwZSA9PT0gc2VhcmNoUm9sZSApIHtcbiAgICAgICAgICBlbGVtZW50ID0gdGhpcy5saW5lYXJET01bIHNlYXJjaEluZGV4IF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICggZWxlbWVudCApIHtcbiAgICAgICAgLy8gd2UgaGF2ZSBhbHJlYWQgZm91bmQgYW4gZWxlbWVudCwgYnJlYWsgb3V0XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgc2VhcmNoSW5kZXggKz0gc2VhcmNoRGVsdGE7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvblxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgcmVhZE5leHRQcmV2aW91c0xpbmUoIGRpcmVjdGlvbiApIHtcbiAgICBsZXQgbGluZSA9ICcnO1xuXG4gICAgLy8gcmVzZXQgdGhlIGNvbnRlbnQgbGV0dGVyIGFuZCB3b3JkIHBvc2l0aW9ucyBiZWNhdXNlIHdlIGFyZSByZWFkaW5nIGEgbmV3IGxpbmVcbiAgICB0aGlzLmxldHRlclBvc2l0aW9uID0gMDtcbiAgICB0aGlzLndvcmRQb3NpdGlvbiA9IDA7XG5cbiAgICAvLyBpZiB0aGVyZSBpcyBubyBhY3RpdmUgZWxlbWVudCwgc2V0IHRvIHRoZSBuZXh0IGVsZW1lbnQgd2l0aCBhY2Nlc3NpYmxlIGNvbnRlbnRcbiAgICBpZiAoICF0aGlzLmFjdGl2ZUVsZW1lbnQgKSB7XG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSB0aGlzLmdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUERPTUNvbnRlbnQoIGRpcmVjdGlvbiApO1xuICAgIH1cblxuICAgIC8vIGdldCB0aGUgYWNjZXNzaWJsZSBjb250ZW50IGZvciB0aGUgYWN0aXZlIGVsZW1lbnQsIHdpdGhvdXQgYW55ICdhcHBsaWNhdGlvbicgY29udGVudCwgYW5kIHNwbGl0IGludG8gd29yZHNcbiAgICBsZXQgYWNjZXNzaWJsZVRleHQgPSB0aGlzLmdldEFjY2Vzc2libGVUZXh0KCB0aGlzLmFjdGl2ZUVsZW1lbnQsIGZhbHNlICkuc3BsaXQoIFNQQUNFICk7XG5cbiAgICAvLyBpZiB0cmF2ZXJzaW5nIGJhY2t3YXJkcywgcG9zaXRpb24gaW4gbGluZSBuZWVkcyBiZSBhdCB0aGUgc3RhcnQgb2YgcHJldmlvdXMgbGluZVxuICAgIGlmICggZGlyZWN0aW9uID09PSBQUkVWSU9VUyApIHtcbiAgICAgIHRoaXMucG9zaXRpb25JbkxpbmUgPSB0aGlzLnBvc2l0aW9uSW5MaW5lIC0gMiAqIExJTkVfV09SRF9MRU5HVEg7XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gY29udGVudCBhdCB0aGUgbGluZSBwb3NpdGlvbiwgaXQgaXMgdGltZSB0byBmaW5kIHRoZSBuZXh0IGVsZW1lbnRcbiAgICBpZiAoICFhY2Nlc3NpYmxlVGV4dFsgdGhpcy5wb3NpdGlvbkluTGluZSBdICkge1xuICAgICAgLy8gcmVzZXQgdGhlIHBvc2l0aW9uIGluIHRoZSBsaW5lXG4gICAgICB0aGlzLnBvc2l0aW9uSW5MaW5lID0gMDtcblxuICAgICAgLy8gc2F2ZSB0aGUgYWN0aXZlIGVsZW1lbnQgaW4gY2FzZSBpdCBuZWVkcyB0byBiZSByZXN0b3JlZFxuICAgICAgY29uc3QgcHJldmlvdXNFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAvLyB1cGRhdGUgdGhlIGFjdGl2ZSBlbGVtZW50IGFuZCBzZXQgdGhlIGFjY2Vzc2libGUgY29udGVudCBmcm9tIHRoaXMgZWxlbWVudFxuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gdGhpcy5nZXROZXh0UHJldmlvdXNFbGVtZW50V2l0aFBET01Db250ZW50KCBkaXJlY3Rpb24gKTtcblxuICAgICAgYWNjZXNzaWJsZVRleHQgPSB0aGlzLmdldEFjY2Vzc2libGVUZXh0KCB0aGlzLmFjdGl2ZUVsZW1lbnQsIGZhbHNlICkuc3BsaXQoICcgJyApO1xuXG4gICAgICAvLyByZXN0b3JlIHRoZSBwcmV2aW91cyBhY3RpdmUgZWxlbWVudCBpZiB3ZSBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgZG9jdW1lbnRcbiAgICAgIGlmICggIXRoaXMuYWN0aXZlRWxlbWVudCApIHtcbiAgICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gcHJldmlvdXNFbGVtZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlYWQgdGhlIG5leHQgbGluZSBvZiB0aGUgYWNjZXNzaWJsZSBjb250ZW50XG4gICAgY29uc3QgbGluZUxpbWl0ID0gdGhpcy5wb3NpdGlvbkluTGluZSArIExJTkVfV09SRF9MRU5HVEg7XG4gICAgZm9yICggbGV0IGkgPSB0aGlzLnBvc2l0aW9uSW5MaW5lOyBpIDwgbGluZUxpbWl0OyBpKysgKSB7XG4gICAgICBpZiAoIGFjY2Vzc2libGVUZXh0WyBpIF0gKSB7XG4gICAgICAgIGxpbmUgKz0gYWNjZXNzaWJsZVRleHRbIGkgXTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbkluTGluZSArPSAxO1xuXG4gICAgICAgIGlmICggYWNjZXNzaWJsZVRleHRbIGkgKyAxIF0gKSB7XG4gICAgICAgICAgbGluZSArPSBTUEFDRTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyB3ZSBoYXZlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGlzIGNvbnRlbnQsIHRoZXJlIGFyZSBubyBtb3JlIHdvcmRzXG4gICAgICAgICAgLy8gd3JhcCB0aGUgbGluZSBwb3NpdGlvbiB0byB0aGUgZW5kIHNvIHdlIGNhbiBlYXNpbHkgcmVhZCBiYWNrIHRoZSBwcmV2aW91cyBsaW5lXG4gICAgICAgICAgdGhpcy5wb3NpdGlvbkluTGluZSArPSBMSU5FX1dPUkRfTEVOR1RIIC0gdGhpcy5wb3NpdGlvbkluTGluZSAlIExJTkVfV09SRF9MRU5HVEg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFjdGl2ZUxpbmUgPSBsaW5lO1xuICAgIHJldHVybiBsaW5lO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWQgdGhlIGFjdGl2ZSBsaW5lIHdpdGhvdXQgaW5jcmVtZW50aW5nIHRoZSB3b3JkIGNvdW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcmV0dXJucyB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG4gICAqL1xuICByZWFkQWN0aXZlTGluZSgpIHtcblxuICAgIGxldCBsaW5lID0gJyc7XG5cbiAgICAvLyBpZiB0aGVyZSBpcyBubyBhY3RpdmUgbGluZSwgZmluZCB0aGUgbmV4dCBvbmVcbiAgICBpZiAoICF0aGlzLmFjdGl2ZUxpbmUgKSB7XG4gICAgICB0aGlzLmFjdGl2ZUxpbmUgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNMaW5lKCBORVhUICk7XG4gICAgfVxuXG4gICAgLy8gc3BsaXQgdXAgdGhlIGFjdGl2ZSBsaW5lIGludG8gYW4gYXJyYXkgb2Ygd29yZHNcbiAgICBjb25zdCBhY3RpdmVXb3JkcyA9IHRoaXMuYWN0aXZlTGluZS5zcGxpdCggU1BBQ0UgKTtcblxuICAgIC8vIHJlYWQgdGhpcyBsaW5lIG9mIGNvbnRlbnRcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBMSU5FX1dPUkRfTEVOR1RIOyBpKysgKSB7XG4gICAgICBpZiAoIGFjdGl2ZVdvcmRzWyBpIF0gKSB7XG4gICAgICAgIGxpbmUgKz0gYWN0aXZlV29yZHNbIGkgXTtcblxuICAgICAgICBpZiAoIGFjdGl2ZVdvcmRzWyBpICsgMSBdICkge1xuICAgICAgICAgIC8vIGFkZCBzcGFjZSBpZiB0aGVyZSBhcmUgbW9yZSB3b3Jkc1xuICAgICAgICAgIGxpbmUgKz0gU1BBQ0U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gd2UgaGF2ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGxpbmUsIHRoZXJlIGFyZSBubyBtb3JlIHdvcmRzXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGluZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICByZWFkTmV4dFByZXZpb3VzV29yZCggZGlyZWN0aW9uICkge1xuICAgIC8vIGlmIHRoZXJlIGlzIG5vIGFjdGl2ZSBsaW5lLCBmaW5kIHRoZSBuZXh0IG9uZVxuICAgIGlmICggIXRoaXMuYWN0aXZlTGluZSApIHtcbiAgICAgIHRoaXMuYWN0aXZlTGluZSA9IHRoaXMucmVhZE5leHRQcmV2aW91c0xpbmUoIGRpcmVjdGlvbiApO1xuICAgIH1cblxuICAgIC8vIHNwbGl0IHRoZSBhY3RpdmUgbGluZSBpbnRvIGFuIGFycmF5IG9mIHdvcmRzXG4gICAgY29uc3QgYWN0aXZlV29yZHMgPSB0aGlzLmFjdGl2ZUxpbmUuc3BsaXQoIFNQQUNFICk7XG5cbiAgICAvLyBkaXJlY3Rpb24gZGVwZW5kZW50IHZhcmlhYmxlc1xuICAgIGxldCBzZWFyY2hEZWx0YTtcbiAgICBsZXQgY29udGVudEVuZDtcbiAgICBpZiAoIGRpcmVjdGlvbiA9PT0gTkVYVCApIHtcbiAgICAgIGNvbnRlbnRFbmQgPSBhY3RpdmVXb3Jkcy5sZW5ndGg7XG4gICAgICBzZWFyY2hEZWx0YSA9IDE7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBkaXJlY3Rpb24gPT09IFBSRVZJT1VTICkge1xuICAgICAgY29udGVudEVuZCA9IDA7XG4gICAgICBzZWFyY2hEZWx0YSA9IC0yO1xuICAgIH1cblxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIG1vcmUgY29udGVudCwgcmVhZCB0aGUgbmV4dC9wcmV2aW91cyBsaW5lXG4gICAgaWYgKCB0aGlzLndvcmRQb3NpdGlvbiA9PT0gY29udGVudEVuZCApIHtcbiAgICAgIHRoaXMuYWN0aXZlTGluZSA9IHRoaXMucmVhZE5leHRQcmV2aW91c0xpbmUoIGRpcmVjdGlvbiApO1xuICAgIH1cblxuICAgIC8vIGdldCB0aGUgd29yZCB0byByZWFkIHVwZGF0ZSB3b3JkIHBvc2l0aW9uXG4gICAgY29uc3Qgb3V0cHV0VGV4dCA9IGFjdGl2ZVdvcmRzWyB0aGlzLndvcmRQb3NpdGlvbiBdO1xuICAgIHRoaXMud29yZFBvc2l0aW9uICs9IHNlYXJjaERlbHRhO1xuXG4gICAgcmV0dXJuIG91dHB1dFRleHQ7XG4gIH1cblxuICAvKipcbiAgICogUmVhZCB0aGUgbmV4dCBvciBwcmV2aW91cyBoZWFkaW5nIHdpdGggb25lIG9mIHRoZSBsZXZlbHMgc3BlY2lmaWVkIGluIGhlYWRpbmdMZXZlbHMgYW5kIGluIHRoZSBkaXJlY3Rpb25cbiAgICogc3BlY2lmaWVkIGJ5IHRoZSBkaXJlY3Rpb24gZmxhZy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtICB7QXJyYXkuPHN0cmluZz59IGhlYWRpbmdMZXZlbHNcbiAgICogQHBhcmFtICB7W3R5cGVdfSBkaXJlY3Rpb24gLSBkaXJlY3Rpb24gb2YgdHJhdmVyc2FsIHRocm91Z2ggdGhlIERPTSAtIE5FWFQgfHwgUFJFVklPVVNcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBoZWFkaW5nTGV2ZWxzLCBkaXJlY3Rpb24gKSB7XG5cbiAgICAvLyBnZXQgdGhlIG5leHQgZWxlbWVudCBpbiB0aGUgRE9NIHdpdGggb25lIG9mIHRoZSBhYm92ZSBoZWFkaW5nIGxldmVscyB3aGljaCBoYXMgYWNjZXNzaWJsZSBjb250ZW50XG4gICAgLy8gdG8gcmVhZFxuICAgIGxldCBhY2Nlc3NpYmxlVGV4dDtcbiAgICBsZXQgbmV4dEVsZW1lbnQ7XG5cbiAgICAvLyB0cmFjayB0aGUgcHJldmlvdXMgZWxlbWVudCAtIGlmIHRoZXJlIGFyZSBubyBtb3JlIGhlYWRpbmdzLCBzdG9yZSBpdCBoZXJlXG4gICAgbGV0IHByZXZpb3VzRWxlbWVudDtcblxuICAgIHdoaWxlICggIWFjY2Vzc2libGVUZXh0ICkge1xuICAgICAgcHJldmlvdXNFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50O1xuICAgICAgbmV4dEVsZW1lbnQgPSB0aGlzLmdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUm9sZSggaGVhZGluZ0xldmVscywgZGlyZWN0aW9uICk7XG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBuZXh0RWxlbWVudDtcbiAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggbmV4dEVsZW1lbnQgKTtcbiAgICB9XG5cbiAgICBpZiAoICFuZXh0RWxlbWVudCApIHtcbiAgICAgIC8vIHJlc3RvcmUgdGhlIGFjdGl2ZSBlbGVtZW50XG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBwcmV2aW91c0VsZW1lbnQ7XG4gICAgICAvLyBsZXQgdGhlIHVzZXIga25vdyB0aGF0IHRoZXJlIGFyZSBubyBtb3JlIGhlYWRpbmdzIGF0IHRoZSBkZXNpcmVkIGxldmVsXG4gICAgICBjb25zdCBkaXJlY3Rpb25EZXNjcmlwdGlvblN0cmluZyA9ICggZGlyZWN0aW9uID09PSBORVhUICkgPyAnbW9yZScgOiAncHJldmlvdXMnO1xuICAgICAgaWYgKCBoZWFkaW5nTGV2ZWxzLmxlbmd0aCA9PT0gMSApIHtcbiAgICAgICAgY29uc3Qgbm9OZXh0SGVhZGluZ1N0cmluZyA9IGBObyAke2RpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nfSBoZWFkaW5ncyBhdCBgO1xuXG4gICAgICAgIGNvbnN0IGhlYWRpbmdMZXZlbCA9IGhlYWRpbmdMZXZlbHNbIDAgXTtcbiAgICAgICAgY29uc3QgbGV2ZWxTdHJpbmcgPSBoZWFkaW5nTGV2ZWwgPT09ICdIMScgPyAnTGV2ZWwgMScgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRpbmdMZXZlbCA9PT0gJ0gyJyA/ICdMZXZlbCAyJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGluZ0xldmVsID09PSAnSDMnID8gJ0xldmVsIDMnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkaW5nTGV2ZWwgPT09ICdINCcgPyAnTGV2ZWwgNCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRpbmdMZXZlbCA9PT0gJ0g1JyA/ICdMZXZlbCA1JyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0xldmVsIDYnO1xuICAgICAgICByZXR1cm4gbm9OZXh0SGVhZGluZ1N0cmluZyArIGxldmVsU3RyaW5nO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGBObyAke2RpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nfSBoZWFkaW5nc2A7XG4gICAgfVxuXG4gICAgLy8gc2V0IGVsZW1lbnQgYXMgdGhlIG5leHQgYWN0aXZlIGVsZW1lbnQgYW5kIHJldHVybiB0aGUgdGV4dFxuICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IG5leHRFbGVtZW50O1xuICAgIHJldHVybiBhY2Nlc3NpYmxlVGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkIHRoZSBuZXh0L3ByZXZpb3VzIGJ1dHRvbiBlbGVtZW50LiAgQSBidXR0b24gY2FuIGhhdmUgdGhlIHRhZ25hbWUgYnV0dG9uLCBoYXZlIHRoZSBhcmlhIGJ1dHRvbiByb2xlLCBvclxuICAgKiBvciBoYXZlIG9uZSBvZiB0aGUgZm9sbG93aW5nIHR5cGVzOiBzdWJtaXQsIGJ1dHRvbiwgcmVzZXRcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfX0gZGlyZWN0aW9uXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAgICovXG4gIHJlYWROZXh0UHJldmlvdXNCdXR0b24oIGRpcmVjdGlvbiApIHtcbiAgICAvLyB0aGUgZm9sbG93aW5nIHJvbGVzIHNob3VsZCBoYW5kbGUgJ3JvbGU9YnV0dG9uJywgJ3R5cGU9YnV0dG9uJywgJ3RhZ05hbWU9QlVUVE9OJ1xuICAgIGNvbnN0IHJvbGVzID0gWyAnYnV0dG9uJywgJ0JVVFRPTicsICdzdWJtaXQnLCAncmVzZXQnIF07XG5cbiAgICBsZXQgbmV4dEVsZW1lbnQ7XG4gICAgbGV0IGFjY2Vzc2libGVUZXh0O1xuICAgIGxldCBwcmV2aW91c0VsZW1lbnQ7XG5cbiAgICB3aGlsZSAoICFhY2Nlc3NpYmxlVGV4dCApIHtcbiAgICAgIHByZXZpb3VzRWxlbWVudCA9IHRoaXMuYWN0aXZlRWxlbWVudDtcbiAgICAgIG5leHRFbGVtZW50ID0gdGhpcy5nZXROZXh0UHJldmlvdXNFbGVtZW50V2l0aFJvbGUoIHJvbGVzLCBkaXJlY3Rpb24gKTtcbiAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IG5leHRFbGVtZW50O1xuXG4gICAgICAvLyBnZXQgdGhlIGFjY2Vzc2libGUgdGV4dCB3aXRoIGFwcGxpY2F0aW9uIGRlc2NyaXB0aW9uc1xuICAgICAgYWNjZXNzaWJsZVRleHQgPSB0aGlzLmdldEFjY2Vzc2libGVUZXh0KCBuZXh0RWxlbWVudCwgdHJ1ZSApO1xuICAgIH1cblxuICAgIGlmICggIW5leHRFbGVtZW50ICkge1xuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gcHJldmlvdXNFbGVtZW50O1xuICAgICAgY29uc3QgZGlyZWN0aW9uRGVzY3JpcHRpb25TdHJpbmcgPSBkaXJlY3Rpb24gPT09IE5FWFQgPyAnbW9yZScgOiAncHJldmlvdXMnO1xuICAgICAgcmV0dXJuIGBObyAke2RpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nfSBidXR0b25zYDtcbiAgICB9XG5cbiAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBuZXh0RWxlbWVudDtcbiAgICByZXR1cm4gYWNjZXNzaWJsZVRleHQ7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvblxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgcmVhZE5leHRQcmV2aW91c0Zvcm1FbGVtZW50KCBkaXJlY3Rpb24gKSB7XG4gICAgLy8gVE9ETzogc3VwcG9ydCBtb3JlIGZvcm0gZWxlbWVudHMhIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgY29uc3QgdGFnTmFtZXMgPSBbICdJTlBVVCcsICdCVVRUT04nIF07XG4gICAgY29uc3QgYXJpYVJvbGVzID0gWyAnYnV0dG9uJyBdO1xuICAgIGNvbnN0IHJvbGVzID0gdGFnTmFtZXMuY29uY2F0KCBhcmlhUm9sZXMgKTtcblxuICAgIGxldCBuZXh0RWxlbWVudDtcbiAgICBsZXQgYWNjZXNzaWJsZVRleHQ7XG5cbiAgICAvLyB0cmFjayB0aGUgcHJldmlvdXMgZWxlbWVudCAtIGlmIHRoZXJlIGFyZSBubyBtb3JlIGZvcm0gZWxlbWVudHMgaXQgd2lsbCBuZWVkIHRvIGJlIHJlc3RvcmVkXG4gICAgbGV0IHByZXZpb3VzRWxlbWVudDtcblxuICAgIHdoaWxlICggIWFjY2Vzc2libGVUZXh0ICkge1xuICAgICAgcHJldmlvdXNFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50O1xuICAgICAgbmV4dEVsZW1lbnQgPSB0aGlzLmdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUm9sZSggcm9sZXMsIGRpcmVjdGlvbiApO1xuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gbmV4dEVsZW1lbnQ7XG5cbiAgICAgIC8vIGdldCB0aGUgYWNjZXNzaWJsZSB0ZXh0IHdpdGggYXJpYSBkZXNjcmlwdGlvbnNcbiAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggbmV4dEVsZW1lbnQsIHRydWUgKTtcbiAgICB9XG5cbiAgICBpZiAoIGFjY2Vzc2libGVUZXh0ID09PSBFTkRfT0ZfRE9DVU1FTlQgKSB7XG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBwcmV2aW91c0VsZW1lbnQ7XG4gICAgICBjb25zdCBkaXJlY3Rpb25EZXNjcmlwdGlvblN0cmluZyA9IGRpcmVjdGlvbiA9PT0gTkVYVCA/ICduZXh0JyA6ICdwcmV2aW91cyc7XG4gICAgICByZXR1cm4gYE5vICR7ZGlyZWN0aW9uRGVzY3JpcHRpb25TdHJpbmd9IGZvcm0gZmllbGRgO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IG5leHRFbGVtZW50O1xuICAgIHJldHVybiBhY2Nlc3NpYmxlVGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICByZWFkTmV4dFByZXZpb3VzTGlzdEl0ZW0oIGRpcmVjdGlvbiApIHtcbiAgICBpZiAoICF0aGlzLmFjdGl2ZUVsZW1lbnQgKSB7XG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSB0aGlzLmdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUERPTUNvbnRlbnQoIGRpcmVjdGlvbiApO1xuICAgIH1cblxuICAgIGxldCBhY2Nlc3NpYmxlVGV4dDtcblxuICAgIC8vIGlmIHdlIGFyZSBpbnNpZGUgb2YgYSBsaXN0LCBnZXQgdGhlIG5leHQgcGVlciwgb3IgZmluZCB0aGUgbmV4dCBsaXN0XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IHRoaXMuYWN0aXZlRWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgIGlmICggcGFyZW50RWxlbWVudC50YWdOYW1lID09PSAnVUwnIHx8IHBhcmVudEVsZW1lbnQudGFnTmFtZSA9PT0gJ09MJyApIHtcblxuICAgICAgY29uc3Qgc2VhcmNoRGVsdGEgPSBkaXJlY3Rpb24gPT09IE5FWFQgPyAxIDogLTE7XG5cbiAgICAgIC8vIEFycmF5LnByb3RvdHlwZSBtdXN0IGJlIHVzZWQgb24gdGhlIE5vZGVMaXN0XG4gICAgICBsZXQgc2VhcmNoSW5kZXggPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKCBwYXJlbnRFbGVtZW50LmNoaWxkcmVuLCB0aGlzLmFjdGl2ZUVsZW1lbnQgKSArIHNlYXJjaERlbHRhO1xuXG4gICAgICB3aGlsZSAoIHBhcmVudEVsZW1lbnQuY2hpbGRyZW5bIHNlYXJjaEluZGV4IF0gKSB7XG4gICAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggcGFyZW50RWxlbWVudC5jaGlsZHJlblsgc2VhcmNoSW5kZXggXSApO1xuICAgICAgICBpZiAoIGFjY2Vzc2libGVUZXh0ICkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IHBhcmVudEVsZW1lbnQuY2hpbGRyZW5bIHNlYXJjaEluZGV4IF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc2VhcmNoSW5kZXggKz0gc2VhcmNoRGVsdGE7XG4gICAgICB9XG5cbiAgICAgIGlmICggIWFjY2Vzc2libGVUZXh0ICkge1xuICAgICAgICAvLyB0aGVyZSB3YXMgbm8gYWNjZXNzaWJsZSB0ZXh0IGluIHRoZSBsaXN0IGl0ZW1zLCBzbyByZWFkIHRoZSBuZXh0IC8gcHJldmlvdXMgbGlzdFxuICAgICAgICBhY2Nlc3NpYmxlVGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c0xpc3QoIGRpcmVjdGlvbiApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIG5vdCBpbnNpZGUgb2YgYSBsaXN0LCBzbyByZWFkIHRoZSBuZXh0L3ByZXZpb3VzIG9uZSBhbmQgaXRzIGZpcnN0IGl0ZW1cbiAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGlzdCggZGlyZWN0aW9uICk7XG4gICAgfVxuXG4gICAgaWYgKCAhYWNjZXNzaWJsZVRleHQgKSB7XG4gICAgICBjb25zdCBkaXJlY3Rpb25EZXNjcmlwdGlvblN0cmluZyA9ICggZGlyZWN0aW9uID09PSBORVhUICkgPyAnbW9yZScgOiAncHJldmlvdXMnO1xuICAgICAgcmV0dXJuIGBObyAke2RpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nfSBsaXN0IGl0ZW1zYDtcbiAgICB9XG5cbiAgICByZXR1cm4gYWNjZXNzaWJsZVRleHQ7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvblxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgcmVhZE5leHRQcmV2aW91c0xpc3QoIGRpcmVjdGlvbiApIHtcbiAgICBpZiAoICF0aGlzLmFjdGl2ZUVsZW1lbnQgKSB7XG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSB0aGlzLmdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUERPTUNvbnRlbnQoIGRpcmVjdGlvbiApO1xuICAgIH1cblxuICAgIC8vIGlmIHdlIGFyZSBpbnNpZGUgb2YgYSBsaXN0IGFscmVhZHksIHN0ZXAgb3V0IG9mIGl0IHRvIGJlZ2luIHNlYXJjaGluZyB0aGVyZVxuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSB0aGlzLmFjdGl2ZUVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICBsZXQgYWN0aXZlRWxlbWVudDtcbiAgICBpZiAoIHBhcmVudEVsZW1lbnQudGFnTmFtZSA9PT0gJ1VMJyB8fCBwYXJlbnRFbGVtZW50LnRhZ05hbWUgPT09ICdPTCcgKSB7XG4gICAgICAvLyBzYXZlIHRoZSBwcmV2aW91cyBhY3RpdmUgZWxlbWVudCAtIGlmIHRoZXJlIGFyZSBubyBtb3JlIGxpc3RzLCB0aGlzIHNob3VsZCBub3QgY2hhbmdlXG4gICAgICBhY3RpdmVFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50O1xuXG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBwYXJlbnRFbGVtZW50O1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RFbGVtZW50ID0gdGhpcy5nZXROZXh0UHJldmlvdXNFbGVtZW50V2l0aFJvbGUoIFsgJ1VMJywgJ09MJyBdLCBkaXJlY3Rpb24gKTtcblxuICAgIGlmICggIWxpc3RFbGVtZW50ICkge1xuXG4gICAgICAvLyByZXN0b3JlIHRoZSBwcmV2aW91cyBhY3RpdmUgZWxlbWVudFxuICAgICAgaWYgKCBhY3RpdmVFbGVtZW50ICkge1xuICAgICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBhY3RpdmVFbGVtZW50O1xuICAgICAgfVxuXG4gICAgICAvLyBsZXQgdGhlIHVzZXIga25vdyB0aGF0IHRoZXJlIGFyZSBubyBtb3JlIGxpc3RzIGFuZCBtb3ZlIHRvIHRoZSBuZXh0IGVsZW1lbnRcbiAgICAgIGNvbnN0IGRpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nID0gZGlyZWN0aW9uID09PSBORVhUID8gJ21vcmUnIDogJ3ByZXZpb3VzJztcbiAgICAgIHJldHVybiBgTm8gJHtkaXJlY3Rpb25EZXNjcmlwdGlvblN0cmluZ30gbGlzdHNgO1xuICAgIH1cblxuICAgIC8vIGdldCB0aGUgY29udGVudCBmcm9tIHRoZSBsaXN0IGVsZW1lbnRcbiAgICBjb25zdCBsaXN0VGV4dCA9IHRoaXMuZ2V0QWNjZXNzaWJsZVRleHQoIGxpc3RFbGVtZW50ICk7XG5cbiAgICAvLyBpbmNsdWRlIHRoZSBjb250ZW50IGZyb20gdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGxpc3RcbiAgICBsZXQgaXRlbVRleHQgPSAnJztcbiAgICBjb25zdCBmaXJzdEl0ZW0gPSBsaXN0RWxlbWVudC5jaGlsZHJlblsgMCBdO1xuICAgIGlmICggZmlyc3RJdGVtICkge1xuICAgICAgaXRlbVRleHQgPSB0aGlzLmdldEFjY2Vzc2libGVUZXh0KCBmaXJzdEl0ZW0gKTtcbiAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IGZpcnN0SXRlbTtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7bGlzdFRleHR9LCAke2l0ZW1UZXh0fWA7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvblxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgcmVhZE5leHRQcmV2aW91c0NoYXJhY3RlciggZGlyZWN0aW9uICkge1xuICAgIC8vIGlmIHRoZXJlIGlzIG5vIGFjdGl2ZSBsaW5lLCBmaW5kIHRoZSBuZXh0IG9uZVxuICAgIGlmICggIXRoaXMuYWN0aXZlTGluZSApIHtcbiAgICAgIHRoaXMuYWN0aXZlTGluZSA9IHRoaXMucmVhZE5leHRQcmV2aW91c0xpbmUoIE5FWFQgKTtcbiAgICB9XG5cbiAgICAvLyBkaXJlY3Rpb25hbCBkZXBlbmRlbnQgdmFyaWFibGVzXG4gICAgbGV0IGNvbnRlbnRFbmQ7XG4gICAgbGV0IHNlYXJjaERlbHRhO1xuICAgIGxldCBub3JtYWxpemVEaXJlY3Rpb247XG4gICAgaWYgKCBkaXJlY3Rpb24gPT09IE5FWFQgKSB7XG4gICAgICBjb250ZW50RW5kID0gdGhpcy5hY3RpdmVMaW5lLmxlbmd0aDtcbiAgICAgIHNlYXJjaERlbHRhID0gMTtcbiAgICAgIG5vcm1hbGl6ZURpcmVjdGlvbiA9IDA7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBkaXJlY3Rpb24gPT09IFBSRVZJT1VTICkge1xuICAgICAgLy8gZm9yIGJhY2t3YXJkcyB0cmF2ZXJzYWwsIHJlYWQgZnJvbSB0d28gY2hhcmFjdGVycyBiZWhpbmRcbiAgICAgIGNvbnRlbnRFbmQgPSAyO1xuICAgICAgc2VhcmNoRGVsdGEgPSAtMTtcbiAgICAgIG5vcm1hbGl6ZURpcmVjdGlvbiA9IC0yO1xuICAgIH1cblxuICAgIC8vIGlmIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBjb250ZW50LCByZWFkIHRoZSBuZXh0L3ByZXZpb3VzIGxpbmVcbiAgICBpZiAoIHRoaXMubGV0dGVyUG9zaXRpb24gPT09IGNvbnRlbnRFbmQgKSB7XG4gICAgICB0aGlzLmFjdGl2ZUxpbmUgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNMaW5lKCBkaXJlY3Rpb24gKTtcblxuICAgICAgLy8gaWYgcmVhZGluZyBiYWNrd2FyZHMsIGxldHRlciBwb3NpdGlvbiBzaG91bGQgYmUgYXQgdGhlIGVuZCBvZiB0aGUgYWN0aXZlIGxpbmVcbiAgICAgIHRoaXMubGV0dGVyUG9zaXRpb24gPSB0aGlzLmFjdGl2ZUxpbmUubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIGdldCB0aGUgbGV0dGVyIHRvIHJlYWQgYW5kIGluY3JlbWVudCB0aGUgbGV0dGVyIHBvc2l0aW9uXG4gICAgY29uc3Qgb3V0cHV0VGV4dCA9IHRoaXMuYWN0aXZlTGluZVsgdGhpcy5sZXR0ZXJQb3NpdGlvbiArIG5vcm1hbGl6ZURpcmVjdGlvbiBdO1xuICAgIHRoaXMubGV0dGVyUG9zaXRpb24gKz0gc2VhcmNoRGVsdGE7XG5cbiAgICByZXR1cm4gb3V0cHV0VGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGxpc3Qgb2YgZWxlbWVudHMsIGFuZCBhZGQgTXV0YXRpb24gT2JzZXJ2ZXJzIHRvIGVhY2ggb25lLiAgTXV0YXRpb25PYnNlcnZlcnNcbiAgICogcHJvdmlkZSBhIHdheSB0byBsaXN0ZW4gdG8gY2hhbmdlcyBpbiB0aGUgRE9NLFxuICAgKiBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL011dGF0aW9uT2JzZXJ2ZXJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZUxpdmVFbGVtZW50TGlzdCgpIHtcblxuICAgIC8vIHJlbW92ZSBhbGwgcHJldmlvdXMgb2JzZXJ2ZXJzXG4gICAgLy8gVE9ETzogb25seSB1cGRhdGUgdGhlIG9ic2VydmVyIGxpc3QgaWYgbmVjZXNzYXJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5vYnNlcnZlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiAoIHRoaXMub2JzZXJ2ZXJzWyBpIF0gKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzWyBpIF0uZGlzY29ubmVjdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNsZWFyIHRoZSBsaXN0IG9mIG9ic2VydmVyc1xuICAgIHRoaXMub2JzZXJ2ZXJzID0gW107XG5cbiAgICAvLyBzZWFyY2ggdGhyb3VnaCB0aGUgRE9NLCBsb29raW5nIGZvciBlbGVtZW50cyB3aXRoIGEgJ2xpdmUgcmVnaW9uJyBhdHRyaWJ1dGVcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxpbmVhckRPTS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGRvbUVsZW1lbnQgPSB0aGlzLmxpbmVhckRPTVsgaSBdO1xuICAgICAgY29uc3QgbGl2ZVJvbGUgPSB0aGlzLmdldExpdmVSb2xlKCBkb21FbGVtZW50ICk7XG5cbiAgICAgIGlmICggbGl2ZVJvbGUgKSB7XG4gICAgICAgIGNvbnN0IG11dGF0aW9uT2JzZXJ2ZXJDYWxsYmFjayA9IG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgbXV0YXRpb25zLmZvckVhY2goIG11dGF0aW9uID0+IHtcbiAgICAgICAgICAgIGxldCBsaXZlUm9sZTtcbiAgICAgICAgICAgIGxldCBtdXRhdGVkRWxlbWVudCA9IG11dGF0aW9uLnRhcmdldDtcblxuICAgICAgICAgICAgLy8gbG9vayBmb3IgdGhlIHR5cGUgb2YgbGl2ZSByb2xlIHRoYXQgaXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgbXV0YXRpb25cbiAgICAgICAgICAgIC8vIGlmIHRoZSB0YXJnZXQgaGFzIG5vIGxpdmUgYXR0cmlidXRlLCBzZWFyY2ggdGhyb3VnaCB0aGUgZWxlbWVudCdzIGFuY2VzdG9ycyB0byBmaW5kIHRoZSBhdHRyaWJ1dGVcbiAgICAgICAgICAgIHdoaWxlICggIWxpdmVSb2xlICkge1xuICAgICAgICAgICAgICBsaXZlUm9sZSA9IHRoaXMuZ2V0TGl2ZVJvbGUoIG11dGF0ZWRFbGVtZW50ICk7XG4gICAgICAgICAgICAgIG11dGF0ZWRFbGVtZW50ID0gbXV0YXRlZEVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gd2Ugb25seSBjYXJlIGFib3V0IG5vZGVzIGFkZGVkXG4gICAgICAgICAgICBpZiAoIG11dGF0aW9uLmFkZGVkTm9kZXNbIDAgXSApIHtcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFRleHQgPSBtdXRhdGlvbi5hZGRlZE5vZGVzWyAwIF0uZGF0YTtcbiAgICAgICAgICAgICAgdGhpcy5vdXRwdXRVdHRlcmFuY2VQcm9wZXJ0eS5zZXQoIG5ldyBVdHRlcmFuY2UoIHVwZGF0ZWRUZXh0LCBsaXZlUm9sZSApICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGNyZWF0ZSBhIG11dGF0aW9uIG9ic2VydmVyIGZvciB0aGlzIGxpdmUgZWxlbWVudFxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCBtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgIG11dGF0aW9uT2JzZXJ2ZXJDYWxsYmFjayggbXV0YXRpb25zICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAvLyBsaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHN1YnRyZWUgaW4gY2FzZSBjaGlsZHJlbiBvZiB0aGUgYXJpYS1saXZlIHBhcmVudCBjaGFuZ2UgdGhlaXIgdGV4dENvbnRlbnRcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXJDb25maWcgPSB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9O1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoIGRvbUVsZW1lbnQsIG9ic2VydmVyQ29uZmlnICk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzLnB1c2goIG9ic2VydmVyICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWQgY29udGludW91c2x5IGZyb20gdGhlIGN1cnJlbnQgYWN0aXZlIGVsZW1lbnQuICBBY2Nlc3NpYmxlIGNvbnRlbnQgaXMgcmVhZCBieSByZWFkZXIgd2l0aCBhICdwb2xpdGUnXG4gICAqIHV0dGVyYW5jZSBzbyB0aGF0IG5ldyB0ZXh0IGlzIGFkZGVkIHRvIHRoZSBxdWV1ZSBsaW5lIGJ5IGxpbmUuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIFRPRE86IElmIHRoZSByZWFkIGlzIGNhbmNlbGxlZCwgdGhlIGFjdGl2ZSBlbGVtZW50IHNob3VsZCBiZSBzZXQgYXBwcm9wcmlhdGVseS4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHJlYWRFbnRpcmVEb2N1bWVudCgpIHtcblxuICAgIGNvbnN0IGxpdmVSb2xlID0gJ3BvbGl0ZSc7XG4gICAgbGV0IG91dHB1dFRleHQgPSB0aGlzLmdldEFjY2Vzc2libGVUZXh0KCB0aGlzLmFjdGl2ZUVsZW1lbnQgKTtcbiAgICBsZXQgYWN0aXZlRWxlbWVudCA9IHRoaXMuYWN0aXZlRWxlbWVudDtcblxuICAgIHdoaWxlICggb3V0cHV0VGV4dCAhPT0gRU5EX09GX0RPQ1VNRU5UICkge1xuICAgICAgYWN0aXZlRWxlbWVudCA9IHRoaXMuYWN0aXZlRWxlbWVudDtcbiAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNMaW5lKCBORVhUICk7XG5cbiAgICAgIGlmICggb3V0cHV0VGV4dCA9PT0gRU5EX09GX0RPQ1VNRU5UICkge1xuICAgICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBhY3RpdmVFbGVtZW50O1xuICAgICAgfVxuICAgICAgdGhpcy5vdXRwdXRVdHRlcmFuY2VQcm9wZXJ0eS5zZXQoIG5ldyBVdHRlcmFuY2UoIG91dHB1dFRleHQsIGxpdmVSb2xlICkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIGVsZW1lbnQgaXMgZm9jdXNhYmxlLiAgQSBmb2N1c2FibGUgZWxlbWVudCBoYXMgYSB0YWIgaW5kZXgsIGlzIGFcbiAgICogZm9ybSBlbGVtZW50LCBvciBoYXMgYSByb2xlIHdoaWNoIGFkZHMgaXQgdG8gdGhlIG5hdmlnYXRpb24gb3JkZXIuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIFRPRE86IFBvcHVsYXRlIHdpdGggdGhlIHJlc3Qgb2YgdGhlIGZvY3VzYWJsZSBlbGVtZW50cy4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGRvbUVsZW1lbnRcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0ZvY3VzYWJsZSggZG9tRWxlbWVudCApIHtcbiAgICAvLyBsaXN0IG9mIGF0dHJpYnV0ZXMgYW5kIHRhZyBuYW1lcyB3aGljaCBzaG91bGQgYmUgaW4gdGhlIG5hdmlnYXRpb24gb3JkZXJcbiAgICAvLyBUT0RPOiBtb3JlIHJvbGVzISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGNvbnN0IGZvY3VzYWJsZVJvbGVzID0gWyAndGFiaW5kZXgnLCAnQlVUVE9OJywgJ0lOUFVUJyBdO1xuXG4gICAgbGV0IGZvY3VzYWJsZSA9IGZhbHNlO1xuICAgIGZvY3VzYWJsZVJvbGVzLmZvckVhY2goIHJvbGUgPT4ge1xuXG4gICAgICBpZiAoIGRvbUVsZW1lbnQuZ2V0QXR0cmlidXRlKCByb2xlICkgKSB7XG4gICAgICAgIGZvY3VzYWJsZSA9IHRydWU7XG5cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBkb21FbGVtZW50LnRhZ05hbWUgPT09IHJvbGUgKSB7XG4gICAgICAgIGZvY3VzYWJsZSA9IHRydWU7XG5cbiAgICAgIH1cbiAgICB9ICk7XG4gICAgcmV0dXJuIGZvY3VzYWJsZTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQ3Vyc29yJywgQ3Vyc29yICk7XG5cbmNsYXNzIFV0dGVyYW5jZSB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gZXhwZXJpbWVudGFsIHR5cGUgdG8gY3JlYXRlIHVuaXF1ZSB1dHRlcmFuY2VzIGZvciB0aGUgcmVhZGVyLlxuICAgKiBUeXBlIGlzIHNpbXBseSBhIGNvbGxlY3Rpb24gb2YgdGV4dCBhbmQgYSBwcmlvcml0eSBmb3IgYXJpYS1saXZlIHRoYXRcbiAgICogbGV0cyB0aGUgcmVhZGVyIGtub3cgd2hldGhlciB0byBxdWV1ZSB0aGUgbmV4dCB1dHRlcmFuY2Ugb3IgY2FuY2VsIGl0IGluIHRoZSBvcmRlci5cbiAgICpcbiAgICogVE9ETzogVGhpcyBpcyB3aGVyZSB3ZSBjb3VsZCBkZXZpYXRlIGZyb20gdHJhZGl0aW9uYWwgc2NyZWVuIHJlYWRlciBiZWhhdmlvci4gRm9yIGluc3RhbmNlLCBpbnN0ZWFkIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqIGp1c3QgbGl2ZVJvbGUsIHBlcmhhcHMgd2Ugc2hvdWxkIGhhdmUgYSBsaXZlSW5kZXggdGhhdCBzcGVjaWZpZXMgb3JkZXIgb2YgdGhlIGxpdmUgdXBkYXRlPyBXZSBtYXkgYWxzb1xuICAgKiBuZWVkIGFkZGl0aW9uYWwgZmxhZ3MgaGVyZSBmb3IgdGhlIHJlYWRlci5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSB0aGUgdGV4dCB0byBiZSByZWFkIGFzIHRoZSB1dHRlcmFuY2UgZm9yIHRoZSBzeW50aFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGl2ZVJvbGUgLSBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQWNjZXNzaWJpbGl0eS9BUklBL0FSSUFfTGl2ZV9SZWdpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvciggdGV4dCwgbGl2ZVJvbGUgKSB7XG5cbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgIHRoaXMubGl2ZVJvbGUgPSBsaXZlUm9sZTtcblxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEN1cnNvcjsiXSwibmFtZXMiOlsiUHJvcGVydHkiLCJzY2VuZXJ5IiwiU1BBQ0UiLCJFTkRfT0ZfRE9DVU1FTlQiLCJDT01NQSIsIkxJTkVfV09SRF9MRU5HVEgiLCJORVhUIiwiUFJFVklPVVMiLCJDdXJzb3IiLCJnZXRMaW5lYXJET01FbGVtZW50cyIsImRvbUVsZW1lbnQiLCJjaGlsZHJlbiIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibGluZWFyRE9NIiwiaSIsImxlbmd0aCIsIm5vZGVUeXBlIiwiTm9kZSIsIkVMRU1FTlRfTk9ERSIsImdldExpdmVSb2xlIiwibGl2ZVJvbGUiLCJyb2xlcyIsImZvckVhY2giLCJyb2xlIiwiZ2V0QXR0cmlidXRlIiwiZ2V0TmV4dFByZXZpb3VzRWxlbWVudCIsImRpcmVjdGlvbiIsImFjdGl2ZUVsZW1lbnQiLCJzZWFyY2hEZWx0YSIsImFjdGl2ZUluZGV4IiwiaW5kZXhPZiIsIm5leHRJbmRleCIsImdldExhYmVsIiwiaWQiLCJsYWJlbHMiLCJkb2N1bWVudCIsImxhYmVsV2l0aElkIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJjYWxsIiwibGFiZWwiLCJhc3NlcnQiLCJnZXRBY2Nlc3NpYmxlVGV4dCIsImVsZW1lbnQiLCJ3aXRoQXBwbGljYXRpb25Db250ZW50IiwidGV4dENvbnRlbnQiLCJ0YWdOYW1lIiwiY2hpbGRFbGVtZW50IiwicGFyZW50RWxlbWVudCIsImhpZGRlbiIsImxpc3RMZW5ndGgiLCJidXR0b25MYWJlbCIsInRvZ2dsZUxhYmVsIiwicHJlc3NlZExhYmVsIiwibm90TGFiZWwiLCJ0eXBlIiwiY2hlY2tib3hMYWJlbCIsImxhYmVsQ29udGVudCIsImFyaWFDaGVja2VkIiwic3dpdGNoZWRTdHJpbmciLCJjaGVja2VkU3RyaW5nIiwiY2hlY2tlZCIsImFyaWFMYWJlbCIsImFyaWFMYWJlbGxlZEJ5SWQiLCJhcmlhTGFiZWxsZWRCeSIsImdldEVsZW1lbnRCeUlkIiwiYXJpYUxhYmVsbGVkQnlUZXh0IiwiZHJhZ2dhYmxlIiwiYXJpYURlc2NyaWJlZEJ5IiwiZGVzY3JpcHRpb25JRHMiLCJzcGxpdCIsImRlc2NyaXB0aW9uRWxlbWVudCIsImRlc2NyaXB0aW9uVGV4dCIsImRlc2NyaXB0aW9uSUQiLCJzbGljZSIsImdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUERPTUNvbnRlbnQiLCJwZG9tQ29udGVudCIsImdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUm9sZSIsInNlYXJjaEluZGV4IiwiaiIsImVsZW1lbnRUYWciLCJlbGVtZW50VHlwZSIsImVsZW1lbnRSb2xlIiwic2VhcmNoUm9sZSIsInJlYWROZXh0UHJldmlvdXNMaW5lIiwibGluZSIsImxldHRlclBvc2l0aW9uIiwid29yZFBvc2l0aW9uIiwiYWNjZXNzaWJsZVRleHQiLCJwb3NpdGlvbkluTGluZSIsInByZXZpb3VzRWxlbWVudCIsImxpbmVMaW1pdCIsImFjdGl2ZUxpbmUiLCJyZWFkQWN0aXZlTGluZSIsImFjdGl2ZVdvcmRzIiwicmVhZE5leHRQcmV2aW91c1dvcmQiLCJjb250ZW50RW5kIiwib3V0cHV0VGV4dCIsInJlYWROZXh0UHJldmlvdXNIZWFkaW5nIiwiaGVhZGluZ0xldmVscyIsIm5leHRFbGVtZW50IiwiZGlyZWN0aW9uRGVzY3JpcHRpb25TdHJpbmciLCJub05leHRIZWFkaW5nU3RyaW5nIiwiaGVhZGluZ0xldmVsIiwibGV2ZWxTdHJpbmciLCJyZWFkTmV4dFByZXZpb3VzQnV0dG9uIiwicmVhZE5leHRQcmV2aW91c0Zvcm1FbGVtZW50IiwidGFnTmFtZXMiLCJhcmlhUm9sZXMiLCJjb25jYXQiLCJyZWFkTmV4dFByZXZpb3VzTGlzdEl0ZW0iLCJyZWFkTmV4dFByZXZpb3VzTGlzdCIsImxpc3RFbGVtZW50IiwibGlzdFRleHQiLCJpdGVtVGV4dCIsImZpcnN0SXRlbSIsInJlYWROZXh0UHJldmlvdXNDaGFyYWN0ZXIiLCJub3JtYWxpemVEaXJlY3Rpb24iLCJ1cGRhdGVMaXZlRWxlbWVudExpc3QiLCJvYnNlcnZlcnMiLCJkaXNjb25uZWN0IiwibXV0YXRpb25PYnNlcnZlckNhbGxiYWNrIiwibXV0YXRpb25zIiwibXV0YXRpb24iLCJtdXRhdGVkRWxlbWVudCIsInRhcmdldCIsImFkZGVkTm9kZXMiLCJ1cGRhdGVkVGV4dCIsImRhdGEiLCJvdXRwdXRVdHRlcmFuY2VQcm9wZXJ0eSIsInNldCIsIlV0dGVyYW5jZSIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIm9ic2VydmVyQ29uZmlnIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsIm9ic2VydmUiLCJwdXNoIiwicmVhZEVudGlyZURvY3VtZW50IiwiaXNGb2N1c2FibGUiLCJmb2N1c2FibGVSb2xlcyIsImZvY3VzYWJsZSIsImNvbnN0cnVjdG9yIiwic2VsZiIsInRpdGxlIiwia2V5U3RhdGUiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJrZXlDb2RlIiwic2hpZnRLZXlEb3duIiwic2hpZnRLZXkiLCJmb2N1cyIsInJlZ2lzdGVyIiwidGV4dCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7O0NBYUMsR0FFRCxPQUFPQSxjQUFjLGtDQUFrQztBQUN2RCxTQUFTQyxPQUFPLFFBQVEsbUJBQW1CO0FBRTNDLFlBQVk7QUFDWixNQUFNQyxRQUFRLEtBQUssZ0RBQWdEO0FBQ25FLE1BQU1DLGtCQUFrQixtQkFBbUIsNENBQTRDO0FBQ3ZGLE1BQU1DLFFBQVEsS0FBSyxvRkFBb0Y7QUFDdkcsTUFBTUMsbUJBQW1CLElBQUksd0NBQXdDO0FBQ3JFLE1BQU1DLE9BQU8sUUFBUSxpREFBaUQ7QUFDdEUsTUFBTUMsV0FBVyxZQUFZLGlFQUFpRTtBQUU5RixJQUFBLEFBQU1DLFNBQU4sTUFBTUE7SUErTUo7Ozs7Ozs7O0dBUUMsR0FDREMscUJB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