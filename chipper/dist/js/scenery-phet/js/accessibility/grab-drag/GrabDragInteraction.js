// Copyright 2018-2024, University of Colorado Boulder
import Disposable from '../../../../axon/js/Disposable.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
/**
 * The main interaction for grabbing and dragging an object through the PDOM and assistive technology. It works by
 * taking in a Node to augment with the PDOM interaction. In fact it works much like a mixin. In general, this type
 * will mutate the accessible content (PDOM) of the passed in Node, toggling
 * between an "idle" state and a "grabbed" state. When each state changes, the underlying PDOM element and general
 * interaction does as well.
 *
 * To accomplish this there are options to be filled in that keep track of the scenery inputListeners for each state,
 * as well as options to mutate the Node for each state. By default the idle is a `button` with a containing  `div`,
 * and the grabbed state is a focusable `div` with an "application" aria role. It is up to the client to supply a
 * KeyboardDragListener as an arg that will be added to the Node in the "grabbed" state.
 *
 * As a note on terminology, mostly things are referred to by their current "interaction state" which is either "idle"
 * or "grabbed".
 *
 * This type will alert when the grabbed state is released, but no default alert is provided when the object is grabbed.
 * This is because in usages so far, that alert has been custom, context specific, and easier to just supply through
 * the onGrab callback option.
 *
 * NOTE: You SHOULD NOT add listeners directly to the Node where it is constructed, instead see
 * `options.listenersWhileIdle/Grabbed`. These will keep track of the listeners for each interaction state, and
 * will set them accordingly. In rare cases it may be desirable to have a listener attached no matter the state, but that
 * has not come up so far.
 *
 * NOTE: There is no "undo" for a mutate call, so it is the client's job to make sure that idle/grabbedStateOptions objects
 * appropriately "cancel" out the other. The same goes for any alterations that are done on `onGrab` and `onRelease`
 * callbacks.
 *
 * NOTE: problems may occur if you change the focusHighlight or interactiveHighlight of the Node passed in after
 * creating this type.
 *
 * NOTE: focusHighlightLayerable and interactiveHighlightLayerable is finicky with this type. In order to support
 * it, you must have set the focusHighlight or interactiveHighlight to the wrappedNode and added the focusHighlight
 * to the scene graph before calling this type's constructor.
 *
 * NOTE on positioning the grab "cue" Node: transforming the wrappedNode after creating this type will not update the
 * layout of the grabCueNode. This is because the cue Node is a child of the focus highlight. As a
 * result, currently you must correctly position node before the cue Node is created.
 *
 * NOTE: upon "activation" of this type, meaning that the user grabs the object and it turns into a grabbed, the
 * wrappedNode is blurred and refocused. This means that the input event "blur()" set in listenersWhileIdle will
 * not just fire when navigating through the sim, but also upon activation. This weirdness is to make sure that the
 * input event "focus()" is called and supported for within listenersWhileGrabbed
 *
 * NOTE: For PhET-iO instrumentation, GrabDragInteraction.enabledProperty is phetioReadOnly, it makes the most sense
 * to link to whatever Node control's the mouse/touch input and toggle grab drag enabled when that Node's inputEnabled
 * changes. For example see Friction.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import assertHasProperties from '../../../../phet-core/js/assertHasProperties.js';
import getGlobal from '../../../../phet-core/js/getGlobal.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { DragListener, HighlightFromNode, HighlightPath, isInteractiveHighlighting, isVoicing, KeyboardDragDirectionToKeyStringPropertiesMap, KeyboardListener, MatrixBetweenProperty, Node, PDOMPeer, Voicing } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import AriaLiveAnnouncer from '../../../../utterance-queue/js/AriaLiveAnnouncer.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import GrabReleaseCueNode from '../nodes/GrabReleaseCueNode.js';
import GrabDragModel from './GrabDragModel.js';
import GrabDragUsageTracker from './GrabDragUsageTracker.js';
// constants
const grabPatternStringStringProperty = SceneryPhetStrings.a11y.grabDrag.grabPatternStringProperty;
const gestureHelpTextPatternStringProperty = SceneryPhetStrings.a11y.grabDrag.gestureHelpTextPatternStringProperty;
const movableStringProperty = SceneryPhetStrings.a11y.grabDrag.movableStringProperty;
const buttonStringProperty = SceneryPhetStrings.a11y.grabDrag.buttonStringProperty;
const defaultObjectToGrabStringProperty = SceneryPhetStrings.a11y.grabDrag.defaultObjectToGrabStringProperty;
const releasedStringProperty = SceneryPhetStrings.a11y.grabDrag.releasedStringProperty;
let GrabDragInteraction = class GrabDragInteraction extends Disposable {
    /**
   * Sets the name to be used when in the "grabbed" state. If already grabbed, the name is set to the target Node right away.
   */ setGrabbedStateAccessibleName(name) {
        this._grabbedStateAccessibleName = name;
        this.grabbedStateOptions.innerContent = this._grabbedStateAccessibleName;
        this.grabbedStateOptions.ariaLabel = this._grabbedStateAccessibleName;
        // If grabbed, mutate the Node with these options right away
        if (this.grabDragModel.interactionStateProperty.value === 'grabbed') {
            this.node.mutate(this.grabbedStateOptions);
        }
    }
    set grabbedStateAccessibleName(name) {
        this.setGrabbedStateAccessibleName(name);
    }
    /**
   * Sets the name to be used when in the "idle" state. If already idle, the name is set to the target Node right away.
   * @param name
   */ setIdleStateAccessibleName(name) {
        this._idleStateAccessibleName = name;
        this.idleStateOptions.innerContent = this._idleStateAccessibleName;
        // Setting the aria-label on the interactionState element fixes a bug with VoiceOver in Safari where the aria role
        // from the grabbed state is never cleared, see https://github.com/phetsims/scenery-phet/issues/688
        this.idleStateOptions.ariaLabel = this._idleStateAccessibleName;
        // if idle, mutate the Node with these options right away
        if (this.grabDragModel.interactionStateProperty.value === 'idle') {
            this.node.mutate(this.idleStateOptions);
        }
    }
    set idleStateAccessibleName(name) {
        this.setIdleStateAccessibleName(name);
    }
    /**
   * Set the help text for keboard input. If the runtime supports "gesture description" this is a no-op.
   */ setKeyboardHelpText(text) {
        this._keyboardHelpText = text;
        if (!this.supportsGestureDescription) {
            this.node.descriptionContent = text;
        }
    }
    getKeyboardHelpText() {
        return this._keyboardHelpText;
    }
    set keyboardHelpText(text) {
        this.setKeyboardHelpText(text);
    }
    get keyboardHelpText() {
        return this.getKeyboardHelpText();
    }
    /**
   * Set the help text for gesture input. If the runtime does not support "gesture description" this is a no-op.
   */ setGestureHelpText(text) {
        this._gestureHelpText = text;
        if (this.supportsGestureDescription) {
            this.node.descriptionContent = text;
        }
    }
    getGestureHelpText() {
        return this._gestureHelpText;
    }
    set gestureHelpText(text) {
        this.setGestureHelpText(text);
    }
    get gestureHelpText() {
        return this._gestureHelpText;
    }
    /**
   * Set the callback that should be used when grabbed - called when switching from idle to grabbed state.
   */ setOnGrab(onGrab) {
        this._onGrab = onGrab;
    }
    getOnGrab() {
        return this._onGrab;
    }
    set onGrab(onGrab) {
        this.setOnGrab(onGrab);
    }
    get onGrab() {
        return this.getOnGrab();
    }
    /**
   * Set the callback that should be used when released - called when switching from grabbed to idle state.
   */ setOnRelease(onRelease) {
        this._onRelease = onRelease;
    }
    getOnRelease() {
        return this._onRelease;
    }
    set onRelease(onRelease) {
        this.setOnRelease(onRelease);
    }
    get onRelease() {
        return this.getOnRelease();
    }
    /**
   * Set the positions of the grabCueNode and dragCueNode relative to the target Node. The position is determined by
   * the CuePosition and the offsets.
   */ repositionCues(matrix) {
        if (matrix) {
            this.positionCueNode(matrix, this.grabCueNode, this.grabCuePosition, this.grabCueOffset);
            this.positionCueNode(matrix, this.dragCueNode, this.dragCuePosition, this.dragCueOffset);
        }
    }
    /**
   * Sets the position of the cueNode relative to the bounds in the parent coordinate frame, from
   * the provided position type and offsets.
   *
   * @param matrix - the transformation matrix from the local frame of the target Node to the local frame of the interactionCueParent
   * @param cueNode - the Node to position
   * @param position - the position of the cueNode relative to the bounds
   * @param offset - the offset of the cueNode relative to the position
   */ positionCueNode(matrix, cueNode, position, offset) {
        // The bounds for the Node may not be finite during construction.
        // Skip positioning if the cueNode is not shown for performance.
        if (!this.node.bounds.isFinite() || !cueNode.visible) {
            return;
        }
        let parentPointBoundsGetter;
        let cueNodePositionSetter;
        if (position === 'center') {
            parentPointBoundsGetter = 'center';
            cueNodePositionSetter = 'center';
        } else if (position === 'top') {
            parentPointBoundsGetter = 'centerTop';
            cueNodePositionSetter = 'centerBottom';
        } else if (position === 'bottom') {
            parentPointBoundsGetter = 'centerBottom';
            cueNodePositionSetter = 'centerTop';
        } else if (position === 'left') {
            parentPointBoundsGetter = 'leftCenter';
            cueNodePositionSetter = 'rightCenter';
        } else if (position === 'right') {
            parentPointBoundsGetter = 'rightCenter';
            cueNodePositionSetter = 'leftCenter';
        } else {
            assert && assert(false, `unknown position: ${position}`);
        }
        // @ts-expect-error - so a string can be used to access the Bounds2 field.
        const localPoint = this.node.parentToLocalPoint(this.node.bounds[parentPointBoundsGetter]);
        // @ts-expect-error - so a string can be used to access the Node setter.
        cueNode[cueNodePositionSetter] = matrix.timesVector2(localPoint).plusXY(offset.x, offset.y);
    }
    /**
   * Update the node to switch modalities between being grabbed, and idle. This function holds code that should
   * be called when switching from any state to any other state.
   */ updateFromState() {
        const interactionState = this.grabDragModel.interactionStateProperty.value;
        const listenersToRemove = interactionState === 'idle' ? this.listenersWhileGrabbed : this.listenersWhileIdle;
        // interrupt prior input, reset the key state of the drag handler by interrupting the drag. Don't interrupt all
        // input, but instead just those to be removed.
        listenersToRemove.forEach((listener)=>listener.interrupt && listener.interrupt());
        // remove all previous listeners from the node
        this.removeInputListeners(listenersToRemove);
        // To support gesture and mobile screen readers, we change the roledescription, see https://github.com/phetsims/scenery-phet/issues/536
        // By default, the idle gets a roledescription to force the AT to say its role. This fixes a bug in VoiceOver
        // where it fails to update the role after turning back into an idle.
        // See https://github.com/phetsims/scenery-phet/issues/688.
        this.node.setPDOMAttribute('aria-roledescription', interactionState === 'grabbed' || this.supportsGestureDescription ? movableStringProperty : buttonStringProperty);
        this.updateAriaDescribedby(interactionState);
        // update the PDOM of the node
        const nodeOptions = interactionState === 'idle' ? this.idleStateOptions : this.grabbedStateOptions;
        this.node.mutate(nodeOptions);
        assert && this.grabDragModel.enabledProperty.value && assert(this.node.focusable, 'GrabDragInteraction node must remain focusable after mutation');
        const listenersToAdd = interactionState === 'idle' ? this.listenersWhileIdle : this.listenersWhileGrabbed;
        this.addInputListeners(listenersToAdd);
        this.updateFocusHighlights();
        this.updateVisibilityForCues();
        assert && assert(this.grabDragModel.interactionStateProperty.value === interactionState, 'updating from state should not change the interaction state.');
    }
    updateAriaDescribedby(interactionState) {
        if (interactionState === 'idle' && this.shouldAddAriaDescribedby()) {
            // this node is aria-describedby its own description content, so that the description is read automatically
            // when found by the user
            !this.node.hasAriaDescribedbyAssociation(this.descriptionAssociationObject) && this.node.addAriaDescribedbyAssociation(this.descriptionAssociationObject);
        } else {
            // This node is aria-describedby its own description content only when idle, so that the description is
            // read automatically when found by the user with the virtual cursor. Remove it for grabbed
            if (this.node.hasAriaDescribedbyAssociation(this.descriptionAssociationObject)) {
                this.node.removeAriaDescribedbyAssociation(this.descriptionAssociationObject);
            }
        }
    }
    /**
   * Update the focusHighlights according to if we are in idle or grabbed state
   * No need to set visibility to true, because that will happen for us by HighlightOverlay on focus.
   */ updateFocusHighlights() {
        this.grabDragFocusHighlight.setDashed(this.grabDragModel.interactionStateProperty.value === 'grabbed');
        this.grabDragInteractiveHighlight.setDashed(this.grabDragModel.interactionStateProperty.value === 'grabbed');
    }
    /**
   * Update the visibility of the cues for both idle and grabbed states.
   */ updateVisibilityForCues() {
        const wasDragCueVisible = this.dragCueNode.visible;
        const wasGrabCueVisible = this.grabCueNode.visible;
        this.dragCueNode.visible = this.grabDragModel.enabled && this.grabDragModel.interactionStateProperty.value === 'grabbed' && this.node.focused && this.shouldShowDragCueNode();
        this.grabCueNode.visible = this.grabDragModel.enabled && this.grabDragModel.interactionStateProperty.value === 'idle' && this.node.focused && this.shouldShowGrabCueNode();
        // If visibility of either has changed, reposition the cues. For performance, the cues are only repositioned
        // while they are shown.
        if (wasDragCueVisible !== this.dragCueNode.visible || wasGrabCueVisible !== this.grabCueNode.visible) {
            this.repositionCues(this.matrixBetweenProperty.value);
        }
    }
    /**
   * Add all listeners to node
   */ addInputListeners(listeners) {
        for(let i = 0; i < listeners.length; i++){
            this.node.addInputListener(listeners[i]);
        }
    }
    /**
   * Remove all listeners from the node. Called from dispose, so it is nice to be graceful.
   */ removeInputListeners(listeners) {
        for(let i = 0; i < listeners.length; i++){
            const listener = listeners[i];
            if (this.node.hasInputListener(listener)) {
                this.node.removeInputListener(listener);
            }
        }
    }
    /**
   * Interrupt the grab drag interraction - interrupts any listeners attached and makes sure the
   * Node is back in its "idle" state.
   */ interrupt() {
        // Interrupting this listener will set us back to idle
        this.pressReleaseListener.interrupt();
        assert && assert(this.grabDragModel.interactionStateProperty.value === 'idle', 'disabled grabDragInteractions must be in "idle" state.');
    }
    /**
   * Often onGrab callbacks need to know whether the grab was triggered from keyboard/pdom, in which case it should
   * trigger description, OR triggered via mouse/touch which may not trigger description because another listener may
   * be responsible.
   */ isInputFromMouseOrTouch() {
        return this.pressReleaseListener.isPressed;
    }
    wireUpDescriptionAndVoicingResponses(node) {
        // "released" alerts are assertive so that a pile up of alerts doesn't happen with rapid movement, see
        // https://github.com/phetsims/balloons-and-static-electricity/issues/491
        const releasedUtterance = new Utterance({
            alert: new ResponsePacket({
                objectResponse: releasedStringProperty
            }),
            // This was being obscured by other messages, the priority helps make sure it is heard, see https://github.com/phetsims/friction/issues/325
            priority: Utterance.MEDIUM_PRIORITY,
            announcerOptions: {
                ariaLivePriority: AriaLiveAnnouncer.AriaLive.ASSERTIVE // for AriaLiveAnnouncer
            }
        });
        this.disposeEmitter.addListener(()=>releasedUtterance.dispose());
        if (isVoicing(node)) {
            assert && assert(node.voicingFocusListener === node.defaultFocusListener, 'GrabDragInteraction sets its own voicingFocusListener.');
            // sanity check on the voicing interface API.
            assertHasProperties(node, [
                'voicingFocusListener'
            ]);
            const voicingFocusUtterance = new Utterance({
                alert: new ResponsePacket(),
                announcerOptions: {
                    cancelOther: false
                }
            });
            this.disposeEmitter.addListener(()=>voicingFocusUtterance.dispose());
            node.voicingFocusListener = ()=>{
                // When swapping from interactionState to grabbed, the grabbed element will be focused, ignore that case here, see https://github.com/phetsims/friction/issues/213
                this.grabDragModel.interactionStateProperty.value === 'idle' && node.defaultFocusListener();
            };
            // These Utterances should only be announced if the Node is globally visible and voicingVisible.
            Voicing.registerUtteranceToVoicingNode(releasedUtterance, node);
            Voicing.registerUtteranceToVoicingNode(voicingFocusUtterance, node);
            this.onGrabButtonFocusEmitter.addListener(()=>{
                if (this.grabDragModel.enabled && this.shouldShowGrabCueNode()) {
                    const alert = voicingFocusUtterance.alert;
                    alert.hintResponse = SceneryPhetStrings.a11y.grabDrag.spaceToGrabOrReleaseStringProperty;
                    Voicing.alertUtterance(voicingFocusUtterance);
                }
            });
            this.grabDragModel.resetEmitter.addListener(()=>voicingFocusUtterance.reset());
        }
        // When released, we want description and voicing to say so.
        this.grabDragModel.releasedEmitter.addListener(()=>{
            this.node.alertDescriptionUtterance(releasedUtterance);
            isVoicing(node) && Voicing.alertUtterance(releasedUtterance);
        });
    }
    /**
   * Reset to initial state
   */ reset() {
        this.grabDragModel.reset();
    }
    get enabledProperty() {
        return this.grabDragModel.enabledProperty;
    }
    get enabled() {
        return this.grabDragModel.enabled;
    }
    set enabled(enabled) {
        this.grabDragModel.enabledProperty.value = enabled;
    }
    /**
   * @param node - will be mutated with a11y options to have the grab/drag functionality in the PDOM
   * @param keyboardDragListener - added to the Node when it is grabbed
   * @param interactionCueParent - a parent Node for the grabCueNode and dragCueNode
   * @param providedOptions
   */ constructor(node, keyboardDragListener, interactionCueParent, providedOptions){
        const ownsEnabledProperty = !providedOptions || !providedOptions.enabledProperty;
        // Options filled in the second optionize pass are ommitted from the self options of first pass.
        const firstPassOptions = optionize()({
            objectToGrabString: defaultObjectToGrabStringProperty,
            idleStateAccessibleName: null,
            onGrab: _.noop,
            onRelease: _.noop,
            idleStateOptions: {},
            grabCueOptions: {},
            grabCuePosition: 'bottom',
            dragCuePosition: 'center',
            grabCueOffset: new Vector2(0, 0),
            dragCueOffset: new Vector2(0, 0),
            transformNodeToTrack: node,
            grabbedStateOptions: {},
            dragCueNode: new Node(),
            listenersWhileGrabbed: [],
            listenersWhileIdle: [],
            supportsGestureDescription: getGlobal('phet.joist.sim.supportsGestureDescription'),
            keyboardHelpText: null,
            shouldShowGrabCueNode: ()=>{
                return this.grabDragModel.grabDragUsageTracker.numberOfKeyboardGrabs < 1 && node.inputEnabled;
            },
            shouldShowDragCueNode: ()=>{
                return this.grabDragModel.grabDragUsageTracker.shouldShowDragCue;
            },
            // EnabledComponent
            phetioEnabledPropertyInstrumented: true,
            enabledPropertyOptions: {
                // It is best to wire up grab drag enabled to be in sync with mouse/touch inputEnabled (instead of having both
                // editable by PhET-iO).
                phetioReadOnly: true,
                phetioFeatured: false
            },
            grabDragUsageTracker: new GrabDragUsageTracker(),
            // For instrumenting (DragListener is also Tandem.REQUIRED)
            tandem: Tandem.REQUIRED
        }, providedOptions);
        // a second block for options that use other options, therefore needing the defaults to be filled in
        const options = optionize()({
            gestureHelpText: StringUtils.fillIn(gestureHelpTextPatternStringProperty, {
                objectToGrab: firstPassOptions.objectToGrabString
            }),
            shouldAddAriaDescribedby: ()=>firstPassOptions.supportsGestureDescription && firstPassOptions.grabDragUsageTracker.numberOfGrabs < 2
        }, firstPassOptions);
        assert && assert(options.grabCueOptions.visible === undefined, 'Should not set visibility of the cue node');
        assert && assert(!options.listenersWhileGrabbed.includes(keyboardDragListener), 'GrabDragInteraction adds the KeyboardDragListener to listenersWhileGrabbed');
        assert && assert(!options.dragCueNode.parent, 'GrabDragInteraction adds dragCueNode to focusHighlight');
        assert && assert(options.dragCueNode.visible, 'dragCueNode should be visible to begin with');
        // Options are passed to the model directly, so Disposable options will be handled over in the model type.
        super(), // The accessible name for the Node in its 'grabbed' interactionState.
        this._grabbedStateAccessibleName = '', // The accessible name for the Node in its "idle" interactionState.
        this._idleStateAccessibleName = '', this._keyboardHelpText = '', this._gestureHelpText = '', // Created as a hook to provide logic to voicing code in a modular way. Called when the idle-state button is focused.
        this.onGrabButtonFocusEmitter = new Emitter();
        options.grabbedStateOptions = combineOptions({
            tagName: 'div',
            ariaRole: 'application',
            focusable: true,
            // to cancel out "idle" state options
            containerTagName: null
        }, options.grabbedStateOptions);
        options.idleStateOptions = combineOptions({
            containerTagName: 'div',
            focusable: true,
            ariaRole: null,
            tagName: 'button',
            // in general, the help text is after the component in the PDOM
            appendDescription: true,
            // position the PDOM elements when idle for drag and drop on touch-based screen readers
            positionInPDOM: true,
            accessibleName: null
        }, options.idleStateOptions);
        const defaultIdleStateAccessibleName = options.idleStateAccessibleName || // if a provided option
        (options.supportsGestureDescription ? options.objectToGrabString : StringUtils.fillIn(grabPatternStringStringProperty, {
            objectToGrab: options.objectToGrabString
        }));
        this.grabDragModel = new GrabDragModel(options.grabDragUsageTracker, options);
        this.node = node;
        this.idleStateOptions = options.idleStateOptions;
        this.grabbedStateOptions = options.grabbedStateOptions;
        this.dragCueNode = options.dragCueNode;
        this.grabCueNode = new GrabReleaseCueNode(options.grabCueOptions);
        this.shouldShowGrabCueNode = options.shouldShowGrabCueNode;
        this.shouldShowDragCueNode = options.shouldShowDragCueNode;
        this.shouldAddAriaDescribedby = options.shouldAddAriaDescribedby;
        this.supportsGestureDescription = options.supportsGestureDescription;
        this._onGrab = options.onGrab;
        this._onRelease = options.onRelease;
        this.grabCuePosition = options.grabCuePosition;
        this.dragCuePosition = options.dragCuePosition;
        this.grabCueOffset = options.grabCueOffset;
        this.dragCueOffset = options.dragCueOffset;
        this.setGrabbedStateAccessibleName(options.objectToGrabString);
        this.setIdleStateAccessibleName(defaultIdleStateAccessibleName);
        // set the help text, if provided - it will be associated with aria-describedby when in the "idle" interactionState
        this.node.descriptionContent = this.supportsGestureDescription ? options.gestureHelpText : options.keyboardHelpText;
        // The aria-describedby association object that will associate "idle" interactionState with its help text so that it is
        // read automatically when the user finds it. This reference is saved so that the association can be removed
        // when the node becomes a "grabbed"
        this.descriptionAssociationObject = {
            otherNode: this.node,
            thisElementName: PDOMPeer.PRIMARY_SIBLING,
            otherElementName: PDOMPeer.DESCRIPTION_SIBLING
        };
        this.wireUpDescriptionAndVoicingResponses(node);
        this.grabDragModel.releasedEmitter.addListener(()=>{
            this.onRelease();
        });
        this.grabDragModel.grabbedEmitter.addListener(()=>this.onGrab());
        // assertions confirm this type cast below
        const nodeFocusHighlight = node.focusHighlight;
        assert && nodeFocusHighlight && assert(nodeFocusHighlight instanceof HighlightPath, 'if provided, focusHighlight must be a Path to get a Shape and make dashed');
        assert && isInteractiveHighlighting(node) && node.interactiveHighlight && assert(node.interactiveHighlight instanceof HighlightPath, 'if provided, interactiveHighlight must be a Path to get a Shape and make dashed');
        if (node.focusHighlightLayerable) {
            assert && assert(nodeFocusHighlight, 'if focusHighlightLayerable, the highlight must be set to the node before constructing the grab/drag interaction.');
            assert && assert(nodeFocusHighlight.parent, 'if focusHighlightLayerable, the highlight must be added to the scene graph before grab/drag construction.');
        }
        if (isInteractiveHighlighting(node) && node.interactiveHighlightLayerable) {
            assert && assert(node.interactiveHighlight, 'An interactive highlight must be set to the Node before construction when using interactiveHighlightLayerable');
            assert && assert(node.interactiveHighlight.parent, 'if interactiveHighlightLayerable, the highlight must be added to the scene graph before construction');
        }
        // Take highlights from the node for the grab/drag interaction. The Interactive Highlights cannot fall back to
        // the default focus highlights because GrabDragInteraction adds "grab cue" Nodes as children
        // to the focus highlights that should not be displayed when using Interactive Highlights.
        const ownsFocusHighlight = !node.focusHighlightLayerable;
        this.grabDragFocusHighlight = !ownsFocusHighlight ? nodeFocusHighlight : nodeFocusHighlight ? new HighlightPath(nodeFocusHighlight.shapeProperty) : new HighlightFromNode(node);
        const ownsInteractiveHighlight = !(isInteractiveHighlighting(node) && node.interactiveHighlightLayerable);
        this.grabDragInteractiveHighlight = !ownsInteractiveHighlight ? node.interactiveHighlight : isInteractiveHighlighting(node) && node.interactiveHighlight ? new HighlightPath(node.interactiveHighlight.shapeProperty) : new HighlightPath(this.grabDragFocusHighlight.shapeProperty);
        node.focusHighlight = this.grabDragFocusHighlight;
        isInteractiveHighlighting(node) && node.setInteractiveHighlight(this.grabDragInteractiveHighlight);
        interactionCueParent.addChild(this.dragCueNode);
        interactionCueParent.addChild(this.grabCueNode);
        // A matrix between the local frame of the target Node and the local frame of the interactionCueParent.
        this.matrixBetweenProperty = new MatrixBetweenProperty(options.transformNodeToTrack, interactionCueParent, {
            // Use the local coordinate frame so that the Property observes transform changes up to and including
            // the target Node.
            fromCoordinateFrame: 'local',
            toCoordinateFrame: 'local'
        });
        const repositionCuesListener = this.repositionCues.bind(this);
        this.matrixBetweenProperty.link(repositionCuesListener);
        // Some key presses can fire the node's click (the grab button) from the same press that fires the keydown from
        // the grabbed state, so guard against that.
        let guardGrabKeyPressFromGrabbedState = false;
        // when the "Grab {{thing}}" button is pressed, focus the grabbed node and set to dragged state
        const grabButtonListener = {
            click: ()=>{
                // don't turn to grabbed on mobile a11y, it is the wrong gesture - user should press down and hold
                // to initiate a drag
                if (this.supportsGestureDescription || !this.grabDragModel.enabled) {
                    return;
                }
                // if the grabbed node was just released, don't pick it up again until the next click event so we don't "loop"
                // and pick it up immediately again.
                if (guardGrabKeyPressFromGrabbedState) {
                    // allow grab the node on the next click event
                    guardGrabKeyPressFromGrabbedState = false;
                    return;
                }
                // blur as an idle so that we get a new focus event after we turn into a grabbed, and so that grab listeners get a blur() event before mutating.
                this.node.blur();
                this.grabDragModel.keyboardGrab(()=>{
                    // focus after the transition so that listeners added to the grabbed state get a focus event().
                    this.node.focus();
                });
            },
            focus: ()=>{
                this.updateVisibilityForCues();
                this.onGrabButtonFocusEmitter.emit();
            },
            blur: ()=>this.updateVisibilityForCues()
        };
        // Keep track of all listeners to swap out grab/drag functionalities.
        this.listenersWhileIdle = options.listenersWhileIdle.concat(grabButtonListener);
        const dragDivDownListener = new KeyboardListener({
            keys: [
                'enter'
            ],
            fire: ()=>{
                // set a guard to make sure the key press from enter doesn't fire future listeners, therefore
                // "clicking" the grab button also on this key press.
                // The sequence that dispatched this fire also dispatches a click event, so we must avoid immediately grabbing
                // from this event that released
                guardGrabKeyPressFromGrabbedState = true;
                this.grabDragModel.release();
            }
        });
        const dragDivUpListener = new KeyboardListener({
            keys: [
                'space',
                'escape'
            ],
            // For the release action, it is more typical to fire it when the key is released.
            fireOnDown: false,
            fire: ()=>{
                // Release on keyup for spacebar so that we don't pick up the grabbed node again when we release the spacebar
                // and trigger a click event - escape could be added to either keyup or keydown listeners
                this.grabDragModel.release();
            },
            // release when focus is lost
            blur: ()=>this.grabDragModel.release(),
            // if successfully dragged, then make the cue node invisible
            focus: ()=>this.updateVisibilityForCues()
        });
        // Update the visibility of dragging cues whenever keyboard dragging keys release (keyup), bug fix for https://github.com/phetsims/scenery-phet/issues/868
        const dragDivDraggedListener = new KeyboardListener({
            // All possible dragging keys will fire this.
            keyStringProperties: KeyboardDragDirectionToKeyStringPropertiesMap.get('both'),
            fireOnDown: false,
            fire: ()=>this.updateVisibilityForCues(),
            // These options simulate PressListener's attach:false option, and will ensure this doesn't disrupt other keys
            override: false,
            allowOverlap: true
        });
        this.listenersWhileGrabbed = options.listenersWhileGrabbed.concat([
            dragDivDownListener,
            dragDivUpListener,
            dragDivDraggedListener,
            keyboardDragListener
        ]);
        this.pressReleaseListener = new DragListener({
            press: (event)=>{
                if (!event.isFromPDOM()) {
                    this.grabDragModel.grab();
                }
            },
            release: (event)=>{
                // If the event is null, then we are in the interrupt case, and should attempt to release()
                // If the release is an event from the PDOM (which shouldn't happen most of the time), then PDOM listeners will
                // handle the release().
                const shouldRelease = event === null || !event.isFromPDOM();
                // release if interrupted, but only if not already idle, which is possible if the GrabDragInteraction
                // has been reset since press
                if (shouldRelease && this.grabDragModel.interactionStateProperty.value === 'grabbed') {
                    this.grabDragModel.release();
                }
            },
            // this listener shouldn't prevent the behavior of other listeners, and this listener should always fire
            // whether the pointer is already attached
            attach: false,
            enabledProperty: this.grabDragModel.enabledProperty,
            tandem: options.tandem.createTandem('pressReleaseListener')
        });
        this.node.addInputListener(this.pressReleaseListener);
        assert && assert(this.grabDragModel.interactionStateProperty.value === 'idle', 'starting state idle please');
        // Update the interaction, pdom, focus, etc when the state changes.
        this.grabDragModel.interactionStateProperty.link(()=>this.updateFromState());
        this.grabDragModel.enabledProperty.lazyLink((enabled)=>{
            if (!enabled) {
                this.interrupt(); // This will trigger state change to idle via DragListener.release()
            }
            this.updateVisibilityForCues();
        });
        const inputEnabledListener = (nodeInputEnabled)=>{
            this.grabDragModel.enabled = nodeInputEnabled;
        };
        // Use the "owns" pattern here to keep the enabledProperty PhET-iO instrumented based on the super options.
        // If the client specified their own enabledProperty, then they are responsible for managing enabled.
        ownsEnabledProperty && this.node.inputEnabledProperty.lazyLink(inputEnabledListener);
        this.grabDragModel.resetEmitter.addListener(()=>this.updateVisibilityForCues());
        // Hide the drag cue when there has been a successful pickup.
        const keyboardPressedListener = (isPressed)=>{
            if (isPressed) {
                this.grabDragModel.grabDragUsageTracker.shouldShowDragCue = false;
            }
        };
        keyboardDragListener.isPressedProperty.link(keyboardPressedListener);
        this.disposeEmitter.addListener(()=>{
            this.node.removeInputListener(this.pressReleaseListener);
            ownsEnabledProperty && this.node.inputEnabledProperty.unlink(inputEnabledListener);
            this.node.removePDOMAttribute('aria-roledescription');
            // Remove listeners (gracefully)
            this.removeInputListeners(this.listenersWhileIdle);
            this.removeInputListeners(this.listenersWhileGrabbed);
            interactionCueParent.removeChild(this.dragCueNode);
            interactionCueParent.removeChild(this.grabCueNode);
            this.matrixBetweenProperty.unlink(repositionCuesListener);
            this.matrixBetweenProperty.dispose();
            keyboardDragListener.isPressedProperty.unlink(keyboardPressedListener);
            dragDivDownListener.dispose();
            dragDivUpListener.dispose();
            dragDivDraggedListener.dispose();
            this.pressReleaseListener.dispose();
            this.onGrabButtonFocusEmitter.dispose();
            // Focus and cue disposal
            if (ownsFocusHighlight) {
                // Assume the GrabDragInteraction was the primary/sole reason for highlighting, do not try to fall back to a prior highlight
                this.node.focusHighlight = null;
                this.grabDragFocusHighlight.dispose();
            }
            if (ownsInteractiveHighlight) {
                isInteractiveHighlighting(node) && node.setInteractiveHighlight(null);
                this.grabDragInteractiveHighlight.dispose();
            }
            this.grabCueNode.dispose();
            this.dragCueNode.detach();
            this.grabDragModel.dispose();
        });
    }
};
// Options that can be forwarded to the target Node when the state changes. Fields that are set by the implementation
// of GrabDragInteraction are omitted.
// type StateOptions = StrictOmit<ParallelDOMOptions, 'descriptionContent' | 'helpText' | 'descriptionTagName' | 'accessibleName' | 'innerContent' | 'ariaLabel'>;
export { GrabDragInteraction as default };
sceneryPhet.register('GrabDragInteraction', GrabDragInteraction);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2dyYWItZHJhZy9HcmFiRHJhZ0ludGVyYWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgRGlzcG9zYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rpc3Bvc2FibGUuanMnO1xuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuLyoqXG4gKiBUaGUgbWFpbiBpbnRlcmFjdGlvbiBmb3IgZ3JhYmJpbmcgYW5kIGRyYWdnaW5nIGFuIG9iamVjdCB0aHJvdWdoIHRoZSBQRE9NIGFuZCBhc3Npc3RpdmUgdGVjaG5vbG9neS4gSXQgd29ya3MgYnlcbiAqIHRha2luZyBpbiBhIE5vZGUgdG8gYXVnbWVudCB3aXRoIHRoZSBQRE9NIGludGVyYWN0aW9uLiBJbiBmYWN0IGl0IHdvcmtzIG11Y2ggbGlrZSBhIG1peGluLiBJbiBnZW5lcmFsLCB0aGlzIHR5cGVcbiAqIHdpbGwgbXV0YXRlIHRoZSBhY2Nlc3NpYmxlIGNvbnRlbnQgKFBET00pIG9mIHRoZSBwYXNzZWQgaW4gTm9kZSwgdG9nZ2xpbmdcbiAqIGJldHdlZW4gYW4gXCJpZGxlXCIgc3RhdGUgYW5kIGEgXCJncmFiYmVkXCIgc3RhdGUuIFdoZW4gZWFjaCBzdGF0ZSBjaGFuZ2VzLCB0aGUgdW5kZXJseWluZyBQRE9NIGVsZW1lbnQgYW5kIGdlbmVyYWxcbiAqIGludGVyYWN0aW9uIGRvZXMgYXMgd2VsbC5cbiAqXG4gKiBUbyBhY2NvbXBsaXNoIHRoaXMgdGhlcmUgYXJlIG9wdGlvbnMgdG8gYmUgZmlsbGVkIGluIHRoYXQga2VlcCB0cmFjayBvZiB0aGUgc2NlbmVyeSBpbnB1dExpc3RlbmVycyBmb3IgZWFjaCBzdGF0ZSxcbiAqIGFzIHdlbGwgYXMgb3B0aW9ucyB0byBtdXRhdGUgdGhlIE5vZGUgZm9yIGVhY2ggc3RhdGUuIEJ5IGRlZmF1bHQgdGhlIGlkbGUgaXMgYSBgYnV0dG9uYCB3aXRoIGEgY29udGFpbmluZyAgYGRpdmAsXG4gKiBhbmQgdGhlIGdyYWJiZWQgc3RhdGUgaXMgYSBmb2N1c2FibGUgYGRpdmAgd2l0aCBhbiBcImFwcGxpY2F0aW9uXCIgYXJpYSByb2xlLiBJdCBpcyB1cCB0byB0aGUgY2xpZW50IHRvIHN1cHBseSBhXG4gKiBLZXlib2FyZERyYWdMaXN0ZW5lciBhcyBhbiBhcmcgdGhhdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBOb2RlIGluIHRoZSBcImdyYWJiZWRcIiBzdGF0ZS5cbiAqXG4gKiBBcyBhIG5vdGUgb24gdGVybWlub2xvZ3ksIG1vc3RseSB0aGluZ3MgYXJlIHJlZmVycmVkIHRvIGJ5IHRoZWlyIGN1cnJlbnQgXCJpbnRlcmFjdGlvbiBzdGF0ZVwiIHdoaWNoIGlzIGVpdGhlciBcImlkbGVcIlxuICogb3IgXCJncmFiYmVkXCIuXG4gKlxuICogVGhpcyB0eXBlIHdpbGwgYWxlcnQgd2hlbiB0aGUgZ3JhYmJlZCBzdGF0ZSBpcyByZWxlYXNlZCwgYnV0IG5vIGRlZmF1bHQgYWxlcnQgaXMgcHJvdmlkZWQgd2hlbiB0aGUgb2JqZWN0IGlzIGdyYWJiZWQuXG4gKiBUaGlzIGlzIGJlY2F1c2UgaW4gdXNhZ2VzIHNvIGZhciwgdGhhdCBhbGVydCBoYXMgYmVlbiBjdXN0b20sIGNvbnRleHQgc3BlY2lmaWMsIGFuZCBlYXNpZXIgdG8ganVzdCBzdXBwbHkgdGhyb3VnaFxuICogdGhlIG9uR3JhYiBjYWxsYmFjayBvcHRpb24uXG4gKlxuICogTk9URTogWW91IFNIT1VMRCBOT1QgYWRkIGxpc3RlbmVycyBkaXJlY3RseSB0byB0aGUgTm9kZSB3aGVyZSBpdCBpcyBjb25zdHJ1Y3RlZCwgaW5zdGVhZCBzZWVcbiAqIGBvcHRpb25zLmxpc3RlbmVyc1doaWxlSWRsZS9HcmFiYmVkYC4gVGhlc2Ugd2lsbCBrZWVwIHRyYWNrIG9mIHRoZSBsaXN0ZW5lcnMgZm9yIGVhY2ggaW50ZXJhY3Rpb24gc3RhdGUsIGFuZFxuICogd2lsbCBzZXQgdGhlbSBhY2NvcmRpbmdseS4gSW4gcmFyZSBjYXNlcyBpdCBtYXkgYmUgZGVzaXJhYmxlIHRvIGhhdmUgYSBsaXN0ZW5lciBhdHRhY2hlZCBubyBtYXR0ZXIgdGhlIHN0YXRlLCBidXQgdGhhdFxuICogaGFzIG5vdCBjb21lIHVwIHNvIGZhci5cbiAqXG4gKiBOT1RFOiBUaGVyZSBpcyBubyBcInVuZG9cIiBmb3IgYSBtdXRhdGUgY2FsbCwgc28gaXQgaXMgdGhlIGNsaWVudCdzIGpvYiB0byBtYWtlIHN1cmUgdGhhdCBpZGxlL2dyYWJiZWRTdGF0ZU9wdGlvbnMgb2JqZWN0c1xuICogYXBwcm9wcmlhdGVseSBcImNhbmNlbFwiIG91dCB0aGUgb3RoZXIuIFRoZSBzYW1lIGdvZXMgZm9yIGFueSBhbHRlcmF0aW9ucyB0aGF0IGFyZSBkb25lIG9uIGBvbkdyYWJgIGFuZCBgb25SZWxlYXNlYFxuICogY2FsbGJhY2tzLlxuICpcbiAqIE5PVEU6IHByb2JsZW1zIG1heSBvY2N1ciBpZiB5b3UgY2hhbmdlIHRoZSBmb2N1c0hpZ2hsaWdodCBvciBpbnRlcmFjdGl2ZUhpZ2hsaWdodCBvZiB0aGUgTm9kZSBwYXNzZWQgaW4gYWZ0ZXJcbiAqIGNyZWF0aW5nIHRoaXMgdHlwZS5cbiAqXG4gKiBOT1RFOiBmb2N1c0hpZ2hsaWdodExheWVyYWJsZSBhbmQgaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUgaXMgZmluaWNreSB3aXRoIHRoaXMgdHlwZS4gSW4gb3JkZXIgdG8gc3VwcG9ydFxuICogaXQsIHlvdSBtdXN0IGhhdmUgc2V0IHRoZSBmb2N1c0hpZ2hsaWdodCBvciBpbnRlcmFjdGl2ZUhpZ2hsaWdodCB0byB0aGUgd3JhcHBlZE5vZGUgYW5kIGFkZGVkIHRoZSBmb2N1c0hpZ2hsaWdodFxuICogdG8gdGhlIHNjZW5lIGdyYXBoIGJlZm9yZSBjYWxsaW5nIHRoaXMgdHlwZSdzIGNvbnN0cnVjdG9yLlxuICpcbiAqIE5PVEUgb24gcG9zaXRpb25pbmcgdGhlIGdyYWIgXCJjdWVcIiBOb2RlOiB0cmFuc2Zvcm1pbmcgdGhlIHdyYXBwZWROb2RlIGFmdGVyIGNyZWF0aW5nIHRoaXMgdHlwZSB3aWxsIG5vdCB1cGRhdGUgdGhlXG4gKiBsYXlvdXQgb2YgdGhlIGdyYWJDdWVOb2RlLiBUaGlzIGlzIGJlY2F1c2UgdGhlIGN1ZSBOb2RlIGlzIGEgY2hpbGQgb2YgdGhlIGZvY3VzIGhpZ2hsaWdodC4gQXMgYVxuICogcmVzdWx0LCBjdXJyZW50bHkgeW91IG11c3QgY29ycmVjdGx5IHBvc2l0aW9uIG5vZGUgYmVmb3JlIHRoZSBjdWUgTm9kZSBpcyBjcmVhdGVkLlxuICpcbiAqIE5PVEU6IHVwb24gXCJhY3RpdmF0aW9uXCIgb2YgdGhpcyB0eXBlLCBtZWFuaW5nIHRoYXQgdGhlIHVzZXIgZ3JhYnMgdGhlIG9iamVjdCBhbmQgaXQgdHVybnMgaW50byBhIGdyYWJiZWQsIHRoZVxuICogd3JhcHBlZE5vZGUgaXMgYmx1cnJlZCBhbmQgcmVmb2N1c2VkLiBUaGlzIG1lYW5zIHRoYXQgdGhlIGlucHV0IGV2ZW50IFwiYmx1cigpXCIgc2V0IGluIGxpc3RlbmVyc1doaWxlSWRsZSB3aWxsXG4gKiBub3QganVzdCBmaXJlIHdoZW4gbmF2aWdhdGluZyB0aHJvdWdoIHRoZSBzaW0sIGJ1dCBhbHNvIHVwb24gYWN0aXZhdGlvbi4gVGhpcyB3ZWlyZG5lc3MgaXMgdG8gbWFrZSBzdXJlIHRoYXQgdGhlXG4gKiBpbnB1dCBldmVudCBcImZvY3VzKClcIiBpcyBjYWxsZWQgYW5kIHN1cHBvcnRlZCBmb3Igd2l0aGluIGxpc3RlbmVyc1doaWxlR3JhYmJlZFxuICpcbiAqIE5PVEU6IEZvciBQaEVULWlPIGluc3RydW1lbnRhdGlvbiwgR3JhYkRyYWdJbnRlcmFjdGlvbi5lbmFibGVkUHJvcGVydHkgaXMgcGhldGlvUmVhZE9ubHksIGl0IG1ha2VzIHRoZSBtb3N0IHNlbnNlXG4gKiB0byBsaW5rIHRvIHdoYXRldmVyIE5vZGUgY29udHJvbCdzIHRoZSBtb3VzZS90b3VjaCBpbnB1dCBhbmQgdG9nZ2xlIGdyYWIgZHJhZyBlbmFibGVkIHdoZW4gdGhhdCBOb2RlJ3MgaW5wdXRFbmFibGVkXG4gKiBjaGFuZ2VzLiBGb3IgZXhhbXBsZSBzZWUgRnJpY3Rpb24uXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5pbXBvcnQgYXNzZXJ0SGFzUHJvcGVydGllcyBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0SGFzUHJvcGVydGllcy5qcyc7XG5pbXBvcnQgZ2V0R2xvYmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9nZXRHbG9iYWwuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgeyBBc3NvY2lhdGlvbiwgRHJhZ0xpc3RlbmVyLCBIaWdobGlnaHRGcm9tTm9kZSwgSGlnaGxpZ2h0UGF0aCwgaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZywgaXNWb2ljaW5nLCBLZXlib2FyZERyYWdEaXJlY3Rpb25Ub0tleVN0cmluZ1Byb3BlcnRpZXNNYXAsIEtleWJvYXJkRHJhZ0xpc3RlbmVyLCBLZXlib2FyZExpc3RlbmVyLCBNYXRyaXhCZXR3ZWVuUHJvcGVydHksIE5vZGUsIE5vZGVPcHRpb25zLCBQYXJhbGxlbERPTU9wdGlvbnMsIFBET01QZWVyLCBQRE9NVmFsdWVUeXBlLCBUSW5wdXRMaXN0ZW5lciwgVm9pY2luZyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEFyaWFMaXZlQW5ub3VuY2VyIGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9BcmlhTGl2ZUFubm91bmNlci5qcyc7XG5pbXBvcnQgUmVzcG9uc2VQYWNrZXQgZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1Jlc3BvbnNlUGFja2V0LmpzJztcbmltcG9ydCBVdHRlcmFuY2UgZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi8uLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xuaW1wb3J0IEdyYWJSZWxlYXNlQ3VlTm9kZSBmcm9tICcuLi9ub2Rlcy9HcmFiUmVsZWFzZUN1ZU5vZGUuanMnO1xuaW1wb3J0IEdyYWJEcmFnTW9kZWwsIHsgR3JhYkRyYWdJbnRlcmFjdGlvblN0YXRlLCBHcmFiRHJhZ01vZGVsT3B0aW9ucyB9IGZyb20gJy4vR3JhYkRyYWdNb2RlbC5qcyc7XG5pbXBvcnQgR3JhYkRyYWdVc2FnZVRyYWNrZXIgZnJvbSAnLi9HcmFiRHJhZ1VzYWdlVHJhY2tlci5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgZ3JhYlBhdHRlcm5TdHJpbmdTdHJpbmdQcm9wZXJ0eSA9IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5LmdyYWJEcmFnLmdyYWJQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XG5jb25zdCBnZXN0dXJlSGVscFRleHRQYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5ncmFiRHJhZy5nZXN0dXJlSGVscFRleHRQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XG5jb25zdCBtb3ZhYmxlU3RyaW5nUHJvcGVydHkgPSBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5ncmFiRHJhZy5tb3ZhYmxlU3RyaW5nUHJvcGVydHk7XG5jb25zdCBidXR0b25TdHJpbmdQcm9wZXJ0eSA9IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5LmdyYWJEcmFnLmJ1dHRvblN0cmluZ1Byb3BlcnR5O1xuY29uc3QgZGVmYXVsdE9iamVjdFRvR3JhYlN0cmluZ1Byb3BlcnR5ID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuZ3JhYkRyYWcuZGVmYXVsdE9iamVjdFRvR3JhYlN0cmluZ1Byb3BlcnR5O1xuY29uc3QgcmVsZWFzZWRTdHJpbmdQcm9wZXJ0eSA9IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5LmdyYWJEcmFnLnJlbGVhc2VkU3RyaW5nUHJvcGVydHk7XG5cbi8vIFZhbGlkIHBvc2l0aW9ucyBmb3IgdGhlIGludGVyYWN0aW9uIGN1ZSBub2RlcyByZWxhdGl2ZSB0byB0aGUgdGFyZ2V0IE5vZGUuIEZvciB0b3AgYW5kIGJvdHRvbSwgdGhlIGN1ZSBpc1xuLy8gY2VudGVyZWQgaG9yaXpvbnRhbGx5LiBGb3IgbGVmdCBhbmQgcmlnaHQsIHRoZSBjdWUgaXMgY2VudGVyZWQgdmVydGljYWxseS5cbmV4cG9ydCB0eXBlIEN1ZVBvc2l0aW9uID0gJ2NlbnRlcicgfCAndG9wJyB8ICdib3R0b20nIHwgJ2xlZnQnIHwgJ3JpZ2h0JztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBBIHN0cmluZyB0aGF0IGlzIGZpbGxlZCBpbiB0byB0aGUgYXBwcm9wcmlhdGUgYnV0dG9uIGxhYmVsXG4gIG9iamVjdFRvR3JhYlN0cmluZz86IFBET01WYWx1ZVR5cGU7XG5cbiAgLy8gSWYgbm90IHByb3ZpZGVkLCBhIGRlZmF1bHQgd2lsbCBiZSBhcHBsaWVkLCBzZWUgdGhpcy5pZGxlU3RhdGVBY2Nlc3NpYmxlTmFtZS5cbiAgaWRsZVN0YXRlQWNjZXNzaWJsZU5hbWU/OiBQRE9NVmFsdWVUeXBlIHwgbnVsbDtcblxuICAvLyBDYWxsZWQgd2hlbiB0aGUgbm9kZSBpcyBcImdyYWJiZWRcIiAod2hlbiB0aGUgZ3JhYiBidXR0b24gZmlyZXMpOyBidXR0b24gLT4gZ3JhYmJlZC5cbiAgb25HcmFiPzogVm9pZEZ1bmN0aW9uO1xuXG4gIC8vIENhbGxlZCB3aGVuIHRoZSBub2RlIGlzIFwicmVsZWFzZWRcIiAod2hlbiB0aGUgZ3JhYmJlZCBzdGF0ZSBpcyBcImxldCBnb1wiKTsgZ3JhYmJlZCAtPiBidXR0b25cbiAgb25SZWxlYXNlPzogVm9pZEZ1bmN0aW9uO1xuXG4gIC8vIFBET00gb3B0aW9ucyBwYXNzZWQgdG8gdGhlIGlkbGUgY3JlYXRlZCBmb3IgdGhlIFBET00sIGZpbGxlZCBpbiB3aXRoIGRlZmF1bHRzIGJlbG93XG4gIGlkbGVTdGF0ZU9wdGlvbnM/OiBQYXJhbGxlbERPTU9wdGlvbnM7XG5cbiAgLy8gVG8gcGFzcyBpbiBvcHRpb25zIHRvIHRoZSBjdWUuIFRoaXMgaXMgYSBzY2VuZXJ5IE5vZGUgYW5kIHlvdSBjYW4gcGFzcyBpdCBvcHRpb25zIHN1cHBvcnRlZCBieVxuICAvLyB0aGF0IHR5cGUuIFdoZW4gcG9zaXRpb25pbmcgdGhpcyBub2RlLCBpdCBpcyBpbiB0aGUgdGFyZ2V0IE5vZGUncyBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS5cbiAgZ3JhYkN1ZU9wdGlvbnM/OiBOb2RlT3B0aW9ucztcblxuICAvLyBQb3NpdGlvbnMgZm9yIHRoZSBjdWUgbm9kZXMuXG4gIGdyYWJDdWVQb3NpdGlvbj86IEN1ZVBvc2l0aW9uO1xuICBkcmFnQ3VlUG9zaXRpb24/OiBDdWVQb3NpdGlvbjtcblxuICAvLyBPZmZzZXQgb2YgdGhlIGRyYWdDdWVOb2RlIHJlbGF0aXZlIHRvIHRoZSBDdWVQb3NpdGlvbiwgaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIG9mIHRoZSBpbnRlcmFjdGlvbiBjdWUgbm9kZS5cbiAgZ3JhYkN1ZU9mZnNldD86IFZlY3RvcjI7XG5cbiAgLy8gT2Zmc2V0IG9mIHRoZSBkcmFnQ3VlTm9kZSByZWxhdGl2ZSB0byB0aGUgQ3VlUG9zaXRpb24sIGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgaW50ZXJhY3Rpb24gY3VlIG5vZGUuXG4gIGRyYWdDdWVPZmZzZXQ/OiBWZWN0b3IyO1xuXG4gIC8vIFNvIHRoYXQgeW91IGNhbiBtb25pdG9yIGFueSBOb2RlIGZvciB0cmFuc2Zvcm0gY2hhbmdlcyBmb3IgcmVwb3NpdGluaW5nIGludGVyYWN0aW9uIGN1ZXMuIERlZmF1bHQgd2lsbCBiZSB0aGUgdGFyZ2V0IE5vZGUsIGJ1dFxuICAvLyB5b3UgY2FuIHByb3ZpZGUgYW5vdGhlci5cbiAgdHJhbnNmb3JtTm9kZVRvVHJhY2s/OiBOb2RlO1xuXG4gIC8vIE5vZGUgb3B0aW9ucyBwYXNzZWQgdG8gdGhlIGdyYWJiZWQgc3RhdGUgY3JlYXRlZCBmb3IgdGhlIFBET00sIGZpbGxlZCBpbiB3aXRoIGRlZmF1bHRzIGJlbG93XG4gIGdyYWJiZWRTdGF0ZU9wdGlvbnM/OiBOb2RlT3B0aW9ucztcblxuICAvLyBPcHRpb25hbCBub2RlIHRvIGN1ZSB0aGUgZHJhZyBpbnRlcmFjdGlvbiBvbmNlIHN1Y2Nlc3NmdWxseSB1cGRhdGVkLlxuICBkcmFnQ3VlTm9kZT86IE5vZGU7XG5cbiAgLy8gR3JhYkRyYWdJbnRlcmFjdGlvbiBzd2FwcyB0aGUgUERPTSBzdHJ1Y3R1cmUgZm9yIGEgZ2l2ZW4gbm9kZSBiZXR3ZWVuIGFuIGlkbGUgc3RhdGUsIGFuZFxuICAvLyBncmFiYmVkIG9uZS4gV2UgbmVlZCB0byBrZWVwIHRyYWNrIG9mIGFsbCBsaXN0ZW5lcnMgdGhhdCBuZWVkIHRvIGJlIGF0dGFjaGVkIHRvIGVhY2ggUERPTSBtYW5pZmVzdGF0aW9uLlxuICAvLyBOb3RlOiB3aGVuIHRoZXNlIGFyZSByZW1vdmVkIHdoaWxlIGNvbnZlcnRpbmcgdG8vZnJvbSBpZGxlL2dyYWJiZWQsIHRoZXkgYXJlIGludGVycnVwdGVkLiBPdGhlclxuICAvLyBsaXN0ZW5lcnMgdGhhdCBhcmUgYXR0YWNoZWQgdG8gdGhpcy5ub2RlIGJ1dCBhcmVuJ3QgaW4gdGhlc2UgbGlzdHMgd2lsbCBub3QgYmUgaW50ZXJydXB0ZWQuIFRoZSBpZGxlXG4gIC8vIHdpbGwgYmx1cigpIHdoZW4gYWN0aXZhdGVkIGZyb20gaWRsZSB0byBncmFiYmVkLiBUaGUgZ3JhYmJlZCBzdGF0ZSB3aWxsIGZvY3VzIHdoZW4gYWN0aXZhdGVkXG4gIC8vIGZyb20gaWRsZS5cbiAgbGlzdGVuZXJzV2hpbGVHcmFiYmVkPzogVElucHV0TGlzdGVuZXJbXTtcbiAgbGlzdGVuZXJzV2hpbGVJZGxlPzogVElucHV0TGlzdGVuZXJbXTtcblxuICAvLyBJZiB0aGlzIGluc3RhbmNlIHdpbGwgc3VwcG9ydCBzcGVjaWZpYyBnZXN0dXJlIGRlc2NyaXB0aW9uIGJlaGF2aW9yLlxuICBzdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbj86IGJvb2xlYW47XG5cbiAgLy8gQWRkIGFuIGFyaWEtZGVzY3JpYmVkYnkgbGluayBiZXR3ZWVuIHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nIGFuZCB0aGUgcHJpbWFyeSBzaWJsaW5nLCBvbmx5IHdoZW4gaWRsZS4gQnlcbiAgLy8gZGVmYXVsdCwgdGhpcyBpcyBvbmx5IGJlIGRvbmUgd2hlbiBzdXBwb3J0aW5nIGdlc3R1cmUgaW50ZXJhY3RpdmUgZGVzY3JpcHRpb24gYmVmb3JlIHR3byBzdWNjZXNzIGdyYWJzLlxuICBzaG91bGRBZGRBcmlhRGVzY3JpYmVkYnk/OiAoKSA9PiBib29sZWFuO1xuXG4gIC8vIEhlbHAgdGV4dCBpcyB0cmVhdGVkIGFzIHRoZSBzYW1lIGZvciB0aGUgaWRsZSBhbmQgZ3JhYmJlZCBpdGVtcywgYnV0IGlzIGRpZmZlcmVudCBiYXNlZCBvbiBpZiB0aGVcbiAgLy8gcnVudGltZSBpcyBzdXBwb3J0aW5nIGdlc3R1cmUgaW50ZXJhY3RpdmUgZGVzY3JpcHRpb24uIEV2ZW4gdGhvdWdoIFwidGVjaG5pY2FsbHlcIiB0aGVyZSBpcyBubyB3YXkgdG8gYWNjZXNzIHRoZVxuICAvLyBoZWxwIHRleHQgd2hlbiB0aGlzIE5vZGUgaXMgaW4gdGhlIGdyYWJiZWQgc3RhdGUsIHRoZSBoZWxwIHRleHQgaXMgc3RpbGwgaW4gdGhlIFBET00uXG4gIGtleWJvYXJkSGVscFRleHQ/OiBQRE9NVmFsdWVUeXBlIHwgbnVsbDtcblxuICAvLyBDb250cm9scyB3aGV0aGVyIG9yIG5vdCB0byBzaG93IHRoZSBcIkdyYWJcIiBjdWUgbm9kZSB0aGF0IGlzIGRpc3BsYXllZCBvbiBmb2N1cyAtIGJ5XG4gIC8vIGRlZmF1bHQgaXQgd2lsbCBiZSBzaG93biBvbiBmb2N1cyB1bnRpbCBpdCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgZ3JhYmJlZCB3aXRoIGEga2V5Ym9hcmRcbiAgc2hvdWxkU2hvd0dyYWJDdWVOb2RlPzogKCkgPT4gYm9vbGVhbjtcblxuICAvLyBXaGV0aGVyIG9yIG5vdCB0byBkaXNwbGF5IHRoZSBOb2RlIGZvciB0aGUgXCJEcmFnXCIgY3VlIG5vZGUgb25jZSB0aGUgaWRsZSBOb2RlIGhhcyBiZWVuIHBpY2tlZCB1cCxcbiAgLy8gaWYgYSBvcHRpb25zLmRyYWdDdWVOb2RlIGlzIHNwZWNpZmllZC4gVGhpcyB3aWxsIG9ubHkgYmUgc2hvd24gaWYgZ3JhYmJlZCBub2RlIGhhcyBmb2N1c1xuICAvLyBmcm9tIGFsdGVybmF0aXZlIGlucHV0XG4gIHNob3VsZFNob3dEcmFnQ3VlTm9kZT86ICgpID0+IGJvb2xlYW47XG5cbiAgLy8gTGlrZSBrZXlib2FyZEhlbHBUZXh0IGJ1dCB3aGVuIHN1cHBvcnRpbmcgZ2VzdHVyZSBpbnRlcmFjdGl2ZSBkZXNjcmlwdGlvbi5cbiAgZ2VzdHVyZUhlbHBUZXh0PzogUERPTVZhbHVlVHlwZSB8IG51bGw7XG5cbiAgLy8gRm9yIHNoYXJpbmcgdXNhZ2UgdHJhY2tpbmcgYmV0d2VlbiBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgR3JhYkRyYWdJbnRlcmFjdGlvbi4gRXZlbiBpZiBwcm92aWRlZCwgR3JhYkRyYWdJbnRlcmFjdGlvblxuICAvLyB3aWxsIHJlc2V0IHRoaXMuXG4gIGdyYWJEcmFnVXNhZ2VUcmFja2VyPzogR3JhYkRyYWdVc2FnZVRyYWNrZXI7XG59O1xuXG4vLyBQcm92aWRlIEdyYWJEcmFnTW9kZWxPcHRpb25zIGFzIHRvcCBsZXZlbCBvcHRpb25zLCBhbmQgdGhleSBhcmUgcGFzc2VkIGRpcmVjdGx5IHRvIHRoZSBtb2RlbC5cbnR5cGUgR3JhYkRyYWdJbnRlcmFjdGlvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEdyYWJEcmFnTW9kZWxPcHRpb25zO1xuXG4vLyBPcHRpb25zIHRoYXQgY2FuIGJlIGZvcndhcmRlZCB0byB0aGUgdGFyZ2V0IE5vZGUgd2hlbiB0aGUgc3RhdGUgY2hhbmdlcy4gRmllbGRzIHRoYXQgYXJlIHNldCBieSB0aGUgaW1wbGVtZW50YXRpb25cbi8vIG9mIEdyYWJEcmFnSW50ZXJhY3Rpb24gYXJlIG9taXR0ZWQuXG4vLyB0eXBlIFN0YXRlT3B0aW9ucyA9IFN0cmljdE9taXQ8UGFyYWxsZWxET01PcHRpb25zLCAnZGVzY3JpcHRpb25Db250ZW50JyB8ICdoZWxwVGV4dCcgfCAnZGVzY3JpcHRpb25UYWdOYW1lJyB8ICdhY2Nlc3NpYmxlTmFtZScgfCAnaW5uZXJDb250ZW50JyB8ICdhcmlhTGFiZWwnPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JhYkRyYWdJbnRlcmFjdGlvbiBleHRlbmRzIERpc3Bvc2FibGUge1xuXG4gIC8vIFRoZSBhY2Nlc3NpYmxlIG5hbWUgZm9yIHRoZSBOb2RlIGluIGl0cyAnZ3JhYmJlZCcgaW50ZXJhY3Rpb25TdGF0ZS5cbiAgcHJpdmF0ZSBfZ3JhYmJlZFN0YXRlQWNjZXNzaWJsZU5hbWU6IFBET01WYWx1ZVR5cGUgPSAnJztcblxuICAvLyBUaGUgYWNjZXNzaWJsZSBuYW1lIGZvciB0aGUgTm9kZSBpbiBpdHMgXCJpZGxlXCIgaW50ZXJhY3Rpb25TdGF0ZS5cbiAgcHJpdmF0ZSBfaWRsZVN0YXRlQWNjZXNzaWJsZU5hbWU6IFBET01WYWx1ZVR5cGUgPSAnJztcblxuICBwcml2YXRlIF9vbkdyYWI6IFZvaWRGdW5jdGlvbjtcbiAgcHJpdmF0ZSBfb25SZWxlYXNlOiBWb2lkRnVuY3Rpb247XG5cbiAgcHJpdmF0ZSBfa2V5Ym9hcmRIZWxwVGV4dDogUERPTVZhbHVlVHlwZSA9ICcnO1xuICBwcml2YXRlIF9nZXN0dXJlSGVscFRleHQ6IFBET01WYWx1ZVR5cGUgPSAnJztcblxuICAvLyBEaXJlY3RseSBmcm9tIG9wdGlvbnMgb3IgcGFyYW1ldGVycy5cbiAgcHJpdmF0ZSByZWFkb25seSBub2RlOiBOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IGlkbGVTdGF0ZU9wdGlvbnM6IFBhcmFsbGVsRE9NT3B0aW9ucztcbiAgcHJpdmF0ZSByZWFkb25seSBncmFiYmVkU3RhdGVPcHRpb25zOiBQYXJhbGxlbERPTU9wdGlvbnM7XG4gIHByaXZhdGUgcmVhZG9ubHkgZHJhZ0N1ZU5vZGU6IE5vZGU7XG5cbiAgLy8gcHVibGljIE9OTFkgdG8gcG9zaXRpb24gZHluYW1pY2FsbHkuIFByZWZlciBvcHRpb25zLmdyYWJDdWVPcHRpb25zIHdoZW4gcG9zc2libGUuXG4gIHB1YmxpYyByZWFkb25seSBncmFiQ3VlTm9kZTogR3JhYlJlbGVhc2VDdWVOb2RlO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgc2hvdWxkU2hvd0dyYWJDdWVOb2RlOiAoKSA9PiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IHNob3VsZFNob3dEcmFnQ3VlTm9kZTogKCkgPT4gYm9vbGVhbjtcblxuICAvLyBQcmVkaWNhdGUgdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGFyaWEgZGVzY3JpcHRpb24gc2hvdWxkIGJlIGFkZGVkLlxuICAvLyBUaGlzIG9uZSBpcyBiZXR0ZXIgYXMgYSBwcmVkaWNhdGUgcmF0aGVyIHRoYW4gYSBQcm9wZXJ0eSBzaW5jZSB3ZSBuZWVkIHRvIGNvbnRyb2wgaXRzIGNhbGwgdGltaW5nXG4gIHByaXZhdGUgcmVhZG9ubHkgc2hvdWxkQWRkQXJpYURlc2NyaWJlZGJ5OiAoKSA9PiBib29sZWFuO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgc3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb246IGJvb2xlYW47XG5cbiAgLy8gS2VlcCB0cmFjayBvZiBhbGwgbGlzdGVuZXJzIHRvIHN3YXAgb3V0IGdyYWIvZHJhZyBmdW5jdGlvbmFsaXRpZXNcbiAgcHJpdmF0ZSByZWFkb25seSBsaXN0ZW5lcnNXaGlsZUlkbGU6IFRJbnB1dExpc3RlbmVyW107XG4gIHByaXZhdGUgcmVhZG9ubHkgbGlzdGVuZXJzV2hpbGVHcmFiYmVkOiBUSW5wdXRMaXN0ZW5lcltdO1xuXG4gIC8vIE1vZGVsLXJlbGF0ZWQgc3RhdGUgb2YgdGhlIGN1cnJlbnQgYW5kIGdlbmVyYWwgaW5mbyBhYm91dCB0aGUgaW50ZXJhY3Rpb24uXG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JhYkRyYWdNb2RlbDogR3JhYkRyYWdNb2RlbDtcblxuICAvLyBUaGUgYXJpYS1kZXNjcmliZWRieSBhc3NvY2lhdGlvbiBvYmplY3QgdGhhdCB3aWxsIGFzc29jaWF0ZSBcImludGVyYWN0aW9uU3RhdGVcIiB3aXRoIGl0c1xuICAvLyBoZWxwIHRleHQgc28gdGhhdCBpdCBpcyByZWFkIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGUgdXNlciBmaW5kcyBpdC4gVGhpcyByZWZlcmVuY2UgaXMgc2F2ZWQgc28gdGhhdFxuICAvLyB0aGUgYXNzb2NpYXRpb24gY2FuIGJlIHJlbW92ZWQgd2hlbiB0aGUgbm9kZSBiZWNvbWVzIGEgXCJncmFiYmVkXCIuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVzY3JpcHRpb25Bc3NvY2lhdGlvbk9iamVjdDogQXNzb2NpYXRpb247XG5cbiAgLy8gQ3JlYXRlZCBhcyBhIGhvb2sgdG8gcHJvdmlkZSBsb2dpYyB0byB2b2ljaW5nIGNvZGUgaW4gYSBtb2R1bGFyIHdheS4gQ2FsbGVkIHdoZW4gdGhlIGlkbGUtc3RhdGUgYnV0dG9uIGlzIGZvY3VzZWQuXG4gIHByaXZhdGUgcmVhZG9ubHkgb25HcmFiQnV0dG9uRm9jdXNFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IGdyYWJEcmFnRm9jdXNIaWdobGlnaHQ6IEhpZ2hsaWdodFBhdGg7XG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JhYkRyYWdJbnRlcmFjdGl2ZUhpZ2hsaWdodDogSGlnaGxpZ2h0UGF0aDtcblxuICAvLyBGb3IgbW91c2UgYW5kIHRvdWNoIGV2ZW50cyAobm9uLVBET00gcG9pbnRlciBldmVudHMpLCBjaGFuZ2Ugc3RhdGUgYW5kIHJlcHJlc2VudGF0aW9ucyBpbiB0aGUgUERPTSAtIFRoaXMgaXNcbiAgLy8gaW1wb3J0YW50IHRvIHVwZGF0ZSBpbnRlcmFjdGl2ZSBoaWdobGlnaHRzLCBiZWNhdXNlIHRoZSBoaWdobGlnaHQgc2hvd2luZyB0aGUgc3RhdGUgY2FuIGJlIHNlZW4uIEl0IGlzIGFsc29cbiAgLy8gaW1wb3J0YW50IGZvciBBVCB0aGF0IHVzZSBwb2ludGVyIGV2ZW50cyBsaWtlIGlPUyBWb2ljZU92ZXIuXG4gIC8vIEEgRHJhZ0xpc3RlbmVyIGlzIHVzZWQgaW5zdGVhZCBvZiBhIFByZXNzTGlzdGVuZXIgdG8gd29yayB3aXRoIHRvdWNoU25hZy5cbiAgLy8gTm90ZSB0aGlzIGlzIE5PVCB0aGUgRHJhZ0xpc3RlbmVyIHRoYXQgaW1wbGVtZW50cyBkcmFnZ2luZyBvbiB0aGUgdGFyZ2V0LlxuICBwcml2YXRlIHJlYWRvbmx5IHByZXNzUmVsZWFzZUxpc3RlbmVyOiBEcmFnTGlzdGVuZXI7XG5cbiAgLy8gQSBtYXRyaXggdGhhdCB0cmFuc2Zvcm1zIGJldHdlZW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIHRhcmdldCBOb2RlIGFuZCB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGVcbiAgLy8gaW50ZXJhY3Rpb25DdWVQYXJlbnQuIFRoaXMgaXMgdXNlZCB0byBwb3NpdGlvbiB0aGUgZ3JhYkN1ZU5vZGUgYW5kIGRyYWdDdWVOb2RlXG4gIHByaXZhdGUgcmVhZG9ubHkgbWF0cml4QmV0d2VlblByb3BlcnR5OiBNYXRyaXhCZXR3ZWVuUHJvcGVydHk7XG5cbiAgLy8gRmllbGRzIGZvciBwb3NpdGlvbmluZyB0aGUgZ3JhYkN1ZU5vZGUgYW5kIGRyYWdDdWVOb2RlLlxuICBwcml2YXRlIHJlYWRvbmx5IGdyYWJDdWVQb3NpdGlvbjogQ3VlUG9zaXRpb247XG4gIHByaXZhdGUgcmVhZG9ubHkgZHJhZ0N1ZVBvc2l0aW9uOiBDdWVQb3NpdGlvbjtcbiAgcHJpdmF0ZSByZWFkb25seSBncmFiQ3VlT2Zmc2V0OiBWZWN0b3IyO1xuICBwcml2YXRlIHJlYWRvbmx5IGRyYWdDdWVPZmZzZXQ6IFZlY3RvcjI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBub2RlIC0gd2lsbCBiZSBtdXRhdGVkIHdpdGggYTExeSBvcHRpb25zIHRvIGhhdmUgdGhlIGdyYWIvZHJhZyBmdW5jdGlvbmFsaXR5IGluIHRoZSBQRE9NXG4gICAqIEBwYXJhbSBrZXlib2FyZERyYWdMaXN0ZW5lciAtIGFkZGVkIHRvIHRoZSBOb2RlIHdoZW4gaXQgaXMgZ3JhYmJlZFxuICAgKiBAcGFyYW0gaW50ZXJhY3Rpb25DdWVQYXJlbnQgLSBhIHBhcmVudCBOb2RlIGZvciB0aGUgZ3JhYkN1ZU5vZGUgYW5kIGRyYWdDdWVOb2RlXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggbm9kZTogTm9kZSwga2V5Ym9hcmREcmFnTGlzdGVuZXI6IEtleWJvYXJkRHJhZ0xpc3RlbmVyLCBpbnRlcmFjdGlvbkN1ZVBhcmVudDogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogR3JhYkRyYWdJbnRlcmFjdGlvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvd25zRW5hYmxlZFByb3BlcnR5ID0gIXByb3ZpZGVkT3B0aW9ucyB8fCAhcHJvdmlkZWRPcHRpb25zLmVuYWJsZWRQcm9wZXJ0eTtcblxuICAgIC8vIE9wdGlvbnMgZmlsbGVkIGluIHRoZSBzZWNvbmQgb3B0aW9uaXplIHBhc3MgYXJlIG9tbWl0dGVkIGZyb20gdGhlIHNlbGYgb3B0aW9ucyBvZiBmaXJzdCBwYXNzLlxuICAgIGNvbnN0IGZpcnN0UGFzc09wdGlvbnMgPSBvcHRpb25pemU8R3JhYkRyYWdJbnRlcmFjdGlvbk9wdGlvbnMsXG4gICAgICBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnZ2VzdHVyZUhlbHBUZXh0JyB8ICdzaG91bGRBZGRBcmlhRGVzY3JpYmVkYnknPiwgR3JhYkRyYWdNb2RlbE9wdGlvbnM+KCkoIHtcbiAgICAgIG9iamVjdFRvR3JhYlN0cmluZzogZGVmYXVsdE9iamVjdFRvR3JhYlN0cmluZ1Byb3BlcnR5LFxuICAgICAgaWRsZVN0YXRlQWNjZXNzaWJsZU5hbWU6IG51bGwsXG4gICAgICBvbkdyYWI6IF8ubm9vcCxcbiAgICAgIG9uUmVsZWFzZTogXy5ub29wLFxuICAgICAgaWRsZVN0YXRlT3B0aW9uczoge30sXG4gICAgICBncmFiQ3VlT3B0aW9uczoge30sXG4gICAgICBncmFiQ3VlUG9zaXRpb246ICdib3R0b20nLFxuICAgICAgZHJhZ0N1ZVBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICAgIGdyYWJDdWVPZmZzZXQ6IG5ldyBWZWN0b3IyKCAwLCAwICksXG4gICAgICBkcmFnQ3VlT2Zmc2V0OiBuZXcgVmVjdG9yMiggMCwgMCApLFxuICAgICAgdHJhbnNmb3JtTm9kZVRvVHJhY2s6IG5vZGUsXG4gICAgICBncmFiYmVkU3RhdGVPcHRpb25zOiB7fSxcbiAgICAgIGRyYWdDdWVOb2RlOiBuZXcgTm9kZSgpLFxuICAgICAgbGlzdGVuZXJzV2hpbGVHcmFiYmVkOiBbXSxcbiAgICAgIGxpc3RlbmVyc1doaWxlSWRsZTogW10sXG4gICAgICBzdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbjogZ2V0R2xvYmFsKCAncGhldC5qb2lzdC5zaW0uc3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb24nICksXG4gICAgICBrZXlib2FyZEhlbHBUZXh0OiBudWxsLFxuICAgICAgc2hvdWxkU2hvd0dyYWJDdWVOb2RlOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdyYWJEcmFnTW9kZWwuZ3JhYkRyYWdVc2FnZVRyYWNrZXIubnVtYmVyT2ZLZXlib2FyZEdyYWJzIDwgMSAmJiBub2RlLmlucHV0RW5hYmxlZDtcbiAgICAgIH0sXG4gICAgICBzaG91bGRTaG93RHJhZ0N1ZU5vZGU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JhYkRyYWdNb2RlbC5ncmFiRHJhZ1VzYWdlVHJhY2tlci5zaG91bGRTaG93RHJhZ0N1ZTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIEVuYWJsZWRDb21wb25lbnRcbiAgICAgIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSxcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM6IHtcblxuICAgICAgICAvLyBJdCBpcyBiZXN0IHRvIHdpcmUgdXAgZ3JhYiBkcmFnIGVuYWJsZWQgdG8gYmUgaW4gc3luYyB3aXRoIG1vdXNlL3RvdWNoIGlucHV0RW5hYmxlZCAoaW5zdGVhZCBvZiBoYXZpbmcgYm90aFxuICAgICAgICAvLyBlZGl0YWJsZSBieSBQaEVULWlPKS5cbiAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiBmYWxzZVxuICAgICAgfSxcblxuICAgICAgZ3JhYkRyYWdVc2FnZVRyYWNrZXI6IG5ldyBHcmFiRHJhZ1VzYWdlVHJhY2tlcigpLFxuXG4gICAgICAvLyBGb3IgaW5zdHJ1bWVudGluZyAoRHJhZ0xpc3RlbmVyIGlzIGFsc28gVGFuZGVtLlJFUVVJUkVEKVxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIGEgc2Vjb25kIGJsb2NrIGZvciBvcHRpb25zIHRoYXQgdXNlIG90aGVyIG9wdGlvbnMsIHRoZXJlZm9yZSBuZWVkaW5nIHRoZSBkZWZhdWx0cyB0byBiZSBmaWxsZWQgaW5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdyYWJEcmFnSW50ZXJhY3Rpb25PcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBHcmFiRHJhZ0ludGVyYWN0aW9uT3B0aW9ucz4oKSgge1xuICAgICAgZ2VzdHVyZUhlbHBUZXh0OiBTdHJpbmdVdGlscy5maWxsSW4oIGdlc3R1cmVIZWxwVGV4dFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgICBvYmplY3RUb0dyYWI6IGZpcnN0UGFzc09wdGlvbnMub2JqZWN0VG9HcmFiU3RyaW5nXG4gICAgICB9ICksXG4gICAgICBzaG91bGRBZGRBcmlhRGVzY3JpYmVkYnk6ICgpID0+IGZpcnN0UGFzc09wdGlvbnMuc3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb24gJiYgZmlyc3RQYXNzT3B0aW9ucy5ncmFiRHJhZ1VzYWdlVHJhY2tlci5udW1iZXJPZkdyYWJzIDwgMlxuICAgIH0sIGZpcnN0UGFzc09wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZ3JhYkN1ZU9wdGlvbnMudmlzaWJsZSA9PT0gdW5kZWZpbmVkLCAnU2hvdWxkIG5vdCBzZXQgdmlzaWJpbGl0eSBvZiB0aGUgY3VlIG5vZGUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMubGlzdGVuZXJzV2hpbGVHcmFiYmVkLmluY2x1ZGVzKCBrZXlib2FyZERyYWdMaXN0ZW5lciApLCAnR3JhYkRyYWdJbnRlcmFjdGlvbiBhZGRzIHRoZSBLZXlib2FyZERyYWdMaXN0ZW5lciB0byBsaXN0ZW5lcnNXaGlsZUdyYWJiZWQnICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5kcmFnQ3VlTm9kZS5wYXJlbnQsICdHcmFiRHJhZ0ludGVyYWN0aW9uIGFkZHMgZHJhZ0N1ZU5vZGUgdG8gZm9jdXNIaWdobGlnaHQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5kcmFnQ3VlTm9kZS52aXNpYmxlLCAnZHJhZ0N1ZU5vZGUgc2hvdWxkIGJlIHZpc2libGUgdG8gYmVnaW4gd2l0aCcgKTtcblxuICAgIC8vIE9wdGlvbnMgYXJlIHBhc3NlZCB0byB0aGUgbW9kZWwgZGlyZWN0bHksIHNvIERpc3Bvc2FibGUgb3B0aW9ucyB3aWxsIGJlIGhhbmRsZWQgb3ZlciBpbiB0aGUgbW9kZWwgdHlwZS5cbiAgICBzdXBlcigpO1xuXG4gICAgb3B0aW9ucy5ncmFiYmVkU3RhdGVPcHRpb25zID0gY29tYmluZU9wdGlvbnM8UGFyYWxsZWxET01PcHRpb25zPigge1xuICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICBhcmlhUm9sZTogJ2FwcGxpY2F0aW9uJyxcbiAgICAgIGZvY3VzYWJsZTogdHJ1ZSxcblxuICAgICAgLy8gdG8gY2FuY2VsIG91dCBcImlkbGVcIiBzdGF0ZSBvcHRpb25zXG4gICAgICBjb250YWluZXJUYWdOYW1lOiBudWxsXG4gICAgfSwgb3B0aW9ucy5ncmFiYmVkU3RhdGVPcHRpb25zICk7XG5cbiAgICBvcHRpb25zLmlkbGVTdGF0ZU9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxQYXJhbGxlbERPTU9wdGlvbnM+KCB7XG4gICAgICBjb250YWluZXJUYWdOYW1lOiAnZGl2JyxcbiAgICAgIGZvY3VzYWJsZTogdHJ1ZSxcbiAgICAgIGFyaWFSb2xlOiBudWxsLFxuICAgICAgdGFnTmFtZTogJ2J1dHRvbicsXG5cbiAgICAgIC8vIGluIGdlbmVyYWwsIHRoZSBoZWxwIHRleHQgaXMgYWZ0ZXIgdGhlIGNvbXBvbmVudCBpbiB0aGUgUERPTVxuICAgICAgYXBwZW5kRGVzY3JpcHRpb246IHRydWUsXG5cbiAgICAgIC8vIHBvc2l0aW9uIHRoZSBQRE9NIGVsZW1lbnRzIHdoZW4gaWRsZSBmb3IgZHJhZyBhbmQgZHJvcCBvbiB0b3VjaC1iYXNlZCBzY3JlZW4gcmVhZGVyc1xuICAgICAgcG9zaXRpb25JblBET006IHRydWUsXG5cbiAgICAgIGFjY2Vzc2libGVOYW1lOiBudWxsXG4gICAgfSwgb3B0aW9ucy5pZGxlU3RhdGVPcHRpb25zICk7XG5cbiAgICBjb25zdCBkZWZhdWx0SWRsZVN0YXRlQWNjZXNzaWJsZU5hbWUgPSBvcHRpb25zLmlkbGVTdGF0ZUFjY2Vzc2libGVOYW1lIHx8IC8vIGlmIGEgcHJvdmlkZWQgb3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBvcHRpb25zLnN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uID8gb3B0aW9ucy5vYmplY3RUb0dyYWJTdHJpbmcgOiAvLyBvdGhlcndpc2UgaWYgc3VwcG9ydGluZyBnZXN0dXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmdVdGlscy5maWxsSW4oIGdyYWJQYXR0ZXJuU3RyaW5nU3RyaW5nUHJvcGVydHksIHsgLy8gZGVmYXVsdCBjYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFRvR3JhYjogb3B0aW9ucy5vYmplY3RUb0dyYWJTdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKSApO1xuXG4gICAgdGhpcy5ncmFiRHJhZ01vZGVsID0gbmV3IEdyYWJEcmFnTW9kZWwoIG9wdGlvbnMuZ3JhYkRyYWdVc2FnZVRyYWNrZXIsIG9wdGlvbnMgKTtcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgIHRoaXMuaWRsZVN0YXRlT3B0aW9ucyA9IG9wdGlvbnMuaWRsZVN0YXRlT3B0aW9ucztcbiAgICB0aGlzLmdyYWJiZWRTdGF0ZU9wdGlvbnMgPSBvcHRpb25zLmdyYWJiZWRTdGF0ZU9wdGlvbnM7XG4gICAgdGhpcy5kcmFnQ3VlTm9kZSA9IG9wdGlvbnMuZHJhZ0N1ZU5vZGU7XG4gICAgdGhpcy5ncmFiQ3VlTm9kZSA9IG5ldyBHcmFiUmVsZWFzZUN1ZU5vZGUoIG9wdGlvbnMuZ3JhYkN1ZU9wdGlvbnMgKTtcbiAgICB0aGlzLnNob3VsZFNob3dHcmFiQ3VlTm9kZSA9IG9wdGlvbnMuc2hvdWxkU2hvd0dyYWJDdWVOb2RlO1xuICAgIHRoaXMuc2hvdWxkU2hvd0RyYWdDdWVOb2RlID0gb3B0aW9ucy5zaG91bGRTaG93RHJhZ0N1ZU5vZGU7XG4gICAgdGhpcy5zaG91bGRBZGRBcmlhRGVzY3JpYmVkYnkgPSBvcHRpb25zLnNob3VsZEFkZEFyaWFEZXNjcmliZWRieTtcbiAgICB0aGlzLnN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uID0gb3B0aW9ucy5zdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbjtcbiAgICB0aGlzLl9vbkdyYWIgPSBvcHRpb25zLm9uR3JhYjtcbiAgICB0aGlzLl9vblJlbGVhc2UgPSBvcHRpb25zLm9uUmVsZWFzZTtcbiAgICB0aGlzLmdyYWJDdWVQb3NpdGlvbiA9IG9wdGlvbnMuZ3JhYkN1ZVBvc2l0aW9uO1xuICAgIHRoaXMuZHJhZ0N1ZVBvc2l0aW9uID0gb3B0aW9ucy5kcmFnQ3VlUG9zaXRpb247XG4gICAgdGhpcy5ncmFiQ3VlT2Zmc2V0ID0gb3B0aW9ucy5ncmFiQ3VlT2Zmc2V0O1xuICAgIHRoaXMuZHJhZ0N1ZU9mZnNldCA9IG9wdGlvbnMuZHJhZ0N1ZU9mZnNldDtcblxuICAgIHRoaXMuc2V0R3JhYmJlZFN0YXRlQWNjZXNzaWJsZU5hbWUoIG9wdGlvbnMub2JqZWN0VG9HcmFiU3RyaW5nICk7XG4gICAgdGhpcy5zZXRJZGxlU3RhdGVBY2Nlc3NpYmxlTmFtZSggZGVmYXVsdElkbGVTdGF0ZUFjY2Vzc2libGVOYW1lICk7XG5cbiAgICAvLyBzZXQgdGhlIGhlbHAgdGV4dCwgaWYgcHJvdmlkZWQgLSBpdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCBhcmlhLWRlc2NyaWJlZGJ5IHdoZW4gaW4gdGhlIFwiaWRsZVwiIGludGVyYWN0aW9uU3RhdGVcbiAgICB0aGlzLm5vZGUuZGVzY3JpcHRpb25Db250ZW50ID0gdGhpcy5zdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbiA/IG9wdGlvbnMuZ2VzdHVyZUhlbHBUZXh0IDogb3B0aW9ucy5rZXlib2FyZEhlbHBUZXh0O1xuXG4gICAgLy8gVGhlIGFyaWEtZGVzY3JpYmVkYnkgYXNzb2NpYXRpb24gb2JqZWN0IHRoYXQgd2lsbCBhc3NvY2lhdGUgXCJpZGxlXCIgaW50ZXJhY3Rpb25TdGF0ZSB3aXRoIGl0cyBoZWxwIHRleHQgc28gdGhhdCBpdCBpc1xuICAgIC8vIHJlYWQgYXV0b21hdGljYWxseSB3aGVuIHRoZSB1c2VyIGZpbmRzIGl0LiBUaGlzIHJlZmVyZW5jZSBpcyBzYXZlZCBzbyB0aGF0IHRoZSBhc3NvY2lhdGlvbiBjYW4gYmUgcmVtb3ZlZFxuICAgIC8vIHdoZW4gdGhlIG5vZGUgYmVjb21lcyBhIFwiZ3JhYmJlZFwiXG4gICAgdGhpcy5kZXNjcmlwdGlvbkFzc29jaWF0aW9uT2JqZWN0ID0ge1xuICAgICAgb3RoZXJOb2RlOiB0aGlzLm5vZGUsXG4gICAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkRFU0NSSVBUSU9OX1NJQkxJTkdcbiAgICB9O1xuXG4gICAgdGhpcy53aXJlVXBEZXNjcmlwdGlvbkFuZFZvaWNpbmdSZXNwb25zZXMoIG5vZGUgKTtcblxuICAgIHRoaXMuZ3JhYkRyYWdNb2RlbC5yZWxlYXNlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgIHRoaXMub25SZWxlYXNlKCk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5ncmFiRHJhZ01vZGVsLmdyYWJiZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aGlzLm9uR3JhYigpICk7XG5cbiAgICAvLyBhc3NlcnRpb25zIGNvbmZpcm0gdGhpcyB0eXBlIGNhc3QgYmVsb3dcbiAgICBjb25zdCBub2RlRm9jdXNIaWdobGlnaHQgPSBub2RlLmZvY3VzSGlnaGxpZ2h0IGFzIEhpZ2hsaWdodFBhdGggfCBudWxsO1xuXG4gICAgYXNzZXJ0ICYmIG5vZGVGb2N1c0hpZ2hsaWdodCAmJiBhc3NlcnQoIG5vZGVGb2N1c0hpZ2hsaWdodCBpbnN0YW5jZW9mIEhpZ2hsaWdodFBhdGgsXG4gICAgICAnaWYgcHJvdmlkZWQsIGZvY3VzSGlnaGxpZ2h0IG11c3QgYmUgYSBQYXRoIHRvIGdldCBhIFNoYXBlIGFuZCBtYWtlIGRhc2hlZCcgKTtcbiAgICBhc3NlcnQgJiYgaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggbm9kZSApICYmIG5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHQgJiYgYXNzZXJ0KCBub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0IGluc3RhbmNlb2YgSGlnaGxpZ2h0UGF0aCxcbiAgICAgICdpZiBwcm92aWRlZCwgaW50ZXJhY3RpdmVIaWdobGlnaHQgbXVzdCBiZSBhIFBhdGggdG8gZ2V0IGEgU2hhcGUgYW5kIG1ha2UgZGFzaGVkJyApO1xuXG4gICAgaWYgKCBub2RlLmZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZUZvY3VzSGlnaGxpZ2h0LFxuICAgICAgICAnaWYgZm9jdXNIaWdobGlnaHRMYXllcmFibGUsIHRoZSBoaWdobGlnaHQgbXVzdCBiZSBzZXQgdG8gdGhlIG5vZGUgYmVmb3JlIGNvbnN0cnVjdGluZyB0aGUgZ3JhYi9kcmFnIGludGVyYWN0aW9uLicgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICggbm9kZUZvY3VzSGlnaGxpZ2h0ISApLnBhcmVudCxcbiAgICAgICAgJ2lmIGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlLCB0aGUgaGlnaGxpZ2h0IG11c3QgYmUgYWRkZWQgdG8gdGhlIHNjZW5lIGdyYXBoIGJlZm9yZSBncmFiL2RyYWcgY29uc3RydWN0aW9uLicgKTtcbiAgICB9XG5cbiAgICBpZiAoIGlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIG5vZGUgKSAmJiBub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZS5pbnRlcmFjdGl2ZUhpZ2hsaWdodCxcbiAgICAgICAgJ0FuIGludGVyYWN0aXZlIGhpZ2hsaWdodCBtdXN0IGJlIHNldCB0byB0aGUgTm9kZSBiZWZvcmUgY29uc3RydWN0aW9uIHdoZW4gdXNpbmcgaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUnICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAoIG5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHQhIGFzIEhpZ2hsaWdodFBhdGggKS5wYXJlbnQsXG4gICAgICAgICdpZiBpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSwgdGhlIGhpZ2hsaWdodCBtdXN0IGJlIGFkZGVkIHRvIHRoZSBzY2VuZSBncmFwaCBiZWZvcmUgY29uc3RydWN0aW9uJyApO1xuICAgIH1cblxuICAgIC8vIFRha2UgaGlnaGxpZ2h0cyBmcm9tIHRoZSBub2RlIGZvciB0aGUgZ3JhYi9kcmFnIGludGVyYWN0aW9uLiBUaGUgSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cyBjYW5ub3QgZmFsbCBiYWNrIHRvXG4gICAgLy8gdGhlIGRlZmF1bHQgZm9jdXMgaGlnaGxpZ2h0cyBiZWNhdXNlIEdyYWJEcmFnSW50ZXJhY3Rpb24gYWRkcyBcImdyYWIgY3VlXCIgTm9kZXMgYXMgY2hpbGRyZW5cbiAgICAvLyB0byB0aGUgZm9jdXMgaGlnaGxpZ2h0cyB0aGF0IHNob3VsZCBub3QgYmUgZGlzcGxheWVkIHdoZW4gdXNpbmcgSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cy5cbiAgICBjb25zdCBvd25zRm9jdXNIaWdobGlnaHQgPSAhbm9kZS5mb2N1c0hpZ2hsaWdodExheWVyYWJsZTtcbiAgICB0aGlzLmdyYWJEcmFnRm9jdXNIaWdobGlnaHQgPSAhb3duc0ZvY3VzSGlnaGxpZ2h0ID8gbm9kZUZvY3VzSGlnaGxpZ2h0ISA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUZvY3VzSGlnaGxpZ2h0ID8gbmV3IEhpZ2hsaWdodFBhdGgoIG5vZGVGb2N1c0hpZ2hsaWdodC5zaGFwZVByb3BlcnR5ICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBIaWdobGlnaHRGcm9tTm9kZSggbm9kZSApO1xuICAgIGNvbnN0IG93bnNJbnRlcmFjdGl2ZUhpZ2hsaWdodCA9ICEoIGlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIG5vZGUgKSAmJiBub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlICk7XG4gICAgdGhpcy5ncmFiRHJhZ0ludGVyYWN0aXZlSGlnaGxpZ2h0ID0gIW93bnNJbnRlcmFjdGl2ZUhpZ2hsaWdodCA/ICggbm9kZS5pbnRlcmFjdGl2ZUhpZ2hsaWdodCBhcyBIaWdobGlnaHRQYXRoICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggbm9kZSApICYmIG5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHQgKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEhpZ2hsaWdodFBhdGgoICggbm9kZS5pbnRlcmFjdGl2ZUhpZ2hsaWdodCBhcyBIaWdobGlnaHRQYXRoICkuc2hhcGVQcm9wZXJ0eSApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgSGlnaGxpZ2h0UGF0aCggdGhpcy5ncmFiRHJhZ0ZvY3VzSGlnaGxpZ2h0LnNoYXBlUHJvcGVydHkgKTtcblxuICAgIG5vZGUuZm9jdXNIaWdobGlnaHQgPSB0aGlzLmdyYWJEcmFnRm9jdXNIaWdobGlnaHQ7XG4gICAgaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggbm9kZSApICYmIG5vZGUuc2V0SW50ZXJhY3RpdmVIaWdobGlnaHQoIHRoaXMuZ3JhYkRyYWdJbnRlcmFjdGl2ZUhpZ2hsaWdodCApO1xuXG4gICAgaW50ZXJhY3Rpb25DdWVQYXJlbnQuYWRkQ2hpbGQoIHRoaXMuZHJhZ0N1ZU5vZGUgKTtcbiAgICBpbnRlcmFjdGlvbkN1ZVBhcmVudC5hZGRDaGlsZCggdGhpcy5ncmFiQ3VlTm9kZSApO1xuXG4gICAgLy8gQSBtYXRyaXggYmV0d2VlbiB0aGUgbG9jYWwgZnJhbWUgb2YgdGhlIHRhcmdldCBOb2RlIGFuZCB0aGUgbG9jYWwgZnJhbWUgb2YgdGhlIGludGVyYWN0aW9uQ3VlUGFyZW50LlxuICAgIHRoaXMubWF0cml4QmV0d2VlblByb3BlcnR5ID0gbmV3IE1hdHJpeEJldHdlZW5Qcm9wZXJ0eSggb3B0aW9ucy50cmFuc2Zvcm1Ob2RlVG9UcmFjaywgaW50ZXJhY3Rpb25DdWVQYXJlbnQsIHtcblxuICAgICAgLy8gVXNlIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lIHNvIHRoYXQgdGhlIFByb3BlcnR5IG9ic2VydmVzIHRyYW5zZm9ybSBjaGFuZ2VzIHVwIHRvIGFuZCBpbmNsdWRpbmdcbiAgICAgIC8vIHRoZSB0YXJnZXQgTm9kZS5cbiAgICAgIGZyb21Db29yZGluYXRlRnJhbWU6ICdsb2NhbCcsXG4gICAgICB0b0Nvb3JkaW5hdGVGcmFtZTogJ2xvY2FsJ1xuICAgIH0gKTtcblxuICAgIGNvbnN0IHJlcG9zaXRpb25DdWVzTGlzdGVuZXIgPSB0aGlzLnJlcG9zaXRpb25DdWVzLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLm1hdHJpeEJldHdlZW5Qcm9wZXJ0eS5saW5rKCByZXBvc2l0aW9uQ3Vlc0xpc3RlbmVyICk7XG5cbiAgICAvLyBTb21lIGtleSBwcmVzc2VzIGNhbiBmaXJlIHRoZSBub2RlJ3MgY2xpY2sgKHRoZSBncmFiIGJ1dHRvbikgZnJvbSB0aGUgc2FtZSBwcmVzcyB0aGF0IGZpcmVzIHRoZSBrZXlkb3duIGZyb21cbiAgICAvLyB0aGUgZ3JhYmJlZCBzdGF0ZSwgc28gZ3VhcmQgYWdhaW5zdCB0aGF0LlxuICAgIGxldCBndWFyZEdyYWJLZXlQcmVzc0Zyb21HcmFiYmVkU3RhdGUgPSBmYWxzZTtcblxuICAgIC8vIHdoZW4gdGhlIFwiR3JhYiB7e3RoaW5nfX1cIiBidXR0b24gaXMgcHJlc3NlZCwgZm9jdXMgdGhlIGdyYWJiZWQgbm9kZSBhbmQgc2V0IHRvIGRyYWdnZWQgc3RhdGVcbiAgICBjb25zdCBncmFiQnV0dG9uTGlzdGVuZXIgPSB7XG4gICAgICBjbGljazogKCkgPT4ge1xuXG4gICAgICAgIC8vIGRvbid0IHR1cm4gdG8gZ3JhYmJlZCBvbiBtb2JpbGUgYTExeSwgaXQgaXMgdGhlIHdyb25nIGdlc3R1cmUgLSB1c2VyIHNob3VsZCBwcmVzcyBkb3duIGFuZCBob2xkXG4gICAgICAgIC8vIHRvIGluaXRpYXRlIGEgZHJhZ1xuICAgICAgICBpZiAoIHRoaXMuc3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb24gfHwgIXRoaXMuZ3JhYkRyYWdNb2RlbC5lbmFibGVkICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZSBncmFiYmVkIG5vZGUgd2FzIGp1c3QgcmVsZWFzZWQsIGRvbid0IHBpY2sgaXQgdXAgYWdhaW4gdW50aWwgdGhlIG5leHQgY2xpY2sgZXZlbnQgc28gd2UgZG9uJ3QgXCJsb29wXCJcbiAgICAgICAgLy8gYW5kIHBpY2sgaXQgdXAgaW1tZWRpYXRlbHkgYWdhaW4uXG4gICAgICAgIGlmICggZ3VhcmRHcmFiS2V5UHJlc3NGcm9tR3JhYmJlZFN0YXRlICkge1xuXG4gICAgICAgICAgLy8gYWxsb3cgZ3JhYiB0aGUgbm9kZSBvbiB0aGUgbmV4dCBjbGljayBldmVudFxuICAgICAgICAgIGd1YXJkR3JhYktleVByZXNzRnJvbUdyYWJiZWRTdGF0ZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGJsdXIgYXMgYW4gaWRsZSBzbyB0aGF0IHdlIGdldCBhIG5ldyBmb2N1cyBldmVudCBhZnRlciB3ZSB0dXJuIGludG8gYSBncmFiYmVkLCBhbmQgc28gdGhhdCBncmFiIGxpc3RlbmVycyBnZXQgYSBibHVyKCkgZXZlbnQgYmVmb3JlIG11dGF0aW5nLlxuICAgICAgICB0aGlzLm5vZGUuYmx1cigpO1xuXG4gICAgICAgIHRoaXMuZ3JhYkRyYWdNb2RlbC5rZXlib2FyZEdyYWIoICgpID0+IHtcblxuICAgICAgICAgIC8vIGZvY3VzIGFmdGVyIHRoZSB0cmFuc2l0aW9uIHNvIHRoYXQgbGlzdGVuZXJzIGFkZGVkIHRvIHRoZSBncmFiYmVkIHN0YXRlIGdldCBhIGZvY3VzIGV2ZW50KCkuXG4gICAgICAgICAgdGhpcy5ub2RlLmZvY3VzKCk7XG4gICAgICAgIH0gKTtcblxuICAgICAgfSxcblxuICAgICAgZm9jdXM6ICgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5Rm9yQ3VlcygpO1xuXG4gICAgICAgIHRoaXMub25HcmFiQnV0dG9uRm9jdXNFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH0sXG5cbiAgICAgIGJsdXI6ICgpID0+IHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvckN1ZXMoKVxuICAgIH07XG5cbiAgICAvLyBLZWVwIHRyYWNrIG9mIGFsbCBsaXN0ZW5lcnMgdG8gc3dhcCBvdXQgZ3JhYi9kcmFnIGZ1bmN0aW9uYWxpdGllcy5cbiAgICB0aGlzLmxpc3RlbmVyc1doaWxlSWRsZSA9IG9wdGlvbnMubGlzdGVuZXJzV2hpbGVJZGxlLmNvbmNhdCggZ3JhYkJ1dHRvbkxpc3RlbmVyICk7XG5cbiAgICBjb25zdCBkcmFnRGl2RG93bkxpc3RlbmVyID0gbmV3IEtleWJvYXJkTGlzdGVuZXIoIHtcbiAgICAgIGtleXM6IFsgJ2VudGVyJyBdLFxuICAgICAgZmlyZTogKCkgPT4ge1xuXG5cbiAgICAgICAgLy8gc2V0IGEgZ3VhcmQgdG8gbWFrZSBzdXJlIHRoZSBrZXkgcHJlc3MgZnJvbSBlbnRlciBkb2Vzbid0IGZpcmUgZnV0dXJlIGxpc3RlbmVycywgdGhlcmVmb3JlXG4gICAgICAgIC8vIFwiY2xpY2tpbmdcIiB0aGUgZ3JhYiBidXR0b24gYWxzbyBvbiB0aGlzIGtleSBwcmVzcy5cbiAgICAgICAgLy8gVGhlIHNlcXVlbmNlIHRoYXQgZGlzcGF0Y2hlZCB0aGlzIGZpcmUgYWxzbyBkaXNwYXRjaGVzIGEgY2xpY2sgZXZlbnQsIHNvIHdlIG11c3QgYXZvaWQgaW1tZWRpYXRlbHkgZ3JhYmJpbmdcbiAgICAgICAgLy8gZnJvbSB0aGlzIGV2ZW50IHRoYXQgcmVsZWFzZWRcbiAgICAgICAgZ3VhcmRHcmFiS2V5UHJlc3NGcm9tR3JhYmJlZFN0YXRlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ncmFiRHJhZ01vZGVsLnJlbGVhc2UoKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBkcmFnRGl2VXBMaXN0ZW5lciA9IG5ldyBLZXlib2FyZExpc3RlbmVyKCB7XG4gICAgICBrZXlzOiBbICdzcGFjZScsICdlc2NhcGUnIF0sXG5cbiAgICAgIC8vIEZvciB0aGUgcmVsZWFzZSBhY3Rpb24sIGl0IGlzIG1vcmUgdHlwaWNhbCB0byBmaXJlIGl0IHdoZW4gdGhlIGtleSBpcyByZWxlYXNlZC5cbiAgICAgIGZpcmVPbkRvd246IGZhbHNlLFxuICAgICAgZmlyZTogKCkgPT4ge1xuXG4gICAgICAgIC8vIFJlbGVhc2Ugb24ga2V5dXAgZm9yIHNwYWNlYmFyIHNvIHRoYXQgd2UgZG9uJ3QgcGljayB1cCB0aGUgZ3JhYmJlZCBub2RlIGFnYWluIHdoZW4gd2UgcmVsZWFzZSB0aGUgc3BhY2ViYXJcbiAgICAgICAgLy8gYW5kIHRyaWdnZXIgYSBjbGljayBldmVudCAtIGVzY2FwZSBjb3VsZCBiZSBhZGRlZCB0byBlaXRoZXIga2V5dXAgb3Iga2V5ZG93biBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5ncmFiRHJhZ01vZGVsLnJlbGVhc2UoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIHJlbGVhc2Ugd2hlbiBmb2N1cyBpcyBsb3N0XG4gICAgICBibHVyOiAoKSA9PiB0aGlzLmdyYWJEcmFnTW9kZWwucmVsZWFzZSgpLFxuXG4gICAgICAvLyBpZiBzdWNjZXNzZnVsbHkgZHJhZ2dlZCwgdGhlbiBtYWtlIHRoZSBjdWUgbm9kZSBpbnZpc2libGVcbiAgICAgIGZvY3VzOiAoKSA9PiB0aGlzLnVwZGF0ZVZpc2liaWxpdHlGb3JDdWVzKClcbiAgICB9ICk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHZpc2liaWxpdHkgb2YgZHJhZ2dpbmcgY3VlcyB3aGVuZXZlciBrZXlib2FyZCBkcmFnZ2luZyBrZXlzIHJlbGVhc2UgKGtleXVwKSwgYnVnIGZpeCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvODY4XG4gICAgY29uc3QgZHJhZ0RpdkRyYWdnZWRMaXN0ZW5lciA9IG5ldyBLZXlib2FyZExpc3RlbmVyKCB7XG5cbiAgICAgIC8vIEFsbCBwb3NzaWJsZSBkcmFnZ2luZyBrZXlzIHdpbGwgZmlyZSB0aGlzLlxuICAgICAga2V5U3RyaW5nUHJvcGVydGllczogS2V5Ym9hcmREcmFnRGlyZWN0aW9uVG9LZXlTdHJpbmdQcm9wZXJ0aWVzTWFwLmdldCggJ2JvdGgnICksXG4gICAgICBmaXJlT25Eb3duOiBmYWxzZSxcbiAgICAgIGZpcmU6ICgpID0+IHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvckN1ZXMoKSxcblxuICAgICAgLy8gVGhlc2Ugb3B0aW9ucyBzaW11bGF0ZSBQcmVzc0xpc3RlbmVyJ3MgYXR0YWNoOmZhbHNlIG9wdGlvbiwgYW5kIHdpbGwgZW5zdXJlIHRoaXMgZG9lc24ndCBkaXNydXB0IG90aGVyIGtleXNcbiAgICAgIG92ZXJyaWRlOiBmYWxzZSxcbiAgICAgIGFsbG93T3ZlcmxhcDogdHJ1ZVxuICAgIH0gKTtcblxuICAgIHRoaXMubGlzdGVuZXJzV2hpbGVHcmFiYmVkID0gb3B0aW9ucy5saXN0ZW5lcnNXaGlsZUdyYWJiZWQuY29uY2F0KCBbXG4gICAgICBkcmFnRGl2RG93bkxpc3RlbmVyLFxuICAgICAgZHJhZ0RpdlVwTGlzdGVuZXIsXG4gICAgICBkcmFnRGl2RHJhZ2dlZExpc3RlbmVyLFxuICAgICAga2V5Ym9hcmREcmFnTGlzdGVuZXJcbiAgICBdICk7XG5cbiAgICB0aGlzLnByZXNzUmVsZWFzZUxpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xuICAgICAgcHJlc3M6IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCAhZXZlbnQuaXNGcm9tUERPTSgpICkge1xuICAgICAgICAgIHRoaXMuZ3JhYkRyYWdNb2RlbC5ncmFiKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZWxlYXNlOiBldmVudCA9PiB7XG5cbiAgICAgICAgLy8gSWYgdGhlIGV2ZW50IGlzIG51bGwsIHRoZW4gd2UgYXJlIGluIHRoZSBpbnRlcnJ1cHQgY2FzZSwgYW5kIHNob3VsZCBhdHRlbXB0IHRvIHJlbGVhc2UoKVxuICAgICAgICAvLyBJZiB0aGUgcmVsZWFzZSBpcyBhbiBldmVudCBmcm9tIHRoZSBQRE9NICh3aGljaCBzaG91bGRuJ3QgaGFwcGVuIG1vc3Qgb2YgdGhlIHRpbWUpLCB0aGVuIFBET00gbGlzdGVuZXJzIHdpbGxcbiAgICAgICAgLy8gaGFuZGxlIHRoZSByZWxlYXNlKCkuXG4gICAgICAgIGNvbnN0IHNob3VsZFJlbGVhc2UgPSAoIGV2ZW50ID09PSBudWxsIHx8ICFldmVudC5pc0Zyb21QRE9NKCkgKTtcblxuICAgICAgICAvLyByZWxlYXNlIGlmIGludGVycnVwdGVkLCBidXQgb25seSBpZiBub3QgYWxyZWFkeSBpZGxlLCB3aGljaCBpcyBwb3NzaWJsZSBpZiB0aGUgR3JhYkRyYWdJbnRlcmFjdGlvblxuICAgICAgICAvLyBoYXMgYmVlbiByZXNldCBzaW5jZSBwcmVzc1xuICAgICAgICBpZiAoIHNob3VsZFJlbGVhc2UgJiYgdGhpcy5ncmFiRHJhZ01vZGVsLmludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gJ2dyYWJiZWQnICkge1xuICAgICAgICAgIHRoaXMuZ3JhYkRyYWdNb2RlbC5yZWxlYXNlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIHRoaXMgbGlzdGVuZXIgc2hvdWxkbid0IHByZXZlbnQgdGhlIGJlaGF2aW9yIG9mIG90aGVyIGxpc3RlbmVycywgYW5kIHRoaXMgbGlzdGVuZXIgc2hvdWxkIGFsd2F5cyBmaXJlXG4gICAgICAvLyB3aGV0aGVyIHRoZSBwb2ludGVyIGlzIGFscmVhZHkgYXR0YWNoZWRcbiAgICAgIGF0dGFjaDogZmFsc2UsXG4gICAgICBlbmFibGVkUHJvcGVydHk6IHRoaXMuZ3JhYkRyYWdNb2RlbC5lbmFibGVkUHJvcGVydHksXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXNzUmVsZWFzZUxpc3RlbmVyJyApXG4gICAgfSApO1xuICAgIHRoaXMubm9kZS5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLnByZXNzUmVsZWFzZUxpc3RlbmVyICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmdyYWJEcmFnTW9kZWwuaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LnZhbHVlID09PSAnaWRsZScsICdzdGFydGluZyBzdGF0ZSBpZGxlIHBsZWFzZScgKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgaW50ZXJhY3Rpb24sIHBkb20sIGZvY3VzLCBldGMgd2hlbiB0aGUgc3RhdGUgY2hhbmdlcy5cbiAgICB0aGlzLmdyYWJEcmFnTW9kZWwuaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LmxpbmsoICgpID0+IHRoaXMudXBkYXRlRnJvbVN0YXRlKCkgKTtcblxuICAgIHRoaXMuZ3JhYkRyYWdNb2RlbC5lbmFibGVkUHJvcGVydHkubGF6eUxpbmsoIGVuYWJsZWQgPT4ge1xuICAgICAgaWYgKCAhZW5hYmxlZCApIHtcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQoKTsgLy8gVGhpcyB3aWxsIHRyaWdnZXIgc3RhdGUgY2hhbmdlIHRvIGlkbGUgdmlhIERyYWdMaXN0ZW5lci5yZWxlYXNlKClcbiAgICAgIH1cblxuICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5Rm9yQ3VlcygpO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IGlucHV0RW5hYmxlZExpc3RlbmVyID0gKCBub2RlSW5wdXRFbmFibGVkOiBib29sZWFuICkgPT4geyB0aGlzLmdyYWJEcmFnTW9kZWwuZW5hYmxlZCA9IG5vZGVJbnB1dEVuYWJsZWQ7IH07XG5cbiAgICAvLyBVc2UgdGhlIFwib3duc1wiIHBhdHRlcm4gaGVyZSB0byBrZWVwIHRoZSBlbmFibGVkUHJvcGVydHkgUGhFVC1pTyBpbnN0cnVtZW50ZWQgYmFzZWQgb24gdGhlIHN1cGVyIG9wdGlvbnMuXG4gICAgLy8gSWYgdGhlIGNsaWVudCBzcGVjaWZpZWQgdGhlaXIgb3duIGVuYWJsZWRQcm9wZXJ0eSwgdGhlbiB0aGV5IGFyZSByZXNwb25zaWJsZSBmb3IgbWFuYWdpbmcgZW5hYmxlZC5cbiAgICBvd25zRW5hYmxlZFByb3BlcnR5ICYmIHRoaXMubm9kZS5pbnB1dEVuYWJsZWRQcm9wZXJ0eS5sYXp5TGluayggaW5wdXRFbmFibGVkTGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZ3JhYkRyYWdNb2RlbC5yZXNldEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvckN1ZXMoKSApO1xuXG4gICAgLy8gSGlkZSB0aGUgZHJhZyBjdWUgd2hlbiB0aGVyZSBoYXMgYmVlbiBhIHN1Y2Nlc3NmdWwgcGlja3VwLlxuICAgIGNvbnN0IGtleWJvYXJkUHJlc3NlZExpc3RlbmVyID0gKCBpc1ByZXNzZWQ6IGJvb2xlYW4gKSA9PiB7XG4gICAgICBpZiAoIGlzUHJlc3NlZCApIHtcbiAgICAgICAgdGhpcy5ncmFiRHJhZ01vZGVsLmdyYWJEcmFnVXNhZ2VUcmFja2VyLnNob3VsZFNob3dEcmFnQ3VlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcbiAgICBrZXlib2FyZERyYWdMaXN0ZW5lci5pc1ByZXNzZWRQcm9wZXJ0eS5saW5rKCBrZXlib2FyZFByZXNzZWRMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuXG4gICAgICB0aGlzLm5vZGUucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5wcmVzc1JlbGVhc2VMaXN0ZW5lciApO1xuICAgICAgb3duc0VuYWJsZWRQcm9wZXJ0eSAmJiB0aGlzLm5vZGUuaW5wdXRFbmFibGVkUHJvcGVydHkudW5saW5rKCBpbnB1dEVuYWJsZWRMaXN0ZW5lciApO1xuXG4gICAgICB0aGlzLm5vZGUucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ2FyaWEtcm9sZWRlc2NyaXB0aW9uJyApO1xuXG4gICAgICAvLyBSZW1vdmUgbGlzdGVuZXJzIChncmFjZWZ1bGx5KVxuICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVycyggdGhpcy5saXN0ZW5lcnNXaGlsZUlkbGUgKTtcbiAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lcnMoIHRoaXMubGlzdGVuZXJzV2hpbGVHcmFiYmVkICk7XG5cbiAgICAgIGludGVyYWN0aW9uQ3VlUGFyZW50LnJlbW92ZUNoaWxkKCB0aGlzLmRyYWdDdWVOb2RlICk7XG4gICAgICBpbnRlcmFjdGlvbkN1ZVBhcmVudC5yZW1vdmVDaGlsZCggdGhpcy5ncmFiQ3VlTm9kZSApO1xuXG4gICAgICB0aGlzLm1hdHJpeEJldHdlZW5Qcm9wZXJ0eS51bmxpbmsoIHJlcG9zaXRpb25DdWVzTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMubWF0cml4QmV0d2VlblByb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgICAga2V5Ym9hcmREcmFnTGlzdGVuZXIuaXNQcmVzc2VkUHJvcGVydHkudW5saW5rKCBrZXlib2FyZFByZXNzZWRMaXN0ZW5lciApO1xuXG4gICAgICBkcmFnRGl2RG93bkxpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICAgIGRyYWdEaXZVcExpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICAgIGRyYWdEaXZEcmFnZ2VkTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5wcmVzc1JlbGVhc2VMaXN0ZW5lci5kaXNwb3NlKCk7XG5cbiAgICAgIHRoaXMub25HcmFiQnV0dG9uRm9jdXNFbWl0dGVyLmRpc3Bvc2UoKTtcblxuICAgICAgLy8gRm9jdXMgYW5kIGN1ZSBkaXNwb3NhbFxuICAgICAgaWYgKCBvd25zRm9jdXNIaWdobGlnaHQgKSB7XG5cbiAgICAgICAgLy8gQXNzdW1lIHRoZSBHcmFiRHJhZ0ludGVyYWN0aW9uIHdhcyB0aGUgcHJpbWFyeS9zb2xlIHJlYXNvbiBmb3IgaGlnaGxpZ2h0aW5nLCBkbyBub3QgdHJ5IHRvIGZhbGwgYmFjayB0byBhIHByaW9yIGhpZ2hsaWdodFxuICAgICAgICB0aGlzLm5vZGUuZm9jdXNIaWdobGlnaHQgPSBudWxsO1xuICAgICAgICB0aGlzLmdyYWJEcmFnRm9jdXNIaWdobGlnaHQuZGlzcG9zZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIG93bnNJbnRlcmFjdGl2ZUhpZ2hsaWdodCApIHtcbiAgICAgICAgaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggbm9kZSApICYmIG5vZGUuc2V0SW50ZXJhY3RpdmVIaWdobGlnaHQoIG51bGwgKTtcbiAgICAgICAgdGhpcy5ncmFiRHJhZ0ludGVyYWN0aXZlSGlnaGxpZ2h0LmRpc3Bvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5ncmFiQ3VlTm9kZS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmRyYWdDdWVOb2RlLmRldGFjaCgpO1xuXG4gICAgICB0aGlzLmdyYWJEcmFnTW9kZWwuZGlzcG9zZSgpO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBuYW1lIHRvIGJlIHVzZWQgd2hlbiBpbiB0aGUgXCJncmFiYmVkXCIgc3RhdGUuIElmIGFscmVhZHkgZ3JhYmJlZCwgdGhlIG5hbWUgaXMgc2V0IHRvIHRoZSB0YXJnZXQgTm9kZSByaWdodCBhd2F5LlxuICAgKi9cbiAgcHVibGljIHNldEdyYWJiZWRTdGF0ZUFjY2Vzc2libGVOYW1lKCBuYW1lOiBQRE9NVmFsdWVUeXBlICk6IHZvaWQge1xuICAgIHRoaXMuX2dyYWJiZWRTdGF0ZUFjY2Vzc2libGVOYW1lID0gbmFtZTtcbiAgICB0aGlzLmdyYWJiZWRTdGF0ZU9wdGlvbnMuaW5uZXJDb250ZW50ID0gdGhpcy5fZ3JhYmJlZFN0YXRlQWNjZXNzaWJsZU5hbWU7XG4gICAgdGhpcy5ncmFiYmVkU3RhdGVPcHRpb25zLmFyaWFMYWJlbCA9IHRoaXMuX2dyYWJiZWRTdGF0ZUFjY2Vzc2libGVOYW1lO1xuXG4gICAgLy8gSWYgZ3JhYmJlZCwgbXV0YXRlIHRoZSBOb2RlIHdpdGggdGhlc2Ugb3B0aW9ucyByaWdodCBhd2F5XG4gICAgaWYgKCB0aGlzLmdyYWJEcmFnTW9kZWwuaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LnZhbHVlID09PSAnZ3JhYmJlZCcgKSB7XG4gICAgICB0aGlzLm5vZGUubXV0YXRlKCB0aGlzLmdyYWJiZWRTdGF0ZU9wdGlvbnMgKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IGdyYWJiZWRTdGF0ZUFjY2Vzc2libGVOYW1lKCBuYW1lOiBQRE9NVmFsdWVUeXBlICkge1xuICAgIHRoaXMuc2V0R3JhYmJlZFN0YXRlQWNjZXNzaWJsZU5hbWUoIG5hbWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBuYW1lIHRvIGJlIHVzZWQgd2hlbiBpbiB0aGUgXCJpZGxlXCIgc3RhdGUuIElmIGFscmVhZHkgaWRsZSwgdGhlIG5hbWUgaXMgc2V0IHRvIHRoZSB0YXJnZXQgTm9kZSByaWdodCBhd2F5LlxuICAgKiBAcGFyYW0gbmFtZVxuICAgKi9cbiAgcHVibGljIHNldElkbGVTdGF0ZUFjY2Vzc2libGVOYW1lKCBuYW1lOiBQRE9NVmFsdWVUeXBlICk6IHZvaWQge1xuICAgIHRoaXMuX2lkbGVTdGF0ZUFjY2Vzc2libGVOYW1lID0gbmFtZTtcbiAgICB0aGlzLmlkbGVTdGF0ZU9wdGlvbnMuaW5uZXJDb250ZW50ID0gdGhpcy5faWRsZVN0YXRlQWNjZXNzaWJsZU5hbWU7XG5cbiAgICAvLyBTZXR0aW5nIHRoZSBhcmlhLWxhYmVsIG9uIHRoZSBpbnRlcmFjdGlvblN0YXRlIGVsZW1lbnQgZml4ZXMgYSBidWcgd2l0aCBWb2ljZU92ZXIgaW4gU2FmYXJpIHdoZXJlIHRoZSBhcmlhIHJvbGVcbiAgICAvLyBmcm9tIHRoZSBncmFiYmVkIHN0YXRlIGlzIG5ldmVyIGNsZWFyZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy82ODhcbiAgICB0aGlzLmlkbGVTdGF0ZU9wdGlvbnMuYXJpYUxhYmVsID0gdGhpcy5faWRsZVN0YXRlQWNjZXNzaWJsZU5hbWU7XG5cbiAgICAvLyBpZiBpZGxlLCBtdXRhdGUgdGhlIE5vZGUgd2l0aCB0aGVzZSBvcHRpb25zIHJpZ2h0IGF3YXlcbiAgICBpZiAoIHRoaXMuZ3JhYkRyYWdNb2RlbC5pbnRlcmFjdGlvblN0YXRlUHJvcGVydHkudmFsdWUgPT09ICdpZGxlJyApIHtcbiAgICAgIHRoaXMubm9kZS5tdXRhdGUoIHRoaXMuaWRsZVN0YXRlT3B0aW9ucyApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgaWRsZVN0YXRlQWNjZXNzaWJsZU5hbWUoIG5hbWU6IFBET01WYWx1ZVR5cGUgKSB7XG4gICAgdGhpcy5zZXRJZGxlU3RhdGVBY2Nlc3NpYmxlTmFtZSggbmFtZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaGVscCB0ZXh0IGZvciBrZWJvYXJkIGlucHV0LiBJZiB0aGUgcnVudGltZSBzdXBwb3J0cyBcImdlc3R1cmUgZGVzY3JpcHRpb25cIiB0aGlzIGlzIGEgbm8tb3AuXG4gICAqL1xuICBwdWJsaWMgc2V0S2V5Ym9hcmRIZWxwVGV4dCggdGV4dDogUERPTVZhbHVlVHlwZSApOiB2b2lkIHtcbiAgICB0aGlzLl9rZXlib2FyZEhlbHBUZXh0ID0gdGV4dDtcbiAgICBpZiAoICF0aGlzLnN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uICkge1xuICAgICAgdGhpcy5ub2RlLmRlc2NyaXB0aW9uQ29udGVudCA9IHRleHQ7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldEtleWJvYXJkSGVscFRleHQoKTogUERPTVZhbHVlVHlwZSB7XG4gICAgcmV0dXJuIHRoaXMuX2tleWJvYXJkSGVscFRleHQ7XG4gIH1cblxuICBwdWJsaWMgc2V0IGtleWJvYXJkSGVscFRleHQoIHRleHQ6IFBET01WYWx1ZVR5cGUgKSB7XG4gICAgdGhpcy5zZXRLZXlib2FyZEhlbHBUZXh0KCB0ZXh0ICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleWJvYXJkSGVscFRleHQoKTogUERPTVZhbHVlVHlwZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0S2V5Ym9hcmRIZWxwVGV4dCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaGVscCB0ZXh0IGZvciBnZXN0dXJlIGlucHV0LiBJZiB0aGUgcnVudGltZSBkb2VzIG5vdCBzdXBwb3J0IFwiZ2VzdHVyZSBkZXNjcmlwdGlvblwiIHRoaXMgaXMgYSBuby1vcC5cbiAgICovXG4gIHB1YmxpYyBzZXRHZXN0dXJlSGVscFRleHQoIHRleHQ6IFBET01WYWx1ZVR5cGUgKTogdm9pZCB7XG4gICAgdGhpcy5fZ2VzdHVyZUhlbHBUZXh0ID0gdGV4dDtcbiAgICBpZiAoIHRoaXMuc3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb24gKSB7XG4gICAgICB0aGlzLm5vZGUuZGVzY3JpcHRpb25Db250ZW50ID0gdGV4dDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0R2VzdHVyZUhlbHBUZXh0KCk6IFBET01WYWx1ZVR5cGUge1xuICAgIHJldHVybiB0aGlzLl9nZXN0dXJlSGVscFRleHQ7XG4gIH1cblxuICBwdWJsaWMgc2V0IGdlc3R1cmVIZWxwVGV4dCggdGV4dDogUERPTVZhbHVlVHlwZSApIHtcbiAgICB0aGlzLnNldEdlc3R1cmVIZWxwVGV4dCggdGV4dCApO1xuICB9XG5cbiAgcHVibGljIGdldCBnZXN0dXJlSGVscFRleHQoKTogUERPTVZhbHVlVHlwZSB7XG4gICAgcmV0dXJuIHRoaXMuX2dlc3R1cmVIZWxwVGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGNhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBncmFiYmVkIC0gY2FsbGVkIHdoZW4gc3dpdGNoaW5nIGZyb20gaWRsZSB0byBncmFiYmVkIHN0YXRlLlxuICAgKi9cbiAgcHVibGljIHNldE9uR3JhYiggb25HcmFiOiBWb2lkRnVuY3Rpb24gKTogdm9pZCB7XG4gICAgdGhpcy5fb25HcmFiID0gb25HcmFiO1xuICB9XG5cbiAgcHVibGljIGdldE9uR3JhYigpOiBWb2lkRnVuY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLl9vbkdyYWI7XG4gIH1cblxuICBwdWJsaWMgc2V0IG9uR3JhYiggb25HcmFiOiBWb2lkRnVuY3Rpb24gKSB7XG4gICAgdGhpcy5zZXRPbkdyYWIoIG9uR3JhYiApO1xuICB9XG5cbiAgcHVibGljIGdldCBvbkdyYWIoKTogVm9pZEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5nZXRPbkdyYWIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGNhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiByZWxlYXNlZCAtIGNhbGxlZCB3aGVuIHN3aXRjaGluZyBmcm9tIGdyYWJiZWQgdG8gaWRsZSBzdGF0ZS5cbiAgICovXG4gIHB1YmxpYyBzZXRPblJlbGVhc2UoIG9uUmVsZWFzZTogVm9pZEZ1bmN0aW9uICk6IHZvaWQge1xuICAgIHRoaXMuX29uUmVsZWFzZSA9IG9uUmVsZWFzZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRPblJlbGVhc2UoKTogVm9pZEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fb25SZWxlYXNlO1xuICB9XG5cbiAgcHVibGljIHNldCBvblJlbGVhc2UoIG9uUmVsZWFzZTogVm9pZEZ1bmN0aW9uICkge1xuICAgIHRoaXMuc2V0T25SZWxlYXNlKCBvblJlbGVhc2UgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgb25SZWxlYXNlKCk6IFZvaWRGdW5jdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0T25SZWxlYXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBwb3NpdGlvbnMgb2YgdGhlIGdyYWJDdWVOb2RlIGFuZCBkcmFnQ3VlTm9kZSByZWxhdGl2ZSB0byB0aGUgdGFyZ2V0IE5vZGUuIFRoZSBwb3NpdGlvbiBpcyBkZXRlcm1pbmVkIGJ5XG4gICAqIHRoZSBDdWVQb3NpdGlvbiBhbmQgdGhlIG9mZnNldHMuXG4gICAqL1xuICBwdWJsaWMgcmVwb3NpdGlvbkN1ZXMoIG1hdHJpeDogTWF0cml4MyB8IG51bGwgKTogdm9pZCB7XG4gICAgaWYgKCBtYXRyaXggKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uQ3VlTm9kZSggbWF0cml4LCB0aGlzLmdyYWJDdWVOb2RlLCB0aGlzLmdyYWJDdWVQb3NpdGlvbiwgdGhpcy5ncmFiQ3VlT2Zmc2V0ICk7XG4gICAgICB0aGlzLnBvc2l0aW9uQ3VlTm9kZSggbWF0cml4LCB0aGlzLmRyYWdDdWVOb2RlLCB0aGlzLmRyYWdDdWVQb3NpdGlvbiwgdGhpcy5kcmFnQ3VlT2Zmc2V0ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBjdWVOb2RlIHJlbGF0aXZlIHRvIHRoZSBib3VuZHMgaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lLCBmcm9tXG4gICAqIHRoZSBwcm92aWRlZCBwb3NpdGlvbiB0eXBlIGFuZCBvZmZzZXRzLlxuICAgKlxuICAgKiBAcGFyYW0gbWF0cml4IC0gdGhlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBmcm9tIHRoZSBsb2NhbCBmcmFtZSBvZiB0aGUgdGFyZ2V0IE5vZGUgdG8gdGhlIGxvY2FsIGZyYW1lIG9mIHRoZSBpbnRlcmFjdGlvbkN1ZVBhcmVudFxuICAgKiBAcGFyYW0gY3VlTm9kZSAtIHRoZSBOb2RlIHRvIHBvc2l0aW9uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiAtIHRoZSBwb3NpdGlvbiBvZiB0aGUgY3VlTm9kZSByZWxhdGl2ZSB0byB0aGUgYm91bmRzXG4gICAqIEBwYXJhbSBvZmZzZXQgLSB0aGUgb2Zmc2V0IG9mIHRoZSBjdWVOb2RlIHJlbGF0aXZlIHRvIHRoZSBwb3NpdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBwb3NpdGlvbkN1ZU5vZGUoIG1hdHJpeDogTWF0cml4MywgY3VlTm9kZTogTm9kZSwgcG9zaXRpb246IEN1ZVBvc2l0aW9uLCBvZmZzZXQ6IFZlY3RvcjIgKTogdm9pZCB7XG5cbiAgICAvLyBUaGUgYm91bmRzIGZvciB0aGUgTm9kZSBtYXkgbm90IGJlIGZpbml0ZSBkdXJpbmcgY29uc3RydWN0aW9uLlxuICAgIC8vIFNraXAgcG9zaXRpb25pbmcgaWYgdGhlIGN1ZU5vZGUgaXMgbm90IHNob3duIGZvciBwZXJmb3JtYW5jZS5cbiAgICBpZiAoICF0aGlzLm5vZGUuYm91bmRzLmlzRmluaXRlKCkgfHwgIWN1ZU5vZGUudmlzaWJsZSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGFyZW50UG9pbnRCb3VuZHNHZXR0ZXI6IHN0cmluZztcbiAgICBsZXQgY3VlTm9kZVBvc2l0aW9uU2V0dGVyOiBzdHJpbmc7XG5cbiAgICBpZiAoIHBvc2l0aW9uID09PSAnY2VudGVyJyApIHtcbiAgICAgIHBhcmVudFBvaW50Qm91bmRzR2V0dGVyID0gJ2NlbnRlcic7XG4gICAgICBjdWVOb2RlUG9zaXRpb25TZXR0ZXIgPSAnY2VudGVyJztcbiAgICB9XG4gICAgZWxzZSBpZiAoIHBvc2l0aW9uID09PSAndG9wJyApIHtcbiAgICAgIHBhcmVudFBvaW50Qm91bmRzR2V0dGVyID0gJ2NlbnRlclRvcCc7XG4gICAgICBjdWVOb2RlUG9zaXRpb25TZXR0ZXIgPSAnY2VudGVyQm90dG9tJztcbiAgICB9XG4gICAgZWxzZSBpZiAoIHBvc2l0aW9uID09PSAnYm90dG9tJyApIHtcbiAgICAgIHBhcmVudFBvaW50Qm91bmRzR2V0dGVyID0gJ2NlbnRlckJvdHRvbSc7XG4gICAgICBjdWVOb2RlUG9zaXRpb25TZXR0ZXIgPSAnY2VudGVyVG9wJztcbiAgICB9XG4gICAgZWxzZSBpZiAoIHBvc2l0aW9uID09PSAnbGVmdCcgKSB7XG4gICAgICBwYXJlbnRQb2ludEJvdW5kc0dldHRlciA9ICdsZWZ0Q2VudGVyJztcbiAgICAgIGN1ZU5vZGVQb3NpdGlvblNldHRlciA9ICdyaWdodENlbnRlcic7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyApIHtcbiAgICAgIHBhcmVudFBvaW50Qm91bmRzR2V0dGVyID0gJ3JpZ2h0Q2VudGVyJztcbiAgICAgIGN1ZU5vZGVQb3NpdGlvblNldHRlciA9ICdsZWZ0Q2VudGVyJztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgYHVua25vd24gcG9zaXRpb246ICR7cG9zaXRpb259YCApO1xuICAgIH1cblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBzbyBhIHN0cmluZyBjYW4gYmUgdXNlZCB0byBhY2Nlc3MgdGhlIEJvdW5kczIgZmllbGQuXG4gICAgY29uc3QgbG9jYWxQb2ludCA9IHRoaXMubm9kZS5wYXJlbnRUb0xvY2FsUG9pbnQoIHRoaXMubm9kZS5ib3VuZHNbIHBhcmVudFBvaW50Qm91bmRzR2V0dGVyIF0gKTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBzbyBhIHN0cmluZyBjYW4gYmUgdXNlZCB0byBhY2Nlc3MgdGhlIE5vZGUgc2V0dGVyLlxuICAgIGN1ZU5vZGVbIGN1ZU5vZGVQb3NpdGlvblNldHRlciBdID0gbWF0cml4LnRpbWVzVmVjdG9yMiggbG9jYWxQb2ludCApLnBsdXNYWSggb2Zmc2V0LngsIG9mZnNldC55ICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBub2RlIHRvIHN3aXRjaCBtb2RhbGl0aWVzIGJldHdlZW4gYmVpbmcgZ3JhYmJlZCwgYW5kIGlkbGUuIFRoaXMgZnVuY3Rpb24gaG9sZHMgY29kZSB0aGF0IHNob3VsZFxuICAgKiBiZSBjYWxsZWQgd2hlbiBzd2l0Y2hpbmcgZnJvbSBhbnkgc3RhdGUgdG8gYW55IG90aGVyIHN0YXRlLlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVGcm9tU3RhdGUoKTogdm9pZCB7XG4gICAgY29uc3QgaW50ZXJhY3Rpb25TdGF0ZSA9IHRoaXMuZ3JhYkRyYWdNb2RlbC5pbnRlcmFjdGlvblN0YXRlUHJvcGVydHkudmFsdWU7XG5cbiAgICBjb25zdCBsaXN0ZW5lcnNUb1JlbW92ZSA9IGludGVyYWN0aW9uU3RhdGUgPT09ICdpZGxlJyA/IHRoaXMubGlzdGVuZXJzV2hpbGVHcmFiYmVkIDogdGhpcy5saXN0ZW5lcnNXaGlsZUlkbGU7XG5cbiAgICAvLyBpbnRlcnJ1cHQgcHJpb3IgaW5wdXQsIHJlc2V0IHRoZSBrZXkgc3RhdGUgb2YgdGhlIGRyYWcgaGFuZGxlciBieSBpbnRlcnJ1cHRpbmcgdGhlIGRyYWcuIERvbid0IGludGVycnVwdCBhbGxcbiAgICAvLyBpbnB1dCwgYnV0IGluc3RlYWQganVzdCB0aG9zZSB0byBiZSByZW1vdmVkLlxuICAgIGxpc3RlbmVyc1RvUmVtb3ZlLmZvckVhY2goIGxpc3RlbmVyID0+IGxpc3RlbmVyLmludGVycnVwdCAmJiBsaXN0ZW5lci5pbnRlcnJ1cHQoKSApO1xuXG4gICAgLy8gcmVtb3ZlIGFsbCBwcmV2aW91cyBsaXN0ZW5lcnMgZnJvbSB0aGUgbm9kZVxuICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lcnMoIGxpc3RlbmVyc1RvUmVtb3ZlICk7XG5cbiAgICAvLyBUbyBzdXBwb3J0IGdlc3R1cmUgYW5kIG1vYmlsZSBzY3JlZW4gcmVhZGVycywgd2UgY2hhbmdlIHRoZSByb2xlZGVzY3JpcHRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy81MzZcbiAgICAvLyBCeSBkZWZhdWx0LCB0aGUgaWRsZSBnZXRzIGEgcm9sZWRlc2NyaXB0aW9uIHRvIGZvcmNlIHRoZSBBVCB0byBzYXkgaXRzIHJvbGUuIFRoaXMgZml4ZXMgYSBidWcgaW4gVm9pY2VPdmVyXG4gICAgLy8gd2hlcmUgaXQgZmFpbHMgdG8gdXBkYXRlIHRoZSByb2xlIGFmdGVyIHR1cm5pbmcgYmFjayBpbnRvIGFuIGlkbGUuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzY4OC5cbiAgICB0aGlzLm5vZGUuc2V0UERPTUF0dHJpYnV0ZSggJ2FyaWEtcm9sZWRlc2NyaXB0aW9uJyxcbiAgICAgICggaW50ZXJhY3Rpb25TdGF0ZSA9PT0gJ2dyYWJiZWQnIHx8IHRoaXMuc3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb24gKSA/IG1vdmFibGVTdHJpbmdQcm9wZXJ0eSA6IGJ1dHRvblN0cmluZ1Byb3BlcnR5XG4gICAgKTtcblxuICAgIHRoaXMudXBkYXRlQXJpYURlc2NyaWJlZGJ5KCBpbnRlcmFjdGlvblN0YXRlICk7XG5cbiAgICAvLyB1cGRhdGUgdGhlIFBET00gb2YgdGhlIG5vZGVcbiAgICBjb25zdCBub2RlT3B0aW9ucyA9IGludGVyYWN0aW9uU3RhdGUgPT09ICdpZGxlJyA/IHRoaXMuaWRsZVN0YXRlT3B0aW9ucyA6IHRoaXMuZ3JhYmJlZFN0YXRlT3B0aW9ucztcbiAgICB0aGlzLm5vZGUubXV0YXRlKCBub2RlT3B0aW9ucyApO1xuICAgIGFzc2VydCAmJiB0aGlzLmdyYWJEcmFnTW9kZWwuZW5hYmxlZFByb3BlcnR5LnZhbHVlICYmIGFzc2VydCggdGhpcy5ub2RlLmZvY3VzYWJsZSwgJ0dyYWJEcmFnSW50ZXJhY3Rpb24gbm9kZSBtdXN0IHJlbWFpbiBmb2N1c2FibGUgYWZ0ZXIgbXV0YXRpb24nICk7XG5cbiAgICBjb25zdCBsaXN0ZW5lcnNUb0FkZCA9IGludGVyYWN0aW9uU3RhdGUgPT09ICdpZGxlJyA/IHRoaXMubGlzdGVuZXJzV2hpbGVJZGxlIDogdGhpcy5saXN0ZW5lcnNXaGlsZUdyYWJiZWQ7XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVycyggbGlzdGVuZXJzVG9BZGQgKTtcblxuICAgIHRoaXMudXBkYXRlRm9jdXNIaWdobGlnaHRzKCk7XG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5Rm9yQ3VlcygpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ncmFiRHJhZ01vZGVsLmludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gaW50ZXJhY3Rpb25TdGF0ZSxcbiAgICAgICd1cGRhdGluZyBmcm9tIHN0YXRlIHNob3VsZCBub3QgY2hhbmdlIHRoZSBpbnRlcmFjdGlvbiBzdGF0ZS4nICk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUFyaWFEZXNjcmliZWRieSggaW50ZXJhY3Rpb25TdGF0ZTogR3JhYkRyYWdJbnRlcmFjdGlvblN0YXRlICk6IHZvaWQge1xuXG4gICAgaWYgKCBpbnRlcmFjdGlvblN0YXRlID09PSAnaWRsZScgJiYgdGhpcy5zaG91bGRBZGRBcmlhRGVzY3JpYmVkYnkoKSApIHtcblxuICAgICAgLy8gdGhpcyBub2RlIGlzIGFyaWEtZGVzY3JpYmVkYnkgaXRzIG93biBkZXNjcmlwdGlvbiBjb250ZW50LCBzbyB0aGF0IHRoZSBkZXNjcmlwdGlvbiBpcyByZWFkIGF1dG9tYXRpY2FsbHlcbiAgICAgIC8vIHdoZW4gZm91bmQgYnkgdGhlIHVzZXJcbiAgICAgICF0aGlzLm5vZGUuaGFzQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24oIHRoaXMuZGVzY3JpcHRpb25Bc3NvY2lhdGlvbk9iamVjdCApICYmXG4gICAgICB0aGlzLm5vZGUuYWRkQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24oIHRoaXMuZGVzY3JpcHRpb25Bc3NvY2lhdGlvbk9iamVjdCApO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gVGhpcyBub2RlIGlzIGFyaWEtZGVzY3JpYmVkYnkgaXRzIG93biBkZXNjcmlwdGlvbiBjb250ZW50IG9ubHkgd2hlbiBpZGxlLCBzbyB0aGF0IHRoZSBkZXNjcmlwdGlvbiBpc1xuICAgICAgLy8gcmVhZCBhdXRvbWF0aWNhbGx5IHdoZW4gZm91bmQgYnkgdGhlIHVzZXIgd2l0aCB0aGUgdmlydHVhbCBjdXJzb3IuIFJlbW92ZSBpdCBmb3IgZ3JhYmJlZFxuICAgICAgaWYgKCB0aGlzLm5vZGUuaGFzQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24oIHRoaXMuZGVzY3JpcHRpb25Bc3NvY2lhdGlvbk9iamVjdCApICkge1xuICAgICAgICB0aGlzLm5vZGUucmVtb3ZlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24oIHRoaXMuZGVzY3JpcHRpb25Bc3NvY2lhdGlvbk9iamVjdCApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGZvY3VzSGlnaGxpZ2h0cyBhY2NvcmRpbmcgdG8gaWYgd2UgYXJlIGluIGlkbGUgb3IgZ3JhYmJlZCBzdGF0ZVxuICAgKiBObyBuZWVkIHRvIHNldCB2aXNpYmlsaXR5IHRvIHRydWUsIGJlY2F1c2UgdGhhdCB3aWxsIGhhcHBlbiBmb3IgdXMgYnkgSGlnaGxpZ2h0T3ZlcmxheSBvbiBmb2N1cy5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlRm9jdXNIaWdobGlnaHRzKCk6IHZvaWQge1xuICAgIHRoaXMuZ3JhYkRyYWdGb2N1c0hpZ2hsaWdodC5zZXREYXNoZWQoIHRoaXMuZ3JhYkRyYWdNb2RlbC5pbnRlcmFjdGlvblN0YXRlUHJvcGVydHkudmFsdWUgPT09ICdncmFiYmVkJyApO1xuICAgIHRoaXMuZ3JhYkRyYWdJbnRlcmFjdGl2ZUhpZ2hsaWdodC5zZXREYXNoZWQoIHRoaXMuZ3JhYkRyYWdNb2RlbC5pbnRlcmFjdGlvblN0YXRlUHJvcGVydHkudmFsdWUgPT09ICdncmFiYmVkJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgY3VlcyBmb3IgYm90aCBpZGxlIGFuZCBncmFiYmVkIHN0YXRlcy5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlVmlzaWJpbGl0eUZvckN1ZXMoKTogdm9pZCB7XG4gICAgY29uc3Qgd2FzRHJhZ0N1ZVZpc2libGUgPSB0aGlzLmRyYWdDdWVOb2RlLnZpc2libGU7XG4gICAgY29uc3Qgd2FzR3JhYkN1ZVZpc2libGUgPSB0aGlzLmdyYWJDdWVOb2RlLnZpc2libGU7XG5cbiAgICB0aGlzLmRyYWdDdWVOb2RlLnZpc2libGUgPSB0aGlzLmdyYWJEcmFnTW9kZWwuZW5hYmxlZCAmJiB0aGlzLmdyYWJEcmFnTW9kZWwuaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LnZhbHVlID09PSAnZ3JhYmJlZCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGUuZm9jdXNlZCAmJiB0aGlzLnNob3VsZFNob3dEcmFnQ3VlTm9kZSgpO1xuICAgIHRoaXMuZ3JhYkN1ZU5vZGUudmlzaWJsZSA9IHRoaXMuZ3JhYkRyYWdNb2RlbC5lbmFibGVkICYmIHRoaXMuZ3JhYkRyYWdNb2RlbC5pbnRlcmFjdGlvblN0YXRlUHJvcGVydHkudmFsdWUgPT09ICdpZGxlJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZS5mb2N1c2VkICYmIHRoaXMuc2hvdWxkU2hvd0dyYWJDdWVOb2RlKCk7XG5cbiAgICAvLyBJZiB2aXNpYmlsaXR5IG9mIGVpdGhlciBoYXMgY2hhbmdlZCwgcmVwb3NpdGlvbiB0aGUgY3Vlcy4gRm9yIHBlcmZvcm1hbmNlLCB0aGUgY3VlcyBhcmUgb25seSByZXBvc2l0aW9uZWRcbiAgICAvLyB3aGlsZSB0aGV5IGFyZSBzaG93bi5cbiAgICBpZiAoIHdhc0RyYWdDdWVWaXNpYmxlICE9PSB0aGlzLmRyYWdDdWVOb2RlLnZpc2libGUgfHwgd2FzR3JhYkN1ZVZpc2libGUgIT09IHRoaXMuZ3JhYkN1ZU5vZGUudmlzaWJsZSApIHtcbiAgICAgIHRoaXMucmVwb3NpdGlvbkN1ZXMoIHRoaXMubWF0cml4QmV0d2VlblByb3BlcnR5LnZhbHVlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbGwgbGlzdGVuZXJzIHRvIG5vZGVcbiAgICovXG4gIHByaXZhdGUgYWRkSW5wdXRMaXN0ZW5lcnMoIGxpc3RlbmVyczogVElucHV0TGlzdGVuZXJbXSApOiB2b2lkIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLm5vZGUuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXJzWyBpIF0gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZnJvbSB0aGUgbm9kZS4gQ2FsbGVkIGZyb20gZGlzcG9zZSwgc28gaXQgaXMgbmljZSB0byBiZSBncmFjZWZ1bC5cbiAgICovXG4gIHByaXZhdGUgcmVtb3ZlSW5wdXRMaXN0ZW5lcnMoIGxpc3RlbmVyczogVElucHV0TGlzdGVuZXJbXSApOiB2b2lkIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc1sgaSBdO1xuICAgICAgaWYgKCB0aGlzLm5vZGUuaGFzSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKSApIHtcbiAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUlucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEludGVycnVwdCB0aGUgZ3JhYiBkcmFnIGludGVycmFjdGlvbiAtIGludGVycnVwdHMgYW55IGxpc3RlbmVycyBhdHRhY2hlZCBhbmQgbWFrZXMgc3VyZSB0aGVcbiAgICogTm9kZSBpcyBiYWNrIGluIGl0cyBcImlkbGVcIiBzdGF0ZS5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHQoKTogdm9pZCB7XG5cbiAgICAvLyBJbnRlcnJ1cHRpbmcgdGhpcyBsaXN0ZW5lciB3aWxsIHNldCB1cyBiYWNrIHRvIGlkbGVcbiAgICB0aGlzLnByZXNzUmVsZWFzZUxpc3RlbmVyLmludGVycnVwdCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ncmFiRHJhZ01vZGVsLmludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gJ2lkbGUnLCAnZGlzYWJsZWQgZ3JhYkRyYWdJbnRlcmFjdGlvbnMgbXVzdCBiZSBpbiBcImlkbGVcIiBzdGF0ZS4nICk7XG4gIH1cblxuICAvKipcbiAgICogT2Z0ZW4gb25HcmFiIGNhbGxiYWNrcyBuZWVkIHRvIGtub3cgd2hldGhlciB0aGUgZ3JhYiB3YXMgdHJpZ2dlcmVkIGZyb20ga2V5Ym9hcmQvcGRvbSwgaW4gd2hpY2ggY2FzZSBpdCBzaG91bGRcbiAgICogdHJpZ2dlciBkZXNjcmlwdGlvbiwgT1IgdHJpZ2dlcmVkIHZpYSBtb3VzZS90b3VjaCB3aGljaCBtYXkgbm90IHRyaWdnZXIgZGVzY3JpcHRpb24gYmVjYXVzZSBhbm90aGVyIGxpc3RlbmVyIG1heVxuICAgKiBiZSByZXNwb25zaWJsZS5cbiAgICovXG4gIHB1YmxpYyBpc0lucHV0RnJvbU1vdXNlT3JUb3VjaCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wcmVzc1JlbGVhc2VMaXN0ZW5lci5pc1ByZXNzZWQ7XG4gIH1cblxuICBwcml2YXRlIHdpcmVVcERlc2NyaXB0aW9uQW5kVm9pY2luZ1Jlc3BvbnNlcyggbm9kZTogTm9kZSApOiB2b2lkIHtcblxuICAgIC8vIFwicmVsZWFzZWRcIiBhbGVydHMgYXJlIGFzc2VydGl2ZSBzbyB0aGF0IGEgcGlsZSB1cCBvZiBhbGVydHMgZG9lc24ndCBoYXBwZW4gd2l0aCByYXBpZCBtb3ZlbWVudCwgc2VlXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JhbGxvb25zLWFuZC1zdGF0aWMtZWxlY3RyaWNpdHkvaXNzdWVzLzQ5MVxuICAgIGNvbnN0IHJlbGVhc2VkVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgge1xuICAgICAgYWxlcnQ6IG5ldyBSZXNwb25zZVBhY2tldCggeyBvYmplY3RSZXNwb25zZTogcmVsZWFzZWRTdHJpbmdQcm9wZXJ0eSB9ICksXG5cbiAgICAgIC8vIFRoaXMgd2FzIGJlaW5nIG9ic2N1cmVkIGJ5IG90aGVyIG1lc3NhZ2VzLCB0aGUgcHJpb3JpdHkgaGVscHMgbWFrZSBzdXJlIGl0IGlzIGhlYXJkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZyaWN0aW9uL2lzc3Vlcy8zMjVcbiAgICAgIHByaW9yaXR5OiBVdHRlcmFuY2UuTUVESVVNX1BSSU9SSVRZLFxuXG4gICAgICBhbm5vdW5jZXJPcHRpb25zOiB7XG4gICAgICAgIGFyaWFMaXZlUHJpb3JpdHk6IEFyaWFMaXZlQW5ub3VuY2VyLkFyaWFMaXZlLkFTU0VSVElWRSAvLyBmb3IgQXJpYUxpdmVBbm5vdW5jZXJcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gcmVsZWFzZWRVdHRlcmFuY2UuZGlzcG9zZSgpICk7XG5cbiAgICBpZiAoIGlzVm9pY2luZyggbm9kZSApICkge1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLnZvaWNpbmdGb2N1c0xpc3RlbmVyID09PSBub2RlLmRlZmF1bHRGb2N1c0xpc3RlbmVyLFxuICAgICAgICAnR3JhYkRyYWdJbnRlcmFjdGlvbiBzZXRzIGl0cyBvd24gdm9pY2luZ0ZvY3VzTGlzdGVuZXIuJyApO1xuXG4gICAgICAvLyBzYW5pdHkgY2hlY2sgb24gdGhlIHZvaWNpbmcgaW50ZXJmYWNlIEFQSS5cbiAgICAgIGFzc2VydEhhc1Byb3BlcnRpZXMoIG5vZGUsIFsgJ3ZvaWNpbmdGb2N1c0xpc3RlbmVyJyBdICk7XG5cbiAgICAgIGNvbnN0IHZvaWNpbmdGb2N1c1V0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHtcbiAgICAgICAgYWxlcnQ6IG5ldyBSZXNwb25zZVBhY2tldCgpLFxuICAgICAgICBhbm5vdW5jZXJPcHRpb25zOiB7XG4gICAgICAgICAgY2FuY2VsT3RoZXI6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHZvaWNpbmdGb2N1c1V0dGVyYW5jZS5kaXNwb3NlKCkgKTtcblxuICAgICAgbm9kZS52b2ljaW5nRm9jdXNMaXN0ZW5lciA9ICgpID0+IHtcblxuICAgICAgICAvLyBXaGVuIHN3YXBwaW5nIGZyb20gaW50ZXJhY3Rpb25TdGF0ZSB0byBncmFiYmVkLCB0aGUgZ3JhYmJlZCBlbGVtZW50IHdpbGwgYmUgZm9jdXNlZCwgaWdub3JlIHRoYXQgY2FzZSBoZXJlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZyaWN0aW9uL2lzc3Vlcy8yMTNcbiAgICAgICAgdGhpcy5ncmFiRHJhZ01vZGVsLmludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gJ2lkbGUnICYmIG5vZGUuZGVmYXVsdEZvY3VzTGlzdGVuZXIoKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFRoZXNlIFV0dGVyYW5jZXMgc2hvdWxkIG9ubHkgYmUgYW5ub3VuY2VkIGlmIHRoZSBOb2RlIGlzIGdsb2JhbGx5IHZpc2libGUgYW5kIHZvaWNpbmdWaXNpYmxlLlxuICAgICAgVm9pY2luZy5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUoIHJlbGVhc2VkVXR0ZXJhbmNlLCBub2RlICk7XG4gICAgICBWb2ljaW5nLnJlZ2lzdGVyVXR0ZXJhbmNlVG9Wb2ljaW5nTm9kZSggdm9pY2luZ0ZvY3VzVXR0ZXJhbmNlLCBub2RlICk7XG5cbiAgICAgIHRoaXMub25HcmFiQnV0dG9uRm9jdXNFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICAgIGlmICggdGhpcy5ncmFiRHJhZ01vZGVsLmVuYWJsZWQgJiYgdGhpcy5zaG91bGRTaG93R3JhYkN1ZU5vZGUoKSApIHtcbiAgICAgICAgICBjb25zdCBhbGVydCA9IHZvaWNpbmdGb2N1c1V0dGVyYW5jZS5hbGVydCEgYXMgUmVzcG9uc2VQYWNrZXQ7XG4gICAgICAgICAgYWxlcnQuaGludFJlc3BvbnNlID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuZ3JhYkRyYWcuc3BhY2VUb0dyYWJPclJlbGVhc2VTdHJpbmdQcm9wZXJ0eTtcbiAgICAgICAgICBWb2ljaW5nLmFsZXJ0VXR0ZXJhbmNlKCB2b2ljaW5nRm9jdXNVdHRlcmFuY2UgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgICB0aGlzLmdyYWJEcmFnTW9kZWwucmVzZXRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB2b2ljaW5nRm9jdXNVdHRlcmFuY2UucmVzZXQoKSApO1xuICAgIH1cblxuICAgIC8vIFdoZW4gcmVsZWFzZWQsIHdlIHdhbnQgZGVzY3JpcHRpb24gYW5kIHZvaWNpbmcgdG8gc2F5IHNvLlxuICAgIHRoaXMuZ3JhYkRyYWdNb2RlbC5yZWxlYXNlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgIHRoaXMubm9kZS5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCByZWxlYXNlZFV0dGVyYW5jZSApO1xuICAgICAgaXNWb2ljaW5nKCBub2RlICkgJiYgVm9pY2luZy5hbGVydFV0dGVyYW5jZSggcmVsZWFzZWRVdHRlcmFuY2UgKTtcbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdG8gaW5pdGlhbCBzdGF0ZVxuICAgKi9cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuZ3JhYkRyYWdNb2RlbC5yZXNldCgpO1xuICB9XG5cbiAgcHVibGljIGdldCBlbmFibGVkUHJvcGVydHkoKTogVFByb3BlcnR5PGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5ncmFiRHJhZ01vZGVsLmVuYWJsZWRQcm9wZXJ0eTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ncmFiRHJhZ01vZGVsLmVuYWJsZWQ7XG4gIH1cblxuICBwdWJsaWMgc2V0IGVuYWJsZWQoIGVuYWJsZWQ6IGJvb2xlYW4gKSB7XG4gICAgdGhpcy5ncmFiRHJhZ01vZGVsLmVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IGVuYWJsZWQ7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdHcmFiRHJhZ0ludGVyYWN0aW9uJywgR3JhYkRyYWdJbnRlcmFjdGlvbiApOyJdLCJuYW1lcyI6WyJEaXNwb3NhYmxlIiwiRW1pdHRlciIsIlZlY3RvcjIiLCJhc3NlcnRIYXNQcm9wZXJ0aWVzIiwiZ2V0R2xvYmFsIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJTdHJpbmdVdGlscyIsIkRyYWdMaXN0ZW5lciIsIkhpZ2hsaWdodEZyb21Ob2RlIiwiSGlnaGxpZ2h0UGF0aCIsImlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJpc1ZvaWNpbmciLCJLZXlib2FyZERyYWdEaXJlY3Rpb25Ub0tleVN0cmluZ1Byb3BlcnRpZXNNYXAiLCJLZXlib2FyZExpc3RlbmVyIiwiTWF0cml4QmV0d2VlblByb3BlcnR5IiwiTm9kZSIsIlBET01QZWVyIiwiVm9pY2luZyIsIlRhbmRlbSIsIkFyaWFMaXZlQW5ub3VuY2VyIiwiUmVzcG9uc2VQYWNrZXQiLCJVdHRlcmFuY2UiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkdyYWJSZWxlYXNlQ3VlTm9kZSIsIkdyYWJEcmFnTW9kZWwiLCJHcmFiRHJhZ1VzYWdlVHJhY2tlciIsImdyYWJQYXR0ZXJuU3RyaW5nU3RyaW5nUHJvcGVydHkiLCJhMTF5IiwiZ3JhYkRyYWciLCJncmFiUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiZ2VzdHVyZUhlbHBUZXh0UGF0dGVyblN0cmluZ1Byb3BlcnR5IiwibW92YWJsZVN0cmluZ1Byb3BlcnR5IiwiYnV0dG9uU3RyaW5nUHJvcGVydHkiLCJkZWZhdWx0T2JqZWN0VG9HcmFiU3RyaW5nUHJvcGVydHkiLCJyZWxlYXNlZFN0cmluZ1Byb3BlcnR5IiwiR3JhYkRyYWdJbnRlcmFjdGlvbiIsInNldEdyYWJiZWRTdGF0ZUFjY2Vzc2libGVOYW1lIiwibmFtZSIsIl9ncmFiYmVkU3RhdGVBY2Nlc3NpYmxlTmFtZSIsImdyYWJiZWRTdGF0ZU9wdGlvbnMiLCJpbm5lckNvbnRlbnQiLCJhcmlhTGFiZWwiLCJncmFiRHJhZ01vZGVsIiwiaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJub2RlIiwibXV0YXRlIiwiZ3JhYmJlZFN0YXRlQWNjZXNzaWJsZU5hbWUiLCJzZXRJZGxlU3RhdGVBY2Nlc3NpYmxlTmFtZSIsIl9pZGxlU3RhdGVBY2Nlc3NpYmxlTmFtZSIsImlkbGVTdGF0ZU9wdGlvbnMiLCJpZGxlU3RhdGVBY2Nlc3NpYmxlTmFtZSIsInNldEtleWJvYXJkSGVscFRleHQiLCJ0ZXh0IiwiX2tleWJvYXJkSGVscFRleHQiLCJzdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbiIsImRlc2NyaXB0aW9uQ29udGVudCIsImdldEtleWJvYXJkSGVscFRleHQiLCJrZXlib2FyZEhlbHBUZXh0Iiwic2V0R2VzdHVyZUhlbHBUZXh0IiwiX2dlc3R1cmVIZWxwVGV4dCIsImdldEdlc3R1cmVIZWxwVGV4dCIsImdlc3R1cmVIZWxwVGV4dCIsInNldE9uR3JhYiIsIm9uR3JhYiIsIl9vbkdyYWIiLCJnZXRPbkdyYWIiLCJzZXRPblJlbGVhc2UiLCJvblJlbGVhc2UiLCJfb25SZWxlYXNlIiwiZ2V0T25SZWxlYXNlIiwicmVwb3NpdGlvbkN1ZXMiLCJtYXRyaXgiLCJwb3NpdGlvbkN1ZU5vZGUiLCJncmFiQ3VlTm9kZSIsImdyYWJDdWVQb3NpdGlvbiIsImdyYWJDdWVPZmZzZXQiLCJkcmFnQ3VlTm9kZSIsImRyYWdDdWVQb3NpdGlvbiIsImRyYWdDdWVPZmZzZXQiLCJjdWVOb2RlIiwicG9zaXRpb24iLCJvZmZzZXQiLCJib3VuZHMiLCJpc0Zpbml0ZSIsInZpc2libGUiLCJwYXJlbnRQb2ludEJvdW5kc0dldHRlciIsImN1ZU5vZGVQb3NpdGlvblNldHRlciIsImFzc2VydCIsImxvY2FsUG9pbnQiLCJwYXJlbnRUb0xvY2FsUG9pbnQiLCJ0aW1lc1ZlY3RvcjIiLCJwbHVzWFkiLCJ4IiwieSIsInVwZGF0ZUZyb21TdGF0ZSIsImludGVyYWN0aW9uU3RhdGUiLCJsaXN0ZW5lcnNUb1JlbW92ZSIsImxpc3RlbmVyc1doaWxlR3JhYmJlZCIsImxpc3RlbmVyc1doaWxlSWRsZSIsImZvckVhY2giLCJsaXN0ZW5lciIsImludGVycnVwdCIsInJlbW92ZUlucHV0TGlzdGVuZXJzIiwic2V0UERPTUF0dHJpYnV0ZSIsInVwZGF0ZUFyaWFEZXNjcmliZWRieSIsIm5vZGVPcHRpb25zIiwiZW5hYmxlZFByb3BlcnR5IiwiZm9jdXNhYmxlIiwibGlzdGVuZXJzVG9BZGQiLCJhZGRJbnB1dExpc3RlbmVycyIsInVwZGF0ZUZvY3VzSGlnaGxpZ2h0cyIsInVwZGF0ZVZpc2liaWxpdHlGb3JDdWVzIiwic2hvdWxkQWRkQXJpYURlc2NyaWJlZGJ5IiwiaGFzQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24iLCJkZXNjcmlwdGlvbkFzc29jaWF0aW9uT2JqZWN0IiwiYWRkQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24iLCJyZW1vdmVBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiIsImdyYWJEcmFnRm9jdXNIaWdobGlnaHQiLCJzZXREYXNoZWQiLCJncmFiRHJhZ0ludGVyYWN0aXZlSGlnaGxpZ2h0Iiwid2FzRHJhZ0N1ZVZpc2libGUiLCJ3YXNHcmFiQ3VlVmlzaWJsZSIsImVuYWJsZWQiLCJmb2N1c2VkIiwic2hvdWxkU2hvd0RyYWdDdWVOb2RlIiwic2hvdWxkU2hvd0dyYWJDdWVOb2RlIiwibWF0cml4QmV0d2VlblByb3BlcnR5IiwibGlzdGVuZXJzIiwiaSIsImxlbmd0aCIsImFkZElucHV0TGlzdGVuZXIiLCJoYXNJbnB1dExpc3RlbmVyIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsInByZXNzUmVsZWFzZUxpc3RlbmVyIiwiaXNJbnB1dEZyb21Nb3VzZU9yVG91Y2giLCJpc1ByZXNzZWQiLCJ3aXJlVXBEZXNjcmlwdGlvbkFuZFZvaWNpbmdSZXNwb25zZXMiLCJyZWxlYXNlZFV0dGVyYW5jZSIsImFsZXJ0Iiwib2JqZWN0UmVzcG9uc2UiLCJwcmlvcml0eSIsIk1FRElVTV9QUklPUklUWSIsImFubm91bmNlck9wdGlvbnMiLCJhcmlhTGl2ZVByaW9yaXR5IiwiQXJpYUxpdmUiLCJBU1NFUlRJVkUiLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGlzcG9zZSIsInZvaWNpbmdGb2N1c0xpc3RlbmVyIiwiZGVmYXVsdEZvY3VzTGlzdGVuZXIiLCJ2b2ljaW5nRm9jdXNVdHRlcmFuY2UiLCJjYW5jZWxPdGhlciIsInJlZ2lzdGVyVXR0ZXJhbmNlVG9Wb2ljaW5nTm9kZSIsIm9uR3JhYkJ1dHRvbkZvY3VzRW1pdHRlciIsImhpbnRSZXNwb25zZSIsInNwYWNlVG9HcmFiT3JSZWxlYXNlU3RyaW5nUHJvcGVydHkiLCJhbGVydFV0dGVyYW5jZSIsInJlc2V0RW1pdHRlciIsInJlc2V0IiwicmVsZWFzZWRFbWl0dGVyIiwiYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSIsImtleWJvYXJkRHJhZ0xpc3RlbmVyIiwiaW50ZXJhY3Rpb25DdWVQYXJlbnQiLCJwcm92aWRlZE9wdGlvbnMiLCJvd25zRW5hYmxlZFByb3BlcnR5IiwiZmlyc3RQYXNzT3B0aW9ucyIsIm9iamVjdFRvR3JhYlN0cmluZyIsIl8iLCJub29wIiwiZ3JhYkN1ZU9wdGlvbnMiLCJ0cmFuc2Zvcm1Ob2RlVG9UcmFjayIsImdyYWJEcmFnVXNhZ2VUcmFja2VyIiwibnVtYmVyT2ZLZXlib2FyZEdyYWJzIiwiaW5wdXRFbmFibGVkIiwic2hvdWxkU2hvd0RyYWdDdWUiLCJwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJlbmFibGVkUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9GZWF0dXJlZCIsInRhbmRlbSIsIlJFUVVJUkVEIiwib3B0aW9ucyIsImZpbGxJbiIsIm9iamVjdFRvR3JhYiIsIm51bWJlck9mR3JhYnMiLCJ1bmRlZmluZWQiLCJpbmNsdWRlcyIsInBhcmVudCIsInRhZ05hbWUiLCJhcmlhUm9sZSIsImNvbnRhaW5lclRhZ05hbWUiLCJhcHBlbmREZXNjcmlwdGlvbiIsInBvc2l0aW9uSW5QRE9NIiwiYWNjZXNzaWJsZU5hbWUiLCJkZWZhdWx0SWRsZVN0YXRlQWNjZXNzaWJsZU5hbWUiLCJvdGhlck5vZGUiLCJ0aGlzRWxlbWVudE5hbWUiLCJQUklNQVJZX1NJQkxJTkciLCJvdGhlckVsZW1lbnROYW1lIiwiREVTQ1JJUFRJT05fU0lCTElORyIsImdyYWJiZWRFbWl0dGVyIiwibm9kZUZvY3VzSGlnaGxpZ2h0IiwiZm9jdXNIaWdobGlnaHQiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodCIsImZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlIiwiaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUiLCJvd25zRm9jdXNIaWdobGlnaHQiLCJzaGFwZVByb3BlcnR5Iiwib3duc0ludGVyYWN0aXZlSGlnaGxpZ2h0Iiwic2V0SW50ZXJhY3RpdmVIaWdobGlnaHQiLCJhZGRDaGlsZCIsImZyb21Db29yZGluYXRlRnJhbWUiLCJ0b0Nvb3JkaW5hdGVGcmFtZSIsInJlcG9zaXRpb25DdWVzTGlzdGVuZXIiLCJiaW5kIiwibGluayIsImd1YXJkR3JhYktleVByZXNzRnJvbUdyYWJiZWRTdGF0ZSIsImdyYWJCdXR0b25MaXN0ZW5lciIsImNsaWNrIiwiYmx1ciIsImtleWJvYXJkR3JhYiIsImZvY3VzIiwiZW1pdCIsImNvbmNhdCIsImRyYWdEaXZEb3duTGlzdGVuZXIiLCJrZXlzIiwiZmlyZSIsInJlbGVhc2UiLCJkcmFnRGl2VXBMaXN0ZW5lciIsImZpcmVPbkRvd24iLCJkcmFnRGl2RHJhZ2dlZExpc3RlbmVyIiwia2V5U3RyaW5nUHJvcGVydGllcyIsImdldCIsIm92ZXJyaWRlIiwiYWxsb3dPdmVybGFwIiwicHJlc3MiLCJldmVudCIsImlzRnJvbVBET00iLCJncmFiIiwic2hvdWxkUmVsZWFzZSIsImF0dGFjaCIsImNyZWF0ZVRhbmRlbSIsImxhenlMaW5rIiwiaW5wdXRFbmFibGVkTGlzdGVuZXIiLCJub2RlSW5wdXRFbmFibGVkIiwiaW5wdXRFbmFibGVkUHJvcGVydHkiLCJrZXlib2FyZFByZXNzZWRMaXN0ZW5lciIsImlzUHJlc3NlZFByb3BlcnR5IiwidW5saW5rIiwicmVtb3ZlUERPTUF0dHJpYnV0ZSIsInJlbW92ZUNoaWxkIiwiZGV0YWNoIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RCxPQUFPQSxnQkFBZ0Isb0NBQW9DO0FBQzNELE9BQU9DLGFBQWEsaUNBQWlDO0FBR3JELE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaURDLEdBQ0QsT0FBT0MseUJBQXlCLGtEQUFrRDtBQUNsRixPQUFPQyxlQUFlLHdDQUF3QztBQUM5RCxPQUFPQyxhQUFhQyxjQUFjLFFBQTBCLHdDQUF3QztBQUVwRyxPQUFPQyxpQkFBaUIsZ0RBQWdEO0FBQ3hFLFNBQXNCQyxZQUFZLEVBQUVDLGlCQUFpQixFQUFFQyxhQUFhLEVBQUVDLHlCQUF5QixFQUFFQyxTQUFTLEVBQUVDLDZDQUE2QyxFQUF3QkMsZ0JBQWdCLEVBQUVDLHFCQUFxQixFQUFFQyxJQUFJLEVBQW1DQyxRQUFRLEVBQWlDQyxPQUFPLFFBQVEsb0NBQW9DO0FBQzdWLE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLHVCQUF1QixzREFBc0Q7QUFDcEYsT0FBT0Msb0JBQW9CLG1EQUFtRDtBQUM5RSxPQUFPQyxlQUFlLDhDQUE4QztBQUNwRSxPQUFPQyxpQkFBaUIsdUJBQXVCO0FBQy9DLE9BQU9DLHdCQUF3Qiw4QkFBOEI7QUFDN0QsT0FBT0Msd0JBQXdCLGlDQUFpQztBQUNoRSxPQUFPQyxtQkFBdUUscUJBQXFCO0FBQ25HLE9BQU9DLDBCQUEwQiw0QkFBNEI7QUFFN0QsWUFBWTtBQUNaLE1BQU1DLGtDQUFrQ0osbUJBQW1CSyxJQUFJLENBQUNDLFFBQVEs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