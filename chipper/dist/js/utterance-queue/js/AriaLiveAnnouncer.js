// Copyright 2019-2024, University of Colorado Boulder
/**
 * A static object used to send aria-live updates to a screen reader. These are alerts that are independent of user
 * focus. This will create and reference 'aria-live' elements in the HTML document and update their content. You
 * will need to get these elements and add them to the document through a reference to this.ariaLiveElements.
 * A number of elements such as the following are created and used:
 *
 *    <p id="elements-1-polite-1" aria-live="polite"></p>
 *    <p id="elements-1-polite-2" aria-live="polite"></p>
 *    <p id="elements-1-polite-3" aria-live="polite"></p>
 *    <p id="elements-1-polite-4" aria-live="polite"></p>
 *
 *    <p id="elements-1-assertive-1" aria-live="assertive"></p>
 *    <p id="elements-1-assertive-2" aria-live="assertive"></p>
 *    <p id="elements-1-assertive-3" aria-live="assertive"></p>
 *    <p id="elements-1-assertive-4" aria-live="assertive"></p>
 *
 * It was discovered that cycling through using these elements prevented a VoiceOver bug where alerts would interrupt
 * each other. Starting from the first element, content is set on each element in order and cycles through.
 *
 * Many aria-live and related attributes were tested, but none were well supported or particularly useful for PhET sims,
 * see https://github.com/phetsims/chipper/issues/472.
 *
 * @author Jesse Greenberg
 * @author John Blanco
 */ import stepTimer from '../../axon/js/stepTimer.js';
import { isTReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import optionize from '../../phet-core/js/optionize.js';
import platform from '../../phet-core/js/platform.js';
import { PDOMUtils } from '../../scenery/js/imports.js';
import Announcer from './Announcer.js';
import utteranceQueueNamespace from './utteranceQueueNamespace.js';
// constants
const NUMBER_OF_ARIA_LIVE_ELEMENTS = 4;
// one indexed for the element ids, unique to each AriaLiveAnnouncer instance
let ariaLiveAnnouncerIndex = 1;
// Possible supported values for the `aria-live` attributes created in AriaLiveAnnouncer.
export class AriaLive extends EnumerationValue {
    constructor(attributeString){
        super(), this.attributeString = attributeString;
    }
}
AriaLive.POLITE = new AriaLive('polite');
AriaLive.ASSERTIVE = new AriaLive('assertive');
AriaLive.enumeration = new Enumeration(AriaLive);
utteranceQueueNamespace.register('AriaLive', AriaLive);
/**
 * @returns - a container holding each aria-live elements created
 */ function createBatchOfPriorityLiveElements(ariaLivePriority) {
    const priority = ariaLivePriority.attributeString;
    const container = document.createElement('div');
    for(let i = 1; i <= NUMBER_OF_ARIA_LIVE_ELEMENTS; i++){
        const newParagraph = document.createElement('p');
        newParagraph.setAttribute('id', `elements-${ariaLiveAnnouncerIndex}-${priority}-${i}`);
        // set aria-live on individual paragraph elements to prevent VoiceOver from interrupting alerts, see
        // https://github.com/phetsims/molecules-and-light/issues/235
        newParagraph.setAttribute('aria-live', priority);
        container.appendChild(newParagraph);
    }
    return container;
}
let AriaLiveAnnouncer = class AriaLiveAnnouncer extends Announcer {
    /**
   * Announce an alert, setting textContent to an aria-live element.
   */ announce(announceText, utterance, providedOptions) {
        const options = optionize()({
            // By default, alert to a polite aria-live element
            ariaLivePriority: AriaLive.POLITE
        }, providedOptions);
        // aria-live and AT has no API to detect successful speech, we can only assume every announce is successful
        this.hasSpoken = true;
        // Don't update if null
        if (announceText) {
            if (isTReadOnlyProperty(announceText)) {
                announceText = announceText.value;
            }
            if (options.ariaLivePriority === AriaLive.POLITE) {
                const element = this.politeElements[this.politeElementIndex];
                this.updateLiveElement(element, announceText, utterance);
                // update index for next time
                this.politeElementIndex = (this.politeElementIndex + 1) % this.politeElements.length;
            } else if (options.ariaLivePriority === AriaLive.ASSERTIVE) {
                const element = this.assertiveElements[this.assertiveElementIndex];
                this.updateLiveElement(element, announceText, utterance);
                // update index for next time
                this.assertiveElementIndex = (this.assertiveElementIndex + 1) % this.assertiveElements.length;
            } else {
                assert && assert(false, 'unsupported aria live prioirity');
            }
        }
        // With aria-live we don't have information about when the screen reader is done speaking
        // the content, so we have to emit this right away
        this.announcementCompleteEmitter.emit(utterance, announceText);
    }
    /**
   * The implementation of cancel for AriaLiveAnnouncer. We do not know whether the AT is speaking content so
   * this function is a no-op for aria-live.
   */ cancel() {
    // See docs
    }
    /**
   * The implementation of cancelUtterance for AriaLiveAnnouncer. We do not know whether the AT is speaking content so
   * this function is a no-op for aria-live.
   */ cancelUtterance(utterance) {
    // See docs
    }
    /**
   * Update an element with the 'aria-live' attribute by setting its text content.
   *
   * @param liveElement - the HTML element that will send the alert to the assistive technology
   * @param textContent - the content to be announced
   * @param utterance
   */ updateLiveElement(liveElement, textContent, utterance) {
        // fully clear the old textContent so that sequential alerts with identical text will be announced, which
        // some screen readers might have prevented
        liveElement.textContent = '';
        // element must be visible for alerts to be spoken
        liveElement.hidden = false;
        // UtteranceQueue cannot announce again until after the following timeouts.
        this.readyToAnnounce = false;
        // must be done asynchronously from setting hidden above or else the screen reader
        // will fail to read the content
        stepTimer.setTimeout(()=>{
            // make sure that the utterance is not out of date right before it is actually sent to assistive technology
            if (utterance.predicate()) {
                PDOMUtils.setTextContent(liveElement, textContent);
                // Hide the content so that it cant be read with the virtual cursor. Must be done
                // behind at least 200 ms delay or else alerts may be missed by NVDA and VoiceOver, see
                // https://github.com/phetsims/scenery-phet/issues/491
                stepTimer.setTimeout(()=>{
                    if (platform.safari && !platform.mobileSafari) {
                        // Using `hidden` rather than clearing textContent works better macOS VO,
                        // see https://github.com/phetsims/scenery-phet/issues/490
                        // However, it prevents all alerts on iOS VO, see https://github.com/phetsims/utterance-queue/issues/117
                        liveElement.hidden = true;
                    } else {
                        liveElement.textContent = '';
                    }
                    // Wait until after this timeout to let the UtteranceQueue can announce Utterances again. This delay
                    // seems to be necessary to force VoiceOver to speak aria-live alerts in first-in-first-out order.
                    // See https://github.com/phetsims/utterance-queue/issues/88
                    this.readyToAnnounce = true;
                }, AriaLiveAnnouncer.ARIA_LIVE_DELAY);
            } else {
                this.readyToAnnounce = true; // If the predicate fails, we are ready to announce again.
            }
        }, 0);
    }
    constructor(providedOptions){
        const options = optionize()({
            // By default, don't care about response collector Properties, as they are designed for Voicing more than
            // aria-live description.
            respectResponseCollectorProperties: false,
            lang: 'en'
        }, providedOptions);
        super(options);
        this.politeElementIndex = 0;
        this.assertiveElementIndex = 0;
        this.ariaLiveContainer = document.createElement('div'); //container div
        this.ariaLiveContainer.setAttribute('lang', options.lang);
        this.ariaLiveContainer.setAttribute('id', `aria-live-elements-${ariaLiveAnnouncerIndex}`);
        this.ariaLiveContainer.setAttribute('style', 'position: absolute; left: 0px; top: 0px; width: 0px; height: 0px; ' + 'clip: rect(0px 0px 0px 0px); pointer-events: none;');
        // By having four elements and cycling through each one, we can get around a VoiceOver bug where a new
        // alert would interrupt the previous alert if it wasn't finished speaking, see https://github.com/phetsims/scenery-phet/issues/362
        const politeElementContainer = createBatchOfPriorityLiveElements(AriaLive.POLITE);
        const assertiveElementContainer = createBatchOfPriorityLiveElements(AriaLive.ASSERTIVE);
        this.ariaLiveContainer.appendChild(politeElementContainer);
        this.ariaLiveContainer.appendChild(assertiveElementContainer);
        this.politeElements = Array.from(politeElementContainer.children);
        this.assertiveElements = Array.from(assertiveElementContainer.children);
        // increment index so the next AriaLiveAnnouncer instance has different ids for its elements.
        ariaLiveAnnouncerIndex++;
    }
};
// The Announcer only speaks one Utterance per this interval or else VoiceOver reads alerts out of order.
// This is also the interval at which alert content is cleared from the DOM once set so that it cannot be found
// with the virtual cursor after setting.
AriaLiveAnnouncer.ARIA_LIVE_DELAY = 200;
// Possible values for the `aria-live` attribute (priority) that can be alerted (like "polite" and
// "assertive"), see AriaLiveAnnounceOptions for details.
AriaLiveAnnouncer.AriaLive = AriaLive;
utteranceQueueNamespace.register('AriaLiveAnnouncer', AriaLiveAnnouncer);
export default AriaLiveAnnouncer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9BcmlhTGl2ZUFubm91bmNlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHN0YXRpYyBvYmplY3QgdXNlZCB0byBzZW5kIGFyaWEtbGl2ZSB1cGRhdGVzIHRvIGEgc2NyZWVuIHJlYWRlci4gVGhlc2UgYXJlIGFsZXJ0cyB0aGF0IGFyZSBpbmRlcGVuZGVudCBvZiB1c2VyXG4gKiBmb2N1cy4gVGhpcyB3aWxsIGNyZWF0ZSBhbmQgcmVmZXJlbmNlICdhcmlhLWxpdmUnIGVsZW1lbnRzIGluIHRoZSBIVE1MIGRvY3VtZW50IGFuZCB1cGRhdGUgdGhlaXIgY29udGVudC4gWW91XG4gKiB3aWxsIG5lZWQgdG8gZ2V0IHRoZXNlIGVsZW1lbnRzIGFuZCBhZGQgdGhlbSB0byB0aGUgZG9jdW1lbnQgdGhyb3VnaCBhIHJlZmVyZW5jZSB0byB0aGlzLmFyaWFMaXZlRWxlbWVudHMuXG4gKiBBIG51bWJlciBvZiBlbGVtZW50cyBzdWNoIGFzIHRoZSBmb2xsb3dpbmcgYXJlIGNyZWF0ZWQgYW5kIHVzZWQ6XG4gKlxuICogICAgPHAgaWQ9XCJlbGVtZW50cy0xLXBvbGl0ZS0xXCIgYXJpYS1saXZlPVwicG9saXRlXCI+PC9wPlxuICogICAgPHAgaWQ9XCJlbGVtZW50cy0xLXBvbGl0ZS0yXCIgYXJpYS1saXZlPVwicG9saXRlXCI+PC9wPlxuICogICAgPHAgaWQ9XCJlbGVtZW50cy0xLXBvbGl0ZS0zXCIgYXJpYS1saXZlPVwicG9saXRlXCI+PC9wPlxuICogICAgPHAgaWQ9XCJlbGVtZW50cy0xLXBvbGl0ZS00XCIgYXJpYS1saXZlPVwicG9saXRlXCI+PC9wPlxuICpcbiAqICAgIDxwIGlkPVwiZWxlbWVudHMtMS1hc3NlcnRpdmUtMVwiIGFyaWEtbGl2ZT1cImFzc2VydGl2ZVwiPjwvcD5cbiAqICAgIDxwIGlkPVwiZWxlbWVudHMtMS1hc3NlcnRpdmUtMlwiIGFyaWEtbGl2ZT1cImFzc2VydGl2ZVwiPjwvcD5cbiAqICAgIDxwIGlkPVwiZWxlbWVudHMtMS1hc3NlcnRpdmUtM1wiIGFyaWEtbGl2ZT1cImFzc2VydGl2ZVwiPjwvcD5cbiAqICAgIDxwIGlkPVwiZWxlbWVudHMtMS1hc3NlcnRpdmUtNFwiIGFyaWEtbGl2ZT1cImFzc2VydGl2ZVwiPjwvcD5cbiAqXG4gKiBJdCB3YXMgZGlzY292ZXJlZCB0aGF0IGN5Y2xpbmcgdGhyb3VnaCB1c2luZyB0aGVzZSBlbGVtZW50cyBwcmV2ZW50ZWQgYSBWb2ljZU92ZXIgYnVnIHdoZXJlIGFsZXJ0cyB3b3VsZCBpbnRlcnJ1cHRcbiAqIGVhY2ggb3RoZXIuIFN0YXJ0aW5nIGZyb20gdGhlIGZpcnN0IGVsZW1lbnQsIGNvbnRlbnQgaXMgc2V0IG9uIGVhY2ggZWxlbWVudCBpbiBvcmRlciBhbmQgY3ljbGVzIHRocm91Z2guXG4gKlxuICogTWFueSBhcmlhLWxpdmUgYW5kIHJlbGF0ZWQgYXR0cmlidXRlcyB3ZXJlIHRlc3RlZCwgYnV0IG5vbmUgd2VyZSB3ZWxsIHN1cHBvcnRlZCBvciBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBQaEVUIHNpbXMsXG4gKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzQ3Mi5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICovXG5cbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IHsgaXNUUmVhZE9ubHlQcm9wZXJ0eSB9IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgeyBQRE9NVXRpbHMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFubm91bmNlciwgeyBBbm5vdW5jZXJBbm5vdW5jZU9wdGlvbnMsIEFubm91bmNlck9wdGlvbnMgfSBmcm9tICcuL0Fubm91bmNlci5qcyc7XG5pbXBvcnQgeyBSZXNvbHZlZFJlc3BvbnNlIH0gZnJvbSAnLi9SZXNwb25zZVBhY2tldC5qcyc7XG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4vVXR0ZXJhbmNlLmpzJztcbmltcG9ydCB1dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZSBmcm9tICcuL3V0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBOVU1CRVJfT0ZfQVJJQV9MSVZFX0VMRU1FTlRTID0gNDtcblxuLy8gb25lIGluZGV4ZWQgZm9yIHRoZSBlbGVtZW50IGlkcywgdW5pcXVlIHRvIGVhY2ggQXJpYUxpdmVBbm5vdW5jZXIgaW5zdGFuY2VcbmxldCBhcmlhTGl2ZUFubm91bmNlckluZGV4ID0gMTtcblxuLy8gUG9zc2libGUgc3VwcG9ydGVkIHZhbHVlcyBmb3IgdGhlIGBhcmlhLWxpdmVgIGF0dHJpYnV0ZXMgY3JlYXRlZCBpbiBBcmlhTGl2ZUFubm91bmNlci5cbmV4cG9ydCBjbGFzcyBBcmlhTGl2ZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHB1YmxpYyByZWFkb25seSBhdHRyaWJ1dGVTdHJpbmc6IHN0cmluZyApIHsgc3VwZXIoKTt9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQT0xJVEUgPSBuZXcgQXJpYUxpdmUoICdwb2xpdGUnICk7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQVNTRVJUSVZFID0gbmV3IEFyaWFMaXZlKCAnYXNzZXJ0aXZlJyApO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIEFyaWFMaXZlICk7XG59XG5cbnV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlLnJlZ2lzdGVyKCAnQXJpYUxpdmUnLCBBcmlhTGl2ZSApO1xuXG4vLyBPcHRpb25zIGZvciB0aGUgYW5ub3VuY2UgbWV0aG9kXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBhcmlhTGl2ZVByaW9yaXR5PzogQXJpYUxpdmU7XG59O1xudHlwZSBBcmlhTGl2ZUFubm91bmNlckFubm91bmNlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQW5ub3VuY2VyQW5ub3VuY2VPcHRpb25zO1xuXG4vKipcbiAqIEByZXR1cm5zIC0gYSBjb250YWluZXIgaG9sZGluZyBlYWNoIGFyaWEtbGl2ZSBlbGVtZW50cyBjcmVhdGVkXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhdGNoT2ZQcmlvcml0eUxpdmVFbGVtZW50cyggYXJpYUxpdmVQcmlvcml0eTogQXJpYUxpdmUgKTogSFRNTERpdkVsZW1lbnQge1xuICBjb25zdCBwcmlvcml0eSA9IGFyaWFMaXZlUHJpb3JpdHkuYXR0cmlidXRlU3RyaW5nO1xuICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICBmb3IgKCBsZXQgaSA9IDE7IGkgPD0gTlVNQkVSX09GX0FSSUFfTElWRV9FTEVNRU5UUzsgaSsrICkge1xuICAgIGNvbnN0IG5ld1BhcmFncmFwaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdwJyApO1xuICAgIG5ld1BhcmFncmFwaC5zZXRBdHRyaWJ1dGUoICdpZCcsIGBlbGVtZW50cy0ke2FyaWFMaXZlQW5ub3VuY2VySW5kZXh9LSR7cHJpb3JpdHl9LSR7aX1gICk7XG5cbiAgICAvLyBzZXQgYXJpYS1saXZlIG9uIGluZGl2aWR1YWwgcGFyYWdyYXBoIGVsZW1lbnRzIHRvIHByZXZlbnQgVm9pY2VPdmVyIGZyb20gaW50ZXJydXB0aW5nIGFsZXJ0cywgc2VlXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21vbGVjdWxlcy1hbmQtbGlnaHQvaXNzdWVzLzIzNVxuICAgIG5ld1BhcmFncmFwaC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxpdmUnLCBwcmlvcml0eSApO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCggbmV3UGFyYWdyYXBoICk7XG4gIH1cblxuICByZXR1cm4gY29udGFpbmVyO1xufVxuXG50eXBlIEFyaWFMaXZlQW5ub3VuY2VyU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gVGhlIGxhbmd1YWdlIGZvciB5b3VyIGNvbnRlbnQuIENoYW5naW5nIHRoaXMgd2lsbCBpbXBhY3QgdGhlIHNwZWVjaCBlbmdpbmUgb2YgYSBzY3JlZW4gcmVhZGVyLlxuICBsYW5nPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgQXJpYUxpdmVBbm5vdW5jZXJPcHRpb25zID0gQXJpYUxpdmVBbm5vdW5jZXJTZWxmT3B0aW9ucyAmIEFubm91bmNlck9wdGlvbnM7XG5cbmNsYXNzIEFyaWFMaXZlQW5ub3VuY2VyIGV4dGVuZHMgQW5ub3VuY2VyIHtcblxuICAvLyBpbmRleCBvZiBjdXJyZW50IGFyaWEtbGl2ZSBlbGVtZW50IHRvIHVzZSwgdXBkYXRlZCBldmVyeSB0aW1lIGFuIGV2ZW50IHRyaWdnZXJzXG4gIHByaXZhdGUgcG9saXRlRWxlbWVudEluZGV4OiBudW1iZXI7XG4gIHByaXZhdGUgYXNzZXJ0aXZlRWxlbWVudEluZGV4OiBudW1iZXI7XG5cbiAgcHVibGljIHJlYWRvbmx5IGFyaWFMaXZlQ29udGFpbmVyOiBIVE1MRGl2RWxlbWVudDtcblxuICAvLyBET00gZWxlbWVudHMgd2hpY2ggd2lsbCByZWNlaXZlIHRoZSB1cGRhdGVkIGNvbnRlbnQuXG4gIHByaXZhdGUgcmVhZG9ubHkgcG9saXRlRWxlbWVudHM6IEhUTUxFbGVtZW50W107XG4gIHByaXZhdGUgcmVhZG9ubHkgYXNzZXJ0aXZlRWxlbWVudHM6IEhUTUxFbGVtZW50W107XG5cbiAgLy8gVGhlIEFubm91bmNlciBvbmx5IHNwZWFrcyBvbmUgVXR0ZXJhbmNlIHBlciB0aGlzIGludGVydmFsIG9yIGVsc2UgVm9pY2VPdmVyIHJlYWRzIGFsZXJ0cyBvdXQgb2Ygb3JkZXIuXG4gIC8vIFRoaXMgaXMgYWxzbyB0aGUgaW50ZXJ2YWwgYXQgd2hpY2ggYWxlcnQgY29udGVudCBpcyBjbGVhcmVkIGZyb20gdGhlIERPTSBvbmNlIHNldCBzbyB0aGF0IGl0IGNhbm5vdCBiZSBmb3VuZFxuICAvLyB3aXRoIHRoZSB2aXJ0dWFsIGN1cnNvciBhZnRlciBzZXR0aW5nLlxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFSSUFfTElWRV9ERUxBWSA9IDIwMDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEFyaWFMaXZlQW5ub3VuY2VyT3B0aW9ucyApIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEFyaWFMaXZlQW5ub3VuY2VyT3B0aW9ucywgQXJpYUxpdmVBbm5vdW5jZXJTZWxmT3B0aW9ucywgQW5ub3VuY2VyT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBCeSBkZWZhdWx0LCBkb24ndCBjYXJlIGFib3V0IHJlc3BvbnNlIGNvbGxlY3RvciBQcm9wZXJ0aWVzLCBhcyB0aGV5IGFyZSBkZXNpZ25lZCBmb3IgVm9pY2luZyBtb3JlIHRoYW5cbiAgICAgIC8vIGFyaWEtbGl2ZSBkZXNjcmlwdGlvbi5cbiAgICAgIHJlc3BlY3RSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXM6IGZhbHNlLFxuICAgICAgbGFuZzogJ2VuJ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMucG9saXRlRWxlbWVudEluZGV4ID0gMDtcbiAgICB0aGlzLmFzc2VydGl2ZUVsZW1lbnRJbmRleCA9IDA7XG5cbiAgICB0aGlzLmFyaWFMaXZlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTsgLy9jb250YWluZXIgZGl2XG4gICAgdGhpcy5hcmlhTGl2ZUNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoICdsYW5nJywgb3B0aW9ucy5sYW5nICk7XG4gICAgdGhpcy5hcmlhTGl2ZUNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoICdpZCcsIGBhcmlhLWxpdmUtZWxlbWVudHMtJHthcmlhTGl2ZUFubm91bmNlckluZGV4fWAgKTtcbiAgICB0aGlzLmFyaWFMaXZlQ29udGFpbmVyLnNldEF0dHJpYnV0ZSggJ3N0eWxlJywgJ3Bvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMHB4OyB0b3A6IDBweDsgd2lkdGg6IDBweDsgaGVpZ2h0OiAwcHg7ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xpcDogcmVjdCgwcHggMHB4IDBweCAwcHgpOyBwb2ludGVyLWV2ZW50czogbm9uZTsnICk7XG5cbiAgICAvLyBCeSBoYXZpbmcgZm91ciBlbGVtZW50cyBhbmQgY3ljbGluZyB0aHJvdWdoIGVhY2ggb25lLCB3ZSBjYW4gZ2V0IGFyb3VuZCBhIFZvaWNlT3ZlciBidWcgd2hlcmUgYSBuZXdcbiAgICAvLyBhbGVydCB3b3VsZCBpbnRlcnJ1cHQgdGhlIHByZXZpb3VzIGFsZXJ0IGlmIGl0IHdhc24ndCBmaW5pc2hlZCBzcGVha2luZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzM2MlxuICAgIGNvbnN0IHBvbGl0ZUVsZW1lbnRDb250YWluZXIgPSBjcmVhdGVCYXRjaE9mUHJpb3JpdHlMaXZlRWxlbWVudHMoIEFyaWFMaXZlLlBPTElURSApO1xuICAgIGNvbnN0IGFzc2VydGl2ZUVsZW1lbnRDb250YWluZXIgPSBjcmVhdGVCYXRjaE9mUHJpb3JpdHlMaXZlRWxlbWVudHMoIEFyaWFMaXZlLkFTU0VSVElWRSApO1xuXG4gICAgdGhpcy5hcmlhTGl2ZUNvbnRhaW5lci5hcHBlbmRDaGlsZCggcG9saXRlRWxlbWVudENvbnRhaW5lciApO1xuICAgIHRoaXMuYXJpYUxpdmVDb250YWluZXIuYXBwZW5kQ2hpbGQoIGFzc2VydGl2ZUVsZW1lbnRDb250YWluZXIgKTtcblxuICAgIHRoaXMucG9saXRlRWxlbWVudHMgPSBBcnJheS5mcm9tKCBwb2xpdGVFbGVtZW50Q29udGFpbmVyLmNoaWxkcmVuICkgYXMgSFRNTEVsZW1lbnRbXTtcbiAgICB0aGlzLmFzc2VydGl2ZUVsZW1lbnRzID0gQXJyYXkuZnJvbSggYXNzZXJ0aXZlRWxlbWVudENvbnRhaW5lci5jaGlsZHJlbiApIGFzIEhUTUxFbGVtZW50W107XG5cbiAgICAvLyBpbmNyZW1lbnQgaW5kZXggc28gdGhlIG5leHQgQXJpYUxpdmVBbm5vdW5jZXIgaW5zdGFuY2UgaGFzIGRpZmZlcmVudCBpZHMgZm9yIGl0cyBlbGVtZW50cy5cbiAgICBhcmlhTGl2ZUFubm91bmNlckluZGV4Kys7XG4gIH1cblxuICAvKipcbiAgICogQW5ub3VuY2UgYW4gYWxlcnQsIHNldHRpbmcgdGV4dENvbnRlbnQgdG8gYW4gYXJpYS1saXZlIGVsZW1lbnQuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgYW5ub3VuY2UoIGFubm91bmNlVGV4dDogUmVzb2x2ZWRSZXNwb25zZSwgdXR0ZXJhbmNlOiBVdHRlcmFuY2UsIHByb3ZpZGVkT3B0aW9ucz86IEFyaWFMaXZlQW5ub3VuY2VyQW5ub3VuY2VPcHRpb25zICk6IHZvaWQge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxBcmlhTGl2ZUFubm91bmNlckFubm91bmNlT3B0aW9ucywgU2VsZk9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gQnkgZGVmYXVsdCwgYWxlcnQgdG8gYSBwb2xpdGUgYXJpYS1saXZlIGVsZW1lbnRcbiAgICAgIGFyaWFMaXZlUHJpb3JpdHk6IEFyaWFMaXZlLlBPTElURVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gYXJpYS1saXZlIGFuZCBBVCBoYXMgbm8gQVBJIHRvIGRldGVjdCBzdWNjZXNzZnVsIHNwZWVjaCwgd2UgY2FuIG9ubHkgYXNzdW1lIGV2ZXJ5IGFubm91bmNlIGlzIHN1Y2Nlc3NmdWxcbiAgICB0aGlzLmhhc1Nwb2tlbiA9IHRydWU7XG5cbiAgICAvLyBEb24ndCB1cGRhdGUgaWYgbnVsbFxuICAgIGlmICggYW5ub3VuY2VUZXh0ICkge1xuICAgICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCBhbm5vdW5jZVRleHQgKSApIHtcbiAgICAgICAgYW5ub3VuY2VUZXh0ID0gYW5ub3VuY2VUZXh0LnZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIG9wdGlvbnMuYXJpYUxpdmVQcmlvcml0eSA9PT0gQXJpYUxpdmUuUE9MSVRFICkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5wb2xpdGVFbGVtZW50c1sgdGhpcy5wb2xpdGVFbGVtZW50SW5kZXggXTtcbiAgICAgICAgdGhpcy51cGRhdGVMaXZlRWxlbWVudCggZWxlbWVudCwgYW5ub3VuY2VUZXh0LCB1dHRlcmFuY2UgKTtcblxuICAgICAgICAvLyB1cGRhdGUgaW5kZXggZm9yIG5leHQgdGltZVxuICAgICAgICB0aGlzLnBvbGl0ZUVsZW1lbnRJbmRleCA9ICggdGhpcy5wb2xpdGVFbGVtZW50SW5kZXggKyAxICkgJSB0aGlzLnBvbGl0ZUVsZW1lbnRzLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBvcHRpb25zLmFyaWFMaXZlUHJpb3JpdHkgPT09IEFyaWFMaXZlLkFTU0VSVElWRSApIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuYXNzZXJ0aXZlRWxlbWVudHNbIHRoaXMuYXNzZXJ0aXZlRWxlbWVudEluZGV4IF07XG4gICAgICAgIHRoaXMudXBkYXRlTGl2ZUVsZW1lbnQoIGVsZW1lbnQsIGFubm91bmNlVGV4dCwgdXR0ZXJhbmNlICk7XG4gICAgICAgIC8vIHVwZGF0ZSBpbmRleCBmb3IgbmV4dCB0aW1lXG4gICAgICAgIHRoaXMuYXNzZXJ0aXZlRWxlbWVudEluZGV4ID0gKCB0aGlzLmFzc2VydGl2ZUVsZW1lbnRJbmRleCArIDEgKSAlIHRoaXMuYXNzZXJ0aXZlRWxlbWVudHMubGVuZ3RoO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAndW5zdXBwb3J0ZWQgYXJpYSBsaXZlIHByaW9pcml0eScgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXaXRoIGFyaWEtbGl2ZSB3ZSBkb24ndCBoYXZlIGluZm9ybWF0aW9uIGFib3V0IHdoZW4gdGhlIHNjcmVlbiByZWFkZXIgaXMgZG9uZSBzcGVha2luZ1xuICAgIC8vIHRoZSBjb250ZW50LCBzbyB3ZSBoYXZlIHRvIGVtaXQgdGhpcyByaWdodCBhd2F5XG4gICAgdGhpcy5hbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXIuZW1pdCggdXR0ZXJhbmNlLCBhbm5vdW5jZVRleHQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW1wbGVtZW50YXRpb24gb2YgY2FuY2VsIGZvciBBcmlhTGl2ZUFubm91bmNlci4gV2UgZG8gbm90IGtub3cgd2hldGhlciB0aGUgQVQgaXMgc3BlYWtpbmcgY29udGVudCBzb1xuICAgKiB0aGlzIGZ1bmN0aW9uIGlzIGEgbm8tb3AgZm9yIGFyaWEtbGl2ZS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjYW5jZWwoKTogdm9pZCB7XG4gICAgLy8gU2VlIGRvY3NcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW1wbGVtZW50YXRpb24gb2YgY2FuY2VsVXR0ZXJhbmNlIGZvciBBcmlhTGl2ZUFubm91bmNlci4gV2UgZG8gbm90IGtub3cgd2hldGhlciB0aGUgQVQgaXMgc3BlYWtpbmcgY29udGVudCBzb1xuICAgKiB0aGlzIGZ1bmN0aW9uIGlzIGEgbm8tb3AgZm9yIGFyaWEtbGl2ZS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjYW5jZWxVdHRlcmFuY2UoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICk6IHZvaWQge1xuICAgIC8vIFNlZSBkb2NzXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGFuIGVsZW1lbnQgd2l0aCB0aGUgJ2FyaWEtbGl2ZScgYXR0cmlidXRlIGJ5IHNldHRpbmcgaXRzIHRleHQgY29udGVudC5cbiAgICpcbiAgICogQHBhcmFtIGxpdmVFbGVtZW50IC0gdGhlIEhUTUwgZWxlbWVudCB0aGF0IHdpbGwgc2VuZCB0aGUgYWxlcnQgdG8gdGhlIGFzc2lzdGl2ZSB0ZWNobm9sb2d5XG4gICAqIEBwYXJhbSB0ZXh0Q29udGVudCAtIHRoZSBjb250ZW50IHRvIGJlIGFubm91bmNlZFxuICAgKiBAcGFyYW0gdXR0ZXJhbmNlXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZUxpdmVFbGVtZW50KCBsaXZlRWxlbWVudDogSFRNTEVsZW1lbnQsIHRleHRDb250ZW50OiBzdHJpbmcgfCBudW1iZXIsIHV0dGVyYW5jZTogVXR0ZXJhbmNlICk6IHZvaWQge1xuXG4gICAgLy8gZnVsbHkgY2xlYXIgdGhlIG9sZCB0ZXh0Q29udGVudCBzbyB0aGF0IHNlcXVlbnRpYWwgYWxlcnRzIHdpdGggaWRlbnRpY2FsIHRleHQgd2lsbCBiZSBhbm5vdW5jZWQsIHdoaWNoXG4gICAgLy8gc29tZSBzY3JlZW4gcmVhZGVycyBtaWdodCBoYXZlIHByZXZlbnRlZFxuICAgIGxpdmVFbGVtZW50LnRleHRDb250ZW50ID0gJyc7XG5cbiAgICAvLyBlbGVtZW50IG11c3QgYmUgdmlzaWJsZSBmb3IgYWxlcnRzIHRvIGJlIHNwb2tlblxuICAgIGxpdmVFbGVtZW50LmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgLy8gVXR0ZXJhbmNlUXVldWUgY2Fubm90IGFubm91bmNlIGFnYWluIHVudGlsIGFmdGVyIHRoZSBmb2xsb3dpbmcgdGltZW91dHMuXG4gICAgdGhpcy5yZWFkeVRvQW5ub3VuY2UgPSBmYWxzZTtcblxuICAgIC8vIG11c3QgYmUgZG9uZSBhc3luY2hyb25vdXNseSBmcm9tIHNldHRpbmcgaGlkZGVuIGFib3ZlIG9yIGVsc2UgdGhlIHNjcmVlbiByZWFkZXJcbiAgICAvLyB3aWxsIGZhaWwgdG8gcmVhZCB0aGUgY29udGVudFxuICAgIHN0ZXBUaW1lci5zZXRUaW1lb3V0KCAoKSA9PiB7XG5cbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSB1dHRlcmFuY2UgaXMgbm90IG91dCBvZiBkYXRlIHJpZ2h0IGJlZm9yZSBpdCBpcyBhY3R1YWxseSBzZW50IHRvIGFzc2lzdGl2ZSB0ZWNobm9sb2d5XG4gICAgICBpZiAoIHV0dGVyYW5jZS5wcmVkaWNhdGUoKSApIHtcblxuICAgICAgICBQRE9NVXRpbHMuc2V0VGV4dENvbnRlbnQoIGxpdmVFbGVtZW50LCB0ZXh0Q29udGVudCApO1xuXG4gICAgICAgIC8vIEhpZGUgdGhlIGNvbnRlbnQgc28gdGhhdCBpdCBjYW50IGJlIHJlYWQgd2l0aCB0aGUgdmlydHVhbCBjdXJzb3IuIE11c3QgYmUgZG9uZVxuICAgICAgICAvLyBiZWhpbmQgYXQgbGVhc3QgMjAwIG1zIGRlbGF5IG9yIGVsc2UgYWxlcnRzIG1heSBiZSBtaXNzZWQgYnkgTlZEQSBhbmQgVm9pY2VPdmVyLCBzZWVcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNDkxXG4gICAgICAgIHN0ZXBUaW1lci5zZXRUaW1lb3V0KCAoKSA9PiB7XG5cbiAgICAgICAgICBpZiAoIHBsYXRmb3JtLnNhZmFyaSAmJiAhcGxhdGZvcm0ubW9iaWxlU2FmYXJpICkge1xuXG4gICAgICAgICAgICAvLyBVc2luZyBgaGlkZGVuYCByYXRoZXIgdGhhbiBjbGVhcmluZyB0ZXh0Q29udGVudCB3b3JrcyBiZXR0ZXIgbWFjT1MgVk8sXG4gICAgICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNDkwXG4gICAgICAgICAgICAvLyBIb3dldmVyLCBpdCBwcmV2ZW50cyBhbGwgYWxlcnRzIG9uIGlPUyBWTywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91dHRlcmFuY2UtcXVldWUvaXNzdWVzLzExN1xuICAgICAgICAgICAgbGl2ZUVsZW1lbnQuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsaXZlRWxlbWVudC50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFdhaXQgdW50aWwgYWZ0ZXIgdGhpcyB0aW1lb3V0IHRvIGxldCB0aGUgVXR0ZXJhbmNlUXVldWUgY2FuIGFubm91bmNlIFV0dGVyYW5jZXMgYWdhaW4uIFRoaXMgZGVsYXlcbiAgICAgICAgICAvLyBzZWVtcyB0byBiZSBuZWNlc3NhcnkgdG8gZm9yY2UgVm9pY2VPdmVyIHRvIHNwZWFrIGFyaWEtbGl2ZSBhbGVydHMgaW4gZmlyc3QtaW4tZmlyc3Qtb3V0IG9yZGVyLlxuICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdXR0ZXJhbmNlLXF1ZXVlL2lzc3Vlcy84OFxuICAgICAgICAgIHRoaXMucmVhZHlUb0Fubm91bmNlID0gdHJ1ZTtcbiAgICAgICAgfSwgQXJpYUxpdmVBbm5vdW5jZXIuQVJJQV9MSVZFX0RFTEFZICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkeVRvQW5ub3VuY2UgPSB0cnVlOyAvLyBJZiB0aGUgcHJlZGljYXRlIGZhaWxzLCB3ZSBhcmUgcmVhZHkgdG8gYW5ub3VuY2UgYWdhaW4uXG4gICAgICB9XG4gICAgfSwgMCApO1xuICB9XG5cbiAgLy8gUG9zc2libGUgdmFsdWVzIGZvciB0aGUgYGFyaWEtbGl2ZWAgYXR0cmlidXRlIChwcmlvcml0eSkgdGhhdCBjYW4gYmUgYWxlcnRlZCAobGlrZSBcInBvbGl0ZVwiIGFuZFxuICAvLyBcImFzc2VydGl2ZVwiKSwgc2VlIEFyaWFMaXZlQW5ub3VuY2VPcHRpb25zIGZvciBkZXRhaWxzLlxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFyaWFMaXZlID0gQXJpYUxpdmU7XG59XG5cbnV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlLnJlZ2lzdGVyKCAnQXJpYUxpdmVBbm5vdW5jZXInLCBBcmlhTGl2ZUFubm91bmNlciApO1xuZXhwb3J0IGRlZmF1bHQgQXJpYUxpdmVBbm5vdW5jZXI7Il0sIm5hbWVzIjpbInN0ZXBUaW1lciIsImlzVFJlYWRPbmx5UHJvcGVydHkiLCJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJvcHRpb25pemUiLCJwbGF0Zm9ybSIsIlBET01VdGlscyIsIkFubm91bmNlciIsInV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlIiwiTlVNQkVSX09GX0FSSUFfTElWRV9FTEVNRU5UUyIsImFyaWFMaXZlQW5ub3VuY2VySW5kZXgiLCJBcmlhTGl2ZSIsImF0dHJpYnV0ZVN0cmluZyIsIlBPTElURSIsIkFTU0VSVElWRSIsImVudW1lcmF0aW9uIiwicmVnaXN0ZXIiLCJjcmVhdGVCYXRjaE9mUHJpb3JpdHlMaXZlRWxlbWVudHMiLCJhcmlhTGl2ZVByaW9yaXR5IiwicHJpb3JpdHkiLCJjb250YWluZXIiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpIiwibmV3UGFyYWdyYXBoIiwic2V0QXR0cmlidXRlIiwiYXBwZW5kQ2hpbGQiLCJBcmlhTGl2ZUFubm91bmNlciIsImFubm91bmNlIiwiYW5ub3VuY2VUZXh0IiwidXR0ZXJhbmNlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImhhc1Nwb2tlbiIsInZhbHVlIiwiZWxlbWVudCIsInBvbGl0ZUVsZW1lbnRzIiwicG9saXRlRWxlbWVudEluZGV4IiwidXBkYXRlTGl2ZUVsZW1lbnQiLCJsZW5ndGgiLCJhc3NlcnRpdmVFbGVtZW50cyIsImFzc2VydGl2ZUVsZW1lbnRJbmRleCIsImFzc2VydCIsImFubm91bmNlbWVudENvbXBsZXRlRW1pdHRlciIsImVtaXQiLCJjYW5jZWwiLCJjYW5jZWxVdHRlcmFuY2UiLCJsaXZlRWxlbWVudCIsInRleHRDb250ZW50IiwiaGlkZGVuIiwicmVhZHlUb0Fubm91bmNlIiwic2V0VGltZW91dCIsInByZWRpY2F0ZSIsInNldFRleHRDb250ZW50Iiwic2FmYXJpIiwibW9iaWxlU2FmYXJpIiwiQVJJQV9MSVZFX0RFTEFZIiwicmVzcGVjdFJlc3BvbnNlQ29sbGVjdG9yUHJvcGVydGllcyIsImxhbmciLCJhcmlhTGl2ZUNvbnRhaW5lciIsInBvbGl0ZUVsZW1lbnRDb250YWluZXIiLCJhc3NlcnRpdmVFbGVtZW50Q29udGFpbmVyIiwiQXJyYXkiLCJmcm9tIiwiY2hpbGRyZW4iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0JDLEdBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFDbkQsU0FBU0MsbUJBQW1CLFFBQVEscUNBQXFDO0FBQ3pFLE9BQU9DLGlCQUFpQixvQ0FBb0M7QUFDNUQsT0FBT0Msc0JBQXNCLHlDQUF5QztBQUN0RSxPQUFPQyxlQUFlLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLGlDQUFpQztBQUN0RCxTQUFTQyxTQUFTLFFBQVEsOEJBQThCO0FBQ3hELE9BQU9DLGVBQStELGlCQUFpQjtBQUd2RixPQUFPQyw2QkFBNkIsK0JBQStCO0FBRW5FLFlBQVk7QUFDWixNQUFNQywrQkFBK0I7QUFFckMsNkVBQTZFO0FBQzdFLElBQUlDLHlCQUF5QjtBQUU3Qix5RkFBeUY7QUFDekYsT0FBTyxNQUFNQyxpQkFBaUJSO0lBQzVCLFlBQW9CLEFBQWdCUyxlQUF1QixDQUFHO1FBQUUsS0FBSyxTQUFqQ0Esa0JBQUFBO0lBQW9DO0FBTTFFO0FBUGFELFNBR1lFLFNBQVMsSUFBSUYsU0FBVTtBQUhuQ0EsU0FJWUcsWUFBWSxJQUFJSCxTQUFVO0FBSnRDQSxTQU1ZSSxjQUFjLElBQUliLFlB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