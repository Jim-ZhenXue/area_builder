// Copyright 2014-2024, University of Colorado Boulder
/**
 * Restart button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import { Shape } from '../../../kite/js/imports.js';
import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import { HBox, Path, Rectangle } from '../../../scenery/js/imports.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import sceneryPhet from '../sceneryPhet.js';
// constants
const scale = 0.75;
const vscale = 1.15;
const barWidth = 4 * scale;
const barHeight = 19 * scale * vscale;
const triangleWidth = 15 * scale;
const triangleHeight = 19 * scale * vscale;
let RestartButton = class RestartButton extends RoundPushButton {
    constructor(providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({}, providedOptions);
        const barPath = new Rectangle(0, 0, barWidth, barHeight, {
            fill: 'black'
        });
        const trianglePath = new Path(new Shape().moveTo(0, triangleHeight / 2).lineTo(-triangleWidth, 0).lineTo(0, -triangleHeight / 2).close(), {
            fill: 'black'
        });
        const trianglePath2 = new Path(new Shape().moveTo(0, triangleHeight / 2).lineTo(-triangleWidth, 0).lineTo(0, -triangleHeight / 2).close(), {
            fill: 'black'
        });
        options.content = new HBox({
            children: [
                barPath,
                trianglePath,
                trianglePath2
            ],
            spacing: -1
        });
        super(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'RestartButton', this);
    }
};
export { RestartButton as default };
sceneryPhet.register('RestartButton', RestartButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc3RhcnRCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmVzdGFydCBidXR0b24uXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgSEJveCwgUGF0aCwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBSb3VuZFB1c2hCdXR0b24sIHsgUm91bmRQdXNoQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JvdW5kUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IHNjYWxlID0gMC43NTtcbmNvbnN0IHZzY2FsZSA9IDEuMTU7XG5jb25zdCBiYXJXaWR0aCA9IDQgKiBzY2FsZTtcbmNvbnN0IGJhckhlaWdodCA9IDE5ICogc2NhbGUgKiB2c2NhbGU7XG5jb25zdCB0cmlhbmdsZVdpZHRoID0gMTUgKiBzY2FsZTtcbmNvbnN0IHRyaWFuZ2xlSGVpZ2h0ID0gMTkgKiBzY2FsZSAqIHZzY2FsZTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIFJlc3RhcnRCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFJvdW5kUHVzaEJ1dHRvbk9wdGlvbnMsICdjb250ZW50Jz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc3RhcnRCdXR0b24gZXh0ZW5kcyBSb3VuZFB1c2hCdXR0b24ge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUmVzdGFydEJ1dHRvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJlc3RhcnRCdXR0b25PcHRpb25zLCBTZWxmT3B0aW9ucywgUm91bmRQdXNoQnV0dG9uT3B0aW9ucz4oKSgge30sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3QgYmFyUGF0aCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGJhcldpZHRoLCBiYXJIZWlnaHQsIHsgZmlsbDogJ2JsYWNrJyB9ICk7XG4gICAgY29uc3QgdHJpYW5nbGVQYXRoID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgdHJpYW5nbGVIZWlnaHQgLyAyICkubGluZVRvKCAtdHJpYW5nbGVXaWR0aCwgMCApLmxpbmVUbyggMCwgLXRyaWFuZ2xlSGVpZ2h0IC8gMiApLmNsb3NlKCksIHtcbiAgICAgIGZpbGw6ICdibGFjaydcbiAgICB9ICk7XG4gICAgY29uc3QgdHJpYW5nbGVQYXRoMiA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKS5tb3ZlVG8oIDAsIHRyaWFuZ2xlSGVpZ2h0IC8gMiApLmxpbmVUbyggLXRyaWFuZ2xlV2lkdGgsIDAgKS5saW5lVG8oIDAsIC10cmlhbmdsZUhlaWdodCAvIDIgKS5jbG9zZSgpLCB7XG4gICAgICBmaWxsOiAnYmxhY2snXG4gICAgfSApO1xuXG4gICAgb3B0aW9ucy5jb250ZW50ID0gbmV3IEhCb3goIHsgY2hpbGRyZW46IFsgYmFyUGF0aCwgdHJpYW5nbGVQYXRoLCB0cmlhbmdsZVBhdGgyIF0sIHNwYWNpbmc6IC0xIH0gKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ1Jlc3RhcnRCdXR0b24nLCB0aGlzICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdSZXN0YXJ0QnV0dG9uJywgUmVzdGFydEJ1dHRvbiApOyJdLCJuYW1lcyI6WyJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJIQm94IiwiUGF0aCIsIlJlY3RhbmdsZSIsIlJvdW5kUHVzaEJ1dHRvbiIsInNjZW5lcnlQaGV0Iiwic2NhbGUiLCJ2c2NhbGUiLCJiYXJXaWR0aCIsImJhckhlaWdodCIsInRyaWFuZ2xlV2lkdGgiLCJ0cmlhbmdsZUhlaWdodCIsIlJlc3RhcnRCdXR0b24iLCJwcm92aWRlZE9wdGlvbnMiLCJ3aW5kb3ciLCJvcHRpb25zIiwiYmFyUGF0aCIsImZpbGwiLCJ0cmlhbmdsZVBhdGgiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjbG9zZSIsInRyaWFuZ2xlUGF0aDIiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiYXNzZXJ0IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxTQUFTQSxLQUFLLFFBQVEsOEJBQThCO0FBQ3BELE9BQU9DLHNCQUFzQiwwREFBMEQ7QUFDdkYsT0FBT0MsZUFBcUMscUNBQXFDO0FBRWpGLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLFFBQVEsaUNBQWlDO0FBQ3ZFLE9BQU9DLHFCQUFpRCw2Q0FBNkM7QUFDckcsT0FBT0MsaUJBQWlCLG9CQUFvQjtBQUU1QyxZQUFZO0FBQ1osTUFBTUMsUUFBUTtBQUNkLE1BQU1DLFNBQVM7QUFDZixNQUFNQyxXQUFXLElBQUlGO0FBQ3JCLE1BQU1HLFlBQVksS0FBS0gsUUFBUUM7QUFDL0IsTUFBTUcsZ0JBQWdCLEtBQUtKO0FBQzNCLE1BQU1LLGlCQUFpQixLQUFLTCxRQUFRQztBQU1yQixJQUFBLEFBQU1LLGdCQUFOLE1BQU1BLHNCQUFzQlI7SUFFekMsWUFBb0JTLGVBQXNDLENBQUc7WUFpQmpEQyxzQ0FBQUEsc0JBQUFBO1FBZlYsTUFBTUMsVUFBVWYsWUFBd0UsQ0FBQyxHQUFHYTtRQUU1RixNQUFNRyxVQUFVLElBQUliLFVBQVcsR0FBRyxHQUFHSyxVQUFVQyxXQUFXO1lBQUVRLE1BQU07UUFBUTtRQUMxRSxNQUFNQyxlQUFlLElBQUloQixLQUFNLElBQUlKLFFBQVFxQixNQUFNLENBQUUsR0FBR1IsaUJBQWlCLEdBQUlTLE1BQU0sQ0FBRSxDQUFDVixlQUFlLEdBQUlVLE1BQU0sQ0FBRSxHQUFHLENBQUNULGlCQUFpQixHQUFJVSxLQUFLLElBQUk7WUFDL0lKLE1BQU07UUFDUjtRQUNBLE1BQU1LLGdCQUFnQixJQUFJcEIsS0FBTSxJQUFJSixRQUFRcUIsTUFBTSxDQUFFLEdBQUdSLGlCQUFpQixHQUFJUyxNQUFNLENBQUUsQ0FBQ1YsZUFBZSxHQUFJVSxNQUFNLENBQUUsR0FBRyxDQUFDVCxpQkFBaUIsR0FBSVUsS0FBSyxJQUFJO1lBQ2hKSixNQUFNO1FBQ1I7UUFFQUYsUUFBUVEsT0FBTyxHQUFHLElBQUl0QixLQUFNO1lBQUV1QixVQUFVO2dCQUFFUjtnQkFBU0U7Z0JBQWNJO2FBQWU7WUFBRUcsU0FBUyxDQUFDO1FBQUU7UUFFOUYsS0FBSyxDQUFFVjtRQUVQLG1HQUFtRztRQUNuR1csWUFBVVosZUFBQUEsT0FBT2EsSUFBSSxzQkFBWGIsdUJBQUFBLGFBQWFjLE9BQU8sc0JBQXBCZCx1Q0FBQUEscUJBQXNCZSxlQUFlLHFCQUFyQ2YscUNBQXVDZ0IsTUFBTSxLQUFJL0IsaUJBQWlCZ0MsZUFBZSxDQUFFLGdCQUFnQixpQkFBaUIsSUFBSTtJQUNwSTtBQUNGO0FBckJBLFNBQXFCbkIsMkJBcUJwQjtBQUVEUCxZQUFZMkIsUUFBUSxDQUFFLGlCQUFpQnBCIn0=