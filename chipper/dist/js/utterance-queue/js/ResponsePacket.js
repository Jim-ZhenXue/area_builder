// Copyright 2021-2024, University of Colorado Boulder
/**
 * The ResponsePacket collects the categories of a single "response" into the following sections:
 * "Name Response" - A response that labels (names) some element to describe.
 * "Object Response" - A response directly describing the state of the named element.
 * "Context Response" - A response that describes surrounding context related to the named element or changes to it.
 * "Hint Response" - A response that gives a hint about what en element is for or how to interact with it.
 *
 * A response is most often tied to an element, or an object that is being described/voiced.
 *
 * Individual categories of responses can be enabled or disabled. The ResponsePacket keeps track of all these
 * responses. When it is time to alert the responses of this ResponsePacket, the ResponseCollector will assemble
 * a final string depending on which categories of responses are enabled.
 *
 * @author Jesse Greenberg
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import { isTReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import { optionize3 } from '../../phet-core/js/optionize.js';
import ResponsePatternCollection from './ResponsePatternCollection.js';
import utteranceQueueNamespace from './utteranceQueueNamespace.js';
// Defaults can't be functions, it makes it easier for certain cases, like in responseCollector.
const DEFAULT_OPTIONS = {
    nameResponse: null,
    objectResponse: null,
    contextResponse: null,
    hintResponse: null,
    ignoreProperties: false,
    // The collection of string patterns to use when assembling responses based on which
    // responses are provided and which responseCollector Properties are true. See ResponsePatternCollection
    // if you do not want to use the default.
    responsePatternCollection: ResponsePatternCollection.DEFAULT_RESPONSE_PATTERNS
};
let ResponsePacket = class ResponsePacket {
    getNameResponse() {
        return ResponsePacket.getResponseText(this._nameResponse);
    }
    get nameResponse() {
        return this.getNameResponse();
    }
    set nameResponse(nameResponse) {
        this.setNameResponse(nameResponse);
    }
    setNameResponse(nameResponse) {
        this._nameResponse = nameResponse;
    }
    getObjectResponse() {
        return ResponsePacket.getResponseText(this._objectResponse);
    }
    get objectResponse() {
        return this.getObjectResponse();
    }
    set objectResponse(objectResponse) {
        this.setObjectResponse(objectResponse);
    }
    setObjectResponse(objectResponse) {
        this._objectResponse = objectResponse;
    }
    getContextResponse() {
        return ResponsePacket.getResponseText(this._contextResponse);
    }
    get contextResponse() {
        return this.getContextResponse();
    }
    set contextResponse(contextResponse) {
        this.setContextResponse(contextResponse);
    }
    setContextResponse(contextResponse) {
        this._contextResponse = contextResponse;
    }
    getHintResponse() {
        return ResponsePacket.getResponseText(this._hintResponse);
    }
    get hintResponse() {
        return this.getHintResponse();
    }
    set hintResponse(hintResponse) {
        this.setHintResponse(hintResponse);
    }
    setHintResponse(hintResponse) {
        this._hintResponse = hintResponse;
    }
    // Map VoicingResponse -> ResolvedResponse (resolve functions and Properties to their values)
    static getResponseText(response) {
        return isTReadOnlyProperty(response) ? response.value : typeof response === 'function' ? response() : response;
    }
    copy() {
        return new ResponsePacket(this.serialize());
    }
    serialize() {
        return {
            nameResponse: this.nameResponse,
            objectResponse: this.objectResponse,
            contextResponse: this.contextResponse,
            hintResponse: this.hintResponse,
            ignoreProperties: this.ignoreProperties,
            responsePatternCollection: this.responsePatternCollection
        };
    }
    constructor(providedOptions){
        const options = optionize3()({}, DEFAULT_OPTIONS, providedOptions);
        assert && assert(options.responsePatternCollection instanceof ResponsePatternCollection);
        // The response to be spoken for this packet when speaking names. This is usually
        // the same as the description accessible name, typically spoken on focus and on interaction, labelling what the
        // object is. Mutate as needed until time to alert.
        this._nameResponse = options.nameResponse;
        // The response to be spoken for this packet when speaking about object changes. This
        // is usually the state information, such as the current input value. Mutate as needed until time to alert.
        this._objectResponse = options.objectResponse;
        // The response to be spoken for this packet when speaking about context changes.
        // This is usually a response that describes the surrounding changes that have occurred after interacting
        // with the object. Mutate as needed until time to alert.
        this._contextResponse = options.contextResponse;
        // The response to be spoken for this packet when speaking hints. This is usually the response
        // that guides the user toward further interaction with this object if it is important to do so to use
        // the application. Mutate as needed until time to alert.
        this._hintResponse = options.hintResponse;
        // Controls whether or not the name, object, context, and hint responses are controlled
        // by responseCollector Properties. If true, all responses will be spoken when requested, regardless
        // of these Properties. This is often useful for surrounding UI components where it is important
        // that information be heard even when certain responses have been disabled. Mutate as needed until time to alert.
        this.ignoreProperties = options.ignoreProperties;
        // A collection of response patterns that are used when consolidating
        // each response with responseCollector. Controls the order of the Voicing responses and also punctuation
        // used when responses are assembled into final content for the UtteranceQueue. See ResponsePatternCollection for
        // more details. Mutate as needed until time to alert.
        this.responsePatternCollection = options.responsePatternCollection;
    }
};
ResponsePacket.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
utteranceQueueNamespace.register('ResponsePacket', ResponsePacket);
export default ResponsePacket;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9SZXNwb25zZVBhY2tldC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGUgUmVzcG9uc2VQYWNrZXQgY29sbGVjdHMgdGhlIGNhdGVnb3JpZXMgb2YgYSBzaW5nbGUgXCJyZXNwb25zZVwiIGludG8gdGhlIGZvbGxvd2luZyBzZWN0aW9uczpcbiAqIFwiTmFtZSBSZXNwb25zZVwiIC0gQSByZXNwb25zZSB0aGF0IGxhYmVscyAobmFtZXMpIHNvbWUgZWxlbWVudCB0byBkZXNjcmliZS5cbiAqIFwiT2JqZWN0IFJlc3BvbnNlXCIgLSBBIHJlc3BvbnNlIGRpcmVjdGx5IGRlc2NyaWJpbmcgdGhlIHN0YXRlIG9mIHRoZSBuYW1lZCBlbGVtZW50LlxuICogXCJDb250ZXh0IFJlc3BvbnNlXCIgLSBBIHJlc3BvbnNlIHRoYXQgZGVzY3JpYmVzIHN1cnJvdW5kaW5nIGNvbnRleHQgcmVsYXRlZCB0byB0aGUgbmFtZWQgZWxlbWVudCBvciBjaGFuZ2VzIHRvIGl0LlxuICogXCJIaW50IFJlc3BvbnNlXCIgLSBBIHJlc3BvbnNlIHRoYXQgZ2l2ZXMgYSBoaW50IGFib3V0IHdoYXQgZW4gZWxlbWVudCBpcyBmb3Igb3IgaG93IHRvIGludGVyYWN0IHdpdGggaXQuXG4gKlxuICogQSByZXNwb25zZSBpcyBtb3N0IG9mdGVuIHRpZWQgdG8gYW4gZWxlbWVudCwgb3IgYW4gb2JqZWN0IHRoYXQgaXMgYmVpbmcgZGVzY3JpYmVkL3ZvaWNlZC5cbiAqXG4gKiBJbmRpdmlkdWFsIGNhdGVnb3JpZXMgb2YgcmVzcG9uc2VzIGNhbiBiZSBlbmFibGVkIG9yIGRpc2FibGVkLiBUaGUgUmVzcG9uc2VQYWNrZXQga2VlcHMgdHJhY2sgb2YgYWxsIHRoZXNlXG4gKiByZXNwb25zZXMuIFdoZW4gaXQgaXMgdGltZSB0byBhbGVydCB0aGUgcmVzcG9uc2VzIG9mIHRoaXMgUmVzcG9uc2VQYWNrZXQsIHRoZSBSZXNwb25zZUNvbGxlY3RvciB3aWxsIGFzc2VtYmxlXG4gKiBhIGZpbmFsIHN0cmluZyBkZXBlbmRpbmcgb24gd2hpY2ggY2F0ZWdvcmllcyBvZiByZXNwb25zZXMgYXJlIGVuYWJsZWQuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHksIHsgaXNUUmVhZE9ubHlQcm9wZXJ0eSB9IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IHsgb3B0aW9uaXplMywgT3B0aW9uaXplRGVmYXVsdHMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIGZyb20gJy4vUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgdXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UgZnJvbSAnLi91dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZS5qcyc7XG5cbi8vIFRoZSB0ZXh0IHNlbnQgdG8gYW4gQW5ub3VuY2VyIHRlY2hub2xvZ3ksIGFmdGVyIHJlc29sdmluZyBpdCBmcm9tIHBvdGVudGlhbGx5IG1vcmUgY29tcGxpY2F0ZWQgc3RydWN0dXJlcyBob2xkaW5nIGEgcmVzcG9uc2VcbmV4cG9ydCB0eXBlIFJlc29sdmVkUmVzcG9uc2UgPSBzdHJpbmcgfCBudW1iZXIgfCBudWxsIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcblxudHlwZSBSZXNwb25zZUNyZWF0b3IgPSBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHwgKCAoKSA9PiBSZXNvbHZlZFJlc3BvbnNlICk7XG5leHBvcnQgdHlwZSBWb2ljaW5nUmVzcG9uc2UgPSBSZXNwb25zZUNyZWF0b3IgfCBSZXNvbHZlZFJlc3BvbnNlO1xuXG4vLyBObyBmdW5jdGlvbiBjcmVhdG9yIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0byBzdXBwb3J0IHRoZSBleGVjdXRpb24gb2YgdGhhdCBmdW5jdGlvbi5cbmV4cG9ydCB0eXBlIFNwZWFrYWJsZVJlc29sdmVkUmVzcG9uc2UgPSBSZXNvbHZlZFJlc3BvbnNlIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcblxuZXhwb3J0IHR5cGUgUmVzcG9uc2VQYWNrZXRPcHRpb25zID0ge1xuXG4gIC8vIHNwb2tlbiB3aGVuIG5hbWUgcmVzcG9uc2VzIGFyZSBlbmFibGVkXG4gIG5hbWVSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcblxuICAvLyBzcG9rZW4gd2hlbiBvYmplY3QgcmVzcG9uc2VzIGFyZSBlbmFibGVkXG4gIG9iamVjdFJlc3BvbnNlPzogVm9pY2luZ1Jlc3BvbnNlO1xuXG4gIC8vIHNwb2tlbiB3aGVuIGNvbnRleHQgcmVzcG9uc2VzIGFyZSBlbmFibGVkXG4gIGNvbnRleHRSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcblxuICAvLyBzcG9rZW4gd2hlbiBpbnRlcmFjdGlvbiBoaW50cyBhcmUgZW5hYmxlZFxuICBoaW50UmVzcG9uc2U/OiBWb2ljaW5nUmVzcG9uc2U7XG5cbiAgLy8gV2hldGhlciB0aGlzIHJlc3BvbnNlIHNob3VsZCBpZ25vcmUgdGhlIFByb3BlcnRpZXMgb2YgcmVzcG9uc2VDb2xsZWN0b3IuIElmIHRydWUsIHRoZSBuYW1lUmVzcG9uc2UsIG9iamVjdFJlc3BvbnNlLFxuICAvLyBjb250ZXh0UmVzcG9uc2UsIGFuZCBpbnRlcmFjdGlvbkhpbnQgd2lsbCBhbGwgYmUgc3Bva2VuIHJlZ2FyZGxlc3Mgb2YgdGhlIHZhbHVlcyBvZiB0aGUgUHJvcGVydGllcyBvZiByZXNwb25zZUNvbGxlY3RvclxuICBpZ25vcmVQcm9wZXJ0aWVzPzogYm9vbGVhbjtcblxuICAvLyBDb2xsZWN0aW9uIG9mIHN0cmluZyBwYXR0ZXJucyB0byB1c2Ugd2l0aCByZXNwb25zZUNvbGxlY3Rvci5jb2xsZWN0UmVzcG9uc2VzLCBzZWUgUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiBmb3JcbiAgLy8gbW9yZSBpbmZvcm1hdGlvbi5cbiAgcmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbj86IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb247XG59O1xuXG5leHBvcnQgdHlwZSBTcGVha2FibGVSZXNvbHZlZE9wdGlvbnMgPSB7XG5cbiAgLy8gSW4gc3BlYWtpbmcgb3B0aW9ucywgd2UgZG9uJ3QgYWxsb3cgYSBSZXNwb25zZUNyZWF0b3IgZnVuY3Rpb24sIGJ1dCBqdXN0IGEgc3RyaW5nfG51bGwuIFRoZSBgdW5kZWZpbmVkYCBpcyB0b1xuICAvLyBtYXRjaCBvbiB0aGUgcHJvcGVydGllcyBiZWNhdXNlIHRoZXkgYXJlIG9wdGlvbmFsIChtYXJrZWQgd2l0aCBgP2ApXG4gIFtQcm9wZXJ0eU5hbWUgaW4ga2V5b2YgUmVzcG9uc2VQYWNrZXRPcHRpb25zXTogUmVzcG9uc2VQYWNrZXRPcHRpb25zW1Byb3BlcnR5TmFtZV0gZXh0ZW5kcyAoIFZvaWNpbmdSZXNwb25zZSB8IHVuZGVmaW5lZCApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTcGVha2FibGVSZXNvbHZlZFJlc3BvbnNlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNwb25zZVBhY2tldE9wdGlvbnNbUHJvcGVydHlOYW1lXTtcbn07XG5cbi8vIEFkZCBudWxsIHN1cHBvcnQgZm9yIGNlcnRhaW4gY2FzZXNcbmV4cG9ydCB0eXBlIFNwZWFrYWJsZU51bGxhYmxlUmVzb2x2ZWRPcHRpb25zID0ge1xuICBbUHJvcGVydHlOYW1lIGluIGtleW9mIFNwZWFrYWJsZVJlc29sdmVkT3B0aW9uc106IFNwZWFrYWJsZVJlc29sdmVkT3B0aW9uc1tQcm9wZXJ0eU5hbWVdIGV4dGVuZHMgU3BlYWthYmxlUmVzb2x2ZWRSZXNwb25zZSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3BlYWthYmxlUmVzb2x2ZWRSZXNwb25zZSB8IG51bGwgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNwZWFrYWJsZVJlc29sdmVkT3B0aW9uc1tQcm9wZXJ0eU5hbWVdO1xufTtcblxuLy8gRGVmYXVsdHMgY2FuJ3QgYmUgZnVuY3Rpb25zLCBpdCBtYWtlcyBpdCBlYXNpZXIgZm9yIGNlcnRhaW4gY2FzZXMsIGxpa2UgaW4gcmVzcG9uc2VDb2xsZWN0b3IuXG5jb25zdCBERUZBVUxUX09QVElPTlM6IE9wdGlvbml6ZURlZmF1bHRzPFNwZWFrYWJsZU51bGxhYmxlUmVzb2x2ZWRPcHRpb25zPiA9IHtcbiAgbmFtZVJlc3BvbnNlOiBudWxsLFxuICBvYmplY3RSZXNwb25zZTogbnVsbCxcbiAgY29udGV4dFJlc3BvbnNlOiBudWxsLFxuICBoaW50UmVzcG9uc2U6IG51bGwsXG4gIGlnbm9yZVByb3BlcnRpZXM6IGZhbHNlLFxuXG4gIC8vIFRoZSBjb2xsZWN0aW9uIG9mIHN0cmluZyBwYXR0ZXJucyB0byB1c2Ugd2hlbiBhc3NlbWJsaW5nIHJlc3BvbnNlcyBiYXNlZCBvbiB3aGljaFxuICAvLyByZXNwb25zZXMgYXJlIHByb3ZpZGVkIGFuZCB3aGljaCByZXNwb25zZUNvbGxlY3RvciBQcm9wZXJ0aWVzIGFyZSB0cnVlLiBTZWUgUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvblxuICAvLyBpZiB5b3UgZG8gbm90IHdhbnQgdG8gdXNlIHRoZSBkZWZhdWx0LlxuICByZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uOiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uLkRFRkFVTFRfUkVTUE9OU0VfUEFUVEVSTlNcbn07XG5cbmNsYXNzIFJlc3BvbnNlUGFja2V0IHtcbiAgcHJpdmF0ZSBfbmFtZVJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2U7XG4gIHByaXZhdGUgX29iamVjdFJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2U7XG4gIHByaXZhdGUgX2NvbnRleHRSZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlO1xuICBwcml2YXRlIF9oaW50UmVzcG9uc2U6IFZvaWNpbmdSZXNwb25zZTtcblxuICBwdWJsaWMgaWdub3JlUHJvcGVydGllczogYm9vbGVhbjtcbiAgcHVibGljIHJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb246IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb247XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9PUFRJT05TID0gREVGQVVMVF9PUFRJT05TO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUmVzcG9uc2VQYWNrZXRPcHRpb25zICkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemUzPFJlc3BvbnNlUGFja2V0T3B0aW9ucz4oKSgge30sIERFRkFVTFRfT1BUSU9OUywgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24gaW5zdGFuY2VvZiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uICk7XG5cbiAgICAvLyBUaGUgcmVzcG9uc2UgdG8gYmUgc3Bva2VuIGZvciB0aGlzIHBhY2tldCB3aGVuIHNwZWFraW5nIG5hbWVzLiBUaGlzIGlzIHVzdWFsbHlcbiAgICAvLyB0aGUgc2FtZSBhcyB0aGUgZGVzY3JpcHRpb24gYWNjZXNzaWJsZSBuYW1lLCB0eXBpY2FsbHkgc3Bva2VuIG9uIGZvY3VzIGFuZCBvbiBpbnRlcmFjdGlvbiwgbGFiZWxsaW5nIHdoYXQgdGhlXG4gICAgLy8gb2JqZWN0IGlzLiBNdXRhdGUgYXMgbmVlZGVkIHVudGlsIHRpbWUgdG8gYWxlcnQuXG4gICAgdGhpcy5fbmFtZVJlc3BvbnNlID0gb3B0aW9ucy5uYW1lUmVzcG9uc2U7XG5cbiAgICAvLyBUaGUgcmVzcG9uc2UgdG8gYmUgc3Bva2VuIGZvciB0aGlzIHBhY2tldCB3aGVuIHNwZWFraW5nIGFib3V0IG9iamVjdCBjaGFuZ2VzLiBUaGlzXG4gICAgLy8gaXMgdXN1YWxseSB0aGUgc3RhdGUgaW5mb3JtYXRpb24sIHN1Y2ggYXMgdGhlIGN1cnJlbnQgaW5wdXQgdmFsdWUuIE11dGF0ZSBhcyBuZWVkZWQgdW50aWwgdGltZSB0byBhbGVydC5cbiAgICB0aGlzLl9vYmplY3RSZXNwb25zZSA9IG9wdGlvbnMub2JqZWN0UmVzcG9uc2U7XG5cbiAgICAvLyBUaGUgcmVzcG9uc2UgdG8gYmUgc3Bva2VuIGZvciB0aGlzIHBhY2tldCB3aGVuIHNwZWFraW5nIGFib3V0IGNvbnRleHQgY2hhbmdlcy5cbiAgICAvLyBUaGlzIGlzIHVzdWFsbHkgYSByZXNwb25zZSB0aGF0IGRlc2NyaWJlcyB0aGUgc3Vycm91bmRpbmcgY2hhbmdlcyB0aGF0IGhhdmUgb2NjdXJyZWQgYWZ0ZXIgaW50ZXJhY3RpbmdcbiAgICAvLyB3aXRoIHRoZSBvYmplY3QuIE11dGF0ZSBhcyBuZWVkZWQgdW50aWwgdGltZSB0byBhbGVydC5cbiAgICB0aGlzLl9jb250ZXh0UmVzcG9uc2UgPSBvcHRpb25zLmNvbnRleHRSZXNwb25zZTtcblxuICAgIC8vIFRoZSByZXNwb25zZSB0byBiZSBzcG9rZW4gZm9yIHRoaXMgcGFja2V0IHdoZW4gc3BlYWtpbmcgaGludHMuIFRoaXMgaXMgdXN1YWxseSB0aGUgcmVzcG9uc2VcbiAgICAvLyB0aGF0IGd1aWRlcyB0aGUgdXNlciB0b3dhcmQgZnVydGhlciBpbnRlcmFjdGlvbiB3aXRoIHRoaXMgb2JqZWN0IGlmIGl0IGlzIGltcG9ydGFudCB0byBkbyBzbyB0byB1c2VcbiAgICAvLyB0aGUgYXBwbGljYXRpb24uIE11dGF0ZSBhcyBuZWVkZWQgdW50aWwgdGltZSB0byBhbGVydC5cbiAgICB0aGlzLl9oaW50UmVzcG9uc2UgPSBvcHRpb25zLmhpbnRSZXNwb25zZTtcblxuICAgIC8vIENvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSBuYW1lLCBvYmplY3QsIGNvbnRleHQsIGFuZCBoaW50IHJlc3BvbnNlcyBhcmUgY29udHJvbGxlZFxuICAgIC8vIGJ5IHJlc3BvbnNlQ29sbGVjdG9yIFByb3BlcnRpZXMuIElmIHRydWUsIGFsbCByZXNwb25zZXMgd2lsbCBiZSBzcG9rZW4gd2hlbiByZXF1ZXN0ZWQsIHJlZ2FyZGxlc3NcbiAgICAvLyBvZiB0aGVzZSBQcm9wZXJ0aWVzLiBUaGlzIGlzIG9mdGVuIHVzZWZ1bCBmb3Igc3Vycm91bmRpbmcgVUkgY29tcG9uZW50cyB3aGVyZSBpdCBpcyBpbXBvcnRhbnRcbiAgICAvLyB0aGF0IGluZm9ybWF0aW9uIGJlIGhlYXJkIGV2ZW4gd2hlbiBjZXJ0YWluIHJlc3BvbnNlcyBoYXZlIGJlZW4gZGlzYWJsZWQuIE11dGF0ZSBhcyBuZWVkZWQgdW50aWwgdGltZSB0byBhbGVydC5cbiAgICB0aGlzLmlnbm9yZVByb3BlcnRpZXMgPSBvcHRpb25zLmlnbm9yZVByb3BlcnRpZXM7XG5cbiAgICAvLyBBIGNvbGxlY3Rpb24gb2YgcmVzcG9uc2UgcGF0dGVybnMgdGhhdCBhcmUgdXNlZCB3aGVuIGNvbnNvbGlkYXRpbmdcbiAgICAvLyBlYWNoIHJlc3BvbnNlIHdpdGggcmVzcG9uc2VDb2xsZWN0b3IuIENvbnRyb2xzIHRoZSBvcmRlciBvZiB0aGUgVm9pY2luZyByZXNwb25zZXMgYW5kIGFsc28gcHVuY3R1YXRpb25cbiAgICAvLyB1c2VkIHdoZW4gcmVzcG9uc2VzIGFyZSBhc3NlbWJsZWQgaW50byBmaW5hbCBjb250ZW50IGZvciB0aGUgVXR0ZXJhbmNlUXVldWUuIFNlZSBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIGZvclxuICAgIC8vIG1vcmUgZGV0YWlscy4gTXV0YXRlIGFzIG5lZWRlZCB1bnRpbCB0aW1lIHRvIGFsZXJ0LlxuICAgIHRoaXMucmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiA9IG9wdGlvbnMucmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXROYW1lUmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7XG4gICAgcmV0dXJuIFJlc3BvbnNlUGFja2V0LmdldFJlc3BvbnNlVGV4dCggdGhpcy5fbmFtZVJlc3BvbnNlICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG5hbWVSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlIHsgcmV0dXJuIHRoaXMuZ2V0TmFtZVJlc3BvbnNlKCk7IH1cblxuICBwdWJsaWMgc2V0IG5hbWVSZXNwb25zZSggbmFtZVJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKSB7IHRoaXMuc2V0TmFtZVJlc3BvbnNlKCBuYW1lUmVzcG9uc2UgKTsgfVxuXG4gIHB1YmxpYyBzZXROYW1lUmVzcG9uc2UoIG5hbWVSZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlICk6IHZvaWQge1xuICAgIHRoaXMuX25hbWVSZXNwb25zZSA9IG5hbWVSZXNwb25zZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRPYmplY3RSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlIHtcbiAgICByZXR1cm4gUmVzcG9uc2VQYWNrZXQuZ2V0UmVzcG9uc2VUZXh0KCB0aGlzLl9vYmplY3RSZXNwb25zZSApO1xuICB9XG5cbiAgcHVibGljIGdldCBvYmplY3RSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlIHsgcmV0dXJuIHRoaXMuZ2V0T2JqZWN0UmVzcG9uc2UoKTsgfVxuXG4gIHB1YmxpYyBzZXQgb2JqZWN0UmVzcG9uc2UoIG9iamVjdFJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKSB7IHRoaXMuc2V0T2JqZWN0UmVzcG9uc2UoIG9iamVjdFJlc3BvbnNlICk7IH1cblxuICBwdWJsaWMgc2V0T2JqZWN0UmVzcG9uc2UoIG9iamVjdFJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKTogdm9pZCB7XG4gICAgdGhpcy5fb2JqZWN0UmVzcG9uc2UgPSBvYmplY3RSZXNwb25zZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRDb250ZXh0UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7XG4gICAgcmV0dXJuIFJlc3BvbnNlUGFja2V0LmdldFJlc3BvbnNlVGV4dCggdGhpcy5fY29udGV4dFJlc3BvbnNlICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNvbnRleHRSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlIHsgcmV0dXJuIHRoaXMuZ2V0Q29udGV4dFJlc3BvbnNlKCk7IH1cblxuICBwdWJsaWMgc2V0IGNvbnRleHRSZXNwb25zZSggY29udGV4dFJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKSB7IHRoaXMuc2V0Q29udGV4dFJlc3BvbnNlKCBjb250ZXh0UmVzcG9uc2UgKTsgfVxuXG4gIHB1YmxpYyBzZXRDb250ZXh0UmVzcG9uc2UoIGNvbnRleHRSZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlICk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRleHRSZXNwb25zZSA9IGNvbnRleHRSZXNwb25zZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRIaW50UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7XG4gICAgcmV0dXJuIFJlc3BvbnNlUGFja2V0LmdldFJlc3BvbnNlVGV4dCggdGhpcy5faGludFJlc3BvbnNlICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpbnRSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlIHsgcmV0dXJuIHRoaXMuZ2V0SGludFJlc3BvbnNlKCk7IH1cblxuICBwdWJsaWMgc2V0IGhpbnRSZXNwb25zZSggaGludFJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKSB7IHRoaXMuc2V0SGludFJlc3BvbnNlKCBoaW50UmVzcG9uc2UgKTsgfVxuXG4gIHB1YmxpYyBzZXRIaW50UmVzcG9uc2UoIGhpbnRSZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlICk6IHZvaWQge1xuICAgIHRoaXMuX2hpbnRSZXNwb25zZSA9IGhpbnRSZXNwb25zZTtcbiAgfVxuXG4gIC8vIE1hcCBWb2ljaW5nUmVzcG9uc2UgLT4gUmVzb2x2ZWRSZXNwb25zZSAocmVzb2x2ZSBmdW5jdGlvbnMgYW5kIFByb3BlcnRpZXMgdG8gdGhlaXIgdmFsdWVzKVxuICBwdWJsaWMgc3RhdGljIGdldFJlc3BvbnNlVGV4dCggcmVzcG9uc2U6IFZvaWNpbmdSZXNwb25zZSApOiBSZXNvbHZlZFJlc3BvbnNlIHtcbiAgICByZXR1cm4gaXNUUmVhZE9ubHlQcm9wZXJ0eSggcmVzcG9uc2UgKSA/IHJlc3BvbnNlLnZhbHVlIDpcbiAgICAgICAgICAgdHlwZW9mIHJlc3BvbnNlID09PSAnZnVuY3Rpb24nID8gcmVzcG9uc2UoKSA6IHJlc3BvbnNlO1xuICB9XG5cbiAgcHVibGljIGNvcHkoKTogUmVzcG9uc2VQYWNrZXQge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2VQYWNrZXQoIHRoaXMuc2VyaWFsaXplKCkgKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogUmVxdWlyZWQ8U3BlYWthYmxlTnVsbGFibGVSZXNvbHZlZE9wdGlvbnM+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZVJlc3BvbnNlOiB0aGlzLm5hbWVSZXNwb25zZSxcbiAgICAgIG9iamVjdFJlc3BvbnNlOiB0aGlzLm9iamVjdFJlc3BvbnNlLFxuICAgICAgY29udGV4dFJlc3BvbnNlOiB0aGlzLmNvbnRleHRSZXNwb25zZSxcbiAgICAgIGhpbnRSZXNwb25zZTogdGhpcy5oaW50UmVzcG9uc2UsXG4gICAgICBpZ25vcmVQcm9wZXJ0aWVzOiB0aGlzLmlnbm9yZVByb3BlcnRpZXMsXG4gICAgICByZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uOiB0aGlzLnJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb25cbiAgICB9O1xuICB9XG59XG5cbnV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlLnJlZ2lzdGVyKCAnUmVzcG9uc2VQYWNrZXQnLCBSZXNwb25zZVBhY2tldCApO1xuZXhwb3J0IGRlZmF1bHQgUmVzcG9uc2VQYWNrZXQ7Il0sIm5hbWVzIjpbImlzVFJlYWRPbmx5UHJvcGVydHkiLCJvcHRpb25pemUzIiwiUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsInV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlIiwiREVGQVVMVF9PUFRJT05TIiwibmFtZVJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJjb250ZXh0UmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJpZ25vcmVQcm9wZXJ0aWVzIiwicmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsIkRFRkFVTFRfUkVTUE9OU0VfUEFUVEVSTlMiLCJSZXNwb25zZVBhY2tldCIsImdldE5hbWVSZXNwb25zZSIsImdldFJlc3BvbnNlVGV4dCIsIl9uYW1lUmVzcG9uc2UiLCJzZXROYW1lUmVzcG9uc2UiLCJnZXRPYmplY3RSZXNwb25zZSIsIl9vYmplY3RSZXNwb25zZSIsInNldE9iamVjdFJlc3BvbnNlIiwiZ2V0Q29udGV4dFJlc3BvbnNlIiwiX2NvbnRleHRSZXNwb25zZSIsInNldENvbnRleHRSZXNwb25zZSIsImdldEhpbnRSZXNwb25zZSIsIl9oaW50UmVzcG9uc2UiLCJzZXRIaW50UmVzcG9uc2UiLCJyZXNwb25zZSIsInZhbHVlIiwiY29weSIsInNlcmlhbGl6ZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUVELFNBQTRCQSxtQkFBbUIsUUFBUSxxQ0FBcUM7QUFDNUYsU0FBU0MsVUFBVSxRQUEyQixrQ0FBa0M7QUFDaEYsT0FBT0MsK0JBQStCLGlDQUFpQztBQUN2RSxPQUFPQyw2QkFBNkIsK0JBQStCO0FBa0RuRSxnR0FBZ0c7QUFDaEcsTUFBTUMsa0JBQXVFO0lBQzNFQyxjQUFjO0lBQ2RDLGdCQUFnQjtJQUNoQkMsaUJBQWlCO0lBQ2pCQyxjQUFjO0lBQ2RDLGtCQUFrQjtJQUVsQixvRkFBb0Y7SUFDcEYsd0dBQXdHO0lBQ3hHLHlDQUF5QztJQUN6Q0MsMkJBQTJCUiwwQkFBMEJT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