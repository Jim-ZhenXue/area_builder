// Copyright 2013-2023, University of Colorado Boulder
/**
 * Basic dragging for a node.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import merge from '../../../phet-core/js/merge.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioAction from '../../../tandem/js/PhetioAction.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { Mouse, scenery, SceneryEvent } from '../imports.js';
/**
 * @deprecated - please use DragListener for new code
 */ let SimpleDragHandler = class SimpleDragHandler extends PhetioObject {
    // @private
    get dragging() {
        return this.isDraggingProperty.get();
    }
    set dragging(d) {
        assert && assert(false, 'illegal call to set dragging on SimpleDragHandler');
    }
    /**
   * @public
   *
   * @param {SceneryEvent} event
   */ startDrag(event) {
        this.dragStartAction.execute(event.pointer.point, event);
    }
    /**
   * @public
   *
   * @param {SceneryEvent} event
   */ endDrag(event) {
        // Signify drag ended.  In the case of programmatically ended drags, signify drag ended at 0,0.
        // see https://github.com/phetsims/ph-scale-basics/issues/43
        this.dragEndAction.execute(event ? event.pointer.point : Vector2.ZERO, event);
    }
    /**
   * Called when input is interrupted on this listener, see https://github.com/phetsims/scenery/issues/218
   * @public
   */ interrupt() {
        if (this.dragging) {
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('SimpleDragHandler interrupt');
            sceneryLog && sceneryLog.InputListener && sceneryLog.push();
            this.interrupted = true;
            if (this.pointer && this.pointer.isTouchLike()) {
                this.lastInterruptedTouchLikePointer = this.pointer;
            }
            // We create a synthetic event here, as there is no available event here.
            this.endDrag({
                pointer: this.pointer,
                currentTarget: this.node
            });
            this.interrupted = false;
            sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        }
    }
    /**
   * @public
   *
   * @param {SceneryEvent} event
   */ tryToSnag(event) {
        // don't allow drag attempts that use the wrong mouse button (-1 indicates any mouse button works)
        if (event.pointer instanceof Mouse && event.domEvent && this.options.mouseButton !== event.domEvent.button && this.options.mouseButton !== -1) {
            return;
        }
        // If we're disposed, we can't start new drags.
        if (this.isDisposed) {
            return;
        }
        // only start dragging if the pointer isn't dragging anything, we aren't being dragged, and if it's a mouse it's button is down
        if (!this.dragging && // Don't check pointer.dragging if we don't attach, see https://github.com/phetsims/scenery/issues/206
        (!event.pointer.dragging || !this._attach) && event.pointer !== this.lastInterruptedTouchLikePointer && event.canStartPress()) {
            this.startDrag(event);
        }
    }
    /**
   * @public
   *
   * @param {SceneryEvent} event
   */ tryTouchToSnag(event) {
        // allow touches to start a drag by moving "over" this node, and allows clients to specify custom logic for when touchSnag is allowable
        if (this.options.allowTouchSnag && (this.options.allowTouchSnag === true || this.options.allowTouchSnag(event))) {
            this.tryToSnag(event);
        }
    }
    /*---------------------------------------------------------------------------*
   * events called from the node input listener
   *----------------------------------------------------------------------------*/ /**
   * Event listener method - mouse/touch down on this node
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */ down(event) {
        this.tryToSnag(event);
    }
    /**
   * Event listener method - touch enters this node
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */ touchenter(event) {
        this.tryTouchToSnag(event);
    }
    /**
   * Event listener method - touch moves over this node
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */ touchmove(event) {
        this.tryTouchToSnag(event);
    }
    /**
   * Disposes this listener, releasing any references it may have to a pointer.
   * @public
   */ dispose() {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('SimpleDragHandler dispose');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        if (this.dragging) {
            if (this._attach) {
                // Only set the `dragging` flag on the pointer if we have attach:true
                // See https://github.com/phetsims/scenery/issues/206
                this.pointer.dragging = false;
            }
            this.pointer.cursor = null;
            this.pointer.removeInputListener(this.dragListener);
        }
        this.isDraggingProperty.dispose();
        // It seemed without disposing these led to a memory leak in Energy Skate Park: Basics
        this.dragEndAction.dispose();
        this.dragAction.dispose();
        this.dragStartAction.dispose();
        super.dispose();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Creates an input listener that forwards events to the specified input listener
   * @public
   *
   * See https://github.com/phetsims/scenery/issues/639
   *
   * @param {function(SceneryEvent)} down - down function to be added to the input listener
   * @param {Object} [options]
   * @returns {Object} a scenery input listener
   */ static createForwardingListener(down, options) {
        options = merge({
            allowTouchSnag: false
        }, options);
        return {
            down: (event)=>{
                if (!event.pointer.dragging && event.canStartPress()) {
                    down(event);
                }
            },
            touchenter: function(event) {
                options.allowTouchSnag && this.down(event);
            },
            touchmove: function(event) {
                options.allowTouchSnag && this.down(event);
            }
        };
    }
    /**
   * @param {Object} [options]
   */ constructor(options){
        assert && deprecationWarning('SimpleDragHandler is deprecated, please use DragListener instead');
        options = merge({
            start: null,
            drag: null,
            end: null,
            // {null|function} Called when the pointer moves.
            // Signature is translate( { delta: Vector2, oldPosition: Vector2, position: Vector2 } )
            translate: null,
            // {boolean|function:boolean}
            allowTouchSnag: false,
            // allow changing the mouse button that activates the drag listener.
            // -1 should activate on any mouse button, 0 on left, 1 for middle, 2 for right, etc.
            mouseButton: 0,
            // while dragging with the mouse, sets the cursor to this value
            // (or use null to not override the cursor while dragging)
            dragCursor: 'pointer',
            // when set to true, the handler will get "attached" to a pointer during use, preventing the pointer from starting
            // a drag via something like PressListener
            attach: true,
            // phetio
            tandem: Tandem.REQUIRED,
            phetioState: false,
            phetioEventType: EventType.USER,
            phetioReadOnly: true
        }, options);
        super();
        this.options = options; // @private
        // @public (read-only) {BooleanProperty} - indicates whether dragging is in progress
        this.isDraggingProperty = new BooleanProperty(false, {
            phetioReadOnly: options.phetioReadOnly,
            phetioState: false,
            tandem: options.tandem.createTandem('isDraggingProperty'),
            phetioDocumentation: 'Indicates whether the object is dragging'
        });
        // @public {Pointer|null} - the pointer doing the current dragging
        this.pointer = null;
        // @public {Trail|null} - stores the path to the node that is being dragged
        this.trail = null;
        // @public {Transform3|null} - transform of the trail to our node (but not including our node, so we can prepend
        // the deltas)
        this.transform = null;
        // @public {Node|null} - the node that we are handling the drag for
        this.node = null;
        // @protected {Vector2|null} - the location of the drag at the previous event (so we can calculate a delta)
        this.lastDragPoint = null;
        // @protected {Matrix3|null} - the node's transform at the start of the drag, so we can reset on a touch cancel
        this.startTransformMatrix = null;
        // @public {number|undefined} - tracks which mouse button was pressed, so we can handle that specifically
        this.mouseButton = undefined;
        // @public {boolean} - This will be set to true for endDrag calls that are the result of the listener being
        // interrupted. It will be set back to false after the endDrag is finished.
        this.interrupted = false;
        // @private {Pointer|null} - There are cases like https://github.com/phetsims/equality-explorer/issues/97 where if
        // a touchenter starts a drag that is IMMEDIATELY interrupted, the touchdown would start another drag. We record
        // interruptions here so that we can prevent future enter/down events from the same touch pointer from triggering
        // another startDrag.
        this.lastInterruptedTouchLikePointer = null;
        // @private {boolean}
        this._attach = options.attach;
        // @private {Action}
        this.dragStartAction = new PhetioAction((point, event)=>{
            if (this.dragging) {
                return;
            }
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('SimpleDragHandler startDrag');
            sceneryLog && sceneryLog.InputListener && sceneryLog.push();
            // set a flag on the pointer so it won't pick up other nodes
            if (this._attach) {
                // Only set the `dragging` flag on the pointer if we have attach:true
                // See https://github.com/phetsims/scenery/issues/206
                event.pointer.dragging = true;
            }
            event.pointer.cursor = this.options.dragCursor;
            event.pointer.addInputListener(this.dragListener, this.options.attach);
            // mark the Intent of this pointer listener to indicate that we want to drag and therefore potentially
            // change the behavior of other listeners in the dispatch phase
            event.pointer.reserveForDrag();
            // set all of our persistent information
            this.isDraggingProperty.set(true);
            this.pointer = event.pointer;
            this.trail = event.trail.subtrailTo(event.currentTarget, true);
            this.transform = this.trail.getTransform();
            this.node = event.currentTarget;
            this.lastDragPoint = event.pointer.point;
            this.startTransformMatrix = event.currentTarget.getMatrix().copy();
            // event.domEvent may not exist for touch-to-snag
            this.mouseButton = event.pointer instanceof Mouse ? event.domEvent.button : undefined;
            if (this.options.start) {
                this.options.start.call(null, event, this.trail);
            }
            sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        }, {
            tandem: options.tandem.createTandem('dragStartAction'),
            phetioReadOnly: options.phetioReadOnly,
            parameters: [
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO,
                    phetioDocumentation: 'the position of the drag start in view coordinates'
                },
                {
                    phetioPrivate: true,
                    valueType: [
                        SceneryEvent,
                        null
                    ]
                }
            ]
        });
        // @private {Action}
        this.dragAction = new PhetioAction((point, event)=>{
            if (!this.dragging || this.isDisposed) {
                return;
            }
            const globalDelta = this.pointer.point.minus(this.lastDragPoint);
            // ignore move events that have 0-length. Chrome seems to be auto-firing these on Windows,
            // see https://code.google.com/p/chromium/issues/detail?id=327114
            if (globalDelta.magnitudeSquared === 0) {
                return;
            }
            const delta = this.transform.inverseDelta2(globalDelta);
            assert && assert(event.pointer === this.pointer, 'Wrong pointer in move');
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`SimpleDragHandler (pointer) move for ${this.trail.toString()}`);
            sceneryLog && sceneryLog.InputListener && sceneryLog.push();
            // move by the delta between the previous point, using the precomputed transform
            // prepend the translation on the node, so we can ignore whatever other transform state the node has
            if (this.options.translate) {
                const translation = this.node.getMatrix().getTranslation();
                this.options.translate.call(null, {
                    delta: delta,
                    oldPosition: translation,
                    position: translation.plus(delta)
                });
            }
            this.lastDragPoint = this.pointer.point;
            if (this.options.drag) {
                // TODO: add the position in to the listener https://github.com/phetsims/scenery/issues/1581
                const saveCurrentTarget = event.currentTarget;
                event.currentTarget = this.node; // #66: currentTarget on a pointer is null, so set it to the node we're dragging
                this.options.drag.call(null, event, this.trail); // new position (old position?) delta
                event.currentTarget = saveCurrentTarget; // be polite to other listeners, restore currentTarget
            }
            sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        }, {
            phetioHighFrequency: true,
            phetioReadOnly: options.phetioReadOnly,
            tandem: options.tandem.createTandem('dragAction'),
            parameters: [
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO,
                    phetioDocumentation: 'the position of the drag in view coordinates'
                },
                {
                    phetioPrivate: true,
                    valueType: [
                        SceneryEvent,
                        null
                    ]
                }
            ]
        });
        // @private {Action}
        this.dragEndAction = new PhetioAction((point, event)=>{
            if (!this.dragging) {
                return;
            }
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('SimpleDragHandler endDrag');
            sceneryLog && sceneryLog.InputListener && sceneryLog.push();
            if (this._attach) {
                // Only set the `dragging` flag on the pointer if we have attach:true
                // See https://github.com/phetsims/scenery/issues/206
                this.pointer.dragging = false;
            }
            this.pointer.cursor = null;
            this.pointer.removeInputListener(this.dragListener);
            this.isDraggingProperty.set(false);
            if (this.options.end) {
                // drag end may be triggered programmatically and hence event and trail may be undefined
                this.options.end.call(null, event, this.trail);
            }
            // release our reference
            this.pointer = null;
            sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        }, {
            tandem: options.tandem.createTandem('dragEndAction'),
            phetioReadOnly: options.phetioReadOnly,
            parameters: [
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO,
                    phetioDocumentation: 'the position of the drag end in view coordinates'
                },
                {
                    phetioPrivate: true,
                    isValidValue: (value)=>{
                        return value === null || value instanceof SceneryEvent || // When interrupted, an object literal is used to signify the interruption,
                        // see SimpleDragHandler.interrupt
                        value.pointer && value.currentTarget;
                    }
                }
            ]
        });
        // @protected {function} - if an ancestor is transformed, pin our node
        this.transformListener = {
            transform: (args)=>{
                if (!this.trail.isExtensionOf(args.trail, true)) {
                    return;
                }
                const newMatrix = args.trail.getMatrix();
                const oldMatrix = this.transform.getMatrix();
                // if A was the trail's old transform, B is the trail's new transform, we need to apply (B^-1 A) to our node
                this.node.prependMatrix(newMatrix.inverted().timesMatrix(oldMatrix));
                // store the new matrix so we can do deltas using it now
                this.transform.setMatrix(newMatrix);
            }
        };
        // @protected {function} - this listener gets added to the pointer when it starts dragging our node
        this.dragListener = {
            // mouse/touch up
            up: (event)=>{
                if (!this.dragging || this.isDisposed) {
                    return;
                }
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`SimpleDragHandler (pointer) up for ${this.trail.toString()}`);
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                assert && assert(event.pointer === this.pointer, 'Wrong pointer in up');
                if (!(event.pointer instanceof Mouse) || event.domEvent.button === this.mouseButton) {
                    const saveCurrentTarget = event.currentTarget;
                    event.currentTarget = this.node; // #66: currentTarget on a pointer is null, so set it to the node we're dragging
                    this.endDrag(event);
                    event.currentTarget = saveCurrentTarget; // be polite to other listeners, restore currentTarget
                }
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            },
            // touch cancel
            cancel: (event)=>{
                if (!this.dragging || this.isDisposed) {
                    return;
                }
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`SimpleDragHandler (pointer) cancel for ${this.trail.toString()}`);
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                assert && assert(event.pointer === this.pointer, 'Wrong pointer in cancel');
                const saveCurrentTarget = event.currentTarget;
                event.currentTarget = this.node; // #66: currentTarget on a pointer is null, so set it to the node we're dragging
                this.endDrag(event);
                event.currentTarget = saveCurrentTarget; // be polite to other listeners, restore currentTarget
                // since it's a cancel event, go back!
                if (!this.transform) {
                    this.node.setMatrix(this.startTransformMatrix);
                }
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            },
            // mouse/touch move
            move: (event)=>{
                this.dragAction.execute(event.pointer.point, event);
            },
            // pointer interruption
            interrupt: ()=>{
                this.interrupt();
            }
        };
        this.initializePhetioObject({}, options);
    }
};
scenery.register('SimpleDragHandler', SimpleDragHandler);
export default SimpleDragHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvU2ltcGxlRHJhZ0hhbmRsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQmFzaWMgZHJhZ2dpbmcgZm9yIGEgbm9kZS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgZGVwcmVjYXRpb25XYXJuaW5nIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kZXByZWNhdGlvbldhcm5pbmcuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xuaW1wb3J0IFBoZXRpb0FjdGlvbiBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvQWN0aW9uLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHsgTW91c2UsIHNjZW5lcnksIFNjZW5lcnlFdmVudCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIC0gcGxlYXNlIHVzZSBEcmFnTGlzdGVuZXIgZm9yIG5ldyBjb2RlXG4gKi9cbmNsYXNzIFNpbXBsZURyYWdIYW5kbGVyIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdTaW1wbGVEcmFnSGFuZGxlciBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIERyYWdMaXN0ZW5lciBpbnN0ZWFkJyApO1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG5cbiAgICAgIHN0YXJ0OiBudWxsLCAvLyB7bnVsbHxmdW5jdGlvbihTY2VuZXJ5RXZlbnQsVHJhaWwpfSBjYWxsZWQgd2hlbiBhIGRyYWcgaXMgc3RhcnRlZFxuICAgICAgZHJhZzogbnVsbCwgLy8ge251bGx8ZnVuY3Rpb24oU2NlbmVyeUV2ZW50LFRyYWlsKX0gY2FsbGVkIHdoZW4gcG9pbnRlciBtb3Zlc1xuICAgICAgZW5kOiBudWxsLCAgLy8ge251bGx8ZnVuY3Rpb24oU2NlbmVyeUV2ZW50LFRyYWlsKX0gY2FsbGVkIHdoZW4gYSBkcmFnIGlzIGVuZGVkXG5cbiAgICAgIC8vIHtudWxsfGZ1bmN0aW9ufSBDYWxsZWQgd2hlbiB0aGUgcG9pbnRlciBtb3Zlcy5cbiAgICAgIC8vIFNpZ25hdHVyZSBpcyB0cmFuc2xhdGUoIHsgZGVsdGE6IFZlY3RvcjIsIG9sZFBvc2l0aW9uOiBWZWN0b3IyLCBwb3NpdGlvbjogVmVjdG9yMiB9IClcbiAgICAgIHRyYW5zbGF0ZTogbnVsbCwgLy9cblxuICAgICAgLy8ge2Jvb2xlYW58ZnVuY3Rpb246Ym9vbGVhbn1cbiAgICAgIGFsbG93VG91Y2hTbmFnOiBmYWxzZSxcblxuICAgICAgLy8gYWxsb3cgY2hhbmdpbmcgdGhlIG1vdXNlIGJ1dHRvbiB0aGF0IGFjdGl2YXRlcyB0aGUgZHJhZyBsaXN0ZW5lci5cbiAgICAgIC8vIC0xIHNob3VsZCBhY3RpdmF0ZSBvbiBhbnkgbW91c2UgYnV0dG9uLCAwIG9uIGxlZnQsIDEgZm9yIG1pZGRsZSwgMiBmb3IgcmlnaHQsIGV0Yy5cbiAgICAgIG1vdXNlQnV0dG9uOiAwLFxuXG4gICAgICAvLyB3aGlsZSBkcmFnZ2luZyB3aXRoIHRoZSBtb3VzZSwgc2V0cyB0aGUgY3Vyc29yIHRvIHRoaXMgdmFsdWVcbiAgICAgIC8vIChvciB1c2UgbnVsbCB0byBub3Qgb3ZlcnJpZGUgdGhlIGN1cnNvciB3aGlsZSBkcmFnZ2luZylcbiAgICAgIGRyYWdDdXJzb3I6ICdwb2ludGVyJyxcblxuICAgICAgLy8gd2hlbiBzZXQgdG8gdHJ1ZSwgdGhlIGhhbmRsZXIgd2lsbCBnZXQgXCJhdHRhY2hlZFwiIHRvIGEgcG9pbnRlciBkdXJpbmcgdXNlLCBwcmV2ZW50aW5nIHRoZSBwb2ludGVyIGZyb20gc3RhcnRpbmdcbiAgICAgIC8vIGEgZHJhZyB2aWEgc29tZXRoaW5nIGxpa2UgUHJlc3NMaXN0ZW5lclxuICAgICAgYXR0YWNoOiB0cnVlLFxuXG4gICAgICAvLyBwaGV0aW9cbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXG5cbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uczsgLy8gQHByaXZhdGVcblxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0Jvb2xlYW5Qcm9wZXJ0eX0gLSBpbmRpY2F0ZXMgd2hldGhlciBkcmFnZ2luZyBpcyBpbiBwcm9ncmVzc1xuICAgIHRoaXMuaXNEcmFnZ2luZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBvcHRpb25zLnBoZXRpb1JlYWRPbmx5LFxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc0RyYWdnaW5nUHJvcGVydHknICksXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnSW5kaWNhdGVzIHdoZXRoZXIgdGhlIG9iamVjdCBpcyBkcmFnZ2luZydcbiAgICB9ICk7XG5cbiAgICAvLyBAcHVibGljIHtQb2ludGVyfG51bGx9IC0gdGhlIHBvaW50ZXIgZG9pbmcgdGhlIGN1cnJlbnQgZHJhZ2dpbmdcbiAgICB0aGlzLnBvaW50ZXIgPSBudWxsO1xuXG4gICAgLy8gQHB1YmxpYyB7VHJhaWx8bnVsbH0gLSBzdG9yZXMgdGhlIHBhdGggdG8gdGhlIG5vZGUgdGhhdCBpcyBiZWluZyBkcmFnZ2VkXG4gICAgdGhpcy50cmFpbCA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtUcmFuc2Zvcm0zfG51bGx9IC0gdHJhbnNmb3JtIG9mIHRoZSB0cmFpbCB0byBvdXIgbm9kZSAoYnV0IG5vdCBpbmNsdWRpbmcgb3VyIG5vZGUsIHNvIHdlIGNhbiBwcmVwZW5kXG4gICAgLy8gdGhlIGRlbHRhcylcbiAgICB0aGlzLnRyYW5zZm9ybSA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtOb2RlfG51bGx9IC0gdGhlIG5vZGUgdGhhdCB3ZSBhcmUgaGFuZGxpbmcgdGhlIGRyYWcgZm9yXG4gICAgdGhpcy5ub2RlID0gbnVsbDtcblxuICAgIC8vIEBwcm90ZWN0ZWQge1ZlY3RvcjJ8bnVsbH0gLSB0aGUgbG9jYXRpb24gb2YgdGhlIGRyYWcgYXQgdGhlIHByZXZpb3VzIGV2ZW50IChzbyB3ZSBjYW4gY2FsY3VsYXRlIGEgZGVsdGEpXG4gICAgdGhpcy5sYXN0RHJhZ1BvaW50ID0gbnVsbDtcblxuICAgIC8vIEBwcm90ZWN0ZWQge01hdHJpeDN8bnVsbH0gLSB0aGUgbm9kZSdzIHRyYW5zZm9ybSBhdCB0aGUgc3RhcnQgb2YgdGhlIGRyYWcsIHNvIHdlIGNhbiByZXNldCBvbiBhIHRvdWNoIGNhbmNlbFxuICAgIHRoaXMuc3RhcnRUcmFuc2Zvcm1NYXRyaXggPSBudWxsO1xuXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfHVuZGVmaW5lZH0gLSB0cmFja3Mgd2hpY2ggbW91c2UgYnV0dG9uIHdhcyBwcmVzc2VkLCBzbyB3ZSBjYW4gaGFuZGxlIHRoYXQgc3BlY2lmaWNhbGx5XG4gICAgdGhpcy5tb3VzZUJ1dHRvbiA9IHVuZGVmaW5lZDtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gVGhpcyB3aWxsIGJlIHNldCB0byB0cnVlIGZvciBlbmREcmFnIGNhbGxzIHRoYXQgYXJlIHRoZSByZXN1bHQgb2YgdGhlIGxpc3RlbmVyIGJlaW5nXG4gICAgLy8gaW50ZXJydXB0ZWQuIEl0IHdpbGwgYmUgc2V0IGJhY2sgdG8gZmFsc2UgYWZ0ZXIgdGhlIGVuZERyYWcgaXMgZmluaXNoZWQuXG4gICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgLy8gQHByaXZhdGUge1BvaW50ZXJ8bnVsbH0gLSBUaGVyZSBhcmUgY2FzZXMgbGlrZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzk3IHdoZXJlIGlmXG4gICAgLy8gYSB0b3VjaGVudGVyIHN0YXJ0cyBhIGRyYWcgdGhhdCBpcyBJTU1FRElBVEVMWSBpbnRlcnJ1cHRlZCwgdGhlIHRvdWNoZG93biB3b3VsZCBzdGFydCBhbm90aGVyIGRyYWcuIFdlIHJlY29yZFxuICAgIC8vIGludGVycnVwdGlvbnMgaGVyZSBzbyB0aGF0IHdlIGNhbiBwcmV2ZW50IGZ1dHVyZSBlbnRlci9kb3duIGV2ZW50cyBmcm9tIHRoZSBzYW1lIHRvdWNoIHBvaW50ZXIgZnJvbSB0cmlnZ2VyaW5nXG4gICAgLy8gYW5vdGhlciBzdGFydERyYWcuXG4gICAgdGhpcy5sYXN0SW50ZXJydXB0ZWRUb3VjaExpa2VQb2ludGVyID0gbnVsbDtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxuICAgIHRoaXMuX2F0dGFjaCA9IG9wdGlvbnMuYXR0YWNoO1xuXG4gICAgLy8gQHByaXZhdGUge0FjdGlvbn1cbiAgICB0aGlzLmRyYWdTdGFydEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggcG9pbnQsIGV2ZW50ICkgPT4ge1xuXG4gICAgICBpZiAoIHRoaXMuZHJhZ2dpbmcgKSB7IHJldHVybjsgfVxuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdTaW1wbGVEcmFnSGFuZGxlciBzdGFydERyYWcnICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgLy8gc2V0IGEgZmxhZyBvbiB0aGUgcG9pbnRlciBzbyBpdCB3b24ndCBwaWNrIHVwIG90aGVyIG5vZGVzXG4gICAgICBpZiAoIHRoaXMuX2F0dGFjaCApIHtcbiAgICAgICAgLy8gT25seSBzZXQgdGhlIGBkcmFnZ2luZ2AgZmxhZyBvbiB0aGUgcG9pbnRlciBpZiB3ZSBoYXZlIGF0dGFjaDp0cnVlXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMjA2XG4gICAgICAgIGV2ZW50LnBvaW50ZXIuZHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZXZlbnQucG9pbnRlci5jdXJzb3IgPSB0aGlzLm9wdGlvbnMuZHJhZ0N1cnNvcjtcbiAgICAgIGV2ZW50LnBvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5kcmFnTGlzdGVuZXIsIHRoaXMub3B0aW9ucy5hdHRhY2ggKTtcblxuICAgICAgLy8gbWFyayB0aGUgSW50ZW50IG9mIHRoaXMgcG9pbnRlciBsaXN0ZW5lciB0byBpbmRpY2F0ZSB0aGF0IHdlIHdhbnQgdG8gZHJhZyBhbmQgdGhlcmVmb3JlIHBvdGVudGlhbGx5XG4gICAgICAvLyBjaGFuZ2UgdGhlIGJlaGF2aW9yIG9mIG90aGVyIGxpc3RlbmVycyBpbiB0aGUgZGlzcGF0Y2ggcGhhc2VcbiAgICAgIGV2ZW50LnBvaW50ZXIucmVzZXJ2ZUZvckRyYWcoKTtcblxuICAgICAgLy8gc2V0IGFsbCBvZiBvdXIgcGVyc2lzdGVudCBpbmZvcm1hdGlvblxuICAgICAgdGhpcy5pc0RyYWdnaW5nUHJvcGVydHkuc2V0KCB0cnVlICk7XG4gICAgICB0aGlzLnBvaW50ZXIgPSBldmVudC5wb2ludGVyO1xuICAgICAgdGhpcy50cmFpbCA9IGV2ZW50LnRyYWlsLnN1YnRyYWlsVG8oIGV2ZW50LmN1cnJlbnRUYXJnZXQsIHRydWUgKTtcbiAgICAgIHRoaXMudHJhbnNmb3JtID0gdGhpcy50cmFpbC5nZXRUcmFuc2Zvcm0oKTtcbiAgICAgIHRoaXMubm9kZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgICB0aGlzLmxhc3REcmFnUG9pbnQgPSBldmVudC5wb2ludGVyLnBvaW50O1xuICAgICAgdGhpcy5zdGFydFRyYW5zZm9ybU1hdHJpeCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0TWF0cml4KCkuY29weSgpO1xuICAgICAgLy8gZXZlbnQuZG9tRXZlbnQgbWF5IG5vdCBleGlzdCBmb3IgdG91Y2gtdG8tc25hZ1xuICAgICAgdGhpcy5tb3VzZUJ1dHRvbiA9IGV2ZW50LnBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSA/IGV2ZW50LmRvbUV2ZW50LmJ1dHRvbiA6IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKCB0aGlzLm9wdGlvbnMuc3RhcnQgKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5zdGFydC5jYWxsKCBudWxsLCBldmVudCwgdGhpcy50cmFpbCApO1xuICAgICAgfVxuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH0sIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ1N0YXJ0QWN0aW9uJyApLFxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9wdGlvbnMucGhldGlvUmVhZE9ubHksXG4gICAgICBwYXJhbWV0ZXJzOiBbIHtcbiAgICAgICAgbmFtZTogJ3BvaW50JyxcbiAgICAgICAgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8sXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgcG9zaXRpb24gb2YgdGhlIGRyYWcgc3RhcnQgaW4gdmlldyBjb29yZGluYXRlcydcbiAgICAgIH0sIHtcbiAgICAgICAgcGhldGlvUHJpdmF0ZTogdHJ1ZSxcbiAgICAgICAgdmFsdWVUeXBlOiBbIFNjZW5lcnlFdmVudCwgbnVsbCBdXG4gICAgICB9IF1cbiAgICB9ICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7QWN0aW9ufVxuICAgIHRoaXMuZHJhZ0FjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggcG9pbnQsIGV2ZW50ICkgPT4ge1xuXG4gICAgICBpZiAoICF0aGlzLmRyYWdnaW5nIHx8IHRoaXMuaXNEaXNwb3NlZCApIHsgcmV0dXJuOyB9XG5cbiAgICAgIGNvbnN0IGdsb2JhbERlbHRhID0gdGhpcy5wb2ludGVyLnBvaW50Lm1pbnVzKCB0aGlzLmxhc3REcmFnUG9pbnQgKTtcblxuICAgICAgLy8gaWdub3JlIG1vdmUgZXZlbnRzIHRoYXQgaGF2ZSAwLWxlbmd0aC4gQ2hyb21lIHNlZW1zIHRvIGJlIGF1dG8tZmlyaW5nIHRoZXNlIG9uIFdpbmRvd3MsXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTMyNzExNFxuICAgICAgaWYgKCBnbG9iYWxEZWx0YS5tYWduaXR1ZGVTcXVhcmVkID09PSAwICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy50cmFuc2Zvcm0uaW52ZXJzZURlbHRhMiggZ2xvYmFsRGVsdGEgKTtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZXZlbnQucG9pbnRlciA9PT0gdGhpcy5wb2ludGVyLCAnV3JvbmcgcG9pbnRlciBpbiBtb3ZlJyApO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBTaW1wbGVEcmFnSGFuZGxlciAocG9pbnRlcikgbW92ZSBmb3IgJHt0aGlzLnRyYWlsLnRvU3RyaW5nKCl9YCApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgIC8vIG1vdmUgYnkgdGhlIGRlbHRhIGJldHdlZW4gdGhlIHByZXZpb3VzIHBvaW50LCB1c2luZyB0aGUgcHJlY29tcHV0ZWQgdHJhbnNmb3JtXG4gICAgICAvLyBwcmVwZW5kIHRoZSB0cmFuc2xhdGlvbiBvbiB0aGUgbm9kZSwgc28gd2UgY2FuIGlnbm9yZSB3aGF0ZXZlciBvdGhlciB0cmFuc2Zvcm0gc3RhdGUgdGhlIG5vZGUgaGFzXG4gICAgICBpZiAoIHRoaXMub3B0aW9ucy50cmFuc2xhdGUgKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gdGhpcy5ub2RlLmdldE1hdHJpeCgpLmdldFRyYW5zbGF0aW9uKCk7XG4gICAgICAgIHRoaXMub3B0aW9ucy50cmFuc2xhdGUuY2FsbCggbnVsbCwge1xuICAgICAgICAgIGRlbHRhOiBkZWx0YSxcbiAgICAgICAgICBvbGRQb3NpdGlvbjogdHJhbnNsYXRpb24sXG4gICAgICAgICAgcG9zaXRpb246IHRyYW5zbGF0aW9uLnBsdXMoIGRlbHRhIClcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgdGhpcy5sYXN0RHJhZ1BvaW50ID0gdGhpcy5wb2ludGVyLnBvaW50O1xuXG4gICAgICBpZiAoIHRoaXMub3B0aW9ucy5kcmFnICkge1xuXG4gICAgICAgIC8vIFRPRE86IGFkZCB0aGUgcG9zaXRpb24gaW4gdG8gdGhlIGxpc3RlbmVyIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgIGNvbnN0IHNhdmVDdXJyZW50VGFyZ2V0ID0gZXZlbnQuY3VycmVudFRhcmdldDtcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldCA9IHRoaXMubm9kZTsgLy8gIzY2OiBjdXJyZW50VGFyZ2V0IG9uIGEgcG9pbnRlciBpcyBudWxsLCBzbyBzZXQgaXQgdG8gdGhlIG5vZGUgd2UncmUgZHJhZ2dpbmdcbiAgICAgICAgdGhpcy5vcHRpb25zLmRyYWcuY2FsbCggbnVsbCwgZXZlbnQsIHRoaXMudHJhaWwgKTsgLy8gbmV3IHBvc2l0aW9uIChvbGQgcG9zaXRpb24/KSBkZWx0YVxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0ID0gc2F2ZUN1cnJlbnRUYXJnZXQ7IC8vIGJlIHBvbGl0ZSB0byBvdGhlciBsaXN0ZW5lcnMsIHJlc3RvcmUgY3VycmVudFRhcmdldFxuICAgICAgfVxuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH0sIHtcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXG4gICAgICBwaGV0aW9SZWFkT25seTogb3B0aW9ucy5waGV0aW9SZWFkT25seSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0FjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFsge1xuICAgICAgICBuYW1lOiAncG9pbnQnLFxuICAgICAgICBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyxcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZyBpbiB2aWV3IGNvb3JkaW5hdGVzJ1xuICAgICAgfSwge1xuICAgICAgICBwaGV0aW9Qcml2YXRlOiB0cnVlLFxuICAgICAgICB2YWx1ZVR5cGU6IFsgU2NlbmVyeUV2ZW50LCBudWxsIF1cbiAgICAgIH0gXVxuICAgIH0gKTtcblxuICAgIC8vIEBwcml2YXRlIHtBY3Rpb259XG4gICAgdGhpcy5kcmFnRW5kQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBwb2ludCwgZXZlbnQgKSA9PiB7XG5cbiAgICAgIGlmICggIXRoaXMuZHJhZ2dpbmcgKSB7IHJldHVybjsgfVxuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdTaW1wbGVEcmFnSGFuZGxlciBlbmREcmFnJyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgIGlmICggdGhpcy5fYXR0YWNoICkge1xuICAgICAgICAvLyBPbmx5IHNldCB0aGUgYGRyYWdnaW5nYCBmbGFnIG9uIHRoZSBwb2ludGVyIGlmIHdlIGhhdmUgYXR0YWNoOnRydWVcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8yMDZcbiAgICAgICAgdGhpcy5wb2ludGVyLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLnBvaW50ZXIuY3Vyc29yID0gbnVsbDtcbiAgICAgIHRoaXMucG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLmRyYWdMaXN0ZW5lciApO1xuXG4gICAgICB0aGlzLmlzRHJhZ2dpbmdQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XG5cbiAgICAgIGlmICggdGhpcy5vcHRpb25zLmVuZCApIHtcblxuICAgICAgICAvLyBkcmFnIGVuZCBtYXkgYmUgdHJpZ2dlcmVkIHByb2dyYW1tYXRpY2FsbHkgYW5kIGhlbmNlIGV2ZW50IGFuZCB0cmFpbCBtYXkgYmUgdW5kZWZpbmVkXG4gICAgICAgIHRoaXMub3B0aW9ucy5lbmQuY2FsbCggbnVsbCwgZXZlbnQsIHRoaXMudHJhaWwgKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVsZWFzZSBvdXIgcmVmZXJlbmNlXG4gICAgICB0aGlzLnBvaW50ZXIgPSBudWxsO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH0sIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0VuZEFjdGlvbicgKSxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBvcHRpb25zLnBoZXRpb1JlYWRPbmx5LFxuICAgICAgcGFyYW1ldGVyczogWyB7XG4gICAgICAgIG5hbWU6ICdwb2ludCcsXG4gICAgICAgIHBoZXRpb1R5cGU6IFZlY3RvcjIuVmVjdG9yMklPLFxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIHBvc2l0aW9uIG9mIHRoZSBkcmFnIGVuZCBpbiB2aWV3IGNvb3JkaW5hdGVzJ1xuICAgICAgfSwge1xuICAgICAgICBwaGV0aW9Qcml2YXRlOiB0cnVlLFxuICAgICAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgaW5zdGFuY2VvZiBTY2VuZXJ5RXZlbnQgfHxcblxuICAgICAgICAgICAgICAgICAvLyBXaGVuIGludGVycnVwdGVkLCBhbiBvYmplY3QgbGl0ZXJhbCBpcyB1c2VkIHRvIHNpZ25pZnkgdGhlIGludGVycnVwdGlvbixcbiAgICAgICAgICAgICAgICAgLy8gc2VlIFNpbXBsZURyYWdIYW5kbGVyLmludGVycnVwdFxuICAgICAgICAgICAgICAgICAoIHZhbHVlLnBvaW50ZXIgJiYgdmFsdWUuY3VycmVudFRhcmdldCApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBdXG4gICAgfSApO1xuXG4gICAgLy8gQHByb3RlY3RlZCB7ZnVuY3Rpb259IC0gaWYgYW4gYW5jZXN0b3IgaXMgdHJhbnNmb3JtZWQsIHBpbiBvdXIgbm9kZVxuICAgIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgPSB7XG4gICAgICB0cmFuc2Zvcm06IGFyZ3MgPT4ge1xuICAgICAgICBpZiAoICF0aGlzLnRyYWlsLmlzRXh0ZW5zaW9uT2YoIGFyZ3MudHJhaWwsIHRydWUgKSApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXdNYXRyaXggPSBhcmdzLnRyYWlsLmdldE1hdHJpeCgpO1xuICAgICAgICBjb25zdCBvbGRNYXRyaXggPSB0aGlzLnRyYW5zZm9ybS5nZXRNYXRyaXgoKTtcblxuICAgICAgICAvLyBpZiBBIHdhcyB0aGUgdHJhaWwncyBvbGQgdHJhbnNmb3JtLCBCIGlzIHRoZSB0cmFpbCdzIG5ldyB0cmFuc2Zvcm0sIHdlIG5lZWQgdG8gYXBwbHkgKEJeLTEgQSkgdG8gb3VyIG5vZGVcbiAgICAgICAgdGhpcy5ub2RlLnByZXBlbmRNYXRyaXgoIG5ld01hdHJpeC5pbnZlcnRlZCgpLnRpbWVzTWF0cml4KCBvbGRNYXRyaXggKSApO1xuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBuZXcgbWF0cml4IHNvIHdlIGNhbiBkbyBkZWx0YXMgdXNpbmcgaXQgbm93XG4gICAgICAgIHRoaXMudHJhbnNmb3JtLnNldE1hdHJpeCggbmV3TWF0cml4ICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEBwcm90ZWN0ZWQge2Z1bmN0aW9ufSAtIHRoaXMgbGlzdGVuZXIgZ2V0cyBhZGRlZCB0byB0aGUgcG9pbnRlciB3aGVuIGl0IHN0YXJ0cyBkcmFnZ2luZyBvdXIgbm9kZVxuICAgIHRoaXMuZHJhZ0xpc3RlbmVyID0ge1xuICAgICAgLy8gbW91c2UvdG91Y2ggdXBcbiAgICAgIHVwOiBldmVudCA9PiB7XG4gICAgICAgIGlmICggIXRoaXMuZHJhZ2dpbmcgfHwgdGhpcy5pc0Rpc3Bvc2VkICkgeyByZXR1cm47IH1cblxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBTaW1wbGVEcmFnSGFuZGxlciAocG9pbnRlcikgdXAgZm9yICR7dGhpcy50cmFpbC50b1N0cmluZygpfWAgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZXZlbnQucG9pbnRlciA9PT0gdGhpcy5wb2ludGVyLCAnV3JvbmcgcG9pbnRlciBpbiB1cCcgKTtcbiAgICAgICAgaWYgKCAhKCBldmVudC5wb2ludGVyIGluc3RhbmNlb2YgTW91c2UgKSB8fCBldmVudC5kb21FdmVudC5idXR0b24gPT09IHRoaXMubW91c2VCdXR0b24gKSB7XG4gICAgICAgICAgY29uc3Qgc2F2ZUN1cnJlbnRUYXJnZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSB0aGlzLm5vZGU7IC8vICM2NjogY3VycmVudFRhcmdldCBvbiBhIHBvaW50ZXIgaXMgbnVsbCwgc28gc2V0IGl0IHRvIHRoZSBub2RlIHdlJ3JlIGRyYWdnaW5nXG4gICAgICAgICAgdGhpcy5lbmREcmFnKCBldmVudCApO1xuICAgICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBzYXZlQ3VycmVudFRhcmdldDsgLy8gYmUgcG9saXRlIHRvIG90aGVyIGxpc3RlbmVycywgcmVzdG9yZSBjdXJyZW50VGFyZ2V0XG4gICAgICAgIH1cblxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgICAgfSxcblxuICAgICAgLy8gdG91Y2ggY2FuY2VsXG4gICAgICBjYW5jZWw6IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCAhdGhpcy5kcmFnZ2luZyB8fCB0aGlzLmlzRGlzcG9zZWQgKSB7IHJldHVybjsgfVxuXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFNpbXBsZURyYWdIYW5kbGVyIChwb2ludGVyKSBjYW5jZWwgZm9yICR7dGhpcy50cmFpbC50b1N0cmluZygpfWAgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZXZlbnQucG9pbnRlciA9PT0gdGhpcy5wb2ludGVyLCAnV3JvbmcgcG9pbnRlciBpbiBjYW5jZWwnICk7XG5cbiAgICAgICAgY29uc3Qgc2F2ZUN1cnJlbnRUYXJnZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0ID0gdGhpcy5ub2RlOyAvLyAjNjY6IGN1cnJlbnRUYXJnZXQgb24gYSBwb2ludGVyIGlzIG51bGwsIHNvIHNldCBpdCB0byB0aGUgbm9kZSB3ZSdyZSBkcmFnZ2luZ1xuICAgICAgICB0aGlzLmVuZERyYWcoIGV2ZW50ICk7XG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBzYXZlQ3VycmVudFRhcmdldDsgLy8gYmUgcG9saXRlIHRvIG90aGVyIGxpc3RlbmVycywgcmVzdG9yZSBjdXJyZW50VGFyZ2V0XG5cbiAgICAgICAgLy8gc2luY2UgaXQncyBhIGNhbmNlbCBldmVudCwgZ28gYmFjayFcbiAgICAgICAgaWYgKCAhdGhpcy50cmFuc2Zvcm0gKSB7XG4gICAgICAgICAgdGhpcy5ub2RlLnNldE1hdHJpeCggdGhpcy5zdGFydFRyYW5zZm9ybU1hdHJpeCApO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIG1vdXNlL3RvdWNoIG1vdmVcbiAgICAgIG1vdmU6IGV2ZW50ID0+IHtcbiAgICAgICAgdGhpcy5kcmFnQWN0aW9uLmV4ZWN1dGUoIGV2ZW50LnBvaW50ZXIucG9pbnQsIGV2ZW50ICk7XG4gICAgICB9LFxuXG4gICAgICAvLyBwb2ludGVyIGludGVycnVwdGlvblxuICAgICAgaW50ZXJydXB0OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZVBoZXRpb09iamVjdCgge30sIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIGdldCBkcmFnZ2luZygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RyYWdnaW5nUHJvcGVydHkuZ2V0KCk7XG4gIH1cblxuICBzZXQgZHJhZ2dpbmcoIGQgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdpbGxlZ2FsIGNhbGwgdG8gc2V0IGRyYWdnaW5nIG9uIFNpbXBsZURyYWdIYW5kbGVyJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XG4gICAqL1xuICBzdGFydERyYWcoIGV2ZW50ICkge1xuICAgIHRoaXMuZHJhZ1N0YXJ0QWN0aW9uLmV4ZWN1dGUoIGV2ZW50LnBvaW50ZXIucG9pbnQsIGV2ZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gZXZlbnRcbiAgICovXG4gIGVuZERyYWcoIGV2ZW50ICkge1xuXG4gICAgLy8gU2lnbmlmeSBkcmFnIGVuZGVkLiAgSW4gdGhlIGNhc2Ugb2YgcHJvZ3JhbW1hdGljYWxseSBlbmRlZCBkcmFncywgc2lnbmlmeSBkcmFnIGVuZGVkIGF0IDAsMC5cbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoLXNjYWxlLWJhc2ljcy9pc3N1ZXMvNDNcbiAgICB0aGlzLmRyYWdFbmRBY3Rpb24uZXhlY3V0ZSggZXZlbnQgPyBldmVudC5wb2ludGVyLnBvaW50IDogVmVjdG9yMi5aRVJPLCBldmVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGlucHV0IGlzIGludGVycnVwdGVkIG9uIHRoaXMgbGlzdGVuZXIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMjE4XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGludGVycnVwdCgpIHtcbiAgICBpZiAoIHRoaXMuZHJhZ2dpbmcgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdTaW1wbGVEcmFnSGFuZGxlciBpbnRlcnJ1cHQnICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgdGhpcy5pbnRlcnJ1cHRlZCA9IHRydWU7XG5cbiAgICAgIGlmICggdGhpcy5wb2ludGVyICYmIHRoaXMucG9pbnRlci5pc1RvdWNoTGlrZSgpICkge1xuICAgICAgICB0aGlzLmxhc3RJbnRlcnJ1cHRlZFRvdWNoTGlrZVBvaW50ZXIgPSB0aGlzLnBvaW50ZXI7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGNyZWF0ZSBhIHN5bnRoZXRpYyBldmVudCBoZXJlLCBhcyB0aGVyZSBpcyBubyBhdmFpbGFibGUgZXZlbnQgaGVyZS5cbiAgICAgIHRoaXMuZW5kRHJhZygge1xuICAgICAgICBwb2ludGVyOiB0aGlzLnBvaW50ZXIsXG4gICAgICAgIGN1cnJlbnRUYXJnZXQ6IHRoaXMubm9kZVxuICAgICAgfSApO1xuXG4gICAgICB0aGlzLmludGVycnVwdGVkID0gZmFsc2U7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XG4gICAqL1xuICB0cnlUb1NuYWcoIGV2ZW50ICkge1xuICAgIC8vIGRvbid0IGFsbG93IGRyYWcgYXR0ZW1wdHMgdGhhdCB1c2UgdGhlIHdyb25nIG1vdXNlIGJ1dHRvbiAoLTEgaW5kaWNhdGVzIGFueSBtb3VzZSBidXR0b24gd29ya3MpXG4gICAgaWYgKCBldmVudC5wb2ludGVyIGluc3RhbmNlb2YgTW91c2UgJiZcbiAgICAgICAgIGV2ZW50LmRvbUV2ZW50ICYmXG4gICAgICAgICB0aGlzLm9wdGlvbnMubW91c2VCdXR0b24gIT09IGV2ZW50LmRvbUV2ZW50LmJ1dHRvbiAmJlxuICAgICAgICAgdGhpcy5vcHRpb25zLm1vdXNlQnV0dG9uICE9PSAtMSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSdyZSBkaXNwb3NlZCwgd2UgY2FuJ3Qgc3RhcnQgbmV3IGRyYWdzLlxuICAgIGlmICggdGhpcy5pc0Rpc3Bvc2VkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIG9ubHkgc3RhcnQgZHJhZ2dpbmcgaWYgdGhlIHBvaW50ZXIgaXNuJ3QgZHJhZ2dpbmcgYW55dGhpbmcsIHdlIGFyZW4ndCBiZWluZyBkcmFnZ2VkLCBhbmQgaWYgaXQncyBhIG1vdXNlIGl0J3MgYnV0dG9uIGlzIGRvd25cbiAgICBpZiAoICF0aGlzLmRyYWdnaW5nICYmXG4gICAgICAgICAvLyBEb24ndCBjaGVjayBwb2ludGVyLmRyYWdnaW5nIGlmIHdlIGRvbid0IGF0dGFjaCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8yMDZcbiAgICAgICAgICggIWV2ZW50LnBvaW50ZXIuZHJhZ2dpbmcgfHwgIXRoaXMuX2F0dGFjaCApICYmXG4gICAgICAgICBldmVudC5wb2ludGVyICE9PSB0aGlzLmxhc3RJbnRlcnJ1cHRlZFRvdWNoTGlrZVBvaW50ZXIgJiZcbiAgICAgICAgIGV2ZW50LmNhblN0YXJ0UHJlc3MoKSApIHtcbiAgICAgIHRoaXMuc3RhcnREcmFnKCBldmVudCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxuICAgKi9cbiAgdHJ5VG91Y2hUb1NuYWcoIGV2ZW50ICkge1xuICAgIC8vIGFsbG93IHRvdWNoZXMgdG8gc3RhcnQgYSBkcmFnIGJ5IG1vdmluZyBcIm92ZXJcIiB0aGlzIG5vZGUsIGFuZCBhbGxvd3MgY2xpZW50cyB0byBzcGVjaWZ5IGN1c3RvbSBsb2dpYyBmb3Igd2hlbiB0b3VjaFNuYWcgaXMgYWxsb3dhYmxlXG4gICAgaWYgKCB0aGlzLm9wdGlvbnMuYWxsb3dUb3VjaFNuYWcgJiYgKCB0aGlzLm9wdGlvbnMuYWxsb3dUb3VjaFNuYWcgPT09IHRydWUgfHwgdGhpcy5vcHRpb25zLmFsbG93VG91Y2hTbmFnKCBldmVudCApICkgKSB7XG4gICAgICB0aGlzLnRyeVRvU25hZyggZXZlbnQgKTtcbiAgICB9XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogZXZlbnRzIGNhbGxlZCBmcm9tIHRoZSBub2RlIGlucHV0IGxpc3RlbmVyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEV2ZW50IGxpc3RlbmVyIG1ldGhvZCAtIG1vdXNlL3RvdWNoIGRvd24gb24gdGhpcyBub2RlXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxuICAgKi9cbiAgZG93biggZXZlbnQgKSB7XG4gICAgdGhpcy50cnlUb1NuYWcoIGV2ZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgbGlzdGVuZXIgbWV0aG9kIC0gdG91Y2ggZW50ZXJzIHRoaXMgbm9kZVxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gZXZlbnRcbiAgICovXG4gIHRvdWNoZW50ZXIoIGV2ZW50ICkge1xuICAgIHRoaXMudHJ5VG91Y2hUb1NuYWcoIGV2ZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgbGlzdGVuZXIgbWV0aG9kIC0gdG91Y2ggbW92ZXMgb3ZlciB0aGlzIG5vZGVcbiAgICogQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XG4gICAqL1xuICB0b3VjaG1vdmUoIGV2ZW50ICkge1xuICAgIHRoaXMudHJ5VG91Y2hUb1NuYWcoIGV2ZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhpcyBsaXN0ZW5lciwgcmVsZWFzaW5nIGFueSByZWZlcmVuY2VzIGl0IG1heSBoYXZlIHRvIGEgcG9pbnRlci5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdTaW1wbGVEcmFnSGFuZGxlciBkaXNwb3NlJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgaWYgKCB0aGlzLmRyYWdnaW5nICkge1xuICAgICAgaWYgKCB0aGlzLl9hdHRhY2ggKSB7XG4gICAgICAgIC8vIE9ubHkgc2V0IHRoZSBgZHJhZ2dpbmdgIGZsYWcgb24gdGhlIHBvaW50ZXIgaWYgd2UgaGF2ZSBhdHRhY2g6dHJ1ZVxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzIwNlxuICAgICAgICB0aGlzLnBvaW50ZXIuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRoaXMucG9pbnRlci5jdXJzb3IgPSBudWxsO1xuICAgICAgdGhpcy5wb2ludGVyLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuZHJhZ0xpc3RlbmVyICk7XG4gICAgfVxuICAgIHRoaXMuaXNEcmFnZ2luZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgIC8vIEl0IHNlZW1lZCB3aXRob3V0IGRpc3Bvc2luZyB0aGVzZSBsZWQgdG8gYSBtZW1vcnkgbGVhayBpbiBFbmVyZ3kgU2thdGUgUGFyazogQmFzaWNzXG4gICAgdGhpcy5kcmFnRW5kQWN0aW9uLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmRyYWdBY3Rpb24uZGlzcG9zZSgpO1xuICAgIHRoaXMuZHJhZ1N0YXJ0QWN0aW9uLmRpc3Bvc2UoKTtcblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGlucHV0IGxpc3RlbmVyIHRoYXQgZm9yd2FyZHMgZXZlbnRzIHRvIHRoZSBzcGVjaWZpZWQgaW5wdXQgbGlzdGVuZXJcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzYzOVxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKFNjZW5lcnlFdmVudCl9IGRvd24gLSBkb3duIGZ1bmN0aW9uIHRvIGJlIGFkZGVkIHRvIHRoZSBpbnB1dCBsaXN0ZW5lclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IGEgc2NlbmVyeSBpbnB1dCBsaXN0ZW5lclxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lciggZG93biwgb3B0aW9ucyApIHtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgYWxsb3dUb3VjaFNuYWc6IGZhbHNlXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRvd246IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCAhZXZlbnQucG9pbnRlci5kcmFnZ2luZyAmJiBldmVudC5jYW5TdGFydFByZXNzKCkgKSB7XG4gICAgICAgICAgZG93biggZXZlbnQgKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRvdWNoZW50ZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgb3B0aW9ucy5hbGxvd1RvdWNoU25hZyAmJiB0aGlzLmRvd24oIGV2ZW50ICk7XG4gICAgICB9LFxuICAgICAgdG91Y2htb3ZlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIG9wdGlvbnMuYWxsb3dUb3VjaFNuYWcgJiYgdGhpcy5kb3duKCBldmVudCApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1NpbXBsZURyYWdIYW5kbGVyJywgU2ltcGxlRHJhZ0hhbmRsZXIgKTtcblxuZXhwb3J0IGRlZmF1bHQgU2ltcGxlRHJhZ0hhbmRsZXI7Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIlZlY3RvcjIiLCJkZXByZWNhdGlvbldhcm5pbmciLCJtZXJnZSIsIkV2ZW50VHlwZSIsIlBoZXRpb0FjdGlvbiIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIk1vdXNlIiwic2NlbmVyeSIsIlNjZW5lcnlFdmVudCIsIlNpbXBsZURyYWdIYW5kbGVyIiwiZHJhZ2dpbmciLCJpc0RyYWdnaW5nUHJvcGVydHkiLCJnZXQiLCJkIiwiYXNzZXJ0Iiwic3RhcnREcmFnIiwiZXZlbnQiLCJkcmFnU3RhcnRBY3Rpb24iLCJleGVjdXRlIiwicG9pbnRlciIsInBvaW50IiwiZW5kRHJhZyIsImRyYWdFbmRBY3Rpb24iLCJaRVJPIiwiaW50ZXJydXB0Iiwic2NlbmVyeUxvZyIsIklucHV0TGlzdGVuZXIiLCJwdXNoIiwiaW50ZXJydXB0ZWQiLCJpc1RvdWNoTGlrZSIsImxhc3RJbnRlcnJ1cHRlZFRvdWNoTGlrZVBvaW50ZXIiLCJjdXJyZW50VGFyZ2V0Iiwibm9kZSIsInBvcCIsInRyeVRvU25hZyIsImRvbUV2ZW50Iiwib3B0aW9ucyIsIm1vdXNlQnV0dG9uIiwiYnV0dG9uIiwiaXNEaXNwb3NlZCIsIl9hdHRhY2giLCJjYW5TdGFydFByZXNzIiwidHJ5VG91Y2hUb1NuYWciLCJhbGxvd1RvdWNoU25hZyIsImRvd24iLCJ0b3VjaGVudGVyIiwidG91Y2htb3ZlIiwiZGlzcG9zZSIsImN1cnNvciIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJkcmFnTGlzdGVuZXIiLCJkcmFnQWN0aW9uIiwiY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyIiwiY29uc3RydWN0b3IiLCJzdGFydCIsImRyYWciLCJlbmQiLCJ0cmFuc2xhdGUiLCJkcmFnQ3Vyc29yIiwiYXR0YWNoIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJwaGV0aW9SZWFkT25seSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ0cmFpbCIsInRyYW5zZm9ybSIsImxhc3REcmFnUG9pbnQiLCJzdGFydFRyYW5zZm9ybU1hdHJpeCIsInVuZGVmaW5lZCIsImFkZElucHV0TGlzdGVuZXIiLCJyZXNlcnZlRm9yRHJhZyIsInNldCIsInN1YnRyYWlsVG8iLCJnZXRUcmFuc2Zvcm0iLCJnZXRNYXRyaXgiLCJjb3B5IiwiY2FsbCIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsIlZlY3RvcjJJTyIsInBoZXRpb1ByaXZhdGUiLCJ2YWx1ZVR5cGUiLCJnbG9iYWxEZWx0YSIsIm1pbnVzIiwibWFnbml0dWRlU3F1YXJlZCIsImRlbHRhIiwiaW52ZXJzZURlbHRhMiIsInRvU3RyaW5nIiwidHJhbnNsYXRpb24iLCJnZXRUcmFuc2xhdGlvbiIsIm9sZFBvc2l0aW9uIiwicG9zaXRpb24iLCJwbHVzIiwic2F2ZUN1cnJlbnRUYXJnZXQiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJ0cmFuc2Zvcm1MaXN0ZW5lciIsImFyZ3MiLCJpc0V4dGVuc2lvbk9mIiwibmV3TWF0cml4Iiwib2xkTWF0cml4IiwicHJlcGVuZE1hdHJpeCIsImludmVydGVkIiwidGltZXNNYXRyaXgiLCJzZXRNYXRyaXgiLCJ1cCIsImNhbmNlbCIsIm1vdmUiLCJpbml0aWFsaXplUGhldGlvT2JqZWN0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EscUJBQXFCLHNDQUFzQztBQUNsRSxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyx3QkFBd0IsOENBQThDO0FBQzdFLE9BQU9DLFdBQVcsaUNBQWlDO0FBQ25ELE9BQU9DLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLGtCQUFrQixxQ0FBcUM7QUFDOUQsT0FBT0Msa0JBQWtCLHFDQUFxQztBQUM5RCxPQUFPQyxZQUFZLCtCQUErQjtBQUNsRCxTQUFTQyxLQUFLLEVBQUVDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLGdCQUFnQjtBQUU3RDs7Q0FFQyxHQUNELElBQUEsQUFBTUMsb0JBQU4sTUFBTUEsMEJBQTBCTDtJQTJUOUIsV0FBVztJQUNYLElBQUlNLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNDLEdBQUc7SUFDcEM7SUFFQSxJQUFJRixTQUFVRyxDQUFDLEVBQUc7UUFDaEJDLFVBQVVBLE9BQVEsT0FBTztJQUMzQjtJQUVBOzs7O0dBSUMsR0FDREMsVUFBV0MsS0FBSyxFQUFHO1FBQ2pCLElBQUksQ0FBQ0MsZUFBZSxDQUFDQyxPQUFPLENBQUVGLE1BQU1HLE9BQU8sQ0FBQ0MsS0FBSyxFQUFFSjtJQUNyRDtJQUVBOzs7O0dBSUMsR0FDREssUUFBU0wsS0FBSyxFQUFHO1FBRWYsK0ZBQStGO1FBQy9GLDREQUE0RDtRQUM1RCxJQUFJLENBQUNNLGFBQWEsQ0FBQ0osT0FBTyxDQUFFRixRQUFRQSxNQUFNRyxPQUFP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