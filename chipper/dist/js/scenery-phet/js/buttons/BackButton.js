// Copyright 2014-2024, University of Colorado Boulder
/**
 * Button that is intended to indicate going backwards, much like the back button on a web browser.  It was originally
 * created for returning to the level selection screen when playing a game.  It looks like a button with an arrow
 * pointing to the left.
 *
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 */ import optionize from '../../../phet-core/js/optionize.js';
import { Path } from '../../../scenery/js/imports.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import goBack_mp3 from '../../sounds/goBack_mp3.js';
import ArrowShape from '../ArrowShape.js';
import PhetColorScheme from '../PhetColorScheme.js';
import sceneryPhet from '../sceneryPhet.js';
let BackButton = class BackButton extends RectangularPushButton {
    constructor(providedOptions){
        const options = optionize()({
            // Default margin values were set up to make this button match the size of the refresh button, since these
            // buttons often appear together.  See see https://github.com/phetsims/scenery-phet/issues/44.
            xMargin: 8,
            yMargin: 10.9,
            baseColor: PhetColorScheme.BUTTON_YELLOW
        }, providedOptions);
        // Create and add the default sound generator if none was provided.
        if (!options.soundPlayer) {
            const goBackSoundClip = new SoundClip(goBack_mp3, {
                initialOutputLevel: 0.35
            });
            soundManager.addSoundGenerator(goBackSoundClip, {
                categoryName: 'user-interface'
            });
            options.soundPlayer = goBackSoundClip;
        }
        const arrowShape = new ArrowShape(0, 0, -28.5, 0, {
            tailWidth: 8,
            headWidth: 18,
            headHeight: 15
        });
        options.content = new Path(arrowShape, {
            fill: 'black'
        });
        super(options);
    }
};
export { BackButton as default };
sceneryPhet.register('BackButton', BackButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0JhY2tCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQnV0dG9uIHRoYXQgaXMgaW50ZW5kZWQgdG8gaW5kaWNhdGUgZ29pbmcgYmFja3dhcmRzLCBtdWNoIGxpa2UgdGhlIGJhY2sgYnV0dG9uIG9uIGEgd2ViIGJyb3dzZXIuICBJdCB3YXMgb3JpZ2luYWxseVxuICogY3JlYXRlZCBmb3IgcmV0dXJuaW5nIHRvIHRoZSBsZXZlbCBzZWxlY3Rpb24gc2NyZWVuIHdoZW4gcGxheWluZyBhIGdhbWUuICBJdCBsb29rcyBsaWtlIGEgYnV0dG9uIHdpdGggYW4gYXJyb3dcbiAqIHBvaW50aW5nIHRvIHRoZSBsZWZ0LlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiwgeyBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xuaW1wb3J0IHNvdW5kTWFuYWdlciBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9zb3VuZE1hbmFnZXIuanMnO1xuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9UU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IGdvQmFja19tcDMgZnJvbSAnLi4vLi4vc291bmRzL2dvQmFja19tcDMuanMnO1xuaW1wb3J0IEFycm93U2hhcGUgZnJvbSAnLi4vQXJyb3dTaGFwZS5qcyc7XG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uL1BoZXRDb2xvclNjaGVtZS5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBzb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcbn07XG5cbmV4cG9ydCB0eXBlIEJhY2tCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnMsICdjb250ZW50Jz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhY2tCdXR0b24gZXh0ZW5kcyBSZWN0YW5ndWxhclB1c2hCdXR0b24ge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogQmFja0J1dHRvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJhY2tCdXR0b25PcHRpb25zLCBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnc291bmRQbGF5ZXInPiwgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBEZWZhdWx0IG1hcmdpbiB2YWx1ZXMgd2VyZSBzZXQgdXAgdG8gbWFrZSB0aGlzIGJ1dHRvbiBtYXRjaCB0aGUgc2l6ZSBvZiB0aGUgcmVmcmVzaCBidXR0b24sIHNpbmNlIHRoZXNlXG4gICAgICAvLyBidXR0b25zIG9mdGVuIGFwcGVhciB0b2dldGhlci4gIFNlZSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNDQuXG4gICAgICB4TWFyZ2luOiA4LFxuICAgICAgeU1hcmdpbjogMTAuOSxcblxuICAgICAgYmFzZUNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuQlVUVE9OX1lFTExPV1xuXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgZGVmYXVsdCBzb3VuZCBnZW5lcmF0b3IgaWYgbm9uZSB3YXMgcHJvdmlkZWQuXG4gICAgaWYgKCAhb3B0aW9ucy5zb3VuZFBsYXllciApIHtcbiAgICAgIGNvbnN0IGdvQmFja1NvdW5kQ2xpcCA9IG5ldyBTb3VuZENsaXAoIGdvQmFja19tcDMsIHsgaW5pdGlhbE91dHB1dExldmVsOiAwLjM1IH0gKTtcbiAgICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggZ29CYWNrU291bmRDbGlwLCB7IGNhdGVnb3J5TmFtZTogJ3VzZXItaW50ZXJmYWNlJyB9ICk7XG4gICAgICBvcHRpb25zLnNvdW5kUGxheWVyID0gZ29CYWNrU291bmRDbGlwO1xuICAgIH1cblxuICAgIGNvbnN0IGFycm93U2hhcGUgPSBuZXcgQXJyb3dTaGFwZSggMCwgMCwgLTI4LjUsIDAsIHtcbiAgICAgIHRhaWxXaWR0aDogOCxcbiAgICAgIGhlYWRXaWR0aDogMTgsXG4gICAgICBoZWFkSGVpZ2h0OiAxNVxuICAgIH0gKTtcbiAgICBvcHRpb25zLmNvbnRlbnQgPSBuZXcgUGF0aCggYXJyb3dTaGFwZSwgeyBmaWxsOiAnYmxhY2snIH0gKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdCYWNrQnV0dG9uJywgQmFja0J1dHRvbiApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJQYXRoIiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiU291bmRDbGlwIiwic291bmRNYW5hZ2VyIiwiZ29CYWNrX21wMyIsIkFycm93U2hhcGUiLCJQaGV0Q29sb3JTY2hlbWUiLCJzY2VuZXJ5UGhldCIsIkJhY2tCdXR0b24iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwieE1hcmdpbiIsInlNYXJnaW4iLCJiYXNlQ29sb3IiLCJCVVRUT05fWUVMTE9XIiwic291bmRQbGF5ZXIiLCJnb0JhY2tTb3VuZENsaXAiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJhZGRTb3VuZEdlbmVyYXRvciIsImNhdGVnb3J5TmFtZSIsImFycm93U2hhcGUiLCJ0YWlsV2lkdGgiLCJoZWFkV2lkdGgiLCJoZWFkSGVpZ2h0IiwiY29udGVudCIsImZpbGwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxlQUFlLHFDQUFxQztBQUUzRCxTQUFTQyxJQUFJLFFBQVEsaUNBQWlDO0FBQ3RELE9BQU9DLDJCQUE2RCxtREFBbUQ7QUFDdkgsT0FBT0MsZUFBZSxrREFBa0Q7QUFDeEUsT0FBT0Msa0JBQWtCLG9DQUFvQztBQUU3RCxPQUFPQyxnQkFBZ0IsNkJBQTZCO0FBQ3BELE9BQU9DLGdCQUFnQixtQkFBbUI7QUFDMUMsT0FBT0MscUJBQXFCLHdCQUF3QjtBQUNwRCxPQUFPQyxpQkFBaUIsb0JBQW9CO0FBUTdCLElBQUEsQUFBTUMsYUFBTixNQUFNQSxtQkFBbUJQO0lBRXRDLFlBQW9CUSxlQUFtQyxDQUFHO1FBRXhELE1BQU1DLFVBQVVYLFlBQXNHO1lBRXBILDBHQUEwRztZQUMxRyw4RkFBOEY7WUFDOUZZLFNBQVM7WUFDVEMsU0FBUztZQUVUQyxXQUFXUCxnQkFBZ0JRLGFBQWE7UUFFMUMsR0FBR0w7UUFFSCxtRUFBbUU7UUFDbkUsSUFBSyxDQUFDQyxRQUFRSyxXQUFXLEVBQUc7WUFDMUIsTUFBTUMsa0JBQWtCLElBQUlkLFVBQVdFLFlBQVk7Z0JBQUVhLG9CQUFvQjtZQUFLO1lBQzlFZCxhQUFhZSxpQkFBaUIsQ0FBRUYsaUJBQWlCO2dCQUFFRyxjQUFjO1lBQWlCO1lBQ2xGVCxRQUFRSyxXQUFXLEdBQUdDO1FBQ3hCO1FBRUEsTUFBTUksYUFBYSxJQUFJZixXQUFZLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRztZQUNqRGdCLFdBQVc7WUFDWEMsV0FBVztZQUNYQyxZQUFZO1FBQ2Q7UUFDQWIsUUFBUWMsT0FBTyxHQUFHLElBQUl4QixLQUFNb0IsWUFBWTtZQUFFSyxNQUFNO1FBQVE7UUFFeEQsS0FBSyxDQUFFZjtJQUNUO0FBQ0Y7QUEvQkEsU0FBcUJGLHdCQStCcEI7QUFFREQsWUFBWW1CLFFBQVEsQ0FBRSxjQUFjbEIifQ==