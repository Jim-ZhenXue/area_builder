// Copyright 2017-2024, University of Colorado Boulder
/**
 * PressListener subtype customized for handling most drag-related listener needs.
 *
 * DragListener uses some specific terminology that is helpful to understand:
 *
 * - Drag target: The node whose trail is used for coordinate transforms. When a targetNode is specified, it will be the
 *                drag target. Otherwise, whatever was the currentTarget during event bubbling for the event that
 *                triggered press will be used (almost always the node that the listener is added to).
 * - Global coordinate frame: Coordinate frame of the Display (specifically its rootNode's local coordinate frame),
 *                            that in some applications will be screen coordinates.
 * - Parent coordinate frame: The parent coordinate frame of our drag target. Basically, it's the coordinate frame
 *                            you'd need to use to set dragTarget.translation = <parent coordinate frame point> for the
 *                            drag target to follow the pointer.
 * - Local coordinate frame: The local coordinate frame of our drag target, where (0,0) would be at the drag target's
 *                           origin.
 * - Model coordinate frame: Optionally defined by a model-view transform (treating the parent coordinate frame as the
 *                           view). When a transform is provided, it's the coordinate frame needed for setting
 *                           dragModelElement.position = <model coordinate frame point>. If a transform is not provided
 *                           (or overridden), it will be the same as the parent coordinate frame.
 *
 * The typical coordinate handling of DragListener is to:
 * 1. When a drag is started (with press), record the pointer's position in the local coordinate frame. This is visually
 *    where the pointer is over the drag target, and typically most drags will want to move the dragged element so that
 *    the pointer continues to be over this point.
 * 2. When the pointer is moved, compute the new parent translation to keep the pointer on the same place on the
 *    dragged element.
 * 3. (optionally) map that to a model position, and (optionally) move that model position to satisfy any constraints of
 *    where the element can be dragged (recomputing the parent/model translation as needed)
 * 4. Apply the required translation (with a provided drag callback, using the positionProperty, or directly
 *    transforming the Node if translateNode:true).
 *
 * For example usage, see scenery/examples/input.html
 *
 * For most PhET model-view usage, it's recommended to include a model position Property as the `positionProperty`
 * option, along with the `transform` option specifying the MVT. By default, this will then assume that the Node with
 * the listener is positioned in the "view" coordinate frame, and will properly handle offsets and transformations.
 * It is assumed that when the model `positionProperty` changes, that the position of the Node would also change.
 * If it's another Node being transformed, please use the `targetNode` option to specify which Node is being
 * transformed. If something more complicated than a Node being transformed is going on (like positioning multiple
 * items, positioning based on the center, changing something in CanvasNode), it's recommended to pass the
 * `useParentOffset` option (so that the DragListener will NOT try to compute offsets based on the Node's position), or
 * to use `applyOffset:false` (effectively having drags reposition the Node so that the origin is at the pointer).
 *
 * The typical PhET usage would look like:
 *
 *   new DragListener( {
 *     positionProperty: someObject.positionProperty,
 *     transform: modelViewTransform
 *   } )
 *
 * Additionally, for PhET usage it's also fine NOT to hook into a `positionProperty`. Typically using start/end/drag,
 * and values can be read out (like `modelPoint`, `localPoint`, `parentPoint`, `modelDelta`) from the listener to do
 * operations. For instance, if deltas and model positions are the only thing desired:
 *
 *   new DragListener( {
 *     drag: ( event, listener ) => {
 *       doSomethingWith( listener.modelDelta, listener.modelPoint );
 *     }
 *   } )
 *
 * It's completely fine to use one DragListener with multiple objects, however this isn't done as much since specifying
 * positionProperty only works with ONE model position Property (so if things are backed by the same Property it would
 * be fine). Doing things based on modelPoint/modelDelta/etc. should be completely fine using one listener with
 * multiple nodes. The typical pattern IS creating one DragListener per draggable view Node.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Property from '../../../axon/js/Property.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioAction from '../../../tandem/js/PhetioAction.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { PressListener, scenery, SceneryEvent, TransformTracker } from '../imports.js';
// Scratch vectors used to prevent allocations
const scratchVector2A = new Vector2(0, 0);
const isPressedListener = (listener)=>listener.isPressed;
let DragListener = class DragListener extends PressListener {
    /**
   * Attempts to start a drag with a press.
   *
   * NOTE: This is safe to call externally in order to attempt to start a press. dragListener.canPress( event ) can
   * be used to determine whether this will actually start a drag.
   *
   * @param event
   * @param [targetNode] - If provided, will take the place of the targetNode for this call. Useful for forwarded presses.
   * @param [callback] - to be run at the end of the function, but only on success
   * @returns success - Returns whether the press was actually started
   */ press(event, targetNode, callback) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener press');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        const success = super.press(event, targetNode, ()=>{
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener successful press');
            sceneryLog && sceneryLog.InputListener && sceneryLog.push();
            assert && assert(isPressedListener(this));
            const pressedListener = this;
            // signify that this listener is reserved for dragging so that other listeners can change
            // their behavior during scenery event dispatch
            pressedListener.pointer.reserveForDrag();
            this.attachTransformTracker();
            assert && assert(pressedListener.pointer.point !== null);
            const point = pressedListener.pointer.point;
            // Compute the parent point corresponding to the pointer's position
            const parentPoint = this.globalToParentPoint(this._localPoint.set(point));
            if (this._useParentOffset) {
                this.modelToParentPoint(this._parentOffset.set(this._positionProperty.value)).subtract(parentPoint);
            }
            // Set the local point
            this.parentToLocalPoint(parentPoint);
            this.reposition(point);
            // Notify after positioning and other changes
            this._start && this._start(event, pressedListener);
            callback && callback();
            sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        });
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        return success;
    }
    /**
   * Stops the drag.
   *
   * This can be called from the outside to stop the drag without the pointer having actually fired any 'up'
   * events. If the cancel/interrupt behavior is more preferable, call interrupt() on this listener instead.
   *
   * @param [event] - scenery event if there was one
   * @param [callback] - called at the end of the release
   */ release(event, callback) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener release');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        super.release(event, ()=>{
            this.detachTransformTracker();
            // Notify after the rest of release is called in order to prevent it from triggering interrupt().
            this._end && this._end(event || null, this);
            callback && callback();
        });
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Components using DragListener should generally not be activated with a click. A single click from alternative
   * input would pick up the component then immediately release it. But occasionally that is desirable and can be
   * controlled with the canClick option.
   */ canClick() {
        return super.canClick() && this._canClick;
    }
    /**
   * Activate the DragListener with a click activation. Usually, DragListener will NOT be activated with a click
   * and canClick will return false. Components that can be dragged usually should not be picked up/released
   * from a single click event that may have even come from event bubbling. But it can be optionally allowed for some
   * components that have drag functionality but can still be activated with a single click event.
   * (scenery-internal) (part of the scenery listener API)
   */ click(event, callback) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener click');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        const success = super.click(event, ()=>{
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener successful press');
            sceneryLog && sceneryLog.InputListener && sceneryLog.push();
            // notify that we have started a change
            this._start && this._start(event, this);
            callback && callback();
            // notify that we have finished a 'drag' activation through click
            this._end && this._end(event, this);
            sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        });
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        return success;
    }
    /**
   * Called when move events are fired on the attached pointer listener during a drag.
   */ drag(event) {
        assert && assert(isPressedListener(this));
        const pressedListener = this;
        const point = pressedListener.pointer.point;
        // Ignore global moves that have zero length (Chrome might autofire, see
        // https://code.google.com/p/chromium/issues/detail?id=327114)
        if (!point || this._globalPoint.equals(point)) {
            return;
        }
        // If we got interrupted while events were queued up, we MAY get a drag when not pressed. We can ignore this.
        if (!this.isPressed) {
            return;
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener drag');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this._dragAction.execute(event);
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Attempts to start a touch snag, given a SceneryEvent.
   *
   * Should be safe to be called externally with an event.
   */ tryTouchSnag(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener tryTouchSnag');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        if (this._allowTouchSnag && (!this.attach || !event.pointer.isAttached())) {
            this.press(event);
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Returns a defensive copy of the local-coordinate-frame point of the drag.
   */ getGlobalPoint() {
        return this._globalPoint.copy();
    }
    get globalPoint() {
        return this.getGlobalPoint();
    }
    /**
   * Returns a defensive copy of the local-coordinate-frame point of the drag.
   */ getLocalPoint() {
        return this._localPoint.copy();
    }
    get localPoint() {
        return this.getLocalPoint();
    }
    /**
   * Returns a defensive copy of the parent-coordinate-frame point of the drag.
   */ getParentPoint() {
        return this._parentPoint.copy();
    }
    get parentPoint() {
        return this.getParentPoint();
    }
    /**
   * Returns a defensive copy of the model-coordinate-frame point of the drag.
   */ getModelPoint() {
        return this._modelPoint.copy();
    }
    get modelPoint() {
        return this.getModelPoint();
    }
    /**
   * Returns a defensive copy of the model-coordinate-frame delta.
   */ getModelDelta() {
        return this._modelDelta.copy();
    }
    get modelDelta() {
        return this.getModelDelta();
    }
    /**
   * Maps a point from the global coordinate frame to our drag target's parent coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed.
   */ globalToParentPoint(globalPoint) {
        assert && assert(isPressedListener(this));
        const pressedListener = this;
        let referenceResult;
        if (assert) {
            referenceResult = pressedListener.pressedTrail.globalToParentPoint(globalPoint);
        }
        pressedListener.pressedTrail.getParentTransform().getInverse().multiplyVector2(globalPoint);
        assert && assert(globalPoint.equals(referenceResult));
        return globalPoint;
    }
    /**
   * Maps a point from the drag target's parent coordinate frame to its local coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed.
   */ parentToLocalPoint(parentPoint) {
        assert && assert(isPressedListener(this));
        const pressedListener = this;
        let referenceResult;
        if (assert) {
            referenceResult = pressedListener.pressedTrail.lastNode().parentToLocalPoint(parentPoint);
        }
        pressedListener.pressedTrail.lastNode().getTransform().getInverse().multiplyVector2(parentPoint);
        assert && assert(parentPoint.equals(referenceResult));
        return parentPoint;
    }
    /**
   * Maps a point from the drag target's local coordinate frame to its parent coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed.
   */ localToParentPoint(localPoint) {
        assert && assert(isPressedListener(this));
        const pressedListener = this;
        let referenceResult;
        if (assert) {
            referenceResult = pressedListener.pressedTrail.lastNode().localToParentPoint(localPoint);
        }
        pressedListener.pressedTrail.lastNode().getMatrix().multiplyVector2(localPoint);
        assert && assert(localPoint.equals(referenceResult));
        return localPoint;
    }
    /**
   * Maps a point from the drag target's parent coordinate frame to the model coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed. Note that by default, unless a transform is provided,
   * the parent coordinate frame will be the same as the model coordinate frame.
   */ parentToModelPoint(parentPoint) {
        if (this._transform) {
            const transform = this._transform instanceof Transform3 ? this._transform : this._transform.value;
            transform.getInverse().multiplyVector2(parentPoint);
        }
        return parentPoint;
    }
    /**
   * Maps a point from the model coordinate frame to the drag target's parent coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed. Note that by default, unless a transform is provided,
   * the parent coordinate frame will be the same as the model coordinate frame.
   */ modelToParentPoint(modelPoint) {
        if (this._transform) {
            const transform = this._transform instanceof Transform3 ? this._transform : this._transform.value;
            transform.getMatrix().multiplyVector2(modelPoint);
        }
        return modelPoint;
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
            modelPoint = this._mapPosition(modelPoint);
        }
        if (this._dragBoundsProperty.value) {
            return this._dragBoundsProperty.value.closestPointTo(modelPoint);
        } else {
            return modelPoint;
        }
    }
    /**
   * Mutates the parentPoint given to account for the initial pointer's offset from the drag target's origin.
   */ applyParentOffset(parentPoint) {
        if (this._offsetPosition) {
            parentPoint.add(this._offsetPosition(parentPoint, this));
        }
        // Don't apply any offset if applyOffset is false
        if (this._applyOffset) {
            if (this._useParentOffset) {
                parentPoint.add(this._parentOffset);
            } else {
                // Add the difference between our local origin (in the parent coordinate frame) and the local point (in the same
                // parent coordinate frame).
                parentPoint.subtract(this.localToParentPoint(scratchVector2A.set(this._localPoint)));
                parentPoint.add(this.localToParentPoint(scratchVector2A.setXY(0, 0)));
            }
        }
    }
    /**
   * Triggers an update of the drag position, potentially changing position properties.
   *
   * Should be called when something that changes the output positions of the drag occurs (most often, a drag event
   * itself).
   */ reposition(globalPoint) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener reposition');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        assert && assert(isPressedListener(this));
        const pressedListener = this;
        this._globalPoint.set(globalPoint);
        // Update parentPoint mutably.
        this.applyParentOffset(this.globalToParentPoint(this._parentPoint.set(globalPoint)));
        // To compute the delta (new - old), we first mutate it to (-old)
        this._modelDelta.set(this._modelPoint).negate();
        // Compute the modelPoint from the parentPoint
        this._modelPoint.set(this.mapModelPoint(this.parentToModelPoint(scratchVector2A.set(this._parentPoint))));
        // Complete the delta computation
        this._modelDelta.add(this._modelPoint);
        // Apply any mapping changes back to the parent point
        this.modelToParentPoint(this._parentPoint.set(this._modelPoint));
        if (this._translateNode) {
            pressedListener.pressedTrail.lastNode().translation = this._parentPoint;
        }
        if (this._positionProperty) {
            this._positionProperty.value = this._modelPoint.copy(); // Include an extra reference so that it will change.
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called with 'touchenter' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly. See the press method instead.
   */ touchenter(event) {
        if (event.pointer.isDownProperty.value) {
            this.tryTouchSnag(event);
        }
    }
    /**
   * Called with 'touchmove' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly. See the press method instead.
   */ touchmove(event) {
        this.tryTouchSnag(event);
    }
    /**
   * Called when an ancestor's transform has changed (when trackAncestors is true).
   */ ancestorTransformed() {
        assert && assert(isPressedListener(this));
        const pressedListener = this;
        const point = pressedListener.pointer.point;
        if (point) {
            // Reposition based on the current point.
            this.reposition(point);
        }
    }
    /**
   * Attaches our transform tracker (begins listening to the ancestor transforms)
   */ attachTransformTracker() {
        assert && assert(isPressedListener(this));
        const pressedListener = this;
        if (this._trackAncestors) {
            this._transformTracker = new TransformTracker(pressedListener.pressedTrail.copy().removeDescendant());
            this._transformTracker.addListener(this._transformTrackerListener);
        }
    }
    /**
   * Detaches our transform tracker (stops listening to the ancestor transforms)
   */ detachTransformTracker() {
        if (this._transformTracker) {
            this._transformTracker.removeListener(this._transformTrackerListener);
            this._transformTracker.dispose();
            this._transformTracker = null;
        }
    }
    /**
   * Returns the drag bounds of the listener.
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
   * Interrupts the listener, releasing it (canceling behavior).
   *
   * This effectively releases/ends the press, and sets the `interrupted` flag to true while firing these events
   * so that code can determine whether a release/end happened naturally, or was canceled in some way.
   *
   * This can be called manually, but can also be called through node.interruptSubtreeInput().
   */ interrupt() {
        if (this.pointer && this.pointer.isTouchLike()) {
            this._lastInterruptedTouchLikePointer = this.pointer;
        }
        super.interrupt();
    }
    /**
   * Returns whether a press can be started with a particular event.
   */ canPress(event) {
        if (event.pointer === this._lastInterruptedTouchLikePointer) {
            return false;
        }
        return super.canPress(event);
    }
    /**
   * Disposes the listener, releasing references. It should not be used after this.
   */ dispose() {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener dispose');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this._dragAction.dispose();
        this.detachTransformTracker();
        super.dispose();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Creates an input listener that forwards events to the specified input listener. The target listener should
   * probably be using PressListener.options.targetNode so that the forwarded drag has the correct Trail
   *
   * See https://github.com/phetsims/scenery/issues/639
   */ static createForwardingListener(down, providedOptions) {
        const options = optionize()({
            allowTouchSnag: true // see https://github.com/phetsims/scenery/issues/999
        }, providedOptions);
        return {
            down (event) {
                if (event.canStartPress()) {
                    down(event);
                }
            },
            touchenter (event) {
                options.allowTouchSnag && this.down(event);
            },
            touchmove (event) {
                options.allowTouchSnag && this.down(event);
            }
        };
    }
    constructor(providedOptions){
        const options = optionize()({
            positionProperty: null,
            // start is preferred over passing press(), as the drag start hasn't been fully processed at that point.
            start: null,
            // end is preferred over passing release(), as the drag start hasn't been fully processed at that point.
            end: null,
            drag: _.noop,
            transform: null,
            dragBoundsProperty: null,
            allowTouchSnag: true,
            applyOffset: true,
            useParentOffset: false,
            trackAncestors: false,
            translateNode: false,
            mapPosition: null,
            offsetPosition: null,
            canClick: false,
            tandem: Tandem.REQUIRED,
            // Though DragListener is not instrumented, declare these here to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60.
            // DragListener by default doesn't allow PhET-iO to trigger drag Action events
            phetioReadOnly: true,
            phetioFeatured: PhetioObject.DEFAULT_OPTIONS.phetioFeatured
        }, providedOptions);
        assert && assert(!options.dragBounds, 'options.dragBounds was removed in favor of options.dragBoundsProperty');
        assert && assert(!options.useParentOffset || options.positionProperty, 'If useParentOffset is set, a positionProperty is required');
        // @ts-expect-error TODO: See https://github.com/phetsims/phet-core/issues/128
        super(options);
        this._allowTouchSnag = options.allowTouchSnag;
        this._applyOffset = options.applyOffset;
        this._useParentOffset = options.useParentOffset;
        this._trackAncestors = options.trackAncestors;
        this._translateNode = options.translateNode;
        this._transform = options.transform;
        this._positionProperty = options.positionProperty;
        this._mapPosition = options.mapPosition;
        this._offsetPosition = options.offsetPosition;
        this._dragBoundsProperty = options.dragBoundsProperty || new Property(null);
        this._start = options.start;
        this._end = options.end;
        this._canClick = options.canClick;
        this.isUserControlledProperty = this.isPressedProperty;
        this._globalPoint = new Vector2(0, 0);
        this._localPoint = new Vector2(0, 0);
        this._parentPoint = new Vector2(0, 0);
        this._modelPoint = new Vector2(0, 0);
        this._modelDelta = new Vector2(0, 0);
        this._parentOffset = new Vector2(0, 0);
        this._transformTracker = null;
        this._transformTrackerListener = this.ancestorTransformed.bind(this);
        this._lastInterruptedTouchLikePointer = null;
        this._dragAction = new PhetioAction((event)=>{
            assert && assert(isPressedListener(this));
            const pressedListener = this;
            const point = pressedListener.pointer.point;
            if (point) {
                // This is done first, before the drag listener is called (from the prototype drag call)
                if (!this._globalPoint.equals(point)) {
                    this.reposition(point);
                }
            }
            PressListener.prototype.drag.call(this, event);
        }, {
            parameters: [
                {
                    name: 'event',
                    phetioType: SceneryEvent.SceneryEventIO
                }
            ],
            phetioFeatured: options.phetioFeatured,
            tandem: options.tandem.createTandem('dragAction'),
            phetioHighFrequency: true,
            phetioDocumentation: 'Emits whenever a drag occurs with an SceneryEventIO argument.',
            phetioReadOnly: options.phetioReadOnly,
            phetioEventType: EventType.USER
        });
    }
};
export { DragListener as default };
scenery.register('DragListener', DragListener);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL0RyYWdMaXN0ZW5lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcmVzc0xpc3RlbmVyIHN1YnR5cGUgY3VzdG9taXplZCBmb3IgaGFuZGxpbmcgbW9zdCBkcmFnLXJlbGF0ZWQgbGlzdGVuZXIgbmVlZHMuXG4gKlxuICogRHJhZ0xpc3RlbmVyIHVzZXMgc29tZSBzcGVjaWZpYyB0ZXJtaW5vbG9neSB0aGF0IGlzIGhlbHBmdWwgdG8gdW5kZXJzdGFuZDpcbiAqXG4gKiAtIERyYWcgdGFyZ2V0OiBUaGUgbm9kZSB3aG9zZSB0cmFpbCBpcyB1c2VkIGZvciBjb29yZGluYXRlIHRyYW5zZm9ybXMuIFdoZW4gYSB0YXJnZXROb2RlIGlzIHNwZWNpZmllZCwgaXQgd2lsbCBiZSB0aGVcbiAqICAgICAgICAgICAgICAgIGRyYWcgdGFyZ2V0LiBPdGhlcndpc2UsIHdoYXRldmVyIHdhcyB0aGUgY3VycmVudFRhcmdldCBkdXJpbmcgZXZlbnQgYnViYmxpbmcgZm9yIHRoZSBldmVudCB0aGF0XG4gKiAgICAgICAgICAgICAgICB0cmlnZ2VyZWQgcHJlc3Mgd2lsbCBiZSB1c2VkIChhbG1vc3QgYWx3YXlzIHRoZSBub2RlIHRoYXQgdGhlIGxpc3RlbmVyIGlzIGFkZGVkIHRvKS5cbiAqIC0gR2xvYmFsIGNvb3JkaW5hdGUgZnJhbWU6IENvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIERpc3BsYXkgKHNwZWNpZmljYWxseSBpdHMgcm9vdE5vZGUncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lKSxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQgaW4gc29tZSBhcHBsaWNhdGlvbnMgd2lsbCBiZSBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gKiAtIFBhcmVudCBjb29yZGluYXRlIGZyYW1lOiBUaGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgb2Ygb3VyIGRyYWcgdGFyZ2V0LiBCYXNpY2FsbHksIGl0J3MgdGhlIGNvb3JkaW5hdGUgZnJhbWVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlvdSdkIG5lZWQgdG8gdXNlIHRvIHNldCBkcmFnVGFyZ2V0LnRyYW5zbGF0aW9uID0gPHBhcmVudCBjb29yZGluYXRlIGZyYW1lIHBvaW50PiBmb3IgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnIHRhcmdldCB0byBmb2xsb3cgdGhlIHBvaW50ZXIuXG4gKiAtIExvY2FsIGNvb3JkaW5hdGUgZnJhbWU6IFRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lIG9mIG91ciBkcmFnIHRhcmdldCwgd2hlcmUgKDAsMCkgd291bGQgYmUgYXQgdGhlIGRyYWcgdGFyZ2V0J3NcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luLlxuICogLSBNb2RlbCBjb29yZGluYXRlIGZyYW1lOiBPcHRpb25hbGx5IGRlZmluZWQgYnkgYSBtb2RlbC12aWV3IHRyYW5zZm9ybSAodHJlYXRpbmcgdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIGFzIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3KS4gV2hlbiBhIHRyYW5zZm9ybSBpcyBwcm92aWRlZCwgaXQncyB0aGUgY29vcmRpbmF0ZSBmcmFtZSBuZWVkZWQgZm9yIHNldHRpbmdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ01vZGVsRWxlbWVudC5wb3NpdGlvbiA9IDxtb2RlbCBjb29yZGluYXRlIGZyYW1lIHBvaW50Pi4gSWYgYSB0cmFuc2Zvcm0gaXMgbm90IHByb3ZpZGVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgIChvciBvdmVycmlkZGVuKSwgaXQgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuXG4gKlxuICogVGhlIHR5cGljYWwgY29vcmRpbmF0ZSBoYW5kbGluZyBvZiBEcmFnTGlzdGVuZXIgaXMgdG86XG4gKiAxLiBXaGVuIGEgZHJhZyBpcyBzdGFydGVkICh3aXRoIHByZXNzKSwgcmVjb3JkIHRoZSBwb2ludGVyJ3MgcG9zaXRpb24gaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuIFRoaXMgaXMgdmlzdWFsbHlcbiAqICAgIHdoZXJlIHRoZSBwb2ludGVyIGlzIG92ZXIgdGhlIGRyYWcgdGFyZ2V0LCBhbmQgdHlwaWNhbGx5IG1vc3QgZHJhZ3Mgd2lsbCB3YW50IHRvIG1vdmUgdGhlIGRyYWdnZWQgZWxlbWVudCBzbyB0aGF0XG4gKiAgICB0aGUgcG9pbnRlciBjb250aW51ZXMgdG8gYmUgb3ZlciB0aGlzIHBvaW50LlxuICogMi4gV2hlbiB0aGUgcG9pbnRlciBpcyBtb3ZlZCwgY29tcHV0ZSB0aGUgbmV3IHBhcmVudCB0cmFuc2xhdGlvbiB0byBrZWVwIHRoZSBwb2ludGVyIG9uIHRoZSBzYW1lIHBsYWNlIG9uIHRoZVxuICogICAgZHJhZ2dlZCBlbGVtZW50LlxuICogMy4gKG9wdGlvbmFsbHkpIG1hcCB0aGF0IHRvIGEgbW9kZWwgcG9zaXRpb24sIGFuZCAob3B0aW9uYWxseSkgbW92ZSB0aGF0IG1vZGVsIHBvc2l0aW9uIHRvIHNhdGlzZnkgYW55IGNvbnN0cmFpbnRzIG9mXG4gKiAgICB3aGVyZSB0aGUgZWxlbWVudCBjYW4gYmUgZHJhZ2dlZCAocmVjb21wdXRpbmcgdGhlIHBhcmVudC9tb2RlbCB0cmFuc2xhdGlvbiBhcyBuZWVkZWQpXG4gKiA0LiBBcHBseSB0aGUgcmVxdWlyZWQgdHJhbnNsYXRpb24gKHdpdGggYSBwcm92aWRlZCBkcmFnIGNhbGxiYWNrLCB1c2luZyB0aGUgcG9zaXRpb25Qcm9wZXJ0eSwgb3IgZGlyZWN0bHlcbiAqICAgIHRyYW5zZm9ybWluZyB0aGUgTm9kZSBpZiB0cmFuc2xhdGVOb2RlOnRydWUpLlxuICpcbiAqIEZvciBleGFtcGxlIHVzYWdlLCBzZWUgc2NlbmVyeS9leGFtcGxlcy9pbnB1dC5odG1sXG4gKlxuICogRm9yIG1vc3QgUGhFVCBtb2RlbC12aWV3IHVzYWdlLCBpdCdzIHJlY29tbWVuZGVkIHRvIGluY2x1ZGUgYSBtb2RlbCBwb3NpdGlvbiBQcm9wZXJ0eSBhcyB0aGUgYHBvc2l0aW9uUHJvcGVydHlgXG4gKiBvcHRpb24sIGFsb25nIHdpdGggdGhlIGB0cmFuc2Zvcm1gIG9wdGlvbiBzcGVjaWZ5aW5nIHRoZSBNVlQuIEJ5IGRlZmF1bHQsIHRoaXMgd2lsbCB0aGVuIGFzc3VtZSB0aGF0IHRoZSBOb2RlIHdpdGhcbiAqIHRoZSBsaXN0ZW5lciBpcyBwb3NpdGlvbmVkIGluIHRoZSBcInZpZXdcIiBjb29yZGluYXRlIGZyYW1lLCBhbmQgd2lsbCBwcm9wZXJseSBoYW5kbGUgb2Zmc2V0cyBhbmQgdHJhbnNmb3JtYXRpb25zLlxuICogSXQgaXMgYXNzdW1lZCB0aGF0IHdoZW4gdGhlIG1vZGVsIGBwb3NpdGlvblByb3BlcnR5YCBjaGFuZ2VzLCB0aGF0IHRoZSBwb3NpdGlvbiBvZiB0aGUgTm9kZSB3b3VsZCBhbHNvIGNoYW5nZS5cbiAqIElmIGl0J3MgYW5vdGhlciBOb2RlIGJlaW5nIHRyYW5zZm9ybWVkLCBwbGVhc2UgdXNlIHRoZSBgdGFyZ2V0Tm9kZWAgb3B0aW9uIHRvIHNwZWNpZnkgd2hpY2ggTm9kZSBpcyBiZWluZ1xuICogdHJhbnNmb3JtZWQuIElmIHNvbWV0aGluZyBtb3JlIGNvbXBsaWNhdGVkIHRoYW4gYSBOb2RlIGJlaW5nIHRyYW5zZm9ybWVkIGlzIGdvaW5nIG9uIChsaWtlIHBvc2l0aW9uaW5nIG11bHRpcGxlXG4gKiBpdGVtcywgcG9zaXRpb25pbmcgYmFzZWQgb24gdGhlIGNlbnRlciwgY2hhbmdpbmcgc29tZXRoaW5nIGluIENhbnZhc05vZGUpLCBpdCdzIHJlY29tbWVuZGVkIHRvIHBhc3MgdGhlXG4gKiBgdXNlUGFyZW50T2Zmc2V0YCBvcHRpb24gKHNvIHRoYXQgdGhlIERyYWdMaXN0ZW5lciB3aWxsIE5PVCB0cnkgdG8gY29tcHV0ZSBvZmZzZXRzIGJhc2VkIG9uIHRoZSBOb2RlJ3MgcG9zaXRpb24pLCBvclxuICogdG8gdXNlIGBhcHBseU9mZnNldDpmYWxzZWAgKGVmZmVjdGl2ZWx5IGhhdmluZyBkcmFncyByZXBvc2l0aW9uIHRoZSBOb2RlIHNvIHRoYXQgdGhlIG9yaWdpbiBpcyBhdCB0aGUgcG9pbnRlcikuXG4gKlxuICogVGhlIHR5cGljYWwgUGhFVCB1c2FnZSB3b3VsZCBsb29rIGxpa2U6XG4gKlxuICogICBuZXcgRHJhZ0xpc3RlbmVyKCB7XG4gKiAgICAgcG9zaXRpb25Qcm9wZXJ0eTogc29tZU9iamVjdC5wb3NpdGlvblByb3BlcnR5LFxuICogICAgIHRyYW5zZm9ybTogbW9kZWxWaWV3VHJhbnNmb3JtXG4gKiAgIH0gKVxuICpcbiAqIEFkZGl0aW9uYWxseSwgZm9yIFBoRVQgdXNhZ2UgaXQncyBhbHNvIGZpbmUgTk9UIHRvIGhvb2sgaW50byBhIGBwb3NpdGlvblByb3BlcnR5YC4gVHlwaWNhbGx5IHVzaW5nIHN0YXJ0L2VuZC9kcmFnLFxuICogYW5kIHZhbHVlcyBjYW4gYmUgcmVhZCBvdXQgKGxpa2UgYG1vZGVsUG9pbnRgLCBgbG9jYWxQb2ludGAsIGBwYXJlbnRQb2ludGAsIGBtb2RlbERlbHRhYCkgZnJvbSB0aGUgbGlzdGVuZXIgdG8gZG9cbiAqIG9wZXJhdGlvbnMuIEZvciBpbnN0YW5jZSwgaWYgZGVsdGFzIGFuZCBtb2RlbCBwb3NpdGlvbnMgYXJlIHRoZSBvbmx5IHRoaW5nIGRlc2lyZWQ6XG4gKlxuICogICBuZXcgRHJhZ0xpc3RlbmVyKCB7XG4gKiAgICAgZHJhZzogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XG4gKiAgICAgICBkb1NvbWV0aGluZ1dpdGgoIGxpc3RlbmVyLm1vZGVsRGVsdGEsIGxpc3RlbmVyLm1vZGVsUG9pbnQgKTtcbiAqICAgICB9XG4gKiAgIH0gKVxuICpcbiAqIEl0J3MgY29tcGxldGVseSBmaW5lIHRvIHVzZSBvbmUgRHJhZ0xpc3RlbmVyIHdpdGggbXVsdGlwbGUgb2JqZWN0cywgaG93ZXZlciB0aGlzIGlzbid0IGRvbmUgYXMgbXVjaCBzaW5jZSBzcGVjaWZ5aW5nXG4gKiBwb3NpdGlvblByb3BlcnR5IG9ubHkgd29ya3Mgd2l0aCBPTkUgbW9kZWwgcG9zaXRpb24gUHJvcGVydHkgKHNvIGlmIHRoaW5ncyBhcmUgYmFja2VkIGJ5IHRoZSBzYW1lIFByb3BlcnR5IGl0IHdvdWxkXG4gKiBiZSBmaW5lKS4gRG9pbmcgdGhpbmdzIGJhc2VkIG9uIG1vZGVsUG9pbnQvbW9kZWxEZWx0YS9ldGMuIHNob3VsZCBiZSBjb21wbGV0ZWx5IGZpbmUgdXNpbmcgb25lIGxpc3RlbmVyIHdpdGhcbiAqIG11bHRpcGxlIG5vZGVzLiBUaGUgdHlwaWNhbCBwYXR0ZXJuIElTIGNyZWF0aW5nIG9uZSBEcmFnTGlzdGVuZXIgcGVyIGRyYWdnYWJsZSB2aWV3IE5vZGUuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFRyYW5zZm9ybTMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBSZXF1aXJlZE9wdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUmVxdWlyZWRPcHRpb24uanMnO1xuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcbmltcG9ydCBQaGV0aW9BY3Rpb24gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0FjdGlvbi5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCB7IEFsbERyYWdMaXN0ZW5lck9wdGlvbnMsIE5vZGUsIFBvaW50ZXIsIFByZXNzZWRQcmVzc0xpc3RlbmVyLCBQcmVzc0xpc3RlbmVyLCBQcmVzc0xpc3RlbmVyRE9NRXZlbnQsIFByZXNzTGlzdGVuZXJFdmVudCwgUHJlc3NMaXN0ZW5lck9wdGlvbnMsIHNjZW5lcnksIFNjZW5lcnlFdmVudCwgVElucHV0TGlzdGVuZXIsIFRyYW5zZm9ybVRyYWNrZXIgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuLy8gU2NyYXRjaCB2ZWN0b3JzIHVzZWQgdG8gcHJldmVudCBhbGxvY2F0aW9uc1xuY29uc3Qgc2NyYXRjaFZlY3RvcjJBID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcblxudHlwZSBPZmZzZXRQb3NpdGlvbjxMaXN0ZW5lciBleHRlbmRzIERyYWdMaXN0ZW5lcj4gPSAoIHBvaW50OiBWZWN0b3IyLCBsaXN0ZW5lcjogTGlzdGVuZXIgKSA9PiBWZWN0b3IyO1xuXG50eXBlIFNlbGZPcHRpb25zPExpc3RlbmVyIGV4dGVuZHMgRHJhZ0xpc3RlbmVyPiA9IEFsbERyYWdMaXN0ZW5lck9wdGlvbnM8TGlzdGVuZXIsIFByZXNzTGlzdGVuZXJET01FdmVudD4gJiB7XG5cbiAgLy8gSWYgdHJ1ZSwgdW5hdHRhY2hlZCB0b3VjaGVzIHRoYXQgbW92ZSBhY3Jvc3Mgb3VyIG5vZGUgd2lsbCB0cmlnZ2VyIGEgcHJlc3MoKS4gVGhpcyBoZWxwcyBzb21ldGltZXNcbiAgLy8gZm9yIHNtYWxsIGRyYWdnYWJsZSBvYmplY3RzLlxuICBhbGxvd1RvdWNoU25hZz86IGJvb2xlYW47XG5cbiAgLy8gSWYgdHJ1ZSwgdGhlIGluaXRpYWwgb2Zmc2V0IG9mIHRoZSBwb2ludGVyJ3MgcG9zaXRpb24gaXMgdGFrZW4gaW50byBhY2NvdW50LCBzbyB0aGF0IGRyYWdzIHdpbGxcbiAgLy8gdHJ5IHRvIGtlZXAgdGhlIHBvaW50ZXIgYXQgdGhlIHNhbWUgbG9jYWwgcG9pbnQgb2Ygb3VyIGRyYWdnZWQgbm9kZS5cbiAgLy8gTk9URTogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8gdXNlIHRoZSBnaXZlbiBOb2RlIChlaXRoZXIgdGhlIHRhcmdldE5vZGUgb3IgdGhlIG5vZGUgd2l0aCB0aGUgbGlzdGVuZXIgb24gaXQpXG4gIC8vIGFuZCB1c2UgaXRzIHRyYW5zZm9ybSB0byBjb21wdXRlIHRoZSBcImxvY2FsIHBvaW50XCIgKGFzc3VtaW5nIHRoYXQgdGhlIG5vZGUncyBsb2NhbCBvcmlnaW4gaXMgd2hhdCBpc1xuICAvLyB0cmFuc2Zvcm1lZCBhcm91bmQpLiBUaGlzIGlzIGlkZWFsIGZvciBtb3N0IHNpdHVhdGlvbnMsIGJ1dCBpdCdzIGFsc28gcG9zc2libGUgdG8gdXNlIGEgcGFyZW50LWNvb3JkaW5hdGVcbiAgLy8gYmFzZWQgYXBwcm9hY2ggZm9yIG9mZnNldHMgKHNlZSB1c2VQYXJlbnRPZmZzZXQpXG4gIGFwcGx5T2Zmc2V0PzogYm9vbGVhbjtcblxuICAvLyBJZiBzZXQgdG8gdHJ1ZSwgdGhlbiBhbnkgb2Zmc2V0cyBhcHBsaWVkIHdpbGwgYmUgaGFuZGxlZCBpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgc3BhY2UgdXNpbmcgdGhlXG4gIC8vIHBvc2l0aW9uUHJvcGVydHkgYXMgdGhlIFwiZ3JvdW5kIHRydXRoXCIsIGluc3RlYWQgb2YgbG9va2luZyBhdCB0aGUgTm9kZSdzIGFjdHVhbCBwb3NpdGlvbiBhbmQgdHJhbnNmb3JtLiBUaGlzXG4gIC8vIGlzIHVzZWZ1bCBpZiB0aGUgcG9zaXRpb24vdHJhbnNmb3JtIGNhbm5vdCBiZSBhcHBsaWVkIGRpcmVjdGx5IHRvIGEgc2luZ2xlIE5vZGUgKGUuZy4gcG9zaXRpb25pbmcgbXVsdGlwbGVcbiAgLy8gaW5kZXBlbmRlbnQgbm9kZXMsIG9yIGNlbnRlcmluZyB0aGluZ3MgaW5zdGVhZCBvZiB0cmFuc2Zvcm1pbmcgYmFzZWQgb24gdGhlIG9yaWdpbiBvZiB0aGUgTm9kZSkuXG4gIC8vXG4gIC8vIE5PVEU6IFVzZSB0aGlzIG9wdGlvbiBtb3N0IGxpa2VseSBpZiBjb252ZXJ0aW5nIGZyb20gTW92YWJsZURyYWdIYW5kbGVyLCBiZWNhdXNlIGl0IHRyYW5zZm9ybWVkIGJhc2VkIGluXG4gIC8vIHRoZSBwYXJlbnQncyBjb29yZGluYXRlIGZyYW1lLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEwMTRcbiAgLy9cbiAgLy8gTk9URTogVGhpcyBhbHNvIHJlcXVpcmVzIHByb3ZpZGluZyBhIHBvc2l0aW9uUHJvcGVydHlcbiAgdXNlUGFyZW50T2Zmc2V0PzogYm9vbGVhbjtcblxuICAvLyBJZiB0cnVlLCBhbmNlc3RvciB0cmFuc2Zvcm1zIHdpbGwgYmUgd2F0Y2hlZC4gSWYgdGhleSBjaGFuZ2UsIGl0IHdpbGwgdHJpZ2dlciBhIHJlcG9zaXRpb25pbmc7XG4gIC8vIHdoaWNoIHdpbGwgdXN1YWxseSBhZGp1c3QgdGhlIHBvc2l0aW9uL3RyYW5zZm9ybSB0byBtYWludGFpbiBwb3NpdGlvbi5cbiAgdHJhY2tBbmNlc3RvcnM/OiBib29sZWFuO1xuXG4gIC8vIElmIHByb3ZpZGVkLCBpdHMgcmVzdWx0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIHBhcmVudFBvaW50IGJlZm9yZSBjb21wdXRhdGlvbiBjb250aW51ZXMsIHRvIGFsbG93IHRoZSBhYmlsaXR5IHRvXG4gIC8vIFwib2Zmc2V0XCIgd2hlcmUgdGhlIHBvaW50ZXIgcG9zaXRpb24gc2VlbXMgdG8gYmUuIFVzZWZ1bCBmb3IgdG91Y2gsIHdoZXJlIHRoaW5ncyBzaG91bGRuJ3QgYmUgdW5kZXIgdGhlIHBvaW50ZXJcbiAgLy8gZGlyZWN0bHkuXG4gIG9mZnNldFBvc2l0aW9uPzogT2Zmc2V0UG9zaXRpb248TGlzdGVuZXI+IHwgbnVsbDtcblxuICAvLyBwZG9tXG4gIC8vIFdoZXRoZXIgdG8gYWxsb3cgYGNsaWNrYCBldmVudHMgdG8gdHJpZ2dlciBiZWhhdmlvciBpbiB0aGUgc3VwZXJ0eXBlIFByZXNzTGlzdGVuZXIuXG4gIC8vIEdlbmVyYWxseSBEcmFnTGlzdGVuZXIgc2hvdWxkIG5vdCByZXNwb25kIHRvIGNsaWNrIGV2ZW50cywgYnV0IHRoZXJlIGFyZSBzb21lIGV4Y2VwdGlvbnMgd2hlcmUgZHJhZ1xuICAvLyBmdW5jdGlvbmFsaXR5IGlzIG5pY2UgYnV0IGEgY2xpY2sgc2hvdWxkIHN0aWxsIGFjdGl2YXRlIHRoZSBjb21wb25lbnQuIFNlZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82OTZcbiAgY2FuQ2xpY2s/OiBib29sZWFuO1xufTtcblxudHlwZSBDcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXJPcHRpb25zID0ge1xuICBhbGxvd1RvdWNoU25hZz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBEcmFnTGlzdGVuZXJPcHRpb25zPExpc3RlbmVyIGV4dGVuZHMgRHJhZ0xpc3RlbmVyID0gRHJhZ0xpc3RlbmVyPiA9IFNlbGZPcHRpb25zPExpc3RlbmVyPiAmIFByZXNzTGlzdGVuZXJPcHRpb25zPExpc3RlbmVyPjtcbmV4cG9ydCB0eXBlIFByZXNzZWREcmFnTGlzdGVuZXIgPSBEcmFnTGlzdGVuZXIgJiBQcmVzc2VkUHJlc3NMaXN0ZW5lcjtcbmNvbnN0IGlzUHJlc3NlZExpc3RlbmVyID0gKCBsaXN0ZW5lcjogRHJhZ0xpc3RlbmVyICk6IGxpc3RlbmVyIGlzIFByZXNzZWREcmFnTGlzdGVuZXIgPT4gbGlzdGVuZXIuaXNQcmVzc2VkO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcmFnTGlzdGVuZXIgZXh0ZW5kcyBQcmVzc0xpc3RlbmVyIGltcGxlbWVudHMgVElucHV0TGlzdGVuZXIge1xuXG4gIC8vIEFsaWFzIGZvciBpc1ByZXNzZWRQcm9wZXJ0eSAoYXMgdGhpcyBuYW1lIG1ha2VzIG1vcmUgc2Vuc2UgZm9yIGRyYWdnaW5nKVxuICBwdWJsaWMgaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgcHJpdmF0ZSBfYWxsb3dUb3VjaFNuYWc6IFJlcXVpcmVkT3B0aW9uPFNlbGZPcHRpb25zPERyYWdMaXN0ZW5lcj4sICdhbGxvd1RvdWNoU25hZyc+O1xuICBwcml2YXRlIF9hcHBseU9mZnNldDogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ2FwcGx5T2Zmc2V0Jz47XG4gIHByaXZhdGUgX3VzZVBhcmVudE9mZnNldDogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ3VzZVBhcmVudE9mZnNldCc+O1xuICBwcml2YXRlIF90cmFja0FuY2VzdG9yczogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ3RyYWNrQW5jZXN0b3JzJz47XG4gIHByaXZhdGUgX3RyYW5zbGF0ZU5vZGU6IFJlcXVpcmVkT3B0aW9uPFNlbGZPcHRpb25zPERyYWdMaXN0ZW5lcj4sICd0cmFuc2xhdGVOb2RlJz47XG4gIHByaXZhdGUgX3RyYW5zZm9ybTogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ3RyYW5zZm9ybSc+O1xuICBwcml2YXRlIF9wb3NpdGlvblByb3BlcnR5OiBSZXF1aXJlZE9wdGlvbjxTZWxmT3B0aW9uczxEcmFnTGlzdGVuZXI+LCAncG9zaXRpb25Qcm9wZXJ0eSc+O1xuICBwcml2YXRlIF9tYXBQb3NpdGlvbjogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ21hcFBvc2l0aW9uJz47XG4gIHByaXZhdGUgX29mZnNldFBvc2l0aW9uOiBSZXF1aXJlZE9wdGlvbjxTZWxmT3B0aW9uczxQcmVzc2VkRHJhZ0xpc3RlbmVyPiwgJ29mZnNldFBvc2l0aW9uJz47XG4gIHByaXZhdGUgX2RyYWdCb3VuZHNQcm9wZXJ0eTogTm9uTnVsbGFibGU8UmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ2RyYWdCb3VuZHNQcm9wZXJ0eSc+PjtcbiAgcHJpdmF0ZSBfc3RhcnQ6IFJlcXVpcmVkT3B0aW9uPFNlbGZPcHRpb25zPFByZXNzZWREcmFnTGlzdGVuZXI+LCAnc3RhcnQnPjtcbiAgcHJpdmF0ZSBfZW5kOiBSZXF1aXJlZE9wdGlvbjxTZWxmT3B0aW9uczxQcmVzc2VkRHJhZ0xpc3RlbmVyPiwgJ2VuZCc+O1xuICBwcml2YXRlIF9jYW5DbGljazogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ2NhbkNsaWNrJz47XG5cbiAgLy8gVGhlIHBvaW50IG9mIHRoZSBkcmFnIGluIHRoZSB0YXJnZXQncyBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS4gVXBkYXRlZCB3aXRoIG11dGF0aW9uLlxuICBwcml2YXRlIF9nbG9iYWxQb2ludDogVmVjdG9yMjtcblxuICAvLyBUaGUgcG9pbnQgb2YgdGhlIGRyYWcgaW4gdGhlIHRhcmdldCdzIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuIFVwZGF0ZWQgd2l0aCBtdXRhdGlvbi5cbiAgcHJpdmF0ZSBfbG9jYWxQb2ludDogVmVjdG9yMjtcblxuICAvLyBDdXJyZW50IGRyYWcgcG9pbnQgaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lLiBVcGRhdGVkIHdpdGggbXV0YXRpb24uXG4gIHByaXZhdGUgX3BhcmVudFBvaW50OiBWZWN0b3IyO1xuXG4gIC8vIEN1cnJlbnQgZHJhZyBwb2ludCBpbiB0aGUgbW9kZWwgY29vcmRpbmF0ZSBmcmFtZVxuICBwcml2YXRlIF9tb2RlbFBvaW50OiBWZWN0b3IyO1xuXG4gIC8vIFN0b3JlcyB0aGUgbW9kZWwgZGVsdGEgY29tcHV0ZWQgZHVyaW5nIGV2ZXJ5IHJlcG9zaXRpb25pbmdcbiAgcHJpdmF0ZSBfbW9kZWxEZWx0YTogVmVjdG9yMjtcblxuICAvLyBJZiB1c2VQYXJlbnRPZmZzZXQgaXMgdHJ1ZSwgdGhpcyB3aWxsIGJlIHNldCB0byB0aGUgcGFyZW50LWNvb3JkaW5hdGUgb2Zmc2V0IGF0IHRoZSBzdGFydFxuICAvLyBvZiBhIGRyYWcsIGFuZCB0aGUgXCJvZmZzZXRcIiB3aWxsIGJlIGhhbmRsZWQgYnkgYXBwbHlpbmcgdGhpcyBvZmZzZXQgY29tcGFyZWQgdG8gd2hlcmUgdGhlIHBvaW50ZXIgaXMuXG4gIHByaXZhdGUgX3BhcmVudE9mZnNldDogVmVjdG9yMjtcblxuICAvLyBIYW5kbGVzIHdhdGNoaW5nIGFuY2VzdG9yIHRyYW5zZm9ybXMgZm9yIGNhbGxiYWNrcy5cbiAgcHJpdmF0ZSBfdHJhbnNmb3JtVHJhY2tlcjogVHJhbnNmb3JtVHJhY2tlciB8IG51bGw7XG5cbiAgLy8gTGlzdGVuZXIgcGFzc2VkIHRvIHRoZSB0cmFuc2Zvcm0gdHJhY2tlclxuICBwcml2YXRlIF90cmFuc2Zvcm1UcmFja2VyTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgLy8gVGhlcmUgYXJlIGNhc2VzIGxpa2UgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy85NyB3aGVyZSBpZlxuICAvLyBhIHRvdWNoZW50ZXIgc3RhcnRzIGEgZHJhZyB0aGF0IGlzIElNTUVESUFURUxZIGludGVycnVwdGVkLCB0aGUgdG91Y2hkb3duIHdvdWxkIHN0YXJ0IGFub3RoZXIgZHJhZy4gV2UgcmVjb3JkXG4gIC8vIGludGVycnVwdGlvbnMgaGVyZSBzbyB0aGF0IHdlIGNhbiBwcmV2ZW50IGZ1dHVyZSBlbnRlci9kb3duIGV2ZW50cyBmcm9tIHRoZSBzYW1lIHRvdWNoIHBvaW50ZXIgZnJvbSB0cmlnZ2VyaW5nXG4gIC8vIGFub3RoZXIgc3RhcnREcmFnLlxuICBwcml2YXRlIF9sYXN0SW50ZXJydXB0ZWRUb3VjaExpa2VQb2ludGVyOiBQb2ludGVyIHwgbnVsbDtcblxuICAvLyBFbWl0dGVkIG9uIGRyYWcuIFVzZWQgZm9yIHRyaWdnZXJpbmcgcGhldC1pbyBldmVudHMgdG8gdGhlIGRhdGEgc3RyZWFtLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg0MlxuICBwcml2YXRlIF9kcmFnQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBQcmVzc0xpc3RlbmVyRXZlbnQgXT47XG5cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IERyYWdMaXN0ZW5lck9wdGlvbnM8UHJlc3NlZERyYWdMaXN0ZW5lcj4gKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEcmFnTGlzdGVuZXJPcHRpb25zPFByZXNzZWREcmFnTGlzdGVuZXI+LCBTZWxmT3B0aW9uczxQcmVzc2VkRHJhZ0xpc3RlbmVyPiwgUHJlc3NMaXN0ZW5lck9wdGlvbnM8UHJlc3NlZERyYWdMaXN0ZW5lcj4+KCkoIHtcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IG51bGwsXG5cbiAgICAgIC8vIHN0YXJ0IGlzIHByZWZlcnJlZCBvdmVyIHBhc3NpbmcgcHJlc3MoKSwgYXMgdGhlIGRyYWcgc3RhcnQgaGFzbid0IGJlZW4gZnVsbHkgcHJvY2Vzc2VkIGF0IHRoYXQgcG9pbnQuXG4gICAgICBzdGFydDogbnVsbCxcblxuICAgICAgLy8gZW5kIGlzIHByZWZlcnJlZCBvdmVyIHBhc3NpbmcgcmVsZWFzZSgpLCBhcyB0aGUgZHJhZyBzdGFydCBoYXNuJ3QgYmVlbiBmdWxseSBwcm9jZXNzZWQgYXQgdGhhdCBwb2ludC5cbiAgICAgIGVuZDogbnVsbCxcblxuICAgICAgZHJhZzogXy5ub29wLFxuICAgICAgdHJhbnNmb3JtOiBudWxsLFxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBudWxsLFxuICAgICAgYWxsb3dUb3VjaFNuYWc6IHRydWUsXG4gICAgICBhcHBseU9mZnNldDogdHJ1ZSxcbiAgICAgIHVzZVBhcmVudE9mZnNldDogZmFsc2UsXG4gICAgICB0cmFja0FuY2VzdG9yczogZmFsc2UsXG4gICAgICB0cmFuc2xhdGVOb2RlOiBmYWxzZSxcbiAgICAgIG1hcFBvc2l0aW9uOiBudWxsLFxuICAgICAgb2Zmc2V0UG9zaXRpb246IG51bGwsXG4gICAgICBjYW5DbGljazogZmFsc2UsXG5cbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuXG4gICAgICAvLyBUaG91Z2ggRHJhZ0xpc3RlbmVyIGlzIG5vdCBpbnN0cnVtZW50ZWQsIGRlY2xhcmUgdGhlc2UgaGVyZSB0byBzdXBwb3J0IHByb3Blcmx5IHBhc3NpbmcgdGhpcyB0byBjaGlsZHJlbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzYwLlxuICAgICAgLy8gRHJhZ0xpc3RlbmVyIGJ5IGRlZmF1bHQgZG9lc24ndCBhbGxvdyBQaEVULWlPIHRvIHRyaWdnZXIgZHJhZyBBY3Rpb24gZXZlbnRzXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiBQaGV0aW9PYmplY3QuREVGQVVMVF9PUFRJT05TLnBoZXRpb0ZlYXR1cmVkXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCBvcHRpb25zIGFzIHVua25vd24gYXMgeyBkcmFnQm91bmRzOiBCb3VuZHMyIH0gKS5kcmFnQm91bmRzLCAnb3B0aW9ucy5kcmFnQm91bmRzIHdhcyByZW1vdmVkIGluIGZhdm9yIG9mIG9wdGlvbnMuZHJhZ0JvdW5kc1Byb3BlcnR5JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLnVzZVBhcmVudE9mZnNldCB8fCBvcHRpb25zLnBvc2l0aW9uUHJvcGVydHksICdJZiB1c2VQYXJlbnRPZmZzZXQgaXMgc2V0LCBhIHBvc2l0aW9uUHJvcGVydHkgaXMgcmVxdWlyZWQnICk7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1jb3JlL2lzc3Vlcy8xMjhcbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5fYWxsb3dUb3VjaFNuYWcgPSBvcHRpb25zLmFsbG93VG91Y2hTbmFnO1xuICAgIHRoaXMuX2FwcGx5T2Zmc2V0ID0gb3B0aW9ucy5hcHBseU9mZnNldDtcbiAgICB0aGlzLl91c2VQYXJlbnRPZmZzZXQgPSBvcHRpb25zLnVzZVBhcmVudE9mZnNldDtcbiAgICB0aGlzLl90cmFja0FuY2VzdG9ycyA9IG9wdGlvbnMudHJhY2tBbmNlc3RvcnM7XG4gICAgdGhpcy5fdHJhbnNsYXRlTm9kZSA9IG9wdGlvbnMudHJhbnNsYXRlTm9kZTtcbiAgICB0aGlzLl90cmFuc2Zvcm0gPSBvcHRpb25zLnRyYW5zZm9ybTtcbiAgICB0aGlzLl9wb3NpdGlvblByb3BlcnR5ID0gb3B0aW9ucy5wb3NpdGlvblByb3BlcnR5O1xuICAgIHRoaXMuX21hcFBvc2l0aW9uID0gb3B0aW9ucy5tYXBQb3NpdGlvbjtcbiAgICB0aGlzLl9vZmZzZXRQb3NpdGlvbiA9IG9wdGlvbnMub2Zmc2V0UG9zaXRpb247XG4gICAgdGhpcy5fZHJhZ0JvdW5kc1Byb3BlcnR5ID0gKCBvcHRpb25zLmRyYWdCb3VuZHNQcm9wZXJ0eSB8fCBuZXcgUHJvcGVydHkoIG51bGwgKSApO1xuICAgIHRoaXMuX3N0YXJ0ID0gb3B0aW9ucy5zdGFydDtcbiAgICB0aGlzLl9lbmQgPSBvcHRpb25zLmVuZDtcbiAgICB0aGlzLl9jYW5DbGljayA9IG9wdGlvbnMuY2FuQ2xpY2s7XG4gICAgdGhpcy5pc1VzZXJDb250cm9sbGVkUHJvcGVydHkgPSB0aGlzLmlzUHJlc3NlZFByb3BlcnR5O1xuICAgIHRoaXMuX2dsb2JhbFBvaW50ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbiAgICB0aGlzLl9sb2NhbFBvaW50ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbiAgICB0aGlzLl9wYXJlbnRQb2ludCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gICAgdGhpcy5fbW9kZWxQb2ludCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gICAgdGhpcy5fbW9kZWxEZWx0YSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gICAgdGhpcy5fcGFyZW50T2Zmc2V0ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbiAgICB0aGlzLl90cmFuc2Zvcm1UcmFja2VyID0gbnVsbDtcbiAgICB0aGlzLl90cmFuc2Zvcm1UcmFja2VyTGlzdGVuZXIgPSB0aGlzLmFuY2VzdG9yVHJhbnNmb3JtZWQuYmluZCggdGhpcyApO1xuICAgIHRoaXMuX2xhc3RJbnRlcnJ1cHRlZFRvdWNoTGlrZVBvaW50ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fZHJhZ0FjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oIGV2ZW50ID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKTtcbiAgICAgIGNvbnN0IHByZXNzZWRMaXN0ZW5lciA9IHRoaXMgYXMgUHJlc3NlZERyYWdMaXN0ZW5lcjtcblxuICAgICAgY29uc3QgcG9pbnQgPSBwcmVzc2VkTGlzdGVuZXIucG9pbnRlci5wb2ludDtcblxuICAgICAgaWYgKCBwb2ludCApIHtcbiAgICAgICAgLy8gVGhpcyBpcyBkb25lIGZpcnN0LCBiZWZvcmUgdGhlIGRyYWcgbGlzdGVuZXIgaXMgY2FsbGVkIChmcm9tIHRoZSBwcm90b3R5cGUgZHJhZyBjYWxsKVxuICAgICAgICBpZiAoICF0aGlzLl9nbG9iYWxQb2ludC5lcXVhbHMoIHBvaW50ICkgKSB7XG4gICAgICAgICAgdGhpcy5yZXBvc2l0aW9uKCBwb2ludCApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIFByZXNzTGlzdGVuZXIucHJvdG90eXBlLmRyYWcuY2FsbCggdGhpcywgZXZlbnQgKTtcbiAgICB9LCB7XG4gICAgICBwYXJhbWV0ZXJzOiBbIHsgbmFtZTogJ2V2ZW50JywgcGhldGlvVHlwZTogU2NlbmVyeUV2ZW50LlNjZW5lcnlFdmVudElPIH0gXSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiBvcHRpb25zLnBoZXRpb0ZlYXR1cmVkLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnQWN0aW9uJyApLFxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuZXZlciBhIGRyYWcgb2NjdXJzIHdpdGggYW4gU2NlbmVyeUV2ZW50SU8gYXJndW1lbnQuJyxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBvcHRpb25zLnBoZXRpb1JlYWRPbmx5LFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUlxuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBzdGFydCBhIGRyYWcgd2l0aCBhIHByZXNzLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGlzIHNhZmUgdG8gY2FsbCBleHRlcm5hbGx5IGluIG9yZGVyIHRvIGF0dGVtcHQgdG8gc3RhcnQgYSBwcmVzcy4gZHJhZ0xpc3RlbmVyLmNhblByZXNzKCBldmVudCApIGNhblxuICAgKiBiZSB1c2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgd2lsbCBhY3R1YWxseSBzdGFydCBhIGRyYWcuXG4gICAqXG4gICAqIEBwYXJhbSBldmVudFxuICAgKiBAcGFyYW0gW3RhcmdldE5vZGVdIC0gSWYgcHJvdmlkZWQsIHdpbGwgdGFrZSB0aGUgcGxhY2Ugb2YgdGhlIHRhcmdldE5vZGUgZm9yIHRoaXMgY2FsbC4gVXNlZnVsIGZvciBmb3J3YXJkZWQgcHJlc3Nlcy5cbiAgICogQHBhcmFtIFtjYWxsYmFja10gLSB0byBiZSBydW4gYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb24sIGJ1dCBvbmx5IG9uIHN1Y2Nlc3NcbiAgICogQHJldHVybnMgc3VjY2VzcyAtIFJldHVybnMgd2hldGhlciB0aGUgcHJlc3Mgd2FzIGFjdHVhbGx5IHN0YXJ0ZWRcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBwcmVzcyggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCwgdGFyZ2V0Tm9kZT86IE5vZGUsIGNhbGxiYWNrPzogKCkgPT4gdm9pZCApOiBib29sZWFuIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEcmFnTGlzdGVuZXIgcHJlc3MnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBjb25zdCBzdWNjZXNzID0gc3VwZXIucHJlc3MoIGV2ZW50LCB0YXJnZXROb2RlLCAoKSA9PiB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEcmFnTGlzdGVuZXIgc3VjY2Vzc2Z1bCBwcmVzcycgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1ByZXNzZWRMaXN0ZW5lciggdGhpcyApICk7XG4gICAgICBjb25zdCBwcmVzc2VkTGlzdGVuZXIgPSB0aGlzIGFzIFByZXNzZWREcmFnTGlzdGVuZXI7XG5cbiAgICAgIC8vIHNpZ25pZnkgdGhhdCB0aGlzIGxpc3RlbmVyIGlzIHJlc2VydmVkIGZvciBkcmFnZ2luZyBzbyB0aGF0IG90aGVyIGxpc3RlbmVycyBjYW4gY2hhbmdlXG4gICAgICAvLyB0aGVpciBiZWhhdmlvciBkdXJpbmcgc2NlbmVyeSBldmVudCBkaXNwYXRjaFxuICAgICAgcHJlc3NlZExpc3RlbmVyLnBvaW50ZXIucmVzZXJ2ZUZvckRyYWcoKTtcblxuICAgICAgdGhpcy5hdHRhY2hUcmFuc2Zvcm1UcmFja2VyKCk7XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByZXNzZWRMaXN0ZW5lci5wb2ludGVyLnBvaW50ICE9PSBudWxsICk7XG4gICAgICBjb25zdCBwb2ludCA9IHByZXNzZWRMaXN0ZW5lci5wb2ludGVyLnBvaW50O1xuXG4gICAgICAvLyBDb21wdXRlIHRoZSBwYXJlbnQgcG9pbnQgY29ycmVzcG9uZGluZyB0byB0aGUgcG9pbnRlcidzIHBvc2l0aW9uXG4gICAgICBjb25zdCBwYXJlbnRQb2ludCA9IHRoaXMuZ2xvYmFsVG9QYXJlbnRQb2ludCggdGhpcy5fbG9jYWxQb2ludC5zZXQoIHBvaW50ICkgKTtcblxuICAgICAgaWYgKCB0aGlzLl91c2VQYXJlbnRPZmZzZXQgKSB7XG4gICAgICAgIHRoaXMubW9kZWxUb1BhcmVudFBvaW50KCB0aGlzLl9wYXJlbnRPZmZzZXQuc2V0KCB0aGlzLl9wb3NpdGlvblByb3BlcnR5IS52YWx1ZSApICkuc3VidHJhY3QoIHBhcmVudFBvaW50ICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0aGUgbG9jYWwgcG9pbnRcbiAgICAgIHRoaXMucGFyZW50VG9Mb2NhbFBvaW50KCBwYXJlbnRQb2ludCApO1xuXG4gICAgICB0aGlzLnJlcG9zaXRpb24oIHBvaW50ICk7XG5cbiAgICAgIC8vIE5vdGlmeSBhZnRlciBwb3NpdGlvbmluZyBhbmQgb3RoZXIgY2hhbmdlc1xuICAgICAgdGhpcy5fc3RhcnQgJiYgdGhpcy5fc3RhcnQoIGV2ZW50LCBwcmVzc2VkTGlzdGVuZXIgKTtcblxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKTtcblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuXG4gICAgcmV0dXJuIHN1Y2Nlc3M7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgdGhlIGRyYWcuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIGNhbGxlZCBmcm9tIHRoZSBvdXRzaWRlIHRvIHN0b3AgdGhlIGRyYWcgd2l0aG91dCB0aGUgcG9pbnRlciBoYXZpbmcgYWN0dWFsbHkgZmlyZWQgYW55ICd1cCdcbiAgICogZXZlbnRzLiBJZiB0aGUgY2FuY2VsL2ludGVycnVwdCBiZWhhdmlvciBpcyBtb3JlIHByZWZlcmFibGUsIGNhbGwgaW50ZXJydXB0KCkgb24gdGhpcyBsaXN0ZW5lciBpbnN0ZWFkLlxuICAgKlxuICAgKiBAcGFyYW0gW2V2ZW50XSAtIHNjZW5lcnkgZXZlbnQgaWYgdGhlcmUgd2FzIG9uZVxuICAgKiBAcGFyYW0gW2NhbGxiYWNrXSAtIGNhbGxlZCBhdCB0aGUgZW5kIG9mIHRoZSByZWxlYXNlXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgcmVsZWFzZSggZXZlbnQ/OiBQcmVzc0xpc3RlbmVyRXZlbnQsIGNhbGxiYWNrPzogKCkgPT4gdm9pZCApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEcmFnTGlzdGVuZXIgcmVsZWFzZScgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIHN1cGVyLnJlbGVhc2UoIGV2ZW50LCAoKSA9PiB7XG4gICAgICB0aGlzLmRldGFjaFRyYW5zZm9ybVRyYWNrZXIoKTtcblxuICAgICAgLy8gTm90aWZ5IGFmdGVyIHRoZSByZXN0IG9mIHJlbGVhc2UgaXMgY2FsbGVkIGluIG9yZGVyIHRvIHByZXZlbnQgaXQgZnJvbSB0cmlnZ2VyaW5nIGludGVycnVwdCgpLlxuICAgICAgdGhpcy5fZW5kICYmIHRoaXMuX2VuZCggZXZlbnQgfHwgbnVsbCwgdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyICk7XG5cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG4gICAgfSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wb25lbnRzIHVzaW5nIERyYWdMaXN0ZW5lciBzaG91bGQgZ2VuZXJhbGx5IG5vdCBiZSBhY3RpdmF0ZWQgd2l0aCBhIGNsaWNrLiBBIHNpbmdsZSBjbGljayBmcm9tIGFsdGVybmF0aXZlXG4gICAqIGlucHV0IHdvdWxkIHBpY2sgdXAgdGhlIGNvbXBvbmVudCB0aGVuIGltbWVkaWF0ZWx5IHJlbGVhc2UgaXQuIEJ1dCBvY2Nhc2lvbmFsbHkgdGhhdCBpcyBkZXNpcmFibGUgYW5kIGNhbiBiZVxuICAgKiBjb250cm9sbGVkIHdpdGggdGhlIGNhbkNsaWNrIG9wdGlvbi5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjYW5DbGljaygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc3VwZXIuY2FuQ2xpY2soKSAmJiB0aGlzLl9jYW5DbGljaztcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSB0aGUgRHJhZ0xpc3RlbmVyIHdpdGggYSBjbGljayBhY3RpdmF0aW9uLiBVc3VhbGx5LCBEcmFnTGlzdGVuZXIgd2lsbCBOT1QgYmUgYWN0aXZhdGVkIHdpdGggYSBjbGlja1xuICAgKiBhbmQgY2FuQ2xpY2sgd2lsbCByZXR1cm4gZmFsc2UuIENvbXBvbmVudHMgdGhhdCBjYW4gYmUgZHJhZ2dlZCB1c3VhbGx5IHNob3VsZCBub3QgYmUgcGlja2VkIHVwL3JlbGVhc2VkXG4gICAqIGZyb20gYSBzaW5nbGUgY2xpY2sgZXZlbnQgdGhhdCBtYXkgaGF2ZSBldmVuIGNvbWUgZnJvbSBldmVudCBidWJibGluZy4gQnV0IGl0IGNhbiBiZSBvcHRpb25hbGx5IGFsbG93ZWQgZm9yIHNvbWVcbiAgICogY29tcG9uZW50cyB0aGF0IGhhdmUgZHJhZyBmdW5jdGlvbmFsaXR5IGJ1dCBjYW4gc3RpbGwgYmUgYWN0aXZhdGVkIHdpdGggYSBzaW5nbGUgY2xpY2sgZXZlbnQuXG4gICAqIChzY2VuZXJ5LWludGVybmFsKSAocGFydCBvZiB0aGUgc2NlbmVyeSBsaXN0ZW5lciBBUEkpXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY2xpY2soIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8TW91c2VFdmVudD4sIGNhbGxiYWNrPzogKCkgPT4gdm9pZCApOiBib29sZWFuIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEcmFnTGlzdGVuZXIgY2xpY2snICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBjb25zdCBzdWNjZXNzID0gc3VwZXIuY2xpY2soIGV2ZW50LCAoKSA9PiB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEcmFnTGlzdGVuZXIgc3VjY2Vzc2Z1bCBwcmVzcycgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICAvLyBub3RpZnkgdGhhdCB3ZSBoYXZlIHN0YXJ0ZWQgYSBjaGFuZ2VcbiAgICAgIHRoaXMuX3N0YXJ0ICYmIHRoaXMuX3N0YXJ0KCBldmVudCwgdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyICk7XG5cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG5cbiAgICAgIC8vIG5vdGlmeSB0aGF0IHdlIGhhdmUgZmluaXNoZWQgYSAnZHJhZycgYWN0aXZhdGlvbiB0aHJvdWdoIGNsaWNrXG4gICAgICB0aGlzLl9lbmQgJiYgdGhpcy5fZW5kKCBldmVudCwgdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyICk7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgIHJldHVybiBzdWNjZXNzO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIG1vdmUgZXZlbnRzIGFyZSBmaXJlZCBvbiB0aGUgYXR0YWNoZWQgcG9pbnRlciBsaXN0ZW5lciBkdXJpbmcgYSBkcmFnLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRyYWcoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNQcmVzc2VkTGlzdGVuZXIoIHRoaXMgKSApO1xuICAgIGNvbnN0IHByZXNzZWRMaXN0ZW5lciA9IHRoaXMgYXMgUHJlc3NlZERyYWdMaXN0ZW5lcjtcblxuICAgIGNvbnN0IHBvaW50ID0gcHJlc3NlZExpc3RlbmVyLnBvaW50ZXIucG9pbnQ7XG5cbiAgICAvLyBJZ25vcmUgZ2xvYmFsIG1vdmVzIHRoYXQgaGF2ZSB6ZXJvIGxlbmd0aCAoQ2hyb21lIG1pZ2h0IGF1dG9maXJlLCBzZWVcbiAgICAvLyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MzI3MTE0KVxuICAgIGlmICggIXBvaW50IHx8IHRoaXMuX2dsb2JhbFBvaW50LmVxdWFscyggcG9pbnQgKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBnb3QgaW50ZXJydXB0ZWQgd2hpbGUgZXZlbnRzIHdlcmUgcXVldWVkIHVwLCB3ZSBNQVkgZ2V0IGEgZHJhZyB3aGVuIG5vdCBwcmVzc2VkLiBXZSBjYW4gaWdub3JlIHRoaXMuXG4gICAgaWYgKCAhdGhpcy5pc1ByZXNzZWQgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnRHJhZ0xpc3RlbmVyIGRyYWcnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB0aGlzLl9kcmFnQWN0aW9uLmV4ZWN1dGUoIGV2ZW50ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIHN0YXJ0IGEgdG91Y2ggc25hZywgZ2l2ZW4gYSBTY2VuZXJ5RXZlbnQuXG4gICAqXG4gICAqIFNob3VsZCBiZSBzYWZlIHRvIGJlIGNhbGxlZCBleHRlcm5hbGx5IHdpdGggYW4gZXZlbnQuXG4gICAqL1xuICBwdWJsaWMgdHJ5VG91Y2hTbmFnKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ0RyYWdMaXN0ZW5lciB0cnlUb3VjaFNuYWcnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBpZiAoIHRoaXMuX2FsbG93VG91Y2hTbmFnICYmICggIXRoaXMuYXR0YWNoIHx8ICFldmVudC5wb2ludGVyLmlzQXR0YWNoZWQoKSApICkge1xuICAgICAgdGhpcy5wcmVzcyggZXZlbnQgKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBkZWZlbnNpdmUgY29weSBvZiB0aGUgbG9jYWwtY29vcmRpbmF0ZS1mcmFtZSBwb2ludCBvZiB0aGUgZHJhZy5cbiAgICovXG4gIHB1YmxpYyBnZXRHbG9iYWxQb2ludCgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5fZ2xvYmFsUG9pbnQuY29weSgpO1xuICB9XG5cbiAgcHVibGljIGdldCBnbG9iYWxQb2ludCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0R2xvYmFsUG9pbnQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZGVmZW5zaXZlIGNvcHkgb2YgdGhlIGxvY2FsLWNvb3JkaW5hdGUtZnJhbWUgcG9pbnQgb2YgdGhlIGRyYWcuXG4gICAqL1xuICBwdWJsaWMgZ2V0TG9jYWxQb2ludCgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxQb2ludC5jb3B5KCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGxvY2FsUG9pbnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldExvY2FsUG9pbnQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZGVmZW5zaXZlIGNvcHkgb2YgdGhlIHBhcmVudC1jb29yZGluYXRlLWZyYW1lIHBvaW50IG9mIHRoZSBkcmFnLlxuICAgKi9cbiAgcHVibGljIGdldFBhcmVudFBvaW50KCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLl9wYXJlbnRQb2ludC5jb3B5KCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHBhcmVudFBvaW50KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRQYXJlbnRQb2ludCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBkZWZlbnNpdmUgY29weSBvZiB0aGUgbW9kZWwtY29vcmRpbmF0ZS1mcmFtZSBwb2ludCBvZiB0aGUgZHJhZy5cbiAgICovXG4gIHB1YmxpYyBnZXRNb2RlbFBvaW50KCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbFBvaW50LmNvcHkoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbW9kZWxQb2ludCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0TW9kZWxQb2ludCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBkZWZlbnNpdmUgY29weSBvZiB0aGUgbW9kZWwtY29vcmRpbmF0ZS1mcmFtZSBkZWx0YS5cbiAgICovXG4gIHB1YmxpYyBnZXRNb2RlbERlbHRhKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbERlbHRhLmNvcHkoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbW9kZWxEZWx0YSgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWx0YSgpOyB9XG5cbiAgLyoqXG4gICAqIE1hcHMgYSBwb2ludCBmcm9tIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZSB0byBvdXIgZHJhZyB0YXJnZXQncyBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICpcbiAgICogTk9URTogVGhpcyBtdXRhdGVzIHRoZSBpbnB1dCB2ZWN0b3IgKGZvciBwZXJmb3JtYW5jZSlcbiAgICpcbiAgICogU2hvdWxkIGJlIG92ZXJyaWRkZW4gaWYgYSBjdXN0b20gdHJhbnNmb3JtYXRpb24gaXMgbmVlZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdsb2JhbFRvUGFyZW50UG9pbnQoIGdsb2JhbFBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKTtcbiAgICBjb25zdCBwcmVzc2VkTGlzdGVuZXIgPSB0aGlzIGFzIFByZXNzZWREcmFnTGlzdGVuZXI7XG5cbiAgICBsZXQgcmVmZXJlbmNlUmVzdWx0OiBWZWN0b3IyIHwgdW5kZWZpbmVkO1xuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgcmVmZXJlbmNlUmVzdWx0ID0gcHJlc3NlZExpc3RlbmVyLnByZXNzZWRUcmFpbC5nbG9iYWxUb1BhcmVudFBvaW50KCBnbG9iYWxQb2ludCApO1xuICAgIH1cbiAgICBwcmVzc2VkTGlzdGVuZXIucHJlc3NlZFRyYWlsLmdldFBhcmVudFRyYW5zZm9ybSgpLmdldEludmVyc2UoKS5tdWx0aXBseVZlY3RvcjIoIGdsb2JhbFBvaW50ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ2xvYmFsUG9pbnQuZXF1YWxzKCByZWZlcmVuY2VSZXN1bHQhICkgKTtcbiAgICByZXR1cm4gZ2xvYmFsUG9pbnQ7XG4gIH1cblxuICAvKipcbiAgICogTWFwcyBhIHBvaW50IGZyb20gdGhlIGRyYWcgdGFyZ2V0J3MgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgdG8gaXRzIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbXV0YXRlcyB0aGUgaW5wdXQgdmVjdG9yIChmb3IgcGVyZm9ybWFuY2UpXG4gICAqXG4gICAqIFNob3VsZCBiZSBvdmVycmlkZGVuIGlmIGEgY3VzdG9tIHRyYW5zZm9ybWF0aW9uIGlzIG5lZWRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBwYXJlbnRUb0xvY2FsUG9pbnQoIHBhcmVudFBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKTtcbiAgICBjb25zdCBwcmVzc2VkTGlzdGVuZXIgPSB0aGlzIGFzIFByZXNzZWREcmFnTGlzdGVuZXI7XG5cbiAgICBsZXQgcmVmZXJlbmNlUmVzdWx0OiBWZWN0b3IyO1xuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgcmVmZXJlbmNlUmVzdWx0ID0gcHJlc3NlZExpc3RlbmVyLnByZXNzZWRUcmFpbC5sYXN0Tm9kZSgpLnBhcmVudFRvTG9jYWxQb2ludCggcGFyZW50UG9pbnQgKTtcbiAgICB9XG4gICAgcHJlc3NlZExpc3RlbmVyLnByZXNzZWRUcmFpbC5sYXN0Tm9kZSgpLmdldFRyYW5zZm9ybSgpLmdldEludmVyc2UoKS5tdWx0aXBseVZlY3RvcjIoIHBhcmVudFBvaW50ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGFyZW50UG9pbnQuZXF1YWxzKCByZWZlcmVuY2VSZXN1bHQhICkgKTtcbiAgICByZXR1cm4gcGFyZW50UG9pbnQ7XG4gIH1cblxuICAvKipcbiAgICogTWFwcyBhIHBvaW50IGZyb20gdGhlIGRyYWcgdGFyZ2V0J3MgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSB0byBpdHMgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbXV0YXRlcyB0aGUgaW5wdXQgdmVjdG9yIChmb3IgcGVyZm9ybWFuY2UpXG4gICAqXG4gICAqIFNob3VsZCBiZSBvdmVycmlkZGVuIGlmIGEgY3VzdG9tIHRyYW5zZm9ybWF0aW9uIGlzIG5lZWRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBsb2NhbFRvUGFyZW50UG9pbnQoIGxvY2FsUG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNQcmVzc2VkTGlzdGVuZXIoIHRoaXMgKSApO1xuICAgIGNvbnN0IHByZXNzZWRMaXN0ZW5lciA9IHRoaXMgYXMgUHJlc3NlZERyYWdMaXN0ZW5lcjtcblxuICAgIGxldCByZWZlcmVuY2VSZXN1bHQ6IFZlY3RvcjI7XG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICByZWZlcmVuY2VSZXN1bHQgPSBwcmVzc2VkTGlzdGVuZXIucHJlc3NlZFRyYWlsLmxhc3ROb2RlKCkubG9jYWxUb1BhcmVudFBvaW50KCBsb2NhbFBvaW50ICk7XG4gICAgfVxuICAgIHByZXNzZWRMaXN0ZW5lci5wcmVzc2VkVHJhaWwubGFzdE5vZGUoKS5nZXRNYXRyaXgoKS5tdWx0aXBseVZlY3RvcjIoIGxvY2FsUG9pbnQgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsb2NhbFBvaW50LmVxdWFscyggcmVmZXJlbmNlUmVzdWx0ISApICk7XG4gICAgcmV0dXJuIGxvY2FsUG9pbnQ7XG4gIH1cblxuICAvKipcbiAgICogTWFwcyBhIHBvaW50IGZyb20gdGhlIGRyYWcgdGFyZ2V0J3MgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbXV0YXRlcyB0aGUgaW5wdXQgdmVjdG9yIChmb3IgcGVyZm9ybWFuY2UpXG4gICAqXG4gICAqIFNob3VsZCBiZSBvdmVycmlkZGVuIGlmIGEgY3VzdG9tIHRyYW5zZm9ybWF0aW9uIGlzIG5lZWRlZC4gTm90ZSB0aGF0IGJ5IGRlZmF1bHQsIHVubGVzcyBhIHRyYW5zZm9ybSBpcyBwcm92aWRlZCxcbiAgICogdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwcm90ZWN0ZWQgcGFyZW50VG9Nb2RlbFBvaW50KCBwYXJlbnRQb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICBpZiAoIHRoaXMuX3RyYW5zZm9ybSApIHtcbiAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHRoaXMuX3RyYW5zZm9ybSBpbnN0YW5jZW9mIFRyYW5zZm9ybTMgPyB0aGlzLl90cmFuc2Zvcm0gOiB0aGlzLl90cmFuc2Zvcm0udmFsdWU7XG5cbiAgICAgIHRyYW5zZm9ybS5nZXRJbnZlcnNlKCkubXVsdGlwbHlWZWN0b3IyKCBwYXJlbnRQb2ludCApO1xuICAgIH1cbiAgICByZXR1cm4gcGFyZW50UG9pbnQ7XG4gIH1cblxuICAvKipcbiAgICogTWFwcyBhIHBvaW50IGZyb20gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIGRyYWcgdGFyZ2V0J3MgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbXV0YXRlcyB0aGUgaW5wdXQgdmVjdG9yIChmb3IgcGVyZm9ybWFuY2UpXG4gICAqXG4gICAqIFNob3VsZCBiZSBvdmVycmlkZGVuIGlmIGEgY3VzdG9tIHRyYW5zZm9ybWF0aW9uIGlzIG5lZWRlZC4gTm90ZSB0aGF0IGJ5IGRlZmF1bHQsIHVubGVzcyBhIHRyYW5zZm9ybSBpcyBwcm92aWRlZCxcbiAgICogdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwcm90ZWN0ZWQgbW9kZWxUb1BhcmVudFBvaW50KCBtb2RlbFBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIGlmICggdGhpcy5fdHJhbnNmb3JtICkge1xuICAgICAgY29uc3QgdHJhbnNmb3JtID0gdGhpcy5fdHJhbnNmb3JtIGluc3RhbmNlb2YgVHJhbnNmb3JtMyA/IHRoaXMuX3RyYW5zZm9ybSA6IHRoaXMuX3RyYW5zZm9ybS52YWx1ZTtcblxuICAgICAgdHJhbnNmb3JtLmdldE1hdHJpeCgpLm11bHRpcGx5VmVjdG9yMiggbW9kZWxQb2ludCApO1xuICAgIH1cbiAgICByZXR1cm4gbW9kZWxQb2ludDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBhIG1hcHBpbmcgZnJvbSB0aGUgZHJhZyB0YXJnZXQncyBtb2RlbCBwb3NpdGlvbiB0byBhbiBhbGxvd2VkIG1vZGVsIHBvc2l0aW9uLlxuICAgKlxuICAgKiBBIGNvbW1vbiBleGFtcGxlIGlzIHVzaW5nIGRyYWdCb3VuZHMsIHdoZXJlIHRoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZyB0YXJnZXQgaXMgY29uc3RyYWluZWQgdG8gd2l0aGluIGEgYm91bmRpbmdcbiAgICogYm94LiBUaGlzIGlzIGRvbmUgYnkgbWFwcGluZyBwb2ludHMgb3V0c2lkZSB0aGUgYm91bmRpbmcgYm94IHRvIHRoZSBjbG9zZXN0IHBvc2l0aW9uIGluc2lkZSB0aGUgYm94LiBNb3JlXG4gICAqIGdlbmVyYWwgbWFwcGluZ3MgY2FuIGJlIHVzZWQuXG4gICAqXG4gICAqIFNob3VsZCBiZSBvdmVycmlkZGVuIChvciB1c2UgbWFwUG9zaXRpb24pIGlmIGEgY3VzdG9tIHRyYW5zZm9ybWF0aW9uIGlzIG5lZWRlZC5cbiAgICpcbiAgICogQHJldHVybnMgLSBBIHBvaW50IGluIHRoZSBtb2RlbCBjb29yZGluYXRlIGZyYW1lXG4gICAqL1xuICBwcm90ZWN0ZWQgbWFwTW9kZWxQb2ludCggbW9kZWxQb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICBpZiAoIHRoaXMuX21hcFBvc2l0aW9uICkge1xuICAgICAgbW9kZWxQb2ludCA9IHRoaXMuX21hcFBvc2l0aW9uKCBtb2RlbFBvaW50ICk7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlLmNsb3Nlc3RQb2ludFRvKCBtb2RlbFBvaW50ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIG1vZGVsUG9pbnQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE11dGF0ZXMgdGhlIHBhcmVudFBvaW50IGdpdmVuIHRvIGFjY291bnQgZm9yIHRoZSBpbml0aWFsIHBvaW50ZXIncyBvZmZzZXQgZnJvbSB0aGUgZHJhZyB0YXJnZXQncyBvcmlnaW4uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXBwbHlQYXJlbnRPZmZzZXQoIHBhcmVudFBvaW50OiBWZWN0b3IyICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5fb2Zmc2V0UG9zaXRpb24gKSB7XG4gICAgICBwYXJlbnRQb2ludC5hZGQoIHRoaXMuX29mZnNldFBvc2l0aW9uKCBwYXJlbnRQb2ludCwgdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyICkgKTtcbiAgICB9XG5cbiAgICAvLyBEb24ndCBhcHBseSBhbnkgb2Zmc2V0IGlmIGFwcGx5T2Zmc2V0IGlzIGZhbHNlXG4gICAgaWYgKCB0aGlzLl9hcHBseU9mZnNldCApIHtcbiAgICAgIGlmICggdGhpcy5fdXNlUGFyZW50T2Zmc2V0ICkge1xuICAgICAgICBwYXJlbnRQb2ludC5hZGQoIHRoaXMuX3BhcmVudE9mZnNldCApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIEFkZCB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG91ciBsb2NhbCBvcmlnaW4gKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgYW5kIHRoZSBsb2NhbCBwb2ludCAoaW4gdGhlIHNhbWVcbiAgICAgICAgLy8gcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpLlxuICAgICAgICBwYXJlbnRQb2ludC5zdWJ0cmFjdCggdGhpcy5sb2NhbFRvUGFyZW50UG9pbnQoIHNjcmF0Y2hWZWN0b3IyQS5zZXQoIHRoaXMuX2xvY2FsUG9pbnQgKSApICk7XG4gICAgICAgIHBhcmVudFBvaW50LmFkZCggdGhpcy5sb2NhbFRvUGFyZW50UG9pbnQoIHNjcmF0Y2hWZWN0b3IyQS5zZXRYWSggMCwgMCApICkgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgYW4gdXBkYXRlIG9mIHRoZSBkcmFnIHBvc2l0aW9uLCBwb3RlbnRpYWxseSBjaGFuZ2luZyBwb3NpdGlvbiBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBTaG91bGQgYmUgY2FsbGVkIHdoZW4gc29tZXRoaW5nIHRoYXQgY2hhbmdlcyB0aGUgb3V0cHV0IHBvc2l0aW9ucyBvZiB0aGUgZHJhZyBvY2N1cnMgKG1vc3Qgb2Z0ZW4sIGEgZHJhZyBldmVudFxuICAgKiBpdHNlbGYpLlxuICAgKi9cbiAgcHVibGljIHJlcG9zaXRpb24oIGdsb2JhbFBvaW50OiBWZWN0b3IyICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ0RyYWdMaXN0ZW5lciByZXBvc2l0aW9uJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNQcmVzc2VkTGlzdGVuZXIoIHRoaXMgKSApO1xuICAgIGNvbnN0IHByZXNzZWRMaXN0ZW5lciA9IHRoaXMgYXMgUHJlc3NlZERyYWdMaXN0ZW5lcjtcblxuICAgIHRoaXMuX2dsb2JhbFBvaW50LnNldCggZ2xvYmFsUG9pbnQgKTtcblxuICAgIC8vIFVwZGF0ZSBwYXJlbnRQb2ludCBtdXRhYmx5LlxuICAgIHRoaXMuYXBwbHlQYXJlbnRPZmZzZXQoIHRoaXMuZ2xvYmFsVG9QYXJlbnRQb2ludCggdGhpcy5fcGFyZW50UG9pbnQuc2V0KCBnbG9iYWxQb2ludCApICkgKTtcblxuICAgIC8vIFRvIGNvbXB1dGUgdGhlIGRlbHRhIChuZXcgLSBvbGQpLCB3ZSBmaXJzdCBtdXRhdGUgaXQgdG8gKC1vbGQpXG4gICAgdGhpcy5fbW9kZWxEZWx0YS5zZXQoIHRoaXMuX21vZGVsUG9pbnQgKS5uZWdhdGUoKTtcblxuICAgIC8vIENvbXB1dGUgdGhlIG1vZGVsUG9pbnQgZnJvbSB0aGUgcGFyZW50UG9pbnRcbiAgICB0aGlzLl9tb2RlbFBvaW50LnNldCggdGhpcy5tYXBNb2RlbFBvaW50KCB0aGlzLnBhcmVudFRvTW9kZWxQb2ludCggc2NyYXRjaFZlY3RvcjJBLnNldCggdGhpcy5fcGFyZW50UG9pbnQgKSApICkgKTtcblxuICAgIC8vIENvbXBsZXRlIHRoZSBkZWx0YSBjb21wdXRhdGlvblxuICAgIHRoaXMuX21vZGVsRGVsdGEuYWRkKCB0aGlzLl9tb2RlbFBvaW50ICk7XG5cbiAgICAvLyBBcHBseSBhbnkgbWFwcGluZyBjaGFuZ2VzIGJhY2sgdG8gdGhlIHBhcmVudCBwb2ludFxuICAgIHRoaXMubW9kZWxUb1BhcmVudFBvaW50KCB0aGlzLl9wYXJlbnRQb2ludC5zZXQoIHRoaXMuX21vZGVsUG9pbnQgKSApO1xuXG4gICAgaWYgKCB0aGlzLl90cmFuc2xhdGVOb2RlICkge1xuICAgICAgcHJlc3NlZExpc3RlbmVyLnByZXNzZWRUcmFpbC5sYXN0Tm9kZSgpLnRyYW5zbGF0aW9uID0gdGhpcy5fcGFyZW50UG9pbnQ7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLl9wb3NpdGlvblByb3BlcnR5ICkge1xuICAgICAgdGhpcy5fcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMuX21vZGVsUG9pbnQuY29weSgpOyAvLyBJbmNsdWRlIGFuIGV4dHJhIHJlZmVyZW5jZSBzbyB0aGF0IGl0IHdpbGwgY2hhbmdlLlxuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdpdGggJ3RvdWNoZW50ZXInIGV2ZW50cyAocGFydCBvZiB0aGUgbGlzdGVuZXIgQVBJKS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LiBTZWUgdGhlIHByZXNzIG1ldGhvZCBpbnN0ZWFkLlxuICAgKi9cbiAgcHVibGljIHRvdWNoZW50ZXIoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgaWYgKCBldmVudC5wb2ludGVyLmlzRG93blByb3BlcnR5LnZhbHVlICkge1xuICAgICAgdGhpcy50cnlUb3VjaFNuYWcoIGV2ZW50ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aXRoICd0b3VjaG1vdmUnIGV2ZW50cyAocGFydCBvZiB0aGUgbGlzdGVuZXIgQVBJKS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LiBTZWUgdGhlIHByZXNzIG1ldGhvZCBpbnN0ZWFkLlxuICAgKi9cbiAgcHVibGljIHRvdWNobW92ZSggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcbiAgICB0aGlzLnRyeVRvdWNoU25hZyggZXZlbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhbiBhbmNlc3RvcidzIHRyYW5zZm9ybSBoYXMgY2hhbmdlZCAod2hlbiB0cmFja0FuY2VzdG9ycyBpcyB0cnVlKS5cbiAgICovXG4gIHByaXZhdGUgYW5jZXN0b3JUcmFuc2Zvcm1lZCgpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1ByZXNzZWRMaXN0ZW5lciggdGhpcyApICk7XG4gICAgY29uc3QgcHJlc3NlZExpc3RlbmVyID0gdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyO1xuICAgIGNvbnN0IHBvaW50ID0gcHJlc3NlZExpc3RlbmVyLnBvaW50ZXIucG9pbnQ7XG5cbiAgICBpZiAoIHBvaW50ICkge1xuICAgICAgLy8gUmVwb3NpdGlvbiBiYXNlZCBvbiB0aGUgY3VycmVudCBwb2ludC5cbiAgICAgIHRoaXMucmVwb3NpdGlvbiggcG9pbnQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgb3VyIHRyYW5zZm9ybSB0cmFja2VyIChiZWdpbnMgbGlzdGVuaW5nIHRvIHRoZSBhbmNlc3RvciB0cmFuc2Zvcm1zKVxuICAgKi9cbiAgcHJpdmF0ZSBhdHRhY2hUcmFuc2Zvcm1UcmFja2VyKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKTtcbiAgICBjb25zdCBwcmVzc2VkTGlzdGVuZXIgPSB0aGlzIGFzIFByZXNzZWREcmFnTGlzdGVuZXI7XG5cbiAgICBpZiAoIHRoaXMuX3RyYWNrQW5jZXN0b3JzICkge1xuICAgICAgdGhpcy5fdHJhbnNmb3JtVHJhY2tlciA9IG5ldyBUcmFuc2Zvcm1UcmFja2VyKCBwcmVzc2VkTGlzdGVuZXIucHJlc3NlZFRyYWlsLmNvcHkoKS5yZW1vdmVEZXNjZW5kYW50KCkgKTtcbiAgICAgIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXJMaXN0ZW5lciApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRhY2hlcyBvdXIgdHJhbnNmb3JtIHRyYWNrZXIgKHN0b3BzIGxpc3RlbmluZyB0byB0aGUgYW5jZXN0b3IgdHJhbnNmb3JtcylcbiAgICovXG4gIHByaXZhdGUgZGV0YWNoVHJhbnNmb3JtVHJhY2tlcigpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIgKSB7XG4gICAgICB0aGlzLl90cmFuc2Zvcm1UcmFja2VyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLl90cmFuc2Zvcm1UcmFja2VyTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fdHJhbnNmb3JtVHJhY2tlciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRyYWcgYm91bmRzIG9mIHRoZSBsaXN0ZW5lci5cbiAgICovXG4gIHB1YmxpYyBnZXREcmFnQm91bmRzKCk6IEJvdW5kczIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBkcmFnQm91bmRzKCk6IEJvdW5kczIgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0RHJhZ0JvdW5kcygpOyB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRyYWcgdHJhbnNmb3JtIG9mIHRoZSBsaXN0ZW5lci5cbiAgICovXG4gIHB1YmxpYyBzZXRUcmFuc2Zvcm0oIHRyYW5zZm9ybTogVHJhbnNmb3JtMyB8IFRSZWFkT25seVByb3BlcnR5PFRyYW5zZm9ybTM+IHwgbnVsbCApOiB2b2lkIHtcbiAgICB0aGlzLl90cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gIH1cblxuICBwdWJsaWMgc2V0IHRyYW5zZm9ybSggdHJhbnNmb3JtOiBUcmFuc2Zvcm0zIHwgVFJlYWRPbmx5UHJvcGVydHk8VHJhbnNmb3JtMz4gfCBudWxsICkgeyB0aGlzLnNldFRyYW5zZm9ybSggdHJhbnNmb3JtICk7IH1cblxuICBwdWJsaWMgZ2V0IHRyYW5zZm9ybSgpOiBUcmFuc2Zvcm0zIHwgVFJlYWRPbmx5UHJvcGVydHk8VHJhbnNmb3JtMz4gfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0VHJhbnNmb3JtKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdHJhbnNmb3JtIG9mIHRoZSBsaXN0ZW5lci5cbiAgICovXG4gIHB1YmxpYyBnZXRUcmFuc2Zvcm0oKTogVHJhbnNmb3JtMyB8IFRSZWFkT25seVByb3BlcnR5PFRyYW5zZm9ybTM+IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcnJ1cHRzIHRoZSBsaXN0ZW5lciwgcmVsZWFzaW5nIGl0IChjYW5jZWxpbmcgYmVoYXZpb3IpLlxuICAgKlxuICAgKiBUaGlzIGVmZmVjdGl2ZWx5IHJlbGVhc2VzL2VuZHMgdGhlIHByZXNzLCBhbmQgc2V0cyB0aGUgYGludGVycnVwdGVkYCBmbGFnIHRvIHRydWUgd2hpbGUgZmlyaW5nIHRoZXNlIGV2ZW50c1xuICAgKiBzbyB0aGF0IGNvZGUgY2FuIGRldGVybWluZSB3aGV0aGVyIGEgcmVsZWFzZS9lbmQgaGFwcGVuZWQgbmF0dXJhbGx5LCBvciB3YXMgY2FuY2VsZWQgaW4gc29tZSB3YXkuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIGNhbGxlZCBtYW51YWxseSwgYnV0IGNhbiBhbHNvIGJlIGNhbGxlZCB0aHJvdWdoIG5vZGUuaW50ZXJydXB0U3VidHJlZUlucHV0KCkuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgaW50ZXJydXB0KCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5wb2ludGVyICYmIHRoaXMucG9pbnRlci5pc1RvdWNoTGlrZSgpICkge1xuICAgICAgdGhpcy5fbGFzdEludGVycnVwdGVkVG91Y2hMaWtlUG9pbnRlciA9IHRoaXMucG9pbnRlcjtcbiAgICB9XG5cbiAgICBzdXBlci5pbnRlcnJ1cHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYSBwcmVzcyBjYW4gYmUgc3RhcnRlZCB3aXRoIGEgcGFydGljdWxhciBldmVudC5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjYW5QcmVzcyggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiBib29sZWFuIHtcbiAgICBpZiAoIGV2ZW50LnBvaW50ZXIgPT09IHRoaXMuX2xhc3RJbnRlcnJ1cHRlZFRvdWNoTGlrZVBvaW50ZXIgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyLmNhblByZXNzKCBldmVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoZSBsaXN0ZW5lciwgcmVsZWFzaW5nIHJlZmVyZW5jZXMuIEl0IHNob3VsZCBub3QgYmUgdXNlZCBhZnRlciB0aGlzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnRHJhZ0xpc3RlbmVyIGRpc3Bvc2UnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB0aGlzLl9kcmFnQWN0aW9uLmRpc3Bvc2UoKTtcblxuICAgIHRoaXMuZGV0YWNoVHJhbnNmb3JtVHJhY2tlcigpO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGlucHV0IGxpc3RlbmVyIHRoYXQgZm9yd2FyZHMgZXZlbnRzIHRvIHRoZSBzcGVjaWZpZWQgaW5wdXQgbGlzdGVuZXIuIFRoZSB0YXJnZXQgbGlzdGVuZXIgc2hvdWxkXG4gICAqIHByb2JhYmx5IGJlIHVzaW5nIFByZXNzTGlzdGVuZXIub3B0aW9ucy50YXJnZXROb2RlIHNvIHRoYXQgdGhlIGZvcndhcmRlZCBkcmFnIGhhcyB0aGUgY29ycmVjdCBUcmFpbFxuICAgKlxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzYzOVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIoIGRvd246ICggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApID0+IHZvaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBDcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXJPcHRpb25zICk6IFRJbnB1dExpc3RlbmVyIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyT3B0aW9ucywgQ3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyT3B0aW9ucz4oKSgge1xuICAgICAgYWxsb3dUb3VjaFNuYWc6IHRydWUgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy85OTlcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHJldHVybiB7XG4gICAgICBkb3duKCBldmVudCApIHtcbiAgICAgICAgaWYgKCBldmVudC5jYW5TdGFydFByZXNzKCkgKSB7XG4gICAgICAgICAgZG93biggZXZlbnQgKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRvdWNoZW50ZXIoIGV2ZW50ICkge1xuICAgICAgICBvcHRpb25zLmFsbG93VG91Y2hTbmFnICYmIHRoaXMuZG93biEoIGV2ZW50ICk7XG4gICAgICB9LFxuICAgICAgdG91Y2htb3ZlKCBldmVudCApIHtcbiAgICAgICAgb3B0aW9ucy5hbGxvd1RvdWNoU25hZyAmJiB0aGlzLmRvd24hKCBldmVudCApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0RyYWdMaXN0ZW5lcicsIERyYWdMaXN0ZW5lciApOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlRyYW5zZm9ybTMiLCJWZWN0b3IyIiwib3B0aW9uaXplIiwiRXZlbnRUeXBlIiwiUGhldGlvQWN0aW9uIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiUHJlc3NMaXN0ZW5lciIsInNjZW5lcnkiLCJTY2VuZXJ5RXZlbnQiLCJUcmFuc2Zvcm1UcmFja2VyIiwic2NyYXRjaFZlY3RvcjJBIiwiaXNQcmVzc2VkTGlzdGVuZXIiLCJsaXN0ZW5lciIsImlzUHJlc3NlZCIsIkRyYWdMaXN0ZW5lciIsInByZXNzIiwiZXZlbnQiLCJ0YXJnZXROb2RlIiwiY2FsbGJhY2siLCJzY2VuZXJ5TG9nIiwiSW5wdXRMaXN0ZW5lciIsInB1c2giLCJzdWNjZXNzIiwiYXNzZXJ0IiwicHJlc3NlZExpc3RlbmVyIiwicG9pbnRlciIsInJlc2VydmVGb3JEcmFnIiwiYXR0YWNoVHJhbnNmb3JtVHJhY2tlciIsInBvaW50IiwicGFyZW50UG9pbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwiX2xvY2FsUG9pbnQiLCJzZXQiLCJfdXNlUGFyZW50T2Zmc2V0IiwibW9kZWxUb1BhcmVudFBvaW50IiwiX3BhcmVudE9mZnNldCIsIl9wb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJzdWJ0cmFjdCIsInBhcmVudFRvTG9jYWxQb2ludCIsInJlcG9zaXRpb24iLCJfc3RhcnQiLCJwb3AiLCJyZWxlYXNlIiwiZGV0YWNoVHJhbnNmb3JtVHJhY2tlciIsIl9lbmQiLCJjYW5DbGljayIsIl9jYW5DbGljayIsImNsaWNrIiwiZHJhZyIsIl9nbG9iYWxQb2ludCIsImVxdWFscyIsIl9kcmFnQWN0aW9uIiwiZXhlY3V0ZSIsInRyeVRvdWNoU25hZyIsIl9hbGxvd1RvdWNoU25hZyIsImF0dGFjaCIsImlzQXR0YWNoZWQiLCJnZXRHbG9iYWxQb2ludCIsImNvcHkiLCJnbG9iYWxQb2ludCIsImdldExvY2FsUG9pbnQiLCJsb2NhbFBvaW50IiwiZ2V0UGFyZW50UG9pbnQiLCJfcGFyZW50UG9pbnQiLCJnZXRNb2RlbFBvaW50IiwiX21vZGVsUG9pbnQiLCJtb2RlbFBvaW50IiwiZ2V0TW9kZWxEZWx0YSIsIl9tb2RlbERlbHRhIiwibW9kZWxEZWx0YSIsInJlZmVyZW5jZVJlc3VsdCIsInByZXNzZWRUcmFpbCIsImdldFBhcmVudFRyYW5zZm9ybSIsImdldEludmVyc2UiLCJtdWx0aXBseVZlY3RvcjIiLCJsYXN0Tm9kZSIsImdldFRyYW5zZm9ybSIsImxvY2FsVG9QYXJlbnRQb2ludCIsImdldE1hdHJpeCIsInBhcmVudFRvTW9kZWxQb2ludCIsIl90cmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJtYXBNb2RlbFBvaW50IiwiX21hcFBvc2l0aW9uIiwiX2RyYWdCb3VuZHNQcm9wZXJ0eSIsImNsb3Nlc3RQb2ludFRvIiwiYXBwbHlQYXJlbnRPZmZzZXQiLCJfb2Zmc2V0UG9zaXRpb24iLCJhZGQiLCJfYXBwbHlPZmZzZXQiLCJzZXRYWSIsIm5lZ2F0ZSIsIl90cmFuc2xhdGVOb2RlIiwidHJhbnNsYXRpb24iLCJ0b3VjaGVudGVyIiwiaXNEb3duUHJvcGVydHkiLCJ0b3VjaG1vdmUiLCJhbmNlc3RvclRyYW5zZm9ybWVkIiwiX3RyYWNrQW5jZXN0b3JzIiwiX3RyYW5zZm9ybVRyYWNrZXIiLCJyZW1vdmVEZXNjZW5kYW50IiwiYWRkTGlzdGVuZXIiLCJfdHJhbnNmb3JtVHJhY2tlckxpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJkaXNwb3NlIiwiZ2V0RHJhZ0JvdW5kcyIsImRyYWdCb3VuZHMiLCJzZXRUcmFuc2Zvcm0iLCJpbnRlcnJ1cHQiLCJpc1RvdWNoTGlrZSIsIl9sYXN0SW50ZXJydXB0ZWRUb3VjaExpa2VQb2ludGVyIiwiY2FuUHJlc3MiLCJjcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIiLCJkb3duIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImFsbG93VG91Y2hTbmFnIiwiY2FuU3RhcnRQcmVzcyIsInBvc2l0aW9uUHJvcGVydHkiLCJzdGFydCIsImVuZCIsIl8iLCJub29wIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwiYXBwbHlPZmZzZXQiLCJ1c2VQYXJlbnRPZmZzZXQiLCJ0cmFja0FuY2VzdG9ycyIsInRyYW5zbGF0ZU5vZGUiLCJtYXBQb3NpdGlvbiIsIm9mZnNldFBvc2l0aW9uIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0ZlYXR1cmVkIiwiREVGQVVMVF9PUFRJT05TIiwiaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwiaXNQcmVzc2VkUHJvcGVydHkiLCJiaW5kIiwicHJvdG90eXBlIiwiY2FsbCIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsIlNjZW5lcnlFdmVudElPIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvSGlnaEZyZXF1ZW5jeSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0VDLEdBRUQsT0FBT0EsY0FBYywrQkFBK0I7QUFJcEQsT0FBT0MsZ0JBQWdCLGdDQUFnQztBQUN2RCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxlQUFlLHFDQUFxQztBQUUzRCxPQUFPQyxlQUFlLGtDQUFrQztBQUN4RCxPQUFPQyxrQkFBa0IscUNBQXFDO0FBQzlELE9BQU9DLGtCQUFrQixxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsU0FBc0VDLGFBQWEsRUFBbUVDLE9BQU8sRUFBRUMsWUFBWSxFQUFrQkMsZ0JBQWdCLFFBQVEsZ0JBQWdCO0FBRXJPLDhDQUE4QztBQUM5QyxNQUFNQyxrQkFBa0IsSUFBSVYsUUFBUyxHQUFHO0FBb0R4QyxNQUFNVyxvQkFBb0IsQ0FBRUMsV0FBNkRBLFNBQVNDLFNBQVM7QUFFNUYsSUFBQSxBQUFNQyxlQUFOLE1BQU1BLHFCQUFx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