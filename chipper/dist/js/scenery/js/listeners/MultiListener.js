// Copyright 2017-2024, University of Colorado Boulder
/**
 * MultiListener is responsible for monitoring the mouse, touch, and other presses on the screen and determines the
 * operations to apply to a target Node from this input. Single touch dragging on the screen will initiate
 * panning. Multi-touch gestures will initiate scaling, translation, and potentially rotation depending on
 * the gesture.
 *
 * MultiListener will keep track of all "background" presses on the screen. When certain conditions are met, the
 * "background" presses become active and attached listeners may be interrupted so that the MultiListener
 * gestures take precedence. MultiListener uses the Intent feature of Pointer, so that the default behavior of this
 * listener can be prevented if necessary. Generally, you would use Pointer.reserveForDrag() to indicate
 * that your Node is intended for other input that should not be interrupted by this listener.
 *
 * For example usage, see scenery/examples/input.html. A typical "simple" MultiListener usage
 * would be something like:
 *
 *    display.addInputListener( new PressListener( targetNode ) );
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Jesse Greenberg
 */ import Property from '../../../axon/js/Property.js';
import Matrix from '../../../dot/js/Matrix.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import SingularValueDecomposition from '../../../dot/js/SingularValueDecomposition.js';
import Vector2 from '../../../dot/js/Vector2.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import optionize from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { Intent, Mouse, MultiListenerPress, scenery } from '../imports.js';
// constants
// pointer must move this much to initiate a move interruption for panning, in the global coordinate frame
const MOVE_INTERRUPT_MAGNITUDE = 25;
let MultiListener = class MultiListener {
    /**
   * Finds a Press by searching for the one with the provided Pointer.
   */ findPress(pointer) {
        for(let i = 0; i < this._presses.length; i++){
            if (this._presses[i].pointer === pointer) {
                return this._presses[i];
            }
        }
        return null;
    }
    /**
   * Find a background Press by searching for one with the provided Pointer. A background Press is one created
   * when we receive an event while a Pointer is already attached.
   */ findBackgroundPress(pointer) {
        for(let i = 0; i < this._backgroundPresses.length; i++){
            if (this._backgroundPresses[i].pointer === pointer) {
                return this._backgroundPresses[i];
            }
        }
        return null;
    }
    /**
   * Returns true if the press is already contained in one of this._backgroundPresses or this._presses. There are cases
   * where we may try to add the same pointer twice (user opened context menu, using a mouse during fuzz testing), and
   * we want to avoid adding a press again in those cases.
   */ hasPress(press) {
        return _.some(this._presses.concat(this._backgroundPresses), (existingPress)=>{
            return existingPress.pointer === press.pointer;
        });
    }
    /**
   * Interrupt all listeners on the pointer, except for background listeners that
   * were added by this MultiListener. Useful when it is time for this listener to
   * "take over" and interrupt any other listeners on the pointer.
   */ interruptOtherListeners(pointer) {
        const listeners = pointer.getListeners();
        for(let i = 0; i < listeners.length; i++){
            const listener = listeners[i];
            if (listener !== this._backgroundListener) {
                listener.interrupt && listener.interrupt();
            }
        }
    }
    /**
   * Part of the scenery event API. (scenery-internal)
   */ down(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener down');
        if (event.pointer instanceof Mouse && event.domEvent instanceof MouseEvent && event.domEvent.button !== this._mouseButton) {
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener abort: wrong mouse button');
            return;
        }
        // clears the flag for MultiListener behavior
        this._interrupted = false;
        let pressTrail;
        if (!_.includes(event.trail.nodes, this._targetNode)) {
            // if the target Node is not in the event trail, we assume that the event went to the
            // Display or the root Node of the scene graph - this will throw an assertion if
            // there are more than one trails found
            pressTrail = this._targetNode.getUniqueTrailTo(event.target);
        } else {
            pressTrail = event.trail.subtrailTo(this._targetNode, false);
        }
        assert && assert(_.includes(pressTrail.nodes, this._targetNode), 'targetNode must be in the Trail for Press');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        const press = new MultiListenerPress(event.pointer, pressTrail);
        if (!this._allowMoveInterruption && !this._allowMultitouchInterruption) {
            // most restrictive case, only allow presses if the pointer is not attached - Presses
            // are never added as background presses in this case because interruption is never allowed
            if (!event.pointer.isAttached()) {
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener unattached, using press');
                this.addPress(press);
            }
        } else {
            // we allow some form of interruption, add as background presses, and we will decide if they
            // should be converted to presses and interrupt other listeners on move event
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener attached, adding background press');
            this.addBackgroundPress(press);
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Add a Press to this listener when a new Pointer is down.
   */ addPress(press) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener addPress');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        if (!this.hasPress(press)) {
            this._presses.push(press);
            press.pointer.cursor = this._pressCursor;
            press.pointer.addInputListener(this._pressListener, true);
            this.recomputeLocals();
            this.reposition();
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Reposition in response to movement of any Presses.
   */ movePress(press) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener movePress');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.reposition();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Remove a Press from this listener.
   */ removePress(press) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener removePress');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        press.pointer.removeInputListener(this._pressListener);
        press.pointer.cursor = null;
        arrayRemove(this._presses, press);
        this.recomputeLocals();
        this.reposition();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Add a background Press, a Press that we receive while a Pointer is already attached. Depending on background
   * Presses, we may interrupt the attached pointer to begin zoom operations.
   */ addBackgroundPress(press) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener addBackgroundPress');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // It's possible that the press pointer already has the listener - for instance in Chrome we fail to get
        // "up" events once the context menu is open (like after a right click), so only add to the Pointer
        // if it isn't already added
        if (!this.hasPress(press)) {
            this._backgroundPresses.push(press);
            press.pointer.addInputListener(this._backgroundListener, false);
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Remove a background Press from this listener.
   */ removeBackgroundPress(press) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener removeBackgroundPress');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        press.pointer.removeInputListener(this._backgroundListener);
        arrayRemove(this._backgroundPresses, press);
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Reposition the target Node (including all apsects of transformation) of this listener's target Node.
   */ reposition() {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener reposition');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.matrixProperty.set(this.computeMatrix());
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Recompute the local points of the Presses for this listener, relative to the target Node.
   */ recomputeLocals() {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener recomputeLocals');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        for(let i = 0; i < this._presses.length; i++){
            this._presses[i].recomputeLocalPoint();
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Interrupt this listener.
   */ interrupt() {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener interrupt');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        while(this._presses.length){
            this.removePress(this._presses[this._presses.length - 1]);
        }
        while(this._backgroundPresses.length){
            this.removeBackgroundPress(this._backgroundPresses[this._backgroundPresses.length - 1]);
        }
        this._interrupted = true;
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Compute the transformation matrix for the target Node based on Presses.
   */ computeMatrix() {
        if (this._presses.length === 0) {
            return this._targetNode.getMatrix();
        } else if (this._presses.length === 1) {
            return this.computeSinglePressMatrix();
        } else if (this._allowScale && this._allowRotation) {
            return this.computeTranslationRotationScaleMatrix();
        } else if (this._allowScale) {
            return this.computeTranslationScaleMatrix();
        } else if (this._allowRotation) {
            return this.computeTranslationRotationMatrix();
        } else {
            return this.computeTranslationMatrix();
        }
    }
    /**
   * Compute a transformation matrix from a single press. Single press indicates translation (panning) for the
   * target Node.
   */ computeSinglePressMatrix() {
        const singleTargetPoint = this._presses[0].targetPoint;
        const localPoint = this._presses[0].localPoint;
        assert && assert(localPoint, 'localPoint is not defined on the Press?');
        const singleMappedPoint = this._targetNode.localToParentPoint(localPoint);
        const delta = singleTargetPoint.minus(singleMappedPoint);
        return Matrix3.translationFromVector(delta).timesMatrix(this._targetNode.getMatrix());
    }
    /**
   * Compute a translation matrix from multiple presses. Usually multiple presses will have some scale or rotation
   * as well, but this is to be used if rotation and scale are not enabled for this listener.
   */ computeTranslationMatrix() {
        // translation only. linear least-squares simplifies to sum of differences
        const sum = new Vector2(0, 0);
        for(let i = 0; i < this._presses.length; i++){
            sum.add(this._presses[i].targetPoint);
            const localPoint = this._presses[i].localPoint;
            assert && assert(localPoint, 'localPoint is not defined on the Press?');
            sum.subtract(localPoint);
        }
        return Matrix3.translationFromVector(sum.dividedScalar(this._presses.length));
    }
    /**
   * A transformation matrix from multiple Presses that will translate and scale the target Node.
   */ computeTranslationScaleMatrix() {
        const localPoints = this._presses.map((press)=>{
            assert && assert(press.localPoint, 'localPoint is not defined on the Press?');
            return press.localPoint;
        });
        const targetPoints = this._presses.map((press)=>press.targetPoint);
        const localCentroid = new Vector2(0, 0);
        const targetCentroid = new Vector2(0, 0);
        localPoints.forEach((localPoint)=>{
            localCentroid.add(localPoint);
        });
        targetPoints.forEach((targetPoint)=>{
            targetCentroid.add(targetPoint);
        });
        localCentroid.divideScalar(this._presses.length);
        targetCentroid.divideScalar(this._presses.length);
        let localSquaredDistance = 0;
        let targetSquaredDistance = 0;
        localPoints.forEach((localPoint)=>{
            localSquaredDistance += localPoint.distanceSquared(localCentroid);
        });
        targetPoints.forEach((targetPoint)=>{
            targetSquaredDistance += targetPoint.distanceSquared(targetCentroid);
        });
        // while fuzz testing, it is possible that the Press points are
        // exactly the same resulting in undefined scale - if that is the case
        // we will not adjust
        let scale = this.getCurrentScale();
        if (targetSquaredDistance !== 0) {
            scale = this.limitScale(Math.sqrt(targetSquaredDistance / localSquaredDistance));
        }
        const translateToTarget = Matrix3.translation(targetCentroid.x, targetCentroid.y);
        const translateFromLocal = Matrix3.translation(-localCentroid.x, -localCentroid.y);
        return translateToTarget.timesMatrix(Matrix3.scaling(scale)).timesMatrix(translateFromLocal);
    }
    /**
   * Limit the provided scale by constraints of this MultiListener.
   */ limitScale(scale) {
        let correctedScale = Math.max(scale, this._minScale);
        correctedScale = Math.min(correctedScale, this._maxScale);
        return correctedScale;
    }
    /**
   * Compute a transformation matrix that will translate and scale the target Node from multiple presses. Should
   * be used when scaling is not enabled for this listener.
   */ computeTranslationRotationMatrix() {
        let i;
        const localMatrix = new Matrix(2, this._presses.length);
        const targetMatrix = new Matrix(2, this._presses.length);
        const localCentroid = new Vector2(0, 0);
        const targetCentroid = new Vector2(0, 0);
        for(i = 0; i < this._presses.length; i++){
            const localPoint = this._presses[i].localPoint;
            const targetPoint = this._presses[i].targetPoint;
            localCentroid.add(localPoint);
            targetCentroid.add(targetPoint);
            localMatrix.set(0, i, localPoint.x);
            localMatrix.set(1, i, localPoint.y);
            targetMatrix.set(0, i, targetPoint.x);
            targetMatrix.set(1, i, targetPoint.y);
        }
        localCentroid.divideScalar(this._presses.length);
        targetCentroid.divideScalar(this._presses.length);
        // determine offsets from the centroids
        for(i = 0; i < this._presses.length; i++){
            localMatrix.set(0, i, localMatrix.get(0, i) - localCentroid.x);
            localMatrix.set(1, i, localMatrix.get(1, i) - localCentroid.y);
            targetMatrix.set(0, i, targetMatrix.get(0, i) - targetCentroid.x);
            targetMatrix.set(1, i, targetMatrix.get(1, i) - targetCentroid.y);
        }
        const covarianceMatrix = localMatrix.times(targetMatrix.transpose());
        const svd = new SingularValueDecomposition(covarianceMatrix);
        let rotation = svd.getV().times(svd.getU().transpose());
        if (rotation.det() < 0) {
            rotation = svd.getV().times(Matrix.diagonalMatrix([
                1,
                -1
            ])).times(svd.getU().transpose());
        }
        const rotation3 = new Matrix3().rowMajor(rotation.get(0, 0), rotation.get(0, 1), 0, rotation.get(1, 0), rotation.get(1, 1), 0, 0, 0, 1);
        const translation = targetCentroid.minus(rotation3.timesVector2(localCentroid));
        rotation3.set02(translation.x);
        rotation3.set12(translation.y);
        return rotation3;
    }
    /**
   * Compute a transformation matrix that will translate, scale, and rotate the target Node from multiple Presses.
   */ computeTranslationRotationScaleMatrix() {
        let i;
        const localMatrix = new Matrix(this._presses.length * 2, 4);
        for(i = 0; i < this._presses.length; i++){
            // [ x  y 1 0 ]
            // [ y -x 0 1 ]
            const localPoint = this._presses[i].localPoint;
            localMatrix.set(2 * i + 0, 0, localPoint.x);
            localMatrix.set(2 * i + 0, 1, localPoint.y);
            localMatrix.set(2 * i + 0, 2, 1);
            localMatrix.set(2 * i + 1, 0, localPoint.y);
            localMatrix.set(2 * i + 1, 1, -localPoint.x);
            localMatrix.set(2 * i + 1, 3, 1);
        }
        const targetMatrix = new Matrix(this._presses.length * 2, 1);
        for(i = 0; i < this._presses.length; i++){
            const targetPoint = this._presses[i].targetPoint;
            targetMatrix.set(2 * i + 0, 0, targetPoint.x);
            targetMatrix.set(2 * i + 1, 0, targetPoint.y);
        }
        const coefficientMatrix = SingularValueDecomposition.pseudoinverse(localMatrix).times(targetMatrix);
        const m11 = coefficientMatrix.get(0, 0);
        const m12 = coefficientMatrix.get(1, 0);
        const m13 = coefficientMatrix.get(2, 0);
        const m23 = coefficientMatrix.get(3, 0);
        return new Matrix3().rowMajor(m11, m12, m13, -m12, m11, m23, 0, 0, 1);
    }
    /**
   * Get the current scale on the target Node, assumes that there is isometric scaling in both x and y.
   */ getCurrentScale() {
        return this._targetNode.getScaleVector().x;
    }
    /**
   * Reset transform on the target Node.
   */ resetTransform() {
        this._targetNode.resetTransform();
        this.matrixProperty.set(this._targetNode.matrix.copy());
    }
    /**
   * @constructor
   *
   * @param targetNode - The Node that should be transformed by this MultiListener.
   * @param [providedOptions]
   */ constructor(targetNode, providedOptions){
        const options = optionize()({
            mouseButton: 0,
            pressCursor: 'pointer',
            allowScale: true,
            allowRotation: true,
            allowMultitouchInterruption: false,
            allowMoveInterruption: true,
            minScale: 1,
            maxScale: 4,
            tandem: Tandem.REQUIRED
        }, providedOptions);
        this._targetNode = targetNode;
        this._minScale = options.minScale;
        this._maxScale = options.maxScale;
        this._mouseButton = options.mouseButton;
        this._pressCursor = options.pressCursor;
        this._allowScale = options.allowScale;
        this._allowRotation = options.allowRotation;
        this._allowMultitouchInterruption = options.allowMultitouchInterruption;
        this._allowMoveInterruption = options.allowMoveInterruption;
        this._presses = [];
        this._backgroundPresses = [];
        this.matrixProperty = new Property(targetNode.matrix.copy(), {
            phetioValueType: Matrix3.Matrix3IO,
            tandem: options.tandem.createTandem('matrixProperty'),
            phetioReadOnly: true
        });
        // assign the matrix to the targetNode whenever it changes
        this.matrixProperty.link((matrix)=>{
            this._targetNode.matrix = matrix;
        });
        this._interrupted = false;
        this._pressListener = {
            move: (event)=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener pointer move');
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                const press = this.findPress(event.pointer);
                assert && assert(press, 'Press should be found for move event');
                this.movePress(press);
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            },
            up: (event)=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener pointer up');
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                const press = this.findPress(event.pointer);
                assert && assert(press, 'Press should be found for up event');
                this.removePress(press);
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            },
            cancel: (event)=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener pointer cancel');
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                const press = this.findPress(event.pointer);
                assert && assert(press, 'Press should be found for cancel event');
                press.interrupted = true;
                this.removePress(press);
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            },
            interrupt: ()=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener pointer interrupt');
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                // For the future, we could figure out how to track the pointer that calls this
                this.interrupt();
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            }
        };
        this._backgroundListener = {
            up: (event)=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener background up');
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                if (!this._interrupted) {
                    const backgroundPress = this.findBackgroundPress(event.pointer);
                    assert && assert(backgroundPress, 'Background press should be found for up event');
                    this.removeBackgroundPress(backgroundPress);
                }
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            },
            move: (event)=>{
                // Any background press needs to meet certain conditions to be promoted to an actual press that pans/zooms
                const candidateBackgroundPresses = this._backgroundPresses.filter((press)=>{
                    // Dragged pointers and pointers that haven't moved a certain distance are not candidates, and should not be
                    // interrupted. We don't want to interrupt taps that might move a little bit
                    return !press.pointer.hasIntent(Intent.DRAG) && press.initialPoint.distance(press.pointer.point) > MOVE_INTERRUPT_MAGNITUDE;
                });
                // If we are already zoomed in, we should promote any number of background presses to actual presses.
                // Otherwise, we'll need at least two presses to zoom
                // It is nice to allow down pointers to move around freely without interruption when there isn't any zoom,
                // but we still allow interruption if the number of background presses indicate the user is trying to
                // zoom in
                if (this.getCurrentScale() !== 1 || candidateBackgroundPresses.length >= 2) {
                    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener attached, interrupting for press');
                    // Convert all candidate background presses to actual presses
                    candidateBackgroundPresses.forEach((press)=>{
                        this.removeBackgroundPress(press);
                        this.interruptOtherListeners(press.pointer);
                        this.addPress(press);
                    });
                }
            },
            cancel: (event)=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener background cancel');
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                if (!this._interrupted) {
                    const backgroundPress = this.findBackgroundPress(event.pointer);
                    assert && assert(backgroundPress, 'Background press should be found for cancel event');
                    this.removeBackgroundPress(backgroundPress);
                }
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            },
            interrupt: ()=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener background interrupt');
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                this.interrupt();
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            }
        };
    }
};
scenery.register('MultiListener', MultiListener);
export default MultiListener;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL011bHRpTGlzdGVuZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTXVsdGlMaXN0ZW5lciBpcyByZXNwb25zaWJsZSBmb3IgbW9uaXRvcmluZyB0aGUgbW91c2UsIHRvdWNoLCBhbmQgb3RoZXIgcHJlc3NlcyBvbiB0aGUgc2NyZWVuIGFuZCBkZXRlcm1pbmVzIHRoZVxuICogb3BlcmF0aW9ucyB0byBhcHBseSB0byBhIHRhcmdldCBOb2RlIGZyb20gdGhpcyBpbnB1dC4gU2luZ2xlIHRvdWNoIGRyYWdnaW5nIG9uIHRoZSBzY3JlZW4gd2lsbCBpbml0aWF0ZVxuICogcGFubmluZy4gTXVsdGktdG91Y2ggZ2VzdHVyZXMgd2lsbCBpbml0aWF0ZSBzY2FsaW5nLCB0cmFuc2xhdGlvbiwgYW5kIHBvdGVudGlhbGx5IHJvdGF0aW9uIGRlcGVuZGluZyBvblxuICogdGhlIGdlc3R1cmUuXG4gKlxuICogTXVsdGlMaXN0ZW5lciB3aWxsIGtlZXAgdHJhY2sgb2YgYWxsIFwiYmFja2dyb3VuZFwiIHByZXNzZXMgb24gdGhlIHNjcmVlbi4gV2hlbiBjZXJ0YWluIGNvbmRpdGlvbnMgYXJlIG1ldCwgdGhlXG4gKiBcImJhY2tncm91bmRcIiBwcmVzc2VzIGJlY29tZSBhY3RpdmUgYW5kIGF0dGFjaGVkIGxpc3RlbmVycyBtYXkgYmUgaW50ZXJydXB0ZWQgc28gdGhhdCB0aGUgTXVsdGlMaXN0ZW5lclxuICogZ2VzdHVyZXMgdGFrZSBwcmVjZWRlbmNlLiBNdWx0aUxpc3RlbmVyIHVzZXMgdGhlIEludGVudCBmZWF0dXJlIG9mIFBvaW50ZXIsIHNvIHRoYXQgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgdGhpc1xuICogbGlzdGVuZXIgY2FuIGJlIHByZXZlbnRlZCBpZiBuZWNlc3NhcnkuIEdlbmVyYWxseSwgeW91IHdvdWxkIHVzZSBQb2ludGVyLnJlc2VydmVGb3JEcmFnKCkgdG8gaW5kaWNhdGVcbiAqIHRoYXQgeW91ciBOb2RlIGlzIGludGVuZGVkIGZvciBvdGhlciBpbnB1dCB0aGF0IHNob3VsZCBub3QgYmUgaW50ZXJydXB0ZWQgYnkgdGhpcyBsaXN0ZW5lci5cbiAqXG4gKiBGb3IgZXhhbXBsZSB1c2FnZSwgc2VlIHNjZW5lcnkvZXhhbXBsZXMvaW5wdXQuaHRtbC4gQSB0eXBpY2FsIFwic2ltcGxlXCIgTXVsdGlMaXN0ZW5lciB1c2FnZVxuICogd291bGQgYmUgc29tZXRoaW5nIGxpa2U6XG4gKlxuICogICAgZGlzcGxheS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgUHJlc3NMaXN0ZW5lciggdGFyZ2V0Tm9kZSApICk7XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTWF0cml4IGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXguanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IFNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9TaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbi5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHsgSW50ZW50LCBNb3VzZSwgTXVsdGlMaXN0ZW5lclByZXNzLCBOb2RlLCBQb2ludGVyLCBzY2VuZXJ5LCBTY2VuZXJ5RXZlbnQsIFRJbnB1dExpc3RlbmVyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuLy8gcG9pbnRlciBtdXN0IG1vdmUgdGhpcyBtdWNoIHRvIGluaXRpYXRlIGEgbW92ZSBpbnRlcnJ1cHRpb24gZm9yIHBhbm5pbmcsIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZVxuY29uc3QgTU9WRV9JTlRFUlJVUFRfTUFHTklUVURFID0gMjU7XG5cbmV4cG9ydCB0eXBlIE11bHRpTGlzdGVuZXJPcHRpb25zID0ge1xuXG4gIC8vIHtudW1iZXJ9IC0gUmVzdHJpY3RzIGlucHV0IHRvIHRoZSBzcGVjaWZpZWQgbW91c2UgYnV0dG9uIChidXQgYWxsb3dzIGFueSB0b3VjaCkuIE9ubHkgb25lIG1vdXNlIGJ1dHRvbiBpc1xuICAvLyBhbGxvd2VkIGF0IGEgdGltZS4gVGhlIGJ1dHRvbiBudW1iZXJzIGFyZSBkZWZpbmVkIGluIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Nb3VzZUV2ZW50L2J1dHRvbixcbiAgLy8gd2hlcmUgdHlwaWNhbGx5OlxuICAvLyAgIDA6IExlZnQgbW91c2UgYnV0dG9uXG4gIC8vICAgMTogTWlkZGxlIG1vdXNlIGJ1dHRvbiAob3Igd2hlZWwgcHJlc3MpXG4gIC8vICAgMjogUmlnaHQgbW91c2UgYnV0dG9uXG4gIC8vICAgMys6IG90aGVyIHNwZWNpZmljIG51bWJlcmVkIGJ1dHRvbnMgdGhhdCBhcmUgbW9yZSByYXJlXG4gIG1vdXNlQnV0dG9uPzogbnVtYmVyO1xuXG4gIC8vIHtzdHJpbmd9IC0gU2V0cyB0aGUgUG9pbnRlciBjdXJzb3IgdG8gdGhpcyBjdXJzb3Igd2hlbiB0aGUgbGlzdGVuZXIgaXMgXCJwcmVzc2VkXCIuXG4gIHByZXNzQ3Vyc29yPzogc3RyaW5nO1xuXG4gIC8vIHtib29sZWFufSAtIElmIHRydWUsIHRoZSBsaXN0ZW5lciB3aWxsIHNjYWxlIHRoZSB0YXJnZXROb2RlIGZyb20gaW5wdXRcbiAgYWxsb3dTY2FsZT86IGJvb2xlYW47XG5cbiAgLy8ge2Jvb2xlYW59IC0gSWYgdHJ1ZSwgdGhlIGxpc3RlbmVyIHdpbGwgcm90YXRlIHRoZSB0YXJnZXROb2RlIGZyb20gaW5wdXRcbiAgYWxsb3dSb3RhdGlvbj86IGJvb2xlYW47XG5cbiAgLy8ge2Jvb2xlYW59IC0gaWYgdHJ1ZSwgbXVsdGl0b3VjaCB3aWxsIGludGVycnVwdCBhbnkgYWN0aXZlIHBvaW50ZXIgbGlzdGVuZXJzIGFuZCBpbml0aWF0ZSB0cmFuc2xhdGlvblxuICAvLyBhbmQgc2NhbGUgZnJvbSBtdWx0aXRvdWNoIGdlc3R1cmVzXG4gIGFsbG93TXVsdGl0b3VjaEludGVycnVwdGlvbj86IGJvb2xlYW47XG5cbiAgLy8gaWYgdHJ1ZSwgYSBjZXJ0YWluIGFtb3VudCBvZiBtb3ZlbWVudCBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgd2lsbCBpbnRlcnJ1cHQgYW55IHBvaW50ZXIgbGlzdGVuZXJzIGFuZFxuICAvLyBpbml0aWF0ZSB0cmFuc2xhdGlvbiBmcm9tIHRoZSBwb2ludGVyLCB1bmxlc3MgZGVmYXVsdCBiZWhhdmlvciBoYXMgYmVlbiBwcmV2ZW50ZWQgYnkgc2V0dGluZyBJbnRlbnQgb24gdGhlIFBvaW50ZXIuXG4gIGFsbG93TW92ZUludGVycnVwdGlvbj86IGJvb2xlYW47XG5cbiAgLy8gbWFnbml0dWRlIGxpbWl0cyBmb3Igc2NhbGluZyBpbiBib3RoIHggYW5kIHlcbiAgbWluU2NhbGU/OiBudW1iZXI7XG4gIG1heFNjYWxlPzogbnVtYmVyO1xufSAmIFBpY2s8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbSc+O1xuXG5jbGFzcyBNdWx0aUxpc3RlbmVyIGltcGxlbWVudHMgVElucHV0TGlzdGVuZXIge1xuXG4gIC8vIHRoZSBOb2RlIHRoYXQgd2lsbCBiZSB0cmFuc2Zvcm1lZCBieSB0aGlzIGxpc3RlbmVyXG4gIHByb3RlY3RlZCByZWFkb25seSBfdGFyZ2V0Tm9kZTogTm9kZTtcblxuICAvLyBzZWUgb3B0aW9uc1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX21pblNjYWxlOiBudW1iZXI7XG4gIHByb3RlY3RlZCByZWFkb25seSBfbWF4U2NhbGU6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBfbW91c2VCdXR0b246IG51bWJlcjtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF9wcmVzc0N1cnNvcjogc3RyaW5nO1xuICBwcml2YXRlIHJlYWRvbmx5IF9hbGxvd1NjYWxlOiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IF9hbGxvd1JvdGF0aW9uOiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IF9hbGxvd011bHRpdG91Y2hJbnRlcnJ1cHRpb246IGJvb2xlYW47XG4gIHByaXZhdGUgcmVhZG9ubHkgX2FsbG93TW92ZUludGVycnVwdGlvbjogYm9vbGVhbjtcblxuICAvLyBMaXN0IG9mIFwiYWN0aXZlXCIgUHJlc3NlcyBkb3duIGZyb20gUG9pbnRlciBpbnB1dCB3aGljaCBhcmUgYWN0aXZlbHkgY2hhbmdpbmcgdGhlIHRyYW5zZm9ybWF0aW9uIG9mIHRoZSB0YXJnZXQgTm9kZVxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3ByZXNzZXM6IE11bHRpTGlzdGVuZXJQcmVzc1tdO1xuXG4gIC8vIExpc3Qgb2YgXCJiYWNrZ3JvdW5kXCIgcHJlc3NlcyB3aGljaCBhcmUgc2F2ZWQgYnV0IG5vdCB5ZXQgZG9pbmcgYW55dGhpbmcgZm9yIHRoZSB0YXJnZXQgTm9kZSB0cmFuc2Zvcm1hdGlvbi4gSWZcbiAgLy8gdGhlIFBvaW50ZXIgYWxyZWFkeSBoYXMgbGlzdGVuZXJzLCBQcmVzc2VzIGFyZSBhZGRlZCB0byB0aGUgYmFja2dyb3VuZCBhbmQgd2FpdCB0byBiZSBjb252ZXJ0ZWQgdG8gXCJhY3RpdmVcIlxuICAvLyBwcmVzc2VzIHVudGlsIHdlIGFyZSBhbGxvd2VkIHRvIGludGVycnVwdCB0aGUgb3RoZXIgbGlzdGVuZXJzLiBSZWxhdGVkIHRvIG9wdGlvbnMgXCJhbGxvd01vdmVJbnRlcnJ1cHRcIiBhbmRcbiAgLy8gXCJhbGxvd011bHRpdG91Y2hJbnRlcnJ1cHRcIiwgd2hlcmUgb3RoZXIgUG9pbnRlciBsaXN0ZW5lcnMgYXJlIGludGVycnVwdGVkIGluIHRoZXNlIGNhc2VzLlxuICBwcml2YXRlIHJlYWRvbmx5IF9iYWNrZ3JvdW5kUHJlc3NlczogTXVsdGlMaXN0ZW5lclByZXNzW107XG5cbiAgLy8ge1Byb3BlcnR5LjxNYXRyaXgzPn0gLSBUaGUgbWF0cml4IGFwcGxpZWQgdG8gdGhlIHRhcmdldE5vZGUgaW4gcmVzcG9uc2UgdG8gdmFyaW91cyBpbnB1dCBmb3IgdGhlIE11bHRpTGlzdGVuZXJcbiAgcHVibGljIHJlYWRvbmx5IG1hdHJpeFByb3BlcnR5OiBQcm9wZXJ0eTxNYXRyaXgzPjtcblxuICAvLyBXaGV0aGVyIHRoZSBsaXN0ZW5lciB3YXMgaW50ZXJydXB0ZWQsIGluIHdoaWNoIGNhc2Ugd2UgbWF5IG5lZWQgdG8gcHJldmVudCBjZXJ0YWluIGJlaGF2aW9yLiBJZiB0aGUgbGlzdGVuZXIgd2FzXG4gIC8vIGludGVycnVwdGVkLCBwb2ludGVyIGxpc3RlbmVycyBtaWdodCBzdGlsbCBiZSBjYWxsZWQgc2luY2UgaW5wdXQgaXMgZGlzcGF0Y2hlZCB0byBhIGRlZmVuc2l2ZSBjb3B5IG9mIHRoZVxuICAvLyBQb2ludGVyJ3MgbGlzdGVuZXJzLiBCdXQgcHJlc3NlcyB3aWxsIGhhdmUgYmVlbiBjbGVhcmVkIGluIHRoaXMgY2FzZSBzbyB3ZSB3b24ndCB0cnkgdG8gZG8gYW55IHdvcmsgb24gdGhlbS5cbiAgcHJpdmF0ZSBfaW50ZXJydXB0ZWQ6IGJvb2xlYW47XG5cbiAgLy8gYXR0YWNoZWQgdG8gdGhlIFBvaW50ZXIgd2hlbiBhIFByZXNzIGlzIGFkZGVkXG4gIHByaXZhdGUgX3ByZXNzTGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyO1xuXG4gIC8vIGF0dGFjaGVkIHRvIHRoZSBQb2ludGVyIHdoZW4gcHJlc3NlcyBhcmUgYWRkZWQgLSB3YWl0cyBmb3IgY2VydGFpbiBjb25kaXRpb25zIHRvIGJlIG1ldCBiZWZvcmUgY29udmVydGluZ1xuICAvLyBiYWNrZ3JvdW5kIHByZXNzZXMgdG8gYWN0aXZlIHByZXNzZXMgdG8gZW5hYmxlIG11bHRpdG91Y2ggbGlzdGVuZXIgYmVoYXZpb3JcbiAgcHJpdmF0ZSBfYmFja2dyb3VuZExpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lcjtcblxuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBwYXJhbSB0YXJnZXROb2RlIC0gVGhlIE5vZGUgdGhhdCBzaG91bGQgYmUgdHJhbnNmb3JtZWQgYnkgdGhpcyBNdWx0aUxpc3RlbmVyLlxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFyZ2V0Tm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogTXVsdGlMaXN0ZW5lck9wdGlvbnMgKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNdWx0aUxpc3RlbmVyT3B0aW9ucz4oKSgge1xuICAgICAgbW91c2VCdXR0b246IDAsXG4gICAgICBwcmVzc0N1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgYWxsb3dTY2FsZTogdHJ1ZSxcbiAgICAgIGFsbG93Um90YXRpb246IHRydWUsXG4gICAgICBhbGxvd011bHRpdG91Y2hJbnRlcnJ1cHRpb246IGZhbHNlLFxuICAgICAgYWxsb3dNb3ZlSW50ZXJydXB0aW9uOiB0cnVlLFxuICAgICAgbWluU2NhbGU6IDEsXG4gICAgICBtYXhTY2FsZTogNCxcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB0aGlzLl90YXJnZXROb2RlID0gdGFyZ2V0Tm9kZTtcbiAgICB0aGlzLl9taW5TY2FsZSA9IG9wdGlvbnMubWluU2NhbGU7XG4gICAgdGhpcy5fbWF4U2NhbGUgPSBvcHRpb25zLm1heFNjYWxlO1xuICAgIHRoaXMuX21vdXNlQnV0dG9uID0gb3B0aW9ucy5tb3VzZUJ1dHRvbjtcbiAgICB0aGlzLl9wcmVzc0N1cnNvciA9IG9wdGlvbnMucHJlc3NDdXJzb3I7XG4gICAgdGhpcy5fYWxsb3dTY2FsZSA9IG9wdGlvbnMuYWxsb3dTY2FsZTtcbiAgICB0aGlzLl9hbGxvd1JvdGF0aW9uID0gb3B0aW9ucy5hbGxvd1JvdGF0aW9uO1xuICAgIHRoaXMuX2FsbG93TXVsdGl0b3VjaEludGVycnVwdGlvbiA9IG9wdGlvbnMuYWxsb3dNdWx0aXRvdWNoSW50ZXJydXB0aW9uO1xuICAgIHRoaXMuX2FsbG93TW92ZUludGVycnVwdGlvbiA9IG9wdGlvbnMuYWxsb3dNb3ZlSW50ZXJydXB0aW9uO1xuICAgIHRoaXMuX3ByZXNzZXMgPSBbXTtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kUHJlc3NlcyA9IFtdO1xuXG4gICAgdGhpcy5tYXRyaXhQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdGFyZ2V0Tm9kZS5tYXRyaXguY29weSgpLCB7XG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE1hdHJpeDMuTWF0cml4M0lPLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXRyaXhQcm9wZXJ0eScgKSxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXG4gICAgfSApO1xuXG4gICAgLy8gYXNzaWduIHRoZSBtYXRyaXggdG8gdGhlIHRhcmdldE5vZGUgd2hlbmV2ZXIgaXQgY2hhbmdlc1xuICAgIHRoaXMubWF0cml4UHJvcGVydHkubGluayggbWF0cml4ID0+IHtcbiAgICAgIHRoaXMuX3RhcmdldE5vZGUubWF0cml4ID0gbWF0cml4O1xuICAgIH0gKTtcblxuICAgIHRoaXMuX2ludGVycnVwdGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLl9wcmVzc0xpc3RlbmVyID0ge1xuICAgICAgbW92ZTogZXZlbnQgPT4ge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIHBvaW50ZXIgbW92ZScgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgICAgY29uc3QgcHJlc3MgPSB0aGlzLmZpbmRQcmVzcyggZXZlbnQucG9pbnRlciApITtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcHJlc3MsICdQcmVzcyBzaG91bGQgYmUgZm91bmQgZm9yIG1vdmUgZXZlbnQnICk7XG4gICAgICAgIHRoaXMubW92ZVByZXNzKCBwcmVzcyApO1xuXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICB9LFxuXG4gICAgICB1cDogZXZlbnQgPT4ge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIHBvaW50ZXIgdXAnICk7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICAgIGNvbnN0IHByZXNzID0gdGhpcy5maW5kUHJlc3MoIGV2ZW50LnBvaW50ZXIgKSE7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByZXNzLCAnUHJlc3Mgc2hvdWxkIGJlIGZvdW5kIGZvciB1cCBldmVudCcgKTtcbiAgICAgICAgdGhpcy5yZW1vdmVQcmVzcyggcHJlc3MgKTtcblxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgICAgfSxcblxuICAgICAgY2FuY2VsOiBldmVudCA9PiB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgcG9pbnRlciBjYW5jZWwnICk7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICAgIGNvbnN0IHByZXNzID0gdGhpcy5maW5kUHJlc3MoIGV2ZW50LnBvaW50ZXIgKSE7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByZXNzLCAnUHJlc3Mgc2hvdWxkIGJlIGZvdW5kIGZvciBjYW5jZWwgZXZlbnQnICk7XG4gICAgICAgIHByZXNzLmludGVycnVwdGVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnJlbW92ZVByZXNzKCBwcmVzcyApO1xuXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICB9LFxuXG4gICAgICBpbnRlcnJ1cHQ6ICgpID0+IHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciBwb2ludGVyIGludGVycnVwdCcgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgICAgLy8gRm9yIHRoZSBmdXR1cmUsIHdlIGNvdWxkIGZpZ3VyZSBvdXQgaG93IHRvIHRyYWNrIHRoZSBwb2ludGVyIHRoYXQgY2FsbHMgdGhpc1xuICAgICAgICB0aGlzLmludGVycnVwdCgpO1xuXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuX2JhY2tncm91bmRMaXN0ZW5lciA9IHtcbiAgICAgIHVwOiBldmVudCA9PiB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgYmFja2dyb3VuZCB1cCcgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgICAgaWYgKCAhdGhpcy5faW50ZXJydXB0ZWQgKSB7XG4gICAgICAgICAgY29uc3QgYmFja2dyb3VuZFByZXNzID0gdGhpcy5maW5kQmFja2dyb3VuZFByZXNzKCBldmVudC5wb2ludGVyICkhO1xuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhY2tncm91bmRQcmVzcywgJ0JhY2tncm91bmQgcHJlc3Mgc2hvdWxkIGJlIGZvdW5kIGZvciB1cCBldmVudCcgKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUJhY2tncm91bmRQcmVzcyggYmFja2dyb3VuZFByZXNzICk7XG4gICAgICAgIH1cblxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgICAgfSxcblxuICAgICAgbW92ZTogZXZlbnQgPT4ge1xuXG4gICAgICAgIC8vIEFueSBiYWNrZ3JvdW5kIHByZXNzIG5lZWRzIHRvIG1lZXQgY2VydGFpbiBjb25kaXRpb25zIHRvIGJlIHByb21vdGVkIHRvIGFuIGFjdHVhbCBwcmVzcyB0aGF0IHBhbnMvem9vbXNcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlQmFja2dyb3VuZFByZXNzZXMgPSB0aGlzLl9iYWNrZ3JvdW5kUHJlc3Nlcy5maWx0ZXIoIHByZXNzID0+IHtcblxuICAgICAgICAgIC8vIERyYWdnZWQgcG9pbnRlcnMgYW5kIHBvaW50ZXJzIHRoYXQgaGF2ZW4ndCBtb3ZlZCBhIGNlcnRhaW4gZGlzdGFuY2UgYXJlIG5vdCBjYW5kaWRhdGVzLCBhbmQgc2hvdWxkIG5vdCBiZVxuICAgICAgICAgIC8vIGludGVycnVwdGVkLiBXZSBkb24ndCB3YW50IHRvIGludGVycnVwdCB0YXBzIHRoYXQgbWlnaHQgbW92ZSBhIGxpdHRsZSBiaXRcbiAgICAgICAgICByZXR1cm4gIXByZXNzLnBvaW50ZXIuaGFzSW50ZW50KCBJbnRlbnQuRFJBRyApICYmIHByZXNzLmluaXRpYWxQb2ludC5kaXN0YW5jZSggcHJlc3MucG9pbnRlci5wb2ludCApID4gTU9WRV9JTlRFUlJVUFRfTUFHTklUVURFO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gSWYgd2UgYXJlIGFscmVhZHkgem9vbWVkIGluLCB3ZSBzaG91bGQgcHJvbW90ZSBhbnkgbnVtYmVyIG9mIGJhY2tncm91bmQgcHJlc3NlcyB0byBhY3R1YWwgcHJlc3Nlcy5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSdsbCBuZWVkIGF0IGxlYXN0IHR3byBwcmVzc2VzIHRvIHpvb21cbiAgICAgICAgLy8gSXQgaXMgbmljZSB0byBhbGxvdyBkb3duIHBvaW50ZXJzIHRvIG1vdmUgYXJvdW5kIGZyZWVseSB3aXRob3V0IGludGVycnVwdGlvbiB3aGVuIHRoZXJlIGlzbid0IGFueSB6b29tLFxuICAgICAgICAvLyBidXQgd2Ugc3RpbGwgYWxsb3cgaW50ZXJydXB0aW9uIGlmIHRoZSBudW1iZXIgb2YgYmFja2dyb3VuZCBwcmVzc2VzIGluZGljYXRlIHRoZSB1c2VyIGlzIHRyeWluZyB0b1xuICAgICAgICAvLyB6b29tIGluXG4gICAgICAgIGlmICggdGhpcy5nZXRDdXJyZW50U2NhbGUoKSAhPT0gMSB8fCBjYW5kaWRhdGVCYWNrZ3JvdW5kUHJlc3Nlcy5sZW5ndGggPj0gMiApIHtcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGF0dGFjaGVkLCBpbnRlcnJ1cHRpbmcgZm9yIHByZXNzJyApO1xuXG4gICAgICAgICAgLy8gQ29udmVydCBhbGwgY2FuZGlkYXRlIGJhY2tncm91bmQgcHJlc3NlcyB0byBhY3R1YWwgcHJlc3Nlc1xuICAgICAgICAgIGNhbmRpZGF0ZUJhY2tncm91bmRQcmVzc2VzLmZvckVhY2goIHByZXNzID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQmFja2dyb3VuZFByZXNzKCBwcmVzcyApO1xuICAgICAgICAgICAgdGhpcy5pbnRlcnJ1cHRPdGhlckxpc3RlbmVycyggcHJlc3MucG9pbnRlciApO1xuICAgICAgICAgICAgdGhpcy5hZGRQcmVzcyggcHJlc3MgKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGNhbmNlbDogZXZlbnQgPT4ge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGJhY2tncm91bmQgY2FuY2VsJyApO1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgICBpZiAoICF0aGlzLl9pbnRlcnJ1cHRlZCApIHtcbiAgICAgICAgICBjb25zdCBiYWNrZ3JvdW5kUHJlc3MgPSB0aGlzLmZpbmRCYWNrZ3JvdW5kUHJlc3MoIGV2ZW50LnBvaW50ZXIgKSE7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYmFja2dyb3VuZFByZXNzLCAnQmFja2dyb3VuZCBwcmVzcyBzaG91bGQgYmUgZm91bmQgZm9yIGNhbmNlbCBldmVudCcgKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUJhY2tncm91bmRQcmVzcyggYmFja2dyb3VuZFByZXNzICk7XG4gICAgICAgIH1cblxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgICAgfSxcblxuICAgICAgaW50ZXJydXB0OiAoKSA9PiB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgYmFja2dyb3VuZCBpbnRlcnJ1cHQnICk7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICAgIHRoaXMuaW50ZXJydXB0KCk7XG5cbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIGEgUHJlc3MgYnkgc2VhcmNoaW5nIGZvciB0aGUgb25lIHdpdGggdGhlIHByb3ZpZGVkIFBvaW50ZXIuXG4gICAqL1xuICBwcml2YXRlIGZpbmRQcmVzcyggcG9pbnRlcjogUG9pbnRlciApOiBNdWx0aUxpc3RlbmVyUHJlc3MgfCBudWxsIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wcmVzc2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLl9wcmVzc2VzWyBpIF0ucG9pbnRlciA9PT0gcG9pbnRlciApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ByZXNzZXNbIGkgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhIGJhY2tncm91bmQgUHJlc3MgYnkgc2VhcmNoaW5nIGZvciBvbmUgd2l0aCB0aGUgcHJvdmlkZWQgUG9pbnRlci4gQSBiYWNrZ3JvdW5kIFByZXNzIGlzIG9uZSBjcmVhdGVkXG4gICAqIHdoZW4gd2UgcmVjZWl2ZSBhbiBldmVudCB3aGlsZSBhIFBvaW50ZXIgaXMgYWxyZWFkeSBhdHRhY2hlZC5cbiAgICovXG4gIHByaXZhdGUgZmluZEJhY2tncm91bmRQcmVzcyggcG9pbnRlcjogUG9pbnRlciApOiBNdWx0aUxpc3RlbmVyUHJlc3MgfCBudWxsIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9iYWNrZ3JvdW5kUHJlc3Nlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggdGhpcy5fYmFja2dyb3VuZFByZXNzZXNbIGkgXS5wb2ludGVyID09PSBwb2ludGVyICkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYmFja2dyb3VuZFByZXNzZXNbIGkgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwcmVzcyBpcyBhbHJlYWR5IGNvbnRhaW5lZCBpbiBvbmUgb2YgdGhpcy5fYmFja2dyb3VuZFByZXNzZXMgb3IgdGhpcy5fcHJlc3Nlcy4gVGhlcmUgYXJlIGNhc2VzXG4gICAqIHdoZXJlIHdlIG1heSB0cnkgdG8gYWRkIHRoZSBzYW1lIHBvaW50ZXIgdHdpY2UgKHVzZXIgb3BlbmVkIGNvbnRleHQgbWVudSwgdXNpbmcgYSBtb3VzZSBkdXJpbmcgZnV6eiB0ZXN0aW5nKSwgYW5kXG4gICAqIHdlIHdhbnQgdG8gYXZvaWQgYWRkaW5nIGEgcHJlc3MgYWdhaW4gaW4gdGhvc2UgY2FzZXMuXG4gICAqL1xuICBwcml2YXRlIGhhc1ByZXNzKCBwcmVzczogTXVsdGlMaXN0ZW5lclByZXNzICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBfLnNvbWUoIHRoaXMuX3ByZXNzZXMuY29uY2F0KCB0aGlzLl9iYWNrZ3JvdW5kUHJlc3NlcyApLCBleGlzdGluZ1ByZXNzID0+IHtcbiAgICAgIHJldHVybiBleGlzdGluZ1ByZXNzLnBvaW50ZXIgPT09IHByZXNzLnBvaW50ZXI7XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVycnVwdCBhbGwgbGlzdGVuZXJzIG9uIHRoZSBwb2ludGVyLCBleGNlcHQgZm9yIGJhY2tncm91bmQgbGlzdGVuZXJzIHRoYXRcbiAgICogd2VyZSBhZGRlZCBieSB0aGlzIE11bHRpTGlzdGVuZXIuIFVzZWZ1bCB3aGVuIGl0IGlzIHRpbWUgZm9yIHRoaXMgbGlzdGVuZXIgdG9cbiAgICogXCJ0YWtlIG92ZXJcIiBhbmQgaW50ZXJydXB0IGFueSBvdGhlciBsaXN0ZW5lcnMgb24gdGhlIHBvaW50ZXIuXG4gICAqL1xuICBwcml2YXRlIGludGVycnVwdE90aGVyTGlzdGVuZXJzKCBwb2ludGVyOiBQb2ludGVyICk6IHZvaWQge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHBvaW50ZXIuZ2V0TGlzdGVuZXJzKCk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbIGkgXTtcbiAgICAgIGlmICggbGlzdGVuZXIgIT09IHRoaXMuX2JhY2tncm91bmRMaXN0ZW5lciApIHtcbiAgICAgICAgbGlzdGVuZXIuaW50ZXJydXB0ICYmIGxpc3RlbmVyLmludGVycnVwdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJ0IG9mIHRoZSBzY2VuZXJ5IGV2ZW50IEFQSS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZG93biggZXZlbnQ6IFNjZW5lcnlFdmVudCApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGRvd24nICk7XG5cbiAgICBpZiAoIGV2ZW50LnBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSAmJiBldmVudC5kb21FdmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQgJiYgZXZlbnQuZG9tRXZlbnQuYnV0dG9uICE9PSB0aGlzLl9tb3VzZUJ1dHRvbiApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgYWJvcnQ6IHdyb25nIG1vdXNlIGJ1dHRvbicgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBjbGVhcnMgdGhlIGZsYWcgZm9yIE11bHRpTGlzdGVuZXIgYmVoYXZpb3JcbiAgICB0aGlzLl9pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgbGV0IHByZXNzVHJhaWw7XG4gICAgaWYgKCAhXy5pbmNsdWRlcyggZXZlbnQudHJhaWwubm9kZXMsIHRoaXMuX3RhcmdldE5vZGUgKSApIHtcblxuICAgICAgLy8gaWYgdGhlIHRhcmdldCBOb2RlIGlzIG5vdCBpbiB0aGUgZXZlbnQgdHJhaWwsIHdlIGFzc3VtZSB0aGF0IHRoZSBldmVudCB3ZW50IHRvIHRoZVxuICAgICAgLy8gRGlzcGxheSBvciB0aGUgcm9vdCBOb2RlIG9mIHRoZSBzY2VuZSBncmFwaCAtIHRoaXMgd2lsbCB0aHJvdyBhbiBhc3NlcnRpb24gaWZcbiAgICAgIC8vIHRoZXJlIGFyZSBtb3JlIHRoYW4gb25lIHRyYWlscyBmb3VuZFxuICAgICAgcHJlc3NUcmFpbCA9IHRoaXMuX3RhcmdldE5vZGUuZ2V0VW5pcXVlVHJhaWxUbyggZXZlbnQudGFyZ2V0ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcHJlc3NUcmFpbCA9IGV2ZW50LnRyYWlsLnN1YnRyYWlsVG8oIHRoaXMuX3RhcmdldE5vZGUsIGZhbHNlICk7XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIHByZXNzVHJhaWwubm9kZXMsIHRoaXMuX3RhcmdldE5vZGUgKSwgJ3RhcmdldE5vZGUgbXVzdCBiZSBpbiB0aGUgVHJhaWwgZm9yIFByZXNzJyApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgY29uc3QgcHJlc3MgPSBuZXcgTXVsdGlMaXN0ZW5lclByZXNzKCBldmVudC5wb2ludGVyLCBwcmVzc1RyYWlsICk7XG5cbiAgICBpZiAoICF0aGlzLl9hbGxvd01vdmVJbnRlcnJ1cHRpb24gJiYgIXRoaXMuX2FsbG93TXVsdGl0b3VjaEludGVycnVwdGlvbiApIHtcblxuICAgICAgLy8gbW9zdCByZXN0cmljdGl2ZSBjYXNlLCBvbmx5IGFsbG93IHByZXNzZXMgaWYgdGhlIHBvaW50ZXIgaXMgbm90IGF0dGFjaGVkIC0gUHJlc3Nlc1xuICAgICAgLy8gYXJlIG5ldmVyIGFkZGVkIGFzIGJhY2tncm91bmQgcHJlc3NlcyBpbiB0aGlzIGNhc2UgYmVjYXVzZSBpbnRlcnJ1cHRpb24gaXMgbmV2ZXIgYWxsb3dlZFxuICAgICAgaWYgKCAhZXZlbnQucG9pbnRlci5pc0F0dGFjaGVkKCkgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgdW5hdHRhY2hlZCwgdXNpbmcgcHJlc3MnICk7XG4gICAgICAgIHRoaXMuYWRkUHJlc3MoIHByZXNzICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyB3ZSBhbGxvdyBzb21lIGZvcm0gb2YgaW50ZXJydXB0aW9uLCBhZGQgYXMgYmFja2dyb3VuZCBwcmVzc2VzLCBhbmQgd2Ugd2lsbCBkZWNpZGUgaWYgdGhleVxuICAgICAgLy8gc2hvdWxkIGJlIGNvbnZlcnRlZCB0byBwcmVzc2VzIGFuZCBpbnRlcnJ1cHQgb3RoZXIgbGlzdGVuZXJzIG9uIG1vdmUgZXZlbnRcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgYXR0YWNoZWQsIGFkZGluZyBiYWNrZ3JvdW5kIHByZXNzJyApO1xuICAgICAgdGhpcy5hZGRCYWNrZ3JvdW5kUHJlc3MoIHByZXNzICk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBQcmVzcyB0byB0aGlzIGxpc3RlbmVyIHdoZW4gYSBuZXcgUG9pbnRlciBpcyBkb3duLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFkZFByZXNzKCBwcmVzczogTXVsdGlMaXN0ZW5lclByZXNzICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgYWRkUHJlc3MnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBpZiAoICF0aGlzLmhhc1ByZXNzKCBwcmVzcyApICkge1xuICAgICAgdGhpcy5fcHJlc3Nlcy5wdXNoKCBwcmVzcyApO1xuXG4gICAgICBwcmVzcy5wb2ludGVyLmN1cnNvciA9IHRoaXMuX3ByZXNzQ3Vyc29yO1xuICAgICAgcHJlc3MucG9pbnRlci5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLl9wcmVzc0xpc3RlbmVyLCB0cnVlICk7XG5cbiAgICAgIHRoaXMucmVjb21wdXRlTG9jYWxzKCk7XG4gICAgICB0aGlzLnJlcG9zaXRpb24oKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcG9zaXRpb24gaW4gcmVzcG9uc2UgdG8gbW92ZW1lbnQgb2YgYW55IFByZXNzZXMuXG4gICAqL1xuICBwcm90ZWN0ZWQgbW92ZVByZXNzKCBwcmVzczogTXVsdGlMaXN0ZW5lclByZXNzICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgbW92ZVByZXNzJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5yZXBvc2l0aW9uKCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIFByZXNzIGZyb20gdGhpcyBsaXN0ZW5lci5cbiAgICovXG4gIHByb3RlY3RlZCByZW1vdmVQcmVzcyggcHJlc3M6IE11bHRpTGlzdGVuZXJQcmVzcyApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIHJlbW92ZVByZXNzJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgcHJlc3MucG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wcmVzc0xpc3RlbmVyICk7XG4gICAgcHJlc3MucG9pbnRlci5jdXJzb3IgPSBudWxsO1xuXG4gICAgYXJyYXlSZW1vdmUoIHRoaXMuX3ByZXNzZXMsIHByZXNzICk7XG5cbiAgICB0aGlzLnJlY29tcHV0ZUxvY2FscygpO1xuICAgIHRoaXMucmVwb3NpdGlvbigpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBiYWNrZ3JvdW5kIFByZXNzLCBhIFByZXNzIHRoYXQgd2UgcmVjZWl2ZSB3aGlsZSBhIFBvaW50ZXIgaXMgYWxyZWFkeSBhdHRhY2hlZC4gRGVwZW5kaW5nIG9uIGJhY2tncm91bmRcbiAgICogUHJlc3Nlcywgd2UgbWF5IGludGVycnVwdCB0aGUgYXR0YWNoZWQgcG9pbnRlciB0byBiZWdpbiB6b29tIG9wZXJhdGlvbnMuXG4gICAqL1xuICBwcml2YXRlIGFkZEJhY2tncm91bmRQcmVzcyggcHJlc3M6IE11bHRpTGlzdGVuZXJQcmVzcyApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGFkZEJhY2tncm91bmRQcmVzcycgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB0aGUgcHJlc3MgcG9pbnRlciBhbHJlYWR5IGhhcyB0aGUgbGlzdGVuZXIgLSBmb3IgaW5zdGFuY2UgaW4gQ2hyb21lIHdlIGZhaWwgdG8gZ2V0XG4gICAgLy8gXCJ1cFwiIGV2ZW50cyBvbmNlIHRoZSBjb250ZXh0IG1lbnUgaXMgb3BlbiAobGlrZSBhZnRlciBhIHJpZ2h0IGNsaWNrKSwgc28gb25seSBhZGQgdG8gdGhlIFBvaW50ZXJcbiAgICAvLyBpZiBpdCBpc24ndCBhbHJlYWR5IGFkZGVkXG4gICAgaWYgKCAhdGhpcy5oYXNQcmVzcyggcHJlc3MgKSApIHtcbiAgICAgIHRoaXMuX2JhY2tncm91bmRQcmVzc2VzLnB1c2goIHByZXNzICk7XG4gICAgICBwcmVzcy5wb2ludGVyLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuX2JhY2tncm91bmRMaXN0ZW5lciwgZmFsc2UgKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGJhY2tncm91bmQgUHJlc3MgZnJvbSB0aGlzIGxpc3RlbmVyLlxuICAgKi9cbiAgcHJpdmF0ZSByZW1vdmVCYWNrZ3JvdW5kUHJlc3MoIHByZXNzOiBNdWx0aUxpc3RlbmVyUHJlc3MgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciByZW1vdmVCYWNrZ3JvdW5kUHJlc3MnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBwcmVzcy5wb2ludGVyLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX2JhY2tncm91bmRMaXN0ZW5lciApO1xuXG4gICAgYXJyYXlSZW1vdmUoIHRoaXMuX2JhY2tncm91bmRQcmVzc2VzLCBwcmVzcyApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvc2l0aW9uIHRoZSB0YXJnZXQgTm9kZSAoaW5jbHVkaW5nIGFsbCBhcHNlY3RzIG9mIHRyYW5zZm9ybWF0aW9uKSBvZiB0aGlzIGxpc3RlbmVyJ3MgdGFyZ2V0IE5vZGUuXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVwb3NpdGlvbigpOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIHJlcG9zaXRpb24nICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB0aGlzLm1hdHJpeFByb3BlcnR5LnNldCggdGhpcy5jb21wdXRlTWF0cml4KCkgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVjb21wdXRlIHRoZSBsb2NhbCBwb2ludHMgb2YgdGhlIFByZXNzZXMgZm9yIHRoaXMgbGlzdGVuZXIsIHJlbGF0aXZlIHRvIHRoZSB0YXJnZXQgTm9kZS5cbiAgICovXG4gIHByb3RlY3RlZCByZWNvbXB1dGVMb2NhbHMoKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciByZWNvbXB1dGVMb2NhbHMnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wcmVzc2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5fcHJlc3Nlc1sgaSBdLnJlY29tcHV0ZUxvY2FsUG9pbnQoKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVycnVwdCB0aGlzIGxpc3RlbmVyLlxuICAgKi9cbiAgcHVibGljIGludGVycnVwdCgpOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGludGVycnVwdCcgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIHdoaWxlICggdGhpcy5fcHJlc3Nlcy5sZW5ndGggKSB7XG4gICAgICB0aGlzLnJlbW92ZVByZXNzKCB0aGlzLl9wcmVzc2VzWyB0aGlzLl9wcmVzc2VzLmxlbmd0aCAtIDEgXSApO1xuICAgIH1cblxuICAgIHdoaWxlICggdGhpcy5fYmFja2dyb3VuZFByZXNzZXMubGVuZ3RoICkge1xuICAgICAgdGhpcy5yZW1vdmVCYWNrZ3JvdW5kUHJlc3MoIHRoaXMuX2JhY2tncm91bmRQcmVzc2VzWyB0aGlzLl9iYWNrZ3JvdW5kUHJlc3Nlcy5sZW5ndGggLSAxIF0gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbnRlcnJ1cHRlZCA9IHRydWU7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgdGhlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBmb3IgdGhlIHRhcmdldCBOb2RlIGJhc2VkIG9uIFByZXNzZXMuXG4gICAqL1xuICBwcml2YXRlIGNvbXB1dGVNYXRyaXgoKTogTWF0cml4MyB7XG4gICAgaWYgKCB0aGlzLl9wcmVzc2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiB0aGlzLl90YXJnZXROb2RlLmdldE1hdHJpeCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fcHJlc3Nlcy5sZW5ndGggPT09IDEgKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wdXRlU2luZ2xlUHJlc3NNYXRyaXgoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuX2FsbG93U2NhbGUgJiYgdGhpcy5fYWxsb3dSb3RhdGlvbiApIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXB1dGVUcmFuc2xhdGlvblJvdGF0aW9uU2NhbGVNYXRyaXgoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuX2FsbG93U2NhbGUgKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wdXRlVHJhbnNsYXRpb25TY2FsZU1hdHJpeCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fYWxsb3dSb3RhdGlvbiApIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXB1dGVUcmFuc2xhdGlvblJvdGF0aW9uTWF0cml4KCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcHV0ZVRyYW5zbGF0aW9uTWF0cml4KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgYSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggZnJvbSBhIHNpbmdsZSBwcmVzcy4gU2luZ2xlIHByZXNzIGluZGljYXRlcyB0cmFuc2xhdGlvbiAocGFubmluZykgZm9yIHRoZVxuICAgKiB0YXJnZXQgTm9kZS5cbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZVNpbmdsZVByZXNzTWF0cml4KCk6IE1hdHJpeDMge1xuICAgIGNvbnN0IHNpbmdsZVRhcmdldFBvaW50ID0gdGhpcy5fcHJlc3Nlc1sgMCBdLnRhcmdldFBvaW50O1xuICAgIGNvbnN0IGxvY2FsUG9pbnQgPSB0aGlzLl9wcmVzc2VzWyAwIF0ubG9jYWxQb2ludCE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbG9jYWxQb2ludCwgJ2xvY2FsUG9pbnQgaXMgbm90IGRlZmluZWQgb24gdGhlIFByZXNzPycgKTtcblxuICAgIGNvbnN0IHNpbmdsZU1hcHBlZFBvaW50ID0gdGhpcy5fdGFyZ2V0Tm9kZS5sb2NhbFRvUGFyZW50UG9pbnQoIGxvY2FsUG9pbnQgKTtcbiAgICBjb25zdCBkZWx0YSA9IHNpbmdsZVRhcmdldFBvaW50Lm1pbnVzKCBzaW5nbGVNYXBwZWRQb2ludCApO1xuICAgIHJldHVybiBNYXRyaXgzLnRyYW5zbGF0aW9uRnJvbVZlY3RvciggZGVsdGEgKS50aW1lc01hdHJpeCggdGhpcy5fdGFyZ2V0Tm9kZS5nZXRNYXRyaXgoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgYSB0cmFuc2xhdGlvbiBtYXRyaXggZnJvbSBtdWx0aXBsZSBwcmVzc2VzLiBVc3VhbGx5IG11bHRpcGxlIHByZXNzZXMgd2lsbCBoYXZlIHNvbWUgc2NhbGUgb3Igcm90YXRpb25cbiAgICogYXMgd2VsbCwgYnV0IHRoaXMgaXMgdG8gYmUgdXNlZCBpZiByb3RhdGlvbiBhbmQgc2NhbGUgYXJlIG5vdCBlbmFibGVkIGZvciB0aGlzIGxpc3RlbmVyLlxuICAgKi9cbiAgcHVibGljIGNvbXB1dGVUcmFuc2xhdGlvbk1hdHJpeCgpOiBNYXRyaXgzIHtcbiAgICAvLyB0cmFuc2xhdGlvbiBvbmx5LiBsaW5lYXIgbGVhc3Qtc3F1YXJlcyBzaW1wbGlmaWVzIHRvIHN1bSBvZiBkaWZmZXJlbmNlc1xuICAgIGNvbnN0IHN1bSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcHJlc3Nlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHN1bS5hZGQoIHRoaXMuX3ByZXNzZXNbIGkgXS50YXJnZXRQb2ludCApO1xuXG4gICAgICBjb25zdCBsb2NhbFBvaW50ID0gdGhpcy5fcHJlc3Nlc1sgaSBdLmxvY2FsUG9pbnQhO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbG9jYWxQb2ludCwgJ2xvY2FsUG9pbnQgaXMgbm90IGRlZmluZWQgb24gdGhlIFByZXNzPycgKTtcbiAgICAgIHN1bS5zdWJ0cmFjdCggbG9jYWxQb2ludCApO1xuICAgIH1cbiAgICByZXR1cm4gTWF0cml4My50cmFuc2xhdGlvbkZyb21WZWN0b3IoIHN1bS5kaXZpZGVkU2NhbGFyKCB0aGlzLl9wcmVzc2VzLmxlbmd0aCApICk7XG4gIH1cblxuICAvKipcbiAgICogQSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggZnJvbSBtdWx0aXBsZSBQcmVzc2VzIHRoYXQgd2lsbCB0cmFuc2xhdGUgYW5kIHNjYWxlIHRoZSB0YXJnZXQgTm9kZS5cbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZVRyYW5zbGF0aW9uU2NhbGVNYXRyaXgoKTogTWF0cml4MyB7XG4gICAgY29uc3QgbG9jYWxQb2ludHMgPSB0aGlzLl9wcmVzc2VzLm1hcCggcHJlc3MgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcHJlc3MubG9jYWxQb2ludCwgJ2xvY2FsUG9pbnQgaXMgbm90IGRlZmluZWQgb24gdGhlIFByZXNzPycgKTtcbiAgICAgIHJldHVybiBwcmVzcy5sb2NhbFBvaW50ITtcbiAgICB9ICk7XG4gICAgY29uc3QgdGFyZ2V0UG9pbnRzID0gdGhpcy5fcHJlc3Nlcy5tYXAoIHByZXNzID0+IHByZXNzLnRhcmdldFBvaW50ICk7XG5cbiAgICBjb25zdCBsb2NhbENlbnRyb2lkID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbiAgICBjb25zdCB0YXJnZXRDZW50cm9pZCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cbiAgICBsb2NhbFBvaW50cy5mb3JFYWNoKCBsb2NhbFBvaW50ID0+IHsgbG9jYWxDZW50cm9pZC5hZGQoIGxvY2FsUG9pbnQgKTsgfSApO1xuICAgIHRhcmdldFBvaW50cy5mb3JFYWNoKCB0YXJnZXRQb2ludCA9PiB7IHRhcmdldENlbnRyb2lkLmFkZCggdGFyZ2V0UG9pbnQgKTsgfSApO1xuXG4gICAgbG9jYWxDZW50cm9pZC5kaXZpZGVTY2FsYXIoIHRoaXMuX3ByZXNzZXMubGVuZ3RoICk7XG4gICAgdGFyZ2V0Q2VudHJvaWQuZGl2aWRlU2NhbGFyKCB0aGlzLl9wcmVzc2VzLmxlbmd0aCApO1xuXG4gICAgbGV0IGxvY2FsU3F1YXJlZERpc3RhbmNlID0gMDtcbiAgICBsZXQgdGFyZ2V0U3F1YXJlZERpc3RhbmNlID0gMDtcblxuICAgIGxvY2FsUG9pbnRzLmZvckVhY2goIGxvY2FsUG9pbnQgPT4geyBsb2NhbFNxdWFyZWREaXN0YW5jZSArPSBsb2NhbFBvaW50LmRpc3RhbmNlU3F1YXJlZCggbG9jYWxDZW50cm9pZCApOyB9ICk7XG4gICAgdGFyZ2V0UG9pbnRzLmZvckVhY2goIHRhcmdldFBvaW50ID0+IHsgdGFyZ2V0U3F1YXJlZERpc3RhbmNlICs9IHRhcmdldFBvaW50LmRpc3RhbmNlU3F1YXJlZCggdGFyZ2V0Q2VudHJvaWQgKTsgfSApO1xuXG4gICAgLy8gd2hpbGUgZnV6eiB0ZXN0aW5nLCBpdCBpcyBwb3NzaWJsZSB0aGF0IHRoZSBQcmVzcyBwb2ludHMgYXJlXG4gICAgLy8gZXhhY3RseSB0aGUgc2FtZSByZXN1bHRpbmcgaW4gdW5kZWZpbmVkIHNjYWxlIC0gaWYgdGhhdCBpcyB0aGUgY2FzZVxuICAgIC8vIHdlIHdpbGwgbm90IGFkanVzdFxuICAgIGxldCBzY2FsZSA9IHRoaXMuZ2V0Q3VycmVudFNjYWxlKCk7XG4gICAgaWYgKCB0YXJnZXRTcXVhcmVkRGlzdGFuY2UgIT09IDAgKSB7XG4gICAgICBzY2FsZSA9IHRoaXMubGltaXRTY2FsZSggTWF0aC5zcXJ0KCB0YXJnZXRTcXVhcmVkRGlzdGFuY2UgLyBsb2NhbFNxdWFyZWREaXN0YW5jZSApICk7XG4gICAgfVxuXG4gICAgY29uc3QgdHJhbnNsYXRlVG9UYXJnZXQgPSBNYXRyaXgzLnRyYW5zbGF0aW9uKCB0YXJnZXRDZW50cm9pZC54LCB0YXJnZXRDZW50cm9pZC55ICk7XG4gICAgY29uc3QgdHJhbnNsYXRlRnJvbUxvY2FsID0gTWF0cml4My50cmFuc2xhdGlvbiggLWxvY2FsQ2VudHJvaWQueCwgLWxvY2FsQ2VudHJvaWQueSApO1xuXG4gICAgcmV0dXJuIHRyYW5zbGF0ZVRvVGFyZ2V0LnRpbWVzTWF0cml4KCBNYXRyaXgzLnNjYWxpbmcoIHNjYWxlICkgKS50aW1lc01hdHJpeCggdHJhbnNsYXRlRnJvbUxvY2FsICk7XG4gIH1cblxuICAvKipcbiAgICogTGltaXQgdGhlIHByb3ZpZGVkIHNjYWxlIGJ5IGNvbnN0cmFpbnRzIG9mIHRoaXMgTXVsdGlMaXN0ZW5lci5cbiAgICovXG4gIHByb3RlY3RlZCBsaW1pdFNjYWxlKCBzY2FsZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgbGV0IGNvcnJlY3RlZFNjYWxlID0gTWF0aC5tYXgoIHNjYWxlLCB0aGlzLl9taW5TY2FsZSApO1xuICAgIGNvcnJlY3RlZFNjYWxlID0gTWF0aC5taW4oIGNvcnJlY3RlZFNjYWxlLCB0aGlzLl9tYXhTY2FsZSApO1xuICAgIHJldHVybiBjb3JyZWN0ZWRTY2FsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4IHRoYXQgd2lsbCB0cmFuc2xhdGUgYW5kIHNjYWxlIHRoZSB0YXJnZXQgTm9kZSBmcm9tIG11bHRpcGxlIHByZXNzZXMuIFNob3VsZFxuICAgKiBiZSB1c2VkIHdoZW4gc2NhbGluZyBpcyBub3QgZW5hYmxlZCBmb3IgdGhpcyBsaXN0ZW5lci5cbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZVRyYW5zbGF0aW9uUm90YXRpb25NYXRyaXgoKTogTWF0cml4MyB7XG4gICAgbGV0IGk7XG4gICAgY29uc3QgbG9jYWxNYXRyaXggPSBuZXcgTWF0cml4KCAyLCB0aGlzLl9wcmVzc2VzLmxlbmd0aCApO1xuICAgIGNvbnN0IHRhcmdldE1hdHJpeCA9IG5ldyBNYXRyaXgoIDIsIHRoaXMuX3ByZXNzZXMubGVuZ3RoICk7XG4gICAgY29uc3QgbG9jYWxDZW50cm9pZCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gICAgY29uc3QgdGFyZ2V0Q2VudHJvaWQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy5fcHJlc3Nlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGxvY2FsUG9pbnQgPSB0aGlzLl9wcmVzc2VzWyBpIF0ubG9jYWxQb2ludCE7XG4gICAgICBjb25zdCB0YXJnZXRQb2ludCA9IHRoaXMuX3ByZXNzZXNbIGkgXS50YXJnZXRQb2ludDtcbiAgICAgIGxvY2FsQ2VudHJvaWQuYWRkKCBsb2NhbFBvaW50ICk7XG4gICAgICB0YXJnZXRDZW50cm9pZC5hZGQoIHRhcmdldFBvaW50ICk7XG4gICAgICBsb2NhbE1hdHJpeC5zZXQoIDAsIGksIGxvY2FsUG9pbnQueCApO1xuICAgICAgbG9jYWxNYXRyaXguc2V0KCAxLCBpLCBsb2NhbFBvaW50LnkgKTtcbiAgICAgIHRhcmdldE1hdHJpeC5zZXQoIDAsIGksIHRhcmdldFBvaW50LnggKTtcbiAgICAgIHRhcmdldE1hdHJpeC5zZXQoIDEsIGksIHRhcmdldFBvaW50LnkgKTtcbiAgICB9XG4gICAgbG9jYWxDZW50cm9pZC5kaXZpZGVTY2FsYXIoIHRoaXMuX3ByZXNzZXMubGVuZ3RoICk7XG4gICAgdGFyZ2V0Q2VudHJvaWQuZGl2aWRlU2NhbGFyKCB0aGlzLl9wcmVzc2VzLmxlbmd0aCApO1xuXG4gICAgLy8gZGV0ZXJtaW5lIG9mZnNldHMgZnJvbSB0aGUgY2VudHJvaWRzXG4gICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLl9wcmVzc2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgbG9jYWxNYXRyaXguc2V0KCAwLCBpLCBsb2NhbE1hdHJpeC5nZXQoIDAsIGkgKSAtIGxvY2FsQ2VudHJvaWQueCApO1xuICAgICAgbG9jYWxNYXRyaXguc2V0KCAxLCBpLCBsb2NhbE1hdHJpeC5nZXQoIDEsIGkgKSAtIGxvY2FsQ2VudHJvaWQueSApO1xuICAgICAgdGFyZ2V0TWF0cml4LnNldCggMCwgaSwgdGFyZ2V0TWF0cml4LmdldCggMCwgaSApIC0gdGFyZ2V0Q2VudHJvaWQueCApO1xuICAgICAgdGFyZ2V0TWF0cml4LnNldCggMSwgaSwgdGFyZ2V0TWF0cml4LmdldCggMSwgaSApIC0gdGFyZ2V0Q2VudHJvaWQueSApO1xuICAgIH1cbiAgICBjb25zdCBjb3ZhcmlhbmNlTWF0cml4ID0gbG9jYWxNYXRyaXgudGltZXMoIHRhcmdldE1hdHJpeC50cmFuc3Bvc2UoKSApO1xuICAgIGNvbnN0IHN2ZCA9IG5ldyBTaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbiggY292YXJpYW5jZU1hdHJpeCApO1xuICAgIGxldCByb3RhdGlvbiA9IHN2ZC5nZXRWKCkudGltZXMoIHN2ZC5nZXRVKCkudHJhbnNwb3NlKCkgKTtcbiAgICBpZiAoIHJvdGF0aW9uLmRldCgpIDwgMCApIHtcbiAgICAgIHJvdGF0aW9uID0gc3ZkLmdldFYoKS50aW1lcyggTWF0cml4LmRpYWdvbmFsTWF0cml4KCBbIDEsIC0xIF0gKSApLnRpbWVzKCBzdmQuZ2V0VSgpLnRyYW5zcG9zZSgpICk7XG4gICAgfVxuICAgIGNvbnN0IHJvdGF0aW9uMyA9IG5ldyBNYXRyaXgzKCkucm93TWFqb3IoIHJvdGF0aW9uLmdldCggMCwgMCApLCByb3RhdGlvbi5nZXQoIDAsIDEgKSwgMCxcbiAgICAgIHJvdGF0aW9uLmdldCggMSwgMCApLCByb3RhdGlvbi5nZXQoIDEsIDEgKSwgMCxcbiAgICAgIDAsIDAsIDEgKTtcbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHRhcmdldENlbnRyb2lkLm1pbnVzKCByb3RhdGlvbjMudGltZXNWZWN0b3IyKCBsb2NhbENlbnRyb2lkICkgKTtcbiAgICByb3RhdGlvbjMuc2V0MDIoIHRyYW5zbGF0aW9uLnggKTtcbiAgICByb3RhdGlvbjMuc2V0MTIoIHRyYW5zbGF0aW9uLnkgKTtcbiAgICByZXR1cm4gcm90YXRpb24zO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgYSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggdGhhdCB3aWxsIHRyYW5zbGF0ZSwgc2NhbGUsIGFuZCByb3RhdGUgdGhlIHRhcmdldCBOb2RlIGZyb20gbXVsdGlwbGUgUHJlc3Nlcy5cbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZVRyYW5zbGF0aW9uUm90YXRpb25TY2FsZU1hdHJpeCgpOiBNYXRyaXgzIHtcbiAgICBsZXQgaTtcbiAgICBjb25zdCBsb2NhbE1hdHJpeCA9IG5ldyBNYXRyaXgoIHRoaXMuX3ByZXNzZXMubGVuZ3RoICogMiwgNCApO1xuICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy5fcHJlc3Nlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIC8vIFsgeCAgeSAxIDAgXVxuICAgICAgLy8gWyB5IC14IDAgMSBdXG4gICAgICBjb25zdCBsb2NhbFBvaW50ID0gdGhpcy5fcHJlc3Nlc1sgaSBdLmxvY2FsUG9pbnQhO1xuICAgICAgbG9jYWxNYXRyaXguc2V0KCAyICogaSArIDAsIDAsIGxvY2FsUG9pbnQueCApO1xuICAgICAgbG9jYWxNYXRyaXguc2V0KCAyICogaSArIDAsIDEsIGxvY2FsUG9pbnQueSApO1xuICAgICAgbG9jYWxNYXRyaXguc2V0KCAyICogaSArIDAsIDIsIDEgKTtcbiAgICAgIGxvY2FsTWF0cml4LnNldCggMiAqIGkgKyAxLCAwLCBsb2NhbFBvaW50LnkgKTtcbiAgICAgIGxvY2FsTWF0cml4LnNldCggMiAqIGkgKyAxLCAxLCAtbG9jYWxQb2ludC54ICk7XG4gICAgICBsb2NhbE1hdHJpeC5zZXQoIDIgKiBpICsgMSwgMywgMSApO1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXRNYXRyaXggPSBuZXcgTWF0cml4KCB0aGlzLl9wcmVzc2VzLmxlbmd0aCAqIDIsIDEgKTtcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMuX3ByZXNzZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCB0YXJnZXRQb2ludCA9IHRoaXMuX3ByZXNzZXNbIGkgXS50YXJnZXRQb2ludDtcbiAgICAgIHRhcmdldE1hdHJpeC5zZXQoIDIgKiBpICsgMCwgMCwgdGFyZ2V0UG9pbnQueCApO1xuICAgICAgdGFyZ2V0TWF0cml4LnNldCggMiAqIGkgKyAxLCAwLCB0YXJnZXRQb2ludC55ICk7XG4gICAgfVxuICAgIGNvbnN0IGNvZWZmaWNpZW50TWF0cml4ID0gU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24ucHNldWRvaW52ZXJzZSggbG9jYWxNYXRyaXggKS50aW1lcyggdGFyZ2V0TWF0cml4ICk7XG4gICAgY29uc3QgbTExID0gY29lZmZpY2llbnRNYXRyaXguZ2V0KCAwLCAwICk7XG4gICAgY29uc3QgbTEyID0gY29lZmZpY2llbnRNYXRyaXguZ2V0KCAxLCAwICk7XG4gICAgY29uc3QgbTEzID0gY29lZmZpY2llbnRNYXRyaXguZ2V0KCAyLCAwICk7XG4gICAgY29uc3QgbTIzID0gY29lZmZpY2llbnRNYXRyaXguZ2V0KCAzLCAwICk7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXgzKCkucm93TWFqb3IoIG0xMSwgbTEyLCBtMTMsXG4gICAgICAtbTEyLCBtMTEsIG0yMyxcbiAgICAgIDAsIDAsIDEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgc2NhbGUgb24gdGhlIHRhcmdldCBOb2RlLCBhc3N1bWVzIHRoYXQgdGhlcmUgaXMgaXNvbWV0cmljIHNjYWxpbmcgaW4gYm90aCB4IGFuZCB5LlxuICAgKi9cbiAgcHVibGljIGdldEN1cnJlbnRTY2FsZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90YXJnZXROb2RlLmdldFNjYWxlVmVjdG9yKCkueDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0cmFuc2Zvcm0gb24gdGhlIHRhcmdldCBOb2RlLlxuICAgKi9cbiAgcHVibGljIHJlc2V0VHJhbnNmb3JtKCk6IHZvaWQge1xuICAgIHRoaXMuX3RhcmdldE5vZGUucmVzZXRUcmFuc2Zvcm0oKTtcbiAgICB0aGlzLm1hdHJpeFByb3BlcnR5LnNldCggdGhpcy5fdGFyZ2V0Tm9kZS5tYXRyaXguY29weSgpICk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ011bHRpTGlzdGVuZXInLCBNdWx0aUxpc3RlbmVyICk7XG5cbmV4cG9ydCBkZWZhdWx0IE11bHRpTGlzdGVuZXI7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiTWF0cml4IiwiTWF0cml4MyIsIlNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uIiwiVmVjdG9yMiIsImFycmF5UmVtb3ZlIiwib3B0aW9uaXplIiwiVGFuZGVtIiwiSW50ZW50IiwiTW91c2UiLCJNdWx0aUxpc3RlbmVyUHJlc3MiLCJzY2VuZXJ5IiwiTU9WRV9JTlRFUlJVUFRfTUFHTklUVURFIiwiTXVsdGlMaXN0ZW5lciIsImZpbmRQcmVzcyIsInBvaW50ZXIiLCJpIiwiX3ByZXNzZXMiLCJsZW5ndGgiLCJmaW5kQmFja2dyb3VuZFByZXNzIiwiX2JhY2tncm91bmRQcmVzc2VzIiwiaGFzUHJlc3MiLCJwcmVzcyIsIl8iLCJzb21lIiwiY29uY2F0IiwiZXhpc3RpbmdQcmVzcyIsImludGVycnVwdE90aGVyTGlzdGVuZXJzIiwibGlzdGVuZXJzIiwiZ2V0TGlzdGVuZXJzIiwibGlzdGVuZXIiLCJfYmFja2dyb3VuZExpc3RlbmVyIiwiaW50ZXJydXB0IiwiZG93biIsImV2ZW50Iiwic2NlbmVyeUxvZyIsIklucHV0TGlzdGVuZXIiLCJkb21FdmVudCIsIk1vdXNlRXZlbnQiLCJidXR0b24iLCJfbW91c2VCdXR0b24iLCJfaW50ZXJydXB0ZWQiLCJwcmVzc1RyYWlsIiwiaW5jbHVkZXMiLCJ0cmFpbCIsIm5vZGVzIiwiX3RhcmdldE5vZGUiLCJnZXRVbmlxdWVUcmFpbFRvIiwidGFyZ2V0Iiwic3VidHJhaWxUbyIsImFzc2VydCIsInB1c2giLCJfYWxsb3dNb3ZlSW50ZXJydXB0aW9uIiwiX2FsbG93TXVsdGl0b3VjaEludGVycnVwdGlvbiIsImlzQXR0YWNoZWQiLCJhZGRQcmVzcyIsImFkZEJhY2tncm91bmRQcmVzcyIsInBvcCIsImN1cnNvciIsIl9wcmVzc0N1cnNvciIsImFkZElucHV0TGlzdGVuZXIiLCJfcHJlc3NMaXN0ZW5lciIsInJlY29tcHV0ZUxvY2FscyIsInJlcG9zaXRpb24iLCJtb3ZlUHJlc3MiLCJyZW1vdmVQcmVzcyIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJyZW1vdmVCYWNrZ3JvdW5kUHJlc3MiLCJtYXRyaXhQcm9wZXJ0eSIsInNldCIsImNvbXB1dGVNYXRyaXgiLCJyZWNvbXB1dGVMb2NhbFBvaW50IiwiZ2V0TWF0cml4IiwiY29tcHV0ZVNpbmdsZVByZXNzTWF0cml4IiwiX2FsbG93U2NhbGUiLCJfYWxsb3dSb3RhdGlvbiIsImNvbXB1dGVUcmFuc2xhdGlvblJvdGF0aW9uU2NhbGVNYXRyaXgiLCJjb21wdXRlVHJhbnNsYXRpb25TY2FsZU1hdHJpeCIsImNvbXB1dGVUcmFuc2xhdGlvblJvdGF0aW9uTWF0cml4IiwiY29tcHV0ZVRyYW5zbGF0aW9uTWF0cml4Iiwic2luZ2xlVGFyZ2V0UG9pbnQiLCJ0YXJnZXRQb2ludCIsImxvY2FsUG9pbnQiLCJzaW5nbGVNYXBwZWRQb2ludCIsImxvY2FsVG9QYXJlbnRQb2ludCIsImRlbHRhIiwibWludXMiLCJ0cmFuc2xhdGlvbkZyb21WZWN0b3IiLCJ0aW1lc01hdHJpeCIsInN1bSIsImFkZCIsInN1YnRyYWN0IiwiZGl2aWRlZFNjYWxhciIsImxvY2FsUG9pbnRzIiwibWFwIiwidGFyZ2V0UG9pbnRzIiwibG9jYWxDZW50cm9pZCIsInRhcmdldENlbnRyb2lkIiwiZm9yRWFjaCIsImRpdmlkZVNjYWxhciIsImxvY2FsU3F1YXJlZERpc3RhbmNlIiwidGFyZ2V0U3F1YXJlZERpc3RhbmNlIiwiZGlzdGFuY2VTcXVhcmVkIiwic2NhbGUiLCJnZXRDdXJyZW50U2NhbGUiLCJsaW1pdFNjYWxlIiwiTWF0aCIsInNxcnQiLCJ0cmFuc2xhdGVUb1RhcmdldCIsInRyYW5zbGF0aW9uIiwieCIsInkiLCJ0cmFuc2xhdGVGcm9tTG9jYWwiLCJzY2FsaW5nIiwiY29ycmVjdGVkU2NhbGUiLCJtYXgiLCJfbWluU2NhbGUiLCJtaW4iLCJfbWF4U2NhbGUiLCJsb2NhbE1hdHJpeCIsInRhcmdldE1hdHJpeCIsImdldCIsImNvdmFyaWFuY2VNYXRyaXgiLCJ0aW1lcyIsInRyYW5zcG9zZSIsInN2ZCIsInJvdGF0aW9uIiwiZ2V0ViIsImdldFUiLCJkZXQiLCJkaWFnb25hbE1hdHJpeCIsInJvdGF0aW9uMyIsInJvd01ham9yIiwidGltZXNWZWN0b3IyIiwic2V0MDIiLCJzZXQxMiIsImNvZWZmaWNpZW50TWF0cml4IiwicHNldWRvaW52ZXJzZSIsIm0xMSIsIm0xMiIsIm0xMyIsIm0yMyIsImdldFNjYWxlVmVjdG9yIiwicmVzZXRUcmFuc2Zvcm0iLCJtYXRyaXgiLCJjb3B5IiwidGFyZ2V0Tm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJtb3VzZUJ1dHRvbiIsInByZXNzQ3Vyc29yIiwiYWxsb3dTY2FsZSIsImFsbG93Um90YXRpb24iLCJhbGxvd011bHRpdG91Y2hJbnRlcnJ1cHRpb24iLCJhbGxvd01vdmVJbnRlcnJ1cHRpb24iLCJtaW5TY2FsZSIsIm1heFNjYWxlIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9WYWx1ZVR5cGUiLCJNYXRyaXgzSU8iLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsImxpbmsiLCJtb3ZlIiwidXAiLCJjYW5jZWwiLCJpbnRlcnJ1cHRlZCIsImJhY2tncm91bmRQcmVzcyIsImNhbmRpZGF0ZUJhY2tncm91bmRQcmVzc2VzIiwiZmlsdGVyIiwiaGFzSW50ZW50IiwiRFJBRyIsImluaXRpYWxQb2ludCIsImRpc3RhbmNlIiwicG9pbnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBRUQsT0FBT0EsY0FBYywrQkFBK0I7QUFDcEQsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsZ0NBQWdDLGdEQUFnRDtBQUN2RixPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxpQkFBaUIsdUNBQXVDO0FBQy9ELE9BQU9DLGVBQWUscUNBQXFDO0FBRTNELE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELFNBQVNDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxrQkFBa0IsRUFBaUJDLE9BQU8sUUFBc0MsZ0JBQWdCO0FBRXhILFlBQVk7QUFDWiwwR0FBMEc7QUFDMUcsTUFBTUMsMkJBQTJCO0FBbUNqQyxJQUFBLEFBQU1DLGdCQUFOLE1BQU1BO0lBbU1KOztHQUVDLEdBQ0QsQUFBUUMsVUFBV0MsT0FBZ0IsRUFBOEI7UUFDL0QsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElBQUksSUFBSSxDQUFDQyxRQUFRLENBQUNDLE1BQU0sRUFBRUYsSUFBTTtZQUMvQyxJQUFLLElBQUksQ0FBQ0MsUUFBUSxDQUFFRCxFQUFHLENBQUNELE9BQU8sS0FBS0EsU0FBVTtnQkFDNUMsT0FBTyxJQUFJLENBQUNFLFFBQVEsQ0FBRUQsRUFBRztZQUMz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