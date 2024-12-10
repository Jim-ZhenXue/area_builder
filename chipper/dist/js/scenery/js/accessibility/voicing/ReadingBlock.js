// Copyright 2021-2024, University of Colorado Boulder
/**
 * A trait that extends Voicing, adding support for "Reading Blocks" of the voicing feature. "Reading Blocks" are
 * UI components in the application that have unique functionality with respect to Voicing.
 *
 *  - Reading Blocks are generally around graphical objects that are not otherwise interactive (like Text).
 *  - They have a unique focus highlight to indicate they can be clicked on to hear voiced content.
 *  - When activated with press or click readingBlockNameResponse is spoken.
 *  - ReadingBlock content is always spoken if the voicingManager is enabled, ignoring Properties of responseCollector.
 *  - While speaking, a yellow highlight will appear over the Node composed with ReadingBlock.
 *  - While voicing is enabled, reading blocks will be added to the focus order.
 *
 * This trait is to be composed with Nodes and assumes that the Node is composed with ParallelDOM.  It uses Node to
 * support mouse/touch input and ParallelDOM to support being added to the focus order and alternative input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import memoize from '../../../../phet-core/js/memoize.js';
import ResponsePatternCollection from '../../../../utterance-queue/js/ResponsePatternCollection.js';
import { DelayedMutate, Focus, Node, PDOMInstance, ReadingBlockHighlight, ReadingBlockUtterance, scenery, Voicing, voicingManager } from '../../imports.js';
const READING_BLOCK_OPTION_KEYS = [
    'readingBlockTagName',
    'readingBlockDisabledTagName',
    'readingBlockNameResponse',
    'readingBlockHintResponse',
    'readingBlockResponsePatternCollection',
    'readingBlockActiveHighlight'
];
// Use an assertion signature to narrow the type to ReadingBlockUtterance
function assertReadingBlockUtterance(utterance) {
    if (!(utterance instanceof ReadingBlockUtterance)) {
        assert && assert(false, 'utterance is not a ReadinBlockUtterance');
    }
}
// An implementation class for ReadingBlock.ts, only used in this class so that we know if we own the Utterance and can
// therefore dispose it.
let OwnedReadingBlockUtterance = class OwnedReadingBlockUtterance extends ReadingBlockUtterance {
    constructor(focus, providedOptions){
        super(focus, providedOptions);
    }
};
const DEFAULT_CONTENT_HINT_PATTERN = new ResponsePatternCollection({
    nameHint: '{{NAME}}. {{HINT}}'
});
const ReadingBlock = memoize((Type)=>{
    const ReadingBlockClass = DelayedMutate('ReadingBlock', READING_BLOCK_OPTION_KEYS, class ReadingBlockClass extends Voicing(Type) {
        /**
       * Whether a Node composes ReadingBlock.
       */ get _isReadingBlock() {
            return true;
        }
        /**
       * Set the tagName for the node composing ReadingBlock. This is the tagName (of ParallelDOM) that will be applied
       * to this Node when Reading Blocks are enabled.
       */ setReadingBlockTagName(tagName) {
            this._readingBlockTagName = tagName;
            this._onReadingBlockFocusableChanged(voicingManager.speechAllowedAndFullyEnabledProperty.value);
        }
        set readingBlockTagName(tagName) {
            this.setReadingBlockTagName(tagName);
        }
        get readingBlockTagName() {
            return this.getReadingBlockTagName();
        }
        /**
       * Get the tagName for this Node (of ParallelDOM) when Reading Blocks are enabled.
       */ getReadingBlockTagName() {
            return this._readingBlockTagName;
        }
        /**
       * Sets the tagName for the node composing ReadingBlock. This is the tagName (of ParallelDOM) that will be applied
       * to this Node when Reading Blocks are disabled. If you do not want the ReadingBlock to appear at all, set to null.
       */ setReadingBlockDisabledTagName(tagName) {
            this._readingBlockDisabledTagName = tagName;
            this._onReadingBlockFocusableChanged(voicingManager.speechAllowedAndFullyEnabledProperty.value);
        }
        set readingBlockDisabledTagName(tagName) {
            this.setReadingBlockDisabledTagName(tagName);
        }
        get readingBlockDisabledTagName() {
            return this.getReadingBlockDisabledTagName();
        }
        getReadingBlockDisabledTagName() {
            return this._readingBlockDisabledTagName;
        }
        /**
       * Sets the content that should be read whenever the ReadingBlock receives input that initiates speech.
       */ setReadingBlockNameResponse(content) {
            this._voicingResponsePacket.nameResponse = content;
        }
        set readingBlockNameResponse(content) {
            this.setReadingBlockNameResponse(content);
        }
        get readingBlockNameResponse() {
            return this.getReadingBlockNameResponse();
        }
        /**
       * Gets the content that is spoken whenever the ReadingBLock receives input that would initiate speech.
       */ getReadingBlockNameResponse() {
            return this._voicingResponsePacket.nameResponse;
        }
        /**
       * Sets the hint response for this ReadingBlock. This is only spoken if "Helpful Hints" are enabled by the user.
       */ setReadingBlockHintResponse(content) {
            this._voicingResponsePacket.hintResponse = content;
        }
        set readingBlockHintResponse(content) {
            this.setReadingBlockHintResponse(content);
        }
        get readingBlockHintResponse() {
            return this.getReadingBlockHintResponse();
        }
        /**
       * Get the hint response for this ReadingBlock. This is additional content that is only read if "Helpful Hints"
       * are enabled.
       */ getReadingBlockHintResponse() {
            return this._voicingResponsePacket.hintResponse;
        }
        /**
       * Sets the collection of patterns to use for voicing responses, controlling the order, punctuation, and
       * additional content for each combination of response. See ResponsePatternCollection.js if you wish to use
       * a collection of string patterns that are not the default.
       */ setReadingBlockResponsePatternCollection(patterns) {
            this._voicingResponsePacket.responsePatternCollection = patterns;
        }
        set readingBlockResponsePatternCollection(patterns) {
            this.setReadingBlockResponsePatternCollection(patterns);
        }
        get readingBlockResponsePatternCollection() {
            return this.getReadingBlockResponsePatternCollection();
        }
        /**
       * Get the ResponsePatternCollection object that this ReadingBlock Node is using to collect responses.
       */ getReadingBlockResponsePatternCollection() {
            return this._voicingResponsePacket.responsePatternCollection;
        }
        /**
       * ReadingBlock must take a ReadingBlockUtterance for its voicingUtterance. You generally shouldn't be using this.
       * But if you must, you are responsible for setting the ReadingBlockUtterance.readingBlockFocus when this
       * ReadingBlock is activated so that it gets highlighted correctly. See how the default readingBlockFocus is set.
       */ setVoicingUtterance(utterance) {
            super.setVoicingUtterance(utterance);
        }
        set voicingUtterance(utterance) {
            super.voicingUtterance = utterance;
        }
        get voicingUtterance() {
            return this.getVoicingUtterance();
        }
        getVoicingUtterance() {
            const utterance = super.getVoicingUtterance();
            assertReadingBlockUtterance(utterance);
            return utterance;
        }
        setVoicingNameResponse() {
            assert && assert(false, 'ReadingBlocks only support setting the name response via readingBlockNameResponse');
        }
        getVoicingNameResponse() {
            assert && assert(false, 'ReadingBlocks only support getting the name response via readingBlockNameResponse');
        }
        setVoicingObjectResponse() {
            assert && assert(false, 'ReadingBlocks do not support setting object response');
        }
        getVoicingObjectResponse() {
            assert && assert(false, 'ReadingBlocks do not support setting object response');
        }
        setVoicingContextResponse() {
            assert && assert(false, 'ReadingBlocks do not support setting context response');
        }
        getVoicingContextResponse() {
            assert && assert(false, 'ReadingBlocks do not support setting context response');
        }
        setVoicingHintResponse() {
            assert && assert(false, 'ReadingBlocks only support setting the hint response via readingBlockHintResponse.');
        }
        getVoicingHintResponse() {
            assert && assert(false, 'ReadingBlocks only support getting the hint response via readingBlockHintResponse.');
        }
        setVoicingResponsePatternCollection() {
            assert && assert(false, 'ReadingBlocks only support setting the response patterns via readingBlockResponsePatternCollection.');
        }
        getVoicingResponsePatternCollection() {
            assert && assert(false, 'ReadingBlocks only support getting the response patterns via readingBlockResponsePatternCollection.');
        }
        /**
       * Sets the highlight used to surround this Node while the Voicing framework is speaking this content.
       * If a Node is provided, do not add this Node to the scene graph, it is added and made visible by the HighlightOverlay.
       */ setReadingBlockActiveHighlight(readingBlockActiveHighlight) {
            if (this._readingBlockActiveHighlight !== readingBlockActiveHighlight) {
                this._readingBlockActiveHighlight = readingBlockActiveHighlight;
                this.readingBlockActiveHighlightChangedEmitter.emit();
            }
        }
        set readingBlockActiveHighlight(readingBlockActiveHighlight) {
            this.setReadingBlockActiveHighlight(readingBlockActiveHighlight);
        }
        get readingBlockActiveHighlight() {
            return this._readingBlockActiveHighlight;
        }
        /**
       * Returns the highlight used to surround this Node when the Voicing framework is reading its
       * content.
       */ getReadingBlockActiveHighlight() {
            return this._readingBlockActiveHighlight;
        }
        /**
       * Returns true if this ReadingBlock is "activated", indicating that it has received interaction
       * and the Voicing framework is speaking its content.
       */ isReadingBlockActivated() {
            let activated = false;
            const trailIds = Object.keys(this.displays);
            for(let i = 0; i < trailIds.length; i++){
                const pointerFocus = this.displays[trailIds[i]].focusManager.readingBlockFocusProperty.value;
                if (pointerFocus && pointerFocus.trail.lastNode() === this) {
                    activated = true;
                    break;
                }
            }
            return activated;
        }
        get readingBlockActivated() {
            return this.isReadingBlockActivated();
        }
        /**
       * When this Node becomes focusable (because Reading Blocks have just been enabled or disabled), either
       * apply or remove the readingBlockTagName.
       *
       * @param focusable - whether ReadingBlocks should be focusable
       */ _onReadingBlockFocusableChanged(focusable) {
            this.focusable = focusable;
            if (focusable) {
                this.tagName = this._readingBlockTagName;
                // don't add the input listener if we are already active, we may just be updating the tagName in this case
                if (!this.hasInputListener(this._readingBlockInputListener)) {
                    this.addInputListener(this._readingBlockInputListener);
                }
            } else {
                this.tagName = this._readingBlockDisabledTagName;
                if (this.hasInputListener(this._readingBlockInputListener)) {
                    this.removeInputListener(this._readingBlockInputListener);
                }
            }
        }
        /**
       * Update the hit areas for this Node whenever the bounds change.
       */ _onLocalBoundsChanged(localBounds) {
            this.mouseArea = localBounds;
            this.touchArea = localBounds;
        }
        /**
       * Speak the content associated with the ReadingBlock. Sets the readingBlockFocusProperties on
       * the displays so that HighlightOverlays know to activate a highlight while the voicingManager
       * is reading about this Node.
       */ _speakReadingBlockContentListener(event) {
            const displays = this.getConnectedDisplays();
            const readingBlockUtterance = this.voicingUtterance;
            const content = this.collectResponse({
                nameResponse: this.getReadingBlockNameResponse(),
                hintResponse: this.getReadingBlockHintResponse(),
                ignoreProperties: this.voicingIgnoreVoicingManagerProperties,
                responsePatternCollection: this._voicingResponsePacket.responsePatternCollection,
                utterance: readingBlockUtterance
            });
            if (content) {
                for(let i = 0; i < displays.length; i++){
                    if (!this.getDescendantsUseHighlighting(event.trail)) {
                        // the SceneryEvent might have gone through a descendant of this Node
                        const rootToSelf = event.trail.subtrailTo(this);
                        // the trail to a Node may be discontinuous for PDOM events due to pdomOrder,
                        // this finds the actual visual trail to use
                        const visualTrail = PDOMInstance.guessVisualTrail(rootToSelf, displays[i].rootNode);
                        const focus = new Focus(displays[i], visualTrail);
                        readingBlockUtterance.readingBlockFocus = focus;
                        this.speakContent(content);
                    }
                }
            }
        }
        /**
       * If we created and own the voicingUtterance we can fully dispose of it.
       * @mixin-protected - made public for use in the mixin only
       */ cleanVoicingUtterance() {
            if (this._voicingUtterance instanceof OwnedReadingBlockUtterance) {
                this._voicingUtterance.dispose();
            }
            super.cleanVoicingUtterance();
        }
        dispose() {
            voicingManager.speechAllowedAndFullyEnabledProperty.unlink(this._readingBlockFocusableChangeListener);
            this.localBoundsProperty.unlink(this._localBoundsChangedListener);
            // remove the input listener that activates the ReadingBlock, only do this if the listener is attached while
            // the ReadingBlock is enabled
            if (this.hasInputListener(this._readingBlockInputListener)) {
                this.removeInputListener(this._readingBlockInputListener);
            }
            super.dispose();
        }
        mutate(options) {
            return super.mutate(options);
        }
        constructor(...args){
            super(...args);
            this._readingBlockTagName = 'button';
            this._readingBlockDisabledTagName = 'p';
            this._readingBlockActiveHighlight = null;
            this.readingBlockActiveHighlightChangedEmitter = new TinyEmitter();
            this.readingBlockResponsePatternCollection = DEFAULT_CONTENT_HINT_PATTERN;
            this._localBoundsChangedListener = this._onLocalBoundsChanged.bind(this);
            this.localBoundsProperty.link(this._localBoundsChangedListener);
            this._readingBlockInputListener = {
                focus: (event)=>this._speakReadingBlockContentListener(event),
                up: (event)=>this._speakReadingBlockContentListener(event),
                click: (event)=>this._speakReadingBlockContentListener(event)
            };
            this._readingBlockFocusableChangeListener = this._onReadingBlockFocusableChanged.bind(this);
            voicingManager.speechAllowedAndFullyEnabledProperty.link(this._readingBlockFocusableChangeListener);
            // All ReadingBlocks have a ReadingBlockHighlight, a focus highlight that is black to indicate it has
            // a different behavior.
            this.focusHighlight = new ReadingBlockHighlight(this);
            // All ReadingBlocks use a ReadingBlockUtterance with Focus and Trail data to this Node so that it can be
            // highlighted in the FocusOverlay when this Utterance is being announced.
            this.voicingUtterance = new OwnedReadingBlockUtterance(null);
        }
    });
    /**
   * {Array.<string>} - String keys for all the allowed options that will be set by Node.mutate( options ), in
   * the order they will be evaluated.
   *
   * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
   *       cases that may apply.
   */ ReadingBlockClass.prototype._mutatorKeys = READING_BLOCK_OPTION_KEYS.concat(ReadingBlockClass.prototype._mutatorKeys);
    assert && assert(ReadingBlockClass.prototype._mutatorKeys.length === _.uniq(ReadingBlockClass.prototype._mutatorKeys).length, 'x mutator keys in ReadingBlock');
    return ReadingBlockClass;
});
export function isReadingBlock(something) {
    return something instanceof Node && something._isReadingBlock;
}
scenery.register('ReadingBlock', ReadingBlock);
export default ReadingBlock;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS92b2ljaW5nL1JlYWRpbmdCbG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHRyYWl0IHRoYXQgZXh0ZW5kcyBWb2ljaW5nLCBhZGRpbmcgc3VwcG9ydCBmb3IgXCJSZWFkaW5nIEJsb2Nrc1wiIG9mIHRoZSB2b2ljaW5nIGZlYXR1cmUuIFwiUmVhZGluZyBCbG9ja3NcIiBhcmVcbiAqIFVJIGNvbXBvbmVudHMgaW4gdGhlIGFwcGxpY2F0aW9uIHRoYXQgaGF2ZSB1bmlxdWUgZnVuY3Rpb25hbGl0eSB3aXRoIHJlc3BlY3QgdG8gVm9pY2luZy5cbiAqXG4gKiAgLSBSZWFkaW5nIEJsb2NrcyBhcmUgZ2VuZXJhbGx5IGFyb3VuZCBncmFwaGljYWwgb2JqZWN0cyB0aGF0IGFyZSBub3Qgb3RoZXJ3aXNlIGludGVyYWN0aXZlIChsaWtlIFRleHQpLlxuICogIC0gVGhleSBoYXZlIGEgdW5pcXVlIGZvY3VzIGhpZ2hsaWdodCB0byBpbmRpY2F0ZSB0aGV5IGNhbiBiZSBjbGlja2VkIG9uIHRvIGhlYXIgdm9pY2VkIGNvbnRlbnQuXG4gKiAgLSBXaGVuIGFjdGl2YXRlZCB3aXRoIHByZXNzIG9yIGNsaWNrIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSBpcyBzcG9rZW4uXG4gKiAgLSBSZWFkaW5nQmxvY2sgY29udGVudCBpcyBhbHdheXMgc3Bva2VuIGlmIHRoZSB2b2ljaW5nTWFuYWdlciBpcyBlbmFibGVkLCBpZ25vcmluZyBQcm9wZXJ0aWVzIG9mIHJlc3BvbnNlQ29sbGVjdG9yLlxuICogIC0gV2hpbGUgc3BlYWtpbmcsIGEgeWVsbG93IGhpZ2hsaWdodCB3aWxsIGFwcGVhciBvdmVyIHRoZSBOb2RlIGNvbXBvc2VkIHdpdGggUmVhZGluZ0Jsb2NrLlxuICogIC0gV2hpbGUgdm9pY2luZyBpcyBlbmFibGVkLCByZWFkaW5nIGJsb2NrcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBmb2N1cyBvcmRlci5cbiAqXG4gKiBUaGlzIHRyYWl0IGlzIHRvIGJlIGNvbXBvc2VkIHdpdGggTm9kZXMgYW5kIGFzc3VtZXMgdGhhdCB0aGUgTm9kZSBpcyBjb21wb3NlZCB3aXRoIFBhcmFsbGVsRE9NLiAgSXQgdXNlcyBOb2RlIHRvXG4gKiBzdXBwb3J0IG1vdXNlL3RvdWNoIGlucHV0IGFuZCBQYXJhbGxlbERPTSB0byBzdXBwb3J0IGJlaW5nIGFkZGVkIHRvIHRoZSBmb2N1cyBvcmRlciBhbmQgYWx0ZXJuYXRpdmUgaW5wdXQuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9Db25zdHJ1Y3Rvci5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IFJlc29sdmVkUmVzcG9uc2UsIFZvaWNpbmdSZXNwb25zZSB9IGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9SZXNwb25zZVBhY2tldC5qcyc7XG5pbXBvcnQgUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xuaW1wb3J0IHsgRGVsYXllZE11dGF0ZSwgRm9jdXMsIEhpZ2hsaWdodCwgTm9kZSwgUERPTUluc3RhbmNlLCBSZWFkaW5nQmxvY2tIaWdobGlnaHQsIFJlYWRpbmdCbG9ja1V0dGVyYW5jZSwgUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlT3B0aW9ucywgc2NlbmVyeSwgU2NlbmVyeUV2ZW50LCBWb2ljaW5nLCB2b2ljaW5nTWFuYWdlciwgVm9pY2luZ09wdGlvbnMgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcbmltcG9ydCBUSW5wdXRMaXN0ZW5lciBmcm9tICcuLi8uLi9pbnB1dC9USW5wdXRMaXN0ZW5lci5qcyc7XG5pbXBvcnQgeyBUVm9pY2luZyB9IGZyb20gJy4vVm9pY2luZy5qcyc7XG5cbmNvbnN0IFJFQURJTkdfQkxPQ0tfT1BUSU9OX0tFWVMgPSBbXG4gICdyZWFkaW5nQmxvY2tUYWdOYW1lJyxcbiAgJ3JlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZScsXG4gICdyZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UnLFxuICAncmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlJyxcbiAgJ3JlYWRpbmdCbG9ja1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24nLFxuICAncmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0J1xuXTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgcmVhZGluZ0Jsb2NrVGFnTmFtZT86IHN0cmluZyB8IG51bGw7XG4gIHJlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZT86IHN0cmluZyB8IG51bGw7XG4gIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcbiAgcmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlPzogVm9pY2luZ1Jlc3BvbnNlO1xuICByZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uPzogUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbjtcbiAgcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0PzogbnVsbCB8IFNoYXBlIHwgTm9kZTtcbn07XG5cbnR5cGUgVW5zdXBwb3J0ZWRWb2ljaW5nT3B0aW9ucyA9XG4gICd2b2ljaW5nTmFtZVJlc3BvbnNlJyB8XG4gICd2b2ljaW5nT2JqZWN0UmVzcG9uc2UnIHxcbiAgJ3ZvaWNpbmdDb250ZXh0UmVzcG9uc2UnIHxcbiAgJ3ZvaWNpbmdIaW50UmVzcG9uc2UnIHxcbiAgJ3ZvaWNpbmdVdHRlcmFuY2UnIHxcbiAgJ3ZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uJztcblxuZXhwb3J0IHR5cGUgUmVhZGluZ0Jsb2NrT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcbiAgU3RyaWN0T21pdDxWb2ljaW5nT3B0aW9ucywgVW5zdXBwb3J0ZWRWb2ljaW5nT3B0aW9ucz47XG5cbi8vIFVzZSBhbiBhc3NlcnRpb24gc2lnbmF0dXJlIHRvIG5hcnJvdyB0aGUgdHlwZSB0byBSZWFkaW5nQmxvY2tVdHRlcmFuY2VcbmZ1bmN0aW9uIGFzc2VydFJlYWRpbmdCbG9ja1V0dGVyYW5jZSggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogYXNzZXJ0cyB1dHRlcmFuY2UgaXMgUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlIHtcbiAgaWYgKCAhKCB1dHRlcmFuY2UgaW5zdGFuY2VvZiBSZWFkaW5nQmxvY2tVdHRlcmFuY2UgKSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ3V0dGVyYW5jZSBpcyBub3QgYSBSZWFkaW5CbG9ja1V0dGVyYW5jZScgKTtcbiAgfVxufVxuXG4vLyBBbiBpbXBsZW1lbnRhdGlvbiBjbGFzcyBmb3IgUmVhZGluZ0Jsb2NrLnRzLCBvbmx5IHVzZWQgaW4gdGhpcyBjbGFzcyBzbyB0aGF0IHdlIGtub3cgaWYgd2Ugb3duIHRoZSBVdHRlcmFuY2UgYW5kIGNhblxuLy8gdGhlcmVmb3JlIGRpc3Bvc2UgaXQuXG5jbGFzcyBPd25lZFJlYWRpbmdCbG9ja1V0dGVyYW5jZSBleHRlbmRzIFJlYWRpbmdCbG9ja1V0dGVyYW5jZSB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZm9jdXM6IEZvY3VzIHwgbnVsbCwgcHJvdmlkZWRPcHRpb25zPzogUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlT3B0aW9ucyApIHtcbiAgICBzdXBlciggZm9jdXMsIHByb3ZpZGVkT3B0aW9ucyApO1xuICB9XG59XG5cblxuY29uc3QgREVGQVVMVF9DT05URU5UX0hJTlRfUEFUVEVSTiA9IG5ldyBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCB7XG4gIG5hbWVIaW50OiAne3tOQU1FfX0uIHt7SElOVH19J1xufSApO1xuXG5leHBvcnQgdHlwZSBUUmVhZGluZ0Jsb2NrPFN1cGVyVHlwZSBleHRlbmRzIE5vZGUgPSBOb2RlPiA9IHtcbiAgcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyO1xuXG4gIC8vIFByZWZlciBleHBvcnRlZCBmdW5jdGlvbiBpc1JlYWRpbmdCbG9jaygpIGZvciBiZXR0ZXIgVHlwZVNjcmlwdCBzdXBwb3J0XG4gIGdldCBfaXNSZWFkaW5nQmxvY2soKTogdHJ1ZTtcbiAgc2V0UmVhZGluZ0Jsb2NrVGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkO1xuICByZWFkaW5nQmxvY2tUYWdOYW1lOiBzdHJpbmcgfCBudWxsO1xuICBnZXRSZWFkaW5nQmxvY2tUYWdOYW1lKCk6IHN0cmluZyB8IG51bGw7XG4gIHNldFJlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkO1xuICByZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWU6IHN0cmluZyB8IG51bGw7XG4gIGdldFJlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZSgpOiBzdHJpbmcgfCBudWxsO1xuICBzZXRSZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UoIGNvbnRlbnQ6IFZvaWNpbmdSZXNwb25zZSApOiB2b2lkO1xuICBzZXQgcmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlKCBjb250ZW50OiBWb2ljaW5nUmVzcG9uc2UgKTtcbiAgZ2V0IHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlO1xuICBnZXRSZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZTtcbiAgc2V0UmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlKCBjb250ZW50OiBWb2ljaW5nUmVzcG9uc2UgKTogdm9pZDtcbiAgc2V0IHJlYWRpbmdCbG9ja0hpbnRSZXNwb25zZSggY29udGVudDogVm9pY2luZ1Jlc3BvbnNlICk7XG4gIGdldCByZWFkaW5nQmxvY2tIaW50UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZTtcbiAgZ2V0UmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2U7XG4gIHNldFJlYWRpbmdCbG9ja1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24oIHBhdHRlcm5zOiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uICk6IHZvaWQ7XG4gIHJlYWRpbmdCbG9ja1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb246IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb247XG4gIGdldFJlYWRpbmdCbG9ja1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24oKTogUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbjtcbiAgc2V0UmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0KCByZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQ6IEhpZ2hsaWdodCApOiB2b2lkO1xuICByZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQ6IEhpZ2hsaWdodDtcbiAgZ2V0UmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0KCk6IEhpZ2hsaWdodDtcbiAgaXNSZWFkaW5nQmxvY2tBY3RpdmF0ZWQoKTogYm9vbGVhbjtcbiAgZ2V0IHJlYWRpbmdCbG9ja0FjdGl2YXRlZCgpOiBib29sZWFuO1xufSAmIFRWb2ljaW5nPFN1cGVyVHlwZT47XG5cbmNvbnN0IFJlYWRpbmdCbG9jayA9IG1lbW9pemUoIDxTdXBlclR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3RvcjxOb2RlPj4oIFR5cGU6IFN1cGVyVHlwZSApOiBTdXBlclR5cGUgJiBDb25zdHJ1Y3RvcjxUUmVhZGluZ0Jsb2NrPEluc3RhbmNlVHlwZTxTdXBlclR5cGU+Pj4gPT4ge1xuXG4gIGNvbnN0IFJlYWRpbmdCbG9ja0NsYXNzID0gRGVsYXllZE11dGF0ZSggJ1JlYWRpbmdCbG9jaycsIFJFQURJTkdfQkxPQ0tfT1BUSU9OX0tFWVMsXG4gICAgY2xhc3MgUmVhZGluZ0Jsb2NrQ2xhc3MgZXh0ZW5kcyBWb2ljaW5nKCBUeXBlICkgaW1wbGVtZW50cyBUUmVhZGluZ0Jsb2NrPEluc3RhbmNlVHlwZTxTdXBlclR5cGU+PiB7XG5cbiAgICAgIC8vIFRoZSB0YWdOYW1lIHVzZWQgZm9yIHRoZSBSZWFkaW5nQmxvY2sgd2hlbiBcIlZvaWNpbmdcIiBpcyBlbmFibGVkLCBkZWZhdWx0XG4gICAgICAvLyBvZiBidXR0b24gc28gdGhhdCBpdCBpcyBhZGRlZCB0byB0aGUgZm9jdXMgb3JkZXIgYW5kIGNhbiByZWNlaXZlICdjbGljaycgZXZlbnRzLiBZb3UgbWF5IHdpc2ggdG8gc2V0IHRoaXNcbiAgICAgIC8vIHRvIHNvbWUgb3RoZXIgdGFnTmFtZSBvciBzZXQgdG8gbnVsbCB0byByZW1vdmUgdGhlIFJlYWRpbmdCbG9jayBmcm9tIHRoZSBmb2N1cyBvcmRlci4gSWYgdGhpcyBpcyBjaGFuZ2VkLFxuICAgICAgLy8gYmUgc3VyZSB0aGF0IHRoZSBSZWFkaW5nQmxvY2sgd2lsbCBzdGlsbCByZXNwb25kIHRvIGBjbGlja2AgZXZlbnRzIHdoZW4gZW5hYmxlZC5cbiAgICAgIHByaXZhdGUgX3JlYWRpbmdCbG9ja1RhZ05hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgICAgIC8vIFRoZSB0YWdOYW1lIHRvIGFwcGx5IHRvIHRoZSBOb2RlIHdoZW4gdm9pY2luZyBpcyBkaXNhYmxlZC4gU2V0IHRvIG51bGwgdG8gcmVtb3ZlIGZyb20gdGhlIFBET01cbiAgICAgIC8vIGVudGlyZWx5IHdoZW4gdm9pY2luZyBpcyBkaXNhYmxlZC5cbiAgICAgIHByaXZhdGUgX3JlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZTogc3RyaW5nIHwgbnVsbDtcblxuICAgICAgLy8gVGhlIGhpZ2hsaWdodCB0aGF0IHN1cnJvdW5kcyB0aGlzIFJlYWRpbmdCbG9jayB3aGVuIGl0IGlzIFwiYWN0aXZlXCIgYW5kXG4gICAgICAvLyB0aGUgVm9pY2luZyBmcmFtZXdvcmsgaXMgc3BlYWtpbmcgdGhlIGNvbnRlbnQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgTm9kZS4gQnkgZGVmYXVsdCwgYSBzZW1pLXRyYW5zcGFyZW50XG4gICAgICAvLyB5ZWxsb3cgaGlnaGxpZ2h0IHN1cnJvdW5kcyB0aGlzIE5vZGUncyBib3VuZHMuXG4gICAgICBwcml2YXRlIF9yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQ6IEhpZ2hsaWdodDtcblxuICAgICAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIC0gU2VuZHMgYSBtZXNzYWdlIHdoZW4gdGhlIGhpZ2hsaWdodCBmb3IgdGhlIFJlYWRpbmdCbG9jayBjaGFuZ2VzLiBVc2VkXG4gICAgICAvLyBieSB0aGUgSGlnaGxpZ2h0T3ZlcmxheSB0byByZWRyYXcgaXQgaWYgaXQgY2hhbmdlcyB3aGlsZSB0aGUgaGlnaGxpZ2h0IGlzIGFjdGl2ZS5cbiAgICAgIHB1YmxpYyByZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlcjogVEVtaXR0ZXI7XG5cbiAgICAgIC8vIFVwZGF0ZXMgdGhlIGhpdCBib3VuZHMgb2YgdGhpcyBOb2RlIHdoZW4gdGhlIGxvY2FsIGJvdW5kcyBjaGFuZ2UuXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9sb2NhbEJvdW5kc0NoYW5nZWRMaXN0ZW5lcjogT21pdFRoaXNQYXJhbWV0ZXI8KCBsb2NhbEJvdW5kczogQm91bmRzMiApID0+IHZvaWQ+O1xuXG4gICAgICAvLyBUcmlnZ2VycyBhY3RpdmF0aW9uIG9mIHRoZSBSZWFkaW5nQmxvY2ssIHJlcXVlc3Rpbmcgc3BlZWNoIG9mIGl0cyBjb250ZW50LlxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lcjogVElucHV0TGlzdGVuZXI7XG5cbiAgICAgIC8vIENvbnRyb2xzIHdoZXRoZXIgdGhlIFJlYWRpbmdCbG9jayBzaG91bGQgYmUgaW50ZXJhY3RpdmUgYW5kIGZvY3VzYWJsZS4gQXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nLCB0aGF0IGlzIHRydWVcbiAgICAgIC8vIGZvciBhbGwgUmVhZGluZ0Jsb2NrcyB3aGVuIHRoZSB2b2ljaW5nTWFuYWdlciBpcyBmdWxseSBlbmFibGVkIGFuZCBjYW4gc3BlYWsuXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9yZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VMaXN0ZW5lcjogT21pdFRoaXNQYXJhbWV0ZXI8KCBmb2N1c2FibGU6IGJvb2xlYW4gKSA9PiB2b2lkPjtcblxuICAgICAgcHVibGljIGNvbnN0cnVjdG9yKCAuLi5hcmdzOiBJbnRlbnRpb25hbEFueVtdICkge1xuICAgICAgICBzdXBlciggLi4uYXJncyApO1xuXG4gICAgICAgIHRoaXMuX3JlYWRpbmdCbG9ja1RhZ05hbWUgPSAnYnV0dG9uJztcbiAgICAgICAgdGhpcy5fcmVhZGluZ0Jsb2NrRGlzYWJsZWRUYWdOYW1lID0gJ3AnO1xuICAgICAgICB0aGlzLl9yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQgPSBudWxsO1xuICAgICAgICB0aGlzLnJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodENoYW5nZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XG4gICAgICAgIHRoaXMucmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiA9IERFRkFVTFRfQ09OVEVOVF9ISU5UX1BBVFRFUk47XG5cbiAgICAgICAgdGhpcy5fbG9jYWxCb3VuZHNDaGFuZ2VkTGlzdGVuZXIgPSB0aGlzLl9vbkxvY2FsQm91bmRzQ2hhbmdlZC5iaW5kKCB0aGlzICk7XG4gICAgICAgIHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eS5saW5rKCB0aGlzLl9sb2NhbEJvdW5kc0NoYW5nZWRMaXN0ZW5lciApO1xuXG4gICAgICAgIHRoaXMuX3JlYWRpbmdCbG9ja0lucHV0TGlzdGVuZXIgPSB7XG4gICAgICAgICAgZm9jdXM6IGV2ZW50ID0+IHRoaXMuX3NwZWFrUmVhZGluZ0Jsb2NrQ29udGVudExpc3RlbmVyKCBldmVudCApLFxuICAgICAgICAgIHVwOiBldmVudCA9PiB0aGlzLl9zcGVha1JlYWRpbmdCbG9ja0NvbnRlbnRMaXN0ZW5lciggZXZlbnQgKSxcbiAgICAgICAgICBjbGljazogZXZlbnQgPT4gdGhpcy5fc3BlYWtSZWFkaW5nQmxvY2tDb250ZW50TGlzdGVuZXIoIGV2ZW50IClcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9yZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VMaXN0ZW5lciA9IHRoaXMuX29uUmVhZGluZ0Jsb2NrRm9jdXNhYmxlQ2hhbmdlZC5iaW5kKCB0aGlzICk7XG4gICAgICAgIHZvaWNpbmdNYW5hZ2VyLnNwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eS5saW5rKCB0aGlzLl9yZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VMaXN0ZW5lciApO1xuXG4gICAgICAgIC8vIEFsbCBSZWFkaW5nQmxvY2tzIGhhdmUgYSBSZWFkaW5nQmxvY2tIaWdobGlnaHQsIGEgZm9jdXMgaGlnaGxpZ2h0IHRoYXQgaXMgYmxhY2sgdG8gaW5kaWNhdGUgaXQgaGFzXG4gICAgICAgIC8vIGEgZGlmZmVyZW50IGJlaGF2aW9yLlxuICAgICAgICB0aGlzLmZvY3VzSGlnaGxpZ2h0ID0gbmV3IFJlYWRpbmdCbG9ja0hpZ2hsaWdodCggdGhpcyApO1xuXG4gICAgICAgIC8vIEFsbCBSZWFkaW5nQmxvY2tzIHVzZSBhIFJlYWRpbmdCbG9ja1V0dGVyYW5jZSB3aXRoIEZvY3VzIGFuZCBUcmFpbCBkYXRhIHRvIHRoaXMgTm9kZSBzbyB0aGF0IGl0IGNhbiBiZVxuICAgICAgICAvLyBoaWdobGlnaHRlZCBpbiB0aGUgRm9jdXNPdmVybGF5IHdoZW4gdGhpcyBVdHRlcmFuY2UgaXMgYmVpbmcgYW5ub3VuY2VkLlxuICAgICAgICB0aGlzLnZvaWNpbmdVdHRlcmFuY2UgPSBuZXcgT3duZWRSZWFkaW5nQmxvY2tVdHRlcmFuY2UoIG51bGwgKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBXaGV0aGVyIGEgTm9kZSBjb21wb3NlcyBSZWFkaW5nQmxvY2suXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXQgX2lzUmVhZGluZ0Jsb2NrKCk6IHRydWUge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgdGhlIHRhZ05hbWUgZm9yIHRoZSBub2RlIGNvbXBvc2luZyBSZWFkaW5nQmxvY2suIFRoaXMgaXMgdGhlIHRhZ05hbWUgKG9mIFBhcmFsbGVsRE9NKSB0aGF0IHdpbGwgYmUgYXBwbGllZFxuICAgICAgICogdG8gdGhpcyBOb2RlIHdoZW4gUmVhZGluZyBCbG9ja3MgYXJlIGVuYWJsZWQuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRSZWFkaW5nQmxvY2tUYWdOYW1lKCB0YWdOYW1lOiBzdHJpbmcgfCBudWxsICk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZWFkaW5nQmxvY2tUYWdOYW1lID0gdGFnTmFtZTtcbiAgICAgICAgdGhpcy5fb25SZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VkKCB2b2ljaW5nTWFuYWdlci5zcGVlY2hBbGxvd2VkQW5kRnVsbHlFbmFibGVkUHJvcGVydHkudmFsdWUgKTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCByZWFkaW5nQmxvY2tUYWdOYW1lKCB0YWdOYW1lOiBzdHJpbmcgfCBudWxsICkgeyB0aGlzLnNldFJlYWRpbmdCbG9ja1RhZ05hbWUoIHRhZ05hbWUgKTsgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHJlYWRpbmdCbG9ja1RhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFJlYWRpbmdCbG9ja1RhZ05hbWUoKTsgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldCB0aGUgdGFnTmFtZSBmb3IgdGhpcyBOb2RlIChvZiBQYXJhbGxlbERPTSkgd2hlbiBSZWFkaW5nIEJsb2NrcyBhcmUgZW5hYmxlZC5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGdldFJlYWRpbmdCbG9ja1RhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWFkaW5nQmxvY2tUYWdOYW1lO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgdGhlIHRhZ05hbWUgZm9yIHRoZSBub2RlIGNvbXBvc2luZyBSZWFkaW5nQmxvY2suIFRoaXMgaXMgdGhlIHRhZ05hbWUgKG9mIFBhcmFsbGVsRE9NKSB0aGF0IHdpbGwgYmUgYXBwbGllZFxuICAgICAgICogdG8gdGhpcyBOb2RlIHdoZW4gUmVhZGluZyBCbG9ja3MgYXJlIGRpc2FibGVkLiBJZiB5b3UgZG8gbm90IHdhbnQgdGhlIFJlYWRpbmdCbG9jayB0byBhcHBlYXIgYXQgYWxsLCBzZXQgdG8gbnVsbC5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldFJlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVhZGluZ0Jsb2NrRGlzYWJsZWRUYWdOYW1lID0gdGFnTmFtZTtcbiAgICAgICAgdGhpcy5fb25SZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VkKCB2b2ljaW5nTWFuYWdlci5zcGVlY2hBbGxvd2VkQW5kRnVsbHlFbmFibGVkUHJvcGVydHkudmFsdWUgKTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCByZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWUoIHRhZ05hbWU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0UmVhZGluZ0Jsb2NrRGlzYWJsZWRUYWdOYW1lKCB0YWdOYW1lICk7IH1cblxuICAgICAgcHVibGljIGdldCByZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFJlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZSgpOyB9XG5cbiAgICAgIHB1YmxpYyBnZXRSZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWU7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgY29udGVudCB0aGF0IHNob3VsZCBiZSByZWFkIHdoZW5ldmVyIHRoZSBSZWFkaW5nQmxvY2sgcmVjZWl2ZXMgaW5wdXQgdGhhdCBpbml0aWF0ZXMgc3BlZWNoLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0UmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlKCBjb250ZW50OiBWb2ljaW5nUmVzcG9uc2UgKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5uYW1lUmVzcG9uc2UgPSBjb250ZW50O1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSggY29udGVudDogVm9pY2luZ1Jlc3BvbnNlICkgeyB0aGlzLnNldFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSggY29udGVudCApOyB9XG5cbiAgICAgIHB1YmxpYyBnZXQgcmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2UgeyByZXR1cm4gdGhpcy5nZXRSZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UoKTsgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgdGhlIGNvbnRlbnQgdGhhdCBpcyBzcG9rZW4gd2hlbmV2ZXIgdGhlIFJlYWRpbmdCTG9jayByZWNlaXZlcyBpbnB1dCB0aGF0IHdvdWxkIGluaXRpYXRlIHNwZWVjaC5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGdldFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5uYW1lUmVzcG9uc2U7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgaGludCByZXNwb25zZSBmb3IgdGhpcyBSZWFkaW5nQmxvY2suIFRoaXMgaXMgb25seSBzcG9rZW4gaWYgXCJIZWxwZnVsIEhpbnRzXCIgYXJlIGVuYWJsZWQgYnkgdGhlIHVzZXIuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRSZWFkaW5nQmxvY2tIaW50UmVzcG9uc2UoIGNvbnRlbnQ6IFZvaWNpbmdSZXNwb25zZSApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmhpbnRSZXNwb25zZSA9IGNvbnRlbnQ7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgcmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlKCBjb250ZW50OiBWb2ljaW5nUmVzcG9uc2UgKSB7IHRoaXMuc2V0UmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlKCBjb250ZW50ICk7IH1cblxuICAgICAgcHVibGljIGdldCByZWFkaW5nQmxvY2tIaW50UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7IHJldHVybiB0aGlzLmdldFJlYWRpbmdCbG9ja0hpbnRSZXNwb25zZSgpOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0IHRoZSBoaW50IHJlc3BvbnNlIGZvciB0aGlzIFJlYWRpbmdCbG9jay4gVGhpcyBpcyBhZGRpdGlvbmFsIGNvbnRlbnQgdGhhdCBpcyBvbmx5IHJlYWQgaWYgXCJIZWxwZnVsIEhpbnRzXCJcbiAgICAgICAqIGFyZSBlbmFibGVkLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZ2V0UmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmhpbnRSZXNwb25zZTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSBjb2xsZWN0aW9uIG9mIHBhdHRlcm5zIHRvIHVzZSBmb3Igdm9pY2luZyByZXNwb25zZXMsIGNvbnRyb2xsaW5nIHRoZSBvcmRlciwgcHVuY3R1YXRpb24sIGFuZFxuICAgICAgICogYWRkaXRpb25hbCBjb250ZW50IGZvciBlYWNoIGNvbWJpbmF0aW9uIG9mIHJlc3BvbnNlLiBTZWUgUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi5qcyBpZiB5b3Ugd2lzaCB0byB1c2VcbiAgICAgICAqIGEgY29sbGVjdGlvbiBvZiBzdHJpbmcgcGF0dGVybnMgdGhhdCBhcmUgbm90IHRoZSBkZWZhdWx0LlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0UmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiggcGF0dGVybnM6IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24gKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LnJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24gPSBwYXR0ZXJucztcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCByZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCBwYXR0ZXJuczogUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiApIHsgdGhpcy5zZXRSZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCBwYXR0ZXJucyApOyB9XG5cbiAgICAgIHB1YmxpYyBnZXQgcmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbigpOiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIHsgcmV0dXJuIHRoaXMuZ2V0UmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbigpOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0IHRoZSBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIG9iamVjdCB0aGF0IHRoaXMgUmVhZGluZ0Jsb2NrIE5vZGUgaXMgdXNpbmcgdG8gY29sbGVjdCByZXNwb25zZXMuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRSZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCk6IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LnJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb247XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmVhZGluZ0Jsb2NrIG11c3QgdGFrZSBhIFJlYWRpbmdCbG9ja1V0dGVyYW5jZSBmb3IgaXRzIHZvaWNpbmdVdHRlcmFuY2UuIFlvdSBnZW5lcmFsbHkgc2hvdWxkbid0IGJlIHVzaW5nIHRoaXMuXG4gICAgICAgKiBCdXQgaWYgeW91IG11c3QsIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgdGhlIFJlYWRpbmdCbG9ja1V0dGVyYW5jZS5yZWFkaW5nQmxvY2tGb2N1cyB3aGVuIHRoaXNcbiAgICAgICAqIFJlYWRpbmdCbG9jayBpcyBhY3RpdmF0ZWQgc28gdGhhdCBpdCBnZXRzIGhpZ2hsaWdodGVkIGNvcnJlY3RseS4gU2VlIGhvdyB0aGUgZGVmYXVsdCByZWFkaW5nQmxvY2tGb2N1cyBpcyBzZXQuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBzZXRWb2ljaW5nVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFJlYWRpbmdCbG9ja1V0dGVyYW5jZSApOiB2b2lkIHtcbiAgICAgICAgc3VwZXIuc2V0Vm9pY2luZ1V0dGVyYW5jZSggdXR0ZXJhbmNlICk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBzZXQgdm9pY2luZ1V0dGVyYW5jZSggdXR0ZXJhbmNlOiBSZWFkaW5nQmxvY2tVdHRlcmFuY2UgKSB7IHN1cGVyLnZvaWNpbmdVdHRlcmFuY2UgPSB1dHRlcmFuY2U7IH1cblxuICAgICAgcHVibGljIG92ZXJyaWRlIGdldCB2b2ljaW5nVXR0ZXJhbmNlKCk6IFJlYWRpbmdCbG9ja1V0dGVyYW5jZSB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdVdHRlcmFuY2UoKTsgfVxuXG4gICAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Vm9pY2luZ1V0dGVyYW5jZSgpOiBSZWFkaW5nQmxvY2tVdHRlcmFuY2Uge1xuICAgICAgICBjb25zdCB1dHRlcmFuY2UgPSBzdXBlci5nZXRWb2ljaW5nVXR0ZXJhbmNlKCk7XG4gICAgICAgIGFzc2VydFJlYWRpbmdCbG9ja1V0dGVyYW5jZSggdXR0ZXJhbmNlICk7XG4gICAgICAgIHJldHVybiB1dHRlcmFuY2U7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBzZXRWb2ljaW5nTmFtZVJlc3BvbnNlKCk6IHZvaWQgeyBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1JlYWRpbmdCbG9ja3Mgb25seSBzdXBwb3J0IHNldHRpbmcgdGhlIG5hbWUgcmVzcG9uc2UgdmlhIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZScgKTsgfVxuXG4gICAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Vm9pY2luZ05hbWVSZXNwb25zZSgpOiBJbnRlbnRpb25hbEFueSB7IGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnUmVhZGluZ0Jsb2NrcyBvbmx5IHN1cHBvcnQgZ2V0dGluZyB0aGUgbmFtZSByZXNwb25zZSB2aWEgcmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlJyApOyB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBzZXRWb2ljaW5nT2JqZWN0UmVzcG9uc2UoKTogdm9pZCB7IGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnUmVhZGluZ0Jsb2NrcyBkbyBub3Qgc3VwcG9ydCBzZXR0aW5nIG9iamVjdCByZXNwb25zZScgKTsgfVxuXG4gICAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Vm9pY2luZ09iamVjdFJlc3BvbnNlKCk6IEludGVudGlvbmFsQW55IHsgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdSZWFkaW5nQmxvY2tzIGRvIG5vdCBzdXBwb3J0IHNldHRpbmcgb2JqZWN0IHJlc3BvbnNlJyApOyB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBzZXRWb2ljaW5nQ29udGV4dFJlc3BvbnNlKCk6IHZvaWQgeyBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1JlYWRpbmdCbG9ja3MgZG8gbm90IHN1cHBvcnQgc2V0dGluZyBjb250ZXh0IHJlc3BvbnNlJyApOyB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBnZXRWb2ljaW5nQ29udGV4dFJlc3BvbnNlKCk6IEludGVudGlvbmFsQW55IHsgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdSZWFkaW5nQmxvY2tzIGRvIG5vdCBzdXBwb3J0IHNldHRpbmcgY29udGV4dCByZXNwb25zZScgKTsgfVxuXG4gICAgICBwdWJsaWMgb3ZlcnJpZGUgc2V0Vm9pY2luZ0hpbnRSZXNwb25zZSgpOiB2b2lkIHsgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdSZWFkaW5nQmxvY2tzIG9ubHkgc3VwcG9ydCBzZXR0aW5nIHRoZSBoaW50IHJlc3BvbnNlIHZpYSByZWFkaW5nQmxvY2tIaW50UmVzcG9uc2UuJyApOyB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBnZXRWb2ljaW5nSGludFJlc3BvbnNlKCk6IEludGVudGlvbmFsQW55IHsgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdSZWFkaW5nQmxvY2tzIG9ubHkgc3VwcG9ydCBnZXR0aW5nIHRoZSBoaW50IHJlc3BvbnNlIHZpYSByZWFkaW5nQmxvY2tIaW50UmVzcG9uc2UuJyApOyB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBzZXRWb2ljaW5nUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbigpOiB2b2lkIHsgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdSZWFkaW5nQmxvY2tzIG9ubHkgc3VwcG9ydCBzZXR0aW5nIHRoZSByZXNwb25zZSBwYXR0ZXJucyB2aWEgcmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi4nICk7IH1cblxuICAgICAgcHVibGljIG92ZXJyaWRlIGdldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCk6IEludGVudGlvbmFsQW55IHsgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdSZWFkaW5nQmxvY2tzIG9ubHkgc3VwcG9ydCBnZXR0aW5nIHRoZSByZXNwb25zZSBwYXR0ZXJucyB2aWEgcmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi4nICk7IH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSBoaWdobGlnaHQgdXNlZCB0byBzdXJyb3VuZCB0aGlzIE5vZGUgd2hpbGUgdGhlIFZvaWNpbmcgZnJhbWV3b3JrIGlzIHNwZWFraW5nIHRoaXMgY29udGVudC5cbiAgICAgICAqIElmIGEgTm9kZSBpcyBwcm92aWRlZCwgZG8gbm90IGFkZCB0aGlzIE5vZGUgdG8gdGhlIHNjZW5lIGdyYXBoLCBpdCBpcyBhZGRlZCBhbmQgbWFkZSB2aXNpYmxlIGJ5IHRoZSBIaWdobGlnaHRPdmVybGF5LlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0UmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0KCByZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQ6IEhpZ2hsaWdodCApOiB2b2lkIHtcbiAgICAgICAgaWYgKCB0aGlzLl9yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQgIT09IHJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodCApIHtcbiAgICAgICAgICB0aGlzLl9yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQgPSByZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQ7XG5cbiAgICAgICAgICB0aGlzLnJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodCggcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0OiBIaWdobGlnaHQgKSB7IHRoaXMuc2V0UmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0KCByZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQgKTsgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodCgpOiBIaWdobGlnaHQgeyByZXR1cm4gdGhpcy5fcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0OyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgaGlnaGxpZ2h0IHVzZWQgdG8gc3Vycm91bmQgdGhpcyBOb2RlIHdoZW4gdGhlIFZvaWNpbmcgZnJhbWV3b3JrIGlzIHJlYWRpbmcgaXRzXG4gICAgICAgKiBjb250ZW50LlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZ2V0UmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0KCk6IEhpZ2hsaWdodCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQ7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgUmVhZGluZ0Jsb2NrIGlzIFwiYWN0aXZhdGVkXCIsIGluZGljYXRpbmcgdGhhdCBpdCBoYXMgcmVjZWl2ZWQgaW50ZXJhY3Rpb25cbiAgICAgICAqIGFuZCB0aGUgVm9pY2luZyBmcmFtZXdvcmsgaXMgc3BlYWtpbmcgaXRzIGNvbnRlbnQuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBpc1JlYWRpbmdCbG9ja0FjdGl2YXRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGFjdGl2YXRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IHRyYWlsSWRzID0gT2JqZWN0LmtleXMoIHRoaXMuZGlzcGxheXMgKTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHJhaWxJZHMubGVuZ3RoOyBpKysgKSB7XG5cbiAgICAgICAgICBjb25zdCBwb2ludGVyRm9jdXMgPSB0aGlzLmRpc3BsYXlzWyB0cmFpbElkc1sgaSBdIF0uZm9jdXNNYW5hZ2VyLnJlYWRpbmdCbG9ja0ZvY3VzUHJvcGVydHkudmFsdWU7XG4gICAgICAgICAgaWYgKCBwb2ludGVyRm9jdXMgJiYgcG9pbnRlckZvY3VzLnRyYWlsLmxhc3ROb2RlKCkgPT09IHRoaXMgKSB7XG4gICAgICAgICAgICBhY3RpdmF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3RpdmF0ZWQ7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgcmVhZGluZ0Jsb2NrQWN0aXZhdGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc1JlYWRpbmdCbG9ja0FjdGl2YXRlZCgpOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogV2hlbiB0aGlzIE5vZGUgYmVjb21lcyBmb2N1c2FibGUgKGJlY2F1c2UgUmVhZGluZyBCbG9ja3MgaGF2ZSBqdXN0IGJlZW4gZW5hYmxlZCBvciBkaXNhYmxlZCksIGVpdGhlclxuICAgICAgICogYXBwbHkgb3IgcmVtb3ZlIHRoZSByZWFkaW5nQmxvY2tUYWdOYW1lLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBmb2N1c2FibGUgLSB3aGV0aGVyIFJlYWRpbmdCbG9ja3Mgc2hvdWxkIGJlIGZvY3VzYWJsZVxuICAgICAgICovXG4gICAgICBwcml2YXRlIF9vblJlYWRpbmdCbG9ja0ZvY3VzYWJsZUNoYW5nZWQoIGZvY3VzYWJsZTogYm9vbGVhbiApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mb2N1c2FibGUgPSBmb2N1c2FibGU7XG5cbiAgICAgICAgaWYgKCBmb2N1c2FibGUgKSB7XG4gICAgICAgICAgdGhpcy50YWdOYW1lID0gdGhpcy5fcmVhZGluZ0Jsb2NrVGFnTmFtZTtcblxuICAgICAgICAgIC8vIGRvbid0IGFkZCB0aGUgaW5wdXQgbGlzdGVuZXIgaWYgd2UgYXJlIGFscmVhZHkgYWN0aXZlLCB3ZSBtYXkganVzdCBiZSB1cGRhdGluZyB0aGUgdGFnTmFtZSBpbiB0aGlzIGNhc2VcbiAgICAgICAgICBpZiAoICF0aGlzLmhhc0lucHV0TGlzdGVuZXIoIHRoaXMuX3JlYWRpbmdCbG9ja0lucHV0TGlzdGVuZXIgKSApIHtcbiAgICAgICAgICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lciApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLnRhZ05hbWUgPSB0aGlzLl9yZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWU7XG4gICAgICAgICAgaWYgKCB0aGlzLmhhc0lucHV0TGlzdGVuZXIoIHRoaXMuX3JlYWRpbmdCbG9ja0lucHV0TGlzdGVuZXIgKSApIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lciApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFVwZGF0ZSB0aGUgaGl0IGFyZWFzIGZvciB0aGlzIE5vZGUgd2hlbmV2ZXIgdGhlIGJvdW5kcyBjaGFuZ2UuXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgX29uTG9jYWxCb3VuZHNDaGFuZ2VkKCBsb2NhbEJvdW5kczogQm91bmRzMiApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5tb3VzZUFyZWEgPSBsb2NhbEJvdW5kcztcbiAgICAgICAgdGhpcy50b3VjaEFyZWEgPSBsb2NhbEJvdW5kcztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTcGVhayB0aGUgY29udGVudCBhc3NvY2lhdGVkIHdpdGggdGhlIFJlYWRpbmdCbG9jay4gU2V0cyB0aGUgcmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0aWVzIG9uXG4gICAgICAgKiB0aGUgZGlzcGxheXMgc28gdGhhdCBIaWdobGlnaHRPdmVybGF5cyBrbm93IHRvIGFjdGl2YXRlIGEgaGlnaGxpZ2h0IHdoaWxlIHRoZSB2b2ljaW5nTWFuYWdlclxuICAgICAgICogaXMgcmVhZGluZyBhYm91dCB0aGlzIE5vZGUuXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgX3NwZWFrUmVhZGluZ0Jsb2NrQ29udGVudExpc3RlbmVyKCBldmVudDogU2NlbmVyeUV2ZW50ICk6IHZvaWQge1xuXG4gICAgICAgIGNvbnN0IGRpc3BsYXlzID0gdGhpcy5nZXRDb25uZWN0ZWREaXNwbGF5cygpO1xuXG4gICAgICAgIGNvbnN0IHJlYWRpbmdCbG9ja1V0dGVyYW5jZSA9IHRoaXMudm9pY2luZ1V0dGVyYW5jZTtcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5jb2xsZWN0UmVzcG9uc2UoIHtcbiAgICAgICAgICBuYW1lUmVzcG9uc2U6IHRoaXMuZ2V0UmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlKCksXG4gICAgICAgICAgaGludFJlc3BvbnNlOiB0aGlzLmdldFJlYWRpbmdCbG9ja0hpbnRSZXNwb25zZSgpLFxuICAgICAgICAgIGlnbm9yZVByb3BlcnRpZXM6IHRoaXMudm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcyxcbiAgICAgICAgICByZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uOiB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQucmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbixcbiAgICAgICAgICB1dHRlcmFuY2U6IHJlYWRpbmdCbG9ja1V0dGVyYW5jZVxuICAgICAgICB9ICk7XG4gICAgICAgIGlmICggY29udGVudCApIHtcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkaXNwbGF5cy5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgICAgICAgaWYgKCAhdGhpcy5nZXREZXNjZW5kYW50c1VzZUhpZ2hsaWdodGluZyggZXZlbnQudHJhaWwgKSApIHtcblxuICAgICAgICAgICAgICAvLyB0aGUgU2NlbmVyeUV2ZW50IG1pZ2h0IGhhdmUgZ29uZSB0aHJvdWdoIGEgZGVzY2VuZGFudCBvZiB0aGlzIE5vZGVcbiAgICAgICAgICAgICAgY29uc3Qgcm9vdFRvU2VsZiA9IGV2ZW50LnRyYWlsLnN1YnRyYWlsVG8oIHRoaXMgKTtcblxuICAgICAgICAgICAgICAvLyB0aGUgdHJhaWwgdG8gYSBOb2RlIG1heSBiZSBkaXNjb250aW51b3VzIGZvciBQRE9NIGV2ZW50cyBkdWUgdG8gcGRvbU9yZGVyLFxuICAgICAgICAgICAgICAvLyB0aGlzIGZpbmRzIHRoZSBhY3R1YWwgdmlzdWFsIHRyYWlsIHRvIHVzZVxuICAgICAgICAgICAgICBjb25zdCB2aXN1YWxUcmFpbCA9IFBET01JbnN0YW5jZS5ndWVzc1Zpc3VhbFRyYWlsKCByb290VG9TZWxmLCBkaXNwbGF5c1sgaSBdLnJvb3ROb2RlICk7XG5cbiAgICAgICAgICAgICAgY29uc3QgZm9jdXMgPSBuZXcgRm9jdXMoIGRpc3BsYXlzWyBpIF0sIHZpc3VhbFRyYWlsICk7XG4gICAgICAgICAgICAgIHJlYWRpbmdCbG9ja1V0dGVyYW5jZS5yZWFkaW5nQmxvY2tGb2N1cyA9IGZvY3VzO1xuICAgICAgICAgICAgICB0aGlzLnNwZWFrQ29udGVudCggY29udGVudCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIElmIHdlIGNyZWF0ZWQgYW5kIG93biB0aGUgdm9pY2luZ1V0dGVyYW5jZSB3ZSBjYW4gZnVsbHkgZGlzcG9zZSBvZiBpdC5cbiAgICAgICAqIEBtaXhpbi1wcm90ZWN0ZWQgLSBtYWRlIHB1YmxpYyBmb3IgdXNlIGluIHRoZSBtaXhpbiBvbmx5XG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBjbGVhblZvaWNpbmdVdHRlcmFuY2UoKTogdm9pZCB7XG4gICAgICAgIGlmICggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSBpbnN0YW5jZW9mIE93bmVkUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlICkge1xuICAgICAgICAgIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyLmNsZWFuVm9pY2luZ1V0dGVyYW5jZSgpO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAgICAgdm9pY2luZ01hbmFnZXIuc3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5LnVubGluayggdGhpcy5fcmVhZGluZ0Jsb2NrRm9jdXNhYmxlQ2hhbmdlTGlzdGVuZXIgKTtcbiAgICAgICAgdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5LnVubGluayggdGhpcy5fbG9jYWxCb3VuZHNDaGFuZ2VkTGlzdGVuZXIgKTtcblxuICAgICAgICAvLyByZW1vdmUgdGhlIGlucHV0IGxpc3RlbmVyIHRoYXQgYWN0aXZhdGVzIHRoZSBSZWFkaW5nQmxvY2ssIG9ubHkgZG8gdGhpcyBpZiB0aGUgbGlzdGVuZXIgaXMgYXR0YWNoZWQgd2hpbGVcbiAgICAgICAgLy8gdGhlIFJlYWRpbmdCbG9jayBpcyBlbmFibGVkXG4gICAgICAgIGlmICggdGhpcy5oYXNJbnB1dExpc3RlbmVyKCB0aGlzLl9yZWFkaW5nQmxvY2tJbnB1dExpc3RlbmVyICkgKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9yZWFkaW5nQmxvY2tJbnB1dExpc3RlbmVyICk7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBtdXRhdGUoIG9wdGlvbnM/OiBTZWxmT3B0aW9ucyAmIFBhcmFtZXRlcnM8SW5zdGFuY2VUeXBlPFN1cGVyVHlwZT5bICdtdXRhdGUnIF0+WyAwIF0gKTogdGhpcyB7XG4gICAgICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgLyoqXG4gICAqIHtBcnJheS48c3RyaW5nPn0gLSBTdHJpbmcga2V5cyBmb3IgYWxsIHRoZSBhbGxvd2VkIG9wdGlvbnMgdGhhdCB3aWxsIGJlIHNldCBieSBOb2RlLm11dGF0ZSggb3B0aW9ucyApLCBpblxuICAgKiB0aGUgb3JkZXIgdGhleSB3aWxsIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogTk9URTogU2VlIE5vZGUncyBfbXV0YXRvcktleXMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdGhpcyBvcGVyYXRlcywgYW5kIHBvdGVudGlhbCBzcGVjaWFsXG4gICAqICAgICAgIGNhc2VzIHRoYXQgbWF5IGFwcGx5LlxuICAgKi9cbiAgUmVhZGluZ0Jsb2NrQ2xhc3MucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IFJFQURJTkdfQkxPQ0tfT1BUSU9OX0tFWVMuY29uY2F0KCBSZWFkaW5nQmxvY2tDbGFzcy5wcm90b3R5cGUuX211dGF0b3JLZXlzICk7XG4gIGFzc2VydCAmJiBhc3NlcnQoIFJlYWRpbmdCbG9ja0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMubGVuZ3RoID09PSBfLnVuaXEoIFJlYWRpbmdCbG9ja0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKS5sZW5ndGgsXG4gICAgJ3ggbXV0YXRvciBrZXlzIGluIFJlYWRpbmdCbG9jaycgKTtcblxuICByZXR1cm4gUmVhZGluZ0Jsb2NrQ2xhc3M7XG59ICk7XG5cbi8vIEV4cG9ydCBhIHR5cGUgdGhhdCBsZXRzIHlvdSBjaGVjayBpZiB5b3VyIE5vZGUgaXMgY29tcG9zZWQgd2l0aCBSZWFkaW5nQmxvY2tcbmV4cG9ydCB0eXBlIFJlYWRpbmdCbG9ja05vZGUgPSBOb2RlICYgVFJlYWRpbmdCbG9jaztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVhZGluZ0Jsb2NrKCBzb21ldGhpbmc6IEludGVudGlvbmFsQW55ICk6IHNvbWV0aGluZyBpcyBSZWFkaW5nQmxvY2tOb2RlIHtcbiAgcmV0dXJuIHNvbWV0aGluZyBpbnN0YW5jZW9mIE5vZGUgJiYgKCBzb21ldGhpbmcgYXMgUmVhZGluZ0Jsb2NrTm9kZSApLl9pc1JlYWRpbmdCbG9jaztcbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1JlYWRpbmdCbG9jaycsIFJlYWRpbmdCbG9jayApO1xuZXhwb3J0IGRlZmF1bHQgUmVhZGluZ0Jsb2NrOyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIm1lbW9pemUiLCJSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIiwiRGVsYXllZE11dGF0ZSIsIkZvY3VzIiwiTm9kZSIsIlBET01JbnN0YW5jZSIsIlJlYWRpbmdCbG9ja0hpZ2hsaWdodCIsIlJlYWRpbmdCbG9ja1V0dGVyYW5jZSIsInNjZW5lcnkiLCJWb2ljaW5nIiwidm9pY2luZ01hbmFnZXIiLCJSRUFESU5HX0JMT0NLX09QVElPTl9LRVlTIiwiYXNzZXJ0UmVhZGluZ0Jsb2NrVXR0ZXJhbmNlIiwidXR0ZXJhbmNlIiwiYXNzZXJ0IiwiT3duZWRSZWFkaW5nQmxvY2tVdHRlcmFuY2UiLCJmb2N1cyIsInByb3ZpZGVkT3B0aW9ucyIsIkRFRkFVTFRfQ09OVEVOVF9ISU5UX1BBVFRFUk4iLCJuYW1lSGludCIsIlJlYWRpbmdCbG9jayIsIlR5cGUiLCJSZWFkaW5nQmxvY2tDbGFzcyIsIl9pc1JlYWRpbmdCbG9jayIsInNldFJlYWRpbmdCbG9ja1RhZ05hbWUiLCJ0YWdOYW1lIiwiX3JlYWRpbmdCbG9ja1RhZ05hbWUiLCJfb25SZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VkIiwic3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5IiwidmFsdWUiLCJyZWFkaW5nQmxvY2tUYWdOYW1lIiwiZ2V0UmVhZGluZ0Jsb2NrVGFnTmFtZSIsInNldFJlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZSIsIl9yZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWUiLCJyZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWUiLCJnZXRSZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWUiLCJzZXRSZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UiLCJjb250ZW50IiwiX3ZvaWNpbmdSZXNwb25zZVBhY2tldCIsIm5hbWVSZXNwb25zZSIsInJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSIsImdldFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSIsInNldFJlYWRpbmdCbG9ja0hpbnRSZXNwb25zZSIsImhpbnRSZXNwb25zZSIsInJlYWRpbmdCbG9ja0hpbnRSZXNwb25zZSIsImdldFJlYWRpbmdCbG9ja0hpbnRSZXNwb25zZSIsInNldFJlYWRpbmdCbG9ja1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24iLCJwYXR0ZXJucyIsInJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24iLCJyZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIiwiZ2V0UmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsInNldFZvaWNpbmdVdHRlcmFuY2UiLCJ2b2ljaW5nVXR0ZXJhbmNlIiwiZ2V0Vm9pY2luZ1V0dGVyYW5jZSIsInNldFZvaWNpbmdOYW1lUmVzcG9uc2UiLCJnZXRWb2ljaW5nTmFtZVJlc3BvbnNlIiwic2V0Vm9pY2luZ09iamVjdFJlc3BvbnNlIiwiZ2V0Vm9pY2luZ09iamVjdFJlc3BvbnNlIiwic2V0Vm9pY2luZ0NvbnRleHRSZXNwb25zZSIsImdldFZvaWNpbmdDb250ZXh0UmVzcG9uc2UiLCJzZXRWb2ljaW5nSGludFJlc3BvbnNlIiwiZ2V0Vm9pY2luZ0hpbnRSZXNwb25zZSIsInNldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIiwiZ2V0Vm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24iLCJzZXRSZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQiLCJyZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQiLCJfcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0IiwicmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIiLCJlbWl0IiwiZ2V0UmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0IiwiaXNSZWFkaW5nQmxvY2tBY3RpdmF0ZWQiLCJhY3RpdmF0ZWQiLCJ0cmFpbElkcyIsIk9iamVjdCIsImtleXMiLCJkaXNwbGF5cyIsImkiLCJsZW5ndGgiLCJwb2ludGVyRm9jdXMiLCJmb2N1c01hbmFnZXIiLCJyZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5IiwidHJhaWwiLCJsYXN0Tm9kZSIsInJlYWRpbmdCbG9ja0FjdGl2YXRlZCIsImZvY3VzYWJsZSIsImhhc0lucHV0TGlzdGVuZXIiLCJfcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lciIsImFkZElucHV0TGlzdGVuZXIiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwiX29uTG9jYWxCb3VuZHNDaGFuZ2VkIiwibG9jYWxCb3VuZHMiLCJtb3VzZUFyZWEiLCJ0b3VjaEFyZWEiLCJfc3BlYWtSZWFkaW5nQmxvY2tDb250ZW50TGlzdGVuZXIiLCJldmVudCIsImdldENvbm5lY3RlZERpc3BsYXlzIiwicmVhZGluZ0Jsb2NrVXR0ZXJhbmNlIiwiY29sbGVjdFJlc3BvbnNlIiwiaWdub3JlUHJvcGVydGllcyIsInZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXMiLCJnZXREZXNjZW5kYW50c1VzZUhpZ2hsaWdodGluZyIsInJvb3RUb1NlbGYiLCJzdWJ0cmFpbFRvIiwidmlzdWFsVHJhaWwiLCJndWVzc1Zpc3VhbFRyYWlsIiwicm9vdE5vZGUiLCJyZWFkaW5nQmxvY2tGb2N1cyIsInNwZWFrQ29udGVudCIsImNsZWFuVm9pY2luZ1V0dGVyYW5jZSIsIl92b2ljaW5nVXR0ZXJhbmNlIiwiZGlzcG9zZSIsInVubGluayIsIl9yZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VMaXN0ZW5lciIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJfbG9jYWxCb3VuZHNDaGFuZ2VkTGlzdGVuZXIiLCJtdXRhdGUiLCJvcHRpb25zIiwiYXJncyIsImJpbmQiLCJsaW5rIiwidXAiLCJjbGljayIsImZvY3VzSGlnaGxpZ2h0IiwicHJvdG90eXBlIiwiX211dGF0b3JLZXlzIiwiY29uY2F0IiwiXyIsInVuaXEiLCJpc1JlYWRpbmdCbG9jayIsInNvbWV0aGluZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBR0QsT0FBT0EsaUJBQWlCLHFDQUFxQztBQUc3RCxPQUFPQyxhQUFhLHNDQUFzQztBQUsxRCxPQUFPQywrQkFBK0IsOERBQThEO0FBRXBHLFNBQVNDLGFBQWEsRUFBRUMsS0FBSyxFQUFhQyxJQUFJLEVBQUVDLFlBQVksRUFBRUMscUJBQXFCLEVBQUVDLHFCQUFxQixFQUFnQ0MsT0FBTyxFQUFnQkMsT0FBTyxFQUFFQyxjQUFjLFFBQXdCLG1CQUFtQjtBQUluTyxNQUFNQyw0QkFBNEI7SUFDaEM7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0NBQ0Q7QUFzQkQseUVBQXlFO0FBQ3pFLFNBQVNDLDRCQUE2QkMsU0FBb0I7SUFDeEQsSUFBSyxDQUFHQSxDQUFBQSxxQkFBcUJOLHFCQUFvQixHQUFNO1FBQ3JETyxVQUFVQSxPQUFRLE9BQU87SUFDM0I7QUFDRjtBQUVBLHVIQUF1SDtBQUN2SCx3QkFBd0I7QUFDeEIsSUFBQSxBQUFNQyw2QkFBTixNQUFNQSxtQ0FBbUNSO0lBQ3ZD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