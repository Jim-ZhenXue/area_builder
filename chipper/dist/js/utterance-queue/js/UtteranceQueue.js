// Copyright 2019-2024, University of Colorado Boulder
/**
 * Manages a queue of Utterances that are read in order by assistive technology (AT). This queue typically reads
 * things in a first-in-first-out manner, but it is possible to send an alert directly to the front of
 * the queue. Items in the queue are sent to AT front to back, driven by AXON/timer.
 *
 * An Utterance instance is used as a unique value to the UtteranceQueue. If you add an Utterance a second time to the,
 * queue, the queue will remove the previous instance, and treat the new addition as if the Utterance has been in the
 * queue the entire time, but in the new position.
 *
 * AT are inconsistent in the way that they order alerts, some use last-in-first-out order,
 * others use first-in-first-out order, others just read the last alert that was provided. This queue
 * manages order and improves consistency.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import stepTimer from '../../axon/js/stepTimer.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import AriaLiveAnnouncer from './AriaLiveAnnouncer.js';
import Utterance from './Utterance.js';
import utteranceQueueNamespace from './utteranceQueueNamespace.js';
import UtteranceWrapper from './UtteranceWrapper.js';
let UtteranceQueue = class UtteranceQueue extends PhetioObject {
    get length() {
        return this.queue.length;
    }
    /**
   * Add an utterance ot the end of the queue.  If the utterance has a type of alert which
   * is already in the queue, the older alert will be immediately removed.
   */ addToBack(utterance) {
        // No-op if the utteranceQueue is disabled
        if (!this.initializedAndEnabled) {
            return;
        }
        if (!this.announcer.hasSpoken) {
            // We haven't successfully spoken with the technology of the Announcer yet, keep trying
            // to speak synchronously to be compatible with browser limitations that the first usage
            // of speech needs to come from a synchronous request form the user. See https://github.com/phetsims/utterance-queue/issues/65
            this.announceImmediately(utterance);
        } else {
            // Remove identical Utterances from the queue and wrap with a class that will manage timing variables.
            const utteranceWrapper = this.prepareUtterance(utterance);
            // Add to the queue before prioritizing so that we know which Utterances to prioritize against
            this.queue.push(utteranceWrapper);
            this.debug && console.log('addToBack');
            // Add listeners that will re-prioritize the queue when the priorityProperty changes
            this.addPriorityListenerAndPrioritizeQueue(utteranceWrapper);
        }
    }
    /**
   * Add an utterance to the front of the queue to be read immediately.
   * @deprecated
   */ addToFront(utterance) {
        deprecationWarning('`addToFront()` has been deprecated because it is confusing, and most of the time doesn\'t do what ' + 'is expected, because Utterances are announced based on time-in-queue first, and then position ' + 'in the queue. It is recommended to use addToBack, and then timing variables on Utterances, ' + 'or instead call queue.clear() before adding a more important alert to the queue.');
        // No-op function if the utteranceQueue is disabled
        if (!this.initializedAndEnabled) {
            return;
        }
        const utteranceWrapper = this.prepareUtterance(utterance);
        this.queue.unshift(utteranceWrapper);
    }
    /**
   * Adds a listener to the priorityProperty of an Utterance, and puts the listener on a map so it
   * can easily be removed later. Finally, re-prioritizes Utterances in the queue based on the
   * priority of the new utterance.
   *
   * You must add the utteranceWrapper to the queue before calling this function.
   */ addPriorityListenerAndPrioritizeQueue(utteranceWrapper) {
        assert && assert(!utteranceWrapper.utterancePriorityListener, 'About to add the priority listener twice and only one should exist on the Utterance. The listener should have been removed by removeOthersAndUpdateUtteranceWrapper.');
        utteranceWrapper.utterancePriorityListener = ()=>{
            this.prioritizeUtterances(utteranceWrapper);
        };
        utteranceWrapper.utterance.priorityProperty.link(utteranceWrapper.utterancePriorityListener);
    }
    /**
   * Create an Utterance for the queue in case of string and clears the queue of duplicate utterances. This will also
   * remove duplicates in the queue, and update to the most recent timeInQueue variable.
   */ prepareUtterance(utterance) {
        if (!(utterance instanceof Utterance)) {
            utterance = new Utterance({
                alert: utterance
            });
        }
        const utteranceWrapper = new UtteranceWrapper(utterance);
        // If there are any other items in the queue of the same type, remove them immediately because the added
        // utterance is meant to replace it
        this.removeOthersAndUpdateUtteranceWrapper(utteranceWrapper);
        // Reset the time watching utterance stability since it has been added to the queue.
        utteranceWrapper.stableTime = 0;
        return utteranceWrapper;
    }
    /**
   * Remove an Utterance from the queue. This function is only able to remove `Utterance` instances, and cannot remove
   * other TAlertable types.
   */ removeUtterance(utterance) {
        const utteranceWrapperToUtteranceMapper = (utteranceWrapper)=>utteranceWrapper.utterance === utterance;
        assert && assert(_.find(this.queue, utteranceWrapperToUtteranceMapper), 'utterance to be removed not found in queue');
        // remove all occurrences, if applicable
        _.remove(this.queue, utteranceWrapperToUtteranceMapper).forEach((utteranceWrapper)=>utteranceWrapper.dispose());
    }
    /**
   * Remove earlier Utterances from the queue if the Utterance is important enough. This will also interrupt
   * the utterance that is in the process of being announced by the Announcer.
   */ prioritizeUtterances(utteranceWrapperToPrioritize) {
        let utteranceWrapperIndex = this.queue.indexOf(utteranceWrapperToPrioritize);
        // If this funciton is called from addToBack(), then utteranceWrapperToPrioritize will be the last utterance in the queue.
        const utteranceWrapperInQueue = utteranceWrapperIndex >= 0;
        // utteranceWrapperToPrioritize will only affect other Utterances that are "ahead" of it in the queue
        let traverseToFrontStartIndex;
        if (utteranceWrapperInQueue) {
            // The utterance is in the queue already, we need to walk back to the front of the queue to remove
            // Utterances that have a lower priority.
            traverseToFrontStartIndex = utteranceWrapperIndex - 1;
        } else {
            // If not in the queue, priority will be managed by the announcer.
            traverseToFrontStartIndex = -1;
        }
        // Update the queue before letting the Announcer know that priority is changing, since that could stop current
        // speech and possibly start the next utterance to be announced.
        for(let i = traverseToFrontStartIndex; i >= 0; i--){
            const otherUtteranceWrapper = this.queue[i];
            if (this.shouldUtteranceCancelOther(utteranceWrapperToPrioritize.utterance, otherUtteranceWrapper.utterance)) {
                this.removeUtterance(otherUtteranceWrapper.utterance);
            }
        }
        // Now look backwards to determine if the utteranceWrapper should be removed because an utterance behind it
        // has a higher priority. The only utterance that we have to check is the next one in the queue because
        // any utterance further back MUST be of lower priority. The next Utterance after
        // utteranceWrapperToPrioritize.utterance would have been removed when the higher priority utterances further
        // back were added.
        if (utteranceWrapperInQueue) {
            utteranceWrapperIndex = this.queue.indexOf(utteranceWrapperToPrioritize);
            assert && assert(utteranceWrapperIndex > -1, 'utteranceWrapper is not in queue?');
            const otherUtteranceWrapper = this.queue[utteranceWrapperIndex + 1];
            if (otherUtteranceWrapper && this.shouldUtteranceCancelOther(otherUtteranceWrapper.utterance, utteranceWrapperToPrioritize.utterance)) {
                this.removeUtterance(utteranceWrapperToPrioritize.utterance);
            }
        }
        // Let the Announcer know that priority has changed so that it can do work such as cancel the currently speaking
        // utterance if it has become low priority
        if (this.queue.length > 0) {
            this.announcer.onUtterancePriorityChange(this.queue[0].utterance);
        }
    }
    /**
   * Given one utterance, should it cancel the other? The priority is used to determine if
   * one Utterance should cancel another, but the Announcer may override with its own logic.
   */ shouldUtteranceCancelOther(utterance, utteranceToCancel) {
        return this.announcer.shouldUtteranceCancelOther(utterance, utteranceToCancel);
    }
    removeOthersAndUpdateUtteranceWrapper(utteranceWrapper) {
        const times = [];
        // we need all the times, in case there are more than one wrapper instance already in the Queue.
        for(let i = 0; i < this.queue.length; i++){
            const currentUtteranceWrapper = this.queue[i];
            if (currentUtteranceWrapper.utterance === utteranceWrapper.utterance) {
                times.push(currentUtteranceWrapper.timeInQueue);
            }
        }
        // This side effect is to make sure that the timeInQueue is transferred between adding the same Utterance.
        if (times.length >= 1) {
            utteranceWrapper.timeInQueue = Math.max(...times);
        }
        // remove all occurrences, if applicable.
        _.remove(this.queue, (currentUtteranceWrapper)=>currentUtteranceWrapper.utterance === utteranceWrapper.utterance).forEach((utteranceWrapper)=>utteranceWrapper.dispose());
    }
    /**
   * Returns true if the UtteranceQueue is running and moving through Utterances.
   */ get initializedAndEnabled() {
        return this._enabled && this._initialized;
    }
    pruneDisposedUtterances() {
        const currentQueue = this.queue.slice();
        this.queue.length = 0;
        for(let i = 0; i < currentQueue.length; i++){
            const utteranceWrapper = currentQueue[i];
            if (utteranceWrapper.utterance.isDisposed) {
                utteranceWrapper.dispose();
            } else {
                this.queue.push(utteranceWrapper);
            }
        }
    }
    /**
   * Get the next utterance to alert if one is ready and "stable". If there are no utterances or no utterance is
   * ready to be announced, will return null.
   */ getNextUtterance() {
        // find the next item to announce - generally the next item in the queue, unless it has a delay specified that
        // is greater than the amount of time that the utterance has been sitting in the queue
        let nextUtteranceWrapper = null;
        for(let i = 0; i < this.queue.length; i++){
            const utteranceWrapper = this.queue[i];
            // if we have waited long enough for the utterance to become "stable" or the utterance has been in the queue
            // for longer than the maximum delay override, it will be announced
            if (utteranceWrapper.stableTime > utteranceWrapper.utterance.alertStableDelay || utteranceWrapper.timeInQueue > utteranceWrapper.utterance.alertMaximumDelay) {
                nextUtteranceWrapper = utteranceWrapper;
                break;
            }
        }
        return nextUtteranceWrapper;
    }
    /**
   * Returns true if the utterances is in this queue.
   */ hasUtterance(utterance) {
        for(let i = 0; i < this.queue.length; i++){
            const utteranceWrapper = this.queue[i];
            if (utterance === utteranceWrapper.utterance) {
                return true;
            }
        }
        return false;
    }
    /**
   * Clear the utteranceQueue of all Utterances, any Utterances remaining in the queue will
   * not be announced by the screen reader.
   */ clear() {
        this.debug && console.log('UtteranceQueue.clear()');
        // Removes all priority listeners from the queue.
        this.queue.forEach((utteranceWrapper)=>utteranceWrapper.dispose());
        this.queue.length = 0;
    }
    /**
   * Cancel the provided Utterance if it is being spoken by the Announcer. Removes the Utterance from the queue if
   * it is not being spoken by the announcer. Does nothing to other Utterances. The Announcer implements the behavior
   * to stop speech.
   */ cancelUtterance(utterance) {
        this.announcer.cancelUtterance(utterance);
        if (this.hasUtterance(utterance)) {
            this.removeUtterance(utterance);
        }
    }
    /**
   * Clears all Utterances from the queue and cancels announcement of any Utterances that are being
   * announced by the Announcer.
   */ cancel() {
        this.debug && console.log('UtteranceQueue.cancel()');
        this.clear();
        this.announcer.cancel();
    }
    /**
   * Set whether or not the utterance queue is muted.  When muted, Utterances will still
   * move through the queue, but nothing will be sent to assistive technology.
   */ setMuted(isMuted) {
        this._muted = isMuted;
    }
    set muted(isMuted) {
        this.setMuted(isMuted);
    }
    get muted() {
        return this.getMuted();
    }
    /**
   * Get whether or not the utteranceQueue is muted.  When muted, Utterances will still
   * move through the queue, but nothing will be read by asistive technology.
   */ getMuted() {
        return this._muted;
    }
    /**
   * Set whether or not the utterance queue is enabled.  When enabled, Utterances cannot be added to
   * the queue, and the Queue cannot be cleared. Also nothing will be sent to assistive technology.
   */ setEnabled(isEnabled) {
        this._enabled = isEnabled;
    }
    set enabled(isEnabled) {
        this.setEnabled(isEnabled);
    }
    get enabled() {
        return this.isEnabled();
    }
    /**
   * Get whether or not the utterance queue is enabled.  When enabled, Utterances cannot be added to
   * the queue, and the Queue cannot be cleared. Also nothing will be sent to assistive technology.
   */ isEnabled() {
        return this._enabled;
    }
    /**
   * Step the queue, called by the timer.
   * @param dt - time since last step, in seconds
   */ stepQueue(dt) {
        // No-op function if the utteranceQueue is disabled
        if (!this._enabled) {
            return;
        }
        dt *= 1000; // convert to ms
        if (this.queue.length > 0) {
            // Utterances do not keep references to the queue and so can't remove themselves when disposing. Prune here
            // before trying to announce.
            this.pruneDisposedUtterances();
            for(let i = 0; i < this.queue.length; i++){
                const utteranceWrapper = this.queue[i];
                utteranceWrapper.timeInQueue += dt;
                utteranceWrapper.stableTime += dt;
            }
            const nextUtteranceWrapper = this.getNextUtterance();
            if (nextUtteranceWrapper) {
                this.attemptToAnnounce(nextUtteranceWrapper);
            }
        }
    }
    /**
   * Immediately announce the provided Utterance. If the Announcer is ready to announce, the Utterance will be announced
   * synchronously with this call. Otherwise, the Utterance will be added to the front of the queue to be announced
   * as soon as the Announcer is ready.
   *
   * This function should generally not be used. Use addToBack() in correlation with priorityProperty and timing variables
   * to control the flow of Utterances. This function can be useful when you need an Utterance to be announced
   * synchronously with user input (for example, due to browser constraints on initializing SpeechSynthesis).
   *
   * Any duplicate instance of the provided Utterance that is already in the queue will be removed, matching the
   * behavior of addToBack().
   *
   * announceImmediately() respects Utterance.priorityProperty. A provided Utterance with a priority equal to or lower
   * than what is being announced will not interrupt and will never be announced. If an Utterance at the front of the
   * queue has a higher priority than the provided Utterance, the provided Utterance will never be announced. If the
   * provided Utterance has a higher priority than what is at the front of the queue or what is being announced, it will
   * be announced immediately and interrupt the announcer. Otherwise, it will never be announced.
   */ announceImmediately(utterance) {
        // No-op if the utteranceQueue is disabled
        if (!this.initializedAndEnabled) {
            return;
        }
        this.debug && console.log('announceImmediately');
        // Don't call prepareUtterance because we want to bypass queue operations.
        if (!(utterance instanceof Utterance)) {
            utterance = new Utterance({
                alert: utterance
            });
        }
        // The utterance can only be announced with announceImmediately if there is no announcing Utterance, or if the
        // Announcer allows cancel of the announcing Utterance (checking relative priorityProperty or other things)
        if (this.announcingUtteranceWrapper === null || this.announcer.shouldUtteranceCancelOther(utterance, this.announcingUtteranceWrapper.utterance)) {
            // Remove identical Utterances from the queue and wrap with a class that will manage timing variables.
            const utteranceWrapper = this.prepareUtterance(utterance);
            // set timing variables such that the utterance is ready to announce immediately
            utteranceWrapper.stableTime = Number.POSITIVE_INFINITY;
            utteranceWrapper.timeInQueue = Number.POSITIVE_INFINITY;
            // addPriorityListenerAndPrioritizeQueue assumes the UtteranceWrapper is in the queue, add first
            this.queue.unshift(utteranceWrapper);
            this.addPriorityListenerAndPrioritizeQueue(utteranceWrapper);
            // Prioritization may have determined that this utterance should not be announced, and so was
            // quickly removed from the queue.
            if (this.queue.includes(utteranceWrapper)) {
                // Attempt to announce the Utterance immediately (synchronously) - if the announcer is not ready
                // yet, it will still be at the front of the queue and will be next to be announced as soon as possible
                this.attemptToAnnounce(utteranceWrapper);
            }
        }
    }
    attemptToAnnounce(utteranceWrapper) {
        const utterance = utteranceWrapper.utterance;
        assert && assert(!utterance.isDisposed, 'cannot announce on a disposed Utterance');
        // only query and remove the next utterance if the announcer indicates it is ready for speech
        if (this.announcer.readyToAnnounce) {
            const announceText = utterance.getAlertText(this.announcer.respectResponseCollectorProperties);
            this.debug && console.log('ready to announce in attemptToAnnounce(): ', announceText);
            // featureSpecificAnnouncingControlPropertyName is opt in, so support if it is not supplied
            const featureSpecificAnnouncePermitted = !this.featureSpecificAnnouncingControlPropertyName || utterance[this.featureSpecificAnnouncingControlPropertyName].value;
            // Utterance allows announcing if canAnnounceProperty is true, predicate returns true, and any feature-specific
            // control Property that this UtteranceQueue has opted into is also true.
            const utterancePermitsAnnounce = utterance.canAnnounceProperty.value && utterance.predicate() && featureSpecificAnnouncePermitted;
            // only announce the utterance if not muted, the utterance permits announcing, and the utterance text is not empty
            if (!this._muted && utterancePermitsAnnounce && announceText !== '') {
                assert && assert(this.announcingUtteranceWrapper === null, 'announcingUtteranceWrapper and its priorityProperty listener should have been disposed');
                // Save a reference to the UtteranceWrapper and its priorityProperty listener while the Announcer is announcing
                // it so that it can be removed at the end of announcement.
                this.announcingUtteranceWrapper = utteranceWrapper;
                this.debug && console.log('announcing: ', announceText);
                this.announcer.announce(announceText, utterance, utterance.announcerOptions);
            } else {
                this.debug && console.log('announcer readyToAnnounce but utterance cannot announce, will not be spoken: ', announceText);
            }
            // Announcer.announce may remove this Utterance as a side effect in a listener eagerly (for example
            // if we try to clear the queue when this Utterance ends, but it ends immediately because the browser
            // is not ready for speech). See https://github.com/phetsims/utterance-queue/issues/45.
            // But generally, the Utterance should still be in the queue and should now be removed.
            if (this.queue.includes(utteranceWrapper)) {
                _.remove(this.queue, utteranceWrapper);
                // Clean up only if it isn't currently announcing from prior logic. Some announcing completes sync, so
                // dispose check too.
                if (!utteranceWrapper.isDisposed && this.announcingUtteranceWrapper !== utteranceWrapper) {
                    utteranceWrapper.dispose();
                }
            }
        } else {
            this.debug && console.log('announcer not readyToAnnounce');
        }
    }
    dispose() {
        // only remove listeners if they were added in initialize
        if (this._initialized) {
            assert && assert(this.stepQueueListener);
            stepTimer.removeListener(this.stepQueueListener);
        }
        super.dispose();
    }
    /**
   * Simple factory to wire up all steps for using UtteranceQueue for aria-live alerts. This accomplishes the three items
   * needed for UtteranceQueue to run:
   * 1. Step phet.axon.stepTimer on animation frame (passing it elapsed time in seconds)
   * 2. Add UtteranceQueue's aria-live elements to the document
   * 3. Create the UtteranceQueue instance
   */ static fromFactory() {
        const ariaLiveAnnouncer = new AriaLiveAnnouncer();
        const utteranceQueue = new UtteranceQueue(ariaLiveAnnouncer);
        const container = ariaLiveAnnouncer.ariaLiveContainer;
        // gracefully support if there is no body
        document.body ? document.body.appendChild(container) : document.children[0].appendChild(container);
        let previousTime = 0;
        const step = (elapsedTime)=>{
            const dt = elapsedTime - previousTime;
            previousTime = elapsedTime;
            // time takes seconds
            phet.axon.stepTimer.emit(dt / 1000);
            window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
        return utteranceQueue;
    }
    /**
   * @param announcer - The output implementation for the utteranceQueue, must implement an announce function
   *                             which requests speech in some way (such as the Web Speech API or aria-live)
   * @param [providedOptions]
   */ constructor(announcer, providedOptions){
        const options = optionize()({
            debug: false,
            initialize: true,
            featureSpecificAnnouncingControlPropertyName: null
        }, providedOptions);
        super(options);
        this.announcer = announcer;
        this._initialized = options.initialize;
        this.featureSpecificAnnouncingControlPropertyName = options.featureSpecificAnnouncingControlPropertyName;
        this.queue = [];
        this._muted = false;
        this._enabled = true;
        this.announcingUtteranceWrapper = null;
        this.debug = options.debug;
        // When the Announcer is done with an Utterance, remove priority listeners and remove from the
        // utteranceToPriorityListenerMap.
        this.announcer.announcementCompleteEmitter.addListener((utterance)=>{
            // Multiple UtteranceQueues may use the same Announcer, so we need to make sure that we are responding
            // to an announcement completion for the right Utterance.
            if (this.announcingUtteranceWrapper && utterance === this.announcingUtteranceWrapper.utterance) {
                // It is possible that this.announcer is also used by a different UtteranceQueue so when
                // announcementCompleteEmitter emits, it may not be for this UtteranceWrapper. this.announcingUtteranceWrapper
                // and its priorityListener could only have been set by this queue, so this check ensures
                // that we are removing the priorityProperty listener from the correct Utterance.
                !this.announcingUtteranceWrapper.isDisposed && this.announcingUtteranceWrapper.dispose();
                this.announcingUtteranceWrapper = null;
            }
        });
        this.stepQueueListener = null;
        if (this._initialized) {
            this.stepQueueListener = this.stepQueue.bind(this);
            // begin stepping the queue
            stepTimer.addListener(this.stepQueueListener);
        }
    }
};
utteranceQueueNamespace.register('UtteranceQueue', UtteranceQueue);
export default UtteranceQueue;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2VRdWV1ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBNYW5hZ2VzIGEgcXVldWUgb2YgVXR0ZXJhbmNlcyB0aGF0IGFyZSByZWFkIGluIG9yZGVyIGJ5IGFzc2lzdGl2ZSB0ZWNobm9sb2d5IChBVCkuIFRoaXMgcXVldWUgdHlwaWNhbGx5IHJlYWRzXG4gKiB0aGluZ3MgaW4gYSBmaXJzdC1pbi1maXJzdC1vdXQgbWFubmVyLCBidXQgaXQgaXMgcG9zc2libGUgdG8gc2VuZCBhbiBhbGVydCBkaXJlY3RseSB0byB0aGUgZnJvbnQgb2ZcbiAqIHRoZSBxdWV1ZS4gSXRlbXMgaW4gdGhlIHF1ZXVlIGFyZSBzZW50IHRvIEFUIGZyb250IHRvIGJhY2ssIGRyaXZlbiBieSBBWE9OL3RpbWVyLlxuICpcbiAqIEFuIFV0dGVyYW5jZSBpbnN0YW5jZSBpcyB1c2VkIGFzIGEgdW5pcXVlIHZhbHVlIHRvIHRoZSBVdHRlcmFuY2VRdWV1ZS4gSWYgeW91IGFkZCBhbiBVdHRlcmFuY2UgYSBzZWNvbmQgdGltZSB0byB0aGUsXG4gKiBxdWV1ZSwgdGhlIHF1ZXVlIHdpbGwgcmVtb3ZlIHRoZSBwcmV2aW91cyBpbnN0YW5jZSwgYW5kIHRyZWF0IHRoZSBuZXcgYWRkaXRpb24gYXMgaWYgdGhlIFV0dGVyYW5jZSBoYXMgYmVlbiBpbiB0aGVcbiAqIHF1ZXVlIHRoZSBlbnRpcmUgdGltZSwgYnV0IGluIHRoZSBuZXcgcG9zaXRpb24uXG4gKlxuICogQVQgYXJlIGluY29uc2lzdGVudCBpbiB0aGUgd2F5IHRoYXQgdGhleSBvcmRlciBhbGVydHMsIHNvbWUgdXNlIGxhc3QtaW4tZmlyc3Qtb3V0IG9yZGVyLFxuICogb3RoZXJzIHVzZSBmaXJzdC1pbi1maXJzdC1vdXQgb3JkZXIsIG90aGVycyBqdXN0IHJlYWQgdGhlIGxhc3QgYWxlcnQgdGhhdCB3YXMgcHJvdmlkZWQuIFRoaXMgcXVldWVcbiAqIG1hbmFnZXMgb3JkZXIgYW5kIGltcHJvdmVzIGNvbnNpc3RlbmN5LlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBBbm5vdW5jZXIgZnJvbSAnLi9Bbm5vdW5jZXIuanMnO1xuaW1wb3J0IEFyaWFMaXZlQW5ub3VuY2VyIGZyb20gJy4vQXJpYUxpdmVBbm5vdW5jZXIuanMnO1xuaW1wb3J0IFV0dGVyYW5jZSwgeyBGZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5LCBUQWxlcnRhYmxlIH0gZnJvbSAnLi9VdHRlcmFuY2UuanMnO1xuaW1wb3J0IHV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlIGZyb20gJy4vdXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UuanMnO1xuaW1wb3J0IFV0dGVyYW5jZVdyYXBwZXIgZnJvbSAnLi9VdHRlcmFuY2VXcmFwcGVyLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBhZGQgZXh0cmEgbG9nZ2luZywgaGVscGZ1bCBkdXJpbmcgZGVidWdnaW5nXG4gIGRlYnVnPzogYm9vbGVhbjtcblxuICAvLyBCeSBkZWZhdWx0LCBpbml0aWFsaXplIHRoZSBVdHRlcmFuY2VRdWV1ZSBmdWxseSwgd2l0aCBhbGwgZmVhdHVyZXMsIGlmIGZhbHNlLCBlYWNoIGZ1bmN0aW9uIG9mIHRoaXMgdHlwZSB3aWxsIG5vLW9wXG4gIGluaXRpYWxpemU/OiBib29sZWFuO1xuXG4gIC8vIEJ5IGRlZmF1bHQgdGhlIFV0dGVyYW5jZVF1ZXVlIHdpbGwgcXVlcnkgVXR0ZXJhbmNlLmNhbkFubm91bmNlUHJvcGVydHkgdG8gZGV0ZXJtaW5lIGlmIHRoZSBVdHRlcmFuY2UgY2FuIGJlXG4gIC8vIGFubm91bmNlZCB0byB0aGUgQW5ub3VuY2VyLiBXaXRoIHRoaXMgb3B0aW9uLCB0aGUgcXVldWUgd2lsbCBhbHNvIGNoZWNrIG9uIGEgZmVhdHVyZS1zcGVjaWZpYyBQcm9wZXJ0eSAobGlrZSBmb3JcbiAgLy8gdm9pY2luZyBvciBkZXNjcmlwdGlvbikgdG8gZGV0ZXJtaW5lIGlmIHRoZSBVdHRlcmFuY2UgY2FuIGJlIGFubm91bmNlZC5cbiAgZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWU/OiBGZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5IHwgbnVsbDtcbn07XG50eXBlIFV0dGVyYW5jZVF1ZXVlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGhldGlvT2JqZWN0T3B0aW9ucztcblxuXG5jbGFzcyBVdHRlcmFuY2VRdWV1ZTxBIGV4dGVuZHMgQW5ub3VuY2VyID0gQW5ub3VuY2VyPiBleHRlbmRzIFBoZXRpb09iamVjdCB7XG5cbiAgLy8gU2VuZHMgYnJvd3NlciByZXF1ZXN0cyB0byBhbm5vdW5jZSBlaXRoZXIgdGhyb3VnaCBhcmlhLWxpdmUgd2l0aCBhIHNjcmVlbiByZWFkZXIgb3JcbiAgLy8gU3BlZWNoU3ludGhlc2lzIHdpdGggV2ViIFNwZWVjaCBBUEkgKHJlc3BlY3RpdmVseSksIG9yIGFueSBtZXRob2QgdGhhdCBpbXBsZW1lbnRzIHRoaXMgaW50ZXJmYWNlLiBVc2Ugd2l0aCBjYXV0aW9uLFxuICAvLyBhbmQgb25seSB3aXRoIHRoZSB1bmRlcnN0YW5kaW5nIHRoYXQgeW91IGtub3cgd2hhdCBBbm5vdW5jZXIgdGhpcyBVdHRlcmFuY2VRdWV1ZSBpbnN0YW5jZSB1c2VzLlxuICBwdWJsaWMgcmVhZG9ubHkgYW5ub3VuY2VyOiBBO1xuXG4gIC8vIEluaXRpYWxpemF0aW9uIGlzIGxpa2UgdXR0ZXJhbmNlUXVldWUncyBjb25zdHJ1Y3Rvci4gTm8tb3BzIGFsbCBhcm91bmQgaWYgbm90XG4gIC8vIGluaXRpYWxpemVkIChjaGVlcnMpLiBTZWUgY29uc3RydWN0b3IoKVxuICBwcml2YXRlIHJlYWRvbmx5IF9pbml0aWFsaXplZDogYm9vbGVhbjtcblxuICAvLyBhcnJheSBvZiBVdHRlcmFuY2VXcmFwcGVycywgc2VlIHByaXZhdGUgY2xhc3MgZm9yIGRldGFpbHMuIEFubm91bmNlZFxuICAvLyBmaXJzdCBpbiBmaXJzdCBvdXQgKGZpZm8pLiBFYXJsaWVyIHV0dGVyYW5jZXMgd2lsbCBiZSBsb3dlciBpbiB0aGUgQXJyYXkuXG4gIHByaXZhdGUgcmVhZG9ubHkgcXVldWU6IFV0dGVyYW5jZVdyYXBwZXJbXTtcblxuICAvLyB3aGV0aGVyIFV0dGVyYW5jZXMgbW92aW5nIHRocm91Z2ggdGhlIHF1ZXVlIGFyZSByZWFkIGJ5IGEgc2NyZWVuIHJlYWRlclxuICBwcml2YXRlIF9tdXRlZDogYm9vbGVhbjtcblxuICAvLyB3aGV0aGVyIHRoZSBVdHRlcmFuY2VzUXVldWUgaXMgYWxlcnRpbmcsIGFuZCBpZiB5b3UgY2FuIGFkZC9yZW1vdmUgdXR0ZXJhbmNlc1xuICBwcml2YXRlIF9lbmFibGVkOiBib29sZWFuO1xuXG4gIC8vIEEgcmVmZXJlbmNlIHRvIGFuIFV0dGVyYW5jZVdyYXBwZXIgdGhhdCBjb250YWlucyB0aGUgVXR0ZXJhbmNlIHRoYXQgaXMgcHJvdmlkZWQgdG9cbiAgLy8gdGhlIEFubm91bmNlciB3aGVuIHdlIGFjdHVhbGx5IGNhbGwgYW5ub3VuY2VyLmFubm91bmNlKCkuIFdoaWxlIHRoZSBBbm5vdW5jZXIgaXMgYW5ub3VuY2luZyB0aGlzIFV0dGVyYW5jZSxcbiAgLy8gYSBsaXN0ZW5lciBuZWVkcyB0byByZW1haW4gb24gdGhlIFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5IHNvIHRoYXQgd2UgY2FuIHJlcHJpb3JpdGl6ZSBVdHRlcmFuY2VzIG9yXG4gIC8vIGludGVycnVwdCB0aGlzIFV0dGVyYW5jZSBpZiBwcmlvcml0eVByb3BlcnR5IGNoYW5nZXMuIEEgc2VwYXJhdGUgcmVmZXJlbmNlIHRvIHRoaXMgVXR0ZXJhbmNlV3JhcHBlciBzdXBwb3J0c1xuICAvLyBoYXZpbmcgYSBsaXN0ZW5lciBvbiBhbiBVdHRlcmFuY2UgaW4gdGhlIHF1ZXVlIHdpdGggdXR0ZXJhbmNlVG9Qcmlvcml0eUxpc3RlbmVyTWFwIHdoaWxlIHRoZSBhbm5vdW5jZXIgaXNcbiAgLy8gYW5ub3VuY2luZyB0aGF0IFV0dGVyYW5jZSBhdCB0aGUgc2FtZSB0aW1lLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3V0dGVyYW5jZS1xdWV1ZS9pc3N1ZXMvNDYuXG4gIHByaXZhdGUgYW5ub3VuY2luZ1V0dGVyYW5jZVdyYXBwZXI6IFV0dGVyYW5jZVdyYXBwZXIgfCBudWxsO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVidWc6IGJvb2xlYW47XG5cbiAgLy8gU2VlIGRvYyBmb3Igb3B0aW9ucy5mZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5TmFtZVxuICBwcml2YXRlIHJlYWRvbmx5IGZlYXR1cmVTcGVjaWZpY0Fubm91bmNpbmdDb250cm9sUHJvcGVydHlOYW1lOiBGZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5IHwgbnVsbDtcblxuICBwcml2YXRlIHJlYWRvbmx5IHN0ZXBRdWV1ZUxpc3RlbmVyOiAoICggZHQ6IG51bWJlciApID0+IHZvaWQgKSB8IG51bGw7IC8vIG9ubHkgbnVsbCB3aGVuIFV0dGVyYW5jZVF1ZXVlIGlzIG5vdCBpbml0aWFsaXplZFxuXG4gIC8qKlxuICAgKiBAcGFyYW0gYW5ub3VuY2VyIC0gVGhlIG91dHB1dCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhlIHV0dGVyYW5jZVF1ZXVlLCBtdXN0IGltcGxlbWVudCBhbiBhbm5vdW5jZSBmdW5jdGlvblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpY2ggcmVxdWVzdHMgc3BlZWNoIGluIHNvbWUgd2F5IChzdWNoIGFzIHRoZSBXZWIgU3BlZWNoIEFQSSBvciBhcmlhLWxpdmUpXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhbm5vdW5jZXI6IEEsIHByb3ZpZGVkT3B0aW9ucz86IFV0dGVyYW5jZVF1ZXVlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VXR0ZXJhbmNlUXVldWVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xuICAgICAgZGVidWc6IGZhbHNlLFxuICAgICAgaW5pdGlhbGl6ZTogdHJ1ZSxcbiAgICAgIGZlYXR1cmVTcGVjaWZpY0Fubm91bmNpbmdDb250cm9sUHJvcGVydHlOYW1lOiBudWxsXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5hbm5vdW5jZXIgPSBhbm5vdW5jZXI7XG5cbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IG9wdGlvbnMuaW5pdGlhbGl6ZTtcblxuICAgIHRoaXMuZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWUgPSBvcHRpb25zLmZlYXR1cmVTcGVjaWZpY0Fubm91bmNpbmdDb250cm9sUHJvcGVydHlOYW1lO1xuXG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuXG4gICAgdGhpcy5fbXV0ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xuXG4gICAgdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlciA9IG51bGw7XG5cbiAgICB0aGlzLmRlYnVnID0gb3B0aW9ucy5kZWJ1ZztcblxuICAgIC8vIFdoZW4gdGhlIEFubm91bmNlciBpcyBkb25lIHdpdGggYW4gVXR0ZXJhbmNlLCByZW1vdmUgcHJpb3JpdHkgbGlzdGVuZXJzIGFuZCByZW1vdmUgZnJvbSB0aGVcbiAgICAvLyB1dHRlcmFuY2VUb1ByaW9yaXR5TGlzdGVuZXJNYXAuXG4gICAgdGhpcy5hbm5vdW5jZXIuYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyLmFkZExpc3RlbmVyKCAoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICkgPT4ge1xuXG4gICAgICAvLyBNdWx0aXBsZSBVdHRlcmFuY2VRdWV1ZXMgbWF5IHVzZSB0aGUgc2FtZSBBbm5vdW5jZXIsIHNvIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgd2UgYXJlIHJlc3BvbmRpbmdcbiAgICAgIC8vIHRvIGFuIGFubm91bmNlbWVudCBjb21wbGV0aW9uIGZvciB0aGUgcmlnaHQgVXR0ZXJhbmNlLlxuICAgICAgaWYgKCB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyICYmIHV0dGVyYW5jZSA9PT0gdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UgKSB7XG5cbiAgICAgICAgLy8gSXQgaXMgcG9zc2libGUgdGhhdCB0aGlzLmFubm91bmNlciBpcyBhbHNvIHVzZWQgYnkgYSBkaWZmZXJlbnQgVXR0ZXJhbmNlUXVldWUgc28gd2hlblxuICAgICAgICAvLyBhbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXIgZW1pdHMsIGl0IG1heSBub3QgYmUgZm9yIHRoaXMgVXR0ZXJhbmNlV3JhcHBlci4gdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlclxuICAgICAgICAvLyBhbmQgaXRzIHByaW9yaXR5TGlzdGVuZXIgY291bGQgb25seSBoYXZlIGJlZW4gc2V0IGJ5IHRoaXMgcXVldWUsIHNvIHRoaXMgY2hlY2sgZW5zdXJlc1xuICAgICAgICAvLyB0aGF0IHdlIGFyZSByZW1vdmluZyB0aGUgcHJpb3JpdHlQcm9wZXJ0eSBsaXN0ZW5lciBmcm9tIHRoZSBjb3JyZWN0IFV0dGVyYW5jZS5cbiAgICAgICAgIXRoaXMuYW5ub3VuY2luZ1V0dGVyYW5jZVdyYXBwZXIuaXNEaXNwb3NlZCAmJiB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlciA9IG51bGw7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5zdGVwUXVldWVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICBpZiAoIHRoaXMuX2luaXRpYWxpemVkICkge1xuXG4gICAgICB0aGlzLnN0ZXBRdWV1ZUxpc3RlbmVyID0gdGhpcy5zdGVwUXVldWUuYmluZCggdGhpcyApO1xuXG4gICAgICAvLyBiZWdpbiBzdGVwcGluZyB0aGUgcXVldWVcbiAgICAgIHN0ZXBUaW1lci5hZGRMaXN0ZW5lciggdGhpcy5zdGVwUXVldWVMaXN0ZW5lciApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucXVldWUubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiB1dHRlcmFuY2Ugb3QgdGhlIGVuZCBvZiB0aGUgcXVldWUuICBJZiB0aGUgdXR0ZXJhbmNlIGhhcyBhIHR5cGUgb2YgYWxlcnQgd2hpY2hcbiAgICogaXMgYWxyZWFkeSBpbiB0aGUgcXVldWUsIHRoZSBvbGRlciBhbGVydCB3aWxsIGJlIGltbWVkaWF0ZWx5IHJlbW92ZWQuXG4gICAqL1xuICBwdWJsaWMgYWRkVG9CYWNrKCB1dHRlcmFuY2U6IFRBbGVydGFibGUgKTogdm9pZCB7XG5cbiAgICAvLyBOby1vcCBpZiB0aGUgdXR0ZXJhbmNlUXVldWUgaXMgZGlzYWJsZWRcbiAgICBpZiAoICF0aGlzLmluaXRpYWxpemVkQW5kRW5hYmxlZCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoICF0aGlzLmFubm91bmNlci5oYXNTcG9rZW4gKSB7XG5cbiAgICAgIC8vIFdlIGhhdmVuJ3Qgc3VjY2Vzc2Z1bGx5IHNwb2tlbiB3aXRoIHRoZSB0ZWNobm9sb2d5IG9mIHRoZSBBbm5vdW5jZXIgeWV0LCBrZWVwIHRyeWluZ1xuICAgICAgLy8gdG8gc3BlYWsgc3luY2hyb25vdXNseSB0byBiZSBjb21wYXRpYmxlIHdpdGggYnJvd3NlciBsaW1pdGF0aW9ucyB0aGF0IHRoZSBmaXJzdCB1c2FnZVxuICAgICAgLy8gb2Ygc3BlZWNoIG5lZWRzIHRvIGNvbWUgZnJvbSBhIHN5bmNocm9ub3VzIHJlcXVlc3QgZm9ybSB0aGUgdXNlci4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91dHRlcmFuY2UtcXVldWUvaXNzdWVzLzY1XG4gICAgICB0aGlzLmFubm91bmNlSW1tZWRpYXRlbHkoIHV0dGVyYW5jZSApO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gUmVtb3ZlIGlkZW50aWNhbCBVdHRlcmFuY2VzIGZyb20gdGhlIHF1ZXVlIGFuZCB3cmFwIHdpdGggYSBjbGFzcyB0aGF0IHdpbGwgbWFuYWdlIHRpbWluZyB2YXJpYWJsZXMuXG4gICAgICBjb25zdCB1dHRlcmFuY2VXcmFwcGVyID0gdGhpcy5wcmVwYXJlVXR0ZXJhbmNlKCB1dHRlcmFuY2UgKTtcblxuICAgICAgLy8gQWRkIHRvIHRoZSBxdWV1ZSBiZWZvcmUgcHJpb3JpdGl6aW5nIHNvIHRoYXQgd2Uga25vdyB3aGljaCBVdHRlcmFuY2VzIHRvIHByaW9yaXRpemUgYWdhaW5zdFxuICAgICAgdGhpcy5xdWV1ZS5wdXNoKCB1dHRlcmFuY2VXcmFwcGVyICk7XG5cbiAgICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdhZGRUb0JhY2snICk7XG5cbiAgICAgIC8vIEFkZCBsaXN0ZW5lcnMgdGhhdCB3aWxsIHJlLXByaW9yaXRpemUgdGhlIHF1ZXVlIHdoZW4gdGhlIHByaW9yaXR5UHJvcGVydHkgY2hhbmdlc1xuICAgICAgdGhpcy5hZGRQcmlvcml0eUxpc3RlbmVyQW5kUHJpb3JpdGl6ZVF1ZXVlKCB1dHRlcmFuY2VXcmFwcGVyICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiB1dHRlcmFuY2UgdG8gdGhlIGZyb250IG9mIHRoZSBxdWV1ZSB0byBiZSByZWFkIGltbWVkaWF0ZWx5LlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgcHVibGljIGFkZFRvRnJvbnQoIHV0dGVyYW5jZTogVEFsZXJ0YWJsZSApOiB2b2lkIHtcbiAgICBkZXByZWNhdGlvbldhcm5pbmcoICdgYWRkVG9Gcm9udCgpYCBoYXMgYmVlbiBkZXByZWNhdGVkIGJlY2F1c2UgaXQgaXMgY29uZnVzaW5nLCBhbmQgbW9zdCBvZiB0aGUgdGltZSBkb2VzblxcJ3QgZG8gd2hhdCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpcyBleHBlY3RlZCwgYmVjYXVzZSBVdHRlcmFuY2VzIGFyZSBhbm5vdW5jZWQgYmFzZWQgb24gdGltZS1pbi1xdWV1ZSBmaXJzdCwgYW5kIHRoZW4gcG9zaXRpb24gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW4gdGhlIHF1ZXVlLiBJdCBpcyByZWNvbW1lbmRlZCB0byB1c2UgYWRkVG9CYWNrLCBhbmQgdGhlbiB0aW1pbmcgdmFyaWFibGVzIG9uIFV0dGVyYW5jZXMsICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ29yIGluc3RlYWQgY2FsbCBxdWV1ZS5jbGVhcigpIGJlZm9yZSBhZGRpbmcgYSBtb3JlIGltcG9ydGFudCBhbGVydCB0byB0aGUgcXVldWUuJyApO1xuXG5cbiAgICAvLyBOby1vcCBmdW5jdGlvbiBpZiB0aGUgdXR0ZXJhbmNlUXVldWUgaXMgZGlzYWJsZWRcbiAgICBpZiAoICF0aGlzLmluaXRpYWxpemVkQW5kRW5hYmxlZCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1dHRlcmFuY2VXcmFwcGVyID0gdGhpcy5wcmVwYXJlVXR0ZXJhbmNlKCB1dHRlcmFuY2UgKTtcbiAgICB0aGlzLnF1ZXVlLnVuc2hpZnQoIHV0dGVyYW5jZVdyYXBwZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbGlzdGVuZXIgdG8gdGhlIHByaW9yaXR5UHJvcGVydHkgb2YgYW4gVXR0ZXJhbmNlLCBhbmQgcHV0cyB0aGUgbGlzdGVuZXIgb24gYSBtYXAgc28gaXRcbiAgICogY2FuIGVhc2lseSBiZSByZW1vdmVkIGxhdGVyLiBGaW5hbGx5LCByZS1wcmlvcml0aXplcyBVdHRlcmFuY2VzIGluIHRoZSBxdWV1ZSBiYXNlZCBvbiB0aGVcbiAgICogcHJpb3JpdHkgb2YgdGhlIG5ldyB1dHRlcmFuY2UuXG4gICAqXG4gICAqIFlvdSBtdXN0IGFkZCB0aGUgdXR0ZXJhbmNlV3JhcHBlciB0byB0aGUgcXVldWUgYmVmb3JlIGNhbGxpbmcgdGhpcyBmdW5jdGlvbi5cbiAgICovXG4gIHByaXZhdGUgYWRkUHJpb3JpdHlMaXN0ZW5lckFuZFByaW9yaXRpemVRdWV1ZSggdXR0ZXJhbmNlV3JhcHBlcjogVXR0ZXJhbmNlV3JhcHBlciApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2VQcmlvcml0eUxpc3RlbmVyLFxuICAgICAgJ0Fib3V0IHRvIGFkZCB0aGUgcHJpb3JpdHkgbGlzdGVuZXIgdHdpY2UgYW5kIG9ubHkgb25lIHNob3VsZCBleGlzdCBvbiB0aGUgVXR0ZXJhbmNlLiBUaGUgbGlzdGVuZXIgc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkIGJ5IHJlbW92ZU90aGVyc0FuZFVwZGF0ZVV0dGVyYW5jZVdyYXBwZXIuJyApO1xuICAgIHV0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlUHJpb3JpdHlMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgIHRoaXMucHJpb3JpdGl6ZVV0dGVyYW5jZXMoIHV0dGVyYW5jZVdyYXBwZXIgKTtcbiAgICB9O1xuICAgIHV0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkubGluayggdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2VQcmlvcml0eUxpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGFuIFV0dGVyYW5jZSBmb3IgdGhlIHF1ZXVlIGluIGNhc2Ugb2Ygc3RyaW5nIGFuZCBjbGVhcnMgdGhlIHF1ZXVlIG9mIGR1cGxpY2F0ZSB1dHRlcmFuY2VzLiBUaGlzIHdpbGwgYWxzb1xuICAgKiByZW1vdmUgZHVwbGljYXRlcyBpbiB0aGUgcXVldWUsIGFuZCB1cGRhdGUgdG8gdGhlIG1vc3QgcmVjZW50IHRpbWVJblF1ZXVlIHZhcmlhYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBwcmVwYXJlVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFRBbGVydGFibGUgKTogVXR0ZXJhbmNlV3JhcHBlciB7XG4gICAgaWYgKCAhKCB1dHRlcmFuY2UgaW5zdGFuY2VvZiBVdHRlcmFuY2UgKSApIHtcbiAgICAgIHV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHsgYWxlcnQ6IHV0dGVyYW5jZSB9ICk7XG4gICAgfVxuXG4gICAgY29uc3QgdXR0ZXJhbmNlV3JhcHBlciA9IG5ldyBVdHRlcmFuY2VXcmFwcGVyKCB1dHRlcmFuY2UgKTtcblxuICAgIC8vIElmIHRoZXJlIGFyZSBhbnkgb3RoZXIgaXRlbXMgaW4gdGhlIHF1ZXVlIG9mIHRoZSBzYW1lIHR5cGUsIHJlbW92ZSB0aGVtIGltbWVkaWF0ZWx5IGJlY2F1c2UgdGhlIGFkZGVkXG4gICAgLy8gdXR0ZXJhbmNlIGlzIG1lYW50IHRvIHJlcGxhY2UgaXRcbiAgICB0aGlzLnJlbW92ZU90aGVyc0FuZFVwZGF0ZVV0dGVyYW5jZVdyYXBwZXIoIHV0dGVyYW5jZVdyYXBwZXIgKTtcblxuICAgIC8vIFJlc2V0IHRoZSB0aW1lIHdhdGNoaW5nIHV0dGVyYW5jZSBzdGFiaWxpdHkgc2luY2UgaXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIHF1ZXVlLlxuICAgIHV0dGVyYW5jZVdyYXBwZXIuc3RhYmxlVGltZSA9IDA7XG5cbiAgICByZXR1cm4gdXR0ZXJhbmNlV3JhcHBlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gVXR0ZXJhbmNlIGZyb20gdGhlIHF1ZXVlLiBUaGlzIGZ1bmN0aW9uIGlzIG9ubHkgYWJsZSB0byByZW1vdmUgYFV0dGVyYW5jZWAgaW5zdGFuY2VzLCBhbmQgY2Fubm90IHJlbW92ZVxuICAgKiBvdGhlciBUQWxlcnRhYmxlIHR5cGVzLlxuICAgKi9cbiAgcHVibGljIHJlbW92ZVV0dGVyYW5jZSggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogdm9pZCB7XG5cbiAgICBjb25zdCB1dHRlcmFuY2VXcmFwcGVyVG9VdHRlcmFuY2VNYXBwZXIgPSAoIHV0dGVyYW5jZVdyYXBwZXI6IFV0dGVyYW5jZVdyYXBwZXIgKSA9PiB1dHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5maW5kKCB0aGlzLnF1ZXVlLCB1dHRlcmFuY2VXcmFwcGVyVG9VdHRlcmFuY2VNYXBwZXIgKSwgJ3V0dGVyYW5jZSB0byBiZSByZW1vdmVkIG5vdCBmb3VuZCBpbiBxdWV1ZScgKTtcblxuICAgIC8vIHJlbW92ZSBhbGwgb2NjdXJyZW5jZXMsIGlmIGFwcGxpY2FibGVcbiAgICBfLnJlbW92ZSggdGhpcy5xdWV1ZSwgdXR0ZXJhbmNlV3JhcHBlclRvVXR0ZXJhbmNlTWFwcGVyICkuZm9yRWFjaCggdXR0ZXJhbmNlV3JhcHBlciA9PiB1dHRlcmFuY2VXcmFwcGVyLmRpc3Bvc2UoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBlYXJsaWVyIFV0dGVyYW5jZXMgZnJvbSB0aGUgcXVldWUgaWYgdGhlIFV0dGVyYW5jZSBpcyBpbXBvcnRhbnQgZW5vdWdoLiBUaGlzIHdpbGwgYWxzbyBpbnRlcnJ1cHRcbiAgICogdGhlIHV0dGVyYW5jZSB0aGF0IGlzIGluIHRoZSBwcm9jZXNzIG9mIGJlaW5nIGFubm91bmNlZCBieSB0aGUgQW5ub3VuY2VyLlxuICAgKi9cbiAgcHJpdmF0ZSBwcmlvcml0aXplVXR0ZXJhbmNlcyggdXR0ZXJhbmNlV3JhcHBlclRvUHJpb3JpdGl6ZTogVXR0ZXJhbmNlV3JhcHBlciApOiB2b2lkIHtcblxuICAgIGxldCB1dHRlcmFuY2VXcmFwcGVySW5kZXggPSB0aGlzLnF1ZXVlLmluZGV4T2YoIHV0dGVyYW5jZVdyYXBwZXJUb1ByaW9yaXRpemUgKTtcblxuICAgIC8vIElmIHRoaXMgZnVuY2l0b24gaXMgY2FsbGVkIGZyb20gYWRkVG9CYWNrKCksIHRoZW4gdXR0ZXJhbmNlV3JhcHBlclRvUHJpb3JpdGl6ZSB3aWxsIGJlIHRoZSBsYXN0IHV0dGVyYW5jZSBpbiB0aGUgcXVldWUuXG4gICAgY29uc3QgdXR0ZXJhbmNlV3JhcHBlckluUXVldWUgPSB1dHRlcmFuY2VXcmFwcGVySW5kZXggPj0gMDtcblxuICAgIC8vIHV0dGVyYW5jZVdyYXBwZXJUb1ByaW9yaXRpemUgd2lsbCBvbmx5IGFmZmVjdCBvdGhlciBVdHRlcmFuY2VzIHRoYXQgYXJlIFwiYWhlYWRcIiBvZiBpdCBpbiB0aGUgcXVldWVcbiAgICBsZXQgdHJhdmVyc2VUb0Zyb250U3RhcnRJbmRleDtcbiAgICBpZiAoIHV0dGVyYW5jZVdyYXBwZXJJblF1ZXVlICkge1xuXG4gICAgICAvLyBUaGUgdXR0ZXJhbmNlIGlzIGluIHRoZSBxdWV1ZSBhbHJlYWR5LCB3ZSBuZWVkIHRvIHdhbGsgYmFjayB0byB0aGUgZnJvbnQgb2YgdGhlIHF1ZXVlIHRvIHJlbW92ZVxuICAgICAgLy8gVXR0ZXJhbmNlcyB0aGF0IGhhdmUgYSBsb3dlciBwcmlvcml0eS5cbiAgICAgIHRyYXZlcnNlVG9Gcm9udFN0YXJ0SW5kZXggPSB1dHRlcmFuY2VXcmFwcGVySW5kZXggLSAxO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gSWYgbm90IGluIHRoZSBxdWV1ZSwgcHJpb3JpdHkgd2lsbCBiZSBtYW5hZ2VkIGJ5IHRoZSBhbm5vdW5jZXIuXG4gICAgICB0cmF2ZXJzZVRvRnJvbnRTdGFydEluZGV4ID0gLTE7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBxdWV1ZSBiZWZvcmUgbGV0dGluZyB0aGUgQW5ub3VuY2VyIGtub3cgdGhhdCBwcmlvcml0eSBpcyBjaGFuZ2luZywgc2luY2UgdGhhdCBjb3VsZCBzdG9wIGN1cnJlbnRcbiAgICAvLyBzcGVlY2ggYW5kIHBvc3NpYmx5IHN0YXJ0IHRoZSBuZXh0IHV0dGVyYW5jZSB0byBiZSBhbm5vdW5jZWQuXG4gICAgZm9yICggbGV0IGkgPSB0cmF2ZXJzZVRvRnJvbnRTdGFydEluZGV4OyBpID49IDA7IGktLSApIHtcbiAgICAgIGNvbnN0IG90aGVyVXR0ZXJhbmNlV3JhcHBlciA9IHRoaXMucXVldWVbIGkgXTtcbiAgICAgIGlmICggdGhpcy5zaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciggdXR0ZXJhbmNlV3JhcHBlclRvUHJpb3JpdGl6ZS51dHRlcmFuY2UsIG90aGVyVXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UgKSApIHtcbiAgICAgICAgdGhpcy5yZW1vdmVVdHRlcmFuY2UoIG90aGVyVXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOb3cgbG9vayBiYWNrd2FyZHMgdG8gZGV0ZXJtaW5lIGlmIHRoZSB1dHRlcmFuY2VXcmFwcGVyIHNob3VsZCBiZSByZW1vdmVkIGJlY2F1c2UgYW4gdXR0ZXJhbmNlIGJlaGluZCBpdFxuICAgIC8vIGhhcyBhIGhpZ2hlciBwcmlvcml0eS4gVGhlIG9ubHkgdXR0ZXJhbmNlIHRoYXQgd2UgaGF2ZSB0byBjaGVjayBpcyB0aGUgbmV4dCBvbmUgaW4gdGhlIHF1ZXVlIGJlY2F1c2VcbiAgICAvLyBhbnkgdXR0ZXJhbmNlIGZ1cnRoZXIgYmFjayBNVVNUIGJlIG9mIGxvd2VyIHByaW9yaXR5LiBUaGUgbmV4dCBVdHRlcmFuY2UgYWZ0ZXJcbiAgICAvLyB1dHRlcmFuY2VXcmFwcGVyVG9Qcmlvcml0aXplLnV0dGVyYW5jZSB3b3VsZCBoYXZlIGJlZW4gcmVtb3ZlZCB3aGVuIHRoZSBoaWdoZXIgcHJpb3JpdHkgdXR0ZXJhbmNlcyBmdXJ0aGVyXG4gICAgLy8gYmFjayB3ZXJlIGFkZGVkLlxuICAgIGlmICggdXR0ZXJhbmNlV3JhcHBlckluUXVldWUgKSB7XG4gICAgICB1dHRlcmFuY2VXcmFwcGVySW5kZXggPSB0aGlzLnF1ZXVlLmluZGV4T2YoIHV0dGVyYW5jZVdyYXBwZXJUb1ByaW9yaXRpemUgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHV0dGVyYW5jZVdyYXBwZXJJbmRleCA+IC0xLCAndXR0ZXJhbmNlV3JhcHBlciBpcyBub3QgaW4gcXVldWU/JyApO1xuICAgICAgY29uc3Qgb3RoZXJVdHRlcmFuY2VXcmFwcGVyID0gdGhpcy5xdWV1ZVsgdXR0ZXJhbmNlV3JhcHBlckluZGV4ICsgMSBdO1xuICAgICAgaWYgKCBvdGhlclV0dGVyYW5jZVdyYXBwZXIgJiYgdGhpcy5zaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciggb3RoZXJVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSwgdXR0ZXJhbmNlV3JhcHBlclRvUHJpb3JpdGl6ZS51dHRlcmFuY2UgKSApIHtcbiAgICAgICAgdGhpcy5yZW1vdmVVdHRlcmFuY2UoIHV0dGVyYW5jZVdyYXBwZXJUb1ByaW9yaXRpemUudXR0ZXJhbmNlICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGV0IHRoZSBBbm5vdW5jZXIga25vdyB0aGF0IHByaW9yaXR5IGhhcyBjaGFuZ2VkIHNvIHRoYXQgaXQgY2FuIGRvIHdvcmsgc3VjaCBhcyBjYW5jZWwgdGhlIGN1cnJlbnRseSBzcGVha2luZ1xuICAgIC8vIHV0dGVyYW5jZSBpZiBpdCBoYXMgYmVjb21lIGxvdyBwcmlvcml0eVxuICAgIGlmICggdGhpcy5xdWV1ZS5sZW5ndGggPiAwICkge1xuICAgICAgdGhpcy5hbm5vdW5jZXIub25VdHRlcmFuY2VQcmlvcml0eUNoYW5nZSggdGhpcy5xdWV1ZVsgMCBdLnV0dGVyYW5jZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBvbmUgdXR0ZXJhbmNlLCBzaG91bGQgaXQgY2FuY2VsIHRoZSBvdGhlcj8gVGhlIHByaW9yaXR5IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGlmXG4gICAqIG9uZSBVdHRlcmFuY2Ugc2hvdWxkIGNhbmNlbCBhbm90aGVyLCBidXQgdGhlIEFubm91bmNlciBtYXkgb3ZlcnJpZGUgd2l0aCBpdHMgb3duIGxvZ2ljLlxuICAgKi9cbiAgcHJpdmF0ZSBzaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciggdXR0ZXJhbmNlOiBVdHRlcmFuY2UsIHV0dGVyYW5jZVRvQ2FuY2VsOiBVdHRlcmFuY2UgKTogYm9vbGVhbiB7XG5cbiAgICByZXR1cm4gdGhpcy5hbm5vdW5jZXIuc2hvdWxkVXR0ZXJhbmNlQ2FuY2VsT3RoZXIoIHV0dGVyYW5jZSwgdXR0ZXJhbmNlVG9DYW5jZWwgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlT3RoZXJzQW5kVXBkYXRlVXR0ZXJhbmNlV3JhcHBlciggdXR0ZXJhbmNlV3JhcHBlcjogVXR0ZXJhbmNlV3JhcHBlciApOiB2b2lkIHtcblxuICAgIGNvbnN0IHRpbWVzID0gW107XG5cbiAgICAvLyB3ZSBuZWVkIGFsbCB0aGUgdGltZXMsIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmUgd3JhcHBlciBpbnN0YW5jZSBhbHJlYWR5IGluIHRoZSBRdWV1ZS5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnF1ZXVlLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY3VycmVudFV0dGVyYW5jZVdyYXBwZXIgPSB0aGlzLnF1ZXVlWyBpIF07XG4gICAgICBpZiAoIGN1cnJlbnRVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UgKSB7XG4gICAgICAgIHRpbWVzLnB1c2goIGN1cnJlbnRVdHRlcmFuY2VXcmFwcGVyLnRpbWVJblF1ZXVlICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhpcyBzaWRlIGVmZmVjdCBpcyB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdGltZUluUXVldWUgaXMgdHJhbnNmZXJyZWQgYmV0d2VlbiBhZGRpbmcgdGhlIHNhbWUgVXR0ZXJhbmNlLlxuICAgIGlmICggdGltZXMubGVuZ3RoID49IDEgKSB7XG4gICAgICB1dHRlcmFuY2VXcmFwcGVyLnRpbWVJblF1ZXVlID0gTWF0aC5tYXgoIC4uLnRpbWVzICk7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGFsbCBvY2N1cnJlbmNlcywgaWYgYXBwbGljYWJsZS5cbiAgICBfLnJlbW92ZSggdGhpcy5xdWV1ZSwgY3VycmVudFV0dGVyYW5jZVdyYXBwZXIgPT4gY3VycmVudFV0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlID09PSB1dHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSApLmZvckVhY2goIHV0dGVyYW5jZVdyYXBwZXIgPT4gdXR0ZXJhbmNlV3JhcHBlci5kaXNwb3NlKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIFV0dGVyYW5jZVF1ZXVlIGlzIHJ1bm5pbmcgYW5kIG1vdmluZyB0aHJvdWdoIFV0dGVyYW5jZXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGluaXRpYWxpemVkQW5kRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZCAmJiB0aGlzLl9pbml0aWFsaXplZDtcbiAgfVxuXG4gIHByaXZhdGUgcHJ1bmVEaXNwb3NlZFV0dGVyYW5jZXMoKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFF1ZXVlID0gdGhpcy5xdWV1ZS5zbGljZSgpO1xuICAgIHRoaXMucXVldWUubGVuZ3RoID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjdXJyZW50UXVldWUubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCB1dHRlcmFuY2VXcmFwcGVyID0gY3VycmVudFF1ZXVlWyBpIF07XG4gICAgICBpZiAoIHV0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlLmlzRGlzcG9zZWQgKSB7XG4gICAgICAgIHV0dGVyYW5jZVdyYXBwZXIuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCggdXR0ZXJhbmNlV3JhcHBlciApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5leHQgdXR0ZXJhbmNlIHRvIGFsZXJ0IGlmIG9uZSBpcyByZWFkeSBhbmQgXCJzdGFibGVcIi4gSWYgdGhlcmUgYXJlIG5vIHV0dGVyYW5jZXMgb3Igbm8gdXR0ZXJhbmNlIGlzXG4gICAqIHJlYWR5IHRvIGJlIGFubm91bmNlZCwgd2lsbCByZXR1cm4gbnVsbC5cbiAgICovXG4gIHByaXZhdGUgZ2V0TmV4dFV0dGVyYW5jZSgpOiBVdHRlcmFuY2VXcmFwcGVyIHwgbnVsbCB7XG5cbiAgICAvLyBmaW5kIHRoZSBuZXh0IGl0ZW0gdG8gYW5ub3VuY2UgLSBnZW5lcmFsbHkgdGhlIG5leHQgaXRlbSBpbiB0aGUgcXVldWUsIHVubGVzcyBpdCBoYXMgYSBkZWxheSBzcGVjaWZpZWQgdGhhdFxuICAgIC8vIGlzIGdyZWF0ZXIgdGhhbiB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCB0aGUgdXR0ZXJhbmNlIGhhcyBiZWVuIHNpdHRpbmcgaW4gdGhlIHF1ZXVlXG4gICAgbGV0IG5leHRVdHRlcmFuY2VXcmFwcGVyID0gbnVsbDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnF1ZXVlLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgdXR0ZXJhbmNlV3JhcHBlciA9IHRoaXMucXVldWVbIGkgXTtcblxuICAgICAgLy8gaWYgd2UgaGF2ZSB3YWl0ZWQgbG9uZyBlbm91Z2ggZm9yIHRoZSB1dHRlcmFuY2UgdG8gYmVjb21lIFwic3RhYmxlXCIgb3IgdGhlIHV0dGVyYW5jZSBoYXMgYmVlbiBpbiB0aGUgcXVldWVcbiAgICAgIC8vIGZvciBsb25nZXIgdGhhbiB0aGUgbWF4aW11bSBkZWxheSBvdmVycmlkZSwgaXQgd2lsbCBiZSBhbm5vdW5jZWRcbiAgICAgIGlmICggdXR0ZXJhbmNlV3JhcHBlci5zdGFibGVUaW1lID4gdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UuYWxlcnRTdGFibGVEZWxheSB8fFxuICAgICAgICAgICB1dHRlcmFuY2VXcmFwcGVyLnRpbWVJblF1ZXVlID4gdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UuYWxlcnRNYXhpbXVtRGVsYXkgKSB7XG4gICAgICAgIG5leHRVdHRlcmFuY2VXcmFwcGVyID0gdXR0ZXJhbmNlV3JhcHBlcjtcblxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFV0dGVyYW5jZVdyYXBwZXI7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB1dHRlcmFuY2VzIGlzIGluIHRoaXMgcXVldWUuXG4gICAqL1xuICBwdWJsaWMgaGFzVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiBib29sZWFuIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnF1ZXVlLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgdXR0ZXJhbmNlV3JhcHBlciA9IHRoaXMucXVldWVbIGkgXTtcbiAgICAgIGlmICggdXR0ZXJhbmNlID09PSB1dHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgdXR0ZXJhbmNlUXVldWUgb2YgYWxsIFV0dGVyYW5jZXMsIGFueSBVdHRlcmFuY2VzIHJlbWFpbmluZyBpbiB0aGUgcXVldWUgd2lsbFxuICAgKiBub3QgYmUgYW5ub3VuY2VkIGJ5IHRoZSBzY3JlZW4gcmVhZGVyLlxuICAgKi9cbiAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdVdHRlcmFuY2VRdWV1ZS5jbGVhcigpJyApO1xuXG4gICAgLy8gUmVtb3ZlcyBhbGwgcHJpb3JpdHkgbGlzdGVuZXJzIGZyb20gdGhlIHF1ZXVlLlxuICAgIHRoaXMucXVldWUuZm9yRWFjaCggdXR0ZXJhbmNlV3JhcHBlciA9PiB1dHRlcmFuY2VXcmFwcGVyLmRpc3Bvc2UoKSApO1xuICAgIHRoaXMucXVldWUubGVuZ3RoID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW5jZWwgdGhlIHByb3ZpZGVkIFV0dGVyYW5jZSBpZiBpdCBpcyBiZWluZyBzcG9rZW4gYnkgdGhlIEFubm91bmNlci4gUmVtb3ZlcyB0aGUgVXR0ZXJhbmNlIGZyb20gdGhlIHF1ZXVlIGlmXG4gICAqIGl0IGlzIG5vdCBiZWluZyBzcG9rZW4gYnkgdGhlIGFubm91bmNlci4gRG9lcyBub3RoaW5nIHRvIG90aGVyIFV0dGVyYW5jZXMuIFRoZSBBbm5vdW5jZXIgaW1wbGVtZW50cyB0aGUgYmVoYXZpb3JcbiAgICogdG8gc3RvcCBzcGVlY2guXG4gICAqL1xuICBwdWJsaWMgY2FuY2VsVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiB2b2lkIHtcbiAgICB0aGlzLmFubm91bmNlci5jYW5jZWxVdHRlcmFuY2UoIHV0dGVyYW5jZSApO1xuXG4gICAgaWYgKCB0aGlzLmhhc1V0dGVyYW5jZSggdXR0ZXJhbmNlICkgKSB7XG4gICAgICB0aGlzLnJlbW92ZVV0dGVyYW5jZSggdXR0ZXJhbmNlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBhbGwgVXR0ZXJhbmNlcyBmcm9tIHRoZSBxdWV1ZSBhbmQgY2FuY2VscyBhbm5vdW5jZW1lbnQgb2YgYW55IFV0dGVyYW5jZXMgdGhhdCBhcmUgYmVpbmdcbiAgICogYW5ub3VuY2VkIGJ5IHRoZSBBbm5vdW5jZXIuXG4gICAqL1xuICBwdWJsaWMgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdVdHRlcmFuY2VRdWV1ZS5jYW5jZWwoKScgKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5hbm5vdW5jZXIuY2FuY2VsKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgb3Igbm90IHRoZSB1dHRlcmFuY2UgcXVldWUgaXMgbXV0ZWQuICBXaGVuIG11dGVkLCBVdHRlcmFuY2VzIHdpbGwgc3RpbGxcbiAgICogbW92ZSB0aHJvdWdoIHRoZSBxdWV1ZSwgYnV0IG5vdGhpbmcgd2lsbCBiZSBzZW50IHRvIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LlxuICAgKi9cbiAgcHVibGljIHNldE11dGVkKCBpc011dGVkOiBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMuX211dGVkID0gaXNNdXRlZDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgbXV0ZWQoIGlzTXV0ZWQ6IGJvb2xlYW4gKSB7IHRoaXMuc2V0TXV0ZWQoIGlzTXV0ZWQgKTsgfVxuXG4gIHB1YmxpYyBnZXQgbXV0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldE11dGVkKCk7IH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgb3Igbm90IHRoZSB1dHRlcmFuY2VRdWV1ZSBpcyBtdXRlZC4gIFdoZW4gbXV0ZWQsIFV0dGVyYW5jZXMgd2lsbCBzdGlsbFxuICAgKiBtb3ZlIHRocm91Z2ggdGhlIHF1ZXVlLCBidXQgbm90aGluZyB3aWxsIGJlIHJlYWQgYnkgYXNpc3RpdmUgdGVjaG5vbG9neS5cbiAgICovXG4gIHB1YmxpYyBnZXRNdXRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fbXV0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgb3Igbm90IHRoZSB1dHRlcmFuY2UgcXVldWUgaXMgZW5hYmxlZC4gIFdoZW4gZW5hYmxlZCwgVXR0ZXJhbmNlcyBjYW5ub3QgYmUgYWRkZWQgdG9cbiAgICogdGhlIHF1ZXVlLCBhbmQgdGhlIFF1ZXVlIGNhbm5vdCBiZSBjbGVhcmVkLiBBbHNvIG5vdGhpbmcgd2lsbCBiZSBzZW50IHRvIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LlxuICAgKi9cbiAgcHVibGljIHNldEVuYWJsZWQoIGlzRW5hYmxlZDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICB0aGlzLl9lbmFibGVkID0gaXNFbmFibGVkO1xuICB9XG5cbiAgcHVibGljIHNldCBlbmFibGVkKCBpc0VuYWJsZWQ6IGJvb2xlYW4gKSB7IHRoaXMuc2V0RW5hYmxlZCggaXNFbmFibGVkICk7IH1cblxuICBwdWJsaWMgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmlzRW5hYmxlZCgpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB3aGV0aGVyIG9yIG5vdCB0aGUgdXR0ZXJhbmNlIHF1ZXVlIGlzIGVuYWJsZWQuICBXaGVuIGVuYWJsZWQsIFV0dGVyYW5jZXMgY2Fubm90IGJlIGFkZGVkIHRvXG4gICAqIHRoZSBxdWV1ZSwgYW5kIHRoZSBRdWV1ZSBjYW5ub3QgYmUgY2xlYXJlZC4gQWxzbyBub3RoaW5nIHdpbGwgYmUgc2VudCB0byBhc3Npc3RpdmUgdGVjaG5vbG9neS5cbiAgICovXG4gIHB1YmxpYyBpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7XG4gIH1cblxuICAvKipcbiAgICogU3RlcCB0aGUgcXVldWUsIGNhbGxlZCBieSB0aGUgdGltZXIuXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc2luY2UgbGFzdCBzdGVwLCBpbiBzZWNvbmRzXG4gICAqL1xuICBwcml2YXRlIHN0ZXBRdWV1ZSggZHQ6IG51bWJlciApOiB2b2lkIHtcblxuICAgIC8vIE5vLW9wIGZ1bmN0aW9uIGlmIHRoZSB1dHRlcmFuY2VRdWV1ZSBpcyBkaXNhYmxlZFxuICAgIGlmICggIXRoaXMuX2VuYWJsZWQgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZHQgKj0gMTAwMDsgLy8gY29udmVydCB0byBtc1xuXG4gICAgaWYgKCB0aGlzLnF1ZXVlLmxlbmd0aCA+IDAgKSB7XG5cbiAgICAgIC8vIFV0dGVyYW5jZXMgZG8gbm90IGtlZXAgcmVmZXJlbmNlcyB0byB0aGUgcXVldWUgYW5kIHNvIGNhbid0IHJlbW92ZSB0aGVtc2VsdmVzIHdoZW4gZGlzcG9zaW5nLiBQcnVuZSBoZXJlXG4gICAgICAvLyBiZWZvcmUgdHJ5aW5nIHRvIGFubm91bmNlLlxuICAgICAgdGhpcy5wcnVuZURpc3Bvc2VkVXR0ZXJhbmNlcygpO1xuXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnF1ZXVlLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb25zdCB1dHRlcmFuY2VXcmFwcGVyID0gdGhpcy5xdWV1ZVsgaSBdO1xuICAgICAgICB1dHRlcmFuY2VXcmFwcGVyLnRpbWVJblF1ZXVlICs9IGR0O1xuICAgICAgICB1dHRlcmFuY2VXcmFwcGVyLnN0YWJsZVRpbWUgKz0gZHQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5leHRVdHRlcmFuY2VXcmFwcGVyID0gdGhpcy5nZXROZXh0VXR0ZXJhbmNlKCk7XG4gICAgICBpZiAoIG5leHRVdHRlcmFuY2VXcmFwcGVyICkge1xuICAgICAgICB0aGlzLmF0dGVtcHRUb0Fubm91bmNlKCBuZXh0VXR0ZXJhbmNlV3JhcHBlciApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbW1lZGlhdGVseSBhbm5vdW5jZSB0aGUgcHJvdmlkZWQgVXR0ZXJhbmNlLiBJZiB0aGUgQW5ub3VuY2VyIGlzIHJlYWR5IHRvIGFubm91bmNlLCB0aGUgVXR0ZXJhbmNlIHdpbGwgYmUgYW5ub3VuY2VkXG4gICAqIHN5bmNocm9ub3VzbHkgd2l0aCB0aGlzIGNhbGwuIE90aGVyd2lzZSwgdGhlIFV0dGVyYW5jZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSBmcm9udCBvZiB0aGUgcXVldWUgdG8gYmUgYW5ub3VuY2VkXG4gICAqIGFzIHNvb24gYXMgdGhlIEFubm91bmNlciBpcyByZWFkeS5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBzaG91bGQgZ2VuZXJhbGx5IG5vdCBiZSB1c2VkLiBVc2UgYWRkVG9CYWNrKCkgaW4gY29ycmVsYXRpb24gd2l0aCBwcmlvcml0eVByb3BlcnR5IGFuZCB0aW1pbmcgdmFyaWFibGVzXG4gICAqIHRvIGNvbnRyb2wgdGhlIGZsb3cgb2YgVXR0ZXJhbmNlcy4gVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZnVsIHdoZW4geW91IG5lZWQgYW4gVXR0ZXJhbmNlIHRvIGJlIGFubm91bmNlZFxuICAgKiBzeW5jaHJvbm91c2x5IHdpdGggdXNlciBpbnB1dCAoZm9yIGV4YW1wbGUsIGR1ZSB0byBicm93c2VyIGNvbnN0cmFpbnRzIG9uIGluaXRpYWxpemluZyBTcGVlY2hTeW50aGVzaXMpLlxuICAgKlxuICAgKiBBbnkgZHVwbGljYXRlIGluc3RhbmNlIG9mIHRoZSBwcm92aWRlZCBVdHRlcmFuY2UgdGhhdCBpcyBhbHJlYWR5IGluIHRoZSBxdWV1ZSB3aWxsIGJlIHJlbW92ZWQsIG1hdGNoaW5nIHRoZVxuICAgKiBiZWhhdmlvciBvZiBhZGRUb0JhY2soKS5cbiAgICpcbiAgICogYW5ub3VuY2VJbW1lZGlhdGVseSgpIHJlc3BlY3RzIFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LiBBIHByb3ZpZGVkIFV0dGVyYW5jZSB3aXRoIGEgcHJpb3JpdHkgZXF1YWwgdG8gb3IgbG93ZXJcbiAgICogdGhhbiB3aGF0IGlzIGJlaW5nIGFubm91bmNlZCB3aWxsIG5vdCBpbnRlcnJ1cHQgYW5kIHdpbGwgbmV2ZXIgYmUgYW5ub3VuY2VkLiBJZiBhbiBVdHRlcmFuY2UgYXQgdGhlIGZyb250IG9mIHRoZVxuICAgKiBxdWV1ZSBoYXMgYSBoaWdoZXIgcHJpb3JpdHkgdGhhbiB0aGUgcHJvdmlkZWQgVXR0ZXJhbmNlLCB0aGUgcHJvdmlkZWQgVXR0ZXJhbmNlIHdpbGwgbmV2ZXIgYmUgYW5ub3VuY2VkLiBJZiB0aGVcbiAgICogcHJvdmlkZWQgVXR0ZXJhbmNlIGhhcyBhIGhpZ2hlciBwcmlvcml0eSB0aGFuIHdoYXQgaXMgYXQgdGhlIGZyb250IG9mIHRoZSBxdWV1ZSBvciB3aGF0IGlzIGJlaW5nIGFubm91bmNlZCwgaXQgd2lsbFxuICAgKiBiZSBhbm5vdW5jZWQgaW1tZWRpYXRlbHkgYW5kIGludGVycnVwdCB0aGUgYW5ub3VuY2VyLiBPdGhlcndpc2UsIGl0IHdpbGwgbmV2ZXIgYmUgYW5ub3VuY2VkLlxuICAgKi9cbiAgcHVibGljIGFubm91bmNlSW1tZWRpYXRlbHkoIHV0dGVyYW5jZTogVEFsZXJ0YWJsZSApOiB2b2lkIHtcblxuICAgIC8vIE5vLW9wIGlmIHRoZSB1dHRlcmFuY2VRdWV1ZSBpcyBkaXNhYmxlZFxuICAgIGlmICggIXRoaXMuaW5pdGlhbGl6ZWRBbmRFbmFibGVkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdhbm5vdW5jZUltbWVkaWF0ZWx5JyApO1xuXG4gICAgLy8gRG9uJ3QgY2FsbCBwcmVwYXJlVXR0ZXJhbmNlIGJlY2F1c2Ugd2Ugd2FudCB0byBieXBhc3MgcXVldWUgb3BlcmF0aW9ucy5cbiAgICBpZiAoICEoIHV0dGVyYW5jZSBpbnN0YW5jZW9mIFV0dGVyYW5jZSApICkge1xuICAgICAgdXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSggeyBhbGVydDogdXR0ZXJhbmNlIH0gKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgdXR0ZXJhbmNlIGNhbiBvbmx5IGJlIGFubm91bmNlZCB3aXRoIGFubm91bmNlSW1tZWRpYXRlbHkgaWYgdGhlcmUgaXMgbm8gYW5ub3VuY2luZyBVdHRlcmFuY2UsIG9yIGlmIHRoZVxuICAgIC8vIEFubm91bmNlciBhbGxvd3MgY2FuY2VsIG9mIHRoZSBhbm5vdW5jaW5nIFV0dGVyYW5jZSAoY2hlY2tpbmcgcmVsYXRpdmUgcHJpb3JpdHlQcm9wZXJ0eSBvciBvdGhlciB0aGluZ3MpXG4gICAgaWYgKCB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyID09PSBudWxsIHx8IHRoaXMuYW5ub3VuY2VyLnNob3VsZFV0dGVyYW5jZUNhbmNlbE90aGVyKCB1dHRlcmFuY2UsIHRoaXMuYW5ub3VuY2luZ1V0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlICkgKSB7XG5cbiAgICAgIC8vIFJlbW92ZSBpZGVudGljYWwgVXR0ZXJhbmNlcyBmcm9tIHRoZSBxdWV1ZSBhbmQgd3JhcCB3aXRoIGEgY2xhc3MgdGhhdCB3aWxsIG1hbmFnZSB0aW1pbmcgdmFyaWFibGVzLlxuICAgICAgY29uc3QgdXR0ZXJhbmNlV3JhcHBlciA9IHRoaXMucHJlcGFyZVV0dGVyYW5jZSggdXR0ZXJhbmNlICk7XG5cbiAgICAgIC8vIHNldCB0aW1pbmcgdmFyaWFibGVzIHN1Y2ggdGhhdCB0aGUgdXR0ZXJhbmNlIGlzIHJlYWR5IHRvIGFubm91bmNlIGltbWVkaWF0ZWx5XG4gICAgICB1dHRlcmFuY2VXcmFwcGVyLnN0YWJsZVRpbWUgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgICB1dHRlcmFuY2VXcmFwcGVyLnRpbWVJblF1ZXVlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gICAgICAvLyBhZGRQcmlvcml0eUxpc3RlbmVyQW5kUHJpb3JpdGl6ZVF1ZXVlIGFzc3VtZXMgdGhlIFV0dGVyYW5jZVdyYXBwZXIgaXMgaW4gdGhlIHF1ZXVlLCBhZGQgZmlyc3RcbiAgICAgIHRoaXMucXVldWUudW5zaGlmdCggdXR0ZXJhbmNlV3JhcHBlciApO1xuICAgICAgdGhpcy5hZGRQcmlvcml0eUxpc3RlbmVyQW5kUHJpb3JpdGl6ZVF1ZXVlKCB1dHRlcmFuY2VXcmFwcGVyICk7XG5cbiAgICAgIC8vIFByaW9yaXRpemF0aW9uIG1heSBoYXZlIGRldGVybWluZWQgdGhhdCB0aGlzIHV0dGVyYW5jZSBzaG91bGQgbm90IGJlIGFubm91bmNlZCwgYW5kIHNvIHdhc1xuICAgICAgLy8gcXVpY2tseSByZW1vdmVkIGZyb20gdGhlIHF1ZXVlLlxuICAgICAgaWYgKCB0aGlzLnF1ZXVlLmluY2x1ZGVzKCB1dHRlcmFuY2VXcmFwcGVyICkgKSB7XG5cbiAgICAgICAgLy8gQXR0ZW1wdCB0byBhbm5vdW5jZSB0aGUgVXR0ZXJhbmNlIGltbWVkaWF0ZWx5IChzeW5jaHJvbm91c2x5KSAtIGlmIHRoZSBhbm5vdW5jZXIgaXMgbm90IHJlYWR5XG4gICAgICAgIC8vIHlldCwgaXQgd2lsbCBzdGlsbCBiZSBhdCB0aGUgZnJvbnQgb2YgdGhlIHF1ZXVlIGFuZCB3aWxsIGJlIG5leHQgdG8gYmUgYW5ub3VuY2VkIGFzIHNvb24gYXMgcG9zc2libGVcbiAgICAgICAgdGhpcy5hdHRlbXB0VG9Bbm5vdW5jZSggdXR0ZXJhbmNlV3JhcHBlciApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXR0ZW1wdFRvQW5ub3VuY2UoIHV0dGVyYW5jZVdyYXBwZXI6IFV0dGVyYW5jZVdyYXBwZXIgKTogdm9pZCB7XG4gICAgY29uc3QgdXR0ZXJhbmNlID0gdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2U7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdXR0ZXJhbmNlLmlzRGlzcG9zZWQsICdjYW5ub3QgYW5ub3VuY2Ugb24gYSBkaXNwb3NlZCBVdHRlcmFuY2UnICk7XG5cbiAgICAvLyBvbmx5IHF1ZXJ5IGFuZCByZW1vdmUgdGhlIG5leHQgdXR0ZXJhbmNlIGlmIHRoZSBhbm5vdW5jZXIgaW5kaWNhdGVzIGl0IGlzIHJlYWR5IGZvciBzcGVlY2hcbiAgICBpZiAoIHRoaXMuYW5ub3VuY2VyLnJlYWR5VG9Bbm5vdW5jZSApIHtcblxuICAgICAgY29uc3QgYW5ub3VuY2VUZXh0ID0gdXR0ZXJhbmNlLmdldEFsZXJ0VGV4dCggdGhpcy5hbm5vdW5jZXIucmVzcGVjdFJlc3BvbnNlQ29sbGVjdG9yUHJvcGVydGllcyApO1xuICAgICAgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmxvZyggJ3JlYWR5IHRvIGFubm91bmNlIGluIGF0dGVtcHRUb0Fubm91bmNlKCk6ICcsIGFubm91bmNlVGV4dCApO1xuXG4gICAgICAvLyBmZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5TmFtZSBpcyBvcHQgaW4sIHNvIHN1cHBvcnQgaWYgaXQgaXMgbm90IHN1cHBsaWVkXG4gICAgICBjb25zdCBmZWF0dXJlU3BlY2lmaWNBbm5vdW5jZVBlcm1pdHRlZCA9ICF0aGlzLmZlYXR1cmVTcGVjaWZpY0Fubm91bmNpbmdDb250cm9sUHJvcGVydHlOYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0dGVyYW5jZVsgdGhpcy5mZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5TmFtZSBdLnZhbHVlO1xuXG4gICAgICAvLyBVdHRlcmFuY2UgYWxsb3dzIGFubm91bmNpbmcgaWYgY2FuQW5ub3VuY2VQcm9wZXJ0eSBpcyB0cnVlLCBwcmVkaWNhdGUgcmV0dXJucyB0cnVlLCBhbmQgYW55IGZlYXR1cmUtc3BlY2lmaWNcbiAgICAgIC8vIGNvbnRyb2wgUHJvcGVydHkgdGhhdCB0aGlzIFV0dGVyYW5jZVF1ZXVlIGhhcyBvcHRlZCBpbnRvIGlzIGFsc28gdHJ1ZS5cbiAgICAgIGNvbnN0IHV0dGVyYW5jZVBlcm1pdHNBbm5vdW5jZSA9IHV0dGVyYW5jZS5jYW5Bbm5vdW5jZVByb3BlcnR5LnZhbHVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dHRlcmFuY2UucHJlZGljYXRlKCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZlYXR1cmVTcGVjaWZpY0Fubm91bmNlUGVybWl0dGVkO1xuXG5cbiAgICAgIC8vIG9ubHkgYW5ub3VuY2UgdGhlIHV0dGVyYW5jZSBpZiBub3QgbXV0ZWQsIHRoZSB1dHRlcmFuY2UgcGVybWl0cyBhbm5vdW5jaW5nLCBhbmQgdGhlIHV0dGVyYW5jZSB0ZXh0IGlzIG5vdCBlbXB0eVxuICAgICAgaWYgKCAhdGhpcy5fbXV0ZWQgJiYgdXR0ZXJhbmNlUGVybWl0c0Fubm91bmNlICYmIGFubm91bmNlVGV4dCAhPT0gJycgKSB7XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlciA9PT0gbnVsbCwgJ2Fubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyIGFuZCBpdHMgcHJpb3JpdHlQcm9wZXJ0eSBsaXN0ZW5lciBzaG91bGQgaGF2ZSBiZWVuIGRpc3Bvc2VkJyApO1xuXG4gICAgICAgIC8vIFNhdmUgYSByZWZlcmVuY2UgdG8gdGhlIFV0dGVyYW5jZVdyYXBwZXIgYW5kIGl0cyBwcmlvcml0eVByb3BlcnR5IGxpc3RlbmVyIHdoaWxlIHRoZSBBbm5vdW5jZXIgaXMgYW5ub3VuY2luZ1xuICAgICAgICAvLyBpdCBzbyB0aGF0IGl0IGNhbiBiZSByZW1vdmVkIGF0IHRoZSBlbmQgb2YgYW5ub3VuY2VtZW50LlxuICAgICAgICB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyID0gdXR0ZXJhbmNlV3JhcHBlcjtcbiAgICAgICAgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmxvZyggJ2Fubm91bmNpbmc6ICcsIGFubm91bmNlVGV4dCApO1xuICAgICAgICB0aGlzLmFubm91bmNlci5hbm5vdW5jZSggYW5ub3VuY2VUZXh0LCB1dHRlcmFuY2UsIHV0dGVyYW5jZS5hbm5vdW5jZXJPcHRpb25zICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmxvZyggJ2Fubm91bmNlciByZWFkeVRvQW5ub3VuY2UgYnV0IHV0dGVyYW5jZSBjYW5ub3QgYW5ub3VuY2UsIHdpbGwgbm90IGJlIHNwb2tlbjogJywgYW5ub3VuY2VUZXh0ICk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFubm91bmNlci5hbm5vdW5jZSBtYXkgcmVtb3ZlIHRoaXMgVXR0ZXJhbmNlIGFzIGEgc2lkZSBlZmZlY3QgaW4gYSBsaXN0ZW5lciBlYWdlcmx5IChmb3IgZXhhbXBsZVxuICAgICAgLy8gaWYgd2UgdHJ5IHRvIGNsZWFyIHRoZSBxdWV1ZSB3aGVuIHRoaXMgVXR0ZXJhbmNlIGVuZHMsIGJ1dCBpdCBlbmRzIGltbWVkaWF0ZWx5IGJlY2F1c2UgdGhlIGJyb3dzZXJcbiAgICAgIC8vIGlzIG5vdCByZWFkeSBmb3Igc3BlZWNoKS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91dHRlcmFuY2UtcXVldWUvaXNzdWVzLzQ1LlxuICAgICAgLy8gQnV0IGdlbmVyYWxseSwgdGhlIFV0dGVyYW5jZSBzaG91bGQgc3RpbGwgYmUgaW4gdGhlIHF1ZXVlIGFuZCBzaG91bGQgbm93IGJlIHJlbW92ZWQuXG4gICAgICBpZiAoIHRoaXMucXVldWUuaW5jbHVkZXMoIHV0dGVyYW5jZVdyYXBwZXIgKSApIHtcbiAgICAgICAgXy5yZW1vdmUoIHRoaXMucXVldWUsIHV0dGVyYW5jZVdyYXBwZXIgKTtcblxuICAgICAgICAvLyBDbGVhbiB1cCBvbmx5IGlmIGl0IGlzbid0IGN1cnJlbnRseSBhbm5vdW5jaW5nIGZyb20gcHJpb3IgbG9naWMuIFNvbWUgYW5ub3VuY2luZyBjb21wbGV0ZXMgc3luYywgc29cbiAgICAgICAgLy8gZGlzcG9zZSBjaGVjayB0b28uXG4gICAgICAgIGlmICggIXV0dGVyYW5jZVdyYXBwZXIuaXNEaXNwb3NlZCAmJiB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyICE9PSB1dHRlcmFuY2VXcmFwcGVyICkge1xuICAgICAgICAgIHV0dGVyYW5jZVdyYXBwZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmxvZyggJ2Fubm91bmNlciBub3QgcmVhZHlUb0Fubm91bmNlJyApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuXG4gICAgLy8gb25seSByZW1vdmUgbGlzdGVuZXJzIGlmIHRoZXkgd2VyZSBhZGRlZCBpbiBpbml0aWFsaXplXG4gICAgaWYgKCB0aGlzLl9pbml0aWFsaXplZCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc3RlcFF1ZXVlTGlzdGVuZXIgKTtcbiAgICAgIHN0ZXBUaW1lci5yZW1vdmVMaXN0ZW5lciggdGhpcy5zdGVwUXVldWVMaXN0ZW5lciEgKTtcbiAgICB9XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2ltcGxlIGZhY3RvcnkgdG8gd2lyZSB1cCBhbGwgc3RlcHMgZm9yIHVzaW5nIFV0dGVyYW5jZVF1ZXVlIGZvciBhcmlhLWxpdmUgYWxlcnRzLiBUaGlzIGFjY29tcGxpc2hlcyB0aGUgdGhyZWUgaXRlbXNcbiAgICogbmVlZGVkIGZvciBVdHRlcmFuY2VRdWV1ZSB0byBydW46XG4gICAqIDEuIFN0ZXAgcGhldC5heG9uLnN0ZXBUaW1lciBvbiBhbmltYXRpb24gZnJhbWUgKHBhc3NpbmcgaXQgZWxhcHNlZCB0aW1lIGluIHNlY29uZHMpXG4gICAqIDIuIEFkZCBVdHRlcmFuY2VRdWV1ZSdzIGFyaWEtbGl2ZSBlbGVtZW50cyB0byB0aGUgZG9jdW1lbnRcbiAgICogMy4gQ3JlYXRlIHRoZSBVdHRlcmFuY2VRdWV1ZSBpbnN0YW5jZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tRmFjdG9yeSgpOiBVdHRlcmFuY2VRdWV1ZSB7XG4gICAgY29uc3QgYXJpYUxpdmVBbm5vdW5jZXIgPSBuZXcgQXJpYUxpdmVBbm5vdW5jZXIoKTtcbiAgICBjb25zdCB1dHRlcmFuY2VRdWV1ZSA9IG5ldyBVdHRlcmFuY2VRdWV1ZSggYXJpYUxpdmVBbm5vdW5jZXIgKTtcblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGFyaWFMaXZlQW5ub3VuY2VyLmFyaWFMaXZlQ29udGFpbmVyO1xuXG4gICAgLy8gZ3JhY2VmdWxseSBzdXBwb3J0IGlmIHRoZXJlIGlzIG5vIGJvZHlcbiAgICBkb2N1bWVudC5ib2R5ID8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggY29udGFpbmVyICkgOiBkb2N1bWVudC5jaGlsZHJlblsgMCBdLmFwcGVuZENoaWxkKCBjb250YWluZXIgKTtcblxuICAgIGxldCBwcmV2aW91c1RpbWUgPSAwO1xuICAgIGNvbnN0IHN0ZXAgPSAoIGVsYXBzZWRUaW1lOiBudW1iZXIgKSA9PiB7XG4gICAgICBjb25zdCBkdCA9IGVsYXBzZWRUaW1lIC0gcHJldmlvdXNUaW1lO1xuICAgICAgcHJldmlvdXNUaW1lID0gZWxhcHNlZFRpbWU7XG5cbiAgICAgIC8vIHRpbWUgdGFrZXMgc2Vjb25kc1xuICAgICAgcGhldC5heG9uLnN0ZXBUaW1lci5lbWl0KCBkdCAvIDEwMDAgKTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHN0ZXAgKTtcbiAgICB9O1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHN0ZXAgKTtcbiAgICByZXR1cm4gdXR0ZXJhbmNlUXVldWU7XG4gIH1cbn1cblxudXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UucmVnaXN0ZXIoICdVdHRlcmFuY2VRdWV1ZScsIFV0dGVyYW5jZVF1ZXVlICk7XG5leHBvcnQgZGVmYXVsdCBVdHRlcmFuY2VRdWV1ZTsiXSwibmFtZXMiOlsic3RlcFRpbWVyIiwiZGVwcmVjYXRpb25XYXJuaW5nIiwib3B0aW9uaXplIiwiUGhldGlvT2JqZWN0IiwiQXJpYUxpdmVBbm5vdW5jZXIiLCJVdHRlcmFuY2UiLCJ1dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZSIsIlV0dGVyYW5jZVdyYXBwZXIiLCJVdHRlcmFuY2VRdWV1ZSIsImxlbmd0aCIsInF1ZXVlIiwiYWRkVG9CYWNrIiwidXR0ZXJhbmNlIiwiaW5pdGlhbGl6ZWRBbmRFbmFibGVkIiwiYW5ub3VuY2VyIiwiaGFzU3Bva2VuIiwiYW5ub3VuY2VJbW1lZGlhdGVseSIsInV0dGVyYW5jZVdyYXBwZXIiLCJwcmVwYXJlVXR0ZXJhbmNlIiwicHVzaCIsImRlYnVnIiwiY29uc29sZSIsImxvZyIsImFkZFByaW9yaXR5TGlzdGVuZXJBbmRQcmlvcml0aXplUXVldWUiLCJhZGRUb0Zyb250IiwidW5zaGlmdCIsImFzc2VydCIsInV0dGVyYW5jZVByaW9yaXR5TGlzdGVuZXIiLCJwcmlvcml0aXplVXR0ZXJhbmNlcyIsInByaW9yaXR5UHJvcGVydHkiLCJsaW5rIiwiYWxlcnQiLCJyZW1vdmVPdGhlcnNBbmRVcGRhdGVVdHRlcmFuY2VXcmFwcGVyIiwic3RhYmxlVGltZSIsInJlbW92ZVV0dGVyYW5jZSIsInV0dGVyYW5jZVdyYXBwZXJUb1V0dGVyYW5jZU1hcHBlciIsIl8iLCJmaW5kIiwicmVtb3ZlIiwiZm9yRWFjaCIsImRpc3Bvc2UiLCJ1dHRlcmFuY2VXcmFwcGVyVG9Qcmlvcml0aXplIiwidXR0ZXJhbmNlV3JhcHBlckluZGV4IiwiaW5kZXhPZiIsInV0dGVyYW5jZVdyYXBwZXJJblF1ZXVlIiwidHJhdmVyc2VUb0Zyb250U3RhcnRJbmRleCIsImkiLCJvdGhlclV0dGVyYW5jZVdyYXBwZXIiLCJzaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciIsIm9uVXR0ZXJhbmNlUHJpb3JpdHlDaGFuZ2UiLCJ1dHRlcmFuY2VUb0NhbmNlbCIsInRpbWVzIiwiY3VycmVudFV0dGVyYW5jZVdyYXBwZXIiLCJ0aW1lSW5RdWV1ZSIsIk1hdGgiLCJtYXgiLCJfZW5hYmxlZCIsIl9pbml0aWFsaXplZCIsInBydW5lRGlzcG9zZWRVdHRlcmFuY2VzIiwiY3VycmVudFF1ZXVlIiwic2xpY2UiLCJpc0Rpc3Bvc2VkIiwiZ2V0TmV4dFV0dGVyYW5jZSIsIm5leHRVdHRlcmFuY2VXcmFwcGVyIiwiYWxlcnRTdGFibGVEZWxheSIsImFsZXJ0TWF4aW11bURlbGF5IiwiaGFzVXR0ZXJhbmNlIiwiY2xlYXIiLCJjYW5jZWxVdHRlcmFuY2UiLCJjYW5jZWwiLCJzZXRNdXRlZCIsImlzTXV0ZWQiLCJfbXV0ZWQiLCJtdXRlZCIsImdldE11dGVkIiwic2V0RW5hYmxlZCIsImlzRW5hYmxlZCIsImVuYWJsZWQiLCJzdGVwUXVldWUiLCJkdCIsImF0dGVtcHRUb0Fubm91bmNlIiwiYW5ub3VuY2luZ1V0dGVyYW5jZVdyYXBwZXIiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImluY2x1ZGVzIiwicmVhZHlUb0Fubm91bmNlIiwiYW5ub3VuY2VUZXh0IiwiZ2V0QWxlcnRUZXh0IiwicmVzcGVjdFJlc3BvbnNlQ29sbGVjdG9yUHJvcGVydGllcyIsImZlYXR1cmVTcGVjaWZpY0Fubm91bmNlUGVybWl0dGVkIiwiZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWUiLCJ2YWx1ZSIsInV0dGVyYW5jZVBlcm1pdHNBbm5vdW5jZSIsImNhbkFubm91bmNlUHJvcGVydHkiLCJwcmVkaWNhdGUiLCJhbm5vdW5jZSIsImFubm91bmNlck9wdGlvbnMiLCJzdGVwUXVldWVMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwiZnJvbUZhY3RvcnkiLCJhcmlhTGl2ZUFubm91bmNlciIsInV0dGVyYW5jZVF1ZXVlIiwiY29udGFpbmVyIiwiYXJpYUxpdmVDb250YWluZXIiLCJkb2N1bWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImNoaWxkcmVuIiwicHJldmlvdXNUaW1lIiwic3RlcCIsImVsYXBzZWRUaW1lIiwicGhldCIsImF4b24iLCJlbWl0Iiwid2luZG93IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImluaXRpYWxpemUiLCJhbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImJpbmQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUVELE9BQU9BLGVBQWUsNkJBQTZCO0FBQ25ELE9BQU9DLHdCQUF3QiwyQ0FBMkM7QUFDMUUsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsT0FBT0Msa0JBQTJDLGtDQUFrQztBQUVwRixPQUFPQyx1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