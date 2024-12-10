// Copyright 2019-2024, University of Colorado Boulder
/**
 * MultiClip is a sound generator that plays one-shot sounds from a set of pre-recorded files that are provided upon
 * construction. This is often used as a base class for a sound generator when a finite set of sounds clips need to be
 * played in response to different values of a model parameter.
 *
 * Individual gain controls are not provided for the different sound clips in this class, there is just a single gain
 * node for the sound generator as a whole.  The intent here is that this saves resources by not creating unneeded gain
 * nodes.  If such fine-grained control is needed, a similar type could be created using multiple instances of the
 * SoundClip class.
 *
 * This class only supports clips that are played as one shots, i.e. it does not include support for looping.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import optionize from '../../../phet-core/js/optionize.js';
import audioContextStateChangeMonitor from '../audioContextStateChangeMonitor.js';
import tambo from '../tambo.js';
import SoundGenerator from './SoundGenerator.js';
// constants
const STOP_DELAY_TIME = 0.1; // empirically determined to avoid clicks when stopping sounds
const MAX_PLAY_DEFER_TIME = 0.2; // seconds, max time to defer a play request while waiting for audio context state change
let MultiClip = class MultiClip extends SoundGenerator {
    /**
   * play the sound associated with the provided value
   */ playAssociatedSound(value, delay = 0) {
        // get the audio buffer for this value
        const wrappedAudioBuffer = this.valueToWrappedAudioBufferMap.get(value);
        // verify that we have a sound for the provided value
        assert && assert(wrappedAudioBuffer !== undefined, 'no sound found for provided value');
        if (this.audioContext.state === 'running') {
            // play the sound (if enabled and fully decoded)
            if (this.fullyEnabled && wrappedAudioBuffer.audioBufferProperty.value) {
                const now = this.audioContext.currentTime;
                // make sure the local gain is set to unity value
                this.localGainNode.gain.cancelScheduledValues(now);
                this.localGainNode.gain.setValueAtTime(1, now);
                // create an audio buffer source node and connect it to the previously decoded data in the audio buffer
                const bufferSource = this.audioContext.createBufferSource();
                bufferSource.buffer = wrappedAudioBuffer.audioBufferProperty.value;
                bufferSource.playbackRate.setValueAtTime(this.playbackRate, this.audioContext.currentTime);
                // connect this source node to the output
                bufferSource.connect(this.localGainNode);
                // add this to the list of active sources so that it can be stopped if necessary
                this.activeBufferSources.push(bufferSource);
                // add a handler for when the sound finishes playing
                bufferSource.onended = ()=>{
                    // remove the source from the list of active sources
                    const indexOfSource = this.activeBufferSources.indexOf(bufferSource);
                    if (indexOfSource > -1) {
                        this.activeBufferSources.splice(indexOfSource, 1);
                    }
                };
                // start the playback of the sound
                bufferSource.start(now + delay);
            }
        } else {
            // This method was called while the sound context was not yet running.  This can happen if the method is called
            // due to the first interaction from the user, and also during fuzz testing.
            // Remove previous listener if present.
            if (this.audioContextStateChangeListener) {
                audioContextStateChangeMonitor.removeStateChangeListener(this.audioContext, this.audioContextStateChangeListener);
            }
            // Create and add a listener to play the specified sound when the audio context changes to the 'running' state.
            this.timeOfDeferredPlayRequest = Date.now();
            this.audioContextStateChangeListener = ()=>{
                // Only play the sound if it hasn't been too long, otherwise it may be irrelevant.
                if ((Date.now() - this.timeOfDeferredPlayRequest) / 1000 < MAX_PLAY_DEFER_TIME) {
                    // Play the sound, but delayed a little bit so that the gain nodes can be fully turned up in time.
                    this.playAssociatedSound(value, 0.1);
                }
                audioContextStateChangeMonitor.removeStateChangeListener(this.audioContext, this.audioContextStateChangeListener);
                this.audioContextStateChangeListener = null;
            };
            audioContextStateChangeMonitor.addStateChangeListener(this.audioContext, this.audioContextStateChangeListener);
        }
    }
    /**
   * Change the speed that the sound playback occurs. Note, this does not affect playing sounds, but will only affect
   * subsequent plays of sounds.
   * @param playbackRate - desired playback speed, 1 = normal speed
   */ setPlaybackRate(playbackRate) {
        this.playbackRate = playbackRate;
    }
    /**
   * Stop playing any sounds that are currently in progress.
   */ stopAll() {
        // Simply calling stop() on the buffer source frequently causes an audible click, so we use a gain node and turn
        // down the gain, effectively doing a fade out, before stopping playback.
        const stopTime = this.audioContext.currentTime + STOP_DELAY_TIME;
        this.localGainNode.gain.linearRampToValueAtTime(0, stopTime);
        this.activeBufferSources.forEach((source)=>{
            source.stop(stopTime);
        });
        // The WebAudio spec is a bit unclear about whether stopping a sound will trigger an onended event.  In testing
        // on Chrome in September 2018, I (jbphet) found that onended was NOT being fired when stop() was called, so the
        // code below is needed to clear the array of all active buffer sources.
        this.activeBufferSources.length = 0;
    }
    /**
   * @param valueToWrappedAudioBufferMap - a map of values to Web Audio AudioBuffer objects that is used to associate
   * each item in a set of values with a sound. The object defines a method that can then be used to play the sound
   * associated with the value.
   * @param [providedOptions]
   */ constructor(valueToWrappedAudioBufferMap, providedOptions){
        const options = optionize()({
            initialPlaybackRate: 1
        }, providedOptions);
        super(options);
        this.activeBufferSources = [];
        this.valueToWrappedAudioBufferMap = valueToWrappedAudioBufferMap;
        // initialize the local gain node
        this.localGainNode = this.audioContext.createGain();
        this.localGainNode.connect(this.soundSourceDestination);
        // listen to the Property that indicates whether we are fully enabled and stop sounds if and when it goes false
        this.fullyEnabledProperty.lazyLink((fullyEnabled)=>{
            if (!fullyEnabled) {
                this.stopAll();
            }
        });
        this.playbackRate = options.initialPlaybackRate === undefined ? 1 : options.initialPlaybackRate;
        this.audioContextStateChangeListener = null;
        this.timeOfDeferredPlayRequest = Number.NEGATIVE_INFINITY;
    }
};
tambo.register('MultiClip', MultiClip);
export default MultiClip;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvTXVsdGlDbGlwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE11bHRpQ2xpcCBpcyBhIHNvdW5kIGdlbmVyYXRvciB0aGF0IHBsYXlzIG9uZS1zaG90IHNvdW5kcyBmcm9tIGEgc2V0IG9mIHByZS1yZWNvcmRlZCBmaWxlcyB0aGF0IGFyZSBwcm92aWRlZCB1cG9uXG4gKiBjb25zdHJ1Y3Rpb24uIFRoaXMgaXMgb2Z0ZW4gdXNlZCBhcyBhIGJhc2UgY2xhc3MgZm9yIGEgc291bmQgZ2VuZXJhdG9yIHdoZW4gYSBmaW5pdGUgc2V0IG9mIHNvdW5kcyBjbGlwcyBuZWVkIHRvIGJlXG4gKiBwbGF5ZWQgaW4gcmVzcG9uc2UgdG8gZGlmZmVyZW50IHZhbHVlcyBvZiBhIG1vZGVsIHBhcmFtZXRlci5cbiAqXG4gKiBJbmRpdmlkdWFsIGdhaW4gY29udHJvbHMgYXJlIG5vdCBwcm92aWRlZCBmb3IgdGhlIGRpZmZlcmVudCBzb3VuZCBjbGlwcyBpbiB0aGlzIGNsYXNzLCB0aGVyZSBpcyBqdXN0IGEgc2luZ2xlIGdhaW5cbiAqIG5vZGUgZm9yIHRoZSBzb3VuZCBnZW5lcmF0b3IgYXMgYSB3aG9sZS4gIFRoZSBpbnRlbnQgaGVyZSBpcyB0aGF0IHRoaXMgc2F2ZXMgcmVzb3VyY2VzIGJ5IG5vdCBjcmVhdGluZyB1bm5lZWRlZCBnYWluXG4gKiBub2Rlcy4gIElmIHN1Y2ggZmluZS1ncmFpbmVkIGNvbnRyb2wgaXMgbmVlZGVkLCBhIHNpbWlsYXIgdHlwZSBjb3VsZCBiZSBjcmVhdGVkIHVzaW5nIG11bHRpcGxlIGluc3RhbmNlcyBvZiB0aGVcbiAqIFNvdW5kQ2xpcCBjbGFzcy5cbiAqXG4gKiBUaGlzIGNsYXNzIG9ubHkgc3VwcG9ydHMgY2xpcHMgdGhhdCBhcmUgcGxheWVkIGFzIG9uZSBzaG90cywgaS5lLiBpdCBkb2VzIG5vdCBpbmNsdWRlIHN1cHBvcnQgZm9yIGxvb3BpbmcuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IGF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTW9uaXRvciBmcm9tICcuLi9hdWRpb0NvbnRleHRTdGF0ZUNoYW5nZU1vbml0b3IuanMnO1xuaW1wb3J0IHRhbWJvIGZyb20gJy4uL3RhbWJvLmpzJztcbmltcG9ydCBXcmFwcGVkQXVkaW9CdWZmZXIgZnJvbSAnLi4vV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcbmltcG9ydCBTb3VuZEdlbmVyYXRvciwgeyBTb3VuZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tICcuL1NvdW5kR2VuZXJhdG9yLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgaW5pdGlhbFBsYXliYWNrUmF0ZT86IG51bWJlcjtcbn07XG5leHBvcnQgdHlwZSBNdWx0aUNsaXBPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTb3VuZEdlbmVyYXRvck9wdGlvbnM7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgU1RPUF9ERUxBWV9USU1FID0gMC4xOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGF2b2lkIGNsaWNrcyB3aGVuIHN0b3BwaW5nIHNvdW5kc1xuY29uc3QgTUFYX1BMQVlfREVGRVJfVElNRSA9IDAuMjsgLy8gc2Vjb25kcywgbWF4IHRpbWUgdG8gZGVmZXIgYSBwbGF5IHJlcXVlc3Qgd2hpbGUgd2FpdGluZyBmb3IgYXVkaW8gY29udGV4dCBzdGF0ZSBjaGFuZ2VcblxuY2xhc3MgTXVsdGlDbGlwPFQ+IGV4dGVuZHMgU291bmRHZW5lcmF0b3Ige1xuXG4gIC8vIGJ1ZmZlciBzb3VyY2VzIHRoYXQgYXJlIGN1cnJlbnRseSBwbGF5aW5nLCB1c2VkIGlmIHRoZXkgbmVlZCB0byBiZSBzdG9wcGVkIGVhcmx5XG4gIHByaXZhdGUgcmVhZG9ubHkgYWN0aXZlQnVmZmVyU291cmNlczogQXVkaW9CdWZmZXJTb3VyY2VOb2RlW107XG5cbiAgLy8gbWFwIHRoYXQgYXNzb2NpYXRlcyB2YWx1ZXMgd2l0aCBhdWRpbyBidWZmZXJzXG4gIHByaXZhdGUgcmVhZG9ubHkgdmFsdWVUb1dyYXBwZWRBdWRpb0J1ZmZlck1hcDogTWFwPFQsIFdyYXBwZWRBdWRpb0J1ZmZlcj47XG5cbiAgLy8gYSBnYWluIG5vZGUgdGhhdCBpcyB1c2VkIHRvIHByZXZlbnQgY2xpY2tzIHdoZW4gc3RvcHBpbmcgdGhlIHNvdW5kc1xuICBwcml2YXRlIHJlYWRvbmx5IGxvY2FsR2Fpbk5vZGU6IEdhaW5Ob2RlO1xuXG4gIC8vIHBsYXliYWNrIHJhdGUgdXNlZCBmb3IgYWxsIGNsaXBzXG4gIHByaXZhdGUgcGxheWJhY2tSYXRlOiBudW1iZXI7XG5cbiAgLy8gYSBsaXN0ZW5lciBmb3IgaW1wbGVtZW50aW5nIGRlZmVycmVkIHBsYXkgcmVxdWVzdHMsIHNlZSB1c2FnZSBmb3IgZGV0YWlsc1xuICBwcml2YXRlIGF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTGlzdGVuZXI6IG51bGwgfCAoICggc3RhdGU6IHN0cmluZyApID0+IHZvaWQgKTtcblxuICAvLyB0aW1lIGF0IHdoaWNoIGEgZGVmZXJyZWQgcGxheSByZXF1ZXN0IG9jY3VycmVkLCBpbiBtaWxsaXNlY29uZHMgc2luY2UgZXBvY2hcbiAgcHJpdmF0ZSB0aW1lT2ZEZWZlcnJlZFBsYXlSZXF1ZXN0OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZVRvV3JhcHBlZEF1ZGlvQnVmZmVyTWFwIC0gYSBtYXAgb2YgdmFsdWVzIHRvIFdlYiBBdWRpbyBBdWRpb0J1ZmZlciBvYmplY3RzIHRoYXQgaXMgdXNlZCB0byBhc3NvY2lhdGVcbiAgICogZWFjaCBpdGVtIGluIGEgc2V0IG9mIHZhbHVlcyB3aXRoIGEgc291bmQuIFRoZSBvYmplY3QgZGVmaW5lcyBhIG1ldGhvZCB0aGF0IGNhbiB0aGVuIGJlIHVzZWQgdG8gcGxheSB0aGUgc291bmRcbiAgICogYXNzb2NpYXRlZCB3aXRoIHRoZSB2YWx1ZS5cbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlVG9XcmFwcGVkQXVkaW9CdWZmZXJNYXA6IE1hcDxULCBXcmFwcGVkQXVkaW9CdWZmZXI+LCBwcm92aWRlZE9wdGlvbnM/OiBNdWx0aUNsaXBPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNdWx0aUNsaXBPcHRpb25zLCBTZWxmT3B0aW9ucywgTXVsdGlDbGlwT3B0aW9ucz4oKSgge1xuICAgICAgaW5pdGlhbFBsYXliYWNrUmF0ZTogMVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuYWN0aXZlQnVmZmVyU291cmNlcyA9IFtdO1xuICAgIHRoaXMudmFsdWVUb1dyYXBwZWRBdWRpb0J1ZmZlck1hcCA9IHZhbHVlVG9XcmFwcGVkQXVkaW9CdWZmZXJNYXA7XG5cbiAgICAvLyBpbml0aWFsaXplIHRoZSBsb2NhbCBnYWluIG5vZGVcbiAgICB0aGlzLmxvY2FsR2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5sb2NhbEdhaW5Ob2RlLmNvbm5lY3QoIHRoaXMuc291bmRTb3VyY2VEZXN0aW5hdGlvbiApO1xuXG4gICAgLy8gbGlzdGVuIHRvIHRoZSBQcm9wZXJ0eSB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHdlIGFyZSBmdWxseSBlbmFibGVkIGFuZCBzdG9wIHNvdW5kcyBpZiBhbmQgd2hlbiBpdCBnb2VzIGZhbHNlXG4gICAgdGhpcy5mdWxseUVuYWJsZWRQcm9wZXJ0eS5sYXp5TGluayggZnVsbHlFbmFibGVkID0+IHtcbiAgICAgIGlmICggIWZ1bGx5RW5hYmxlZCApIHtcbiAgICAgICAgdGhpcy5zdG9wQWxsKCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5wbGF5YmFja1JhdGUgPSAoIG9wdGlvbnMuaW5pdGlhbFBsYXliYWNrUmF0ZSA9PT0gdW5kZWZpbmVkICkgPyAxIDogb3B0aW9ucy5pbml0aWFsUGxheWJhY2tSYXRlO1xuICAgIHRoaXMuYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VMaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy50aW1lT2ZEZWZlcnJlZFBsYXlSZXF1ZXN0ID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xuICB9XG5cbiAgLyoqXG4gICAqIHBsYXkgdGhlIHNvdW5kIGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvdmlkZWQgdmFsdWVcbiAgICovXG4gIHB1YmxpYyBwbGF5QXNzb2NpYXRlZFNvdW5kKCB2YWx1ZTogVCwgZGVsYXkgPSAwICk6IHZvaWQge1xuXG4gICAgLy8gZ2V0IHRoZSBhdWRpbyBidWZmZXIgZm9yIHRoaXMgdmFsdWVcbiAgICBjb25zdCB3cmFwcGVkQXVkaW9CdWZmZXIgPSB0aGlzLnZhbHVlVG9XcmFwcGVkQXVkaW9CdWZmZXJNYXAuZ2V0KCB2YWx1ZSApO1xuXG4gICAgLy8gdmVyaWZ5IHRoYXQgd2UgaGF2ZSBhIHNvdW5kIGZvciB0aGUgcHJvdmlkZWQgdmFsdWVcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3cmFwcGVkQXVkaW9CdWZmZXIgIT09IHVuZGVmaW5lZCwgJ25vIHNvdW5kIGZvdW5kIGZvciBwcm92aWRlZCB2YWx1ZScgKTtcblxuICAgIGlmICggdGhpcy5hdWRpb0NvbnRleHQuc3RhdGUgPT09ICdydW5uaW5nJyApIHtcblxuICAgICAgLy8gcGxheSB0aGUgc291bmQgKGlmIGVuYWJsZWQgYW5kIGZ1bGx5IGRlY29kZWQpXG4gICAgICBpZiAoIHRoaXMuZnVsbHlFbmFibGVkICYmIHdyYXBwZWRBdWRpb0J1ZmZlciEuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSApIHtcblxuICAgICAgICBjb25zdCBub3cgPSB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcblxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIGxvY2FsIGdhaW4gaXMgc2V0IHRvIHVuaXR5IHZhbHVlXG4gICAgICAgIHRoaXMubG9jYWxHYWluTm9kZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyggbm93ICk7XG4gICAgICAgIHRoaXMubG9jYWxHYWluTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKCAxLCBub3cgKTtcblxuICAgICAgICAvLyBjcmVhdGUgYW4gYXVkaW8gYnVmZmVyIHNvdXJjZSBub2RlIGFuZCBjb25uZWN0IGl0IHRvIHRoZSBwcmV2aW91c2x5IGRlY29kZWQgZGF0YSBpbiB0aGUgYXVkaW8gYnVmZmVyXG4gICAgICAgIGNvbnN0IGJ1ZmZlclNvdXJjZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICBidWZmZXJTb3VyY2UuYnVmZmVyID0gd3JhcHBlZEF1ZGlvQnVmZmVyIS5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlO1xuICAgICAgICBidWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKCB0aGlzLnBsYXliYWNrUmF0ZSwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKTtcblxuICAgICAgICAvLyBjb25uZWN0IHRoaXMgc291cmNlIG5vZGUgdG8gdGhlIG91dHB1dFxuICAgICAgICBidWZmZXJTb3VyY2UuY29ubmVjdCggdGhpcy5sb2NhbEdhaW5Ob2RlICk7XG5cbiAgICAgICAgLy8gYWRkIHRoaXMgdG8gdGhlIGxpc3Qgb2YgYWN0aXZlIHNvdXJjZXMgc28gdGhhdCBpdCBjYW4gYmUgc3RvcHBlZCBpZiBuZWNlc3NhcnlcbiAgICAgICAgdGhpcy5hY3RpdmVCdWZmZXJTb3VyY2VzLnB1c2goIGJ1ZmZlclNvdXJjZSApO1xuXG4gICAgICAgIC8vIGFkZCBhIGhhbmRsZXIgZm9yIHdoZW4gdGhlIHNvdW5kIGZpbmlzaGVzIHBsYXlpbmdcbiAgICAgICAgYnVmZmVyU291cmNlLm9uZW5kZWQgPSAoKSA9PiB7XG5cbiAgICAgICAgICAvLyByZW1vdmUgdGhlIHNvdXJjZSBmcm9tIHRoZSBsaXN0IG9mIGFjdGl2ZSBzb3VyY2VzXG4gICAgICAgICAgY29uc3QgaW5kZXhPZlNvdXJjZSA9IHRoaXMuYWN0aXZlQnVmZmVyU291cmNlcy5pbmRleE9mKCBidWZmZXJTb3VyY2UgKTtcbiAgICAgICAgICBpZiAoIGluZGV4T2ZTb3VyY2UgPiAtMSApIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlQnVmZmVyU291cmNlcy5zcGxpY2UoIGluZGV4T2ZTb3VyY2UsIDEgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gc3RhcnQgdGhlIHBsYXliYWNrIG9mIHRoZSBzb3VuZFxuICAgICAgICBidWZmZXJTb3VyY2Uuc3RhcnQoIG5vdyArIGRlbGF5ICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBUaGlzIG1ldGhvZCB3YXMgY2FsbGVkIHdoaWxlIHRoZSBzb3VuZCBjb250ZXh0IHdhcyBub3QgeWV0IHJ1bm5pbmcuICBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlIG1ldGhvZCBpcyBjYWxsZWRcbiAgICAgIC8vIGR1ZSB0byB0aGUgZmlyc3QgaW50ZXJhY3Rpb24gZnJvbSB0aGUgdXNlciwgYW5kIGFsc28gZHVyaW5nIGZ1enogdGVzdGluZy5cblxuICAgICAgLy8gUmVtb3ZlIHByZXZpb3VzIGxpc3RlbmVyIGlmIHByZXNlbnQuXG4gICAgICBpZiAoIHRoaXMuYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VMaXN0ZW5lciApIHtcbiAgICAgICAgYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VNb25pdG9yLnJlbW92ZVN0YXRlQ2hhbmdlTGlzdGVuZXIoIHRoaXMuYXVkaW9Db250ZXh0LCB0aGlzLmF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTGlzdGVuZXIgKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgYSBsaXN0ZW5lciB0byBwbGF5IHRoZSBzcGVjaWZpZWQgc291bmQgd2hlbiB0aGUgYXVkaW8gY29udGV4dCBjaGFuZ2VzIHRvIHRoZSAncnVubmluZycgc3RhdGUuXG4gICAgICB0aGlzLnRpbWVPZkRlZmVycmVkUGxheVJlcXVlc3QgPSBEYXRlLm5vdygpO1xuICAgICAgdGhpcy5hdWRpb0NvbnRleHRTdGF0ZUNoYW5nZUxpc3RlbmVyID0gKCkgPT4ge1xuXG4gICAgICAgIC8vIE9ubHkgcGxheSB0aGUgc291bmQgaWYgaXQgaGFzbid0IGJlZW4gdG9vIGxvbmcsIG90aGVyd2lzZSBpdCBtYXkgYmUgaXJyZWxldmFudC5cbiAgICAgICAgaWYgKCAoIERhdGUubm93KCkgLSB0aGlzLnRpbWVPZkRlZmVycmVkUGxheVJlcXVlc3QgKSAvIDEwMDAgPCBNQVhfUExBWV9ERUZFUl9USU1FICkge1xuXG4gICAgICAgICAgLy8gUGxheSB0aGUgc291bmQsIGJ1dCBkZWxheWVkIGEgbGl0dGxlIGJpdCBzbyB0aGF0IHRoZSBnYWluIG5vZGVzIGNhbiBiZSBmdWxseSB0dXJuZWQgdXAgaW4gdGltZS5cbiAgICAgICAgICB0aGlzLnBsYXlBc3NvY2lhdGVkU291bmQoIHZhbHVlLCAwLjEgKTtcbiAgICAgICAgfVxuICAgICAgICBhdWRpb0NvbnRleHRTdGF0ZUNoYW5nZU1vbml0b3IucmVtb3ZlU3RhdGVDaGFuZ2VMaXN0ZW5lcihcbiAgICAgICAgICB0aGlzLmF1ZGlvQ29udGV4dCxcbiAgICAgICAgICB0aGlzLmF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTGlzdGVuZXIhXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VMaXN0ZW5lciA9IG51bGw7XG4gICAgICB9O1xuICAgICAgYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VNb25pdG9yLmFkZFN0YXRlQ2hhbmdlTGlzdGVuZXIoXG4gICAgICAgIHRoaXMuYXVkaW9Db250ZXh0LFxuICAgICAgICB0aGlzLmF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTGlzdGVuZXJcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgc3BlZWQgdGhhdCB0aGUgc291bmQgcGxheWJhY2sgb2NjdXJzLiBOb3RlLCB0aGlzIGRvZXMgbm90IGFmZmVjdCBwbGF5aW5nIHNvdW5kcywgYnV0IHdpbGwgb25seSBhZmZlY3RcbiAgICogc3Vic2VxdWVudCBwbGF5cyBvZiBzb3VuZHMuXG4gICAqIEBwYXJhbSBwbGF5YmFja1JhdGUgLSBkZXNpcmVkIHBsYXliYWNrIHNwZWVkLCAxID0gbm9ybWFsIHNwZWVkXG4gICAqL1xuICBwdWJsaWMgc2V0UGxheWJhY2tSYXRlKCBwbGF5YmFja1JhdGU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLnBsYXliYWNrUmF0ZSA9IHBsYXliYWNrUmF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHBsYXlpbmcgYW55IHNvdW5kcyB0aGF0IGFyZSBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuXG4gICAqL1xuICBwdWJsaWMgc3RvcEFsbCgpOiB2b2lkIHtcblxuICAgIC8vIFNpbXBseSBjYWxsaW5nIHN0b3AoKSBvbiB0aGUgYnVmZmVyIHNvdXJjZSBmcmVxdWVudGx5IGNhdXNlcyBhbiBhdWRpYmxlIGNsaWNrLCBzbyB3ZSB1c2UgYSBnYWluIG5vZGUgYW5kIHR1cm5cbiAgICAvLyBkb3duIHRoZSBnYWluLCBlZmZlY3RpdmVseSBkb2luZyBhIGZhZGUgb3V0LCBiZWZvcmUgc3RvcHBpbmcgcGxheWJhY2suXG4gICAgY29uc3Qgc3RvcFRpbWUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIFNUT1BfREVMQVlfVElNRTtcbiAgICB0aGlzLmxvY2FsR2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSggMCwgc3RvcFRpbWUgKTtcbiAgICB0aGlzLmFjdGl2ZUJ1ZmZlclNvdXJjZXMuZm9yRWFjaCggc291cmNlID0+IHsgc291cmNlLnN0b3AoIHN0b3BUaW1lICk7IH0gKTtcblxuICAgIC8vIFRoZSBXZWJBdWRpbyBzcGVjIGlzIGEgYml0IHVuY2xlYXIgYWJvdXQgd2hldGhlciBzdG9wcGluZyBhIHNvdW5kIHdpbGwgdHJpZ2dlciBhbiBvbmVuZGVkIGV2ZW50LiAgSW4gdGVzdGluZ1xuICAgIC8vIG9uIENocm9tZSBpbiBTZXB0ZW1iZXIgMjAxOCwgSSAoamJwaGV0KSBmb3VuZCB0aGF0IG9uZW5kZWQgd2FzIE5PVCBiZWluZyBmaXJlZCB3aGVuIHN0b3AoKSB3YXMgY2FsbGVkLCBzbyB0aGVcbiAgICAvLyBjb2RlIGJlbG93IGlzIG5lZWRlZCB0byBjbGVhciB0aGUgYXJyYXkgb2YgYWxsIGFjdGl2ZSBidWZmZXIgc291cmNlcy5cbiAgICB0aGlzLmFjdGl2ZUJ1ZmZlclNvdXJjZXMubGVuZ3RoID0gMDtcbiAgfVxufVxuXG50YW1iby5yZWdpc3RlciggJ011bHRpQ2xpcCcsIE11bHRpQ2xpcCApO1xuZXhwb3J0IGRlZmF1bHQgTXVsdGlDbGlwOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJhdWRpb0NvbnRleHRTdGF0ZUNoYW5nZU1vbml0b3IiLCJ0YW1ibyIsIlNvdW5kR2VuZXJhdG9yIiwiU1RPUF9ERUxBWV9USU1FIiwiTUFYX1BMQVlfREVGRVJfVElNRSIsIk11bHRpQ2xpcCIsInBsYXlBc3NvY2lhdGVkU291bmQiLCJ2YWx1ZSIsImRlbGF5Iiwid3JhcHBlZEF1ZGlvQnVmZmVyIiwidmFsdWVUb1dyYXBwZWRBdWRpb0J1ZmZlck1hcCIsImdldCIsImFzc2VydCIsInVuZGVmaW5lZCIsImF1ZGlvQ29udGV4dCIsInN0YXRlIiwiZnVsbHlFbmFibGVkIiwiYXVkaW9CdWZmZXJQcm9wZXJ0eSIsIm5vdyIsImN1cnJlbnRUaW1lIiwibG9jYWxHYWluTm9kZSIsImdhaW4iLCJjYW5jZWxTY2hlZHVsZWRWYWx1ZXMiLCJzZXRWYWx1ZUF0VGltZSIsImJ1ZmZlclNvdXJjZSIsImNyZWF0ZUJ1ZmZlclNvdXJjZSIsImJ1ZmZlciIsInBsYXliYWNrUmF0ZSIsImNvbm5lY3QiLCJhY3RpdmVCdWZmZXJTb3VyY2VzIiwicHVzaCIsIm9uZW5kZWQiLCJpbmRleE9mU291cmNlIiwiaW5kZXhPZiIsInNwbGljZSIsInN0YXJ0IiwiYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VMaXN0ZW5lciIsInJlbW92ZVN0YXRlQ2hhbmdlTGlzdGVuZXIiLCJ0aW1lT2ZEZWZlcnJlZFBsYXlSZXF1ZXN0IiwiRGF0ZSIsImFkZFN0YXRlQ2hhbmdlTGlzdGVuZXIiLCJzZXRQbGF5YmFja1JhdGUiLCJzdG9wQWxsIiwic3RvcFRpbWUiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsImZvckVhY2giLCJzb3VyY2UiLCJzdG9wIiwibGVuZ3RoIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImluaXRpYWxQbGF5YmFja1JhdGUiLCJjcmVhdGVHYWluIiwic291bmRTb3VyY2VEZXN0aW5hdGlvbiIsImZ1bGx5RW5hYmxlZFByb3BlcnR5IiwibGF6eUxpbmsiLCJOdW1iZXIiLCJORUdBVElWRV9JTkZJTklUWSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Q0FhQyxHQUVELE9BQU9BLGVBQWUscUNBQXFDO0FBQzNELE9BQU9DLG9DQUFvQyx1Q0FBdUM7QUFDbEYsT0FBT0MsV0FBVyxjQUFjO0FBRWhDLE9BQU9DLG9CQUErQyxzQkFBc0I7QUFPNUUsWUFBWTtBQUNaLE1BQU1DLGtCQUFrQixLQUFLLDhEQUE4RDtBQUMzRixNQUFNQyxzQkFBc0IsS0FBSyx5RkFBeUY7QUFFMUgsSUFBQSxBQUFNQyxZQUFOLE1BQU1BLGtCQUFxQkg7SUFxRHpCOztHQUVDLEdBQ0QsQUFBT0ksb0JBQXFCQyxLQUFRLEVBQUVDLFFBQVEsQ0FBQyxFQUFTO1FBRXRELHNDQUFzQztRQUN0QyxNQUFNQyxxQkFBcUIsSUFBSSxDQUFDQyw0QkFBNEIsQ0FBQ0MsR0FBRyxDQUFFSjtRQUVsRSxxREFBcUQ7UUFDckRL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