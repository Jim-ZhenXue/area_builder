// Copyright 2022-2024, University of Colorado Boulder
/**
 * Uses the Web Speech API to produce speech from the browser. There is no speech output until the SpeechSynthesisAnnouncer has
 * been initialized. Supported voices will depend on platform. For each voice, you can customize the rate and pitch.
 *
 * Only one SpeechSynthesisAnnouncer can be used at a time. This class uses a global instance of window.speechSynthesis
 * and assumes it has full control over it. This is not a singleton because subclasses may extend this for specific
 * uses. For example, PhET has one subclass specific to its Voicing feature and another specific to
 * custom speech synthesis in number-suite-common sims.
 *
 * A note about PhET-iO instrumentation:
 * Properties are instrumented for PhET-iO to provide a record of learners that may have used this feature (and how). All
 * Properties should be phetioState:false so the values are not overwritten when a customized state is loaded.
 * Properties are not phetioReadonly so that clients can overwrite the values using the PhET-iO API and studio.
 *
 * @author Jesse Greenberg
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import EnabledComponent from '../../axon/js/EnabledComponent.js';
import Multilink from '../../axon/js/Multilink.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import stepTimer from '../../axon/js/stepTimer.js';
import validate from '../../axon/js/validate.js';
import Validation from '../../axon/js/Validation.js';
import Range from '../../dot/js/Range.js';
import optionize, { optionize3 } from '../../phet-core/js/optionize.js';
import platform from '../../phet-core/js/platform.js';
import stripEmbeddingMarks from '../../phet-core/js/stripEmbeddingMarks.js';
import IOType from '../../tandem/js/types/IOType.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import Announcer from '../../utterance-queue/js/Announcer.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import SpeechSynthesisParentPolyfill from './SpeechSynthesisParentPolyfill.js';
import utteranceQueueNamespace from './utteranceQueueNamespace.js';
// If a polyfill for SpeechSynthesis is requested, try to initialize it here before SpeechSynthesis usages. For
// now this is a PhET specific feature, available by query parameter in initialize-globals. QueryStringMachine
// cannot be used for this, see https://github.com/phetsims/scenery/issues/1366
if (window.phet && phet.chipper && phet.chipper.queryParameters && phet.chipper.queryParameters.speechSynthesisFromParent) {
    SpeechSynthesisParentPolyfill.initialize();
}
// In ms, how frequently we will use SpeechSynthesis to keep the feature active. After long intervals without
// using SpeechSynthesis Chromebooks will take a long time to produce the next speech. Presumably it is disabling
// the feature as an optimization. But this workaround gets around it and keeps speech fast.
const ENGINE_WAKE_INTERVAL = 5000;
// In ms, how long to wait before we consider the SpeechSynthesis engine as having failed to speak a requested
// utterance. ChromeOS and Safari in particular may simply fail to speak. If the amount of time between our speak()
// request and the time we receive the `start` event is too long then we know there was a failure and we can try
// to handle accordingly. Length is somewhat arbitrary, but 5 seconds felt OK and seemed to work well to recover from
// this error case.
const PENDING_UTTERANCE_DELAY = 5000;
// In Windows Chromium, long utterances with the Google voices simply stop after 15 seconds and we never get end or
// cancel events. The workaround proposed in https://bugs.chromium.org/p/chromium/issues/detail?id=679437 is
// to pause/resume the utterance at an interval.
const PAUSE_RESUME_WORKAROUND_INTERVAL = 10000;
// In ms. In Safari, the `start` and `end` listener do not fire consistently, especially after interruption
// with cancel. But speaking behind a timeout/delay improves the behavior significantly. Timeout of 125 ms was
// determined with testing to be a good value to use. Values less than 125 broke the workaround, while larger
// values feel too sluggish. See https://github.com/phetsims/john-travoltage/issues/435
// Beware that UtteranceQueueTests use this value too. Don't change without checking those tests.
const VOICING_UTTERANCE_INTERVAL = 125;
// A list of "novelty" voices made available by the operating system...for some reason. There is nothing special about
// these novelty SpeechSynthesisVoices to exclude them. So having a list to exclude by name and maintining over time
// is the best we can do.
const NOVELTY_VOICES = [
    'Albert',
    'Bad News',
    'Bahh',
    'Bells',
    'Boing',
    'Bubbles',
    'Cellos',
    'Good News',
    'Jester',
    'Organ',
    'Superstar',
    'Trinoids',
    'Whisper',
    'Wobble',
    'Zarvox',
    // not technically "novelty" but still sound too bad and would be distracting to users, see
    // https://github.com/phetsims/utterance-queue/issues/93#issuecomment-1303901484
    'Flo',
    'Grandma',
    'Grandpa',
    'Junior'
];
// Only one instance of SpeechSynthesisAnnouncer can be initialized, see top level type documentation.
let initializeCount = 0;
// The SpeechSynthesisVoice.lang property has a schema that is different from our locale (see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/lang)
// As a result, manually map a couple important values back to our own supported locales, see https://github.com/phetsims/number-play/issues/230.
// You can test that this map is working with something like `'en-GB': 'es'`
const voiceLangToSupportedLocale = {
    cmn: 'zh_CN',
    yue: 'zh_HK',
    'yue-HK': 'zh_HK',
    yue_HK: 'zh_HK',
    'fil-PH': 'tl',
    fil_PH: 'tl'
};
const UTTERANCE_OPTION_DEFAULTS = {
    // If true and this Utterance is currently being spoken by the speech synth, announcing it
    // to the queue again will immediately cancel the synth and new content will be
    // spoken. Otherwise, new content for this utterance will be spoken whenever the old
    // content has finished speaking. Used when adding the Utterance to be spoken.
    cancelSelf: true,
    // Only applies to two Utterances with the same priority. If true and another Utterance is currently
    // being spoken by the speech synth (or queued by SpeechSynthesisAnnouncer), announcing this Utterance will immediately cancel
    // the other content being spoken by the synth. Otherwise, content for the new utterance will be spoken as soon as
    // the browser finishes speaking the utterances in front of it in line. Used when adding the Utterance to be spoken.
    cancelOther: true,
    // Provide a specific SpeechSynthesisVoice for only this Utterance, or if null use the Announcer's general
    // voiceProperty value. Used when speaking the Utterance.
    voice: null
};
let SpeechSynthesisAnnouncer = class SpeechSynthesisAnnouncer extends Announcer {
    get initialized() {
        return this.isInitializedProperty.value;
    }
    /**
   * Indicate that the SpeechSynthesisAnnouncer is ready for use, and attempt to populate voices (if they are ready yet). Adds
   * listeners that control speech.
   *
   * @param userGestureEmitter - Emits when user input happens, which is required before the browser is
   *                                       allowed to use SpeechSynthesis for the first time.
   * @param [providedOptions]
   */ initialize(userGestureEmitter, providedOptions) {
        assert && assert(!this.initialized, 'can only be initialized once');
        assert && assert(SpeechSynthesisAnnouncer.isSpeechSynthesisSupported(), 'trying to initialize speech, but speech is not supported on this platform.');
        // See top level type documentation.
        assert && assert(initializeCount === 0, 'Only one instance of SpeechSynthesisAnnouncer can be initialized at a time.');
        initializeCount++;
        const options = optionize()({
            // {BooleanProperty|DerivedProperty.<boolean>} - Controls whether speech is allowed with speech synthesis.
            // Combined into another DerivedProperty with this.enabledProperty so you don't have to use that as one
            // of the Properties that derive speechAllowedProperty, if you are passing in a DerivedProperty.
            speechAllowedProperty: new BooleanProperty(true)
        }, providedOptions);
        this.synth = window.speechSynthesis;
        // whether the optional Property indicating speech is allowed and the SpeechSynthesisAnnouncer is enabled
        this.canSpeakProperty = DerivedProperty.and([
            options.speechAllowedProperty,
            this.enabledProperty
        ]);
        this.canSpeakProperty.link(this.boundHandleCanSpeakChange);
        // Set the speechAllowedAndFullyEnabledProperty when dependency Properties update
        Multilink.multilink([
            options.speechAllowedProperty,
            this.voicingFullyEnabledProperty
        ], (speechAllowed, voicingFullyEnabled)=>{
            this._speechAllowedAndFullyEnabledProperty.value = speechAllowed && voicingFullyEnabled;
        });
        // browsers tend to generate the list of voices lazily, so the list of voices may be empty until speech is first
        // requested. Some browsers don't have an addEventListener function on speechSynthesis so check to see if it exists
        // before trying to call it.
        const synth = this.getSynth();
        synth.addEventListener && synth.addEventListener('voiceschanged', ()=>{
            this.populateVoices();
        });
        // try to populate voices immediately in case the browser populates them eagerly and we never get an
        // onvoiceschanged event
        this.populateVoices();
        // To get Voicing to happen quickly on Chromebooks we set the counter to a value that will trigger the "engine
        // wake" interval on the next animation frame the first time we get a user gesture. See ENGINE_WAKE_INTERVAL
        // for more information about this workaround.
        const startEngineListener = ()=>{
            this.timeSinceWakingEngine = ENGINE_WAKE_INTERVAL;
            // Display is on the namespace but cannot be imported due to circular dependencies
            userGestureEmitter.removeListener(startEngineListener);
        };
        userGestureEmitter.addListener(startEngineListener);
        // listener for timing variables
        stepTimer.addListener(this.step.bind(this));
        this.isInitializedProperty.value = true;
    }
    /**
   * @param dt - in seconds from stepTimer
   */ step(dt) {
        // convert to ms
        dt *= 1000;
        // if initialized, this means we have a synth.
        const synth = this.getSynth();
        if (this.initialized && synth) {
            // If we haven't spoken yet, keep checking the synth to determine when there has been a successful usage
            // of SpeechSynthesis. Note this will be true if ANY SpeechSynthesisAnnouncer has successful speech (not just
            // this instance).
            if (!this.hasSpoken) {
                this.hasSpoken = synth.speaking;
            }
            // Increment the amount of time since the synth has stopped speaking the previous utterance, but don't
            // start counting up until the synth has finished speaking its current utterance.
            this.timeSinceUtteranceEnd = synth.speaking ? 0 : this.timeSinceUtteranceEnd + dt;
            this.timeSincePendingUtterance = this.speakingSpeechSynthesisUtteranceWrapper && !this.speakingSpeechSynthesisUtteranceWrapper.started ? this.timeSincePendingUtterance + dt : 0;
            if (this.timeSincePendingUtterance > PENDING_UTTERANCE_DELAY) {
                assert && assert(this.speakingSpeechSynthesisUtteranceWrapper, 'should have this.speakingSpeechSynthesisUtteranceWrapper');
                // It has been too long since we requested speech without speaking, the synth is likely failing on this platform
                this.handleSpeechSynthesisEnd(this.speakingSpeechSynthesisUtteranceWrapper.announceText, this.speakingSpeechSynthesisUtteranceWrapper);
                this.speakingSpeechSynthesisUtteranceWrapper = null;
                // cancel the synth because we really don't want it to keep trying to speak this utterance after handling
                // the assumed failure
                this.cancelSynth();
            }
            // Wait until VOICING_UTTERANCE_INTERVAL to speak again for more consistent behavior on certain platforms,
            // see documentation for the constant for more information. By setting readyToAnnounce in the step function
            // we also don't have to rely at all on the SpeechSynthesisUtterance 'end' event, which is inconsistent on
            // certain platforms. Also, not ready to announce if we are waiting for the synth to start speaking something.
            if (this.timeSinceUtteranceEnd > VOICING_UTTERANCE_INTERVAL && !this.speakingSpeechSynthesisUtteranceWrapper) {
                this.readyToAnnounce = true;
            }
            // SpeechSynthesisUtterances longer than 15 seconds will get interrupted on Chrome and fail to stop with
            // end or error events. https://bugs.chromium.org/p/chromium/issues/detail?id=679437 suggests a workaround
            // that uses pause/resume like this. The workaround is needed for desktop Chrome when using `localService: false`
            // voices. The bug does not appear on any Microsoft Edge voices. This workaround breaks SpeechSynthesis on
            // android. In this check we only use this workaround where needed.
            if (platform.chromium && !platform.android && this.voiceProperty.value && !this.voiceProperty.value.localService) {
                // Not necessary to apply the workaround unless we are currently speaking.
                this.timeSincePauseResume = synth.speaking ? this.timeSincePauseResume + dt : 0;
                if (this.timeSincePauseResume > PAUSE_RESUME_WORKAROUND_INTERVAL) {
                    this.timeSincePauseResume = 0;
                    synth.pause();
                    synth.resume();
                }
            }
            // A workaround to keep SpeechSynthesis responsive on Chromebooks. If there is a long enough interval between
            // speech requests, the next time SpeechSynthesis is used it is very slow on Chromebook. We think the browser
            // turns "off" the synthesis engine for performance. If it has been long enough since using speech synthesis and
            // there is nothing to speak in the queue, requesting speech with empty content keeps the engine active.
            // See https://github.com/phetsims/gravity-force-lab-basics/issues/303.
            if (platform.chromeOS) {
                this.timeSinceWakingEngine += dt;
                if (!synth.speaking && this.timeSinceWakingEngine > ENGINE_WAKE_INTERVAL) {
                    this.timeSinceWakingEngine = 0;
                    // This space is actually quite important. An empty string began breaking chromebooks in https://github.com/phetsims/friction/issues/328
                    synth.speak(new SpeechSynthesisUtterance(' '));
                }
            }
        }
    }
    /**
   * When we can no longer speak, cancel all speech to silence everything.
   */ handleCanSpeakChange(canSpeak) {
        if (!canSpeak) {
            this.cancel();
        }
    }
    /**
   * Update the list of `voices` available to the synth, and notify that the list has changed.
   */ populateVoices() {
        const synth = this.getSynth();
        if (synth) {
            // the browser sometimes provides duplicate voices, prune those out of the list
            this.voicesProperty.value = _.uniqBy(synth.getVoices(), (voice)=>voice.name);
        }
    }
    /**
   * Returns an array of SpeechSynthesisVoices that are sorted such that the best sounding voices come first.
   * As of 9/27/21, we find that the "Google" voices sound best while Apple's "Fred" sounds the worst so the list
   * will be ordered to reflect that. This way "Google" voices will be selected by default when available and "Fred"
   * will almost never be the default Voice since it is last in the list. See
   * https://github.com/phetsims/scenery/issues/1282/ for discussion and this decision.
   */ getPrioritizedVoices() {
        assert && assert(this.initialized, 'No voices available until the SpeechSynthesisAnnouncer is initialized');
        assert && assert(this.voicesProperty.value.length > 0, 'No voices available to provided a prioritized list.');
        const allVoices = this.voicesProperty.value.slice();
        // exclude "novelty" voices that are included by the operating system but marked as English.
        // const voicesWithoutNovelty = _.filter( allVoices, voice => !NOVELTY_VOICES.includes( voice.name ) );
        const voicesWithoutNovelty = _.filter(allVoices, (voice)=>{
            // Remove the voice if the SpeechSynthesisVoice.name includes a substring of the entry in our list (the browser
            // might include more information in the name than we maintain, like locale info or something else).
            return !_.some(NOVELTY_VOICES, (noveltyVoice)=>voice.name.includes(noveltyVoice));
        });
        const getIndex = (voice)=>voice.name.includes('Google') ? -1 : voice.name.includes('Fred') ? voicesWithoutNovelty.length : voicesWithoutNovelty.indexOf(voice); // Otherwise preserve ordering
        return voicesWithoutNovelty.sort((a, b)=>getIndex(a) - getIndex(b));
    }
    /**
   * Voicing as a feature is not translatable. This function gets the "prioritized" voices (as decided by PhET) and
   * prunes out the non-english ones. This does not use this.getPrioritizedVoicesForLocale because the required Locale
   * type doesn't include 'en-US' or 'en_US' as valid values, just 'en'.
   */ getEnglishPrioritizedVoices() {
        return _.filter(this.getPrioritizedVoices(), (voice)=>{
            // most browsers use dashes to separate the local, Android uses underscore.
            return voice.lang === 'en-US' || voice.lang === 'en_US';
        });
    }
    /**
   * Voicing as a feature is not translatable, but some SpeechSynthesisAnnouncer usages outside of voicing are. This
   * function gets the "prioritized" voices (as decided by PhET) and
   * prunes out everything that is not the "provided" locale. The algorithm for mapping locale is as follows:
   *
   * locale: 'en' - Provided locale parameter
   * voice: 'en_GB' - YES matches!
   * voice: 'en' - YES
   *
   * locale: 'en_GB'
   * voice: 'en' - NO
   * voice: 'en_GB' - YES
   * voice: 'en-GB' - YES
   * voice: 'en-US' - NO
   *
   * locale: 'zh_CN'
   * voice: 'zh' - NO
   * voice: 'zh_CN' - YES
   *
   * locale: 'zh'
   * voice: 'zh' - YES
   * voice: 'zh_CN' - YES
   * voice: 'zh-TW' - YES
   *
   * locale: 'es_ES'
   * voice: 'es_MX' - NO
   * voice: 'es' - NO
   * voice: 'es-ES' - YES
   */ getPrioritizedVoicesForLocale(locale) {
        // Four letter locales of type Locale include an underscore between the language and the region. Most browser voice
        // names use a dash instead of an underscore, so we need to create a version of the locale with dashes.
        const underscoreLocale = locale;
        const dashLocale = locale.replace('_', '-');
        return _.filter(this.getPrioritizedVoices(), (voice)=>{
            // Handle unsupported locale mapping here, see voiceLangToSupportedLocale and https://github.com/phetsims/number-play/issues/230.
            const voiceLang = voiceLangToSupportedLocale.hasOwnProperty(voice.lang) ? voiceLangToSupportedLocale[voice.lang] : voice.lang;
            let matchesShortLocale = false;
            if (voiceLang.includes('_') || voiceLang.includes('-')) {
                // Mapping zh_CN or zh-CN -> zh
                matchesShortLocale = underscoreLocale === voiceLang.slice(0, 2);
            }
            // while most browsers use dashes to separate the local, Android uses underscore, so compare both types. Loosely
            // compare with includes() so all country-specific voices are available for two-letter Locale codes.
            return matchesShortLocale || underscoreLocale === voiceLang || dashLocale === voiceLang;
        });
    }
    /**
   * Implements announce so the SpeechSynthesisAnnouncer can be a source of output for utteranceQueue.
   */ announce(announceText, utterance) {
        if (this.initialized && this.canSpeakProperty && this.canSpeakProperty.value) {
            this.requestSpeech(announceText, utterance);
        } else {
            // The announcer is not going to announce this utterance, signify that we are done with it.
            this.handleAnnouncementFailure(utterance, announceText);
        }
    }
    /**
   * The announcement of this utterance has failed in some way, signify to clients of this announcer that the utterance
   * will never complete. For example start/end events on the SpeechSynthesisUtterance will never fire.
   */ handleAnnouncementFailure(utterance, announceText) {
        this.debug && console.log('announcement failure', announceText);
        this.announcementCompleteEmitter.emit(utterance, announceText);
    }
    /**
   * Use speech synthesis to speak an utterance. No-op unless SpeechSynthesisAnnouncer is initialized and other output
   * controlling Properties are true (see speechAllowedProperty in initialize()). This explicitly ignores
   * this.enabledProperty, allowing speech even when SpeechSynthesisAnnouncer is disabled. This is useful in rare cases, for
   * example when the SpeechSynthesisAnnouncer recently becomes disabled by the user and we need to announce confirmation of
   * that decision ("Voicing off" or "All audio off").
   *
   * NOTE: This will interrupt any currently speaking utterance.
   */ speakIgnoringEnabled(utterance) {
        if (this.initialized) {
            this.cancel();
            this.requestSpeech(utterance.getAlertText(this.respectResponseCollectorProperties), utterance);
        }
    }
    /**
   * Request speech with SpeechSynthesis.
   */ requestSpeech(announceText, utterance) {
        assert && assert(SpeechSynthesisAnnouncer.isSpeechSynthesisSupported(), 'trying to speak with speechSynthesis, but it is not supported on this platform');
        this.debug && console.log('requestSpeech', announceText);
        // If the utterance text is null, then opt out early
        if (!announceText) {
            this.handleAnnouncementFailure(utterance, announceText);
            return;
        }
        // Utterance.announcerOptions must be more general to allow this type to apply to any implementation of Announcer, thus "Object" as the provided options.
        const utteranceOptions = optionize3()({}, UTTERANCE_OPTION_DEFAULTS, utterance.announcerOptions);
        // embedding marks (for i18n) impact the output, strip before speaking, type cast number to string if applicable (for number)
        const stringToSpeak = removeBrTags(stripEmbeddingMarks(announceText + ''));
        // Disallow any unfilled template variables to be set in the PDOM.
        validate(stringToSpeak, Validation.STRING_WITHOUT_TEMPLATE_VARS_VALIDATOR);
        const speechSynthUtterance = new SpeechSynthesisUtterance(stringToSpeak);
        speechSynthUtterance.voice = utteranceOptions.voice || this.voiceProperty.value;
        speechSynthUtterance.pitch = this.voicePitchProperty.value;
        speechSynthUtterance.rate = this.voiceRateProperty.value;
        speechSynthUtterance.volume = this.voiceVolumeProperty.value;
        const startListener = ()=>{
            this.startSpeakingEmitter.emit(stringToSpeak, utterance);
            assert && assert(this.speakingSpeechSynthesisUtteranceWrapper, 'should have been set in requestSpeech');
            this.speakingSpeechSynthesisUtteranceWrapper.started = true;
            speechSynthUtterance.removeEventListener('start', startListener);
        };
        const endListener = ()=>{
            this.handleSpeechSynthesisEnd(stringToSpeak, speechSynthesisUtteranceWrapper);
        };
        // Keep a reference to the SpeechSynthesisUtterance and the start/endListeners so that we can remove them later.
        // Notice this is used in the function scopes above.
        // IMPORTANT NOTE: Also, this acts as a workaround for a Safari bug where the `end` event does not fire
        // consistently. If the SpeechSynthesisUtterance is not in memory when it is time for the `end` event, Safari
        // will fail to emit that event. See
        // https://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working and
        // https://github.com/phetsims/john-travoltage/issues/435 and https://github.com/phetsims/utterance-queue/issues/52
        const speechSynthesisUtteranceWrapper = new SpeechSynthesisUtteranceWrapper(utterance, announceText, speechSynthUtterance, false, endListener, startListener);
        assert && assert(this.speakingSpeechSynthesisUtteranceWrapper === null, 'Wrapper should be null, we should have received an end event to clear it before the next one.');
        this.speakingSpeechSynthesisUtteranceWrapper = speechSynthesisUtteranceWrapper;
        speechSynthUtterance.addEventListener('start', startListener);
        speechSynthUtterance.addEventListener('end', endListener);
        // In Safari the `end` listener does not fire consistently, (especially after cancel)
        // but the error event does. In this case signify that speaking has ended.
        speechSynthUtterance.addEventListener('error', endListener);
        // Signify to the utterance-queue that we cannot speak yet until this utterance has finished
        this.readyToAnnounce = false;
        // This is generally set in the step function when the synth is not speaking, but there is a Firefox issue where
        // the SpeechSynthesis.speaking is set to `true` asynchronously. So we eagerly reset this timing variable to
        // signify that we need to wait VOICING_UTTERANCE_INTERVAL until we are allowed to speak again.
        // See https://github.com/phetsims/utterance-queue/issues/40
        this.timeSinceUtteranceEnd = 0;
        // Interrupt if the Utterance can no longer be announced.
        utterance.canAnnounceProperty.link(this.boundHandleCanAnnounceChange);
        utterance.voicingCanAnnounceProperty.link(this.boundHandleCanAnnounceChange);
        this.getSynth().speak(speechSynthUtterance);
    }
    /**
   * When a canAnnounceProperty changes to false for an Utterance, that utterance should be cancelled.
   */ handleCanAnnounceChange() {
        if (this.speakingSpeechSynthesisUtteranceWrapper) {
            this.cancelUtteranceIfCanAnnounceFalse(this.speakingSpeechSynthesisUtteranceWrapper.utterance);
        }
    }
    /**
   * When a canAnnounceProperty changes, cancel the Utterance if the value becomes false.
   */ cancelUtteranceIfCanAnnounceFalse(utterance) {
        if (!utterance.canAnnounceProperty.value || !utterance.voicingCanAnnounceProperty.value) {
            this.cancelUtterance(utterance);
        }
    }
    /**
   * All the work necessary when we are finished with an utterance, intended for end or cancel.
   * Emits events signifying that we are done with speech and does some disposal.
   */ handleSpeechSynthesisEnd(stringToSpeak, speechSynthesisUtteranceWrapper) {
        this.endSpeakingEmitter.emit(stringToSpeak, speechSynthesisUtteranceWrapper.utterance);
        this.announcementCompleteEmitter.emit(speechSynthesisUtteranceWrapper.utterance, speechSynthesisUtteranceWrapper.speechSynthesisUtterance.text);
        speechSynthesisUtteranceWrapper.speechSynthesisUtterance.removeEventListener('error', speechSynthesisUtteranceWrapper.endListener);
        speechSynthesisUtteranceWrapper.speechSynthesisUtterance.removeEventListener('end', speechSynthesisUtteranceWrapper.endListener);
        speechSynthesisUtteranceWrapper.speechSynthesisUtterance.removeEventListener('start', speechSynthesisUtteranceWrapper.startListener);
        // The endSpeakingEmitter may end up calling handleSpeechSynthesisEnd in its listeners, we need to be graceful
        const utteranceCanAnnounceProperty = speechSynthesisUtteranceWrapper.utterance.canAnnounceProperty;
        if (utteranceCanAnnounceProperty.hasListener(this.boundHandleCanAnnounceChange)) {
            utteranceCanAnnounceProperty.unlink(this.boundHandleCanAnnounceChange);
        }
        const utteranceVoicingCanAnnounceProperty = speechSynthesisUtteranceWrapper.utterance.voicingCanAnnounceProperty;
        if (utteranceVoicingCanAnnounceProperty.hasListener(this.boundHandleCanAnnounceChange)) {
            utteranceVoicingCanAnnounceProperty.unlink(this.boundHandleCanAnnounceChange);
        }
        this.speakingSpeechSynthesisUtteranceWrapper = null;
    }
    /**
   * Returns a references to the SpeechSynthesis of the SpeechSynthesisAnnouncer that is used to request speech with the Web
   * Speech API. Every references has a check to ensure that the synth is available.
   */ getSynth() {
        assert && assert(SpeechSynthesisAnnouncer.isSpeechSynthesisSupported(), 'Trying to use SpeechSynthesis, but it is not supported on this platform.');
        return this.synth;
    }
    /**
   * Stops any Utterance that is currently being announced or is (about to be announced).
   * (utterance-queue internal)
   */ cancel() {
        if (this.initialized) {
            this.speakingSpeechSynthesisUtteranceWrapper && this.cancelUtterance(this.speakingSpeechSynthesisUtteranceWrapper.utterance);
        }
    }
    /**
   * Cancel the provided Utterance, if it is currently being spoken by this Announcer. Does not cancel
   * any other utterances that may be in the UtteranceQueue.
   * (utterance-queue internal)
   */ cancelUtterance(utterance) {
        const wrapper = this.speakingSpeechSynthesisUtteranceWrapper;
        if (wrapper && utterance === wrapper.utterance) {
            this.handleSpeechSynthesisEnd(wrapper.announceText, wrapper);
            // silence all speech - after handleSpeechSynthesisEnd so we don't do that work twice in case `cancelSynth`
            // also triggers end events immediately (but that doesn't happen on all browsers)
            this.cancelSynth();
        }
    }
    /**
   * Given one utterance, should it cancel another provided utterance?
   */ shouldUtteranceCancelOther(utterance, utteranceToCancel) {
        // Utterance.announcerOptions must be more general to allow this type to apply to any implementation of Announcer, thus "Object" as the provided options.
        const utteranceOptions = optionize3()({}, UTTERANCE_OPTION_DEFAULTS, utterance.announcerOptions);
        let shouldCancel;
        if (utteranceToCancel.priorityProperty.value !== utterance.priorityProperty.value) {
            shouldCancel = utteranceToCancel.priorityProperty.value < utterance.priorityProperty.value;
        } else {
            shouldCancel = utteranceOptions.cancelOther;
            if (utteranceToCancel && utteranceToCancel === utterance) {
                shouldCancel = utteranceOptions.cancelSelf;
            }
        }
        return shouldCancel;
    }
    /**
   * When the priority for a new utterance changes or if a new utterance is added to the queue, determine whether
   * we should cancel the synth immediately.
   */ onUtterancePriorityChange(nextAvailableUtterance) {
        // test against what is currently being spoken by the synth
        const wrapper = this.speakingSpeechSynthesisUtteranceWrapper;
        if (wrapper && this.shouldUtteranceCancelOther(nextAvailableUtterance, wrapper.utterance)) {
            this.cancelUtterance(wrapper.utterance);
        }
    }
    /**
   * Cancel the synth. This will silence speech. This will silence any speech and cancel the
   */ cancelSynth() {
        assert && assert(this.initialized, 'must be initialized to use synth');
        const synth = this.getSynth();
        synth && synth.cancel();
    }
    /**
   * Returns true if SpeechSynthesis is available on the window. This check is sufficient for all of
   * SpeechSynthesisAnnouncer. On platforms where speechSynthesis is available, all features of it are available, except for the
   * onvoiceschanged event in a couple of platforms. However, the listener can still be set
   * without issue on those platforms so we don't need to check for its existence. On those platforms, voices
   * are provided right on load.
   */ static isSpeechSynthesisSupported() {
        return !!window.speechSynthesis && !!window.SpeechSynthesisUtterance;
    }
    constructor(providedOptions){
        var _options_tandem, _options_tandem1, _options_tandem2, _options_tandem3;
        const options = optionize()({
            // {boolean} - SpeechSynthesisAnnouncer generally doesn't care about ResponseCollectorProperties,
            // that is more specific to the Voicing feature.
            respectResponseCollectorProperties: false,
            debug: false
        }, providedOptions);
        super(options);
        this.debug = options.debug;
        this.voiceProperty = new Property(null, {
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('voiceProperty'),
            phetioValueType: NullableIO(SpeechSynthesisVoiceIO),
            phetioState: false,
            phetioReadOnly: true,
            phetioDocumentation: 'the voice that is currently voicing responses'
        });
        this.voiceRateProperty = new NumberProperty(1.0, {
            range: new Range(0.75, 2),
            tandem: (_options_tandem1 = options.tandem) == null ? void 0 : _options_tandem1.createTandem('voiceRateProperty'),
            phetioState: false,
            phetioDocumentation: 'changes the rate of the voicing-feature voice'
        });
        this.voicePitchProperty = new NumberProperty(1.0, {
            range: new Range(0.5, 2),
            tandem: (_options_tandem2 = options.tandem) == null ? void 0 : _options_tandem2.createTandem('voicePitchProperty'),
            phetioState: false,
            phetioDocumentation: 'changes the pitch of the voicing-feature voice'
        });
        this.voiceVolumeProperty = new NumberProperty(1.0, {
            range: new Range(0, 1)
        });
        // Indicates whether speech using SpeechSynthesis has been requested at least once.
        // The first time speech is requested, it must be done synchronously from user input with absolutely no delay.
        // requestSpeech() generally uses a timeout to workaround browser bugs, but those cannot be used until after the
        // first request for speech.
        this.hasSpoken = false;
        this.timeSinceWakingEngine = 0;
        this.timeSincePauseResume = 0;
        this.timeSincePendingUtterance = 0;
        this.timeSinceUtteranceEnd = VOICING_UTTERANCE_INTERVAL;
        this.startSpeakingEmitter = new Emitter({
            parameters: [
                {
                    valueType: 'string'
                },
                {
                    valueType: Utterance
                }
            ]
        });
        this.endSpeakingEmitter = new Emitter({
            parameters: [
                {
                    valueType: 'string'
                },
                {
                    valueType: Utterance
                }
            ]
        });
        this.enabledComponentImplementation = new EnabledComponent({
            // initial value for the enabledProperty, false because speech should not happen until requested by user
            enabled: false,
            tandem: options.tandem,
            enabledPropertyOptions: {
                phetioDocumentation: 'toggles this controller of SpeechSynthesis on and off',
                phetioState: false,
                phetioFeatured: false
            }
        });
        assert && assert(this.enabledComponentImplementation.enabledProperty.isSettable(), 'enabledProperty must be settable');
        this.enabledProperty = this.enabledComponentImplementation.enabledProperty;
        this.mainWindowVoicingEnabledProperty = new BooleanProperty(true, {
            tandem: (_options_tandem3 = options.tandem) == null ? void 0 : _options_tandem3.createTandem('mainWindowVoicingEnabledProperty'),
            phetioState: false,
            phetioDocumentation: 'toggles the voicing feature on and off for the simulation screen (not the voicing preferences and toolbar controls)'
        });
        this.voicingFullyEnabledProperty = DerivedProperty.and([
            this.enabledProperty,
            this.mainWindowVoicingEnabledProperty
        ]);
        this._speechAllowedAndFullyEnabledProperty = new BooleanProperty(false);
        this.speechAllowedAndFullyEnabledProperty = this._speechAllowedAndFullyEnabledProperty;
        this.synth = null;
        this.voicesProperty = new Property([]);
        this.speakingSpeechSynthesisUtteranceWrapper = null;
        this.isInitializedProperty = new BooleanProperty(false);
        this.canSpeakProperty = null;
        this.boundHandleCanSpeakChange = this.handleCanSpeakChange.bind(this);
        this.boundHandleCanAnnounceChange = this.handleCanAnnounceChange.bind(this);
        if (this.debug) {
            this.announcementCompleteEmitter.addListener((utterance, string)=>{
                console.log('announcement complete', string);
            });
            this.startSpeakingEmitter.addListener((string)=>{
                this.debug && console.log('startSpeakingListener', string);
            });
            this.endSpeakingEmitter.addListener((string)=>{
                this.debug && console.log('endSpeakingListener', string);
            });
        }
    }
};
/**
 * An inner class that combines some objects that are necessary to keep track of to dispose
 * SpeechSynthesisUtterances when it is time. It is also used for the "Safari Workaround" to keep a reference
 * of the SpeechSynthesisUtterance in memory long enough for the 'end' event to be emitted.
 */ let SpeechSynthesisUtteranceWrapper = class SpeechSynthesisUtteranceWrapper {
    constructor(utterance, announceText, speechSynthesisUtterance, started, endListener, startListener){
        this.utterance = utterance;
        this.announceText = announceText;
        this.speechSynthesisUtterance = speechSynthesisUtterance;
        this.started = started;
        this.endListener = endListener;
        this.startListener = startListener;
    }
};
/**
 * Remove <br> or <br/> tags from a string
 * @param string - plain text or html string
 */ function removeBrTags(string) {
    return string.split('<br/>').join(' ').split('<br>').join(' ');
}
const SpeechSynthesisVoiceIO = new IOType('SpeechSynthesisVoiceIO', {
    isValidValue: (v)=>true,
    toStateObject: (speechSynthesisVoice)=>speechSynthesisVoice.name
});
utteranceQueueNamespace.register('SpeechSynthesisAnnouncer', SpeechSynthesisAnnouncer);
export default SpeechSynthesisAnnouncer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9TcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVXNlcyB0aGUgV2ViIFNwZWVjaCBBUEkgdG8gcHJvZHVjZSBzcGVlY2ggZnJvbSB0aGUgYnJvd3Nlci4gVGhlcmUgaXMgbm8gc3BlZWNoIG91dHB1dCB1bnRpbCB0aGUgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIGhhc1xuICogYmVlbiBpbml0aWFsaXplZC4gU3VwcG9ydGVkIHZvaWNlcyB3aWxsIGRlcGVuZCBvbiBwbGF0Zm9ybS4gRm9yIGVhY2ggdm9pY2UsIHlvdSBjYW4gY3VzdG9taXplIHRoZSByYXRlIGFuZCBwaXRjaC5cbiAqXG4gKiBPbmx5IG9uZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgY2FuIGJlIHVzZWQgYXQgYSB0aW1lLiBUaGlzIGNsYXNzIHVzZXMgYSBnbG9iYWwgaW5zdGFuY2Ugb2Ygd2luZG93LnNwZWVjaFN5bnRoZXNpc1xuICogYW5kIGFzc3VtZXMgaXQgaGFzIGZ1bGwgY29udHJvbCBvdmVyIGl0LiBUaGlzIGlzIG5vdCBhIHNpbmdsZXRvbiBiZWNhdXNlIHN1YmNsYXNzZXMgbWF5IGV4dGVuZCB0aGlzIGZvciBzcGVjaWZpY1xuICogdXNlcy4gRm9yIGV4YW1wbGUsIFBoRVQgaGFzIG9uZSBzdWJjbGFzcyBzcGVjaWZpYyB0byBpdHMgVm9pY2luZyBmZWF0dXJlIGFuZCBhbm90aGVyIHNwZWNpZmljIHRvXG4gKiBjdXN0b20gc3BlZWNoIHN5bnRoZXNpcyBpbiBudW1iZXItc3VpdGUtY29tbW9uIHNpbXMuXG4gKlxuICogQSBub3RlIGFib3V0IFBoRVQtaU8gaW5zdHJ1bWVudGF0aW9uOlxuICogUHJvcGVydGllcyBhcmUgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPIHRvIHByb3ZpZGUgYSByZWNvcmQgb2YgbGVhcm5lcnMgdGhhdCBtYXkgaGF2ZSB1c2VkIHRoaXMgZmVhdHVyZSAoYW5kIGhvdykuIEFsbFxuICogUHJvcGVydGllcyBzaG91bGQgYmUgcGhldGlvU3RhdGU6ZmFsc2Ugc28gdGhlIHZhbHVlcyBhcmUgbm90IG92ZXJ3cml0dGVuIHdoZW4gYSBjdXN0b21pemVkIHN0YXRlIGlzIGxvYWRlZC5cbiAqIFByb3BlcnRpZXMgYXJlIG5vdCBwaGV0aW9SZWFkb25seSBzbyB0aGF0IGNsaWVudHMgY2FuIG92ZXJ3cml0ZSB0aGUgdmFsdWVzIHVzaW5nIHRoZSBQaEVULWlPIEFQSSBhbmQgc3R1ZGlvLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgRW5hYmxlZENvbXBvbmVudCBmcm9tICcuLi8uLi9heG9uL2pzL0VuYWJsZWRDb21wb25lbnQuanMnO1xuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcbmltcG9ydCBURW1pdHRlciwgeyBUUmVhZE9ubHlFbWl0dGVyIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCB2YWxpZGF0ZSBmcm9tICcuLi8uLi9heG9uL2pzL3ZhbGlkYXRlLmpzJztcbmltcG9ydCBWYWxpZGF0aW9uIGZyb20gJy4uLy4uL2F4b24vanMvVmFsaWRhdGlvbi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCB7IExvY2FsZSB9IGZyb20gJy4uLy4uL2pvaXN0L2pzL2kxOG4vbG9jYWxlUHJvcGVydHkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBvcHRpb25pemUzLCBPcHRpb25pemVEZWZhdWx0cyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgc3RyaXBFbWJlZGRpbmdNYXJrcyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvc3RyaXBFbWJlZGRpbmdNYXJrcy5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xuaW1wb3J0IEFubm91bmNlciwgeyBBbm5vdW5jZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL0Fubm91bmNlci5qcyc7XG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xuaW1wb3J0IHsgUmVzb2x2ZWRSZXNwb25zZSB9IGZyb20gJy4vUmVzcG9uc2VQYWNrZXQuanMnO1xuaW1wb3J0IFNwZWVjaFN5bnRoZXNpc1BhcmVudFBvbHlmaWxsIGZyb20gJy4vU3BlZWNoU3ludGhlc2lzUGFyZW50UG9seWZpbGwuanMnO1xuaW1wb3J0IHV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlIGZyb20gJy4vdXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UuanMnO1xuXG4vLyBJZiBhIHBvbHlmaWxsIGZvciBTcGVlY2hTeW50aGVzaXMgaXMgcmVxdWVzdGVkLCB0cnkgdG8gaW5pdGlhbGl6ZSBpdCBoZXJlIGJlZm9yZSBTcGVlY2hTeW50aGVzaXMgdXNhZ2VzLiBGb3Jcbi8vIG5vdyB0aGlzIGlzIGEgUGhFVCBzcGVjaWZpYyBmZWF0dXJlLCBhdmFpbGFibGUgYnkgcXVlcnkgcGFyYW1ldGVyIGluIGluaXRpYWxpemUtZ2xvYmFscy4gUXVlcnlTdHJpbmdNYWNoaW5lXG4vLyBjYW5ub3QgYmUgdXNlZCBmb3IgdGhpcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMzY2XG5pZiAoIHdpbmRvdy5waGV0ICYmIHBoZXQuY2hpcHBlciAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuc3BlZWNoU3ludGhlc2lzRnJvbVBhcmVudCApIHtcbiAgU3BlZWNoU3ludGhlc2lzUGFyZW50UG9seWZpbGwuaW5pdGlhbGl6ZSgpO1xufVxuXG4vLyBJbiBtcywgaG93IGZyZXF1ZW50bHkgd2Ugd2lsbCB1c2UgU3BlZWNoU3ludGhlc2lzIHRvIGtlZXAgdGhlIGZlYXR1cmUgYWN0aXZlLiBBZnRlciBsb25nIGludGVydmFscyB3aXRob3V0XG4vLyB1c2luZyBTcGVlY2hTeW50aGVzaXMgQ2hyb21lYm9va3Mgd2lsbCB0YWtlIGEgbG9uZyB0aW1lIHRvIHByb2R1Y2UgdGhlIG5leHQgc3BlZWNoLiBQcmVzdW1hYmx5IGl0IGlzIGRpc2FibGluZ1xuLy8gdGhlIGZlYXR1cmUgYXMgYW4gb3B0aW1pemF0aW9uLiBCdXQgdGhpcyB3b3JrYXJvdW5kIGdldHMgYXJvdW5kIGl0IGFuZCBrZWVwcyBzcGVlY2ggZmFzdC5cbmNvbnN0IEVOR0lORV9XQUtFX0lOVEVSVkFMID0gNTAwMDtcblxuLy8gSW4gbXMsIGhvdyBsb25nIHRvIHdhaXQgYmVmb3JlIHdlIGNvbnNpZGVyIHRoZSBTcGVlY2hTeW50aGVzaXMgZW5naW5lIGFzIGhhdmluZyBmYWlsZWQgdG8gc3BlYWsgYSByZXF1ZXN0ZWRcbi8vIHV0dGVyYW5jZS4gQ2hyb21lT1MgYW5kIFNhZmFyaSBpbiBwYXJ0aWN1bGFyIG1heSBzaW1wbHkgZmFpbCB0byBzcGVhay4gSWYgdGhlIGFtb3VudCBvZiB0aW1lIGJldHdlZW4gb3VyIHNwZWFrKClcbi8vIHJlcXVlc3QgYW5kIHRoZSB0aW1lIHdlIHJlY2VpdmUgdGhlIGBzdGFydGAgZXZlbnQgaXMgdG9vIGxvbmcgdGhlbiB3ZSBrbm93IHRoZXJlIHdhcyBhIGZhaWx1cmUgYW5kIHdlIGNhbiB0cnlcbi8vIHRvIGhhbmRsZSBhY2NvcmRpbmdseS4gTGVuZ3RoIGlzIHNvbWV3aGF0IGFyYml0cmFyeSwgYnV0IDUgc2Vjb25kcyBmZWx0IE9LIGFuZCBzZWVtZWQgdG8gd29yayB3ZWxsIHRvIHJlY292ZXIgZnJvbVxuLy8gdGhpcyBlcnJvciBjYXNlLlxuY29uc3QgUEVORElOR19VVFRFUkFOQ0VfREVMQVkgPSA1MDAwO1xuXG4vLyBJbiBXaW5kb3dzIENocm9taXVtLCBsb25nIHV0dGVyYW5jZXMgd2l0aCB0aGUgR29vZ2xlIHZvaWNlcyBzaW1wbHkgc3RvcCBhZnRlciAxNSBzZWNvbmRzIGFuZCB3ZSBuZXZlciBnZXQgZW5kIG9yXG4vLyBjYW5jZWwgZXZlbnRzLiBUaGUgd29ya2Fyb3VuZCBwcm9wb3NlZCBpbiBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD02Nzk0MzcgaXNcbi8vIHRvIHBhdXNlL3Jlc3VtZSB0aGUgdXR0ZXJhbmNlIGF0IGFuIGludGVydmFsLlxuY29uc3QgUEFVU0VfUkVTVU1FX1dPUktBUk9VTkRfSU5URVJWQUwgPSAxMDAwMDtcblxuLy8gSW4gbXMuIEluIFNhZmFyaSwgdGhlIGBzdGFydGAgYW5kIGBlbmRgIGxpc3RlbmVyIGRvIG5vdCBmaXJlIGNvbnNpc3RlbnRseSwgZXNwZWNpYWxseSBhZnRlciBpbnRlcnJ1cHRpb25cbi8vIHdpdGggY2FuY2VsLiBCdXQgc3BlYWtpbmcgYmVoaW5kIGEgdGltZW91dC9kZWxheSBpbXByb3ZlcyB0aGUgYmVoYXZpb3Igc2lnbmlmaWNhbnRseS4gVGltZW91dCBvZiAxMjUgbXMgd2FzXG4vLyBkZXRlcm1pbmVkIHdpdGggdGVzdGluZyB0byBiZSBhIGdvb2QgdmFsdWUgdG8gdXNlLiBWYWx1ZXMgbGVzcyB0aGFuIDEyNSBicm9rZSB0aGUgd29ya2Fyb3VuZCwgd2hpbGUgbGFyZ2VyXG4vLyB2YWx1ZXMgZmVlbCB0b28gc2x1Z2dpc2guIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9obi10cmF2b2x0YWdlL2lzc3Vlcy80MzVcbi8vIEJld2FyZSB0aGF0IFV0dGVyYW5jZVF1ZXVlVGVzdHMgdXNlIHRoaXMgdmFsdWUgdG9vLiBEb24ndCBjaGFuZ2Ugd2l0aG91dCBjaGVja2luZyB0aG9zZSB0ZXN0cy5cbmNvbnN0IFZPSUNJTkdfVVRURVJBTkNFX0lOVEVSVkFMID0gMTI1O1xuXG4vLyBBIGxpc3Qgb2YgXCJub3ZlbHR5XCIgdm9pY2VzIG1hZGUgYXZhaWxhYmxlIGJ5IHRoZSBvcGVyYXRpbmcgc3lzdGVtLi4uZm9yIHNvbWUgcmVhc29uLiBUaGVyZSBpcyBub3RoaW5nIHNwZWNpYWwgYWJvdXRcbi8vIHRoZXNlIG5vdmVsdHkgU3BlZWNoU3ludGhlc2lzVm9pY2VzIHRvIGV4Y2x1ZGUgdGhlbS4gU28gaGF2aW5nIGEgbGlzdCB0byBleGNsdWRlIGJ5IG5hbWUgYW5kIG1haW50aW5pbmcgb3ZlciB0aW1lXG4vLyBpcyB0aGUgYmVzdCB3ZSBjYW4gZG8uXG5jb25zdCBOT1ZFTFRZX1ZPSUNFUyA9IFtcbiAgJ0FsYmVydCcsXG4gICdCYWQgTmV3cycsXG4gICdCYWhoJyxcbiAgJ0JlbGxzJyxcbiAgJ0JvaW5nJyxcbiAgJ0J1YmJsZXMnLFxuICAnQ2VsbG9zJyxcbiAgJ0dvb2QgTmV3cycsXG4gICdKZXN0ZXInLFxuICAnT3JnYW4nLFxuICAnU3VwZXJzdGFyJyxcbiAgJ1RyaW5vaWRzJyxcbiAgJ1doaXNwZXInLFxuICAnV29iYmxlJyxcbiAgJ1phcnZveCcsXG5cbiAgLy8gbm90IHRlY2huaWNhbGx5IFwibm92ZWx0eVwiIGJ1dCBzdGlsbCBzb3VuZCB0b28gYmFkIGFuZCB3b3VsZCBiZSBkaXN0cmFjdGluZyB0byB1c2Vycywgc2VlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91dHRlcmFuY2UtcXVldWUvaXNzdWVzLzkzI2lzc3VlY29tbWVudC0xMzAzOTAxNDg0XG4gICdGbG8nLFxuICAnR3JhbmRtYScsXG4gICdHcmFuZHBhJyxcbiAgJ0p1bmlvcidcbl07XG5cbi8vIE9ubHkgb25lIGluc3RhbmNlIG9mIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciBjYW4gYmUgaW5pdGlhbGl6ZWQsIHNlZSB0b3AgbGV2ZWwgdHlwZSBkb2N1bWVudGF0aW9uLlxubGV0IGluaXRpYWxpemVDb3VudCA9IDA7XG5cbnR5cGUgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VPcHRpb25zID0ge1xuICBjYW5jZWxTZWxmPzogYm9vbGVhbjtcbiAgY2FuY2VsT3RoZXI/OiBib29sZWFuO1xuICB2b2ljZT86IFNwZWVjaFN5bnRoZXNpc1ZvaWNlIHwgbnVsbDtcbn07XG5cbi8vIFRoZSBTcGVlY2hTeW50aGVzaXNWb2ljZS5sYW5nIHByb3BlcnR5IGhhcyBhIHNjaGVtYSB0aGF0IGlzIGRpZmZlcmVudCBmcm9tIG91ciBsb2NhbGUgKHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU3BlZWNoU3ludGhlc2lzVm9pY2UvbGFuZylcbi8vIEFzIGEgcmVzdWx0LCBtYW51YWxseSBtYXAgYSBjb3VwbGUgaW1wb3J0YW50IHZhbHVlcyBiYWNrIHRvIG91ciBvd24gc3VwcG9ydGVkIGxvY2FsZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbnVtYmVyLXBsYXkvaXNzdWVzLzIzMC5cbi8vIFlvdSBjYW4gdGVzdCB0aGF0IHRoaXMgbWFwIGlzIHdvcmtpbmcgd2l0aCBzb21ldGhpbmcgbGlrZSBgJ2VuLUdCJzogJ2VzJ2BcbmNvbnN0IHZvaWNlTGFuZ1RvU3VwcG9ydGVkTG9jYWxlOiBSZWNvcmQ8c3RyaW5nLCBMb2NhbGU+ID0ge1xuICBjbW46ICd6aF9DTicsXG4gIHl1ZTogJ3poX0hLJyxcbiAgJ3l1ZS1ISyc6ICd6aF9ISycsXG4gIHl1ZV9ISzogJ3poX0hLJyxcbiAgJ2ZpbC1QSCc6ICd0bCcsIC8vIElTTyA2MzktMSBkb2VzIG5vdCBzdXBwb3J0IGZpbGlwaW5vLCBzbyB0aGlzIGlzIGJldHRlciB0aGFuIG5vdGhpbmcgKHNpbmNlIGl0IGhhcyB0cmFuc2xhdGlvbiBzdXBwb3J0KVxuICBmaWxfUEg6ICd0bCdcbn07XG5cbmNvbnN0IFVUVEVSQU5DRV9PUFRJT05fREVGQVVMVFM6IE9wdGlvbml6ZURlZmF1bHRzPFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlT3B0aW9ucz4gPSB7XG5cbiAgLy8gSWYgdHJ1ZSBhbmQgdGhpcyBVdHRlcmFuY2UgaXMgY3VycmVudGx5IGJlaW5nIHNwb2tlbiBieSB0aGUgc3BlZWNoIHN5bnRoLCBhbm5vdW5jaW5nIGl0XG4gIC8vIHRvIHRoZSBxdWV1ZSBhZ2FpbiB3aWxsIGltbWVkaWF0ZWx5IGNhbmNlbCB0aGUgc3ludGggYW5kIG5ldyBjb250ZW50IHdpbGwgYmVcbiAgLy8gc3Bva2VuLiBPdGhlcndpc2UsIG5ldyBjb250ZW50IGZvciB0aGlzIHV0dGVyYW5jZSB3aWxsIGJlIHNwb2tlbiB3aGVuZXZlciB0aGUgb2xkXG4gIC8vIGNvbnRlbnQgaGFzIGZpbmlzaGVkIHNwZWFraW5nLiBVc2VkIHdoZW4gYWRkaW5nIHRoZSBVdHRlcmFuY2UgdG8gYmUgc3Bva2VuLlxuICBjYW5jZWxTZWxmOiB0cnVlLFxuXG4gIC8vIE9ubHkgYXBwbGllcyB0byB0d28gVXR0ZXJhbmNlcyB3aXRoIHRoZSBzYW1lIHByaW9yaXR5LiBJZiB0cnVlIGFuZCBhbm90aGVyIFV0dGVyYW5jZSBpcyBjdXJyZW50bHlcbiAgLy8gYmVpbmcgc3Bva2VuIGJ5IHRoZSBzcGVlY2ggc3ludGggKG9yIHF1ZXVlZCBieSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIpLCBhbm5vdW5jaW5nIHRoaXMgVXR0ZXJhbmNlIHdpbGwgaW1tZWRpYXRlbHkgY2FuY2VsXG4gIC8vIHRoZSBvdGhlciBjb250ZW50IGJlaW5nIHNwb2tlbiBieSB0aGUgc3ludGguIE90aGVyd2lzZSwgY29udGVudCBmb3IgdGhlIG5ldyB1dHRlcmFuY2Ugd2lsbCBiZSBzcG9rZW4gYXMgc29vbiBhc1xuICAvLyB0aGUgYnJvd3NlciBmaW5pc2hlcyBzcGVha2luZyB0aGUgdXR0ZXJhbmNlcyBpbiBmcm9udCBvZiBpdCBpbiBsaW5lLiBVc2VkIHdoZW4gYWRkaW5nIHRoZSBVdHRlcmFuY2UgdG8gYmUgc3Bva2VuLlxuICBjYW5jZWxPdGhlcjogdHJ1ZSxcblxuICAvLyBQcm92aWRlIGEgc3BlY2lmaWMgU3BlZWNoU3ludGhlc2lzVm9pY2UgZm9yIG9ubHkgdGhpcyBVdHRlcmFuY2UsIG9yIGlmIG51bGwgdXNlIHRoZSBBbm5vdW5jZXIncyBnZW5lcmFsXG4gIC8vIHZvaWNlUHJvcGVydHkgdmFsdWUuIFVzZWQgd2hlbiBzcGVha2luZyB0aGUgVXR0ZXJhbmNlLlxuICB2b2ljZTogbnVsbFxufTtcblxuLy8gT3B0aW9ucyB0byB0aGUgaW5pdGlhbGl6ZSBmdW5jdGlvblxuZXhwb3J0IHR5cGUgU3BlZWNoU3ludGhlc2lzSW5pdGlhbGl6ZU9wdGlvbnMgPSB7XG4gIHNwZWVjaEFsbG93ZWRQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xufTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBTd2l0Y2ggdG8gdHJ1ZSB0byBlbmFibGUgZGVidWdnaW5nIGZlYXR1cmVzIChsaWtlIGxvZ2dpbmcpXG4gIGRlYnVnPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEFubm91bmNlck9wdGlvbnM7XG5cbmNsYXNzIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciBleHRlbmRzIEFubm91bmNlciB7XG4gIHB1YmxpYyByZWFkb25seSB2b2ljZVByb3BlcnR5OiBQcm9wZXJ0eTxudWxsIHwgU3BlZWNoU3ludGhlc2lzVm9pY2U+O1xuXG4gIC8vIGNvbnRyb2xzIHRoZSBzcGVha2luZyByYXRlIG9mIFdlYiBTcGVlY2hcbiAgcHVibGljIHJlYWRvbmx5IHZvaWNlUmF0ZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcblxuICAvLyBjb250cm9scyB0aGUgcGl0Y2ggb2YgdGhlIHN5bnRoXG4gIHB1YmxpYyByZWFkb25seSB2b2ljZVBpdGNoUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xuXG4gIC8vIENvbnRyb2xzIHZvbHVtZSBvZiB0aGUgc3ludGguIEludGVuZGVkIGZvciB1c2Ugd2l0aCB1bml0IHRlc3RzIG9ubHkhIVxuICBwcml2YXRlIHJlYWRvbmx5IHZvaWNlVm9sdW1lUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xuXG4gIC8vIEluIG1zLCBob3cgbG9uZyB0byBnbyBiZWZvcmUgXCJ3YWtpbmcgdGhlIFNwZWVjaFN5bnRoZXNpc1wiIGVuZ2luZSB0byBrZWVwIHNwZWVjaFxuICAvLyBmYXN0IG9uIENocm9tZWJvb2tzLCBzZWUgZG9jdW1lbnRhdGlvbiBhcm91bmQgRU5HSU5FX1dBS0VfSU5URVJWQUwuXG4gIHByaXZhdGUgdGltZVNpbmNlV2FraW5nRW5naW5lOiBudW1iZXI7XG5cbiAgLy8gSW4gbXMsIGhvdyBsb25nIHNpbmNlIHdlIGhhdmUgYXBwbGllZCB0aGUgXCJwYXVzZS9yZXN1bWVcIiB3b3JrYXJvdW5kIGZvciBsb25nIHV0dGVyYW5jZXMgaW4gQ2hyb21pdW0uIFZlcnlcbiAgLy8gbG9uZyBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VzIChsb25nZXIgdGhhbiAxNSBzZWNvbmRzKSBnZXQgY3V0IG9uIENocm9taXVtIGFuZCB3ZSBuZXZlciBnZXQgXCJlbmRcIiBvciBcImNhbmNlbFwiXG4gIC8vIGV2ZW50cyBkdWUgdG8gYSBwbGF0Zm9ybSBidWcsIHNlZSBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD02Nzk0MzcuXG4gIHByaXZhdGUgdGltZVNpbmNlUGF1c2VSZXN1bWU6IG51bWJlcjtcblxuICAvLyBJbiBtcywgaG93IGxvbmcgaXQgaGFzIGJlZW4gc2luY2Ugd2UgcmVxdWVzdGVkIHNwZWVjaCBvZiBhIG5ldyB1dHRlcmFuY2UgYW5kIHdoZW5cbiAgLy8gdGhlIHN5bnRoIGhhcyBzdWNjZXNzZnVsbHkgc3RhcnRlZCBzcGVha2luZyBpdC4gSXQgaXMgcG9zc2libGUgdGhhdCB0aGUgc3ludGggd2lsbCBmYWlsIHRvIHNwZWFrIHNvIGlmXG4gIC8vIHRoaXMgdGltZXIgZ2V0cyB0b28gaGlnaCB3ZSBoYW5kbGUgdGhlIGZhaWx1cmUgY2FzZS5cbiAgcHJpdmF0ZSB0aW1lU2luY2VQZW5kaW5nVXR0ZXJhbmNlOiBudW1iZXI7XG5cbiAgLy8gQW1vdW50IG9mIHRpbWUgaW4gbXMgdG8gd2FpdCBiZXR3ZWVuIHNwZWFraW5nIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZXMsIHNlZVxuICAvLyBWT0lDSU5HX1VUVEVSQU5DRV9JTlRFUlZBTCBmb3IgZGV0YWlscyBhYm91dCB3aHkgdGhpcyBpcyBuZWNlc3NhcnkuIEluaXRpYWxpemVkIHRvIHRoZSBpbnRlcnZhbCB2YWx1ZVxuICAvLyBzbyB0aGF0IHdlIGNhbiBzcGVhayBpbnN0YW50bHkgdGhlIGZpcnN0IHRpbWUuXG4gIHByaXZhdGUgdGltZVNpbmNlVXR0ZXJhbmNlRW5kOiBudW1iZXI7XG5cbiAgLy8gZW1pdHMgZXZlbnRzIHdoZW4gdGhlIHNwZWFrZXIgc3RhcnRzL3N0b3BzIHNwZWFraW5nLCB3aXRoIHRoZSBVdHRlcmFuY2UgdGhhdCBpc1xuICAvLyBlaXRoZXIgc3RhcnRpbmcgb3Igc3RvcHBpbmdcbiAgcHVibGljIHJlYWRvbmx5IHN0YXJ0U3BlYWtpbmdFbWl0dGVyOiBURW1pdHRlcjxbIFJlc29sdmVkUmVzcG9uc2UsIFV0dGVyYW5jZSBdPjtcbiAgcHVibGljIHJlYWRvbmx5IGVuZFNwZWFraW5nRW1pdHRlcjogVEVtaXR0ZXI8WyBSZXNvbHZlZFJlc3BvbnNlLCBVdHRlcmFuY2UgXT47XG5cbiAgLy8gVG8gZ2V0IGFyb3VuZCBtdWx0aXBsZSBpbmhlcml0YW5jZSBpc3N1ZXMsIGNyZWF0ZSBlbmFibGVkUHJvcGVydHkgdmlhIGNvbXBvc2l0aW9uIGluc3RlYWQsIHRoZW4gY3JlYXRlXG4gIC8vIGEgcmVmZXJlbmNlIG9uIHRoaXMgY29tcG9uZW50IGZvciB0aGUgZW5hYmxlZFByb3BlcnR5XG4gIHByaXZhdGUgZW5hYmxlZENvbXBvbmVudEltcGxlbWVudGF0aW9uOiBFbmFibGVkQ29tcG9uZW50O1xuICBwdWJsaWMgcmVhZG9ubHkgZW5hYmxlZFByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gQ29udHJvbHMgd2hldGhlciBWb2ljaW5nIGlzIGVuYWJsZWQgaW4gYSBcIm1haW4gd2luZG93XCIgYXJlYSBvZiB0aGUgYXBwbGljYXRpb24uXG4gIC8vIFRoaXMgc3VwcG9ydHMgdGhlIGFiaWxpdHkgdG8gZGlzYWJsZSBWb2ljaW5nIGZvciB0aGUgaW1wb3J0YW50IHNjcmVlbiBjb250ZW50IG9mIHlvdXIgYXBwbGljYXRpb24gd2hpbGUga2VlcGluZ1xuICAvLyBWb2ljaW5nIGZvciBzdXJyb3VuZGluZyBVSSBjb21wb25lbnRzIGVuYWJsZWQgKGZvciBleGFtcGxlKS5cbiAgcHVibGljIHJlYWRvbmx5IG1haW5XaW5kb3dWb2ljaW5nRW5hYmxlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBQcm9wZXJ0eSB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBWb2ljaW5nIGZlYXR1cmUgaXMgZW5hYmxlZCBmb3IgYWxsIGFyZWFzIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAgcHVibGljIHZvaWNpbmdGdWxseUVuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgc3BlZWNoIGlzIGZ1bGx5IGVuYWJsZWQgQU5EIHNwZWVjaCBpcyBhbGxvd2VkLCBhcyBzcGVjaWZpZWRcbiAgLy8gYnkgdGhlIFByb3BlcnR5IHByb3ZpZGVkIGluIGluaXRpYWxpemUoKS4gU2VlIHNwZWVjaEFsbG93ZWRQcm9wZXJ0eSBvZiBpbml0aWFsaXplKCkuIEluIG9yZGVyIGZvciB0aGlzIFByb3BlcnR5XG4gIC8vIHRvIGJlIHRydWUsIHNwZWVjaEFsbG93ZWRQcm9wZXJ0eSwgZW5hYmxlZFByb3BlcnR5LCBhbmQgbWFpbldpbmRvd1ZvaWNpbmdFbmFibGVkUHJvcGVydHkgbXVzdCBhbGwgYmUgdHJ1ZS5cbiAgLy8gSW5pdGlhbGl6ZWQgaW4gdGhlIGNvbnN0cnVjdG9yIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gYWxsIHRoZSBkZXBlbmRlbmN5IFByb3BlcnRpZXMgdW50aWwgaW5pdGlhbGl6ZS5cbiAgLy8gVGhlc2UgdHdvIHZhcmlhYmxlIGtlZXAgYSBwdWJsaWMsIHJlYWRvbmx5IGludGVyZmFjZS4gV2UgY2Fubm90IHVzZSBhIERlcml2ZWRQcm9wZXJ0eSBiZWNhdXNlIGl0IG5lZWRzIHRvIGJlXG4gIC8vIGxpc3RlbmVkIHRvIGJlZm9yZSBpdHMgZGVwZW5kZW5jaWVzIGFyZSBjcmVhdGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3V0dGVyYW5jZS1xdWV1ZS9pc3N1ZXMvNzJcbiAgcHVibGljIHJlYWRvbmx5IHNwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XG4gIHByaXZhdGUgcmVhZG9ubHkgX3NwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIHN5bnRoIGZyb20gV2ViIFNwZWVjaCBBUEkgdGhhdCBkcml2ZXMgc3BlZWNoLCBkZWZpbmVkIG9uIGluaXRpYWxpemVcbiAgcHJpdmF0ZSBzeW50aDogbnVsbCB8IFNwZWVjaFN5bnRoZXNpcztcblxuICAvLyBwb3NzaWJsZSB2b2ljZXMgZm9yIFdlYiBTcGVlY2ggc3ludGhlc2lzXG4gIHB1YmxpYyB2b2ljZXNQcm9wZXJ0eTogVFByb3BlcnR5PFNwZWVjaFN5bnRoZXNpc1ZvaWNlW10+O1xuXG4gIC8vIEhvbGRzIGEgcmVmZXJlbmNlIHRvIHRoZSBVdHRlcmFuY2UgdGhhdCBpcyBhY3RpdmVseSBiZWluZyBzcG9rZW4gYnkgdGhlIGFubm91bmNlci4gTm90ZSB0aGF0IGRlcGVuZGluZ1xuICAvLyBvbiB0aGUgcGxhdGZvcm0sIHRoZXJlIG1heSBiZSBhIGRlbGF5IGJldHdlZW4gdGhlIHNwZWFrKCkgcmVxdWVzdCBhbmQgd2hlbiB0aGUgc3ludGggYWN0dWFsbHkgc3RhcnRzIHNwZWFraW5nLlxuICAvLyBLZWVwaW5nIGEgcmVmZXJlbmNlIHN1cHBvcnRzIGNhbmNlbGxpbmcsIHByaW9yaXR5IGNoYW5nZXMsIGFuZCBjbGVhbmluZyB3aGVuIGZpbmlzaGVkIHNwZWFraW5nLlxuICBwcml2YXRlIHNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlcjogU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciB8IG51bGw7XG5cbiAgLy8gaXMgdGhlIFZvaWNpbmdNYW5hZ2VyIGluaXRpYWxpemVkIGZvciB1c2U/IFRoaXMgaXMgcHJvdG90eXBhbCBzbyBpdCBpc24ndCBhbHdheXMgaW5pdGlhbGl6ZWRcbiAgcHVibGljIGlzSW5pdGlhbGl6ZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIENvbnRyb2xzIHdoZXRoZXIgc3BlZWNoIGlzIGFsbG93ZWQgd2l0aCBzeW50aGVzaXMuIE51bGwgdW50aWwgaW5pdGlhbGl6ZWQsIGFuZCBjYW4gYmUgc2V0IGJ5IG9wdGlvbnMgdG9cbiAgLy8gaW5pdGlhbGl6ZSgpLlxuICBwcml2YXRlIGNhblNwZWFrUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+IHwgbnVsbDtcblxuICAvLyBib3VuZCBzbyB3ZSBjYW4gbGluayBhbmQgdW5saW5rIHRvIHRoaXMuY2FuU3BlYWtQcm9wZXJ0eSB3aGVuIHRoZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgYmVjb21lcyBpbml0aWFsaXplZC5cbiAgcHJpdmF0ZSByZWFkb25seSBib3VuZEhhbmRsZUNhblNwZWFrQ2hhbmdlOiAoIGNhblNwZWFrOiBib29sZWFuICkgPT4gdm9pZDtcblxuICAvLyBBIGxpc3RlbmVyIHRoYXQgd2lsbCBjYW5jZWwgdGhlIFV0dGVyYW5jZSB0aGF0IGlzIGJlaW5nIGFubm91bmNlZCBpZiBpdHMgY2FuQW5ub3VuY2VQcm9wZXJ0eSBiZWNvbWVzIGZhbHNlLlxuICAvLyBTZXQgd2hlbiB0aGlzIEFubm91bmNlciBiZWdpbnMgdG8gYW5ub3VuY2UgYSBuZXcgVXR0ZXJhbmNlIGFuZCBjbGVhcmVkIHdoZW4gdGhlIFV0dGVyYW5jZSBpcyBmaW5pc2hlZC9jYW5jZWxsZWQuXG4gIC8vIEJvdW5kIHNvIHRoYXQgdGhlIGxpc3RlbmVyIGNhbiBiZSBhZGRlZCBhbmQgcmVtb3ZlZCBvbiBVdHRlcmFuY2VzIHdpdGhvdXQgY3JlYXRpbmcgbWFueSBjbG9zdXJlcy5cbiAgcHJpdmF0ZSByZWFkb25seSBib3VuZEhhbmRsZUNhbkFubm91bmNlQ2hhbmdlOiAoIGNhbkFubm91bmNlOiBib29sZWFuICkgPT4gdm9pZDtcblxuICAvLyBTd2l0Y2ggdG8gdHJ1ZSB0byBlbmFibGUgZGVidWdnaW5nIGZlYXR1cmVzIChsaWtlIGxvZ2dpbmcpXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVidWc6IGJvb2xlYW47XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXJPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgQW5ub3VuY2VyT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgZ2VuZXJhbGx5IGRvZXNuJ3QgY2FyZSBhYm91dCBSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXMsXG4gICAgICAvLyB0aGF0IGlzIG1vcmUgc3BlY2lmaWMgdG8gdGhlIFZvaWNpbmcgZmVhdHVyZS5cbiAgICAgIHJlc3BlY3RSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXM6IGZhbHNlLFxuXG4gICAgICBkZWJ1ZzogZmFsc2VcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmRlYnVnID0gb3B0aW9ucy5kZWJ1ZztcblxuICAgIHRoaXMudm9pY2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxudWxsIHwgU3BlZWNoU3ludGhlc2lzVm9pY2U+KCBudWxsLCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICd2b2ljZVByb3BlcnR5JyApLFxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBTcGVlY2hTeW50aGVzaXNWb2ljZUlPICksXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgdm9pY2UgdGhhdCBpcyBjdXJyZW50bHkgdm9pY2luZyByZXNwb25zZXMnXG4gICAgfSApO1xuICAgIHRoaXMudm9pY2VSYXRlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEuMCwge1xuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMC43NSwgMiApLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAndm9pY2VSYXRlUHJvcGVydHknICksXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnY2hhbmdlcyB0aGUgcmF0ZSBvZiB0aGUgdm9pY2luZy1mZWF0dXJlIHZvaWNlJ1xuICAgIH0gKTtcbiAgICB0aGlzLnZvaWNlUGl0Y2hQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMS4wLCB7XG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLjUsIDIgKSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ3ZvaWNlUGl0Y2hQcm9wZXJ0eScgKSxcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjaGFuZ2VzIHRoZSBwaXRjaCBvZiB0aGUgdm9pY2luZy1mZWF0dXJlIHZvaWNlJ1xuICAgIH0gKTtcbiAgICB0aGlzLnZvaWNlVm9sdW1lUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEuMCwge1xuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMSApXG4gICAgfSApO1xuXG4gICAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgc3BlZWNoIHVzaW5nIFNwZWVjaFN5bnRoZXNpcyBoYXMgYmVlbiByZXF1ZXN0ZWQgYXQgbGVhc3Qgb25jZS5cbiAgICAvLyBUaGUgZmlyc3QgdGltZSBzcGVlY2ggaXMgcmVxdWVzdGVkLCBpdCBtdXN0IGJlIGRvbmUgc3luY2hyb25vdXNseSBmcm9tIHVzZXIgaW5wdXQgd2l0aCBhYnNvbHV0ZWx5IG5vIGRlbGF5LlxuICAgIC8vIHJlcXVlc3RTcGVlY2goKSBnZW5lcmFsbHkgdXNlcyBhIHRpbWVvdXQgdG8gd29ya2Fyb3VuZCBicm93c2VyIGJ1Z3MsIGJ1dCB0aG9zZSBjYW5ub3QgYmUgdXNlZCB1bnRpbCBhZnRlciB0aGVcbiAgICAvLyBmaXJzdCByZXF1ZXN0IGZvciBzcGVlY2guXG4gICAgdGhpcy5oYXNTcG9rZW4gPSBmYWxzZTtcblxuICAgIHRoaXMudGltZVNpbmNlV2FraW5nRW5naW5lID0gMDtcbiAgICB0aGlzLnRpbWVTaW5jZVBhdXNlUmVzdW1lID0gMDtcblxuICAgIHRoaXMudGltZVNpbmNlUGVuZGluZ1V0dGVyYW5jZSA9IDA7XG5cbiAgICB0aGlzLnRpbWVTaW5jZVV0dGVyYW5jZUVuZCA9IFZPSUNJTkdfVVRURVJBTkNFX0lOVEVSVkFMO1xuXG4gICAgdGhpcy5zdGFydFNwZWFraW5nRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6ICdzdHJpbmcnIH0sIHsgdmFsdWVUeXBlOiBVdHRlcmFuY2UgfSBdIH0gKTtcbiAgICB0aGlzLmVuZFNwZWFraW5nRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6ICdzdHJpbmcnIH0sIHsgdmFsdWVUeXBlOiBVdHRlcmFuY2UgfSBdIH0gKTtcblxuICAgIHRoaXMuZW5hYmxlZENvbXBvbmVudEltcGxlbWVudGF0aW9uID0gbmV3IEVuYWJsZWRDb21wb25lbnQoIHtcblxuICAgICAgLy8gaW5pdGlhbCB2YWx1ZSBmb3IgdGhlIGVuYWJsZWRQcm9wZXJ0eSwgZmFsc2UgYmVjYXVzZSBzcGVlY2ggc2hvdWxkIG5vdCBoYXBwZW4gdW50aWwgcmVxdWVzdGVkIGJ5IHVzZXJcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLFxuICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczoge1xuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndG9nZ2xlcyB0aGlzIGNvbnRyb2xsZXIgb2YgU3BlZWNoU3ludGhlc2lzIG9uIGFuZCBvZmYnLFxuICAgICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiBmYWxzZVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZW5hYmxlZENvbXBvbmVudEltcGxlbWVudGF0aW9uLmVuYWJsZWRQcm9wZXJ0eS5pc1NldHRhYmxlKCksICdlbmFibGVkUHJvcGVydHkgbXVzdCBiZSBzZXR0YWJsZScgKTtcbiAgICB0aGlzLmVuYWJsZWRQcm9wZXJ0eSA9IHRoaXMuZW5hYmxlZENvbXBvbmVudEltcGxlbWVudGF0aW9uLmVuYWJsZWRQcm9wZXJ0eTtcblxuICAgIHRoaXMubWFpbldpbmRvd1ZvaWNpbmdFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdtYWluV2luZG93Vm9pY2luZ0VuYWJsZWRQcm9wZXJ0eScgKSxcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0b2dnbGVzIHRoZSB2b2ljaW5nIGZlYXR1cmUgb24gYW5kIG9mZiBmb3IgdGhlIHNpbXVsYXRpb24gc2NyZWVuIChub3QgdGhlIHZvaWNpbmcgcHJlZmVyZW5jZXMgYW5kIHRvb2xiYXIgY29udHJvbHMpJ1xuICAgIH0gKTtcblxuICAgIHRoaXMudm9pY2luZ0Z1bGx5RW5hYmxlZFByb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5LmFuZCggWyB0aGlzLmVuYWJsZWRQcm9wZXJ0eSwgdGhpcy5tYWluV2luZG93Vm9pY2luZ0VuYWJsZWRQcm9wZXJ0eSBdICk7XG5cbiAgICB0aGlzLl9zcGVlY2hBbGxvd2VkQW5kRnVsbHlFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuICAgIHRoaXMuc3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5ID0gdGhpcy5fc3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5O1xuXG4gICAgdGhpcy5zeW50aCA9IG51bGw7XG4gICAgdGhpcy52b2ljZXNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggW10gKTtcblxuICAgIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyID0gbnVsbDtcbiAgICB0aGlzLmlzSW5pdGlhbGl6ZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG4gICAgdGhpcy5jYW5TcGVha1Byb3BlcnR5ID0gbnVsbDtcbiAgICB0aGlzLmJvdW5kSGFuZGxlQ2FuU3BlYWtDaGFuZ2UgPSB0aGlzLmhhbmRsZUNhblNwZWFrQ2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLmJvdW5kSGFuZGxlQ2FuQW5ub3VuY2VDaGFuZ2UgPSB0aGlzLmhhbmRsZUNhbkFubm91bmNlQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblxuICAgIGlmICggdGhpcy5kZWJ1ZyApIHtcbiAgICAgIHRoaXMuYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyLmFkZExpc3RlbmVyKCAoIHV0dGVyYW5jZSwgc3RyaW5nICkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyggJ2Fubm91bmNlbWVudCBjb21wbGV0ZScsIHN0cmluZyApO1xuICAgICAgfSApO1xuICAgICAgdGhpcy5zdGFydFNwZWFraW5nRW1pdHRlci5hZGRMaXN0ZW5lciggc3RyaW5nID0+IHtcbiAgICAgICAgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmxvZyggJ3N0YXJ0U3BlYWtpbmdMaXN0ZW5lcicsIHN0cmluZyApO1xuICAgICAgfSApO1xuICAgICAgdGhpcy5lbmRTcGVha2luZ0VtaXR0ZXIuYWRkTGlzdGVuZXIoIHN0cmluZyA9PiB7XG4gICAgICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdlbmRTcGVha2luZ0xpc3RlbmVyJywgc3RyaW5nICk7XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBpbml0aWFsaXplZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0luaXRpYWxpemVkUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogSW5kaWNhdGUgdGhhdCB0aGUgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIGlzIHJlYWR5IGZvciB1c2UsIGFuZCBhdHRlbXB0IHRvIHBvcHVsYXRlIHZvaWNlcyAoaWYgdGhleSBhcmUgcmVhZHkgeWV0KS4gQWRkc1xuICAgKiBsaXN0ZW5lcnMgdGhhdCBjb250cm9sIHNwZWVjaC5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJHZXN0dXJlRW1pdHRlciAtIEVtaXRzIHdoZW4gdXNlciBpbnB1dCBoYXBwZW5zLCB3aGljaCBpcyByZXF1aXJlZCBiZWZvcmUgdGhlIGJyb3dzZXIgaXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvd2VkIHRvIHVzZSBTcGVlY2hTeW50aGVzaXMgZm9yIHRoZSBmaXJzdCB0aW1lLlxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBpbml0aWFsaXplKCB1c2VyR2VzdHVyZUVtaXR0ZXI6IFRSZWFkT25seUVtaXR0ZXIsIHByb3ZpZGVkT3B0aW9ucz86IFNwZWVjaFN5bnRoZXNpc0luaXRpYWxpemVPcHRpb25zICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluaXRpYWxpemVkLCAnY2FuIG9ubHkgYmUgaW5pdGlhbGl6ZWQgb25jZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIuaXNTcGVlY2hTeW50aGVzaXNTdXBwb3J0ZWQoKSwgJ3RyeWluZyB0byBpbml0aWFsaXplIHNwZWVjaCwgYnV0IHNwZWVjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgcGxhdGZvcm0uJyApO1xuXG4gICAgLy8gU2VlIHRvcCBsZXZlbCB0eXBlIGRvY3VtZW50YXRpb24uXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5pdGlhbGl6ZUNvdW50ID09PSAwLCAnT25seSBvbmUgaW5zdGFuY2Ugb2YgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIGNhbiBiZSBpbml0aWFsaXplZCBhdCBhIHRpbWUuJyApO1xuICAgIGluaXRpYWxpemVDb3VudCsrO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTcGVlY2hTeW50aGVzaXNJbml0aWFsaXplT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyB7Qm9vbGVhblByb3BlcnR5fERlcml2ZWRQcm9wZXJ0eS48Ym9vbGVhbj59IC0gQ29udHJvbHMgd2hldGhlciBzcGVlY2ggaXMgYWxsb3dlZCB3aXRoIHNwZWVjaCBzeW50aGVzaXMuXG4gICAgICAvLyBDb21iaW5lZCBpbnRvIGFub3RoZXIgRGVyaXZlZFByb3BlcnR5IHdpdGggdGhpcy5lbmFibGVkUHJvcGVydHkgc28geW91IGRvbid0IGhhdmUgdG8gdXNlIHRoYXQgYXMgb25lXG4gICAgICAvLyBvZiB0aGUgUHJvcGVydGllcyB0aGF0IGRlcml2ZSBzcGVlY2hBbGxvd2VkUHJvcGVydHksIGlmIHlvdSBhcmUgcGFzc2luZyBpbiBhIERlcml2ZWRQcm9wZXJ0eS5cbiAgICAgIHNwZWVjaEFsbG93ZWRQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB0aGlzLnN5bnRoID0gd2luZG93LnNwZWVjaFN5bnRoZXNpcztcblxuICAgIC8vIHdoZXRoZXIgdGhlIG9wdGlvbmFsIFByb3BlcnR5IGluZGljYXRpbmcgc3BlZWNoIGlzIGFsbG93ZWQgYW5kIHRoZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgaXMgZW5hYmxlZFxuICAgIHRoaXMuY2FuU3BlYWtQcm9wZXJ0eSA9IERlcml2ZWRQcm9wZXJ0eS5hbmQoIFsgb3B0aW9ucy5zcGVlY2hBbGxvd2VkUHJvcGVydHksIHRoaXMuZW5hYmxlZFByb3BlcnR5IF0gKTtcbiAgICB0aGlzLmNhblNwZWFrUHJvcGVydHkubGluayggdGhpcy5ib3VuZEhhbmRsZUNhblNwZWFrQ2hhbmdlICk7XG5cbiAgICAvLyBTZXQgdGhlIHNwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eSB3aGVuIGRlcGVuZGVuY3kgUHJvcGVydGllcyB1cGRhdGVcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxuICAgICAgWyBvcHRpb25zLnNwZWVjaEFsbG93ZWRQcm9wZXJ0eSwgdGhpcy52b2ljaW5nRnVsbHlFbmFibGVkUHJvcGVydHkgXSxcbiAgICAgICggc3BlZWNoQWxsb3dlZCwgdm9pY2luZ0Z1bGx5RW5hYmxlZCApID0+IHtcbiAgICAgICAgdGhpcy5fc3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5LnZhbHVlID0gc3BlZWNoQWxsb3dlZCAmJiB2b2ljaW5nRnVsbHlFbmFibGVkO1xuICAgICAgfSApO1xuXG4gICAgLy8gYnJvd3NlcnMgdGVuZCB0byBnZW5lcmF0ZSB0aGUgbGlzdCBvZiB2b2ljZXMgbGF6aWx5LCBzbyB0aGUgbGlzdCBvZiB2b2ljZXMgbWF5IGJlIGVtcHR5IHVudGlsIHNwZWVjaCBpcyBmaXJzdFxuICAgIC8vIHJlcXVlc3RlZC4gU29tZSBicm93c2VycyBkb24ndCBoYXZlIGFuIGFkZEV2ZW50TGlzdGVuZXIgZnVuY3Rpb24gb24gc3BlZWNoU3ludGhlc2lzIHNvIGNoZWNrIHRvIHNlZSBpZiBpdCBleGlzdHNcbiAgICAvLyBiZWZvcmUgdHJ5aW5nIHRvIGNhbGwgaXQuXG4gICAgY29uc3Qgc3ludGggPSB0aGlzLmdldFN5bnRoKCkhO1xuICAgIHN5bnRoLmFkZEV2ZW50TGlzdGVuZXIgJiYgc3ludGguYWRkRXZlbnRMaXN0ZW5lciggJ3ZvaWNlc2NoYW5nZWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnBvcHVsYXRlVm9pY2VzKCk7XG4gICAgfSApO1xuXG4gICAgLy8gdHJ5IHRvIHBvcHVsYXRlIHZvaWNlcyBpbW1lZGlhdGVseSBpbiBjYXNlIHRoZSBicm93c2VyIHBvcHVsYXRlcyB0aGVtIGVhZ2VybHkgYW5kIHdlIG5ldmVyIGdldCBhblxuICAgIC8vIG9udm9pY2VzY2hhbmdlZCBldmVudFxuICAgIHRoaXMucG9wdWxhdGVWb2ljZXMoKTtcblxuICAgIC8vIFRvIGdldCBWb2ljaW5nIHRvIGhhcHBlbiBxdWlja2x5IG9uIENocm9tZWJvb2tzIHdlIHNldCB0aGUgY291bnRlciB0byBhIHZhbHVlIHRoYXQgd2lsbCB0cmlnZ2VyIHRoZSBcImVuZ2luZVxuICAgIC8vIHdha2VcIiBpbnRlcnZhbCBvbiB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWUgdGhlIGZpcnN0IHRpbWUgd2UgZ2V0IGEgdXNlciBnZXN0dXJlLiBTZWUgRU5HSU5FX1dBS0VfSU5URVJWQUxcbiAgICAvLyBmb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIHdvcmthcm91bmQuXG4gICAgY29uc3Qgc3RhcnRFbmdpbmVMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgIHRoaXMudGltZVNpbmNlV2FraW5nRW5naW5lID0gRU5HSU5FX1dBS0VfSU5URVJWQUw7XG5cbiAgICAgIC8vIERpc3BsYXkgaXMgb24gdGhlIG5hbWVzcGFjZSBidXQgY2Fubm90IGJlIGltcG9ydGVkIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmNpZXNcbiAgICAgIHVzZXJHZXN0dXJlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggc3RhcnRFbmdpbmVMaXN0ZW5lciApO1xuICAgIH07XG4gICAgdXNlckdlc3R1cmVFbWl0dGVyLmFkZExpc3RlbmVyKCBzdGFydEVuZ2luZUxpc3RlbmVyICk7XG5cbiAgICAvLyBsaXN0ZW5lciBmb3IgdGltaW5nIHZhcmlhYmxlc1xuICAgIHN0ZXBUaW1lci5hZGRMaXN0ZW5lciggdGhpcy5zdGVwLmJpbmQoIHRoaXMgKSApO1xuXG4gICAgdGhpcy5pc0luaXRpYWxpemVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBkdCAtIGluIHNlY29uZHMgZnJvbSBzdGVwVGltZXJcbiAgICovXG4gIHByaXZhdGUgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcblxuICAgIC8vIGNvbnZlcnQgdG8gbXNcbiAgICBkdCAqPSAxMDAwO1xuXG4gICAgLy8gaWYgaW5pdGlhbGl6ZWQsIHRoaXMgbWVhbnMgd2UgaGF2ZSBhIHN5bnRoLlxuICAgIGNvbnN0IHN5bnRoID0gdGhpcy5nZXRTeW50aCgpO1xuXG4gICAgaWYgKCB0aGlzLmluaXRpYWxpemVkICYmIHN5bnRoICkge1xuXG4gICAgICAvLyBJZiB3ZSBoYXZlbid0IHNwb2tlbiB5ZXQsIGtlZXAgY2hlY2tpbmcgdGhlIHN5bnRoIHRvIGRldGVybWluZSB3aGVuIHRoZXJlIGhhcyBiZWVuIGEgc3VjY2Vzc2Z1bCB1c2FnZVxuICAgICAgLy8gb2YgU3BlZWNoU3ludGhlc2lzLiBOb3RlIHRoaXMgd2lsbCBiZSB0cnVlIGlmIEFOWSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgaGFzIHN1Y2Nlc3NmdWwgc3BlZWNoIChub3QganVzdFxuICAgICAgLy8gdGhpcyBpbnN0YW5jZSkuXG4gICAgICBpZiAoICF0aGlzLmhhc1Nwb2tlbiApIHtcbiAgICAgICAgdGhpcy5oYXNTcG9rZW4gPSBzeW50aC5zcGVha2luZztcbiAgICAgIH1cblxuICAgICAgLy8gSW5jcmVtZW50IHRoZSBhbW91bnQgb2YgdGltZSBzaW5jZSB0aGUgc3ludGggaGFzIHN0b3BwZWQgc3BlYWtpbmcgdGhlIHByZXZpb3VzIHV0dGVyYW5jZSwgYnV0IGRvbid0XG4gICAgICAvLyBzdGFydCBjb3VudGluZyB1cCB1bnRpbCB0aGUgc3ludGggaGFzIGZpbmlzaGVkIHNwZWFraW5nIGl0cyBjdXJyZW50IHV0dGVyYW5jZS5cbiAgICAgIHRoaXMudGltZVNpbmNlVXR0ZXJhbmNlRW5kID0gc3ludGguc3BlYWtpbmcgPyAwIDogdGhpcy50aW1lU2luY2VVdHRlcmFuY2VFbmQgKyBkdDtcblxuXG4gICAgICB0aGlzLnRpbWVTaW5jZVBlbmRpbmdVdHRlcmFuY2UgPSAoIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyICYmICF0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlci5zdGFydGVkICkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lU2luY2VQZW5kaW5nVXR0ZXJhbmNlICsgZHQgOiAwO1xuXG4gICAgICBpZiAoIHRoaXMudGltZVNpbmNlUGVuZGluZ1V0dGVyYW5jZSA+IFBFTkRJTkdfVVRURVJBTkNFX0RFTEFZICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciwgJ3Nob3VsZCBoYXZlIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyJyApO1xuXG4gICAgICAgIC8vIEl0IGhhcyBiZWVuIHRvbyBsb25nIHNpbmNlIHdlIHJlcXVlc3RlZCBzcGVlY2ggd2l0aG91dCBzcGVha2luZywgdGhlIHN5bnRoIGlzIGxpa2VseSBmYWlsaW5nIG9uIHRoaXMgcGxhdGZvcm1cbiAgICAgICAgdGhpcy5oYW5kbGVTcGVlY2hTeW50aGVzaXNFbmQoIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyIS5hbm5vdW5jZVRleHQsIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyISApO1xuICAgICAgICB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciA9IG51bGw7XG5cbiAgICAgICAgLy8gY2FuY2VsIHRoZSBzeW50aCBiZWNhdXNlIHdlIHJlYWxseSBkb24ndCB3YW50IGl0IHRvIGtlZXAgdHJ5aW5nIHRvIHNwZWFrIHRoaXMgdXR0ZXJhbmNlIGFmdGVyIGhhbmRsaW5nXG4gICAgICAgIC8vIHRoZSBhc3N1bWVkIGZhaWx1cmVcbiAgICAgICAgdGhpcy5jYW5jZWxTeW50aCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBXYWl0IHVudGlsIFZPSUNJTkdfVVRURVJBTkNFX0lOVEVSVkFMIHRvIHNwZWFrIGFnYWluIGZvciBtb3JlIGNvbnNpc3RlbnQgYmVoYXZpb3Igb24gY2VydGFpbiBwbGF0Zm9ybXMsXG4gICAgICAvLyBzZWUgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIGNvbnN0YW50IGZvciBtb3JlIGluZm9ybWF0aW9uLiBCeSBzZXR0aW5nIHJlYWR5VG9Bbm5vdW5jZSBpbiB0aGUgc3RlcCBmdW5jdGlvblxuICAgICAgLy8gd2UgYWxzbyBkb24ndCBoYXZlIHRvIHJlbHkgYXQgYWxsIG9uIHRoZSBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UgJ2VuZCcgZXZlbnQsIHdoaWNoIGlzIGluY29uc2lzdGVudCBvblxuICAgICAgLy8gY2VydGFpbiBwbGF0Zm9ybXMuIEFsc28sIG5vdCByZWFkeSB0byBhbm5vdW5jZSBpZiB3ZSBhcmUgd2FpdGluZyBmb3IgdGhlIHN5bnRoIHRvIHN0YXJ0IHNwZWFraW5nIHNvbWV0aGluZy5cbiAgICAgIGlmICggdGhpcy50aW1lU2luY2VVdHRlcmFuY2VFbmQgPiBWT0lDSU5HX1VUVEVSQU5DRV9JTlRFUlZBTCAmJiAhdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIgKSB7XG4gICAgICAgIHRoaXMucmVhZHlUb0Fubm91bmNlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlcyBsb25nZXIgdGhhbiAxNSBzZWNvbmRzIHdpbGwgZ2V0IGludGVycnVwdGVkIG9uIENocm9tZSBhbmQgZmFpbCB0byBzdG9wIHdpdGhcbiAgICAgIC8vIGVuZCBvciBlcnJvciBldmVudHMuIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTY3OTQzNyBzdWdnZXN0cyBhIHdvcmthcm91bmRcbiAgICAgIC8vIHRoYXQgdXNlcyBwYXVzZS9yZXN1bWUgbGlrZSB0aGlzLiBUaGUgd29ya2Fyb3VuZCBpcyBuZWVkZWQgZm9yIGRlc2t0b3AgQ2hyb21lIHdoZW4gdXNpbmcgYGxvY2FsU2VydmljZTogZmFsc2VgXG4gICAgICAvLyB2b2ljZXMuIFRoZSBidWcgZG9lcyBub3QgYXBwZWFyIG9uIGFueSBNaWNyb3NvZnQgRWRnZSB2b2ljZXMuIFRoaXMgd29ya2Fyb3VuZCBicmVha3MgU3BlZWNoU3ludGhlc2lzIG9uXG4gICAgICAvLyBhbmRyb2lkLiBJbiB0aGlzIGNoZWNrIHdlIG9ubHkgdXNlIHRoaXMgd29ya2Fyb3VuZCB3aGVyZSBuZWVkZWQuXG4gICAgICBpZiAoIHBsYXRmb3JtLmNocm9taXVtICYmICFwbGF0Zm9ybS5hbmRyb2lkICYmICggdGhpcy52b2ljZVByb3BlcnR5LnZhbHVlICYmICF0aGlzLnZvaWNlUHJvcGVydHkudmFsdWUubG9jYWxTZXJ2aWNlICkgKSB7XG5cbiAgICAgICAgLy8gTm90IG5lY2Vzc2FyeSB0byBhcHBseSB0aGUgd29ya2Fyb3VuZCB1bmxlc3Mgd2UgYXJlIGN1cnJlbnRseSBzcGVha2luZy5cbiAgICAgICAgdGhpcy50aW1lU2luY2VQYXVzZVJlc3VtZSA9IHN5bnRoLnNwZWFraW5nID8gdGhpcy50aW1lU2luY2VQYXVzZVJlc3VtZSArIGR0IDogMDtcbiAgICAgICAgaWYgKCB0aGlzLnRpbWVTaW5jZVBhdXNlUmVzdW1lID4gUEFVU0VfUkVTVU1FX1dPUktBUk9VTkRfSU5URVJWQUwgKSB7XG4gICAgICAgICAgdGhpcy50aW1lU2luY2VQYXVzZVJlc3VtZSA9IDA7XG4gICAgICAgICAgc3ludGgucGF1c2UoKTtcbiAgICAgICAgICBzeW50aC5yZXN1bWUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBIHdvcmthcm91bmQgdG8ga2VlcCBTcGVlY2hTeW50aGVzaXMgcmVzcG9uc2l2ZSBvbiBDaHJvbWVib29rcy4gSWYgdGhlcmUgaXMgYSBsb25nIGVub3VnaCBpbnRlcnZhbCBiZXR3ZWVuXG4gICAgICAvLyBzcGVlY2ggcmVxdWVzdHMsIHRoZSBuZXh0IHRpbWUgU3BlZWNoU3ludGhlc2lzIGlzIHVzZWQgaXQgaXMgdmVyeSBzbG93IG9uIENocm9tZWJvb2suIFdlIHRoaW5rIHRoZSBicm93c2VyXG4gICAgICAvLyB0dXJucyBcIm9mZlwiIHRoZSBzeW50aGVzaXMgZW5naW5lIGZvciBwZXJmb3JtYW5jZS4gSWYgaXQgaGFzIGJlZW4gbG9uZyBlbm91Z2ggc2luY2UgdXNpbmcgc3BlZWNoIHN5bnRoZXNpcyBhbmRcbiAgICAgIC8vIHRoZXJlIGlzIG5vdGhpbmcgdG8gc3BlYWsgaW4gdGhlIHF1ZXVlLCByZXF1ZXN0aW5nIHNwZWVjaCB3aXRoIGVtcHR5IGNvbnRlbnQga2VlcHMgdGhlIGVuZ2luZSBhY3RpdmUuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcy9pc3N1ZXMvMzAzLlxuICAgICAgaWYgKCBwbGF0Zm9ybS5jaHJvbWVPUyApIHtcbiAgICAgICAgdGhpcy50aW1lU2luY2VXYWtpbmdFbmdpbmUgKz0gZHQ7XG4gICAgICAgIGlmICggIXN5bnRoLnNwZWFraW5nICYmIHRoaXMudGltZVNpbmNlV2FraW5nRW5naW5lID4gRU5HSU5FX1dBS0VfSU5URVJWQUwgKSB7XG4gICAgICAgICAgdGhpcy50aW1lU2luY2VXYWtpbmdFbmdpbmUgPSAwO1xuXG4gICAgICAgICAgLy8gVGhpcyBzcGFjZSBpcyBhY3R1YWxseSBxdWl0ZSBpbXBvcnRhbnQuIEFuIGVtcHR5IHN0cmluZyBiZWdhbiBicmVha2luZyBjaHJvbWVib29rcyBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZnJpY3Rpb24vaXNzdWVzLzMyOFxuICAgICAgICAgIHN5bnRoLnNwZWFrKCBuZXcgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlKCAnICcgKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gd2UgY2FuIG5vIGxvbmdlciBzcGVhaywgY2FuY2VsIGFsbCBzcGVlY2ggdG8gc2lsZW5jZSBldmVyeXRoaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVDYW5TcGVha0NoYW5nZSggY2FuU3BlYWs6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgaWYgKCAhY2FuU3BlYWsgKSB7IHRoaXMuY2FuY2VsKCk7IH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGxpc3Qgb2YgYHZvaWNlc2AgYXZhaWxhYmxlIHRvIHRoZSBzeW50aCwgYW5kIG5vdGlmeSB0aGF0IHRoZSBsaXN0IGhhcyBjaGFuZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBwb3B1bGF0ZVZvaWNlcygpOiB2b2lkIHtcbiAgICBjb25zdCBzeW50aCA9IHRoaXMuZ2V0U3ludGgoKTtcbiAgICBpZiAoIHN5bnRoICkge1xuXG4gICAgICAvLyB0aGUgYnJvd3NlciBzb21ldGltZXMgcHJvdmlkZXMgZHVwbGljYXRlIHZvaWNlcywgcHJ1bmUgdGhvc2Ugb3V0IG9mIHRoZSBsaXN0XG4gICAgICB0aGlzLnZvaWNlc1Byb3BlcnR5LnZhbHVlID0gXy51bmlxQnkoIHN5bnRoLmdldFZvaWNlcygpLCB2b2ljZSA9PiB2b2ljZS5uYW1lICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgU3BlZWNoU3ludGhlc2lzVm9pY2VzIHRoYXQgYXJlIHNvcnRlZCBzdWNoIHRoYXQgdGhlIGJlc3Qgc291bmRpbmcgdm9pY2VzIGNvbWUgZmlyc3QuXG4gICAqIEFzIG9mIDkvMjcvMjEsIHdlIGZpbmQgdGhhdCB0aGUgXCJHb29nbGVcIiB2b2ljZXMgc291bmQgYmVzdCB3aGlsZSBBcHBsZSdzIFwiRnJlZFwiIHNvdW5kcyB0aGUgd29yc3Qgc28gdGhlIGxpc3RcbiAgICogd2lsbCBiZSBvcmRlcmVkIHRvIHJlZmxlY3QgdGhhdC4gVGhpcyB3YXkgXCJHb29nbGVcIiB2b2ljZXMgd2lsbCBiZSBzZWxlY3RlZCBieSBkZWZhdWx0IHdoZW4gYXZhaWxhYmxlIGFuZCBcIkZyZWRcIlxuICAgKiB3aWxsIGFsbW9zdCBuZXZlciBiZSB0aGUgZGVmYXVsdCBWb2ljZSBzaW5jZSBpdCBpcyBsYXN0IGluIHRoZSBsaXN0LiBTZWVcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEyODIvIGZvciBkaXNjdXNzaW9uIGFuZCB0aGlzIGRlY2lzaW9uLlxuICAgKi9cbiAgcHVibGljIGdldFByaW9yaXRpemVkVm9pY2VzKCk6IFNwZWVjaFN5bnRoZXNpc1ZvaWNlW10ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaW5pdGlhbGl6ZWQsICdObyB2b2ljZXMgYXZhaWxhYmxlIHVudGlsIHRoZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgaXMgaW5pdGlhbGl6ZWQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy52b2ljZXNQcm9wZXJ0eS52YWx1ZS5sZW5ndGggPiAwLCAnTm8gdm9pY2VzIGF2YWlsYWJsZSB0byBwcm92aWRlZCBhIHByaW9yaXRpemVkIGxpc3QuJyApO1xuXG4gICAgY29uc3QgYWxsVm9pY2VzID0gdGhpcy52b2ljZXNQcm9wZXJ0eS52YWx1ZS5zbGljZSgpO1xuXG4gICAgLy8gZXhjbHVkZSBcIm5vdmVsdHlcIiB2b2ljZXMgdGhhdCBhcmUgaW5jbHVkZWQgYnkgdGhlIG9wZXJhdGluZyBzeXN0ZW0gYnV0IG1hcmtlZCBhcyBFbmdsaXNoLlxuICAgIC8vIGNvbnN0IHZvaWNlc1dpdGhvdXROb3ZlbHR5ID0gXy5maWx0ZXIoIGFsbFZvaWNlcywgdm9pY2UgPT4gIU5PVkVMVFlfVk9JQ0VTLmluY2x1ZGVzKCB2b2ljZS5uYW1lICkgKTtcbiAgICBjb25zdCB2b2ljZXNXaXRob3V0Tm92ZWx0eSA9IF8uZmlsdGVyKCBhbGxWb2ljZXMsIHZvaWNlID0+IHtcblxuICAgICAgLy8gUmVtb3ZlIHRoZSB2b2ljZSBpZiB0aGUgU3BlZWNoU3ludGhlc2lzVm9pY2UubmFtZSBpbmNsdWRlcyBhIHN1YnN0cmluZyBvZiB0aGUgZW50cnkgaW4gb3VyIGxpc3QgKHRoZSBicm93c2VyXG4gICAgICAvLyBtaWdodCBpbmNsdWRlIG1vcmUgaW5mb3JtYXRpb24gaW4gdGhlIG5hbWUgdGhhbiB3ZSBtYWludGFpbiwgbGlrZSBsb2NhbGUgaW5mbyBvciBzb21ldGhpbmcgZWxzZSkuXG4gICAgICByZXR1cm4gIV8uc29tZSggTk9WRUxUWV9WT0lDRVMsIG5vdmVsdHlWb2ljZSA9PiB2b2ljZS5uYW1lLmluY2x1ZGVzKCBub3ZlbHR5Vm9pY2UgKSApO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IGdldEluZGV4ID0gKCB2b2ljZTogU3BlZWNoU3ludGhlc2lzVm9pY2UgKSA9PlxuICAgICAgdm9pY2UubmFtZS5pbmNsdWRlcyggJ0dvb2dsZScgKSA/IC0xIDogLy8gR29vZ2xlIHNob3VsZCBtb3ZlIHRvd2FyZCB0aGUgZnJvbnRcbiAgICAgIHZvaWNlLm5hbWUuaW5jbHVkZXMoICdGcmVkJyApID8gdm9pY2VzV2l0aG91dE5vdmVsdHkubGVuZ3RoIDogLy8gRnJlZCBzaG91bGQgbW92ZSB0b3dhcmQgdGhlIGJhY2tcbiAgICAgIHZvaWNlc1dpdGhvdXROb3ZlbHR5LmluZGV4T2YoIHZvaWNlICk7IC8vIE90aGVyd2lzZSBwcmVzZXJ2ZSBvcmRlcmluZ1xuXG4gICAgcmV0dXJuIHZvaWNlc1dpdGhvdXROb3ZlbHR5LnNvcnQoICggYSwgYiApID0+IGdldEluZGV4KCBhICkgLSBnZXRJbmRleCggYiApICk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBWb2ljaW5nIGFzIGEgZmVhdHVyZSBpcyBub3QgdHJhbnNsYXRhYmxlLiBUaGlzIGZ1bmN0aW9uIGdldHMgdGhlIFwicHJpb3JpdGl6ZWRcIiB2b2ljZXMgKGFzIGRlY2lkZWQgYnkgUGhFVCkgYW5kXG4gICAqIHBydW5lcyBvdXQgdGhlIG5vbi1lbmdsaXNoIG9uZXMuIFRoaXMgZG9lcyBub3QgdXNlIHRoaXMuZ2V0UHJpb3JpdGl6ZWRWb2ljZXNGb3JMb2NhbGUgYmVjYXVzZSB0aGUgcmVxdWlyZWQgTG9jYWxlXG4gICAqIHR5cGUgZG9lc24ndCBpbmNsdWRlICdlbi1VUycgb3IgJ2VuX1VTJyBhcyB2YWxpZCB2YWx1ZXMsIGp1c3QgJ2VuJy5cbiAgICovXG4gIHB1YmxpYyBnZXRFbmdsaXNoUHJpb3JpdGl6ZWRWb2ljZXMoKTogU3BlZWNoU3ludGhlc2lzVm9pY2VbXSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKCB0aGlzLmdldFByaW9yaXRpemVkVm9pY2VzKCksIHZvaWNlID0+IHtcblxuICAgICAgLy8gbW9zdCBicm93c2VycyB1c2UgZGFzaGVzIHRvIHNlcGFyYXRlIHRoZSBsb2NhbCwgQW5kcm9pZCB1c2VzIHVuZGVyc2NvcmUuXG4gICAgICByZXR1cm4gdm9pY2UubGFuZyA9PT0gJ2VuLVVTJyB8fCB2b2ljZS5sYW5nID09PSAnZW5fVVMnO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWb2ljaW5nIGFzIGEgZmVhdHVyZSBpcyBub3QgdHJhbnNsYXRhYmxlLCBidXQgc29tZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgdXNhZ2VzIG91dHNpZGUgb2Ygdm9pY2luZyBhcmUuIFRoaXNcbiAgICogZnVuY3Rpb24gZ2V0cyB0aGUgXCJwcmlvcml0aXplZFwiIHZvaWNlcyAoYXMgZGVjaWRlZCBieSBQaEVUKSBhbmRcbiAgICogcHJ1bmVzIG91dCBldmVyeXRoaW5nIHRoYXQgaXMgbm90IHRoZSBcInByb3ZpZGVkXCIgbG9jYWxlLiBUaGUgYWxnb3JpdGhtIGZvciBtYXBwaW5nIGxvY2FsZSBpcyBhcyBmb2xsb3dzOlxuICAgKlxuICAgKiBsb2NhbGU6ICdlbicgLSBQcm92aWRlZCBsb2NhbGUgcGFyYW1ldGVyXG4gICAqIHZvaWNlOiAnZW5fR0InIC0gWUVTIG1hdGNoZXMhXG4gICAqIHZvaWNlOiAnZW4nIC0gWUVTXG4gICAqXG4gICAqIGxvY2FsZTogJ2VuX0dCJ1xuICAgKiB2b2ljZTogJ2VuJyAtIE5PXG4gICAqIHZvaWNlOiAnZW5fR0InIC0gWUVTXG4gICAqIHZvaWNlOiAnZW4tR0InIC0gWUVTXG4gICAqIHZvaWNlOiAnZW4tVVMnIC0gTk9cbiAgICpcbiAgICogbG9jYWxlOiAnemhfQ04nXG4gICAqIHZvaWNlOiAnemgnIC0gTk9cbiAgICogdm9pY2U6ICd6aF9DTicgLSBZRVNcbiAgICpcbiAgICogbG9jYWxlOiAnemgnXG4gICAqIHZvaWNlOiAnemgnIC0gWUVTXG4gICAqIHZvaWNlOiAnemhfQ04nIC0gWUVTXG4gICAqIHZvaWNlOiAnemgtVFcnIC0gWUVTXG4gICAqXG4gICAqIGxvY2FsZTogJ2VzX0VTJ1xuICAgKiB2b2ljZTogJ2VzX01YJyAtIE5PXG4gICAqIHZvaWNlOiAnZXMnIC0gTk9cbiAgICogdm9pY2U6ICdlcy1FUycgLSBZRVNcbiAgICovXG4gIHB1YmxpYyBnZXRQcmlvcml0aXplZFZvaWNlc0ZvckxvY2FsZSggbG9jYWxlOiBMb2NhbGUgKTogU3BlZWNoU3ludGhlc2lzVm9pY2VbXSB7XG5cbiAgICAvLyBGb3VyIGxldHRlciBsb2NhbGVzIG9mIHR5cGUgTG9jYWxlIGluY2x1ZGUgYW4gdW5kZXJzY29yZSBiZXR3ZWVuIHRoZSBsYW5ndWFnZSBhbmQgdGhlIHJlZ2lvbi4gTW9zdCBicm93c2VyIHZvaWNlXG4gICAgLy8gbmFtZXMgdXNlIGEgZGFzaCBpbnN0ZWFkIG9mIGFuIHVuZGVyc2NvcmUsIHNvIHdlIG5lZWQgdG8gY3JlYXRlIGEgdmVyc2lvbiBvZiB0aGUgbG9jYWxlIHdpdGggZGFzaGVzLlxuICAgIGNvbnN0IHVuZGVyc2NvcmVMb2NhbGUgPSBsb2NhbGU7XG4gICAgY29uc3QgZGFzaExvY2FsZSA9IGxvY2FsZS5yZXBsYWNlKCAnXycsICctJyApO1xuXG4gICAgcmV0dXJuIF8uZmlsdGVyKCB0aGlzLmdldFByaW9yaXRpemVkVm9pY2VzKCksIHZvaWNlID0+IHtcblxuICAgICAgLy8gSGFuZGxlIHVuc3VwcG9ydGVkIGxvY2FsZSBtYXBwaW5nIGhlcmUsIHNlZSB2b2ljZUxhbmdUb1N1cHBvcnRlZExvY2FsZSBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL251bWJlci1wbGF5L2lzc3Vlcy8yMzAuXG4gICAgICBjb25zdCB2b2ljZUxhbmcgPSB2b2ljZUxhbmdUb1N1cHBvcnRlZExvY2FsZS5oYXNPd25Qcm9wZXJ0eSggdm9pY2UubGFuZyApID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWNlTGFuZ1RvU3VwcG9ydGVkTG9jYWxlWyB2b2ljZS5sYW5nIF0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgdm9pY2UubGFuZztcblxuICAgICAgbGV0IG1hdGNoZXNTaG9ydExvY2FsZSA9IGZhbHNlO1xuICAgICAgaWYgKCB2b2ljZUxhbmcuaW5jbHVkZXMoICdfJyApIHx8IHZvaWNlTGFuZy5pbmNsdWRlcyggJy0nICkgKSB7XG5cbiAgICAgICAgLy8gTWFwcGluZyB6aF9DTiBvciB6aC1DTiAtPiB6aFxuICAgICAgICBtYXRjaGVzU2hvcnRMb2NhbGUgPSB1bmRlcnNjb3JlTG9jYWxlID09PSB2b2ljZUxhbmcuc2xpY2UoIDAsIDIgKTtcbiAgICAgIH1cblxuICAgICAgLy8gd2hpbGUgbW9zdCBicm93c2VycyB1c2UgZGFzaGVzIHRvIHNlcGFyYXRlIHRoZSBsb2NhbCwgQW5kcm9pZCB1c2VzIHVuZGVyc2NvcmUsIHNvIGNvbXBhcmUgYm90aCB0eXBlcy4gTG9vc2VseVxuICAgICAgLy8gY29tcGFyZSB3aXRoIGluY2x1ZGVzKCkgc28gYWxsIGNvdW50cnktc3BlY2lmaWMgdm9pY2VzIGFyZSBhdmFpbGFibGUgZm9yIHR3by1sZXR0ZXIgTG9jYWxlIGNvZGVzLlxuICAgICAgcmV0dXJuIG1hdGNoZXNTaG9ydExvY2FsZSB8fCB1bmRlcnNjb3JlTG9jYWxlID09PSB2b2ljZUxhbmcgfHwgZGFzaExvY2FsZSA9PT0gdm9pY2VMYW5nO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRzIGFubm91bmNlIHNvIHRoZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgY2FuIGJlIGEgc291cmNlIG9mIG91dHB1dCBmb3IgdXR0ZXJhbmNlUXVldWUuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgYW5ub3VuY2UoIGFubm91bmNlVGV4dDogUmVzb2x2ZWRSZXNwb25zZSwgdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmluaXRpYWxpemVkICYmIHRoaXMuY2FuU3BlYWtQcm9wZXJ0eSAmJiB0aGlzLmNhblNwZWFrUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB0aGlzLnJlcXVlc3RTcGVlY2goIGFubm91bmNlVGV4dCwgdXR0ZXJhbmNlICk7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBUaGUgYW5ub3VuY2VyIGlzIG5vdCBnb2luZyB0byBhbm5vdW5jZSB0aGlzIHV0dGVyYW5jZSwgc2lnbmlmeSB0aGF0IHdlIGFyZSBkb25lIHdpdGggaXQuXG4gICAgICB0aGlzLmhhbmRsZUFubm91bmNlbWVudEZhaWx1cmUoIHV0dGVyYW5jZSwgYW5ub3VuY2VUZXh0ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBhbm5vdW5jZW1lbnQgb2YgdGhpcyB1dHRlcmFuY2UgaGFzIGZhaWxlZCBpbiBzb21lIHdheSwgc2lnbmlmeSB0byBjbGllbnRzIG9mIHRoaXMgYW5ub3VuY2VyIHRoYXQgdGhlIHV0dGVyYW5jZVxuICAgKiB3aWxsIG5ldmVyIGNvbXBsZXRlLiBGb3IgZXhhbXBsZSBzdGFydC9lbmQgZXZlbnRzIG9uIHRoZSBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2Ugd2lsbCBuZXZlciBmaXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVBbm5vdW5jZW1lbnRGYWlsdXJlKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSwgYW5ub3VuY2VUZXh0OiBSZXNvbHZlZFJlc3BvbnNlICk6IHZvaWQge1xuICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdhbm5vdW5jZW1lbnQgZmFpbHVyZScsIGFubm91bmNlVGV4dCApO1xuICAgIHRoaXMuYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyLmVtaXQoIHV0dGVyYW5jZSwgYW5ub3VuY2VUZXh0ICk7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHNwZWVjaCBzeW50aGVzaXMgdG8gc3BlYWsgYW4gdXR0ZXJhbmNlLiBOby1vcCB1bmxlc3MgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIGlzIGluaXRpYWxpemVkIGFuZCBvdGhlciBvdXRwdXRcbiAgICogY29udHJvbGxpbmcgUHJvcGVydGllcyBhcmUgdHJ1ZSAoc2VlIHNwZWVjaEFsbG93ZWRQcm9wZXJ0eSBpbiBpbml0aWFsaXplKCkpLiBUaGlzIGV4cGxpY2l0bHkgaWdub3Jlc1xuICAgKiB0aGlzLmVuYWJsZWRQcm9wZXJ0eSwgYWxsb3dpbmcgc3BlZWNoIGV2ZW4gd2hlbiBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgaXMgZGlzYWJsZWQuIFRoaXMgaXMgdXNlZnVsIGluIHJhcmUgY2FzZXMsIGZvclxuICAgKiBleGFtcGxlIHdoZW4gdGhlIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciByZWNlbnRseSBiZWNvbWVzIGRpc2FibGVkIGJ5IHRoZSB1c2VyIGFuZCB3ZSBuZWVkIHRvIGFubm91bmNlIGNvbmZpcm1hdGlvbiBvZlxuICAgKiB0aGF0IGRlY2lzaW9uIChcIlZvaWNpbmcgb2ZmXCIgb3IgXCJBbGwgYXVkaW8gb2ZmXCIpLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIHdpbGwgaW50ZXJydXB0IGFueSBjdXJyZW50bHkgc3BlYWtpbmcgdXR0ZXJhbmNlLlxuICAgKi9cbiAgcHVibGljIHNwZWFrSWdub3JpbmdFbmFibGVkKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuaW5pdGlhbGl6ZWQgKSB7XG4gICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgdGhpcy5yZXF1ZXN0U3BlZWNoKCB1dHRlcmFuY2UuZ2V0QWxlcnRUZXh0KCB0aGlzLnJlc3BlY3RSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXMgKSwgdXR0ZXJhbmNlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3Qgc3BlZWNoIHdpdGggU3BlZWNoU3ludGhlc2lzLlxuICAgKi9cbiAgcHJpdmF0ZSByZXF1ZXN0U3BlZWNoKCBhbm5vdW5jZVRleHQ6IFJlc29sdmVkUmVzcG9uc2UsIHV0dGVyYW5jZTogVXR0ZXJhbmNlICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlci5pc1NwZWVjaFN5bnRoZXNpc1N1cHBvcnRlZCgpLCAndHJ5aW5nIHRvIHNwZWFrIHdpdGggc3BlZWNoU3ludGhlc2lzLCBidXQgaXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGlzIHBsYXRmb3JtJyApO1xuXG4gICAgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmxvZyggJ3JlcXVlc3RTcGVlY2gnLCBhbm5vdW5jZVRleHQgKTtcblxuICAgIC8vIElmIHRoZSB1dHRlcmFuY2UgdGV4dCBpcyBudWxsLCB0aGVuIG9wdCBvdXQgZWFybHlcbiAgICBpZiAoICFhbm5vdW5jZVRleHQgKSB7XG4gICAgICB0aGlzLmhhbmRsZUFubm91bmNlbWVudEZhaWx1cmUoIHV0dGVyYW5jZSwgYW5ub3VuY2VUZXh0ICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVXR0ZXJhbmNlLmFubm91bmNlck9wdGlvbnMgbXVzdCBiZSBtb3JlIGdlbmVyYWwgdG8gYWxsb3cgdGhpcyB0eXBlIHRvIGFwcGx5IHRvIGFueSBpbXBsZW1lbnRhdGlvbiBvZiBBbm5vdW5jZXIsIHRodXMgXCJPYmplY3RcIiBhcyB0aGUgcHJvdmlkZWQgb3B0aW9ucy5cbiAgICBjb25zdCB1dHRlcmFuY2VPcHRpb25zID0gb3B0aW9uaXplMzxTcGVlY2hTeW50aGVzaXNBbm5vdW5jZU9wdGlvbnMsIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlT3B0aW9ucz4oKShcbiAgICAgIHt9LCBVVFRFUkFOQ0VfT1BUSU9OX0RFRkFVTFRTLCB1dHRlcmFuY2UuYW5ub3VuY2VyT3B0aW9uc1xuICAgICk7XG5cbiAgICAvLyBlbWJlZGRpbmcgbWFya3MgKGZvciBpMThuKSBpbXBhY3QgdGhlIG91dHB1dCwgc3RyaXAgYmVmb3JlIHNwZWFraW5nLCB0eXBlIGNhc3QgbnVtYmVyIHRvIHN0cmluZyBpZiBhcHBsaWNhYmxlIChmb3IgbnVtYmVyKVxuICAgIGNvbnN0IHN0cmluZ1RvU3BlYWsgPSByZW1vdmVCclRhZ3MoIHN0cmlwRW1iZWRkaW5nTWFya3MoIGFubm91bmNlVGV4dCArICcnICkgKTtcblxuICAgIC8vIERpc2FsbG93IGFueSB1bmZpbGxlZCB0ZW1wbGF0ZSB2YXJpYWJsZXMgdG8gYmUgc2V0IGluIHRoZSBQRE9NLlxuICAgIHZhbGlkYXRlKCBzdHJpbmdUb1NwZWFrLCBWYWxpZGF0aW9uLlNUUklOR19XSVRIT1VUX1RFTVBMQVRFX1ZBUlNfVkFMSURBVE9SICk7XG5cbiAgICBjb25zdCBzcGVlY2hTeW50aFV0dGVyYW5jZSA9IG5ldyBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UoIHN0cmluZ1RvU3BlYWsgKTtcbiAgICBzcGVlY2hTeW50aFV0dGVyYW5jZS52b2ljZSA9IHV0dGVyYW5jZU9wdGlvbnMudm9pY2UgfHwgdGhpcy52b2ljZVByb3BlcnR5LnZhbHVlO1xuICAgIHNwZWVjaFN5bnRoVXR0ZXJhbmNlLnBpdGNoID0gdGhpcy52b2ljZVBpdGNoUHJvcGVydHkudmFsdWU7XG4gICAgc3BlZWNoU3ludGhVdHRlcmFuY2UucmF0ZSA9IHRoaXMudm9pY2VSYXRlUHJvcGVydHkudmFsdWU7XG4gICAgc3BlZWNoU3ludGhVdHRlcmFuY2Uudm9sdW1lID0gdGhpcy52b2ljZVZvbHVtZVByb3BlcnR5LnZhbHVlO1xuXG4gICAgY29uc3Qgc3RhcnRMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgIHRoaXMuc3RhcnRTcGVha2luZ0VtaXR0ZXIuZW1pdCggc3RyaW5nVG9TcGVhaywgdXR0ZXJhbmNlICk7XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLCAnc2hvdWxkIGhhdmUgYmVlbiBzZXQgaW4gcmVxdWVzdFNwZWVjaCcgKTtcbiAgICAgIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyIS5zdGFydGVkID0gdHJ1ZTtcblxuICAgICAgc3BlZWNoU3ludGhVdHRlcmFuY2UucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3N0YXJ0Jywgc3RhcnRMaXN0ZW5lciApO1xuICAgIH07XG5cbiAgICBjb25zdCBlbmRMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgIHRoaXMuaGFuZGxlU3BlZWNoU3ludGhlc2lzRW5kKCBzdHJpbmdUb1NwZWFrLCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyICk7XG4gICAgfTtcblxuICAgIC8vIEtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSBhbmQgdGhlIHN0YXJ0L2VuZExpc3RlbmVycyBzbyB0aGF0IHdlIGNhbiByZW1vdmUgdGhlbSBsYXRlci5cbiAgICAvLyBOb3RpY2UgdGhpcyBpcyB1c2VkIGluIHRoZSBmdW5jdGlvbiBzY29wZXMgYWJvdmUuXG4gICAgLy8gSU1QT1JUQU5UIE5PVEU6IEFsc28sIHRoaXMgYWN0cyBhcyBhIHdvcmthcm91bmQgZm9yIGEgU2FmYXJpIGJ1ZyB3aGVyZSB0aGUgYGVuZGAgZXZlbnQgZG9lcyBub3QgZmlyZVxuICAgIC8vIGNvbnNpc3RlbnRseS4gSWYgdGhlIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSBpcyBub3QgaW4gbWVtb3J5IHdoZW4gaXQgaXMgdGltZSBmb3IgdGhlIGBlbmRgIGV2ZW50LCBTYWZhcmlcbiAgICAvLyB3aWxsIGZhaWwgdG8gZW1pdCB0aGF0IGV2ZW50LiBTZWVcbiAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMzQ4Mzk5MC9zcGVlY2hzeW50aGVzaXMtYXBpLW9uZW5kLWNhbGxiYWNrLW5vdC13b3JraW5nIGFuZFxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2huLXRyYXZvbHRhZ2UvaXNzdWVzLzQzNSBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3V0dGVyYW5jZS1xdWV1ZS9pc3N1ZXMvNTJcbiAgICBjb25zdCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyID0gbmV3IFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIoIHV0dGVyYW5jZSwgYW5ub3VuY2VUZXh0LCBzcGVlY2hTeW50aFV0dGVyYW5jZSwgZmFsc2UsIGVuZExpc3RlbmVyLCBzdGFydExpc3RlbmVyICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciA9PT0gbnVsbCwgJ1dyYXBwZXIgc2hvdWxkIGJlIG51bGwsIHdlIHNob3VsZCBoYXZlIHJlY2VpdmVkIGFuIGVuZCBldmVudCB0byBjbGVhciBpdCBiZWZvcmUgdGhlIG5leHQgb25lLicgKTtcbiAgICB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciA9IHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXI7XG5cbiAgICBzcGVlY2hTeW50aFV0dGVyYW5jZS5hZGRFdmVudExpc3RlbmVyKCAnc3RhcnQnLCBzdGFydExpc3RlbmVyICk7XG4gICAgc3BlZWNoU3ludGhVdHRlcmFuY2UuYWRkRXZlbnRMaXN0ZW5lciggJ2VuZCcsIGVuZExpc3RlbmVyICk7XG5cbiAgICAvLyBJbiBTYWZhcmkgdGhlIGBlbmRgIGxpc3RlbmVyIGRvZXMgbm90IGZpcmUgY29uc2lzdGVudGx5LCAoZXNwZWNpYWxseSBhZnRlciBjYW5jZWwpXG4gICAgLy8gYnV0IHRoZSBlcnJvciBldmVudCBkb2VzLiBJbiB0aGlzIGNhc2Ugc2lnbmlmeSB0aGF0IHNwZWFraW5nIGhhcyBlbmRlZC5cbiAgICBzcGVlY2hTeW50aFV0dGVyYW5jZS5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCBlbmRMaXN0ZW5lciApO1xuXG4gICAgLy8gU2lnbmlmeSB0byB0aGUgdXR0ZXJhbmNlLXF1ZXVlIHRoYXQgd2UgY2Fubm90IHNwZWFrIHlldCB1bnRpbCB0aGlzIHV0dGVyYW5jZSBoYXMgZmluaXNoZWRcbiAgICB0aGlzLnJlYWR5VG9Bbm5vdW5jZSA9IGZhbHNlO1xuXG4gICAgLy8gVGhpcyBpcyBnZW5lcmFsbHkgc2V0IGluIHRoZSBzdGVwIGZ1bmN0aW9uIHdoZW4gdGhlIHN5bnRoIGlzIG5vdCBzcGVha2luZywgYnV0IHRoZXJlIGlzIGEgRmlyZWZveCBpc3N1ZSB3aGVyZVxuICAgIC8vIHRoZSBTcGVlY2hTeW50aGVzaXMuc3BlYWtpbmcgaXMgc2V0IHRvIGB0cnVlYCBhc3luY2hyb25vdXNseS4gU28gd2UgZWFnZXJseSByZXNldCB0aGlzIHRpbWluZyB2YXJpYWJsZSB0b1xuICAgIC8vIHNpZ25pZnkgdGhhdCB3ZSBuZWVkIHRvIHdhaXQgVk9JQ0lOR19VVFRFUkFOQ0VfSU5URVJWQUwgdW50aWwgd2UgYXJlIGFsbG93ZWQgdG8gc3BlYWsgYWdhaW4uXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91dHRlcmFuY2UtcXVldWUvaXNzdWVzLzQwXG4gICAgdGhpcy50aW1lU2luY2VVdHRlcmFuY2VFbmQgPSAwO1xuXG4gICAgLy8gSW50ZXJydXB0IGlmIHRoZSBVdHRlcmFuY2UgY2FuIG5vIGxvbmdlciBiZSBhbm5vdW5jZWQuXG4gICAgdXR0ZXJhbmNlLmNhbkFubm91bmNlUHJvcGVydHkubGluayggdGhpcy5ib3VuZEhhbmRsZUNhbkFubm91bmNlQ2hhbmdlICk7XG4gICAgdXR0ZXJhbmNlLnZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnR5LmxpbmsoIHRoaXMuYm91bmRIYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSApO1xuXG4gICAgdGhpcy5nZXRTeW50aCgpIS5zcGVhayggc3BlZWNoU3ludGhVdHRlcmFuY2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIGEgY2FuQW5ub3VuY2VQcm9wZXJ0eSBjaGFuZ2VzIHRvIGZhbHNlIGZvciBhbiBVdHRlcmFuY2UsIHRoYXQgdXR0ZXJhbmNlIHNob3VsZCBiZSBjYW5jZWxsZWQuXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZUNhbkFubm91bmNlQ2hhbmdlKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIgKSB7XG4gICAgICB0aGlzLmNhbmNlbFV0dGVyYW5jZUlmQ2FuQW5ub3VuY2VGYWxzZSggdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gYSBjYW5Bbm5vdW5jZVByb3BlcnR5IGNoYW5nZXMsIGNhbmNlbCB0aGUgVXR0ZXJhbmNlIGlmIHRoZSB2YWx1ZSBiZWNvbWVzIGZhbHNlLlxuICAgKi9cbiAgcHJpdmF0ZSBjYW5jZWxVdHRlcmFuY2VJZkNhbkFubm91bmNlRmFsc2UoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICk6IHZvaWQge1xuICAgIGlmICggIXV0dGVyYW5jZS5jYW5Bbm5vdW5jZVByb3BlcnR5LnZhbHVlIHx8ICF1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB0aGlzLmNhbmNlbFV0dGVyYW5jZSggdXR0ZXJhbmNlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFsbCB0aGUgd29yayBuZWNlc3Nhcnkgd2hlbiB3ZSBhcmUgZmluaXNoZWQgd2l0aCBhbiB1dHRlcmFuY2UsIGludGVuZGVkIGZvciBlbmQgb3IgY2FuY2VsLlxuICAgKiBFbWl0cyBldmVudHMgc2lnbmlmeWluZyB0aGF0IHdlIGFyZSBkb25lIHdpdGggc3BlZWNoIGFuZCBkb2VzIHNvbWUgZGlzcG9zYWwuXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZVNwZWVjaFN5bnRoZXNpc0VuZCggc3RyaW5nVG9TcGVhazogUmVzb2x2ZWRSZXNwb25zZSwgc3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlcjogU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciApOiB2b2lkIHtcbiAgICB0aGlzLmVuZFNwZWFraW5nRW1pdHRlci5lbWl0KCBzdHJpbmdUb1NwZWFrLCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSApO1xuICAgIHRoaXMuYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyLmVtaXQoIHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlLCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZS50ZXh0ICk7XG5cbiAgICBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLmVuZExpc3RlbmVyICk7XG4gICAgc3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlci5zcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2VuZCcsIHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIuZW5kTGlzdGVuZXIgKTtcbiAgICBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnc3RhcnQnLCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnN0YXJ0TGlzdGVuZXIgKTtcblxuICAgIC8vIFRoZSBlbmRTcGVha2luZ0VtaXR0ZXIgbWF5IGVuZCB1cCBjYWxsaW5nIGhhbmRsZVNwZWVjaFN5bnRoZXNpc0VuZCBpbiBpdHMgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIGJlIGdyYWNlZnVsXG4gICAgY29uc3QgdXR0ZXJhbmNlQ2FuQW5ub3VuY2VQcm9wZXJ0eSA9IHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlLmNhbkFubm91bmNlUHJvcGVydHk7XG4gICAgaWYgKCB1dHRlcmFuY2VDYW5Bbm5vdW5jZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB0aGlzLmJvdW5kSGFuZGxlQ2FuQW5ub3VuY2VDaGFuZ2UgKSApIHtcbiAgICAgIHV0dGVyYW5jZUNhbkFubm91bmNlUHJvcGVydHkudW5saW5rKCB0aGlzLmJvdW5kSGFuZGxlQ2FuQW5ub3VuY2VDaGFuZ2UgKTtcbiAgICB9XG5cbiAgICBjb25zdCB1dHRlcmFuY2VWb2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0eSA9IHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlLnZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnR5O1xuICAgIGlmICggdXR0ZXJhbmNlVm9pY2luZ0NhbkFubm91bmNlUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMuYm91bmRIYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSApICkge1xuICAgICAgdXR0ZXJhbmNlVm9pY2luZ0NhbkFubm91bmNlUHJvcGVydHkudW5saW5rKCB0aGlzLmJvdW5kSGFuZGxlQ2FuQW5ub3VuY2VDaGFuZ2UgKTtcbiAgICB9XG5cbiAgICB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZXMgdG8gdGhlIFNwZWVjaFN5bnRoZXNpcyBvZiB0aGUgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIHRoYXQgaXMgdXNlZCB0byByZXF1ZXN0IHNwZWVjaCB3aXRoIHRoZSBXZWJcbiAgICogU3BlZWNoIEFQSS4gRXZlcnkgcmVmZXJlbmNlcyBoYXMgYSBjaGVjayB0byBlbnN1cmUgdGhhdCB0aGUgc3ludGggaXMgYXZhaWxhYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRTeW50aCgpOiBudWxsIHwgU3BlZWNoU3ludGhlc2lzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIuaXNTcGVlY2hTeW50aGVzaXNTdXBwb3J0ZWQoKSwgJ1RyeWluZyB0byB1c2UgU3BlZWNoU3ludGhlc2lzLCBidXQgaXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGlzIHBsYXRmb3JtLicgKTtcbiAgICByZXR1cm4gdGhpcy5zeW50aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBhbnkgVXR0ZXJhbmNlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGFubm91bmNlZCBvciBpcyAoYWJvdXQgdG8gYmUgYW5ub3VuY2VkKS5cbiAgICogKHV0dGVyYW5jZS1xdWV1ZSBpbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBjYW5jZWwoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmluaXRpYWxpemVkICkge1xuICAgICAgdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIgJiYgdGhpcy5jYW5jZWxVdHRlcmFuY2UoIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYW5jZWwgdGhlIHByb3ZpZGVkIFV0dGVyYW5jZSwgaWYgaXQgaXMgY3VycmVudGx5IGJlaW5nIHNwb2tlbiBieSB0aGlzIEFubm91bmNlci4gRG9lcyBub3QgY2FuY2VsXG4gICAqIGFueSBvdGhlciB1dHRlcmFuY2VzIHRoYXQgbWF5IGJlIGluIHRoZSBVdHRlcmFuY2VRdWV1ZS5cbiAgICogKHV0dGVyYW5jZS1xdWV1ZSBpbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjYW5jZWxVdHRlcmFuY2UoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICk6IHZvaWQge1xuXG4gICAgY29uc3Qgd3JhcHBlciA9IHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyO1xuXG4gICAgaWYgKCB3cmFwcGVyICYmIHV0dGVyYW5jZSA9PT0gd3JhcHBlci51dHRlcmFuY2UgKSB7XG4gICAgICB0aGlzLmhhbmRsZVNwZWVjaFN5bnRoZXNpc0VuZCggd3JhcHBlci5hbm5vdW5jZVRleHQsIHdyYXBwZXIgKTtcblxuICAgICAgLy8gc2lsZW5jZSBhbGwgc3BlZWNoIC0gYWZ0ZXIgaGFuZGxlU3BlZWNoU3ludGhlc2lzRW5kIHNvIHdlIGRvbid0IGRvIHRoYXQgd29yayB0d2ljZSBpbiBjYXNlIGBjYW5jZWxTeW50aGBcbiAgICAgIC8vIGFsc28gdHJpZ2dlcnMgZW5kIGV2ZW50cyBpbW1lZGlhdGVseSAoYnV0IHRoYXQgZG9lc24ndCBoYXBwZW4gb24gYWxsIGJyb3dzZXJzKVxuICAgICAgdGhpcy5jYW5jZWxTeW50aCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBvbmUgdXR0ZXJhbmNlLCBzaG91bGQgaXQgY2FuY2VsIGFub3RoZXIgcHJvdmlkZWQgdXR0ZXJhbmNlP1xuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIHNob3VsZFV0dGVyYW5jZUNhbmNlbE90aGVyKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSwgdXR0ZXJhbmNlVG9DYW5jZWw6IFV0dGVyYW5jZSApOiBib29sZWFuIHtcblxuICAgIC8vIFV0dGVyYW5jZS5hbm5vdW5jZXJPcHRpb25zIG11c3QgYmUgbW9yZSBnZW5lcmFsIHRvIGFsbG93IHRoaXMgdHlwZSB0byBhcHBseSB0byBhbnkgaW1wbGVtZW50YXRpb24gb2YgQW5ub3VuY2VyLCB0aHVzIFwiT2JqZWN0XCIgYXMgdGhlIHByb3ZpZGVkIG9wdGlvbnMuXG4gICAgY29uc3QgdXR0ZXJhbmNlT3B0aW9ucyA9IG9wdGlvbml6ZTM8U3BlZWNoU3ludGhlc2lzQW5ub3VuY2VPcHRpb25zLCBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZU9wdGlvbnM+KCkoXG4gICAgICB7fSwgVVRURVJBTkNFX09QVElPTl9ERUZBVUxUUywgdXR0ZXJhbmNlLmFubm91bmNlck9wdGlvbnNcbiAgICApO1xuXG4gICAgbGV0IHNob3VsZENhbmNlbDtcbiAgICBpZiAoIHV0dGVyYW5jZVRvQ2FuY2VsLnByaW9yaXR5UHJvcGVydHkudmFsdWUgIT09IHV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlICkge1xuICAgICAgc2hvdWxkQ2FuY2VsID0gdXR0ZXJhbmNlVG9DYW5jZWwucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA8IHV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNob3VsZENhbmNlbCA9IHV0dGVyYW5jZU9wdGlvbnMuY2FuY2VsT3RoZXI7XG4gICAgICBpZiAoIHV0dGVyYW5jZVRvQ2FuY2VsICYmIHV0dGVyYW5jZVRvQ2FuY2VsID09PSB1dHRlcmFuY2UgKSB7XG4gICAgICAgIHNob3VsZENhbmNlbCA9IHV0dGVyYW5jZU9wdGlvbnMuY2FuY2VsU2VsZjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2hvdWxkQ2FuY2VsO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIHByaW9yaXR5IGZvciBhIG5ldyB1dHRlcmFuY2UgY2hhbmdlcyBvciBpZiBhIG5ldyB1dHRlcmFuY2UgaXMgYWRkZWQgdG8gdGhlIHF1ZXVlLCBkZXRlcm1pbmUgd2hldGhlclxuICAgKiB3ZSBzaG91bGQgY2FuY2VsIHRoZSBzeW50aCBpbW1lZGlhdGVseS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBvblV0dGVyYW5jZVByaW9yaXR5Q2hhbmdlKCBuZXh0QXZhaWxhYmxlVXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogdm9pZCB7XG5cbiAgICAvLyB0ZXN0IGFnYWluc3Qgd2hhdCBpcyBjdXJyZW50bHkgYmVpbmcgc3Bva2VuIGJ5IHRoZSBzeW50aFxuICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlcjtcbiAgICBpZiAoIHdyYXBwZXIgJiYgdGhpcy5zaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciggbmV4dEF2YWlsYWJsZVV0dGVyYW5jZSwgd3JhcHBlci51dHRlcmFuY2UgKSApIHtcbiAgICAgIHRoaXMuY2FuY2VsVXR0ZXJhbmNlKCB3cmFwcGVyLnV0dGVyYW5jZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYW5jZWwgdGhlIHN5bnRoLiBUaGlzIHdpbGwgc2lsZW5jZSBzcGVlY2guIFRoaXMgd2lsbCBzaWxlbmNlIGFueSBzcGVlY2ggYW5kIGNhbmNlbCB0aGVcbiAgICovXG4gIHByaXZhdGUgY2FuY2VsU3ludGgoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pbml0aWFsaXplZCwgJ211c3QgYmUgaW5pdGlhbGl6ZWQgdG8gdXNlIHN5bnRoJyApO1xuICAgIGNvbnN0IHN5bnRoID0gdGhpcy5nZXRTeW50aCgpITtcbiAgICBzeW50aCAmJiBzeW50aC5jYW5jZWwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgU3BlZWNoU3ludGhlc2lzIGlzIGF2YWlsYWJsZSBvbiB0aGUgd2luZG93LiBUaGlzIGNoZWNrIGlzIHN1ZmZpY2llbnQgZm9yIGFsbCBvZlxuICAgKiBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIuIE9uIHBsYXRmb3JtcyB3aGVyZSBzcGVlY2hTeW50aGVzaXMgaXMgYXZhaWxhYmxlLCBhbGwgZmVhdHVyZXMgb2YgaXQgYXJlIGF2YWlsYWJsZSwgZXhjZXB0IGZvciB0aGVcbiAgICogb252b2ljZXNjaGFuZ2VkIGV2ZW50IGluIGEgY291cGxlIG9mIHBsYXRmb3Jtcy4gSG93ZXZlciwgdGhlIGxpc3RlbmVyIGNhbiBzdGlsbCBiZSBzZXRcbiAgICogd2l0aG91dCBpc3N1ZSBvbiB0aG9zZSBwbGF0Zm9ybXMgc28gd2UgZG9uJ3QgbmVlZCB0byBjaGVjayBmb3IgaXRzIGV4aXN0ZW5jZS4gT24gdGhvc2UgcGxhdGZvcm1zLCB2b2ljZXNcbiAgICogYXJlIHByb3ZpZGVkIHJpZ2h0IG9uIGxvYWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGlzU3BlZWNoU3ludGhlc2lzU3VwcG9ydGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXdpbmRvdy5zcGVlY2hTeW50aGVzaXMgJiYgISF3aW5kb3cuU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlO1xuICB9XG59XG5cbi8qKlxuICogQW4gaW5uZXIgY2xhc3MgdGhhdCBjb21iaW5lcyBzb21lIG9iamVjdHMgdGhhdCBhcmUgbmVjZXNzYXJ5IHRvIGtlZXAgdHJhY2sgb2YgdG8gZGlzcG9zZVxuICogU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlcyB3aGVuIGl0IGlzIHRpbWUuIEl0IGlzIGFsc28gdXNlZCBmb3IgdGhlIFwiU2FmYXJpIFdvcmthcm91bmRcIiB0byBrZWVwIGEgcmVmZXJlbmNlXG4gKiBvZiB0aGUgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlIGluIG1lbW9yeSBsb25nIGVub3VnaCBmb3IgdGhlICdlbmQnIGV2ZW50IHRvIGJlIGVtaXR0ZWQuXG4gKi9cbmNsYXNzIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIge1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHB1YmxpYyByZWFkb25seSB1dHRlcmFuY2U6IFV0dGVyYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICBwdWJsaWMgcmVhZG9ubHkgYW5ub3VuY2VUZXh0OiBSZXNvbHZlZFJlc3BvbnNlLFxuICAgICAgICAgICAgICAgICAgICAgIHB1YmxpYyByZWFkb25seSBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2U6IFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICBwdWJsaWMgc3RhcnRlZDogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICBwdWJsaWMgcmVhZG9ubHkgZW5kTGlzdGVuZXI6ICgpID0+IHZvaWQsXG4gICAgICAgICAgICAgICAgICAgICAgcHVibGljIHJlYWRvbmx5IHN0YXJ0TGlzdGVuZXI6ICgpID0+IHZvaWQgKSB7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmUgPGJyPiBvciA8YnIvPiB0YWdzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSBzdHJpbmcgLSBwbGFpbiB0ZXh0IG9yIGh0bWwgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUJyVGFncyggc3RyaW5nOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgcmV0dXJuIHN0cmluZy5zcGxpdCggJzxici8+JyApLmpvaW4oICcgJyApLnNwbGl0KCAnPGJyPicgKS5qb2luKCAnICcgKTtcbn1cblxuY29uc3QgU3BlZWNoU3ludGhlc2lzVm9pY2VJTyA9IG5ldyBJT1R5cGUoICdTcGVlY2hTeW50aGVzaXNWb2ljZUlPJywge1xuICBpc1ZhbGlkVmFsdWU6IHYgPT4gdHJ1ZSwgLy8gU3BlZWNoU3ludGhlc2lzVm9pY2UgaXMgbm90IGF2YWlsYWJsZSBvbiB3aW5kb3dcbiAgdG9TdGF0ZU9iamVjdDogc3BlZWNoU3ludGhlc2lzVm9pY2UgPT4gc3BlZWNoU3ludGhlc2lzVm9pY2UubmFtZVxufSApO1xuXG51dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZS5yZWdpc3RlciggJ1NwZWVjaFN5bnRoZXNpc0Fubm91bmNlcicsIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciApO1xuZXhwb3J0IGRlZmF1bHQgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW5hYmxlZENvbXBvbmVudCIsIk11bHRpbGluayIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJzdGVwVGltZXIiLCJ2YWxpZGF0ZSIsIlZhbGlkYXRpb24iLCJSYW5nZSIsIm9wdGlvbml6ZSIsIm9wdGlvbml6ZTMiLCJwbGF0Zm9ybSIsInN0cmlwRW1iZWRkaW5nTWFya3MiLCJJT1R5cGUiLCJOdWxsYWJsZUlPIiwiQW5ub3VuY2VyIiwiVXR0ZXJhbmNlIiwiU3BlZWNoU3ludGhlc2lzUGFyZW50UG9seWZpbGwiLCJ1dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZSIsIndpbmRvdyIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwic3BlZWNoU3ludGhlc2lzRnJvbVBhcmVudCIsImluaXRpYWxpemUiLCJFTkdJTkVfV0FLRV9JTlRFUlZBTCIsIlBFTkRJTkdfVVRURVJBTkNFX0RFTEFZIiwiUEFVU0VfUkVTVU1FX1dPUktBUk9VTkRfSU5URVJWQUwiLCJWT0lDSU5HX1VUVEVSQU5DRV9JTlRFUlZBTCIsIk5PVkVMVFlfVk9JQ0VTIiwiaW5pdGlhbGl6ZUNvdW50Iiwidm9pY2VMYW5nVG9TdXBwb3J0ZWRMb2NhbGUiLCJjbW4iLCJ5dWUiLCJ5dWVfSEsiLCJmaWxfUEgiLCJVVFRFUkFOQ0VfT1BUSU9OX0RFRkFVTFRTIiwiY2FuY2VsU2VsZiIsImNhbmNlbE90aGVyIiwidm9pY2UiLCJTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIiLCJpbml0aWFsaXplZCIsImlzSW5pdGlhbGl6ZWRQcm9wZXJ0eSIsInZhbHVlIiwidXNlckdlc3R1cmVFbWl0dGVyIiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwiaXNTcGVlY2hTeW50aGVzaXNTdXBwb3J0ZWQiLCJvcHRpb25zIiwic3BlZWNoQWxsb3dlZFByb3BlcnR5Iiwic3ludGgiLCJzcGVlY2hTeW50aGVzaXMiLCJjYW5TcGVha1Byb3BlcnR5IiwiYW5kIiwiZW5hYmxlZFByb3BlcnR5IiwibGluayIsImJvdW5kSGFuZGxlQ2FuU3BlYWtDaGFuZ2UiLCJtdWx0aWxpbmsiLCJ2b2ljaW5nRnVsbHlFbmFibGVkUHJvcGVydHkiLCJzcGVlY2hBbGxvd2VkIiwidm9pY2luZ0Z1bGx5RW5hYmxlZCIsIl9zcGVlY2hBbGxvd2VkQW5kRnVsbHlFbmFibGVkUHJvcGVydHkiLCJnZXRTeW50aCIsImFkZEV2ZW50TGlzdGVuZXIiLCJwb3B1bGF0ZVZvaWNlcyIsInN0YXJ0RW5naW5lTGlzdGVuZXIiLCJ0aW1lU2luY2VXYWtpbmdFbmdpbmUiLCJyZW1vdmVMaXN0ZW5lciIsImFkZExpc3RlbmVyIiwic3RlcCIsImJpbmQiLCJkdCIsImhhc1Nwb2tlbiIsInNwZWFraW5nIiwidGltZVNpbmNlVXR0ZXJhbmNlRW5kIiwidGltZVNpbmNlUGVuZGluZ1V0dGVyYW5jZSIsInNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciIsInN0YXJ0ZWQiLCJoYW5kbGVTcGVlY2hTeW50aGVzaXNFbmQiLCJhbm5vdW5jZVRleHQiLCJjYW5jZWxTeW50aCIsInJlYWR5VG9Bbm5vdW5jZSIsImNocm9taXVtIiwiYW5kcm9pZCIsInZvaWNlUHJvcGVydHkiLCJsb2NhbFNlcnZpY2UiLCJ0aW1lU2luY2VQYXVzZVJlc3VtZSIsInBhdXNlIiwicmVzdW1lIiwiY2hyb21lT1MiLCJzcGVhayIsIlNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSIsImhhbmRsZUNhblNwZWFrQ2hhbmdlIiwiY2FuU3BlYWsiLCJjYW5jZWwiLCJ2b2ljZXNQcm9wZXJ0eSIsIl8iLCJ1bmlxQnkiLCJnZXRWb2ljZXMiLCJuYW1lIiwiZ2V0UHJpb3JpdGl6ZWRWb2ljZXMiLCJsZW5ndGgiLCJhbGxWb2ljZXMiLCJzbGljZSIsInZvaWNlc1dpdGhvdXROb3ZlbHR5IiwiZmlsdGVyIiwic29tZSIsIm5vdmVsdHlWb2ljZSIsImluY2x1ZGVzIiwiZ2V0SW5kZXgiLCJpbmRleE9mIiwic29ydCIsImEiLCJiIiwiZ2V0RW5nbGlzaFByaW9yaXRpemVkVm9pY2VzIiwibGFuZyIsImdldFByaW9yaXRpemVkVm9pY2VzRm9yTG9jYWxlIiwibG9jYWxlIiwidW5kZXJzY29yZUxvY2FsZSIsImRhc2hMb2NhbGUiLCJyZXBsYWNlIiwidm9pY2VMYW5nIiwiaGFzT3duUHJvcGVydHkiLCJtYXRjaGVzU2hvcnRMb2NhbGUiLCJhbm5vdW5jZSIsInV0dGVyYW5jZSIsInJlcXVlc3RTcGVlY2giLCJoYW5kbGVBbm5vdW5jZW1lbnRGYWlsdXJlIiwiZGVidWciLCJjb25zb2xlIiwibG9nIiwiYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyIiwiZW1pdCIsInNwZWFrSWdub3JpbmdFbmFibGVkIiwiZ2V0QWxlcnRUZXh0IiwicmVzcGVjdFJlc3BvbnNlQ29sbGVjdG9yUHJvcGVydGllcyIsInV0dGVyYW5jZU9wdGlvbnMiLCJhbm5vdW5jZXJPcHRpb25zIiwic3RyaW5nVG9TcGVhayIsInJlbW92ZUJyVGFncyIsIlNUUklOR19XSVRIT1VUX1RFTVBMQVRFX1ZBUlNfVkFMSURBVE9SIiwic3BlZWNoU3ludGhVdHRlcmFuY2UiLCJwaXRjaCIsInZvaWNlUGl0Y2hQcm9wZXJ0eSIsInJhdGUiLCJ2b2ljZVJhdGVQcm9wZXJ0eSIsInZvbHVtZSIsInZvaWNlVm9sdW1lUHJvcGVydHkiLCJzdGFydExpc3RlbmVyIiwic3RhcnRTcGVha2luZ0VtaXR0ZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZW5kTGlzdGVuZXIiLCJzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyIiwiU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciIsImNhbkFubm91bmNlUHJvcGVydHkiLCJib3VuZEhhbmRsZUNhbkFubm91bmNlQ2hhbmdlIiwidm9pY2luZ0NhbkFubm91bmNlUHJvcGVydHkiLCJoYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSIsImNhbmNlbFV0dGVyYW5jZUlmQ2FuQW5ub3VuY2VGYWxzZSIsImNhbmNlbFV0dGVyYW5jZSIsImVuZFNwZWFraW5nRW1pdHRlciIsInNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSIsInRleHQiLCJ1dHRlcmFuY2VDYW5Bbm5vdW5jZVByb3BlcnR5IiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJ1dHRlcmFuY2VWb2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0eSIsIndyYXBwZXIiLCJzaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciIsInV0dGVyYW5jZVRvQ2FuY2VsIiwic2hvdWxkQ2FuY2VsIiwicHJpb3JpdHlQcm9wZXJ0eSIsIm9uVXR0ZXJhbmNlUHJpb3JpdHlDaGFuZ2UiLCJuZXh0QXZhaWxhYmxlVXR0ZXJhbmNlIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvVmFsdWVUeXBlIiwiU3BlZWNoU3ludGhlc2lzVm9pY2VJTyIsInBoZXRpb1N0YXRlIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicmFuZ2UiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwiZW5hYmxlZENvbXBvbmVudEltcGxlbWVudGF0aW9uIiwiZW5hYmxlZCIsImVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9GZWF0dXJlZCIsImlzU2V0dGFibGUiLCJtYWluV2luZG93Vm9pY2luZ0VuYWJsZWRQcm9wZXJ0eSIsInNwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eSIsInN0cmluZyIsInNwbGl0Iiwiam9pbiIsImlzVmFsaWRWYWx1ZSIsInYiLCJ0b1N0YXRlT2JqZWN0Iiwic3BlZWNoU3ludGhlc2lzVm9pY2UiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUVELE9BQU9BLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0MscUJBQXFCLG1DQUFtQztBQUMvRCxPQUFPQyxhQUFhLDJCQUEyQjtBQUMvQyxPQUFPQyxzQkFBc0Isb0NBQW9DO0FBQ2pFLE9BQU9DLGVBQWUsNkJBQTZCO0FBQ25ELE9BQU9DLG9CQUFvQixrQ0FBa0M7QUFDN0QsT0FBT0MsY0FBYyw0QkFBNEI7QUFDakQsT0FBT0MsZUFBZSw2QkFBNkI7QUFJbkQsT0FBT0MsY0FBYyw0QkFBNEI7QUFDakQsT0FBT0MsZ0JBQWdCLDhCQUE4QjtBQUNyRCxPQUFPQyxXQUFXLHdCQUF3QjtBQUUxQyxPQUFPQyxhQUFhQyxVQUFVLFFBQTJCLGtDQUFrQztBQUMz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