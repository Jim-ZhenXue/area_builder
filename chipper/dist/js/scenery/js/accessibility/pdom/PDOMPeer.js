// Copyright 2015-2024, University of Colorado Boulder
/**
 * An accessible peer controls the appearance of an accessible Node's instance in the parallel DOM. A PDOMPeer can
 * have up to four window.Elements displayed in the PDOM, see ftructor for details.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Jesse Greenberg
 */ import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import merge from '../../../../phet-core/js/merge.js';
import platform from '../../../../phet-core/js/platform.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import stripEmbeddingMarks from '../../../../phet-core/js/stripEmbeddingMarks.js';
import { FocusManager, PDOMInstance, PDOMSiblingStyle, PDOMUtils, scenery } from '../../imports.js';
// constants
const PRIMARY_SIBLING = 'PRIMARY_SIBLING';
const LABEL_SIBLING = 'LABEL_SIBLING';
const DESCRIPTION_SIBLING = 'DESCRIPTION_SIBLING';
const CONTAINER_PARENT = 'CONTAINER_PARENT';
const LABEL_TAG = PDOMUtils.TAGS.LABEL;
const INPUT_TAG = PDOMUtils.TAGS.INPUT;
const DISABLED_ATTRIBUTE_NAME = 'disabled';
// DOM observers that apply new CSS transformations are triggered when children, or inner content change. Updating
// style/positioning of the element will change attributes so we can't observe those changes since it would trigger
// the MutationObserver infinitely.
const OBSERVER_CONFIG = {
    attributes: false,
    childList: true,
    characterData: true
};
let globalId = 1;
// mutables instances to avoid creating many in operations that occur frequently
const scratchGlobalBounds = new Bounds2(0, 0, 0, 0);
const scratchSiblingBounds = new Bounds2(0, 0, 0, 0);
const globalNodeTranslationMatrix = new Matrix3();
const globalToClientScaleMatrix = new Matrix3();
const nodeScaleMagnitudeMatrix = new Matrix3();
let PDOMPeer = class PDOMPeer {
    /**
   * Initializes the object (either from a freshly-created state, or from a "disposed" state brought back from a
   * pool).
   *
   * NOTE: the PDOMPeer is not fully constructed until calling PDOMPeer.update() after creating from pool.
   * @private
   *
   * @param {PDOMInstance} pdomInstance
   * @param {Object} [options]
   * @returns {PDOMPeer} - Returns 'this' reference, for chaining
   */ initializePDOMPeer(pdomInstance, options) {
        options = merge({
            primarySibling: null
        }, options);
        assert && assert(!this.id || this.isDisposed, 'If we previously existed, we need to have been disposed');
        // @public {number} - unique ID
        this.id = this.id || globalId++;
        // @public {PDOMInstance}
        this.pdomInstance = pdomInstance;
        // @public {Node|null} only null for the root pdomInstance
        this.node = this.pdomInstance.node;
        // @public {Display} - Each peer is associated with a specific Display.
        this.display = pdomInstance.display;
        // @public {Trail} - NOTE: May have "gaps" due to pdomOrder usage.
        this.trail = pdomInstance.trail;
        // @private {boolean|null} - whether or not this PDOMPeer is visible in the PDOM
        // Only initialized to null, should not be set to it. isVisible() will return true if this.visible is null
        // (because it hasn't been set yet).
        this.visible = null;
        // @private {boolean|null} - whether or not the primary sibling of this PDOMPeer can receive focus.
        this.focusable = null;
        // @private {HTMLElement|null} - Optional label/description elements
        this._labelSibling = null;
        this._descriptionSibling = null;
        // @private {HTMLElement|null} - A parent element that can contain this primarySibling and other siblings, usually
        // the label and description content.
        this._containerParent = null;
        // @public {HTMLElement[]} Rather than guarantee that a peer is a tree with a root DOMElement,
        // allow multiple window.Elements at the top level of the peer. This is used for sorting the instance.
        // See this.orderElements for more info.
        this.topLevelElements = [];
        // @private {boolean} - flag that indicates that this peer has accessible content that changed, and so
        // the siblings need to be repositioned in the next Display.updateDisplay()
        this.positionDirty = false;
        // @private {boolean} - Flag that indicates that PDOM elements require a forced reflow next animation frame.
        // This is needed to fix a Safari VoiceOver bug where the accessible name is read incorrectly after elements
        // are hidden/displayed. The usual workaround to force a reflow (set the style.display to none, query the offset,
        // set it back) only fixes the problem if the style.display attribute is set in the next animation frame.
        // See https://github.com/phetsims/a11y-research/issues/193.
        this.forceReflowWorkaround = false;
        // @private {boolean} - indicates that this peer's pdomInstance has a descendant that is dirty. Used to
        // quickly find peers with positionDirty when we traverse the tree of PDOMInstances
        this.childPositionDirty = false;
        // @private {boolean} - Indicates that this peer will position sibling elements so that
        // they are in the right location in the viewport, which is a requirement for touch based
        // screen readers. See setPositionInPDOM.
        this.positionInPDOM = false;
        // @private {MutationObserver} - An observer that will call back any time a property of the primary
        // sibling changes. Used to reposition the sibling elements if the bounding box resizes. No need to loop over
        // all of the mutations, any single mutation will require updating CSS positioning.
        //
        // NOTE: Ideally, a single MutationObserver could be used to observe changes to all elements in the PDOM. But
        // MutationObserver makes it impossible to detach observers from a single element. MutationObserver.detach()
        // will remove listeners on all observed elements, so individual observers must be used on each element.
        // One alternative could be to put the MutationObserver on the root element and use "subtree: true" in
        // OBSERVER_CONFIG. This could reduce the number of MutationObservers, but there is no easy way to get the
        // peer from the mutation target element. If MutationObserver takes a lot of memory, this could be an
        // optimization that may come with a performance cost.
        //
        // NOTE: ResizeObserver is a superior alternative to MutationObserver for this purpose because
        // it will only monitor changes we care about and prevent infinite callback loops if size is changed in
        // the callback function (we get around this now by not observing attribute changes). But it is not yet widely
        // supported, see https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver.
        //
        // TODO: Should we be watching "model" changes from ParallelDOM.js instead of using MutationObserver? https://github.com/phetsims/scenery/issues/1581
        // See https://github.com/phetsims/scenery/issues/852. This would be less fragile, and also less
        // memory intensive because we don't need an instance of MutationObserver on every PDOMInstance.
        this.mutationObserver = this.mutationObserver || new MutationObserver(this.invalidateCSSPositioning.bind(this, false));
        // @private {function} - must be removed on disposal
        this.transformListener = this.transformListener || this.invalidateCSSPositioning.bind(this, false);
        this.pdomInstance.transformTracker.addListener(this.transformListener);
        // @private {*} - To support setting the Display.interactive=false (which sets disabled on all primarySiblings,
        // we need to set disabled on a separate channel from this.setAttributeToElement. That way we cover the case where
        // `disabled` was set through the ParallelDOM API when we need to toggle it specifically for Display.interactive.
        // This way we can conserve the previous `disabled` attribute/property value through toggling Display.interactive.
        this._preservedDisabledValue = null;
        // @private {boolean} - Whether we are currently in a "disposed" (in the pool) state, or are available to be
        // interacted with.
        this.isDisposed = false;
        // edge case for root accessibility
        if (this.pdomInstance.isRootInstance) {
            // @private {HTMLElement} - The main element associated with this peer. If focusable, this is the element that gets
            // the focus. It also will contain any children.
            this._primarySibling = options.primarySibling;
            this._primarySibling.classList.add(PDOMSiblingStyle.ROOT_CLASS_NAME);
            // Stop blocked events from bubbling past the root of the PDOM so that scenery does
            // not dispatch them in Input.js.
            PDOMUtils.BLOCKED_DOM_EVENTS.forEach((eventType)=>{
                this._primarySibling.addEventListener(eventType, (event)=>{
                    event.stopPropagation();
                });
            });
        }
        return this;
    }
    /**
   * Update the content of the peer. This must be called after the AccessibePeer is constructed from pool.
   * @param {boolean} updateIndicesStringAndElementIds - if this function should be called upon initial "construction" (in update), allows for the option to do this lazily, see https://github.com/phetsims/phet-io/issues/1847
   * @public (scenery-internal)
   */ update(updateIndicesStringAndElementIds) {
        let options = this.node.getBaseOptions();
        const callbacksForOtherNodes = [];
        if (this.node.accessibleName !== null) {
            options = this.node.accessibleNameBehavior(this.node, options, this.node.accessibleName, callbacksForOtherNodes);
            assert && assert(typeof options === 'object', 'should return an object');
        }
        if (this.node.pdomHeading !== null) {
            options = this.node.pdomHeadingBehavior(this.node, options, this.node.pdomHeading, callbacksForOtherNodes);
            assert && assert(typeof options === 'object', 'should return an object');
        }
        if (this.node.helpText !== null) {
            options = this.node.helpTextBehavior(this.node, options, this.node.helpText, callbacksForOtherNodes);
            assert && assert(typeof options === 'object', 'should return an object');
        }
        // create the base DOM element representing this accessible instance
        // TODO: why not just options.focusable? https://github.com/phetsims/scenery/issues/1581
        this._primarySibling = createElement(options.tagName, this.node.focusable, {
            namespace: options.pdomNamespace
        });
        // create the container parent for the dom siblings
        if (options.containerTagName) {
            this._containerParent = createElement(options.containerTagName, false);
        }
        // create the label DOM element representing this instance
        if (options.labelTagName) {
            this._labelSibling = createElement(options.labelTagName, false, {
                excludeFromInput: this.node.excludeLabelSiblingFromInput
            });
        }
        // create the description DOM element representing this instance
        if (options.descriptionTagName) {
            this._descriptionSibling = createElement(options.descriptionTagName, false);
        }
        updateIndicesStringAndElementIds && this.updateIndicesStringAndElementIds();
        this.orderElements(options);
        // assign listeners (to be removed or disconnected during disposal)
        this.mutationObserver.disconnect(); // in case update() is called more than once on an instance of PDOMPeer
        this.mutationObserver.observe(this._primarySibling, OBSERVER_CONFIG);
        // set the accessible label now that the element has been recreated again, but not if the tagName
        // has been cleared out
        if (options.labelContent && options.labelTagName !== null) {
            this.setLabelSiblingContent(options.labelContent);
        }
        // restore the innerContent
        if (options.innerContent && options.tagName !== null) {
            this.setPrimarySiblingContent(options.innerContent);
        }
        // set the accessible description, but not if the tagName has been cleared out.
        if (options.descriptionContent && options.descriptionTagName !== null) {
            this.setDescriptionSiblingContent(options.descriptionContent);
        }
        // if element is an input element, set input type
        if (options.tagName.toUpperCase() === INPUT_TAG && options.inputType) {
            this.setAttributeToElement('type', options.inputType);
        }
        // if the label element happens to be a 'label', associate with 'for' attribute (must be done after updating IDs)
        if (options.labelTagName && options.labelTagName.toUpperCase() === LABEL_TAG) {
            this.setAttributeToElement('for', this._primarySibling.id, {
                elementName: PDOMPeer.LABEL_SIBLING
            });
        }
        this.setFocusable(this.node.focusable);
        // set the positionInPDOM field to our updated instance
        this.setPositionInPDOM(this.node.positionInPDOM);
        // recompute and assign the association attributes that link two elements (like aria-labelledby)
        this.onAriaLabelledbyAssociationChange();
        this.onAriaDescribedbyAssociationChange();
        this.onActiveDescendantAssociationChange();
        // update all attributes for the peer, should cover aria-label, role, and others
        this.onAttributeChange(options);
        // update all classes for the peer
        this.onClassChange();
        // update input value attribute for the peer
        this.onInputValueChange();
        this.node.updateOtherNodesAriaLabelledby();
        this.node.updateOtherNodesAriaDescribedby();
        this.node.updateOtherNodesActiveDescendant();
        callbacksForOtherNodes.forEach((callback)=>{
            assert && assert(typeof callback === 'function');
            callback();
        });
    }
    /**
   * Handle the internal ordering of the elements in the peer, this involves setting the proper value of
   * this.topLevelElements
   * @param {Object} config - the computed mixin options to be applied to the peer. (select ParallelDOM mutator keys)
   * @private
   */ orderElements(config) {
        if (this._containerParent) {
            // The first child of the container parent element should be the peer dom element
            // if undefined, the insertBefore method will insert the this._primarySibling as the first child
            this._containerParent.insertBefore(this._primarySibling, this._containerParent.children[0] || null);
            this.topLevelElements = [
                this._containerParent
            ];
        } else {
            // Wean out any null siblings
            this.topLevelElements = [
                this._labelSibling,
                this._descriptionSibling,
                this._primarySibling
            ].filter(_.identity);
        }
        // insert the label and description elements in the correct location if they exist
        // NOTE: Important for arrangeContentElement to be called on the label sibling first for correct order
        this._labelSibling && this.arrangeContentElement(this._labelSibling, config.appendLabel);
        this._descriptionSibling && this.arrangeContentElement(this._descriptionSibling, config.appendDescription);
    }
    /**
   * Get the primary sibling element for the peer
   * @public
   * @returns {HTMLElement|null}
   */ getPrimarySibling() {
        return this._primarySibling;
    }
    get primarySibling() {
        return this.getPrimarySibling();
    }
    /**
   * Get the primary sibling element for the peer
   * @public
   * @returns {HTMLElement|null}
   */ getLabelSibling() {
        return this._labelSibling;
    }
    get labelSibling() {
        return this.getLabelSibling();
    }
    /**
   * Get the primary sibling element for the peer
   * @public
   * @returns {HTMLElement|null}
   */ getDescriptionSibling() {
        return this._descriptionSibling;
    }
    get descriptionSibling() {
        return this.getDescriptionSibling();
    }
    /**
   * Get the primary sibling element for the peer
   * @public
   * @returns {HTMLElement|null}
   */ getContainerParent() {
        return this._containerParent;
    }
    get containerParent() {
        return this.getContainerParent();
    }
    /**
   * Returns the top-level element that contains the primary sibling. If there is no container parent, then the primary
   * sibling is returned.
   * @public
   *
   * @returns {HTMLElement|null}
   */ getTopLevelElementContainingPrimarySibling() {
        return this._containerParent || this._primarySibling;
    }
    /**
   * Recompute the aria-labelledby attributes for all of the peer's elements
   * @public
   */ onAriaLabelledbyAssociationChange() {
        this.removeAttributeFromAllElements('aria-labelledby');
        for(let i = 0; i < this.node.ariaLabelledbyAssociations.length; i++){
            const associationObject = this.node.ariaLabelledbyAssociations[i];
            // Assert out if the model list is different than the data held in the associationObject
            assert && assert(associationObject.otherNode.nodesThatAreAriaLabelledbyThisNode.indexOf(this.node) >= 0, 'unexpected otherNode');
            this.setAssociationAttribute('aria-labelledby', associationObject);
        }
    }
    /**
   * Recompute the aria-describedby attributes for all of the peer's elements
   * @public
   */ onAriaDescribedbyAssociationChange() {
        this.removeAttributeFromAllElements('aria-describedby');
        for(let i = 0; i < this.node.ariaDescribedbyAssociations.length; i++){
            const associationObject = this.node.ariaDescribedbyAssociations[i];
            // Assert out if the model list is different than the data held in the associationObject
            assert && assert(associationObject.otherNode.nodesThatAreAriaDescribedbyThisNode.indexOf(this.node) >= 0, 'unexpected otherNode');
            this.setAssociationAttribute('aria-describedby', associationObject);
        }
    }
    /**
   * Recompute the aria-activedescendant attributes for all of the peer's elements
   * @public
   */ onActiveDescendantAssociationChange() {
        this.removeAttributeFromAllElements('aria-activedescendant');
        for(let i = 0; i < this.node.activeDescendantAssociations.length; i++){
            const associationObject = this.node.activeDescendantAssociations[i];
            // Assert out if the model list is different than the data held in the associationObject
            assert && assert(associationObject.otherNode.nodesThatAreActiveDescendantToThisNode.indexOf(this.node) >= 0, 'unexpected otherNode');
            this.setAssociationAttribute('aria-activedescendant', associationObject);
        }
    }
    /**
   * Set the new attribute to the element if the value is a string. It will otherwise be null or undefined and should
   * then be removed from the element. This allows empty strings to be set as values.
   *
   * @param {string} key
   * @param {string|null|undefined} value
   * @private
   */ handleAttributeWithPDOMOption(key, value) {
        if (typeof value === 'string') {
            this.setAttributeToElement(key, value);
        } else {
            this.removeAttributeFromElement(key);
        }
    }
    /**
   * Set all pdom attributes onto the peer elements from the model's stored data objects
   * @private
   *
   * @param {Object} [pdomOptions] - these can override the values of the node, see this.update()
   */ onAttributeChange(pdomOptions) {
        for(let i = 0; i < this.node.pdomAttributes.length; i++){
            const dataObject = this.node.pdomAttributes[i];
            this.setAttributeToElement(dataObject.attribute, dataObject.value, dataObject.options);
        }
        // Manually support options that map to attributes. This covers that case where behavior functions want to change
        // these, but they aren't in node.pdomAttributes. It will do double work in some cases, but it is pretty minor for
        // the complexity it saves. https://github.com/phetsims/scenery/issues/1436. Empty strings should be settable for
        // these attributes but null and undefined are ignored.
        this.handleAttributeWithPDOMOption('aria-label', pdomOptions.ariaLabel);
        this.handleAttributeWithPDOMOption('role', pdomOptions.ariaRole);
    }
    /**
   * Set all classes onto the peer elements from the model's stored data objects
   * @private
   */ onClassChange() {
        for(let i = 0; i < this.node.pdomClasses.length; i++){
            const dataObject = this.node.pdomClasses[i];
            this.setClassToElement(dataObject.className, dataObject.options);
        }
    }
    /**
   * Set the input value on the peer's primary sibling element. The value attribute must be set as a Property to be
   * registered correctly by an assistive device. If null, the attribute is removed so that we don't clutter the DOM
   * with value="null" attributes.
   *
   * @public (scenery-internal)
   */ onInputValueChange() {
        assert && assert(this.node.inputValue !== undefined, 'use null to remove input value attribute');
        if (this.node.inputValue === null) {
            this.removeAttributeFromElement('value');
        } else {
            // type conversion for DOM spec
            const valueString = `${this.node.inputValue}`;
            this.setAttributeToElement('value', valueString, {
                type: 'property'
            });
        }
    }
    /**
   * Get an element on this node, looked up by the elementName flag passed in.
   * @public (scenery-internal)
   *
   * @param {string} elementName - see PDOMUtils for valid associations
   * @returns {HTMLElement}
   */ getElementByName(elementName) {
        if (elementName === PDOMPeer.PRIMARY_SIBLING) {
            return this._primarySibling;
        } else if (elementName === PDOMPeer.LABEL_SIBLING) {
            return this._labelSibling;
        } else if (elementName === PDOMPeer.DESCRIPTION_SIBLING) {
            return this._descriptionSibling;
        } else if (elementName === PDOMPeer.CONTAINER_PARENT) {
            return this._containerParent;
        }
        throw new Error(`invalid elementName name: ${elementName}`);
    }
    /**
   * Sets a attribute on one of the peer's window.Elements.
   * @public (scenery-internal)
   * @param {string} attribute
   * @param {*} attributeValue
   * @param {Object} [options]
   */ setAttributeToElement(attribute, attributeValue, options) {
        options = merge({
            // {string|null} - If non-null, will set the attribute with the specified namespace. This can be required
            // for setting certain attributes (e.g. MathML).
            namespace: null,
            // set as a javascript property instead of an attribute on the DOM Element.
            type: 'attribute',
            elementName: PRIMARY_SIBLING,
            // {HTMLElement|null} - element that will directly receive the input rather than looking up by name, if
            // provided, elementName option will have no effect
            element: null
        }, options);
        const element = options.element || this.getElementByName(options.elementName);
        // For dynamic strings, we may need to retrieve the actual value.
        const rawAttributeValue = PDOMUtils.unwrapProperty(attributeValue);
        // remove directional formatting that may surround strings if they are translatable
        let attributeValueWithoutMarks = rawAttributeValue;
        if (typeof rawAttributeValue === 'string') {
            attributeValueWithoutMarks = stripEmbeddingMarks(rawAttributeValue);
        }
        if (attribute === DISABLED_ATTRIBUTE_NAME && !this.display.interactive) {
            // The presence of the `disabled` attribute means it is always disabled.
            this._preservedDisabledValue = options.type === 'property' ? attributeValueWithoutMarks : true;
        }
        if (options.namespace) {
            element.setAttributeNS(options.namespace, attribute, attributeValueWithoutMarks);
        } else if (options.type === 'property') {
            element[attribute] = attributeValueWithoutMarks;
        } else {
            element.setAttribute(attribute, attributeValueWithoutMarks);
        }
    }
    /**
   * Remove attribute from one of the peer's window.Elements.
   * @public (scenery-internal)
   * @param {string} attribute
   * @param {Object} [options]
   */ removeAttributeFromElement(attribute, options) {
        options = merge({
            // {string|null} - If non-null, will set the attribute with the specified namespace. This can be required
            // for setting certain attributes (e.g. MathML).
            namespace: null,
            elementName: PRIMARY_SIBLING,
            // {HTMLElement|null} - element that will directly receive the input rather than looking up by name, if
            // provided, elementName option will have no effect
            element: null
        }, options);
        const element = options.element || this.getElementByName(options.elementName);
        if (options.namespace) {
            element.removeAttributeNS(options.namespace, attribute);
        } else if (attribute === DISABLED_ATTRIBUTE_NAME && !this.display.interactive) {
            // maintain our interal disabled state in case the display toggles back to be interactive.
            this._preservedDisabledValue = false;
        } else {
            element.removeAttribute(attribute);
        }
    }
    /**
   * Remove the given attribute from all peer elements
   * @public (scenery-internal)
   * @param {string} attribute
   */ removeAttributeFromAllElements(attribute) {
        assert && assert(attribute !== DISABLED_ATTRIBUTE_NAME, 'this method does not currently support disabled, to make Display.interactive toggling easier to implement');
        assert && assert(typeof attribute === 'string');
        this._primarySibling && this._primarySibling.removeAttribute(attribute);
        this._labelSibling && this._labelSibling.removeAttribute(attribute);
        this._descriptionSibling && this._descriptionSibling.removeAttribute(attribute);
        this._containerParent && this._containerParent.removeAttribute(attribute);
    }
    /**
   * Add the provided className to the element's classList.
   *
   * @public
   * @param {string} className
   * @param {Object} [options]
   */ setClassToElement(className, options) {
        assert && assert(typeof className === 'string');
        options = merge({
            // Name of the element who we are adding the class to, see this.getElementName() for valid values
            elementName: PRIMARY_SIBLING
        }, options);
        this.getElementByName(options.elementName).classList.add(className);
    }
    /**
   * Remove the specified className from the element.
   * @public
   *
   * @param {string} className
   * @param {Object} [options]
   */ removeClassFromElement(className, options) {
        assert && assert(typeof className === 'string');
        options = merge({
            // Name of the element who we are removing the class from, see this.getElementName() for valid values
            elementName: PRIMARY_SIBLING
        }, options);
        this.getElementByName(options.elementName).classList.remove(className);
    }
    /**
   * Set either association attribute (aria-labelledby/describedby) on one of this peer's Elements
   * @public (scenery-internal)
   * @param {string} attribute - either aria-labelledby or aria-describedby
   * @param {Object} associationObject - see addAriaLabelledbyAssociation() for schema
   */ setAssociationAttribute(attribute, associationObject) {
        assert && assert(PDOMUtils.ASSOCIATION_ATTRIBUTES.indexOf(attribute) >= 0, `unsupported attribute for setting with association object: ${attribute}`);
        const otherNodePDOMInstances = associationObject.otherNode.getPDOMInstances();
        // If the other node hasn't been added to the scene graph yet, it won't have any accessible instances, so no op.
        // This will be recalculated when that node is added to the scene graph
        if (otherNodePDOMInstances.length > 0) {
            // We are just using the first PDOMInstance for simplicity, but it is OK because the accessible
            // content for all PDOMInstances will be the same, so the Accessible Names (in the browser's
            // accessibility tree) of elements that are referenced by the attribute value id will all have the same content
            const firstPDOMInstance = otherNodePDOMInstances[0];
            // Handle a case where you are associating to yourself, and the peer has not been constructed yet.
            if (firstPDOMInstance === this.pdomInstance) {
                firstPDOMInstance.peer = this;
            }
            assert && assert(firstPDOMInstance.peer, 'peer should exist');
            // we can use the same element's id to update all of this Node's peers
            const otherPeerElement = firstPDOMInstance.peer.getElementByName(associationObject.otherElementName);
            const element = this.getElementByName(associationObject.thisElementName);
            // to support any option order, no-op if the peer element has not been created yet.
            if (element && otherPeerElement) {
                // only update associations if the requested peer element has been created
                // NOTE: in the future, we would like to verify that the association exists but can't do that yet because
                // we have to support cases where we set label association prior to setting the sibling/parent tagName
                const previousAttributeValue = element.getAttribute(attribute) || '';
                assert && assert(typeof previousAttributeValue === 'string');
                const newAttributeValue = [
                    previousAttributeValue.trim(),
                    otherPeerElement.id
                ].join(' ').trim();
                // add the id from the new association to the value of the HTMLElement's attribute.
                this.setAttributeToElement(attribute, newAttributeValue, {
                    elementName: associationObject.thisElementName
                });
            }
        }
    }
    /**
   * The contentElement will either be a label or description element. The contentElement will be sorted relative to
   * the primarySibling. Its placement will also depend on whether or not this node wants to append this element,
   * see setAppendLabel() and setAppendDescription(). By default, the "content" element will be placed before the
   * primarySibling.
   *
   * NOTE: This function assumes it is called on label sibling before description sibling for inserting elements
   * into the correct order.
   *
   * @private
   *
   * @param {HTMLElement} contentElement
   * @param {boolean} appendElement
   */ arrangeContentElement(contentElement, appendElement) {
        // if there is a containerParent
        if (this.topLevelElements[0] === this._containerParent) {
            assert && assert(this.topLevelElements.length === 1);
            if (appendElement) {
                this._containerParent.appendChild(contentElement);
            } else {
                this._containerParent.insertBefore(contentElement, this._primarySibling);
            }
        } else {
            // keep this.topLevelElements in sync
            arrayRemove(this.topLevelElements, contentElement);
            const indexOfPrimarySibling = this.topLevelElements.indexOf(this._primarySibling);
            // if appending, just insert at at end of the top level elements
            const insertIndex = appendElement ? this.topLevelElements.length : indexOfPrimarySibling;
            this.topLevelElements.splice(insertIndex, 0, contentElement);
        }
    }
    /**
   * Is this peer hidden in the PDOM
   * @public
   *
   * @returns {boolean}
   */ isVisible() {
        if (assert) {
            let visibleElements = 0;
            this.topLevelElements.forEach((element)=>{
                // support property or attribute
                if (!element.hidden && !element.hasAttribute('hidden')) {
                    visibleElements += 1;
                }
            });
            assert(this.visible ? visibleElements === this.topLevelElements.length : visibleElements === 0, 'some of the peer\'s elements are visible and some are not');
        }
        return this.visible === null ? true : this.visible; // default to true if visibility hasn't been set yet.
    }
    /**
   * Set whether or not the peer is visible in the PDOM
   * @public
   *
   * @param {boolean} visible
   */ setVisible(visible) {
        assert && assert(typeof visible === 'boolean');
        if (this.visible !== visible) {
            this.visible = visible;
            for(let i = 0; i < this.topLevelElements.length; i++){
                const element = this.topLevelElements[i];
                if (visible) {
                    this.removeAttributeFromElement('hidden', {
                        element: element
                    });
                } else {
                    this.setAttributeToElement('hidden', '', {
                        element: element
                    });
                }
            }
            // Invalidate CSS transforms because when 'hidden' the content will have no dimensions in the viewport. For
            // a Safari VoiceOver bug, also force a reflow in the next animation frame to ensure that the accessible name is
            // correct.
            // TODO: Remove this when the bug is fixed. See https://github.com/phetsims/a11y-research/issues/193
            this.invalidateCSSPositioning(platform.safari);
        }
    }
    /**
   * Returns if this peer is focused. A peer is focused if its primarySibling is focused.
   * @public (scenery-internal)
   * @returns {boolean}
   */ isFocused() {
        const visualFocusTrail = PDOMInstance.guessVisualTrail(this.trail, this.display.rootNode);
        return FocusManager.pdomFocusProperty.value && FocusManager.pdomFocusProperty.value.trail.equals(visualFocusTrail);
    }
    /**
   * Focus the primary sibling of the peer. If this peer is not visible, this is a no-op (native behavior).
   * @public (scenery-internal)
   */ focus() {
        assert && assert(this._primarySibling, 'must have a primary sibling to focus');
        // We do not want to steal focus from any parent application. For example, if this element is in an iframe.
        // See https://github.com/phetsims/joist/issues/897.
        if (FocusManager.windowHasFocusProperty.value) {
            this._primarySibling.focus();
        }
    }
    /**
   * Blur the primary sibling of the peer.
   * @public (scenery-internal)
   */ blur() {
        assert && assert(this._primarySibling, 'must have a primary sibling to blur');
        // no op by the browser if primary sibling does not have focus
        this._primarySibling.blur();
    }
    /**
   * Make the peer focusable. Only the primary sibling is ever considered focusable.
   * @public
   * @param {boolean} focusable
   */ setFocusable(focusable) {
        assert && assert(typeof focusable === 'boolean');
        const peerHadFocus = this.isFocused();
        if (this.focusable !== focusable) {
            this.focusable = focusable;
            PDOMUtils.overrideFocusWithTabIndex(this.primarySibling, focusable);
            // in Chrome, if tabindex is removed and the element is not focusable by default the element is blurred.
            // This behavior is reasonable and we want to enforce it in other browsers for consistency. See
            // https://github.com/phetsims/scenery/issues/967
            if (peerHadFocus && !focusable) {
                this.blur();
            }
            // reposition the sibling in the DOM, since non-focusable nodes are not positioned
            this.invalidateCSSPositioning();
        }
    }
    /**
   * Responsible for setting the content for the label sibling
   * @public (scenery-internal)
   * @param {string|null} content - the content for the label sibling.
   */ setLabelSiblingContent(content) {
        assert && assert(content === null || typeof content === 'string', 'incorrect label content type');
        // no-op to support any option order
        if (!this._labelSibling) {
            return;
        }
        PDOMUtils.setTextContent(this._labelSibling, content);
    }
    /**
   * Responsible for setting the content for the description sibling
   * @public (scenery-internal)
   * @param {string|null} content - the content for the description sibling.
   */ setDescriptionSiblingContent(content) {
        assert && assert(content === null || typeof content === 'string', 'incorrect description content type');
        // no-op to support any option order
        if (!this._descriptionSibling) {
            return;
        }
        PDOMUtils.setTextContent(this._descriptionSibling, content);
    }
    /**
   * Responsible for setting the content for the primary sibling
   * @public (scenery-internal)
   * @param {string|null} content - the content for the primary sibling.
   */ setPrimarySiblingContent(content) {
        assert && assert(content === null || typeof content === 'string', 'incorrect inner content type');
        assert && assert(this.pdomInstance.children.length === 0, 'descendants exist with accessible content, innerContent cannot be used');
        assert && assert(PDOMUtils.tagNameSupportsContent(this._primarySibling.tagName), `tagName: ${this.node.tagName} does not support inner content`);
        // no-op to support any option order
        if (!this._primarySibling) {
            return;
        }
        PDOMUtils.setTextContent(this._primarySibling, content);
    }
    /**
   * Sets the pdomTransformSourceNode so that the primary sibling will be transformed with changes to along the
   * unique trail to the source node. If null, repositioning happens with transform changes along this
   * pdomInstance's trail.
   * @public
   *
   * @param {../nodes/Node|null} node
   */ setPDOMTransformSourceNode(node) {
        // remove previous listeners before creating a new TransformTracker
        this.pdomInstance.transformTracker.removeListener(this.transformListener);
        this.pdomInstance.updateTransformTracker(node);
        // add listeners back after update
        this.pdomInstance.transformTracker.addListener(this.transformListener);
        // new trail with transforms so positioning is probably dirty
        this.invalidateCSSPositioning();
    }
    /**
   * Enable or disable positioning of the sibling elements. Generally this is requiredfor accessibility to work on
   * touch screen based screen readers like phones. But repositioning DOM elements is expensive. This can be set to
   * false to optimize when positioning is not necessary.
   * @public (scenery-internal)
   *
   * @param {boolean} positionInPDOM
   */ setPositionInPDOM(positionInPDOM) {
        this.positionInPDOM = positionInPDOM;
        // signify that it needs to be repositioned next frame, either off screen or to match
        // graphical rendering
        this.invalidateCSSPositioning();
    }
    // @private
    getElementId(siblingName, stringId) {
        return `display${this.display.id}-${siblingName}-${stringId}`;
    }
    // @public
    updateIndicesStringAndElementIds() {
        const indices = this.pdomInstance.getPDOMInstanceUniqueId();
        if (this._primarySibling) {
            // NOTE: dataset isn't supported by all namespaces (like MathML) so we need to use setAttribute
            this._primarySibling.setAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID, indices);
            this._primarySibling.id = this.getElementId('primary', indices);
        }
        if (this._labelSibling) {
            // NOTE: dataset isn't supported by all namespaces (like MathML) so we need to use setAttribute
            this._labelSibling.setAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID, indices);
            this._labelSibling.id = this.getElementId('label', indices);
        }
        if (this._descriptionSibling) {
            // NOTE: dataset isn't supported by all namespaces (like MathML) so we need to use setAttribute
            this._descriptionSibling.setAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID, indices);
            this._descriptionSibling.id = this.getElementId('description', indices);
        }
        if (this._containerParent) {
            // NOTE: dataset isn't supported by all namespaces (like MathML) so we need to use setAttribute
            this._containerParent.setAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID, indices);
            this._containerParent.id = this.getElementId('container', indices);
        }
    }
    /**
   * Mark that the siblings of this PDOMPeer need to be updated in the next Display update. Possibly from a
   * change of accessible content or node transformation. Does nothing if already marked dirty.
   *
   * @param [forceReflowWorkaround] - In addition to repositioning, force a reflow next animation frame? See
   *                                  this.forceReflowWorkaround for more information.
   * @private
   */ invalidateCSSPositioning(forceReflowWorkaround = false) {
        if (!this.positionDirty) {
            this.positionDirty = true;
            if (forceReflowWorkaround) {
                this.forceReflowWorkaround = true;
                // `transform=scale(1)` forces a reflow so we can set this and revert it in the next animation frame.
                // Transform is used instead of `display='none'` because changing display impacts focus.
                for(let i = 0; i < this.topLevelElements.length; i++){
                    this.topLevelElements[i].style.transform = 'scale(1)';
                }
            }
            // mark all ancestors of this peer so that we can quickly find this dirty peer when we traverse
            // the PDOMInstance tree
            let parent = this.pdomInstance.parent;
            while(parent){
                parent.peer.childPositionDirty = true;
                parent = parent.parent;
            }
        }
    }
    /**
   * Update the CSS positioning of the primary and label siblings. Required to support accessibility on mobile
   * devices. On activation of focusable elements, certain AT will send fake pointer events to the browser at
   * the center of the client bounding rectangle of the HTML element. By positioning elements over graphical display
   * objects we can capture those events. A transformation matrix is calculated that will transform the position
   * and dimension of the HTML element in pixels to the global coordinate frame. The matrix is used to transform
   * the bounds of the element prior to any other transformation so we can set the element's left, top, width, and
   * height with CSS attributes.
   *
   * For now we are only transforming the primary and label siblings if the primary sibling is focusable. If
   * focusable, the primary sibling needs to be transformed to receive user input. VoiceOver includes the label bounds
   * in its calculation for where to send the events, so it needs to be transformed as well. Descriptions are not
   * considered and do not need to be positioned.
   *
   * Initially, we tried to set the CSS transformations on elements directly through the transform attribute. While
   * this worked for basic input, it did not support other AT features like tapping the screen to focus elements.
   * With this strategy, the VoiceOver "touch area" was a small box around the top left corner of the element. It was
   * never clear why this was this case, but forced us to change our strategy to set the left, top, width, and height
   * attributes instead.
   *
   * This function assumes that elements have other style attributes so they can be positioned correctly and don't
   * interfere with scenery input, see SceneryStyle in PDOMUtils.
   *
   * Additional notes were taken in https://github.com/phetsims/scenery/issues/852, see that issue for more
   * information.
   *
   * Review: This function could be simplified by setting the element width/height a small arbitrary shape
   * at the center of the node's global bounds. There is a drawback in that the VO default highlight won't
   * surround the Node anymore. But it could be a performance enhancement and simplify this function.
   * Or maybe a big rectangle larger than the Display div still centered on the node so we never
   * see the VO highlight?
   *
   * @private
   */ positionElements(positionInPDOM) {
        assert && assert(this._primarySibling, 'a primary sibling required to receive CSS positioning');
        assert && assert(this.positionDirty, 'elements should only be repositioned if dirty');
        // CSS transformation only needs to be applied if the node is focusable - otherwise the element will be found
        // by gesture navigation with the virtual cursor. Bounds for non-focusable elements in the ViewPort don't
        // need to be accurate because the AT doesn't need to send events to them.
        if (positionInPDOM) {
            const transformSourceNode = this.node.pdomTransformSourceNode || this.node;
            scratchGlobalBounds.set(transformSourceNode.localBounds);
            if (scratchGlobalBounds.isFinite()) {
                scratchGlobalBounds.transform(this.pdomInstance.transformTracker.getMatrix());
                // no need to position if the node is fully outside of the Display bounds (out of view)
                const displayBounds = this.display.bounds;
                if (displayBounds.intersectsBounds(scratchGlobalBounds)) {
                    // Constrain the global bounds to Display bounds so that center of the sibling element
                    // is always in the Display. We may miss input if the center of the Node is outside
                    // the Display, where VoiceOver would otherwise send pointer events.
                    scratchGlobalBounds.constrainBounds(displayBounds);
                    let clientDimensions = getClientDimensions(this._primarySibling);
                    let clientWidth = clientDimensions.width;
                    let clientHeight = clientDimensions.height;
                    if (clientWidth > 0 && clientHeight > 0) {
                        scratchSiblingBounds.setMinMax(0, 0, clientWidth, clientHeight);
                        scratchSiblingBounds.transform(getCSSMatrix(clientWidth, clientHeight, scratchGlobalBounds));
                        setClientBounds(this._primarySibling, scratchSiblingBounds);
                    }
                    if (this.labelSibling) {
                        clientDimensions = getClientDimensions(this._labelSibling);
                        clientWidth = clientDimensions.width;
                        clientHeight = clientDimensions.height;
                        if (clientHeight > 0 && clientWidth > 0) {
                            scratchSiblingBounds.setMinMax(0, 0, clientWidth, clientHeight);
                            scratchSiblingBounds.transform(getCSSMatrix(clientWidth, clientHeight, scratchGlobalBounds));
                            setClientBounds(this._labelSibling, scratchSiblingBounds);
                        }
                    }
                }
            }
        } else {
            // not positioning, just move off screen
            scratchSiblingBounds.set(PDOMPeer.OFFSCREEN_SIBLING_BOUNDS);
            setClientBounds(this._primarySibling, scratchSiblingBounds);
            if (this._labelSibling) {
                setClientBounds(this._labelSibling, scratchSiblingBounds);
            }
        }
        if (this.forceReflowWorkaround) {
            // Force a reflow (recalculation of DOM layout) to fix the accessible name.
            this.topLevelElements.forEach((element)=>{
                element.style.transform = ''; // force reflow request by removing the transform added in the previous frame
                element.style.offsetHeight; // query the offsetHeight after restoring display to force reflow
            });
        }
        this.positionDirty = false;
        this.forceReflowWorkaround = false;
    }
    /**
   * Update positioning of elements in the PDOM. Does a depth first search for all descendants of parentIntsance with
   * a peer that either has dirty positioning or as a descendant with dirty positioning.
   *
   * @public (scenery-internal)
   */ updateSubtreePositioning(parentPositionInPDOM = false) {
        this.childPositionDirty = false;
        const positionInPDOM = this.positionInPDOM || parentPositionInPDOM;
        if (this.positionDirty) {
            this.positionElements(positionInPDOM);
        }
        for(let i = 0; i < this.pdomInstance.children.length; i++){
            const childPeer = this.pdomInstance.children[i].peer;
            if (childPeer.positionDirty || childPeer.childPositionDirty) {
                this.pdomInstance.children[i].peer.updateSubtreePositioning(positionInPDOM);
            }
        }
    }
    /**
   * Recursively set this PDOMPeer and children to be disabled. This will overwrite any previous value of disabled
   * that may have been set, but will keep track of the old value, and restore its state upon re-enabling.
   * @param {boolean} disabled
   * @public
   */ recursiveDisable(disabled) {
        if (disabled) {
            this._preservedDisabledValue = this._primarySibling.disabled;
            this._primarySibling.disabled = true;
        } else {
            this._primarySibling.disabled = this._preservedDisabledValue;
        }
        for(let i = 0; i < this.pdomInstance.children.length; i++){
            this.pdomInstance.children[i].peer.recursiveDisable(disabled);
        }
    }
    /**
   * Removes external references from this peer, and places it in the pool.
   * @public (scenery-internal)
   */ dispose() {
        this.isDisposed = true;
        // remove focus if the disposed peer is the active element
        this.blur();
        // remove listeners
        this._primarySibling.removeEventListener('blur', this.blurEventListener);
        this._primarySibling.removeEventListener('focus', this.focusEventListener);
        this.pdomInstance.transformTracker.removeListener(this.transformListener);
        this.mutationObserver.disconnect();
        // zero-out references
        this.pdomInstance = null;
        this.node = null;
        this.display = null;
        this.trail = null;
        this._primarySibling = null;
        this._labelSibling = null;
        this._descriptionSibling = null;
        this._containerParent = null;
        this.focusable = null;
        // for now
        this.freeToPool();
    }
    /**
   * @param {PDOMInstance} pdomInstance
   * @param {Object} [options]
   * @mixes Poolable
   */ constructor(pdomInstance, options){
        this.initializePDOMPeer(pdomInstance, options);
    }
};
// @public {string} - specifies valid associations between related PDOMPeers in the DOM
PDOMPeer.PRIMARY_SIBLING = PRIMARY_SIBLING; // associate with all accessible content related to this peer
PDOMPeer.LABEL_SIBLING = LABEL_SIBLING; // associate with just the label content of this peer
PDOMPeer.DESCRIPTION_SIBLING = DESCRIPTION_SIBLING; // associate with just the description content of this peer
PDOMPeer.CONTAINER_PARENT = CONTAINER_PARENT; // associate with everything under the container parent of this peer
// @public (scenery-internal) - bounds for a sibling that should be moved off-screen when not positioning, in
// global coordinates
PDOMPeer.OFFSCREEN_SIBLING_BOUNDS = new Bounds2(0, 0, 1, 1);
scenery.register('PDOMPeer', PDOMPeer);
// Set up pooling
Poolable.mixInto(PDOMPeer, {
    initialize: PDOMPeer.prototype.initializePDOMPeer
});
//--------------------------------------------------------------------------
// Helper functions
//--------------------------------------------------------------------------
/**
 * Create a sibling element for the PDOMPeer.
 * TODO: this should be inlined with the PDOMUtils method https://github.com/phetsims/scenery/issues/1581
 * @param {string} tagName
 * @param {boolean} focusable
 * @param {Object} [options] - passed along to PDOMUtils.createElement
 * @returns {HTMLElement}
 */ function createElement(tagName, focusable, options) {
    options = merge({
        // {string|null} - addition to the trailId, separated by a hyphen to identify the different siblings within
        // the document
        siblingName: null,
        // {boolean} - if true, DOM input events received on the element will not be dispatched as SceneryEvents in Input.js
        // see ParallelDOM.setExcludeLabelSiblingFromInput for more information
        excludeFromInput: false
    }, options);
    const newElement = PDOMUtils.createElement(tagName, focusable, options);
    if (options.excludeFromInput) {
        newElement.setAttribute(PDOMUtils.DATA_EXCLUDE_FROM_INPUT, true);
    }
    return newElement;
}
/**
 * Get a matrix that can be used as the CSS transform for elements in the DOM. This matrix will an HTML element
 * dimensions in pixels to the global coordinate frame.
 *
 * @param  {number} clientWidth - width of the element to transform in pixels
 * @param  {number} clientHeight - height of the element to transform in pixels
 * @param  {Bounds2} nodeGlobalBounds - Bounds of the PDOMPeer's node in the global coordinate frame.
 * @returns {Matrix3}
 */ function getCSSMatrix(clientWidth, clientHeight, nodeGlobalBounds) {
    // the translation matrix for the node's bounds in its local coordinate frame
    globalNodeTranslationMatrix.setToTranslation(nodeGlobalBounds.minX, nodeGlobalBounds.minY);
    // scale matrix for "client" HTML element, scale to make the HTML element's DOM bounds match the
    // local bounds of the node
    globalToClientScaleMatrix.setToScale(nodeGlobalBounds.width / clientWidth, nodeGlobalBounds.height / clientHeight);
    // combine these in a single transformation matrix
    return globalNodeTranslationMatrix.multiplyMatrix(globalToClientScaleMatrix).multiplyMatrix(nodeScaleMagnitudeMatrix);
}
/**
 * Gets an object with the width and height of an HTML element in pixels, prior to any scaling. clientWidth and
 * clientHeight are zero for elements with inline layout and elements without CSS. For those elements we fall back
 * to the boundingClientRect, which at that point will describe the dimensions of the element prior to scaling.
 *
 * @param  {HTMLElement} siblingElement
 * @returns {Object} - Returns an object with two entries, { width: {number}, height: {number} }
 */ function getClientDimensions(siblingElement) {
    let clientWidth = siblingElement.clientWidth;
    let clientHeight = siblingElement.clientHeight;
    if (clientWidth === 0 && clientHeight === 0) {
        const clientRect = siblingElement.getBoundingClientRect();
        clientWidth = clientRect.width;
        clientHeight = clientRect.height;
    }
    return {
        width: clientWidth,
        height: clientHeight
    };
}
/**
 * Set the bounds of the sibling element in the view port in pixels, using top, left, width, and height css.
 * The element must be styled with 'position: fixed', and an ancestor must have position: 'relative', so that
 * the dimensions of the sibling are relative to the parent.
 *
 * @param {HTMLElement} siblingElement - the element to position
 * @param {Bounds2} bounds - desired bounds, in pixels
 */ function setClientBounds(siblingElement, bounds) {
    siblingElement.style.top = `${bounds.top}px`;
    siblingElement.style.left = `${bounds.left}px`;
    siblingElement.style.width = `${bounds.width}px`;
    siblingElement.style.height = `${bounds.height}px`;
}
export default PDOMPeer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BET01QZWVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFuIGFjY2Vzc2libGUgcGVlciBjb250cm9scyB0aGUgYXBwZWFyYW5jZSBvZiBhbiBhY2Nlc3NpYmxlIE5vZGUncyBpbnN0YW5jZSBpbiB0aGUgcGFyYWxsZWwgRE9NLiBBIFBET01QZWVyIGNhblxuICogaGF2ZSB1cCB0byBmb3VyIHdpbmRvdy5FbGVtZW50cyBkaXNwbGF5ZWQgaW4gdGhlIFBET00sIHNlZSBmdHJ1Y3RvciBmb3IgZGV0YWlscy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgcGxhdGZvcm0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3BsYXRmb3JtLmpzJztcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHN0cmlwRW1iZWRkaW5nTWFya3MgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3N0cmlwRW1iZWRkaW5nTWFya3MuanMnO1xuaW1wb3J0IHsgRm9jdXNNYW5hZ2VyLCBQRE9NSW5zdGFuY2UsIFBET01TaWJsaW5nU3R5bGUsIFBET01VdGlscywgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFBSSU1BUllfU0lCTElORyA9ICdQUklNQVJZX1NJQkxJTkcnO1xuY29uc3QgTEFCRUxfU0lCTElORyA9ICdMQUJFTF9TSUJMSU5HJztcbmNvbnN0IERFU0NSSVBUSU9OX1NJQkxJTkcgPSAnREVTQ1JJUFRJT05fU0lCTElORyc7XG5jb25zdCBDT05UQUlORVJfUEFSRU5UID0gJ0NPTlRBSU5FUl9QQVJFTlQnO1xuY29uc3QgTEFCRUxfVEFHID0gUERPTVV0aWxzLlRBR1MuTEFCRUw7XG5jb25zdCBJTlBVVF9UQUcgPSBQRE9NVXRpbHMuVEFHUy5JTlBVVDtcbmNvbnN0IERJU0FCTEVEX0FUVFJJQlVURV9OQU1FID0gJ2Rpc2FibGVkJztcblxuLy8gRE9NIG9ic2VydmVycyB0aGF0IGFwcGx5IG5ldyBDU1MgdHJhbnNmb3JtYXRpb25zIGFyZSB0cmlnZ2VyZWQgd2hlbiBjaGlsZHJlbiwgb3IgaW5uZXIgY29udGVudCBjaGFuZ2UuIFVwZGF0aW5nXG4vLyBzdHlsZS9wb3NpdGlvbmluZyBvZiB0aGUgZWxlbWVudCB3aWxsIGNoYW5nZSBhdHRyaWJ1dGVzIHNvIHdlIGNhbid0IG9ic2VydmUgdGhvc2UgY2hhbmdlcyBzaW5jZSBpdCB3b3VsZCB0cmlnZ2VyXG4vLyB0aGUgTXV0YXRpb25PYnNlcnZlciBpbmZpbml0ZWx5LlxuY29uc3QgT0JTRVJWRVJfQ09ORklHID0geyBhdHRyaWJ1dGVzOiBmYWxzZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiB0cnVlIH07XG5cbmxldCBnbG9iYWxJZCA9IDE7XG5cbi8vIG11dGFibGVzIGluc3RhbmNlcyB0byBhdm9pZCBjcmVhdGluZyBtYW55IGluIG9wZXJhdGlvbnMgdGhhdCBvY2N1ciBmcmVxdWVudGx5XG5jb25zdCBzY3JhdGNoR2xvYmFsQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTtcbmNvbnN0IHNjcmF0Y2hTaWJsaW5nQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTtcbmNvbnN0IGdsb2JhbE5vZGVUcmFuc2xhdGlvbk1hdHJpeCA9IG5ldyBNYXRyaXgzKCk7XG5jb25zdCBnbG9iYWxUb0NsaWVudFNjYWxlTWF0cml4ID0gbmV3IE1hdHJpeDMoKTtcbmNvbnN0IG5vZGVTY2FsZU1hZ25pdHVkZU1hdHJpeCA9IG5ldyBNYXRyaXgzKCk7XG5cbmNsYXNzIFBET01QZWVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7UERPTUluc3RhbmNlfSBwZG9tSW5zdGFuY2VcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAbWl4ZXMgUG9vbGFibGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBwZG9tSW5zdGFuY2UsIG9wdGlvbnMgKSB7XG4gICAgdGhpcy5pbml0aWFsaXplUERPTVBlZXIoIHBkb21JbnN0YW5jZSwgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBvYmplY3QgKGVpdGhlciBmcm9tIGEgZnJlc2hseS1jcmVhdGVkIHN0YXRlLCBvciBmcm9tIGEgXCJkaXNwb3NlZFwiIHN0YXRlIGJyb3VnaHQgYmFjayBmcm9tIGFcbiAgICogcG9vbCkuXG4gICAqXG4gICAqIE5PVEU6IHRoZSBQRE9NUGVlciBpcyBub3QgZnVsbHkgY29uc3RydWN0ZWQgdW50aWwgY2FsbGluZyBQRE9NUGVlci51cGRhdGUoKSBhZnRlciBjcmVhdGluZyBmcm9tIHBvb2wuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7UERPTUluc3RhbmNlfSBwZG9tSW5zdGFuY2VcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcmV0dXJucyB7UERPTVBlZXJ9IC0gUmV0dXJucyAndGhpcycgcmVmZXJlbmNlLCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIGluaXRpYWxpemVQRE9NUGVlciggcGRvbUluc3RhbmNlLCBvcHRpb25zICkge1xuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgcHJpbWFyeVNpYmxpbmc6IG51bGxcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pZCB8fCB0aGlzLmlzRGlzcG9zZWQsICdJZiB3ZSBwcmV2aW91c2x5IGV4aXN0ZWQsIHdlIG5lZWQgdG8gaGF2ZSBiZWVuIGRpc3Bvc2VkJyApO1xuXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIHVuaXF1ZSBJRFxuICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IGdsb2JhbElkKys7XG5cbiAgICAvLyBAcHVibGljIHtQRE9NSW5zdGFuY2V9XG4gICAgdGhpcy5wZG9tSW5zdGFuY2UgPSBwZG9tSW5zdGFuY2U7XG5cbiAgICAvLyBAcHVibGljIHtOb2RlfG51bGx9IG9ubHkgbnVsbCBmb3IgdGhlIHJvb3QgcGRvbUluc3RhbmNlXG4gICAgdGhpcy5ub2RlID0gdGhpcy5wZG9tSW5zdGFuY2Uubm9kZTtcblxuICAgIC8vIEBwdWJsaWMge0Rpc3BsYXl9IC0gRWFjaCBwZWVyIGlzIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIERpc3BsYXkuXG4gICAgdGhpcy5kaXNwbGF5ID0gcGRvbUluc3RhbmNlLmRpc3BsYXk7XG5cbiAgICAvLyBAcHVibGljIHtUcmFpbH0gLSBOT1RFOiBNYXkgaGF2ZSBcImdhcHNcIiBkdWUgdG8gcGRvbU9yZGVyIHVzYWdlLlxuICAgIHRoaXMudHJhaWwgPSBwZG9tSW5zdGFuY2UudHJhaWw7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbnxudWxsfSAtIHdoZXRoZXIgb3Igbm90IHRoaXMgUERPTVBlZXIgaXMgdmlzaWJsZSBpbiB0aGUgUERPTVxuICAgIC8vIE9ubHkgaW5pdGlhbGl6ZWQgdG8gbnVsbCwgc2hvdWxkIG5vdCBiZSBzZXQgdG8gaXQuIGlzVmlzaWJsZSgpIHdpbGwgcmV0dXJuIHRydWUgaWYgdGhpcy52aXNpYmxlIGlzIG51bGxcbiAgICAvLyAoYmVjYXVzZSBpdCBoYXNuJ3QgYmVlbiBzZXQgeWV0KS5cbiAgICB0aGlzLnZpc2libGUgPSBudWxsO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW58bnVsbH0gLSB3aGV0aGVyIG9yIG5vdCB0aGUgcHJpbWFyeSBzaWJsaW5nIG9mIHRoaXMgUERPTVBlZXIgY2FuIHJlY2VpdmUgZm9jdXMuXG4gICAgdGhpcy5mb2N1c2FibGUgPSBudWxsO1xuXG4gICAgLy8gQHByaXZhdGUge0hUTUxFbGVtZW50fG51bGx9IC0gT3B0aW9uYWwgbGFiZWwvZGVzY3JpcHRpb24gZWxlbWVudHNcbiAgICB0aGlzLl9sYWJlbFNpYmxpbmcgPSBudWxsO1xuICAgIHRoaXMuX2Rlc2NyaXB0aW9uU2libGluZyA9IG51bGw7XG5cbiAgICAvLyBAcHJpdmF0ZSB7SFRNTEVsZW1lbnR8bnVsbH0gLSBBIHBhcmVudCBlbGVtZW50IHRoYXQgY2FuIGNvbnRhaW4gdGhpcyBwcmltYXJ5U2libGluZyBhbmQgb3RoZXIgc2libGluZ3MsIHVzdWFsbHlcbiAgICAvLyB0aGUgbGFiZWwgYW5kIGRlc2NyaXB0aW9uIGNvbnRlbnQuXG4gICAgdGhpcy5fY29udGFpbmVyUGFyZW50ID0gbnVsbDtcblxuICAgIC8vIEBwdWJsaWMge0hUTUxFbGVtZW50W119IFJhdGhlciB0aGFuIGd1YXJhbnRlZSB0aGF0IGEgcGVlciBpcyBhIHRyZWUgd2l0aCBhIHJvb3QgRE9NRWxlbWVudCxcbiAgICAvLyBhbGxvdyBtdWx0aXBsZSB3aW5kb3cuRWxlbWVudHMgYXQgdGhlIHRvcCBsZXZlbCBvZiB0aGUgcGVlci4gVGhpcyBpcyB1c2VkIGZvciBzb3J0aW5nIHRoZSBpbnN0YW5jZS5cbiAgICAvLyBTZWUgdGhpcy5vcmRlckVsZW1lbnRzIGZvciBtb3JlIGluZm8uXG4gICAgdGhpcy50b3BMZXZlbEVsZW1lbnRzID0gW107XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBmbGFnIHRoYXQgaW5kaWNhdGVzIHRoYXQgdGhpcyBwZWVyIGhhcyBhY2Nlc3NpYmxlIGNvbnRlbnQgdGhhdCBjaGFuZ2VkLCBhbmQgc29cbiAgICAvLyB0aGUgc2libGluZ3MgbmVlZCB0byBiZSByZXBvc2l0aW9uZWQgaW4gdGhlIG5leHQgRGlzcGxheS51cGRhdGVEaXNwbGF5KClcbiAgICB0aGlzLnBvc2l0aW9uRGlydHkgPSBmYWxzZTtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIEZsYWcgdGhhdCBpbmRpY2F0ZXMgdGhhdCBQRE9NIGVsZW1lbnRzIHJlcXVpcmUgYSBmb3JjZWQgcmVmbG93IG5leHQgYW5pbWF0aW9uIGZyYW1lLlxuICAgIC8vIFRoaXMgaXMgbmVlZGVkIHRvIGZpeCBhIFNhZmFyaSBWb2ljZU92ZXIgYnVnIHdoZXJlIHRoZSBhY2Nlc3NpYmxlIG5hbWUgaXMgcmVhZCBpbmNvcnJlY3RseSBhZnRlciBlbGVtZW50c1xuICAgIC8vIGFyZSBoaWRkZW4vZGlzcGxheWVkLiBUaGUgdXN1YWwgd29ya2Fyb3VuZCB0byBmb3JjZSBhIHJlZmxvdyAoc2V0IHRoZSBzdHlsZS5kaXNwbGF5IHRvIG5vbmUsIHF1ZXJ5IHRoZSBvZmZzZXQsXG4gICAgLy8gc2V0IGl0IGJhY2spIG9ubHkgZml4ZXMgdGhlIHByb2JsZW0gaWYgdGhlIHN0eWxlLmRpc3BsYXkgYXR0cmlidXRlIGlzIHNldCBpbiB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWUuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hMTF5LXJlc2VhcmNoL2lzc3Vlcy8xOTMuXG4gICAgdGhpcy5mb3JjZVJlZmxvd1dvcmthcm91bmQgPSBmYWxzZTtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIGluZGljYXRlcyB0aGF0IHRoaXMgcGVlcidzIHBkb21JbnN0YW5jZSBoYXMgYSBkZXNjZW5kYW50IHRoYXQgaXMgZGlydHkuIFVzZWQgdG9cbiAgICAvLyBxdWlja2x5IGZpbmQgcGVlcnMgd2l0aCBwb3NpdGlvbkRpcnR5IHdoZW4gd2UgdHJhdmVyc2UgdGhlIHRyZWUgb2YgUERPTUluc3RhbmNlc1xuICAgIHRoaXMuY2hpbGRQb3NpdGlvbkRpcnR5ID0gZmFsc2U7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBJbmRpY2F0ZXMgdGhhdCB0aGlzIHBlZXIgd2lsbCBwb3NpdGlvbiBzaWJsaW5nIGVsZW1lbnRzIHNvIHRoYXRcbiAgICAvLyB0aGV5IGFyZSBpbiB0aGUgcmlnaHQgbG9jYXRpb24gaW4gdGhlIHZpZXdwb3J0LCB3aGljaCBpcyBhIHJlcXVpcmVtZW50IGZvciB0b3VjaCBiYXNlZFxuICAgIC8vIHNjcmVlbiByZWFkZXJzLiBTZWUgc2V0UG9zaXRpb25JblBET00uXG4gICAgdGhpcy5wb3NpdGlvbkluUERPTSA9IGZhbHNlO1xuXG4gICAgLy8gQHByaXZhdGUge011dGF0aW9uT2JzZXJ2ZXJ9IC0gQW4gb2JzZXJ2ZXIgdGhhdCB3aWxsIGNhbGwgYmFjayBhbnkgdGltZSBhIHByb3BlcnR5IG9mIHRoZSBwcmltYXJ5XG4gICAgLy8gc2libGluZyBjaGFuZ2VzLiBVc2VkIHRvIHJlcG9zaXRpb24gdGhlIHNpYmxpbmcgZWxlbWVudHMgaWYgdGhlIGJvdW5kaW5nIGJveCByZXNpemVzLiBObyBuZWVkIHRvIGxvb3Agb3ZlclxuICAgIC8vIGFsbCBvZiB0aGUgbXV0YXRpb25zLCBhbnkgc2luZ2xlIG11dGF0aW9uIHdpbGwgcmVxdWlyZSB1cGRhdGluZyBDU1MgcG9zaXRpb25pbmcuXG4gICAgLy9cbiAgICAvLyBOT1RFOiBJZGVhbGx5LCBhIHNpbmdsZSBNdXRhdGlvbk9ic2VydmVyIGNvdWxkIGJlIHVzZWQgdG8gb2JzZXJ2ZSBjaGFuZ2VzIHRvIGFsbCBlbGVtZW50cyBpbiB0aGUgUERPTS4gQnV0XG4gICAgLy8gTXV0YXRpb25PYnNlcnZlciBtYWtlcyBpdCBpbXBvc3NpYmxlIHRvIGRldGFjaCBvYnNlcnZlcnMgZnJvbSBhIHNpbmdsZSBlbGVtZW50LiBNdXRhdGlvbk9ic2VydmVyLmRldGFjaCgpXG4gICAgLy8gd2lsbCByZW1vdmUgbGlzdGVuZXJzIG9uIGFsbCBvYnNlcnZlZCBlbGVtZW50cywgc28gaW5kaXZpZHVhbCBvYnNlcnZlcnMgbXVzdCBiZSB1c2VkIG9uIGVhY2ggZWxlbWVudC5cbiAgICAvLyBPbmUgYWx0ZXJuYXRpdmUgY291bGQgYmUgdG8gcHV0IHRoZSBNdXRhdGlvbk9ic2VydmVyIG9uIHRoZSByb290IGVsZW1lbnQgYW5kIHVzZSBcInN1YnRyZWU6IHRydWVcIiBpblxuICAgIC8vIE9CU0VSVkVSX0NPTkZJRy4gVGhpcyBjb3VsZCByZWR1Y2UgdGhlIG51bWJlciBvZiBNdXRhdGlvbk9ic2VydmVycywgYnV0IHRoZXJlIGlzIG5vIGVhc3kgd2F5IHRvIGdldCB0aGVcbiAgICAvLyBwZWVyIGZyb20gdGhlIG11dGF0aW9uIHRhcmdldCBlbGVtZW50LiBJZiBNdXRhdGlvbk9ic2VydmVyIHRha2VzIGEgbG90IG9mIG1lbW9yeSwgdGhpcyBjb3VsZCBiZSBhblxuICAgIC8vIG9wdGltaXphdGlvbiB0aGF0IG1heSBjb21lIHdpdGggYSBwZXJmb3JtYW5jZSBjb3N0LlxuICAgIC8vXG4gICAgLy8gTk9URTogUmVzaXplT2JzZXJ2ZXIgaXMgYSBzdXBlcmlvciBhbHRlcm5hdGl2ZSB0byBNdXRhdGlvbk9ic2VydmVyIGZvciB0aGlzIHB1cnBvc2UgYmVjYXVzZVxuICAgIC8vIGl0IHdpbGwgb25seSBtb25pdG9yIGNoYW5nZXMgd2UgY2FyZSBhYm91dCBhbmQgcHJldmVudCBpbmZpbml0ZSBjYWxsYmFjayBsb29wcyBpZiBzaXplIGlzIGNoYW5nZWQgaW5cbiAgICAvLyB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gKHdlIGdldCBhcm91bmQgdGhpcyBub3cgYnkgbm90IG9ic2VydmluZyBhdHRyaWJ1dGUgY2hhbmdlcykuIEJ1dCBpdCBpcyBub3QgeWV0IHdpZGVseVxuICAgIC8vIHN1cHBvcnRlZCwgc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9SZXNpemVPYnNlcnZlci5cbiAgICAvL1xuICAgIC8vIFRPRE86IFNob3VsZCB3ZSBiZSB3YXRjaGluZyBcIm1vZGVsXCIgY2hhbmdlcyBmcm9tIFBhcmFsbGVsRE9NLmpzIGluc3RlYWQgb2YgdXNpbmcgTXV0YXRpb25PYnNlcnZlcj8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg1Mi4gVGhpcyB3b3VsZCBiZSBsZXNzIGZyYWdpbGUsIGFuZCBhbHNvIGxlc3NcbiAgICAvLyBtZW1vcnkgaW50ZW5zaXZlIGJlY2F1c2Ugd2UgZG9uJ3QgbmVlZCBhbiBpbnN0YW5jZSBvZiBNdXRhdGlvbk9ic2VydmVyIG9uIGV2ZXJ5IFBET01JbnN0YW5jZS5cbiAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIgPSB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIgfHwgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoIHRoaXMuaW52YWxpZGF0ZUNTU1Bvc2l0aW9uaW5nLmJpbmQoIHRoaXMsIGZhbHNlICkgKTtcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn0gLSBtdXN0IGJlIHJlbW92ZWQgb24gZGlzcG9zYWxcbiAgICB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyID0gdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciB8fCB0aGlzLmludmFsaWRhdGVDU1NQb3NpdGlvbmluZy5iaW5kKCB0aGlzLCBmYWxzZSApO1xuICAgIHRoaXMucGRvbUluc3RhbmNlLnRyYW5zZm9ybVRyYWNrZXIuYWRkTGlzdGVuZXIoIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgKTtcblxuICAgIC8vIEBwcml2YXRlIHsqfSAtIFRvIHN1cHBvcnQgc2V0dGluZyB0aGUgRGlzcGxheS5pbnRlcmFjdGl2ZT1mYWxzZSAod2hpY2ggc2V0cyBkaXNhYmxlZCBvbiBhbGwgcHJpbWFyeVNpYmxpbmdzLFxuICAgIC8vIHdlIG5lZWQgdG8gc2V0IGRpc2FibGVkIG9uIGEgc2VwYXJhdGUgY2hhbm5lbCBmcm9tIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50LiBUaGF0IHdheSB3ZSBjb3ZlciB0aGUgY2FzZSB3aGVyZVxuICAgIC8vIGBkaXNhYmxlZGAgd2FzIHNldCB0aHJvdWdoIHRoZSBQYXJhbGxlbERPTSBBUEkgd2hlbiB3ZSBuZWVkIHRvIHRvZ2dsZSBpdCBzcGVjaWZpY2FsbHkgZm9yIERpc3BsYXkuaW50ZXJhY3RpdmUuXG4gICAgLy8gVGhpcyB3YXkgd2UgY2FuIGNvbnNlcnZlIHRoZSBwcmV2aW91cyBgZGlzYWJsZWRgIGF0dHJpYnV0ZS9wcm9wZXJ0eSB2YWx1ZSB0aHJvdWdoIHRvZ2dsaW5nIERpc3BsYXkuaW50ZXJhY3RpdmUuXG4gICAgdGhpcy5fcHJlc2VydmVkRGlzYWJsZWRWYWx1ZSA9IG51bGw7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBXaGV0aGVyIHdlIGFyZSBjdXJyZW50bHkgaW4gYSBcImRpc3Bvc2VkXCIgKGluIHRoZSBwb29sKSBzdGF0ZSwgb3IgYXJlIGF2YWlsYWJsZSB0byBiZVxuICAgIC8vIGludGVyYWN0ZWQgd2l0aC5cbiAgICB0aGlzLmlzRGlzcG9zZWQgPSBmYWxzZTtcblxuICAgIC8vIGVkZ2UgY2FzZSBmb3Igcm9vdCBhY2Nlc3NpYmlsaXR5XG4gICAgaWYgKCB0aGlzLnBkb21JbnN0YW5jZS5pc1Jvb3RJbnN0YW5jZSApIHtcblxuICAgICAgLy8gQHByaXZhdGUge0hUTUxFbGVtZW50fSAtIFRoZSBtYWluIGVsZW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgcGVlci4gSWYgZm9jdXNhYmxlLCB0aGlzIGlzIHRoZSBlbGVtZW50IHRoYXQgZ2V0c1xuICAgICAgLy8gdGhlIGZvY3VzLiBJdCBhbHNvIHdpbGwgY29udGFpbiBhbnkgY2hpbGRyZW4uXG4gICAgICB0aGlzLl9wcmltYXJ5U2libGluZyA9IG9wdGlvbnMucHJpbWFyeVNpYmxpbmc7XG4gICAgICB0aGlzLl9wcmltYXJ5U2libGluZy5jbGFzc0xpc3QuYWRkKCBQRE9NU2libGluZ1N0eWxlLlJPT1RfQ0xBU1NfTkFNRSApO1xuXG4gICAgICAvLyBTdG9wIGJsb2NrZWQgZXZlbnRzIGZyb20gYnViYmxpbmcgcGFzdCB0aGUgcm9vdCBvZiB0aGUgUERPTSBzbyB0aGF0IHNjZW5lcnkgZG9lc1xuICAgICAgLy8gbm90IGRpc3BhdGNoIHRoZW0gaW4gSW5wdXQuanMuXG4gICAgICBQRE9NVXRpbHMuQkxPQ0tFRF9ET01fRVZFTlRTLmZvckVhY2goIGV2ZW50VHlwZSA9PiB7XG4gICAgICAgIHRoaXMuX3ByaW1hcnlTaWJsaW5nLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50VHlwZSwgZXZlbnQgPT4ge1xuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjb250ZW50IG9mIHRoZSBwZWVyLiBUaGlzIG11c3QgYmUgY2FsbGVkIGFmdGVyIHRoZSBBY2Nlc3NpYmVQZWVyIGlzIGNvbnN0cnVjdGVkIGZyb20gcG9vbC5cbiAgICogQHBhcmFtIHtib29sZWFufSB1cGRhdGVJbmRpY2VzU3RyaW5nQW5kRWxlbWVudElkcyAtIGlmIHRoaXMgZnVuY3Rpb24gc2hvdWxkIGJlIGNhbGxlZCB1cG9uIGluaXRpYWwgXCJjb25zdHJ1Y3Rpb25cIiAoaW4gdXBkYXRlKSwgYWxsb3dzIGZvciB0aGUgb3B0aW9uIHRvIGRvIHRoaXMgbGF6aWx5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE4NDdcbiAgICogQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHVwZGF0ZSggdXBkYXRlSW5kaWNlc1N0cmluZ0FuZEVsZW1lbnRJZHMgKSB7XG4gICAgbGV0IG9wdGlvbnMgPSB0aGlzLm5vZGUuZ2V0QmFzZU9wdGlvbnMoKTtcblxuICAgIGNvbnN0IGNhbGxiYWNrc0Zvck90aGVyTm9kZXMgPSBbXTtcblxuICAgIGlmICggdGhpcy5ub2RlLmFjY2Vzc2libGVOYW1lICE9PSBudWxsICkge1xuICAgICAgb3B0aW9ucyA9IHRoaXMubm9kZS5hY2Nlc3NpYmxlTmFtZUJlaGF2aW9yKCB0aGlzLm5vZGUsIG9wdGlvbnMsIHRoaXMubm9kZS5hY2Nlc3NpYmxlTmFtZSwgY2FsbGJhY2tzRm9yT3RoZXJOb2RlcyApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnLCAnc2hvdWxkIHJldHVybiBhbiBvYmplY3QnICk7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLm5vZGUucGRvbUhlYWRpbmcgIT09IG51bGwgKSB7XG4gICAgICBvcHRpb25zID0gdGhpcy5ub2RlLnBkb21IZWFkaW5nQmVoYXZpb3IoIHRoaXMubm9kZSwgb3B0aW9ucywgdGhpcy5ub2RlLnBkb21IZWFkaW5nLCBjYWxsYmFja3NGb3JPdGhlck5vZGVzICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcsICdzaG91bGQgcmV0dXJuIGFuIG9iamVjdCcgKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMubm9kZS5oZWxwVGV4dCAhPT0gbnVsbCApIHtcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm5vZGUuaGVscFRleHRCZWhhdmlvciggdGhpcy5ub2RlLCBvcHRpb25zLCB0aGlzLm5vZGUuaGVscFRleHQsIGNhbGxiYWNrc0Zvck90aGVyTm9kZXMgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JywgJ3Nob3VsZCByZXR1cm4gYW4gb2JqZWN0JyApO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSB0aGUgYmFzZSBET00gZWxlbWVudCByZXByZXNlbnRpbmcgdGhpcyBhY2Nlc3NpYmxlIGluc3RhbmNlXG4gICAgLy8gVE9ETzogd2h5IG5vdCBqdXN0IG9wdGlvbnMuZm9jdXNhYmxlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHRoaXMuX3ByaW1hcnlTaWJsaW5nID0gY3JlYXRlRWxlbWVudCggb3B0aW9ucy50YWdOYW1lLCB0aGlzLm5vZGUuZm9jdXNhYmxlLCB7XG4gICAgICBuYW1lc3BhY2U6IG9wdGlvbnMucGRvbU5hbWVzcGFjZVxuICAgIH0gKTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgY29udGFpbmVyIHBhcmVudCBmb3IgdGhlIGRvbSBzaWJsaW5nc1xuICAgIGlmICggb3B0aW9ucy5jb250YWluZXJUYWdOYW1lICkge1xuICAgICAgdGhpcy5fY29udGFpbmVyUGFyZW50ID0gY3JlYXRlRWxlbWVudCggb3B0aW9ucy5jb250YWluZXJUYWdOYW1lLCBmYWxzZSApO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSB0aGUgbGFiZWwgRE9NIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoaXMgaW5zdGFuY2VcbiAgICBpZiAoIG9wdGlvbnMubGFiZWxUYWdOYW1lICkge1xuICAgICAgdGhpcy5fbGFiZWxTaWJsaW5nID0gY3JlYXRlRWxlbWVudCggb3B0aW9ucy5sYWJlbFRhZ05hbWUsIGZhbHNlLCB7XG4gICAgICAgIGV4Y2x1ZGVGcm9tSW5wdXQ6IHRoaXMubm9kZS5leGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIHRoZSBkZXNjcmlwdGlvbiBET00gZWxlbWVudCByZXByZXNlbnRpbmcgdGhpcyBpbnN0YW5jZVxuICAgIGlmICggb3B0aW9ucy5kZXNjcmlwdGlvblRhZ05hbWUgKSB7XG4gICAgICB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcgPSBjcmVhdGVFbGVtZW50KCBvcHRpb25zLmRlc2NyaXB0aW9uVGFnTmFtZSwgZmFsc2UgKTtcbiAgICB9XG5cbiAgICB1cGRhdGVJbmRpY2VzU3RyaW5nQW5kRWxlbWVudElkcyAmJiB0aGlzLnVwZGF0ZUluZGljZXNTdHJpbmdBbmRFbGVtZW50SWRzKCk7XG5cbiAgICB0aGlzLm9yZGVyRWxlbWVudHMoIG9wdGlvbnMgKTtcblxuICAgIC8vIGFzc2lnbiBsaXN0ZW5lcnMgKHRvIGJlIHJlbW92ZWQgb3IgZGlzY29ubmVjdGVkIGR1cmluZyBkaXNwb3NhbClcbiAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIuZGlzY29ubmVjdCgpOyAvLyBpbiBjYXNlIHVwZGF0ZSgpIGlzIGNhbGxlZCBtb3JlIHRoYW4gb25jZSBvbiBhbiBpbnN0YW5jZSBvZiBQRE9NUGVlclxuICAgIHRoaXMubXV0YXRpb25PYnNlcnZlci5vYnNlcnZlKCB0aGlzLl9wcmltYXJ5U2libGluZywgT0JTRVJWRVJfQ09ORklHICk7XG5cbiAgICAvLyBzZXQgdGhlIGFjY2Vzc2libGUgbGFiZWwgbm93IHRoYXQgdGhlIGVsZW1lbnQgaGFzIGJlZW4gcmVjcmVhdGVkIGFnYWluLCBidXQgbm90IGlmIHRoZSB0YWdOYW1lXG4gICAgLy8gaGFzIGJlZW4gY2xlYXJlZCBvdXRcbiAgICBpZiAoIG9wdGlvbnMubGFiZWxDb250ZW50ICYmIG9wdGlvbnMubGFiZWxUYWdOYW1lICE9PSBudWxsICkge1xuICAgICAgdGhpcy5zZXRMYWJlbFNpYmxpbmdDb250ZW50KCBvcHRpb25zLmxhYmVsQ29udGVudCApO1xuICAgIH1cblxuICAgIC8vIHJlc3RvcmUgdGhlIGlubmVyQ29udGVudFxuICAgIGlmICggb3B0aW9ucy5pbm5lckNvbnRlbnQgJiYgb3B0aW9ucy50YWdOYW1lICE9PSBudWxsICkge1xuICAgICAgdGhpcy5zZXRQcmltYXJ5U2libGluZ0NvbnRlbnQoIG9wdGlvbnMuaW5uZXJDb250ZW50ICk7XG4gICAgfVxuXG4gICAgLy8gc2V0IHRoZSBhY2Nlc3NpYmxlIGRlc2NyaXB0aW9uLCBidXQgbm90IGlmIHRoZSB0YWdOYW1lIGhhcyBiZWVuIGNsZWFyZWQgb3V0LlxuICAgIGlmICggb3B0aW9ucy5kZXNjcmlwdGlvbkNvbnRlbnQgJiYgb3B0aW9ucy5kZXNjcmlwdGlvblRhZ05hbWUgIT09IG51bGwgKSB7XG4gICAgICB0aGlzLnNldERlc2NyaXB0aW9uU2libGluZ0NvbnRlbnQoIG9wdGlvbnMuZGVzY3JpcHRpb25Db250ZW50ICk7XG4gICAgfVxuXG4gICAgLy8gaWYgZWxlbWVudCBpcyBhbiBpbnB1dCBlbGVtZW50LCBzZXQgaW5wdXQgdHlwZVxuICAgIGlmICggb3B0aW9ucy50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09IElOUFVUX1RBRyAmJiBvcHRpb25zLmlucHV0VHlwZSApIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50KCAndHlwZScsIG9wdGlvbnMuaW5wdXRUeXBlICk7XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlIGxhYmVsIGVsZW1lbnQgaGFwcGVucyB0byBiZSBhICdsYWJlbCcsIGFzc29jaWF0ZSB3aXRoICdmb3InIGF0dHJpYnV0ZSAobXVzdCBiZSBkb25lIGFmdGVyIHVwZGF0aW5nIElEcylcbiAgICBpZiAoIG9wdGlvbnMubGFiZWxUYWdOYW1lICYmIG9wdGlvbnMubGFiZWxUYWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09IExBQkVMX1RBRyApIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50KCAnZm9yJywgdGhpcy5fcHJpbWFyeVNpYmxpbmcuaWQsIHtcbiAgICAgICAgZWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkdcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldEZvY3VzYWJsZSggdGhpcy5ub2RlLmZvY3VzYWJsZSApO1xuXG4gICAgLy8gc2V0IHRoZSBwb3NpdGlvbkluUERPTSBmaWVsZCB0byBvdXIgdXBkYXRlZCBpbnN0YW5jZVxuICAgIHRoaXMuc2V0UG9zaXRpb25JblBET00oIHRoaXMubm9kZS5wb3NpdGlvbkluUERPTSApO1xuXG4gICAgLy8gcmVjb21wdXRlIGFuZCBhc3NpZ24gdGhlIGFzc29jaWF0aW9uIGF0dHJpYnV0ZXMgdGhhdCBsaW5rIHR3byBlbGVtZW50cyAobGlrZSBhcmlhLWxhYmVsbGVkYnkpXG4gICAgdGhpcy5vbkFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25DaGFuZ2UoKTtcbiAgICB0aGlzLm9uQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25DaGFuZ2UoKTtcbiAgICB0aGlzLm9uQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uQ2hhbmdlKCk7XG5cbiAgICAvLyB1cGRhdGUgYWxsIGF0dHJpYnV0ZXMgZm9yIHRoZSBwZWVyLCBzaG91bGQgY292ZXIgYXJpYS1sYWJlbCwgcm9sZSwgYW5kIG90aGVyc1xuICAgIHRoaXMub25BdHRyaWJ1dGVDaGFuZ2UoIG9wdGlvbnMgKTtcblxuICAgIC8vIHVwZGF0ZSBhbGwgY2xhc3NlcyBmb3IgdGhlIHBlZXJcbiAgICB0aGlzLm9uQ2xhc3NDaGFuZ2UoKTtcblxuICAgIC8vIHVwZGF0ZSBpbnB1dCB2YWx1ZSBhdHRyaWJ1dGUgZm9yIHRoZSBwZWVyXG4gICAgdGhpcy5vbklucHV0VmFsdWVDaGFuZ2UoKTtcblxuICAgIHRoaXMubm9kZS51cGRhdGVPdGhlck5vZGVzQXJpYUxhYmVsbGVkYnkoKTtcbiAgICB0aGlzLm5vZGUudXBkYXRlT3RoZXJOb2Rlc0FyaWFEZXNjcmliZWRieSgpO1xuICAgIHRoaXMubm9kZS51cGRhdGVPdGhlck5vZGVzQWN0aXZlRGVzY2VuZGFudCgpO1xuXG4gICAgY2FsbGJhY2tzRm9yT3RoZXJOb2Rlcy5mb3JFYWNoKCBjYWxsYmFjayA9PiB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgKTtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgaW50ZXJuYWwgb3JkZXJpbmcgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBwZWVyLCB0aGlzIGludm9sdmVzIHNldHRpbmcgdGhlIHByb3BlciB2YWx1ZSBvZlxuICAgKiB0aGlzLnRvcExldmVsRWxlbWVudHNcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIHRoZSBjb21wdXRlZCBtaXhpbiBvcHRpb25zIHRvIGJlIGFwcGxpZWQgdG8gdGhlIHBlZXIuIChzZWxlY3QgUGFyYWxsZWxET00gbXV0YXRvciBrZXlzKVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb3JkZXJFbGVtZW50cyggY29uZmlnICkge1xuICAgIGlmICggdGhpcy5fY29udGFpbmVyUGFyZW50ICkge1xuICAgICAgLy8gVGhlIGZpcnN0IGNoaWxkIG9mIHRoZSBjb250YWluZXIgcGFyZW50IGVsZW1lbnQgc2hvdWxkIGJlIHRoZSBwZWVyIGRvbSBlbGVtZW50XG4gICAgICAvLyBpZiB1bmRlZmluZWQsIHRoZSBpbnNlcnRCZWZvcmUgbWV0aG9kIHdpbGwgaW5zZXJ0IHRoZSB0aGlzLl9wcmltYXJ5U2libGluZyBhcyB0aGUgZmlyc3QgY2hpbGRcbiAgICAgIHRoaXMuX2NvbnRhaW5lclBhcmVudC5pbnNlcnRCZWZvcmUoIHRoaXMuX3ByaW1hcnlTaWJsaW5nLCB0aGlzLl9jb250YWluZXJQYXJlbnQuY2hpbGRyZW5bIDAgXSB8fCBudWxsICk7XG4gICAgICB0aGlzLnRvcExldmVsRWxlbWVudHMgPSBbIHRoaXMuX2NvbnRhaW5lclBhcmVudCBdO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gV2VhbiBvdXQgYW55IG51bGwgc2libGluZ3NcbiAgICAgIHRoaXMudG9wTGV2ZWxFbGVtZW50cyA9IFsgdGhpcy5fbGFiZWxTaWJsaW5nLCB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcsIHRoaXMuX3ByaW1hcnlTaWJsaW5nIF0uZmlsdGVyKCBfLmlkZW50aXR5ICk7XG4gICAgfVxuXG4gICAgLy8gaW5zZXJ0IHRoZSBsYWJlbCBhbmQgZGVzY3JpcHRpb24gZWxlbWVudHMgaW4gdGhlIGNvcnJlY3QgbG9jYXRpb24gaWYgdGhleSBleGlzdFxuICAgIC8vIE5PVEU6IEltcG9ydGFudCBmb3IgYXJyYW5nZUNvbnRlbnRFbGVtZW50IHRvIGJlIGNhbGxlZCBvbiB0aGUgbGFiZWwgc2libGluZyBmaXJzdCBmb3IgY29ycmVjdCBvcmRlclxuICAgIHRoaXMuX2xhYmVsU2libGluZyAmJiB0aGlzLmFycmFuZ2VDb250ZW50RWxlbWVudCggdGhpcy5fbGFiZWxTaWJsaW5nLCBjb25maWcuYXBwZW5kTGFiZWwgKTtcbiAgICB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcgJiYgdGhpcy5hcnJhbmdlQ29udGVudEVsZW1lbnQoIHRoaXMuX2Rlc2NyaXB0aW9uU2libGluZywgY29uZmlnLmFwcGVuZERlc2NyaXB0aW9uICk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHByaW1hcnkgc2libGluZyBlbGVtZW50IGZvciB0aGUgcGVlclxuICAgKiBAcHVibGljXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudHxudWxsfVxuICAgKi9cbiAgZ2V0UHJpbWFyeVNpYmxpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ByaW1hcnlTaWJsaW5nO1xuICB9XG5cbiAgZ2V0IHByaW1hcnlTaWJsaW5nKCkgeyByZXR1cm4gdGhpcy5nZXRQcmltYXJ5U2libGluZygpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcHJpbWFyeSBzaWJsaW5nIGVsZW1lbnQgZm9yIHRoZSBwZWVyXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fG51bGx9XG4gICAqL1xuICBnZXRMYWJlbFNpYmxpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhYmVsU2libGluZztcbiAgfVxuXG4gIGdldCBsYWJlbFNpYmxpbmcoKSB7IHJldHVybiB0aGlzLmdldExhYmVsU2libGluZygpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcHJpbWFyeSBzaWJsaW5nIGVsZW1lbnQgZm9yIHRoZSBwZWVyXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fG51bGx9XG4gICAqL1xuICBnZXREZXNjcmlwdGlvblNpYmxpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9uU2libGluZztcbiAgfVxuXG4gIGdldCBkZXNjcmlwdGlvblNpYmxpbmcoKSB7IHJldHVybiB0aGlzLmdldERlc2NyaXB0aW9uU2libGluZygpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcHJpbWFyeSBzaWJsaW5nIGVsZW1lbnQgZm9yIHRoZSBwZWVyXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fG51bGx9XG4gICAqL1xuICBnZXRDb250YWluZXJQYXJlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lclBhcmVudDtcbiAgfVxuXG4gIGdldCBjb250YWluZXJQYXJlbnQoKSB7IHJldHVybiB0aGlzLmdldENvbnRhaW5lclBhcmVudCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRvcC1sZXZlbCBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIHByaW1hcnkgc2libGluZy4gSWYgdGhlcmUgaXMgbm8gY29udGFpbmVyIHBhcmVudCwgdGhlbiB0aGUgcHJpbWFyeVxuICAgKiBzaWJsaW5nIGlzIHJldHVybmVkLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudHxudWxsfVxuICAgKi9cbiAgZ2V0VG9wTGV2ZWxFbGVtZW50Q29udGFpbmluZ1ByaW1hcnlTaWJsaW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9jb250YWluZXJQYXJlbnQgfHwgdGhpcy5fcHJpbWFyeVNpYmxpbmc7XG4gIH1cblxuICAvKipcbiAgICogUmVjb21wdXRlIHRoZSBhcmlhLWxhYmVsbGVkYnkgYXR0cmlidXRlcyBmb3IgYWxsIG9mIHRoZSBwZWVyJ3MgZWxlbWVudHNcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgb25BcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uQ2hhbmdlKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlRnJvbUFsbEVsZW1lbnRzKCAnYXJpYS1sYWJlbGxlZGJ5JyApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlLmFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgYXNzb2NpYXRpb25PYmplY3QgPSB0aGlzLm5vZGUuYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnNbIGkgXTtcblxuICAgICAgLy8gQXNzZXJ0IG91dCBpZiB0aGUgbW9kZWwgbGlzdCBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgZGF0YSBoZWxkIGluIHRoZSBhc3NvY2lhdGlvbk9iamVjdFxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYXNzb2NpYXRpb25PYmplY3Qub3RoZXJOb2RlLm5vZGVzVGhhdEFyZUFyaWFMYWJlbGxlZGJ5VGhpc05vZGUuaW5kZXhPZiggdGhpcy5ub2RlICkgPj0gMCxcbiAgICAgICAgJ3VuZXhwZWN0ZWQgb3RoZXJOb2RlJyApO1xuXG5cbiAgICAgIHRoaXMuc2V0QXNzb2NpYXRpb25BdHRyaWJ1dGUoICdhcmlhLWxhYmVsbGVkYnknLCBhc3NvY2lhdGlvbk9iamVjdCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvbXB1dGUgdGhlIGFyaWEtZGVzY3JpYmVkYnkgYXR0cmlidXRlcyBmb3IgYWxsIG9mIHRoZSBwZWVyJ3MgZWxlbWVudHNcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgb25BcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbkNoYW5nZSgpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZUZyb21BbGxFbGVtZW50cyggJ2FyaWEtZGVzY3JpYmVkYnknICk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGUuYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgYXNzb2NpYXRpb25PYmplY3QgPSB0aGlzLm5vZGUuYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zWyBpIF07XG5cbiAgICAgIC8vIEFzc2VydCBvdXQgaWYgdGhlIG1vZGVsIGxpc3QgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGRhdGEgaGVsZCBpbiB0aGUgYXNzb2NpYXRpb25PYmplY3RcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFzc29jaWF0aW9uT2JqZWN0Lm90aGVyTm9kZS5ub2Rlc1RoYXRBcmVBcmlhRGVzY3JpYmVkYnlUaGlzTm9kZS5pbmRleE9mKCB0aGlzLm5vZGUgKSA+PSAwLFxuICAgICAgICAndW5leHBlY3RlZCBvdGhlck5vZGUnICk7XG5cblxuICAgICAgdGhpcy5zZXRBc3NvY2lhdGlvbkF0dHJpYnV0ZSggJ2FyaWEtZGVzY3JpYmVkYnknLCBhc3NvY2lhdGlvbk9iamVjdCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvbXB1dGUgdGhlIGFyaWEtYWN0aXZlZGVzY2VuZGFudCBhdHRyaWJ1dGVzIGZvciBhbGwgb2YgdGhlIHBlZXIncyBlbGVtZW50c1xuICAgKiBAcHVibGljXG4gICAqL1xuICBvbkFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbkNoYW5nZSgpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZUZyb21BbGxFbGVtZW50cyggJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcgKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubm9kZS5hY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgYXNzb2NpYXRpb25PYmplY3QgPSB0aGlzLm5vZGUuYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uc1sgaSBdO1xuXG4gICAgICAvLyBBc3NlcnQgb3V0IGlmIHRoZSBtb2RlbCBsaXN0IGlzIGRpZmZlcmVudCB0aGFuIHRoZSBkYXRhIGhlbGQgaW4gdGhlIGFzc29jaWF0aW9uT2JqZWN0XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhc3NvY2lhdGlvbk9iamVjdC5vdGhlck5vZGUubm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUuaW5kZXhPZiggdGhpcy5ub2RlICkgPj0gMCxcbiAgICAgICAgJ3VuZXhwZWN0ZWQgb3RoZXJOb2RlJyApO1xuXG5cbiAgICAgIHRoaXMuc2V0QXNzb2NpYXRpb25BdHRyaWJ1dGUoICdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnLCBhc3NvY2lhdGlvbk9iamVjdCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG5ldyBhdHRyaWJ1dGUgdG8gdGhlIGVsZW1lbnQgaWYgdGhlIHZhbHVlIGlzIGEgc3RyaW5nLiBJdCB3aWxsIG90aGVyd2lzZSBiZSBudWxsIG9yIHVuZGVmaW5lZCBhbmQgc2hvdWxkXG4gICAqIHRoZW4gYmUgcmVtb3ZlZCBmcm9tIHRoZSBlbGVtZW50LiBUaGlzIGFsbG93cyBlbXB0eSBzdHJpbmdzIHRvIGJlIHNldCBhcyB2YWx1ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtzdHJpbmd8bnVsbHx1bmRlZmluZWR9IHZhbHVlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVBdHRyaWJ1dGVXaXRoUERPTU9wdGlvbigga2V5LCB2YWx1ZSApIHtcbiAgICBpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZVRvRWxlbWVudCgga2V5LCB2YWx1ZSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlRnJvbUVsZW1lbnQoIGtleSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYWxsIHBkb20gYXR0cmlidXRlcyBvbnRvIHRoZSBwZWVyIGVsZW1lbnRzIGZyb20gdGhlIG1vZGVsJ3Mgc3RvcmVkIGRhdGEgb2JqZWN0c1xuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gW3Bkb21PcHRpb25zXSAtIHRoZXNlIGNhbiBvdmVycmlkZSB0aGUgdmFsdWVzIG9mIHRoZSBub2RlLCBzZWUgdGhpcy51cGRhdGUoKVxuICAgKi9cbiAgb25BdHRyaWJ1dGVDaGFuZ2UoIHBkb21PcHRpb25zICkge1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlLnBkb21BdHRyaWJ1dGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZGF0YU9iamVjdCA9IHRoaXMubm9kZS5wZG9tQXR0cmlidXRlc1sgaSBdO1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVUb0VsZW1lbnQoIGRhdGFPYmplY3QuYXR0cmlidXRlLCBkYXRhT2JqZWN0LnZhbHVlLCBkYXRhT2JqZWN0Lm9wdGlvbnMgKTtcbiAgICB9XG5cbiAgICAvLyBNYW51YWxseSBzdXBwb3J0IG9wdGlvbnMgdGhhdCBtYXAgdG8gYXR0cmlidXRlcy4gVGhpcyBjb3ZlcnMgdGhhdCBjYXNlIHdoZXJlIGJlaGF2aW9yIGZ1bmN0aW9ucyB3YW50IHRvIGNoYW5nZVxuICAgIC8vIHRoZXNlLCBidXQgdGhleSBhcmVuJ3QgaW4gbm9kZS5wZG9tQXR0cmlidXRlcy4gSXQgd2lsbCBkbyBkb3VibGUgd29yayBpbiBzb21lIGNhc2VzLCBidXQgaXQgaXMgcHJldHR5IG1pbm9yIGZvclxuICAgIC8vIHRoZSBjb21wbGV4aXR5IGl0IHNhdmVzLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTQzNi4gRW1wdHkgc3RyaW5ncyBzaG91bGQgYmUgc2V0dGFibGUgZm9yXG4gICAgLy8gdGhlc2UgYXR0cmlidXRlcyBidXQgbnVsbCBhbmQgdW5kZWZpbmVkIGFyZSBpZ25vcmVkLlxuICAgIHRoaXMuaGFuZGxlQXR0cmlidXRlV2l0aFBET01PcHRpb24oICdhcmlhLWxhYmVsJywgcGRvbU9wdGlvbnMuYXJpYUxhYmVsICk7XG4gICAgdGhpcy5oYW5kbGVBdHRyaWJ1dGVXaXRoUERPTU9wdGlvbiggJ3JvbGUnLCBwZG9tT3B0aW9ucy5hcmlhUm9sZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbGwgY2xhc3NlcyBvbnRvIHRoZSBwZWVyIGVsZW1lbnRzIGZyb20gdGhlIG1vZGVsJ3Mgc3RvcmVkIGRhdGEgb2JqZWN0c1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25DbGFzc0NoYW5nZSgpIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGUucGRvbUNsYXNzZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBkYXRhT2JqZWN0ID0gdGhpcy5ub2RlLnBkb21DbGFzc2VzWyBpIF07XG4gICAgICB0aGlzLnNldENsYXNzVG9FbGVtZW50KCBkYXRhT2JqZWN0LmNsYXNzTmFtZSwgZGF0YU9iamVjdC5vcHRpb25zICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW5wdXQgdmFsdWUgb24gdGhlIHBlZXIncyBwcmltYXJ5IHNpYmxpbmcgZWxlbWVudC4gVGhlIHZhbHVlIGF0dHJpYnV0ZSBtdXN0IGJlIHNldCBhcyBhIFByb3BlcnR5IHRvIGJlXG4gICAqIHJlZ2lzdGVyZWQgY29ycmVjdGx5IGJ5IGFuIGFzc2lzdGl2ZSBkZXZpY2UuIElmIG51bGwsIHRoZSBhdHRyaWJ1dGUgaXMgcmVtb3ZlZCBzbyB0aGF0IHdlIGRvbid0IGNsdXR0ZXIgdGhlIERPTVxuICAgKiB3aXRoIHZhbHVlPVwibnVsbFwiIGF0dHJpYnV0ZXMuXG4gICAqXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBvbklucHV0VmFsdWVDaGFuZ2UoKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ub2RlLmlucHV0VmFsdWUgIT09IHVuZGVmaW5lZCwgJ3VzZSBudWxsIHRvIHJlbW92ZSBpbnB1dCB2YWx1ZSBhdHRyaWJ1dGUnICk7XG5cbiAgICBpZiAoIHRoaXMubm9kZS5pbnB1dFZhbHVlID09PSBudWxsICkge1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVGcm9tRWxlbWVudCggJ3ZhbHVlJyApO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gdHlwZSBjb252ZXJzaW9uIGZvciBET00gc3BlY1xuICAgICAgY29uc3QgdmFsdWVTdHJpbmcgPSBgJHt0aGlzLm5vZGUuaW5wdXRWYWx1ZX1gO1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVUb0VsZW1lbnQoICd2YWx1ZScsIHZhbHVlU3RyaW5nLCB7IHR5cGU6ICdwcm9wZXJ0eScgfSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW4gZWxlbWVudCBvbiB0aGlzIG5vZGUsIGxvb2tlZCB1cCBieSB0aGUgZWxlbWVudE5hbWUgZmxhZyBwYXNzZWQgaW4uXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBlbGVtZW50TmFtZSAtIHNlZSBQRE9NVXRpbHMgZm9yIHZhbGlkIGFzc29jaWF0aW9uc1xuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gICAqL1xuICBnZXRFbGVtZW50QnlOYW1lKCBlbGVtZW50TmFtZSApIHtcbiAgICBpZiAoIGVsZW1lbnROYW1lID09PSBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkcgKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcHJpbWFyeVNpYmxpbmc7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBlbGVtZW50TmFtZSA9PT0gUERPTVBlZXIuTEFCRUxfU0lCTElORyApIHtcbiAgICAgIHJldHVybiB0aGlzLl9sYWJlbFNpYmxpbmc7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBlbGVtZW50TmFtZSA9PT0gUERPTVBlZXIuREVTQ1JJUFRJT05fU0lCTElORyApIHtcbiAgICAgIHJldHVybiB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmc7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBlbGVtZW50TmFtZSA9PT0gUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVCApIHtcbiAgICAgIHJldHVybiB0aGlzLl9jb250YWluZXJQYXJlbnQ7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBlbGVtZW50TmFtZSBuYW1lOiAke2VsZW1lbnROYW1lfWAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgYXR0cmlidXRlIG9uIG9uZSBvZiB0aGUgcGVlcidzIHdpbmRvdy5FbGVtZW50cy5cbiAgICogQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZVxuICAgKiBAcGFyYW0geyp9IGF0dHJpYnV0ZVZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIHNldEF0dHJpYnV0ZVRvRWxlbWVudCggYXR0cmlidXRlLCBhdHRyaWJ1dGVWYWx1ZSwgb3B0aW9ucyApIHtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgLy8ge3N0cmluZ3xudWxsfSAtIElmIG5vbi1udWxsLCB3aWxsIHNldCB0aGUgYXR0cmlidXRlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UuIFRoaXMgY2FuIGJlIHJlcXVpcmVkXG4gICAgICAvLyBmb3Igc2V0dGluZyBjZXJ0YWluIGF0dHJpYnV0ZXMgKGUuZy4gTWF0aE1MKS5cbiAgICAgIG5hbWVzcGFjZTogbnVsbCxcblxuICAgICAgLy8gc2V0IGFzIGEgamF2YXNjcmlwdCBwcm9wZXJ0eSBpbnN0ZWFkIG9mIGFuIGF0dHJpYnV0ZSBvbiB0aGUgRE9NIEVsZW1lbnQuXG4gICAgICB0eXBlOiAnYXR0cmlidXRlJyxcblxuICAgICAgZWxlbWVudE5hbWU6IFBSSU1BUllfU0lCTElORywgLy8gc2VlIHRoaXMuZ2V0RWxlbWVudE5hbWUoKSBmb3IgdmFsaWQgdmFsdWVzLCBkZWZhdWx0IHRvIHRoZSBwcmltYXJ5IHNpYmxpbmdcblxuICAgICAgLy8ge0hUTUxFbGVtZW50fG51bGx9IC0gZWxlbWVudCB0aGF0IHdpbGwgZGlyZWN0bHkgcmVjZWl2ZSB0aGUgaW5wdXQgcmF0aGVyIHRoYW4gbG9va2luZyB1cCBieSBuYW1lLCBpZlxuICAgICAgLy8gcHJvdmlkZWQsIGVsZW1lbnROYW1lIG9wdGlvbiB3aWxsIGhhdmUgbm8gZWZmZWN0XG4gICAgICBlbGVtZW50OiBudWxsXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgY29uc3QgZWxlbWVudCA9IG9wdGlvbnMuZWxlbWVudCB8fCB0aGlzLmdldEVsZW1lbnRCeU5hbWUoIG9wdGlvbnMuZWxlbWVudE5hbWUgKTtcblxuICAgIC8vIEZvciBkeW5hbWljIHN0cmluZ3MsIHdlIG1heSBuZWVkIHRvIHJldHJpZXZlIHRoZSBhY3R1YWwgdmFsdWUuXG4gICAgY29uc3QgcmF3QXR0cmlidXRlVmFsdWUgPSBQRE9NVXRpbHMudW53cmFwUHJvcGVydHkoIGF0dHJpYnV0ZVZhbHVlICk7XG5cbiAgICAvLyByZW1vdmUgZGlyZWN0aW9uYWwgZm9ybWF0dGluZyB0aGF0IG1heSBzdXJyb3VuZCBzdHJpbmdzIGlmIHRoZXkgYXJlIHRyYW5zbGF0YWJsZVxuICAgIGxldCBhdHRyaWJ1dGVWYWx1ZVdpdGhvdXRNYXJrcyA9IHJhd0F0dHJpYnV0ZVZhbHVlO1xuICAgIGlmICggdHlwZW9mIHJhd0F0dHJpYnV0ZVZhbHVlID09PSAnc3RyaW5nJyApIHtcbiAgICAgIGF0dHJpYnV0ZVZhbHVlV2l0aG91dE1hcmtzID0gc3RyaXBFbWJlZGRpbmdNYXJrcyggcmF3QXR0cmlidXRlVmFsdWUgKTtcbiAgICB9XG5cbiAgICBpZiAoIGF0dHJpYnV0ZSA9PT0gRElTQUJMRURfQVRUUklCVVRFX05BTUUgJiYgIXRoaXMuZGlzcGxheS5pbnRlcmFjdGl2ZSApIHtcblxuICAgICAgLy8gVGhlIHByZXNlbmNlIG9mIHRoZSBgZGlzYWJsZWRgIGF0dHJpYnV0ZSBtZWFucyBpdCBpcyBhbHdheXMgZGlzYWJsZWQuXG4gICAgICB0aGlzLl9wcmVzZXJ2ZWREaXNhYmxlZFZhbHVlID0gb3B0aW9ucy50eXBlID09PSAncHJvcGVydHknID8gYXR0cmlidXRlVmFsdWVXaXRob3V0TWFya3MgOiB0cnVlO1xuICAgIH1cblxuICAgIGlmICggb3B0aW9ucy5uYW1lc3BhY2UgKSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCBvcHRpb25zLm5hbWVzcGFjZSwgYXR0cmlidXRlLCBhdHRyaWJ1dGVWYWx1ZVdpdGhvdXRNYXJrcyApO1xuICAgIH1cbiAgICBlbHNlIGlmICggb3B0aW9ucy50eXBlID09PSAncHJvcGVydHknICkge1xuICAgICAgZWxlbWVudFsgYXR0cmlidXRlIF0gPSBhdHRyaWJ1dGVWYWx1ZVdpdGhvdXRNYXJrcztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSggYXR0cmlidXRlLCBhdHRyaWJ1dGVWYWx1ZVdpdGhvdXRNYXJrcyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYXR0cmlidXRlIGZyb20gb25lIG9mIHRoZSBwZWVyJ3Mgd2luZG93LkVsZW1lbnRzLlxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0cmlidXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIHJlbW92ZUF0dHJpYnV0ZUZyb21FbGVtZW50KCBhdHRyaWJ1dGUsIG9wdGlvbnMgKSB7XG5cbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcbiAgICAgIC8vIHtzdHJpbmd8bnVsbH0gLSBJZiBub24tbnVsbCwgd2lsbCBzZXQgdGhlIGF0dHJpYnV0ZSB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZXNwYWNlLiBUaGlzIGNhbiBiZSByZXF1aXJlZFxuICAgICAgLy8gZm9yIHNldHRpbmcgY2VydGFpbiBhdHRyaWJ1dGVzIChlLmcuIE1hdGhNTCkuXG4gICAgICBuYW1lc3BhY2U6IG51bGwsXG5cbiAgICAgIGVsZW1lbnROYW1lOiBQUklNQVJZX1NJQkxJTkcsIC8vIHNlZSB0aGlzLmdldEVsZW1lbnROYW1lKCkgZm9yIHZhbGlkIHZhbHVlcywgZGVmYXVsdCB0byB0aGUgcHJpbWFyeSBzaWJsaW5nXG5cbiAgICAgIC8vIHtIVE1MRWxlbWVudHxudWxsfSAtIGVsZW1lbnQgdGhhdCB3aWxsIGRpcmVjdGx5IHJlY2VpdmUgdGhlIGlucHV0IHJhdGhlciB0aGFuIGxvb2tpbmcgdXAgYnkgbmFtZSwgaWZcbiAgICAgIC8vIHByb3ZpZGVkLCBlbGVtZW50TmFtZSBvcHRpb24gd2lsbCBoYXZlIG5vIGVmZmVjdFxuICAgICAgZWxlbWVudDogbnVsbFxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIGNvbnN0IGVsZW1lbnQgPSBvcHRpb25zLmVsZW1lbnQgfHwgdGhpcy5nZXRFbGVtZW50QnlOYW1lKCBvcHRpb25zLmVsZW1lbnROYW1lICk7XG5cbiAgICBpZiAoIG9wdGlvbnMubmFtZXNwYWNlICkge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGVOUyggb3B0aW9ucy5uYW1lc3BhY2UsIGF0dHJpYnV0ZSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggYXR0cmlidXRlID09PSBESVNBQkxFRF9BVFRSSUJVVEVfTkFNRSAmJiAhdGhpcy5kaXNwbGF5LmludGVyYWN0aXZlICkge1xuICAgICAgLy8gbWFpbnRhaW4gb3VyIGludGVyYWwgZGlzYWJsZWQgc3RhdGUgaW4gY2FzZSB0aGUgZGlzcGxheSB0b2dnbGVzIGJhY2sgdG8gYmUgaW50ZXJhY3RpdmUuXG4gICAgICB0aGlzLl9wcmVzZXJ2ZWREaXNhYmxlZFZhbHVlID0gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGdpdmVuIGF0dHJpYnV0ZSBmcm9tIGFsbCBwZWVyIGVsZW1lbnRzXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyaWJ1dGVcbiAgICovXG4gIHJlbW92ZUF0dHJpYnV0ZUZyb21BbGxFbGVtZW50cyggYXR0cmlidXRlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGF0dHJpYnV0ZSAhPT0gRElTQUJMRURfQVRUUklCVVRFX05BTUUsICd0aGlzIG1ldGhvZCBkb2VzIG5vdCBjdXJyZW50bHkgc3VwcG9ydCBkaXNhYmxlZCwgdG8gbWFrZSBEaXNwbGF5LmludGVyYWN0aXZlIHRvZ2dsaW5nIGVhc2llciB0byBpbXBsZW1lbnQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGF0dHJpYnV0ZSA9PT0gJ3N0cmluZycgKTtcbiAgICB0aGlzLl9wcmltYXJ5U2libGluZyAmJiB0aGlzLl9wcmltYXJ5U2libGluZy5yZW1vdmVBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApO1xuICAgIHRoaXMuX2xhYmVsU2libGluZyAmJiB0aGlzLl9sYWJlbFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCBhdHRyaWJ1dGUgKTtcbiAgICB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcgJiYgdGhpcy5fZGVzY3JpcHRpb25TaWJsaW5nLnJlbW92ZUF0dHJpYnV0ZSggYXR0cmlidXRlICk7XG4gICAgdGhpcy5fY29udGFpbmVyUGFyZW50ICYmIHRoaXMuX2NvbnRhaW5lclBhcmVudC5yZW1vdmVBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgcHJvdmlkZWQgY2xhc3NOYW1lIHRvIHRoZSBlbGVtZW50J3MgY2xhc3NMaXN0LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgc2V0Q2xhc3NUb0VsZW1lbnQoIGNsYXNzTmFtZSwgb3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY2xhc3NOYW1lID09PSAnc3RyaW5nJyApO1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG5cbiAgICAgIC8vIE5hbWUgb2YgdGhlIGVsZW1lbnQgd2hvIHdlIGFyZSBhZGRpbmcgdGhlIGNsYXNzIHRvLCBzZWUgdGhpcy5nZXRFbGVtZW50TmFtZSgpIGZvciB2YWxpZCB2YWx1ZXNcbiAgICAgIGVsZW1lbnROYW1lOiBQUklNQVJZX1NJQkxJTkdcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmdldEVsZW1lbnRCeU5hbWUoIG9wdGlvbnMuZWxlbWVudE5hbWUgKS5jbGFzc0xpc3QuYWRkKCBjbGFzc05hbWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIHNwZWNpZmllZCBjbGFzc05hbWUgZnJvbSB0aGUgZWxlbWVudC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIHJlbW92ZUNsYXNzRnJvbUVsZW1lbnQoIGNsYXNzTmFtZSwgb3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY2xhc3NOYW1lID09PSAnc3RyaW5nJyApO1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG5cbiAgICAgIC8vIE5hbWUgb2YgdGhlIGVsZW1lbnQgd2hvIHdlIGFyZSByZW1vdmluZyB0aGUgY2xhc3MgZnJvbSwgc2VlIHRoaXMuZ2V0RWxlbWVudE5hbWUoKSBmb3IgdmFsaWQgdmFsdWVzXG4gICAgICBlbGVtZW50TmFtZTogUFJJTUFSWV9TSUJMSU5HXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5nZXRFbGVtZW50QnlOYW1lKCBvcHRpb25zLmVsZW1lbnROYW1lICkuY2xhc3NMaXN0LnJlbW92ZSggY2xhc3NOYW1lICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGVpdGhlciBhc3NvY2lhdGlvbiBhdHRyaWJ1dGUgKGFyaWEtbGFiZWxsZWRieS9kZXNjcmliZWRieSkgb24gb25lIG9mIHRoaXMgcGVlcidzIEVsZW1lbnRzXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyaWJ1dGUgLSBlaXRoZXIgYXJpYS1sYWJlbGxlZGJ5IG9yIGFyaWEtZGVzY3JpYmVkYnlcbiAgICogQHBhcmFtIHtPYmplY3R9IGFzc29jaWF0aW9uT2JqZWN0IC0gc2VlIGFkZEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24oKSBmb3Igc2NoZW1hXG4gICAqL1xuICBzZXRBc3NvY2lhdGlvbkF0dHJpYnV0ZSggYXR0cmlidXRlLCBhc3NvY2lhdGlvbk9iamVjdCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQRE9NVXRpbHMuQVNTT0NJQVRJT05fQVRUUklCVVRFUy5pbmRleE9mKCBhdHRyaWJ1dGUgKSA+PSAwLFxuICAgICAgYHVuc3VwcG9ydGVkIGF0dHJpYnV0ZSBmb3Igc2V0dGluZyB3aXRoIGFzc29jaWF0aW9uIG9iamVjdDogJHthdHRyaWJ1dGV9YCApO1xuXG4gICAgY29uc3Qgb3RoZXJOb2RlUERPTUluc3RhbmNlcyA9IGFzc29jaWF0aW9uT2JqZWN0Lm90aGVyTm9kZS5nZXRQRE9NSW5zdGFuY2VzKCk7XG5cbiAgICAvLyBJZiB0aGUgb3RoZXIgbm9kZSBoYXNuJ3QgYmVlbiBhZGRlZCB0byB0aGUgc2NlbmUgZ3JhcGggeWV0LCBpdCB3b24ndCBoYXZlIGFueSBhY2Nlc3NpYmxlIGluc3RhbmNlcywgc28gbm8gb3AuXG4gICAgLy8gVGhpcyB3aWxsIGJlIHJlY2FsY3VsYXRlZCB3aGVuIHRoYXQgbm9kZSBpcyBhZGRlZCB0byB0aGUgc2NlbmUgZ3JhcGhcbiAgICBpZiAoIG90aGVyTm9kZVBET01JbnN0YW5jZXMubGVuZ3RoID4gMCApIHtcblxuICAgICAgLy8gV2UgYXJlIGp1c3QgdXNpbmcgdGhlIGZpcnN0IFBET01JbnN0YW5jZSBmb3Igc2ltcGxpY2l0eSwgYnV0IGl0IGlzIE9LIGJlY2F1c2UgdGhlIGFjY2Vzc2libGVcbiAgICAgIC8vIGNvbnRlbnQgZm9yIGFsbCBQRE9NSW5zdGFuY2VzIHdpbGwgYmUgdGhlIHNhbWUsIHNvIHRoZSBBY2Nlc3NpYmxlIE5hbWVzIChpbiB0aGUgYnJvd3NlcidzXG4gICAgICAvLyBhY2Nlc3NpYmlsaXR5IHRyZWUpIG9mIGVsZW1lbnRzIHRoYXQgYXJlIHJlZmVyZW5jZWQgYnkgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBpZCB3aWxsIGFsbCBoYXZlIHRoZSBzYW1lIGNvbnRlbnRcbiAgICAgIGNvbnN0IGZpcnN0UERPTUluc3RhbmNlID0gb3RoZXJOb2RlUERPTUluc3RhbmNlc1sgMCBdO1xuXG4gICAgICAvLyBIYW5kbGUgYSBjYXNlIHdoZXJlIHlvdSBhcmUgYXNzb2NpYXRpbmcgdG8geW91cnNlbGYsIGFuZCB0aGUgcGVlciBoYXMgbm90IGJlZW4gY29uc3RydWN0ZWQgeWV0LlxuICAgICAgaWYgKCBmaXJzdFBET01JbnN0YW5jZSA9PT0gdGhpcy5wZG9tSW5zdGFuY2UgKSB7XG4gICAgICAgIGZpcnN0UERPTUluc3RhbmNlLnBlZXIgPSB0aGlzO1xuICAgICAgfVxuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaXJzdFBET01JbnN0YW5jZS5wZWVyLCAncGVlciBzaG91bGQgZXhpc3QnICk7XG5cbiAgICAgIC8vIHdlIGNhbiB1c2UgdGhlIHNhbWUgZWxlbWVudCdzIGlkIHRvIHVwZGF0ZSBhbGwgb2YgdGhpcyBOb2RlJ3MgcGVlcnNcbiAgICAgIGNvbnN0IG90aGVyUGVlckVsZW1lbnQgPSBmaXJzdFBET01JbnN0YW5jZS5wZWVyLmdldEVsZW1lbnRCeU5hbWUoIGFzc29jaWF0aW9uT2JqZWN0Lm90aGVyRWxlbWVudE5hbWUgKTtcblxuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZ2V0RWxlbWVudEJ5TmFtZSggYXNzb2NpYXRpb25PYmplY3QudGhpc0VsZW1lbnROYW1lICk7XG5cbiAgICAgIC8vIHRvIHN1cHBvcnQgYW55IG9wdGlvbiBvcmRlciwgbm8tb3AgaWYgdGhlIHBlZXIgZWxlbWVudCBoYXMgbm90IGJlZW4gY3JlYXRlZCB5ZXQuXG4gICAgICBpZiAoIGVsZW1lbnQgJiYgb3RoZXJQZWVyRWxlbWVudCApIHtcblxuICAgICAgICAvLyBvbmx5IHVwZGF0ZSBhc3NvY2lhdGlvbnMgaWYgdGhlIHJlcXVlc3RlZCBwZWVyIGVsZW1lbnQgaGFzIGJlZW4gY3JlYXRlZFxuICAgICAgICAvLyBOT1RFOiBpbiB0aGUgZnV0dXJlLCB3ZSB3b3VsZCBsaWtlIHRvIHZlcmlmeSB0aGF0IHRoZSBhc3NvY2lhdGlvbiBleGlzdHMgYnV0IGNhbid0IGRvIHRoYXQgeWV0IGJlY2F1c2VcbiAgICAgICAgLy8gd2UgaGF2ZSB0byBzdXBwb3J0IGNhc2VzIHdoZXJlIHdlIHNldCBsYWJlbCBhc3NvY2lhdGlvbiBwcmlvciB0byBzZXR0aW5nIHRoZSBzaWJsaW5nL3BhcmVudCB0YWdOYW1lXG4gICAgICAgIGNvbnN0IHByZXZpb3VzQXR0cmlidXRlVmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICkgfHwgJyc7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBwcmV2aW91c0F0dHJpYnV0ZVZhbHVlID09PSAnc3RyaW5nJyApO1xuXG4gICAgICAgIGNvbnN0IG5ld0F0dHJpYnV0ZVZhbHVlID0gWyBwcmV2aW91c0F0dHJpYnV0ZVZhbHVlLnRyaW0oKSwgb3RoZXJQZWVyRWxlbWVudC5pZCBdLmpvaW4oICcgJyApLnRyaW0oKTtcblxuICAgICAgICAvLyBhZGQgdGhlIGlkIGZyb20gdGhlIG5ldyBhc3NvY2lhdGlvbiB0byB0aGUgdmFsdWUgb2YgdGhlIEhUTUxFbGVtZW50J3MgYXR0cmlidXRlLlxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZVRvRWxlbWVudCggYXR0cmlidXRlLCBuZXdBdHRyaWJ1dGVWYWx1ZSwge1xuICAgICAgICAgIGVsZW1lbnROYW1lOiBhc3NvY2lhdGlvbk9iamVjdC50aGlzRWxlbWVudE5hbWVcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY29udGVudEVsZW1lbnQgd2lsbCBlaXRoZXIgYmUgYSBsYWJlbCBvciBkZXNjcmlwdGlvbiBlbGVtZW50LiBUaGUgY29udGVudEVsZW1lbnQgd2lsbCBiZSBzb3J0ZWQgcmVsYXRpdmUgdG9cbiAgICogdGhlIHByaW1hcnlTaWJsaW5nLiBJdHMgcGxhY2VtZW50IHdpbGwgYWxzbyBkZXBlbmQgb24gd2hldGhlciBvciBub3QgdGhpcyBub2RlIHdhbnRzIHRvIGFwcGVuZCB0aGlzIGVsZW1lbnQsXG4gICAqIHNlZSBzZXRBcHBlbmRMYWJlbCgpIGFuZCBzZXRBcHBlbmREZXNjcmlwdGlvbigpLiBCeSBkZWZhdWx0LCB0aGUgXCJjb250ZW50XCIgZWxlbWVudCB3aWxsIGJlIHBsYWNlZCBiZWZvcmUgdGhlXG4gICAqIHByaW1hcnlTaWJsaW5nLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGZ1bmN0aW9uIGFzc3VtZXMgaXQgaXMgY2FsbGVkIG9uIGxhYmVsIHNpYmxpbmcgYmVmb3JlIGRlc2NyaXB0aW9uIHNpYmxpbmcgZm9yIGluc2VydGluZyBlbGVtZW50c1xuICAgKiBpbnRvIHRoZSBjb3JyZWN0IG9yZGVyLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250ZW50RWxlbWVudFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFwcGVuZEVsZW1lbnRcbiAgICovXG4gIGFycmFuZ2VDb250ZW50RWxlbWVudCggY29udGVudEVsZW1lbnQsIGFwcGVuZEVsZW1lbnQgKSB7XG5cbiAgICAvLyBpZiB0aGVyZSBpcyBhIGNvbnRhaW5lclBhcmVudFxuICAgIGlmICggdGhpcy50b3BMZXZlbEVsZW1lbnRzWyAwIF0gPT09IHRoaXMuX2NvbnRhaW5lclBhcmVudCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudG9wTGV2ZWxFbGVtZW50cy5sZW5ndGggPT09IDEgKTtcblxuICAgICAgaWYgKCBhcHBlbmRFbGVtZW50ICkge1xuICAgICAgICB0aGlzLl9jb250YWluZXJQYXJlbnQuYXBwZW5kQ2hpbGQoIGNvbnRlbnRFbGVtZW50ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyUGFyZW50Lmluc2VydEJlZm9yZSggY29udGVudEVsZW1lbnQsIHRoaXMuX3ByaW1hcnlTaWJsaW5nICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUgYXJlIG11bHRpcGxlIHRvcCBsZXZlbCBub2Rlc1xuICAgIGVsc2Uge1xuXG4gICAgICAvLyBrZWVwIHRoaXMudG9wTGV2ZWxFbGVtZW50cyBpbiBzeW5jXG4gICAgICBhcnJheVJlbW92ZSggdGhpcy50b3BMZXZlbEVsZW1lbnRzLCBjb250ZW50RWxlbWVudCApO1xuICAgICAgY29uc3QgaW5kZXhPZlByaW1hcnlTaWJsaW5nID0gdGhpcy50b3BMZXZlbEVsZW1lbnRzLmluZGV4T2YoIHRoaXMuX3ByaW1hcnlTaWJsaW5nICk7XG5cbiAgICAgIC8vIGlmIGFwcGVuZGluZywganVzdCBpbnNlcnQgYXQgYXQgZW5kIG9mIHRoZSB0b3AgbGV2ZWwgZWxlbWVudHNcbiAgICAgIGNvbnN0IGluc2VydEluZGV4ID0gYXBwZW5kRWxlbWVudCA/IHRoaXMudG9wTGV2ZWxFbGVtZW50cy5sZW5ndGggOiBpbmRleE9mUHJpbWFyeVNpYmxpbmc7XG4gICAgICB0aGlzLnRvcExldmVsRWxlbWVudHMuc3BsaWNlKCBpbnNlcnRJbmRleCwgMCwgY29udGVudEVsZW1lbnQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSXMgdGhpcyBwZWVyIGhpZGRlbiBpbiB0aGUgUERPTVxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNWaXNpYmxlKCkge1xuICAgIGlmICggYXNzZXJ0ICkge1xuXG4gICAgICBsZXQgdmlzaWJsZUVsZW1lbnRzID0gMDtcbiAgICAgIHRoaXMudG9wTGV2ZWxFbGVtZW50cy5mb3JFYWNoKCBlbGVtZW50ID0+IHtcblxuICAgICAgICAvLyBzdXBwb3J0IHByb3BlcnR5IG9yIGF0dHJpYnV0ZVxuICAgICAgICBpZiAoICFlbGVtZW50LmhpZGRlbiAmJiAhZWxlbWVudC5oYXNBdHRyaWJ1dGUoICdoaWRkZW4nICkgKSB7XG4gICAgICAgICAgdmlzaWJsZUVsZW1lbnRzICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIGFzc2VydCggdGhpcy52aXNpYmxlID8gdmlzaWJsZUVsZW1lbnRzID09PSB0aGlzLnRvcExldmVsRWxlbWVudHMubGVuZ3RoIDogdmlzaWJsZUVsZW1lbnRzID09PSAwLFxuICAgICAgICAnc29tZSBvZiB0aGUgcGVlclxcJ3MgZWxlbWVudHMgYXJlIHZpc2libGUgYW5kIHNvbWUgYXJlIG5vdCcgKTtcblxuICAgIH1cbiAgICByZXR1cm4gdGhpcy52aXNpYmxlID09PSBudWxsID8gdHJ1ZSA6IHRoaXMudmlzaWJsZTsgLy8gZGVmYXVsdCB0byB0cnVlIGlmIHZpc2liaWxpdHkgaGFzbid0IGJlZW4gc2V0IHlldC5cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hldGhlciBvciBub3QgdGhlIHBlZXIgaXMgdmlzaWJsZSBpbiB0aGUgUERPTVxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmlzaWJsZVxuICAgKi9cbiAgc2V0VmlzaWJsZSggdmlzaWJsZSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdmlzaWJsZSA9PT0gJ2Jvb2xlYW4nICk7XG4gICAgaWYgKCB0aGlzLnZpc2libGUgIT09IHZpc2libGUgKSB7XG5cbiAgICAgIHRoaXMudmlzaWJsZSA9IHZpc2libGU7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnRvcExldmVsRWxlbWVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnRvcExldmVsRWxlbWVudHNbIGkgXTtcbiAgICAgICAgaWYgKCB2aXNpYmxlICkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlRnJvbUVsZW1lbnQoICdoaWRkZW4nLCB7IGVsZW1lbnQ6IGVsZW1lbnQgfSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50KCAnaGlkZGVuJywgJycsIHsgZWxlbWVudDogZWxlbWVudCB9ICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSW52YWxpZGF0ZSBDU1MgdHJhbnNmb3JtcyBiZWNhdXNlIHdoZW4gJ2hpZGRlbicgdGhlIGNvbnRlbnQgd2lsbCBoYXZlIG5vIGRpbWVuc2lvbnMgaW4gdGhlIHZpZXdwb3J0LiBGb3JcbiAgICAgIC8vIGEgU2FmYXJpIFZvaWNlT3ZlciBidWcsIGFsc28gZm9yY2UgYSByZWZsb3cgaW4gdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lIHRvIGVuc3VyZSB0aGF0IHRoZSBhY2Nlc3NpYmxlIG5hbWUgaXNcbiAgICAgIC8vIGNvcnJlY3QuXG4gICAgICAvLyBUT0RPOiBSZW1vdmUgdGhpcyB3aGVuIHRoZSBidWcgaXMgZml4ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYTExeS1yZXNlYXJjaC9pc3N1ZXMvMTkzXG4gICAgICB0aGlzLmludmFsaWRhdGVDU1NQb3NpdGlvbmluZyggcGxhdGZvcm0uc2FmYXJpICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhpcyBwZWVyIGlzIGZvY3VzZWQuIEEgcGVlciBpcyBmb2N1c2VkIGlmIGl0cyBwcmltYXJ5U2libGluZyBpcyBmb2N1c2VkLlxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRm9jdXNlZCgpIHtcbiAgICBjb25zdCB2aXN1YWxGb2N1c1RyYWlsID0gUERPTUluc3RhbmNlLmd1ZXNzVmlzdWFsVHJhaWwoIHRoaXMudHJhaWwsIHRoaXMuZGlzcGxheS5yb290Tm9kZSApO1xuXG4gICAgcmV0dXJuIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS52YWx1ZSAmJiBGb2N1c01hbmFnZXIucGRvbUZvY3VzUHJvcGVydHkudmFsdWUudHJhaWwuZXF1YWxzKCB2aXN1YWxGb2N1c1RyYWlsICk7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXMgdGhlIHByaW1hcnkgc2libGluZyBvZiB0aGUgcGVlci4gSWYgdGhpcyBwZWVyIGlzIG5vdCB2aXNpYmxlLCB0aGlzIGlzIGEgbm8tb3AgKG5hdGl2ZSBiZWhhdmlvcikuXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBmb2N1cygpIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wcmltYXJ5U2libGluZywgJ211c3QgaGF2ZSBhIHByaW1hcnkgc2libGluZyB0byBmb2N1cycgKTtcblxuICAgIC8vIFdlIGRvIG5vdCB3YW50IHRvIHN0ZWFsIGZvY3VzIGZyb20gYW55IHBhcmVudCBhcHBsaWNhdGlvbi4gRm9yIGV4YW1wbGUsIGlmIHRoaXMgZWxlbWVudCBpcyBpbiBhbiBpZnJhbWUuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvODk3LlxuICAgIGlmICggRm9jdXNNYW5hZ2VyLndpbmRvd0hhc0ZvY3VzUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB0aGlzLl9wcmltYXJ5U2libGluZy5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCbHVyIHRoZSBwcmltYXJ5IHNpYmxpbmcgb2YgdGhlIHBlZXIuXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBibHVyKCkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3ByaW1hcnlTaWJsaW5nLCAnbXVzdCBoYXZlIGEgcHJpbWFyeSBzaWJsaW5nIHRvIGJsdXInICk7XG5cbiAgICAvLyBubyBvcCBieSB0aGUgYnJvd3NlciBpZiBwcmltYXJ5IHNpYmxpbmcgZG9lcyBub3QgaGF2ZSBmb2N1c1xuICAgIHRoaXMuX3ByaW1hcnlTaWJsaW5nLmJsdXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIHRoZSBwZWVyIGZvY3VzYWJsZS4gT25seSB0aGUgcHJpbWFyeSBzaWJsaW5nIGlzIGV2ZXIgY29uc2lkZXJlZCBmb2N1c2FibGUuXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtib29sZWFufSBmb2N1c2FibGVcbiAgICovXG4gIHNldEZvY3VzYWJsZSggZm9jdXNhYmxlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBmb2N1c2FibGUgPT09ICdib29sZWFuJyApO1xuXG4gICAgY29uc3QgcGVlckhhZEZvY3VzID0gdGhpcy5pc0ZvY3VzZWQoKTtcbiAgICBpZiAoIHRoaXMuZm9jdXNhYmxlICE9PSBmb2N1c2FibGUgKSB7XG4gICAgICB0aGlzLmZvY3VzYWJsZSA9IGZvY3VzYWJsZTtcbiAgICAgIFBET01VdGlscy5vdmVycmlkZUZvY3VzV2l0aFRhYkluZGV4KCB0aGlzLnByaW1hcnlTaWJsaW5nLCBmb2N1c2FibGUgKTtcblxuICAgICAgLy8gaW4gQ2hyb21lLCBpZiB0YWJpbmRleCBpcyByZW1vdmVkIGFuZCB0aGUgZWxlbWVudCBpcyBub3QgZm9jdXNhYmxlIGJ5IGRlZmF1bHQgdGhlIGVsZW1lbnQgaXMgYmx1cnJlZC5cbiAgICAgIC8vIFRoaXMgYmVoYXZpb3IgaXMgcmVhc29uYWJsZSBhbmQgd2Ugd2FudCB0byBlbmZvcmNlIGl0IGluIG90aGVyIGJyb3dzZXJzIGZvciBjb25zaXN0ZW5jeS4gU2VlXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvOTY3XG4gICAgICBpZiAoIHBlZXJIYWRGb2N1cyAmJiAhZm9jdXNhYmxlICkge1xuICAgICAgICB0aGlzLmJsdXIoKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVwb3NpdGlvbiB0aGUgc2libGluZyBpbiB0aGUgRE9NLCBzaW5jZSBub24tZm9jdXNhYmxlIG5vZGVzIGFyZSBub3QgcG9zaXRpb25lZFxuICAgICAgdGhpcy5pbnZhbGlkYXRlQ1NTUG9zaXRpb25pbmcoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzcG9uc2libGUgZm9yIHNldHRpbmcgdGhlIGNvbnRlbnQgZm9yIHRoZSBsYWJlbCBzaWJsaW5nXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IGNvbnRlbnQgLSB0aGUgY29udGVudCBmb3IgdGhlIGxhYmVsIHNpYmxpbmcuXG4gICAqL1xuICBzZXRMYWJlbFNpYmxpbmdDb250ZW50KCBjb250ZW50ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRlbnQgPT09IG51bGwgfHwgdHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnLCAnaW5jb3JyZWN0IGxhYmVsIGNvbnRlbnQgdHlwZScgKTtcblxuICAgIC8vIG5vLW9wIHRvIHN1cHBvcnQgYW55IG9wdGlvbiBvcmRlclxuICAgIGlmICggIXRoaXMuX2xhYmVsU2libGluZyApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBQRE9NVXRpbHMuc2V0VGV4dENvbnRlbnQoIHRoaXMuX2xhYmVsU2libGluZywgY29udGVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHRoZSBjb250ZW50IGZvciB0aGUgZGVzY3JpcHRpb24gc2libGluZ1xuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBjb250ZW50IC0gdGhlIGNvbnRlbnQgZm9yIHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nLlxuICAgKi9cbiAgc2V0RGVzY3JpcHRpb25TaWJsaW5nQ29udGVudCggY29udGVudCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb250ZW50ID09PSBudWxsIHx8IHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJywgJ2luY29ycmVjdCBkZXNjcmlwdGlvbiBjb250ZW50IHR5cGUnICk7XG5cbiAgICAvLyBuby1vcCB0byBzdXBwb3J0IGFueSBvcHRpb24gb3JkZXJcbiAgICBpZiAoICF0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFBET01VdGlscy5zZXRUZXh0Q29udGVudCggdGhpcy5fZGVzY3JpcHRpb25TaWJsaW5nLCBjb250ZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogUmVzcG9uc2libGUgZm9yIHNldHRpbmcgdGhlIGNvbnRlbnQgZm9yIHRoZSBwcmltYXJ5IHNpYmxpbmdcbiAgICogQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gY29udGVudCAtIHRoZSBjb250ZW50IGZvciB0aGUgcHJpbWFyeSBzaWJsaW5nLlxuICAgKi9cbiAgc2V0UHJpbWFyeVNpYmxpbmdDb250ZW50KCBjb250ZW50ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRlbnQgPT09IG51bGwgfHwgdHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnLCAnaW5jb3JyZWN0IGlubmVyIGNvbnRlbnQgdHlwZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBkb21JbnN0YW5jZS5jaGlsZHJlbi5sZW5ndGggPT09IDAsICdkZXNjZW5kYW50cyBleGlzdCB3aXRoIGFjY2Vzc2libGUgY29udGVudCwgaW5uZXJDb250ZW50IGNhbm5vdCBiZSB1c2VkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBET01VdGlscy50YWdOYW1lU3VwcG9ydHNDb250ZW50KCB0aGlzLl9wcmltYXJ5U2libGluZy50YWdOYW1lICksXG4gICAgICBgdGFnTmFtZTogJHt0aGlzLm5vZGUudGFnTmFtZX0gZG9lcyBub3Qgc3VwcG9ydCBpbm5lciBjb250ZW50YCApO1xuXG4gICAgLy8gbm8tb3AgdG8gc3VwcG9ydCBhbnkgb3B0aW9uIG9yZGVyXG4gICAgaWYgKCAhdGhpcy5fcHJpbWFyeVNpYmxpbmcgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFBET01VdGlscy5zZXRUZXh0Q29udGVudCggdGhpcy5fcHJpbWFyeVNpYmxpbmcsIGNvbnRlbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwZG9tVHJhbnNmb3JtU291cmNlTm9kZSBzbyB0aGF0IHRoZSBwcmltYXJ5IHNpYmxpbmcgd2lsbCBiZSB0cmFuc2Zvcm1lZCB3aXRoIGNoYW5nZXMgdG8gYWxvbmcgdGhlXG4gICAqIHVuaXF1ZSB0cmFpbCB0byB0aGUgc291cmNlIG5vZGUuIElmIG51bGwsIHJlcG9zaXRpb25pbmcgaGFwcGVucyB3aXRoIHRyYW5zZm9ybSBjaGFuZ2VzIGFsb25nIHRoaXNcbiAgICogcGRvbUluc3RhbmNlJ3MgdHJhaWwuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHsuLi9ub2Rlcy9Ob2RlfG51bGx9IG5vZGVcbiAgICovXG4gIHNldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlKCBub2RlICkge1xuXG4gICAgLy8gcmVtb3ZlIHByZXZpb3VzIGxpc3RlbmVycyBiZWZvcmUgY3JlYXRpbmcgYSBuZXcgVHJhbnNmb3JtVHJhY2tlclxuICAgIHRoaXMucGRvbUluc3RhbmNlLnRyYW5zZm9ybVRyYWNrZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgKTtcbiAgICB0aGlzLnBkb21JbnN0YW5jZS51cGRhdGVUcmFuc2Zvcm1UcmFja2VyKCBub2RlICk7XG5cbiAgICAvLyBhZGQgbGlzdGVuZXJzIGJhY2sgYWZ0ZXIgdXBkYXRlXG4gICAgdGhpcy5wZG9tSW5zdGFuY2UudHJhbnNmb3JtVHJhY2tlci5hZGRMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciApO1xuXG4gICAgLy8gbmV3IHRyYWlsIHdpdGggdHJhbnNmb3JtcyBzbyBwb3NpdGlvbmluZyBpcyBwcm9iYWJseSBkaXJ0eVxuICAgIHRoaXMuaW52YWxpZGF0ZUNTU1Bvc2l0aW9uaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlIG9yIGRpc2FibGUgcG9zaXRpb25pbmcgb2YgdGhlIHNpYmxpbmcgZWxlbWVudHMuIEdlbmVyYWxseSB0aGlzIGlzIHJlcXVpcmVkZm9yIGFjY2Vzc2liaWxpdHkgdG8gd29yayBvblxuICAgKiB0b3VjaCBzY3JlZW4gYmFzZWQgc2NyZWVuIHJlYWRlcnMgbGlrZSBwaG9uZXMuIEJ1dCByZXBvc2l0aW9uaW5nIERPTSBlbGVtZW50cyBpcyBleHBlbnNpdmUuIFRoaXMgY2FuIGJlIHNldCB0b1xuICAgKiBmYWxzZSB0byBvcHRpbWl6ZSB3aGVuIHBvc2l0aW9uaW5nIGlzIG5vdCBuZWNlc3NhcnkuXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcG9zaXRpb25JblBET01cbiAgICovXG4gIHNldFBvc2l0aW9uSW5QRE9NKCBwb3NpdGlvbkluUERPTSApIHtcbiAgICB0aGlzLnBvc2l0aW9uSW5QRE9NID0gcG9zaXRpb25JblBET007XG5cbiAgICAvLyBzaWduaWZ5IHRoYXQgaXQgbmVlZHMgdG8gYmUgcmVwb3NpdGlvbmVkIG5leHQgZnJhbWUsIGVpdGhlciBvZmYgc2NyZWVuIG9yIHRvIG1hdGNoXG4gICAgLy8gZ3JhcGhpY2FsIHJlbmRlcmluZ1xuICAgIHRoaXMuaW52YWxpZGF0ZUNTU1Bvc2l0aW9uaW5nKCk7XG4gIH1cblxuICAvLyBAcHJpdmF0ZVxuICBnZXRFbGVtZW50SWQoIHNpYmxpbmdOYW1lLCBzdHJpbmdJZCApIHtcbiAgICByZXR1cm4gYGRpc3BsYXkke3RoaXMuZGlzcGxheS5pZH0tJHtzaWJsaW5nTmFtZX0tJHtzdHJpbmdJZH1gO1xuICB9XG5cbiAgLy8gQHB1YmxpY1xuICB1cGRhdGVJbmRpY2VzU3RyaW5nQW5kRWxlbWVudElkcygpIHtcbiAgICBjb25zdCBpbmRpY2VzID0gdGhpcy5wZG9tSW5zdGFuY2UuZ2V0UERPTUluc3RhbmNlVW5pcXVlSWQoKTtcblxuICAgIGlmICggdGhpcy5fcHJpbWFyeVNpYmxpbmcgKSB7XG5cbiAgICAgIC8vIE5PVEU6IGRhdGFzZXQgaXNuJ3Qgc3VwcG9ydGVkIGJ5IGFsbCBuYW1lc3BhY2VzIChsaWtlIE1hdGhNTCkgc28gd2UgbmVlZCB0byB1c2Ugc2V0QXR0cmlidXRlXG4gICAgICB0aGlzLl9wcmltYXJ5U2libGluZy5zZXRBdHRyaWJ1dGUoIFBET01VdGlscy5EQVRBX1BET01fVU5JUVVFX0lELCBpbmRpY2VzICk7XG4gICAgICB0aGlzLl9wcmltYXJ5U2libGluZy5pZCA9IHRoaXMuZ2V0RWxlbWVudElkKCAncHJpbWFyeScsIGluZGljZXMgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLl9sYWJlbFNpYmxpbmcgKSB7XG5cbiAgICAgIC8vIE5PVEU6IGRhdGFzZXQgaXNuJ3Qgc3VwcG9ydGVkIGJ5IGFsbCBuYW1lc3BhY2VzIChsaWtlIE1hdGhNTCkgc28gd2UgbmVlZCB0byB1c2Ugc2V0QXR0cmlidXRlXG4gICAgICB0aGlzLl9sYWJlbFNpYmxpbmcuc2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCwgaW5kaWNlcyApO1xuICAgICAgdGhpcy5fbGFiZWxTaWJsaW5nLmlkID0gdGhpcy5nZXRFbGVtZW50SWQoICdsYWJlbCcsIGluZGljZXMgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcgKSB7XG5cbiAgICAgIC8vIE5PVEU6IGRhdGFzZXQgaXNuJ3Qgc3VwcG9ydGVkIGJ5IGFsbCBuYW1lc3BhY2VzIChsaWtlIE1hdGhNTCkgc28gd2UgbmVlZCB0byB1c2Ugc2V0QXR0cmlidXRlXG4gICAgICB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcuc2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCwgaW5kaWNlcyApO1xuICAgICAgdGhpcy5fZGVzY3JpcHRpb25TaWJsaW5nLmlkID0gdGhpcy5nZXRFbGVtZW50SWQoICdkZXNjcmlwdGlvbicsIGluZGljZXMgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLl9jb250YWluZXJQYXJlbnQgKSB7XG5cbiAgICAgIC8vIE5PVEU6IGRhdGFzZXQgaXNuJ3Qgc3VwcG9ydGVkIGJ5IGFsbCBuYW1lc3BhY2VzIChsaWtlIE1hdGhNTCkgc28gd2UgbmVlZCB0byB1c2Ugc2V0QXR0cmlidXRlXG4gICAgICB0aGlzLl9jb250YWluZXJQYXJlbnQuc2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCwgaW5kaWNlcyApO1xuICAgICAgdGhpcy5fY29udGFpbmVyUGFyZW50LmlkID0gdGhpcy5nZXRFbGVtZW50SWQoICdjb250YWluZXInLCBpbmRpY2VzICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1hcmsgdGhhdCB0aGUgc2libGluZ3Mgb2YgdGhpcyBQRE9NUGVlciBuZWVkIHRvIGJlIHVwZGF0ZWQgaW4gdGhlIG5leHQgRGlzcGxheSB1cGRhdGUuIFBvc3NpYmx5IGZyb20gYVxuICAgKiBjaGFuZ2Ugb2YgYWNjZXNzaWJsZSBjb250ZW50IG9yIG5vZGUgdHJhbnNmb3JtYXRpb24uIERvZXMgbm90aGluZyBpZiBhbHJlYWR5IG1hcmtlZCBkaXJ0eS5cbiAgICpcbiAgICogQHBhcmFtIFtmb3JjZVJlZmxvd1dvcmthcm91bmRdIC0gSW4gYWRkaXRpb24gdG8gcmVwb3NpdGlvbmluZywgZm9yY2UgYSByZWZsb3cgbmV4dCBhbmltYXRpb24gZnJhbWU/IFNlZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcmNlUmVmbG93V29ya2Fyb3VuZCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGludmFsaWRhdGVDU1NQb3NpdGlvbmluZyggZm9yY2VSZWZsb3dXb3JrYXJvdW5kID0gZmFsc2UgKSB7XG4gICAgaWYgKCAhdGhpcy5wb3NpdGlvbkRpcnR5ICkge1xuICAgICAgdGhpcy5wb3NpdGlvbkRpcnR5ID0gdHJ1ZTtcblxuICAgICAgaWYgKCBmb3JjZVJlZmxvd1dvcmthcm91bmQgKSB7XG4gICAgICAgIHRoaXMuZm9yY2VSZWZsb3dXb3JrYXJvdW5kID0gdHJ1ZTtcblxuICAgICAgICAvLyBgdHJhbnNmb3JtPXNjYWxlKDEpYCBmb3JjZXMgYSByZWZsb3cgc28gd2UgY2FuIHNldCB0aGlzIGFuZCByZXZlcnQgaXQgaW4gdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lLlxuICAgICAgICAvLyBUcmFuc2Zvcm0gaXMgdXNlZCBpbnN0ZWFkIG9mIGBkaXNwbGF5PSdub25lJ2AgYmVjYXVzZSBjaGFuZ2luZyBkaXNwbGF5IGltcGFjdHMgZm9jdXMuXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudG9wTGV2ZWxFbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICB0aGlzLnRvcExldmVsRWxlbWVudHNbIGkgXS5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGUoMSknO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG1hcmsgYWxsIGFuY2VzdG9ycyBvZiB0aGlzIHBlZXIgc28gdGhhdCB3ZSBjYW4gcXVpY2tseSBmaW5kIHRoaXMgZGlydHkgcGVlciB3aGVuIHdlIHRyYXZlcnNlXG4gICAgICAvLyB0aGUgUERPTUluc3RhbmNlIHRyZWVcbiAgICAgIGxldCBwYXJlbnQgPSB0aGlzLnBkb21JbnN0YW5jZS5wYXJlbnQ7XG4gICAgICB3aGlsZSAoIHBhcmVudCApIHtcbiAgICAgICAgcGFyZW50LnBlZXIuY2hpbGRQb3NpdGlvbkRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBDU1MgcG9zaXRpb25pbmcgb2YgdGhlIHByaW1hcnkgYW5kIGxhYmVsIHNpYmxpbmdzLiBSZXF1aXJlZCB0byBzdXBwb3J0IGFjY2Vzc2liaWxpdHkgb24gbW9iaWxlXG4gICAqIGRldmljZXMuIE9uIGFjdGl2YXRpb24gb2YgZm9jdXNhYmxlIGVsZW1lbnRzLCBjZXJ0YWluIEFUIHdpbGwgc2VuZCBmYWtlIHBvaW50ZXIgZXZlbnRzIHRvIHRoZSBicm93c2VyIGF0XG4gICAqIHRoZSBjZW50ZXIgb2YgdGhlIGNsaWVudCBib3VuZGluZyByZWN0YW5nbGUgb2YgdGhlIEhUTUwgZWxlbWVudC4gQnkgcG9zaXRpb25pbmcgZWxlbWVudHMgb3ZlciBncmFwaGljYWwgZGlzcGxheVxuICAgKiBvYmplY3RzIHdlIGNhbiBjYXB0dXJlIHRob3NlIGV2ZW50cy4gQSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggaXMgY2FsY3VsYXRlZCB0aGF0IHdpbGwgdHJhbnNmb3JtIHRoZSBwb3NpdGlvblxuICAgKiBhbmQgZGltZW5zaW9uIG9mIHRoZSBIVE1MIGVsZW1lbnQgaW4gcGl4ZWxzIHRvIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS4gVGhlIG1hdHJpeCBpcyB1c2VkIHRvIHRyYW5zZm9ybVxuICAgKiB0aGUgYm91bmRzIG9mIHRoZSBlbGVtZW50IHByaW9yIHRvIGFueSBvdGhlciB0cmFuc2Zvcm1hdGlvbiBzbyB3ZSBjYW4gc2V0IHRoZSBlbGVtZW50J3MgbGVmdCwgdG9wLCB3aWR0aCwgYW5kXG4gICAqIGhlaWdodCB3aXRoIENTUyBhdHRyaWJ1dGVzLlxuICAgKlxuICAgKiBGb3Igbm93IHdlIGFyZSBvbmx5IHRyYW5zZm9ybWluZyB0aGUgcHJpbWFyeSBhbmQgbGFiZWwgc2libGluZ3MgaWYgdGhlIHByaW1hcnkgc2libGluZyBpcyBmb2N1c2FibGUuIElmXG4gICAqIGZvY3VzYWJsZSwgdGhlIHByaW1hcnkgc2libGluZyBuZWVkcyB0byBiZSB0cmFuc2Zvcm1lZCB0byByZWNlaXZlIHVzZXIgaW5wdXQuIFZvaWNlT3ZlciBpbmNsdWRlcyB0aGUgbGFiZWwgYm91bmRzXG4gICAqIGluIGl0cyBjYWxjdWxhdGlvbiBmb3Igd2hlcmUgdG8gc2VuZCB0aGUgZXZlbnRzLCBzbyBpdCBuZWVkcyB0byBiZSB0cmFuc2Zvcm1lZCBhcyB3ZWxsLiBEZXNjcmlwdGlvbnMgYXJlIG5vdFxuICAgKiBjb25zaWRlcmVkIGFuZCBkbyBub3QgbmVlZCB0byBiZSBwb3NpdGlvbmVkLlxuICAgKlxuICAgKiBJbml0aWFsbHksIHdlIHRyaWVkIHRvIHNldCB0aGUgQ1NTIHRyYW5zZm9ybWF0aW9ucyBvbiBlbGVtZW50cyBkaXJlY3RseSB0aHJvdWdoIHRoZSB0cmFuc2Zvcm0gYXR0cmlidXRlLiBXaGlsZVxuICAgKiB0aGlzIHdvcmtlZCBmb3IgYmFzaWMgaW5wdXQsIGl0IGRpZCBub3Qgc3VwcG9ydCBvdGhlciBBVCBmZWF0dXJlcyBsaWtlIHRhcHBpbmcgdGhlIHNjcmVlbiB0byBmb2N1cyBlbGVtZW50cy5cbiAgICogV2l0aCB0aGlzIHN0cmF0ZWd5LCB0aGUgVm9pY2VPdmVyIFwidG91Y2ggYXJlYVwiIHdhcyBhIHNtYWxsIGJveCBhcm91bmQgdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgZWxlbWVudC4gSXQgd2FzXG4gICAqIG5ldmVyIGNsZWFyIHdoeSB0aGlzIHdhcyB0aGlzIGNhc2UsIGJ1dCBmb3JjZWQgdXMgdG8gY2hhbmdlIG91ciBzdHJhdGVneSB0byBzZXQgdGhlIGxlZnQsIHRvcCwgd2lkdGgsIGFuZCBoZWlnaHRcbiAgICogYXR0cmlidXRlcyBpbnN0ZWFkLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGFzc3VtZXMgdGhhdCBlbGVtZW50cyBoYXZlIG90aGVyIHN0eWxlIGF0dHJpYnV0ZXMgc28gdGhleSBjYW4gYmUgcG9zaXRpb25lZCBjb3JyZWN0bHkgYW5kIGRvbid0XG4gICAqIGludGVyZmVyZSB3aXRoIHNjZW5lcnkgaW5wdXQsIHNlZSBTY2VuZXJ5U3R5bGUgaW4gUERPTVV0aWxzLlxuICAgKlxuICAgKiBBZGRpdGlvbmFsIG5vdGVzIHdlcmUgdGFrZW4gaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg1Miwgc2VlIHRoYXQgaXNzdWUgZm9yIG1vcmVcbiAgICogaW5mb3JtYXRpb24uXG4gICAqXG4gICAqIFJldmlldzogVGhpcyBmdW5jdGlvbiBjb3VsZCBiZSBzaW1wbGlmaWVkIGJ5IHNldHRpbmcgdGhlIGVsZW1lbnQgd2lkdGgvaGVpZ2h0IGEgc21hbGwgYXJiaXRyYXJ5IHNoYXBlXG4gICAqIGF0IHRoZSBjZW50ZXIgb2YgdGhlIG5vZGUncyBnbG9iYWwgYm91bmRzLiBUaGVyZSBpcyBhIGRyYXdiYWNrIGluIHRoYXQgdGhlIFZPIGRlZmF1bHQgaGlnaGxpZ2h0IHdvbid0XG4gICAqIHN1cnJvdW5kIHRoZSBOb2RlIGFueW1vcmUuIEJ1dCBpdCBjb3VsZCBiZSBhIHBlcmZvcm1hbmNlIGVuaGFuY2VtZW50IGFuZCBzaW1wbGlmeSB0aGlzIGZ1bmN0aW9uLlxuICAgKiBPciBtYXliZSBhIGJpZyByZWN0YW5nbGUgbGFyZ2VyIHRoYW4gdGhlIERpc3BsYXkgZGl2IHN0aWxsIGNlbnRlcmVkIG9uIHRoZSBub2RlIHNvIHdlIG5ldmVyXG4gICAqIHNlZSB0aGUgVk8gaGlnaGxpZ2h0P1xuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcG9zaXRpb25FbGVtZW50cyggcG9zaXRpb25JblBET00gKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcHJpbWFyeVNpYmxpbmcsICdhIHByaW1hcnkgc2libGluZyByZXF1aXJlZCB0byByZWNlaXZlIENTUyBwb3NpdGlvbmluZycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBvc2l0aW9uRGlydHksICdlbGVtZW50cyBzaG91bGQgb25seSBiZSByZXBvc2l0aW9uZWQgaWYgZGlydHknICk7XG5cbiAgICAvLyBDU1MgdHJhbnNmb3JtYXRpb24gb25seSBuZWVkcyB0byBiZSBhcHBsaWVkIGlmIHRoZSBub2RlIGlzIGZvY3VzYWJsZSAtIG90aGVyd2lzZSB0aGUgZWxlbWVudCB3aWxsIGJlIGZvdW5kXG4gICAgLy8gYnkgZ2VzdHVyZSBuYXZpZ2F0aW9uIHdpdGggdGhlIHZpcnR1YWwgY3Vyc29yLiBCb3VuZHMgZm9yIG5vbi1mb2N1c2FibGUgZWxlbWVudHMgaW4gdGhlIFZpZXdQb3J0IGRvbid0XG4gICAgLy8gbmVlZCB0byBiZSBhY2N1cmF0ZSBiZWNhdXNlIHRoZSBBVCBkb2Vzbid0IG5lZWQgdG8gc2VuZCBldmVudHMgdG8gdGhlbS5cbiAgICBpZiAoIHBvc2l0aW9uSW5QRE9NICkge1xuICAgICAgY29uc3QgdHJhbnNmb3JtU291cmNlTm9kZSA9IHRoaXMubm9kZS5wZG9tVHJhbnNmb3JtU291cmNlTm9kZSB8fCB0aGlzLm5vZGU7XG5cbiAgICAgIHNjcmF0Y2hHbG9iYWxCb3VuZHMuc2V0KCB0cmFuc2Zvcm1Tb3VyY2VOb2RlLmxvY2FsQm91bmRzICk7XG4gICAgICBpZiAoIHNjcmF0Y2hHbG9iYWxCb3VuZHMuaXNGaW5pdGUoKSApIHtcbiAgICAgICAgc2NyYXRjaEdsb2JhbEJvdW5kcy50cmFuc2Zvcm0oIHRoaXMucGRvbUluc3RhbmNlLnRyYW5zZm9ybVRyYWNrZXIuZ2V0TWF0cml4KCkgKTtcblxuICAgICAgICAvLyBubyBuZWVkIHRvIHBvc2l0aW9uIGlmIHRoZSBub2RlIGlzIGZ1bGx5IG91dHNpZGUgb2YgdGhlIERpc3BsYXkgYm91bmRzIChvdXQgb2YgdmlldylcbiAgICAgICAgY29uc3QgZGlzcGxheUJvdW5kcyA9IHRoaXMuZGlzcGxheS5ib3VuZHM7XG4gICAgICAgIGlmICggZGlzcGxheUJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCBzY3JhdGNoR2xvYmFsQm91bmRzICkgKSB7XG5cbiAgICAgICAgICAvLyBDb25zdHJhaW4gdGhlIGdsb2JhbCBib3VuZHMgdG8gRGlzcGxheSBib3VuZHMgc28gdGhhdCBjZW50ZXIgb2YgdGhlIHNpYmxpbmcgZWxlbWVudFxuICAgICAgICAgIC8vIGlzIGFsd2F5cyBpbiB0aGUgRGlzcGxheS4gV2UgbWF5IG1pc3MgaW5wdXQgaWYgdGhlIGNlbnRlciBvZiB0aGUgTm9kZSBpcyBvdXRzaWRlXG4gICAgICAgICAgLy8gdGhlIERpc3BsYXksIHdoZXJlIFZvaWNlT3ZlciB3b3VsZCBvdGhlcndpc2Ugc2VuZCBwb2ludGVyIGV2ZW50cy5cbiAgICAgICAgICBzY3JhdGNoR2xvYmFsQm91bmRzLmNvbnN0cmFpbkJvdW5kcyggZGlzcGxheUJvdW5kcyApO1xuXG4gICAgICAgICAgbGV0IGNsaWVudERpbWVuc2lvbnMgPSBnZXRDbGllbnREaW1lbnNpb25zKCB0aGlzLl9wcmltYXJ5U2libGluZyApO1xuICAgICAgICAgIGxldCBjbGllbnRXaWR0aCA9IGNsaWVudERpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgICAgbGV0IGNsaWVudEhlaWdodCA9IGNsaWVudERpbWVuc2lvbnMuaGVpZ2h0O1xuXG4gICAgICAgICAgaWYgKCBjbGllbnRXaWR0aCA+IDAgJiYgY2xpZW50SGVpZ2h0ID4gMCApIHtcbiAgICAgICAgICAgIHNjcmF0Y2hTaWJsaW5nQm91bmRzLnNldE1pbk1heCggMCwgMCwgY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodCApO1xuICAgICAgICAgICAgc2NyYXRjaFNpYmxpbmdCb3VuZHMudHJhbnNmb3JtKCBnZXRDU1NNYXRyaXgoIGNsaWVudFdpZHRoLCBjbGllbnRIZWlnaHQsIHNjcmF0Y2hHbG9iYWxCb3VuZHMgKSApO1xuICAgICAgICAgICAgc2V0Q2xpZW50Qm91bmRzKCB0aGlzLl9wcmltYXJ5U2libGluZywgc2NyYXRjaFNpYmxpbmdCb3VuZHMgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIHRoaXMubGFiZWxTaWJsaW5nICkge1xuICAgICAgICAgICAgY2xpZW50RGltZW5zaW9ucyA9IGdldENsaWVudERpbWVuc2lvbnMoIHRoaXMuX2xhYmVsU2libGluZyApO1xuICAgICAgICAgICAgY2xpZW50V2lkdGggPSBjbGllbnREaW1lbnNpb25zLndpZHRoO1xuICAgICAgICAgICAgY2xpZW50SGVpZ2h0ID0gY2xpZW50RGltZW5zaW9ucy5oZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmICggY2xpZW50SGVpZ2h0ID4gMCAmJiBjbGllbnRXaWR0aCA+IDAgKSB7XG4gICAgICAgICAgICAgIHNjcmF0Y2hTaWJsaW5nQm91bmRzLnNldE1pbk1heCggMCwgMCwgY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodCApO1xuICAgICAgICAgICAgICBzY3JhdGNoU2libGluZ0JvdW5kcy50cmFuc2Zvcm0oIGdldENTU01hdHJpeCggY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodCwgc2NyYXRjaEdsb2JhbEJvdW5kcyApICk7XG4gICAgICAgICAgICAgIHNldENsaWVudEJvdW5kcyggdGhpcy5fbGFiZWxTaWJsaW5nLCBzY3JhdGNoU2libGluZ0JvdW5kcyApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gbm90IHBvc2l0aW9uaW5nLCBqdXN0IG1vdmUgb2ZmIHNjcmVlblxuICAgICAgc2NyYXRjaFNpYmxpbmdCb3VuZHMuc2V0KCBQRE9NUGVlci5PRkZTQ1JFRU5fU0lCTElOR19CT1VORFMgKTtcbiAgICAgIHNldENsaWVudEJvdW5kcyggdGhpcy5fcHJpbWFyeVNpYmxpbmcsIHNjcmF0Y2hTaWJsaW5nQm91bmRzICk7XG4gICAgICBpZiAoIHRoaXMuX2xhYmVsU2libGluZyApIHtcbiAgICAgICAgc2V0Q2xpZW50Qm91bmRzKCB0aGlzLl9sYWJlbFNpYmxpbmcsIHNjcmF0Y2hTaWJsaW5nQm91bmRzICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLmZvcmNlUmVmbG93V29ya2Fyb3VuZCApIHtcblxuICAgICAgLy8gRm9yY2UgYSByZWZsb3cgKHJlY2FsY3VsYXRpb24gb2YgRE9NIGxheW91dCkgdG8gZml4IHRoZSBhY2Nlc3NpYmxlIG5hbWUuXG4gICAgICB0aGlzLnRvcExldmVsRWxlbWVudHMuZm9yRWFjaCggZWxlbWVudCA9PiB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJyc7IC8vIGZvcmNlIHJlZmxvdyByZXF1ZXN0IGJ5IHJlbW92aW5nIHRoZSB0cmFuc2Zvcm0gYWRkZWQgaW4gdGhlIHByZXZpb3VzIGZyYW1lXG4gICAgICAgIGVsZW1lbnQuc3R5bGUub2Zmc2V0SGVpZ2h0OyAvLyBxdWVyeSB0aGUgb2Zmc2V0SGVpZ2h0IGFmdGVyIHJlc3RvcmluZyBkaXNwbGF5IHRvIGZvcmNlIHJlZmxvd1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIHRoaXMucG9zaXRpb25EaXJ0eSA9IGZhbHNlO1xuICAgIHRoaXMuZm9yY2VSZWZsb3dXb3JrYXJvdW5kID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHBvc2l0aW9uaW5nIG9mIGVsZW1lbnRzIGluIHRoZSBQRE9NLiBEb2VzIGEgZGVwdGggZmlyc3Qgc2VhcmNoIGZvciBhbGwgZGVzY2VuZGFudHMgb2YgcGFyZW50SW50c2FuY2Ugd2l0aFxuICAgKiBhIHBlZXIgdGhhdCBlaXRoZXIgaGFzIGRpcnR5IHBvc2l0aW9uaW5nIG9yIGFzIGEgZGVzY2VuZGFudCB3aXRoIGRpcnR5IHBvc2l0aW9uaW5nLlxuICAgKlxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgdXBkYXRlU3VidHJlZVBvc2l0aW9uaW5nKCBwYXJlbnRQb3NpdGlvbkluUERPTSA9IGZhbHNlICkge1xuICAgIHRoaXMuY2hpbGRQb3NpdGlvbkRpcnR5ID0gZmFsc2U7XG5cbiAgICBjb25zdCBwb3NpdGlvbkluUERPTSA9IHRoaXMucG9zaXRpb25JblBET00gfHwgcGFyZW50UG9zaXRpb25JblBET007XG5cbiAgICBpZiAoIHRoaXMucG9zaXRpb25EaXJ0eSApIHtcbiAgICAgIHRoaXMucG9zaXRpb25FbGVtZW50cyggcG9zaXRpb25JblBET00gKTtcbiAgICB9XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnBkb21JbnN0YW5jZS5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGNoaWxkUGVlciA9IHRoaXMucGRvbUluc3RhbmNlLmNoaWxkcmVuWyBpIF0ucGVlcjtcbiAgICAgIGlmICggY2hpbGRQZWVyLnBvc2l0aW9uRGlydHkgfHwgY2hpbGRQZWVyLmNoaWxkUG9zaXRpb25EaXJ0eSApIHtcbiAgICAgICAgdGhpcy5wZG9tSW5zdGFuY2UuY2hpbGRyZW5bIGkgXS5wZWVyLnVwZGF0ZVN1YnRyZWVQb3NpdGlvbmluZyggcG9zaXRpb25JblBET00gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlbHkgc2V0IHRoaXMgUERPTVBlZXIgYW5kIGNoaWxkcmVuIHRvIGJlIGRpc2FibGVkLiBUaGlzIHdpbGwgb3ZlcndyaXRlIGFueSBwcmV2aW91cyB2YWx1ZSBvZiBkaXNhYmxlZFxuICAgKiB0aGF0IG1heSBoYXZlIGJlZW4gc2V0LCBidXQgd2lsbCBrZWVwIHRyYWNrIG9mIHRoZSBvbGQgdmFsdWUsIGFuZCByZXN0b3JlIGl0cyBzdGF0ZSB1cG9uIHJlLWVuYWJsaW5nLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRpc2FibGVkXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHJlY3Vyc2l2ZURpc2FibGUoIGRpc2FibGVkICkge1xuXG4gICAgaWYgKCBkaXNhYmxlZCApIHtcbiAgICAgIHRoaXMuX3ByZXNlcnZlZERpc2FibGVkVmFsdWUgPSB0aGlzLl9wcmltYXJ5U2libGluZy5kaXNhYmxlZDtcbiAgICAgIHRoaXMuX3ByaW1hcnlTaWJsaW5nLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9wcmltYXJ5U2libGluZy5kaXNhYmxlZCA9IHRoaXMuX3ByZXNlcnZlZERpc2FibGVkVmFsdWU7XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wZG9tSW5zdGFuY2UuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLnBkb21JbnN0YW5jZS5jaGlsZHJlblsgaSBdLnBlZXIucmVjdXJzaXZlRGlzYWJsZSggZGlzYWJsZWQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBleHRlcm5hbCByZWZlcmVuY2VzIGZyb20gdGhpcyBwZWVyLCBhbmQgcGxhY2VzIGl0IGluIHRoZSBwb29sLlxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmlzRGlzcG9zZWQgPSB0cnVlO1xuXG4gICAgLy8gcmVtb3ZlIGZvY3VzIGlmIHRoZSBkaXNwb3NlZCBwZWVyIGlzIHRoZSBhY3RpdmUgZWxlbWVudFxuICAgIHRoaXMuYmx1cigpO1xuXG4gICAgLy8gcmVtb3ZlIGxpc3RlbmVyc1xuICAgIHRoaXMuX3ByaW1hcnlTaWJsaW5nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdibHVyJywgdGhpcy5ibHVyRXZlbnRMaXN0ZW5lciApO1xuICAgIHRoaXMuX3ByaW1hcnlTaWJsaW5nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdmb2N1cycsIHRoaXMuZm9jdXNFdmVudExpc3RlbmVyICk7XG4gICAgdGhpcy5wZG9tSW5zdGFuY2UudHJhbnNmb3JtVHJhY2tlci5yZW1vdmVMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciApO1xuICAgIHRoaXMubXV0YXRpb25PYnNlcnZlci5kaXNjb25uZWN0KCk7XG5cbiAgICAvLyB6ZXJvLW91dCByZWZlcmVuY2VzXG4gICAgdGhpcy5wZG9tSW5zdGFuY2UgPSBudWxsO1xuICAgIHRoaXMubm9kZSA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5ID0gbnVsbDtcbiAgICB0aGlzLnRyYWlsID0gbnVsbDtcbiAgICB0aGlzLl9wcmltYXJ5U2libGluZyA9IG51bGw7XG4gICAgdGhpcy5fbGFiZWxTaWJsaW5nID0gbnVsbDtcbiAgICB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcgPSBudWxsO1xuICAgIHRoaXMuX2NvbnRhaW5lclBhcmVudCA9IG51bGw7XG4gICAgdGhpcy5mb2N1c2FibGUgPSBudWxsO1xuXG4gICAgLy8gZm9yIG5vd1xuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xuICB9XG59XG5cbi8vIEBwdWJsaWMge3N0cmluZ30gLSBzcGVjaWZpZXMgdmFsaWQgYXNzb2NpYXRpb25zIGJldHdlZW4gcmVsYXRlZCBQRE9NUGVlcnMgaW4gdGhlIERPTVxuUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HID0gUFJJTUFSWV9TSUJMSU5HOyAvLyBhc3NvY2lhdGUgd2l0aCBhbGwgYWNjZXNzaWJsZSBjb250ZW50IHJlbGF0ZWQgdG8gdGhpcyBwZWVyXG5QRE9NUGVlci5MQUJFTF9TSUJMSU5HID0gTEFCRUxfU0lCTElORzsgLy8gYXNzb2NpYXRlIHdpdGgganVzdCB0aGUgbGFiZWwgY29udGVudCBvZiB0aGlzIHBlZXJcblBET01QZWVyLkRFU0NSSVBUSU9OX1NJQkxJTkcgPSBERVNDUklQVElPTl9TSUJMSU5HOyAvLyBhc3NvY2lhdGUgd2l0aCBqdXN0IHRoZSBkZXNjcmlwdGlvbiBjb250ZW50IG9mIHRoaXMgcGVlclxuUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVCA9IENPTlRBSU5FUl9QQVJFTlQ7IC8vIGFzc29jaWF0ZSB3aXRoIGV2ZXJ5dGhpbmcgdW5kZXIgdGhlIGNvbnRhaW5lciBwYXJlbnQgb2YgdGhpcyBwZWVyXG5cbi8vIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpIC0gYm91bmRzIGZvciBhIHNpYmxpbmcgdGhhdCBzaG91bGQgYmUgbW92ZWQgb2ZmLXNjcmVlbiB3aGVuIG5vdCBwb3NpdGlvbmluZywgaW5cbi8vIGdsb2JhbCBjb29yZGluYXRlc1xuUERPTVBlZXIuT0ZGU0NSRUVOX1NJQkxJTkdfQk9VTkRTID0gbmV3IEJvdW5kczIoIDAsIDAsIDEsIDEgKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ1BET01QZWVyJywgUERPTVBlZXIgKTtcblxuLy8gU2V0IHVwIHBvb2xpbmdcblBvb2xhYmxlLm1peEludG8oIFBET01QZWVyLCB7XG4gIGluaXRpYWxpemU6IFBET01QZWVyLnByb3RvdHlwZS5pbml0aWFsaXplUERPTVBlZXJcbn0gKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENyZWF0ZSBhIHNpYmxpbmcgZWxlbWVudCBmb3IgdGhlIFBET01QZWVyLlxuICogVE9ETzogdGhpcyBzaG91bGQgYmUgaW5saW5lZCB3aXRoIHRoZSBQRE9NVXRpbHMgbWV0aG9kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnTmFtZVxuICogQHBhcmFtIHtib29sZWFufSBmb2N1c2FibGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBwYXNzZWQgYWxvbmcgdG8gUERPTVV0aWxzLmNyZWF0ZUVsZW1lbnRcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRWxlbWVudCggdGFnTmFtZSwgZm9jdXNhYmxlLCBvcHRpb25zICkge1xuICBvcHRpb25zID0gbWVyZ2UoIHtcblxuICAgIC8vIHtzdHJpbmd8bnVsbH0gLSBhZGRpdGlvbiB0byB0aGUgdHJhaWxJZCwgc2VwYXJhdGVkIGJ5IGEgaHlwaGVuIHRvIGlkZW50aWZ5IHRoZSBkaWZmZXJlbnQgc2libGluZ3Mgd2l0aGluXG4gICAgLy8gdGhlIGRvY3VtZW50XG4gICAgc2libGluZ05hbWU6IG51bGwsXG5cbiAgICAvLyB7Ym9vbGVhbn0gLSBpZiB0cnVlLCBET00gaW5wdXQgZXZlbnRzIHJlY2VpdmVkIG9uIHRoZSBlbGVtZW50IHdpbGwgbm90IGJlIGRpc3BhdGNoZWQgYXMgU2NlbmVyeUV2ZW50cyBpbiBJbnB1dC5qc1xuICAgIC8vIHNlZSBQYXJhbGxlbERPTS5zZXRFeGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0IGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAgZXhjbHVkZUZyb21JbnB1dDogZmFsc2VcbiAgfSwgb3B0aW9ucyApO1xuXG4gIGNvbnN0IG5ld0VsZW1lbnQgPSBQRE9NVXRpbHMuY3JlYXRlRWxlbWVudCggdGFnTmFtZSwgZm9jdXNhYmxlLCBvcHRpb25zICk7XG5cbiAgaWYgKCBvcHRpb25zLmV4Y2x1ZGVGcm9tSW5wdXQgKSB7XG4gICAgbmV3RWxlbWVudC5zZXRBdHRyaWJ1dGUoIFBET01VdGlscy5EQVRBX0VYQ0xVREVfRlJPTV9JTlBVVCwgdHJ1ZSApO1xuICB9XG5cbiAgcmV0dXJuIG5ld0VsZW1lbnQ7XG59XG5cbi8qKlxuICogR2V0IGEgbWF0cml4IHRoYXQgY2FuIGJlIHVzZWQgYXMgdGhlIENTUyB0cmFuc2Zvcm0gZm9yIGVsZW1lbnRzIGluIHRoZSBET00uIFRoaXMgbWF0cml4IHdpbGwgYW4gSFRNTCBlbGVtZW50XG4gKiBkaW1lbnNpb25zIGluIHBpeGVscyB0byB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuXG4gKlxuICogQHBhcmFtICB7bnVtYmVyfSBjbGllbnRXaWR0aCAtIHdpZHRoIG9mIHRoZSBlbGVtZW50IHRvIHRyYW5zZm9ybSBpbiBwaXhlbHNcbiAqIEBwYXJhbSAge251bWJlcn0gY2xpZW50SGVpZ2h0IC0gaGVpZ2h0IG9mIHRoZSBlbGVtZW50IHRvIHRyYW5zZm9ybSBpbiBwaXhlbHNcbiAqIEBwYXJhbSAge0JvdW5kczJ9IG5vZGVHbG9iYWxCb3VuZHMgLSBCb3VuZHMgb2YgdGhlIFBET01QZWVyJ3Mgbm9kZSBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuXG4gKiBAcmV0dXJucyB7TWF0cml4M31cbiAqL1xuZnVuY3Rpb24gZ2V0Q1NTTWF0cml4KCBjbGllbnRXaWR0aCwgY2xpZW50SGVpZ2h0LCBub2RlR2xvYmFsQm91bmRzICkge1xuXG4gIC8vIHRoZSB0cmFuc2xhdGlvbiBtYXRyaXggZm9yIHRoZSBub2RlJ3MgYm91bmRzIGluIGl0cyBsb2NhbCBjb29yZGluYXRlIGZyYW1lXG4gIGdsb2JhbE5vZGVUcmFuc2xhdGlvbk1hdHJpeC5zZXRUb1RyYW5zbGF0aW9uKCBub2RlR2xvYmFsQm91bmRzLm1pblgsIG5vZGVHbG9iYWxCb3VuZHMubWluWSApO1xuXG4gIC8vIHNjYWxlIG1hdHJpeCBmb3IgXCJjbGllbnRcIiBIVE1MIGVsZW1lbnQsIHNjYWxlIHRvIG1ha2UgdGhlIEhUTUwgZWxlbWVudCdzIERPTSBib3VuZHMgbWF0Y2ggdGhlXG4gIC8vIGxvY2FsIGJvdW5kcyBvZiB0aGUgbm9kZVxuICBnbG9iYWxUb0NsaWVudFNjYWxlTWF0cml4LnNldFRvU2NhbGUoIG5vZGVHbG9iYWxCb3VuZHMud2lkdGggLyBjbGllbnRXaWR0aCwgbm9kZUdsb2JhbEJvdW5kcy5oZWlnaHQgLyBjbGllbnRIZWlnaHQgKTtcblxuICAvLyBjb21iaW5lIHRoZXNlIGluIGEgc2luZ2xlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxuICByZXR1cm4gZ2xvYmFsTm9kZVRyYW5zbGF0aW9uTWF0cml4Lm11bHRpcGx5TWF0cml4KCBnbG9iYWxUb0NsaWVudFNjYWxlTWF0cml4ICkubXVsdGlwbHlNYXRyaXgoIG5vZGVTY2FsZU1hZ25pdHVkZU1hdHJpeCApO1xufVxuXG4vKipcbiAqIEdldHMgYW4gb2JqZWN0IHdpdGggdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgYW4gSFRNTCBlbGVtZW50IGluIHBpeGVscywgcHJpb3IgdG8gYW55IHNjYWxpbmcuIGNsaWVudFdpZHRoIGFuZFxuICogY2xpZW50SGVpZ2h0IGFyZSB6ZXJvIGZvciBlbGVtZW50cyB3aXRoIGlubGluZSBsYXlvdXQgYW5kIGVsZW1lbnRzIHdpdGhvdXQgQ1NTLiBGb3IgdGhvc2UgZWxlbWVudHMgd2UgZmFsbCBiYWNrXG4gKiB0byB0aGUgYm91bmRpbmdDbGllbnRSZWN0LCB3aGljaCBhdCB0aGF0IHBvaW50IHdpbGwgZGVzY3JpYmUgdGhlIGRpbWVuc2lvbnMgb2YgdGhlIGVsZW1lbnQgcHJpb3IgdG8gc2NhbGluZy5cbiAqXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gc2libGluZ0VsZW1lbnRcbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCB0d28gZW50cmllcywgeyB3aWR0aDoge251bWJlcn0sIGhlaWdodDoge251bWJlcn0gfVxuICovXG5mdW5jdGlvbiBnZXRDbGllbnREaW1lbnNpb25zKCBzaWJsaW5nRWxlbWVudCApIHtcbiAgbGV0IGNsaWVudFdpZHRoID0gc2libGluZ0VsZW1lbnQuY2xpZW50V2lkdGg7XG4gIGxldCBjbGllbnRIZWlnaHQgPSBzaWJsaW5nRWxlbWVudC5jbGllbnRIZWlnaHQ7XG5cbiAgaWYgKCBjbGllbnRXaWR0aCA9PT0gMCAmJiBjbGllbnRIZWlnaHQgPT09IDAgKSB7XG4gICAgY29uc3QgY2xpZW50UmVjdCA9IHNpYmxpbmdFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNsaWVudFdpZHRoID0gY2xpZW50UmVjdC53aWR0aDtcbiAgICBjbGllbnRIZWlnaHQgPSBjbGllbnRSZWN0LmhlaWdodDtcbiAgfVxuXG4gIHJldHVybiB7IHdpZHRoOiBjbGllbnRXaWR0aCwgaGVpZ2h0OiBjbGllbnRIZWlnaHQgfTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGJvdW5kcyBvZiB0aGUgc2libGluZyBlbGVtZW50IGluIHRoZSB2aWV3IHBvcnQgaW4gcGl4ZWxzLCB1c2luZyB0b3AsIGxlZnQsIHdpZHRoLCBhbmQgaGVpZ2h0IGNzcy5cbiAqIFRoZSBlbGVtZW50IG11c3QgYmUgc3R5bGVkIHdpdGggJ3Bvc2l0aW9uOiBmaXhlZCcsIGFuZCBhbiBhbmNlc3RvciBtdXN0IGhhdmUgcG9zaXRpb246ICdyZWxhdGl2ZScsIHNvIHRoYXRcbiAqIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBzaWJsaW5nIGFyZSByZWxhdGl2ZSB0byB0aGUgcGFyZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHNpYmxpbmdFbGVtZW50IC0gdGhlIGVsZW1lbnQgdG8gcG9zaXRpb25cbiAqIEBwYXJhbSB7Qm91bmRzMn0gYm91bmRzIC0gZGVzaXJlZCBib3VuZHMsIGluIHBpeGVsc1xuICovXG5mdW5jdGlvbiBzZXRDbGllbnRCb3VuZHMoIHNpYmxpbmdFbGVtZW50LCBib3VuZHMgKSB7XG4gIHNpYmxpbmdFbGVtZW50LnN0eWxlLnRvcCA9IGAke2JvdW5kcy50b3B9cHhgO1xuICBzaWJsaW5nRWxlbWVudC5zdHlsZS5sZWZ0ID0gYCR7Ym91bmRzLmxlZnR9cHhgO1xuICBzaWJsaW5nRWxlbWVudC5zdHlsZS53aWR0aCA9IGAke2JvdW5kcy53aWR0aH1weGA7XG4gIHNpYmxpbmdFbGVtZW50LnN0eWxlLmhlaWdodCA9IGAke2JvdW5kcy5oZWlnaHR9cHhgO1xufVxuXG5leHBvcnQgZGVmYXVsdCBQRE9NUGVlcjsiXSwibmFtZXMiOlsiQm91bmRzMiIsIk1hdHJpeDMiLCJhcnJheVJlbW92ZSIsIm1lcmdlIiwicGxhdGZvcm0iLCJQb29sYWJsZSIsInN0cmlwRW1iZWRkaW5nTWFya3MiLCJGb2N1c01hbmFnZXIiLCJQRE9NSW5zdGFuY2UiLCJQRE9NU2libGluZ1N0eWxlIiwiUERPTVV0aWxzIiwic2NlbmVyeSIsIlBSSU1BUllfU0lCTElORyIsIkxBQkVMX1NJQkxJTkciLCJERVNDUklQVElPTl9TSUJMSU5HIiwiQ09OVEFJTkVSX1BBUkVOVCIsIkxBQkVMX1RBRyIsIlRBR1MiLCJMQUJFTCIsIklOUFVUX1RBRyIsIklOUFVUIiwiRElTQUJMRURfQVRUUklCVVRFX05BTUUiLCJPQlNFUlZFUl9DT05GSUciLCJhdHRyaWJ1dGVzIiwiY2hpbGRMaXN0IiwiY2hhcmFjdGVyRGF0YSIsImdsb2JhbElkIiwic2NyYXRjaEdsb2JhbEJvdW5kcyIsInNjcmF0Y2hTaWJsaW5nQm91bmRzIiwiZ2xvYmFsTm9kZVRyYW5zbGF0aW9uTWF0cml4IiwiZ2xvYmFsVG9DbGllbnRTY2FsZU1hdHJpeCIsIm5vZGVTY2FsZU1hZ25pdHVkZU1hdHJpeCIsIlBET01QZWVyIiwiaW5pdGlhbGl6ZVBET01QZWVyIiwicGRvbUluc3RhbmNlIiwib3B0aW9ucyIsInByaW1hcnlTaWJsaW5nIiwiYXNzZXJ0IiwiaWQiLCJpc0Rpc3Bvc2VkIiwibm9kZSIsImRpc3BsYXkiLCJ0cmFpbCIsInZpc2libGUiLCJmb2N1c2FibGUiLCJfbGFiZWxTaWJsaW5nIiwiX2Rlc2NyaXB0aW9uU2libGluZyIsIl9jb250YWluZXJQYXJlbnQiLCJ0b3BMZXZlbEVsZW1lbnRzIiwicG9zaXRpb25EaXJ0eSIsImZvcmNlUmVmbG93V29ya2Fyb3VuZCIsImNoaWxkUG9zaXRpb25EaXJ0eSIsInBvc2l0aW9uSW5QRE9NIiwibXV0YXRpb25PYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJpbnZhbGlkYXRlQ1NTUG9zaXRpb25pbmciLCJiaW5kIiwidHJhbnNmb3JtTGlzdGVuZXIiLCJ0cmFuc2Zvcm1UcmFja2VyIiwiYWRkTGlzdGVuZXIiLCJfcHJlc2VydmVkRGlzYWJsZWRWYWx1ZSIsImlzUm9vdEluc3RhbmNlIiwiX3ByaW1hcnlTaWJsaW5nIiwiY2xhc3NMaXN0IiwiYWRkIiwiUk9PVF9DTEFTU19OQU1FIiwiQkxPQ0tFRF9ET01fRVZFTlRTIiwiZm9yRWFjaCIsImV2ZW50VHlwZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInVwZGF0ZSIsInVwZGF0ZUluZGljZXNTdHJpbmdBbmRFbGVtZW50SWRzIiwiZ2V0QmFzZU9wdGlvbnMiLCJjYWxsYmFja3NGb3JPdGhlck5vZGVzIiwiYWNjZXNzaWJsZU5hbWUiLCJhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwicGRvbUhlYWRpbmciLCJwZG9tSGVhZGluZ0JlaGF2aW9yIiwiaGVscFRleHQiLCJoZWxwVGV4dEJlaGF2aW9yIiwiY3JlYXRlRWxlbWVudCIsInRhZ05hbWUiLCJuYW1lc3BhY2UiLCJwZG9tTmFtZXNwYWNlIiwiY29udGFpbmVyVGFnTmFtZSIsImxhYmVsVGFnTmFtZSIsImV4Y2x1ZGVGcm9tSW5wdXQiLCJleGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0IiwiZGVzY3JpcHRpb25UYWdOYW1lIiwib3JkZXJFbGVtZW50cyIsImRpc2Nvbm5lY3QiLCJvYnNlcnZlIiwibGFiZWxDb250ZW50Iiwic2V0TGFiZWxTaWJsaW5nQ29udGVudCIsImlubmVyQ29udGVudCIsInNldFByaW1hcnlTaWJsaW5nQ29udGVudCIsImRlc2NyaXB0aW9uQ29udGVudCIsInNldERlc2NyaXB0aW9uU2libGluZ0NvbnRlbnQiLCJ0b1VwcGVyQ2FzZSIsImlucHV0VHlwZSIsInNldEF0dHJpYnV0ZVRvRWxlbWVudCIsImVsZW1lbnROYW1lIiwic2V0Rm9jdXNhYmxlIiwic2V0UG9zaXRpb25JblBET00iLCJvbkFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25DaGFuZ2UiLCJvbkFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uQ2hhbmdlIiwib25BY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25DaGFuZ2UiLCJvbkF0dHJpYnV0ZUNoYW5nZSIsIm9uQ2xhc3NDaGFuZ2UiLCJvbklucHV0VmFsdWVDaGFuZ2UiLCJ1cGRhdGVPdGhlck5vZGVzQXJpYUxhYmVsbGVkYnkiLCJ1cGRhdGVPdGhlck5vZGVzQXJpYURlc2NyaWJlZGJ5IiwidXBkYXRlT3RoZXJOb2Rlc0FjdGl2ZURlc2NlbmRhbnQiLCJjYWxsYmFjayIsImNvbmZpZyIsImluc2VydEJlZm9yZSIsImNoaWxkcmVuIiwiZmlsdGVyIiwiXyIsImlkZW50aXR5IiwiYXJyYW5nZUNvbnRlbnRFbGVtZW50IiwiYXBwZW5kTGFiZWwiLCJhcHBlbmREZXNjcmlwdGlvbiIsImdldFByaW1hcnlTaWJsaW5nIiwiZ2V0TGFiZWxTaWJsaW5nIiwibGFiZWxTaWJsaW5nIiwiZ2V0RGVzY3JpcHRpb25TaWJsaW5nIiwiZGVzY3JpcHRpb25TaWJsaW5nIiwiZ2V0Q29udGFpbmVyUGFyZW50IiwiY29udGFpbmVyUGFyZW50IiwiZ2V0VG9wTGV2ZWxFbGVtZW50Q29udGFpbmluZ1ByaW1hcnlTaWJsaW5nIiwicmVtb3ZlQXR0cmlidXRlRnJvbUFsbEVsZW1lbnRzIiwiaSIsImFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zIiwibGVuZ3RoIiwiYXNzb2NpYXRpb25PYmplY3QiLCJvdGhlck5vZGUiLCJub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlIiwiaW5kZXhPZiIsInNldEFzc29jaWF0aW9uQXR0cmlidXRlIiwiYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zIiwibm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGUiLCJhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zIiwibm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUiLCJoYW5kbGVBdHRyaWJ1dGVXaXRoUERPTU9wdGlvbiIsImtleSIsInZhbHVlIiwicmVtb3ZlQXR0cmlidXRlRnJvbUVsZW1lbnQiLCJwZG9tT3B0aW9ucyIsInBkb21BdHRyaWJ1dGVzIiwiZGF0YU9iamVjdCIsImF0dHJpYnV0ZSIsImFyaWFMYWJlbCIsImFyaWFSb2xlIiwicGRvbUNsYXNzZXMiLCJzZXRDbGFzc1RvRWxlbWVudCIsImNsYXNzTmFtZSIsImlucHV0VmFsdWUiLCJ1bmRlZmluZWQiLCJ2YWx1ZVN0cmluZyIsInR5cGUiLCJnZXRFbGVtZW50QnlOYW1lIiwiRXJyb3IiLCJhdHRyaWJ1dGVWYWx1ZSIsImVsZW1lbnQiLCJyYXdBdHRyaWJ1dGVWYWx1ZSIsInVud3JhcFByb3BlcnR5IiwiYXR0cmlidXRlVmFsdWVXaXRob3V0TWFya3MiLCJpbnRlcmFjdGl2ZSIsInNldEF0dHJpYnV0ZU5TIiwic2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlTlMiLCJyZW1vdmVBdHRyaWJ1dGUiLCJyZW1vdmVDbGFzc0Zyb21FbGVtZW50IiwicmVtb3ZlIiwiQVNTT0NJQVRJT05fQVRUUklCVVRFUyIsIm90aGVyTm9kZVBET01JbnN0YW5jZXMiLCJnZXRQRE9NSW5zdGFuY2VzIiwiZmlyc3RQRE9NSW5zdGFuY2UiLCJwZWVyIiwib3RoZXJQZWVyRWxlbWVudCIsIm90aGVyRWxlbWVudE5hbWUiLCJ0aGlzRWxlbWVudE5hbWUiLCJwcmV2aW91c0F0dHJpYnV0ZVZhbHVlIiwiZ2V0QXR0cmlidXRlIiwibmV3QXR0cmlidXRlVmFsdWUiLCJ0cmltIiwiam9pbiIsImNvbnRlbnRFbGVtZW50IiwiYXBwZW5kRWxlbWVudCIsImFwcGVuZENoaWxkIiwiaW5kZXhPZlByaW1hcnlTaWJsaW5nIiwiaW5zZXJ0SW5kZXgiLCJzcGxpY2UiLCJpc1Zpc2libGUiLCJ2aXNpYmxlRWxlbWVudHMiLCJoaWRkZW4iLCJoYXNBdHRyaWJ1dGUiLCJzZXRWaXNpYmxlIiwic2FmYXJpIiwiaXNGb2N1c2VkIiwidmlzdWFsRm9jdXNUcmFpbCIsImd1ZXNzVmlzdWFsVHJhaWwiLCJyb290Tm9kZSIsInBkb21Gb2N1c1Byb3BlcnR5IiwiZXF1YWxzIiwiZm9jdXMiLCJ3aW5kb3dIYXNGb2N1c1Byb3BlcnR5IiwiYmx1ciIsInBlZXJIYWRGb2N1cyIsIm92ZXJyaWRlRm9jdXNXaXRoVGFiSW5kZXgiLCJjb250ZW50Iiwic2V0VGV4dENvbnRlbnQiLCJ0YWdOYW1lU3VwcG9ydHNDb250ZW50Iiwic2V0UERPTVRyYW5zZm9ybVNvdXJjZU5vZGUiLCJyZW1vdmVMaXN0ZW5lciIsInVwZGF0ZVRyYW5zZm9ybVRyYWNrZXIiLCJnZXRFbGVtZW50SWQiLCJzaWJsaW5nTmFtZSIsInN0cmluZ0lkIiwiaW5kaWNlcyIsImdldFBET01JbnN0YW5jZVVuaXF1ZUlkIiwiREFUQV9QRE9NX1VOSVFVRV9JRCIsInN0eWxlIiwidHJhbnNmb3JtIiwicGFyZW50IiwicG9zaXRpb25FbGVtZW50cyIsInRyYW5zZm9ybVNvdXJjZU5vZGUiLCJwZG9tVHJhbnNmb3JtU291cmNlTm9kZSIsInNldCIsImxvY2FsQm91bmRzIiwiaXNGaW5pdGUiLCJnZXRNYXRyaXgiLCJkaXNwbGF5Qm91bmRzIiwiYm91bmRzIiwiaW50ZXJzZWN0c0JvdW5kcyIsImNvbnN0cmFpbkJvdW5kcyIsImNsaWVudERpbWVuc2lvbnMiLCJnZXRDbGllbnREaW1lbnNpb25zIiwiY2xpZW50V2lkdGgiLCJ3aWR0aCIsImNsaWVudEhlaWdodCIsImhlaWdodCIsInNldE1pbk1heCIsImdldENTU01hdHJpeCIsInNldENsaWVudEJvdW5kcyIsIk9GRlNDUkVFTl9TSUJMSU5HX0JPVU5EUyIsIm9mZnNldEhlaWdodCIsInVwZGF0ZVN1YnRyZWVQb3NpdGlvbmluZyIsInBhcmVudFBvc2l0aW9uSW5QRE9NIiwiY2hpbGRQZWVyIiwicmVjdXJzaXZlRGlzYWJsZSIsImRpc2FibGVkIiwiZGlzcG9zZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJibHVyRXZlbnRMaXN0ZW5lciIsImZvY3VzRXZlbnRMaXN0ZW5lciIsImZyZWVUb1Bvb2wiLCJjb25zdHJ1Y3RvciIsInJlZ2lzdGVyIiwibWl4SW50byIsImluaXRpYWxpemUiLCJwcm90b3R5cGUiLCJuZXdFbGVtZW50IiwiREFUQV9FWENMVURFX0ZST01fSU5QVVQiLCJub2RlR2xvYmFsQm91bmRzIiwic2V0VG9UcmFuc2xhdGlvbiIsIm1pblgiLCJtaW5ZIiwic2V0VG9TY2FsZSIsIm11bHRpcGx5TWF0cml4Iiwic2libGluZ0VsZW1lbnQiLCJjbGllbnRSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG9wIiwibGVmdCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsV0FBVyxvQ0FBb0M7QUFDdEQsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsT0FBT0MseUJBQXlCLGtEQUFrRDtBQUNsRixTQUFTQyxZQUFZLEVBQUVDLFlBQVksRUFB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