// Copyright 2018-2023, University of Colorado Boulder
/**
 * For generating random mouse/touch input to a Display, to hopefully discover bugs in an automated fashion.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Random from '../../../dot/js/Random.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { EventContext, scenery } from '../imports.js';
let InputFuzzer = class InputFuzzer {
    /**
   * Sends a certain (expected) number of random events through the input system for the display.
   * @public
   *
   * @param {number} averageEventCount
   * @param {boolean} allowMouse
   * @param {boolean} allowTouch
   * @param {number} maximumPointerCount
   */ fuzzEvents(averageEventCount, allowMouse, allowTouch, maximumPointerCount) {
        assert && assert(averageEventCount > 0, `averageEventCount must be positive: ${averageEventCount}`);
        this.display._input.currentlyFiringEvents = true;
        // run a variable number of events, with a certain chance of bailing out (so no events are possible)
        // models a geometric distribution of events
        // See https://github.com/phetsims/joist/issues/343 for notes on the distribution.
        while(this.random.nextDouble() < 1 - 1 / (averageEventCount + 1)){
            const activePointerCount = this.touches.length + (this.isMouseDown ? 1 : 0); // 1 extra for the mouse if down
            const canAddPointer = activePointerCount < maximumPointerCount;
            const potentialActions = [];
            if (allowMouse) {
                // We could always mouse up/move (if we are down), but can't 'down/move' without being able to add a pointer
                if (this.isMouseDown || canAddPointer) {
                    potentialActions.push(this.mouseToggleAction);
                    potentialActions.push(this.mouseMoveAction);
                }
            }
            if (allowTouch) {
                if (canAddPointer) {
                    potentialActions.push(this.touchStartAction);
                }
                if (this.touches.length) {
                    potentialActions.push(this.random.nextDouble() < 0.8 ? this.touchEndAction : this.touchCancelAction);
                    potentialActions.push(this.touchMoveAction);
                }
            }
            const action = this.random.sample(potentialActions);
            action();
        }
        this.display._input.currentlyFiringEvents = false;
        // Since we do a lock-out to stop reentrant events above, we'll need to fire any batched events that have accumulated
        // see https://github.com/phetsims/scenery/issues/1497. We'll likely get some focus events that need to fire
        // for correctness, before we continue on.
        this.display._input.fireBatchedEvents();
    }
    /**
   * Creates a touch event from multiple touch "items".
   * @private
   *
   * @param {string} type - The main event type, e.g. 'touchmove'.
   * @param {Array.<Object>} touches - A subset of touch objects stored on the fuzzer itself.
   * @returns {Event} - If possible a TouchEvent, but may be a CustomEvent
   */ createTouchEvent(type, touches) {
        const domElement = this.display.domElement;
        // A specification that looks like a Touch object (and may be used to create one)
        const touchItems = touches.map((touch)=>({
                identifier: touch.id,
                target: domElement,
                clientX: touch.position.x,
                clientY: touch.position.y
            }));
        // Check if we can use Touch/TouchEvent constructors, see https://www.chromestatus.com/feature/4923255479599104
        if (window.Touch !== undefined && window.TouchEvent !== undefined && window.Touch.length === 1 && window.TouchEvent.length === 1) {
            const rawTouches = touchItems.map((touchItem)=>new window.Touch(touchItem));
            return new window.TouchEvent(type, {
                cancelable: true,
                bubbles: true,
                touches: rawTouches,
                targetTouches: [],
                changedTouches: rawTouches,
                shiftKey: false // TODO: Do we need this? https://github.com/phetsims/scenery/issues/1581
            });
        } else {
            const event = document.createEvent('CustomEvent');
            event.initCustomEvent(type, true, true, {
                touches: touchItems,
                targetTouches: [],
                changedTouches: touchItems
            });
            return event;
        }
    }
    /**
   * Returns a random position somewhere in the display's global coordinates.
   * @private
   *
   * @returns {Vector2}
   */ getRandomPosition() {
        return new Vector2(Math.floor(this.random.nextDouble() * this.display.width), Math.floor(this.random.nextDouble() * this.display.height));
    }
    /**
   * Creates a touch from a position (and adds it).
   * @private
   *
   * @param {Vector2} position
   * @returns {Object}
   */ createTouch(position) {
        const touch = {
            id: this.nextTouchID++,
            position: position
        };
        this.touches.push(touch);
        return touch;
    }
    /**
   * Removes a touch from our list.
   * @private
   *
   * @param {Object} touch
   */ removeTouch(touch) {
        this.touches.splice(this.touches.indexOf(touch), 1);
    }
    /**
   * Triggers a touchStart for the given touch.
   * @private
   *
   * @param {Object} touch
   */ touchStart(touch) {
        const event = this.createTouchEvent('touchstart', [
            touch
        ]);
        this.display._input.validatePointers();
        this.display._input.touchStart(touch.id, touch.position, new EventContext(event));
    }
    /**
   * Triggers a touchMove for the given touch (to a random position in the display).
   * @private
   *
   * @param {Object} touch
   */ touchMove(touch) {
        touch.position = this.getRandomPosition();
        const event = this.createTouchEvent('touchmove', [
            touch
        ]);
        this.display._input.validatePointers();
        this.display._input.touchMove(touch.id, touch.position, new EventContext(event));
    }
    /**
   * Triggers a touchEnd for the given touch.
   * @private
   *
   * @param {Object} touch
   */ touchEnd(touch) {
        const event = this.createTouchEvent('touchend', [
            touch
        ]);
        this.display._input.validatePointers();
        this.display._input.touchEnd(touch.id, touch.position, new EventContext(event));
    }
    /**
   * Triggers a touchCancel for the given touch.
   * @private
   *
   * @param {Object} touch
   */ touchCancel(touch) {
        const event = this.createTouchEvent('touchcancel', [
            touch
        ]);
        this.display._input.validatePointers();
        this.display._input.touchCancel(touch.id, touch.position, new EventContext(event));
    }
    /**
   * Triggers a mouse toggle (switching from down => up or vice versa).
   * @private
   */ mouseToggle() {
        const domEvent = document.createEvent('MouseEvent');
        // technically deprecated, but DOM4 event constructors not out yet. people on #whatwg said to use it
        domEvent.initMouseEvent(this.isMouseDown ? 'mouseup' : 'mousedown', true, true, window, 1, this.mousePosition.x, this.mousePosition.y, this.mousePosition.x, this.mousePosition.y, false, false, false, false, 0, null);
        this.display._input.validatePointers();
        if (this.isMouseDown) {
            this.display._input.mouseUp(this.mousePosition, new EventContext(domEvent));
            this.isMouseDown = false;
        } else {
            this.display._input.mouseDown(null, this.mousePosition, new EventContext(domEvent));
            this.isMouseDown = true;
        }
    }
    /**
   * Triggers a mouse move (to a random position in the display).
   * @private
   */ mouseMove() {
        this.mousePosition = this.getRandomPosition();
        // our move event
        const domEvent = document.createEvent('MouseEvent'); // not 'MouseEvents' according to DOM Level 3 spec
        // technically deprecated, but DOM4 event constructors not out yet. people on #whatwg said to use it
        domEvent.initMouseEvent('mousemove', true, true, window, 0, this.mousePosition.x, this.mousePosition.y, this.mousePosition.x, this.mousePosition.y, false, false, false, false, 0, null);
        this.display._input.validatePointers();
        this.display._input.mouseMove(this.mousePosition, new EventContext(domEvent));
    }
    /**
   * @param {Display} display
   * @param {number} seed
   */ constructor(display, seed){
        // @private {Display}
        this.display = display;
        // @private {Array.<Object>} - { id: {number}, position: {Vector2} }
        this.touches = [];
        // @private {number}
        this.nextTouchID = 1;
        // @private {boolean}
        this.isMouseDown = false;
        // @private {Vector2} - Starts at 0,0, because why not
        this.mousePosition = new Vector2(0, 0);
        // @private {Random}
        this.random = new Random({
            seed: seed
        });
        // @private {function} - All of the various actions that may be options at certain times.
        this.mouseToggleAction = ()=>{
            this.mouseToggle();
        };
        this.mouseMoveAction = ()=>{
            this.mouseMove();
        };
        this.touchStartAction = ()=>{
            const touch = this.createTouch(this.getRandomPosition());
            this.touchStart(touch);
        };
        this.touchMoveAction = ()=>{
            const touch = this.random.sample(this.touches);
            this.touchMove(touch);
        };
        this.touchEndAction = ()=>{
            const touch = this.random.sample(this.touches);
            this.touchEnd(touch);
            this.removeTouch(touch);
        };
        this.touchCancelAction = ()=>{
            const touch = this.random.sample(this.touches);
            this.touchCancel(touch);
            this.removeTouch(touch);
        };
    }
};
scenery.register('InputFuzzer', InputFuzzer);
export default InputFuzzer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvSW5wdXRGdXp6ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRm9yIGdlbmVyYXRpbmcgcmFuZG9tIG1vdXNlL3RvdWNoIGlucHV0IHRvIGEgRGlzcGxheSwgdG8gaG9wZWZ1bGx5IGRpc2NvdmVyIGJ1Z3MgaW4gYW4gYXV0b21hdGVkIGZhc2hpb24uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBSYW5kb20gZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmRvbS5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBFdmVudENvbnRleHQsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY2xhc3MgSW5wdXRGdXp6ZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzZWVkXG4gICAqL1xuICBjb25zdHJ1Y3RvciggZGlzcGxheSwgc2VlZCApIHtcblxuICAgIC8vIEBwcml2YXRlIHtEaXNwbGF5fVxuICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPE9iamVjdD59IC0geyBpZDoge251bWJlcn0sIHBvc2l0aW9uOiB7VmVjdG9yMn0gfVxuICAgIHRoaXMudG91Y2hlcyA9IFtdO1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cbiAgICB0aGlzLm5leHRUb3VjaElEID0gMTtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxuICAgIHRoaXMuaXNNb3VzZURvd24gPSBmYWxzZTtcblxuICAgIC8vIEBwcml2YXRlIHtWZWN0b3IyfSAtIFN0YXJ0cyBhdCAwLDAsIGJlY2F1c2Ugd2h5IG5vdFxuICAgIHRoaXMubW91c2VQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7UmFuZG9tfVxuICAgIHRoaXMucmFuZG9tID0gbmV3IFJhbmRvbSggeyBzZWVkOiBzZWVkIH0gKTtcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn0gLSBBbGwgb2YgdGhlIHZhcmlvdXMgYWN0aW9ucyB0aGF0IG1heSBiZSBvcHRpb25zIGF0IGNlcnRhaW4gdGltZXMuXG4gICAgdGhpcy5tb3VzZVRvZ2dsZUFjdGlvbiA9ICgpID0+IHtcbiAgICAgIHRoaXMubW91c2VUb2dnbGUoKTtcbiAgICB9O1xuICAgIHRoaXMubW91c2VNb3ZlQWN0aW9uID0gKCkgPT4ge1xuICAgICAgdGhpcy5tb3VzZU1vdmUoKTtcbiAgICB9O1xuICAgIHRoaXMudG91Y2hTdGFydEFjdGlvbiA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRvdWNoID0gdGhpcy5jcmVhdGVUb3VjaCggdGhpcy5nZXRSYW5kb21Qb3NpdGlvbigpICk7XG4gICAgICB0aGlzLnRvdWNoU3RhcnQoIHRvdWNoICk7XG4gICAgfTtcbiAgICB0aGlzLnRvdWNoTW92ZUFjdGlvbiA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRvdWNoID0gdGhpcy5yYW5kb20uc2FtcGxlKCB0aGlzLnRvdWNoZXMgKTtcbiAgICAgIHRoaXMudG91Y2hNb3ZlKCB0b3VjaCApO1xuICAgIH07XG4gICAgdGhpcy50b3VjaEVuZEFjdGlvbiA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRvdWNoID0gdGhpcy5yYW5kb20uc2FtcGxlKCB0aGlzLnRvdWNoZXMgKTtcbiAgICAgIHRoaXMudG91Y2hFbmQoIHRvdWNoICk7XG4gICAgICB0aGlzLnJlbW92ZVRvdWNoKCB0b3VjaCApO1xuICAgIH07XG4gICAgdGhpcy50b3VjaENhbmNlbEFjdGlvbiA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRvdWNoID0gdGhpcy5yYW5kb20uc2FtcGxlKCB0aGlzLnRvdWNoZXMgKTtcbiAgICAgIHRoaXMudG91Y2hDYW5jZWwoIHRvdWNoICk7XG4gICAgICB0aGlzLnJlbW92ZVRvdWNoKCB0b3VjaCApO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBjZXJ0YWluIChleHBlY3RlZCkgbnVtYmVyIG9mIHJhbmRvbSBldmVudHMgdGhyb3VnaCB0aGUgaW5wdXQgc3lzdGVtIGZvciB0aGUgZGlzcGxheS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYXZlcmFnZUV2ZW50Q291bnRcbiAgICogQHBhcmFtIHtib29sZWFufSBhbGxvd01vdXNlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dUb3VjaFxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4aW11bVBvaW50ZXJDb3VudFxuICAgKi9cbiAgZnV6ekV2ZW50cyggYXZlcmFnZUV2ZW50Q291bnQsIGFsbG93TW91c2UsIGFsbG93VG91Y2gsIG1heGltdW1Qb2ludGVyQ291bnQgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXZlcmFnZUV2ZW50Q291bnQgPiAwLCBgYXZlcmFnZUV2ZW50Q291bnQgbXVzdCBiZSBwb3NpdGl2ZTogJHthdmVyYWdlRXZlbnRDb3VudH1gICk7XG5cbiAgICB0aGlzLmRpc3BsYXkuX2lucHV0LmN1cnJlbnRseUZpcmluZ0V2ZW50cyA9IHRydWU7XG5cbiAgICAvLyBydW4gYSB2YXJpYWJsZSBudW1iZXIgb2YgZXZlbnRzLCB3aXRoIGEgY2VydGFpbiBjaGFuY2Ugb2YgYmFpbGluZyBvdXQgKHNvIG5vIGV2ZW50cyBhcmUgcG9zc2libGUpXG4gICAgLy8gbW9kZWxzIGEgZ2VvbWV0cmljIGRpc3RyaWJ1dGlvbiBvZiBldmVudHNcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8zNDMgZm9yIG5vdGVzIG9uIHRoZSBkaXN0cmlidXRpb24uXG4gICAgd2hpbGUgKCB0aGlzLnJhbmRvbS5uZXh0RG91YmxlKCkgPCAxIC0gMSAvICggYXZlcmFnZUV2ZW50Q291bnQgKyAxICkgKSB7XG4gICAgICBjb25zdCBhY3RpdmVQb2ludGVyQ291bnQgPSB0aGlzLnRvdWNoZXMubGVuZ3RoICsgKCB0aGlzLmlzTW91c2VEb3duID8gMSA6IDAgKTsgLy8gMSBleHRyYSBmb3IgdGhlIG1vdXNlIGlmIGRvd25cbiAgICAgIGNvbnN0IGNhbkFkZFBvaW50ZXIgPSBhY3RpdmVQb2ludGVyQ291bnQgPCBtYXhpbXVtUG9pbnRlckNvdW50O1xuXG4gICAgICBjb25zdCBwb3RlbnRpYWxBY3Rpb25zID0gW107XG5cbiAgICAgIGlmICggYWxsb3dNb3VzZSApIHtcbiAgICAgICAgLy8gV2UgY291bGQgYWx3YXlzIG1vdXNlIHVwL21vdmUgKGlmIHdlIGFyZSBkb3duKSwgYnV0IGNhbid0ICdkb3duL21vdmUnIHdpdGhvdXQgYmVpbmcgYWJsZSB0byBhZGQgYSBwb2ludGVyXG4gICAgICAgIGlmICggdGhpcy5pc01vdXNlRG93biB8fCBjYW5BZGRQb2ludGVyICkge1xuICAgICAgICAgIHBvdGVudGlhbEFjdGlvbnMucHVzaCggdGhpcy5tb3VzZVRvZ2dsZUFjdGlvbiApO1xuICAgICAgICAgIHBvdGVudGlhbEFjdGlvbnMucHVzaCggdGhpcy5tb3VzZU1vdmVBY3Rpb24gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIGFsbG93VG91Y2ggKSB7XG4gICAgICAgIGlmICggY2FuQWRkUG9pbnRlciApIHtcbiAgICAgICAgICBwb3RlbnRpYWxBY3Rpb25zLnB1c2goIHRoaXMudG91Y2hTdGFydEFjdGlvbiApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggdGhpcy50b3VjaGVzLmxlbmd0aCApIHtcbiAgICAgICAgICBwb3RlbnRpYWxBY3Rpb25zLnB1c2goIHRoaXMucmFuZG9tLm5leHREb3VibGUoKSA8IDAuOCA/IHRoaXMudG91Y2hFbmRBY3Rpb24gOiB0aGlzLnRvdWNoQ2FuY2VsQWN0aW9uICk7XG4gICAgICAgICAgcG90ZW50aWFsQWN0aW9ucy5wdXNoKCB0aGlzLnRvdWNoTW92ZUFjdGlvbiApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMucmFuZG9tLnNhbXBsZSggcG90ZW50aWFsQWN0aW9ucyApO1xuICAgICAgYWN0aW9uKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXNwbGF5Ll9pbnB1dC5jdXJyZW50bHlGaXJpbmdFdmVudHMgPSBmYWxzZTtcblxuICAgIC8vIFNpbmNlIHdlIGRvIGEgbG9jay1vdXQgdG8gc3RvcCByZWVudHJhbnQgZXZlbnRzIGFib3ZlLCB3ZSdsbCBuZWVkIHRvIGZpcmUgYW55IGJhdGNoZWQgZXZlbnRzIHRoYXQgaGF2ZSBhY2N1bXVsYXRlZFxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTQ5Ny4gV2UnbGwgbGlrZWx5IGdldCBzb21lIGZvY3VzIGV2ZW50cyB0aGF0IG5lZWQgdG8gZmlyZVxuICAgIC8vIGZvciBjb3JyZWN0bmVzcywgYmVmb3JlIHdlIGNvbnRpbnVlIG9uLlxuICAgIHRoaXMuZGlzcGxheS5faW5wdXQuZmlyZUJhdGNoZWRFdmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdG91Y2ggZXZlbnQgZnJvbSBtdWx0aXBsZSB0b3VjaCBcIml0ZW1zXCIuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIG1haW4gZXZlbnQgdHlwZSwgZS5nLiAndG91Y2htb3ZlJy5cbiAgICogQHBhcmFtIHtBcnJheS48T2JqZWN0Pn0gdG91Y2hlcyAtIEEgc3Vic2V0IG9mIHRvdWNoIG9iamVjdHMgc3RvcmVkIG9uIHRoZSBmdXp6ZXIgaXRzZWxmLlxuICAgKiBAcmV0dXJucyB7RXZlbnR9IC0gSWYgcG9zc2libGUgYSBUb3VjaEV2ZW50LCBidXQgbWF5IGJlIGEgQ3VzdG9tRXZlbnRcbiAgICovXG4gIGNyZWF0ZVRvdWNoRXZlbnQoIHR5cGUsIHRvdWNoZXMgKSB7XG4gICAgY29uc3QgZG9tRWxlbWVudCA9IHRoaXMuZGlzcGxheS5kb21FbGVtZW50O1xuXG4gICAgLy8gQSBzcGVjaWZpY2F0aW9uIHRoYXQgbG9va3MgbGlrZSBhIFRvdWNoIG9iamVjdCAoYW5kIG1heSBiZSB1c2VkIHRvIGNyZWF0ZSBvbmUpXG4gICAgY29uc3QgdG91Y2hJdGVtcyA9IHRvdWNoZXMubWFwKCB0b3VjaCA9PiAoIHtcbiAgICAgIGlkZW50aWZpZXI6IHRvdWNoLmlkLFxuICAgICAgdGFyZ2V0OiBkb21FbGVtZW50LFxuICAgICAgY2xpZW50WDogdG91Y2gucG9zaXRpb24ueCxcbiAgICAgIGNsaWVudFk6IHRvdWNoLnBvc2l0aW9uLnlcbiAgICB9ICkgKTtcblxuICAgIC8vIENoZWNrIGlmIHdlIGNhbiB1c2UgVG91Y2gvVG91Y2hFdmVudCBjb25zdHJ1Y3RvcnMsIHNlZSBodHRwczovL3d3dy5jaHJvbWVzdGF0dXMuY29tL2ZlYXR1cmUvNDkyMzI1NTQ3OTU5OTEwNFxuICAgIGlmICggd2luZG93LlRvdWNoICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgIHdpbmRvdy5Ub3VjaEV2ZW50ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgIHdpbmRvdy5Ub3VjaC5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgIHdpbmRvdy5Ub3VjaEV2ZW50Lmxlbmd0aCA9PT0gMSApIHtcbiAgICAgIGNvbnN0IHJhd1RvdWNoZXMgPSB0b3VjaEl0ZW1zLm1hcCggdG91Y2hJdGVtID0+IG5ldyB3aW5kb3cuVG91Y2goIHRvdWNoSXRlbSApICk7XG5cbiAgICAgIHJldHVybiBuZXcgd2luZG93LlRvdWNoRXZlbnQoIHR5cGUsIHtcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgdG91Y2hlczogcmF3VG91Y2hlcyxcbiAgICAgICAgdGFyZ2V0VG91Y2hlczogW10sXG4gICAgICAgIGNoYW5nZWRUb3VjaGVzOiByYXdUb3VjaGVzLFxuICAgICAgICBzaGlmdEtleTogZmFsc2UgLy8gVE9ETzogRG8gd2UgbmVlZCB0aGlzPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgfSApO1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2UsIHVzZSBhIEN1c3RvbUV2ZW50IGFuZCBcImZha2VcIiBpdC5cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoICdDdXN0b21FdmVudCcgKTtcbiAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudCggdHlwZSwgdHJ1ZSwgdHJ1ZSwge1xuICAgICAgICB0b3VjaGVzOiB0b3VjaEl0ZW1zLFxuICAgICAgICB0YXJnZXRUb3VjaGVzOiBbXSxcbiAgICAgICAgY2hhbmdlZFRvdWNoZXM6IHRvdWNoSXRlbXNcbiAgICAgIH0gKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHJhbmRvbSBwb3NpdGlvbiBzb21ld2hlcmUgaW4gdGhlIGRpc3BsYXkncyBnbG9iYWwgY29vcmRpbmF0ZXMuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxuICAgKi9cbiAgZ2V0UmFuZG9tUG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKFxuICAgICAgTWF0aC5mbG9vciggdGhpcy5yYW5kb20ubmV4dERvdWJsZSgpICogdGhpcy5kaXNwbGF5LndpZHRoICksXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLnJhbmRvbS5uZXh0RG91YmxlKCkgKiB0aGlzLmRpc3BsYXkuaGVpZ2h0IClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB0b3VjaCBmcm9tIGEgcG9zaXRpb24gKGFuZCBhZGRzIGl0KS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvblxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKi9cbiAgY3JlYXRlVG91Y2goIHBvc2l0aW9uICkge1xuICAgIGNvbnN0IHRvdWNoID0ge1xuICAgICAgaWQ6IHRoaXMubmV4dFRvdWNoSUQrKyxcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvblxuICAgIH07XG4gICAgdGhpcy50b3VjaGVzLnB1c2goIHRvdWNoICk7XG4gICAgcmV0dXJuIHRvdWNoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSB0b3VjaCBmcm9tIG91ciBsaXN0LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gdG91Y2hcbiAgICovXG4gIHJlbW92ZVRvdWNoKCB0b3VjaCApIHtcbiAgICB0aGlzLnRvdWNoZXMuc3BsaWNlKCB0aGlzLnRvdWNoZXMuaW5kZXhPZiggdG91Y2ggKSwgMSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgdG91Y2hTdGFydCBmb3IgdGhlIGdpdmVuIHRvdWNoLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gdG91Y2hcbiAgICovXG4gIHRvdWNoU3RhcnQoIHRvdWNoICkge1xuICAgIGNvbnN0IGV2ZW50ID0gdGhpcy5jcmVhdGVUb3VjaEV2ZW50KCAndG91Y2hzdGFydCcsIFsgdG91Y2ggXSApO1xuXG4gICAgdGhpcy5kaXNwbGF5Ll9pbnB1dC52YWxpZGF0ZVBvaW50ZXJzKCk7XG4gICAgdGhpcy5kaXNwbGF5Ll9pbnB1dC50b3VjaFN0YXJ0KCB0b3VjaC5pZCwgdG91Y2gucG9zaXRpb24sIG5ldyBFdmVudENvbnRleHQoIGV2ZW50ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIHRvdWNoTW92ZSBmb3IgdGhlIGdpdmVuIHRvdWNoICh0byBhIHJhbmRvbSBwb3NpdGlvbiBpbiB0aGUgZGlzcGxheSkuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0b3VjaFxuICAgKi9cbiAgdG91Y2hNb3ZlKCB0b3VjaCApIHtcbiAgICB0b3VjaC5wb3NpdGlvbiA9IHRoaXMuZ2V0UmFuZG9tUG9zaXRpb24oKTtcblxuICAgIGNvbnN0IGV2ZW50ID0gdGhpcy5jcmVhdGVUb3VjaEV2ZW50KCAndG91Y2htb3ZlJywgWyB0b3VjaCBdICk7XG5cbiAgICB0aGlzLmRpc3BsYXkuX2lucHV0LnZhbGlkYXRlUG9pbnRlcnMoKTtcbiAgICB0aGlzLmRpc3BsYXkuX2lucHV0LnRvdWNoTW92ZSggdG91Y2guaWQsIHRvdWNoLnBvc2l0aW9uLCBuZXcgRXZlbnRDb250ZXh0KCBldmVudCApICk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgYSB0b3VjaEVuZCBmb3IgdGhlIGdpdmVuIHRvdWNoLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gdG91Y2hcbiAgICovXG4gIHRvdWNoRW5kKCB0b3VjaCApIHtcbiAgICBjb25zdCBldmVudCA9IHRoaXMuY3JlYXRlVG91Y2hFdmVudCggJ3RvdWNoZW5kJywgWyB0b3VjaCBdICk7XG5cbiAgICB0aGlzLmRpc3BsYXkuX2lucHV0LnZhbGlkYXRlUG9pbnRlcnMoKTtcbiAgICB0aGlzLmRpc3BsYXkuX2lucHV0LnRvdWNoRW5kKCB0b3VjaC5pZCwgdG91Y2gucG9zaXRpb24sIG5ldyBFdmVudENvbnRleHQoIGV2ZW50ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIHRvdWNoQ2FuY2VsIGZvciB0aGUgZ2l2ZW4gdG91Y2guXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0b3VjaFxuICAgKi9cbiAgdG91Y2hDYW5jZWwoIHRvdWNoICkge1xuICAgIGNvbnN0IGV2ZW50ID0gdGhpcy5jcmVhdGVUb3VjaEV2ZW50KCAndG91Y2hjYW5jZWwnLCBbIHRvdWNoIF0gKTtcblxuICAgIHRoaXMuZGlzcGxheS5faW5wdXQudmFsaWRhdGVQb2ludGVycygpO1xuICAgIHRoaXMuZGlzcGxheS5faW5wdXQudG91Y2hDYW5jZWwoIHRvdWNoLmlkLCB0b3VjaC5wb3NpdGlvbiwgbmV3IEV2ZW50Q29udGV4dCggZXZlbnQgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgbW91c2UgdG9nZ2xlIChzd2l0Y2hpbmcgZnJvbSBkb3duID0+IHVwIG9yIHZpY2UgdmVyc2EpLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbW91c2VUb2dnbGUoKSB7XG4gICAgY29uc3QgZG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCggJ01vdXNlRXZlbnQnICk7XG5cbiAgICAvLyB0ZWNobmljYWxseSBkZXByZWNhdGVkLCBidXQgRE9NNCBldmVudCBjb25zdHJ1Y3RvcnMgbm90IG91dCB5ZXQuIHBlb3BsZSBvbiAjd2hhdHdnIHNhaWQgdG8gdXNlIGl0XG4gICAgZG9tRXZlbnQuaW5pdE1vdXNlRXZlbnQoIHRoaXMuaXNNb3VzZURvd24gPyAnbW91c2V1cCcgOiAnbW91c2Vkb3duJywgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCAvLyBjbGljayBjb3VudFxuICAgICAgdGhpcy5tb3VzZVBvc2l0aW9uLngsIHRoaXMubW91c2VQb3NpdGlvbi55LCB0aGlzLm1vdXNlUG9zaXRpb24ueCwgdGhpcy5tb3VzZVBvc2l0aW9uLnksXG4gICAgICBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSxcbiAgICAgIDAsIC8vIGJ1dHRvblxuICAgICAgbnVsbCApO1xuXG4gICAgdGhpcy5kaXNwbGF5Ll9pbnB1dC52YWxpZGF0ZVBvaW50ZXJzKCk7XG5cbiAgICBpZiAoIHRoaXMuaXNNb3VzZURvd24gKSB7XG4gICAgICB0aGlzLmRpc3BsYXkuX2lucHV0Lm1vdXNlVXAoIHRoaXMubW91c2VQb3NpdGlvbiwgbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSApO1xuICAgICAgdGhpcy5pc01vdXNlRG93biA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZGlzcGxheS5faW5wdXQubW91c2VEb3duKCBudWxsLCB0aGlzLm1vdXNlUG9zaXRpb24sIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICkgKTtcbiAgICAgIHRoaXMuaXNNb3VzZURvd24gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIG1vdXNlIG1vdmUgKHRvIGEgcmFuZG9tIHBvc2l0aW9uIGluIHRoZSBkaXNwbGF5KS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1vdXNlTW92ZSgpIHtcbiAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSB0aGlzLmdldFJhbmRvbVBvc2l0aW9uKCk7XG5cbiAgICAvLyBvdXIgbW92ZSBldmVudFxuICAgIGNvbnN0IGRvbUV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoICdNb3VzZUV2ZW50JyApOyAvLyBub3QgJ01vdXNlRXZlbnRzJyBhY2NvcmRpbmcgdG8gRE9NIExldmVsIDMgc3BlY1xuXG4gICAgLy8gdGVjaG5pY2FsbHkgZGVwcmVjYXRlZCwgYnV0IERPTTQgZXZlbnQgY29uc3RydWN0b3JzIG5vdCBvdXQgeWV0LiBwZW9wbGUgb24gI3doYXR3ZyBzYWlkIHRvIHVzZSBpdFxuICAgIGRvbUV2ZW50LmluaXRNb3VzZUV2ZW50KCAnbW91c2Vtb3ZlJywgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAwLCAvLyBjbGljayBjb3VudFxuICAgICAgdGhpcy5tb3VzZVBvc2l0aW9uLngsIHRoaXMubW91c2VQb3NpdGlvbi55LCB0aGlzLm1vdXNlUG9zaXRpb24ueCwgdGhpcy5tb3VzZVBvc2l0aW9uLnksXG4gICAgICBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSxcbiAgICAgIDAsIC8vIGJ1dHRvblxuICAgICAgbnVsbCApO1xuXG4gICAgdGhpcy5kaXNwbGF5Ll9pbnB1dC52YWxpZGF0ZVBvaW50ZXJzKCk7XG4gICAgdGhpcy5kaXNwbGF5Ll9pbnB1dC5tb3VzZU1vdmUoIHRoaXMubW91c2VQb3NpdGlvbiwgbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdJbnB1dEZ1enplcicsIElucHV0RnV6emVyICk7XG5leHBvcnQgZGVmYXVsdCBJbnB1dEZ1enplcjsiXSwibmFtZXMiOlsiUmFuZG9tIiwiVmVjdG9yMiIsIkV2ZW50Q29udGV4dCIsInNjZW5lcnkiLCJJbnB1dEZ1enplciIsImZ1enpFdmVudHMiLCJhdmVyYWdlRXZlbnRDb3VudCIsImFsbG93TW91c2UiLCJhbGxvd1RvdWNoIiwibWF4aW11bVBvaW50ZXJDb3VudCIsImFzc2VydCIsImRpc3BsYXkiLCJfaW5wdXQiLCJjdXJyZW50bHlGaXJpbmdFdmVudHMiLCJyYW5kb20iLCJuZXh0RG91YmxlIiwiYWN0aXZlUG9pbnRlckNvdW50IiwidG91Y2hlcyIsImxlbmd0aCIsImlzTW91c2VEb3duIiwiY2FuQWRkUG9pbnRlciIsInBvdGVudGlhbEFjdGlvbnMiLCJwdXNoIiwibW91c2VUb2dnbGVBY3Rpb24iLCJtb3VzZU1vdmVBY3Rpb24iLCJ0b3VjaFN0YXJ0QWN0aW9uIiwidG91Y2hFbmRBY3Rpb24iLCJ0b3VjaENhbmNlbEFjdGlvbiIsInRvdWNoTW92ZUFjdGlvbiIsImFjdGlvbiIsInNhbXBsZSIsImZpcmVCYXRjaGVkRXZlbnRzIiwiY3JlYXRlVG91Y2hFdmVudCIsInR5cGUiLCJkb21FbGVtZW50IiwidG91Y2hJdGVtcyIsIm1hcCIsInRvdWNoIiwiaWRlbnRpZmllciIsImlkIiwidGFyZ2V0IiwiY2xpZW50WCIsInBvc2l0aW9uIiwieCIsImNsaWVudFkiLCJ5Iiwid2luZG93IiwiVG91Y2giLCJ1bmRlZmluZWQiLCJUb3VjaEV2ZW50IiwicmF3VG91Y2hlcyIsInRvdWNoSXRlbSIsImNhbmNlbGFibGUiLCJidWJibGVzIiwidGFyZ2V0VG91Y2hlcyIsImNoYW5nZWRUb3VjaGVzIiwic2hpZnRLZXkiLCJldmVudCIsImRvY3VtZW50IiwiY3JlYXRlRXZlbnQiLCJpbml0Q3VzdG9tRXZlbnQiLCJnZXRSYW5kb21Qb3NpdGlvbiIsIk1hdGgiLCJmbG9vciIsIndpZHRoIiwiaGVpZ2h0IiwiY3JlYXRlVG91Y2giLCJuZXh0VG91Y2hJRCIsInJlbW92ZVRvdWNoIiwic3BsaWNlIiwiaW5kZXhPZiIsInRvdWNoU3RhcnQiLCJ2YWxpZGF0ZVBvaW50ZXJzIiwidG91Y2hNb3ZlIiwidG91Y2hFbmQiLCJ0b3VjaENhbmNlbCIsIm1vdXNlVG9nZ2xlIiwiZG9tRXZlbnQiLCJpbml0TW91c2VFdmVudCIsIm1vdXNlUG9zaXRpb24iLCJtb3VzZVVwIiwibW91c2VEb3duIiwibW91c2VNb3ZlIiwiY29uc3RydWN0b3IiLCJzZWVkIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsU0FBU0MsWUFBWSxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXRELElBQUEsQUFBTUMsY0FBTixNQUFNQTtJQW9ESjs7Ozs7Ozs7R0FRQyxHQUNEQyxXQUFZQyxpQkFBaUIsRUFBRUMsVUFBVSxFQUFFQyxVQUFVLEVBQUVDLG1CQUFtQixFQUFHO1FBQzNFQyxVQUFVQSxPQUFRSixvQkFBb0IsR0FBRyxDQUFDLG9DQUFvQyxFQUFFQSxtQkFBbUI7UUFFbkcsSUFBSSxDQUFDSyxPQUFPLENBQUNDLE1BQU0sQ0FBQ0MscUJBQXFCLEdBQUc7UUFFNUMsb0dBQW9HO1FBQ3BHLDRDQUE0QztRQUM1QyxrRkFBa0Y7UUFDbEYsTUFBUSxJQUFJLENBQUNDLE1BQU0sQ0FBQ0MsVUFBVSxLQUFLLElBQUksSUFBTVQsQ0FBQUEsb0JBQW9CLENBQUEsRUFBTTtZQUNyRSxNQUFNVSxxQkFBcUIsSUFBSSxDQUFDQyxPQUFPLENBQUNDLE1BQU0sR0FBSyxDQUFBLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUksQ0FBQSxHQUFLLGdDQUFnQztZ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