// Copyright 2020-2024, University of Colorado Boulder
/**
 * Test and demo of the CompositeSoundClip.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { VBox } from '../../../../../scenery/js/imports.js';
import TextPushButton from '../../../../../sun/js/buttons/TextPushButton.js';
import brightMarimba_mp3 from '../../../../sounds/brightMarimba_mp3.js';
import loonCall_mp3 from '../../../../sounds/demo-and-test/loonCall_mp3.js';
import nullSoundPlayer from '../../../nullSoundPlayer.js';
import CompositeSoundClip from '../../../sound-generators/CompositeSoundClip.js';
import soundManager from '../../../soundManager.js';
import tambo from '../../../tambo.js';
let CompositeSoundClipTestNode = class CompositeSoundClipTestNode extends VBox {
    /**
   * Release references to avoid memory leaks.
   */ dispose() {
        this.disposeCompositeSoundClipTestNode();
        super.dispose();
    }
    constructor(options){
        // sound clips to be played
        const compositeSoundClip = new CompositeSoundClip([
            {
                sound: brightMarimba_mp3
            },
            {
                sound: brightMarimba_mp3,
                options: {
                    initialPlaybackRate: Math.pow(2, 4 / 12)
                }
            },
            {
                sound: brightMarimba_mp3,
                options: {
                    initialPlaybackRate: 2
                }
            },
            {
                sound: loonCall_mp3
            }
        ]);
        soundManager.addSoundGenerator(compositeSoundClip);
        // add a button to play a composite sound
        const playSoundClipChordButton = new TextPushButton('Play CompositeSoundClip', {
            baseColor: '#aad6cc',
            font: new PhetFont(16),
            soundPlayer: compositeSoundClip
        });
        // add button to stop the sound
        const stopSoundClipChordButton = new TextPushButton('Stop CompositeSoundClip', {
            baseColor: '#DBB1CD',
            font: new PhetFont(16),
            soundPlayer: nullSoundPlayer,
            listener: ()=>{
                compositeSoundClip.stop();
            }
        });
        super(merge({
            children: [
                playSoundClipChordButton,
                stopSoundClipChordButton
            ],
            spacing: 20
        }, options));
        // dispose function
        this.disposeCompositeSoundClipTestNode = ()=>{
            soundManager.removeSoundGenerator(compositeSoundClip);
            compositeSoundClip.dispose();
        };
    }
};
tambo.register('CompositeSoundClipTestNode', CompositeSoundClipTestNode);
export default CompositeSoundClipTestNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdGVzdGluZy92aWV3L0NvbXBvc2l0ZVNvdW5kQ2xpcFRlc3ROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRlc3QgYW5kIGRlbW8gb2YgdGhlIENvbXBvc2l0ZVNvdW5kQ2xpcC5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcbmltcG9ydCB7IFZCb3gsIFZCb3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgYnJpZ2h0TWFyaW1iYV9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL2JyaWdodE1hcmltYmFfbXAzLmpzJztcbmltcG9ydCBsb29uQ2FsbF9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL2RlbW8tYW5kLXRlc3QvbG9vbkNhbGxfbXAzLmpzJztcbmltcG9ydCBudWxsU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vLi4vbnVsbFNvdW5kUGxheWVyLmpzJztcbmltcG9ydCBDb21wb3NpdGVTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vc291bmQtZ2VuZXJhdG9ycy9Db21wb3NpdGVTb3VuZENsaXAuanMnO1xuaW1wb3J0IHNvdW5kTWFuYWdlciBmcm9tICcuLi8uLi8uLi9zb3VuZE1hbmFnZXIuanMnO1xuaW1wb3J0IHRhbWJvIGZyb20gJy4uLy4uLy4uL3RhbWJvLmpzJztcblxuY2xhc3MgQ29tcG9zaXRlU291bmRDbGlwVGVzdE5vZGUgZXh0ZW5kcyBWQm94IHtcblxuICAvLyBkaXNwb3NlIGZ1bmN0aW9uXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUNvbXBvc2l0ZVNvdW5kQ2xpcFRlc3ROb2RlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9uczogVkJveE9wdGlvbnMgKSB7XG5cbiAgICAvLyBzb3VuZCBjbGlwcyB0byBiZSBwbGF5ZWRcbiAgICBjb25zdCBjb21wb3NpdGVTb3VuZENsaXAgPSBuZXcgQ29tcG9zaXRlU291bmRDbGlwKCBbXG4gICAgICB7IHNvdW5kOiBicmlnaHRNYXJpbWJhX21wMyB9LFxuICAgICAgeyBzb3VuZDogYnJpZ2h0TWFyaW1iYV9tcDMsIG9wdGlvbnM6IHsgaW5pdGlhbFBsYXliYWNrUmF0ZTogTWF0aC5wb3coIDIsIDQgLyAxMiApIH0gfSxcbiAgICAgIHsgc291bmQ6IGJyaWdodE1hcmltYmFfbXAzLCBvcHRpb25zOiB7IGluaXRpYWxQbGF5YmFja1JhdGU6IDIgfSB9LFxuICAgICAgeyBzb3VuZDogbG9vbkNhbGxfbXAzIH1cbiAgICBdICk7XG5cbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIGNvbXBvc2l0ZVNvdW5kQ2xpcCApO1xuXG4gICAgLy8gYWRkIGEgYnV0dG9uIHRvIHBsYXkgYSBjb21wb3NpdGUgc291bmRcbiAgICBjb25zdCBwbGF5U291bmRDbGlwQ2hvcmRCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oICdQbGF5IENvbXBvc2l0ZVNvdW5kQ2xpcCcsIHtcbiAgICAgIGJhc2VDb2xvcjogJyNhYWQ2Y2MnLFxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNiApLFxuICAgICAgc291bmRQbGF5ZXI6IGNvbXBvc2l0ZVNvdW5kQ2xpcFxuICAgIH0gKTtcblxuICAgIC8vIGFkZCBidXR0b24gdG8gc3RvcCB0aGUgc291bmRcbiAgICBjb25zdCBzdG9wU291bmRDbGlwQ2hvcmRCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oICdTdG9wIENvbXBvc2l0ZVNvdW5kQ2xpcCcsIHtcbiAgICAgIGJhc2VDb2xvcjogJyNEQkIxQ0QnLFxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNiApLFxuICAgICAgc291bmRQbGF5ZXI6IG51bGxTb3VuZFBsYXllciwgLy8gdHVybiBvZmYgZGVmYXVsdCBzb3VuZCBnZW5lcmF0aW9uXG4gICAgICBsaXN0ZW5lcjogKCkgPT4geyBjb21wb3NpdGVTb3VuZENsaXAuc3RvcCgpOyB9XG4gICAgfSApO1xuXG4gICAgc3VwZXIoIG1lcmdlKCB7XG4gICAgICBjaGlsZHJlbjogWyBwbGF5U291bmRDbGlwQ2hvcmRCdXR0b24sIHN0b3BTb3VuZENsaXBDaG9yZEJ1dHRvbiBdLFxuICAgICAgc3BhY2luZzogMjBcbiAgICB9LCBvcHRpb25zICkgKTtcblxuICAgIC8vIGRpc3Bvc2UgZnVuY3Rpb25cbiAgICB0aGlzLmRpc3Bvc2VDb21wb3NpdGVTb3VuZENsaXBUZXN0Tm9kZSA9ICgpID0+IHtcbiAgICAgIHNvdW5kTWFuYWdlci5yZW1vdmVTb3VuZEdlbmVyYXRvciggY29tcG9zaXRlU291bmRDbGlwICk7XG4gICAgICBjb21wb3NpdGVTb3VuZENsaXAuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZSByZWZlcmVuY2VzIHRvIGF2b2lkIG1lbW9yeSBsZWFrcy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUNvbXBvc2l0ZVNvdW5kQ2xpcFRlc3ROb2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnRhbWJvLnJlZ2lzdGVyKCAnQ29tcG9zaXRlU291bmRDbGlwVGVzdE5vZGUnLCBDb21wb3NpdGVTb3VuZENsaXBUZXN0Tm9kZSApO1xuZXhwb3J0IGRlZmF1bHQgQ29tcG9zaXRlU291bmRDbGlwVGVzdE5vZGU7Il0sIm5hbWVzIjpbIm1lcmdlIiwiUGhldEZvbnQiLCJWQm94IiwiVGV4dFB1c2hCdXR0b24iLCJicmlnaHRNYXJpbWJhX21wMyIsImxvb25DYWxsX21wMyIsIm51bGxTb3VuZFBsYXllciIsIkNvbXBvc2l0ZVNvdW5kQ2xpcCIsInNvdW5kTWFuYWdlciIsInRhbWJvIiwiQ29tcG9zaXRlU291bmRDbGlwVGVzdE5vZGUiLCJkaXNwb3NlIiwiZGlzcG9zZUNvbXBvc2l0ZVNvdW5kQ2xpcFRlc3ROb2RlIiwib3B0aW9ucyIsImNvbXBvc2l0ZVNvdW5kQ2xpcCIsInNvdW5kIiwiaW5pdGlhbFBsYXliYWNrUmF0ZSIsIk1hdGgiLCJwb3ciLCJhZGRTb3VuZEdlbmVyYXRvciIsInBsYXlTb3VuZENsaXBDaG9yZEJ1dHRvbiIsImJhc2VDb2xvciIsImZvbnQiLCJzb3VuZFBsYXllciIsInN0b3BTb3VuZENsaXBDaG9yZEJ1dHRvbiIsImxpc3RlbmVyIiwic3RvcCIsImNoaWxkcmVuIiwic3BhY2luZyIsInJlbW92ZVNvdW5kR2VuZXJhdG9yIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsV0FBVyx1Q0FBdUM7QUFDekQsT0FBT0MsY0FBYyw2Q0FBNkM7QUFDbEUsU0FBU0MsSUFBSSxRQUFxQix1Q0FBdUM7QUFDekUsT0FBT0Msb0JBQW9CLGtEQUFrRDtBQUM3RSxPQUFPQyx1QkFBdUIsMENBQTBDO0FBQ3hFLE9BQU9DLGtCQUFrQixtREFBbUQ7QUFDNUUsT0FBT0MscUJBQXFCLDhCQUE4QjtBQUMxRCxPQUFPQyx3QkFBd0Isa0RBQWtEO0FBQ2pGLE9BQU9DLGtCQUFrQiwyQkFBMkI7QUFDcEQsT0FBT0MsV0FBVyxvQkFBb0I7QUFFdEMsSUFBQSxBQUFNQyw2QkFBTixNQUFNQSxtQ0FBbUNSO0lBNEN2Qzs7R0FFQyxHQUNELEFBQWdCUyxVQUFnQjtRQUM5QixJQUFJLENBQUNDLGlDQUFpQztRQUN0QyxLQUFLLENBQUNEO0lBQ1I7SUE3Q0EsWUFBb0JFLE9BQW9CLENBQUc7UUFFekMsMkJBQTJCO1FBQzNCLE1BQU1DLHFCQUFxQixJQUFJUCxtQkFBb0I7WUFDakQ7Z0JBQUVRLE9BQU9YO1lBQWtCO1lBQzNCO2dCQUFFVyxPQUFPWDtnQkFBbUJTLFNBQVM7b0JBQUVHLHFCQUFxQkMsS0FBS0MsR0FBRyxDQUFFLEdBQUcsSUFBSTtnQkFBSztZQUFFO1lBQ3BGO2dCQUFFSCxPQUFPWDtnQkFBbUJTLFNBQVM7b0JBQUVHLHFCQUFxQjtnQkFBRTtZQUFFO1lBQ2hFO2dCQUFFRCxPQUFPVjtZQUFhO1NBQ3ZCO1FBRURHLGFBQWFXLGlCQUFpQixDQUFFTDtRQUVoQyx5Q0FBeUM7UUFDekMsTUFBTU0sMkJBQTJCLElBQUlqQixlQUFnQiwyQkFBMkI7WUFDOUVrQixXQUFXO1lBQ1hDLE1BQU0sSUFBSXJCLFNBQVU7WUFDcEJzQixhQUFhVDtRQUNmO1FBRUEsK0JBQStCO1FBQy9CLE1BQU1VLDJCQUEyQixJQUFJckIsZUFBZ0IsMkJBQTJCO1lBQzlFa0IsV0FBVztZQUNYQyxNQUFNLElBQUlyQixTQUFVO1lBQ3BCc0IsYUFBYWpCO1lBQ2JtQixVQUFVO2dCQUFRWCxtQkFBbUJZLElBQUk7WUFBSTtRQUMvQztRQUVBLEtBQUssQ0FBRTFCLE1BQU87WUFDWjJCLFVBQVU7Z0JBQUVQO2dCQUEwQkk7YUFBMEI7WUFDaEVJLFNBQVM7UUFDWCxHQUFHZjtRQUVILG1CQUFtQjtRQUNuQixJQUFJLENBQUNELGlDQUFpQyxHQUFHO1lBQ3ZDSixhQUFhcUIsb0JBQW9CLENBQUVmO1lBQ25DQSxtQkFBbUJILE9BQU87UUFDNUI7SUFDRjtBQVNGO0FBRUFGLE1BQU1xQixRQUFRLENBQUUsOEJBQThCcEI7QUFDOUMsZUFBZUEsMkJBQTJCIn0=