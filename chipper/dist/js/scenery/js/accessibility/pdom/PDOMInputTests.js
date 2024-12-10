// Copyright 2018-2023, University of Colorado Boulder
/**
 * Tests related to ParallelDOM input and events.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import merge from '../../../../phet-core/js/merge.js';
import Display from '../../display/Display.js';
import Node from '../../nodes/Node.js';
import Rectangle from '../../nodes/Rectangle.js';
import globalKeyStateTracker from '../globalKeyStateTracker.js';
import KeyboardUtils from '../KeyboardUtils.js';
// constants
const TEST_LABEL = 'Test Label';
const TEST_LABEL_2 = 'Test Label 2';
let canRunTests = true;
QUnit.module('PDOMInput', {
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
 * Set up a test for accessible input by attaching a root node to a display and initializing events.
 * @param {Display} display
 */ const beforeTest = (display)=>{
    display.initializeEvents();
    document.body.appendChild(display.domElement);
};
/**
 * Clean up a test by detaching events and removing the element from the DOM so that it doesn't interfere
 * with QUnit UI.
 * @param {Display} display
 */ const afterTest = (display)=>{
    document.body.removeChild(display.domElement);
    display.dispose();
};
const dispatchEvent = (domElement, event)=>{
    const Constructor = event.startsWith('key') ? window.KeyboardEvent : window.Event;
    domElement.dispatchEvent(new Constructor(event, {
        bubbles: true,
        code: KeyboardUtils.KEY_TAB
    }));
};
// create a fake DOM event and delegate to an HTMLElement
// TODO: Can this replace the dispatchEvent function above? EXTRA_TODO use KeyboardFuzzer.triggerDOMEvent as a guide to rewrite this. https://github.com/phetsims/scenery/issues/1581
const triggerDOMEvent = (event, element, key, options)=>{
    options = merge({
        // secondary target for the event, behavior depends on event type
        relatedTarget: null,
        // Does the event bubble? Almost all scenery PDOM events should.
        bubbles: true,
        // Is the event cancelable? Most are, this should generally be true.
        cancelable: true,
        // Optional code for the event, most relevant if the eventType is window.KeyboardEvent.
        code: key,
        // {function} Constructor for the event.
        eventConstructor: window.Event
    }, options);
    const eventToDispatch = new options.eventConstructor(event, options);
    element.dispatchEvent ? element.dispatchEvent(eventToDispatch) : element.fireEvent(`on${eventToDispatch}`, eventToDispatch);
};
QUnit.test('focusin/focusout (focus/blur)', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    beforeTest(display);
    const a = new Rectangle(0, 0, 20, 20, {
        tagName: 'button'
    });
    const b = new Rectangle(0, 0, 20, 20, {
        tagName: 'button'
    });
    const c = new Rectangle(0, 0, 20, 20, {
        tagName: 'button'
    });
    // rootNode
    //   /  \
    //  a    b
    //        \
    //         c
    rootNode.addChild(a);
    rootNode.addChild(b);
    b.addChild(c);
    let aGotFocus = false;
    let aLostFocus = false;
    let bGotFocus = false;
    let bGotBlur = false;
    let bGotFocusIn = false;
    let bGotFocusOut = false;
    let cGotFocusIn = false;
    let cGotFocusOut = false;
    const resetFocusVariables = ()=>{
        aGotFocus = false;
        aLostFocus = false;
        bGotFocus = false;
        bGotBlur = false;
        bGotFocusIn = false;
        bGotFocusOut = false;
        cGotFocusIn = false;
        cGotFocusOut = false;
    };
    a.addInputListener({
        focus () {
            aGotFocus = true;
        },
        blur () {
            aLostFocus = true;
        }
    });
    b.addInputListener({
        focus () {
            bGotFocus = true;
        },
        blur () {
            bGotBlur = true;
        },
        focusin () {
            bGotFocusIn = true;
        },
        focusout () {
            bGotFocusOut = true;
        }
    });
    c.addInputListener({
        focusin () {
            cGotFocusIn = true;
        },
        focusout () {
            cGotFocusOut = true;
        }
    });
    a.focus();
    assert.ok(aGotFocus, 'a should have been focused');
    assert.ok(!aLostFocus, 'a should not blur');
    resetFocusVariables();
    b.focus();
    assert.ok(bGotFocus, 'b should have been focused');
    assert.ok(aLostFocus, 'a should have lost focused');
    resetFocusVariables();
    c.focus();
    assert.ok(!bGotFocus, 'b should not receive focus (doesnt bubble)');
    assert.ok(cGotFocusIn, 'c should receive a focusin');
    assert.ok(bGotFocusIn, 'b should receive a focusin (from bubbling)');
    resetFocusVariables();
    c.blur();
    assert.ok(!bGotBlur, 'b should not receive a blur event (doesnt bubble)');
    assert.ok(cGotFocusOut, 'c should have received a focusout');
    assert.ok(bGotFocusOut, 'c should have received a focusout (from bubbling)');
    afterTest(display);
});
QUnit.test('tab focusin/focusout', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    beforeTest(display);
    // inner content for improved readability during debugging
    const buttonA = new Rectangle(0, 0, 5, 5, {
        tagName: 'button',
        innerContent: 'BUTTON A'
    });
    const buttonB = new Rectangle(0, 0, 5, 5, {
        tagName: 'button',
        innerContent: 'BUTTON B'
    });
    const buttonC = new Rectangle(0, 0, 5, 5, {
        tagName: 'button',
        innerContent: 'BUTTON C'
    });
    rootNode.children = [
        buttonA,
        buttonB,
        buttonC
    ];
    const aPrimarySibling = buttonA.pdomInstances[0].peer.primarySibling;
    const bPrimarySibling = buttonB.pdomInstances[0].peer.primarySibling;
    // test that a blur listener on a node overides the "tab" like navigation moving focus to the next element
    buttonA.focus();
    assert.ok(buttonA.focused, 'butonA has focus initially');
    const overrideFocusListener = {
        blur: (event)=>{
            buttonC.focus();
        }
    };
    buttonA.addInputListener(overrideFocusListener);
    // mimic a "tab" interaction, attempting to move focus to the next element
    triggerDOMEvent('focusout', aPrimarySibling, KeyboardUtils.KEY_TAB, {
        relatedTarget: bPrimarySibling
    });
    // the blur listener on buttonA should override the movement of focus on "tab" like interaction
    assert.ok(buttonC.focused, 'butonC now has focus');
    // test that a blur listener can prevent focus from moving to another element after "tab" like navigation
    buttonA.removeInputListener(overrideFocusListener);
    buttonA.focus();
    const makeUnfocusableListener = {
        blur: (event)=>{
            buttonB.focusable = false;
        }
    };
    buttonA.addInputListener(makeUnfocusableListener);
    // mimic a tab press by moving focus to buttonB - this will automatically have the correct `relatedTarget` for
    // the `blur` event on buttonA because focus is moving from buttonA to buttonB.
    buttonB.focus();
    // the blur listener on buttonA should have made the default element unfocusable
    assert.ok(!buttonB.focused, 'buttonB cannot receive focus due to blur listener on buttonA');
    assert.ok(document.activeElement !== bPrimarySibling, 'element buttonB cannot receive focus due to blur listener on buttonA');
    assert.ok(!buttonA.focused, 'buttonA cannot keep focus when tabbing away, even if buttonB is not focusable');
    // cleanup for the next test
    buttonA.removeInputListener(makeUnfocusableListener);
    buttonB.focusable = true;
    buttonA.focus();
    const causeRedrawListener = {
        blur: (event)=>{
            buttonB.focusable = true;
            buttonB.tagName = 'p';
        }
    };
    buttonA.addInputListener(causeRedrawListener);
    buttonB.focus();
    // the blur listener on buttonA will cause a full redraw of buttonB in the PDOM, but buttonB should receive focus
    assert.ok(buttonB.focused, 'buttonB should still have focus after a full redraw due to a blur listener');
    // cleanup
    buttonA.removeInputListener(causeRedrawListener);
    buttonA.focusable = true;
    buttonB.tagName = 'button';
    // sanity checks manipulating focus, and added because we were seeing very strange things while working on
    // https://github.com/phetsims/scenery/issues/1296, but these should definitely pass
    buttonA.focus();
    assert.ok(buttonA.focused, 'buttonA does not have focus after a basic focus call?');
    buttonB.blur();
    assert.ok(buttonA.focused, 'Blurring a non-focussed element should not remove focus from a non-focused element');
    afterTest(display);
});
QUnit.test('click', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    beforeTest(display);
    const a = new Rectangle(0, 0, 20, 20, {
        tagName: 'button'
    });
    let gotFocus = false;
    let gotClick = false;
    let aClickCounter = 0;
    rootNode.addChild(a);
    a.addInputListener({
        focus () {
            gotFocus = true;
        },
        click () {
            gotClick = true;
            aClickCounter++;
        },
        blur () {
            gotFocus = false;
        }
    });
    a.pdomInstances[0].peer.primarySibling.focus();
    assert.ok(gotFocus && !gotClick, 'focus first');
    a.pdomInstances[0].peer.primarySibling.click(); // this works because it's a button
    assert.ok(gotClick && gotFocus && aClickCounter === 1, 'a should have been clicked');
    let bClickCounter = 0;
    const b = new Rectangle(0, 0, 20, 20, {
        tagName: 'button'
    });
    b.addInputListener({
        click () {
            bClickCounter++;
        }
    });
    a.addChild(b);
    b.pdomInstances[0].peer.primarySibling.focus();
    b.pdomInstances[0].peer.primarySibling.click();
    assert.ok(bClickCounter === 1 && aClickCounter === 2, 'a should have been clicked with b');
    a.pdomInstances[0].peer.primarySibling.click();
    assert.ok(bClickCounter === 1 && aClickCounter === 3, 'b still should not have been clicked.');
    // create a node
    const a1 = new Node({
        tagName: 'button'
    });
    a.addChild(a1);
    assert.ok(a1.inputListeners.length === 0, 'no input accessible listeners on instantiation');
    assert.ok(a1.labelContent === null, 'no label on instantiation');
    // add a listener
    const listener = {
        click () {
            a1.labelContent = TEST_LABEL;
        }
    };
    a1.addInputListener(listener);
    assert.ok(a1.inputListeners.length === 1, 'accessible listener added');
    // verify added with hasInputListener
    assert.ok(a1.hasInputListener(listener) === true, 'found with hasInputListener');
    // fire the event
    a1.pdomInstances[0].peer.primarySibling.click();
    assert.ok(a1.labelContent === TEST_LABEL, 'click fired, label set');
    const c = new Rectangle(0, 0, 20, 20, {
        tagName: 'button'
    });
    const d = new Rectangle(0, 0, 20, 20, {
        tagName: 'button'
    });
    const e = new Rectangle(0, 0, 20, 20, {
        tagName: 'button'
    });
    let cClickCount = 0;
    let dClickCount = 0;
    let eClickCount = 0;
    rootNode.addChild(c);
    c.addChild(d);
    d.addChild(e);
    c.addInputListener({
        click () {
            cClickCount++;
        }
    });
    d.addInputListener({
        click () {
            dClickCount++;
        }
    });
    e.addInputListener({
        click () {
            eClickCount++;
        }
    });
    e.pdomInstances[0].peer.primarySibling.click();
    assert.ok(cClickCount === dClickCount && cClickCount === eClickCount && cClickCount === 1, 'click should have bubbled to all parents');
    d.pdomInstances[0].peer.primarySibling.click();
    assert.ok(cClickCount === 2 && dClickCount === 2 && eClickCount === 1, 'd should not trigger click on e');
    c.pdomInstances[0].peer.primarySibling.click();
    assert.ok(cClickCount === 3 && dClickCount === 2 && eClickCount === 1, 'c should not trigger click on d or e');
    // reset click count
    cClickCount = 0;
    dClickCount = 0;
    eClickCount = 0;
    c.pdomOrder = [
        d,
        e
    ];
    e.pdomInstances[0].peer.primarySibling.click();
    assert.ok(cClickCount === 1 && dClickCount === 0 && eClickCount === 1, 'pdomOrder means click should bypass d');
    c.pdomInstances[0].peer.primarySibling.click();
    assert.ok(cClickCount === 2 && dClickCount === 0 && eClickCount === 1, 'click c should not effect e or d.');
    d.pdomInstances[0].peer.primarySibling.click();
    assert.ok(cClickCount === 3 && dClickCount === 1 && eClickCount === 1, 'click d should not effect e.');
    // reset click count
    cClickCount = 0;
    dClickCount = 0;
    eClickCount = 0;
    const f = new Rectangle(0, 0, 20, 20, {
        tagName: 'button'
    });
    let fClickCount = 0;
    f.addInputListener({
        click () {
            fClickCount++;
        }
    });
    e.addChild(f);
    // so its a chain in the scene graph c->d->e->f
    d.pdomOrder = [
        f
    ];
    /* accessible instance tree:
       c
      / \
      d  e
      |
      f
  */ f.pdomInstances[0].peer.primarySibling.click();
    assert.ok(cClickCount === 1 && dClickCount === 1 && eClickCount === 0 && fClickCount === 1, 'click d should not effect e.');
    afterTest(display);
});
QUnit.test('click extra', (assert)=>{
    // create a node
    const a1 = new Node({
        tagName: 'button'
    });
    const root = new Node({
        tagName: 'div'
    });
    const display = new Display(root);
    beforeTest(display);
    root.addChild(a1);
    assert.ok(a1.inputListeners.length === 0, 'no input accessible listeners on instantiation');
    assert.ok(a1.labelContent === null, 'no label on instantiation');
    // add a listener
    const listener = {
        click: ()=>{
            a1.labelContent = TEST_LABEL;
        }
    };
    a1.addInputListener(listener);
    assert.ok(a1.inputListeners.length === 1, 'accessible listener added');
    // verify added with hasInputListener
    assert.ok(a1.hasInputListener(listener) === true, 'found with hasInputListener');
    // fire the event
    a1.pdomInstances[0].peer.primarySibling.click();
    assert.ok(a1.labelContent === TEST_LABEL, 'click fired, label set');
    // remove the listener
    a1.removeInputListener(listener);
    assert.ok(a1.inputListeners.length === 0, 'accessible listener removed');
    // verify removed with hasInputListener
    assert.ok(a1.hasInputListener(listener) === false, 'not found with hasInputListener');
    // make sure event listener was also removed from DOM element
    // click should not change the label
    a1.labelContent = TEST_LABEL_2;
    assert.ok(a1.labelContent === TEST_LABEL_2, 'before click');
    // setting the label redrew the pdom, so get a reference to the new dom element.
    a1.pdomInstances[0].peer.primarySibling.click();
    assert.ok(a1.labelContent === TEST_LABEL_2, 'click should not change label');
    // verify disposal removes accessible input listeners
    a1.addInputListener(listener);
    a1.dispose();
    // TODO: Since converting to use Node.inputListeners, we can't assume this anymore https://github.com/phetsims/scenery/issues/1581
    // assert.ok( a1.hasInputListener( listener ) === false, 'disposal removed accessible input listeners' );
    afterTest(display);
});
QUnit.test('input', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    beforeTest(display);
    const a = new Rectangle(0, 0, 20, 20, {
        tagName: 'input',
        inputType: 'text'
    });
    let gotFocus = false;
    let gotInput = false;
    rootNode.addChild(a);
    a.addInputListener({
        focus () {
            gotFocus = true;
        },
        input () {
            gotInput = true;
        },
        blur () {
            gotFocus = false;
        }
    });
    a.pdomInstances[0].peer.primarySibling.focus();
    assert.ok(gotFocus && !gotInput, 'focus first');
    dispatchEvent(a.pdomInstances[0].peer.primarySibling, 'input');
    assert.ok(gotInput && gotFocus, 'a should have been an input');
    afterTest(display);
});
QUnit.test('change', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    beforeTest(display);
    const a = new Rectangle(0, 0, 20, 20, {
        tagName: 'input',
        inputType: 'range'
    });
    let gotFocus = false;
    let gotChange = false;
    rootNode.addChild(a);
    a.addInputListener({
        focus () {
            gotFocus = true;
        },
        change () {
            gotChange = true;
        },
        blur () {
            gotFocus = false;
        }
    });
    a.pdomInstances[0].peer.primarySibling.focus();
    assert.ok(gotFocus && !gotChange, 'focus first');
    dispatchEvent(a.pdomInstances[0].peer.primarySibling, 'change');
    assert.ok(gotChange && gotFocus, 'a should have been an input');
    afterTest(display);
});
QUnit.test('keydown/keyup', (assert)=>{
    if (!canRunTests) {
        assert.ok(true, 'Skipping test because document does not have focus');
        return;
    }
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    beforeTest(display);
    const a = new Rectangle(0, 0, 20, 20, {
        tagName: 'input',
        inputType: 'text'
    });
    let gotFocus = false;
    let gotKeydown = false;
    let gotKeyup = false;
    rootNode.addChild(a);
    a.addInputListener({
        focus () {
            gotFocus = true;
        },
        keydown () {
            gotKeydown = true;
        },
        keyup () {
            gotKeyup = true;
        },
        blur () {
            gotFocus = false;
        }
    });
    a.pdomInstances[0].peer.primarySibling.focus();
    assert.ok(gotFocus && !gotKeydown, 'focus first');
    dispatchEvent(a.pdomInstances[0].peer.primarySibling, 'keydown');
    assert.ok(gotKeydown && gotFocus, 'a should have had keydown');
    dispatchEvent(a.pdomInstances[0].peer.primarySibling, 'keyup');
    assert.ok(gotKeydown && gotKeyup && gotFocus, 'a should have had keyup');
    afterTest(display);
});
QUnit.test('Global KeyStateTracker tests', (assert)=>{
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    beforeTest(display);
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
    a.addChild(b);
    b.addChild(c);
    c.addChild(d);
    rootNode.addChild(a);
    const dPrimarySibling = d.pdomInstances[0].peer.primarySibling;
    triggerDOMEvent('keydown', dPrimarySibling, KeyboardUtils.KEY_RIGHT_ARROW, {
        eventConstructor: window.KeyboardEvent
    });
    assert.ok(globalKeyStateTracker.isKeyDown(KeyboardUtils.KEY_RIGHT_ARROW), 'global keyStateTracker should be updated with right arrow key down');
    afterTest(display);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BET01JbnB1dFRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRlc3RzIHJlbGF0ZWQgdG8gUGFyYWxsZWxET00gaW5wdXQgYW5kIGV2ZW50cy5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBEaXNwbGF5IGZyb20gJy4uLy4uL2Rpc3BsYXkvRGlzcGxheS5qcyc7XG5pbXBvcnQgTm9kZSBmcm9tICcuLi8uLi9ub2Rlcy9Ob2RlLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi4vLi4vbm9kZXMvUmVjdGFuZ2xlLmpzJztcbmltcG9ydCBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIgZnJvbSAnLi4vZ2xvYmFsS2V5U3RhdGVUcmFja2VyLmpzJztcbmltcG9ydCBLZXlib2FyZFV0aWxzIGZyb20gJy4uL0tleWJvYXJkVXRpbHMuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFRFU1RfTEFCRUwgPSAnVGVzdCBMYWJlbCc7XG5jb25zdCBURVNUX0xBQkVMXzIgPSAnVGVzdCBMYWJlbCAyJztcblxubGV0IGNhblJ1blRlc3RzID0gdHJ1ZTtcblxuUVVuaXQubW9kdWxlKCAnUERPTUlucHV0Jywge1xuICBiZWZvcmVFYWNoOiAoKSA9PiB7XG5cbiAgICAvLyBBIHRlc3QgY2FuIG9ubHkgYmUgcnVuIHdoZW4gdGhlIGRvY3VtZW50IGhhcyBmb2N1cyBiZWNhdXNlIHRlc3RzIHJlcXVpcmUgZm9jdXMvYmx1ciBldmVudHMuIEJyb3dzZXJzXG4gICAgLy8gZG8gbm90IGVtaXQgdGhlc2UgZXZlbnRzIHdoZW4gdGhlIHdpbmRvdyBpcyBub3QgYWN0aXZlIChlc3BlY2lhbGx5IHRydWUgZm9yIHB1cGV0dGVlclxuICAgIGNhblJ1blRlc3RzID0gZG9jdW1lbnQuaGFzRm9jdXMoKTtcblxuICAgIGlmICggIWNhblJ1blRlc3RzICkge1xuICAgICAgY29uc29sZS53YXJuKCAnVW5hYmxlIHRvIHJ1biBmb2N1cyB0ZXN0cyBiZWNhdXNlIHRoZSBkb2N1bWVudCBkb2VzIG5vdCBoYXZlIGZvY3VzJyApO1xuICAgIH1cbiAgfVxufSApO1xuXG4vKipcbiAqIFNldCB1cCBhIHRlc3QgZm9yIGFjY2Vzc2libGUgaW5wdXQgYnkgYXR0YWNoaW5nIGEgcm9vdCBub2RlIHRvIGEgZGlzcGxheSBhbmQgaW5pdGlhbGl6aW5nIGV2ZW50cy5cbiAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxuICovXG5jb25zdCBiZWZvcmVUZXN0ID0gZGlzcGxheSA9PiB7XG4gIGRpc3BsYXkuaW5pdGlhbGl6ZUV2ZW50cygpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbn07XG5cbi8qKlxuICogQ2xlYW4gdXAgYSB0ZXN0IGJ5IGRldGFjaGluZyBldmVudHMgYW5kIHJlbW92aW5nIHRoZSBlbGVtZW50IGZyb20gdGhlIERPTSBzbyB0aGF0IGl0IGRvZXNuJ3QgaW50ZXJmZXJlXG4gKiB3aXRoIFFVbml0IFVJLlxuICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gKi9cbmNvbnN0IGFmdGVyVGVzdCA9IGRpc3BsYXkgPT4ge1xuICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG59O1xuXG5jb25zdCBkaXNwYXRjaEV2ZW50ID0gKCBkb21FbGVtZW50LCBldmVudCApID0+IHtcbiAgY29uc3QgQ29uc3RydWN0b3IgPSBldmVudC5zdGFydHNXaXRoKCAna2V5JyApID8gd2luZG93LktleWJvYXJkRXZlbnQgOiB3aW5kb3cuRXZlbnQ7XG4gIGRvbUVsZW1lbnQuZGlzcGF0Y2hFdmVudCggbmV3IENvbnN0cnVjdG9yKCBldmVudCwge1xuICAgIGJ1YmJsZXM6IHRydWUsIC8vIHRoYXQgaXMgdml0YWwgdG8gYWxsIHRoYXQgc2NlbmVyeSBldmVudHMgaG9sZCBuZWFyIGFuZCBkZWFyIHRvIHRoZWlyIGhlYXJ0cy5cbiAgICBjb2RlOiBLZXlib2FyZFV0aWxzLktFWV9UQUJcbiAgfSApICk7XG59O1xuXG4vLyBjcmVhdGUgYSBmYWtlIERPTSBldmVudCBhbmQgZGVsZWdhdGUgdG8gYW4gSFRNTEVsZW1lbnRcbi8vIFRPRE86IENhbiB0aGlzIHJlcGxhY2UgdGhlIGRpc3BhdGNoRXZlbnQgZnVuY3Rpb24gYWJvdmU/IEVYVFJBX1RPRE8gdXNlIEtleWJvYXJkRnV6emVyLnRyaWdnZXJET01FdmVudCBhcyBhIGd1aWRlIHRvIHJld3JpdGUgdGhpcy4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbmNvbnN0IHRyaWdnZXJET01FdmVudCA9ICggZXZlbnQsIGVsZW1lbnQsIGtleSwgb3B0aW9ucyApID0+IHtcblxuICBvcHRpb25zID0gbWVyZ2UoIHtcblxuICAgIC8vIHNlY29uZGFyeSB0YXJnZXQgZm9yIHRoZSBldmVudCwgYmVoYXZpb3IgZGVwZW5kcyBvbiBldmVudCB0eXBlXG4gICAgcmVsYXRlZFRhcmdldDogbnVsbCxcblxuICAgIC8vIERvZXMgdGhlIGV2ZW50IGJ1YmJsZT8gQWxtb3N0IGFsbCBzY2VuZXJ5IFBET00gZXZlbnRzIHNob3VsZC5cbiAgICBidWJibGVzOiB0cnVlLFxuXG4gICAgLy8gSXMgdGhlIGV2ZW50IGNhbmNlbGFibGU/IE1vc3QgYXJlLCB0aGlzIHNob3VsZCBnZW5lcmFsbHkgYmUgdHJ1ZS5cbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuXG4gICAgLy8gT3B0aW9uYWwgY29kZSBmb3IgdGhlIGV2ZW50LCBtb3N0IHJlbGV2YW50IGlmIHRoZSBldmVudFR5cGUgaXMgd2luZG93LktleWJvYXJkRXZlbnQuXG4gICAgY29kZToga2V5LFxuXG4gICAgLy8ge2Z1bmN0aW9ufSBDb25zdHJ1Y3RvciBmb3IgdGhlIGV2ZW50LlxuICAgIGV2ZW50Q29uc3RydWN0b3I6IHdpbmRvdy5FdmVudFxuICB9LCBvcHRpb25zICk7XG5cbiAgY29uc3QgZXZlbnRUb0Rpc3BhdGNoID0gbmV3IG9wdGlvbnMuZXZlbnRDb25zdHJ1Y3RvciggZXZlbnQsIG9wdGlvbnMgKTtcbiAgZWxlbWVudC5kaXNwYXRjaEV2ZW50ID8gZWxlbWVudC5kaXNwYXRjaEV2ZW50KCBldmVudFRvRGlzcGF0Y2ggKSA6IGVsZW1lbnQuZmlyZUV2ZW50KCBgb24ke2V2ZW50VG9EaXNwYXRjaH1gLCBldmVudFRvRGlzcGF0Y2ggKTtcbn07XG5cblFVbml0LnRlc3QoICdmb2N1c2luL2ZvY3Vzb3V0IChmb2N1cy9ibHVyKScsIGFzc2VydCA9PiB7XG4gIGlmICggIWNhblJ1blRlc3RzICkge1xuICAgIGFzc2VydC5vayggdHJ1ZSwgJ1NraXBwaW5nIHRlc3QgYmVjYXVzZSBkb2N1bWVudCBkb2VzIG5vdCBoYXZlIGZvY3VzJyApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XG4gIGJlZm9yZVRlc3QoIGRpc3BsYXkgKTtcblxuICBjb25zdCBhID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMjAsIDIwLCB7IHRhZ05hbWU6ICdidXR0b24nIH0gKTtcbiAgY29uc3QgYiA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDIwLCAyMCwgeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XG4gIGNvbnN0IGMgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuXG4gIC8vIHJvb3ROb2RlXG4gIC8vICAgLyAgXFxcbiAgLy8gIGEgICAgYlxuICAvLyAgICAgICAgXFxcbiAgLy8gICAgICAgICBjXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBiICk7XG4gIGIuYWRkQ2hpbGQoIGMgKTtcblxuICBsZXQgYUdvdEZvY3VzID0gZmFsc2U7XG4gIGxldCBhTG9zdEZvY3VzID0gZmFsc2U7XG4gIGxldCBiR290Rm9jdXMgPSBmYWxzZTtcbiAgbGV0IGJHb3RCbHVyID0gZmFsc2U7XG4gIGxldCBiR290Rm9jdXNJbiA9IGZhbHNlO1xuICBsZXQgYkdvdEZvY3VzT3V0ID0gZmFsc2U7XG4gIGxldCBjR290Rm9jdXNJbiA9IGZhbHNlO1xuICBsZXQgY0dvdEZvY3VzT3V0ID0gZmFsc2U7XG5cbiAgY29uc3QgcmVzZXRGb2N1c1ZhcmlhYmxlcyA9ICgpID0+IHtcbiAgICBhR290Rm9jdXMgPSBmYWxzZTtcbiAgICBhTG9zdEZvY3VzID0gZmFsc2U7XG4gICAgYkdvdEZvY3VzID0gZmFsc2U7XG4gICAgYkdvdEJsdXIgPSBmYWxzZTtcbiAgICBiR290Rm9jdXNJbiA9IGZhbHNlO1xuICAgIGJHb3RGb2N1c091dCA9IGZhbHNlO1xuICAgIGNHb3RGb2N1c0luID0gZmFsc2U7XG4gICAgY0dvdEZvY3VzT3V0ID0gZmFsc2U7XG4gIH07XG5cbiAgYS5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgZm9jdXMoKSB7XG4gICAgICBhR290Rm9jdXMgPSB0cnVlO1xuICAgIH0sXG4gICAgYmx1cigpIHtcbiAgICAgIGFMb3N0Rm9jdXMgPSB0cnVlO1xuICAgIH1cbiAgfSApO1xuXG4gIGIuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgIGZvY3VzKCkge1xuICAgICAgYkdvdEZvY3VzID0gdHJ1ZTtcbiAgICB9LFxuICAgIGJsdXIoKSB7XG4gICAgICBiR290Qmx1ciA9IHRydWU7XG4gICAgfSxcbiAgICBmb2N1c2luKCkge1xuICAgICAgYkdvdEZvY3VzSW4gPSB0cnVlO1xuICAgIH0sXG4gICAgZm9jdXNvdXQoKSB7XG4gICAgICBiR290Rm9jdXNPdXQgPSB0cnVlO1xuICAgIH1cbiAgfSApO1xuXG4gIGMuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgIGZvY3VzaW4oKSB7XG4gICAgICBjR290Rm9jdXNJbiA9IHRydWU7XG4gICAgfSxcbiAgICBmb2N1c291dCgpIHtcbiAgICAgIGNHb3RGb2N1c091dCA9IHRydWU7XG4gICAgfVxuICB9ICk7XG5cbiAgYS5mb2N1cygpO1xuXG4gIGFzc2VydC5vayggYUdvdEZvY3VzLCAnYSBzaG91bGQgaGF2ZSBiZWVuIGZvY3VzZWQnICk7XG4gIGFzc2VydC5vayggIWFMb3N0Rm9jdXMsICdhIHNob3VsZCBub3QgYmx1cicgKTtcbiAgcmVzZXRGb2N1c1ZhcmlhYmxlcygpO1xuXG4gIGIuZm9jdXMoKTtcbiAgYXNzZXJ0Lm9rKCBiR290Rm9jdXMsICdiIHNob3VsZCBoYXZlIGJlZW4gZm9jdXNlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBhTG9zdEZvY3VzLCAnYSBzaG91bGQgaGF2ZSBsb3N0IGZvY3VzZWQnICk7XG4gIHJlc2V0Rm9jdXNWYXJpYWJsZXMoKTtcblxuICBjLmZvY3VzKCk7XG4gIGFzc2VydC5vayggIWJHb3RGb2N1cywgJ2Igc2hvdWxkIG5vdCByZWNlaXZlIGZvY3VzIChkb2VzbnQgYnViYmxlKScgKTtcbiAgYXNzZXJ0Lm9rKCBjR290Rm9jdXNJbiwgJ2Mgc2hvdWxkIHJlY2VpdmUgYSBmb2N1c2luJyApO1xuICBhc3NlcnQub2soIGJHb3RGb2N1c0luLCAnYiBzaG91bGQgcmVjZWl2ZSBhIGZvY3VzaW4gKGZyb20gYnViYmxpbmcpJyApO1xuICByZXNldEZvY3VzVmFyaWFibGVzKCk7XG5cbiAgYy5ibHVyKCk7XG4gIGFzc2VydC5vayggIWJHb3RCbHVyLCAnYiBzaG91bGQgbm90IHJlY2VpdmUgYSBibHVyIGV2ZW50IChkb2VzbnQgYnViYmxlKScgKTtcbiAgYXNzZXJ0Lm9rKCBjR290Rm9jdXNPdXQsICdjIHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgZm9jdXNvdXQnICk7XG4gIGFzc2VydC5vayggYkdvdEZvY3VzT3V0LCAnYyBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGZvY3Vzb3V0IChmcm9tIGJ1YmJsaW5nKScgKTtcblxuICBhZnRlclRlc3QoIGRpc3BsYXkgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3RhYiBmb2N1c2luL2ZvY3Vzb3V0JywgYXNzZXJ0ID0+IHtcbiAgaWYgKCAhY2FuUnVuVGVzdHMgKSB7XG4gICAgYXNzZXJ0Lm9rKCB0cnVlLCAnU2tpcHBpbmcgdGVzdCBiZWNhdXNlIGRvY3VtZW50IGRvZXMgbm90IGhhdmUgZm9jdXMnICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XG4gIGJlZm9yZVRlc3QoIGRpc3BsYXkgKTtcblxuICAvLyBpbm5lciBjb250ZW50IGZvciBpbXByb3ZlZCByZWFkYWJpbGl0eSBkdXJpbmcgZGVidWdnaW5nXG4gIGNvbnN0IGJ1dHRvbkEgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA1LCA1LCB7IHRhZ05hbWU6ICdidXR0b24nLCBpbm5lckNvbnRlbnQ6ICdCVVRUT04gQScgfSApO1xuICBjb25zdCBidXR0b25CID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgNSwgNSwgeyB0YWdOYW1lOiAnYnV0dG9uJywgaW5uZXJDb250ZW50OiAnQlVUVE9OIEInIH0gKTtcbiAgY29uc3QgYnV0dG9uQyA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDUsIDUsIHsgdGFnTmFtZTogJ2J1dHRvbicsIGlubmVyQ29udGVudDogJ0JVVFRPTiBDJyB9ICk7XG4gIHJvb3ROb2RlLmNoaWxkcmVuID0gWyBidXR0b25BLCBidXR0b25CLCBidXR0b25DIF07XG5cbiAgY29uc3QgYVByaW1hcnlTaWJsaW5nID0gYnV0dG9uQS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZztcbiAgY29uc3QgYlByaW1hcnlTaWJsaW5nID0gYnV0dG9uQi5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZztcblxuICAvLyB0ZXN0IHRoYXQgYSBibHVyIGxpc3RlbmVyIG9uIGEgbm9kZSBvdmVyaWRlcyB0aGUgXCJ0YWJcIiBsaWtlIG5hdmlnYXRpb24gbW92aW5nIGZvY3VzIHRvIHRoZSBuZXh0IGVsZW1lbnRcbiAgYnV0dG9uQS5mb2N1cygpO1xuICBhc3NlcnQub2soIGJ1dHRvbkEuZm9jdXNlZCwgJ2J1dG9uQSBoYXMgZm9jdXMgaW5pdGlhbGx5JyApO1xuXG4gIGNvbnN0IG92ZXJyaWRlRm9jdXNMaXN0ZW5lciA9IHtcbiAgICBibHVyOiBldmVudCA9PiB7XG4gICAgICBidXR0b25DLmZvY3VzKCk7XG4gICAgfVxuICB9O1xuICBidXR0b25BLmFkZElucHV0TGlzdGVuZXIoIG92ZXJyaWRlRm9jdXNMaXN0ZW5lciApO1xuXG4gIC8vIG1pbWljIGEgXCJ0YWJcIiBpbnRlcmFjdGlvbiwgYXR0ZW1wdGluZyB0byBtb3ZlIGZvY3VzIHRvIHRoZSBuZXh0IGVsZW1lbnRcbiAgdHJpZ2dlckRPTUV2ZW50KCAnZm9jdXNvdXQnLCBhUHJpbWFyeVNpYmxpbmcsIEtleWJvYXJkVXRpbHMuS0VZX1RBQiwge1xuICAgIHJlbGF0ZWRUYXJnZXQ6IGJQcmltYXJ5U2libGluZ1xuICB9ICk7XG5cbiAgLy8gdGhlIGJsdXIgbGlzdGVuZXIgb24gYnV0dG9uQSBzaG91bGQgb3ZlcnJpZGUgdGhlIG1vdmVtZW50IG9mIGZvY3VzIG9uIFwidGFiXCIgbGlrZSBpbnRlcmFjdGlvblxuICBhc3NlcnQub2soIGJ1dHRvbkMuZm9jdXNlZCwgJ2J1dG9uQyBub3cgaGFzIGZvY3VzJyApO1xuXG4gIC8vIHRlc3QgdGhhdCBhIGJsdXIgbGlzdGVuZXIgY2FuIHByZXZlbnQgZm9jdXMgZnJvbSBtb3ZpbmcgdG8gYW5vdGhlciBlbGVtZW50IGFmdGVyIFwidGFiXCIgbGlrZSBuYXZpZ2F0aW9uXG4gIGJ1dHRvbkEucmVtb3ZlSW5wdXRMaXN0ZW5lciggb3ZlcnJpZGVGb2N1c0xpc3RlbmVyICk7XG4gIGJ1dHRvbkEuZm9jdXMoKTtcbiAgY29uc3QgbWFrZVVuZm9jdXNhYmxlTGlzdGVuZXIgPSB7XG4gICAgYmx1cjogZXZlbnQgPT4ge1xuICAgICAgYnV0dG9uQi5mb2N1c2FibGUgPSBmYWxzZTtcbiAgICB9XG4gIH07XG4gIGJ1dHRvbkEuYWRkSW5wdXRMaXN0ZW5lciggbWFrZVVuZm9jdXNhYmxlTGlzdGVuZXIgKTtcblxuICAvLyBtaW1pYyBhIHRhYiBwcmVzcyBieSBtb3ZpbmcgZm9jdXMgdG8gYnV0dG9uQiAtIHRoaXMgd2lsbCBhdXRvbWF0aWNhbGx5IGhhdmUgdGhlIGNvcnJlY3QgYHJlbGF0ZWRUYXJnZXRgIGZvclxuICAvLyB0aGUgYGJsdXJgIGV2ZW50IG9uIGJ1dHRvbkEgYmVjYXVzZSBmb2N1cyBpcyBtb3ZpbmcgZnJvbSBidXR0b25BIHRvIGJ1dHRvbkIuXG4gIGJ1dHRvbkIuZm9jdXMoKTtcblxuICAvLyB0aGUgYmx1ciBsaXN0ZW5lciBvbiBidXR0b25BIHNob3VsZCBoYXZlIG1hZGUgdGhlIGRlZmF1bHQgZWxlbWVudCB1bmZvY3VzYWJsZVxuICBhc3NlcnQub2soICFidXR0b25CLmZvY3VzZWQsICdidXR0b25CIGNhbm5vdCByZWNlaXZlIGZvY3VzIGR1ZSB0byBibHVyIGxpc3RlbmVyIG9uIGJ1dHRvbkEnICk7XG4gIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gYlByaW1hcnlTaWJsaW5nLCAnZWxlbWVudCBidXR0b25CIGNhbm5vdCByZWNlaXZlIGZvY3VzIGR1ZSB0byBibHVyIGxpc3RlbmVyIG9uIGJ1dHRvbkEnICk7XG4gIGFzc2VydC5vayggIWJ1dHRvbkEuZm9jdXNlZCwgJ2J1dHRvbkEgY2Fubm90IGtlZXAgZm9jdXMgd2hlbiB0YWJiaW5nIGF3YXksIGV2ZW4gaWYgYnV0dG9uQiBpcyBub3QgZm9jdXNhYmxlJyApO1xuXG4gIC8vIGNsZWFudXAgZm9yIHRoZSBuZXh0IHRlc3RcbiAgYnV0dG9uQS5yZW1vdmVJbnB1dExpc3RlbmVyKCBtYWtlVW5mb2N1c2FibGVMaXN0ZW5lciApO1xuICBidXR0b25CLmZvY3VzYWJsZSA9IHRydWU7XG5cbiAgYnV0dG9uQS5mb2N1cygpO1xuICBjb25zdCBjYXVzZVJlZHJhd0xpc3RlbmVyID0ge1xuICAgIGJsdXI6IGV2ZW50ID0+IHtcbiAgICAgIGJ1dHRvbkIuZm9jdXNhYmxlID0gdHJ1ZTtcbiAgICAgIGJ1dHRvbkIudGFnTmFtZSA9ICdwJztcbiAgICB9XG4gIH07XG4gIGJ1dHRvbkEuYWRkSW5wdXRMaXN0ZW5lciggY2F1c2VSZWRyYXdMaXN0ZW5lciApO1xuXG4gIGJ1dHRvbkIuZm9jdXMoKTtcblxuICAvLyB0aGUgYmx1ciBsaXN0ZW5lciBvbiBidXR0b25BIHdpbGwgY2F1c2UgYSBmdWxsIHJlZHJhdyBvZiBidXR0b25CIGluIHRoZSBQRE9NLCBidXQgYnV0dG9uQiBzaG91bGQgcmVjZWl2ZSBmb2N1c1xuICBhc3NlcnQub2soIGJ1dHRvbkIuZm9jdXNlZCwgJ2J1dHRvbkIgc2hvdWxkIHN0aWxsIGhhdmUgZm9jdXMgYWZ0ZXIgYSBmdWxsIHJlZHJhdyBkdWUgdG8gYSBibHVyIGxpc3RlbmVyJyApO1xuXG4gIC8vIGNsZWFudXBcbiAgYnV0dG9uQS5yZW1vdmVJbnB1dExpc3RlbmVyKCBjYXVzZVJlZHJhd0xpc3RlbmVyICk7XG4gIGJ1dHRvbkEuZm9jdXNhYmxlID0gdHJ1ZTtcbiAgYnV0dG9uQi50YWdOYW1lID0gJ2J1dHRvbic7XG5cbiAgLy8gc2FuaXR5IGNoZWNrcyBtYW5pcHVsYXRpbmcgZm9jdXMsIGFuZCBhZGRlZCBiZWNhdXNlIHdlIHdlcmUgc2VlaW5nIHZlcnkgc3RyYW5nZSB0aGluZ3Mgd2hpbGUgd29ya2luZyBvblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTI5NiwgYnV0IHRoZXNlIHNob3VsZCBkZWZpbml0ZWx5IHBhc3NcbiAgYnV0dG9uQS5mb2N1cygpO1xuICBhc3NlcnQub2soIGJ1dHRvbkEuZm9jdXNlZCwgJ2J1dHRvbkEgZG9lcyBub3QgaGF2ZSBmb2N1cyBhZnRlciBhIGJhc2ljIGZvY3VzIGNhbGw/JyApO1xuICBidXR0b25CLmJsdXIoKTtcbiAgYXNzZXJ0Lm9rKCBidXR0b25BLmZvY3VzZWQsICdCbHVycmluZyBhIG5vbi1mb2N1c3NlZCBlbGVtZW50IHNob3VsZCBub3QgcmVtb3ZlIGZvY3VzIGZyb20gYSBub24tZm9jdXNlZCBlbGVtZW50JyApO1xuXG4gIGFmdGVyVGVzdCggZGlzcGxheSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnY2xpY2snLCBhc3NlcnQgPT4ge1xuICBpZiAoICFjYW5SdW5UZXN0cyApIHtcbiAgICBhc3NlcnQub2soIHRydWUsICdTa2lwcGluZyB0ZXN0IGJlY2F1c2UgZG9jdW1lbnQgZG9lcyBub3QgaGF2ZSBmb2N1cycgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBiZWZvcmVUZXN0KCBkaXNwbGF5ICk7XG5cbiAgY29uc3QgYSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDIwLCAyMCwgeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XG5cbiAgbGV0IGdvdEZvY3VzID0gZmFsc2U7XG4gIGxldCBnb3RDbGljayA9IGZhbHNlO1xuICBsZXQgYUNsaWNrQ291bnRlciA9IDA7XG5cbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcblxuICBhLmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICBmb2N1cygpIHtcbiAgICAgIGdvdEZvY3VzID0gdHJ1ZTtcbiAgICB9LFxuICAgIGNsaWNrKCkge1xuICAgICAgZ290Q2xpY2sgPSB0cnVlO1xuICAgICAgYUNsaWNrQ291bnRlcisrO1xuICAgIH0sXG4gICAgYmx1cigpIHtcbiAgICAgIGdvdEZvY3VzID0gZmFsc2U7XG4gICAgfVxuICB9ICk7XG5cblxuICBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmZvY3VzKCk7XG4gIGFzc2VydC5vayggZ290Rm9jdXMgJiYgIWdvdENsaWNrLCAnZm9jdXMgZmlyc3QnICk7XG4gIGEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTsgLy8gdGhpcyB3b3JrcyBiZWNhdXNlIGl0J3MgYSBidXR0b25cbiAgYXNzZXJ0Lm9rKCBnb3RDbGljayAmJiBnb3RGb2N1cyAmJiBhQ2xpY2tDb3VudGVyID09PSAxLCAnYSBzaG91bGQgaGF2ZSBiZWVuIGNsaWNrZWQnICk7XG5cbiAgbGV0IGJDbGlja0NvdW50ZXIgPSAwO1xuXG4gIGNvbnN0IGIgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuXG4gIGIuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgIGNsaWNrKCkge1xuICAgICAgYkNsaWNrQ291bnRlcisrO1xuICAgIH1cbiAgfSApO1xuXG4gIGEuYWRkQ2hpbGQoIGIgKTtcblxuICBiLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmZvY3VzKCk7XG4gIGIucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcbiAgYXNzZXJ0Lm9rKCBiQ2xpY2tDb3VudGVyID09PSAxICYmIGFDbGlja0NvdW50ZXIgPT09IDIsICdhIHNob3VsZCBoYXZlIGJlZW4gY2xpY2tlZCB3aXRoIGInICk7XG4gIGEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcbiAgYXNzZXJ0Lm9rKCBiQ2xpY2tDb3VudGVyID09PSAxICYmIGFDbGlja0NvdW50ZXIgPT09IDMsICdiIHN0aWxsIHNob3VsZCBub3QgaGF2ZSBiZWVuIGNsaWNrZWQuJyApO1xuXG5cbiAgLy8gY3JlYXRlIGEgbm9kZVxuICBjb25zdCBhMSA9IG5ldyBOb2RlKCB7XG4gICAgdGFnTmFtZTogJ2J1dHRvbidcbiAgfSApO1xuICBhLmFkZENoaWxkKCBhMSApO1xuICBhc3NlcnQub2soIGExLmlucHV0TGlzdGVuZXJzLmxlbmd0aCA9PT0gMCwgJ25vIGlucHV0IGFjY2Vzc2libGUgbGlzdGVuZXJzIG9uIGluc3RhbnRpYXRpb24nICk7XG4gIGFzc2VydC5vayggYTEubGFiZWxDb250ZW50ID09PSBudWxsLCAnbm8gbGFiZWwgb24gaW5zdGFudGlhdGlvbicgKTtcblxuICAvLyBhZGQgYSBsaXN0ZW5lclxuICBjb25zdCBsaXN0ZW5lciA9IHsgY2xpY2soKSB7IGExLmxhYmVsQ29udGVudCA9IFRFU1RfTEFCRUw7IH0gfTtcbiAgYTEuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKTtcbiAgYXNzZXJ0Lm9rKCBhMS5pbnB1dExpc3RlbmVycy5sZW5ndGggPT09IDEsICdhY2Nlc3NpYmxlIGxpc3RlbmVyIGFkZGVkJyApO1xuXG4gIC8vIHZlcmlmeSBhZGRlZCB3aXRoIGhhc0lucHV0TGlzdGVuZXJcbiAgYXNzZXJ0Lm9rKCBhMS5oYXNJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApID09PSB0cnVlLCAnZm91bmQgd2l0aCBoYXNJbnB1dExpc3RlbmVyJyApO1xuXG4gIC8vIGZpcmUgdGhlIGV2ZW50XG4gIGExLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmNsaWNrKCk7XG4gIGFzc2VydC5vayggYTEubGFiZWxDb250ZW50ID09PSBURVNUX0xBQkVMLCAnY2xpY2sgZmlyZWQsIGxhYmVsIHNldCcgKTtcblxuICBjb25zdCBjID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMjAsIDIwLCB7IHRhZ05hbWU6ICdidXR0b24nIH0gKTtcbiAgY29uc3QgZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDIwLCAyMCwgeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XG4gIGNvbnN0IGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuXG4gIGxldCBjQ2xpY2tDb3VudCA9IDA7XG4gIGxldCBkQ2xpY2tDb3VudCA9IDA7XG4gIGxldCBlQ2xpY2tDb3VudCA9IDA7XG5cbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGMgKTtcbiAgYy5hZGRDaGlsZCggZCApO1xuICBkLmFkZENoaWxkKCBlICk7XG5cbiAgYy5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgY2xpY2soKSB7XG4gICAgICBjQ2xpY2tDb3VudCsrO1xuICAgIH1cbiAgfSApO1xuICBkLmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICBjbGljaygpIHtcbiAgICAgIGRDbGlja0NvdW50Kys7XG4gICAgfVxuICB9ICk7XG4gIGUuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgIGNsaWNrKCkge1xuICAgICAgZUNsaWNrQ291bnQrKztcbiAgICB9XG4gIH0gKTtcblxuICBlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmNsaWNrKCk7XG5cbiAgYXNzZXJ0Lm9rKCBjQ2xpY2tDb3VudCA9PT0gZENsaWNrQ291bnQgJiYgY0NsaWNrQ291bnQgPT09IGVDbGlja0NvdW50ICYmIGNDbGlja0NvdW50ID09PSAxLFxuICAgICdjbGljayBzaG91bGQgaGF2ZSBidWJibGVkIHRvIGFsbCBwYXJlbnRzJyApO1xuXG4gIGQucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcblxuXG4gIGFzc2VydC5vayggY0NsaWNrQ291bnQgPT09IDIgJiYgZENsaWNrQ291bnQgPT09IDIgJiYgZUNsaWNrQ291bnQgPT09IDEsXG4gICAgJ2Qgc2hvdWxkIG5vdCB0cmlnZ2VyIGNsaWNrIG9uIGUnICk7XG4gIGMucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcblxuXG4gIGFzc2VydC5vayggY0NsaWNrQ291bnQgPT09IDMgJiYgZENsaWNrQ291bnQgPT09IDIgJiYgZUNsaWNrQ291bnQgPT09IDEsXG4gICAgJ2Mgc2hvdWxkIG5vdCB0cmlnZ2VyIGNsaWNrIG9uIGQgb3IgZScgKTtcblxuICAvLyByZXNldCBjbGljayBjb3VudFxuICBjQ2xpY2tDb3VudCA9IDA7XG4gIGRDbGlja0NvdW50ID0gMDtcbiAgZUNsaWNrQ291bnQgPSAwO1xuXG4gIGMucGRvbU9yZGVyID0gWyBkLCBlIF07XG5cbiAgZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5jbGljaygpO1xuICBhc3NlcnQub2soIGNDbGlja0NvdW50ID09PSAxICYmIGRDbGlja0NvdW50ID09PSAwICYmIGVDbGlja0NvdW50ID09PSAxLFxuICAgICdwZG9tT3JkZXIgbWVhbnMgY2xpY2sgc2hvdWxkIGJ5cGFzcyBkJyApO1xuXG4gIGMucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcbiAgYXNzZXJ0Lm9rKCBjQ2xpY2tDb3VudCA9PT0gMiAmJiBkQ2xpY2tDb3VudCA9PT0gMCAmJiBlQ2xpY2tDb3VudCA9PT0gMSxcbiAgICAnY2xpY2sgYyBzaG91bGQgbm90IGVmZmVjdCBlIG9yIGQuJyApO1xuXG4gIGQucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcbiAgYXNzZXJ0Lm9rKCBjQ2xpY2tDb3VudCA9PT0gMyAmJiBkQ2xpY2tDb3VudCA9PT0gMSAmJiBlQ2xpY2tDb3VudCA9PT0gMSxcbiAgICAnY2xpY2sgZCBzaG91bGQgbm90IGVmZmVjdCBlLicgKTtcblxuICAvLyByZXNldCBjbGljayBjb3VudFxuICBjQ2xpY2tDb3VudCA9IDA7XG4gIGRDbGlja0NvdW50ID0gMDtcbiAgZUNsaWNrQ291bnQgPSAwO1xuXG4gIGNvbnN0IGYgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuXG4gIGxldCBmQ2xpY2tDb3VudCA9IDA7XG4gIGYuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgIGNsaWNrKCkge1xuICAgICAgZkNsaWNrQ291bnQrKztcbiAgICB9XG4gIH0gKTtcbiAgZS5hZGRDaGlsZCggZiApO1xuXG4gIC8vIHNvIGl0cyBhIGNoYWluIGluIHRoZSBzY2VuZSBncmFwaCBjLT5kLT5lLT5mXG5cbiAgZC5wZG9tT3JkZXIgPSBbIGYgXTtcblxuICAvKiBhY2Nlc3NpYmxlIGluc3RhbmNlIHRyZWU6XG4gICAgICAgY1xuICAgICAgLyBcXFxuICAgICAgZCAgZVxuICAgICAgfFxuICAgICAgZlxuICAqL1xuXG4gIGYucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcbiAgYXNzZXJ0Lm9rKCBjQ2xpY2tDb3VudCA9PT0gMSAmJiBkQ2xpY2tDb3VudCA9PT0gMSAmJiBlQ2xpY2tDb3VudCA9PT0gMCAmJiBmQ2xpY2tDb3VudCA9PT0gMSxcbiAgICAnY2xpY2sgZCBzaG91bGQgbm90IGVmZmVjdCBlLicgKTtcblxuICBhZnRlclRlc3QoIGRpc3BsYXkgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ2NsaWNrIGV4dHJhJywgYXNzZXJ0ID0+IHtcblxuICAvLyBjcmVhdGUgYSBub2RlXG4gIGNvbnN0IGExID0gbmV3IE5vZGUoIHtcbiAgICB0YWdOYW1lOiAnYnV0dG9uJ1xuICB9ICk7XG4gIGNvbnN0IHJvb3QgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdCApO1xuICBiZWZvcmVUZXN0KCBkaXNwbGF5ICk7XG5cbiAgcm9vdC5hZGRDaGlsZCggYTEgKTtcbiAgYXNzZXJ0Lm9rKCBhMS5pbnB1dExpc3RlbmVycy5sZW5ndGggPT09IDAsICdubyBpbnB1dCBhY2Nlc3NpYmxlIGxpc3RlbmVycyBvbiBpbnN0YW50aWF0aW9uJyApO1xuICBhc3NlcnQub2soIGExLmxhYmVsQ29udGVudCA9PT0gbnVsbCwgJ25vIGxhYmVsIG9uIGluc3RhbnRpYXRpb24nICk7XG5cbiAgLy8gYWRkIGEgbGlzdGVuZXJcbiAgY29uc3QgbGlzdGVuZXIgPSB7IGNsaWNrOiAoKSA9PiB7IGExLmxhYmVsQ29udGVudCA9IFRFU1RfTEFCRUw7IH0gfTtcbiAgYTEuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKTtcbiAgYXNzZXJ0Lm9rKCBhMS5pbnB1dExpc3RlbmVycy5sZW5ndGggPT09IDEsICdhY2Nlc3NpYmxlIGxpc3RlbmVyIGFkZGVkJyApO1xuXG4gIC8vIHZlcmlmeSBhZGRlZCB3aXRoIGhhc0lucHV0TGlzdGVuZXJcbiAgYXNzZXJ0Lm9rKCBhMS5oYXNJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApID09PSB0cnVlLCAnZm91bmQgd2l0aCBoYXNJbnB1dExpc3RlbmVyJyApO1xuXG4gIC8vIGZpcmUgdGhlIGV2ZW50XG4gIGExLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmNsaWNrKCk7XG4gIGFzc2VydC5vayggYTEubGFiZWxDb250ZW50ID09PSBURVNUX0xBQkVMLCAnY2xpY2sgZmlyZWQsIGxhYmVsIHNldCcgKTtcblxuICAvLyByZW1vdmUgdGhlIGxpc3RlbmVyXG4gIGExLnJlbW92ZUlucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XG4gIGFzc2VydC5vayggYTEuaW5wdXRMaXN0ZW5lcnMubGVuZ3RoID09PSAwLCAnYWNjZXNzaWJsZSBsaXN0ZW5lciByZW1vdmVkJyApO1xuXG4gIC8vIHZlcmlmeSByZW1vdmVkIHdpdGggaGFzSW5wdXRMaXN0ZW5lclxuICBhc3NlcnQub2soIGExLmhhc0lucHV0TGlzdGVuZXIoIGxpc3RlbmVyICkgPT09IGZhbHNlLCAnbm90IGZvdW5kIHdpdGggaGFzSW5wdXRMaXN0ZW5lcicgKTtcblxuICAvLyBtYWtlIHN1cmUgZXZlbnQgbGlzdGVuZXIgd2FzIGFsc28gcmVtb3ZlZCBmcm9tIERPTSBlbGVtZW50XG4gIC8vIGNsaWNrIHNob3VsZCBub3QgY2hhbmdlIHRoZSBsYWJlbFxuICBhMS5sYWJlbENvbnRlbnQgPSBURVNUX0xBQkVMXzI7XG4gIGFzc2VydC5vayggYTEubGFiZWxDb250ZW50ID09PSBURVNUX0xBQkVMXzIsICdiZWZvcmUgY2xpY2snICk7XG5cbiAgLy8gc2V0dGluZyB0aGUgbGFiZWwgcmVkcmV3IHRoZSBwZG9tLCBzbyBnZXQgYSByZWZlcmVuY2UgdG8gdGhlIG5ldyBkb20gZWxlbWVudC5cbiAgYTEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcbiAgYXNzZXJ0Lm9rKCBhMS5sYWJlbENvbnRlbnQgPT09IFRFU1RfTEFCRUxfMiwgJ2NsaWNrIHNob3VsZCBub3QgY2hhbmdlIGxhYmVsJyApO1xuXG4gIC8vIHZlcmlmeSBkaXNwb3NhbCByZW1vdmVzIGFjY2Vzc2libGUgaW5wdXQgbGlzdGVuZXJzXG4gIGExLmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XG4gIGExLmRpc3Bvc2UoKTtcblxuICAvLyBUT0RPOiBTaW5jZSBjb252ZXJ0aW5nIHRvIHVzZSBOb2RlLmlucHV0TGlzdGVuZXJzLCB3ZSBjYW4ndCBhc3N1bWUgdGhpcyBhbnltb3JlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gIC8vIGFzc2VydC5vayggYTEuaGFzSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKSA9PT0gZmFsc2UsICdkaXNwb3NhbCByZW1vdmVkIGFjY2Vzc2libGUgaW5wdXQgbGlzdGVuZXJzJyApO1xuXG4gIGFmdGVyVGVzdCggZGlzcGxheSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnaW5wdXQnLCBhc3NlcnQgPT4ge1xuICBpZiAoICFjYW5SdW5UZXN0cyApIHtcbiAgICBhc3NlcnQub2soIHRydWUsICdTa2lwcGluZyB0ZXN0IGJlY2F1c2UgZG9jdW1lbnQgZG9lcyBub3QgaGF2ZSBmb2N1cycgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBiZWZvcmVUZXN0KCBkaXNwbGF5ICk7XG5cbiAgY29uc3QgYSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDIwLCAyMCwgeyB0YWdOYW1lOiAnaW5wdXQnLCBpbnB1dFR5cGU6ICd0ZXh0JyB9ICk7XG5cbiAgbGV0IGdvdEZvY3VzID0gZmFsc2U7XG4gIGxldCBnb3RJbnB1dCA9IGZhbHNlO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG5cbiAgYS5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgZm9jdXMoKSB7XG4gICAgICBnb3RGb2N1cyA9IHRydWU7XG4gICAgfSxcbiAgICBpbnB1dCgpIHtcbiAgICAgIGdvdElucHV0ID0gdHJ1ZTtcbiAgICB9LFxuICAgIGJsdXIoKSB7XG4gICAgICBnb3RGb2N1cyA9IGZhbHNlO1xuICAgIH1cbiAgfSApO1xuXG4gIGEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuZm9jdXMoKTtcbiAgYXNzZXJ0Lm9rKCBnb3RGb2N1cyAmJiAhZ290SW5wdXQsICdmb2N1cyBmaXJzdCcgKTtcblxuICBkaXNwYXRjaEV2ZW50KCBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLCAnaW5wdXQnICk7XG5cbiAgYXNzZXJ0Lm9rKCBnb3RJbnB1dCAmJiBnb3RGb2N1cywgJ2Egc2hvdWxkIGhhdmUgYmVlbiBhbiBpbnB1dCcgKTtcblxuICBhZnRlclRlc3QoIGRpc3BsYXkgKTtcbn0gKTtcblxuXG5RVW5pdC50ZXN0KCAnY2hhbmdlJywgYXNzZXJ0ID0+IHtcbiAgaWYgKCAhY2FuUnVuVGVzdHMgKSB7XG4gICAgYXNzZXJ0Lm9rKCB0cnVlLCAnU2tpcHBpbmcgdGVzdCBiZWNhdXNlIGRvY3VtZW50IGRvZXMgbm90IGhhdmUgZm9jdXMnICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcbiAgYmVmb3JlVGVzdCggZGlzcGxheSApO1xuXG4gIGNvbnN0IGEgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2lucHV0JywgaW5wdXRUeXBlOiAncmFuZ2UnIH0gKTtcblxuICBsZXQgZ290Rm9jdXMgPSBmYWxzZTtcbiAgbGV0IGdvdENoYW5nZSA9IGZhbHNlO1xuXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG5cbiAgYS5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgZm9jdXMoKSB7XG4gICAgICBnb3RGb2N1cyA9IHRydWU7XG4gICAgfSxcbiAgICBjaGFuZ2UoKSB7XG4gICAgICBnb3RDaGFuZ2UgPSB0cnVlO1xuICAgIH0sXG4gICAgYmx1cigpIHtcbiAgICAgIGdvdEZvY3VzID0gZmFsc2U7XG4gICAgfVxuICB9ICk7XG5cbiAgYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5mb2N1cygpO1xuICBhc3NlcnQub2soIGdvdEZvY3VzICYmICFnb3RDaGFuZ2UsICdmb2N1cyBmaXJzdCcgKTtcblxuICBkaXNwYXRjaEV2ZW50KCBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLCAnY2hhbmdlJyApO1xuXG4gIGFzc2VydC5vayggZ290Q2hhbmdlICYmIGdvdEZvY3VzLCAnYSBzaG91bGQgaGF2ZSBiZWVuIGFuIGlucHV0JyApO1xuXG4gIGFmdGVyVGVzdCggZGlzcGxheSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAna2V5ZG93bi9rZXl1cCcsIGFzc2VydCA9PiB7XG4gIGlmICggIWNhblJ1blRlc3RzICkge1xuICAgIGFzc2VydC5vayggdHJ1ZSwgJ1NraXBwaW5nIHRlc3QgYmVjYXVzZSBkb2N1bWVudCBkb2VzIG5vdCBoYXZlIGZvY3VzJyApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XG4gIGJlZm9yZVRlc3QoIGRpc3BsYXkgKTtcblxuICBjb25zdCBhID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMjAsIDIwLCB7IHRhZ05hbWU6ICdpbnB1dCcsIGlucHV0VHlwZTogJ3RleHQnIH0gKTtcblxuICBsZXQgZ290Rm9jdXMgPSBmYWxzZTtcbiAgbGV0IGdvdEtleWRvd24gPSBmYWxzZTtcbiAgbGV0IGdvdEtleXVwID0gZmFsc2U7XG5cbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcblxuICBhLmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICBmb2N1cygpIHtcbiAgICAgIGdvdEZvY3VzID0gdHJ1ZTtcbiAgICB9LFxuICAgIGtleWRvd24oKSB7XG4gICAgICBnb3RLZXlkb3duID0gdHJ1ZTtcbiAgICB9LFxuICAgIGtleXVwKCkge1xuICAgICAgZ290S2V5dXAgPSB0cnVlO1xuICAgIH0sXG4gICAgYmx1cigpIHtcbiAgICAgIGdvdEZvY3VzID0gZmFsc2U7XG4gICAgfVxuICB9ICk7XG5cbiAgYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5mb2N1cygpO1xuICBhc3NlcnQub2soIGdvdEZvY3VzICYmICFnb3RLZXlkb3duLCAnZm9jdXMgZmlyc3QnICk7XG5cbiAgZGlzcGF0Y2hFdmVudCggYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZywgJ2tleWRvd24nICk7XG5cbiAgYXNzZXJ0Lm9rKCBnb3RLZXlkb3duICYmIGdvdEZvY3VzLCAnYSBzaG91bGQgaGF2ZSBoYWQga2V5ZG93bicgKTtcblxuICBkaXNwYXRjaEV2ZW50KCBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLCAna2V5dXAnICk7XG4gIGFzc2VydC5vayggZ290S2V5ZG93biAmJiBnb3RLZXl1cCAmJiBnb3RGb2N1cywgJ2Egc2hvdWxkIGhhdmUgaGFkIGtleXVwJyApO1xuXG4gIGFmdGVyVGVzdCggZGlzcGxheSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnR2xvYmFsIEtleVN0YXRlVHJhY2tlciB0ZXN0cycsIGFzc2VydCA9PiB7XG5cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcbiAgYmVmb3JlVGVzdCggZGlzcGxheSApO1xuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XG4gIGNvbnN0IGMgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XG4gIGNvbnN0IGQgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XG5cbiAgYS5hZGRDaGlsZCggYiApO1xuICBiLmFkZENoaWxkKCBjICk7XG4gIGMuYWRkQ2hpbGQoIGQgKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcblxuICBjb25zdCBkUHJpbWFyeVNpYmxpbmcgPSBkLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nO1xuICB0cmlnZ2VyRE9NRXZlbnQoICdrZXlkb3duJywgZFByaW1hcnlTaWJsaW5nLCBLZXlib2FyZFV0aWxzLktFWV9SSUdIVF9BUlJPVywge1xuICAgIGV2ZW50Q29uc3RydWN0b3I6IHdpbmRvdy5LZXlib2FyZEV2ZW50XG4gIH0gKTtcblxuICBhc3NlcnQub2soIGdsb2JhbEtleVN0YXRlVHJhY2tlci5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX1JJR0hUX0FSUk9XICksICdnbG9iYWwga2V5U3RhdGVUcmFja2VyIHNob3VsZCBiZSB1cGRhdGVkIHdpdGggcmlnaHQgYXJyb3cga2V5IGRvd24nICk7XG5cbiAgYWZ0ZXJUZXN0KCBkaXNwbGF5ICk7XG59ICk7Il0sIm5hbWVzIjpbIm1lcmdlIiwiRGlzcGxheSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJnbG9iYWxLZXlTdGF0ZVRyYWNrZXIiLCJLZXlib2FyZFV0aWxzIiwiVEVTVF9MQUJFTCIsIlRFU1RfTEFCRUxfMiIsImNhblJ1blRlc3RzIiwiUVVuaXQiLCJtb2R1bGUiLCJiZWZvcmVFYWNoIiwiZG9jdW1lbnQiLCJoYXNGb2N1cyIsImNvbnNvbGUiLCJ3YXJuIiwiYmVmb3JlVGVzdCIsImRpc3BsYXkiLCJpbml0aWFsaXplRXZlbnRzIiwiYm9keSIsImFwcGVuZENoaWxkIiwiZG9tRWxlbWVudCIsImFmdGVyVGVzdCIsInJlbW92ZUNoaWxkIiwiZGlzcG9zZSIsImRpc3BhdGNoRXZlbnQiLCJldmVudCIsIkNvbnN0cnVjdG9yIiwic3RhcnRzV2l0aCIsIndpbmRvdyIsIktleWJvYXJkRXZlbnQiLCJFdmVudCIsImJ1YmJsZXMiLCJjb2RlIiwiS0VZX1RBQiIsInRyaWdnZXJET01FdmVudCIsImVsZW1lbnQiLCJrZXkiLCJvcHRpb25zIiwicmVsYXRlZFRhcmdldCIsImNhbmNlbGFibGUiLCJldmVudENvbnN0cnVjdG9yIiwiZXZlbnRUb0Rpc3BhdGNoIiwiZmlyZUV2ZW50IiwidGVzdCIsImFzc2VydCIsIm9rIiwicm9vdE5vZGUiLCJ0YWdOYW1lIiwiYSIsImIiLCJjIiwiYWRkQ2hpbGQiLCJhR290Rm9jdXMiLCJhTG9zdEZvY3VzIiwiYkdvdEZvY3VzIiwiYkdvdEJsdXIiLCJiR290Rm9jdXNJbiIsImJHb3RGb2N1c091dCIsImNHb3RGb2N1c0luIiwiY0dvdEZvY3VzT3V0IiwicmVzZXRGb2N1c1ZhcmlhYmxlcyIsImFkZElucHV0TGlzdGVuZXIiLCJmb2N1cyIsImJsdXIiLCJmb2N1c2luIiwiZm9jdXNvdXQiLCJidXR0b25BIiwiaW5uZXJDb250ZW50IiwiYnV0dG9uQiIsImJ1dHRvbkMiLCJjaGlsZHJlbiIsImFQcmltYXJ5U2libGluZyIsInBkb21JbnN0YW5jZXMiLCJwZWVyIiwicHJpbWFyeVNpYmxpbmciLCJiUHJpbWFyeVNpYmxpbmciLCJmb2N1c2VkIiwib3ZlcnJpZGVGb2N1c0xpc3RlbmVyIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsIm1ha2VVbmZvY3VzYWJsZUxpc3RlbmVyIiwiZm9jdXNhYmxlIiwiYWN0aXZlRWxlbWVudCIsImNhdXNlUmVkcmF3TGlzdGVuZXIiLCJnb3RGb2N1cyIsImdvdENsaWNrIiwiYUNsaWNrQ291bnRlciIsImNsaWNrIiwiYkNsaWNrQ291bnRlciIsImExIiwiaW5wdXRMaXN0ZW5lcnMiLCJsZW5ndGgiLCJsYWJlbENvbnRlbnQiLCJsaXN0ZW5lciIsImhhc0lucHV0TGlzdGVuZXIiLCJkIiwiZSIsImNDbGlja0NvdW50IiwiZENsaWNrQ291bnQiLCJlQ2xpY2tDb3VudCIsInBkb21PcmRlciIsImYiLCJmQ2xpY2tDb3VudCIsInJvb3QiLCJpbnB1dFR5cGUiLCJnb3RJbnB1dCIsImlucHV0IiwiZ290Q2hhbmdlIiwiY2hhbmdlIiwiZ290S2V5ZG93biIsImdvdEtleXVwIiwia2V5ZG93biIsImtleXVwIiwiZFByaW1hcnlTaWJsaW5nIiwiS0VZX1JJR0hUX0FSUk9XIiwiaXNLZXlEb3duIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxXQUFXLG9DQUFvQztBQUN0RCxPQUFPQyxhQUFhLDJCQUEyQjtBQUMvQyxPQUFPQyxVQUFVLHNCQUFzQjtBQUN2QyxPQUFPQyxlQUFlLDJCQUEyQjtBQUNqRCxPQUFPQywyQkFBMkIsOEJBQThCO0FBQ2hFLE9BQU9DLG1CQUFtQixzQkFBc0I7QUFFaEQsWUFBWTtBQUNaLE1BQU1DLGFBQWE7QUFDbkIsTUFBTUMs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