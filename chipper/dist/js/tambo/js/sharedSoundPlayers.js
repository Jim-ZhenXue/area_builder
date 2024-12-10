// Copyright 2024, University of Colorado Boulder
/**
 * This singleton is used to get instances of shared sound players.  The most common use case for shared sound players
 * is in common UI components that may have multiple instances within a sim, such as checkboxes and buttons. Sharing the
 * sound players between these instances reduces memory consumption and load time versus creating separate instances.
 * It also keeps the sound experience consistent.
 *
 * These shared sound players are automatically added to the soundManager so there is no need for clients to do so.
 *
 * Because these shared sound players are created on the first `get` for a particular one, instances should be gotten
 * well before they need to be played, generally during construction of the view or model element that will need it.
 * Waiting to get an instance until it needs to be played could result in a delayed or muffled first sound being
 * produced.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import { combineOptions } from '../../phet-core/js/optionize.js';
import accordionBoxClose_mp3 from '../sounds/accordionBoxClose_mp3.js';
import accordionBoxOpen_mp3 from '../sounds/accordionBoxOpen_mp3.js';
import boundaryReached_mp3 from '../sounds/boundaryReached_mp3.js';
import checkboxChecked_mp3 from '../sounds/checkboxChecked_mp3.js';
import checkboxUnchecked_mp3 from '../sounds/checkboxUnchecked_mp3.js';
import click_mp3 from '../sounds/click_mp3.js';
import generalBoundaryBoop_mp3 from '../sounds/generalBoundaryBoop_mp3.js';
import generalButton_mp3 from '../sounds/generalButton_mp3.js';
import generalClose_mp3 from '../sounds/generalClose_mp3.js';
import generalOpen_mp3 from '../sounds/generalOpen_mp3.js';
import generalSoftClick_mp3 from '../sounds/generalSoftClick_mp3.js';
import grab_mp3 from '../sounds/grab_mp3.js';
import pause_mp3 from '../sounds/pause_mp3.js';
import playPause_mp3 from '../sounds/playPause_mp3.js';
import release_mp3 from '../sounds/release_mp3.js';
import resetAll_mp3 from '../sounds/resetAll_mp3.js';
import stepBack_mp3 from '../sounds/stepBack_mp3.js';
import stepForward_mp3 from '../sounds/stepForward_mp3.js';
import switchToLeft_mp3 from '../sounds/switchToLeft_mp3.js';
import switchToRight_mp3 from '../sounds/switchToRight_mp3.js';
import SoundClipPlayer from './sound-generators/SoundClipPlayer.js';
import tambo from './tambo.js';
// constants
const DEFAULT_SOUND_CLIP_PLAYER_OPTIONS = {
    soundClipOptions: {
        initialOutputLevel: 0.7
    },
    soundManagerOptions: {
        categoryName: 'user-interface'
    }
};
const DEFAULT_SOUND_CLIP_PLAYER_INFO = {
    wrappedAudioBuffer: resetAll_mp3,
    soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
};
const DEFAULTS_WITH_OUTPUT_LEVEL = (outputLevel)=>{
    return combineOptions({}, DEFAULT_SOUND_CLIP_PLAYER_OPTIONS, {
        soundClipOptions: {
            initialOutputLevel: outputLevel
        }
    });
};
// Map of shared sound player names to SoundClipPlayer instances.  This is initially unpopulated, and the instances are
// created the first time they are requested, which is generally during sim construction time.
const sharedSoundPlayerInstanceMap = new Map();
/**
 * The sharedSoundPlayers object, which implements a `get` method for obtaining shared sound players based on their
 * names.
 */ const sharedSoundPlayers = {
    /**
   * Get the shared sound player for the specified name.  If this shared sound player has not yet been requested, create
   * it, otherwise return the previously created instance.
   */ get (sharedSoundPlayerName) {
        // If it doesn't exist, create it and add it to the set of instances.
        if (!sharedSoundPlayerInstanceMap.has(sharedSoundPlayerName)) {
            // Make sure the definitional information for this sound exists.
            assert && assert(sharedSoundPlayerInfoMap.has(sharedSoundPlayerName), 'no info for this shared sound player');
            const sharedSoundPlayerInfo = sharedSoundPlayerInfoMap.get(sharedSoundPlayerName) || DEFAULT_SOUND_CLIP_PLAYER_INFO;
            // Create the instance and add it to our map.
            sharedSoundPlayerInstanceMap.set(sharedSoundPlayerName, new SoundClipPlayer(sharedSoundPlayerInfo.wrappedAudioBuffer, sharedSoundPlayerInfo.soundClipPlayerOptions));
        }
        return sharedSoundPlayerInstanceMap.get(sharedSoundPlayerName);
    }
};
// Map of shared sound player names to the parameters needed to create them.
const sharedSoundPlayerInfoMap = new Map([
    [
        'accordionBoxClosed',
        {
            wrappedAudioBuffer: accordionBoxClose_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.5)
        }
    ],
    [
        'accordionBoxOpened',
        {
            wrappedAudioBuffer: accordionBoxOpen_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.5)
        }
    ],
    [
        'boundaryReached',
        {
            wrappedAudioBuffer: boundaryReached_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.8)
        }
    ],
    [
        'checkboxChecked',
        {
            wrappedAudioBuffer: checkboxChecked_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'checkboxUnchecked',
        {
            wrappedAudioBuffer: checkboxUnchecked_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'generalBoundaryBoop',
        {
            wrappedAudioBuffer: generalBoundaryBoop_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.2)
        }
    ],
    [
        'generalClose',
        {
            wrappedAudioBuffer: generalClose_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.4)
        }
    ],
    [
        'generalOpen',
        {
            wrappedAudioBuffer: generalOpen_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.4)
        }
    ],
    [
        'generalSoftClick',
        {
            wrappedAudioBuffer: generalSoftClick_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.2)
        }
    ],
    [
        'grab',
        {
            wrappedAudioBuffer: grab_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'pause',
        {
            wrappedAudioBuffer: pause_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'play',
        {
            wrappedAudioBuffer: playPause_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'pushButton',
        {
            wrappedAudioBuffer: generalButton_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.5)
        }
    ],
    [
        'release',
        {
            wrappedAudioBuffer: release_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'resetAll',
        {
            wrappedAudioBuffer: resetAll_mp3,
            soundClipPlayerOptions: {
                soundClipOptions: {
                    initialOutputLevel: 0.39,
                    enabledDuringReset: true,
                    enabledDuringPhetioStateSetting: true
                },
                soundManagerOptions: {
                    categoryName: 'user-interface'
                }
            }
        }
    ],
    [
        'softClick',
        {
            wrappedAudioBuffer: click_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'stepBackward',
        {
            wrappedAudioBuffer: stepBack_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'stepForward',
        {
            wrappedAudioBuffer: stepForward_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'switchToLeft',
        {
            wrappedAudioBuffer: switchToLeft_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.2)
        }
    ],
    [
        'switchToRight',
        {
            wrappedAudioBuffer: switchToRight_mp3,
            soundClipPlayerOptions: DEFAULTS_WITH_OUTPUT_LEVEL(0.2)
        }
    ],
    [
        'toggleOff',
        {
            wrappedAudioBuffer: stepBack_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ],
    [
        'toggleOn',
        {
            wrappedAudioBuffer: stepForward_mp3,
            soundClipPlayerOptions: DEFAULT_SOUND_CLIP_PLAYER_OPTIONS
        }
    ]
]);
tambo.register('sharedSoundPlayers', sharedSoundPlayers);
export default sharedSoundPlayers;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NoYXJlZFNvdW5kUGxheWVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhpcyBzaW5nbGV0b24gaXMgdXNlZCB0byBnZXQgaW5zdGFuY2VzIG9mIHNoYXJlZCBzb3VuZCBwbGF5ZXJzLiAgVGhlIG1vc3QgY29tbW9uIHVzZSBjYXNlIGZvciBzaGFyZWQgc291bmQgcGxheWVyc1xuICogaXMgaW4gY29tbW9uIFVJIGNvbXBvbmVudHMgdGhhdCBtYXkgaGF2ZSBtdWx0aXBsZSBpbnN0YW5jZXMgd2l0aGluIGEgc2ltLCBzdWNoIGFzIGNoZWNrYm94ZXMgYW5kIGJ1dHRvbnMuIFNoYXJpbmcgdGhlXG4gKiBzb3VuZCBwbGF5ZXJzIGJldHdlZW4gdGhlc2UgaW5zdGFuY2VzIHJlZHVjZXMgbWVtb3J5IGNvbnN1bXB0aW9uIGFuZCBsb2FkIHRpbWUgdmVyc3VzIGNyZWF0aW5nIHNlcGFyYXRlIGluc3RhbmNlcy5cbiAqIEl0IGFsc28ga2VlcHMgdGhlIHNvdW5kIGV4cGVyaWVuY2UgY29uc2lzdGVudC5cbiAqXG4gKiBUaGVzZSBzaGFyZWQgc291bmQgcGxheWVycyBhcmUgYXV0b21hdGljYWxseSBhZGRlZCB0byB0aGUgc291bmRNYW5hZ2VyIHNvIHRoZXJlIGlzIG5vIG5lZWQgZm9yIGNsaWVudHMgdG8gZG8gc28uXG4gKlxuICogQmVjYXVzZSB0aGVzZSBzaGFyZWQgc291bmQgcGxheWVycyBhcmUgY3JlYXRlZCBvbiB0aGUgZmlyc3QgYGdldGAgZm9yIGEgcGFydGljdWxhciBvbmUsIGluc3RhbmNlcyBzaG91bGQgYmUgZ290dGVuXG4gKiB3ZWxsIGJlZm9yZSB0aGV5IG5lZWQgdG8gYmUgcGxheWVkLCBnZW5lcmFsbHkgZHVyaW5nIGNvbnN0cnVjdGlvbiBvZiB0aGUgdmlldyBvciBtb2RlbCBlbGVtZW50IHRoYXQgd2lsbCBuZWVkIGl0LlxuICogV2FpdGluZyB0byBnZXQgYW4gaW5zdGFuY2UgdW50aWwgaXQgbmVlZHMgdG8gYmUgcGxheWVkIGNvdWxkIHJlc3VsdCBpbiBhIGRlbGF5ZWQgb3IgbXVmZmxlZCBmaXJzdCBzb3VuZCBiZWluZ1xuICogcHJvZHVjZWQuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IGFjY29yZGlvbkJveENsb3NlX21wMyBmcm9tICcuLi9zb3VuZHMvYWNjb3JkaW9uQm94Q2xvc2VfbXAzLmpzJztcbmltcG9ydCBhY2NvcmRpb25Cb3hPcGVuX21wMyBmcm9tICcuLi9zb3VuZHMvYWNjb3JkaW9uQm94T3Blbl9tcDMuanMnO1xuaW1wb3J0IGJvdW5kYXJ5UmVhY2hlZF9tcDMgZnJvbSAnLi4vc291bmRzL2JvdW5kYXJ5UmVhY2hlZF9tcDMuanMnO1xuaW1wb3J0IGNoZWNrYm94Q2hlY2tlZF9tcDMgZnJvbSAnLi4vc291bmRzL2NoZWNrYm94Q2hlY2tlZF9tcDMuanMnO1xuaW1wb3J0IGNoZWNrYm94VW5jaGVja2VkX21wMyBmcm9tICcuLi9zb3VuZHMvY2hlY2tib3hVbmNoZWNrZWRfbXAzLmpzJztcbmltcG9ydCBjbGlja19tcDMgZnJvbSAnLi4vc291bmRzL2NsaWNrX21wMy5qcyc7XG5pbXBvcnQgZ2VuZXJhbEJvdW5kYXJ5Qm9vcF9tcDMgZnJvbSAnLi4vc291bmRzL2dlbmVyYWxCb3VuZGFyeUJvb3BfbXAzLmpzJztcbmltcG9ydCBnZW5lcmFsQnV0dG9uX21wMyBmcm9tICcuLi9zb3VuZHMvZ2VuZXJhbEJ1dHRvbl9tcDMuanMnO1xuaW1wb3J0IGdlbmVyYWxDbG9zZV9tcDMgZnJvbSAnLi4vc291bmRzL2dlbmVyYWxDbG9zZV9tcDMuanMnO1xuaW1wb3J0IGdlbmVyYWxPcGVuX21wMyBmcm9tICcuLi9zb3VuZHMvZ2VuZXJhbE9wZW5fbXAzLmpzJztcbmltcG9ydCBnZW5lcmFsU29mdENsaWNrX21wMyBmcm9tICcuLi9zb3VuZHMvZ2VuZXJhbFNvZnRDbGlja19tcDMuanMnO1xuaW1wb3J0IGdyYWJfbXAzIGZyb20gJy4uL3NvdW5kcy9ncmFiX21wMy5qcyc7XG5pbXBvcnQgcGF1c2VfbXAzIGZyb20gJy4uL3NvdW5kcy9wYXVzZV9tcDMuanMnO1xuaW1wb3J0IHBsYXlQYXVzZV9tcDMgZnJvbSAnLi4vc291bmRzL3BsYXlQYXVzZV9tcDMuanMnO1xuaW1wb3J0IHJlbGVhc2VfbXAzIGZyb20gJy4uL3NvdW5kcy9yZWxlYXNlX21wMy5qcyc7XG5pbXBvcnQgcmVzZXRBbGxfbXAzIGZyb20gJy4uL3NvdW5kcy9yZXNldEFsbF9tcDMuanMnO1xuaW1wb3J0IHN0ZXBCYWNrX21wMyBmcm9tICcuLi9zb3VuZHMvc3RlcEJhY2tfbXAzLmpzJztcbmltcG9ydCBzdGVwRm9yd2FyZF9tcDMgZnJvbSAnLi4vc291bmRzL3N0ZXBGb3J3YXJkX21wMy5qcyc7XG5pbXBvcnQgc3dpdGNoVG9MZWZ0X21wMyBmcm9tICcuLi9zb3VuZHMvc3dpdGNoVG9MZWZ0X21wMy5qcyc7XG5pbXBvcnQgc3dpdGNoVG9SaWdodF9tcDMgZnJvbSAnLi4vc291bmRzL3N3aXRjaFRvUmlnaHRfbXAzLmpzJztcbmltcG9ydCBTb3VuZENsaXBQbGF5ZXIsIHsgU291bmRDbGlwUGxheWVyT3B0aW9ucyB9IGZyb20gJy4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXBQbGF5ZXIuanMnO1xuaW1wb3J0IHRhbWJvIGZyb20gJy4vdGFtYm8uanMnO1xuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuL1RTb3VuZFBsYXllci5qcyc7XG5pbXBvcnQgV3JhcHBlZEF1ZGlvQnVmZmVyIGZyb20gJy4vV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcblxuLy8gQSBsaXN0IG9mIGFsbCB0aGUgYXZhaWxhYmxlIHNoYXJlZCBzb3VuZCBwbGF5ZXJzIGFzIGEgc3RyaW5nIHVuaW9uIHR5cGUuICBVc2UgdGhlc2UgdmFsdWVzIHRvIGdldCBhIHNoYXJlZCBwbGF5ZXIuXG5leHBvcnQgdHlwZSBTaGFyZWRTb3VuZFBsYXllck5hbWUgPVxuICAnYWNjb3JkaW9uQm94Q2xvc2VkJyB8XG4gICdhY2NvcmRpb25Cb3hPcGVuZWQnIHxcbiAgJ2JvdW5kYXJ5UmVhY2hlZCcgfFxuICAnY2hlY2tib3hDaGVja2VkJyB8XG4gICdjaGVja2JveFVuY2hlY2tlZCcgfFxuICAnZ2VuZXJhbEJvdW5kYXJ5Qm9vcCcgfFxuICAnZ2VuZXJhbENsb3NlJyB8XG4gICdnZW5lcmFsT3BlbicgfFxuICAnZ2VuZXJhbFNvZnRDbGljaycgfFxuICAnZ3JhYicgfFxuICAncGF1c2UnIHxcbiAgJ3BsYXknIHxcbiAgJ3B1c2hCdXR0b24nIHxcbiAgJ3JlbGVhc2UnIHxcbiAgJ3Jlc2V0QWxsJyB8XG4gICdzb2Z0Q2xpY2snIHxcbiAgJ3N0ZXBCYWNrd2FyZCcgfFxuICAnc3RlcEZvcndhcmQnIHxcbiAgJ3N3aXRjaFRvTGVmdCcgfFxuICAnc3dpdGNoVG9SaWdodCcgfFxuICAndG9nZ2xlT2ZmJyB8XG4gICd0b2dnbGVPbic7XG5cbnR5cGUgU291bmRDbGlwUGxheWVySW5mbyA9IHtcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBXcmFwcGVkQXVkaW9CdWZmZXI7XG4gIHNvdW5kQ2xpcFBsYXllck9wdGlvbnM6IFNvdW5kQ2xpcFBsYXllck9wdGlvbnM7XG59O1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IERFRkFVTFRfU09VTkRfQ0xJUF9QTEFZRVJfT1BUSU9OUzogU291bmRDbGlwUGxheWVyT3B0aW9ucyA9IHtcbiAgc291bmRDbGlwT3B0aW9uczoge1xuICAgIGluaXRpYWxPdXRwdXRMZXZlbDogMC43XG4gIH0sXG4gIHNvdW5kTWFuYWdlck9wdGlvbnM6IHsgY2F0ZWdvcnlOYW1lOiAndXNlci1pbnRlcmZhY2UnIH1cbn07XG5jb25zdCBERUZBVUxUX1NPVU5EX0NMSVBfUExBWUVSX0lORk86IFNvdW5kQ2xpcFBsYXllckluZm8gPSB7XG4gIHdyYXBwZWRBdWRpb0J1ZmZlcjogcmVzZXRBbGxfbXAzLCAvLyBkZWZhdWx0IGZvciB1bmRlZmluZWQgc291bmRzLCBzaW5jZSBpdCB3aWxsIHN0YW5kIG91dCBhcyBiZWluZyB3cm9uZ1xuICBzb3VuZENsaXBQbGF5ZXJPcHRpb25zOiBERUZBVUxUX1NPVU5EX0NMSVBfUExBWUVSX09QVElPTlNcbn07XG5jb25zdCBERUZBVUxUU19XSVRIX09VVFBVVF9MRVZFTCA9ICggb3V0cHV0TGV2ZWw6IG51bWJlciApOiBTb3VuZENsaXBQbGF5ZXJPcHRpb25zID0+IHtcbiAgcmV0dXJuIGNvbWJpbmVPcHRpb25zPFNvdW5kQ2xpcFBsYXllck9wdGlvbnM+KCB7fSwgREVGQVVMVF9TT1VORF9DTElQX1BMQVlFUl9PUFRJT05TLCB7XG4gICAgc291bmRDbGlwT3B0aW9uczoge1xuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiBvdXRwdXRMZXZlbFxuICAgIH1cbiAgfSApO1xufTtcblxuLy8gTWFwIG9mIHNoYXJlZCBzb3VuZCBwbGF5ZXIgbmFtZXMgdG8gU291bmRDbGlwUGxheWVyIGluc3RhbmNlcy4gIFRoaXMgaXMgaW5pdGlhbGx5IHVucG9wdWxhdGVkLCBhbmQgdGhlIGluc3RhbmNlcyBhcmVcbi8vIGNyZWF0ZWQgdGhlIGZpcnN0IHRpbWUgdGhleSBhcmUgcmVxdWVzdGVkLCB3aGljaCBpcyBnZW5lcmFsbHkgZHVyaW5nIHNpbSBjb25zdHJ1Y3Rpb24gdGltZS5cbmNvbnN0IHNoYXJlZFNvdW5kUGxheWVySW5zdGFuY2VNYXA6IE1hcDxTaGFyZWRTb3VuZFBsYXllck5hbWUsIFNvdW5kQ2xpcFBsYXllcj4gPVxuICBuZXcgTWFwPFNoYXJlZFNvdW5kUGxheWVyTmFtZSwgU291bmRDbGlwUGxheWVyPigpO1xuXG4vKipcbiAqIFRoZSBzaGFyZWRTb3VuZFBsYXllcnMgb2JqZWN0LCB3aGljaCBpbXBsZW1lbnRzIGEgYGdldGAgbWV0aG9kIGZvciBvYnRhaW5pbmcgc2hhcmVkIHNvdW5kIHBsYXllcnMgYmFzZWQgb24gdGhlaXJcbiAqIG5hbWVzLlxuICovXG5jb25zdCBzaGFyZWRTb3VuZFBsYXllcnMgPSB7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc2hhcmVkIHNvdW5kIHBsYXllciBmb3IgdGhlIHNwZWNpZmllZCBuYW1lLiAgSWYgdGhpcyBzaGFyZWQgc291bmQgcGxheWVyIGhhcyBub3QgeWV0IGJlZW4gcmVxdWVzdGVkLCBjcmVhdGVcbiAgICogaXQsIG90aGVyd2lzZSByZXR1cm4gdGhlIHByZXZpb3VzbHkgY3JlYXRlZCBpbnN0YW5jZS5cbiAgICovXG4gIGdldCggc2hhcmVkU291bmRQbGF5ZXJOYW1lOiBTaGFyZWRTb3VuZFBsYXllck5hbWUgKTogVFNvdW5kUGxheWVyIHtcblxuICAgIC8vIElmIGl0IGRvZXNuJ3QgZXhpc3QsIGNyZWF0ZSBpdCBhbmQgYWRkIGl0IHRvIHRoZSBzZXQgb2YgaW5zdGFuY2VzLlxuICAgIGlmICggIXNoYXJlZFNvdW5kUGxheWVySW5zdGFuY2VNYXAuaGFzKCBzaGFyZWRTb3VuZFBsYXllck5hbWUgKSApIHtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSBkZWZpbml0aW9uYWwgaW5mb3JtYXRpb24gZm9yIHRoaXMgc291bmQgZXhpc3RzLlxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2hhcmVkU291bmRQbGF5ZXJJbmZvTWFwLmhhcyggc2hhcmVkU291bmRQbGF5ZXJOYW1lICksICdubyBpbmZvIGZvciB0aGlzIHNoYXJlZCBzb3VuZCBwbGF5ZXInICk7XG4gICAgICBjb25zdCBzaGFyZWRTb3VuZFBsYXllckluZm8gPSBzaGFyZWRTb3VuZFBsYXllckluZm9NYXAuZ2V0KCBzaGFyZWRTb3VuZFBsYXllck5hbWUgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgREVGQVVMVF9TT1VORF9DTElQX1BMQVlFUl9JTkZPO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIGluc3RhbmNlIGFuZCBhZGQgaXQgdG8gb3VyIG1hcC5cbiAgICAgIHNoYXJlZFNvdW5kUGxheWVySW5zdGFuY2VNYXAuc2V0KCBzaGFyZWRTb3VuZFBsYXllck5hbWUsIG5ldyBTb3VuZENsaXBQbGF5ZXIoXG4gICAgICAgIHNoYXJlZFNvdW5kUGxheWVySW5mby53cmFwcGVkQXVkaW9CdWZmZXIsXG4gICAgICAgIHNoYXJlZFNvdW5kUGxheWVySW5mby5zb3VuZENsaXBQbGF5ZXJPcHRpb25zXG4gICAgICApICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoYXJlZFNvdW5kUGxheWVySW5zdGFuY2VNYXAuZ2V0KCBzaGFyZWRTb3VuZFBsYXllck5hbWUgKSE7XG4gIH1cbn07XG5cbi8vIE1hcCBvZiBzaGFyZWQgc291bmQgcGxheWVyIG5hbWVzIHRvIHRoZSBwYXJhbWV0ZXJzIG5lZWRlZCB0byBjcmVhdGUgdGhlbS5cbmNvbnN0IHNoYXJlZFNvdW5kUGxheWVySW5mb01hcDogTWFwPFNoYXJlZFNvdW5kUGxheWVyTmFtZSwgU291bmRDbGlwUGxheWVySW5mbz4gPVxuICBuZXcgTWFwPFNoYXJlZFNvdW5kUGxheWVyTmFtZSwgU291bmRDbGlwUGxheWVySW5mbz4oIFtcbiAgICBbXG4gICAgICAnYWNjb3JkaW9uQm94Q2xvc2VkJyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBhY2NvcmRpb25Cb3hDbG9zZV9tcDMsXG4gICAgICAgIHNvdW5kQ2xpcFBsYXllck9wdGlvbnM6IERFRkFVTFRTX1dJVEhfT1VUUFVUX0xFVkVMKCAwLjUgKVxuICAgICAgfVxuICAgIF0sXG4gICAgW1xuICAgICAgJ2FjY29yZGlvbkJveE9wZW5lZCcsXG4gICAgICB7XG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlcjogYWNjb3JkaW9uQm94T3Blbl9tcDMsXG4gICAgICAgIHNvdW5kQ2xpcFBsYXllck9wdGlvbnM6IERFRkFVTFRTX1dJVEhfT1VUUFVUX0xFVkVMKCAwLjUgKVxuICAgICAgfVxuICAgIF0sXG4gICAgW1xuICAgICAgJ2JvdW5kYXJ5UmVhY2hlZCcsXG4gICAgICB7XG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlcjogYm91bmRhcnlSZWFjaGVkX21wMyxcbiAgICAgICAgc291bmRDbGlwUGxheWVyT3B0aW9uczogREVGQVVMVFNfV0lUSF9PVVRQVVRfTEVWRUwoIDAuOCApXG4gICAgICB9XG4gICAgXSxcbiAgICBbXG4gICAgICAnY2hlY2tib3hDaGVja2VkJyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBjaGVja2JveENoZWNrZWRfbXAzLFxuICAgICAgICBzb3VuZENsaXBQbGF5ZXJPcHRpb25zOiBERUZBVUxUX1NPVU5EX0NMSVBfUExBWUVSX09QVElPTlNcbiAgICAgIH1cbiAgICBdLFxuICAgIFtcbiAgICAgICdjaGVja2JveFVuY2hlY2tlZCcsXG4gICAgICB7XG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlcjogY2hlY2tib3hVbmNoZWNrZWRfbXAzLFxuICAgICAgICBzb3VuZENsaXBQbGF5ZXJPcHRpb25zOiBERUZBVUxUX1NPVU5EX0NMSVBfUExBWUVSX09QVElPTlNcbiAgICAgIH1cbiAgICBdLFxuICAgIFtcbiAgICAgICdnZW5lcmFsQm91bmRhcnlCb29wJyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBnZW5lcmFsQm91bmRhcnlCb29wX21wMyxcbiAgICAgICAgc291bmRDbGlwUGxheWVyT3B0aW9uczogREVGQVVMVFNfV0lUSF9PVVRQVVRfTEVWRUwoIDAuMiApXG4gICAgICB9XG4gICAgXSxcbiAgICBbXG4gICAgICAnZ2VuZXJhbENsb3NlJyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBnZW5lcmFsQ2xvc2VfbXAzLFxuICAgICAgICBzb3VuZENsaXBQbGF5ZXJPcHRpb25zOiBERUZBVUxUU19XSVRIX09VVFBVVF9MRVZFTCggMC40IClcbiAgICAgIH1cbiAgICBdLFxuICAgIFtcbiAgICAgICdnZW5lcmFsT3BlbicsXG4gICAgICB7XG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlcjogZ2VuZXJhbE9wZW5fbXAzLFxuICAgICAgICBzb3VuZENsaXBQbGF5ZXJPcHRpb25zOiBERUZBVUxUU19XSVRIX09VVFBVVF9MRVZFTCggMC40IClcbiAgICAgIH1cbiAgICBdLFxuICAgIFtcbiAgICAgICdnZW5lcmFsU29mdENsaWNrJyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBnZW5lcmFsU29mdENsaWNrX21wMyxcbiAgICAgICAgc291bmRDbGlwUGxheWVyT3B0aW9uczogREVGQVVMVFNfV0lUSF9PVVRQVVRfTEVWRUwoIDAuMiApXG4gICAgICB9XG4gICAgXSxcbiAgICBbXG4gICAgICAnZ3JhYicsXG4gICAgICB7XG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlcjogZ3JhYl9tcDMsXG4gICAgICAgIHNvdW5kQ2xpcFBsYXllck9wdGlvbnM6IERFRkFVTFRfU09VTkRfQ0xJUF9QTEFZRVJfT1BUSU9OU1xuICAgICAgfVxuICAgIF0sXG4gICAgW1xuICAgICAgJ3BhdXNlJyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBwYXVzZV9tcDMsXG4gICAgICAgIHNvdW5kQ2xpcFBsYXllck9wdGlvbnM6IERFRkFVTFRfU09VTkRfQ0xJUF9QTEFZRVJfT1BUSU9OU1xuICAgICAgfVxuICAgIF0sXG4gICAgW1xuICAgICAgJ3BsYXknLFxuICAgICAge1xuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXI6IHBsYXlQYXVzZV9tcDMsXG4gICAgICAgIHNvdW5kQ2xpcFBsYXllck9wdGlvbnM6IERFRkFVTFRfU09VTkRfQ0xJUF9QTEFZRVJfT1BUSU9OU1xuICAgICAgfVxuICAgIF0sXG4gICAgW1xuICAgICAgJ3B1c2hCdXR0b24nLFxuICAgICAge1xuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXI6IGdlbmVyYWxCdXR0b25fbXAzLFxuICAgICAgICBzb3VuZENsaXBQbGF5ZXJPcHRpb25zOiBERUZBVUxUU19XSVRIX09VVFBVVF9MRVZFTCggMC41IClcbiAgICAgIH1cbiAgICBdLFxuICAgIFtcbiAgICAgICdyZWxlYXNlJyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiByZWxlYXNlX21wMyxcbiAgICAgICAgc291bmRDbGlwUGxheWVyT3B0aW9uczogREVGQVVMVF9TT1VORF9DTElQX1BMQVlFUl9PUFRJT05TXG4gICAgICB9XG4gICAgXSxcbiAgICBbXG4gICAgICAncmVzZXRBbGwnLFxuICAgICAge1xuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXI6IHJlc2V0QWxsX21wMyxcbiAgICAgICAgc291bmRDbGlwUGxheWVyT3B0aW9uczoge1xuICAgICAgICAgIHNvdW5kQ2xpcE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGluaXRpYWxPdXRwdXRMZXZlbDogMC4zOSxcbiAgICAgICAgICAgIGVuYWJsZWREdXJpbmdSZXNldDogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZWREdXJpbmdQaGV0aW9TdGF0ZVNldHRpbmc6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNvdW5kTWFuYWdlck9wdGlvbnM6IHsgY2F0ZWdvcnlOYW1lOiAndXNlci1pbnRlcmZhY2UnIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0sXG4gICAgW1xuICAgICAgJ3NvZnRDbGljaycsXG4gICAgICB7XG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlcjogY2xpY2tfbXAzLFxuICAgICAgICBzb3VuZENsaXBQbGF5ZXJPcHRpb25zOiBERUZBVUxUX1NPVU5EX0NMSVBfUExBWUVSX09QVElPTlNcbiAgICAgIH1cbiAgICBdLFxuICAgIFtcbiAgICAgICdzdGVwQmFja3dhcmQnLFxuICAgICAge1xuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXI6IHN0ZXBCYWNrX21wMyxcbiAgICAgICAgc291bmRDbGlwUGxheWVyT3B0aW9uczogREVGQVVMVF9TT1VORF9DTElQX1BMQVlFUl9PUFRJT05TXG4gICAgICB9XG4gICAgXSxcbiAgICBbXG4gICAgICAnc3RlcEZvcndhcmQnLFxuICAgICAge1xuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXI6IHN0ZXBGb3J3YXJkX21wMyxcbiAgICAgICAgc291bmRDbGlwUGxheWVyT3B0aW9uczogREVGQVVMVF9TT1VORF9DTElQX1BMQVlFUl9PUFRJT05TXG4gICAgICB9XG4gICAgXSxcbiAgICBbXG4gICAgICAnc3dpdGNoVG9MZWZ0JyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBzd2l0Y2hUb0xlZnRfbXAzLFxuICAgICAgICBzb3VuZENsaXBQbGF5ZXJPcHRpb25zOiBERUZBVUxUU19XSVRIX09VVFBVVF9MRVZFTCggMC4yIClcbiAgICAgIH1cbiAgICBdLFxuICAgIFtcbiAgICAgICdzd2l0Y2hUb1JpZ2h0JyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBzd2l0Y2hUb1JpZ2h0X21wMyxcbiAgICAgICAgc291bmRDbGlwUGxheWVyT3B0aW9uczogREVGQVVMVFNfV0lUSF9PVVRQVVRfTEVWRUwoIDAuMiApXG4gICAgICB9XG4gICAgXSxcbiAgICBbXG4gICAgICAndG9nZ2xlT2ZmJyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBzdGVwQmFja19tcDMsXG4gICAgICAgIHNvdW5kQ2xpcFBsYXllck9wdGlvbnM6IERFRkFVTFRfU09VTkRfQ0xJUF9QTEFZRVJfT1BUSU9OU1xuICAgICAgfVxuICAgIF0sXG4gICAgW1xuICAgICAgJ3RvZ2dsZU9uJyxcbiAgICAgIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyOiBzdGVwRm9yd2FyZF9tcDMsXG4gICAgICAgIHNvdW5kQ2xpcFBsYXllck9wdGlvbnM6IERFRkFVTFRfU09VTkRfQ0xJUF9QTEFZRVJfT1BUSU9OU1xuICAgICAgfVxuICAgIF1cbiAgXSApO1xuXG50YW1iby5yZWdpc3RlciggJ3NoYXJlZFNvdW5kUGxheWVycycsIHNoYXJlZFNvdW5kUGxheWVycyApO1xuZXhwb3J0IGRlZmF1bHQgc2hhcmVkU291bmRQbGF5ZXJzOyJdLCJuYW1lcyI6WyJjb21iaW5lT3B0aW9ucyIsImFjY29yZGlvbkJveENsb3NlX21wMyIsImFjY29yZGlvbkJveE9wZW5fbXAzIiwiYm91bmRhcnlSZWFjaGVkX21wMyIsImNoZWNrYm94Q2hlY2tlZF9tcDMiLCJjaGVja2JveFVuY2hlY2tlZF9tcDMiLCJjbGlja19tcDMiLCJnZW5lcmFsQm91bmRhcnlCb29wX21wMyIsImdlbmVyYWxCdXR0b25fbXAzIiwiZ2VuZXJhbENsb3NlX21wMyIsImdlbmVyYWxPcGVuX21wMyIsImdlbmVyYWxTb2Z0Q2xpY2tfbXAzIiwiZ3JhYl9tcDMiLCJwYXVzZV9tcDMiLCJwbGF5UGF1c2VfbXAzIiwicmVsZWFzZV9tcDMiLCJyZXNldEFsbF9tcDMiLCJzdGVwQmFja19tcDMiLCJzdGVwRm9yd2FyZF9tcDMiLCJzd2l0Y2hUb0xlZnRfbXAzIiwic3dpdGNoVG9SaWdodF9tcDMiLCJTb3VuZENsaXBQbGF5ZXIiLCJ0YW1ibyIsIkRFRkFVTFRfU09VTkRfQ0xJUF9QTEFZRVJfT1BUSU9OUyIsInNvdW5kQ2xpcE9wdGlvbnMiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJzb3VuZE1hbmFnZXJPcHRpb25zIiwiY2F0ZWdvcnlOYW1lIiwiREVGQVVMVF9TT1VORF9DTElQX1BMQVlFUl9JTkZPIiwid3JhcHBlZEF1ZGlvQnVmZmVyIiwic291bmRDbGlwUGxheWVyT3B0aW9ucyIsIkRFRkFVTFRTX1dJVEhfT1VUUFVUX0xFVkVMIiwib3V0cHV0TGV2ZWwiLCJzaGFyZWRTb3VuZFBsYXllckluc3RhbmNlTWFwIiwiTWFwIiwic2hhcmVkU291bmRQbGF5ZXJzIiwiZ2V0Iiwic2hhcmVkU291bmRQbGF5ZXJOYW1lIiwiaGFzIiwiYXNzZXJ0Iiwic2hhcmVkU291bmRQbGF5ZXJJbmZvTWFwIiwic2hhcmVkU291bmRQbGF5ZXJJbmZvIiwic2V0IiwiZW5hYmxlZER1cmluZ1Jlc2V0IiwiZW5hYmxlZER1cmluZ1BoZXRpb1N0YXRlU2V0dGluZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7Ozs7Ozs7O0NBY0MsR0FFRCxTQUFTQSxjQUFjLFFBQVEsa0NBQWtDO0FBQ2pFLE9BQU9DLDJCQUEyQixxQ0FBcUM7QUFDdkUsT0FBT0MsMEJBQTBCLG9DQUFvQztBQUNyRSxPQUFPQyx5QkFBeUIsbUNBQW1DO0FBQ25FLE9BQU9DLHlCQUF5QixtQ0FBbUM7QUFDbkUsT0FBT0MsMkJBQTJCLHFDQUFxQztBQUN2RSxPQUFPQyxlQUFlLHlCQUF5QjtBQUMvQyxPQUFPQyw2QkFBNkIsdUNBQXVDO0FBQzNFLE9BQU9DLHVCQUF1QixpQ0FBaUM7QUFDL0QsT0FBT0Msc0JBQXNCLGdDQUFnQztBQUM3RCxPQUFPQyxxQkFBcUIsK0JBQStCO0FBQzNELE9BQU9DLDBCQUEwQixvQ0FBb0M7QUFDckUsT0FBT0MsY0FBYyx3QkFBd0I7QUFDN0MsT0FBT0MsZUFBZSx5QkFBeUI7QUFDL0MsT0FBT0MsbUJBQW1CLDZCQUE2QjtBQUN2RCxPQUFPQyxpQkFBaUIsMkJBQTJCO0FBQ25ELE9BQU9DLGtCQUFrQiw0QkFBNEI7QUFDckQsT0FBT0Msa0JBQWtCLDRCQUE0QjtBQUNyRCxPQUFPQyxxQkFBcUIsK0JBQStCO0FBQzNELE9BQU9DLHNCQUFzQixnQ0FBZ0M7QUFDN0QsT0FBT0MsdUJBQXVCLGlDQUFpQztBQUMvRCxPQUFPQyxxQkFBaUQsd0NBQXdDO0FBQ2hHLE9BQU9DLFdBQVcsYUFBYTtBQWtDL0IsWUFBWTtBQUNaLE1BQU1DLG9DQUE0RDtJQUNoRUMsa0JBQWtCO1FBQ2hCQyxvQkFBb0I7SUFDdEI7SUFDQUMscUJBQXFCO1FBQUVDLGNBQWM7SUFBaUI7QUFDeEQ7QUFDQSxNQUFNQyxpQ0FBc0Q7SUFDMURDLG9CQUFvQmI7SUFDcEJjLHdCQUF3QlA7QUFDMUI7QUFDQSxNQUFNUSw2QkFB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