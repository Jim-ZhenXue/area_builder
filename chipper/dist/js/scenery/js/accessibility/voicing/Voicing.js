// Copyright 2021-2024, University of Colorado Boulder
/**
 * A trait for Node that supports the Voicing feature, under accessibility. Allows you to define responses for the Node
 * and make requests to speak that content using HTML5 SpeechSynthesis and the UtteranceQueue. Voicing content is
 * organized into four categories which are responsible for describing different things. Responses are stored on the
 * composed type: "ResponsePacket." See that file for details about what responses it stores. Output of this content
 * can be controlled by the responseCollector. Responses are defined as the following. . .
 *
 * - "Name" response: The name of the object that uses Voicing. Similar to the "Accessible Name" in web accessibility.
 * - "Object" response: The state information about the object that uses Voicing.
 * - "Context" response: The contextual changes that result from interaction with the Node that uses Voicing.
 * - "Hint" response: A supporting hint that guides the user toward a desired interaction with this Node.
 *
 * See ResponsePacket, as well as the property and setter documentation for each of these responses for more
 * information.
 *
 * Once this content is set, you can make a request to speak it using an UtteranceQueue with one of the provided
 * functions in this Trait. It is up to you to call one of these functions when you wish for speech to be made. The only
 * exception is on the 'focus' event. Every Node that composes Voicing will speak its responses by when it
 * receives focus.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import TinyProperty from '../../../../axon/js/TinyProperty.js';
import inheritance from '../../../../phet-core/js/inheritance.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import responseCollector from '../../../../utterance-queue/js/responseCollector.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import { DelayedMutate, InteractiveHighlighting, Node, scenery, voicingUtteranceQueue } from '../../imports.js';
// Helps enforce that the utterance is defined.
function assertUtterance(utterance) {
    if (!(utterance instanceof Utterance)) {
        throw new Error('utterance is not an Utterance');
    }
}
// An implementation class for Voicing.ts, only used in this class so that we know if we own the Utterance and can
// therefore dispose it.
let OwnedVoicingUtterance = class OwnedVoicingUtterance extends Utterance {
    constructor(providedOptions){
        super(providedOptions);
    }
};
// options that are supported by Voicing.js. Added to mutator keys so that Voicing properties can be set with mutate.
const VOICING_OPTION_KEYS = [
    'voicingNameResponse',
    'voicingObjectResponse',
    'voicingContextResponse',
    'voicingHintResponse',
    'voicingUtterance',
    'voicingResponsePatternCollection',
    'voicingIgnoreVoicingManagerProperties',
    'voicingFocusListener'
];
const Voicing = (Type)=>{
    assert && assert(_.includes(inheritance(Type), Node), 'Only Node subtypes should compose Voicing');
    const VoicingClass = DelayedMutate('Voicing', VOICING_OPTION_KEYS, class VoicingClass extends InteractiveHighlighting(Type) {
        // Separate from the constructor to support cases where Voicing is used in Poolable Nodes.
        // ...args: IntentionalAny[] because things like RichTextLink need to provide arguments to initialize, and TS complains
        // otherwise
        initialize(...args) {
            // @ts-expect-error
            super.initialize && super.initialize(args);
            this._voicingCanSpeakProperty = new TinyProperty(true);
            this._voicingResponsePacket = new ResponsePacket();
            this._voicingFocusListener = this.defaultFocusListener;
            // Sets the default voicingUtterance and makes this.canSpeakProperty a dependency on its ability to announce.
            this.setVoicingUtterance(new OwnedVoicingUtterance());
            this._voicingCanSpeakCount = 0;
            this._boundInstancesChangedListener = this.addOrRemoveInstanceListeners.bind(this);
            // This is potentially dangerous to listen to generally, but in this case it is safe because the state we change
            // will only affect how we voice (part of the audio view), and not part of this display's scene graph.
            this.changedInstanceEmitter.addListener(this._boundInstancesChangedListener);
            this._speakContentOnFocusListener = {
                focus: (event)=>{
                    this._voicingFocusListener && this._voicingFocusListener(event);
                }
            };
            this.addInputListener(this._speakContentOnFocusListener);
            return this;
        }
        /**
       * Speak all responses assigned to this Node. Options allow you to override a responses for this particular
       * speech request. Each response is only spoken if the associated Property of responseCollector is true. If
       * all are Properties are false, nothing will be spoken.
       */ voicingSpeakFullResponse(providedOptions) {
            // options are passed along to collectAndSpeakResponse, see that function for additional options
            const options = combineOptions({}, providedOptions);
            // Lazily formulate strings only as needed
            if (!options.hasOwnProperty('nameResponse')) {
                options.nameResponse = this._voicingResponsePacket.nameResponse;
            }
            if (!options.hasOwnProperty('objectResponse')) {
                options.objectResponse = this._voicingResponsePacket.objectResponse;
            }
            if (!options.hasOwnProperty('contextResponse')) {
                options.contextResponse = this._voicingResponsePacket.contextResponse;
            }
            if (!options.hasOwnProperty('hintResponse')) {
                options.hintResponse = this._voicingResponsePacket.hintResponse;
            }
            this.collectAndSpeakResponse(options);
        }
        /**
       * Speak ONLY the provided responses that you pass in with options. This will NOT speak the name, object,
       * context, or hint responses assigned to this node by default. But it allows for clarity at usages so it is
       * clear that you are only requesting certain responses. If you want to speak all of the responses assigned
       * to this Node, use voicingSpeakFullResponse().
       *
       * Each response will only be spoken if the Properties of responseCollector are true. If all of those are false,
       * nothing will be spoken.
       */ voicingSpeakResponse(providedOptions) {
            // options are passed along to collectAndSpeakResponse, see that function for additional options
            const options = combineOptions({
                nameResponse: null,
                objectResponse: null,
                contextResponse: null,
                hintResponse: null
            }, providedOptions);
            this.collectAndSpeakResponse(options);
        }
        /**
       * By default, speak the name response. But accepts all other responses through options. Respects responseCollector
       * Properties, so the name response may not be spoken if responseCollector.nameResponseEnabledProperty is false.
       */ voicingSpeakNameResponse(providedOptions) {
            // options are passed along to collectAndSpeakResponse, see that function for additional options
            const options = combineOptions({}, providedOptions);
            // Lazily formulate strings only as needed
            if (!options.hasOwnProperty('nameResponse')) {
                options.nameResponse = this._voicingResponsePacket.nameResponse;
            }
            this.collectAndSpeakResponse(options);
        }
        /**
       * By default, speak the object response. But accepts all other responses through options. Respects responseCollector
       * Properties, so the object response may not be spoken if responseCollector.objectResponseEnabledProperty is false.
       */ voicingSpeakObjectResponse(providedOptions) {
            // options are passed along to collectAndSpeakResponse, see that function for additional options
            const options = combineOptions({}, providedOptions);
            // Lazily formulate strings only as needed
            if (!options.hasOwnProperty('objectResponse')) {
                options.objectResponse = this._voicingResponsePacket.objectResponse;
            }
            this.collectAndSpeakResponse(options);
        }
        /**
       * By default, speak the context response. But accepts all other responses through options. Respects
       * responseCollector Properties, so the context response may not be spoken if
       * responseCollector.contextResponseEnabledProperty is false.
       */ voicingSpeakContextResponse(providedOptions) {
            // options are passed along to collectAndSpeakResponse, see that function for additional options
            const options = combineOptions({}, providedOptions);
            // Lazily formulate strings only as needed
            if (!options.hasOwnProperty('contextResponse')) {
                options.contextResponse = this._voicingResponsePacket.contextResponse;
            }
            this.collectAndSpeakResponse(options);
        }
        /**
       * By default, speak the hint response. But accepts all other responses through options. Respects
       * responseCollector Properties, so the hint response may not be spoken if
       * responseCollector.hintResponseEnabledProperty is false.
       */ voicingSpeakHintResponse(providedOptions) {
            // options are passed along to collectAndSpeakResponse, see that function for additional options
            const options = combineOptions({}, providedOptions);
            // Lazily formulate strings only as needed
            if (!options.hasOwnProperty('hintResponse')) {
                options.hintResponse = this._voicingResponsePacket.hintResponse;
            }
            this.collectAndSpeakResponse(options);
        }
        /**
       * Collect responses with the responseCollector and speak the output with an UtteranceQueue.
       */ collectAndSpeakResponse(providedOptions) {
            this.speakContent(this.collectResponse(providedOptions));
        }
        /**
       * Combine all types of response into a single alertable, potentially depending on the current state of
       * responseCollector Properties (filtering what kind of responses to present in the resolved response).
       * @mixin-protected - made public for use in the mixin only
       */ collectResponse(providedOptions) {
            const options = combineOptions({
                ignoreProperties: this._voicingResponsePacket.ignoreProperties,
                responsePatternCollection: this._voicingResponsePacket.responsePatternCollection,
                utterance: this.voicingUtterance
            }, providedOptions);
            let response = responseCollector.collectResponses(options);
            if (options.utterance) {
                options.utterance.alert = response;
                response = options.utterance;
            }
            return response;
        }
        /**
       * Use the provided function to create content to speak in response to input. The content is then added to the
       * back of the voicing UtteranceQueue.
       */ speakContent(content) {
            const notPhetioArchetype = !Tandem.PHET_IO_ENABLED || !this.isInsidePhetioArchetype();
            // don't send to utteranceQueue if response is empty
            // don't send to utteranceQueue for PhET-iO dynamic element archetypes, https://github.com/phetsims/joist/issues/817
            if (content && notPhetioArchetype) {
                voicingUtteranceQueue.addToBack(content); // eslint-disable-line phet/bad-sim-text
            }
        }
        /**
       * Sets the voicingNameResponse for this Node. This is usually the label of the element and is spoken
       * when the object receives input. When requesting speech, this will only be spoken if
       * responseCollector.nameResponsesEnabledProperty is set to true.
       */ setVoicingNameResponse(response) {
            this._voicingResponsePacket.nameResponse = response;
        }
        set voicingNameResponse(response) {
            this.setVoicingNameResponse(response);
        }
        get voicingNameResponse() {
            return this.getVoicingNameResponse();
        }
        /**
       * Get the voicingNameResponse for this Node.
       */ getVoicingNameResponse() {
            return this._voicingResponsePacket.nameResponse;
        }
        /**
       * Set the object response for this Node. This is usually the state information associated with this Node, such
       * as its current input value. When requesting speech, this will only be heard when
       * responseCollector.objectResponsesEnabledProperty is set to true.
       */ setVoicingObjectResponse(response) {
            this._voicingResponsePacket.objectResponse = response;
        }
        set voicingObjectResponse(response) {
            this.setVoicingObjectResponse(response);
        }
        get voicingObjectResponse() {
            return this.getVoicingObjectResponse();
        }
        /**
       * Gets the object response for this Node.
       */ getVoicingObjectResponse() {
            return this._voicingResponsePacket.objectResponse;
        }
        /**
       * Set the context response for this Node. This is usually the content that describes what has happened in
       * the surrounding application in response to interaction with this Node. When requesting speech, this will
       * only be heard if responseCollector.contextResponsesEnabledProperty is set to true.
       */ setVoicingContextResponse(response) {
            this._voicingResponsePacket.contextResponse = response;
        }
        set voicingContextResponse(response) {
            this.setVoicingContextResponse(response);
        }
        get voicingContextResponse() {
            return this.getVoicingContextResponse();
        }
        /**
       * Gets the context response for this Node.
       */ getVoicingContextResponse() {
            return this._voicingResponsePacket.contextResponse;
        }
        /**
       * Sets the hint response for this Node. This is usually a response that describes how to interact with this Node.
       * When requesting speech, this will only be spoken when responseCollector.hintResponsesEnabledProperty is set to
       * true.
       */ setVoicingHintResponse(response) {
            this._voicingResponsePacket.hintResponse = response;
        }
        set voicingHintResponse(response) {
            this.setVoicingHintResponse(response);
        }
        get voicingHintResponse() {
            return this.getVoicingHintResponse();
        }
        /**
       * Gets the hint response for this Node.
       */ getVoicingHintResponse() {
            return this._voicingResponsePacket.hintResponse;
        }
        /**
       * Set whether or not all responses for this Node will ignore the Properties of responseCollector. If false,
       * all responses will be spoken regardless of responseCollector Properties, which are generally set in user
       * preferences.
       */ setVoicingIgnoreVoicingManagerProperties(ignoreProperties) {
            this._voicingResponsePacket.ignoreProperties = ignoreProperties;
        }
        set voicingIgnoreVoicingManagerProperties(ignoreProperties) {
            this.setVoicingIgnoreVoicingManagerProperties(ignoreProperties);
        }
        get voicingIgnoreVoicingManagerProperties() {
            return this.getVoicingIgnoreVoicingManagerProperties();
        }
        /**
       * Get whether or not responses are ignoring responseCollector Properties.
       */ getVoicingIgnoreVoicingManagerProperties() {
            return this._voicingResponsePacket.ignoreProperties;
        }
        /**
       * Sets the collection of patterns to use for voicing responses, controlling the order, punctuation, and
       * additional content for each combination of response. See ResponsePatternCollection.js if you wish to use
       * a collection of string patterns that are not the default.
       */ setVoicingResponsePatternCollection(patterns) {
            this._voicingResponsePacket.responsePatternCollection = patterns;
        }
        set voicingResponsePatternCollection(patterns) {
            this.setVoicingResponsePatternCollection(patterns);
        }
        get voicingResponsePatternCollection() {
            return this.getVoicingResponsePatternCollection();
        }
        /**
       * Get the ResponsePatternCollection object that this Voicing Node is using to collect responses.
       */ getVoicingResponsePatternCollection() {
            return this._voicingResponsePacket.responsePatternCollection;
        }
        /**
       * Sets the utterance through which voicing associated with this Node will be spoken. By default on initialize,
       * one will be created, but a custom one can optionally be provided.
       */ setVoicingUtterance(utterance) {
            if (this._voicingUtterance !== utterance) {
                if (this._voicingUtterance) {
                    this.cleanVoicingUtterance();
                }
                Voicing.registerUtteranceToVoicingNode(utterance, this);
                this._voicingUtterance = utterance;
            }
        }
        set voicingUtterance(utterance) {
            this.setVoicingUtterance(utterance);
        }
        get voicingUtterance() {
            return this.getVoicingUtterance();
        }
        /**
       * Gets the utterance through which voicing associated with this Node will be spoken.
       */ getVoicingUtterance() {
            assertUtterance(this._voicingUtterance);
            return this._voicingUtterance;
        }
        /**
       * Called whenever this Node is focused.
       */ setVoicingFocusListener(focusListener) {
            this._voicingFocusListener = focusListener;
        }
        set voicingFocusListener(focusListener) {
            this.setVoicingFocusListener(focusListener);
        }
        get voicingFocusListener() {
            return this.getVoicingFocusListener();
        }
        /**
       * Gets the utteranceQueue through which voicing associated with this Node will be spoken.
       */ getVoicingFocusListener() {
            return this._voicingFocusListener;
        }
        /**
       * The default focus listener attached to this Node during initialization.
       */ defaultFocusListener() {
            this.voicingSpeakFullResponse({
                contextResponse: null
            });
        }
        /**
       * Whether a Node composes Voicing.
       */ get _isVoicing() {
            return true;
        }
        /**
       * Detaches references that ensure this components of this Trait are eligible for garbage collection.
       */ dispose() {
            this.removeInputListener(this._speakContentOnFocusListener);
            this.changedInstanceEmitter.removeListener(this._boundInstancesChangedListener);
            if (this._voicingUtterance) {
                this.cleanVoicingUtterance();
                this._voicingUtterance = null;
            }
            super.dispose();
        }
        clean() {
            this.removeInputListener(this._speakContentOnFocusListener);
            this.changedInstanceEmitter.removeListener(this._boundInstancesChangedListener);
            if (this._voicingUtterance) {
                this.cleanVoicingUtterance();
                this._voicingUtterance = null;
            }
            // @ts-expect-error
            super.clean && super.clean();
        }
        /***********************************************************************************************************/ // PRIVATE METHODS
        /***********************************************************************************************************/ /**
       * When visibility and voicingVisibility change such that the Instance can now speak, update the counting
       * variable that tracks how many Instances of this VoicingNode can speak. To speak the Instance must be globally\
       * visible and voicingVisible.
       */ onInstanceCanVoiceChange(canSpeak) {
            if (canSpeak) {
                this._voicingCanSpeakCount++;
            } else {
                this._voicingCanSpeakCount--;
            }
            assert && assert(this._voicingCanSpeakCount >= 0, 'the voicingCanSpeakCount should not go below zero');
            assert && assert(this._voicingCanSpeakCount <= this.instances.length, 'The voicingCanSpeakCount cannot be greater than the number of Instances.');
            this._voicingCanSpeakProperty.value = this._voicingCanSpeakCount > 0;
        }
        /**
       * Update the canSpeakProperty and counting variable in response to an Instance of this Node being added or
       * removed.
       */ handleInstancesChanged(instance, added) {
            const isVisible = instance.visible && instance.voicingVisible;
            if (isVisible) {
                // If the added Instance was visible and voicingVisible it should increment the counter. If the removed
                // instance is NOT visible/voicingVisible it would not have contributed to the counter so we should not
                // decrement in that case.
                this._voicingCanSpeakCount = added ? this._voicingCanSpeakCount + 1 : this._voicingCanSpeakCount - 1;
            }
            this._voicingCanSpeakProperty.value = this._voicingCanSpeakCount > 0;
        }
        /**
       * Add or remove listeners on an Instance watching for changes to visible or voicingVisible that will modify
       * the voicingCanSpeakCount. See documentation for voicingCanSpeakCount for details about how this controls the
       * voicingCanSpeakProperty.
       */ addOrRemoveInstanceListeners(instance, added) {
            assert && assert(instance.canVoiceEmitter, 'Instance must be initialized.');
            if (added) {
                // @ts-expect-error - Emitters in Instance need typing
                instance.canVoiceEmitter.addListener(this._boundInstanceCanVoiceChangeListener);
            } else {
                // @ts-expect-error - Emitters in Instance need typing
                instance.canVoiceEmitter.removeListener(this._boundInstanceCanVoiceChangeListener);
            }
            // eagerly update the canSpeakProperty and counting variables in addition to adding change listeners
            this.handleInstancesChanged(instance, added);
        }
        /**
       * Clean this._voicingUtterance, disposing if we own it or unregistering it if we do not.
       * @mixin-protected - made public for use in the mixin only
       */ cleanVoicingUtterance() {
            assert && assert(this._voicingUtterance, 'A voicingUtterance must be available to clean.');
            if (this._voicingUtterance instanceof OwnedVoicingUtterance) {
                this._voicingUtterance.dispose();
            } else if (this._voicingUtterance && !this._voicingUtterance.isDisposed) {
                Voicing.unregisterUtteranceToVoicingNode(this._voicingUtterance, this);
            }
        }
        mutate(options) {
            return super.mutate(options);
        }
        constructor(...args){
            super(...args);
            // Bind the listeners on construction to be added to observables on initialize and removed on clean/dispose.
            // Instances are updated asynchronously in updateDisplay. The bind creates a new function and we need the
            // reference to persist through the completion of initialize and disposal.
            this._boundInstanceCanVoiceChangeListener = this.onInstanceCanVoiceChange.bind(this);
            this._voicingUtterance = null;
            // We only want to call this method, not any subtype implementation
            VoicingClass.prototype.initialize.call(this);
        }
    });
    /**
   * {Array.<string>} - String keys for all the allowed options that will be set by Node.mutate( options ), in
   * the order they will be evaluated.
   *
   * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
   *       cases that may apply.
   */ VoicingClass.prototype._mutatorKeys = VOICING_OPTION_KEYS.concat(VoicingClass.prototype._mutatorKeys);
    assert && assert(VoicingClass.prototype._mutatorKeys.length === _.uniq(VoicingClass.prototype._mutatorKeys).length, 'duplicate mutator keys in Voicing');
    return VoicingClass;
};
Voicing.VOICING_OPTION_KEYS = VOICING_OPTION_KEYS;
/**
 * Alert an Utterance to the voicingUtteranceQueue. The Utterance must have voicingCanAnnounceProperties and hopefully
 * at least one of the Properties is a VoicingNode's canAnnounceProperty so that this Utterance is only announced
 * when the VoicingNode is globally visible and voicingVisible.
 * @static
 */ Voicing.alertUtterance = (utterance)=>{
    assert && assert(utterance.voicingCanAnnounceProperties.length > 0, 'voicingCanAnnounceProperties required, this Utterance might not be connected to Node in the scene graph.');
    voicingUtteranceQueue.addToBack(utterance); // eslint-disable-line phet/bad-sim-text
};
/**
 * Assign the voicingNode's voicingCanSpeakProperty to the Utterance so that the Utterance can only be announced
 * if the voicingNode is globally visible and voicingVisible in the display.
 * @static
 */ Voicing.registerUtteranceToVoicingNode = (utterance, voicingNode)=>{
    const existingCanAnnounceProperties = utterance.voicingCanAnnounceProperties;
    const voicingCanSpeakProperty = voicingNode._voicingCanSpeakProperty;
    if (!existingCanAnnounceProperties.includes(voicingCanSpeakProperty)) {
        utterance.voicingCanAnnounceProperties = existingCanAnnounceProperties.concat([
            voicingCanSpeakProperty
        ]);
    }
};
/**
 * Remove a voicingNode's voicingCanSpeakProperty from the Utterance.
 * @static
 */ Voicing.unregisterUtteranceToVoicingNode = (utterance, voicingNode)=>{
    const existingCanAnnounceProperties = utterance.voicingCanAnnounceProperties;
    const voicingCanSpeakProperty = voicingNode._voicingCanSpeakProperty;
    const index = existingCanAnnounceProperties.indexOf(voicingCanSpeakProperty);
    assert && assert(index > -1, 'voicingNode.voicingCanSpeakProperty is not on the Utterance, was it not registered?');
    utterance.voicingCanAnnounceProperties = existingCanAnnounceProperties.splice(index, 1);
};
/**
 * Assign the Node's voicingVisibleProperty and visibleProperty to the Utterance so that the Utterance can only be
 * announced if the Node is visible and voicingVisible. This is LOCAL visibility and does not care about ancestors.
 * This should rarely be used, in general you should be registering an Utterance to a VoicingNode and its
 * voicingCanSpeakProperty.
 * @static
 */ Voicing.registerUtteranceToNode = (utterance, node)=>{
    const existingCanAnnounceProperties = utterance.voicingCanAnnounceProperties;
    if (!existingCanAnnounceProperties.includes(node.visibleProperty)) {
        utterance.voicingCanAnnounceProperties = utterance.voicingCanAnnounceProperties.concat([
            node.visibleProperty
        ]);
    }
    if (!existingCanAnnounceProperties.includes(node.voicingVisibleProperty)) {
        utterance.voicingCanAnnounceProperties = utterance.voicingCanAnnounceProperties.concat([
            node.voicingVisibleProperty
        ]);
    }
};
/**
 * Remove a Node's voicingVisibleProperty and visibleProperty from the voicingCanAnnounceProperties of the Utterance.
 * @static
 */ Voicing.unregisterUtteranceToNode = (utterance, node)=>{
    const existingCanAnnounceProperties = utterance.voicingCanAnnounceProperties;
    assert && assert(existingCanAnnounceProperties.includes(node.visibleProperty) && existingCanAnnounceProperties.includes(node.voicingVisibleProperty), 'visibleProperty and voicingVisibleProperty were not on the Utterance, was it not registered to the node?');
    const visiblePropertyIndex = existingCanAnnounceProperties.indexOf(node.visibleProperty);
    const withoutVisibleProperty = existingCanAnnounceProperties.splice(visiblePropertyIndex, 1);
    const voicingVisiblePropertyIndex = withoutVisibleProperty.indexOf(node.voicingVisibleProperty);
    const withoutBothProperties = existingCanAnnounceProperties.splice(voicingVisiblePropertyIndex, 1);
    utterance.voicingCanAnnounceProperties = withoutBothProperties;
};
export function isVoicing(something) {
    return something instanceof Node && something._isVoicing;
}
scenery.register('Voicing', Voicing);
export default Voicing;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS92b2ljaW5nL1ZvaWNpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB0cmFpdCBmb3IgTm9kZSB0aGF0IHN1cHBvcnRzIHRoZSBWb2ljaW5nIGZlYXR1cmUsIHVuZGVyIGFjY2Vzc2liaWxpdHkuIEFsbG93cyB5b3UgdG8gZGVmaW5lIHJlc3BvbnNlcyBmb3IgdGhlIE5vZGVcbiAqIGFuZCBtYWtlIHJlcXVlc3RzIHRvIHNwZWFrIHRoYXQgY29udGVudCB1c2luZyBIVE1MNSBTcGVlY2hTeW50aGVzaXMgYW5kIHRoZSBVdHRlcmFuY2VRdWV1ZS4gVm9pY2luZyBjb250ZW50IGlzXG4gKiBvcmdhbml6ZWQgaW50byBmb3VyIGNhdGVnb3JpZXMgd2hpY2ggYXJlIHJlc3BvbnNpYmxlIGZvciBkZXNjcmliaW5nIGRpZmZlcmVudCB0aGluZ3MuIFJlc3BvbnNlcyBhcmUgc3RvcmVkIG9uIHRoZVxuICogY29tcG9zZWQgdHlwZTogXCJSZXNwb25zZVBhY2tldC5cIiBTZWUgdGhhdCBmaWxlIGZvciBkZXRhaWxzIGFib3V0IHdoYXQgcmVzcG9uc2VzIGl0IHN0b3Jlcy4gT3V0cHV0IG9mIHRoaXMgY29udGVudFxuICogY2FuIGJlIGNvbnRyb2xsZWQgYnkgdGhlIHJlc3BvbnNlQ29sbGVjdG9yLiBSZXNwb25zZXMgYXJlIGRlZmluZWQgYXMgdGhlIGZvbGxvd2luZy4gLiAuXG4gKlxuICogLSBcIk5hbWVcIiByZXNwb25zZTogVGhlIG5hbWUgb2YgdGhlIG9iamVjdCB0aGF0IHVzZXMgVm9pY2luZy4gU2ltaWxhciB0byB0aGUgXCJBY2Nlc3NpYmxlIE5hbWVcIiBpbiB3ZWIgYWNjZXNzaWJpbGl0eS5cbiAqIC0gXCJPYmplY3RcIiByZXNwb25zZTogVGhlIHN0YXRlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBvYmplY3QgdGhhdCB1c2VzIFZvaWNpbmcuXG4gKiAtIFwiQ29udGV4dFwiIHJlc3BvbnNlOiBUaGUgY29udGV4dHVhbCBjaGFuZ2VzIHRoYXQgcmVzdWx0IGZyb20gaW50ZXJhY3Rpb24gd2l0aCB0aGUgTm9kZSB0aGF0IHVzZXMgVm9pY2luZy5cbiAqIC0gXCJIaW50XCIgcmVzcG9uc2U6IEEgc3VwcG9ydGluZyBoaW50IHRoYXQgZ3VpZGVzIHRoZSB1c2VyIHRvd2FyZCBhIGRlc2lyZWQgaW50ZXJhY3Rpb24gd2l0aCB0aGlzIE5vZGUuXG4gKlxuICogU2VlIFJlc3BvbnNlUGFja2V0LCBhcyB3ZWxsIGFzIHRoZSBwcm9wZXJ0eSBhbmQgc2V0dGVyIGRvY3VtZW50YXRpb24gZm9yIGVhY2ggb2YgdGhlc2UgcmVzcG9uc2VzIGZvciBtb3JlXG4gKiBpbmZvcm1hdGlvbi5cbiAqXG4gKiBPbmNlIHRoaXMgY29udGVudCBpcyBzZXQsIHlvdSBjYW4gbWFrZSBhIHJlcXVlc3QgdG8gc3BlYWsgaXQgdXNpbmcgYW4gVXR0ZXJhbmNlUXVldWUgd2l0aCBvbmUgb2YgdGhlIHByb3ZpZGVkXG4gKiBmdW5jdGlvbnMgaW4gdGhpcyBUcmFpdC4gSXQgaXMgdXAgdG8geW91IHRvIGNhbGwgb25lIG9mIHRoZXNlIGZ1bmN0aW9ucyB3aGVuIHlvdSB3aXNoIGZvciBzcGVlY2ggdG8gYmUgbWFkZS4gVGhlIG9ubHlcbiAqIGV4Y2VwdGlvbiBpcyBvbiB0aGUgJ2ZvY3VzJyBldmVudC4gRXZlcnkgTm9kZSB0aGF0IGNvbXBvc2VzIFZvaWNpbmcgd2lsbCBzcGVhayBpdHMgcmVzcG9uc2VzIGJ5IHdoZW4gaXRcbiAqIHJlY2VpdmVzIGZvY3VzLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UaW55UHJvcGVydHkuanMnO1xuaW1wb3J0IGluaGVyaXRhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pbmhlcml0YW5jZS5qcyc7XG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9Db25zdHJ1Y3Rvci5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgcmVzcG9uc2VDb2xsZWN0b3IgZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL3Jlc3BvbnNlQ29sbGVjdG9yLmpzJztcbmltcG9ydCBSZXNwb25zZVBhY2tldCwgeyBSZXNvbHZlZFJlc3BvbnNlLCBTcGVha2FibGVSZXNvbHZlZE9wdGlvbnMsIFZvaWNpbmdSZXNwb25zZSB9IGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9SZXNwb25zZVBhY2tldC5qcyc7XG5pbXBvcnQgUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgVXR0ZXJhbmNlLCB7IFRBbGVydGFibGUsIFV0dGVyYW5jZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcbmltcG9ydCB7IERlbGF5ZWRNdXRhdGUsIEluc3RhbmNlLCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZywgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdPcHRpb25zLCBOb2RlLCBzY2VuZXJ5LCBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbiwgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBUSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgfSBmcm9tICcuL0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLmpzJztcblxuLy8gSGVscHMgZW5mb3JjZSB0aGF0IHRoZSB1dHRlcmFuY2UgaXMgZGVmaW5lZC5cbmZ1bmN0aW9uIGFzc2VydFV0dGVyYW5jZSggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgfCBudWxsICk6IGFzc2VydHMgdXR0ZXJhbmNlIGlzIFV0dGVyYW5jZSB7XG4gIGlmICggISggdXR0ZXJhbmNlIGluc3RhbmNlb2YgVXR0ZXJhbmNlICkgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAndXR0ZXJhbmNlIGlzIG5vdCBhbiBVdHRlcmFuY2UnICk7XG4gIH1cbn1cblxuLy8gQW4gaW1wbGVtZW50YXRpb24gY2xhc3MgZm9yIFZvaWNpbmcudHMsIG9ubHkgdXNlZCBpbiB0aGlzIGNsYXNzIHNvIHRoYXQgd2Uga25vdyBpZiB3ZSBvd24gdGhlIFV0dGVyYW5jZSBhbmQgY2FuXG4vLyB0aGVyZWZvcmUgZGlzcG9zZSBpdC5cbmNsYXNzIE93bmVkVm9pY2luZ1V0dGVyYW5jZSBleHRlbmRzIFV0dGVyYW5jZSB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogVXR0ZXJhbmNlT3B0aW9ucyApIHtcbiAgICBzdXBlciggcHJvdmlkZWRPcHRpb25zICk7XG4gIH1cbn1cblxuLy8gb3B0aW9ucyB0aGF0IGFyZSBzdXBwb3J0ZWQgYnkgVm9pY2luZy5qcy4gQWRkZWQgdG8gbXV0YXRvciBrZXlzIHNvIHRoYXQgVm9pY2luZyBwcm9wZXJ0aWVzIGNhbiBiZSBzZXQgd2l0aCBtdXRhdGUuXG5jb25zdCBWT0lDSU5HX09QVElPTl9LRVlTID0gW1xuICAndm9pY2luZ05hbWVSZXNwb25zZScsXG4gICd2b2ljaW5nT2JqZWN0UmVzcG9uc2UnLFxuICAndm9pY2luZ0NvbnRleHRSZXNwb25zZScsXG4gICd2b2ljaW5nSGludFJlc3BvbnNlJyxcbiAgJ3ZvaWNpbmdVdHRlcmFuY2UnLFxuICAndm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24nLFxuICAndm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcycsXG4gICd2b2ljaW5nRm9jdXNMaXN0ZW5lcidcbl07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gc2VlIFJlc3BvbnNlUGFja2V0Lm5hbWVSZXNwb25zZVxuICB2b2ljaW5nTmFtZVJlc3BvbnNlPzogVm9pY2luZ1Jlc3BvbnNlO1xuXG4gIC8vIHNlZSBSZXNwb25zZVBhY2tldC5vYmplY3RSZXNwb25zZVxuICB2b2ljaW5nT2JqZWN0UmVzcG9uc2U/OiBWb2ljaW5nUmVzcG9uc2U7XG5cbiAgLy8gc2VlIFJlc3BvbnNlUGFja2V0LmNvbnRleHRSZXNwb25zZVxuICB2b2ljaW5nQ29udGV4dFJlc3BvbnNlPzogVm9pY2luZ1Jlc3BvbnNlO1xuXG4gIC8vIHNlZSBSZXNwb25zZVBhY2tldC5oaW50UmVzcG9uc2VcbiAgdm9pY2luZ0hpbnRSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcblxuICAvLyBzZWUgUmVzcG9uc2VQYWNrZXQucmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvblxuICB2b2ljaW5nUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbj86IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb247XG5cbiAgLy8gc2VlIFJlc3BvbnNlUGFja2V0Lmlnbm9yZVByb3BlcnRpZXNcbiAgdm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcz86IGJvb2xlYW47XG5cbiAgLy8gQ2FsbGVkIHdoZW4gdGhpcyBOb2RlIGlzIGZvY3VzZWQgdG8gc3BlYWsgdm9pY2luZyByZXNwb25zZXMgb24gZm9jdXMuIFNlZSBWb2ljaW5nLmRlZmF1bHRGb2N1c0xpc3RlbmVyIGZvciBkZWZhdWx0XG4gIC8vIGxpc3RlbmVyLlxuICB2b2ljaW5nRm9jdXNMaXN0ZW5lcj86IFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uPEZvY3VzRXZlbnQ+IHwgbnVsbDtcblxuICAvLyBUaGUgdXR0ZXJhbmNlIHRvIHVzZSBpZiB5b3Ugd2FudCB0aGlzIHJlc3BvbnNlIHRvIGJlIG1vcmUgY29udHJvbGxlZCBpbiB0aGUgVXR0ZXJhbmNlUXVldWUuIFRoaXMgVXR0ZXJhbmNlIHdpbGwgYmVcbiAgLy8gdXNlZCBieSBhbGwgcmVzcG9uc2VzIHNwb2tlbiBieSB0aGlzIGNsYXNzLiBOdWxsIHRvIG5vdCB1c2UgYW4gVXR0ZXJhbmNlLlxuICB2b2ljaW5nVXR0ZXJhbmNlPzogVXR0ZXJhbmNlIHwgbnVsbDtcbn07XG5cbmV4cG9ydCB0eXBlIFZvaWNpbmdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ09wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIFNwZWFraW5nT3B0aW9ucyA9IHtcbiAgdXR0ZXJhbmNlPzogU2VsZk9wdGlvbnNbJ3ZvaWNpbmdVdHRlcmFuY2UnXTtcbn0gJiBTcGVha2FibGVSZXNvbHZlZE9wdGlvbnM7XG5cbi8vIE5vcm1hbGx5IG91ciBwcm9qZWN0IHByZWZlcnMgdHlwZSBhbGlhc2VzIHRvIGludGVyZmFjZXMsIGJ1dCBpbnRlcmZhY2VzIGFyZSBuZWNlc3NhcnkgZm9yIGNvcnJlY3QgdXNhZ2Ugb2YgXCJ0aGlzXCIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFza3MvaXNzdWVzLzExMzJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvY29uc2lzdGVudC10eXBlLWRlZmluaXRpb25zXG5leHBvcnQgaW50ZXJmYWNlIFRWb2ljaW5nPFN1cGVyVHlwZSBleHRlbmRzIE5vZGUgPSBOb2RlPiBleHRlbmRzIFRJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZzxTdXBlclR5cGU+IHtcbiAgX3ZvaWNpbmdSZXNwb25zZVBhY2tldDogUmVzcG9uc2VQYWNrZXQ7XG5cbiAgLy8gQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgX3ZvaWNpbmdVdHRlcmFuY2U6IFV0dGVyYW5jZSB8IG51bGw7XG5cbiAgLy8gQG1peGluLXByaXZhdGUgLSBwcml2YXRlIHRvIHRoaXMgZmlsZSwgYnV0IHB1YmxpYyBuZWVkZWQgZm9yIHRoZSBpbnRlcmZhY2VcbiAgX3ZvaWNpbmdDYW5TcGVha1Byb3BlcnR5OiBUaW55UHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgaW5pdGlhbGl6ZSggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApOiB0aGlzO1xuXG4gIHZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSggcHJvdmlkZWRPcHRpb25zPzogU3BlYWtpbmdPcHRpb25zICk6IHZvaWQ7XG5cbiAgdm9pY2luZ1NwZWFrUmVzcG9uc2UoIHByb3ZpZGVkT3B0aW9ucz86IFNwZWFraW5nT3B0aW9ucyApOiB2b2lkO1xuXG4gIHZvaWNpbmdTcGVha05hbWVSZXNwb25zZSggcHJvdmlkZWRPcHRpb25zPzogU3BlYWtpbmdPcHRpb25zICk6IHZvaWQ7XG5cbiAgdm9pY2luZ1NwZWFrT2JqZWN0UmVzcG9uc2UoIHByb3ZpZGVkT3B0aW9ucz86IFNwZWFraW5nT3B0aW9ucyApOiB2b2lkO1xuXG4gIHZvaWNpbmdTcGVha0NvbnRleHRSZXNwb25zZSggcHJvdmlkZWRPcHRpb25zPzogU3BlYWtpbmdPcHRpb25zICk6IHZvaWQ7XG5cbiAgdm9pY2luZ1NwZWFrSGludFJlc3BvbnNlKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVha2luZ09wdGlvbnMgKTogdm9pZDtcblxuICAvLyBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICBjb2xsZWN0UmVzcG9uc2UoIHByb3ZpZGVkT3B0aW9ucz86IFNwZWFraW5nT3B0aW9ucyApOiBUQWxlcnRhYmxlO1xuXG4gIHNwZWFrQ29udGVudCggY29udGVudDogVEFsZXJ0YWJsZSApOiB2b2lkO1xuXG4gIHNldFZvaWNpbmdOYW1lUmVzcG9uc2UoIHJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKTogdm9pZDtcblxuICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBSZXNvbHZlZFJlc3BvbnNlO1xuXG4gIGdldFZvaWNpbmdOYW1lUmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZTtcblxuICBzZXRWb2ljaW5nT2JqZWN0UmVzcG9uc2UoIHJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKTogdm9pZDtcblxuICB2b2ljaW5nT2JqZWN0UmVzcG9uc2U6IFJlc29sdmVkUmVzcG9uc2U7XG5cbiAgZ2V0Vm9pY2luZ09iamVjdFJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2U7XG5cbiAgc2V0Vm9pY2luZ0NvbnRleHRSZXNwb25zZSggcmVzcG9uc2U6IFZvaWNpbmdSZXNwb25zZSApOiB2b2lkO1xuXG4gIHZvaWNpbmdDb250ZXh0UmVzcG9uc2U6IFJlc29sdmVkUmVzcG9uc2U7XG5cbiAgZ2V0Vm9pY2luZ0NvbnRleHRSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlO1xuXG4gIHNldFZvaWNpbmdIaW50UmVzcG9uc2UoIHJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKTogdm9pZDtcblxuICB2b2ljaW5nSGludFJlc3BvbnNlOiBSZXNvbHZlZFJlc3BvbnNlO1xuXG4gIGdldFZvaWNpbmdIaW50UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZTtcblxuICBzZXRWb2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzKCBpZ25vcmVQcm9wZXJ0aWVzOiBib29sZWFuICk6IHZvaWQ7XG5cbiAgdm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllczogYm9vbGVhbjtcblxuICBnZXRWb2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzKCk6IGJvb2xlYW47XG5cbiAgc2V0Vm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24oIHBhdHRlcm5zOiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uICk6IHZvaWQ7XG5cbiAgdm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb246IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb247XG5cbiAgZ2V0Vm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24oKTogUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbjtcblxuICBzZXRWb2ljaW5nVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiB2b2lkO1xuXG4gIHZvaWNpbmdVdHRlcmFuY2U6IFV0dGVyYW5jZTtcblxuICBnZXRWb2ljaW5nVXR0ZXJhbmNlKCk6IFV0dGVyYW5jZTtcblxuICBzZXRWb2ljaW5nRm9jdXNMaXN0ZW5lciggZm9jdXNMaXN0ZW5lcjogU2NlbmVyeUxpc3RlbmVyRnVuY3Rpb248Rm9jdXNFdmVudD4gfCBudWxsICk6IHZvaWQ7XG5cbiAgdm9pY2luZ0ZvY3VzTGlzdGVuZXI6IFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uPEZvY3VzRXZlbnQ+IHwgbnVsbDtcblxuICBnZXRWb2ljaW5nRm9jdXNMaXN0ZW5lcigpOiBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbjxGb2N1c0V2ZW50PiB8IG51bGw7XG5cbiAgZGVmYXVsdEZvY3VzTGlzdGVuZXIoKTogdm9pZDtcblxuICAvLyBQcmVmZXIgZXhwb3J0ZWQgZnVuY3Rpb24gaXNWb2ljaW5nKCkgZm9yIGJldHRlciBUeXBlU2NyaXB0IHN1cHBvcnRcbiAgZ2V0IF9pc1ZvaWNpbmcoKTogdHJ1ZTtcblxuICBjbGVhbigpOiB2b2lkO1xuXG4gIC8vIEBtaXhpbi1wcm90ZWN0ZWQgLSBtYWRlIHB1YmxpYyBmb3IgdXNlIGluIHRoZSBtaXhpbiBvbmx5XG4gIGNsZWFuVm9pY2luZ1V0dGVyYW5jZSgpOiB2b2lkO1xuXG4gIC8vIEJldHRlciBvcHRpb25zIHR5cGUgZm9yIHRoZSBzdWJ0eXBlIGltcGxlbWVudGF0aW9uIHRoYXQgYWRkcyBtdXRhdG9yIGtleXNcbiAgbXV0YXRlKCBvcHRpb25zPzogU2VsZk9wdGlvbnMgJiBQYXJhbWV0ZXJzPFN1cGVyVHlwZVsgJ211dGF0ZScgXT5bIDAgXSApOiB0aGlzO1xufVxuXG5jb25zdCBWb2ljaW5nID0gPFN1cGVyVHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPE5vZGU+PiggVHlwZTogU3VwZXJUeXBlICk6IFN1cGVyVHlwZSAmIENvbnN0cnVjdG9yPFRWb2ljaW5nPEluc3RhbmNlVHlwZTxTdXBlclR5cGU+Pj4gPT4ge1xuXG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGluaGVyaXRhbmNlKCBUeXBlICksIE5vZGUgKSwgJ09ubHkgTm9kZSBzdWJ0eXBlcyBzaG91bGQgY29tcG9zZSBWb2ljaW5nJyApO1xuXG4gIGNvbnN0IFZvaWNpbmdDbGFzcyA9IERlbGF5ZWRNdXRhdGUoICdWb2ljaW5nJywgVk9JQ0lOR19PUFRJT05fS0VZUyxcbiAgICBjbGFzcyBWb2ljaW5nQ2xhc3MgZXh0ZW5kcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggVHlwZSApIGltcGxlbWVudHMgVFZvaWNpbmc8SW5zdGFuY2VUeXBlPFN1cGVyVHlwZT4+IHtcblxuICAgICAgLy8gUmVzcG9uc2VQYWNrZXQgdGhhdCBob2xkcyBhbGwgdGhlIHN1cHBvcnRlZCByZXNwb25zZXMgdG8gYmUgVm9pY2VkXG4gICAgICBwdWJsaWMgX3ZvaWNpbmdSZXNwb25zZVBhY2tldCE6IFJlc3BvbnNlUGFja2V0O1xuXG4gICAgICAvLyBUaGUgdXR0ZXJhbmNlIHRoYXQgYWxsIHJlc3BvbnNlcyBhcmUgc3Bva2VuIHRocm91Z2guXG4gICAgICAvLyBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICAgICAgcHVibGljIF92b2ljaW5nVXR0ZXJhbmNlOiBVdHRlcmFuY2UgfCBudWxsO1xuXG4gICAgICAvLyBDYWxsZWQgd2hlbiB0aGlzIG5vZGUgaXMgZm9jdXNlZC5cbiAgICAgIHByaXZhdGUgX3ZvaWNpbmdGb2N1c0xpc3RlbmVyITogU2NlbmVyeUxpc3RlbmVyRnVuY3Rpb248Rm9jdXNFdmVudD4gfCBudWxsO1xuXG4gICAgICAvLyBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIE5vZGUgY2FuIHNwZWFrLiBBIE5vZGUgY2FuIHNwZWFrIGlmIHNlbGYgYW5kIGFsbCBvZiBpdHMgYW5jZXN0b3JzIGFyZSB2aXNpYmxlIGFuZFxuICAgICAgLy8gdm9pY2luZ1Zpc2libGUuIFRoaXMgaXMgcHJpdmF0ZSBiZWNhdXNlIGl0cyB2YWx1ZSBkZXBlbmRzIG9uIHRoZSBzdGF0ZSBvZiB0aGUgSW5zdGFuY2UgdHJlZS4gTGlzdGVuaW5nIHRvIHRoaXNcbiAgICAgIC8vIHRvIGNoYW5nZSB0aGUgc2NlbmUgZ3JhcGggc3RhdGUgY2FuIGJlIGluY3JlZGlibHkgZGFuZ2Vyb3VzIGFuZCBidWdneSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNjE1XG4gICAgICAvLyBAbWl4aW4tcHJpdmF0ZSAtIHByaXZhdGUgdG8gdGhpcyBmaWxlLCBidXQgcHVibGljIG5lZWRlZCBmb3IgdGhlIGludGVyZmFjZVxuICAgICAgcHVibGljIF92b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eSE6IFRpbnlQcm9wZXJ0eTxib29sZWFuPjtcblxuICAgICAgLy8gQSBjb3VudGVyIHRoYXQga2VlcHMgdHJhY2sgb2YgdmlzaWJsZSBhbmQgdm9pY2luZ1Zpc2libGUgSW5zdGFuY2VzIG9mIHRoaXMgTm9kZS5cbiAgICAgIC8vIEFzIGxvbmcgYXMgdGhpcyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gemVybywgdGhpcyBOb2RlIGNhbiBzcGVhay4gU2VlIG9uSW5zdGFuY2VWaXNpYmlsaXR5Q2hhbmdlXG4gICAgICAvLyBhbmQgb25JbnN0YW5jZVZvaWNpbmdWaXNpYmlsaXR5Q2hhbmdlIGZvciBtb3JlIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICBwcml2YXRlIF92b2ljaW5nQ2FuU3BlYWtDb3VudCE6IG51bWJlcjtcblxuICAgICAgLy8gQ2FsbGVkIHdoZW4gYGNhblZvaWNlRW1pdHRlcmAgZW1pdHMgZm9yIGFuIEluc3RhbmNlLlxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfYm91bmRJbnN0YW5jZUNhblZvaWNlQ2hhbmdlTGlzdGVuZXI6ICggY2FuU3BlYWs6IGJvb2xlYW4gKSA9PiB2b2lkO1xuXG4gICAgICAvLyBXaGVuZXZlciBhbiBJbnN0YW5jZSBvZiB0aGlzIE5vZGUgaXMgYWRkZWQgb3IgcmVtb3ZlZCwgYWRkL3JlbW92ZSBsaXN0ZW5lcnMgdGhhdCB3aWxsIHVwZGF0ZSB0aGVcbiAgICAgIC8vIGNhblNwZWFrUHJvcGVydHkuXG4gICAgICBwcml2YXRlIF9ib3VuZEluc3RhbmNlc0NoYW5nZWRMaXN0ZW5lciE6ICggaW5zdGFuY2U6IEluc3RhbmNlLCBhZGRlZDogYm9vbGVhbiApID0+IHZvaWQ7XG5cbiAgICAgIC8vIElucHV0IGxpc3RlbmVyIHRoYXQgc3BlYWtzIGNvbnRlbnQgb24gZm9jdXMuIFRoaXMgaXMgdGhlIG9ubHkgaW5wdXQgbGlzdGVuZXIgYWRkZWRcbiAgICAgIC8vIGJ5IFZvaWNpbmcsIGJ1dCBpdCBpcyB0aGUgb25lIHRoYXQgaXMgY29uc2lzdGVudCBmb3IgYWxsIFZvaWNpbmcgbm9kZXMuIE9uIGZvY3VzLCBzcGVhayB0aGUgbmFtZSwgb2JqZWN0XG4gICAgICAvLyByZXNwb25zZSwgYW5kIGludGVyYWN0aW9uIGhpbnQuXG4gICAgICBwcml2YXRlIF9zcGVha0NvbnRlbnRPbkZvY3VzTGlzdGVuZXIhOiB7IGZvY3VzOiBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbjxGb2N1c0V2ZW50PiB9O1xuXG4gICAgICBwdWJsaWMgY29uc3RydWN0b3IoIC4uLmFyZ3M6IEludGVudGlvbmFsQW55W10gKSB7XG4gICAgICAgIHN1cGVyKCAuLi5hcmdzICk7XG5cbiAgICAgICAgLy8gQmluZCB0aGUgbGlzdGVuZXJzIG9uIGNvbnN0cnVjdGlvbiB0byBiZSBhZGRlZCB0byBvYnNlcnZhYmxlcyBvbiBpbml0aWFsaXplIGFuZCByZW1vdmVkIG9uIGNsZWFuL2Rpc3Bvc2UuXG4gICAgICAgIC8vIEluc3RhbmNlcyBhcmUgdXBkYXRlZCBhc3luY2hyb25vdXNseSBpbiB1cGRhdGVEaXNwbGF5LiBUaGUgYmluZCBjcmVhdGVzIGEgbmV3IGZ1bmN0aW9uIGFuZCB3ZSBuZWVkIHRoZVxuICAgICAgICAvLyByZWZlcmVuY2UgdG8gcGVyc2lzdCB0aHJvdWdoIHRoZSBjb21wbGV0aW9uIG9mIGluaXRpYWxpemUgYW5kIGRpc3Bvc2FsLlxuICAgICAgICB0aGlzLl9ib3VuZEluc3RhbmNlQ2FuVm9pY2VDaGFuZ2VMaXN0ZW5lciA9IHRoaXMub25JbnN0YW5jZUNhblZvaWNlQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblxuICAgICAgICB0aGlzLl92b2ljaW5nVXR0ZXJhbmNlID0gbnVsbDtcblxuICAgICAgICAvLyBXZSBvbmx5IHdhbnQgdG8gY2FsbCB0aGlzIG1ldGhvZCwgbm90IGFueSBzdWJ0eXBlIGltcGxlbWVudGF0aW9uXG4gICAgICAgIFZvaWNpbmdDbGFzcy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKCB0aGlzICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlcGFyYXRlIGZyb20gdGhlIGNvbnN0cnVjdG9yIHRvIHN1cHBvcnQgY2FzZXMgd2hlcmUgVm9pY2luZyBpcyB1c2VkIGluIFBvb2xhYmxlIE5vZGVzLlxuICAgICAgLy8gLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSBiZWNhdXNlIHRoaW5ncyBsaWtlIFJpY2hUZXh0TGluayBuZWVkIHRvIHByb3ZpZGUgYXJndW1lbnRzIHRvIGluaXRpYWxpemUsIGFuZCBUUyBjb21wbGFpbnNcbiAgICAgIC8vIG90aGVyd2lzZVxuICAgICAgcHVibGljIGluaXRpYWxpemUoIC4uLmFyZ3M6IEludGVudGlvbmFsQW55W10gKTogdGhpcyB7XG5cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBzdXBlci5pbml0aWFsaXplICYmIHN1cGVyLmluaXRpYWxpemUoIGFyZ3MgKTtcblxuICAgICAgICB0aGlzLl92b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHk8Ym9vbGVhbj4oIHRydWUgKTtcbiAgICAgICAgdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0ID0gbmV3IFJlc3BvbnNlUGFja2V0KCk7XG4gICAgICAgIHRoaXMuX3ZvaWNpbmdGb2N1c0xpc3RlbmVyID0gdGhpcy5kZWZhdWx0Rm9jdXNMaXN0ZW5lcjtcblxuICAgICAgICAvLyBTZXRzIHRoZSBkZWZhdWx0IHZvaWNpbmdVdHRlcmFuY2UgYW5kIG1ha2VzIHRoaXMuY2FuU3BlYWtQcm9wZXJ0eSBhIGRlcGVuZGVuY3kgb24gaXRzIGFiaWxpdHkgdG8gYW5ub3VuY2UuXG4gICAgICAgIHRoaXMuc2V0Vm9pY2luZ1V0dGVyYW5jZSggbmV3IE93bmVkVm9pY2luZ1V0dGVyYW5jZSgpICk7XG5cbiAgICAgICAgdGhpcy5fdm9pY2luZ0NhblNwZWFrQ291bnQgPSAwO1xuXG4gICAgICAgIHRoaXMuX2JvdW5kSW5zdGFuY2VzQ2hhbmdlZExpc3RlbmVyID0gdGhpcy5hZGRPclJlbW92ZUluc3RhbmNlTGlzdGVuZXJzLmJpbmQoIHRoaXMgKTtcblxuICAgICAgICAvLyBUaGlzIGlzIHBvdGVudGlhbGx5IGRhbmdlcm91cyB0byBsaXN0ZW4gdG8gZ2VuZXJhbGx5LCBidXQgaW4gdGhpcyBjYXNlIGl0IGlzIHNhZmUgYmVjYXVzZSB0aGUgc3RhdGUgd2UgY2hhbmdlXG4gICAgICAgIC8vIHdpbGwgb25seSBhZmZlY3QgaG93IHdlIHZvaWNlIChwYXJ0IG9mIHRoZSBhdWRpbyB2aWV3KSwgYW5kIG5vdCBwYXJ0IG9mIHRoaXMgZGlzcGxheSdzIHNjZW5lIGdyYXBoLlxuICAgICAgICB0aGlzLmNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX2JvdW5kSW5zdGFuY2VzQ2hhbmdlZExpc3RlbmVyICk7XG5cbiAgICAgICAgdGhpcy5fc3BlYWtDb250ZW50T25Gb2N1c0xpc3RlbmVyID0ge1xuICAgICAgICAgIGZvY3VzOiBldmVudCA9PiB7XG4gICAgICAgICAgICB0aGlzLl92b2ljaW5nRm9jdXNMaXN0ZW5lciAmJiB0aGlzLl92b2ljaW5nRm9jdXNMaXN0ZW5lciggZXZlbnQgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fc3BlYWtDb250ZW50T25Gb2N1c0xpc3RlbmVyICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU3BlYWsgYWxsIHJlc3BvbnNlcyBhc3NpZ25lZCB0byB0aGlzIE5vZGUuIE9wdGlvbnMgYWxsb3cgeW91IHRvIG92ZXJyaWRlIGEgcmVzcG9uc2VzIGZvciB0aGlzIHBhcnRpY3VsYXJcbiAgICAgICAqIHNwZWVjaCByZXF1ZXN0LiBFYWNoIHJlc3BvbnNlIGlzIG9ubHkgc3Bva2VuIGlmIHRoZSBhc3NvY2lhdGVkIFByb3BlcnR5IG9mIHJlc3BvbnNlQ29sbGVjdG9yIGlzIHRydWUuIElmXG4gICAgICAgKiBhbGwgYXJlIFByb3BlcnRpZXMgYXJlIGZhbHNlLCBub3RoaW5nIHdpbGwgYmUgc3Bva2VuLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgdm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVha2luZ09wdGlvbnMgKTogdm9pZCB7XG5cbiAgICAgICAgLy8gb3B0aW9ucyBhcmUgcGFzc2VkIGFsb25nIHRvIGNvbGxlY3RBbmRTcGVha1Jlc3BvbnNlLCBzZWUgdGhhdCBmdW5jdGlvbiBmb3IgYWRkaXRpb25hbCBvcHRpb25zXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxTcGVha2luZ09wdGlvbnM+KCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAgICAgLy8gTGF6aWx5IGZvcm11bGF0ZSBzdHJpbmdzIG9ubHkgYXMgbmVlZGVkXG4gICAgICAgIGlmICggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoICduYW1lUmVzcG9uc2UnICkgKSB7XG4gICAgICAgICAgb3B0aW9ucy5uYW1lUmVzcG9uc2UgPSB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQubmFtZVJlc3BvbnNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdvYmplY3RSZXNwb25zZScgKSApIHtcbiAgICAgICAgICBvcHRpb25zLm9iamVjdFJlc3BvbnNlID0gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lm9iamVjdFJlc3BvbnNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdjb250ZXh0UmVzcG9uc2UnICkgKSB7XG4gICAgICAgICAgb3B0aW9ucy5jb250ZXh0UmVzcG9uc2UgPSB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQuY29udGV4dFJlc3BvbnNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdoaW50UmVzcG9uc2UnICkgKSB7XG4gICAgICAgICAgb3B0aW9ucy5oaW50UmVzcG9uc2UgPSB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQuaGludFJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb2xsZWN0QW5kU3BlYWtSZXNwb25zZSggb3B0aW9ucyApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNwZWFrIE9OTFkgdGhlIHByb3ZpZGVkIHJlc3BvbnNlcyB0aGF0IHlvdSBwYXNzIGluIHdpdGggb3B0aW9ucy4gVGhpcyB3aWxsIE5PVCBzcGVhayB0aGUgbmFtZSwgb2JqZWN0LFxuICAgICAgICogY29udGV4dCwgb3IgaGludCByZXNwb25zZXMgYXNzaWduZWQgdG8gdGhpcyBub2RlIGJ5IGRlZmF1bHQuIEJ1dCBpdCBhbGxvd3MgZm9yIGNsYXJpdHkgYXQgdXNhZ2VzIHNvIGl0IGlzXG4gICAgICAgKiBjbGVhciB0aGF0IHlvdSBhcmUgb25seSByZXF1ZXN0aW5nIGNlcnRhaW4gcmVzcG9uc2VzLiBJZiB5b3Ugd2FudCB0byBzcGVhayBhbGwgb2YgdGhlIHJlc3BvbnNlcyBhc3NpZ25lZFxuICAgICAgICogdG8gdGhpcyBOb2RlLCB1c2Ugdm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCkuXG4gICAgICAgKlxuICAgICAgICogRWFjaCByZXNwb25zZSB3aWxsIG9ubHkgYmUgc3Bva2VuIGlmIHRoZSBQcm9wZXJ0aWVzIG9mIHJlc3BvbnNlQ29sbGVjdG9yIGFyZSB0cnVlLiBJZiBhbGwgb2YgdGhvc2UgYXJlIGZhbHNlLFxuICAgICAgICogbm90aGluZyB3aWxsIGJlIHNwb2tlbi5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHZvaWNpbmdTcGVha1Jlc3BvbnNlKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVha2luZ09wdGlvbnMgKTogdm9pZCB7XG5cbiAgICAgICAgLy8gb3B0aW9ucyBhcmUgcGFzc2VkIGFsb25nIHRvIGNvbGxlY3RBbmRTcGVha1Jlc3BvbnNlLCBzZWUgdGhhdCBmdW5jdGlvbiBmb3IgYWRkaXRpb25hbCBvcHRpb25zXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxTcGVha2luZ09wdGlvbnM+KCB7XG4gICAgICAgICAgbmFtZVJlc3BvbnNlOiBudWxsLFxuICAgICAgICAgIG9iamVjdFJlc3BvbnNlOiBudWxsLFxuICAgICAgICAgIGNvbnRleHRSZXNwb25zZTogbnVsbCxcbiAgICAgICAgICBoaW50UmVzcG9uc2U6IG51bGxcbiAgICAgICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAgICAgdGhpcy5jb2xsZWN0QW5kU3BlYWtSZXNwb25zZSggb3B0aW9ucyApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEJ5IGRlZmF1bHQsIHNwZWFrIHRoZSBuYW1lIHJlc3BvbnNlLiBCdXQgYWNjZXB0cyBhbGwgb3RoZXIgcmVzcG9uc2VzIHRocm91Z2ggb3B0aW9ucy4gUmVzcGVjdHMgcmVzcG9uc2VDb2xsZWN0b3JcbiAgICAgICAqIFByb3BlcnRpZXMsIHNvIHRoZSBuYW1lIHJlc3BvbnNlIG1heSBub3QgYmUgc3Bva2VuIGlmIHJlc3BvbnNlQ29sbGVjdG9yLm5hbWVSZXNwb25zZUVuYWJsZWRQcm9wZXJ0eSBpcyBmYWxzZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHZvaWNpbmdTcGVha05hbWVSZXNwb25zZSggcHJvdmlkZWRPcHRpb25zPzogU3BlYWtpbmdPcHRpb25zICk6IHZvaWQge1xuXG4gICAgICAgIC8vIG9wdGlvbnMgYXJlIHBhc3NlZCBhbG9uZyB0byBjb2xsZWN0QW5kU3BlYWtSZXNwb25zZSwgc2VlIHRoYXQgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgb3B0aW9uc1xuICAgICAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8U3BlYWtpbmdPcHRpb25zPigge30sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgICAgIC8vIExhemlseSBmb3JtdWxhdGUgc3RyaW5ncyBvbmx5IGFzIG5lZWRlZFxuICAgICAgICBpZiAoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAnbmFtZVJlc3BvbnNlJyApICkge1xuICAgICAgICAgIG9wdGlvbnMubmFtZVJlc3BvbnNlID0gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lm5hbWVSZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29sbGVjdEFuZFNwZWFrUmVzcG9uc2UoIG9wdGlvbnMgKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBCeSBkZWZhdWx0LCBzcGVhayB0aGUgb2JqZWN0IHJlc3BvbnNlLiBCdXQgYWNjZXB0cyBhbGwgb3RoZXIgcmVzcG9uc2VzIHRocm91Z2ggb3B0aW9ucy4gUmVzcGVjdHMgcmVzcG9uc2VDb2xsZWN0b3JcbiAgICAgICAqIFByb3BlcnRpZXMsIHNvIHRoZSBvYmplY3QgcmVzcG9uc2UgbWF5IG5vdCBiZSBzcG9rZW4gaWYgcmVzcG9uc2VDb2xsZWN0b3Iub2JqZWN0UmVzcG9uc2VFbmFibGVkUHJvcGVydHkgaXMgZmFsc2UuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyB2b2ljaW5nU3BlYWtPYmplY3RSZXNwb25zZSggcHJvdmlkZWRPcHRpb25zPzogU3BlYWtpbmdPcHRpb25zICk6IHZvaWQge1xuXG4gICAgICAgIC8vIG9wdGlvbnMgYXJlIHBhc3NlZCBhbG9uZyB0byBjb2xsZWN0QW5kU3BlYWtSZXNwb25zZSwgc2VlIHRoYXQgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgb3B0aW9uc1xuICAgICAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8U3BlYWtpbmdPcHRpb25zPigge30sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgICAgIC8vIExhemlseSBmb3JtdWxhdGUgc3RyaW5ncyBvbmx5IGFzIG5lZWRlZFxuICAgICAgICBpZiAoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAnb2JqZWN0UmVzcG9uc2UnICkgKSB7XG4gICAgICAgICAgb3B0aW9ucy5vYmplY3RSZXNwb25zZSA9IHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5vYmplY3RSZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29sbGVjdEFuZFNwZWFrUmVzcG9uc2UoIG9wdGlvbnMgKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBCeSBkZWZhdWx0LCBzcGVhayB0aGUgY29udGV4dCByZXNwb25zZS4gQnV0IGFjY2VwdHMgYWxsIG90aGVyIHJlc3BvbnNlcyB0aHJvdWdoIG9wdGlvbnMuIFJlc3BlY3RzXG4gICAgICAgKiByZXNwb25zZUNvbGxlY3RvciBQcm9wZXJ0aWVzLCBzbyB0aGUgY29udGV4dCByZXNwb25zZSBtYXkgbm90IGJlIHNwb2tlbiBpZlxuICAgICAgICogcmVzcG9uc2VDb2xsZWN0b3IuY29udGV4dFJlc3BvbnNlRW5hYmxlZFByb3BlcnR5IGlzIGZhbHNlLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgdm9pY2luZ1NwZWFrQ29udGV4dFJlc3BvbnNlKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVha2luZ09wdGlvbnMgKTogdm9pZCB7XG5cbiAgICAgICAgLy8gb3B0aW9ucyBhcmUgcGFzc2VkIGFsb25nIHRvIGNvbGxlY3RBbmRTcGVha1Jlc3BvbnNlLCBzZWUgdGhhdCBmdW5jdGlvbiBmb3IgYWRkaXRpb25hbCBvcHRpb25zXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxTcGVha2luZ09wdGlvbnM+KCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAgICAgLy8gTGF6aWx5IGZvcm11bGF0ZSBzdHJpbmdzIG9ubHkgYXMgbmVlZGVkXG4gICAgICAgIGlmICggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdjb250ZXh0UmVzcG9uc2UnICkgKSB7XG4gICAgICAgICAgb3B0aW9ucy5jb250ZXh0UmVzcG9uc2UgPSB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQuY29udGV4dFJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb2xsZWN0QW5kU3BlYWtSZXNwb25zZSggb3B0aW9ucyApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEJ5IGRlZmF1bHQsIHNwZWFrIHRoZSBoaW50IHJlc3BvbnNlLiBCdXQgYWNjZXB0cyBhbGwgb3RoZXIgcmVzcG9uc2VzIHRocm91Z2ggb3B0aW9ucy4gUmVzcGVjdHNcbiAgICAgICAqIHJlc3BvbnNlQ29sbGVjdG9yIFByb3BlcnRpZXMsIHNvIHRoZSBoaW50IHJlc3BvbnNlIG1heSBub3QgYmUgc3Bva2VuIGlmXG4gICAgICAgKiByZXNwb25zZUNvbGxlY3Rvci5oaW50UmVzcG9uc2VFbmFibGVkUHJvcGVydHkgaXMgZmFsc2UuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyB2b2ljaW5nU3BlYWtIaW50UmVzcG9uc2UoIHByb3ZpZGVkT3B0aW9ucz86IFNwZWFraW5nT3B0aW9ucyApOiB2b2lkIHtcblxuICAgICAgICAvLyBvcHRpb25zIGFyZSBwYXNzZWQgYWxvbmcgdG8gY29sbGVjdEFuZFNwZWFrUmVzcG9uc2UsIHNlZSB0aGF0IGZ1bmN0aW9uIGZvciBhZGRpdGlvbmFsIG9wdGlvbnNcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFNwZWFraW5nT3B0aW9ucz4oIHt9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgICAgICAvLyBMYXppbHkgZm9ybXVsYXRlIHN0cmluZ3Mgb25seSBhcyBuZWVkZWRcbiAgICAgICAgaWYgKCAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2hpbnRSZXNwb25zZScgKSApIHtcbiAgICAgICAgICBvcHRpb25zLmhpbnRSZXNwb25zZSA9IHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5oaW50UmVzcG9uc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbGxlY3RBbmRTcGVha1Jlc3BvbnNlKCBvcHRpb25zICk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29sbGVjdCByZXNwb25zZXMgd2l0aCB0aGUgcmVzcG9uc2VDb2xsZWN0b3IgYW5kIHNwZWFrIHRoZSBvdXRwdXQgd2l0aCBhbiBVdHRlcmFuY2VRdWV1ZS5cbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBjb2xsZWN0QW5kU3BlYWtSZXNwb25zZSggcHJvdmlkZWRPcHRpb25zPzogU3BlYWtpbmdPcHRpb25zICk6IHZvaWQge1xuICAgICAgICB0aGlzLnNwZWFrQ29udGVudCggdGhpcy5jb2xsZWN0UmVzcG9uc2UoIHByb3ZpZGVkT3B0aW9ucyApICk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29tYmluZSBhbGwgdHlwZXMgb2YgcmVzcG9uc2UgaW50byBhIHNpbmdsZSBhbGVydGFibGUsIHBvdGVudGlhbGx5IGRlcGVuZGluZyBvbiB0aGUgY3VycmVudCBzdGF0ZSBvZlxuICAgICAgICogcmVzcG9uc2VDb2xsZWN0b3IgUHJvcGVydGllcyAoZmlsdGVyaW5nIHdoYXQga2luZCBvZiByZXNwb25zZXMgdG8gcHJlc2VudCBpbiB0aGUgcmVzb2x2ZWQgcmVzcG9uc2UpLlxuICAgICAgICogQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgICAgICAqL1xuICAgICAgcHVibGljIGNvbGxlY3RSZXNwb25zZSggcHJvdmlkZWRPcHRpb25zPzogU3BlYWtpbmdPcHRpb25zICk6IFRBbGVydGFibGUge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8U3BlYWtpbmdPcHRpb25zPigge1xuICAgICAgICAgIGlnbm9yZVByb3BlcnRpZXM6IHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5pZ25vcmVQcm9wZXJ0aWVzLFxuICAgICAgICAgIHJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb246IHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5yZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uLFxuICAgICAgICAgIHV0dGVyYW5jZTogdGhpcy52b2ljaW5nVXR0ZXJhbmNlXG4gICAgICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgICAgIGxldCByZXNwb25zZTogVEFsZXJ0YWJsZSA9IHJlc3BvbnNlQ29sbGVjdG9yLmNvbGxlY3RSZXNwb25zZXMoIG9wdGlvbnMgKTtcblxuICAgICAgICBpZiAoIG9wdGlvbnMudXR0ZXJhbmNlICkge1xuICAgICAgICAgIG9wdGlvbnMudXR0ZXJhbmNlLmFsZXJ0ID0gcmVzcG9uc2U7XG4gICAgICAgICAgcmVzcG9uc2UgPSBvcHRpb25zLnV0dGVyYW5jZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogVXNlIHRoZSBwcm92aWRlZCBmdW5jdGlvbiB0byBjcmVhdGUgY29udGVudCB0byBzcGVhayBpbiByZXNwb25zZSB0byBpbnB1dC4gVGhlIGNvbnRlbnQgaXMgdGhlbiBhZGRlZCB0byB0aGVcbiAgICAgICAqIGJhY2sgb2YgdGhlIHZvaWNpbmcgVXR0ZXJhbmNlUXVldWUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzcGVha0NvbnRlbnQoIGNvbnRlbnQ6IFRBbGVydGFibGUgKTogdm9pZCB7XG5cbiAgICAgICAgY29uc3Qgbm90UGhldGlvQXJjaGV0eXBlID0gIVRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgfHwgIXRoaXMuaXNJbnNpZGVQaGV0aW9BcmNoZXR5cGUoKTtcblxuICAgICAgICAvLyBkb24ndCBzZW5kIHRvIHV0dGVyYW5jZVF1ZXVlIGlmIHJlc3BvbnNlIGlzIGVtcHR5XG4gICAgICAgIC8vIGRvbid0IHNlbmQgdG8gdXR0ZXJhbmNlUXVldWUgZm9yIFBoRVQtaU8gZHluYW1pYyBlbGVtZW50IGFyY2hldHlwZXMsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvODE3XG4gICAgICAgIGlmICggY29udGVudCAmJiBub3RQaGV0aW9BcmNoZXR5cGUgKSB7XG4gICAgICAgICAgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggY29udGVudCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSB2b2ljaW5nTmFtZVJlc3BvbnNlIGZvciB0aGlzIE5vZGUuIFRoaXMgaXMgdXN1YWxseSB0aGUgbGFiZWwgb2YgdGhlIGVsZW1lbnQgYW5kIGlzIHNwb2tlblxuICAgICAgICogd2hlbiB0aGUgb2JqZWN0IHJlY2VpdmVzIGlucHV0LiBXaGVuIHJlcXVlc3Rpbmcgc3BlZWNoLCB0aGlzIHdpbGwgb25seSBiZSBzcG9rZW4gaWZcbiAgICAgICAqIHJlc3BvbnNlQ29sbGVjdG9yLm5hbWVSZXNwb25zZXNFbmFibGVkUHJvcGVydHkgaXMgc2V0IHRvIHRydWUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRWb2ljaW5nTmFtZVJlc3BvbnNlKCByZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlICk6IHZvaWQge1xuICAgICAgICB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQubmFtZVJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgdm9pY2luZ05hbWVSZXNwb25zZSggcmVzcG9uc2U6IFZvaWNpbmdSZXNwb25zZSApIHsgdGhpcy5zZXRWb2ljaW5nTmFtZVJlc3BvbnNlKCByZXNwb25zZSApOyB9XG5cbiAgICAgIHB1YmxpYyBnZXQgdm9pY2luZ05hbWVSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlIHsgcmV0dXJuIHRoaXMuZ2V0Vm9pY2luZ05hbWVSZXNwb25zZSgpOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0IHRoZSB2b2ljaW5nTmFtZVJlc3BvbnNlIGZvciB0aGlzIE5vZGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRWb2ljaW5nTmFtZVJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lm5hbWVSZXNwb25zZTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgdGhlIG9iamVjdCByZXNwb25zZSBmb3IgdGhpcyBOb2RlLiBUaGlzIGlzIHVzdWFsbHkgdGhlIHN0YXRlIGluZm9ybWF0aW9uIGFzc29jaWF0ZWQgd2l0aCB0aGlzIE5vZGUsIHN1Y2hcbiAgICAgICAqIGFzIGl0cyBjdXJyZW50IGlucHV0IHZhbHVlLiBXaGVuIHJlcXVlc3Rpbmcgc3BlZWNoLCB0aGlzIHdpbGwgb25seSBiZSBoZWFyZCB3aGVuXG4gICAgICAgKiByZXNwb25zZUNvbGxlY3Rvci5vYmplY3RSZXNwb25zZXNFbmFibGVkUHJvcGVydHkgaXMgc2V0IHRvIHRydWUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRWb2ljaW5nT2JqZWN0UmVzcG9uc2UoIHJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5vYmplY3RSZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHZvaWNpbmdPYmplY3RSZXNwb25zZSggcmVzcG9uc2U6IFZvaWNpbmdSZXNwb25zZSApIHsgdGhpcy5zZXRWb2ljaW5nT2JqZWN0UmVzcG9uc2UoIHJlc3BvbnNlICk7IH1cblxuICAgICAgcHVibGljIGdldCB2b2ljaW5nT2JqZWN0UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdPYmplY3RSZXNwb25zZSgpOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0cyB0aGUgb2JqZWN0IHJlc3BvbnNlIGZvciB0aGlzIE5vZGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRWb2ljaW5nT2JqZWN0UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQub2JqZWN0UmVzcG9uc2U7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0IHRoZSBjb250ZXh0IHJlc3BvbnNlIGZvciB0aGlzIE5vZGUuIFRoaXMgaXMgdXN1YWxseSB0aGUgY29udGVudCB0aGF0IGRlc2NyaWJlcyB3aGF0IGhhcyBoYXBwZW5lZCBpblxuICAgICAgICogdGhlIHN1cnJvdW5kaW5nIGFwcGxpY2F0aW9uIGluIHJlc3BvbnNlIHRvIGludGVyYWN0aW9uIHdpdGggdGhpcyBOb2RlLiBXaGVuIHJlcXVlc3Rpbmcgc3BlZWNoLCB0aGlzIHdpbGxcbiAgICAgICAqIG9ubHkgYmUgaGVhcmQgaWYgcmVzcG9uc2VDb2xsZWN0b3IuY29udGV4dFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSBpcyBzZXQgdG8gdHJ1ZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldFZvaWNpbmdDb250ZXh0UmVzcG9uc2UoIHJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5jb250ZXh0UmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCB2b2ljaW5nQ29udGV4dFJlc3BvbnNlKCByZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlICkgeyB0aGlzLnNldFZvaWNpbmdDb250ZXh0UmVzcG9uc2UoIHJlc3BvbnNlICk7IH1cblxuICAgICAgcHVibGljIGdldCB2b2ljaW5nQ29udGV4dFJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2UgeyByZXR1cm4gdGhpcy5nZXRWb2ljaW5nQ29udGV4dFJlc3BvbnNlKCk7IH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIHRoZSBjb250ZXh0IHJlc3BvbnNlIGZvciB0aGlzIE5vZGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRWb2ljaW5nQ29udGV4dFJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmNvbnRleHRSZXNwb25zZTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSBoaW50IHJlc3BvbnNlIGZvciB0aGlzIE5vZGUuIFRoaXMgaXMgdXN1YWxseSBhIHJlc3BvbnNlIHRoYXQgZGVzY3JpYmVzIGhvdyB0byBpbnRlcmFjdCB3aXRoIHRoaXMgTm9kZS5cbiAgICAgICAqIFdoZW4gcmVxdWVzdGluZyBzcGVlY2gsIHRoaXMgd2lsbCBvbmx5IGJlIHNwb2tlbiB3aGVuIHJlc3BvbnNlQ29sbGVjdG9yLmhpbnRSZXNwb25zZXNFbmFibGVkUHJvcGVydHkgaXMgc2V0IHRvXG4gICAgICAgKiB0cnVlLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0Vm9pY2luZ0hpbnRSZXNwb25zZSggcmVzcG9uc2U6IFZvaWNpbmdSZXNwb25zZSApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmhpbnRSZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHZvaWNpbmdIaW50UmVzcG9uc2UoIHJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKSB7IHRoaXMuc2V0Vm9pY2luZ0hpbnRSZXNwb25zZSggcmVzcG9uc2UgKTsgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHZvaWNpbmdIaW50UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdIaW50UmVzcG9uc2UoKTsgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgdGhlIGhpbnQgcmVzcG9uc2UgZm9yIHRoaXMgTm9kZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGdldFZvaWNpbmdIaW50UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQuaGludFJlc3BvbnNlO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldCB3aGV0aGVyIG9yIG5vdCBhbGwgcmVzcG9uc2VzIGZvciB0aGlzIE5vZGUgd2lsbCBpZ25vcmUgdGhlIFByb3BlcnRpZXMgb2YgcmVzcG9uc2VDb2xsZWN0b3IuIElmIGZhbHNlLFxuICAgICAgICogYWxsIHJlc3BvbnNlcyB3aWxsIGJlIHNwb2tlbiByZWdhcmRsZXNzIG9mIHJlc3BvbnNlQ29sbGVjdG9yIFByb3BlcnRpZXMsIHdoaWNoIGFyZSBnZW5lcmFsbHkgc2V0IGluIHVzZXJcbiAgICAgICAqIHByZWZlcmVuY2VzLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0Vm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcyggaWdub3JlUHJvcGVydGllczogYm9vbGVhbiApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lmlnbm9yZVByb3BlcnRpZXMgPSBpZ25vcmVQcm9wZXJ0aWVzO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXMoIGlnbm9yZVByb3BlcnRpZXM6IGJvb2xlYW4gKSB7IHRoaXMuc2V0Vm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcyggaWdub3JlUHJvcGVydGllcyApOyB9XG5cbiAgICAgIHB1YmxpYyBnZXQgdm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0Vm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcygpOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0IHdoZXRoZXIgb3Igbm90IHJlc3BvbnNlcyBhcmUgaWdub3JpbmcgcmVzcG9uc2VDb2xsZWN0b3IgUHJvcGVydGllcy5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGdldFZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXMoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQuaWdub3JlUHJvcGVydGllcztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSBjb2xsZWN0aW9uIG9mIHBhdHRlcm5zIHRvIHVzZSBmb3Igdm9pY2luZyByZXNwb25zZXMsIGNvbnRyb2xsaW5nIHRoZSBvcmRlciwgcHVuY3R1YXRpb24sIGFuZFxuICAgICAgICogYWRkaXRpb25hbCBjb250ZW50IGZvciBlYWNoIGNvbWJpbmF0aW9uIG9mIHJlc3BvbnNlLiBTZWUgUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi5qcyBpZiB5b3Ugd2lzaCB0byB1c2VcbiAgICAgICAqIGEgY29sbGVjdGlvbiBvZiBzdHJpbmcgcGF0dGVybnMgdGhhdCBhcmUgbm90IHRoZSBkZWZhdWx0LlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0Vm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24oIHBhdHRlcm5zOiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uICk6IHZvaWQge1xuXG4gICAgICAgIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5yZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uID0gcGF0dGVybnM7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgdm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24oIHBhdHRlcm5zOiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uICkgeyB0aGlzLnNldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCBwYXR0ZXJucyApOyB9XG5cbiAgICAgIHB1YmxpYyBnZXQgdm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24oKTogUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCk7IH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHZXQgdGhlIFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24gb2JqZWN0IHRoYXQgdGhpcyBWb2ljaW5nIE5vZGUgaXMgdXNpbmcgdG8gY29sbGVjdCByZXNwb25zZXMuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRWb2ljaW5nUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbigpOiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5yZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgdGhlIHV0dGVyYW5jZSB0aHJvdWdoIHdoaWNoIHZvaWNpbmcgYXNzb2NpYXRlZCB3aXRoIHRoaXMgTm9kZSB3aWxsIGJlIHNwb2tlbi4gQnkgZGVmYXVsdCBvbiBpbml0aWFsaXplLFxuICAgICAgICogb25lIHdpbGwgYmUgY3JlYXRlZCwgYnV0IGEgY3VzdG9tIG9uZSBjYW4gb3B0aW9uYWxseSBiZSBwcm92aWRlZC5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldFZvaWNpbmdVdHRlcmFuY2UoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICk6IHZvaWQge1xuICAgICAgICBpZiAoIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UgIT09IHV0dGVyYW5jZSApIHtcblxuICAgICAgICAgIGlmICggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSApIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYW5Wb2ljaW5nVXR0ZXJhbmNlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgVm9pY2luZy5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUoIHV0dGVyYW5jZSwgdGhpcyApO1xuICAgICAgICAgIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UgPSB1dHRlcmFuY2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCB2b2ljaW5nVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApIHsgdGhpcy5zZXRWb2ljaW5nVXR0ZXJhbmNlKCB1dHRlcmFuY2UgKTsgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHZvaWNpbmdVdHRlcmFuY2UoKTogVXR0ZXJhbmNlIHsgcmV0dXJuIHRoaXMuZ2V0Vm9pY2luZ1V0dGVyYW5jZSgpOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0cyB0aGUgdXR0ZXJhbmNlIHRocm91Z2ggd2hpY2ggdm9pY2luZyBhc3NvY2lhdGVkIHdpdGggdGhpcyBOb2RlIHdpbGwgYmUgc3Bva2VuLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZ2V0Vm9pY2luZ1V0dGVyYW5jZSgpOiBVdHRlcmFuY2Uge1xuICAgICAgICBhc3NlcnRVdHRlcmFuY2UoIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UgKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2U7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsbGVkIHdoZW5ldmVyIHRoaXMgTm9kZSBpcyBmb2N1c2VkLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0Vm9pY2luZ0ZvY3VzTGlzdGVuZXIoIGZvY3VzTGlzdGVuZXI6IFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uPEZvY3VzRXZlbnQ+IHwgbnVsbCApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdm9pY2luZ0ZvY3VzTGlzdGVuZXIgPSBmb2N1c0xpc3RlbmVyO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHZvaWNpbmdGb2N1c0xpc3RlbmVyKCBmb2N1c0xpc3RlbmVyOiBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbjxGb2N1c0V2ZW50PiB8IG51bGwgKSB7IHRoaXMuc2V0Vm9pY2luZ0ZvY3VzTGlzdGVuZXIoIGZvY3VzTGlzdGVuZXIgKTsgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHZvaWNpbmdGb2N1c0xpc3RlbmVyKCk6IFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uPEZvY3VzRXZlbnQ+IHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdGb2N1c0xpc3RlbmVyKCk7IH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIHRoZSB1dHRlcmFuY2VRdWV1ZSB0aHJvdWdoIHdoaWNoIHZvaWNpbmcgYXNzb2NpYXRlZCB3aXRoIHRoaXMgTm9kZSB3aWxsIGJlIHNwb2tlbi5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGdldFZvaWNpbmdGb2N1c0xpc3RlbmVyKCk6IFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uPEZvY3VzRXZlbnQ+IHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLl92b2ljaW5nRm9jdXNMaXN0ZW5lcjtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgZGVmYXVsdCBmb2N1cyBsaXN0ZW5lciBhdHRhY2hlZCB0byB0aGlzIE5vZGUgZHVyaW5nIGluaXRpYWxpemF0aW9uLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZGVmYXVsdEZvY3VzTGlzdGVuZXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7XG4gICAgICAgICAgY29udGV4dFJlc3BvbnNlOiBudWxsXG4gICAgICAgIH0gKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBXaGV0aGVyIGEgTm9kZSBjb21wb3NlcyBWb2ljaW5nLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZ2V0IF9pc1ZvaWNpbmcoKTogdHJ1ZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERldGFjaGVzIHJlZmVyZW5jZXMgdGhhdCBlbnN1cmUgdGhpcyBjb21wb25lbnRzIG9mIHRoaXMgVHJhaXQgYXJlIGVsaWdpYmxlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX3NwZWFrQ29udGVudE9uRm9jdXNMaXN0ZW5lciApO1xuICAgICAgICB0aGlzLmNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX2JvdW5kSW5zdGFuY2VzQ2hhbmdlZExpc3RlbmVyICk7XG5cbiAgICAgICAgaWYgKCB0aGlzLl92b2ljaW5nVXR0ZXJhbmNlICkge1xuICAgICAgICAgIHRoaXMuY2xlYW5Wb2ljaW5nVXR0ZXJhbmNlKCk7XG4gICAgICAgICAgdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBjbGVhbigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9zcGVha0NvbnRlbnRPbkZvY3VzTGlzdGVuZXIgKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkSW5zdGFuY2VFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLl9ib3VuZEluc3RhbmNlc0NoYW5nZWRMaXN0ZW5lciApO1xuXG4gICAgICAgIGlmICggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSApIHtcbiAgICAgICAgICB0aGlzLmNsZWFuVm9pY2luZ1V0dGVyYW5jZSgpO1xuICAgICAgICAgIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBzdXBlci5jbGVhbiAmJiBzdXBlci5jbGVhbigpO1xuICAgICAgfVxuXG4gICAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgICAvLyBQUklWQVRFIE1FVEhPRFNcbiAgICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgICAgLyoqXG4gICAgICAgKiBXaGVuIHZpc2liaWxpdHkgYW5kIHZvaWNpbmdWaXNpYmlsaXR5IGNoYW5nZSBzdWNoIHRoYXQgdGhlIEluc3RhbmNlIGNhbiBub3cgc3BlYWssIHVwZGF0ZSB0aGUgY291bnRpbmdcbiAgICAgICAqIHZhcmlhYmxlIHRoYXQgdHJhY2tzIGhvdyBtYW55IEluc3RhbmNlcyBvZiB0aGlzIFZvaWNpbmdOb2RlIGNhbiBzcGVhay4gVG8gc3BlYWsgdGhlIEluc3RhbmNlIG11c3QgYmUgZ2xvYmFsbHlcXFxuICAgICAgICogdmlzaWJsZSBhbmQgdm9pY2luZ1Zpc2libGUuXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgb25JbnN0YW5jZUNhblZvaWNlQ2hhbmdlKCBjYW5TcGVhazogYm9vbGVhbiApOiB2b2lkIHtcblxuICAgICAgICBpZiAoIGNhblNwZWFrICkge1xuICAgICAgICAgIHRoaXMuX3ZvaWNpbmdDYW5TcGVha0NvdW50Kys7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5fdm9pY2luZ0NhblNwZWFrQ291bnQtLTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3ZvaWNpbmdDYW5TcGVha0NvdW50ID49IDAsICd0aGUgdm9pY2luZ0NhblNwZWFrQ291bnQgc2hvdWxkIG5vdCBnbyBiZWxvdyB6ZXJvJyApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl92b2ljaW5nQ2FuU3BlYWtDb3VudCA8PSB0aGlzLmluc3RhbmNlcy5sZW5ndGgsXG4gICAgICAgICAgJ1RoZSB2b2ljaW5nQ2FuU3BlYWtDb3VudCBjYW5ub3QgYmUgZ3JlYXRlciB0aGFuIHRoZSBudW1iZXIgb2YgSW5zdGFuY2VzLicgKTtcblxuICAgICAgICB0aGlzLl92b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuX3ZvaWNpbmdDYW5TcGVha0NvdW50ID4gMDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBVcGRhdGUgdGhlIGNhblNwZWFrUHJvcGVydHkgYW5kIGNvdW50aW5nIHZhcmlhYmxlIGluIHJlc3BvbnNlIHRvIGFuIEluc3RhbmNlIG9mIHRoaXMgTm9kZSBiZWluZyBhZGRlZCBvclxuICAgICAgICogcmVtb3ZlZC5cbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBoYW5kbGVJbnN0YW5jZXNDaGFuZ2VkKCBpbnN0YW5jZTogSW5zdGFuY2UsIGFkZGVkOiBib29sZWFuICk6IHZvaWQge1xuICAgICAgICBjb25zdCBpc1Zpc2libGUgPSBpbnN0YW5jZS52aXNpYmxlICYmIGluc3RhbmNlLnZvaWNpbmdWaXNpYmxlO1xuICAgICAgICBpZiAoIGlzVmlzaWJsZSApIHtcblxuICAgICAgICAgIC8vIElmIHRoZSBhZGRlZCBJbnN0YW5jZSB3YXMgdmlzaWJsZSBhbmQgdm9pY2luZ1Zpc2libGUgaXQgc2hvdWxkIGluY3JlbWVudCB0aGUgY291bnRlci4gSWYgdGhlIHJlbW92ZWRcbiAgICAgICAgICAvLyBpbnN0YW5jZSBpcyBOT1QgdmlzaWJsZS92b2ljaW5nVmlzaWJsZSBpdCB3b3VsZCBub3QgaGF2ZSBjb250cmlidXRlZCB0byB0aGUgY291bnRlciBzbyB3ZSBzaG91bGQgbm90XG4gICAgICAgICAgLy8gZGVjcmVtZW50IGluIHRoYXQgY2FzZS5cbiAgICAgICAgICB0aGlzLl92b2ljaW5nQ2FuU3BlYWtDb3VudCA9IGFkZGVkID8gdGhpcy5fdm9pY2luZ0NhblNwZWFrQ291bnQgKyAxIDogdGhpcy5fdm9pY2luZ0NhblNwZWFrQ291bnQgLSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdm9pY2luZ0NhblNwZWFrUHJvcGVydHkudmFsdWUgPSB0aGlzLl92b2ljaW5nQ2FuU3BlYWtDb3VudCA+IDA7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkIG9yIHJlbW92ZSBsaXN0ZW5lcnMgb24gYW4gSW5zdGFuY2Ugd2F0Y2hpbmcgZm9yIGNoYW5nZXMgdG8gdmlzaWJsZSBvciB2b2ljaW5nVmlzaWJsZSB0aGF0IHdpbGwgbW9kaWZ5XG4gICAgICAgKiB0aGUgdm9pY2luZ0NhblNwZWFrQ291bnQuIFNlZSBkb2N1bWVudGF0aW9uIGZvciB2b2ljaW5nQ2FuU3BlYWtDb3VudCBmb3IgZGV0YWlscyBhYm91dCBob3cgdGhpcyBjb250cm9scyB0aGVcbiAgICAgICAqIHZvaWNpbmdDYW5TcGVha1Byb3BlcnR5LlxuICAgICAgICovXG4gICAgICBwcml2YXRlIGFkZE9yUmVtb3ZlSW5zdGFuY2VMaXN0ZW5lcnMoIGluc3RhbmNlOiBJbnN0YW5jZSwgYWRkZWQ6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGluc3RhbmNlLmNhblZvaWNlRW1pdHRlciwgJ0luc3RhbmNlIG11c3QgYmUgaW5pdGlhbGl6ZWQuJyApO1xuXG4gICAgICAgIGlmICggYWRkZWQgKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEVtaXR0ZXJzIGluIEluc3RhbmNlIG5lZWQgdHlwaW5nXG4gICAgICAgICAgaW5zdGFuY2UuY2FuVm9pY2VFbWl0dGVyIS5hZGRMaXN0ZW5lciggdGhpcy5fYm91bmRJbnN0YW5jZUNhblZvaWNlQ2hhbmdlTGlzdGVuZXIgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gRW1pdHRlcnMgaW4gSW5zdGFuY2UgbmVlZCB0eXBpbmdcbiAgICAgICAgICBpbnN0YW5jZS5jYW5Wb2ljZUVtaXR0ZXIhLnJlbW92ZUxpc3RlbmVyKCB0aGlzLl9ib3VuZEluc3RhbmNlQ2FuVm9pY2VDaGFuZ2VMaXN0ZW5lciApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZWFnZXJseSB1cGRhdGUgdGhlIGNhblNwZWFrUHJvcGVydHkgYW5kIGNvdW50aW5nIHZhcmlhYmxlcyBpbiBhZGRpdGlvbiB0byBhZGRpbmcgY2hhbmdlIGxpc3RlbmVyc1xuICAgICAgICB0aGlzLmhhbmRsZUluc3RhbmNlc0NoYW5nZWQoIGluc3RhbmNlLCBhZGRlZCApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENsZWFuIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UsIGRpc3Bvc2luZyBpZiB3ZSBvd24gaXQgb3IgdW5yZWdpc3RlcmluZyBpdCBpZiB3ZSBkbyBub3QuXG4gICAgICAgKiBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICAgICAgICovXG4gICAgICBwdWJsaWMgY2xlYW5Wb2ljaW5nVXR0ZXJhbmNlKCk6IHZvaWQge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl92b2ljaW5nVXR0ZXJhbmNlLCAnQSB2b2ljaW5nVXR0ZXJhbmNlIG11c3QgYmUgYXZhaWxhYmxlIHRvIGNsZWFuLicgKTtcbiAgICAgICAgaWYgKCB0aGlzLl92b2ljaW5nVXR0ZXJhbmNlIGluc3RhbmNlb2YgT3duZWRWb2ljaW5nVXR0ZXJhbmNlICkge1xuICAgICAgICAgIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLl92b2ljaW5nVXR0ZXJhbmNlICYmICF0aGlzLl92b2ljaW5nVXR0ZXJhbmNlLmlzRGlzcG9zZWQgKSB7XG4gICAgICAgICAgVm9pY2luZy51bnJlZ2lzdGVyVXR0ZXJhbmNlVG9Wb2ljaW5nTm9kZSggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSwgdGhpcyApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBtdXRhdGUoIG9wdGlvbnM/OiBTZWxmT3B0aW9ucyAmIFBhcmFtZXRlcnM8SW5zdGFuY2VUeXBlPFN1cGVyVHlwZT5bICdtdXRhdGUnIF0+WyAwIF0gKTogdGhpcyB7XG4gICAgICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgLyoqXG4gICAqIHtBcnJheS48c3RyaW5nPn0gLSBTdHJpbmcga2V5cyBmb3IgYWxsIHRoZSBhbGxvd2VkIG9wdGlvbnMgdGhhdCB3aWxsIGJlIHNldCBieSBOb2RlLm11dGF0ZSggb3B0aW9ucyApLCBpblxuICAgKiB0aGUgb3JkZXIgdGhleSB3aWxsIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogTk9URTogU2VlIE5vZGUncyBfbXV0YXRvcktleXMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdGhpcyBvcGVyYXRlcywgYW5kIHBvdGVudGlhbCBzcGVjaWFsXG4gICAqICAgICAgIGNhc2VzIHRoYXQgbWF5IGFwcGx5LlxuICAgKi9cbiAgVm9pY2luZ0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBWT0lDSU5HX09QVElPTl9LRVlTLmNvbmNhdCggVm9pY2luZ0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKTtcblxuICBhc3NlcnQgJiYgYXNzZXJ0KCBWb2ljaW5nQ2xhc3MucHJvdG90eXBlLl9tdXRhdG9yS2V5cy5sZW5ndGggPT09IF8udW5pcSggVm9pY2luZ0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKS5sZW5ndGgsICdkdXBsaWNhdGUgbXV0YXRvciBrZXlzIGluIFZvaWNpbmcnICk7XG5cbiAgcmV0dXJuIFZvaWNpbmdDbGFzcztcbn07XG5cblZvaWNpbmcuVk9JQ0lOR19PUFRJT05fS0VZUyA9IFZPSUNJTkdfT1BUSU9OX0tFWVM7XG5cbi8qKlxuICogQWxlcnQgYW4gVXR0ZXJhbmNlIHRvIHRoZSB2b2ljaW5nVXR0ZXJhbmNlUXVldWUuIFRoZSBVdHRlcmFuY2UgbXVzdCBoYXZlIHZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMgYW5kIGhvcGVmdWxseVxuICogYXQgbGVhc3Qgb25lIG9mIHRoZSBQcm9wZXJ0aWVzIGlzIGEgVm9pY2luZ05vZGUncyBjYW5Bbm5vdW5jZVByb3BlcnR5IHNvIHRoYXQgdGhpcyBVdHRlcmFuY2UgaXMgb25seSBhbm5vdW5jZWRcbiAqIHdoZW4gdGhlIFZvaWNpbmdOb2RlIGlzIGdsb2JhbGx5IHZpc2libGUgYW5kIHZvaWNpbmdWaXNpYmxlLlxuICogQHN0YXRpY1xuICovXG5Wb2ljaW5nLmFsZXJ0VXR0ZXJhbmNlID0gKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApID0+IHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggdXR0ZXJhbmNlLnZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMubGVuZ3RoID4gMCwgJ3ZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMgcmVxdWlyZWQsIHRoaXMgVXR0ZXJhbmNlIG1pZ2h0IG5vdCBiZSBjb25uZWN0ZWQgdG8gTm9kZSBpbiB0aGUgc2NlbmUgZ3JhcGguJyApO1xuICB2b2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB1dHRlcmFuY2UgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxufTtcblxuLyoqXG4gKiBBc3NpZ24gdGhlIHZvaWNpbmdOb2RlJ3Mgdm9pY2luZ0NhblNwZWFrUHJvcGVydHkgdG8gdGhlIFV0dGVyYW5jZSBzbyB0aGF0IHRoZSBVdHRlcmFuY2UgY2FuIG9ubHkgYmUgYW5ub3VuY2VkXG4gKiBpZiB0aGUgdm9pY2luZ05vZGUgaXMgZ2xvYmFsbHkgdmlzaWJsZSBhbmQgdm9pY2luZ1Zpc2libGUgaW4gdGhlIGRpc3BsYXkuXG4gKiBAc3RhdGljXG4gKi9cblZvaWNpbmcucmVnaXN0ZXJVdHRlcmFuY2VUb1ZvaWNpbmdOb2RlID0gKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSwgdm9pY2luZ05vZGU6IFRWb2ljaW5nICkgPT4ge1xuICBjb25zdCBleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcyA9IHV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzO1xuXG4gIGNvbnN0IHZvaWNpbmdDYW5TcGVha1Byb3BlcnR5ID0gdm9pY2luZ05vZGUuX3ZvaWNpbmdDYW5TcGVha1Byb3BlcnR5O1xuICBpZiAoICFleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcy5pbmNsdWRlcyggdm9pY2luZ0NhblNwZWFrUHJvcGVydHkgKSApIHtcbiAgICB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcyA9IGV4aXN0aW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzLmNvbmNhdCggWyB2b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eSBdICk7XG4gIH1cbn07XG5cbi8qKlxuICogUmVtb3ZlIGEgdm9pY2luZ05vZGUncyB2b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eSBmcm9tIHRoZSBVdHRlcmFuY2UuXG4gKiBAc3RhdGljXG4gKi9cblZvaWNpbmcudW5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUgPSAoIHV0dGVyYW5jZTogVXR0ZXJhbmNlLCB2b2ljaW5nTm9kZTogVm9pY2luZ05vZGUgKSA9PiB7XG4gIGNvbnN0IGV4aXN0aW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzID0gdXR0ZXJhbmNlLnZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXM7XG5cbiAgY29uc3Qgdm9pY2luZ0NhblNwZWFrUHJvcGVydHkgPSB2b2ljaW5nTm9kZS5fdm9pY2luZ0NhblNwZWFrUHJvcGVydHk7XG4gIGNvbnN0IGluZGV4ID0gZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMuaW5kZXhPZiggdm9pY2luZ0NhblNwZWFrUHJvcGVydHkgKTtcbiAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPiAtMSwgJ3ZvaWNpbmdOb2RlLnZvaWNpbmdDYW5TcGVha1Byb3BlcnR5IGlzIG5vdCBvbiB0aGUgVXR0ZXJhbmNlLCB3YXMgaXQgbm90IHJlZ2lzdGVyZWQ/JyApO1xuICB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcyA9IGV4aXN0aW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzLnNwbGljZSggaW5kZXgsIDEgKTtcbn07XG5cbi8qKlxuICogQXNzaWduIHRoZSBOb2RlJ3Mgdm9pY2luZ1Zpc2libGVQcm9wZXJ0eSBhbmQgdmlzaWJsZVByb3BlcnR5IHRvIHRoZSBVdHRlcmFuY2Ugc28gdGhhdCB0aGUgVXR0ZXJhbmNlIGNhbiBvbmx5IGJlXG4gKiBhbm5vdW5jZWQgaWYgdGhlIE5vZGUgaXMgdmlzaWJsZSBhbmQgdm9pY2luZ1Zpc2libGUuIFRoaXMgaXMgTE9DQUwgdmlzaWJpbGl0eSBhbmQgZG9lcyBub3QgY2FyZSBhYm91dCBhbmNlc3RvcnMuXG4gKiBUaGlzIHNob3VsZCByYXJlbHkgYmUgdXNlZCwgaW4gZ2VuZXJhbCB5b3Ugc2hvdWxkIGJlIHJlZ2lzdGVyaW5nIGFuIFV0dGVyYW5jZSB0byBhIFZvaWNpbmdOb2RlIGFuZCBpdHNcbiAqIHZvaWNpbmdDYW5TcGVha1Byb3BlcnR5LlxuICogQHN0YXRpY1xuICovXG5Wb2ljaW5nLnJlZ2lzdGVyVXR0ZXJhbmNlVG9Ob2RlID0gKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSwgbm9kZTogTm9kZSApID0+IHtcbiAgY29uc3QgZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMgPSB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcztcbiAgaWYgKCAhZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMuaW5jbHVkZXMoIG5vZGUudmlzaWJsZVByb3BlcnR5ICkgKSB7XG4gICAgdXR0ZXJhbmNlLnZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMgPSB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcy5jb25jYXQoIFsgbm9kZS52aXNpYmxlUHJvcGVydHkgXSApO1xuICB9XG4gIGlmICggIWV4aXN0aW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzLmluY2x1ZGVzKCBub2RlLnZvaWNpbmdWaXNpYmxlUHJvcGVydHkgKSApIHtcbiAgICB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcyA9IHV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzLmNvbmNhdCggWyBub2RlLnZvaWNpbmdWaXNpYmxlUHJvcGVydHkgXSApO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhIE5vZGUncyB2b2ljaW5nVmlzaWJsZVByb3BlcnR5IGFuZCB2aXNpYmxlUHJvcGVydHkgZnJvbSB0aGUgdm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcyBvZiB0aGUgVXR0ZXJhbmNlLlxuICogQHN0YXRpY1xuICovXG5Wb2ljaW5nLnVucmVnaXN0ZXJVdHRlcmFuY2VUb05vZGUgPSAoIHV0dGVyYW5jZTogVXR0ZXJhbmNlLCBub2RlOiBOb2RlICkgPT4ge1xuICBjb25zdCBleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcyA9IHV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcy5pbmNsdWRlcyggbm9kZS52aXNpYmxlUHJvcGVydHkgKSAmJiBleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcy5pbmNsdWRlcyggbm9kZS52b2ljaW5nVmlzaWJsZVByb3BlcnR5ICksXG4gICAgJ3Zpc2libGVQcm9wZXJ0eSBhbmQgdm9pY2luZ1Zpc2libGVQcm9wZXJ0eSB3ZXJlIG5vdCBvbiB0aGUgVXR0ZXJhbmNlLCB3YXMgaXQgbm90IHJlZ2lzdGVyZWQgdG8gdGhlIG5vZGU/JyApO1xuXG4gIGNvbnN0IHZpc2libGVQcm9wZXJ0eUluZGV4ID0gZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMuaW5kZXhPZiggbm9kZS52aXNpYmxlUHJvcGVydHkgKTtcbiAgY29uc3Qgd2l0aG91dFZpc2libGVQcm9wZXJ0eSA9IGV4aXN0aW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzLnNwbGljZSggdmlzaWJsZVByb3BlcnR5SW5kZXgsIDEgKTtcblxuICBjb25zdCB2b2ljaW5nVmlzaWJsZVByb3BlcnR5SW5kZXggPSB3aXRob3V0VmlzaWJsZVByb3BlcnR5LmluZGV4T2YoIG5vZGUudm9pY2luZ1Zpc2libGVQcm9wZXJ0eSApO1xuICBjb25zdCB3aXRob3V0Qm90aFByb3BlcnRpZXMgPSBleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcy5zcGxpY2UoIHZvaWNpbmdWaXNpYmxlUHJvcGVydHlJbmRleCwgMSApO1xuXG4gIHV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzID0gd2l0aG91dEJvdGhQcm9wZXJ0aWVzO1xufTtcblxuZXhwb3J0IHR5cGUgVm9pY2luZ05vZGUgPSBOb2RlICYgVFZvaWNpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ZvaWNpbmcoIHNvbWV0aGluZzogSW50ZW50aW9uYWxBbnkgKTogc29tZXRoaW5nIGlzIFZvaWNpbmdOb2RlIHtcbiAgcmV0dXJuIHNvbWV0aGluZyBpbnN0YW5jZW9mIE5vZGUgJiYgKCBzb21ldGhpbmcgYXMgVm9pY2luZ05vZGUgKS5faXNWb2ljaW5nO1xufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnVm9pY2luZycsIFZvaWNpbmcgKTtcbmV4cG9ydCBkZWZhdWx0IFZvaWNpbmc7Il0sIm5hbWVzIjpbIlRpbnlQcm9wZXJ0eSIsImluaGVyaXRhbmNlIiwiY29tYmluZU9wdGlvbnMiLCJUYW5kZW0iLCJyZXNwb25zZUNvbGxlY3RvciIsIlJlc3BvbnNlUGFja2V0IiwiVXR0ZXJhbmNlIiwiRGVsYXllZE11dGF0ZSIsIkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIiwiTm9kZSIsInNjZW5lcnkiLCJ2b2ljaW5nVXR0ZXJhbmNlUXVldWUiLCJhc3NlcnRVdHRlcmFuY2UiLCJ1dHRlcmFuY2UiLCJFcnJvciIsIk93bmVkVm9pY2luZ1V0dGVyYW5jZSIsInByb3ZpZGVkT3B0aW9ucyIsIlZPSUNJTkdfT1BUSU9OX0tFWVMiLCJWb2ljaW5nIiwiVHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsIlZvaWNpbmdDbGFzcyIsImluaXRpYWxpemUiLCJhcmdzIiwiX3ZvaWNpbmdDYW5TcGVha1Byb3BlcnR5IiwiX3ZvaWNpbmdSZXNwb25zZVBhY2tldCIsIl92b2ljaW5nRm9jdXNMaXN0ZW5lciIsImRlZmF1bHRGb2N1c0xpc3RlbmVyIiwic2V0Vm9pY2luZ1V0dGVyYW5jZSIsIl92b2ljaW5nQ2FuU3BlYWtDb3VudCIsIl9ib3VuZEluc3RhbmNlc0NoYW5nZWRMaXN0ZW5lciIsImFkZE9yUmVtb3ZlSW5zdGFuY2VMaXN0ZW5lcnMiLCJiaW5kIiwiY2hhbmdlZEluc3RhbmNlRW1pdHRlciIsImFkZExpc3RlbmVyIiwiX3NwZWFrQ29udGVudE9uRm9jdXNMaXN0ZW5lciIsImZvY3VzIiwiZXZlbnQiLCJhZGRJbnB1dExpc3RlbmVyIiwidm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlIiwib3B0aW9ucyIsImhhc093blByb3BlcnR5IiwibmFtZVJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJjb250ZXh0UmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJjb2xsZWN0QW5kU3BlYWtSZXNwb25zZSIsInZvaWNpbmdTcGVha1Jlc3BvbnNlIiwidm9pY2luZ1NwZWFrTmFtZVJlc3BvbnNlIiwidm9pY2luZ1NwZWFrT2JqZWN0UmVzcG9uc2UiLCJ2b2ljaW5nU3BlYWtDb250ZXh0UmVzcG9uc2UiLCJ2b2ljaW5nU3BlYWtIaW50UmVzcG9uc2UiLCJzcGVha0NvbnRlbnQiLCJjb2xsZWN0UmVzcG9uc2UiLCJpZ25vcmVQcm9wZXJ0aWVzIiwicmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsInZvaWNpbmdVdHRlcmFuY2UiLCJyZXNwb25zZSIsImNvbGxlY3RSZXNwb25zZXMiLCJhbGVydCIsImNvbnRlbnQiLCJub3RQaGV0aW9BcmNoZXR5cGUiLCJQSEVUX0lPX0VOQUJMRUQiLCJpc0luc2lkZVBoZXRpb0FyY2hldHlwZSIsImFkZFRvQmFjayIsInNldFZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ2b2ljaW5nTmFtZVJlc3BvbnNlIiwiZ2V0Vm9pY2luZ05hbWVSZXNwb25zZSIsInNldFZvaWNpbmdPYmplY3RSZXNwb25zZSIsInZvaWNpbmdPYmplY3RSZXNwb25zZSIsImdldFZvaWNpbmdPYmplY3RSZXNwb25zZSIsInNldFZvaWNpbmdDb250ZXh0UmVzcG9uc2UiLCJ2b2ljaW5nQ29udGV4dFJlc3BvbnNlIiwiZ2V0Vm9pY2luZ0NvbnRleHRSZXNwb25zZSIsInNldFZvaWNpbmdIaW50UmVzcG9uc2UiLCJ2b2ljaW5nSGludFJlc3BvbnNlIiwiZ2V0Vm9pY2luZ0hpbnRSZXNwb25zZSIsInNldFZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXMiLCJ2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzIiwiZ2V0Vm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcyIsInNldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIiwicGF0dGVybnMiLCJ2b2ljaW5nUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsImdldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIiwiX3ZvaWNpbmdVdHRlcmFuY2UiLCJjbGVhblZvaWNpbmdVdHRlcmFuY2UiLCJyZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUiLCJnZXRWb2ljaW5nVXR0ZXJhbmNlIiwic2V0Vm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJmb2N1c0xpc3RlbmVyIiwidm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJnZXRWb2ljaW5nRm9jdXNMaXN0ZW5lciIsIl9pc1ZvaWNpbmciLCJkaXNwb3NlIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwiY2xlYW4iLCJvbkluc3RhbmNlQ2FuVm9pY2VDaGFuZ2UiLCJjYW5TcGVhayIsImluc3RhbmNlcyIsImxlbmd0aCIsInZhbHVlIiwiaGFuZGxlSW5zdGFuY2VzQ2hhbmdlZCIsImluc3RhbmNlIiwiYWRkZWQiLCJpc1Zpc2libGUiLCJ2aXNpYmxlIiwidm9pY2luZ1Zpc2libGUiLCJjYW5Wb2ljZUVtaXR0ZXIiLCJfYm91bmRJbnN0YW5jZUNhblZvaWNlQ2hhbmdlTGlzdGVuZXIiLCJpc0Rpc3Bvc2VkIiwidW5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUiLCJtdXRhdGUiLCJwcm90b3R5cGUiLCJjYWxsIiwiX211dGF0b3JLZXlzIiwiY29uY2F0IiwidW5pcSIsImFsZXJ0VXR0ZXJhbmNlIiwidm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcyIsInZvaWNpbmdOb2RlIiwiZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMiLCJ2b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eSIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInJlZ2lzdGVyVXR0ZXJhbmNlVG9Ob2RlIiwibm9kZSIsInZpc2libGVQcm9wZXJ0eSIsInZvaWNpbmdWaXNpYmxlUHJvcGVydHkiLCJ1bnJlZ2lzdGVyVXR0ZXJhbmNlVG9Ob2RlIiwidmlzaWJsZVByb3BlcnR5SW5kZXgiLCJ3aXRob3V0VmlzaWJsZVByb3BlcnR5Iiwidm9pY2luZ1Zpc2libGVQcm9wZXJ0eUluZGV4Iiwid2l0aG91dEJvdGhQcm9wZXJ0aWVzIiwiaXNWb2ljaW5nIiwic29tZXRoaW5nIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXNCQyxHQUVELE9BQU9BLGtCQUFrQixzQ0FBc0M7QUFDL0QsT0FBT0MsaUJBQWlCLDBDQUEwQztBQUNsRSxTQUFTQyxjQUFjLFFBQVEsd0NBQXdDO0FBR3ZFLE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLHVCQUF1QixzREFBc0Q7QUFDcEYsT0FBT0Msb0JBQXFGLG1EQUFtRDtBQUUvSSxPQUFPQyxlQUFpRCw4Q0FBOEM7QUFDdEcsU0FBU0MsYUFBYSxFQUFZQyx1QkFBdUIsRUFBa0NDLElBQUksRUFBRUMsT0FBTyxFQUEyQkMscUJBQXFCLFFBQVEsbUJBQW1CO0FBR25MLCtDQUErQztBQUMvQyxTQUFTQyxnQkFBaUJDLFNBQTJCO0lBQ25ELElBQUssQ0FBR0EsQ0FBQUEscUJBQXFCUCxTQUFRLEdBQU07UUFDekMsTUFBTSxJQUFJUSxNQUFPO0lBQ25CO0FBQ0Y7QUFFQSxrSEFBa0g7QUFDbEgsd0JBQXdCO0FBQ3hCLElBQUEsQUFBTUMsd0JBQU4sTUFBTUEsOEJBQThCVDtJQUNsQyxZQUFvQlUsZUFBa0MsQ0FBRztRQUN2RCxLQUFLLENBQUVBO0lBQ1Q7QUFDRjtBQUVBLHFIQUFxSDtBQUNySCxNQUFNQyxzQkFBc0I7SUFDMUI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtDQUNEO0FBaUlELE1B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