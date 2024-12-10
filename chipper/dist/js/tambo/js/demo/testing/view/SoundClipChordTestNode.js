// Copyright 2020-2024, University of Colorado Boulder
/**
 * Test and demo of the SoundClipChord.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import optionize from '../../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { VBox } from '../../../../../scenery/js/imports.js';
import TextPushButton from '../../../../../sun/js/buttons/TextPushButton.js';
import brightMarimba_mp3 from '../../../../sounds/brightMarimba_mp3.js';
import SoundClipChord from '../../../sound-generators/SoundClipChord.js';
import soundManager from '../../../soundManager.js';
import tambo from '../../../tambo.js';
let SoundClipChordTestNode = class SoundClipChordTestNode extends VBox {
    /**
   * Release references to avoid memory leaks.
   */ dispose() {
        this.disposeSoundClipChordTestNode();
        super.dispose();
    }
    constructor(providedOptions){
        // sound clips to be played
        const chordSoundClipChord = new SoundClipChord(brightMarimba_mp3);
        const arpeggioSoundClipChord = new SoundClipChord(brightMarimba_mp3, {
            arpeggiate: true
        });
        soundManager.addSoundGenerator(chordSoundClipChord);
        soundManager.addSoundGenerator(arpeggioSoundClipChord);
        // add a button to play a chord
        const playChordButton = new TextPushButton('Play Chord', {
            baseColor: '#aad6cc',
            font: new PhetFont(16),
            soundPlayer: chordSoundClipChord
        });
        // add button to play an arpeggio
        const playArpeggioButton = new TextPushButton('Play Arpeggiated Chord', {
            baseColor: '#DBB1CD',
            font: new PhetFont(16),
            soundPlayer: arpeggioSoundClipChord
        });
        super(optionize()({
            children: [
                playChordButton,
                playArpeggioButton
            ],
            spacing: 20
        }, providedOptions));
        // dispose function
        this.disposeSoundClipChordTestNode = ()=>{
            soundManager.removeSoundGenerator(chordSoundClipChord);
            chordSoundClipChord.dispose();
            soundManager.removeSoundGenerator(arpeggioSoundClipChord);
            arpeggioSoundClipChord.dispose();
        };
    }
};
tambo.register('SoundClipChordTestNode', SoundClipChordTestNode);
export default SoundClipChordTestNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdGVzdGluZy92aWV3L1NvdW5kQ2xpcENob3JkVGVzdE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGVzdCBhbmQgZGVtbyBvZiB0aGUgU291bmRDbGlwQ2hvcmQuXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBWQm94LCBWQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xuaW1wb3J0IGJyaWdodE1hcmltYmFfbXAzIGZyb20gJy4uLy4uLy4uLy4uL3NvdW5kcy9icmlnaHRNYXJpbWJhX21wMy5qcyc7XG5pbXBvcnQgU291bmRDbGlwQ2hvcmQgZnJvbSAnLi4vLi4vLi4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXBDaG9yZC5qcyc7XG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uL3NvdW5kTWFuYWdlci5qcyc7XG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vLi4vLi4vdGFtYm8uanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcbmV4cG9ydCB0eXBlIFNvdW5kQ2xpcENob3JkVGVzdE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBWQm94T3B0aW9ucztcblxuY2xhc3MgU291bmRDbGlwQ2hvcmRUZXN0Tm9kZSBleHRlbmRzIFZCb3gge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVNvdW5kQ2xpcENob3JkVGVzdE5vZGU6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBTb3VuZENsaXBDaG9yZFRlc3ROb2RlT3B0aW9ucyApIHtcblxuICAgIC8vIHNvdW5kIGNsaXBzIHRvIGJlIHBsYXllZFxuICAgIGNvbnN0IGNob3JkU291bmRDbGlwQ2hvcmQgPSBuZXcgU291bmRDbGlwQ2hvcmQoIGJyaWdodE1hcmltYmFfbXAzICk7XG4gICAgY29uc3QgYXJwZWdnaW9Tb3VuZENsaXBDaG9yZCA9IG5ldyBTb3VuZENsaXBDaG9yZCggYnJpZ2h0TWFyaW1iYV9tcDMsIHsgYXJwZWdnaWF0ZTogdHJ1ZSB9ICk7XG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBjaG9yZFNvdW5kQ2xpcENob3JkICk7XG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBhcnBlZ2dpb1NvdW5kQ2xpcENob3JkICk7XG5cbiAgICAvLyBhZGQgYSBidXR0b24gdG8gcGxheSBhIGNob3JkXG4gICAgY29uc3QgcGxheUNob3JkQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCAnUGxheSBDaG9yZCcsIHtcbiAgICAgIGJhc2VDb2xvcjogJyNhYWQ2Y2MnLFxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNiApLFxuICAgICAgc291bmRQbGF5ZXI6IGNob3JkU291bmRDbGlwQ2hvcmRcbiAgICB9ICk7XG5cbiAgICAvLyBhZGQgYnV0dG9uIHRvIHBsYXkgYW4gYXJwZWdnaW9cbiAgICBjb25zdCBwbGF5QXJwZWdnaW9CdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oICdQbGF5IEFycGVnZ2lhdGVkIENob3JkJywge1xuICAgICAgYmFzZUNvbG9yOiAnI0RCQjFDRCcsXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksXG4gICAgICBzb3VuZFBsYXllcjogYXJwZWdnaW9Tb3VuZENsaXBDaG9yZFxuICAgIH0gKTtcblxuICAgIHN1cGVyKCBvcHRpb25pemU8U291bmRDbGlwQ2hvcmRUZXN0Tm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBWQm94T3B0aW9ucz4oKSgge1xuICAgICAgY2hpbGRyZW46IFsgcGxheUNob3JkQnV0dG9uLCBwbGF5QXJwZWdnaW9CdXR0b24gXSxcbiAgICAgIHNwYWNpbmc6IDIwXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICkgKTtcblxuICAgIC8vIGRpc3Bvc2UgZnVuY3Rpb25cbiAgICB0aGlzLmRpc3Bvc2VTb3VuZENsaXBDaG9yZFRlc3ROb2RlID0gKCkgPT4ge1xuICAgICAgc291bmRNYW5hZ2VyLnJlbW92ZVNvdW5kR2VuZXJhdG9yKCBjaG9yZFNvdW5kQ2xpcENob3JkICk7XG4gICAgICBjaG9yZFNvdW5kQ2xpcENob3JkLmRpc3Bvc2UoKTtcbiAgICAgIHNvdW5kTWFuYWdlci5yZW1vdmVTb3VuZEdlbmVyYXRvciggYXJwZWdnaW9Tb3VuZENsaXBDaG9yZCApO1xuICAgICAgYXJwZWdnaW9Tb3VuZENsaXBDaG9yZC5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlIHJlZmVyZW5jZXMgdG8gYXZvaWQgbWVtb3J5IGxlYWtzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlU291bmRDbGlwQ2hvcmRUZXN0Tm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG50YW1iby5yZWdpc3RlciggJ1NvdW5kQ2xpcENob3JkVGVzdE5vZGUnLCBTb3VuZENsaXBDaG9yZFRlc3ROb2RlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFNvdW5kQ2xpcENob3JkVGVzdE5vZGU7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIlBoZXRGb250IiwiVkJveCIsIlRleHRQdXNoQnV0dG9uIiwiYnJpZ2h0TWFyaW1iYV9tcDMiLCJTb3VuZENsaXBDaG9yZCIsInNvdW5kTWFuYWdlciIsInRhbWJvIiwiU291bmRDbGlwQ2hvcmRUZXN0Tm9kZSIsImRpc3Bvc2UiLCJkaXNwb3NlU291bmRDbGlwQ2hvcmRUZXN0Tm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsImNob3JkU291bmRDbGlwQ2hvcmQiLCJhcnBlZ2dpb1NvdW5kQ2xpcENob3JkIiwiYXJwZWdnaWF0ZSIsImFkZFNvdW5kR2VuZXJhdG9yIiwicGxheUNob3JkQnV0dG9uIiwiYmFzZUNvbG9yIiwiZm9udCIsInNvdW5kUGxheWVyIiwicGxheUFycGVnZ2lvQnV0dG9uIiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwicmVtb3ZlU291bmRHZW5lcmF0b3IiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxlQUFxQywyQ0FBMkM7QUFDdkYsT0FBT0MsY0FBYyw2Q0FBNkM7QUFDbEUsU0FBU0MsSUFBSSxRQUFxQix1Q0FBdUM7QUFDekUsT0FBT0Msb0JBQW9CLGtEQUFrRDtBQUM3RSxPQUFPQyx1QkFBdUIsMENBQTBDO0FBQ3hFLE9BQU9DLG9CQUFvQiw4Q0FBOEM7QUFDekUsT0FBT0Msa0JBQWtCLDJCQUEyQjtBQUNwRCxPQUFPQyxXQUFXLG9CQUFvQjtBQUt0QyxJQUFBLEFBQU1DLHlCQUFOLE1BQU1BLCtCQUErQk47SUF3Q25DOztHQUVDLEdBQ0QsQUFBZ0JPLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0MsNkJBQTZCO1FBQ2xDLEtBQUssQ0FBQ0Q7SUFDUjtJQTFDQSxZQUFvQkUsZUFBK0MsQ0FBRztRQUVwRSwyQkFBMkI7UUFDM0IsTUFBTUMsc0JBQXNCLElBQUlQLGVBQWdCRDtRQUNoRCxNQUFNUyx5QkFBeUIsSUFBSVIsZUFBZ0JELG1CQUFtQjtZQUFFVSxZQUFZO1FBQUs7UUFDekZSLGFBQWFTLGlCQUFpQixDQUFFSDtRQUNoQ04sYUFBYVMsaUJBQWlCLENBQUVGO1FBRWhDLCtCQUErQjtRQUMvQixNQUFNRyxrQkFBa0IsSUFBSWIsZUFBZ0IsY0FBYztZQUN4RGMsV0FBVztZQUNYQyxNQUFNLElBQUlqQixTQUFVO1lBQ3BCa0IsYUFBYVA7UUFDZjtRQUVBLGlDQUFpQztRQUNqQyxNQUFNUSxxQkFBcUIsSUFBSWpCLGVBQWdCLDBCQUEwQjtZQUN2RWMsV0FBVztZQUNYQyxNQUFNLElBQUlqQixTQUFVO1lBQ3BCa0IsYUFBYU47UUFDZjtRQUVBLEtBQUssQ0FBRWIsWUFBc0U7WUFDM0VxQixVQUFVO2dCQUFFTDtnQkFBaUJJO2FBQW9CO1lBQ2pERSxTQUFTO1FBQ1gsR0FBR1g7UUFFSCxtQkFBbUI7UUFDbkIsSUFBSSxDQUFDRCw2QkFBNkIsR0FBRztZQUNuQ0osYUFBYWlCLG9CQUFvQixDQUFFWDtZQUNuQ0Esb0JBQW9CSCxPQUFPO1lBQzNCSCxhQUFhaUIsb0JBQW9CLENBQUVWO1lBQ25DQSx1QkFBdUJKLE9BQU87UUFDaEM7SUFDRjtBQVNGO0FBRUFGLE1BQU1pQixRQUFRLENBQUUsMEJBQTBCaEI7QUFFMUMsZUFBZUEsdUJBQXVCIn0=