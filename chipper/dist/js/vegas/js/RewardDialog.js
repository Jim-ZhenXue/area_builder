// Copyright 2018-2024, University of Colorado Boulder
/**
 * A dialog that the client displays when the user gets a specific number of stars.
 * See specification in https://github.com/phetsims/vegas/issues/59.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */ import NumberProperty from '../../axon/js/NumberProperty.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { HBox, Image, Text, VBox } from '../../scenery/js/imports.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import Dialog from '../../sun/js/Dialog.js';
import phetGirlJugglingStars_png from '../images/phetGirlJugglingStars_png.js';
import ScoreDisplayNumberAndStar from './ScoreDisplayNumberAndStar.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';
// constants
const DEFAULT_BUTTONS_FONT = new PhetFont(20);
const DEFAULT_SCORE_DISPLAY_FONT = new PhetFont({
    size: 38,
    weight: 'bold'
});
let RewardDialog = class RewardDialog extends Dialog {
    constructor(score, providedOptions){
        var _options_tandem, _options_tandem1;
        const options = optionize()({
            // RewardDialogOptions
            phetGirlScale: 0.6,
            buttonsFont: DEFAULT_BUTTONS_FONT,
            buttonsWidth: 145,
            buttonsYSpacing: 20,
            keepGoingButtonListener: _.noop,
            newLevelButtonListener: _.noop,
            scoreDisplayOptions: {
                font: DEFAULT_SCORE_DISPLAY_FONT,
                spacing: 8,
                starNodeOptions: {
                    starShapeOptions: {
                        outerRadius: 20,
                        innerRadius: 10
                    },
                    filledLineWidth: 2
                }
            },
            // DialogOptions
            // pdom - Since we are setting the focusOnShowNode to be the first element in content, put the closeButton last
            closeButtonLastInPDOM: true
        }, providedOptions);
        const phetGirlNode = new Image(phetGirlJugglingStars_png, {
            scale: options.phetGirlScale
        });
        const scoreProperty = typeof score === 'number' ? new NumberProperty(score) : score;
        const scoreDisplay = new ScoreDisplayNumberAndStar(scoreProperty, options.scoreDisplayOptions);
        const buttonOptions = {
            font: options.buttonsFont,
            minWidth: options.buttonsWidth,
            maxWidth: options.buttonsWidth
        };
        const textOptions = {
            font: DEFAULT_BUTTONS_FONT,
            maxWidth: options.buttonsWidth * 0.9
        };
        const newLevelButton = new RectangularPushButton(combineOptions({}, buttonOptions, {
            content: new Text(VegasStrings.newLevelStringProperty, textOptions),
            listener: options.newLevelButtonListener,
            baseColor: PhetColorScheme.PHET_LOGO_YELLOW,
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('newLevelButton')
        }));
        const keepGoingButton = new RectangularPushButton(combineOptions({}, buttonOptions, {
            content: new Text(VegasStrings.keepGoingStringProperty, textOptions),
            listener: options.keepGoingButtonListener,
            baseColor: 'white',
            tandem: (_options_tandem1 = options.tandem) == null ? void 0 : _options_tandem1.createTandem('keepGoingButton')
        }));
        const buttons = new VBox({
            children: [
                newLevelButton,
                keepGoingButton
            ],
            spacing: options.buttonsYSpacing
        });
        // half the remaining height, so that scoreDisplay will be centered in the negative space above the buttons.
        const scoreSpacing = (phetGirlNode.height - scoreDisplay.height - buttons.height) / 2;
        assert && assert(scoreSpacing > 0, 'phetGirlNode is scaled down too much');
        const rightSideNode = new VBox({
            children: [
                scoreDisplay,
                buttons
            ],
            align: 'center',
            spacing: scoreSpacing
        });
        const content = new HBox({
            align: 'bottom',
            children: [
                phetGirlNode,
                rightSideNode
            ],
            spacing: 52
        });
        options.focusOnShowNode = newLevelButton;
        super(content, options);
    }
};
export { RewardDialog as default };
vegas.register('RewardDialog', RewardDialog);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Jld2FyZERpYWxvZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIGRpYWxvZyB0aGF0IHRoZSBjbGllbnQgZGlzcGxheXMgd2hlbiB0aGUgdXNlciBnZXRzIGEgc3BlY2lmaWMgbnVtYmVyIG9mIHN0YXJzLlxuICogU2VlIHNwZWNpZmljYXRpb24gaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlZ2FzL2lzc3Vlcy81OS5cbiAqXG4gKiBAYXV0aG9yIEFuZHJlYSBMaW5cbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IFBoZXRDb2xvclNjaGVtZSBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldENvbG9yU2NoZW1lLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgRm9udCwgSEJveCwgSW1hZ2UsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHsgUHVzaEJ1dHRvbkxpc3RlbmVyIH0gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvUHVzaEJ1dHRvbk1vZGVsLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24sIHsgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgRGlhbG9nLCB7IERpYWxvZ09wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcbmltcG9ydCBwaGV0R2lybEp1Z2dsaW5nU3RhcnNfcG5nIGZyb20gJy4uL2ltYWdlcy9waGV0R2lybEp1Z2dsaW5nU3RhcnNfcG5nLmpzJztcbmltcG9ydCBTY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyLCB7IFNjb3JlRGlzcGxheU51bWJlckFuZFN0YXJPcHRpb25zIH0gZnJvbSAnLi9TY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyLmpzJztcbmltcG9ydCB2ZWdhcyBmcm9tICcuL3ZlZ2FzLmpzJztcbmltcG9ydCBWZWdhc1N0cmluZ3MgZnJvbSAnLi9WZWdhc1N0cmluZ3MuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IERFRkFVTFRfQlVUVE9OU19GT05UID0gbmV3IFBoZXRGb250KCAyMCApO1xuY29uc3QgREVGQVVMVF9TQ09SRV9ESVNQTEFZX0ZPTlQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMzgsIHdlaWdodDogJ2JvbGQnIH0gKTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgcGhldEdpcmxTY2FsZT86IG51bWJlcjtcbiAgYnV0dG9uc0ZvbnQ/OiBGb250O1xuICBidXR0b25zV2lkdGg/OiBudW1iZXI7IC8vIGZpeGVkIHdpZHRoIGZvciBib3RoIGJ1dHRvbnNcbiAgYnV0dG9uc1lTcGFjaW5nPzogbnVtYmVyO1xuICBrZWVwR29pbmdCdXR0b25MaXN0ZW5lcj86IFB1c2hCdXR0b25MaXN0ZW5lcjsgLy8gY2FsbGVkIHdoZW4gJ0tlZXAgR29pbmcnIGJ1dHRvbiBpcyBwcmVzc2VkXG4gIG5ld0xldmVsQnV0dG9uTGlzdGVuZXI/OiBQdXNoQnV0dG9uTGlzdGVuZXI7IC8vIGNhbGxlZCB3aGVuICdOZXcgTGV2ZWwnIGJ1dHRvbiBpcyBwcmVzc2VkXG4gIHNjb3JlRGlzcGxheU9wdGlvbnM/OiBTY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyT3B0aW9ucztcbn07XG5cbmV4cG9ydCB0eXBlIFJld2FyZERpYWxvZ09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8RGlhbG9nT3B0aW9ucywgJ2ZvY3VzT25TaG93Tm9kZSc+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXdhcmREaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NvcmU6IG51bWJlciB8IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sIHByb3ZpZGVkT3B0aW9ucz86IFJld2FyZERpYWxvZ09wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJld2FyZERpYWxvZ09wdGlvbnMsIFNlbGZPcHRpb25zLCBEaWFsb2dPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFJld2FyZERpYWxvZ09wdGlvbnNcbiAgICAgIHBoZXRHaXJsU2NhbGU6IDAuNixcbiAgICAgIGJ1dHRvbnNGb250OiBERUZBVUxUX0JVVFRPTlNfRk9OVCxcbiAgICAgIGJ1dHRvbnNXaWR0aDogMTQ1LFxuICAgICAgYnV0dG9uc1lTcGFjaW5nOiAyMCxcbiAgICAgIGtlZXBHb2luZ0J1dHRvbkxpc3RlbmVyOiBfLm5vb3AsXG4gICAgICBuZXdMZXZlbEJ1dHRvbkxpc3RlbmVyOiBfLm5vb3AsXG4gICAgICBzY29yZURpc3BsYXlPcHRpb25zOiB7XG4gICAgICAgIGZvbnQ6IERFRkFVTFRfU0NPUkVfRElTUExBWV9GT05ULFxuICAgICAgICBzcGFjaW5nOiA4LFxuICAgICAgICBzdGFyTm9kZU9wdGlvbnM6IHtcbiAgICAgICAgICBzdGFyU2hhcGVPcHRpb25zOiB7XG4gICAgICAgICAgICBvdXRlclJhZGl1czogMjAsXG4gICAgICAgICAgICBpbm5lclJhZGl1czogMTBcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZpbGxlZExpbmVXaWR0aDogMlxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBEaWFsb2dPcHRpb25zXG4gICAgICAvLyBwZG9tIC0gU2luY2Ugd2UgYXJlIHNldHRpbmcgdGhlIGZvY3VzT25TaG93Tm9kZSB0byBiZSB0aGUgZmlyc3QgZWxlbWVudCBpbiBjb250ZW50LCBwdXQgdGhlIGNsb3NlQnV0dG9uIGxhc3RcbiAgICAgIGNsb3NlQnV0dG9uTGFzdEluUERPTTogdHJ1ZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3QgcGhldEdpcmxOb2RlID0gbmV3IEltYWdlKCBwaGV0R2lybEp1Z2dsaW5nU3RhcnNfcG5nLCB7XG4gICAgICBzY2FsZTogb3B0aW9ucy5waGV0R2lybFNjYWxlXG4gICAgfSApO1xuXG4gICAgY29uc3Qgc2NvcmVQcm9wZXJ0eSA9ICggdHlwZW9mIHNjb3JlID09PSAnbnVtYmVyJyApID8gbmV3IE51bWJlclByb3BlcnR5KCBzY29yZSApIDogc2NvcmU7XG4gICAgY29uc3Qgc2NvcmVEaXNwbGF5ID0gbmV3IFNjb3JlRGlzcGxheU51bWJlckFuZFN0YXIoIHNjb3JlUHJvcGVydHksIG9wdGlvbnMuc2NvcmVEaXNwbGF5T3B0aW9ucyApO1xuXG4gICAgY29uc3QgYnV0dG9uT3B0aW9ucyA9IHtcbiAgICAgIGZvbnQ6IG9wdGlvbnMuYnV0dG9uc0ZvbnQsXG4gICAgICBtaW5XaWR0aDogb3B0aW9ucy5idXR0b25zV2lkdGgsXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy5idXR0b25zV2lkdGhcbiAgICB9O1xuXG4gICAgY29uc3QgdGV4dE9wdGlvbnMgPSB7IGZvbnQ6IERFRkFVTFRfQlVUVE9OU19GT05ULCBtYXhXaWR0aDogb3B0aW9ucy5idXR0b25zV2lkdGggKiAwLjkgfTtcblxuICAgIGNvbnN0IG5ld0xldmVsQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbihcbiAgICAgIGNvbWJpbmVPcHRpb25zPFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnM+KCB7fSwgYnV0dG9uT3B0aW9ucywge1xuICAgICAgICBjb250ZW50OiBuZXcgVGV4dCggVmVnYXNTdHJpbmdzLm5ld0xldmVsU3RyaW5nUHJvcGVydHksIHRleHRPcHRpb25zICksXG4gICAgICAgIGxpc3RlbmVyOiBvcHRpb25zLm5ld0xldmVsQnV0dG9uTGlzdGVuZXIsXG4gICAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLlBIRVRfTE9HT19ZRUxMT1csXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ25ld0xldmVsQnV0dG9uJyApXG4gICAgICB9ICkgKTtcblxuICAgIGNvbnN0IGtlZXBHb2luZ0J1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oXG4gICAgICBjb21iaW5lT3B0aW9uczxSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zPigge30sIGJ1dHRvbk9wdGlvbnMsIHtcbiAgICAgICAgY29udGVudDogbmV3IFRleHQoIFZlZ2FzU3RyaW5ncy5rZWVwR29pbmdTdHJpbmdQcm9wZXJ0eSwgdGV4dE9wdGlvbnMgKSxcbiAgICAgICAgbGlzdGVuZXI6IG9wdGlvbnMua2VlcEdvaW5nQnV0dG9uTGlzdGVuZXIsXG4gICAgICAgIGJhc2VDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAna2VlcEdvaW5nQnV0dG9uJyApXG4gICAgICB9ICkgKTtcblxuICAgIGNvbnN0IGJ1dHRvbnMgPSBuZXcgVkJveCgge1xuICAgICAgY2hpbGRyZW46IFsgbmV3TGV2ZWxCdXR0b24sIGtlZXBHb2luZ0J1dHRvbiBdLFxuICAgICAgc3BhY2luZzogb3B0aW9ucy5idXR0b25zWVNwYWNpbmdcbiAgICB9ICk7XG5cbiAgICAvLyBoYWxmIHRoZSByZW1haW5pbmcgaGVpZ2h0LCBzbyB0aGF0IHNjb3JlRGlzcGxheSB3aWxsIGJlIGNlbnRlcmVkIGluIHRoZSBuZWdhdGl2ZSBzcGFjZSBhYm92ZSB0aGUgYnV0dG9ucy5cbiAgICBjb25zdCBzY29yZVNwYWNpbmcgPSAoIHBoZXRHaXJsTm9kZS5oZWlnaHQgLSBzY29yZURpc3BsYXkuaGVpZ2h0IC0gYnV0dG9ucy5oZWlnaHQgKSAvIDI7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2NvcmVTcGFjaW5nID4gMCwgJ3BoZXRHaXJsTm9kZSBpcyBzY2FsZWQgZG93biB0b28gbXVjaCcgKTtcblxuICAgIGNvbnN0IHJpZ2h0U2lkZU5vZGUgPSBuZXcgVkJveCgge1xuICAgICAgY2hpbGRyZW46IFsgc2NvcmVEaXNwbGF5LCBidXR0b25zIF0sXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICBzcGFjaW5nOiBzY29yZVNwYWNpbmdcbiAgICB9ICk7XG5cbiAgICBjb25zdCBjb250ZW50ID0gbmV3IEhCb3goIHtcbiAgICAgIGFsaWduOiAnYm90dG9tJyxcbiAgICAgIGNoaWxkcmVuOiBbIHBoZXRHaXJsTm9kZSwgcmlnaHRTaWRlTm9kZSBdLFxuICAgICAgc3BhY2luZzogNTJcbiAgICB9ICk7XG5cbiAgICBvcHRpb25zLmZvY3VzT25TaG93Tm9kZSA9IG5ld0xldmVsQnV0dG9uO1xuXG4gICAgc3VwZXIoIGNvbnRlbnQsIG9wdGlvbnMgKTtcbiAgfVxufVxuXG52ZWdhcy5yZWdpc3RlciggJ1Jld2FyZERpYWxvZycsIFJld2FyZERpYWxvZyApOyJdLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiUGhldENvbG9yU2NoZW1lIiwiUGhldEZvbnQiLCJIQm94IiwiSW1hZ2UiLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkRpYWxvZyIsInBoZXRHaXJsSnVnZ2xpbmdTdGFyc19wbmciLCJTY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyIiwidmVnYXMiLCJWZWdhc1N0cmluZ3MiLCJERUZBVUxUX0JVVFRPTlNfRk9OVCIsIkRFRkFVTFRfU0NPUkVfRElTUExBWV9GT05UIiwic2l6ZSIsIndlaWdodCIsIlJld2FyZERpYWxvZyIsInNjb3JlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBoZXRHaXJsU2NhbGUiLCJidXR0b25zRm9udCIsImJ1dHRvbnNXaWR0aCIsImJ1dHRvbnNZU3BhY2luZyIsImtlZXBHb2luZ0J1dHRvbkxpc3RlbmVyIiwiXyIsIm5vb3AiLCJuZXdMZXZlbEJ1dHRvbkxpc3RlbmVyIiwic2NvcmVEaXNwbGF5T3B0aW9ucyIsImZvbnQiLCJzcGFjaW5nIiwic3Rhck5vZGVPcHRpb25zIiwic3RhclNoYXBlT3B0aW9ucyIsIm91dGVyUmFkaXVzIiwiaW5uZXJSYWRpdXMiLCJmaWxsZWRMaW5lV2lkdGgiLCJjbG9zZUJ1dHRvbkxhc3RJblBET00iLCJwaGV0R2lybE5vZGUiLCJzY2FsZSIsInNjb3JlUHJvcGVydHkiLCJzY29yZURpc3BsYXkiLCJidXR0b25PcHRpb25zIiwibWluV2lkdGgiLCJtYXhXaWR0aCIsInRleHRPcHRpb25zIiwibmV3TGV2ZWxCdXR0b24iLCJjb250ZW50IiwibmV3TGV2ZWxTdHJpbmdQcm9wZXJ0eSIsImxpc3RlbmVyIiwiYmFzZUNvbG9yIiwiUEhFVF9MT0dPX1lFTExPVyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImtlZXBHb2luZ0J1dHRvbiIsImtlZXBHb2luZ1N0cmluZ1Byb3BlcnR5IiwiYnV0dG9ucyIsImNoaWxkcmVuIiwic2NvcmVTcGFjaW5nIiwiaGVpZ2h0IiwiYXNzZXJ0IiwicmlnaHRTaWRlTm9kZSIsImFsaWduIiwiZm9jdXNPblNob3dOb2RlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxvQkFBb0Isa0NBQWtDO0FBRTdELE9BQU9DLGFBQWFDLGNBQWMs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