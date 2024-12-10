// Copyright 2017-2024, University of Colorado Boulder
/**
 * ParallelDOM tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Display from '../../display/Display.js';
import Circle from '../../nodes/Circle.js';
import Node from '../../nodes/Node.js';
import Rectangle from '../../nodes/Rectangle.js';
import PDOMFuzzer from './PDOMFuzzer.js';
import PDOMPeer from './PDOMPeer.js';
import PDOMUtils from './PDOMUtils.js';
// constants
const TEST_INNER_CONTENT = 'Test Inner Content Here please^&*. Thanks you so very mucho.';
const TEST_LABEL = 'Test label';
const TEST_LABEL_2 = 'Test label 2';
const TEST_DESCRIPTION = 'Test description';
const TEST_LABEL_HTML = '<strong>I ROCK as a LABEL</strong>';
const TEST_LABEL_HTML_2 = '<strong>I ROCK as a LABEL 2</strong>';
const TEST_DESCRIPTION_HTML = '<strong>I ROCK as a DESCRIPTION</strong>';
const TEST_DESCRIPTION_HTML_2 = '<strong>I ROCK as a DESCRIPTION 2</strong>';
const TEST_CLASS_ONE = 'test-class-one';
const TEST_CLASS_TWO = 'test-class-two';
// These should manually match the defaults in the ParallelDOM.js trait
const DEFAULT_LABEL_TAG_NAME = PDOMUtils.DEFAULT_LABEL_TAG_NAME;
const DEFAULT_DESCRIPTION_TAG_NAME = PDOMUtils.DEFAULT_DESCRIPTION_TAG_NAME;
// given the parent container element for a node, this value is the index of the label sibling in the
// parent's array of children HTMLElements.
const DEFAULT_LABEL_SIBLING_INDEX = 0;
const DEFAULT_DESCRIPTION_SIBLING_INDEX = 1;
const APPENDED_DESCRIPTION_SIBLING_INDEX = 2;
// a focus highlight for testing, since dummy nodes tend to have no bounds
const TEST_HIGHLIGHT = new Circle(5);
// a custom focus highlight (since dummy node's have no bounds)
const focusHighlight = new Rectangle(0, 0, 10, 10);
let canRunTests = true;
QUnit.module('ParallelDOM', {
    beforeEach: ()=>{
        // A test can only be run when the document has focus because tests require focus/blur events. Browsers
        // do not emit these events when the window is not active (especially true for pupetteer
        canRunTests = document.hasFocus();
        if (!canRunTests) {
            console.warn('Unable to run focus tests because the document does not have focus');
        }
    }
});
/**
 * Get a unique PDOMPeer from a node with accessible content. Will error if the node has multiple instances
 * or if the node hasn't been attached to a display (and therefore has no accessible content).
 */ function getPDOMPeerByNode(node) {
    if (node.pdomInstances.length === 0) {
        throw new Error('No pdomInstances. Was your node added to the scene graph?');
    } else if (node.pdomInstances.length > 1) {
        throw new Error('There should one and only one accessible instance for the node');
    } else if (!node.pdomInstances[0].peer) {
        throw new Error('pdomInstance\'s peer should exist.');
    }
    return node.pdomInstances[0].peer;
}
/**
 * Get the id of a dom element representing a node in the DOM.  The accessible content must exist and be unique,
 * there should only be one accessible instance and one dom element for the node.
 *
 * NOTE: Be careful about getting references to dom Elements, the reference will be stale each time
 * the view (PDOMPeer) is redrawn, which is quite often when setting options.
 */ function getPrimarySiblingElementByNode(node) {
    const uniquePeer = getPDOMPeerByNode(node);
    return document.getElementById(uniquePeer.primarySibling.id);
}
/**
 * Audit the root node for accessible content within a test, to make sure that content is accessible as we expect,
 * and so that our pdomAudit function may catch things that have gone wrong.
 * @param rootNode - the root Node attached to the Display being tested
 */ function pdomAuditRootNode(rootNode) {
    rootNode.pdomAudit();
}
QUnit.test('tagName/innerContent options', (assert)=>{
    // test the behavior of swapVisibility function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // create some nodes for testing
    const a = new Node({
        tagName: 'button',
        innerContent: TEST_LABEL
    });
    rootNode.addChild(a);
    const aElement = getPrimarySiblingElementByNode(a);
    assert.ok(a.pdomInstances.length === 1, 'only 1 instance');
    assert.ok(aElement.parentElement.childNodes.length === 1, 'parent contains one primary siblings');
    assert.ok(aElement.tagName === 'BUTTON', 'default label tagName');
    assert.ok(aElement.textContent === TEST_LABEL, 'no html should use textContent');
    a.innerContent = TEST_LABEL_HTML;
    assert.ok(aElement.innerHTML === TEST_LABEL_HTML, 'html label should use innerHTML');
    a.innerContent = TEST_LABEL_HTML_2;
    assert.ok(aElement.innerHTML === TEST_LABEL_HTML_2, 'html label should use innerHTML, overwrite from html');
    a.innerContent = null;
    assert.ok(aElement.innerHTML === '', 'innerHTML should be empty after clearing innerContent');
    a.tagName = null;
    assert.ok(a.pdomInstances.length === 0, 'set to null should clear accessible instances');
    // make sure that no errors when setting innerContent with tagName null.
    a.innerContent = 'hello';
    a.tagName = 'button';
    a.innerContent = TEST_LABEL_HTML_2;
    assert.ok(getPrimarySiblingElementByNode(a).innerHTML === TEST_LABEL_HTML_2, 'innerContent not cleared when tagName set to null.');
    // verify that setting inner content on an input is not allowed
    const b = new Node({
        tagName: 'input',
        inputType: 'range'
    });
    rootNode.addChild(b);
    window.assert && assert.throws(()=>{
        b.innerContent = 'this should fail';
    }, /.*/, 'cannot set inner content on input');
    // now that it is a div, innerContent is allowed
    b.tagName = 'div';
    assert.ok(b.tagName === 'div', 'expect tagName setter to work.');
    b.innerContent = TEST_LABEL;
    assert.ok(b.innerContent === TEST_LABEL, 'inner content allowed');
    // revert tag name to input, should throw an error
    window.assert && assert.throws(()=>{
        b.tagName = 'input';
    }, /.*/, 'error thrown after setting tagName to input on Node with innerContent.');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('containerTagName option', (assert)=>{
    // test the behavior of swapVisibility function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // create some nodes for testing
    const a = new Node({
        tagName: 'button'
    });
    rootNode.addChild(a);
    assert.ok(a.pdomInstances.length === 1, 'only 1 instance');
    assert.ok(a.pdomInstances[0].peer.containerParent === null, 'no container parent for just button');
    assert.ok(rootNode['_pdomInstances'][0].peer.primarySibling.children[0] === a['_pdomInstances'][0].peer.primarySibling, 'rootNode peer should hold node a\'s peer in the PDOM');
    a.containerTagName = 'div';
    assert.ok(a.pdomInstances[0].peer.containerParent.id.includes('container'), 'container parent is div if specified');
    assert.ok(rootNode['_pdomInstances'][0].peer.primarySibling.children[0] === a['_pdomInstances'][0].peer.containerParent, 'container parent is div if specified');
    a.containerTagName = null;
    assert.ok(!a.pdomInstances[0].peer.containerParent, 'container parent is cleared if specified');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('labelTagName/labelContent option', (assert)=>{
    // test the behavior of swapVisibility function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // create some nodes for testing
    const a = new Node({
        tagName: 'button',
        labelContent: TEST_LABEL
    });
    rootNode.addChild(a);
    const aElement = getPrimarySiblingElementByNode(a);
    const labelSibling = aElement.parentElement.childNodes[0];
    assert.ok(a.pdomInstances.length === 1, 'only 1 instance');
    assert.ok(aElement.parentElement.childNodes.length === 2, 'parent contains two siblings');
    assert.ok(labelSibling.tagName === DEFAULT_LABEL_TAG_NAME, 'default label tagName');
    assert.ok(labelSibling.textContent === TEST_LABEL, 'no html should use textContent');
    a.labelContent = TEST_LABEL_HTML;
    assert.ok(labelSibling.innerHTML === TEST_LABEL_HTML, 'html label should use innerHTML');
    a.labelContent = null;
    assert.ok(labelSibling.innerHTML === '', 'label content should be empty after setting to null');
    a.labelContent = TEST_LABEL_HTML_2;
    assert.ok(labelSibling.innerHTML === TEST_LABEL_HTML_2, 'html label should use innerHTML, overwrite from html');
    a.tagName = 'div';
    const newAElement = getPrimarySiblingElementByNode(a);
    const newLabelSibling = newAElement.parentElement.childNodes[0];
    assert.ok(newLabelSibling.innerHTML === TEST_LABEL_HTML_2, 'tagName independent of: html label should use innerHTML, overwrite from html');
    a.labelTagName = null;
    // make sure label was cleared from PDOM
    assert.ok(getPrimarySiblingElementByNode(a).parentElement.childNodes.length === 1, 'Only one element after clearing label');
    assert.ok(a.labelContent === TEST_LABEL_HTML_2, 'clearing labelTagName should not change content, even  though it is not displayed');
    a.labelTagName = 'p';
    assert.ok(a.labelTagName === 'p', 'expect labelTagName setter to work.');
    const b = new Node({
        tagName: 'p',
        labelContent: 'I am groot'
    });
    rootNode.addChild(b);
    let bLabelElement = document.getElementById(b.pdomInstances[0].peer.labelSibling.id);
    assert.ok(!bLabelElement.getAttribute('for'), 'for attribute should not be on non label label sibling.');
    b.labelTagName = 'label';
    bLabelElement = document.getElementById(b.pdomInstances[0].peer.labelSibling.id);
    assert.ok(bLabelElement.getAttribute('for') !== null, 'for attribute should be on "label" tag for label sibling.');
    const c = new Node({
        tagName: 'p'
    });
    rootNode.addChild(c);
    c.labelTagName = 'label';
    c.labelContent = TEST_LABEL;
    const cLabelElement = document.getElementById(c.pdomInstances[0].peer.labelSibling.id);
    assert.ok(cLabelElement.getAttribute('for') !== null, 'order should not matter');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('container element not needed for multiple siblings', (assert)=>{
    // test the behavior of swapVisibility function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // test containerTag is not needed
    const b = new Node({
        tagName: 'div',
        labelContent: 'hello'
    });
    const c = new Node({
        tagName: 'section',
        labelContent: 'hi'
    });
    const d = new Node({
        tagName: 'p',
        innerContent: 'PPPP',
        containerTagName: 'div'
    });
    rootNode.addChild(b);
    b.addChild(c);
    b.addChild(d);
    let bElement = getPrimarySiblingElementByNode(b);
    let cPeer = c.pdomInstances[0].peer;
    let dPeer = d.pdomInstances[0].peer;
    assert.ok(bElement.children.length === 3, 'c.p, c.section, d.div should all be on the same level');
    const confirmOriginalOrder = ()=>{
        assert.ok(bElement.children[0].tagName === 'P', 'p first');
        assert.ok(bElement.children[1].tagName === 'SECTION', 'section 2nd');
        assert.ok(bElement.children[2].tagName === 'DIV', 'div 3rd');
        assert.ok(bElement.children[0] === cPeer.labelSibling, 'c label first');
        assert.ok(bElement.children[1] === cPeer.primarySibling, 'c primary 2nd');
        assert.ok(bElement.children[2] === dPeer.containerParent, 'd container 3rd');
    };
    confirmOriginalOrder();
    // add a few more
    const e = new Node({
        tagName: 'span',
        descriptionContent: '<br>sweet and cool things</br>'
    });
    b.addChild(e);
    bElement = getPrimarySiblingElementByNode(b); // refresh the DOM Elements
    cPeer = c.pdomInstances[0].peer; // refresh the DOM Elements
    dPeer = d.pdomInstances[0].peer; // refresh the DOM Elements
    let ePeer = e.pdomInstances[0].peer;
    assert.ok(bElement.children.length === 5, 'e children should be added to the same PDOM level.');
    confirmOriginalOrder();
    const confirmOriginalWithE = ()=>{
        assert.ok(bElement.children[3].tagName === 'P', 'P 4rd');
        assert.ok(bElement.children[4].tagName === 'SPAN', 'SPAN 3rd');
        assert.ok(bElement.children[3] === ePeer.descriptionSibling, 'e description 4th');
        assert.ok(bElement.children[4] === ePeer.primarySibling, 'e primary 5th');
    };
    // dynamically adding parent
    e.containerTagName = 'article';
    bElement = getPrimarySiblingElementByNode(b); // refresh the DOM Elements
    cPeer = c.pdomInstances[0].peer; // refresh the DOM Elements
    dPeer = d.pdomInstances[0].peer; // refresh the DOM Elements
    ePeer = e.pdomInstances[0].peer;
    assert.ok(bElement.children.length === 4, 'e children should now be under e\'s container.');
    confirmOriginalOrder();
    assert.ok(bElement.children[3].tagName === 'ARTICLE', 'SPAN 3rd');
    assert.ok(bElement.children[3] === ePeer.containerParent, 'e parent 3rd');
    // clear container
    e.containerTagName = null;
    bElement = getPrimarySiblingElementByNode(b); // refresh the DOM Elements
    cPeer = c.pdomInstances[0].peer; // refresh the DOM Elements
    dPeer = d.pdomInstances[0].peer; // refresh the DOM Elements
    ePeer = e.pdomInstances[0].peer;
    assert.ok(bElement.children.length === 5, 'e children should be added to the same PDOM level again.');
    confirmOriginalOrder();
    confirmOriginalWithE();
    // proper disposal
    e.dispose();
    bElement = getPrimarySiblingElementByNode(b);
    assert.ok(bElement.children.length === 3, 'e children should have been removed');
    assert.ok(e.pdomInstances.length === 0, 'e is disposed');
    confirmOriginalOrder();
    // reorder d correctly when c removed
    b.removeChild(c);
    assert.ok(bElement.children.length === 1, 'c children should have been removed, only d container');
    bElement = getPrimarySiblingElementByNode(b);
    dPeer = d.pdomInstances[0].peer;
    assert.ok(bElement.children[0].tagName === 'DIV', 'DIV first');
    assert.ok(bElement.children[0] === dPeer.containerParent, 'd container first');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('pdomOrder tests', (assert)=>{
    // test the behavior of swapVisibility function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    const firstChild = new Node({
        tagName: 'div'
    });
    const a = new Node({
        tagName: 'button'
    });
    const b = new Node({
        tagName: 'button'
    });
    const c = new Node({
        tagName: 'button'
    });
    const d = new Node({
        tagName: 'button'
    });
    const arraysEqual = (a, b)=>{
        return a.length === b.length && a.every((value, index)=>value === b[index]);
    };
    rootNode.addChild(firstChild);
    firstChild.children = [
        a,
        b,
        c,
        d
    ];
    //------------------------------------------------------------------
    // Basic setter/getter tests
    //------------------------------------------------------------------
    // pdomOrder is initially null
    assert.ok(a.pdomOrder === null, 'pdomOrder is initially null');
    const firstOrder = [
        c,
        a,
        d,
        b
    ];
    // set the pdomOrder
    firstChild.pdomOrder = firstOrder;
    assert.ok(arraysEqual(firstChild.pdomOrder, firstOrder), 'pdomOrder is set correctly');
    // New order should be applied
    const secondOrder = [
        a,
        b,
        c,
        d
    ];
    firstChild.pdomOrder = secondOrder;
    assert.ok(arraysEqual(firstChild.pdomOrder, secondOrder), 'pdomOrder is set correctly');
    // Try providing the same instance of an array to pdomOrder
    const thirdOrder = firstChild.pdomOrder;
    const e = new Node({
        tagName: 'button'
    });
    thirdOrder.splice(1, 0, e);
    firstChild.pdomOrder = thirdOrder;
    assert.ok(arraysEqual(firstChild.pdomOrder, thirdOrder), 'pdomOrder is set correctly');
    // Try removing an element from the pdomOrder
    const fourthOrder = firstChild.pdomOrder.splice(1, 1);
    firstChild.pdomOrder = fourthOrder;
    assert.ok(arraysEqual(firstChild.pdomOrder, fourthOrder), 'pdomOrder is set correctly');
    // Clear the pdomOrder
    firstChild.pdomOrder = null;
    assert.ok(firstChild.pdomOrder === null, 'pdomOrder is cleared');
    //------------------------------------------------------------------
    // disposing a Node should remove it from any pdomOrder
    //------------------------------------------------------------------
    // These Nodes are named based on their place in pdomOrder - all will be children of firstChild
    const parent = new Node({
        tagName: 'div',
        labelContent: 'parent'
    });
    const child1 = new Node({
        tagName: 'div',
        labelContent: 'child1'
    });
    const child2 = new Node({
        tagName: 'div',
        labelContent: 'child2'
    });
    const grandchild1 = new Node({
        tagName: 'div',
        labelContent: 'grandchild1'
    });
    const grandchild2 = new Node({
        tagName: 'div',
        labelContent: 'grandchild2'
    });
    firstChild.children = [
        parent,
        child1,
        child2,
        grandchild1,
        grandchild2
    ];
    // Setup nested pdomOrders
    parent.pdomOrder = [
        child1,
        child2
    ];
    child1.pdomOrder = [
        grandchild1
    ];
    child2.pdomOrder = [
        grandchild2
    ];
    // Verify initial pdomOrder setup
    assert.ok(arraysEqual(parent.pdomOrder, [
        child1,
        child2
    ]), 'parent pdomOrder is set correctly');
    assert.ok(arraysEqual(child1.pdomOrder, [
        grandchild1
    ]), 'child1 pdomOrder is set correctly');
    assert.ok(arraysEqual(child2.pdomOrder, [
        grandchild2
    ]), 'child2 pdomOrder is set correctly');
    // Dispose a grandchild and verify changes propagate correctly
    grandchild1.dispose();
    assert.ok(arraysEqual(child1.pdomOrder, []), 'child1 pdomOrder is updated when grandchild1 is disposed');
    assert.ok(arraysEqual(parent.pdomOrder, [
        child1,
        child2
    ]), 'parent pdomOrder remains unchanged when grandchild1 is disposed');
    // Dispose a child and verify changes propagate to parent
    child2.dispose();
    assert.ok(arraysEqual(parent.pdomOrder, [
        child1
    ]), 'parent pdomOrder is updated when child2 is disposed');
    const parentPeer = getPDOMPeerByNode(parent);
    assert.ok(parentPeer.primarySibling.children.length === 2, 'child2 was disposed, so only child1 label/primary are left');
    // Dispose the remaining child to check the parent pdomOrder
    child1.dispose();
    assert.ok(arraysEqual(parent.pdomOrder, []), 'parent pdomOrder is empty when both children are disposed');
    //------------------------------------------------------------------
    // Done with this tests, clean up
    //------------------------------------------------------------------
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('descriptionTagName/descriptionContent option', (assert)=>{
    // test the behavior of swapVisibility function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // create some nodes for testing
    const a = new Node({
        tagName: 'button',
        descriptionContent: TEST_DESCRIPTION
    });
    rootNode.addChild(a);
    const aElement = getPrimarySiblingElementByNode(a);
    const descriptionSibling = aElement.parentElement.childNodes[0];
    assert.ok(a.pdomInstances.length === 1, 'only 1 instance');
    assert.ok(aElement.parentElement.childNodes.length === 2, 'parent contains two siblings');
    assert.ok(descriptionSibling.tagName === DEFAULT_DESCRIPTION_TAG_NAME, 'default label tagName');
    assert.ok(descriptionSibling.textContent === TEST_DESCRIPTION, 'no html should use textContent');
    a.descriptionContent = TEST_DESCRIPTION_HTML;
    assert.ok(descriptionSibling.innerHTML === TEST_DESCRIPTION_HTML, 'html label should use innerHTML');
    a.descriptionContent = null;
    assert.ok(descriptionSibling.innerHTML === '', 'description content should be cleared');
    a.descriptionContent = TEST_DESCRIPTION_HTML_2;
    assert.ok(descriptionSibling.innerHTML === TEST_DESCRIPTION_HTML_2, 'html label should use innerHTML, overwrite from html');
    a.descriptionTagName = null;
    // make sure description was cleared from PDOM
    assert.ok(getPrimarySiblingElementByNode(a).parentElement.childNodes.length === 1, 'Only one element after clearing description');
    assert.ok(a.descriptionContent === TEST_DESCRIPTION_HTML_2, 'clearing descriptionTagName should not change content, even  though it is not displayed');
    assert.ok(a.descriptionTagName === null, 'expect descriptionTagName setter to work.');
    a.descriptionTagName = 'p';
    assert.ok(a.descriptionTagName === 'p', 'expect descriptionTagName setter to work.');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('ParallelDOM options', (assert)=>{
    const rootNode = new Node();
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // test setting of accessible content through options
    const buttonNode = new Node({
        focusHighlight: new Circle(5),
        containerTagName: 'div',
        tagName: 'input',
        inputType: 'button',
        labelTagName: 'label',
        labelContent: TEST_LABEL,
        descriptionContent: TEST_DESCRIPTION,
        focusable: false,
        ariaRole: 'button' // uses the ARIA button role
    });
    rootNode.addChild(buttonNode);
    const divNode = new Node({
        tagName: 'div',
        ariaLabel: TEST_LABEL,
        pdomVisible: false,
        descriptionContent: TEST_DESCRIPTION,
        containerTagName: 'div'
    });
    rootNode.addChild(divNode);
    // verify that setters and getters worked correctly
    assert.ok(buttonNode.labelTagName === 'label', 'Label tag name');
    assert.ok(buttonNode.containerTagName === 'div', 'container tag name');
    assert.ok(buttonNode.labelContent === TEST_LABEL, 'Accessible label');
    assert.ok(buttonNode.descriptionTagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'Description tag name');
    assert.equal(buttonNode.focusable, false, 'Focusable');
    assert.ok(buttonNode.ariaRole === 'button', 'Aria role');
    assert.ok(buttonNode.descriptionContent === TEST_DESCRIPTION, 'Accessible Description');
    assert.ok(buttonNode.focusHighlight instanceof Circle, 'Focus highlight');
    assert.ok(buttonNode.tagName === 'input', 'Tag name');
    assert.ok(buttonNode.inputType === 'button', 'Input type');
    assert.ok(divNode.tagName === 'div', 'Tag name');
    assert.ok(divNode.ariaLabel === TEST_LABEL, 'Use aria label');
    assert.equal(divNode.pdomVisible, false, 'pdom visible');
    assert.ok(divNode.labelTagName === null, 'Label tag name with aria label is independent');
    assert.ok(divNode.descriptionTagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'Description tag name');
    // verify DOM structure - options above should create something like:
    // <div id="display-root">
    //  <div id="parent-container-id">
    //    <label for="id">Test Label</label>
    //    <p>Description>Test Description</p>
    //    <input type='button' role='button' tabindex="-1" id=id>
    //  </div>
    //
    //  <div aria-label="Test Label" hidden aria-labelledBy="button-node-id" aria-describedby='button-node-id'>
    //    <p>Test Description</p>
    //  </div>
    // </div>
    pdomAuditRootNode(rootNode);
    let buttonElement = getPrimarySiblingElementByNode(buttonNode);
    const buttonParent = buttonElement.parentNode;
    const buttonPeers = buttonParent.childNodes;
    const buttonLabel = buttonPeers[0];
    const buttonDescription = buttonPeers[1];
    const divElement = getPrimarySiblingElementByNode(divNode);
    const pDescription = divElement.parentElement.childNodes[0]; // description before primary div
    assert.ok(buttonParent.tagName === 'DIV', 'parent container');
    assert.ok(buttonLabel.tagName === 'LABEL', 'Label first');
    assert.ok(buttonLabel.getAttribute('for') === buttonElement.id, 'label for attribute');
    assert.ok(buttonLabel.textContent === TEST_LABEL, 'label content');
    assert.ok(buttonDescription.tagName === DEFAULT_DESCRIPTION_TAG_NAME, 'description second');
    assert.equal(buttonDescription.textContent, TEST_DESCRIPTION, 'description content');
    assert.ok(buttonPeers[2] === buttonElement, 'Button third');
    assert.ok(buttonElement.getAttribute('type') === 'button', 'input type set');
    assert.ok(buttonElement.getAttribute('role') === 'button', 'button role set');
    assert.ok(buttonElement.tabIndex === -1, 'not focusable');
    assert.ok(divElement.getAttribute('aria-label') === TEST_LABEL, 'aria label set');
    assert.ok(divElement.parentElement.hidden, 'hidden set should act on parent');
    assert.ok(pDescription.textContent === TEST_DESCRIPTION, 'description content');
    assert.ok(pDescription.parentElement === divElement.parentElement, 'description is sibling to primary');
    assert.ok(divElement.parentElement.childNodes.length === 2, 'no label element for aria-label, just description and primary siblings');
    // clear values
    buttonNode.inputType = null;
    buttonElement = getPrimarySiblingElementByNode(buttonNode);
    assert.ok(buttonElement.getAttribute('type') === null, 'input type cleared');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
// tests for aria-labelledby and aria-describedby should be the same, since both support the same feature set
function testAssociationAttribute(assert, attribute) {
    // use a different setter depending on if testing labelledby or describedby
    const addAssociationFunction = attribute === 'aria-labelledby' ? 'addAriaLabelledbyAssociation' : attribute === 'aria-describedby' ? 'addAriaDescribedbyAssociation' : attribute === 'aria-activedescendant' ? 'addActiveDescendantAssociation' : null;
    if (!addAssociationFunction) {
        throw new Error('incorrect attribute name while in testAssociationAttribute');
    }
    const rootNode = new Node();
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // two new nodes that will be related with the aria-labelledby and aria-describedby associations
    const a = new Node({
        tagName: 'button',
        labelTagName: 'p',
        descriptionTagName: 'p'
    });
    const b = new Node({
        tagName: 'p',
        innerContent: TEST_LABEL_2
    });
    rootNode.children = [
        a,
        b
    ];
    window.assert && assert.throws(()=>{
        a.setPDOMAttribute(attribute, 'hello');
    }, /.*/, 'cannot set association attributes with setPDOMAttribute');
    a[addAssociationFunction]({
        otherNode: b,
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherElementName: PDOMPeer.PRIMARY_SIBLING
    });
    let aElement = getPrimarySiblingElementByNode(a);
    let bElement = getPrimarySiblingElementByNode(b);
    assert.ok(aElement.getAttribute(attribute).includes(bElement.id), `${attribute} for one node.`);
    const c = new Node({
        tagName: 'div',
        innerContent: TEST_LABEL
    });
    rootNode.addChild(c);
    a[addAssociationFunction]({
        otherNode: c,
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherElementName: PDOMPeer.PRIMARY_SIBLING
    });
    aElement = getPrimarySiblingElementByNode(a);
    bElement = getPrimarySiblingElementByNode(b);
    let cElement = getPrimarySiblingElementByNode(c);
    const expectedValue = [
        bElement.id,
        cElement.id
    ].join(' ');
    assert.ok(aElement.getAttribute(attribute) === expectedValue, `${attribute} two nodes`);
    // Make c invalidate
    rootNode.removeChild(c);
    rootNode.addChild(new Node({
        children: [
            c
        ]
    }));
    const oldValue = expectedValue;
    aElement = getPrimarySiblingElementByNode(a);
    cElement = getPrimarySiblingElementByNode(c);
    assert.ok(aElement.getAttribute(attribute) !== oldValue, 'should have invalidated on tree change');
    assert.ok(aElement.getAttribute(attribute) === [
        bElement.id,
        cElement.id
    ].join(' '), 'should have invalidated on tree change');
    const d = new Node({
        tagName: 'div',
        descriptionTagName: 'p',
        innerContent: TEST_LABEL,
        containerTagName: 'div'
    });
    rootNode.addChild(d);
    b[addAssociationFunction]({
        otherNode: d,
        thisElementName: PDOMPeer.CONTAINER_PARENT,
        otherElementName: PDOMPeer.DESCRIPTION_SIBLING
    });
    b.containerTagName = 'div';
    const bParentContainer = getPrimarySiblingElementByNode(b).parentElement;
    const dDescriptionElement = getPrimarySiblingElementByNode(d).parentElement.childNodes[0];
    assert.ok(bParentContainer.getAttribute(attribute) !== oldValue, 'should have invalidated on tree change');
    assert.ok(bParentContainer.getAttribute(attribute) === dDescriptionElement.id, `b parent container element is ${attribute} d description sibling`);
    // say we have a scene graph that looks like:
    //    e
    //     \
    //      f
    //       \
    //        g
    //         \
    //          h
    // we want to make sure
    const e = new Node({
        tagName: 'div'
    });
    const f = new Node({
        tagName: 'div'
    });
    const g = new Node({
        tagName: 'div'
    });
    const h = new Node({
        tagName: 'div'
    });
    e.addChild(f);
    f.addChild(g);
    g.addChild(h);
    rootNode.addChild(e);
    e[addAssociationFunction]({
        otherNode: f,
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherElementName: PDOMPeer.PRIMARY_SIBLING
    });
    f[addAssociationFunction]({
        otherNode: g,
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherElementName: PDOMPeer.PRIMARY_SIBLING
    });
    g[addAssociationFunction]({
        otherNode: h,
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherElementName: PDOMPeer.PRIMARY_SIBLING
    });
    let eElement = getPrimarySiblingElementByNode(e);
    let fElement = getPrimarySiblingElementByNode(f);
    let gElement = getPrimarySiblingElementByNode(g);
    let hElement = getPrimarySiblingElementByNode(h);
    assert.ok(eElement.getAttribute(attribute) === fElement.id, `eElement should be ${attribute} fElement`);
    assert.ok(fElement.getAttribute(attribute) === gElement.id, `fElement should be ${attribute} gElement`);
    assert.ok(gElement.getAttribute(attribute) === hElement.id, `gElement should be ${attribute} hElement`);
    // re-arrange the scene graph and make sure that the attribute ids remain up to date
    //    e
    //     \
    //      h
    //       \
    //        g
    //         \
    //          f
    e.removeChild(f);
    f.removeChild(g);
    g.removeChild(h);
    e.addChild(h);
    h.addChild(g);
    g.addChild(f);
    eElement = getPrimarySiblingElementByNode(e);
    fElement = getPrimarySiblingElementByNode(f);
    gElement = getPrimarySiblingElementByNode(g);
    hElement = getPrimarySiblingElementByNode(h);
    assert.ok(eElement.getAttribute(attribute) === fElement.id, `eElement should still be ${attribute} fElement`);
    assert.ok(fElement.getAttribute(attribute) === gElement.id, `fElement should still be ${attribute} gElement`);
    assert.ok(gElement.getAttribute(attribute) === hElement.id, `gElement should still be ${attribute} hElement`);
    // test aria labelled by your self, but a different peer Element, multiple attribute ids included in the test.
    const containerTagName = 'div';
    const j = new Node({
        tagName: 'button',
        labelTagName: 'label',
        descriptionTagName: 'p',
        containerTagName: containerTagName
    });
    rootNode.children = [
        j
    ];
    j[addAssociationFunction]({
        otherNode: j,
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherElementName: PDOMPeer.LABEL_SIBLING
    });
    j[addAssociationFunction]({
        otherNode: j,
        thisElementName: PDOMPeer.CONTAINER_PARENT,
        otherElementName: PDOMPeer.DESCRIPTION_SIBLING
    });
    j[addAssociationFunction]({
        otherNode: j,
        thisElementName: PDOMPeer.CONTAINER_PARENT,
        otherElementName: PDOMPeer.LABEL_SIBLING
    });
    const checkOnYourOwnAssociations = (node)=>{
        const instance = node['_pdomInstances'][0];
        const nodePrimaryElement = instance.peer.primarySibling;
        const nodeParent = nodePrimaryElement.parentElement;
        const getUniqueIdStringForSibling = (siblingString)=>{
            return instance.peer.getElementId(siblingString, instance.getPDOMInstanceUniqueId());
        };
        assert.ok(nodePrimaryElement.getAttribute(attribute).includes(getUniqueIdStringForSibling('label')), `${attribute} your own label element.`);
        assert.ok(nodeParent.getAttribute(attribute).includes(getUniqueIdStringForSibling('description')), `parent ${attribute} your own description element.`);
        assert.ok(nodeParent.getAttribute(attribute).includes(getUniqueIdStringForSibling('label')), `parent ${attribute} your own label element.`);
    };
    // add k into the mix
    const k = new Node({
        tagName: 'div'
    });
    k[addAssociationFunction]({
        otherNode: j,
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherElementName: PDOMPeer.LABEL_SIBLING
    });
    rootNode.addChild(k);
    const testK = ()=>{
        const kValue = k['_pdomInstances'][0].peer.primarySibling.getAttribute(attribute);
        const jID = j['_pdomInstances'][0].peer.labelSibling.getAttribute('id');
        assert.ok(jID === kValue, 'k pointing to j');
    };
    // audit the content we have created
    pdomAuditRootNode(rootNode);
    // Check basic associations within single node
    checkOnYourOwnAssociations(j);
    testK();
    // Moving this node around the scene graph should not change it's aria labelled by associations.
    rootNode.addChild(new Node({
        children: [
            j
        ]
    }));
    checkOnYourOwnAssociations(j);
    testK();
    // check remove child
    rootNode.removeChild(j);
    checkOnYourOwnAssociations(j);
    testK();
    // check dispose
    const jParent = new Node({
        children: [
            j
        ]
    });
    rootNode.children = [];
    rootNode.addChild(jParent);
    checkOnYourOwnAssociations(j);
    rootNode.addChild(j);
    checkOnYourOwnAssociations(j);
    rootNode.addChild(k);
    checkOnYourOwnAssociations(j);
    testK();
    jParent.dispose();
    checkOnYourOwnAssociations(j);
    testK();
    // check removeChild with dag
    const jParent2 = new Node({
        children: [
            j
        ]
    });
    rootNode.insertChild(0, jParent2);
    checkOnYourOwnAssociations(j);
    testK();
    rootNode.removeChild(jParent2);
    checkOnYourOwnAssociations(j);
    testK();
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
}
function testAssociationAttributeBySetters(assert, attribute) {
    const rootNode = new Node();
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // use a different setter depending on if testing labelledby or describedby
    const associationsArrayName = attribute === 'aria-labelledby' ? 'ariaLabelledbyAssociations' : attribute === 'aria-describedby' ? 'ariaDescribedbyAssociations' : 'activeDescendantAssociations';
    // use a different setter depending on if testing labelledby or describedby
    const associationRemovalFunction = attribute === 'aria-labelledby' ? 'removeAriaLabelledbyAssociation' : attribute === 'aria-describedby' ? 'removeAriaDescribedbyAssociation' : 'removeActiveDescendantAssociation';
    const options = {
        tagName: 'p',
        labelContent: 'hi',
        descriptionContent: 'hello',
        containerTagName: 'div'
    };
    const n = new Node(options);
    rootNode.addChild(n);
    options[associationsArrayName] = [
        {
            otherNode: n,
            thisElementName: PDOMPeer.PRIMARY_SIBLING,
            otherElementName: PDOMPeer.LABEL_SIBLING
        }
    ];
    const o = new Node(options);
    rootNode.addChild(o);
    const nPeer = getPDOMPeerByNode(n);
    const oElement = getPrimarySiblingElementByNode(o);
    assert.ok(oElement.getAttribute(attribute).includes(nPeer.getElementId('label', nPeer.pdomInstance.getPDOMInstanceUniqueId())), `${attribute} for two nodes with setter (label).`);
    // make a list of associations to test as a setter
    const randomAssociationObject = {
        otherNode: new Node(),
        thisElementName: PDOMPeer.CONTAINER_PARENT,
        otherElementName: PDOMPeer.LABEL_SIBLING
    };
    options[associationsArrayName] = [
        {
            otherNode: new Node(),
            thisElementName: PDOMPeer.CONTAINER_PARENT,
            otherElementName: PDOMPeer.DESCRIPTION_SIBLING
        },
        randomAssociationObject,
        {
            otherNode: new Node(),
            thisElementName: PDOMPeer.PRIMARY_SIBLING,
            otherElementName: PDOMPeer.LABEL_SIBLING
        }
    ];
    // test getters and setters
    const m = new Node(options);
    rootNode.addChild(m);
    assert.ok(_.isEqual(m[associationsArrayName], options[associationsArrayName]), 'test association object getter');
    m[associationRemovalFunction](randomAssociationObject);
    options[associationsArrayName].splice(options[associationsArrayName].indexOf(randomAssociationObject), 1);
    assert.ok(_.isEqual(m[associationsArrayName], options[associationsArrayName]), 'test association object getter after removal');
    m[associationsArrayName] = [];
    assert.ok(getPrimarySiblingElementByNode(m).getAttribute(attribute) === null, 'clear with setter');
    m[associationsArrayName] = options[associationsArrayName];
    m.dispose();
    assert.ok(m[associationsArrayName].length === 0, 'cleared when disposed');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
}
QUnit.test('aria-labelledby', (assert)=>{
    testAssociationAttribute(assert, 'aria-labelledby');
    testAssociationAttributeBySetters(assert, 'aria-labelledby');
});
QUnit.test('aria-describedby', (assert)=>{
    testAssociationAttribute(assert, 'aria-describedby');
    testAssociationAttributeBySetters(assert, 'aria-describedby');
});
QUnit.test('aria-activedescendant', (assert)=>{
    testAssociationAttribute(assert, 'aria-activedescendant');
    testAssociationAttributeBySetters(assert, 'aria-activedescendant');
});
QUnit.test('ParallelDOM invalidation', (assert)=>{
    // test invalidation of accessibility (changing content which requires )
    const a1 = new Node();
    const rootNode = new Node();
    a1.tagName = 'button';
    // accessible instances are not sorted until added to a display
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    rootNode.addChild(a1);
    // verify that elements are in the DOM
    const a1Element = getPrimarySiblingElementByNode(a1);
    assert.ok(a1Element, 'button in DOM');
    assert.ok(a1Element.tagName === 'BUTTON', 'button tag name set');
    // give the button a container parent and some empty siblings
    a1.labelTagName = 'div';
    a1.descriptionTagName = 'p';
    a1.containerTagName = 'div';
    let buttonElement = a1.pdomInstances[0].peer.primarySibling;
    let parentElement = buttonElement.parentElement;
    const buttonPeers = parentElement.childNodes;
    // now html should look like
    // <div id='parent'>
    //  <div id='label'></div>
    //  <p id='description'></p>
    //  <button></button>
    // </div>
    assert.ok(document.getElementById(parentElement.id), 'container parent in DOM');
    assert.ok(buttonPeers[0].tagName === 'DIV', 'label first');
    assert.ok(buttonPeers[1].tagName === 'P', 'description second');
    assert.ok(buttonPeers[2].tagName === 'BUTTON', 'primarySibling third');
    // make the button a div and use an inline label, and place the description below
    a1.tagName = 'div';
    a1.appendLabel = true;
    a1.appendDescription = true;
    a1.labelTagName = null; // use aria label attribute instead
    a1.ariaLabel = TEST_LABEL;
    // now the html should look like
    // <div id='parent-id'>
    //  <div></div>
    //  <p id='description'></p>
    // </div>
    // redefine the HTML elements (references will point to old elements before mutation)
    buttonElement = a1.pdomInstances[0].peer.primarySibling;
    parentElement = buttonElement.parentElement;
    const newButtonPeers = parentElement.childNodes;
    assert.ok(newButtonPeers[0] === getPrimarySiblingElementByNode(a1), 'div first');
    assert.ok(newButtonPeers[1].id.includes('description'), 'description after div when appending both elements');
    assert.ok(newButtonPeers.length === 2, 'no label peer when using just aria-label attribute');
    const elementInDom = document.getElementById(a1.pdomInstances[0].peer.primarySibling.id);
    assert.ok(elementInDom.getAttribute('aria-label') === TEST_LABEL, 'aria-label set');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('ParallelDOM setters/getters', (assert)=>{
    const a1 = new Node({
        tagName: 'div'
    });
    var display = new Display(a1); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // set/get attributes
    let a1Element = getPrimarySiblingElementByNode(a1);
    const initialLength = a1.getPDOMAttributes().length;
    a1.setPDOMAttribute('role', 'switch');
    assert.ok(a1.getPDOMAttributes().length === initialLength + 1, 'attribute set should only add 1');
    assert.ok(a1.getPDOMAttributes()[a1.getPDOMAttributes().length - 1].attribute === 'role', 'attribute set');
    assert.ok(a1Element.getAttribute('role') === 'switch', 'HTML attribute set');
    assert.ok(a1.hasPDOMAttribute('role'), 'should have pdom attribute');
    a1.removePDOMAttribute('role');
    assert.ok(!a1.hasPDOMAttribute('role'), 'should not have pdom attribute');
    assert.ok(!a1Element.getAttribute('role'), 'attribute removed');
    const b = new Node({
        focusable: true
    });
    a1.addChild(b);
    b.tagName = 'div';
    assert.ok(getPrimarySiblingElementByNode(b).tabIndex >= 0, 'set tagName after focusable');
    // test setting attribute as DOM property, should NOT have attribute value pair (DOM uses empty string for empty)
    a1.setPDOMAttribute('hidden', true, {
        type: 'property'
    });
    a1Element = getPrimarySiblingElementByNode(a1);
    assert.equal(a1Element.hidden, true, 'hidden set as Property');
    assert.ok(a1Element.getAttribute('hidden') === '', 'hidden should not be set as attribute');
    // test setting and removing PDOM classes
    a1.setPDOMClass(TEST_CLASS_ONE);
    assert.ok(getPrimarySiblingElementByNode(a1).classList.contains(TEST_CLASS_ONE), 'TEST_CLASS_ONE missing from classList');
    // two classes
    a1.setPDOMClass(TEST_CLASS_TWO);
    a1Element = getPrimarySiblingElementByNode(a1);
    assert.ok(a1Element.classList.contains(TEST_CLASS_ONE) && a1Element.classList.contains(TEST_CLASS_ONE), 'One of the classes missing from classList');
    // modify the Node in a way that would cause a full redraw, make sure classes still exist
    a1.tagName = 'button';
    a1Element = getPrimarySiblingElementByNode(a1);
    assert.ok(a1Element.classList.contains(TEST_CLASS_ONE) && a1Element.classList.contains(TEST_CLASS_ONE), 'One of the classes missing from classList after changing tagName');
    // remove them one at a time
    a1.removePDOMClass(TEST_CLASS_ONE);
    a1Element = getPrimarySiblingElementByNode(a1);
    assert.ok(!a1Element.classList.contains(TEST_CLASS_ONE), 'TEST_CLASS_ONE should be removed from classList');
    assert.ok(a1Element.classList.contains(TEST_CLASS_TWO), 'TEST_CLASS_TWO should still be in classList');
    a1.removePDOMClass(TEST_CLASS_TWO);
    a1Element = getPrimarySiblingElementByNode(a1);
    assert.ok(!a1Element.classList.contains(TEST_CLASS_ONE) && !a1Element.classList.contains(TEST_CLASS_ONE), 'classList should not contain any added classes');
    pdomAuditRootNode(a1);
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('Next/Previous focusable', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    // Especially important for puppeteer which doesn't support focus/blur events
    // see https://github.com/phetsims/aqua/issues/134
    if (!document.hasFocus()) {
        assert.ok(true, 'Unable to run focus tests if document does not have focus.');
    } else {
        const util = PDOMUtils;
        const rootNode = new Node({
            tagName: 'div',
            focusable: true
        });
        var display = new Display(rootNode); // eslint-disable-line no-var
        display.initializeEvents();
        document.body.appendChild(display.domElement);
        // invisible is deprecated don't use in future, this is a workaround for Nodes without bounds
        const a = new Node({
            tagName: 'div',
            focusable: true,
            focusHighlight: 'invisible'
        });
        const b = new Node({
            tagName: 'div',
            focusable: true,
            focusHighlight: 'invisible'
        });
        const c = new Node({
            tagName: 'div',
            focusable: true,
            focusHighlight: 'invisible'
        });
        const d = new Node({
            tagName: 'div',
            focusable: true,
            focusHighlight: 'invisible'
        });
        const e = new Node({
            tagName: 'div',
            focusable: true,
            focusHighlight: 'invisible'
        });
        rootNode.children = [
            a,
            b,
            c,
            d
        ];
        assert.ok(a.focusable, 'should be focusable');
        // get dom elements from the body
        const rootElement = getPrimarySiblingElementByNode(rootNode);
        const aElement = getPrimarySiblingElementByNode(a);
        const bElement = getPrimarySiblingElementByNode(b);
        const cElement = getPrimarySiblingElementByNode(c);
        const dElement = getPrimarySiblingElementByNode(d);
        a.focus();
        assert.ok(document.activeElement.id === aElement.id, 'a in focus (next)');
        util.getNextFocusable(rootElement).focus();
        assert.ok(document.activeElement.id === bElement.id, 'b in focus (next)');
        util.getNextFocusable(rootElement).focus();
        assert.ok(document.activeElement.id === cElement.id, 'c in focus (next)');
        util.getNextFocusable(rootElement).focus();
        assert.ok(document.activeElement.id === dElement.id, 'd in focus (next)');
        util.getNextFocusable(rootElement).focus();
        assert.ok(document.activeElement.id === dElement.id, 'd still in focus (next)');
        util.getPreviousFocusable(rootElement).focus();
        assert.ok(document.activeElement.id === cElement.id, 'c in focus (previous)');
        util.getPreviousFocusable(rootElement).focus();
        assert.ok(document.activeElement.id === bElement.id, 'b in focus (previous)');
        util.getPreviousFocusable(rootElement).focus();
        assert.ok(document.activeElement.id === aElement.id, 'a in focus (previous)');
        util.getPreviousFocusable(rootElement).focus();
        assert.ok(document.activeElement.id === aElement.id, 'a still in focus (previous)');
        rootNode.removeAllChildren();
        rootNode.addChild(a);
        a.children = [
            b,
            c
        ];
        c.addChild(d);
        d.addChild(e);
        // this should hide everything except a
        b.focusable = false;
        c.pdomVisible = false;
        a.focus();
        util.getNextFocusable(rootElement).focus();
        assert.ok(document.activeElement.id === aElement.id, 'a only element focusable');
        pdomAuditRootNode(rootNode);
        display.dispose();
        display.domElement.parentElement.removeChild(display.domElement);
    // NOTE: The FocusManager should not be detached here, it is used globally and is needed for other tests.
    }
});
QUnit.test('Remove accessibility subtree', (assert)=>{
    const rootNode = new Node({
        tagName: 'div',
        focusable: true
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'div',
        focusable: true,
        focusHighlight: 'invisible'
    });
    const b = new Node({
        tagName: 'div',
        focusable: true,
        focusHighlight: 'invisible'
    });
    const c = new Node({
        tagName: 'div',
        focusable: true,
        focusHighlight: 'invisible'
    });
    const d = new Node({
        tagName: 'div',
        focusable: true,
        focusHighlight: 'invisible'
    });
    const e = new Node({
        tagName: 'div',
        focusable: true,
        focusHighlight: 'invisible'
    });
    const f = new Node({
        tagName: 'div',
        focusable: true,
        focusHighlight: 'invisible'
    });
    rootNode.children = [
        a,
        b,
        c,
        d,
        e
    ];
    d.addChild(f);
    let rootDOMElement = getPrimarySiblingElementByNode(rootNode);
    let dDOMElement = getPrimarySiblingElementByNode(d);
    // verify the dom
    assert.ok(rootDOMElement.children.length === 5, 'children added');
    // redefine because the dom element references above have become stale
    rootDOMElement = getPrimarySiblingElementByNode(rootNode);
    dDOMElement = getPrimarySiblingElementByNode(d);
    assert.ok(rootDOMElement.children.length === 5, 'children added back');
    assert.ok(dDOMElement.children.length === 1, 'descendant child added back');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('accessible-dag', (assert)=>{
    // test accessibility for multiple instances of a node
    const rootNode = new Node({
        tagName: 'div',
        focusable: true
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'div'
    });
    const b = new Node({
        tagName: 'div'
    });
    const c = new Node({
        tagName: 'div'
    });
    const d = new Node({
        tagName: 'div'
    });
    const e = new Node({
        tagName: 'div'
    });
    rootNode.addChild(a);
    a.children = [
        b,
        c,
        d
    ];
    // e has three parents (DAG)
    b.addChild(e);
    c.addChild(e);
    d.addChild(e);
    // each instance should have its own accessible content, HTML should look like
    // <div id="root">
    //   <div id="a">
    //     <div id="b">
    //       <div id="e-instance1">
    //     <div id="c">
    //       <div id="e-instance2">
    //     <div id="d">
    //       <div id="e-instance2">
    const instances = e.pdomInstances;
    assert.ok(e.pdomInstances.length === 3, 'node e should have 3 accessible instances');
    assert.ok(instances[0].peer.primarySibling.id !== instances[1].peer.primarySibling.id && instances[1].peer.primarySibling.id !== instances[2].peer.primarySibling.id && instances[0].peer.primarySibling.id !== instances[2].peer.primarySibling.id, 'each dom element should be unique');
    assert.ok(document.getElementById(instances[0].peer.primarySibling.id), 'peer primarySibling 0 should be in the DOM');
    assert.ok(document.getElementById(instances[1].peer.primarySibling.id), 'peer primarySibling 1 should be in the DOM');
    assert.ok(document.getElementById(instances[2].peer.primarySibling.id), 'peer primarySibling 2 should be in the DOM');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('replaceChild', (assert)=>{
    // this suite involves focus tests which do not work on headless puppeteer
    if (!document.hasFocus()) {
        assert.ok(true, 'Unable to run focus tests if document does not have focus.');
    } else {
        // test the behavior of replaceChild function
        const rootNode = new Node({
            tagName: 'div'
        });
        var display = new Display(rootNode); // eslint-disable-line no-var
        document.body.appendChild(display.domElement);
        display.initializeEvents();
        // create some nodes for testing
        const a = new Node({
            tagName: 'button',
            focusHighlight: focusHighlight
        });
        const b = new Node({
            tagName: 'button',
            focusHighlight: focusHighlight
        });
        const c = new Node({
            tagName: 'button',
            focusHighlight: focusHighlight
        });
        const d = new Node({
            tagName: 'button',
            focusHighlight: focusHighlight
        });
        const e = new Node({
            tagName: 'button',
            focusHighlight: focusHighlight
        });
        const f = new Node({
            tagName: 'button',
            focusHighlight: focusHighlight
        });
        // a child that will be added through replaceChild()
        const testNode = new Node({
            tagName: 'button',
            focusHighlight: focusHighlight
        });
        // make sure replaceChild puts the child in the right spot
        a.children = [
            b,
            c,
            d,
            e,
            f
        ];
        const initIndex = a.indexOfChild(e);
        a.replaceChild(e, testNode);
        const afterIndex = a.indexOfChild(testNode);
        assert.ok(a.hasChild(testNode), 'a should have child testNode after it replaced node e');
        assert.ok(!a.hasChild(e), 'a should no longer have child node e after it was replaced by testNode');
        assert.ok(initIndex === afterIndex, 'testNode should be at the same place as e was after replaceChild');
        // create a scene graph to test how scenery manages focus
        //    a
        //   / \
        //  f   b
        //     / \
        //    c   d
        //     \ /
        //      e
        a.removeAllChildren();
        rootNode.addChild(a);
        a.children = [
            f,
            b
        ];
        b.children = [
            c,
            d
        ];
        c.addChild(e);
        d.addChild(e);
        f.focus();
        assert.ok(f.focused, 'f has focus before being replaced');
        // replace f with testNode, ensure that testNode receives focus after replacing
        a.replaceChild(f, testNode);
        assert.ok(!a.hasChild(f), 'a should no longer have child f');
        assert.ok(a.hasChild(testNode), 'a should now have child testNode');
        assert.ok(!f.focused, 'f no longer has focus after being replaced');
        assert.ok(testNode.focused, 'testNode has focus after replacing focused node f');
        assert.ok(testNode.pdomInstances[0].peer.primarySibling === document.activeElement, 'browser is focusing testNode');
        testNode.blur();
        assert.ok(!!testNode, 'testNode blurred before being replaced');
        // replace testNode with f after bluring testNode, neither should have focus after the replacement
        a.replaceChild(testNode, f);
        assert.ok(a.hasChild(f), 'node f should replace node testNode');
        assert.ok(!a.hasChild(testNode), 'testNode should no longer be a child of node a');
        assert.ok(!testNode.focused, 'testNode should not have focus after being replaced');
        assert.ok(!f.focused, 'f should not have focus after replacing testNode, testNode did not have focus');
        assert.ok(f.pdomInstances[0].peer.primarySibling !== document.activeElement, 'browser should not be focusing node f');
        // focus node d and replace with non-focusable testNode, neither should have focus since testNode is not focusable
        d.focus();
        testNode.focusable = false;
        assert.ok(d.focused, 'd has focus before being replaced');
        assert.ok(!testNode.focusable, 'testNode is not focusable before replacing node d');
        b.replaceChild(d, testNode);
        assert.ok(b.hasChild(testNode), 'testNode should be a child of node b after replacing with replaceChild');
        assert.ok(!b.hasChild(d), 'd should not be a child of b after it was replaced with replaceChild');
        assert.ok(!d.focused, 'd does not have focus after being replaced by testNode');
        assert.ok(!testNode.focused, 'testNode does not have focus after replacing node d (testNode is not focusable)');
        display.dispose();
        display.domElement.parentElement.removeChild(display.domElement);
    }
});
QUnit.test('pdomVisible', (assert)=>{
    const rootNode = new Node();
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    // test with a scene graph
    //       a
    //      / \
    //     b    c
    //        / | \
    //       d  e  f
    //           \ /
    //            g
    const a = new Node();
    const b = new Node();
    const c = new Node();
    const d = new Node();
    const e = new Node();
    const f = new Node();
    const g = new Node();
    rootNode.addChild(a);
    a.children = [
        b,
        c
    ];
    c.children = [
        d,
        e,
        f
    ];
    e.children = [
        g
    ];
    f.children = [
        g
    ];
    // give some accessible content
    a.tagName = 'div';
    b.tagName = 'button';
    e.tagName = 'div';
    g.tagName = 'button';
    // scenery should produce this accessible DOM tree
    // <div id="a">
    //   <button id="b">
    //   <div id="e">
    //      <button id="g1">
    //   <button id="g2">
    // get the accessible primary siblings - looking into pdomInstances for testing, there is no getter for primarySibling
    const divA = a.pdomInstances[0].peer.primarySibling;
    const buttonB = b.pdomInstances[0].peer.primarySibling;
    const divE = e.pdomInstances[0].peer.primarySibling;
    const buttonG1 = g.pdomInstances[0].peer.primarySibling;
    const buttonG2 = g.pdomInstances[1].peer.primarySibling;
    const divAChildren = divA.childNodes;
    const divEChildren = divE.childNodes;
    assert.ok(_.includes(divAChildren, buttonB), 'button B should be an immediate child of div A');
    assert.ok(_.includes(divAChildren, divE), 'div E should be an immediate child of div A');
    assert.ok(_.includes(divAChildren, buttonG2), 'button G2 should be an immediate child of div A');
    assert.ok(_.includes(divEChildren, buttonG1), 'button G1 should be an immediate child of div E');
    // make node B invisible for accessibility - it should should visible, but hidden from screen readers
    b.pdomVisible = false;
    assert.equal(b.visible, true, 'b should be visible after becoming hidden for screen readers');
    assert.equal(b.pdomVisible, false, 'b state should reflect it is hidden for screen readers');
    assert.equal(buttonB.hidden, true, 'buttonB should be hidden for screen readers');
    assert.equal(b.pdomDisplayed, false, 'pdomVisible=false, b should have no representation in the PDOM');
    b.pdomVisible = true;
    // make node B invisible - it should not be visible, and it should be hidden for screen readers
    b.visible = false;
    assert.equal(b.visible, false, 'state of node b is visible');
    assert.equal(buttonB.hidden, true, 'buttonB is hidden from screen readers after becoming invisible');
    assert.equal(b.pdomVisible, true, 'state of node b still reflects pdom visibility when invisible');
    assert.equal(b.pdomDisplayed, false, 'b invisible and should have no representation in the PDOM');
    b.visible = true;
    // make node f invisible - g's trail that goes through f should be invisible to AT, tcomhe child of c should remain pdomVisible
    f.visible = false;
    assert.equal(g.isPDOMVisible(), true, 'state of pdomVisible should remain true on node g');
    assert.ok(!buttonG1.hidden, 'buttonG1 (child of e) should not be hidden after parent node f made invisible (no accessible content on node f)');
    assert.equal(buttonG2.hidden, true, 'buttonG2 should be hidden after parent node f made invisible (no accessible content on node f)');
    assert.equal(g.pdomDisplayed, true, 'one parent still visible, g still has one PDOMInstance displayed in PDOM');
    f.visible = true;
    // make node c (no accessible content) invisible to screen, e should be hidden and g2 should be hidden
    c.pdomVisible = false;
    assert.equal(c.visible, true, 'c should still be visible after becoming invisible to screen readers');
    assert.equal(divE.hidden, true, 'div E should be hidden after parent node c (no accessible content) is made invisible to screen readers');
    assert.equal(buttonG2.hidden, true, 'buttonG2 should be hidden after ancestor node c (no accessible content) is made invisible to screen readers');
    assert.ok(!divA.hidden, 'div A should not have been hidden by making descendant c invisible to screen readers');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('inputValue', (assert)=>{
    const rootNode = new Node();
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'input',
        inputType: 'radio',
        inputValue: 'i am value'
    });
    rootNode.addChild(a);
    let aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.getAttribute('value') === 'i am value', 'should have correct value');
    const differentValue = 'i am different value';
    a.inputValue = differentValue;
    aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.getAttribute('value') === differentValue, 'should have different value');
    rootNode.addChild(new Node({
        children: [
            a
        ]
    }));
    aElement = a.pdomInstances[1].peer.primarySibling;
    assert.ok(aElement.getAttribute('value') === differentValue, 'should have the same different value');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('ariaValueText', (assert)=>{
    const rootNode = new Node();
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const ariaValueText = 'this is my value text';
    const a = new Node({
        tagName: 'input',
        ariaValueText: ariaValueText,
        inputType: 'range'
    });
    rootNode.addChild(a);
    let aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.getAttribute('aria-valuetext') === ariaValueText, 'should have correct value text.');
    assert.ok(a.ariaValueText === ariaValueText, 'should have correct value text, getter');
    const differentValue = 'i am different value text';
    a.ariaValueText = differentValue;
    aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.getAttribute('aria-valuetext') === differentValue, 'should have different value text');
    assert.ok(a.ariaValueText === differentValue, 'should have different value text, getter');
    rootNode.addChild(new Node({
        children: [
            a
        ]
    }));
    aElement = a.pdomInstances[1].peer.primarySibling;
    assert.ok(aElement.getAttribute('aria-valuetext') === differentValue, 'should have the same different value text after children moving');
    assert.ok(a.ariaValueText === differentValue, 'should have the same different value text after children moving, getter');
    a.tagName = 'div';
    aElement = a.pdomInstances[1].peer.primarySibling;
    assert.ok(aElement.getAttribute('aria-valuetext') === differentValue, 'value text as div');
    assert.ok(a.ariaValueText === differentValue, 'value text as div, getter');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('setPDOMAttribute', (assert)=>{
    const rootNode = new Node();
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'div',
        labelContent: 'hello'
    });
    rootNode.addChild(a);
    a.setPDOMAttribute('test', 'test1');
    let aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.getAttribute('test') === 'test1', 'setPDOMAttribute for primary sibling');
    a.removePDOMAttribute('test');
    aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.getAttribute('test') === null, 'removePDOMAttribute for primary sibling');
    a.setPDOMAttribute('test', 'testValue');
    a.setPDOMAttribute('test', 'testValueLabel', {
        elementName: PDOMPeer.LABEL_SIBLING
    });
    const testBothAttributes = ()=>{
        aElement = getPrimarySiblingElementByNode(a);
        const aLabelElement = aElement.parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
        assert.ok(aElement.getAttribute('test') === 'testValue', 'setPDOMAttribute for primary sibling 2');
        assert.ok(aLabelElement.getAttribute('test') === 'testValueLabel', 'setPDOMAttribute for label sibling');
    };
    testBothAttributes();
    rootNode.removeChild(a);
    rootNode.addChild(new Node({
        children: [
            a
        ]
    }));
    testBothAttributes();
    a.removePDOMAttribute('test', {
        elementName: PDOMPeer.LABEL_SIBLING
    });
    aElement = getPrimarySiblingElementByNode(a);
    const aLabelElement = aElement.parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(aElement.getAttribute('test') === 'testValue', 'removePDOMAttribute for label should not effect primary sibling ');
    assert.ok(aLabelElement.getAttribute('test') === null, 'removePDOMAttribute for label sibling');
    a.removePDOMAttributes();
    const attributeName = 'multiTest';
    a.setPDOMAttribute(attributeName, 'true', {
        type: 'attribute'
    });
    aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.getAttribute(attributeName) === 'true', 'type:attribute should set attribute');
    a.setPDOMAttribute(attributeName, false, {
        type: 'property'
    });
    assert.ok(!aElement.getAttribute(attributeName), 'type:property should remove attribute');
    // @ts-expect-error for testing
    assert.equal(aElement[attributeName], false, 'type:property should set property');
    const testAttributes = a.getPDOMAttributes().filter((a)=>a.attribute === attributeName);
    assert.ok(testAttributes.length === 1, 'type change should alter the attribute, not add a new one.');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('pdomChecked', (assert)=>{
    const rootNode = new Node();
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'input',
        inputType: 'radio',
        pdomChecked: true
    });
    rootNode.addChild(a);
    let aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.checked, 'should be checked');
    a.pdomChecked = false;
    aElement = getPrimarySiblingElementByNode(a);
    assert.ok(!aElement.checked, 'should not be checked');
    a.inputType = 'range';
    window.assert && assert.throws(()=>{
        a.pdomChecked = true;
    }, /.*/, 'should fail if inputType range');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('swapVisibility', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    // test the behavior of swapVisibility function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    display.initializeEvents();
    // a custom focus highlight (since dummy node's have no bounds)
    const focusHighlight = new Rectangle(0, 0, 10, 10);
    // create some nodes for testing
    const a = new Node({
        tagName: 'button',
        focusHighlight: focusHighlight
    });
    const b = new Node({
        tagName: 'button',
        focusHighlight: focusHighlight
    });
    const c = new Node({
        tagName: 'button',
        focusHighlight: focusHighlight
    });
    rootNode.addChild(a);
    a.children = [
        b,
        c
    ];
    // swap visibility between two nodes, visibility should be swapped and neither should have keyboard focus
    b.visible = true;
    c.visible = false;
    b.swapVisibility(c);
    assert.equal(b.visible, false, 'b should now be invisible');
    assert.equal(c.visible, true, 'c should now be visible');
    assert.equal(b.focused, false, 'b should not have focus after being made invisible');
    assert.equal(c.focused, false, 'c should not have  focus since b did not have focus');
    // swap visibility between two nodes where the one that is initially visible has keyboard focus, the newly visible
    // node then receive focus
    b.visible = true;
    c.visible = false;
    b.focus();
    b.swapVisibility(c);
    assert.equal(b.visible, false, 'b should be invisible after swapVisibility');
    assert.equal(c.visible, true, 'c should be visible after  swapVisibility');
    assert.equal(b.focused, false, 'b should no longer have focus  after swapVisibility');
    assert.equal(c.focused, true, 'c should now have focus after swapVisibility');
    // swap visibility between two nodes where the one that is initially visible has keyboard focus, the newly visible
    // node then receive focus - like the previous test but c.swapVisibility( b ) is the same as b.swapVisibility( c )
    b.visible = true;
    c.visible = false;
    b.focus();
    b.swapVisibility(c);
    assert.equal(b.visible, false, 'b should be invisible after swapVisibility');
    assert.equal(c.visible, true, 'c should be visible after  swapVisibility');
    assert.equal(b.focused, false, 'b should no longer have focus  after swapVisibility');
    assert.equal(c.focused, true, 'c should now have focus after swapVisibility');
    // swap visibility between two nodes where the first node has focus, but the second node is not focusable. After
    // swapping, neither should have focus
    b.visible = true;
    c.visible = false;
    b.focus();
    c.focusable = false;
    b.swapVisibility(c);
    assert.equal(b.visible, false, 'b should be invisible after visibility is swapped');
    assert.equal(c.visible, true, 'c should be visible after visibility is swapped');
    assert.equal(b.focused, false, 'b should no longer have focus after visibility is swapped');
    assert.equal(c.focused, false, 'c should not have focus after visibility is swapped because it is not focusable');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('Aria Label Setter', (assert)=>{
    // test the behavior of swapVisibility function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // create some nodes for testing
    const a = new Node({
        tagName: 'button',
        ariaLabel: TEST_LABEL_2
    });
    assert.ok(a.ariaLabel === TEST_LABEL_2, 'aria-label getter/setter');
    assert.ok(a.labelContent === null, 'no other label set with aria-label');
    assert.ok(a.innerContent === null, 'no inner content set with aria-label');
    rootNode.addChild(a);
    let buttonA = a.pdomInstances[0].peer.primarySibling;
    assert.ok(buttonA.getAttribute('aria-label') === TEST_LABEL_2, 'setter on dom element');
    assert.ok(buttonA.innerHTML === '', 'no inner html with aria-label setter');
    a.ariaLabel = null;
    buttonA = a.pdomInstances[0].peer.primarySibling;
    assert.ok(!buttonA.hasAttribute('aria-label'), 'setter can clear on dom element');
    assert.ok(buttonA.innerHTML === '', 'no inner html with aria-label setter when clearing');
    assert.ok(a.ariaLabel === null, 'cleared in Node model.');
    pdomAuditRootNode(rootNode);
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('focusable option', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    // test the behavior of focusable function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    display.initializeEvents();
    const a = new Node({
        tagName: 'div',
        focusable: true
    });
    rootNode.addChild(a);
    assert.equal(a.focusable, true, 'focusable option setter');
    assert.ok(getPrimarySiblingElementByNode(a).tabIndex === 0, 'tab index on primary sibling with setter');
    // change the tag name, but focusable should stay the same
    a.tagName = 'p';
    assert.equal(a.focusable, true, 'tagName option should not change focusable value');
    assert.ok(getPrimarySiblingElementByNode(a).tabIndex === 0, 'tagName option should not change tab index on primary sibling');
    a.focusable = false;
    assert.ok(getPrimarySiblingElementByNode(a).tabIndex === -1, 'set focusable false');
    const b = new Node({
        tagName: 'p'
    });
    rootNode.addChild(b);
    b.focusable = true;
    assert.ok(b.focusable, 'set focusable as setter');
    assert.ok(getPrimarySiblingElementByNode(b).tabIndex === 0, 'set focusable as setter');
    // HTML elements that are natively focusable are focusable by default
    const c = new Node({
        tagName: 'button'
    });
    assert.ok(c.focusable, 'button is focusable by default');
    // change tagName to something that is not focusable, focusable should be false
    c.tagName = 'p';
    assert.ok(!c.focusable, 'button changed to paragraph, should no longer be focusable');
    // When focusable is set to null on an element that is not focusable by default, it should lose focus
    const d = new Node({
        tagName: 'div',
        focusable: true,
        focusHighlight: focusHighlight
    });
    rootNode.addChild(d);
    d.focus();
    assert.ok(d.focused, 'focusable div should be focused after calling focus()');
    d.focusable = null;
    assert.ok(!d.focused, 'default div should lose focus after node restored to null focusable');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('append siblings/appendLabel/appendDescription setters', (assert)=>{
    // test the behavior of focusable function
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'li',
        innerContent: TEST_INNER_CONTENT,
        labelTagName: 'h3',
        labelContent: TEST_LABEL,
        descriptionContent: TEST_DESCRIPTION,
        containerTagName: 'section',
        appendLabel: true
    });
    rootNode.addChild(a);
    const aElement = getPrimarySiblingElementByNode(a);
    let containerElement = aElement.parentElement;
    assert.ok(containerElement.tagName.toUpperCase() === 'SECTION', 'container parent is set to right tag');
    let peerElements = containerElement.childNodes;
    assert.ok(peerElements.length === 3, 'expected three siblings');
    assert.ok(peerElements[0].tagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'description first sibling');
    assert.ok(peerElements[1].tagName.toUpperCase() === 'LI', 'primary sibling second sibling');
    assert.ok(peerElements[2].tagName.toUpperCase() === 'H3', 'label sibling last');
    a.appendDescription = true;
    containerElement = getPrimarySiblingElementByNode(a).parentElement;
    peerElements = containerElement.childNodes;
    assert.ok(containerElement.childNodes.length === 3, 'expected three siblings');
    assert.ok(peerElements[0].tagName.toUpperCase() === 'LI', 'primary sibling first sibling');
    assert.ok(peerElements[1].tagName.toUpperCase() === 'H3', 'label sibling second');
    assert.ok(peerElements[2].tagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'description last sibling');
    // clear it out back to defaults should work with setters
    a.appendDescription = false;
    a.appendLabel = false;
    containerElement = getPrimarySiblingElementByNode(a).parentElement;
    peerElements = containerElement.childNodes;
    assert.ok(containerElement.childNodes.length === 3, 'expected three siblings');
    assert.ok(peerElements[0].tagName.toUpperCase() === 'H3', 'label sibling first');
    assert.ok(peerElements[1].tagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'description sibling second');
    assert.ok(peerElements[2].tagName.toUpperCase() === 'LI', 'primary sibling last');
    // test order when using appendLabel/appendDescription without a parent container - order should be primary sibling,
    // label sibling, description sibling
    const b = new Node({
        tagName: 'input',
        inputType: 'checkbox',
        labelTagName: 'label',
        labelContent: TEST_LABEL,
        descriptionContent: TEST_DESCRIPTION,
        appendLabel: true,
        appendDescription: true
    });
    rootNode.addChild(b);
    let bPeer = getPDOMPeerByNode(b);
    let bElement = getPrimarySiblingElementByNode(b);
    let bElementParent = bElement.parentElement;
    let indexOfPrimaryElement = Array.prototype.indexOf.call(bElementParent.childNodes, bElement);
    assert.ok(bElementParent.childNodes[indexOfPrimaryElement] === bElement, 'b primary sibling first with no container, both appended');
    assert.ok(bElementParent.childNodes[indexOfPrimaryElement + 1] === bPeer.labelSibling, 'b label sibling second with no container, both appended');
    assert.ok(bElementParent.childNodes[indexOfPrimaryElement + 2] === bPeer.descriptionSibling, 'b description sibling third with no container, both appended');
    // test order when only description appended and no parent container - order should be label, primary, then
    // description
    b.appendLabel = false;
    // refresh since operation may have created new Objects
    bPeer = getPDOMPeerByNode(b);
    bElement = getPrimarySiblingElementByNode(b);
    bElementParent = bElement.parentElement;
    indexOfPrimaryElement = Array.prototype.indexOf.call(bElementParent.childNodes, bElement);
    assert.ok(bElementParent.childNodes[indexOfPrimaryElement - 1] === bPeer.labelSibling, 'b label sibling first with no container, description appended');
    assert.ok(bElementParent.childNodes[indexOfPrimaryElement] === bElement, 'b primary sibling second with no container, description appended');
    assert.ok(bElementParent.childNodes[indexOfPrimaryElement + 1] === bPeer.descriptionSibling, 'b description sibling third with no container, description appended');
    pdomAuditRootNode(rootNode);
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('containerAriaRole option', (assert)=>{
    // test the behavior of focusable function
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'div',
        containerTagName: 'div',
        containerAriaRole: 'application'
    });
    rootNode.addChild(a);
    assert.ok(a.containerAriaRole === 'application', 'role attribute should be on node property');
    let aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.parentElement.getAttribute('role') === 'application', 'role attribute should be on parent element');
    a.containerAriaRole = null;
    assert.ok(a.containerAriaRole === null, 'role attribute should be cleared on node');
    aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.parentElement.getAttribute('role') === null, 'role attribute should be cleared on parent element');
    pdomAuditRootNode(rootNode);
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('ariaRole option', (assert)=>{
    // test the behavior of focusable function
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'div',
        innerContent: 'Draggable',
        ariaRole: 'application'
    });
    rootNode.addChild(a);
    assert.ok(a.ariaRole === 'application', 'role attribute should be on node property');
    let aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.getAttribute('role') === 'application', 'role attribute should be on element');
    a.ariaRole = null;
    assert.ok(a.ariaRole === null, 'role attribute should be cleared on node');
    aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.getAttribute('role') === null, 'role attribute should be cleared on element');
    pdomAuditRootNode(rootNode);
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
// Higher level setter/getter options
QUnit.test('accessibleName option', (assert)=>{
    assert.ok(true);
    // test the behavior of focusable function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'div',
        accessibleName: TEST_LABEL
    });
    rootNode.addChild(a);
    assert.ok(a.accessibleName === TEST_LABEL, 'accessibleName getter');
    const aElement = getPrimarySiblingElementByNode(a);
    assert.ok(aElement.textContent === TEST_LABEL, 'accessibleName setter on div');
    const b = new Node({
        tagName: 'input',
        accessibleName: TEST_LABEL,
        inputType: 'range'
    });
    a.addChild(b);
    const bElement = getPrimarySiblingElementByNode(b);
    const bParent = getPrimarySiblingElementByNode(b).parentElement;
    const bLabelSibling = bParent.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(bLabelSibling.textContent === TEST_LABEL, 'accessibleName sets label sibling');
    assert.ok(bLabelSibling.getAttribute('for').includes(bElement.id), 'accessibleName sets label\'s "for" attribute');
    const c = new Node({
        containerTagName: 'div',
        tagName: 'div',
        ariaLabel: 'overrideThis'
    });
    rootNode.addChild(c);
    const cAccessibleNameBehavior = (node, options, accessibleName)=>{
        options.ariaLabel = accessibleName;
        return options;
    };
    c.accessibleNameBehavior = cAccessibleNameBehavior;
    assert.ok(c.accessibleNameBehavior === cAccessibleNameBehavior, 'getter works');
    let cLabelElement = getPrimarySiblingElementByNode(c).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(cLabelElement.getAttribute('aria-label') === 'overrideThis', 'accessibleNameBehavior should not work until there is accessible name');
    c.accessibleName = 'accessible name description';
    cLabelElement = getPrimarySiblingElementByNode(c).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(cLabelElement.getAttribute('aria-label') === 'accessible name description', 'accessible name setter');
    c.accessibleName = '';
    cLabelElement = getPrimarySiblingElementByNode(c).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(cLabelElement.getAttribute('aria-label') === '', 'accessibleNameBehavior should work for empty string');
    c.accessibleName = null;
    cLabelElement = getPrimarySiblingElementByNode(c).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(cLabelElement.getAttribute('aria-label') === 'overrideThis', 'accessibleNameBehavior should not work until there is accessible name');
    const d = new Node({
        containerTagName: 'div',
        tagName: 'div'
    });
    rootNode.addChild(d);
    const dAccessibleNameBehavior = (node, options, accessibleName)=>{
        options.ariaLabel = accessibleName;
        return options;
    };
    d.accessibleNameBehavior = dAccessibleNameBehavior;
    assert.ok(d.accessibleNameBehavior === dAccessibleNameBehavior, 'getter works');
    let dLabelElement = getPrimarySiblingElementByNode(d).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(dLabelElement.getAttribute('aria-label') === null, 'accessibleNameBehavior should not work until there is accessible name');
    const accessibleNameDescription = 'accessible name description';
    d.accessibleName = accessibleNameDescription;
    dLabelElement = getPrimarySiblingElementByNode(d).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(dLabelElement.getAttribute('aria-label') === accessibleNameDescription, 'accessible name setter');
    d.accessibleName = '';
    dLabelElement = getPrimarySiblingElementByNode(d).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(dLabelElement.getAttribute('aria-label') === '', 'accessibleNameBehavior should work for empty string');
    d.accessibleName = null;
    dLabelElement = getPrimarySiblingElementByNode(d).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(dLabelElement.getAttribute('aria-label') === null, 'accessibleNameBehavior should not work until there is accessible name');
    pdomAuditRootNode(rootNode);
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('pdomHeading option', (assert)=>{
    assert.ok(true);
    // test the behavior of focusable function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'div',
        pdomHeading: TEST_LABEL,
        containerTagName: 'div'
    });
    rootNode.addChild(a);
    assert.ok(a.pdomHeading === TEST_LABEL, 'accessibleName getter');
    const aLabelSibling = getPrimarySiblingElementByNode(a).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(aLabelSibling.textContent === TEST_LABEL, 'pdomHeading setter on div');
    assert.ok(aLabelSibling.tagName === 'H1', 'pdomHeading setter should be h1');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('helpText option', (assert)=>{
    assert.ok(true);
    // test the behavior of focusable function
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // label tag needed for default sibling indices to work
    const a = new Node({
        containerTagName: 'div',
        tagName: 'div',
        labelTagName: 'div',
        helpText: TEST_DESCRIPTION
    });
    rootNode.addChild(a);
    rootNode.addChild(new Node({
        tagName: 'input',
        inputType: 'range'
    }));
    assert.ok(a.helpText === TEST_DESCRIPTION, 'helpText getter');
    // default for help text is to append description after the primary sibling
    const aDescriptionElement = getPrimarySiblingElementByNode(a).parentElement.children[APPENDED_DESCRIPTION_SIBLING_INDEX];
    assert.ok(aDescriptionElement.textContent === TEST_DESCRIPTION, 'helpText setter on div');
    const b = new Node({
        containerTagName: 'div',
        tagName: 'button',
        descriptionContent: 'overrideThis',
        labelTagName: 'div'
    });
    rootNode.addChild(b);
    b.helpTextBehavior = (node, options, helpText)=>{
        options.descriptionTagName = 'p';
        options.descriptionContent = helpText;
        return options;
    };
    let bDescriptionElement = getPrimarySiblingElementByNode(b).parentElement.children[DEFAULT_DESCRIPTION_SIBLING_INDEX];
    assert.ok(bDescriptionElement.textContent === 'overrideThis', 'helpTextBehavior should not work until there is help text');
    b.helpText = 'help text description';
    bDescriptionElement = getPrimarySiblingElementByNode(b).parentElement.children[DEFAULT_DESCRIPTION_SIBLING_INDEX];
    assert.ok(bDescriptionElement.textContent === 'help text description', 'help text setter');
    b.helpText = '';
    bDescriptionElement = getPrimarySiblingElementByNode(b).parentElement.children[DEFAULT_DESCRIPTION_SIBLING_INDEX];
    assert.ok(bDescriptionElement.textContent === '', 'helpTextBehavior should work for empty string');
    b.helpText = null;
    bDescriptionElement = getPrimarySiblingElementByNode(b).parentElement.children[DEFAULT_DESCRIPTION_SIBLING_INDEX];
    assert.ok(bDescriptionElement.textContent === 'overrideThis', 'helpTextBehavior should not work until there is help text');
    pdomAuditRootNode(rootNode);
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('move to front/move to back', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    // make sure state is restored after moving children to front and back
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    display.initializeEvents();
    const a = new Node({
        tagName: 'button',
        focusHighlight: TEST_HIGHLIGHT
    });
    const b = new Node({
        tagName: 'button',
        focusHighlight: TEST_HIGHLIGHT
    });
    rootNode.children = [
        a,
        b
    ];
    b.focus();
    // after moving a to front, b should still have focus
    a.moveToFront();
    assert.ok(b.focused, 'b should have focus after a moved to front');
    // after moving a to back, b should still have focus
    a.moveToBack();
    // add a guard where we don't check this if focus has been moved somewhere else. This happens sometimes with
    // dev tools or other windows opened, see https://github.com/phetsims/scenery/issues/827
    if (document.body.contains(document.activeElement) && document.body !== document.activeElement) {
        assert.ok(b.focused, 'b should have focus after a moved to back');
    }
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('Node.enabledProperty with PDOM', (assert)=>{
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    const pdomNode = new Node({
        tagName: 'p'
    });
    rootNode.addChild(pdomNode);
    assert.ok(pdomNode.pdomInstances.length === 1, 'should have an instance when attached to display');
    assert.ok(!!pdomNode.pdomInstances[0].peer, 'should have a peer');
    assert.ok(pdomNode.pdomInstances[0].peer.primarySibling.getAttribute('aria-disabled') !== 'true', 'should be enabled to start');
    pdomNode.enabled = false;
    assert.ok(pdomNode.pdomInstances[0].peer.primarySibling.getAttribute('aria-disabled') === 'true', 'should be aria-disabled when disabled');
    pdomNode.enabled = true;
    assert.ok(pdomNode.pdomInstances[0].peer.primarySibling.getAttribute('aria-disabled') === 'false', 'Actually set to false since it was previously disabled.');
    pdomNode.dispose();
    assert.ok(pdomNode.pdomInstances.length === 0, 'disposed nodes do not have a PDOM instance');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
// these fuzzers take time, so it is nice when they are last
QUnit.test('Display.interactive toggling in the PDOM', (assert)=>{
    const rootNode = new Node({
        tagName: 'div'
    });
    var display = new Display(rootNode); // eslint-disable-line no-var
    display.initializeEvents();
    document.body.appendChild(display.domElement);
    const pdomRangeChild = new Node({
        tagName: 'input',
        inputType: 'range'
    });
    const pdomParagraphChild = new Node({
        tagName: 'p'
    });
    const pdomButtonChild = new Node({
        tagName: 'button'
    });
    const pdomParent = new Node({
        tagName: 'button',
        children: [
            pdomRangeChild,
            pdomParagraphChild,
            pdomButtonChild
        ]
    });
    const DISABLED_TRUE = true;
    // For of list of html elements that support disabled, see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
    const DEFAULT_DISABLED_WHEN_SUPPORTED = false;
    const DEFAULT_DISABLED_WHEN_NOT_SUPPORTED = undefined;
    rootNode.addChild(pdomParent);
    assert.ok(true, 'initial case');
    const testDisabled = (node, disabled, message, pdomInstance = 0)=>{
        // @ts-expect-error "disabled" is only supported by certain attributes, see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
        assert.ok(node.pdomInstances[pdomInstance].peer.primarySibling.disabled === disabled, message);
    };
    testDisabled(pdomParent, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParent initial no disabled');
    testDisabled(pdomRangeChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomRangeChild initial no disabled');
    testDisabled(pdomParagraphChild, DEFAULT_DISABLED_WHEN_NOT_SUPPORTED, 'pdomParagraphChild initial no disabled');
    testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild initial no disabled');
    display.interactive = false;
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent toggled not interactive');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild toggled not interactive');
    testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild toggled not interactive');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild toggled not interactive');
    display.interactive = true;
    testDisabled(pdomParent, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParent toggled back to interactive');
    testDisabled(pdomRangeChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomRangeChild toggled back to interactive');
    testDisabled(pdomParagraphChild, DEFAULT_DISABLED_WHEN_NOT_SUPPORTED, 'pdomParagraphChild toggled back to interactive');
    testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild toggled back to interactive');
    display.interactive = false;
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent second toggled not interactive');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild second toggled not interactive');
    testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild second toggled not interactive');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild second toggled not interactive');
    pdomParent.setPDOMAttribute('disabled', true, {
        type: 'property'
    });
    pdomRangeChild.setPDOMAttribute('disabled', true, {
        type: 'property'
    });
    pdomParagraphChild.setPDOMAttribute('disabled', true, {
        type: 'property'
    });
    pdomButtonChild.setPDOMAttribute('disabled', true, {
        type: 'property'
    });
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent not interactive after setting disabled manually as property, display not interactive');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild not interactive after setting disabled manually as property, display not interactive');
    testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild not interactive after setting disabled manually as property, display not interactive');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild not interactive after setting disabled manually as property, display not interactive');
    display.interactive = true;
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent not interactive after setting disabled manually as property display interactive');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild not interactive after setting disabled manually as property display interactive');
    testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild not interactive after setting disabled manually as property display interactive');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild not interactive after setting disabled manually as property display interactive');
    display.interactive = false;
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent still disabled when display is not interactive again.');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild still disabled when display is not interactive again.');
    testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild still disabled when display is not interactive again.');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild still disabled when display is not interactive again.');
    pdomParent.removePDOMAttribute('disabled');
    pdomRangeChild.removePDOMAttribute('disabled');
    pdomParagraphChild.removePDOMAttribute('disabled');
    pdomButtonChild.removePDOMAttribute('disabled');
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent still disabled from display not interactive after local property removed.');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild still disabled from display not interactive after local property removed.');
    testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild still disabled from display not interactive after local property removed.');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild still disabled from display not interactive after local property removed.');
    display.interactive = true;
    testDisabled(pdomParent, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParent interactive now without local property.');
    testDisabled(pdomRangeChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomRangeChild interactive now without local property.');
    testDisabled(pdomParagraphChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParagraphChild interactive now without local property.');
    testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild interactive now without local property.');
    pdomParent.setPDOMAttribute('disabled', '');
    pdomRangeChild.setPDOMAttribute('disabled', '');
    pdomParagraphChild.setPDOMAttribute('disabled', '');
    pdomButtonChild.setPDOMAttribute('disabled', '');
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent not interactive after setting disabled manually as attribute, display not interactive');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild not interactive after setting disabled manually as attribute, display not interactive');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild not interactive after setting disabled manually as attribute, display not interactive');
    display.interactive = true;
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent not interactive after setting disabled manually as attribute display interactive');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild not interactive after setting disabled manually as attribute display interactive');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild not interactive after setting disabled manually as attribute display interactive');
    // This test doesn't work, because paragraphs don't support disabled, so the attribute "disabled" won't
    // automatically transfer over to the property value like for the others. For a list of Elements that support "disabled", see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
    // testDisabled( pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild not interactive after setting disabled manually as attribute, display  interactive' );
    display.interactive = false;
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent still disabled when display is not interactive again.');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild still disabled when display is not interactive again.');
    testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild still disabled when display is not interactive again.');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild still disabled when display is not interactive again.');
    pdomParent.removePDOMAttribute('disabled');
    pdomRangeChild.removePDOMAttribute('disabled');
    pdomParagraphChild.removePDOMAttribute('disabled');
    pdomButtonChild.removePDOMAttribute('disabled');
    testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent still disabled from display not interactive after local attribute removed.');
    testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild still disabled from display not interactive after local attribute removed.');
    testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild still disabled from display not interactive after local attribute removed.');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild still disabled from display not interactive after local attribute removed.');
    display.interactive = true;
    testDisabled(pdomParent, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParent interactive now without local attribute.');
    testDisabled(pdomRangeChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomRangeChild interactive now without local attribute.');
    testDisabled(pdomParagraphChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParagraphChild interactive now without local attribute.');
    testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild interactive now without local attribute.');
    const containerOfDAGButton = new Node({
        children: [
            pdomButtonChild
        ]
    });
    pdomParent.addChild(containerOfDAGButton);
    testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild default not disabled.');
    testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild default not disabled with dag.', 1);
    display.interactive = false;
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled.');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled with dag.', 1);
    pdomButtonChild.setPDOMAttribute('disabled', true, {
        type: 'property'
    });
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled set property too.');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled set property too, with dag.', 1);
    display.interactive = true;
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned not disabled set property too.');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned not disabled set property too, with dag.', 1);
    display.interactive = false;
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled again.');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled again, with dag.', 1);
    pdomButtonChild.removePDOMAttribute('disabled');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild remove disabled while not interactive.');
    testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild remove disabled while not interactive, with dag.', 1);
    display.interactive = true;
    testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild default not disabled after interactive again.');
    testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild default not disabled after interactive again with dag.', 1);
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
// these fuzzers take time, so it is nice when they are last
QUnit.test('PDOMFuzzer with 3 nodes', (assert)=>{
    const fuzzer = new PDOMFuzzer(3, false);
    for(let i = 0; i < 5000; i++){
        fuzzer.step();
    }
    assert.expect(0);
    fuzzer.dispose();
});
QUnit.test('PDOMFuzzer with 4 nodes', (assert)=>{
    const fuzzer = new PDOMFuzzer(4, false);
    for(let i = 0; i < 1000; i++){
        fuzzer.step();
    }
    assert.expect(0);
    fuzzer.dispose();
});
QUnit.test('PDOMFuzzer with 5 nodes', (assert)=>{
    const fuzzer = new PDOMFuzzer(5, false);
    for(let i = 0; i < 300; i++){
        fuzzer.step();
    }
    assert.expect(0);
    fuzzer.dispose();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BhcmFsbGVsRE9NVGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUGFyYWxsZWxET00gdGVzdHNcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBEaXNwbGF5IGZyb20gJy4uLy4uL2Rpc3BsYXkvRGlzcGxheS5qcyc7XG5pbXBvcnQgQ2lyY2xlIGZyb20gJy4uLy4uL25vZGVzL0NpcmNsZS5qcyc7XG5pbXBvcnQgTm9kZSBmcm9tICcuLi8uLi9ub2Rlcy9Ob2RlLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi4vLi4vbm9kZXMvUmVjdGFuZ2xlLmpzJztcbmltcG9ydCB7IFBhcmFsbGVsRE9NT3B0aW9ucywgUERPTUJlaGF2aW9yRnVuY3Rpb24gfSBmcm9tICcuL1BhcmFsbGVsRE9NLmpzJztcbmltcG9ydCBQRE9NRnV6emVyIGZyb20gJy4vUERPTUZ1enplci5qcyc7XG5pbXBvcnQgUERPTVBlZXIgZnJvbSAnLi9QRE9NUGVlci5qcyc7XG5pbXBvcnQgUERPTVV0aWxzIGZyb20gJy4vUERPTVV0aWxzLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBURVNUX0lOTkVSX0NPTlRFTlQgPSAnVGVzdCBJbm5lciBDb250ZW50IEhlcmUgcGxlYXNlXiYqLiBUaGFua3MgeW91IHNvIHZlcnkgbXVjaG8uJztcbmNvbnN0IFRFU1RfTEFCRUwgPSAnVGVzdCBsYWJlbCc7XG5jb25zdCBURVNUX0xBQkVMXzIgPSAnVGVzdCBsYWJlbCAyJztcbmNvbnN0IFRFU1RfREVTQ1JJUFRJT04gPSAnVGVzdCBkZXNjcmlwdGlvbic7XG5jb25zdCBURVNUX0xBQkVMX0hUTUwgPSAnPHN0cm9uZz5JIFJPQ0sgYXMgYSBMQUJFTDwvc3Ryb25nPic7XG5jb25zdCBURVNUX0xBQkVMX0hUTUxfMiA9ICc8c3Ryb25nPkkgUk9DSyBhcyBhIExBQkVMIDI8L3N0cm9uZz4nO1xuY29uc3QgVEVTVF9ERVNDUklQVElPTl9IVE1MID0gJzxzdHJvbmc+SSBST0NLIGFzIGEgREVTQ1JJUFRJT048L3N0cm9uZz4nO1xuY29uc3QgVEVTVF9ERVNDUklQVElPTl9IVE1MXzIgPSAnPHN0cm9uZz5JIFJPQ0sgYXMgYSBERVNDUklQVElPTiAyPC9zdHJvbmc+JztcbmNvbnN0IFRFU1RfQ0xBU1NfT05FID0gJ3Rlc3QtY2xhc3Mtb25lJztcbmNvbnN0IFRFU1RfQ0xBU1NfVFdPID0gJ3Rlc3QtY2xhc3MtdHdvJztcblxuLy8gVGhlc2Ugc2hvdWxkIG1hbnVhbGx5IG1hdGNoIHRoZSBkZWZhdWx0cyBpbiB0aGUgUGFyYWxsZWxET00uanMgdHJhaXRcbmNvbnN0IERFRkFVTFRfTEFCRUxfVEFHX05BTUUgPSBQRE9NVXRpbHMuREVGQVVMVF9MQUJFTF9UQUdfTkFNRTtcbmNvbnN0IERFRkFVTFRfREVTQ1JJUFRJT05fVEFHX05BTUUgPSBQRE9NVXRpbHMuREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRTtcblxuLy8gZ2l2ZW4gdGhlIHBhcmVudCBjb250YWluZXIgZWxlbWVudCBmb3IgYSBub2RlLCB0aGlzIHZhbHVlIGlzIHRoZSBpbmRleCBvZiB0aGUgbGFiZWwgc2libGluZyBpbiB0aGVcbi8vIHBhcmVudCdzIGFycmF5IG9mIGNoaWxkcmVuIEhUTUxFbGVtZW50cy5cbmNvbnN0IERFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCA9IDA7XG5jb25zdCBERUZBVUxUX0RFU0NSSVBUSU9OX1NJQkxJTkdfSU5ERVggPSAxO1xuY29uc3QgQVBQRU5ERURfREVTQ1JJUFRJT05fU0lCTElOR19JTkRFWCA9IDI7XG5cbi8vIGEgZm9jdXMgaGlnaGxpZ2h0IGZvciB0ZXN0aW5nLCBzaW5jZSBkdW1teSBub2RlcyB0ZW5kIHRvIGhhdmUgbm8gYm91bmRzXG5jb25zdCBURVNUX0hJR0hMSUdIVCA9IG5ldyBDaXJjbGUoIDUgKTtcblxuLy8gYSBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0IChzaW5jZSBkdW1teSBub2RlJ3MgaGF2ZSBubyBib3VuZHMpXG5jb25zdCBmb2N1c0hpZ2hsaWdodCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwLCAxMCApO1xuXG5sZXQgY2FuUnVuVGVzdHMgPSB0cnVlO1xuXG5RVW5pdC5tb2R1bGUoICdQYXJhbGxlbERPTScsIHtcbiAgYmVmb3JlRWFjaDogKCkgPT4ge1xuXG4gICAgLy8gQSB0ZXN0IGNhbiBvbmx5IGJlIHJ1biB3aGVuIHRoZSBkb2N1bWVudCBoYXMgZm9jdXMgYmVjYXVzZSB0ZXN0cyByZXF1aXJlIGZvY3VzL2JsdXIgZXZlbnRzLiBCcm93c2Vyc1xuICAgIC8vIGRvIG5vdCBlbWl0IHRoZXNlIGV2ZW50cyB3aGVuIHRoZSB3aW5kb3cgaXMgbm90IGFjdGl2ZSAoZXNwZWNpYWxseSB0cnVlIGZvciBwdXBldHRlZXJcbiAgICBjYW5SdW5UZXN0cyA9IGRvY3VtZW50Lmhhc0ZvY3VzKCk7XG5cbiAgICBpZiAoICFjYW5SdW5UZXN0cyApIHtcbiAgICAgIGNvbnNvbGUud2FybiggJ1VuYWJsZSB0byBydW4gZm9jdXMgdGVzdHMgYmVjYXVzZSB0aGUgZG9jdW1lbnQgZG9lcyBub3QgaGF2ZSBmb2N1cycgKTtcbiAgICB9XG4gIH1cbn0gKTtcblxuLyoqXG4gKiBHZXQgYSB1bmlxdWUgUERPTVBlZXIgZnJvbSBhIG5vZGUgd2l0aCBhY2Nlc3NpYmxlIGNvbnRlbnQuIFdpbGwgZXJyb3IgaWYgdGhlIG5vZGUgaGFzIG11bHRpcGxlIGluc3RhbmNlc1xuICogb3IgaWYgdGhlIG5vZGUgaGFzbid0IGJlZW4gYXR0YWNoZWQgdG8gYSBkaXNwbGF5IChhbmQgdGhlcmVmb3JlIGhhcyBubyBhY2Nlc3NpYmxlIGNvbnRlbnQpLlxuICovXG5mdW5jdGlvbiBnZXRQRE9NUGVlckJ5Tm9kZSggbm9kZTogTm9kZSApOiBQRE9NUGVlciB7XG4gIGlmICggbm9kZS5wZG9tSW5zdGFuY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdObyBwZG9tSW5zdGFuY2VzLiBXYXMgeW91ciBub2RlIGFkZGVkIHRvIHRoZSBzY2VuZSBncmFwaD8nICk7XG4gIH1cblxuICBlbHNlIGlmICggbm9kZS5wZG9tSW5zdGFuY2VzLmxlbmd0aCA+IDEgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAnVGhlcmUgc2hvdWxkIG9uZSBhbmQgb25seSBvbmUgYWNjZXNzaWJsZSBpbnN0YW5jZSBmb3IgdGhlIG5vZGUnICk7XG4gIH1cbiAgZWxzZSBpZiAoICFub2RlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyICkge1xuICAgIHRocm93IG5ldyBFcnJvciggJ3Bkb21JbnN0YW5jZVxcJ3MgcGVlciBzaG91bGQgZXhpc3QuJyApO1xuICB9XG5cbiAgcmV0dXJuIG5vZGUucGRvbUluc3RhbmNlc1sgMCBdLnBlZXI7XG59XG5cbi8qKlxuICogR2V0IHRoZSBpZCBvZiBhIGRvbSBlbGVtZW50IHJlcHJlc2VudGluZyBhIG5vZGUgaW4gdGhlIERPTS4gIFRoZSBhY2Nlc3NpYmxlIGNvbnRlbnQgbXVzdCBleGlzdCBhbmQgYmUgdW5pcXVlLFxuICogdGhlcmUgc2hvdWxkIG9ubHkgYmUgb25lIGFjY2Vzc2libGUgaW5zdGFuY2UgYW5kIG9uZSBkb20gZWxlbWVudCBmb3IgdGhlIG5vZGUuXG4gKlxuICogTk9URTogQmUgY2FyZWZ1bCBhYm91dCBnZXR0aW5nIHJlZmVyZW5jZXMgdG8gZG9tIEVsZW1lbnRzLCB0aGUgcmVmZXJlbmNlIHdpbGwgYmUgc3RhbGUgZWFjaCB0aW1lXG4gKiB0aGUgdmlldyAoUERPTVBlZXIpIGlzIHJlZHJhd24sIHdoaWNoIGlzIHF1aXRlIG9mdGVuIHdoZW4gc2V0dGluZyBvcHRpb25zLlxuICovXG5mdW5jdGlvbiBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIG5vZGU6IE5vZGUgKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCB1bmlxdWVQZWVyID0gZ2V0UERPTVBlZXJCeU5vZGUoIG5vZGUgKTtcbiAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCB1bmlxdWVQZWVyLnByaW1hcnlTaWJsaW5nIS5pZCApITtcbn1cblxuLyoqXG4gKiBBdWRpdCB0aGUgcm9vdCBub2RlIGZvciBhY2Nlc3NpYmxlIGNvbnRlbnQgd2l0aGluIGEgdGVzdCwgdG8gbWFrZSBzdXJlIHRoYXQgY29udGVudCBpcyBhY2Nlc3NpYmxlIGFzIHdlIGV4cGVjdCxcbiAqIGFuZCBzbyB0aGF0IG91ciBwZG9tQXVkaXQgZnVuY3Rpb24gbWF5IGNhdGNoIHRoaW5ncyB0aGF0IGhhdmUgZ29uZSB3cm9uZy5cbiAqIEBwYXJhbSByb290Tm9kZSAtIHRoZSByb290IE5vZGUgYXR0YWNoZWQgdG8gdGhlIERpc3BsYXkgYmVpbmcgdGVzdGVkXG4gKi9cbmZ1bmN0aW9uIHBkb21BdWRpdFJvb3ROb2RlKCByb290Tm9kZTogTm9kZSApOiB2b2lkIHtcbiAgcm9vdE5vZGUucGRvbUF1ZGl0KCk7XG59XG5cblFVbml0LnRlc3QoICd0YWdOYW1lL2lubmVyQ29udGVudCBvcHRpb25zJywgYXNzZXJ0ID0+IHtcblxuICAvLyB0ZXN0IHRoZSBiZWhhdmlvciBvZiBzd2FwVmlzaWJpbGl0eSBmdW5jdGlvblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgLy8gY3JlYXRlIHNvbWUgbm9kZXMgZm9yIHRlc3RpbmdcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBpbm5lckNvbnRlbnQ6IFRFU1RfTEFCRUwgfSApO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG5cbiAgY29uc3QgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcbiAgYXNzZXJ0Lm9rKCBhLnBkb21JbnN0YW5jZXMubGVuZ3RoID09PSAxLCAnb25seSAxIGluc3RhbmNlJyApO1xuICBhc3NlcnQub2soIGFFbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkTm9kZXMubGVuZ3RoID09PSAxLCAncGFyZW50IGNvbnRhaW5zIG9uZSBwcmltYXJ5IHNpYmxpbmdzJyApO1xuICBhc3NlcnQub2soIGFFbGVtZW50LnRhZ05hbWUgPT09ICdCVVRUT04nLCAnZGVmYXVsdCBsYWJlbCB0YWdOYW1lJyApO1xuICBhc3NlcnQub2soIGFFbGVtZW50LnRleHRDb250ZW50ID09PSBURVNUX0xBQkVMLCAnbm8gaHRtbCBzaG91bGQgdXNlIHRleHRDb250ZW50JyApO1xuXG4gIGEuaW5uZXJDb250ZW50ID0gVEVTVF9MQUJFTF9IVE1MO1xuICBhc3NlcnQub2soIGFFbGVtZW50LmlubmVySFRNTCA9PT0gVEVTVF9MQUJFTF9IVE1MLCAnaHRtbCBsYWJlbCBzaG91bGQgdXNlIGlubmVySFRNTCcgKTtcblxuICBhLmlubmVyQ29udGVudCA9IFRFU1RfTEFCRUxfSFRNTF8yO1xuICBhc3NlcnQub2soIGFFbGVtZW50LmlubmVySFRNTCA9PT0gVEVTVF9MQUJFTF9IVE1MXzIsICdodG1sIGxhYmVsIHNob3VsZCB1c2UgaW5uZXJIVE1MLCBvdmVyd3JpdGUgZnJvbSBodG1sJyApO1xuXG4gIGEuaW5uZXJDb250ZW50ID0gbnVsbDtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5pbm5lckhUTUwgPT09ICcnLCAnaW5uZXJIVE1MIHNob3VsZCBiZSBlbXB0eSBhZnRlciBjbGVhcmluZyBpbm5lckNvbnRlbnQnICk7XG5cbiAgYS50YWdOYW1lID0gbnVsbDtcbiAgYXNzZXJ0Lm9rKCBhLnBkb21JbnN0YW5jZXMubGVuZ3RoID09PSAwLCAnc2V0IHRvIG51bGwgc2hvdWxkIGNsZWFyIGFjY2Vzc2libGUgaW5zdGFuY2VzJyApO1xuXG4gIC8vIG1ha2Ugc3VyZSB0aGF0IG5vIGVycm9ycyB3aGVuIHNldHRpbmcgaW5uZXJDb250ZW50IHdpdGggdGFnTmFtZSBudWxsLlxuICBhLmlubmVyQ29udGVudCA9ICdoZWxsbyc7XG5cbiAgYS50YWdOYW1lID0gJ2J1dHRvbic7XG4gIGEuaW5uZXJDb250ZW50ID0gVEVTVF9MQUJFTF9IVE1MXzI7XG4gIGFzc2VydC5vayggZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICkuaW5uZXJIVE1MID09PSBURVNUX0xBQkVMX0hUTUxfMiwgJ2lubmVyQ29udGVudCBub3QgY2xlYXJlZCB3aGVuIHRhZ05hbWUgc2V0IHRvIG51bGwuJyApO1xuXG4gIC8vIHZlcmlmeSB0aGF0IHNldHRpbmcgaW5uZXIgY29udGVudCBvbiBhbiBpbnB1dCBpcyBub3QgYWxsb3dlZFxuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2lucHV0JywgaW5wdXRUeXBlOiAncmFuZ2UnIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGIgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgYi5pbm5lckNvbnRlbnQgPSAndGhpcyBzaG91bGQgZmFpbCc7XG4gIH0sIC8uKi8sICdjYW5ub3Qgc2V0IGlubmVyIGNvbnRlbnQgb24gaW5wdXQnICk7XG5cbiAgLy8gbm93IHRoYXQgaXQgaXMgYSBkaXYsIGlubmVyQ29udGVudCBpcyBhbGxvd2VkXG4gIGIudGFnTmFtZSA9ICdkaXYnO1xuICBhc3NlcnQub2soIGIudGFnTmFtZSA9PT0gJ2RpdicsICdleHBlY3QgdGFnTmFtZSBzZXR0ZXIgdG8gd29yay4nICk7XG4gIGIuaW5uZXJDb250ZW50ID0gVEVTVF9MQUJFTDtcbiAgYXNzZXJ0Lm9rKCBiLmlubmVyQ29udGVudCA9PT0gVEVTVF9MQUJFTCwgJ2lubmVyIGNvbnRlbnQgYWxsb3dlZCcgKTtcblxuICAvLyByZXZlcnQgdGFnIG5hbWUgdG8gaW5wdXQsIHNob3VsZCB0aHJvdyBhbiBlcnJvclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBiLnRhZ05hbWUgPSAnaW5wdXQnO1xuICB9LCAvLiovLCAnZXJyb3IgdGhyb3duIGFmdGVyIHNldHRpbmcgdGFnTmFtZSB0byBpbnB1dCBvbiBOb2RlIHdpdGggaW5uZXJDb250ZW50LicgKTtcblxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbn0gKTtcblxuXG5RVW5pdC50ZXN0KCAnY29udGFpbmVyVGFnTmFtZSBvcHRpb24nLCBhc3NlcnQgPT4ge1xuXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIHN3YXBWaXNpYmlsaXR5IGZ1bmN0aW9uXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAvLyBjcmVhdGUgc29tZSBub2RlcyBmb3IgdGVzdGluZ1xuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG4gIGFzc2VydC5vayggYS5wZG9tSW5zdGFuY2VzLmxlbmd0aCA9PT0gMSwgJ29ubHkgMSBpbnN0YW5jZScgKTtcbiAgYXNzZXJ0Lm9rKCBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5jb250YWluZXJQYXJlbnQgPT09IG51bGwsICdubyBjb250YWluZXIgcGFyZW50IGZvciBqdXN0IGJ1dHRvbicgKTtcbiAgYXNzZXJ0Lm9rKCByb290Tm9kZVsgJ19wZG9tSW5zdGFuY2VzJyBdWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmNoaWxkcmVuWyAwIF0gPT09IGFbICdfcGRvbUluc3RhbmNlcycgXVsgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nISxcbiAgICAncm9vdE5vZGUgcGVlciBzaG91bGQgaG9sZCBub2RlIGFcXCdzIHBlZXIgaW4gdGhlIFBET00nICk7XG5cbiAgYS5jb250YWluZXJUYWdOYW1lID0gJ2Rpdic7XG5cbiAgYXNzZXJ0Lm9rKCBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5jb250YWluZXJQYXJlbnQhLmlkLmluY2x1ZGVzKCAnY29udGFpbmVyJyApLCAnY29udGFpbmVyIHBhcmVudCBpcyBkaXYgaWYgc3BlY2lmaWVkJyApO1xuICBhc3NlcnQub2soIHJvb3ROb2RlWyAnX3Bkb21JbnN0YW5jZXMnIF1bIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyEuY2hpbGRyZW5bIDAgXSA9PT0gYVsgJ19wZG9tSW5zdGFuY2VzJyBdWyAwIF0ucGVlciEuY29udGFpbmVyUGFyZW50ISxcbiAgICAnY29udGFpbmVyIHBhcmVudCBpcyBkaXYgaWYgc3BlY2lmaWVkJyApO1xuXG4gIGEuY29udGFpbmVyVGFnTmFtZSA9IG51bGw7XG5cbiAgYXNzZXJ0Lm9rKCAhYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEuY29udGFpbmVyUGFyZW50ISwgJ2NvbnRhaW5lciBwYXJlbnQgaXMgY2xlYXJlZCBpZiBzcGVjaWZpZWQnICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnbGFiZWxUYWdOYW1lL2xhYmVsQ29udGVudCBvcHRpb24nLCBhc3NlcnQgPT4ge1xuXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIHN3YXBWaXNpYmlsaXR5IGZ1bmN0aW9uXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAvLyBjcmVhdGUgc29tZSBub2RlcyBmb3IgdGVzdGluZ1xuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGxhYmVsQ29udGVudDogVEVTVF9MQUJFTCB9ICk7XG5cbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcblxuICBjb25zdCBhRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApO1xuICBjb25zdCBsYWJlbFNpYmxpbmcgPSBhRWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzWyAwIF0gYXMgSFRNTEVsZW1lbnQ7XG4gIGFzc2VydC5vayggYS5wZG9tSW5zdGFuY2VzLmxlbmd0aCA9PT0gMSwgJ29ubHkgMSBpbnN0YW5jZScgKTtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMiwgJ3BhcmVudCBjb250YWlucyB0d28gc2libGluZ3MnICk7XG4gIGFzc2VydC5vayggbGFiZWxTaWJsaW5nLnRhZ05hbWUgPT09IERFRkFVTFRfTEFCRUxfVEFHX05BTUUsICdkZWZhdWx0IGxhYmVsIHRhZ05hbWUnICk7XG4gIGFzc2VydC5vayggbGFiZWxTaWJsaW5nLnRleHRDb250ZW50ID09PSBURVNUX0xBQkVMLCAnbm8gaHRtbCBzaG91bGQgdXNlIHRleHRDb250ZW50JyApO1xuXG4gIGEubGFiZWxDb250ZW50ID0gVEVTVF9MQUJFTF9IVE1MO1xuICBhc3NlcnQub2soIGxhYmVsU2libGluZy5pbm5lckhUTUwgPT09IFRFU1RfTEFCRUxfSFRNTCwgJ2h0bWwgbGFiZWwgc2hvdWxkIHVzZSBpbm5lckhUTUwnICk7XG5cbiAgYS5sYWJlbENvbnRlbnQgPSBudWxsO1xuICBhc3NlcnQub2soIGxhYmVsU2libGluZy5pbm5lckhUTUwgPT09ICcnLCAnbGFiZWwgY29udGVudCBzaG91bGQgYmUgZW1wdHkgYWZ0ZXIgc2V0dGluZyB0byBudWxsJyApO1xuXG4gIGEubGFiZWxDb250ZW50ID0gVEVTVF9MQUJFTF9IVE1MXzI7XG4gIGFzc2VydC5vayggbGFiZWxTaWJsaW5nLmlubmVySFRNTCA9PT0gVEVTVF9MQUJFTF9IVE1MXzIsICdodG1sIGxhYmVsIHNob3VsZCB1c2UgaW5uZXJIVE1MLCBvdmVyd3JpdGUgZnJvbSBodG1sJyApO1xuXG4gIGEudGFnTmFtZSA9ICdkaXYnO1xuXG4gIGNvbnN0IG5ld0FFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGNvbnN0IG5ld0xhYmVsU2libGluZyA9IG5ld0FFbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkTm9kZXNbIDAgXSBhcyBIVE1MRWxlbWVudDtcblxuICBhc3NlcnQub2soIG5ld0xhYmVsU2libGluZy5pbm5lckhUTUwgPT09IFRFU1RfTEFCRUxfSFRNTF8yLCAndGFnTmFtZSBpbmRlcGVuZGVudCBvZjogaHRtbCBsYWJlbCBzaG91bGQgdXNlIGlubmVySFRNTCwgb3ZlcndyaXRlIGZyb20gaHRtbCcgKTtcblxuICBhLmxhYmVsVGFnTmFtZSA9IG51bGw7XG5cbiAgLy8gbWFrZSBzdXJlIGxhYmVsIHdhcyBjbGVhcmVkIGZyb20gUERPTVxuICBhc3NlcnQub2soIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLnBhcmVudEVsZW1lbnQhLmNoaWxkTm9kZXMubGVuZ3RoID09PSAxLFxuICAgICdPbmx5IG9uZSBlbGVtZW50IGFmdGVyIGNsZWFyaW5nIGxhYmVsJyApO1xuXG4gIGFzc2VydC5vayggYS5sYWJlbENvbnRlbnQgPT09IFRFU1RfTEFCRUxfSFRNTF8yLCAnY2xlYXJpbmcgbGFiZWxUYWdOYW1lIHNob3VsZCBub3QgY2hhbmdlIGNvbnRlbnQsIGV2ZW4gIHRob3VnaCBpdCBpcyBub3QgZGlzcGxheWVkJyApO1xuXG4gIGEubGFiZWxUYWdOYW1lID0gJ3AnO1xuICBhc3NlcnQub2soIGEubGFiZWxUYWdOYW1lID09PSAncCcsICdleHBlY3QgbGFiZWxUYWdOYW1lIHNldHRlciB0byB3b3JrLicgKTtcblxuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ3AnLCBsYWJlbENvbnRlbnQ6ICdJIGFtIGdyb290JyB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBiICk7XG4gIGxldCBiTGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGIucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLmxhYmVsU2libGluZyEuaWQgKSE7XG4gIGFzc2VydC5vayggIWJMYWJlbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnZm9yJyApLCAnZm9yIGF0dHJpYnV0ZSBzaG91bGQgbm90IGJlIG9uIG5vbiBsYWJlbCBsYWJlbCBzaWJsaW5nLicgKTtcbiAgYi5sYWJlbFRhZ05hbWUgPSAnbGFiZWwnO1xuICBiTGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGIucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLmxhYmVsU2libGluZyEuaWQgKSE7XG4gIGFzc2VydC5vayggYkxhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdmb3InICkgIT09IG51bGwsICdmb3IgYXR0cmlidXRlIHNob3VsZCBiZSBvbiBcImxhYmVsXCIgdGFnIGZvciBsYWJlbCBzaWJsaW5nLicgKTtcblxuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ3AnIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGMgKTtcbiAgYy5sYWJlbFRhZ05hbWUgPSAnbGFiZWwnO1xuICBjLmxhYmVsQ29udGVudCA9IFRFU1RfTEFCRUw7XG4gIGNvbnN0IGNMYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggYy5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEubGFiZWxTaWJsaW5nIS5pZCApITtcbiAgYXNzZXJ0Lm9rKCBjTGFiZWxFbGVtZW50LmdldEF0dHJpYnV0ZSggJ2ZvcicgKSAhPT0gbnVsbCwgJ29yZGVyIHNob3VsZCBub3QgbWF0dGVyJyApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxufSApO1xuXG5RVW5pdC50ZXN0KCAnY29udGFpbmVyIGVsZW1lbnQgbm90IG5lZWRlZCBmb3IgbXVsdGlwbGUgc2libGluZ3MnLCBhc3NlcnQgPT4ge1xuXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIHN3YXBWaXNpYmlsaXR5IGZ1bmN0aW9uXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAvLyB0ZXN0IGNvbnRhaW5lclRhZyBpcyBub3QgbmVlZGVkXG4gIGNvbnN0IGIgPSBuZXcgTm9kZSgge1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgIGxhYmVsQ29udGVudDogJ2hlbGxvJ1xuICB9ICk7XG4gIGNvbnN0IGMgPSBuZXcgTm9kZSgge1xuICAgIHRhZ05hbWU6ICdzZWN0aW9uJyxcbiAgICBsYWJlbENvbnRlbnQ6ICdoaSdcbiAgfSApO1xuICBjb25zdCBkID0gbmV3IE5vZGUoIHtcbiAgICB0YWdOYW1lOiAncCcsXG4gICAgaW5uZXJDb250ZW50OiAnUFBQUCcsXG4gICAgY29udGFpbmVyVGFnTmFtZTogJ2RpdidcbiAgfSApO1xuICByb290Tm9kZS5hZGRDaGlsZCggYiApO1xuICBiLmFkZENoaWxkKCBjICk7XG4gIGIuYWRkQ2hpbGQoIGQgKTtcbiAgbGV0IGJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICk7XG4gIGxldCBjUGVlciA9IGMucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhO1xuICBsZXQgZFBlZXIgPSBkLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITtcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT09IDMsICdjLnAsIGMuc2VjdGlvbiwgZC5kaXYgc2hvdWxkIGFsbCBiZSBvbiB0aGUgc2FtZSBsZXZlbCcgKTtcbiAgY29uc3QgY29uZmlybU9yaWdpbmFsT3JkZXIgPSAoKSA9PiB7XG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMCBdLnRhZ05hbWUgPT09ICdQJywgJ3AgZmlyc3QnICk7XG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMSBdLnRhZ05hbWUgPT09ICdTRUNUSU9OJywgJ3NlY3Rpb24gMm5kJyApO1xuICAgIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW5bIDIgXS50YWdOYW1lID09PSAnRElWJywgJ2RpdiAzcmQnICk7XG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMCBdID09PSBjUGVlci5sYWJlbFNpYmxpbmcsICdjIGxhYmVsIGZpcnN0JyApO1xuICAgIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW5bIDEgXSA9PT0gY1BlZXIucHJpbWFyeVNpYmxpbmcsICdjIHByaW1hcnkgMm5kJyApO1xuICAgIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW5bIDIgXSA9PT0gZFBlZXIuY29udGFpbmVyUGFyZW50LCAnZCBjb250YWluZXIgM3JkJyApO1xuICB9O1xuICBjb25maXJtT3JpZ2luYWxPcmRlcigpO1xuXG4gIC8vIGFkZCBhIGZldyBtb3JlXG4gIGNvbnN0IGUgPSBuZXcgTm9kZSgge1xuICAgIHRhZ05hbWU6ICdzcGFuJyxcbiAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6ICc8YnI+c3dlZXQgYW5kIGNvb2wgdGhpbmdzPC9icj4nXG4gIH0gKTtcbiAgYi5hZGRDaGlsZCggZSApO1xuICBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApOyAvLyByZWZyZXNoIHRoZSBET00gRWxlbWVudHNcbiAgY1BlZXIgPSBjLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITsgLy8gcmVmcmVzaCB0aGUgRE9NIEVsZW1lbnRzXG4gIGRQZWVyID0gZC5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciE7IC8vIHJlZnJlc2ggdGhlIERPTSBFbGVtZW50c1xuICBsZXQgZVBlZXIgPSBlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITtcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT09IDUsICdlIGNoaWxkcmVuIHNob3VsZCBiZSBhZGRlZCB0byB0aGUgc2FtZSBQRE9NIGxldmVsLicgKTtcbiAgY29uZmlybU9yaWdpbmFsT3JkZXIoKTtcblxuICBjb25zdCBjb25maXJtT3JpZ2luYWxXaXRoRSA9ICgpID0+IHtcbiAgICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuWyAzIF0udGFnTmFtZSA9PT0gJ1AnLCAnUCA0cmQnICk7XG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgNCBdLnRhZ05hbWUgPT09ICdTUEFOJywgJ1NQQU4gM3JkJyApO1xuICAgIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW5bIDMgXSA9PT0gZVBlZXIuZGVzY3JpcHRpb25TaWJsaW5nLCAnZSBkZXNjcmlwdGlvbiA0dGgnICk7XG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgNCBdID09PSBlUGVlci5wcmltYXJ5U2libGluZywgJ2UgcHJpbWFyeSA1dGgnICk7XG4gIH07XG5cbiAgLy8gZHluYW1pY2FsbHkgYWRkaW5nIHBhcmVudFxuICBlLmNvbnRhaW5lclRhZ05hbWUgPSAnYXJ0aWNsZSc7XG4gIGJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICk7IC8vIHJlZnJlc2ggdGhlIERPTSBFbGVtZW50c1xuICBjUGVlciA9IGMucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhOyAvLyByZWZyZXNoIHRoZSBET00gRWxlbWVudHNcbiAgZFBlZXIgPSBkLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITsgLy8gcmVmcmVzaCB0aGUgRE9NIEVsZW1lbnRzXG4gIGVQZWVyID0gZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciE7XG4gIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoID09PSA0LCAnZSBjaGlsZHJlbiBzaG91bGQgbm93IGJlIHVuZGVyIGVcXCdzIGNvbnRhaW5lci4nICk7XG4gIGNvbmZpcm1PcmlnaW5hbE9yZGVyKCk7XG4gIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW5bIDMgXS50YWdOYW1lID09PSAnQVJUSUNMRScsICdTUEFOIDNyZCcgKTtcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMyBdID09PSBlUGVlci5jb250YWluZXJQYXJlbnQsICdlIHBhcmVudCAzcmQnICk7XG5cbiAgLy8gY2xlYXIgY29udGFpbmVyXG4gIGUuY29udGFpbmVyVGFnTmFtZSA9IG51bGw7XG4gIGJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICk7IC8vIHJlZnJlc2ggdGhlIERPTSBFbGVtZW50c1xuICBjUGVlciA9IGMucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhOyAvLyByZWZyZXNoIHRoZSBET00gRWxlbWVudHNcbiAgZFBlZXIgPSBkLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITsgLy8gcmVmcmVzaCB0aGUgRE9NIEVsZW1lbnRzXG4gIGVQZWVyID0gZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciE7XG4gIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoID09PSA1LCAnZSBjaGlsZHJlbiBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIHNhbWUgUERPTSBsZXZlbCBhZ2Fpbi4nICk7XG4gIGNvbmZpcm1PcmlnaW5hbE9yZGVyKCk7XG4gIGNvbmZpcm1PcmlnaW5hbFdpdGhFKCk7XG5cbiAgLy8gcHJvcGVyIGRpc3Bvc2FsXG4gIGUuZGlzcG9zZSgpO1xuICBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApO1xuICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gMywgJ2UgY2hpbGRyZW4gc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkJyApO1xuICBhc3NlcnQub2soIGUucGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDAsICdlIGlzIGRpc3Bvc2VkJyApO1xuICBjb25maXJtT3JpZ2luYWxPcmRlcigpO1xuXG4gIC8vIHJlb3JkZXIgZCBjb3JyZWN0bHkgd2hlbiBjIHJlbW92ZWRcbiAgYi5yZW1vdmVDaGlsZCggYyApO1xuICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gMSwgJ2MgY2hpbGRyZW4gc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkLCBvbmx5IGQgY29udGFpbmVyJyApO1xuICBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApO1xuICBkUGVlciA9IGQucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhO1xuICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuWyAwIF0udGFnTmFtZSA9PT0gJ0RJVicsICdESVYgZmlyc3QnICk7XG4gIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW5bIDAgXSA9PT0gZFBlZXIuY29udGFpbmVyUGFyZW50LCAnZCBjb250YWluZXIgZmlyc3QnICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdwZG9tT3JkZXIgdGVzdHMnLCBhc3NlcnQgPT4ge1xuXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIHN3YXBWaXNpYmlsaXR5IGZ1bmN0aW9uXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBjb25zdCBmaXJzdENoaWxkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuICBjb25zdCBkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuXG4gIGNvbnN0IGFycmF5c0VxdWFsID0gKCBhOiAoIE5vZGUgfCBudWxsIClbXSwgYjogKCBOb2RlIHwgbnVsbCApW10gKSA9PiB7XG4gICAgcmV0dXJuIGEubGVuZ3RoID09PSBiLmxlbmd0aCAmJiBhLmV2ZXJ5KCAoIHZhbHVlLCBpbmRleCApID0+IHZhbHVlID09PSBiWyBpbmRleCBdICk7XG4gIH07XG5cbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGZpcnN0Q2hpbGQgKTtcbiAgZmlyc3RDaGlsZC5jaGlsZHJlbiA9IFsgYSwgYiwgYywgZCBdO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEJhc2ljIHNldHRlci9nZXR0ZXIgdGVzdHNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBwZG9tT3JkZXIgaXMgaW5pdGlhbGx5IG51bGxcbiAgYXNzZXJ0Lm9rKCBhLnBkb21PcmRlciA9PT0gbnVsbCwgJ3Bkb21PcmRlciBpcyBpbml0aWFsbHkgbnVsbCcgKTtcblxuICBjb25zdCBmaXJzdE9yZGVyID0gWyBjLCBhLCBkLCBiIF07XG5cbiAgLy8gc2V0IHRoZSBwZG9tT3JkZXJcbiAgZmlyc3RDaGlsZC5wZG9tT3JkZXIgPSBmaXJzdE9yZGVyO1xuICBhc3NlcnQub2soIGFycmF5c0VxdWFsKCBmaXJzdENoaWxkLnBkb21PcmRlciwgZmlyc3RPcmRlciApLCAncGRvbU9yZGVyIGlzIHNldCBjb3JyZWN0bHknICk7XG5cbiAgLy8gTmV3IG9yZGVyIHNob3VsZCBiZSBhcHBsaWVkXG4gIGNvbnN0IHNlY29uZE9yZGVyID0gWyBhLCBiLCBjLCBkIF07XG4gIGZpcnN0Q2hpbGQucGRvbU9yZGVyID0gc2Vjb25kT3JkZXI7XG4gIGFzc2VydC5vayggYXJyYXlzRXF1YWwoIGZpcnN0Q2hpbGQucGRvbU9yZGVyLCBzZWNvbmRPcmRlciApLCAncGRvbU9yZGVyIGlzIHNldCBjb3JyZWN0bHknICk7XG5cbiAgLy8gVHJ5IHByb3ZpZGluZyB0aGUgc2FtZSBpbnN0YW5jZSBvZiBhbiBhcnJheSB0byBwZG9tT3JkZXJcbiAgY29uc3QgdGhpcmRPcmRlciA9IGZpcnN0Q2hpbGQucGRvbU9yZGVyO1xuICBjb25zdCBlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuICB0aGlyZE9yZGVyLnNwbGljZSggMSwgMCwgZSApO1xuICBmaXJzdENoaWxkLnBkb21PcmRlciA9IHRoaXJkT3JkZXI7XG4gIGFzc2VydC5vayggYXJyYXlzRXF1YWwoIGZpcnN0Q2hpbGQucGRvbU9yZGVyLCB0aGlyZE9yZGVyICksICdwZG9tT3JkZXIgaXMgc2V0IGNvcnJlY3RseScgKTtcblxuICAvLyBUcnkgcmVtb3ZpbmcgYW4gZWxlbWVudCBmcm9tIHRoZSBwZG9tT3JkZXJcbiAgY29uc3QgZm91cnRoT3JkZXIgPSBmaXJzdENoaWxkLnBkb21PcmRlci5zcGxpY2UoIDEsIDEgKTtcbiAgZmlyc3RDaGlsZC5wZG9tT3JkZXIgPSBmb3VydGhPcmRlcjtcbiAgYXNzZXJ0Lm9rKCBhcnJheXNFcXVhbCggZmlyc3RDaGlsZC5wZG9tT3JkZXIsIGZvdXJ0aE9yZGVyICksICdwZG9tT3JkZXIgaXMgc2V0IGNvcnJlY3RseScgKTtcblxuICAvLyBDbGVhciB0aGUgcGRvbU9yZGVyXG4gIGZpcnN0Q2hpbGQucGRvbU9yZGVyID0gbnVsbDtcbiAgYXNzZXJ0Lm9rKCBmaXJzdENoaWxkLnBkb21PcmRlciA9PT0gbnVsbCwgJ3Bkb21PcmRlciBpcyBjbGVhcmVkJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGRpc3Bvc2luZyBhIE5vZGUgc2hvdWxkIHJlbW92ZSBpdCBmcm9tIGFueSBwZG9tT3JkZXJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gVGhlc2UgTm9kZXMgYXJlIG5hbWVkIGJhc2VkIG9uIHRoZWlyIHBsYWNlIGluIHBkb21PcmRlciAtIGFsbCB3aWxsIGJlIGNoaWxkcmVuIG9mIGZpcnN0Q2hpbGRcbiAgY29uc3QgcGFyZW50ID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGxhYmVsQ29udGVudDogJ3BhcmVudCcgfSApO1xuICBjb25zdCBjaGlsZDEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgbGFiZWxDb250ZW50OiAnY2hpbGQxJyB9ICk7XG4gIGNvbnN0IGNoaWxkMiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBsYWJlbENvbnRlbnQ6ICdjaGlsZDInIH0gKTtcbiAgY29uc3QgZ3JhbmRjaGlsZDEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgbGFiZWxDb250ZW50OiAnZ3JhbmRjaGlsZDEnIH0gKTtcbiAgY29uc3QgZ3JhbmRjaGlsZDIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgbGFiZWxDb250ZW50OiAnZ3JhbmRjaGlsZDInIH0gKTtcbiAgZmlyc3RDaGlsZC5jaGlsZHJlbiA9IFsgcGFyZW50LCBjaGlsZDEsIGNoaWxkMiwgZ3JhbmRjaGlsZDEsIGdyYW5kY2hpbGQyIF07XG5cbiAgLy8gU2V0dXAgbmVzdGVkIHBkb21PcmRlcnNcbiAgcGFyZW50LnBkb21PcmRlciA9IFsgY2hpbGQxLCBjaGlsZDIgXTtcbiAgY2hpbGQxLnBkb21PcmRlciA9IFsgZ3JhbmRjaGlsZDEgXTtcbiAgY2hpbGQyLnBkb21PcmRlciA9IFsgZ3JhbmRjaGlsZDIgXTtcblxuICAvLyBWZXJpZnkgaW5pdGlhbCBwZG9tT3JkZXIgc2V0dXBcbiAgYXNzZXJ0Lm9rKCBhcnJheXNFcXVhbCggcGFyZW50LnBkb21PcmRlciwgWyBjaGlsZDEsIGNoaWxkMiBdICksICdwYXJlbnQgcGRvbU9yZGVyIGlzIHNldCBjb3JyZWN0bHknICk7XG4gIGFzc2VydC5vayggYXJyYXlzRXF1YWwoIGNoaWxkMS5wZG9tT3JkZXIsIFsgZ3JhbmRjaGlsZDEgXSApLCAnY2hpbGQxIHBkb21PcmRlciBpcyBzZXQgY29ycmVjdGx5JyApO1xuICBhc3NlcnQub2soIGFycmF5c0VxdWFsKCBjaGlsZDIucGRvbU9yZGVyLCBbIGdyYW5kY2hpbGQyIF0gKSwgJ2NoaWxkMiBwZG9tT3JkZXIgaXMgc2V0IGNvcnJlY3RseScgKTtcblxuICAvLyBEaXNwb3NlIGEgZ3JhbmRjaGlsZCBhbmQgdmVyaWZ5IGNoYW5nZXMgcHJvcGFnYXRlIGNvcnJlY3RseVxuICBncmFuZGNoaWxkMS5kaXNwb3NlKCk7XG4gIGFzc2VydC5vayggYXJyYXlzRXF1YWwoIGNoaWxkMS5wZG9tT3JkZXIsIFtdICksICdjaGlsZDEgcGRvbU9yZGVyIGlzIHVwZGF0ZWQgd2hlbiBncmFuZGNoaWxkMSBpcyBkaXNwb3NlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBhcnJheXNFcXVhbCggcGFyZW50LnBkb21PcmRlciwgWyBjaGlsZDEsIGNoaWxkMiBdICksICdwYXJlbnQgcGRvbU9yZGVyIHJlbWFpbnMgdW5jaGFuZ2VkIHdoZW4gZ3JhbmRjaGlsZDEgaXMgZGlzcG9zZWQnICk7XG5cbiAgLy8gRGlzcG9zZSBhIGNoaWxkIGFuZCB2ZXJpZnkgY2hhbmdlcyBwcm9wYWdhdGUgdG8gcGFyZW50XG4gIGNoaWxkMi5kaXNwb3NlKCk7XG4gIGFzc2VydC5vayggYXJyYXlzRXF1YWwoIHBhcmVudC5wZG9tT3JkZXIsIFsgY2hpbGQxIF0gKSwgJ3BhcmVudCBwZG9tT3JkZXIgaXMgdXBkYXRlZCB3aGVuIGNoaWxkMiBpcyBkaXNwb3NlZCcgKTtcbiAgY29uc3QgcGFyZW50UGVlciA9IGdldFBET01QZWVyQnlOb2RlKCBwYXJlbnQgKTtcbiAgYXNzZXJ0Lm9rKCBwYXJlbnRQZWVyLnByaW1hcnlTaWJsaW5nIS5jaGlsZHJlbi5sZW5ndGggPT09IDIsICdjaGlsZDIgd2FzIGRpc3Bvc2VkLCBzbyBvbmx5IGNoaWxkMSBsYWJlbC9wcmltYXJ5IGFyZSBsZWZ0JyApO1xuXG4gIC8vIERpc3Bvc2UgdGhlIHJlbWFpbmluZyBjaGlsZCB0byBjaGVjayB0aGUgcGFyZW50IHBkb21PcmRlclxuICBjaGlsZDEuZGlzcG9zZSgpO1xuICBhc3NlcnQub2soIGFycmF5c0VxdWFsKCBwYXJlbnQucGRvbU9yZGVyLCBbXSApLCAncGFyZW50IHBkb21PcmRlciBpcyBlbXB0eSB3aGVuIGJvdGggY2hpbGRyZW4gYXJlIGRpc3Bvc2VkJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIERvbmUgd2l0aCB0aGlzIHRlc3RzLCBjbGVhbiB1cFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ2Rlc2NyaXB0aW9uVGFnTmFtZS9kZXNjcmlwdGlvbkNvbnRlbnQgb3B0aW9uJywgYXNzZXJ0ID0+IHtcblxuICAvLyB0ZXN0IHRoZSBiZWhhdmlvciBvZiBzd2FwVmlzaWJpbGl0eSBmdW5jdGlvblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgLy8gY3JlYXRlIHNvbWUgbm9kZXMgZm9yIHRlc3RpbmdcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBkZXNjcmlwdGlvbkNvbnRlbnQ6IFRFU1RfREVTQ1JJUFRJT04gfSApO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG5cbiAgY29uc3QgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcbiAgY29uc3QgZGVzY3JpcHRpb25TaWJsaW5nID0gYUVsZW1lbnQucGFyZW50RWxlbWVudCEuY2hpbGROb2Rlc1sgMCBdIGFzIEhUTUxFbGVtZW50O1xuICBhc3NlcnQub2soIGEucGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDEsICdvbmx5IDEgaW5zdGFuY2UnICk7XG4gIGFzc2VydC5vayggYUVsZW1lbnQucGFyZW50RWxlbWVudCEuY2hpbGROb2Rlcy5sZW5ndGggPT09IDIsICdwYXJlbnQgY29udGFpbnMgdHdvIHNpYmxpbmdzJyApO1xuICBhc3NlcnQub2soIGRlc2NyaXB0aW9uU2libGluZy50YWdOYW1lID09PSBERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FLCAnZGVmYXVsdCBsYWJlbCB0YWdOYW1lJyApO1xuICBhc3NlcnQub2soIGRlc2NyaXB0aW9uU2libGluZy50ZXh0Q29udGVudCA9PT0gVEVTVF9ERVNDUklQVElPTiwgJ25vIGh0bWwgc2hvdWxkIHVzZSB0ZXh0Q29udGVudCcgKTtcblxuICBhLmRlc2NyaXB0aW9uQ29udGVudCA9IFRFU1RfREVTQ1JJUFRJT05fSFRNTDtcbiAgYXNzZXJ0Lm9rKCBkZXNjcmlwdGlvblNpYmxpbmcuaW5uZXJIVE1MID09PSBURVNUX0RFU0NSSVBUSU9OX0hUTUwsICdodG1sIGxhYmVsIHNob3VsZCB1c2UgaW5uZXJIVE1MJyApO1xuXG4gIGEuZGVzY3JpcHRpb25Db250ZW50ID0gbnVsbDtcbiAgYXNzZXJ0Lm9rKCBkZXNjcmlwdGlvblNpYmxpbmcuaW5uZXJIVE1MID09PSAnJywgJ2Rlc2NyaXB0aW9uIGNvbnRlbnQgc2hvdWxkIGJlIGNsZWFyZWQnICk7XG5cbiAgYS5kZXNjcmlwdGlvbkNvbnRlbnQgPSBURVNUX0RFU0NSSVBUSU9OX0hUTUxfMjtcbiAgYXNzZXJ0Lm9rKCBkZXNjcmlwdGlvblNpYmxpbmcuaW5uZXJIVE1MID09PSBURVNUX0RFU0NSSVBUSU9OX0hUTUxfMiwgJ2h0bWwgbGFiZWwgc2hvdWxkIHVzZSBpbm5lckhUTUwsIG92ZXJ3cml0ZSBmcm9tIGh0bWwnICk7XG5cbiAgYS5kZXNjcmlwdGlvblRhZ05hbWUgPSBudWxsO1xuXG4gIC8vIG1ha2Ugc3VyZSBkZXNjcmlwdGlvbiB3YXMgY2xlYXJlZCBmcm9tIFBET01cbiAgYXNzZXJ0Lm9rKCBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKS5wYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSxcbiAgICAnT25seSBvbmUgZWxlbWVudCBhZnRlciBjbGVhcmluZyBkZXNjcmlwdGlvbicgKTtcblxuICBhc3NlcnQub2soIGEuZGVzY3JpcHRpb25Db250ZW50ID09PSBURVNUX0RFU0NSSVBUSU9OX0hUTUxfMiwgJ2NsZWFyaW5nIGRlc2NyaXB0aW9uVGFnTmFtZSBzaG91bGQgbm90IGNoYW5nZSBjb250ZW50LCBldmVuICB0aG91Z2ggaXQgaXMgbm90IGRpc3BsYXllZCcgKTtcblxuICBhc3NlcnQub2soIGEuZGVzY3JpcHRpb25UYWdOYW1lID09PSBudWxsLCAnZXhwZWN0IGRlc2NyaXB0aW9uVGFnTmFtZSBzZXR0ZXIgdG8gd29yay4nICk7XG5cbiAgYS5kZXNjcmlwdGlvblRhZ05hbWUgPSAncCc7XG4gIGFzc2VydC5vayggYS5kZXNjcmlwdGlvblRhZ05hbWUgPT09ICdwJywgJ2V4cGVjdCBkZXNjcmlwdGlvblRhZ05hbWUgc2V0dGVyIHRvIHdvcmsuJyApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxufSApO1xuXG5RVW5pdC50ZXN0KCAnUGFyYWxsZWxET00gb3B0aW9ucycsIGFzc2VydCA9PiB7XG5cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSgpO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAvLyB0ZXN0IHNldHRpbmcgb2YgYWNjZXNzaWJsZSBjb250ZW50IHRocm91Z2ggb3B0aW9uc1xuICBjb25zdCBidXR0b25Ob2RlID0gbmV3IE5vZGUoIHtcbiAgICBmb2N1c0hpZ2hsaWdodDogbmV3IENpcmNsZSggNSApLFxuICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnLCAvLyBjb250YWluZWQgaW4gcGFyZW50IGVsZW1lbnQgJ2RpdidcbiAgICB0YWdOYW1lOiAnaW5wdXQnLCAvLyBkb20gZWxlbWVudCB3aXRoIHRhZyBuYW1lICdpbnB1dCdcbiAgICBpbnB1dFR5cGU6ICdidXR0b24nLCAvLyBpbnB1dCB0eXBlICdidXR0b24nXG4gICAgbGFiZWxUYWdOYW1lOiAnbGFiZWwnLCAvLyBsYWJlbCB3aXRoIHRhZ25hbWUgJ2xhYmVsJ1xuICAgIGxhYmVsQ29udGVudDogVEVTVF9MQUJFTCwgLy8gbGFiZWwgdGV4dCBjb250ZW50XG4gICAgZGVzY3JpcHRpb25Db250ZW50OiBURVNUX0RFU0NSSVBUSU9OLCAvLyBkZXNjcmlwdGlvbiB0ZXh0IGNvbnRlbnRcbiAgICBmb2N1c2FibGU6IGZhbHNlLCAvLyByZW1vdmUgZnJvbSBmb2N1cyBvcmRlclxuICAgIGFyaWFSb2xlOiAnYnV0dG9uJyAvLyB1c2VzIHRoZSBBUklBIGJ1dHRvbiByb2xlXG4gIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGJ1dHRvbk5vZGUgKTtcblxuICBjb25zdCBkaXZOb2RlID0gbmV3IE5vZGUoIHtcbiAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICBhcmlhTGFiZWw6IFRFU1RfTEFCRUwsIC8vIHVzZSBBUklBIGxhYmVsIGF0dHJpYnV0ZVxuICAgIHBkb21WaXNpYmxlOiBmYWxzZSwgLy8gaGlkZGVuIGZyb20gc2NyZWVuIHJlYWRlcnMgKGFuZCBicm93c2VyKVxuICAgIGRlc2NyaXB0aW9uQ29udGVudDogVEVTVF9ERVNDUklQVElPTiwgLy8gZGVmYXVsdCB0byBhIDxwPiB0YWdcbiAgICBjb250YWluZXJUYWdOYW1lOiAnZGl2J1xuICB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBkaXZOb2RlICk7XG5cbiAgLy8gdmVyaWZ5IHRoYXQgc2V0dGVycyBhbmQgZ2V0dGVycyB3b3JrZWQgY29ycmVjdGx5XG4gIGFzc2VydC5vayggYnV0dG9uTm9kZS5sYWJlbFRhZ05hbWUgPT09ICdsYWJlbCcsICdMYWJlbCB0YWcgbmFtZScgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25Ob2RlLmNvbnRhaW5lclRhZ05hbWUgPT09ICdkaXYnLCAnY29udGFpbmVyIHRhZyBuYW1lJyApO1xuICBhc3NlcnQub2soIGJ1dHRvbk5vZGUubGFiZWxDb250ZW50ID09PSBURVNUX0xBQkVMLCAnQWNjZXNzaWJsZSBsYWJlbCcgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25Ob2RlLmRlc2NyaXB0aW9uVGFnTmFtZSEudG9VcHBlckNhc2UoKSA9PT0gREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSwgJ0Rlc2NyaXB0aW9uIHRhZyBuYW1lJyApO1xuICBhc3NlcnQuZXF1YWwoIGJ1dHRvbk5vZGUuZm9jdXNhYmxlLCBmYWxzZSwgJ0ZvY3VzYWJsZScgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25Ob2RlLmFyaWFSb2xlID09PSAnYnV0dG9uJywgJ0FyaWEgcm9sZScgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25Ob2RlLmRlc2NyaXB0aW9uQ29udGVudCA9PT0gVEVTVF9ERVNDUklQVElPTiwgJ0FjY2Vzc2libGUgRGVzY3JpcHRpb24nICk7XG4gIGFzc2VydC5vayggYnV0dG9uTm9kZS5mb2N1c0hpZ2hsaWdodCBpbnN0YW5jZW9mIENpcmNsZSwgJ0ZvY3VzIGhpZ2hsaWdodCcgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25Ob2RlLnRhZ05hbWUgPT09ICdpbnB1dCcsICdUYWcgbmFtZScgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25Ob2RlLmlucHV0VHlwZSA9PT0gJ2J1dHRvbicsICdJbnB1dCB0eXBlJyApO1xuXG4gIGFzc2VydC5vayggZGl2Tm9kZS50YWdOYW1lID09PSAnZGl2JywgJ1RhZyBuYW1lJyApO1xuICBhc3NlcnQub2soIGRpdk5vZGUuYXJpYUxhYmVsID09PSBURVNUX0xBQkVMLCAnVXNlIGFyaWEgbGFiZWwnICk7XG4gIGFzc2VydC5lcXVhbCggZGl2Tm9kZS5wZG9tVmlzaWJsZSwgZmFsc2UsICdwZG9tIHZpc2libGUnICk7XG4gIGFzc2VydC5vayggZGl2Tm9kZS5sYWJlbFRhZ05hbWUgPT09IG51bGwsICdMYWJlbCB0YWcgbmFtZSB3aXRoIGFyaWEgbGFiZWwgaXMgaW5kZXBlbmRlbnQnICk7XG4gIGFzc2VydC5vayggZGl2Tm9kZS5kZXNjcmlwdGlvblRhZ05hbWUhLnRvVXBwZXJDYXNlKCkgPT09IERFRkFVTFRfREVTQ1JJUFRJT05fVEFHX05BTUUsICdEZXNjcmlwdGlvbiB0YWcgbmFtZScgKTtcblxuICAvLyB2ZXJpZnkgRE9NIHN0cnVjdHVyZSAtIG9wdGlvbnMgYWJvdmUgc2hvdWxkIGNyZWF0ZSBzb21ldGhpbmcgbGlrZTpcbiAgLy8gPGRpdiBpZD1cImRpc3BsYXktcm9vdFwiPlxuICAvLyAgPGRpdiBpZD1cInBhcmVudC1jb250YWluZXItaWRcIj5cbiAgLy8gICAgPGxhYmVsIGZvcj1cImlkXCI+VGVzdCBMYWJlbDwvbGFiZWw+XG4gIC8vICAgIDxwPkRlc2NyaXB0aW9uPlRlc3QgRGVzY3JpcHRpb248L3A+XG4gIC8vICAgIDxpbnB1dCB0eXBlPSdidXR0b24nIHJvbGU9J2J1dHRvbicgdGFiaW5kZXg9XCItMVwiIGlkPWlkPlxuICAvLyAgPC9kaXY+XG4gIC8vXG4gIC8vICA8ZGl2IGFyaWEtbGFiZWw9XCJUZXN0IExhYmVsXCIgaGlkZGVuIGFyaWEtbGFiZWxsZWRCeT1cImJ1dHRvbi1ub2RlLWlkXCIgYXJpYS1kZXNjcmliZWRieT0nYnV0dG9uLW5vZGUtaWQnPlxuICAvLyAgICA8cD5UZXN0IERlc2NyaXB0aW9uPC9wPlxuICAvLyAgPC9kaXY+XG4gIC8vIDwvZGl2PlxuICBwZG9tQXVkaXRSb290Tm9kZSggcm9vdE5vZGUgKTtcbiAgbGV0IGJ1dHRvbkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGJ1dHRvbk5vZGUgKTtcblxuICBjb25zdCBidXR0b25QYXJlbnQgPSBidXR0b25FbGVtZW50LnBhcmVudE5vZGUhIGFzIEhUTUxFbGVtZW50O1xuICBjb25zdCBidXR0b25QZWVycyA9IGJ1dHRvblBhcmVudC5jaGlsZE5vZGVzIGFzIHVua25vd24gYXMgSFRNTEVsZW1lbnRbXTtcbiAgY29uc3QgYnV0dG9uTGFiZWwgPSBidXR0b25QZWVyc1sgMCBdO1xuICBjb25zdCBidXR0b25EZXNjcmlwdGlvbiA9IGJ1dHRvblBlZXJzWyAxIF07XG4gIGNvbnN0IGRpdkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGRpdk5vZGUgKTtcbiAgY29uc3QgcERlc2NyaXB0aW9uID0gZGl2RWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzWyAwIF07IC8vIGRlc2NyaXB0aW9uIGJlZm9yZSBwcmltYXJ5IGRpdlxuXG4gIGFzc2VydC5vayggYnV0dG9uUGFyZW50LnRhZ05hbWUgPT09ICdESVYnLCAncGFyZW50IGNvbnRhaW5lcicgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25MYWJlbC50YWdOYW1lID09PSAnTEFCRUwnLCAnTGFiZWwgZmlyc3QnICk7XG4gIGFzc2VydC5vayggYnV0dG9uTGFiZWwuZ2V0QXR0cmlidXRlKCAnZm9yJyApID09PSBidXR0b25FbGVtZW50LmlkLCAnbGFiZWwgZm9yIGF0dHJpYnV0ZScgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25MYWJlbC50ZXh0Q29udGVudCA9PT0gVEVTVF9MQUJFTCwgJ2xhYmVsIGNvbnRlbnQnICk7XG4gIGFzc2VydC5vayggYnV0dG9uRGVzY3JpcHRpb24udGFnTmFtZSA9PT0gREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSwgJ2Rlc2NyaXB0aW9uIHNlY29uZCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBidXR0b25EZXNjcmlwdGlvbi50ZXh0Q29udGVudCwgVEVTVF9ERVNDUklQVElPTiwgJ2Rlc2NyaXB0aW9uIGNvbnRlbnQnICk7XG4gIGFzc2VydC5vayggYnV0dG9uUGVlcnNbIDIgXSA9PT0gYnV0dG9uRWxlbWVudCwgJ0J1dHRvbiB0aGlyZCcgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25FbGVtZW50LmdldEF0dHJpYnV0ZSggJ3R5cGUnICkgPT09ICdidXR0b24nLCAnaW5wdXQgdHlwZSBzZXQnICk7XG4gIGFzc2VydC5vayggYnV0dG9uRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdyb2xlJyApID09PSAnYnV0dG9uJywgJ2J1dHRvbiByb2xlIHNldCcgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25FbGVtZW50LnRhYkluZGV4ID09PSAtMSwgJ25vdCBmb2N1c2FibGUnICk7XG5cbiAgYXNzZXJ0Lm9rKCBkaXZFbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnICkgPT09IFRFU1RfTEFCRUwsICdhcmlhIGxhYmVsIHNldCcgKTtcbiAgYXNzZXJ0Lm9rKCBkaXZFbGVtZW50LnBhcmVudEVsZW1lbnQhLmhpZGRlbiwgJ2hpZGRlbiBzZXQgc2hvdWxkIGFjdCBvbiBwYXJlbnQnICk7XG4gIGFzc2VydC5vayggcERlc2NyaXB0aW9uLnRleHRDb250ZW50ID09PSBURVNUX0RFU0NSSVBUSU9OLCAnZGVzY3JpcHRpb24gY29udGVudCcgKTtcbiAgYXNzZXJ0Lm9rKCBwRGVzY3JpcHRpb24ucGFyZW50RWxlbWVudCA9PT0gZGl2RWxlbWVudC5wYXJlbnRFbGVtZW50LCAnZGVzY3JpcHRpb24gaXMgc2libGluZyB0byBwcmltYXJ5JyApO1xuICBhc3NlcnQub2soIGRpdkVsZW1lbnQucGFyZW50RWxlbWVudCEuY2hpbGROb2Rlcy5sZW5ndGggPT09IDIsICdubyBsYWJlbCBlbGVtZW50IGZvciBhcmlhLWxhYmVsLCBqdXN0IGRlc2NyaXB0aW9uIGFuZCBwcmltYXJ5IHNpYmxpbmdzJyApO1xuXG4gIC8vIGNsZWFyIHZhbHVlc1xuICBidXR0b25Ob2RlLmlucHV0VHlwZSA9IG51bGw7XG4gIGJ1dHRvbkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGJ1dHRvbk5vZGUgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25FbGVtZW50LmdldEF0dHJpYnV0ZSggJ3R5cGUnICkgPT09IG51bGwsICdpbnB1dCB0eXBlIGNsZWFyZWQnICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG59ICk7XG5cbi8vIHRlc3RzIGZvciBhcmlhLWxhYmVsbGVkYnkgYW5kIGFyaWEtZGVzY3JpYmVkYnkgc2hvdWxkIGJlIHRoZSBzYW1lLCBzaW5jZSBib3RoIHN1cHBvcnQgdGhlIHNhbWUgZmVhdHVyZSBzZXRcbmZ1bmN0aW9uIHRlc3RBc3NvY2lhdGlvbkF0dHJpYnV0ZSggYXNzZXJ0OiBBc3NlcnQsIGF0dHJpYnV0ZTogc3RyaW5nICk6IHZvaWQge1xuXG4gIC8vIHVzZSBhIGRpZmZlcmVudCBzZXR0ZXIgZGVwZW5kaW5nIG9uIGlmIHRlc3RpbmcgbGFiZWxsZWRieSBvciBkZXNjcmliZWRieVxuICBjb25zdCBhZGRBc3NvY2lhdGlvbkZ1bmN0aW9uID0gYXR0cmlidXRlID09PSAnYXJpYS1sYWJlbGxlZGJ5JyA/ICdhZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUgPT09ICdhcmlhLWRlc2NyaWJlZGJ5JyA/ICdhZGRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbicgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlID09PSAnYXJpYS1hY3RpdmVkZXNjZW5kYW50JyA/ICdhZGRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG5cbiAgaWYgKCAhYWRkQXNzb2NpYXRpb25GdW5jdGlvbiApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdpbmNvcnJlY3QgYXR0cmlidXRlIG5hbWUgd2hpbGUgaW4gdGVzdEFzc29jaWF0aW9uQXR0cmlidXRlJyApO1xuICB9XG5cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSgpO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAvLyB0d28gbmV3IG5vZGVzIHRoYXQgd2lsbCBiZSByZWxhdGVkIHdpdGggdGhlIGFyaWEtbGFiZWxsZWRieSBhbmQgYXJpYS1kZXNjcmliZWRieSBhc3NvY2lhdGlvbnNcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBsYWJlbFRhZ05hbWU6ICdwJywgZGVzY3JpcHRpb25UYWdOYW1lOiAncCcgfSApO1xuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ3AnLCBpbm5lckNvbnRlbnQ6IFRFU1RfTEFCRUxfMiB9ICk7XG4gIHJvb3ROb2RlLmNoaWxkcmVuID0gWyBhLCBiIF07XG5cbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgYS5zZXRQRE9NQXR0cmlidXRlKCBhdHRyaWJ1dGUsICdoZWxsbycgKTtcbiAgfSwgLy4qLywgJ2Nhbm5vdCBzZXQgYXNzb2NpYXRpb24gYXR0cmlidXRlcyB3aXRoIHNldFBET01BdHRyaWJ1dGUnICk7XG5cbiAgYVsgYWRkQXNzb2NpYXRpb25GdW5jdGlvbiBdKCB7XG4gICAgb3RoZXJOb2RlOiBiLFxuICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxuICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElOR1xuICB9ICk7XG5cbiAgbGV0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGxldCBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApO1xuICBhc3NlcnQub2soIGFFbGVtZW50LmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICkhLmluY2x1ZGVzKCBiRWxlbWVudC5pZCApLCBgJHthdHRyaWJ1dGV9IGZvciBvbmUgbm9kZS5gICk7XG5cbiAgY29uc3QgYyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBpbm5lckNvbnRlbnQ6IFRFU1RfTEFCRUwgfSApO1xuICByb290Tm9kZS5hZGRDaGlsZCggYyApO1xuXG4gIGFbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xuICAgIG90aGVyTm9kZTogYyxcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcbiAgfSApO1xuXG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICk7XG4gIGxldCBjRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYyApO1xuICBjb25zdCBleHBlY3RlZFZhbHVlID0gWyBiRWxlbWVudC5pZCwgY0VsZW1lbnQuaWQgXS5qb2luKCAnICcgKTtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApID09PSBleHBlY3RlZFZhbHVlLCBgJHthdHRyaWJ1dGV9IHR3byBub2Rlc2AgKTtcblxuICAvLyBNYWtlIGMgaW52YWxpZGF0ZVxuICByb290Tm9kZS5yZW1vdmVDaGlsZCggYyApO1xuICByb290Tm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYyBdIH0gKSApO1xuXG4gIGNvbnN0IG9sZFZhbHVlID0gZXhwZWN0ZWRWYWx1ZTtcblxuICBhRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApO1xuICBjRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYyApO1xuXG4gIGFzc2VydC5vayggYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSAhPT0gb2xkVmFsdWUsICdzaG91bGQgaGF2ZSBpbnZhbGlkYXRlZCBvbiB0cmVlIGNoYW5nZScgKTtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApID09PSBbIGJFbGVtZW50LmlkLCBjRWxlbWVudC5pZCBdLmpvaW4oICcgJyApLFxuICAgICdzaG91bGQgaGF2ZSBpbnZhbGlkYXRlZCBvbiB0cmVlIGNoYW5nZScgKTtcblxuICBjb25zdCBkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGRlc2NyaXB0aW9uVGFnTmFtZTogJ3AnLCBpbm5lckNvbnRlbnQ6IFRFU1RfTEFCRUwsIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGQgKTtcblxuICBiWyBhZGRBc3NvY2lhdGlvbkZ1bmN0aW9uIF0oIHtcbiAgICBvdGhlck5vZGU6IGQsXG4gICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5DT05UQUlORVJfUEFSRU5ULFxuICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkRFU0NSSVBUSU9OX1NJQkxJTkdcbiAgfSApO1xuICBiLmNvbnRhaW5lclRhZ05hbWUgPSAnZGl2JztcblxuICBjb25zdCBiUGFyZW50Q29udGFpbmVyID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkucGFyZW50RWxlbWVudCE7XG4gIGNvbnN0IGREZXNjcmlwdGlvbkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGQgKS5wYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzWyAwIF0gYXMgSFRNTEVsZW1lbnQ7XG4gIGFzc2VydC5vayggYlBhcmVudENvbnRhaW5lci5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApICE9PSBvbGRWYWx1ZSwgJ3Nob3VsZCBoYXZlIGludmFsaWRhdGVkIG9uIHRyZWUgY2hhbmdlJyApO1xuICBhc3NlcnQub2soIGJQYXJlbnRDb250YWluZXIuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gZERlc2NyaXB0aW9uRWxlbWVudC5pZCxcbiAgICBgYiBwYXJlbnQgY29udGFpbmVyIGVsZW1lbnQgaXMgJHthdHRyaWJ1dGV9IGQgZGVzY3JpcHRpb24gc2libGluZ2AgKTtcblxuICAvLyBzYXkgd2UgaGF2ZSBhIHNjZW5lIGdyYXBoIHRoYXQgbG9va3MgbGlrZTpcbiAgLy8gICAgZVxuICAvLyAgICAgXFxcbiAgLy8gICAgICBmXG4gIC8vICAgICAgIFxcXG4gIC8vICAgICAgICBnXG4gIC8vICAgICAgICAgXFxcbiAgLy8gICAgICAgICAgaFxuICAvLyB3ZSB3YW50IHRvIG1ha2Ugc3VyZVxuICBjb25zdCBlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBmID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBnID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBoID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBlLmFkZENoaWxkKCBmICk7XG4gIGYuYWRkQ2hpbGQoIGcgKTtcbiAgZy5hZGRDaGlsZCggaCApO1xuICByb290Tm9kZS5hZGRDaGlsZCggZSApO1xuXG4gIGVbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xuICAgIG90aGVyTm9kZTogZixcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcbiAgfSApO1xuXG4gIGZbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xuICAgIG90aGVyTm9kZTogZyxcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcbiAgfSApO1xuXG4gIGdbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xuICAgIG90aGVyTm9kZTogaCxcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcbiAgfSApO1xuXG4gIGxldCBlRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggZSApO1xuICBsZXQgZkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGYgKTtcbiAgbGV0IGdFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBnICk7XG4gIGxldCBoRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggaCApO1xuICBhc3NlcnQub2soIGVFbGVtZW50LmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICkgPT09IGZFbGVtZW50LmlkLCBgZUVsZW1lbnQgc2hvdWxkIGJlICR7YXR0cmlidXRlfSBmRWxlbWVudGAgKTtcbiAgYXNzZXJ0Lm9rKCBmRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApID09PSBnRWxlbWVudC5pZCwgYGZFbGVtZW50IHNob3VsZCBiZSAke2F0dHJpYnV0ZX0gZ0VsZW1lbnRgICk7XG4gIGFzc2VydC5vayggZ0VsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gaEVsZW1lbnQuaWQsIGBnRWxlbWVudCBzaG91bGQgYmUgJHthdHRyaWJ1dGV9IGhFbGVtZW50YCApO1xuXG4gIC8vIHJlLWFycmFuZ2UgdGhlIHNjZW5lIGdyYXBoIGFuZCBtYWtlIHN1cmUgdGhhdCB0aGUgYXR0cmlidXRlIGlkcyByZW1haW4gdXAgdG8gZGF0ZVxuICAvLyAgICBlXG4gIC8vICAgICBcXFxuICAvLyAgICAgIGhcbiAgLy8gICAgICAgXFxcbiAgLy8gICAgICAgIGdcbiAgLy8gICAgICAgICBcXFxuICAvLyAgICAgICAgICBmXG4gIGUucmVtb3ZlQ2hpbGQoIGYgKTtcbiAgZi5yZW1vdmVDaGlsZCggZyApO1xuICBnLnJlbW92ZUNoaWxkKCBoICk7XG5cbiAgZS5hZGRDaGlsZCggaCApO1xuICBoLmFkZENoaWxkKCBnICk7XG4gIGcuYWRkQ2hpbGQoIGYgKTtcbiAgZUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGUgKTtcbiAgZkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGYgKTtcbiAgZ0VsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGcgKTtcbiAgaEVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGggKTtcbiAgYXNzZXJ0Lm9rKCBlRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApID09PSBmRWxlbWVudC5pZCwgYGVFbGVtZW50IHNob3VsZCBzdGlsbCBiZSAke2F0dHJpYnV0ZX0gZkVsZW1lbnRgICk7XG4gIGFzc2VydC5vayggZkVsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gZ0VsZW1lbnQuaWQsIGBmRWxlbWVudCBzaG91bGQgc3RpbGwgYmUgJHthdHRyaWJ1dGV9IGdFbGVtZW50YCApO1xuICBhc3NlcnQub2soIGdFbGVtZW50LmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICkgPT09IGhFbGVtZW50LmlkLCBgZ0VsZW1lbnQgc2hvdWxkIHN0aWxsIGJlICR7YXR0cmlidXRlfSBoRWxlbWVudGAgKTtcblxuICAvLyB0ZXN0IGFyaWEgbGFiZWxsZWQgYnkgeW91ciBzZWxmLCBidXQgYSBkaWZmZXJlbnQgcGVlciBFbGVtZW50LCBtdWx0aXBsZSBhdHRyaWJ1dGUgaWRzIGluY2x1ZGVkIGluIHRoZSB0ZXN0LlxuICBjb25zdCBjb250YWluZXJUYWdOYW1lID0gJ2Rpdic7XG4gIGNvbnN0IGogPSBuZXcgTm9kZSgge1xuICAgIHRhZ05hbWU6ICdidXR0b24nLFxuICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcbiAgICBkZXNjcmlwdGlvblRhZ05hbWU6ICdwJyxcbiAgICBjb250YWluZXJUYWdOYW1lOiBjb250YWluZXJUYWdOYW1lXG4gIH0gKTtcbiAgcm9vdE5vZGUuY2hpbGRyZW4gPSBbIGogXTtcblxuICBqWyBhZGRBc3NvY2lhdGlvbkZ1bmN0aW9uIF0oIHtcbiAgICBvdGhlck5vZGU6IGosXG4gICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkcsXG4gICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuTEFCRUxfU0lCTElOR1xuICB9ICk7XG5cbiAgalsgYWRkQXNzb2NpYXRpb25GdW5jdGlvbiBdKCB7XG4gICAgb3RoZXJOb2RlOiBqLFxuICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVCxcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5ERVNDUklQVElPTl9TSUJMSU5HXG4gIH0gKTtcblxuICBqWyBhZGRBc3NvY2lhdGlvbkZ1bmN0aW9uIF0oIHtcbiAgICBvdGhlck5vZGU6IGosXG4gICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5DT05UQUlORVJfUEFSRU5ULFxuICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkdcbiAgfSApO1xuXG4gIGNvbnN0IGNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zID0gKCBub2RlOiBOb2RlICkgPT4ge1xuXG4gICAgY29uc3QgaW5zdGFuY2UgPSBub2RlWyAnX3Bkb21JbnN0YW5jZXMnIF1bIDAgXTtcbiAgICBjb25zdCBub2RlUHJpbWFyeUVsZW1lbnQgPSBpbnN0YW5jZS5wZWVyIS5wcmltYXJ5U2libGluZyE7XG4gICAgY29uc3Qgbm9kZVBhcmVudCA9IG5vZGVQcmltYXJ5RWxlbWVudC5wYXJlbnRFbGVtZW50ITtcblxuICAgIGNvbnN0IGdldFVuaXF1ZUlkU3RyaW5nRm9yU2libGluZyA9ICggc2libGluZ1N0cmluZzogc3RyaW5nICk6IHN0cmluZyA9PiB7XG4gICAgICByZXR1cm4gaW5zdGFuY2UucGVlciEuZ2V0RWxlbWVudElkKCBzaWJsaW5nU3RyaW5nLCBpbnN0YW5jZS5nZXRQRE9NSW5zdGFuY2VVbmlxdWVJZCgpICk7XG4gICAgfTtcblxuICAgIGFzc2VydC5vayggbm9kZVByaW1hcnlFbGVtZW50LmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICkhLmluY2x1ZGVzKCBnZXRVbmlxdWVJZFN0cmluZ0ZvclNpYmxpbmcoICdsYWJlbCcgKSApLCBgJHthdHRyaWJ1dGV9IHlvdXIgb3duIGxhYmVsIGVsZW1lbnQuYCApO1xuICAgIGFzc2VydC5vayggbm9kZVBhcmVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApIS5pbmNsdWRlcyggZ2V0VW5pcXVlSWRTdHJpbmdGb3JTaWJsaW5nKCAnZGVzY3JpcHRpb24nICkgKSwgYHBhcmVudCAke2F0dHJpYnV0ZX0geW91ciBvd24gZGVzY3JpcHRpb24gZWxlbWVudC5gICk7XG5cbiAgICBhc3NlcnQub2soIG5vZGVQYXJlbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSEuaW5jbHVkZXMoIGdldFVuaXF1ZUlkU3RyaW5nRm9yU2libGluZyggJ2xhYmVsJyApICksIGBwYXJlbnQgJHthdHRyaWJ1dGV9IHlvdXIgb3duIGxhYmVsIGVsZW1lbnQuYCApO1xuXG4gIH07XG5cbiAgLy8gYWRkIGsgaW50byB0aGUgbWl4XG4gIGNvbnN0IGsgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGtbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xuICAgIG90aGVyTm9kZTogaixcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HXG4gIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGsgKTtcbiAgY29uc3QgdGVzdEsgPSAoKSA9PiB7XG4gICAgY29uc3Qga1ZhbHVlID0ga1sgJ19wZG9tSW5zdGFuY2VzJyBdWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICk7XG4gICAgY29uc3QgaklEID0galsgJ19wZG9tSW5zdGFuY2VzJyBdWyAwIF0ucGVlciEubGFiZWxTaWJsaW5nIS5nZXRBdHRyaWJ1dGUoICdpZCcgKTtcbiAgICBhc3NlcnQub2soIGpJRCA9PT0ga1ZhbHVlLCAnayBwb2ludGluZyB0byBqJyApO1xuICB9O1xuXG4gIC8vIGF1ZGl0IHRoZSBjb250ZW50IHdlIGhhdmUgY3JlYXRlZFxuICBwZG9tQXVkaXRSb290Tm9kZSggcm9vdE5vZGUgKTtcblxuICAvLyBDaGVjayBiYXNpYyBhc3NvY2lhdGlvbnMgd2l0aGluIHNpbmdsZSBub2RlXG4gIGNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zKCBqICk7XG4gIHRlc3RLKCk7XG5cbiAgLy8gTW92aW5nIHRoaXMgbm9kZSBhcm91bmQgdGhlIHNjZW5lIGdyYXBoIHNob3VsZCBub3QgY2hhbmdlIGl0J3MgYXJpYSBsYWJlbGxlZCBieSBhc3NvY2lhdGlvbnMuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBqIF0gfSApICk7XG4gIGNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zKCBqICk7XG4gIHRlc3RLKCk7XG5cbiAgLy8gY2hlY2sgcmVtb3ZlIGNoaWxkXG4gIHJvb3ROb2RlLnJlbW92ZUNoaWxkKCBqICk7XG4gIGNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zKCBqICk7XG4gIHRlc3RLKCk7XG5cbiAgLy8gY2hlY2sgZGlzcG9zZVxuICBjb25zdCBqUGFyZW50ID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgaiBdIH0gKTtcbiAgcm9vdE5vZGUuY2hpbGRyZW4gPSBbXTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGpQYXJlbnQgKTtcbiAgY2hlY2tPbllvdXJPd25Bc3NvY2lhdGlvbnMoIGogKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGogKTtcbiAgY2hlY2tPbllvdXJPd25Bc3NvY2lhdGlvbnMoIGogKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGsgKTtcbiAgY2hlY2tPbllvdXJPd25Bc3NvY2lhdGlvbnMoIGogKTtcbiAgdGVzdEsoKTtcbiAgalBhcmVudC5kaXNwb3NlKCk7XG4gIGNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zKCBqICk7XG4gIHRlc3RLKCk7XG5cbiAgLy8gY2hlY2sgcmVtb3ZlQ2hpbGQgd2l0aCBkYWdcbiAgY29uc3QgalBhcmVudDIgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBqIF0gfSApO1xuICByb290Tm9kZS5pbnNlcnRDaGlsZCggMCwgalBhcmVudDIgKTtcbiAgY2hlY2tPbllvdXJPd25Bc3NvY2lhdGlvbnMoIGogKTtcbiAgdGVzdEsoKTtcbiAgcm9vdE5vZGUucmVtb3ZlQ2hpbGQoIGpQYXJlbnQyICk7XG4gIGNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zKCBqICk7XG4gIHRlc3RLKCk7XG5cbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG59XG5cbnR5cGUgQXNzb2NpYXRpb25BdHRyaWJ1dGUgPSAnYXJpYS1sYWJlbGxlZGJ5JyB8ICdhcmlhLWRlc2NyaWJlZGJ5JyB8ICdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnO1xuXG5mdW5jdGlvbiB0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGVCeVNldHRlcnMoIGFzc2VydDogQXNzZXJ0LCBhdHRyaWJ1dGU6IEFzc29jaWF0aW9uQXR0cmlidXRlICk6IHZvaWQge1xuXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgdHlwZSBPcHRpb25OYW1lcyA9ICdhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucycgfCAnYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zJyB8ICdhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zJztcbiAgLy8gdXNlIGEgZGlmZmVyZW50IHNldHRlciBkZXBlbmRpbmcgb24gaWYgdGVzdGluZyBsYWJlbGxlZGJ5IG9yIGRlc2NyaWJlZGJ5XG4gIGNvbnN0IGFzc29jaWF0aW9uc0FycmF5TmFtZTogT3B0aW9uTmFtZXMgPSBhdHRyaWJ1dGUgPT09ICdhcmlhLWxhYmVsbGVkYnknID8gJ2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUgPT09ICdhcmlhLWRlc2NyaWJlZGJ5JyA/ICdhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zJztcblxuICB0eXBlIFJlbW92YWxGdW5jdGlvbk5hbWVzID0gJ3JlbW92ZUFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24nIHwgJ3JlbW92ZUFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uJyB8ICdyZW1vdmVBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24nO1xuXG4gIC8vIHVzZSBhIGRpZmZlcmVudCBzZXR0ZXIgZGVwZW5kaW5nIG9uIGlmIHRlc3RpbmcgbGFiZWxsZWRieSBvciBkZXNjcmliZWRieVxuICBjb25zdCBhc3NvY2lhdGlvblJlbW92YWxGdW5jdGlvbjogUmVtb3ZhbEZ1bmN0aW9uTmFtZXMgPSBhdHRyaWJ1dGUgPT09ICdhcmlhLWxhYmVsbGVkYnknID8gJ3JlbW92ZUFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlID09PSAnYXJpYS1kZXNjcmliZWRieScgPyAncmVtb3ZlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JlbW92ZUFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbic7XG5cbiAgY29uc3Qgb3B0aW9uczogUGFyYWxsZWxET01PcHRpb25zID0ge1xuICAgIHRhZ05hbWU6ICdwJyxcbiAgICBsYWJlbENvbnRlbnQ6ICdoaScsXG4gICAgZGVzY3JpcHRpb25Db250ZW50OiAnaGVsbG8nLFxuICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnXG4gIH07XG4gIGNvbnN0IG4gPSBuZXcgTm9kZSggb3B0aW9ucyApO1xuICByb290Tm9kZS5hZGRDaGlsZCggbiApO1xuICBvcHRpb25zWyBhc3NvY2lhdGlvbnNBcnJheU5hbWUgXSA9IFtcbiAgICB7XG4gICAgICBvdGhlck5vZGU6IG4sXG4gICAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkdcbiAgICB9XG4gIF07XG4gIGNvbnN0IG8gPSBuZXcgTm9kZSggb3B0aW9ucyApO1xuICByb290Tm9kZS5hZGRDaGlsZCggbyApO1xuXG4gIGNvbnN0IG5QZWVyID0gZ2V0UERPTVBlZXJCeU5vZGUoIG4gKTtcbiAgY29uc3Qgb0VsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIG8gKTtcbiAgYXNzZXJ0Lm9rKCBvRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApIS5pbmNsdWRlcyhcbiAgICAgIG5QZWVyLmdldEVsZW1lbnRJZCggJ2xhYmVsJywgblBlZXIucGRvbUluc3RhbmNlIS5nZXRQRE9NSW5zdGFuY2VVbmlxdWVJZCgpICkgKSxcbiAgICBgJHthdHRyaWJ1dGV9IGZvciB0d28gbm9kZXMgd2l0aCBzZXR0ZXIgKGxhYmVsKS5gICk7XG5cbiAgLy8gbWFrZSBhIGxpc3Qgb2YgYXNzb2NpYXRpb25zIHRvIHRlc3QgYXMgYSBzZXR0ZXJcbiAgY29uc3QgcmFuZG9tQXNzb2NpYXRpb25PYmplY3QgPSB7XG4gICAgb3RoZXJOb2RlOiBuZXcgTm9kZSgpLFxuICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVCxcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HXG4gIH07XG4gIG9wdGlvbnNbIGFzc29jaWF0aW9uc0FycmF5TmFtZSBdID0gW1xuICAgIHtcbiAgICAgIG90aGVyTm9kZTogbmV3IE5vZGUoKSxcbiAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVCxcbiAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkRFU0NSSVBUSU9OX1NJQkxJTkdcbiAgICB9LFxuICAgIHJhbmRvbUFzc29jaWF0aW9uT2JqZWN0LFxuICAgIHtcbiAgICAgIG90aGVyTm9kZTogbmV3IE5vZGUoKSxcbiAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxuICAgICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuTEFCRUxfU0lCTElOR1xuICAgIH1cbiAgXTtcblxuICAvLyB0ZXN0IGdldHRlcnMgYW5kIHNldHRlcnNcbiAgY29uc3QgbSA9IG5ldyBOb2RlKCBvcHRpb25zICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBtICk7XG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCBtWyBhc3NvY2lhdGlvbnNBcnJheU5hbWUgXSwgb3B0aW9uc1sgYXNzb2NpYXRpb25zQXJyYXlOYW1lIF0gKSwgJ3Rlc3QgYXNzb2NpYXRpb24gb2JqZWN0IGdldHRlcicgKTtcbiAgbVsgYXNzb2NpYXRpb25SZW1vdmFsRnVuY3Rpb24gXSggcmFuZG9tQXNzb2NpYXRpb25PYmplY3QgKTtcbiAgb3B0aW9uc1sgYXNzb2NpYXRpb25zQXJyYXlOYW1lIF0uc3BsaWNlKCBvcHRpb25zWyBhc3NvY2lhdGlvbnNBcnJheU5hbWUgXS5pbmRleE9mKCByYW5kb21Bc3NvY2lhdGlvbk9iamVjdCApLCAxICk7XG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCBtWyBhc3NvY2lhdGlvbnNBcnJheU5hbWUgXSwgb3B0aW9uc1sgYXNzb2NpYXRpb25zQXJyYXlOYW1lIF0gKSwgJ3Rlc3QgYXNzb2NpYXRpb24gb2JqZWN0IGdldHRlciBhZnRlciByZW1vdmFsJyApO1xuXG4gIG1bIGFzc29jaWF0aW9uc0FycmF5TmFtZSBdID0gW107XG4gIGFzc2VydC5vayggZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBtICkuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gbnVsbCwgJ2NsZWFyIHdpdGggc2V0dGVyJyApO1xuXG4gIG1bIGFzc29jaWF0aW9uc0FycmF5TmFtZSBdID0gb3B0aW9uc1sgYXNzb2NpYXRpb25zQXJyYXlOYW1lIF0hO1xuICBtLmRpc3Bvc2UoKTtcbiAgYXNzZXJ0Lm9rKCBtWyBhc3NvY2lhdGlvbnNBcnJheU5hbWUgXS5sZW5ndGggPT09IDAsICdjbGVhcmVkIHdoZW4gZGlzcG9zZWQnICk7XG5cbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG59XG5cblFVbml0LnRlc3QoICdhcmlhLWxhYmVsbGVkYnknLCBhc3NlcnQgPT4ge1xuXG4gIHRlc3RBc3NvY2lhdGlvbkF0dHJpYnV0ZSggYXNzZXJ0LCAnYXJpYS1sYWJlbGxlZGJ5JyApO1xuICB0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGVCeVNldHRlcnMoIGFzc2VydCwgJ2FyaWEtbGFiZWxsZWRieScgKTtcblxufSApO1xuUVVuaXQudGVzdCggJ2FyaWEtZGVzY3JpYmVkYnknLCBhc3NlcnQgPT4ge1xuXG4gIHRlc3RBc3NvY2lhdGlvbkF0dHJpYnV0ZSggYXNzZXJ0LCAnYXJpYS1kZXNjcmliZWRieScgKTtcbiAgdGVzdEFzc29jaWF0aW9uQXR0cmlidXRlQnlTZXR0ZXJzKCBhc3NlcnQsICdhcmlhLWRlc2NyaWJlZGJ5JyApO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnLCBhc3NlcnQgPT4ge1xuXG4gIHRlc3RBc3NvY2lhdGlvbkF0dHJpYnV0ZSggYXNzZXJ0LCAnYXJpYS1hY3RpdmVkZXNjZW5kYW50JyApO1xuICB0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGVCeVNldHRlcnMoIGFzc2VydCwgJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcgKTtcblxufSApO1xuXG5RVW5pdC50ZXN0KCAnUGFyYWxsZWxET00gaW52YWxpZGF0aW9uJywgYXNzZXJ0ID0+IHtcblxuICAvLyB0ZXN0IGludmFsaWRhdGlvbiBvZiBhY2Nlc3NpYmlsaXR5IChjaGFuZ2luZyBjb250ZW50IHdoaWNoIHJlcXVpcmVzIClcbiAgY29uc3QgYTEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XG5cbiAgYTEudGFnTmFtZSA9ICdidXR0b24nO1xuXG4gIC8vIGFjY2Vzc2libGUgaW5zdGFuY2VzIGFyZSBub3Qgc29ydGVkIHVudGlsIGFkZGVkIHRvIGEgZGlzcGxheVxuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICByb290Tm9kZS5hZGRDaGlsZCggYTEgKTtcblxuICAvLyB2ZXJpZnkgdGhhdCBlbGVtZW50cyBhcmUgaW4gdGhlIERPTVxuICBjb25zdCBhMUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGExICk7XG4gIGFzc2VydC5vayggYTFFbGVtZW50LCAnYnV0dG9uIGluIERPTScgKTtcbiAgYXNzZXJ0Lm9rKCBhMUVsZW1lbnQudGFnTmFtZSA9PT0gJ0JVVFRPTicsICdidXR0b24gdGFnIG5hbWUgc2V0JyApO1xuXG4gIC8vIGdpdmUgdGhlIGJ1dHRvbiBhIGNvbnRhaW5lciBwYXJlbnQgYW5kIHNvbWUgZW1wdHkgc2libGluZ3NcbiAgYTEubGFiZWxUYWdOYW1lID0gJ2Rpdic7XG4gIGExLmRlc2NyaXB0aW9uVGFnTmFtZSA9ICdwJztcbiAgYTEuY29udGFpbmVyVGFnTmFtZSA9ICdkaXYnO1xuXG4gIGxldCBidXR0b25FbGVtZW50ID0gYTEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgbGV0IHBhcmVudEVsZW1lbnQgPSBidXR0b25FbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gIGNvbnN0IGJ1dHRvblBlZXJzID0gcGFyZW50RWxlbWVudCEuY2hpbGROb2RlcyBhcyB1bmtub3duIGFzIEhUTUxFbGVtZW50W107XG5cbiAgLy8gbm93IGh0bWwgc2hvdWxkIGxvb2sgbGlrZVxuICAvLyA8ZGl2IGlkPSdwYXJlbnQnPlxuICAvLyAgPGRpdiBpZD0nbGFiZWwnPjwvZGl2PlxuICAvLyAgPHAgaWQ9J2Rlc2NyaXB0aW9uJz48L3A+XG4gIC8vICA8YnV0dG9uPjwvYnV0dG9uPlxuICAvLyA8L2Rpdj5cbiAgYXNzZXJ0Lm9rKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggcGFyZW50RWxlbWVudCEuaWQgKSwgJ2NvbnRhaW5lciBwYXJlbnQgaW4gRE9NJyApO1xuICBhc3NlcnQub2soIGJ1dHRvblBlZXJzWyAwIF0udGFnTmFtZSA9PT0gJ0RJVicsICdsYWJlbCBmaXJzdCcgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25QZWVyc1sgMSBdLnRhZ05hbWUgPT09ICdQJywgJ2Rlc2NyaXB0aW9uIHNlY29uZCcgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25QZWVyc1sgMiBdLnRhZ05hbWUgPT09ICdCVVRUT04nLCAncHJpbWFyeVNpYmxpbmcgdGhpcmQnICk7XG5cbiAgLy8gbWFrZSB0aGUgYnV0dG9uIGEgZGl2IGFuZCB1c2UgYW4gaW5saW5lIGxhYmVsLCBhbmQgcGxhY2UgdGhlIGRlc2NyaXB0aW9uIGJlbG93XG4gIGExLnRhZ05hbWUgPSAnZGl2JztcbiAgYTEuYXBwZW5kTGFiZWwgPSB0cnVlO1xuICBhMS5hcHBlbmREZXNjcmlwdGlvbiA9IHRydWU7XG4gIGExLmxhYmVsVGFnTmFtZSA9IG51bGw7IC8vIHVzZSBhcmlhIGxhYmVsIGF0dHJpYnV0ZSBpbnN0ZWFkXG4gIGExLmFyaWFMYWJlbCA9IFRFU1RfTEFCRUw7XG5cbiAgLy8gbm93IHRoZSBodG1sIHNob3VsZCBsb29rIGxpa2VcbiAgLy8gPGRpdiBpZD0ncGFyZW50LWlkJz5cbiAgLy8gIDxkaXY+PC9kaXY+XG4gIC8vICA8cCBpZD0nZGVzY3JpcHRpb24nPjwvcD5cbiAgLy8gPC9kaXY+XG5cbiAgLy8gcmVkZWZpbmUgdGhlIEhUTUwgZWxlbWVudHMgKHJlZmVyZW5jZXMgd2lsbCBwb2ludCB0byBvbGQgZWxlbWVudHMgYmVmb3JlIG11dGF0aW9uKVxuICBidXR0b25FbGVtZW50ID0gYTEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgcGFyZW50RWxlbWVudCA9IGJ1dHRvbkVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgY29uc3QgbmV3QnV0dG9uUGVlcnMgPSBwYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzIGFzIHVua25vd24gYXMgSFRNTEVsZW1lbnRbXTtcbiAgYXNzZXJ0Lm9rKCBuZXdCdXR0b25QZWVyc1sgMCBdID09PSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGExICksICdkaXYgZmlyc3QnICk7XG4gIGFzc2VydC5vayggbmV3QnV0dG9uUGVlcnNbIDEgXS5pZC5pbmNsdWRlcyggJ2Rlc2NyaXB0aW9uJyApLCAnZGVzY3JpcHRpb24gYWZ0ZXIgZGl2IHdoZW4gYXBwZW5kaW5nIGJvdGggZWxlbWVudHMnICk7XG4gIGFzc2VydC5vayggbmV3QnV0dG9uUGVlcnMubGVuZ3RoID09PSAyLCAnbm8gbGFiZWwgcGVlciB3aGVuIHVzaW5nIGp1c3QgYXJpYS1sYWJlbCBhdHRyaWJ1dGUnICk7XG5cbiAgY29uc3QgZWxlbWVudEluRG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGExLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyEuaWQgKSE7XG4gIGFzc2VydC5vayggZWxlbWVudEluRG9tLmdldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnICkgPT09IFRFU1RfTEFCRUwsICdhcmlhLWxhYmVsIHNldCcgKTtcblxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1BhcmFsbGVsRE9NIHNldHRlcnMvZ2V0dGVycycsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgYTEgPSBuZXcgTm9kZSgge1xuICAgIHRhZ05hbWU6ICdkaXYnXG4gIH0gKTtcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggYTEgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgLy8gc2V0L2dldCBhdHRyaWJ1dGVzXG4gIGxldCBhMUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGExICk7XG4gIGNvbnN0IGluaXRpYWxMZW5ndGggPSBhMS5nZXRQRE9NQXR0cmlidXRlcygpLmxlbmd0aDtcbiAgYTEuc2V0UERPTUF0dHJpYnV0ZSggJ3JvbGUnLCAnc3dpdGNoJyApO1xuICBhc3NlcnQub2soIGExLmdldFBET01BdHRyaWJ1dGVzKCkubGVuZ3RoID09PSBpbml0aWFsTGVuZ3RoICsgMSwgJ2F0dHJpYnV0ZSBzZXQgc2hvdWxkIG9ubHkgYWRkIDEnICk7XG4gIGFzc2VydC5vayggYTEuZ2V0UERPTUF0dHJpYnV0ZXMoKVsgYTEuZ2V0UERPTUF0dHJpYnV0ZXMoKS5sZW5ndGggLSAxIF0uYXR0cmlidXRlID09PSAncm9sZScsICdhdHRyaWJ1dGUgc2V0JyApO1xuICBhc3NlcnQub2soIGExRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdyb2xlJyApID09PSAnc3dpdGNoJywgJ0hUTUwgYXR0cmlidXRlIHNldCcgKTtcbiAgYXNzZXJ0Lm9rKCBhMS5oYXNQRE9NQXR0cmlidXRlKCAncm9sZScgKSwgJ3Nob3VsZCBoYXZlIHBkb20gYXR0cmlidXRlJyApO1xuXG4gIGExLnJlbW92ZVBET01BdHRyaWJ1dGUoICdyb2xlJyApO1xuICBhc3NlcnQub2soICFhMS5oYXNQRE9NQXR0cmlidXRlKCAncm9sZScgKSwgJ3Nob3VsZCBub3QgaGF2ZSBwZG9tIGF0dHJpYnV0ZScgKTtcbiAgYXNzZXJ0Lm9rKCAhYTFFbGVtZW50LmdldEF0dHJpYnV0ZSggJ3JvbGUnICksICdhdHRyaWJ1dGUgcmVtb3ZlZCcgKTtcblxuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgZm9jdXNhYmxlOiB0cnVlIH0gKTtcbiAgYTEuYWRkQ2hpbGQoIGIgKTtcbiAgYi50YWdOYW1lID0gJ2Rpdic7XG4gIGFzc2VydC5vayggZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkudGFiSW5kZXggPj0gMCwgJ3NldCB0YWdOYW1lIGFmdGVyIGZvY3VzYWJsZScgKTtcblxuICAvLyB0ZXN0IHNldHRpbmcgYXR0cmlidXRlIGFzIERPTSBwcm9wZXJ0eSwgc2hvdWxkIE5PVCBoYXZlIGF0dHJpYnV0ZSB2YWx1ZSBwYWlyIChET00gdXNlcyBlbXB0eSBzdHJpbmcgZm9yIGVtcHR5KVxuICBhMS5zZXRQRE9NQXR0cmlidXRlKCAnaGlkZGVuJywgdHJ1ZSwgeyB0eXBlOiAncHJvcGVydHknIH0gKTtcbiAgYTFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhMSApO1xuICBhc3NlcnQuZXF1YWwoIGExRWxlbWVudC5oaWRkZW4sIHRydWUsICdoaWRkZW4gc2V0IGFzIFByb3BlcnR5JyApO1xuICBhc3NlcnQub2soIGExRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdoaWRkZW4nICkgPT09ICcnLCAnaGlkZGVuIHNob3VsZCBub3QgYmUgc2V0IGFzIGF0dHJpYnV0ZScgKTtcblxuXG4gIC8vIHRlc3Qgc2V0dGluZyBhbmQgcmVtb3ZpbmcgUERPTSBjbGFzc2VzXG4gIGExLnNldFBET01DbGFzcyggVEVTVF9DTEFTU19PTkUgKTtcbiAgYXNzZXJ0Lm9rKCBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGExICkuY2xhc3NMaXN0LmNvbnRhaW5zKCBURVNUX0NMQVNTX09ORSApLCAnVEVTVF9DTEFTU19PTkUgbWlzc2luZyBmcm9tIGNsYXNzTGlzdCcgKTtcblxuICAvLyB0d28gY2xhc3Nlc1xuICBhMS5zZXRQRE9NQ2xhc3MoIFRFU1RfQ0xBU1NfVFdPICk7XG4gIGExRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYTEgKTtcbiAgYXNzZXJ0Lm9rKCBhMUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCBURVNUX0NMQVNTX09ORSApICYmIGExRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoIFRFU1RfQ0xBU1NfT05FICksICdPbmUgb2YgdGhlIGNsYXNzZXMgbWlzc2luZyBmcm9tIGNsYXNzTGlzdCcgKTtcblxuICAvLyBtb2RpZnkgdGhlIE5vZGUgaW4gYSB3YXkgdGhhdCB3b3VsZCBjYXVzZSBhIGZ1bGwgcmVkcmF3LCBtYWtlIHN1cmUgY2xhc3NlcyBzdGlsbCBleGlzdFxuICBhMS50YWdOYW1lID0gJ2J1dHRvbic7XG4gIGExRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYTEgKTtcbiAgYXNzZXJ0Lm9rKCBhMUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCBURVNUX0NMQVNTX09ORSApICYmIGExRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoIFRFU1RfQ0xBU1NfT05FICksICdPbmUgb2YgdGhlIGNsYXNzZXMgbWlzc2luZyBmcm9tIGNsYXNzTGlzdCBhZnRlciBjaGFuZ2luZyB0YWdOYW1lJyApO1xuXG4gIC8vIHJlbW92ZSB0aGVtIG9uZSBhdCBhIHRpbWVcbiAgYTEucmVtb3ZlUERPTUNsYXNzKCBURVNUX0NMQVNTX09ORSApO1xuICBhMUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGExICk7XG4gIGFzc2VydC5vayggIWExRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoIFRFU1RfQ0xBU1NfT05FICksICdURVNUX0NMQVNTX09ORSBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIGNsYXNzTGlzdCcgKTtcbiAgYXNzZXJ0Lm9rKCBhMUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCBURVNUX0NMQVNTX1RXTyApLCAnVEVTVF9DTEFTU19UV08gc2hvdWxkIHN0aWxsIGJlIGluIGNsYXNzTGlzdCcgKTtcblxuICBhMS5yZW1vdmVQRE9NQ2xhc3MoIFRFU1RfQ0xBU1NfVFdPICk7XG4gIGExRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYTEgKTtcbiAgYXNzZXJ0Lm9rKCAhYTFFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyggVEVTVF9DTEFTU19PTkUgKSAmJiAhYTFFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyggVEVTVF9DTEFTU19PTkUgKSwgJ2NsYXNzTGlzdCBzaG91bGQgbm90IGNvbnRhaW4gYW55IGFkZGVkIGNsYXNzZXMnICk7XG5cbiAgcGRvbUF1ZGl0Um9vdE5vZGUoIGExICk7XG5cbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdOZXh0L1ByZXZpb3VzIGZvY3VzYWJsZScsIGFzc2VydCA9PiB7XG4gIGlmICggIWNhblJ1blRlc3RzICkge1xuICAgIGFzc2VydC5vayggdHJ1ZSwgJ1NraXBwaW5nIHRlc3QgYmVjYXVzZSBkb2N1bWVudCBkb2VzIG5vdCBoYXZlIGZvY3VzJyApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEVzcGVjaWFsbHkgaW1wb3J0YW50IGZvciBwdXBwZXRlZXIgd2hpY2ggZG9lc24ndCBzdXBwb3J0IGZvY3VzL2JsdXIgZXZlbnRzXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvMTM0XG4gIGlmICggIWRvY3VtZW50Lmhhc0ZvY3VzKCkgKSB7XG4gICAgYXNzZXJ0Lm9rKCB0cnVlLCAnVW5hYmxlIHRvIHJ1biBmb2N1cyB0ZXN0cyBpZiBkb2N1bWVudCBkb2VzIG5vdCBoYXZlIGZvY3VzLicgKTtcbiAgfVxuICBlbHNlIHtcbiAgICBjb25zdCB1dGlsID0gUERPTVV0aWxzO1xuXG4gICAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgZm9jdXNhYmxlOiB0cnVlIH0gKTtcbiAgICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICAgIGRpc3BsYXkuaW5pdGlhbGl6ZUV2ZW50cygpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG4gICAgLy8gaW52aXNpYmxlIGlzIGRlcHJlY2F0ZWQgZG9uJ3QgdXNlIGluIGZ1dHVyZSwgdGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIE5vZGVzIHdpdGhvdXQgYm91bmRzXG4gICAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XG4gICAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XG4gICAgY29uc3QgYyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XG4gICAgY29uc3QgZCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XG4gICAgY29uc3QgZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XG4gICAgcm9vdE5vZGUuY2hpbGRyZW4gPSBbIGEsIGIsIGMsIGQgXTtcblxuICAgIGFzc2VydC5vayggYS5mb2N1c2FibGUsICdzaG91bGQgYmUgZm9jdXNhYmxlJyApO1xuXG4gICAgLy8gZ2V0IGRvbSBlbGVtZW50cyBmcm9tIHRoZSBib2R5XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIHJvb3ROb2RlICk7XG4gICAgY29uc3QgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcbiAgICBjb25zdCBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApO1xuICAgIGNvbnN0IGNFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBjICk7XG4gICAgY29uc3QgZEVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGQgKTtcblxuICAgIGEuZm9jdXMoKTtcbiAgICBhc3NlcnQub2soIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQhLmlkID09PSBhRWxlbWVudC5pZCwgJ2EgaW4gZm9jdXMgKG5leHQpJyApO1xuXG4gICAgdXRpbC5nZXROZXh0Rm9jdXNhYmxlKCByb290RWxlbWVudCApLmZvY3VzKCk7XG4gICAgYXNzZXJ0Lm9rKCBkb2N1bWVudC5hY3RpdmVFbGVtZW50IS5pZCA9PT0gYkVsZW1lbnQuaWQsICdiIGluIGZvY3VzIChuZXh0KScgKTtcblxuICAgIHV0aWwuZ2V0TmV4dEZvY3VzYWJsZSggcm9vdEVsZW1lbnQgKS5mb2N1cygpO1xuICAgIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCEuaWQgPT09IGNFbGVtZW50LmlkLCAnYyBpbiBmb2N1cyAobmV4dCknICk7XG5cbiAgICB1dGlsLmdldE5leHRGb2N1c2FibGUoIHJvb3RFbGVtZW50ICkuZm9jdXMoKTtcbiAgICBhc3NlcnQub2soIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQhLmlkID09PSBkRWxlbWVudC5pZCwgJ2QgaW4gZm9jdXMgKG5leHQpJyApO1xuXG4gICAgdXRpbC5nZXROZXh0Rm9jdXNhYmxlKCByb290RWxlbWVudCApLmZvY3VzKCk7XG4gICAgYXNzZXJ0Lm9rKCBkb2N1bWVudC5hY3RpdmVFbGVtZW50IS5pZCA9PT0gZEVsZW1lbnQuaWQsICdkIHN0aWxsIGluIGZvY3VzIChuZXh0KScgKTtcblxuICAgIHV0aWwuZ2V0UHJldmlvdXNGb2N1c2FibGUoIHJvb3RFbGVtZW50ICkuZm9jdXMoKTtcbiAgICBhc3NlcnQub2soIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQhLmlkID09PSBjRWxlbWVudC5pZCwgJ2MgaW4gZm9jdXMgKHByZXZpb3VzKScgKTtcblxuICAgIHV0aWwuZ2V0UHJldmlvdXNGb2N1c2FibGUoIHJvb3RFbGVtZW50ICkuZm9jdXMoKTtcbiAgICBhc3NlcnQub2soIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQhLmlkID09PSBiRWxlbWVudC5pZCwgJ2IgaW4gZm9jdXMgKHByZXZpb3VzKScgKTtcblxuICAgIHV0aWwuZ2V0UHJldmlvdXNGb2N1c2FibGUoIHJvb3RFbGVtZW50ICkuZm9jdXMoKTtcbiAgICBhc3NlcnQub2soIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQhLmlkID09PSBhRWxlbWVudC5pZCwgJ2EgaW4gZm9jdXMgKHByZXZpb3VzKScgKTtcblxuICAgIHV0aWwuZ2V0UHJldmlvdXNGb2N1c2FibGUoIHJvb3RFbGVtZW50ICkuZm9jdXMoKTtcbiAgICBhc3NlcnQub2soIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQhLmlkID09PSBhRWxlbWVudC5pZCwgJ2Egc3RpbGwgaW4gZm9jdXMgKHByZXZpb3VzKScgKTtcblxuICAgIHJvb3ROb2RlLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcbiAgICBhLmNoaWxkcmVuID0gWyBiLCBjIF07XG4gICAgYy5hZGRDaGlsZCggZCApO1xuICAgIGQuYWRkQ2hpbGQoIGUgKTtcblxuICAgIC8vIHRoaXMgc2hvdWxkIGhpZGUgZXZlcnl0aGluZyBleGNlcHQgYVxuICAgIGIuZm9jdXNhYmxlID0gZmFsc2U7XG4gICAgYy5wZG9tVmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgYS5mb2N1cygpO1xuICAgIHV0aWwuZ2V0TmV4dEZvY3VzYWJsZSggcm9vdEVsZW1lbnQgKS5mb2N1cygpO1xuICAgIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCEuaWQgPT09IGFFbGVtZW50LmlkLCAnYSBvbmx5IGVsZW1lbnQgZm9jdXNhYmxlJyApO1xuXG4gICAgcGRvbUF1ZGl0Um9vdE5vZGUoIHJvb3ROb2RlICk7XG4gICAgZGlzcGxheS5kaXNwb3NlKCk7XG4gICAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAgIC8vIE5PVEU6IFRoZSBGb2N1c01hbmFnZXIgc2hvdWxkIG5vdCBiZSBkZXRhY2hlZCBoZXJlLCBpdCBpcyB1c2VkIGdsb2JhbGx5IGFuZCBpcyBuZWVkZWQgZm9yIG90aGVyIHRlc3RzLlxuICB9XG59ICk7XG5cblFVbml0LnRlc3QoICdSZW1vdmUgYWNjZXNzaWJpbGl0eSBzdWJ0cmVlJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgZm9jdXNhYmxlOiB0cnVlIH0gKTtcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgZm9jdXNhYmxlOiB0cnVlLCBmb2N1c0hpZ2hsaWdodDogJ2ludmlzaWJsZScgfSApO1xuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSwgZm9jdXNIaWdobGlnaHQ6ICdpbnZpc2libGUnIH0gKTtcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XG4gIGNvbnN0IGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgZm9jdXNhYmxlOiB0cnVlLCBmb2N1c0hpZ2hsaWdodDogJ2ludmlzaWJsZScgfSApO1xuICBjb25zdCBmID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSwgZm9jdXNIaWdobGlnaHQ6ICdpbnZpc2libGUnIH0gKTtcbiAgcm9vdE5vZGUuY2hpbGRyZW4gPSBbIGEsIGIsIGMsIGQsIGUgXTtcbiAgZC5hZGRDaGlsZCggZiApO1xuXG4gIGxldCByb290RE9NRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggcm9vdE5vZGUgKTtcbiAgbGV0IGRET01FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBkICk7XG5cbiAgLy8gdmVyaWZ5IHRoZSBkb21cbiAgYXNzZXJ0Lm9rKCByb290RE9NRWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT09IDUsICdjaGlsZHJlbiBhZGRlZCcgKTtcblxuICAvLyByZWRlZmluZSBiZWNhdXNlIHRoZSBkb20gZWxlbWVudCByZWZlcmVuY2VzIGFib3ZlIGhhdmUgYmVjb21lIHN0YWxlXG4gIHJvb3RET01FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCByb290Tm9kZSApO1xuICBkRE9NRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggZCApO1xuICBhc3NlcnQub2soIHJvb3RET01FbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gNSwgJ2NoaWxkcmVuIGFkZGVkIGJhY2snICk7XG4gIGFzc2VydC5vayggZERPTUVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoID09PSAxLCAnZGVzY2VuZGFudCBjaGlsZCBhZGRlZCBiYWNrJyApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxufSApO1xuXG5RVW5pdC50ZXN0KCAnYWNjZXNzaWJsZS1kYWcnLCBhc3NlcnQgPT4ge1xuXG4gIC8vIHRlc3QgYWNjZXNzaWJpbGl0eSBmb3IgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIGEgbm9kZVxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUgfSApO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG4gIGEuY2hpbGRyZW4gPSBbIGIsIGMsIGQgXTtcblxuICAvLyBlIGhhcyB0aHJlZSBwYXJlbnRzIChEQUcpXG4gIGIuYWRkQ2hpbGQoIGUgKTtcbiAgYy5hZGRDaGlsZCggZSApO1xuICBkLmFkZENoaWxkKCBlICk7XG5cbiAgLy8gZWFjaCBpbnN0YW5jZSBzaG91bGQgaGF2ZSBpdHMgb3duIGFjY2Vzc2libGUgY29udGVudCwgSFRNTCBzaG91bGQgbG9vayBsaWtlXG4gIC8vIDxkaXYgaWQ9XCJyb290XCI+XG4gIC8vICAgPGRpdiBpZD1cImFcIj5cbiAgLy8gICAgIDxkaXYgaWQ9XCJiXCI+XG4gIC8vICAgICAgIDxkaXYgaWQ9XCJlLWluc3RhbmNlMVwiPlxuICAvLyAgICAgPGRpdiBpZD1cImNcIj5cbiAgLy8gICAgICAgPGRpdiBpZD1cImUtaW5zdGFuY2UyXCI+XG4gIC8vICAgICA8ZGl2IGlkPVwiZFwiPlxuICAvLyAgICAgICA8ZGl2IGlkPVwiZS1pbnN0YW5jZTJcIj5cbiAgY29uc3QgaW5zdGFuY2VzID0gZS5wZG9tSW5zdGFuY2VzO1xuICBhc3NlcnQub2soIGUucGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDMsICdub2RlIGUgc2hvdWxkIGhhdmUgMyBhY2Nlc3NpYmxlIGluc3RhbmNlcycgKTtcbiAgYXNzZXJ0Lm9rKCAoIGluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5pZCAhPT0gaW5zdGFuY2VzWyAxIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmlkICkgJiZcbiAgICAgICAgICAgICAoIGluc3RhbmNlc1sgMSBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5pZCAhPT0gaW5zdGFuY2VzWyAyIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmlkICkgJiZcbiAgICAgICAgICAgICAoIGluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5pZCAhPT0gaW5zdGFuY2VzWyAyIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmlkICksICdlYWNoIGRvbSBlbGVtZW50IHNob3VsZCBiZSB1bmlxdWUnICk7XG4gIGFzc2VydC5vayggZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5pZCApLCAncGVlciBwcmltYXJ5U2libGluZyAwIHNob3VsZCBiZSBpbiB0aGUgRE9NJyApO1xuICBhc3NlcnQub2soIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBpbnN0YW5jZXNbIDEgXS5wZWVyIS5wcmltYXJ5U2libGluZyEuaWQgKSwgJ3BlZXIgcHJpbWFyeVNpYmxpbmcgMSBzaG91bGQgYmUgaW4gdGhlIERPTScgKTtcbiAgYXNzZXJ0Lm9rKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggaW5zdGFuY2VzWyAyIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmlkICksICdwZWVyIHByaW1hcnlTaWJsaW5nIDIgc2hvdWxkIGJlIGluIHRoZSBET00nICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdyZXBsYWNlQ2hpbGQnLCBhc3NlcnQgPT4ge1xuXG4gIC8vIHRoaXMgc3VpdGUgaW52b2x2ZXMgZm9jdXMgdGVzdHMgd2hpY2ggZG8gbm90IHdvcmsgb24gaGVhZGxlc3MgcHVwcGV0ZWVyXG4gIGlmICggIWRvY3VtZW50Lmhhc0ZvY3VzKCkgKSB7XG4gICAgYXNzZXJ0Lm9rKCB0cnVlLCAnVW5hYmxlIHRvIHJ1biBmb2N1cyB0ZXN0cyBpZiBkb2N1bWVudCBkb2VzIG5vdCBoYXZlIGZvY3VzLicgKTtcbiAgfVxuICBlbHNlIHtcblxuXG4gICAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2YgcmVwbGFjZUNoaWxkIGZ1bmN0aW9uXG4gICAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gICAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAgIGRpc3BsYXkuaW5pdGlhbGl6ZUV2ZW50cygpO1xuXG4gICAgLy8gY3JlYXRlIHNvbWUgbm9kZXMgZm9yIHRlc3RpbmdcbiAgICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGZvY3VzSGlnaGxpZ2h0OiBmb2N1c0hpZ2hsaWdodCB9ICk7XG4gICAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBmb2N1c0hpZ2hsaWdodDogZm9jdXNIaWdobGlnaHQgfSApO1xuICAgIGNvbnN0IGMgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgZm9jdXNIaWdobGlnaHQ6IGZvY3VzSGlnaGxpZ2h0IH0gKTtcbiAgICBjb25zdCBkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGZvY3VzSGlnaGxpZ2h0OiBmb2N1c0hpZ2hsaWdodCB9ICk7XG4gICAgY29uc3QgZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBmb2N1c0hpZ2hsaWdodDogZm9jdXNIaWdobGlnaHQgfSApO1xuICAgIGNvbnN0IGYgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgZm9jdXNIaWdobGlnaHQ6IGZvY3VzSGlnaGxpZ2h0IH0gKTtcblxuICAgIC8vIGEgY2hpbGQgdGhhdCB3aWxsIGJlIGFkZGVkIHRocm91Z2ggcmVwbGFjZUNoaWxkKClcbiAgICBjb25zdCB0ZXN0Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBmb2N1c0hpZ2hsaWdodDogZm9jdXNIaWdobGlnaHQgfSApO1xuXG4gICAgLy8gbWFrZSBzdXJlIHJlcGxhY2VDaGlsZCBwdXRzIHRoZSBjaGlsZCBpbiB0aGUgcmlnaHQgc3BvdFxuICAgIGEuY2hpbGRyZW4gPSBbIGIsIGMsIGQsIGUsIGYgXTtcbiAgICBjb25zdCBpbml0SW5kZXggPSBhLmluZGV4T2ZDaGlsZCggZSApO1xuICAgIGEucmVwbGFjZUNoaWxkKCBlLCB0ZXN0Tm9kZSApO1xuICAgIGNvbnN0IGFmdGVySW5kZXggPSBhLmluZGV4T2ZDaGlsZCggdGVzdE5vZGUgKTtcblxuICAgIGFzc2VydC5vayggYS5oYXNDaGlsZCggdGVzdE5vZGUgKSwgJ2Egc2hvdWxkIGhhdmUgY2hpbGQgdGVzdE5vZGUgYWZ0ZXIgaXQgcmVwbGFjZWQgbm9kZSBlJyApO1xuICAgIGFzc2VydC5vayggIWEuaGFzQ2hpbGQoIGUgKSwgJ2Egc2hvdWxkIG5vIGxvbmdlciBoYXZlIGNoaWxkIG5vZGUgZSBhZnRlciBpdCB3YXMgcmVwbGFjZWQgYnkgdGVzdE5vZGUnICk7XG4gICAgYXNzZXJ0Lm9rKCBpbml0SW5kZXggPT09IGFmdGVySW5kZXgsICd0ZXN0Tm9kZSBzaG91bGQgYmUgYXQgdGhlIHNhbWUgcGxhY2UgYXMgZSB3YXMgYWZ0ZXIgcmVwbGFjZUNoaWxkJyApO1xuXG4gICAgLy8gY3JlYXRlIGEgc2NlbmUgZ3JhcGggdG8gdGVzdCBob3cgc2NlbmVyeSBtYW5hZ2VzIGZvY3VzXG4gICAgLy8gICAgYVxuICAgIC8vICAgLyBcXFxuICAgIC8vICBmICAgYlxuICAgIC8vICAgICAvIFxcXG4gICAgLy8gICAgYyAgIGRcbiAgICAvLyAgICAgXFwgL1xuICAgIC8vICAgICAgZVxuICAgIGEucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xuICAgIGEuY2hpbGRyZW4gPSBbIGYsIGIgXTtcbiAgICBiLmNoaWxkcmVuID0gWyBjLCBkIF07XG4gICAgYy5hZGRDaGlsZCggZSApO1xuICAgIGQuYWRkQ2hpbGQoIGUgKTtcblxuICAgIGYuZm9jdXMoKTtcbiAgICBhc3NlcnQub2soIGYuZm9jdXNlZCwgJ2YgaGFzIGZvY3VzIGJlZm9yZSBiZWluZyByZXBsYWNlZCcgKTtcblxuICAgIC8vIHJlcGxhY2UgZiB3aXRoIHRlc3ROb2RlLCBlbnN1cmUgdGhhdCB0ZXN0Tm9kZSByZWNlaXZlcyBmb2N1cyBhZnRlciByZXBsYWNpbmdcbiAgICBhLnJlcGxhY2VDaGlsZCggZiwgdGVzdE5vZGUgKTtcbiAgICBhc3NlcnQub2soICFhLmhhc0NoaWxkKCBmICksICdhIHNob3VsZCBubyBsb25nZXIgaGF2ZSBjaGlsZCBmJyApO1xuICAgIGFzc2VydC5vayggYS5oYXNDaGlsZCggdGVzdE5vZGUgKSwgJ2Egc2hvdWxkIG5vdyBoYXZlIGNoaWxkIHRlc3ROb2RlJyApO1xuICAgIGFzc2VydC5vayggIWYuZm9jdXNlZCwgJ2Ygbm8gbG9uZ2VyIGhhcyBmb2N1cyBhZnRlciBiZWluZyByZXBsYWNlZCcgKTtcbiAgICBhc3NlcnQub2soIHRlc3ROb2RlLmZvY3VzZWQsICd0ZXN0Tm9kZSBoYXMgZm9jdXMgYWZ0ZXIgcmVwbGFjaW5nIGZvY3VzZWQgbm9kZSBmJyApO1xuICAgIGFzc2VydC5vayggdGVzdE5vZGUucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nID09PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50LCAnYnJvd3NlciBpcyBmb2N1c2luZyB0ZXN0Tm9kZScgKTtcblxuICAgIHRlc3ROb2RlLmJsdXIoKTtcbiAgICBhc3NlcnQub2soICEhdGVzdE5vZGUsICd0ZXN0Tm9kZSBibHVycmVkIGJlZm9yZSBiZWluZyByZXBsYWNlZCcgKTtcblxuICAgIC8vIHJlcGxhY2UgdGVzdE5vZGUgd2l0aCBmIGFmdGVyIGJsdXJpbmcgdGVzdE5vZGUsIG5laXRoZXIgc2hvdWxkIGhhdmUgZm9jdXMgYWZ0ZXIgdGhlIHJlcGxhY2VtZW50XG4gICAgYS5yZXBsYWNlQ2hpbGQoIHRlc3ROb2RlLCBmICk7XG4gICAgYXNzZXJ0Lm9rKCBhLmhhc0NoaWxkKCBmICksICdub2RlIGYgc2hvdWxkIHJlcGxhY2Ugbm9kZSB0ZXN0Tm9kZScgKTtcbiAgICBhc3NlcnQub2soICFhLmhhc0NoaWxkKCB0ZXN0Tm9kZSApLCAndGVzdE5vZGUgc2hvdWxkIG5vIGxvbmdlciBiZSBhIGNoaWxkIG9mIG5vZGUgYScgKTtcbiAgICBhc3NlcnQub2soICF0ZXN0Tm9kZS5mb2N1c2VkLCAndGVzdE5vZGUgc2hvdWxkIG5vdCBoYXZlIGZvY3VzIGFmdGVyIGJlaW5nIHJlcGxhY2VkJyApO1xuICAgIGFzc2VydC5vayggIWYuZm9jdXNlZCwgJ2Ygc2hvdWxkIG5vdCBoYXZlIGZvY3VzIGFmdGVyIHJlcGxhY2luZyB0ZXN0Tm9kZSwgdGVzdE5vZGUgZGlkIG5vdCBoYXZlIGZvY3VzJyApO1xuICAgIGFzc2VydC5vayggZi5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmcgIT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQsICdicm93c2VyIHNob3VsZCBub3QgYmUgZm9jdXNpbmcgbm9kZSBmJyApO1xuXG4gICAgLy8gZm9jdXMgbm9kZSBkIGFuZCByZXBsYWNlIHdpdGggbm9uLWZvY3VzYWJsZSB0ZXN0Tm9kZSwgbmVpdGhlciBzaG91bGQgaGF2ZSBmb2N1cyBzaW5jZSB0ZXN0Tm9kZSBpcyBub3QgZm9jdXNhYmxlXG4gICAgZC5mb2N1cygpO1xuICAgIHRlc3ROb2RlLmZvY3VzYWJsZSA9IGZhbHNlO1xuICAgIGFzc2VydC5vayggZC5mb2N1c2VkLCAnZCBoYXMgZm9jdXMgYmVmb3JlIGJlaW5nIHJlcGxhY2VkJyApO1xuICAgIGFzc2VydC5vayggIXRlc3ROb2RlLmZvY3VzYWJsZSwgJ3Rlc3ROb2RlIGlzIG5vdCBmb2N1c2FibGUgYmVmb3JlIHJlcGxhY2luZyBub2RlIGQnICk7XG5cbiAgICBiLnJlcGxhY2VDaGlsZCggZCwgdGVzdE5vZGUgKTtcbiAgICBhc3NlcnQub2soIGIuaGFzQ2hpbGQoIHRlc3ROb2RlICksICd0ZXN0Tm9kZSBzaG91bGQgYmUgYSBjaGlsZCBvZiBub2RlIGIgYWZ0ZXIgcmVwbGFjaW5nIHdpdGggcmVwbGFjZUNoaWxkJyApO1xuICAgIGFzc2VydC5vayggIWIuaGFzQ2hpbGQoIGQgKSwgJ2Qgc2hvdWxkIG5vdCBiZSBhIGNoaWxkIG9mIGIgYWZ0ZXIgaXQgd2FzIHJlcGxhY2VkIHdpdGggcmVwbGFjZUNoaWxkJyApO1xuICAgIGFzc2VydC5vayggIWQuZm9jdXNlZCwgJ2QgZG9lcyBub3QgaGF2ZSBmb2N1cyBhZnRlciBiZWluZyByZXBsYWNlZCBieSB0ZXN0Tm9kZScgKTtcbiAgICBhc3NlcnQub2soICF0ZXN0Tm9kZS5mb2N1c2VkLCAndGVzdE5vZGUgZG9lcyBub3QgaGF2ZSBmb2N1cyBhZnRlciByZXBsYWNpbmcgbm9kZSBkICh0ZXN0Tm9kZSBpcyBub3QgZm9jdXNhYmxlKScgKTtcblxuICAgIGRpc3BsYXkuZGlzcG9zZSgpO1xuICAgIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG4gIH1cbn0gKTtcblxuUVVuaXQudGVzdCggJ3Bkb21WaXNpYmxlJywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgLy8gdGVzdCB3aXRoIGEgc2NlbmUgZ3JhcGhcbiAgLy8gICAgICAgYVxuICAvLyAgICAgIC8gXFxcbiAgLy8gICAgIGIgICAgY1xuICAvLyAgICAgICAgLyB8IFxcXG4gIC8vICAgICAgIGQgIGUgIGZcbiAgLy8gICAgICAgICAgIFxcIC9cbiAgLy8gICAgICAgICAgICBnXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGQgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBlID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgZiA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGcgPSBuZXcgTm9kZSgpO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG4gIGEuY2hpbGRyZW4gPSBbIGIsIGMgXTtcbiAgYy5jaGlsZHJlbiA9IFsgZCwgZSwgZiBdO1xuICBlLmNoaWxkcmVuID0gWyBnIF07XG4gIGYuY2hpbGRyZW4gPSBbIGcgXTtcblxuICAvLyBnaXZlIHNvbWUgYWNjZXNzaWJsZSBjb250ZW50XG4gIGEudGFnTmFtZSA9ICdkaXYnO1xuICBiLnRhZ05hbWUgPSAnYnV0dG9uJztcbiAgZS50YWdOYW1lID0gJ2Rpdic7XG4gIGcudGFnTmFtZSA9ICdidXR0b24nO1xuXG4gIC8vIHNjZW5lcnkgc2hvdWxkIHByb2R1Y2UgdGhpcyBhY2Nlc3NpYmxlIERPTSB0cmVlXG4gIC8vIDxkaXYgaWQ9XCJhXCI+XG4gIC8vICAgPGJ1dHRvbiBpZD1cImJcIj5cbiAgLy8gICA8ZGl2IGlkPVwiZVwiPlxuICAvLyAgICAgIDxidXR0b24gaWQ9XCJnMVwiPlxuICAvLyAgIDxidXR0b24gaWQ9XCJnMlwiPlxuXG4gIC8vIGdldCB0aGUgYWNjZXNzaWJsZSBwcmltYXJ5IHNpYmxpbmdzIC0gbG9va2luZyBpbnRvIHBkb21JbnN0YW5jZXMgZm9yIHRlc3RpbmcsIHRoZXJlIGlzIG5vIGdldHRlciBmb3IgcHJpbWFyeVNpYmxpbmdcbiAgY29uc3QgZGl2QSA9IGEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgY29uc3QgYnV0dG9uQiA9IGIucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgY29uc3QgZGl2RSA9IGUucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgY29uc3QgYnV0dG9uRzEgPSBnLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyE7XG4gIGNvbnN0IGJ1dHRvbkcyID0gZy5wZG9tSW5zdGFuY2VzWyAxIF0ucGVlciEucHJpbWFyeVNpYmxpbmchO1xuXG4gIGNvbnN0IGRpdkFDaGlsZHJlbiA9IGRpdkEuY2hpbGROb2RlcztcbiAgY29uc3QgZGl2RUNoaWxkcmVuID0gZGl2RS5jaGlsZE5vZGVzO1xuXG4gIGFzc2VydC5vayggXy5pbmNsdWRlcyggZGl2QUNoaWxkcmVuLCBidXR0b25CICksICdidXR0b24gQiBzaG91bGQgYmUgYW4gaW1tZWRpYXRlIGNoaWxkIG9mIGRpdiBBJyApO1xuICBhc3NlcnQub2soIF8uaW5jbHVkZXMoIGRpdkFDaGlsZHJlbiwgZGl2RSApLCAnZGl2IEUgc2hvdWxkIGJlIGFuIGltbWVkaWF0ZSBjaGlsZCBvZiBkaXYgQScgKTtcbiAgYXNzZXJ0Lm9rKCBfLmluY2x1ZGVzKCBkaXZBQ2hpbGRyZW4sIGJ1dHRvbkcyICksICdidXR0b24gRzIgc2hvdWxkIGJlIGFuIGltbWVkaWF0ZSBjaGlsZCBvZiBkaXYgQScgKTtcbiAgYXNzZXJ0Lm9rKCBfLmluY2x1ZGVzKCBkaXZFQ2hpbGRyZW4sIGJ1dHRvbkcxICksICdidXR0b24gRzEgc2hvdWxkIGJlIGFuIGltbWVkaWF0ZSBjaGlsZCBvZiBkaXYgRScgKTtcblxuICAvLyBtYWtlIG5vZGUgQiBpbnZpc2libGUgZm9yIGFjY2Vzc2liaWxpdHkgLSBpdCBzaG91bGQgc2hvdWxkIHZpc2libGUsIGJ1dCBoaWRkZW4gZnJvbSBzY3JlZW4gcmVhZGVyc1xuICBiLnBkb21WaXNpYmxlID0gZmFsc2U7XG4gIGFzc2VydC5lcXVhbCggYi52aXNpYmxlLCB0cnVlLCAnYiBzaG91bGQgYmUgdmlzaWJsZSBhZnRlciBiZWNvbWluZyBoaWRkZW4gZm9yIHNjcmVlbiByZWFkZXJzJyApO1xuICBhc3NlcnQuZXF1YWwoIGIucGRvbVZpc2libGUsIGZhbHNlLCAnYiBzdGF0ZSBzaG91bGQgcmVmbGVjdCBpdCBpcyBoaWRkZW4gZm9yIHNjcmVlbiByZWFkZXJzJyApO1xuICBhc3NlcnQuZXF1YWwoIGJ1dHRvbkIuaGlkZGVuLCB0cnVlLCAnYnV0dG9uQiBzaG91bGQgYmUgaGlkZGVuIGZvciBzY3JlZW4gcmVhZGVycycgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLnBkb21EaXNwbGF5ZWQsIGZhbHNlLCAncGRvbVZpc2libGU9ZmFsc2UsIGIgc2hvdWxkIGhhdmUgbm8gcmVwcmVzZW50YXRpb24gaW4gdGhlIFBET00nICk7XG4gIGIucGRvbVZpc2libGUgPSB0cnVlO1xuXG4gIC8vIG1ha2Ugbm9kZSBCIGludmlzaWJsZSAtIGl0IHNob3VsZCBub3QgYmUgdmlzaWJsZSwgYW5kIGl0IHNob3VsZCBiZSBoaWRkZW4gZm9yIHNjcmVlbiByZWFkZXJzXG4gIGIudmlzaWJsZSA9IGZhbHNlO1xuICBhc3NlcnQuZXF1YWwoIGIudmlzaWJsZSwgZmFsc2UsICdzdGF0ZSBvZiBub2RlIGIgaXMgdmlzaWJsZScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBidXR0b25CLmhpZGRlbiwgdHJ1ZSwgJ2J1dHRvbkIgaXMgaGlkZGVuIGZyb20gc2NyZWVuIHJlYWRlcnMgYWZ0ZXIgYmVjb21pbmcgaW52aXNpYmxlJyApO1xuICBhc3NlcnQuZXF1YWwoIGIucGRvbVZpc2libGUsIHRydWUsICdzdGF0ZSBvZiBub2RlIGIgc3RpbGwgcmVmbGVjdHMgcGRvbSB2aXNpYmlsaXR5IHdoZW4gaW52aXNpYmxlJyApO1xuICBhc3NlcnQuZXF1YWwoIGIucGRvbURpc3BsYXllZCwgZmFsc2UsICdiIGludmlzaWJsZSBhbmQgc2hvdWxkIGhhdmUgbm8gcmVwcmVzZW50YXRpb24gaW4gdGhlIFBET00nICk7XG4gIGIudmlzaWJsZSA9IHRydWU7XG5cbiAgLy8gbWFrZSBub2RlIGYgaW52aXNpYmxlIC0gZydzIHRyYWlsIHRoYXQgZ29lcyB0aHJvdWdoIGYgc2hvdWxkIGJlIGludmlzaWJsZSB0byBBVCwgdGNvbWhlIGNoaWxkIG9mIGMgc2hvdWxkIHJlbWFpbiBwZG9tVmlzaWJsZVxuICBmLnZpc2libGUgPSBmYWxzZTtcbiAgYXNzZXJ0LmVxdWFsKCBnLmlzUERPTVZpc2libGUoKSwgdHJ1ZSwgJ3N0YXRlIG9mIHBkb21WaXNpYmxlIHNob3VsZCByZW1haW4gdHJ1ZSBvbiBub2RlIGcnICk7XG4gIGFzc2VydC5vayggIWJ1dHRvbkcxLmhpZGRlbiwgJ2J1dHRvbkcxIChjaGlsZCBvZiBlKSBzaG91bGQgbm90IGJlIGhpZGRlbiBhZnRlciBwYXJlbnQgbm9kZSBmIG1hZGUgaW52aXNpYmxlIChubyBhY2Nlc3NpYmxlIGNvbnRlbnQgb24gbm9kZSBmKScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBidXR0b25HMi5oaWRkZW4sIHRydWUsICdidXR0b25HMiBzaG91bGQgYmUgaGlkZGVuIGFmdGVyIHBhcmVudCBub2RlIGYgbWFkZSBpbnZpc2libGUgKG5vIGFjY2Vzc2libGUgY29udGVudCBvbiBub2RlIGYpJyApO1xuICBhc3NlcnQuZXF1YWwoIGcucGRvbURpc3BsYXllZCwgdHJ1ZSwgJ29uZSBwYXJlbnQgc3RpbGwgdmlzaWJsZSwgZyBzdGlsbCBoYXMgb25lIFBET01JbnN0YW5jZSBkaXNwbGF5ZWQgaW4gUERPTScgKTtcbiAgZi52aXNpYmxlID0gdHJ1ZTtcblxuICAvLyBtYWtlIG5vZGUgYyAobm8gYWNjZXNzaWJsZSBjb250ZW50KSBpbnZpc2libGUgdG8gc2NyZWVuLCBlIHNob3VsZCBiZSBoaWRkZW4gYW5kIGcyIHNob3VsZCBiZSBoaWRkZW5cbiAgYy5wZG9tVmlzaWJsZSA9IGZhbHNlO1xuICBhc3NlcnQuZXF1YWwoIGMudmlzaWJsZSwgdHJ1ZSwgJ2Mgc2hvdWxkIHN0aWxsIGJlIHZpc2libGUgYWZ0ZXIgYmVjb21pbmcgaW52aXNpYmxlIHRvIHNjcmVlbiByZWFkZXJzJyApO1xuICBhc3NlcnQuZXF1YWwoIGRpdkUuaGlkZGVuLCB0cnVlLCAnZGl2IEUgc2hvdWxkIGJlIGhpZGRlbiBhZnRlciBwYXJlbnQgbm9kZSBjIChubyBhY2Nlc3NpYmxlIGNvbnRlbnQpIGlzIG1hZGUgaW52aXNpYmxlIHRvIHNjcmVlbiByZWFkZXJzJyApO1xuICBhc3NlcnQuZXF1YWwoIGJ1dHRvbkcyLmhpZGRlbiwgdHJ1ZSwgJ2J1dHRvbkcyIHNob3VsZCBiZSBoaWRkZW4gYWZ0ZXIgYW5jZXN0b3Igbm9kZSBjIChubyBhY2Nlc3NpYmxlIGNvbnRlbnQpIGlzIG1hZGUgaW52aXNpYmxlIHRvIHNjcmVlbiByZWFkZXJzJyApO1xuICBhc3NlcnQub2soICFkaXZBLmhpZGRlbiwgJ2RpdiBBIHNob3VsZCBub3QgaGF2ZSBiZWVuIGhpZGRlbiBieSBtYWtpbmcgZGVzY2VuZGFudCBjIGludmlzaWJsZSB0byBzY3JlZW4gcmVhZGVycycgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ2lucHV0VmFsdWUnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2lucHV0JywgaW5wdXRUeXBlOiAncmFkaW8nLCBpbnB1dFZhbHVlOiAnaSBhbSB2YWx1ZScgfSApO1xuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xuICBsZXQgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd2YWx1ZScgKSA9PT0gJ2kgYW0gdmFsdWUnLCAnc2hvdWxkIGhhdmUgY29ycmVjdCB2YWx1ZScgKTtcblxuICBjb25zdCBkaWZmZXJlbnRWYWx1ZSA9ICdpIGFtIGRpZmZlcmVudCB2YWx1ZSc7XG4gIGEuaW5wdXRWYWx1ZSA9IGRpZmZlcmVudFZhbHVlO1xuICBhRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApO1xuICBhc3NlcnQub2soIGFFbGVtZW50LmdldEF0dHJpYnV0ZSggJ3ZhbHVlJyApID09PSBkaWZmZXJlbnRWYWx1ZSwgJ3Nob3VsZCBoYXZlIGRpZmZlcmVudCB2YWx1ZScgKTtcblxuICByb290Tm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYSBdIH0gKSApO1xuICBhRWxlbWVudCA9IGEucGRvbUluc3RhbmNlc1sgMSBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd2YWx1ZScgKSA9PT0gZGlmZmVyZW50VmFsdWUsICdzaG91bGQgaGF2ZSB0aGUgc2FtZSBkaWZmZXJlbnQgdmFsdWUnICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdhcmlhVmFsdWVUZXh0JywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgY29uc3QgYXJpYVZhbHVlVGV4dCA9ICd0aGlzIGlzIG15IHZhbHVlIHRleHQnO1xuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2lucHV0JywgYXJpYVZhbHVlVGV4dDogYXJpYVZhbHVlVGV4dCwgaW5wdXRUeXBlOiAncmFuZ2UnIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcbiAgbGV0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGFzc2VydC5vayggYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS12YWx1ZXRleHQnICkgPT09IGFyaWFWYWx1ZVRleHQsICdzaG91bGQgaGF2ZSBjb3JyZWN0IHZhbHVlIHRleHQuJyApO1xuICBhc3NlcnQub2soIGEuYXJpYVZhbHVlVGV4dCA9PT0gYXJpYVZhbHVlVGV4dCwgJ3Nob3VsZCBoYXZlIGNvcnJlY3QgdmFsdWUgdGV4dCwgZ2V0dGVyJyApO1xuXG4gIGNvbnN0IGRpZmZlcmVudFZhbHVlID0gJ2kgYW0gZGlmZmVyZW50IHZhbHVlIHRleHQnO1xuICBhLmFyaWFWYWx1ZVRleHQgPSBkaWZmZXJlbnRWYWx1ZTtcbiAgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLXZhbHVldGV4dCcgKSA9PT0gZGlmZmVyZW50VmFsdWUsICdzaG91bGQgaGF2ZSBkaWZmZXJlbnQgdmFsdWUgdGV4dCcgKTtcbiAgYXNzZXJ0Lm9rKCBhLmFyaWFWYWx1ZVRleHQgPT09IGRpZmZlcmVudFZhbHVlLCAnc2hvdWxkIGhhdmUgZGlmZmVyZW50IHZhbHVlIHRleHQsIGdldHRlcicgKTtcblxuICByb290Tm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYSBdIH0gKSApO1xuICBhRWxlbWVudCA9IGEucGRvbUluc3RhbmNlc1sgMSBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLXZhbHVldGV4dCcgKSA9PT0gZGlmZmVyZW50VmFsdWUsICdzaG91bGQgaGF2ZSB0aGUgc2FtZSBkaWZmZXJlbnQgdmFsdWUgdGV4dCBhZnRlciBjaGlsZHJlbiBtb3ZpbmcnICk7XG4gIGFzc2VydC5vayggYS5hcmlhVmFsdWVUZXh0ID09PSBkaWZmZXJlbnRWYWx1ZSwgJ3Nob3VsZCBoYXZlIHRoZSBzYW1lIGRpZmZlcmVudCB2YWx1ZSB0ZXh0IGFmdGVyIGNoaWxkcmVuIG1vdmluZywgZ2V0dGVyJyApO1xuXG4gIGEudGFnTmFtZSA9ICdkaXYnO1xuICBhRWxlbWVudCA9IGEucGRvbUluc3RhbmNlc1sgMSBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLXZhbHVldGV4dCcgKSA9PT0gZGlmZmVyZW50VmFsdWUsICd2YWx1ZSB0ZXh0IGFzIGRpdicgKTtcbiAgYXNzZXJ0Lm9rKCBhLmFyaWFWYWx1ZVRleHQgPT09IGRpZmZlcmVudFZhbHVlLCAndmFsdWUgdGV4dCBhcyBkaXYsIGdldHRlcicgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbn0gKTtcblxuXG5RVW5pdC50ZXN0KCAnc2V0UERPTUF0dHJpYnV0ZScsIGFzc2VydCA9PiB7XG5cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgbGFiZWxDb250ZW50OiAnaGVsbG8nIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcblxuICBhLnNldFBET01BdHRyaWJ1dGUoICd0ZXN0JywgJ3Rlc3QxJyApO1xuICBsZXQgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd0ZXN0JyApID09PSAndGVzdDEnLCAnc2V0UERPTUF0dHJpYnV0ZSBmb3IgcHJpbWFyeSBzaWJsaW5nJyApO1xuXG4gIGEucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ3Rlc3QnICk7XG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGFzc2VydC5vayggYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCAndGVzdCcgKSA9PT0gbnVsbCwgJ3JlbW92ZVBET01BdHRyaWJ1dGUgZm9yIHByaW1hcnkgc2libGluZycgKTtcblxuICBhLnNldFBET01BdHRyaWJ1dGUoICd0ZXN0JywgJ3Rlc3RWYWx1ZScgKTtcbiAgYS5zZXRQRE9NQXR0cmlidXRlKCAndGVzdCcsICd0ZXN0VmFsdWVMYWJlbCcsIHtcbiAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuTEFCRUxfU0lCTElOR1xuICB9ICk7XG5cbiAgY29uc3QgdGVzdEJvdGhBdHRyaWJ1dGVzID0gKCkgPT4ge1xuICAgIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gICAgY29uc3QgYUxhYmVsRWxlbWVudCA9IGFFbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcbiAgICBhc3NlcnQub2soIGFFbGVtZW50LmdldEF0dHJpYnV0ZSggJ3Rlc3QnICkgPT09ICd0ZXN0VmFsdWUnLCAnc2V0UERPTUF0dHJpYnV0ZSBmb3IgcHJpbWFyeSBzaWJsaW5nIDInICk7XG4gICAgYXNzZXJ0Lm9rKCBhTGFiZWxFbGVtZW50LmdldEF0dHJpYnV0ZSggJ3Rlc3QnICkgPT09ICd0ZXN0VmFsdWVMYWJlbCcsICdzZXRQRE9NQXR0cmlidXRlIGZvciBsYWJlbCBzaWJsaW5nJyApO1xuICB9O1xuICB0ZXN0Qm90aEF0dHJpYnV0ZXMoKTtcblxuICByb290Tm9kZS5yZW1vdmVDaGlsZCggYSApO1xuICByb290Tm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYSBdIH0gKSApO1xuICB0ZXN0Qm90aEF0dHJpYnV0ZXMoKTtcblxuICBhLnJlbW92ZVBET01BdHRyaWJ1dGUoICd0ZXN0Jywge1xuICAgIGVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HXG4gIH0gKTtcbiAgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcbiAgY29uc3QgYUxhYmVsRWxlbWVudCA9IGFFbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd0ZXN0JyApID09PSAndGVzdFZhbHVlJywgJ3JlbW92ZVBET01BdHRyaWJ1dGUgZm9yIGxhYmVsIHNob3VsZCBub3QgZWZmZWN0IHByaW1hcnkgc2libGluZyAnICk7XG4gIGFzc2VydC5vayggYUxhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd0ZXN0JyApID09PSBudWxsLCAncmVtb3ZlUERPTUF0dHJpYnV0ZSBmb3IgbGFiZWwgc2libGluZycgKTtcblxuICBhLnJlbW92ZVBET01BdHRyaWJ1dGVzKCk7XG4gIGNvbnN0IGF0dHJpYnV0ZU5hbWUgPSAnbXVsdGlUZXN0JztcbiAgYS5zZXRQRE9NQXR0cmlidXRlKCBhdHRyaWJ1dGVOYW1lLCAndHJ1ZScsIHtcbiAgICB0eXBlOiAnYXR0cmlidXRlJ1xuICB9ICk7XG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGFzc2VydC5vayggYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGVOYW1lICkgPT09ICd0cnVlJywgJ3R5cGU6YXR0cmlidXRlIHNob3VsZCBzZXQgYXR0cmlidXRlJyApO1xuXG4gIGEuc2V0UERPTUF0dHJpYnV0ZSggYXR0cmlidXRlTmFtZSwgZmFsc2UsIHtcbiAgICB0eXBlOiAncHJvcGVydHknXG4gIH0gKTtcbiAgYXNzZXJ0Lm9rKCAhYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGVOYW1lICksICd0eXBlOnByb3BlcnR5IHNob3VsZCByZW1vdmUgYXR0cmlidXRlJyApO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgZm9yIHRlc3RpbmdcbiAgYXNzZXJ0LmVxdWFsKCBhRWxlbWVudFsgYXR0cmlidXRlTmFtZSBdLCBmYWxzZSwgJ3R5cGU6cHJvcGVydHkgc2hvdWxkIHNldCBwcm9wZXJ0eScgKTtcblxuICBjb25zdCB0ZXN0QXR0cmlidXRlcyA9IGEuZ2V0UERPTUF0dHJpYnV0ZXMoKS5maWx0ZXIoIGEgPT4gYS5hdHRyaWJ1dGUgPT09IGF0dHJpYnV0ZU5hbWUgKTtcbiAgYXNzZXJ0Lm9rKCB0ZXN0QXR0cmlidXRlcy5sZW5ndGggPT09IDEsICd0eXBlIGNoYW5nZSBzaG91bGQgYWx0ZXIgdGhlIGF0dHJpYnV0ZSwgbm90IGFkZCBhIG5ldyBvbmUuJyApO1xuXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAncGRvbUNoZWNrZWQnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2lucHV0JywgaW5wdXRUeXBlOiAncmFkaW8nLCBwZG9tQ2hlY2tlZDogdHJ1ZSB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG4gIGxldCBhRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gIGFzc2VydC5vayggYUVsZW1lbnQuY2hlY2tlZCwgJ3Nob3VsZCBiZSBjaGVja2VkJyApO1xuXG4gIGEucGRvbUNoZWNrZWQgPSBmYWxzZTtcbiAgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICBhc3NlcnQub2soICFhRWxlbWVudC5jaGVja2VkLCAnc2hvdWxkIG5vdCBiZSBjaGVja2VkJyApO1xuXG4gIGEuaW5wdXRUeXBlID0gJ3JhbmdlJztcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgYS5wZG9tQ2hlY2tlZCA9IHRydWU7XG4gIH0sIC8uKi8sICdzaG91bGQgZmFpbCBpZiBpbnB1dFR5cGUgcmFuZ2UnICk7XG5cbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ3N3YXBWaXNpYmlsaXR5JywgYXNzZXJ0ID0+IHtcbiAgaWYgKCAhY2FuUnVuVGVzdHMgKSB7XG4gICAgYXNzZXJ0Lm9rKCB0cnVlLCAnU2tpcHBpbmcgdGVzdCBiZWNhdXNlIGRvY3VtZW50IGRvZXMgbm90IGhhdmUgZm9jdXMnICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2Ygc3dhcFZpc2liaWxpdHkgZnVuY3Rpb25cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdmFyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG4gIGRpc3BsYXkuaW5pdGlhbGl6ZUV2ZW50cygpO1xuXG4gIC8vIGEgY3VzdG9tIGZvY3VzIGhpZ2hsaWdodCAoc2luY2UgZHVtbXkgbm9kZSdzIGhhdmUgbm8gYm91bmRzKVxuICBjb25zdCBmb2N1c0hpZ2hsaWdodCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwLCAxMCApO1xuXG4gIC8vIGNyZWF0ZSBzb21lIG5vZGVzIGZvciB0ZXN0aW5nXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgZm9jdXNIaWdobGlnaHQ6IGZvY3VzSGlnaGxpZ2h0IH0gKTtcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBmb2N1c0hpZ2hsaWdodDogZm9jdXNIaWdobGlnaHQgfSApO1xuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGZvY3VzSGlnaGxpZ2h0OiBmb2N1c0hpZ2hsaWdodCB9ICk7XG5cbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcbiAgYS5jaGlsZHJlbiA9IFsgYiwgYyBdO1xuXG4gIC8vIHN3YXAgdmlzaWJpbGl0eSBiZXR3ZWVuIHR3byBub2RlcywgdmlzaWJpbGl0eSBzaG91bGQgYmUgc3dhcHBlZCBhbmQgbmVpdGhlciBzaG91bGQgaGF2ZSBrZXlib2FyZCBmb2N1c1xuICBiLnZpc2libGUgPSB0cnVlO1xuICBjLnZpc2libGUgPSBmYWxzZTtcbiAgYi5zd2FwVmlzaWJpbGl0eSggYyApO1xuICBhc3NlcnQuZXF1YWwoIGIudmlzaWJsZSwgZmFsc2UsICdiIHNob3VsZCBub3cgYmUgaW52aXNpYmxlJyApO1xuICBhc3NlcnQuZXF1YWwoIGMudmlzaWJsZSwgdHJ1ZSwgJ2Mgc2hvdWxkIG5vdyBiZSB2aXNpYmxlJyApO1xuICBhc3NlcnQuZXF1YWwoIGIuZm9jdXNlZCwgZmFsc2UsICdiIHNob3VsZCBub3QgaGF2ZSBmb2N1cyBhZnRlciBiZWluZyBtYWRlIGludmlzaWJsZScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBjLmZvY3VzZWQsIGZhbHNlLCAnYyBzaG91bGQgbm90IGhhdmUgIGZvY3VzIHNpbmNlIGIgZGlkIG5vdCBoYXZlIGZvY3VzJyApO1xuXG4gIC8vIHN3YXAgdmlzaWJpbGl0eSBiZXR3ZWVuIHR3byBub2RlcyB3aGVyZSB0aGUgb25lIHRoYXQgaXMgaW5pdGlhbGx5IHZpc2libGUgaGFzIGtleWJvYXJkIGZvY3VzLCB0aGUgbmV3bHkgdmlzaWJsZVxuICAvLyBub2RlIHRoZW4gcmVjZWl2ZSBmb2N1c1xuICBiLnZpc2libGUgPSB0cnVlO1xuICBjLnZpc2libGUgPSBmYWxzZTtcbiAgYi5mb2N1cygpO1xuICBiLnN3YXBWaXNpYmlsaXR5KCBjICk7XG4gIGFzc2VydC5lcXVhbCggYi52aXNpYmxlLCBmYWxzZSwgJ2Igc2hvdWxkIGJlIGludmlzaWJsZSBhZnRlciBzd2FwVmlzaWJpbGl0eScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBjLnZpc2libGUsIHRydWUsICdjIHNob3VsZCBiZSB2aXNpYmxlIGFmdGVyICBzd2FwVmlzaWJpbGl0eScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLmZvY3VzZWQsIGZhbHNlLCAnYiBzaG91bGQgbm8gbG9uZ2VyIGhhdmUgZm9jdXMgIGFmdGVyIHN3YXBWaXNpYmlsaXR5JyApO1xuICBhc3NlcnQuZXF1YWwoIGMuZm9jdXNlZCwgdHJ1ZSwgJ2Mgc2hvdWxkIG5vdyBoYXZlIGZvY3VzIGFmdGVyIHN3YXBWaXNpYmlsaXR5JyApO1xuXG4gIC8vIHN3YXAgdmlzaWJpbGl0eSBiZXR3ZWVuIHR3byBub2RlcyB3aGVyZSB0aGUgb25lIHRoYXQgaXMgaW5pdGlhbGx5IHZpc2libGUgaGFzIGtleWJvYXJkIGZvY3VzLCB0aGUgbmV3bHkgdmlzaWJsZVxuICAvLyBub2RlIHRoZW4gcmVjZWl2ZSBmb2N1cyAtIGxpa2UgdGhlIHByZXZpb3VzIHRlc3QgYnV0IGMuc3dhcFZpc2liaWxpdHkoIGIgKSBpcyB0aGUgc2FtZSBhcyBiLnN3YXBWaXNpYmlsaXR5KCBjIClcbiAgYi52aXNpYmxlID0gdHJ1ZTtcbiAgYy52aXNpYmxlID0gZmFsc2U7XG4gIGIuZm9jdXMoKTtcbiAgYi5zd2FwVmlzaWJpbGl0eSggYyApO1xuICBhc3NlcnQuZXF1YWwoIGIudmlzaWJsZSwgZmFsc2UsICdiIHNob3VsZCBiZSBpbnZpc2libGUgYWZ0ZXIgc3dhcFZpc2liaWxpdHknICk7XG4gIGFzc2VydC5lcXVhbCggYy52aXNpYmxlLCB0cnVlLCAnYyBzaG91bGQgYmUgdmlzaWJsZSBhZnRlciAgc3dhcFZpc2liaWxpdHknICk7XG4gIGFzc2VydC5lcXVhbCggYi5mb2N1c2VkLCBmYWxzZSwgJ2Igc2hvdWxkIG5vIGxvbmdlciBoYXZlIGZvY3VzICBhZnRlciBzd2FwVmlzaWJpbGl0eScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBjLmZvY3VzZWQsIHRydWUsICdjIHNob3VsZCBub3cgaGF2ZSBmb2N1cyBhZnRlciBzd2FwVmlzaWJpbGl0eScgKTtcblxuICAvLyBzd2FwIHZpc2liaWxpdHkgYmV0d2VlbiB0d28gbm9kZXMgd2hlcmUgdGhlIGZpcnN0IG5vZGUgaGFzIGZvY3VzLCBidXQgdGhlIHNlY29uZCBub2RlIGlzIG5vdCBmb2N1c2FibGUuIEFmdGVyXG4gIC8vIHN3YXBwaW5nLCBuZWl0aGVyIHNob3VsZCBoYXZlIGZvY3VzXG4gIGIudmlzaWJsZSA9IHRydWU7XG4gIGMudmlzaWJsZSA9IGZhbHNlO1xuICBiLmZvY3VzKCk7XG4gIGMuZm9jdXNhYmxlID0gZmFsc2U7XG4gIGIuc3dhcFZpc2liaWxpdHkoIGMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLnZpc2libGUsIGZhbHNlLCAnYiBzaG91bGQgYmUgaW52aXNpYmxlIGFmdGVyIHZpc2liaWxpdHkgaXMgc3dhcHBlZCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBjLnZpc2libGUsIHRydWUsICdjIHNob3VsZCBiZSB2aXNpYmxlIGFmdGVyIHZpc2liaWxpdHkgaXMgc3dhcHBlZCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLmZvY3VzZWQsIGZhbHNlLCAnYiBzaG91bGQgbm8gbG9uZ2VyIGhhdmUgZm9jdXMgYWZ0ZXIgdmlzaWJpbGl0eSBpcyBzd2FwcGVkJyApO1xuICBhc3NlcnQuZXF1YWwoIGMuZm9jdXNlZCwgZmFsc2UsICdjIHNob3VsZCBub3QgaGF2ZSBmb2N1cyBhZnRlciB2aXNpYmlsaXR5IGlzIHN3YXBwZWQgYmVjYXVzZSBpdCBpcyBub3QgZm9jdXNhYmxlJyApO1xuXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnQXJpYSBMYWJlbCBTZXR0ZXInLCBhc3NlcnQgPT4ge1xuXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIHN3YXBWaXNpYmlsaXR5IGZ1bmN0aW9uXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAvLyBjcmVhdGUgc29tZSBub2RlcyBmb3IgdGVzdGluZ1xuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGFyaWFMYWJlbDogVEVTVF9MQUJFTF8yIH0gKTtcblxuICBhc3NlcnQub2soIGEuYXJpYUxhYmVsID09PSBURVNUX0xBQkVMXzIsICdhcmlhLWxhYmVsIGdldHRlci9zZXR0ZXInICk7XG4gIGFzc2VydC5vayggYS5sYWJlbENvbnRlbnQgPT09IG51bGwsICdubyBvdGhlciBsYWJlbCBzZXQgd2l0aCBhcmlhLWxhYmVsJyApO1xuICBhc3NlcnQub2soIGEuaW5uZXJDb250ZW50ID09PSBudWxsLCAnbm8gaW5uZXIgY29udGVudCBzZXQgd2l0aCBhcmlhLWxhYmVsJyApO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG4gIGxldCBidXR0b25BID0gYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchO1xuICBhc3NlcnQub2soIGJ1dHRvbkEuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbCcgKSA9PT0gVEVTVF9MQUJFTF8yLCAnc2V0dGVyIG9uIGRvbSBlbGVtZW50JyApO1xuICBhc3NlcnQub2soIGJ1dHRvbkEuaW5uZXJIVE1MID09PSAnJywgJ25vIGlubmVyIGh0bWwgd2l0aCBhcmlhLWxhYmVsIHNldHRlcicgKTtcblxuICBhLmFyaWFMYWJlbCA9IG51bGw7XG5cbiAgYnV0dG9uQSA9IGEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgYXNzZXJ0Lm9rKCAhYnV0dG9uQS5oYXNBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApLCAnc2V0dGVyIGNhbiBjbGVhciBvbiBkb20gZWxlbWVudCcgKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25BLmlubmVySFRNTCA9PT0gJycsICdubyBpbm5lciBodG1sIHdpdGggYXJpYS1sYWJlbCBzZXR0ZXIgd2hlbiBjbGVhcmluZycgKTtcbiAgYXNzZXJ0Lm9rKCBhLmFyaWFMYWJlbCA9PT0gbnVsbCwgJ2NsZWFyZWQgaW4gTm9kZSBtb2RlbC4nICk7XG5cbiAgcGRvbUF1ZGl0Um9vdE5vZGUoIHJvb3ROb2RlICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdmb2N1c2FibGUgb3B0aW9uJywgYXNzZXJ0ID0+IHtcbiAgaWYgKCAhY2FuUnVuVGVzdHMgKSB7XG4gICAgYXNzZXJ0Lm9rKCB0cnVlLCAnU2tpcHBpbmcgdGVzdCBiZWNhdXNlIGRvY3VtZW50IGRvZXMgbm90IGhhdmUgZm9jdXMnICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2YgZm9jdXNhYmxlIGZ1bmN0aW9uXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBkaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBhLmZvY3VzYWJsZSwgdHJ1ZSwgJ2ZvY3VzYWJsZSBvcHRpb24gc2V0dGVyJyApO1xuICBhc3NlcnQub2soIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLnRhYkluZGV4ID09PSAwLCAndGFiIGluZGV4IG9uIHByaW1hcnkgc2libGluZyB3aXRoIHNldHRlcicgKTtcblxuICAvLyBjaGFuZ2UgdGhlIHRhZyBuYW1lLCBidXQgZm9jdXNhYmxlIHNob3VsZCBzdGF5IHRoZSBzYW1lXG4gIGEudGFnTmFtZSA9ICdwJztcblxuICBhc3NlcnQuZXF1YWwoIGEuZm9jdXNhYmxlLCB0cnVlLCAndGFnTmFtZSBvcHRpb24gc2hvdWxkIG5vdCBjaGFuZ2UgZm9jdXNhYmxlIHZhbHVlJyApO1xuICBhc3NlcnQub2soIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLnRhYkluZGV4ID09PSAwLCAndGFnTmFtZSBvcHRpb24gc2hvdWxkIG5vdCBjaGFuZ2UgdGFiIGluZGV4IG9uIHByaW1hcnkgc2libGluZycgKTtcblxuICBhLmZvY3VzYWJsZSA9IGZhbHNlO1xuICBhc3NlcnQub2soIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLnRhYkluZGV4ID09PSAtMSwgJ3NldCBmb2N1c2FibGUgZmFsc2UnICk7XG5cbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdwJyB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBiICk7XG5cbiAgYi5mb2N1c2FibGUgPSB0cnVlO1xuXG4gIGFzc2VydC5vayggYi5mb2N1c2FibGUsICdzZXQgZm9jdXNhYmxlIGFzIHNldHRlcicgKTtcbiAgYXNzZXJ0Lm9rKCBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGIgKS50YWJJbmRleCA9PT0gMCwgJ3NldCBmb2N1c2FibGUgYXMgc2V0dGVyJyApO1xuXG4gIC8vIEhUTUwgZWxlbWVudHMgdGhhdCBhcmUgbmF0aXZlbHkgZm9jdXNhYmxlIGFyZSBmb2N1c2FibGUgYnkgZGVmYXVsdFxuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuICBhc3NlcnQub2soIGMuZm9jdXNhYmxlLCAnYnV0dG9uIGlzIGZvY3VzYWJsZSBieSBkZWZhdWx0JyApO1xuXG4gIC8vIGNoYW5nZSB0YWdOYW1lIHRvIHNvbWV0aGluZyB0aGF0IGlzIG5vdCBmb2N1c2FibGUsIGZvY3VzYWJsZSBzaG91bGQgYmUgZmFsc2VcbiAgYy50YWdOYW1lID0gJ3AnO1xuICBhc3NlcnQub2soICFjLmZvY3VzYWJsZSwgJ2J1dHRvbiBjaGFuZ2VkIHRvIHBhcmFncmFwaCwgc2hvdWxkIG5vIGxvbmdlciBiZSBmb2N1c2FibGUnICk7XG5cbiAgLy8gV2hlbiBmb2N1c2FibGUgaXMgc2V0IHRvIG51bGwgb24gYW4gZWxlbWVudCB0aGF0IGlzIG5vdCBmb2N1c2FibGUgYnkgZGVmYXVsdCwgaXQgc2hvdWxkIGxvc2UgZm9jdXNcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiBmb2N1c0hpZ2hsaWdodCB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBkICk7XG4gIGQuZm9jdXMoKTtcbiAgYXNzZXJ0Lm9rKCBkLmZvY3VzZWQsICdmb2N1c2FibGUgZGl2IHNob3VsZCBiZSBmb2N1c2VkIGFmdGVyIGNhbGxpbmcgZm9jdXMoKScgKTtcblxuICBkLmZvY3VzYWJsZSA9IG51bGw7XG4gIGFzc2VydC5vayggIWQuZm9jdXNlZCwgJ2RlZmF1bHQgZGl2IHNob3VsZCBsb3NlIGZvY3VzIGFmdGVyIG5vZGUgcmVzdG9yZWQgdG8gbnVsbCBmb2N1c2FibGUnICk7XG5cbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ2FwcGVuZCBzaWJsaW5ncy9hcHBlbmRMYWJlbC9hcHBlbmREZXNjcmlwdGlvbiBzZXR0ZXJzJywgYXNzZXJ0ID0+IHtcblxuICAvLyB0ZXN0IHRoZSBiZWhhdmlvciBvZiBmb2N1c2FibGUgZnVuY3Rpb25cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7XG4gICAgdGFnTmFtZTogJ2xpJyxcbiAgICBpbm5lckNvbnRlbnQ6IFRFU1RfSU5ORVJfQ09OVEVOVCxcbiAgICBsYWJlbFRhZ05hbWU6ICdoMycsXG4gICAgbGFiZWxDb250ZW50OiBURVNUX0xBQkVMLFxuICAgIGRlc2NyaXB0aW9uQ29udGVudDogVEVTVF9ERVNDUklQVElPTixcbiAgICBjb250YWluZXJUYWdOYW1lOiAnc2VjdGlvbicsXG4gICAgYXBwZW5kTGFiZWw6IHRydWVcbiAgfSApO1xuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xuXG4gIGNvbnN0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGxldCBjb250YWluZXJFbGVtZW50ID0gYUVsZW1lbnQucGFyZW50RWxlbWVudCE7XG4gIGFzc2VydC5vayggY29udGFpbmVyRWxlbWVudC50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdTRUNUSU9OJywgJ2NvbnRhaW5lciBwYXJlbnQgaXMgc2V0IHRvIHJpZ2h0IHRhZycgKTtcblxuICBsZXQgcGVlckVsZW1lbnRzID0gY29udGFpbmVyRWxlbWVudC5jaGlsZE5vZGVzIGFzIHVua25vd24gYXMgSFRNTEVsZW1lbnRbXTtcbiAgYXNzZXJ0Lm9rKCBwZWVyRWxlbWVudHMubGVuZ3RoID09PSAzLCAnZXhwZWN0ZWQgdGhyZWUgc2libGluZ3MnICk7XG4gIGFzc2VydC5vayggcGVlckVsZW1lbnRzWyAwIF0udGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSBERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FLCAnZGVzY3JpcHRpb24gZmlyc3Qgc2libGluZycgKTtcbiAgYXNzZXJ0Lm9rKCBwZWVyRWxlbWVudHNbIDEgXS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdMSScsICdwcmltYXJ5IHNpYmxpbmcgc2Vjb25kIHNpYmxpbmcnICk7XG4gIGFzc2VydC5vayggcGVlckVsZW1lbnRzWyAyIF0udGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnSDMnLCAnbGFiZWwgc2libGluZyBsYXN0JyApO1xuXG4gIGEuYXBwZW5kRGVzY3JpcHRpb24gPSB0cnVlO1xuICBjb250YWluZXJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICkucGFyZW50RWxlbWVudCE7XG4gIHBlZXJFbGVtZW50cyA9IGNvbnRhaW5lckVsZW1lbnQuY2hpbGROb2RlcyBhcyB1bmtub3duIGFzIEhUTUxFbGVtZW50W107XG4gIGFzc2VydC5vayggY29udGFpbmVyRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMywgJ2V4cGVjdGVkIHRocmVlIHNpYmxpbmdzJyApO1xuICBhc3NlcnQub2soIHBlZXJFbGVtZW50c1sgMCBdLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gJ0xJJywgJ3ByaW1hcnkgc2libGluZyBmaXJzdCBzaWJsaW5nJyApO1xuICBhc3NlcnQub2soIHBlZXJFbGVtZW50c1sgMSBdLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gJ0gzJywgJ2xhYmVsIHNpYmxpbmcgc2Vjb25kJyApO1xuICBhc3NlcnQub2soIHBlZXJFbGVtZW50c1sgMiBdLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSwgJ2Rlc2NyaXB0aW9uIGxhc3Qgc2libGluZycgKTtcblxuICAvLyBjbGVhciBpdCBvdXQgYmFjayB0byBkZWZhdWx0cyBzaG91bGQgd29yayB3aXRoIHNldHRlcnNcbiAgYS5hcHBlbmREZXNjcmlwdGlvbiA9IGZhbHNlO1xuICBhLmFwcGVuZExhYmVsID0gZmFsc2U7XG4gIGNvbnRhaW5lckVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKS5wYXJlbnRFbGVtZW50ITtcbiAgcGVlckVsZW1lbnRzID0gY29udGFpbmVyRWxlbWVudC5jaGlsZE5vZGVzIGFzIHVua25vd24gYXMgSFRNTEVsZW1lbnRbXTtcbiAgYXNzZXJ0Lm9rKCBjb250YWluZXJFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoID09PSAzLCAnZXhwZWN0ZWQgdGhyZWUgc2libGluZ3MnICk7XG4gIGFzc2VydC5vayggcGVlckVsZW1lbnRzWyAwIF0udGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnSDMnLCAnbGFiZWwgc2libGluZyBmaXJzdCcgKTtcbiAgYXNzZXJ0Lm9rKCBwZWVyRWxlbWVudHNbIDEgXS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09IERFRkFVTFRfREVTQ1JJUFRJT05fVEFHX05BTUUsICdkZXNjcmlwdGlvbiBzaWJsaW5nIHNlY29uZCcgKTtcbiAgYXNzZXJ0Lm9rKCBwZWVyRWxlbWVudHNbIDIgXS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdMSScsICdwcmltYXJ5IHNpYmxpbmcgbGFzdCcgKTtcblxuICAvLyB0ZXN0IG9yZGVyIHdoZW4gdXNpbmcgYXBwZW5kTGFiZWwvYXBwZW5kRGVzY3JpcHRpb24gd2l0aG91dCBhIHBhcmVudCBjb250YWluZXIgLSBvcmRlciBzaG91bGQgYmUgcHJpbWFyeSBzaWJsaW5nLFxuICAvLyBsYWJlbCBzaWJsaW5nLCBkZXNjcmlwdGlvbiBzaWJsaW5nXG4gIGNvbnN0IGIgPSBuZXcgTm9kZSgge1xuICAgIHRhZ05hbWU6ICdpbnB1dCcsXG4gICAgaW5wdXRUeXBlOiAnY2hlY2tib3gnLFxuICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcbiAgICBsYWJlbENvbnRlbnQ6IFRFU1RfTEFCRUwsXG4gICAgZGVzY3JpcHRpb25Db250ZW50OiBURVNUX0RFU0NSSVBUSU9OLFxuICAgIGFwcGVuZExhYmVsOiB0cnVlLFxuICAgIGFwcGVuZERlc2NyaXB0aW9uOiB0cnVlXG4gIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGIgKTtcblxuICBsZXQgYlBlZXIgPSBnZXRQRE9NUGVlckJ5Tm9kZSggYiApO1xuICBsZXQgYkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGIgKTtcbiAgbGV0IGJFbGVtZW50UGFyZW50ID0gYkVsZW1lbnQucGFyZW50RWxlbWVudCE7XG4gIGxldCBpbmRleE9mUHJpbWFyeUVsZW1lbnQgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKCBiRWxlbWVudFBhcmVudC5jaGlsZE5vZGVzLCBiRWxlbWVudCApO1xuXG4gIGFzc2VydC5vayggYkVsZW1lbnRQYXJlbnQuY2hpbGROb2Rlc1sgaW5kZXhPZlByaW1hcnlFbGVtZW50IF0gPT09IGJFbGVtZW50LCAnYiBwcmltYXJ5IHNpYmxpbmcgZmlyc3Qgd2l0aCBubyBjb250YWluZXIsIGJvdGggYXBwZW5kZWQnICk7XG4gIGFzc2VydC5vayggYkVsZW1lbnRQYXJlbnQuY2hpbGROb2Rlc1sgaW5kZXhPZlByaW1hcnlFbGVtZW50ICsgMSBdID09PSBiUGVlci5sYWJlbFNpYmxpbmcsICdiIGxhYmVsIHNpYmxpbmcgc2Vjb25kIHdpdGggbm8gY29udGFpbmVyLCBib3RoIGFwcGVuZGVkJyApO1xuICBhc3NlcnQub2soIGJFbGVtZW50UGFyZW50LmNoaWxkTm9kZXNbIGluZGV4T2ZQcmltYXJ5RWxlbWVudCArIDIgXSA9PT0gYlBlZXIuZGVzY3JpcHRpb25TaWJsaW5nLCAnYiBkZXNjcmlwdGlvbiBzaWJsaW5nIHRoaXJkIHdpdGggbm8gY29udGFpbmVyLCBib3RoIGFwcGVuZGVkJyApO1xuXG4gIC8vIHRlc3Qgb3JkZXIgd2hlbiBvbmx5IGRlc2NyaXB0aW9uIGFwcGVuZGVkIGFuZCBubyBwYXJlbnQgY29udGFpbmVyIC0gb3JkZXIgc2hvdWxkIGJlIGxhYmVsLCBwcmltYXJ5LCB0aGVuXG4gIC8vIGRlc2NyaXB0aW9uXG4gIGIuYXBwZW5kTGFiZWwgPSBmYWxzZTtcblxuICAvLyByZWZyZXNoIHNpbmNlIG9wZXJhdGlvbiBtYXkgaGF2ZSBjcmVhdGVkIG5ldyBPYmplY3RzXG4gIGJQZWVyID0gZ2V0UERPTVBlZXJCeU5vZGUoIGIgKTtcbiAgYkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGIgKTtcbiAgYkVsZW1lbnRQYXJlbnQgPSBiRWxlbWVudC5wYXJlbnRFbGVtZW50ITtcbiAgaW5kZXhPZlByaW1hcnlFbGVtZW50ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCggYkVsZW1lbnRQYXJlbnQuY2hpbGROb2RlcywgYkVsZW1lbnQgKTtcblxuICBhc3NlcnQub2soIGJFbGVtZW50UGFyZW50LmNoaWxkTm9kZXNbIGluZGV4T2ZQcmltYXJ5RWxlbWVudCAtIDEgXSA9PT0gYlBlZXIubGFiZWxTaWJsaW5nLCAnYiBsYWJlbCBzaWJsaW5nIGZpcnN0IHdpdGggbm8gY29udGFpbmVyLCBkZXNjcmlwdGlvbiBhcHBlbmRlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudFBhcmVudC5jaGlsZE5vZGVzWyBpbmRleE9mUHJpbWFyeUVsZW1lbnQgXSA9PT0gYkVsZW1lbnQsICdiIHByaW1hcnkgc2libGluZyBzZWNvbmQgd2l0aCBubyBjb250YWluZXIsIGRlc2NyaXB0aW9uIGFwcGVuZGVkJyApO1xuICBhc3NlcnQub2soIGJFbGVtZW50UGFyZW50LmNoaWxkTm9kZXNbIGluZGV4T2ZQcmltYXJ5RWxlbWVudCArIDEgXSA9PT0gYlBlZXIuZGVzY3JpcHRpb25TaWJsaW5nLCAnYiBkZXNjcmlwdGlvbiBzaWJsaW5nIHRoaXJkIHdpdGggbm8gY29udGFpbmVyLCBkZXNjcmlwdGlvbiBhcHBlbmRlZCcgKTtcblxuICBwZG9tQXVkaXRSb290Tm9kZSggcm9vdE5vZGUgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ2NvbnRhaW5lckFyaWFSb2xlIG9wdGlvbicsIGFzc2VydCA9PiB7XG5cbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2YgZm9jdXNhYmxlIGZ1bmN0aW9uXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgge1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnLFxuICAgIGNvbnRhaW5lckFyaWFSb2xlOiAnYXBwbGljYXRpb24nXG4gIH0gKTtcblxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xuICBhc3NlcnQub2soIGEuY29udGFpbmVyQXJpYVJvbGUgPT09ICdhcHBsaWNhdGlvbicsICdyb2xlIGF0dHJpYnV0ZSBzaG91bGQgYmUgb24gbm9kZSBwcm9wZXJ0eScgKTtcbiAgbGV0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGFzc2VydC5vayggYUVsZW1lbnQucGFyZW50RWxlbWVudCEuZ2V0QXR0cmlidXRlKCAncm9sZScgKSA9PT0gJ2FwcGxpY2F0aW9uJywgJ3JvbGUgYXR0cmlidXRlIHNob3VsZCBiZSBvbiBwYXJlbnQgZWxlbWVudCcgKTtcblxuICBhLmNvbnRhaW5lckFyaWFSb2xlID0gbnVsbDtcbiAgYXNzZXJ0Lm9rKCBhLmNvbnRhaW5lckFyaWFSb2xlID09PSBudWxsLCAncm9sZSBhdHRyaWJ1dGUgc2hvdWxkIGJlIGNsZWFyZWQgb24gbm9kZScgKTtcbiAgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5wYXJlbnRFbGVtZW50IS5nZXRBdHRyaWJ1dGUoICdyb2xlJyApID09PSBudWxsLCAncm9sZSBhdHRyaWJ1dGUgc2hvdWxkIGJlIGNsZWFyZWQgb24gcGFyZW50IGVsZW1lbnQnICk7XG5cbiAgcGRvbUF1ZGl0Um9vdE5vZGUoIHJvb3ROb2RlICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdhcmlhUm9sZSBvcHRpb24nLCBhc3NlcnQgPT4ge1xuXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIGZvY3VzYWJsZSBmdW5jdGlvblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHtcbiAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICBpbm5lckNvbnRlbnQ6ICdEcmFnZ2FibGUnLFxuICAgIGFyaWFSb2xlOiAnYXBwbGljYXRpb24nXG4gIH0gKTtcblxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xuICBhc3NlcnQub2soIGEuYXJpYVJvbGUgPT09ICdhcHBsaWNhdGlvbicsICdyb2xlIGF0dHJpYnV0ZSBzaG91bGQgYmUgb24gbm9kZSBwcm9wZXJ0eScgKTtcbiAgbGV0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGFzc2VydC5vayggYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCAncm9sZScgKSA9PT0gJ2FwcGxpY2F0aW9uJywgJ3JvbGUgYXR0cmlidXRlIHNob3VsZCBiZSBvbiBlbGVtZW50JyApO1xuXG4gIGEuYXJpYVJvbGUgPSBudWxsO1xuICBhc3NlcnQub2soIGEuYXJpYVJvbGUgPT09IG51bGwsICdyb2xlIGF0dHJpYnV0ZSBzaG91bGQgYmUgY2xlYXJlZCBvbiBub2RlJyApO1xuICBhRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApO1xuICBhc3NlcnQub2soIGFFbGVtZW50LmdldEF0dHJpYnV0ZSggJ3JvbGUnICkgPT09IG51bGwsICdyb2xlIGF0dHJpYnV0ZSBzaG91bGQgYmUgY2xlYXJlZCBvbiBlbGVtZW50JyApO1xuXG4gIHBkb21BdWRpdFJvb3ROb2RlKCByb290Tm9kZSApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxufSApO1xuXG5cbi8vIEhpZ2hlciBsZXZlbCBzZXR0ZXIvZ2V0dGVyIG9wdGlvbnNcblFVbml0LnRlc3QoICdhY2Nlc3NpYmxlTmFtZSBvcHRpb24nLCBhc3NlcnQgPT4ge1xuXG4gIGFzc2VydC5vayggdHJ1ZSApO1xuXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIGZvY3VzYWJsZSBmdW5jdGlvblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBhY2Nlc3NpYmxlTmFtZTogVEVTVF9MQUJFTCB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG5cbiAgYXNzZXJ0Lm9rKCBhLmFjY2Vzc2libGVOYW1lID09PSBURVNUX0xBQkVMLCAnYWNjZXNzaWJsZU5hbWUgZ2V0dGVyJyApO1xuXG4gIGNvbnN0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XG4gIGFzc2VydC5vayggYUVsZW1lbnQudGV4dENvbnRlbnQgPT09IFRFU1RfTEFCRUwsICdhY2Nlc3NpYmxlTmFtZSBzZXR0ZXIgb24gZGl2JyApO1xuXG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnaW5wdXQnLCBhY2Nlc3NpYmxlTmFtZTogVEVTVF9MQUJFTCwgaW5wdXRUeXBlOiAncmFuZ2UnIH0gKTtcbiAgYS5hZGRDaGlsZCggYiApO1xuICBjb25zdCBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApO1xuICBjb25zdCBiUGFyZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkucGFyZW50RWxlbWVudCE7XG4gIGNvbnN0IGJMYWJlbFNpYmxpbmcgPSBiUGFyZW50LmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcbiAgYXNzZXJ0Lm9rKCBiTGFiZWxTaWJsaW5nLnRleHRDb250ZW50ID09PSBURVNUX0xBQkVMLCAnYWNjZXNzaWJsZU5hbWUgc2V0cyBsYWJlbCBzaWJsaW5nJyApO1xuICBhc3NlcnQub2soIGJMYWJlbFNpYmxpbmcuZ2V0QXR0cmlidXRlKCAnZm9yJyApIS5pbmNsdWRlcyggYkVsZW1lbnQuaWQgKSwgJ2FjY2Vzc2libGVOYW1lIHNldHMgbGFiZWxcXCdzIFwiZm9yXCIgYXR0cmlidXRlJyApO1xuXG4gIGNvbnN0IGMgPSBuZXcgTm9kZSggeyBjb250YWluZXJUYWdOYW1lOiAnZGl2JywgdGFnTmFtZTogJ2RpdicsIGFyaWFMYWJlbDogJ292ZXJyaWRlVGhpcycgfSApO1xuICByb290Tm9kZS5hZGRDaGlsZCggYyApO1xuICBjb25zdCBjQWNjZXNzaWJsZU5hbWVCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb24gPSAoIG5vZGUsIG9wdGlvbnMsIGFjY2Vzc2libGVOYW1lICkgPT4ge1xuICAgIG9wdGlvbnMuYXJpYUxhYmVsID0gYWNjZXNzaWJsZU5hbWU7XG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH07XG4gIGMuYWNjZXNzaWJsZU5hbWVCZWhhdmlvciA9IGNBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yO1xuXG4gIGFzc2VydC5vayggYy5hY2Nlc3NpYmxlTmFtZUJlaGF2aW9yID09PSBjQWNjZXNzaWJsZU5hbWVCZWhhdmlvciwgJ2dldHRlciB3b3JrcycgKTtcblxuICBsZXQgY0xhYmVsRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYyApLnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcbiAgYXNzZXJ0Lm9rKCBjTGFiZWxFbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnICkgPT09ICdvdmVycmlkZVRoaXMnLCAnYWNjZXNzaWJsZU5hbWVCZWhhdmlvciBzaG91bGQgbm90IHdvcmsgdW50aWwgdGhlcmUgaXMgYWNjZXNzaWJsZSBuYW1lJyApO1xuICBjLmFjY2Vzc2libGVOYW1lID0gJ2FjY2Vzc2libGUgbmFtZSBkZXNjcmlwdGlvbic7XG4gIGNMYWJlbEVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGMgKS5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblsgREVGQVVMVF9MQUJFTF9TSUJMSU5HX0lOREVYIF07XG4gIGFzc2VydC5vayggY0xhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApID09PSAnYWNjZXNzaWJsZSBuYW1lIGRlc2NyaXB0aW9uJywgJ2FjY2Vzc2libGUgbmFtZSBzZXR0ZXInICk7XG5cbiAgYy5hY2Nlc3NpYmxlTmFtZSA9ICcnO1xuXG4gIGNMYWJlbEVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGMgKS5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblsgREVGQVVMVF9MQUJFTF9TSUJMSU5HX0lOREVYIF07XG4gIGFzc2VydC5vayggY0xhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApID09PSAnJywgJ2FjY2Vzc2libGVOYW1lQmVoYXZpb3Igc2hvdWxkIHdvcmsgZm9yIGVtcHR5IHN0cmluZycgKTtcblxuICBjLmFjY2Vzc2libGVOYW1lID0gbnVsbDtcbiAgY0xhYmVsRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYyApLnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcbiAgYXNzZXJ0Lm9rKCBjTGFiZWxFbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnICkgPT09ICdvdmVycmlkZVRoaXMnLCAnYWNjZXNzaWJsZU5hbWVCZWhhdmlvciBzaG91bGQgbm90IHdvcmsgdW50aWwgdGhlcmUgaXMgYWNjZXNzaWJsZSBuYW1lJyApO1xuXG5cbiAgY29uc3QgZCA9IG5ldyBOb2RlKCB7IGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnLCB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBkICk7XG4gIGNvbnN0IGRBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiA9ICggbm9kZSwgb3B0aW9ucywgYWNjZXNzaWJsZU5hbWUgKSA9PiB7XG5cbiAgICBvcHRpb25zLmFyaWFMYWJlbCA9IGFjY2Vzc2libGVOYW1lO1xuICAgIHJldHVybiBvcHRpb25zO1xuICB9O1xuICBkLmFjY2Vzc2libGVOYW1lQmVoYXZpb3IgPSBkQWNjZXNzaWJsZU5hbWVCZWhhdmlvcjtcblxuICBhc3NlcnQub2soIGQuYWNjZXNzaWJsZU5hbWVCZWhhdmlvciA9PT0gZEFjY2Vzc2libGVOYW1lQmVoYXZpb3IsICdnZXR0ZXIgd29ya3MnICk7XG4gIGxldCBkTGFiZWxFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBkICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCBdO1xuICBhc3NlcnQub2soIGRMYWJlbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbCcgKSA9PT0gbnVsbCwgJ2FjY2Vzc2libGVOYW1lQmVoYXZpb3Igc2hvdWxkIG5vdCB3b3JrIHVudGlsIHRoZXJlIGlzIGFjY2Vzc2libGUgbmFtZScgKTtcbiAgY29uc3QgYWNjZXNzaWJsZU5hbWVEZXNjcmlwdGlvbiA9ICdhY2Nlc3NpYmxlIG5hbWUgZGVzY3JpcHRpb24nO1xuICBkLmFjY2Vzc2libGVOYW1lID0gYWNjZXNzaWJsZU5hbWVEZXNjcmlwdGlvbjtcbiAgZExhYmVsRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggZCApLnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcbiAgYXNzZXJ0Lm9rKCBkTGFiZWxFbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnICkgPT09IGFjY2Vzc2libGVOYW1lRGVzY3JpcHRpb24sICdhY2Nlc3NpYmxlIG5hbWUgc2V0dGVyJyApO1xuXG4gIGQuYWNjZXNzaWJsZU5hbWUgPSAnJztcblxuICBkTGFiZWxFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBkICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCBdO1xuICBhc3NlcnQub2soIGRMYWJlbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbCcgKSA9PT0gJycsICdhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIHNob3VsZCB3b3JrIGZvciBlbXB0eSBzdHJpbmcnICk7XG5cbiAgZC5hY2Nlc3NpYmxlTmFtZSA9IG51bGw7XG4gIGRMYWJlbEVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGQgKS5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblsgREVGQVVMVF9MQUJFTF9TSUJMSU5HX0lOREVYIF07XG4gIGFzc2VydC5vayggZExhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApID09PSBudWxsLCAnYWNjZXNzaWJsZU5hbWVCZWhhdmlvciBzaG91bGQgbm90IHdvcmsgdW50aWwgdGhlcmUgaXMgYWNjZXNzaWJsZSBuYW1lJyApO1xuXG4gIHBkb21BdWRpdFJvb3ROb2RlKCByb290Tm9kZSApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbn0gKTtcblxuXG5RVW5pdC50ZXN0KCAncGRvbUhlYWRpbmcgb3B0aW9uJywgYXNzZXJ0ID0+IHtcblxuICBhc3NlcnQub2soIHRydWUgKTtcblxuICAvLyB0ZXN0IHRoZSBiZWhhdmlvciBvZiBmb2N1c2FibGUgZnVuY3Rpb25cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdmFyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgcGRvbUhlYWRpbmc6IFRFU1RfTEFCRUwsIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcblxuICBhc3NlcnQub2soIGEucGRvbUhlYWRpbmcgPT09IFRFU1RfTEFCRUwsICdhY2Nlc3NpYmxlTmFtZSBnZXR0ZXInICk7XG5cbiAgY29uc3QgYUxhYmVsU2libGluZyA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcbiAgYXNzZXJ0Lm9rKCBhTGFiZWxTaWJsaW5nLnRleHRDb250ZW50ID09PSBURVNUX0xBQkVMLCAncGRvbUhlYWRpbmcgc2V0dGVyIG9uIGRpdicgKTtcbiAgYXNzZXJ0Lm9rKCBhTGFiZWxTaWJsaW5nLnRhZ05hbWUgPT09ICdIMScsICdwZG9tSGVhZGluZyBzZXR0ZXIgc2hvdWxkIGJlIGgxJyApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxufSApO1xuXG5RVW5pdC50ZXN0KCAnaGVscFRleHQgb3B0aW9uJywgYXNzZXJ0ID0+IHtcblxuICBhc3NlcnQub2soIHRydWUgKTtcblxuICAvLyB0ZXN0IHRoZSBiZWhhdmlvciBvZiBmb2N1c2FibGUgZnVuY3Rpb25cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdmFyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG4gIC8vIGxhYmVsIHRhZyBuZWVkZWQgZm9yIGRlZmF1bHQgc2libGluZyBpbmRpY2VzIHRvIHdvcmtcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7XG4gICAgY29udGFpbmVyVGFnTmFtZTogJ2RpdicsXG4gICAgdGFnTmFtZTogJ2RpdicsXG4gICAgbGFiZWxUYWdOYW1lOiAnZGl2JyxcbiAgICBoZWxwVGV4dDogVEVTVF9ERVNDUklQVElPTlxuICB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG5cbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdpbnB1dCcsIGlucHV0VHlwZTogJ3JhbmdlJyB9ICkgKTtcbiAgYXNzZXJ0Lm9rKCBhLmhlbHBUZXh0ID09PSBURVNUX0RFU0NSSVBUSU9OLCAnaGVscFRleHQgZ2V0dGVyJyApO1xuXG4gIC8vIGRlZmF1bHQgZm9yIGhlbHAgdGV4dCBpcyB0byBhcHBlbmQgZGVzY3JpcHRpb24gYWZ0ZXIgdGhlIHByaW1hcnkgc2libGluZ1xuICBjb25zdCBhRGVzY3JpcHRpb25FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIEFQUEVOREVEX0RFU0NSSVBUSU9OX1NJQkxJTkdfSU5ERVggXTtcbiAgYXNzZXJ0Lm9rKCBhRGVzY3JpcHRpb25FbGVtZW50LnRleHRDb250ZW50ID09PSBURVNUX0RFU0NSSVBUSU9OLCAnaGVscFRleHQgc2V0dGVyIG9uIGRpdicgKTtcblxuICBjb25zdCBiID0gbmV3IE5vZGUoIHtcbiAgICBjb250YWluZXJUYWdOYW1lOiAnZGl2JyxcbiAgICB0YWdOYW1lOiAnYnV0dG9uJyxcbiAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6ICdvdmVycmlkZVRoaXMnLFxuICAgIGxhYmVsVGFnTmFtZTogJ2RpdidcbiAgfSApO1xuICByb290Tm9kZS5hZGRDaGlsZCggYiApO1xuXG4gIGIuaGVscFRleHRCZWhhdmlvciA9ICggbm9kZSwgb3B0aW9ucywgaGVscFRleHQgKSA9PiB7XG5cbiAgICBvcHRpb25zLmRlc2NyaXB0aW9uVGFnTmFtZSA9ICdwJztcbiAgICBvcHRpb25zLmRlc2NyaXB0aW9uQ29udGVudCA9IGhlbHBUZXh0O1xuICAgIHJldHVybiBvcHRpb25zO1xuICB9O1xuXG4gIGxldCBiRGVzY3JpcHRpb25FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfREVTQ1JJUFRJT05fU0lCTElOR19JTkRFWCBdO1xuICBhc3NlcnQub2soIGJEZXNjcmlwdGlvbkVsZW1lbnQudGV4dENvbnRlbnQgPT09ICdvdmVycmlkZVRoaXMnLCAnaGVscFRleHRCZWhhdmlvciBzaG91bGQgbm90IHdvcmsgdW50aWwgdGhlcmUgaXMgaGVscCB0ZXh0JyApO1xuICBiLmhlbHBUZXh0ID0gJ2hlbHAgdGV4dCBkZXNjcmlwdGlvbic7XG4gIGJEZXNjcmlwdGlvbkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGIgKS5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblsgREVGQVVMVF9ERVNDUklQVElPTl9TSUJMSU5HX0lOREVYIF07XG4gIGFzc2VydC5vayggYkRlc2NyaXB0aW9uRWxlbWVudC50ZXh0Q29udGVudCA9PT0gJ2hlbHAgdGV4dCBkZXNjcmlwdGlvbicsICdoZWxwIHRleHQgc2V0dGVyJyApO1xuXG4gIGIuaGVscFRleHQgPSAnJztcblxuICBiRGVzY3JpcHRpb25FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfREVTQ1JJUFRJT05fU0lCTElOR19JTkRFWCBdO1xuICBhc3NlcnQub2soIGJEZXNjcmlwdGlvbkVsZW1lbnQudGV4dENvbnRlbnQgPT09ICcnLCAnaGVscFRleHRCZWhhdmlvciBzaG91bGQgd29yayBmb3IgZW1wdHkgc3RyaW5nJyApO1xuXG4gIGIuaGVscFRleHQgPSBudWxsO1xuICBiRGVzY3JpcHRpb25FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfREVTQ1JJUFRJT05fU0lCTElOR19JTkRFWCBdO1xuICBhc3NlcnQub2soIGJEZXNjcmlwdGlvbkVsZW1lbnQudGV4dENvbnRlbnQgPT09ICdvdmVycmlkZVRoaXMnLCAnaGVscFRleHRCZWhhdmlvciBzaG91bGQgbm90IHdvcmsgdW50aWwgdGhlcmUgaXMgaGVscCB0ZXh0JyApO1xuXG4gIHBkb21BdWRpdFJvb3ROb2RlKCByb290Tm9kZSApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ21vdmUgdG8gZnJvbnQvbW92ZSB0byBiYWNrJywgYXNzZXJ0ID0+IHtcbiAgaWYgKCAhY2FuUnVuVGVzdHMgKSB7XG4gICAgYXNzZXJ0Lm9rKCB0cnVlLCAnU2tpcHBpbmcgdGVzdCBiZWNhdXNlIGRvY3VtZW50IGRvZXMgbm90IGhhdmUgZm9jdXMnICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gbWFrZSBzdXJlIHN0YXRlIGlzIHJlc3RvcmVkIGFmdGVyIG1vdmluZyBjaGlsZHJlbiB0byBmcm9udCBhbmQgYmFja1xuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBkaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGZvY3VzSGlnaGxpZ2h0OiBURVNUX0hJR0hMSUdIVCB9ICk7XG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgZm9jdXNIaWdobGlnaHQ6IFRFU1RfSElHSExJR0hUIH0gKTtcbiAgcm9vdE5vZGUuY2hpbGRyZW4gPSBbIGEsIGIgXTtcbiAgYi5mb2N1cygpO1xuXG4gIC8vIGFmdGVyIG1vdmluZyBhIHRvIGZyb250LCBiIHNob3VsZCBzdGlsbCBoYXZlIGZvY3VzXG4gIGEubW92ZVRvRnJvbnQoKTtcbiAgYXNzZXJ0Lm9rKCBiLmZvY3VzZWQsICdiIHNob3VsZCBoYXZlIGZvY3VzIGFmdGVyIGEgbW92ZWQgdG8gZnJvbnQnICk7XG5cbiAgLy8gYWZ0ZXIgbW92aW5nIGEgdG8gYmFjaywgYiBzaG91bGQgc3RpbGwgaGF2ZSBmb2N1c1xuICBhLm1vdmVUb0JhY2soKTtcblxuICAvLyBhZGQgYSBndWFyZCB3aGVyZSB3ZSBkb24ndCBjaGVjayB0aGlzIGlmIGZvY3VzIGhhcyBiZWVuIG1vdmVkIHNvbWV3aGVyZSBlbHNlLiBUaGlzIGhhcHBlbnMgc29tZXRpbWVzIHdpdGhcbiAgLy8gZGV2IHRvb2xzIG9yIG90aGVyIHdpbmRvd3Mgb3BlbmVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgyN1xuICBpZiAoIGRvY3VtZW50LmJvZHkuY29udGFpbnMoIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgKSAmJiBkb2N1bWVudC5ib2R5ICE9PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICkge1xuICAgIGFzc2VydC5vayggYi5mb2N1c2VkLCAnYiBzaG91bGQgaGF2ZSBmb2N1cyBhZnRlciBhIG1vdmVkIHRvIGJhY2snICk7XG4gIH1cblxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxufSApO1xuXG5RVW5pdC50ZXN0KCAnTm9kZS5lbmFibGVkUHJvcGVydHkgd2l0aCBQRE9NJywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgY29uc3QgcGRvbU5vZGUgPSBuZXcgTm9kZSgge1xuICAgIHRhZ05hbWU6ICdwJ1xuICB9ICk7XG5cbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIHBkb21Ob2RlICk7XG4gIGFzc2VydC5vayggcGRvbU5vZGUucGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDEsICdzaG91bGQgaGF2ZSBhbiBpbnN0YW5jZSB3aGVuIGF0dGFjaGVkIHRvIGRpc3BsYXknICk7XG4gIGFzc2VydC5vayggISFwZG9tTm9kZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciwgJ3Nob3VsZCBoYXZlIGEgcGVlcicgKTtcblxuICBhc3NlcnQub2soIHBkb21Ob2RlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyEuZ2V0QXR0cmlidXRlKCAnYXJpYS1kaXNhYmxlZCcgKSAhPT0gJ3RydWUnLCAnc2hvdWxkIGJlIGVuYWJsZWQgdG8gc3RhcnQnICk7XG4gIHBkb21Ob2RlLmVuYWJsZWQgPSBmYWxzZTtcbiAgYXNzZXJ0Lm9rKCBwZG9tTm9kZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmdldEF0dHJpYnV0ZSggJ2FyaWEtZGlzYWJsZWQnICkgPT09ICd0cnVlJywgJ3Nob3VsZCBiZSBhcmlhLWRpc2FibGVkIHdoZW4gZGlzYWJsZWQnICk7XG4gIHBkb21Ob2RlLmVuYWJsZWQgPSB0cnVlO1xuICBhc3NlcnQub2soIHBkb21Ob2RlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyEuZ2V0QXR0cmlidXRlKCAnYXJpYS1kaXNhYmxlZCcgKSA9PT0gJ2ZhbHNlJywgJ0FjdHVhbGx5IHNldCB0byBmYWxzZSBzaW5jZSBpdCB3YXMgcHJldmlvdXNseSBkaXNhYmxlZC4nICk7XG4gIHBkb21Ob2RlLmRpc3Bvc2UoKTtcbiAgYXNzZXJ0Lm9rKCBwZG9tTm9kZS5wZG9tSW5zdGFuY2VzLmxlbmd0aCA9PT0gMCwgJ2Rpc3Bvc2VkIG5vZGVzIGRvIG5vdCBoYXZlIGEgUERPTSBpbnN0YW5jZScgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG59ICk7XG5cbi8vIHRoZXNlIGZ1enplcnMgdGFrZSB0aW1lLCBzbyBpdCBpcyBuaWNlIHdoZW4gdGhleSBhcmUgbGFzdFxuUVVuaXQudGVzdCggJ0Rpc3BsYXkuaW50ZXJhY3RpdmUgdG9nZ2xpbmcgaW4gdGhlIFBET00nLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgY29uc3QgcGRvbVJhbmdlQ2hpbGQgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnaW5wdXQnLCBpbnB1dFR5cGU6ICdyYW5nZScgfSApO1xuICBjb25zdCBwZG9tUGFyYWdyYXBoQ2hpbGQgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAncCcgfSApO1xuICBjb25zdCBwZG9tQnV0dG9uQ2hpbGQgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XG5cbiAgY29uc3QgcGRvbVBhcmVudCA9IG5ldyBOb2RlKCB7XG4gICAgdGFnTmFtZTogJ2J1dHRvbicsXG4gICAgY2hpbGRyZW46IFsgcGRvbVJhbmdlQ2hpbGQsIHBkb21QYXJhZ3JhcGhDaGlsZCwgcGRvbUJ1dHRvbkNoaWxkIF1cbiAgfSApO1xuXG4gIGNvbnN0IERJU0FCTEVEX1RSVUUgPSB0cnVlO1xuXG4gIC8vIEZvciBvZiBsaXN0IG9mIGh0bWwgZWxlbWVudHMgdGhhdCBzdXBwb3J0IGRpc2FibGVkLCBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9BdHRyaWJ1dGVzL2Rpc2FibGVkXG4gIGNvbnN0IERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQgPSBmYWxzZTtcbiAgY29uc3QgREVGQVVMVF9ESVNBQkxFRF9XSEVOX05PVF9TVVBQT1JURUQgPSB1bmRlZmluZWQ7XG5cbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIHBkb21QYXJlbnQgKTtcblxuICBhc3NlcnQub2soIHRydWUsICdpbml0aWFsIGNhc2UnICk7XG5cbiAgY29uc3QgdGVzdERpc2FibGVkID0gKCBub2RlOiBOb2RlLCBkaXNhYmxlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCwgbWVzc2FnZTogc3RyaW5nLCBwZG9tSW5zdGFuY2UgPSAwICk6IHZvaWQgPT4ge1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBcImRpc2FibGVkXCIgaXMgb25seSBzdXBwb3J0ZWQgYnkgY2VydGFpbiBhdHRyaWJ1dGVzLCBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9BdHRyaWJ1dGVzL2Rpc2FibGVkXG4gICAgYXNzZXJ0Lm9rKCBub2RlLnBkb21JbnN0YW5jZXNbIHBkb21JbnN0YW5jZSBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5kaXNhYmxlZCA9PT0gZGlzYWJsZWQsIG1lc3NhZ2UgKTtcbiAgfTtcblxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tUGFyZW50IGluaXRpYWwgbm8gZGlzYWJsZWQnICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVJhbmdlQ2hpbGQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tUmFuZ2VDaGlsZCBpbml0aWFsIG5vIGRpc2FibGVkJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX05PVF9TVVBQT1JURUQsICdwZG9tUGFyYWdyYXBoQ2hpbGQgaW5pdGlhbCBubyBkaXNhYmxlZCcgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tQnV0dG9uQ2hpbGQgaW5pdGlhbCBubyBkaXNhYmxlZCcgKTtcblxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gZmFsc2U7XG5cbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyZW50LCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmVudCB0b2dnbGVkIG5vdCBpbnRlcmFjdGl2ZScgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIHRvZ2dsZWQgbm90IGludGVyYWN0aXZlJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCB0b2dnbGVkIG5vdCBpbnRlcmFjdGl2ZScgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tQnV0dG9uQ2hpbGQgdG9nZ2xlZCBub3QgaW50ZXJhY3RpdmUnICk7XG5cbiAgZGlzcGxheS5pbnRlcmFjdGl2ZSA9IHRydWU7XG5cbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyZW50LCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbVBhcmVudCB0b2dnbGVkIGJhY2sgdG8gaW50ZXJhY3RpdmUnICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVJhbmdlQ2hpbGQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tUmFuZ2VDaGlsZCB0b2dnbGVkIGJhY2sgdG8gaW50ZXJhY3RpdmUnICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fTk9UX1NVUFBPUlRFRCwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCB0b2dnbGVkIGJhY2sgdG8gaW50ZXJhY3RpdmUnICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbUJ1dHRvbkNoaWxkIHRvZ2dsZWQgYmFjayB0byBpbnRlcmFjdGl2ZScgKTtcblxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gZmFsc2U7XG5cbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyZW50LCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmVudCBzZWNvbmQgdG9nZ2xlZCBub3QgaW50ZXJhY3RpdmUnICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVJhbmdlQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tUmFuZ2VDaGlsZCBzZWNvbmQgdG9nZ2xlZCBub3QgaW50ZXJhY3RpdmUnICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmFncmFwaENoaWxkIHNlY29uZCB0b2dnbGVkIG5vdCBpbnRlcmFjdGl2ZScgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tQnV0dG9uQ2hpbGQgc2Vjb25kIHRvZ2dsZWQgbm90IGludGVyYWN0aXZlJyApO1xuXG4gIHBkb21QYXJlbnQuc2V0UERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgdHJ1ZSwgeyB0eXBlOiAncHJvcGVydHknIH0gKTtcbiAgcGRvbVJhbmdlQ2hpbGQuc2V0UERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgdHJ1ZSwgeyB0eXBlOiAncHJvcGVydHknIH0gKTtcbiAgcGRvbVBhcmFncmFwaENoaWxkLnNldFBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcsIHRydWUsIHsgdHlwZTogJ3Byb3BlcnR5JyB9ICk7XG4gIHBkb21CdXR0b25DaGlsZC5zZXRQRE9NQXR0cmlidXRlKCAnZGlzYWJsZWQnLCB0cnVlLCB7IHR5cGU6ICdwcm9wZXJ0eScgfSApO1xuXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmVudCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJlbnQgbm90IGludGVyYWN0aXZlIGFmdGVyIHNldHRpbmcgZGlzYWJsZWQgbWFudWFsbHkgYXMgcHJvcGVydHksIGRpc3BsYXkgbm90IGludGVyYWN0aXZlJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21SYW5nZUNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVJhbmdlQ2hpbGQgbm90IGludGVyYWN0aXZlIGFmdGVyIHNldHRpbmcgZGlzYWJsZWQgbWFudWFsbHkgYXMgcHJvcGVydHksIGRpc3BsYXkgbm90IGludGVyYWN0aXZlJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBwcm9wZXJ0eSwgZGlzcGxheSBub3QgaW50ZXJhY3RpdmUnICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIHByb3BlcnR5LCBkaXNwbGF5IG5vdCBpbnRlcmFjdGl2ZScgKTtcblxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gdHJ1ZTtcblxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyZW50IG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIHByb3BlcnR5IGRpc3BsYXkgaW50ZXJhY3RpdmUnICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVJhbmdlQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tUmFuZ2VDaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBwcm9wZXJ0eSBkaXNwbGF5IGludGVyYWN0aXZlJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBwcm9wZXJ0eSBkaXNwbGF5IGludGVyYWN0aXZlJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBwcm9wZXJ0eSBkaXNwbGF5IGludGVyYWN0aXZlJyApO1xuXG4gIGRpc3BsYXkuaW50ZXJhY3RpdmUgPSBmYWxzZTtcblxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyZW50IHN0aWxsIGRpc2FibGVkIHdoZW4gZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21SYW5nZUNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVJhbmdlQ2hpbGQgc3RpbGwgZGlzYWJsZWQgd2hlbiBkaXNwbGF5IGlzIG5vdCBpbnRlcmFjdGl2ZSBhZ2Fpbi4nICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmFncmFwaENoaWxkIHN0aWxsIGRpc2FibGVkIHdoZW4gZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBzdGlsbCBkaXNhYmxlZCB3aGVuIGRpc3BsYXkgaXMgbm90IGludGVyYWN0aXZlIGFnYWluLicgKTtcblxuICBwZG9tUGFyZW50LnJlbW92ZVBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcgKTtcbiAgcGRvbVJhbmdlQ2hpbGQucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJyApO1xuICBwZG9tUGFyYWdyYXBoQ2hpbGQucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJyApO1xuICBwZG9tQnV0dG9uQ2hpbGQucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJyApO1xuXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmVudCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJlbnQgc3RpbGwgZGlzYWJsZWQgZnJvbSBkaXNwbGF5IG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBsb2NhbCBwcm9wZXJ0eSByZW1vdmVkLicgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIHN0aWxsIGRpc2FibGVkIGZyb20gZGlzcGxheSBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgbG9jYWwgcHJvcGVydHkgcmVtb3ZlZC4nICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmFncmFwaENoaWxkIHN0aWxsIGRpc2FibGVkIGZyb20gZGlzcGxheSBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgbG9jYWwgcHJvcGVydHkgcmVtb3ZlZC4nICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHN0aWxsIGRpc2FibGVkIGZyb20gZGlzcGxheSBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgbG9jYWwgcHJvcGVydHkgcmVtb3ZlZC4nICk7XG5cbiAgZGlzcGxheS5pbnRlcmFjdGl2ZSA9IHRydWU7XG5cbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyZW50LCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbVBhcmVudCBpbnRlcmFjdGl2ZSBub3cgd2l0aG91dCBsb2NhbCBwcm9wZXJ0eS4nICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVJhbmdlQ2hpbGQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tUmFuZ2VDaGlsZCBpbnRlcmFjdGl2ZSBub3cgd2l0aG91dCBsb2NhbCBwcm9wZXJ0eS4nICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbVBhcmFncmFwaENoaWxkIGludGVyYWN0aXZlIG5vdyB3aXRob3V0IGxvY2FsIHByb3BlcnR5LicgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tQnV0dG9uQ2hpbGQgaW50ZXJhY3RpdmUgbm93IHdpdGhvdXQgbG9jYWwgcHJvcGVydHkuJyApO1xuXG4gIHBkb21QYXJlbnQuc2V0UERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgJycgKTtcbiAgcGRvbVJhbmdlQ2hpbGQuc2V0UERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgJycgKTtcbiAgcGRvbVBhcmFncmFwaENoaWxkLnNldFBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcsICcnICk7XG4gIHBkb21CdXR0b25DaGlsZC5zZXRQRE9NQXR0cmlidXRlKCAnZGlzYWJsZWQnLCAnJyApO1xuXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmVudCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJlbnQgbm90IGludGVyYWN0aXZlIGFmdGVyIHNldHRpbmcgZGlzYWJsZWQgbWFudWFsbHkgYXMgYXR0cmlidXRlLCBkaXNwbGF5IG5vdCBpbnRlcmFjdGl2ZScgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIGF0dHJpYnV0ZSwgZGlzcGxheSBub3QgaW50ZXJhY3RpdmUnICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIGF0dHJpYnV0ZSwgZGlzcGxheSBub3QgaW50ZXJhY3RpdmUnICk7XG5cbiAgZGlzcGxheS5pbnRlcmFjdGl2ZSA9IHRydWU7XG5cbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyZW50LCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmVudCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBhdHRyaWJ1dGUgZGlzcGxheSBpbnRlcmFjdGl2ZScgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIGF0dHJpYnV0ZSBkaXNwbGF5IGludGVyYWN0aXZlJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBhdHRyaWJ1dGUgZGlzcGxheSBpbnRlcmFjdGl2ZScgKTtcblxuICAvLyBUaGlzIHRlc3QgZG9lc24ndCB3b3JrLCBiZWNhdXNlIHBhcmFncmFwaHMgZG9uJ3Qgc3VwcG9ydCBkaXNhYmxlZCwgc28gdGhlIGF0dHJpYnV0ZSBcImRpc2FibGVkXCIgd29uJ3RcbiAgLy8gYXV0b21hdGljYWxseSB0cmFuc2ZlciBvdmVyIHRvIHRoZSBwcm9wZXJ0eSB2YWx1ZSBsaWtlIGZvciB0aGUgb3RoZXJzLiBGb3IgYSBsaXN0IG9mIEVsZW1lbnRzIHRoYXQgc3VwcG9ydCBcImRpc2FibGVkXCIsIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0F0dHJpYnV0ZXMvZGlzYWJsZWRcbiAgLy8gdGVzdERpc2FibGVkKCBwZG9tUGFyYWdyYXBoQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyYWdyYXBoQ2hpbGQgbm90IGludGVyYWN0aXZlIGFmdGVyIHNldHRpbmcgZGlzYWJsZWQgbWFudWFsbHkgYXMgYXR0cmlidXRlLCBkaXNwbGF5ICBpbnRlcmFjdGl2ZScgKTtcblxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gZmFsc2U7XG5cbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyZW50LCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmVudCBzdGlsbCBkaXNhYmxlZCB3aGVuIGRpc3BsYXkgaXMgbm90IGludGVyYWN0aXZlIGFnYWluLicgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIHN0aWxsIGRpc2FibGVkIHdoZW4gZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCBzdGlsbCBkaXNhYmxlZCB3aGVuIGRpc3BsYXkgaXMgbm90IGludGVyYWN0aXZlIGFnYWluLicgKTtcbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tQnV0dG9uQ2hpbGQgc3RpbGwgZGlzYWJsZWQgd2hlbiBkaXNwbGF5IGlzIG5vdCBpbnRlcmFjdGl2ZSBhZ2Fpbi4nICk7XG5cbiAgcGRvbVBhcmVudC5yZW1vdmVQRE9NQXR0cmlidXRlKCAnZGlzYWJsZWQnICk7XG4gIHBkb21SYW5nZUNoaWxkLnJlbW92ZVBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcgKTtcbiAgcGRvbVBhcmFncmFwaENoaWxkLnJlbW92ZVBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcgKTtcbiAgcGRvbUJ1dHRvbkNoaWxkLnJlbW92ZVBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcgKTtcblxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyZW50IHN0aWxsIGRpc2FibGVkIGZyb20gZGlzcGxheSBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgbG9jYWwgYXR0cmlidXRlIHJlbW92ZWQuJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21SYW5nZUNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVJhbmdlQ2hpbGQgc3RpbGwgZGlzYWJsZWQgZnJvbSBkaXNwbGF5IG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBsb2NhbCBhdHRyaWJ1dGUgcmVtb3ZlZC4nICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmFncmFwaENoaWxkIHN0aWxsIGRpc2FibGVkIGZyb20gZGlzcGxheSBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgbG9jYWwgYXR0cmlidXRlIHJlbW92ZWQuJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBzdGlsbCBkaXNhYmxlZCBmcm9tIGRpc3BsYXkgbm90IGludGVyYWN0aXZlIGFmdGVyIGxvY2FsIGF0dHJpYnV0ZSByZW1vdmVkLicgKTtcblxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gdHJ1ZTtcblxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tUGFyZW50IGludGVyYWN0aXZlIG5vdyB3aXRob3V0IGxvY2FsIGF0dHJpYnV0ZS4nICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbVJhbmdlQ2hpbGQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tUmFuZ2VDaGlsZCBpbnRlcmFjdGl2ZSBub3cgd2l0aG91dCBsb2NhbCBhdHRyaWJ1dGUuJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCBpbnRlcmFjdGl2ZSBub3cgd2l0aG91dCBsb2NhbCBhdHRyaWJ1dGUuJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21CdXR0b25DaGlsZCBpbnRlcmFjdGl2ZSBub3cgd2l0aG91dCBsb2NhbCBhdHRyaWJ1dGUuJyApO1xuXG4gIGNvbnN0IGNvbnRhaW5lck9mREFHQnV0dG9uID0gbmV3IE5vZGUoIHtcbiAgICBjaGlsZHJlbjogWyBwZG9tQnV0dG9uQ2hpbGQgXVxuICB9ICk7XG4gIHBkb21QYXJlbnQuYWRkQ2hpbGQoIGNvbnRhaW5lck9mREFHQnV0dG9uICk7XG5cbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tQnV0dG9uQ2hpbGQgZGVmYXVsdCBub3QgZGlzYWJsZWQuJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21CdXR0b25DaGlsZCBkZWZhdWx0IG5vdCBkaXNhYmxlZCB3aXRoIGRhZy4nLCAxICk7XG5cbiAgZGlzcGxheS5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xuXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHR1cm5lZCBkaXNhYmxlZC4nICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHR1cm5lZCBkaXNhYmxlZCB3aXRoIGRhZy4nLCAxICk7XG5cbiAgcGRvbUJ1dHRvbkNoaWxkLnNldFBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcsIHRydWUsIHsgdHlwZTogJ3Byb3BlcnR5JyB9ICk7XG5cbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tQnV0dG9uQ2hpbGQgdHVybmVkIGRpc2FibGVkIHNldCBwcm9wZXJ0eSB0b28uJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCB0dXJuZWQgZGlzYWJsZWQgc2V0IHByb3BlcnR5IHRvbywgd2l0aCBkYWcuJywgMSApO1xuXG4gIGRpc3BsYXkuaW50ZXJhY3RpdmUgPSB0cnVlO1xuXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHR1cm5lZCBub3QgZGlzYWJsZWQgc2V0IHByb3BlcnR5IHRvby4nICk7XG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHR1cm5lZCBub3QgZGlzYWJsZWQgc2V0IHByb3BlcnR5IHRvbywgd2l0aCBkYWcuJywgMSApO1xuXG4gIGRpc3BsYXkuaW50ZXJhY3RpdmUgPSBmYWxzZTtcblxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCB0dXJuZWQgZGlzYWJsZWQgYWdhaW4uJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCB0dXJuZWQgZGlzYWJsZWQgYWdhaW4sIHdpdGggZGFnLicsIDEgKTtcblxuICBwZG9tQnV0dG9uQ2hpbGQucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJyApO1xuXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHJlbW92ZSBkaXNhYmxlZCB3aGlsZSBub3QgaW50ZXJhY3RpdmUuJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCByZW1vdmUgZGlzYWJsZWQgd2hpbGUgbm90IGludGVyYWN0aXZlLCB3aXRoIGRhZy4nLCAxICk7XG5cbiAgZGlzcGxheS5pbnRlcmFjdGl2ZSA9IHRydWU7XG5cbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tQnV0dG9uQ2hpbGQgZGVmYXVsdCBub3QgZGlzYWJsZWQgYWZ0ZXIgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21CdXR0b25DaGlsZCBkZWZhdWx0IG5vdCBkaXNhYmxlZCBhZnRlciBpbnRlcmFjdGl2ZSBhZ2FpbiB3aXRoIGRhZy4nLCAxICk7XG5cbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG59ICk7XG5cbi8vIHRoZXNlIGZ1enplcnMgdGFrZSB0aW1lLCBzbyBpdCBpcyBuaWNlIHdoZW4gdGhleSBhcmUgbGFzdFxuUVVuaXQudGVzdCggJ1BET01GdXp6ZXIgd2l0aCAzIG5vZGVzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgZnV6emVyID0gbmV3IFBET01GdXp6ZXIoIDMsIGZhbHNlICk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDUwMDA7IGkrKyApIHtcbiAgICBmdXp6ZXIuc3RlcCgpO1xuICB9XG4gIGFzc2VydC5leHBlY3QoIDAgKTtcbiAgZnV6emVyLmRpc3Bvc2UoKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1BET01GdXp6ZXIgd2l0aCA0IG5vZGVzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgZnV6emVyID0gbmV3IFBET01GdXp6ZXIoIDQsIGZhbHNlICk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDEwMDA7IGkrKyApIHtcbiAgICBmdXp6ZXIuc3RlcCgpO1xuICB9XG4gIGFzc2VydC5leHBlY3QoIDAgKTtcbiAgZnV6emVyLmRpc3Bvc2UoKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1BET01GdXp6ZXIgd2l0aCA1IG5vZGVzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgZnV6emVyID0gbmV3IFBET01GdXp6ZXIoIDUsIGZhbHNlICk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDMwMDsgaSsrICkge1xuICAgIGZ1enplci5zdGVwKCk7XG4gIH1cbiAgYXNzZXJ0LmV4cGVjdCggMCApO1xuICBmdXp6ZXIuZGlzcG9zZSgpO1xufSApOyJdLCJuYW1lcyI6WyJEaXNwbGF5IiwiQ2lyY2xlIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlBET01GdXp6ZXIiLCJQRE9NUGVlciIsIlBET01VdGlscyIsIlRFU1RfSU5ORVJfQ09OVEVOVCIsIlRFU1RfTEFCRUwiLCJURVNUX0xBQkVMXzIiLCJURVNUX0RFU0NSSVBUSU9OIiwiVEVTVF9MQUJFTF9IVE1MIiwiVEVTVF9MQUJFTF9IVE1MXzIiLCJURVNUX0RFU0NSSVBUSU9OX0hUTUwiLCJURVNUX0RFU0NSSVBUSU9OX0hUTUxfMiIsIlRFU1RfQ0xBU1NfT05FIiwiVEVTVF9DTEFTU19UV08iLCJERUZBVUxUX0xBQkVMX1RBR19OQU1FIiwiREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSIsIkRFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCIsIkRFRkFVTFRfREVTQ1JJUFRJT05fU0lCTElOR19JTkRFWCIsIkFQUEVOREVEX0RFU0NSSVBUSU9OX1NJQkxJTkdfSU5ERVgiLCJURVNUX0hJR0hMSUdIVCIsImZvY3VzSGlnaGxpZ2h0IiwiY2FuUnVuVGVzdHMiLCJRVW5pdCIsIm1vZHVsZSIsImJlZm9yZUVhY2giLCJkb2N1bWVudCIsImhhc0ZvY3VzIiwiY29uc29sZSIsIndhcm4iLCJnZXRQRE9NUGVlckJ5Tm9kZSIsIm5vZGUiLCJwZG9tSW5zdGFuY2VzIiwibGVuZ3RoIiwiRXJyb3IiLCJwZWVyIiwiZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlIiwidW5pcXVlUGVlciIsImdldEVsZW1lbnRCeUlkIiwicHJpbWFyeVNpYmxpbmciLCJpZCIsInBkb21BdWRpdFJvb3ROb2RlIiwicm9vdE5vZGUiLCJwZG9tQXVkaXQiLCJ0ZXN0IiwiYXNzZXJ0IiwidGFnTmFtZSIsImRpc3BsYXkiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJkb21FbGVtZW50IiwiYSIsImlubmVyQ29udGVudCIsImFkZENoaWxkIiwiYUVsZW1lbnQiLCJvayIsInBhcmVudEVsZW1lbnQiLCJjaGlsZE5vZGVzIiwidGV4dENvbnRlbnQiLCJpbm5lckhUTUwiLCJiIiwiaW5wdXRUeXBlIiwid2luZG93IiwidGhyb3dzIiwiZGlzcG9zZSIsInJlbW92ZUNoaWxkIiwiY29udGFpbmVyUGFyZW50IiwiY2hpbGRyZW4iLCJjb250YWluZXJUYWdOYW1lIiwiaW5jbHVkZXMiLCJsYWJlbENvbnRlbnQiLCJsYWJlbFNpYmxpbmciLCJuZXdBRWxlbWVudCIsIm5ld0xhYmVsU2libGluZyIsImxhYmVsVGFnTmFtZSIsImJMYWJlbEVsZW1lbnQiLCJnZXRBdHRyaWJ1dGUiLCJjIiwiY0xhYmVsRWxlbWVudCIsImQiLCJiRWxlbWVudCIsImNQZWVyIiwiZFBlZXIiLCJjb25maXJtT3JpZ2luYWxPcmRlciIsImUiLCJkZXNjcmlwdGlvbkNvbnRlbnQiLCJlUGVlciIsImNvbmZpcm1PcmlnaW5hbFdpdGhFIiwiZGVzY3JpcHRpb25TaWJsaW5nIiwiZmlyc3RDaGlsZCIsImFycmF5c0VxdWFsIiwiZXZlcnkiLCJ2YWx1ZSIsImluZGV4IiwicGRvbU9yZGVyIiwiZmlyc3RPcmRlciIsInNlY29uZE9yZGVyIiwidGhpcmRPcmRlciIsInNwbGljZSIsImZvdXJ0aE9yZGVyIiwicGFyZW50IiwiY2hpbGQxIiwiY2hpbGQyIiwiZ3JhbmRjaGlsZDEiLCJncmFuZGNoaWxkMiIsInBhcmVudFBlZXIiLCJkZXNjcmlwdGlvblRhZ05hbWUiLCJidXR0b25Ob2RlIiwiZm9jdXNhYmxlIiwiYXJpYVJvbGUiLCJkaXZOb2RlIiwiYXJpYUxhYmVsIiwicGRvbVZpc2libGUiLCJ0b1VwcGVyQ2FzZSIsImVxdWFsIiwiYnV0dG9uRWxlbWVudCIsImJ1dHRvblBhcmVudCIsInBhcmVudE5vZGUiLCJidXR0b25QZWVycyIsImJ1dHRvbkxhYmVsIiwiYnV0dG9uRGVzY3JpcHRpb24iLCJkaXZFbGVtZW50IiwicERlc2NyaXB0aW9uIiwidGFiSW5kZXgiLCJoaWRkZW4iLCJ0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGUiLCJhdHRyaWJ1dGUiLCJhZGRBc3NvY2lhdGlvbkZ1bmN0aW9uIiwic2V0UERPTUF0dHJpYnV0ZSIsIm90aGVyTm9kZSIsInRoaXNFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsIm90aGVyRWxlbWVudE5hbWUiLCJjRWxlbWVudCIsImV4cGVjdGVkVmFsdWUiLCJqb2luIiwib2xkVmFsdWUiLCJDT05UQUlORVJfUEFSRU5UIiwiREVTQ1JJUFRJT05fU0lCTElORyIsImJQYXJlbnRDb250YWluZXIiLCJkRGVzY3JpcHRpb25FbGVtZW50IiwiZiIsImciLCJoIiwiZUVsZW1lbnQiLCJmRWxlbWVudCIsImdFbGVtZW50IiwiaEVsZW1lbnQiLCJqIiwiTEFCRUxfU0lCTElORyIsImNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zIiwiaW5zdGFuY2UiLCJub2RlUHJpbWFyeUVsZW1lbnQiLCJub2RlUGFyZW50IiwiZ2V0VW5pcXVlSWRTdHJpbmdGb3JTaWJsaW5nIiwic2libGluZ1N0cmluZyIsImdldEVsZW1lbnRJZCIsImdldFBET01JbnN0YW5jZVVuaXF1ZUlkIiwiayIsInRlc3RLIiwia1ZhbHVlIiwiaklEIiwialBhcmVudCIsImpQYXJlbnQyIiwiaW5zZXJ0Q2hpbGQiLCJ0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGVCeVNldHRlcnMiLCJhc3NvY2lhdGlvbnNBcnJheU5hbWUiLCJhc3NvY2lhdGlvblJlbW92YWxGdW5jdGlvbiIsIm9wdGlvbnMiLCJuIiwibyIsIm5QZWVyIiwib0VsZW1lbnQiLCJwZG9tSW5zdGFuY2UiLCJyYW5kb21Bc3NvY2lhdGlvbk9iamVjdCIsIm0iLCJfIiwiaXNFcXVhbCIsImluZGV4T2YiLCJhMSIsImExRWxlbWVudCIsImFwcGVuZExhYmVsIiwiYXBwZW5kRGVzY3JpcHRpb24iLCJuZXdCdXR0b25QZWVycyIsImVsZW1lbnRJbkRvbSIsImluaXRpYWxMZW5ndGgiLCJnZXRQRE9NQXR0cmlidXRlcyIsImhhc1BET01BdHRyaWJ1dGUiLCJyZW1vdmVQRE9NQXR0cmlidXRlIiwidHlwZSIsInNldFBET01DbGFzcyIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicmVtb3ZlUERPTUNsYXNzIiwidXRpbCIsImluaXRpYWxpemVFdmVudHMiLCJyb290RWxlbWVudCIsImRFbGVtZW50IiwiZm9jdXMiLCJhY3RpdmVFbGVtZW50IiwiZ2V0TmV4dEZvY3VzYWJsZSIsImdldFByZXZpb3VzRm9jdXNhYmxlIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJyb290RE9NRWxlbWVudCIsImRET01FbGVtZW50IiwiaW5zdGFuY2VzIiwidGVzdE5vZGUiLCJpbml0SW5kZXgiLCJpbmRleE9mQ2hpbGQiLCJyZXBsYWNlQ2hpbGQiLCJhZnRlckluZGV4IiwiaGFzQ2hpbGQiLCJmb2N1c2VkIiwiYmx1ciIsImRpdkEiLCJidXR0b25CIiwiZGl2RSIsImJ1dHRvbkcxIiwiYnV0dG9uRzIiLCJkaXZBQ2hpbGRyZW4iLCJkaXZFQ2hpbGRyZW4iLCJ2aXNpYmxlIiwicGRvbURpc3BsYXllZCIsImlzUERPTVZpc2libGUiLCJpbnB1dFZhbHVlIiwiZGlmZmVyZW50VmFsdWUiLCJhcmlhVmFsdWVUZXh0IiwiZWxlbWVudE5hbWUiLCJ0ZXN0Qm90aEF0dHJpYnV0ZXMiLCJhTGFiZWxFbGVtZW50IiwicmVtb3ZlUERPTUF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVOYW1lIiwidGVzdEF0dHJpYnV0ZXMiLCJmaWx0ZXIiLCJwZG9tQ2hlY2tlZCIsImNoZWNrZWQiLCJzd2FwVmlzaWJpbGl0eSIsImJ1dHRvbkEiLCJoYXNBdHRyaWJ1dGUiLCJjb250YWluZXJFbGVtZW50IiwicGVlckVsZW1lbnRzIiwiYlBlZXIiLCJiRWxlbWVudFBhcmVudCIsImluZGV4T2ZQcmltYXJ5RWxlbWVudCIsIkFycmF5IiwicHJvdG90eXBlIiwiY2FsbCIsImNvbnRhaW5lckFyaWFSb2xlIiwiYWNjZXNzaWJsZU5hbWUiLCJiUGFyZW50IiwiYkxhYmVsU2libGluZyIsImNBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwiYWNjZXNzaWJsZU5hbWVCZWhhdmlvciIsImRBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwiZExhYmVsRWxlbWVudCIsImFjY2Vzc2libGVOYW1lRGVzY3JpcHRpb24iLCJwZG9tSGVhZGluZyIsImFMYWJlbFNpYmxpbmciLCJoZWxwVGV4dCIsImFEZXNjcmlwdGlvbkVsZW1lbnQiLCJoZWxwVGV4dEJlaGF2aW9yIiwiYkRlc2NyaXB0aW9uRWxlbWVudCIsIm1vdmVUb0Zyb250IiwibW92ZVRvQmFjayIsInBkb21Ob2RlIiwiZW5hYmxlZCIsInBkb21SYW5nZUNoaWxkIiwicGRvbVBhcmFncmFwaENoaWxkIiwicGRvbUJ1dHRvbkNoaWxkIiwicGRvbVBhcmVudCIsIkRJU0FCTEVEX1RSVUUiLCJERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVEIiwiREVGQVVMVF9ESVNBQkxFRF9XSEVOX05PVF9TVVBQT1JURUQiLCJ1bmRlZmluZWQiLCJ0ZXN0RGlzYWJsZWQiLCJkaXNhYmxlZCIsIm1lc3NhZ2UiLCJpbnRlcmFjdGl2ZSIsImNvbnRhaW5lck9mREFHQnV0dG9uIiwiZnV6emVyIiwiaSIsInN0ZXAiLCJleHBlY3QiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSwyQkFBMkI7QUFDL0MsT0FBT0MsWUFBWSx3QkFBd0I7QUFDM0MsT0FBT0MsVUFBVSxzQkFBc0I7QUFDdkMsT0FBT0MsZUFBZSwyQkFBMkI7QUFFakQsT0FBT0MsZ0JBQWdCLGtCQUFrQjtBQUN6QyxPQUFPQyxjQUFjLGdCQUFnQjtBQUNyQyxPQUFPQyxlQUFlLGlCQUFpQjtBQUV2QyxZQUFZO0FBQ1osTUFBTUMscUJBQXFCO0FBQzNCLE1BQU1DLGFBQWE7QUFDbkIsTUFBTUMsZUFBZTtBQUNyQixNQUFNQyxtQkFBbUI7QUFDekIs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