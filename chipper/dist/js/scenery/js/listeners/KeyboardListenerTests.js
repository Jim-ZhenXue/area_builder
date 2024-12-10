// Copyright 2022-2024, University of Colorado Boulder
/**
 * KeyboardListener tests.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */ import { Display, globalKeyStateTracker, KeyboardListener, KeyboardUtils, Node } from '../imports.js';
QUnit.module('KeyboardListener', {
    before () {
        // clear in case other tests didn't finish with a keyup event
        globalKeyStateTracker.clearState();
    }
});
const triggerKeydownEvent = (target, code, ctrlKey = false)=>{
    target.dispatchEvent(new KeyboardEvent('keydown', {
        code: code,
        bubbles: true,
        ctrlKey: ctrlKey
    }));
};
const triggerKeyupEvent = (target, code, ctrlKey = false)=>{
    target.dispatchEvent(new KeyboardEvent('keyup', {
        code: code,
        bubbles: true,
        ctrlKey: ctrlKey
    }));
};
QUnit.test('KeyboardListener Tests', (assert)=>{
    const rootNode = new Node({
        tagName: 'div'
    });
    const display = new Display(rootNode);
    display.initializeEvents();
    document.body.appendChild(display.domElement);
    //////////////////////////////////////////////////
    let callbackFired = false;
    const listener = new KeyboardListener({
        keys: [
            'enter'
        ],
        fire: ()=>{
            assert.ok(!callbackFired, 'callback cannot be fired');
            callbackFired = true;
        }
    });
    // Test putting a key in keys that is not supported (error only thrown with assertions enabled)
    window.assert && assert.throws(()=>{
        const bogusListener = new KeyboardListener({
            // @ts-expect-error - Typescript should catch bad keys too
            keys: [
                'badKey'
            ],
            fire: ()=>{
            // just testing the typing, no work to do here
            }
        });
        bogusListener.dispose();
    }, Error, 'Constructor should catch providing bad keys at runtime');
    const a = new Node({
        tagName: 'div',
        focusable: true
    });
    rootNode.addChild(a);
    a.addInputListener(listener);
    const domElementA = a.pdomInstances[0].peer.primarySibling;
    assert.ok(domElementA, 'pdom element needed');
    // Hotkey uses the focused Trail to determine if it should fire, so we need to focus the element
    a.focus();
    triggerKeydownEvent(domElementA, KeyboardUtils.KEY_TAB);
    assert.ok(!callbackFired, 'should not fire on tab');
    triggerKeyupEvent(domElementA, KeyboardUtils.KEY_TAB);
    triggerKeydownEvent(domElementA, KeyboardUtils.KEY_ENTER);
    assert.ok(callbackFired, 'should fire on enter');
    triggerKeyupEvent(domElementA, KeyboardUtils.KEY_ENTER);
    //////////////////////////////////////////////////////
    // Test an overlap of keys in two keygroups. The callback should fire for only the keygroup where every key
    // is down and only every key is down.
    a.removeInputListener(listener);
    let pFired = false;
    let ctrlPFired = false;
    const listenerWithOverlappingKeys = new KeyboardListener({
        keys: [
            'p',
            'ctrl+p'
        ],
        fire: (event, keysPressed)=>{
            if (keysPressed === 'p') {
                pFired = true;
            } else if (keysPressed === 'ctrl+p') {
                ctrlPFired = true;
            } else {
                assert.ok(false, 'never again');
            }
        }
    });
    a.addInputListener(listenerWithOverlappingKeys);
    triggerKeydownEvent(domElementA, KeyboardUtils.KEY_P, true);
    assert.ok(!pFired, 'p should not fire because control key is down');
    assert.ok(ctrlPFired, 'ctrl P should have fired');
    //////////////////////////////////////////////////////
    // test interrupt/cancel
    // TODO: This test fails but that is working as expected. interrupt/cancel are only relevant for the https://github.com/phetsims/scenery/issues/1581
    // listener for press and hold functionality. Interrupt/cancel cannot clear the keystate because the listener
    // does not own its KeyStateTracker, it is using the global one.
    // let pbFiredFromA = false;
    // let pbjFiredFromA = false;
    // const listenerToInterrupt = new KeyboardListener( {
    //   keys: [ 'p+b', 'p+b+j' ],
    // callback: ( event, listener ) => {
    //   const keysPressed = listener.keysPressed;
    //     if ( keysPressed === 'p+b' ) {
    //       pbFiredFromA = true;
    //       listenerToInterrupt.interrupt();
    //     }
    //     else if ( keysPressed === 'p+b+j' ) {
    //       pbjFiredFromA = true;
    //     }
    //   }
    // } );
    // a.addInputListener( listenerToInterrupt );
    //
    // domElementB.dispatchEvent( new KeyboardEvent( 'keydown', {
    //   code: KeyboardUtils.KEY_P,
    //   bubbles: true
    // } ) );
    // domElementB.dispatchEvent( new KeyboardEvent( 'keydown', {
    //   code: KeyboardUtils.KEY_B,
    //   bubbles: true
    // } ) );
    // domElementB.dispatchEvent( new KeyboardEvent( 'keydown', {
    //   code: KeyboardUtils.KEY_J,
    //   bubbles: true
    // } ) );
    //
    // assert.ok( pbFiredFromA, 'p+b receives the event and interrupts the listener' );
    // assert.ok( !pbjFiredFromA, 'interruption clears the keystate so p+b+j does not fire' );
    //////////////////////////////////////////////////////
    document.body.removeChild(display.domElement);
    display.dispose();
}); //
 // QUnit.test( 'KeyboardListener Callback timing', assert => {
 //   const rootNode = new Node( { tagName: 'div' } );
 //   const display = new Display( rootNode );
 //   display.initializeEvents();
 //   document.body.appendChild( display.domElement );
 //
 //
 //   //
 //   // a -> callback timer
 //   //
 //   // wait
 //   // b -> callback timer
 //   //
 //   // release before b
 //   //
 //   // ensure a fires
 //
 //
 //   document.body.removeChild( display.domElement );
 //   display.dispose();
 // });

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL0tleWJvYXJkTGlzdGVuZXJUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBLZXlib2FyZExpc3RlbmVyIHRlc3RzLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBBZ3VzdMOtbiBWYWxsZWpvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCB7IERpc3BsYXksIGdsb2JhbEtleVN0YXRlVHJhY2tlciwgS2V5Ym9hcmRMaXN0ZW5lciwgS2V5Ym9hcmRVdGlscywgTm9kZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdLZXlib2FyZExpc3RlbmVyJywge1xuICBiZWZvcmUoKSB7XG5cbiAgICAvLyBjbGVhciBpbiBjYXNlIG90aGVyIHRlc3RzIGRpZG4ndCBmaW5pc2ggd2l0aCBhIGtleXVwIGV2ZW50XG4gICAgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLmNsZWFyU3RhdGUoKTtcbiAgfVxufSApO1xuXG5jb25zdCB0cmlnZ2VyS2V5ZG93bkV2ZW50ID0gKCB0YXJnZXQ6IEhUTUxFbGVtZW50LCBjb2RlOiBzdHJpbmcsIGN0cmxLZXkgPSBmYWxzZSApID0+IHtcbiAgdGFyZ2V0LmRpc3BhdGNoRXZlbnQoIG5ldyBLZXlib2FyZEV2ZW50KCAna2V5ZG93bicsIHtcbiAgICBjb2RlOiBjb2RlLFxuICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgY3RybEtleTogY3RybEtleVxuICB9ICkgKTtcbn07XG5cbmNvbnN0IHRyaWdnZXJLZXl1cEV2ZW50ID0gKCB0YXJnZXQ6IEhUTUxFbGVtZW50LCBjb2RlOiBzdHJpbmcsIGN0cmxLZXkgPSBmYWxzZSApID0+IHtcbiAgdGFyZ2V0LmRpc3BhdGNoRXZlbnQoIG5ldyBLZXlib2FyZEV2ZW50KCAna2V5dXAnLCB7XG4gICAgY29kZTogY29kZSxcbiAgICBidWJibGVzOiB0cnVlLFxuICAgIGN0cmxLZXk6IGN0cmxLZXlcbiAgfSApICk7XG59O1xuXG5RVW5pdC50ZXN0KCAnS2V5Ym9hcmRMaXN0ZW5lciBUZXN0cycsIGFzc2VydCA9PiB7XG5cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcbiAgZGlzcGxheS5pbml0aWFsaXplRXZlbnRzKCk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgbGV0IGNhbGxiYWNrRmlyZWQgPSBmYWxzZTtcbiAgY29uc3QgbGlzdGVuZXIgPSBuZXcgS2V5Ym9hcmRMaXN0ZW5lcigge1xuICAgIGtleXM6IFsgJ2VudGVyJyBdLFxuICAgIGZpcmU6ICgpID0+IHtcbiAgICAgIGFzc2VydC5vayggIWNhbGxiYWNrRmlyZWQsICdjYWxsYmFjayBjYW5ub3QgYmUgZmlyZWQnICk7XG4gICAgICBjYWxsYmFja0ZpcmVkID0gdHJ1ZTtcbiAgICB9XG4gIH0gKTtcblxuICAvLyBUZXN0IHB1dHRpbmcgYSBrZXkgaW4ga2V5cyB0aGF0IGlzIG5vdCBzdXBwb3J0ZWQgKGVycm9yIG9ubHkgdGhyb3duIHdpdGggYXNzZXJ0aW9ucyBlbmFibGVkKVxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBjb25zdCBib2d1c0xpc3RlbmVyID0gbmV3IEtleWJvYXJkTGlzdGVuZXIoIHtcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFR5cGVzY3JpcHQgc2hvdWxkIGNhdGNoIGJhZCBrZXlzIHRvb1xuICAgICAga2V5czogWyAnYmFkS2V5JyBdLFxuICAgICAgZmlyZTogKCkgPT4ge1xuXG4gICAgICAgIC8vIGp1c3QgdGVzdGluZyB0aGUgdHlwaW5nLCBubyB3b3JrIHRvIGRvIGhlcmVcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgYm9ndXNMaXN0ZW5lci5kaXNwb3NlKCk7XG4gIH0sIEVycm9yLCAnQ29uc3RydWN0b3Igc2hvdWxkIGNhdGNoIHByb3ZpZGluZyBiYWQga2V5cyBhdCBydW50aW1lJyApO1xuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgZm9jdXNhYmxlOiB0cnVlIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcbiAgYS5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xuXG4gIGNvbnN0IGRvbUVsZW1lbnRBID0gYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchO1xuICBhc3NlcnQub2soIGRvbUVsZW1lbnRBLCAncGRvbSBlbGVtZW50IG5lZWRlZCcgKTtcblxuICAvLyBIb3RrZXkgdXNlcyB0aGUgZm9jdXNlZCBUcmFpbCB0byBkZXRlcm1pbmUgaWYgaXQgc2hvdWxkIGZpcmUsIHNvIHdlIG5lZWQgdG8gZm9jdXMgdGhlIGVsZW1lbnRcbiAgYS5mb2N1cygpO1xuXG4gIHRyaWdnZXJLZXlkb3duRXZlbnQoIGRvbUVsZW1lbnRBLCBLZXlib2FyZFV0aWxzLktFWV9UQUIgKTtcbiAgYXNzZXJ0Lm9rKCAhY2FsbGJhY2tGaXJlZCwgJ3Nob3VsZCBub3QgZmlyZSBvbiB0YWInICk7XG4gIHRyaWdnZXJLZXl1cEV2ZW50KCBkb21FbGVtZW50QSwgS2V5Ym9hcmRVdGlscy5LRVlfVEFCICk7XG5cbiAgdHJpZ2dlcktleWRvd25FdmVudCggZG9tRWxlbWVudEEsIEtleWJvYXJkVXRpbHMuS0VZX0VOVEVSICk7XG4gIGFzc2VydC5vayggY2FsbGJhY2tGaXJlZCwgJ3Nob3VsZCBmaXJlIG9uIGVudGVyJyApO1xuICB0cmlnZ2VyS2V5dXBFdmVudCggZG9tRWxlbWVudEEsIEtleWJvYXJkVXRpbHMuS0VZX0VOVEVSICk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIFRlc3QgYW4gb3ZlcmxhcCBvZiBrZXlzIGluIHR3byBrZXlncm91cHMuIFRoZSBjYWxsYmFjayBzaG91bGQgZmlyZSBmb3Igb25seSB0aGUga2V5Z3JvdXAgd2hlcmUgZXZlcnkga2V5XG4gIC8vIGlzIGRvd24gYW5kIG9ubHkgZXZlcnkga2V5IGlzIGRvd24uXG4gIGEucmVtb3ZlSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKTtcblxuICBsZXQgcEZpcmVkID0gZmFsc2U7XG4gIGxldCBjdHJsUEZpcmVkID0gZmFsc2U7XG4gIGNvbnN0IGxpc3RlbmVyV2l0aE92ZXJsYXBwaW5nS2V5cyA9IG5ldyBLZXlib2FyZExpc3RlbmVyKCB7XG4gICAga2V5czogWyAncCcsICdjdHJsK3AnIF0sXG5cbiAgICBmaXJlOiAoIGV2ZW50LCBrZXlzUHJlc3NlZCApID0+IHtcbiAgICAgIGlmICgga2V5c1ByZXNzZWQgPT09ICdwJyApIHtcbiAgICAgICAgcEZpcmVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBrZXlzUHJlc3NlZCA9PT0gJ2N0cmwrcCcgKSB7XG4gICAgICAgIGN0cmxQRmlyZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGFzc2VydC5vayggZmFsc2UsICduZXZlciBhZ2FpbicgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gKTtcblxuICBhLmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyV2l0aE92ZXJsYXBwaW5nS2V5cyApO1xuXG4gIHRyaWdnZXJLZXlkb3duRXZlbnQoIGRvbUVsZW1lbnRBLCBLZXlib2FyZFV0aWxzLktFWV9QLCB0cnVlICk7XG4gIGFzc2VydC5vayggIXBGaXJlZCwgJ3Agc2hvdWxkIG5vdCBmaXJlIGJlY2F1c2UgY29udHJvbCBrZXkgaXMgZG93bicgKTtcbiAgYXNzZXJ0Lm9rKCBjdHJsUEZpcmVkLCAnY3RybCBQIHNob3VsZCBoYXZlIGZpcmVkJyApO1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyB0ZXN0IGludGVycnVwdC9jYW5jZWxcbiAgLy8gVE9ETzogVGhpcyB0ZXN0IGZhaWxzIGJ1dCB0aGF0IGlzIHdvcmtpbmcgYXMgZXhwZWN0ZWQuIGludGVycnVwdC9jYW5jZWwgYXJlIG9ubHkgcmVsZXZhbnQgZm9yIHRoZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAvLyBsaXN0ZW5lciBmb3IgcHJlc3MgYW5kIGhvbGQgZnVuY3Rpb25hbGl0eS4gSW50ZXJydXB0L2NhbmNlbCBjYW5ub3QgY2xlYXIgdGhlIGtleXN0YXRlIGJlY2F1c2UgdGhlIGxpc3RlbmVyXG4gIC8vIGRvZXMgbm90IG93biBpdHMgS2V5U3RhdGVUcmFja2VyLCBpdCBpcyB1c2luZyB0aGUgZ2xvYmFsIG9uZS5cbiAgLy8gbGV0IHBiRmlyZWRGcm9tQSA9IGZhbHNlO1xuICAvLyBsZXQgcGJqRmlyZWRGcm9tQSA9IGZhbHNlO1xuICAvLyBjb25zdCBsaXN0ZW5lclRvSW50ZXJydXB0ID0gbmV3IEtleWJvYXJkTGlzdGVuZXIoIHtcbiAgLy8gICBrZXlzOiBbICdwK2InLCAncCtiK2onIF0sXG4gIC8vIGNhbGxiYWNrOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcbiAgLy8gICBjb25zdCBrZXlzUHJlc3NlZCA9IGxpc3RlbmVyLmtleXNQcmVzc2VkO1xuICAvLyAgICAgaWYgKCBrZXlzUHJlc3NlZCA9PT0gJ3ArYicgKSB7XG4gIC8vICAgICAgIHBiRmlyZWRGcm9tQSA9IHRydWU7XG4gIC8vICAgICAgIGxpc3RlbmVyVG9JbnRlcnJ1cHQuaW50ZXJydXB0KCk7XG4gIC8vICAgICB9XG4gIC8vICAgICBlbHNlIGlmICgga2V5c1ByZXNzZWQgPT09ICdwK2IraicgKSB7XG4gIC8vICAgICAgIHBiakZpcmVkRnJvbUEgPSB0cnVlO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gfSApO1xuICAvLyBhLmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyVG9JbnRlcnJ1cHQgKTtcbiAgLy9cbiAgLy8gZG9tRWxlbWVudEIuZGlzcGF0Y2hFdmVudCggbmV3IEtleWJvYXJkRXZlbnQoICdrZXlkb3duJywge1xuICAvLyAgIGNvZGU6IEtleWJvYXJkVXRpbHMuS0VZX1AsXG4gIC8vICAgYnViYmxlczogdHJ1ZVxuICAvLyB9ICkgKTtcbiAgLy8gZG9tRWxlbWVudEIuZGlzcGF0Y2hFdmVudCggbmV3IEtleWJvYXJkRXZlbnQoICdrZXlkb3duJywge1xuICAvLyAgIGNvZGU6IEtleWJvYXJkVXRpbHMuS0VZX0IsXG4gIC8vICAgYnViYmxlczogdHJ1ZVxuICAvLyB9ICkgKTtcbiAgLy8gZG9tRWxlbWVudEIuZGlzcGF0Y2hFdmVudCggbmV3IEtleWJvYXJkRXZlbnQoICdrZXlkb3duJywge1xuICAvLyAgIGNvZGU6IEtleWJvYXJkVXRpbHMuS0VZX0osXG4gIC8vICAgYnViYmxlczogdHJ1ZVxuICAvLyB9ICkgKTtcbiAgLy9cbiAgLy8gYXNzZXJ0Lm9rKCBwYkZpcmVkRnJvbUEsICdwK2IgcmVjZWl2ZXMgdGhlIGV2ZW50IGFuZCBpbnRlcnJ1cHRzIHRoZSBsaXN0ZW5lcicgKTtcbiAgLy8gYXNzZXJ0Lm9rKCAhcGJqRmlyZWRGcm9tQSwgJ2ludGVycnVwdGlvbiBjbGVhcnMgdGhlIGtleXN0YXRlIHNvIHArYitqIGRvZXMgbm90IGZpcmUnICk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xufSApO1xuXG4vL1xuLy8gUVVuaXQudGVzdCggJ0tleWJvYXJkTGlzdGVuZXIgQ2FsbGJhY2sgdGltaW5nJywgYXNzZXJ0ID0+IHtcbi8vICAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4vLyAgIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcbi8vICAgZGlzcGxheS5pbml0aWFsaXplRXZlbnRzKCk7XG4vLyAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuLy9cbi8vXG4vLyAgIC8vXG4vLyAgIC8vIGEgLT4gY2FsbGJhY2sgdGltZXJcbi8vICAgLy9cbi8vICAgLy8gd2FpdFxuLy8gICAvLyBiIC0+IGNhbGxiYWNrIHRpbWVyXG4vLyAgIC8vXG4vLyAgIC8vIHJlbGVhc2UgYmVmb3JlIGJcbi8vICAgLy9cbi8vICAgLy8gZW5zdXJlIGEgZmlyZXNcbi8vXG4vL1xuLy8gICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbi8vICAgZGlzcGxheS5kaXNwb3NlKCk7XG4vLyB9KTsiXSwibmFtZXMiOlsiRGlzcGxheSIsImdsb2JhbEtleVN0YXRlVHJhY2tlciIsIktleWJvYXJkTGlzdGVuZXIiLCJLZXlib2FyZFV0aWxzIiwiTm9kZSIsIlFVbml0IiwibW9kdWxlIiwiYmVmb3JlIiwiY2xlYXJTdGF0ZSIsInRyaWdnZXJLZXlkb3duRXZlbnQiLCJ0YXJnZXQiLCJjb2RlIiwiY3RybEtleSIsImRpc3BhdGNoRXZlbnQiLCJLZXlib2FyZEV2ZW50IiwiYnViYmxlcyIsInRyaWdnZXJLZXl1cEV2ZW50IiwidGVzdCIsImFzc2VydCIsInJvb3ROb2RlIiwidGFnTmFtZSIsImRpc3BsYXkiLCJpbml0aWFsaXplRXZlbnRzIiwiZG9jdW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJkb21FbGVtZW50IiwiY2FsbGJhY2tGaXJlZCIsImxpc3RlbmVyIiwia2V5cyIsImZpcmUiLCJvayIsIndpbmRvdyIsInRocm93cyIsImJvZ3VzTGlzdGVuZXIiLCJkaXNwb3NlIiwiRXJyb3IiLCJhIiwiZm9jdXNhYmxlIiwiYWRkQ2hpbGQiLCJhZGRJbnB1dExpc3RlbmVyIiwiZG9tRWxlbWVudEEiLCJwZG9tSW5zdGFuY2VzIiwicGVlciIsInByaW1hcnlTaWJsaW5nIiwiZm9jdXMiLCJLRVlfVEFCIiwiS0VZX0VOVEVSIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsInBGaXJlZCIsImN0cmxQRmlyZWQiLCJsaXN0ZW5lcldpdGhPdmVybGFwcGluZ0tleXMiLCJldmVudCIsImtleXNQcmVzc2VkIiwiS0VZX1AiLCJyZW1vdmVDaGlsZCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELFNBQVNBLE9BQU8sRUFBRUMscUJBQXFCLEVBQUVDLGdCQUFnQixFQUFFQyxhQUFhLEVBQUVDLElBQUksUUFBUSxnQkFBZ0I7QUFFdEdDLE1BQU1DLE1BQU0sQ0FBRSxvQkFBb0I7SUFDaENDO1FBRUUsNkRBQTZEO1FBQzdETixzQkFBc0JPLFVBQVU7SUFDbEM7QUFDRjtBQUVBLE1BQU1DLHNCQUFzQixDQUFFQyxRQUFxQkMsTUFBY0MsVUFBVSxLQUFLO0lBQzlFRixPQUFPRyxhQUFhLENBQUUsSUFBSUMsY0FBZSxXQUFXO1FBQ2xESCxNQUFNQTtRQUNOSSxTQUFTO1FBQ1RILFNBQVNBO0lBQ1g7QUFDRjtBQUVBLE1BQU1JLG9CQUFvQixDQUFFTixRQUFxQkMsTUFBY0MsVUFBVSxLQUFLO0lBQzVFRixPQUFPRyxhQUFhLENBQUUsSUFBSUMsY0FBZSxTQUFTO1FBQ2hESCxNQUFNQTtRQUNOSSxTQUFTO1FBQ1RILFNBQVNBO0lBQ1g7QUFDRjtBQUVBUCxNQUFNWSxJQUFJLENBQUUsMEJBQTBCQyxDQUFBQTtJQUVwQyxNQUFNQyxXQUFX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