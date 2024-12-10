// Copyright 2014-2024, University of Colorado Boulder
/**
 * LevelSelectionButton is a push button for selecting a game level. It is typically created by LevelSelectionButtonGroup.
 * The original specification was done in https://github.com/phetsims/vegas/issues/59, but there have been numerous
 * changes since then.
 *
 * Note that LevelSelectionButton originally supported an optional 'best time' display. That display was intentionally
 * removed from LevelSelectionButton, and from the level-selection user-interface in general, as the result of
 * a design meeting on 10/15/2023. See https://github.com/phetsims/vegas/issues/120#issuecomment-1858310218.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Andrea Lin
 */ import Dimension2 from '../../dot/js/Dimension2.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Rectangle } from '../../scenery/js/imports.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import SoundClip from '../../tambo/js/sound-generators/SoundClip.js';
import soundConstants from '../../tambo/js/soundConstants.js';
import soundManager from '../../tambo/js/soundManager.js';
import Tandem from '../../tandem/js/Tandem.js';
import levelSelectionButton_mp3 from '../sounds/levelSelectionButton_mp3.js';
import ScoreDisplayStars from './ScoreDisplayStars.js';
import vegas from './vegas.js';
let LevelSelectionButton = class LevelSelectionButton extends RectangularPushButton {
    /**
   * Creates a new icon with specific dimensions. The provided icon is scaled to fit, and a background with the
   * specified size is added to ensure that the size of the returned Node is correct.
   */ static createSizedImageNode(icon, size) {
        const backgroundNode = Rectangle.dimension(size);
        // The icon's size may change dynamically, for example if it includes localized text.
        // See https://github.com/phetsims/vegas/issues/129.
        icon.localBoundsProperty.link(()=>{
            icon.scale(Math.min(size.width / icon.bounds.width, size.height / icon.bounds.height));
            icon.center = backgroundNode.center;
        });
        return new Node({
            children: [
                backgroundNode,
                icon
            ]
        });
    }
    dispose() {
        this.disposeLevelSelectionButton();
        super.dispose();
    }
    /**
   * @param icon - appears on the button above the score display, scaled to fit
   * @param scoreProperty
   * @param providedOptions
   */ constructor(icon, scoreProperty, providedOptions){
        const options = optionize()({
            // SelfOptions
            buttonWidth: 150,
            buttonHeight: 150,
            createScoreDisplay: ()=>new ScoreDisplayStars(scoreProperty),
            scoreDisplayProportion: 0.2,
            scoreDisplayMinXMargin: 10,
            scoreDisplayMinYMargin: 5,
            iconToScoreDisplayYSpace: 10,
            // RectangularPushButton options
            cornerRadius: 10,
            baseColor: 'rgb( 242, 255, 204 )',
            xMargin: 10,
            yMargin: 10,
            soundPlayerIndex: 0,
            // phet-io
            tandem: Tandem.REQUIRED
        }, providedOptions);
        assert && assert(options.soundPlayerIndex >= 0, `invalid soundPlayerIndex: ${options.soundPlayerIndex}`);
        const maxContentWidth = options.buttonWidth - 2 * options.xMargin;
        const scoreDisplay = options.createScoreDisplay(scoreProperty);
        // Background behind scoreDisplay
        const scoreDisplayBackgroundHeight = options.buttonHeight * options.scoreDisplayProportion;
        const scoreDisplayBackground = new Rectangle(0, 0, maxContentWidth, scoreDisplayBackgroundHeight, {
            cornerRadius: options.cornerRadius,
            fill: 'white',
            stroke: 'black',
            pickable: false
        });
        // constrain scoreDisplay to fit in scoreDisplayBackground
        scoreDisplay.maxWidth = scoreDisplayBackground.width - 2 * options.scoreDisplayMinXMargin;
        scoreDisplay.maxHeight = scoreDisplayBackground.height - 2 * options.scoreDisplayMinYMargin;
        // Icon, scaled and padded to fit and to make the button size correct.
        const iconHeight = options.buttonHeight - scoreDisplayBackground.height - 2 * options.yMargin - options.iconToScoreDisplayYSpace;
        const iconSize = new Dimension2(maxContentWidth, iconHeight);
        const adjustedIcon = LevelSelectionButton.createSizedImageNode(icon, iconSize);
        adjustedIcon.centerX = scoreDisplayBackground.centerX;
        adjustedIcon.bottom = scoreDisplayBackground.top - options.iconToScoreDisplayYSpace;
        // Keep scoreDisplay centered in its background when its bounds change
        const scoreDisplayUpdateLayout = ()=>{
            scoreDisplay.center = scoreDisplayBackground.center;
        };
        scoreDisplay.boundsProperty.lazyLink(scoreDisplayUpdateLayout);
        scoreDisplayUpdateLayout();
        options.content = new Node({
            children: [
                adjustedIcon,
                scoreDisplayBackground,
                scoreDisplay
            ]
        });
        // If no sound player was provided, create the default.
        if (options.soundPlayer === undefined) {
            const soundClip = new SoundClip(levelSelectionButton_mp3, {
                initialOutputLevel: 0.5,
                rateChangesAffectPlayingSounds: false
            });
            soundManager.addSoundGenerator(soundClip, {
                categoryName: 'user-interface'
            });
            options.soundPlayer = {
                play () {
                    soundClip.setPlaybackRate(Math.pow(soundConstants.TWELFTH_ROOT_OF_TWO, options.soundPlayerIndex), 0);
                    soundClip.play();
                },
                stop () {
                    soundClip.stop();
                }
            };
        }
        super(options);
        this.disposeLevelSelectionButton = ()=>{
            scoreDisplay.dispose();
        };
    }
};
export { LevelSelectionButton as default };
vegas.register('LevelSelectionButton', LevelSelectionButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0xldmVsU2VsZWN0aW9uQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIExldmVsU2VsZWN0aW9uQnV0dG9uIGlzIGEgcHVzaCBidXR0b24gZm9yIHNlbGVjdGluZyBhIGdhbWUgbGV2ZWwuIEl0IGlzIHR5cGljYWxseSBjcmVhdGVkIGJ5IExldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAuXG4gKiBUaGUgb3JpZ2luYWwgc3BlY2lmaWNhdGlvbiB3YXMgZG9uZSBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVnYXMvaXNzdWVzLzU5LCBidXQgdGhlcmUgaGF2ZSBiZWVuIG51bWVyb3VzXG4gKiBjaGFuZ2VzIHNpbmNlIHRoZW4uXG4gKlxuICogTm90ZSB0aGF0IExldmVsU2VsZWN0aW9uQnV0dG9uIG9yaWdpbmFsbHkgc3VwcG9ydGVkIGFuIG9wdGlvbmFsICdiZXN0IHRpbWUnIGRpc3BsYXkuIFRoYXQgZGlzcGxheSB3YXMgaW50ZW50aW9uYWxseVxuICogcmVtb3ZlZCBmcm9tIExldmVsU2VsZWN0aW9uQnV0dG9uLCBhbmQgZnJvbSB0aGUgbGV2ZWwtc2VsZWN0aW9uIHVzZXItaW50ZXJmYWNlIGluIGdlbmVyYWwsIGFzIHRoZSByZXN1bHQgb2ZcbiAqIGEgZGVzaWduIG1lZXRpbmcgb24gMTAvMTUvMjAyMy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWdhcy9pc3N1ZXMvMTIwI2lzc3VlY29tbWVudC0xODU4MzEwMjE4LlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKiBAYXV0aG9yIEFuZHJlYSBMaW5cbiAqL1xuXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiwgeyBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xuaW1wb3J0IHNvdW5kQ29uc3RhbnRzIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NvdW5kQ29uc3RhbnRzLmpzJztcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvc291bmRNYW5hZ2VyLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgbGV2ZWxTZWxlY3Rpb25CdXR0b25fbXAzIGZyb20gJy4uL3NvdW5kcy9sZXZlbFNlbGVjdGlvbkJ1dHRvbl9tcDMuanMnO1xuaW1wb3J0IFNjb3JlRGlzcGxheVN0YXJzIGZyb20gJy4vU2NvcmVEaXNwbGF5U3RhcnMuanMnO1xuaW1wb3J0IHZlZ2FzIGZyb20gJy4vdmVnYXMuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIFVzZWQgdG8gc2l6ZSB0aGUgY29udGVudFxuICBidXR0b25XaWR0aD86IG51bWJlcjtcbiAgYnV0dG9uSGVpZ2h0PzogbnVtYmVyO1xuXG4gIC8vIHNjb3JlIGRpc3BsYXlcbiAgY3JlYXRlU2NvcmVEaXNwbGF5PzogKCBzY29yZVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPiApID0+IE5vZGU7XG4gIHNjb3JlRGlzcGxheVByb3BvcnRpb24/OiBudW1iZXI7IC8vIHBlcmNlbnRhZ2Ugb2YgdGhlIGJ1dHRvbiBoZWlnaHQgb2NjdXBpZWQgYnkgc2NvcmVEaXNwbGF5LCAoMCwwLjVdXG4gIHNjb3JlRGlzcGxheU1pblhNYXJnaW4/OiBudW1iZXI7IC8vIGhvcml6b250YWwgbWFyZ2luIGJldHdlZW4gc2NvcmVEaXNwbGF5IGFuZCBpdHMgYmFja2dyb3VuZFxuICBzY29yZURpc3BsYXlNaW5ZTWFyZ2luPzogbnVtYmVyOyAgLy8gdmVydGljYWwgbWFyZ2luIGJldHdlZW4gc2NvcmVEaXNwbGF5IGFuZCBpdHMgYmFja2dyb3VuZFxuICBpY29uVG9TY29yZURpc3BsYXlZU3BhY2U/OiBudW1iZXI7IC8vIHZlcnRpY2FsIHNwYWNlIGJldHdlZW4gaWNvbiBhbmQgc2NvcmUgZGlzcGxheVxuXG4gIC8vIENvbmZpZ3VyZXMgdGhlIHNvdW5kUGxheWVyIGZvciBhIHNwZWNpZmljIGdhbWUgbGV2ZWwuIE5vdGUgdGhhdCB0aGlzIGFzc3VtZXMgemVyby1iYXNlZCBpbmRleGluZyBmb3IgZ2FtZSBsZXZlbCxcbiAgLy8gd2hpY2ggaXMgb2Z0ZW4gbm90IHRoZSBjYXNlLiBUaGlzIG9wdGlvbiBpcyBpZ25vcmVkIGlmIFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnMuc291bmRQbGF5ZXIgaXMgcHJvdmlkZWQuXG4gIHNvdW5kUGxheWVySW5kZXg/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBMZXZlbFNlbGVjdGlvbkJ1dHRvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucywgJ2NvbnRlbnQnPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGV2ZWxTZWxlY3Rpb25CdXR0b24gZXh0ZW5kcyBSZWN0YW5ndWxhclB1c2hCdXR0b24ge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUxldmVsU2VsZWN0aW9uQnV0dG9uOiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gaWNvbiAtIGFwcGVhcnMgb24gdGhlIGJ1dHRvbiBhYm92ZSB0aGUgc2NvcmUgZGlzcGxheSwgc2NhbGVkIHRvIGZpdFxuICAgKiBAcGFyYW0gc2NvcmVQcm9wZXJ0eVxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGljb246IE5vZGUsIHNjb3JlUHJvcGVydHk6IFRQcm9wZXJ0eTxudW1iZXI+LCBwcm92aWRlZE9wdGlvbnM/OiBMZXZlbFNlbGVjdGlvbkJ1dHRvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPExldmVsU2VsZWN0aW9uQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGJ1dHRvbldpZHRoOiAxNTAsXG4gICAgICBidXR0b25IZWlnaHQ6IDE1MCxcbiAgICAgIGNyZWF0ZVNjb3JlRGlzcGxheTogKCkgPT4gbmV3IFNjb3JlRGlzcGxheVN0YXJzKCBzY29yZVByb3BlcnR5ICksXG4gICAgICBzY29yZURpc3BsYXlQcm9wb3J0aW9uOiAwLjIsXG4gICAgICBzY29yZURpc3BsYXlNaW5YTWFyZ2luOiAxMCxcbiAgICAgIHNjb3JlRGlzcGxheU1pbllNYXJnaW46IDUsXG4gICAgICBpY29uVG9TY29yZURpc3BsYXlZU3BhY2U6IDEwLFxuXG4gICAgICAvLyBSZWN0YW5ndWxhclB1c2hCdXR0b24gb3B0aW9uc1xuICAgICAgY29ybmVyUmFkaXVzOiAxMCxcbiAgICAgIGJhc2VDb2xvcjogJ3JnYiggMjQyLCAyNTUsIDIwNCApJyxcbiAgICAgIHhNYXJnaW46IDEwLFxuICAgICAgeU1hcmdpbjogMTAsXG4gICAgICBzb3VuZFBsYXllckluZGV4OiAwLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zb3VuZFBsYXllckluZGV4ID49IDAsIGBpbnZhbGlkIHNvdW5kUGxheWVySW5kZXg6ICR7b3B0aW9ucy5zb3VuZFBsYXllckluZGV4fWAgKTtcblxuICAgIGNvbnN0IG1heENvbnRlbnRXaWR0aCA9IG9wdGlvbnMuYnV0dG9uV2lkdGggLSAyICogb3B0aW9ucy54TWFyZ2luO1xuXG4gICAgY29uc3Qgc2NvcmVEaXNwbGF5ID0gb3B0aW9ucy5jcmVhdGVTY29yZURpc3BsYXkoIHNjb3JlUHJvcGVydHkgKTtcblxuICAgIC8vIEJhY2tncm91bmQgYmVoaW5kIHNjb3JlRGlzcGxheVxuICAgIGNvbnN0IHNjb3JlRGlzcGxheUJhY2tncm91bmRIZWlnaHQgPSBvcHRpb25zLmJ1dHRvbkhlaWdodCAqIG9wdGlvbnMuc2NvcmVEaXNwbGF5UHJvcG9ydGlvbjtcbiAgICBjb25zdCBzY29yZURpc3BsYXlCYWNrZ3JvdW5kID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgbWF4Q29udGVudFdpZHRoLCBzY29yZURpc3BsYXlCYWNrZ3JvdW5kSGVpZ2h0LCB7XG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxuICAgICAgZmlsbDogJ3doaXRlJyxcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKTtcblxuICAgIC8vIGNvbnN0cmFpbiBzY29yZURpc3BsYXkgdG8gZml0IGluIHNjb3JlRGlzcGxheUJhY2tncm91bmRcbiAgICBzY29yZURpc3BsYXkubWF4V2lkdGggPSBzY29yZURpc3BsYXlCYWNrZ3JvdW5kLndpZHRoIC0gKCAyICogb3B0aW9ucy5zY29yZURpc3BsYXlNaW5YTWFyZ2luICk7XG4gICAgc2NvcmVEaXNwbGF5Lm1heEhlaWdodCA9IHNjb3JlRGlzcGxheUJhY2tncm91bmQuaGVpZ2h0IC0gKCAyICogb3B0aW9ucy5zY29yZURpc3BsYXlNaW5ZTWFyZ2luICk7XG5cbiAgICAvLyBJY29uLCBzY2FsZWQgYW5kIHBhZGRlZCB0byBmaXQgYW5kIHRvIG1ha2UgdGhlIGJ1dHRvbiBzaXplIGNvcnJlY3QuXG4gICAgY29uc3QgaWNvbkhlaWdodCA9IG9wdGlvbnMuYnV0dG9uSGVpZ2h0IC0gc2NvcmVEaXNwbGF5QmFja2dyb3VuZC5oZWlnaHQgLSAyICogb3B0aW9ucy55TWFyZ2luIC0gb3B0aW9ucy5pY29uVG9TY29yZURpc3BsYXlZU3BhY2U7XG4gICAgY29uc3QgaWNvblNpemUgPSBuZXcgRGltZW5zaW9uMiggbWF4Q29udGVudFdpZHRoLCBpY29uSGVpZ2h0ICk7XG4gICAgY29uc3QgYWRqdXN0ZWRJY29uID0gTGV2ZWxTZWxlY3Rpb25CdXR0b24uY3JlYXRlU2l6ZWRJbWFnZU5vZGUoIGljb24sIGljb25TaXplICk7XG4gICAgYWRqdXN0ZWRJY29uLmNlbnRlclggPSBzY29yZURpc3BsYXlCYWNrZ3JvdW5kLmNlbnRlclg7XG4gICAgYWRqdXN0ZWRJY29uLmJvdHRvbSA9IHNjb3JlRGlzcGxheUJhY2tncm91bmQudG9wIC0gb3B0aW9ucy5pY29uVG9TY29yZURpc3BsYXlZU3BhY2U7XG5cbiAgICAvLyBLZWVwIHNjb3JlRGlzcGxheSBjZW50ZXJlZCBpbiBpdHMgYmFja2dyb3VuZCB3aGVuIGl0cyBib3VuZHMgY2hhbmdlXG4gICAgY29uc3Qgc2NvcmVEaXNwbGF5VXBkYXRlTGF5b3V0ID0gKCkgPT4ge1xuICAgICAgc2NvcmVEaXNwbGF5LmNlbnRlciA9IHNjb3JlRGlzcGxheUJhY2tncm91bmQuY2VudGVyO1xuICAgIH07XG4gICAgc2NvcmVEaXNwbGF5LmJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCBzY29yZURpc3BsYXlVcGRhdGVMYXlvdXQgKTtcbiAgICBzY29yZURpc3BsYXlVcGRhdGVMYXlvdXQoKTtcblxuICAgIG9wdGlvbnMuY29udGVudCA9IG5ldyBOb2RlKCB7XG4gICAgICBjaGlsZHJlbjogWyBhZGp1c3RlZEljb24sIHNjb3JlRGlzcGxheUJhY2tncm91bmQsIHNjb3JlRGlzcGxheSBdXG4gICAgfSApO1xuXG4gICAgLy8gSWYgbm8gc291bmQgcGxheWVyIHdhcyBwcm92aWRlZCwgY3JlYXRlIHRoZSBkZWZhdWx0LlxuICAgIGlmICggb3B0aW9ucy5zb3VuZFBsYXllciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgY29uc3Qgc291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggbGV2ZWxTZWxlY3Rpb25CdXR0b25fbXAzLCB7XG4gICAgICAgIGluaXRpYWxPdXRwdXRMZXZlbDogMC41LFxuICAgICAgICByYXRlQ2hhbmdlc0FmZmVjdFBsYXlpbmdTb3VuZHM6IGZhbHNlXG4gICAgICB9ICk7XG4gICAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIHNvdW5kQ2xpcCwgeyBjYXRlZ29yeU5hbWU6ICd1c2VyLWludGVyZmFjZScgfSApO1xuICAgICAgb3B0aW9ucy5zb3VuZFBsYXllciA9IHtcbiAgICAgICAgcGxheSgpIHtcbiAgICAgICAgICBzb3VuZENsaXAuc2V0UGxheWJhY2tSYXRlKCBNYXRoLnBvdyggc291bmRDb25zdGFudHMuVFdFTEZUSF9ST09UX09GX1RXTywgb3B0aW9ucy5zb3VuZFBsYXllckluZGV4ICksIDAgKTtcbiAgICAgICAgICBzb3VuZENsaXAucGxheSgpO1xuICAgICAgICB9LFxuICAgICAgICBzdG9wKCkge1xuICAgICAgICAgIHNvdW5kQ2xpcC5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcG9zZUxldmVsU2VsZWN0aW9uQnV0dG9uID0gKCkgPT4ge1xuICAgICAgc2NvcmVEaXNwbGF5LmRpc3Bvc2UoKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaWNvbiB3aXRoIHNwZWNpZmljIGRpbWVuc2lvbnMuIFRoZSBwcm92aWRlZCBpY29uIGlzIHNjYWxlZCB0byBmaXQsIGFuZCBhIGJhY2tncm91bmQgd2l0aCB0aGVcbiAgICogc3BlY2lmaWVkIHNpemUgaXMgYWRkZWQgdG8gZW5zdXJlIHRoYXQgdGhlIHNpemUgb2YgdGhlIHJldHVybmVkIE5vZGUgaXMgY29ycmVjdC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlU2l6ZWRJbWFnZU5vZGUoIGljb246IE5vZGUsIHNpemU6IERpbWVuc2lvbjIgKTogTm9kZSB7XG5cbiAgICBjb25zdCBiYWNrZ3JvdW5kTm9kZSA9IFJlY3RhbmdsZS5kaW1lbnNpb24oIHNpemUgKTtcblxuICAgIC8vIFRoZSBpY29uJ3Mgc2l6ZSBtYXkgY2hhbmdlIGR5bmFtaWNhbGx5LCBmb3IgZXhhbXBsZSBpZiBpdCBpbmNsdWRlcyBsb2NhbGl6ZWQgdGV4dC5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlZ2FzL2lzc3Vlcy8xMjkuXG4gICAgaWNvbi5sb2NhbEJvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcbiAgICAgIGljb24uc2NhbGUoIE1hdGgubWluKCBzaXplLndpZHRoIC8gaWNvbi5ib3VuZHMud2lkdGgsIHNpemUuaGVpZ2h0IC8gaWNvbi5ib3VuZHMuaGVpZ2h0ICkgKTtcbiAgICAgIGljb24uY2VudGVyID0gYmFja2dyb3VuZE5vZGUuY2VudGVyO1xuICAgIH0gKTtcblxuICAgIHJldHVybiBuZXcgTm9kZSgge1xuICAgICAgY2hpbGRyZW46IFsgYmFja2dyb3VuZE5vZGUsIGljb24gXVxuICAgIH0gKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUxldmVsU2VsZWN0aW9uQnV0dG9uKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnTGV2ZWxTZWxlY3Rpb25CdXR0b24nLCBMZXZlbFNlbGVjdGlvbkJ1dHRvbiApOyJdLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwib3B0aW9uaXplIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIlNvdW5kQ2xpcCIsInNvdW5kQ29uc3RhbnRzIiwic291bmRNYW5hZ2VyIiwiVGFuZGVtIiwibGV2ZWxTZWxlY3Rpb25CdXR0b25fbXAzIiwiU2NvcmVEaXNwbGF5U3RhcnMiLCJ2ZWdhcyIsIkxldmVsU2VsZWN0aW9uQnV0dG9uIiwiY3JlYXRlU2l6ZWRJbWFnZU5vZGUiLCJpY29uIiwic2l6ZSIsImJhY2tncm91bmROb2RlIiwiZGltZW5zaW9uIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJzY2FsZSIsIk1hdGgiLCJtaW4iLCJ3aWR0aCIsImJvdW5kcyIsImhlaWdodCIsImNlbnRlciIsImNoaWxkcmVuIiwiZGlzcG9zZSIsImRpc3Bvc2VMZXZlbFNlbGVjdGlvbkJ1dHRvbiIsInNjb3JlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYnV0dG9uV2lkdGgiLCJidXR0b25IZWlnaHQiLCJjcmVhdGVTY29yZURpc3BsYXkiLCJzY29yZURpc3BsYXlQcm9wb3J0aW9uIiwic2NvcmVEaXNwbGF5TWluWE1hcmdpbiIsInNjb3JlRGlzcGxheU1pbllNYXJnaW4iLCJpY29uVG9TY29yZURpc3BsYXlZU3BhY2UiLCJjb3JuZXJSYWRpdXMiLCJiYXNlQ29sb3IiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInNvdW5kUGxheWVySW5kZXgiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImFzc2VydCIsIm1heENvbnRlbnRXaWR0aCIsInNjb3JlRGlzcGxheSIsInNjb3JlRGlzcGxheUJhY2tncm91bmRIZWlnaHQiLCJzY29yZURpc3BsYXlCYWNrZ3JvdW5kIiwiZmlsbCIsInN0cm9rZSIsInBpY2thYmxlIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJpY29uSGVpZ2h0IiwiaWNvblNpemUiLCJhZGp1c3RlZEljb24iLCJjZW50ZXJYIiwiYm90dG9tIiwidG9wIiwic2NvcmVEaXNwbGF5VXBkYXRlTGF5b3V0IiwiYm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsImNvbnRlbnQiLCJzb3VuZFBsYXllciIsInVuZGVmaW5lZCIsInNvdW5kQ2xpcCIsImluaXRpYWxPdXRwdXRMZXZlbCIsInJhdGVDaGFuZ2VzQWZmZWN0UGxheWluZ1NvdW5kcyIsImFkZFNvdW5kR2VuZXJhdG9yIiwiY2F0ZWdvcnlOYW1lIiwicGxheSIsInNldFBsYXliYWNrUmF0ZSIsInBvdyIsIlRXRUxGVEhfUk9PVF9PRl9UV08iLCJzdG9wIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7O0NBWUMsR0FHRCxPQUFPQSxnQkFBZ0IsNkJBQTZCO0FBQ3BELE9BQU9DLGVBQWUsa0NBQWtDO0FBRXhELFNBQVNDLElBQUksRUFBRUMsU0FBUyxRQUFRLDhCQUE4QjtBQUM5RCxPQUFPQywyQkFBNkQsZ0RBQWdEO0FBQ3BILE9BQU9DLGVBQWUsK0NBQStDO0FBQ3JFLE9BQU9DLG9CQUFvQixtQ0FBbUM7QUFDOUQsT0FBT0Msa0JBQWtCLGlDQUFpQztBQUMxRCxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQyw4QkFBOEIsd0NBQXdDO0FBQzdFLE9BQU9DLHVCQUF1Qix5QkFBeUI7QUFDdkQsT0FBT0MsV0FBVyxhQUFhO0FBc0JoQixJQUFBLEFBQU1DLHVCQUFOLE1BQU1BLDZCQUE2QlI7SUErRmhEOzs7R0FHQyxHQUNELE9BQWNTLHFCQUFzQkMsSUFBVSxFQUFFQyxJQUFnQixFQUFTO1FBRXZFLE1BQU1DLGlCQUFpQmIsVUFBVWMsU0FBUyxDQUFFRjtRQUU1QyxxRkFBcUY7UUFDckYsb0RBQW9EO1FBQ3BERCxLQUFLSSxtQkFBbUIsQ0FBQ0MsSUFBSSxDQUFFO1lBQzdCTCxLQUFLTSxLQUFLLENBQUVD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