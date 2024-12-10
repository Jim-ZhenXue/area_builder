// Copyright 2019-2024, University of Colorado Boulder
/**
 * An input listener for keyboard-based drag interactions, allowing objects to be moved using the arrow keys or
 * the W, A, S, D keys.
 *
 * Key features:
 * - Supports both discrete (step-based) and continuous (speed-based) dragging modes.
 * - Allows restricting movement to specific axes (e.g., horizontal or vertical only) or allowing free 2D movement.
 * - Configurable drag speed and drag delta values, with separate configurations when the shift key is held for
 *   finer control.
 * - Optionally synchronizes with a 'positionProperty' to allow for model-view coordination with custom transformations
 *   if needed.
 * - Provides hooks for start, drag (movement), and end phases of a drag interaction through callback options.
 * - Includes support for drag bounds, restricting the draggable area within specified model coordinates.
 * - Uses stepTimer for smooth, timed updates during drag operations, especially useful in continuous 'dragSpeed'
 *   mode.
 *
 * Usage:
 * Attach an instance of KeyboardDragListener to a Node via the `addInputListener` method.
 *
 * Example:
 *
 *   const myNode = new Node();
 *   const dragListener = new KeyboardDragListener( {
 *     dragDelta: 2,
 *     shiftDragDelta: 2,
 *     start: (event, listener) => { console.log('Drag started'); },
 *     drag: (event, listener) => { console.log('Dragging'); },
 *     end: (event, listener) => { console.log('Drag ended'); },
 *     positionProperty: myNode.positionProperty,
 *     transform: myNode.getTransform()
 *   } );
 *   myNode.addInputListener(dragListener);
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import CallbackTimer from '../../../axon/js/CallbackTimer.js';
import Property from '../../../axon/js/Property.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import assertMutuallyExclusiveOptions from '../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import optionize from '../../../phet-core/js/optionize.js';
import platform from '../../../phet-core/js/platform.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioAction from '../../../tandem/js/PhetioAction.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { globalKeyStateTracker, KeyboardListener, KeyboardUtils, scenery, SceneryEvent } from '../imports.js';
// 'shift' is not included in any list of keys because we don't want the KeyboardListener to be 'pressed' when only
// the shift key is down. State of the shift key is tracked by the globalKeyStateTracker.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const keyboardDraggingKeys = [
    'arrowLeft',
    'arrowRight',
    'arrowUp',
    'arrowDown',
    'w',
    'a',
    's',
    'd'
];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const leftRightKeys = [
    'arrowLeft',
    'arrowRight',
    'a',
    'd'
];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const upDownKeys = [
    'arrowUp',
    'arrowDown',
    'w',
    's'
];
// We still want to start drag operations when the shift modifier key is pressed, even though it is not
// listed in keys for the listener.
const ignoredShiftPattern = 'shift?+';
// KeyDescriptorProperties for each key that can be pressed to move the object.
const A_KEY_STRING_PROPERTY = new Property(`${ignoredShiftPattern}a`);
const D_KEY_STRING_PROPERTY = new Property(`${ignoredShiftPattern}d`);
const W_KEY_STRING_PROPERTY = new Property(`${ignoredShiftPattern}w`);
const S_KEY_STRING_PROPERTY = new Property(`${ignoredShiftPattern}s`);
const ARROW_LEFT_KEY_STRING_PROPERTY = new Property(`${ignoredShiftPattern}arrowLeft`);
const ARROW_RIGHT_KEY_STRING_PROPERTY = new Property(`${ignoredShiftPattern}arrowRight`);
const ARROW_UP_KEY_STRING_PROPERTY = new Property(`${ignoredShiftPattern}arrowUp`);
const ARROW_DOWN_KEY_STRING_PROPERTY = new Property(`${ignoredShiftPattern}arrowDown`);
const LEFT_RIGHT_KEY_STRING_PROPERTIES = [
    A_KEY_STRING_PROPERTY,
    D_KEY_STRING_PROPERTY,
    ARROW_LEFT_KEY_STRING_PROPERTY,
    ARROW_RIGHT_KEY_STRING_PROPERTY
];
const UP_DOWN_KEY_STRING_PROPERTIES = [
    W_KEY_STRING_PROPERTY,
    S_KEY_STRING_PROPERTY,
    ARROW_UP_KEY_STRING_PROPERTY,
    ARROW_DOWN_KEY_STRING_PROPERTY
];
const ALL_KEY_STRING_PROPERTIES = [
    ...LEFT_RIGHT_KEY_STRING_PROPERTIES,
    ...UP_DOWN_KEY_STRING_PROPERTIES
];
export const KeyboardDragDirectionToKeyStringPropertiesMap = new Map([
    [
        'both',
        ALL_KEY_STRING_PROPERTIES
    ],
    [
        'leftRight',
        LEFT_RIGHT_KEY_STRING_PROPERTIES
    ],
    [
        'upDown',
        UP_DOWN_KEY_STRING_PROPERTIES
    ]
]);
let KeyboardDragListener = class KeyboardDragListener extends KeyboardListener {
    /**
   * Calculates a delta for movement from the time step. Only used for `dragSpeed`. This is bound and added to
   * the stepTimer when dragging starts.
   */ stepForSpeed(dt) {
        assert && assert(this.useDragSpeed, 'This method should only be called when using dragSpeed');
        const shiftKeyDown = globalKeyStateTracker.shiftKeyDown;
        const delta = dt * (shiftKeyDown ? this.shiftDragSpeed : this.dragSpeed);
        this.moveFromDelta(delta);
    }
    /**
   * Given a delta from dragSpeed or dragDelta, determine the direction of movement and move the object accordingly
   * by using the dragAction.
   */ moveFromDelta(delta) {
        let deltaX = 0;
        let deltaY = 0;
        if (this.leftKeyDownProperty.value) {
            deltaX -= delta;
        }
        if (this.rightKeyDownProperty.value) {
            deltaX += delta;
        }
        if (this.upKeyDownProperty.value) {
            deltaY -= delta;
        }
        if (this.downKeyDownProperty.value) {
            deltaY += delta;
        }
        const vectorDelta = new Vector2(deltaX, deltaY);
        // only initiate move if there was some attempted keyboard drag
        if (!vectorDelta.equals(Vector2.ZERO)) {
            this.vectorDelta = vectorDelta;
            this.dragAction.execute();
        }
    }
    /**
   * Convert a point in the view (parent) coordinate frame to the model coordinate frame.
   */ parentToModelPoint(parentPoint) {
        if (this.transform) {
            const transform = this.transform instanceof Transform3 ? this.transform : this.transform.value;
            return transform.inverseDelta2(parentPoint);
        }
        return parentPoint;
    }
    localToParentPoint(localPoint) {
        const target = this.getCurrentTarget();
        return target.localToParentPoint(localPoint);
    }
    /**
   * Returns the drag bounds in model coordinates.
   */ getDragBounds() {
        return this._dragBoundsProperty.value;
    }
    get dragBounds() {
        return this.getDragBounds();
    }
    /**
   * Sets the drag transform of the listener.
   */ setTransform(transform) {
        this._transform = transform;
    }
    set transform(transform) {
        this.setTransform(transform);
    }
    get transform() {
        return this.getTransform();
    }
    /**
   * Returns the transform of the listener.
   */ getTransform() {
        return this._transform;
    }
    /**
   * Getter for the dragSpeed property, see options.dragSpeed for more info.
   */ get dragSpeed() {
        return this._dragSpeed;
    }
    /**
   * Setter for the dragSpeed property, see options.dragSpeed for more info.
   */ set dragSpeed(dragSpeed) {
        this._dragSpeed = dragSpeed;
    }
    /**
   * Getter for the shiftDragSpeed property, see options.shiftDragSpeed for more info.
   */ get shiftDragSpeed() {
        return this._shiftDragSpeed;
    }
    /**
   * Setter for the shiftDragSpeed property, see options.shiftDragSpeed for more info.
   */ set shiftDragSpeed(shiftDragSpeed) {
        this._shiftDragSpeed = shiftDragSpeed;
    }
    /**
   * Getter for the dragDelta property, see options.dragDelta for more info.
   */ get dragDelta() {
        return this._dragDelta;
    }
    /**
   * Setter for the dragDelta property, see options.dragDelta for more info.
   */ set dragDelta(dragDelta) {
        this._dragDelta = dragDelta;
    }
    /**
   * Getter for the shiftDragDelta property, see options.shiftDragDelta for more info.
   */ get shiftDragDelta() {
        return this._shiftDragDelta;
    }
    /**
   * Setter for the shiftDragDelta property, see options.shiftDragDelta for more info.
   */ set shiftDragDelta(shiftDragDelta) {
        this._shiftDragDelta = shiftDragDelta;
    }
    /**
   * Are keys pressed that would move the target Node to the left?
   */ movingLeft() {
        return this.leftKeyDownProperty.value && !this.rightKeyDownProperty.value;
    }
    /**
   * Are keys pressed that would move the target Node to the right?
   */ movingRight() {
        return this.rightKeyDownProperty.value && !this.leftKeyDownProperty.value;
    }
    /**
   * Are keys pressed that would move the target Node up?
   */ movingUp() {
        return this.upKeyDownProperty.value && !this.downKeyDownProperty.value;
    }
    /**
   * Are keys pressed that would move the target Node down?
   */ movingDown() {
        return this.downKeyDownProperty.value && !this.upKeyDownProperty.value;
    }
    /**
   * Get the current target Node of the drag.
   */ getCurrentTarget() {
        assert && assert(this.isPressedProperty.value, 'We have no currentTarget if we are not pressed');
        assert && assert(this._pointer && this._pointer.trail, 'Must have a Pointer with an active trail if we are pressed');
        return this._pointer.trail.lastNode();
    }
    /**
   * Returns true when this listener is currently dragging. The pointer must be assigned (drag started) and it
   * must be attached to this _pointerListener (otherwise it is interacting with another target).
   */ isDragging() {
        return !!this._pointer && this._pointer.attachedListener === this._pointerListener;
    }
    /**
   * Scenery internal. Part of the events API. Do not call directly.
   *
   * Does specific work for the keydown event. This is called during scenery event dispatch, and AFTER any global
   * key state updates. This is important because interruption needs to happen after hotkeyManager has fully processed
   * the key state. And this implementation assumes that the keydown event will happen after Hotkey updates
   * (see startNextKeyboardEvent).
   */ keydown(event) {
        super.keydown(event);
        const domEvent = event.domEvent;
        // If the meta key is down (command key/windows key) prevent movement and do not preventDefault.
        // Meta key + arrow key is a command to go back a page, and we need to allow that. But also, macOS
        // fails to provide keyup events once the meta key is pressed, see
        // http://web.archive.org/web/20160304022453/http://bitspushedaround.com/on-a-few-things-you-may-not-know-about-the-hellish-command-key-and-javascript-events/
        if (domEvent.metaKey) {
            return;
        }
        if (KeyboardUtils.isMovementKey(domEvent)) {
            // Prevent a VoiceOver bug where pressing multiple arrow keys at once causes the AT to send the wrong keys
            // through the keyup event - as a workaround, we only allow one arrow key to be down at a time. If two are pressed
            // down, we immediately interrupt.
            if (platform.safari && this.pressedKeyStringPropertiesProperty.value.length > 1) {
                this.interrupt();
                return;
            }
            // Finally, in this case we are actually going to drag the object. Prevent default behavior so that Safari
            // doesn't play a 'bonk' sound every arrow key press.
            domEvent.preventDefault();
            // Cannot attach a listener to a Pointer that is already attached
            if (this.startNextKeyboardEvent && !event.pointer.isAttached()) {
                // If there are no movement keys down, attach a listener to the Pointer that will tell the AnimatedPanZoomListener
                // to keep this Node in view
                assert && assert(this._pointer === null, 'Pointer should be null at the start of a drag action');
                this._pointer = event.pointer;
                event.pointer.addInputListener(this._pointerListener, true);
                this.dragStartAction.execute(event);
                this.startNextKeyboardEvent = false;
            }
            // If the drag is already started, restart the callback timer on the next keydown event. The Pointer must
            // be attached to this._pointerListener (already dragging) and not another listener (keyboard is interacting
            // with another target).
            if (this.restartTimerNextKeyboardEvent && this.isDragging()) {
                // restart the callback timer
                this.callbackTimer.stop(false);
                this.callbackTimer.start();
                if (this._moveOnHoldDelay > 0) {
                    // fire right away if there is a delay - if there is no delay the timer is going to fire in the next
                    // animation frame and so it would appear that the object makes two steps in one frame
                    this.callbackTimer.fire();
                }
                this.restartTimerNextKeyboardEvent = false;
            }
        }
    }
    /**
   * Apply a mapping from the drag target's model position to an allowed model position.
   *
   * A common example is using dragBounds, where the position of the drag target is constrained to within a bounding
   * box. This is done by mapping points outside the bounding box to the closest position inside the box. More
   * general mappings can be used.
   *
   * Should be overridden (or use mapPosition) if a custom transformation is needed.
   *
   * @returns - A point in the model coordinate frame
   */ mapModelPoint(modelPoint) {
        if (this._mapPosition) {
            return this._mapPosition(modelPoint);
        } else if (this._dragBoundsProperty.value) {
            return this._dragBoundsProperty.value.closestPointTo(modelPoint);
        } else {
            return modelPoint;
        }
    }
    /**
   * If the pointer is set, remove the listener from it and clear the reference.
   */ clearPointer() {
        if (this._pointer) {
            assert && assert(this._pointer.listeners.includes(this._pointerListener), 'A reference to the Pointer means it should have the pointerListener');
            this._pointer.removeInputListener(this._pointerListener);
            this._pointer = null;
        }
    }
    /**
   * Make eligible for garbage collection.
   */ dispose() {
        this.interrupt();
        this._disposeKeyboardDragListener();
        super.dispose();
    }
    constructor(providedOptions){
        // Use either dragSpeed or dragDelta, cannot use both at the same time.
        assert && assertMutuallyExclusiveOptions(providedOptions, [
            'dragSpeed',
            'shiftDragSpeed'
        ], [
            'dragDelta',
            'shiftDragDelta'
        ]);
        // 'move on hold' timings are only relevant for 'delta' implementations of dragging
        assert && assertMutuallyExclusiveOptions(providedOptions, [
            'dragSpeed'
        ], [
            'moveOnHoldDelay',
            'moveOnHoldInterval'
        ]);
        assert && assertMutuallyExclusiveOptions(providedOptions, [
            'mapPosition'
        ], [
            'dragBoundsProperty'
        ]);
        // If you provide a dragBoundsProperty, you must provide either a positionProperty or use translateNode.
        // KeyboardDragListener operates on deltas and without translating the Node or using a positionProperty there
        // is no way to know where the drag target is or how to constrain it in the drag bounds.
        assert && assert(!providedOptions || !providedOptions.dragBoundsProperty || providedOptions.positionProperty || providedOptions.translateNode, 'If you provide a dragBoundsProperty, you must provide either a positionProperty or use translateNode.');
        const options = optionize()({
            // default moves the object roughly 600 view coordinates every second, assuming 60 fps
            dragDelta: 10,
            shiftDragDelta: 5,
            dragSpeed: 0,
            shiftDragSpeed: 0,
            keyboardDragDirection: 'both',
            positionProperty: null,
            transform: null,
            dragBoundsProperty: null,
            mapPosition: null,
            translateNode: false,
            start: null,
            drag: null,
            end: null,
            moveOnHoldDelay: 500,
            moveOnHoldInterval: 400,
            tandem: Tandem.REQUIRED,
            // DragListener by default doesn't allow PhET-iO to trigger drag Action events
            phetioReadOnly: true
        }, providedOptions);
        assert && assert(options.shiftDragSpeed <= options.dragSpeed, 'shiftDragSpeed should be less than or equal to shiftDragSpeed, it is intended to provide more fine-grained control');
        assert && assert(options.shiftDragDelta <= options.dragDelta, 'shiftDragDelta should be less than or equal to dragDelta, it is intended to provide more fine-grained control');
        const keyStringProperties = KeyboardDragDirectionToKeyStringPropertiesMap.get(options.keyboardDragDirection);
        assert && assert(keyStringProperties, 'Invalid keyboardDragDirection');
        const superOptions = optionize()({
            keyStringProperties: keyStringProperties
        }, options);
        super(superOptions), // Properties internal to the listener that track pressed keys. Instead of updating in the KeyboardListener
        // callback, the positionProperty is updated in a callback timer depending on the state of these Properties
        // so that movement is smooth.
        this.leftKeyDownProperty = new TinyProperty(false), this.rightKeyDownProperty = new TinyProperty(false), this.upKeyDownProperty = new TinyProperty(false), this.downKeyDownProperty = new TinyProperty(false), // KeyboardDragListener is implemented with KeyboardListener and therefore Hotkey. Hotkeys use 'global' DOM events
        // instead of SceneryEvent dispatch. In order to start the drag with a SceneryEvent, this listener waits
        // to start until its keys are pressed, and it starts the drag on the next SceneryEvent from keydown dispatch.
        this.startNextKeyboardEvent = false, // Similar to the above, but used for restarting the callback timer on the next keydown event when a new key is
        // pressed.
        this.restartTimerNextKeyboardEvent = false, // The vector delta in model coordinates that is used to move the object during a drag operation.
        this.modelDelta = new Vector2(0, 0), // The current drag point in the model coordinate frame.
        this.modelPoint = new Vector2(0, 0), // The proposed delta in model coordinates, before mapping or other constraints are applied.
        this.vectorDelta = new Vector2(0, 0);
        // pressedKeysProperty comes from KeyboardListener, and it is used to determine the state of the movement keys.
        // This approach gives more control over the positionProperty in the callbackTimer than using the KeyboardListener
        // callback.
        this.pressedKeyStringPropertiesProperty.link((pressedKeyStringProperties)=>{
            this.leftKeyDownProperty.value = pressedKeyStringProperties.includes(ARROW_LEFT_KEY_STRING_PROPERTY) || pressedKeyStringProperties.includes(A_KEY_STRING_PROPERTY);
            this.rightKeyDownProperty.value = pressedKeyStringProperties.includes(ARROW_RIGHT_KEY_STRING_PROPERTY) || pressedKeyStringProperties.includes(D_KEY_STRING_PROPERTY);
            this.upKeyDownProperty.value = pressedKeyStringProperties.includes(ARROW_UP_KEY_STRING_PROPERTY) || pressedKeyStringProperties.includes(W_KEY_STRING_PROPERTY);
            this.downKeyDownProperty.value = pressedKeyStringProperties.includes(ARROW_DOWN_KEY_STRING_PROPERTY) || pressedKeyStringProperties.includes(S_KEY_STRING_PROPERTY);
        });
        // Mutable attributes declared from options, see options for info, as well as getters and setters.
        this._start = options.start;
        this._drag = options.drag;
        this._end = options.end;
        this._dragBoundsProperty = options.dragBoundsProperty || new Property(null);
        this._mapPosition = options.mapPosition;
        this._translateNode = options.translateNode;
        this._transform = options.transform;
        this._positionProperty = options.positionProperty;
        this._dragSpeed = options.dragSpeed;
        this._shiftDragSpeed = options.shiftDragSpeed;
        this._dragDelta = options.dragDelta;
        this._shiftDragDelta = options.shiftDragDelta;
        this._moveOnHoldDelay = options.moveOnHoldDelay;
        // Since dragSpeed and dragDelta are mutually-exclusive drag implementations, a value for either one of these
        // options indicates we should use a speed implementation for dragging.
        this.useDragSpeed = options.dragSpeed > 0 || options.shiftDragSpeed > 0;
        this.dragStartAction = new PhetioAction((event)=>{
            this._start && this._start(event, this);
            // If using dragSpeed, add the listener to the stepTimer to start animated dragging. For dragDelta, the
            // callbackTimer is started every key press, see addStartCallbackTimerListener below.
            if (this.useDragSpeed) {
                stepTimer.addListener(this.boundStepListener);
            }
        }, {
            parameters: [
                {
                    name: 'event',
                    phetioType: SceneryEvent.SceneryEventIO
                }
            ],
            tandem: options.tandem.createTandem('dragStartAction'),
            phetioDocumentation: 'Emits whenever a keyboard drag starts.',
            phetioReadOnly: options.phetioReadOnly,
            phetioEventType: EventType.USER
        });
        // The drag action only executes when there is actual movement (modelDelta is non-zero). For example, it does
        // NOT execute if conflicting keys are pressed (e.g. left and right arrow keys at the same time). Note that this
        // is expected to be executed from the CallbackTimer. So there will be problems if this can be executed from
        // PhET-iO clients.
        this.dragAction = new PhetioAction(()=>{
            assert && assert(this.isPressedProperty.value, 'The listener should not be dragging if not pressed');
            // Convert the proposed delta to model coordinates
            if (options.transform) {
                const transform = options.transform instanceof Transform3 ? options.transform : options.transform.value;
                this.modelDelta = transform.inverseDelta2(this.vectorDelta);
            } else {
                this.modelDelta = this.vectorDelta;
            }
            // Apply translation to the view coordinate frame.
            if (this._translateNode) {
                let newPosition = this.getCurrentTarget().translation.plus(this.vectorDelta);
                newPosition = this.mapModelPoint(newPosition);
                this.getCurrentTarget().translation = newPosition;
                this.modelPoint = this.parentToModelPoint(newPosition);
            }
            // Synchronize with model position.
            if (this._positionProperty) {
                let newPosition = this._positionProperty.value.plus(this.modelDelta);
                newPosition = this.mapModelPoint(newPosition);
                this.modelPoint = newPosition;
                // update the position if it is different
                if (!newPosition.equals(this._positionProperty.value)) {
                    this._positionProperty.value = newPosition;
                }
            }
            // the optional drag function at the end of any movement
            if (this._drag) {
                assert && assert(this._pointer, 'the pointer must be assigned at the start of a drag action');
                const syntheticEvent = this.createSyntheticEvent(this._pointer);
                this._drag(syntheticEvent, this);
            }
        }, {
            parameters: [],
            tandem: options.tandem.createTandem('dragAction'),
            phetioDocumentation: 'Emits every time there is some input from a keyboard drag.',
            phetioHighFrequency: true,
            phetioReadOnly: options.phetioReadOnly,
            phetioEventType: EventType.USER
        });
        this.dragEndAction = new PhetioAction(()=>{
            if (this.useDragSpeed) {
                stepTimer.removeListener(this.boundStepListener);
            } else {
                this.callbackTimer.stop(false);
            }
            const syntheticEvent = this._pointer ? this.createSyntheticEvent(this._pointer) : null;
            this._end && this._end(syntheticEvent, this);
            this.clearPointer();
        }, {
            parameters: [],
            tandem: options.tandem.createTandem('dragEndAction'),
            phetioDocumentation: 'Emits whenever a keyboard drag ends.',
            phetioReadOnly: options.phetioReadOnly,
            phetioEventType: EventType.USER
        });
        this._pointerListener = {
            listener: this,
            interrupt: this.interrupt.bind(this)
        };
        this._pointer = null;
        // CallbackTimer will be used to support dragDelta callback intervals. It will be restarted whenever there is a
        // new key press so that the object moves every time there is user input. It is stopped when all keys are released.
        this.callbackTimer = new CallbackTimer({
            callback: ()=>{
                const shiftKeyDown = globalKeyStateTracker.shiftKeyDown;
                const delta = shiftKeyDown ? options.shiftDragDelta : options.dragDelta;
                this.moveFromDelta(delta);
            },
            delay: options.moveOnHoldDelay,
            interval: options.moveOnHoldInterval
        });
        // A listener is added to the stepTimer to support dragSpeed. Does not use CallbackTimer because CallbackTimer
        // uses setInterval and may not be called every frame which results in choppy motion, see
        // https://github.com/phetsims/scenery/issues/1638. It is added to the stepTimer when the drag starts and removed
        // when the drag ends.
        this.boundStepListener = this.stepForSpeed.bind(this);
        // When any of the movement keys first go down, start the drag operation on the next keydown event (so that
        // the SceneryEvent is available).
        this.isPressedProperty.lazyLink((dragKeysDown)=>{
            if (dragKeysDown) {
                this.startNextKeyboardEvent = true;
            } else {
                // In case movement keys are released before we get a keydown event (mostly possible during fuzz testing),
                // don't start the next drag action.
                this.startNextKeyboardEvent = false;
                this.restartTimerNextKeyboardEvent = false;
                if (this.isDragging()) {
                    this.dragEndAction.execute();
                }
            }
        });
        // If not the shift key, the drag should start immediately in the direction of the newly pressed key instead
        // of waiting for the next interval. Only important for !useDragSpeed (using CallbackTimer).
        if (!this.useDragSpeed) {
            const addStartCallbackTimerListener = (keyProperty)=>{
                keyProperty.link((keyDown)=>{
                    if (keyDown) {
                        this.restartTimerNextKeyboardEvent = true;
                    }
                });
            };
            addStartCallbackTimerListener(this.leftKeyDownProperty);
            addStartCallbackTimerListener(this.rightKeyDownProperty);
            addStartCallbackTimerListener(this.upKeyDownProperty);
            addStartCallbackTimerListener(this.downKeyDownProperty);
        }
        this._disposeKeyboardDragListener = ()=>{
            this.leftKeyDownProperty.dispose();
            this.rightKeyDownProperty.dispose();
            this.upKeyDownProperty.dispose();
            this.downKeyDownProperty.dispose();
            this.callbackTimer.dispose();
            if (stepTimer.hasListener(this.boundStepListener)) {
                stepTimer.removeListener(this.boundStepListener);
            }
        };
    }
};
scenery.register('KeyboardDragListener', KeyboardDragListener);
export default KeyboardDragListener;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL0tleWJvYXJkRHJhZ0xpc3RlbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFuIGlucHV0IGxpc3RlbmVyIGZvciBrZXlib2FyZC1iYXNlZCBkcmFnIGludGVyYWN0aW9ucywgYWxsb3dpbmcgb2JqZWN0cyB0byBiZSBtb3ZlZCB1c2luZyB0aGUgYXJyb3cga2V5cyBvclxuICogdGhlIFcsIEEsIFMsIEQga2V5cy5cbiAqXG4gKiBLZXkgZmVhdHVyZXM6XG4gKiAtIFN1cHBvcnRzIGJvdGggZGlzY3JldGUgKHN0ZXAtYmFzZWQpIGFuZCBjb250aW51b3VzIChzcGVlZC1iYXNlZCkgZHJhZ2dpbmcgbW9kZXMuXG4gKiAtIEFsbG93cyByZXN0cmljdGluZyBtb3ZlbWVudCB0byBzcGVjaWZpYyBheGVzIChlLmcuLCBob3Jpem9udGFsIG9yIHZlcnRpY2FsIG9ubHkpIG9yIGFsbG93aW5nIGZyZWUgMkQgbW92ZW1lbnQuXG4gKiAtIENvbmZpZ3VyYWJsZSBkcmFnIHNwZWVkIGFuZCBkcmFnIGRlbHRhIHZhbHVlcywgd2l0aCBzZXBhcmF0ZSBjb25maWd1cmF0aW9ucyB3aGVuIHRoZSBzaGlmdCBrZXkgaXMgaGVsZCBmb3JcbiAqICAgZmluZXIgY29udHJvbC5cbiAqIC0gT3B0aW9uYWxseSBzeW5jaHJvbml6ZXMgd2l0aCBhICdwb3NpdGlvblByb3BlcnR5JyB0byBhbGxvdyBmb3IgbW9kZWwtdmlldyBjb29yZGluYXRpb24gd2l0aCBjdXN0b20gdHJhbnNmb3JtYXRpb25zXG4gKiAgIGlmIG5lZWRlZC5cbiAqIC0gUHJvdmlkZXMgaG9va3MgZm9yIHN0YXJ0LCBkcmFnIChtb3ZlbWVudCksIGFuZCBlbmQgcGhhc2VzIG9mIGEgZHJhZyBpbnRlcmFjdGlvbiB0aHJvdWdoIGNhbGxiYWNrIG9wdGlvbnMuXG4gKiAtIEluY2x1ZGVzIHN1cHBvcnQgZm9yIGRyYWcgYm91bmRzLCByZXN0cmljdGluZyB0aGUgZHJhZ2dhYmxlIGFyZWEgd2l0aGluIHNwZWNpZmllZCBtb2RlbCBjb29yZGluYXRlcy5cbiAqIC0gVXNlcyBzdGVwVGltZXIgZm9yIHNtb290aCwgdGltZWQgdXBkYXRlcyBkdXJpbmcgZHJhZyBvcGVyYXRpb25zLCBlc3BlY2lhbGx5IHVzZWZ1bCBpbiBjb250aW51b3VzICdkcmFnU3BlZWQnXG4gKiAgIG1vZGUuXG4gKlxuICogVXNhZ2U6XG4gKiBBdHRhY2ggYW4gaW5zdGFuY2Ugb2YgS2V5Ym9hcmREcmFnTGlzdGVuZXIgdG8gYSBOb2RlIHZpYSB0aGUgYGFkZElucHV0TGlzdGVuZXJgIG1ldGhvZC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgY29uc3QgbXlOb2RlID0gbmV3IE5vZGUoKTtcbiAqICAgY29uc3QgZHJhZ0xpc3RlbmVyID0gbmV3IEtleWJvYXJkRHJhZ0xpc3RlbmVyKCB7XG4gKiAgICAgZHJhZ0RlbHRhOiAyLFxuICogICAgIHNoaWZ0RHJhZ0RlbHRhOiAyLFxuICogICAgIHN0YXJ0OiAoZXZlbnQsIGxpc3RlbmVyKSA9PiB7IGNvbnNvbGUubG9nKCdEcmFnIHN0YXJ0ZWQnKTsgfSxcbiAqICAgICBkcmFnOiAoZXZlbnQsIGxpc3RlbmVyKSA9PiB7IGNvbnNvbGUubG9nKCdEcmFnZ2luZycpOyB9LFxuICogICAgIGVuZDogKGV2ZW50LCBsaXN0ZW5lcikgPT4geyBjb25zb2xlLmxvZygnRHJhZyBlbmRlZCcpOyB9LFxuICogICAgIHBvc2l0aW9uUHJvcGVydHk6IG15Tm9kZS5wb3NpdGlvblByb3BlcnR5LFxuICogICAgIHRyYW5zZm9ybTogbXlOb2RlLmdldFRyYW5zZm9ybSgpXG4gKiAgIH0gKTtcbiAqICAgbXlOb2RlLmFkZElucHV0TGlzdGVuZXIoZHJhZ0xpc3RlbmVyKTtcbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBCYXJsb3dcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQ2FsbGJhY2tUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0NhbGxiYWNrVGltZXIuanMnO1xuaW1wb3J0IHsgRW5hYmxlZENvbXBvbmVudE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0VuYWJsZWRDb21wb25lbnQuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFRyYW5zZm9ybTMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcbmltcG9ydCBQaGV0aW9BY3Rpb24gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0FjdGlvbi5qcyc7XG5pbXBvcnQgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHsgQWxsRHJhZ0xpc3RlbmVyT3B0aW9ucywgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCBLZXlib2FyZExpc3RlbmVyLCBLZXlib2FyZExpc3RlbmVyT3B0aW9ucywgS2V5Ym9hcmRVdGlscywgTm9kZSwgT25lS2V5U3Ryb2tlLCBQRE9NUG9pbnRlciwgc2NlbmVyeSwgU2NlbmVyeUV2ZW50LCBTY2VuZXJ5TGlzdGVuZXJDYWxsYmFjaywgU2NlbmVyeUxpc3RlbmVyTnVsbGFibGVDYWxsYmFjaywgVElucHV0TGlzdGVuZXIgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuLy8gJ3NoaWZ0JyBpcyBub3QgaW5jbHVkZWQgaW4gYW55IGxpc3Qgb2Yga2V5cyBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdGhlIEtleWJvYXJkTGlzdGVuZXIgdG8gYmUgJ3ByZXNzZWQnIHdoZW4gb25seVxuLy8gdGhlIHNoaWZ0IGtleSBpcyBkb3duLiBTdGF0ZSBvZiB0aGUgc2hpZnQga2V5IGlzIHRyYWNrZWQgYnkgdGhlIGdsb2JhbEtleVN0YXRlVHJhY2tlci5cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuY29uc3Qga2V5Ym9hcmREcmFnZ2luZ0tleXMgPSBbICdhcnJvd0xlZnQnLCAnYXJyb3dSaWdodCcsICdhcnJvd1VwJywgJ2Fycm93RG93bicsICd3JywgJ2EnLCAncycsICdkJyBdIGFzIGNvbnN0O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5jb25zdCBsZWZ0UmlnaHRLZXlzID0gWyAnYXJyb3dMZWZ0JywgJ2Fycm93UmlnaHQnLCAnYScsICdkJyBdIGFzIGNvbnN0O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5jb25zdCB1cERvd25LZXlzID0gWyAnYXJyb3dVcCcsICdhcnJvd0Rvd24nLCAndycsICdzJyBdIGFzIGNvbnN0O1xuXG4vLyBXZSBzdGlsbCB3YW50IHRvIHN0YXJ0IGRyYWcgb3BlcmF0aW9ucyB3aGVuIHRoZSBzaGlmdCBtb2RpZmllciBrZXkgaXMgcHJlc3NlZCwgZXZlbiB0aG91Z2ggaXQgaXMgbm90XG4vLyBsaXN0ZWQgaW4ga2V5cyBmb3IgdGhlIGxpc3RlbmVyLlxuY29uc3QgaWdub3JlZFNoaWZ0UGF0dGVybiA9ICdzaGlmdD8rJztcblxuLy8gS2V5RGVzY3JpcHRvclByb3BlcnRpZXMgZm9yIGVhY2gga2V5IHRoYXQgY2FuIGJlIHByZXNzZWQgdG8gbW92ZSB0aGUgb2JqZWN0LlxuY29uc3QgQV9LRVlfU1RSSU5HX1BST1BFUlRZID0gbmV3IFByb3BlcnR5PE9uZUtleVN0cm9rZT4oIGAke2lnbm9yZWRTaGlmdFBhdHRlcm59YWAgKTtcbmNvbnN0IERfS0VZX1NUUklOR19QUk9QRVJUWSA9IG5ldyBQcm9wZXJ0eTxPbmVLZXlTdHJva2U+KCBgJHtpZ25vcmVkU2hpZnRQYXR0ZXJufWRgICk7XG5jb25zdCBXX0tFWV9TVFJJTkdfUFJPUEVSVFkgPSBuZXcgUHJvcGVydHk8T25lS2V5U3Ryb2tlPiggYCR7aWdub3JlZFNoaWZ0UGF0dGVybn13YCApO1xuY29uc3QgU19LRVlfU1RSSU5HX1BST1BFUlRZID0gbmV3IFByb3BlcnR5PE9uZUtleVN0cm9rZT4oIGAke2lnbm9yZWRTaGlmdFBhdHRlcm59c2AgKTtcbmNvbnN0IEFSUk9XX0xFRlRfS0VZX1NUUklOR19QUk9QRVJUWSA9IG5ldyBQcm9wZXJ0eTxPbmVLZXlTdHJva2U+KCBgJHtpZ25vcmVkU2hpZnRQYXR0ZXJufWFycm93TGVmdGAgKTtcbmNvbnN0IEFSUk9XX1JJR0hUX0tFWV9TVFJJTkdfUFJPUEVSVFkgPSBuZXcgUHJvcGVydHk8T25lS2V5U3Ryb2tlPiggYCR7aWdub3JlZFNoaWZ0UGF0dGVybn1hcnJvd1JpZ2h0YCApO1xuY29uc3QgQVJST1dfVVBfS0VZX1NUUklOR19QUk9QRVJUWSA9IG5ldyBQcm9wZXJ0eTxPbmVLZXlTdHJva2U+KCBgJHtpZ25vcmVkU2hpZnRQYXR0ZXJufWFycm93VXBgICk7XG5jb25zdCBBUlJPV19ET1dOX0tFWV9TVFJJTkdfUFJPUEVSVFkgPSBuZXcgUHJvcGVydHk8T25lS2V5U3Ryb2tlPiggYCR7aWdub3JlZFNoaWZ0UGF0dGVybn1hcnJvd0Rvd25gICk7XG5cbmNvbnN0IExFRlRfUklHSFRfS0VZX1NUUklOR19QUk9QRVJUSUVTID0gWyBBX0tFWV9TVFJJTkdfUFJPUEVSVFksIERfS0VZX1NUUklOR19QUk9QRVJUWSwgQVJST1dfTEVGVF9LRVlfU1RSSU5HX1BST1BFUlRZLCBBUlJPV19SSUdIVF9LRVlfU1RSSU5HX1BST1BFUlRZIF07XG5jb25zdCBVUF9ET1dOX0tFWV9TVFJJTkdfUFJPUEVSVElFUyA9IFsgV19LRVlfU1RSSU5HX1BST1BFUlRZLCBTX0tFWV9TVFJJTkdfUFJPUEVSVFksIEFSUk9XX1VQX0tFWV9TVFJJTkdfUFJPUEVSVFksIEFSUk9XX0RPV05fS0VZX1NUUklOR19QUk9QRVJUWSBdO1xuY29uc3QgQUxMX0tFWV9TVFJJTkdfUFJPUEVSVElFUyA9IFsgLi4uTEVGVF9SSUdIVF9LRVlfU1RSSU5HX1BST1BFUlRJRVMsIC4uLlVQX0RPV05fS0VZX1NUUklOR19QUk9QRVJUSUVTIF07XG5cbnR5cGUgS2V5Ym9hcmREcmFnTGlzdGVuZXJLZXlTdHJva2UgPSB0eXBlb2Yga2V5Ym9hcmREcmFnZ2luZ0tleXMgfCB0eXBlb2YgbGVmdFJpZ2h0S2V5cyB8IHR5cGVvZiB1cERvd25LZXlzO1xuXG4vLyBQb3NzaWJsZSBtb3ZlbWVudCB0eXBlcyBmb3IgdGhpcyBLZXlib2FyZERyYWdMaXN0ZW5lci4gMkQgbW90aW9uICgnYm90aCcpIG9yIDFEIG1vdGlvbiAoJ2xlZnRSaWdodCcgb3IgJ3VwRG93bicpLlxudHlwZSBLZXlib2FyZERyYWdEaXJlY3Rpb24gPSAnYm90aCcgfCAnbGVmdFJpZ2h0JyB8ICd1cERvd24nO1xuZXhwb3J0IGNvbnN0IEtleWJvYXJkRHJhZ0RpcmVjdGlvblRvS2V5U3RyaW5nUHJvcGVydGllc01hcCA9IG5ldyBNYXA8S2V5Ym9hcmREcmFnRGlyZWN0aW9uLCBUUHJvcGVydHk8T25lS2V5U3Ryb2tlPltdPiggW1xuICBbICdib3RoJywgQUxMX0tFWV9TVFJJTkdfUFJPUEVSVElFUyBdLFxuICBbICdsZWZ0UmlnaHQnLCBMRUZUX1JJR0hUX0tFWV9TVFJJTkdfUFJPUEVSVElFUyBdLFxuICBbICd1cERvd24nLCBVUF9ET1dOX0tFWV9TVFJJTkdfUFJPUEVSVElFUyBdXG5dICk7XG5cbnR5cGUgTWFwUG9zaXRpb24gPSAoIHBvaW50OiBWZWN0b3IyICkgPT4gVmVjdG9yMjtcblxuZXhwb3J0IHR5cGUgS2V5Ym9hcmREcmFnTGlzdGVuZXJET01FdmVudCA9IEtleWJvYXJkRXZlbnQ7XG5leHBvcnQgdHlwZSBLZXlib2FyZERyYWdMaXN0ZW5lckNhbGxiYWNrPExpc3RlbmVyIGV4dGVuZHMgS2V5Ym9hcmREcmFnTGlzdGVuZXIgPSBLZXlib2FyZERyYWdMaXN0ZW5lcj4gPSBTY2VuZXJ5TGlzdGVuZXJDYWxsYmFjazxMaXN0ZW5lciwgS2V5Ym9hcmREcmFnTGlzdGVuZXJET01FdmVudD47XG5leHBvcnQgdHlwZSBLZXlib2FyZERyYWdMaXN0ZW5lck51bGxhYmxlQ2FsbGJhY2s8TGlzdGVuZXIgZXh0ZW5kcyBLZXlib2FyZERyYWdMaXN0ZW5lciA9IEtleWJvYXJkRHJhZ0xpc3RlbmVyPiA9IFNjZW5lcnlMaXN0ZW5lck51bGxhYmxlQ2FsbGJhY2s8TGlzdGVuZXIsIEtleWJvYXJkRHJhZ0xpc3RlbmVyRE9NRXZlbnQ+O1xuXG50eXBlIFNlbGZPcHRpb25zPExpc3RlbmVyIGV4dGVuZHMgS2V5Ym9hcmREcmFnTGlzdGVuZXI+ID0ge1xuXG4gIC8vIEhvdyBtdWNoIHRoZSBwb3NpdGlvbiBQcm9wZXJ0eSB3aWxsIGNoYW5nZSBpbiB2aWV3IChwYXJlbnQpIGNvb3JkaW5hdGVzIGV2ZXJ5IG1vdmVPbkhvbGRJbnRlcnZhbC4gT2JqZWN0IHdpbGxcbiAgLy8gbW92ZSBpbiBkaXNjcmV0ZSBzdGVwcyBhdCB0aGlzIGludGVydmFsLiBJZiB5b3Ugd291bGQgbGlrZSBzbW9vdGhlciBcImFuaW1hdGVkXCIgbW90aW9uIHVzZSBkcmFnU3BlZWRcbiAgLy8gaW5zdGVhZC4gZHJhZ0RlbHRhIHByb2R1Y2VzIGEgVVggdGhhdCBpcyBtb3JlIHR5cGljYWwgZm9yIGFwcGxpY2F0aW9ucyBidXQgZHJhZ1NwZWVkIGlzIGJldHRlciBmb3IgdmlkZW9cbiAgLy8gZ2FtZS1saWtlIGNvbXBvbmVudHMuIGRyYWdEZWx0YSBhbmQgZHJhZ1NwZWVkIGFyZSBtdXR1YWxseSBleGNsdXNpdmUgb3B0aW9ucy5cbiAgZHJhZ0RlbHRhPzogbnVtYmVyO1xuXG4gIC8vIEhvdyBtdWNoIHRoZSBQb3NpdGlvblByb3BlcnR5IHdpbGwgY2hhbmdlIGluIHZpZXcgKHBhcmVudCkgY29vcmRpbmF0ZXMgZXZlcnkgbW92ZU9uSG9sZEludGVydmFsIHdoaWxlIHRoZSBzaGlmdCBtb2RpZmllclxuICAvLyBrZXkgaXMgcHJlc3NlZC4gU2hpZnQgbW9kaWZpZXIgc2hvdWxkIHByb2R1Y2UgbW9yZSBmaW5lLWdyYWluZWQgbW90aW9uIHNvIHRoaXMgdmFsdWUgbmVlZHMgdG8gYmUgbGVzcyB0aGFuXG4gIC8vIGRyYWdEZWx0YSBpZiBwcm92aWRlZC4gT2JqZWN0IHdpbGwgbW92ZSBpbiBkaXNjcmV0ZSBzdGVwcy4gSWYgeW91IHdvdWxkIGxpa2Ugc21vb3RoZXIgXCJhbmltYXRlZFwiIG1vdGlvbiB1c2VcbiAgLy8gZHJhZ1NwZWVkIG9wdGlvbnMgaW5zdGVhZC4gZHJhZ0RlbHRhIG9wdGlvbnMgcHJvZHVjZSBhIFVYIHRoYXQgaXMgbW9yZSB0eXBpY2FsIGZvciBhcHBsaWNhdGlvbnMgYnV0IGRyYWdTcGVlZFxuICAvLyBpcyBiZXR0ZXIgZm9yIGdhbWUtbGlrZSBjb21wb25lbnRzLiBkcmFnRGVsdGEgYW5kIGRyYWdTcGVlZCBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlIG9wdGlvbnMuXG4gIHNoaWZ0RHJhZ0RlbHRhPzogbnVtYmVyO1xuXG4gIC8vIFdoaWxlIGEgZGlyZWN0aW9uIGtleSBpcyBoZWxkIGRvd24sIHRoZSB0YXJnZXQgd2lsbCBtb3ZlIGJ5IHRoaXMgYW1vdW50IGluIHZpZXcgKHBhcmVudCkgY29vcmRpbmF0ZXMgZXZlcnkgc2Vjb25kLlxuICAvLyBUaGlzIGlzIGFuIGFsdGVybmF0aXZlIHdheSB0byBjb250cm9sIG1vdGlvbiB3aXRoIGtleWJvYXJkIHRoYW4gZHJhZ0RlbHRhIGFuZCBwcm9kdWNlcyBzbW9vdGhlciBtb3Rpb24gZm9yXG4gIC8vIHRoZSBvYmplY3QuIGRyYWdTcGVlZCBhbmQgZHJhZ0RlbHRhIG9wdGlvbnMgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZS4gU2VlIGRyYWdEZWx0YSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgZHJhZ1NwZWVkPzogbnVtYmVyO1xuXG4gIC8vIFdoaWxlIGEgZGlyZWN0aW9uIGtleSBpcyBoZWxkIGRvd24gd2l0aCB0aGUgc2hpZnQgbW9kaWZpZXIga2V5LCB0aGUgdGFyZ2V0IHdpbGwgbW92ZSBieSB0aGlzIGFtb3VudCBpbiBwYXJlbnQgdmlld1xuICAvLyBjb29yZGluYXRlcyBldmVyeSBzZWNvbmQuIFNoaWZ0IG1vZGlmaWVyIHNob3VsZCBwcm9kdWNlIG1vcmUgZmluZS1ncmFpbmVkIG1vdGlvbiBzbyB0aGlzIHZhbHVlIG5lZWRzIHRvIGJlIGxlc3NcbiAgLy8gdGhhbiBkcmFnU3BlZWQgaWYgcHJvdmlkZWQuIFRoaXMgaXMgYW4gYWx0ZXJuYXRpdmUgd2F5IHRvIGNvbnRyb2wgbW90aW9uIHdpdGgga2V5Ym9hcmQgdGhhbiBkcmFnRGVsdGEgYW5kXG4gIC8vIHByb2R1Y2VzIHNtb290aGVyIG1vdGlvbiBmb3IgdGhlIG9iamVjdC4gZHJhZ1NwZWVkIGFuZCBkcmFnRGVsdGEgb3B0aW9ucyBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLiBTZWUgZHJhZ0RlbHRhXG4gIC8vIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICBzaGlmdERyYWdTcGVlZD86IG51bWJlcjtcblxuICAvLyBTcGVjaWZpZXMgdGhlIGRpcmVjdGlvbiBvZiBtb3Rpb24gZm9yIHRoZSBLZXlib2FyZERyYWdMaXN0ZW5lci4gQnkgZGVmYXVsdCwgdGhlIHBvc2l0aW9uIFZlY3RvcjIgY2FuIGNoYW5nZSBpblxuICAvLyBib3RoIGRpcmVjdGlvbnMgYnkgcHJlc3NpbmcgdGhlIGFycm93IGtleXMuIEJ1dCB5b3UgY2FuIGNvbnN0cmFpbiBkcmFnZ2luZyB0byAxRCBsZWZ0LXJpZ2h0IG9yIHVwLWRvd24gbW90aW9uXG4gIC8vIHdpdGggdGhpcyB2YWx1ZS5cbiAga2V5Ym9hcmREcmFnRGlyZWN0aW9uPzogS2V5Ym9hcmREcmFnRGlyZWN0aW9uO1xuXG4gIC8vIEFycm93IGtleXMgbXVzdCBiZSBwcmVzc2VkIHRoaXMgbG9uZyB0byBiZWdpbiBtb3ZlbWVudCBzZXQgb24gbW92ZU9uSG9sZEludGVydmFsLCBpbiBtc1xuICBtb3ZlT25Ib2xkRGVsYXk/OiBudW1iZXI7XG5cbiAgLy8gVGltZSBpbnRlcnZhbCBhdCB3aGljaCB0aGUgb2JqZWN0IHdpbGwgY2hhbmdlIHBvc2l0aW9uIHdoaWxlIHRoZSBhcnJvdyBrZXkgaXMgaGVsZCBkb3duLCBpbiBtcy4gVGhpcyBtdXN0IGJlIGxhcmdlclxuICAvLyB0aGFuIDAgdG8gcHJldmVudCBkcmFnZ2luZyB0aGF0IGlzIGJhc2VkIG9uIGhvdyBvZnRlbiBhbmltYXRpb24tZnJhbWUgc3RlcHMgb2NjdXIuXG4gIG1vdmVPbkhvbGRJbnRlcnZhbD86IG51bWJlcjtcblxufSAmIEFsbERyYWdMaXN0ZW5lck9wdGlvbnM8TGlzdGVuZXIsIEtleWJvYXJkRHJhZ0xpc3RlbmVyRE9NRXZlbnQ+ICZcblxuICAvLyBUaG91Z2ggRHJhZ0xpc3RlbmVyIGlzIG5vdCBpbnN0cnVtZW50ZWQsIGRlY2xhcmUgdGhlc2UgaGVyZSB0byBzdXBwb3J0IHByb3Blcmx5IHBhc3NpbmcgdGhpcyB0byBjaGlsZHJlbiwgc2VlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzYwLlxuICBQaWNrPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nIHwgJ3BoZXRpb1JlYWRPbmx5Jz47XG5cbnR5cGUgUGFyZW50T3B0aW9ucyA9IFN0cmljdE9taXQ8S2V5Ym9hcmRMaXN0ZW5lck9wdGlvbnM8S2V5Ym9hcmREcmFnTGlzdGVuZXJLZXlTdHJva2U+LCAna2V5cyc+O1xuXG5leHBvcnQgdHlwZSBLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMgPSBTZWxmT3B0aW9uczxLZXlib2FyZERyYWdMaXN0ZW5lcj4gJiAvLyBPcHRpb25zIHNwZWNpZmljIHRvIHRoaXMgY2xhc3NcbiAgUGlja09wdGlvbmFsPFBhcmVudE9wdGlvbnMsICdmb2N1cycgfCAnYmx1cic+ICYgLy8gT25seSBmb2N1cy9ibHVyIGFyZSBvcHRpb25hbCBmcm9tIHRoZSBzdXBlcmNsYXNzXG4gIEVuYWJsZWRDb21wb25lbnRPcHRpb25zOyAvLyBPdGhlciBzdXBlcmNsYXNzIG9wdGlvbnMgYXJlIGFsbG93ZWRcblxuY2xhc3MgS2V5Ym9hcmREcmFnTGlzdGVuZXIgZXh0ZW5kcyBLZXlib2FyZExpc3RlbmVyPEtleWJvYXJkRHJhZ0xpc3RlbmVyS2V5U3Ryb2tlPiB7XG5cbiAgLy8gU2VlIG9wdGlvbnMgZm9yIGRvY3VtZW50YXRpb25cbiAgcHJpdmF0ZSByZWFkb25seSBfc3RhcnQ6IEtleWJvYXJkRHJhZ0xpc3RlbmVyQ2FsbGJhY2sgfCBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IF9kcmFnOiBLZXlib2FyZERyYWdMaXN0ZW5lckNhbGxiYWNrIHwgbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBfZW5kOiBLZXlib2FyZERyYWdMaXN0ZW5lck51bGxhYmxlQ2FsbGJhY2sgfCBudWxsO1xuICBwcml2YXRlIF9kcmFnQm91bmRzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczIgfCBudWxsPjtcbiAgcHJpdmF0ZSByZWFkb25seSBfbWFwUG9zaXRpb246IE1hcFBvc2l0aW9uIHwgbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBfdHJhbnNsYXRlTm9kZTogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfdHJhbnNmb3JtOiBUcmFuc2Zvcm0zIHwgVFJlYWRPbmx5UHJvcGVydHk8VHJhbnNmb3JtMz4gfCBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IF9wb3NpdGlvblByb3BlcnR5OiBQaWNrPFRQcm9wZXJ0eTxWZWN0b3IyPiwgJ3ZhbHVlJz4gfCBudWxsO1xuICBwcml2YXRlIF9kcmFnU3BlZWQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBfc2hpZnREcmFnU3BlZWQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBfZHJhZ0RlbHRhOiBudW1iZXI7XG4gIHByaXZhdGUgX3NoaWZ0RHJhZ0RlbHRhOiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgX21vdmVPbkhvbGREZWxheTogbnVtYmVyO1xuXG4gIC8vIFByb3BlcnRpZXMgaW50ZXJuYWwgdG8gdGhlIGxpc3RlbmVyIHRoYXQgdHJhY2sgcHJlc3NlZCBrZXlzLiBJbnN0ZWFkIG9mIHVwZGF0aW5nIGluIHRoZSBLZXlib2FyZExpc3RlbmVyXG4gIC8vIGNhbGxiYWNrLCB0aGUgcG9zaXRpb25Qcm9wZXJ0eSBpcyB1cGRhdGVkIGluIGEgY2FsbGJhY2sgdGltZXIgZGVwZW5kaW5nIG9uIHRoZSBzdGF0ZSBvZiB0aGVzZSBQcm9wZXJ0aWVzXG4gIC8vIHNvIHRoYXQgbW92ZW1lbnQgaXMgc21vb3RoLlxuICBwcml2YXRlIGxlZnRLZXlEb3duUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PGJvb2xlYW4+KCBmYWxzZSApO1xuICBwcml2YXRlIHJpZ2h0S2V5RG93blByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eTxib29sZWFuPiggZmFsc2UgKTtcbiAgcHJpdmF0ZSB1cEtleURvd25Qcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHk8Ym9vbGVhbj4oIGZhbHNlICk7XG4gIHByaXZhdGUgZG93bktleURvd25Qcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHk8Ym9vbGVhbj4oIGZhbHNlICk7XG5cbiAgLy8gRmlyZXMgdG8gY29uZHVjdCB0aGUgc3RhcnQgYW5kIGVuZCBvZiBhIGRyYWcsIGFkZGVkIGZvciBQaEVULWlPIGludGVyb3BlcmFiaWxpdHlcbiAgcHJpdmF0ZSBkcmFnU3RhcnRBY3Rpb246IFBoZXRpb0FjdGlvbjxbIFNjZW5lcnlFdmVudDxLZXlib2FyZERyYWdMaXN0ZW5lckRPTUV2ZW50PiBdPjtcbiAgcHJpdmF0ZSBkcmFnRW5kQWN0aW9uOiBQaGV0aW9BY3Rpb247XG4gIHByaXZhdGUgZHJhZ0FjdGlvbjogUGhldGlvQWN0aW9uO1xuXG4gIC8vIEtleWJvYXJkRHJhZ0xpc3RlbmVyIGlzIGltcGxlbWVudGVkIHdpdGggS2V5Ym9hcmRMaXN0ZW5lciBhbmQgdGhlcmVmb3JlIEhvdGtleS4gSG90a2V5cyB1c2UgJ2dsb2JhbCcgRE9NIGV2ZW50c1xuICAvLyBpbnN0ZWFkIG9mIFNjZW5lcnlFdmVudCBkaXNwYXRjaC4gSW4gb3JkZXIgdG8gc3RhcnQgdGhlIGRyYWcgd2l0aCBhIFNjZW5lcnlFdmVudCwgdGhpcyBsaXN0ZW5lciB3YWl0c1xuICAvLyB0byBzdGFydCB1bnRpbCBpdHMga2V5cyBhcmUgcHJlc3NlZCwgYW5kIGl0IHN0YXJ0cyB0aGUgZHJhZyBvbiB0aGUgbmV4dCBTY2VuZXJ5RXZlbnQgZnJvbSBrZXlkb3duIGRpc3BhdGNoLlxuICBwcml2YXRlIHN0YXJ0TmV4dEtleWJvYXJkRXZlbnQgPSBmYWxzZTtcblxuICAvLyBTaW1pbGFyIHRvIHRoZSBhYm92ZSwgYnV0IHVzZWQgZm9yIHJlc3RhcnRpbmcgdGhlIGNhbGxiYWNrIHRpbWVyIG9uIHRoZSBuZXh0IGtleWRvd24gZXZlbnQgd2hlbiBhIG5ldyBrZXkgaXNcbiAgLy8gcHJlc3NlZC5cbiAgcHJpdmF0ZSByZXN0YXJ0VGltZXJOZXh0S2V5Ym9hcmRFdmVudCA9IGZhbHNlO1xuXG4gIC8vIEltcGxlbWVudHMgZGlzcG9zYWwuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rpc3Bvc2VLZXlib2FyZERyYWdMaXN0ZW5lcjogKCkgPT4gdm9pZDtcblxuICAvLyBBIGxpc3RlbmVyIGFkZGVkIHRvIHRoZSBwb2ludGVyIHdoZW4gZHJhZ2dpbmcgc3RhcnRzIHNvIHRoYXQgd2UgY2FuIGF0dGFjaCBhIGxpc3RlbmVyIGFuZCBwcm92aWRlIGEgY2hhbm5lbCBvZlxuICAvLyBjb21tdW5pY2F0aW9uIHRvIHRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB0byBkZWZpbmUgY3VzdG9tIGJlaGF2aW9yIGZvciBzY3JlZW4gcGFubmluZyBkdXJpbmcgYSBkcmFnIG9wZXJhdGlvbi5cbiAgcHJpdmF0ZSByZWFkb25seSBfcG9pbnRlckxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lcjtcblxuICAvLyBBIHJlZmVyZW5jZSB0byB0aGUgUG9pbnRlciBkdXJpbmcgYSBkcmFnIG9wZXJhdGlvbiBzbyB0aGF0IHdlIGNhbiBhZGQvcmVtb3ZlIHRoZSBfcG9pbnRlckxpc3RlbmVyLlxuICBwcml2YXRlIF9wb2ludGVyOiBQRE9NUG9pbnRlciB8IG51bGw7XG5cbiAgLy8gV2hldGhlciB0aGlzIGxpc3RlbmVyIHVzZXMgYSBzcGVlZCBpbXBsZW1lbnRhdGlvbiBvciBkZWx0YSBpbXBsZW1lbnRhdGlvbiBmb3IgZHJhZ2dpbmcuIFNlZSBvcHRpb25zXG4gIC8vIGRyYWdTcGVlZCBhbmQgZHJhZ0RlbHRhIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICBwcml2YXRlIHJlYWRvbmx5IHVzZURyYWdTcGVlZDogYm9vbGVhbjtcblxuICAvLyBUaGUgdmVjdG9yIGRlbHRhIGluIG1vZGVsIGNvb3JkaW5hdGVzIHRoYXQgaXMgdXNlZCB0byBtb3ZlIHRoZSBvYmplY3QgZHVyaW5nIGEgZHJhZyBvcGVyYXRpb24uXG4gIHB1YmxpYyBtb2RlbERlbHRhOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcblxuICAvLyBUaGUgY3VycmVudCBkcmFnIHBvaW50IGluIHRoZSBtb2RlbCBjb29yZGluYXRlIGZyYW1lLlxuICBwdWJsaWMgbW9kZWxQb2ludDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cbiAgLy8gVGhlIHByb3Bvc2VkIGRlbHRhIGluIG1vZGVsIGNvb3JkaW5hdGVzLCBiZWZvcmUgbWFwcGluZyBvciBvdGhlciBjb25zdHJhaW50cyBhcmUgYXBwbGllZC5cbiAgcHJpdmF0ZSB2ZWN0b3JEZWx0YTogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cbiAgLy8gVGhlIGNhbGxiYWNrIHRpbWVyIHRoYXQgaXMgdXNlZCB0byBtb3ZlIHRoZSBvYmplY3QgZHVyaW5nIGEgZHJhZyBvcGVyYXRpb24gdG8gc3VwcG9ydCBhbmltYXRlZCBtb3Rpb24gYW5kXG4gIC8vIG1vdGlvbiBldmVyeSBtb3ZlT25Ib2xkSW50ZXJ2YWwuXG4gIHByaXZhdGUgcmVhZG9ubHkgY2FsbGJhY2tUaW1lcjogQ2FsbGJhY2tUaW1lcjtcblxuICAvLyBBIGxpc3RlbmVyIGJvdW5kIHRvIHRoaXMgdGhhdCBpcyBhZGRlZCB0byB0aGUgc3RlcFRpbWVyIHRvIHN1cHBvcnQgZHJhZ1NwZWVkIGltcGxlbWVudGF0aW9ucy4gQWRkZWQgYW5kIHJlbW92ZWRcbiAgLy8gYXMgZHJhZyBzdGFydHMvZW5kcy5cbiAgcHJpdmF0ZSByZWFkb25seSBib3VuZFN0ZXBMaXN0ZW5lcjogKCAoIGR0OiBudW1iZXIgKSA9PiB2b2lkICk7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMgKSB7XG5cbiAgICAvLyBVc2UgZWl0aGVyIGRyYWdTcGVlZCBvciBkcmFnRGVsdGEsIGNhbm5vdCB1c2UgYm90aCBhdCB0aGUgc2FtZSB0aW1lLlxuICAgIGFzc2VydCAmJiBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHByb3ZpZGVkT3B0aW9ucywgWyAnZHJhZ1NwZWVkJywgJ3NoaWZ0RHJhZ1NwZWVkJyBdLCBbICdkcmFnRGVsdGEnLCAnc2hpZnREcmFnRGVsdGEnIF0gKTtcblxuICAgIC8vICdtb3ZlIG9uIGhvbGQnIHRpbWluZ3MgYXJlIG9ubHkgcmVsZXZhbnQgZm9yICdkZWx0YScgaW1wbGVtZW50YXRpb25zIG9mIGRyYWdnaW5nXG4gICAgYXNzZXJ0ICYmIGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyggcHJvdmlkZWRPcHRpb25zLCBbICdkcmFnU3BlZWQnIF0sIFsgJ21vdmVPbkhvbGREZWxheScsICdtb3ZlT25Ib2xkSW50ZXJ2YWwnIF0gKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBwcm92aWRlZE9wdGlvbnMsIFsgJ21hcFBvc2l0aW9uJyBdLCBbICdkcmFnQm91bmRzUHJvcGVydHknIF0gKTtcblxuICAgIC8vIElmIHlvdSBwcm92aWRlIGEgZHJhZ0JvdW5kc1Byb3BlcnR5LCB5b3UgbXVzdCBwcm92aWRlIGVpdGhlciBhIHBvc2l0aW9uUHJvcGVydHkgb3IgdXNlIHRyYW5zbGF0ZU5vZGUuXG4gICAgLy8gS2V5Ym9hcmREcmFnTGlzdGVuZXIgb3BlcmF0ZXMgb24gZGVsdGFzIGFuZCB3aXRob3V0IHRyYW5zbGF0aW5nIHRoZSBOb2RlIG9yIHVzaW5nIGEgcG9zaXRpb25Qcm9wZXJ0eSB0aGVyZVxuICAgIC8vIGlzIG5vIHdheSB0byBrbm93IHdoZXJlIHRoZSBkcmFnIHRhcmdldCBpcyBvciBob3cgdG8gY29uc3RyYWluIGl0IGluIHRoZSBkcmFnIGJvdW5kcy5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhcHJvdmlkZWRPcHRpb25zIHx8XG4gICAgICAgICAgICAgICAgICAgICAgIXByb3ZpZGVkT3B0aW9ucy5kcmFnQm91bmRzUHJvcGVydHkgfHxcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnMucG9zaXRpb25Qcm9wZXJ0eSB8fCBwcm92aWRlZE9wdGlvbnMudHJhbnNsYXRlTm9kZSxcbiAgICAgICdJZiB5b3UgcHJvdmlkZSBhIGRyYWdCb3VuZHNQcm9wZXJ0eSwgeW91IG11c3QgcHJvdmlkZSBlaXRoZXIgYSBwb3NpdGlvblByb3BlcnR5IG9yIHVzZSB0cmFuc2xhdGVOb2RlLicgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zLCBTZWxmT3B0aW9uczxLZXlib2FyZERyYWdMaXN0ZW5lcj4sIFBhcmVudE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gZGVmYXVsdCBtb3ZlcyB0aGUgb2JqZWN0IHJvdWdobHkgNjAwIHZpZXcgY29vcmRpbmF0ZXMgZXZlcnkgc2Vjb25kLCBhc3N1bWluZyA2MCBmcHNcbiAgICAgIGRyYWdEZWx0YTogMTAsXG4gICAgICBzaGlmdERyYWdEZWx0YTogNSxcbiAgICAgIGRyYWdTcGVlZDogMCxcbiAgICAgIHNoaWZ0RHJhZ1NwZWVkOiAwLFxuICAgICAga2V5Ym9hcmREcmFnRGlyZWN0aW9uOiAnYm90aCcsXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBudWxsLFxuICAgICAgdHJhbnNmb3JtOiBudWxsLFxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBudWxsLFxuICAgICAgbWFwUG9zaXRpb246IG51bGwsXG4gICAgICB0cmFuc2xhdGVOb2RlOiBmYWxzZSxcbiAgICAgIHN0YXJ0OiBudWxsLFxuICAgICAgZHJhZzogbnVsbCxcbiAgICAgIGVuZDogbnVsbCxcbiAgICAgIG1vdmVPbkhvbGREZWxheTogNTAwLFxuICAgICAgbW92ZU9uSG9sZEludGVydmFsOiA0MDAsXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcblxuICAgICAgLy8gRHJhZ0xpc3RlbmVyIGJ5IGRlZmF1bHQgZG9lc24ndCBhbGxvdyBQaEVULWlPIHRvIHRyaWdnZXIgZHJhZyBBY3Rpb24gZXZlbnRzXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zaGlmdERyYWdTcGVlZCA8PSBvcHRpb25zLmRyYWdTcGVlZCwgJ3NoaWZ0RHJhZ1NwZWVkIHNob3VsZCBiZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gc2hpZnREcmFnU3BlZWQsIGl0IGlzIGludGVuZGVkIHRvIHByb3ZpZGUgbW9yZSBmaW5lLWdyYWluZWQgY29udHJvbCcgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNoaWZ0RHJhZ0RlbHRhIDw9IG9wdGlvbnMuZHJhZ0RlbHRhLCAnc2hpZnREcmFnRGVsdGEgc2hvdWxkIGJlIGxlc3MgdGhhbiBvciBlcXVhbCB0byBkcmFnRGVsdGEsIGl0IGlzIGludGVuZGVkIHRvIHByb3ZpZGUgbW9yZSBmaW5lLWdyYWluZWQgY29udHJvbCcgKTtcblxuICAgIGNvbnN0IGtleVN0cmluZ1Byb3BlcnRpZXMgPSBLZXlib2FyZERyYWdEaXJlY3Rpb25Ub0tleVN0cmluZ1Byb3BlcnRpZXNNYXAuZ2V0KCBvcHRpb25zLmtleWJvYXJkRHJhZ0RpcmVjdGlvbiApITtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXlTdHJpbmdQcm9wZXJ0aWVzLCAnSW52YWxpZCBrZXlib2FyZERyYWdEaXJlY3Rpb24nICk7XG5cbiAgICBjb25zdCBzdXBlck9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBLZXlib2FyZExpc3RlbmVyT3B0aW9uczxLZXlib2FyZERyYWdMaXN0ZW5lcktleVN0cm9rZT4+KCkoIHtcbiAgICAgIGtleVN0cmluZ1Byb3BlcnRpZXM6IGtleVN0cmluZ1Byb3BlcnRpZXNcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICBzdXBlciggc3VwZXJPcHRpb25zICk7XG5cbiAgICAvLyBwcmVzc2VkS2V5c1Byb3BlcnR5IGNvbWVzIGZyb20gS2V5Ym9hcmRMaXN0ZW5lciwgYW5kIGl0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBzdGF0ZSBvZiB0aGUgbW92ZW1lbnQga2V5cy5cbiAgICAvLyBUaGlzIGFwcHJvYWNoIGdpdmVzIG1vcmUgY29udHJvbCBvdmVyIHRoZSBwb3NpdGlvblByb3BlcnR5IGluIHRoZSBjYWxsYmFja1RpbWVyIHRoYW4gdXNpbmcgdGhlIEtleWJvYXJkTGlzdGVuZXJcbiAgICAvLyBjYWxsYmFjay5cbiAgICB0aGlzLnByZXNzZWRLZXlTdHJpbmdQcm9wZXJ0aWVzUHJvcGVydHkubGluayggcHJlc3NlZEtleVN0cmluZ1Byb3BlcnRpZXMgPT4ge1xuICAgICAgdGhpcy5sZWZ0S2V5RG93blByb3BlcnR5LnZhbHVlID0gcHJlc3NlZEtleVN0cmluZ1Byb3BlcnRpZXMuaW5jbHVkZXMoIEFSUk9XX0xFRlRfS0VZX1NUUklOR19QUk9QRVJUWSApIHx8IHByZXNzZWRLZXlTdHJpbmdQcm9wZXJ0aWVzLmluY2x1ZGVzKCBBX0tFWV9TVFJJTkdfUFJPUEVSVFkgKTtcbiAgICAgIHRoaXMucmlnaHRLZXlEb3duUHJvcGVydHkudmFsdWUgPSBwcmVzc2VkS2V5U3RyaW5nUHJvcGVydGllcy5pbmNsdWRlcyggQVJST1dfUklHSFRfS0VZX1NUUklOR19QUk9QRVJUWSApIHx8IHByZXNzZWRLZXlTdHJpbmdQcm9wZXJ0aWVzLmluY2x1ZGVzKCBEX0tFWV9TVFJJTkdfUFJPUEVSVFkgKTtcbiAgICAgIHRoaXMudXBLZXlEb3duUHJvcGVydHkudmFsdWUgPSBwcmVzc2VkS2V5U3RyaW5nUHJvcGVydGllcy5pbmNsdWRlcyggQVJST1dfVVBfS0VZX1NUUklOR19QUk9QRVJUWSApIHx8IHByZXNzZWRLZXlTdHJpbmdQcm9wZXJ0aWVzLmluY2x1ZGVzKCBXX0tFWV9TVFJJTkdfUFJPUEVSVFkgKTtcbiAgICAgIHRoaXMuZG93bktleURvd25Qcm9wZXJ0eS52YWx1ZSA9IHByZXNzZWRLZXlTdHJpbmdQcm9wZXJ0aWVzLmluY2x1ZGVzKCBBUlJPV19ET1dOX0tFWV9TVFJJTkdfUFJPUEVSVFkgKSB8fCBwcmVzc2VkS2V5U3RyaW5nUHJvcGVydGllcy5pbmNsdWRlcyggU19LRVlfU1RSSU5HX1BST1BFUlRZICk7XG4gICAgfSApO1xuXG4gICAgLy8gTXV0YWJsZSBhdHRyaWJ1dGVzIGRlY2xhcmVkIGZyb20gb3B0aW9ucywgc2VlIG9wdGlvbnMgZm9yIGluZm8sIGFzIHdlbGwgYXMgZ2V0dGVycyBhbmQgc2V0dGVycy5cbiAgICB0aGlzLl9zdGFydCA9IG9wdGlvbnMuc3RhcnQ7XG4gICAgdGhpcy5fZHJhZyA9IG9wdGlvbnMuZHJhZztcbiAgICB0aGlzLl9lbmQgPSBvcHRpb25zLmVuZDtcbiAgICB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkgPSAoIG9wdGlvbnMuZHJhZ0JvdW5kc1Byb3BlcnR5IHx8IG5ldyBQcm9wZXJ0eSggbnVsbCApICk7XG4gICAgdGhpcy5fbWFwUG9zaXRpb24gPSBvcHRpb25zLm1hcFBvc2l0aW9uO1xuICAgIHRoaXMuX3RyYW5zbGF0ZU5vZGUgPSBvcHRpb25zLnRyYW5zbGF0ZU5vZGU7XG4gICAgdGhpcy5fdHJhbnNmb3JtID0gb3B0aW9ucy50cmFuc2Zvcm07XG4gICAgdGhpcy5fcG9zaXRpb25Qcm9wZXJ0eSA9IG9wdGlvbnMucG9zaXRpb25Qcm9wZXJ0eTtcbiAgICB0aGlzLl9kcmFnU3BlZWQgPSBvcHRpb25zLmRyYWdTcGVlZDtcbiAgICB0aGlzLl9zaGlmdERyYWdTcGVlZCA9IG9wdGlvbnMuc2hpZnREcmFnU3BlZWQ7XG4gICAgdGhpcy5fZHJhZ0RlbHRhID0gb3B0aW9ucy5kcmFnRGVsdGE7XG4gICAgdGhpcy5fc2hpZnREcmFnRGVsdGEgPSBvcHRpb25zLnNoaWZ0RHJhZ0RlbHRhO1xuICAgIHRoaXMuX21vdmVPbkhvbGREZWxheSA9IG9wdGlvbnMubW92ZU9uSG9sZERlbGF5O1xuXG4gICAgLy8gU2luY2UgZHJhZ1NwZWVkIGFuZCBkcmFnRGVsdGEgYXJlIG11dHVhbGx5LWV4Y2x1c2l2ZSBkcmFnIGltcGxlbWVudGF0aW9ucywgYSB2YWx1ZSBmb3IgZWl0aGVyIG9uZSBvZiB0aGVzZVxuICAgIC8vIG9wdGlvbnMgaW5kaWNhdGVzIHdlIHNob3VsZCB1c2UgYSBzcGVlZCBpbXBsZW1lbnRhdGlvbiBmb3IgZHJhZ2dpbmcuXG4gICAgdGhpcy51c2VEcmFnU3BlZWQgPSBvcHRpb25zLmRyYWdTcGVlZCA+IDAgfHwgb3B0aW9ucy5zaGlmdERyYWdTcGVlZCA+IDA7XG5cbiAgICB0aGlzLmRyYWdTdGFydEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oIGV2ZW50ID0+IHtcbiAgICAgIHRoaXMuX3N0YXJ0ICYmIHRoaXMuX3N0YXJ0KCBldmVudCwgdGhpcyApO1xuXG4gICAgICAvLyBJZiB1c2luZyBkcmFnU3BlZWQsIGFkZCB0aGUgbGlzdGVuZXIgdG8gdGhlIHN0ZXBUaW1lciB0byBzdGFydCBhbmltYXRlZCBkcmFnZ2luZy4gRm9yIGRyYWdEZWx0YSwgdGhlXG4gICAgICAvLyBjYWxsYmFja1RpbWVyIGlzIHN0YXJ0ZWQgZXZlcnkga2V5IHByZXNzLCBzZWUgYWRkU3RhcnRDYWxsYmFja1RpbWVyTGlzdGVuZXIgYmVsb3cuXG4gICAgICBpZiAoIHRoaXMudXNlRHJhZ1NwZWVkICkge1xuICAgICAgICBzdGVwVGltZXIuYWRkTGlzdGVuZXIoIHRoaXMuYm91bmRTdGVwTGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwYXJhbWV0ZXJzOiBbIHsgbmFtZTogJ2V2ZW50JywgcGhldGlvVHlwZTogU2NlbmVyeUV2ZW50LlNjZW5lcnlFdmVudElPIH0gXSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ1N0YXJ0QWN0aW9uJyApLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW5ldmVyIGEga2V5Ym9hcmQgZHJhZyBzdGFydHMuJyxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBvcHRpb25zLnBoZXRpb1JlYWRPbmx5LFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUlxuICAgIH0gKTtcblxuICAgIC8vIFRoZSBkcmFnIGFjdGlvbiBvbmx5IGV4ZWN1dGVzIHdoZW4gdGhlcmUgaXMgYWN0dWFsIG1vdmVtZW50IChtb2RlbERlbHRhIGlzIG5vbi16ZXJvKS4gRm9yIGV4YW1wbGUsIGl0IGRvZXNcbiAgICAvLyBOT1QgZXhlY3V0ZSBpZiBjb25mbGljdGluZyBrZXlzIGFyZSBwcmVzc2VkIChlLmcuIGxlZnQgYW5kIHJpZ2h0IGFycm93IGtleXMgYXQgdGhlIHNhbWUgdGltZSkuIE5vdGUgdGhhdCB0aGlzXG4gICAgLy8gaXMgZXhwZWN0ZWQgdG8gYmUgZXhlY3V0ZWQgZnJvbSB0aGUgQ2FsbGJhY2tUaW1lci4gU28gdGhlcmUgd2lsbCBiZSBwcm9ibGVtcyBpZiB0aGlzIGNhbiBiZSBleGVjdXRlZCBmcm9tXG4gICAgLy8gUGhFVC1pTyBjbGllbnRzLlxuICAgIHRoaXMuZHJhZ0FjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICgpID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUsICdUaGUgbGlzdGVuZXIgc2hvdWxkIG5vdCBiZSBkcmFnZ2luZyBpZiBub3QgcHJlc3NlZCcgKTtcblxuICAgICAgLy8gQ29udmVydCB0aGUgcHJvcG9zZWQgZGVsdGEgdG8gbW9kZWwgY29vcmRpbmF0ZXNcbiAgICAgIGlmICggb3B0aW9ucy50cmFuc2Zvcm0gKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IG9wdGlvbnMudHJhbnNmb3JtIGluc3RhbmNlb2YgVHJhbnNmb3JtMyA/IG9wdGlvbnMudHJhbnNmb3JtIDogb3B0aW9ucy50cmFuc2Zvcm0udmFsdWU7XG4gICAgICAgIHRoaXMubW9kZWxEZWx0YSA9IHRyYW5zZm9ybS5pbnZlcnNlRGVsdGEyKCB0aGlzLnZlY3RvckRlbHRhICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5tb2RlbERlbHRhID0gdGhpcy52ZWN0b3JEZWx0YTtcbiAgICAgIH1cblxuICAgICAgLy8gQXBwbHkgdHJhbnNsYXRpb24gdG8gdGhlIHZpZXcgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICAgIGlmICggdGhpcy5fdHJhbnNsYXRlTm9kZSApIHtcbiAgICAgICAgbGV0IG5ld1Bvc2l0aW9uID0gdGhpcy5nZXRDdXJyZW50VGFyZ2V0KCkudHJhbnNsYXRpb24ucGx1cyggdGhpcy52ZWN0b3JEZWx0YSApO1xuICAgICAgICBuZXdQb3NpdGlvbiA9IHRoaXMubWFwTW9kZWxQb2ludCggbmV3UG9zaXRpb24gKTtcbiAgICAgICAgdGhpcy5nZXRDdXJyZW50VGFyZ2V0KCkudHJhbnNsYXRpb24gPSBuZXdQb3NpdGlvbjtcblxuICAgICAgICB0aGlzLm1vZGVsUG9pbnQgPSB0aGlzLnBhcmVudFRvTW9kZWxQb2ludCggbmV3UG9zaXRpb24gKTtcbiAgICAgIH1cblxuICAgICAgLy8gU3luY2hyb25pemUgd2l0aCBtb2RlbCBwb3NpdGlvbi5cbiAgICAgIGlmICggdGhpcy5fcG9zaXRpb25Qcm9wZXJ0eSApIHtcbiAgICAgICAgbGV0IG5ld1Bvc2l0aW9uID0gdGhpcy5fcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCB0aGlzLm1vZGVsRGVsdGEgKTtcbiAgICAgICAgbmV3UG9zaXRpb24gPSB0aGlzLm1hcE1vZGVsUG9pbnQoIG5ld1Bvc2l0aW9uICk7XG5cbiAgICAgICAgdGhpcy5tb2RlbFBvaW50ID0gbmV3UG9zaXRpb247XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBwb3NpdGlvbiBpZiBpdCBpcyBkaWZmZXJlbnRcbiAgICAgICAgaWYgKCAhbmV3UG9zaXRpb24uZXF1YWxzKCB0aGlzLl9wb3NpdGlvblByb3BlcnR5LnZhbHVlICkgKSB7XG4gICAgICAgICAgdGhpcy5fcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG5ld1Bvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZSBvcHRpb25hbCBkcmFnIGZ1bmN0aW9uIGF0IHRoZSBlbmQgb2YgYW55IG1vdmVtZW50XG4gICAgICBpZiAoIHRoaXMuX2RyYWcgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3BvaW50ZXIsICd0aGUgcG9pbnRlciBtdXN0IGJlIGFzc2lnbmVkIGF0IHRoZSBzdGFydCBvZiBhIGRyYWcgYWN0aW9uJyApO1xuICAgICAgICBjb25zdCBzeW50aGV0aWNFdmVudCA9IHRoaXMuY3JlYXRlU3ludGhldGljRXZlbnQoIHRoaXMuX3BvaW50ZXIhICk7XG4gICAgICAgIHRoaXMuX2RyYWcoIHN5bnRoZXRpY0V2ZW50LCB0aGlzICk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGFyYW1ldGVyczogW10sXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdBY3Rpb24nICksXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgZXZlcnkgdGltZSB0aGVyZSBpcyBzb21lIGlucHV0IGZyb20gYSBrZXlib2FyZCBkcmFnLicsXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9wdGlvbnMucGhldGlvUmVhZE9ubHksXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSXG4gICAgfSApO1xuXG4gICAgdGhpcy5kcmFnRW5kQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCkgPT4ge1xuICAgICAgaWYgKCB0aGlzLnVzZURyYWdTcGVlZCApIHtcbiAgICAgICAgc3RlcFRpbWVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmJvdW5kU3RlcExpc3RlbmVyICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja1RpbWVyLnN0b3AoIGZhbHNlICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN5bnRoZXRpY0V2ZW50ID0gdGhpcy5fcG9pbnRlciA/IHRoaXMuY3JlYXRlU3ludGhldGljRXZlbnQoIHRoaXMuX3BvaW50ZXIgKSA6IG51bGw7XG4gICAgICB0aGlzLl9lbmQgJiYgdGhpcy5fZW5kKCBzeW50aGV0aWNFdmVudCwgdGhpcyApO1xuXG4gICAgICB0aGlzLmNsZWFyUG9pbnRlcigpO1xuICAgIH0sIHtcbiAgICAgIHBhcmFtZXRlcnM6IFtdLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnRW5kQWN0aW9uJyApLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW5ldmVyIGEga2V5Ym9hcmQgZHJhZyBlbmRzLicsXG4gICAgICBwaGV0aW9SZWFkT25seTogb3B0aW9ucy5waGV0aW9SZWFkT25seSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVJcbiAgICB9ICk7XG5cbiAgICB0aGlzLl9wb2ludGVyTGlzdGVuZXIgPSB7XG4gICAgICBsaXN0ZW5lcjogdGhpcyxcbiAgICAgIGludGVycnVwdDogdGhpcy5pbnRlcnJ1cHQuYmluZCggdGhpcyApXG4gICAgfTtcblxuICAgIHRoaXMuX3BvaW50ZXIgPSBudWxsO1xuXG4gICAgLy8gQ2FsbGJhY2tUaW1lciB3aWxsIGJlIHVzZWQgdG8gc3VwcG9ydCBkcmFnRGVsdGEgY2FsbGJhY2sgaW50ZXJ2YWxzLiBJdCB3aWxsIGJlIHJlc3RhcnRlZCB3aGVuZXZlciB0aGVyZSBpcyBhXG4gICAgLy8gbmV3IGtleSBwcmVzcyBzbyB0aGF0IHRoZSBvYmplY3QgbW92ZXMgZXZlcnkgdGltZSB0aGVyZSBpcyB1c2VyIGlucHV0LiBJdCBpcyBzdG9wcGVkIHdoZW4gYWxsIGtleXMgYXJlIHJlbGVhc2VkLlxuICAgIHRoaXMuY2FsbGJhY2tUaW1lciA9IG5ldyBDYWxsYmFja1RpbWVyKCB7XG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICBjb25zdCBzaGlmdEtleURvd24gPSBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIuc2hpZnRLZXlEb3duO1xuICAgICAgICBjb25zdCBkZWx0YSA9IHNoaWZ0S2V5RG93biA/IG9wdGlvbnMuc2hpZnREcmFnRGVsdGEgOiBvcHRpb25zLmRyYWdEZWx0YTtcbiAgICAgICAgdGhpcy5tb3ZlRnJvbURlbHRhKCBkZWx0YSApO1xuICAgICAgfSxcblxuICAgICAgZGVsYXk6IG9wdGlvbnMubW92ZU9uSG9sZERlbGF5LFxuICAgICAgaW50ZXJ2YWw6IG9wdGlvbnMubW92ZU9uSG9sZEludGVydmFsXG4gICAgfSApO1xuXG4gICAgLy8gQSBsaXN0ZW5lciBpcyBhZGRlZCB0byB0aGUgc3RlcFRpbWVyIHRvIHN1cHBvcnQgZHJhZ1NwZWVkLiBEb2VzIG5vdCB1c2UgQ2FsbGJhY2tUaW1lciBiZWNhdXNlIENhbGxiYWNrVGltZXJcbiAgICAvLyB1c2VzIHNldEludGVydmFsIGFuZCBtYXkgbm90IGJlIGNhbGxlZCBldmVyeSBmcmFtZSB3aGljaCByZXN1bHRzIGluIGNob3BweSBtb3Rpb24sIHNlZVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNjM4LiBJdCBpcyBhZGRlZCB0byB0aGUgc3RlcFRpbWVyIHdoZW4gdGhlIGRyYWcgc3RhcnRzIGFuZCByZW1vdmVkXG4gICAgLy8gd2hlbiB0aGUgZHJhZyBlbmRzLlxuICAgIHRoaXMuYm91bmRTdGVwTGlzdGVuZXIgPSB0aGlzLnN0ZXBGb3JTcGVlZC5iaW5kKCB0aGlzICk7XG5cbiAgICAvLyBXaGVuIGFueSBvZiB0aGUgbW92ZW1lbnQga2V5cyBmaXJzdCBnbyBkb3duLCBzdGFydCB0aGUgZHJhZyBvcGVyYXRpb24gb24gdGhlIG5leHQga2V5ZG93biBldmVudCAoc28gdGhhdFxuICAgIC8vIHRoZSBTY2VuZXJ5RXZlbnQgaXMgYXZhaWxhYmxlKS5cbiAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LmxhenlMaW5rKCBkcmFnS2V5c0Rvd24gPT4ge1xuICAgICAgaWYgKCBkcmFnS2V5c0Rvd24gKSB7XG4gICAgICAgIHRoaXMuc3RhcnROZXh0S2V5Ym9hcmRFdmVudCA9IHRydWU7XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBJbiBjYXNlIG1vdmVtZW50IGtleXMgYXJlIHJlbGVhc2VkIGJlZm9yZSB3ZSBnZXQgYSBrZXlkb3duIGV2ZW50IChtb3N0bHkgcG9zc2libGUgZHVyaW5nIGZ1enogdGVzdGluZyksXG4gICAgICAgIC8vIGRvbid0IHN0YXJ0IHRoZSBuZXh0IGRyYWcgYWN0aW9uLlxuICAgICAgICB0aGlzLnN0YXJ0TmV4dEtleWJvYXJkRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXN0YXJ0VGltZXJOZXh0S2V5Ym9hcmRFdmVudCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICggdGhpcy5pc0RyYWdnaW5nKCkgKSB7XG4gICAgICAgICAgdGhpcy5kcmFnRW5kQWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIElmIG5vdCB0aGUgc2hpZnQga2V5LCB0aGUgZHJhZyBzaG91bGQgc3RhcnQgaW1tZWRpYXRlbHkgaW4gdGhlIGRpcmVjdGlvbiBvZiB0aGUgbmV3bHkgcHJlc3NlZCBrZXkgaW5zdGVhZFxuICAgIC8vIG9mIHdhaXRpbmcgZm9yIHRoZSBuZXh0IGludGVydmFsLiBPbmx5IGltcG9ydGFudCBmb3IgIXVzZURyYWdTcGVlZCAodXNpbmcgQ2FsbGJhY2tUaW1lcikuXG4gICAgaWYgKCAhdGhpcy51c2VEcmFnU3BlZWQgKSB7XG4gICAgICBjb25zdCBhZGRTdGFydENhbGxiYWNrVGltZXJMaXN0ZW5lciA9ICgga2V5UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ICkgPT4ge1xuICAgICAgICBrZXlQcm9wZXJ0eS5saW5rKCBrZXlEb3duID0+IHtcbiAgICAgICAgICBpZiAoIGtleURvd24gKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3RhcnRUaW1lck5leHRLZXlib2FyZEV2ZW50ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH07XG4gICAgICBhZGRTdGFydENhbGxiYWNrVGltZXJMaXN0ZW5lciggdGhpcy5sZWZ0S2V5RG93blByb3BlcnR5ICk7XG4gICAgICBhZGRTdGFydENhbGxiYWNrVGltZXJMaXN0ZW5lciggdGhpcy5yaWdodEtleURvd25Qcm9wZXJ0eSApO1xuICAgICAgYWRkU3RhcnRDYWxsYmFja1RpbWVyTGlzdGVuZXIoIHRoaXMudXBLZXlEb3duUHJvcGVydHkgKTtcbiAgICAgIGFkZFN0YXJ0Q2FsbGJhY2tUaW1lckxpc3RlbmVyKCB0aGlzLmRvd25LZXlEb3duUHJvcGVydHkgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9kaXNwb3NlS2V5Ym9hcmREcmFnTGlzdGVuZXIgPSAoKSA9PiB7XG5cbiAgICAgIHRoaXMubGVmdEtleURvd25Qcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLnJpZ2h0S2V5RG93blByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMudXBLZXlEb3duUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5kb3duS2V5RG93blByb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgICAgdGhpcy5jYWxsYmFja1RpbWVyLmRpc3Bvc2UoKTtcbiAgICAgIGlmICggc3RlcFRpbWVyLmhhc0xpc3RlbmVyKCB0aGlzLmJvdW5kU3RlcExpc3RlbmVyICkgKSB7XG4gICAgICAgIHN0ZXBUaW1lci5yZW1vdmVMaXN0ZW5lciggdGhpcy5ib3VuZFN0ZXBMaXN0ZW5lciApO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlcyBhIGRlbHRhIGZvciBtb3ZlbWVudCBmcm9tIHRoZSB0aW1lIHN0ZXAuIE9ubHkgdXNlZCBmb3IgYGRyYWdTcGVlZGAuIFRoaXMgaXMgYm91bmQgYW5kIGFkZGVkIHRvXG4gICAqIHRoZSBzdGVwVGltZXIgd2hlbiBkcmFnZ2luZyBzdGFydHMuXG4gICAqL1xuICBwcml2YXRlIHN0ZXBGb3JTcGVlZCggZHQ6IG51bWJlciApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnVzZURyYWdTcGVlZCwgJ1RoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIHVzaW5nIGRyYWdTcGVlZCcgKTtcblxuICAgIGNvbnN0IHNoaWZ0S2V5RG93biA9IGdsb2JhbEtleVN0YXRlVHJhY2tlci5zaGlmdEtleURvd247XG4gICAgY29uc3QgZGVsdGEgPSBkdCAqICggc2hpZnRLZXlEb3duID8gdGhpcy5zaGlmdERyYWdTcGVlZCA6IHRoaXMuZHJhZ1NwZWVkICk7XG4gICAgdGhpcy5tb3ZlRnJvbURlbHRhKCBkZWx0YSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgZGVsdGEgZnJvbSBkcmFnU3BlZWQgb3IgZHJhZ0RlbHRhLCBkZXRlcm1pbmUgdGhlIGRpcmVjdGlvbiBvZiBtb3ZlbWVudCBhbmQgbW92ZSB0aGUgb2JqZWN0IGFjY29yZGluZ2x5XG4gICAqIGJ5IHVzaW5nIHRoZSBkcmFnQWN0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBtb3ZlRnJvbURlbHRhKCBkZWx0YTogbnVtYmVyICk6IHZvaWQge1xuICAgIGxldCBkZWx0YVggPSAwO1xuICAgIGxldCBkZWx0YVkgPSAwO1xuXG4gICAgaWYgKCB0aGlzLmxlZnRLZXlEb3duUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICBkZWx0YVggLT0gZGVsdGE7XG4gICAgfVxuICAgIGlmICggdGhpcy5yaWdodEtleURvd25Qcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIGRlbHRhWCArPSBkZWx0YTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLnVwS2V5RG93blByb3BlcnR5LnZhbHVlICkge1xuICAgICAgZGVsdGFZIC09IGRlbHRhO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuZG93bktleURvd25Qcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIGRlbHRhWSArPSBkZWx0YTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZWN0b3JEZWx0YSA9IG5ldyBWZWN0b3IyKCBkZWx0YVgsIGRlbHRhWSApO1xuXG4gICAgLy8gb25seSBpbml0aWF0ZSBtb3ZlIGlmIHRoZXJlIHdhcyBzb21lIGF0dGVtcHRlZCBrZXlib2FyZCBkcmFnXG4gICAgaWYgKCAhdmVjdG9yRGVsdGEuZXF1YWxzKCBWZWN0b3IyLlpFUk8gKSApIHtcbiAgICAgIHRoaXMudmVjdG9yRGVsdGEgPSB2ZWN0b3JEZWx0YTtcbiAgICAgIHRoaXMuZHJhZ0FjdGlvbi5leGVjdXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBwb2ludCBpbiB0aGUgdmlldyAocGFyZW50KSBjb29yZGluYXRlIGZyYW1lIHRvIHRoZSBtb2RlbCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBwYXJlbnRUb01vZGVsUG9pbnQoIHBhcmVudFBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIGlmICggdGhpcy50cmFuc2Zvcm0gKSB7XG4gICAgICBjb25zdCB0cmFuc2Zvcm0gPSB0aGlzLnRyYW5zZm9ybSBpbnN0YW5jZW9mIFRyYW5zZm9ybTMgPyB0aGlzLnRyYW5zZm9ybSA6IHRoaXMudHJhbnNmb3JtLnZhbHVlO1xuICAgICAgcmV0dXJuIHRyYW5zZm9ybS5pbnZlcnNlRGVsdGEyKCBwYXJlbnRQb2ludCApO1xuICAgIH1cbiAgICByZXR1cm4gcGFyZW50UG9pbnQ7XG4gIH1cblxuICBwcml2YXRlIGxvY2FsVG9QYXJlbnRQb2ludCggbG9jYWxQb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmdldEN1cnJlbnRUYXJnZXQoKTtcbiAgICByZXR1cm4gdGFyZ2V0LmxvY2FsVG9QYXJlbnRQb2ludCggbG9jYWxQb2ludCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRyYWcgYm91bmRzIGluIG1vZGVsIGNvb3JkaW5hdGVzLlxuICAgKi9cbiAgcHVibGljIGdldERyYWdCb3VuZHMoKTogQm91bmRzMiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGRyYWdCb3VuZHMoKTogQm91bmRzMiB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXREcmFnQm91bmRzKCk7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZHJhZyB0cmFuc2Zvcm0gb2YgdGhlIGxpc3RlbmVyLlxuICAgKi9cbiAgcHVibGljIHNldFRyYW5zZm9ybSggdHJhbnNmb3JtOiBUcmFuc2Zvcm0zIHwgVFJlYWRPbmx5UHJvcGVydHk8VHJhbnNmb3JtMz4gfCBudWxsICk6IHZvaWQge1xuICAgIHRoaXMuX3RyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdHJhbnNmb3JtKCB0cmFuc2Zvcm06IFRyYW5zZm9ybTMgfCBUUmVhZE9ubHlQcm9wZXJ0eTxUcmFuc2Zvcm0zPiB8IG51bGwgKSB7IHRoaXMuc2V0VHJhbnNmb3JtKCB0cmFuc2Zvcm0gKTsgfVxuXG4gIHB1YmxpYyBnZXQgdHJhbnNmb3JtKCk6IFRyYW5zZm9ybTMgfCBUUmVhZE9ubHlQcm9wZXJ0eTxUcmFuc2Zvcm0zPiB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRUcmFuc2Zvcm0oKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmFuc2Zvcm0gb2YgdGhlIGxpc3RlbmVyLlxuICAgKi9cbiAgcHVibGljIGdldFRyYW5zZm9ybSgpOiBUcmFuc2Zvcm0zIHwgVFJlYWRPbmx5UHJvcGVydHk8VHJhbnNmb3JtMz4gfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHRlciBmb3IgdGhlIGRyYWdTcGVlZCBwcm9wZXJ0eSwgc2VlIG9wdGlvbnMuZHJhZ1NwZWVkIGZvciBtb3JlIGluZm8uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRyYWdTcGVlZCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fZHJhZ1NwZWVkOyB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIGRyYWdTcGVlZCBwcm9wZXJ0eSwgc2VlIG9wdGlvbnMuZHJhZ1NwZWVkIGZvciBtb3JlIGluZm8uXG4gICAqL1xuICBwdWJsaWMgc2V0IGRyYWdTcGVlZCggZHJhZ1NwZWVkOiBudW1iZXIgKSB7IHRoaXMuX2RyYWdTcGVlZCA9IGRyYWdTcGVlZDsgfVxuXG4gIC8qKlxuICAgKiBHZXR0ZXIgZm9yIHRoZSBzaGlmdERyYWdTcGVlZCBwcm9wZXJ0eSwgc2VlIG9wdGlvbnMuc2hpZnREcmFnU3BlZWQgZm9yIG1vcmUgaW5mby5cbiAgICovXG4gIHB1YmxpYyBnZXQgc2hpZnREcmFnU3BlZWQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3NoaWZ0RHJhZ1NwZWVkOyB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgdGhlIHNoaWZ0RHJhZ1NwZWVkIHByb3BlcnR5LCBzZWUgb3B0aW9ucy5zaGlmdERyYWdTcGVlZCBmb3IgbW9yZSBpbmZvLlxuICAgKi9cbiAgcHVibGljIHNldCBzaGlmdERyYWdTcGVlZCggc2hpZnREcmFnU3BlZWQ6IG51bWJlciApIHsgdGhpcy5fc2hpZnREcmFnU3BlZWQgPSBzaGlmdERyYWdTcGVlZDsgfVxuXG4gIC8qKlxuICAgKiBHZXR0ZXIgZm9yIHRoZSBkcmFnRGVsdGEgcHJvcGVydHksIHNlZSBvcHRpb25zLmRyYWdEZWx0YSBmb3IgbW9yZSBpbmZvLlxuICAgKi9cbiAgcHVibGljIGdldCBkcmFnRGVsdGEoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2RyYWdEZWx0YTsgfVxuXG4gIC8qKlxuICAgKiBTZXR0ZXIgZm9yIHRoZSBkcmFnRGVsdGEgcHJvcGVydHksIHNlZSBvcHRpb25zLmRyYWdEZWx0YSBmb3IgbW9yZSBpbmZvLlxuICAgKi9cbiAgcHVibGljIHNldCBkcmFnRGVsdGEoIGRyYWdEZWx0YTogbnVtYmVyICkgeyB0aGlzLl9kcmFnRGVsdGEgPSBkcmFnRGVsdGE7IH1cblxuICAvKipcbiAgICogR2V0dGVyIGZvciB0aGUgc2hpZnREcmFnRGVsdGEgcHJvcGVydHksIHNlZSBvcHRpb25zLnNoaWZ0RHJhZ0RlbHRhIGZvciBtb3JlIGluZm8uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHNoaWZ0RHJhZ0RlbHRhKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9zaGlmdERyYWdEZWx0YTsgfVxuXG4gIC8qKlxuICAgKiBTZXR0ZXIgZm9yIHRoZSBzaGlmdERyYWdEZWx0YSBwcm9wZXJ0eSwgc2VlIG9wdGlvbnMuc2hpZnREcmFnRGVsdGEgZm9yIG1vcmUgaW5mby5cbiAgICovXG4gIHB1YmxpYyBzZXQgc2hpZnREcmFnRGVsdGEoIHNoaWZ0RHJhZ0RlbHRhOiBudW1iZXIgKSB7IHRoaXMuX3NoaWZ0RHJhZ0RlbHRhID0gc2hpZnREcmFnRGVsdGE7IH1cblxuICAvKipcbiAgICogQXJlIGtleXMgcHJlc3NlZCB0aGF0IHdvdWxkIG1vdmUgdGhlIHRhcmdldCBOb2RlIHRvIHRoZSBsZWZ0P1xuICAgKi9cbiAgcHVibGljIG1vdmluZ0xlZnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubGVmdEtleURvd25Qcm9wZXJ0eS52YWx1ZSAmJiAhdGhpcy5yaWdodEtleURvd25Qcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcmUga2V5cyBwcmVzc2VkIHRoYXQgd291bGQgbW92ZSB0aGUgdGFyZ2V0IE5vZGUgdG8gdGhlIHJpZ2h0P1xuICAgKi9cbiAgcHVibGljIG1vdmluZ1JpZ2h0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJpZ2h0S2V5RG93blByb3BlcnR5LnZhbHVlICYmICF0aGlzLmxlZnRLZXlEb3duUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQXJlIGtleXMgcHJlc3NlZCB0aGF0IHdvdWxkIG1vdmUgdGhlIHRhcmdldCBOb2RlIHVwP1xuICAgKi9cbiAgcHVibGljIG1vdmluZ1VwKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnVwS2V5RG93blByb3BlcnR5LnZhbHVlICYmICF0aGlzLmRvd25LZXlEb3duUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQXJlIGtleXMgcHJlc3NlZCB0aGF0IHdvdWxkIG1vdmUgdGhlIHRhcmdldCBOb2RlIGRvd24/XG4gICAqL1xuICBwdWJsaWMgbW92aW5nRG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kb3duS2V5RG93blByb3BlcnR5LnZhbHVlICYmICF0aGlzLnVwS2V5RG93blByb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCB0YXJnZXQgTm9kZSBvZiB0aGUgZHJhZy5cbiAgICovXG4gIHB1YmxpYyBnZXRDdXJyZW50VGFyZ2V0KCk6IE5vZGUge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUsICdXZSBoYXZlIG5vIGN1cnJlbnRUYXJnZXQgaWYgd2UgYXJlIG5vdCBwcmVzc2VkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3BvaW50ZXIgJiYgdGhpcy5fcG9pbnRlci50cmFpbCwgJ011c3QgaGF2ZSBhIFBvaW50ZXIgd2l0aCBhbiBhY3RpdmUgdHJhaWwgaWYgd2UgYXJlIHByZXNzZWQnICk7XG4gICAgcmV0dXJuIHRoaXMuX3BvaW50ZXIhLnRyYWlsIS5sYXN0Tm9kZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSB3aGVuIHRoaXMgbGlzdGVuZXIgaXMgY3VycmVudGx5IGRyYWdnaW5nLiBUaGUgcG9pbnRlciBtdXN0IGJlIGFzc2lnbmVkIChkcmFnIHN0YXJ0ZWQpIGFuZCBpdFxuICAgKiBtdXN0IGJlIGF0dGFjaGVkIHRvIHRoaXMgX3BvaW50ZXJMaXN0ZW5lciAob3RoZXJ3aXNlIGl0IGlzIGludGVyYWN0aW5nIHdpdGggYW5vdGhlciB0YXJnZXQpLlxuICAgKi9cbiAgcHJpdmF0ZSBpc0RyYWdnaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX3BvaW50ZXIgJiYgdGhpcy5fcG9pbnRlci5hdHRhY2hlZExpc3RlbmVyID09PSB0aGlzLl9wb2ludGVyTGlzdGVuZXI7XG4gIH1cblxuICAvKipcbiAgICogU2NlbmVyeSBpbnRlcm5hbC4gUGFydCBvZiB0aGUgZXZlbnRzIEFQSS4gRG8gbm90IGNhbGwgZGlyZWN0bHkuXG4gICAqXG4gICAqIERvZXMgc3BlY2lmaWMgd29yayBmb3IgdGhlIGtleWRvd24gZXZlbnQuIFRoaXMgaXMgY2FsbGVkIGR1cmluZyBzY2VuZXJ5IGV2ZW50IGRpc3BhdGNoLCBhbmQgQUZURVIgYW55IGdsb2JhbFxuICAgKiBrZXkgc3RhdGUgdXBkYXRlcy4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBpbnRlcnJ1cHRpb24gbmVlZHMgdG8gaGFwcGVuIGFmdGVyIGhvdGtleU1hbmFnZXIgaGFzIGZ1bGx5IHByb2Nlc3NlZFxuICAgKiB0aGUga2V5IHN0YXRlLiBBbmQgdGhpcyBpbXBsZW1lbnRhdGlvbiBhc3N1bWVzIHRoYXQgdGhlIGtleWRvd24gZXZlbnQgd2lsbCBoYXBwZW4gYWZ0ZXIgSG90a2V5IHVwZGF0ZXNcbiAgICogKHNlZSBzdGFydE5leHRLZXlib2FyZEV2ZW50KS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBrZXlkb3duKCBldmVudDogU2NlbmVyeUV2ZW50PEtleWJvYXJkRXZlbnQ+ICk6IHZvaWQge1xuICAgIHN1cGVyLmtleWRvd24oIGV2ZW50ICk7XG5cbiAgICBjb25zdCBkb21FdmVudCA9IGV2ZW50LmRvbUV2ZW50ITtcblxuICAgIC8vIElmIHRoZSBtZXRhIGtleSBpcyBkb3duIChjb21tYW5kIGtleS93aW5kb3dzIGtleSkgcHJldmVudCBtb3ZlbWVudCBhbmQgZG8gbm90IHByZXZlbnREZWZhdWx0LlxuICAgIC8vIE1ldGEga2V5ICsgYXJyb3cga2V5IGlzIGEgY29tbWFuZCB0byBnbyBiYWNrIGEgcGFnZSwgYW5kIHdlIG5lZWQgdG8gYWxsb3cgdGhhdC4gQnV0IGFsc28sIG1hY09TXG4gICAgLy8gZmFpbHMgdG8gcHJvdmlkZSBrZXl1cCBldmVudHMgb25jZSB0aGUgbWV0YSBrZXkgaXMgcHJlc3NlZCwgc2VlXG4gICAgLy8gaHR0cDovL3dlYi5hcmNoaXZlLm9yZy93ZWIvMjAxNjAzMDQwMjI0NTMvaHR0cDovL2JpdHNwdXNoZWRhcm91bmQuY29tL29uLWEtZmV3LXRoaW5ncy15b3UtbWF5LW5vdC1rbm93LWFib3V0LXRoZS1oZWxsaXNoLWNvbW1hbmQta2V5LWFuZC1qYXZhc2NyaXB0LWV2ZW50cy9cbiAgICBpZiAoIGRvbUV2ZW50Lm1ldGFLZXkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzTW92ZW1lbnRLZXkoIGRvbUV2ZW50ICkgKSB7XG5cbiAgICAgIC8vIFByZXZlbnQgYSBWb2ljZU92ZXIgYnVnIHdoZXJlIHByZXNzaW5nIG11bHRpcGxlIGFycm93IGtleXMgYXQgb25jZSBjYXVzZXMgdGhlIEFUIHRvIHNlbmQgdGhlIHdyb25nIGtleXNcbiAgICAgIC8vIHRocm91Z2ggdGhlIGtleXVwIGV2ZW50IC0gYXMgYSB3b3JrYXJvdW5kLCB3ZSBvbmx5IGFsbG93IG9uZSBhcnJvdyBrZXkgdG8gYmUgZG93biBhdCBhIHRpbWUuIElmIHR3byBhcmUgcHJlc3NlZFxuICAgICAgLy8gZG93biwgd2UgaW1tZWRpYXRlbHkgaW50ZXJydXB0LlxuICAgICAgaWYgKCBwbGF0Zm9ybS5zYWZhcmkgJiYgdGhpcy5wcmVzc2VkS2V5U3RyaW5nUHJvcGVydGllc1Byb3BlcnR5LnZhbHVlLmxlbmd0aCA+IDEgKSB7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gRmluYWxseSwgaW4gdGhpcyBjYXNlIHdlIGFyZSBhY3R1YWxseSBnb2luZyB0byBkcmFnIHRoZSBvYmplY3QuIFByZXZlbnQgZGVmYXVsdCBiZWhhdmlvciBzbyB0aGF0IFNhZmFyaVxuICAgICAgLy8gZG9lc24ndCBwbGF5IGEgJ2JvbmsnIHNvdW5kIGV2ZXJ5IGFycm93IGtleSBwcmVzcy5cbiAgICAgIGRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vIENhbm5vdCBhdHRhY2ggYSBsaXN0ZW5lciB0byBhIFBvaW50ZXIgdGhhdCBpcyBhbHJlYWR5IGF0dGFjaGVkXG4gICAgICBpZiAoIHRoaXMuc3RhcnROZXh0S2V5Ym9hcmRFdmVudCAmJiAhZXZlbnQucG9pbnRlci5pc0F0dGFjaGVkKCkgKSB7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG1vdmVtZW50IGtleXMgZG93biwgYXR0YWNoIGEgbGlzdGVuZXIgdG8gdGhlIFBvaW50ZXIgdGhhdCB3aWxsIHRlbGwgdGhlIEFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyXG4gICAgICAgIC8vIHRvIGtlZXAgdGhpcyBOb2RlIGluIHZpZXdcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcG9pbnRlciA9PT0gbnVsbCwgJ1BvaW50ZXIgc2hvdWxkIGJlIG51bGwgYXQgdGhlIHN0YXJ0IG9mIGEgZHJhZyBhY3Rpb24nICk7XG4gICAgICAgIHRoaXMuX3BvaW50ZXIgPSBldmVudC5wb2ludGVyIGFzIFBET01Qb2ludGVyO1xuICAgICAgICBldmVudC5wb2ludGVyLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuX3BvaW50ZXJMaXN0ZW5lciwgdHJ1ZSApO1xuXG4gICAgICAgIHRoaXMuZHJhZ1N0YXJ0QWN0aW9uLmV4ZWN1dGUoIGV2ZW50ICk7XG4gICAgICAgIHRoaXMuc3RhcnROZXh0S2V5Ym9hcmRFdmVudCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgZHJhZyBpcyBhbHJlYWR5IHN0YXJ0ZWQsIHJlc3RhcnQgdGhlIGNhbGxiYWNrIHRpbWVyIG9uIHRoZSBuZXh0IGtleWRvd24gZXZlbnQuIFRoZSBQb2ludGVyIG11c3RcbiAgICAgIC8vIGJlIGF0dGFjaGVkIHRvIHRoaXMuX3BvaW50ZXJMaXN0ZW5lciAoYWxyZWFkeSBkcmFnZ2luZykgYW5kIG5vdCBhbm90aGVyIGxpc3RlbmVyIChrZXlib2FyZCBpcyBpbnRlcmFjdGluZ1xuICAgICAgLy8gd2l0aCBhbm90aGVyIHRhcmdldCkuXG4gICAgICBpZiAoIHRoaXMucmVzdGFydFRpbWVyTmV4dEtleWJvYXJkRXZlbnQgJiYgdGhpcy5pc0RyYWdnaW5nKCkgKSB7XG5cbiAgICAgICAgLy8gcmVzdGFydCB0aGUgY2FsbGJhY2sgdGltZXJcbiAgICAgICAgdGhpcy5jYWxsYmFja1RpbWVyLnN0b3AoIGZhbHNlICk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tUaW1lci5zdGFydCgpO1xuXG4gICAgICAgIGlmICggdGhpcy5fbW92ZU9uSG9sZERlbGF5ID4gMCApIHtcblxuICAgICAgICAgIC8vIGZpcmUgcmlnaHQgYXdheSBpZiB0aGVyZSBpcyBhIGRlbGF5IC0gaWYgdGhlcmUgaXMgbm8gZGVsYXkgdGhlIHRpbWVyIGlzIGdvaW5nIHRvIGZpcmUgaW4gdGhlIG5leHRcbiAgICAgICAgICAvLyBhbmltYXRpb24gZnJhbWUgYW5kIHNvIGl0IHdvdWxkIGFwcGVhciB0aGF0IHRoZSBvYmplY3QgbWFrZXMgdHdvIHN0ZXBzIGluIG9uZSBmcmFtZVxuICAgICAgICAgIHRoaXMuY2FsbGJhY2tUaW1lci5maXJlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlc3RhcnRUaW1lck5leHRLZXlib2FyZEV2ZW50ID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IGEgbWFwcGluZyBmcm9tIHRoZSBkcmFnIHRhcmdldCdzIG1vZGVsIHBvc2l0aW9uIHRvIGFuIGFsbG93ZWQgbW9kZWwgcG9zaXRpb24uXG4gICAqXG4gICAqIEEgY29tbW9uIGV4YW1wbGUgaXMgdXNpbmcgZHJhZ0JvdW5kcywgd2hlcmUgdGhlIHBvc2l0aW9uIG9mIHRoZSBkcmFnIHRhcmdldCBpcyBjb25zdHJhaW5lZCB0byB3aXRoaW4gYSBib3VuZGluZ1xuICAgKiBib3guIFRoaXMgaXMgZG9uZSBieSBtYXBwaW5nIHBvaW50cyBvdXRzaWRlIHRoZSBib3VuZGluZyBib3ggdG8gdGhlIGNsb3Nlc3QgcG9zaXRpb24gaW5zaWRlIHRoZSBib3guIE1vcmVcbiAgICogZ2VuZXJhbCBtYXBwaW5ncyBjYW4gYmUgdXNlZC5cbiAgICpcbiAgICogU2hvdWxkIGJlIG92ZXJyaWRkZW4gKG9yIHVzZSBtYXBQb3NpdGlvbikgaWYgYSBjdXN0b20gdHJhbnNmb3JtYXRpb24gaXMgbmVlZGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyAtIEEgcG9pbnQgaW4gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICovXG4gIHByb3RlY3RlZCBtYXBNb2RlbFBvaW50KCBtb2RlbFBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIGlmICggdGhpcy5fbWFwUG9zaXRpb24gKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWFwUG9zaXRpb24oIG1vZGVsUG9pbnQgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuX2RyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIHJldHVybiB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkudmFsdWUuY2xvc2VzdFBvaW50VG8oIG1vZGVsUG9pbnQgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbW9kZWxQb2ludDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIHBvaW50ZXIgaXMgc2V0LCByZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20gaXQgYW5kIGNsZWFyIHRoZSByZWZlcmVuY2UuXG4gICAqL1xuICBwcml2YXRlIGNsZWFyUG9pbnRlcigpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX3BvaW50ZXIgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wb2ludGVyLmxpc3RlbmVycy5pbmNsdWRlcyggdGhpcy5fcG9pbnRlckxpc3RlbmVyICksXG4gICAgICAgICdBIHJlZmVyZW5jZSB0byB0aGUgUG9pbnRlciBtZWFucyBpdCBzaG91bGQgaGF2ZSB0aGUgcG9pbnRlckxpc3RlbmVyJyApO1xuICAgICAgdGhpcy5fcG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuX3BvaW50ZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVsaWdpYmxlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmludGVycnVwdCgpO1xuICAgIHRoaXMuX2Rpc3Bvc2VLZXlib2FyZERyYWdMaXN0ZW5lcigpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnS2V5Ym9hcmREcmFnTGlzdGVuZXInLCBLZXlib2FyZERyYWdMaXN0ZW5lciApO1xuXG5leHBvcnQgZGVmYXVsdCBLZXlib2FyZERyYWdMaXN0ZW5lcjsiXSwibmFtZXMiOlsiQ2FsbGJhY2tUaW1lciIsIlByb3BlcnR5Iiwic3RlcFRpbWVyIiwiVGlueVByb3BlcnR5IiwiVHJhbnNmb3JtMyIsIlZlY3RvcjIiLCJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJvcHRpb25pemUiLCJwbGF0Zm9ybSIsIkV2ZW50VHlwZSIsIlBoZXRpb0FjdGlvbiIsIlRhbmRlbSIsImdsb2JhbEtleVN0YXRlVHJhY2tlciIsIktleWJvYXJkTGlzdGVuZXIiLCJLZXlib2FyZFV0aWxzIiwic2NlbmVyeSIsIlNjZW5lcnlFdmVudCIsImtleWJvYXJkRHJhZ2dpbmdLZXlzIiwibGVmdFJpZ2h0S2V5cyIsInVwRG93bktleXMiLCJpZ25vcmVkU2hpZnRQYXR0ZXJuIiwiQV9LRVlfU1RSSU5HX1BST1BFUlRZIiwiRF9LRVlfU1RSSU5HX1BST1BFUlRZIiwiV19LRVlfU1RSSU5HX1BST1BFUlRZIiwiU19LRVlfU1RSSU5HX1BST1BFUlRZIiwiQVJST1dfTEVGVF9LRVlfU1RSSU5HX1BST1BFUlRZIiwiQVJST1dfUklHSFRfS0VZX1NUUklOR19QUk9QRVJUWSIsIkFSUk9XX1VQX0tFWV9TVFJJTkdfUFJPUEVSVFkiLCJBUlJPV19ET1dOX0tFWV9TVFJJTkdfUFJPUEVSVFkiLCJMRUZUX1JJR0hUX0tFWV9TVFJJTkdfUFJPUEVSVElFUyIsIlVQX0RPV05fS0VZX1NUUklOR19QUk9QRVJUSUVTIiwiQUxMX0tFWV9TVFJJTkdfUFJPUEVSVElFUyIsIktleWJvYXJkRHJhZ0RpcmVjdGlvblRvS2V5U3RyaW5nUHJvcGVydGllc01hcCIsIk1hcCIsIktleWJvYXJkRHJhZ0xpc3RlbmVyIiwic3RlcEZvclNwZWVkIiwiZHQiLCJhc3NlcnQiLCJ1c2VEcmFnU3BlZWQiLCJzaGlmdEtleURvd24iLCJkZWx0YSIsInNoaWZ0RHJhZ1NwZWVkIiwiZHJhZ1NwZWVkIiwibW92ZUZyb21EZWx0YSIsImRlbHRhWCIsImRlbHRhWSIsImxlZnRLZXlEb3duUHJvcGVydHkiLCJ2YWx1ZSIsInJpZ2h0S2V5RG93blByb3BlcnR5IiwidXBLZXlEb3duUHJvcGVydHkiLCJkb3duS2V5RG93blByb3BlcnR5IiwidmVjdG9yRGVsdGEiLCJlcXVhbHMiLCJaRVJPIiwiZHJhZ0FjdGlvbiIsImV4ZWN1dGUiLCJwYXJlbnRUb01vZGVsUG9pbnQiLCJwYXJlbnRQb2ludCIsInRyYW5zZm9ybSIsImludmVyc2VEZWx0YTIiLCJsb2NhbFRvUGFyZW50UG9pbnQiLCJsb2NhbFBvaW50IiwidGFyZ2V0IiwiZ2V0Q3VycmVudFRhcmdldCIsImdldERyYWdCb3VuZHMiLCJfZHJhZ0JvdW5kc1Byb3BlcnR5IiwiZHJhZ0JvdW5kcyIsInNldFRyYW5zZm9ybSIsIl90cmFuc2Zvcm0iLCJnZXRUcmFuc2Zvcm0iLCJfZHJhZ1NwZWVkIiwiX3NoaWZ0RHJhZ1NwZWVkIiwiZHJhZ0RlbHRhIiwiX2RyYWdEZWx0YSIsInNoaWZ0RHJhZ0RlbHRhIiwiX3NoaWZ0RHJhZ0RlbHRhIiwibW92aW5nTGVmdCIsIm1vdmluZ1JpZ2h0IiwibW92aW5nVXAiLCJtb3ZpbmdEb3duIiwiaXNQcmVzc2VkUHJvcGVydHkiLCJfcG9pbnRlciIsInRyYWlsIiwibGFzdE5vZGUiLCJpc0RyYWdnaW5nIiwiYXR0YWNoZWRMaXN0ZW5lciIsIl9wb2ludGVyTGlzdGVuZXIiLCJrZXlkb3duIiwiZXZlbnQiLCJkb21FdmVudCIsIm1ldGFLZXkiLCJpc01vdmVtZW50S2V5Iiwic2FmYXJpIiwicHJlc3NlZEtleVN0cmluZ1Byb3BlcnRpZXNQcm9wZXJ0eSIsImxlbmd0aCIsImludGVycnVwdCIsInByZXZlbnREZWZhdWx0Iiwic3RhcnROZXh0S2V5Ym9hcmRFdmVudCIsInBvaW50ZXIiLCJpc0F0dGFjaGVkIiwiYWRkSW5wdXRMaXN0ZW5lciIsImRyYWdTdGFydEFjdGlvbiIsInJlc3RhcnRUaW1lck5leHRLZXlib2FyZEV2ZW50IiwiY2FsbGJhY2tUaW1lciIsInN0b3AiLCJzdGFydCIsIl9tb3ZlT25Ib2xkRGVsYXkiLCJmaXJlIiwibWFwTW9kZWxQb2ludCIsIm1vZGVsUG9pbnQiLCJfbWFwUG9zaXRpb24iLCJjbG9zZXN0UG9pbnRUbyIsImNsZWFyUG9pbnRlciIsImxpc3RlbmVycyIsImluY2x1ZGVzIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImRpc3Bvc2UiLCJfZGlzcG9zZUtleWJvYXJkRHJhZ0xpc3RlbmVyIiwicHJvdmlkZWRPcHRpb25zIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsInRyYW5zbGF0ZU5vZGUiLCJvcHRpb25zIiwia2V5Ym9hcmREcmFnRGlyZWN0aW9uIiwibWFwUG9zaXRpb24iLCJkcmFnIiwiZW5kIiwibW92ZU9uSG9sZERlbGF5IiwibW92ZU9uSG9sZEludGVydmFsIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9SZWFkT25seSIsImtleVN0cmluZ1Byb3BlcnRpZXMiLCJnZXQiLCJzdXBlck9wdGlvbnMiLCJtb2RlbERlbHRhIiwibGluayIsInByZXNzZWRLZXlTdHJpbmdQcm9wZXJ0aWVzIiwiX3N0YXJ0IiwiX2RyYWciLCJfZW5kIiwiX3RyYW5zbGF0ZU5vZGUiLCJfcG9zaXRpb25Qcm9wZXJ0eSIsImFkZExpc3RlbmVyIiwiYm91bmRTdGVwTGlzdGVuZXIiLCJwYXJhbWV0ZXJzIiwibmFtZSIsInBoZXRpb1R5cGUiLCJTY2VuZXJ5RXZlbnRJTyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwibmV3UG9zaXRpb24iLCJ0cmFuc2xhdGlvbiIsInBsdXMiLCJzeW50aGV0aWNFdmVudCIsImNyZWF0ZVN5bnRoZXRpY0V2ZW50IiwicGhldGlvSGlnaEZyZXF1ZW5jeSIsImRyYWdFbmRBY3Rpb24iLCJyZW1vdmVMaXN0ZW5lciIsImxpc3RlbmVyIiwiYmluZCIsImNhbGxiYWNrIiwiZGVsYXkiLCJpbnRlcnZhbCIsImxhenlMaW5rIiwiZHJhZ0tleXNEb3duIiwiYWRkU3RhcnRDYWxsYmFja1RpbWVyTGlzdGVuZXIiLCJrZXlQcm9wZXJ0eSIs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