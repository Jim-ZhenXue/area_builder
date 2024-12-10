// Copyright 2018-2024, University of Colorado Boulder
/**
 * white noise generator with optional low- and high-pass filters
 *
 * @author John Blanco
 */ import dotRandom from '../../../dot/js/dotRandom.js';
import optionize from '../../../phet-core/js/optionize.js';
import audioContextStateChangeMonitor from '../audioContextStateChangeMonitor.js';
import soundConstants from '../soundConstants.js';
import tambo from '../tambo.js';
import SoundGenerator from './SoundGenerator.js';
// constants
const NOISE_BUFFER_SECONDS = 2;
const PARAMETER_CHANGE_TIME_CONSTANT = soundConstants.DEFAULT_PARAM_CHANGE_TIME_CONSTANT;
const LFO_DEPTH_CHANGE_TIME_CONSTANT = 0.05;
let NoiseGenerator = class NoiseGenerator extends SoundGenerator {
    /**
   * Get a value that indicates whether noise is currently being played.
   */ get isPlaying() {
        return this._isPlaying;
    }
    /**
   * Start the noise source.
   * @param [delay] - optional delay for when to start the noise source, in seconds
   */ start(delay = 0) {
        if (this.audioContext.state === 'running') {
            const now = this.audioContext.currentTime;
            // only do something if not already playing, otherwise ignore this request
            if (!this._isPlaying) {
                this.noiseSource = this.audioContext.createBufferSource();
                this.noiseSource.buffer = this.noiseBuffer;
                this.noiseSource.loop = true;
                this.noiseSource.connect(this.noiseSourceConnectionPoint);
                this.noiseSource.start(now + delay);
            }
        } else {
            // This method was called when the audio context was not yet running, so add a listener to start if and when the
            // audio context state changes.
            this.timeOfDeferredStartRequest = Date.now();
            if (!audioContextStateChangeMonitor.hasListener(this.audioContext, this.audioContextStateChangeListener)) {
                audioContextStateChangeMonitor.addStateChangeListener(this.audioContext, this.audioContextStateChangeListener);
            }
        }
        // set the flag even if the start is deferred, since it is used to decide whether to do a deferred start
        this._isPlaying = true;
    }
    /**
   * Stop the noise source.
   * @param [time] - optional audio context time at which this should be stopped
   */ stop(time = 0) {
        // only stop if playing, otherwise ignore
        if (this._isPlaying && this.noiseSource) {
            this.noiseSource.stop(time);
            this.noiseSource = null;
        }
        this._isPlaying = false;
    }
    /**
   * Set the frequency of the low frequency amplitude modulator (LFO).
   */ setLfoFrequency(frequency) {
        this.lfo.frequency.setTargetAtTime(frequency, this.audioContext.currentTime, PARAMETER_CHANGE_TIME_CONSTANT);
    }
    /**
   * Set the depth of the LFO modulator.
   * @param depth - depth value from 0 (no modulation) to 1 (max modulation)
   */ setLfoDepth(depth) {
        this.lfoAttenuatorGainNode.gain.setTargetAtTime(depth / 2, this.audioContext.currentTime, LFO_DEPTH_CHANGE_TIME_CONSTANT);
    }
    /**
   * Turn the low frequency amplitude modulation on/off.
   */ setLfoEnabled(enabled) {
        if (enabled) {
            this.lfoAttenuatorGainNode.gain.setTargetAtTime(0.5, this.audioContext.currentTime, PARAMETER_CHANGE_TIME_CONSTANT);
            this.lfoAttenuatorGainNode.connect(this.lfoControlledGainNode.gain);
        } else {
            this.lfoAttenuatorGainNode.disconnect(this.lfoControlledGainNode.gain);
            this.lfoAttenuatorGainNode.gain.setTargetAtTime(1, this.audioContext.currentTime, PARAMETER_CHANGE_TIME_CONSTANT);
        }
    }
    /**
   * set the Q value for the band pass filter, assumes that noise generator was created with this filter enabled
   */ setBandpassFilterCenterFrequency(frequency, timeConstant = PARAMETER_CHANGE_TIME_CONSTANT) {
        if (this.bandPassFilter !== null) {
            this.bandPassFilter.frequency.setTargetAtTime(frequency, this.audioContext.currentTime, timeConstant);
        }
    }
    constructor(providedOptions){
        const options = optionize()({
            noiseType: 'pink',
            lowPassCutoffFrequency: null,
            highPassCutoffFrequency: null,
            centerFrequency: null,
            qFactor: 1,
            lfoInitiallyEnabled: false,
            lfoInitialFrequency: 2,
            lfoInitialDepth: 1,
            lfoType: 'sine'
        }, providedOptions);
        assert && assert([
            'white',
            'pink',
            'brown'
        ].includes(options.noiseType), `invalid noise type: ${options.noiseType}`);
        assert && assert(options.lfoInitialDepth >= 0 && options.lfoInitialDepth <= 1, `invalid value for lfoInitialDepth: ${options.lfoInitialDepth}`);
        super(options);
        const now = this.audioContext.currentTime;
        // if specified, create the low-pass filter
        let lowPassFilter;
        if (options.lowPassCutoffFrequency) {
            lowPassFilter = this.audioContext.createBiquadFilter();
            lowPassFilter.type = 'lowpass';
            lowPassFilter.frequency.setValueAtTime(options.lowPassCutoffFrequency, now);
        }
        // if specified, create the high-pass filter
        let highPassFilter;
        if (options.highPassCutoffFrequency) {
            highPassFilter = this.audioContext.createBiquadFilter();
            highPassFilter.type = 'highpass';
            highPassFilter.frequency.setValueAtTime(options.highPassCutoffFrequency, now);
        }
        // if specified, create the band-pass filter
        if (options.qFactor && options.centerFrequency) {
            this.bandPassFilter = this.audioContext.createBiquadFilter();
            this.bandPassFilter.type = 'bandpass';
            this.bandPassFilter.frequency.setValueAtTime(options.centerFrequency, now);
            this.bandPassFilter.Q.setValueAtTime(options.qFactor, now);
        } else {
            this.bandPassFilter = null;
        }
        // define the noise data
        const noiseBufferSize = NOISE_BUFFER_SECONDS * this.audioContext.sampleRate;
        this.noiseBuffer = this.audioContext.createBuffer(1, noiseBufferSize, this.audioContext.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        // fill in the sample buffer based on the noise type
        let white;
        if (options.noiseType === 'white') {
            for(let i = 0; i < noiseBufferSize; i++){
                data[i] = dotRandom.nextDouble() * 2 - 1;
            }
        } else if (options.noiseType === 'pink') {
            let b0 = 0;
            let b1 = 0;
            let b2 = 0;
            let b3 = 0;
            let b4 = 0;
            let b5 = 0;
            let b6 = 0;
            for(let i = 0; i < noiseBufferSize; i++){
                white = dotRandom.nextDouble() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                data[i] *= 0.11; // adjust to 0dB, empirically determined, will be approximate due to randomness of data
                b6 = white * 0.115926;
            }
        } else if (options.noiseType === 'brown') {
            let lastOut = 0;
            for(let i = 0; i < noiseBufferSize; i++){
                white = dotRandom.nextDouble() * 2 - 1;
                data[i] = (lastOut + 0.02 * white) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // adjust to 0dB, empirically determined, will be approximate due to randomness of data
            }
        } else {
            throw new Error(`unexpected value for noiseType: ${options.noiseType}`);
        }
        // the source node from which the noise is played, set when play is called
        this.noiseSource = null;
        // set up the low frequency oscillator (LFO) for amplitude modulation
        this.lfo = this.audioContext.createOscillator();
        this.lfo.type = options.lfoType;
        // initialize LFO frequency, updated through methods defined below
        this.lfo.frequency.setValueAtTime(options.lfoInitialFrequency, now);
        this.lfo.start();
        // set up the gain stage that will attenuate the LFO output so that it will range from -0.5 to +0.5
        this.lfoAttenuatorGainNode = this.audioContext.createGain();
        this.lfoAttenuatorGainNode.gain.value = options.lfoInitialDepth / 2;
        this.lfo.connect(this.lfoAttenuatorGainNode);
        // set up the gain stage for the LFO - the main sound path will run through here
        this.lfoControlledGainNode = this.audioContext.createGain();
        this.lfoControlledGainNode.gain.value = 0.5; // this value is added to the attenuated LFO output value
        // set the initial enabled state of the LFO
        if (options.lfoInitiallyEnabled) {
            this.lfoAttenuatorGainNode.gain.setTargetAtTime(0.5, this.audioContext.currentTime, PARAMETER_CHANGE_TIME_CONSTANT);
            this.lfoAttenuatorGainNode.connect(this.lfoControlledGainNode.gain);
        } else {
            this.lfoAttenuatorGainNode.gain.setTargetAtTime(1, this.audioContext.currentTime, PARAMETER_CHANGE_TIME_CONSTANT);
        }
        // wire up the audio path, working our way from the output back to the sound source(s)
        this.lfoControlledGainNode.connect(this.soundSourceDestination);
        let nextOutputToConnect = this.lfoControlledGainNode;
        if (highPassFilter) {
            highPassFilter.connect(nextOutputToConnect);
            nextOutputToConnect = highPassFilter;
        }
        if (lowPassFilter) {
            lowPassFilter.connect(nextOutputToConnect);
            nextOutputToConnect = lowPassFilter;
        }
        if (this.bandPassFilter) {
            this.bandPassFilter.connect(nextOutputToConnect);
            nextOutputToConnect = this.bandPassFilter;
        }
        this.noiseSourceConnectionPoint = nextOutputToConnect;
        this._isPlaying = false;
        this.timeOfDeferredStartRequest = Number.NEGATIVE_INFINITY;
        // define the listener for audio context state transitions
        this.audioContextStateChangeListener = (state)=>{
            if (state === 'running' && this._isPlaying) {
                this.start();
                // automatically remove after firing
                audioContextStateChangeMonitor.removeStateChangeListener(this.audioContext, this.audioContextStateChangeListener);
            }
        };
    }
};
tambo.register('NoiseGenerator', NoiseGenerator);
export default NoiseGenerator;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvTm9pc2VHZW5lcmF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogd2hpdGUgbm9pc2UgZ2VuZXJhdG9yIHdpdGggb3B0aW9uYWwgbG93LSBhbmQgaGlnaC1wYXNzIGZpbHRlcnNcbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VNb25pdG9yIGZyb20gJy4uL2F1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTW9uaXRvci5qcyc7XG5pbXBvcnQgc291bmRDb25zdGFudHMgZnJvbSAnLi4vc291bmRDb25zdGFudHMuanMnO1xuaW1wb3J0IHRhbWJvIGZyb20gJy4uL3RhbWJvLmpzJztcbmltcG9ydCBTb3VuZEdlbmVyYXRvciwgeyBTb3VuZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tICcuL1NvdW5kR2VuZXJhdG9yLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgbm9pc2VUeXBlPzogJ3BpbmsnIHwgJ3doaXRlJyB8ICdicm93bic7XG5cbiAgLy8gbG93IHBhc3MgdmFsdWUgaW4gSHosIG51bGwgKG9yIGFueSBmYWxzZXkgdmFsdWUgaW5jbHVkaW5nIHplcm8pIG1lYW5zIG5vIGxvdyBwYXNzIGZpbHRlciBpcyBhZGRlZFxuICBsb3dQYXNzQ3V0b2ZmRnJlcXVlbmN5PzogbnVtYmVyIHwgbnVsbDtcblxuICAvLyBoaWdoIHBhc3MgdmFsdWUgaW4gSHosIG51bGwgKG9yIGFueSBmYWxzZXkgdmFsdWUgaW5jbHVkaW5nIHplcm8pIG1lYW5zIG5vIGhpZ2ggcGFzcyBmaWx0ZXIgaXMgYWRkZWRcbiAgaGlnaFBhc3NDdXRvZmZGcmVxdWVuY3k/OiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIGNlbnRlciBmcmVxdWVuY3kgZm9yIGJhbmQgcGFzcyBmaWx0ZXIgdmFsdWUgaW4gSHosIG51bGwgKG9yIGFueSBmYWxzZXkgdmFsdWUgaW5jbHVkaW5nIHplcm8pIG1lYW5zIG5vIGJhbmQgcGFzc1xuICAvLyBmaWx0ZXIgaXMgYWRkZWRcbiAgY2VudGVyRnJlcXVlbmN5PzogbnVtYmVyIHwgbnVsbDtcblxuICAvLyBRIGZhY3RvciwgYWthIHF1YWxpdHkgZmFjdG9yLCBmb3IgYmFuZHBhc3MgZmlsdGVyIGlmIHByZXNlbnQsIHNlZSBXZWIgQXVkaW8gQmlxdWFkRmlsdGVyTm9kZSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICBxRmFjdG9yPzogbnVtYmVyO1xuXG4gIC8vIHBhcmFtZXRlcnMgdGhhdCBjb250cm9sIHRoZSBiZWhhdmlvciBvZiB0aGUgbG93IGZyZXF1ZW5jeSBvc2NpbGxhdG9yIChMRk8pLCB3aGljaCBkb2VzIGFtcGxpdHVkZSBtb2R1bGF0aW9uIG9uXG4gIC8vIHRoZSBub2lzZVxuICBsZm9Jbml0aWFsbHlFbmFibGVkPzogYm9vbGVhbjtcbiAgbGZvSW5pdGlhbEZyZXF1ZW5jeT86IG51bWJlcjsgLy8gaW4gSHpcbiAgbGZvSW5pdGlhbERlcHRoPzogbnVtYmVyOyAvLyB2YWxpZCB2YWx1ZXMgYXJlIGZyb20gMCB0byAxXG4gIGxmb1R5cGU/OiBPc2NpbGxhdG9yVHlwZTtcbn07XG5leHBvcnQgdHlwZSBOb2lzZUdlbmVyYXRvck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFNvdW5kR2VuZXJhdG9yT3B0aW9ucztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBOT0lTRV9CVUZGRVJfU0VDT05EUyA9IDI7XG5jb25zdCBQQVJBTUVURVJfQ0hBTkdFX1RJTUVfQ09OU1RBTlQgPSBzb3VuZENvbnN0YW50cy5ERUZBVUxUX1BBUkFNX0NIQU5HRV9USU1FX0NPTlNUQU5UO1xuY29uc3QgTEZPX0RFUFRIX0NIQU5HRV9USU1FX0NPTlNUQU5UID0gMC4wNTtcblxuY2xhc3MgTm9pc2VHZW5lcmF0b3IgZXh0ZW5kcyBTb3VuZEdlbmVyYXRvciB7XG5cbiAgLy8gZmlsdGVyIHRoYXQgaXMgcG90ZW50aWFsbHkgdXNlZCBvbiB0aGUgbm9pc2Ugc2lnbmFsXG4gIHByaXZhdGUgcmVhZG9ubHkgYmFuZFBhc3NGaWx0ZXI6IEJpcXVhZEZpbHRlck5vZGUgfCBudWxsO1xuXG4gIC8vIGJ1ZmZlciB0aGF0IGhvbGRzIHRoZSBub2lzZSBzYW1wbGVzXG4gIHByaXZhdGUgcmVhZG9ubHkgbm9pc2VCdWZmZXI6IEF1ZGlvQnVmZmVyO1xuXG4gIC8vIHRoZSBzb3VyY2Ugbm9kZSBmcm9tIHdoaWNoIHRoZSBub2lzZSBpcyBwbGF5ZWQsIHNldCB3aGVuIHBsYXkgaXMgY2FsbGVkXG4gIHByaXZhdGUgbm9pc2VTb3VyY2U6IEF1ZGlvQnVmZmVyU291cmNlTm9kZSB8IG51bGw7XG5cbiAgLy8gdGhlIGxvdyBmcmVxdWVuY3kgb3NjaWxsYXRvciB0aGF0IGNhbiBiZSB1c2VkIHRvIGRvIGFtcGxpdHVkZSBtb2R1bGF0aW9uIG9uIHRoZSBub2lzZSBzaWduYWxcbiAgcHJpdmF0ZSByZWFkb25seSBsZm86IE9zY2lsbGF0b3JOb2RlO1xuXG4gIC8vIGdhaW4gbm9kZSB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IGFtcGxpdHVkZSBtb2R1bGF0aW9uXG4gIHByaXZhdGUgcmVhZG9ubHkgbGZvQXR0ZW51YXRvckdhaW5Ob2RlOiBHYWluTm9kZTtcblxuICAvLyBnYWluIG5vZGUgdGhhdCBjb250cm9scyB0aGUgYW1vdW50IG9mIGxvdy1mcmVxdWVuY3kgYW1wbGl0dWRlIG1vZHVsYXRpb25cbiAgcHJpdmF0ZSByZWFkb25seSBsZm9Db250cm9sbGVkR2Fpbk5vZGU6IEdhaW5Ob2RlO1xuXG4gIC8vIHBvaW50IHdoZXJlIHRoZSBub2lzZSBzb3VyY2UgY29ubmVjdHNcbiAgcHJpdmF0ZSByZWFkb25seSBub2lzZVNvdXJjZUNvbm5lY3Rpb25Qb2ludDogQXVkaW9Ob2RlO1xuXG4gIC8vIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciB0aGUgbm9pc2UgaXMgcGxheWluZ1xuICBwcml2YXRlIF9pc1BsYXlpbmc6IGJvb2xlYW47XG5cbiAgLy8gdGltZSBhdCB3aGljaCBhIHBsYXkgcmVxdWVzdCBvY2N1cnJlZCB0aGF0IGNvdWxkbid0IGJlIHBlcmZvcm1lZCBhbmQgd2FzIHN1YnNlcXVlbnRseSBkZWZlcnJlZFxuICBwcml2YXRlIHRpbWVPZkRlZmVycmVkU3RhcnRSZXF1ZXN0OiBudW1iZXI7XG5cbiAgLy8gZnVuY3Rpb24gdGhhdCBoYW5kbGVzIGNoYW5nZXMgdG8gdGhlIGF1ZGlvIGNvbnRleHRcbiAgcHJpdmF0ZSByZWFkb25seSBhdWRpb0NvbnRleHRTdGF0ZUNoYW5nZUxpc3RlbmVyOiAoIHN0YXRlOiBzdHJpbmcgKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogTm9pc2VHZW5lcmF0b3JPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxOb2lzZUdlbmVyYXRvck9wdGlvbnMsIFNlbGZPcHRpb25zLCBTb3VuZEdlbmVyYXRvck9wdGlvbnM+KCkoIHtcbiAgICAgIG5vaXNlVHlwZTogJ3BpbmsnLFxuICAgICAgbG93UGFzc0N1dG9mZkZyZXF1ZW5jeTogbnVsbCxcbiAgICAgIGhpZ2hQYXNzQ3V0b2ZmRnJlcXVlbmN5OiBudWxsLFxuICAgICAgY2VudGVyRnJlcXVlbmN5OiBudWxsLFxuICAgICAgcUZhY3RvcjogMSxcbiAgICAgIGxmb0luaXRpYWxseUVuYWJsZWQ6IGZhbHNlLFxuICAgICAgbGZvSW5pdGlhbEZyZXF1ZW5jeTogMixcbiAgICAgIGxmb0luaXRpYWxEZXB0aDogMSxcbiAgICAgIGxmb1R5cGU6ICdzaW5lJ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcbiAgICAgIFsgJ3doaXRlJywgJ3BpbmsnLCAnYnJvd24nIF0uaW5jbHVkZXMoIG9wdGlvbnMubm9pc2VUeXBlICksXG4gICAgICBgaW52YWxpZCBub2lzZSB0eXBlOiAke29wdGlvbnMubm9pc2VUeXBlfWBcbiAgICApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcbiAgICBvcHRpb25zLmxmb0luaXRpYWxEZXB0aCA+PSAwICYmIG9wdGlvbnMubGZvSW5pdGlhbERlcHRoIDw9IDEsXG4gICAgICBgaW52YWxpZCB2YWx1ZSBmb3IgbGZvSW5pdGlhbERlcHRoOiAke29wdGlvbnMubGZvSW5pdGlhbERlcHRofWBcbiAgICApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIGNvbnN0IG5vdyA9IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuXG4gICAgLy8gaWYgc3BlY2lmaWVkLCBjcmVhdGUgdGhlIGxvdy1wYXNzIGZpbHRlclxuICAgIGxldCBsb3dQYXNzRmlsdGVyO1xuICAgIGlmICggb3B0aW9ucy5sb3dQYXNzQ3V0b2ZmRnJlcXVlbmN5ICkge1xuICAgICAgbG93UGFzc0ZpbHRlciA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xuICAgICAgbG93UGFzc0ZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xuICAgICAgbG93UGFzc0ZpbHRlci5mcmVxdWVuY3kuc2V0VmFsdWVBdFRpbWUoIG9wdGlvbnMubG93UGFzc0N1dG9mZkZyZXF1ZW5jeSwgbm93ICk7XG4gICAgfVxuXG4gICAgLy8gaWYgc3BlY2lmaWVkLCBjcmVhdGUgdGhlIGhpZ2gtcGFzcyBmaWx0ZXJcbiAgICBsZXQgaGlnaFBhc3NGaWx0ZXI7XG4gICAgaWYgKCBvcHRpb25zLmhpZ2hQYXNzQ3V0b2ZmRnJlcXVlbmN5ICkge1xuICAgICAgaGlnaFBhc3NGaWx0ZXIgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcbiAgICAgIGhpZ2hQYXNzRmlsdGVyLnR5cGUgPSAnaGlnaHBhc3MnO1xuICAgICAgaGlnaFBhc3NGaWx0ZXIuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKCBvcHRpb25zLmhpZ2hQYXNzQ3V0b2ZmRnJlcXVlbmN5LCBub3cgKTtcbiAgICB9XG5cbiAgICAvLyBpZiBzcGVjaWZpZWQsIGNyZWF0ZSB0aGUgYmFuZC1wYXNzIGZpbHRlclxuICAgIGlmICggb3B0aW9ucy5xRmFjdG9yICYmIG9wdGlvbnMuY2VudGVyRnJlcXVlbmN5ICkge1xuICAgICAgdGhpcy5iYW5kUGFzc0ZpbHRlciA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xuICAgICAgdGhpcy5iYW5kUGFzc0ZpbHRlci50eXBlID0gJ2JhbmRwYXNzJztcbiAgICAgIHRoaXMuYmFuZFBhc3NGaWx0ZXIuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKCBvcHRpb25zLmNlbnRlckZyZXF1ZW5jeSwgbm93ICk7XG4gICAgICB0aGlzLmJhbmRQYXNzRmlsdGVyLlEuc2V0VmFsdWVBdFRpbWUoIG9wdGlvbnMucUZhY3Rvciwgbm93ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5iYW5kUGFzc0ZpbHRlciA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gZGVmaW5lIHRoZSBub2lzZSBkYXRhXG4gICAgY29uc3Qgbm9pc2VCdWZmZXJTaXplID0gTk9JU0VfQlVGRkVSX1NFQ09ORFMgKiB0aGlzLmF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlO1xuICAgIHRoaXMubm9pc2VCdWZmZXIgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoIDEsIG5vaXNlQnVmZmVyU2l6ZSwgdGhpcy5hdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSApO1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLm5vaXNlQnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICk7XG5cbiAgICAvLyBmaWxsIGluIHRoZSBzYW1wbGUgYnVmZmVyIGJhc2VkIG9uIHRoZSBub2lzZSB0eXBlXG4gICAgbGV0IHdoaXRlO1xuICAgIGlmICggb3B0aW9ucy5ub2lzZVR5cGUgPT09ICd3aGl0ZScgKSB7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBub2lzZUJ1ZmZlclNpemU7IGkrKyApIHtcbiAgICAgICAgZGF0YVsgaSBdID0gZG90UmFuZG9tLm5leHREb3VibGUoKSAqIDIgLSAxO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICggb3B0aW9ucy5ub2lzZVR5cGUgPT09ICdwaW5rJyApIHtcbiAgICAgIGxldCBiMCA9IDA7XG4gICAgICBsZXQgYjEgPSAwO1xuICAgICAgbGV0IGIyID0gMDtcbiAgICAgIGxldCBiMyA9IDA7XG4gICAgICBsZXQgYjQgPSAwO1xuICAgICAgbGV0IGI1ID0gMDtcbiAgICAgIGxldCBiNiA9IDA7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBub2lzZUJ1ZmZlclNpemU7IGkrKyApIHtcbiAgICAgICAgd2hpdGUgPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogMiAtIDE7XG4gICAgICAgIGIwID0gMC45OTg4NiAqIGIwICsgd2hpdGUgKiAwLjA1NTUxNzk7XG4gICAgICAgIGIxID0gMC45OTMzMiAqIGIxICsgd2hpdGUgKiAwLjA3NTA3NTk7XG4gICAgICAgIGIyID0gMC45NjkwMCAqIGIyICsgd2hpdGUgKiAwLjE1Mzg1MjA7XG4gICAgICAgIGIzID0gMC44NjY1MCAqIGIzICsgd2hpdGUgKiAwLjMxMDQ4NTY7XG4gICAgICAgIGI0ID0gMC41NTAwMCAqIGI0ICsgd2hpdGUgKiAwLjUzMjk1MjI7XG4gICAgICAgIGI1ID0gLTAuNzYxNiAqIGI1IC0gd2hpdGUgKiAwLjAxNjg5ODA7XG4gICAgICAgIGRhdGFbIGkgXSA9IGIwICsgYjEgKyBiMiArIGIzICsgYjQgKyBiNSArIGI2ICsgd2hpdGUgKiAwLjUzNjI7XG4gICAgICAgIGRhdGFbIGkgXSAqPSAwLjExOyAvLyBhZGp1c3QgdG8gMGRCLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkLCB3aWxsIGJlIGFwcHJveGltYXRlIGR1ZSB0byByYW5kb21uZXNzIG9mIGRhdGFcbiAgICAgICAgYjYgPSB3aGl0ZSAqIDAuMTE1OTI2O1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICggb3B0aW9ucy5ub2lzZVR5cGUgPT09ICdicm93bicgKSB7XG4gICAgICBsZXQgbGFzdE91dCA9IDA7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBub2lzZUJ1ZmZlclNpemU7IGkrKyApIHtcbiAgICAgICAgd2hpdGUgPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogMiAtIDE7XG4gICAgICAgIGRhdGFbIGkgXSA9ICggbGFzdE91dCArICggMC4wMiAqIHdoaXRlICkgKSAvIDEuMDI7XG4gICAgICAgIGxhc3RPdXQgPSBkYXRhWyBpIF07XG4gICAgICAgIGRhdGFbIGkgXSAqPSAzLjU7IC8vIGFkanVzdCB0byAwZEIsIGVtcGlyaWNhbGx5IGRldGVybWluZWQsIHdpbGwgYmUgYXBwcm94aW1hdGUgZHVlIHRvIHJhbmRvbW5lc3Mgb2YgZGF0YVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYHVuZXhwZWN0ZWQgdmFsdWUgZm9yIG5vaXNlVHlwZTogJHtvcHRpb25zLm5vaXNlVHlwZX1gICk7XG4gICAgfVxuXG4gICAgLy8gdGhlIHNvdXJjZSBub2RlIGZyb20gd2hpY2ggdGhlIG5vaXNlIGlzIHBsYXllZCwgc2V0IHdoZW4gcGxheSBpcyBjYWxsZWRcbiAgICB0aGlzLm5vaXNlU291cmNlID0gbnVsbDtcblxuICAgIC8vIHNldCB1cCB0aGUgbG93IGZyZXF1ZW5jeSBvc2NpbGxhdG9yIChMRk8pIGZvciBhbXBsaXR1ZGUgbW9kdWxhdGlvblxuICAgIHRoaXMubGZvID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgIHRoaXMubGZvLnR5cGUgPSBvcHRpb25zLmxmb1R5cGU7XG5cbiAgICAvLyBpbml0aWFsaXplIExGTyBmcmVxdWVuY3ksIHVwZGF0ZWQgdGhyb3VnaCBtZXRob2RzIGRlZmluZWQgYmVsb3dcbiAgICB0aGlzLmxmby5mcmVxdWVuY3kuc2V0VmFsdWVBdFRpbWUoIG9wdGlvbnMubGZvSW5pdGlhbEZyZXF1ZW5jeSwgbm93ICk7XG4gICAgdGhpcy5sZm8uc3RhcnQoKTtcblxuICAgIC8vIHNldCB1cCB0aGUgZ2FpbiBzdGFnZSB0aGF0IHdpbGwgYXR0ZW51YXRlIHRoZSBMRk8gb3V0cHV0IHNvIHRoYXQgaXQgd2lsbCByYW5nZSBmcm9tIC0wLjUgdG8gKzAuNVxuICAgIHRoaXMubGZvQXR0ZW51YXRvckdhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMubGZvQXR0ZW51YXRvckdhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRpb25zLmxmb0luaXRpYWxEZXB0aCAvIDI7XG4gICAgdGhpcy5sZm8uY29ubmVjdCggdGhpcy5sZm9BdHRlbnVhdG9yR2Fpbk5vZGUgKTtcblxuICAgIC8vIHNldCB1cCB0aGUgZ2FpbiBzdGFnZSBmb3IgdGhlIExGTyAtIHRoZSBtYWluIHNvdW5kIHBhdGggd2lsbCBydW4gdGhyb3VnaCBoZXJlXG4gICAgdGhpcy5sZm9Db250cm9sbGVkR2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5sZm9Db250cm9sbGVkR2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDAuNTsgLy8gdGhpcyB2YWx1ZSBpcyBhZGRlZCB0byB0aGUgYXR0ZW51YXRlZCBMRk8gb3V0cHV0IHZhbHVlXG5cbiAgICAvLyBzZXQgdGhlIGluaXRpYWwgZW5hYmxlZCBzdGF0ZSBvZiB0aGUgTEZPXG4gICAgaWYgKCBvcHRpb25zLmxmb0luaXRpYWxseUVuYWJsZWQgKSB7XG4gICAgICB0aGlzLmxmb0F0dGVudWF0b3JHYWluTm9kZS5nYWluLnNldFRhcmdldEF0VGltZSggMC41LCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSwgUEFSQU1FVEVSX0NIQU5HRV9USU1FX0NPTlNUQU5UICk7XG4gICAgICB0aGlzLmxmb0F0dGVudWF0b3JHYWluTm9kZS5jb25uZWN0KCB0aGlzLmxmb0NvbnRyb2xsZWRHYWluTm9kZS5nYWluICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5sZm9BdHRlbnVhdG9yR2Fpbk5vZGUuZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoIDEsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lLCBQQVJBTUVURVJfQ0hBTkdFX1RJTUVfQ09OU1RBTlQgKTtcbiAgICB9XG5cbiAgICAvLyB3aXJlIHVwIHRoZSBhdWRpbyBwYXRoLCB3b3JraW5nIG91ciB3YXkgZnJvbSB0aGUgb3V0cHV0IGJhY2sgdG8gdGhlIHNvdW5kIHNvdXJjZShzKVxuICAgIHRoaXMubGZvQ29udHJvbGxlZEdhaW5Ob2RlLmNvbm5lY3QoIHRoaXMuc291bmRTb3VyY2VEZXN0aW5hdGlvbiApO1xuICAgIGxldCBuZXh0T3V0cHV0VG9Db25uZWN0ID0gdGhpcy5sZm9Db250cm9sbGVkR2Fpbk5vZGU7XG4gICAgaWYgKCBoaWdoUGFzc0ZpbHRlciApIHtcbiAgICAgIGhpZ2hQYXNzRmlsdGVyLmNvbm5lY3QoIG5leHRPdXRwdXRUb0Nvbm5lY3QgKTtcbiAgICAgIG5leHRPdXRwdXRUb0Nvbm5lY3QgPSBoaWdoUGFzc0ZpbHRlcjtcbiAgICB9XG4gICAgaWYgKCBsb3dQYXNzRmlsdGVyICkge1xuICAgICAgbG93UGFzc0ZpbHRlci5jb25uZWN0KCBuZXh0T3V0cHV0VG9Db25uZWN0ICk7XG4gICAgICBuZXh0T3V0cHV0VG9Db25uZWN0ID0gbG93UGFzc0ZpbHRlcjtcbiAgICB9XG4gICAgaWYgKCB0aGlzLmJhbmRQYXNzRmlsdGVyICkge1xuICAgICAgdGhpcy5iYW5kUGFzc0ZpbHRlci5jb25uZWN0KCBuZXh0T3V0cHV0VG9Db25uZWN0ICk7XG4gICAgICBuZXh0T3V0cHV0VG9Db25uZWN0ID0gdGhpcy5iYW5kUGFzc0ZpbHRlcjtcbiAgICB9XG5cbiAgICB0aGlzLm5vaXNlU291cmNlQ29ubmVjdGlvblBvaW50ID0gbmV4dE91dHB1dFRvQ29ubmVjdDtcbiAgICB0aGlzLl9pc1BsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnRpbWVPZkRlZmVycmVkU3RhcnRSZXF1ZXN0ID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xuXG4gICAgLy8gZGVmaW5lIHRoZSBsaXN0ZW5lciBmb3IgYXVkaW8gY29udGV4dCBzdGF0ZSB0cmFuc2l0aW9uc1xuICAgIHRoaXMuYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VMaXN0ZW5lciA9IHN0YXRlID0+IHtcblxuICAgICAgaWYgKCBzdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMuX2lzUGxheWluZyApIHtcblxuICAgICAgICB0aGlzLnN0YXJ0KCk7XG5cbiAgICAgICAgLy8gYXV0b21hdGljYWxseSByZW1vdmUgYWZ0ZXIgZmlyaW5nXG4gICAgICAgIGF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTW9uaXRvci5yZW1vdmVTdGF0ZUNoYW5nZUxpc3RlbmVyKFxuICAgICAgICAgIHRoaXMuYXVkaW9Db250ZXh0LFxuICAgICAgICAgIHRoaXMuYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VMaXN0ZW5lclxuICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBub2lzZSBpcyBjdXJyZW50bHkgYmVpbmcgcGxheWVkLlxuICAgKi9cbiAgcHVibGljIGdldCBpc1BsYXlpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzUGxheWluZztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgbm9pc2Ugc291cmNlLlxuICAgKiBAcGFyYW0gW2RlbGF5XSAtIG9wdGlvbmFsIGRlbGF5IGZvciB3aGVuIHRvIHN0YXJ0IHRoZSBub2lzZSBzb3VyY2UsIGluIHNlY29uZHNcbiAgICovXG4gIHB1YmxpYyBzdGFydCggZGVsYXkgPSAwICk6IHZvaWQge1xuXG4gICAgaWYgKCB0aGlzLmF1ZGlvQ29udGV4dC5zdGF0ZSA9PT0gJ3J1bm5pbmcnICkge1xuXG4gICAgICBjb25zdCBub3cgPSB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcblxuICAgICAgLy8gb25seSBkbyBzb21ldGhpbmcgaWYgbm90IGFscmVhZHkgcGxheWluZywgb3RoZXJ3aXNlIGlnbm9yZSB0aGlzIHJlcXVlc3RcbiAgICAgIGlmICggIXRoaXMuX2lzUGxheWluZyApIHtcbiAgICAgICAgdGhpcy5ub2lzZVNvdXJjZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB0aGlzLm5vaXNlU291cmNlLmJ1ZmZlciA9IHRoaXMubm9pc2VCdWZmZXI7XG4gICAgICAgIHRoaXMubm9pc2VTb3VyY2UubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMubm9pc2VTb3VyY2UuY29ubmVjdCggdGhpcy5ub2lzZVNvdXJjZUNvbm5lY3Rpb25Qb2ludCApO1xuICAgICAgICB0aGlzLm5vaXNlU291cmNlLnN0YXJ0KCBub3cgKyBkZWxheSApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gVGhpcyBtZXRob2Qgd2FzIGNhbGxlZCB3aGVuIHRoZSBhdWRpbyBjb250ZXh0IHdhcyBub3QgeWV0IHJ1bm5pbmcsIHNvIGFkZCBhIGxpc3RlbmVyIHRvIHN0YXJ0IGlmIGFuZCB3aGVuIHRoZVxuICAgICAgLy8gYXVkaW8gY29udGV4dCBzdGF0ZSBjaGFuZ2VzLlxuICAgICAgdGhpcy50aW1lT2ZEZWZlcnJlZFN0YXJ0UmVxdWVzdCA9IERhdGUubm93KCk7XG4gICAgICBpZiAoICFhdWRpb0NvbnRleHRTdGF0ZUNoYW5nZU1vbml0b3IuaGFzTGlzdGVuZXIoIHRoaXMuYXVkaW9Db250ZXh0LCB0aGlzLmF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTGlzdGVuZXIgKSApIHtcbiAgICAgICAgYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VNb25pdG9yLmFkZFN0YXRlQ2hhbmdlTGlzdGVuZXIoXG4gICAgICAgICAgdGhpcy5hdWRpb0NvbnRleHQsXG4gICAgICAgICAgdGhpcy5hdWRpb0NvbnRleHRTdGF0ZUNoYW5nZUxpc3RlbmVyXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2V0IHRoZSBmbGFnIGV2ZW4gaWYgdGhlIHN0YXJ0IGlzIGRlZmVycmVkLCBzaW5jZSBpdCBpcyB1c2VkIHRvIGRlY2lkZSB3aGV0aGVyIHRvIGRvIGEgZGVmZXJyZWQgc3RhcnRcbiAgICB0aGlzLl9pc1BsYXlpbmcgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdGhlIG5vaXNlIHNvdXJjZS5cbiAgICogQHBhcmFtIFt0aW1lXSAtIG9wdGlvbmFsIGF1ZGlvIGNvbnRleHQgdGltZSBhdCB3aGljaCB0aGlzIHNob3VsZCBiZSBzdG9wcGVkXG4gICAqL1xuICBwdWJsaWMgc3RvcCggdGltZSA9IDAgKTogdm9pZCB7XG5cbiAgICAvLyBvbmx5IHN0b3AgaWYgcGxheWluZywgb3RoZXJ3aXNlIGlnbm9yZVxuICAgIGlmICggdGhpcy5faXNQbGF5aW5nICYmIHRoaXMubm9pc2VTb3VyY2UgKSB7XG4gICAgICB0aGlzLm5vaXNlU291cmNlLnN0b3AoIHRpbWUgKTtcbiAgICAgIHRoaXMubm9pc2VTb3VyY2UgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9pc1BsYXlpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGZyZXF1ZW5jeSBvZiB0aGUgbG93IGZyZXF1ZW5jeSBhbXBsaXR1ZGUgbW9kdWxhdG9yIChMRk8pLlxuICAgKi9cbiAgcHVibGljIHNldExmb0ZyZXF1ZW5jeSggZnJlcXVlbmN5OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5sZm8uZnJlcXVlbmN5LnNldFRhcmdldEF0VGltZSggZnJlcXVlbmN5LCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSwgUEFSQU1FVEVSX0NIQU5HRV9USU1FX0NPTlNUQU5UICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBkZXB0aCBvZiB0aGUgTEZPIG1vZHVsYXRvci5cbiAgICogQHBhcmFtIGRlcHRoIC0gZGVwdGggdmFsdWUgZnJvbSAwIChubyBtb2R1bGF0aW9uKSB0byAxIChtYXggbW9kdWxhdGlvbilcbiAgICovXG4gIHB1YmxpYyBzZXRMZm9EZXB0aCggZGVwdGg6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLmxmb0F0dGVudWF0b3JHYWluTm9kZS5nYWluLnNldFRhcmdldEF0VGltZSggZGVwdGggLyAyLCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSwgTEZPX0RFUFRIX0NIQU5HRV9USU1FX0NPTlNUQU5UICk7XG4gIH1cblxuICAvKipcbiAgICogVHVybiB0aGUgbG93IGZyZXF1ZW5jeSBhbXBsaXR1ZGUgbW9kdWxhdGlvbiBvbi9vZmYuXG4gICAqL1xuICBwdWJsaWMgc2V0TGZvRW5hYmxlZCggZW5hYmxlZDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBpZiAoIGVuYWJsZWQgKSB7XG4gICAgICB0aGlzLmxmb0F0dGVudWF0b3JHYWluTm9kZS5nYWluLnNldFRhcmdldEF0VGltZSggMC41LCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSwgUEFSQU1FVEVSX0NIQU5HRV9USU1FX0NPTlNUQU5UICk7XG4gICAgICB0aGlzLmxmb0F0dGVudWF0b3JHYWluTm9kZS5jb25uZWN0KCB0aGlzLmxmb0NvbnRyb2xsZWRHYWluTm9kZS5nYWluICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5sZm9BdHRlbnVhdG9yR2Fpbk5vZGUuZGlzY29ubmVjdCggdGhpcy5sZm9Db250cm9sbGVkR2Fpbk5vZGUuZ2FpbiApO1xuICAgICAgdGhpcy5sZm9BdHRlbnVhdG9yR2Fpbk5vZGUuZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoIDEsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lLCBQQVJBTUVURVJfQ0hBTkdFX1RJTUVfQ09OU1RBTlQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2V0IHRoZSBRIHZhbHVlIGZvciB0aGUgYmFuZCBwYXNzIGZpbHRlciwgYXNzdW1lcyB0aGF0IG5vaXNlIGdlbmVyYXRvciB3YXMgY3JlYXRlZCB3aXRoIHRoaXMgZmlsdGVyIGVuYWJsZWRcbiAgICovXG4gIHB1YmxpYyBzZXRCYW5kcGFzc0ZpbHRlckNlbnRlckZyZXF1ZW5jeSggZnJlcXVlbmN5OiBudW1iZXIsIHRpbWVDb25zdGFudCA9IFBBUkFNRVRFUl9DSEFOR0VfVElNRV9DT05TVEFOVCApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuYmFuZFBhc3NGaWx0ZXIgIT09IG51bGwgKSB7XG4gICAgICB0aGlzLmJhbmRQYXNzRmlsdGVyLmZyZXF1ZW5jeS5zZXRUYXJnZXRBdFRpbWUoIGZyZXF1ZW5jeSwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUsIHRpbWVDb25zdGFudCApO1xuICAgIH1cbiAgfVxufVxuXG50YW1iby5yZWdpc3RlciggJ05vaXNlR2VuZXJhdG9yJywgTm9pc2VHZW5lcmF0b3IgKTtcblxuZXhwb3J0IGRlZmF1bHQgTm9pc2VHZW5lcmF0b3I7Il0sIm5hbWVzIjpbImRvdFJhbmRvbSIsIm9wdGlvbml6ZSIsImF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTW9uaXRvciIsInNvdW5kQ29uc3RhbnRzIiwidGFtYm8iLCJTb3VuZEdlbmVyYXRvciIsIk5PSVNFX0JVRkZFUl9TRUNPTkRTIiwiUEFSQU1FVEVSX0NIQU5HRV9USU1FX0NPTlNUQU5UIiwiREVGQVVMVF9QQVJBTV9DSEFOR0VfVElNRV9DT05TVEFOVCIsIkxGT19ERVBUSF9DSEFOR0VfVElNRV9DT05TVEFOVCIsIk5vaXNlR2VuZXJhdG9yIiwiaXNQbGF5aW5nIiwiX2lzUGxheWluZyIsInN0YXJ0IiwiZGVsYXkiLCJhdWRpb0NvbnRleHQiLCJzdGF0ZSIsIm5vdyIsImN1cnJlbnRUaW1lIiwibm9pc2VTb3VyY2UiLCJjcmVhdGVCdWZmZXJTb3VyY2UiLCJidWZmZXIiLCJub2lzZUJ1ZmZlciIsImxvb3AiLCJjb25uZWN0Iiwibm9pc2VTb3VyY2VDb25uZWN0aW9uUG9pbnQiLCJ0aW1lT2ZEZWZlcnJlZFN0YXJ0UmVxdWVzdCIsIkRhdGUiLCJoYXNMaXN0ZW5lciIsImF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTGlzdGVuZXIiLCJhZGRTdGF0ZUNoYW5nZUxpc3RlbmVyIiwic3RvcCIsInRpbWUiLCJzZXRMZm9GcmVxdWVuY3kiLCJmcmVxdWVuY3kiLCJsZm8iLCJzZXRUYXJnZXRBdFRpbWUiLCJzZXRMZm9EZXB0aCIsImRlcHRoIiwibGZvQXR0ZW51YXRvckdhaW5Ob2RlIiwiZ2FpbiIsInNldExmb0VuYWJsZWQiLCJlbmFibGVkIiwibGZvQ29udHJvbGxlZEdhaW5Ob2RlIiwiZGlzY29ubmVjdCIsInNldEJhbmRwYXNzRmlsdGVyQ2VudGVyRnJlcXVlbmN5IiwidGltZUNvbnN0YW50IiwiYmFuZFBhc3NGaWx0ZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibm9pc2VUeXBlIiwibG93UGFzc0N1dG9mZkZyZXF1ZW5jeSIsImhpZ2hQYXNzQ3V0b2ZmRnJlcXVlbmN5IiwiY2VudGVyRnJlcXVlbmN5IiwicUZhY3RvciIsImxmb0luaXRpYWxseUVuYWJsZWQiLCJsZm9Jbml0aWFsRnJlcXVlbmN5IiwibGZvSW5pdGlhbERlcHRoIiwibGZvVHlwZSIsImFzc2VydCIsImluY2x1ZGVzIiwibG93UGFzc0ZpbHRlciIsImNyZWF0ZUJpcXVhZEZpbHRlciIsInR5cGUiLCJzZXRWYWx1ZUF0VGltZSIsImhpZ2hQYXNzRmlsdGVyIiwiUSIsIm5vaXNlQnVmZmVyU2l6ZSIsInNhbXBsZVJhdGUiLCJjcmVhdGVCdWZmZXIiLCJkYXRhIiwiZ2V0Q2hhbm5lbERhdGEiLCJ3aGl0ZSIsImkiLCJuZXh0RG91YmxlIiwiYjAiLCJiMSIsImIyIiwiYjMiLCJiNCIsImI1IiwiYjYiLCJsYXN0T3V0IiwiRXJyb3IiLCJjcmVhdGVPc2NpbGxhdG9yIiwiY3JlYXRlR2FpbiIsInZhbHVlIiwic291bmRTb3VyY2VEZXN0aW5hdGlvbiIsIm5leHRPdXRwdXRUb0Nvbm5lY3QiLCJOdW1iZXIiLCJORUdBVElWRV9JTkZJTklUWSIsInJlbW92ZVN0YXRlQ2hhbmdlTGlzdGVuZXIiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxlQUFlLCtCQUErQjtBQUNyRCxPQUFPQyxlQUFlLHFDQUFxQztBQUMzRCxPQUFPQyxvQ0FBb0MsdUNBQXVDO0FBQ2xGLE9BQU9DLG9CQUFvQix1QkFBdUI7QUFDbEQsT0FBT0MsV0FBVyxjQUFjO0FBQ2hDLE9BQU9DLG9CQUErQyxzQkFBc0I7QUEyQjVFLFlBQVk7QUFDWixNQUFNQyx1QkFBdUI7QUFDN0IsTUFBTUMsaUNBQWlDSixlQUFlSyxrQ0FBa0M7QUFDeEYsTUFBTUMsaUNBQWlDO0FBRXZDLElBQUEsQUFBTUMsaUJBQU4sTUFBTUEsdUJBQXVCTDtJQXNNM0I7O0dBRUMsR0FDRCxJQUFXTSxZQUFxQjtRQUM5QixPQUFPLElBQUksQ0FBQ0MsVUFBVTtJQUN4QjtJQUVBOzs7R0FHQyxHQUNELEFBQU9DLE1BQU9DLFFBQVEsQ0FBQyxFQUFTO1FBRTlCLElBQUssSUFBSSxDQUFDQyxZQUFZLENBQUNDLEtBQUssS0FBSyxXQUFZO1lBRTNDLE1BQU1DLE1BQU0sSUFBSSxDQUFDRixZQUFZLENBQUNHLFdBQVc7WUFFekMsMEVBQTBFO1lBQzFFLElBQUssQ0FBQyxJQUFJLENBQUNOLFVBQVUsRUFBRztnQkFDdEIsSUFBSSxDQUFDTyxXQUFXLEdBQUcsSUFBSSxDQUFDSixZQUFZLENBQUNLLGtCQUFrQjtnQkFDdkQsSUFBSSxDQUFDRCxXQUFXLENBQUNFLE1BQU0sR0FBRyxJQUFJLENBQUNDLFdBQVc7Z0JBQzFDLElBQUksQ0FBQ0gsV0FBVyxDQUFDSSxJQUFJLEdBQUc7Z0JBQ3hCLElBQUksQ0FBQ0osV0FBVyxDQUFDSyxP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