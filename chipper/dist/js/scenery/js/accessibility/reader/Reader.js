// Copyright 2016-2024, University of Colorado Boulder
/**
 * A reader of text content for accessibility.  This takes a Cursor reads its output.  This prototype
 * uses the Web Speech API as a synthesizer for text to speech.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
 *
 * NOTE: We are no longer actively developing this since we know that users would much rather use their own
 * dedicated software. But we are keeping it around for when we want to explore any other voicing features
 * using the web speech API.
 * @author Jesse Greenberg
 */ import Emitter from '../../../../axon/js/Emitter.js';
import { scenery } from '../../imports.js';
let Reader = class Reader {
    /**
   * @param {Cursor} cursor
   */ constructor(cursor){
        // @public, listen only, emits an event when the synth begins speaking the utterance
        this.speakingStartedEmitter = new Emitter({
            parameters: [
                {
                    valueType: Object
                }
            ]
        });
        // @public, listen only, emits an event when the synth has finished speaking the utterance
        this.speakingEndedEmitter = new Emitter({
            parameters: [
                {
                    valueType: Object
                }
            ]
        });
        // @private, flag for when screen reader is speaking - synth.speaking is unsupported for safari
        this.speaking = false;
        // @private, keep track of the polite utterances to assist with the safari specific bug, see below
        this.politeUtterances = [];
        // windows Chrome needs a temporary workaround to avoid skipping every other utterance
        // TODO: Use platform.js and revisit once platforms fix their bugs https://github.com/phetsims/scenery/issues/1581
        const userAgent = navigator.userAgent;
        const osWindows = userAgent.match(/Windows/);
        const platSafari = !!(userAgent.match(/Version\/[5-9]\./) && userAgent.match(/Safari\//) && userAgent.match(/AppleWebKit/));
        if (window.speechSynthesis && SpeechSynthesisUtterance && window.speechSynthesis.speak) {
            // @private - the speech synth
            this.synth = window.speechSynthesis;
            cursor.outputUtteranceProperty.link((outputUtterance)=>{
                // create a new utterance
                const utterThis = new SpeechSynthesisUtterance(outputUtterance.text);
                utterThis.addEventListener('start', (event)=>{
                    this.speakingStartedEmitter.emit(outputUtterance);
                });
                utterThis.addEventListener('end', (event)=>{
                    this.speakingEndedEmitter.emit(outputUtterance);
                });
                // get the default voice
                let defaultVoice;
                this.synth.getVoices().forEach((voice)=>{
                    if (voice.default) {
                        defaultVoice = voice;
                    }
                });
                // set the voice, pitch, and rate for the utterance
                utterThis.voice = defaultVoice;
                utterThis.rate = 1.2;
                // TODO: Implement behavior for the various live roles https://github.com/phetsims/scenery/issues/1581
                // see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
                if (outputUtterance.liveRole === 'assertive' || outputUtterance.liveRole === 'off' || !outputUtterance.liveRole) {
                    // empty the queue of polite utterances
                    this.politeUtterances = [];
                    this.speaking = true;
                    // if assertive or off, cancel the current active utterance and begin speaking immediately
                    // TODO: This is how most screen readers work, but we will probably want different behavior https://github.com/phetsims/scenery/issues/1581
                    // for sims so multiple assertive updates do not compete.
                    // On Windows, the synth must be paused before cancelation and resumed after speaking,
                    // or every other utterance will be skipped.
                    // NOTE: This only seems to happen on Windows for the default voice?
                    if (osWindows) {
                        this.synth.pause();
                        this.synth.cancel();
                        this.synth.speak(utterThis);
                        this.synth.resume();
                    } else {
                        this.synth.cancel();
                        this.synth.speak(utterThis);
                    }
                } else if (outputUtterance.liveRole === 'polite') {
                    // handle the safari specific bug where 'end' and 'start' events are fired on all utterances
                    // after they are added to the queue
                    if (platSafari) {
                        this.politeUtterances.push(utterThis);
                        const readPolite = ()=>{
                            this.speaking = true;
                            const nextUtterance = this.politeUtterances.shift();
                            if (nextUtterance) {
                                this.synth.speak(nextUtterance);
                            } else {
                                this.speaking = false;
                            }
                        };
                        // a small delay will allow the utterance to be read in full, even if
                        // added after cancel().
                        if (this.speaking) {
                            setTimeout(()=>{
                                readPolite();
                            }, 2000); // eslint-disable-line phet/bad-sim-text
                        } else {
                            this.synth.speak(utterThis);
                            // remove from queue
                            const index = this.politeUtterances.indexOf(utterThis);
                            if (index > 0) {
                                this.politeUtterances.splice(index, 1);
                            }
                        }
                    } else {
                        // simply add to the queue
                        this.synth.speak(utterThis);
                    }
                }
            });
        } else {
            cursor.outputUtteranceProperty.link(()=>{
                this.speakingStartedEmitter.emit({
                    text: 'Sorry! Web Speech API not supported on this platform.'
                });
            });
        }
    }
};
scenery.register('Reader', Reader);
export default Reader;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9yZWFkZXIvUmVhZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgcmVhZGVyIG9mIHRleHQgY29udGVudCBmb3IgYWNjZXNzaWJpbGl0eS4gIFRoaXMgdGFrZXMgYSBDdXJzb3IgcmVhZHMgaXRzIG91dHB1dC4gIFRoaXMgcHJvdG90eXBlXG4gKiB1c2VzIHRoZSBXZWIgU3BlZWNoIEFQSSBhcyBhIHN5bnRoZXNpemVyIGZvciB0ZXh0IHRvIHNwZWVjaC5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYl9TcGVlY2hfQVBJXG4gKlxuICogTk9URTogV2UgYXJlIG5vIGxvbmdlciBhY3RpdmVseSBkZXZlbG9waW5nIHRoaXMgc2luY2Ugd2Uga25vdyB0aGF0IHVzZXJzIHdvdWxkIG11Y2ggcmF0aGVyIHVzZSB0aGVpciBvd25cbiAqIGRlZGljYXRlZCBzb2Z0d2FyZS4gQnV0IHdlIGFyZSBrZWVwaW5nIGl0IGFyb3VuZCBmb3Igd2hlbiB3ZSB3YW50IHRvIGV4cGxvcmUgYW55IG90aGVyIHZvaWNpbmcgZmVhdHVyZXNcbiAqIHVzaW5nIHRoZSB3ZWIgc3BlZWNoIEFQSS5cbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuY2xhc3MgUmVhZGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7Q3Vyc29yfSBjdXJzb3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBjdXJzb3IgKSB7XG5cbiAgICAvLyBAcHVibGljLCBsaXN0ZW4gb25seSwgZW1pdHMgYW4gZXZlbnQgd2hlbiB0aGUgc3ludGggYmVnaW5zIHNwZWFraW5nIHRoZSB1dHRlcmFuY2VcbiAgICB0aGlzLnNwZWFraW5nU3RhcnRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBPYmplY3QgfSBdIH0gKTtcblxuICAgIC8vIEBwdWJsaWMsIGxpc3RlbiBvbmx5LCBlbWl0cyBhbiBldmVudCB3aGVuIHRoZSBzeW50aCBoYXMgZmluaXNoZWQgc3BlYWtpbmcgdGhlIHV0dGVyYW5jZVxuICAgIHRoaXMuc3BlYWtpbmdFbmRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBPYmplY3QgfSBdIH0gKTtcblxuICAgIC8vIEBwcml2YXRlLCBmbGFnIGZvciB3aGVuIHNjcmVlbiByZWFkZXIgaXMgc3BlYWtpbmcgLSBzeW50aC5zcGVha2luZyBpcyB1bnN1cHBvcnRlZCBmb3Igc2FmYXJpXG4gICAgdGhpcy5zcGVha2luZyA9IGZhbHNlO1xuXG4gICAgLy8gQHByaXZhdGUsIGtlZXAgdHJhY2sgb2YgdGhlIHBvbGl0ZSB1dHRlcmFuY2VzIHRvIGFzc2lzdCB3aXRoIHRoZSBzYWZhcmkgc3BlY2lmaWMgYnVnLCBzZWUgYmVsb3dcbiAgICB0aGlzLnBvbGl0ZVV0dGVyYW5jZXMgPSBbXTtcblxuICAgIC8vIHdpbmRvd3MgQ2hyb21lIG5lZWRzIGEgdGVtcG9yYXJ5IHdvcmthcm91bmQgdG8gYXZvaWQgc2tpcHBpbmcgZXZlcnkgb3RoZXIgdXR0ZXJhbmNlXG4gICAgLy8gVE9ETzogVXNlIHBsYXRmb3JtLmpzIGFuZCByZXZpc2l0IG9uY2UgcGxhdGZvcm1zIGZpeCB0aGVpciBidWdzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgY29uc3QgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICBjb25zdCBvc1dpbmRvd3MgPSB1c2VyQWdlbnQubWF0Y2goIC9XaW5kb3dzLyApO1xuICAgIGNvbnN0IHBsYXRTYWZhcmkgPSAhISggdXNlckFnZW50Lm1hdGNoKCAvVmVyc2lvblxcL1s1LTldXFwuLyApICYmIHVzZXJBZ2VudC5tYXRjaCggL1NhZmFyaVxcLy8gKSAmJiB1c2VyQWdlbnQubWF0Y2goIC9BcHBsZVdlYktpdC8gKSApO1xuXG4gICAgaWYgKCB3aW5kb3cuc3BlZWNoU3ludGhlc2lzICYmIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSAmJiB3aW5kb3cuc3BlZWNoU3ludGhlc2lzLnNwZWFrICkge1xuXG4gICAgICAvLyBAcHJpdmF0ZSAtIHRoZSBzcGVlY2ggc3ludGhcbiAgICAgIHRoaXMuc3ludGggPSB3aW5kb3cuc3BlZWNoU3ludGhlc2lzO1xuXG4gICAgICBjdXJzb3Iub3V0cHV0VXR0ZXJhbmNlUHJvcGVydHkubGluayggb3V0cHV0VXR0ZXJhbmNlID0+IHtcblxuICAgICAgICAvLyBjcmVhdGUgYSBuZXcgdXR0ZXJhbmNlXG4gICAgICAgIGNvbnN0IHV0dGVyVGhpcyA9IG5ldyBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UoIG91dHB1dFV0dGVyYW5jZS50ZXh0ICk7XG5cbiAgICAgICAgdXR0ZXJUaGlzLmFkZEV2ZW50TGlzdGVuZXIoICdzdGFydCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICB0aGlzLnNwZWFraW5nU3RhcnRlZEVtaXR0ZXIuZW1pdCggb3V0cHV0VXR0ZXJhbmNlICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICB1dHRlclRoaXMuYWRkRXZlbnRMaXN0ZW5lciggJ2VuZCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICB0aGlzLnNwZWFraW5nRW5kZWRFbWl0dGVyLmVtaXQoIG91dHB1dFV0dGVyYW5jZSApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gZ2V0IHRoZSBkZWZhdWx0IHZvaWNlXG4gICAgICAgIGxldCBkZWZhdWx0Vm9pY2U7XG4gICAgICAgIHRoaXMuc3ludGguZ2V0Vm9pY2VzKCkuZm9yRWFjaCggdm9pY2UgPT4ge1xuICAgICAgICAgIGlmICggdm9pY2UuZGVmYXVsdCApIHtcbiAgICAgICAgICAgIGRlZmF1bHRWb2ljZSA9IHZvaWNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8vIHNldCB0aGUgdm9pY2UsIHBpdGNoLCBhbmQgcmF0ZSBmb3IgdGhlIHV0dGVyYW5jZVxuICAgICAgICB1dHRlclRoaXMudm9pY2UgPSBkZWZhdWx0Vm9pY2U7XG4gICAgICAgIHV0dGVyVGhpcy5yYXRlID0gMS4yO1xuXG4gICAgICAgIC8vIFRPRE86IEltcGxlbWVudCBiZWhhdmlvciBmb3IgdGhlIHZhcmlvdXMgbGl2ZSByb2xlcyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQWNjZXNzaWJpbGl0eS9BUklBL0FSSUFfTGl2ZV9SZWdpb25zXG4gICAgICAgIGlmICggb3V0cHV0VXR0ZXJhbmNlLmxpdmVSb2xlID09PSAnYXNzZXJ0aXZlJyB8fFxuICAgICAgICAgICAgIG91dHB1dFV0dGVyYW5jZS5saXZlUm9sZSA9PT0gJ29mZicgfHxcbiAgICAgICAgICAgICAhb3V0cHV0VXR0ZXJhbmNlLmxpdmVSb2xlICkge1xuXG4gICAgICAgICAgLy8gZW1wdHkgdGhlIHF1ZXVlIG9mIHBvbGl0ZSB1dHRlcmFuY2VzXG4gICAgICAgICAgdGhpcy5wb2xpdGVVdHRlcmFuY2VzID0gW107XG4gICAgICAgICAgdGhpcy5zcGVha2luZyA9IHRydWU7XG5cbiAgICAgICAgICAvLyBpZiBhc3NlcnRpdmUgb3Igb2ZmLCBjYW5jZWwgdGhlIGN1cnJlbnQgYWN0aXZlIHV0dGVyYW5jZSBhbmQgYmVnaW4gc3BlYWtpbmcgaW1tZWRpYXRlbHlcbiAgICAgICAgICAvLyBUT0RPOiBUaGlzIGlzIGhvdyBtb3N0IHNjcmVlbiByZWFkZXJzIHdvcmssIGJ1dCB3ZSB3aWxsIHByb2JhYmx5IHdhbnQgZGlmZmVyZW50IGJlaGF2aW9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgICAgLy8gZm9yIHNpbXMgc28gbXVsdGlwbGUgYXNzZXJ0aXZlIHVwZGF0ZXMgZG8gbm90IGNvbXBldGUuXG5cbiAgICAgICAgICAvLyBPbiBXaW5kb3dzLCB0aGUgc3ludGggbXVzdCBiZSBwYXVzZWQgYmVmb3JlIGNhbmNlbGF0aW9uIGFuZCByZXN1bWVkIGFmdGVyIHNwZWFraW5nLFxuICAgICAgICAgIC8vIG9yIGV2ZXJ5IG90aGVyIHV0dGVyYW5jZSB3aWxsIGJlIHNraXBwZWQuXG4gICAgICAgICAgLy8gTk9URTogVGhpcyBvbmx5IHNlZW1zIHRvIGhhcHBlbiBvbiBXaW5kb3dzIGZvciB0aGUgZGVmYXVsdCB2b2ljZT9cbiAgICAgICAgICBpZiAoIG9zV2luZG93cyApIHtcbiAgICAgICAgICAgIHRoaXMuc3ludGgucGF1c2UoKTtcbiAgICAgICAgICAgIHRoaXMuc3ludGguY2FuY2VsKCk7XG4gICAgICAgICAgICB0aGlzLnN5bnRoLnNwZWFrKCB1dHRlclRoaXMgKTtcbiAgICAgICAgICAgIHRoaXMuc3ludGgucmVzdW1lKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zeW50aC5jYW5jZWwoKTtcbiAgICAgICAgICAgIHRoaXMuc3ludGguc3BlYWsoIHV0dGVyVGhpcyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggb3V0cHV0VXR0ZXJhbmNlLmxpdmVSb2xlID09PSAncG9saXRlJyApIHtcblxuICAgICAgICAgIC8vIGhhbmRsZSB0aGUgc2FmYXJpIHNwZWNpZmljIGJ1ZyB3aGVyZSAnZW5kJyBhbmQgJ3N0YXJ0JyBldmVudHMgYXJlIGZpcmVkIG9uIGFsbCB1dHRlcmFuY2VzXG4gICAgICAgICAgLy8gYWZ0ZXIgdGhleSBhcmUgYWRkZWQgdG8gdGhlIHF1ZXVlXG4gICAgICAgICAgaWYgKCBwbGF0U2FmYXJpICkge1xuICAgICAgICAgICAgdGhpcy5wb2xpdGVVdHRlcmFuY2VzLnB1c2goIHV0dGVyVGhpcyApO1xuXG4gICAgICAgICAgICBjb25zdCByZWFkUG9saXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnNwZWFraW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc3QgbmV4dFV0dGVyYW5jZSA9IHRoaXMucG9saXRlVXR0ZXJhbmNlcy5zaGlmdCgpO1xuICAgICAgICAgICAgICBpZiAoIG5leHRVdHRlcmFuY2UgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zeW50aC5zcGVhayggbmV4dFV0dGVyYW5jZSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3BlYWtpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gYSBzbWFsbCBkZWxheSB3aWxsIGFsbG93IHRoZSB1dHRlcmFuY2UgdG8gYmUgcmVhZCBpbiBmdWxsLCBldmVuIGlmXG4gICAgICAgICAgICAvLyBhZGRlZCBhZnRlciBjYW5jZWwoKS5cbiAgICAgICAgICAgIGlmICggdGhpcy5zcGVha2luZyApIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dCggKCkgPT4geyByZWFkUG9saXRlKCk7IH0sIDIwMDAgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuc3ludGguc3BlYWsoIHV0dGVyVGhpcyApO1xuICAgICAgICAgICAgICAvLyByZW1vdmUgZnJvbSBxdWV1ZVxuICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucG9saXRlVXR0ZXJhbmNlcy5pbmRleE9mKCB1dHRlclRoaXMgKTtcbiAgICAgICAgICAgICAgaWYgKCBpbmRleCA+IDAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2xpdGVVdHRlcmFuY2VzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNpbXBseSBhZGQgdG8gdGhlIHF1ZXVlXG4gICAgICAgICAgICB0aGlzLnN5bnRoLnNwZWFrKCB1dHRlclRoaXMgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjdXJzb3Iub3V0cHV0VXR0ZXJhbmNlUHJvcGVydHkubGluayggKCkgPT4ge1xuICAgICAgICB0aGlzLnNwZWFraW5nU3RhcnRlZEVtaXR0ZXIuZW1pdCggeyB0ZXh0OiAnU29ycnkhIFdlYiBTcGVlY2ggQVBJIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBwbGF0Zm9ybS4nIH0gKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1JlYWRlcicsIFJlYWRlciApO1xuZXhwb3J0IGRlZmF1bHQgUmVhZGVyOyJdLCJuYW1lcyI6WyJFbWl0dGVyIiwic2NlbmVyeSIsIlJlYWRlciIsImNvbnN0cnVjdG9yIiwiY3Vyc29yIiwic3BlYWtpbmdTdGFydGVkRW1pdHRlciIsInBhcmFtZXRlcnMiLCJ2YWx1ZVR5cGUiLCJPYmplY3QiLCJzcGVha2luZ0VuZGVkRW1pdHRlciIsInNwZWFraW5nIiwicG9saXRlVXR0ZXJhbmNlcyIsInVzZXJBZ2VudCIsIm5hdmlnYXRvciIsIm9zV2luZG93cyIsIm1hdGNoIiwicGxhdFNhZmFyaSIsIndpbmRvdyIsInNwZWVjaFN5bnRoZXNpcyIsIlNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSIsInNwZWFrIiwic3ludGgiLCJvdXRwdXRVdHRlcmFuY2VQcm9wZXJ0eSIsImxpbmsiLCJvdXRwdXRVdHRlcmFuY2UiLCJ1dHRlclRoaXMiLCJ0ZXh0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwiZW1pdCIsImRlZmF1bHRWb2ljZSIsImdldFZvaWNlcyIsImZvckVhY2giLCJ2b2ljZSIsImRlZmF1bHQiLCJyYXRlIiwibGl2ZVJvbGUiLCJwYXVzZSIsImNhbmNlbCIsInJlc3VtZSIsInB1c2giLCJyZWFkUG9saXRlIiwibmV4dFV0dGVyYW5jZSIsInNoaWZ0Iiwic2V0VGltZW91dCIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Q0FVQyxHQUVELE9BQU9BLGFBQWEsaUNBQWlDO0FBQ3JELFNBQVNDLE9BQU8sUUFBUSxtQkFBbUI7QUFFM0MsSUFBQSxBQUFNQyxTQUFOLE1BQU1BO0lBQ0o7O0dBRUMsR0FDREMsWUFBYUMsTUFBTSxDQUFHO1FBRXBCLG9GQUFvRjtRQUNwRixJQUFJLENBQUNDLHNCQUFzQixHQUFHLElBQUlMLFFBQVM7WUFBRU0sWUFBWTtnQkFBRTtvQkFBRUMsV0FBV0M7Z0JBQU87YUFBRztRQUFDO1FBRW5GLDBGQUEwRjtRQUMxRixJQUFJLENBQUNDLG9CQUFvQixHQUFHLElBQUlULFFBQVM7WUFBRU0sWUFBWTtnQkFBRTtvQkFBRUMsV0FBV0M7Z0JBQU87YUFBRztRQUFDO1FBRWpGLCtGQUErRjtRQUMvRixJQUFJLENBQUNFLFFBQVEsR0FBRztRQUVoQixrR0FBa0c7UUFDbEcsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxFQUFFO1FBRTFCLHNGQUFzRjtRQUN0RixrSEFBa0g7UUFDbEgsTUFBTUMsWUFBWUMsVUFBVUQsU0FBUztRQUNyQyxNQUFNRSxZQUFZRixVQUFVRyxLQUFLLENBQUU7UUFDbkMsTUFBTUMsYUFBYSxDQUFDLENBQUdKLENBQUFBLFVBQVVHLEtBQUssQ0FBRSx1QkFBd0JILFVBQVVHLEtBQUssQ0FBRSxlQUFnQkgsVUFBVUcsS0FBSyxDQUFFLGNBQWM7UUFFaEksSUFBS0UsT0FBT0MsZUFBZSxJQUFJQyw0QkFBNEJGLE9BQU9DLGVBQWUsQ0FBQ0UsS0FBSyxFQUFHO1lBRXhGLDhCQUE4QjtZQUM5QixJQUFJLENBQUNDLEtBQUssR0FBR0osT0FBT0MsZUFBZTtZQUVuQ2QsT0FBT2tCLHVCQUF1QixDQUFDQyxJQUFJLENBQUVDLENBQUFBO2dCQUVuQyx5QkFBeUI7Z0JBQ3pCLE1BQU1DLFlBQVksSUFBSU4seUJBQTBCSyxnQkFBZ0JFLElBQUk7Z0JBRXBFRCxVQUFVRSxnQkFBZ0IsQ0FBRSxTQUFTQyxDQUFBQTtvQkFDbkMsSUFBSSxDQUFDdkIsc0JBQXNCLENBQUN3QixJQUFJLENBQUVMO2dCQUNwQztnQkFFQUMsVUFBVUUsZ0JBQWdCLENBQUUsT0FBT0MsQ0FBQUE7b0JBQ2pDLElBQUksQ0FBQ25CLG9CQUFvQixDQUFDb0IsSUFBSSxDQUFFTDtnQkFDbEM7Z0JBRUEsd0JBQXdCO2dCQUN4QixJQUFJTTtnQkFDSixJQUFJLENBQUNULEtBQUssQ0FBQ1UsU0FBUyxHQUFHQyxPQUFPLENBQUVDLENBQUFBO29CQUM5QixJQUFLQSxNQUFNQyxPQUFPLEVBQUc7d0JBQ25CSixlQUFlRztvQkFDakI7Z0JBQ0Y7Z0JBRUEsbURBQW1EO2dCQUNuRFIsVUFBVVEsS0FBSyxHQUFHSDtnQkFDbEJMLFVBQVVVLElBQUksR0FBRztnQkFFakIsc0dBQXNHO2dCQUN0Ryx3RkFBd0Y7Z0JBQ3hGLElBQUtYLGdCQUFnQlksUUFBUSxLQUFLLGVBQzdCWixnQkFBZ0JZLFFBQVEsS0FBSyxTQUM3QixDQUFDWixnQkFBZ0JZLFFBQVEsRUFBRztvQkFFL0IsdUNBQXVDO29CQUN2QyxJQUFJLENBQUN6QixnQkFBZ0IsR0FBRyxFQUFFO29CQUMxQixJQUFJLENBQUNELFFBQVEsR0FBRztvQkFFaEIsMEZBQTBGO29CQUMxRiwySUFBMkk7b0JBQzNJLHlEQUF5RDtvQkFFekQsc0ZBQXNGO29CQUN0Riw0Q0FBNEM7b0JBQzVDLG9FQUFvRTtvQkFDcEUsSUFBS0ksV0FBWTt3QkFDZixJQUFJLENBQUNPLEtBQUssQ0FBQ2dCLEtBQUs7d0JBQ2hCLElBQUksQ0FBQ2hCLEtBQUssQ0FBQ2lCLE1BQU07d0JBQ2pCLElBQUksQ0FBQ2pCLEtBQUssQ0FBQ0QsS0FBSyxDQUFFSzt3QkFDbEIsSUFBSSxDQUFDSixLQUFLLENBQUNrQixNQUFNO29CQUNuQixPQUNLO3dCQUNILElBQUksQ0FBQ2xCLEtBQUssQ0FBQ2lCLE1BQU07d0JBQ2pCLElBQUksQ0FBQ2pCLEtBQUssQ0FBQ0QsS0FBSyxDQUFFSztvQkFDcEI7Z0JBQ0YsT0FDSyxJQUFLRCxnQkFBZ0JZLFFBQVEsS0FBSyxVQUFXO29CQUVoRCw0RkFBNEY7b0JBQzVGLG9DQUFvQztvQkFDcEMsSUFBS3BCLFlBQWE7d0JBQ2hCLElBQUksQ0FBQ0wsZ0JBQWdCLENBQUM2QixJQUFJLENBQUVmO3dCQUU1QixNQUFNZ0IsYUFBYTs0QkFDakIsSUFBSSxDQUFDL0IsUUFBUSxHQUFHOzRCQUNoQixNQUFNZ0MsZ0JBQWdCLElBQUksQ0FBQy9CLGdCQUFnQixDQUFDZ0MsS0FBSzs0QkFDakQsSUFBS0QsZUFBZ0I7Z0NBQ25CLElBQUksQ0FBQ3JCLEtBQUssQ0FBQ0QsS0FBSyxDQUFFc0I7NEJBQ3BCLE9BQ0s7Z0NBQ0gsSUFBSSxDQUFDaEMsUUFBUSxHQUFHOzRCQUNsQjt3QkFDRjt3QkFFQSxxRUFBcUU7d0JBQ3JFLHdCQUF3Qjt3QkFDeEIsSUFBSyxJQUFJLENBQUNBLFFBQVEsRUFBRzs0QkFDbkJrQyxXQUFZO2dDQUFRSDs0QkFBYyxHQUFHLE9BQVEsd0NBQXdDO3dCQUN2RixPQUNLOzRCQUNILElBQUksQ0FBQ3BCLEtBQUssQ0FBQ0QsS0FBSyxDQUFFSzs0QkFDbEIsb0JBQW9COzRCQUNwQixNQUFNb0IsUUFBUSxJQUFJLENBQUNsQyxnQkFBZ0IsQ0FBQ21DLE9BQU8sQ0FBRXJCOzRCQUM3QyxJQUFLb0IsUUFBUSxHQUFJO2dDQUNmLElBQUksQ0FBQ2xDLGdCQUFnQixDQUFDb0MsTUFBTSxDQUFFRixPQUFPOzRCQUN2Qzt3QkFDRjtvQkFDRixPQUNLO3dCQUNILDBCQUEwQjt3QkFDMUIsSUFBSSxDQUFDeEIsS0FBSyxDQUFDRCxLQUFLLENBQUVLO29CQUNwQjtnQkFDRjtZQUNGO1FBQ0YsT0FDSztZQUNIckIsT0FBT2tCLHVCQUF1QixDQUFDQyxJQUFJLENBQUU7Z0JBQ25DLElBQUksQ0FBQ2xCLHNCQUFzQixDQUFDd0IsSUFBSSxDQUFFO29CQUFFSCxNQUFNO2dCQUF3RDtZQUNwRztRQUNGO0lBQ0Y7QUFDRjtBQUVBekIsUUFBUStDLFFBQVEsQ0FBRSxVQUFVOUM7QUFDNUIsZUFBZUEsT0FBTyJ9