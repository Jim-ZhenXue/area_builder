// Copyright 2018-2024, University of Colorado Boulder
/**
 * A singleton object that registers sound generators, connects them to the audio output, and provides a number of
 * related services, such as:
 *  - main enable/disable
 *  - main gain control
 *  - enable/disable of sounds based on visibility of an associated Scenery node
 *  - enable/disable of sounds based on their assigned sonification level (e.g. "basic" or "extra")
 *  - gain control for sounds based on their assigned category, e.g. UI versus sim-specific sounds
 *  - a shared reverb unit to add some spatialization and make all sounds seem to originate with the same space
 *
 *  The singleton object must be initialized before sound generators can be added.
 *
 *  @author John Blanco (PhET Interactive Simulations)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import createObservableArray from '../../axon/js/createObservableArray.js';
import Multilink from '../../axon/js/Multilink.js';
import Utils from '../../dot/js/Utils.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import optionize from '../../phet-core/js/optionize.js';
import { Display } from '../../scenery/js/imports.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import emptyApartmentBedroom06Resampled_mp3 from '../sounds/emptyApartmentBedroom06Resampled_mp3.js';
import audioContextStateChangeMonitor from './audioContextStateChangeMonitor.js';
import phetAudioContext from './phetAudioContext.js';
import soundConstants from './soundConstants.js';
import SoundLevelEnum from './SoundLevelEnum.js';
import tambo from './tambo.js';
// constants
const AUDIO_DUCKING_LEVEL = 0.15; // gain value to use for the ducking gain node when ducking is active
// constants
const DEFAULT_REVERB_LEVEL = 0.02;
const LINEAR_GAIN_CHANGE_TIME = soundConstants.DEFAULT_LINEAR_GAIN_CHANGE_TIME; // in seconds
const GAIN_LOGGING_ENABLED = false;
let SoundManager = class SoundManager extends PhetioObject {
    /**
   * Initialize the sonification manager. This function must be invoked before any sound generators can be added.
   */ initialize(simConstructionCompleteProperty, audioEnabledProperty, simVisibleProperty, simActiveProperty, simSettingPhetioStateProperty, providedOptions) {
        assert && assert(!this.initialized, 'can\'t initialize the sound manager more than once');
        const options = optionize()({
            categories: [
                'sim-specific',
                'user-interface'
            ]
        }, providedOptions);
        // options validation
        assert && assert(options.categories.length === _.uniq(options.categories).length, 'categories must be unique');
        const now = phetAudioContext.currentTime;
        // The final stage is a dynamics compressor that is used essentially as a limiter to prevent clipping.
        const dynamicsCompressor = phetAudioContext.createDynamicsCompressor();
        dynamicsCompressor.threshold.setValueAtTime(-6, now);
        dynamicsCompressor.knee.setValueAtTime(5, now);
        dynamicsCompressor.ratio.setValueAtTime(12, now);
        dynamicsCompressor.attack.setValueAtTime(0, now);
        dynamicsCompressor.release.setValueAtTime(0.25, now);
        dynamicsCompressor.connect(phetAudioContext.destination);
        // Create the ducking gain node, which is used to reduce the overall sound output level temporarily in certain
        // situations, such as when the voicing feature is actively producing speech.
        this.duckingGainNode = phetAudioContext.createGain();
        this.duckingGainNode.connect(dynamicsCompressor);
        // Create the main gain node for all sounds managed by this sonification manager.
        this.mainGainNode = phetAudioContext.createGain();
        this.mainGainNode.connect(this.duckingGainNode);
        // Set up a convolver node, which will be used to create the reverb effect.
        this.convolver = phetAudioContext.createConvolver();
        const setConvolverBuffer = (audioBuffer)=>{
            if (audioBuffer) {
                this.convolver.buffer = audioBuffer;
                emptyApartmentBedroom06Resampled_mp3.audioBufferProperty.unlink(setConvolverBuffer);
            }
        };
        emptyApartmentBedroom06Resampled_mp3.audioBufferProperty.link(setConvolverBuffer);
        // gain node that will control the reverb level
        this.reverbGainNode = phetAudioContext.createGain();
        this.reverbGainNode.connect(this.mainGainNode);
        this.reverbGainNode.gain.setValueAtTime(this._reverbLevel, phetAudioContext.currentTime);
        this.convolver.connect(this.reverbGainNode);
        // dry (non-reverbed) portion of the output
        this.dryGainNode = phetAudioContext.createGain();
        this.dryGainNode.gain.setValueAtTime(1 - this._reverbLevel, phetAudioContext.currentTime);
        this.dryGainNode.gain.linearRampToValueAtTime(1 - this._reverbLevel, phetAudioContext.currentTime + LINEAR_GAIN_CHANGE_TIME);
        this.dryGainNode.connect(this.mainGainNode);
        // Create and hook up gain nodes for each of the defined categories.
        assert && assert(this.convolver !== null && this.dryGainNode !== null, 'some audio nodes have not been initialized');
        options.categories.forEach((categoryName)=>{
            const gainNode = phetAudioContext.createGain();
            gainNode.connect(this.convolver);
            gainNode.connect(this.dryGainNode);
            this.gainNodesForCategories.set(categoryName, gainNode);
        });
        // Hook up a listener that turns down the main gain if sonification is disabled or if the sim isn't visible or
        // isn't active.
        Multilink.multilink([
            this.enabledProperty,
            audioEnabledProperty,
            simConstructionCompleteProperty,
            simVisibleProperty,
            simActiveProperty,
            simSettingPhetioStateProperty
        ], (enabled, audioEnabled, simInitComplete, simVisible, simActive, simSettingPhetioState)=>{
            const fullyEnabled = enabled && audioEnabled && simInitComplete && simVisible && simActive && !simSettingPhetioState;
            const gain = fullyEnabled ? this._mainOutputLevel : 0;
            // Set the gain, but somewhat gradually in order to avoid rapid transients, which can sound like clicks.
            this.mainGainNode.gain.linearRampToValueAtTime(gain, phetAudioContext.currentTime + LINEAR_GAIN_CHANGE_TIME);
        });
        const duckMainOutputLevelProperty = new BooleanProperty(false);
        // Define a listener that will update the state of the collective ducking Property that indicates whether ducking
        // (overall volume reduction to prevent overlap with other sounds) should be active or inactive.
        const updateDuckingState = ()=>{
            // Reduce the array of individual ducking Properties array to a single boolean value.
            duckMainOutputLevelProperty.value = this.duckingProperties.reduce((valueSoFar, currentProperty)=>valueSoFar || currentProperty.value, false);
        };
        // Implement ducking of the main output.
        duckMainOutputLevelProperty.lazyLink((duckOutput)=>{
            var _this_duckingGainNode, _this_duckingGainNode1;
            // State checking - make sure the ducking gain node exists.
            assert && assert(this.duckingGainNode, 'ducking listener fired, but no ducking gain node exists');
            // Use time constant values that will turn down the output level faster than it will turn it up.  This sounds
            // better, since it prevents overlap with the voice.
            const timeConstant = duckOutput ? 0.05 : 0.5;
            // Duck or don't.
            const now = phetAudioContext.currentTime;
            (_this_duckingGainNode = this.duckingGainNode) == null ? void 0 : _this_duckingGainNode.gain.cancelScheduledValues(now);
            (_this_duckingGainNode1 = this.duckingGainNode) == null ? void 0 : _this_duckingGainNode1.gain.setTargetAtTime(duckOutput ? AUDIO_DUCKING_LEVEL : 1, now, timeConstant);
        });
        // Handle the adding and removal of individual ducking Properties.
        this.duckingProperties.addItemAddedListener((addedDuckingProperty)=>{
            addedDuckingProperty.link(updateDuckingState);
            const checkAndRemove = (removedDuckingProperty)=>{
                if (removedDuckingProperty === addedDuckingProperty) {
                    removedDuckingProperty.unlink(updateDuckingState);
                    this.duckingProperties.removeItemRemovedListener(checkAndRemove);
                }
            };
            this.duckingProperties.addItemRemovedListener(checkAndRemove);
        });
        //------------------------------------------------------------------------------------------------------------------
        // Handle the audio context state, both when changes occur and when it is initially muted due to the autoplay
        // policy.  As of this writing (Feb 2019), there are some differences in how the audio context state behaves on
        // different platforms, so the code monitors different events and states to keep the audio context running.  As the
        // behavior of the audio context becomes more consistent across browsers, it may be possible to simplify this.
        //------------------------------------------------------------------------------------------------------------------
        // function to remove the user interaction listeners, used to avoid code duplication
        const removeUserInteractionListeners = ()=>{
            window.removeEventListener('touchstart', resumeAudioContext, false);
            if (Display.userGestureEmitter.hasListener(resumeAudioContext)) {
                Display.userGestureEmitter.removeListener(resumeAudioContext);
            }
        };
        // listener that resumes the audio context
        const resumeAudioContext = ()=>{
            if (phetAudioContext.state !== 'running') {
                phet.log && phet.log(`audio context not running, attempting to resume, state = ${phetAudioContext.state}`);
                // tell the audio context to resume
                phetAudioContext.resume().then(()=>{
                    phet.log && phet.log(`resume appears to have succeeded, phetAudioContext.state = ${phetAudioContext.state}`);
                    removeUserInteractionListeners();
                }).catch((err)=>{
                    const errorMessage = `error when trying to resume audio context, err = ${err}`;
                    console.error(errorMessage);
                    assert && alert(errorMessage);
                });
            } else {
                // audio context is already running, no need to listen anymore
                removeUserInteractionListeners();
            }
        };
        // listen for a touchstart - this only works to resume the audio context on iOS devices (as of this writing)
        window.addEventListener('touchstart', resumeAudioContext, false);
        // listen for other user gesture events
        Display.userGestureEmitter.addListener(resumeAudioContext);
        // During testing, several use cases were found where the audio context state changes to something other than the
        // "running" state while the sim is in use (generally either "suspended" or "interrupted", depending on the
        // browser).  The following code is intended to handle this situation by trying to resume it right away.  GitHub
        // issues with details about why this is necessary are:
        // - https://github.com/phetsims/tambo/issues/58
        // - https://github.com/phetsims/tambo/issues/59
        // - https://github.com/phetsims/fractions-common/issues/82
        // - https://github.com/phetsims/friction/issues/173
        // - https://github.com/phetsims/resistance-in-a-wire/issues/190
        // - https://github.com/phetsims/tambo/issues/90
        let previousAudioContextState = phetAudioContext.state;
        audioContextStateChangeMonitor.addStateChangeListener(phetAudioContext, (state)=>{
            phet.log && phet.log(`audio context state changed, old state = ${previousAudioContextState}, new state = ${state}, audio context time = ${phetAudioContext.currentTime}`);
            if (state !== 'running') {
                // Add a listener that will resume the audio context on the next touchstart.
                window.addEventListener('touchstart', resumeAudioContext, false);
                // Listen also for other user gesture events that can be used to resume the audio context.
                if (!Display.userGestureEmitter.hasListener(resumeAudioContext)) {
                    Display.userGestureEmitter.addListener(resumeAudioContext);
                }
            } else {
                console.log('AudioContext is now running.');
            }
            previousAudioContextState = state;
        });
        this.initialized = true;
        // Add any sound generators that were waiting for initialization to complete (must be done after init complete).
        this.soundGeneratorsAwaitingAdd.forEach((soundGeneratorAwaitingAdd)=>{
            this.addSoundGenerator(soundGeneratorAwaitingAdd.soundGenerator, soundGeneratorAwaitingAdd.soundGeneratorAddOptions);
        });
        this.soundGeneratorsAwaitingAdd.length = 0;
    }
    /**
   * Returns true if the specified soundGenerator has been previously added to the soundManager.
   */ hasSoundGenerator(soundGenerator) {
        return this.soundGenerators.includes(soundGenerator);
    }
    /**
   * Add a sound generator.  This connects the sound generator to the audio path, puts it on the list of sound
   * generators, and creates and returns a unique ID.
   */ addSoundGenerator(soundGenerator, providedOptions) {
        // We'll need an empty object of no options were provided.
        if (providedOptions === undefined) {
            providedOptions = {};
        }
        // Check if initialization has been done and, if not, queue the sound generator and its options for addition
        // once initialization is complete.  Note that when sound is not supported, initialization will never occur.
        if (!this.initialized) {
            this.soundGeneratorsAwaitingAdd.push({
                soundGenerator: soundGenerator,
                soundGeneratorAddOptions: providedOptions
            });
            return;
        }
        // state checking - make sure the needed nodes have been created
        assert && assert(this.convolver !== null && this.dryGainNode !== null, 'some audio nodes have not been initialized');
        // Verify that this is not a duplicate addition.
        const hasSoundGenerator = this.hasSoundGenerator(soundGenerator);
        assert && assert(!hasSoundGenerator, 'can\'t add the same sound generator twice');
        // default options
        const options = optionize()({
            categoryName: null
        }, providedOptions);
        // Connect the sound generator to an output path.
        if (options.categoryName === null) {
            soundGenerator.connect(this.convolver);
            soundGenerator.connect(this.dryGainNode);
        } else {
            assert && assert(this.gainNodesForCategories.has(options.categoryName), `category does not exist : ${options.categoryName}`);
            soundGenerator.connect(this.gainNodesForCategories.get(options.categoryName));
        }
        // Add this sound generator to our list.
        this.soundGenerators.push(soundGenerator);
    }
    /**
   * Remove the specified sound generator.
   */ removeSoundGenerator(soundGenerator) {
        // Check if the sound manager is initialized and, if not, issue a warning and ignore the request.  This is not an
        // assertion because the sound manager may not be initialized in cases where the sound is not enabled for the
        // simulation, but this method can still end up being invoked.
        if (!this.initialized) {
            const toRemove = this.soundGeneratorsAwaitingAdd.filter((s)=>s.soundGenerator === soundGenerator);
            assert && assert(toRemove.length > 0, 'unable to remove sound generator - not found');
            while(toRemove.length > 0){
                arrayRemove(this.soundGeneratorsAwaitingAdd, toRemove[0]);
                toRemove.shift();
            }
            return;
        }
        // Make sure it is actually present on the list.
        assert && assert(this.soundGenerators.includes(soundGenerator), 'unable to remove sound generator - not found');
        // Disconnect the sound generator from any audio nodes to which it may be connected.
        if (soundGenerator.isConnectedTo(this.convolver)) {
            soundGenerator.disconnect(this.convolver);
        }
        if (soundGenerator.isConnectedTo(this.dryGainNode)) {
            soundGenerator.disconnect(this.dryGainNode);
        }
        this.gainNodesForCategories.forEach((gainNode)=>{
            if (soundGenerator.isConnectedTo(gainNode)) {
                soundGenerator.disconnect(gainNode);
            }
        });
        // Remove the sound generator from the list.
        this.soundGenerators.splice(this.soundGenerators.indexOf(soundGenerator), 1);
    }
    /**
   * Set the main output level for sounds.
   * @param level - valid values from 0 (min) through 1 (max)
   */ setMainOutputLevel(level) {
        // Check if initialization has been done.  This is not an assertion because the sound manager may not be
        // initialized if sound is not enabled for the sim.
        if (!this.initialized) {
            console.warn('an attempt was made to set the main output level on an uninitialized sound manager, ignoring');
            return;
        }
        // range check
        assert && assert(level >= 0 && level <= 1, `output level value out of range: ${level}`);
        this._mainOutputLevel = level;
        if (this.enabledProperty.value) {
            this.mainGainNode.gain.linearRampToValueAtTime(level, phetAudioContext.currentTime + LINEAR_GAIN_CHANGE_TIME);
        }
    }
    set mainOutputLevel(outputLevel) {
        this.setMainOutputLevel(outputLevel);
    }
    get mainOutputLevel() {
        return this.getMainOutputLevel();
    }
    /**
   * Get the current output level setting.
   */ getMainOutputLevel() {
        return this._mainOutputLevel;
    }
    /**
   * Set the output level for the specified category of sound generator.
   * @param categoryName - name of category to which this invocation applies
   * @param outputLevel - valid values from 0 through 1
   */ setOutputLevelForCategory(categoryName, outputLevel) {
        // Check if initialization has been done.  This is not an assertion because the sound manager may not be
        // initialized if sound is not enabled for the sim.
        if (!this.initialized) {
            console.warn('an attempt was made to set the output level for a sound category on an uninitialized sound manager, ignoring');
            return;
        }
        assert && assert(this.initialized, 'output levels for categories cannot be added until initialization has been done');
        // range check
        assert && assert(outputLevel >= 0 && outputLevel <= 1, `output level value out of range: ${outputLevel}`);
        // verify that the specified category exists
        assert && assert(this.gainNodesForCategories.get(categoryName), `no category with name = ${categoryName}`);
        // Set the gain value on the appropriate gain node.
        const gainNode = this.gainNodesForCategories.get(categoryName);
        if (gainNode) {
            gainNode.gain.setValueAtTime(outputLevel, phetAudioContext.currentTime);
        }
    }
    /**
   * Add a ducking Property.  When any of the ducking Properties are true, the output level will be "ducked", meaning
   * that it will be reduced.
   */ addDuckingProperty(duckingProperty) {
        this.duckingProperties.add(duckingProperty);
    }
    /**
   * Remove a ducking Property that had been previously added.
   */ removeDuckingProperty(duckingProperty) {
        assert && assert(this.duckingProperties.includes(duckingProperty), 'ducking Property not present');
        this.duckingProperties.remove(duckingProperty);
    }
    /**
   * Get the output level for the specified sound generator category.
   * @param categoryName - name of category to which this invocation applies
   */ getOutputLevelForCategory(categoryName) {
        // Check if initialization has been done.  This is not an assertion because the sound manager may not be
        // initialized if sound is not enabled for the sim.
        if (!this.initialized) {
            console.warn('an attempt was made to get the output level for a sound category on an uninitialized sound manager, returning 0');
            return 0;
        }
        // Get the GainNode for the specified category.
        const gainNode = this.gainNodesForCategories.get(categoryName);
        assert && assert(gainNode, `no category with name = ${categoryName}`);
        return gainNode.gain.value;
    }
    /**
   * Set the amount of reverb.
   * @param newReverbLevel - value from 0 to 1, 0 = totally dry, 1 = wet
   */ setReverbLevel(newReverbLevel) {
        // Check if initialization has been done.  This is not an assertion because the sound manager may not be
        // initialized if sound is not enabled for the sim.
        if (!this.initialized) {
            console.warn('an attempt was made to set the reverb level on an uninitialized sound manager, ignoring');
            return;
        }
        if (newReverbLevel !== this._reverbLevel) {
            assert && assert(newReverbLevel >= 0 && newReverbLevel <= 1, `reverb value out of range: ${newReverbLevel}`);
            const now = phetAudioContext.currentTime;
            this.reverbGainNode.gain.linearRampToValueAtTime(newReverbLevel, now + LINEAR_GAIN_CHANGE_TIME);
            this.dryGainNode.gain.linearRampToValueAtTime(1 - newReverbLevel, now + LINEAR_GAIN_CHANGE_TIME);
            this._reverbLevel = newReverbLevel;
        }
    }
    set reverbLevel(reverbLevel) {
        this.setReverbLevel(reverbLevel);
    }
    get reverbLevel() {
        return this.getReverbLevel();
    }
    getReverbLevel() {
        return this._reverbLevel;
    }
    set enabled(enabled) {
        this.enabledProperty.value = enabled;
    }
    get enabled() {
        return this.enabledProperty.value;
    }
    set sonificationLevel(sonificationLevel) {
        this.extraSoundEnabledProperty.value = sonificationLevel === SoundLevelEnum.EXTRA;
    }
    /**
   * ES5 getter for sonification level
   */ get sonificationLevel() {
        return this.extraSoundEnabledProperty.value ? SoundLevelEnum.EXTRA : SoundLevelEnum.BASIC;
    }
    /**
   * Log the value of the gain parameter at every animation frame for the specified duration.  This is useful for
   * debugging, because these parameters change over time when set using methods like "setTargetAtTime", and the
   * details of how they change seems to be different on the different browsers.
   *
   * It may be possible to remove this method someday once the behavior is more consistent across browsers.  See
   * https://github.com/phetsims/resistance-in-a-wire/issues/205 for some history on this.
   *
   * @param gainNode
   * @param duration - duration for logging, in seconds
   */ logGain(gainNode, duration) {
        duration = duration || 1;
        const startTime = Date.now();
        // closure that will be invoked multiple times to log the changing values
        function logGain() {
            const now = Date.now();
            const timeInMilliseconds = now - startTime;
            console.log(`Time (ms): ${Utils.toFixed(timeInMilliseconds, 2)}, Gain Value: ${gainNode.gain.value}`);
            if (now - startTime < duration * 1000) {
                window.requestAnimationFrame(logGain);
            }
        }
        if (GAIN_LOGGING_ENABLED) {
            // kick off the logging
            console.log('------- start of gain logging -----');
            logGain();
        }
    }
    /**
   * Log the value of the main gain as it changes, used primarily for debug.
   * @param duration - in seconds
   */ logMainGain(duration) {
        if (this.mainGainNode) {
            this.logGain(this.mainGainNode, duration);
        }
    }
    /**
   * Log the value of the reverb gain as it changes, used primarily for debug.
   * @param duration - duration for logging, in seconds
   */ logReverbGain(duration) {
        if (this.reverbGainNode) {
            this.logGain(this.reverbGainNode, duration);
        }
    }
    constructor(tandem){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet, _window_phet_chipper_queryParameters1, _window_phet_chipper1, _window_phet1;
        super({
            tandem: tandem,
            phetioState: false,
            phetioDocumentation: 'Controls the simulation\'s sound. For sims that do not support sound, this element and ' + 'its children can be ignored.'
        });
        this.enabledProperty = new BooleanProperty(((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.supportsSound) || false, {
            tandem: tandem == null ? void 0 : tandem.createTandem('enabledProperty'),
            phetioState: false,
            phetioDocumentation: 'Determines whether sound is enabled. Supported only if this sim supportsSound=true.'
        });
        this.extraSoundEnabledProperty = new BooleanProperty(((_window_phet1 = window.phet) == null ? void 0 : (_window_phet_chipper1 = _window_phet1.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters1 = _window_phet_chipper1.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters1.extraSoundInitiallyEnabled) || false, {
            tandem: tandem == null ? void 0 : tandem.createTandem('extraSoundEnabledProperty'),
            phetioState: false,
            phetioDocumentation: 'Determines whether extra sound is enabled. Extra sound is additional sounds that ' + 'can serve to improve the learning experience for individuals with visual disabilities. ' + 'Note that not all simulations that support sound also support extra sound. Also note ' + 'that the value is irrelevant when enabledProperty is false.'
        });
        this.soundGenerators = [];
        this._mainOutputLevel = 1;
        this._reverbLevel = DEFAULT_REVERB_LEVEL;
        this.gainNodesForCategories = new Map();
        this.duckingProperties = createObservableArray();
        this.initialized = false;
        this.soundGeneratorsAwaitingAdd = [];
        this.mainGainNode = null;
        this.duckingGainNode = null;
        this.convolver = null;
        this.reverbGainNode = null;
        this.dryGainNode = null;
    }
};
const soundManager = new SoundManager();
tambo.register('soundManager', soundManager);
export default soundManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHNpbmdsZXRvbiBvYmplY3QgdGhhdCByZWdpc3RlcnMgc291bmQgZ2VuZXJhdG9ycywgY29ubmVjdHMgdGhlbSB0byB0aGUgYXVkaW8gb3V0cHV0LCBhbmQgcHJvdmlkZXMgYSBudW1iZXIgb2ZcbiAqIHJlbGF0ZWQgc2VydmljZXMsIHN1Y2ggYXM6XG4gKiAgLSBtYWluIGVuYWJsZS9kaXNhYmxlXG4gKiAgLSBtYWluIGdhaW4gY29udHJvbFxuICogIC0gZW5hYmxlL2Rpc2FibGUgb2Ygc291bmRzIGJhc2VkIG9uIHZpc2liaWxpdHkgb2YgYW4gYXNzb2NpYXRlZCBTY2VuZXJ5IG5vZGVcbiAqICAtIGVuYWJsZS9kaXNhYmxlIG9mIHNvdW5kcyBiYXNlZCBvbiB0aGVpciBhc3NpZ25lZCBzb25pZmljYXRpb24gbGV2ZWwgKGUuZy4gXCJiYXNpY1wiIG9yIFwiZXh0cmFcIilcbiAqICAtIGdhaW4gY29udHJvbCBmb3Igc291bmRzIGJhc2VkIG9uIHRoZWlyIGFzc2lnbmVkIGNhdGVnb3J5LCBlLmcuIFVJIHZlcnN1cyBzaW0tc3BlY2lmaWMgc291bmRzXG4gKiAgLSBhIHNoYXJlZCByZXZlcmIgdW5pdCB0byBhZGQgc29tZSBzcGF0aWFsaXphdGlvbiBhbmQgbWFrZSBhbGwgc291bmRzIHNlZW0gdG8gb3JpZ2luYXRlIHdpdGggdGhlIHNhbWUgc3BhY2VcbiAqXG4gKiAgVGhlIHNpbmdsZXRvbiBvYmplY3QgbXVzdCBiZSBpbml0aWFsaXplZCBiZWZvcmUgc291bmQgZ2VuZXJhdG9ycyBjYW4gYmUgYWRkZWQuXG4gKlxuICogIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5LCB7IFByb3BlcnR5TGlua0xpc3RlbmVyIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IERpc3BsYXkgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgZW1wdHlBcGFydG1lbnRCZWRyb29tMDZSZXNhbXBsZWRfbXAzIGZyb20gJy4uL3NvdW5kcy9lbXB0eUFwYXJ0bWVudEJlZHJvb20wNlJlc2FtcGxlZF9tcDMuanMnO1xuaW1wb3J0IGF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTW9uaXRvciBmcm9tICcuL2F1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTW9uaXRvci5qcyc7XG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuL3BoZXRBdWRpb0NvbnRleHQuanMnO1xuaW1wb3J0IFNvdW5kR2VuZXJhdG9yIGZyb20gJy4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZEdlbmVyYXRvci5qcyc7XG5pbXBvcnQgc291bmRDb25zdGFudHMgZnJvbSAnLi9zb3VuZENvbnN0YW50cy5qcyc7XG5pbXBvcnQgU291bmRMZXZlbEVudW0gZnJvbSAnLi9Tb3VuZExldmVsRW51bS5qcyc7XG5pbXBvcnQgdGFtYm8gZnJvbSAnLi90YW1iby5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgQVVESU9fRFVDS0lOR19MRVZFTCA9IDAuMTU7IC8vIGdhaW4gdmFsdWUgdG8gdXNlIGZvciB0aGUgZHVja2luZyBnYWluIG5vZGUgd2hlbiBkdWNraW5nIGlzIGFjdGl2ZVxuXG4vLyBvcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgd2hlbiBhZGRpbmcgYSBzb3VuZCBnZW5lcmF0b3IgdGhhdCBjYW4gY29udHJvbCBzb21lIGFzcGVjdHMgb2YgaXRzIGJlaGF2aW9yXG5leHBvcnQgdHlwZSBTb3VuZEdlbmVyYXRvckFkZE9wdGlvbnMgPSB7XG5cbiAgLy8gY2F0ZWdvcnkgbmFtZSBmb3IgdGhpcyBzb3VuZFxuICBjYXRlZ29yeU5hbWU/OiBzdHJpbmcgfCBudWxsO1xufTtcblxuLy8gc291bmQgZ2VuZXJhdG9ycyB0aGF0IGFyZSBxdWV1ZWQgdXAgYW5kIHdhaXRpbmcgdG8gYmUgYWRkZWQgd2hlbiBpbml0aWFsaXphdGlvbiBpcyBjb21wbGV0ZVxudHlwZSBTb3VuZEdlbmVyYXRvckF3YWl0aW5nQWRkID0ge1xuICBzb3VuZEdlbmVyYXRvcjogU291bmRHZW5lcmF0b3I7XG4gIHNvdW5kR2VuZXJhdG9yQWRkT3B0aW9uczogU291bmRHZW5lcmF0b3JBZGRPcHRpb25zO1xufTtcblxudHlwZSBTb3VuZEdlbmVyYXRvckluaXRpYWxpemF0aW9uT3B0aW9ucyA9IHtcblxuICAvLyBUaGlzIG9wdGlvbiBjYW4gYmUgdXNlZCB0byBkZWZpbmUgYSBzZXQgb2YgY2F0ZWdvcmllcyB0aGF0IGNhbiBiZSB1c2VkIHRvIGdyb3VwIHNvdW5kIGdlbmVyYXRvcnMgdG9nZXRoZXIgYW5kXG4gIC8vIHRoZW4gY29udHJvbCB0aGVpciB2b2x1bWUgY29sbGVjdGl2ZWx5LiAgVGhlIG5hbWVzIHNob3VsZCBiZSB1bmlxdWUuICBTZWUgdGhlIGRlZmF1bHQgaW5pdGlhbGl6YXRpb24gdmFsdWVzIGZvciBhblxuICAvLyBleGFtcGxlIGxpc3QuXG4gIGNhdGVnb3JpZXM/OiBzdHJpbmdbXTtcbn07XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgREVGQVVMVF9SRVZFUkJfTEVWRUwgPSAwLjAyO1xuY29uc3QgTElORUFSX0dBSU5fQ0hBTkdFX1RJTUUgPSBzb3VuZENvbnN0YW50cy5ERUZBVUxUX0xJTkVBUl9HQUlOX0NIQU5HRV9USU1FOyAvLyBpbiBzZWNvbmRzXG5jb25zdCBHQUlOX0xPR0dJTkdfRU5BQkxFRCA9IGZhbHNlO1xuXG5jbGFzcyBTb3VuZE1hbmFnZXIgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xuXG4gIC8vIGdsb2JhbCBlbmFibGVkIHN0YXRlIGZvciBzb3VuZCBnZW5lcmF0aW9uXG4gIHB1YmxpYyByZWFkb25seSBlbmFibGVkUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcblxuICAvLyBlbmFibGVkIHN0YXRlIGZvciBleHRyYSBzb3VuZHNcbiAgcHVibGljIHJlYWRvbmx5IGV4dHJhU291bmRFbmFibGVkUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcblxuICAvLyBhbiBhcnJheSB3aGVyZSB0aGUgc291bmQgZ2VuZXJhdG9ycyBhcmUgc3RvcmVkXG4gIHByaXZhdGUgcmVhZG9ubHkgc291bmRHZW5lcmF0b3JzOiBTb3VuZEdlbmVyYXRvcltdO1xuXG4gIC8vIG91dHB1dCBsZXZlbCBmb3IgdGhlIG1haW4gZ2FpbiBub2RlIHdoZW4gc29uaWZpY2F0aW9uIGlzIGVuYWJsZWRcbiAgcHJpdmF0ZSBfbWFpbk91dHB1dExldmVsOiBudW1iZXI7XG5cbiAgLy8gcmV2ZXJiIGxldmVsLCBuZWVkZWQgYmVjYXVzZSBzb21lIGJyb3dzZXJzIGRvbid0IHN1cHBvcnQgcmVhZGluZyBvZiBnYWluIHZhbHVlcywgc2VlIG1ldGhvZHMgZm9yIG1vcmUgaW5mb1xuICBwcml2YXRlIF9yZXZlcmJMZXZlbDogbnVtYmVyO1xuXG4gIC8vIEEgbWFwIG9mIGNhdGVnb3J5IG5hbWVzIHRvIEdhaW5Ob2RlIGluc3RhbmNlcyB0aGF0IGNvbnRyb2wgZ2FpbnMgZm9yIHRoYXQgY2F0ZWdvcnkgbmFtZS4gIFRoaXMgZmlsbGVkIGluIGR1cmluZ1xuICAvLyBpbml0aWFsaXphdGlvbiwgc2VlIHRoZSB1c2FnZSBvZiBvcHRpb25zLmNhdGVnb3JpZXMgaW4gdGhlIGluaXRpYWxpemUgZnVuY3Rpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIHByaXZhdGUgcmVhZG9ubHkgZ2Fpbk5vZGVzRm9yQ2F0ZWdvcmllczogTWFwPHN0cmluZywgR2Fpbk5vZGU+O1xuXG4gIC8vIGFuIGFycmF5IG9mIHByb3BlcnRpZXMgd2hlcmUsIGlmIGFueSBvZiB0aGVzZSBhcmUgdHJ1ZSwgb3ZlcmFsbCBvdXRwdXQgbGV2ZWwgaXMgXCJkdWNrZWRcIiAoaS5lLiByZWR1Y2VkKVxuICBwcml2YXRlIHJlYWRvbmx5IGR1Y2tpbmdQcm9wZXJ0aWVzOiBPYnNlcnZhYmxlQXJyYXk8VFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4+O1xuXG4gIC8vIGZsYWcgdGhhdCB0cmFja3Mgd2hldGhlciB0aGUgc29uaWZpY2F0aW9uIG1hbmFnZXIgaGFzIGJlZW4gaW5pdGlhbGl6ZWQsIHNob3VsZCBuZXZlciBiZSBzZXQgb3V0c2lkZSB0aGlzIGZpbGVcbiAgcHVibGljIGluaXRpYWxpemVkOiBib29sZWFuO1xuXG4gIC8vIHNvdW5kIGdlbmVyYXRvcnMgdGhhdCBhcmUgcXVldWVkIHVwIGlmIGF0dGVtcHRzIGFyZSBtYWRlIHRvIGFkZCB0aGVtIGJlZm9yZSBpbml0aWFsaXphdGlvbiBoYXMgb2NjdXJyZWRcbiAgcHJpdmF0ZSByZWFkb25seSBzb3VuZEdlbmVyYXRvcnNBd2FpdGluZ0FkZDogU291bmRHZW5lcmF0b3JBd2FpdGluZ0FkZFtdO1xuXG4gIC8vIGF1ZGlvIG5vZGVzIHRoYXQgYXJlIHVzZWQgaW4gdGhlIHNpZ25hbCBjaGFpbiBiZXR3ZWVuIHNvdW5kIGdlbmVyYXRvcnMgYW5kIHRoZSBhdWRpbyBjb250ZXh0IGRlc3RpbmF0aW9uXG4gIHByaXZhdGUgbWFpbkdhaW5Ob2RlOiBHYWluTm9kZSB8IG51bGw7XG4gIHByaXZhdGUgY29udm9sdmVyOiBDb252b2x2ZXJOb2RlIHwgbnVsbDtcbiAgcHJpdmF0ZSByZXZlcmJHYWluTm9kZTogR2Fpbk5vZGUgfCBudWxsO1xuICBwcml2YXRlIGRyeUdhaW5Ob2RlOiBHYWluTm9kZSB8IG51bGw7XG4gIHByaXZhdGUgZHVja2luZ0dhaW5Ob2RlOiBHYWluTm9kZSB8IG51bGw7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW0/OiBUYW5kZW0gKSB7XG5cbiAgICBzdXBlcigge1xuICAgICAgdGFuZGVtOiB0YW5kZW0sXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQ29udHJvbHMgdGhlIHNpbXVsYXRpb25cXCdzIHNvdW5kLiBGb3Igc2ltcyB0aGF0IGRvIG5vdCBzdXBwb3J0IHNvdW5kLCB0aGlzIGVsZW1lbnQgYW5kICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2l0cyBjaGlsZHJlbiBjYW4gYmUgaWdub3JlZC4nXG4gICAgfSApO1xuXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5zdXBwb3J0c1NvdW5kIHx8IGZhbHNlLCB7XG4gICAgICB0YW5kZW06IHRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnZW5hYmxlZFByb3BlcnR5JyApLFxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLCAvLyBUaGlzIGlzIGEgcHJlZmVyZW5jZSwgZ2xvYmFsIHNvdW5kIGNvbnRyb2wgaXMgaGFuZGxlZCBieSB0aGUgYXVkaW9NYW5hZ2VyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRGV0ZXJtaW5lcyB3aGV0aGVyIHNvdW5kIGlzIGVuYWJsZWQuIFN1cHBvcnRlZCBvbmx5IGlmIHRoaXMgc2ltIHN1cHBvcnRzU291bmQ9dHJ1ZS4nXG4gICAgfSApO1xuXG4gICAgdGhpcy5leHRyYVNvdW5kRW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uZXh0cmFTb3VuZEluaXRpYWxseUVuYWJsZWQgfHwgZmFsc2UsIHtcbiAgICAgIHRhbmRlbTogdGFuZGVtPy5jcmVhdGVUYW5kZW0oICdleHRyYVNvdW5kRW5hYmxlZFByb3BlcnR5JyApLFxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLCAvLyBUaGlzIGlzIGEgcHJlZmVyZW5jZSwgZ2xvYmFsIHNvdW5kIGNvbnRyb2wgaXMgaGFuZGxlZCBieSB0aGUgYXVkaW9NYW5hZ2VyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRGV0ZXJtaW5lcyB3aGV0aGVyIGV4dHJhIHNvdW5kIGlzIGVuYWJsZWQuIEV4dHJhIHNvdW5kIGlzIGFkZGl0aW9uYWwgc291bmRzIHRoYXQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnY2FuIHNlcnZlIHRvIGltcHJvdmUgdGhlIGxlYXJuaW5nIGV4cGVyaWVuY2UgZm9yIGluZGl2aWR1YWxzIHdpdGggdmlzdWFsIGRpc2FiaWxpdGllcy4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnTm90ZSB0aGF0IG5vdCBhbGwgc2ltdWxhdGlvbnMgdGhhdCBzdXBwb3J0IHNvdW5kIGFsc28gc3VwcG9ydCBleHRyYSBzb3VuZC4gQWxzbyBub3RlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RoYXQgdGhlIHZhbHVlIGlzIGlycmVsZXZhbnQgd2hlbiBlbmFibGVkUHJvcGVydHkgaXMgZmFsc2UuJ1xuICAgIH0gKTtcblxuICAgIHRoaXMuc291bmRHZW5lcmF0b3JzID0gW107XG4gICAgdGhpcy5fbWFpbk91dHB1dExldmVsID0gMTtcbiAgICB0aGlzLl9yZXZlcmJMZXZlbCA9IERFRkFVTFRfUkVWRVJCX0xFVkVMO1xuICAgIHRoaXMuZ2Fpbk5vZGVzRm9yQ2F0ZWdvcmllcyA9IG5ldyBNYXA8c3RyaW5nLCBHYWluTm9kZT4oKTtcbiAgICB0aGlzLmR1Y2tpbmdQcm9wZXJ0aWVzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuc291bmRHZW5lcmF0b3JzQXdhaXRpbmdBZGQgPSBbXTtcbiAgICB0aGlzLm1haW5HYWluTm9kZSA9IG51bGw7XG4gICAgdGhpcy5kdWNraW5nR2Fpbk5vZGUgPSBudWxsO1xuICAgIHRoaXMuY29udm9sdmVyID0gbnVsbDtcbiAgICB0aGlzLnJldmVyYkdhaW5Ob2RlID0gbnVsbDtcbiAgICB0aGlzLmRyeUdhaW5Ob2RlID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBzb25pZmljYXRpb24gbWFuYWdlci4gVGhpcyBmdW5jdGlvbiBtdXN0IGJlIGludm9rZWQgYmVmb3JlIGFueSBzb3VuZCBnZW5lcmF0b3JzIGNhbiBiZSBhZGRlZC5cbiAgICovXG4gIHB1YmxpYyBpbml0aWFsaXplKCBzaW1Db25zdHJ1Y3Rpb25Db21wbGV0ZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcbiAgICAgICAgICAgICAgICAgICAgIGF1ZGlvRW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcbiAgICAgICAgICAgICAgICAgICAgIHNpbVZpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXG4gICAgICAgICAgICAgICAgICAgICBzaW1BY3RpdmVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXG4gICAgICAgICAgICAgICAgICAgICBzaW1TZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXG4gICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBTb3VuZEdlbmVyYXRvckluaXRpYWxpemF0aW9uT3B0aW9ucyApOiB2b2lkIHtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluaXRpYWxpemVkLCAnY2FuXFwndCBpbml0aWFsaXplIHRoZSBzb3VuZCBtYW5hZ2VyIG1vcmUgdGhhbiBvbmNlJyApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTb3VuZEdlbmVyYXRvckluaXRpYWxpemF0aW9uT3B0aW9ucywgU291bmRHZW5lcmF0b3JJbml0aWFsaXphdGlvbk9wdGlvbnM+KCkoIHtcbiAgICAgIGNhdGVnb3JpZXM6IFsgJ3NpbS1zcGVjaWZpYycsICd1c2VyLWludGVyZmFjZScgXVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gb3B0aW9ucyB2YWxpZGF0aW9uXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcbiAgICAgIG9wdGlvbnMuY2F0ZWdvcmllcy5sZW5ndGggPT09IF8udW5pcSggb3B0aW9ucy5jYXRlZ29yaWVzICkubGVuZ3RoLFxuICAgICAgJ2NhdGVnb3JpZXMgbXVzdCBiZSB1bmlxdWUnXG4gICAgKTtcblxuICAgIGNvbnN0IG5vdyA9IHBoZXRBdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG5cbiAgICAvLyBUaGUgZmluYWwgc3RhZ2UgaXMgYSBkeW5hbWljcyBjb21wcmVzc29yIHRoYXQgaXMgdXNlZCBlc3NlbnRpYWxseSBhcyBhIGxpbWl0ZXIgdG8gcHJldmVudCBjbGlwcGluZy5cbiAgICBjb25zdCBkeW5hbWljc0NvbXByZXNzb3IgPSBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpO1xuICAgIGR5bmFtaWNzQ29tcHJlc3Nvci50aHJlc2hvbGQuc2V0VmFsdWVBdFRpbWUoIC02LCBub3cgKTtcbiAgICBkeW5hbWljc0NvbXByZXNzb3Iua25lZS5zZXRWYWx1ZUF0VGltZSggNSwgbm93ICk7XG4gICAgZHluYW1pY3NDb21wcmVzc29yLnJhdGlvLnNldFZhbHVlQXRUaW1lKCAxMiwgbm93ICk7XG4gICAgZHluYW1pY3NDb21wcmVzc29yLmF0dGFjay5zZXRWYWx1ZUF0VGltZSggMCwgbm93ICk7XG4gICAgZHluYW1pY3NDb21wcmVzc29yLnJlbGVhc2Uuc2V0VmFsdWVBdFRpbWUoIDAuMjUsIG5vdyApO1xuICAgIGR5bmFtaWNzQ29tcHJlc3Nvci5jb25uZWN0KCBwaGV0QXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uICk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGR1Y2tpbmcgZ2FpbiBub2RlLCB3aGljaCBpcyB1c2VkIHRvIHJlZHVjZSB0aGUgb3ZlcmFsbCBzb3VuZCBvdXRwdXQgbGV2ZWwgdGVtcG9yYXJpbHkgaW4gY2VydGFpblxuICAgIC8vIHNpdHVhdGlvbnMsIHN1Y2ggYXMgd2hlbiB0aGUgdm9pY2luZyBmZWF0dXJlIGlzIGFjdGl2ZWx5IHByb2R1Y2luZyBzcGVlY2guXG4gICAgdGhpcy5kdWNraW5nR2Fpbk5vZGUgPSBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLmR1Y2tpbmdHYWluTm9kZS5jb25uZWN0KCBkeW5hbWljc0NvbXByZXNzb3IgKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbWFpbiBnYWluIG5vZGUgZm9yIGFsbCBzb3VuZHMgbWFuYWdlZCBieSB0aGlzIHNvbmlmaWNhdGlvbiBtYW5hZ2VyLlxuICAgIHRoaXMubWFpbkdhaW5Ob2RlID0gcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5tYWluR2Fpbk5vZGUuY29ubmVjdCggdGhpcy5kdWNraW5nR2Fpbk5vZGUgKTtcblxuICAgIC8vIFNldCB1cCBhIGNvbnZvbHZlciBub2RlLCB3aGljaCB3aWxsIGJlIHVzZWQgdG8gY3JlYXRlIHRoZSByZXZlcmIgZWZmZWN0LlxuICAgIHRoaXMuY29udm9sdmVyID0gcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVDb252b2x2ZXIoKTtcbiAgICBjb25zdCBzZXRDb252b2x2ZXJCdWZmZXI6IFByb3BlcnR5TGlua0xpc3RlbmVyPEF1ZGlvQnVmZmVyIHwgbnVsbD4gPSBhdWRpb0J1ZmZlciA9PiB7XG4gICAgICBpZiAoIGF1ZGlvQnVmZmVyICkge1xuICAgICAgICB0aGlzLmNvbnZvbHZlciEuYnVmZmVyID0gYXVkaW9CdWZmZXI7XG4gICAgICAgIGVtcHR5QXBhcnRtZW50QmVkcm9vbTA2UmVzYW1wbGVkX21wMy5hdWRpb0J1ZmZlclByb3BlcnR5LnVubGluayggc2V0Q29udm9sdmVyQnVmZmVyICk7XG4gICAgICB9XG4gICAgfTtcbiAgICBlbXB0eUFwYXJ0bWVudEJlZHJvb20wNlJlc2FtcGxlZF9tcDMuYXVkaW9CdWZmZXJQcm9wZXJ0eS5saW5rKCBzZXRDb252b2x2ZXJCdWZmZXIgKTtcblxuICAgIC8vIGdhaW4gbm9kZSB0aGF0IHdpbGwgY29udHJvbCB0aGUgcmV2ZXJiIGxldmVsXG4gICAgdGhpcy5yZXZlcmJHYWluTm9kZSA9IHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMucmV2ZXJiR2Fpbk5vZGUuY29ubmVjdCggdGhpcy5tYWluR2Fpbk5vZGUgKTtcbiAgICB0aGlzLnJldmVyYkdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoIHRoaXMuX3JldmVyYkxldmVsLCBwaGV0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICk7XG4gICAgdGhpcy5jb252b2x2ZXIuY29ubmVjdCggdGhpcy5yZXZlcmJHYWluTm9kZSApO1xuXG4gICAgLy8gZHJ5IChub24tcmV2ZXJiZWQpIHBvcnRpb24gb2YgdGhlIG91dHB1dFxuICAgIHRoaXMuZHJ5R2Fpbk5vZGUgPSBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLmRyeUdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoIDEgLSB0aGlzLl9yZXZlcmJMZXZlbCwgcGhldEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSApO1xuICAgIHRoaXMuZHJ5R2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShcbiAgICAgIDEgLSB0aGlzLl9yZXZlcmJMZXZlbCxcbiAgICAgIHBoZXRBdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyBMSU5FQVJfR0FJTl9DSEFOR0VfVElNRVxuICAgICk7XG4gICAgdGhpcy5kcnlHYWluTm9kZS5jb25uZWN0KCB0aGlzLm1haW5HYWluTm9kZSApO1xuXG4gICAgLy8gQ3JlYXRlIGFuZCBob29rIHVwIGdhaW4gbm9kZXMgZm9yIGVhY2ggb2YgdGhlIGRlZmluZWQgY2F0ZWdvcmllcy5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvbnZvbHZlciAhPT0gbnVsbCAmJiB0aGlzLmRyeUdhaW5Ob2RlICE9PSBudWxsLCAnc29tZSBhdWRpbyBub2RlcyBoYXZlIG5vdCBiZWVuIGluaXRpYWxpemVkJyApO1xuICAgIG9wdGlvbnMuY2F0ZWdvcmllcy5mb3JFYWNoKCBjYXRlZ29yeU5hbWUgPT4ge1xuICAgICAgY29uc3QgZ2Fpbk5vZGUgPSBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIGdhaW5Ob2RlLmNvbm5lY3QoIHRoaXMuY29udm9sdmVyISApO1xuICAgICAgZ2Fpbk5vZGUuY29ubmVjdCggdGhpcy5kcnlHYWluTm9kZSEgKTtcbiAgICAgIHRoaXMuZ2Fpbk5vZGVzRm9yQ2F0ZWdvcmllcy5zZXQoIGNhdGVnb3J5TmFtZSwgZ2Fpbk5vZGUgKTtcbiAgICB9ICk7XG5cbiAgICAvLyBIb29rIHVwIGEgbGlzdGVuZXIgdGhhdCB0dXJucyBkb3duIHRoZSBtYWluIGdhaW4gaWYgc29uaWZpY2F0aW9uIGlzIGRpc2FibGVkIG9yIGlmIHRoZSBzaW0gaXNuJ3QgdmlzaWJsZSBvclxuICAgIC8vIGlzbid0IGFjdGl2ZS5cbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxuICAgICAgW1xuICAgICAgICB0aGlzLmVuYWJsZWRQcm9wZXJ0eSxcbiAgICAgICAgYXVkaW9FbmFibGVkUHJvcGVydHksXG4gICAgICAgIHNpbUNvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHksXG4gICAgICAgIHNpbVZpc2libGVQcm9wZXJ0eSxcbiAgICAgICAgc2ltQWN0aXZlUHJvcGVydHksXG4gICAgICAgIHNpbVNldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5XG4gICAgICBdLFxuICAgICAgKCBlbmFibGVkLCBhdWRpb0VuYWJsZWQsIHNpbUluaXRDb21wbGV0ZSwgc2ltVmlzaWJsZSwgc2ltQWN0aXZlLCBzaW1TZXR0aW5nUGhldGlvU3RhdGUgKSA9PiB7XG5cbiAgICAgICAgY29uc3QgZnVsbHlFbmFibGVkID0gZW5hYmxlZCAmJiBhdWRpb0VuYWJsZWQgJiYgc2ltSW5pdENvbXBsZXRlICYmIHNpbVZpc2libGUgJiYgc2ltQWN0aXZlICYmICFzaW1TZXR0aW5nUGhldGlvU3RhdGU7XG4gICAgICAgIGNvbnN0IGdhaW4gPSBmdWxseUVuYWJsZWQgPyB0aGlzLl9tYWluT3V0cHV0TGV2ZWwgOiAwO1xuXG4gICAgICAgIC8vIFNldCB0aGUgZ2FpbiwgYnV0IHNvbWV3aGF0IGdyYWR1YWxseSBpbiBvcmRlciB0byBhdm9pZCByYXBpZCB0cmFuc2llbnRzLCB3aGljaCBjYW4gc291bmQgbGlrZSBjbGlja3MuXG4gICAgICAgIHRoaXMubWFpbkdhaW5Ob2RlIS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKFxuICAgICAgICAgIGdhaW4sXG4gICAgICAgICAgcGhldEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIExJTkVBUl9HQUlOX0NIQU5HRV9USU1FXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IGR1Y2tNYWluT3V0cHV0TGV2ZWxQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgICAvLyBEZWZpbmUgYSBsaXN0ZW5lciB0aGF0IHdpbGwgdXBkYXRlIHRoZSBzdGF0ZSBvZiB0aGUgY29sbGVjdGl2ZSBkdWNraW5nIFByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgZHVja2luZ1xuICAgIC8vIChvdmVyYWxsIHZvbHVtZSByZWR1Y3Rpb24gdG8gcHJldmVudCBvdmVybGFwIHdpdGggb3RoZXIgc291bmRzKSBzaG91bGQgYmUgYWN0aXZlIG9yIGluYWN0aXZlLlxuICAgIGNvbnN0IHVwZGF0ZUR1Y2tpbmdTdGF0ZSA9ICgpID0+IHtcblxuICAgICAgLy8gUmVkdWNlIHRoZSBhcnJheSBvZiBpbmRpdmlkdWFsIGR1Y2tpbmcgUHJvcGVydGllcyBhcnJheSB0byBhIHNpbmdsZSBib29sZWFuIHZhbHVlLlxuICAgICAgZHVja01haW5PdXRwdXRMZXZlbFByb3BlcnR5LnZhbHVlID0gdGhpcy5kdWNraW5nUHJvcGVydGllcy5yZWR1Y2UoXG4gICAgICAgICggdmFsdWVTb0ZhciwgY3VycmVudFByb3BlcnR5ICkgPT4gdmFsdWVTb0ZhciB8fCBjdXJyZW50UHJvcGVydHkudmFsdWUsXG4gICAgICAgIGZhbHNlXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBJbXBsZW1lbnQgZHVja2luZyBvZiB0aGUgbWFpbiBvdXRwdXQuXG4gICAgZHVja01haW5PdXRwdXRMZXZlbFByb3BlcnR5LmxhenlMaW5rKCBkdWNrT3V0cHV0ID0+IHtcblxuICAgICAgLy8gU3RhdGUgY2hlY2tpbmcgLSBtYWtlIHN1cmUgdGhlIGR1Y2tpbmcgZ2FpbiBub2RlIGV4aXN0cy5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZHVja2luZ0dhaW5Ob2RlLCAnZHVja2luZyBsaXN0ZW5lciBmaXJlZCwgYnV0IG5vIGR1Y2tpbmcgZ2FpbiBub2RlIGV4aXN0cycgKTtcblxuICAgICAgLy8gVXNlIHRpbWUgY29uc3RhbnQgdmFsdWVzIHRoYXQgd2lsbCB0dXJuIGRvd24gdGhlIG91dHB1dCBsZXZlbCBmYXN0ZXIgdGhhbiBpdCB3aWxsIHR1cm4gaXQgdXAuICBUaGlzIHNvdW5kc1xuICAgICAgLy8gYmV0dGVyLCBzaW5jZSBpdCBwcmV2ZW50cyBvdmVybGFwIHdpdGggdGhlIHZvaWNlLlxuICAgICAgY29uc3QgdGltZUNvbnN0YW50ID0gZHVja091dHB1dCA/IDAuMDUgOiAwLjU7XG5cbiAgICAgIC8vIER1Y2sgb3IgZG9uJ3QuXG4gICAgICBjb25zdCBub3cgPSBwaGV0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgICAgdGhpcy5kdWNraW5nR2Fpbk5vZGU/LmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKCBub3cgKTtcbiAgICAgIHRoaXMuZHVja2luZ0dhaW5Ob2RlPy5nYWluLnNldFRhcmdldEF0VGltZSggZHVja091dHB1dCA/IEFVRElPX0RVQ0tJTkdfTEVWRUwgOiAxLCBub3csIHRpbWVDb25zdGFudCApO1xuICAgIH0gKTtcblxuICAgIC8vIEhhbmRsZSB0aGUgYWRkaW5nIGFuZCByZW1vdmFsIG9mIGluZGl2aWR1YWwgZHVja2luZyBQcm9wZXJ0aWVzLlxuICAgIHRoaXMuZHVja2luZ1Byb3BlcnRpZXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGFkZGVkRHVja2luZ1Byb3BlcnR5ID0+IHtcbiAgICAgIGFkZGVkRHVja2luZ1Byb3BlcnR5LmxpbmsoIHVwZGF0ZUR1Y2tpbmdTdGF0ZSApO1xuICAgICAgY29uc3QgY2hlY2tBbmRSZW1vdmUgPSAoIHJlbW92ZWREdWNraW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ICkgPT4ge1xuICAgICAgICBpZiAoIHJlbW92ZWREdWNraW5nUHJvcGVydHkgPT09IGFkZGVkRHVja2luZ1Byb3BlcnR5ICkge1xuICAgICAgICAgIHJlbW92ZWREdWNraW5nUHJvcGVydHkudW5saW5rKCB1cGRhdGVEdWNraW5nU3RhdGUgKTtcbiAgICAgICAgICB0aGlzLmR1Y2tpbmdQcm9wZXJ0aWVzLnJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIoIGNoZWNrQW5kUmVtb3ZlICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLmR1Y2tpbmdQcm9wZXJ0aWVzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGNoZWNrQW5kUmVtb3ZlICk7XG4gICAgfSApO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBIYW5kbGUgdGhlIGF1ZGlvIGNvbnRleHQgc3RhdGUsIGJvdGggd2hlbiBjaGFuZ2VzIG9jY3VyIGFuZCB3aGVuIGl0IGlzIGluaXRpYWxseSBtdXRlZCBkdWUgdG8gdGhlIGF1dG9wbGF5XG4gICAgLy8gcG9saWN5LiAgQXMgb2YgdGhpcyB3cml0aW5nIChGZWIgMjAxOSksIHRoZXJlIGFyZSBzb21lIGRpZmZlcmVuY2VzIGluIGhvdyB0aGUgYXVkaW8gY29udGV4dCBzdGF0ZSBiZWhhdmVzIG9uXG4gICAgLy8gZGlmZmVyZW50IHBsYXRmb3Jtcywgc28gdGhlIGNvZGUgbW9uaXRvcnMgZGlmZmVyZW50IGV2ZW50cyBhbmQgc3RhdGVzIHRvIGtlZXAgdGhlIGF1ZGlvIGNvbnRleHQgcnVubmluZy4gIEFzIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIHRoZSBhdWRpbyBjb250ZXh0IGJlY29tZXMgbW9yZSBjb25zaXN0ZW50IGFjcm9zcyBicm93c2VycywgaXQgbWF5IGJlIHBvc3NpYmxlIHRvIHNpbXBsaWZ5IHRoaXMuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgdXNlciBpbnRlcmFjdGlvbiBsaXN0ZW5lcnMsIHVzZWQgdG8gYXZvaWQgY29kZSBkdXBsaWNhdGlvblxuICAgIGNvbnN0IHJlbW92ZVVzZXJJbnRlcmFjdGlvbkxpc3RlbmVycyA9ICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHJlc3VtZUF1ZGlvQ29udGV4dCwgZmFsc2UgKTtcbiAgICAgIGlmICggRGlzcGxheS51c2VyR2VzdHVyZUVtaXR0ZXIuaGFzTGlzdGVuZXIoIHJlc3VtZUF1ZGlvQ29udGV4dCApICkge1xuICAgICAgICBEaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggcmVzdW1lQXVkaW9Db250ZXh0ICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIGxpc3RlbmVyIHRoYXQgcmVzdW1lcyB0aGUgYXVkaW8gY29udGV4dFxuICAgIGNvbnN0IHJlc3VtZUF1ZGlvQ29udGV4dCA9ICgpID0+IHtcblxuICAgICAgaWYgKCBwaGV0QXVkaW9Db250ZXh0LnN0YXRlICE9PSAncnVubmluZycgKSB7XG5cbiAgICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGBhdWRpbyBjb250ZXh0IG5vdCBydW5uaW5nLCBhdHRlbXB0aW5nIHRvIHJlc3VtZSwgc3RhdGUgPSAke3BoZXRBdWRpb0NvbnRleHQuc3RhdGV9YCApO1xuXG4gICAgICAgIC8vIHRlbGwgdGhlIGF1ZGlvIGNvbnRleHQgdG8gcmVzdW1lXG4gICAgICAgIHBoZXRBdWRpb0NvbnRleHQucmVzdW1lKClcbiAgICAgICAgICAudGhlbiggKCkgPT4ge1xuICAgICAgICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGByZXN1bWUgYXBwZWFycyB0byBoYXZlIHN1Y2NlZWRlZCwgcGhldEF1ZGlvQ29udGV4dC5zdGF0ZSA9ICR7cGhldEF1ZGlvQ29udGV4dC5zdGF0ZX1gICk7XG4gICAgICAgICAgICByZW1vdmVVc2VySW50ZXJhY3Rpb25MaXN0ZW5lcnMoKTtcbiAgICAgICAgICB9IClcbiAgICAgICAgICAuY2F0Y2goIGVyciA9PiB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgZXJyb3Igd2hlbiB0cnlpbmcgdG8gcmVzdW1lIGF1ZGlvIGNvbnRleHQsIGVyciA9ICR7ZXJyfWA7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCBlcnJvck1lc3NhZ2UgKTtcbiAgICAgICAgICAgIGFzc2VydCAmJiBhbGVydCggZXJyb3JNZXNzYWdlICk7XG4gICAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gYXVkaW8gY29udGV4dCBpcyBhbHJlYWR5IHJ1bm5pbmcsIG5vIG5lZWQgdG8gbGlzdGVuIGFueW1vcmVcbiAgICAgICAgcmVtb3ZlVXNlckludGVyYWN0aW9uTGlzdGVuZXJzKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIGxpc3RlbiBmb3IgYSB0b3VjaHN0YXJ0IC0gdGhpcyBvbmx5IHdvcmtzIHRvIHJlc3VtZSB0aGUgYXVkaW8gY29udGV4dCBvbiBpT1MgZGV2aWNlcyAoYXMgb2YgdGhpcyB3cml0aW5nKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHJlc3VtZUF1ZGlvQ29udGV4dCwgZmFsc2UgKTtcblxuICAgIC8vIGxpc3RlbiBmb3Igb3RoZXIgdXNlciBnZXN0dXJlIGV2ZW50c1xuICAgIERpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyLmFkZExpc3RlbmVyKCByZXN1bWVBdWRpb0NvbnRleHQgKTtcblxuICAgIC8vIER1cmluZyB0ZXN0aW5nLCBzZXZlcmFsIHVzZSBjYXNlcyB3ZXJlIGZvdW5kIHdoZXJlIHRoZSBhdWRpbyBjb250ZXh0IHN0YXRlIGNoYW5nZXMgdG8gc29tZXRoaW5nIG90aGVyIHRoYW4gdGhlXG4gICAgLy8gXCJydW5uaW5nXCIgc3RhdGUgd2hpbGUgdGhlIHNpbSBpcyBpbiB1c2UgKGdlbmVyYWxseSBlaXRoZXIgXCJzdXNwZW5kZWRcIiBvciBcImludGVycnVwdGVkXCIsIGRlcGVuZGluZyBvbiB0aGVcbiAgICAvLyBicm93c2VyKS4gIFRoZSBmb2xsb3dpbmcgY29kZSBpcyBpbnRlbmRlZCB0byBoYW5kbGUgdGhpcyBzaXR1YXRpb24gYnkgdHJ5aW5nIHRvIHJlc3VtZSBpdCByaWdodCBhd2F5LiAgR2l0SHViXG4gICAgLy8gaXNzdWVzIHdpdGggZGV0YWlscyBhYm91dCB3aHkgdGhpcyBpcyBuZWNlc3NhcnkgYXJlOlxuICAgIC8vIC0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbWJvL2lzc3Vlcy81OFxuICAgIC8vIC0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbWJvL2lzc3Vlcy81OVxuICAgIC8vIC0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZyYWN0aW9ucy1jb21tb24vaXNzdWVzLzgyXG4gICAgLy8gLSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZnJpY3Rpb24vaXNzdWVzLzE3M1xuICAgIC8vIC0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Jlc2lzdGFuY2UtaW4tYS13aXJlL2lzc3Vlcy8xOTBcbiAgICAvLyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW1iby9pc3N1ZXMvOTBcbiAgICBsZXQgcHJldmlvdXNBdWRpb0NvbnRleHRTdGF0ZTogQXVkaW9Db250ZXh0U3RhdGUgPSBwaGV0QXVkaW9Db250ZXh0LnN0YXRlO1xuICAgIGF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTW9uaXRvci5hZGRTdGF0ZUNoYW5nZUxpc3RlbmVyKCBwaGV0QXVkaW9Db250ZXh0LCAoIHN0YXRlOiBBdWRpb0NvbnRleHRTdGF0ZSApID0+IHtcblxuICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coXG4gICAgICAgIGBhdWRpbyBjb250ZXh0IHN0YXRlIGNoYW5nZWQsIG9sZCBzdGF0ZSA9ICR7XG4gICAgICAgICAgcHJldmlvdXNBdWRpb0NvbnRleHRTdGF0ZVxuICAgICAgICB9LCBuZXcgc3RhdGUgPSAke1xuICAgICAgICAgIHN0YXRlXG4gICAgICAgIH0sIGF1ZGlvIGNvbnRleHQgdGltZSA9ICR7XG4gICAgICAgICAgcGhldEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZX1gXG4gICAgICApO1xuXG4gICAgICBpZiAoIHN0YXRlICE9PSAncnVubmluZycgKSB7XG5cbiAgICAgICAgLy8gQWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIHJlc3VtZSB0aGUgYXVkaW8gY29udGV4dCBvbiB0aGUgbmV4dCB0b3VjaHN0YXJ0LlxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCByZXN1bWVBdWRpb0NvbnRleHQsIGZhbHNlICk7XG5cbiAgICAgICAgLy8gTGlzdGVuIGFsc28gZm9yIG90aGVyIHVzZXIgZ2VzdHVyZSBldmVudHMgdGhhdCBjYW4gYmUgdXNlZCB0byByZXN1bWUgdGhlIGF1ZGlvIGNvbnRleHQuXG4gICAgICAgIGlmICggIURpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyLmhhc0xpc3RlbmVyKCByZXN1bWVBdWRpb0NvbnRleHQgKSApIHtcbiAgICAgICAgICBEaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlci5hZGRMaXN0ZW5lciggcmVzdW1lQXVkaW9Db250ZXh0ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyggJ0F1ZGlvQ29udGV4dCBpcyBub3cgcnVubmluZy4nICk7XG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzQXVkaW9Db250ZXh0U3RhdGUgPSBzdGF0ZTtcbiAgICB9ICk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIC8vIEFkZCBhbnkgc291bmQgZ2VuZXJhdG9ycyB0aGF0IHdlcmUgd2FpdGluZyBmb3IgaW5pdGlhbGl6YXRpb24gdG8gY29tcGxldGUgKG11c3QgYmUgZG9uZSBhZnRlciBpbml0IGNvbXBsZXRlKS5cbiAgICB0aGlzLnNvdW5kR2VuZXJhdG9yc0F3YWl0aW5nQWRkLmZvckVhY2goIHNvdW5kR2VuZXJhdG9yQXdhaXRpbmdBZGQgPT4ge1xuICAgICAgdGhpcy5hZGRTb3VuZEdlbmVyYXRvcihcbiAgICAgICAgc291bmRHZW5lcmF0b3JBd2FpdGluZ0FkZC5zb3VuZEdlbmVyYXRvcixcbiAgICAgICAgc291bmRHZW5lcmF0b3JBd2FpdGluZ0FkZC5zb3VuZEdlbmVyYXRvckFkZE9wdGlvbnNcbiAgICAgICk7XG4gICAgfSApO1xuICAgIHRoaXMuc291bmRHZW5lcmF0b3JzQXdhaXRpbmdBZGQubGVuZ3RoID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCBzb3VuZEdlbmVyYXRvciBoYXMgYmVlbiBwcmV2aW91c2x5IGFkZGVkIHRvIHRoZSBzb3VuZE1hbmFnZXIuXG4gICAqL1xuICBwdWJsaWMgaGFzU291bmRHZW5lcmF0b3IoIHNvdW5kR2VuZXJhdG9yOiBTb3VuZEdlbmVyYXRvciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zb3VuZEdlbmVyYXRvcnMuaW5jbHVkZXMoIHNvdW5kR2VuZXJhdG9yICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgc291bmQgZ2VuZXJhdG9yLiAgVGhpcyBjb25uZWN0cyB0aGUgc291bmQgZ2VuZXJhdG9yIHRvIHRoZSBhdWRpbyBwYXRoLCBwdXRzIGl0IG9uIHRoZSBsaXN0IG9mIHNvdW5kXG4gICAqIGdlbmVyYXRvcnMsIGFuZCBjcmVhdGVzIGFuZCByZXR1cm5zIGEgdW5pcXVlIElELlxuICAgKi9cbiAgcHVibGljIGFkZFNvdW5kR2VuZXJhdG9yKCBzb3VuZEdlbmVyYXRvcjogU291bmRHZW5lcmF0b3IsIHByb3ZpZGVkT3B0aW9ucz86IFNvdW5kR2VuZXJhdG9yQWRkT3B0aW9ucyApOiB2b2lkIHtcblxuICAgIC8vIFdlJ2xsIG5lZWQgYW4gZW1wdHkgb2JqZWN0IG9mIG5vIG9wdGlvbnMgd2VyZSBwcm92aWRlZC5cbiAgICBpZiAoIHByb3ZpZGVkT3B0aW9ucyA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgcHJvdmlkZWRPcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgaW5pdGlhbGl6YXRpb24gaGFzIGJlZW4gZG9uZSBhbmQsIGlmIG5vdCwgcXVldWUgdGhlIHNvdW5kIGdlbmVyYXRvciBhbmQgaXRzIG9wdGlvbnMgZm9yIGFkZGl0aW9uXG4gICAgLy8gb25jZSBpbml0aWFsaXphdGlvbiBpcyBjb21wbGV0ZS4gIE5vdGUgdGhhdCB3aGVuIHNvdW5kIGlzIG5vdCBzdXBwb3J0ZWQsIGluaXRpYWxpemF0aW9uIHdpbGwgbmV2ZXIgb2NjdXIuXG4gICAgaWYgKCAhdGhpcy5pbml0aWFsaXplZCApIHtcbiAgICAgIHRoaXMuc291bmRHZW5lcmF0b3JzQXdhaXRpbmdBZGQucHVzaCgge1xuICAgICAgICBzb3VuZEdlbmVyYXRvcjogc291bmRHZW5lcmF0b3IsXG4gICAgICAgIHNvdW5kR2VuZXJhdG9yQWRkT3B0aW9uczogcHJvdmlkZWRPcHRpb25zXG4gICAgICB9ICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gc3RhdGUgY2hlY2tpbmcgLSBtYWtlIHN1cmUgdGhlIG5lZWRlZCBub2RlcyBoYXZlIGJlZW4gY3JlYXRlZFxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29udm9sdmVyICE9PSBudWxsICYmIHRoaXMuZHJ5R2Fpbk5vZGUgIT09IG51bGwsICdzb21lIGF1ZGlvIG5vZGVzIGhhdmUgbm90IGJlZW4gaW5pdGlhbGl6ZWQnICk7XG5cbiAgICAvLyBWZXJpZnkgdGhhdCB0aGlzIGlzIG5vdCBhIGR1cGxpY2F0ZSBhZGRpdGlvbi5cbiAgICBjb25zdCBoYXNTb3VuZEdlbmVyYXRvciA9IHRoaXMuaGFzU291bmRHZW5lcmF0b3IoIHNvdW5kR2VuZXJhdG9yICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWhhc1NvdW5kR2VuZXJhdG9yLCAnY2FuXFwndCBhZGQgdGhlIHNhbWUgc291bmQgZ2VuZXJhdG9yIHR3aWNlJyApO1xuXG4gICAgLy8gZGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTb3VuZEdlbmVyYXRvckFkZE9wdGlvbnMsIFNvdW5kR2VuZXJhdG9yQWRkT3B0aW9ucz4oKSgge1xuICAgICAgY2F0ZWdvcnlOYW1lOiBudWxsXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBDb25uZWN0IHRoZSBzb3VuZCBnZW5lcmF0b3IgdG8gYW4gb3V0cHV0IHBhdGguXG4gICAgaWYgKCBvcHRpb25zLmNhdGVnb3J5TmFtZSA9PT0gbnVsbCApIHtcbiAgICAgIHNvdW5kR2VuZXJhdG9yLmNvbm5lY3QoIHRoaXMuY29udm9sdmVyISApO1xuICAgICAgc291bmRHZW5lcmF0b3IuY29ubmVjdCggdGhpcy5kcnlHYWluTm9kZSEgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KFxuICAgICAgICB0aGlzLmdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXMuaGFzKCBvcHRpb25zLmNhdGVnb3J5TmFtZSApLFxuICAgICAgICBgY2F0ZWdvcnkgZG9lcyBub3QgZXhpc3QgOiAke29wdGlvbnMuY2F0ZWdvcnlOYW1lfWBcbiAgICAgICk7XG4gICAgICBzb3VuZEdlbmVyYXRvci5jb25uZWN0KCB0aGlzLmdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXMuZ2V0KCBvcHRpb25zLmNhdGVnb3J5TmFtZSApISApO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGlzIHNvdW5kIGdlbmVyYXRvciB0byBvdXIgbGlzdC5cbiAgICB0aGlzLnNvdW5kR2VuZXJhdG9ycy5wdXNoKCBzb3VuZEdlbmVyYXRvciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgc3BlY2lmaWVkIHNvdW5kIGdlbmVyYXRvci5cbiAgICovXG4gIHB1YmxpYyByZW1vdmVTb3VuZEdlbmVyYXRvciggc291bmRHZW5lcmF0b3I6IFNvdW5kR2VuZXJhdG9yICk6IHZvaWQge1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHNvdW5kIG1hbmFnZXIgaXMgaW5pdGlhbGl6ZWQgYW5kLCBpZiBub3QsIGlzc3VlIGEgd2FybmluZyBhbmQgaWdub3JlIHRoZSByZXF1ZXN0LiAgVGhpcyBpcyBub3QgYW5cbiAgICAvLyBhc3NlcnRpb24gYmVjYXVzZSB0aGUgc291bmQgbWFuYWdlciBtYXkgbm90IGJlIGluaXRpYWxpemVkIGluIGNhc2VzIHdoZXJlIHRoZSBzb3VuZCBpcyBub3QgZW5hYmxlZCBmb3IgdGhlXG4gICAgLy8gc2ltdWxhdGlvbiwgYnV0IHRoaXMgbWV0aG9kIGNhbiBzdGlsbCBlbmQgdXAgYmVpbmcgaW52b2tlZC5cbiAgICBpZiAoICF0aGlzLmluaXRpYWxpemVkICkge1xuXG4gICAgICBjb25zdCB0b1JlbW92ZSA9IHRoaXMuc291bmRHZW5lcmF0b3JzQXdhaXRpbmdBZGQuZmlsdGVyKCBzID0+IHMuc291bmRHZW5lcmF0b3IgPT09IHNvdW5kR2VuZXJhdG9yICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0b1JlbW92ZS5sZW5ndGggPiAwLCAndW5hYmxlIHRvIHJlbW92ZSBzb3VuZCBnZW5lcmF0b3IgLSBub3QgZm91bmQnICk7XG4gICAgICB3aGlsZSAoIHRvUmVtb3ZlLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnNvdW5kR2VuZXJhdG9yc0F3YWl0aW5nQWRkLCB0b1JlbW92ZVsgMCBdICk7XG4gICAgICAgIHRvUmVtb3ZlLnNoaWZ0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgaXQgaXMgYWN0dWFsbHkgcHJlc2VudCBvbiB0aGUgbGlzdC5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNvdW5kR2VuZXJhdG9ycy5pbmNsdWRlcyggc291bmRHZW5lcmF0b3IgKSwgJ3VuYWJsZSB0byByZW1vdmUgc291bmQgZ2VuZXJhdG9yIC0gbm90IGZvdW5kJyApO1xuXG4gICAgLy8gRGlzY29ubmVjdCB0aGUgc291bmQgZ2VuZXJhdG9yIGZyb20gYW55IGF1ZGlvIG5vZGVzIHRvIHdoaWNoIGl0IG1heSBiZSBjb25uZWN0ZWQuXG4gICAgaWYgKCBzb3VuZEdlbmVyYXRvci5pc0Nvbm5lY3RlZFRvKCB0aGlzLmNvbnZvbHZlciEgKSApIHtcbiAgICAgIHNvdW5kR2VuZXJhdG9yLmRpc2Nvbm5lY3QoIHRoaXMuY29udm9sdmVyISApO1xuICAgIH1cbiAgICBpZiAoIHNvdW5kR2VuZXJhdG9yLmlzQ29ubmVjdGVkVG8oIHRoaXMuZHJ5R2Fpbk5vZGUhICkgKSB7XG4gICAgICBzb3VuZEdlbmVyYXRvci5kaXNjb25uZWN0KCB0aGlzLmRyeUdhaW5Ob2RlISApO1xuICAgIH1cbiAgICB0aGlzLmdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXMuZm9yRWFjaCggZ2Fpbk5vZGUgPT4ge1xuICAgICAgaWYgKCBzb3VuZEdlbmVyYXRvci5pc0Nvbm5lY3RlZFRvKCBnYWluTm9kZSApICkge1xuICAgICAgICBzb3VuZEdlbmVyYXRvci5kaXNjb25uZWN0KCBnYWluTm9kZSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIFJlbW92ZSB0aGUgc291bmQgZ2VuZXJhdG9yIGZyb20gdGhlIGxpc3QuXG4gICAgdGhpcy5zb3VuZEdlbmVyYXRvcnMuc3BsaWNlKCB0aGlzLnNvdW5kR2VuZXJhdG9ycy5pbmRleE9mKCBzb3VuZEdlbmVyYXRvciApLCAxICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBtYWluIG91dHB1dCBsZXZlbCBmb3Igc291bmRzLlxuICAgKiBAcGFyYW0gbGV2ZWwgLSB2YWxpZCB2YWx1ZXMgZnJvbSAwIChtaW4pIHRocm91Z2ggMSAobWF4KVxuICAgKi9cbiAgcHVibGljIHNldE1haW5PdXRwdXRMZXZlbCggbGV2ZWw6IG51bWJlciApOiB2b2lkIHtcblxuICAgIC8vIENoZWNrIGlmIGluaXRpYWxpemF0aW9uIGhhcyBiZWVuIGRvbmUuICBUaGlzIGlzIG5vdCBhbiBhc3NlcnRpb24gYmVjYXVzZSB0aGUgc291bmQgbWFuYWdlciBtYXkgbm90IGJlXG4gICAgLy8gaW5pdGlhbGl6ZWQgaWYgc291bmQgaXMgbm90IGVuYWJsZWQgZm9yIHRoZSBzaW0uXG4gICAgaWYgKCAhdGhpcy5pbml0aWFsaXplZCApIHtcbiAgICAgIGNvbnNvbGUud2FybiggJ2FuIGF0dGVtcHQgd2FzIG1hZGUgdG8gc2V0IHRoZSBtYWluIG91dHB1dCBsZXZlbCBvbiBhbiB1bmluaXRpYWxpemVkIHNvdW5kIG1hbmFnZXIsIGlnbm9yaW5nJyApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHJhbmdlIGNoZWNrXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGV2ZWwgPj0gMCAmJiBsZXZlbCA8PSAxLCBgb3V0cHV0IGxldmVsIHZhbHVlIG91dCBvZiByYW5nZTogJHtsZXZlbH1gICk7XG5cbiAgICB0aGlzLl9tYWluT3V0cHV0TGV2ZWwgPSBsZXZlbDtcbiAgICBpZiAoIHRoaXMuZW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xuICAgICAgdGhpcy5tYWluR2Fpbk5vZGUhLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoXG4gICAgICAgIGxldmVsLFxuICAgICAgICBwaGV0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgTElORUFSX0dBSU5fQ0hBTkdFX1RJTUVcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBtYWluT3V0cHV0TGV2ZWwoIG91dHB1dExldmVsICkge1xuICAgIHRoaXMuc2V0TWFpbk91dHB1dExldmVsKCBvdXRwdXRMZXZlbCApO1xuICB9XG5cbiAgcHVibGljIGdldCBtYWluT3V0cHV0TGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFpbk91dHB1dExldmVsKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IG91dHB1dCBsZXZlbCBzZXR0aW5nLlxuICAgKi9cbiAgcHVibGljIGdldE1haW5PdXRwdXRMZXZlbCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYWluT3V0cHV0TGV2ZWw7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG91dHB1dCBsZXZlbCBmb3IgdGhlIHNwZWNpZmllZCBjYXRlZ29yeSBvZiBzb3VuZCBnZW5lcmF0b3IuXG4gICAqIEBwYXJhbSBjYXRlZ29yeU5hbWUgLSBuYW1lIG9mIGNhdGVnb3J5IHRvIHdoaWNoIHRoaXMgaW52b2NhdGlvbiBhcHBsaWVzXG4gICAqIEBwYXJhbSBvdXRwdXRMZXZlbCAtIHZhbGlkIHZhbHVlcyBmcm9tIDAgdGhyb3VnaCAxXG4gICAqL1xuICBwdWJsaWMgc2V0T3V0cHV0TGV2ZWxGb3JDYXRlZ29yeSggY2F0ZWdvcnlOYW1lOiBzdHJpbmcsIG91dHB1dExldmVsOiBudW1iZXIgKTogdm9pZCB7XG5cbiAgICAvLyBDaGVjayBpZiBpbml0aWFsaXphdGlvbiBoYXMgYmVlbiBkb25lLiAgVGhpcyBpcyBub3QgYW4gYXNzZXJ0aW9uIGJlY2F1c2UgdGhlIHNvdW5kIG1hbmFnZXIgbWF5IG5vdCBiZVxuICAgIC8vIGluaXRpYWxpemVkIGlmIHNvdW5kIGlzIG5vdCBlbmFibGVkIGZvciB0aGUgc2ltLlxuICAgIGlmICggIXRoaXMuaW5pdGlhbGl6ZWQgKSB7XG4gICAgICBjb25zb2xlLndhcm4oICdhbiBhdHRlbXB0IHdhcyBtYWRlIHRvIHNldCB0aGUgb3V0cHV0IGxldmVsIGZvciBhIHNvdW5kIGNhdGVnb3J5IG9uIGFuIHVuaW5pdGlhbGl6ZWQgc291bmQgbWFuYWdlciwgaWdub3JpbmcnICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pbml0aWFsaXplZCwgJ291dHB1dCBsZXZlbHMgZm9yIGNhdGVnb3JpZXMgY2Fubm90IGJlIGFkZGVkIHVudGlsIGluaXRpYWxpemF0aW9uIGhhcyBiZWVuIGRvbmUnICk7XG5cbiAgICAvLyByYW5nZSBjaGVja1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG91dHB1dExldmVsID49IDAgJiYgb3V0cHV0TGV2ZWwgPD0gMSwgYG91dHB1dCBsZXZlbCB2YWx1ZSBvdXQgb2YgcmFuZ2U6ICR7b3V0cHV0TGV2ZWx9YCApO1xuXG4gICAgLy8gdmVyaWZ5IHRoYXQgdGhlIHNwZWNpZmllZCBjYXRlZ29yeSBleGlzdHNcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXMuZ2V0KCBjYXRlZ29yeU5hbWUgKSwgYG5vIGNhdGVnb3J5IHdpdGggbmFtZSA9ICR7Y2F0ZWdvcnlOYW1lfWAgKTtcblxuICAgIC8vIFNldCB0aGUgZ2FpbiB2YWx1ZSBvbiB0aGUgYXBwcm9wcmlhdGUgZ2FpbiBub2RlLlxuICAgIGNvbnN0IGdhaW5Ob2RlID0gdGhpcy5nYWluTm9kZXNGb3JDYXRlZ29yaWVzLmdldCggY2F0ZWdvcnlOYW1lICk7XG4gICAgaWYgKCBnYWluTm9kZSApIHtcbiAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoIG91dHB1dExldmVsLCBwaGV0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGR1Y2tpbmcgUHJvcGVydHkuICBXaGVuIGFueSBvZiB0aGUgZHVja2luZyBQcm9wZXJ0aWVzIGFyZSB0cnVlLCB0aGUgb3V0cHV0IGxldmVsIHdpbGwgYmUgXCJkdWNrZWRcIiwgbWVhbmluZ1xuICAgKiB0aGF0IGl0IHdpbGwgYmUgcmVkdWNlZC5cbiAgICovXG4gIHB1YmxpYyBhZGREdWNraW5nUHJvcGVydHkoIGR1Y2tpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gKTogdm9pZCB7XG4gICAgdGhpcy5kdWNraW5nUHJvcGVydGllcy5hZGQoIGR1Y2tpbmdQcm9wZXJ0eSApO1xuICB9XG5cblxuICAvKipcbiAgICogUmVtb3ZlIGEgZHVja2luZyBQcm9wZXJ0eSB0aGF0IGhhZCBiZWVuIHByZXZpb3VzbHkgYWRkZWQuXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlRHVja2luZ1Byb3BlcnR5KCBkdWNraW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZHVja2luZ1Byb3BlcnRpZXMuaW5jbHVkZXMoIGR1Y2tpbmdQcm9wZXJ0eSApLCAnZHVja2luZyBQcm9wZXJ0eSBub3QgcHJlc2VudCcgKTtcbiAgICB0aGlzLmR1Y2tpbmdQcm9wZXJ0aWVzLnJlbW92ZSggZHVja2luZ1Byb3BlcnR5ICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBvdXRwdXQgbGV2ZWwgZm9yIHRoZSBzcGVjaWZpZWQgc291bmQgZ2VuZXJhdG9yIGNhdGVnb3J5LlxuICAgKiBAcGFyYW0gY2F0ZWdvcnlOYW1lIC0gbmFtZSBvZiBjYXRlZ29yeSB0byB3aGljaCB0aGlzIGludm9jYXRpb24gYXBwbGllc1xuICAgKi9cbiAgcHVibGljIGdldE91dHB1dExldmVsRm9yQ2F0ZWdvcnkoIGNhdGVnb3J5TmFtZTogc3RyaW5nICk6IG51bWJlciB7XG5cbiAgICAvLyBDaGVjayBpZiBpbml0aWFsaXphdGlvbiBoYXMgYmVlbiBkb25lLiAgVGhpcyBpcyBub3QgYW4gYXNzZXJ0aW9uIGJlY2F1c2UgdGhlIHNvdW5kIG1hbmFnZXIgbWF5IG5vdCBiZVxuICAgIC8vIGluaXRpYWxpemVkIGlmIHNvdW5kIGlzIG5vdCBlbmFibGVkIGZvciB0aGUgc2ltLlxuICAgIGlmICggIXRoaXMuaW5pdGlhbGl6ZWQgKSB7XG4gICAgICBjb25zb2xlLndhcm4oICdhbiBhdHRlbXB0IHdhcyBtYWRlIHRvIGdldCB0aGUgb3V0cHV0IGxldmVsIGZvciBhIHNvdW5kIGNhdGVnb3J5IG9uIGFuIHVuaW5pdGlhbGl6ZWQgc291bmQgbWFuYWdlciwgcmV0dXJuaW5nIDAnICk7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIEdhaW5Ob2RlIGZvciB0aGUgc3BlY2lmaWVkIGNhdGVnb3J5LlxuICAgIGNvbnN0IGdhaW5Ob2RlID0gdGhpcy5nYWluTm9kZXNGb3JDYXRlZ29yaWVzLmdldCggY2F0ZWdvcnlOYW1lICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ2Fpbk5vZGUsIGBubyBjYXRlZ29yeSB3aXRoIG5hbWUgPSAke2NhdGVnb3J5TmFtZX1gICk7XG5cbiAgICByZXR1cm4gZ2Fpbk5vZGUhLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBhbW91bnQgb2YgcmV2ZXJiLlxuICAgKiBAcGFyYW0gbmV3UmV2ZXJiTGV2ZWwgLSB2YWx1ZSBmcm9tIDAgdG8gMSwgMCA9IHRvdGFsbHkgZHJ5LCAxID0gd2V0XG4gICAqL1xuICBwdWJsaWMgc2V0UmV2ZXJiTGV2ZWwoIG5ld1JldmVyYkxldmVsOiBudW1iZXIgKTogdm9pZCB7XG5cbiAgICAvLyBDaGVjayBpZiBpbml0aWFsaXphdGlvbiBoYXMgYmVlbiBkb25lLiAgVGhpcyBpcyBub3QgYW4gYXNzZXJ0aW9uIGJlY2F1c2UgdGhlIHNvdW5kIG1hbmFnZXIgbWF5IG5vdCBiZVxuICAgIC8vIGluaXRpYWxpemVkIGlmIHNvdW5kIGlzIG5vdCBlbmFibGVkIGZvciB0aGUgc2ltLlxuICAgIGlmICggIXRoaXMuaW5pdGlhbGl6ZWQgKSB7XG4gICAgICBjb25zb2xlLndhcm4oICdhbiBhdHRlbXB0IHdhcyBtYWRlIHRvIHNldCB0aGUgcmV2ZXJiIGxldmVsIG9uIGFuIHVuaW5pdGlhbGl6ZWQgc291bmQgbWFuYWdlciwgaWdub3JpbmcnICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCBuZXdSZXZlcmJMZXZlbCAhPT0gdGhpcy5fcmV2ZXJiTGV2ZWwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXdSZXZlcmJMZXZlbCA+PSAwICYmIG5ld1JldmVyYkxldmVsIDw9IDEsIGByZXZlcmIgdmFsdWUgb3V0IG9mIHJhbmdlOiAke25ld1JldmVyYkxldmVsfWAgKTtcbiAgICAgIGNvbnN0IG5vdyA9IHBoZXRBdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgICB0aGlzLnJldmVyYkdhaW5Ob2RlIS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKCBuZXdSZXZlcmJMZXZlbCwgbm93ICsgTElORUFSX0dBSU5fQ0hBTkdFX1RJTUUgKTtcbiAgICAgIHRoaXMuZHJ5R2Fpbk5vZGUhLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoIDEgLSBuZXdSZXZlcmJMZXZlbCwgbm93ICsgTElORUFSX0dBSU5fQ0hBTkdFX1RJTUUgKTtcbiAgICAgIHRoaXMuX3JldmVyYkxldmVsID0gbmV3UmV2ZXJiTGV2ZWw7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCByZXZlcmJMZXZlbCggcmV2ZXJiTGV2ZWwgKSB7XG4gICAgdGhpcy5zZXRSZXZlcmJMZXZlbCggcmV2ZXJiTGV2ZWwgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcmV2ZXJiTGV2ZWwoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZXZlcmJMZXZlbCgpO1xuICB9XG5cbiAgcHVibGljIGdldFJldmVyYkxldmVsKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3JldmVyYkxldmVsO1xuICB9XG5cbiAgcHVibGljIHNldCBlbmFibGVkKCBlbmFibGVkOiBib29sZWFuICkge1xuICAgIHRoaXMuZW5hYmxlZFByb3BlcnR5LnZhbHVlID0gZW5hYmxlZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5lbmFibGVkUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICBwdWJsaWMgc2V0IHNvbmlmaWNhdGlvbkxldmVsKCBzb25pZmljYXRpb25MZXZlbDogU291bmRMZXZlbEVudW0gKSB7XG4gICAgdGhpcy5leHRyYVNvdW5kRW5hYmxlZFByb3BlcnR5LnZhbHVlID0gc29uaWZpY2F0aW9uTGV2ZWwgPT09IFNvdW5kTGV2ZWxFbnVtLkVYVFJBO1xuICB9XG5cbiAgLyoqXG4gICAqIEVTNSBnZXR0ZXIgZm9yIHNvbmlmaWNhdGlvbiBsZXZlbFxuICAgKi9cbiAgcHVibGljIGdldCBzb25pZmljYXRpb25MZXZlbCgpOiBTb3VuZExldmVsRW51bSB7XG4gICAgcmV0dXJuIHRoaXMuZXh0cmFTb3VuZEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA/IFNvdW5kTGV2ZWxFbnVtLkVYVFJBIDogU291bmRMZXZlbEVudW0uQkFTSUM7XG4gIH1cblxuICAvKipcbiAgICogTG9nIHRoZSB2YWx1ZSBvZiB0aGUgZ2FpbiBwYXJhbWV0ZXIgYXQgZXZlcnkgYW5pbWF0aW9uIGZyYW1lIGZvciB0aGUgc3BlY2lmaWVkIGR1cmF0aW9uLiAgVGhpcyBpcyB1c2VmdWwgZm9yXG4gICAqIGRlYnVnZ2luZywgYmVjYXVzZSB0aGVzZSBwYXJhbWV0ZXJzIGNoYW5nZSBvdmVyIHRpbWUgd2hlbiBzZXQgdXNpbmcgbWV0aG9kcyBsaWtlIFwic2V0VGFyZ2V0QXRUaW1lXCIsIGFuZCB0aGVcbiAgICogZGV0YWlscyBvZiBob3cgdGhleSBjaGFuZ2Ugc2VlbXMgdG8gYmUgZGlmZmVyZW50IG9uIHRoZSBkaWZmZXJlbnQgYnJvd3NlcnMuXG4gICAqXG4gICAqIEl0IG1heSBiZSBwb3NzaWJsZSB0byByZW1vdmUgdGhpcyBtZXRob2Qgc29tZWRheSBvbmNlIHRoZSBiZWhhdmlvciBpcyBtb3JlIGNvbnNpc3RlbnQgYWNyb3NzIGJyb3dzZXJzLiAgU2VlXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yZXNpc3RhbmNlLWluLWEtd2lyZS9pc3N1ZXMvMjA1IGZvciBzb21lIGhpc3Rvcnkgb24gdGhpcy5cbiAgICpcbiAgICogQHBhcmFtIGdhaW5Ob2RlXG4gICAqIEBwYXJhbSBkdXJhdGlvbiAtIGR1cmF0aW9uIGZvciBsb2dnaW5nLCBpbiBzZWNvbmRzXG4gICAqL1xuICBwdWJsaWMgbG9nR2FpbiggZ2Fpbk5vZGU6IEdhaW5Ob2RlLCBkdXJhdGlvbjogbnVtYmVyICk6IHZvaWQge1xuXG4gICAgZHVyYXRpb24gPSBkdXJhdGlvbiB8fCAxO1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cbiAgICAvLyBjbG9zdXJlIHRoYXQgd2lsbCBiZSBpbnZva2VkIG11bHRpcGxlIHRpbWVzIHRvIGxvZyB0aGUgY2hhbmdpbmcgdmFsdWVzXG4gICAgZnVuY3Rpb24gbG9nR2FpbigpOiB2b2lkIHtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICBjb25zdCB0aW1lSW5NaWxsaXNlY29uZHMgPSBub3cgLSBzdGFydFRpbWU7XG4gICAgICBjb25zb2xlLmxvZyggYFRpbWUgKG1zKTogJHtVdGlscy50b0ZpeGVkKCB0aW1lSW5NaWxsaXNlY29uZHMsIDIgKX0sIEdhaW4gVmFsdWU6ICR7Z2Fpbk5vZGUuZ2Fpbi52YWx1ZX1gICk7XG4gICAgICBpZiAoIG5vdyAtIHN0YXJ0VGltZSA8ICggZHVyYXRpb24gKiAxMDAwICkgKSB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIGxvZ0dhaW4gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIEdBSU5fTE9HR0lOR19FTkFCTEVEICkge1xuXG4gICAgICAvLyBraWNrIG9mZiB0aGUgbG9nZ2luZ1xuICAgICAgY29uc29sZS5sb2coICctLS0tLS0tIHN0YXJ0IG9mIGdhaW4gbG9nZ2luZyAtLS0tLScgKTtcbiAgICAgIGxvZ0dhaW4oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9nIHRoZSB2YWx1ZSBvZiB0aGUgbWFpbiBnYWluIGFzIGl0IGNoYW5nZXMsIHVzZWQgcHJpbWFyaWx5IGZvciBkZWJ1Zy5cbiAgICogQHBhcmFtIGR1cmF0aW9uIC0gaW4gc2Vjb25kc1xuICAgKi9cbiAgcHVibGljIGxvZ01haW5HYWluKCBkdXJhdGlvbjogbnVtYmVyICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5tYWluR2Fpbk5vZGUgKSB7XG4gICAgICB0aGlzLmxvZ0dhaW4oIHRoaXMubWFpbkdhaW5Ob2RlLCBkdXJhdGlvbiApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgdGhlIHZhbHVlIG9mIHRoZSByZXZlcmIgZ2FpbiBhcyBpdCBjaGFuZ2VzLCB1c2VkIHByaW1hcmlseSBmb3IgZGVidWcuXG4gICAqIEBwYXJhbSBkdXJhdGlvbiAtIGR1cmF0aW9uIGZvciBsb2dnaW5nLCBpbiBzZWNvbmRzXG4gICAqL1xuICBwdWJsaWMgbG9nUmV2ZXJiR2FpbiggZHVyYXRpb246IG51bWJlciApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMucmV2ZXJiR2Fpbk5vZGUgKSB7XG4gICAgICB0aGlzLmxvZ0dhaW4oIHRoaXMucmV2ZXJiR2Fpbk5vZGUsIGR1cmF0aW9uICk7XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IHNvdW5kTWFuYWdlciA9IG5ldyBTb3VuZE1hbmFnZXIoKTtcbnRhbWJvLnJlZ2lzdGVyKCAnc291bmRNYW5hZ2VyJywgc291bmRNYW5hZ2VyICk7XG5leHBvcnQgZGVmYXVsdCBzb3VuZE1hbmFnZXI7Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsImNyZWF0ZU9ic2VydmFibGVBcnJheSIsIk11bHRpbGluayIsIlV0aWxzIiwiYXJyYXlSZW1vdmUiLCJvcHRpb25pemUiLCJEaXNwbGF5IiwiUGhldGlvT2JqZWN0IiwiZW1wdHlBcGFydG1lbnRCZWRyb29tMDZSZXNhbXBsZWRfbXAzIiwiYXVkaW9Db250ZXh0U3RhdGVDaGFuZ2VNb25pdG9yIiwicGhldEF1ZGlvQ29udGV4dCIsInNvdW5kQ29uc3RhbnRzIiwiU291bmRMZXZlbEVudW0iLCJ0YW1ibyIsIkFVRElPX0RVQ0tJTkdfTEVWRUwiLCJERUZBVUxUX1JFVkVSQl9MRVZFTCIsIkxJTkVBUl9HQUlOX0NIQU5HRV9USU1FIiwiREVGQVVMVF9MSU5FQVJfR0FJTl9DSEFOR0VfVElNRSIsIkdBSU5fTE9HR0lOR19FTkFCTEVEIiwiU291bmRNYW5hZ2VyIiwiaW5pdGlhbGl6ZSIsInNpbUNvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHkiLCJhdWRpb0VuYWJsZWRQcm9wZXJ0eSIsInNpbVZpc2libGVQcm9wZXJ0eSIsInNpbUFjdGl2ZVByb3BlcnR5Iiwic2ltU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJpbml0aWFsaXplZCIsIm9wdGlvbnMiLCJjYXRlZ29yaWVzIiwibGVuZ3RoIiwiXyIsInVuaXEiLCJub3ciLCJjdXJyZW50VGltZSIsImR5bmFtaWNzQ29tcHJlc3NvciIsImNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvciIsInRocmVzaG9sZCIsInNldFZhbHVlQXRUaW1lIiwia25lZSIsInJhdGlvIiwiYXR0YWNrIiwicmVsZWFzZSIsImNvbm5lY3QiLCJkZXN0aW5hdGlvbiIsImR1Y2tpbmdHYWluTm9kZSIsImNyZWF0ZUdhaW4iLCJtYWluR2Fpbk5vZGUiLCJjb252b2x2ZXIiLCJjcmVhdGVDb252b2x2ZXIiLCJzZXRDb252b2x2ZXJCdWZmZXIiLCJhdWRpb0J1ZmZlciIsImJ1ZmZlciIsImF1ZGlvQnVmZmVyUHJvcGVydHkiLCJ1bmxpbmsiLCJsaW5rIiwicmV2ZXJiR2Fpbk5vZGUiLCJnYWluIiwiX3JldmVyYkxldmVsIiwiZHJ5R2Fpbk5vZGUiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsImZvckVhY2giLCJjYXRlZ29yeU5hbWUiLCJnYWluTm9kZSIsImdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXMiLCJzZXQiLCJtdWx0aWxpbmsiLCJlbmFibGVkUHJvcGVydHkiLCJlbmFibGVkIiwiYXVkaW9FbmFibGVkIiwic2ltSW5pdENvbXBsZXRlIiwic2ltVmlzaWJsZSIsInNpbUFjdGl2ZSIsInNpbVNldHRpbmdQaGV0aW9TdGF0ZSIsImZ1bGx5RW5hYmxlZCIsIl9tYWluT3V0cHV0TGV2ZWwiLCJkdWNrTWFpbk91dHB1dExldmVsUHJvcGVydHkiLCJ1cGRhdGVEdWNraW5nU3RhdGUiLCJ2YWx1ZSIsImR1Y2tpbmdQcm9wZXJ0aWVzIiwicmVkdWNlIiwidmFsdWVTb0ZhciIsImN1cnJlbnRQcm9wZXJ0eSIsImxhenlMaW5rIiwiZHVja091dHB1dCIsInRpbWVDb25zdGFudCIsImNhbmNlbFNjaGVkdWxlZFZhbHVlcyIsInNldFRhcmdldEF0VGltZSIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiYWRkZWREdWNraW5nUHJvcGVydHkiLCJjaGVja0FuZFJlbW92ZSIsInJlbW92ZWREdWNraW5nUHJvcGVydHkiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsInJlbW92ZVVzZXJJbnRlcmFjdGlvbkxpc3RlbmVycyIsIndpbmRvdyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZXN1bWVBdWRpb0NvbnRleHQiLCJ1c2VyR2VzdHVyZUVtaXR0ZXIiLCJoYXNMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwic3RhdGUiLCJwaGV0IiwibG9nIiwicmVzdW1lIiwidGhlbiIsImNhdGNoIiwiZXJyIiwiZXJyb3JNZXNzYWdlIiwiY29uc29sZSIsImVycm9yIiwiYWxlcnQiLCJhZGRFdmVudExpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJwcmV2aW91c0F1ZGlvQ29udGV4dFN0YXRlIiwiYWRkU3RhdGVDaGFuZ2VMaXN0ZW5lciIsInNvdW5kR2VuZXJhdG9yc0F3YWl0aW5nQWRkIiwic291bmRHZW5lcmF0b3JBd2FpdGluZ0FkZCIsImFkZFNvdW5kR2VuZXJhdG9yIiwic291bmRHZW5lcmF0b3IiLCJzb3VuZEdlbmVyYXRvckFkZE9wdGlvbnMiLCJoYXNTb3VuZEdlbmVyYXRvciIsInNvdW5kR2VuZXJhdG9ycyIsImluY2x1ZGVzIiwidW5kZWZpbmVkIiwicHVzaCIsImhhcyIsImdldCIsInJlbW92ZVNvdW5kR2VuZXJhdG9yIiwidG9SZW1vdmUiLCJmaWx0ZXIiLCJzIiwic2hpZnQiLCJpc0Nvbm5lY3RlZFRvIiwiZGlzY29ubmVjdCIsInNwbGljZSIsImluZGV4T2YiLCJzZXRNYWluT3V0cHV0TGV2ZWwiLCJsZXZlbCIsIndhcm4iLCJtYWluT3V0cHV0TGV2ZWwiLCJvdXRwdXRMZXZlbCIsImdldE1haW5PdXRwdXRMZXZlbCIsInNldE91dHB1dExldmVsRm9yQ2F0ZWdvcnkiLCJhZGREdWNraW5nUHJvcGVydHkiLCJkdWNraW5nUHJvcGVydHkiLCJhZGQiLCJyZW1vdmVEdWNraW5nUHJvcGVydHkiLCJyZW1vdmUiLCJnZXRPdXRwdXRMZXZlbEZvckNhdGVnb3J5Iiwic2V0UmV2ZXJiTGV2ZWwiLCJuZXdSZXZlcmJMZXZlbCIsInJldmVyYkxldmVsIiwiZ2V0UmV2ZXJiTGV2ZWwiLCJzb25pZmljYXRpb25MZXZlbCIsImV4dHJhU291bmRFbmFibGVkUHJvcGVydHkiLCJFWFRSQSIsIkJBU0lDIiwibG9nR2FpbiIsImR1cmF0aW9uIiwic3RhcnRUaW1lIiwiRGF0ZSIsInRpbWVJbk1pbGxpc2Vjb25kcyIsInRvRml4ZWQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJsb2dNYWluR2FpbiIsImxvZ1JldmVyYkdhaW4iLCJ0YW5kZW0iLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwic3VwcG9ydHNTb3VuZCIsImNyZWF0ZVRhbmRlbSIsImV4dHJhU291bmRJbml0aWFsbHlFbmFibGVkIiwiTWFwIiwic291bmRNYW5hZ2VyIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7OztDQWFDLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUMvRCxPQUFPQywyQkFBZ0QseUNBQXlDO0FBQ2hHLE9BQU9DLGVBQWUsNkJBQTZCO0FBRW5ELE9BQU9DLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9DLGlCQUFpQixvQ0FBb0M7QUFDNUQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsU0FBU0MsT0FBTyxRQUFRLDhCQUE4QjtBQUN0RCxPQUFPQyxrQkFBa0Isa0NBQWtDO0FBRTNELE9BQU9DLDBDQUEwQyxvREFBb0Q7QUFDckcsT0FBT0Msb0NBQW9DLHNDQUFzQztB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