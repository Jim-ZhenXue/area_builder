// Copyright 2018-2023, University of Colorado Boulder
/**
 * ?fuzzBoard keyboard fuzzer
 * TODO: keep track of keyState so that we don't trigger a keydown of keyA before the previous keyA keyup event has been called. https://github.com/phetsims/scenery/issues/1581
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import stepTimer from '../../../axon/js/stepTimer.js';
import Random from '../../../dot/js/Random.js';
import { globalKeyStateTracker, KeyboardUtils, PDOMUtils, scenery } from '../imports.js';
// uppercase matters
const keyboardTestingSchema = {
    INPUT: [
        ...KeyboardUtils.ARROW_KEYS,
        KeyboardUtils.KEY_PAGE_UP,
        KeyboardUtils.KEY_PAGE_DOWN,
        KeyboardUtils.KEY_HOME,
        KeyboardUtils.KEY_END,
        KeyboardUtils.KEY_ENTER,
        KeyboardUtils.KEY_SPACE
    ],
    DIV: [
        ...KeyboardUtils.ARROW_KEYS,
        ...KeyboardUtils.WASD_KEYS
    ],
    P: [
        KeyboardUtils.KEY_ESCAPE
    ],
    BUTTON: [
        KeyboardUtils.KEY_ENTER,
        KeyboardUtils.KEY_SPACE
    ]
};
const ALL_KEYS = KeyboardUtils.ALL_KEYS;
const MAX_MS_KEY_HOLD_DOWN = 100;
const NEXT_ELEMENT_THRESHOLD = 0.1;
const DO_KNOWN_KEYS_THRESHOLD = 0.60; // for keydown/up, 60 percent of the events
const CLICK_EVENT_THRESHOLD = DO_KNOWN_KEYS_THRESHOLD + 0.10; // 10 percent of the events
const KEY_DOWN = 'keydown';
const KEY_UP = 'keyup';
let KeyboardFuzzer = class KeyboardFuzzer {
    /**
   * Randomly decide if we should focus the next element, or stay focused on the current element
   */ chooseNextElement() {
        if (this.currentElement === null) {
            this.currentElement = document.activeElement;
        } else if (this.random.nextDouble() < NEXT_ELEMENT_THRESHOLD) {
            sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer('choosing new element');
            sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();
            // before we change focus to the next item, immediately release all keys that were down on the active element
            this.clearListeners();
            const nextFocusable = PDOMUtils.getRandomFocusable(this.random);
            nextFocusable.focus();
            this.currentElement = nextFocusable;
            sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
        }
    }
    clearListeners() {
        this.keyupListeners.forEach((listener)=>{
            assert && assert(typeof listener.timeout === 'function', 'should have an attached timeout');
            stepTimer.clearTimeout(listener.timeout);
            listener();
            assert && assert(!this.keyupListeners.includes(listener), 'calling listener should remove itself from the keyupListeners.');
        });
    }
    triggerClickEvent() {
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer('triggering click');
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();
        // We'll only ever want to send events to the activeElement (so that it's not stale), see
        // https://github.com/phetsims/scenery/issues/1497
        const element = document.activeElement;
        element instanceof HTMLElement && element.click();
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
    }
    /**
   * Trigger a keydown/keyup pair. The keyup is triggered with a timeout.
   */ triggerKeyDownUpEvents(code) {
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer(`trigger keydown/up: ${code}`);
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();
        // TODO: screen readers normally take our keydown events, but may not here, is the discrepancy ok? https://github.com/phetsims/scenery/issues/1581
        this.triggerDOMEvent(KEY_DOWN, code);
        const randomTimeForKeypress = this.random.nextInt(MAX_MS_KEY_HOLD_DOWN);
        const keyupListener = ()=>{
            this.triggerDOMEvent(KEY_UP, code);
            if (this.keyupListeners.includes(keyupListener)) {
                this.keyupListeners.splice(this.keyupListeners.indexOf(keyupListener), 1);
            }
        };
        keyupListener.timeout = stepTimer.setTimeout(keyupListener, randomTimeForKeypress === MAX_MS_KEY_HOLD_DOWN ? 2000 : randomTimeForKeypress);
        this.keyupListeners.push(keyupListener);
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
    }
    /**
   * Trigger a keydown/keyup pair with a random KeyboardEvent.code.
   */ triggerRandomKeyDownUpEvents(element) {
        const randomCode = ALL_KEYS[Math.floor(this.random.nextDouble() * (ALL_KEYS.length - 1))];
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer(`trigger random keydown/up: ${randomCode}`);
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();
        this.triggerKeyDownUpEvents(randomCode);
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
    }
    /**
   * A random event creator that sends keyboard events. Based on the idea of fuzzMouse, but to test/spam accessibility
   * related keyboard navigation and alternate input implementation.
   *
   * TODO: NOTE: Right now this is a very experimental implementation. Tread wearily https://github.com/phetsims/scenery/issues/1581
   * TODO: @param keyboardPressesPerFocusedItem {number} - basically would be the same as fuzzRate, but handling
   * TODO:     the keydown events for a focused item
   */ fuzzBoardEvents(fuzzRate) {
        if (this.display && this.display._input && this.display._input.pdomPointer) {
            const pdomPointer = this.display._input.pdomPointer;
            if (pdomPointer && !pdomPointer.blockTrustedEvents) {
                pdomPointer.blockTrustedEvents = true;
            }
        }
        for(let i = 0; i < this.numberOfComponentsTested; i++){
            // find a focus a random element
            this.chooseNextElement();
            for(let i = 0; i < fuzzRate / this.numberOfComponentsTested; i++){
                sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer(`main loop, i=${i}`);
                sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();
                // get active element, focus might have changed in the last press
                const elementWithFocus = document.activeElement;
                if (elementWithFocus && keyboardTestingSchema[elementWithFocus.tagName.toUpperCase()]) {
                    const randomNumber = this.random.nextDouble();
                    if (randomNumber < DO_KNOWN_KEYS_THRESHOLD) {
                        const codeValues = keyboardTestingSchema[elementWithFocus.tagName];
                        const code = this.random.sample(codeValues);
                        this.triggerKeyDownUpEvents(code);
                    } else if (randomNumber < CLICK_EVENT_THRESHOLD) {
                        this.triggerClickEvent();
                    } else {
                        this.triggerRandomKeyDownUpEvents(elementWithFocus);
                    }
                } else {
                    elementWithFocus && this.triggerRandomKeyDownUpEvents(elementWithFocus);
                }
                // TODO: What about other types of events, not just keydown/keyup??!?! https://github.com/phetsims/scenery/issues/1581
                // TODO: what about application role elements https://github.com/phetsims/scenery/issues/1581
                sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
            }
        }
    }
    /**
   * Taken from example in http://output.jsbin.com/awenaq/3,
   */ triggerDOMEvent(event, code) {
        // We'll only ever want to send events to the activeElement (so that it's not stale), see
        // https://github.com/phetsims/scenery/issues/1497
        if (document.activeElement) {
            const eventObj = new KeyboardEvent(event, {
                bubbles: true,
                code: code,
                shiftKey: globalKeyStateTracker.shiftKeyDown,
                altKey: globalKeyStateTracker.altKeyDown,
                ctrlKey: globalKeyStateTracker.ctrlKeyDown
            });
            document.activeElement.dispatchEvent(eventObj);
        }
    }
    constructor(display, seed){
        this.display = display;
        this.random = new Random({
            seed: seed
        });
        this.numberOfComponentsTested = 10;
        this.keyupListeners = [];
        this.currentElement = null;
    }
};
scenery.register('KeyboardFuzzer', KeyboardFuzzer);
export default KeyboardFuzzer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9LZXlib2FyZEZ1enplci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiA/ZnV6ekJvYXJkIGtleWJvYXJkIGZ1enplclxuICogVE9ETzoga2VlcCB0cmFjayBvZiBrZXlTdGF0ZSBzbyB0aGF0IHdlIGRvbid0IHRyaWdnZXIgYSBrZXlkb3duIG9mIGtleUEgYmVmb3JlIHRoZSBwcmV2aW91cyBrZXlBIGtleXVwIGV2ZW50IGhhcyBiZWVuIGNhbGxlZC4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgeyBUaW1lckxpc3RlbmVyIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW1lci5qcyc7XG5pbXBvcnQgUmFuZG9tIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5kb20uanMnO1xuaW1wb3J0IHsgRGlzcGxheSwgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCBLZXlib2FyZFV0aWxzLCBQRE9NVXRpbHMsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxudHlwZSBLZXl1cExpc3RlbmVyID0gKCAoKSA9PiB2b2lkICkgJiB7XG4gIHRpbWVvdXQ6IFRpbWVyTGlzdGVuZXI7XG59O1xuXG5cbi8vIHVwcGVyY2FzZSBtYXR0ZXJzXG5jb25zdCBrZXlib2FyZFRlc3RpbmdTY2hlbWE6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHtcbiAgSU5QVVQ6IFsgLi4uS2V5Ym9hcmRVdGlscy5BUlJPV19LRVlTLCBLZXlib2FyZFV0aWxzLktFWV9QQUdFX1VQLCBLZXlib2FyZFV0aWxzLktFWV9QQUdFX0RPV04sXG4gICAgS2V5Ym9hcmRVdGlscy5LRVlfSE9NRSwgS2V5Ym9hcmRVdGlscy5LRVlfRU5ELCBLZXlib2FyZFV0aWxzLktFWV9FTlRFUiwgS2V5Ym9hcmRVdGlscy5LRVlfU1BBQ0UgXSxcbiAgRElWOiBbIC4uLktleWJvYXJkVXRpbHMuQVJST1dfS0VZUywgLi4uS2V5Ym9hcmRVdGlscy5XQVNEX0tFWVMgXSxcbiAgUDogWyBLZXlib2FyZFV0aWxzLktFWV9FU0NBUEUgXSxcbiAgQlVUVE9OOiBbIEtleWJvYXJkVXRpbHMuS0VZX0VOVEVSLCBLZXlib2FyZFV0aWxzLktFWV9TUEFDRSBdXG59O1xuXG5jb25zdCBBTExfS0VZUyA9IEtleWJvYXJkVXRpbHMuQUxMX0tFWVM7XG5cbmNvbnN0IE1BWF9NU19LRVlfSE9MRF9ET1dOID0gMTAwO1xuY29uc3QgTkVYVF9FTEVNRU5UX1RIUkVTSE9MRCA9IDAuMTtcblxuY29uc3QgRE9fS05PV05fS0VZU19USFJFU0hPTEQgPSAwLjYwOyAvLyBmb3Iga2V5ZG93bi91cCwgNjAgcGVyY2VudCBvZiB0aGUgZXZlbnRzXG5jb25zdCBDTElDS19FVkVOVF9USFJFU0hPTEQgPSBET19LTk9XTl9LRVlTX1RIUkVTSE9MRCArIDAuMTA7IC8vIDEwIHBlcmNlbnQgb2YgdGhlIGV2ZW50c1xuXG5jb25zdCBLRVlfRE9XTiA9ICdrZXlkb3duJztcbmNvbnN0IEtFWV9VUCA9ICdrZXl1cCc7XG5cbmNsYXNzIEtleWJvYXJkRnV6emVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwbGF5OiBEaXNwbGF5O1xuICBwcml2YXRlIHJlYWRvbmx5IHJhbmRvbTogUmFuZG9tO1xuICBwcml2YXRlIHJlYWRvbmx5IG51bWJlck9mQ29tcG9uZW50c1Rlc3RlZDogbnVtYmVyO1xuICBwcml2YXRlIGtleXVwTGlzdGVuZXJzOiBLZXl1cExpc3RlbmVyW107XG4gIHByaXZhdGUgY3VycmVudEVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzcGxheTogRGlzcGxheSwgc2VlZDogbnVtYmVyICkge1xuXG4gICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICB0aGlzLnJhbmRvbSA9IG5ldyBSYW5kb20oIHsgc2VlZDogc2VlZCB9ICk7XG4gICAgdGhpcy5udW1iZXJPZkNvbXBvbmVudHNUZXN0ZWQgPSAxMDtcbiAgICB0aGlzLmtleXVwTGlzdGVuZXJzID0gW107XG4gICAgdGhpcy5jdXJyZW50RWxlbWVudCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmFuZG9tbHkgZGVjaWRlIGlmIHdlIHNob3VsZCBmb2N1cyB0aGUgbmV4dCBlbGVtZW50LCBvciBzdGF5IGZvY3VzZWQgb24gdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgKi9cbiAgcHJpdmF0ZSBjaG9vc2VOZXh0RWxlbWVudCgpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuY3VycmVudEVsZW1lbnQgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLmN1cnJlbnRFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMucmFuZG9tLm5leHREb3VibGUoKSA8IE5FWFRfRUxFTUVOVF9USFJFU0hPTEQgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciggJ2Nob29zaW5nIG5ldyBlbGVtZW50JyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICAvLyBiZWZvcmUgd2UgY2hhbmdlIGZvY3VzIHRvIHRoZSBuZXh0IGl0ZW0sIGltbWVkaWF0ZWx5IHJlbGVhc2UgYWxsIGtleXMgdGhhdCB3ZXJlIGRvd24gb24gdGhlIGFjdGl2ZSBlbGVtZW50XG4gICAgICB0aGlzLmNsZWFyTGlzdGVuZXJzKCk7XG4gICAgICBjb25zdCBuZXh0Rm9jdXNhYmxlID0gUERPTVV0aWxzLmdldFJhbmRvbUZvY3VzYWJsZSggdGhpcy5yYW5kb20gKTtcbiAgICAgIG5leHRGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIHRoaXMuY3VycmVudEVsZW1lbnQgPSBuZXh0Rm9jdXNhYmxlO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyTGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIHRoaXMua2V5dXBMaXN0ZW5lcnMuZm9yRWFjaCggbGlzdGVuZXIgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGxpc3RlbmVyLnRpbWVvdXQgPT09ICdmdW5jdGlvbicsICdzaG91bGQgaGF2ZSBhbiBhdHRhY2hlZCB0aW1lb3V0JyApO1xuICAgICAgc3RlcFRpbWVyLmNsZWFyVGltZW91dCggbGlzdGVuZXIudGltZW91dCApO1xuICAgICAgbGlzdGVuZXIoKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmtleXVwTGlzdGVuZXJzLmluY2x1ZGVzKCBsaXN0ZW5lciApLCAnY2FsbGluZyBsaXN0ZW5lciBzaG91bGQgcmVtb3ZlIGl0c2VsZiBmcm9tIHRoZSBrZXl1cExpc3RlbmVycy4nICk7XG4gICAgfSApO1xuICB9XG5cbiAgcHJpdmF0ZSB0cmlnZ2VyQ2xpY2tFdmVudCgpOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciggJ3RyaWdnZXJpbmcgY2xpY2snICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gV2UnbGwgb25seSBldmVyIHdhbnQgdG8gc2VuZCBldmVudHMgdG8gdGhlIGFjdGl2ZUVsZW1lbnQgKHNvIHRoYXQgaXQncyBub3Qgc3RhbGUpLCBzZWVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTQ5N1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbGVtZW50LmNsaWNrKCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEga2V5ZG93bi9rZXl1cCBwYWlyLiBUaGUga2V5dXAgaXMgdHJpZ2dlcmVkIHdpdGggYSB0aW1lb3V0LlxuICAgKi9cbiAgcHJpdmF0ZSB0cmlnZ2VyS2V5RG93blVwRXZlbnRzKCBjb2RlOiBzdHJpbmcgKTogdm9pZCB7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciggYHRyaWdnZXIga2V5ZG93bi91cDogJHtjb2RlfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBUT0RPOiBzY3JlZW4gcmVhZGVycyBub3JtYWxseSB0YWtlIG91ciBrZXlkb3duIGV2ZW50cywgYnV0IG1heSBub3QgaGVyZSwgaXMgdGhlIGRpc2NyZXBhbmN5IG9rPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHRoaXMudHJpZ2dlckRPTUV2ZW50KCBLRVlfRE9XTiwgY29kZSApO1xuXG4gICAgY29uc3QgcmFuZG9tVGltZUZvcktleXByZXNzID0gdGhpcy5yYW5kb20ubmV4dEludCggTUFYX01TX0tFWV9IT0xEX0RPV04gKTtcblxuICAgIGNvbnN0IGtleXVwTGlzdGVuZXI6IEtleXVwTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzLnRyaWdnZXJET01FdmVudCggS0VZX1VQLCBjb2RlICk7XG4gICAgICBpZiAoIHRoaXMua2V5dXBMaXN0ZW5lcnMuaW5jbHVkZXMoIGtleXVwTGlzdGVuZXIgKSApIHtcbiAgICAgICAgdGhpcy5rZXl1cExpc3RlbmVycy5zcGxpY2UoIHRoaXMua2V5dXBMaXN0ZW5lcnMuaW5kZXhPZigga2V5dXBMaXN0ZW5lciApLCAxICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGtleXVwTGlzdGVuZXIudGltZW91dCA9IHN0ZXBUaW1lci5zZXRUaW1lb3V0KCBrZXl1cExpc3RlbmVyLCByYW5kb21UaW1lRm9yS2V5cHJlc3MgPT09IE1BWF9NU19LRVlfSE9MRF9ET1dOID8gMjAwMCA6IHJhbmRvbVRpbWVGb3JLZXlwcmVzcyApO1xuICAgIHRoaXMua2V5dXBMaXN0ZW5lcnMucHVzaCgga2V5dXBMaXN0ZW5lciApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBhIGtleWRvd24va2V5dXAgcGFpciB3aXRoIGEgcmFuZG9tIEtleWJvYXJkRXZlbnQuY29kZS5cbiAgICovXG4gIHByaXZhdGUgdHJpZ2dlclJhbmRvbUtleURvd25VcEV2ZW50cyggZWxlbWVudDogRWxlbWVudCApOiB2b2lkIHtcblxuICAgIGNvbnN0IHJhbmRvbUNvZGUgPSBBTExfS0VZU1sgTWF0aC5mbG9vciggdGhpcy5yYW5kb20ubmV4dERvdWJsZSgpICogKCBBTExfS0VZUy5sZW5ndGggLSAxICkgKSBdO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIoIGB0cmlnZ2VyIHJhbmRvbSBrZXlkb3duL3VwOiAke3JhbmRvbUNvZGV9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIHRoaXMudHJpZ2dlcktleURvd25VcEV2ZW50cyggcmFuZG9tQ29kZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQSByYW5kb20gZXZlbnQgY3JlYXRvciB0aGF0IHNlbmRzIGtleWJvYXJkIGV2ZW50cy4gQmFzZWQgb24gdGhlIGlkZWEgb2YgZnV6ek1vdXNlLCBidXQgdG8gdGVzdC9zcGFtIGFjY2Vzc2liaWxpdHlcbiAgICogcmVsYXRlZCBrZXlib2FyZCBuYXZpZ2F0aW9uIGFuZCBhbHRlcm5hdGUgaW5wdXQgaW1wbGVtZW50YXRpb24uXG4gICAqXG4gICAqIFRPRE86IE5PVEU6IFJpZ2h0IG5vdyB0aGlzIGlzIGEgdmVyeSBleHBlcmltZW50YWwgaW1wbGVtZW50YXRpb24uIFRyZWFkIHdlYXJpbHkgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICogVE9ETzogQHBhcmFtIGtleWJvYXJkUHJlc3Nlc1BlckZvY3VzZWRJdGVtIHtudW1iZXJ9IC0gYmFzaWNhbGx5IHdvdWxkIGJlIHRoZSBzYW1lIGFzIGZ1enpSYXRlLCBidXQgaGFuZGxpbmdcbiAgICogVE9ETzogICAgIHRoZSBrZXlkb3duIGV2ZW50cyBmb3IgYSBmb2N1c2VkIGl0ZW1cbiAgICovXG4gIHB1YmxpYyBmdXp6Qm9hcmRFdmVudHMoIGZ1enpSYXRlOiBudW1iZXIgKTogdm9pZCB7XG5cbiAgICBpZiAoIHRoaXMuZGlzcGxheSAmJiB0aGlzLmRpc3BsYXkuX2lucHV0ICYmIHRoaXMuZGlzcGxheS5faW5wdXQucGRvbVBvaW50ZXIgKSB7XG4gICAgICBjb25zdCBwZG9tUG9pbnRlciA9IHRoaXMuZGlzcGxheS5faW5wdXQucGRvbVBvaW50ZXI7XG4gICAgICBpZiAoIHBkb21Qb2ludGVyICYmICFwZG9tUG9pbnRlci5ibG9ja1RydXN0ZWRFdmVudHMgKSB7XG4gICAgICAgIHBkb21Qb2ludGVyLmJsb2NrVHJ1c3RlZEV2ZW50cyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5udW1iZXJPZkNvbXBvbmVudHNUZXN0ZWQ7IGkrKyApIHtcblxuICAgICAgLy8gZmluZCBhIGZvY3VzIGEgcmFuZG9tIGVsZW1lbnRcbiAgICAgIHRoaXMuY2hvb3NlTmV4dEVsZW1lbnQoKTtcblxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZnV6elJhdGUgLyB0aGlzLm51bWJlck9mQ29tcG9uZW50c1Rlc3RlZDsgaSsrICkge1xuXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyKCBgbWFpbiBsb29wLCBpPSR7aX1gICk7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgICAvLyBnZXQgYWN0aXZlIGVsZW1lbnQsIGZvY3VzIG1pZ2h0IGhhdmUgY2hhbmdlZCBpbiB0aGUgbGFzdCBwcmVzc1xuICAgICAgICBjb25zdCBlbGVtZW50V2l0aEZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICBpZiAoIGVsZW1lbnRXaXRoRm9jdXMgJiYga2V5Ym9hcmRUZXN0aW5nU2NoZW1hWyBlbGVtZW50V2l0aEZvY3VzLnRhZ05hbWUudG9VcHBlckNhc2UoKSBdICkge1xuXG4gICAgICAgICAgY29uc3QgcmFuZG9tTnVtYmVyID0gdGhpcy5yYW5kb20ubmV4dERvdWJsZSgpO1xuICAgICAgICAgIGlmICggcmFuZG9tTnVtYmVyIDwgRE9fS05PV05fS0VZU19USFJFU0hPTEQgKSB7XG4gICAgICAgICAgICBjb25zdCBjb2RlVmFsdWVzID0ga2V5Ym9hcmRUZXN0aW5nU2NoZW1hWyBlbGVtZW50V2l0aEZvY3VzLnRhZ05hbWUgXTtcbiAgICAgICAgICAgIGNvbnN0IGNvZGUgPSB0aGlzLnJhbmRvbS5zYW1wbGUoIGNvZGVWYWx1ZXMgKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcktleURvd25VcEV2ZW50cyggY29kZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggcmFuZG9tTnVtYmVyIDwgQ0xJQ0tfRVZFTlRfVEhSRVNIT0xEICkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyQ2xpY2tFdmVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlclJhbmRvbUtleURvd25VcEV2ZW50cyggZWxlbWVudFdpdGhGb2N1cyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50V2l0aEZvY3VzICYmIHRoaXMudHJpZ2dlclJhbmRvbUtleURvd25VcEV2ZW50cyggZWxlbWVudFdpdGhGb2N1cyApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IFdoYXQgYWJvdXQgb3RoZXIgdHlwZXMgb2YgZXZlbnRzLCBub3QganVzdCBrZXlkb3duL2tleXVwPz8hPyEgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgICAgLy8gVE9ETzogd2hhdCBhYm91dCBhcHBsaWNhdGlvbiByb2xlIGVsZW1lbnRzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG5cbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VuIGZyb20gZXhhbXBsZSBpbiBodHRwOi8vb3V0cHV0LmpzYmluLmNvbS9hd2VuYXEvMyxcbiAgICovXG4gIHByaXZhdGUgdHJpZ2dlckRPTUV2ZW50KCBldmVudDogc3RyaW5nLCBjb2RlOiBzdHJpbmcgKTogdm9pZCB7XG4gICAgLy8gV2UnbGwgb25seSBldmVyIHdhbnQgdG8gc2VuZCBldmVudHMgdG8gdGhlIGFjdGl2ZUVsZW1lbnQgKHNvIHRoYXQgaXQncyBub3Qgc3RhbGUpLCBzZWVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTQ5N1xuICAgIGlmICggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCApIHtcbiAgICAgIGNvbnN0IGV2ZW50T2JqID0gbmV3IEtleWJvYXJkRXZlbnQoIGV2ZW50LCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgIHNoaWZ0S2V5OiBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIuc2hpZnRLZXlEb3duLFxuICAgICAgICBhbHRLZXk6IGdsb2JhbEtleVN0YXRlVHJhY2tlci5hbHRLZXlEb3duLFxuICAgICAgICBjdHJsS2V5OiBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIuY3RybEtleURvd25cbiAgICAgIH0gKTtcblxuICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5kaXNwYXRjaEV2ZW50KCBldmVudE9iaiApO1xuICAgIH1cbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnS2V5Ym9hcmRGdXp6ZXInLCBLZXlib2FyZEZ1enplciApO1xuZXhwb3J0IGRlZmF1bHQgS2V5Ym9hcmRGdXp6ZXI7Il0sIm5hbWVzIjpbInN0ZXBUaW1lciIsIlJhbmRvbSIsImdsb2JhbEtleVN0YXRlVHJhY2tlciIsIktleWJvYXJkVXRpbHMiLCJQRE9NVXRpbHMiLCJzY2VuZXJ5Iiwia2V5Ym9hcmRUZXN0aW5nU2NoZW1hIiwiSU5QVVQiLCJBUlJPV19LRVlTIiwiS0VZX1BBR0VfVVAiLCJLRVlfUEFHRV9ET1dOIiwiS0VZX0hPTUUiLCJLRVlfRU5EIiwiS0VZX0VOVEVSIiwiS0VZX1NQQUNFIiwiRElWIiwiV0FTRF9LRVlTIiwiUCIsIktFWV9FU0NBUEUiLCJCVVRUT04iLCJBTExfS0VZUyIsIk1BWF9NU19LRVlfSE9MRF9ET1dOIiwiTkVYVF9FTEVNRU5UX1RIUkVTSE9MRCIsIkRPX0tOT1dOX0tFWVNfVEhSRVNIT0xEIiwiQ0xJQ0tfRVZFTlRfVEhSRVNIT0xEIiwiS0VZX0RPV04iLCJLRVlfVVAiLCJLZXlib2FyZEZ1enplciIsImNob29zZU5leHRFbGVtZW50IiwiY3VycmVudEVsZW1lbnQiLCJkb2N1bWVudCIsImFjdGl2ZUVsZW1lbnQiLCJyYW5kb20iLCJuZXh0RG91YmxlIiwic2NlbmVyeUxvZyIsInB1c2giLCJjbGVhckxpc3RlbmVycyIsIm5leHRGb2N1c2FibGUiLCJnZXRSYW5kb21Gb2N1c2FibGUiLCJmb2N1cyIsInBvcCIsImtleXVwTGlzdGVuZXJzIiwiZm9yRWFjaCIsImxpc3RlbmVyIiwiYXNzZXJ0IiwidGltZW91dCIsImNsZWFyVGltZW91dCIsImluY2x1ZGVzIiwidHJpZ2dlckNsaWNrRXZlbnQiLCJlbGVtZW50IiwiSFRNTEVsZW1lbnQiLCJjbGljayIsInRyaWdnZXJLZXlEb3duVXBFdmVudHMiLCJjb2RlIiwidHJpZ2dlckRPTUV2ZW50IiwicmFuZG9tVGltZUZvcktleXByZXNzIiwibmV4dEludCIsImtleXVwTGlzdGVuZXIiLCJzcGxpY2UiLCJpbmRleE9mIiwic2V0VGltZW91dCIsInRyaWdnZXJSYW5kb21LZXlEb3duVXBFdmVudHMiLCJyYW5kb21Db2RlIiwiTWF0aCIsImZsb29yIiwibGVuZ3RoIiwiZnV6ekJvYXJkRXZlbnRzIiwiZnV6elJhdGUiLCJkaXNwbGF5IiwiX2lucHV0IiwicGRvbVBvaW50ZXIiLCJibG9ja1RydXN0ZWRFdmVudHMiLCJpIiwibnVtYmVyT2ZDb21wb25lbnRzVGVzdGVkIiwiZWxlbWVudFdpdGhGb2N1cyIsInRhZ05hbWUiLCJ0b1VwcGVyQ2FzZSIsInJhbmRvbU51bWJlciIsImNvZGVWYWx1ZXMiLCJzYW1wbGUiLCJldmVudCIsImV2ZW50T2JqIiwiS2V5Ym9hcmRFdmVudCIsImJ1YmJsZXMiLCJzaGlmdEtleSIsInNoaWZ0S2V5RG93biIsImFsdEtleSIsImFsdEtleURvd24iLCJjdHJsS2V5IiwiY3RybEtleURvd24iLCJkaXNwYXRjaEV2ZW50Iiwic2VlZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxlQUFlLGdDQUFnQztBQUV0RCxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxTQUFrQkMscUJBQXFCLEVBQUVDLGFBQWEsRUFBRUMsU0FBUyxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBT2xHLG9CQUFvQjtBQUNwQixNQUFNQyx3QkFBa0Q7SUFDdERDLE9BQU87V0FBS0osY0FBY0ssVUFBVTtRQUFFTCxjQUFjTSxXQUFXO1FBQUVOLGNBQWNPLGFBQWE7UUFDMUZQLGNBQWNRLFFBQVE7UUFBRVIsY0FBY1MsT0FBTztRQUFFVCxjQUFjVSxTQUFTO1FBQUVWLGNBQWNXLFNBQVM7S0FBRTtJQUNuR0MsS0FBSztXQUFLWixjQUFjSyxVQUFVO1dBQUtMLGNBQWNhLFNBQVM7S0FBRTtJQUNoRUMsR0FBRztRQUFFZCxjQUFjZSxVQUFVO0tBQUU7SUFDL0JDLFFBQVE7UUFBRWhCLGNBQWNVLFNBQVM7UUFBRVYsY0FBY1csU0FBUztLQUFFO0FBQzlEO0FBRUEsTUFBTU0sV0FBV2pCLGNBQWNpQixRQUFRO0FBRXZDLE1BQU1DLHVCQUF1QjtBQUM3QixNQUFNQyx5QkFBeUI7QUFFL0IsTUFBTUMsMEJBQTBCLE1BQU0sMkNBQTJDO0FBQ2pGLE1BQU1DLHdCQUF3QkQsMEJBQTBCLE1BQU0sMkJBQTJCO0FBRXpGLE1BQU1FLFdBQVc7QUFDakIsTUFBTUMsU0FBUztBQUVmLElBQUEsQUFBTUMsaUJBQU4sTUFBTUE7SUFnQko7O0dBRUMsR0FDRCxBQUFRQyxvQkFBMEI7UUFDaEMs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