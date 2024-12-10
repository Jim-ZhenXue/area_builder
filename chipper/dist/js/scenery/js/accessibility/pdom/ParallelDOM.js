// Copyright 2021-2024, University of Colorado Boulder
/**
 * A superclass for Node, adding accessibility by defining content for the Parallel DOM. Please note that Node and
 * ParallelDOM are closely intertwined, though they are separated into separate files in the type hierarchy.
 *
 * The Parallel DOM is an HTML structure that provides semantics for assistive technologies. For web content to be
 * accessible, assistive technologies require HTML markup, which is something that pure graphical content does not
 * include. This adds the accessible HTML content for any Node in the scene graph.
 *
 * Any Node can have pdom content, but they have to opt into it. The structure of the pdom content will
 * match the structure of the scene graph.
 *
 * Say we have the following scene graph:
 *
 *   A
 *  / \
 * B   C
 *    / \
 *   D   E
 *        \
 *         F
 *
 * And say that nodes A, B, C, D, and F specify pdom content for the DOM.  Scenery will render the pdom
 * content like so:
 *
 * <div id="node-A">
 *   <div id="node-B"></div>
 *   <div id="node-C">
 *     <div id="node-D"></div>
 *     <div id="node-F"></div>
 *   </div>
 * </div>
 *
 * In this example, each element is represented by a div, but any HTML element could be used. Note that in this example,
 * node E did not specify pdom content, so node F was added as a child under node C.  If node E had specified
 * pdom content, content for node F would have been added as a child under the content for node E.
 *
 * --------------------------------------------------------------------------------------------------------------------
 * #BASIC EXAMPLE
 *
 * In a basic example let's say that we want to make a Node an unordered list. To do this, add the `tagName` option to
 * the Node, and assign it to the string "ul". Here is what the code could look like:
 *
 * var myUnorderedList = new Node( { tagName: 'ul' } );
 *
 * To get the desired list html, we can assign the `li` `tagName` to children Nodes, like:
 *
 * var listItem1 = new Node( { tagName: 'li' } );
 * myUnorderedList.addChild( listItem1 );
 *
 * Now we have a single list element in the unordered list. To assign content to this <li>, use the `innerContent`
 * option (all of these Node options have getters and setters, just like any other Node option):
 *
 * listItem1.innerContent = 'I am list item number 1';
 *
 * The above operations will create the following PDOM structure (note that actual ids will be different):
 *
 * <ul id='myUnorderedList'>
 *   <li>I am a list item number 1</li>
 * </ul
 *
 * --------------------------------------------------------------------------------------------------------------------
 * #DOM SIBLINGS
 *
 * The API in this class allows you to add additional structure to the accessible DOM content if necessary. Each node
 * can have multiple DOM Elements associated with it. A Node can have a label DOM element, and a description DOM element.
 * These are called siblings. The Node's direct DOM element (the DOM element you create with the `tagName` option)
 * is called the "primary sibling." You can also have a container parent DOM element that surrounds all of these
 * siblings. With three siblings and a container parent, each Node can have up to 4 DOM Elements representing it in the
 * PDOM. Here is an example of how a Node may use these features:
 *
 * <div>
 *   <label for="myInput">This great label for input</label
 *   <input id="myInput"/>
 *   <p>This is a description for the input</p>
 * </div>
 *
 * Although you can create this structure with four nodes (`input` A, `label B, and `p` C children to `div` D),
 * this structure can be created with one single Node. It is often preferable to do this to limit the number of new
 * Nodes that have to be created just for accessibility purposes. To accomplish this we have the following Node code.
 *
 * new Node( {
 *  tagName: 'input'
 *  labelTagName: 'label',
 *  labelContent: 'This great label for input'
 *  descriptionTagName: 'p',
 *  descriptionContent: 'This is a description for the input',
 *  containerTagName: 'div'
 * });
 *
 * A few notes:
 * 1. Only the primary sibling (specified by tagName) is focusable. Using a focusable element through another element
 *    (like labelTagName) will result in buggy behavior.
 * 2. Notice the names of the content setters for siblings parallel the `innerContent` option for setting the primary
 *    sibling.
 * 3. To make this example actually work, you would need the `inputType` option to set the "type" attribute on the `input`.
 * 4. When you specify the  <label> tag for the label sibling, the "for" attribute is automatically added to the sibling.
 * 5. Finally, the example above doesn't utilize the default tags that we have in place for the parent and siblings.
 *      default labelTagName: 'p'
 *      default descriptionTagName: 'p'
 *      default containerTagName: 'div'
 *    so the following will yield the same PDOM structure:
 *
 *    new Node( {
 *     tagName: 'input',
 *     labelTagName: 'label',
 *     labelContent: 'This great label for input'
 *     descriptionContent: 'This is a description for the input',
 *    });
 *
 * The ParallelDOM class is smart enough to know when there needs to be a container parent to wrap multiple siblings,
 * it is not necessary to use that option unless the desired tag name is  something other than 'div'.
 *
 * --------------------------------------------------------------------------------------------------------------------
 * #Input listeners
 * ParallelDOM is the primary way we listen to keyboard events in scenery. See TInputListener for supported keyboard
 * events that you can add. Note that the input events from the DOM that your ParallelDOM instance will receive is
 * dependent on what the DOM Element is (see tagName).
 *
 * NOTE: Be VERY careful about mutating ParallelDOM content in input listeners, this can result in events being dropped.
 * For example, if you press enter on a 'button', you would expect a keydown event followed by a click event, but if the
 * keydown listener changes the tagName to 'div', the click event will not occur.
 * --------------------------------------------------------------------------------------------------------------------
 *
 * For additional accessibility options, please see the options listed in ACCESSIBILITY_OPTION_KEYS. To understand the
 * PDOM more, see PDOMPeer, which manages the DOM Elements for a Node. For more documentation on Scenery, Nodes,
 * and the scene graph, please see http://phetsims.github.io/scenery/
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import TinyForwardingProperty from '../../../../axon/js/TinyForwardingProperty.js';
import { isTReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import validate from '../../../../axon/js/validate.js';
import Validation from '../../../../axon/js/Validation.js';
import arrayDifference from '../../../../phet-core/js/arrayDifference.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import optionize from '../../../../phet-core/js/optionize.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { Node, PDOMDisplaysInfo, PDOMPeer, PDOMTree, PDOMUtils, scenery, Trail } from '../../imports.js';
const INPUT_TAG = PDOMUtils.TAGS.INPUT;
const P_TAG = PDOMUtils.TAGS.P;
const DIV_TAG = PDOMUtils.TAGS.DIV;
// default tag names for siblings
const DEFAULT_TAG_NAME = DIV_TAG;
const DEFAULT_DESCRIPTION_TAG_NAME = P_TAG;
const DEFAULT_LABEL_TAG_NAME = P_TAG;
// see setPDOMHeadingBehavior for more details
const DEFAULT_PDOM_HEADING_BEHAVIOR = (node, options, heading)=>{
    options.labelTagName = `h${node.headingLevel}`; // TODO: make sure heading level change fires a full peer rebuild, see https://github.com/phetsims/scenery/issues/867
    options.labelContent = heading;
    return options;
};
const unwrapProperty = (valueOrProperty)=>{
    const result = valueOrProperty === null ? null : typeof valueOrProperty === 'string' ? valueOrProperty : valueOrProperty.value;
    assert && assert(result === null || typeof result === 'string');
    return result;
};
// these elements are typically associated with forms, and support certain attributes
const FORM_ELEMENTS = PDOMUtils.FORM_ELEMENTS;
// list of input "type" attribute values that support the "checked" attribute
const INPUT_TYPES_THAT_SUPPORT_CHECKED = PDOMUtils.INPUT_TYPES_THAT_SUPPORT_CHECKED;
// HTMLElement attributes whose value is an ID of another element
const ASSOCIATION_ATTRIBUTES = PDOMUtils.ASSOCIATION_ATTRIBUTES;
// The options for the ParallelDOM API. In general, most default to null; to clear, set back to null. Each one of
// these has an associated setter, see setter functions for more information about each.
const ACCESSIBILITY_OPTION_KEYS = [
    // Order matters. Having focus before tagName covers the case where you change the tagName and focusability of a
    // currently focused Node. We want the focusability to update correctly.
    'focusable',
    'tagName',
    /*
   * Higher Level API Functions
   */ 'accessibleName',
    'accessibleNameBehavior',
    'helpText',
    'helpTextBehavior',
    'pdomHeading',
    'pdomHeadingBehavior',
    /*
   * Lower Level API Functions
   */ 'containerTagName',
    'containerAriaRole',
    'innerContent',
    'inputType',
    'inputValue',
    'pdomChecked',
    'pdomNamespace',
    'ariaLabel',
    'ariaRole',
    'ariaValueText',
    'labelTagName',
    'labelContent',
    'appendLabel',
    'descriptionTagName',
    'descriptionContent',
    'appendDescription',
    'focusHighlight',
    'focusHighlightLayerable',
    'groupFocusHighlight',
    'pdomVisibleProperty',
    'pdomVisible',
    'pdomOrder',
    'ariaLabelledbyAssociations',
    'ariaDescribedbyAssociations',
    'activeDescendantAssociations',
    'focusPanTargetBoundsProperty',
    'limitPanDirection',
    'positionInPDOM',
    'pdomTransformSourceNode'
];
let ParallelDOM = class ParallelDOM extends PhetioObject {
    /***********************************************************************************************************/ // PUBLIC METHODS
    /***********************************************************************************************************/ /**
   * Dispose accessibility by removing all listeners on this Node for accessible input. ParallelDOM is disposed
   * by calling Node.dispose(), so this function is scenery-internal.
   * (scenery-internal)
   */ disposeParallelDOM() {
        if (isTReadOnlyProperty(this._accessibleName) && !this._accessibleName.isDisposed) {
            this._accessibleName.unlink(this._onPDOMContentChangeListener);
            this._accessibleName = null;
        }
        if (isTReadOnlyProperty(this._helpText) && !this._helpText.isDisposed) {
            this._helpText.unlink(this._onPDOMContentChangeListener);
            this._helpText = null;
        }
        if (isTReadOnlyProperty(this._pdomHeading) && !this._pdomHeading.isDisposed) {
            this._pdomHeading.unlink(this._onPDOMContentChangeListener);
            this._pdomHeading = null;
        }
        if (isTReadOnlyProperty(this._inputValue) && !this._inputValue.isDisposed) {
            this._inputValue.unlink(this._onPDOMContentChangeListener);
            this._inputValue = null;
        }
        if (isTReadOnlyProperty(this._ariaLabel) && !this._ariaLabel.isDisposed) {
            this._ariaLabel.unlink(this._onAriaLabelChangeListener);
        }
        if (isTReadOnlyProperty(this._ariaValueText) && !this._ariaValueText.isDisposed) {
            this._ariaValueText.unlink(this._onAriaValueTextChangeListener);
        }
        if (isTReadOnlyProperty(this._innerContent) && !this._innerContent.isDisposed) {
            this._innerContent.unlink(this._onInnerContentChangeListener);
        }
        if (isTReadOnlyProperty(this._labelContent) && !this._labelContent.isDisposed) {
            this._labelContent.unlink(this._onLabelContentChangeListener);
        }
        if (isTReadOnlyProperty(this._descriptionContent) && !this._descriptionContent.isDisposed) {
            this._descriptionContent.unlink(this._onDescriptionContentChangeListener);
        }
        this.inputEnabledProperty.unlink(this.pdomBoundInputEnabledListener);
        // To prevent memory leaks, we want to clear our order (since otherwise Nodes in our order will reference
        // this Node).
        this.pdomOrder = null;
        // If this Node is in any PDOM order, we need to remove it from the order of the other Node so there is
        // no reference to this Node.
        if (this._pdomParent) {
            assert && assert(this._pdomParent._pdomOrder, 'pdomParent should have a pdomOrder');
            const updatedOrder = this._pdomParent._pdomOrder.slice();
            arrayRemove(updatedOrder, this);
            this._pdomParent.pdomOrder = updatedOrder;
        }
        // clear references to the pdomTransformSourceNode
        this.setPDOMTransformSourceNode(null);
        // Clear behavior functions because they may create references between other Nodes
        this._accessibleNameBehavior = ParallelDOM.BASIC_ACCESSIBLE_NAME_BEHAVIOR;
        this._helpTextBehavior = ParallelDOM.HELP_TEXT_AFTER_CONTENT;
        this._pdomHeadingBehavior = DEFAULT_PDOM_HEADING_BEHAVIOR;
        // Clear out aria association attributes, which hold references to other Nodes.
        this.setAriaLabelledbyAssociations([]);
        this.setAriaDescribedbyAssociations([]);
        this.setActiveDescendantAssociations([]);
        // PDOM attributes can potentially have listeners, so we will clear those out.
        this.removePDOMAttributes();
        this._pdomVisibleProperty.dispose();
    }
    pdomInputEnabledListener(enabled) {
        // Mark this Node as disabled in the ParallelDOM
        this.setPDOMAttribute('aria-disabled', !enabled);
        // By returning false, we prevent the component from toggling native HTML element attributes that convey state.
        // For example,this will prevent a checkbox from changing `checked` property while it is disabled. This way
        // we can keep the component in traversal order and don't need to add the `disabled` attribute. See
        // https://github.com/phetsims/sun/issues/519 and https://github.com/phetsims/sun/issues/640
        // This solution was found at https://stackoverflow.com/a/12267350/3408502
        this.setPDOMAttribute('onclick', enabled ? '' : 'return false');
    }
    /**
   * Get whether this Node's primary DOM element currently has focus.
   */ isFocused() {
        for(let i = 0; i < this._pdomInstances.length; i++){
            const peer = this._pdomInstances[i].peer;
            if (peer.isFocused()) {
                return true;
            }
        }
        return false;
    }
    get focused() {
        return this.isFocused();
    }
    /**
   * Focus this Node's primary dom element. The element must not be hidden, and it must be focusable. If the Node
   * has more than one instance, this will fail because the DOM element is not uniquely defined. If accessibility
   * is not enabled, this will be a no op. When ParallelDOM is more widely used, the no op can be replaced
   * with an assertion that checks for pdom content.
   */ focus() {
        // if a sim is running without accessibility enabled, there will be no accessible instances, but focus() might
        // still be called without accessibility enabled
        if (this._pdomInstances.length > 0) {
            // when accessibility is widely used, this assertion can be added back in
            // assert && assert( this._pdomInstances.length > 0, 'there must be pdom content for the Node to receive focus' );
            assert && assert(this.focusable, 'trying to set focus on a Node that is not focusable');
            assert && assert(this.pdomVisible, 'trying to set focus on a Node with invisible pdom content');
            assert && assert(this._pdomInstances.length === 1, 'focus() unsupported for Nodes using DAG, pdom content is not unique');
            const peer = this._pdomInstances[0].peer;
            assert && assert(peer, 'must have a peer to focus');
            peer.focus();
        }
    }
    /**
   * Remove focus from this Node's primary DOM element.  The focus highlight will disappear, and the element will not receive
   * keyboard events when it doesn't have focus.
   */ blur() {
        if (this._pdomInstances.length > 0) {
            assert && assert(this._pdomInstances.length === 1, 'blur() unsupported for Nodes using DAG, pdom content is not unique');
            const peer = this._pdomInstances[0].peer;
            assert && assert(peer, 'must have a peer to blur');
            peer.blur();
        }
    }
    /**
   * Called when assertions are enabled and once the Node has been completely constructed. This is the time to
   * make sure that options are set up the way they are expected to be. For example. you don't want accessibleName
   * and labelContent declared.
   * (only called by Screen.js)
   */ pdomAudit() {
        if (this.hasPDOMContent && assert) {
            this._inputType && assert(this._tagName.toUpperCase() === INPUT_TAG, 'tagName must be INPUT to support inputType');
            this._pdomChecked && assert(this._tagName.toUpperCase() === INPUT_TAG, 'tagName must be INPUT to support pdomChecked.');
            this._inputValue && assert(this._tagName.toUpperCase() === INPUT_TAG, 'tagName must be INPUT to support inputValue');
            this._pdomChecked && assert(INPUT_TYPES_THAT_SUPPORT_CHECKED.includes(this._inputType.toUpperCase()), `inputType does not support checked attribute: ${this._inputType}`);
            this._focusHighlightLayerable && assert(this.focusHighlight instanceof Node, 'focusHighlight must be Node if highlight is layerable');
            this._tagName.toUpperCase() === INPUT_TAG && assert(typeof this._inputType === 'string', ' inputType expected for input');
            // note that most things that are not focusable by default need innerContent to be focusable on VoiceOver,
            // but this will catch most cases since often things that get added to the focus order have the application
            // role for custom input. Note that accessibleName will not be checked that it specifically changes innerContent, it is up to the dev to do this.
            this.ariaRole === 'application' && assert(this.innerContent || this.accessibleName, 'must have some innerContent or element will never be focusable in VoiceOver');
        }
        for(let i = 0; i < this.children.length; i++){
            this.children[i].pdomAudit();
        }
    }
    /***********************************************************************************************************/ // HIGHER LEVEL API: GETTERS AND SETTERS FOR PDOM API OPTIONS
    //
    // These functions utilize the lower level API to achieve a consistence, and convenient API for adding
    // pdom content to the PDOM. See https://github.com/phetsims/scenery/issues/795
    /***********************************************************************************************************/ /**
   * Sets the accessible name that describes this Node. The accessible name is the semantic title for the Node. It is
   * the content that will be read by a screen reader when the Node is discovered by the virtual cursor.
   *
   * For more information about accessible names in web accessibility see
   * https://developer.paciellogroup.com/blog/2017/04/what-is-an-accessible-name/.
   *
   * Part of the higher level API, the accessibleNameBehavior function will set the appropriate options on this Node
   * to create the desired accessible name. See the documentation for setAccessibleNameBehavior() for more information.
   */ setAccessibleName(accessibleName) {
        if (accessibleName !== this._accessibleName) {
            if (isTReadOnlyProperty(this._accessibleName) && !this._accessibleName.isDisposed) {
                this._accessibleName.unlink(this._onPDOMContentChangeListener);
            }
            this._accessibleName = accessibleName;
            if (isTReadOnlyProperty(accessibleName)) {
                accessibleName.lazyLink(this._onPDOMContentChangeListener);
            }
            this.onPDOMContentChange();
        }
    }
    set accessibleName(accessibleName) {
        this.setAccessibleName(accessibleName);
    }
    get accessibleName() {
        return this.getAccessibleName();
    }
    /**
   * Get the accessible name that describes this Node.
   */ getAccessibleName() {
        if (isTReadOnlyProperty(this._accessibleName)) {
            return this._accessibleName.value;
        } else {
            return this._accessibleName;
        }
    }
    /**
   * Remove this Node from the PDOM by clearing its pdom content. This can be useful when creating icons from
   * pdom content.
   */ removeFromPDOM() {
        assert && assert(this._tagName !== null, 'There is no pdom content to clear from the PDOM');
        this.tagName = null;
    }
    /**
   * accessibleNameBehavior is a function that will set the appropriate options on this Node to get the desired
   * accessible name.
   *
   * The default value does the best it can to create an accessible name for a variety of different ParallelDOM
   * options and tag names. If a Node uses more complicated markup, you can provide your own function to
   * meet your requirements. If you do this, it is up to you to make sure that the Accessible Name is properly
   * being set and conveyed to AT, as it is very hard to validate this function.
   */ setAccessibleNameBehavior(accessibleNameBehavior) {
        if (this._accessibleNameBehavior !== accessibleNameBehavior) {
            this._accessibleNameBehavior = accessibleNameBehavior;
            this.onPDOMContentChange();
        }
    }
    set accessibleNameBehavior(accessibleNameBehavior) {
        this.setAccessibleNameBehavior(accessibleNameBehavior);
    }
    get accessibleNameBehavior() {
        return this.getAccessibleNameBehavior();
    }
    /**
   * Get the help text of the interactive element.
   */ getAccessibleNameBehavior() {
        return this._accessibleNameBehavior;
    }
    /**
   * Set the Node heading content. This by default will be a heading tag whose level is dependent on how many parents
   * Nodes are heading Nodes. See computeHeadingLevel() for more info
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */ setPDOMHeading(pdomHeading) {
        if (pdomHeading !== this._pdomHeading) {
            if (isTReadOnlyProperty(this._pdomHeading) && !this._pdomHeading.isDisposed) {
                this._pdomHeading.unlink(this._onPDOMContentChangeListener);
            }
            this._pdomHeading = pdomHeading;
            if (isTReadOnlyProperty(pdomHeading)) {
                pdomHeading.lazyLink(this._onPDOMContentChangeListener);
            }
            this.onPDOMContentChange();
        }
    }
    set pdomHeading(pdomHeading) {
        this.setPDOMHeading(pdomHeading);
    }
    get pdomHeading() {
        return this.getPDOMHeading();
    }
    /**
   * Get the value of this Node's heading. Use null to clear the heading
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */ getPDOMHeading() {
        if (isTReadOnlyProperty(this._pdomHeading)) {
            return this._pdomHeading.value;
        } else {
            return this._pdomHeading;
        }
    }
    /**
   * Set the behavior of how `this.pdomHeading` is set in the PDOM. See default behavior function for more
   * information.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */ setPDOMHeadingBehavior(pdomHeadingBehavior) {
        if (this._pdomHeadingBehavior !== pdomHeadingBehavior) {
            this._pdomHeadingBehavior = pdomHeadingBehavior;
            this.onPDOMContentChange();
        }
    }
    set pdomHeadingBehavior(pdomHeadingBehavior) {
        this.setPDOMHeadingBehavior(pdomHeadingBehavior);
    }
    get pdomHeadingBehavior() {
        return this.getPDOMHeadingBehavior();
    }
    /**
   * Get the help text of the interactive element.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */ getPDOMHeadingBehavior() {
        return this._pdomHeadingBehavior;
    }
    /**
   * Get the tag name of the DOM element representing this Node for accessibility.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */ getHeadingLevel() {
        return this._headingLevel;
    }
    get headingLevel() {
        return this.getHeadingLevel();
    }
    /**
   // TODO: what if ancestor changes, see https://github.com/phetsims/scenery/issues/855
   * Sets this Node's heading level, by recursing up the accessibility tree to find headings this Node
   * is nested under.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */ computeHeadingLevel() {
        // TODO: assert??? assert( this.headingLevel || this._pdomParent); see https://github.com/phetsims/scenery/issues/855
        // Either ^ which may break during construction, or V (below)
        //  base case to heading level 1
        if (!this._pdomParent) {
            if (this.pdomHeading) {
                this._headingLevel = 1;
                return 1;
            }
            return 0; // so that the first Node with a heading is headingLevel 1
        }
        if (this.pdomHeading) {
            const level = this._pdomParent.computeHeadingLevel() + 1;
            this._headingLevel = level;
            return level;
        } else {
            return this._pdomParent.computeHeadingLevel();
        }
    }
    /**
   * Sets the help text for this Node. Help text usually provides additional information that describes what a Node
   * is or how to interact with it. It will be read by a screen reader when discovered by the virtual cursor.
   *
   * Part of the higher level API, the helpTextBehavior function will set the appropriate options on this Node
   * to create the desired help text. See the documentation for setHelpTextBehavior() for more information.
   */ setHelpText(helpText) {
        if (helpText !== this._helpText) {
            if (isTReadOnlyProperty(this._helpText) && !this._helpText.isDisposed) {
                this._helpText.unlink(this._onPDOMContentChangeListener);
            }
            this._helpText = helpText;
            if (isTReadOnlyProperty(helpText)) {
                helpText.lazyLink(this._onPDOMContentChangeListener);
            }
            this.onPDOMContentChange();
        }
    }
    set helpText(helpText) {
        this.setHelpText(helpText);
    }
    get helpText() {
        return this.getHelpText();
    }
    /**
   * Get the help text for this Node.
   */ getHelpText() {
        if (isTReadOnlyProperty(this._helpText)) {
            return this._helpText.value;
        } else {
            return this._helpText;
        }
    }
    /**
   * helpTextBehavior is a function that will set the appropriate options on this Node to get the desired help text.
   *
   * The default value does the best it can to create the help text based on the values for other ParallelDOM options.
   * Usually, this is a paragraph element that comes after the Node's primary sibling in the PDOM. If you need to
   * customize this behavior, you can provide your own function to meet your requirements. If you provide your own
   * function, it is up to you to make sure that the help text is properly being set and is discoverable by AT.
   */ setHelpTextBehavior(helpTextBehavior) {
        if (this._helpTextBehavior !== helpTextBehavior) {
            this._helpTextBehavior = helpTextBehavior;
            this.onPDOMContentChange();
        }
    }
    set helpTextBehavior(helpTextBehavior) {
        this.setHelpTextBehavior(helpTextBehavior);
    }
    get helpTextBehavior() {
        return this.getHelpTextBehavior();
    }
    /**
   * Get the help text of the interactive element.
   */ getHelpTextBehavior() {
        return this._helpTextBehavior;
    }
    /***********************************************************************************************************/ // LOWER LEVEL GETTERS AND SETTERS FOR PDOM API OPTIONS
    /***********************************************************************************************************/ /**
   * Set the tag name for the primary sibling in the PDOM. DOM element tag names are read-only, so this
   * function will create a new DOM element each time it is called for the Node's PDOMPeer and
   * reset the pdom content.
   *
   * This is the "entry point" for Parallel DOM content. When a Node has a tagName it will appear in the Parallel DOM
   * and other attributes can be set. Without it, nothing will appear in the Parallel DOM.
   */ setTagName(tagName) {
        assert && assert(tagName === null || typeof tagName === 'string');
        if (tagName !== this._tagName) {
            this._tagName = tagName;
            // TODO: this could be setting PDOM content twice https://github.com/phetsims/scenery/issues/1581
            this.onPDOMContentChange();
        }
    }
    set tagName(tagName) {
        this.setTagName(tagName);
    }
    get tagName() {
        return this.getTagName();
    }
    /**
   * Get the tag name of the DOM element representing this Node for accessibility.
   */ getTagName() {
        return this._tagName;
    }
    /**
   * Set the tag name for the accessible label sibling for this Node. DOM element tag names are read-only,
   * so this will require creating a new PDOMPeer for this Node (reconstructing all DOM Elements). If
   * labelContent is specified without calling this method, then the DEFAULT_LABEL_TAG_NAME will be used as the
   * tag name for the label sibling. Use null to clear the label sibling element from the PDOM.
   */ setLabelTagName(tagName) {
        assert && assert(tagName === null || typeof tagName === 'string');
        if (tagName !== this._labelTagName) {
            this._labelTagName = tagName;
            this.onPDOMContentChange();
        }
    }
    set labelTagName(tagName) {
        this.setLabelTagName(tagName);
    }
    get labelTagName() {
        return this.getLabelTagName();
    }
    /**
   * Get the label sibling HTML tag name.
   */ getLabelTagName() {
        return this._labelTagName;
    }
    /**
   * Set the tag name for the description sibling. HTML element tag names are read-only, so this will require creating
   * a new HTML element, and inserting it into the DOM. The tag name provided must support
   * innerHTML and textContent. If descriptionContent is specified without this option,
   * then descriptionTagName will be set to DEFAULT_DESCRIPTION_TAG_NAME.
   *
   * Passing 'null' will clear away the description sibling.
   */ setDescriptionTagName(tagName) {
        assert && assert(tagName === null || typeof tagName === 'string');
        if (tagName !== this._descriptionTagName) {
            this._descriptionTagName = tagName;
            this.onPDOMContentChange();
        }
    }
    set descriptionTagName(tagName) {
        this.setDescriptionTagName(tagName);
    }
    get descriptionTagName() {
        return this.getDescriptionTagName();
    }
    /**
   * Get the HTML tag name for the description sibling.
   */ getDescriptionTagName() {
        return this._descriptionTagName;
    }
    /**
   * Sets the type for an input element.  Element must have the INPUT tag name. The input attribute is not
   * specified as readonly, so invalidating pdom content is not necessary.
   */ setInputType(inputType) {
        assert && assert(inputType === null || typeof inputType === 'string');
        assert && this.tagName && assert(this._tagName.toUpperCase() === INPUT_TAG, 'tag name must be INPUT to support inputType');
        if (inputType !== this._inputType) {
            this._inputType = inputType;
            for(let i = 0; i < this._pdomInstances.length; i++){
                const peer = this._pdomInstances[i].peer;
                // remove the attribute if cleared by setting to 'null'
                if (inputType === null) {
                    peer.removeAttributeFromElement('type');
                } else {
                    peer.setAttributeToElement('type', inputType);
                }
            }
        }
    }
    set inputType(inputType) {
        this.setInputType(inputType);
    }
    get inputType() {
        return this.getInputType();
    }
    /**
   * Get the input type. Input type is only relevant if this Node's primary sibling has tag name "INPUT".
   */ getInputType() {
        return this._inputType;
    }
    /**
   * By default the label will be prepended before the primary sibling in the PDOM. This
   * option allows you to instead have the label added after the primary sibling. Note: The label will always
   * be in front of the description sibling. If this flag is set with `appendDescription`, the order will be
   *
   * <container>
   *   <primary sibling/>
   *   <label sibling/>
   *   <description sibling/>
   * </container>
   */ setAppendLabel(appendLabel) {
        if (this._appendLabel !== appendLabel) {
            this._appendLabel = appendLabel;
            this.onPDOMContentChange();
        }
    }
    set appendLabel(appendLabel) {
        this.setAppendLabel(appendLabel);
    }
    get appendLabel() {
        return this.getAppendLabel();
    }
    /**
   * Get whether the label sibling should be appended after the primary sibling.
   */ getAppendLabel() {
        return this._appendLabel;
    }
    /**
   * By default the label will be prepended before the primary sibling in the PDOM. This
   * option allows you to instead have the label added after the primary sibling. Note: The label will always
   * be in front of the description sibling. If this flag is set with `appendLabel`, the order will be
   *
   * <container>
   *   <primary sibling/>
   *   <label sibling/>
   *   <description sibling/>
   * </container>
   */ setAppendDescription(appendDescription) {
        if (this._appendDescription !== appendDescription) {
            this._appendDescription = appendDescription;
            this.onPDOMContentChange();
        }
    }
    set appendDescription(appendDescription) {
        this.setAppendDescription(appendDescription);
    }
    get appendDescription() {
        return this.getAppendDescription();
    }
    /**
   * Get whether the description sibling should be appended after the primary sibling.
   */ getAppendDescription() {
        return this._appendDescription;
    }
    /**
   * Set the container parent tag name. By specifying this container parent, an element will be created that
   * acts as a container for this Node's primary sibling DOM Element and its label and description siblings.
   * This containerTagName will default to DEFAULT_LABEL_TAG_NAME, and be added to the PDOM automatically if
   * more than just the primary sibling is created.
   *
   * For instance, a button element with a label and description will be contained like the following
   * if the containerTagName is specified as 'section'.
   *
   * <section id='parent-container-trail-id'>
   *   <button>Press me!</button>
   *   <p>Button label</p>
   *   <p>Button description</p>
   * </section>
   */ setContainerTagName(tagName) {
        assert && assert(tagName === null || typeof tagName === 'string', `invalid tagName argument: ${tagName}`);
        if (this._containerTagName !== tagName) {
            this._containerTagName = tagName;
            this.onPDOMContentChange();
        }
    }
    set containerTagName(tagName) {
        this.setContainerTagName(tagName);
    }
    get containerTagName() {
        return this.getContainerTagName();
    }
    /**
   * Get the tag name for the container parent element.
   */ getContainerTagName() {
        return this._containerTagName;
    }
    invalidatePeerLabelSiblingContent() {
        const labelContent = this.labelContent;
        // if trying to set labelContent, make sure that there is a labelTagName default
        if (labelContent && !this._labelTagName) {
            this.setLabelTagName(DEFAULT_LABEL_TAG_NAME);
        }
        for(let i = 0; i < this._pdomInstances.length; i++){
            const peer = this._pdomInstances[i].peer;
            peer.setLabelSiblingContent(labelContent);
        }
    }
    /**
   * Set the content of the label sibling for the this Node.  The label sibling will default to the value of
   * DEFAULT_LABEL_TAG_NAME if no `labelTagName` is provided. If the label sibling is a `LABEL` html element,
   * then the `for` attribute will automatically be added, pointing to the Node's primary sibling.
   *
   * This method supports adding content in two ways, with HTMLElement.textContent and HTMLElement.innerHTML.
   * The DOM setter is chosen based on if the label passes the `containsFormattingTags`.
   *
   * Passing a null label value will not clear the whole label sibling, just the inner content of the DOM Element.
   */ setLabelContent(labelContent) {
        if (labelContent !== this._labelContent) {
            if (isTReadOnlyProperty(this._labelContent) && !this._labelContent.isDisposed) {
                this._labelContent.unlink(this._onLabelContentChangeListener);
            }
            this._labelContent = labelContent;
            if (isTReadOnlyProperty(labelContent)) {
                labelContent.lazyLink(this._onLabelContentChangeListener);
            }
            this.invalidatePeerLabelSiblingContent();
        }
    }
    set labelContent(label) {
        this.setLabelContent(label);
    }
    get labelContent() {
        return this.getLabelContent();
    }
    /**
   * Get the content for this Node's label sibling DOM element.
   */ getLabelContent() {
        return unwrapProperty(this._labelContent);
    }
    onInnerContentPropertyChange() {
        const value = this.innerContent;
        for(let i = 0; i < this._pdomInstances.length; i++){
            const peer = this._pdomInstances[i].peer;
            peer.setPrimarySiblingContent(value);
        }
    }
    /**
   * Set the inner content for the primary sibling of the PDOMPeers of this Node. Will be set as textContent
   * unless content is html which uses exclusively formatting tags. A Node with inner content cannot
   * have accessible descendants because this content will override the HTML of descendants of this Node.
   */ setInnerContent(innerContent) {
        if (innerContent !== this._innerContent) {
            if (isTReadOnlyProperty(this._innerContent) && !this._innerContent.isDisposed) {
                this._innerContent.unlink(this._onInnerContentChangeListener);
            }
            this._innerContent = innerContent;
            if (isTReadOnlyProperty(innerContent)) {
                innerContent.lazyLink(this._onInnerContentChangeListener);
            }
            this.onInnerContentPropertyChange();
        }
    }
    set innerContent(content) {
        this.setInnerContent(content);
    }
    get innerContent() {
        return this.getInnerContent();
    }
    /**
   * Get the inner content, the string that is the innerHTML or innerText for the Node's primary sibling.
   */ getInnerContent() {
        return unwrapProperty(this._innerContent);
    }
    invalidatePeerDescriptionSiblingContent() {
        const descriptionContent = this.descriptionContent;
        // if there is no description element, assume that a paragraph element should be used
        if (descriptionContent && !this._descriptionTagName) {
            this.setDescriptionTagName(DEFAULT_DESCRIPTION_TAG_NAME);
        }
        for(let i = 0; i < this._pdomInstances.length; i++){
            const peer = this._pdomInstances[i].peer;
            peer.setDescriptionSiblingContent(descriptionContent);
        }
    }
    /**
   * Set the description content for this Node's primary sibling. The description sibling tag name must support
   * innerHTML and textContent. If a description element does not exist yet, a default
   * DEFAULT_LABEL_TAG_NAME will be assigned to the descriptionTagName.
   */ setDescriptionContent(descriptionContent) {
        if (descriptionContent !== this._descriptionContent) {
            if (isTReadOnlyProperty(this._descriptionContent) && !this._descriptionContent.isDisposed) {
                this._descriptionContent.unlink(this._onDescriptionContentChangeListener);
            }
            this._descriptionContent = descriptionContent;
            if (isTReadOnlyProperty(descriptionContent)) {
                descriptionContent.lazyLink(this._onDescriptionContentChangeListener);
            }
            this.invalidatePeerDescriptionSiblingContent();
        }
    }
    set descriptionContent(textContent) {
        this.setDescriptionContent(textContent);
    }
    get descriptionContent() {
        return this.getDescriptionContent();
    }
    /**
   * Get the content for this Node's description sibling DOM Element.
   */ getDescriptionContent() {
        return unwrapProperty(this._descriptionContent);
    }
    /**
   * Set the ARIA role for this Node's primary sibling. According to the W3C, the ARIA role is read-only for a DOM
   * element.  So this will create a new DOM element for this Node with the desired role, and replace the old
   * element in the DOM. Note that the aria role can completely change the events that fire from an element,
   * especially when using a screen reader. For example, a role of `application` will largely bypass the default
   * behavior and logic of the screen reader, triggering keydown/keyup events even for buttons that would usually
   * only receive a "click" event.
   *
   * @param ariaRole - role for the element, see
   *                            https://www.w3.org/TR/html-aria/#allowed-aria-roles-states-and-properties
   *                            for a list of roles, states, and properties.
   */ setAriaRole(ariaRole) {
        assert && assert(ariaRole === null || typeof ariaRole === 'string');
        if (this._ariaRole !== ariaRole) {
            this._ariaRole = ariaRole;
            if (ariaRole !== null) {
                this.setPDOMAttribute('role', ariaRole);
            } else {
                this.removePDOMAttribute('role');
            }
        }
    }
    set ariaRole(ariaRole) {
        this.setAriaRole(ariaRole);
    }
    get ariaRole() {
        return this.getAriaRole();
    }
    /**
   * Get the ARIA role representing this Node.
   */ getAriaRole() {
        return this._ariaRole;
    }
    /**
   * Set the ARIA role for this Node's container parent element.  According to the W3C, the ARIA role is read-only
   * for a DOM element. This will create a new DOM element for the container parent with the desired role, and
   * replace it in the DOM.
   *
   * @param ariaRole - role for the element, see
   *                            https://www.w3.org/TR/html-aria/#allowed-aria-roles-states-and-properties
   *                            for a list of roles, states, and properties.
   */ setContainerAriaRole(ariaRole) {
        assert && assert(ariaRole === null || typeof ariaRole === 'string');
        if (this._containerAriaRole !== ariaRole) {
            this._containerAriaRole = ariaRole;
            // clear out the attribute
            if (ariaRole === null) {
                this.removePDOMAttribute('role', {
                    elementName: PDOMPeer.CONTAINER_PARENT
                });
            } else {
                this.setPDOMAttribute('role', ariaRole, {
                    elementName: PDOMPeer.CONTAINER_PARENT
                });
            }
        }
    }
    set containerAriaRole(ariaRole) {
        this.setContainerAriaRole(ariaRole);
    }
    get containerAriaRole() {
        return this.getContainerAriaRole();
    }
    /**
   * Get the ARIA role assigned to the container parent element.
   */ getContainerAriaRole() {
        return this._containerAriaRole;
    }
    onAriaValueTextChange() {
        const ariaValueText = this.ariaValueText;
        if (ariaValueText === null) {
            if (this._hasAppliedAriaLabel) {
                this.removePDOMAttribute('aria-valuetext');
                this._hasAppliedAriaLabel = false;
            }
        } else {
            this.setPDOMAttribute('aria-valuetext', ariaValueText);
            this._hasAppliedAriaLabel = true;
        }
    }
    /**
   * Set the aria-valuetext of this Node independently from the changing value, if necessary. Setting to null will
   * clear this attribute.
   */ setAriaValueText(ariaValueText) {
        if (this._ariaValueText !== ariaValueText) {
            if (isTReadOnlyProperty(this._ariaValueText) && !this._ariaValueText.isDisposed) {
                this._ariaValueText.unlink(this._onAriaValueTextChangeListener);
            }
            this._ariaValueText = ariaValueText;
            if (isTReadOnlyProperty(ariaValueText)) {
                ariaValueText.lazyLink(this._onAriaValueTextChangeListener);
            }
            this.onAriaValueTextChange();
        }
    }
    set ariaValueText(ariaValueText) {
        this.setAriaValueText(ariaValueText);
    }
    get ariaValueText() {
        return this.getAriaValueText();
    }
    /**
   * Get the value of the aria-valuetext attribute for this Node's primary sibling. If null, then the attribute
   * has not been set on the primary sibling.
   */ getAriaValueText() {
        return unwrapProperty(this._ariaValueText);
    }
    /**
   * Sets the namespace for the primary element (relevant for MathML/SVG/etc.)
   *
   * For example, to create a MathML element:
   * { tagName: 'math', pdomNamespace: 'http://www.w3.org/1998/Math/MathML' }
   *
   * or for SVG:
   * { tagName: 'svg', pdomNamespace: 'http://www.w3.org/2000/svg' }
   *
   * @param pdomNamespace - Null indicates no namespace.
   */ setPDOMNamespace(pdomNamespace) {
        assert && assert(pdomNamespace === null || typeof pdomNamespace === 'string');
        if (this._pdomNamespace !== pdomNamespace) {
            this._pdomNamespace = pdomNamespace;
            // If the namespace changes, tear down the view and redraw the whole thing, there is no easy mutable solution here.
            this.onPDOMContentChange();
        }
        return this;
    }
    set pdomNamespace(value) {
        this.setPDOMNamespace(value);
    }
    get pdomNamespace() {
        return this.getPDOMNamespace();
    }
    /**
   * Returns the accessible namespace (see setPDOMNamespace for more information).
   */ getPDOMNamespace() {
        return this._pdomNamespace;
    }
    onAriaLabelChange() {
        const ariaLabel = this.ariaLabel;
        if (ariaLabel === null) {
            if (this._hasAppliedAriaLabel) {
                this.removePDOMAttribute('aria-label');
                this._hasAppliedAriaLabel = false;
            }
        } else {
            this.setPDOMAttribute('aria-label', ariaLabel);
            this._hasAppliedAriaLabel = true;
        }
    }
    /**
   * Sets the 'aria-label' attribute for labelling the Node's primary sibling. By using the
   * 'aria-label' attribute, the label will be read on focus, but can not be found with the
   * virtual cursor. This is one way to set a DOM Element's Accessible Name.
   *
   * @param ariaLabel - the text for the aria label attribute
   */ setAriaLabel(ariaLabel) {
        if (this._ariaLabel !== ariaLabel) {
            if (isTReadOnlyProperty(this._ariaLabel) && !this._ariaLabel.isDisposed) {
                this._ariaLabel.unlink(this._onAriaLabelChangeListener);
            }
            this._ariaLabel = ariaLabel;
            if (isTReadOnlyProperty(ariaLabel)) {
                ariaLabel.lazyLink(this._onAriaLabelChangeListener);
            }
            this.onAriaLabelChange();
        }
    }
    set ariaLabel(ariaLabel) {
        this.setAriaLabel(ariaLabel);
    }
    get ariaLabel() {
        return this.getAriaLabel();
    }
    /**
   * Get the value of the aria-label attribute for this Node's primary sibling.
   */ getAriaLabel() {
        return unwrapProperty(this._ariaLabel);
    }
    /**
   * Set the focus highlight for this Node. By default, the focus highlight will be a pink rectangle that
   * surrounds the Node's local bounds.  If focus highlight is set to 'invisible', the Node will not have
   * any highlighting when it receives focus.
   *
   * Use the local coordinate frame when drawing a custom highlight for this Node.
   */ setFocusHighlight(focusHighlight) {
        if (this._focusHighlight !== focusHighlight) {
            this._focusHighlight = focusHighlight;
            // if the focus highlight is layerable in the scene graph, update visibility so that it is only
            // visible when associated Node has focus
            if (this._focusHighlightLayerable) {
                // if focus highlight is layerable, it must be a Node in the scene graph
                assert && assert(focusHighlight instanceof Node); // eslint-disable-line phet/no-simple-type-checking-assertions
                // the highlight starts off invisible, HighlightOverlay will make it visible when this Node has DOM focus
                focusHighlight.visible = false;
            }
            this.focusHighlightChangedEmitter.emit();
        }
    }
    set focusHighlight(focusHighlight) {
        this.setFocusHighlight(focusHighlight);
    }
    get focusHighlight() {
        return this.getFocusHighlight();
    }
    /**
   * Get the focus highlight for this Node.
   */ getFocusHighlight() {
        return this._focusHighlight;
    }
    /**
   * Setting a flag to break default and allow the focus highlight to be (z) layered into the scene graph.
   * This will set the visibility of the layered focus highlight, it will always be invisible until this Node has
   * focus.
   */ setFocusHighlightLayerable(focusHighlightLayerable) {
        if (this._focusHighlightLayerable !== focusHighlightLayerable) {
            this._focusHighlightLayerable = focusHighlightLayerable;
            // if a focus highlight is defined (it must be a Node), update its visibility so it is linked to focus
            // of the associated Node
            if (this._focusHighlight) {
                assert && assert(this._focusHighlight instanceof Node);
                this._focusHighlight.visible = false;
                // emit that the highlight has changed and we may need to update its visual representation
                this.focusHighlightChangedEmitter.emit();
            }
        }
    }
    set focusHighlightLayerable(focusHighlightLayerable) {
        this.setFocusHighlightLayerable(focusHighlightLayerable);
    }
    get focusHighlightLayerable() {
        return this.getFocusHighlightLayerable();
    }
    /**
   * Get the flag for if this Node is layerable in the scene graph (or if it is always on top, like the default).
   */ getFocusHighlightLayerable() {
        return this._focusHighlightLayerable;
    }
    /**
   * Set whether or not this Node has a group focus highlight. If this Node has a group focus highlight, an extra
   * focus highlight will surround this Node whenever a descendant Node has focus. Generally
   * useful to indicate nested keyboard navigation. If true, the group focus highlight will surround
   * this Node's local bounds. Otherwise, the Node will be used.
   *
   * TODO: Support more than one group focus highlight (multiple ancestors could have groupFocusHighlight), see https://github.com/phetsims/scenery/issues/1608
   */ setGroupFocusHighlight(groupHighlight) {
        this._groupFocusHighlight = groupHighlight;
    }
    set groupFocusHighlight(groupHighlight) {
        this.setGroupFocusHighlight(groupHighlight);
    }
    get groupFocusHighlight() {
        return this.getGroupFocusHighlight();
    }
    /**
   * Get whether or not this Node has a 'group' focus highlight, see setter for more information.
   */ getGroupFocusHighlight() {
        return this._groupFocusHighlight;
    }
    /**
   * Very similar algorithm to setChildren in Node.js
   * @param ariaLabelledbyAssociations - list of associationObjects, see this._ariaLabelledbyAssociations.
   */ setAriaLabelledbyAssociations(ariaLabelledbyAssociations) {
        let associationObject;
        let i;
        // validation if assert is enabled
        if (assert) {
            assert(Array.isArray(ariaLabelledbyAssociations));
            for(i = 0; i < ariaLabelledbyAssociations.length; i++){
                associationObject = ariaLabelledbyAssociations[i];
            }
        }
        // no work to be done if both are empty, return early
        if (ariaLabelledbyAssociations.length === 0 && this._ariaLabelledbyAssociations.length === 0) {
            return;
        }
        const beforeOnly = []; // Will hold all Nodes that will be removed.
        const afterOnly = []; // Will hold all Nodes that will be "new" children (added)
        const inBoth = []; // Child Nodes that "stay". Will be ordered for the "after" case.
        // get a difference of the desired new list, and the old
        arrayDifference(ariaLabelledbyAssociations, this._ariaLabelledbyAssociations, afterOnly, beforeOnly, inBoth);
        // remove each current associationObject that isn't in the new list
        for(i = 0; i < beforeOnly.length; i++){
            associationObject = beforeOnly[i];
            this.removeAriaLabelledbyAssociation(associationObject);
        }
        assert && assert(this._ariaLabelledbyAssociations.length === inBoth.length, 'Removing associations should not have triggered other association changes');
        // add each association from the new list that hasn't been added yet
        for(i = 0; i < afterOnly.length; i++){
            const ariaLabelledbyAssociation = ariaLabelledbyAssociations[i];
            this.addAriaLabelledbyAssociation(ariaLabelledbyAssociation);
        }
    }
    set ariaLabelledbyAssociations(ariaLabelledbyAssociations) {
        this.setAriaLabelledbyAssociations(ariaLabelledbyAssociations);
    }
    get ariaLabelledbyAssociations() {
        return this.getAriaLabelledbyAssociations();
    }
    getAriaLabelledbyAssociations() {
        return this._ariaLabelledbyAssociations;
    }
    /**
   * Add an aria-labelledby association to this Node. The data in the associationObject will be implemented like
   * "a peer's HTMLElement of this Node (specified with the string constant stored in `thisElementName`) will have an
   * aria-labelledby attribute with a value that includes the `otherNode`'s peer HTMLElement's id (specified with
   * `otherElementName`)."
   *
   * There can be more than one association because an aria-labelledby attribute's value can be a space separated
   * list of HTML ids, and not just a single id, see https://www.w3.org/WAI/GL/wiki/Using_aria-labelledby_to_concatenate_a_label_from_several_text_nodes
   */ addAriaLabelledbyAssociation(associationObject) {
        // TODO: assert if this associationObject is already in the association objects list! https://github.com/phetsims/scenery/issues/832
        this._ariaLabelledbyAssociations.push(associationObject); // Keep track of this association.
        // Flag that this Node is is being labelled by the other Node, so that if the other Node changes it can tell
        // this Node to restore the association appropriately.
        associationObject.otherNode._nodesThatAreAriaLabelledbyThisNode.push(this);
        this.updateAriaLabelledbyAssociationsInPeers();
    }
    /**
   * Remove an aria-labelledby association object, see addAriaLabelledbyAssociation for more details
   */ removeAriaLabelledbyAssociation(associationObject) {
        assert && assert(_.includes(this._ariaLabelledbyAssociations, associationObject));
        // remove the
        const removedObject = this._ariaLabelledbyAssociations.splice(_.indexOf(this._ariaLabelledbyAssociations, associationObject), 1);
        // remove the reference from the other Node back to this Node because we don't need it anymore
        removedObject[0].otherNode.removeNodeThatIsAriaLabelledByThisNode(this);
        this.updateAriaLabelledbyAssociationsInPeers();
    }
    /**
   * Remove the reference to the Node that is using this Node's ID as an aria-labelledby value (scenery-internal)
   */ removeNodeThatIsAriaLabelledByThisNode(node) {
        const indexOfNode = _.indexOf(this._nodesThatAreAriaLabelledbyThisNode, node);
        assert && assert(indexOfNode >= 0);
        this._nodesThatAreAriaLabelledbyThisNode.splice(indexOfNode, 1);
    }
    /**
   * Trigger the view update for each PDOMPeer
   */ updateAriaLabelledbyAssociationsInPeers() {
        for(let i = 0; i < this.pdomInstances.length; i++){
            const peer = this.pdomInstances[i].peer;
            peer.onAriaLabelledbyAssociationChange();
        }
    }
    /**
   * Update the associations for aria-labelledby (scenery-internal)
   */ updateOtherNodesAriaLabelledby() {
        // if any other Nodes are aria-labelledby this Node, update those associations too. Since this Node's
        // pdom content needs to be recreated, they need to update their aria-labelledby associations accordingly.
        for(let i = 0; i < this._nodesThatAreAriaLabelledbyThisNode.length; i++){
            const otherNode = this._nodesThatAreAriaLabelledbyThisNode[i];
            otherNode.updateAriaLabelledbyAssociationsInPeers();
        }
    }
    /**
   * The list of Nodes that are aria-labelledby this Node (other Node's peer element will have this Node's Peer element's
   * id in the aria-labelledby attribute
   */ getNodesThatAreAriaLabelledbyThisNode() {
        return this._nodesThatAreAriaLabelledbyThisNode;
    }
    get nodesThatAreAriaLabelledbyThisNode() {
        return this.getNodesThatAreAriaLabelledbyThisNode();
    }
    setAriaDescribedbyAssociations(ariaDescribedbyAssociations) {
        let associationObject;
        if (assert) {
            assert(Array.isArray(ariaDescribedbyAssociations));
            for(let j = 0; j < ariaDescribedbyAssociations.length; j++){
                associationObject = ariaDescribedbyAssociations[j];
            }
        }
        // no work to be done if both are empty
        if (ariaDescribedbyAssociations.length === 0 && this._ariaDescribedbyAssociations.length === 0) {
            return;
        }
        const beforeOnly = []; // Will hold all Nodes that will be removed.
        const afterOnly = []; // Will hold all Nodes that will be "new" children (added)
        const inBoth = []; // Child Nodes that "stay". Will be ordered for the "after" case.
        let i;
        // get a difference of the desired new list, and the old
        arrayDifference(ariaDescribedbyAssociations, this._ariaDescribedbyAssociations, afterOnly, beforeOnly, inBoth);
        // remove each current associationObject that isn't in the new list
        for(i = 0; i < beforeOnly.length; i++){
            associationObject = beforeOnly[i];
            this.removeAriaDescribedbyAssociation(associationObject);
        }
        assert && assert(this._ariaDescribedbyAssociations.length === inBoth.length, 'Removing associations should not have triggered other association changes');
        // add each association from the new list that hasn't been added yet
        for(i = 0; i < afterOnly.length; i++){
            const ariaDescribedbyAssociation = ariaDescribedbyAssociations[i];
            this.addAriaDescribedbyAssociation(ariaDescribedbyAssociation);
        }
    }
    set ariaDescribedbyAssociations(ariaDescribedbyAssociations) {
        this.setAriaDescribedbyAssociations(ariaDescribedbyAssociations);
    }
    get ariaDescribedbyAssociations() {
        return this.getAriaDescribedbyAssociations();
    }
    getAriaDescribedbyAssociations() {
        return this._ariaDescribedbyAssociations;
    }
    /**
   * Add an aria-describedby association to this Node. The data in the associationObject will be implemented like
   * "a peer's HTMLElement of this Node (specified with the string constant stored in `thisElementName`) will have an
   * aria-describedby attribute with a value that includes the `otherNode`'s peer HTMLElement's id (specified with
   * `otherElementName`)."
   *
   * There can be more than one association because an aria-describedby attribute's value can be a space separated
   * list of HTML ids, and not just a single id, see https://www.w3.org/WAI/GL/wiki/Using_aria-labelledby_to_concatenate_a_label_from_several_text_nodes
   */ addAriaDescribedbyAssociation(associationObject) {
        assert && assert(!_.includes(this._ariaDescribedbyAssociations, associationObject), 'describedby association already registed');
        this._ariaDescribedbyAssociations.push(associationObject); // Keep track of this association.
        // Flag that this Node is is being described by the other Node, so that if the other Node changes it can tell
        // this Node to restore the association appropriately.
        associationObject.otherNode._nodesThatAreAriaDescribedbyThisNode.push(this);
        // update the PDOMPeers with this aria-describedby association
        this.updateAriaDescribedbyAssociationsInPeers();
    }
    /**
   * Is this object already in the describedby association list
   */ hasAriaDescribedbyAssociation(associationObject) {
        return _.includes(this._ariaDescribedbyAssociations, associationObject);
    }
    /**
   * Remove an aria-describedby association object, see addAriaDescribedbyAssociation for more details
   */ removeAriaDescribedbyAssociation(associationObject) {
        assert && assert(_.includes(this._ariaDescribedbyAssociations, associationObject));
        // remove the
        const removedObject = this._ariaDescribedbyAssociations.splice(_.indexOf(this._ariaDescribedbyAssociations, associationObject), 1);
        // remove the reference from the other Node back to this Node because we don't need it anymore
        removedObject[0].otherNode.removeNodeThatIsAriaDescribedByThisNode(this);
        this.updateAriaDescribedbyAssociationsInPeers();
    }
    /**
   * Remove the reference to the Node that is using this Node's ID as an aria-describedby value (scenery-internal)
   */ removeNodeThatIsAriaDescribedByThisNode(node) {
        const indexOfNode = _.indexOf(this._nodesThatAreAriaDescribedbyThisNode, node);
        assert && assert(indexOfNode >= 0);
        this._nodesThatAreAriaDescribedbyThisNode.splice(indexOfNode, 1);
    }
    /**
   * Trigger the view update for each PDOMPeer
   */ updateAriaDescribedbyAssociationsInPeers() {
        for(let i = 0; i < this.pdomInstances.length; i++){
            const peer = this.pdomInstances[i].peer;
            peer.onAriaDescribedbyAssociationChange();
        }
    }
    /**
   * Update the associations for aria-describedby (scenery-internal)
   */ updateOtherNodesAriaDescribedby() {
        // if any other Nodes are aria-describedby this Node, update those associations too. Since this Node's
        // pdom content needs to be recreated, they need to update their aria-describedby associations accordingly.
        // TODO: only use unique elements of the array (_.unique) https://github.com/phetsims/scenery/issues/1581
        for(let i = 0; i < this._nodesThatAreAriaDescribedbyThisNode.length; i++){
            const otherNode = this._nodesThatAreAriaDescribedbyThisNode[i];
            otherNode.updateAriaDescribedbyAssociationsInPeers();
        }
    }
    /**
   * The list of Nodes that are aria-describedby this Node (other Node's peer element will have this Node's Peer element's
   * id in the aria-describedby attribute
   */ getNodesThatAreAriaDescribedbyThisNode() {
        return this._nodesThatAreAriaDescribedbyThisNode;
    }
    get nodesThatAreAriaDescribedbyThisNode() {
        return this.getNodesThatAreAriaDescribedbyThisNode();
    }
    setActiveDescendantAssociations(activeDescendantAssociations) {
        let associationObject;
        if (assert) {
            assert(Array.isArray(activeDescendantAssociations));
            for(let j = 0; j < activeDescendantAssociations.length; j++){
                associationObject = activeDescendantAssociations[j];
            }
        }
        // no work to be done if both are empty, safe to return early
        if (activeDescendantAssociations.length === 0 && this._activeDescendantAssociations.length === 0) {
            return;
        }
        const beforeOnly = []; // Will hold all Nodes that will be removed.
        const afterOnly = []; // Will hold all Nodes that will be "new" children (added)
        const inBoth = []; // Child Nodes that "stay". Will be ordered for the "after" case.
        let i;
        // get a difference of the desired new list, and the old
        arrayDifference(activeDescendantAssociations, this._activeDescendantAssociations, afterOnly, beforeOnly, inBoth);
        // remove each current associationObject that isn't in the new list
        for(i = 0; i < beforeOnly.length; i++){
            associationObject = beforeOnly[i];
            this.removeActiveDescendantAssociation(associationObject);
        }
        assert && assert(this._activeDescendantAssociations.length === inBoth.length, 'Removing associations should not have triggered other association changes');
        // add each association from the new list that hasn't been added yet
        for(i = 0; i < afterOnly.length; i++){
            const activeDescendantAssociation = activeDescendantAssociations[i];
            this.addActiveDescendantAssociation(activeDescendantAssociation);
        }
    }
    set activeDescendantAssociations(activeDescendantAssociations) {
        this.setActiveDescendantAssociations(activeDescendantAssociations);
    }
    get activeDescendantAssociations() {
        return this.getActiveDescendantAssociations();
    }
    getActiveDescendantAssociations() {
        return this._activeDescendantAssociations;
    }
    /**
   * Add an aria-activeDescendant association to this Node. The data in the associationObject will be implemented like
   * "a peer's HTMLElement of this Node (specified with the string constant stored in `thisElementName`) will have an
   * aria-activeDescendant attribute with a value that includes the `otherNode`'s peer HTMLElement's id (specified with
   * `otherElementName`)."
   */ addActiveDescendantAssociation(associationObject) {
        // TODO: assert if this associationObject is already in the association objects list! https://github.com/phetsims/scenery/issues/832
        this._activeDescendantAssociations.push(associationObject); // Keep track of this association.
        // Flag that this Node is is being described by the other Node, so that if the other Node changes it can tell
        // this Node to restore the association appropriately.
        associationObject.otherNode._nodesThatAreActiveDescendantToThisNode.push(this);
        // update the pdomPeers with this aria-activeDescendant association
        this.updateActiveDescendantAssociationsInPeers();
    }
    /**
   * Remove an aria-activeDescendant association object, see addActiveDescendantAssociation for more details
   */ removeActiveDescendantAssociation(associationObject) {
        assert && assert(_.includes(this._activeDescendantAssociations, associationObject));
        // remove the
        const removedObject = this._activeDescendantAssociations.splice(_.indexOf(this._activeDescendantAssociations, associationObject), 1);
        // remove the reference from the other Node back to this Node because we don't need it anymore
        removedObject[0].otherNode.removeNodeThatIsActiveDescendantThisNode(this);
        this.updateActiveDescendantAssociationsInPeers();
    }
    /**
   * Remove the reference to the Node that is using this Node's ID as an aria-activeDescendant value (scenery-internal)
   */ removeNodeThatIsActiveDescendantThisNode(node) {
        const indexOfNode = _.indexOf(this._nodesThatAreActiveDescendantToThisNode, node);
        assert && assert(indexOfNode >= 0);
        this._nodesThatAreActiveDescendantToThisNode.splice(indexOfNode, 1);
    }
    /**
   * Trigger the view update for each PDOMPeer
   */ updateActiveDescendantAssociationsInPeers() {
        for(let i = 0; i < this.pdomInstances.length; i++){
            const peer = this.pdomInstances[i].peer;
            peer.onActiveDescendantAssociationChange();
        }
    }
    /**
   * Update the associations for aria-activeDescendant (scenery-internal)
   */ updateOtherNodesActiveDescendant() {
        // if any other Nodes are aria-activeDescendant this Node, update those associations too. Since this Node's
        // pdom content needs to be recreated, they need to update their aria-activeDescendant associations accordingly.
        // TODO: only use unique elements of the array (_.unique) https://github.com/phetsims/scenery/issues/1581
        for(let i = 0; i < this._nodesThatAreActiveDescendantToThisNode.length; i++){
            const otherNode = this._nodesThatAreActiveDescendantToThisNode[i];
            otherNode.updateActiveDescendantAssociationsInPeers();
        }
    }
    /**
   * The list of Nodes that are aria-activeDescendant this Node (other Node's peer element will have this Node's Peer element's
   * id in the aria-activeDescendant attribute
   */ getNodesThatAreActiveDescendantToThisNode() {
        return this._nodesThatAreActiveDescendantToThisNode;
    }
    get nodesThatAreActiveDescendantToThisNode() {
        return this.getNodesThatAreActiveDescendantToThisNode();
    }
    /**
   * Sets the PDOM/DOM order for this Node. This includes not only focused items, but elements that can be
   * placed in the Parallel DOM. If provided, it will override the focus order between children (and
   * optionally arbitrary subtrees). If not provided, the focus order will default to the rendering order
   * (first children first, last children last), determined by the children array. A Node must be connected to a scene
   * graph (via children) in order for pdomOrder to apply. Thus, `setPDOMOrder` cannot be used in exchange for
   * setting a Node as a child.
   *
   * In the general case, when pdomOrder is specified, it's an array of Nodes, with optionally one
   * element being a placeholder for "the rest of the children", signified by null. This means that, for
   * accessibility, it will act as if the children for this Node WERE the pdomOrder (potentially
   * supplemented with other children via the placeholder).
   *
   * For example, if you have the tree:
   *   a
   *     b
   *       d
   *       e
   *     c
   *       g
   *       f
   *         h
   *
   * and we specify b.pdomOrder = [ e, f, d, c ], then the pdom structure will act as if the tree is:
   *  a
   *    b
   *      e
   *      f <--- the entire subtree of `f` gets placed here under `b`, pulling it out from where it was before.
   *        h
   *      d
   *      c <--- note that `g` is NOT under `c` anymore, because it got pulled out under b directly
   *        g
   *
   * The placeholder (`null`) will get filled in with all direct children that are NOT in any pdomOrder.
   * If there is no placeholder specified, it will act as if the placeholder is at the end of the order.
   * The value `null` (the default) and the empty array (`[]`) both act as if the only order is the placeholder,
   * i.e. `[null]`.
   *
   * Some general constraints for the orders are:
   * - Nodes must be attached to a Display (in a scene graph) to be shown in a pdom order.
   * - You can't specify a Node in more than one pdomOrder, and you can't specify duplicates of a value
   *   in a pdomOrder.
   * - You can't specify an ancestor of a Node in that Node's pdomOrder
   *   (e.g. this.pdomOrder = this.parents ).
   *
   * Note that specifying something in a pdomOrder will effectively remove it from all of its parents for
   * the pdom tree (so if you create `tmpNode.pdomOrder = [ a ]` then toss the tmpNode without
   * disposing it, `a` won't show up in the parallel DOM). If there is a need for that, disposing a Node
   * effectively removes its pdomOrder.
   *
   * See https://github.com/phetsims/scenery-phet/issues/365#issuecomment-381302583 for more information on the
   * decisions and design for this feature.
   */ setPDOMOrder(pdomOrder) {
        assert && assert(Array.isArray(pdomOrder) || pdomOrder === null, `Array or null expected, received: ${pdomOrder}`);
        if (assert && pdomOrder) {
            pdomOrder.forEach((node, index)=>{
                assert && assert(node === null || node instanceof Node, `Elements of pdomOrder should be either a Node or null. Element at index ${index} is: ${node}`);
            });
            assert && assert(this.getTrails((node)=>_.includes(pdomOrder, node)).length === 0, 'pdomOrder should not include any ancestors or the Node itself');
            assert && assert(pdomOrder.length === _.uniq(pdomOrder).length, 'pdomOrder does not allow duplicate Nodes');
        }
        // First a comparison to see if the order is switching to or from null
        let changed = this._pdomOrder === null && pdomOrder !== null || this._pdomOrder !== null && pdomOrder === null;
        if (!changed && pdomOrder && this._pdomOrder) {
            // We are comparing two arrays, so need to check contents for differences.
            changed = pdomOrder.length !== this._pdomOrder.length;
            if (!changed) {
                // Lengths are the same, so we need to look for content or order differences.
                for(let i = 0; i < pdomOrder.length; i++){
                    if (pdomOrder[i] !== this._pdomOrder[i]) {
                        changed = true;
                        break;
                    }
                }
            }
        }
        // Only update if it has changed
        if (changed) {
            const oldPDOMOrder = this._pdomOrder;
            // Store our own reference to this, so client modifications to the input array won't silently break things.
            // See https://github.com/phetsims/scenery/issues/786
            this._pdomOrder = pdomOrder === null ? null : pdomOrder.slice();
            PDOMTree.pdomOrderChange(this, oldPDOMOrder, pdomOrder);
            this.rendererSummaryRefreshEmitter.emit();
        }
    }
    set pdomOrder(value) {
        this.setPDOMOrder(value);
    }
    get pdomOrder() {
        return this.getPDOMOrder();
    }
    /**
   * Returns the pdom (focus) order for this Node.
   *
   * Making changes to the returned array will not affect this Node's order. It returns a defensive copy.
   */ getPDOMOrder() {
        if (this._pdomOrder) {
            return this._pdomOrder.slice(0); // create a defensive copy
        }
        return this._pdomOrder;
    }
    /**
   * Returns whether this Node has a pdomOrder that is effectively different than the default.
   *
   * NOTE: `null`, `[]` and `[null]` are all effectively the same thing, so this will return true for any of
   * those. Usage of `null` is recommended, as it doesn't create the extra object reference (but some code
   * that generates arrays may be more convenient).
   */ hasPDOMOrder() {
        return this._pdomOrder !== null && this._pdomOrder.length !== 0 && (this._pdomOrder.length > 1 || this._pdomOrder[0] !== null);
    }
    /**
   * Returns our "PDOM parent" if available: the Node that specifies this Node in its pdomOrder.
   */ getPDOMParent() {
        return this._pdomParent;
    }
    get pdomParent() {
        return this.getPDOMParent();
    }
    /**
   * Returns the "effective" pdom children for the Node (which may be different based on the order or other
   * excluded subtrees).
   *
   * If there is no pdomOrder specified, this is basically "all children that don't have pdom parents"
   * (a Node has a "PDOM parent" if it is specified in a pdomOrder).
   *
   * Otherwise (if it has a pdomOrder), it is the pdomOrder, with the above list of Nodes placed
   * in at the location of the placeholder. If there is no placeholder, it acts like a placeholder was the last
   * element of the pdomOrder (see setPDOMOrder for more documentation information).
   *
   * NOTE: If you specify a child in the pdomOrder, it will NOT be double-included (since it will have an
   * PDOM parent).
   *
   * (scenery-internal)
   */ getEffectiveChildren() {
        // Find all children without PDOM parents.
        const nonOrderedChildren = [];
        for(let i = 0; i < this._children.length; i++){
            const child = this._children[i];
            if (!child._pdomParent) {
                nonOrderedChildren.push(child);
            }
        }
        // Override the order, and replace the placeholder if it exists.
        if (this.hasPDOMOrder()) {
            const effectiveChildren = this.pdomOrder.slice();
            const placeholderIndex = effectiveChildren.indexOf(null);
            // If we have a placeholder, replace its content with the children
            if (placeholderIndex >= 0) {
                // for efficiency
                nonOrderedChildren.unshift(placeholderIndex, 1);
                // @ts-expect-error - TODO: best way to type? https://github.com/phetsims/scenery/issues/1581
                Array.prototype.splice.apply(effectiveChildren, nonOrderedChildren);
            } else {
                Array.prototype.push.apply(effectiveChildren, nonOrderedChildren);
            }
            return effectiveChildren;
        } else {
            return nonOrderedChildren;
        }
    }
    /**
   * Called when our pdomVisible Property changes values.
   */ onPdomVisiblePropertyChange(visible) {
        this._pdomDisplaysInfo.onPDOMVisibilityChange(visible);
    }
    /**
   * Sets what Property our pdomVisibleProperty is backed by, so that changes to this provided Property will change this
   * Node's pdom visibility, and vice versa. This does not change this._pdomVisibleProperty. See TinyForwardingProperty.setTargetProperty()
   * for more info.
   */ setPdomVisibleProperty(newTarget) {
        this._pdomVisibleProperty.setTargetProperty(newTarget);
        return this;
    }
    /**
   * See setPdomVisibleProperty() for more information
   */ set pdomVisibleProperty(property) {
        this.setPdomVisibleProperty(property);
    }
    /**
   * See getPdomVisibleProperty() for more information
   */ get pdomVisibleProperty() {
        return this.getPdomVisibleProperty();
    }
    /**
   * Get this Node's pdomVisibleProperty. See Node.getVisibleProperty for more information
   */ getPdomVisibleProperty() {
        return this._pdomVisibleProperty;
    }
    /**
   * Hide completely from a screen reader and the browser by setting the hidden attribute on the Node's
   * representative DOM element. If the sibling DOM Elements have a container parent, the container
   * should be hidden so that all PDOM elements are hidden as well.  Hiding the element will remove it from the focus
   * order.
   */ setPDOMVisible(visible) {
        this.pdomVisibleProperty.value = visible;
    }
    set pdomVisible(visible) {
        this.setPDOMVisible(visible);
    }
    get pdomVisible() {
        return this.isPDOMVisible();
    }
    /**
   * Get whether or not this Node's representative DOM element is visible.
   */ isPDOMVisible() {
        return this.pdomVisibleProperty.value;
    }
    /**
   * Returns true if any of the PDOMInstances for the Node are globally visible and displayed in the PDOM. A
   * PDOMInstance is globally visible if Node and all ancestors are pdomVisible. PDOMInstance visibility is
   * updated synchronously, so this returns the most up-to-date information without requiring Display.updateDisplay
   */ isPDOMDisplayed() {
        for(let i = 0; i < this._pdomInstances.length; i++){
            if (this._pdomInstances[i].isGloballyVisible()) {
                return true;
            }
        }
        return false;
    }
    get pdomDisplayed() {
        return this.isPDOMDisplayed();
    }
    invalidatePeerInputValue() {
        for(let i = 0; i < this.pdomInstances.length; i++){
            const peer = this.pdomInstances[i].peer;
            peer.onInputValueChange();
        }
    }
    /**
   * Set the value of an input element.  Element must be a form element to support the value attribute. The input
   * value is converted to string since input values are generally string for HTML.
   */ setInputValue(inputValue) {
        assert && this._tagName && assert(_.includes(FORM_ELEMENTS, this._tagName.toUpperCase()), 'dom element must be a form element to support value');
        if (inputValue !== this._inputValue) {
            if (isTReadOnlyProperty(this._inputValue) && !this._inputValue.isDisposed) {
                this._inputValue.unlink(this._onPDOMContentChangeListener);
            }
            this._inputValue = inputValue;
            if (isTReadOnlyProperty(inputValue)) {
                inputValue.lazyLink(this._onPDOMContentChangeListener);
            }
            this.invalidatePeerInputValue();
        }
    }
    set inputValue(value) {
        this.setInputValue(value);
    }
    get inputValue() {
        return this.getInputValue();
    }
    /**
   * Get the value of the element. Element must be a form element to support the value attribute.
   */ getInputValue() {
        let value;
        if (isTReadOnlyProperty(this._inputValue)) {
            value = this._inputValue.value;
        } else {
            value = this._inputValue;
        }
        return value === null ? null : '' + value;
    }
    /**
   * Set whether or not the checked attribute appears on the dom elements associated with this Node's
   * pdom content.  This is only useful for inputs of type 'radio' and 'checkbox'. A 'checked' input
   * is considered selected to the browser and assistive technology.
   */ setPDOMChecked(checked) {
        if (this._tagName) {
            assert && assert(this._tagName.toUpperCase() === INPUT_TAG, 'Cannot set checked on a non input tag.');
        }
        if (this._inputType) {
            assert && assert(INPUT_TYPES_THAT_SUPPORT_CHECKED.includes(this._inputType.toUpperCase()), `inputType does not support checked: ${this._inputType}`);
        }
        if (this._pdomChecked !== checked) {
            this._pdomChecked = checked;
            this.setPDOMAttribute('checked', checked, {
                type: 'property'
            });
        }
    }
    set pdomChecked(checked) {
        this.setPDOMChecked(checked);
    }
    get pdomChecked() {
        return this.getPDOMChecked();
    }
    /**
   * Get whether or not the pdom input is 'checked'.
   */ getPDOMChecked() {
        return this._pdomChecked;
    }
    /**
   * Get an array containing all pdom attributes that have been added to this Node's primary sibling.
   */ getPDOMAttributes() {
        return this._pdomAttributes.slice(0); // defensive copy
    }
    get pdomAttributes() {
        return this.getPDOMAttributes();
    }
    /**
   * Set a particular attribute or property for this Node's primary sibling, generally to provide extra semantic information for
   * a screen reader.
   *
   * @param attribute - string naming the attribute
   * @param value - the value for the attribute, if boolean, then it will be set as a javascript property on the HTMLElement rather than an attribute
   * @param [providedOptions]
   */ setPDOMAttribute(attribute, value, providedOptions) {
        assert && providedOptions && assert(Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on pdomAttribute options object is a code smell');
        const options = optionize()({
            // {string|null} - If non-null, will set the attribute with the specified namespace. This can be required
            // for setting certain attributes (e.g. MathML).
            namespace: null,
            // set the "attribute" as a javascript property on the DOMElement instead of a DOM element attribute
            type: 'attribute',
            elementName: PDOMPeer.PRIMARY_SIBLING // see PDOMPeer.getElementName() for valid values, default to the primary sibling
        }, providedOptions);
        assert && assert(!ASSOCIATION_ATTRIBUTES.includes(attribute), 'setPDOMAttribute does not support association attributes');
        assert && options.namespace && assert(options.type === 'attribute', 'property-setting is not supported for custom namespaces');
        // if the pdom attribute already exists in the list, remove it - no need
        // to remove from the peers, existing attributes will simply be replaced in the DOM
        for(let i = 0; i < this._pdomAttributes.length; i++){
            const currentAttribute = this._pdomAttributes[i];
            if (currentAttribute.attribute === attribute && currentAttribute.options.namespace === options.namespace && currentAttribute.options.elementName === options.elementName) {
                // We can simplify the new value set as long as there isn't cleanup (from a Property listener) or logic change (from a different type)
                if (!isTReadOnlyProperty(currentAttribute.value) && currentAttribute.options.type === options.type) {
                    this._pdomAttributes.splice(i, 1);
                } else {
                    // Swapping type strategies should remove the attribute, so it can be set as a property/attribute correctly.
                    this.removePDOMAttribute(currentAttribute.attribute, currentAttribute.options);
                }
            }
        }
        let listener = (rawValue)=>{
            assert && typeof rawValue === 'string' && validate(rawValue, Validation.STRING_WITHOUT_TEMPLATE_VARS_VALIDATOR);
            for(let j = 0; j < this._pdomInstances.length; j++){
                const peer = this._pdomInstances[j].peer;
                peer.setAttributeToElement(attribute, rawValue, options);
            }
        };
        if (isTReadOnlyProperty(value)) {
            // should run it once initially
            value.link(listener);
        } else {
            // run it once and toss it, so we don't need to store the reference or unlink it later
            listener(value);
            listener = null;
        }
        this._pdomAttributes.push({
            attribute: attribute,
            value: value,
            listener: listener,
            options: options
        });
    }
    /**
   * Remove a particular attribute, removing the associated semantic information from the DOM element.
   *
   * It is HIGHLY recommended that you never call this function from an attribute set with `type:'property'`, see
   * setPDOMAttribute for the option details.
   *
   * @param attribute - name of the attribute to remove
   * @param [providedOptions]
   */ removePDOMAttribute(attribute, providedOptions) {
        assert && providedOptions && assert(Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on pdomAttribute options object is a code smell');
        const options = optionize()({
            // {string|null} - If non-null, will remove the attribute with the specified namespace. This can be required
            // for removing certain attributes (e.g. MathML).
            namespace: null,
            elementName: PDOMPeer.PRIMARY_SIBLING // see PDOMPeer.getElementName() for valid values, default to the primary sibling
        }, providedOptions);
        let attributeRemoved = false;
        for(let i = 0; i < this._pdomAttributes.length; i++){
            if (this._pdomAttributes[i].attribute === attribute && this._pdomAttributes[i].options.namespace === options.namespace && this._pdomAttributes[i].options.elementName === options.elementName) {
                const oldAttribute = this._pdomAttributes[i];
                if (oldAttribute.listener && isTReadOnlyProperty(oldAttribute.value) && !oldAttribute.value.isDisposed) {
                    oldAttribute.value.unlink(oldAttribute.listener);
                }
                this._pdomAttributes.splice(i, 1);
                attributeRemoved = true;
            }
        }
        assert && assert(attributeRemoved, `Node does not have pdom attribute ${attribute}`);
        for(let j = 0; j < this._pdomInstances.length; j++){
            const peer = this._pdomInstances[j].peer;
            peer.removeAttributeFromElement(attribute, options);
        }
    }
    /**
   * Remove all attributes from this Node's dom element.
   */ removePDOMAttributes() {
        // all attributes currently on this Node's primary sibling
        const attributes = this.getPDOMAttributes();
        for(let i = 0; i < attributes.length; i++){
            const attribute = attributes[i].attribute;
            this.removePDOMAttribute(attribute);
        }
    }
    /**
   * Remove a particular attribute, removing the associated semantic information from the DOM element.
   *
   * @param attribute - name of the attribute to remove
   * @param [providedOptions]
   */ hasPDOMAttribute(attribute, providedOptions) {
        assert && providedOptions && assert(Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on pdomAttribute options object is a code smell');
        const options = optionize()({
            // {string|null} - If non-null, will remove the attribute with the specified namespace. This can be required
            // for removing certain attributes (e.g. MathML).
            namespace: null,
            elementName: PDOMPeer.PRIMARY_SIBLING // see PDOMPeer.getElementName() for valid values, default to the primary sibling
        }, providedOptions);
        let attributeFound = false;
        for(let i = 0; i < this._pdomAttributes.length; i++){
            if (this._pdomAttributes[i].attribute === attribute && this._pdomAttributes[i].options.namespace === options.namespace && this._pdomAttributes[i].options.elementName === options.elementName) {
                attributeFound = true;
            }
        }
        return attributeFound;
    }
    /**
   * Add the class to the PDOM element's classList. The PDOM is generally invisible,
   * but some styling occasionally has an impact on semantics so it is necessary to set styles.
   * Add a class with this function and define the style in stylesheets (likely SceneryStyle).
   */ setPDOMClass(className, providedOptions) {
        const options = optionize()({
            elementName: PDOMPeer.PRIMARY_SIBLING
        }, providedOptions);
        // if we already have the provided className set to the sibling, do nothing
        for(let i = 0; i < this._pdomClasses.length; i++){
            const currentClass = this._pdomClasses[i];
            if (currentClass.className === className && currentClass.options.elementName === options.elementName) {
                return;
            }
        }
        this._pdomClasses.push({
            className: className,
            options: options
        });
        for(let j = 0; j < this._pdomInstances.length; j++){
            const peer = this._pdomInstances[j].peer;
            peer.setClassToElement(className, options);
        }
    }
    /**
   * Remove a class from the classList of one of the elements for this Node.
   */ removePDOMClass(className, providedOptions) {
        const options = optionize()({
            elementName: PDOMPeer.PRIMARY_SIBLING // see PDOMPeer.getElementName() for valid values, default to the primary sibling
        }, providedOptions);
        let classRemoved = false;
        for(let i = 0; i < this._pdomClasses.length; i++){
            if (this._pdomClasses[i].className === className && this._pdomClasses[i].options.elementName === options.elementName) {
                this._pdomClasses.splice(i, 1);
                classRemoved = true;
            }
        }
        assert && assert(classRemoved, `Node does not have pdom attribute ${className}`);
        for(let j = 0; j < this._pdomClasses.length; j++){
            const peer = this.pdomInstances[j].peer;
            peer.removeClassFromElement(className, options);
        }
    }
    /**
   * Get the list of classes assigned to PDOM elements for this Node.
   */ getPDOMClasses() {
        return this._pdomClasses.slice(0); // defensive copy
    }
    get pdomClasses() {
        return this.getPDOMClasses();
    }
    /**
   * Make the DOM element explicitly focusable with a tab index. Native HTML form elements will generally be in
   * the navigation order without explicitly setting focusable.  If these need to be removed from the navigation
   * order, call setFocusable( false ).  Removing an element from the focus order does not hide the element from
   * assistive technology.
   *
   * @param focusable - null to use the default browser focus for the primary element
   */ setFocusable(focusable) {
        assert && assert(focusable === null || typeof focusable === 'boolean');
        if (this._focusableOverride !== focusable) {
            this._focusableOverride = focusable;
            for(let i = 0; i < this._pdomInstances.length; i++){
                // after the override is set, update the focusability of the peer based on this Node's value for focusable
                // which may be true or false (but not null)
                // assert && assert( typeof this.focusable === 'boolean' );
                assert && assert(this._pdomInstances[i].peer, 'Peer required to set focusable.');
                this._pdomInstances[i].peer.setFocusable(this.focusable);
            }
        }
    }
    set focusable(isFocusable) {
        this.setFocusable(isFocusable);
    }
    get focusable() {
        return this.isFocusable();
    }
    /**
   * Get whether or not the Node is focusable. Use the focusOverride, and then default to browser defined
   * focusable elements.
   */ isFocusable() {
        if (this._focusableOverride !== null) {
            return this._focusableOverride;
        } else if (this._tagName === null) {
            return false;
        } else {
            return PDOMUtils.tagIsDefaultFocusable(this._tagName);
        }
    }
    /**
   * Sets the source Node that controls positioning of the primary sibling. Transforms along the trail to this
   * Node are observed so that the primary sibling is positioned correctly in the global coordinate frame.
   *
   * The transformSourceNode cannot use DAG for now because we need a unique trail to observe transforms.
   *
   * By default, transforms along trails to all of this Node's PDOMInstances are observed. But this
   * function can be used if you have a visual Node represented in the PDOM by a different Node in the scene
   * graph but still need the other Node's PDOM content positioned over the visual Node. For example, this could
   * be required to catch all fake pointer events that may come from certain types of screen readers.
   */ setPDOMTransformSourceNode(node) {
        this._pdomTransformSourceNode = node;
        for(let i = 0; i < this._pdomInstances.length; i++){
            this._pdomInstances[i].peer.setPDOMTransformSourceNode(this._pdomTransformSourceNode);
        }
    }
    set pdomTransformSourceNode(node) {
        this.setPDOMTransformSourceNode(node);
    }
    get pdomTransformSourceNode() {
        return this.getPDOMTransformSourceNode();
    }
    /**
   * Get the source Node that controls positioning of the primary sibling in the global coordinate frame. See
   * setPDOMTransformSourceNode for more in depth information.
   */ getPDOMTransformSourceNode() {
        return this._pdomTransformSourceNode;
    }
    /**
   * Used by the animatedPanZoomSingleton. It will try to keep these bounds visible in the viewport when this Node
   * (or any ancestor) has a transform change while focused. This is useful if the bounds of your focusable
   * Node do not accurately surround the conceptual interactive component. If null, this Node's local bounds
   * are used.
   *
   * At this time, the Property cannot be changed after it is set.
   */ setFocusPanTargetBoundsProperty(boundsProperty) {
        // We may call this more than once with mutate
        if (boundsProperty !== this._focusPanTargetBoundsProperty) {
            assert && assert(!this._focusPanTargetBoundsProperty, 'Cannot change focusPanTargetBoundsProperty after it is set.');
            this._focusPanTargetBoundsProperty = boundsProperty;
        }
    }
    /**
   * Returns the function for creating global bounds to keep in the viewport while the component has focus, see the
   * setFocusPanTargetBoundsProperty function for more information.
   */ getFocusPanTargetBoundsProperty() {
        return this._focusPanTargetBoundsProperty;
    }
    /**
   * See setFocusPanTargetBoundsProperty for more information.
   */ set focusPanTargetBoundsProperty(boundsProperty) {
        this.setFocusPanTargetBoundsProperty(boundsProperty);
    }
    /**
   * See getFocusPanTargetBoundsProperty for more information.
   */ get focusPanTargetBoundsProperty() {
        return this.getFocusPanTargetBoundsProperty();
    }
    /**
   * Sets the direction that the global AnimatedPanZoomListener will pan while interacting with this Node. Pan will ONLY
   * occur in this dimension. This is especially useful for panning to large Nodes where panning to the center of the
   * Node would move other Nodes out of the viewport.
   *
   * Set to null for default behavior (panning in all directions).
   */ setLimitPanDirection(limitPanDirection) {
        this._limitPanDirection = limitPanDirection;
    }
    /**
   * See setLimitPanDirection for more information.
   */ getLimitPanDirection() {
        return this._limitPanDirection;
    }
    /**
   * See setLimitPanDirection for more information.
   * @param limitPanDirection
   */ set limitPanDirection(limitPanDirection) {
        this.setLimitPanDirection(limitPanDirection);
    }
    /**
   * See getLimitPanDirection for more information.
   */ get limitPanDirection() {
        return this.getLimitPanDirection();
    }
    /**
   * Sets whether the PDOM sibling elements are positioned in the correct place in the viewport. Doing so is a
   * requirement for custom gestures on touch based screen readers. However, doing this DOM layout is expensive so
   * only do this when necessary. Generally only needed for elements that utilize a "double tap and hold" gesture
   * to drag and drop.
   *
   * Positioning the PDOM element will caused some screen readers to send both click and pointer events to the
   * location of the Node in global coordinates. Do not position elements that use click listeners since activation
   * will fire twice (once for the pointer event listeners and once for the click event listeners).
   */ setPositionInPDOM(positionInPDOM) {
        this._positionInPDOM = positionInPDOM;
        for(let i = 0; i < this._pdomInstances.length; i++){
            this._pdomInstances[i].peer.setPositionInPDOM(positionInPDOM);
        }
    }
    set positionInPDOM(positionInPDOM) {
        this.setPositionInPDOM(positionInPDOM);
    }
    get positionInPDOM() {
        return this.getPositionInPDOM();
    }
    /**
   * Gets whether or not we are positioning the PDOM sibling elements. See setPositionInPDOM().
   */ getPositionInPDOM() {
        return this._positionInPDOM;
    }
    /**
   * This function should be used sparingly as a workaround. If used, any DOM input events received from the label
   * sibling will not be dispatched as SceneryEvents in Input.js. The label sibling may receive input by screen
   * readers if the virtual cursor is over it. That is usually fine, but there is a bug with NVDA and Firefox where
   * both the label sibling AND primary sibling receive events in this case, and both bubble up to the root of the
   * PDOM, and so we would otherwise dispatch two SceneryEvents instead of one.
   *
   * See https://github.com/phetsims/a11y-research/issues/156 for more information.
   */ setExcludeLabelSiblingFromInput() {
        this.excludeLabelSiblingFromInput = true;
        this.onPDOMContentChange();
    }
    /**
   * Return true if this Node is a PhET-iO archetype or it is a Node descendant of a PhET-iO archetype.
   * See https://github.com/phetsims/joist/issues/817
   */ isInsidePhetioArchetype(node = this) {
        if (node.isPhetioInstrumented()) {
            return node.phetioIsArchetype;
        }
        for(let i = 0; i < node.parents.length; i++){
            if (this.isInsidePhetioArchetype(node.parents[i])) {
                return true;
            }
        }
        return false;
    }
    /**
   * Alert on all interactive description utteranceQueues located on each connected Display. See
   * Node.getConnectedDisplays. Note that if your Node is not connected to a Display, this function will have
   * no effect.
   */ alertDescriptionUtterance(utterance) {
        // No description should be alerted if setting PhET-iO state, see https://github.com/phetsims/scenery/issues/1397
        if (isSettingPhetioStateProperty.value) {
            return;
        }
        // No description should be alerted if an archetype of a PhET-iO dynamic element, see https://github.com/phetsims/joist/issues/817
        if (Tandem.PHET_IO_ENABLED && this.isInsidePhetioArchetype()) {
            return;
        }
        const connectedDisplays = this.getConnectedDisplays();
        for(let i = 0; i < connectedDisplays.length; i++){
            const display = connectedDisplays[i];
            if (display.isAccessible()) {
                // Don't use `forEachUtterance` to prevent creating a closure for each usage of this function
                display.descriptionUtteranceQueue.addToBack(utterance);
            }
        }
    }
    /**
   * Apply a callback on each utteranceQueue that this Node has a connection to (via Display). Note that only
   * accessible Displays have utteranceQueues that this function will interface with.
   */ forEachUtteranceQueue(callback) {
        const connectedDisplays = this.getConnectedDisplays();
        // If you run into this assertion, talk to @jessegreenberg and @zepumph, because it is quite possible we would
        // remove this assertion for your case.
        assert && assert(connectedDisplays.length > 0, 'must be connected to a display to use UtteranceQueue features');
        for(let i = 0; i < connectedDisplays.length; i++){
            const display = connectedDisplays[i];
            if (display.isAccessible()) {
                callback(display.descriptionUtteranceQueue);
            }
        }
    }
    /***********************************************************************************************************/ // SCENERY-INTERNAL AND PRIVATE METHODS
    /***********************************************************************************************************/ /**
   * Used to get a list of all settable options and their current values. (scenery-internal)
   *
   * @returns - keys are all accessibility option keys, and the values are the values of those properties
   * on this Node.
   */ getBaseOptions() {
        const currentOptions = {};
        for(let i = 0; i < ACCESSIBILITY_OPTION_KEYS.length; i++){
            const optionName = ACCESSIBILITY_OPTION_KEYS[i];
            // @ts-expect-error - Not sure of a great way to do this
            currentOptions[optionName] = this[optionName];
        }
        return currentOptions;
    }
    /**
   * Returns a recursive data structure that represents the nested ordering of pdom content for this Node's
   * subtree. Each "Item" will have the type { trail: {Trail}, children: {Array.<Item>} }, forming a tree-like
   * structure. (scenery-internal)
   */ getNestedPDOMOrder() {
        const currentTrail = new Trail(this);
        let pruneStack = []; // A list of Nodes to prune
        // {Array.<Item>} - The main result we will be returning. It is the top-level array where child items will be
        // inserted.
        const result = [];
        // {Array.<Array.<Item>>} A stack of children arrays, where we should be inserting items into the top array.
        // We will start out with the result, and as nested levels are added, the children arrays of those items will be
        // pushed and poppped, so that the top array on this stack is where we should insert our next child item.
        const nestedChildStack = [
            result
        ];
        function addTrailsForNode(node, overridePruning) {
            // If subtrees were specified with pdomOrder, they should be skipped from the ordering of ancestor subtrees,
            // otherwise we could end up having multiple references to the same trail (which should be disallowed).
            let pruneCount = 0;
            // count the number of times our Node appears in the pruneStack
            _.each(pruneStack, (pruneNode)=>{
                if (node === pruneNode) {
                    pruneCount++;
                }
            });
            // If overridePruning is set, we ignore one reference to our Node in the prune stack. If there are two copies,
            // however, it means a Node was specified in a pdomOrder that already needs to be pruned (so we skip it instead
            // of creating duplicate references in the traversal order).
            if (pruneCount > 1 || pruneCount === 1 && !overridePruning) {
                return;
            }
            // Pushing item and its children array, if has pdom content
            if (node.hasPDOMContent) {
                const item = {
                    trail: currentTrail.copy(),
                    children: []
                };
                nestedChildStack[nestedChildStack.length - 1].push(item);
                nestedChildStack.push(item.children);
            }
            const arrayPDOMOrder = node._pdomOrder === null ? [] : node._pdomOrder;
            // push specific focused Nodes to the stack
            pruneStack = pruneStack.concat(arrayPDOMOrder);
            // Visiting trails to ordered Nodes.
            // @ts-expect-error
            _.each(arrayPDOMOrder, (descendant)=>{
                // Find all descendant references to the Node.
                // NOTE: We are not reordering trails (due to descendant constraints) if there is more than one instance for
                // this descendant Node.
                _.each(node.getLeafTrailsTo(descendant), (descendantTrail)=>{
                    descendantTrail.removeAncestor(); // strip off 'node', so that we handle only children
                    // same as the normal order, but adding a full trail (since we may be referencing a descendant Node)
                    currentTrail.addDescendantTrail(descendantTrail);
                    addTrailsForNode(descendant, true); // 'true' overrides one reference in the prune stack (added above)
                    currentTrail.removeDescendantTrail(descendantTrail);
                });
            });
            // Visit everything. If there is a pdomOrder, those trails were already visited, and will be excluded.
            const numChildren = node._children.length;
            for(let i = 0; i < numChildren; i++){
                const child = node._children[i];
                currentTrail.addDescendant(child, i);
                addTrailsForNode(child, false);
                currentTrail.removeDescendant();
            }
            // pop focused Nodes from the stack (that were added above)
            _.each(arrayPDOMOrder, ()=>{
                pruneStack.pop();
            });
            // Popping children array if has pdom content
            if (node.hasPDOMContent) {
                nestedChildStack.pop();
            }
        }
        addTrailsForNode(this, false);
        return result;
    }
    /**
   * Sets the pdom content for a Node. See constructor for more information. Not part of the ParallelDOM
   * API (scenery-internal)
   */ onPDOMContentChange() {
        PDOMTree.pdomContentChange(this);
        // recompute the heading level for this Node if it is using the pdomHeading API.
        this.pdomHeading && this.computeHeadingLevel();
        this.rendererSummaryRefreshEmitter.emit();
    }
    /**
   * Returns whether or not this Node has any representation for the Parallel DOM.
   * Note this is still true if the content is pdomVisible=false or is otherwise hidden.
   */ get hasPDOMContent() {
        return !!this._tagName;
    }
    /**
   * Called when the Node is added as a child to this Node AND the Node's subtree contains pdom content.
   * We need to notify all Displays that can see this change, so that they can update the PDOMInstance tree.
   */ onPDOMAddChild(node) {
        sceneryLog && sceneryLog.ParallelDOM && sceneryLog.ParallelDOM(`onPDOMAddChild n#${node.id} (parent:n#${this.id})`);
        sceneryLog && sceneryLog.ParallelDOM && sceneryLog.push();
        // Find descendants with pdomOrders and check them against all of their ancestors/self
        assert && function recur(descendant) {
            // Prune the search (because milliseconds don't grow on trees, even if we do have assertions enabled)
            if (descendant._rendererSummary.hasNoPDOM()) {
                return;
            }
            descendant.pdomOrder && assert(descendant.getTrails((node)=>_.includes(descendant.pdomOrder, node)).length === 0, 'pdomOrder should not include any ancestors or the Node itself');
        }(node);
        assert && PDOMTree.auditNodeForPDOMCycles(this);
        this._pdomDisplaysInfo.onAddChild(node);
        PDOMTree.addChild(this, node);
        sceneryLog && sceneryLog.ParallelDOM && sceneryLog.pop();
    }
    /**
   * Called when the Node is removed as a child from this Node AND the Node's subtree contains pdom content.
   * We need to notify all Displays that can see this change, so that they can update the PDOMInstance tree.
   */ onPDOMRemoveChild(node) {
        sceneryLog && sceneryLog.ParallelDOM && sceneryLog.ParallelDOM(`onPDOMRemoveChild n#${node.id} (parent:n#${this.id})`);
        sceneryLog && sceneryLog.ParallelDOM && sceneryLog.push();
        this._pdomDisplaysInfo.onRemoveChild(node);
        PDOMTree.removeChild(this, node);
        // make sure that the associations for aria-labelledby and aria-describedby are updated for Nodes associated
        // to this Node (they are pointing to this Node's IDs). https://github.com/phetsims/scenery/issues/816
        node.updateOtherNodesAriaLabelledby();
        node.updateOtherNodesAriaDescribedby();
        node.updateOtherNodesActiveDescendant();
        sceneryLog && sceneryLog.ParallelDOM && sceneryLog.pop();
    }
    /**
   * Called when this Node's children are reordered (with nothing added/removed).
   */ onPDOMReorderedChildren() {
        sceneryLog && sceneryLog.ParallelDOM && sceneryLog.ParallelDOM(`onPDOMReorderedChildren (parent:n#${this.id})`);
        sceneryLog && sceneryLog.ParallelDOM && sceneryLog.push();
        PDOMTree.childrenOrderChange(this);
        sceneryLog && sceneryLog.ParallelDOM && sceneryLog.pop();
    }
    /**
   * Handles linking and checking child PhET-iO Properties such as Node.visibleProperty and Node.enabledProperty.
   */ updateLinkedElementForProperty(tandemName, oldProperty, newProperty) {
        assert && assert(oldProperty !== newProperty, 'should not be called on same values');
        // Only update linked elements if this Node is instrumented for PhET-iO
        if (this.isPhetioInstrumented()) {
            oldProperty && oldProperty instanceof ReadOnlyProperty && oldProperty.isPhetioInstrumented() && oldProperty instanceof PhetioObject && this.removeLinkedElements(oldProperty);
            const tandem = this.tandem.createTandem(tandemName);
            if (newProperty && newProperty instanceof ReadOnlyProperty && newProperty.isPhetioInstrumented() && newProperty instanceof PhetioObject && tandem !== newProperty.tandem) {
                this.addLinkedElement(newProperty, {
                    tandemName: tandemName
                });
            }
        }
    }
    /*---------------------------------------------------------------------------*/ //
    // PDOM Instance handling
    /**
   * Returns a reference to the pdom instances array. (scenery-internal)
   */ getPDOMInstances() {
        return this._pdomInstances;
    }
    get pdomInstances() {
        return this.getPDOMInstances();
    }
    /**
   * Adds a PDOMInstance reference to our array. (scenery-internal)
   */ addPDOMInstance(pdomInstance) {
        this._pdomInstances.push(pdomInstance);
    }
    /**
   * Removes a PDOMInstance reference from our array. (scenery-internal)
   */ removePDOMInstance(pdomInstance) {
        const index = _.indexOf(this._pdomInstances, pdomInstance);
        assert && assert(index !== -1, 'Cannot remove a PDOMInstance from a Node if it was not there');
        this._pdomInstances.splice(index, 1);
    }
    static BASIC_ACCESSIBLE_NAME_BEHAVIOR(node, options, accessibleName) {
        if (node.labelTagName && PDOMUtils.tagNameSupportsContent(node.labelTagName)) {
            options.labelContent = accessibleName;
        } else if (node.tagName === 'input') {
            options.labelTagName = 'label';
            options.labelContent = accessibleName;
        } else if (PDOMUtils.tagNameSupportsContent(node.tagName)) {
            options.innerContent = accessibleName;
        } else {
            options.ariaLabel = accessibleName;
        }
        return options;
    }
    /**
   * A behavior function for accessible name so that when accessibleName is set on the provided Node, it will be forwarded
   * to otherNode. This is useful when a component is composed of other Nodes that implement the accessibility,
   * but the high level API should be available for the entire component.
   */ static forwardAccessibleName(node, otherNode) {
        ParallelDOM.useDefaultTagName(node);
        node.accessibleNameBehavior = (node, options, accessibleName, callbacksForOtherNodes)=>{
            callbacksForOtherNodes.push(()=>{
                otherNode.accessibleName = accessibleName;
            });
            return options;
        };
    }
    /**
   * A behavior function for help text so that when helpText is set on the provided 'node', it will be forwarded `otherNode`.
   * This is useful when a component is composed of other Nodes that implement the accessibility, but the high level API
   * should be available for the entire component.
   */ static forwardHelpText(node, otherNode) {
        ParallelDOM.useDefaultTagName(node);
        node.helpTextBehavior = (node, options, helpText, callbacksForOtherNodes)=>{
            callbacksForOtherNodes.push(()=>{
                otherNode.helpText = helpText;
            });
            return options;
        };
    }
    static HELP_TEXT_BEFORE_CONTENT(node, options, helpText) {
        options.descriptionTagName = PDOMUtils.DEFAULT_DESCRIPTION_TAG_NAME;
        options.descriptionContent = helpText;
        options.appendDescription = false;
        return options;
    }
    static HELP_TEXT_AFTER_CONTENT(node, options, helpText) {
        options.descriptionTagName = PDOMUtils.DEFAULT_DESCRIPTION_TAG_NAME;
        options.descriptionContent = helpText;
        options.appendDescription = true;
        return options;
    }
    /**
   * If the Node does not have a tagName yet, set it to the default.
   */ static useDefaultTagName(node) {
        if (!node.tagName) {
            node.tagName = DEFAULT_TAG_NAME;
        }
    }
    constructor(options){
        super(options), // The value of the input, only relevant if the tag name is of type "INPUT". Is a
        // string because the `value` attribute is a DOMString. null value indicates no value.
        this._inputValue = null, // The label content for this Node's DOM element.  There are multiple ways that a label
        // can be associated with a Node's dom element, see setLabelContent() for more documentation
        this._labelContent = null, // The inner label content for this Node's primary sibling. Set as inner HTML
        // or text content of the actual DOM element. If this is used, the Node should not have children.
        this._innerContent = null, // The description content for this Node's DOM element.
        this._descriptionContent = null, // If provided, "aria-label" will be added as an inline attribute on the Node's DOM
        // element and set to this value. This will determine how the Accessible Name is provided for the DOM element.
        this._ariaLabel = null, this._hasAppliedAriaLabel = false, // If provided, "aria-valuetext" will be added as an inline attribute on the Node's
        // primary sibling and set to this value. Setting back to null will clear this attribute in the view.
        this._ariaValueText = null, this._hasAppliedAriaValueText = false, // HIGHER LEVEL API INITIALIZATION
        // Sets the "Accessible Name" of the Node, as defined by the Browser's ParallelDOM Tree
        this._accessibleName = null, // Sets the help text of the Node, this most often corresponds to description text.
        this._helpText = null, // Sets the help text of the Node, this most often corresponds to label sibling text.
        this._pdomHeading = null, // Emits an event when the focus highlight is changed.
        this.focusHighlightChangedEmitter = new TinyEmitter(), // Emits an event when the pdom parent of this Node has changed
        this.pdomParentChangedEmitter = new TinyEmitter(), // Fired when the PDOM Displays for this Node have changed (see PDOMInstance)
        this.pdomDisplaysEmitter = new TinyEmitter();
        this._onPDOMContentChangeListener = this.onPDOMContentChange.bind(this);
        this._onInputValueChangeListener = this.invalidatePeerInputValue.bind(this);
        this._onAriaLabelChangeListener = this.onAriaLabelChange.bind(this);
        this._onAriaValueTextChangeListener = this.onAriaValueTextChange.bind(this);
        this._onLabelContentChangeListener = this.invalidatePeerLabelSiblingContent.bind(this);
        this._onDescriptionContentChangeListener = this.invalidatePeerDescriptionSiblingContent.bind(this);
        this._onInnerContentChangeListener = this.onInnerContentPropertyChange.bind(this);
        this._tagName = null;
        this._containerTagName = null;
        this._labelTagName = null;
        this._descriptionTagName = null;
        this._inputType = null;
        this._pdomChecked = false;
        this._appendLabel = false;
        this._appendDescription = false;
        this._pdomAttributes = [];
        this._pdomClasses = [];
        this._pdomNamespace = null;
        this._ariaRole = null;
        this._containerAriaRole = null;
        this._ariaLabelledbyAssociations = [];
        this._nodesThatAreAriaLabelledbyThisNode = [];
        this._ariaDescribedbyAssociations = [];
        this._nodesThatAreAriaDescribedbyThisNode = [];
        this._activeDescendantAssociations = [];
        this._nodesThatAreActiveDescendantToThisNode = [];
        this._focusableOverride = null;
        this._focusHighlight = null;
        this._focusHighlightLayerable = false;
        this._groupFocusHighlight = false;
        this._pdomOrder = null;
        this._pdomParent = null;
        this._pdomTransformSourceNode = null;
        this._focusPanTargetBoundsProperty = null;
        this._limitPanDirection = null;
        this._pdomDisplaysInfo = new PDOMDisplaysInfo(this);
        this._pdomInstances = [];
        this._positionInPDOM = false;
        this.excludeLabelSiblingFromInput = false;
        this._pdomVisibleProperty = new TinyForwardingProperty(true, false, this.onPdomVisiblePropertyChange.bind(this));
        // HIGHER LEVEL API INITIALIZATION
        this._accessibleNameBehavior = ParallelDOM.BASIC_ACCESSIBLE_NAME_BEHAVIOR;
        this._helpTextBehavior = ParallelDOM.HELP_TEXT_AFTER_CONTENT;
        this._headingLevel = null;
        this._pdomHeadingBehavior = DEFAULT_PDOM_HEADING_BEHAVIOR;
        this.pdomBoundInputEnabledListener = this.pdomInputEnabledListener.bind(this);
    }
};
export { ParallelDOM as default };
scenery.register('ParallelDOM', ParallelDOM);
export { ACCESSIBILITY_OPTION_KEYS };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BhcmFsbGVsRE9NLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgc3VwZXJjbGFzcyBmb3IgTm9kZSwgYWRkaW5nIGFjY2Vzc2liaWxpdHkgYnkgZGVmaW5pbmcgY29udGVudCBmb3IgdGhlIFBhcmFsbGVsIERPTS4gUGxlYXNlIG5vdGUgdGhhdCBOb2RlIGFuZFxuICogUGFyYWxsZWxET00gYXJlIGNsb3NlbHkgaW50ZXJ0d2luZWQsIHRob3VnaCB0aGV5IGFyZSBzZXBhcmF0ZWQgaW50byBzZXBhcmF0ZSBmaWxlcyBpbiB0aGUgdHlwZSBoaWVyYXJjaHkuXG4gKlxuICogVGhlIFBhcmFsbGVsIERPTSBpcyBhbiBIVE1MIHN0cnVjdHVyZSB0aGF0IHByb3ZpZGVzIHNlbWFudGljcyBmb3IgYXNzaXN0aXZlIHRlY2hub2xvZ2llcy4gRm9yIHdlYiBjb250ZW50IHRvIGJlXG4gKiBhY2Nlc3NpYmxlLCBhc3Npc3RpdmUgdGVjaG5vbG9naWVzIHJlcXVpcmUgSFRNTCBtYXJrdXAsIHdoaWNoIGlzIHNvbWV0aGluZyB0aGF0IHB1cmUgZ3JhcGhpY2FsIGNvbnRlbnQgZG9lcyBub3RcbiAqIGluY2x1ZGUuIFRoaXMgYWRkcyB0aGUgYWNjZXNzaWJsZSBIVE1MIGNvbnRlbnQgZm9yIGFueSBOb2RlIGluIHRoZSBzY2VuZSBncmFwaC5cbiAqXG4gKiBBbnkgTm9kZSBjYW4gaGF2ZSBwZG9tIGNvbnRlbnQsIGJ1dCB0aGV5IGhhdmUgdG8gb3B0IGludG8gaXQuIFRoZSBzdHJ1Y3R1cmUgb2YgdGhlIHBkb20gY29udGVudCB3aWxsXG4gKiBtYXRjaCB0aGUgc3RydWN0dXJlIG9mIHRoZSBzY2VuZSBncmFwaC5cbiAqXG4gKiBTYXkgd2UgaGF2ZSB0aGUgZm9sbG93aW5nIHNjZW5lIGdyYXBoOlxuICpcbiAqICAgQVxuICogIC8gXFxcbiAqIEIgICBDXG4gKiAgICAvIFxcXG4gKiAgIEQgICBFXG4gKiAgICAgICAgXFxcbiAqICAgICAgICAgRlxuICpcbiAqIEFuZCBzYXkgdGhhdCBub2RlcyBBLCBCLCBDLCBELCBhbmQgRiBzcGVjaWZ5IHBkb20gY29udGVudCBmb3IgdGhlIERPTS4gIFNjZW5lcnkgd2lsbCByZW5kZXIgdGhlIHBkb21cbiAqIGNvbnRlbnQgbGlrZSBzbzpcbiAqXG4gKiA8ZGl2IGlkPVwibm9kZS1BXCI+XG4gKiAgIDxkaXYgaWQ9XCJub2RlLUJcIj48L2Rpdj5cbiAqICAgPGRpdiBpZD1cIm5vZGUtQ1wiPlxuICogICAgIDxkaXYgaWQ9XCJub2RlLURcIj48L2Rpdj5cbiAqICAgICA8ZGl2IGlkPVwibm9kZS1GXCI+PC9kaXY+XG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKlxuICogSW4gdGhpcyBleGFtcGxlLCBlYWNoIGVsZW1lbnQgaXMgcmVwcmVzZW50ZWQgYnkgYSBkaXYsIGJ1dCBhbnkgSFRNTCBlbGVtZW50IGNvdWxkIGJlIHVzZWQuIE5vdGUgdGhhdCBpbiB0aGlzIGV4YW1wbGUsXG4gKiBub2RlIEUgZGlkIG5vdCBzcGVjaWZ5IHBkb20gY29udGVudCwgc28gbm9kZSBGIHdhcyBhZGRlZCBhcyBhIGNoaWxkIHVuZGVyIG5vZGUgQy4gIElmIG5vZGUgRSBoYWQgc3BlY2lmaWVkXG4gKiBwZG9tIGNvbnRlbnQsIGNvbnRlbnQgZm9yIG5vZGUgRiB3b3VsZCBoYXZlIGJlZW4gYWRkZWQgYXMgYSBjaGlsZCB1bmRlciB0aGUgY29udGVudCBmb3Igbm9kZSBFLlxuICpcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAjQkFTSUMgRVhBTVBMRVxuICpcbiAqIEluIGEgYmFzaWMgZXhhbXBsZSBsZXQncyBzYXkgdGhhdCB3ZSB3YW50IHRvIG1ha2UgYSBOb2RlIGFuIHVub3JkZXJlZCBsaXN0LiBUbyBkbyB0aGlzLCBhZGQgdGhlIGB0YWdOYW1lYCBvcHRpb24gdG9cbiAqIHRoZSBOb2RlLCBhbmQgYXNzaWduIGl0IHRvIHRoZSBzdHJpbmcgXCJ1bFwiLiBIZXJlIGlzIHdoYXQgdGhlIGNvZGUgY291bGQgbG9vayBsaWtlOlxuICpcbiAqIHZhciBteVVub3JkZXJlZExpc3QgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAndWwnIH0gKTtcbiAqXG4gKiBUbyBnZXQgdGhlIGRlc2lyZWQgbGlzdCBodG1sLCB3ZSBjYW4gYXNzaWduIHRoZSBgbGlgIGB0YWdOYW1lYCB0byBjaGlsZHJlbiBOb2RlcywgbGlrZTpcbiAqXG4gKiB2YXIgbGlzdEl0ZW0xID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2xpJyB9ICk7XG4gKiBteVVub3JkZXJlZExpc3QuYWRkQ2hpbGQoIGxpc3RJdGVtMSApO1xuICpcbiAqIE5vdyB3ZSBoYXZlIGEgc2luZ2xlIGxpc3QgZWxlbWVudCBpbiB0aGUgdW5vcmRlcmVkIGxpc3QuIFRvIGFzc2lnbiBjb250ZW50IHRvIHRoaXMgPGxpPiwgdXNlIHRoZSBgaW5uZXJDb250ZW50YFxuICogb3B0aW9uIChhbGwgb2YgdGhlc2UgTm9kZSBvcHRpb25zIGhhdmUgZ2V0dGVycyBhbmQgc2V0dGVycywganVzdCBsaWtlIGFueSBvdGhlciBOb2RlIG9wdGlvbik6XG4gKlxuICogbGlzdEl0ZW0xLmlubmVyQ29udGVudCA9ICdJIGFtIGxpc3QgaXRlbSBudW1iZXIgMSc7XG4gKlxuICogVGhlIGFib3ZlIG9wZXJhdGlvbnMgd2lsbCBjcmVhdGUgdGhlIGZvbGxvd2luZyBQRE9NIHN0cnVjdHVyZSAobm90ZSB0aGF0IGFjdHVhbCBpZHMgd2lsbCBiZSBkaWZmZXJlbnQpOlxuICpcbiAqIDx1bCBpZD0nbXlVbm9yZGVyZWRMaXN0Jz5cbiAqICAgPGxpPkkgYW0gYSBsaXN0IGl0ZW0gbnVtYmVyIDE8L2xpPlxuICogPC91bFxuICpcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAjRE9NIFNJQkxJTkdTXG4gKlxuICogVGhlIEFQSSBpbiB0aGlzIGNsYXNzIGFsbG93cyB5b3UgdG8gYWRkIGFkZGl0aW9uYWwgc3RydWN0dXJlIHRvIHRoZSBhY2Nlc3NpYmxlIERPTSBjb250ZW50IGlmIG5lY2Vzc2FyeS4gRWFjaCBub2RlXG4gKiBjYW4gaGF2ZSBtdWx0aXBsZSBET00gRWxlbWVudHMgYXNzb2NpYXRlZCB3aXRoIGl0LiBBIE5vZGUgY2FuIGhhdmUgYSBsYWJlbCBET00gZWxlbWVudCwgYW5kIGEgZGVzY3JpcHRpb24gRE9NIGVsZW1lbnQuXG4gKiBUaGVzZSBhcmUgY2FsbGVkIHNpYmxpbmdzLiBUaGUgTm9kZSdzIGRpcmVjdCBET00gZWxlbWVudCAodGhlIERPTSBlbGVtZW50IHlvdSBjcmVhdGUgd2l0aCB0aGUgYHRhZ05hbWVgIG9wdGlvbilcbiAqIGlzIGNhbGxlZCB0aGUgXCJwcmltYXJ5IHNpYmxpbmcuXCIgWW91IGNhbiBhbHNvIGhhdmUgYSBjb250YWluZXIgcGFyZW50IERPTSBlbGVtZW50IHRoYXQgc3Vycm91bmRzIGFsbCBvZiB0aGVzZVxuICogc2libGluZ3MuIFdpdGggdGhyZWUgc2libGluZ3MgYW5kIGEgY29udGFpbmVyIHBhcmVudCwgZWFjaCBOb2RlIGNhbiBoYXZlIHVwIHRvIDQgRE9NIEVsZW1lbnRzIHJlcHJlc2VudGluZyBpdCBpbiB0aGVcbiAqIFBET00uIEhlcmUgaXMgYW4gZXhhbXBsZSBvZiBob3cgYSBOb2RlIG1heSB1c2UgdGhlc2UgZmVhdHVyZXM6XG4gKlxuICogPGRpdj5cbiAqICAgPGxhYmVsIGZvcj1cIm15SW5wdXRcIj5UaGlzIGdyZWF0IGxhYmVsIGZvciBpbnB1dDwvbGFiZWxcbiAqICAgPGlucHV0IGlkPVwibXlJbnB1dFwiLz5cbiAqICAgPHA+VGhpcyBpcyBhIGRlc2NyaXB0aW9uIGZvciB0aGUgaW5wdXQ8L3A+XG4gKiA8L2Rpdj5cbiAqXG4gKiBBbHRob3VnaCB5b3UgY2FuIGNyZWF0ZSB0aGlzIHN0cnVjdHVyZSB3aXRoIGZvdXIgbm9kZXMgKGBpbnB1dGAgQSwgYGxhYmVsIEIsIGFuZCBgcGAgQyBjaGlsZHJlbiB0byBgZGl2YCBEKSxcbiAqIHRoaXMgc3RydWN0dXJlIGNhbiBiZSBjcmVhdGVkIHdpdGggb25lIHNpbmdsZSBOb2RlLiBJdCBpcyBvZnRlbiBwcmVmZXJhYmxlIHRvIGRvIHRoaXMgdG8gbGltaXQgdGhlIG51bWJlciBvZiBuZXdcbiAqIE5vZGVzIHRoYXQgaGF2ZSB0byBiZSBjcmVhdGVkIGp1c3QgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuIFRvIGFjY29tcGxpc2ggdGhpcyB3ZSBoYXZlIHRoZSBmb2xsb3dpbmcgTm9kZSBjb2RlLlxuICpcbiAqIG5ldyBOb2RlKCB7XG4gKiAgdGFnTmFtZTogJ2lucHV0J1xuICogIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcbiAqICBsYWJlbENvbnRlbnQ6ICdUaGlzIGdyZWF0IGxhYmVsIGZvciBpbnB1dCdcbiAqICBkZXNjcmlwdGlvblRhZ05hbWU6ICdwJyxcbiAqICBkZXNjcmlwdGlvbkNvbnRlbnQ6ICdUaGlzIGlzIGEgZGVzY3JpcHRpb24gZm9yIHRoZSBpbnB1dCcsXG4gKiAgY29udGFpbmVyVGFnTmFtZTogJ2RpdidcbiAqIH0pO1xuICpcbiAqIEEgZmV3IG5vdGVzOlxuICogMS4gT25seSB0aGUgcHJpbWFyeSBzaWJsaW5nIChzcGVjaWZpZWQgYnkgdGFnTmFtZSkgaXMgZm9jdXNhYmxlLiBVc2luZyBhIGZvY3VzYWJsZSBlbGVtZW50IHRocm91Z2ggYW5vdGhlciBlbGVtZW50XG4gKiAgICAobGlrZSBsYWJlbFRhZ05hbWUpIHdpbGwgcmVzdWx0IGluIGJ1Z2d5IGJlaGF2aW9yLlxuICogMi4gTm90aWNlIHRoZSBuYW1lcyBvZiB0aGUgY29udGVudCBzZXR0ZXJzIGZvciBzaWJsaW5ncyBwYXJhbGxlbCB0aGUgYGlubmVyQ29udGVudGAgb3B0aW9uIGZvciBzZXR0aW5nIHRoZSBwcmltYXJ5XG4gKiAgICBzaWJsaW5nLlxuICogMy4gVG8gbWFrZSB0aGlzIGV4YW1wbGUgYWN0dWFsbHkgd29yaywgeW91IHdvdWxkIG5lZWQgdGhlIGBpbnB1dFR5cGVgIG9wdGlvbiB0byBzZXQgdGhlIFwidHlwZVwiIGF0dHJpYnV0ZSBvbiB0aGUgYGlucHV0YC5cbiAqIDQuIFdoZW4geW91IHNwZWNpZnkgdGhlICA8bGFiZWw+IHRhZyBmb3IgdGhlIGxhYmVsIHNpYmxpbmcsIHRoZSBcImZvclwiIGF0dHJpYnV0ZSBpcyBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHRoZSBzaWJsaW5nLlxuICogNS4gRmluYWxseSwgdGhlIGV4YW1wbGUgYWJvdmUgZG9lc24ndCB1dGlsaXplIHRoZSBkZWZhdWx0IHRhZ3MgdGhhdCB3ZSBoYXZlIGluIHBsYWNlIGZvciB0aGUgcGFyZW50IGFuZCBzaWJsaW5ncy5cbiAqICAgICAgZGVmYXVsdCBsYWJlbFRhZ05hbWU6ICdwJ1xuICogICAgICBkZWZhdWx0IGRlc2NyaXB0aW9uVGFnTmFtZTogJ3AnXG4gKiAgICAgIGRlZmF1bHQgY29udGFpbmVyVGFnTmFtZTogJ2RpdidcbiAqICAgIHNvIHRoZSBmb2xsb3dpbmcgd2lsbCB5aWVsZCB0aGUgc2FtZSBQRE9NIHN0cnVjdHVyZTpcbiAqXG4gKiAgICBuZXcgTm9kZSgge1xuICogICAgIHRhZ05hbWU6ICdpbnB1dCcsXG4gKiAgICAgbGFiZWxUYWdOYW1lOiAnbGFiZWwnLFxuICogICAgIGxhYmVsQ29udGVudDogJ1RoaXMgZ3JlYXQgbGFiZWwgZm9yIGlucHV0J1xuICogICAgIGRlc2NyaXB0aW9uQ29udGVudDogJ1RoaXMgaXMgYSBkZXNjcmlwdGlvbiBmb3IgdGhlIGlucHV0JyxcbiAqICAgIH0pO1xuICpcbiAqIFRoZSBQYXJhbGxlbERPTSBjbGFzcyBpcyBzbWFydCBlbm91Z2ggdG8ga25vdyB3aGVuIHRoZXJlIG5lZWRzIHRvIGJlIGEgY29udGFpbmVyIHBhcmVudCB0byB3cmFwIG11bHRpcGxlIHNpYmxpbmdzLFxuICogaXQgaXMgbm90IG5lY2Vzc2FyeSB0byB1c2UgdGhhdCBvcHRpb24gdW5sZXNzIHRoZSBkZXNpcmVkIHRhZyBuYW1lIGlzICBzb21ldGhpbmcgb3RoZXIgdGhhbiAnZGl2Jy5cbiAqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogI0lucHV0IGxpc3RlbmVyc1xuICogUGFyYWxsZWxET00gaXMgdGhlIHByaW1hcnkgd2F5IHdlIGxpc3RlbiB0byBrZXlib2FyZCBldmVudHMgaW4gc2NlbmVyeS4gU2VlIFRJbnB1dExpc3RlbmVyIGZvciBzdXBwb3J0ZWQga2V5Ym9hcmRcbiAqIGV2ZW50cyB0aGF0IHlvdSBjYW4gYWRkLiBOb3RlIHRoYXQgdGhlIGlucHV0IGV2ZW50cyBmcm9tIHRoZSBET00gdGhhdCB5b3VyIFBhcmFsbGVsRE9NIGluc3RhbmNlIHdpbGwgcmVjZWl2ZSBpc1xuICogZGVwZW5kZW50IG9uIHdoYXQgdGhlIERPTSBFbGVtZW50IGlzIChzZWUgdGFnTmFtZSkuXG4gKlxuICogTk9URTogQmUgVkVSWSBjYXJlZnVsIGFib3V0IG11dGF0aW5nIFBhcmFsbGVsRE9NIGNvbnRlbnQgaW4gaW5wdXQgbGlzdGVuZXJzLCB0aGlzIGNhbiByZXN1bHQgaW4gZXZlbnRzIGJlaW5nIGRyb3BwZWQuXG4gKiBGb3IgZXhhbXBsZSwgaWYgeW91IHByZXNzIGVudGVyIG9uIGEgJ2J1dHRvbicsIHlvdSB3b3VsZCBleHBlY3QgYSBrZXlkb3duIGV2ZW50IGZvbGxvd2VkIGJ5IGEgY2xpY2sgZXZlbnQsIGJ1dCBpZiB0aGVcbiAqIGtleWRvd24gbGlzdGVuZXIgY2hhbmdlcyB0aGUgdGFnTmFtZSB0byAnZGl2JywgdGhlIGNsaWNrIGV2ZW50IHdpbGwgbm90IG9jY3VyLlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqXG4gKiBGb3IgYWRkaXRpb25hbCBhY2Nlc3NpYmlsaXR5IG9wdGlvbnMsIHBsZWFzZSBzZWUgdGhlIG9wdGlvbnMgbGlzdGVkIGluIEFDQ0VTU0lCSUxJVFlfT1BUSU9OX0tFWVMuIFRvIHVuZGVyc3RhbmQgdGhlXG4gKiBQRE9NIG1vcmUsIHNlZSBQRE9NUGVlciwgd2hpY2ggbWFuYWdlcyB0aGUgRE9NIEVsZW1lbnRzIGZvciBhIE5vZGUuIEZvciBtb3JlIGRvY3VtZW50YXRpb24gb24gU2NlbmVyeSwgTm9kZXMsXG4gKiBhbmQgdGhlIHNjZW5lIGdyYXBoLCBwbGVhc2Ugc2VlIGh0dHA6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcbmltcG9ydCBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVGlueUZvcndhcmRpbmdQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSwgeyBpc1RSZWFkT25seVByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy92YWxpZGF0ZS5qcyc7XG5pbXBvcnQgVmFsaWRhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1ZhbGlkYXRpb24uanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGFycmF5RGlmZmVyZW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlEaWZmZXJlbmNlLmpzJztcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrT3B0aW9uYWwgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tPcHRpb25hbC5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgeyBUQWxlcnRhYmxlIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XG5pbXBvcnQgVXR0ZXJhbmNlUXVldWUgZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZVF1ZXVlLmpzJztcbmltcG9ydCB7IE5vZGUsIFBET01EaXNwbGF5c0luZm8sIFBET01JbnN0YW5jZSwgUERPTVBlZXIsIFBET01UcmVlLCBQRE9NVXRpbHMsIHNjZW5lcnksIFRyYWlsIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBIaWdobGlnaHQgfSBmcm9tICcuLi8uLi9vdmVybGF5cy9IaWdobGlnaHRPdmVybGF5LmpzJztcblxuY29uc3QgSU5QVVRfVEFHID0gUERPTVV0aWxzLlRBR1MuSU5QVVQ7XG5jb25zdCBQX1RBRyA9IFBET01VdGlscy5UQUdTLlA7XG5jb25zdCBESVZfVEFHID0gUERPTVV0aWxzLlRBR1MuRElWO1xuXG4vLyBkZWZhdWx0IHRhZyBuYW1lcyBmb3Igc2libGluZ3NcbmNvbnN0IERFRkFVTFRfVEFHX05BTUUgPSBESVZfVEFHO1xuY29uc3QgREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSA9IFBfVEFHO1xuY29uc3QgREVGQVVMVF9MQUJFTF9UQUdfTkFNRSA9IFBfVEFHO1xuXG5leHBvcnQgdHlwZSBQRE9NVmFsdWVUeXBlID0gc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcbmV4cG9ydCB0eXBlIExpbWl0UGFuRGlyZWN0aW9uID0gJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJztcblxuLy8gc2VlIHNldFBET01IZWFkaW5nQmVoYXZpb3IgZm9yIG1vcmUgZGV0YWlsc1xuY29uc3QgREVGQVVMVF9QRE9NX0hFQURJTkdfQkVIQVZJT1IgPSAoIG5vZGU6IE5vZGUsIG9wdGlvbnM6IFBhcmFsbGVsRE9NT3B0aW9ucywgaGVhZGluZzogUERPTVZhbHVlVHlwZSApID0+IHtcblxuICBvcHRpb25zLmxhYmVsVGFnTmFtZSA9IGBoJHtub2RlLmhlYWRpbmdMZXZlbH1gOyAvLyBUT0RPOiBtYWtlIHN1cmUgaGVhZGluZyBsZXZlbCBjaGFuZ2UgZmlyZXMgYSBmdWxsIHBlZXIgcmVidWlsZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcbiAgb3B0aW9ucy5sYWJlbENvbnRlbnQgPSBoZWFkaW5nO1xuICByZXR1cm4gb3B0aW9ucztcbn07XG5cbmNvbnN0IHVud3JhcFByb3BlcnR5ID0gKCB2YWx1ZU9yUHJvcGVydHk6IFBET01WYWx1ZVR5cGUgfCBudWxsICk6IHN0cmluZyB8IG51bGwgPT4ge1xuICBjb25zdCByZXN1bHQgPSB2YWx1ZU9yUHJvcGVydHkgPT09IG51bGwgPyBudWxsIDogKCB0eXBlb2YgdmFsdWVPclByb3BlcnR5ID09PSAnc3RyaW5nJyA/IHZhbHVlT3JQcm9wZXJ0eSA6IHZhbHVlT3JQcm9wZXJ0eS52YWx1ZSApO1xuXG4gIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdCA9PT0gbnVsbCB8fCB0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJyApO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyB0aGVzZSBlbGVtZW50cyBhcmUgdHlwaWNhbGx5IGFzc29jaWF0ZWQgd2l0aCBmb3JtcywgYW5kIHN1cHBvcnQgY2VydGFpbiBhdHRyaWJ1dGVzXG5jb25zdCBGT1JNX0VMRU1FTlRTID0gUERPTVV0aWxzLkZPUk1fRUxFTUVOVFM7XG5cbi8vIGxpc3Qgb2YgaW5wdXQgXCJ0eXBlXCIgYXR0cmlidXRlIHZhbHVlcyB0aGF0IHN1cHBvcnQgdGhlIFwiY2hlY2tlZFwiIGF0dHJpYnV0ZVxuY29uc3QgSU5QVVRfVFlQRVNfVEhBVF9TVVBQT1JUX0NIRUNLRUQgPSBQRE9NVXRpbHMuSU5QVVRfVFlQRVNfVEhBVF9TVVBQT1JUX0NIRUNLRUQ7XG5cbi8vIEhUTUxFbGVtZW50IGF0dHJpYnV0ZXMgd2hvc2UgdmFsdWUgaXMgYW4gSUQgb2YgYW5vdGhlciBlbGVtZW50XG5jb25zdCBBU1NPQ0lBVElPTl9BVFRSSUJVVEVTID0gUERPTVV0aWxzLkFTU09DSUFUSU9OX0FUVFJJQlVURVM7XG5cbi8vIFRoZSBvcHRpb25zIGZvciB0aGUgUGFyYWxsZWxET00gQVBJLiBJbiBnZW5lcmFsLCBtb3N0IGRlZmF1bHQgdG8gbnVsbDsgdG8gY2xlYXIsIHNldCBiYWNrIHRvIG51bGwuIEVhY2ggb25lIG9mXG4vLyB0aGVzZSBoYXMgYW4gYXNzb2NpYXRlZCBzZXR0ZXIsIHNlZSBzZXR0ZXIgZnVuY3Rpb25zIGZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGVhY2guXG5jb25zdCBBQ0NFU1NJQklMSVRZX09QVElPTl9LRVlTID0gW1xuXG4gIC8vIE9yZGVyIG1hdHRlcnMuIEhhdmluZyBmb2N1cyBiZWZvcmUgdGFnTmFtZSBjb3ZlcnMgdGhlIGNhc2Ugd2hlcmUgeW91IGNoYW5nZSB0aGUgdGFnTmFtZSBhbmQgZm9jdXNhYmlsaXR5IG9mIGFcbiAgLy8gY3VycmVudGx5IGZvY3VzZWQgTm9kZS4gV2Ugd2FudCB0aGUgZm9jdXNhYmlsaXR5IHRvIHVwZGF0ZSBjb3JyZWN0bHkuXG4gICdmb2N1c2FibGUnLFxuICAndGFnTmFtZScsXG5cbiAgLypcbiAgICogSGlnaGVyIExldmVsIEFQSSBGdW5jdGlvbnNcbiAgICovXG4gICdhY2Nlc3NpYmxlTmFtZScsXG4gICdhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yJyxcbiAgJ2hlbHBUZXh0JyxcbiAgJ2hlbHBUZXh0QmVoYXZpb3InLFxuICAncGRvbUhlYWRpbmcnLFxuICAncGRvbUhlYWRpbmdCZWhhdmlvcicsXG5cbiAgLypcbiAgICogTG93ZXIgTGV2ZWwgQVBJIEZ1bmN0aW9uc1xuICAgKi9cbiAgJ2NvbnRhaW5lclRhZ05hbWUnLFxuICAnY29udGFpbmVyQXJpYVJvbGUnLFxuXG4gICdpbm5lckNvbnRlbnQnLFxuICAnaW5wdXRUeXBlJyxcbiAgJ2lucHV0VmFsdWUnLFxuICAncGRvbUNoZWNrZWQnLFxuICAncGRvbU5hbWVzcGFjZScsXG4gICdhcmlhTGFiZWwnLFxuICAnYXJpYVJvbGUnLFxuICAnYXJpYVZhbHVlVGV4dCcsXG5cbiAgJ2xhYmVsVGFnTmFtZScsXG4gICdsYWJlbENvbnRlbnQnLFxuICAnYXBwZW5kTGFiZWwnLFxuXG4gICdkZXNjcmlwdGlvblRhZ05hbWUnLFxuICAnZGVzY3JpcHRpb25Db250ZW50JyxcbiAgJ2FwcGVuZERlc2NyaXB0aW9uJyxcblxuICAnZm9jdXNIaWdobGlnaHQnLFxuICAnZm9jdXNIaWdobGlnaHRMYXllcmFibGUnLFxuICAnZ3JvdXBGb2N1c0hpZ2hsaWdodCcsXG4gICdwZG9tVmlzaWJsZVByb3BlcnR5JyxcbiAgJ3Bkb21WaXNpYmxlJyxcbiAgJ3Bkb21PcmRlcicsXG5cbiAgJ2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zJyxcbiAgJ2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucycsXG4gICdhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zJyxcblxuICAnZm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eScsXG4gICdsaW1pdFBhbkRpcmVjdGlvbicsXG5cbiAgJ3Bvc2l0aW9uSW5QRE9NJyxcblxuICAncGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUnXG5dO1xuXG50eXBlIFBhcmFsbGVsRE9NU2VsZk9wdGlvbnMgPSB7XG4gIGZvY3VzYWJsZT86IGJvb2xlYW4gfCBudWxsOyAvLyBTZXRzIHdoZXRoZXIgdGhlIE5vZGUgY2FuIHJlY2VpdmUga2V5Ym9hcmQgZm9jdXNcbiAgdGFnTmFtZT86IHN0cmluZyB8IG51bGw7IC8vIFNldHMgdGhlIHRhZyBuYW1lIGZvciB0aGUgcHJpbWFyeSBzaWJsaW5nIERPTSBlbGVtZW50IGluIHRoZSBwYXJhbGxlbCBET00sIHNob3VsZCBiZSBmaXJzdFxuXG4gIC8qXG4gICAqIEhpZ2hlciBMZXZlbCBBUEkgRnVuY3Rpb25zXG4gICAqL1xuICBhY2Nlc3NpYmxlTmFtZT86IFBET01WYWx1ZVR5cGUgfCBudWxsOyAvLyBTZXRzIHRoZSBhY2Nlc3NpYmxlIG5hbWUgZm9yIHRoaXMgTm9kZSwgc2VlIHNldEFjY2Vzc2libGVOYW1lKCkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIGhlbHBUZXh0PzogUERPTVZhbHVlVHlwZSB8IG51bGw7IC8vIFNldHMgdGhlIGhlbHAgdGV4dCBmb3IgdGhpcyBOb2RlLCBzZWUgc2V0SGVscFRleHQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICBwZG9tSGVhZGluZz86IFBET01WYWx1ZVR5cGUgfCBudWxsOyAvLyBAZXhwZXJpbWVudGFsIC0gbm90IHJlYWR5IGZvciB1c2VcblxuICAvKlxuICAgKiBMb3dlciBMZXZlbCBBUEkgRnVuY3Rpb25zXG4gICAqL1xuICBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yPzogUERPTUJlaGF2aW9yRnVuY3Rpb247IC8vIFNldHMgdGhlIGltcGxlbWVudGF0aW9uIGZvciB0aGUgYWNjZXNzaWJsZU5hbWUsIHNlZSBzZXRBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgaGVscFRleHRCZWhhdmlvcj86IFBET01CZWhhdmlvckZ1bmN0aW9uOyAvLyBTZXRzIHRoZSBpbXBsZW1lbnRhdGlvbiBmb3IgdGhlIGhlbHBUZXh0LCBzZWUgc2V0SGVscFRleHRCZWhhdmlvcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gIHBkb21IZWFkaW5nQmVoYXZpb3I/OiBQRE9NQmVoYXZpb3JGdW5jdGlvbjsgLy8gQGV4cGVyaW1lbnRhbCAtIG5vdCByZWFkeSBmb3IgdXNlXG5cbiAgY29udGFpbmVyVGFnTmFtZT86IHN0cmluZyB8IG51bGw7IC8vIFNldHMgdGhlIHRhZyBuYW1lIGZvciBhbiBbb3B0aW9uYWxdIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGlzIE5vZGUncyBzaWJsaW5nc1xuICBjb250YWluZXJBcmlhUm9sZT86IHN0cmluZyB8IG51bGw7IC8vIFNldHMgdGhlIEFSSUEgcm9sZSBmb3IgdGhlIGNvbnRhaW5lciBwYXJlbnQgRE9NIGVsZW1lbnRcblxuICBpbm5lckNvbnRlbnQ/OiBQRE9NVmFsdWVUeXBlIHwgbnVsbDsgLy8gU2V0cyB0aGUgaW5uZXIgdGV4dCBvciBIVE1MIGZvciBhIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcgZWxlbWVudFxuICBpbnB1dFR5cGU/OiBzdHJpbmcgfCBudWxsOyAvLyBTZXRzIHRoZSBpbnB1dCB0eXBlIGZvciB0aGUgcHJpbWFyeSBzaWJsaW5nIERPTSBlbGVtZW50LCBvbmx5IHJlbGV2YW50IGlmIHRhZ05hbWUgaXMgJ2lucHV0J1xuICBpbnB1dFZhbHVlPzogUERPTVZhbHVlVHlwZSB8IG51bGwgfCBudW1iZXI7IC8vIFNldHMgdGhlIGlucHV0IHZhbHVlIGZvciB0aGUgcHJpbWFyeSBzaWJsaW5nIERPTSBlbGVtZW50LCBvbmx5IHJlbGV2YW50IGlmIHRhZ05hbWUgaXMgJ2lucHV0J1xuICBwZG9tQ2hlY2tlZD86IGJvb2xlYW47IC8vIFNldHMgdGhlICdjaGVja2VkJyBzdGF0ZSBmb3IgaW5wdXRzIG9mIHR5cGUgJ3JhZGlvJyBhbmQgJ2NoZWNrYm94J1xuICBwZG9tTmFtZXNwYWNlPzogc3RyaW5nIHwgbnVsbDsgLy8gU2V0cyB0aGUgbmFtZXNwYWNlIGZvciB0aGUgcHJpbWFyeSBlbGVtZW50XG4gIGFyaWFMYWJlbD86IFBET01WYWx1ZVR5cGUgfCBudWxsOyAvLyBTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgJ2FyaWEtbGFiZWwnIGF0dHJpYnV0ZSBvbiB0aGUgcHJpbWFyeSBzaWJsaW5nIG9mIHRoaXMgTm9kZVxuICBhcmlhUm9sZT86IHN0cmluZyB8IG51bGw7IC8vIFNldHMgdGhlIEFSSUEgcm9sZSBmb3IgdGhlIHByaW1hcnkgc2libGluZyBvZiB0aGlzIE5vZGVcbiAgYXJpYVZhbHVlVGV4dD86IFBET01WYWx1ZVR5cGUgfCBudWxsOyAvLyBzZXRzIHRoZSBhcmlhLXZhbHVldGV4dCBhdHRyaWJ1dGUgb2YgdGhlIHByaW1hcnkgc2libGluZ1xuXG4gIGxhYmVsVGFnTmFtZT86IHN0cmluZyB8IG51bGw7IC8vIFNldHMgdGhlIHRhZyBuYW1lIGZvciB0aGUgRE9NIGVsZW1lbnQgc2libGluZyBsYWJlbGluZyB0aGlzIE5vZGVcbiAgbGFiZWxDb250ZW50PzogUERPTVZhbHVlVHlwZSB8IG51bGw7IC8vIFNldHMgdGhlIGxhYmVsIGNvbnRlbnQgZm9yIHRoZSBOb2RlXG4gIGFwcGVuZExhYmVsPzogYm9vbGVhbjsgLy8gU2V0cyB0aGUgbGFiZWwgc2libGluZyB0byBjb21lIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcgaW4gdGhlIFBET01cblxuICBkZXNjcmlwdGlvblRhZ05hbWU/OiBzdHJpbmcgfCBudWxsOyAvLyBTZXRzIHRoZSB0YWcgbmFtZSBmb3IgdGhlIERPTSBlbGVtZW50IHNpYmxpbmcgZGVzY3JpYmluZyB0aGlzIE5vZGVcbiAgZGVzY3JpcHRpb25Db250ZW50PzogUERPTVZhbHVlVHlwZSB8IG51bGw7IC8vIFNldHMgdGhlIGRlc2NyaXB0aW9uIGNvbnRlbnQgZm9yIHRoZSBOb2RlXG4gIGFwcGVuZERlc2NyaXB0aW9uPzogYm9vbGVhbjsgLy8gU2V0cyB0aGUgZGVzY3JpcHRpb24gc2libGluZyB0byBjb21lIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcgaW4gdGhlIFBET01cblxuICBmb2N1c0hpZ2hsaWdodD86IEhpZ2hsaWdodDsgLy8gU2V0cyB0aGUgZm9jdXMgaGlnaGxpZ2h0IGZvciB0aGUgTm9kZVxuICBmb2N1c0hpZ2hsaWdodExheWVyYWJsZT86IGJvb2xlYW47IC8vbGFnIHRvIGRldGVybWluZSBpZiB0aGUgZm9jdXMgaGlnaGxpZ2h0IE5vZGUgY2FuIGJlIGxheWVyZWQgaW4gdGhlIHNjZW5lIGdyYXBoXG4gIGdyb3VwRm9jdXNIaWdobGlnaHQ/OiBOb2RlIHwgYm9vbGVhbjsgLy8gU2V0cyB0aGUgb3V0ZXIgZm9jdXMgaGlnaGxpZ2h0IGZvciB0aGlzIE5vZGUgd2hlbiBhIGRlc2NlbmRhbnQgaGFzIGZvY3VzXG4gIHBkb21WaXNpYmxlUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGw7XG4gIHBkb21WaXNpYmxlPzogYm9vbGVhbjsgLy8gU2V0cyB3aGV0aGVyIG9yIG5vdCB0aGUgTm9kZSdzIERPTSBlbGVtZW50IGlzIHZpc2libGUgaW4gdGhlIHBhcmFsbGVsIERPTVxuICBwZG9tT3JkZXI/OiAoIE5vZGUgfCBudWxsIClbXSB8IG51bGw7IC8vIE1vZGlmaWVzIHRoZSBvcmRlciBvZiBhY2Nlc3NpYmxlIG5hdmlnYXRpb25cblxuICBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucz86IEFzc29jaWF0aW9uW107IC8vIHNldHMgdGhlIGxpc3Qgb2YgYXJpYS1sYWJlbGxlZGJ5IGFzc29jaWF0aW9ucyBiZXR3ZWVuIGZyb20gdGhpcyBOb2RlIHRvIG90aGVycyAoaW5jbHVkaW5nIGl0c2VsZilcbiAgYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zPzogQXNzb2NpYXRpb25bXTsgLy8gc2V0cyB0aGUgbGlzdCBvZiBhcmlhLWRlc2NyaWJlZGJ5IGFzc29jaWF0aW9ucyBiZXR3ZWVuIGZyb20gdGhpcyBOb2RlIHRvIG90aGVycyAoaW5jbHVkaW5nIGl0c2VsZilcbiAgYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucz86IEFzc29jaWF0aW9uW107IC8vIHNldHMgdGhlIGxpc3Qgb2YgYXJpYS1hY3RpdmVkZXNjZW5kYW50IGFzc29jaWF0aW9ucyBiZXR3ZWVuIGZyb20gdGhpcyBOb2RlIHRvIG90aGVycyAoaW5jbHVkaW5nIGl0c2VsZilcblxuICBmb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4gfCBudWxsOyAvLyBBIFByb3BlcnR5IHdpdGggYm91bmRzIHRoYXQgZGVzY3JpYmUgdGhlIGJvdW5kcyBvZiB0aGlzIE5vZGUgdGhhdCBzaG91bGQgcmVtYWluIGRpc3BsYXllZCBieSB0aGUgZ2xvYmFsIEFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyXG4gIGxpbWl0UGFuRGlyZWN0aW9uPzogTGltaXRQYW5EaXJlY3Rpb24gfCBudWxsOyAvLyBBIGNvbnN0cmFpbnQgb24gdGhlIGRpcmVjdGlvbiBvZiBwYW5uaW5nIHdoZW4gaW50ZXJhY3Rpbmcgd2l0aCB0aGlzIE5vZGUuXG5cbiAgcG9zaXRpb25JblBET00/OiBib29sZWFuOyAvLyBTZXRzIHdoZXRoZXIgdGhlIE5vZGUncyBET00gZWxlbWVudHMgYXJlIHBvc2l0aW9uZWQgaW4gdGhlIHZpZXdwb3J0XG5cbiAgcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGU/OiBOb2RlIHwgbnVsbDsgLy8geyBzZXRzIHRoZSBOb2RlIHRoYXQgY29udHJvbHMgcHJpbWFyeSBzaWJsaW5nIGVsZW1lbnQgcG9zaXRpb25pbmcgaW4gdGhlIGRpc3BsYXksIHNlZSBzZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSgpXG59O1xuXG4vLyBNb3N0IG9wdGlvbnMgdXNlIG51bGwgZm9yIHRoZWlyIGRlZmF1bHQgYmVoYXZpb3IsIHNlZSB0aGUgc2V0dGVycyBmb3IgZWFjaCBvcHRpb24gZm9yIGEgZGVzY3JpcHRpb24gb2YgaG93IG51bGxcbi8vIGJlaGF2ZXMgYXMgYSBkZWZhdWx0LlxuZXhwb3J0IHR5cGUgUGFyYWxsZWxET01PcHRpb25zID0gUGFyYWxsZWxET01TZWxmT3B0aW9ucyAmIFBoZXRpb09iamVjdE9wdGlvbnM7XG5cbi8vIFJlbW92ZXMgYWxsIG9wdGlvbnMgZnJvbSBUIHRoYXQgYXJlIGluIFBhcmFsbGVsRE9NU2VsZk9wdGlvbnMuXG5leHBvcnQgdHlwZSBSZW1vdmVQYXJhbGxlbERPTU9wdGlvbnM8VCBleHRlbmRzIFBhcmFsbGVsRE9NT3B0aW9ucz4gPSBTdHJpY3RPbWl0PFQsIGtleW9mIFBhcmFsbGVsRE9NU2VsZk9wdGlvbnM+O1xuXG4vLyBSZW1vdmVzIGFsbCBvcHRpb25zIGZyb20gVCB0aGF0IGFyZSBpbiBQYXJhbGxlbERPTVNlbGZPcHRpb25zLCBleGNlcHQgZm9yIHRoZSBtb3N0IGZ1bmRhbWVudGFsIG9uZXMuXG4vLyBUaGlzIGlzIHVzZWZ1bCBmb3IgY3JlYXRpbmcgYSBQYXJhbGxlbERPTSBzdWJjbGFzcyB0aGF0IG9ubHkgZXhwb3NlcyB0aGVzZSBoaWdoLWxldmVsIG9wdGlvbnMgd2hpbGUgaW1wbGVtZW50aW5nXG4vLyBhY2Nlc3NpYmlsaXR5IHdpdGggdGhlIGxvd2VyLWxldmVsIEFQSS5cbmV4cG9ydCB0eXBlIFRyaW1QYXJhbGxlbERPTU9wdGlvbnM8VCBleHRlbmRzIFBhcmFsbGVsRE9NU2VsZk9wdGlvbnM+ID0gUmVtb3ZlUGFyYWxsZWxET01PcHRpb25zPFQ+ICZcbiAgUGlja09wdGlvbmFsPFBhcmFsbGVsRE9NU2VsZk9wdGlvbnMsICdhY2Nlc3NpYmxlTmFtZScgfCAnaGVscFRleHQnIHwgJ2ZvY3VzYWJsZScgfCAncGRvbVZpc2libGUnPjtcblxudHlwZSBQRE9NQXR0cmlidXRlID0ge1xuICBhdHRyaWJ1dGU6IHN0cmluZztcbiAgdmFsdWU6IFBET01WYWx1ZVR5cGUgfCBib29sZWFuIHwgbnVtYmVyO1xuICBsaXN0ZW5lcjogKCAoIHJhd1ZhbHVlOiBzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyICkgPT4gdm9pZCApIHwgbnVsbDtcbiAgb3B0aW9uczogU2V0UERPTUF0dHJpYnV0ZU9wdGlvbnM7XG59O1xuXG50eXBlIFBET01DbGFzcyA9IHtcbiAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gIG9wdGlvbnM6IFNldFBET01DbGFzc09wdGlvbnM7XG59O1xuXG5leHBvcnQgdHlwZSBBc3NvY2lhdGlvbiA9IHtcbiAgb3RoZXJOb2RlOiBOb2RlO1xuICBvdGhlckVsZW1lbnROYW1lOiBzdHJpbmc7XG4gIHRoaXNFbGVtZW50TmFtZTogc3RyaW5nO1xufTtcblxudHlwZSBTZXRQRE9NQXR0cmlidXRlT3B0aW9ucyA9IHtcbiAgbmFtZXNwYWNlPzogc3RyaW5nIHwgbnVsbDtcbiAgdHlwZT86ICdhdHRyaWJ1dGUnIHwgJ3Byb3BlcnR5JzsgLy8gamF2YXNjcmlwdCBQcm9wZXJ0eSBpbnN0ZWFkIG9mIEFYT04vUHJvcGVydHlcbiAgZWxlbWVudE5hbWU/OiBzdHJpbmc7XG59O1xuXG50eXBlIFJlbW92ZVBET01BdHRyaWJ1dGVPcHRpb25zID0ge1xuICBuYW1lc3BhY2U/OiBzdHJpbmcgfCBudWxsO1xuICBlbGVtZW50TmFtZT86IHN0cmluZztcbn07XG5cbnR5cGUgSGFzUERPTUF0dHJpYnV0ZU9wdGlvbnMgPSB7XG4gIG5hbWVzcGFjZT86IHN0cmluZyB8IG51bGw7XG4gIGVsZW1lbnROYW1lPzogc3RyaW5nO1xufTtcblxudHlwZSBTZXRQRE9NQ2xhc3NPcHRpb25zID0ge1xuICBlbGVtZW50TmFtZT86IHN0cmluZztcbn07XG5cbnR5cGUgUmVtb3ZlUERPTUNsYXNzT3B0aW9ucyA9IHtcbiAgZWxlbWVudE5hbWU/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0gbm9kZSAtIHRoZSBOb2RlIHRoYXQgdGhlIHBkb20gYmVoYXZpb3IgaXMgYmVpbmcgYXBwbGllZCB0b1xuICogQHBhcmFtIG9wdGlvbnMgLSBvcHRpb25zIHRvIG11dGF0ZSB3aXRoaW4gdGhlIGZ1bmN0aW9uXG4gKiBAcGFyYW0gdmFsdWUgLSB0aGUgdmFsdWUgdGhhdCB5b3UgYXJlIHNldHRpbmcgdGhlIGJlaGF2aW9yIG9mLCBsaWtlIHRoZSBhY2Nlc3NpYmxlTmFtZVxuICogQHBhcmFtIGNhbGxiYWNrc0Zvck90aGVyTm9kZXMgLSBiZWhhdmlvciBmdW5jdGlvbiBhbHNvIHN1cHBvcnQgdGFraW5nIHN0YXRlIGZyb20gYSBOb2RlIGFuZCB1c2luZyBpdCB0b1xuICogc2V0IHRoZSBhY2Nlc3NpYmxlIGNvbnRlbnQgZm9yIGFub3RoZXIgTm9kZS4gSWYgdGhpcyBpcyB0aGUgY2FzZSwgdGhhdCBsb2dpYyBzaG91bGQgYmUgc2V0IGluIGEgY2xvc3VyZSBhbmQgYWRkZWQgdG9cbiAqIHRoaXMgbGlzdCBmb3IgZXhlY3V0aW9uIGFmdGVyIHRoaXMgTm9kZSBpcyBmdWxseSBjcmVhdGVkLiBTZWUgZGlzY3Vzc2lvbiBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy81MDMjaXNzdWVjb21tZW50LTY3NjU0MTM3M1xuICogQHJldHVybnMgdGhlIG9wdGlvbnMgdGhhdCBoYXZlIGJlZW4gbXV0YXRlZCBieSB0aGUgYmVoYXZpb3IgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCB0eXBlIFBET01CZWhhdmlvckZ1bmN0aW9uID0gKCBub2RlOiBOb2RlLCBvcHRpb25zOiBQYXJhbGxlbERPTU9wdGlvbnMsIHZhbHVlOiBQRE9NVmFsdWVUeXBlLCBjYWxsYmFja3NGb3JPdGhlck5vZGVzOiAoICgpID0+IHZvaWQgKVtdICkgPT4gUGFyYWxsZWxET01PcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJhbGxlbERPTSBleHRlbmRzIFBoZXRpb09iamVjdCB7XG5cbiAgLy8gVGhlIEhUTUwgdGFnIG5hbWUgb2YgdGhlIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoaXMgTm9kZSBpbiB0aGUgRE9NXG4gIHByaXZhdGUgX3RhZ05hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gVGhlIEhUTUwgdGFnIG5hbWUgZm9yIGEgY29udGFpbmVyIHBhcmVudCBlbGVtZW50IGZvciB0aGlzIE5vZGUgaW4gdGhlIERPTS4gVGhpc1xuICAvLyBjb250YWluZXIgcGFyZW50IHdpbGwgY29udGFpbiB0aGUgTm9kZSdzIERPTSBlbGVtZW50LCBhcyB3ZWxsIGFzIHBlZXIgZWxlbWVudHMgZm9yIGFueSBsYWJlbCBvciBkZXNjcmlwdGlvblxuICAvLyBjb250ZW50LiBTZWUgc2V0Q29udGFpbmVyVGFnTmFtZSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uIElmIHRoaXMgb3B0aW9uIGlzIG5lZWRlZCAobGlrZSB0b1xuICAvLyBjb250YWluIG11bHRpcGxlIHNpYmxpbmdzIHdpdGggdGhlIHByaW1hcnkgc2libGluZyksIGl0IHdpbGwgZGVmYXVsdCB0byB0aGUgdmFsdWUgb2YgREVGQVVMVF9DT05UQUlORVJfVEFHX05BTUUuXG4gIHByaXZhdGUgX2NvbnRhaW5lclRhZ05hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gVGhlIEhUTUwgdGFnIG5hbWUgZm9yIHRoZSBsYWJlbCBlbGVtZW50IHRoYXQgd2lsbCBjb250YWluIHRoZSBsYWJlbCBjb250ZW50IGZvclxuICAvLyB0aGlzIGRvbSBlbGVtZW50LiBUaGVyZSBhcmUgd2F5cyBpbiB3aGljaCB5b3UgY2FuIGhhdmUgYSBsYWJlbCB3aXRob3V0IHNwZWNpZnlpbmcgYSBsYWJlbCB0YWcgbmFtZSxcbiAgLy8gc2VlIHNldExhYmVsQ29udGVudCgpIGZvciB0aGUgbGlzdCBvZiB3YXlzLlxuICBwcml2YXRlIF9sYWJlbFRhZ05hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gVGhlIEhUTUwgdGFnIG5hbWUgZm9yIHRoZSBkZXNjcmlwdGlvbiBlbGVtZW50IHRoYXQgd2lsbCBjb250YWluIGRlc2NzcmlwdGlvbiBjb250ZW50XG4gIC8vIGZvciB0aGlzIGRvbSBlbGVtZW50LiBJZiBhIGRlc2NyaXB0aW9uIGlzIHNldCBiZWZvcmUgYSB0YWcgbmFtZSBpcyBkZWZpbmVkLCBhIHBhcmFncmFwaCBlbGVtZW50XG4gIC8vIHdpbGwgYmUgY3JlYXRlZCBmb3IgdGhlIGRlc2NyaXB0aW9uLlxuICBwcml2YXRlIF9kZXNjcmlwdGlvblRhZ05hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gVGhlIHR5cGUgZm9yIGFuIGVsZW1lbnQgd2l0aCB0YWcgbmFtZSBvZiBJTlBVVC4gIFRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZFxuICAvLyBpZiB0aGUgZWxlbWVudCBoYXMgYSB0YWcgbmFtZSBJTlBVVC5cbiAgcHJpdmF0ZSBfaW5wdXRUeXBlOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8vIFRoZSB2YWx1ZSBvZiB0aGUgaW5wdXQsIG9ubHkgcmVsZXZhbnQgaWYgdGhlIHRhZyBuYW1lIGlzIG9mIHR5cGUgXCJJTlBVVFwiLiBJcyBhXG4gIC8vIHN0cmluZyBiZWNhdXNlIHRoZSBgdmFsdWVgIGF0dHJpYnV0ZSBpcyBhIERPTVN0cmluZy4gbnVsbCB2YWx1ZSBpbmRpY2F0ZXMgbm8gdmFsdWUuXG4gIHByaXZhdGUgX2lucHV0VmFsdWU6IFBET01WYWx1ZVR5cGUgfCBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvLyBXaGV0aGVyIHRoZSBwZG9tIGlucHV0IGlzIGNvbnNpZGVyZWQgJ2NoZWNrZWQnLCBvbmx5IHVzZWZ1bCBmb3IgaW5wdXRzIG9mXG4gIC8vIHR5cGUgJ3JhZGlvJyBhbmQgJ2NoZWNrYm94J1xuICBwcml2YXRlIF9wZG9tQ2hlY2tlZDogYm9vbGVhbjtcblxuICAvLyBCeSBkZWZhdWx0IHRoZSBsYWJlbCB3aWxsIGJlIHByZXBlbmRlZCBiZWZvcmUgdGhlIHByaW1hcnkgc2libGluZyBpbiB0aGUgUERPTS4gVGhpc1xuICAvLyBvcHRpb24gYWxsb3dzIHlvdSB0byBpbnN0ZWFkIGhhdmUgdGhlIGxhYmVsIGFkZGVkIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcuIE5vdGU6IFRoZSBsYWJlbCB3aWxsIGFsd2F5c1xuICAvLyBiZSBpbiBmcm9udCBvZiB0aGUgZGVzY3JpcHRpb24gc2libGluZy4gSWYgdGhpcyBmbGFnIGlzIHNldCB3aXRoIGBhcHBlbmREZXNjcmlwdGlvbjogdHJ1ZWAsIHRoZSBvcmRlciB3aWxsIGJlXG4gIC8vICgxKSBwcmltYXJ5IHNpYmxpbmcsICgyKSBsYWJlbCBzaWJsaW5nLCAoMykgZGVzY3JpcHRpb24gc2libGluZy4gQWxsIHNpYmxpbmdzIHdpbGwgYmUgcGxhY2VkIHdpdGhpbiB0aGVcbiAgLy8gY29udGFpbmVyUGFyZW50LlxuICBwcml2YXRlIF9hcHBlbmRMYWJlbDogYm9vbGVhbjtcblxuICAvLyBCeSBkZWZhdWx0IHRoZSBkZXNjcmlwdGlvbiB3aWxsIGJlIHByZXBlbmRlZCBiZWZvcmUgdGhlIHByaW1hcnkgc2libGluZyBpbiB0aGUgUERPTS4gVGhpc1xuICAvLyBvcHRpb24gYWxsb3dzIHlvdSB0byBpbnN0ZWFkIGhhdmUgdGhlIGRlc2NyaXB0aW9uIGFkZGVkIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcuIE5vdGU6IFRoZSBkZXNjcmlwdGlvblxuICAvLyB3aWxsIGFsd2F5cyBiZSBhZnRlciB0aGUgbGFiZWwgc2libGluZy4gSWYgdGhpcyBmbGFnIGlzIHNldCB3aXRoIGBhcHBlbmRMYWJlbDogdHJ1ZWAsIHRoZSBvcmRlciB3aWxsIGJlXG4gIC8vICgxKSBwcmltYXJ5IHNpYmxpbmcsICgyKSBsYWJlbCBzaWJsaW5nLCAoMykgZGVzY3JpcHRpb24gc2libGluZy4gQWxsIHNpYmxpbmdzIHdpbGwgYmUgcGxhY2VkIHdpdGhpbiB0aGVcbiAgLy8gY29udGFpbmVyUGFyZW50LlxuICBwcml2YXRlIF9hcHBlbmREZXNjcmlwdGlvbjogYm9vbGVhbjtcblxuICAvLyBBcnJheSBvZiBhdHRyaWJ1dGVzIHRoYXQgYXJlIG9uIHRoZSBOb2RlJ3MgRE9NIGVsZW1lbnQuICBPYmplY3RzIHdpbGwgaGF2ZSB0aGVcbiAgLy8gZm9ybSB7IGF0dHJpYnV0ZTp7c3RyaW5nfSwgdmFsdWU6eyp9LCBuYW1lc3BhY2U6e3N0cmluZ3xudWxsfSB9XG4gIHByaXZhdGUgX3Bkb21BdHRyaWJ1dGVzOiBQRE9NQXR0cmlidXRlW107XG5cbiAgLy8gQ29sbGVjdGlvbiBvZiBjbGFzcyBhdHRyaWJ1dGVzIHRoYXQgYXJlIGFwcGxpZWQgdG8gdGhlIE5vZGUncyBET00gZWxlbWVudC5cbiAgLy8gT2JqZWN0cyBoYXZlIHRoZSBmb3JtIHsgY2xhc3NOYW1lOntzdHJpbmd9LCBvcHRpb25zOnsqfSB9XG4gIHByaXZhdGUgX3Bkb21DbGFzc2VzOiBQRE9NQ2xhc3NbXTtcblxuICAvLyBUaGUgbGFiZWwgY29udGVudCBmb3IgdGhpcyBOb2RlJ3MgRE9NIGVsZW1lbnQuICBUaGVyZSBhcmUgbXVsdGlwbGUgd2F5cyB0aGF0IGEgbGFiZWxcbiAgLy8gY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCBhIE5vZGUncyBkb20gZWxlbWVudCwgc2VlIHNldExhYmVsQ29udGVudCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgcHJpdmF0ZSBfbGFiZWxDb250ZW50OiBQRE9NVmFsdWVUeXBlIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gVGhlIGlubmVyIGxhYmVsIGNvbnRlbnQgZm9yIHRoaXMgTm9kZSdzIHByaW1hcnkgc2libGluZy4gU2V0IGFzIGlubmVyIEhUTUxcbiAgLy8gb3IgdGV4dCBjb250ZW50IG9mIHRoZSBhY3R1YWwgRE9NIGVsZW1lbnQuIElmIHRoaXMgaXMgdXNlZCwgdGhlIE5vZGUgc2hvdWxkIG5vdCBoYXZlIGNoaWxkcmVuLlxuICBwcml2YXRlIF9pbm5lckNvbnRlbnQ6IFBET01WYWx1ZVR5cGUgfCBudWxsID0gbnVsbDtcblxuICAvLyBUaGUgZGVzY3JpcHRpb24gY29udGVudCBmb3IgdGhpcyBOb2RlJ3MgRE9NIGVsZW1lbnQuXG4gIHByaXZhdGUgX2Rlc2NyaXB0aW9uQ29udGVudDogUERPTVZhbHVlVHlwZSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIElmIHByb3ZpZGVkLCBpdCB3aWxsIGNyZWF0ZSB0aGUgcHJpbWFyeSBET00gZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZXNwYWNlLlxuICAvLyBUaGlzIG1heSBiZSBuZWVkZWQsIGZvciBleGFtcGxlLCB3aXRoIE1hdGhNTC9TVkcvZXRjLlxuICBwcml2YXRlIF9wZG9tTmFtZXNwYWNlOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8vIElmIHByb3ZpZGVkLCBcImFyaWEtbGFiZWxcIiB3aWxsIGJlIGFkZGVkIGFzIGFuIGlubGluZSBhdHRyaWJ1dGUgb24gdGhlIE5vZGUncyBET01cbiAgLy8gZWxlbWVudCBhbmQgc2V0IHRvIHRoaXMgdmFsdWUuIFRoaXMgd2lsbCBkZXRlcm1pbmUgaG93IHRoZSBBY2Nlc3NpYmxlIE5hbWUgaXMgcHJvdmlkZWQgZm9yIHRoZSBET00gZWxlbWVudC5cbiAgcHJpdmF0ZSBfYXJpYUxhYmVsOiBQRE9NVmFsdWVUeXBlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2hhc0FwcGxpZWRBcmlhTGFiZWwgPSBmYWxzZTtcblxuICAvLyBUaGUgQVJJQSByb2xlIGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcsIGFkZGVkIGFzIGFuIEhUTUwgYXR0cmlidXRlLiAgRm9yIGEgY29tcGxldGVcbiAgLy8gbGlzdCBvZiBBUklBIHJvbGVzLCBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL3dhaS1hcmlhL3JvbGVzLiAgQmV3YXJlIHRoYXQgbWFueSByb2xlcyBhcmUgbm90IHN1cHBvcnRlZFxuICAvLyBieSBicm93c2VycyBvciBhc3Npc3RpdmUgdGVjaG5vbG9naWVzLCBzbyB1c2UgdmFuaWxsYSBIVE1MIGZvciBhY2Nlc3NpYmlsaXR5IHNlbWFudGljcyB3aGVyZSBwb3NzaWJsZS5cbiAgcHJpdmF0ZSBfYXJpYVJvbGU6IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gVGhlIEFSSUEgcm9sZSBmb3IgdGhlIGNvbnRhaW5lciBwYXJlbnQgZWxlbWVudCwgYWRkZWQgYXMgYW4gSFRNTCBhdHRyaWJ1dGUuIEZvciBhXG4gIC8vIGNvbXBsZXRlIGxpc3Qgb2YgQVJJQSByb2xlcywgc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS9yb2xlcy4gQmV3YXJlIHRoYXQgbWFueSByb2xlcyBhcmUgbm90XG4gIC8vIHN1cHBvcnRlZCBieSBicm93c2VycyBvciBhc3Npc3RpdmUgdGVjaG5vbG9naWVzLCBzbyB1c2UgdmFuaWxsYSBIVE1MIGZvciBhY2Nlc3NpYmlsaXR5IHNlbWFudGljcyB3aGVyZVxuICAvLyBwb3NzaWJsZS5cbiAgcHJpdmF0ZSBfY29udGFpbmVyQXJpYVJvbGU6IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gSWYgcHJvdmlkZWQsIFwiYXJpYS12YWx1ZXRleHRcIiB3aWxsIGJlIGFkZGVkIGFzIGFuIGlubGluZSBhdHRyaWJ1dGUgb24gdGhlIE5vZGUnc1xuICAvLyBwcmltYXJ5IHNpYmxpbmcgYW5kIHNldCB0byB0aGlzIHZhbHVlLiBTZXR0aW5nIGJhY2sgdG8gbnVsbCB3aWxsIGNsZWFyIHRoaXMgYXR0cmlidXRlIGluIHRoZSB2aWV3LlxuICBwcml2YXRlIF9hcmlhVmFsdWVUZXh0OiBQRE9NVmFsdWVUeXBlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2hhc0FwcGxpZWRBcmlhVmFsdWVUZXh0ID0gZmFsc2U7XG5cbiAgLy8gS2VlcCB0cmFjayBvZiB3aGF0IHRoaXMgTm9kZSBpcyBhcmlhLWxhYmVsbGVkYnkgdmlhIFwiYXNzb2NpYXRpb25PYmplY3RzXCJcbiAgLy8gc2VlIGFkZEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24gZm9yIHdoeSB3ZSBzdXBwb3J0IG1vcmUgdGhhbiBvbmUgYXNzb2NpYXRpb24uXG4gIHByaXZhdGUgX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zOiBBc3NvY2lhdGlvbltdO1xuXG4gIC8vIEtlZXAgYSByZWZlcmVuY2UgdG8gYWxsIE5vZGVzIHRoYXQgYXJlIGFyaWEtbGFiZWxsZWRieSB0aGlzIE5vZGUsIGkuZS4gdGhhdCBoYXZlIHN0b3JlIG9uZSBvZiB0aGlzIE5vZGUnc1xuICAvLyBwZWVyIEhUTUxFbGVtZW50J3MgaWQgaW4gdGhlaXIgcGVlciBIVE1MRWxlbWVudCdzIGFyaWEtbGFiZWxsZWRieSBhdHRyaWJ1dGUuIFRoaXMgd2F5IHdlIGNhbiB0ZWxsIG90aGVyXG4gIC8vIE5vZGVzIHRvIHVwZGF0ZSB0aGVpciBhcmlhLWxhYmVsbGVkYnkgYXNzb2NpYXRpb25zIHdoZW4gdGhpcyBOb2RlIHJlYnVpbGRzIGl0cyBwZG9tIGNvbnRlbnQuXG4gIHByaXZhdGUgX25vZGVzVGhhdEFyZUFyaWFMYWJlbGxlZGJ5VGhpc05vZGU6IE5vZGVbXTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIHdoYXQgdGhpcyBOb2RlIGlzIGFyaWEtZGVzY3JpYmVkYnkgdmlhIFwiYXNzb2NpYXRpb25PYmplY3RzXCJcbiAgLy8gc2VlIGFkZEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uIGZvciB3aHkgd2Ugc3VwcG9ydCBtb3JlIHRoYW4gb25lIGFzc29jaWF0aW9uLlxuICBwcml2YXRlIF9hcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnM6IEFzc29jaWF0aW9uW107XG5cbiAgLy8gS2VlcCBhIHJlZmVyZW5jZSB0byBhbGwgTm9kZXMgdGhhdCBhcmUgYXJpYS1kZXNjcmliZWRieSB0aGlzIE5vZGUsIGkuZS4gdGhhdCBoYXZlIHN0b3JlIG9uZSBvZiB0aGlzIE5vZGUnc1xuICAvLyBwZWVyIEhUTUxFbGVtZW50J3MgaWQgaW4gdGhlaXIgcGVlciBIVE1MRWxlbWVudCdzIGFyaWEtZGVzY3JpYmVkYnkgYXR0cmlidXRlLiBUaGlzIHdheSB3ZSBjYW4gdGVsbCBvdGhlclxuICAvLyBOb2RlcyB0byB1cGRhdGUgdGhlaXIgYXJpYS1kZXNjcmliZWRieSBhc3NvY2lhdGlvbnMgd2hlbiB0aGlzIE5vZGUgcmVidWlsZHMgaXRzIHBkb20gY29udGVudC5cbiAgcHJpdmF0ZSBfbm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGU6IE5vZGVbXTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIHdoYXQgdGhpcyBOb2RlIGlzIGFyaWEtYWN0aXZlZGVzY2VuZGFudCB2aWEgXCJhc3NvY2lhdGlvbk9iamVjdHNcIlxuICAvLyBzZWUgYWRkQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uIGZvciB3aHkgd2Ugc3VwcG9ydCBtb3JlIHRoYW4gb25lIGFzc29jaWF0aW9uLlxuICBwcml2YXRlIF9hY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zOiBBc3NvY2lhdGlvbltdO1xuXG4gIC8vIEtlZXAgYSByZWZlcmVuY2UgdG8gYWxsIE5vZGVzIHRoYXQgYXJlIGFyaWEtYWN0aXZlZGVzY2VuZGFudCB0aGlzIE5vZGUsIGkuZS4gdGhhdCBoYXZlIHN0b3JlIG9uZSBvZiB0aGlzIE5vZGUnc1xuICAvLyBwZWVyIEhUTUxFbGVtZW50J3MgaWQgaW4gdGhlaXIgcGVlciBIVE1MRWxlbWVudCdzIGFyaWEtYWN0aXZlZGVzY2VuZGFudCBhdHRyaWJ1dGUuIFRoaXMgd2F5IHdlIGNhbiB0ZWxsIG90aGVyXG4gIC8vIE5vZGVzIHRvIHVwZGF0ZSB0aGVpciBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQgYXNzb2NpYXRpb25zIHdoZW4gdGhpcyBOb2RlIHJlYnVpbGRzIGl0cyBwZG9tIGNvbnRlbnQuXG4gIHByaXZhdGUgX25vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlOiBOb2RlW107XG5cbiAgLy8gV2hldGhlciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcgaGFzIGJlZW4gZXhwbGljaXRseSBzZXQgdG8gcmVjZWl2ZSBmb2N1cyBmcm9tXG4gIC8vIHRhYiBuYXZpZ2F0aW9uLiBTZXRzIHRoZSB0YWJJbmRleCBhdHRyaWJ1dGUgb24gdGhlIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuIFNldHRpbmcgdG8gZmFsc2Ugd2lsbCBub3QgcmVtb3ZlIHRoZVxuICAvLyBOb2RlJ3MgRE9NIGZyb20gdGhlIGRvY3VtZW50LCBidXQgd2lsbCBlbnN1cmUgdGhhdCBpdCBjYW5ub3QgcmVjZWl2ZSBmb2N1cyBieSBwcmVzc2luZyAndGFiJy4gIFNldmVyYWxcbiAgLy8gSFRNTEVsZW1lbnRzIChzdWNoIGFzIEhUTUwgZm9ybSBlbGVtZW50cykgY2FuIGJlIGZvY3VzYWJsZSBieSBkZWZhdWx0LCB3aXRob3V0IHNldHRpbmcgdGhpcyBwcm9wZXJ0eS4gVGhlXG4gIC8vIG5hdGl2ZSBIVE1MIGZ1bmN0aW9uIGZyb20gdGhlc2UgZm9ybSBlbGVtZW50cyBjYW4gYmUgb3ZlcnJpZGRlbiB3aXRoIHRoaXMgcHJvcGVydHkuXG4gIHByaXZhdGUgX2ZvY3VzYWJsZU92ZXJyaWRlOiBib29sZWFuIHwgbnVsbDtcblxuICAvLyBUaGUgZm9jdXMgaGlnaGxpZ2h0IHRoYXQgd2lsbCBzdXJyb3VuZCB0aGlzIE5vZGUgd2hlbiBpdFxuICAvLyBpcyBmb2N1c2VkLiAgQnkgZGVmYXVsdCwgdGhlIGZvY3VzIGhpZ2hsaWdodCB3aWxsIGJlIGEgcGluayByZWN0YW5nbGUgdGhhdCBzdXJyb3VuZHMgdGhlIE5vZGUncyBsb2NhbFxuICAvLyBib3VuZHMuIFdoZW4gcHJvdmlkaW5nIGEgY3VzdG9tIGhpZ2hsaWdodCwgZHJhdyBhcm91bmQgdGhlIE5vZGUncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxuICBwcml2YXRlIF9mb2N1c0hpZ2hsaWdodDogU2hhcGUgfCBOb2RlIHwgJ2ludmlzaWJsZScgfCBudWxsO1xuXG4gIC8vIEEgZmxhZyB0aGF0IGFsbG93cyBwcmV2ZW50cyBmb2N1cyBoaWdobGlnaHQgZnJvbSBiZWluZyBkaXNwbGF5ZWQgaW4gdGhlIEhpZ2hsaWdodE92ZXJsYXkuXG4gIC8vIElmIHRydWUsIHRoZSBmb2N1cyBoaWdobGlnaHQgZm9yIHRoaXMgTm9kZSB3aWxsIGJlIGxheWVyYWJsZSBpbiB0aGUgc2NlbmUgZ3JhcGguICBQaGV0aW9DbGllbnQgaXMgcmVzcG9uc2libGVcbiAgLy8gZm9yIHBsYWNlbWVudCBvZiB0aGUgZm9jdXMgaGlnaGxpZ2h0IGluIHRoZSBzY2VuZSBncmFwaC5cbiAgcHJpdmF0ZSBfZm9jdXNIaWdobGlnaHRMYXllcmFibGU6IGJvb2xlYW47XG5cbiAgLy8gQWRkcyBhIGdyb3VwIGZvY3VzIGhpZ2hsaWdodCB0aGF0IHN1cnJvdW5kcyB0aGlzIE5vZGUgd2hlbiBhIGRlc2NlbmRhbnQgaGFzXG4gIC8vIGZvY3VzLiBUeXBpY2FsbHkgdXNlZnVsIHRvIGluZGljYXRlIGZvY3VzIGlmIGZvY3VzIGVudGVycyBhIGdyb3VwIG9mIGVsZW1lbnRzLiBJZiAndHJ1ZScsIGdyb3VwXG4gIC8vIGhpZ2hsaWdodCB3aWxsIGdvIGFyb3VuZCBsb2NhbCBib3VuZHMgb2YgdGhpcyBOb2RlLiBPdGhlcndpc2UgdGhlIGN1c3RvbSBOb2RlIHdpbGwgYmUgdXNlZCBhcyB0aGUgaGlnaGxpZ2h0L1xuICBwcml2YXRlIF9ncm91cEZvY3VzSGlnaGxpZ2h0OiBOb2RlIHwgYm9vbGVhbjtcblxuICAvLyBXaGV0aGVyIHRoZSBwZG9tIGNvbnRlbnQgd2lsbCBiZSB2aXNpYmxlIGZyb20gdGhlIGJyb3dzZXIgYW5kIGFzc2lzdGl2ZVxuICAvLyB0ZWNobm9sb2dpZXMuICBXaGVuIHBkb21WaXNpYmxlIGlzIGZhbHNlLCB0aGUgTm9kZSdzIHByaW1hcnkgc2libGluZyB3aWxsIG5vdCBiZSBmb2N1c2FibGUsIGFuZCBpdCBjYW5ub3RcbiAgLy8gYmUgZm91bmQgYnkgdGhlIGFzc2lzdGl2ZSB0ZWNobm9sb2d5IHZpcnR1YWwgY3Vyc29yLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgYXNzaXN0aXZlIHRlY2hub2xvZ2llc1xuICAvLyByZWFkIHdpdGggdGhlIHZpcnR1YWwgY3Vyc29yIHNlZVxuICAvLyBodHRwOi8vd3d3LnNzYmJhcnRncm91cC5jb20vYmxvZy9ob3ctd2luZG93cy1zY3JlZW4tcmVhZGVycy13b3JrLW9uLXRoZS13ZWIvXG4gIHByaXZhdGUgcmVhZG9ubHkgX3Bkb21WaXNpYmxlUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gSWYgcHJvdmlkZWQsIGl0IHdpbGwgb3ZlcnJpZGUgdGhlIGZvY3VzIG9yZGVyIGJldHdlZW4gY2hpbGRyZW5cbiAgLy8gKGFuZCBvcHRpb25hbGx5IGFyYml0cmFyeSBzdWJ0cmVlcykuIElmIG5vdCBwcm92aWRlZCwgdGhlIGZvY3VzIG9yZGVyIHdpbGwgZGVmYXVsdCB0byB0aGUgcmVuZGVyaW5nIG9yZGVyXG4gIC8vIChmaXJzdCBjaGlsZHJlbiBmaXJzdCwgbGFzdCBjaGlsZHJlbiBsYXN0KSBkZXRlcm1pbmVkIGJ5IHRoZSBjaGlsZHJlbiBhcnJheS5cbiAgLy8gU2VlIHNldFBET01PcmRlcigpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXG4gIHByaXZhdGUgX3Bkb21PcmRlcjogKCBOb2RlIHwgbnVsbCApW10gfCBudWxsO1xuXG4gIC8vIElmIHRoaXMgTm9kZSBpcyBzcGVjaWZpZWQgaW4gYW5vdGhlciBOb2RlJ3MgcGRvbU9yZGVyLCB0aGVuIHRoaXMgd2lsbCBoYXZlIHRoZSB2YWx1ZSBvZiB0aGF0IG90aGVyIChQRE9NIHBhcmVudClcbiAgLy8gTm9kZS4gT3RoZXJ3aXNlIGl0J3MgbnVsbC5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfcGRvbVBhcmVudDogTm9kZSB8IG51bGw7XG5cbiAgLy8gSWYgdGhpcyBpcyBzcGVjaWZpZWQsIHRoZSBwcmltYXJ5IHNpYmxpbmcgd2lsbCBiZSBwb3NpdGlvbmVkXG4gIC8vIHRvIGFsaWduIHdpdGggdGhpcyBzb3VyY2UgTm9kZSBhbmQgb2JzZXJ2ZSB0aGUgdHJhbnNmb3JtcyBhbG9uZyB0aGlzIE5vZGUncyB0cmFpbC4gQXQgdGhpcyB0aW1lIHRoZVxuICAvLyBwZG9tVHJhbnNmb3JtU291cmNlTm9kZSBjYW5ub3QgdXNlIERBRy5cbiAgcHJpdmF0ZSBfcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGU6IE5vZGUgfCBudWxsO1xuXG4gIC8vIElmIHRoaXMgaXMgcHJvdmlkZWQsIHRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB3aWxsIGF0dGVtcHQgdG8ga2VlcCB0aGlzIE5vZGUgaW4gdmlldyBhcyBsb25nIGFzIGl0IGhhc1xuICAvLyBmb2N1c1xuICBwcml2YXRlIF9mb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyPiB8IG51bGw7XG5cbiAgLy8gSWYgcHJvdmlkZWQsIHRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB3aWxsIE9OTFkgcGFuIGluIHRoZSBzcGVjaWZpZWQgZGlyZWN0aW9uXG4gIHByaXZhdGUgX2xpbWl0UGFuRGlyZWN0aW9uOiBMaW1pdFBhbkRpcmVjdGlvbiB8IG51bGw7XG5cbiAgLy8gQ29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBwZG9tIGRpc3BsYXlzXG4gIC8vIHRoaXMgTm9kZSBpcyBcInZpc2libGVcIiBmb3IsIHNlZSBQRE9NRGlzcGxheXNJbmZvLmpzIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9wZG9tRGlzcGxheXNJbmZvOiBQRE9NRGlzcGxheXNJbmZvO1xuXG4gIC8vIEVtcHR5IHVubGVzcyB0aGUgTm9kZSBjb250YWlucyBzb21lIHBkb20gY29udGVudCAoUERPTUluc3RhbmNlKS5cbiAgcHJpdmF0ZSByZWFkb25seSBfcGRvbUluc3RhbmNlczogUERPTUluc3RhbmNlW107XG5cbiAgLy8gRGV0ZXJtaW5lcyBpZiBET00gc2libGluZ3MgYXJlIHBvc2l0aW9uZWQgaW4gdGhlIHZpZXdwb3J0LiBUaGlzXG4gIC8vIGlzIHJlcXVpcmVkIGZvciBOb2RlcyB0aGF0IHJlcXVpcmUgdW5pcXVlIGlucHV0IGdlc3R1cmVzIHdpdGggaU9TIFZvaWNlT3ZlciBsaWtlIFwiRHJhZyBhbmQgRHJvcFwiLlxuICAvLyBTZWUgc2V0UG9zaXRpb25JblBET00gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIHByaXZhdGUgX3Bvc2l0aW9uSW5QRE9NOiBib29sZWFuO1xuXG4gIC8vIElmIHRydWUsIGFueSBET00gZXZlbnRzIHJlY2VpdmVkIG9uIHRoZSBsYWJlbCBzaWJsaW5nXG4gIC8vIHdpbGwgbm90IGRpc3BhdGNoIFNjZW5lcnlFdmVudHMgdGhyb3VnaCB0aGUgc2NlbmUgZ3JhcGgsIHNlZSBzZXRFeGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0KCkgLSBzY2VuZXJ5IGludGVybmFsXG4gIHByaXZhdGUgZXhjbHVkZUxhYmVsU2libGluZ0Zyb21JbnB1dDogYm9vbGVhbjtcblxuICAvLyBISUdIRVIgTEVWRUwgQVBJIElOSVRJQUxJWkFUSU9OXG5cbiAgLy8gU2V0cyB0aGUgXCJBY2Nlc3NpYmxlIE5hbWVcIiBvZiB0aGUgTm9kZSwgYXMgZGVmaW5lZCBieSB0aGUgQnJvd3NlcidzIFBhcmFsbGVsRE9NIFRyZWVcbiAgcHJpdmF0ZSBfYWNjZXNzaWJsZU5hbWU6IFBET01WYWx1ZVR5cGUgfCBudWxsID0gbnVsbDtcblxuICAvLyBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIG9wdGlvbnMgbmVlZGVkIHRvIHNldCB0aGUgYXBwcm9wcmlhdGUgYWNjZXNzaWJsZSBuYW1lIGZvciB0aGUgTm9kZVxuICBwcml2YXRlIF9hY2Nlc3NpYmxlTmFtZUJlaGF2aW9yOiBQRE9NQmVoYXZpb3JGdW5jdGlvbjtcblxuICAvLyBTZXRzIHRoZSBoZWxwIHRleHQgb2YgdGhlIE5vZGUsIHRoaXMgbW9zdCBvZnRlbiBjb3JyZXNwb25kcyB0byBkZXNjcmlwdGlvbiB0ZXh0LlxuICBwcml2YXRlIF9oZWxwVGV4dDogUERPTVZhbHVlVHlwZSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIFNldHMgdGhlIGhlbHAgdGV4dCBvZiB0aGUgTm9kZSwgdGhpcyBtb3N0IG9mdGVuIGNvcnJlc3BvbmRzIHRvIGRlc2NyaXB0aW9uIHRleHQuXG4gIHByaXZhdGUgX2hlbHBUZXh0QmVoYXZpb3I6IFBET01CZWhhdmlvckZ1bmN0aW9uO1xuXG4gIC8vIFNldHMgdGhlIGhlbHAgdGV4dCBvZiB0aGUgTm9kZSwgdGhpcyBtb3N0IG9mdGVuIGNvcnJlc3BvbmRzIHRvIGxhYmVsIHNpYmxpbmcgdGV4dC5cbiAgcHJpdmF0ZSBfcGRvbUhlYWRpbmc6IFBET01WYWx1ZVR5cGUgfCBudWxsID0gbnVsbDtcblxuICAvLyBUT0RPOiBpbXBsZW1lbnQgaGVhZGluZ0xldmVsIG92ZXJyaWRlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg1NVxuICAvLyBUaGUgbnVtYmVyIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGhlYWRpbmcgdGFnIHRoZSBOb2RlIHdpbGwgZ2V0IGlmIHVzaW5nIHRoZSBwZG9tSGVhZGluZyBBUEksLlxuICBwcml2YXRlIF9oZWFkaW5nTGV2ZWw6IG51bWJlciB8IG51bGw7XG5cbiAgLy8gU2V0cyB0aGUgaGVscCB0ZXh0IG9mIHRoZSBOb2RlLCB0aGlzIG1vc3Qgb2Z0ZW4gY29ycmVzcG9uZHMgdG8gZGVzY3JpcHRpb24gdGV4dC5cbiAgcHJpdmF0ZSBfcGRvbUhlYWRpbmdCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb247XG5cbiAgLy8gRW1pdHMgYW4gZXZlbnQgd2hlbiB0aGUgZm9jdXMgaGlnaGxpZ2h0IGlzIGNoYW5nZWQuXG4gIHB1YmxpYyByZWFkb25seSBmb2N1c0hpZ2hsaWdodENoYW5nZWRFbWl0dGVyOiBURW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIEVtaXRzIGFuIGV2ZW50IHdoZW4gdGhlIHBkb20gcGFyZW50IG9mIHRoaXMgTm9kZSBoYXMgY2hhbmdlZFxuICBwdWJsaWMgcmVhZG9ubHkgcGRvbVBhcmVudENoYW5nZWRFbWl0dGVyOiBURW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIEZpcmVkIHdoZW4gdGhlIFBET00gRGlzcGxheXMgZm9yIHRoaXMgTm9kZSBoYXZlIGNoYW5nZWQgKHNlZSBQRE9NSW5zdGFuY2UpXG4gIHB1YmxpYyByZWFkb25seSBwZG9tRGlzcGxheXNFbWl0dGVyOiBURW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIFBET00gc3BlY2lmaWMgZW5hYmxlZCBsaXN0ZW5lclxuICBwcm90ZWN0ZWQgcGRvbUJvdW5kSW5wdXRFbmFibGVkTGlzdGVuZXI6ICggZW5hYmxlZDogYm9vbGVhbiApID0+IHZvaWQ7XG5cbiAgcHJvdGVjdGVkIF9vblBET01Db250ZW50Q2hhbmdlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG4gIHByb3RlY3RlZCBfb25JbnB1dFZhbHVlQ2hhbmdlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG4gIHByb3RlY3RlZCBfb25BcmlhTGFiZWxDaGFuZ2VMaXN0ZW5lcjogKCkgPT4gdm9pZDtcbiAgcHJvdGVjdGVkIF9vbkFyaWFWYWx1ZVRleHRDaGFuZ2VMaXN0ZW5lcjogKCkgPT4gdm9pZDtcbiAgcHJvdGVjdGVkIF9vbkxhYmVsQ29udGVudENoYW5nZUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuICBwcm90ZWN0ZWQgX29uRGVzY3JpcHRpb25Db250ZW50Q2hhbmdlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG4gIHByb3RlY3RlZCBfb25Jbm5lckNvbnRlbnRDaGFuZ2VMaXN0ZW5lcjogKCkgPT4gdm9pZDtcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBQaGV0aW9PYmplY3RPcHRpb25zICkge1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuX29uUERPTUNvbnRlbnRDaGFuZ2VMaXN0ZW5lciA9IHRoaXMub25QRE9NQ29udGVudENoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5fb25JbnB1dFZhbHVlQ2hhbmdlTGlzdGVuZXIgPSB0aGlzLmludmFsaWRhdGVQZWVySW5wdXRWYWx1ZS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5fb25BcmlhTGFiZWxDaGFuZ2VMaXN0ZW5lciA9IHRoaXMub25BcmlhTGFiZWxDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMuX29uQXJpYVZhbHVlVGV4dENoYW5nZUxpc3RlbmVyID0gdGhpcy5vbkFyaWFWYWx1ZVRleHRDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMuX29uTGFiZWxDb250ZW50Q2hhbmdlTGlzdGVuZXIgPSB0aGlzLmludmFsaWRhdGVQZWVyTGFiZWxTaWJsaW5nQ29udGVudC5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5fb25EZXNjcmlwdGlvbkNvbnRlbnRDaGFuZ2VMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZVBlZXJEZXNjcmlwdGlvblNpYmxpbmdDb250ZW50LmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLl9vbklubmVyQ29udGVudENoYW5nZUxpc3RlbmVyID0gdGhpcy5vbklubmVyQ29udGVudFByb3BlcnR5Q2hhbmdlLmJpbmQoIHRoaXMgKTtcblxuICAgIHRoaXMuX3RhZ05hbWUgPSBudWxsO1xuICAgIHRoaXMuX2NvbnRhaW5lclRhZ05hbWUgPSBudWxsO1xuICAgIHRoaXMuX2xhYmVsVGFnTmFtZSA9IG51bGw7XG4gICAgdGhpcy5fZGVzY3JpcHRpb25UYWdOYW1lID0gbnVsbDtcbiAgICB0aGlzLl9pbnB1dFR5cGUgPSBudWxsO1xuICAgIHRoaXMuX3Bkb21DaGVja2VkID0gZmFsc2U7XG4gICAgdGhpcy5fYXBwZW5kTGFiZWwgPSBmYWxzZTtcbiAgICB0aGlzLl9hcHBlbmREZXNjcmlwdGlvbiA9IGZhbHNlO1xuICAgIHRoaXMuX3Bkb21BdHRyaWJ1dGVzID0gW107XG4gICAgdGhpcy5fcGRvbUNsYXNzZXMgPSBbXTtcblxuICAgIHRoaXMuX3Bkb21OYW1lc3BhY2UgPSBudWxsO1xuICAgIHRoaXMuX2FyaWFSb2xlID0gbnVsbDtcbiAgICB0aGlzLl9jb250YWluZXJBcmlhUm9sZSA9IG51bGw7XG4gICAgdGhpcy5fYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlID0gW107XG4gICAgdGhpcy5fYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zID0gW107XG4gICAgdGhpcy5fbm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGUgPSBbXTtcbiAgICB0aGlzLl9hY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zID0gW107XG4gICAgdGhpcy5fbm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUgPSBbXTtcbiAgICB0aGlzLl9mb2N1c2FibGVPdmVycmlkZSA9IG51bGw7XG4gICAgdGhpcy5fZm9jdXNIaWdobGlnaHQgPSBudWxsO1xuICAgIHRoaXMuX2ZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlID0gZmFsc2U7XG4gICAgdGhpcy5fZ3JvdXBGb2N1c0hpZ2hsaWdodCA9IGZhbHNlO1xuICAgIHRoaXMuX3Bkb21PcmRlciA9IG51bGw7XG4gICAgdGhpcy5fcGRvbVBhcmVudCA9IG51bGw7XG4gICAgdGhpcy5fcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUgPSBudWxsO1xuICAgIHRoaXMuX2ZvY3VzUGFuVGFyZ2V0Qm91bmRzUHJvcGVydHkgPSBudWxsO1xuICAgIHRoaXMuX2xpbWl0UGFuRGlyZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9wZG9tRGlzcGxheXNJbmZvID0gbmV3IFBET01EaXNwbGF5c0luZm8oIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XG4gICAgdGhpcy5fcGRvbUluc3RhbmNlcyA9IFtdO1xuICAgIHRoaXMuX3Bvc2l0aW9uSW5QRE9NID0gZmFsc2U7XG4gICAgdGhpcy5leGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0ID0gZmFsc2U7XG5cbiAgICB0aGlzLl9wZG9tVmlzaWJsZVByb3BlcnR5ID0gbmV3IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8Ym9vbGVhbj4oIHRydWUsIGZhbHNlLCB0aGlzLm9uUGRvbVZpc2libGVQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICkgKTtcblxuICAgIC8vIEhJR0hFUiBMRVZFTCBBUEkgSU5JVElBTElaQVRJT05cblxuICAgIHRoaXMuX2FjY2Vzc2libGVOYW1lQmVoYXZpb3IgPSBQYXJhbGxlbERPTS5CQVNJQ19BQ0NFU1NJQkxFX05BTUVfQkVIQVZJT1I7XG4gICAgdGhpcy5faGVscFRleHRCZWhhdmlvciA9IFBhcmFsbGVsRE9NLkhFTFBfVEVYVF9BRlRFUl9DT05URU5UO1xuICAgIHRoaXMuX2hlYWRpbmdMZXZlbCA9IG51bGw7XG4gICAgdGhpcy5fcGRvbUhlYWRpbmdCZWhhdmlvciA9IERFRkFVTFRfUERPTV9IRUFESU5HX0JFSEFWSU9SO1xuICAgIHRoaXMucGRvbUJvdW5kSW5wdXRFbmFibGVkTGlzdGVuZXIgPSB0aGlzLnBkb21JbnB1dEVuYWJsZWRMaXN0ZW5lci5iaW5kKCB0aGlzICk7XG4gIH1cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8vIFBVQkxJQyBNRVRIT0RTXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogRGlzcG9zZSBhY2Nlc3NpYmlsaXR5IGJ5IHJlbW92aW5nIGFsbCBsaXN0ZW5lcnMgb24gdGhpcyBOb2RlIGZvciBhY2Nlc3NpYmxlIGlucHV0LiBQYXJhbGxlbERPTSBpcyBkaXNwb3NlZFxuICAgKiBieSBjYWxsaW5nIE5vZGUuZGlzcG9zZSgpLCBzbyB0aGlzIGZ1bmN0aW9uIGlzIHNjZW5lcnktaW50ZXJuYWwuXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHJvdGVjdGVkIGRpc3Bvc2VQYXJhbGxlbERPTSgpOiB2b2lkIHtcblxuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggdGhpcy5fYWNjZXNzaWJsZU5hbWUgKSAmJiAhdGhpcy5fYWNjZXNzaWJsZU5hbWUuaXNEaXNwb3NlZCApIHtcbiAgICAgIHRoaXMuX2FjY2Vzc2libGVOYW1lLnVubGluayggdGhpcy5fb25QRE9NQ29udGVudENoYW5nZUxpc3RlbmVyICk7XG4gICAgICB0aGlzLl9hY2Nlc3NpYmxlTmFtZSA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCB0aGlzLl9oZWxwVGV4dCApICYmICF0aGlzLl9oZWxwVGV4dC5pc0Rpc3Bvc2VkICkge1xuICAgICAgdGhpcy5faGVscFRleHQudW5saW5rKCB0aGlzLl9vblBET01Db250ZW50Q2hhbmdlTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuX2hlbHBUZXh0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHRoaXMuX3Bkb21IZWFkaW5nICkgJiYgIXRoaXMuX3Bkb21IZWFkaW5nLmlzRGlzcG9zZWQgKSB7XG4gICAgICB0aGlzLl9wZG9tSGVhZGluZy51bmxpbmsoIHRoaXMuX29uUERPTUNvbnRlbnRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgdGhpcy5fcGRvbUhlYWRpbmcgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggdGhpcy5faW5wdXRWYWx1ZSApICYmICF0aGlzLl9pbnB1dFZhbHVlLmlzRGlzcG9zZWQgKSB7XG4gICAgICB0aGlzLl9pbnB1dFZhbHVlLnVubGluayggdGhpcy5fb25QRE9NQ29udGVudENoYW5nZUxpc3RlbmVyICk7XG4gICAgICB0aGlzLl9pbnB1dFZhbHVlID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHRoaXMuX2FyaWFMYWJlbCApICYmICF0aGlzLl9hcmlhTGFiZWwuaXNEaXNwb3NlZCApIHtcbiAgICAgIHRoaXMuX2FyaWFMYWJlbC51bmxpbmsoIHRoaXMuX29uQXJpYUxhYmVsQ2hhbmdlTGlzdGVuZXIgKTtcbiAgICB9XG5cbiAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHRoaXMuX2FyaWFWYWx1ZVRleHQgKSAmJiAhdGhpcy5fYXJpYVZhbHVlVGV4dC5pc0Rpc3Bvc2VkICkge1xuICAgICAgdGhpcy5fYXJpYVZhbHVlVGV4dC51bmxpbmsoIHRoaXMuX29uQXJpYVZhbHVlVGV4dENoYW5nZUxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCB0aGlzLl9pbm5lckNvbnRlbnQgKSAmJiAhdGhpcy5faW5uZXJDb250ZW50LmlzRGlzcG9zZWQgKSB7XG4gICAgICB0aGlzLl9pbm5lckNvbnRlbnQudW5saW5rKCB0aGlzLl9vbklubmVyQ29udGVudENoYW5nZUxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCB0aGlzLl9sYWJlbENvbnRlbnQgKSAmJiAhdGhpcy5fbGFiZWxDb250ZW50LmlzRGlzcG9zZWQgKSB7XG4gICAgICB0aGlzLl9sYWJlbENvbnRlbnQudW5saW5rKCB0aGlzLl9vbkxhYmVsQ29udGVudENoYW5nZUxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCB0aGlzLl9kZXNjcmlwdGlvbkNvbnRlbnQgKSAmJiAhdGhpcy5fZGVzY3JpcHRpb25Db250ZW50LmlzRGlzcG9zZWQgKSB7XG4gICAgICB0aGlzLl9kZXNjcmlwdGlvbkNvbnRlbnQudW5saW5rKCB0aGlzLl9vbkRlc2NyaXB0aW9uQ29udGVudENoYW5nZUxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApLmlucHV0RW5hYmxlZFByb3BlcnR5LnVubGluayggdGhpcy5wZG9tQm91bmRJbnB1dEVuYWJsZWRMaXN0ZW5lciApO1xuXG4gICAgLy8gVG8gcHJldmVudCBtZW1vcnkgbGVha3MsIHdlIHdhbnQgdG8gY2xlYXIgb3VyIG9yZGVyIChzaW5jZSBvdGhlcndpc2UgTm9kZXMgaW4gb3VyIG9yZGVyIHdpbGwgcmVmZXJlbmNlXG4gICAgLy8gdGhpcyBOb2RlKS5cbiAgICB0aGlzLnBkb21PcmRlciA9IG51bGw7XG5cbiAgICAvLyBJZiB0aGlzIE5vZGUgaXMgaW4gYW55IFBET00gb3JkZXIsIHdlIG5lZWQgdG8gcmVtb3ZlIGl0IGZyb20gdGhlIG9yZGVyIG9mIHRoZSBvdGhlciBOb2RlIHNvIHRoZXJlIGlzXG4gICAgLy8gbm8gcmVmZXJlbmNlIHRvIHRoaXMgTm9kZS5cbiAgICBpZiAoIHRoaXMuX3Bkb21QYXJlbnQgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wZG9tUGFyZW50Ll9wZG9tT3JkZXIsICdwZG9tUGFyZW50IHNob3VsZCBoYXZlIGEgcGRvbU9yZGVyJyApO1xuICAgICAgY29uc3QgdXBkYXRlZE9yZGVyID0gdGhpcy5fcGRvbVBhcmVudC5fcGRvbU9yZGVyIS5zbGljZSgpO1xuICAgICAgYXJyYXlSZW1vdmUoIHVwZGF0ZWRPcmRlciwgdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKTtcbiAgICAgIHRoaXMuX3Bkb21QYXJlbnQucGRvbU9yZGVyID0gdXBkYXRlZE9yZGVyO1xuICAgIH1cblxuICAgIC8vIGNsZWFyIHJlZmVyZW5jZXMgdG8gdGhlIHBkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlXG4gICAgdGhpcy5zZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSggbnVsbCApO1xuXG4gICAgLy8gQ2xlYXIgYmVoYXZpb3IgZnVuY3Rpb25zIGJlY2F1c2UgdGhleSBtYXkgY3JlYXRlIHJlZmVyZW5jZXMgYmV0d2VlbiBvdGhlciBOb2Rlc1xuICAgIHRoaXMuX2FjY2Vzc2libGVOYW1lQmVoYXZpb3IgPSBQYXJhbGxlbERPTS5CQVNJQ19BQ0NFU1NJQkxFX05BTUVfQkVIQVZJT1I7XG4gICAgdGhpcy5faGVscFRleHRCZWhhdmlvciA9IFBhcmFsbGVsRE9NLkhFTFBfVEVYVF9BRlRFUl9DT05URU5UO1xuICAgIHRoaXMuX3Bkb21IZWFkaW5nQmVoYXZpb3IgPSBERUZBVUxUX1BET01fSEVBRElOR19CRUhBVklPUjtcblxuICAgIC8vIENsZWFyIG91dCBhcmlhIGFzc29jaWF0aW9uIGF0dHJpYnV0ZXMsIHdoaWNoIGhvbGQgcmVmZXJlbmNlcyB0byBvdGhlciBOb2Rlcy5cbiAgICB0aGlzLnNldEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zKCBbXSApO1xuICAgIHRoaXMuc2V0QXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zKCBbXSApO1xuICAgIHRoaXMuc2V0QWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucyggW10gKTtcblxuICAgIC8vIFBET00gYXR0cmlidXRlcyBjYW4gcG90ZW50aWFsbHkgaGF2ZSBsaXN0ZW5lcnMsIHNvIHdlIHdpbGwgY2xlYXIgdGhvc2Ugb3V0LlxuICAgIHRoaXMucmVtb3ZlUERPTUF0dHJpYnV0ZXMoKTtcblxuICAgIHRoaXMuX3Bkb21WaXNpYmxlUHJvcGVydHkuZGlzcG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBwZG9tSW5wdXRFbmFibGVkTGlzdGVuZXIoIGVuYWJsZWQ6IGJvb2xlYW4gKTogdm9pZCB7XG5cbiAgICAvLyBNYXJrIHRoaXMgTm9kZSBhcyBkaXNhYmxlZCBpbiB0aGUgUGFyYWxsZWxET01cbiAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICdhcmlhLWRpc2FibGVkJywgIWVuYWJsZWQgKTtcblxuICAgIC8vIEJ5IHJldHVybmluZyBmYWxzZSwgd2UgcHJldmVudCB0aGUgY29tcG9uZW50IGZyb20gdG9nZ2xpbmcgbmF0aXZlIEhUTUwgZWxlbWVudCBhdHRyaWJ1dGVzIHRoYXQgY29udmV5IHN0YXRlLlxuICAgIC8vIEZvciBleGFtcGxlLHRoaXMgd2lsbCBwcmV2ZW50IGEgY2hlY2tib3ggZnJvbSBjaGFuZ2luZyBgY2hlY2tlZGAgcHJvcGVydHkgd2hpbGUgaXQgaXMgZGlzYWJsZWQuIFRoaXMgd2F5XG4gICAgLy8gd2UgY2FuIGtlZXAgdGhlIGNvbXBvbmVudCBpbiB0cmF2ZXJzYWwgb3JkZXIgYW5kIGRvbid0IG5lZWQgdG8gYWRkIHRoZSBgZGlzYWJsZWRgIGF0dHJpYnV0ZS4gU2VlXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNTE5IGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82NDBcbiAgICAvLyBUaGlzIHNvbHV0aW9uIHdhcyBmb3VuZCBhdCBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTIyNjczNTAvMzQwODUwMlxuICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ29uY2xpY2snLCBlbmFibGVkID8gJycgOiAncmV0dXJuIGZhbHNlJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB3aGV0aGVyIHRoaXMgTm9kZSdzIHByaW1hcnkgRE9NIGVsZW1lbnQgY3VycmVudGx5IGhhcyBmb2N1cy5cbiAgICovXG4gIHB1YmxpYyBpc0ZvY3VzZWQoKTogYm9vbGVhbiB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciE7XG4gICAgICBpZiAoIHBlZXIuaXNGb2N1c2VkKCkgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGZvY3VzZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmlzRm9jdXNlZCgpOyB9XG5cbiAgLyoqXG4gICAqIEZvY3VzIHRoaXMgTm9kZSdzIHByaW1hcnkgZG9tIGVsZW1lbnQuIFRoZSBlbGVtZW50IG11c3Qgbm90IGJlIGhpZGRlbiwgYW5kIGl0IG11c3QgYmUgZm9jdXNhYmxlLiBJZiB0aGUgTm9kZVxuICAgKiBoYXMgbW9yZSB0aGFuIG9uZSBpbnN0YW5jZSwgdGhpcyB3aWxsIGZhaWwgYmVjYXVzZSB0aGUgRE9NIGVsZW1lbnQgaXMgbm90IHVuaXF1ZWx5IGRlZmluZWQuIElmIGFjY2Vzc2liaWxpdHlcbiAgICogaXMgbm90IGVuYWJsZWQsIHRoaXMgd2lsbCBiZSBhIG5vIG9wLiBXaGVuIFBhcmFsbGVsRE9NIGlzIG1vcmUgd2lkZWx5IHVzZWQsIHRoZSBubyBvcCBjYW4gYmUgcmVwbGFjZWRcbiAgICogd2l0aCBhbiBhc3NlcnRpb24gdGhhdCBjaGVja3MgZm9yIHBkb20gY29udGVudC5cbiAgICovXG4gIHB1YmxpYyBmb2N1cygpOiB2b2lkIHtcblxuICAgIC8vIGlmIGEgc2ltIGlzIHJ1bm5pbmcgd2l0aG91dCBhY2Nlc3NpYmlsaXR5IGVuYWJsZWQsIHRoZXJlIHdpbGwgYmUgbm8gYWNjZXNzaWJsZSBpbnN0YW5jZXMsIGJ1dCBmb2N1cygpIG1pZ2h0XG4gICAgLy8gc3RpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYWNjZXNzaWJpbGl0eSBlbmFibGVkXG4gICAgaWYgKCB0aGlzLl9wZG9tSW5zdGFuY2VzLmxlbmd0aCA+IDAgKSB7XG5cbiAgICAgIC8vIHdoZW4gYWNjZXNzaWJpbGl0eSBpcyB3aWRlbHkgdXNlZCwgdGhpcyBhc3NlcnRpb24gY2FuIGJlIGFkZGVkIGJhY2sgaW5cbiAgICAgIC8vIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoID4gMCwgJ3RoZXJlIG11c3QgYmUgcGRvbSBjb250ZW50IGZvciB0aGUgTm9kZSB0byByZWNlaXZlIGZvY3VzJyApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5mb2N1c2FibGUsICd0cnlpbmcgdG8gc2V0IGZvY3VzIG9uIGEgTm9kZSB0aGF0IGlzIG5vdCBmb2N1c2FibGUnICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBkb21WaXNpYmxlLCAndHJ5aW5nIHRvIHNldCBmb2N1cyBvbiBhIE5vZGUgd2l0aCBpbnZpc2libGUgcGRvbSBjb250ZW50JyApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDEsICdmb2N1cygpIHVuc3VwcG9ydGVkIGZvciBOb2RlcyB1c2luZyBEQUcsIHBkb20gY29udGVudCBpcyBub3QgdW5pcXVlJyApO1xuXG4gICAgICBjb25zdCBwZWVyID0gdGhpcy5fcGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGVlciwgJ211c3QgaGF2ZSBhIHBlZXIgdG8gZm9jdXMnICk7XG4gICAgICBwZWVyLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBmb2N1cyBmcm9tIHRoaXMgTm9kZSdzIHByaW1hcnkgRE9NIGVsZW1lbnQuICBUaGUgZm9jdXMgaGlnaGxpZ2h0IHdpbGwgZGlzYXBwZWFyLCBhbmQgdGhlIGVsZW1lbnQgd2lsbCBub3QgcmVjZWl2ZVxuICAgKiBrZXlib2FyZCBldmVudHMgd2hlbiBpdCBkb2Vzbid0IGhhdmUgZm9jdXMuXG4gICAqL1xuICBwdWJsaWMgYmx1cigpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoID4gMCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoID09PSAxLCAnYmx1cigpIHVuc3VwcG9ydGVkIGZvciBOb2RlcyB1c2luZyBEQUcsIHBkb20gY29udGVudCBpcyBub3QgdW5pcXVlJyApO1xuICAgICAgY29uc3QgcGVlciA9IHRoaXMuX3Bkb21JbnN0YW5jZXNbIDAgXS5wZWVyITtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBlZXIsICdtdXN0IGhhdmUgYSBwZWVyIHRvIGJsdXInICk7XG4gICAgICBwZWVyLmJsdXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZCBhbmQgb25jZSB0aGUgTm9kZSBoYXMgYmVlbiBjb21wbGV0ZWx5IGNvbnN0cnVjdGVkLiBUaGlzIGlzIHRoZSB0aW1lIHRvXG4gICAqIG1ha2Ugc3VyZSB0aGF0IG9wdGlvbnMgYXJlIHNldCB1cCB0aGUgd2F5IHRoZXkgYXJlIGV4cGVjdGVkIHRvIGJlLiBGb3IgZXhhbXBsZS4geW91IGRvbid0IHdhbnQgYWNjZXNzaWJsZU5hbWVcbiAgICogYW5kIGxhYmVsQ29udGVudCBkZWNsYXJlZC5cbiAgICogKG9ubHkgY2FsbGVkIGJ5IFNjcmVlbi5qcylcbiAgICovXG4gIHB1YmxpYyBwZG9tQXVkaXQoKTogdm9pZCB7XG5cbiAgICBpZiAoIHRoaXMuaGFzUERPTUNvbnRlbnQgJiYgYXNzZXJ0ICkge1xuXG4gICAgICB0aGlzLl9pbnB1dFR5cGUgJiYgYXNzZXJ0KCB0aGlzLl90YWdOYW1lIS50b1VwcGVyQ2FzZSgpID09PSBJTlBVVF9UQUcsICd0YWdOYW1lIG11c3QgYmUgSU5QVVQgdG8gc3VwcG9ydCBpbnB1dFR5cGUnICk7XG4gICAgICB0aGlzLl9wZG9tQ2hlY2tlZCAmJiBhc3NlcnQoIHRoaXMuX3RhZ05hbWUhLnRvVXBwZXJDYXNlKCkgPT09IElOUFVUX1RBRywgJ3RhZ05hbWUgbXVzdCBiZSBJTlBVVCB0byBzdXBwb3J0IHBkb21DaGVja2VkLicgKTtcbiAgICAgIHRoaXMuX2lucHV0VmFsdWUgJiYgYXNzZXJ0KCB0aGlzLl90YWdOYW1lIS50b1VwcGVyQ2FzZSgpID09PSBJTlBVVF9UQUcsICd0YWdOYW1lIG11c3QgYmUgSU5QVVQgdG8gc3VwcG9ydCBpbnB1dFZhbHVlJyApO1xuICAgICAgdGhpcy5fcGRvbUNoZWNrZWQgJiYgYXNzZXJ0KCBJTlBVVF9UWVBFU19USEFUX1NVUFBPUlRfQ0hFQ0tFRC5pbmNsdWRlcyggdGhpcy5faW5wdXRUeXBlIS50b1VwcGVyQ2FzZSgpICksIGBpbnB1dFR5cGUgZG9lcyBub3Qgc3VwcG9ydCBjaGVja2VkIGF0dHJpYnV0ZTogJHt0aGlzLl9pbnB1dFR5cGV9YCApO1xuICAgICAgdGhpcy5fZm9jdXNIaWdobGlnaHRMYXllcmFibGUgJiYgYXNzZXJ0KCB0aGlzLmZvY3VzSGlnaGxpZ2h0IGluc3RhbmNlb2YgTm9kZSwgJ2ZvY3VzSGlnaGxpZ2h0IG11c3QgYmUgTm9kZSBpZiBoaWdobGlnaHQgaXMgbGF5ZXJhYmxlJyApO1xuICAgICAgdGhpcy5fdGFnTmFtZSEudG9VcHBlckNhc2UoKSA9PT0gSU5QVVRfVEFHICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX2lucHV0VHlwZSA9PT0gJ3N0cmluZycsICcgaW5wdXRUeXBlIGV4cGVjdGVkIGZvciBpbnB1dCcgKTtcblxuICAgICAgLy8gbm90ZSB0aGF0IG1vc3QgdGhpbmdzIHRoYXQgYXJlIG5vdCBmb2N1c2FibGUgYnkgZGVmYXVsdCBuZWVkIGlubmVyQ29udGVudCB0byBiZSBmb2N1c2FibGUgb24gVm9pY2VPdmVyLFxuICAgICAgLy8gYnV0IHRoaXMgd2lsbCBjYXRjaCBtb3N0IGNhc2VzIHNpbmNlIG9mdGVuIHRoaW5ncyB0aGF0IGdldCBhZGRlZCB0byB0aGUgZm9jdXMgb3JkZXIgaGF2ZSB0aGUgYXBwbGljYXRpb25cbiAgICAgIC8vIHJvbGUgZm9yIGN1c3RvbSBpbnB1dC4gTm90ZSB0aGF0IGFjY2Vzc2libGVOYW1lIHdpbGwgbm90IGJlIGNoZWNrZWQgdGhhdCBpdCBzcGVjaWZpY2FsbHkgY2hhbmdlcyBpbm5lckNvbnRlbnQsIGl0IGlzIHVwIHRvIHRoZSBkZXYgdG8gZG8gdGhpcy5cbiAgICAgIHRoaXMuYXJpYVJvbGUgPT09ICdhcHBsaWNhdGlvbicgJiYgYXNzZXJ0KCB0aGlzLmlubmVyQ29udGVudCB8fCB0aGlzLmFjY2Vzc2libGVOYW1lLCAnbXVzdCBoYXZlIHNvbWUgaW5uZXJDb250ZW50IG9yIGVsZW1lbnQgd2lsbCBuZXZlciBiZSBmb2N1c2FibGUgaW4gVm9pY2VPdmVyJyApO1xuICAgIH1cblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8ICggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgICggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5jaGlsZHJlblsgaSBdLnBkb21BdWRpdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgLy8gSElHSEVSIExFVkVMIEFQSTogR0VUVEVSUyBBTkQgU0VUVEVSUyBGT1IgUERPTSBBUEkgT1BUSU9OU1xuICAvL1xuICAvLyBUaGVzZSBmdW5jdGlvbnMgdXRpbGl6ZSB0aGUgbG93ZXIgbGV2ZWwgQVBJIHRvIGFjaGlldmUgYSBjb25zaXN0ZW5jZSwgYW5kIGNvbnZlbmllbnQgQVBJIGZvciBhZGRpbmdcbiAgLy8gcGRvbSBjb250ZW50IHRvIHRoZSBQRE9NLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzc5NVxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFjY2Vzc2libGUgbmFtZSB0aGF0IGRlc2NyaWJlcyB0aGlzIE5vZGUuIFRoZSBhY2Nlc3NpYmxlIG5hbWUgaXMgdGhlIHNlbWFudGljIHRpdGxlIGZvciB0aGUgTm9kZS4gSXQgaXNcbiAgICogdGhlIGNvbnRlbnQgdGhhdCB3aWxsIGJlIHJlYWQgYnkgYSBzY3JlZW4gcmVhZGVyIHdoZW4gdGhlIE5vZGUgaXMgZGlzY292ZXJlZCBieSB0aGUgdmlydHVhbCBjdXJzb3IuXG4gICAqXG4gICAqIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGFjY2Vzc2libGUgbmFtZXMgaW4gd2ViIGFjY2Vzc2liaWxpdHkgc2VlXG4gICAqIGh0dHBzOi8vZGV2ZWxvcGVyLnBhY2llbGxvZ3JvdXAuY29tL2Jsb2cvMjAxNy8wNC93aGF0LWlzLWFuLWFjY2Vzc2libGUtbmFtZS8uXG4gICAqXG4gICAqIFBhcnQgb2YgdGhlIGhpZ2hlciBsZXZlbCBBUEksIHRoZSBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIGZ1bmN0aW9uIHdpbGwgc2V0IHRoZSBhcHByb3ByaWF0ZSBvcHRpb25zIG9uIHRoaXMgTm9kZVxuICAgKiB0byBjcmVhdGUgdGhlIGRlc2lyZWQgYWNjZXNzaWJsZSBuYW1lLiBTZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIHNldEFjY2Vzc2libGVOYW1lQmVoYXZpb3IoKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzZXRBY2Nlc3NpYmxlTmFtZSggYWNjZXNzaWJsZU5hbWU6IFBET01WYWx1ZVR5cGUgfCBudWxsICk6IHZvaWQge1xuICAgIGlmICggYWNjZXNzaWJsZU5hbWUgIT09IHRoaXMuX2FjY2Vzc2libGVOYW1lICkge1xuICAgICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCB0aGlzLl9hY2Nlc3NpYmxlTmFtZSApICYmICF0aGlzLl9hY2Nlc3NpYmxlTmFtZS5pc0Rpc3Bvc2VkICkge1xuICAgICAgICB0aGlzLl9hY2Nlc3NpYmxlTmFtZS51bmxpbmsoIHRoaXMuX29uUERPTUNvbnRlbnRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9hY2Nlc3NpYmxlTmFtZSA9IGFjY2Vzc2libGVOYW1lO1xuXG4gICAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIGFjY2Vzc2libGVOYW1lICkgKSB7XG4gICAgICAgIGFjY2Vzc2libGVOYW1lLmxhenlMaW5rKCB0aGlzLl9vblBET01Db250ZW50Q2hhbmdlTGlzdGVuZXIgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vblBET01Db250ZW50Q2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBhY2Nlc3NpYmxlTmFtZSggYWNjZXNzaWJsZU5hbWU6IFBET01WYWx1ZVR5cGUgfCBudWxsICkgeyB0aGlzLnNldEFjY2Vzc2libGVOYW1lKCBhY2Nlc3NpYmxlTmFtZSApOyB9XG5cbiAgcHVibGljIGdldCBhY2Nlc3NpYmxlTmFtZSgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0QWNjZXNzaWJsZU5hbWUoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGFjY2Vzc2libGUgbmFtZSB0aGF0IGRlc2NyaWJlcyB0aGlzIE5vZGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0QWNjZXNzaWJsZU5hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCB0aGlzLl9hY2Nlc3NpYmxlTmFtZSApICkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FjY2Vzc2libGVOYW1lLnZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9hY2Nlc3NpYmxlTmFtZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoaXMgTm9kZSBmcm9tIHRoZSBQRE9NIGJ5IGNsZWFyaW5nIGl0cyBwZG9tIGNvbnRlbnQuIFRoaXMgY2FuIGJlIHVzZWZ1bCB3aGVuIGNyZWF0aW5nIGljb25zIGZyb21cbiAgICogcGRvbSBjb250ZW50LlxuICAgKi9cbiAgcHVibGljIHJlbW92ZUZyb21QRE9NKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3RhZ05hbWUgIT09IG51bGwsICdUaGVyZSBpcyBubyBwZG9tIGNvbnRlbnQgdG8gY2xlYXIgZnJvbSB0aGUgUERPTScgKTtcbiAgICB0aGlzLnRhZ05hbWUgPSBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogYWNjZXNzaWJsZU5hbWVCZWhhdmlvciBpcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBzZXQgdGhlIGFwcHJvcHJpYXRlIG9wdGlvbnMgb24gdGhpcyBOb2RlIHRvIGdldCB0aGUgZGVzaXJlZFxuICAgKiBhY2Nlc3NpYmxlIG5hbWUuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IHZhbHVlIGRvZXMgdGhlIGJlc3QgaXQgY2FuIHRvIGNyZWF0ZSBhbiBhY2Nlc3NpYmxlIG5hbWUgZm9yIGEgdmFyaWV0eSBvZiBkaWZmZXJlbnQgUGFyYWxsZWxET01cbiAgICogb3B0aW9ucyBhbmQgdGFnIG5hbWVzLiBJZiBhIE5vZGUgdXNlcyBtb3JlIGNvbXBsaWNhdGVkIG1hcmt1cCwgeW91IGNhbiBwcm92aWRlIHlvdXIgb3duIGZ1bmN0aW9uIHRvXG4gICAqIG1lZXQgeW91ciByZXF1aXJlbWVudHMuIElmIHlvdSBkbyB0aGlzLCBpdCBpcyB1cCB0byB5b3UgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIEFjY2Vzc2libGUgTmFtZSBpcyBwcm9wZXJseVxuICAgKiBiZWluZyBzZXQgYW5kIGNvbnZleWVkIHRvIEFULCBhcyBpdCBpcyB2ZXJ5IGhhcmQgdG8gdmFsaWRhdGUgdGhpcyBmdW5jdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzZXRBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yKCBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiApOiB2b2lkIHtcblxuICAgIGlmICggdGhpcy5fYWNjZXNzaWJsZU5hbWVCZWhhdmlvciAhPT0gYWNjZXNzaWJsZU5hbWVCZWhhdmlvciApIHtcblxuICAgICAgdGhpcy5fYWNjZXNzaWJsZU5hbWVCZWhhdmlvciA9IGFjY2Vzc2libGVOYW1lQmVoYXZpb3I7XG5cbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgYWNjZXNzaWJsZU5hbWVCZWhhdmlvciggYWNjZXNzaWJsZU5hbWVCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb24gKSB7IHRoaXMuc2V0QWNjZXNzaWJsZU5hbWVCZWhhdmlvciggYWNjZXNzaWJsZU5hbWVCZWhhdmlvciApOyB9XG5cbiAgcHVibGljIGdldCBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yKCk6IFBET01CZWhhdmlvckZ1bmN0aW9uIHsgcmV0dXJuIHRoaXMuZ2V0QWNjZXNzaWJsZU5hbWVCZWhhdmlvcigpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgaGVscCB0ZXh0IG9mIHRoZSBpbnRlcmFjdGl2ZSBlbGVtZW50LlxuICAgKi9cbiAgcHVibGljIGdldEFjY2Vzc2libGVOYW1lQmVoYXZpb3IoKTogUERPTUJlaGF2aW9yRnVuY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLl9hY2Nlc3NpYmxlTmFtZUJlaGF2aW9yO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgTm9kZSBoZWFkaW5nIGNvbnRlbnQuIFRoaXMgYnkgZGVmYXVsdCB3aWxsIGJlIGEgaGVhZGluZyB0YWcgd2hvc2UgbGV2ZWwgaXMgZGVwZW5kZW50IG9uIGhvdyBtYW55IHBhcmVudHNcbiAgICogTm9kZXMgYXJlIGhlYWRpbmcgTm9kZXMuIFNlZSBjb21wdXRlSGVhZGluZ0xldmVsKCkgZm9yIG1vcmUgaW5mb1xuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcbiAgICovXG4gIHB1YmxpYyBzZXRQRE9NSGVhZGluZyggcGRvbUhlYWRpbmc6IFBET01WYWx1ZVR5cGUgfCBudWxsICk6IHZvaWQge1xuICAgIGlmICggcGRvbUhlYWRpbmcgIT09IHRoaXMuX3Bkb21IZWFkaW5nICkge1xuICAgICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCB0aGlzLl9wZG9tSGVhZGluZyApICYmICF0aGlzLl9wZG9tSGVhZGluZy5pc0Rpc3Bvc2VkICkge1xuICAgICAgICB0aGlzLl9wZG9tSGVhZGluZy51bmxpbmsoIHRoaXMuX29uUERPTUNvbnRlbnRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9wZG9tSGVhZGluZyA9IHBkb21IZWFkaW5nO1xuXG4gICAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHBkb21IZWFkaW5nICkgKSB7XG4gICAgICAgIHBkb21IZWFkaW5nLmxhenlMaW5rKCB0aGlzLl9vblBET01Db250ZW50Q2hhbmdlTGlzdGVuZXIgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vblBET01Db250ZW50Q2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBwZG9tSGVhZGluZyggcGRvbUhlYWRpbmc6IFBET01WYWx1ZVR5cGUgfCBudWxsICkgeyB0aGlzLnNldFBET01IZWFkaW5nKCBwZG9tSGVhZGluZyApOyB9XG5cbiAgcHVibGljIGdldCBwZG9tSGVhZGluZygpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0UERPTUhlYWRpbmcoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHZhbHVlIG9mIHRoaXMgTm9kZSdzIGhlYWRpbmcuIFVzZSBudWxsIHRvIGNsZWFyIHRoZSBoZWFkaW5nXG4gICAqXG4gICAqIEBleHBlcmltZW50YWwgLSBOT1RFOiB1c2Ugd2l0aCBjYXV0aW9uLCBhMTF5IHRlYW0gcmVzZXJ2ZXMgdGhlIHJpZ2h0IHRvIGNoYW5nZSBBUEkgKHRob3VnaCB1bmxpa2VseSkuXG4gICAqICAgICAgICAgICAgICAgICBOb3QgeWV0IGZ1bGx5IGltcGxlbWVudGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg2N1xuICAgKi9cbiAgcHVibGljIGdldFBET01IZWFkaW5nKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggdGhpcy5fcGRvbUhlYWRpbmcgKSApIHtcbiAgICAgIHJldHVybiB0aGlzLl9wZG9tSGVhZGluZy52YWx1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGRvbUhlYWRpbmc7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgYmVoYXZpb3Igb2YgaG93IGB0aGlzLnBkb21IZWFkaW5nYCBpcyBzZXQgaW4gdGhlIFBET00uIFNlZSBkZWZhdWx0IGJlaGF2aW9yIGZ1bmN0aW9uIGZvciBtb3JlXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcbiAgICovXG4gIHB1YmxpYyBzZXRQRE9NSGVhZGluZ0JlaGF2aW9yKCBwZG9tSGVhZGluZ0JlaGF2aW9yOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiApOiB2b2lkIHtcblxuICAgIGlmICggdGhpcy5fcGRvbUhlYWRpbmdCZWhhdmlvciAhPT0gcGRvbUhlYWRpbmdCZWhhdmlvciApIHtcblxuICAgICAgdGhpcy5fcGRvbUhlYWRpbmdCZWhhdmlvciA9IHBkb21IZWFkaW5nQmVoYXZpb3I7XG5cbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgcGRvbUhlYWRpbmdCZWhhdmlvciggcGRvbUhlYWRpbmdCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb24gKSB7IHRoaXMuc2V0UERPTUhlYWRpbmdCZWhhdmlvciggcGRvbUhlYWRpbmdCZWhhdmlvciApOyB9XG5cbiAgcHVibGljIGdldCBwZG9tSGVhZGluZ0JlaGF2aW9yKCk6IFBET01CZWhhdmlvckZ1bmN0aW9uIHsgcmV0dXJuIHRoaXMuZ2V0UERPTUhlYWRpbmdCZWhhdmlvcigpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgaGVscCB0ZXh0IG9mIHRoZSBpbnRlcmFjdGl2ZSBlbGVtZW50LlxuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcbiAgICovXG4gIHB1YmxpYyBnZXRQRE9NSGVhZGluZ0JlaGF2aW9yKCk6IFBET01CZWhhdmlvckZ1bmN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fcGRvbUhlYWRpbmdCZWhhdmlvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRhZyBuYW1lIG9mIHRoZSBET00gZWxlbWVudCByZXByZXNlbnRpbmcgdGhpcyBOb2RlIGZvciBhY2Nlc3NpYmlsaXR5LlxuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcbiAgICovXG4gIHB1YmxpYyBnZXRIZWFkaW5nTGV2ZWwoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYWRpbmdMZXZlbDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGVhZGluZ0xldmVsKCk6IG51bWJlciB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRIZWFkaW5nTGV2ZWwoKTsgfVxuXG5cbiAgLyoqXG4gICAvLyBUT0RPOiB3aGF0IGlmIGFuY2VzdG9yIGNoYW5nZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODU1XG4gICAqIFNldHMgdGhpcyBOb2RlJ3MgaGVhZGluZyBsZXZlbCwgYnkgcmVjdXJzaW5nIHVwIHRoZSBhY2Nlc3NpYmlsaXR5IHRyZWUgdG8gZmluZCBoZWFkaW5ncyB0aGlzIE5vZGVcbiAgICogaXMgbmVzdGVkIHVuZGVyLlxuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZUhlYWRpbmdMZXZlbCgpOiBudW1iZXIge1xuXG4gICAgLy8gVE9ETzogYXNzZXJ0Pz8/IGFzc2VydCggdGhpcy5oZWFkaW5nTGV2ZWwgfHwgdGhpcy5fcGRvbVBhcmVudCk7IHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODU1XG4gICAgLy8gRWl0aGVyIF4gd2hpY2ggbWF5IGJyZWFrIGR1cmluZyBjb25zdHJ1Y3Rpb24sIG9yIFYgKGJlbG93KVxuICAgIC8vICBiYXNlIGNhc2UgdG8gaGVhZGluZyBsZXZlbCAxXG4gICAgaWYgKCAhdGhpcy5fcGRvbVBhcmVudCApIHtcbiAgICAgIGlmICggdGhpcy5wZG9tSGVhZGluZyApIHtcbiAgICAgICAgdGhpcy5faGVhZGluZ0xldmVsID0gMTtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gMDsgLy8gc28gdGhhdCB0aGUgZmlyc3QgTm9kZSB3aXRoIGEgaGVhZGluZyBpcyBoZWFkaW5nTGV2ZWwgMVxuICAgIH1cblxuICAgIGlmICggdGhpcy5wZG9tSGVhZGluZyApIHtcbiAgICAgIGNvbnN0IGxldmVsID0gdGhpcy5fcGRvbVBhcmVudC5jb21wdXRlSGVhZGluZ0xldmVsKCkgKyAxO1xuICAgICAgdGhpcy5faGVhZGluZ0xldmVsID0gbGV2ZWw7XG4gICAgICByZXR1cm4gbGV2ZWw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3Bkb21QYXJlbnQuY29tcHV0ZUhlYWRpbmdMZXZlbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoZWxwIHRleHQgZm9yIHRoaXMgTm9kZS4gSGVscCB0ZXh0IHVzdWFsbHkgcHJvdmlkZXMgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0aGF0IGRlc2NyaWJlcyB3aGF0IGEgTm9kZVxuICAgKiBpcyBvciBob3cgdG8gaW50ZXJhY3Qgd2l0aCBpdC4gSXQgd2lsbCBiZSByZWFkIGJ5IGEgc2NyZWVuIHJlYWRlciB3aGVuIGRpc2NvdmVyZWQgYnkgdGhlIHZpcnR1YWwgY3Vyc29yLlxuICAgKlxuICAgKiBQYXJ0IG9mIHRoZSBoaWdoZXIgbGV2ZWwgQVBJLCB0aGUgaGVscFRleHRCZWhhdmlvciBmdW5jdGlvbiB3aWxsIHNldCB0aGUgYXBwcm9wcmlhdGUgb3B0aW9ucyBvbiB0aGlzIE5vZGVcbiAgICogdG8gY3JlYXRlIHRoZSBkZXNpcmVkIGhlbHAgdGV4dC4gU2VlIHRoZSBkb2N1bWVudGF0aW9uIGZvciBzZXRIZWxwVGV4dEJlaGF2aW9yKCkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAqL1xuICBwdWJsaWMgc2V0SGVscFRleHQoIGhlbHBUZXh0OiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApOiB2b2lkIHtcbiAgICBpZiAoIGhlbHBUZXh0ICE9PSB0aGlzLl9oZWxwVGV4dCApIHtcbiAgICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggdGhpcy5faGVscFRleHQgKSAmJiAhdGhpcy5faGVscFRleHQuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgdGhpcy5faGVscFRleHQudW5saW5rKCB0aGlzLl9vblBET01Db250ZW50Q2hhbmdlTGlzdGVuZXIgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5faGVscFRleHQgPSBoZWxwVGV4dDtcblxuICAgICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCBoZWxwVGV4dCApICkge1xuICAgICAgICBoZWxwVGV4dC5sYXp5TGluayggdGhpcy5fb25QRE9NQ29udGVudENoYW5nZUxpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgaGVscFRleHQoIGhlbHBUZXh0OiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApIHsgdGhpcy5zZXRIZWxwVGV4dCggaGVscFRleHQgKTsgfVxuXG4gIHB1YmxpYyBnZXQgaGVscFRleHQoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldEhlbHBUZXh0KCk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSBoZWxwIHRleHQgZm9yIHRoaXMgTm9kZS5cbiAgICovXG4gIHB1YmxpYyBnZXRIZWxwVGV4dCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHRoaXMuX2hlbHBUZXh0ICkgKSB7XG4gICAgICByZXR1cm4gdGhpcy5faGVscFRleHQudmFsdWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2hlbHBUZXh0O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBoZWxwVGV4dEJlaGF2aW9yIGlzIGEgZnVuY3Rpb24gdGhhdCB3aWxsIHNldCB0aGUgYXBwcm9wcmlhdGUgb3B0aW9ucyBvbiB0aGlzIE5vZGUgdG8gZ2V0IHRoZSBkZXNpcmVkIGhlbHAgdGV4dC5cbiAgICpcbiAgICogVGhlIGRlZmF1bHQgdmFsdWUgZG9lcyB0aGUgYmVzdCBpdCBjYW4gdG8gY3JlYXRlIHRoZSBoZWxwIHRleHQgYmFzZWQgb24gdGhlIHZhbHVlcyBmb3Igb3RoZXIgUGFyYWxsZWxET00gb3B0aW9ucy5cbiAgICogVXN1YWxseSwgdGhpcyBpcyBhIHBhcmFncmFwaCBlbGVtZW50IHRoYXQgY29tZXMgYWZ0ZXIgdGhlIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcgaW4gdGhlIFBET00uIElmIHlvdSBuZWVkIHRvXG4gICAqIGN1c3RvbWl6ZSB0aGlzIGJlaGF2aW9yLCB5b3UgY2FuIHByb3ZpZGUgeW91ciBvd24gZnVuY3Rpb24gdG8gbWVldCB5b3VyIHJlcXVpcmVtZW50cy4gSWYgeW91IHByb3ZpZGUgeW91ciBvd25cbiAgICogZnVuY3Rpb24sIGl0IGlzIHVwIHRvIHlvdSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgaGVscCB0ZXh0IGlzIHByb3Blcmx5IGJlaW5nIHNldCBhbmQgaXMgZGlzY292ZXJhYmxlIGJ5IEFULlxuICAgKi9cbiAgcHVibGljIHNldEhlbHBUZXh0QmVoYXZpb3IoIGhlbHBUZXh0QmVoYXZpb3I6IFBET01CZWhhdmlvckZ1bmN0aW9uICk6IHZvaWQge1xuXG4gICAgaWYgKCB0aGlzLl9oZWxwVGV4dEJlaGF2aW9yICE9PSBoZWxwVGV4dEJlaGF2aW9yICkge1xuXG4gICAgICB0aGlzLl9oZWxwVGV4dEJlaGF2aW9yID0gaGVscFRleHRCZWhhdmlvcjtcblxuICAgICAgdGhpcy5vblBET01Db250ZW50Q2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBoZWxwVGV4dEJlaGF2aW9yKCBoZWxwVGV4dEJlaGF2aW9yOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiApIHsgdGhpcy5zZXRIZWxwVGV4dEJlaGF2aW9yKCBoZWxwVGV4dEJlaGF2aW9yICk7IH1cblxuICBwdWJsaWMgZ2V0IGhlbHBUZXh0QmVoYXZpb3IoKTogUERPTUJlaGF2aW9yRnVuY3Rpb24geyByZXR1cm4gdGhpcy5nZXRIZWxwVGV4dEJlaGF2aW9yKCk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSBoZWxwIHRleHQgb2YgdGhlIGludGVyYWN0aXZlIGVsZW1lbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0SGVscFRleHRCZWhhdmlvcigpOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2hlbHBUZXh0QmVoYXZpb3I7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgLy8gTE9XRVIgTEVWRUwgR0VUVEVSUyBBTkQgU0VUVEVSUyBGT1IgUERPTSBBUEkgT1BUSU9OU1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGFnIG5hbWUgZm9yIHRoZSBwcmltYXJ5IHNpYmxpbmcgaW4gdGhlIFBET00uIERPTSBlbGVtZW50IHRhZyBuYW1lcyBhcmUgcmVhZC1vbmx5LCBzbyB0aGlzXG4gICAqIGZ1bmN0aW9uIHdpbGwgY3JlYXRlIGEgbmV3IERPTSBlbGVtZW50IGVhY2ggdGltZSBpdCBpcyBjYWxsZWQgZm9yIHRoZSBOb2RlJ3MgUERPTVBlZXIgYW5kXG4gICAqIHJlc2V0IHRoZSBwZG9tIGNvbnRlbnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIFwiZW50cnkgcG9pbnRcIiBmb3IgUGFyYWxsZWwgRE9NIGNvbnRlbnQuIFdoZW4gYSBOb2RlIGhhcyBhIHRhZ05hbWUgaXQgd2lsbCBhcHBlYXIgaW4gdGhlIFBhcmFsbGVsIERPTVxuICAgKiBhbmQgb3RoZXIgYXR0cmlidXRlcyBjYW4gYmUgc2V0LiBXaXRob3V0IGl0LCBub3RoaW5nIHdpbGwgYXBwZWFyIGluIHRoZSBQYXJhbGxlbCBET00uXG4gICAqL1xuICBwdWJsaWMgc2V0VGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0YWdOYW1lID09PSBudWxsIHx8IHR5cGVvZiB0YWdOYW1lID09PSAnc3RyaW5nJyApO1xuXG4gICAgaWYgKCB0YWdOYW1lICE9PSB0aGlzLl90YWdOYW1lICkge1xuICAgICAgdGhpcy5fdGFnTmFtZSA9IHRhZ05hbWU7XG5cbiAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgYmUgc2V0dGluZyBQRE9NIGNvbnRlbnQgdHdpY2UgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgdGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApIHsgdGhpcy5zZXRUYWdOYW1lKCB0YWdOYW1lICk7IH1cblxuICBwdWJsaWMgZ2V0IHRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFRhZ05hbWUoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRhZyBuYW1lIG9mIHRoZSBET00gZWxlbWVudCByZXByZXNlbnRpbmcgdGhpcyBOb2RlIGZvciBhY2Nlc3NpYmlsaXR5LlxuICAgKi9cbiAgcHVibGljIGdldFRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3RhZ05hbWU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0YWcgbmFtZSBmb3IgdGhlIGFjY2Vzc2libGUgbGFiZWwgc2libGluZyBmb3IgdGhpcyBOb2RlLiBET00gZWxlbWVudCB0YWcgbmFtZXMgYXJlIHJlYWQtb25seSxcbiAgICogc28gdGhpcyB3aWxsIHJlcXVpcmUgY3JlYXRpbmcgYSBuZXcgUERPTVBlZXIgZm9yIHRoaXMgTm9kZSAocmVjb25zdHJ1Y3RpbmcgYWxsIERPTSBFbGVtZW50cykuIElmXG4gICAqIGxhYmVsQ29udGVudCBpcyBzcGVjaWZpZWQgd2l0aG91dCBjYWxsaW5nIHRoaXMgbWV0aG9kLCB0aGVuIHRoZSBERUZBVUxUX0xBQkVMX1RBR19OQU1FIHdpbGwgYmUgdXNlZCBhcyB0aGVcbiAgICogdGFnIG5hbWUgZm9yIHRoZSBsYWJlbCBzaWJsaW5nLiBVc2UgbnVsbCB0byBjbGVhciB0aGUgbGFiZWwgc2libGluZyBlbGVtZW50IGZyb20gdGhlIFBET00uXG4gICAqL1xuICBwdWJsaWMgc2V0TGFiZWxUYWdOYW1lKCB0YWdOYW1lOiBzdHJpbmcgfCBudWxsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRhZ05hbWUgPT09IG51bGwgfHwgdHlwZW9mIHRhZ05hbWUgPT09ICdzdHJpbmcnICk7XG5cbiAgICBpZiAoIHRhZ05hbWUgIT09IHRoaXMuX2xhYmVsVGFnTmFtZSApIHtcbiAgICAgIHRoaXMuX2xhYmVsVGFnTmFtZSA9IHRhZ05hbWU7XG5cbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgbGFiZWxUYWdOYW1lKCB0YWdOYW1lOiBzdHJpbmcgfCBudWxsICkgeyB0aGlzLnNldExhYmVsVGFnTmFtZSggdGFnTmFtZSApOyB9XG5cbiAgcHVibGljIGdldCBsYWJlbFRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldExhYmVsVGFnTmFtZSgpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGFiZWwgc2libGluZyBIVE1MIHRhZyBuYW1lLlxuICAgKi9cbiAgcHVibGljIGdldExhYmVsVGFnTmFtZSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbGFiZWxUYWdOYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGFnIG5hbWUgZm9yIHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nLiBIVE1MIGVsZW1lbnQgdGFnIG5hbWVzIGFyZSByZWFkLW9ubHksIHNvIHRoaXMgd2lsbCByZXF1aXJlIGNyZWF0aW5nXG4gICAqIGEgbmV3IEhUTUwgZWxlbWVudCwgYW5kIGluc2VydGluZyBpdCBpbnRvIHRoZSBET00uIFRoZSB0YWcgbmFtZSBwcm92aWRlZCBtdXN0IHN1cHBvcnRcbiAgICogaW5uZXJIVE1MIGFuZCB0ZXh0Q29udGVudC4gSWYgZGVzY3JpcHRpb25Db250ZW50IGlzIHNwZWNpZmllZCB3aXRob3V0IHRoaXMgb3B0aW9uLFxuICAgKiB0aGVuIGRlc2NyaXB0aW9uVGFnTmFtZSB3aWxsIGJlIHNldCB0byBERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FLlxuICAgKlxuICAgKiBQYXNzaW5nICdudWxsJyB3aWxsIGNsZWFyIGF3YXkgdGhlIGRlc2NyaXB0aW9uIHNpYmxpbmcuXG4gICAqL1xuICBwdWJsaWMgc2V0RGVzY3JpcHRpb25UYWdOYW1lKCB0YWdOYW1lOiBzdHJpbmcgfCBudWxsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRhZ05hbWUgPT09IG51bGwgfHwgdHlwZW9mIHRhZ05hbWUgPT09ICdzdHJpbmcnICk7XG5cbiAgICBpZiAoIHRhZ05hbWUgIT09IHRoaXMuX2Rlc2NyaXB0aW9uVGFnTmFtZSApIHtcblxuICAgICAgdGhpcy5fZGVzY3JpcHRpb25UYWdOYW1lID0gdGFnTmFtZTtcblxuICAgICAgdGhpcy5vblBET01Db250ZW50Q2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBkZXNjcmlwdGlvblRhZ05hbWUoIHRhZ05hbWU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0RGVzY3JpcHRpb25UYWdOYW1lKCB0YWdOYW1lICk7IH1cblxuICBwdWJsaWMgZ2V0IGRlc2NyaXB0aW9uVGFnTmFtZSgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0RGVzY3JpcHRpb25UYWdOYW1lKCk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSBIVE1MIHRhZyBuYW1lIGZvciB0aGUgZGVzY3JpcHRpb24gc2libGluZy5cbiAgICovXG4gIHB1YmxpYyBnZXREZXNjcmlwdGlvblRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9uVGFnTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0eXBlIGZvciBhbiBpbnB1dCBlbGVtZW50LiAgRWxlbWVudCBtdXN0IGhhdmUgdGhlIElOUFVUIHRhZyBuYW1lLiBUaGUgaW5wdXQgYXR0cmlidXRlIGlzIG5vdFxuICAgKiBzcGVjaWZpZWQgYXMgcmVhZG9ubHksIHNvIGludmFsaWRhdGluZyBwZG9tIGNvbnRlbnQgaXMgbm90IG5lY2Vzc2FyeS5cbiAgICovXG4gIHB1YmxpYyBzZXRJbnB1dFR5cGUoIGlucHV0VHlwZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnB1dFR5cGUgPT09IG51bGwgfHwgdHlwZW9mIGlucHV0VHlwZSA9PT0gJ3N0cmluZycgKTtcbiAgICBhc3NlcnQgJiYgdGhpcy50YWdOYW1lICYmIGFzc2VydCggdGhpcy5fdGFnTmFtZSEudG9VcHBlckNhc2UoKSA9PT0gSU5QVVRfVEFHLCAndGFnIG5hbWUgbXVzdCBiZSBJTlBVVCB0byBzdXBwb3J0IGlucHV0VHlwZScgKTtcblxuICAgIGlmICggaW5wdXRUeXBlICE9PSB0aGlzLl9pbnB1dFR5cGUgKSB7XG5cbiAgICAgIHRoaXMuX2lucHV0VHlwZSA9IGlucHV0VHlwZTtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciE7XG5cbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBhdHRyaWJ1dGUgaWYgY2xlYXJlZCBieSBzZXR0aW5nIHRvICdudWxsJ1xuICAgICAgICBpZiAoIGlucHV0VHlwZSA9PT0gbnVsbCApIHtcbiAgICAgICAgICBwZWVyLnJlbW92ZUF0dHJpYnV0ZUZyb21FbGVtZW50KCAndHlwZScgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBwZWVyLnNldEF0dHJpYnV0ZVRvRWxlbWVudCggJ3R5cGUnLCBpbnB1dFR5cGUgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgaW5wdXRUeXBlKCBpbnB1dFR5cGU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0SW5wdXRUeXBlKCBpbnB1dFR5cGUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgaW5wdXRUeXBlKCk6IHN0cmluZyB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRJbnB1dFR5cGUoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGlucHV0IHR5cGUuIElucHV0IHR5cGUgaXMgb25seSByZWxldmFudCBpZiB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcgaGFzIHRhZyBuYW1lIFwiSU5QVVRcIi5cbiAgICovXG4gIHB1YmxpYyBnZXRJbnB1dFR5cGUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2lucHV0VHlwZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCeSBkZWZhdWx0IHRoZSBsYWJlbCB3aWxsIGJlIHByZXBlbmRlZCBiZWZvcmUgdGhlIHByaW1hcnkgc2libGluZyBpbiB0aGUgUERPTS4gVGhpc1xuICAgKiBvcHRpb24gYWxsb3dzIHlvdSB0byBpbnN0ZWFkIGhhdmUgdGhlIGxhYmVsIGFkZGVkIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcuIE5vdGU6IFRoZSBsYWJlbCB3aWxsIGFsd2F5c1xuICAgKiBiZSBpbiBmcm9udCBvZiB0aGUgZGVzY3JpcHRpb24gc2libGluZy4gSWYgdGhpcyBmbGFnIGlzIHNldCB3aXRoIGBhcHBlbmREZXNjcmlwdGlvbmAsIHRoZSBvcmRlciB3aWxsIGJlXG4gICAqXG4gICAqIDxjb250YWluZXI+XG4gICAqICAgPHByaW1hcnkgc2libGluZy8+XG4gICAqICAgPGxhYmVsIHNpYmxpbmcvPlxuICAgKiAgIDxkZXNjcmlwdGlvbiBzaWJsaW5nLz5cbiAgICogPC9jb250YWluZXI+XG4gICAqL1xuICBwdWJsaWMgc2V0QXBwZW5kTGFiZWwoIGFwcGVuZExhYmVsOiBib29sZWFuICk6IHZvaWQge1xuXG4gICAgaWYgKCB0aGlzLl9hcHBlbmRMYWJlbCAhPT0gYXBwZW5kTGFiZWwgKSB7XG4gICAgICB0aGlzLl9hcHBlbmRMYWJlbCA9IGFwcGVuZExhYmVsO1xuXG4gICAgICB0aGlzLm9uUERPTUNvbnRlbnRDaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IGFwcGVuZExhYmVsKCBhcHBlbmRMYWJlbDogYm9vbGVhbiApIHsgdGhpcy5zZXRBcHBlbmRMYWJlbCggYXBwZW5kTGFiZWwgKTsgfVxuXG4gIHB1YmxpYyBnZXQgYXBwZW5kTGFiZWwoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldEFwcGVuZExhYmVsKCk7IH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIGxhYmVsIHNpYmxpbmcgc2hvdWxkIGJlIGFwcGVuZGVkIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcuXG4gICAqL1xuICBwdWJsaWMgZ2V0QXBwZW5kTGFiZWwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FwcGVuZExhYmVsO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ5IGRlZmF1bHQgdGhlIGxhYmVsIHdpbGwgYmUgcHJlcGVuZGVkIGJlZm9yZSB0aGUgcHJpbWFyeSBzaWJsaW5nIGluIHRoZSBQRE9NLiBUaGlzXG4gICAqIG9wdGlvbiBhbGxvd3MgeW91IHRvIGluc3RlYWQgaGF2ZSB0aGUgbGFiZWwgYWRkZWQgYWZ0ZXIgdGhlIHByaW1hcnkgc2libGluZy4gTm90ZTogVGhlIGxhYmVsIHdpbGwgYWx3YXlzXG4gICAqIGJlIGluIGZyb250IG9mIHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nLiBJZiB0aGlzIGZsYWcgaXMgc2V0IHdpdGggYGFwcGVuZExhYmVsYCwgdGhlIG9yZGVyIHdpbGwgYmVcbiAgICpcbiAgICogPGNvbnRhaW5lcj5cbiAgICogICA8cHJpbWFyeSBzaWJsaW5nLz5cbiAgICogICA8bGFiZWwgc2libGluZy8+XG4gICAqICAgPGRlc2NyaXB0aW9uIHNpYmxpbmcvPlxuICAgKiA8L2NvbnRhaW5lcj5cbiAgICovXG4gIHB1YmxpYyBzZXRBcHBlbmREZXNjcmlwdGlvbiggYXBwZW5kRGVzY3JpcHRpb246IGJvb2xlYW4gKTogdm9pZCB7XG5cbiAgICBpZiAoIHRoaXMuX2FwcGVuZERlc2NyaXB0aW9uICE9PSBhcHBlbmREZXNjcmlwdGlvbiApIHtcbiAgICAgIHRoaXMuX2FwcGVuZERlc2NyaXB0aW9uID0gYXBwZW5kRGVzY3JpcHRpb247XG5cbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgYXBwZW5kRGVzY3JpcHRpb24oIGFwcGVuZERlc2NyaXB0aW9uOiBib29sZWFuICkgeyB0aGlzLnNldEFwcGVuZERlc2NyaXB0aW9uKCBhcHBlbmREZXNjcmlwdGlvbiApOyB9XG5cbiAgcHVibGljIGdldCBhcHBlbmREZXNjcmlwdGlvbigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0QXBwZW5kRGVzY3JpcHRpb24oKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgd2hldGhlciB0aGUgZGVzY3JpcHRpb24gc2libGluZyBzaG91bGQgYmUgYXBwZW5kZWQgYWZ0ZXIgdGhlIHByaW1hcnkgc2libGluZy5cbiAgICovXG4gIHB1YmxpYyBnZXRBcHBlbmREZXNjcmlwdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYXBwZW5kRGVzY3JpcHRpb247XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBjb250YWluZXIgcGFyZW50IHRhZyBuYW1lLiBCeSBzcGVjaWZ5aW5nIHRoaXMgY29udGFpbmVyIHBhcmVudCwgYW4gZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWQgdGhhdFxuICAgKiBhY3RzIGFzIGEgY29udGFpbmVyIGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcgRE9NIEVsZW1lbnQgYW5kIGl0cyBsYWJlbCBhbmQgZGVzY3JpcHRpb24gc2libGluZ3MuXG4gICAqIFRoaXMgY29udGFpbmVyVGFnTmFtZSB3aWxsIGRlZmF1bHQgdG8gREVGQVVMVF9MQUJFTF9UQUdfTkFNRSwgYW5kIGJlIGFkZGVkIHRvIHRoZSBQRE9NIGF1dG9tYXRpY2FsbHkgaWZcbiAgICogbW9yZSB0aGFuIGp1c3QgdGhlIHByaW1hcnkgc2libGluZyBpcyBjcmVhdGVkLlxuICAgKlxuICAgKiBGb3IgaW5zdGFuY2UsIGEgYnV0dG9uIGVsZW1lbnQgd2l0aCBhIGxhYmVsIGFuZCBkZXNjcmlwdGlvbiB3aWxsIGJlIGNvbnRhaW5lZCBsaWtlIHRoZSBmb2xsb3dpbmdcbiAgICogaWYgdGhlIGNvbnRhaW5lclRhZ05hbWUgaXMgc3BlY2lmaWVkIGFzICdzZWN0aW9uJy5cbiAgICpcbiAgICogPHNlY3Rpb24gaWQ9J3BhcmVudC1jb250YWluZXItdHJhaWwtaWQnPlxuICAgKiAgIDxidXR0b24+UHJlc3MgbWUhPC9idXR0b24+XG4gICAqICAgPHA+QnV0dG9uIGxhYmVsPC9wPlxuICAgKiAgIDxwPkJ1dHRvbiBkZXNjcmlwdGlvbjwvcD5cbiAgICogPC9zZWN0aW9uPlxuICAgKi9cbiAgcHVibGljIHNldENvbnRhaW5lclRhZ05hbWUoIHRhZ05hbWU6IHN0cmluZyB8IG51bGwgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFnTmFtZSA9PT0gbnVsbCB8fCB0eXBlb2YgdGFnTmFtZSA9PT0gJ3N0cmluZycsIGBpbnZhbGlkIHRhZ05hbWUgYXJndW1lbnQ6ICR7dGFnTmFtZX1gICk7XG5cbiAgICBpZiAoIHRoaXMuX2NvbnRhaW5lclRhZ05hbWUgIT09IHRhZ05hbWUgKSB7XG4gICAgICB0aGlzLl9jb250YWluZXJUYWdOYW1lID0gdGFnTmFtZTtcbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgY29udGFpbmVyVGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApIHsgdGhpcy5zZXRDb250YWluZXJUYWdOYW1lKCB0YWdOYW1lICk7IH1cblxuICBwdWJsaWMgZ2V0IGNvbnRhaW5lclRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldENvbnRhaW5lclRhZ05hbWUoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRhZyBuYW1lIGZvciB0aGUgY29udGFpbmVyIHBhcmVudCBlbGVtZW50LlxuICAgKi9cbiAgcHVibGljIGdldENvbnRhaW5lclRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lclRhZ05hbWU7XG4gIH1cblxuICBwcml2YXRlIGludmFsaWRhdGVQZWVyTGFiZWxTaWJsaW5nQ29udGVudCgpOiB2b2lkIHtcbiAgICBjb25zdCBsYWJlbENvbnRlbnQgPSB0aGlzLmxhYmVsQ29udGVudDtcblxuICAgIC8vIGlmIHRyeWluZyB0byBzZXQgbGFiZWxDb250ZW50LCBtYWtlIHN1cmUgdGhhdCB0aGVyZSBpcyBhIGxhYmVsVGFnTmFtZSBkZWZhdWx0XG4gICAgaWYgKCBsYWJlbENvbnRlbnQgJiYgIXRoaXMuX2xhYmVsVGFnTmFtZSApIHtcbiAgICAgIHRoaXMuc2V0TGFiZWxUYWdOYW1lKCBERUZBVUxUX0xBQkVMX1RBR19OQU1FICk7XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciE7XG4gICAgICBwZWVyLnNldExhYmVsU2libGluZ0NvbnRlbnQoIGxhYmVsQ29udGVudCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGNvbnRlbnQgb2YgdGhlIGxhYmVsIHNpYmxpbmcgZm9yIHRoZSB0aGlzIE5vZGUuICBUaGUgbGFiZWwgc2libGluZyB3aWxsIGRlZmF1bHQgdG8gdGhlIHZhbHVlIG9mXG4gICAqIERFRkFVTFRfTEFCRUxfVEFHX05BTUUgaWYgbm8gYGxhYmVsVGFnTmFtZWAgaXMgcHJvdmlkZWQuIElmIHRoZSBsYWJlbCBzaWJsaW5nIGlzIGEgYExBQkVMYCBodG1sIGVsZW1lbnQsXG4gICAqIHRoZW4gdGhlIGBmb3JgIGF0dHJpYnV0ZSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgYWRkZWQsIHBvaW50aW5nIHRvIHRoZSBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBzdXBwb3J0cyBhZGRpbmcgY29udGVudCBpbiB0d28gd2F5cywgd2l0aCBIVE1MRWxlbWVudC50ZXh0Q29udGVudCBhbmQgSFRNTEVsZW1lbnQuaW5uZXJIVE1MLlxuICAgKiBUaGUgRE9NIHNldHRlciBpcyBjaG9zZW4gYmFzZWQgb24gaWYgdGhlIGxhYmVsIHBhc3NlcyB0aGUgYGNvbnRhaW5zRm9ybWF0dGluZ1RhZ3NgLlxuICAgKlxuICAgKiBQYXNzaW5nIGEgbnVsbCBsYWJlbCB2YWx1ZSB3aWxsIG5vdCBjbGVhciB0aGUgd2hvbGUgbGFiZWwgc2libGluZywganVzdCB0aGUgaW5uZXIgY29udGVudCBvZiB0aGUgRE9NIEVsZW1lbnQuXG4gICAqL1xuICBwdWJsaWMgc2V0TGFiZWxDb250ZW50KCBsYWJlbENvbnRlbnQ6IFBET01WYWx1ZVR5cGUgfCBudWxsICk6IHZvaWQge1xuICAgIGlmICggbGFiZWxDb250ZW50ICE9PSB0aGlzLl9sYWJlbENvbnRlbnQgKSB7XG4gICAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHRoaXMuX2xhYmVsQ29udGVudCApICYmICF0aGlzLl9sYWJlbENvbnRlbnQuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgdGhpcy5fbGFiZWxDb250ZW50LnVubGluayggdGhpcy5fb25MYWJlbENvbnRlbnRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9sYWJlbENvbnRlbnQgPSBsYWJlbENvbnRlbnQ7XG5cbiAgICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggbGFiZWxDb250ZW50ICkgKSB7XG4gICAgICAgIGxhYmVsQ29udGVudC5sYXp5TGluayggdGhpcy5fb25MYWJlbENvbnRlbnRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmludmFsaWRhdGVQZWVyTGFiZWxTaWJsaW5nQ29udGVudCgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgbGFiZWxDb250ZW50KCBsYWJlbDogUERPTVZhbHVlVHlwZSB8IG51bGwgKSB7IHRoaXMuc2V0TGFiZWxDb250ZW50KCBsYWJlbCApOyB9XG5cbiAgcHVibGljIGdldCBsYWJlbENvbnRlbnQoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldExhYmVsQ29udGVudCgpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29udGVudCBmb3IgdGhpcyBOb2RlJ3MgbGFiZWwgc2libGluZyBET00gZWxlbWVudC5cbiAgICovXG4gIHB1YmxpYyBnZXRMYWJlbENvbnRlbnQoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHVud3JhcFByb3BlcnR5KCB0aGlzLl9sYWJlbENvbnRlbnQgKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Jbm5lckNvbnRlbnRQcm9wZXJ0eUNoYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaW5uZXJDb250ZW50O1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciE7XG4gICAgICBwZWVyLnNldFByaW1hcnlTaWJsaW5nQ29udGVudCggdmFsdWUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBpbm5lciBjb250ZW50IGZvciB0aGUgcHJpbWFyeSBzaWJsaW5nIG9mIHRoZSBQRE9NUGVlcnMgb2YgdGhpcyBOb2RlLiBXaWxsIGJlIHNldCBhcyB0ZXh0Q29udGVudFxuICAgKiB1bmxlc3MgY29udGVudCBpcyBodG1sIHdoaWNoIHVzZXMgZXhjbHVzaXZlbHkgZm9ybWF0dGluZyB0YWdzLiBBIE5vZGUgd2l0aCBpbm5lciBjb250ZW50IGNhbm5vdFxuICAgKiBoYXZlIGFjY2Vzc2libGUgZGVzY2VuZGFudHMgYmVjYXVzZSB0aGlzIGNvbnRlbnQgd2lsbCBvdmVycmlkZSB0aGUgSFRNTCBvZiBkZXNjZW5kYW50cyBvZiB0aGlzIE5vZGUuXG4gICAqL1xuICBwdWJsaWMgc2V0SW5uZXJDb250ZW50KCBpbm5lckNvbnRlbnQ6IFBET01WYWx1ZVR5cGUgfCBudWxsICk6IHZvaWQge1xuICAgIGlmICggaW5uZXJDb250ZW50ICE9PSB0aGlzLl9pbm5lckNvbnRlbnQgKSB7XG4gICAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHRoaXMuX2lubmVyQ29udGVudCApICYmICF0aGlzLl9pbm5lckNvbnRlbnQuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgdGhpcy5faW5uZXJDb250ZW50LnVubGluayggdGhpcy5fb25Jbm5lckNvbnRlbnRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbm5lckNvbnRlbnQgPSBpbm5lckNvbnRlbnQ7XG5cbiAgICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggaW5uZXJDb250ZW50ICkgKSB7XG4gICAgICAgIGlubmVyQ29udGVudC5sYXp5TGluayggdGhpcy5fb25Jbm5lckNvbnRlbnRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9uSW5uZXJDb250ZW50UHJvcGVydHlDaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IGlubmVyQ29udGVudCggY29udGVudDogUERPTVZhbHVlVHlwZSB8IG51bGwgKSB7IHRoaXMuc2V0SW5uZXJDb250ZW50KCBjb250ZW50ICk7IH1cblxuICBwdWJsaWMgZ2V0IGlubmVyQ29udGVudCgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0SW5uZXJDb250ZW50KCk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSBpbm5lciBjb250ZW50LCB0aGUgc3RyaW5nIHRoYXQgaXMgdGhlIGlubmVySFRNTCBvciBpbm5lclRleHQgZm9yIHRoZSBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nLlxuICAgKi9cbiAgcHVibGljIGdldElubmVyQ29udGVudCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdW53cmFwUHJvcGVydHkoIHRoaXMuX2lubmVyQ29udGVudCApO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZhbGlkYXRlUGVlckRlc2NyaXB0aW9uU2libGluZ0NvbnRlbnQoKTogdm9pZCB7XG4gICAgY29uc3QgZGVzY3JpcHRpb25Db250ZW50ID0gdGhpcy5kZXNjcmlwdGlvbkNvbnRlbnQ7XG5cbiAgICAvLyBpZiB0aGVyZSBpcyBubyBkZXNjcmlwdGlvbiBlbGVtZW50LCBhc3N1bWUgdGhhdCBhIHBhcmFncmFwaCBlbGVtZW50IHNob3VsZCBiZSB1c2VkXG4gICAgaWYgKCBkZXNjcmlwdGlvbkNvbnRlbnQgJiYgIXRoaXMuX2Rlc2NyaXB0aW9uVGFnTmFtZSApIHtcbiAgICAgIHRoaXMuc2V0RGVzY3JpcHRpb25UYWdOYW1lKCBERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FICk7XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciE7XG4gICAgICBwZWVyLnNldERlc2NyaXB0aW9uU2libGluZ0NvbnRlbnQoIGRlc2NyaXB0aW9uQ29udGVudCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGRlc2NyaXB0aW9uIGNvbnRlbnQgZm9yIHRoaXMgTm9kZSdzIHByaW1hcnkgc2libGluZy4gVGhlIGRlc2NyaXB0aW9uIHNpYmxpbmcgdGFnIG5hbWUgbXVzdCBzdXBwb3J0XG4gICAqIGlubmVySFRNTCBhbmQgdGV4dENvbnRlbnQuIElmIGEgZGVzY3JpcHRpb24gZWxlbWVudCBkb2VzIG5vdCBleGlzdCB5ZXQsIGEgZGVmYXVsdFxuICAgKiBERUZBVUxUX0xBQkVMX1RBR19OQU1FIHdpbGwgYmUgYXNzaWduZWQgdG8gdGhlIGRlc2NyaXB0aW9uVGFnTmFtZS5cbiAgICovXG4gIHB1YmxpYyBzZXREZXNjcmlwdGlvbkNvbnRlbnQoIGRlc2NyaXB0aW9uQ29udGVudDogUERPTVZhbHVlVHlwZSB8IG51bGwgKTogdm9pZCB7XG4gICAgaWYgKCBkZXNjcmlwdGlvbkNvbnRlbnQgIT09IHRoaXMuX2Rlc2NyaXB0aW9uQ29udGVudCApIHtcbiAgICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggdGhpcy5fZGVzY3JpcHRpb25Db250ZW50ICkgJiYgIXRoaXMuX2Rlc2NyaXB0aW9uQ29udGVudC5pc0Rpc3Bvc2VkICkge1xuICAgICAgICB0aGlzLl9kZXNjcmlwdGlvbkNvbnRlbnQudW5saW5rKCB0aGlzLl9vbkRlc2NyaXB0aW9uQ29udGVudENoYW5nZUxpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Rlc2NyaXB0aW9uQ29udGVudCA9IGRlc2NyaXB0aW9uQ29udGVudDtcblxuICAgICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCBkZXNjcmlwdGlvbkNvbnRlbnQgKSApIHtcbiAgICAgICAgZGVzY3JpcHRpb25Db250ZW50LmxhenlMaW5rKCB0aGlzLl9vbkRlc2NyaXB0aW9uQ29udGVudENoYW5nZUxpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZVBlZXJEZXNjcmlwdGlvblNpYmxpbmdDb250ZW50KCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBkZXNjcmlwdGlvbkNvbnRlbnQoIHRleHRDb250ZW50OiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApIHsgdGhpcy5zZXREZXNjcmlwdGlvbkNvbnRlbnQoIHRleHRDb250ZW50ICk7IH1cblxuICBwdWJsaWMgZ2V0IGRlc2NyaXB0aW9uQ29udGVudCgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0RGVzY3JpcHRpb25Db250ZW50KCk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb250ZW50IGZvciB0aGlzIE5vZGUncyBkZXNjcmlwdGlvbiBzaWJsaW5nIERPTSBFbGVtZW50LlxuICAgKi9cbiAgcHVibGljIGdldERlc2NyaXB0aW9uQ29udGVudCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdW53cmFwUHJvcGVydHkoIHRoaXMuX2Rlc2NyaXB0aW9uQ29udGVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgQVJJQSByb2xlIGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuIEFjY29yZGluZyB0byB0aGUgVzNDLCB0aGUgQVJJQSByb2xlIGlzIHJlYWQtb25seSBmb3IgYSBET01cbiAgICogZWxlbWVudC4gIFNvIHRoaXMgd2lsbCBjcmVhdGUgYSBuZXcgRE9NIGVsZW1lbnQgZm9yIHRoaXMgTm9kZSB3aXRoIHRoZSBkZXNpcmVkIHJvbGUsIGFuZCByZXBsYWNlIHRoZSBvbGRcbiAgICogZWxlbWVudCBpbiB0aGUgRE9NLiBOb3RlIHRoYXQgdGhlIGFyaWEgcm9sZSBjYW4gY29tcGxldGVseSBjaGFuZ2UgdGhlIGV2ZW50cyB0aGF0IGZpcmUgZnJvbSBhbiBlbGVtZW50LFxuICAgKiBlc3BlY2lhbGx5IHdoZW4gdXNpbmcgYSBzY3JlZW4gcmVhZGVyLiBGb3IgZXhhbXBsZSwgYSByb2xlIG9mIGBhcHBsaWNhdGlvbmAgd2lsbCBsYXJnZWx5IGJ5cGFzcyB0aGUgZGVmYXVsdFxuICAgKiBiZWhhdmlvciBhbmQgbG9naWMgb2YgdGhlIHNjcmVlbiByZWFkZXIsIHRyaWdnZXJpbmcga2V5ZG93bi9rZXl1cCBldmVudHMgZXZlbiBmb3IgYnV0dG9ucyB0aGF0IHdvdWxkIHVzdWFsbHlcbiAgICogb25seSByZWNlaXZlIGEgXCJjbGlja1wiIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gYXJpYVJvbGUgLSByb2xlIGZvciB0aGUgZWxlbWVudCwgc2VlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sLWFyaWEvI2FsbG93ZWQtYXJpYS1yb2xlcy1zdGF0ZXMtYW5kLXByb3BlcnRpZXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGEgbGlzdCBvZiByb2xlcywgc3RhdGVzLCBhbmQgcHJvcGVydGllcy5cbiAgICovXG4gIHB1YmxpYyBzZXRBcmlhUm9sZSggYXJpYVJvbGU6IHN0cmluZyB8IG51bGwgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXJpYVJvbGUgPT09IG51bGwgfHwgdHlwZW9mIGFyaWFSb2xlID09PSAnc3RyaW5nJyApO1xuXG4gICAgaWYgKCB0aGlzLl9hcmlhUm9sZSAhPT0gYXJpYVJvbGUgKSB7XG5cbiAgICAgIHRoaXMuX2FyaWFSb2xlID0gYXJpYVJvbGU7XG5cbiAgICAgIGlmICggYXJpYVJvbGUgIT09IG51bGwgKSB7XG4gICAgICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ3JvbGUnLCBhcmlhUm9sZSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ3JvbGUnICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBhcmlhUm9sZSggYXJpYVJvbGU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0QXJpYVJvbGUoIGFyaWFSb2xlICk7IH1cblxuICBwdWJsaWMgZ2V0IGFyaWFSb2xlKCk6IHN0cmluZyB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRBcmlhUm9sZSgpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgQVJJQSByb2xlIHJlcHJlc2VudGluZyB0aGlzIE5vZGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0QXJpYVJvbGUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2FyaWFSb2xlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgQVJJQSByb2xlIGZvciB0aGlzIE5vZGUncyBjb250YWluZXIgcGFyZW50IGVsZW1lbnQuICBBY2NvcmRpbmcgdG8gdGhlIFczQywgdGhlIEFSSUEgcm9sZSBpcyByZWFkLW9ubHlcbiAgICogZm9yIGEgRE9NIGVsZW1lbnQuIFRoaXMgd2lsbCBjcmVhdGUgYSBuZXcgRE9NIGVsZW1lbnQgZm9yIHRoZSBjb250YWluZXIgcGFyZW50IHdpdGggdGhlIGRlc2lyZWQgcm9sZSwgYW5kXG4gICAqIHJlcGxhY2UgaXQgaW4gdGhlIERPTS5cbiAgICpcbiAgICogQHBhcmFtIGFyaWFSb2xlIC0gcm9sZSBmb3IgdGhlIGVsZW1lbnQsIHNlZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbC1hcmlhLyNhbGxvd2VkLWFyaWEtcm9sZXMtc3RhdGVzLWFuZC1wcm9wZXJ0aWVzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBhIGxpc3Qgb2Ygcm9sZXMsIHN0YXRlcywgYW5kIHByb3BlcnRpZXMuXG4gICAqL1xuICBwdWJsaWMgc2V0Q29udGFpbmVyQXJpYVJvbGUoIGFyaWFSb2xlOiBzdHJpbmcgfCBudWxsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyaWFSb2xlID09PSBudWxsIHx8IHR5cGVvZiBhcmlhUm9sZSA9PT0gJ3N0cmluZycgKTtcblxuICAgIGlmICggdGhpcy5fY29udGFpbmVyQXJpYVJvbGUgIT09IGFyaWFSb2xlICkge1xuXG4gICAgICB0aGlzLl9jb250YWluZXJBcmlhUm9sZSA9IGFyaWFSb2xlO1xuXG4gICAgICAvLyBjbGVhciBvdXQgdGhlIGF0dHJpYnV0ZVxuICAgICAgaWYgKCBhcmlhUm9sZSA9PT0gbnVsbCApIHtcbiAgICAgICAgdGhpcy5yZW1vdmVQRE9NQXR0cmlidXRlKCAncm9sZScsIHtcbiAgICAgICAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVFxuICAgICAgICB9ICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCB0aGUgYXR0cmlidXRlXG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAncm9sZScsIGFyaWFSb2xlLCB7XG4gICAgICAgICAgZWxlbWVudE5hbWU6IFBET01QZWVyLkNPTlRBSU5FUl9QQVJFTlRcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgY29udGFpbmVyQXJpYVJvbGUoIGFyaWFSb2xlOiBzdHJpbmcgfCBudWxsICkgeyB0aGlzLnNldENvbnRhaW5lckFyaWFSb2xlKCBhcmlhUm9sZSApOyB9XG5cbiAgcHVibGljIGdldCBjb250YWluZXJBcmlhUm9sZSgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0Q29udGFpbmVyQXJpYVJvbGUoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIEFSSUEgcm9sZSBhc3NpZ25lZCB0byB0aGUgY29udGFpbmVyIHBhcmVudCBlbGVtZW50LlxuICAgKi9cbiAgcHVibGljIGdldENvbnRhaW5lckFyaWFSb2xlKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9jb250YWluZXJBcmlhUm9sZTtcbiAgfVxuXG4gIHByaXZhdGUgb25BcmlhVmFsdWVUZXh0Q2hhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IGFyaWFWYWx1ZVRleHQgPSB0aGlzLmFyaWFWYWx1ZVRleHQ7XG5cbiAgICBpZiAoIGFyaWFWYWx1ZVRleHQgPT09IG51bGwgKSB7XG4gICAgICBpZiAoIHRoaXMuX2hhc0FwcGxpZWRBcmlhTGFiZWwgKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ2FyaWEtdmFsdWV0ZXh0JyApO1xuICAgICAgICB0aGlzLl9oYXNBcHBsaWVkQXJpYUxhYmVsID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAnYXJpYS12YWx1ZXRleHQnLCBhcmlhVmFsdWVUZXh0ICk7XG4gICAgICB0aGlzLl9oYXNBcHBsaWVkQXJpYUxhYmVsID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBhcmlhLXZhbHVldGV4dCBvZiB0aGlzIE5vZGUgaW5kZXBlbmRlbnRseSBmcm9tIHRoZSBjaGFuZ2luZyB2YWx1ZSwgaWYgbmVjZXNzYXJ5LiBTZXR0aW5nIHRvIG51bGwgd2lsbFxuICAgKiBjbGVhciB0aGlzIGF0dHJpYnV0ZS5cbiAgICovXG4gIHB1YmxpYyBzZXRBcmlhVmFsdWVUZXh0KCBhcmlhVmFsdWVUZXh0OiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX2FyaWFWYWx1ZVRleHQgIT09IGFyaWFWYWx1ZVRleHQgKSB7XG4gICAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHRoaXMuX2FyaWFWYWx1ZVRleHQgKSAmJiAhdGhpcy5fYXJpYVZhbHVlVGV4dC5pc0Rpc3Bvc2VkICkge1xuICAgICAgICB0aGlzLl9hcmlhVmFsdWVUZXh0LnVubGluayggdGhpcy5fb25BcmlhVmFsdWVUZXh0Q2hhbmdlTGlzdGVuZXIgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYXJpYVZhbHVlVGV4dCA9IGFyaWFWYWx1ZVRleHQ7XG5cbiAgICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggYXJpYVZhbHVlVGV4dCApICkge1xuICAgICAgICBhcmlhVmFsdWVUZXh0LmxhenlMaW5rKCB0aGlzLl9vbkFyaWFWYWx1ZVRleHRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9uQXJpYVZhbHVlVGV4dENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgYXJpYVZhbHVlVGV4dCggYXJpYVZhbHVlVGV4dDogUERPTVZhbHVlVHlwZSB8IG51bGwgKSB7IHRoaXMuc2V0QXJpYVZhbHVlVGV4dCggYXJpYVZhbHVlVGV4dCApOyB9XG5cbiAgcHVibGljIGdldCBhcmlhVmFsdWVUZXh0KCk6IHN0cmluZyB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRBcmlhVmFsdWVUZXh0KCk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgYXJpYS12YWx1ZXRleHQgYXR0cmlidXRlIGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuIElmIG51bGwsIHRoZW4gdGhlIGF0dHJpYnV0ZVxuICAgKiBoYXMgbm90IGJlZW4gc2V0IG9uIHRoZSBwcmltYXJ5IHNpYmxpbmcuXG4gICAqL1xuICBwdWJsaWMgZ2V0QXJpYVZhbHVlVGV4dCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdW53cmFwUHJvcGVydHkoIHRoaXMuX2FyaWFWYWx1ZVRleHQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBuYW1lc3BhY2UgZm9yIHRoZSBwcmltYXJ5IGVsZW1lbnQgKHJlbGV2YW50IGZvciBNYXRoTUwvU1ZHL2V0Yy4pXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCB0byBjcmVhdGUgYSBNYXRoTUwgZWxlbWVudDpcbiAgICogeyB0YWdOYW1lOiAnbWF0aCcsIHBkb21OYW1lc3BhY2U6ICdodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MJyB9XG4gICAqXG4gICAqIG9yIGZvciBTVkc6XG4gICAqIHsgdGFnTmFtZTogJ3N2ZycsIHBkb21OYW1lc3BhY2U6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgfVxuICAgKlxuICAgKiBAcGFyYW0gcGRvbU5hbWVzcGFjZSAtIE51bGwgaW5kaWNhdGVzIG5vIG5hbWVzcGFjZS5cbiAgICovXG4gIHB1YmxpYyBzZXRQRE9NTmFtZXNwYWNlKCBwZG9tTmFtZXNwYWNlOiBzdHJpbmcgfCBudWxsICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBkb21OYW1lc3BhY2UgPT09IG51bGwgfHwgdHlwZW9mIHBkb21OYW1lc3BhY2UgPT09ICdzdHJpbmcnICk7XG5cbiAgICBpZiAoIHRoaXMuX3Bkb21OYW1lc3BhY2UgIT09IHBkb21OYW1lc3BhY2UgKSB7XG4gICAgICB0aGlzLl9wZG9tTmFtZXNwYWNlID0gcGRvbU5hbWVzcGFjZTtcblxuICAgICAgLy8gSWYgdGhlIG5hbWVzcGFjZSBjaGFuZ2VzLCB0ZWFyIGRvd24gdGhlIHZpZXcgYW5kIHJlZHJhdyB0aGUgd2hvbGUgdGhpbmcsIHRoZXJlIGlzIG5vIGVhc3kgbXV0YWJsZSBzb2x1dGlvbiBoZXJlLlxuICAgICAgdGhpcy5vblBET01Db250ZW50Q2hhbmdlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHBkb21OYW1lc3BhY2UoIHZhbHVlOiBzdHJpbmcgfCBudWxsICkgeyB0aGlzLnNldFBET01OYW1lc3BhY2UoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHBkb21OYW1lc3BhY2UoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFBET01OYW1lc3BhY2UoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhY2Nlc3NpYmxlIG5hbWVzcGFjZSAoc2VlIHNldFBET01OYW1lc3BhY2UgZm9yIG1vcmUgaW5mb3JtYXRpb24pLlxuICAgKi9cbiAgcHVibGljIGdldFBET01OYW1lc3BhY2UoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3Bkb21OYW1lc3BhY2U7XG4gIH1cblxuICBwcml2YXRlIG9uQXJpYUxhYmVsQ2hhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IGFyaWFMYWJlbCA9IHRoaXMuYXJpYUxhYmVsO1xuXG4gICAgaWYgKCBhcmlhTGFiZWwgPT09IG51bGwgKSB7XG4gICAgICBpZiAoIHRoaXMuX2hhc0FwcGxpZWRBcmlhTGFiZWwgKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnICk7XG4gICAgICAgIHRoaXMuX2hhc0FwcGxpZWRBcmlhTGFiZWwgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICdhcmlhLWxhYmVsJywgYXJpYUxhYmVsICk7XG4gICAgICB0aGlzLl9oYXNBcHBsaWVkQXJpYUxhYmVsID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgJ2FyaWEtbGFiZWwnIGF0dHJpYnV0ZSBmb3IgbGFiZWxsaW5nIHRoZSBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nLiBCeSB1c2luZyB0aGVcbiAgICogJ2FyaWEtbGFiZWwnIGF0dHJpYnV0ZSwgdGhlIGxhYmVsIHdpbGwgYmUgcmVhZCBvbiBmb2N1cywgYnV0IGNhbiBub3QgYmUgZm91bmQgd2l0aCB0aGVcbiAgICogdmlydHVhbCBjdXJzb3IuIFRoaXMgaXMgb25lIHdheSB0byBzZXQgYSBET00gRWxlbWVudCdzIEFjY2Vzc2libGUgTmFtZS5cbiAgICpcbiAgICogQHBhcmFtIGFyaWFMYWJlbCAtIHRoZSB0ZXh0IGZvciB0aGUgYXJpYSBsYWJlbCBhdHRyaWJ1dGVcbiAgICovXG4gIHB1YmxpYyBzZXRBcmlhTGFiZWwoIGFyaWFMYWJlbDogUERPTVZhbHVlVHlwZSB8IG51bGwgKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9hcmlhTGFiZWwgIT09IGFyaWFMYWJlbCApIHtcbiAgICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggdGhpcy5fYXJpYUxhYmVsICkgJiYgIXRoaXMuX2FyaWFMYWJlbC5pc0Rpc3Bvc2VkICkge1xuICAgICAgICB0aGlzLl9hcmlhTGFiZWwudW5saW5rKCB0aGlzLl9vbkFyaWFMYWJlbENoYW5nZUxpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2FyaWFMYWJlbCA9IGFyaWFMYWJlbDtcblxuICAgICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCBhcmlhTGFiZWwgKSApIHtcbiAgICAgICAgYXJpYUxhYmVsLmxhenlMaW5rKCB0aGlzLl9vbkFyaWFMYWJlbENoYW5nZUxpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMub25BcmlhTGFiZWxDaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IGFyaWFMYWJlbCggYXJpYUxhYmVsOiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApIHsgdGhpcy5zZXRBcmlhTGFiZWwoIGFyaWFMYWJlbCApOyB9XG5cbiAgcHVibGljIGdldCBhcmlhTGFiZWwoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldEFyaWFMYWJlbCgpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdmFsdWUgb2YgdGhlIGFyaWEtbGFiZWwgYXR0cmlidXRlIGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuXG4gICAqL1xuICBwdWJsaWMgZ2V0QXJpYUxhYmVsKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB1bndyYXBQcm9wZXJ0eSggdGhpcy5fYXJpYUxhYmVsICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBmb2N1cyBoaWdobGlnaHQgZm9yIHRoaXMgTm9kZS4gQnkgZGVmYXVsdCwgdGhlIGZvY3VzIGhpZ2hsaWdodCB3aWxsIGJlIGEgcGluayByZWN0YW5nbGUgdGhhdFxuICAgKiBzdXJyb3VuZHMgdGhlIE5vZGUncyBsb2NhbCBib3VuZHMuICBJZiBmb2N1cyBoaWdobGlnaHQgaXMgc2V0IHRvICdpbnZpc2libGUnLCB0aGUgTm9kZSB3aWxsIG5vdCBoYXZlXG4gICAqIGFueSBoaWdobGlnaHRpbmcgd2hlbiBpdCByZWNlaXZlcyBmb2N1cy5cbiAgICpcbiAgICogVXNlIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lIHdoZW4gZHJhd2luZyBhIGN1c3RvbSBoaWdobGlnaHQgZm9yIHRoaXMgTm9kZS5cbiAgICovXG4gIHB1YmxpYyBzZXRGb2N1c0hpZ2hsaWdodCggZm9jdXNIaWdobGlnaHQ6IEhpZ2hsaWdodCApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX2ZvY3VzSGlnaGxpZ2h0ICE9PSBmb2N1c0hpZ2hsaWdodCApIHtcbiAgICAgIHRoaXMuX2ZvY3VzSGlnaGxpZ2h0ID0gZm9jdXNIaWdobGlnaHQ7XG5cbiAgICAgIC8vIGlmIHRoZSBmb2N1cyBoaWdobGlnaHQgaXMgbGF5ZXJhYmxlIGluIHRoZSBzY2VuZSBncmFwaCwgdXBkYXRlIHZpc2liaWxpdHkgc28gdGhhdCBpdCBpcyBvbmx5XG4gICAgICAvLyB2aXNpYmxlIHdoZW4gYXNzb2NpYXRlZCBOb2RlIGhhcyBmb2N1c1xuICAgICAgaWYgKCB0aGlzLl9mb2N1c0hpZ2hsaWdodExheWVyYWJsZSApIHtcblxuICAgICAgICAvLyBpZiBmb2N1cyBoaWdobGlnaHQgaXMgbGF5ZXJhYmxlLCBpdCBtdXN0IGJlIGEgTm9kZSBpbiB0aGUgc2NlbmUgZ3JhcGhcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZm9jdXNIaWdobGlnaHQgaW5zdGFuY2VvZiBOb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9uby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXG5cbiAgICAgICAgLy8gdGhlIGhpZ2hsaWdodCBzdGFydHMgb2ZmIGludmlzaWJsZSwgSGlnaGxpZ2h0T3ZlcmxheSB3aWxsIG1ha2UgaXQgdmlzaWJsZSB3aGVuIHRoaXMgTm9kZSBoYXMgRE9NIGZvY3VzXG4gICAgICAgICggZm9jdXNIaWdobGlnaHQgYXMgTm9kZSApLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5mb2N1c0hpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IGZvY3VzSGlnaGxpZ2h0KCBmb2N1c0hpZ2hsaWdodDogSGlnaGxpZ2h0ICkgeyB0aGlzLnNldEZvY3VzSGlnaGxpZ2h0KCBmb2N1c0hpZ2hsaWdodCApOyB9XG5cbiAgcHVibGljIGdldCBmb2N1c0hpZ2hsaWdodCgpOiBIaWdobGlnaHQgeyByZXR1cm4gdGhpcy5nZXRGb2N1c0hpZ2hsaWdodCgpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZm9jdXMgaGlnaGxpZ2h0IGZvciB0aGlzIE5vZGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0Rm9jdXNIaWdobGlnaHQoKTogSGlnaGxpZ2h0IHtcbiAgICByZXR1cm4gdGhpcy5fZm9jdXNIaWdobGlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0dGluZyBhIGZsYWcgdG8gYnJlYWsgZGVmYXVsdCBhbmQgYWxsb3cgdGhlIGZvY3VzIGhpZ2hsaWdodCB0byBiZSAoeikgbGF5ZXJlZCBpbnRvIHRoZSBzY2VuZSBncmFwaC5cbiAgICogVGhpcyB3aWxsIHNldCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgbGF5ZXJlZCBmb2N1cyBoaWdobGlnaHQsIGl0IHdpbGwgYWx3YXlzIGJlIGludmlzaWJsZSB1bnRpbCB0aGlzIE5vZGUgaGFzXG4gICAqIGZvY3VzLlxuICAgKi9cbiAgcHVibGljIHNldEZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlKCBmb2N1c0hpZ2hsaWdodExheWVyYWJsZTogYm9vbGVhbiApOiB2b2lkIHtcblxuICAgIGlmICggdGhpcy5fZm9jdXNIaWdobGlnaHRMYXllcmFibGUgIT09IGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlICkge1xuICAgICAgdGhpcy5fZm9jdXNIaWdobGlnaHRMYXllcmFibGUgPSBmb2N1c0hpZ2hsaWdodExheWVyYWJsZTtcblxuICAgICAgLy8gaWYgYSBmb2N1cyBoaWdobGlnaHQgaXMgZGVmaW5lZCAoaXQgbXVzdCBiZSBhIE5vZGUpLCB1cGRhdGUgaXRzIHZpc2liaWxpdHkgc28gaXQgaXMgbGlua2VkIHRvIGZvY3VzXG4gICAgICAvLyBvZiB0aGUgYXNzb2NpYXRlZCBOb2RlXG4gICAgICBpZiAoIHRoaXMuX2ZvY3VzSGlnaGxpZ2h0ICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9mb2N1c0hpZ2hsaWdodCBpbnN0YW5jZW9mIE5vZGUgKTtcbiAgICAgICAgKCB0aGlzLl9mb2N1c0hpZ2hsaWdodCBhcyBOb2RlICkudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGVtaXQgdGhhdCB0aGUgaGlnaGxpZ2h0IGhhcyBjaGFuZ2VkIGFuZCB3ZSBtYXkgbmVlZCB0byB1cGRhdGUgaXRzIHZpc3VhbCByZXByZXNlbnRhdGlvblxuICAgICAgICB0aGlzLmZvY3VzSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgZm9jdXNIaWdobGlnaHRMYXllcmFibGUoIGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlOiBib29sZWFuICkgeyB0aGlzLnNldEZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlKCBmb2N1c0hpZ2hsaWdodExheWVyYWJsZSApOyB9XG5cbiAgcHVibGljIGdldCBmb2N1c0hpZ2hsaWdodExheWVyYWJsZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0Rm9jdXNIaWdobGlnaHRMYXllcmFibGUoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGZsYWcgZm9yIGlmIHRoaXMgTm9kZSBpcyBsYXllcmFibGUgaW4gdGhlIHNjZW5lIGdyYXBoIChvciBpZiBpdCBpcyBhbHdheXMgb24gdG9wLCBsaWtlIHRoZSBkZWZhdWx0KS5cbiAgICovXG4gIHB1YmxpYyBnZXRGb2N1c0hpZ2hsaWdodExheWVyYWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZm9jdXNIaWdobGlnaHRMYXllcmFibGU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgb3Igbm90IHRoaXMgTm9kZSBoYXMgYSBncm91cCBmb2N1cyBoaWdobGlnaHQuIElmIHRoaXMgTm9kZSBoYXMgYSBncm91cCBmb2N1cyBoaWdobGlnaHQsIGFuIGV4dHJhXG4gICAqIGZvY3VzIGhpZ2hsaWdodCB3aWxsIHN1cnJvdW5kIHRoaXMgTm9kZSB3aGVuZXZlciBhIGRlc2NlbmRhbnQgTm9kZSBoYXMgZm9jdXMuIEdlbmVyYWxseVxuICAgKiB1c2VmdWwgdG8gaW5kaWNhdGUgbmVzdGVkIGtleWJvYXJkIG5hdmlnYXRpb24uIElmIHRydWUsIHRoZSBncm91cCBmb2N1cyBoaWdobGlnaHQgd2lsbCBzdXJyb3VuZFxuICAgKiB0aGlzIE5vZGUncyBsb2NhbCBib3VuZHMuIE90aGVyd2lzZSwgdGhlIE5vZGUgd2lsbCBiZSB1c2VkLlxuICAgKlxuICAgKiBUT0RPOiBTdXBwb3J0IG1vcmUgdGhhbiBvbmUgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0IChtdWx0aXBsZSBhbmNlc3RvcnMgY291bGQgaGF2ZSBncm91cEZvY3VzSGlnaGxpZ2h0KSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNjA4XG4gICAqL1xuICBwdWJsaWMgc2V0R3JvdXBGb2N1c0hpZ2hsaWdodCggZ3JvdXBIaWdobGlnaHQ6IE5vZGUgfCBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMuX2dyb3VwRm9jdXNIaWdobGlnaHQgPSBncm91cEhpZ2hsaWdodDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZ3JvdXBGb2N1c0hpZ2hsaWdodCggZ3JvdXBIaWdobGlnaHQ6IE5vZGUgfCBib29sZWFuICkgeyB0aGlzLnNldEdyb3VwRm9jdXNIaWdobGlnaHQoIGdyb3VwSGlnaGxpZ2h0ICk7IH1cblxuICBwdWJsaWMgZ2V0IGdyb3VwRm9jdXNIaWdobGlnaHQoKTogTm9kZSB8IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRHcm91cEZvY3VzSGlnaGxpZ2h0KCk7IH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgb3Igbm90IHRoaXMgTm9kZSBoYXMgYSAnZ3JvdXAnIGZvY3VzIGhpZ2hsaWdodCwgc2VlIHNldHRlciBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBnZXRHcm91cEZvY3VzSGlnaGxpZ2h0KCk6IE5vZGUgfCBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZ3JvdXBGb2N1c0hpZ2hsaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJ5IHNpbWlsYXIgYWxnb3JpdGhtIHRvIHNldENoaWxkcmVuIGluIE5vZGUuanNcbiAgICogQHBhcmFtIGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zIC0gbGlzdCBvZiBhc3NvY2lhdGlvbk9iamVjdHMsIHNlZSB0aGlzLl9hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucy5cbiAgICovXG4gIHB1YmxpYyBzZXRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyggYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnM6IEFzc29jaWF0aW9uW10gKTogdm9pZCB7XG4gICAgbGV0IGFzc29jaWF0aW9uT2JqZWN0O1xuICAgIGxldCBpO1xuXG4gICAgLy8gdmFsaWRhdGlvbiBpZiBhc3NlcnQgaXMgZW5hYmxlZFxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyApICk7XG4gICAgICBmb3IgKCBpID0gMDsgaSA8IGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBhc3NvY2lhdGlvbk9iamVjdCA9IGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zWyBpIF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbm8gd29yayB0byBiZSBkb25lIGlmIGJvdGggYXJlIGVtcHR5LCByZXR1cm4gZWFybHlcbiAgICBpZiAoIGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYmVmb3JlT25seTogQXNzb2NpYXRpb25bXSA9IFtdOyAvLyBXaWxsIGhvbGQgYWxsIE5vZGVzIHRoYXQgd2lsbCBiZSByZW1vdmVkLlxuICAgIGNvbnN0IGFmdGVyT25seTogQXNzb2NpYXRpb25bXSA9IFtdOyAvLyBXaWxsIGhvbGQgYWxsIE5vZGVzIHRoYXQgd2lsbCBiZSBcIm5ld1wiIGNoaWxkcmVuIChhZGRlZClcbiAgICBjb25zdCBpbkJvdGg6IEFzc29jaWF0aW9uW10gPSBbXTsgLy8gQ2hpbGQgTm9kZXMgdGhhdCBcInN0YXlcIi4gV2lsbCBiZSBvcmRlcmVkIGZvciB0aGUgXCJhZnRlclwiIGNhc2UuXG5cbiAgICAvLyBnZXQgYSBkaWZmZXJlbmNlIG9mIHRoZSBkZXNpcmVkIG5ldyBsaXN0LCBhbmQgdGhlIG9sZFxuICAgIGFycmF5RGlmZmVyZW5jZSggYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMsIHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLCBhZnRlck9ubHksIGJlZm9yZU9ubHksIGluQm90aCApO1xuXG4gICAgLy8gcmVtb3ZlIGVhY2ggY3VycmVudCBhc3NvY2lhdGlvbk9iamVjdCB0aGF0IGlzbid0IGluIHRoZSBuZXcgbGlzdFxuICAgIGZvciAoIGkgPSAwOyBpIDwgYmVmb3JlT25seS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGFzc29jaWF0aW9uT2JqZWN0ID0gYmVmb3JlT25seVsgaSBdO1xuICAgICAgdGhpcy5yZW1vdmVBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCBhc3NvY2lhdGlvbk9iamVjdCApO1xuICAgIH1cblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gaW5Cb3RoLmxlbmd0aCxcbiAgICAgICdSZW1vdmluZyBhc3NvY2lhdGlvbnMgc2hvdWxkIG5vdCBoYXZlIHRyaWdnZXJlZCBvdGhlciBhc3NvY2lhdGlvbiBjaGFuZ2VzJyApO1xuXG4gICAgLy8gYWRkIGVhY2ggYXNzb2NpYXRpb24gZnJvbSB0aGUgbmV3IGxpc3QgdGhhdCBoYXNuJ3QgYmVlbiBhZGRlZCB5ZXRcbiAgICBmb3IgKCBpID0gMDsgaSA8IGFmdGVyT25seS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24gPSBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uc1sgaSBdO1xuICAgICAgdGhpcy5hZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyggYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnM6IEFzc29jaWF0aW9uW10gKSB7IHRoaXMuc2V0QXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMoIGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zICk7IH1cblxuICBwdWJsaWMgZ2V0IGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zKCk6IEFzc29jaWF0aW9uW10geyByZXR1cm4gdGhpcy5nZXRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucygpOyB9XG5cbiAgcHVibGljIGdldEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zKCk6IEFzc29jaWF0aW9uW10ge1xuICAgIHJldHVybiB0aGlzLl9hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYW4gYXJpYS1sYWJlbGxlZGJ5IGFzc29jaWF0aW9uIHRvIHRoaXMgTm9kZS4gVGhlIGRhdGEgaW4gdGhlIGFzc29jaWF0aW9uT2JqZWN0IHdpbGwgYmUgaW1wbGVtZW50ZWQgbGlrZVxuICAgKiBcImEgcGVlcidzIEhUTUxFbGVtZW50IG9mIHRoaXMgTm9kZSAoc3BlY2lmaWVkIHdpdGggdGhlIHN0cmluZyBjb25zdGFudCBzdG9yZWQgaW4gYHRoaXNFbGVtZW50TmFtZWApIHdpbGwgaGF2ZSBhblxuICAgKiBhcmlhLWxhYmVsbGVkYnkgYXR0cmlidXRlIHdpdGggYSB2YWx1ZSB0aGF0IGluY2x1ZGVzIHRoZSBgb3RoZXJOb2RlYCdzIHBlZXIgSFRNTEVsZW1lbnQncyBpZCAoc3BlY2lmaWVkIHdpdGhcbiAgICogYG90aGVyRWxlbWVudE5hbWVgKS5cIlxuICAgKlxuICAgKiBUaGVyZSBjYW4gYmUgbW9yZSB0aGFuIG9uZSBhc3NvY2lhdGlvbiBiZWNhdXNlIGFuIGFyaWEtbGFiZWxsZWRieSBhdHRyaWJ1dGUncyB2YWx1ZSBjYW4gYmUgYSBzcGFjZSBzZXBhcmF0ZWRcbiAgICogbGlzdCBvZiBIVE1MIGlkcywgYW5kIG5vdCBqdXN0IGEgc2luZ2xlIGlkLCBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1dBSS9HTC93aWtpL1VzaW5nX2FyaWEtbGFiZWxsZWRieV90b19jb25jYXRlbmF0ZV9hX2xhYmVsX2Zyb21fc2V2ZXJhbF90ZXh0X25vZGVzXG4gICAqL1xuICBwdWJsaWMgYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbiggYXNzb2NpYXRpb25PYmplY3Q6IEFzc29jaWF0aW9uICk6IHZvaWQge1xuXG4gICAgLy8gVE9ETzogYXNzZXJ0IGlmIHRoaXMgYXNzb2NpYXRpb25PYmplY3QgaXMgYWxyZWFkeSBpbiB0aGUgYXNzb2NpYXRpb24gb2JqZWN0cyBsaXN0ISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODMyXG5cbiAgICB0aGlzLl9hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucy5wdXNoKCBhc3NvY2lhdGlvbk9iamVjdCApOyAvLyBLZWVwIHRyYWNrIG9mIHRoaXMgYXNzb2NpYXRpb24uXG5cbiAgICAvLyBGbGFnIHRoYXQgdGhpcyBOb2RlIGlzIGlzIGJlaW5nIGxhYmVsbGVkIGJ5IHRoZSBvdGhlciBOb2RlLCBzbyB0aGF0IGlmIHRoZSBvdGhlciBOb2RlIGNoYW5nZXMgaXQgY2FuIHRlbGxcbiAgICAvLyB0aGlzIE5vZGUgdG8gcmVzdG9yZSB0aGUgYXNzb2NpYXRpb24gYXBwcm9wcmlhdGVseS5cbiAgICBhc3NvY2lhdGlvbk9iamVjdC5vdGhlck5vZGUuX25vZGVzVGhhdEFyZUFyaWFMYWJlbGxlZGJ5VGhpc05vZGUucHVzaCggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKTtcblxuICAgIHRoaXMudXBkYXRlQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnNJblBlZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIGFyaWEtbGFiZWxsZWRieSBhc3NvY2lhdGlvbiBvYmplY3QsIHNlZSBhZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uIGZvciBtb3JlIGRldGFpbHNcbiAgICovXG4gIHB1YmxpYyByZW1vdmVBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCBhc3NvY2lhdGlvbk9iamVjdDogQXNzb2NpYXRpb24gKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggdGhpcy5fYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMsIGFzc29jaWF0aW9uT2JqZWN0ICkgKTtcblxuICAgIC8vIHJlbW92ZSB0aGVcbiAgICBjb25zdCByZW1vdmVkT2JqZWN0ID0gdGhpcy5fYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMuc3BsaWNlKCBfLmluZGV4T2YoIHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLCBhc3NvY2lhdGlvbk9iamVjdCApLCAxICk7XG5cbiAgICAvLyByZW1vdmUgdGhlIHJlZmVyZW5jZSBmcm9tIHRoZSBvdGhlciBOb2RlIGJhY2sgdG8gdGhpcyBOb2RlIGJlY2F1c2Ugd2UgZG9uJ3QgbmVlZCBpdCBhbnltb3JlXG4gICAgcmVtb3ZlZE9iamVjdFsgMCBdLm90aGVyTm9kZS5yZW1vdmVOb2RlVGhhdElzQXJpYUxhYmVsbGVkQnlUaGlzTm9kZSggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKTtcblxuICAgIHRoaXMudXBkYXRlQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnNJblBlZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSByZWZlcmVuY2UgdG8gdGhlIE5vZGUgdGhhdCBpcyB1c2luZyB0aGlzIE5vZGUncyBJRCBhcyBhbiBhcmlhLWxhYmVsbGVkYnkgdmFsdWUgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlTm9kZVRoYXRJc0FyaWFMYWJlbGxlZEJ5VGhpc05vZGUoIG5vZGU6IE5vZGUgKTogdm9pZCB7XG4gICAgY29uc3QgaW5kZXhPZk5vZGUgPSBfLmluZGV4T2YoIHRoaXMuX25vZGVzVGhhdEFyZUFyaWFMYWJlbGxlZGJ5VGhpc05vZGUsIG5vZGUgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleE9mTm9kZSA+PSAwICk7XG4gICAgdGhpcy5fbm9kZXNUaGF0QXJlQXJpYUxhYmVsbGVkYnlUaGlzTm9kZS5zcGxpY2UoIGluZGV4T2ZOb2RlLCAxICk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciB0aGUgdmlldyB1cGRhdGUgZm9yIGVhY2ggUERPTVBlZXJcbiAgICovXG4gIHB1YmxpYyB1cGRhdGVBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uc0luUGVlcnMoKTogdm9pZCB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wZG9tSW5zdGFuY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgcGVlciA9IHRoaXMucGRvbUluc3RhbmNlc1sgaSBdLnBlZXIhO1xuICAgICAgcGVlci5vbkFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBhc3NvY2lhdGlvbnMgZm9yIGFyaWEtbGFiZWxsZWRieSAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyB1cGRhdGVPdGhlck5vZGVzQXJpYUxhYmVsbGVkYnkoKTogdm9pZCB7XG5cbiAgICAvLyBpZiBhbnkgb3RoZXIgTm9kZXMgYXJlIGFyaWEtbGFiZWxsZWRieSB0aGlzIE5vZGUsIHVwZGF0ZSB0aG9zZSBhc3NvY2lhdGlvbnMgdG9vLiBTaW5jZSB0aGlzIE5vZGUnc1xuICAgIC8vIHBkb20gY29udGVudCBuZWVkcyB0byBiZSByZWNyZWF0ZWQsIHRoZXkgbmVlZCB0byB1cGRhdGUgdGhlaXIgYXJpYS1sYWJlbGxlZGJ5IGFzc29jaWF0aW9ucyBhY2NvcmRpbmdseS5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3Qgb3RoZXJOb2RlID0gdGhpcy5fbm9kZXNUaGF0QXJlQXJpYUxhYmVsbGVkYnlUaGlzTm9kZVsgaSBdO1xuICAgICAgb3RoZXJOb2RlLnVwZGF0ZUFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zSW5QZWVycygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbGlzdCBvZiBOb2RlcyB0aGF0IGFyZSBhcmlhLWxhYmVsbGVkYnkgdGhpcyBOb2RlIChvdGhlciBOb2RlJ3MgcGVlciBlbGVtZW50IHdpbGwgaGF2ZSB0aGlzIE5vZGUncyBQZWVyIGVsZW1lbnQnc1xuICAgKiBpZCBpbiB0aGUgYXJpYS1sYWJlbGxlZGJ5IGF0dHJpYnV0ZVxuICAgKi9cbiAgcHVibGljIGdldE5vZGVzVGhhdEFyZUFyaWFMYWJlbGxlZGJ5VGhpc05vZGUoKTogTm9kZVtdIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZXNUaGF0QXJlQXJpYUxhYmVsbGVkYnlUaGlzTm9kZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbm9kZXNUaGF0QXJlQXJpYUxhYmVsbGVkYnlUaGlzTm9kZSgpOiBOb2RlW10geyByZXR1cm4gdGhpcy5nZXROb2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlKCk7IH1cblxuICBwdWJsaWMgc2V0QXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zKCBhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnM6IEFzc29jaWF0aW9uW10gKTogdm9pZCB7XG4gICAgbGV0IGFzc29jaWF0aW9uT2JqZWN0O1xuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMgKSApO1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aDsgaisrICkge1xuICAgICAgICBhc3NvY2lhdGlvbk9iamVjdCA9IGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uc1sgaiBdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIG5vIHdvcmsgdG8gYmUgZG9uZSBpZiBib3RoIGFyZSBlbXB0eVxuICAgIGlmICggYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9hcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJlZm9yZU9ubHk6IEFzc29jaWF0aW9uW10gPSBbXTsgLy8gV2lsbCBob2xkIGFsbCBOb2RlcyB0aGF0IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICBjb25zdCBhZnRlck9ubHk6IEFzc29jaWF0aW9uW10gPSBbXTsgLy8gV2lsbCBob2xkIGFsbCBOb2RlcyB0aGF0IHdpbGwgYmUgXCJuZXdcIiBjaGlsZHJlbiAoYWRkZWQpXG4gICAgY29uc3QgaW5Cb3RoOiBBc3NvY2lhdGlvbltdID0gW107IC8vIENoaWxkIE5vZGVzIHRoYXQgXCJzdGF5XCIuIFdpbGwgYmUgb3JkZXJlZCBmb3IgdGhlIFwiYWZ0ZXJcIiBjYXNlLlxuICAgIGxldCBpO1xuXG4gICAgLy8gZ2V0IGEgZGlmZmVyZW5jZSBvZiB0aGUgZGVzaXJlZCBuZXcgbGlzdCwgYW5kIHRoZSBvbGRcbiAgICBhcnJheURpZmZlcmVuY2UoIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucywgdGhpcy5fYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLCBhZnRlck9ubHksIGJlZm9yZU9ubHksIGluQm90aCApO1xuXG4gICAgLy8gcmVtb3ZlIGVhY2ggY3VycmVudCBhc3NvY2lhdGlvbk9iamVjdCB0aGF0IGlzbid0IGluIHRoZSBuZXcgbGlzdFxuICAgIGZvciAoIGkgPSAwOyBpIDwgYmVmb3JlT25seS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGFzc29jaWF0aW9uT2JqZWN0ID0gYmVmb3JlT25seVsgaSBdO1xuICAgICAgdGhpcy5yZW1vdmVBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiggYXNzb2NpYXRpb25PYmplY3QgKTtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9hcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMubGVuZ3RoID09PSBpbkJvdGgubGVuZ3RoLFxuICAgICAgJ1JlbW92aW5nIGFzc29jaWF0aW9ucyBzaG91bGQgbm90IGhhdmUgdHJpZ2dlcmVkIG90aGVyIGFzc29jaWF0aW9uIGNoYW5nZXMnICk7XG5cbiAgICAvLyBhZGQgZWFjaCBhc3NvY2lhdGlvbiBmcm9tIHRoZSBuZXcgbGlzdCB0aGF0IGhhc24ndCBiZWVuIGFkZGVkIHlldFxuICAgIGZvciAoIGkgPSAwOyBpIDwgYWZ0ZXJPbmx5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24gPSBhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnNbIGkgXTtcbiAgICAgIHRoaXMuYWRkQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24oIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMoIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uczogQXNzb2NpYXRpb25bXSApIHsgdGhpcy5zZXRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMoIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucyApOyB9XG5cbiAgcHVibGljIGdldCBhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMoKTogQXNzb2NpYXRpb25bXSB7IHJldHVybiB0aGlzLmdldEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucygpOyB9XG5cbiAgcHVibGljIGdldEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucygpOiBBc3NvY2lhdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5fYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBhcmlhLWRlc2NyaWJlZGJ5IGFzc29jaWF0aW9uIHRvIHRoaXMgTm9kZS4gVGhlIGRhdGEgaW4gdGhlIGFzc29jaWF0aW9uT2JqZWN0IHdpbGwgYmUgaW1wbGVtZW50ZWQgbGlrZVxuICAgKiBcImEgcGVlcidzIEhUTUxFbGVtZW50IG9mIHRoaXMgTm9kZSAoc3BlY2lmaWVkIHdpdGggdGhlIHN0cmluZyBjb25zdGFudCBzdG9yZWQgaW4gYHRoaXNFbGVtZW50TmFtZWApIHdpbGwgaGF2ZSBhblxuICAgKiBhcmlhLWRlc2NyaWJlZGJ5IGF0dHJpYnV0ZSB3aXRoIGEgdmFsdWUgdGhhdCBpbmNsdWRlcyB0aGUgYG90aGVyTm9kZWAncyBwZWVyIEhUTUxFbGVtZW50J3MgaWQgKHNwZWNpZmllZCB3aXRoXG4gICAqIGBvdGhlckVsZW1lbnROYW1lYCkuXCJcbiAgICpcbiAgICogVGhlcmUgY2FuIGJlIG1vcmUgdGhhbiBvbmUgYXNzb2NpYXRpb24gYmVjYXVzZSBhbiBhcmlhLWRlc2NyaWJlZGJ5IGF0dHJpYnV0ZSdzIHZhbHVlIGNhbiBiZSBhIHNwYWNlIHNlcGFyYXRlZFxuICAgKiBsaXN0IG9mIEhUTUwgaWRzLCBhbmQgbm90IGp1c3QgYSBzaW5nbGUgaWQsIHNlZSBodHRwczovL3d3dy53My5vcmcvV0FJL0dML3dpa2kvVXNpbmdfYXJpYS1sYWJlbGxlZGJ5X3RvX2NvbmNhdGVuYXRlX2FfbGFiZWxfZnJvbV9zZXZlcmFsX3RleHRfbm9kZXNcbiAgICovXG4gIHB1YmxpYyBhZGRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiggYXNzb2NpYXRpb25PYmplY3Q6IEFzc29jaWF0aW9uICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCB0aGlzLl9hcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMsIGFzc29jaWF0aW9uT2JqZWN0ICksICdkZXNjcmliZWRieSBhc3NvY2lhdGlvbiBhbHJlYWR5IHJlZ2lzdGVkJyApO1xuXG4gICAgdGhpcy5fYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLnB1c2goIGFzc29jaWF0aW9uT2JqZWN0ICk7IC8vIEtlZXAgdHJhY2sgb2YgdGhpcyBhc3NvY2lhdGlvbi5cblxuICAgIC8vIEZsYWcgdGhhdCB0aGlzIE5vZGUgaXMgaXMgYmVpbmcgZGVzY3JpYmVkIGJ5IHRoZSBvdGhlciBOb2RlLCBzbyB0aGF0IGlmIHRoZSBvdGhlciBOb2RlIGNoYW5nZXMgaXQgY2FuIHRlbGxcbiAgICAvLyB0aGlzIE5vZGUgdG8gcmVzdG9yZSB0aGUgYXNzb2NpYXRpb24gYXBwcm9wcmlhdGVseS5cbiAgICBhc3NvY2lhdGlvbk9iamVjdC5vdGhlck5vZGUuX25vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlLnB1c2goIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XG5cbiAgICAvLyB1cGRhdGUgdGhlIFBET01QZWVycyB3aXRoIHRoaXMgYXJpYS1kZXNjcmliZWRieSBhc3NvY2lhdGlvblxuICAgIHRoaXMudXBkYXRlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zSW5QZWVycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIElzIHRoaXMgb2JqZWN0IGFscmVhZHkgaW4gdGhlIGRlc2NyaWJlZGJ5IGFzc29jaWF0aW9uIGxpc3RcbiAgICovXG4gIHB1YmxpYyBoYXNBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiggYXNzb2NpYXRpb25PYmplY3Q6IEFzc29jaWF0aW9uICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBfLmluY2x1ZGVzKCB0aGlzLl9hcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMsIGFzc29jaWF0aW9uT2JqZWN0ICk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIGFyaWEtZGVzY3JpYmVkYnkgYXNzb2NpYXRpb24gb2JqZWN0LCBzZWUgYWRkQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24gZm9yIG1vcmUgZGV0YWlsc1xuICAgKi9cbiAgcHVibGljIHJlbW92ZUFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uKCBhc3NvY2lhdGlvbk9iamVjdDogQXNzb2NpYXRpb24gKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggdGhpcy5fYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLCBhc3NvY2lhdGlvbk9iamVjdCApICk7XG5cbiAgICAvLyByZW1vdmUgdGhlXG4gICAgY29uc3QgcmVtb3ZlZE9iamVjdCA9IHRoaXMuX2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucy5zcGxpY2UoIF8uaW5kZXhPZiggdGhpcy5fYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLCBhc3NvY2lhdGlvbk9iamVjdCApLCAxICk7XG5cbiAgICAvLyByZW1vdmUgdGhlIHJlZmVyZW5jZSBmcm9tIHRoZSBvdGhlciBOb2RlIGJhY2sgdG8gdGhpcyBOb2RlIGJlY2F1c2Ugd2UgZG9uJ3QgbmVlZCBpdCBhbnltb3JlXG4gICAgcmVtb3ZlZE9iamVjdFsgMCBdLm90aGVyTm9kZS5yZW1vdmVOb2RlVGhhdElzQXJpYURlc2NyaWJlZEJ5VGhpc05vZGUoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XG5cbiAgICB0aGlzLnVwZGF0ZUFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uc0luUGVlcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIHJlZmVyZW5jZSB0byB0aGUgTm9kZSB0aGF0IGlzIHVzaW5nIHRoaXMgTm9kZSdzIElEIGFzIGFuIGFyaWEtZGVzY3JpYmVkYnkgdmFsdWUgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlTm9kZVRoYXRJc0FyaWFEZXNjcmliZWRCeVRoaXNOb2RlKCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIGNvbnN0IGluZGV4T2ZOb2RlID0gXy5pbmRleE9mKCB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhRGVzY3JpYmVkYnlUaGlzTm9kZSwgbm9kZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4T2ZOb2RlID49IDAgKTtcbiAgICB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhRGVzY3JpYmVkYnlUaGlzTm9kZS5zcGxpY2UoIGluZGV4T2ZOb2RlLCAxICk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciB0aGUgdmlldyB1cGRhdGUgZm9yIGVhY2ggUERPTVBlZXJcbiAgICovXG4gIHB1YmxpYyB1cGRhdGVBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnNJblBlZXJzKCk6IHZvaWQge1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLnBkb21JbnN0YW5jZXNbIGkgXS5wZWVyITtcbiAgICAgIHBlZXIub25BcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbkNoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGFzc29jaWF0aW9ucyBmb3IgYXJpYS1kZXNjcmliZWRieSAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyB1cGRhdGVPdGhlck5vZGVzQXJpYURlc2NyaWJlZGJ5KCk6IHZvaWQge1xuXG4gICAgLy8gaWYgYW55IG90aGVyIE5vZGVzIGFyZSBhcmlhLWRlc2NyaWJlZGJ5IHRoaXMgTm9kZSwgdXBkYXRlIHRob3NlIGFzc29jaWF0aW9ucyB0b28uIFNpbmNlIHRoaXMgTm9kZSdzXG4gICAgLy8gcGRvbSBjb250ZW50IG5lZWRzIHRvIGJlIHJlY3JlYXRlZCwgdGhleSBuZWVkIHRvIHVwZGF0ZSB0aGVpciBhcmlhLWRlc2NyaWJlZGJ5IGFzc29jaWF0aW9ucyBhY2NvcmRpbmdseS5cbiAgICAvLyBUT0RPOiBvbmx5IHVzZSB1bmlxdWUgZWxlbWVudHMgb2YgdGhlIGFycmF5IChfLnVuaXF1ZSkgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhRGVzY3JpYmVkYnlUaGlzTm9kZS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IG90aGVyTm9kZSA9IHRoaXMuX25vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlWyBpIF07XG4gICAgICBvdGhlck5vZGUudXBkYXRlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zSW5QZWVycygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbGlzdCBvZiBOb2RlcyB0aGF0IGFyZSBhcmlhLWRlc2NyaWJlZGJ5IHRoaXMgTm9kZSAob3RoZXIgTm9kZSdzIHBlZXIgZWxlbWVudCB3aWxsIGhhdmUgdGhpcyBOb2RlJ3MgUGVlciBlbGVtZW50J3NcbiAgICogaWQgaW4gdGhlIGFyaWEtZGVzY3JpYmVkYnkgYXR0cmlidXRlXG4gICAqL1xuICBwdWJsaWMgZ2V0Tm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGUoKTogTm9kZVtdIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG5vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlKCk6IE5vZGVbXSB7IHJldHVybiB0aGlzLmdldE5vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlKCk7IH1cblxuICBwdWJsaWMgc2V0QWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucyggYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uczogQXNzb2NpYXRpb25bXSApOiB2b2lkIHtcblxuICAgIGxldCBhc3NvY2lhdGlvbk9iamVjdDtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGFzc2VydCggQXJyYXkuaXNBcnJheSggYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucyApICk7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zLmxlbmd0aDsgaisrICkge1xuICAgICAgICBhc3NvY2lhdGlvbk9iamVjdCA9IGFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnNbIGogXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBubyB3b3JrIHRvIGJlIGRvbmUgaWYgYm90aCBhcmUgZW1wdHksIHNhZmUgdG8gcmV0dXJuIGVhcmx5XG4gICAgaWYgKCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9hY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBiZWZvcmVPbmx5OiBBc3NvY2lhdGlvbltdID0gW107IC8vIFdpbGwgaG9sZCBhbGwgTm9kZXMgdGhhdCB3aWxsIGJlIHJlbW92ZWQuXG4gICAgY29uc3QgYWZ0ZXJPbmx5OiBBc3NvY2lhdGlvbltdID0gW107IC8vIFdpbGwgaG9sZCBhbGwgTm9kZXMgdGhhdCB3aWxsIGJlIFwibmV3XCIgY2hpbGRyZW4gKGFkZGVkKVxuICAgIGNvbnN0IGluQm90aDogQXNzb2NpYXRpb25bXSA9IFtdOyAvLyBDaGlsZCBOb2RlcyB0aGF0IFwic3RheVwiLiBXaWxsIGJlIG9yZGVyZWQgZm9yIHRoZSBcImFmdGVyXCIgY2FzZS5cbiAgICBsZXQgaTtcblxuICAgIC8vIGdldCBhIGRpZmZlcmVuY2Ugb2YgdGhlIGRlc2lyZWQgbmV3IGxpc3QsIGFuZCB0aGUgb2xkXG4gICAgYXJyYXlEaWZmZXJlbmNlKCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zLCB0aGlzLl9hY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zLCBhZnRlck9ubHksIGJlZm9yZU9ubHksIGluQm90aCApO1xuXG4gICAgLy8gcmVtb3ZlIGVhY2ggY3VycmVudCBhc3NvY2lhdGlvbk9iamVjdCB0aGF0IGlzbid0IGluIHRoZSBuZXcgbGlzdFxuICAgIGZvciAoIGkgPSAwOyBpIDwgYmVmb3JlT25seS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGFzc29jaWF0aW9uT2JqZWN0ID0gYmVmb3JlT25seVsgaSBdO1xuICAgICAgdGhpcy5yZW1vdmVBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24oIGFzc29jaWF0aW9uT2JqZWN0ICk7XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucy5sZW5ndGggPT09IGluQm90aC5sZW5ndGgsXG4gICAgICAnUmVtb3ZpbmcgYXNzb2NpYXRpb25zIHNob3VsZCBub3QgaGF2ZSB0cmlnZ2VyZWQgb3RoZXIgYXNzb2NpYXRpb24gY2hhbmdlcycgKTtcblxuICAgIC8vIGFkZCBlYWNoIGFzc29jaWF0aW9uIGZyb20gdGhlIG5ldyBsaXN0IHRoYXQgaGFzbid0IGJlZW4gYWRkZWQgeWV0XG4gICAgZm9yICggaSA9IDA7IGkgPCBhZnRlck9ubHkubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24gPSBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zWyBpIF07XG4gICAgICB0aGlzLmFkZEFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbiggYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zKCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zOiBBc3NvY2lhdGlvbltdICkgeyB0aGlzLnNldEFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMoIGFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMgKTsgfVxuXG4gIHB1YmxpYyBnZXQgYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucygpOiBBc3NvY2lhdGlvbltdIHsgcmV0dXJuIHRoaXMuZ2V0QWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucygpOyB9XG5cbiAgcHVibGljIGdldEFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMoKTogQXNzb2NpYXRpb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnM7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGFyaWEtYWN0aXZlRGVzY2VuZGFudCBhc3NvY2lhdGlvbiB0byB0aGlzIE5vZGUuIFRoZSBkYXRhIGluIHRoZSBhc3NvY2lhdGlvbk9iamVjdCB3aWxsIGJlIGltcGxlbWVudGVkIGxpa2VcbiAgICogXCJhIHBlZXIncyBIVE1MRWxlbWVudCBvZiB0aGlzIE5vZGUgKHNwZWNpZmllZCB3aXRoIHRoZSBzdHJpbmcgY29uc3RhbnQgc3RvcmVkIGluIGB0aGlzRWxlbWVudE5hbWVgKSB3aWxsIGhhdmUgYW5cbiAgICogYXJpYS1hY3RpdmVEZXNjZW5kYW50IGF0dHJpYnV0ZSB3aXRoIGEgdmFsdWUgdGhhdCBpbmNsdWRlcyB0aGUgYG90aGVyTm9kZWAncyBwZWVyIEhUTUxFbGVtZW50J3MgaWQgKHNwZWNpZmllZCB3aXRoXG4gICAqIGBvdGhlckVsZW1lbnROYW1lYCkuXCJcbiAgICovXG4gIHB1YmxpYyBhZGRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24oIGFzc29jaWF0aW9uT2JqZWN0OiBBc3NvY2lhdGlvbiApOiB2b2lkIHtcblxuICAgIC8vIFRPRE86IGFzc2VydCBpZiB0aGlzIGFzc29jaWF0aW9uT2JqZWN0IGlzIGFscmVhZHkgaW4gdGhlIGFzc29jaWF0aW9uIG9iamVjdHMgbGlzdCEgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgzMlxuICAgIHRoaXMuX2FjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMucHVzaCggYXNzb2NpYXRpb25PYmplY3QgKTsgLy8gS2VlcCB0cmFjayBvZiB0aGlzIGFzc29jaWF0aW9uLlxuXG4gICAgLy8gRmxhZyB0aGF0IHRoaXMgTm9kZSBpcyBpcyBiZWluZyBkZXNjcmliZWQgYnkgdGhlIG90aGVyIE5vZGUsIHNvIHRoYXQgaWYgdGhlIG90aGVyIE5vZGUgY2hhbmdlcyBpdCBjYW4gdGVsbFxuICAgIC8vIHRoaXMgTm9kZSB0byByZXN0b3JlIHRoZSBhc3NvY2lhdGlvbiBhcHByb3ByaWF0ZWx5LlxuICAgIGFzc29jaWF0aW9uT2JqZWN0Lm90aGVyTm9kZS5fbm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUucHVzaCggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKTtcblxuICAgIC8vIHVwZGF0ZSB0aGUgcGRvbVBlZXJzIHdpdGggdGhpcyBhcmlhLWFjdGl2ZURlc2NlbmRhbnQgYXNzb2NpYXRpb25cbiAgICB0aGlzLnVwZGF0ZUFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnNJblBlZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIGFyaWEtYWN0aXZlRGVzY2VuZGFudCBhc3NvY2lhdGlvbiBvYmplY3QsIHNlZSBhZGRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24gZm9yIG1vcmUgZGV0YWlsc1xuICAgKi9cbiAgcHVibGljIHJlbW92ZUFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbiggYXNzb2NpYXRpb25PYmplY3Q6IEFzc29jaWF0aW9uICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIHRoaXMuX2FjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMsIGFzc29jaWF0aW9uT2JqZWN0ICkgKTtcblxuICAgIC8vIHJlbW92ZSB0aGVcbiAgICBjb25zdCByZW1vdmVkT2JqZWN0ID0gdGhpcy5fYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucy5zcGxpY2UoIF8uaW5kZXhPZiggdGhpcy5fYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucywgYXNzb2NpYXRpb25PYmplY3QgKSwgMSApO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSByZWZlcmVuY2UgZnJvbSB0aGUgb3RoZXIgTm9kZSBiYWNrIHRvIHRoaXMgTm9kZSBiZWNhdXNlIHdlIGRvbid0IG5lZWQgaXQgYW55bW9yZVxuICAgIHJlbW92ZWRPYmplY3RbIDAgXS5vdGhlck5vZGUucmVtb3ZlTm9kZVRoYXRJc0FjdGl2ZURlc2NlbmRhbnRUaGlzTm9kZSggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKTtcblxuICAgIHRoaXMudXBkYXRlQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uc0luUGVlcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIHJlZmVyZW5jZSB0byB0aGUgTm9kZSB0aGF0IGlzIHVzaW5nIHRoaXMgTm9kZSdzIElEIGFzIGFuIGFyaWEtYWN0aXZlRGVzY2VuZGFudCB2YWx1ZSAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHByaXZhdGUgcmVtb3ZlTm9kZVRoYXRJc0FjdGl2ZURlc2NlbmRhbnRUaGlzTm9kZSggbm9kZTogTm9kZSApOiB2b2lkIHtcbiAgICBjb25zdCBpbmRleE9mTm9kZSA9IF8uaW5kZXhPZiggdGhpcy5fbm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUsIG5vZGUgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleE9mTm9kZSA+PSAwICk7XG4gICAgdGhpcy5fbm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUuc3BsaWNlKCBpbmRleE9mTm9kZSwgMSApO1xuXG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciB0aGUgdmlldyB1cGRhdGUgZm9yIGVhY2ggUERPTVBlZXJcbiAgICovXG4gIHByaXZhdGUgdXBkYXRlQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uc0luUGVlcnMoKTogdm9pZCB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wZG9tSW5zdGFuY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgcGVlciA9IHRoaXMucGRvbUluc3RhbmNlc1sgaSBdLnBlZXIhO1xuICAgICAgcGVlci5vbkFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbkNoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGFzc29jaWF0aW9ucyBmb3IgYXJpYS1hY3RpdmVEZXNjZW5kYW50IChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHVwZGF0ZU90aGVyTm9kZXNBY3RpdmVEZXNjZW5kYW50KCk6IHZvaWQge1xuXG4gICAgLy8gaWYgYW55IG90aGVyIE5vZGVzIGFyZSBhcmlhLWFjdGl2ZURlc2NlbmRhbnQgdGhpcyBOb2RlLCB1cGRhdGUgdGhvc2UgYXNzb2NpYXRpb25zIHRvby4gU2luY2UgdGhpcyBOb2RlJ3NcbiAgICAvLyBwZG9tIGNvbnRlbnQgbmVlZHMgdG8gYmUgcmVjcmVhdGVkLCB0aGV5IG5lZWQgdG8gdXBkYXRlIHRoZWlyIGFyaWEtYWN0aXZlRGVzY2VuZGFudCBhc3NvY2lhdGlvbnMgYWNjb3JkaW5nbHkuXG4gICAgLy8gVE9ETzogb25seSB1c2UgdW5pcXVlIGVsZW1lbnRzIG9mIHRoZSBhcnJheSAoXy51bmlxdWUpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fbm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBvdGhlck5vZGUgPSB0aGlzLl9ub2Rlc1RoYXRBcmVBY3RpdmVEZXNjZW5kYW50VG9UaGlzTm9kZVsgaSBdO1xuICAgICAgb3RoZXJOb2RlLnVwZGF0ZUFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnNJblBlZXJzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBsaXN0IG9mIE5vZGVzIHRoYXQgYXJlIGFyaWEtYWN0aXZlRGVzY2VuZGFudCB0aGlzIE5vZGUgKG90aGVyIE5vZGUncyBwZWVyIGVsZW1lbnQgd2lsbCBoYXZlIHRoaXMgTm9kZSdzIFBlZXIgZWxlbWVudCdzXG4gICAqIGlkIGluIHRoZSBhcmlhLWFjdGl2ZURlc2NlbmRhbnQgYXR0cmlidXRlXG4gICAqL1xuICBwcml2YXRlIGdldE5vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlKCk6IE5vZGVbXSB7XG4gICAgcmV0dXJuIHRoaXMuX25vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgbm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUoKSB7IHJldHVybiB0aGlzLmdldE5vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlKCk7IH1cblxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBQRE9NL0RPTSBvcmRlciBmb3IgdGhpcyBOb2RlLiBUaGlzIGluY2x1ZGVzIG5vdCBvbmx5IGZvY3VzZWQgaXRlbXMsIGJ1dCBlbGVtZW50cyB0aGF0IGNhbiBiZVxuICAgKiBwbGFjZWQgaW4gdGhlIFBhcmFsbGVsIERPTS4gSWYgcHJvdmlkZWQsIGl0IHdpbGwgb3ZlcnJpZGUgdGhlIGZvY3VzIG9yZGVyIGJldHdlZW4gY2hpbGRyZW4gKGFuZFxuICAgKiBvcHRpb25hbGx5IGFyYml0cmFyeSBzdWJ0cmVlcykuIElmIG5vdCBwcm92aWRlZCwgdGhlIGZvY3VzIG9yZGVyIHdpbGwgZGVmYXVsdCB0byB0aGUgcmVuZGVyaW5nIG9yZGVyXG4gICAqIChmaXJzdCBjaGlsZHJlbiBmaXJzdCwgbGFzdCBjaGlsZHJlbiBsYXN0KSwgZGV0ZXJtaW5lZCBieSB0aGUgY2hpbGRyZW4gYXJyYXkuIEEgTm9kZSBtdXN0IGJlIGNvbm5lY3RlZCB0byBhIHNjZW5lXG4gICAqIGdyYXBoICh2aWEgY2hpbGRyZW4pIGluIG9yZGVyIGZvciBwZG9tT3JkZXIgdG8gYXBwbHkuIFRodXMsIGBzZXRQRE9NT3JkZXJgIGNhbm5vdCBiZSB1c2VkIGluIGV4Y2hhbmdlIGZvclxuICAgKiBzZXR0aW5nIGEgTm9kZSBhcyBhIGNoaWxkLlxuICAgKlxuICAgKiBJbiB0aGUgZ2VuZXJhbCBjYXNlLCB3aGVuIHBkb21PcmRlciBpcyBzcGVjaWZpZWQsIGl0J3MgYW4gYXJyYXkgb2YgTm9kZXMsIHdpdGggb3B0aW9uYWxseSBvbmVcbiAgICogZWxlbWVudCBiZWluZyBhIHBsYWNlaG9sZGVyIGZvciBcInRoZSByZXN0IG9mIHRoZSBjaGlsZHJlblwiLCBzaWduaWZpZWQgYnkgbnVsbC4gVGhpcyBtZWFucyB0aGF0LCBmb3JcbiAgICogYWNjZXNzaWJpbGl0eSwgaXQgd2lsbCBhY3QgYXMgaWYgdGhlIGNoaWxkcmVuIGZvciB0aGlzIE5vZGUgV0VSRSB0aGUgcGRvbU9yZGVyIChwb3RlbnRpYWxseVxuICAgKiBzdXBwbGVtZW50ZWQgd2l0aCBvdGhlciBjaGlsZHJlbiB2aWEgdGhlIHBsYWNlaG9sZGVyKS5cbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIHRoZSB0cmVlOlxuICAgKiAgIGFcbiAgICogICAgIGJcbiAgICogICAgICAgZFxuICAgKiAgICAgICBlXG4gICAqICAgICBjXG4gICAqICAgICAgIGdcbiAgICogICAgICAgZlxuICAgKiAgICAgICAgIGhcbiAgICpcbiAgICogYW5kIHdlIHNwZWNpZnkgYi5wZG9tT3JkZXIgPSBbIGUsIGYsIGQsIGMgXSwgdGhlbiB0aGUgcGRvbSBzdHJ1Y3R1cmUgd2lsbCBhY3QgYXMgaWYgdGhlIHRyZWUgaXM6XG4gICAqICBhXG4gICAqICAgIGJcbiAgICogICAgICBlXG4gICAqICAgICAgZiA8LS0tIHRoZSBlbnRpcmUgc3VidHJlZSBvZiBgZmAgZ2V0cyBwbGFjZWQgaGVyZSB1bmRlciBgYmAsIHB1bGxpbmcgaXQgb3V0IGZyb20gd2hlcmUgaXQgd2FzIGJlZm9yZS5cbiAgICogICAgICAgIGhcbiAgICogICAgICBkXG4gICAqICAgICAgYyA8LS0tIG5vdGUgdGhhdCBgZ2AgaXMgTk9UIHVuZGVyIGBjYCBhbnltb3JlLCBiZWNhdXNlIGl0IGdvdCBwdWxsZWQgb3V0IHVuZGVyIGIgZGlyZWN0bHlcbiAgICogICAgICAgIGdcbiAgICpcbiAgICogVGhlIHBsYWNlaG9sZGVyIChgbnVsbGApIHdpbGwgZ2V0IGZpbGxlZCBpbiB3aXRoIGFsbCBkaXJlY3QgY2hpbGRyZW4gdGhhdCBhcmUgTk9UIGluIGFueSBwZG9tT3JkZXIuXG4gICAqIElmIHRoZXJlIGlzIG5vIHBsYWNlaG9sZGVyIHNwZWNpZmllZCwgaXQgd2lsbCBhY3QgYXMgaWYgdGhlIHBsYWNlaG9sZGVyIGlzIGF0IHRoZSBlbmQgb2YgdGhlIG9yZGVyLlxuICAgKiBUaGUgdmFsdWUgYG51bGxgICh0aGUgZGVmYXVsdCkgYW5kIHRoZSBlbXB0eSBhcnJheSAoYFtdYCkgYm90aCBhY3QgYXMgaWYgdGhlIG9ubHkgb3JkZXIgaXMgdGhlIHBsYWNlaG9sZGVyLFxuICAgKiBpLmUuIGBbbnVsbF1gLlxuICAgKlxuICAgKiBTb21lIGdlbmVyYWwgY29uc3RyYWludHMgZm9yIHRoZSBvcmRlcnMgYXJlOlxuICAgKiAtIE5vZGVzIG11c3QgYmUgYXR0YWNoZWQgdG8gYSBEaXNwbGF5IChpbiBhIHNjZW5lIGdyYXBoKSB0byBiZSBzaG93biBpbiBhIHBkb20gb3JkZXIuXG4gICAqIC0gWW91IGNhbid0IHNwZWNpZnkgYSBOb2RlIGluIG1vcmUgdGhhbiBvbmUgcGRvbU9yZGVyLCBhbmQgeW91IGNhbid0IHNwZWNpZnkgZHVwbGljYXRlcyBvZiBhIHZhbHVlXG4gICAqICAgaW4gYSBwZG9tT3JkZXIuXG4gICAqIC0gWW91IGNhbid0IHNwZWNpZnkgYW4gYW5jZXN0b3Igb2YgYSBOb2RlIGluIHRoYXQgTm9kZSdzIHBkb21PcmRlclxuICAgKiAgIChlLmcuIHRoaXMucGRvbU9yZGVyID0gdGhpcy5wYXJlbnRzICkuXG4gICAqXG4gICAqIE5vdGUgdGhhdCBzcGVjaWZ5aW5nIHNvbWV0aGluZyBpbiBhIHBkb21PcmRlciB3aWxsIGVmZmVjdGl2ZWx5IHJlbW92ZSBpdCBmcm9tIGFsbCBvZiBpdHMgcGFyZW50cyBmb3JcbiAgICogdGhlIHBkb20gdHJlZSAoc28gaWYgeW91IGNyZWF0ZSBgdG1wTm9kZS5wZG9tT3JkZXIgPSBbIGEgXWAgdGhlbiB0b3NzIHRoZSB0bXBOb2RlIHdpdGhvdXRcbiAgICogZGlzcG9zaW5nIGl0LCBgYWAgd29uJ3Qgc2hvdyB1cCBpbiB0aGUgcGFyYWxsZWwgRE9NKS4gSWYgdGhlcmUgaXMgYSBuZWVkIGZvciB0aGF0LCBkaXNwb3NpbmcgYSBOb2RlXG4gICAqIGVmZmVjdGl2ZWx5IHJlbW92ZXMgaXRzIHBkb21PcmRlci5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzM2NSNpc3N1ZWNvbW1lbnQtMzgxMzAyNTgzIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZVxuICAgKiBkZWNpc2lvbnMgYW5kIGRlc2lnbiBmb3IgdGhpcyBmZWF0dXJlLlxuICAgKi9cbiAgcHVibGljIHNldFBET01PcmRlciggcGRvbU9yZGVyOiAoIE5vZGUgfCBudWxsIClbXSB8IG51bGwgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggcGRvbU9yZGVyICkgfHwgcGRvbU9yZGVyID09PSBudWxsLFxuICAgICAgYEFycmF5IG9yIG51bGwgZXhwZWN0ZWQsIHJlY2VpdmVkOiAke3Bkb21PcmRlcn1gICk7XG4gICAgaWYgKCBhc3NlcnQgJiYgcGRvbU9yZGVyICkge1xuICAgICAgcGRvbU9yZGVyLmZvckVhY2goICggbm9kZSwgaW5kZXggKSA9PiB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUgPT09IG51bGwgfHwgbm9kZSBpbnN0YW5jZW9mIE5vZGUsXG4gICAgICAgICAgYEVsZW1lbnRzIG9mIHBkb21PcmRlciBzaG91bGQgYmUgZWl0aGVyIGEgTm9kZSBvciBudWxsLiBFbGVtZW50IGF0IGluZGV4ICR7aW5kZXh9IGlzOiAke25vZGV9YCApO1xuICAgICAgfSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApLmdldFRyYWlscyggbm9kZSA9PiBfLmluY2x1ZGVzKCBwZG9tT3JkZXIsIG5vZGUgKSApLmxlbmd0aCA9PT0gMCwgJ3Bkb21PcmRlciBzaG91bGQgbm90IGluY2x1ZGUgYW55IGFuY2VzdG9ycyBvciB0aGUgTm9kZSBpdHNlbGYnICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwZG9tT3JkZXIubGVuZ3RoID09PSBfLnVuaXEoIHBkb21PcmRlciApLmxlbmd0aCwgJ3Bkb21PcmRlciBkb2VzIG5vdCBhbGxvdyBkdXBsaWNhdGUgTm9kZXMnICk7XG4gICAgfVxuXG4gICAgLy8gRmlyc3QgYSBjb21wYXJpc29uIHRvIHNlZSBpZiB0aGUgb3JkZXIgaXMgc3dpdGNoaW5nIHRvIG9yIGZyb20gbnVsbFxuICAgIGxldCBjaGFuZ2VkID0gKCB0aGlzLl9wZG9tT3JkZXIgPT09IG51bGwgJiYgcGRvbU9yZGVyICE9PSBudWxsICkgfHxcbiAgICAgICAgICAgICAgICAgICggdGhpcy5fcGRvbU9yZGVyICE9PSBudWxsICYmIHBkb21PcmRlciA9PT0gbnVsbCApO1xuXG4gICAgaWYgKCAhY2hhbmdlZCAmJiBwZG9tT3JkZXIgJiYgdGhpcy5fcGRvbU9yZGVyICkge1xuXG4gICAgICAvLyBXZSBhcmUgY29tcGFyaW5nIHR3byBhcnJheXMsIHNvIG5lZWQgdG8gY2hlY2sgY29udGVudHMgZm9yIGRpZmZlcmVuY2VzLlxuICAgICAgY2hhbmdlZCA9IHBkb21PcmRlci5sZW5ndGggIT09IHRoaXMuX3Bkb21PcmRlci5sZW5ndGg7XG5cbiAgICAgIGlmICggIWNoYW5nZWQgKSB7XG5cbiAgICAgICAgLy8gTGVuZ3RocyBhcmUgdGhlIHNhbWUsIHNvIHdlIG5lZWQgdG8gbG9vayBmb3IgY29udGVudCBvciBvcmRlciBkaWZmZXJlbmNlcy5cbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGRvbU9yZGVyLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGlmICggcGRvbU9yZGVyWyBpIF0gIT09IHRoaXMuX3Bkb21PcmRlclsgaSBdICkge1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPbmx5IHVwZGF0ZSBpZiBpdCBoYXMgY2hhbmdlZFxuICAgIGlmICggY2hhbmdlZCApIHtcbiAgICAgIGNvbnN0IG9sZFBET01PcmRlciA9IHRoaXMuX3Bkb21PcmRlcjtcblxuICAgICAgLy8gU3RvcmUgb3VyIG93biByZWZlcmVuY2UgdG8gdGhpcywgc28gY2xpZW50IG1vZGlmaWNhdGlvbnMgdG8gdGhlIGlucHV0IGFycmF5IHdvbid0IHNpbGVudGx5IGJyZWFrIHRoaW5ncy5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNzg2XG4gICAgICB0aGlzLl9wZG9tT3JkZXIgPSBwZG9tT3JkZXIgPT09IG51bGwgPyBudWxsIDogcGRvbU9yZGVyLnNsaWNlKCk7XG5cbiAgICAgIFBET01UcmVlLnBkb21PcmRlckNoYW5nZSggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUsIG9sZFBET01PcmRlciwgcGRvbU9yZGVyICk7XG5cbiAgICAgICggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5yZW5kZXJlclN1bW1hcnlSZWZyZXNoRW1pdHRlci5lbWl0KCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBwZG9tT3JkZXIoIHZhbHVlOiAoIE5vZGUgfCBudWxsIClbXSB8IG51bGwgKSB7IHRoaXMuc2V0UERPTU9yZGVyKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBwZG9tT3JkZXIoKTogKCBOb2RlIHwgbnVsbCApW10gfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0UERPTU9yZGVyKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcGRvbSAoZm9jdXMpIG9yZGVyIGZvciB0aGlzIE5vZGUuXG4gICAqXG4gICAqIE1ha2luZyBjaGFuZ2VzIHRvIHRoZSByZXR1cm5lZCBhcnJheSB3aWxsIG5vdCBhZmZlY3QgdGhpcyBOb2RlJ3Mgb3JkZXIuIEl0IHJldHVybnMgYSBkZWZlbnNpdmUgY29weS5cbiAgICovXG4gIHB1YmxpYyBnZXRQRE9NT3JkZXIoKTogKCBOb2RlIHwgbnVsbCApW10gfCBudWxsIHtcbiAgICBpZiAoIHRoaXMuX3Bkb21PcmRlciApIHtcbiAgICAgIHJldHVybiB0aGlzLl9wZG9tT3JkZXIuc2xpY2UoIDAgKTsgLy8gY3JlYXRlIGEgZGVmZW5zaXZlIGNvcHlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Bkb21PcmRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBOb2RlIGhhcyBhIHBkb21PcmRlciB0aGF0IGlzIGVmZmVjdGl2ZWx5IGRpZmZlcmVudCB0aGFuIHRoZSBkZWZhdWx0LlxuICAgKlxuICAgKiBOT1RFOiBgbnVsbGAsIGBbXWAgYW5kIGBbbnVsbF1gIGFyZSBhbGwgZWZmZWN0aXZlbHkgdGhlIHNhbWUgdGhpbmcsIHNvIHRoaXMgd2lsbCByZXR1cm4gdHJ1ZSBmb3IgYW55IG9mXG4gICAqIHRob3NlLiBVc2FnZSBvZiBgbnVsbGAgaXMgcmVjb21tZW5kZWQsIGFzIGl0IGRvZXNuJ3QgY3JlYXRlIHRoZSBleHRyYSBvYmplY3QgcmVmZXJlbmNlIChidXQgc29tZSBjb2RlXG4gICAqIHRoYXQgZ2VuZXJhdGVzIGFycmF5cyBtYXkgYmUgbW9yZSBjb252ZW5pZW50KS5cbiAgICovXG4gIHB1YmxpYyBoYXNQRE9NT3JkZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Bkb21PcmRlciAhPT0gbnVsbCAmJlxuICAgICAgICAgICB0aGlzLl9wZG9tT3JkZXIubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICggdGhpcy5fcGRvbU9yZGVyLmxlbmd0aCA+IDEgfHwgdGhpcy5fcGRvbU9yZGVyWyAwIF0gIT09IG51bGwgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG91ciBcIlBET00gcGFyZW50XCIgaWYgYXZhaWxhYmxlOiB0aGUgTm9kZSB0aGF0IHNwZWNpZmllcyB0aGlzIE5vZGUgaW4gaXRzIHBkb21PcmRlci5cbiAgICovXG4gIHB1YmxpYyBnZXRQRE9NUGFyZW50KCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fcGRvbVBhcmVudDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcGRvbVBhcmVudCgpOiBOb2RlIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFBET01QYXJlbnQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBcImVmZmVjdGl2ZVwiIHBkb20gY2hpbGRyZW4gZm9yIHRoZSBOb2RlICh3aGljaCBtYXkgYmUgZGlmZmVyZW50IGJhc2VkIG9uIHRoZSBvcmRlciBvciBvdGhlclxuICAgKiBleGNsdWRlZCBzdWJ0cmVlcykuXG4gICAqXG4gICAqIElmIHRoZXJlIGlzIG5vIHBkb21PcmRlciBzcGVjaWZpZWQsIHRoaXMgaXMgYmFzaWNhbGx5IFwiYWxsIGNoaWxkcmVuIHRoYXQgZG9uJ3QgaGF2ZSBwZG9tIHBhcmVudHNcIlxuICAgKiAoYSBOb2RlIGhhcyBhIFwiUERPTSBwYXJlbnRcIiBpZiBpdCBpcyBzcGVjaWZpZWQgaW4gYSBwZG9tT3JkZXIpLlxuICAgKlxuICAgKiBPdGhlcndpc2UgKGlmIGl0IGhhcyBhIHBkb21PcmRlciksIGl0IGlzIHRoZSBwZG9tT3JkZXIsIHdpdGggdGhlIGFib3ZlIGxpc3Qgb2YgTm9kZXMgcGxhY2VkXG4gICAqIGluIGF0IHRoZSBsb2NhdGlvbiBvZiB0aGUgcGxhY2Vob2xkZXIuIElmIHRoZXJlIGlzIG5vIHBsYWNlaG9sZGVyLCBpdCBhY3RzIGxpa2UgYSBwbGFjZWhvbGRlciB3YXMgdGhlIGxhc3RcbiAgICogZWxlbWVudCBvZiB0aGUgcGRvbU9yZGVyIChzZWUgc2V0UERPTU9yZGVyIGZvciBtb3JlIGRvY3VtZW50YXRpb24gaW5mb3JtYXRpb24pLlxuICAgKlxuICAgKiBOT1RFOiBJZiB5b3Ugc3BlY2lmeSBhIGNoaWxkIGluIHRoZSBwZG9tT3JkZXIsIGl0IHdpbGwgTk9UIGJlIGRvdWJsZS1pbmNsdWRlZCAoc2luY2UgaXQgd2lsbCBoYXZlIGFuXG4gICAqIFBET00gcGFyZW50KS5cbiAgICpcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZ2V0RWZmZWN0aXZlQ2hpbGRyZW4oKTogTm9kZVtdIHtcbiAgICAvLyBGaW5kIGFsbCBjaGlsZHJlbiB3aXRob3V0IFBET00gcGFyZW50cy5cbiAgICBjb25zdCBub25PcmRlcmVkQ2hpbGRyZW4gPSBbXTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCAoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICkuX2NoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY2hpbGQgPSAoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICkuX2NoaWxkcmVuWyBpIF07XG5cbiAgICAgIGlmICggIWNoaWxkLl9wZG9tUGFyZW50ICkge1xuICAgICAgICBub25PcmRlcmVkQ2hpbGRyZW4ucHVzaCggY2hpbGQgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPdmVycmlkZSB0aGUgb3JkZXIsIGFuZCByZXBsYWNlIHRoZSBwbGFjZWhvbGRlciBpZiBpdCBleGlzdHMuXG4gICAgaWYgKCB0aGlzLmhhc1BET01PcmRlcigpICkge1xuICAgICAgY29uc3QgZWZmZWN0aXZlQ2hpbGRyZW4gPSB0aGlzLnBkb21PcmRlciEuc2xpY2UoKTtcblxuICAgICAgY29uc3QgcGxhY2Vob2xkZXJJbmRleCA9IGVmZmVjdGl2ZUNoaWxkcmVuLmluZGV4T2YoIG51bGwgKTtcblxuICAgICAgLy8gSWYgd2UgaGF2ZSBhIHBsYWNlaG9sZGVyLCByZXBsYWNlIGl0cyBjb250ZW50IHdpdGggdGhlIGNoaWxkcmVuXG4gICAgICBpZiAoIHBsYWNlaG9sZGVySW5kZXggPj0gMCApIHtcbiAgICAgICAgLy8gZm9yIGVmZmljaWVuY3lcbiAgICAgICAgbm9uT3JkZXJlZENoaWxkcmVuLnVuc2hpZnQoIHBsYWNlaG9sZGVySW5kZXgsIDEgKTtcblxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVE9ETzogYmVzdCB3YXkgdG8gdHlwZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSggZWZmZWN0aXZlQ2hpbGRyZW4sIG5vbk9yZGVyZWRDaGlsZHJlbiApO1xuICAgICAgfVxuICAgICAgLy8gT3RoZXJ3aXNlLCBqdXN0IGFkZCB0aGUgbm9ybWFsIHRoaW5ncyBhdCB0aGUgZW5kXG4gICAgICBlbHNlIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoIGVmZmVjdGl2ZUNoaWxkcmVuLCBub25PcmRlcmVkQ2hpbGRyZW4gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVmZmVjdGl2ZUNoaWxkcmVuIGFzIE5vZGVbXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbm9uT3JkZXJlZENoaWxkcmVuO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBvdXIgcGRvbVZpc2libGUgUHJvcGVydHkgY2hhbmdlcyB2YWx1ZXMuXG4gICAqL1xuICBwcml2YXRlIG9uUGRvbVZpc2libGVQcm9wZXJ0eUNoYW5nZSggdmlzaWJsZTogYm9vbGVhbiApOiB2b2lkIHtcbiAgICB0aGlzLl9wZG9tRGlzcGxheXNJbmZvLm9uUERPTVZpc2liaWxpdHlDaGFuZ2UoIHZpc2libGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoYXQgUHJvcGVydHkgb3VyIHBkb21WaXNpYmxlUHJvcGVydHkgaXMgYmFja2VkIGJ5LCBzbyB0aGF0IGNoYW5nZXMgdG8gdGhpcyBwcm92aWRlZCBQcm9wZXJ0eSB3aWxsIGNoYW5nZSB0aGlzXG4gICAqIE5vZGUncyBwZG9tIHZpc2liaWxpdHksIGFuZCB2aWNlIHZlcnNhLiBUaGlzIGRvZXMgbm90IGNoYW5nZSB0aGlzLl9wZG9tVmlzaWJsZVByb3BlcnR5LiBTZWUgVGlueUZvcndhcmRpbmdQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eSgpXG4gICAqIGZvciBtb3JlIGluZm8uXG4gICAqL1xuICBwdWJsaWMgc2V0UGRvbVZpc2libGVQcm9wZXJ0eSggbmV3VGFyZ2V0OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGwgKTogdGhpcyB7XG4gICAgdGhpcy5fcGRvbVZpc2libGVQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eSggbmV3VGFyZ2V0ICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0UGRvbVZpc2libGVQcm9wZXJ0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IHBkb21WaXNpYmxlUHJvcGVydHkoIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGwgKSB7XG4gICAgdGhpcy5zZXRQZG9tVmlzaWJsZVByb3BlcnR5KCBwcm9wZXJ0eSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRQZG9tVmlzaWJsZVByb3BlcnR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgcGRvbVZpc2libGVQcm9wZXJ0eSgpOiBUUHJvcGVydHk8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmdldFBkb21WaXNpYmxlUHJvcGVydHkoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCB0aGlzIE5vZGUncyBwZG9tVmlzaWJsZVByb3BlcnR5LiBTZWUgTm9kZS5nZXRWaXNpYmxlUHJvcGVydHkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXRQZG9tVmlzaWJsZVByb3BlcnR5KCk6IFRQcm9wZXJ0eTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX3Bkb21WaXNpYmxlUHJvcGVydHk7XG4gIH1cblxuICAvKipcbiAgICogSGlkZSBjb21wbGV0ZWx5IGZyb20gYSBzY3JlZW4gcmVhZGVyIGFuZCB0aGUgYnJvd3NlciBieSBzZXR0aW5nIHRoZSBoaWRkZW4gYXR0cmlidXRlIG9uIHRoZSBOb2RlJ3NcbiAgICogcmVwcmVzZW50YXRpdmUgRE9NIGVsZW1lbnQuIElmIHRoZSBzaWJsaW5nIERPTSBFbGVtZW50cyBoYXZlIGEgY29udGFpbmVyIHBhcmVudCwgdGhlIGNvbnRhaW5lclxuICAgKiBzaG91bGQgYmUgaGlkZGVuIHNvIHRoYXQgYWxsIFBET00gZWxlbWVudHMgYXJlIGhpZGRlbiBhcyB3ZWxsLiAgSGlkaW5nIHRoZSBlbGVtZW50IHdpbGwgcmVtb3ZlIGl0IGZyb20gdGhlIGZvY3VzXG4gICAqIG9yZGVyLlxuICAgKi9cbiAgcHVibGljIHNldFBET01WaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMucGRvbVZpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHZpc2libGU7XG4gIH1cblxuICBwdWJsaWMgc2V0IHBkb21WaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICkgeyB0aGlzLnNldFBET01WaXNpYmxlKCB2aXNpYmxlICk7IH1cblxuICBwdWJsaWMgZ2V0IHBkb21WaXNpYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc1BET01WaXNpYmxlKCk7IH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgb3Igbm90IHRoaXMgTm9kZSdzIHJlcHJlc2VudGF0aXZlIERPTSBlbGVtZW50IGlzIHZpc2libGUuXG4gICAqL1xuICBwdWJsaWMgaXNQRE9NVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wZG9tVmlzaWJsZVByb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhbnkgb2YgdGhlIFBET01JbnN0YW5jZXMgZm9yIHRoZSBOb2RlIGFyZSBnbG9iYWxseSB2aXNpYmxlIGFuZCBkaXNwbGF5ZWQgaW4gdGhlIFBET00uIEFcbiAgICogUERPTUluc3RhbmNlIGlzIGdsb2JhbGx5IHZpc2libGUgaWYgTm9kZSBhbmQgYWxsIGFuY2VzdG9ycyBhcmUgcGRvbVZpc2libGUuIFBET01JbnN0YW5jZSB2aXNpYmlsaXR5IGlzXG4gICAqIHVwZGF0ZWQgc3luY2hyb25vdXNseSwgc28gdGhpcyByZXR1cm5zIHRoZSBtb3N0IHVwLXRvLWRhdGUgaW5mb3JtYXRpb24gd2l0aG91dCByZXF1aXJpbmcgRGlzcGxheS51cGRhdGVEaXNwbGF5XG4gICAqL1xuICBwdWJsaWMgaXNQRE9NRGlzcGxheWVkKCk6IGJvb2xlYW4ge1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiAoIHRoaXMuX3Bkb21JbnN0YW5jZXNbIGkgXS5pc0dsb2JhbGx5VmlzaWJsZSgpICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHVibGljIGdldCBwZG9tRGlzcGxheWVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc1BET01EaXNwbGF5ZWQoKTsgfVxuXG4gIHByaXZhdGUgaW52YWxpZGF0ZVBlZXJJbnB1dFZhbHVlKCk6IHZvaWQge1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLnBkb21JbnN0YW5jZXNbIGkgXS5wZWVyITtcbiAgICAgIHBlZXIub25JbnB1dFZhbHVlQ2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdmFsdWUgb2YgYW4gaW5wdXQgZWxlbWVudC4gIEVsZW1lbnQgbXVzdCBiZSBhIGZvcm0gZWxlbWVudCB0byBzdXBwb3J0IHRoZSB2YWx1ZSBhdHRyaWJ1dGUuIFRoZSBpbnB1dFxuICAgKiB2YWx1ZSBpcyBjb252ZXJ0ZWQgdG8gc3RyaW5nIHNpbmNlIGlucHV0IHZhbHVlcyBhcmUgZ2VuZXJhbGx5IHN0cmluZyBmb3IgSFRNTC5cbiAgICovXG4gIHB1YmxpYyBzZXRJbnB1dFZhbHVlKCBpbnB1dFZhbHVlOiBQRE9NVmFsdWVUeXBlIHwgbnVtYmVyIHwgbnVsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5fdGFnTmFtZSAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIEZPUk1fRUxFTUVOVFMsIHRoaXMuX3RhZ05hbWUudG9VcHBlckNhc2UoKSApLCAnZG9tIGVsZW1lbnQgbXVzdCBiZSBhIGZvcm0gZWxlbWVudCB0byBzdXBwb3J0IHZhbHVlJyApO1xuXG4gICAgaWYgKCBpbnB1dFZhbHVlICE9PSB0aGlzLl9pbnB1dFZhbHVlICkge1xuICAgICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCB0aGlzLl9pbnB1dFZhbHVlICkgJiYgIXRoaXMuX2lucHV0VmFsdWUuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgdGhpcy5faW5wdXRWYWx1ZS51bmxpbmsoIHRoaXMuX29uUERPTUNvbnRlbnRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbnB1dFZhbHVlID0gaW5wdXRWYWx1ZTtcblxuICAgICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCBpbnB1dFZhbHVlICkgKSB7XG4gICAgICAgIGlucHV0VmFsdWUubGF6eUxpbmsoIHRoaXMuX29uUERPTUNvbnRlbnRDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmludmFsaWRhdGVQZWVySW5wdXRWYWx1ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgaW5wdXRWYWx1ZSggdmFsdWU6IFBET01WYWx1ZVR5cGUgfCBudW1iZXIgfCBudWxsICkgeyB0aGlzLnNldElucHV0VmFsdWUoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGlucHV0VmFsdWUoKTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldElucHV0VmFsdWUoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHZhbHVlIG9mIHRoZSBlbGVtZW50LiBFbGVtZW50IG11c3QgYmUgYSBmb3JtIGVsZW1lbnQgdG8gc3VwcG9ydCB0aGUgdmFsdWUgYXR0cmlidXRlLlxuICAgKi9cbiAgcHVibGljIGdldElucHV0VmFsdWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgbGV0IHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsO1xuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggdGhpcy5faW5wdXRWYWx1ZSApICkge1xuICAgICAgdmFsdWUgPSB0aGlzLl9pbnB1dFZhbHVlLnZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhbHVlID0gdGhpcy5faW5wdXRWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlID09PSBudWxsID8gbnVsbCA6ICcnICsgdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgb3Igbm90IHRoZSBjaGVja2VkIGF0dHJpYnV0ZSBhcHBlYXJzIG9uIHRoZSBkb20gZWxlbWVudHMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgTm9kZSdzXG4gICAqIHBkb20gY29udGVudC4gIFRoaXMgaXMgb25seSB1c2VmdWwgZm9yIGlucHV0cyBvZiB0eXBlICdyYWRpbycgYW5kICdjaGVja2JveCcuIEEgJ2NoZWNrZWQnIGlucHV0XG4gICAqIGlzIGNvbnNpZGVyZWQgc2VsZWN0ZWQgdG8gdGhlIGJyb3dzZXIgYW5kIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LlxuICAgKi9cbiAgcHVibGljIHNldFBET01DaGVja2VkKCBjaGVja2VkOiBib29sZWFuICk6IHZvaWQge1xuXG4gICAgaWYgKCB0aGlzLl90YWdOYW1lICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSBJTlBVVF9UQUcsICdDYW5ub3Qgc2V0IGNoZWNrZWQgb24gYSBub24gaW5wdXQgdGFnLicgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLl9pbnB1dFR5cGUgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBJTlBVVF9UWVBFU19USEFUX1NVUFBPUlRfQ0hFQ0tFRC5pbmNsdWRlcyggdGhpcy5faW5wdXRUeXBlLnRvVXBwZXJDYXNlKCkgKSwgYGlucHV0VHlwZSBkb2VzIG5vdCBzdXBwb3J0IGNoZWNrZWQ6ICR7dGhpcy5faW5wdXRUeXBlfWAgKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuX3Bkb21DaGVja2VkICE9PSBjaGVja2VkICkge1xuICAgICAgdGhpcy5fcGRvbUNoZWNrZWQgPSBjaGVja2VkO1xuXG4gICAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICdjaGVja2VkJywgY2hlY2tlZCwge1xuICAgICAgICB0eXBlOiAncHJvcGVydHknXG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBwZG9tQ2hlY2tlZCggY2hlY2tlZDogYm9vbGVhbiApIHsgdGhpcy5zZXRQRE9NQ2hlY2tlZCggY2hlY2tlZCApOyB9XG5cbiAgcHVibGljIGdldCBwZG9tQ2hlY2tlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0UERPTUNoZWNrZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgd2hldGhlciBvciBub3QgdGhlIHBkb20gaW5wdXQgaXMgJ2NoZWNrZWQnLlxuICAgKi9cbiAgcHVibGljIGdldFBET01DaGVja2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wZG9tQ2hlY2tlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgcGRvbSBhdHRyaWJ1dGVzIHRoYXQgaGF2ZSBiZWVuIGFkZGVkIHRvIHRoaXMgTm9kZSdzIHByaW1hcnkgc2libGluZy5cbiAgICovXG4gIHB1YmxpYyBnZXRQRE9NQXR0cmlidXRlcygpOiBQRE9NQXR0cmlidXRlW10ge1xuICAgIHJldHVybiB0aGlzLl9wZG9tQXR0cmlidXRlcy5zbGljZSggMCApOyAvLyBkZWZlbnNpdmUgY29weVxuICB9XG5cbiAgcHVibGljIGdldCBwZG9tQXR0cmlidXRlcygpOiBQRE9NQXR0cmlidXRlW10geyByZXR1cm4gdGhpcy5nZXRQRE9NQXR0cmlidXRlcygpOyB9XG5cbiAgLyoqXG4gICAqIFNldCBhIHBhcnRpY3VsYXIgYXR0cmlidXRlIG9yIHByb3BlcnR5IGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcsIGdlbmVyYWxseSB0byBwcm92aWRlIGV4dHJhIHNlbWFudGljIGluZm9ybWF0aW9uIGZvclxuICAgKiBhIHNjcmVlbiByZWFkZXIuXG4gICAqXG4gICAqIEBwYXJhbSBhdHRyaWJ1dGUgLSBzdHJpbmcgbmFtaW5nIHRoZSBhdHRyaWJ1dGVcbiAgICogQHBhcmFtIHZhbHVlIC0gdGhlIHZhbHVlIGZvciB0aGUgYXR0cmlidXRlLCBpZiBib29sZWFuLCB0aGVuIGl0IHdpbGwgYmUgc2V0IGFzIGEgamF2YXNjcmlwdCBwcm9wZXJ0eSBvbiB0aGUgSFRNTEVsZW1lbnQgcmF0aGVyIHRoYW4gYW4gYXR0cmlidXRlXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIHNldFBET01BdHRyaWJ1dGUoIGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogUERPTVZhbHVlVHlwZSB8IGJvb2xlYW4gfCBudW1iZXIsIHByb3ZpZGVkT3B0aW9ucz86IFNldFBET01BdHRyaWJ1dGVPcHRpb25zICk6IHZvaWQge1xuXG4gICAgYXNzZXJ0ICYmIHByb3ZpZGVkT3B0aW9ucyAmJiBhc3NlcnQoIE9iamVjdC5nZXRQcm90b3R5cGVPZiggcHJvdmlkZWRPcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsXG4gICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIHBkb21BdHRyaWJ1dGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTZXRQRE9NQXR0cmlidXRlT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyB7c3RyaW5nfG51bGx9IC0gSWYgbm9uLW51bGwsIHdpbGwgc2V0IHRoZSBhdHRyaWJ1dGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWVzcGFjZS4gVGhpcyBjYW4gYmUgcmVxdWlyZWRcbiAgICAgIC8vIGZvciBzZXR0aW5nIGNlcnRhaW4gYXR0cmlidXRlcyAoZS5nLiBNYXRoTUwpLlxuICAgICAgbmFtZXNwYWNlOiBudWxsLFxuXG4gICAgICAvLyBzZXQgdGhlIFwiYXR0cmlidXRlXCIgYXMgYSBqYXZhc2NyaXB0IHByb3BlcnR5IG9uIHRoZSBET01FbGVtZW50IGluc3RlYWQgb2YgYSBET00gZWxlbWVudCBhdHRyaWJ1dGVcbiAgICAgIHR5cGU6ICdhdHRyaWJ1dGUnLFxuXG4gICAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HIC8vIHNlZSBQRE9NUGVlci5nZXRFbGVtZW50TmFtZSgpIGZvciB2YWxpZCB2YWx1ZXMsIGRlZmF1bHQgdG8gdGhlIHByaW1hcnkgc2libGluZ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIUFTU09DSUFUSU9OX0FUVFJJQlVURVMuaW5jbHVkZXMoIGF0dHJpYnV0ZSApLCAnc2V0UERPTUF0dHJpYnV0ZSBkb2VzIG5vdCBzdXBwb3J0IGFzc29jaWF0aW9uIGF0dHJpYnV0ZXMnICk7XG4gICAgYXNzZXJ0ICYmIG9wdGlvbnMubmFtZXNwYWNlICYmIGFzc2VydCggb3B0aW9ucy50eXBlID09PSAnYXR0cmlidXRlJywgJ3Byb3BlcnR5LXNldHRpbmcgaXMgbm90IHN1cHBvcnRlZCBmb3IgY3VzdG9tIG5hbWVzcGFjZXMnICk7XG5cbiAgICAvLyBpZiB0aGUgcGRvbSBhdHRyaWJ1dGUgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGxpc3QsIHJlbW92ZSBpdCAtIG5vIG5lZWRcbiAgICAvLyB0byByZW1vdmUgZnJvbSB0aGUgcGVlcnMsIGV4aXN0aW5nIGF0dHJpYnV0ZXMgd2lsbCBzaW1wbHkgYmUgcmVwbGFjZWQgaW4gdGhlIERPTVxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21BdHRyaWJ1dGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY3VycmVudEF0dHJpYnV0ZSA9IHRoaXMuX3Bkb21BdHRyaWJ1dGVzWyBpIF07XG4gICAgICBpZiAoIGN1cnJlbnRBdHRyaWJ1dGUuYXR0cmlidXRlID09PSBhdHRyaWJ1dGUgJiZcbiAgICAgICAgICAgY3VycmVudEF0dHJpYnV0ZS5vcHRpb25zLm5hbWVzcGFjZSA9PT0gb3B0aW9ucy5uYW1lc3BhY2UgJiZcbiAgICAgICAgICAgY3VycmVudEF0dHJpYnV0ZS5vcHRpb25zLmVsZW1lbnROYW1lID09PSBvcHRpb25zLmVsZW1lbnROYW1lICkge1xuXG4gICAgICAgIC8vIFdlIGNhbiBzaW1wbGlmeSB0aGUgbmV3IHZhbHVlIHNldCBhcyBsb25nIGFzIHRoZXJlIGlzbid0IGNsZWFudXAgKGZyb20gYSBQcm9wZXJ0eSBsaXN0ZW5lcikgb3IgbG9naWMgY2hhbmdlIChmcm9tIGEgZGlmZmVyZW50IHR5cGUpXG4gICAgICAgIGlmICggIWlzVFJlYWRPbmx5UHJvcGVydHkoIGN1cnJlbnRBdHRyaWJ1dGUudmFsdWUgKSAmJiBjdXJyZW50QXR0cmlidXRlLm9wdGlvbnMudHlwZSA9PT0gb3B0aW9ucy50eXBlICkge1xuICAgICAgICAgIHRoaXMuX3Bkb21BdHRyaWJ1dGVzLnNwbGljZSggaSwgMSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgLy8gU3dhcHBpbmcgdHlwZSBzdHJhdGVnaWVzIHNob3VsZCByZW1vdmUgdGhlIGF0dHJpYnV0ZSwgc28gaXQgY2FuIGJlIHNldCBhcyBhIHByb3BlcnR5L2F0dHJpYnV0ZSBjb3JyZWN0bHkuXG4gICAgICAgICAgdGhpcy5yZW1vdmVQRE9NQXR0cmlidXRlKCBjdXJyZW50QXR0cmlidXRlLmF0dHJpYnV0ZSwgY3VycmVudEF0dHJpYnV0ZS5vcHRpb25zICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbGlzdGVuZXI6ICggKCByYXdWYWx1ZTogc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlciApID0+IHZvaWQgKSB8IG51bGwgPSAoIHJhd1ZhbHVlOiBzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyICkgPT4ge1xuICAgICAgYXNzZXJ0ICYmIHR5cGVvZiByYXdWYWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsaWRhdGUoIHJhd1ZhbHVlLCBWYWxpZGF0aW9uLlNUUklOR19XSVRIT1VUX1RFTVBMQVRFX1ZBUlNfVkFMSURBVE9SICk7XG5cbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBqIF0ucGVlciE7XG4gICAgICAgIHBlZXIuc2V0QXR0cmlidXRlVG9FbGVtZW50KCBhdHRyaWJ1dGUsIHJhd1ZhbHVlLCBvcHRpb25zICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggdmFsdWUgKSApIHtcbiAgICAgIC8vIHNob3VsZCBydW4gaXQgb25jZSBpbml0aWFsbHlcbiAgICAgIHZhbHVlLmxpbmsoIGxpc3RlbmVyICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gcnVuIGl0IG9uY2UgYW5kIHRvc3MgaXQsIHNvIHdlIGRvbid0IG5lZWQgdG8gc3RvcmUgdGhlIHJlZmVyZW5jZSBvciB1bmxpbmsgaXQgbGF0ZXJcbiAgICAgIGxpc3RlbmVyKCB2YWx1ZSApO1xuICAgICAgbGlzdGVuZXIgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX3Bkb21BdHRyaWJ1dGVzLnB1c2goIHtcbiAgICAgIGF0dHJpYnV0ZTogYXR0cmlidXRlLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0gKTtcblxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIHBhcnRpY3VsYXIgYXR0cmlidXRlLCByZW1vdmluZyB0aGUgYXNzb2NpYXRlZCBzZW1hbnRpYyBpbmZvcm1hdGlvbiBmcm9tIHRoZSBET00gZWxlbWVudC5cbiAgICpcbiAgICogSXQgaXMgSElHSExZIHJlY29tbWVuZGVkIHRoYXQgeW91IG5ldmVyIGNhbGwgdGhpcyBmdW5jdGlvbiBmcm9tIGFuIGF0dHJpYnV0ZSBzZXQgd2l0aCBgdHlwZToncHJvcGVydHknYCwgc2VlXG4gICAqIHNldFBET01BdHRyaWJ1dGUgZm9yIHRoZSBvcHRpb24gZGV0YWlscy5cbiAgICpcbiAgICogQHBhcmFtIGF0dHJpYnV0ZSAtIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0byByZW1vdmVcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlUERPTUF0dHJpYnV0ZSggYXR0cmlidXRlOiBzdHJpbmcsIHByb3ZpZGVkT3B0aW9ucz86IFJlbW92ZVBET01BdHRyaWJ1dGVPcHRpb25zICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBwcm92aWRlZE9wdGlvbnMgJiYgYXNzZXJ0KCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIHByb3ZpZGVkT3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBwZG9tQXR0cmlidXRlIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCcgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmVtb3ZlUERPTUF0dHJpYnV0ZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8ge3N0cmluZ3xudWxsfSAtIElmIG5vbi1udWxsLCB3aWxsIHJlbW92ZSB0aGUgYXR0cmlidXRlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UuIFRoaXMgY2FuIGJlIHJlcXVpcmVkXG4gICAgICAvLyBmb3IgcmVtb3ZpbmcgY2VydGFpbiBhdHRyaWJ1dGVzIChlLmcuIE1hdGhNTCkuXG4gICAgICBuYW1lc3BhY2U6IG51bGwsXG5cbiAgICAgIGVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkcgLy8gc2VlIFBET01QZWVyLmdldEVsZW1lbnROYW1lKCkgZm9yIHZhbGlkIHZhbHVlcywgZGVmYXVsdCB0byB0aGUgcHJpbWFyeSBzaWJsaW5nXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBsZXQgYXR0cmlidXRlUmVtb3ZlZCA9IGZhbHNlO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21BdHRyaWJ1dGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLl9wZG9tQXR0cmlidXRlc1sgaSBdLmF0dHJpYnV0ZSA9PT0gYXR0cmlidXRlICYmXG4gICAgICAgICAgIHRoaXMuX3Bkb21BdHRyaWJ1dGVzWyBpIF0ub3B0aW9ucy5uYW1lc3BhY2UgPT09IG9wdGlvbnMubmFtZXNwYWNlICYmXG4gICAgICAgICAgIHRoaXMuX3Bkb21BdHRyaWJ1dGVzWyBpIF0ub3B0aW9ucy5lbGVtZW50TmFtZSA9PT0gb3B0aW9ucy5lbGVtZW50TmFtZSApIHtcblxuICAgICAgICBjb25zdCBvbGRBdHRyaWJ1dGUgPSB0aGlzLl9wZG9tQXR0cmlidXRlc1sgaSBdO1xuICAgICAgICBpZiAoIG9sZEF0dHJpYnV0ZS5saXN0ZW5lciAmJiBpc1RSZWFkT25seVByb3BlcnR5KCBvbGRBdHRyaWJ1dGUudmFsdWUgKSAmJiAhb2xkQXR0cmlidXRlLnZhbHVlLmlzRGlzcG9zZWQgKSB7XG4gICAgICAgICAgb2xkQXR0cmlidXRlLnZhbHVlLnVubGluayggb2xkQXR0cmlidXRlLmxpc3RlbmVyICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wZG9tQXR0cmlidXRlcy5zcGxpY2UoIGksIDEgKTtcbiAgICAgICAgYXR0cmlidXRlUmVtb3ZlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGF0dHJpYnV0ZVJlbW92ZWQsIGBOb2RlIGRvZXMgbm90IGhhdmUgcGRvbSBhdHRyaWJ1dGUgJHthdHRyaWJ1dGV9YCApO1xuXG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBqIF0ucGVlciE7XG4gICAgICBwZWVyLnJlbW92ZUF0dHJpYnV0ZUZyb21FbGVtZW50KCBhdHRyaWJ1dGUsIG9wdGlvbnMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBhdHRyaWJ1dGVzIGZyb20gdGhpcyBOb2RlJ3MgZG9tIGVsZW1lbnQuXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlUERPTUF0dHJpYnV0ZXMoKTogdm9pZCB7XG5cbiAgICAvLyBhbGwgYXR0cmlidXRlcyBjdXJyZW50bHkgb24gdGhpcyBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nXG4gICAgY29uc3QgYXR0cmlidXRlcyA9IHRoaXMuZ2V0UERPTUF0dHJpYnV0ZXMoKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGF0dHJpYnV0ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzWyBpIF0uYXR0cmlidXRlO1xuICAgICAgdGhpcy5yZW1vdmVQRE9NQXR0cmlidXRlKCBhdHRyaWJ1dGUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgcGFydGljdWxhciBhdHRyaWJ1dGUsIHJlbW92aW5nIHRoZSBhc3NvY2lhdGVkIHNlbWFudGljIGluZm9ybWF0aW9uIGZyb20gdGhlIERPTSBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gYXR0cmlidXRlIC0gbmFtZSBvZiB0aGUgYXR0cmlidXRlIHRvIHJlbW92ZVxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBoYXNQRE9NQXR0cmlidXRlKCBhdHRyaWJ1dGU6IHN0cmluZywgcHJvdmlkZWRPcHRpb25zPzogSGFzUERPTUF0dHJpYnV0ZU9wdGlvbnMgKTogYm9vbGVhbiB7XG4gICAgYXNzZXJ0ICYmIHByb3ZpZGVkT3B0aW9ucyAmJiBhc3NlcnQoIE9iamVjdC5nZXRQcm90b3R5cGVPZiggcHJvdmlkZWRPcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsXG4gICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIHBkb21BdHRyaWJ1dGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxIYXNQRE9NQXR0cmlidXRlT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyB7c3RyaW5nfG51bGx9IC0gSWYgbm9uLW51bGwsIHdpbGwgcmVtb3ZlIHRoZSBhdHRyaWJ1dGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWVzcGFjZS4gVGhpcyBjYW4gYmUgcmVxdWlyZWRcbiAgICAgIC8vIGZvciByZW1vdmluZyBjZXJ0YWluIGF0dHJpYnV0ZXMgKGUuZy4gTWF0aE1MKS5cbiAgICAgIG5hbWVzcGFjZTogbnVsbCxcblxuICAgICAgZWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyAvLyBzZWUgUERPTVBlZXIuZ2V0RWxlbWVudE5hbWUoKSBmb3IgdmFsaWQgdmFsdWVzLCBkZWZhdWx0IHRvIHRoZSBwcmltYXJ5IHNpYmxpbmdcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGxldCBhdHRyaWJ1dGVGb3VuZCA9IGZhbHNlO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21BdHRyaWJ1dGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLl9wZG9tQXR0cmlidXRlc1sgaSBdLmF0dHJpYnV0ZSA9PT0gYXR0cmlidXRlICYmXG4gICAgICAgICAgIHRoaXMuX3Bkb21BdHRyaWJ1dGVzWyBpIF0ub3B0aW9ucy5uYW1lc3BhY2UgPT09IG9wdGlvbnMubmFtZXNwYWNlICYmXG4gICAgICAgICAgIHRoaXMuX3Bkb21BdHRyaWJ1dGVzWyBpIF0ub3B0aW9ucy5lbGVtZW50TmFtZSA9PT0gb3B0aW9ucy5lbGVtZW50TmFtZSApIHtcbiAgICAgICAgYXR0cmlidXRlRm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXR0cmlidXRlRm91bmQ7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHRoZSBjbGFzcyB0byB0aGUgUERPTSBlbGVtZW50J3MgY2xhc3NMaXN0LiBUaGUgUERPTSBpcyBnZW5lcmFsbHkgaW52aXNpYmxlLFxuICAgKiBidXQgc29tZSBzdHlsaW5nIG9jY2FzaW9uYWxseSBoYXMgYW4gaW1wYWN0IG9uIHNlbWFudGljcyBzbyBpdCBpcyBuZWNlc3NhcnkgdG8gc2V0IHN0eWxlcy5cbiAgICogQWRkIGEgY2xhc3Mgd2l0aCB0aGlzIGZ1bmN0aW9uIGFuZCBkZWZpbmUgdGhlIHN0eWxlIGluIHN0eWxlc2hlZXRzIChsaWtlbHkgU2NlbmVyeVN0eWxlKS5cbiAgICovXG4gIHB1YmxpYyBzZXRQRE9NQ2xhc3MoIGNsYXNzTmFtZTogc3RyaW5nLCBwcm92aWRlZE9wdGlvbnM/OiBTZXRQRE9NQ2xhc3NPcHRpb25zICk6IHZvaWQge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTZXRQRE9NQ2xhc3NPcHRpb25zPigpKCB7XG4gICAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBpZiB3ZSBhbHJlYWR5IGhhdmUgdGhlIHByb3ZpZGVkIGNsYXNzTmFtZSBzZXQgdG8gdGhlIHNpYmxpbmcsIGRvIG5vdGhpbmdcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wZG9tQ2xhc3Nlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRDbGFzcyA9IHRoaXMuX3Bkb21DbGFzc2VzWyBpIF07XG4gICAgICBpZiAoIGN1cnJlbnRDbGFzcy5jbGFzc05hbWUgPT09IGNsYXNzTmFtZSAmJiBjdXJyZW50Q2xhc3Mub3B0aW9ucy5lbGVtZW50TmFtZSA9PT0gb3B0aW9ucy5lbGVtZW50TmFtZSApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3Bkb21DbGFzc2VzLnB1c2goIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIG9wdGlvbnM6IG9wdGlvbnMgfSApO1xuXG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBqIF0ucGVlciE7XG4gICAgICBwZWVyLnNldENsYXNzVG9FbGVtZW50KCBjbGFzc05hbWUsIG9wdGlvbnMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgY2xhc3MgZnJvbSB0aGUgY2xhc3NMaXN0IG9mIG9uZSBvZiB0aGUgZWxlbWVudHMgZm9yIHRoaXMgTm9kZS5cbiAgICovXG4gIHB1YmxpYyByZW1vdmVQRE9NQ2xhc3MoIGNsYXNzTmFtZTogc3RyaW5nLCBwcm92aWRlZE9wdGlvbnM/OiBSZW1vdmVQRE9NQ2xhc3NPcHRpb25zICk6IHZvaWQge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSZW1vdmVQRE9NQ2xhc3NPcHRpb25zPigpKCB7XG4gICAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HIC8vIHNlZSBQRE9NUGVlci5nZXRFbGVtZW50TmFtZSgpIGZvciB2YWxpZCB2YWx1ZXMsIGRlZmF1bHQgdG8gdGhlIHByaW1hcnkgc2libGluZ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgbGV0IGNsYXNzUmVtb3ZlZCA9IGZhbHNlO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21DbGFzc2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLl9wZG9tQ2xhc3Nlc1sgaSBdLmNsYXNzTmFtZSA9PT0gY2xhc3NOYW1lICYmXG4gICAgICAgICAgIHRoaXMuX3Bkb21DbGFzc2VzWyBpIF0ub3B0aW9ucy5lbGVtZW50TmFtZSA9PT0gb3B0aW9ucy5lbGVtZW50TmFtZSApIHtcbiAgICAgICAgdGhpcy5fcGRvbUNsYXNzZXMuc3BsaWNlKCBpLCAxICk7XG4gICAgICAgIGNsYXNzUmVtb3ZlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNsYXNzUmVtb3ZlZCwgYE5vZGUgZG9lcyBub3QgaGF2ZSBwZG9tIGF0dHJpYnV0ZSAke2NsYXNzTmFtZX1gICk7XG5cbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLl9wZG9tQ2xhc3Nlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLnBkb21JbnN0YW5jZXNbIGogXS5wZWVyITtcbiAgICAgIHBlZXIucmVtb3ZlQ2xhc3NGcm9tRWxlbWVudCggY2xhc3NOYW1lLCBvcHRpb25zICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGlzdCBvZiBjbGFzc2VzIGFzc2lnbmVkIHRvIFBET00gZWxlbWVudHMgZm9yIHRoaXMgTm9kZS5cbiAgICovXG4gIHB1YmxpYyBnZXRQRE9NQ2xhc3NlcygpOiBQRE9NQ2xhc3NbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Bkb21DbGFzc2VzLnNsaWNlKCAwICk7IC8vIGRlZmVuc2l2ZSBjb3B5XG4gIH1cblxuICBwdWJsaWMgZ2V0IHBkb21DbGFzc2VzKCk6IFBET01DbGFzc1tdIHsgcmV0dXJuIHRoaXMuZ2V0UERPTUNsYXNzZXMoKTsgfVxuXG4gIC8qKlxuICAgKiBNYWtlIHRoZSBET00gZWxlbWVudCBleHBsaWNpdGx5IGZvY3VzYWJsZSB3aXRoIGEgdGFiIGluZGV4LiBOYXRpdmUgSFRNTCBmb3JtIGVsZW1lbnRzIHdpbGwgZ2VuZXJhbGx5IGJlIGluXG4gICAqIHRoZSBuYXZpZ2F0aW9uIG9yZGVyIHdpdGhvdXQgZXhwbGljaXRseSBzZXR0aW5nIGZvY3VzYWJsZS4gIElmIHRoZXNlIG5lZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBuYXZpZ2F0aW9uXG4gICAqIG9yZGVyLCBjYWxsIHNldEZvY3VzYWJsZSggZmFsc2UgKS4gIFJlbW92aW5nIGFuIGVsZW1lbnQgZnJvbSB0aGUgZm9jdXMgb3JkZXIgZG9lcyBub3QgaGlkZSB0aGUgZWxlbWVudCBmcm9tXG4gICAqIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LlxuICAgKlxuICAgKiBAcGFyYW0gZm9jdXNhYmxlIC0gbnVsbCB0byB1c2UgdGhlIGRlZmF1bHQgYnJvd3NlciBmb2N1cyBmb3IgdGhlIHByaW1hcnkgZWxlbWVudFxuICAgKi9cbiAgcHVibGljIHNldEZvY3VzYWJsZSggZm9jdXNhYmxlOiBib29sZWFuIHwgbnVsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmb2N1c2FibGUgPT09IG51bGwgfHwgdHlwZW9mIGZvY3VzYWJsZSA9PT0gJ2Jvb2xlYW4nICk7XG5cbiAgICBpZiAoIHRoaXMuX2ZvY3VzYWJsZU92ZXJyaWRlICE9PSBmb2N1c2FibGUgKSB7XG4gICAgICB0aGlzLl9mb2N1c2FibGVPdmVycmlkZSA9IGZvY3VzYWJsZTtcblxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgICAvLyBhZnRlciB0aGUgb3ZlcnJpZGUgaXMgc2V0LCB1cGRhdGUgdGhlIGZvY3VzYWJpbGl0eSBvZiB0aGUgcGVlciBiYXNlZCBvbiB0aGlzIE5vZGUncyB2YWx1ZSBmb3IgZm9jdXNhYmxlXG4gICAgICAgIC8vIHdoaWNoIG1heSBiZSB0cnVlIG9yIGZhbHNlIChidXQgbm90IG51bGwpXG4gICAgICAgIC8vIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLmZvY3VzYWJsZSA9PT0gJ2Jvb2xlYW4nICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Bkb21JbnN0YW5jZXNbIGkgXS5wZWVyLCAnUGVlciByZXF1aXJlZCB0byBzZXQgZm9jdXNhYmxlLicgKTtcbiAgICAgICAgdGhpcy5fcGRvbUluc3RhbmNlc1sgaSBdLnBlZXIhLnNldEZvY3VzYWJsZSggdGhpcy5mb2N1c2FibGUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IGZvY3VzYWJsZSggaXNGb2N1c2FibGU6IGJvb2xlYW4gfCBudWxsICkgeyB0aGlzLnNldEZvY3VzYWJsZSggaXNGb2N1c2FibGUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgZm9jdXNhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc0ZvY3VzYWJsZSgpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB3aGV0aGVyIG9yIG5vdCB0aGUgTm9kZSBpcyBmb2N1c2FibGUuIFVzZSB0aGUgZm9jdXNPdmVycmlkZSwgYW5kIHRoZW4gZGVmYXVsdCB0byBicm93c2VyIGRlZmluZWRcbiAgICogZm9jdXNhYmxlIGVsZW1lbnRzLlxuICAgKi9cbiAgcHVibGljIGlzRm9jdXNhYmxlKCk6IGJvb2xlYW4ge1xuICAgIGlmICggdGhpcy5fZm9jdXNhYmxlT3ZlcnJpZGUgIT09IG51bGwgKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZm9jdXNhYmxlT3ZlcnJpZGU7XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlcmUgaXNuJ3QgYSB0YWdOYW1lIHlldCwgdGhlbiB0aGVyZSBpc24ndCBhbiBlbGVtZW50LCBzbyB3ZSBhcmVuJ3QgZm9jdXNhYmxlLiBUbyBzdXBwb3J0IG9wdGlvbiBvcmRlci5cbiAgICBlbHNlIGlmICggdGhpcy5fdGFnTmFtZSA9PT0gbnVsbCApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gUERPTVV0aWxzLnRhZ0lzRGVmYXVsdEZvY3VzYWJsZSggdGhpcy5fdGFnTmFtZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzb3VyY2UgTm9kZSB0aGF0IGNvbnRyb2xzIHBvc2l0aW9uaW5nIG9mIHRoZSBwcmltYXJ5IHNpYmxpbmcuIFRyYW5zZm9ybXMgYWxvbmcgdGhlIHRyYWlsIHRvIHRoaXNcbiAgICogTm9kZSBhcmUgb2JzZXJ2ZWQgc28gdGhhdCB0aGUgcHJpbWFyeSBzaWJsaW5nIGlzIHBvc2l0aW9uZWQgY29ycmVjdGx5IGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICpcbiAgICogVGhlIHRyYW5zZm9ybVNvdXJjZU5vZGUgY2Fubm90IHVzZSBEQUcgZm9yIG5vdyBiZWNhdXNlIHdlIG5lZWQgYSB1bmlxdWUgdHJhaWwgdG8gb2JzZXJ2ZSB0cmFuc2Zvcm1zLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCB0cmFuc2Zvcm1zIGFsb25nIHRyYWlscyB0byBhbGwgb2YgdGhpcyBOb2RlJ3MgUERPTUluc3RhbmNlcyBhcmUgb2JzZXJ2ZWQuIEJ1dCB0aGlzXG4gICAqIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIGlmIHlvdSBoYXZlIGEgdmlzdWFsIE5vZGUgcmVwcmVzZW50ZWQgaW4gdGhlIFBET00gYnkgYSBkaWZmZXJlbnQgTm9kZSBpbiB0aGUgc2NlbmVcbiAgICogZ3JhcGggYnV0IHN0aWxsIG5lZWQgdGhlIG90aGVyIE5vZGUncyBQRE9NIGNvbnRlbnQgcG9zaXRpb25lZCBvdmVyIHRoZSB2aXN1YWwgTm9kZS4gRm9yIGV4YW1wbGUsIHRoaXMgY291bGRcbiAgICogYmUgcmVxdWlyZWQgdG8gY2F0Y2ggYWxsIGZha2UgcG9pbnRlciBldmVudHMgdGhhdCBtYXkgY29tZSBmcm9tIGNlcnRhaW4gdHlwZXMgb2Ygc2NyZWVuIHJlYWRlcnMuXG4gICAqL1xuICBwdWJsaWMgc2V0UERPTVRyYW5zZm9ybVNvdXJjZU5vZGUoIG5vZGU6IE5vZGUgfCBudWxsICk6IHZvaWQge1xuICAgIHRoaXMuX3Bkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlID0gbm9kZTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLl9wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciEuc2V0UERPTVRyYW5zZm9ybVNvdXJjZU5vZGUoIHRoaXMuX3Bkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBwZG9tVHJhbnNmb3JtU291cmNlTm9kZSggbm9kZTogTm9kZSB8IG51bGwgKSB7IHRoaXMuc2V0UERPTVRyYW5zZm9ybVNvdXJjZU5vZGUoIG5vZGUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUoKTogTm9kZSB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSgpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc291cmNlIE5vZGUgdGhhdCBjb250cm9scyBwb3NpdGlvbmluZyBvZiB0aGUgcHJpbWFyeSBzaWJsaW5nIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS4gU2VlXG4gICAqIHNldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlIGZvciBtb3JlIGluIGRlcHRoIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIGdldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGU7XG4gIH1cblxuICAvKipcbiAgICogVXNlZCBieSB0aGUgYW5pbWF0ZWRQYW5ab29tU2luZ2xldG9uLiBJdCB3aWxsIHRyeSB0byBrZWVwIHRoZXNlIGJvdW5kcyB2aXNpYmxlIGluIHRoZSB2aWV3cG9ydCB3aGVuIHRoaXMgTm9kZVxuICAgKiAob3IgYW55IGFuY2VzdG9yKSBoYXMgYSB0cmFuc2Zvcm0gY2hhbmdlIHdoaWxlIGZvY3VzZWQuIFRoaXMgaXMgdXNlZnVsIGlmIHRoZSBib3VuZHMgb2YgeW91ciBmb2N1c2FibGVcbiAgICogTm9kZSBkbyBub3QgYWNjdXJhdGVseSBzdXJyb3VuZCB0aGUgY29uY2VwdHVhbCBpbnRlcmFjdGl2ZSBjb21wb25lbnQuIElmIG51bGwsIHRoaXMgTm9kZSdzIGxvY2FsIGJvdW5kc1xuICAgKiBhcmUgdXNlZC5cbiAgICpcbiAgICogQXQgdGhpcyB0aW1lLCB0aGUgUHJvcGVydHkgY2Fubm90IGJlIGNoYW5nZWQgYWZ0ZXIgaXQgaXMgc2V0LlxuICAgKi9cbiAgcHVibGljIHNldEZvY3VzUGFuVGFyZ2V0Qm91bmRzUHJvcGVydHkoIGJvdW5kc1Byb3BlcnR5OiBudWxsIHwgVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4gKTogdm9pZCB7XG5cbiAgICAvLyBXZSBtYXkgY2FsbCB0aGlzIG1vcmUgdGhhbiBvbmNlIHdpdGggbXV0YXRlXG4gICAgaWYgKCBib3VuZHNQcm9wZXJ0eSAhPT0gdGhpcy5fZm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9mb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5LCAnQ2Fubm90IGNoYW5nZSBmb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5IGFmdGVyIGl0IGlzIHNldC4nICk7XG4gICAgICB0aGlzLl9mb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5ID0gYm91bmRzUHJvcGVydHk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBnbG9iYWwgYm91bmRzIHRvIGtlZXAgaW4gdGhlIHZpZXdwb3J0IHdoaWxlIHRoZSBjb21wb25lbnQgaGFzIGZvY3VzLCBzZWUgdGhlXG4gICAqIHNldEZvY3VzUGFuVGFyZ2V0Qm91bmRzUHJvcGVydHkgZnVuY3Rpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZ2V0Rm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eSgpOiBudWxsIHwgVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4ge1xuICAgIHJldHVybiB0aGlzLl9mb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5O1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRGb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIHNldCBmb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5KCBib3VuZHNQcm9wZXJ0eTogbnVsbCB8IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczI+ICkge1xuICAgIHRoaXMuc2V0Rm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eSggYm91bmRzUHJvcGVydHkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0Rm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBnZXQgZm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eSgpOiBudWxsIHwgVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4ge1xuICAgIHJldHVybiB0aGlzLmdldEZvY3VzUGFuVGFyZ2V0Qm91bmRzUHJvcGVydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkaXJlY3Rpb24gdGhhdCB0aGUgZ2xvYmFsIEFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyIHdpbGwgcGFuIHdoaWxlIGludGVyYWN0aW5nIHdpdGggdGhpcyBOb2RlLiBQYW4gd2lsbCBPTkxZXG4gICAqIG9jY3VyIGluIHRoaXMgZGltZW5zaW9uLiBUaGlzIGlzIGVzcGVjaWFsbHkgdXNlZnVsIGZvciBwYW5uaW5nIHRvIGxhcmdlIE5vZGVzIHdoZXJlIHBhbm5pbmcgdG8gdGhlIGNlbnRlciBvZiB0aGVcbiAgICogTm9kZSB3b3VsZCBtb3ZlIG90aGVyIE5vZGVzIG91dCBvZiB0aGUgdmlld3BvcnQuXG4gICAqXG4gICAqIFNldCB0byBudWxsIGZvciBkZWZhdWx0IGJlaGF2aW9yIChwYW5uaW5nIGluIGFsbCBkaXJlY3Rpb25zKS5cbiAgICovXG4gIHB1YmxpYyBzZXRMaW1pdFBhbkRpcmVjdGlvbiggbGltaXRQYW5EaXJlY3Rpb246IExpbWl0UGFuRGlyZWN0aW9uIHwgbnVsbCApOiB2b2lkIHtcbiAgICB0aGlzLl9saW1pdFBhbkRpcmVjdGlvbiA9IGxpbWl0UGFuRGlyZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRMaW1pdFBhbkRpcmVjdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBnZXRMaW1pdFBhbkRpcmVjdGlvbigpOiBMaW1pdFBhbkRpcmVjdGlvbiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9saW1pdFBhbkRpcmVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0TGltaXRQYW5EaXJlY3Rpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAqIEBwYXJhbSBsaW1pdFBhbkRpcmVjdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBsaW1pdFBhbkRpcmVjdGlvbiggbGltaXRQYW5EaXJlY3Rpb246IExpbWl0UGFuRGlyZWN0aW9uICkge1xuICAgIHRoaXMuc2V0TGltaXRQYW5EaXJlY3Rpb24oIGxpbWl0UGFuRGlyZWN0aW9uICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldExpbWl0UGFuRGlyZWN0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIGdldCBsaW1pdFBhbkRpcmVjdGlvbigpOiBMaW1pdFBhbkRpcmVjdGlvbiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmdldExpbWl0UGFuRGlyZWN0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRoZSBQRE9NIHNpYmxpbmcgZWxlbWVudHMgYXJlIHBvc2l0aW9uZWQgaW4gdGhlIGNvcnJlY3QgcGxhY2UgaW4gdGhlIHZpZXdwb3J0LiBEb2luZyBzbyBpcyBhXG4gICAqIHJlcXVpcmVtZW50IGZvciBjdXN0b20gZ2VzdHVyZXMgb24gdG91Y2ggYmFzZWQgc2NyZWVuIHJlYWRlcnMuIEhvd2V2ZXIsIGRvaW5nIHRoaXMgRE9NIGxheW91dCBpcyBleHBlbnNpdmUgc29cbiAgICogb25seSBkbyB0aGlzIHdoZW4gbmVjZXNzYXJ5LiBHZW5lcmFsbHkgb25seSBuZWVkZWQgZm9yIGVsZW1lbnRzIHRoYXQgdXRpbGl6ZSBhIFwiZG91YmxlIHRhcCBhbmQgaG9sZFwiIGdlc3R1cmVcbiAgICogdG8gZHJhZyBhbmQgZHJvcC5cbiAgICpcbiAgICogUG9zaXRpb25pbmcgdGhlIFBET00gZWxlbWVudCB3aWxsIGNhdXNlZCBzb21lIHNjcmVlbiByZWFkZXJzIHRvIHNlbmQgYm90aCBjbGljayBhbmQgcG9pbnRlciBldmVudHMgdG8gdGhlXG4gICAqIGxvY2F0aW9uIG9mIHRoZSBOb2RlIGluIGdsb2JhbCBjb29yZGluYXRlcy4gRG8gbm90IHBvc2l0aW9uIGVsZW1lbnRzIHRoYXQgdXNlIGNsaWNrIGxpc3RlbmVycyBzaW5jZSBhY3RpdmF0aW9uXG4gICAqIHdpbGwgZmlyZSB0d2ljZSAob25jZSBmb3IgdGhlIHBvaW50ZXIgZXZlbnQgbGlzdGVuZXJzIGFuZCBvbmNlIGZvciB0aGUgY2xpY2sgZXZlbnQgbGlzdGVuZXJzKS5cbiAgICovXG4gIHB1YmxpYyBzZXRQb3NpdGlvbkluUERPTSggcG9zaXRpb25JblBET006IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgdGhpcy5fcG9zaXRpb25JblBET00gPSBwb3NpdGlvbkluUERPTTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLl9wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciEuc2V0UG9zaXRpb25JblBET00oIHBvc2l0aW9uSW5QRE9NICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBwb3NpdGlvbkluUERPTSggcG9zaXRpb25JblBET006IGJvb2xlYW4gKSB7IHRoaXMuc2V0UG9zaXRpb25JblBET00oIHBvc2l0aW9uSW5QRE9NICk7IH1cblxuICBwdWJsaWMgZ2V0IHBvc2l0aW9uSW5QRE9NKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRQb3NpdGlvbkluUERPTSgpOyB9XG5cbiAgLyoqXG4gICAqIEdldHMgd2hldGhlciBvciBub3Qgd2UgYXJlIHBvc2l0aW9uaW5nIHRoZSBQRE9NIHNpYmxpbmcgZWxlbWVudHMuIFNlZSBzZXRQb3NpdGlvbkluUERPTSgpLlxuICAgKi9cbiAgcHVibGljIGdldFBvc2l0aW9uSW5QRE9NKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbkluUERPTTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBiZSB1c2VkIHNwYXJpbmdseSBhcyBhIHdvcmthcm91bmQuIElmIHVzZWQsIGFueSBET00gaW5wdXQgZXZlbnRzIHJlY2VpdmVkIGZyb20gdGhlIGxhYmVsXG4gICAqIHNpYmxpbmcgd2lsbCBub3QgYmUgZGlzcGF0Y2hlZCBhcyBTY2VuZXJ5RXZlbnRzIGluIElucHV0LmpzLiBUaGUgbGFiZWwgc2libGluZyBtYXkgcmVjZWl2ZSBpbnB1dCBieSBzY3JlZW5cbiAgICogcmVhZGVycyBpZiB0aGUgdmlydHVhbCBjdXJzb3IgaXMgb3ZlciBpdC4gVGhhdCBpcyB1c3VhbGx5IGZpbmUsIGJ1dCB0aGVyZSBpcyBhIGJ1ZyB3aXRoIE5WREEgYW5kIEZpcmVmb3ggd2hlcmVcbiAgICogYm90aCB0aGUgbGFiZWwgc2libGluZyBBTkQgcHJpbWFyeSBzaWJsaW5nIHJlY2VpdmUgZXZlbnRzIGluIHRoaXMgY2FzZSwgYW5kIGJvdGggYnViYmxlIHVwIHRvIHRoZSByb290IG9mIHRoZVxuICAgKiBQRE9NLCBhbmQgc28gd2Ugd291bGQgb3RoZXJ3aXNlIGRpc3BhdGNoIHR3byBTY2VuZXJ5RXZlbnRzIGluc3RlYWQgb2Ygb25lLlxuICAgKlxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ExMXktcmVzZWFyY2gvaXNzdWVzLzE1NiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzZXRFeGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0KCk6IHZvaWQge1xuICAgIHRoaXMuZXhjbHVkZUxhYmVsU2libGluZ0Zyb21JbnB1dCA9IHRydWU7XG4gICAgdGhpcy5vblBET01Db250ZW50Q2hhbmdlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRydWUgaWYgdGhpcyBOb2RlIGlzIGEgUGhFVC1pTyBhcmNoZXR5cGUgb3IgaXQgaXMgYSBOb2RlIGRlc2NlbmRhbnQgb2YgYSBQaEVULWlPIGFyY2hldHlwZS5cbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvODE3XG4gICAqL1xuICBwdWJsaWMgaXNJbnNpZGVQaGV0aW9BcmNoZXR5cGUoIG5vZGU6IE5vZGUgPSAoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICkgKTogYm9vbGVhbiB7XG4gICAgaWYgKCBub2RlLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XG4gICAgICByZXR1cm4gbm9kZS5waGV0aW9Jc0FyY2hldHlwZTtcbiAgICB9XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9kZS5wYXJlbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLmlzSW5zaWRlUGhldGlvQXJjaGV0eXBlKCBub2RlLnBhcmVudHNbIGkgXSApICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsZXJ0IG9uIGFsbCBpbnRlcmFjdGl2ZSBkZXNjcmlwdGlvbiB1dHRlcmFuY2VRdWV1ZXMgbG9jYXRlZCBvbiBlYWNoIGNvbm5lY3RlZCBEaXNwbGF5LiBTZWVcbiAgICogTm9kZS5nZXRDb25uZWN0ZWREaXNwbGF5cy4gTm90ZSB0aGF0IGlmIHlvdXIgTm9kZSBpcyBub3QgY29ubmVjdGVkIHRvIGEgRGlzcGxheSwgdGhpcyBmdW5jdGlvbiB3aWxsIGhhdmVcbiAgICogbm8gZWZmZWN0LlxuICAgKi9cbiAgcHVibGljIGFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIHV0dGVyYW5jZTogVEFsZXJ0YWJsZSApOiB2b2lkIHtcblxuICAgIC8vIE5vIGRlc2NyaXB0aW9uIHNob3VsZCBiZSBhbGVydGVkIGlmIHNldHRpbmcgUGhFVC1pTyBzdGF0ZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMzk3XG4gICAgaWYgKCBpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE5vIGRlc2NyaXB0aW9uIHNob3VsZCBiZSBhbGVydGVkIGlmIGFuIGFyY2hldHlwZSBvZiBhIFBoRVQtaU8gZHluYW1pYyBlbGVtZW50LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy84MTdcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc0luc2lkZVBoZXRpb0FyY2hldHlwZSgpICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3RlZERpc3BsYXlzID0gKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApLmdldENvbm5lY3RlZERpc3BsYXlzKCk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29ubmVjdGVkRGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBkaXNwbGF5ID0gY29ubmVjdGVkRGlzcGxheXNbIGkgXTtcbiAgICAgIGlmICggZGlzcGxheS5pc0FjY2Vzc2libGUoKSApIHtcblxuICAgICAgICAvLyBEb24ndCB1c2UgYGZvckVhY2hVdHRlcmFuY2VgIHRvIHByZXZlbnQgY3JlYXRpbmcgYSBjbG9zdXJlIGZvciBlYWNoIHVzYWdlIG9mIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgZGlzcGxheS5kZXNjcmlwdGlvblV0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdXR0ZXJhbmNlICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IGEgY2FsbGJhY2sgb24gZWFjaCB1dHRlcmFuY2VRdWV1ZSB0aGF0IHRoaXMgTm9kZSBoYXMgYSBjb25uZWN0aW9uIHRvICh2aWEgRGlzcGxheSkuIE5vdGUgdGhhdCBvbmx5XG4gICAqIGFjY2Vzc2libGUgRGlzcGxheXMgaGF2ZSB1dHRlcmFuY2VRdWV1ZXMgdGhhdCB0aGlzIGZ1bmN0aW9uIHdpbGwgaW50ZXJmYWNlIHdpdGguXG4gICAqL1xuICBwdWJsaWMgZm9yRWFjaFV0dGVyYW5jZVF1ZXVlKCBjYWxsYmFjazogKCBxdWV1ZTogVXR0ZXJhbmNlUXVldWUgKSA9PiB2b2lkICk6IHZvaWQge1xuICAgIGNvbnN0IGNvbm5lY3RlZERpc3BsYXlzID0gKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApLmdldENvbm5lY3RlZERpc3BsYXlzKCk7XG5cbiAgICAvLyBJZiB5b3UgcnVuIGludG8gdGhpcyBhc3NlcnRpb24sIHRhbGsgdG8gQGplc3NlZ3JlZW5iZXJnIGFuZCBAemVwdW1waCwgYmVjYXVzZSBpdCBpcyBxdWl0ZSBwb3NzaWJsZSB3ZSB3b3VsZFxuICAgIC8vIHJlbW92ZSB0aGlzIGFzc2VydGlvbiBmb3IgeW91ciBjYXNlLlxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbm5lY3RlZERpc3BsYXlzLmxlbmd0aCA+IDAsXG4gICAgICAnbXVzdCBiZSBjb25uZWN0ZWQgdG8gYSBkaXNwbGF5IHRvIHVzZSBVdHRlcmFuY2VRdWV1ZSBmZWF0dXJlcycgKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvbm5lY3RlZERpc3BsYXlzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZGlzcGxheSA9IGNvbm5lY3RlZERpc3BsYXlzWyBpIF07XG4gICAgICBpZiAoIGRpc3BsYXkuaXNBY2Nlc3NpYmxlKCkgKSB7XG4gICAgICAgIGNhbGxiYWNrKCBkaXNwbGF5LmRlc2NyaXB0aW9uVXR0ZXJhbmNlUXVldWUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8vIFNDRU5FUlktSU5URVJOQUwgQU5EIFBSSVZBVEUgTUVUSE9EU1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZ2V0IGEgbGlzdCBvZiBhbGwgc2V0dGFibGUgb3B0aW9ucyBhbmQgdGhlaXIgY3VycmVudCB2YWx1ZXMuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcmV0dXJucyAtIGtleXMgYXJlIGFsbCBhY2Nlc3NpYmlsaXR5IG9wdGlvbiBrZXlzLCBhbmQgdGhlIHZhbHVlcyBhcmUgdGhlIHZhbHVlcyBvZiB0aG9zZSBwcm9wZXJ0aWVzXG4gICAqIG9uIHRoaXMgTm9kZS5cbiAgICovXG4gIHB1YmxpYyBnZXRCYXNlT3B0aW9ucygpOiBQYXJhbGxlbERPTU9wdGlvbnMge1xuXG4gICAgY29uc3QgY3VycmVudE9wdGlvbnM6IFBhcmFsbGVsRE9NT3B0aW9ucyA9IHt9O1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgQUNDRVNTSUJJTElUWV9PUFRJT05fS0VZUy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IG9wdGlvbk5hbWUgPSBBQ0NFU1NJQklMSVRZX09QVElPTl9LRVlTWyBpIF07XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBOb3Qgc3VyZSBvZiBhIGdyZWF0IHdheSB0byBkbyB0aGlzXG4gICAgICBjdXJyZW50T3B0aW9uc1sgb3B0aW9uTmFtZSBdID0gdGhpc1sgb3B0aW9uTmFtZSBdO1xuICAgIH1cblxuICAgIHJldHVybiBjdXJyZW50T3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVjdXJzaXZlIGRhdGEgc3RydWN0dXJlIHRoYXQgcmVwcmVzZW50cyB0aGUgbmVzdGVkIG9yZGVyaW5nIG9mIHBkb20gY29udGVudCBmb3IgdGhpcyBOb2RlJ3NcbiAgICogc3VidHJlZS4gRWFjaCBcIkl0ZW1cIiB3aWxsIGhhdmUgdGhlIHR5cGUgeyB0cmFpbDoge1RyYWlsfSwgY2hpbGRyZW46IHtBcnJheS48SXRlbT59IH0sIGZvcm1pbmcgYSB0cmVlLWxpa2VcbiAgICogc3RydWN0dXJlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXROZXN0ZWRQRE9NT3JkZXIoKTogeyB0cmFpbDogVHJhaWw7IGNoaWxkcmVuOiBOb2RlW10gfVtdIHtcbiAgICBjb25zdCBjdXJyZW50VHJhaWwgPSBuZXcgVHJhaWwoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XG4gICAgbGV0IHBydW5lU3RhY2s6IE5vZGVbXSA9IFtdOyAvLyBBIGxpc3Qgb2YgTm9kZXMgdG8gcHJ1bmVcblxuICAgIC8vIHtBcnJheS48SXRlbT59IC0gVGhlIG1haW4gcmVzdWx0IHdlIHdpbGwgYmUgcmV0dXJuaW5nLiBJdCBpcyB0aGUgdG9wLWxldmVsIGFycmF5IHdoZXJlIGNoaWxkIGl0ZW1zIHdpbGwgYmVcbiAgICAvLyBpbnNlcnRlZC5cbiAgICBjb25zdCByZXN1bHQ6IHsgdHJhaWw6IFRyYWlsOyBjaGlsZHJlbjogTm9kZVtdIH1bXSA9IFtdO1xuXG4gICAgLy8ge0FycmF5LjxBcnJheS48SXRlbT4+fSBBIHN0YWNrIG9mIGNoaWxkcmVuIGFycmF5cywgd2hlcmUgd2Ugc2hvdWxkIGJlIGluc2VydGluZyBpdGVtcyBpbnRvIHRoZSB0b3AgYXJyYXkuXG4gICAgLy8gV2Ugd2lsbCBzdGFydCBvdXQgd2l0aCB0aGUgcmVzdWx0LCBhbmQgYXMgbmVzdGVkIGxldmVscyBhcmUgYWRkZWQsIHRoZSBjaGlsZHJlbiBhcnJheXMgb2YgdGhvc2UgaXRlbXMgd2lsbCBiZVxuICAgIC8vIHB1c2hlZCBhbmQgcG9wcHBlZCwgc28gdGhhdCB0aGUgdG9wIGFycmF5IG9uIHRoaXMgc3RhY2sgaXMgd2hlcmUgd2Ugc2hvdWxkIGluc2VydCBvdXIgbmV4dCBjaGlsZCBpdGVtLlxuICAgIGNvbnN0IG5lc3RlZENoaWxkU3RhY2sgPSBbIHJlc3VsdCBdO1xuXG4gICAgZnVuY3Rpb24gYWRkVHJhaWxzRm9yTm9kZSggbm9kZTogTm9kZSwgb3ZlcnJpZGVQcnVuaW5nOiBib29sZWFuICk6IHZvaWQge1xuICAgICAgLy8gSWYgc3VidHJlZXMgd2VyZSBzcGVjaWZpZWQgd2l0aCBwZG9tT3JkZXIsIHRoZXkgc2hvdWxkIGJlIHNraXBwZWQgZnJvbSB0aGUgb3JkZXJpbmcgb2YgYW5jZXN0b3Igc3VidHJlZXMsXG4gICAgICAvLyBvdGhlcndpc2Ugd2UgY291bGQgZW5kIHVwIGhhdmluZyBtdWx0aXBsZSByZWZlcmVuY2VzIHRvIHRoZSBzYW1lIHRyYWlsICh3aGljaCBzaG91bGQgYmUgZGlzYWxsb3dlZCkuXG4gICAgICBsZXQgcHJ1bmVDb3VudCA9IDA7XG4gICAgICAvLyBjb3VudCB0aGUgbnVtYmVyIG9mIHRpbWVzIG91ciBOb2RlIGFwcGVhcnMgaW4gdGhlIHBydW5lU3RhY2tcbiAgICAgIF8uZWFjaCggcHJ1bmVTdGFjaywgcHJ1bmVOb2RlID0+IHtcbiAgICAgICAgaWYgKCBub2RlID09PSBwcnVuZU5vZGUgKSB7XG4gICAgICAgICAgcHJ1bmVDb3VudCsrO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIElmIG92ZXJyaWRlUHJ1bmluZyBpcyBzZXQsIHdlIGlnbm9yZSBvbmUgcmVmZXJlbmNlIHRvIG91ciBOb2RlIGluIHRoZSBwcnVuZSBzdGFjay4gSWYgdGhlcmUgYXJlIHR3byBjb3BpZXMsXG4gICAgICAvLyBob3dldmVyLCBpdCBtZWFucyBhIE5vZGUgd2FzIHNwZWNpZmllZCBpbiBhIHBkb21PcmRlciB0aGF0IGFscmVhZHkgbmVlZHMgdG8gYmUgcHJ1bmVkIChzbyB3ZSBza2lwIGl0IGluc3RlYWRcbiAgICAgIC8vIG9mIGNyZWF0aW5nIGR1cGxpY2F0ZSByZWZlcmVuY2VzIGluIHRoZSB0cmF2ZXJzYWwgb3JkZXIpLlxuICAgICAgaWYgKCBwcnVuZUNvdW50ID4gMSB8fCAoIHBydW5lQ291bnQgPT09IDEgJiYgIW92ZXJyaWRlUHJ1bmluZyApICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFB1c2hpbmcgaXRlbSBhbmQgaXRzIGNoaWxkcmVuIGFycmF5LCBpZiBoYXMgcGRvbSBjb250ZW50XG4gICAgICBpZiAoIG5vZGUuaGFzUERPTUNvbnRlbnQgKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB7XG4gICAgICAgICAgdHJhaWw6IGN1cnJlbnRUcmFpbC5jb3B5KCksXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH07XG4gICAgICAgIG5lc3RlZENoaWxkU3RhY2tbIG5lc3RlZENoaWxkU3RhY2subGVuZ3RoIC0gMSBdLnB1c2goIGl0ZW0gKTtcbiAgICAgICAgbmVzdGVkQ2hpbGRTdGFjay5wdXNoKCBpdGVtLmNoaWxkcmVuICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFycmF5UERPTU9yZGVyID0gbm9kZS5fcGRvbU9yZGVyID09PSBudWxsID8gW10gOiBub2RlLl9wZG9tT3JkZXI7XG5cbiAgICAgIC8vIHB1c2ggc3BlY2lmaWMgZm9jdXNlZCBOb2RlcyB0byB0aGUgc3RhY2tcbiAgICAgIHBydW5lU3RhY2sgPSBwcnVuZVN0YWNrLmNvbmNhdCggYXJyYXlQRE9NT3JkZXIgYXMgTm9kZVtdICk7XG5cbiAgICAgIC8vIFZpc2l0aW5nIHRyYWlscyB0byBvcmRlcmVkIE5vZGVzLlxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgXy5lYWNoKCBhcnJheVBET01PcmRlciwgKCBkZXNjZW5kYW50OiBOb2RlICkgPT4ge1xuICAgICAgICAvLyBGaW5kIGFsbCBkZXNjZW5kYW50IHJlZmVyZW5jZXMgdG8gdGhlIE5vZGUuXG4gICAgICAgIC8vIE5PVEU6IFdlIGFyZSBub3QgcmVvcmRlcmluZyB0cmFpbHMgKGR1ZSB0byBkZXNjZW5kYW50IGNvbnN0cmFpbnRzKSBpZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIGluc3RhbmNlIGZvclxuICAgICAgICAvLyB0aGlzIGRlc2NlbmRhbnQgTm9kZS5cbiAgICAgICAgXy5lYWNoKCBub2RlLmdldExlYWZUcmFpbHNUbyggZGVzY2VuZGFudCApLCBkZXNjZW5kYW50VHJhaWwgPT4ge1xuICAgICAgICAgIGRlc2NlbmRhbnRUcmFpbC5yZW1vdmVBbmNlc3RvcigpOyAvLyBzdHJpcCBvZmYgJ25vZGUnLCBzbyB0aGF0IHdlIGhhbmRsZSBvbmx5IGNoaWxkcmVuXG5cbiAgICAgICAgICAvLyBzYW1lIGFzIHRoZSBub3JtYWwgb3JkZXIsIGJ1dCBhZGRpbmcgYSBmdWxsIHRyYWlsIChzaW5jZSB3ZSBtYXkgYmUgcmVmZXJlbmNpbmcgYSBkZXNjZW5kYW50IE5vZGUpXG4gICAgICAgICAgY3VycmVudFRyYWlsLmFkZERlc2NlbmRhbnRUcmFpbCggZGVzY2VuZGFudFRyYWlsICk7XG4gICAgICAgICAgYWRkVHJhaWxzRm9yTm9kZSggZGVzY2VuZGFudCwgdHJ1ZSApOyAvLyAndHJ1ZScgb3ZlcnJpZGVzIG9uZSByZWZlcmVuY2UgaW4gdGhlIHBydW5lIHN0YWNrIChhZGRlZCBhYm92ZSlcbiAgICAgICAgICBjdXJyZW50VHJhaWwucmVtb3ZlRGVzY2VuZGFudFRyYWlsKCBkZXNjZW5kYW50VHJhaWwgKTtcbiAgICAgICAgfSApO1xuICAgICAgfSApO1xuXG4gICAgICAvLyBWaXNpdCBldmVyeXRoaW5nLiBJZiB0aGVyZSBpcyBhIHBkb21PcmRlciwgdGhvc2UgdHJhaWxzIHdlcmUgYWxyZWFkeSB2aXNpdGVkLCBhbmQgd2lsbCBiZSBleGNsdWRlZC5cbiAgICAgIGNvbnN0IG51bUNoaWxkcmVuID0gbm9kZS5fY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtQ2hpbGRyZW47IGkrKyApIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBub2RlLl9jaGlsZHJlblsgaSBdO1xuXG4gICAgICAgIGN1cnJlbnRUcmFpbC5hZGREZXNjZW5kYW50KCBjaGlsZCwgaSApO1xuICAgICAgICBhZGRUcmFpbHNGb3JOb2RlKCBjaGlsZCwgZmFsc2UgKTtcbiAgICAgICAgY3VycmVudFRyYWlsLnJlbW92ZURlc2NlbmRhbnQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gcG9wIGZvY3VzZWQgTm9kZXMgZnJvbSB0aGUgc3RhY2sgKHRoYXQgd2VyZSBhZGRlZCBhYm92ZSlcbiAgICAgIF8uZWFjaCggYXJyYXlQRE9NT3JkZXIsICgpID0+IHtcbiAgICAgICAgcHJ1bmVTdGFjay5wb3AoKTtcbiAgICAgIH0gKTtcblxuICAgICAgLy8gUG9wcGluZyBjaGlsZHJlbiBhcnJheSBpZiBoYXMgcGRvbSBjb250ZW50XG4gICAgICBpZiAoIG5vZGUuaGFzUERPTUNvbnRlbnQgKSB7XG4gICAgICAgIG5lc3RlZENoaWxkU3RhY2sucG9wKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkVHJhaWxzRm9yTm9kZSggKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApLCBmYWxzZSApO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwZG9tIGNvbnRlbnQgZm9yIGEgTm9kZS4gU2VlIGNvbnN0cnVjdG9yIGZvciBtb3JlIGluZm9ybWF0aW9uLiBOb3QgcGFydCBvZiB0aGUgUGFyYWxsZWxET01cbiAgICogQVBJIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHJpdmF0ZSBvblBET01Db250ZW50Q2hhbmdlKCk6IHZvaWQge1xuXG4gICAgUERPTVRyZWUucGRvbUNvbnRlbnRDaGFuZ2UoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XG5cbiAgICAvLyByZWNvbXB1dGUgdGhlIGhlYWRpbmcgbGV2ZWwgZm9yIHRoaXMgTm9kZSBpZiBpdCBpcyB1c2luZyB0aGUgcGRvbUhlYWRpbmcgQVBJLlxuICAgIHRoaXMucGRvbUhlYWRpbmcgJiYgdGhpcy5jb21wdXRlSGVhZGluZ0xldmVsKCk7XG5cbiAgICAoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICkucmVuZGVyZXJTdW1tYXJ5UmVmcmVzaEVtaXR0ZXIuZW1pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhpcyBOb2RlIGhhcyBhbnkgcmVwcmVzZW50YXRpb24gZm9yIHRoZSBQYXJhbGxlbCBET00uXG4gICAqIE5vdGUgdGhpcyBpcyBzdGlsbCB0cnVlIGlmIHRoZSBjb250ZW50IGlzIHBkb21WaXNpYmxlPWZhbHNlIG9yIGlzIG90aGVyd2lzZSBoaWRkZW4uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGhhc1BET01Db250ZW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX3RhZ05hbWU7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIE5vZGUgaXMgYWRkZWQgYXMgYSBjaGlsZCB0byB0aGlzIE5vZGUgQU5EIHRoZSBOb2RlJ3Mgc3VidHJlZSBjb250YWlucyBwZG9tIGNvbnRlbnQuXG4gICAqIFdlIG5lZWQgdG8gbm90aWZ5IGFsbCBEaXNwbGF5cyB0aGF0IGNhbiBzZWUgdGhpcyBjaGFuZ2UsIHNvIHRoYXQgdGhleSBjYW4gdXBkYXRlIHRoZSBQRE9NSW5zdGFuY2UgdHJlZS5cbiAgICovXG4gIHByb3RlY3RlZCBvblBET01BZGRDaGlsZCggbm9kZTogTm9kZSApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFyYWxsZWxET00gJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSggYG9uUERPTUFkZENoaWxkIG4jJHtub2RlLmlkfSAocGFyZW50Om4jJHsoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICkuaWR9KWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFyYWxsZWxET00gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBGaW5kIGRlc2NlbmRhbnRzIHdpdGggcGRvbU9yZGVycyBhbmQgY2hlY2sgdGhlbSBhZ2FpbnN0IGFsbCBvZiB0aGVpciBhbmNlc3RvcnMvc2VsZlxuICAgIGFzc2VydCAmJiAoIGZ1bmN0aW9uIHJlY3VyKCBkZXNjZW5kYW50ICkge1xuICAgICAgLy8gUHJ1bmUgdGhlIHNlYXJjaCAoYmVjYXVzZSBtaWxsaXNlY29uZHMgZG9uJ3QgZ3JvdyBvbiB0cmVlcywgZXZlbiBpZiB3ZSBkbyBoYXZlIGFzc2VydGlvbnMgZW5hYmxlZClcbiAgICAgIGlmICggZGVzY2VuZGFudC5fcmVuZGVyZXJTdW1tYXJ5Lmhhc05vUERPTSgpICkgeyByZXR1cm47IH1cblxuICAgICAgZGVzY2VuZGFudC5wZG9tT3JkZXIgJiYgYXNzZXJ0KCBkZXNjZW5kYW50LmdldFRyYWlscyggbm9kZSA9PiBfLmluY2x1ZGVzKCBkZXNjZW5kYW50LnBkb21PcmRlciwgbm9kZSApICkubGVuZ3RoID09PSAwLCAncGRvbU9yZGVyIHNob3VsZCBub3QgaW5jbHVkZSBhbnkgYW5jZXN0b3JzIG9yIHRoZSBOb2RlIGl0c2VsZicgKTtcbiAgICB9ICkoIG5vZGUgKTtcblxuICAgIGFzc2VydCAmJiBQRE9NVHJlZS5hdWRpdE5vZGVGb3JQRE9NQ3ljbGVzKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApO1xuXG4gICAgdGhpcy5fcGRvbURpc3BsYXlzSW5mby5vbkFkZENoaWxkKCBub2RlICk7XG5cbiAgICBQRE9NVHJlZS5hZGRDaGlsZCggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUsIG5vZGUgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBOb2RlIGlzIHJlbW92ZWQgYXMgYSBjaGlsZCBmcm9tIHRoaXMgTm9kZSBBTkQgdGhlIE5vZGUncyBzdWJ0cmVlIGNvbnRhaW5zIHBkb20gY29udGVudC5cbiAgICogV2UgbmVlZCB0byBub3RpZnkgYWxsIERpc3BsYXlzIHRoYXQgY2FuIHNlZSB0aGlzIGNoYW5nZSwgc28gdGhhdCB0aGV5IGNhbiB1cGRhdGUgdGhlIFBET01JbnN0YW5jZSB0cmVlLlxuICAgKi9cbiAgcHJvdGVjdGVkIG9uUERPTVJlbW92ZUNoaWxkKCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLlBhcmFsbGVsRE9NKCBgb25QRE9NUmVtb3ZlQ2hpbGQgbiMke25vZGUuaWR9IChwYXJlbnQ6biMkeyggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5pZH0pYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIHRoaXMuX3Bkb21EaXNwbGF5c0luZm8ub25SZW1vdmVDaGlsZCggbm9kZSApO1xuXG4gICAgUERPTVRyZWUucmVtb3ZlQ2hpbGQoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlLCBub2RlICk7XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgYXNzb2NpYXRpb25zIGZvciBhcmlhLWxhYmVsbGVkYnkgYW5kIGFyaWEtZGVzY3JpYmVkYnkgYXJlIHVwZGF0ZWQgZm9yIE5vZGVzIGFzc29jaWF0ZWRcbiAgICAvLyB0byB0aGlzIE5vZGUgKHRoZXkgYXJlIHBvaW50aW5nIHRvIHRoaXMgTm9kZSdzIElEcykuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84MTZcbiAgICBub2RlLnVwZGF0ZU90aGVyTm9kZXNBcmlhTGFiZWxsZWRieSgpO1xuICAgIG5vZGUudXBkYXRlT3RoZXJOb2Rlc0FyaWFEZXNjcmliZWRieSgpO1xuICAgIG5vZGUudXBkYXRlT3RoZXJOb2Rlc0FjdGl2ZURlc2NlbmRhbnQoKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoaXMgTm9kZSdzIGNoaWxkcmVuIGFyZSByZW9yZGVyZWQgKHdpdGggbm90aGluZyBhZGRlZC9yZW1vdmVkKS5cbiAgICovXG4gIHByb3RlY3RlZCBvblBET01SZW9yZGVyZWRDaGlsZHJlbigpOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFyYWxsZWxET00gJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSggYG9uUERPTVJlb3JkZXJlZENoaWxkcmVuIChwYXJlbnQ6biMkeyggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5pZH0pYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIFBET01UcmVlLmNoaWxkcmVuT3JkZXJDaGFuZ2UoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFyYWxsZWxET00gJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGxpbmtpbmcgYW5kIGNoZWNraW5nIGNoaWxkIFBoRVQtaU8gUHJvcGVydGllcyBzdWNoIGFzIE5vZGUudmlzaWJsZVByb3BlcnR5IGFuZCBOb2RlLmVuYWJsZWRQcm9wZXJ0eS5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGVMaW5rZWRFbGVtZW50Rm9yUHJvcGVydHk8VD4oIHRhbmRlbU5hbWU6IHN0cmluZywgb2xkUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxUPiB8IG51bGwsIG5ld1Byb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8VD4gfCBudWxsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9sZFByb3BlcnR5ICE9PSBuZXdQcm9wZXJ0eSwgJ3Nob3VsZCBub3QgYmUgY2FsbGVkIG9uIHNhbWUgdmFsdWVzJyApO1xuXG4gICAgLy8gT25seSB1cGRhdGUgbGlua2VkIGVsZW1lbnRzIGlmIHRoaXMgTm9kZSBpcyBpbnN0cnVtZW50ZWQgZm9yIFBoRVQtaU9cbiAgICBpZiAoIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSApIHtcblxuICAgICAgb2xkUHJvcGVydHkgJiYgb2xkUHJvcGVydHkgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5ICYmIG9sZFByb3BlcnR5LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgJiYgb2xkUHJvcGVydHkgaW5zdGFuY2VvZiBQaGV0aW9PYmplY3QgJiYgdGhpcy5yZW1vdmVMaW5rZWRFbGVtZW50cyggb2xkUHJvcGVydHkgKTtcblxuICAgICAgY29uc3QgdGFuZGVtID0gdGhpcy50YW5kZW0uY3JlYXRlVGFuZGVtKCB0YW5kZW1OYW1lICk7XG5cbiAgICAgIGlmICggbmV3UHJvcGVydHkgJiYgbmV3UHJvcGVydHkgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5ICYmIG5ld1Byb3BlcnR5LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgJiYgbmV3UHJvcGVydHkgaW5zdGFuY2VvZiBQaGV0aW9PYmplY3QgJiYgdGFuZGVtICE9PSBuZXdQcm9wZXJ0eS50YW5kZW0gKSB7XG4gICAgICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggbmV3UHJvcGVydHksIHsgdGFuZGVtTmFtZTogdGFuZGVtTmFtZSB9ICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAvL1xuICAvLyBQRE9NIEluc3RhbmNlIGhhbmRsaW5nXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIHBkb20gaW5zdGFuY2VzIGFycmF5LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXRQRE9NSW5zdGFuY2VzKCk6IFBET01JbnN0YW5jZVtdIHtcbiAgICByZXR1cm4gdGhpcy5fcGRvbUluc3RhbmNlcztcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcGRvbUluc3RhbmNlcygpOiBQRE9NSW5zdGFuY2VbXSB7IHJldHVybiB0aGlzLmdldFBET01JbnN0YW5jZXMoKTsgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgUERPTUluc3RhbmNlIHJlZmVyZW5jZSB0byBvdXIgYXJyYXkuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGFkZFBET01JbnN0YW5jZSggcGRvbUluc3RhbmNlOiBQRE9NSW5zdGFuY2UgKTogdm9pZCB7XG4gICAgdGhpcy5fcGRvbUluc3RhbmNlcy5wdXNoKCBwZG9tSW5zdGFuY2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgUERPTUluc3RhbmNlIHJlZmVyZW5jZSBmcm9tIG91ciBhcnJheS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlUERPTUluc3RhbmNlKCBwZG9tSW5zdGFuY2U6IFBET01JbnN0YW5jZSApOiB2b2lkIHtcbiAgICBjb25zdCBpbmRleCA9IF8uaW5kZXhPZiggdGhpcy5fcGRvbUluc3RhbmNlcywgcGRvbUluc3RhbmNlICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggIT09IC0xLCAnQ2Fubm90IHJlbW92ZSBhIFBET01JbnN0YW5jZSBmcm9tIGEgTm9kZSBpZiBpdCB3YXMgbm90IHRoZXJlJyApO1xuICAgIHRoaXMuX3Bkb21JbnN0YW5jZXMuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBCQVNJQ19BQ0NFU1NJQkxFX05BTUVfQkVIQVZJT1IoIG5vZGU6IE5vZGUsIG9wdGlvbnM6IFBhcmFsbGVsRE9NT3B0aW9ucywgYWNjZXNzaWJsZU5hbWU6IFBET01WYWx1ZVR5cGUgKTogUGFyYWxsZWxET01PcHRpb25zIHtcbiAgICBpZiAoIG5vZGUubGFiZWxUYWdOYW1lICYmIFBET01VdGlscy50YWdOYW1lU3VwcG9ydHNDb250ZW50KCBub2RlLmxhYmVsVGFnTmFtZSApICkge1xuICAgICAgb3B0aW9ucy5sYWJlbENvbnRlbnQgPSBhY2Nlc3NpYmxlTmFtZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIG5vZGUudGFnTmFtZSA9PT0gJ2lucHV0JyApIHtcbiAgICAgIG9wdGlvbnMubGFiZWxUYWdOYW1lID0gJ2xhYmVsJztcbiAgICAgIG9wdGlvbnMubGFiZWxDb250ZW50ID0gYWNjZXNzaWJsZU5hbWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBQRE9NVXRpbHMudGFnTmFtZVN1cHBvcnRzQ29udGVudCggbm9kZS50YWdOYW1lISApICkge1xuICAgICAgb3B0aW9ucy5pbm5lckNvbnRlbnQgPSBhY2Nlc3NpYmxlTmFtZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBvcHRpb25zLmFyaWFMYWJlbCA9IGFjY2Vzc2libGVOYW1lO1xuICAgIH1cbiAgICByZXR1cm4gb3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGJlaGF2aW9yIGZ1bmN0aW9uIGZvciBhY2Nlc3NpYmxlIG5hbWUgc28gdGhhdCB3aGVuIGFjY2Vzc2libGVOYW1lIGlzIHNldCBvbiB0aGUgcHJvdmlkZWQgTm9kZSwgaXQgd2lsbCBiZSBmb3J3YXJkZWRcbiAgICogdG8gb3RoZXJOb2RlLiBUaGlzIGlzIHVzZWZ1bCB3aGVuIGEgY29tcG9uZW50IGlzIGNvbXBvc2VkIG9mIG90aGVyIE5vZGVzIHRoYXQgaW1wbGVtZW50IHRoZSBhY2Nlc3NpYmlsaXR5LFxuICAgKiBidXQgdGhlIGhpZ2ggbGV2ZWwgQVBJIHNob3VsZCBiZSBhdmFpbGFibGUgZm9yIHRoZSBlbnRpcmUgY29tcG9uZW50LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmb3J3YXJkQWNjZXNzaWJsZU5hbWUoIG5vZGU6IFBhcmFsbGVsRE9NLCBvdGhlck5vZGU6IFBhcmFsbGVsRE9NICk6IHZvaWQge1xuICAgIFBhcmFsbGVsRE9NLnVzZURlZmF1bHRUYWdOYW1lKCBub2RlICk7XG4gICAgbm9kZS5hY2Nlc3NpYmxlTmFtZUJlaGF2aW9yID0gKCBub2RlOiBOb2RlLCBvcHRpb25zOiBQYXJhbGxlbERPTU9wdGlvbnMsIGFjY2Vzc2libGVOYW1lOiBQRE9NVmFsdWVUeXBlLCBjYWxsYmFja3NGb3JPdGhlck5vZGVzOiAoICgpID0+IHZvaWQgKVtdICkgPT4ge1xuICAgICAgY2FsbGJhY2tzRm9yT3RoZXJOb2Rlcy5wdXNoKCAoKSA9PiB7XG4gICAgICAgIG90aGVyTm9kZS5hY2Nlc3NpYmxlTmFtZSA9IGFjY2Vzc2libGVOYW1lO1xuICAgICAgfSApO1xuICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGJlaGF2aW9yIGZ1bmN0aW9uIGZvciBoZWxwIHRleHQgc28gdGhhdCB3aGVuIGhlbHBUZXh0IGlzIHNldCBvbiB0aGUgcHJvdmlkZWQgJ25vZGUnLCBpdCB3aWxsIGJlIGZvcndhcmRlZCBgb3RoZXJOb2RlYC5cbiAgICogVGhpcyBpcyB1c2VmdWwgd2hlbiBhIGNvbXBvbmVudCBpcyBjb21wb3NlZCBvZiBvdGhlciBOb2RlcyB0aGF0IGltcGxlbWVudCB0aGUgYWNjZXNzaWJpbGl0eSwgYnV0IHRoZSBoaWdoIGxldmVsIEFQSVxuICAgKiBzaG91bGQgYmUgYXZhaWxhYmxlIGZvciB0aGUgZW50aXJlIGNvbXBvbmVudC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZm9yd2FyZEhlbHBUZXh0KCBub2RlOiBQYXJhbGxlbERPTSwgb3RoZXJOb2RlOiBQYXJhbGxlbERPTSApOiB2b2lkIHtcbiAgICBQYXJhbGxlbERPTS51c2VEZWZhdWx0VGFnTmFtZSggbm9kZSApO1xuICAgIG5vZGUuaGVscFRleHRCZWhhdmlvciA9ICggbm9kZTogTm9kZSwgb3B0aW9uczogUGFyYWxsZWxET01PcHRpb25zLCBoZWxwVGV4dDogUERPTVZhbHVlVHlwZSwgY2FsbGJhY2tzRm9yT3RoZXJOb2RlczogKCAoKSA9PiB2b2lkIClbXSApID0+IHtcbiAgICAgIGNhbGxiYWNrc0Zvck90aGVyTm9kZXMucHVzaCggKCkgPT4ge1xuICAgICAgICBvdGhlck5vZGUuaGVscFRleHQgPSBoZWxwVGV4dDtcbiAgICAgIH0gKTtcbiAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIEhFTFBfVEVYVF9CRUZPUkVfQ09OVEVOVCggbm9kZTogTm9kZSwgb3B0aW9uczogUGFyYWxsZWxET01PcHRpb25zLCBoZWxwVGV4dDogUERPTVZhbHVlVHlwZSApOiBQYXJhbGxlbERPTU9wdGlvbnMge1xuICAgIG9wdGlvbnMuZGVzY3JpcHRpb25UYWdOYW1lID0gUERPTVV0aWxzLkRFRkFVTFRfREVTQ1JJUFRJT05fVEFHX05BTUU7XG4gICAgb3B0aW9ucy5kZXNjcmlwdGlvbkNvbnRlbnQgPSBoZWxwVGV4dDtcbiAgICBvcHRpb25zLmFwcGVuZERlc2NyaXB0aW9uID0gZmFsc2U7XG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIEhFTFBfVEVYVF9BRlRFUl9DT05URU5UKCBub2RlOiBOb2RlLCBvcHRpb25zOiBQYXJhbGxlbERPTU9wdGlvbnMsIGhlbHBUZXh0OiBQRE9NVmFsdWVUeXBlICk6IFBhcmFsbGVsRE9NT3B0aW9ucyB7XG4gICAgb3B0aW9ucy5kZXNjcmlwdGlvblRhZ05hbWUgPSBQRE9NVXRpbHMuREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRTtcbiAgICBvcHRpb25zLmRlc2NyaXB0aW9uQ29udGVudCA9IGhlbHBUZXh0O1xuICAgIG9wdGlvbnMuYXBwZW5kRGVzY3JpcHRpb24gPSB0cnVlO1xuICAgIHJldHVybiBvcHRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSBOb2RlIGRvZXMgbm90IGhhdmUgYSB0YWdOYW1lIHlldCwgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgdXNlRGVmYXVsdFRhZ05hbWUoIG5vZGU6IFBhcmFsbGVsRE9NICk6IHZvaWQge1xuICAgIGlmICggIW5vZGUudGFnTmFtZSApIHtcbiAgICAgIG5vZGUudGFnTmFtZSA9IERFRkFVTFRfVEFHX05BTUU7XG4gICAgfVxuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQYXJhbGxlbERPTScsIFBhcmFsbGVsRE9NICk7XG5leHBvcnQgeyBBQ0NFU1NJQklMSVRZX09QVElPTl9LRVlTIH07Il0sIm5hbWVzIjpbIlJlYWRPbmx5UHJvcGVydHkiLCJUaW55RW1pdHRlciIsIlRpbnlGb3J3YXJkaW5nUHJvcGVydHkiLCJpc1RSZWFkT25seVByb3BlcnR5IiwidmFsaWRhdGUiLCJWYWxpZGF0aW9uIiwiYXJyYXlEaWZmZXJlbmNlIiwiYXJyYXlSZW1vdmUiLCJvcHRpb25pemUiLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiTm9kZSIsIlBET01EaXNwbGF5c0luZm8iLCJQRE9NUGVlciIsIlBET01UcmVlIiwiUERPTVV0aWxzIiwic2NlbmVyeSIsIlRyYWlsIiwiSU5QVVRfVEFHIiwiVEFHUyIsIklOUFVUIiwiUF9UQUciLCJQIiwiRElWX1RBRyIsIkRJViIsIkRFRkFVTFRfVEFHX05BTUUiLCJERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FIiwiREVGQVVMVF9MQUJFTF9UQUdfTkFNRSIsIkRFRkFVTFRfUERPTV9IRUFESU5HX0JFSEFWSU9SIiwibm9kZSIsIm9wdGlvbnMiLCJoZWFkaW5nIiwibGFiZWxUYWdOYW1lIiwiaGVhZGluZ0xldmVsIiwibGFiZWxDb250ZW50IiwidW53cmFwUHJvcGVydHkiLCJ2YWx1ZU9yUHJvcGVydHkiLCJyZXN1bHQiLCJ2YWx1ZSIsImFzc2VydCIsIkZPUk1fRUxFTUVOVFMiLCJJTlBVVF9UWVBFU19USEFUX1NVUFBPUlRfQ0hFQ0tFRCIsIkFTU09DSUFUSU9OX0FUVFJJQlVURVMiLCJBQ0NFU1NJQklMSVRZX09QVElPTl9LRVlTIiwiUGFyYWxsZWxET00iLCJkaXNwb3NlUGFyYWxsZWxET00iLCJfYWNjZXNzaWJsZU5hbWUiLCJpc0Rpc3Bvc2VkIiwidW5saW5rIiwiX29uUERPTUNvbnRlbnRDaGFuZ2VMaXN0ZW5lciIsIl9oZWxwVGV4dCIsIl9wZG9tSGVhZGluZyIsIl9pbnB1dFZhbHVlIiwiX2FyaWFMYWJlbCIsIl9vbkFyaWFMYWJlbENoYW5nZUxpc3RlbmVyIiwiX2FyaWFWYWx1ZVRleHQiLCJfb25BcmlhVmFsdWVUZXh0Q2hhbmdlTGlzdGVuZXIiLCJfaW5uZXJDb250ZW50IiwiX29uSW5uZXJDb250ZW50Q2hhbmdlTGlzdGVuZXIiLCJfbGFiZWxDb250ZW50IiwiX29uTGFiZWxDb250ZW50Q2hhbmdlTGlzdGVuZXIiLCJfZGVzY3JpcHRpb25Db250ZW50IiwiX29uRGVzY3JpcHRpb25Db250ZW50Q2hhbmdlTGlzdGVuZXIiLCJpbnB1dEVuYWJsZWRQcm9wZXJ0eSIsInBkb21Cb3VuZElucHV0RW5hYmxlZExpc3RlbmVyIiwicGRvbU9yZGVyIiwiX3Bkb21QYXJlbnQiLCJfcGRvbU9yZGVyIiwidXBkYXRlZE9yZGVyIiwic2xpY2UiLCJzZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSIsIl9hY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwiQkFTSUNfQUNDRVNTSUJMRV9OQU1FX0JFSEFWSU9SIiwiX2hlbHBUZXh0QmVoYXZpb3IiLCJIRUxQX1RFWFRfQUZURVJfQ09OVEVOVCIsIl9wZG9tSGVhZGluZ0JlaGF2aW9yIiwic2V0QXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMiLCJzZXRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMiLCJzZXRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zIiwicmVtb3ZlUERPTUF0dHJpYnV0ZXMiLCJfcGRvbVZpc2libGVQcm9wZXJ0eSIsImRpc3Bvc2UiLCJwZG9tSW5wdXRFbmFibGVkTGlzdGVuZXIiLCJlbmFibGVkIiwic2V0UERPTUF0dHJpYnV0ZSIsImlzRm9jdXNlZCIsImkiLCJfcGRvbUluc3RhbmNlcyIsImxlbmd0aCIsInBlZXIiLCJmb2N1c2VkIiwiZm9jdXMiLCJmb2N1c2FibGUiLCJwZG9tVmlzaWJsZSIsImJsdXIiLCJwZG9tQXVkaXQiLCJoYXNQRE9NQ29udGVudCIsIl9pbnB1dFR5cGUiLCJfdGFnTmFtZSIsInRvVXBwZXJDYXNlIiwiX3Bkb21DaGVja2VkIiwiaW5jbHVkZXMiLCJfZm9jdXNIaWdobGlnaHRMYXllcmFibGUiLCJmb2N1c0hpZ2hsaWdodCIsImFyaWFSb2xlIiwiaW5uZXJDb250ZW50IiwiYWNjZXNzaWJsZU5hbWUiLCJjaGlsZHJlbiIsInNldEFjY2Vzc2libGVOYW1lIiwibGF6eUxpbmsiLCJvblBET01Db250ZW50Q2hhbmdlIiwiZ2V0QWNjZXNzaWJsZU5hbWUiLCJyZW1vdmVGcm9tUERPTSIsInRhZ05hbWUiLCJzZXRBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwiYWNjZXNzaWJsZU5hbWVCZWhhdmlvciIsImdldEFjY2Vzc2libGVOYW1lQmVoYXZpb3IiLCJzZXRQRE9NSGVhZGluZyIsInBkb21IZWFkaW5nIiwiZ2V0UERPTUhlYWRpbmciLCJzZXRQRE9NSGVhZGluZ0JlaGF2aW9yIiwicGRvbUhlYWRpbmdCZWhhdmlvciIsImdldFBET01IZWFkaW5nQmVoYXZpb3IiLCJnZXRIZWFkaW5nTGV2ZWwiLCJfaGVhZGluZ0xldmVsIiwiY29tcHV0ZUhlYWRpbmdMZXZlbCIsImxldmVsIiwic2V0SGVscFRleHQiLCJoZWxwVGV4dCIsImdldEhlbHBUZXh0Iiwic2V0SGVscFRleHRCZWhhdmlvciIsImhlbHBUZXh0QmVoYXZpb3IiLCJnZXRIZWxwVGV4dEJlaGF2aW9yIiwic2V0VGFnTmFtZSIsImdldFRhZ05hbWUiLCJzZXRMYWJlbFRhZ05hbWUiLCJfbGFiZWxUYWdOYW1lIiwiZ2V0TGFiZWxUYWdOYW1lIiwic2V0RGVzY3JpcHRpb25UYWdOYW1lIiwiX2Rlc2NyaXB0aW9uVGFnTmFtZSIsImRlc2NyaXB0aW9uVGFnTmFtZSIsImdldERlc2NyaXB0aW9uVGFnTmFtZSIsInNldElucHV0VHlwZSIsImlucHV0VHlwZSIsInJlbW92ZUF0dHJpYnV0ZUZyb21FbGVtZW50Iiwic2V0QXR0cmlidXRlVG9FbGVtZW50IiwiZ2V0SW5wdXRUeXBlIiwic2V0QXBwZW5kTGFiZWwiLCJhcHBlbmRMYWJlbCIsIl9hcHBlbmRMYWJlbCIsImdldEFwcGVuZExhYmVsIiwic2V0QXBwZW5kRGVzY3JpcHRpb24iLCJhcHBlbmREZXNjcmlwdGlvbiIsIl9hcHBlbmREZXNjcmlwdGlvbiIsImdldEFwcGVuZERlc2NyaXB0aW9uIiwic2V0Q29udGFpbmVyVGFnTmFtZSIsIl9jb250YWluZXJUYWdOYW1lIiwiY29udGFpbmVyVGFnTmFtZSIsImdldENvbnRhaW5lclRhZ05hbWUiLCJpbnZhbGlkYXRlUGVlckxhYmVsU2libGluZ0NvbnRlbnQiLCJzZXRMYWJlbFNpYmxpbmdDb250ZW50Iiwic2V0TGFiZWxDb250ZW50IiwibGFiZWwiLCJnZXRMYWJlbENvbnRlbnQiLCJvbklubmVyQ29udGVudFByb3BlcnR5Q2hhbmdlIiwic2V0UHJpbWFyeVNpYmxpbmdDb250ZW50Iiwic2V0SW5uZXJDb250ZW50IiwiY29udGVudCIsImdldElubmVyQ29udGVudCIsImludmFsaWRhdGVQZWVyRGVzY3JpcHRpb25TaWJsaW5nQ29udGVudCIsImRlc2NyaXB0aW9uQ29udGVudCIsInNldERlc2NyaXB0aW9uU2libGluZ0NvbnRlbnQiLCJzZXREZXNjcmlwdGlvbkNvbnRlbnQiLCJ0ZXh0Q29udGVudCIsImdldERlc2NyaXB0aW9uQ29udGVudCIsInNldEFyaWFSb2xlIiwiX2FyaWFSb2xlIiwicmVtb3ZlUERPTUF0dHJpYnV0ZSIsImdldEFyaWFSb2xlIiwic2V0Q29udGFpbmVyQXJpYVJvbGUiLCJfY29udGFpbmVyQXJpYVJvbGUiLCJlbGVtZW50TmFtZSIsIkNPTlRBSU5FUl9QQVJFTlQiLCJjb250YWluZXJBcmlhUm9sZSIsImdldENvbnRhaW5lckFyaWFSb2xlIiwib25BcmlhVmFsdWVUZXh0Q2hhbmdlIiwiYXJpYVZhbHVlVGV4dCIsIl9oYXNBcHBsaWVkQXJpYUxhYmVsIiwic2V0QXJpYVZhbHVlVGV4dCIsImdldEFyaWFWYWx1ZVRleHQiLCJzZXRQRE9NTmFtZXNwYWNlIiwicGRvbU5hbWVzcGFjZSIsIl9wZG9tTmFtZXNwYWNlIiwiZ2V0UERPTU5hbWVzcGFjZSIsIm9uQXJpYUxhYmVsQ2hhbmdlIiwiYXJpYUxhYmVsIiwic2V0QXJpYUxhYmVsIiwiZ2V0QXJpYUxhYmVsIiwic2V0Rm9jdXNIaWdobGlnaHQiLCJfZm9jdXNIaWdobGlnaHQiLCJ2aXNpYmxlIiwiZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlciIsImVtaXQiLCJnZXRGb2N1c0hpZ2hsaWdodCIsInNldEZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlIiwiZm9jdXNIaWdobGlnaHRMYXllcmFibGUiLCJnZXRGb2N1c0hpZ2hsaWdodExheWVyYWJsZSIsInNldEdyb3VwRm9jdXNIaWdobGlnaHQiLCJncm91cEhpZ2hsaWdodCIsIl9ncm91cEZvY3VzSGlnaGxpZ2h0IiwiZ3JvdXBGb2N1c0hpZ2hsaWdodCIsImdldEdyb3VwRm9jdXNIaWdobGlnaHQiLCJhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyIsImFzc29jaWF0aW9uT2JqZWN0IiwiQXJyYXkiLCJpc0FycmF5IiwiX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zIiwiYmVmb3JlT25seSIsImFmdGVyT25seSIsImluQm90aCIsInJlbW92ZUFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24iLCJhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uIiwiYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbiIsImdldEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zIiwicHVzaCIsIm90aGVyTm9kZSIsIl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlIiwidXBkYXRlQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnNJblBlZXJzIiwiXyIsInJlbW92ZWRPYmplY3QiLCJzcGxpY2UiLCJpbmRleE9mIiwicmVtb3ZlTm9kZVRoYXRJc0FyaWFMYWJlbGxlZEJ5VGhpc05vZGUiLCJpbmRleE9mTm9kZSIsInBkb21JbnN0YW5jZXMiLCJvbkFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25DaGFuZ2UiLCJ1cGRhdGVPdGhlck5vZGVzQXJpYUxhYmVsbGVkYnkiLCJnZXROb2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlIiwibm9kZXNUaGF0QXJlQXJpYUxhYmVsbGVkYnlUaGlzTm9kZSIsImFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucyIsImoiLCJfYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zIiwicmVtb3ZlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24iLCJhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiIsImFkZEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uIiwiZ2V0QXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zIiwiX25vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlIiwidXBkYXRlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zSW5QZWVycyIsImhhc0FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uIiwicmVtb3ZlTm9kZVRoYXRJc0FyaWFEZXNjcmliZWRCeVRoaXNOb2RlIiwib25BcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbkNoYW5nZSIsInVwZGF0ZU90aGVyTm9kZXNBcmlhRGVzY3JpYmVkYnkiLCJnZXROb2Rlc1RoYXRBcmVBcmlhRGVzY3JpYmVkYnlUaGlzTm9kZSIsIm5vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlIiwiYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucyIsIl9hY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zIiwicmVtb3ZlQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uIiwiYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uIiwiYWRkQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uIiwiZ2V0QWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucyIsIl9ub2Rlc1RoYXRBcmVBY3RpdmVEZXNjZW5kYW50VG9UaGlzTm9kZSIsInVwZGF0ZUFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnNJblBlZXJzIiwicmVtb3ZlTm9kZVRoYXRJc0FjdGl2ZURlc2NlbmRhbnRUaGlzTm9kZSIsIm9uQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uQ2hhbmdlIiwidXBkYXRlT3RoZXJOb2Rlc0FjdGl2ZURlc2NlbmRhbnQiLCJnZXROb2Rlc1RoYXRBcmVBY3RpdmVEZXNjZW5kYW50VG9UaGlzTm9kZSIsIm5vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlIiwic2V0UERPTU9yZGVyIiwiZm9yRWFjaCIsImluZGV4IiwiZ2V0VHJhaWxzIiwidW5pcSIsImNoYW5nZWQiLCJvbGRQRE9NT3JkZXIiLCJwZG9tT3JkZXJDaGFuZ2UiLCJyZW5kZXJlclN1bW1hcnlSZWZyZXNoRW1pdHRlciIsImdldFBET01PcmRlciIsImhhc1BET01PcmRlciIsImdldFBET01QYXJlbnQiLCJwZG9tUGFyZW50IiwiZ2V0RWZmZWN0aXZlQ2hpbGRyZW4iLCJub25PcmRlcmVkQ2hpbGRyZW4iLCJfY2hpbGRyZW4iLCJjaGlsZCIsImVmZmVjdGl2ZUNoaWxkcmVuIiwicGxhY2Vob2xkZXJJbmRleCIsInVuc2hpZnQiLCJwcm90b3R5cGUiLCJhcHBseSIsIm9uUGRvbVZpc2libGVQcm9wZXJ0eUNoYW5nZSIsIl9wZG9tRGlzcGxheXNJbmZvIiwib25QRE9NVmlzaWJpbGl0eUNoYW5nZSIsInNldFBkb21WaXNpYmxlUHJvcGVydHkiLCJuZXdUYXJnZXQiLCJzZXRUYXJnZXRQcm9wZXJ0eSIsInBkb21WaXNpYmxlUHJvcGVydHkiLCJwcm9wZXJ0eSIsImdldFBkb21WaXNpYmxlUHJvcGVydHkiLCJzZXRQRE9NVmlzaWJsZSIsImlzUERPTVZpc2libGUiLCJpc1BET01EaXNwbGF5ZWQiLCJpc0dsb2JhbGx5VmlzaWJsZSIsInBkb21EaXNwbGF5ZWQiLCJpbnZhbGlkYXRlUGVlcklucHV0VmFsdWUiLCJvbklucHV0VmFsdWVDaGFuZ2UiLCJzZXRJbnB1dFZhbHVlIiwiaW5wdXRWYWx1ZSIsImdldElucHV0VmFsdWUiLCJzZXRQRE9NQ2hlY2tlZCIsImNoZWNrZWQiLCJ0eXBlIiwicGRvbUNoZWNrZWQiLCJnZXRQRE9NQ2hlY2tlZCIsImdldFBET01BdHRyaWJ1dGVzIiwiX3Bkb21BdHRyaWJ1dGVzIiwicGRvbUF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGUiLCJwcm92aWRlZE9wdGlvbnMiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsIm5hbWVzcGFjZSIsIlBSSU1BUllfU0lCTElORyIsImN1cnJlbnRBdHRyaWJ1dGUiLCJsaXN0ZW5lciIsInJhd1ZhbHVlIiwiU1RSSU5HX1dJVEhPVVRfVEVNUExBVEVfVkFSU19WQUxJREFUT1IiLCJsaW5rIiwiYXR0cmlidXRlUmVtb3ZlZCIsIm9sZEF0dHJpYnV0ZSIsImF0dHJpYnV0ZXMiLCJoYXNQRE9NQXR0cmlidXRlIiwiYXR0cmlidXRlRm91bmQiLCJzZXRQRE9NQ2xhc3MiLCJjbGFzc05hbWUiLCJfcGRvbUNsYXNzZXMiLCJjdXJyZW50Q2xhc3MiLCJzZXRDbGFzc1RvRWxlbWVudCIsInJlbW92ZVBET01DbGFzcyIsImNsYXNzUmVtb3ZlZCIsInJlbW92ZUNsYXNzRnJvbUVsZW1lbnQiLCJnZXRQRE9NQ2xhc3NlcyIsInBkb21DbGFzc2VzIiwic2V0Rm9jdXNhYmxlIiwiX2ZvY3VzYWJsZU92ZXJyaWRlIiwiaXNGb2N1c2FibGUiLCJ0YWdJc0RlZmF1bHRGb2N1c2FibGUiLCJfcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUiLCJwZG9tVHJhbnNmb3JtU291cmNlTm9kZSIsImdldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlIiwic2V0Rm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eSIsImJvdW5kc1Byb3BlcnR5IiwiX2ZvY3VzUGFuVGFyZ2V0Qm91bmRzUHJvcGVydHkiLCJnZXRGb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5IiwiZm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eSIsInNldExpbWl0UGFuRGlyZWN0aW9uIiwibGltaXRQYW5EaXJlY3Rpb24iLCJfbGltaXRQYW5EaXJlY3Rpb24iLCJnZXRMaW1pdFBhbkRpcmVjdGlvbiIsInNldFBvc2l0aW9uSW5QRE9NIiwicG9zaXRpb25JblBET00iLCJfcG9zaXRpb25JblBET00iLCJnZXRQb3NpdGlvbkluUERPTSIsInNldEV4Y2x1ZGVMYWJlbFNpYmxpbmdGcm9tSW5wdXQiLCJleGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0IiwiaXNJbnNpZGVQaGV0aW9BcmNoZXR5cGUiLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsInBoZXRpb0lzQXJjaGV0eXBlIiwicGFyZW50cyIsImFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UiLCJ1dHRlcmFuY2UiLCJQSEVUX0lPX0VOQUJMRUQiLCJjb25uZWN0ZWREaXNwbGF5cyIsImdldENvbm5lY3RlZERpc3BsYXlzIiwiZGlzcGxheSIsImlzQWNjZXNzaWJsZSIsImRlc2NyaXB0aW9uVXR0ZXJhbmNlUXVldWUiLCJhZGRUb0JhY2siLCJmb3JFYWNoVXR0ZXJhbmNlUXVldWUiLCJjYWxsYmFjayIsImdldEJhc2VPcHRpb25zIiwiY3VycmVudE9wdGlvbnMiLCJvcHRpb25OYW1lIiwiZ2V0TmVzdGVkUERPTU9yZGVyIiwiY3VycmVudFRyYWlsIiwicHJ1bmVTdGFjayIsIm5lc3RlZENoaWxkU3RhY2siLCJhZGRUcmFpbHNGb3JOb2RlIiwib3ZlcnJpZGVQcnVuaW5nIiwicHJ1bmVDb3VudCIsImVhY2giLCJwcnVuZU5vZGUiLCJpdGVtIiwidHJhaWwiLCJjb3B5IiwiYXJyYXlQRE9NT3JkZXIiLCJjb25jYXQiLCJkZXNjZW5kYW50IiwiZ2V0TGVhZlRyYWlsc1RvIiwiZGVzY2VuZGFudFRyYWlsIiwicmVtb3ZlQW5jZXN0b3IiLCJhZGREZXNjZW5kYW50VHJhaWwiLCJyZW1vdmVEZXNjZW5kYW50VHJhaWwiLCJudW1DaGlsZHJlbiIsImFkZERlc2NlbmRhbnQiLCJyZW1vdmVEZXNjZW5kYW50IiwicG9wIiwicGRvbUNvbnRlbnRDaGFuZ2UiLCJvblBET01BZGRDaGlsZCIsInNjZW5lcnlMb2ciLCJpZCIsInJlY3VyIiwiX3JlbmRlcmVyU3VtbWFyeSIsImhhc05vUERPTSIsImF1ZGl0Tm9kZUZvclBET01DeWNsZXMiLCJvbkFkZENoaWxkIiwiYWRkQ2hpbGQiLCJvblBET01SZW1vdmVDaGlsZCIsIm9uUmVtb3ZlQ2hpbGQiLCJyZW1vdmVDaGlsZCIsIm9uUERPTVJlb3JkZXJlZENoaWxkcmVuIiwiY2hpbGRyZW5PcmRlckNoYW5nZSIsInVwZGF0ZUxpbmtlZEVsZW1lbnRGb3JQcm9wZXJ0eSIsInRhbmRlbU5hbWUiLCJvbGRQcm9wZXJ0eSIsIm5ld1Byb3BlcnR5IiwicmVtb3ZlTGlua2VkRWxlbWVudHMiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJhZGRMaW5rZWRFbGVtZW50IiwiZ2V0UERPTUluc3RhbmNlcyIsImFkZFBET01JbnN0YW5jZSIsInBkb21JbnN0YW5jZSIsInJlbW92ZVBET01JbnN0YW5jZSIsInRhZ05hbWVTdXBwb3J0c0NvbnRlbnQiLCJmb3J3YXJkQWNjZXNzaWJsZU5hbWUiLCJ1c2VEZWZhdWx0VGFnTmFtZSIsImNhbGxiYWNrc0Zvck90aGVyTm9kZXMiLCJmb3J3YXJkSGVscFRleHQiLCJIRUxQX1RFWFRfQkVGT1JFX0NPTlRFTlQiLCJfaGFzQXBwbGllZEFyaWFWYWx1ZVRleHQiLCJwZG9tUGFyZW50Q2hhbmdlZEVtaXR0ZXIiLCJwZG9tRGlzcGxheXNFbWl0dGVyIiwiYmluZCIsIl9vbklucHV0VmFsdWVDaGFuZ2VMaXN0ZW5lciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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