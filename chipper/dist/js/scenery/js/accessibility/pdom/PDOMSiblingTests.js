// Copyright 2019-2023, University of Colorado Boulder
/**
 * Tests for styling accessibility siblings. Siblings should be positioned on top of other elements in the PDOM.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Display from '../../display/Display.js';
import Node from '../../nodes/Node.js';
import Rectangle from '../../nodes/Rectangle.js';
import PDOMPeer from './PDOMPeer.js';
// constants
const PIXEL_PADDING = 3;
QUnit.module('PDOMSibling');
/**
 * Gets the bounds of the DOMElement in the viewport in global coordinates.
 * @param {Node} node
 * @returns {Bounds2}
 */ const getSiblingBounds = (node)=>{
    const siblingRect = node.pdomInstances[0].peer.primarySibling.getBoundingClientRect();
    return new Bounds2(siblingRect.x, siblingRect.y, siblingRect.x + siblingRect.width, siblingRect.y + siblingRect.height);
};
/**
 * Returns true if the node's first accessible peer has a primary sibling with bounds thar are correctly positioned
 * in the viewport. Some padding is required for the HTML elements to have defined bounds, so we allow a few pixels
 * of error.
 * @param  {Node} node
 * @returns {boolean}
 */ const siblingBoundsCorrect = (node)=>{
    // if a pdomTransformSourceNode is specified, the sibling should overlap this node's bounds instead of its own
    // bounds
    const transformSourceNode = node.pdomTransformSourceNode;
    const sourceNodeBounds = transformSourceNode ? transformSourceNode.globalBounds : node.globalBounds;
    const siblingBounds = getSiblingBounds(node);
    const comparedBounds = node.positionInPDOM ? sourceNodeBounds : PDOMPeer.OFFSCREEN_SIBLING_BOUNDS;
    return siblingBounds.equalsEpsilon(comparedBounds, PIXEL_PADDING);
};
// tests
QUnit.test('sibling positioning', (assert)=>{
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    // test bounds are set for basic input elements
    const buttonElement = new Rectangle(5, 5, 5, 5, {
        tagName: 'button'
    });
    const divElement = new Rectangle(0, 0, 20, 20, {
        tagName: 'div',
        focusable: true
    });
    const inputElement = new Rectangle(10, 3, 25, 5, {
        tagName: 'input',
        inputType: 'range'
    });
    rootNode.addChild(buttonElement);
    rootNode.addChild(divElement);
    rootNode.addChild(inputElement);
    // udpdate so the display to position elements
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonElement), 'button element child of root correctly positioned');
    assert.ok(siblingBoundsCorrect(divElement), 'div element child of root correctly positioned');
    assert.ok(siblingBoundsCorrect(inputElement), 'input element child of root correctly positioned');
    // test that bounds are set correctly once we have a hierarchy and add transformations
    rootNode.removeChild(buttonElement);
    rootNode.removeChild(divElement);
    rootNode.removeChild(inputElement);
    rootNode.addChild(divElement);
    divElement.addChild(buttonElement);
    buttonElement.addChild(inputElement);
    // arbitrary transformations down the tree (should be propagated to input element)
    divElement.setCenter(new Vector2(50, 50));
    buttonElement.setScaleMagnitude(0.89);
    inputElement.setRotation(Math.PI / 4);
    // udpdate so the display to position elements
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonElement), 'button element descendant correctly positioned');
    assert.ok(siblingBoundsCorrect(inputElement), 'input element descendant correctly positioned');
    // when inner content of an element changes, its client bounds change - make sure that the element still matches
    // the Node
    buttonElement.innerHTML = 'Some Test';
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonElement), 'button element descendant correclty positioned after inner content changed');
    // remove the display element so it doesn't interfere with qunit API
    document.body.removeChild(display.domElement);
    display.dispose();
});
QUnit.test('PDOM transform source Node', (assert)=>{
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const buttonNode = new Rectangle(5, 5, 5, 5, {
        tagName: 'button',
        positionInPDOM: true
    });
    const transformSourceNode = new Rectangle(0, 0, 25, 25);
    rootNode.addChild(buttonNode);
    rootNode.addChild(transformSourceNode);
    // update the display to position elements
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonNode), 'button element child of root correctly positioned');
    const siblingBoundsBefore = getSiblingBounds(buttonNode);
    // test setting transform source Node
    buttonNode.pdomTransformSourceNode = transformSourceNode;
    // update the display to position elements
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonNode), 'button element transformed with transform source Node');
    assert.ok(!siblingBoundsBefore.equals(getSiblingBounds(buttonNode)), 'sibling bounds should have changed after setting transform source');
    // reposition the buttonNode - pdom sibling should NOT reposition
    const siblingBoundsBeforeNodeReposition = getSiblingBounds(buttonNode);
    buttonNode.setX(100);
    buttonNode.setY(100);
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonNode), 'sibling bounds correct after node repositioned');
    assert.ok(siblingBoundsBeforeNodeReposition.equals(getSiblingBounds(buttonNode)), 'transform source didnt change, primary sibling should not reposition');
    // reposition the transform source - pdom sibling SHOULD reposition
    const siblingBoundsBeforeSourceReposition = getSiblingBounds(buttonNode);
    transformSourceNode.setX(50);
    transformSourceNode.setX(50);
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonNode), 'sibling bounds correct after source node repositioned');
    assert.ok(!siblingBoundsBeforeSourceReposition.equals(getSiblingBounds(buttonNode)), 'transform source didnt change, primary sibling should not reposition');
    // remove the display element so it doesn't interfere with qunit API
    document.body.removeChild(display.domElement);
    display.dispose();
});
QUnit.test('setPositionElements test', (assert)=>{
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const buttonNode = new Rectangle(5, 5, 5, 5, {
        tagName: 'button',
        positionInPDOM: true
    });
    rootNode.addChild(buttonNode);
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonNode), 'sibling bounds initially correct');
    buttonNode.setPositionInPDOM(false);
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonNode), 'sibling bounds correct after positionInPDOM false');
    buttonNode.setPositionInPDOM(true);
    display.updateDisplay();
    assert.ok(siblingBoundsCorrect(buttonNode), 'sibling bounds repositioned after positionInPDOM true');
    // remove the display element so it doesn't interfere with qunit API
    document.body.removeChild(display.domElement);
    display.dispose();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BET01TaWJsaW5nVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGVzdHMgZm9yIHN0eWxpbmcgYWNjZXNzaWJpbGl0eSBzaWJsaW5ncy4gU2libGluZ3Mgc2hvdWxkIGJlIHBvc2l0aW9uZWQgb24gdG9wIG9mIG90aGVyIGVsZW1lbnRzIGluIHRoZSBQRE9NLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBEaXNwbGF5IGZyb20gJy4uLy4uL2Rpc3BsYXkvRGlzcGxheS5qcyc7XG5pbXBvcnQgTm9kZSBmcm9tICcuLi8uLi9ub2Rlcy9Ob2RlLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi4vLi4vbm9kZXMvUmVjdGFuZ2xlLmpzJztcbmltcG9ydCBQRE9NUGVlciBmcm9tICcuL1BET01QZWVyLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBQSVhFTF9QQURESU5HID0gMztcblxuUVVuaXQubW9kdWxlKCAnUERPTVNpYmxpbmcnICk7XG5cbi8qKlxuICogR2V0cyB0aGUgYm91bmRzIG9mIHRoZSBET01FbGVtZW50IGluIHRoZSB2aWV3cG9ydCBpbiBnbG9iYWwgY29vcmRpbmF0ZXMuXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAqIEByZXR1cm5zIHtCb3VuZHMyfVxuICovXG5jb25zdCBnZXRTaWJsaW5nQm91bmRzID0gbm9kZSA9PiB7XG4gIGNvbnN0IHNpYmxpbmdSZWN0ID0gbm9kZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgcmV0dXJuIG5ldyBCb3VuZHMyKCBzaWJsaW5nUmVjdC54LCBzaWJsaW5nUmVjdC55LCBzaWJsaW5nUmVjdC54ICsgc2libGluZ1JlY3Qud2lkdGgsIHNpYmxpbmdSZWN0LnkgKyBzaWJsaW5nUmVjdC5oZWlnaHQgKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBub2RlJ3MgZmlyc3QgYWNjZXNzaWJsZSBwZWVyIGhhcyBhIHByaW1hcnkgc2libGluZyB3aXRoIGJvdW5kcyB0aGFyIGFyZSBjb3JyZWN0bHkgcG9zaXRpb25lZFxuICogaW4gdGhlIHZpZXdwb3J0LiBTb21lIHBhZGRpbmcgaXMgcmVxdWlyZWQgZm9yIHRoZSBIVE1MIGVsZW1lbnRzIHRvIGhhdmUgZGVmaW5lZCBib3VuZHMsIHNvIHdlIGFsbG93IGEgZmV3IHBpeGVsc1xuICogb2YgZXJyb3IuXG4gKiBAcGFyYW0gIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuY29uc3Qgc2libGluZ0JvdW5kc0NvcnJlY3QgPSBub2RlID0+IHtcblxuICAvLyBpZiBhIHBkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlIGlzIHNwZWNpZmllZCwgdGhlIHNpYmxpbmcgc2hvdWxkIG92ZXJsYXAgdGhpcyBub2RlJ3MgYm91bmRzIGluc3RlYWQgb2YgaXRzIG93blxuICAvLyBib3VuZHNcbiAgY29uc3QgdHJhbnNmb3JtU291cmNlTm9kZSA9IG5vZGUucGRvbVRyYW5zZm9ybVNvdXJjZU5vZGU7XG4gIGNvbnN0IHNvdXJjZU5vZGVCb3VuZHMgPSB0cmFuc2Zvcm1Tb3VyY2VOb2RlID8gdHJhbnNmb3JtU291cmNlTm9kZS5nbG9iYWxCb3VuZHMgOiBub2RlLmdsb2JhbEJvdW5kcztcblxuICBjb25zdCBzaWJsaW5nQm91bmRzID0gZ2V0U2libGluZ0JvdW5kcyggbm9kZSApO1xuICBjb25zdCBjb21wYXJlZEJvdW5kcyA9IG5vZGUucG9zaXRpb25JblBET00gPyBzb3VyY2VOb2RlQm91bmRzIDogUERPTVBlZXIuT0ZGU0NSRUVOX1NJQkxJTkdfQk9VTkRTO1xuICByZXR1cm4gc2libGluZ0JvdW5kcy5lcXVhbHNFcHNpbG9uKCBjb21wYXJlZEJvdW5kcywgUElYRUxfUEFERElORyApO1xufTtcblxuLy8gdGVzdHNcblFVbml0LnRlc3QoICdzaWJsaW5nIHBvc2l0aW9uaW5nJywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAvLyB0ZXN0IGJvdW5kcyBhcmUgc2V0IGZvciBiYXNpYyBpbnB1dCBlbGVtZW50c1xuICBjb25zdCBidXR0b25FbGVtZW50ID0gbmV3IFJlY3RhbmdsZSggNSwgNSwgNSwgNSwgeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XG4gIGNvbnN0IGRpdkVsZW1lbnQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSB9ICk7XG4gIGNvbnN0IGlucHV0RWxlbWVudCA9IG5ldyBSZWN0YW5nbGUoIDEwLCAzLCAyNSwgNSwgeyB0YWdOYW1lOiAnaW5wdXQnLCBpbnB1dFR5cGU6ICdyYW5nZScgfSApO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBidXR0b25FbGVtZW50ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBkaXZFbGVtZW50ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBpbnB1dEVsZW1lbnQgKTtcblxuICAvLyB1ZHBkYXRlIHNvIHRoZSBkaXNwbGF5IHRvIHBvc2l0aW9uIGVsZW1lbnRzXG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuXG4gIGFzc2VydC5vayggc2libGluZ0JvdW5kc0NvcnJlY3QoIGJ1dHRvbkVsZW1lbnQgKSwgJ2J1dHRvbiBlbGVtZW50IGNoaWxkIG9mIHJvb3QgY29ycmVjdGx5IHBvc2l0aW9uZWQnICk7XG4gIGFzc2VydC5vayggc2libGluZ0JvdW5kc0NvcnJlY3QoIGRpdkVsZW1lbnQgKSwgJ2RpdiBlbGVtZW50IGNoaWxkIG9mIHJvb3QgY29ycmVjdGx5IHBvc2l0aW9uZWQnICk7XG4gIGFzc2VydC5vayggc2libGluZ0JvdW5kc0NvcnJlY3QoIGlucHV0RWxlbWVudCApLCAnaW5wdXQgZWxlbWVudCBjaGlsZCBvZiByb290IGNvcnJlY3RseSBwb3NpdGlvbmVkJyApO1xuXG4gIC8vIHRlc3QgdGhhdCBib3VuZHMgYXJlIHNldCBjb3JyZWN0bHkgb25jZSB3ZSBoYXZlIGEgaGllcmFyY2h5IGFuZCBhZGQgdHJhbnNmb3JtYXRpb25zXG4gIHJvb3ROb2RlLnJlbW92ZUNoaWxkKCBidXR0b25FbGVtZW50ICk7XG4gIHJvb3ROb2RlLnJlbW92ZUNoaWxkKCBkaXZFbGVtZW50ICk7XG4gIHJvb3ROb2RlLnJlbW92ZUNoaWxkKCBpbnB1dEVsZW1lbnQgKTtcblxuICByb290Tm9kZS5hZGRDaGlsZCggZGl2RWxlbWVudCApO1xuICBkaXZFbGVtZW50LmFkZENoaWxkKCBidXR0b25FbGVtZW50ICk7XG4gIGJ1dHRvbkVsZW1lbnQuYWRkQ2hpbGQoIGlucHV0RWxlbWVudCApO1xuXG4gIC8vIGFyYml0cmFyeSB0cmFuc2Zvcm1hdGlvbnMgZG93biB0aGUgdHJlZSAoc2hvdWxkIGJlIHByb3BhZ2F0ZWQgdG8gaW5wdXQgZWxlbWVudClcbiAgZGl2RWxlbWVudC5zZXRDZW50ZXIoIG5ldyBWZWN0b3IyKCA1MCwgNTAgKSApO1xuICBidXR0b25FbGVtZW50LnNldFNjYWxlTWFnbml0dWRlKCAwLjg5ICk7XG4gIGlucHV0RWxlbWVudC5zZXRSb3RhdGlvbiggTWF0aC5QSSAvIDQgKTtcblxuICAvLyB1ZHBkYXRlIHNvIHRoZSBkaXNwbGF5IHRvIHBvc2l0aW9uIGVsZW1lbnRzXG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuICBhc3NlcnQub2soIHNpYmxpbmdCb3VuZHNDb3JyZWN0KCBidXR0b25FbGVtZW50ICksICdidXR0b24gZWxlbWVudCBkZXNjZW5kYW50IGNvcnJlY3RseSBwb3NpdGlvbmVkJyApO1xuICBhc3NlcnQub2soIHNpYmxpbmdCb3VuZHNDb3JyZWN0KCBpbnB1dEVsZW1lbnQgKSwgJ2lucHV0IGVsZW1lbnQgZGVzY2VuZGFudCBjb3JyZWN0bHkgcG9zaXRpb25lZCcgKTtcblxuICAvLyB3aGVuIGlubmVyIGNvbnRlbnQgb2YgYW4gZWxlbWVudCBjaGFuZ2VzLCBpdHMgY2xpZW50IGJvdW5kcyBjaGFuZ2UgLSBtYWtlIHN1cmUgdGhhdCB0aGUgZWxlbWVudCBzdGlsbCBtYXRjaGVzXG4gIC8vIHRoZSBOb2RlXG4gIGJ1dHRvbkVsZW1lbnQuaW5uZXJIVE1MID0gJ1NvbWUgVGVzdCc7XG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuICBhc3NlcnQub2soIHNpYmxpbmdCb3VuZHNDb3JyZWN0KCBidXR0b25FbGVtZW50ICksICdidXR0b24gZWxlbWVudCBkZXNjZW5kYW50IGNvcnJlY2x0eSBwb3NpdGlvbmVkIGFmdGVyIGlubmVyIGNvbnRlbnQgY2hhbmdlZCcgKTtcblxuICAvLyByZW1vdmUgdGhlIGRpc3BsYXkgZWxlbWVudCBzbyBpdCBkb2Vzbid0IGludGVyZmVyZSB3aXRoIHF1bml0IEFQSVxuICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ1BET00gdHJhbnNmb3JtIHNvdXJjZSBOb2RlJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgY29uc3QgYnV0dG9uTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDUsIDUsIDUsIDUsIHsgdGFnTmFtZTogJ2J1dHRvbicsIHBvc2l0aW9uSW5QRE9NOiB0cnVlIH0gKTtcbiAgY29uc3QgdHJhbnNmb3JtU291cmNlTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDI1LCAyNSApO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBidXR0b25Ob2RlICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCB0cmFuc2Zvcm1Tb3VyY2VOb2RlICk7XG5cbiAgLy8gdXBkYXRlIHRoZSBkaXNwbGF5IHRvIHBvc2l0aW9uIGVsZW1lbnRzXG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuICBhc3NlcnQub2soIHNpYmxpbmdCb3VuZHNDb3JyZWN0KCBidXR0b25Ob2RlICksICdidXR0b24gZWxlbWVudCBjaGlsZCBvZiByb290IGNvcnJlY3RseSBwb3NpdGlvbmVkJyApO1xuXG4gIGNvbnN0IHNpYmxpbmdCb3VuZHNCZWZvcmUgPSBnZXRTaWJsaW5nQm91bmRzKCBidXR0b25Ob2RlICk7XG5cbiAgLy8gdGVzdCBzZXR0aW5nIHRyYW5zZm9ybSBzb3VyY2UgTm9kZVxuICBidXR0b25Ob2RlLnBkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlID0gdHJhbnNmb3JtU291cmNlTm9kZTtcblxuICAvLyB1cGRhdGUgdGhlIGRpc3BsYXkgdG8gcG9zaXRpb24gZWxlbWVudHNcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XG5cbiAgYXNzZXJ0Lm9rKCBzaWJsaW5nQm91bmRzQ29ycmVjdCggYnV0dG9uTm9kZSApLCAnYnV0dG9uIGVsZW1lbnQgdHJhbnNmb3JtZWQgd2l0aCB0cmFuc2Zvcm0gc291cmNlIE5vZGUnICk7XG4gIGFzc2VydC5vayggIXNpYmxpbmdCb3VuZHNCZWZvcmUuZXF1YWxzKCBnZXRTaWJsaW5nQm91bmRzKCBidXR0b25Ob2RlICkgKSwgJ3NpYmxpbmcgYm91bmRzIHNob3VsZCBoYXZlIGNoYW5nZWQgYWZ0ZXIgc2V0dGluZyB0cmFuc2Zvcm0gc291cmNlJyApO1xuXG4gIC8vIHJlcG9zaXRpb24gdGhlIGJ1dHRvbk5vZGUgLSBwZG9tIHNpYmxpbmcgc2hvdWxkIE5PVCByZXBvc2l0aW9uXG4gIGNvbnN0IHNpYmxpbmdCb3VuZHNCZWZvcmVOb2RlUmVwb3NpdGlvbiA9IGdldFNpYmxpbmdCb3VuZHMoIGJ1dHRvbk5vZGUgKTtcbiAgYnV0dG9uTm9kZS5zZXRYKCAxMDAgKTtcbiAgYnV0dG9uTm9kZS5zZXRZKCAxMDAgKTtcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XG4gIGFzc2VydC5vayggc2libGluZ0JvdW5kc0NvcnJlY3QoIGJ1dHRvbk5vZGUgKSwgJ3NpYmxpbmcgYm91bmRzIGNvcnJlY3QgYWZ0ZXIgbm9kZSByZXBvc2l0aW9uZWQnICk7XG4gIGFzc2VydC5vayggc2libGluZ0JvdW5kc0JlZm9yZU5vZGVSZXBvc2l0aW9uLmVxdWFscyggZ2V0U2libGluZ0JvdW5kcyggYnV0dG9uTm9kZSApICksICd0cmFuc2Zvcm0gc291cmNlIGRpZG50IGNoYW5nZSwgcHJpbWFyeSBzaWJsaW5nIHNob3VsZCBub3QgcmVwb3NpdGlvbicgKTtcblxuICAvLyByZXBvc2l0aW9uIHRoZSB0cmFuc2Zvcm0gc291cmNlIC0gcGRvbSBzaWJsaW5nIFNIT1VMRCByZXBvc2l0aW9uXG4gIGNvbnN0IHNpYmxpbmdCb3VuZHNCZWZvcmVTb3VyY2VSZXBvc2l0aW9uID0gZ2V0U2libGluZ0JvdW5kcyggYnV0dG9uTm9kZSApO1xuICB0cmFuc2Zvcm1Tb3VyY2VOb2RlLnNldFgoIDUwICk7XG4gIHRyYW5zZm9ybVNvdXJjZU5vZGUuc2V0WCggNTAgKTtcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XG4gIGFzc2VydC5vayggc2libGluZ0JvdW5kc0NvcnJlY3QoIGJ1dHRvbk5vZGUgKSwgJ3NpYmxpbmcgYm91bmRzIGNvcnJlY3QgYWZ0ZXIgc291cmNlIG5vZGUgcmVwb3NpdGlvbmVkJyApO1xuICBhc3NlcnQub2soICFzaWJsaW5nQm91bmRzQmVmb3JlU291cmNlUmVwb3NpdGlvbi5lcXVhbHMoIGdldFNpYmxpbmdCb3VuZHMoIGJ1dHRvbk5vZGUgKSApLCAndHJhbnNmb3JtIHNvdXJjZSBkaWRudCBjaGFuZ2UsIHByaW1hcnkgc2libGluZyBzaG91bGQgbm90IHJlcG9zaXRpb24nICk7XG5cbiAgLy8gcmVtb3ZlIHRoZSBkaXNwbGF5IGVsZW1lbnQgc28gaXQgZG9lc24ndCBpbnRlcmZlcmUgd2l0aCBxdW5pdCBBUElcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdzZXRQb3NpdGlvbkVsZW1lbnRzIHRlc3QnLCBhc3NlcnQgPT4ge1xuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBjb25zdCBidXR0b25Ob2RlID0gbmV3IFJlY3RhbmdsZSggNSwgNSwgNSwgNSwgeyB0YWdOYW1lOiAnYnV0dG9uJywgcG9zaXRpb25JblBET006IHRydWUgfSApO1xuICByb290Tm9kZS5hZGRDaGlsZCggYnV0dG9uTm9kZSApO1xuXG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuICBhc3NlcnQub2soIHNpYmxpbmdCb3VuZHNDb3JyZWN0KCBidXR0b25Ob2RlICksICdzaWJsaW5nIGJvdW5kcyBpbml0aWFsbHkgY29ycmVjdCcgKTtcblxuICBidXR0b25Ob2RlLnNldFBvc2l0aW9uSW5QRE9NKCBmYWxzZSApO1xuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcbiAgYXNzZXJ0Lm9rKCBzaWJsaW5nQm91bmRzQ29ycmVjdCggYnV0dG9uTm9kZSApLCAnc2libGluZyBib3VuZHMgY29ycmVjdCBhZnRlciBwb3NpdGlvbkluUERPTSBmYWxzZScgKTtcblxuICBidXR0b25Ob2RlLnNldFBvc2l0aW9uSW5QRE9NKCB0cnVlICk7XG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuICBhc3NlcnQub2soIHNpYmxpbmdCb3VuZHNDb3JyZWN0KCBidXR0b25Ob2RlICksICdzaWJsaW5nIGJvdW5kcyByZXBvc2l0aW9uZWQgYWZ0ZXIgcG9zaXRpb25JblBET00gdHJ1ZScgKTtcblxuICAvLyByZW1vdmUgdGhlIGRpc3BsYXkgZWxlbWVudCBzbyBpdCBkb2Vzbid0IGludGVyZmVyZSB3aXRoIHF1bml0IEFQSVxuICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG59ICk7Il0sIm5hbWVzIjpbIkJvdW5kczIiLCJWZWN0b3IyIiwiRGlzcGxheSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJQRE9NUGVlciIsIlBJWEVMX1BBRERJTkciLCJRVW5pdCIsIm1vZHVsZSIsImdldFNpYmxpbmdCb3VuZHMiLCJub2RlIiwic2libGluZ1JlY3QiLCJwZG9tSW5zdGFuY2VzIiwicGVlciIsInByaW1hcnlTaWJsaW5nIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsInNpYmxpbmdCb3VuZHNDb3JyZWN0IiwidHJhbnNmb3JtU291cmNlTm9kZSIsInBkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlIiwic291cmNlTm9kZUJvdW5kcyIsImdsb2JhbEJvdW5kcyIsInNpYmxpbmdCb3VuZHMiLCJjb21wYXJlZEJvdW5kcyIsInBvc2l0aW9uSW5QRE9NIiwiT0ZGU0NSRUVOX1NJQkxJTkdfQk9VTkRTIiwiZXF1YWxzRXBzaWxvbiIsInRlc3QiLCJhc3NlcnQiLCJyb290Tm9kZSIsInRhZ05hbWUiLCJkaXNwbGF5IiwiZG9jdW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJkb21FbGVtZW50IiwiYnV0dG9uRWxlbWVudCIsImRpdkVsZW1lbnQiLCJmb2N1c2FibGUiLCJpbnB1dEVsZW1lbnQiLCJpbnB1dFR5cGUiLCJhZGRDaGlsZCIsInVwZGF0ZURpc3BsYXkiLCJvayIsInJlbW92ZUNoaWxkIiwic2V0Q2VudGVyIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJzZXRSb3RhdGlvbiIsIk1hdGgiLCJQSSIsImlubmVySFRNTCIsImRpc3Bvc2UiLCJidXR0b25Ob2RlIiwic2libGluZ0JvdW5kc0JlZm9yZSIsImVxdWFscyIsInNpYmxpbmdCb3VuZHNCZWZvcmVOb2RlUmVwb3NpdGlvbiIsInNldFgiLCJzZXRZIiwic2libGluZ0JvdW5kc0JlZm9yZVNvdXJjZVJlcG9zaXRpb24iLCJzZXRQb3NpdGlvbkluUERPTSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxhQUFhLDJCQUEyQjtBQUMvQyxPQUFPQyxVQUFVLHNCQUFzQjtBQUN2QyxPQUFPQyxlQUFlLDJCQUEyQjtBQUNqRCxPQUFPQyxjQUFjLGdCQUFnQjtBQUVyQyxZQUFZO0FBQ1osTUFBTUMsZ0JBQWdCO0FBRXRCQyxNQUFNQyxNQUFNLENBQUU7QUFFZDs7OztDQUlDLEdBQ0QsTUFBTUMsbUJBQW1CQyxDQUFBQTtJQUN2QixNQUFNQyxjQUFjRCxLQUFLRSxhQUFhLENBQUUsRUFBRyxDQUFDQyxJQUFJLENBQUNDLGNBQWMsQ0FBQ0MscUJBQXFCO0lBQ3JGLE9BQU8sSUFBSWYsUUFBU1csWUFBWUssQ0FBQyxFQUFFTCxZQUFZTSxDQUFDLEVBQUVOLFlBQVlLLENBQUMsR0FBR0wsWUFBWU8sS0FBSyxFQUFFUCxZQUFZTSxDQUFDLEdBQUdOLFlBQVlRLE1BQU07QUFDekg7QUFFQTs7Ozs7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